---
layout: page
title: "有限码长下非相干多天线瑞利块衰落信道｜中文全文译文"
permalink: /papers/translations/2026-09-29-2503-01504-on-noncoherent-multiple-antenna-rayleigh-block-fading-channels-at-fini/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/811140ad2372f3e3/) · [原文 arXiv](https://arxiv.org/abs/2503.01504) · [全部目录](/papers/catalog/)

# 有限码长下非相干多天线瑞利块衰落信道

**原题：** On Noncoherent Multiple-Antenna Rayleigh Block-Fading Channels at Finite Blocklength  
**作者：** Chao Qi、Tobias Koch  
**版本：** arXiv:2503.01504v3，2025-11-18，原文 49 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–V 节、结论、致谢与资助说明、图 1–7 图注、表 I 逐格、附录 I–X（逐附录给出目标、主要引理/命题与关键推导步骤）、参考文献 [1]–[43]（英文原条目）按原文结构录入；长附录中的纯代数推导按原文结构概述而非逐式复现（详见页尾说明）。逐句逐式终校未做。

## 摘要

本文研究在非相干多输入多输出（multiple-input multiple-output，MIMO）瑞利块衰落信道上，使用给定码长且块错误概率不超过给定值的纠错码时，数据可传输的最大编码速率。我们推导出一种高信噪比（signal-to-noise ratio，SNR）正态近似，当 SNR 与编码所跨越的相干区间个数同时趋于无穷时该近似变得准确。所得正态近似与文献中已有的非渐近界互为补充——后者的数值计算代价很高；它进一步为在有限码长与有限 SNR 下解析分析分集、复用与信道估计代价之间的基本折中奠定了理论基础。

**索引词：** 信道色散、有限码长、高 SNR、MIMO、正态近似、瑞利衰落、无线通信。

## I. 引言

短包无线通信问题正受到越来越多的关注 [1]。例如，下一代蜂窝系统中的绝大多数无线连接很可能来自自主机器与设备，它们主要交换短包；同时，增强型移动宽带业务预计将由面向可靠实时通信、对时延与可靠性有严格要求的系统的新型业务加以补充。当包长不受限制时，容量与中断容量为无线通信系统可达吞吐量提供了准确基准；但对短包无线通信，需要对最大编码速率随码长的变化作更精细的分析。本文正是提供这样一种分析。

令 $R^*(n,\epsilon)$ 表示使用码长为 $n$、块错误概率不超过 $\epsilon$ 的纠错码时数据可传输的最大编码速率。Hayashi [2] 与 Polyanskiy、Poor、Verdú [3] 证明，对多种具有正容量 $C$ 的信道，$R^*(n,\epsilon)$ 可紧密近似为

$$
R^*(n,\epsilon)=C-\sqrt{\frac{V}{n}}Q^{-1}(\epsilon)+O\left(\frac{\log n}{n}\right), \tag{1}
$$

其中 $V$ 为所谓的信道色散；$Q^{-1}(\epsilon)$ 为 $Q$ 函数的反函数

$$
Q(x)\triangleq\frac{1}{\sqrt{2\pi}}\int_{x}^{\infty}e^{-t^2/2}\,dt, \tag{2}
$$

而 $O(\log n/n)$ 包含衰减不快于 $\log n/n$ 的项。忽略 $O(\log n/n)$ 项所得的近似有时称为**正态近似**。正态近似已成为短纠错码的基准（参见 [4]、[5]），并作为短包通信系统分析与优化中最大编码速率的代理量出现在大量论文中（参见 [6]–[15]）。然而，这些工作中的许多考虑的是高斯信道的正态近似，可能无法刻画无线通信系统中关键参数（如相干时间、分集或复用增益）的影响。

为弥补该不足，Polyanskiy 等人的工作已被推广到若干无线信道 [16]–[27]；表 I 给出汇总。特别地，相干衰落信道（接收机完美已知衰落系数实现）的信道色散已由 Polyanskiy 与 Verdú 对单天线情形 [16]、由 Collins 与 Polyanskiy 对多输入单输出（MISO）[17] 与 MIMO [18]、[19] 情形得到；发射与接收天线数随码长增长的情形在 [20] 中考虑。当收发双方均完美已知衰落系数实现且发射机满足长期功率约束时，单天线准静态衰落信道的信道色散由 Yang 等 [21] 得到。在非相干情形，信道色散仅在准静态情形已知，且其为零 [22]。对一般非相干瑞利块衰落信道，[23] 与 [24] 给出了最大编码速率的非渐近界；[25]、[26] 给出了在单天线情形以可忽略计算代价精确逼近这些界的鞍点近似。然而，一般非相干瑞利块衰落信道的信道色散闭式表达式仍属未知。获得此类表达式之所以困难，是因为容量可达输入分布一般未知；因此，先对容量可达输入输出分布求 $R^*(n,\epsilon)$ 的非渐近上下界、再在 $n\to\infty$ 极限下分析这些界以得到形如 (1) 的表达式的标准做法无法直接采纳。幸运的是，此类信道容量的高 SNR 渐近行为已被充分理解 [28]、[29]；[27] 正是利用这一事实，推导出非相干单天线瑞利块衰落信道上 $R^*(n,\epsilon)$ 的高 SNR 正态近似。

本文将 [27] 推广到 MIMO 情形。具体而言，我们给出非相干 MIMO 瑞利块衰落信道上形如 (1) 的 $R^*(n,\epsilon)$ 表达式；通过推导高 SNR 下容量与信道色散的渐近紧近似，得到 $R^*(n,\epsilon)$ 的高 SNR 正态近似，与已有非渐近界互为补充。

全文其余部分组织如下：第 II 节介绍系统模型；第 III 节给出并讨论本文主要结果——非相干 MIMO 块衰落信道的高 SNR 正态近似，当 SNR 与编码跨越的相干区间个数趋于无穷时该近似变得准确；第 IV 节给出主要结果的证明；第 V 节总结并讨论结果；部分证明推迟到附录。

**记号。** 大写字母（如 $X$）表示标量随机变量，其实现用小写（如 $x$）。粗体大写字母表示随机矩阵（如 $\mathbf X$），其实现用特殊字体的实值大写字母（如 $\mathsf X$）表示。均值为 $\mu$、方差为 $\sigma^2$ 的循环对称复高斯随机变量分布记作 $\mathcal{CN}(\mu,\sigma^2)$；形状参数为 $\alpha$、速率参数为 $\lambda$ 的 Gamma 分布记作 $\Gamma(\alpha,\lambda)$。$\mathbb E[\cdot]$ 与 $\mathrm{Var}(\cdot)$ 分别表示期望与方差，$\overset{d}{=}$ 表示同分布。$(\cdot)^H$、$(\cdot)^*$、$(\cdot)^T$ 分别表示 Hermitian 转置、复共轭与转置（不取共轭），$\mathrm{tr}(\cdot)$ 与 $\det(\cdot)$ 分别表示迹与行列式。尺寸为 $a\times a$ 的单位阵记作 $\mathbf I_a$，$\mathrm{diag}\{d_1,\ldots,d_a\}$ 表示以 $d_1,\ldots,d_a$ 为对角元的 $a\times a$ 对角阵。矩阵 $\mathbf X$ 由前 $i$ 行与前 $i$ 列构成的对角子块记作 $[\mathbf X]_{(1:i)^2}$；对任意矩阵 $\mathbf X$，$\|\mathbf X\|_F$ 表示 Frobenius 范数。全文 $\log(\cdot)$ 表示自然对数，$[a]^+$ 表示 $\max\{a,0\}$，$\mathbf 1\{\cdot\}$ 表示指示函数。我们还使用如下 Gamma 与 digamma 函数：

$$
\Gamma(x)\triangleq\int_{0}^{\infty}t^{x-1}e^{-t}dt,\quad\text{Gamma 函数} \tag{3a}
$$

$$
\Gamma_m(x)\triangleq\pi^{m(m-1)/2}\prod_{k=1}^{m}\Gamma(x-k+1),\quad\text{复多变量 Gamma 函数} \tag{3b}
$$

$$
\Psi(x)\triangleq\frac{d}{dx}\log\Gamma(x),\quad\text{Euler digamma 函数} \tag{3c}
$$

$$
\Psi'(x)\triangleq\frac{d}{dx}\Psi(x),\quad\Psi(\cdot)\ \text{的导数}. \tag{3d}
$$

最后，记 $\limsup$ 为上极限、$\liminf$ 为下极限。

## II. 系统模型

考虑具有 $n_t$ 根发射天线、$n_r$ 根接收天线、相干区间为 $T$ 的瑞利块衰落信道。在第 $\ell$ 个相干区间内，信道输入输出关系为

$$
\mathbf Y_\ell=\mathbf X_\ell\mathbf H_\ell+\mathbf W_\ell, \tag{4}
$$

其中 $\mathbf X_\ell$ 为复值 $(T\times n_t)$ 维发射矩阵；$\mathbf Y_\ell$ 为复值 $(T\times n_r)$ 维接收矩阵；$\mathbf H_\ell$ 为复值 $(n_t\times n_r)$ 维衰落矩阵，其元素独立同分布，服从 $\mathcal{CN}(0,1)$；$\mathbf W_\ell$ 为接收端复值 $(T\times n_r)$ 维加性噪声矩阵，元素独立同分布，服从 $\mathcal{CN}(0,1)$。假设 $\mathbf H_\ell$ 与 $\mathbf W_\ell$ 相互独立，并在相邻相干区间上独立取值；进一步假设 $\mathbf H_\ell$ 与 $\mathbf W_\ell$ 的联合分布不依赖 $\mathbf X_\ell$。我们考虑非相干设置：收发双方仅知道衰落矩阵 $\mathbf H_\ell$ 的统计特性，而不事先知道其实现。

假设 $n_t\le n_r$ 且 $T\ge n_t+n_r$。假设 $n_t\le n_r$ 在高 SNR 下不造成容量损失 [28]。更具体地，Zheng 与 Tse [28] 证明，在高 SNR 下非相干瑞利块衰落信道的容量可表示为

$$
C(\rho)=n^\star\left(1-\frac{n^\star}{T}\right)\log(\rho)+O_\rho(1), \tag{5}
$$

其中 $n^\star\triangleq\min\{n_t,n_r,\lfloor T/2\rfloor\}$，$O_\rho(1)$ 汇总在 SNR $\rho$ 下有界的项。这意味着，对给定相干时间 $T$ 与接收天线数 $n_r$，容量预对数（pre-log）通过取 $n_t=\min\{n_r,\lfloor T/2\rfloor\}$ 根发射天线达到最大；因此使用多于 $n_r$ 根发射天线并不增加高 SNR 容量。当天线数适中时，$T\ge n_t+n_r$ 对慢衰落信道是合理假设。在此假设下，称为**酉空时调制**（unitary space-time modulation，USTM）的输入分布可达到容量的下界，且该下界在 SNR 趋于无穷时渐近紧 [28]、[29]。当 $T<n_t+n_r$ 时，USTM 输入不再最优，应改用称为 beta 变量空时调制（BSTM）的输入分布 [29]；分析该输入分布下的最大编码速率需要不同的分析，超出本文范围。

为简洁起见，我们限定码长为 $n=LT$，其中 $L$ 表示码字跨越的长度为 $T$ 的相干块的个数。一个 $(L,T,M,\epsilon,\rho)$ 码由以下部分组成：

(1) 编码器 $f:\{1,\ldots,M\}\to(\mathbb C^{T\times n_t})^L$，把均匀分布于 $\{1,\ldots,M\}$ 的消息 $\Phi$ 映射为码字 $\mathsf X^L=[\mathsf X_1,\ldots,\mathsf X_L]$。假设码字以概率 1 满足功率约束

$$
\frac{1}{T}\left\|\mathsf X_\ell\right\|_F^2\le\rho,\quad\ell=1,\ldots,L. \tag{6}
$$

由于 $\mathbf H_\ell$ 与 $\mathbf W_\ell$ 的方差已归一化，$\rho$ 可解释为接收端的平均 SNR。

(2) 解码器 $g:(\mathbb C^{T\times n_t})^L\to\{1,\ldots,M\}$，满足最大错误概率约束

$$
\max_{1\le\phi\le M}\Pr\left\{g(\mathbf Y^L)\ne\Phi\mid\Phi=\phi\right\}\le\epsilon, \tag{7}
$$

其中 $\mathbf Y^L=[\mathbf Y_1,\ldots,\mathbf Y_L]$ 为按式 (4) 由码字 $\mathbf X^L=f(\phi)$ 诱导的信道输出。

> 脚注 1（原文）：信息论文献中更常见的是对每个码字 $\mathbf X^L$ 施加功率约束，这种约束允许在相干区间之间更灵活地分配功率，可能得到更大的最大编码速率；但实际系统通常要求逐相干区间的约束，以避免过大的峰均功率比。无论如何，由于互信息关于输入分布的凹性，向各相干区间分配等功率对信道容量是最优的；此时每码字功率约束特化为每相干区间功率约束。因此，在 $L$ 足够大、信道容量项主导信道色散项时，两种功率约束很可能给出相同的最大编码速率。

最大编码速率定义为

$$
R^*(L,T,\epsilon,\rho)\triangleq\sup\left\{\frac{\log M}{LT}:\ \exists\ (L,T,M,\epsilon,\rho)\ \text{码}\right\}. \tag{8}
$$

## III. 主要结果

本文主要结果是第 III-A 节给出的 $R^*(L,T,\epsilon,\rho)$ 的高 SNR 正态近似；第 III-B 节通过数值结果讨论该近似的精度；第 III-C 节讨论可能的应用。

### A. 高 SNR 正态近似

**定理 1。** 假设 $T\ge n_r+n_t$、$n_r\ge n_t$、$0<\epsilon<\frac{1}{2}$。则在高 SNR 下，

$$
R^*(L,T,\epsilon,\rho)=\tilde I(T,\rho)+K_{\tilde I}(T,\rho)-\sqrt{\frac{\tilde V(T)+K_{\tilde V}(T,\rho)}{L}}Q^{-1}(\epsilon)+K_L(L,T,\rho), \tag{9}
$$

其中

$$
\begin{aligned}
\tilde I(T,\rho)\triangleq\ &n_t\left(1-\frac{n_t}{T}\right)\log\left(\frac{\rho}{n_t}\right)
+n_t\left(1-\frac{n_t}{T}\right)\log\left(\frac{T}{e}\right)\\
&+\frac{1}{T}\log\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}
+\left(1-\frac{n_t}{T}\right)\sum_{i=0}^{n_t-1}\Psi(n_r-i),
\end{aligned}\tag{10}
$$

$$
\tilde V(T)\triangleq\frac{n_t}{T}\left(1-\frac{n_t}{T}\right)+\left(1-\frac{n_t}{T}\right)^2\sum_{i=0}^{n_t-1}\Psi'(n_r-i). \tag{11}
$$

式 (9) 中 $K_{\tilde I}(T,\rho)$ 与 $K_{\tilde V}(T,\rho)$ 为 $T$ 与 $\rho$ 的函数，满足

$$
\lim_{\rho\to\infty}K_\xi(T,\rho)=0,\quad\xi\in\left\{\tilde I,\tilde V\right\}, \tag{12}
$$

而 $K_L(L,T,\rho)$ 为 $L$、$T$、$\rho$ 的函数，满足

$$
\sup_{\rho\ge\rho_0}\left|K_L(L,T,\rho)\right|\le A\frac{\log L}{L},\quad L\ge L_0, \tag{13}
$$

其中 $A$、$L_0$、$\rho_0$ 与 $L$、$\rho$ 无关。

**证明：** 见第 IV 节。

量 $\tilde I(T,\rho)$ 是非相干 MIMO 瑞利块衰落信道容量 $C(\rho)$ 的渐近紧下界 [29]；类似地，$\tilde V(T)$ 可视为信道色散的高 SNR 近似。忽略式 (9) 中的误差项 $K_{\tilde I}(T,\rho)$、$K_{\tilde V}(T,\rho)$ 与 $K_L(L,T,\rho)$，得到**高 SNR 正态近似**

$$
R^*(L,T,\epsilon,\rho)\approx\tilde I(T,\rho)-\sqrt{\frac{\tilde V(T)}{L}}Q^{-1}(\epsilon). \tag{14}
$$

注意 $\tilde I(T,\rho)$ 与 $\tilde V(T)$ 分别仅通过 digamma 函数 $\Psi(n_r-i)$ 及其导数 $\Psi'(n_r-i)$ 依赖 $n_r$。在正整数域上，digamma 函数单调递增，其导数单调递减；因此近似 (14) 关于 $n_r$ 单调递增。第 III-B 节将看到，(14) 对 $n_t$ 的依赖更为复杂——直观上，增加发射天线数可获得更高的复用增益 $\min\{n_t,n_r\}$，但也需要估计更多信道系数。

