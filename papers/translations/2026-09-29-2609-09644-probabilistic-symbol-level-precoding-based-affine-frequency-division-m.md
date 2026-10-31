---
layout: page
title: "基于概率符号级预编码的仿射频分复用传输｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-09644-probabilistic-symbol-level-precoding-based-affine-frequency-division-m/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/83918f571f3cd874/) · [原文 arXiv](https://arxiv.org/abs/2609.09644) · [全部目录](/papers/catalog/)

# 基于概率符号级预编码的仿射频分复用传输

**原题：** Probabilistic Symbol-Level Precoding based Affine Frequency Division Multiplexing Transmission  
**作者：** Shuntian Tang$^{*}$、Xinyi Wang$^{*}$、Shuangyang Li$^{\dagger}$、Tianqi Mao$^{\ddagger}$、Zilong Liu$^{\S}$、Zesong Fei$^{*}$  
**单位：** $^{*}$ 北京理工大学信息与电子学院（中国）；$^{\dagger}$ 柏林工业大学电气工程与计算机科学学院（德国）；$^{\ddagger}$ 北京理工大学近空间环境特性与效应国家重点实验室（中国）；$^{\S}$ 埃塞克斯大学计算机科学与电子工程学院（英国）。邮箱：bit tangshuntian@bit.edu.cn、wangxinyi@bit.edu.cn、shuangyang.li@tu-berlin.de、maotq@bit.edu.cn、zilong.liu@essex.ac.uk、feizesong@bit.edu.cn。  
**版本：** arXiv:2609.09644v1（eess.SP），2026 年 9 月 9 日；原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、结论、致谢、图 1—3 中文图注、表 I 逐格转录、参考文献 [1]—[26]（英文原条目，按原编号）按原文结构录入。原文为会议/快报式短文，不含附录与作者简介；逐句逐式终校未做。

## 摘要

仿射频分复用（affine frequency division multiplexing, AFDM）近期因其对时频双选择性信道衰落的鲁棒性而受到广泛关注。然而，接收端的高计算复杂度是实际部署的关键挑战。为克服该问题，我们提出一种基于概率符号级预编码（symbol-level precoding, SLP）的 AFDM 传输框架：该框架把下行传输中的处理负担从用户转移到基站（base station, BS），使用户无需信道估计或均衡即可直接进行符号检测。在所提框架中，BS 利用上行信道状态信息（channel state information, CSI）、基于上下行信道互易性来设计下行发射波形。特别地，我们通过显式刻画噪声扰动下符号检测错误的似然，创新性地引入概率 SLP 技术。具体而言，对发射符号进行优化，以最小化接收符号落入错误判决区域的似然；随后利用目标函数的单调性，把所得错误概率最小化问题近似为二阶锥规划（second-order cone programming, SOCP）问题。仿真结果表明，所提出的基于概率 SLP 的方案达到与传统 AFDM 接收机相当的性能，同时显著降低接收端的计算复杂度。这些结果证明了所提方法的有效性与实际潜力。

**索引词：** 仿射频分复用（AFDM）、信道互易性、低复杂度接收机、概率符号级预编码（SLP）。

## I. 引言

第六代（6G）无线通信系统被期望支持多样化服务与应用，包括在高移动性信道和/或高频段上的可靠数据传输 [1]。传统正交频分复用（orthogonal frequency division multiplexing, OFDM）在存在强多普勒频移、载波频率偏移与相位噪声时会因失去子载波正交性而出现严重性能退化，因此不适用于 6G 高移动性场景，如低地球轨道（low Earth orbit, LEO）卫星通信 [2] 与智能高速铁路（high-speed railway, HSR）通信 [3]。

作为一种有前景的替代方案，仿射频分复用（AFDM）近期因其对强多普勒频移 [4]、[5] 与各类硬件损伤 [6] 的固有鲁棒性而受到相当多的关注。AFDM 借助带可调参数的逆离散仿射 Fourier 变换（inverse discrete affine Fourier transform, IDAFT），能够灵活塑造仿射频率（affine frequency, AF）域的信号表示，从而在双色散信道中有效分离多径分量。该特性使 AFDM 能够获得满分集增益，即使在严重时频选择性下也保持可靠性能。基于这些优势，已有大量研究从不同角度增强 AFDM。对多输入多输出（multi-input multiple-output, MIMO）辅助的 AFDM，[7] 提出了基于稀疏图理论的联合数据检测与译码框架；[8] 研究了非正交 AFDM 以提升频谱效率；[9] 与 [10] 则研究了基于 AFDM 的索引调制，以进一步增强频谱效率与可靠性。此外，AFDM 在通信感知一体化（integrated sensing and communication, ISAC）等新兴应用中展现出强大潜力，见 [11]、[12]、[13]。这些研究共同凸显了 AFDM 在应对下一代无线系统挑战方面的通用性与有效性。

