---
layout: page
title: "基于条件高斯潜变量模型的量化系统信道估计｜中文全文译文"
permalink: /papers/translations/2026-10-05-2309-04014-channel-estimation-for-quantized-systems-based-on-conditionally-gaussi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/333a12fc9310706e/) · [原文 arXiv](https://arxiv.org/abs/2309.04014) · [全部目录](/papers/catalog/)

# 基于条件高斯潜变量模型的量化系统信道估计

**原题：** Channel Estimation for Quantized Systems based on Conditionally Gaussian Latent Models  
**作者：** Benedikt Fesl、Nurettin Turan、Benedikt Böck、Wolfgang Utschick（慕尼黑工业大学信号处理方法教研室，德国慕尼黑）  
**版本：** arXiv:2309.04014v2（eess.SP），v2 于 2023 年 12 月 18 日发布，原文 15 页；工作部分由华为瑞典技术有限公司（Huawei Sweden Technologies AB，Lund）资助。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、致谢、附录、图注表注与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

本文针对粗量化系统提出一类新的信道估计器。所提估计器建立在**条件高斯潜变量生成模型**之上，具体包括高斯混合模型（GMM）、因子分析器混合模型（MFA）与变分自编码器（VAE）。这些模型能够有效学习无线传播场景中未知的信道分布，从而提供有价值的先验信息。以这些生成模型的潜变量为条件，可得到局部高斯的信道分布，因而能够应用著名的 Bussgang 分解。利用由此得到的**条件 Bussgang 分解**，本文针对上述生成式潜变量模型推导了参数化线性最小均方误差（MMSE）估计器。在此框架下，本文探索利用模型的结构化特征来降低所提估计器的内存与复杂度开销。此外，本文设计了必要的训练适配，使得可以直接从量化导频观测中学习生成模型，而**训练阶段无需真实信道样本**。大量仿真表明，对于粗量化系统，本文估计器相对现有先进方法具有明显优势：均方误差（MSE）与可达速率指标均有显著改进。

**关键词：** 信道估计；生成式潜变量模型；粗量化；Bussgang 定理；协方差恢复。

## I. 引言

大规模多输入多输出（MIMO）与毫米波系统不断满足无线通信中带宽与吞吐量日益增长的需求。然而，为每根天线射频（RF）链路配置大量高精度模数转换器（ADC）且带宽足以支撑毫米波系统，在成本与功耗上是难以承受的 [1]、[2]。在功耗瓶颈下实现高能效的最直接且最有前景的途径之一，是在基站（BS）侧使用低分辨率 ADC。近年来，大量研究致力于分析低分辨率量化系统的性能 [3]—[6]。值得注意的是，尽管低分辨率量化会在接收端引入非线性失真，系统容量并不会严重下降，尤其在低信噪比（SNR）区间 [7]。

为在下一代蜂窝系统（6G）的实际低分辨率系统中实现上述有利特性，准确的信道估计是一项关键任务。然而，ADC 的强非线性会显著降低传统信道估计算法的性能 [1]、[2]。因此，需要设计新的信道估计器，使其在量化系统中同时具备良好性能、合理复杂度与稳健性。

近年来针对粗量化系统已提出多种信道估计方法。文献 [8] 考虑最小二乘（LS）估计，其计算简单但估计质量较差。文献 [9] 提出基于期望最大化（EM）算法的迭代信道估计方法，但受限于高复杂度与收敛到局部最优。文献 [10]、[11] 研究了迭代最大似然（ML）方法，但它们通常需要大量导频信号，造成难以承受的信令开销 [2]。文献 [12]—[14] 研究了联合信道估计与解码，用载荷数据辅助信道估计；由于方法具有迭代特性，这类方法被认为对商用大规模 MIMO 系统而言复杂度过高 [2]。文献 [15]—[17] 考虑无线信道的稀疏性，采用压缩感知（CS）方法，例如迭代硬阈值与广义近似消息传递（GAMP）；其主要缺点是对（估计出的）稀疏度水平敏感，以及迭代过程复杂度高。

文献 [18]、[19] 研究了高斯信道且协方差矩阵为对角阵时的最小均方误差（MMSE）信道估计；然而，一般情形下 MMSE 估计器没有闭式解，计算上不可行 [20]。事实上，即便是线性 MMSE 估计器，一般也没有闭式解。只有在量化器输入服从联合高斯分布的特殊情形下，线性 MMSE 信道估计器才可以基于 Bussgang 定理 [21] 或加性量化噪声模型（AQNM）[22] 高效计算；后者是 Bussgang 分解针对量化问题的一个特例（脚注：本文沿用更一般的 Bussgang 分解术语，但相同结果对 AQNM 同样成立）。文献 [24]、[25] 分别针对 1 比特与多比特量化推导了 Bussgang 估计器。其优点是仅需少量导频观测即可获得较好的信道估计质量；但其适用性受到一个前提的严重限制：信道服从高斯分布且二阶统计量已知。

另一条较新的量化系统信道估计分支基于深度学习，见 [26]—[29]。这类方法在导频数较少时性能良好，但通常**缺乏对不同量化比特数、导频、天线数与 SNR 的泛化能力**。此外，还必须积累包含完美信道状态信息（CSI）样本的大规模代表性训练集，而这在实际系统中获取代价高昂，粗量化情形下尤为如此。本文通过为模型推导适配的训练流程来解决这一主要问题，使训练可以**完全不需要真实 CSI**、直接从量化训练数据中学习。

在近期工作中，条件高斯潜变量生成模型被用于学习无线传播环境中未知的信道分布，并利用该先验信息设计无线通信功能 [30]，尤其是高分辨率系统的信道估计器 [31]—[36]。如前述，低分辨率 ADC 的强非线性失真使得这些信道估计技术难以直接用于粗量化系统。本文扩展这一类基于条件高斯潜变量生成模型的信道估计器：利用这些模型与"基于新提出的条件 Bussgang 分解的线性 MMSE 估计器"之间的新联系。

本文贡献简述如下。

1) 本文通过引入使信道成为条件高斯的条件事件，为把传统 Bussgang 估计器推广到任意信道概率密度函数（PDF）建立了理论基础。据此，通过作为线性 MMSE 估计器的**条件 Bussgang 估计器**，得到均方误差（MSE）最优的条件均值估计器（CME）的近似。为找到感兴趣的条件事件，本文建立了与变分推断（VI）——即条件高斯潜变量模型——之间的新联系。
2) 本文引入三种条件高斯潜变量模型，即高斯混合模型（GMM）、因子分析器混合模型（MFA）与变分自编码器（VAE），它们为所提出的参数化条件 Bussgang 信道估计器（在量化系统中即为线性 MMSE 估计器）给出可处理的表述。本文展示了这些模型在估计性能、计算复杂度与内存开销方面的不同优势。值得注意的是，三种模型都具有同一优点：无需重新训练即可适配不同的 SNR、导频序列与量化比特数。
3) 为便于实际部署，本文提出训练适配，使相应模型可以仅以量化导频观测作为训练数据来学习，从而消除训练阶段对完美 CSI 的需求。这一特性使我们能够利用基站常规运行期间采集的量化导频观测进行训练。对 GMM，本文提出一种新的**协方差恢复方法**，它仅使用量化样本，即可作为未量化输入协方差矩阵的无偏且一致估计器。此外，对 VAE，本文依据模型洞察（并显式考虑非线性量化过程）适配了证据下界（ELBO）损失函数。
4) 基于真实信道模型的大量仿真表明，所提估计框架性能强劲，尤其在导频观测数较少的设置中超过现有先进方法。

**符号说明：** 标准高斯累积分布函数（CDF）记为 $\Phi(x)=\int_{-\infty}^{x}\frac{1}{\sqrt{2\pi}}\exp(-x^{2}/2)\,dx$，误差函数为 $\operatorname{erf}(x)=\frac{2}{\sqrt{\pi}}\int_{0}^{x}\exp(-t^{2})\,dt$。指示函数记为 $\chi(x\in\mathcal A)$，当 $x\in\mathcal A$ 时取 1，否则取 0。向量的第 $n$ 个元素记为 $[\mathbf x]_n$。条件互协方差矩阵记为 $\mathbf C_{xy|c}=\mathbb E[(\mathbf x-\mathbb E[\mathbf x|c])(\mathbf y-\mathbb E[\mathbf y|c])^{H}|c]$，无条件情形记为 $\mathbf C_{xy}$；自协方差矩阵简记为 $\mathbf C_{x|c}=\mathbf C_{xx|c}$。矩阵的对角与非对角部分分别记为 $\operatorname{diag}(\mathbf A)$ 与 $\operatorname{nondiag}(\mathbf A)=\mathbf A-\operatorname{diag}(\mathbf A)$。矩阵 $\mathbf A$ 的 Moore–Penrose 逆记为 $\mathbf A^{\dagger}$。

## II. 预备知识

**1）系统模型。** 考虑单天线移动终端（MT）向配备 $N$ 根天线、使用 $B$ 比特量化 ADC 的 BS 发送 $P$ 个导频信号的上行传输。量化接收信号因此可写为 $\mathbf R=Q_{B}(\mathbf Y)=Q_{B}(\mathbf h\mathbf a^{T}+\mathbf N)$，其中 $\mathbf R=[\mathbf r_{1},\ldots,\mathbf r_{P}]\in\mathbb C^{N\times P}$ 以列的形式包含 $P$ 个量化接收信号，$\mathbf Y\in\mathbb C^{N\times P}$ 描述未量化接收信号，$\mathbf h\in\mathbb C^{N}$ 为无线信道，$\mathbf a\in\mathbb C^{P}$ 为满足功率约束 $\lVert\mathbf a\rVert_{2}^{2}=P$ 的导频向量，$\mathbf N=[\mathbf n_{1},\ldots,\mathbf n_{P}]\in\mathbb C^{N\times P}$ 为加性白高斯噪声（AWGN），$\mathbf n_{i}\sim\mathcal N_{\mathbb C}(\mathbf 0,\sigma^{2}\mathbf I)$，$Q_{B}$ 为下文讨论的 $B$ 比特量化函数。按列向量化后，系统模型可写为

$$
\mathbf r=Q_{B}(\mathbf y)=Q_{B}(\mathbf A\mathbf h+\mathbf n)\in\mathbb C^{NP}\tag{1}
$$

其中 $\mathbf r=\operatorname{vec}(\mathbf R)$、$\mathbf y=\operatorname{vec}(\mathbf Y)$、$\mathbf n=\operatorname{vec}(\mathbf N)$、$\mathbf A=\mathbf a\otimes\mathbf I$。注意：原则上通过堆叠所有用户的信道即可直接扩展到多用户设置（参见 [24]），但多用户系统分析超出本文范围。把信道归一化为 $\mathbb E[\lVert\mathbf h\rVert_{2}^{2}]=N$ 后，量化器输入的信噪比定义为 $\mathrm{SNR}=1/\sigma^{2}$。

在粗量化系统中，通常需要若干导频观测才能取得合理的信道估计性能。就 1 比特量化而言，文献 [20] 证明：在渐近高 SNR 区间、对联合高斯输入，具有 $[0,\pi/2)$ 范围内等间隔相移的导频序列关于 CME 是 MSE 最优的。一般情形下，最优导频序列依赖众多系统参数，难以推导。因此本文考虑在幅度与角度上均等间隔的导频，即

$$
[\tilde{\mathbf a}]_{i}=\beta_{i}\exp\!\left(j\frac{\pi}{2P}(i-1)\right),\qquad i\in\{1,\ldots,P\},\tag{2}
$$

其中 $\beta_{i}=\frac{1}{2}+\frac{i-1}{2(P-1)}$ 为幅度间距。为满足功率约束 $\lVert\mathbf a\rVert_{2}^{2}=P$，导频向量归一化为 $\mathbf a=\frac{\sqrt{P}}{\lVert\tilde{\mathbf a}\rVert_{2}}\tilde{\mathbf a}$。仿真表明，式 (2) 的选择在所考虑的全部场景中都是稳健的。不过，本文提出的估计器类别与具体导频序列无关，可配用任意其他所需导频序列。

**2）量化器设计。** 本文考虑标量量化器，即量化逐元素作用于输入，且实部与虚部分别独立量化。量化器可由 $2^{B}$ 个量化标签 $\ell_{i}$（$i\in\{1,\ldots,2^{B}\}$）与量化阈值 $\tau_{i}$（$i\in\{0,\ldots,2^{B}\}$）描述，按定义 $\tau_{0}=-\infty$、$\tau_{2^{B}}=\infty$。信号实部／虚部的量化函数可写为

$$
Q_{B}(x)=\sum_{i=1}^{2^{B}}\ell_{i}\,\chi(\tau_{i-1}\le x<\tau_{i}).\tag{3}
$$

