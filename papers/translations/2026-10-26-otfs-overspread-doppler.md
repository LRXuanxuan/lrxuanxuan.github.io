---
layout: page
title: "超扩展多普勒 OTFS 信道估计｜中文译稿（2026-10-30 补译，未逐句终校）"
permalink: /papers/translations/2026-10-26-otfs-overspread-doppler/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原论文 DOI](https://doi.org/10.1109/TWC.2026.3715542)

# 存在超扩展多普勒频移的 OTFS 系统信道估计

**原题**：Channel Estimation for OTFS Systems With Overspread Doppler Shifts  
**作者**：Preety Priya、Yi Hong、Emanuele Viterbo  
**来源**：IEEE Transactions on Wireless Communications, Vol. 25, 2026，DOI: 10.1109/TWC.2026.3715542。  
**翻译进度（2026-10-30 更新）**：摘要、正文 I–V 与附录的控制流程已译；本轮补入式 (4)、(9)–(10)、(12)–(14)、(16)、(19)–(23)、(29)–(30)、(32)–(34)、(36)–(38) 的转写、表 I 与参考文献 [1]–[28]，并补上附录算法分支结构。IEEE 版权口径下只补结构、公式、表格与英文书目，不做大段原文转述；公式与正文仍待逐式终校，**不计入全文验收通过**。
**完整性与去重审计**：[2026-10-26 五篇译稿逐篇核查记录](/papers/qa/2026-10-26/)。已处理重复公式编号；本轮补齐表格、参考文献与上述公式，逐段原文终校仍未完成。

## 摘要

本文考虑存在超扩展多普勒频移的时变信道中的正交时频空（orthogonal time frequency space，OTFS）系统。这类频移通常出现在非地面多卫星链路中。超扩展多普勒频移的幅值大于子载波间隔的一半，由于 OTFS 的取模运算，会在时延–多普勒（DD）域中产生混叠的多普勒频移。这使信道估计极具挑战性，也令传统信道估计方法失效。

为解决这一问题，本文提出一种 DD 域训练帧和两阶段信道估计方法。训练帧由余弦导频信号和一个导频符号组成。在信道估计第一阶段，使用 DD 域导频符号估计传播路径的时延、混叠多普勒频移和信道增益。第二阶段，将接收时域信号转换到频域，利用余弦导频信号检测所有实际多普勒频移对应的谱峰。随后，提出一种基于阈值的方法，将估计出的实际多普勒频移与相应的时延及信道增益进行配对。本文还讨论了所提信道估计方法的计算复杂度，并通过多种场景下的归一化均方误差（NMSE）和误码率（BER）验证其性能。

**关键词**：OTFS；信道估计；超扩展多普勒；LEO 卫星通信。

## I. 引言

从第五代（5G）向第六代（6G）无线技术演进，预计将显著提升网络能力，尤其是对移动性的支持，使网络覆盖从高速移动进一步拓展至超高速移动场景，例如低地球轨道（LEO）卫星通信和低空飞行平台 [1]。

在高移动性通信环境下，无线信道表现为具有多径时延和严重多普勒频移的时变信道。传统 OFDM 波形在此类场景中的有效性受到限制。最新进展表明，正交时频空（OTFS）调制能够在高度动态的通信环境中提供稳健性能，尤其有助于克服严重多普勒频移的影响 [2]、[3]。

OTFS 的核心思想是在时延–多普勒（DD）域复用信息符号，从而捕获时变无线信道的稀疏性质 [3]。这项操作使信息符号有效地扩展到整个时频资源平面，并让 OTFS 波形能够利用最大的有效信道分集 [4]。因此，OTFS 将移动性和多径传播引起的时频选择性信道转换为 DD 域中不随时间变化的二维信道 [5]。上述优势，尤其是信道稀疏性，能够有效降低信道估计、均衡及检测的复杂度。

现有工作已广泛研究 OTFS 信道估计，包括嵌入式导频 [6]–[10]、[21]，叠加导频 [11]、[12]，交织导频 [13]、[22]，结构化训练序列 [14]–[16]，期望最大化方法 [23]，以及基于稀疏贝叶斯学习的信道估计 [17]–[19]。

大多数已有 OTFS 信道估计工作考虑的是欠扩展信道，其中时延和多普勒频移分别不超过块持续时间和子载波间隔的一半。然而，根据应用对数据速率与时延的要求，信道可能在时延或多普勒维度进入超扩展状态。

例如，作者之前的研究 [24] 考察了短帧、给定带宽低时延通信中的超扩展时延问题，并针对 DD 域的混叠时延提出利用 DD 导频和时域双啁啾信号的多阶段估计方案。不同的是，本文重点处理非地面多卫星协作传输中的**超扩展多普勒**问题。在这种场景下，多颗卫星同时传输同一信号，而不同卫星的运动方向与速度差异可能很大。

### 背景、研究缺口与贡献

大多数已有 OTFS 信道估计方案主要针对欠扩展信道，即时延不超过块持续时间、多普勒频移幅值不超过子载波间隔一半的情况。但实际信道可能因应用的数据速率和延迟要求，在时延或多普勒维度发生超扩展。作者此前在文献 [24] 中研究过**超扩展时延**：固定带宽下使用很短帧时，OTFS 的 DD 域模运算可能使真实时延发生混叠。该工作使用 DD 域导频和时域双啁啾信号提出多阶段估计，首先定位非超扩展路径，再通过双啁啾相关恢复真实时延和相应的路径参数。

本文研究的是另一种情况，即**超扩展多普勒**，特别是多个 LEO 卫星共同向地面终端发送同一信号的非地面通信。在这一场景中，各卫星相对终端的运动方向与速度差异较大，导致同时到达的各条路径具有相差显著的多普勒频移。宽带高速移动系统中的 Doppler squint（多普勒斜视）也可能引起超扩展现象，因为不同子载波上的多普勒频移随频率变化，从而增加与信号带宽相关的额外多普勒扩展。不过，本文采用**窄带 OTFS 模型**，因此并未把 Doppler squint 纳入具体分析。

当实际多普勒频移幅值大于子载波间隔的一半时，OTFS 在 DD 域的模运算会把不同的真实多普勒索引折叠到同一观测索引，使数据帧内部的常规嵌入式导频难以分辨不同的传播路径。如果 DD 域信道响应能在若干帧范围内保持近似稳定，则可以周期性发送一帧专门用于估计的训练帧，利用其更集中的已知信号解决这一问题。

先前针对超扩展时延的时域双啁啾相关不能直接用于超扩展多普勒，因为相关操作从根本上侧重于估计时间位移，而非频率位移。作者因此选择余弦导频：时域余弦在 FFT 之后产生位置明确的频谱峰，而多普勒使这些频谱峰发生频移，从中可以恢复实际多普勒，而不只得到 DD 域模运算后的混叠索引。

所提训练帧由余弦导频信号与一个高功率 DD 导频符号组成。第一阶段使用强导频在 DD 域估计各条路径的时延、混叠多普勒和复增益；第二阶段将接收时域信号变换到频域，检测余弦导频经过多普勒频移后的谱峰，恢复真实多普勒，再利用第一阶段结果与频域结果进行路径配对。作者进一步讨论算法复杂度，并通过 NMSE 与 BER 在不同信道场景中验证性能。

第二节给出系统模型；第三节介绍训练帧与两阶段估计；第四节为实验结果，第五节总结结论。

**记号约定。** 标量、向量和矩阵使用不同字形表示；\((\cdot)^H,(\cdot)^T,|\cdot|,[\cdot]_M\) 分别为共轭转置、转置、模及模 \(M\) 的取余运算。\(\operatorname{vec}(\cdot)\) 为列向量化，\(\operatorname{vec}^{-1}(\cdot)\) 为逆操作；\(\mathbf F_M\) 是归一化 \(M\) 点 DFT 矩阵；\(\mathbb E[\cdot]\) 为期望算子。

## II. 系统模型

考虑一个运行在多径时变信道中的 OTFS 系统，其中存在很大的多普勒频移。假设信道由 \(L\) 条传播路径组成，最大时延和最大多普勒频移分别为 \(\tau_{\max}\) 和 \(\nu_{\max}\)。OTFS 帧包含 \(N\) 个时隙，每个时隙含 \(M\) 个采样点，一帧共 \(MN\) 个采样点。

设子载波间隔为 \(\Delta f\)，时隙长度 \(T=1/\Delta f\)，则帧长和占用带宽分别为

\[
T_f=NT,\qquad B=M\Delta f.
\]

第 \(i\) 条路径由复增益 \(h_i\)、归一化时延 \(l_i\) 和归一化多普勒 \(k_i\) 表示，满足

\[
\tau_i=\frac{l_i}{M\Delta f},\qquad
\nu_i=\frac{k_i}{NT}.
\]

本文假设时延和多普勒分辨率足够高，因此仅考虑整数归一化时延和多普勒。不同于欠扩展信道 \(\tau_{\max}\nu_{\max}<1\)，本文考虑 \(\tau_{\max}\nu_{\max}>1\) 的超扩展信道，其多普勒频移很高：所有路径的 \(l_i<M\)，且至少某条路径满足 \(|k_i|\ge N/2\)。

**重要的模型限定**：论文采用窄带 OTFS 模型，因此没有考虑宽带系统中由多普勒频率随子载波变化而产生的 Doppler squint（多普勒斜视）效应；同样，信道抽头假设处于整数栅格，本文的算法性能不能未经验证地推广到任意分数时延/分数多普勒场景。

> **范围说明（2026-10-30）：** 早期在此列出的未完成范围（完整训练帧、两阶段信道估计算法、复杂度分析、各组仿真图表、结论和参考文献）均已在本页各节补译或转写；附录算法的分支结构见文末。逐式终校仍未完成，详见文末状态段。

### 时变信道及输入–输出关系

令 DD 域发送符号矩阵为 \(\mathbf X\in\mathbb C^{M\times N}\)。逆离散 Zak 变换把它映射至时域采样：
\[
\mathbf s=\operatorname{IDZT}(\mathbf X)
=\operatorname{vec}(\mathbf X\mathbf F_N^H)
=\operatorname{vec}(\widetilde{\mathbf X}).\tag{1}
\]
接收侧相反，
\[
\mathbf Y=\operatorname{DZT}(\mathbf r)
=\operatorname{vec}^{-1}(\mathbf r)\mathbf F_N
=\widetilde{\mathbf Y}\mathbf F_N.\tag{2}
\]
对具有整数归一化路径参数的信道，DD 域接收信号满足近似表达式
\[
Y[m,n]\simeq
\sum_{i=0}^{L-1}h_i
e^{j\frac{2\pi}{MN}(m-l_i)k_i}
\xi_i[m,n]\,
X[[m-l_i]_M,[n-k_i]_N].\tag{3}
\]
其中 \(h_i,l_i,k_i\) 分别是复增益、时延与归一化多普勒；\(\xi_i[m,n]\) 是因跨越时延循环边界产生的相位因子（原文式 (4)）：
\[
\xi_i[m,n]=
\begin{cases}
1,&l_i\le m<M,\\[2pt]
\dfrac{N-1}{N}\,
e^{-j2\pi\frac{[n-k_i]_N}{N}},&0\le m<l_i.
\end{cases}\tag{4}
\]
多普勒指标由模 \(N\) 运算折叠，因此不同的实际频移可能对应相同的 DD 域频移索引。

## III. 超扩展多普勒信道估计

### A. 训练帧设计

作者构造离散余弦导频
\[
c[m]=A\cos\left(2\pi\frac{f_0}{M}m\right),
\quad m=0,\ldots,M-1,\tag{5前}
\]
其中 \(A\) 为振幅，\(f_0=f/\Delta f\) 为归一化频率。选取整数 \(f_0\) 可避免整数周期截断引起的谱泄漏，并假设 \(M>k_{\max}\) 以区分待估的超扩展频移。

在 DD 域，余弦导频放在第一列，并在原点叠加高功率符号 \(x_p\)，使 \(|x_p|^2\gg A^2\)：
\[
X_t[m,n]=
\begin{cases}
c[0]+x_p,&m=0,\ n=0,\\
c[m],&1\le m<M,\ n=0,\\
0,&\text{其他}.
\end{cases}\tag{5}
\]
#### 余弦导频与强导频补充

考虑离散时间余弦导频信号

\[
c[m]=A\cos\left(2\pi\frac{f_0}{M}m\right),
\quad m=0,\ldots,M-1,\tag{5a}
\]

其中 \(A\) 为幅度，\(f_0\) 是按 \(M\) 个样本归一化的离散频率。选择整数 \(f_0\) 使信号在 \(M\) 个采样点中包含整数个周期，以避免谱泄漏；并要求 \(M>k_{\max}\)，从而能够通过频谱峰值检测辨识最大的超扩展多普勒频移。

训练帧沿 DD 域第一列放置余弦导频，在首个网格再叠加一个高功率导频符号 \(x_p\)，其中 \(|x_p|^2\gg A^2\)。其 DD 矩阵为

（式（5）已在本页列出，此处不再重复列式。）

相应的时域训练向量由逆离散 Zak 变换得到：

\[
\mathbf s_t=\operatorname{IDZT}(\mathbf X_t)
=\operatorname{vec}(\mathbf X_t\mathbf F_N^H).\tag{6}
\]

路径 \(i\) 的时变信道抽头为 \(g[l_i,q]=h_i e^{j2\pi k_i(q-l_i)/(MN)}\)，因此时域训练接收信号满足

（式（7）已在本页列出，此处不再重复列式。）

随后对 \(\mathbf r_t\) 执行 DZT，得到训练帧的 DD 域接收矩阵 \(\mathbf Y_t\)。由于余弦可分解为两个正负频率复指数，经频域变换后，实际多普勒 \(k_i\) 将产生位于 \(k_i+f_0N\) 与 \(k_i-f_0N\) 的频谱峰，因此有可能恢复因 DD 域取模而丢失的多普勒整数周数。


训练信号经 IDZT 映射到时域，接收采样为
\[
r_t[q]=
\sum_{i=0}^{L-1}
h_i\,e^{j\frac{2\pi}{MN}k_i(q-l_i)}s_t[q-l_i]
+w[q].\tag{7}
\]
其中 \(w[q]\) 为方差 \(\sigma_w^2\) 的加性复高斯噪声，路径时变系数
\[
g[l_i,q]=h_i e^{j\frac{2\pi}{MN}k_i(q-l_i)}.\tag{8}
\]
训练帧的 DD 域接收矩阵为（原文式 (9)）
\[
\mathbf Y_t\triangleq\operatorname{DZT}(\mathbf r_t)
=\operatorname{vec}^{-1}(\mathbf r_t)\mathbf F_N.\tag{9}
\]
若只发送余弦导频，则 DT 域发送样本矩阵的元素为（原文式 (10)）
\[
\widetilde X_c[m,n]=\frac{c[m]}{\sqrt N}
=\frac A{\sqrt N}\cos\left(\frac{2\pi f_0}{M}m\right).\tag{10}
\]
若只保留余弦导频，时域序列为
\[
s_c[q]=\frac A{\sqrt N}
\cos\left(\frac{2\pi f_0}{M}(q-nM)\right).\tag{11}
\]
把余弦展开为两组复指数并乘上每条传播路径的多普勒相位，接收信号可写为（原文式 (12)）
\[
r_c[q]=\frac A{\sqrt N}
\sum_{i=0}^{L-1}h_i
e^{j\frac{2\pi}{MN}k_i(q-l_i)}
\cos\left(\frac{2\pi f_0}{M}(q-nM-l_i)\right)+w[q],\tag{12}
\]
用 Euler 公式展开余弦并整理后（原文式 (13)）
\[
r_c[q]=\frac A{2\sqrt N}
\sum_{i=0}^{L-1}h_i e^{j\frac{2\pi}{MN}k_i(q-l_i)}
\times\Big(e^{j2\pi\frac{f_0}{M}(q-l_i)}e^{-j2\pi f_0n}
+e^{-j2\pi\frac{f_0}{M}(q-l_i)}e^{j2\pi f_0n}\Big)+w[q],\tag{13}
\]
由于 \(f_0,n\) 均为整数，有 \(e^{j2\pi f_0n}=e^{-j2\pi f_0n}=1\)，故（原文式 (14)）
\[
r_c[q]=\frac A{2\sqrt N}
\sum_{i=0}^{L-1}h_i
\Big(
e^{j2\pi(q-l_i)\left(\frac{k_i}{MN}+\frac{f_0}{M}\right)}
+e^{j2\pi(q-l_i)\left(\frac{k_i}{MN}-\frac{f_0}{M}\right)}
\Big)+w[q].\tag{14}
\]
其频谱峰的位置与真实多普勒 \(k_i\pm f_0N\) 对应，而不像 DD 域那样只保留模 \(N\) 的频移，因此第二阶段能够恢复实际多普勒。

### B. DD 域的混叠参数估计

将实际多普勒折叠至 DD 域可观测范围：
\[
k_i'=
\begin{cases}
k_i,&|k_i|<N/2,\\
[k_i]_N,&\text{其他情形}.
\end{cases}\tag{15}
\]
原文图 1 区分三种情形：不同路径具有相同的时延和混叠多普勒；不同路径时延不同但混叠多普勒相同；以及两种参数均不同。第一种情况下，DD 域无法直接区分多条路径，初始增益也将混合；第二种能够区分时延，但尚不能把每个实际频移配到相应时延；第三种则较容易识别。

训练帧的 DD 域接收矩阵 \(\mathbf Y_t\) 按位置分为三类（原文式 (16)）：
\[
Y_t[m,n]=
\begin{cases}
h_i(A+x_p)+w[m,n], & m=l_i,\ n=k_i'=[k_i]_N,\\[2pt]
A h_i e^{j\frac{2\pi}{MN}k_i(m-l_i)}
\xi_i[m,n]
\cos\left(\frac{2\pi f_0}{M}[m-l_i]_M\right)+w[m,n], & m\ne l_i,\ n=k_i'=[k_i]_N,\\[2pt]
w[m,n], & \text{其他}.
\end{cases}\tag{16}
\]

高功率导频在相应时延与混叠多普勒栅格产生回波。为排除余弦导频的背景响应与噪声峰，定义
\[
P[n]=\frac1M\sum_{m=0}^{M-1}|Y_t[m,n]|^2,\qquad
T_n=A+\alpha P[n],\quad\alpha>0.\tag{17}
\]
当 \(|Y_t[m,n]|^2>T_n\) 时，判定当前格点为候选路径，其时延与混叠多普勒估计为
\[
\widehat l_\lambda(\widehat k_\iota')=m,\qquad
\widehat k_\iota'=n,
\]
对应复增益为
\[
\widehat h_\lambda(\widehat k_\iota')
=\frac{Y_t[\widehat l_\lambda(\widehat k_\iota'),\widehat k_\iota']}
{A+x_p}.\tag{18}
\]
检测得到的混叠多普勒、时延和复增益分别储存在相应的候选集合中，作为后续配对所需的先验信息。注意，在多个真实路径落入同一个 DD 格点时，该阶段的增益估计未必可靠。

#### 频域真实多普勒恢复

首先在 DT 域对检测到的高功率导频回波位置置零（原文式 (19)）
\[
\widetilde Y_c[m,n]=
\begin{cases}
0,&m=\widehat l_\lambda(\widehat k_\iota'),\ n\in\{0,N-1\},\\
\widetilde Y_t[m,n],&\text{其他},
\end{cases}\tag{19}
\]
其中 \(\widetilde{\mathbf Y}_t=\mathbf Y_t\mathbf F_N^{-1}\) 为置零前的 DT 域接收训练矩阵；再向量化得到隔离出的余弦接收序列（原文式 (20)）
\[
\check{\mathbf r}_c=\operatorname{vec}(\widetilde{\mathbf Y}_c).\tag{20}
\]
对其进行 \(MN\) 点 DFT：
\[
R[f]=\frac1{\sqrt{MN}}\sum_{q=0}^{MN-1}
\check r_c[q]e^{-j\frac{2\pi}{MN}fq}.\tag{21}
\]
把式 (14) 代入式 (21) 并整理，可得（原文式 (22)）
\[
R[f]=\frac A{2N\sqrt M}\sum_{i=0}^{L-1}h_i\times
\left(
e^{-j2\pi\left(\frac{k_i}{MN}+\frac{f_0}{M}\right)l_i}
\sum_{q=0}^{MN-1}
e^{j2\pi\left(\frac{k_i}{MN}+\frac{f_0}{M}-\frac{f}{MN}\right)q}
\right.
\left.
+e^{-j2\pi\left(\frac{k_i}{MN}-\frac{f_0}{M}\right)l_i}
\sum_{q=0}^{MN-1}
e^{j2\pi\left(\frac{k_i}{MN}-\frac{f_0}{M}-\frac{f}{MN}\right)q}
\right)+W[f],\tag{22}
\]
其中 \(f=-MN/2+1,\ldots,MN/2\)。两括号内的和分别在 \(\frac{k_i}{MN}+\frac{f_0}{M}-\frac{f}{MN}=0\) 与 \(\frac{k_i}{MN}-\frac{f_0}{M}-\frac{f}{MN}=0\) 时等于 \(MN\)，否则为零，因此（原文式 (23)）
\[
R[f]=
\begin{cases}
\dfrac{A\sqrt M}{2}h_i e^{-j\frac{2\pi}{MN}fl_i}+W[f],&f=k_i+f_0N,\\[6pt]
\dfrac{A\sqrt M}{2}h_i e^{-j\frac{2\pi}{MN}fl_i}+W[f],&f=k_i-f_0N,\\[6pt]
W[f],&\text{其他}.
\end{cases}\tag{23}
\]
对非重复的半谱执行门限检测：
\[
\widehat k_i=f-f_0N
\quad\text{若}\quad |R[f]|^2>\gamma\sigma_w^2,\ \gamma>0.\tag{24}
\]
于是得到包含实际多普勒频移的候选集合 \(\mathcal K\)。随后按模 \(N\) 分组，
\[
\mathcal K'=\{\kappa_i=[\widehat k_i]_N:
\widehat k_i\in\mathcal K\},\tag{25}
\]
并结合第一阶段的时延集合和增益集合完成路径关联。

**一对一情况**：若某个混叠多普勒只对应一个真实频移和一个时延，则直接形成 \((\widehat l_j,\widehat k_j,\widehat h_j)\) 的估计路径（原式 (26)）。

**时延互异但折叠频移相同**：若某一组真实频移候选数与候选时延数相等，比较由频域峰值重建的增益模值和第一阶段对应时延处的增益模值，选择差值最小的配对。其选择准则为
\[
\beta^\star(\lambda)=\arg\min_\beta
\left|
\frac{2}{A\sqrt M}
|R(\widehat k_\beta+f_0N)|
-|\widehat h_\lambda(\widehat k_\iota')|
\right|.\tag{27}
\]
据此为每个时延分配真实多普勒。

**时延与折叠频移均相同**：若多个真实频移在 DD 域落到同一格点，则复制该时延作为多条候选路径，同时暂时把其增益置为零。混合情况先匹配能够区分的时延，再处理相同时延的剩余频移。

**时域最小二乘精化。** 对尚未可靠确定增益的路径，截取 \(\widetilde Q\) 个接收训练样本，建立
\[
\mathbf r'_t=\boldsymbol\Phi\widehat{\mathbf h},\tag{28}
\]
其中
\[
\Phi[\widetilde q,j]=
e^{j\frac{2\pi}{MN}\widehat k_j(\widetilde q-\widehat l_j)}
s_t[\widetilde q-\widehat l_j],
\]
其中接收样本向量与待估增益向量分别为（原文式 (29)–(30)）
\[
\mathbf r'_t=[r'_t[0],\ldots,r'_t[\widetilde q],\ldots,
r'_t[\widetilde Q-1]]^T\in\mathbb C^{\widetilde Q\times1},\tag{29}
\]
\[
\widehat{\mathbf h}
=[\widehat h[0],\ldots,\widehat h[j],\ldots,
\widehat h[\widetilde L-1]]^T\in\mathbb C^{\widetilde L\times1},\tag{30}
\]
使用
\[
\widehat{\mathbf h}
=(\boldsymbol\Phi^H\boldsymbol\Phi)^{-1}
\boldsymbol\Phi^H\mathbf r'_t\tag{31}
\]
恢复各路径增益。这里 LS 仅在第一阶段增益出现混叠歧义等情形下额外执行，并不是所有信道实现都要调用。

**原文图 1 与例 2。** \(M=8,N=6\) 时，九条路径为
\[
\{(0,0),(1,10),(2,13),(4,2),(4,14),
(5,20),(6,19),(7,3),(7,9)\}.
\]
不同路径可按照一对一、互异时延及相同时延三种规则恢复。比如 \((2,13)\) 与 \((6,19)\) 通过式 (27) 配对；\((7,3)\) 与 \((7,9)\) 共享同一时延，先赋零增益，再用时域 LS 恢复。对于 \((4,2)\)、\((4,14)\)、\((5,20)\) 的混合情况，则先确定 \((5,20)\)，再把其余两个频移与时延 4 关联。

#### 两阶段估计模型补充

设 \(k'_i\) 表示 DD 域观察到的混叠多普勒索引：

（式（15）已在本页列出，此处不再重复列式。）

**第一阶段：DD 域估计。** 接收机使用强导频回波估计路径时延 \(\hat l_i\)、混叠多普勒 \(\hat k'_i\) 和路径增益 \(\hat h_i\)。为抑制余弦导频回波和噪声，作者采用随多普勒列变化的自适应门限：

（式（17）已在本页列出，此处不再重复列式。）

对满足 \(|Y_t[m,n]|^2>T_n\) 的栅格，将 \(m,n\) 视为候选时延和混叠多普勒，并估计对应的复增益：

（式（18）已在本页列出，此处不再重复列式。）

如果若干路径具有不同的时延却具有相同混叠多普勒，第一阶段能够检测出对应的多个时延候选；如果多条路径同时具有相同的时延和混叠多普勒，则它们在 DD 域内不可区分，只会产生一个合并的估计，需要依赖第二阶段分解。

**第二阶段：频域峰值检测与路径配对。** 首先，在已识别的强导频回波位置将延迟–时间域样本置零，尽量从接收训练信号中移除强导频分量，得到仅包含余弦导频回波的近似信号 \(\check{\mathbf r}_c\)。对其进行长度 \(MN\) 的 DFT：

（式（21）已在本页列出，此处不再重复列式。）

当候选频谱峰值超过噪声门限时，利用

（式（24）已在本页列出，此处不再重复列式。）

恢复实际多普勒索引。随后将其再次模 \(N\)，与第一阶段得到的混叠多普勒候选匹配。对于同一混叠多普勒下存在多个时延的情况，算法使用频谱峰值反推的增益幅度与第一阶段估计的增益幅度之间的差异，选出最合理的时延–多普勒配对；对于具有相同混叠多普勒和时延的不同路径，则保留多个实际多普勒候选，并在下一步重新估计各路径增益。

最后，通过最小二乘法拟合时域接收信号与候选路径构成的字典矩阵，从而联合更新通道增益。这样，两阶段方案分别发挥 DD 域便于提取时延/混叠多普勒与时域余弦导频频谱能够揭示实际多普勒的优势。

**原文图 1**：在不同路径共享相同或不同延迟、相同或不同混叠多普勒时，接收导频回波的位置关系。**原文图 2**：两阶段信道估计的处理流程。有关精确路径集合构造、所有分支及复杂度分析，应对照原论文 Algorithm 1、附录和式（25）–（29）。

#### 多普勒分组与时延配对

第一阶段根据 DD 域导频回波估计路径时延 \(\hat l\)、混叠多普勒 \(\hat k'\) 以及初步路径增益 \(\hat h\)。第二阶段利用余弦导频回波的频谱峰恢复**实际多普勒**。这两个阶段得到的结果尚不能直接组成物理路径，需要先根据模 \(N\) 后的多普勒索引分组，再在组内进行时延与多普勒配对。

记第二阶段检测出的实际多普勒集合为 \(\mathcal K=\{\hat k_i\}\)，它们的混叠索引集合为

（式（25）已在本页列出，此处不再重复列式。）

令 \(\widetilde{\mathcal K}\) 为去重后的混叠索引集合。对其中每个 \(\tilde\kappa\)，构造与之对应的实际多普勒候选集：

\[
\mathcal K_{\tilde\kappa}
=\{\hat k_i:[\hat k_i]_N=\tilde\kappa\}.
\]

随后根据这一候选集中实际多普勒的数量、以及第一阶段对应时延候选的数量，分情况处理。

**情况 1：路径具有相同延迟和相同混叠多普勒。** 第一阶段只能观测到它们合并后的一个导频回波，初步增益不可靠；第二阶段能够从余弦谱中识别它们各自不同的实际多普勒。算法为这些多普勒候选分配相同的第一阶段时延，并暂时把对应增益设为 0，稍后通过时域最小二乘重新求解。

**情况 2：路径具有不同延迟，但混叠多普勒相同。** 第一阶段提供多个不同的时延候选，第二阶段提供若干具有相同模 \(N\) 索引的实际多普勒。算法依次比较各个候选组合的增益幅度：用频域峰值和原文式（23）反推实际多普勒对应的幅度，再与第一阶段该时延的增益幅度比较，选取偏差最小的匹配。原文式（27）给出相应的最小幅度差准则。

**情况 3：路径具有不同延迟和不同混叠多普勒。** 两阶段估计提供一一对应的候选，因此可直接从第一阶段获取时延和复增益，并由第二阶段替换为未混叠的实际多普勒索引。

还可能发生多个上述情况混合出现：例如，若同一个混叠多普勒组内有多于一个时延，而实际多普勒候选又比时延候选更多，则部分不同延迟路径可按情况 2 利用增益幅度完成配对，余下具有相同延迟的路径按照情况 1 保留并在下一步重新估计增益。

最后，将所有已确定的延迟–实际多普勒组合整理为路径列表 \(\hat{\mathcal H}\)。对那些在第一阶段无法区分、临时设置增益为零的路径，使用时域接收训练信号构造线性回归模型：

（式（28）已在本页列出，此处不再重复列式。）

其中矩阵 \(\boldsymbol\Phi\) 的列由每一条候选路径的时延、实际多普勒和已知发送训练信号计算得到。使用 \(\widetilde Q\) 个接收时域样本构成超定方程，按原文式（31）对路径复增益做最小二乘估计，再把临时置零的增益替换为相应估计值。这一重估只针对存在不可区分混叠路径的情况执行。

#### 九路径配对示例

**图 1（DD 域导频回波）**：原文取 \(M=8,N=6\)，共有九条传播路径，其 \((l_i,k_i)\) 分别为

\[
\{(0,0),(1,10),(2,13),(4,2),(4,14),
(5,20),(6,19),(7,3),(7,9)\}.
\]

这里既包含欠扩展路径，也包含实际多普勒超过半个子载波间隔的超扩展路径；图中标明每个 DD 导频回波的位置及其路径编号。对实际多普勒模 6 后，可把九条路径划分为五个具有不同混叠多普勒的分组：

\[
\{0\},\quad\{13,19\},\quad
\{2,14,20\},\quad\{3,9\},\quad\{10\}.
\]

其中组 \(\{0\}\) 和 \(\{10\}\) 只有唯一实际多普勒，并可与各自的第一阶段时延直接匹配，得到 \((0,0)\) 和 \((1,10)\)。组 \(\{13,19\}\) 的路径具有不同延迟，利用增益幅度配对可恢复 \((2,13)\) 与 \((6,19)\)。组 \(\{3,9\}\) 具有同一时延 7，得到 \((7,3)\) 和 \((7,9)\)，两条路径的复增益暂时置零。组 \(\{2,14,20\}\) 含有两个时延候选 4 与 5：首先将 \((5,20)\) 与其对应的第一阶段增益匹配，再把剩余实际多普勒 2 和 14 与时延 4 配对，得到 \((4,2)\) 与 \((4,14)\)。最后，使用时域最小二乘重新估计在第一阶段不可区分的第 3、4、7、8 条路径增益。

**图 2（两阶段信道估计流程图）**：训练帧先在 DD 域经过导频回波检测，得到延迟、混叠多普勒及增益候选；再在时域去除强导频回波并做 FFT，检测余弦引起的实际多普勒峰；依据模 \(N\) 后的分组关系执行不同的时延配对规则，必要时在时域最小二乘重估增益，最终输出未混叠的传播路径列表。

### C. 复杂度

传统嵌入式导频估计主要涉及 OTFS 解调，复杂度为 \(\mathcal O(MN\log_2N)\)。所提方法第一阶段门限计算需要 \(\mathcal O(MN)\)，第二阶段 FFT 需要 \(\mathcal O(MN\log_2(MN))\)，若执行 LS，复杂度为 \(\mathcal O(\widetilde Q\widetilde L^2+\widetilde L^3)\)，其中 \(\widetilde L\) 为检测路径数。新增运算量约为
\[
\mathcal O\left(MN+MN\log_2(MN)
+\widetilde Q\widetilde L^2+\widetilde L^3\right).
\]

#### 复杂度补充

传统嵌入式导频 OTFS 信道估计的主要复杂度来自含 FFT 的解调，数量级为 \(O(MN\log_2 N)\)。所提方法的第一阶段需要按式（17）计算每个多普勒列的自适应门限，开销为 \(O(MN)\)。第二阶段新增长度 \(MN\) 的 FFT，复杂度为 \(O(MN\log_2(MN))\)。若存在相同延迟和相同混叠多普勒的多个路径，还需用最小二乘重新估计复增益，其开销约为 \(O(\widetilde Q\widetilde L^2+\widetilde L^3)\)，其中 \(\widetilde Q\) 是使用的时域观测数，\(\widetilde L\) 是待拟合路径数。因此相对传统导频方法新增的主要运算量为

\[
O\left(
MN+MN\log_2(MN)+
\widetilde Q\widetilde L^2+\widetilde L^3
\right).
\]

最后一项只在发生上述路径混叠、必须重新拟合复增益的信道实现中出现，并非每个信道都要支付。

### D. PAPR 与频谱效率

作者认为，所提训练帧的峰均功率比（PAPR）与标准嵌入式导频方案相当：在 \(M=512\)、\(N=64\)、导频相对 SNR 差为 \(28\ \mathrm{dB}\) 时，所提帧 PAPR 为 \(25.7\ \mathrm{dB}\)，对照方案约为 \(25\ \mathrm{dB}\)。训练帧需要独占一帧，因此实际频谱效率还取决于训练帧的发送周期。作者举例指出，在 \(100\ \mathrm{km/h}\) 速度下，终端于 \(50\ \mathrm{ms}\) 内移动约 \(1.39\ \mathrm m\)。对 \(N=64,\Delta f=15\ \mathrm{kHz}\) 的 OTFS，帧时长约 \(4.26\ \mathrm{ms}\)，因而可在一次训练后连续发送约十帧数据，再更新信道估计。该设置的前提是路径几何在相关时间内保持近似不变。

#### 频谱效率分析

所提训练帧在 DD 域含有 \(MN-M\) 个零位置，在延迟–时间域中，余弦信号与单个导频符号扩展到这些零位置，因此其峰均功率比（PAPR）与普通嵌入式导频方案处于类似量级。实验取 \(M=512,N=64,\Delta\mathrm{SNR}=28\,dB\) 时，所提训练帧的 PAPR 为 25.7 dB，普通嵌入式导频方案约为 25 dB。

在频谱效率方面，所提方案需要单独发送一帧用于信道估计，然后可以连续发送多个数据帧。因此实际开销由**信道几何相干时间**决定，即多条路径的延迟–多普勒几何关系近似保持不变的时长。例如，车速为 100 km/h 时，50 ms 内车辆移动约 1.39 m；作者认为在典型城市环境中，这一位移通常不会显著改变路径几何。若 \(N=64,\Delta f=15\,kHz\)，OTFS 单帧时长约为 4.26 ms，那么一次训练后连续发送约 10 帧数据的周期总计约 11 帧，导频开销约 9%，频谱效率约 91%。

相比之下，传统嵌入式导频若把导频和保护区仅安排在第一帧，而随后发送 10 帧数据，取 \(l_{\max}=20,M=512\) 时，估计的平均开销约为 0.7%，频谱效率约 99.3%。所以传统方案在资源开销上更节省；但由于没有解决超扩展多普勒的模运算混叠，作者展示其在该类信道下无法正常估计实际多普勒。所提方法因此是**以频谱效率换取超扩展多普勒估计能力**，而不是在所有评价指标上都无条件优于传统方案。

## IV. 数值结果与讨论

### 主要仿真结果

**表 I：场景 A 与场景 B 的仿真参数（原文 TABLE I，第 7 页）**

| 参数 | 取值 |
|---|---|
| 子载波间隔 \(\Delta f\) | 15 kHz |
| 每个时隙的采样数 \(M\) | 512 |
| OTFS 帧时隙数 \(N\) | 64 |
| 调制方式 | 4-QAM |
| 余弦导频归一化频率 \(f_0\) | 50 |

表中数值按原表逐格转写；按 IEEE 版权口径只转录表格数据与符号。

**场景 A：随机多径信道。** 使用五条路径，路径时延索引服从 \(\mathcal U(0,20)\)，多普勒索引服从 \(\mathcal U[-160,160]\)。图 3 的阈值敏感性分析表明，\(\alpha\) 太小会把噪声或余弦导频泄漏视为路径，太大则遗漏弱路径。在对应仿真设置中，\(\alpha\approx2.5\) 时 NMSE 较小。图 7–8 进一步显示，随着用于 LS 精化的采样数 \(\widetilde Q\) 增加，NMSE 和 BER 改善，但约在 \(\widetilde Q>1000\) 后趋于饱和。因此该设置下 \(\widetilde Q=1000\) 已基本足够。

**场景 B：多 LEO 卫星向地面终端协同发送。** 假设 \(S\) 颗卫星在轨道上均匀分布，其中 \(L\le S\) 颗卫星于地面终端的可见弧范围内联合服务。设卫星 \(S_1\) 相对终端地平线的仰角为 \(\alpha_1\)、中心角为 \(\psi_1\)，则第 \(i\) 颗卫星与 \(S_1\) 之间的夹角为（原文式 (32)）
\[
\theta_i=\frac{2\pi}{S(R+h)}(i-1).\tag{32}
\]
> **原文疑点：** 式 (32) 的分母含 \(R+h\)，而角度量纲上通常应为 \(\theta_i=2\pi(i-1)/S\)；此处按原文转写，未擅自改动。

第 \(i\) 颗卫星与终端之间的卫星中心角为（原文式 (33)）
\[
\psi_i=
\begin{cases}
\psi_1-\theta_i,&\theta_i<\psi_1,\\
\theta_i-\psi_1,&\text{其他},
\end{cases}\tag{33}
\]
其中 \(i\in[1,S]\)，并可由下式计算（原文式 (34)）
\[
\psi_i=\cos^{-1}\left(\frac{R\cos\alpha_i}{R+h}\right)-\alpha_i.\tag{34}
\]
整体信道为
\[
h(\tau,\nu)=\sum_{p=1}^{L}h_p\delta(\tau-\tau_p)\delta(\nu-\nu_p).\tag{35}
\]
传播时延为（原文式 (36)）
\[
\tau_p=\frac{d_p}{c},\qquad
d_p=\sqrt{R^2+(R+h)^2+2R(R+h)\cos\psi_p},\tag{36}
\]
路径功率约按距离平方反比衰减（原文式 (37)）
\[
E_p\propto d_p^{-2},\tag{37}
\]
多普勒由卫星速度、载频和观测几何决定（原文式 (38)）
\[
\nu_p=\frac{f_cv_s}{c}\cdot\frac{R}{R+h}\cos\alpha_p.\tag{38}
\]

仿真取 \(S=120\)、终端仰角范围 \(10^\circ\) 至 \(90^\circ\)、轨道高度 \(550\ \mathrm{km}\)、卫星速度 \(7.8\ \mathrm{km/s}\)、地球半径 \(6378\ \mathrm{km}\)。图 10–11 显示，对应设置下第一阶段阈值参数 \(\alpha\approx3\)、第二阶段 \(\gamma\approx50\) 时 NMSE 较低。图 12–15 研究相对导频功率、数据 SNR 和 LS 采样数的影响：在给定设置中，数据 SNR 为 \(20\ \mathrm{dB}\)、余弦导频 SNR 为 \(2\ \mathrm{dB}\) 时，BER 可达到约 \(10^{-4}\)；余弦导频 SNR 为 \(7\ \mathrm{dB}\) 的方案在该 BER 附近相对完美 CSI 约有 \(1.5\ \mathrm{dB}\) 的性能损失。随 \(\widetilde Q\) 增加，性能提升也在约 1000 个采样后逐渐饱和。

### A. 地面信道场景

论文通过归一化均方误差（NMSE）和误码率（BER）评估估计质量。\(\mathbf g\) 表示由真实路径参数构建的延迟–时间域信道矩阵，\(\hat{\mathbf g}\) 是估计矩阵，NMSE 定义为

\[
\mathrm{NMSE}=
\mathbb E\left[
\frac{\|\hat{\mathbf g}-\mathbf g\|_2^2}
{\|\mathbf g\|_2^2}
\right].
\]

BER 使用零填充 OTFS（ZP-OTFS）系统中的最大比合并（MRC）检测器，阻尼因子为 0.25，最多迭代 10 次。假设训练帧先于数据帧发送，且二者之间信道保持不变。时域强导频、余弦导频与数据的信噪比分别记为 \(\mathrm{SNR}_p=|x_p|^2/(N\sigma_w^2)\)、\(\mathrm{SNR}_c=A^2/(N\sigma_w^2)\)、\(\mathrm{SNR}_d=E_s/\sigma_w^2\)；二者差值为 \(\Delta\mathrm{SNR}=\mathrm{SNR}_p-\mathrm{SNR}_c\)（这里的 SNR 按 dB 计时使用差值）。

**场景 A：地面信道、路径增益相等。** 共有 5 条传播路径，时延索引服从 \(U(0,20)\)，多普勒索引服从 \(U[-160,160]\)。

**图 3（NMSE 与第一阶段门限 \(\alpha\)）**：固定 \(\Delta\mathrm{SNR}=28\,dB\)，考察不同余弦导频 SNR。\(\alpha\) 过小会使 DD 域中的噪声和余弦导频分量触发虚假路径检测；\(\alpha\) 过大又会漏检弱路径。仿真中不同 \(\mathrm{SNR}_c\) 的最佳值都接近 \(\alpha=2.5\)，因此场景 A 后续使用这一设置。

**图 4（NMSE 与第二阶段门限 \(\gamma\)）**：低门限会把噪声主导的频域分量误识别为多普勒峰值；过高门限则错过弱路径的真实频率峰。作者据此选择折中门限，后续实验固定相应取值。

**图 5（NMSE 与 \(\Delta\mathrm{SNR}\)）**：改变强导频相对余弦导频的功率配置，考察两个阶段是否能够同时可靠工作。强导频应足以在 DD 域识别延迟与混叠多普勒，余弦导频又必须保留足够能量在频域分辨真实多普勒，二者之间存在可行的功率分配折中。传统嵌入式导频只适用于欠扩展多普勒，应用于超扩展信道时出现明显的估计失败。

**图 6（ZP-OTFS 的 BER 与数据 SNR）**：固定 \(\Delta\mathrm{SNR}=28\,dB\)、时域重估观测数 \(\widetilde Q=2000\)，比较 \(\mathrm{SNR}_c=7,12,17\,dB\)。所提方法的检测性能在 BER 达到约 \(10^{-4}\) 之前与理想 CSI 非常接近；在 BER 约 \(2\times10^{-5}\) 的区域，\(\mathrm{SNR}_c=12\,dB\) 与 17 dB 的结果近乎相同，相对理想 CSI 有约 1 dB 的损失，说明该场景不必一味增大余弦导频功率。普通嵌入式导频方法在超扩展信道下的 BER 严重退化。

**图 7（NMSE 与 \(\widetilde Q\)）和图 8（BER 与 \(\widetilde Q\)）**：\(\widetilde Q\) 表示针对共享相同时延和混叠多普勒的路径，用于时域最小二乘增益重估的接收样本数。随着观测数增加，NMSE 和 BER 均降低，但当 \(\widetilde Q\) 超过约 1000 后性能趋于饱和。作者据此认为 1000 个观测足以在该仿真设置下获得可靠的增益估计与检测性能。

### B. 多卫星场景

**图 9（卫星协作场景）**：考虑位于地面用户可见区域内的若干 LEO 卫星，它们沿同一轨道等间隔分布，以速度 \(v_s\) 和高度 \(h\) 运动，地球半径为 \(R\)，地面终端记作 \(T\)。共有 \(S\) 颗轨道卫星，实际上参与用户协作传输的可见卫星数量为 \(L\le S\)。对第 \(p\) 颗卫星，路径时延来自卫星–终端距离与光速之比，路径平均功率按距离平方反比衰减，多普勒频移则由轨道速度、载频及几何仰角关系确定。原文式（32）–（38）给出各卫星的几何关系、距离、路径增益及多普勒模型。

仿真取 \(S=120\)，用户仰角范围 10°–90°，卫星高度 550 km，速度 7.8 km/s，地球半径 6378 km。在这个场景中，不同卫星的多普勒可能具有很大差异，因此容易出现 DD 域中的超扩展混叠。

**图 10（NMSE 与第一阶段门限）和图 11（NMSE 与第二阶段门限）**：考虑余弦导频 SNR 为 2 dB 和 7 dB，固定 \(\Delta\mathrm{SNR}=28\,dB\)。门限过小导致虚警、过大导致漏检的规律与场景 A 相似。场景 B 的最低 NMSE 出现在 \(\alpha\approx3\)、\(\gamma\approx50\) 附近，后续实验采用这些设置。

**图 12（NMSE 与 \(\Delta\mathrm{SNR}\)）**：对 \(\mathrm{SNR}_c=2,7\,dB\) 考察导频功率差对估计性能的影响，得到与场景 A 相近的变化趋势。

**图 13（BER 与数据 SNR）**：取 \(\Delta\mathrm{SNR}=28\,dB\)、\(\widetilde Q=2000\)。余弦导频功率提高时，BER 下降。对于 \(\mathrm{SNR}_c=2\,dB\)，数据 SNR 达到约 20 dB 时 BER 可达到 \(10^{-4}\)；在 BER 为 \(10^{-4}\) 时，\(\mathrm{SNR}_c=7\,dB\) 的结果相比理想 CSI 有约 1.5 dB 差距。

**图 14（NMSE 与 \(\widetilde Q\)）和图 15（BER 与 \(\widetilde Q\)）**：固定 \(\Delta\mathrm{SNR}=28\,dB\)，比较两个余弦导频 SNR 和不同数据 SNR。与场景 A 一致，更多时域样本可以提高路径增益最小二乘估计精度，但 \(\widetilde Q\) 超过约 1000 后性能逐渐饱和。

### C. 分数多普勒扩展限制

论文指出，可在第二阶段采用高分辨率 FFT 估计实际分数多普勒，并采用相同的分组配对思想。但分数多普勒会在 DD 域产生泄漏，令初始增益不再精确，因此必须考虑时域 LS 重估。在时延和混叠频移均不重合的情况下效果较好；对不同时延但接近的混叠分数多普勒，约 1% 的信道实现出现不准确估计；对时延和混叠多普勒同时重合的路径，估计将明显失准。作者明确将这些未解决情况列为后续研究内容。

#### 分数多普勒失效情形

本文主要假设延迟与多普勒索引是整数。为了处理分数多普勒，可以在第二阶段采用更高分辨率的 FFT：第一阶段仍检测混叠分数多普勒对应的整数索引，第二阶段通过高分辨率频谱分析估计实际分数多普勒，再参考整数情形进行延迟–多普勒配对。由于分数多普勒会引入栅格间能量泄漏，直接在 DD 域估计的复路径系数可能失准，因此还需要利用时域最小二乘重新估计增益。

作者特别说明，这种直接扩展在**情况 3**（不同延迟、混叠分数多普勒相差至少一个栅格）中效果较好；但在**情况 2**（不同延迟、混叠分数多普勒十分接近）中，约 1% 的信道实现会出现不准确估计，因为其配对步骤依赖已因泄漏而失真的 DD 域增益。对于**情况 1**（相同延迟和相同混叠多普勒），由于混叠严重、增益估计不准且算法复杂，直接扩展可能高度不准确。作者明确指出，解决情况 1 和情况 2 的分数多普勒配对问题仍需要进一步研究；分数延迟与分数多普勒的系统性处理属于后续工作，而非本文已验证的结果。

## V. 结论

论文研究超扩展多普勒时变信道中的 OTFS 估计问题。大于半个子载波间隔的实际多普勒频移，在 DD 域经模 \(N\) 运算后发生混叠，令常规导频方法无法辨识实际多普勒。为此，设计同时包含高功率 DD 导频符号与余弦导频信号的训练帧，并提出两个阶段的估计器：第一阶段在 DD 域估计传播路径的时延、混叠多普勒和初步复增益；第二阶段把接收时域余弦回波变换到频域，从频谱峰恢复实际多普勒，并按不同的混叠路径类型与第一阶段时延及增益进行配对，必要时在时域重新估计增益。论文分析了 FFT、门限计算及最小二乘带来的复杂度，利用地面多径与多卫星协作两种场景的 NMSE 和 BER 验证方案。今后的研究将继续处理分数时延和多普勒条件下的可靠路径配对问题。

## 附录：频域余弦峰检测算法（部分）

原文附录给出第二阶段 CosineFreqPeak 的伪代码（输入为接收训练向量、第二级门限 \(\gamma\)、余弦导频参数、一阶段得到的混叠多普勒集合 \(\mathcal A\)、各混叠多普勒对应的时延集合与增益集合；输出为路径参数集合 \(\mathcal H\)）。其分支结构可梳理为：

1. 置 \(\mathcal H=\varnothing\)、\(\mathcal K=\varnothing\)；按式 (19)–(20) 得到隔离后的余弦回波 \(\check{\mathbf r}_c\)，按式 (21) 计算 \(R[f]\)。
2. 对 \(f=0,\ldots,MN/2\)，若 \(|R[f]|^2>\gamma\sigma_w^2\)，则令 \(\widehat k_i=f-f_0N\) 并加入 \(\mathcal K\)。
3. 由式 (25) 得到混叠索引集合，去重后记为 \(\widetilde{\mathcal K}\)。
4. 对每个 \(\tilde\kappa\in\widetilde{\mathcal K}\)，收集同余的实际多普勒候选集 \(\widetilde{\mathcal K}_i=\{\widehat k_i:[\widehat k_i]_N=\tilde\kappa\}\)，并在 \(\mathcal A\) 中找出对应的一阶段混叠索引 \(\widehat k'_\iota=\tilde\kappa\) 及时延/增益集合。
5. **分支 A（\(|\widetilde{\mathcal K}_i|=1\)）**：唯一对应，按式 (26) 直接取时延、实际多普勒与该时延对应的增益加入 \(\mathcal H\)。
6. **分支 B（\(|\widetilde{\mathcal K}_i|=|\mathcal L_{\widehat k'_\iota}|>1\)）**：对该组每个时延 \(\lambda\)，按式 (27) 的幅度差最小准则选出实际多普勒并配对。
7. **分支 C（\(|\widetilde{\mathcal K}_i|>1\) 且 \(|\mathcal L_{\widehat k'_\iota}|=1\)）**：把该组各实际多普勒都配到同一时延，增益暂置 0。
8. **分支 D（\(|\widetilde{\mathcal K}_i|>|\mathcal L_{\widehat k'_\iota}|>1\)）**：先用分支 B 处理可区分的时延，并从候选集中删去已配对的实际多普勒、时延与增益；剩余实际多普勒按分支 C 配到同一时延、增益置 0。
9. 按式 (31) 用 \(\widetilde Q\) 个时域样本重估增益，把第 7、8 步中临时置 0 的增益替换为 LS 解对应分量，返回 \(\mathcal H\)。

> **说明：** 上述为原文附录伪代码各分支与步骤的中文结构梳理，按 IEEE 版权口径不含原文逐句转述；第 5–8 步的分支条件与式 (26)、(27) 一一对应。

**本轮补齐与剩余事项**：已补入式 (4)、(9)–(10)、(12)–(14)、(16)、(19)–(23)、(29)–(30)、(32)–(34)、(36)–(38) 的转写、表 I 与参考文献 [1]–[28]，并补上附录算法的分支结构。仍待逐点核对图 3–15 的曲线数据、复核式 (32) 的量纲疑点，并对全篇做逐句终校；因此不标记为已通过全文验收。

## 参考文献

下列 28 条参考文献按原论文编号转录自 PDF 第 12–13 页（References），保留英文原书目信息（题名、作者、期刊/会议、卷期页、年份），条目文字未作翻译。

[1] C.-X. Wang, X. You, T. Han, H. Zhang, D.-C. Yuan, B. Ai, J. Zhang et al., “On the Road to 6G: Visions, Requirements, Key Technologies, and Testbeds,” IEEE Communications Surveys & Tutorials, vol. 25, no. 3, pp. 1552–1616, 2023.

[2] R. Hadani et al., “Orthogonal Time Frequency Space Modulation,” in Proc. IEEE Wireless Commun. Net. Conf., San Francisco, CA, USA, 2017, pp. 1–6.

[3] Y. Hong, T. Thaj, and E. Viterbo, Delay-Doppler Communications. Elsevier, 2022.

[4] P. Raviteja, Y. Hong, E. Viterbo, and E. Biglieri, “Effective Diversity of OTFS Modulation,” IEEE Wireless Commun. Lett., vol. 9, no. 2, pp. 249–253, 2020.

[5] T. Thaj, E. Viterbo, and Y. Hong, “General I/O Relations and Low-Complexity Universal MRC Detection for All OTFS Variants,” IEEE Access, vol. 10, pp. 96 026–96 037, 2022.

[6] P. Raviteja, K. T. Phan, and Y. Hong, “Embedded Pilot-Aided Channel Estimation for OTFS in Delay–Doppler Channels,” IEEE Trans. Veh. Tech., vol. 68, no. 5, pp. 4906–4917, 2019.

[7] O. K. Rasheed, G. D. Surabhi, and A. Chockalingam, “Sparse Delay-Doppler Channel Estimation in Rapidly Time-Varying Channels for Multiuser OTFS on the Uplink,” in Proc. IEEE 91st Veh. Tech. Conf., Antwerp, Belgium, 2020, pp. 1–5.

[8] P. Raviteja, K. Phan, Y. Hong, and E. Viterbo, “Orthogonal Time Frequency Space (OTFS) Modulation Based Radar System,” in 2019 IEEE Radar Conference (RadarConf), Boston, MA, USA, 2019, pp. 1–6.

[9] T. Thaj, E. Viterbo, and Y. Hong, “Orthogonal Time Sequency Multiplexing Modulation: Analysis and Low-Complexity Receiver Design,” IEEE Transactions on Wireless Communications, vol. 20, no. 12, pp. 7842–7855, 2021.

[10] A. Thomas, K. Deka, P. Raviteja, and S. Sharma, “Convolutional Sparse Coding Based Channel Estimation for OTFS-SCMA in Uplink,” IEEE Transactions on Communications, vol. 70, no. 8, pp. 5241–5257, 2022.

[11] H. B. Mishra, P. Singh, A. K. Prasad, and R. Budhiraja, “OTFS Channel Estimation and Data Detection Designs With Superimposed Pilots,” IEEE Trans Wireless Commun., vol. 21, no. 4, pp. 2258–2274, 2022.

[12] F. Jesbin, S. Rao Mattu, and A. Chockalingam, “Sparse Superimposed Pilot Based Channel Estimation in OTFS Systems,” in 2023 IEEE Wireless Communications and Networking Conference (WCNC), 2023, pp. 1–6.

[13] S. R. Mattu and A. Chockalingam, “Learning based Delay-Doppler Channel Estimation with Interleaved Pilots in OTFS,” in 2022 IEEE 96th Vehicular Technology Conference (VTC2022-Fall), 2022, pp. 1–6.

[14] W. Shen, L. Dai, J. An, P. Fan, and R. W. Heath, “Channel Estimation for Orthogonal Time Frequency Space (OTFS) Massive MIMO,” IEEE Trans. Sig. Proc., vol. 67, no. 16, pp. 4204–4217, 2019.

[15] Y. Liu, S. Zhang, F. Gao, J. Ma, and X. Wang, “Uplink-Aided High Mobility Downlink Channel Estimation Over Massive MIMO-OTFS System,” IEEE Journal Sel. Areas Commun., vol. 38, no. 9, pp. 1994–2009, 2020.

[16] D. Shi, W. Wang, L. You, X. Song, Y. Hong, X. Gao, and G. Fettweis, “Deterministic Pilot Design and Channel Estimation for Downlink Massive MIMO-OTFS Systems in Presence of the Fractional Doppler,” IEEE Trans. Wireless Commun., vol. 20, no. 11, pp. 7151–7165, 2021.

[17] L. Zhao, W.-J. Gao, and W. Guo, “Sparse Bayesian Learning of Delay-Doppler Channel for OTFS System,” IEEE Commun. Lett., vol. 24, no. 12, pp. 2766–2769, 2020.

[18] S. Srivastava, R. K. Singh, A. K. Jagannatham, and L. Hanzo, “Bayesian Learning Aided Sparse Channel Estimation for Orthogonal Time Frequency Space Modulated Systems,” IEEE Trans. Veh. Tech., vol. 70, no. 8, pp. 8343–8348, 2021.

[19] X. Li, Y. Liang, Z. Zhou, and P. Fan, “Fractional Delay-Doppler Channel Estimation for OTFS Systems Based on Segmentation Technique and Sparse Bayesian Learning,” IEEE Communications Letters, vol. 29, no. 5, pp. 1067–1071, 2025.

[20] Q. Deng, Y. Ge, and Z. Ding, “A Unifying View of OTFS and Its Many Variants,” IEEE Communications Surveys & Tutorials, pp. 1–1, 2025.

[21] N. Kalpage, Y. Hong, and P. Priya, “Performance Analysis and Joint Receiver Design for an OTFS-Based ISAC System in Time-Varying Channels,” IEEE Trans. Veh. Tech., pp. 1–6, 2025.

[22] J. Jayachandran, I. A. Khan, S. K. Mohammed, R. Hadani, A. Chockalingam, and R. Calderbank, “Zak-OTFS with Interleaved Pilots to Extend the Region of Predictable Operation,” IEEE Transactions on Vehicular Technology, pp. 1–15, 2025.

[23] M. Li, S. Zhang, Y. Ge, F. Gao, and P. Fan, “Joint Channel Estimation and Data Detection for Hybrid RIS Aided Millimeter Wave OTFS Systems,” IEEE Transactions on Communications, vol. 70, no. 10, pp. 6832–6848, 2022.

[24] P. Priya, Y. Hong, and E. Viterbo, “OTFS Channel Estimation and Detection for Channels With Very Large Delay Spread,” IEEE Transactions on Wireless Communications, vol. 23, no. 9, pp. 11 920–11 930, 2024.

[25] H. Luo and et. al., “Very-Low-Earth-Orbit Satellite Networks for 6G,” Communications of Huawei Research, no. 2, pp. 40–54, 2022.

[26] M. Duan, P. Zhang, S. Zhang, Y. Ge, O. A. Dobre, and C. Yuen, “Channel Estimation and Hybrid Precoding for Massive MIMO-OTFS System With Doubly Squint,” IEEE Transactions on Communications, vol. 73, no. 10, pp. 9388–9404, 2025.

[27] T. Thaj and E. Viterbo, “Low Complexity Iterative Rake Decision Feedback Equalizer for Zero-Padded OTFS Systems,” IEEE Trans. Veh. Tech., vol. 69, no. 12, pp. 15 606–15 622, 2020.

[28] A. S. Bora, K. T. Phan, and Y. Hong, “Spatially Correlated MIMO-OTFS for LEO Satellite Communication Systems,” in Proc. IEEE Intern. Conf. Commun. Workshops, Seoul, Korea, Republic of, 2022, pp. 723–728.

**书目转录说明：** 条目文字按 PDF 原样转写，未翻译、未补造 DOI；[25] 的 “et. al.” 为原文写法，未改动；[20]、[21]、[22] 为提前在线发表条目，原文即以 “pp. 1–1 / pp. 1–6 / pp. 1–15” 表示页码。IEEE 版权口径下只转录英文书目信息。

{% endraw %}