作为对比，在高 SNR 下相干 MIMO 瑞利块衰落信道的容量 $C_c(\rho)$ 满足 [30]

$$
\lim_{\rho\to\infty}\left\{C_c(\rho)-n_t\log\left(\frac{\rho}{n_t}\right)-\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right]\right\}=0. \tag{15}
$$

此外，信道色散 $V_c(\rho)$ 收敛到 [19]

$$
\lim_{\rho\to\infty}V_c(\rho)=\frac{n_t}{T}+\mathrm{Var}\left(\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right). \tag{16}
$$

应用 [31, Lemma A.2]（亦见下文引理 7），式 (10) 中 Euler digamma 函数之和可识别为 $\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right]$，式 (11) 中这些函数的导数之和可识别为 $\mathrm{Var}\left(\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right)$。于是非相干块衰落信道的高 SNR 容量与色散可写为

$$
\begin{aligned}
\tilde I(T,\rho)=\ &n_t\left(1-\frac{n_t}{T}\right)\log\left(\frac{\rho}{n_t}\right)
+\left(1-\frac{n_t}{T}\right)\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right]\\
&+n_t\left(1-\frac{n_t}{T}\right)\log\left(\frac{T}{e}\right)
+\frac{1}{T}\log\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}
\end{aligned}\tag{17}
$$

与

$$
\tilde V(T)=\frac{n_t}{T}\left(1-\frac{n_t}{T}\right)+\left(1-\frac{n_t}{T}\right)^2\mathrm{Var}\left(\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right). \tag{18}
$$

注意，除与 SNR 无关的项外，$\tilde I(T,\rho)$ 等于 $C_c(\rho)$ 的高 SNR 近似乘以 $(1-n_t/T)$；类似可证 $\tilde V(T)$ 对应如下做法得到的信道色散：在每个相干块中用每根发射天线一个导频符号估计衰落系数，然后在该相干信道的 $T-n_t$ 个符号上传输。这提示如下启发：在高 SNR 下，应在每个相干块中每根发射天线发送一个导频符号，随后进行相干传输。然而该启发可能有误导性，因为 $\tilde I(T,\rho)$ 中与 SNR 无关的项可能很显著，而且每个相干块、每根发射天线一个导频符号是否足以获得精度足够的衰落估计，并非显然。对单天线情形，关于导频辅助传输可达最大编码速率的更精细分析见 [32]。

定理 1 给出当 $L$ 趋于无穷、相干区间 $T$ 固定时最大编码速率 $R^*(L,T,\epsilon,\rho)$ 的渐近分析。事实上，只要 $T$ 固定，式 (9) 中的误差项在 $L\to\infty$ 与 $\rho\to\infty$ 时消失；这对应码字跨越独立相干区间的遍历情形。与之互补的 $T\to\infty$、$L$ 固定的情形在 [22] 中考虑：[22] 研究准静态多天线衰落信道，并分析最大编码速率在 $T\to\infty$ 极限下向中断容量的收敛。把 [22] 中的衰落矩阵 $\mathbf H$ 替换为块对角矩阵，即得到与块衰落信道 (4) 等价的模型；[22, Ths. 3 & 9] 的相应结果表明，无论发射端或接收端是否获得信道状态信息，$\epsilon$-色散均为零，这意味着 $T\to\infty$ 时最大编码速率快速收敛到中断容量，故该区域中断容量是最大编码速率的良好代理。总体而言，遍历与准静态两种分析刻画不同区域的最大编码速率、彼此很好互补。对单天线情形，(9) 的高 SNR 正态近似与基于 [22, Eq. (95)] 的正态近似之对比可见 [27, Sec. V-B]：正如预期，为遍历情形发展的 (9) 在 $L$ 大时准确，而为准静态情形发展的 [22, Eq. (95)] 在 $T$ 大时准确。

### B. 数值结果

下面给出数值示例，以说明定理 1 中高 SNR 正态近似的精度。各图描绘：高 SNR 正态近似 (9)；[19] 得到的相干 MIMO 瑞利块衰落信道正态近似；基于依赖检验（dependence testing，DT）界 [3, Th. 22] 的 $R^*(L,T,\epsilon,\rho)$ 非渐近（关于 $\rho$ 与 $L$）下界；以及基于元逆（meta converse，MC）界 [3, Th. 31] 的非渐近上界——后两者均按 [24] 对非相干 MIMO 瑞利块衰落信道特化。非渐近界用通信工具箱 SPECTRE [33] 计算。虽然这些界非常精确，但其计算复杂度随码长指数增长，可能相当可观。对非相干单天线块衰落信道，这些界及其近似计算复杂度的讨论见 [26, Sec. VIII-A]。图中阴影区域表示 $R^*(L,T,\epsilon,\rho)$ 所在范围。

**图 1：** 固定 $n=TL$ 时 $R^*(L,T,\epsilon,\rho)$ 随 $T$ 的变化。（a）$n=168$、$\epsilon=10^{-3}$、$\rho=15$ dB、$n_t=n_r=2$；（b）$n=168$、$\epsilon=10^{-3}$、$\rho=25$ dB、$n_t=n_r=2$。

在图 1a 与 1b 中，我们给出固定码长 $n=LT=168$、SNR 分别为 $\rho=15$ dB 与 $25$ dB 时 $R^*(L,T,\epsilon,\rho)$ 随 $T$ 的变化。可以看到，高 SNR 正态近似 (9) 在 $\rho=25$ dB 时准确描述最大编码速率，但在 $\rho=15$ dB 时除非 $L$ 较大否则偏松。此外，如预期，相干情形的正态近似严格大于非相干情形，且随 $T$ 增大而更准确，表明信道估计代价随 $T$ 增大而减小。

**图 2：** 固定 $T$ 时 $R^*(L,T,\epsilon,\rho)$ 随 $n$ 的变化。（a）$T=24$、$\epsilon=10^{-3}$、$n_t=2$、$n_r=2$、$\rho=15$ dB；（b）$T=24$、$\epsilon=10^{-3}$、$n_t=2$、$n_r=4$、$\rho=15$ dB。

在图 2a 与 2b 中，我们给出 $T=24$、$\rho=15$ dB 时 $R^*(L,T,\epsilon,\rho)$ 随码长 $n=LT$ 的变化，分别对应 $n_t=n_r=2$ 与 $n_t=2,n_r=4$。作为对比，我们还画出 $\tilde I(T,\rho)$（式 (10)），它是渐近紧的容量下界。可以看到，正态近似 (9) 随 $L$ 与 $n_r$ 增大而更准确；当 $n_r=4$ 时，在所考察的 $L$ 取值下它已非常接近非渐近界。此外，相干与非相干正态近似之间的差距似乎与 $L$ 无关，这与"信道估计代价由相干区间 $T$ 决定"的直觉一致。

**图 3：** $R^*(L,T,\epsilon,\rho)$ 随 $\epsilon$ 的变化。（a）$n_t=2$、$n_r=2$、$T=24$、$L=7$；（b）$\rho=25$ dB、$T=24$、$L=7$。

在图 3a 与 3b 中，我们研究 $T=24$、$L=7$ 时 $R^*(L,T,\epsilon,\rho)$ 随 $\epsilon$ 的变化：图 3a 对 $n_t=2,n_r=2$、两种 SNR（20 dB 与 25 dB）作图；图 3b 对 25 dB 与三种天线数 $(n_t,n_r)=(1,1),(1,2),(2,2)$ 作图。可以看到，正态近似 (9) 的精度随 SNR 与天线数增大而提高；在 $\rho=25$ dB、$(n_t,n_r)=(2,2)$ 时，它在所考虑的全部错误概率范围内都非常接近非渐近界。对较少天线的情形，正态近似在较小错误概率处失去精度。

**图 4：** $R^*(L,T,\epsilon,\rho)$ 随 $\rho$ 的变化。（a）$T=24$、$L=7$、$\epsilon=10^{-5}$、$n_t=1$、$n_r=2$；（b）$T=24$、$L=7$、$\epsilon=10^{-5}$、$n_t=2$、$n_r=2$。

在图 4a 与 4b 中，我们研究 $T=24$、$L=7$、$\epsilon=10^{-5}$、$(n_t,n_r)=(1,2)$ 与 $(2,2)$ 时 $R^*(L,T,\epsilon,\rho)$ 随 SNR 的变化，并画出容量的高 SNR 近似 $\tilde I(T,\rho)$ 作对比。首先，基于 USTM 输入的 DT 下界接近 MC 上界（后者对满足功率约束 (6) 的任意输入分布有效），说明在所考察的全部 SNR 下 USTM 输入几乎容量可达。其次，正态近似 (9) 准确的 SNR 范围依赖天线数：当 $n_t=1,n_r=2$ 时，该近似在 $\rho\ge12$ dB 时准确；当 $n_t=2,n_r=2$ 时，在 $\rho\ge23$ dB 时准确。如预期，相干信道的正态近似严格大于非相干信道的高 SNR 正态近似与各非渐近界；但其与非渐近界的差距随 $\rho$ 减小而缩小——直观上，这是因为 $\rho$ 减小时衰落系数知识变得不那么重要。此外，从图 4 可见，在高 SNR 下正态近似与渐近界之间存在恒定差距，这与误差项 $K_L(L,T,\rho)$ 的刻画 (13) 一致：该项只保证在 $L\to\infty$ 时消失，对固定 $L$ 可能有正下界。

**图 5：** $R=4$、$T=24$、$L=7$ 时最小错误概率 $\epsilon$ 随 SNR 的变化。

图 5 给出固定速率 $R=4$、$T=24$、$L=7$、天线数 $(n_t,n_r)=(1,1),(1,2),(1,4),(2,4)$ 时错误概率随 SNR 的变化。与前面各图一样，所画 DT 界基于 USTM 输入，MC 界表示满足功率约束 (6) 的输入所能达到的最小错误概率。可以看到，错误概率曲线随收发天线数增大而变陡，这与 Zheng 与 Tse [34] 提出的分集—复用折中（diversity-multiplexing tradeoff，DMT）一致。令复用增益 $r$ 与分集增益 $d$ 分别为

$$
r\triangleq\lim_{\rho\to\infty}\frac{R^*(L,T,\epsilon,\rho)}{\log\rho} \tag{19}
$$

与

$$
d\triangleq-\lim_{\rho\to\infty}\frac{\log\epsilon}{\log\rho}, \tag{20}
$$

直观上，若系统分集增益为 $d$，则相应错误概率随 SNR $\rho$ 以 $\rho^{-d}$ 衰减；曲线越陡对应分集增益越高。对非相干瑞利块衰落信道，DMT 由连接如下各点的分段线性曲线给出 [35]：

$$
\left(r=\left(1-\frac{n^\star}{T}\right)k,\ d=L(n_t-k)(n_r-k)\right),\quad k=0,\ldots,\min(n_t,n_r), \tag{21}
$$

其中 $n^\star$ 如式 (5) 所定义。若固定复用增益 $r$（等价地固定 $k$），则 (21) 表明分集增益随收发天线数增大。这正是图 5 所考虑的设置（固定速率、因而固定复用增益）；因此"$\epsilon$ 的斜率随天线数增大而变陡"这一观察在理论上得到 DMT 的支持。还能看到，正态近似 (9) 在 $n_t=1$ 时准确，但在 $n_t=2$ 时过于悲观；相反，相干正态近似在本图所考虑的全部参数下都过于乐观。最后，错误概率随天线数增大显著下降，这体现了短码长下收发多天线的收益。

**图 6：** $(n_t,n_r)=(1,4)$、$(2,2)$、$(4,1)$ 时的最大编码速率与最小错误概率。（a）固定 $TL=168$、$\epsilon=10^{-3}$、$\rho=25$ dB 时 $R^*(L,T,\epsilon,\rho)$ 随 $T$ 的变化；（b）$R=4$、$T=24$、$L=7$ 时错误概率 $\epsilon$ 随 SNR 的变化。

最后，我们研究天线总数固定为 4 时天线分配对最大编码速率与错误概率的影响：图 6a 画出固定码长 $n=168$、$\rho=25$ dB、$\epsilon=10^{-3}$、$(n_t,n_r)=(1,4),(2,2),(4,1)$ 时 $R^*(L,T,\epsilon,\rho)$ 随 $T$ 的变化；图 6b 画出 $R=4$、$T=24$、$L=7$ 及相同天线数时最小错误概率随 SNR 的变化。对 $(n_t,n_r)=(1,4)$ 与 $(2,2)$ 画出正态近似 (9)，而对 $(4,1)$ 画出 DT 与 MC 界，因为 $n_t>n_r$ 的情形不在定理 1 的覆盖范围内。可以看到，对固定错误概率，把相同天线数分配给收发两端可使编码速率最大，这对应利用收发天线最大化空间复用；相反，对固定速率，最大化接收天线数可使错误概率最小。直观上，所有情形具有相同分集阶数 $n_tn_r$，但发射天线数最少时衰落矩阵 $\mathbf H_\ell$ 的估计代价最小——例如用导频符号估计 $\mathbf H_\ell$ 需要每相干区间、每发射天线一个导频符号。这与 [28] 的观察一致：在高 SNR 下，使用多于接收天线的发射天线并不增加信道容量。

众所周知，正态近似对足够大的码长与中等错误概率是准确的（另见 [26, Sec. VIII-B] 的讨论），定理 1 的高 SNR 正态近似亦然。具体而言，把高 SNR 正态近似 (9) 与非渐近界比较，可观察到：当 $T=24$、$L\ge7$ 时，对 $\rho\ge25$ dB、$\epsilon\ge10^{-5}$ 及 $\rho\ge21$ dB、$\epsilon\ge10^{-3}$ 的取值，正态近似与 $R^*(L,T,\epsilon,\rho)$ 真值的偏差小于 5%，且与收发天线数无关。

### C. 工程启示：最优活跃发射天线数

文献 [28] 中 Zheng 与 Tse 证明，在高 SNR 下非相干瑞利块衰落信道的容量满足

$$
C(\rho)=n^\star\left(1-\frac{n^\star}{T}\right)\log(\rho)+O_\rho(1), \tag{22}
$$

其中 $n^\star$ 如式 (5)。若 $T\ge n_t+n_r$ 且 $n_t\le n_r$，则 $n^\star=n_t$，预对数因子 $n_t(1-n_t/T)$ 关于 $n_t$ 单调递增；此时使用全部可用发射天线最优。然而，在有限码长下是否同样如此并非显然。直观上，增加发射天线数可获得更高的复用增益 $\min\{n_t,n_r\}$，但也需要估计更多信道系数。为获得一些洞见，我们分析高 SNR 正态近似 (9) 在给定接收天线数 $n_r$ 时随发射天线数 $n_t$ 的行为。

**图 7：** 固定 $n=TL$、给定接收天线数、变化发射天线数时高 SNR 正态近似随 $T$ 的变化。（a）$n=168$、$\epsilon=10^{-3}$、$\rho=25$ dB、$n_r=6$，交点 $T_{4,6}=14.9$、$T_{5,6}=22.9$；（b）$n=512$、$\epsilon=10^{-5}$、$\rho=25$ dB、$n_r=8$，交点 $T_{6,7}=17.9$、$T_{5,8}=18.3$、$T_{6,8}=22.3$、$T_{7,8}=32.5$。

在图 7 中，我们画出固定码长 $n=LT$、给定接收天线数、变化发射天线数时高 SNR 正态近似随 $T$ 的变化，分别考虑 $\rho=25$ dB、$\epsilon=10^{-3}$、$n=168$、$n_r=6$（图 7a）与 $\rho=25$ dB、$\epsilon=10^{-5}$、$n=512$、$n_r=8$（图 7b）。与非渐近界比较可见，在所考虑参数下正态近似与 $R^*(L,T,\epsilon,\rho)$ 真值的偏差小于 5.2%，因而是最大编码速率的良好代理。我们还标出了两条曲线相交处的相干区间取值：用 $T_{n_1,n_2}$ 表示 $n_t=n_1$ 与 $n_t=n_2$ 两条曲线的交点。可以看到，与高 SNR 渐近容量的预对数因子不同，使高 SNR 正态近似最大的发射天线数不一定等于最大值 $n_t=n_r$，且依赖相干区间 $T$。例如图 7a 表明，当 $n=168$、$n_r=6$ 时，只有在 $T\ge23$ 时才应使用全部可用发射天线；而当 $n=512$、$n_r=8$ 时，若 $T<32$，使用全部可用发射天线实际上是次优的（图 7b）。最后，最优活跃发射天线数不一定随 $T$ 单调递增：由图 7b 可见，当 $n=512$、$n_r=8$ 时，在 $18\le T\le32$ 内使用 $n_t=7$ 根发射天线最优。

