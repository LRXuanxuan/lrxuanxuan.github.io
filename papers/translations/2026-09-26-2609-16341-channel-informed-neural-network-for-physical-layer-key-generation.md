---
layout: page
title: "信道感知神经网络的物理层密钥生成｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-16341-channel-informed-neural-network-for-physical-layer-key-generation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/20630c11ee8f0cdb/) · [原文 arXiv](https://arxiv.org/abs/2609.16341) · [全部目录](/papers/catalog/)

# 信道感知神经网络的物理层密钥生成

**原题：** Channel-Informed Neural Network for Physical Layer Key Generation  
**作者：** Jose Angel Sanchez Viloria、George Sklivanitis、Dimitris Pados、Elizabeth Serena Bentley  
**版本：** arXiv:2609.16341v1（cs.LG），2026-09-14，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节（含 III-A/B/C、V-A/B 全部小节）、结论与展望、表 I 逐格、图 1–4 图注、分配声明与基金说明、参考文献 [1]–[33]（英文原条目）按原文结构录入；原文无附录、无致谢段。逐句逐式终校未做。

## 摘要

物理层密钥生成（physical-layer key generation，PKG）使无线设备能够从互易信道观测中建立共享密钥，而无需直接交换密钥。这一能力对边缘网络颇具吸引力：分布式、资源受限的设备可能需要在有限接入集中式基础设施的情况下进行轻量级密钥建立。我们提出一种用于 PKG 的**信道感知神经网络**，它直接从接收到的 IQ 测量中导出二值密钥特征，同时把所学表示显式地锚定在底层多径信道上。所提出的多任务循环神经网络以结合深度度量学习与信道感知监督的训练目标，联合学习保互易性的二值特征与辅助信道估计。结构化信道探测使从空口测量中进行信道估计成为可能，而 Sionna-RT 射线追踪被用于以额外传播条件扩充训练。我们使用在 POWDER 无线电测试平台上采集的室内与室外软件定义无线电测量对该框架进行评估。在所有评估场景中，所提模型对互易的 Alice–Bob 观测产生比 Eve 相关观测更低的比特不一致率。射线追踪数据扩充显著改善密钥多样性，使唯一密钥率在室内与两个室外场景中分别达到 0.94、0.99 与 0.99。经成功协商的信道感知密钥在 SHA-3 隐私放大之前通过所选 NIST 随机性检验。结果表明，信道感知表示学习在去中心化无线密钥建立方面具有潜力，同时揭示密钥多样性与协商可靠性之间的重要折中。

**索引词：** 物理层密钥生成、物理层安全、软件定义无线电、射线追踪、数字孪生。

## I. 引言

安全的密钥建立是边缘通信的基础需求：自主平台、分布式传感器与资源受限无线设备可能在对抗性或不可信网络中运行，仅间歇性接入集中式基础设施。尽管常见加密机制依赖共享密钥的安全建立与及时更新，密钥分发基础设施或可信密钥管理实体可能在拒止、断开、间歇或带宽受限环境中带来计算、通信与运行开销。这些约束促使人们寻求补充方法：直接在无线边缘设备之间实现去中心化、轻量级密钥建立，同时降低对持续连接集中式服务的依赖 [1]。

物理层密钥生成（PKG）正是这样一种补充机制，它利用无线传播信道的互易性、时变性与空间去相关特性 [2]。两个可信网络用户（传统上记为 Alice 与 Bob）在信道相干时间内交换信道探测信号，并独立导出相关的信道观测。这些观测被变换为初步二值序列，残余不一致通过信息协商纠正，再经隐私放大生成共享密钥 [3]–[8]。由于密钥源于本地观测到的信道特征而非在网络中直接交换，PKG 对需要轻量、可快速更新密钥材料的边缘设备尤为吸引人。

已有 PKG 方法通常直接从信道状态信息（channel state information，CSI）、接收信号强度（received-signal strength，RSS）、信道频率响应或相关传播测量中导出共享随机性 [9]–[11]。近期工作越来越关注在非理想运行条件下提升 PKG 的可靠性与可部署性，包括自适应探测 [12]、插值与去相关变换 [13]、失配感知密钥生成 [14]。已有基于深度学习的方法被提出，用于在频分双工（frequency-division duplex，FDD）系统中构造互易特征，并在先前未见传播环境中自适应迁移所学映射 [15]–[17]。在资源受限无线电上的实验研究也表明，实际硬件限制与时变信道条件会显著破坏 CSI 互易性，这促使基于信号处理的重构技术 [18]。其他近期研究通过成对或环回探测机制处理 FDD 密钥生成与硬件损伤 [19]、[20]；新兴研究还考察了对恶意可重构智能表面 [21] 的对抗学习防御、神经增强协商 [22]，以及面向车联网的大语言模型辅助探测 [23]。总体而言，这些工作展示了数据驱动方法在实践信道条件下改进密钥协商的价值。然而，现有文献大多要么作用于预计算的信道描述子，要么只优化 PKG 流水线中的单个阶段；相较之下，**直接作用于原始 IQ 观测、且在训练中被显式约束以保留底层多径信道结构的神经特征提取器**所受到的关注较少。

本文提出一种用于 PKG 的**信道感知学习框架**，强化所学安全特征与底层无线传播环境之间的联系。在我们此前 AI 辅助 PKG 工作 [24] 的基础上，所提方法超越纯数据驱动的特征提取：它把结构化信道探测、辅助信道估计监督与射线追踪传播数据结合起来。具体而言，所提物理层密钥生成设计鼓励神经网络在保留信道相关结构的同时学习二值特征，使这些特征对互易的 Alice–Bob 观测比对 Eve 相关观测更一致。所得框架支持从原始 IQ 测量进行去中心化密钥建立，并作为端到端流水线（特征提取、信息协商、隐私放大与动态数据加密）进行评估。