对 1 比特量化 $B=1$，复值信号 $\mathbf y$ 的量化函数可表示为

$$
Q_{1}(\mathbf y)=\frac{1}{\sqrt{2}}\left(\operatorname{sign}(\Re(\mathbf y))+j\operatorname{sign}(\Im(\mathbf y))\right).\tag{4}
$$

实用 ADC 通常具有均匀间隔的量化阈值（步长 $\Delta$ 为常数，取决于输入分布），且量化标签置于两阈值中点。对零均值、单位方差的高斯输入，最优 $\Delta$ 取值由文献 [37] 数值计算给出。

在假定逐元素量化器输入为零均值高斯、方差为 $1+\sigma^{2}$（与前述 SNR 定义一致）的前提下，本文按文献 [38] 的建议选取信噪比相关步长

$$
\Delta=\sqrt{\tfrac{1}{2}(1+\sigma^{2})}\,\Delta^{*},\tag{5}
$$

其中 $\Delta^{*}$ 为标准高斯输入下的步长 [37]。尽管量化器输入一般并非高斯，这一选择在实际可行性方面仍具有合理性能；式 (5) 所需的缩放可由实际系统中的自动增益控制完成。作者指出，存在更精细的量化器设计，例如非均匀标量量化 [37]、[39]；但均匀量化器被认为是无线通信中最实用的选择 [5]。此外，本文提出的信道估计技术可以直接推广到非均匀量化。

**3）信道模型。** 本文采用第三代合作伙伴计划（3GPP）空间信道模型 [40]、[41]，其中信道被建模为条件高斯：$\mathbf h|\boldsymbol\delta\sim\mathcal N_{\mathbb C}(\mathbf 0,\mathbf C_{\boldsymbol\delta})$。随机向量 $\boldsymbol\delta$ 汇集 MT 与 BS 之间主要传播簇的到达／离开角与路径增益。主角度独立地从区间 $[0,2\pi]$ 均匀抽取；路径增益同样均匀抽取，随后归一化使其总和为 1。BS 采用均匀线阵（ULA），空间信道协方差矩阵为

$$
\mathbf C_{h|\boldsymbol\delta}=\int_{-\pi}^{\pi}\omega(\gamma;\boldsymbol\delta)\,\mathbf t(\gamma)\mathbf t(\gamma)^{H}\,d\gamma,\tag{6}
$$

其中 $\mathbf t(\gamma)=[1,e^{j\pi\sin(\gamma)},\ldots,e^{j\pi(N-1)\sin(\gamma)}]^{T}$ 为到达角 $\gamma$ 对应的阵列导向矢量，$\omega$ 是由若干加权 Laplace 密度之和组成的功率密度，其标准差描述传播簇的角度扩展 [40]。对每个信道样本，先生成随机角度与路径增益（合并为 $\boldsymbol\delta$），再抽取 $\mathbf h\sim\mathcal N_{\mathbb C}(\mathbf 0,\mathbf C_{h|\boldsymbol\delta})$，由此得到整体非高斯的信道分布 [31]。注意信道模型的条件高斯性**与**所提潜变量模型的**条件高斯性并不等价**：从单个快照推断式 (6) 是不可行的。

为更广泛地评估不同信道模型，作者使用 QuaDRiGa 信道仿真器 2.4 版 [42]、[43] 生成信道样本：仿真 6 GHz 中心频率的城市宏蜂窝场景，BS 高度 25 m、覆盖 $120^{\circ}$ 扇区，MT 与 BS 距离在 35–500 m 范围。本文或考虑纯视距（LOS）场景，或考虑混合 LOS/非视距（NLOS）场景；后者中 80% 的 MT 位于不同楼层的室内，室外情形下 MT 高度为 1.5 m。BS 配备 $N$ 个"3GPP-3D"天线的 ULA，MT 使用全向天线。生成的信道经后处理去除有效路径增益 [43, 第 2.7 节]。

**4）训练数据集。** 本文假设信道分布未知且因上述复杂信道模型而任意复杂（见第 II-3 节），但假设可获得由相应信道模型样本构成的代表性数据集；实际含义是：可以得到相应 BS 小区的数据样本。本文讨论两种设置。第一，假设可获得由 $T$ 个真实信道样本构成的训练数据集 $\mathcal H=\{\mathbf h_{t}\}_{t=1}^{T}$，实践中可通过测量活动或数字孪生（例如射线追踪）实现。第二，考虑仅由含噪、量化导频观测构成的训练数据集 $\mathcal R=\{\mathbf r_{t}\}_{t=1}^{T}$；此时可利用 BS 常规运行中的导频观测，而不需要真实信道样本。

## III. Bussgang 估计器

本节简要回顾基于 Bussgang 分解的线性 MMSE 估计器，它是 Bussgang 定理 [21] 的直接推论。如前所述，通过 AQNM 也可以得到等价推导（参见 [23]）。尽管 Bussgang 分解一般存在，Bussgang 线性 MMSE 估计器只有在信道与噪声服从零均值高斯分布时才具有解析可处理性 [24]。然而，即便该条件一般不成立，在假定信道为零均值高斯的情形下对线性 MMSE 估计器作近似，仍是量化系统信道估计的合理基线。

具体而言，在联合零均值高斯的量化器输入假设下，Bussgang 分解意味着式 (1) 的系统可写成有用信号部分与一个不相关失真 $\mathbf q$ 的线性组合：

$$
\mathbf r=Q_{B}(\mathbf y)=\mathbf B\mathbf y+\boldsymbol\eta=\mathbf B\mathbf A\mathbf h+\mathbf q,\tag{7}
$$

其中 $\mathbf B$ 为 Bussgang 增益，可由 $\mathbf r$ 对 $\mathbf y$ 的线性 MMSE 估计得到，即 $\mathbf B=\mathbf C_{ry}\mathbf C_{y}^{-1}$（参见 [44, 第 9.2 节]）；失真项 $\mathbf q=\mathbf B\mathbf n+\boldsymbol\eta$ 同时包含 AWGN $\mathbf n$ 与量化噪声 $\boldsymbol\eta$。对联合高斯输入的均匀量化器，Bussgang 增益矩阵在 [45] 中推导，计算为

$$
\mathbf B=\frac{\Delta}{\sqrt{\pi}}\mathbf D_{y}^{-\frac{1}{2}}\sum_{i=1}^{2^{B}-1}\exp\!\left(-\Delta^{2}\left(i-2^{B-1}\right)^{2}\mathbf D_{y}^{-1}\right)\tag{8}
$$

其中 $\mathbf D_{y}=\operatorname{diag}(\mathbf C_{y})$。在 1 比特量化 $B=1$ 情形下，取 $\Delta=\sqrt{2}$，即得众所周知的解

$$
\mathbf B=\sqrt{\frac{2}{\pi}}\operatorname{diag}(\mathbf C_{y})^{-\frac{1}{2}}.\tag{9}
$$

由于统计等价模型 (7) 是线性的，可以构造线性 MMSE 估计器

$$
\widehat{\mathbf h}_{\mathrm{Buss}}=\mathbf C_{hr}\mathbf C_{r}^{-1}\mathbf r.\tag{10}
$$

信道与接收信号的互相关矩阵计算为 $\mathbf C_{hr}=\mathbb E[\mathbf h(\mathbf B\mathbf A\mathbf h+\mathbf q)^{H}]=\mathbf C_{h}\mathbf A^{H}\mathbf B^{H}$，这由噪声项 $\mathbf q$ 与信道 $\mathbf h$ 不相关这一事实推出（参见 [24, 附录 A]）。注意该性质只在量化器输入联合高斯时成立。对 1 比特量化，由于幅度信息被消除，自相关矩阵等于协方差矩阵 $\mathbf C_{r}$，并可通过所谓反正弦定律（arcsine law）[46] 闭式计算：

$$
\mathbf C_{r}=\frac{2}{\pi}\left(\arcsin\!\left(\mathbf D_{y}^{-\frac{1}{2}}\Re(\mathbf C_{y})\mathbf D_{y}^{-\frac{1}{2}}\right)+j\arcsin\!\left(\mathbf D_{y}^{-\frac{1}{2}}\Im(\mathbf C_{y})\mathbf D_{y}^{-\frac{1}{2}}\right)\right).\tag{11}
$$

遗憾的是，对多比特量化，$\mathbf C_{r}$ 不存在闭式表达；此外，量化后方差的计算也不再平凡。如 [5, 式 (2.14)] 所示（已适配复值情形），对高斯输入与均匀量化器，方差计算为

$$
[\mathbf C_{r}]_{i,i}=\sum_{i=1}^{2^{B}}2\ell_{i}^{2}\left(\Phi\!\left(\sqrt{2}\tau_{i}c_{i}\right)-\Phi\!\left(\sqrt{2}\tau_{i-1}c_{i}\right)\right),\tag{12}
$$

其中 $c_{i}=[\mathbf C_{y}]_{i,i}^{-\frac{1}{2}}$。尽管存在多种实际可行的涉及高斯 CDF 的近似计算 [47]、[48]，式 (12) 的求值在时间关键系统中仍可能成为问题；因此本文采用一个合理近似。假设不同天线上的信号方差不变，则 Bussgang 增益成为 $B=\rho\mathbf I$ 形式的缩放单位阵（参见式 (8)）。进一步忽略量化失真的互相关后，量化协方差矩阵 $\mathbf C_{r}$ 可由下式很好近似（尤其在低 SNR 区间，参见 [3]）：

$$
\mathbf C_{r}\approx\rho^{2}\mathbf C_{y}+(1-\rho^{2})\operatorname{diag}(\mathbf C_{y}).\tag{13}
$$

重要的是，当 $0\le\rho^{2}\le1$ 时，所得协方差矩阵 $\mathbf C_{r}$ 保持半正定（PSD）。作者指出：$\mathbf C_{r}$ 关于 $\mathbf C_{y}$ 的表达式一般取决于量化器选择与输入分布，可以另行找到有用的近似（参见 [4]）；不过本文信道估计算法的设计并不以式 (13) 为基础，也可采用其他近似。

## IV. 参数化 Bussgang 信道估计器

第 III 节中 Bussgang 估计器的前提是量化器输入联合高斯，这一限制相当苛刻。在考虑整个 BS 小区的信道分布时尤为明显：该分布受传播环境强烈塑造，一般难以由简单高斯分布充分刻画。尽管 Bussgang 分解在非高斯情形下原则上也存在，但相应的 Bussgang 增益矩阵非对角且难以解析处理，从而无法给出线性 MMSE 估计器的解析解 [23]。这促使本文利用**条件高斯性**这一有力概念（它已用于高分辨率系统的信道估计 [31]—[36]）。在下述引理 1 中，本文通过条件 Bussgang 分解为量化系统中的估计框架建立理论基础。

**引理 1。** 考虑采用均匀量化器 $Q_{B}(\cdot)$ 的系统模型 (1)，设 $\mathbf h\sim p(\mathbf h)$，其 PDF $p(\mathbf h)$ 任意。设 $c$ 为独立于 $\mathbf n$ 的条件事件，使得

$$
\mathbf h|c\sim\mathcal N_{\mathbb C}(\mathbf h;\mathbf 0,\mathbf C_{h|c})\tag{14}
$$

且 $\mathbf C_{y|c}=\mathbf A\mathbf C_{h|c}\mathbf A^{H}+\sigma^{2}\mathbf I$。则存在唯一条件 Bussgang 增益 $\mathbf B_{c}$，使式 (1) 可分解为统计等价模型

$$
\mathbf r=\mathbf B_{c}\mathbf y+\boldsymbol\eta=\mathbf B_{c}\mathbf A\mathbf h+\mathbf B_{c}\mathbf n+\boldsymbol\eta\tag{15}
$$

其中在给定 $c$ 时 $\boldsymbol\eta$ 与 $\mathbf h$ 条件不相关，并具有如下性质：

a) $\mathbf B_{c}$ 由式 (8)（$B=1$ 时为式 (9)）闭式计算；
b) $B=1$ 时 $\mathbf C_{r|c}$ 由式 (11) 闭式计算；
c) $B>1$ 时 $\mathbf C_{r|c}$ 的对角元由式 (12) 计算，且 $\mathbf C_{r|c}$ 可由式 (13) 很好近似；

其中在式 (8)、(9) 与 (11)—(13) 中把 $\mathbf C_{y}$ 替换为 $\mathbf C_{y|c}$。进一步地，给定 $\mathbf r$ 与 $c$ 时 $\mathbf h$ 的条件线性 MMSE 估计器计算为