尽管上述工作展示了 AFDM 的优越性能，但注意到传统 AFDM 接收机通常具有较高的计算复杂度。因此，此类设计在上行链路中部署于基站（BS）较为可行，但在下行链路中受用户设备有限计算能力的限制，可能并不实用。遵循这一思路，一种有前景的做法是在时分双工（time division duplexing, TDD）工作模式下利用可用的上行信道状态信息（CSI），在下行传输之前于 BS 侧进行发射信号整形。例如，[14] 提出的时延—多普勒对齐调制可使多径分量同时到达，但一般需要多根天线。类似地，[15]—[17] 中基于几何星座整形的符号级预编码（SLP）技术已展现出显著性能增益与低复杂度接收；然而这些方法本质上依赖多天线处理，因而不能直接应用于单输入单输出（single-input single-output, SISO）系统，限制了其在更简单收发架构中的实用性。

为解决上述问题，我们提出一种 AF 域中基于概率 SLP 的 AFDM 传输框架，适用于 SISO 系统。我们的核心创新在于把信号处理负担从接收端转移到发射端，从而在下行接收端实现低复杂度符号检测。具体而言，相应波形设计被表述为概率优化问题：根据发射端可用的 CSI 优化发射符号，以最大化接收符号落在其正确判决区域内的概率。通过利用目标函数的单调性，原问题被进一步近似为可由二阶锥规划（SOCP）求解的可处理凸优化问题。数值结果验证了所提"免用户均衡"AFDM 传输框架的有效性。结果表明，在各种 CSI 条件下，它以远低于传统最小均方误差（minimum mean square error, MMSE）方法的复杂度达到与之相当的性能，证实了其鲁棒性与实际可行性。

## II. AFDM 基本原理

按 [4] 的框架简要回顾 AFDM 的基本原理。考虑一个 $N\times1$ 复符号向量 $\mathbf x=[x_0,x_1,\cdots,x_{N-1}]^{T}$，其元素取自 $M$ 阶星座字母表。对符号向量施加 $N$ 点 IDAFT，即把它从 AF 域变换到时域，所得时域样本为

$$
s_n=\frac{1}{\sqrt N}\sum_{m=0}^{N-1}x_me^{j2\pi\left(c_1n^2+\frac{1}{N}mn+c_2m^2\right)},\quad n=0,1,\cdots,N-1,\tag{1}
$$

其中 $c_1$ 与 $c_2$ 是可调参数，使 AFDM 能在双选择性衰落信道上获得满分集。为保持信号在 AF 域的周期性，在发射信号上附加长度为 $L_c$ 的 chirp 周期前缀（chirp-periodic prefix, CPP）。CPP 样本定义为

$$
s_n=s_{N+n}e^{j2\pi c_1\left(N^2+2Nn\right)},\quad n=-L_c,\cdots,-1,\tag{2}
$$

其中 $L_c$ 选为大于最大信道时延扩展（以样本数计）。值得注意的是，当 $2Nc_1$ 为整数且 $N$ 为偶数时，CPP 退化为常规循环前缀（cyclic prefix, CP）。

假设无线信道由 $P$ 条传播路径组成，接收时域信号可写为

$$
r_n=\sum_{i=1}^{P}h_is_{n-l_i}e^{j2\pi f_in}+w_n,\quad n=0,1,\cdots,N-1,\tag{3}
$$

其中 $h_i$、$l_i$ 与 $f_i$ 分别表示第 $i$ 条路径的复信道增益、离散传播整数时延与多普勒频移。注意分数时延被忽略，因为高采样周期使路径时延可由其最近的采样时刻很好地近似 [18]、[19]。$w_n\sim\mathcal{CN}(0,\sigma^2)$ 表示加性白高斯噪声（AWGN）。

接收端施加 $N$ 点离散仿射 Fourier 变换（discrete affine Fourier transform, DAFT）以恢复 AF 域信号。记所得向量为 $\mathbf y=[y_0,y_1,\cdots,y_{N-1}]^{T}$，接收 AF 域样本为

$$
y_m=\frac{1}{\sqrt N}\sum_{n=0}^{N-1}r_ne^{-j2\pi\left(c_2m^2+\frac{1}{N}mn+c_1n^2\right)},\quad m=0,1,\cdots,N-1.\tag{4}
$$