本文主要贡献如下：

- 我们提出一种多任务神经网络框架，联合学习保互易性的二值特征与多径信道的辅助表示。与仅作用于预计算信道描述子或只优化嵌入相似度的方法不同，所提方法把所学密钥特征显式锚定在可测量的传播结构中。
- 我们把空口信道测量与射线追踪无线场景结合，以扩充训练中表示的传播条件。在所有评估的室内与室外测试设置中，该扩充都提高了唯一密钥率，相对基线 [24] 显著改善密钥多样性。
- 我们使用合成数据、室内与室外软件定义无线电（software-defined radio，SDR）测量评估所提框架。结果表明信道感知训练能持续把互易的合法信道观测与窃听者观测分开，同时揭示出密钥多样性提升与协商成功率之间的实际折中。该折中为在边缘运行的鲁棒 PKG 系统指明了一个重要设计维度。

## II. 系统模型

我们的目标是在两个可信网络节点 Alice 与 Bob 之间，从互易无线信道观测中独立生成共享密钥。Alice 与 Bob 以时分双工（time-division duplex，TDD）方式、在信道相干时间内交换已知信道探测信号，因此其前向与反向信道观测预期高度相关，但因噪声、硬件损伤与同步偏差而不完全相同 [1]、[2]。一个被动窃听者 Eve 知道密钥生成协议并监听 Alice 与 Bob 之间交换的探测信号，但不主动改变信道。

我们考虑使用基于 Galois 线性反馈移位寄存器（Galois linear feedback shift register，GLFSR）的 BPSK 调制码序列进行信道探测：

$$
s[n]=1-2b[n]\in\{+1,-1\},\qquad n=0,\ldots,N_p-1, \tag{1}
$$

其中 $b[n]$ 为 GLFSR 生成的比特序列。在载频下变频并以采样周期 $T_s$ 的整数倍采样后，Alice、Bob 或 Eve 处的接收基带信号可写为

$$
x[n]=\sum_{p=1}^{P}h_ps\left(nT_s-\tau_p\right)+w[n],\qquad n=0,\ldots,N_p+P-1, \tag{2}
$$

其中 $p=1,\ldots,P$ 为信道路径数，$h_p$ 与 $\tau_p$ 分别表示第 $p$ 条路径的衰减与时延，$s[n]$（$n=0,1,\ldots,N_p-1$）为发射 GLFSR 码序列的第 $n$ 个符号，$w[n]\sim\mathcal{CN}(0,\sigma^2)$ 为方差 $\sigma^2$ 的复加性高斯噪声。

由于信道探测序列 $s[n]$（$n=0,1,\ldots,N_p-1$）在接收端已知，最小二乘（least squares，LS）信道估计为

$$
\hat{\mathbf h}_{\mathrm{LS}}=\arg\min_{\mathbf h}\left\|\mathbf x-\mathbf S\mathbf h\right\|_2^2, \tag{3}
$$

其中 $\mathbf x\in\mathbb C^{N_p+P-1}$ 为接收探测信号样本，$\mathbf h\in\mathbb C^P$ 为信道冲激响应向量，$\mathbf S\in\mathbb C^{(N_p+P-1)\times P}$ 为由已知信道探测序列构成的 Toeplitz 卷积矩阵。

我们还考虑用于模拟无线电波传播的射线追踪器。具体地，我们依赖 Sionna-RT [25] 计算射线追踪传播路径的信道冲激响应。给定如下连续时延信道冲激响应

$$
h_{\mathrm{RT}}(\tau)=\sum_{p=1}^{P}a_p\delta\left(\tau-\tau_p\right), \tag{4}
$$

其中 $a_p$、$\tau_p$ 分别为第 $p$ 条信道路径的复信道系数与时延，$\tau$ 为连续时延，$\delta(\cdot)$ 为 Dirac delta 函数 [25]、[26]，则在采样实例 $n$ 上第 $l$ 个信道抽头计算为

$$
h_{n,\ell}^{\mathrm{RT}}=\sum_{p=1}^{P}a_p\left(\frac{n}{B}\right)\mathrm{sinc}\left(\ell-B\tau_p\right),\qquad \ell=l_{\min},\ldots,l_{\max}, \tag{5}
$$

其中 $l_{\min}$、$l_{\max}$ 分别为离散复基带等效信道的最小与最大时滞，$B$ 为信道冲激响应所受限的带宽 [25]、[27]。

我们预期：射线追踪计算的与空口估计的 Alice–Bob 与 Bob–Alice 之间的信道冲激响应都近似互易，而当 Eve 与 Alice、Bob 在空间上分离时，Eve 观测到的信道与 Alice–Bob/Bob–Alice 信道相关性较低 [2]。第 III 节说明如何把信道冲激响应信息（由射线追踪或信道估计获得）用于锚定直接作用于接收 IQ 频谱图的神经网络二值特征提取器的训练。

## III. 信道感知学习 PKG 框架

本节详细描述所提信道感知学习 PKG 框架的架构。目标是从 IQ 频谱图直接生成保互易性的二值密钥，且这些密钥锚定于一对可信网络节点之间无线信道的物理特性。图 1 给出该框架数据收集、模型训练与测试的端到端流程。