$$
\widehat{\mathbf h}_{c}(\mathbf r)=\mathbf C_{h|c}\mathbf A^{H}\mathbf B_{c}^{H}\mathbf C_{r|c}^{-1}\mathbf r.\tag{16}
$$

**证明：** 见附录 A。

引理 1 的主要结果表明：只要找到使信道成为（条件）零均值高斯的条件事件，第 III 节的 Bussgang 估计器即可推广到任意信道 PDF。结论虽然很有前景，但找到这样的条件事件一般极为困难，尤其因为条件事件**不能是观测的函数**——否则会引入对噪声实现的依赖。

然而，如果把条件事件 $c$ 建模为具有任意先验分布 $p(c)$ 的潜在随机变量，并通过参数化分布强制满足式 (14)，以在给定数据集下最大化似然 $p(\mathbf h)$，就进入了经典变分推断框架 [49, 第 10 章] 中的**条件高斯潜变量模型**这一特例。对条件事件作贝叶斯建模，还使我们可以把一般难以处理的、MSE 最优的 CME [20] 近似为

$$
\mathbb E[\mathbf h|\mathbf r]=\mathbb E[\mathbb E[\mathbf h|\mathbf r,c]|\mathbf r]=\int\mathbb E[\mathbf h|\mathbf r,c]\,p(c|\mathbf r)\,dc\tag{17}
$$

$$
\approx\int\widehat{\mathbf h}_{c}(\mathbf r)\,p(c|\mathbf r)\,dc\tag{18}
$$

其中式 (17) 用了全期望公式，式 (18) 用引理 1 导出的线性 MMSE 估计 (16) 近似条件均值 $\mathbb E[\mathbf h|\mathbf r,c]$。注意式 (17) 中隐含假设潜变量连续，不过如后文所示，离散潜变量同样可用。尽管式 (18) 仍为近似，线性 MMSE 估计器在信道估计中被广泛采用，尤其是滤波器具有良好的线性性，便于低成本实现。式 (18) 中对潜变量 $c$ 的边缘化仍需按所选 VI 形式以可处理方式求解；本节余下部分讨论若干变体，包括 GMM、MFA 与 VAE。本节始终假设可获得真实信道样本的训练数据集 $\mathcal H$（见第 II-4 节）。

### A. 基于 GMM 的 Bussgang 估计器

先推导基于 GMM 的估计器，它参数化一个**逐分量**的 Bussgang 估计器。一般地，GMM 是如下形式的 PDF：

$$
p^{(K)}(\mathbf h)=\sum_{k=1}^{K}\pi_{k}\mathcal N_{\mathbb C}(\mathbf h;\boldsymbol\mu_{h|k},\mathbf C_{h|k})\tag{19}
$$

其中 $K$ 为混合分量数，$\{\pi_{k},\boldsymbol\mu_{h|k},\mathbf C_{h|k}\}_{k=1}^{K}$ 为 GMM 的参数集，即混合系数、均值与高斯分量的协方差。给定信道样本训练集 $\mathcal H$，GMM 参数通过 EM 算法拟合（参见 [49, 第 9 章]）。GMM 的一个重要性质是：对给定数据样本，各分量的**责任度**（responsibility）可计算为 $p(k|\mathbf h)\propto\pi_{k}\mathcal N_{\mathbb C}(\mathbf h;\boldsymbol\mu_{h|k},\mathbf C_{h|k})$（参见 [49, 第 9 章]）。GMM 可由具有类别分布的离散潜变量描述，该潜变量以 $K$ 个分量之一为条件 [49, 第 9 章]，因而给出一个条件高斯潜变量模型。

为确保引理 1 中式 (14) 成立，本文强制分量均值为零，即对所有 $k\in\{1,\ldots,K\}$ 取 $\boldsymbol\mu_{h|k}=\mathbf 0$。为在拟合过程中体现该约束，EM 算法的每次 M 步都把分量均值置零。自然，零均值约束在一定程度上削弱了 GMM 逼近真实底层分布的能力。不过，鉴于可行的无线信道分布被认为是零均值的、且概率密度随幅度增大而下降（参见 [40]），模型精度的损失可视为很小；此外，限制分量均值还能防止过拟合，并允许对高维数据建模 [50]。

GMM 训练完成后即用于信道估计，做法与 [31] 类似，但为计入量化效应作了多处适配（如引理 1 所述）。首先注意：若信道分布建模为零均值 GMM，则未量化接收信号 $\mathbf y$ 的分布也是零均值 GMM，其协方差为 $\mathbf C_{y|k}=\mathbf A\mathbf C_{k}\mathbf A^{H}+\sigma^{2}\mathbf I$（$k\in\{1,\ldots,K\}$，参见式 (1)）。对每个 GMM 分量，都可应用条件 Bussgang 分解得到统计等价模型（参见引理 1 的式 (15)）：

$$
\mathbf r=\mathbf B_{k}\mathbf A\mathbf h+\mathbf q_{k},\tag{20}
$$

其中 $\mathbf B_{k}$ 为分量 $k$ 的条件 Bussgang 增益，$\mathbf q_{k}=\mathbf B_{k}\mathbf n+\boldsymbol\eta$。按引理 1，条件 Bussgang 增益 $\mathbf B_{k}$ 由式 (8) 或式 (9) 的闭式解计算。

作者指出，由于 GMM 的潜变量是离散的，用于近似 CME 的式 (18) 中的积分简化为求和。与高分辨率情形相反，一般情形下离散分布 $p(\mathbf r|k)$ 的求值不可行，因为其离散支撑的基数随维数指数增长 [20]。因此，为对给定导频信号计算责任度，本文假设量化接收信号服从具有相同二阶矩的零均值 GMM 分布；该假设实际上等价于近似推断 [49, 第 10 章]。分量 $k$ 的协方差矩阵 $\mathbf C_{r|k}$ 通过在式 (11)（1 比特）或式 (13)（多比特）中代入该分量的未量化协方差 $\mathbf C_{y|k}$ 得到（参见引理 1）。由此，当协方差矩阵 $\mathbf C_{h|k}$ 的对角元非恒定时，第 $k$ 个分量在式 (13) 中的缩放参数近似为 $\rho_{k}=\min(\frac{1}{N}\sum_{i=1}^{N}[\mathbf B_{k}]_{i,i},1)$，以保证结果矩阵半正定。于是得到如下量化接收信号的责任度：

$$
p(k|\mathbf r)\approx\frac{\pi_{k}\mathcal N_{\mathbb C}(\mathbf r;\mathbf 0,\mathbf C_{r|k})}{\sum_{i=1}^{K}\pi_{i}\mathcal N_{\mathbb C}(\mathbf r;\mathbf 0,\mathbf C_{r|i})}.\tag{21}
$$

最终信道估计由各分量 Bussgang 估计器的凸组合给出（由式 (18) 与引理 1 得到，并以 GMM 协方差参数化），即

$$
\widehat{\mathbf h}_{\mathrm{BGMM}}^{(K)}(\mathbf r)=\sum_{k=1}^{K}p(k|\mathbf r)\,\mathbf C_{h|k}\mathbf A^{H}\mathbf B_{k}^{H}\mathbf C_{r|k}^{-1}\mathbf r.\tag{22}
$$

作者指出，使用完整参数化协方差矩阵的 GMM 与 BS 的阵列几何无关。然而如 [33] 所示，可以为 GMM 协方差施加不同的结构约束，例如循环（"GMM circ"）或 Toeplitz（"GMM toep"）结构。这些结构约束反映 BS 的典型阵列几何（如 ULA 或均匀平面阵 UPA），并由于使用一维或二维快速傅里叶变换（FFT）[33] 而减少参数数量、降低估计器的在线复杂度。第 $k$ 个 GMM 分量的协方差矩阵据此被约束为 $\mathbf C_{h|k}=\mathbf Q^{H}\operatorname{diag}(\mathbf c_{h|k})\mathbf Q$ 的形式，其中在 ULA 或 UPA 情形下 $\mathbf Q$ 分别为（过采样）一维或二维离散傅里叶变换（DFT）矩阵，且 $[\mathbf c_{h|k}]_{i}\in\mathbb R_{+}$。这些结构约束不受限制地也可用于粗量化系统，因为量化逐元素作用于输入，不改变所施加的阵列结构。本文仅考虑第 II-3 节所述的 ULA 情形。相应估计器所需的内存开销与计算复杂度在第 VII 节详细讨论。

### B. 基于 MFA 的 Bussgang 估计器

与 GMM 相关的概念是 MFA 模型：除描述混合分量的离散潜变量 $k$ 外，它还包含维数更低（$L<N$）的连续潜变量 $\mathbf z\in\mathbb C^{L}$ [51, 第 12 章]、[34]。这实际上把数据建模在分片线性子空间上。对连续潜变量 $\mathbf z\sim\mathcal N(\mathbf 0,\mathbf I)$ 积分后，MFA 的 PDF 是 GMM 的特殊形式，其协方差为低秩加对角约束：

$$
p^{(K,L)}(\mathbf h)=\sum_{k=1}^{K}\pi_{k}\mathcal N_{\mathbb C}\!\left(\mathbf h;\boldsymbol\mu_{h|k},\mathbf W_{h|k}\mathbf W_{h|k}^{H}+\boldsymbol\Psi_{h|k}\right),\tag{23}
$$

其中 $\mathbf W_{h|k}\in\mathbb C^{N\times L}$ 为因子载荷矩阵，$\boldsymbol\Psi_{h|k}\in\mathbb C^{N\times N}$ 为对角阵。给定信道实现数据集 $\mathcal H$，可用 EM 算法拟合 MFA 参数 $\{\pi_{k},\boldsymbol\mu_{h|k},\mathbf W_{h|k},\boldsymbol\Psi_{h|k}\}_{k=1}^{K}$ [51, 第 12 章]。训练完成后，定义 $\mathbf C_{h|k}=\mathbf W_{h|k}\mathbf W_{h|k}^{H}+\boldsymbol\Psi_{h|k}$，即可把该模型有效当作 GMM 处理。零均值 MFA 模型（对所有 $k$ 取 $\boldsymbol\mu_{h|k}=\mathbf 0$）也可如 GMM 情形那样强制实现。与 [34] 类似，本文对所有 $k\in\{1,\ldots,K\}$ 取 $\boldsymbol\Psi_{h|k}=\psi_{h|k}\mathbf I$。

相对于 GMM，MFA 在信道估计中的主要优势在于：低维潜空间减少了参数数量，从而缓解训练中的过拟合。因此，对较少训练数据，它是更稳健的模型，如 [34] 所示。由于 MFA 同样参数化条件高斯分布，可以应用引理 1，得到与 GMM 情形类似的分量 Bussgang 估计器（见第 IV-A 节）；把相应协方差代入式 (22)，即得 MFA 参数化的 Bussgang 信道估计器 $\widehat{\mathbf h}_{\mathrm{BMFA}}$。作者指出，MFA 通过训练施加协方差结构，因而与 BS 的阵列几何无关。

### C. 基于 VAE 的 Bussgang 估计器

VAE 由 [52] 提出，凭借其强性能在生成建模领域引起广泛兴趣；它建立在用于 VAE 编码器与解码器的神经网络（NN）之上（见图 1）。文献 [35]、[36] 成功地把 VAE 用于高分辨率系统的信道估计。与 GMM 和 MFA 不同，VAE 具有连续且非线性的潜空间，由低维潜向量 $\mathbf z\in\mathbb R^{L}$ 编码。最常见的设计选择是潜向量的高斯模型，即 $\mathbf z\sim\mathcal N(\mathbf 0,\mathbf I)$。由于变分推断任务不再能由经典 EM 算法处理，通常使用神经网络结合重参数化技巧来训练 VAE [52]、[53]。本文把参数化的编码器与解码器分布取为

$$
q_{\phi}(\mathbf z|\mathbf r)=\mathcal N(\mathbf z;\boldsymbol\mu_{\phi}(\mathbf r),\operatorname{diag}(\boldsymbol\sigma_{\phi}^{2}(\mathbf r))),\tag{24}
$$

$$
p_{\theta}(\mathbf h|\mathbf z)=\mathcal N_{\mathbb C}(\mathbf h;\mathbf 0,\mathbf F^{H}\operatorname{diag}(\mathbf c_{\theta}(\mathbf z))\mathbf F),\qquad\mathbf c_{\theta}\in\mathbb R_{+}^{N},\tag{25}
$$

其中式 (25) 的选择正是为满足引理 1 的式 (14)。矩阵 $\mathbf F$ 为 DFT 矩阵，因此 VAE 参数化的信道协方差矩阵是循环矩阵（参见 [36]）。该选择减少了参数数量，其合理性来自 BS 处 ULA 的既定结构，与 GMM 情形类似（见第 IV-A 节）。与之前一样，把一维 DFT 矩阵换为其二维版本即可直接扩展到 UPA 情形。