去除 CPP 后，AF 域输入—输出关系可紧凑地写成矩阵形式：

$$
\mathbf y=\sum_{i=1}^{P}h_i\mathbf H_i\mathbf x+\tilde{\mathbf w}=\mathbf H_{\mathrm{eff}}\mathbf x+\tilde{\mathbf w},\tag{5}
$$

其中 $\tilde{\mathbf w}\sim\mathcal{CN}(0,\sigma^2\mathbf I_N)$ 与 $\mathbf w$ 具有相同统计量。矩阵 $\mathbf H_i\in\mathbb C^{N\times N}$ 表示第 $i$ 条路径的信道贡献，为

$$
\mathbf H_i=\boldsymbol\Lambda_{c_2}\mathbf F\boldsymbol\Lambda_{c_1}\boldsymbol\Gamma_i\boldsymbol\Delta_{f_i}\boldsymbol\Pi^{l_i}\boldsymbol\Lambda_{c_1}^{H}\mathbf F^{H}\boldsymbol\Lambda_{c_2}^{H},\tag{6}
$$

其中 $\mathbf F$ 表示 $N$ 点离散 Fourier 变换（DFT）矩阵，$\boldsymbol\Lambda_c=\operatorname{diag}\left([1,e^{-j2\pi c},\cdots,e^{-j2\pi c(N-1)^2}]\right)$，$\boldsymbol\Delta_{f_i}$ 为多普勒频移矩阵，$\boldsymbol\Pi$ 表示循环置换矩阵。对角矩阵 $\boldsymbol\Gamma_i$ 定义为

$$
\boldsymbol\Gamma_i(i,i)=\begin{cases}e^{-j2\pi c_1\left(N^2-2N(l_i-n)\right)},&n<l_i,\\1,&n\geq l_i.\end{cases}\tag{7}
$$

当 $2Nc_1$ 为整数且 $N$ 为偶数时，$\boldsymbol\Gamma_i$ 简化为单位矩阵 $\mathbf I_N$。

在整数归一化多普勒频移情形下，信道矩阵 $\mathbf H_i$ 呈现稀疏结构，其元素可表示为

$$
\mathbf H_i(p,q)=\begin{cases}e^{j\frac{2\pi}{N}\left(Nc_1l_i^2-ql_i+Nc_2(q^2-p^2)\right)},&q=(p+\mathrm{loc}_i)_N,\\0,&\text{其他},\end{cases}\tag{8}
$$

其中 $\mathrm{loc}_i=\alpha_i+2Nc_1l_i$，$\alpha_i=Nf_i\in[-\alpha_{\max},\alpha_{\max}]$，$l_i\in[0,l_{\max}]$。参数 $\alpha_{\max}$ 与 $l_{\max}$ 分别定义为最大归一化多普勒频移与最大归一化时延。如 [4] 所示，选取 $c_1\geq\frac{2\alpha_{\max}+1}{2N}$ 可保证 $\mathbf H_{\mathrm{eff}}$ 的每一行与每一列恰好包含 $P$ 个非零元素。

对含分数多普勒频移的更一般情形，$\mathbf H_i$ 的元素可写为

$$
\mathbf H_i(p,q)=\frac{1}{N}e^{j\frac{2\pi}{N}\left(Nc_1l_i^2-ql_i+Nc_2(q^2-p^2)\right)}\times\sum_{n=0}^{N-1}e^{-j\frac{2\pi}{N}\left((p-q+v_i+2Nc_1l_i)n\right)},\tag{9}
$$

其中 $v_i=Nf_i=\alpha_i+\nu_i$ 表示归一化多普勒频移，$\alpha_i$ 与 $\nu_i\in[-0.5,0.5]$ 分别表示其整数与分数分量。

## III. 系统模型

本文提出一种 AFDM 传输框架，用户侧无需信道估计与均衡，而大部分信号处理任务由 BS 承担。整体流程包括两个阶段：上行信道获取阶段与下行预编码阶段。在上行阶段，BS 首先从用户传输中获取 CSI。考虑基于帧的 AFDM 传输结构，并假设每帧时长相对于相关信道相干时间足够短；在此假设下，等效信道矩阵 $\mathbf H_{\mathrm{eff}}$ 的稀疏图样在一帧内保持不变。令 $\mathbf X\in\mathbb C^{N\times L}$ 表示包含 $L$ 个符号的 AFDM 传输帧。该帧的构造方式是在开头放置一个导频符号，其后为 $L-1$ 个数据符号，即

$$
\mathbf X=[\mathbf x_p,\mathbf x_{d,1},\cdots,\mathbf x_{d,L-1}],\tag{10}
$$