### A. 信号预处理

对每个接收信道探测，复基带 IQ 样本先被归一化，再转换为时频表示。令 $\mathbf x=[x[0],x[1],\ldots,x[N_p+P-1]]^\top\in\mathbb C^{N_p+P-1}$ 表示与一次信道探测相关的接收 IQ 样本向量，其中 $N_p$ 为用于特征提取的样本数（在此特殊情形下等于 GLFSR 码序列的符号数，因为每符号取 1 个样本）。为降低不同链路与不同探测轮之间接收功率变化的影响，我们施加均方根（root-mean-square，RMS）归一化：

$$
\tilde x[n]=\frac{x[n]}{\sqrt{\frac{1}{N_p}\sum_{n=0}^{N_p-1}\left|x[n]\right|^2+\epsilon}},\qquad n=0,\ldots,N_p+P-1, \tag{6}
$$

其中 $\epsilon>0$ 为用于数值稳定的小常数。归一化后的 IQ 样本序列用长度为 $N_F$ 的 Hanning 窗、跳长 $R$ 个样本划分为 $M$ 个重叠段，得到 $M=1+\left((N_p+P-N_F)/R\right)$ 段。信号的第 $m$ 段为

$$
\tilde x_m[n]=\tilde x[n+mR],\qquad n=0,\ldots,N_F-1, \tag{7}
$$

其中 $m=0,\ldots,M-1$。我们定义 $N_F$ 个样本的 Hanning 窗

$$
w[n]=0.5\left(1-\cos\left(2\pi n/(N_F-1)\right)\right),\qquad n=0,1,\ldots,N_F-1, \tag{8}
$$

并对 $M$ 段信号逐段加窗以抑制频谱泄漏。随后对每段加窗信号施加离散 Fourier 变换：

$$
X_{m,k}=\sum_{n=0}^{N_F-1}\tilde x_m[n]w[n]e^{-j2\pi nk/N_F},\qquad k=0,\ldots,N_F-1, \tag{9}
$$

其中 $X_{m,k}$ 为短时 Fourier 变换（short-time Fourier transform，STFT）复矩阵 $\mathbf X\in\mathbb C^{M\times N_F}$ 的 $(m,k)$ 元素。所得 STFT 矩阵 $\mathbf X\in\mathbb C^{M\times N_F}$ 表示接收探测的时频结构。由于所提基于神经网络的特性提取器作用于实值输入，复 STFT 系数被分离为实部与虚部：

$$
\mathbf S=\left[\Re\{\mathbf X\},\ \Im\{\mathbf X\}\right]\in\mathbb R^{M\times N_F\times2}. \tag{10}
$$

### B. 神经网络架构

图 2 给出所提信道感知二值特征提取器的神经网络架构。我们使用多任务循环神经网络（recurrent neural network，RNN）联合学习保互易性的密钥特征与信道估计结构。输入频谱图 $\mathbf S$ 被解释为 $M$ 个时频切片的序列，每个时间步包含 $N_F$ 个特征；本文取 $N_F=32$、$M=16$。经重塑与归一化后，该序列由每方向 384 个隐藏单元的双向门控循环单元（gated recurrent unit，GRU）层处理 [28]、[29]，使编码器能从接收探测响应的前向与后向两个方向聚合时间上下文。

GRU 输出经四个稠密归一化块精化，然后聚合成固定长度的潜表示。具体地，稠密块把序列特征投影为紧凑嵌入，随后经全局平均池化与稠密投影得到 $\mathbf z\in\mathbb R^W$，其中 $W$ 为输出嵌入维数，表示加密密钥的期望长度。最终嵌入经 L2 归一化层，归一化潜向量 $\tilde{\mathbf z}$ 由两个任务特定头共享。第一个头产生用于密钥生成的二值特征向量，它施加均值中心化符号量化：

$$
\mathbf y=\mathrm{sign}\left(\tilde{\mathbf z}-\frac{1}{W}\sum_{w=1}^{W}\tilde z_w\right),\qquad \mathbf y\in\{-1,+1\}^W, \tag{11}
$$

其中 $W=128$ 为本文所选密钥长度。反向传播中我们采用直通估计器（straight-through estimator，STE）近似不可微 $\mathrm{sign}$ 操作的梯度，从而实现二值特征头的端到端训练。第二个头在量化前从同一连续归一化嵌入执行辅助信道估计：它施加规模为 $2P$ 的线性稠密层，随后重塑为 $\hat{\mathbf H}\in\mathbb R^{P\times2}$，其中当前实现取 $P=16$（即 16 条传播路径）；最后一维存储估计复信道抽头的实部与虚部：

$$
\hat{\mathbf H}=\mathrm{Reshape}_{P\times2}\left(\mathbf W_{\mathrm{ch}}\tilde{\mathbf z}+\mathbf b_{\mathrm{ch}}\right). \tag{12}
$$

训练期间，二值特征头用度量学习目标优化，而信道估计头用信道损失优化（详见第 III-C 节）；密钥生成时只需二值特征头。

### C. 信道感知深度度量学习

所提特征提取器被训练以满足两个互补目标。第一，它学习适合 PKG 的嵌入空间：来自 Alice–Bob 与 Bob–Alice 的互易信道观测映射得彼此接近，而涉及 Eve 的观测映射得更远。第二，所学表示应与底层多径信道响应保持一致，该响应可由已知的基于 GLFSR 的信道探测或射线追踪器计算。第二个目标引入信道感知约束，其作用类似物理信息正则化：网络不仅由嵌入距离训练，还由来自探测信号模型或射线追踪器的信道冲激响应目标引导。