对每个训练数据点 $\mathbf h_{t}\in\mathcal H$，VAE 计算对数似然上的 ELBO [52]：

$$
\log p_{\theta}(\mathbf h_{t})\ge\mathbb E_{\phi}[\log p_{\theta}(\mathbf h_{t}|\mathbf z)]-D_{\mathrm{KL}}(q_{\phi}(\mathbf z|\mathbf h_{t})\,\Vert\,p(\mathbf z)).
$$

代入式 (24) 与 (25) 并忽略常数项（它们不影响优化），把 ELBO 作为 VAE 的损失函数 $\mathcal L_{\phi,\theta}$，其形式为（参见 [36]）

$$
\mathcal L_{\phi,\theta}(\mathbf h_{t})=\sum_{n=1}^{N}-\log[\mathbf c_{\theta}]_{n}-\mathbf h^{H}\mathbf F^{H}\operatorname{diag}(\mathbf c_{\theta})^{-1}\mathbf F\mathbf h+\sum_{\ell=1}^{L}\left(\log[\boldsymbol\sigma_{\phi}]_{\ell}-\frac{1}{2}[\boldsymbol\mu_{\phi}]_{\ell}^{2}-\frac{1}{2}[\boldsymbol\sigma_{\phi}]_{\ell}^{2}\right).\tag{26}
$$

按引理 1，借助 VAE 解码器输出的条件高斯性并结合线性 MMSE 滤波器，可用 VAE 参数化信道估计器。训练完成后，对每个量化接收导频 $\mathbf r$，先把导频送入编码器，再以潜均值 $\boldsymbol\mu_{\phi}(\mathbf r)$ 作为解码器输入，得到信道协方差矩阵

$$
\mathbf C_{\theta}=\mathbf F^{H}\operatorname{diag}(\mathbf c_{\theta})\mathbf F.
$$

该过程以低复杂度实现逼近式 (18)，已在高分辨率情形中被证明效果良好 [35]、[36]。VAE 参数化的 Bussgang 估计器因此写为

$$
\widehat{\mathbf h}_{\mathrm{BVAE}}(\mathbf r)=\mathbf F^{H}\operatorname{diag}(\mathbf c_{\theta})\mathbf F\mathbf A^{H}\mathbf B_{\mathbf z}^{H}\mathbf C_{r|\mathbf z}^{-1}\mathbf r,\tag{27}
$$

其中 $\mathbf B_{\mathbf z}$ 由把 $\mathbf C_{y|\mathbf z}=\mathbf A\mathbf C_{\theta}\mathbf A^{H}+\sigma^{2}\mathbf I$ 代入式 (8) 或 (9) 计算；类似地，$\mathbf C_{r|\mathbf z}$ 由把 $\mathbf C_{y|\mathbf z}$ 代入式 (11) 或 (13) 计算（参见引理 1）。

编码器与解码器各使用一个带修正线性单元（ReLU）激活的四层前馈神经网络；输入编码器时把导频观测的实部与虚部堆叠。对多次导频观测的情形，在编码器之前增加一个具有 $P/2$ 层、ReLU 激活的卷积神经网络（CNN），执行 $1\times1$ 卷积，使编码器输入始终为 $2N$ 维。该修改大幅减少参数数量并简化 VAE 的前向传播。完整的 VAE 结构见图 1。

## V. 从量化导频观测中学习

如上所述，在实际通信系统中，获得由整个 BS 小区（无线传播场景）代表性真实信道样本构成的大规模训练数据集 $\mathcal H$ 是值得怀疑的。虽然存在射线追踪等生成模拟底层信道分布的训练集的方法，但它们能否充分刻画真实通信场景的特征仍不明确。另一种思路是直接在各导频观测上训练模型，并通过基于模型的训练适配来缓解加性噪声或导频稀疏分配等不理想因素；这在高分辨率场景中已被证明效果良好 [36]、[54]。然而，从由量化数据构成的训练集 $\mathcal R$ 学习生成模型是一项重大挑战，因为低分辨率量化会带来明显的非线性失真。本节余下部分针对 GMM 与 VAE 提出两种新的训练适配，使得在只有量化训练数据、没有真实 CSI 的情形下也能学习底层信道分布。

### A. GMM 近似的协方差恢复

仅从量化数据恢复 1 比特量化器输入的未量化协方差矩阵，近期引起了大量关注 [55]—[57]。由于零阈值 1 比特量化会丢失幅度信息，只能通过反正弦定律的逆 [46] 获得归一化相关矩阵。为解决该问题，已有工作考虑非零或时变量化阈值，以估计输入信号的方差并进而恢复整个协方差矩阵 [55]—[57]。文献 [58] 验证了 [55] 的协方差恢复技术可与 Bussgang 估计器结合用于信道估计。然而，所考虑的非零阈值量化器设计在通信系统中难以实现，可能需要更复杂的模拟与数字信号处理，最终造成性能损失。相反，对输入信号作多比特量化时，即使阈值固定为零，多电平量化仍保留了粗幅度信息；但迄今为止尚无针对该情形的协方差恢复算法。

本文通过把任务拆分为独立估计相关矩阵与方差，为多比特情形推导了一种新的低复杂度协方差恢复算法。为记号简单，定义如下问题并沿用上述记号。考虑由 $T$ 个样本 $\mathbf r_{t}=Q_{B}(\mathbf y_{t})$ 构成的数据集 $\mathcal R=\{\mathbf r_{t}\}_{t=1}^{T}$，其中 $\mathbf y_{t}\sim\mathcal N_{\mathbb C}(\mathbf 0,\mathbf C_{y})$、$B>1$；任务是仅由这 $T$ 个量化样本恢复 $\mathbf C_{y}$。由于多比特量化下相关矩阵 $\mathbf R_{y}=\operatorname{diag}(\mathbf C_{y})^{-\frac{1}{2}}\mathbf C_{y}\operatorname{diag}(\mathbf C_{y})^{-\frac{1}{2}}$ 没有闭式解，本文直接丢弃样本的幅度信息，把其等效视为 1 比特量化数据。因此，可由 1 比特样本协方差矩阵 $\widehat{\mathbf C}_{\mathrm{1bit}}=\frac{1}{T}\sum_{t=1}^{T}Q_{1}(\mathbf r_{t})Q_{1}(\mathbf r_{t})^{H}$ 借助反正弦定律的逆得到未量化相关矩阵 $\mathbf R_{y}$ 的闭式估计：

$$
\widehat{\mathbf R}_{y}=\sin\!\left(\frac{\pi}{2}\Re(\widehat{\mathbf C}_{\mathrm{1bit}})\right)+j\sin\!\left(\frac{\pi}{2}\Im(\widehat{\mathbf C}_{\mathrm{1bit}})\right).\tag{28}
$$

遗憾的是，虽然存在闭式解，所得相关估计未必半正定 [55]、[59]；不过可通过对半正定矩阵集合的投影来解决（后文讨论）。

由于量化逐元素独立作用于实部与虚部，为记号简单，只需对实值标量 $y\sim\mathcal N(0,\xi^{2})$ 与 $r=Q_{B}(y)\in\mathbb R$ 推导方差估计。注意 $y$ 的幅度服从半正态分布，其 CDF 为 $\Pr(|y|\le\tau)=\operatorname{erf}(\tau/\sqrt{2\xi^{2}})$。由于 CDF 完全由输入信号方差 $\xi^{2}$ 参数化，可以利用量化后的粗幅度信息估计它。定义正量化阈值 $\tilde\tau_{i}<\infty$、$i\in\{1,\ldots,2^{B-1}-1\}$，即 $\tilde\tau_{i}=\tau_{i+2^{B-1}}$；于是可估计观测到幅度不超过 $\tilde\tau_{i}$ 的样本概率为 $\widehat{\Pr}(|y|\le\tilde\tau_{i})=\frac{1}{T}\sum_{t=1}^{T}\chi(|r_{t}|\le\tilde\tau_{i})$。

对循环对称高斯分布的复值输入与多个量化阈值（即 $B>2$），可以利用实部与虚部的不同量化阈值构造超定方程组，共 $2^{B}-2$ 个方程。减去 2 是因为最后一个延伸到无穷的量化区间没有信息量：此时（样本）概率恒为 1。总之，针对输入实部的方程组为

$$
\operatorname{erf}\!\left(\frac{\tilde\tau_{i}}{\sqrt{2\xi^{2}}}\right)=\frac{1}{T}\sum_{t=1}^{T}\chi\left(|\Re(r_{t})|\le\tilde\tau_{i}\right),\tag{29}
$$

其中 $i\in\{1,\ldots,2^{B-1}-1\}$。方程组的另一半把实部换成虚部同样构造。注意该方程组只依赖于未知方差参数 $\xi^{2}$。从几何上看，本文希望用高斯 CDF 曲线以最小二乘（LS）意义插值属于不同阈值的样本概率，可调参数即方差 $\xi^{2}$。由于 CDF 的导数正是高斯 PDF，可用简单的 Gauss–Newton 法求解该非线性 LS 问题。为获得稳健的初值 $\xi_{0}^{2}$，采用量化器最大 $\tilde\tau_{i}$ 对应方程的解。

在多维情形下，若假设每个天线的输入信号方差不同，则可对各维独立求解该非线性 LS 问题，得到 $\operatorname{diag}(\mathbf C_{y})$ 的估计；否则可把各维方程组合并，以更准确地估计单一方差参数。注意在复值情形下，估计出的方差须乘以因子 2，以计入实部与虚部之和。最终完整协方差矩阵估计为

$$
\widehat{\mathbf C}_{y}=\operatorname{diag}(\widehat{\mathbf C}_{y})^{\frac{1}{2}}\widehat{\mathbf R}_{y}\operatorname{diag}(\widehat{\mathbf C}_{y})^{\frac{1}{2}}.\tag{30}
$$

上述协方差恢复方案随后用于仅凭量化数据拟合 GMM 的协方差。为简单起见，假设训练数据来自单快照观测，即 $\mathbf r=Q_{B}(\mathbf h+\mathbf n)$、$P=1$；这总可以通过预处理实现。在 EM 算法的每次迭代中，M 步都因各 GMM 分量的高斯性而采用所提协方差恢复算法来估计未量化协方差矩阵。相对于先前纯高斯设置的必要改动是：用每次 E 步计算出的责任度为分量 $k$ 的样本概率加权，即

$$
\widehat{\Pr}\!\left(|\Re([\mathbf y]_{n})|\le\tilde\tau_{i}\mid k\right)=\frac{1}{N_{k}}\sum_{t=1}^{T}p(k|\mathbf r_{t})\,\chi\left(|\Re([\mathbf r_{t}]_{n})|\le\tilde\tau_{i}\right)\tag{31}
$$

对所有 $i\in\{1,\ldots,2^{B-1}-1\}$ 成立，其中 $N_{k}=\sum_{t=1}^{T}p(k|\mathbf r_{t})$。注意方程组后半部分把 $\Re([\mathbf r_{t}]_{n})$ 换成 $\Im([\mathbf r_{t}]_{n})$。由于量化器输入信号还叠加了 AWGN，本文还采用 [54, 定理 1] 针对含噪数据的 M 步适配：减去噪声协方差，随后通过特征值分解（EVD）截断负特征值，把结果投影到半正定矩阵集合上；这也同时处理了式 (28) 中可能非半正定的相关估计。以该方式估计出分量 $k$ 的信道协方差 $\widehat{\mathbf C}_{h|k}$ 后，先确定 $\widehat{\mathbf C}_{y|k}$，再利用式 (12) 或 (13) 之一构造量化观测的协方差 $\widehat{\mathbf C}_{r|k}$。由于离线学习中复杂度并不关键，本文采用式 (12) 的精确方差公式。M 步所需的适配在算法 1 中简要汇总。如此得到的协方差矩阵 $\widehat{\mathbf C}_{r|k}$ 随后用于在 E 步计算责任度，类似式 (21)。

根据大数定律，基于样本概率的方差估计是一致估计器；它与相关矩阵的闭式解结合，得到一致的协方差估计器。这一性质非常有利：BS 常规运行期间会收到大量导频观测，因此可以构造大规模训练集 $\mathcal R$。

**算法 1　面向量化训练数据的适配 M 步。**