其中 $\mathbf x_p\in\mathbb C^{N\times1}$ 表示导频信号，$\mathbf x_{d,l}\in\mathbb C^{N\times1}$ 表示第 $l$ 个数据符号。导频符号使 BS 能利用（例如）[20] 提出的估计器获得等效信道矩阵的估计，记为 $\tilde{\mathbf H}_{\mathrm{eff}}$。利用该估计 CSI，BS 随后进行均衡以恢复用户发送的上行数据。

获得 CSI 后，系统进入下行传输。利用上下行链路间的信道互易性 [21]，BS 使用估计得到的信道矩阵 $\tilde{\mathbf H}_{\mathrm{eff}}$ 设计下行发射波形。考虑到传播信道的快速时变特性，上下行 CSI 并不完全相同。该问题可通过基于深度学习（deep learning, DL）的信道预测技术 [22]、[23] 解决；本文假设 BS 已部署合适的神经网络以完全补偿上下行 CSI 差异。在设计过程中，仔细构造发射符号，使由此产生的干扰对符号检测起建设性作用。采用这种设计后，用户接收机不再需要执行传统的信道估计或均衡流程，可直接从接收信号中检测数据符号，从而显著简化接收机处理。

传统 AFDM 接收机往往涉及复杂的信号处理流程，导致相当大的计算需求，这会给硬件资源有限的用户设备带来实际挑战。通过把大部分处理任务转移到 BS，所提框架有效缓解了用户侧负担，提升了 AFDM 系统的实用性。此外，与传统 AFDM 方案 [4] 采用的嵌入式导频策略相比，所提框架在下行传输中无需频繁插入导频，从而提升频谱效率。

## IV. 下行概率 SLP 波形设计

本节研究下行阶段的概率 SLP 波形设计。先介绍概率 SLP 原理并表述相应的波形设计问题，再把所得优化问题重述为更易处理的形式求解。

### A. 问题表述

由于多径传播与多普勒频移，接收符号可能偏离其正确判决区域。通过采用概率 SLP，BS 可对发射符号进行预补偿，使接收符号以高概率落入期望判决区域。下面基于概率 SLP 技术在 AF 域设计下行发射符号。

在下行传输过程中，第 $n$ 个 AF 域子载波上接收到的符号可表示为

$$
y_n=\mathbf h_n\mathbf z+\tilde w_n,\quad n=0,\cdots,N-1,\tag{11}
$$

其中 $\mathbf h_n$ 表示信道矩阵 $\mathbf H_{\mathrm{eff}}$ 的第 $n$ 行，该矩阵在第一阶段由 BS 估计得到。向量 $\mathbf z$ 表示对原始数据符号向量 $\mathbf x$ 施加概率 SLP 后得到的设计信号，即 $\mathbf z=f(\mathbf x)$，其中 $f(\cdot)$ 表示把期望符号映射为适配信道条件的预编码信号的非线性预编码函数。预编码目标是确保每个接收符号 $y_n$ 都被正确检测为期望符号 $x_n$，其中 $x_n$ 取自 4PSK 星座集 $\mathcal X$，即

$$
x_n\in\mathcal X=\left\{\exp\left(\frac{j\pi(2i-1)}{4}\right),\ i=1,\ldots,4\right\}.\tag{12}
$$

由于存在 AWGN，接收符号 $y_n$ 服从复高斯分布，即

$$
y_n\sim\mathcal{CN}(\mathbf h_n\mathbf z,\sigma^2),\tag{13}
$$

其中实部与虚部分别独立地服从

$$
\operatorname{Re}\{y_n\}\sim\mathcal N\left(\operatorname{Re}\{\mathbf h_n\mathbf z\},\sigma^2/2\right),\tag{14}
$$

$$
\operatorname{Im}\{y_n\}\sim\mathcal N\left(\operatorname{Im}\{\mathbf h_n\mathbf z\},\sigma^2/2\right).\tag{15}
$$

基于上述概率刻画，可从统计角度分析接收符号的位置。在 4PSK 调制下，发送的信息由接收符号实部与虚部的符号决定。根据（14），接收符号实部为正的概率可表示为

$$
\begin{aligned}
\Pr\left(\operatorname{Re}\{y_n\}>0\right)&=\Pr\left(\frac{\operatorname{Re}\{y_n\}-\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma/\sqrt2}>-\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma/\sqrt2}\right)\\
&=1-\Phi\left(-\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma/\sqrt2}\right)=\Phi\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma/\sqrt2}\right)\\
&=\frac12\left[1+\operatorname{erf}\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right],
\end{aligned}\tag{16}
$$