数据损失基于四元组度量学习目标 [30]。设一个训练四元组记为

$$
\mathcal Q_c=\left(\mathbf S_{i,c},\mathbf S_{j,c},\mathbf S_{k,c},\mathbf S_{l,c}\right),
$$

其中 $\mathbf S_{i,c}$、$\mathbf S_{j,c}$、$\mathbf S_{k,c}$、$\mathbf S_{l,c}$ 分别对应第 $c$ 次双向信道探测轮的 Alice–Bob、Bob–Alice、Alice–Eve 与 Bob–Eve 频谱图。共享神经网络把每个频谱图映射为连续特征向量 $\mathbf y_{r,c}=f_\theta(\mathbf S_{r,c})\in\mathbb R^W$（$r\in\{i,j,k,l\}$），其中 $W$ 为嵌入维数。第二个信道估计头把同一所学表示映射为估计复信道抽头向量 $\hat{\mathbf h}_{r,c}=g_\theta(\mathbf S_{r,c})\in\mathbb C^P$，其中 $P$ 为信道抽头数。相应参考信道向量 $\mathbf h_{r,c}$ 由基于 GLFSR 信道探测获得的 LS 信道估计或 Sionna-RT 射线追踪器给出。

因此所提训练目标把数据驱动度量学习损失与信道感知损失结合：

$$
\mathcal L_{\mathrm{Total}}=\mathcal L_{\mathrm{Data}}+\lambda_{\mathrm{ch}}\mathcal L_{\mathrm{Channel}}, \tag{13}
$$

其中 $\lambda_{\mathrm{ch}}\ge0$ 控制信道约束的贡献。更具体地，度量学习损失使用二值特征向量之间的平方欧氏距离 $d(\mathbf y_a,\mathbf y_b)=\|\mathbf y_a-\mathbf y_b\|_2^2/W$，并定义为

$$
\begin{aligned}
\mathcal L_{\mathrm{Data}}=\frac{1}{C}\sum_{c=1}^{C}\Big\{&\max\left(d\left(\mathbf y_{i,c},\mathbf y_{j,c}\right)-d\left(\mathbf y_{i,c},\mathbf y_{k,c}\right)+\alpha,0\right)\\
&+\max\left(d\left(\mathbf y_{i,c},\mathbf y_{j,c}\right)-d\left(\mathbf y_{j,c},\mathbf y_{l,c}\right)+\beta,0\right)\\
&+\max\left(d\left(\mathbf y_{i,c},\mathbf y_{j,c}\right)-d\left(\mathbf y_{k,c},\mathbf y_{l,c}\right)+\gamma,0\right)\Big\},
\end{aligned}\tag{14}
$$

其中 $C$ 为训练四元组数，$\alpha$、$\beta$、$\gamma$ 为非负间隔参数；前两项使互易的 Alice–Bob 与 Bob–Alice 嵌入比相应的 Alice–Eve 与 Bob–Eve 嵌入更接近，第三项进一步把合法互易对与窃听者对分开。

信道感知损失惩罚由信道头产生的估计信道抽头与每次接收探测对应参考信道抽头之间的不一致。本文对每个训练四元组的四条链路（即 Alice–Bob、Bob–Alice、Alice–Eve、Bob–Eve）使用归一化均方误差（normalized mean-squared error，NMSE）：

$$
\mathcal L_{\mathrm{Channel}}=\frac{1}{4C}\sum_{c=1}^{C}\sum_{r\in\{i,j,k,l\}}\frac{\left\|\hat{\mathbf h}_{r,c}-\mathbf h_{r,c}\right\|_2^2}{\left\|\mathbf h_{r,c}\right\|_2^2+\epsilon}, \tag{15}
$$

其中 $\epsilon>0$ 为用于数值稳定的小常数。与只约束嵌入空间中相对距离的度量学习项不同，信道感知项显式引导网络学习保留多径信道信息的表示。

## IV. 协商与隐私放大

神经网络产生二值输出后，Alice 与 Bob 得到相关但未必相同的二值特征向量，记为 $\mathbf y_i,\mathbf y_j\in\{0,1\}^W$。如 [24] 所述，残余比特不一致通过基于 Reed–Solomon（RS）纠错的协商方案纠正 [7]：Alice 把 $\mathbf y_i$ 划分为 $K=B/Z$ 个符号并用 $\mathrm{RS}(N,K)$ 码编码，其中 $N\le2^Z-1$；她只通过公共信道传输 $N-K$ 个校验符号。Bob 用这些校验符号与自身序列 $\mathbf y_j$ 纠正符号错误并得到 $\hat{\mathbf y}_j$。当 $\hat{\mathbf y}_j=\mathbf y_i$ 时协商成功。$\mathrm{RS}(N,K)$ 译码器最多可纠正 $\lfloor(N-K)/2\rfloor$ 个未知符号错误。

由于校验符号是公开的，假设 Eve 可观测协商信息，并可能用自己的量化观测按同一 RS 码尝试协商。因此码率的选择要在为 Alice 与 Bob 提供足够纠错能力的同时限制 Eve 可获得的边信息。协商成功后，Alice 与 Bob 通过对协商后比特序列做哈希来施加隐私放大。

## V. 性能评估

### A. 实验设置