```text
Require: R = {r_t}_{t=1..T}, σ²
 1: 由 E 步经式 (21) 得到 {p(k|r_t)} (t=1..T, k=1..K)
 2: for k = 1 to K do
 3:     N_k = Σ_{t=1..T} p(k|r_t)
 4:     Ĉ^1bit_{r|k} = (1/N_k) Σ_{t=1..T} p(k|r_t) Q_1(r_t) Q_1(r_t)^H
 5:     R̂_{y|k} = sin((π/2)ℜ(Ĉ^1bit_{r|k})) + j sin((π/2)ℑ(Ĉ^1bit_{r|k}))
 6:     for n = 1 to N do
 7:         由式 (31) 为 diag(Ĉ_{y|k}) 构造方程组
 8:         用 Gauss–Newton 求解方程组
 9:     end
10:     Ĉ_{y|k} = diag(Ĉ_{y|k})^{1/2} R̂_{y|k} diag(Ĉ_{y|k})^{1/2}
11:     V diag(ĉ_{h|k}) V^H = EVD(Ĉ_{y|k} − σ²I)
12:     ĉ^PSD_{h|k} = max(0, ĉ_{h|k})   （逐元素取最大）
13:     Ĉ_{h|k} = V diag(ĉ^PSD_{h|k}) V^H
14:     Ĉ_{y|k} = Ĉ_{h|k} + σ²I
15:     由 Ĉ_{y|k} 经式 (12) 计算 diag(Ĉ_{r|k})
16:     由 Ĉ_{y|k} 经式 (8) 计算 B_k
17:     nondiag(Ĉ_{r|k}) = nondiag(B_k Ĉ_{y|k} B_k^H)
18: end
```

### B. VAE 的损失函数适配

与 GMM 类似，通过适当适配 ELBO 损失函数，VAE 模型也可以直接从含噪导频观测训练 [35]、[36]。其思路是修改由解码器输出得到的参数化信道协方差矩阵，使其在损失函数 (26) 中代表导频观测的协方差矩阵。于是，VAE 通过梯度更新只学习信道协方差矩阵。对来自 $\mathcal R$ 的粗量化训练样本，量化协方差矩阵关于信道协方差矩阵的表达式没有闭式解、因而不可微（参见式 (12)）；不过可以采用式 (13) 的近似，如下所示。

由于训练在傅里叶变换域中进行，以参数化循环协方差矩阵 $\mathbf C_{\theta}=\mathbf F^{H}\operatorname{diag}(\mathbf c_{\theta})\mathbf F$，本文先化简对角项：

$$
\operatorname{diag}(\mathbf C_{\theta})=\operatorname{diag}(\mathbf F^{H}\operatorname{diag}(\mathbf c_{\theta})\mathbf F)=\frac{1}{N}\sum_{n=1}^{N}[\mathbf c_{\theta}]_{n}\mathbf I,
$$

这可简单地通过把 $\operatorname{diag}(\mathbf C_{\theta})=\frac{1}{N}\operatorname{tr}(\mathbf C_{\theta})\mathbf I$ 并利用迹的性质与酉 DFT 矩阵 $\mathbf F$ 证明。据此，在单快照导频观测 $\mathbf r=Q_{B}(\mathbf h+\mathbf n)$ 假设下可写为 $\operatorname{diag}(\mathbf C_{y,\theta})=\frac{1}{N}\sum_{n=1}^{N}([\mathbf c_{\theta}]_{n}+\sigma^{2})\mathbf I$，从而 $\mathbf C_{r,\theta}=\mathbf F^{H}\operatorname{diag}(\mathbf c_{r,\theta})\mathbf F$，其中

$$
\mathbf c_{r,\theta}=(1-\rho_{\theta})^{2}(\mathbf c_{\theta}+\sigma^{2}\mathbf 1)+\rho_{\theta}(1-\rho_{\theta})\frac{1}{N}\sum_{n=1}^{N}([\mathbf c_{\theta}]_{n}+\sigma^{2})\mathbf 1,\tag{32}
$$

而 $\rho_{\theta}$ 由把 $\operatorname{diag}(\mathbf C_{y,\theta})$ 代入式 (8) 计算。因此，把损失函数 (26) 中的 $\mathbf c_{\theta}$ 换成式 (32) 的 $\mathbf c_{r,\theta}$、把 $\mathbf h$ 换成 $\mathbf r$，即可从量化数据训练 VAE。

## VI. 基线信道估计器

本文把所提参数化生成建模辅助信道估计器与粗量化系统的先进基线信道估计器比较。首先，对第 II-3 节的 3GPP 信道模型，仿真中可以"开天眼"地获得式 (6) 中真实的信道协方差矩阵 $\mathbf C_{h|\delta}$，从而评估**开天眼 Bussgang 估计器** $\widehat{\mathbf h}_{\mathrm{Buss\text{-}genie}}=\mathbf C_{h|\delta}\mathbf A^{H}\mathbf B_{\delta}^{H}\mathbf C_{r|\delta}^{-1}\mathbf r$，其中 $\mathbf B_{\delta}$ 与 $\mathbf C_{r|\delta}$ 由把 $\mathbf C_{h|\delta}$ 代入式 (8)（或 1 比特时的 (9)）与式 (13)（或多比特时的 (11)）得到。注意该估计器在实践中不可实现，仅作为 Bussgang 估计器（即最佳线性估计器）性能的下界；相应曲线标为 Buss-genie。

文献中主要使用的一种实际可行方法，是把样本协方差矩阵 $\widehat{\mathbf C}_{h}=\frac{1}{T}\sum_{t=1}^{T}\mathbf h_{t}\mathbf h_{t}^{H}$ 与 Bussgang 估计器 (10) 结合，标为 Buss-Scov。注意该情形需要真实信道训练集 $\mathcal H$。

一个简单基线是基于 Bussgang 分解 (7) 的 LS 估计，即 $\widehat{\mathbf h}_{\mathrm{BLS}}=\mathbf A^{\dagger}\mathbf B^{\dagger}\mathbf r$，标为 BLS。计算 Bussgang 增益 (8) 或 (9) 时使用上述样本协方差矩阵 $\widehat{\mathbf C}_{h}$。

文献 [17] 提出一种基于 CS 的信道估计器，它把用于近似稀疏角度域信道 PDF 的 EM 算法与求解稀疏恢复问题的 GAMP 算法结合。注意该情形下 EM 算法是在线地针对每条传输链路与每个导频观测运行的，这与 GMM 方法（仅在离线阶段使用 EM）有本质不同。本文应用 EM-GM-GAMP 算法估计角度域信道参数 $\widehat{\mathbf x}$，最终信道估计为 $\widehat{\mathbf h}_{\mathrm{EM\text{-}GM\text{-}GAMP}}=\mathbf F\widehat{\mathbf x}$，标为 EM-GM-GAMP。

本文还评估了一种与 [28] 类似的深度学习估计器：训练一个三层前馈神经网络，直接由导频观测映射到信道估计；除输出层外各层均使用 ReLU 激活。为与所提方法公平比较，对全 SNR 范围训练单一网络。与 [28] 类似，在隐层神经元数量大幅增加时取得最佳性能，因此本文把两个隐层的神经元数都设为 $2N^{2}$。相应曲线标为 DNN。

## VII. 内存与复杂度分析

基于数据的方法的离线内存需求与算法在线复杂度，是实时系统中信道估计的关键特性。（结构化）零均值 GMM 与 MFA 模型的参数数量由 $K$ 个协方差与混合系数个数决定。每个分量与每个 SNR 值对应的线性 MMSE 滤波器在离线训练后即固定，因此可以预先计算。由于式 (21) 中责任度的计算同样可以预先处理，整体在线复杂度由各分量的矩阵—向量乘积决定 [31]。值得注意的是，$K$ 个滤波器／责任度的计算显然可以并行化，这在实际系统中非常重要。对循环结构 GMM 协方差的情形（见第 IV-A 节），由于使用 FFT，复杂度得以降低 [31]。

对 VAE 方法，参数数量与网络前向传播的复杂度取决于网络结构（见第 IV-C 节）。由于参数化的是循环协方差矩阵，所得滤波器可用 FFT 计算，与循环 GMM 情形类似。作者进一步指出：从量化数据学习的方法（见第 V 节）只改动了训练流程，因此其内存开销与在线复杂度与用完美 CSI 学到的模型相同。

表 I 汇总了所提全部方法与基线方法的内存开销与在线计算复杂度。可以看到，所提方法在参数数量与在线复杂度上各有不同，从而可以在所需性能与实际系统需求之间平滑权衡。尤其重要的是与深度神经网络方法的比较：该方法改编自 [28]，直接输出信道估计，即并不参数化解析估计器。可以看出，相比深度神经网络，所提方法的参数数量少得多、在线复杂度也更低。主要原因在于 NN 方法中隐层神经元数量的急剧增加（参见 [28]）；相反，所提模型包含一个强制压缩的潜空间，因而降低了内存与复杂度开销。如下文数值结果所示，所提方法在多数情形下即使参数更少、在线复杂度更低，估计性能反而更好。

**表 I：所讨论估计器的计算复杂度与参数数量（示例数值对应 $K=N=64$、$L=16$、$P=4$ 的情形）。** 参数按实值计。

| 名称 | 模型参数（实值） | 示例（取整） | 在线复杂度 |
|---|---|---:|---|
| GMM full | $K(N^{2}+1)-1$ | $2.62\cdot10^{5}$ | $\mathcal O(KPN^{2})$（对 $K$ 并行） |
| GMM toep | $K(4N+1)-1$ | $1.64\cdot10^{4}$ | $\mathcal O(KPN^{2})$（对 $K$ 并行） |
| GMM circ | $K(N+1)-1$ | $4.16\cdot10^{3}$ | $\mathcal O(KPN\log(PN))$（对 $K$ 并行） |
| MFA | $K(2LN+2)-1$ | $1.31\cdot10^{5}$ | $\mathcal O(KPN^{2})$（对 $K$ 并行） |
| VAE | $6N^{2}+10NL+\frac{1}{2}P^{2}+\frac{1}{2}P+\mathcal O(N)$ | $3.53\cdot10^{4}$ | $\mathcal O(N^{2}+PN\log(PN))$ |
| DNN [28] | $4N^{4}+(4P+4)N^{3}+4N^{2}+2N$ | $7.24\cdot10^{7}$ | $\mathcal O(N^{3})$ |
| Buss-Scov | $N^{2}$ | $5.0\cdot10^{3}$ | $\mathcal O(PN^{2})$ |
| EM-GM-GAMP [17] | – | – | $\mathcal O(PN\log(PN))$ |
| BLS | – | – | $\mathcal O(PN)$ |

## VIII. 可达速率下界

在量化系统中，可达速率备受关注 [3]、[24]。本文评估计入 CSI 失配的相应数据传输系统的可达速率下界。为此，在用式 (1) 的导频传输完成信道估计后，数据符号 $s$ 经同一信道传输，即 $\mathbf r=Q_{B}(\mathbf h s+\mathbf n)=\mathbf B\mathbf h s+\mathbf q$；第二个等式使用了 Bussgang 分解的线性化模型，其中 $\mathbf q=\mathbf B\mathbf n+\boldsymbol\eta$。本文作最坏情形假设：聚合噪声为高斯，即 $\mathbf q\sim\mathcal N_{\mathbb C}(\mathbf 0,\mathbf C_{q}=\mathbf C_{r}-\mathbf B\mathbf C_{h}\mathbf B^{H})$（参见 [60]）。此外假设 BS 采用最大比合并（MRC），归一化滤波器为 $\mathbf g_{\mathrm{MRC}}^{H}=\widehat{\mathbf h}^{H}/\lVert\widehat{\mathbf h}\rVert_{2}^{2}$。注意数据符号 $s$ 的方差不妨设为 1；并假设导频传输与数据传输期间 SNR 相同。于是可评估 use-and-then-forget（UF）界作为可达速率下界（参见 [24, 引理 1]）：

$$
R_{\mathrm{UF}}=\log_{2}\left(1+\frac{\left|\mathbb E[\mathbf g_{\mathrm{MRC}}^{H}\mathbf B\mathbf h]\right|^{2}}{\operatorname{var}[\mathbf g_{\mathrm{MRC}}^{H}\mathbf B\mathbf h]+\mathbb E[\mathbf g_{\mathrm{MRC}}^{H}\mathbf C_{q}\mathbf g_{\mathrm{MRC}}]}\right)\tag{33}
$$

并结合蒙特卡洛仿真计算。

## IX. 仿真结果

### A. 协方差恢复

在考察信道估计性能之前，本文先在不含 AWGN 的纯高斯设置中评估第 V-A 节所提协方差恢复算法，并与合理基线比较。假设"开天眼"地知道未量化样本，可计算未量化样本协方差矩阵 $\widehat{\mathbf C}_{\mathrm{unquant}}=\frac{1}{T}\sum_{t=1}^{T}\mathbf h_{t}\mathbf h_{t}^{H}$；注意该基线需要完美 CSI，故仅作为基线。一种可行方法是忽略量化效应，计算量化样本协方差矩阵 $\widehat{\mathbf C}_{\mathrm{quant}}=\frac{1}{T}\sum_{t=1}^{T}\mathbf r_{t}\mathbf r_{t}^{H}$，其中 $\mathbf r_{t}=Q_{B}(\mathbf h_{t})$；该基线随量化比特 $B$ 增加而更准确，但因粗量化而引入系统性误差。