其中 $\Phi(\cdot)$ 表示标准正态分布的累积分布函数（CDF），$\operatorname{erf}(\cdot)$ 表示高斯误差函数。类似地，有

$$
\Pr\left(\operatorname{Re}\{y_n\}<0\right)=\frac12\left[1-\operatorname{erf}\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right],\tag{17}
$$

$$
\Pr\left(\operatorname{Im}\{y_n\}>0\right)=\frac12\left[1+\operatorname{erf}\left(\frac{\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right],\tag{18}
$$

$$
\Pr\left(\operatorname{Im}\{y_n\}<0\right)=\frac12\left[1-\operatorname{erf}\left(\frac{\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right].\tag{19}
$$

由于实部与虚部相互独立，接收符号 $y_n$ 位于第一象限的概率可表示为

$$
\begin{aligned}
\Pr\left(\operatorname{Re}\{y_n\}>0,\ \operatorname{Im}\{y_n\}>0\right)&=\Pr\left(\operatorname{Re}\{y_n\}>0\right)\Pr\left(\operatorname{Im}\{y_n\}>0\right)\\
&=\frac14\left[1+\operatorname{erf}\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right]\left[1+\operatorname{erf}\left(\frac{\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right].
\end{aligned}\tag{20}
$$

其他象限同理。于是，接收符号被正确检测的概率（记为 $\Xi(\mathbf h_n\mathbf z)$）可概括为

$$
\Xi(\mathbf h_n\mathbf z)=\frac14\left[1+\sqrt2\operatorname{Re}\{x_n\}\operatorname{erf}\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right]\left[1+\sqrt2\operatorname{Im}\{x_n\}\operatorname{erf}\left(\frac{\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right],\quad x_n\in\left\{\frac{\pm1\pm j}{\sqrt2}\right\}.\tag{21}
$$

接下来关注符号检测错误的概率。例如，当期望符号 $x_n$ 位于第一象限时，相应错误概率可表示为

$$
\begin{aligned}
P_e\left(\operatorname{Re}\{y_n\}>0,\ \operatorname{Im}\{y_n\}>0\right)&=1-\Pr\left(\operatorname{Re}\{y_n\}>0,\ \operatorname{Im}\{y_n\}>0\right)\\
&=1-\frac14\left[1+\operatorname{erf}\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right]\left[1+\operatorname{erf}\left(\frac{\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right].
\end{aligned}\tag{22}
$$

因此，对期望的发射符号向量 $\mathbf s$，误比特率（bit error rate, BER）的最小化可表述为如下优化问题：

$$
\min_{\mathbf z}\ \max_n\ \left\{1-\Xi(\mathbf h_n\mathbf z)\right\}\quad\text{s.t.}\ \|\mathbf z\|_2^2\leq P_m,\tag{23}
$$

其中 $P_m$ 表示发射功率预算。

### B. 问题变换与求解

值得注意的是，（23）中的原问题可重述为

$$
\max_{\mathbf z}\ \min_n\ T(\mathbf h_n\mathbf z)\quad\text{s.t.}\ \|\mathbf z\|_2^2\leq P_m,\qquad
T(\mathbf h_n\mathbf z)=\left[1+\sqrt2\operatorname{Re}\{x_n\}\operatorname{erf}\left(\frac{\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right]\left[1+\sqrt2\operatorname{Im}\{x_n\}\operatorname{erf}\left(\frac{\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right],\tag{24}
$$

其中 $T(\mathbf h_n\mathbf z)$ 刻画与第 $n$ 个符号关联的正确检测概率。

为便于后续优化，对 $T(\mathbf h_n\mathbf z)$ 取对数，（24）中的问题可等价变换为

$$
\max_{\mathbf z}\ \min_n\ S(\mathbf h_n\mathbf z)\quad\text{s.t.}\ \|\mathbf z\|_2^2\leq P_m,\qquad
S(\mathbf h_n\mathbf z)=\log\left[1+\operatorname{erf}\left(\frac{\operatorname{Re}\{x_n\}\operatorname{Re}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right]+\log\left[1+\operatorname{erf}\left(\frac{\operatorname{Im}\{x_n\}\operatorname{Im}\{\mathbf h_n\mathbf z\}}{\sigma}\right)\right],\tag{25}
$$

其中 $S(\mathbf h_n\mathbf z)=\log T(\mathbf h_n\mathbf z)$。利用 $\log(1+x)$ 与 $\operatorname{erf}(x)$ 的单调性，可把目标函数近似为聚焦于这些函数的自变量，从而得到如下简化问题：

$$
\max_{\mathbf z}\ \min_n\ \left\{\operatorname{Re}\{x_n\}\operatorname{Re}\{\mathbf h_n\mathbf z\},\ \operatorname{Im}\{x_n\}\operatorname{Im}\{\mathbf h_n\mathbf z\}\right\}\quad\text{s.t.}\ \|\mathbf z\|_2^2\leq P_m.\tag{26}
$$

通过引入辅助变量 $t$，（26）中的问题可进一步变换为

$$
\max_{\mathbf z,t}\ t\quad\text{s.t.}\ \operatorname{Re}\{x_n\}\operatorname{Re}\{\mathbf h_n\mathbf z\}\geq t,\ \operatorname{Im}\{x_n\}\operatorname{Im}\{\mathbf h_n\mathbf z\}\geq t,\ \|\mathbf z\|_2^2\leq P_m.\tag{27}
$$

（27）是 SOCP，可用 CVX [24]、[25] 等现成凸优化求解器高效求解。如 [26] 所述，用内点法求解（27）中 SOCP 的计算复杂度约为 $\mathcal O(N_{it}N^{3.5})$，其中 $N_{it}$ 表示迭代次数；通过求解其对偶问题，复杂度可降至 $\mathcal O(N_{it}N^2)$ [15]。

## V. 数值结果

本节通过蒙特卡洛仿真评估所提概率 SLP 波形设计方法在下行阶段的有效性。仿真参数汇总于表 I。各路径的多普勒频移在 $[-\alpha_{\max},\alpha_{\max}]$ 范围内随机生成。AF 域信道估计使用 Zadoff–Chu（ZC）序列作为导频，并用 [20] 提出的算法估计信道。

首先在完美 CSI 假设下评估所提概率 SLP 波形设计的性能。图 1 给出用户侧相应的接收符号星座，其中信噪比（signal to noise ratio, SNR）设为 20 dB。借助完美 CSI，所提波形方案预先调整发射符号以抵消信道引起的畸变，从而提高接收符号落入正确判决区域的概率。可以看到，接收符号很好地聚集在 4PSK 星座对应的四个象限内。该结果表明，所提波形设计有效缓解了信道影响，使用户侧能够以极少的处理、且无需显式信道估计与均衡即可可靠地检测符号。

进一步地，图 2 给出不同方案在完美 CSI 与估计 CSI 两种情形下的下行 BER 性能。可以看到，所提概率 SLP 方案在整个 SNR 范围内达到与传统方案相当的性能，并在高 SNR 区制呈现轻微性能增益。该改进可归因于所提方案利用非线性优化，因而相比传统线性均衡方法带来额外提升。比较完美 CSI 与估计 CSI 情形可见，两种方案由不完美 CSI 引起的性能退化都相对较小。值得注意的是，使用由 [20] 中高精度信道估计器得到的估计 CSI 时，所提概率 SLP 方案仍保持其性能优势，说明该方案对信道估计误差具有鲁棒性，也说明所采用估计器有效。这表明所提框架在无法获得完美 CSI 的实际场景中仍然有效。总体而言，结果证实所提概率 SLP 波形设计能在显著降低接收端复杂度的同时取得可靠性能，使其成为实际 AFDM 系统的有前景方案。

最后，把所提概率 SLP 方案进一步推广到 OFDM 与正交时频空间（orthogonal time frequency space, OTFS）框架以验证其可扩展性，如图 3 所示。结果表明，基于 AFDM 与基于 OTFS 的实现性能几乎不可区分，且都持续优于基于 OFDM 的方案。该性能增益可归因于 AFDM 与 OTFS 能有效利用双选择性信道中的固有分集。总体而言，这些观察证实所提方法在不同波形架构间保持了很强的适应性。

## VI. 结论

本文提出一种面向 AFDM 系统的概率 SLP 波形设计，以缓解接收端计算负担。通过利用上行 CSI，BS 设计发射符号以最小化错误检测概率，使接收端无需信道估计或均衡即可直接进行符号检测。仿真结果表明，所提方案在完美与估计 CSI 两种情形下都达到与传统方法相当的 BER 性能，同时显著降低接收端复杂度。这些结果证明了所提框架对 AFDM 系统的有效性与实用性。

## 致谢

本工作受中国国家自然科学基金（NSFC）资助（Grant 62301032 与 62471039）。Shuangyang Li 的工作部分受欧洲研究理事会（European Research Council, ERC）ERC Starting Grant No. 101220383（Foundations of Delay Doppler Communications and Sensing, FUNDOCS）资助。

## 图注与表注

### 表 I：仿真参数（原 PDF 第 5 页）

| 参数 | 取值 |
|---|---|
| 子载波数 | $N=64$ |
| 载波频率 | $f_c=4$ GHz |
| 子载波带宽 | $\Delta f=15$ kHz |
| 总路径数 | $P=3$ |
| 最大归一化多普勒 | $\alpha_{\max}=1$ |
| 最大归一化时延 | $l_{\max}=2$ |
| 信道系数 | $h_i\sim\mathcal{CN}(0,1/P)$ |

### 图注

**图 1（原 PDF 第 5 页）：** 概率 SLP 设计下接收符号的星座图（横轴 In-phase，纵轴 Quadrature）。

**图 2（原 PDF 第 5 页）：** 完美 CSI 与估计 CSI 下不同方案的下行 BER 性能对比（横轴 SNR (dB)，纵轴 BER；对比 Conventional scheme、Proposed scheme 在 perfect CSI 与 estimated CSI 下的曲线）。

**图 3（原 PDF 第 6 页）：** 不同调制方案间的 BER 性能对比（Probabilistic SLP, AFDM / OTFS / OFDM）。

## 参考文献（英文原书目）

以下按原 PDF 第 6 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] W. Saad, M. Bennis, and M. Chen, "A vision of 6G wireless systems: Applications, trends, technologies, and open research problems," IEEE Net., vol. 34, no. 3, pp. 134–142, 2020.

[2] e. a. Kodheli, "Satellite communications in the new space era: A survey and future challenges," IEEE Commun. Surveys Tuts., vol. 23, no. 1, pp. 70–109, 2021.

[3] T. Zhou, Y. Yang, L. Liu, C. Tao, and Y. Liang, "A dynamic 3-d wideband gbsm for cooperative massive mimo channels in intelligent high-speed railway communication systems," IEEE Trans. Wireless Commun., vol. 20, no. 4, pp. 2237–2250, 2021.

[4] A. Bemani, N. Ksairi, and M. Kountouris, "Affine frequency division multiplexing for next generation wireless communications," IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 8214–8229, 2023.

[5] H. S. Rou, V. Savaux, Z. Sui, G. T. F. de Abreu, and Z. Liu, "Afdm: Evolving ofdm towards 6g+," 2026. [Online]. Available: https://arxiv.org/abs/2602.08163

[6] Z. Sui, Z. Liu, L. Musavian, Y. L. Guan, L.-L. Yang, and L. Hanzo, "Mimo-afdm outperforms mimo-ofdm in the face of hardware impairments," 2026. [Online]. Available: https://arxiv.org/abs/2601.00502

[7] Q. Luo, J. Zhu, Z. Liu, Y. Tang, P. Xiao, G. Chen, and J. Shi, "Joint sparse graph for enhanced MIMO-AFDM receiver design," IEEE Trans. Wireless Commun., pp. 1–1, 2025.

[8] Y. Zhang, Q. Yi, L. Musavian, T. Xu, and Z. Liu, "Non-orthogonal afdm: A promising spectrum-efficient waveform for 6g high-mobility communications," 2025. [Online]. Available: https://arxiv.org/abs/2507.17292

[9] G. Liu, T. Mao, Z. Xiao, M. Wen, R. Liu, J. Zhao, E. Basar, Z. Wang, and S. Chen, "Pre-chirp-domain index modulation for full-diversity affine frequency division multiplexing toward 6g," IEEE Trans. Wireless Commun., vol. 24, no. 9, pp. 7331–7345, 2025.

[10] G. Liu, T. Mao, Y. Tang, J. Zhao, Z. Xiao, and Z. Han, "Multiple-mode affine frequency division multiplexing with index modulation," IEEE Wireless Commun. Lett., vol. 15, pp. 141–145, 2026.

[11] Z. Sui, Q. Luo, Z. Liu, M. Temiz, L. Musavian, C. Masouros, Y. L. Guan, P. Xiao, and L. Hanzo, "Multi-functional chirp signalling for next-generation multi-carrier wireless networks: Communications, sensing and ISAC perspectives," arXiv preprint arXiv:2508.06022, 2025.

[12] F. Zhang, Z. Wang, T. Mao, T. Jiao, Y. Zhuo, M. Wen, W. Xiang, S. Chen, and G. K. Karagiannidis, "Afdm-enabled integrated sensing and communication: Theoretical framework and pilot design," IEEE J. Sel. Areas Commun., vol. 44, pp. 310–324, 2026.

[13] H. Yin, Y. Tang, A. Bemani, M. Kountouris, Y. Zhou, X. Zhang, Y. Liu, G. Chen, K. Yang, F. Liu, C. Masouros, S. Li, G. Caire, and P. Xiao, "Affine frequency division multiplexing: Extending OFDM for scenario-flexibility and resilience," 2025. [Online]. Available: https://arxiv.org/abs/2502.04735

[14] H. Lu and Y. Zeng, "Delay-doppler alignment modulation for spatially sparse massive mimo communication," IEEE Trans. Wireless Commun., vol. 23, no. 6, pp. 6000–6014, 2024.

[15] A. Li and C. Masouros, "Interference exploitation precoding made practical: Optimal closed-form solutions for psk modulations," IEEE Trans. Wireless Commun., vol. 17, no. 11, pp. 7661–7676, 2018.

[16] M. Alodeh, S. Chatzinotas, and B. Ottersten, "Symbol-level multiuser miso precoding for multi-level adaptive modulation," IEEE Trans. Wireless Commun., vol. 16, no. 8, pp. 5511–5524, 2017.

[17] Y. Wang, H. Hou, W. Wang, and X. Yi, "Symbol-level precoding for average ser minimization in multiuser miso systems," IEEE Wireless Commun. Lett., vol. 13, no. 4, pp. 1103–1107, 2024.

[18] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, "Interference cancellation and iterative detection for orthogonal time frequency space modulation," IEEE Trans. Wireless Commun., vol. 17, no. 10, pp. 6501–6515, 2018.

[19] Y. Liu, M. Chen, C. Pan, T. Gong, J. Yuan, and J. Wang, "Otfs versus ofdm: Which is superior in multiuser leo satellite communications," IEEE J. Sel. Areas Commun., vol. 43, no. 1, pp. 139–155, 2025.

[20] S. Tang, D. Zhou, P. Liu, E. Chen, X. Wang, J. Guo, and Z. Fei, "Sparse bayesian learning based AFDM channel estimation exploiting hierarchical laplace priors," in 2025 IEEE/CIC International Conference on Communications in China (ICCC Workshops), 2025, pp. 1–6.

[21] J. Ran and L. LiICCTA, "An adaptive method utilizing channel reciprocity in tdd-lte system," in IET International Conference on Communication Technology and Application (ICCTA 2011), 2011, pp. 896–900.

[22] G. Liu, Z. Hu, L. Wang, J. Xue, H. Yin, and D. Gesbert, "Spatio-temporal neural network for channel prediction in massive mimo-ofdm systems," IEEE Trans. Commun., vol. 70, no. 12, pp. 8003–8016, 2022.

[23] C. Wu, X. Yi, Y. Zhu, W. Wang, L. You, and X. Gao, "Channel prediction in high-mobility massive MIMO: From spatio-temporal autoregression to deep learning," IEEE J. Sel. Areas Commun., vol. 39, no. 7, pp. 1915–1930, 2021.

[24] I. CVX Research, "CVX: Matlab software for disciplined convex programming, version 2.0," https://cvxr.com/cvx, Aug. 2012.

[25] M. Grant and S. Boyd, "Graph implementations for nonsmooth convex programs," in Recent Advances in Learning and Control, ser. Lecture Notes in Control and Information Sciences, V. Blondel, S. Boyd, and H. Kimura, Eds. Springer-Verlag Limited, 2008, pp. 95–110, http://stanford.edu/~boyd/graph_dcp.html.

[26] A. Ben-Tal and A. Nemirovski, Lectures on modern convex optimization: analysis, algorithms, and engineering applications. SIAM, 2001.

**本页范围与校对状态：** 本页依据 arXiv:2609.09644v1（eess.SP，2026-09-09，6 页）完成全文中文翻译：摘要、索引词、第 I—VI 节、结论、致谢、图 1—3 中文图注、表 I 逐格转录、参考文献 [1]—[26] 英文原条目（按原编号）。公式编号 (1)—(27) 按原文保留；表 I 已用 PDF 第 5 页渲染图逐格核对；式 (7)、(21)、(23)—(27) 也已对照第 2、4 页渲染图核对。**逐句逐式终校未做**；图内曲线未作数字化读取，只转录图注与正文给出的关键信息（如 SNR=20 dB、性能趋势与图例）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：式 (7) 左侧写作 $\boldsymbol\Gamma_i(i,i)$，但右侧分情况条件使用下标 $n$（$n<l_i$ 与 $n\geq l_i$），按上下文应为 $\boldsymbol\Gamma_i(n,n)$ 或按 $i$ 与 $n$ 混用；本页照原文印刷形式转录并加注，未静默改动。原文为短文，无附录与作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