我们使用室内与室外空口（over-the-air，OTA）SDR 测量评估所提信道感知学习 PKG 框架。为扩充训练数据量，我们用 Sionna-RT 仿真 POWDER 的室外 OTA 环境，并定义虚拟 Alice/Bob/Eve 节点位置的 $10\times10$ 空间网格（见图 3）。我们随机抽取 500 个 Alice–Bob–Eve 三元组，用射线追踪器计算相应信道抽头，然后把抽头作为 GNU Radio 信道模型模块的输入参数，运行信道探测的软件在环仿真。我们考虑从 5 dB 到 30 dB 均匀抽取的 15 种 SNR 变化。由此在受控传播与噪声条件下生成含 7500 个频谱图与信道四元组的合成数据集。

室内与室外 OTA 数据集使用 PAWR 的 POWDER 平台采集 [31]。对 OTA 数据集，信道抽头通过 LS 信道估计获得。室内 OTA 实验室由 4 台 NI USRP B210 与 4 台 NI USRP X310 SDR 组成，彼此相隔约 6.4 m。我们用该室内测试床在 10 种 Alice–Bob–Eve 拓扑配置上采集 BPSK GLFSR 信道探测。每种配置中，Alice 与 Bob 以 TDD 模式交换 100 次探测，同时 Eve 被动记录所传输探测，从而为室内训练与测试生成 1000 个频谱图与信道四元组。在室外 OTA 评估中，我们使用 POWDER 的无线电设备 [32]（见图 3），具体使用位于 USTAR、EBC 与 Guest House 的 SDR，其坐标分别为 $(40.76852,-111.84045)$、$(40.76702,-111.83807)$ 与 $(40.76749,-111.83607)$。我们通过轮换三台无线电的角色，在 2 种 Alice–Bob–Eve 拓扑配置上采集信道探测数据，并与 [24] 中的结果比较。

对仿真与 OTA 实验，我们均设 GLFSR BPSK 序列长度 $N_p=256$、信道抽头数 $P=16$，载频 $f_c=3.5$ GHz，接收采样率 1 MHz。对每个接收信道探测，IQ 样本 $N_p+P=256+16=272$ 个先经 RMS 归一化，再用长度 $N_F=32$、跳长 $R=N_F\times0.5=16$ 的窗处理为频谱图，共得到 $M=1+\left((256+16-32)/16\right)=16$ 段，产生 $32\times16\times2$ 的频谱图输入。所得频谱图被组织为四元组 $\langle\mathbf S_i,\mathbf S_j,\mathbf S_k,\mathbf S_l\rangle$，分别对应 Alice–Bob、Bob–Alice、Alice–Eve 与 Bob–Eve 观测。信道感知 RNN 编码器直接用 IQ 频谱图训练，产生两个输出：可直接用作加密密钥的 $W=128$ 维二值特征向量，以及 $P=16$ 抽头的复信道估计。5.02 MiB 的 RNN 模型含 1,290,656 个参数，用联合信道感知度量学习目标优化。我们设 $\alpha,\beta,\gamma$ 分别为 0.5、0.5、0.1，信道权重 $\lambda_{\mathrm{ch}}$ 为 0.3，并用 RMSprop 优化器以 $10^{-4}$ 学习率训练网络。在 NVIDIA-H200 GPU 与 Linux 系统上 100 次运行的平均推断时间为每样本 2.56 ms 与 0.04 GFLOPs。含 8500 个四元组的室内 OTA 与仿真数据按 70% 训练、15% 验证、15% 测试划分；含 200 个四元组的全部室外 OTA 数据集仅保留用于室外测试。

### B. 实验结果

我们在一个室内与两个室外 OTA 场景上评估训练好的信道感知特征提取器：室内场景含 150 次信道探测交换，室外场景 1 与 2 分别含 95 与 92 次探测交换。我们还将结果与先前基线工作 [24] 比较：该基线使用简单的基于单音的探测与相同骨干 RNN 架构，且在上述三个（室内、室外）OTA 场景完全相同，只比较生成 $W=128$ 密钥时的结果。对每个场景，我们计算任意两个二值特征向量之间的比特不一致率（bit disagreement ratio，BDR）：

$$
\mathrm{BDR}_{i,j,c}=\frac{1}{W}\sum_{w=1}^{W}y_{i,c,w}\oplus y_{j,c,w}, \tag{16}
$$

即对生成的 Alice–Bob、Alice–Eve 与 Bob–Eve 观测分别计算。

图 4 给出三个 OTA 测试场景与三种 PKG 学习模型下的 BDR 分布，即：1）[24] 中的 RNN；2）在室内 OTA 数据上训练的信道感知（channel-informed，CI）RNN；3）在室内 OTA 数据与 Sionna-RT 扩充数据上共同训练的 CI-RNN。结果表明，在所有场景中，互易合法信道的 Alice–Bob BDR 都产生比窃听信道更相似的二值向量。

对生成的密钥，我们用唯一密钥率以及各模型与 OTA 场景生成二值特征向量间的汉明距离评估密钥多样性，唯一密钥率定义为唯一密钥数除以生成密钥总数。尽管 [24] 中的 RNN 模型给出最低的 Alice–Bob BDR，它同时也给出最低的唯一密钥率：0.21、0.29 与 0.33。仅在室内 OTA 数据上训练的 CI-RNN 把这些比率分别提高到 0.37、0.63 与 0.57（对应室内、室外 1、室外 2 场景）。在室内 OTA 与 Sionna-RT 扩充数据上共同训练的 CI-RNN 进一步把唯一密钥率提高到同一三个场景的 0.94、0.99 与 0.99，表明基于 RT 的数据扩充有助于所提信道感知学习 PKG 框架生成更多唯一密钥。