本文按式 (6) 构造 100 个随机协方差矩阵 $\mathbf C_{h|\delta}$，并从每个协方差矩阵抽取固定数量的样本 $\{\mathbf h_{t}\sim\mathcal N_{\mathbb C}(\mathbf 0,\mathbf C_{h|\delta})\}_{t=1}^{T}$，然后用这 100 个协方差实现计算归一化 MSE $\mathbb E[\lVert\mathbf C_{h|\delta}-\widehat{\mathbf C}\rVert_{F}^{2}]/\mathbb E[\lVert\mathbf C_{h|\delta}\rVert_{F}^{2}]$。

图 2 左图给出归一化 MSE 随样本数 $T$ 的变化（不同量化比特 $B$）。可以看到，所提协方差恢复方案在所有量化电平下表现相当，因为它是一致估计器，即估计误差随样本数增加而稳定下降；这与未量化样本协方差矩阵（"Scov ∞-bit"）类似，但存在大致恒定的偏移，主要来自随比特 $B$ 变化保持不变的相关估计（参见式 (28)）。相反，量化样本协方差矩阵（"Scov B-bit"）是有偏估计器，表现出相对较高的误差地板，且如预期随量化比特数增加而下降。作者指出，所提估计器的一致性与无偏性是关键特性：在用量化导频观测训练时，可以预期在 BS 常规运行期间能低成本获得大规模数据集 $\mathcal R$；这与由真实信道构成的数据集 $\mathcal H$ 相反——后者要么需要昂贵的测量活动，要么需要对底层传播环境作复杂建模。

图 2 右图评估求解非线性 LS 问题所需的 Gauss–Newton 迭代次数（直至估计方差绝对变化小于 $10^{-5}$）。可以看到，所有情形下都只需很少迭代即可收敛；迭代次数还随样本数 $T$ 增大以及量化比特数减少（$B$ 较大时方程数更多）而减少，使方差估计非常快。结合相关矩阵的闭式解 (28)，该协方差估计器复杂度低，且适用于任意给定 $B>2$ 的量化比特数。

### B. 信道估计

本节给出数值结果，用第 VI 节讨论的先进基线评估第 IV、V 节所提信道估计器。所有仿真中，$\mathcal H$ 与 $\mathcal R$ 的训练样本数（见第 II-4 节）固定为 $T=100\,000$。归一化 MSE $\frac{1}{NT_{\mathrm{test}}}\sum_{i=1}^{T_{\mathrm{test}}}\lVert\mathbf h_{i}-\widehat{\mathbf h}_{i}\rVert_{2}^{2}$ 与可达速率下界 (33) 由 $T_{\mathrm{test}}=10\,000$ 个不属于训练集的信道样本计算。除非另有说明，GMM/MFA 的分量数取 $K=64$，MFA/VAE 的潜维数取 $L=N/4$，数据辅助方法用信道数据集 $\mathcal H$ 训练。对 VAE 与 DNN 方法，都针对 $[-10,20]$ dB 的整个 SNR 范围训练单一网络结构。由于低导频开销被认为是实际系统的关键方面 [2]，本文尤其关注单快照场景。

图 3 在 3GPP 信道模型、一个（上排）与三个（下排）传播簇、$B\in\{1,2,3\}$ 量化比特、$N=64$ 根天线、$P=1$ 个导频下，比较所提信道估计器与基线方法的 MSE 随 SNR 的变化。所有情形下，BLS、Buss-Scov 与 EM-GM-GAMP 在整个 SNR 范围内都被所提方法以明显差距超越。这是因为 Buss-Scov 所假设的 Bussgang 定理对非高斯信道并不成立；此外，信道在角度域一般并不完美稀疏（泄漏效应），这显著影响 CS 方法 EM-GM-GAMP。有趣的是，在单传播簇情形下，基于 GMM 的方法接近 Buss-genie（即对单快照拥有真实信道协方差矩阵这一乌托邦知识的 Bussgang 估计器），这凸显了 GMM 的强大估计能力。在所考虑的 ULA 情形中，Toeplitz 结构 GMM 版本几乎与完整 GMM 方法相当，而循环结构版本存在小幅性能差距。部分情形下 MSE 在超过某一 SNR 水平后反而上升，这一现象源于**随机共振**（stochastic resonance）——量化系统中众所周知的效应 [61]；该效应因估计器参数化方式不同而有所差异。DNN 方法在不同场景下也表现出较好的估计结果，但总是被至少一个所提估计器超越，尽管其参数数量大得多、在线复杂度更高（参见表 I）。总体上，图 3 的仿真结果展示了基于高斯潜变量模型的参数化估计器类别与 Bussgang 估计器结合的巨大潜力。

图 4 评估式 (33) 的可达速率下界，对应 3GPP 信道模型、一个（左）与三个（右）传播簇、$N=64$ 根天线、$P=1$ 个导频观测以及不同量化比特数。在单传播簇情形下，GMM 与 VAE 方法的可达速率下界几乎与 Buss-genie 相当。此外，与 Buss-Scov 的可达速率下界相比，所有考虑的量化比特数下都存在明显差距。该现象在三个传播簇情形下同样成立，只是相对基线方法的整体差距有所减小。这些结果表明，所提估计器更好的估计性能可以有效转化为更高的数据速率，或在保持与基线 Buss-Scov 相同吞吐量的前提下降低分辨率。

图 5（左）比较不同量化比特数 $B$ 下的 MSE 性能，此处为 QuaDRiGa LOS 信道模型（见第 II-3 节）。BLS、Buss-Scov 与 EM-GM-GAMP 再次在整个量化比特范围内被超越。有趣的是，DNN 方法在 $B=2$ 与 $B=3$ 时表现相当好，但在 $B=1$ 与无限分辨率这两个极端情形下性能反而下降，说明所提方法相对更具稳健性。有趣的是，MFA 估计器在此情形中位居最优之列，这凸显了估计器性能可能随信道模型略有差异；但同样可以看到，所提估计器类别的整体性能对不同信道模型是稳定且稳健的。图 5（右）评估式 (33) 对应的可达速率下界：所提方法在 MSE 上更好的估计质量直接转化为更高的可达速率保证，仅比接收端完美 CSI 知识下的可达速率下界低约 1–2 bits/s/Hz。

图 6 左图考察 $B=1$ 比特、$P=1$ 个导频、SNR 为 10 dB 时，估计质量随 BS 天线数 $N$ 的变化（QuaDRiGa LOS 信道模型，见第 II-3 节）。与基线 BLS、Buss-Scov、EM-GM-GAMP 相反，所提估计器的性能随天线数增加而显著提升，这在大规模 MIMO 系统中尤为重要。GMM 方法在所有考虑的天线数下都表现最好，而 VAE 方法在天线数很多时尤强；这归因于 VAE 对协方差的循环参数化，而该性质只在天线数很大时渐近成立。GMM-circ 估计器也表现出类似行为。DNN 方法的参数数量随天线数呈四次方增长（参见表 I），在整个范围内都被超越。

图 6 右图给出采用第 II-1 节导频设计、$N=64$ 根天线、固定 SNR 为 5 dB 时 MSE 随导频观测数增加的变化。所提估计器在整个导频范围内都优于所有基线方法（包括 DNN 估计器）。尤其具有非线性潜空间的 MFA 与 VAE 模型在多导频情形下表现很好。虽然本文分析主要聚焦单快照情形，但可以看到导频数增加时所提估计器同样表现良好。

接下来讨论达到一定性能所需的 GMM 分量数 $K$。图 7 左图在 $B=1$ 比特、$N=64$ 根天线、$P=1$ 个导频下，对 QuaDRiGa LOS 以及混合 LOS/NLOS 信道模型（见第 II-3 节）评估 MSE 随 GMM 分量数的变化（不同 SNR）。可以预期，混合 LOS/NLOS 场景中大量子路径的叠加会形成结构化程度更低的无线信道，因此数据辅助模型能从先验知识中推断出的结构信息更少；于是可以观察到混合场景的整体性能更差。然而在两种场景中，GMM 分量数增加都持续提升估计性能，且纯 LOS 情形改进更大。这指向毫米波通信中的应用——高频与更小的 BS 小区相结合会带来较高的 LOS 概率。

图 7 右图分析相同设置但 $B=3$ 量化比特的情形。此处通过比较用式 (13) 由给定 $\mathbf C_{y}$ 计算 $\mathbf C_{r}$ 的近似质量，与"用式 (12) 计算精确方差、但非对角仍用同一近似"的估计器（标为 "GMM-ex."）进行对照。如预期，该近似在低到中等 SNR 区间高度准确，而这正是低分辨率系统的工作区间；在高 SNR 下近似精度下降，并随 GMM 分量数增加出现饱和效应。不过整体近似损失很小，相比基线仍能带来很高的估计精度。此外，估计性能一般随 GMM 分量数增加而稳定提升，并在 $K$ 较大时总体上趋于饱和。

图 8 评估第 V 节所述的 GMM 与 VAE 训练适配，以便从含噪、量化导频观测 $\mathcal R$（见第 II-4 节）学习而训练期间没有真实信道样本。本文把算法 1 适配后的 GMM 称为 "GMM R"，把用真实信道学到的 GMM 称为 "GMM H"；VAE 也作相应命名。作者指出，"GMM R" 与 "VAE R" 的一个主要区别是：适配 GMM 的训练针对固定 SNR 进行，但训练后模型可用于整个 SNR 范围；而 VAE 直接针对整个 SNR 范围训练，以便正确泛化。为进行有意义的比较，"GMM R" 对每个 SNR 点分别训练，而 "VAE R" 对整个 SNR 范围训练（仿真中未见按 SNR 训练带来的性能增益）。

图 8(a) 与 (b) 分别考虑 $N=64$、$P=1$、$B=2$ 以及 3GPP 信道模型一个与三个传播簇的情形；图 8(c) 与 (d) 研究 $B=3$ 比特的相同设置。令人惊讶的是，借助基于模型的适配，用由粗量化且含噪数据样本构成的数据集 $\mathcal R$ 训练的模型，几乎与用 $\mathcal H$ 中真实无噪信道样本训练的对应模型性能相当。总体上，估计质量在低到中等 SNR 区间似乎最准确，此时式 (13) 的近似以及训练适配都高度精确。这意味着在该区间，通常代价高昂的数据集 $\mathcal H$ 几乎可以无性能损失地由 $\mathcal R$ 替代。在高 SNR 区间，"GMM R" 的性能损失趋于增大，这是式 (28) 相关估计一般非半正定所致：按算法 1 通过截断负特征值投影到半正定矩阵集合后，所得协方差估计缺少相应特征向量，而这对高 SNR 区间性能影响更大。这与"在多径分量较少的情形下适配效果最好"的观察一致。

## X. 结论

本文利用 GMM、MFA 与 VAE 等高斯潜变量模型，为粗量化系统的信道估计提出了一个新颖且有前景的框架。这些模型成功学习了无线传播场景中未知且复杂的信道分布，随后利用这一有价值的先验信息，基于条件 Bussgang 分解构造出可处理的参数化线性 MMSE 估计器。本文表明，所提出的全部估计器在各种信道与系统参数下都表现良好，差异很小；这允许依据所讨论的内存与复杂度开销选择偏好的模型。此外，本文推导了基于模型的训练适配，即 GMM 的协方差恢复算法与 VAE 的损失函数适配，使得可以直接从量化训练数据学习这些模型而仅有很小的性能损失。大量仿真验证了其在 MSE 与可达速率指标上优于经典方法与深度学习方法。

本文工作指出了进一步研究该估计框架的若干方向，例如多用户系统分析、多小区系统中的导频污染，以及不同接收策略（如迫零）。鉴于所讨论的 VAE 概念近期在时变信道建模上的进展 [62]，把所提估计框架扩展到时变系统是未来工作的一部分。

## XI. 致谢

作者衷心感谢 Michael Koller 博士在本工作早期阶段给予的有价值讨论与意见。

## 附录 A：引理 1 的证明