总之，虽然高 SNR 渐近容量表明在长码长、高 SNR 下使用全部可用发射天线最优，但一般而言最大编码速率对活跃发射天线数的依赖更为复杂。定理 1 给出的高 SNR 正态近似使我们无需借助计算代价高昂的非渐近界，即可揭示这种依赖关系。

## IV. 定理 1 的证明

为证明定理 1，我们在第 IV-A 节推导 $R^*(L,T,\epsilon,\rho)$ 的下界，在第 IV-B 节推导其上界。由于两个界在误差项（其行为与 $K_{\tilde I}(T,\rho)$、$K_{\tilde V}(T,\rho)$、$K_L(L,T,\rho)$ 相同，参见 (49) 与 (133)）意义下都等于 (9)，故可断定 $R^*(L,T,\epsilon,\rho)$ 由 (9) 给出。

### A. $R^*(L,T,\epsilon,\rho)$ 的下界

为推导下界，我们对 USTM 输入分布计算 DT 下界 [3, Th. 22]。此类输入可写为 $\mathbf X^L=\sqrt{T\rho/n_t}\mathbf U^L$，其中 $\mathbf U^L=[\mathbf U_1,\ldots,\mathbf U_L]$ 为独立同分布、各向同性分布、满足 $\mathbf U_\ell^H\mathbf U_\ell=\mathbf I_{n_t}$ 的随机矩阵序列（$\ell=1,\ldots,L$）。定义随机向量 $\mathbf X^L$ 与 $\mathbf Y^L$ 之间的信息密度为

$$
i\left(\mathbf X^L;\mathbf Y^L\right)\triangleq\log\left(\frac{f_{\mathbf Y^L|\mathbf X^L}\left(\mathsf Y^L\mid\mathsf X^L\right)}{f_{\mathbf Y^L}\left(\mathsf Y^L\right)}\right), \tag{23}
$$

其中 $f_{\mathbf Y^L|\mathbf X^L}$ 为给定信道输入 $\mathbf X^L$ 时信道 (4) 输出的条件概率密度函数（pdf），$f_{\mathbf Y^L}$ 为由输入分布与信道律诱导的输出 pdf。当输入为 USTM 时，信道输出 $\mathbf Y^L=[\mathbf Y_1,\ldots,\mathbf Y_L]$ 为独立同分布 $(T\times n_r)$ 维随机矩阵，其联合 pdf 为

$$
f_{\mathbf Y^L}\left(\mathsf Y^L\right)=\prod_{\ell=1}^{L}f_{\mathbf Y}^{(U)}\left(\mathsf Y_\ell\right),\quad\mathsf Y^L=\left[\mathsf Y_1,\ldots,\mathsf Y_L\right], \tag{24}
$$

其中 $f_{\mathbf Y}^{(U)}$ 表示信道 (4) 在每个相干区间内由 USTM 输入诱导的输出 pdf。由于信道是块无记忆的，信息密度可写为

$$
i\left(\mathbf X^L;\mathbf Y^L\right)=\sum_{\ell=1}^{L}i_\ell^{(U)}\left(\mathbf X_\ell;\mathbf Y_\ell\right), \tag{25}
$$

其中 USTM 信息密度 $i_\ell^{(U)}(\mathbf X_\ell;\mathbf Y_\ell)$ 定义为

$$
i_\ell^{(U)}\left(\mathbf X_\ell;\mathbf Y_\ell\right)\triangleq\log\frac{f_{\mathbf Y|\mathbf X}\left(\mathsf Y_\ell\mid\mathsf X_\ell\right)}{f_{\mathbf Y}^{(U)}\left(\mathsf Y_\ell\right)}, \tag{26}
$$

而 $f_{\mathbf Y|\mathbf X}$ 表示给定相应输入 $\mathbf X_\ell$ 时相干区间 $\ell$ 内输出的条件 pdf。

为应用 DT 界，首先注意：当 $\mathbf Y^L$ 按 (24) 分布时，累积分布函数 $\Pr\{i(\mathsf x^L;\mathbf Y^L)\le\alpha\}$ 不依赖 $\mathsf x^L$。这由 USTM 输入的各向同性与输出分布的酉不变性得到（另见 [24, App. A]）；此外，USTM 输入分布以概率 1 满足功率约束 (6)。在上述假设下，DT 界可表述如下。

**引理 1（依赖检验界）** 在 $\mathbf X^L$ 上固定任意分布。假设当 $\mathbf Y^L$ 按 $f_{\mathbf Y^L}$ 分布时，累积分布函数 $\Pr\{i(\mathsf x^L;\mathbf Y^L)\le\alpha\}$ 不依赖 $\mathsf x^L$，且 $\mathbf X^L$ 以概率 1 满足功率约束 (6)。则存在码长为 $n=LT$、含 $M$ 个码字且最大错误概率满足

$$
\epsilon\le\mathbb E\left[\exp\left\{-\left[i\left(\mathbf X^L;\mathbf Y^L\right)-\log(M-1)\right]^+\right\}\right] \tag{27}
$$

的码。

**证明：** 该引理由 [3, Th. 23] 中的界在 $\Pr\{i(\mathsf x^L;\mathbf Y^L)\le\alpha\}$ 不依赖 $\mathsf x^L$ 的情形下优化得到，如 [3, Th. 22] 的证明所示。

区分 $i(\mathbf X^L;\mathbf Y^L)>\log(M-1)$ 与 $i(\mathbf X^L;\mathbf Y^L)\le\log(M-1)$ 两种情形，引理 1 中的不等式 (27) 可写为

$$
\epsilon\le(M-1)\mathbb E\left[e^{-i(\mathbf X^L;\mathbf Y^L)}\mathbf 1\left\{i\left(\mathbf X^L;\mathbf Y^L\right)>\log(M-1)\right\}\right]+\Pr\left\{i\left(\mathbf X^L;\mathbf Y^L\right)\le\log(M-1)\right\}. \tag{28}
$$

因此，若我们能找到 $M$ 使 (28) 右端被 $\epsilon$ 上界，则存在具有相应参数的 $(L,T,M,\epsilon,\rho)$ 码；由最大编码速率的定义 (8) 即得下界

$$
R^*(L,T,\epsilon,\rho)\ge\frac{\log M}{LT}. \tag{29}
$$

为找到这样的 $M$，我们密切遵循 [3, Eqs. (258)–(267)]（另见 [27, Eqs. (69)–(85)]）；为此需要以下辅助结果。下文中，凡下标 $\ell$ 无关紧要处均予省略。进一步定义 $I(T,\rho)\triangleq\mathbb E[i^{(U)}(X;Y)]$ 与 $U(T,\rho)\triangleq\mathbb E[(i^{(U)}(X;Y)-I(T,\rho))^2]$；注意这些量以及三阶矩 $\mathbb E[|i^{(U)}(X;Y)-I(T,\rho)|^3]$ 均按 USTM 输入计算。

**引理 2：** 在高 SNR 下，$U(T,\rho)$ 可近似为

$$
U(T,\rho)=T^2\tilde V(T)+K_U(T,\rho), \tag{30}
$$

其中 $\tilde V(T)$ 如式 (11) 定义，且 $K_U(T,\rho)$ 为 $T$、$\rho$ 的函数，满足

$$
\lim_{\rho\to\infty}K_U(T,\rho)=0. \tag{31}
$$

**证明：** 见附录 I。

**引理 3：** 存在只依赖 $T$ 的充分大的 $\rho_0$，使

$$
\sup_{\rho\ge\rho_0}U(T,\rho)<1, \tag{32}
$$

$$
\sup_{\rho\ge\rho_0}\mathbb E\left[\left|i^{(U)}(X;Y)-I(T,\rho)\right|^3\right]<1. \tag{33}
$$

**证明：** 见附录 II。

引理 2 意味着存在只依赖 $T$ 的充分大的 $\rho_0$，使

$$
U(T,\rho)\ge\frac{T^2}{2}\tilde V(T),\quad\rho\ge\rho_0. \tag{34}
$$

此外由引理 3，存在充分大的 $\rho_0$ 与不依赖 $\rho$ 的 $S(T)$，使

$$
\mathbb E\left[\left|i^{(U)}(X;Y)-I(T,\rho)\right|^3\right]\le S(T),\quad\rho\ge\rho_0. \tag{35}
$$

结合 (34) 与 (35) 可得

$$
\frac{6\mathbb E\left[\left|i^{(U)}(X;Y)-I(T,\rho)\right|^3\right]}{U(T,\rho)^{3/2}}
\le\frac{6S(T)}{\left[T^2\tilde V(T)/2\right]^{3/2}}\triangleq B(T),\quad\rho\ge\rho_0. \tag{36}
$$

(28) 右端第一项可用如下引理上界。

**引理 4（Polyanskiy–Poor–Verdú 引理 47）** 设 $Z_1,Z_2,\ldots,Z_L$ 独立，$\sigma^2=\sum_{\ell=1}^{L}\mathrm{Var}(Z_\ell)\ne0$，$T=\sum_{\ell=1}^{L}\mathbb E[|Z_\ell-\mathbb E[Z_\ell]|^3]<\infty$。则对任意 $A$，

$$
\mathbb E\left[\exp\left(-\sum_{\ell=1}^{L}Z_\ell\right)\mathbf 1\left\{\sum_{\ell=1}^{L}Z_\ell>A\right\}\right]
\le2\left(\log\sqrt{2\pi}+12\frac{T}{\sigma^2}\right)\frac{1}{\sigma}\exp\{-A\}. \tag{37}
$$

**证明：** 见 [3, Lemma 47]。

把引理 4 应用于 (28) 右端第一项，得

$$
(M-1)\mathbb E\left[e^{-i(\mathbf X^L;\mathbf Y^L)}\mathbf 1\left\{i\left(\mathbf X^L;\mathbf Y^L\right)>\log(M-1)\right\}\right]
\le2\left(\log\sqrt{2\pi}+2B(T)\right)\frac{1}{\sqrt{L}}. \tag{38}
$$

接着用 (36) 与 Berry–Esseen 定理上界 (28) 右端第二项。

**引理 5（Berry–Esseen 定理）** 设 $Z_1,\ldots,Z_L$ 独立，$\mu_\ell=\mathbb E[Z_\ell]$，$\sigma_\ell^2=\mathrm{Var}(Z_\ell)$，$t_\ell=\mathbb E[|Z_\ell-\mu_\ell|^3]$，$\sigma^2=\sum_{\ell=1}^{L}\sigma_\ell^2$，$T=\sum_{\ell=1}^{L}t_\ell$。则对任意 $\lambda\in\mathbb R$，

$$
\left|\Pr\left\{\sum_{\ell=1}^{L}(Z_\ell-\mu_\ell)\ge\lambda\sigma\right\}-Q(\lambda)\right|\le\frac{6T}{\sigma^3}. \tag{39}
$$

**证明：** 见 [36, Ch. XVI.5]。

令

$$
\tau=Q^{-1}\left(\epsilon-\left(2\log\sqrt{2\pi}+5B(T)\right)\frac{1}{\sqrt{L}}\right) \tag{40}
$$

并置

$$
\log(M-1)=LI(T,\rho)-\tau\sqrt{LU(T,\rho)}. \tag{41}
$$

则在 (39) 中取 $Z_\ell=i^{(U)}(\mathbf X_\ell;\mathbf Y_\ell)$、$\lambda\triangleq\tau$、$T\triangleq L\mathbb E[|i^{(U)}(X;Y)-I(T,\rho)|^3]$、$\sigma\triangleq\sqrt{LU(T,\rho)}$，并把 Berry–Esseen 定理应用于 (28) 右端第二项，得

$$
\begin{aligned}
\Pr\left\{i\left(\mathbf X^L;\mathbf Y^L\right)\le\log(M-1)\right\}
&\le Q(\tau)+\frac{6\mathbb E\left[\left|i^{(U)}(X;Y)-I(T,\rho)\right|^3\right]}{\sqrt{L}\,U(T,\rho)^{3/2}}\\
&\le\epsilon-\left(2\log\sqrt{2\pi}+5B(T)\right)\frac{1}{\sqrt{L}}+\frac{B(T)}{\sqrt{L}}\\
&=\epsilon-2\left(\log\sqrt{2\pi}+2B(T)\right)\frac{1}{\sqrt{L}},
\end{aligned}\tag{42}
$$

其中第二步由 (36) 与 $\tau$ 的定义得到。可以验证 (42) 与 (38) 右端之和等于 $\epsilon$。因此存在 $(L,T,M,\epsilon,\rho)$ 码，其 $M$ 由 (41) 给出，并得到

$$
R^*(L,T,\epsilon,\rho)\ge\frac{\log(M-1)}{LT}
=\frac{I(T,\rho)}{T}-\sqrt{\frac{U(T,\rho)}{LT^2}}Q^{-1}\left(\epsilon-\left(2\log\sqrt{2\pi}+5B(T)\right)\frac{1}{\sqrt{L}}\right). \tag{43}
$$

把 $Q^{-1}(\cdot)$ 在 $\epsilon$ 附近作 Taylor 级数展开，可得

$$
\left|Q^{-1}\left(\epsilon-\left(2\log\sqrt{2\pi}+5B(T)\right)\frac{1}{\sqrt{L}}\right)-Q^{-1}(\epsilon)\right|\le\frac{A}{\sqrt{L}},\quad L\ge L_0, \tag{44}
$$

其中 $A$、$L_0$ 与 $L$、$\rho$ 无关。此外引理 2 表明 $U(T,\rho)$ 在 $\rho\ge\rho_0$ 上一致有界。结合 (43) 与 (44) 得

$$
R^*(L,T,\epsilon,\rho)\ge\frac{I(T,\rho)}{T}-\sqrt{\frac{U(T,\rho)}{LT^2}}Q^{-1}(\epsilon)+K_{\mathrm{DT}}(L,T,\rho), \tag{45}
$$

其中 $K_{\mathrm{DT}}(L,T,\rho)$ 为 $L$、$T$、$\rho$ 的函数，满足

$$
\sup_{\rho\ge\rho_0}\left|K_{\mathrm{DT}}(L,T,\rho)\right|\le\frac{A}{L},\quad L\ge L_0, \tag{46}
$$

其中 $A$、$L_0$、$\rho_0$ 与 $L$、$\rho$ 无关。$I(T,\rho)/T$ 与 $U(T,\rho)/T^2$ 在高 SNR 下可近似为

$$
\frac{I(T,\rho)}{T}=\tilde I(T,\rho)+\tilde K_I(T,\rho), \tag{47}
$$

$$
\frac{U(T,\rho)}{T^2}=\tilde V(T)+\tilde K_U(T,\rho), \tag{48}
$$

其中 $\tilde I(T,\rho)$ 与 $\tilde V(T)$ 见 (10)、(11)，且 $\tilde K_\xi(T,\rho)$（$\xi\in\{I,U\}$）均为 $T$、$\rho$ 的函数，满足 $\lim_{\rho\to\infty}\tilde K_\xi(T,\rho)=0$。这里 (47) 来自 [29, Eq. (49)]——该文研究非相干 MIMO 瑞利块衰落信道的容量，并证明在高 SNR 下 $I(T,\rho)/T$ 可由 (10) 近似；(48) 来自引理 2。把 (47)、(48) 与 (45) 结合得

$$
R^*(L,T,\epsilon,\rho)\ge\tilde I(T,\rho)+\tilde K_I(T,\rho)-\sqrt{\frac{\tilde V(T)+\tilde K_U(T,\rho)}{L}}Q^{-1}(\epsilon)+K_{\mathrm{DT}}(L,T,\rho). \tag{49}
$$

注意 $\tilde K_\xi(T,\rho)$（$\xi\in\{I,U\}$）满足 (12)，$K_{\mathrm{DT}}(L,T,\rho)$ 满足 (13)。

### B. $R^*(L,T,\epsilon,\rho)$ 的上界

我们的上界基于 MC 界。

**引理 6（元逆界）** 若码本 $\mathcal C$ 的码字 $(\mathbf X_1,\ldots,\mathbf X_L)$ 属于集合 $\mathcal F$ 且最大错误概率不超过 $\epsilon$，则

$$
\log|\mathcal C|\le\sup_{\mathbf X^L\in\mathcal F}\log\frac{1}{\beta_{1-\epsilon}\left(\mathbf X^L,q_{\mathbf Y^L}\right)}, \tag{50}
$$

其中 $\beta_{1-\epsilon}(\mathbf X^L,q_{\mathbf Y^L})$ 表示在假设 $q_{\mathbf Y^L}$ 下、若在假设 $f_{\mathbf Y^L|\mathbf X^L}$ 下的错误概率不超过 $\epsilon$ 时二元假设检验的最小错误概率 [3, Eq. (100)]，而 $q_{\mathbf Y^L}$ 为输出字母表上的辅助 pdf。