我们用 8 比特符号上的 $\mathrm{RS}(24,16)$ 与 $\mathrm{RS}(32,16)$ 码评估协商。由于二值特征向量长度为 $W=128$、每符号 $Z=8$ 比特，每个候选密钥表示为 $K=B/Z=16$ 个符号。我们尝试两种编码器，扩展到 $N=24$ 与 $N=32$ 个符号，对应码率 $R=K/N=0.66$ 与 $R=0.5$。当 Bob 译码得到的二值序列与 Alice 的二值向量一致时，协商成功。

**表 I　每符号 $Z=8$ 比特、码率 $R=0.66$ 与 $R=0.50$（分别对应 $\mathrm{RS}(24,16)$ 与 $\mathrm{RS}(32,16)$）下的协商率（RR）**

| 场景 | 模型 | RR$_{AB-BA}$（$R=0.66$） | RR$_{AB-AE}$（$R=0.66$） | RR$_{BA-BE}$（$R=0.66$） | RR$_{AB-BA}$（$R=0.50$） | RR$_{AB-AE}$（$R=0.50$） | RR$_{BA-BE}$（$R=0.50$） |
|---|---|---|---|---|---|---|---|
| 室内 | RNN [24] | 0.67 | 0.00 | 0.00 | 0.93 | 0.00 | 0.00 |
| 室内 | CI-RNN | 0.61 | 0.24 | 0.18 | 0.80 | 0.48 | 0.48 |
| 室内 | CI-RNN（Sionna-RT 扩充） | 0.08 | 0.00 | 0.02 | 0.36 | 0.06 | 0.09 |
| 室外 1 | RNN [24] | 0.5 | 0.00 | 0.00 | 0.87 | 0.00 | 0.00 |
| 室外 1 | CI-RNN | 0.47 | 0.03 | 0.01 | 0.71 | 0.06 | 0.21 |
| 室外 1 | CI-RNN（Sionna-RT 扩充） | 0.03 | 0.00 | 0.00 | 0.24 | 0.00 | 0.04 |
| 室外 2 | RNN [24] | 0.18 | 0.00 | 0.00 | 0.43 | 0.00 | 0.00 |
| 室外 2 | CI-RNN | 0.85 | 0.03 | 0.05 | 0.96 | 0.11 | 0.11 |
| 室外 2 | CI-RNN（Sionna-RT 扩充） | 0.08 | 0.00 | 0.00 | 0.35 | 0.00 | 0.00 |

表 I 报告 Alice–Bob、Alice–Eve 与 Bob–Eve 对的协商率。如预期，较低码率的 RS 码为 Alice–Bob 带来更高协商率，但代价是 Eve 也可能成功协商。所提 CI-RNN 方法的协商率低于 [24] 报告的值，这是预期之中的，因为所生成密钥的唯一性较低。

隐私放大之前，对成功协商的密钥执行 NIST 统计检验套件 [33] 中如下九项检验：近似熵、累积和、块内频数、块内最长游程、单比特频数、非重叠模板匹配、随机偏移、游程、以及序列检验（各自给出通过分数）。结果表明，CI-RNN 生成密钥中 100% 的成功协商密钥通过所评估的 NIST 随机性检验，而 [24] 中生成的密钥未通过随机偏移变体检验。协商成功后，Alice 与 Bob 通过对（假定公开的）协商后二值特征向量做哈希来施加隐私放大。

## VI. 结论与展望

本文提出一种直接从原始 IQ 测量进行物理层密钥生成的信道感知神经框架。所提方法扩展了此前 AI 辅助 PKG：把结构化信道探测、多径信道监督与射线追踪数据扩充结合在统一学习流水线中。所提多任务架构并非仅优化密钥特征相似度，而是联合学习保互易性的二值特征与无线信道的辅助表示；该设计把所学密钥材料锚定在可测量的传播结构中，同时保留边缘密钥建立所需的轻量、去中心化运行特性。

该框架使用在 POWDER 测试平台上采集的室内外空口 SDR 测量、以及用于训练扩充的 Sionna-RT 生成传播场景进行评估。在所有评估场景中，所提信道感知 RNN 对互易 Alice–Bob 观测产生比 Eve 相关观测更低的比特不一致；最显著的改善出现在密钥多样性上。成功协商的信道感知密钥在隐私放大之前也通过了所选 NIST 随机性检验。

结果揭示了一个重要的**协商—多样性折中**：提高所学表示对信道相关变化的敏感性会大幅改善密钥多样性，但也会增加 Alice–Bob 的残余不一致，并在所评估的 Reed–Solomon 配置下降低协商成功率。该折中为学习辅助 PKG 指明核心设计挑战：在不牺牲可信用户之间可靠协商的前提下提升生成密钥的熵与唯一性。未来工作将研究协商感知训练目标、自适应量化与纠错策略、替代的信道感知损失，并在移动性、干扰、更大网络拓扑与主动对抗攻击下开展更广泛验证。

## 分配声明与基金说明

分配声明：Distribution A. 已批准公开分发：Distribution Unlimited: AFRL-2026-3584（2026 年 8 月 10 日）。基金：本工作部分受 NSF Grants EEC-2133516、CNS-2117822、ITE-2226392 以及 Air Force Research Laboratory Grants FA8750-21-F-1012、FA8750-20-C-1021 支持。