**证明。** 由于假设 $\mathbf h|c$ 为零均值高斯且 $\mathbf n$ 独立于 $c$，可得 $\mathbf y|c\sim\mathcal N_{\mathbb C}(\mathbf y;\mathbf 0,\mathbf C_{y|c})$。因此，给定 $c$ 时满足应用 Bussgang 定理的条件，可取 $\mathbf B_{c}=\mathbf C_{ry|c}\mathbf C_{y|c}^{-1}$，使给定 $c$ 时 $\mathbf y$ 与 $\boldsymbol\eta$ 条件不相关。特别地，条件 Bussgang 增益 $\mathbf B_{c}$ 可由式 (8) 或 (9) 计算；由于给定 $c$ 时输入为高斯，式 (11)—(13) 的闭式表达与近似在把 $\mathbf C_{y}$ 替换为 $\mathbf C_{y|c}$ 后成立，从而证明性质 a)、b)、c)。

进一步注意，由于 $\mathbb E[\mathbf y|c]=\mathbf 0$ 且均匀量化函数 $Q_{B}(\cdot)$ 关于零对称，可得 $\mathbb E[\mathbf r|c]=\mathbf 0$。因此，给定 $\mathbf r$ 与 $c$ 时 $\mathbf h$ 的条件线性 MMSE 估计器计算为

$$
\widehat{\mathbf h}_{c}=\mathbb E[\mathbf h\mathbf r^{H}|c]\mathbb E[\mathbf r\mathbf r^{H}|c]^{-1}\mathbf r\tag{34}
$$

$$
=\mathbb E[\mathbf h(\mathbf h^{H}\mathbf A^{H}\mathbf B_{c}^{H}+\mathbf n^{H}\mathbf B_{c}^{H}+\boldsymbol\eta^{H})|c]\mathbf C_{r|c}^{-1}\mathbf r\tag{35}
$$

$$
=\left(\mathbf C_{h|c}\mathbf A^{H}\mathbf B_{c}^{H}+\mathbb E[\mathbf h\boldsymbol\eta^{H}|c]\right)\mathbf C_{r|c}^{-1}\mathbf r,\tag{36}
$$

其中式 (36) 用到 $\mathbb E[\mathbf h\mathbf n^{H}|c]=\mathbb E[\mathbf h|c]\mathbb E[\mathbf n|c]^{H}=\mathbf 0$。与 [24, 附录 A] 中无条件情形类似，给定 $c$ 时 $\mathbf h$ 与 $\boldsymbol\eta$ 的条件相关计算为

$$
\mathbb E[\mathbf h\boldsymbol\eta^{H}|c]=\mathbb E[\mathbb E[\mathbf h\boldsymbol\eta^{H}|c,\mathbf y]|c]\tag{37}
$$

$$
=\mathbb E[\mathbb E[\mathbf h|c,\mathbf y]\boldsymbol\eta^{H}|c]\tag{38}
$$

$$
=\mathbf C_{h|c}\mathbf A^{H}\mathbf C_{y|c}^{-1}\mathbb E[\mathbf y\boldsymbol\eta^{H}|c]=\mathbf 0,\tag{39}
$$

其中式 (37) 用了全期望公式，式 (38) 成立是因为给定 $\mathbf y$ 时 $\boldsymbol\eta=\mathbf r-\mathbf B_{c}\mathbf y$ 为常数，式 (39) 用了给定 $c$ 时 $\mathbf h$ 与 $\mathbf y$ 条件联合高斯这一事实，因而条件期望 $\mathbb E[\mathbf h|c,\mathbf y]$ 可由条件线性 MMSE 估计器计算。由于 Bussgang 分解使给定 $c$ 时 $\mathbf y$ 与 $\boldsymbol\eta$ 条件不相关，式 (36) 中的估计器化简为式 (16)，证明完毕。$\square$

## 图注与表注

**图 1：所提出的适配 VAE 结构。** 图中包括编码器、潜空间与解码器，以及参数化分布与重参数化技巧。输入为接收信号 $\mathbf R\in\mathbb C^{N\times P}$（经 $1\times1$ 卷积与 CNN 处理后得到 $2N$ 维输入），编码器输出 $q_{\phi}(\mathbf z|\mathbf r)$ 的均值 $\boldsymbol\mu_{\phi}\in\mathbb R^{L}$ 与标准差 $\boldsymbol\sigma_{\phi}\in\mathbb R^{L}$；经 $\mathbf z=\boldsymbol\mu_{\phi}+\boldsymbol\sigma_{\phi}\odot\boldsymbol\varepsilon$（$\boldsymbol\varepsilon\sim\mathcal N(\mathbf 0,\mathbf I)$）采样得到潜变量 $\mathbf z\in\mathbb R^{L}$；解码器 $p_{\theta}(\mathbf h|\mathbf z)$ 输出 $\mathbf c_{\theta}\in\mathbb R_{+}^{N}$，用于构造循环协方差矩阵。

**图 2：协方差估计性能评估。** 维数 $N=64$，100 次蒙特卡洛迭代，协方差由 3GPP 模型式 (6) 得到。左图：归一化 MSE 随数据样本数 $T$ 的变化（$B=2,3,4$ 的所提方法，以及 Scov ∞-bit、Scov B-bit 两类基线）；右图：Gauss–Newton 迭代次数随数据样本数 $T$ 的变化（图例同上）。

**图 3：3GPP 信道模型下的 MSE 性能。** 一个（上排）与三个（下排）传播簇，$B\in\{1,2,3\}$ 量化比特，$N=64$ 根天线，$P=1$ 个导频观测（单快照）。(a) 单簇 $B=1$；(b) 单簇 $B=2$；(c) 单簇 $B=3$；(d) 三簇 $B=1$；(e) 三簇 $B=2$；(f) 三簇 $B=3$。图例：Buss-genie、Buss-Scov、BLS、EM-GM-GAMP、DNN、GMM、GMM-toep、GMM-circ、MFA、VAE。

**图 4：可达速率下界 (33) 的评估。** 3GPP 信道模型，一个（左）与三个（右）传播簇，$B=\{1,3,\infty\}$ 量化比特，$N=64$ 根天线，$P=1$ 个导频观测。

**图 5：QuaDRiGa LOS 信道模型下的性能。** $N=64$ 根天线，$P=1$ 个导频。左：MSE 随 ADC 分辨率 $B$ 的变化；右：可达速率下界随 $B$ 的变化。

**图 6：QuaDRiGa LOS 信道模型的 MSE 性能（$B=1$）。** 左：$P=1$、SNR $=10$ dB 时随天线数 $N$ 的变化；右：$N=64$、SNR $=5$ dB 时随导频数 $P$ 的变化。

**图 7：QuaDRiGa LOS 与混合 LOS/NLOS 信道模型的 MSE 性能。** 左：$B=1$；右：$B=3$；两者均 $N=64$、$P=1$。曲线为不同 $K$ 下的 GMM 与 GMM-ex.（精确方差 + 近似非对角）以及不同 SNR 下的结果。

**图 8：用量化数据训练的模型的 MSE 性能评估。** 3GPP 信道模型，$P=1$ 个导频，$N=64$ 根天线。(a) 单簇，$B=2$；(b) 三簇，$B=2$；(c) 单簇，$B=3$；(d) 三簇，$B=3$。图例：Buss-ScovH、GMMH、GMMR、VAEH、VAER（下标 H 表示用真实信道数据集 $\mathcal H$ 训练，R 表示用量化导频数据集 $\mathcal R$ 训练）。

**表注：** 原文仅含表 I（见第 VII 节）；其余为图。图内曲线不作数字化估算，数值以正文叙述为准。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 62 条，源文 pp. 14–15）。

[1] J. Liu, Z. Luo, and X. Xiong, "Low-resolution ADCs for wireless communication: A comprehensive survey," IEEE Access, vol. 7, pp. 91 291–91 324, 2019.

[2] J. Zhang, L. Dai, X. Li, Y. Liu, and L. Hanzo, "On low-resolution ADCs in practical 5G millimeter-wave massive MIMO systems," IEEE Commun. Magazine, vol. 56, no. 7, pp. 205–211, 2018.

[3] S. Jacobsson, G. Durisi, M. Coldrey, U. Gustavsson, and C. Studer, "Throughput analysis of massive MIMO uplink with low-resolution ADCs," IEEE Trans. Wireless Commun., vol. 16, no. 6, pp. 4038–4051, 2017.

[4] A. Mezghani and J. Nossek, "Capacity lower bound of MIMO channels with output quantization and correlated noise," in Int. Symp. Inf. Theory, July 2012, pp. 1–5.

[5] A. Mezghani, "Information-theoretic analysis and signal processing techniques for quantized MIMO communications," Ph.D. dissertation, Dept. Elect. Eng., Tech. Univ. Munich, Munich, Germany, 2016.

[6] J. Singh, O. Dabeer, and U. Madhow, "On the limits of communication with low-precision analog-to-digital conversion at the receiver," IEEE Trans. Commun., vol. 57, no. 12, pp. 3629–3639, 2009.

[7] J. A. Nossek and M. T. Ivrlač, "Capacity and coding for quantized MIMO systems," in Proc. Int. Conf. Wireless Commun. Mobile Comput., 2006, p. 1387–1392.

[8] S. Wang, Y. Li, and J. Wang, "Multiuser detection in massive spatial modulation MIMO with low-resolution ADCs," IEEE Trans. Wireless Commun., vol. 14, no. 4, pp. 2156–2168, 2015.

[9] A. Mezghani, F. Antreich, and J. A. Nossek, "Multiple parameter estimation with quantized channel output," in Int. ITG Workshop Smart Antennas (WSA), 2010, pp. 143–150.

[10] R. P. David and J. Cal-Braz, "Feedback-controlled channel estimation with low-resolution ADCs in multiuser MIMO systems," in IEEE Int. Conf. Acoust., Speech, Signal Process. (ICASSP), 2019, pp. 4674–4678.

[11] F. Liu, X. Shang, Y. Cheng, and G. Zhang, "Computationally efficient maximum likelihood channel estimation for coarsely quantized massive MIMO systems," IEEE Wireless Commun. Lett., vol. 26, no. 2, pp. 444–448, 2022.

[12] S. S. Thoota and C. R. Murthy, "Variational Bayes' joint channel estimation and soft symbol decoding for uplink massive MIMO systems with low resolution ADCs," IEEE Trans. Commun., vol. 69, no. 5, pp. 3467–3481, 2021.

[13] P. Sun, Z. Wang, R. W. Heath, and P. Schniter, "Joint channel-estimation/decoding with frequency-selective channels and few-bit ADCs," IEEE Trans. Signal Process., vol. 67, no. 4, pp. 899–914, 2019.

[14] C.-K. Wen, C.-J. Wang, S. Jin, K.-K. Wong, and P. Ting, "Bayes-optimal joint channel-and-data estimation for massive MIMO with low-precision ADCs," IEEE Trans. Signal Process., vol. 64, no. 10, pp. 2541–2556, 2016.

[15] L. Jacques, K. Degraux, and C. D. Vleeschouwer, "Quantized iterative hard thresholding: Bridging 1-bit and high-resolution quantized compressed sensing," in Proc. Conf. Sampling Theory Appl. (SampTA), 2013, p. 105–108.

[16] A. Kaushik, E. Vlachos, J. Thompson, and A. Perelli, "Efficient channel estimation in millimeter wave hybrid MIMO systems with low resolution ADCs," in 26th Eur. Signal Process. Conf. (EUSIPCO), 2018, pp. 1825–1829.

[17] J. Mo, P. Schniter, and R. W. Heath, "Channel estimation in broadband millimeter wave MIMO systems with few-bit ADCs," IEEE Trans. Signal Process., vol. 66, no. 5, pp. 1141–1154, 2018.

[18] H. Lee, Y.-S. Jeon, H. Do, and N. Lee, "Concatenated MMSE estimation for quantized OFDM systems," in IEEE Int. Conf. Commun., 2019, pp. 1–6.

[19] O. Dabeer and U. Madhow, "Channel estimation with low-precision analog-to-digital conversion," in IEEE Int. Conf. Commun., 2010, pp. 1–6.

[20] B. Fesl, M. Koller, and W. Utschick, "On the mean square error optimal estimator in one-bit quantized systems," IEEE Trans. Signal Process., vol. 71, pp. 1968–1980, 2023.

[21] J. J. Bussgang, "Crosscorrelation functions of amplitude-distorted Gaussian signals," MIT Res. Lab. Electron., Tech. Rep. 216, 1952.

[22] A. K. Fletcher, S. Rangan, V. K. Goyal, and K. Ramchandran, "Robust predictive quantization: Analysis and design via convex optimization," IEEE J. Sel. Topics Signal Process., vol. 1, no. 4, pp. 618–632, 2007.

[23] O. T. Demir and E. Bjornson, "The Bussgang decomposition of nonlinear systems: Basic theory and MIMO extensions [lecture notes]," IEEE Signal Process. Magazine, vol. 38, pp. 131–136, 2021.