**证明：** 该引理通过考虑 $f_{\mathbf Y^L|\mathbf X^L}$ 与 $q_{\mathbf Y^L}$ 之间的二元假设检验得到。直观上，检验信道输出 $\mathbf Y^L$ 是否由在信道 $f_{\mathbf Y^L|\mathbf X^L}$ 上发送给定码字 $\mathsf x^L$ 产生，可看作在两个假设间判决的检验：$H_0$：$\mathbf Y^L$ 按给定输入条件下输出的条件分布分布；$H_1$：$\mathbf Y^L$ 与输入 $\mathsf x^L$ 独立。由于最优解码器无法优于最优假设检验，MC 界即得；证明见 [3, Th. 31]。

(50) 的右端无法闭式计算，因为刻画 $\beta_{1-\epsilon}(\mathbf X^L,q_{\mathbf Y^L})$ 在 $L\to\infty$、$\rho\to\infty$ 下的渐近行为十分困难。为绕开该问题，我们用 [3, Eq. (106)] 对任意 $\xi(\mathbf X^L)>0$（可依赖 $\mathbf X^L$）给出下界

$$
\beta_{1-\epsilon}\left(\mathbf X^L,q_{\mathbf Y^L}\right)
\ge\frac{1}{\xi\left(\mathbf X^L\right)}\left(1-\epsilon-\Pr\left\{\left.\frac{f_{\mathbf Y^L|\mathbf X^L}\left(\mathbf Y^L\mid\mathbf X^L\right)}{q_{\mathbf Y^L}\left(\mathbf Y^L\right)}\ge\xi\left(\mathbf X^L\right)\right|\mathbf X^L=\mathsf X^L\right\}\right). \tag{51}
$$

与 (50) 结合，得到弱化的 MC 界

$$
M\le\sup_{\mathbf X^L\in\mathcal F}\left\{\log\xi\left(\mathbf X^L\right)-\log\left(1-\epsilon+\Pr\left\{\left.j\left(\mathbf X^L;\mathbf Y^L\right)\ge\log\xi\left(\mathbf X^L\right)\right|\mathbf X^L=\mathsf X^L\right\}\right)\right\}, \tag{52}
$$

其中

$$
j\left(\mathbf X^L;\mathbf Y^L\right)\triangleq\sum_{\ell=1}^{L}\log\left(\frac{f_{\mathbf Y|\mathbf X}\left(\mathsf Y_\ell\mid\mathsf X_\ell\right)}{q_{\mathbf Y}\left(\mathsf Y_\ell\right)}\right) \tag{53}
$$

称为**失配信息密度**（脚注 4：用"失配"一词表示输出分布 $q_{\mathbf Y}$ 并非由输入分布与信道诱导的分布）。

> 脚注 4（原文）：用"失配"一词表示输出分布 $q_{\mathbf Y}$ 并非由输入分布与信道诱导的分布。

在 (50) 中，我们采用 [29, Sec. IV-A] 为推导非相干 MIMO 瑞利块衰落信道容量上界所选的辅助 pdf $q_\mathbf Y$，即 $q_{\mathbf Y^L}=q_\mathbf Y\times\cdots\times q_\mathbf Y$ 为乘积分布，其中

$$
q_{\mathbf Y}(\mathsf Y)=\frac{1}{\mu^{n_tn_r}\pi^{n_rT}}\frac{\Gamma_{n_t}(T)}{\Gamma_{n_t}(n_t)}\frac{e^{-\sum_{i=1}^{n_t}\frac{\sigma_i^2}{\mu}}e^{-\sum_{i=n_t+1}^{n_r}\sigma_i^2}}{\left(\prod_{i=1}^{n_t}\sigma_i^2\right)^{T-2n_r+n_t}}\frac{1}{\prod_{i=1}^{n_t}\prod_{j=n_t+1}^{n_r}\left(\sigma_i^2-\sigma_j^2\right)^2}, \tag{54}
$$

其中 $\sigma_1\ge\cdots\ge\sigma_{n_r}$ 为 $\mathsf Y$ 的有序非零奇异值，$\mu\triangleq T\rho/n_t$。

接着注意，对每个 $T\times T$ 酉矩阵 $\mathbf A$ 及任意 $\mathbf X$、$\mathbf Y$，有 [24, Eqs. (54) & (55)]

$$
f_{\mathbf Y|\mathbf X}\left(\mathsf Y_\ell\mid\mathbf A^H\mathbf X_\ell\right)=f_{\mathbf Y|\mathbf X}\left(\mathbf A\mathsf Y_\ell\mid\mathbf X_\ell\right) \tag{55a}
$$

$$
q_{\mathbf Y}\left(\mathbf A\mathsf Y\right)=q_{\mathbf Y}\left(\mathsf Y\right). \tag{55b}
$$

由 [37, Prop. 19] 可知，若把信道输入 $\mathbf X_\ell$ 乘以酉矩阵 $\mathbf A_\ell$，$\beta_{1-\epsilon}(\mathbf X^L,q_{\mathbf Y^L})$ 不变。我们进一步注意

$$
f_{\mathbf Y|\mathbf X}\left(\mathsf Y_\ell\mid\mathbf X_\ell\right)=\frac{e^{-\mathrm{tr}\left(\mathsf Y_\ell^H\left(\mathbf I_T+\mathbf X_\ell\mathbf X_\ell^H\right)^{-1}\mathsf Y_\ell\right)}}{\pi^{n_rT}\det\left(\mathbf I_T+\mathbf X_\ell\mathbf X_\ell^H\right)^{n_r}}, \tag{56}
$$

因此 $\beta_{1-\epsilon}(\mathbf X^L,q_{\mathbf Y^L})$ 仅通过乘积 $\mathbf X_\ell\mathbf X_\ell^H$ 依赖 $\mathbf X_\ell$。用 $\mathbf X_\ell$ 的奇异值分解（SVD）

$$
\mathbf X_\ell=\mathbf U_\ell\boldsymbol\Sigma_\ell\mathbf V_\ell^H \tag{57}
$$

（其中 $\mathbf U_\ell$、$\mathbf V_\ell$ 分别为 $T\times T$ 与 $n_t\times n_t$ 酉矩阵，$\boldsymbol\Sigma_\ell$ 为 $T\times n_t$ 矩形对角阵），并令 $\mathbf A_\ell=\mathbf U_\ell$，可知不失最优性可限定信道输入 $\mathbf X_\ell$ 为 $T\times n_t$ 矩形对角阵，对角元为 $d_{1,\ell},\ldots,d_{n_t,\ell}$。直观上，$d_{i,\ell}^2$ 表示相干区间 $\ell$ 中发射天线 $i$ 上的功率。令 $\mathbf D_\ell\triangleq\mathrm{diag}\{d_{1,\ell},\ldots,d_{n_t,\ell}\}$、$\alpha_\ell\triangleq\mathrm{tr}(\mathbf D_\ell^2)/T$；则 $\mathbf D_\ell$ 为 $\mathbf X_\ell$ 前 $n_t$ 行与前 $n_t$ 列构成的对角方阵，即 $\mathbf D_\ell=[\mathbf X_\ell]_{(1:n_t)^2}$（记号见第 I 节末的记号小节）。由功率约束 (6)，对每个 $\ell$ 有 $0\le\alpha_\ell\le\rho$。

由于直接在 $\mathbf X^L$ 上最大化弱化 MC 界很困难，我们希望先借助 Berry–Esseen 定理（引理 5）推导 $j(\mathbf X^L;\mathbf Y^L)$ 条件累积分布函数在 $L\to\infty$ 极限下的渐近展开，再在该展开上对 $\mathbf X^L$ 最大化。然而，Berry–Esseen 定理只有在 $j(\mathbf X^L;\mathbf Y^L)$ 的绝对三阶中心矩除以其方差的 $3/2$ 次幂在 $\mathbf X^L\in\mathcal F$ 上有界时，才给出有意义的渐近展开；不幸的是，当 $\mathbf X^L$ 的范数很小时并非如此，因为 $j(\mathbf X^L;\mathbf Y^L)$ 的方差随 $\mathbf X^L\to0$ 消失。为避免该问题，我们沿用 [19] 的思想，把码本 $\mathcal C$ 分解为两个子码本 $\mathcal C_1$ 与 $\mathcal C_2$：$\mathcal C_1$ 包含所有在至少一半相干区间内满足 $d_{i,\ell}^2>\bar\delta\rho$（$i=1,\ldots,n_t$，其中 $\bar\delta$ 由 (60) 定义）的码字，$\mathcal C_2$ 包含其余码字。显然，若 $\mathcal C_1$ 与 $\mathcal C_2$ 的最大错误概率均为 $\epsilon$，则 $\mathcal C$ 的最大错误概率不可能小于 $\epsilon$。对 $\mathcal C_1$ 中的码字，$j(\mathbf X^L;\mathbf Y^L)$ 的方差有正下界，因而可应用 Berry–Esseen 定理得到有意义的渐近展开；更精确地说，Berry–Esseen 比 $\bar B(\mathbf D^L,T,\rho)$（见下文 (78)）可被正常数上界。对 $\mathcal C_2$ 中的码字，我们应用 Chebyshev 不等式——精度较低但适用于所有 $\mathbf X^L$。随后我们证明当 $L\to\infty$ 时整个码本 $\mathcal C$ 的基数由 $\mathcal C_1$ 的基数主导，因此 $R^*(L,T,\epsilon,\rho)$ 渐近地被 $\mathcal C_1$ 最大编码速率的上界所上界，而对 $\mathcal C_2$ 中码字的较不精细分析不影响结论。

下面给出 $R^*(L,T,\epsilon,\rho)$ 上界的详细证明。首先把码本 $\mathcal C$ 分为子码本 $\mathcal C_1$ 与 $\mathcal C_2$，并用弱化 MC 界 (52) 上界二者的基数：

$$
\log\left|\mathcal C_i\right|\le\sup_{\mathbf X^L\in\mathcal C_i}\left\{\log\xi\left(\mathbf D^L\right)-\log\left(1-\epsilon+\Pr\left\{j\left(\mathbf X^L;\mathbf Y^L\right)\ge\log\xi\left(\mathbf D^L\right)\mid\mathbf X^L=\mathsf X^L\right\}\right)\right\},\quad i=1,2, \tag{58}
$$

其中（记号略有滥用）我们把 (52) 中的 $\xi(\mathbf X^L)$ 替换为 $\xi(\mathbf D^L)$；因此 $\xi(\mathbf D^L)>0$ 为任意门限，可依赖 $\mathbf D^L$，其具体取值稍后定义。最后我们证明当 $\rho$ 与 $L$ 均趋于无穷时，整个码本 $\mathcal C$ 的基数可由 $\mathcal C_1$ 的基数近似，从而 $R^*(L,T,\epsilon,\rho)$ 渐近地被 $\mathcal C_1$ 最大编码速率的上界所上界。

为在数学上定义 $\mathcal C_1$ 与 $\mathcal C_2$，先引入集合

$$
\mathcal D_1\triangleq\left\{\mathbf D\in\mathcal D_{n_t}:d_i^2>\bar\delta\rho,\ i=1,\ldots,n_t\right\}, \tag{59a}
$$

$$
\mathcal D_2\triangleq\mathcal D_{n_t}\setminus\mathcal D_1, \tag{59b}
$$

其中 $\mathcal D_{n_t}$ 表示元素非负实值、满足 $\mathrm{tr}(\mathbf D^2)\le T\rho$ 的 $(n_t\times n_t)$ 维对角矩阵 $\mathbf D$ 的集合，$d_i$ 为 $\mathbf D$ 的第 $i$ 个对角元。再令

$$
\bar\delta\triangleq\frac{T}{n_t}-\frac{T}{2n_r\sqrt{n_t}\sqrt{\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)^2\right]+1}}. \tag{60}
$$

该 $\bar\delta$ 的选取满足功率约束 $n_t\bar\delta\rho\le T\rho$，并保证 Berry–Esseen 比 $\bar B(\mathbf D^L,T,\rho)$（见下文 (78)）有界。我们进一步论证 $\bar\delta>0$：利用如下引理计算 $\mathbb E[(\log\det(\mathbf H_\ell\mathbf H_\ell^H))^2]$。

**引理 7（Wishart 矩阵）** 设 $\mathbf W$ 为服从 $\mathcal W(m,n)$（$m\le n$）的 Wishart 矩阵，即 $\mathbf W=\mathbf Z\mathbf Z^H$，其中 $\mathbf Z$ 为 $m\times n$ 维、元素独立同分布服从 $\mathcal{CN}(0,1)$ 的矩阵。则

$$
\mathbb E[\log\det\mathbf W]=\sum_{i=0}^{m-1}\Psi(n-i), \tag{61}
$$

$$
\mathrm{Var}\left(\log\det\mathbf W\right)=\sum_{i=0}^{m-1}\Psi'(n-i). \tag{62}
$$

**证明：** 见 [31, Lemma A.2]。

由引理 7 可得

$$
\mathbb E\left[\left(\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right)^2\right]
=\left(\sum_{i=0}^{n_t-1}\Psi(n_t-i)\right)^2+\sum_{i=0}^{n_t-1}\Psi'(n_t-i). \tag{63}
$$

由于 $n_t\le n_r$（假设）且 $\Psi'(1)=\pi^2/6$ [38, Th. 2.11]，可知 $\bar\delta>0$。

对矩阵序列 $\mathbf D^L=(\mathbf D_1,\ldots,\mathbf D_L)$，令

$$
L_{\mathcal D_1}\left(\mathbf D^L\right)\triangleq\sum_{\ell=1}^{L}\mathbf 1\left\{\mathbf D_\ell\in\mathcal D_1\right\}. \tag{64}
$$

定义两个子码本

$$
\mathcal C_1\triangleq\left\{\mathbf X^L\in\mathcal C:L_{\mathcal D_1}\left(\mathbf D^L\right)\ge L/2,\ \mathbf D_\ell=\left[\mathbf X_\ell\right]_{(1:n_t)^2}\right\}, \tag{65a}
$$

$$
\mathcal C_2\triangleq\left\{\mathbf X^L\in\mathcal C:L_{\mathcal D_1}\left(\mathbf D^L\right)<L/2,\ \mathbf D_\ell=\left[\mathbf X_\ell\right]_{(1:n_t)^2}\right\}. \tag{65b}
$$

换言之，子码本 $\mathcal C_1$ 包含所有对角元在至少一半时刻 $\ell=1,\ldots,L$ 满足 $d_{i,\ell}^2>\bar\delta\rho$（$i=1,\ldots,n_t$）的码字。

**1）$\mathcal C_1$ 基数的上界。** $\log|\mathcal C_1|$ 的上界由弱化 MC 界 (58) 给出。为得到可处理的表达式，我们进一步上界概率 $\Pr\{j(\mathbf X^L;\mathbf Y^L)\ge\log\xi(\mathbf D^L)\mid\mathbf X^L=\mathsf X^L\}$（(66)）。事实上，如前述，不失最优性可设 $\mathbf X_\ell$ 为 $T\times n_t$ 矩形对角阵，对角元为 $d_{1,\ell},\ldots,d_{n_t,\ell}$。把 (54) 中的 $q_{\mathbf Y}(\mathsf Y)$ 与 (56) 中的 $f_{\mathbf Y|\mathbf X}(\mathsf Y_\ell\mid\mathbf X_\ell)$ 代入 (53)，得到

$$
j\left(\mathbf X^L;\mathbf Y^L\right)=\sum_{\ell=1}^{L}j_\ell\left(\mathbf X_\ell;\mathbf Y_\ell\right), \tag{67}
$$

其中

$$
\begin{aligned}
j_\ell\left(\mathbf X_\ell;\mathbf Y_\ell\right)=\ &n_tn_r\log\left(\frac{T\rho}{n_t}\right)+\log\left(\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}\right)
+\frac{n_t}{T\rho}\sum_{i=1}^{n_t}\sigma_{i,\ell}^2+\sum_{i=n_t+1}^{n_r}\sigma_{i,\ell}^2-\mathrm{tr}\left(\mathsf Y_\ell^H\left(\mathbf I_T+\mathbf X_\ell\mathbf X_\ell^H\right)^{-1}\mathsf Y_\ell\right)\\
&-n_r\log\det\left(\mathbf I_{n_t}+\mathbf X_\ell\mathbf X_\ell^H\right)+(T-2n_r+n_t)\log\left(\prod_{i=1}^{n_t}\sigma_{i,\ell}^2\right)\\
&+2\log\left(\prod_{i=1}^{n_t}\prod_{j=n_t+1}^{n_r}\left(\sigma_{i,\ell}^2-\sigma_{j,\ell}^2\right)\right),
\end{aligned}\tag{68}
$$

其中 $\boldsymbol\sigma_\ell=(\sigma_{1,\ell},\ldots,\sigma_{n_r,\ell})$ 为 $\mathsf Y_\ell$ 的有序奇异值。