作者单位：Jose Angel Sanchez Viloria、George Sklivanitis 与 Dimitris Pados 就职于佛罗里达大西洋大学互联自主与人工智能中心（Boca Raton, FL, USA；邮箱 josesanchez2019/gskivanitis/dpados@fau.edu）；Elizabeth Serena Bentley 就职于美国空军研究实验室（Rome, NY, USA；邮箱 elizabeth.bentley.3@us.af.mil）。

## 图注与表注

**图 1：** 面向动态数据加密的所提 PKG 协议的数据收集、模型训练与测试流程（含信道探测、IQ 频谱图、信道估计/射线追踪参考、度量学习与信道感知损失、密钥协商与隐私放大、动态数据加密）。

**图 2：** 带二值特征头与信道估计头的信道感知 GRU 特征提取器架构（含双向 GRU、四个稠密归一化块、全局平均池化、L2 归一化、sign 量化头与线性信道估计头）。

**图 3：** POWDER 室外 SDR 测试床布置（红色点）与 Sionna-RT 数字孪生布置（绿色点），用于训练数据扩充、测试与所提 PKG 协议评估。

**图 4：** 室内与室外 Alice–Bob–Eve 拓扑配置下 RNN [24]、CI-RNN、CI-RNN Sionna RT 扩充模型的 BDR 分布。

**表 I：** 每符号 $Z=8$ 比特、码率 $R=0.66$ 与 $R=0.50$（分别对应 $\mathrm{RS}(24,16)$ 与 $\mathrm{RS}(32,16)$）下的协商率（RR），含室内、室外 1、室外 2 三种场景 × RNN/CI-RNN/CI-RNN(Sionna-RT 扩充) 三种模型（逐格见正文表 I）。

> **原文说明：** 原文无附录、无独立致谢段；首页脚注含分配声明（AFRL-2026-3584）与 NSF/AFRL 基金号，已译入"分配声明与基金说明"节。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 6 页转录；未逐条核对 DOI）。

[1] J. Zhang, S. Rajendran, Z. Sun, R. Woods, and L. Hanzo, "Physical layer security for the internet of things: Authentication and key generation," IEEE Wireless Communications, vol. 26, no. 5, pp. 92–98, 2019.

[2] J. Zhang, T. Q. Duong, A. Marshall, and R. Woods, "Key generation from wireless channels: A review," IEEE Access, vol. 4, pp. 614–626, 2016.

[3] G. Bagheri, P. Walther, M. Braunig, A. K. Boroujeni, and S. Köpsell, "Feature extraction for channel reciprocity based secret key generation methods," Journal of Communications and Networks, vol. 27, no. 3, pp. 147–165, 2025.

[4] U. Maurer and S. Wolf, "Secret-key agreement over unauthenticated public channels .ii. privacy amplification," IEEE Transactions on Information Theory, vol. 49, no. 4, pp. 839–851, 2003.

[5] U. Maurer and S. Wolf, "Secret-key agreement over unauthenticated public channels-part ii: the simulatability condition," IEEE Transactions on Information Theory, vol. 49, no. 4, pp. 832–838, 2003.

[6] U. Maurer and S. Wolf, "Secret-key agreement over unauthenticated public channels .i. definitions and a completeness result," IEEE Transactions on Information Theory, vol. 49, no. 4, pp. 822–831, 2003.

[7] G. Sklivanitis, K. Pelekanakis, S. A. Yıldırım, R. Petroccia, J. Alves, and D. A. Pados, "Physical layer security against an informed eavesdropper in underwater acoustic channels: Reconciliation and privacy amplification," in 2021 Fifth Underwater Communications and Networking Conference (UComms), 2021, pp. 1–5.

[8] S. Yıldırım, K. Pelekanakis, G. Sklivanitis, D. A. Pados, P. Paglierani, R. Petroccia, J. Alves, F. Molfese, and F. Cuomo, "Secret underwater acoustic key generation challenged by eve's simulator," IEEE Journal of Oceanic Engineering, vol. 50, no. 2, pp. 489–506, 2025.

[9] K. Zeng, D. Wu, A. Chan, and P. Mohapatra, "Exploiting multiple antenna diversity for shared secret key generation in wireless networks," in Proc. IEEE INFOCOM, 2010, pp. 1–9.

[10] H. Liu, Y. Wang, J. Yang, and Y. Chen, "Fast and practical secret key extraction by exploiting channel response," in Proc. IEEE INFOCOM, 2013, pp. 3048–3056.

[11] S. Mathur, W. Trappe, N. Mandayam, C. Ye, and A. Reznik, "Radio telepathy: Extracting a secret key from an unauthenticated wireless channel," in Proc. ACM MobiCom, 2008, pp. 128–139.

[12] Y. Wei, K. Zeng, and P. Mohapatra, "Adaptive wireless channel probing for shared key generation based on pid controller," IEEE Transactions on Mobile Computing, vol. 12, no. 9, pp. 1842–1852, 2013.

[13] N. Patwari, J. Croft, S. Jana, and S. K. Kasera, "High-rate uncorrelated bit extraction for shared secret key generation from channel measurements," IEEE Transactions on Mobile Computing, vol. 9, no. 1, pp. 17–30, 2010.

[14] S. T. Ali, V. Sivaraman, and D. Ostry, "Eliminating reconciliation cost in secret key generation for body-worn health monitoring devices," IEEE Transactions on Mobile Computing, vol. 13, no. 12, pp. 2763–2776, 2014.

