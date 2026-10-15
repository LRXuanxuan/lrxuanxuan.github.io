---
layout: page
title: "FTN 耦合干扰建模与迭代检测｜中文译稿（校对中）"
permalink: /papers/translations/2026-10-15-ftn-coupled-interference/
math: true
toc: true
---

{% raw %}
> 用户提供的中文译稿，保留原文件的校对进度和缺项说明；尚未完成逐句、逐式全文验收。

[对应论文与推荐证据](/papers/items/0995fadc98ae06dc/) · [原论文](https://doi.org/10.1109/TWC.2026.3666648)

**原题**：Coupled-Interference Modeled FTN Signaling Over Doubly Selective Fading Channels: Joint Subpath Recovery and Iterative Detection  
**作者**：Qiang Li、Yan Wang、Liping Li、Yingsong Li、Xingwang Li、Kai-Kit Wong、Chau Yuen  
**来源**：IEEE Transactions on Wireless Communications，2026，第 25 卷，12613–12629；DOI：10.1109/TWC.2026.3666648。  
**发布状态**：用户提供中文译稿；校对中，未计入全文验收。
**进度**：摘要、第一章，第二至四章核心正文与公式、第五章部分仿真说明已译；论文第 11 式与第 31 式的带状矩阵、算法 1 的逐行排版及实验表格仍需与原 PDF 校对；第 VI 章结论已补译。**不是经逐式核对的终版全译。**

## 摘要

超奈奎斯特（faster-than-Nyquist，FTN）技术有望提高无线通信容量和频谱效率。然而，在双选择性衰落（doubly-selective fading，DSF）信道中，现有 FTN 研究通常把信道引起的符号间干扰（channel-ISI）与 FTN 引起的符号间干扰（FTN-ISI）分开处理，以简化干扰消除。实际 DSF 场景中，两类 ISI 存在固有耦合，导致传统检测算法的性能明显下降。

为解决这一问题，本文首先推导适用于 DSF 信道的实际 FTN 传输模型，并构造对应的耦合干扰矩阵。考虑到数据检测依赖于高效信道估计，本文提出一种联合恢复可分辨子径参数的信道估计算法：把传播路径分解为具有独立时延–多普勒特性的可分辨子径，通过联合优化增益和相位提高估计精度。

最后，基于推导出的收发机模型和耦合干扰矩阵，提出一种白化增强正交近似消息传递（whitening-enhanced orthogonal approximate message passing，WE-OAMP）算法。它在保持频谱紧凑性的同时，通过迭代线性–非线性估计抑制耦合干扰。该算法根据 FTN-ISI 矩阵构造白化矩阵，抑制噪声相关性，随后交替执行线性与非线性估计完成检测。仿真表明，WE-OAMP 在误比特率（BER）方面优于对照算法，尤其适用于编码系统。本文还推导了使用 WE-OAMP 检测时 FTN 信号的可达容量，证明其相对于奈奎斯特系统可以获得容量改善。

**索引词**：信道估计；数据检测；双选择性衰落信道；超奈奎斯特信号；符号间干扰；迭代检测。

## I. 引言

未来无线网络对更大容量和更高频谱效率的需求持续增长 [1]–[3]。早在上世纪，Lucky 就提出了 FTN 传输，其目标是在不额外占用带宽的情况下提升系统容量 [4],[5]。然而，当时数字信号处理技术的能力不足，难以承担 FTN 所引入的计算复杂度，这一技术因此沉寂数十年。直到 Liveris 和 Georghiades 将平方根升余弦（SRRC）滤波器引入 FTN 成形，FTN 技术才重新受到关注 [6]。

### A. 低移动性场景中的进展

FTN 在利用符号压缩优势的同时不再严格满足奈奎斯特准则，因此会引入符号间干扰（ISI）[7]–[9]。针对 FTN-ISI，研究者提出多种消除方法。例如，Sugiura 等通过循环前缀/后缀（CP/CS），将 FTN-ISI 矩阵变换为循环矩阵，使接收信号能够利用傅里叶变换进入频域，进而通过频域均衡（FDE）消除 FTN-ISI [10]。FDE 虽然能减轻干扰，却会同时放大噪声，导致 BER 恶化。

为缓解这一问题，研究者使用奇异值分解预编码、特征值分解预编码、G-to-minus-half（GTMH）预编码及 Cholesky 预编码等线性预编码方法消除 FTN-ISI，改善 BER [11]–[15]。此外，文献 [16] 不仅引入 Tomlinson–Harashima（TH）预编码，而且利用谱因子分解，把 Ungerboeck 模型 [17] 中的 FTN-ISI 因子序列转换为 Forney 模型 [18]，以设计线性预均衡器（LPE）和数字白化滤波器来抑制 FTN-ISI，取得良好的 BER 性能。

上述消除干扰的方法主要面向加性白高斯噪声（AWGN）等静态信道。为在低移动性场景中实现 FTN 传输，一些工作开始研究频率选择性衰落（FSF）信道。Ishihara 和 Sugiura 根据最小均方误差（MMSE）准则估计信道，结合软判决 FDE，有效抑制 FTN-ISI 和信道诱导的 ISI [19]。文献 [20] 在没有 CP/CS 的条件下采用广义近似消息传递（GAMP）均衡器，联合完成信道估计与数据检测。文献 [21] 利用 CP/CS 构造循环 FTN-ISI 矩阵和信道-ISI 矩阵，再以 GTMH 预编码进行信道估计与数据检测，进一步改善精度。此后，文献 [22] 使用 LPE 与数字白化滤波器抑制 FTN-ISI，在 FSF 信道下以线性 MMSE（LMMSE）估计信道，并通过 FDE 完成检测。

### B. 高移动性场景中的进展

随着车联网、物联网及自主航空器通信等高移动性场景日益普遍，无线信道不仅具有更明显的多径效应，也具有显著的多普勒频移。这些挑战促使 FTN 研究转向 DSF 信道：原本为 FSF 信道下的 FTN 传输设计的传统检测算法，难以继续保持性能优势。因此，需要开发适应 DSF 信道的新型检测算法。

文献 [23] 把 DSF 信道的 FTN 检测建模为线性状态空间模型，仅近似考虑相邻频域符号之间的干扰，并在向量形式因子图上实施高斯消息传递，提出低复杂度接收机设计。随后，文献 [24] 针对 MMSE 均衡器在处理频域干扰时的高复杂度，采用基于均值场与 Bethe 近似的变分方法，在保持检测性能的同时降低计算量。

不过，数据检测依赖于信道状态信息（CSI）的估计。文献 [25] 利用低复杂度的线性插值，跟踪帧内数据信号位置的信道系数，并结合基于线性软输入软输出 MMSE 均衡器的 Turbo 均衡技术进行检测。文献 [26] 进一步提出基于索引调制（IM）的改进线性插值估计方法：将额外信息比特嵌入导频序列的位置，并通过导频位置识别算法提高频谱效率。近期，文献 [27] 提出基于神经网络的端到端架构，联合优化 FTN 波形、数据检测器及 DSF 信道估计器，以最大化频谱效率。文献 [28] 则将 FTN 与 OTFS 调制结合，利用特征值分解消除干扰，并在总发射功率约束下优化功率分配系数以最大化互信息。

### C. 研究动机与主要贡献

现有 DSF 信道 FTN 估计与检测方法通常分开处理 channel-ISI 和 FTN-ISI，以便消除干扰。然而，实际 DSF 信道中，两类干扰本质上相互耦合，难以完全分离，使现有检测算法的性能下降。同时，DSF 信道中的线性插值估计虽计算量较小，但估计精度不高 [25]；文献 [26] 中的 IM 改进方案虽通过优化导频设计提高了频谱效率，却以一定的信道估计精度损失为代价。

因此，本文首先推导 DSF 信道 FTN 传输的实际系统模型，构造耦合干扰矩阵。由于该矩阵既不是循环矩阵，也不是对称矩阵，已有的低复杂度 FTN 检测方法不再有效。为此，提出一种抑制耦合干扰的迭代检测算法，在保持原始符号分布的同时，有效减轻噪声放大。它基于 OAMP [29] 思想，在**线性估计模块（LE）**和**非线性估计模块（NLE）**之间传递消息。本文主要贡献如下。

1. 依据 DSF 信道响应的时变特性，推导符合实际传播过程的 FTN 传输模型：确保 DSF 信道对 FTN 成形脉冲产生的时间平移与信道时延一致。由此揭示 FTN-ISI 与信道-ISI 矩阵不可分离，并构造 DSF 条件下的耦合干扰矩阵。这与 FSF 信道的 FTN 模型有显著不同：后者在一定时间内的路径增益基本恒定，允许分开考虑两种 ISI。
2. 提出联合恢复可分辨子径参数的 DSF 信道估计算法（JRRSP）。将每条传播路径表示为若干具有独立时延–多普勒特性的可分辨子径，结合子径增益、相位参数与导频携带的 CSI 构造目标函数。通过多变量协同优化联合估计符合目标函数的子径参数，并引入 L2 正则项平衡噪声敏感性、降低过拟合风险。最后利用估计的子径参数重建 CSI。与已有估计方法相比，该算法显著降低信道估计归一化均方误差（NMSE）。
3. 基于耦合干扰矩阵提出 WE-OAMP 算法，降低噪声放大。首先使用 FTN-ISI 矩阵构建白化矩阵以抑制噪声相关性，再于 LE 模块采用 LMMSE 检测器去相关符号、保证误差独立性；把 LE 的后验误差和均值作为外信息送入 NLE 模块，逐符号检测以去除噪声。此外，通过推导 WE-OAMP FTN 系统的可达容量，说明与非 FTN 系统相比，在不引入频谱扩展的前提下能提高容量；仿真显示其 BER 优于已有检测算法。

文章其余安排如下：第二章为 DSF 信道 FTN 系统模型；第三章提出信道估计算法；第四章说明迭代检测机制及流程并分析复杂度；第五章给出仿真；第六章总结。

**记号**：粗体小写和大写分别为向量与矩阵；$\mathbb E(\cdot)$ 为期望，$\Re(\cdot)$ 为复数实部，$\lfloor\cdot\rfloor$ 为下取整，$\Pr(\cdot)$ 表示概率，$\propto$ 为正比，$\|\mathbf x\|_2$ 为欧氏范数，$\mathcal{CN}(\mu,\Sigma)$ 为均值 $\mu$、方差（或协方差）$\Sigma$ 的复高斯分布。$(\cdot)^T$、$(\cdot)^*$、$(\cdot)^H$ 分别为转置、共轭和共轭转置；$\otimes$ 表示线性卷积，$x_1\bmod x_2$ 为取模，$[x_i]_{i=N_1}^{N_2}$ 为按顺序构成的列向量。原文表 I 列出主要符号定义。

## II. 系统模型

本节推导 DSF 信道 FTN 实际传输的系统模型，框图见图 1。为便于收发机模型推导，暂不考虑主要用于信道估计和数据检测的帧构造模块；其具体设计见第三章。

发送的信息比特先经过编码与映射，形成符号序列 $\mathbf a=[a_n]_{n=0}^{N-1}$，$N$ 为序列长度；随后送入 FTN 成形模块。该模块由 $M$ 倍上采样和采样因子为 $Q$ 的 SRRC 滤波器组成。符号压缩率（packing ratio）$\tau=M/Q$，$0<\tau\le1$，决定 FTN 的符号压缩程度；当 $\tau=1$ 时系统退化为奈奎斯特传输。成形信号为

$$
s(t)=\sum_{n=0}^{N-1}a_n c(t-n\tau T_0),\tag{1}
$$

其中 $T=\tau T_0$ 为 FTN 符号间隔，$T_0$ 为奈奎斯特符号间隔。式（1）反映了连续时间的实际符号压缩；$c(t)$ 为单位能量 SRRC 脉冲，即 $\int_{-\infty}^{+\infty}|c(t)|^2dt=1$。

在忽略噪声时，信号通过 DSF 信道的接收表达式为

$$
\begin{aligned}
y(t)&=\int h(t,\gamma)s(t-\gamma)\,d\gamma\\
&=\sum_{\varsigma\in\mathcal L}\sum_{u\in\mathcal U_\varsigma}\psi_\varsigma(u)e^{j2\pi\phi_u(t-\gamma_\varsigma)}s(t-\gamma_\varsigma)\\
&=\sum_{\varsigma\in\mathcal L}\widehat\psi_\varsigma(t)\sum_{n=0}^{N-1}a_nc(t-\gamma_\varsigma-n\tau T_0),
\end{aligned}\tag{2}
$$

其中 $\gamma$ 为时延；$\varsigma$、$u$ 分别为归一化时延和归一化多普勒频移；$\gamma_\varsigma$ 和 $\phi_u$ 为对应的实际传播时延和多普勒频移；$\mathcal L$ 为不同归一化时延构成的集合，$\mathcal U_\varsigma$ 为对应多普勒集合；$\psi_\varsigma(u)$ 是时延抽头 $\varsigma$ 上多普勒 $u$ 对应的复信道增益，且 $\widehat\psi_\varsigma(t)=\sum_{u\in\mathcal U_\varsigma}\psi_\varsigma(u)e^{j2\pi\phi_u(t-\gamma_\varsigma)}$。

连续 DSF 信道冲激响应为

$$
h(t,\gamma)=\sum_{\varsigma\in\mathcal L}\sum_{u\in\mathcal U_\varsigma}\psi_\varsigma(u)e^{j2\pi\phi_u(t-\gamma_\varsigma)}\delta(\gamma-\gamma_\varsigma),\tag{3}
$$

其中 $\delta(\cdot)$ 为 Dirac 函数。

接收信号 $y(t)$ 首先由模数转换器以 $T/M$ 的时间间隔采样，这是 FTN 的采样间隔。由于采样仅在 $t=mT/M$、$0\le m\le NM-1$ 进行，匹配滤波输出可以在采样点上写成离散和：

$$
\begin{aligned}
r(t)&=\sum_{m=0}^{NM-1}y\left(m\frac TM\right)c^*\left(m\frac TM-t\right)\\
&=\sum_{m=0}^{NM-1}\sum_{n=0}^{N-1}a_n\sum_{\varsigma\in\mathcal L}
\widehat\psi_\varsigma\left(m\frac TM\right)
 c\left(m\frac TM-\gamma_\varsigma-n\tau T_0\right)c^*\left(m\frac TM-t\right).
\end{aligned}\tag{4}
$$

对匹配滤波输出降采样，接收端第 $j$ 个符号为

$$
\begin{aligned}
r_j&=\sum_{n=0}^{N-1}a_n\sum_{\varsigma\in\mathcal L}\sum_{m=0}^{NM-1}
\widehat\psi_\varsigma\left(m\frac TM\right)\\
&\quad\times c\left(m\frac TM-\gamma_\varsigma-n\tau T_0\right)
 c^*\left(m\frac TM-j\tau T_0\right),
\end{aligned}\tag{5}
$$

其中 $\gamma_\varsigma=\varsigma T/M$。对于低多普勒的准静态信道（如 FSF），式（5）中的 $\widehat\psi_\varsigma(mT/M)$ 关于 $m$ 基本不变，因此可记为常数 $\widehat\psi_\varsigma$；但在 DSF 信道中，这一时间不变性一般不成立，因而不能直接将 FTN-ISI 与信道-ISI 拆分。

**图 1**：包含信道估计模块的 DSF 信道 FTN 系统方框图；**表 I**：关键符号及其定义，请参看原文第 3 页。下文继续准静态与 DSF 信道之间的区别。


对于低多普勒准静态信道，式（5）可通过卷积性质重写为

$$
\begin{aligned}
r_j&=\sum_{n=0}^{N-1}a_n\sum_{\varsigma\in\mathcal L}
\widehat\psi_\varsigma
\sum_{m=0}^{NM-1}c(mT/M-\gamma_\varsigma-n\tau T_0)c^*(mT/M-j\tau T_0)\\
&=\sum_{n=0}^{N-1}a_n\sum_{\varsigma\in\mathcal L}
\widehat\psi_\varsigma g(j\tau T_0-\gamma_\varsigma-n\tau T_0),
\end{aligned}\tag{6}
$$

其中 $g(t)=c(t)\otimes c^*(-t)$ 为升余弦滤波器。此时 FTN-ISI 与准静态 channel-ISI 可分别处理，接收向量写为

$$
\mathbf r=\widehat{\mathbf\Psi}\mathbf G\mathbf a,\tag{7}
$$

$\widehat{\mathbf\Psi}\in\mathbb C^{N\times N}$ 是准静态信道矩阵，$\mathbf G\in\mathbb R^{N\times N}$ 是 FTN-ISI 矩阵。因此，两类 ISI 可以分别补偿 [19]、[21]。

但本文关心的是路径增益随 $m$ 变化的 DSF 信道，不能将式（5）中的 $\widehat\psi_\varsigma(mT/M)$ 看作常量，也无法利用卷积直接得到 $g(j\tau T_0-\gamma_\varsigma-n\tau T_0)$。相应地，式（5）应整理为

$$
r_j=\sum_{n=0}^{N-1}a_n D_{j,n},\tag{8}
$$

其中

$$
D_{j,n}=\sum_{\varsigma\in\mathcal L}\sum_{m=0}^{NM-1}
\widehat\psi_\varsigma(mT/M)
 c(mT/M-\gamma_\varsigma-n\tau T_0)
 c^*(mT/M-j\tau T_0).\tag{9}
$$

按 $D_{j,n}$ 形成干扰矩阵后，接收向量为

$$
\mathbf r=\mathbf D\mathbf a,\qquad \mathbf D\in\mathbb C^{N\times N}.\tag{10}
$$

$\mathbf D$ 是 DSF 信道与 FTN 成形相互作用产生的**耦合干扰矩阵**，不能像式（7）那样分解为 $\widehat{\mathbf\Psi}\mathbf G$。原文式（11）在下一页底部以带状矩阵显示；其元素由式（9）确定，单侧耦合干扰跨度记 $L_c$，单侧 FTN-ISI 因子跨度记 $v$。**式（11）的整个带状矩阵排版仍需以 PDF 原图核对**。DSF 下缺乏循环性和对称性，这也使已有低复杂度检测方法性能下降，因而第四章提出 WE-OAMP。

## III. 基于可分辨子径参数联合恢复的信道估计

插值法在 DSF 信道下容易实现，但通常产生较高 NMSE。为改善精度，本文提出联合恢复可分辨子径参数（joint recovery of resolvable subpath parameters，JRRSP）的估计方法。**导频在 FTN 成形之后插入，信道估计在匹配滤波器之前实施**，使导频只承受信道引起的 ISI，而不受 FTN-ISI 影响。原因有二：若导频参与 FTN 成形，则接收端需要先降采样，难以恢复采样间隔 $T/M$ 上的时变路径增益；此外，成形导频的计算还依赖未知信道时延 $\gamma_\varsigma$，在先估计信道之前无法直接构造所需脉冲。

### A. 双选择性衰落信道模型

假设有 $L_h$ 条显著的传播路径，第 $l$ 条路径在 $t$ 时刻的增益为 $h_l(t)$，传播时延为 $\gamma_l$。相近时延的多径分量被聚为同一抽头 [30]，所以

$$
h(t,\gamma)=\sum_{l=0}^{L_h-1}h_l(t)\delta(\gamma-\gamma_l).\tag{12}
$$

令 $\mathcal L=[\varsigma_l]$ 为这些路径对应的归一化时延集合，$\mathcal U_\varsigma$ 为给定时延对应的归一化多普勒集合。于是路径增益表示为

$$
h_l(t)=\sum_{u\in\mathcal U_\varsigma}
\psi_\varsigma(u)e^{j2\pi\phi_u(t-\gamma_\varsigma)},
\quad \varsigma\in\mathcal L,\tag{13}
$$

其中 $\phi_u=u/(LT)$，$\gamma_\varsigma=\varsigma T/M$；$1/(LT)$ 与 $T/M$ 分别为多普勒分辨率和时延分辨率 [31]。将式（13）代入（12），得

$$
h(t,\gamma)=\sum_{\varsigma\in\mathcal L}
\sum_{u\in\mathcal U_\varsigma}
\psi_\varsigma(u)e^{j2\pi\phi_u(t-\gamma_\varsigma)}
\delta(\gamma-\gamma_\varsigma).\tag{14}
$$

以 $T/M$ 采样，可得离散时延–时间响应

$$
h(m,\ell)=\sum_{u\in\mathcal U_\ell}
\psi_\ell(u)z^{u(m-\ell)},\tag{15}
$$

$z$ 为与归一化多普勒分辨率相关的相位因子。**原文式（15）中的 $z$ 指数归一化系数在 PDF 的文本提取中有歧义，此处不擅自填入未核实的分母。** 令最大时延抽头为 $\varepsilon=\max\mathcal L$。

### B. 带导频的数据帧结构

图 2 展示了数据帧结构。FTN 成形后的序列被划分为 $\lfloor N/L\rfloor$ 个数据块，各块后插入长度为 $2\varepsilon+1$ 的导频块 $\mathbf p=[p_0,\ldots,p_{2\varepsilon}]$，其中只有第 $\varepsilon+1$ 个位置（索引 $\varepsilon$）非零。前面的 $\varepsilon$ 个零值用于隔离数据块干扰，最后 $\varepsilon+1$ 个位置承载可提取的 CSI。发射序列的开头额外加入一个用于初始化估计的导频尾部，使最终序列长度为

$$
N_f=MN+(2\varepsilon+1)\lfloor N/L\rfloor+\varepsilon+1.
$$

导频在经过信道后，其时域输出满足

$$
\widehat p(t)=\int h(t,\theta)p(t-\theta)\,d\theta.\tag{16}
$$

以 $T/M$ 采样，第 $\kappa$ 个导频块的输入输出关系为

$$
\widehat p_m^{(\kappa)}
=\sum_{\ell\in\mathcal L}
\sum_{u\in\mathcal U_\ell}
\psi_\ell(u)z^{u(m-\ell)}p_{m-\ell}^{(\kappa)},\tag{17}
$$

其中 $1\le\kappa\le\lfloor N/L\rfloor+1$，对于单个导频块 $m=0,\ldots,2\varepsilon$。

### C. JRRSP 信道估计算法

设置第 $\varepsilon+1$ 个导频元素 $p_\varepsilon=\eta=\sqrt{2\varepsilon+1}$，其余为零。令 $\Psi_m^\ell=\sum_{u\in\mathcal U_\ell}\psi_\ell(u)z^{u(m-\ell)}$，则

$$
\widehat p_m^{(\kappa)}
=\sum_{\ell\in\mathcal L}\Psi_m^\ell p_{m-\ell}^{(\kappa)}.\tag{18}
$$

写成矩阵形式

$$
\widehat{\mathbf p}_\kappa=\mathbf\Psi\mathbf p_\kappa.\tag{19}
$$

图 3 说明非零脉冲导频在传播后如何提取不同延迟抽头，因此可以从输出导频块最后 $\varepsilon+1$ 个元素 $\widehat{\mathbf p}'_\kappa$ 中恢复

$$
\boldsymbol\psi_\kappa=
\widehat{\mathbf p}'_\kappa/\eta
=[\Psi_\varepsilon^0,\Psi_{\varepsilon+1}^1,
\ldots,\Psi_{2\varepsilon}^\varepsilon]^T.\tag{20}
$$

共计有 $\lfloor N/L\rfloor+1$ 个导频块，却只有 $\lfloor N/L\rfloor$ 个数据块，第一个导频块不对应数据块。令 $N_p=MN/\lfloor N/L\rfloor+2\varepsilon+1$。把不同导频块提取的 CSI 依列排列，构造

$$
\mathbf\Theta=[\boldsymbol\psi_0,\boldsymbol\psi_1,
\ldots,\boldsymbol\psi_{\lfloor N/L\rfloor}]
\in\mathbb C^{(\varepsilon+1)\times(\lfloor N/L\rfloor+1)}.\tag{21}
$$

JRRSP 的核心在于同时恢复子径的复增益 $\psi_\ell(u)$ 与多普勒相位 $z^u$。二者都与 $u$ 有关，每个时延抽头共需确定 $2U$ 个子径参数，故利用 $\mathbf\Theta$ 中的 $2U$ 个估计值构造方程组。令第 $\nu$ 个参数为

$$
q^{(\nu)}=\begin{cases}
x^{(\nu)},&\nu\bmod2=0,\\
w^{(\nu)},&\nu\bmod2=1,
\end{cases}\tag{22}
$$

其中偶数索引表示增益，奇数索引表示相位基底。原文将方程组表示为 $\boldsymbol\vartheta=\mathbf W\mathbf x$，$\mathbf W$ 是以 $w^{(1)},w^{(3)},\ldots$ 为底数构造的 Vandermonde 型矩阵，$\mathbf x=[x^{(0)},x^{(2)},\ldots]^T$：

$$
\begin{bmatrix}\vartheta_0\\\vartheta_1\\\vdots\\\vartheta_V\end{bmatrix}
=
\begin{bmatrix}
(w^{(1)})^0&(w^{(3)})^0&\cdots&(w^{(V)})^0\\
(w^{(1)})^1&(w^{(3)})^1&\cdots&(w^{(V)})^1\\
\vdots&\vdots&&\vdots\\
(w^{(1)})^V&(w^{(3)})^V&\cdots&(w^{(V)})^V
\end{bmatrix}
\begin{bmatrix}x^{(0)}\\x^{(2)}\\\vdots\\x^{(V-1)}\end{bmatrix},
\quad V=2U-1.\tag{23}
$$

参数估计可能出现病态性：特别是指数项很大时，噪声扰动会严重放大。为改善稳定性，定义残差

$$
\mathbf F(\mathbf x)=\mathbf W\mathbf x-\boldsymbol\vartheta,\tag{24}
$$

并加入 L2 正则。原文的参数向量写作 $\mathbf q=[x^{(0)},w^{(1)},\ldots,x^{(2U-2)},w^{(2U-1)}]$，目标为

$$
\min_{\mathbf q}
\|\mathbf F(\mathbf x)\|_2^2+\lambda\|\mathbf q\|_2^2.\tag{25}
$$

高 SNR 时选择较小 $\lambda$ 以降低对原始测量拟合的干扰；低 SNR 时选较大 $\lambda$ 以压制噪声放大。文中同时讨论参数与噪声功率之间的关系，实际采用随 SNR 调整的正则强度。联合优化后，将参数重新代入（15）构造整个时间序列的 CSI。

为提升稳健性，从 $\mathbf\Theta$ 的同一行提取长度 $2U$ 的滑动窗口：先以行内前 $2U$ 个测量估计一次，再从第二个位置开始估计下一次，直至遍历全行。若某窗口不可求解，用最近的有效估计填补；最后平均不同窗口的重建结果，形成时延抽头 $\omega$ 的估计 $\widehat{\boldsymbol\vartheta}_\omega$。对 $\omega=0,\ldots,\varepsilon$ 重复，形成整体 CSI 矩阵 $\widehat{\mathbf\Theta}$。原文**算法 1**列出按路径、窗口、时间和子径循环的完整伪代码，并以理想 CSI $\mathbf\Theta'$ 计算逐径 NMSE 和总 NMSE；算法中 $\mathrm{mean}$、$\mathrm{sum}$ 和 $\mathrm{abs}$ 分别为均值、求和与绝对值，$\mathbf0_{i\times j}$ 是零矩阵。**逐行伪代码尚未重排，本段为原文步骤的忠实中文转述。**

## IV. 抑制耦合干扰的迭代检测

### A. 分块传输的 DSF-FTN 系统

第二章不分块的数据传输会导致较高的计算成本。为此，图 4 把发送序列切成 $\lfloor N/L\rfloor$ 个长度为 $L$ 的数据块 $\mathbf a_k=[a_{kL+i}]_{i=0}^{L-1}$。各块前后分别插入循环前缀（CP）与循环后缀（CS），以避免 FTN 成形与 DSF 信道造成的块间干扰。耦合干扰总跨度为 $L_d$，与原式（9）中最大时延 $\varepsilon$ 有关；令 $L_c=L_d-v$。CP 与 CS 总长度满足 $L_{\rm cps}\ge L_d$，本文取 $L_{\rm cps}=L_d$。每个扩展块长度为 $L_b=L+L_d$。

这一部分不讨论插入导频的帧结构，而只分析数据块的 FTN 传输。经过成形的第 $k$ 块第 $j$ 个位置为

$$
s_{k,j}=\sum_{i=0}^{L_b-1}b_{k,i}c(j\tau T_0-i\tau T_0),
\quad0\le j<L_b.\tag{26}
$$

经过 DSF 信道、匹配滤波和降采样后，第 $k$ 个接收块可写成

$$
r_{k,j}=\sum_{i=0}^{L_b-1}b_{k,i}D_{j,i}^{\prime(k)},\tag{27}
$$

其中 $D_{j,i}^{\prime(k)}$ 由第 $k$ 块对应的时变路径增益、发送成形脉冲与接收匹配滤波脉冲共同决定；原文式（28）给出与式（9）同型的全序列求和：

$$
D'_{j,i}=\sum_{\varsigma\in\mathcal L}
\sum_{m=0}^{MN_s-1}\widehat\psi_\varsigma(mT/M)
 c(mT/M-\gamma_\varsigma-i\tau T_0)
 c^*(mT/M-j\tau T_0).\tag{28}
$$

由此，第 $k$ 个接收块及其 CP/CS 去除后的数据分别为

$$
\mathbf r_k=\mathbf D'_k\mathbf b_k,\tag{29}
$$

$$
\mathbf y_k=\widehat{\mathbf D}_k\mathbf a_k,
\quad\widehat{\mathbf D}_k\in\mathbb C^{L\times L}.\tag{30}
$$

尽管每个块的 $\widehat{\mathbf D}_k$ 数值不同，其带状结构相同，见原文式（31）。合并接收块得到

$$
\mathbf y=\widehat{\mathbf D}\mathbf a.\tag{32}
$$

CP/CS 有效消除了块间干扰，使 $\widehat{\mathbf D}$ 具有分块对角结构（图 5），因而改善后续检测。

### B. 白化增强 OAMP（WE-OAMP）

设各发送符号独立同分布。图 6 展示了 LE 与 NLE 两个模块交换外信息的迭代架构。分别用上标 $f,p,e$ 表示先验、后验、外信息；LE、NLE 为模块类型。本文的算法输入包括估计出的 CSI $\widehat{\mathbf\Theta}$ 和白化接收块 $\widehat{\mathbf y}_k$，由前者可计算耦合矩阵 $\widehat{\mathbf D}_k$。

考虑噪声后，式（30）改写为

$$
\mathbf y_k=\widehat{\mathbf D}_k\mathbf a_k+\boldsymbol\Xi
=\widehat{\mathbf D}_k\mathbf a_k
+\widehat{\mathbf G}^{1/2}\boldsymbol\xi,\tag{33}
$$

其中 $\boldsymbol\Xi\sim\mathcal{CN}(0,\sigma_\xi^2\widehat{\mathbf G})$ 是匹配滤波后的**有色噪声**，$\boldsymbol\xi$ 是原始零均值白高斯噪声，$\widehat{\mathbf G}\in\mathbb R^{L\times L}$ 是对称 Toeplitz 的 FTN-ISI 矩阵：

$$
\widehat{\mathbf G}=\begin{bmatrix}
g_0&g_1&g_2&\cdots&g_v&0&\cdots\\
g_1&g_0&g_1&g_2&\cdots&g_v&\cdots\\
\vdots&\vdots&\vdots&\ddots&\vdots&\vdots&\\
\cdots&g_v&\cdots&g_2&g_1&g_0
\end{bmatrix},\quad g_\epsilon=g(\epsilon\tau T_0).\tag{34}
$$

**矩阵的完整维度和边界零元需参照原图；以上保留其 Toeplitz 结构。** 数据检测前左乘 $\widehat{\mathbf G}^{-1/2}$，得到白化模型

$$
\widehat{\mathbf y}_k=\widehat{\mathbf G}^{-1/2}\mathbf y_k
=\mathbf F_k\mathbf a_k+\boldsymbol\xi,
\quad\mathbf F_k=\widehat{\mathbf G}^{-1/2}\widehat{\mathbf D}_k.\tag{35}
$$

**（1）线性估计（LE）。** LE 模块对 $\mathbf F_k$ 和来自 NLE 的先验均值 $\widehat{\mathbf a}_{\rm LE}^f$、协方差 $\mathbf\Phi_{\rm LE}^f$ 进行 LMMSE 估计；首次迭代用符号初始方差。权重、后验均值和后验协方差为

$$
\widehat{\mathbf W}_{\rm L}=
\mathbf\Phi_{\rm LE}^f\mathbf F_k^H
(\mathbf F_k\mathbf\Phi_{\rm LE}^f\mathbf F_k^H+\sigma_\xi^2\mathbf I)^{-1},\tag{36}
$$

$$
\widehat{\mathbf a}_{\rm LE}^p=
\widehat{\mathbf a}_{\rm LE}^f+
\widehat{\mathbf W}_{\rm L}
(\widehat{\mathbf y}_k-\mathbf F_k\widehat{\mathbf a}_{\rm LE}^f),\tag{37}
$$

$$
\mathbf\Phi_{\rm LE}^p=
\mathbf\Phi_{\rm LE}^f-
\widehat{\mathbf W}_{\rm L}\mathbf F_k\mathbf\Phi_{\rm LE}^f.\tag{38}
$$

**（2）LE → NLE 的外信息传递。** 不能直接重复使用完整后验，而要扣除已有先验贡献，形成

$$
\mathbf\Phi_{\rm LE}^e=
\big[(\mathbf\Phi_{\rm LE}^p)^{-1}-(\mathbf\Phi_{\rm LE}^f)^{-1}\big]^{-1},\tag{39}
$$

$$
\widehat{\mathbf a}_{\rm LE}^e=
\mathbf\Phi_{\rm LE}^e
\big[(\mathbf\Phi_{\rm LE}^p)^{-1}\widehat{\mathbf a}_{\rm LE}^p
-(\mathbf\Phi_{\rm LE}^f)^{-1}\widehat{\mathbf a}_{\rm LE}^f\big].\tag{40}
$$

随后令 $\widehat{\mathbf a}_{\rm NLE}^f=\widehat{\mathbf a}_{\rm LE}^e$，$\mathbf\Phi_{\rm NLE}^f=\mathbf\Phi_{\rm LE}^e$。

**（3）非线性估计（NLE）。** NLE 的等效输入满足

$$
\widehat{\mathbf a}_{\rm NLE}^f=\mathbf a_k+\widehat{\boldsymbol\xi},\tag{41}
$$

其中 $\widehat{\boldsymbol\xi}$ 为独立的高斯白噪声向量，其第 $\rho$ 个元素方差为 $\mathbf\Phi_{\rm NLE}^f$ 的对应对角元。逐符号最大似然检测为

$$
\widehat a_\rho^{(k)}=
\arg\max_{a_\rho^{(k)}}
\Pr\big(\widehat a_{{\rm NLE},\rho}^f\mid a_\rho^{(k)}\big),\tag{42}
$$

其条件概率与下式成正比：

$$
\Pr(\widehat a_{{\rm NLE},\rho}^f\mid a_\rho^{(k)})
\propto \exp\!\left[
\frac{2\Re(a_\rho^{(k)}\widehat a_{{\rm NLE},\rho}^f)
-|a_\rho^{(k)}|^2}{\Phi_{{\rm NLE},\rho\rho}^f}
\right].\tag{43}
$$

在发送符号独立同分布的假设下，利用星座集合 $\mathcal S$ 中各个候选点 $S_\iota$ 的概率形成后验均值、方差：

$$
\widehat a_{{\rm NLE},\rho}^p
=\sum_{\iota=0}^{\Gamma(\mathcal S)-1}
\Pr(a_\rho^{(k)}=S_\iota\mid\widehat{\mathbf a}_{\rm NLE}^f)S_\iota,\tag{44}
$$

$$
\Phi_{{\rm NLE},\rho\rho}^p=
\sum_{\iota=0}^{\Gamma(\mathcal S)-1}
\Pr(a_\rho^{(k)}=S_\iota\mid\widehat{\mathbf a}_{\rm NLE}^f)|S_\iota|^2
-|\widehat a_{{\rm NLE},\rho}^p|^2.\tag{45}
$$

$\mathcal S$ 是能量归一化的调制星座，$\Gamma(\mathcal S)$ 为大小。以与（39）、（40）相同的形式计算 NLE 的外信息，再反馈至 LE 进入下一次迭代。

### C. 可达容量与频谱效率

由 NLE 的等效高斯观测（41），互信息为

$$
I(\mathbf a_k;\widehat{\mathbf a}_{\rm NLE}^f)
=h_e(\widehat{\mathbf a}_{\rm NLE}^f)-h_e(\widehat{\boldsymbol\xi}),\tag{46}
$$

$h_e$ 是微分熵。高斯分布的最大熵性质给出

$$
h_e(\widehat{\mathbf a}_{\rm NLE}^f)
\le\log_2((\pi e)^L\det(\mathbf C_a)),\tag{47}
$$

其中

$$
\mathbf C_a=\mathbf I+\mathbf\Phi_{\rm NLE}^f,\tag{48}
$$

$$
h_e(\widehat{\boldsymbol\xi})
=\log_2((\pi e)^L\det(\mathbf\Phi_{\rm NLE}^f)).\tag{49}
$$

因此

$$
I(\mathbf a_k;\widehat{\mathbf a}_{\rm NLE}^f)
\le\sum_{\rho=0}^{L-1}
\log_2\left(1+\frac{1}{\phi_{\rm NLE}^f(\rho)}\right).\tag{50}
$$

归一化容量可写为

$$
C=\lim_{L\to\infty}\frac{\frac{1}{L\tau T_0}
\sum_{\rho=0}^{L-1}\log_2(1+1/\phi_{\rm NLE}^f(\rho))}
{2(1+\alpha)B}\quad[\mathrm{bps/Hz}],\tag{51}
$$

其中 $\alpha$ 为 SRRC 滚降系数，$B=1/(2T_0)$ 为带宽。导频不经历 FTN 成形，但保护间隔和导频本身仍降低频谱效率。当 $1/(1+\alpha)\le\tau$ 时，文中频谱效率表达式为

$$
\mathcal S_{\rm FTN}=
\frac{L}{L+L_d}\cdot
\frac{ML}{ML+L_p}\cdot
\frac{\log_2\mathcal M}{\tau(1+\alpha)}R_c
\quad[\mathrm{bit/s/Hz}],\tag{52}
$$

其中 $\mathcal M$ 为调制星座大小，$R_c$ 为信道编码率，$L_p=2\varepsilon+1$。式中的前两个因子分别表示保护间隔和导频带来的效率损失。**原文同时使用符号 $M$ 表示上采样参数与调制阶数，译稿中式（52）特将调制阶数写作 $\mathcal M$ 以区分，但不改变表达式含义。**

### D. 复杂度

原文表 II 对比信道估计算法。JRRSP 中重建矩阵 $\mathbf T$ 的内层计算需约 $N_fU$ 次复杂乘法，优化 $U$ 个子径时每次迭代约需 $U^3$ 次；若迭代次数为 $I$，总复杂度近似为

$$
O\!\left((\varepsilon+1)
(\lfloor N/L\rfloor+1-2U)(N_fU+IU^3)\right),
$$

进一步近似为 $O(\varepsilon\lfloor N/L\rfloor IU^3)$。样条插值、线性插值、Wiener 插值分别约为 $O(2\varepsilon MN)$、$O(\varepsilon MN)$、$O(\varepsilon^2MN)$；基于索引调制的插值法还涉及导频位置识别，详细运算见表 II。

原文表 III 对比检测复杂度。WE-OAMP 的 LE 权重计算包含一次 $L\times L$ 矩阵求逆，外信息计算中也有求逆，NLE 逐符号检测本身为 $O(L)$。经过 $\chi$ 次迭代，总复杂度约为 $O(\chi(5L^3+L))\simeq O(5\chi L^3)$。MRC 约为 $O(L^3+\chi L^2)$；LMMSE 约为 $O(L^3)$；Turbo 均衡约为 $O(\chi L^3)$。

## V. 仿真分析（实验结果概要，非逐段全译）

本文使用长度为 16200 的 LDPC 编码，码率 $1/2$ 或 $3/4$，QPSK 调制。信道采用 3GPP 的 EVA、EPA 与 ETU 模型；EVA 的最大时延抽头 $\varepsilon=63$。BER 实验数据块长 $L=1024$，FTN 参数分别为 $\tau=0.8,\alpha=0.25$ 与 $\tau=2/3,\alpha=0.5$，并以 $\tau=1$ 的奈奎斯特传输作为基准。原文表 IV 和表 V 分别给出信道与 FTN 系统的完整参数。

**A. 干扰因子与频谱。** 图 7 比较 AWGN、FSF 与 DSF 信道中第 180、333、487 个符号的干扰因子。AWGN 下干扰主要来自 FTN-ISI，因子固定且对称；FSF 导致多径能量分散，但块内路径增益近似不变；DSF 同时具有时间和频率选择性，故不同符号的干扰幅度不再相同，耦合效应使波动更剧烈。图 8 比较无导频、FTN 成形导频、未成形导频及降低导频功率等设置下的频谱。未成形导频会使带外衰减比 FTN 成形导频降低约 10 dB，形成需要权衡的频谱开销。

**B. 信道估计 NMSE。** 图 9–10 对比 JRRSP 与线性、样条、Wiener、索引调制插值方法，涵盖不同信道模型、数据块长和 SNR。总体上 JRRSP 的 NMSE 最小；当数据块加长时，插值误差更明显，而基于子径参数恢复的方法受影响较小。不过，JRRSP 以更高计算复杂度换取估计精度；其性能依赖子径数 $U$ 和正则参数设置，不能认为无条件优于全部基线。

**C. 误码率。** 图 11 为未编码系统，图 12 为编码系统，比较 WE-OAMP、MRC、LMMSE 与其他方案；并区分理想 CSI（ICSI）与估计 CSI（ECSI）。增加 WE-OAMP 迭代次数通常可改善 BER。值得注意的是，MRC 在部分未编码设置可优于 WE-OAMP，但编码后 WE-OAMP 的检测表现更稳定。在图 11(a) 的 $\tau=0.8$、BER=$10^{-4}$ 设置中，三次迭代相对于一次迭代约有 1 dB 改善。采用估计 CSI 后，各方案的 BER 都有所恶化，尤其在强压缩 $\tau=2/3$ 下更明显。

**D. 容量。** 图 13 在不同 $L,\tau,\alpha$ 下比较归一化可达容量。容量随 SNR 增大，块长增加到约 1024 后影响有限；较小的 FTN 压缩率（更密集的时间打包）在固定其他条件时通常得到更高可达容量。结果与式（51）的趋势一致。

**尚待补齐/校核**：第五章所有逐段文字及图 8–13 细节、表 I–V 的完整逐单元转录、算法 1 的逐行排版、公式（11）、（31）的完整带状矩阵、作者参考文献列表与所有复杂公式的逐字符比对。目前是私人学习用阶段性译稿，而不是已验收完整翻译。

## VI. 结论（依据原文第 15–16 页翻译）

现有针对双选择性衰落（DSF）信道的 FTN 研究为简化干扰消除，通常将 FTN 引起的符号间干扰（FTN-ISI）和信道引起的符号间干扰（channel-ISI）分开处理。然而，在实际 DSF 场景中，两类干扰的内在耦合会降低传统检测算法的性能。

为克服上述局限，本文首先推导了实际 DSF 信道上的 FTN 传输模型，并构造相应的耦合干扰矩阵。由于数据检测需要准确的信道状态信息（CSI），提出了 JRRSP 算法，将传播路径分解为多个可分辨子径，通过联合优化各子径参数来重构 CSI。实验结果表明，与传统插值类方法相比，所提出的 JRRSP 算法能够实现更低的归一化均方误差（NMSE）。

最后，基于所推导的系统模型和耦合干扰矩阵，本文提出 WE-OAMP 算法：使用白化矩阵抑制噪声相关性，并在线性估计器与非线性估计器之间迭代优化，从而有效抑制耦合干扰。与已有数据检测算法相比，该方法实现了更好的误码率（BER）性能。

**范围说明：** 本节为原文第 VI 章结论的完整译意；第 V 章细节、原文表 I–V 和算法 1 尚待更深入逐段/逐行校对。

{% endraw %}