我们在附录 III 中证明：$j_\ell(\mathbf X_\ell;\mathbf Y_\ell)$ 可被某个项上界，而在给定 $\mathbf X_\ell=\mathsf X_\ell$ 时该项与

$$
\bar j\left(\mathbf D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\triangleq
\begin{aligned}[t]
&n_tn_r\log\left(\frac{T\rho}{n_t}\right)+\log\left(\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}\right)\\
&+\sum_{i=1}^{n_t}\left(\frac{n_t+n_td_{i,\ell}^2}{T\rho}-1\right)Z'_{i,\ell}-\frac{T\rho-n_t}{T\rho}\sum_{i=1}^{n_t}Z''_{i,\ell}\\
&+(T-n_t-n_r)\log\det\left(\mathbf I_{n_t}+\mathbf D_\ell^2\right)\\
&+(T-n_t)\log\det\left(\mathbf H_\ell\mathbf H_\ell^H+\lambda_1\left(\mathbf Q_\ell^H\mathbf Q_\ell\right)\left(\mathbf I_{n_t}+\mathbf D_\ell^2\right)^{-1}\right)
\end{aligned}\tag{69}
$$

同分布，其中 $\mathbf Z'_\ell=\{Z'_{1,\ell},\ldots,Z'_{n_t,\ell}\}$ 与 $\mathbf Z''_\ell=\{Z''_{1,\ell},\ldots,Z''_{n_t,\ell}\}$ 均为独立同分布随机变量序列，前者服从 Gamma 分布 $\Gamma(n_r,1)$ 且满足 $\sum_{i=1}^{n_t}Z'_{i,\ell}=\mathrm{tr}(\mathbf H_\ell\mathbf H_\ell^H)$，后者服从 Gamma 分布 $\Gamma(T-n_t,1)$；$\mathbf Q_\ell$ 为 $(T-n_t)\times n_r$ 维、元素独立同分布服从 $\mathcal{CN}(0,1)$ 且与 $\mathbf H_\ell$ 独立的随机矩阵；$\lambda_1(\mathbf Q_\ell^H\mathbf Q_\ell)$ 表示 $\mathbf Q_\ell^H\mathbf Q_\ell$ 的最大特征值。此外，序列 $\{\mathbf Z'_1,\ldots,\mathbf Z'_L\}$、$\{\mathbf Z''_1,\ldots,\mathbf Z''_L\}$、$\{\mathbf Q_1,\ldots,\mathbf Q_L\}$ 均独立同分布，且 $\{\mathbf Z''_1,\ldots,\mathbf Z''_L\}$ 与 $\{\mathbf H^L,\mathbf Z'_1,\ldots,\mathbf Z'_L\}$ 相互独立。由于 $\bar j_\ell(\mathbf D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell)$ 仅通过 $\mathbf D^L$ 依赖 $\mathbf X^L$，可得

$$
\Pr\left\{\sum_{\ell=1}^{L}j_\ell\left(\mathbf X_\ell;\mathbf Y_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\mid\mathbf X^L=\mathsf X^L\right\}
\le\Pr\left\{\sum_{\ell=1}^{L}\bar j\left(\mathbf D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\right\}. \tag{70}
$$

为后续引用，$\bar j(\mathbf D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell)$ 的期望为

$$
\begin{aligned}
\bar J\left(\mathbf D_\ell,T,\rho\right)=\ &n_tn_r\log\left(\frac{T\rho}{n_t}\right)+\log\left(\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}\right)
+\sum_{i=1}^{n_t}\left(\frac{n_t+n_td_{i,\ell}^2}{T\rho}-1\right)n_r-\frac{T\rho-n_t}{T\rho}n_t(T-n_t)\\
&+(T-n_t-n_r)\log\det\left(\mathbf I_{n_t}+\mathbf D_\ell^2\right)
+(T-n_t)\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H+\lambda_1\left(\mathbf Q_\ell^H\mathbf Q_\ell\right)\left(\mathbf I_{n_t}+\mathbf D_\ell^2\right)^{-1}\right)\right],
\end{aligned}\tag{71}
$$

因为 $Z'_{i,\ell}$ 与 $Z''_{i,\ell}$ 分别服从均值为 $\mathbb E[Z'_{i,\ell}]=n_r$、$\mathbb E[Z''_{i,\ell}]=T-n_t$ 的 Gamma 分布。把 (70) 与 (58) 结合，可把子码本 $\mathcal C_1$ 的基数上界为

$$
\log\left|\mathcal C_1\right|\le\sup_{\mathbf X^L\in\mathcal C_1}\left\{\log\xi\left(\mathbf D^L\right)-\log\left(1-\epsilon+\Pr\left\{\sum_{\ell=1}^{L}\bar j\left(\mathbf D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\right\}\right)\right\} \tag{72}
$$

对每个 $\xi:\mathcal D_{n_t}^L\to(0,1)$ 成立。接着基于 Berry–Esseen 定理对 (72) 做渐近分析；为此需要以下辅助引理。

**引理 8：** 令 $\bar U(D,T,\rho)\triangleq\mathbb E[(\bar j(D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell)-\bar J(D,T,\rho))^2]$、$\bar S(D,T,\rho)\triangleq\mathbb E[|\bar j(D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell)-\bar J(D,T,\rho)|^3]$（$D\in\mathcal D_{n_t}$）。则对每个 $T\ge n_r+n_t$ 与任意正常数 $\rho_0$，有

$$
\sup_{\rho\ge\rho_0}\sup_{D\in\mathcal D_{n_t}}\bar U(D,T,\rho)<1, \tag{73}
$$

$$
\sup_{\rho\ge\rho_0}\sup_{D\in\mathcal D_{n_t}}\bar S(D,T,\rho)<1. \tag{74}
$$

**证明：** 见附录 IV。

**引理 9：** 对每个 $D\in\mathcal D_1$，有

$$
\bar U(D,T,\rho)\ge(T-n_t)n_t+K_{\bar U}(D,T,\rho), \tag{75}
$$

其中 $K_{\bar U}(D,T,\rho)$ 为 $D$、$T$、$\rho$ 的函数，满足 $\lim_{\rho\to\infty}\sup_{D\in\mathcal D_1}|K_{\bar U}(D,T,\rho)|=0$。

**证明：** 见附录 V。

引理 8 意味着存在只依赖 $T$ 的 $\bar S(T)$，使 $\bar S(D,T,\rho)\le\bar S(T)$（$D\in\mathcal D_{n_t}$，$\rho>\rho_0$）。此外，对 $\rho\ge\rho_0$ 与充分大的 $\rho_0$，由 $K_{\bar U}(D,T,\rho)$ 的定义有 $K_{\bar U}(D,T,\rho)\le(T-n_t)n_t/2$（$D\in\mathcal D_1$）。因此由引理 9，对 $\rho\ge\rho_0$ 与 $\mathbf X^L\in\mathcal C_1$，

$$
\sum_{\ell=1}^{L}\bar U\left(D_\ell,T,\rho\right)\ge L_{\mathcal D_1}\left(\mathbf D^L\right)\frac{(T-n_t)n_t}{2}\ge\frac{L}{2}\frac{(T-n_t)n_t}{2}, \tag{76}
$$

因为 $\mathcal C_1$ 中所有码字满足 $L_{\mathcal D_1}(\mathbf D^L)\ge L/2$。结合这两个结果，可对 $\mathbf X^L\in\mathcal C_1$ 上界如下比值：

$$
\bar B\left(\mathbf D^L,T,\rho\right)\triangleq\frac{6\sum_{\ell=1}^{L}\bar S\left(D,T,\rho\right)}{\left(\sum_{\ell=1}^{L}\bar U\left(D_\ell,T,\rho\right)\right)^{3/2}}, \tag{78}
$$

$$
\bar B\left(\mathbf D^L,T,\rho\right)\le\frac{6L\bar S(T)}{\left[L(T-n_t)n_t/4\right]^{3/2}}\triangleq\frac{\bar B(T)}{\sqrt{L}},\quad\mathbf X^L\in\mathcal C_1,\ \mathbf D_\ell=\left[\mathbf X_\ell\right]_{(1:n_t)^2}, \tag{79}
$$

其中 $\bar B(T)$ 为 $T$ 的函数。

有了这些准备，即可把 Berry–Esseen 定理（引理 5）应用于上界 (72)。令

$$
\log\xi\left(\mathbf D^L\right)=\sum_{\ell=1}^{L}\bar J\left(D_\ell,T,\rho\right)-\lambda\sqrt{\sum_{\ell=1}^{L}\bar U\left(D_\ell,T,\rho\right)}, \tag{80a}
$$

$$
\lambda=Q^{-1}\left(\epsilon+2\bar B(T)\frac{1}{\sqrt{L}}\right),\quad0<\epsilon<1/2. \tag{80b}
$$

则由 Berry–Esseen 定理可得

$$
\Pr\left\{\sum_{\ell=1}^{L}\bar j\left(D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\right\}\le1-\epsilon+\bar B(T)\frac{1}{\sqrt{L}}. \tag{81}
$$

把 (80) 与 (81) 代入上界 (72)，对 $L\ge L_0$ 与充分大的 $L_0$ 得到

$$
\begin{aligned}
\frac{\log\left|\mathcal C_1\right|}{L}
&\le\frac{1}{L}\sup_{\mathbf X^L\in\mathcal C_1}\left\{\log\xi\left(\mathbf D^L\right)-\log\left(1-\epsilon+\Pr\left\{\sum_{\ell=1}^{L}\bar j\left(D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\right\}\right)\right\}\\
&\le\frac{1}{L}\sup_{\mathbf X^L\in\mathcal C_1}\left\{\sum_{\ell=1}^{L}\bar J\left(D_\ell,T,\rho\right)-\sqrt{\sum_{\ell=1}^{L}\bar U\left(D_\ell,T,\rho\right)}Q^{-1}\left(\epsilon+2\bar B(T)\frac{1}{\sqrt{L}}\right)\right\}-\frac{\log\bar B(T)}{L}+\frac{\log L}{2L}\\
&\le\frac{1}{L}\sup_{\mathbf X^L\in\mathcal C_1}\left\{\sum_{\ell=1}^{L}\bar J\left(D_\ell,T,\rho\right)-\sqrt{\frac{\sum_{\ell=1}^{L}\bar U\left(D_\ell,T,\rho\right)}{L}}Q^{-1}\left(\epsilon+2\bar B(T)\frac{1}{\sqrt{L}}\right)\right\}-\frac{\log\bar B(T)}{L}+\frac{\log L}{2L}\\
&=\frac{1}{L}\sup_{\mathbf X^L\in\mathcal C_1}\sum_{\ell=1}^{L}\left\{\bar J\left(D_\ell,T,\rho\right)-\sqrt{\frac{\bar U\left(D_\ell,T,\rho\right)}{L}}Q^{-1}\left(\epsilon+2\bar B(T)\frac{1}{\sqrt{L}}\right)\right\}-\frac{\log\bar B(T)}{L}+\frac{\log L}{2L},
\end{aligned}\tag{82}
$$

其中第三个不等式由 $0<\epsilon<1/2$ 时对足够大的 $L$ 逆 $Q$ 函数为正、并对平方根函数应用 Jensen 不等式得到。

把 $Q^{-1}(\epsilon+2\bar B(T)/\sqrt{L})$ 在 $\epsilon$ 附近作 Taylor 级数展开，可得

$$
\left|Q^{-1}\left(\epsilon+2\bar B(T)\frac{1}{\sqrt{L}}\right)-Q^{-1}(\epsilon)\right|\le\frac{A}{\sqrt{L}},\quad L\ge L_0, \tag{83}
$$

其中 $A$、$L_0$、$\rho_0$ 与 $L$、$\rho$ 无关。进一步利用由引理 8 得到的 $\bar U(D_\ell,T,\rho)$ 在 $D_\ell\in\mathcal D_{n_t}$、$\rho\ge\rho_0$ 上的有界性，并收集 $\log L/L$ 阶项，可把上界 (82) 重写为

$$
\frac{\log\left|\mathcal C_1\right|}{L}\le\frac{1}{L}\sup_{\mathbf X^L\in\mathcal C_1}\sum_{\ell=1}^{L}\left\{\bar J\left(D_\ell,T,\rho\right)-\sqrt{\frac{\bar U\left(D_\ell,T,\rho\right)}{L}}Q^{-1}(\epsilon)\right\}+K_1(L,T,\rho), \tag{84}
$$

其中 $K_1(L,T,\rho)$ 为 $L$、$T$、$\rho$ 的函数，满足

$$
\sup_{\rho\ge\rho_0}\left|K_1(L,T,\rho)\right|\le A\frac{\log L}{L},\quad L\ge L_0, \tag{85}
$$

其中 $A$、$L_0$、$\rho_0$ 与 $L$、$\rho$ 无关。

由于 $\mathbf X_\ell$ 在每个相干块中满足功率约束 $\|\mathbf X_\ell\|^2\le T\rho$，且 (82) 中每个求和项只依赖一个 $\mathbf X_\ell$，(82) 右端的上确界可写为

$$
\begin{aligned}
&\sum_{\ell:\ D_\ell\in\mathcal D_1}\sup_{D\in\mathcal D_1}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}
+\sum_{\ell:\ D_\ell\in\mathcal D_2}\sup_{D\in\mathcal D_2}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}\\
&=L_{\mathcal D_1}\left(\mathbf D^L\right)\sup_{D\in\mathcal D_1}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}\\
&\quad+\left(L-L_{\mathcal D_1}\left(\mathbf D^L\right)\right)\sup_{D\in\mathcal D_2}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}
\end{aligned}\tag{86}
$$

并在 $L_{\mathcal D_1}(\mathbf D^L)\ge L/2$ 上最大化。接着用如下引理上界 (86)。

**引理 10：** 对每个满足 $\mathrm{tr}(\mathbf D^2)\ge T\rho(1-\delta)$（某 $0<\delta\le\frac{1}{2}$）的 $D\in\mathcal D_{n_t}$，有

$$
\bar U(D,T,\rho)\ge\bar U\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right)-\Upsilon(T)\delta,\quad\rho\ge\rho_0, \tag{87}
$$

其中 $\Upsilon(T)$ 为只依赖 $T$ 的正数，$\rho_0$ 为任意正常数。

**证明：** 见附录 VI。

**引理 11：** 假设 $T\ge n_t+n_r$。对 $\rho\ge\rho_0$、$L\ge L_0$ 与充分大的 $\rho_0$、$L_0$（只依赖 $T$ 与 $\epsilon$），有

$$
\sup_{D\in\mathcal D_1}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}\le\sup_{D\in\mathcal D_{n_t}:\ \mathrm{tr}(D^2)\ge T\rho\left(1-\frac{K(T)}{L}\right)}\left\{\bar J^*(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}+K_{\mathcal D_1}(T,\rho), \tag{88}
$$

其中 $K(T)$ 为只依赖 $T$ 的非负常数，且

$$
\begin{aligned}
\bar J^*(D,T,\rho)\triangleq\ &n_tn_r\log\left(\frac{T\rho}{n_t}\right)+\log\left(\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}\right)
+\left(\frac{T\alpha-T\rho}{T\rho}\right)n_rn_t-n_t(T-n_t)\\
&+(T-n_t-n_r)\log\det\left(\mathbf I_{n_t}+D^2\right)+(T-n_t)\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right],
\end{aligned}\tag{89}
$$

而 $K_{\mathcal D_1}(T,\rho)$ 为只依赖 $T$、$\rho$ 的非负常数，满足 $\lim_{\rho\to\infty}K_{\mathcal D_1}(T,\rho)=0$。

**证明：** 见附录 VII。

**引理 12：** 在 $D\in\mathcal D_1$ 上最大化时，$\bar J^*(D,T,\rho)$ 为

$$
\sup_{D\in\mathcal D_1}\bar J^*(D,T,\rho)=\bar J_{\mathcal D_1}(T,\rho),\quad\rho>0, \tag{90}
$$

其中

$$
\begin{aligned}
\bar J_{\mathcal D_1}(T,\rho)\triangleq\ &n_tn_r\log\left(\frac{T\rho}{n_t}\right)+\log\left(\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}\right)
-n_t(T-n_t)+(T-n_t-n_r)\log\left(1+\frac{T\rho}{n_t}\right)^{n_t}\\
&+(T-n_t)\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H\right)\right].
\end{aligned}\tag{91}
$$

**证明：** 见附录 VIII。

**引理 13：** 对每个 $D\in\mathcal D_1$，有

$$
\bar U\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right)\ge\bar U^*\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right)+K_{\bar U}\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right), \tag{92}
$$

其中 $K_{\bar U}(\cdot,\cdot,\cdot)$ 满足 $\lim_{\rho\to\infty}\sup_{D\in\mathcal D_1}|K_{\bar U}(D,T,\rho)|=0$。

**证明：** 见附录 IX。