[15] X. Zhang, G. Li, J. Zhang, L. Peng, A. Hu, and X. Wang, "Enabling deep learning-based physical-layer secret key generation for fdd-ofdm systems in multi-environments," IEEE Transactions on Vehicular Technology, vol. 73, no. 7, pp. 10 135–10 149, 2024.

[16] X. Wei and D. Saha, "Knew: Key generation using neural networks from wireless channels," in Proceedings of the 2022 ACM Workshop on Wireless Security and Machine Learning, ser. WiseML '22. New York, NY, USA: Association for Computing Machinery, 2022, p. 45–50.

[17] D. S. Karas, G. K. Karagiannidis, and R. Schober, "Neural network based phy-layer key exchange for wireless communications," in IEEE PIMRC, 2011, pp. 1233–1238.

[18] N. Basha and B. Hamdaoui, "Wavelet-based csi reconstruction for improved wireless security through channel reciprocity," Comput. Secur., vol. 154, no. C, Jul. 2025.

[19] E. Olyaei Torshizi and W. Henkel, "Pairwise physical layer secret key generation for fdd systems," IEEE Transactions on Information Forensics and Security, vol. 19, pp. 9518–9533, 2024.

[20] X. Yang and D. Li, "Loop-back mechanism-based physical-layer secret key generation in fdd system under hardware impairments," Trans. Info. For. Sec., vol. 20, p. 4694–4709, Jan. 2025.

[21] Z. Wei, W. Hu, J. Zhang, W. Guo, and J. A. McCann, "Explainable adversarial learning framework on physical layer key generation combating malicious reconfigurable intelligent surface," IEEE Transactions on Wireless Communications, vol. 24, no. 4, pp. 3529–3545, 2025.

[22] A. Jiao, H. Yang, and W. Xu, "Nerecon: Neural-enhanced reconciliation for secure physical layer key generation," in IEEE INFOCOM 2025 - IEEE Conference on Computer Communications Workshops (INFOCOM WKSHPS), 2025, pp. 1–6.

[23] H. Yang and W. Xu, "Llmkey: Llm-powered wireless key generation scheme for next-gen iov systems," arXiv preprint, 2025.

[24] J. A. Sanchez Viloria, G. Sklivanitis, D. Pados, and E. S. Bentley, "Ai-assisted physical layer key generation for secure wireless communications," in 2025 59th Asilomar Conference on Signals, Systems, and Computers, 2025, pp. 770–776.

[25] NVIDIA, "Sionna rt documentation: Introduction to sionna rt," accessed: 2026-05-31.

[26] A. Goldsmith, Wireless Communications. Cambridge University Press, 2005.

[27] J. G. Proakis and M. Salehi, Digital Communications, 5th ed. McGraw-Hill, 2008.

[28] J. Chung, C. Gulcehre, K. Cho, and Y. Bengio, "Empirical evaluation of gated recurrent neural networks on sequence modeling," 2014.

[29] M. Schuster and K. Paliwal, "Bidirectional recurrent neural networks," IEEE Transactions on Signal Processing, vol. 45, no. 11, pp. 2673–2681, 1997.

[30] W. Chen, X. Chen, J. Zhang, and K. Huang, "Beyond triplet loss: A deep quadruplet network for person re-identification," in CVPR, 2017, pp. 1320–1329.

[31] J. Breen, A. Buffmire, J. Duerig, K. Dutt, E. Eide, M. Hibler, D. Johnson, S. K. Kasera, E. Lewis, D. Maas, A. Orange, N. Patwari, D. Reading, R. Ricci, D. Schurig, L. B. Stoller, J. Van der Merwe, K. Webb, and G. Wong, "Powder: Platform for open wireless data-driven experimental research," in Proceedings of the 14th International Workshop on Wireless Network Testbeds, Experimental Evaluation & Characterization, ser. WiNTECH '20. New York, NY, USA: Association for Computing Machinery, 2020, p. 17–24.

[32] T. P. Team, "The powder manual: Hardware and wireless environments."

[33] A. L. Rukhin et al., "A statistical test suite for random and pseudorandom number generators for cryptographic applications," NIST, Tech. Rep. 800-22 Rev 1a, 2010.

**本页范围与校对状态：** 本页为 arXiv:2609.16341v1 的全文中文译稿：摘要、正文第 I–VI 节（含 III-A/B/C、V-A/B 全部小节）、结论与展望、分配声明与基金说明、表 I 逐格、图 1–4 图注与参考文献 [1]–[33]。公式编号沿用原文 (1)–(16)（(1) GLFSR 码、(2) 接收信号、(3) LS 信道估计、(4)(5) Sionna-RT 连续/离散信道、(6)–(10) RMS 归一化与 STFT、(11) 二值量化、(12) 信道估计头、(13) 总损失、(14) 四元组度量学习、(15) NMSE 信道损失、(16) BDR）；其中若干原文未编号的派生式（如 $M$ 段数计算、$K=B/Z$ 定义、密钥率公式）以行内形式给出。表 I 已用 PDF 第 6 页渲染图逐格核对（9 行 × 6 项协商率，含 RNN/CI-RNN/CI-RNN(Sionna-RT) 与室内/室外 1/室外 2）。原文无附录、无独立致谢段；图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行原为 2026-09-26（收录日），已按 BRIEF2 结构改为 arXiv:2609.16341v1（2026-09-14，依据 PDF 页眉 "arXiv:2609.16341v1 [cs.LG] 14 Sep 2026"）；作者为 Jose Angel Sanchez Viloria、George Sklivanitis、Dimitris Pados、Elizabeth Serena Bentley；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