[24] Y. Li, C. Tao, G. Seco-Granados, A. Mezghani, A. L. Swindlehurst, and L. Liu, "Channel estimation and performance analysis of one-bit massive MIMO systems," IEEE Trans. Signal Process., vol. 65, no. 15, pp. 4075–4089, 2017.

[25] S. Rao, G. Seco-Granados, H. Pirzadeh, J. A. Nossek, and A. L. Swindlehurst, "Massive MIMO channel estimation with low-resolution spatial sigma-delta ADCs," IEEE Access, vol. 9, pp. 109 320–109 334, 2021.

[26] E. Balevi, A. Doshi, A. Jalal, A. Dimakis, and J. G. Andrews, "High dimensional channel estimation using deep generative networks," IEEE J. Sel. Areas Commun., vol. 39, no. 1, pp. 18–30, 2021.

[27] B. Fesl, M. Koller, N. Turan, and W. Utschick, "Learning a low-complexity channel estimator for one-bit quantization," in 54th Asilomar Conf. Signals, Syst., Comput., 2020, pp. 393–397.

[28] Y. Zhang, M. Alrabeiah, and A. Alkhateeb, "Deep learning for massive MIMO with 1-bit ADCs: When more antennas need fewer pilots," IEEE Wireless Commun. Lett., vol. 9, no. 8, pp. 1273–1277, 2020.

[29] Y. Dong, H. Wang, and Y.-D. Yao, "Channel estimation for one-bit multiuser massive MIMO using conditional GAN," IEEE Commun. Lett., vol. 25, no. 3, pp. 854–858, 2021.

[30] N. Turan, B. Fesl, M. Koller, M. Joham, and W. Utschick, "A versatile low-complexity feedback scheme for FDD systems via generative modeling," IEEE Trans. Wireless Commun., early access, Nov. 14, 2023, doi: 10.1109/TWC.2023.3330902.

[31] M. Koller, B. Fesl, N. Turan, and W. Utschick, "An asymptotically MSE-optimal estimator based on Gaussian mixture models," IEEE Trans. Signal Process., vol. 70, pp. 4109–4123, 2022.

[32] N. Turan, B. Fesl, M. Grundei, M. Koller, and W. Utschick, "Evaluation of a Gaussian mixture model-based channel estimator using measurement data," in Int. Symp. Wireless Commun. Syst. (ISWCS), 2022, pp. 1–6.

[33] B. Fesl, M. Joham, S. Hu, M. Koller, N. Turan, and W. Utschick, "Channel estimation based on Gaussian mixture models with structured covariances," in 56th Asilomar Conf. Signals, Syst., Comput., 2022, pp. 533–537.

[34] B. Fesl, N. Turan, and W. Utschick, "Low-rank structured MMSE channel estimation with mixtures of factor analyzers," in 57th Asilomar Conf. Signals, Syst., Comput., 2023, to be published.

[35] M. Baur, B. Fesl, and W. Utschick, "Leveraging variational autoencoders for parameterized MMSE channel estimation," 2023, arXiv preprint: 2307.05352.

[36] M. Baur, B. Fesl, M. Koller, and W. Utschick, "Variational autoencoder leveraged MMSE channel estimation," in 56th Asilomar Conf. Signals, Syst., Comput., 2022, pp. 527–532.

[37] J. Max, "Quantizing for minimum distortion," IRE Trans. Inf. Theory, vol. 6, no. 1, pp. 7–12, 1960.

[38] L. Liu, S. Xue, Y. Ma, N. Yi, and R. Tafazolli, "On the design of quantization functions for uplink massive MIMO with low-resolution ADCs," in IEEE 93rd Veh. Technol. Conf., 2021, pp. 1–5.

[39] R. Gray and D. Neuhoff, "Quantization," IEEE Trans. Inf. Theory, vol. 44, no. 6, pp. 2325–2383, 1998.

[40] 3GPP, "Spatial channel model for multiple input multiple output (MIMO) simulations," 3rd Generation Partnership Project (3GPP), Tech. Rep. 25.996 (V16.0.0), Jul. 2020.

[41] D. Neumann, T. Wiese, and W. Utschick, "Learning the MMSE channel estimator," IEEE Trans. Signal Process., vol. 66, no. 11, pp. 2905–2917, Jun. 2018.

[42] S. Jaeckel, L. Raschkowski, K. Börner, and L. Thiele, "QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials," IEEE Trans. Antennas Propag., vol. 62, no. 6, pp. 3242–3256, 2014.

[43] S. Jaeckel, "Quasi-deterministic channel modeling and experimental validation in cooperative and massive MIMO deployment topologies," Ph.D. dissertation, Dept. Elect. Eng., Tech. Univ. Ilmenau, Ilmenau, Germany, 2017.

[44] A. Papoulis and S. U. Pillai, Probability, Random Variables and Stochastic Processes. McGraw-Hill Education, 2002.

[45] S. Jacobsson, G. Durisi, M. Coldrey, T. Goldstein, and C. Studer, "Quantized precoding for massive MU-MIMO," IEEE Trans. Commun., vol. 65, no. 11, pp. 4670–4684, 2017.

[46] G. Jacovitti and A. Neri, "Estimation of the autocorrelation function of complex Gaussian stationary processes by amplitude clipped signals," IEEE Trans. Inf. Theory, vol. 40, no. 1, pp. 239–245, 1994.

[47] W. J. Cody, "Rational Chebyshev approximations for the error function," Math. Comput., vol. 23, no. 107, pp. 631–637, 1969.

[48] P. Borjesson and C.-E. Sundberg, "Simple approximations of the error function Q(x) for communications applications," IEEE Trans. Commun., vol. 27, no. 3, pp. 639–643, 1979.

[49] C. M. Bishop, Pattern Recognition and Machine Learning (Information Science and Statistics). Springer New York, 2006.

[50] W. Pan and X. Shen, "Penalized model-based clustering with application to variable selection," J. Mach. Learn. Research, vol. 8, no. 41, pp. 1145–1164, 2007.

[51] K. P. Murphy, Machine Learning: A Probabilistic Perspective. The MIT Press, 2012.

[52] D. P. Kingma and M. Welling, "Auto-encoding variational Bayes," in Proc. 2nd Int. Conf. Learn. Represent., 2014, pp. 1–14.

[53] D. J. Rezende, S. Mohamed, and D. Wierstra, "Stochastic backpropagation and approximate inference in deep generative models," in Proc. 31st Int. Conf. Mach. Learn., vol. 32, no. 2, 2014, pp. 1278–1286.

[54] B. Fesl, N. Turan, M. Joham, and W. Utschick, "Learning a Gaussian mixture model from imperfect training data for robust channel estimation," IEEE Wireless Commun. Lett., vol. 12, no. 6, pp. 1066–1070, 2023.

[55] S. Dirksen, J. Maly, and H. Rauhut, "Covariance estimation under one-bit quantization," Proc. Appl. Math. Mech., vol. 21, no. 1, 2021.

[56] Y.-H. Xiao, L. Huang, D. Ramírez, C. Qian, and H. C. So, "One-bit covariance reconstruction with non-zero thresholds: Algorithm and performance analysis," 2023, arXiv preprint: 2303.16455.

[57] A. Eamaz, F. Yeganegi, and M. Soltanalian, "Covariance recovery for one-bit sampled non-stationary signals with time-varying sampling thresholds," IEEE Trans. Signal Process., vol. 70, pp. 5222–5236, 2022.

[58] T. Yang, J. Maly, S. Dirksen, and G. Caire, "Plug-in channel estimation with dithered quantized signals in spatially non-stationary massive MIMO systems," IEEE Trans. Commun., early access, Sept. 22, 2023, doi: 10.1109/TCOMM.2023.3317906.

[59] Y. Xu and E. W. Cheney, "Strictly positive definite functions on spheres," Proc. Amer. Math. Soc., vol. 116, no. 4, pp. 977–981, 1992.

[60] B. Hassibi and B. Hochwald, "How much training is needed in multiple-antenna wireless links?" IEEE Trans. Inf. Theory, vol. 49, no. 4, pp. 951–963, 2003.

[61] M. D. McDonnell, N. G. Stocks, C. E. M. Pearce, and D. Abbott, Stochastic Resonance: From Suprathreshold Stochastic Resonance to Stochastic Signal Quantization. Cambridge University Press, 2008.

[62] B. Böck, M. Baur, V. Rizzello, and W. Utschick, "Variational inference aided estimation of time varying channels," in IEEE Int. Conf. Acoust., Speech, Signal Process. (ICASSP), 2023, pp. 1–5.

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2309.04014v2 的全文中文译稿，按原文结构译出摘要与关键词、第 I 节引言（含四项贡献与符号说明）、第 II 节预备知识（系统模型、量化器设计、信道模型、训练数据集）、第 III 节 Bussgang 估计器、第 IV 节参数化 Bussgang 信道估计器（含引理 1、GMM/MFA/VAE 三种变体）、第 V 节"从量化导频观测中学习"（含协方差恢复与算法 1、VAE 损失适配）、第 VI 节基线、第 VII 节内存与复杂度分析（表 I）、第 VIII 节可达速率下界（式 33）、第 IX 节仿真结果（图 2—图 8）、第 X 节结论、第 XI 节致谢、附录 A（引理 1 的证明，式 34—39）、图注与表注，以及 62 条英文原书目。公式覆盖原文式 (1)—(39) 与算法 1（18 行）。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言前半）→ 第 2 页（引言后半、第 II-1 节、式 (1)）→ 第 3 页（式 (2)—(6)、第 II-2—II-4 节）→ 第 4 页（第 III 节、式 (7)—(13)、第 IV 节与引理 1）→ 第 5 页（式 (14)—(22)、第 IV-A 节）→ 第 6 页（第 IV-A 节末、IV-B、IV-C、图 1、式 (23)—(26)）→ 第 7 页（式 (27)—(29)、第 V 节与 V-A）→ 第 8 页（式 (30)—(32)、算法 1、第 V-B 节）→ 第 9 页（第 VI 节、第 VII 节、表 I、第 VIII 节、式 (33)）→ 第 10 页（图 2、第 IX-A 节、IX-B 节前半）→ 第 11 页（图 3—图 5、IX-B 节）→ 第 12 页（图 6—图 7、IX-B 节）→ 第 13 页（图 8、IX-B 节末、第 X 节结论）→ 第 14 页（致谢、附录 A、参考文献 [1]—[28]）→ 第 15 页（参考文献 [29]—[62]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；公式已按 PDF 文本层与第 2—14 页渲染图交叉核对（式 (5)、(8)—(13)、(16)、(21)、(22)、(26)—(32)、(34)—(39)、算法 1 与表 I 均对照渲染图逐项核对）。
2. 表 I 为源 PDF 第 10 页排版表格，文本层抽取后行列错位；本页表格依据该页渲染图像逐格转录（含示例数值 $2.62\cdot10^{5}$ 等与在线复杂度记号），未改变任何数值。
3. 图 1—图 8 均未上传图片，仅提供中文图注与正文关键数值；图 2—图 8 的曲线不作数字化估算。
4. 原文第 6 页图 1 的架构标注（编码器/解码器分布、重参数化）按渲染图核对后写入图注；图 1 中部分小字标注在文本层缺失，图注仅复述可确认信息。
5. **原文疑点 1：** 式 (12) 的求和中重复使用了指标 $i$（同时作为量化电平求和指标与 $[\mathbf C_{r}]_{i,i}$ 的对角元指标），属原文记号冲突；本页按原文照录，未改动。
6. **原文疑点 2：** 第 IX-A 节正文称协方差恢复估计器"适用于任意给定 $B>2$ 的量化比特数"，但同节图 2 与第 IX-B 节图 8 的曲线包含 $B=2$ 的结果，且第 V-A 节推导对 $B>1$ 均适用（$B=2$ 时每实/虚部各有 1 个方程，属恰定而非超定）。原文表述存在轻微不一致，已照录并在正文相应处标注，未擅自修改结论。
7. 原文第 IX-B 节一处引号不配对（原文写作 `"V AE R`，缺少右侧引号），译文按语义补全为 "VAE R"。
8. 日期说明：页面文件名与目录按站点归档日期 2026-10-05，而原文 v1 提交于 2023 年 9 月、v2 于 2023-12-18 发布（PDF 首页左侧 arXiv 标记）；页首"版本"采用 v2 的信息，特此说明。
9. 版权：本文为作者提交至 IEEE 的预印本（arXiv:2309.04014v2，eess.SP），页面注明"This work has been submitted to the IEEE for possible publication. Copyright may be transferred without notice"；本页为中文翻译页面，未上传原文 PDF，引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