**引理 14：** 在 $D\in\mathcal D_2$ 上最大化时，$\bar J(D,T,\rho)$ 可界为

$$
\bar J_{\mathcal D_2}(T,\rho)\le\sup_{D\in\mathcal D_2}\bar J(D,T,\rho)\le\bar J_{\mathcal D_2}(T,\rho)+K_{\mathcal D_2}(T,\rho),\quad\rho\ge\rho_0, \tag{93}
$$

其中

$$
\begin{aligned}
\bar J_{\mathcal D_2}(T,\rho)\triangleq\ &n_tn_r\log\left(\frac{T\rho}{n_t}\right)+\log\left(\frac{\Gamma_{n_t}(n_t)}{\Gamma_{n_t}(T)}\right)
-n_t(T-n_t)+(T-n_t-n_r)\log\left(\left(1+\bar\delta\rho\right)\left(1+\frac{T-\bar\delta}{n_t-1}\rho\right)^{n_t-1}\right)\\
&+(T-n_t)\mathbb E\left[\log\det\left(\mathbf H_\ell\mathbf H_\ell^H+\lambda_1\left(\mathbf Q_\ell^H\mathbf Q_\ell\right)\mathbf I_{n_t}\right)\right],
\end{aligned}\tag{94}
$$

$K_{\mathcal D_2}(T,\rho)$ 为只依赖 $T$、$\rho$ 的非负常数，满足 $\lim_{\rho\to\infty}K_{\mathcal D_2}(T,\rho)=0$。

**证明：** 见附录 X。

利用引理 12 与 14，我们可把 (86) 中 $\mathcal D_1$ 与 $\mathcal D_2$ 上的上确界分别用 $\bar J_{\mathcal D_1}(T,\rho)$ 与 $\bar J_{\mathcal D_2}(T,\rho)$ 表示，并证明当 $\rho\to\infty$、$L\to\infty$ 时 $\mathcal D_2$ 的贡献被 $\mathcal D_1$ 的贡献严格压过。具体而言，定义

$$
\Theta(T,\rho)\triangleq\bar J_{\mathcal D_1}(T,\rho)-\bar J_{\mathcal D_2}(T,\rho), \tag{95}
$$

可证其双重极限 $\lim_{\rho\to\infty}\lim_{L\to\infty}$ 存在且为 $\Theta(T)<0$（附录中给出渐近行为）。于是存在 $\rho_0$、$L_0$，使得对 $\rho\ge\rho_0$、$L\ge L_0$，

$$
\sup_{D\in\mathcal D_2}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}<\sup_{D\in\mathcal D_1}\left\{\bar J(D,T,\rho)-\sqrt{\frac{\bar U(D,T,\rho)}{L}}Q^{-1}(\epsilon)\right\}, \tag{96}
$$

从而 (86) 的上确界在 $L_{\mathcal D_1}(\mathbf D^L)=L$ 时取得。综合上述，可得

$$
\frac{\log\left|\mathcal C_1\right|}{L}\le\bar J_{\mathcal D_1}(T,\rho)-\sqrt{\frac{\bar V(T)-\bar K_{\bar U}(T,\rho)}{L}}Q^{-1}(\epsilon)+K_{\mathcal D_1}(T,\rho)+K_{\mathcal C_1}(L,T), \tag{97}
$$

其中 $\bar V(T)-\bar K_{\bar U}(T,\rho)$ 为 $\bar U$ 的渐近主项（详见附录 VII–IX），$K_{\mathcal C_1}(L,T)$ 满足 $|K_{\mathcal C_1}(L,T)|\le A\log L/L$。

**2）$\mathcal C_2$ 基数的上界。** $\log|\mathcal C_2|$ 的上界由弱化 MC 界 (58) 与 (70) 给出：

$$
\log\left|\mathcal C_2\right|\le\sup_{\mathbf X^L\in\mathcal C_2}\left\{\log\xi\left(\mathbf D^L\right)-\log\left(1-\epsilon+\Pr\left\{\sum_{\ell=1}^{L}\bar j\left(D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\right\}\right)\right\}. \tag{98}
$$

由引理 8，存在只依赖 $T$ 的 $\bar U(T)$ 使

$$
\bar U(D,T,\rho)\le\bar U(T),\quad D\in\mathcal D_{n_t},\ \rho>\rho_0. \tag{99}
$$

若取

$$
\log\xi\left(\mathbf D^L\right)=\sum_{\ell=1}^{L}\bar J_\ell\left(D_\ell,T,\rho\right)+\sqrt{\frac{2L\bar U(T)}{1-\epsilon}}, \tag{100}
$$

则 Chebyshev 不等式给出

$$
\Pr\left\{\sum_{\ell=1}^{L}\bar j\left(D_\ell,\mathbf Z'_\ell,\mathbf Z''_\ell,\mathbf H_\ell,\mathbf Q_\ell\right)\ge\log\xi\left(\mathbf D^L\right)\right\}\le\frac{1-\epsilon}{2}, \tag{101}
$$

从而可把 (98) 上界为

$$
\log\left|\mathcal C_2\right|\le\sup_{\mathbf X^L\in\mathcal C_2}\sum_{\ell=1}^{L}\bar J_\ell\left(D_\ell,T,\rho\right)+\sqrt{\frac{2L\bar U(T)}{1-\epsilon}}+\log\left(\frac{1-\epsilon}{2}\right). \tag{102}
$$

尚需上界 (102) 右端的上确界。把求和按 $D_\ell\in\mathcal D_1$ 与 $D_\ell\in\mathcal D_2$ 拆分为两部分，并利用 (119) 式的论证可得

$$
\log\left|\mathcal C_2\right|\le L\left(\bar J_{\mathcal D_1}(T,\rho)-\frac{1}{2}\Theta(T,\rho)\right)+K_{\mathcal D_1}(T,\rho)+K_{\mathcal D_2}(T,\rho)+K_{\mathcal C_2}(L,T), \tag{103}
$$

其中 $K_{\mathcal C_2}(L,T)$ 满足 $|K_{\mathcal C_2}(L,T)|\le A/L$。

**3）上界组合。** 由于 $|\mathcal C|\le|\mathcal C_1|+|\mathcal C_2|$，把 (97) 与 (103) 结合，并利用当 $L\to\infty$ 时 $\mathcal C_2$ 的贡献被 $\Theta(T)<0$ 压过（即 $|\mathcal C_2|/|\mathcal C_1|\to0$ 超指数快），可得对 $\rho\ge\rho_0$、$L\ge L_0$，

$$
\frac{\log|\mathcal C|}{L}\le\frac{\log\left|\mathcal C_1\right|}{L}+\frac{1}{L}\log\left(1+e^{-\frac{L\Theta(T)}{16}}\right), \tag{104}
$$

其中第二项随 $L$ 超指数衰减。于是由 (97) 得到

$$
R^*(L,T,\epsilon,\rho)=\frac{\log M}{LT}\le\frac{\bar J_{\mathcal D_1}(T,\rho)}{T}-\sqrt{\frac{\tilde V(T)-K_{\bar U}(T,\rho)}{L}}Q^{-1}(\epsilon)+K_{\mathcal D_1}(T,\rho)+K_{\mathrm{MC}}(L,T), \tag{105}
$$

其中 $K_{\mathrm{MC}}(L,T)$ 满足 $|K_{\mathrm{MC}}(L,T)|\le A\log L/L$（对与 $L$、$\rho$ 无关的某常数 $A$ 与 $L_0$）。比较 (91) 与 (10) 可见

$$
\frac{\bar J_{\mathcal D_1}(T,\rho)}{T}=\tilde I(T,\rho)+K_{\bar J}(T,\rho), \tag{106}
$$

其中 $K_{\bar J}(T,\rho)$ 为 $T$、$\rho$ 的函数，随 $\rho\to\infty$ 消失。因此可把 (105) 写为

$$
R^*(L,T,\epsilon,\rho)\le\tilde I(T,\rho)+K_{\mathrm{MC}}(T,\rho)-\sqrt{\frac{\tilde V(T)-K_{\bar U}(T,\rho)}{L}}Q^{-1}(\epsilon)+K_{\mathrm{MC}}(L,T), \tag{107}
$$

其中 $K_{\mathrm{MC}}(T,\rho)\triangleq K_{\mathcal D_1}(T,\rho)+K_{\bar J}(T,\rho)$。注意 $\tilde K_\xi(T,\rho)$（$\xi\in\{\mathrm{MC},\bar U\}$）满足 (12)，而 $K_{\mathrm{MC}}(L,T)$ 满足 (13)。把下界 (49) 与上界 (107) 结合，即得定理 1 的表达式 (9)。证毕。

## V. 结论

我们给出了非相干 MIMO 瑞利块衰落信道上，使用跨越 $L$ 个长度为 $T$ 的相干区间、满足每块功率约束 $\rho$、错误概率不超过 $\epsilon$ 的纠错码时，最大编码速率 $R^*(L,T,\epsilon,\rho)$ 的高 SNR 正态近似。虽然该近似是在相干区间数 $L$ 与 SNR $\rho$ 趋于无穷的假设下推导的，数值分析表明它在中等 SNR 与相干区间下已经准确。例如，对 25 dB 的 SNR，该高 SNR 正态近似对任意收发天线数、5 个及以上相干区间都准确；对 2 根发射天线与 4 根接收天线，它在 15 dB 时已经准确。

所得正态近似补充了 [23] 与 [24] 中计算代价高昂的非渐近界，并为进一步解析研究最大编码速率随系统参数（SNR、相干区间数、收发天线数、码长等）的变化奠定了理论基础。除其他用途外，它使在有限码长与有限 SNR 下分析分集、复用与信道估计代价之间的基本折中成为可能。在第 III-C 节中，我们应用该正态近似确定：为在有限码长下优化最大编码速率，应从 $n_t$ 根可用发射天线中启用多少根。确实，复用增益与衰落系数估计代价之间存在折中，而两者都随活跃发射天线数增长。就信道容量而言该折中是平凡的，但在有限码长下最大编码速率对活跃发射天线数的依赖更为复杂。最后，与 [6]–[15] 中所用的正态近似类似，我们的正态近似可作为短包无线通信系统协议分析中最大编码速率的代理量。

## 致谢与资助说明

作者感谢与 W. Yang 的有益讨论，并感谢副编辑 E. Jorswieck 与匿名审稿人的宝贵意见。

作者单位：Chao Qi 就职于西华大学计算机与软件工程学院（成都 610039，中国，邮箱：chaoqi@mail.xhu.edu.cn）；Tobias Koch 就职于马德里卡洛斯三世大学信号理论与通信系（Leganés 28911，西班牙）以及 Gregorio Marañón 健康研究所（Madrid 28007，西班牙，邮箱：tkoch@ing.uc3m.es）。资助：Tobias Koch 受欧盟 Horizon 2020 研究与创新计划下欧洲研究理事会（ERC）资助（Grant No. 714161），并受西班牙科学与创新部 Grants RYC-2014-16332、TEC2016-78434-C3-3-R（AEI/FEDER, EU）、PID2020-116683GB-C21 / AEI / 10.13039/501100011033 以及马德里自治区 Grant IDEA-CM（TEC-2024/COM-89）资助。本文部分材料曾在 2020 年 6 月于洛杉矶举行的 IEEE 国际信息论研讨会（ISIT）上报告。

## 附录 I–X

> 说明：原论文 49 页中约 28 页为附录 I–X 的证明，包含大量长式代数推导与不等式链。以下按原文结构逐附录译出各附录的目标、主要步骤与关键编号公式；对纯代数变形（如逐项展开、界估计与求和重排）按原文逻辑概述，不逐式复现——其中若干处原始抽取文本的公式排版严重错乱，逐式转录存在失真风险，故以概述方式如实呈现并在页尾说明。

### 附录 I. 引理 2 的证明

为证明引理 2，我们先在附录 I-A 中分析 USTM 信息密度 $i^{(U)}(X;Y)$，并把它表示为 $Y$ 的奇异值的函数（脚注 5：本附录中下标 $\ell$ 无关紧要，故省略）；随后在附录 I-B 中研究这些奇异值在 $\rho\to\infty$ 极限下的渐近行为；在附录 I-C 中证明信道色散的收敛性（即引理 2）；部分辅助推导推迟到附录 I-D。

**A. USTM 信息密度 $i^{(U)}(X;Y)$。** 如 [24, App. A] 所论证，给定 $X=\sqrt{T\rho/n_t}U$ 时 USTM 信息密度的条件分布不依赖 $U$。故不失一般性，以下取 $X=\sqrt{T\rho/n_t}U$，其中

$$
U=\begin{bmatrix}I_{n_t}\\0_{(T-n_t)\times n_t}\end{bmatrix}. \tag{134}
$$

考虑 $H$ 的 SVD，即 $H=U_HS_HV_H^H$，其中 $U_H$、$V_H$ 分别为 $n_t\times n_t$ 与 $n_r\times n_r$ 酉矩阵，$S_H$ 为 $n_t\times n_r$ 矩形对角阵，含 $H$ 的 $n_t$ 个奇异值 $\sigma_{H,1},\ldots,\sigma_{H,n_t}$。由此 $XH$ 可表示为 $XH=aUU_HS_HV_H^H$，其中 $a\triangleq\sqrt{T\rho/n_t}$。利用酉不变性 [39, Ch. 5.2] 与复高斯矩阵 $W$ 的循环对称性 [40, App. A]、[28, Lemma 16]，在给定 $X$ 下随机矩阵 $Y=XH+W$ 与 $\tilde Y=aUU_H\Sigma_H+W$ 同条件分布，其中 $\Sigma_H$ 为含奇异值 $\sigma_{H,1},\ldots,\sigma_{H,n_t}$ 的 $n_t\times n_t$ 对角阵 [28, Lemma 16]。于是由 (134) 得

$$
\tilde Y=\begin{bmatrix}a\tilde\Sigma_H&0\\0&0\end{bmatrix}+\begin{bmatrix}W_{11}&W_{12}\\W_{21}&W_{22}\end{bmatrix}, \tag{135}
$$

其中 $\tilde\Sigma_H\triangleq U_H\Sigma_H$，而 $W_{11}$、$W_{12}$、$W_{21}$、$W_{22}$ 分别为 $n_t\times n_t$、$n_t\times(n_r-n_t)$、$(T-n_t)\times n_t$、$(T-n_t)\times(n_r-n_t)$ 维子矩阵，元素为独立同分布 $\mathcal{CN}(0,1)$ 且与 $H$ 独立。由于 $\det(\tilde\Sigma_H)=\det(U_H)\det(\Sigma_H)>0$，$\tilde\Sigma_H$ 可逆且特征值非零。

接着利用：对 $X=aU$，有

$$
\begin{aligned}
\mathrm{tr}\left(\tilde Y^H\left(I_T+XX^H\right)^{-1}\tilde Y\right)=\ &\frac{a^2}{1+a^2}\mathrm{tr}\left(HH^H\right)+\mathrm{tr}\left(W_{21}^HW_{21}\right)+\mathrm{tr}\left(W_{22}^HW_{22}\right)\\
&+\frac{2a}{1+a^2}\Re\left(\mathrm{tr}\left(\tilde\Sigma_H^HW_{11}\right)\right)+\frac{1}{1+a^2}\left(\mathrm{tr}\left(W_{11}^HW_{11}\right)+\mathrm{tr}\left(W_{12}^HW_{12}\right)\right).
\end{aligned}\tag{136}
$$

（原文此处称 $\Re(\cdot)$ 表示虚部，按惯例应为实部；见页尾原文疑点注。）因此，给定 $X=aU$ 时 $Y$ 的条件 pdf 满足

$$
\begin{aligned}
f_{Y|X}\left(\tilde Y\mid aU\right)&=\frac{e^{-\mathrm{tr}\left\{\tilde Y^H\left(I_T+a^2UU^H\right)^{-1}\tilde Y\right\}}}{\pi^{Tn_r}\det\left(I_T+a^2UU^H\right)^{n_r}}\\
&=\frac{e^{-\frac{a^2}{1+a^2}\mathrm{tr}(HH^H)-\mathrm{tr}\left(W_{21}^HW_{21}\right)-\mathrm{tr}\left(W_{22}^HW_{22}\right)-\frac{2a}{1+a^2}\Re\left(\mathrm{tr}\left(\tilde\Sigma_H^HW_{11}\right)\right)-\frac{1}{1+a^2}\left(\mathrm{tr}(W_{11}^HW_{11})+\mathrm{tr}(W_{12}^HW_{12})\right)}}{\pi^{Tn_r}\left(1+a^2\right)^{n_tn_r}}.
\end{aligned}\tag{137}
$$

接着考虑由 USTM 输入与信道 (4) 诱导的输出 pdf $f_Y^{(U)}$。为此记 $Y$ 按降序排列的奇异值为 $\sigma_1,\ldots,\sigma_{n_r}$；把 $Y$ 用其 SVD $Y=U_Y\Sigma_YV_Y^H$ 表示（$U_Y$、$V_Y$ 为（截断）酉矩阵，$\Sigma_Y$ 为含奇异值 $\sigma_1,\ldots,\sigma_{n_r}$ 的对角阵），则 $f_Y^{(U)}$ 可写为 [29]

$$
f_Y^{(U)}(Y)=f_{U_Y}(U_Y)f_{\Sigma_Y}\left(\sigma_1,\ldots,\sigma_{n_r}\right)f_{V_Y}(V_Y)J(T,\Sigma_Y),\quad Y=U_Y\Sigma_YV_Y^H, \tag{138}
$$

其中 $J(T,\Sigma_Y)$ 为 SVD 的 Jacobian，即 $J(T,\Sigma_Y)=\prod_{1\le i<j\le n_r}(\sigma_i^2-\sigma_j^2)^2\prod_{i=1}^{n_r}$…（原文后续为奇异值分布与密度函数的显式表达式）。由 (137) 与 (138) 可把信息密度 $i^{(U)}(X;Y)$ 表示为奇异值 $\sigma_{H,i}$、$\sigma_i$ 及相应特征向量的函数。

**B. $\tilde\Sigma\tilde Y$ 与 $f_{\tilde\sigma}$ 的渐近行为。** 该小节研究 $\rho\to\infty$ 时相关奇异值的收敛：证明（经缩放后）奇异值序列与 pdf 收敛到由 Wishart 矩阵极限刻画的对象，具体利用 Lemma 15（[29, Lemmas 12 & 13]：奇异值及相应 pdf 的有界性）与 Lemma 16（[28, Lemma 16]：$\rho\to\infty$ 时奇异值几乎必然收敛到其极限 $\varsigma_1,\ldots,\varsigma_{n_r}$，其 pdf 由 Wishart 分布刻画）。由此得到信息密度的极限形式 $i^*(\rho,\varsigma,H,W)$ 与相应矩的收敛性。

**C. 信道色散的收敛性。** 综合 I-A、I-B 的结果证明 $U(T,\rho)=T^2\tilde V(T)+K_U(T,\rho)$，其中 $K_U(T,\rho)\to0$（$\rho\to\infty$），即引理 2；关键步骤是把 $i^{(U)}$ 的方差分解为与 $\tilde V(T)$ 对应的主项（由 digamma 函数导数之和给出）加上随 $\rho\to\infty$ 消失的误差项。

**D. (151) 的证明。** 给出附录 I-C 中用到的一个辅助估计式 (151)（涉及信息密度三阶矩的一致有界性）的证明。

### 附录 II. 引理 3 的证明

$U(T,\rho)$ 在 $\rho\ge\rho_0$ 上的一致有界性直接来自引理 2：由该引理，$U(T,\rho)$ 可近似为

$$
U(T,\rho)=T^2\tilde V(T)+K_U(T,\rho)
=n_t(T-n_t)+(T-n_t)^2\sum_{i=0}^{n_t-1}\Psi'(n_r-i)+K_U(T,\rho), \tag{209}
$$

其中 $K_U(T,\rho)$ 满足 $\lim_{\rho\to\infty}K_U(T,\rho)=0$；由于 $\tilde V(T)$ 不依赖 $\rho$ 且有限，结论成立。接着证明 $\mathbb E[|i^{(U)}(X;Y)-I(T,\rho)|^3]$ 在 $\rho\ge\rho_0$ 上一致有界：沿用引理 2 证明中的类似步骤，可证

$$
\lim_{\rho\to\infty}\mathbb E\left[\left|i^{(U)}(X;Y)-I(T,\rho)\right|^3\right]=\mathbb E\left[\left|i^*(\rho,\varsigma,H,W)-I^*(T,\rho)\right|^3\right]+\cdots<\infty,
$$

再结合收敛的连续性即得一致有界性。

### 附录 III. 失配信息密度的上界

本附录证明：在给定 $X_\ell=\mathsf X_\ell$ 时，失配信息密度 $j_\ell(X_\ell;Y_\ell)$ 可被一个项上界，而该项与 (69) 中定义的 $\bar j(D_\ell,Z'_\ell,Z''_\ell,H_\ell,Q_\ell)$ 同分布。为此先利用 $\sum_{i=1}^{n_t}\sigma_{i,\ell}^2=\mathrm{tr}(Y_\ell^HY_\ell)-\sum_{i=n_t+1}^{n_r}\sigma_{i,\ell}^2$ 把 (68) 右端第三、四、五项重写，再对各项分别用奇异值的界（结合 $Y_\ell=X_\ell H_\ell+W_\ell$ 的 SVD 与 Wishart 矩阵性质）进行处理，最终得到 (69) 形式的界并证明所需同分布性质。

### 附录 IV. 引理 8 的证明

**A. (73) 的证明。** 由 $\bar j(D_\ell,Z'_\ell,Z''_\ell,H_\ell,Q_\ell)$ 与 $\bar J(D_\ell,T,\rho)$ 的定义 (69)、(71)，有

$$
\bar U(D,T,\rho)=\mathbb E\left[\left(\sum_{i=1}^{n_t}\left(\frac{n_t}{T\rho}+\frac{n_td_{i,\ell}^2}{T\rho}-1\right)\left(Z_{i,\ell}-n_r\right)-\frac{T\rho-n_t}{T\rho}\sum_{i=1}^{n_t}\left(Z''_{i,\ell}-(T-n_t)\right)+\cdots\right)^2\right],
$$

其中余项含 $(T-n_t)\log\det(\cdot)$ 项与 $(T-n_t)\mathbb E[\log\det(\cdot)]$ 之差（原文 (245a) 定义 $\Delta(D,Z'_\ell,Z''_\ell,H_\ell,Q_\ell)$）。利用各随机量二阶矩的一致有界性（Z′ 服从 Γ(n_r,1)、Z″ 服从 Γ(T−n_t,1)，$H_\ell$、$Q_\ell$ 为高斯矩阵），并对 $D\in\mathcal D_{n_t}$ 一致地界住含 $\log\det$ 的项，即得 (73)。

**B. (74) 的证明。** 类似地，利用 Cauchy–Schwarz 不等式与三阶矩的有界性，对 $\bar S(D,T,\rho)=\mathbb E[|\Delta|^3]$ 作一致界估计，得 (74)。

### 附录 V. 引理 9 的证明

由 (69) 与 (71) 的表达式，把 $\bar j$ 与 $\bar J$ 之差分解为若干独立随机量之和；利用 $Z'_{i,\ell}$、$Z''_{i,\ell}$ 的方差分别为 $n_r$、$T-n_t$，以及 $H_\ell$ 项的渐近行为，可导出

$$
\bar U(D,T,\rho)\ge(T-n_t)n_t+K_{\bar U}(D,T,\rho),
$$

其中 $K_{\bar U}$ 在 $D\in\mathcal D_1$、$\rho\ge\rho_0$ 上一致趋于 0（$\rho\to\infty$），即引理 9。

### 附录 VI. 引理 10 的证明

回忆 $\bar U(D,T,\rho)=\mathbb E[\Delta^2(D,Z'_\ell,Z''_\ell,H_\ell,Q_\ell)]$，其中 $\Delta$ 如 (245a) 所定义。利用 Cauchy–Schwarz 不等式，可把 $\bar U(T,\sqrt{\rho/\alpha}D,\rho)$ 与 $\bar U(T,D,\rho)$ 之差界为与 $\delta$ 成正比、系数只依赖 $T$ 的项：

$$
\bar U(T,\sqrt{\rho/\alpha}D,\rho)\le\bar U(T,D,\rho)=\mathbb E\left[\left(\Delta\left(\sqrt{\frac{\rho}{\alpha}}D,Z'_\ell,Z''_\ell,H_\ell,Q_\ell\right)\right)^2\right],
$$

再对满足 $\mathrm{tr}(D^2)\ge T\rho(1-\delta)$ 的 $D$ 一致地估计该差，即得 (87)，其中 $\Upsilon(T)$ 为只依赖 $T$ 的正数。

### 附录 VII. 引理 11 的证明

首先注意对每个 $D\in\mathcal D_{n_t}$，

$$
\bar J(D,T,\rho)=\bar J^*(D,T,\rho)+K_{\mathcal D_1}(D,T,\rho), \tag{264}
$$

其中 $\bar J^*$ 如 (89) 定义，而

$$
K_{\mathcal D_1}(D,T)\triangleq\frac{n_t}{T\rho}\left(n_tn_r+n_t(T-n_t)\right)+(T-n_t)\mathbb E\left[\log\frac{\det\left(H_\ell H_\ell^H+\lambda_1(Q_\ell^HQ_\ell)\left(I_{n_t}+D^2\right)^{-1}\right)}{\det\left(H_\ell H_\ell^H\right)}\right]. \tag{265}
$$

由于对任意正定矩阵 $A,B$ 有 $\det(A+B)\ge\det(A)$ [39, Th. 7.8.21]，可知 $K_{\mathcal D_1}(D,T)\ge0$。进一步，对 $D\in\mathcal D_1$ 有 $d_i^2\ge\bar\delta\rho$（$i=1,\ldots,n_t$），从而 $(I_{n_t}+D^2)^{-1}\preceq(1+\bar\delta\rho)^{-1}I_{n_t}$，于是

$$
K_{\mathcal D_1}(D,T)\le\frac{n_t}{T\rho}\left(n_tn_r+n_t(T-n_t)\right)+(T-n_t)\mathbb E\left[\log\frac{\det\left(H_\ell H_\ell^H+\lambda_1(Q_\ell^HQ_\ell)(1+\bar\delta\rho)^{-1}I_{n_t}\right)}{\det\left(H_\ell H_\ell^H\right)}\right].
$$

对 $D\in\mathcal D_1$ 关于 $\lambda_1(Q_\ell^HQ_\ell)$ 的期望取上界，可证存在只依赖 $T$ 的非负常数 $K(T)$，使 $D\in\mathcal D_1$ 且 $\mathrm{tr}(D^2)<T\rho(1-K(T)/L)$ 时相应的 $\bar J$ 项相对于 $\mathrm{tr}(D^2)\ge T\rho(1-K(T)/L)$ 的情形可被忽略（至多差 $K_{\mathcal D_1}(T,\rho)$），由此得到 (88)。

### 附录 VIII. 引理 12 的证明

为在 $D\in\mathcal D_1$ 上最大化 $\bar J^*(D,T,\rho)$，注意 $\bar J^*$ 中依赖 $D$ 的项为 $(T-n_t-n_r)\log\det(I_{n_t}+D^2)$。由对数的凹性与 Jensen 不等式，对满足 $\mathrm{tr}(D^2)\le T\rho$ 的全部对角矩阵 $D$ 有

$$
\log\det\left(I_{n_t}+D^2\right)=\sum_{i=1}^{n_t}\log\left(1+d_i^2\right)
\le n_t\log\left(1+\frac{1}{n_t}\sum_{i=1}^{n_t}d_i^2\right)
\le n_t\log\left(1+\frac{T\rho}{n_t}\right), \tag{327}
$$

且当 $d_i^2=T\rho/n_t$（$i=1,\ldots,n_t$）时取等。由于 (60) 定义的 $\bar\delta$ 不超过 $T/n_t$，该 $d_i^2$ 的选取满足 $d_i^2\ge\bar\delta\rho$，因而相应的 $D$ 属于 $\mathcal D_1$。于是

$$
\sup_{D\in\mathcal D_1}\bar J^*(D,T,\rho)=\bar J_{\mathcal D_1}(T,\rho),
$$

即 (90)–(91)。

### 附录 IX. 引理 13 的证明

在 (242) 中把 $D$ 替换为 $\sqrt{\rho/\alpha}D$，得到

$$
\bar U\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right)=\bar U^*\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right)+K_{\bar U}\left(\sqrt{\frac{\rho}{\alpha}}D,T,\rho\right), \tag{329}
$$

其中 $K_{\bar U}(D,T,\rho)$ 满足 $\lim_{\rho\to\infty}\sup_{D\in\mathcal D_1}|K_{\bar U}(D,T,\rho)|=0$。接着对 $\tilde D=\sqrt{\rho/\alpha}D$ 计算 $\bar U^*(\tilde D,T,\rho)$：注意 $\tilde D$ 的迹为 $T\rho$，故相应 $\tilde\alpha=\mathrm{tr}(\tilde D^2)/T=\rho$。由此展开 $\bar U^*$ 的表达式，并利用 $Z'$、$Z''$ 的方差与 $H_\ell$ 项的渐近行为，即得 (92)。

### 附录 X. 引理 14 的证明

从 (264) 出发并在 $D\in\mathcal D_2$ 上优化。由于 $K_{\mathcal D_1}(D,T)\ge0$，对每个 $D\in\mathcal D_{n_t}$ 有下界 $\bar J(D,T,\rho)\ge\bar J^*(D,T,\rho)$。为得到上界并在 $D\in\mathcal D_2$ 上优化 $\bar J^*$，需区分 $d_i^2$（$i=1,\ldots,n_t$）的不同情形：不失最优性设 $D$ 的对角元有序 $d_1\le d_2\le\cdots\le d_{n_t}$，则对每个 $D\in\mathcal D_2$ 存在 $n_k=1,\ldots,n_t$ 使 $d_i^2\le\bar\delta\rho$（$i=1,\ldots,n_k$）、$d_i^2>\bar\delta\rho$（$i=n_k+1,\ldots,n_t$）。需区分两种情形：1）$d_i$ 对全部 $i=1,\ldots,n_t$ 随 $\rho\to\infty$ 趋于无穷；2）存在有限 $\bar\rho$ 使 $d_i\le\bar\rho$（$i=1,\ldots,n_s$，某 $n_s=1,\ldots,n_k$）。

**A. $d_i$ 无界的情形。** 当 $\lim_{\rho\to\infty}d_i=\infty$（$i=1,\ldots,n_t$）时，可找到满足 $\lim_{\rho\to\infty}\xi(\rho)=1$ 的 $\xi(\rho)$ 使 $d_i^2\ge\xi(\rho)$（$i=1,\ldots,n_t$）。由 (264) 与 (265) 可得 $\bar J(D,T,\rho)=\bar J^*(D,T,\rho)+\frac{n_t}{T\rho}(n_tn_r+n_t(T-n_t))+(T-n_t)\mathbb E[\log\det(H_\ell H_\ell^H+\lambda_1(Q_\ell^HQ_\ell)(I_{n_t}+D^2)^{-1})-\log\det(H_\ell H_\ell^H)]$，并在该情形下导出 $\bar J$ 的上界 $\bar J_{\mathcal D_2}(T,\rho)+K_{\mathcal D_2}(T,\rho)$（其中 $K_{\mathcal D_2}\to0$）。

**B. $d_i$ 有界的情形。** 对情形 2）导出相应的上界 $\bar J'_{\mathcal D_2}(T,\rho)$。

**C. 两种情形的合并。** 由 (333) 与 (337) 得 $\sup_{D\in\mathcal D_2}\bar J(D,T,\rho)\ge\bar J_{\mathcal D_2}(T,\rho)$；由 (338) 与 (342) 得，对 $\rho\ge\bar\rho/\bar\delta$，$\sup_{D\in\mathcal D_2}\bar J(D,T,\rho)\le\max\{\bar J_{\mathcal D_2}(T,\rho)+K_{\mathcal D_2}(T,\rho),\ \bar J'_{\mathcal D_2}(T,\rho)\}$。再证对充分大的 $\rho$ 有 $\bar J'_{\mathcal D_2}(T,\rho)\le\bar J_{\mathcal D_2}(T,\rho)+K_{\mathcal D_2}(T,\rho)$：事实上

$$
\begin{aligned}
&\bar J_{\mathcal D_2}(T,\rho)+K_{\mathcal D_2}(T,\rho)-\bar J'_{\mathcal D_2}(T,\rho)\\
&=\log\left(\left(1+\bar\delta\rho\right)\left(1+\frac{T-\bar\delta}{n_t-1}\rho\right)^{n_t-1}\right)-\log\left(\left(1+\bar\rho\right)\left(1+\frac{T\rho-\bar\rho}{n_t-1}\right)^{n_t-1}\right)\\
&\quad+(T-n_t)\mathbb E\left[\log\frac{\det\left(H_\ell H_\ell^H\right)}{\det\left(H_\ell H_\ell^H+\lambda_1(Q_\ell^HQ_\ell)I_{n_t}\right)}\right]+K_{\mathcal D_2}(T,\rho)\\
&=\log\left(\frac{1+\bar\delta\rho}{1+\bar\rho}\right)+(n_t-1)\log\left(\frac{n_t-1+T\rho-\bar\delta\rho}{n_t-1+T\rho-\bar\rho}\right)\\
&\quad+(T-n_t)\mathbb E\left[\log\frac{\det\left(H_\ell H_\ell^H\right)}{\det\left(H_\ell H_\ell^H+\lambda_1(Q_\ell^HQ_\ell)I_{n_t}\right)}\right]+K_{\mathcal D_2}(T,\rho).
\end{aligned}\tag{346}
$$

(346) 右端第一项随 $\rho\to\infty$ 趋于无穷，其余各项在 $\rho\ge\bar\rho/\bar\delta$ 上有界。因此对 $\rho\ge\rho_0$ 与充分大的 $\rho_0$，(346) 右端非负，故 (345) 成立。把 (345) 与 (343) 结合，即得对充分大的 $\rho_0$：$\bar J_{\mathcal D_2}(T,\rho)\le\sup_{D\in\mathcal D_2}\bar J(D,T,\rho)\le\bar J_{\mathcal D_2}(T,\rho)+K_{\mathcal D_2}(T,\rho)$（$\rho\ge\rho_0$），即引理 14。

## 图注与表注

**图 1：** 固定 $n=TL$ 时 $R^*(L,T,\epsilon,\rho)$ 随 $T$ 的变化。（a）$n=168$、$\epsilon=10^{-3}$、$\rho=15$ dB、$n_t=n_r=2$；（b）$n=168$、$\epsilon=10^{-3}$、$\rho=25$ dB、$n_t=n_r=2$。

**图 2：** 固定 $T$ 时 $R^*(L,T,\epsilon,\rho)$ 随 $n$ 的变化。（a）$T=24$、$\epsilon=10^{-3}$、$n_t=2$、$n_r=2$、$\rho=15$ dB；（b）$T=24$、$\epsilon=10^{-3}$、$n_t=2$、$n_r=4$、$\rho=15$ dB。

**图 3：** $R^*(L,T,\epsilon,\rho)$ 随 $\epsilon$ 的变化。（a）$n_t=2$、$n_r=2$、$T=24$、$L=7$；（b）$\rho=25$ dB、$T=24$、$L=7$。

**图 4：** $R^*(L,T,\epsilon,\rho)$ 随 $\rho$ 的变化。（a）$T=24$、$L=7$、$\epsilon=10^{-5}$、$n_t=1$、$n_r=2$；（b）$T=24$、$L=7$、$\epsilon=10^{-5}$、$n_t=2$、$n_r=2$。

**图 5：** 固定速率 $R=4$、$T=24$、$L=7$ 时最小错误概率 $\epsilon$ 随 SNR 的变化（天线数 $(n_t,n_r)=(1,1),(1,2),(1,4),(2,4)$）。

**图 6：** $(n_t,n_r)=(1,4)$、$(2,2)$、$(4,1)$ 时的最大编码速率与最小错误概率。（a）固定 $TL=168$、$\epsilon=10^{-3}$、$\rho=25$ dB 时 $R^*(L,T,\epsilon,\rho)$ 随 $T$ 的变化；（b）固定 $R=4$、$T=24$、$L=7$ 时错误概率 $\epsilon$ 随 SNR 的变化。

**图 7：** 固定 $n=TL$、给定接收天线数、变化发射天线数时高 SNR 正态近似随 $T$ 的变化。（a）$n=168$、$\epsilon=10^{-3}$、$\rho=25$ dB、$n_r=6$，交点 $T_{4,6}=14.9$、$T_{5,6}=22.9$；（b）$n=512$、$\epsilon=10^{-5}$、$\rho=25$ dB、$n_r=8$，交点 $T_{6,7}=17.9$、$T_{5,8}=18.3$、$T_{6,8}=22.3$、$T_{7,8}=32.5$。

**表 I：** 有限码长结果与无线通信信道精细化渐近的汇总

| 论文 | 衰落模型与设置 | 信道状态信息† | 结果 |
|---|---|---|---|
| Polyanskiy & Verdú 2011 [16] | 平稳且遍历衰落；单天线 | CSIR | 正态近似（闭式） |
| Collins & Polyanskiy 2014 [17] | 块衰落；MISO | CSIR | 可达正态近似（闭式） |
| Collins & Polyanskiy 2016 [18]；Collins & Polyanskiy 2019 [19] | 块衰落；MIMO | CSIR | 正态近似（闭式） |
| Hoydis、Couillet & Piantanida 2015 [20] | 准静态瑞利衰落；MIMO；收发天线数随码长趋于无穷 | CSIR | 给定二阶编码速率下最优错误概率的界（闭式） |
| Yang 等 2015 [21] | 准静态衰落；单天线；长期功率约束 | CSIRT | 正态近似（闭式） |
| Yang 等 2014 [22] | 准静态衰落；MIMO | no-CSI、CSIT、CSIR、CSIRT | 正态近似（闭式） |
| Yang 等 2012 [23] | 瑞利块衰落；单天线 | no-CSI | 非渐近界（需数值计算） |
| Durisi 等 2016 [24] | 瑞利块衰落；MIMO | no-CSI | 非渐近界（需数值计算） |
| Lancho 等 2019 [25]；Lancho 等 2020 [26] | 瑞利块衰落；单天线 | no-CSI | 鞍点近似（需数值计算） |
| Lancho、Koch & Durisi 2019 [27] | 瑞利块衰落；单天线 | no-CSI | 高 SNR 正态近似（闭式） |

† 表注（原文）：no-CSI 表示非相干设置（仅知衰落系数统计特性）；CSIT 表示衰落系数在发射端已知；CSIR 表示在接收端已知；CSIRT 表示收发两端均已知。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v3 第 49 页转录；未逐条核对 DOI）。

[1] G. Durisi, T. Koch, and P. Popovski, "Toward massive, ultrareliable, and low-latency wireless communication with short packets," Proc. IEEE, vol. 104, no. 9, pp. 1711–1726, Sep. 2016.

[2] M. Hayashi, "Information spectrum approach to second-order coding rate in channel coding," IEEE Trans. Inf. Theory, vol. 55, no. 11, pp. 4947–4966, Nov. 2009.

[3] Y. Polyanskiy, H. V. Poor, and S. Verdú, "Channel coding rate in the finite blocklength regime," IEEE Trans. Inf. Theory, vol. 56, no. 5, pp. 2307–2359, May 2010.

[4] M. Shirvanimoghaddam, M. S. Mohammadi, R. Abbas, A. Minja, C. Yue, B. Matuz, G. Han, Z. Lin, W. Liu, Y. Li, S. Johnson, and B. Vucetic, "Short block-length codes for ultra-reliable low latency communications," IEEE Communications Magazine, vol. 57, no. 2, pp. 130–137, Feb. 2019.

[5] M. C. Coşkun, G. Durisi, T. Jerkovits, G. Liva, W. Ryan, B. Stein, and F. Steiner, "Efficient error-correcting codes in the short blocklength regime," Physical Communication, vol. 34, pp. 66–79, Jun. 2019.

[6] B. Makki, T. Svensson, and M. Zorzi, "Finite block-length analysis of spectrum sharing networks using rate adaptation," IEEE Trans. Commun., vol. 63, no. 8, pp. 2823–2835, Aug. 2015.

[7] B. Makki, T. Svensson, and M. Zorzi, "Wireless energy and information transmission using feedback: Infinite and finite block-length analysis," IEEE Trans. Commun., vol. 64, no. 12, pp. 5304–5318, Dec. 2016.

[8] L. Zhang and Y.-C. Liang, "Average throughput analysis and optimization in cooperative IoT networks with short packet communication," IEEE Trans. Veh. Technol., vol. 67, no. 12, pp. 11 549–11 562, Dec. 2018.

[9] C. Li, N. Yang, and S. Yan, "Optimal transmission of short-packet communications in multiple-input single-output systems," IEEE Trans. Veh. Technol., vol. 68, no. 7, pp. 7199–7203, Jul. 2019.

[10] N. H. Mahmood, O. A. López, H. Alves, and M. Latva-Aho, "A predictive interference management algorithm for URLLC in beyond 5G networks," IEEE Commun. Lett., vol. 25, no. 3, pp. 995–999, Mar. 2021.

[11] A. Munari and F. Clazzer, "Spectral coexistence of QoS-constrained and IoT traffic in satellite systems," Sensors, vol. 21, no. 14, Jul. 2021.

[12] J. Feng, H. Q. Ngo, and M. Matthaiou, "(Non)-coherent MU-MIMO block fading channels with finite blocklength and linear processing," IEEE Trans. Wireless Commun., vol. 22, no. 4, pp. 2441–2461, Apr. 2023.

[13] M. Xie, J. Gong, X. Jia, Q. Wang, and X. Ma, "Age and energy analysis for lth best relay enabled cooperative status update systems with short packet communications," IEEE Trans. Veh. Technol., vol. 72, no. 5, pp. 6294–6308, May 2023.

[14] C. Zheng, F.-C. Zheng, J. Luo, P. Zhu, X. You, and D. Feng, "Differential modulation for short packet transmission in URLLC," IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7230–7245, Jul. 2024.

[15] L. Li, W. Chen, P. Popovski, and K. B. Letaief, "Reliability-latency-rate tradeoff in low-latency communications with finite-blocklength coding," IEEE Trans. Inf. Theory, vol. 71, no. 1, pp. 360–389, Jan. 2025.

[16] Y. Polyanskiy and S. Verdú, "Scalar coherent fading channel: Dispersion analysis," in Proc. IEEE Int. Symp. on Inf. Theory (ISIT), St. Petersburg, Russia, Jul. 31–Aug. 5, 2011, pp. 2959–2963.

[17] A. Collins and Y. Polyanskiy, "Orthogonal designs optimize achievable dispersion for coherent MISO channels," in Proc. IEEE Int. Symp. on Inf. Theory (ISIT), Honolulu, HI, USA, Jun. 29–Jul. 4, 2014, pp. 2524–2528.

[18] A. Collins and Y. Polyanskiy, "Dispersion of the coherent MIMO block-fading channel," in Proc. IEEE Int. Symp. on Inf. Theory (ISIT), Barcelona, Spain, Jul. 10–15, 2016, pp. 1068–1072.

[19] A. Collins and Y. Polyanskiy, "Coherent multiple-antenna block-fading channels at finite blocklength," IEEE Trans. Inf. Theory, vol. 65, no. 1, pp. 380–405, Jan. 2019.

[20] J. Hoydis, R. Couillet, and P. Piantanida, "The second-order coding rate of the MIMO quasi-static Rayleigh fading channel," IEEE Trans. Inf. Theory, vol. 61, no. 12, pp. 6591–6622, Dec. 2015.

[21] W. Yang, G. Caire, G. Durisi, and Y. Polyanskiy, "Optimum power control at finite blocklength," IEEE Trans. Inf. Theory, vol. 61, no. 9, pp. 4598–4615, Nov. 2015.

[22] W. Yang, G. Durisi, T. Koch, and Y. Polyanskiy, "Quasi-static multiple-antenna fading channels at finite blocklength," IEEE Trans. Inf. Theory, vol. 60, no. 7, pp. 4232–4265, 2014.

[23] W. Yang, G. Durisi, T. Koch, and Y. Polyanskiy, "Diversity versus channel knowledge at finite block-length," in Proc. IEEE Inf. Theory Workshops (ITW), Lausanne, Switzerland, Sep. 3–7, 2012, pp. 572–576.

[24] G. Durisi, T. Koch, J. Östman, Y. Polyanskiy, and W. Yang, "Short-packet communications over multiple-antenna Rayleigh-fading channels," IEEE Trans. Commun., vol. 64, no. 2, pp. 618–629, Feb. 2016.

[25] A. Lancho, J. Östman, G. Durisi, T. Koch, and G. Vazquez-Vilar, "Saddlepoint approximations for noncoherent single-antenna Rayleigh block-fading channels," in Proc. IEEE Int. Symp. on Inf. Theory (ISIT), Paris, France, Jul. 7–12 2019, pp. 612–616.

[26] A. Lancho, J. Östman, G. Durisi, T. Koch, and G. Vazquez-Vilar, "Saddlepoint approximations for short-packet wireless communications," IEEE Trans. Wireless Commun., vol. 19, no. 7, pp. 4831–4846, Jul. 2021.

[27] A. Lancho, T. Koch, and G. Durisi, "On single-antenna Rayleigh block-fading channels at finite blocklength," IEEE Trans. Inf. Theory, vol. 66, no. 1, pp. 496–519, Jan. 2019.

[28] L. Zheng and D. N. C. Tse, "Communication on the Grassmann manifold: A geometric approach to the noncoherent multiple-antenna channel," IEEE Trans. Inf. Theory, vol. 48, no. 2, pp. 359–383, Feb. 2002.

[29] W. Yang, G. Durisi, and E. Riegler, "On the capacity of large-MIMO block-fading channels," IEEE J. Sel. Areas Commun., vol. 31, no. 2, pp. 117–132, Feb. 2013.

[30] E. Telatar, "Capacity of multi-antenna Gaussian channels," European Trans. Telecom., vol. 10, no. 6, pp. 585–595, 1999.

[31] A. Grant, "Rayleigh fading multi-antenna channels," EURASIP Journal on Advances in Signal Processing, vol. 2002, no. 3, pp. 316–329, Mar. 2002.

[32] J. Östman, G. Durisi, E. G. Ström, M. C. Coşkun, and G. Liva, "Short packets over block-memoryless fading channels: Pilot-assisted or noncoherent transmission?" IEEE Trans. Commun., vol. 67, no. 2, pp. 1521–1536, Feb. 2019.

[33] Spectre, SPECTRE: short packet communication toolbox, 2015, GitHub repository, [Online]. Available: https://github.com/yp-mit/spectre.

[34] L. Zheng and D. Tse, "Diversity and multiplexing: A fundamental tradeoff in multiple-antenna channels," IEEE Trans. Inf. Theory, vol. 49, no. 5, pp. 1073–1096, May 2003.

[35] L. Zheng and D. Tse, "The diversity-multiplexing tradeoff for non-coherent multiple antenna channels," in Proc. Allerton Conf. Commun., Contr., Comput., Monticello, IL, USA, 2002, pp. 1011–1020.

[36] W. Feller, An Introduction to Probability Theory and Its Applications, 2nd ed. New York: John Wiley & Sons, 1971, vol. II.

[37] Y. Polyanskiy, "Saddle point in the minimax converse for channel coding," IEEE Trans. Inf. Theory, vol. 59, no. 5, pp. 2576–2595, May 2013.

[38] A. M. Tulino and S. Verdú, Random Matrix Theory and Wireless Communications. Foundations and Trends in Communications and Information Theory, 2004, vol. 1, no. 1.

[39] R. A. Horn and C. R. Johnson, Matrix Analysis. Cambridge University Press, 1990.

[40] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge University Press, 2005.

[41] R. B. Ash and C. A. Doléans-Dade, Probability and Measure Theory, 2nd ed. Elsevier/Academic Press, 2000.

[42] R. J. Muirhead, Aspects of Multivariate Statistical Theory, 2nd ed. John Wiley & Sons, 2005.

[43] W. Rudin, Principles of Mathematical Analysis, 3rd ed. New York: McGraw-Hill Book Co., 1976.

**本页范围与校对状态：** 本页为 arXiv:2503.01504v3 的全文中文译稿：正文（摘要、第 I–V 节、结论、致谢与资助说明）逐段译出，包含定理 1 的完整陈述与 (9)–(13)、近似 (14)、相干信道对比 (15)–(18)、DMT (19)–(21)、第 III-C 节工程启示 (22)、第 IV 节证明的下界 (23)–(49) 与上界 (50)–(133) 的关键步骤及引理 1–14。**附录 I–X 按原文结构逐附录译出目标、主要步骤与关键编号公式（如 (134)–(138)、(209)、(264)–(265)、(327)、(329)、(346) 等）；对其中大量纯代数推导作忠实概述而非逐式复现**——原 PDF 抽取文本存在 NUL 字节与公式排版错乱（已用去除 NUL 的清理文本处理），逐式转录有失真风险，故未强行逐式清点；如需逐式核对请以 PDF 第 21–48 页为准。表 I 已用 PDF 第 2 页渲染图逐格核对；式 (60) 已用 PDF 第 13 页渲染图核对符号与结构。原文疑点：式 (136) 后正文称 $\Re(\cdot)$ 表示虚部，按惯例 $\Re$ 表示实部，译文按惯例处理并在此说明。图内曲线未做数字化估算；图 1–7 的图注与正文讨论已逐段译出。**附录长代数推导的逐式终校与全篇逐句对照未做。** 另：骨架"版本"行原为 2026-09-29（收录日），已按 BRIEF2 结构改为 arXiv:2503.01504v3（2025-11-18，依据 PDF 页眉 "arXiv:2503.01504v3 [cs.IT] 18 Nov 2025"）；作者为 Chao Qi、Tobias Koch；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
