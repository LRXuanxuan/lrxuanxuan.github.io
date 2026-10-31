---
layout: page
title: "SpaceDiffusion：面向太空生成转发的在轨扩散｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-20899-spacediffusion-over-the-orbit-diffusion-for-space-generate-and-forward/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c4f5057561653bf8/) · [原文 arXiv](https://arxiv.org/abs/2609.20899) · [全部目录](/papers/catalog/)

# SpaceDiffusion：面向太空生成转发的在轨扩散

**原题：** SpaceDiffusion: Over-the-Orbit Diffusion for Space Generate-and-Forward Communications  
**作者：** Jianhao Huang、Zhanwei Wang、Khaled B. Letaief（Fellow, IEEE）、Kaibin Huang（Fellow, IEEE）  
**单位：** J. Huang、Z. Wang、K. Huang 就职于香港大学（HKU）电气与电子工程系，中国香港特别行政区（邮箱：Jianhaoh@hku.hk、{zhanweiw, huangkb}@eee.hku.hk），通讯作者为 K. Huang；K. B. Letaief 就职于香港科技大学（HKUST）电子与计算机工程系，中国香港特别行政区（邮箱：eekhaled@ust.hk）。  
**版本：** arXiv:2609.20899v1（cs.IT），2026 年 9 月 17 日；原文注明已提交 IEEE 以供发表（版权可能转移）；14 页。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VII 节、图 1—10 中文图注、表 I 逐格转录、附录 A—B（命题证明）、参考文献 [1]—[41]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(68) 按原文保留。逐句逐式终校未做。

## 摘要

卫星通信是第六代（6G）移动网络的重要组成部分，为全球业务提供泛在连接。然而，卫星上行链路仍是地面设备的关键瓶颈：受限的发射功率与天线孔径导致低数据速率与高误包率。为克服该瓶颈，本文提出一种新的中继范式——**生成转发（generate-and-forward, GF）通信**：卫星利用**在轨生成式人工智能（AI）**在转发前稳健地重建受损数据。具体地，我们提出 **SpaceDiffusion**，一种用于卫星辅助图像传输的在轨扩散框架。该框架的核心是**信道失真感知的扩散理论**，其构建方式如下：把压缩与丢失图像 token 的恢复表述为逆问题，从而把信道失真修正项直接并入传统去噪扩散隐式模型（DDIM）的更新中。由此，单个预训练扩散模型无需重训练即可动态适配不同的丢包模式与压缩失真。此外，我们解析刻画了渐进式 token 重建误差，并推导出**扩散步激活阈值**，用以预测 SpaceDiffusion 何时有望优于传统译码转发（decode-and-forward, DF）中继。基于这些理论洞见，我们进一步提出**能量感知的提前退出策略**，以在轨高效部署 SpaceDiffusion。实验结果表明，相较采用重传协议的 DF 方案，SpaceDiffusion 取得更低的端到端时延，并在目标感知质量下节省约 15 dB 上行发射功率。

**索引词：** 卫星通信、生成式人工智能、生成转发、扩散模型。

## I. 引言

卫星通信被设想为第六代（6G）移动网络的重要组成部分，可为人工智能（AI）、沉浸式物联网（IoT）与多媒体接入等全球业务提供泛在覆盖 [1]–[5]。在传统架构中，卫星常被视为地面中继节点的星载延伸，其主要作用是在地面终端之间接收并转发信息 [4]。然而，受长传播距离、多普勒频移与地面设备有限发射功率影响，这种以中继为中心的设计在卫星上行链路中面临固有局限。为解决该问题，固定地面终端已配备高增益天线、先进波束成形器与更高频频谱资源（如 Ku 与 Ka 频段）[4]、[6]。但这些方案对 IoT 与手持设备并不现实，因为它们受电池容量、硬件复杂度与天线尺寸限制 [7]。因此，低上行传输速率（低功耗设备通常仅数 Kbps 至数十 Kbps）仍是带宽需求型多媒体业务的关键瓶颈 [7]、[8]。空间 AI 与在轨计算的最新进展正把卫星从被动转发节点转变为智能信息处理中心 [9]–[11]。例如，Starcloud-1 [10] 与三体计算星座 [11] 等在轨 AI 计算平台已发射。这一范式转变通过支持在轨生成式数据恢复，为降低对高吞吐上行传输的需求开辟了新机会。

在该上行瓶颈下，传统卫星系统通常依赖**透明**或**再生**架构来支持可靠传输 [6]、[13]。一方面，透明架构采用低复杂度的放大转发（AF）方案，卫星在功率放大与频率转换后直接转发接收信号 [4]、[6]。另一方面，再生架构基于译码转发（DF）方案，卫星执行星上信道译码与重编码，从而缓解错误传播 [6]、[13]。然而，两种架构仍依赖上行链路准确的比特级投递。当数据包受损或译码失败时，需要确认（ACK）/否定确认（NACK）反馈与重传来恢复丢失信息 [13]、[14]。由于卫星链路往返时延（RTT）很长，这类基于反馈的重传机制会显著增加端到端（E2E）时延。已有研究尝试通过增强重传调度、先进前向纠错与增加并行混合自动重传请求（HARQ）进程数来缓解 RTT 引起的停滞 [13]。但这些方法仍在基于反馈的重传范式内运行，无法从根本上克服上述局限。这要求从"准确比特投递"转向更高效的 AI 赋能数据恢复。

近期，生成式 AI（GenAI）在从低维提示进行数据恢复方面取得显著成功 [15]–[17]。受此能力启发，已有研究把 GenAI 引入地面通信网络，以提升传输效率与抗信道损伤的鲁棒性 [18]–[21]。其做法是把源数据转换为低维特征或 token 域传输，并在接收端进行生成式恢复。例如，基于 Transformer 的基础模型被用于重建因丢包而丢失的潜 token [18]、[19]，扩散模型则被用于迭代填补缺失特征以实现抗错传输 [20]。这些生成技术可容易地扩展到卫星通信——把卫星当作常规中继节点。一个代表性例子是在地面网关部署基础模型，以恢复卫星转发的受损特征 [21]、[22]。然而，这类生成策略未能利用卫星计算资源来克服上行瓶颈；此外，当关键特征丢失时，网关侧恢复还需要额外的上下行重传周期，从而大幅增加时延。

随着空间 AI 计算能力的提升，卫星可在转发前在轨执行生成式数据处理 [12]、[23]，从而减轻资源受限上行传输的负担。我们把这一新的中继范式称为**生成转发（GF）**方案，如图 1 所示。GF 方案利用 GenAI 恢复由丢包、速率控制或源压缩造成的缺失特征/token 或丢失信息。于是生成数据可获得比传输数据更丰富的表示；由此增加的转发载荷可通过利用上下行容量不对称、放宽传统上下行速率匹配约束来支持。然而，GF 方案在卫星系统中的实现面临两个新挑战：其一是设计适配卫星通信的高效生成算法——现有生成模型多由数据驱动，可能难以泛化到动态卫星信道环境 [15]、[16]；其二是在能量受限卫星上部署可能高功耗的 GenAI 算法——可从太阳能收集到的能量随轨道动力学与光照条件变化。

本文通过提出 SpaceDiffusion——一种面向天基 GF 图像传输的新型在轨扩散框架——来应对上述挑战。该框架中的技术使卫星能够在星上恢复高度压缩且部分擦除的图像 token，从而缓解上行瓶颈。主要贡献与发现概括如下。

- **信道失真感知的扩散理论。** 我们把丢包与有损源压缩下的卫星 token 恢复表述为逆问题。基于该模型，我们推导出基于后验的反向时间随机微分方程（SDE），从高斯噪声逐步恢复干净 token。该 SDE 的核心是**后验 score 函数**，它可分解为数据分布项与由丢包掩码和源压缩噪声协方差决定的信道失真项。利用该可加分解，我们提出**信道失真感知的 DDIM 算法**，把信道失真项作为即插即用修正插入传统 DDIM 更新。由此，单个预训练扩散模型无需重训练即可适配变化的卫星信道条件。
- **扩散性能分析。** 我们分析所提算法在反向步索引 $t$ 从 $T$ 降到 $0$ 过程中的渐进性能（$T$ 为最大反向步索引）。借助伪逆高斯近似与前向扩散关系，推导每一步 token 域均方误差（MSE）的近似上界；并基于该上界与反向扩散的渐进去噪性质 [15]、[24]，进一步推导**扩散步阈值**，预测 SpaceDiffusion 超越传统 DF 中继所需的最小反向步数。
- **能量感知的扩散步优化。** 基于所推导阈值，我们建立优化问题，在能量与时延约束下最大化可执行的反向扩散步数。求解该问题得到**闭式提前退出策略**：仅当可用能量与时间足以达到扩散步阈值时才启动在轨生成，否则回退到 DF 中继以避免无效的扩散计算。
- **实验结果。** 在真实 AFHQ 与 Kodak 图像数据集上的大量实验，在不同信道与轨道条件下验证了 SpaceDiffusion。与采用重传的 DF 基线相比，SpaceDiffusion 在低地球轨道（LEO）中把 E2E 时延最多降低 40%；此外，为达到相同感知质量，它可比非生成式压缩基线节省约 15 dB 上行发射功率。这种功率效率使其适合 IoT 在非地面网络（NTN）中的连接等卫星应用。不同轨道配置的实验进一步表明，轨道光照强烈影响可执行扩散步数，而所提能量感知策略能按可用资源调整在轨生成，并持续优于无生成基线。

全文结构如下：第 II 节概述卫星 GF 通信；第 III 节给出系统模块与问题表述；第 IV 节发展基于后验的扩散理论与算法；第 V 节研究卫星能量受限下的最优扩散步数；第 VI 节给出实验结果；第 VII 节总结。

## II. 卫星生成转发通信概述

考虑卫星 GF 系统：地面设备向卫星上传数据，卫星在把信息转发给地面设备/站点之前执行在轨生成式恢复。卫星配备 GenAI 模块，可从低质量上行传输造成的受损输入中重建高保真数据。具体而言，整体工作流包含四个顺序阶段。

1. **Token 化**：令 $X$ 表示待传输源数据。在发射端，语义编码器 $F_\phi(\cdot)$ 把 $X$ 变换为 token 表示 $Y\in\mathbb R^{K\times D}$，其中 $K$ 为 token 数、$D$ 为 token 维数。随后对 $Y$ 进行量化与信源编码，得到比特流。
2. **上行传输**：压缩后的 token 比特流经交织并按固定长度数据包序列打包后传输。由于卫星信道条件差且带宽有限，上行传输遭受高压缩率与丢包。
3. **在轨 token 生成**：经上行接收与译码后，卫星得到失真 token 表示 $\tilde Y\in\mathbb R^{K\times D}$，其中部分 token 被正确接收，另一些因丢包而缺失。我们提出在轨生成模块 $G_\Theta(\cdot)$，在潜空间直接恢复受损 token 得到 $\bar Y$。
4. **下行转发**：生成完成后，卫星重新编码，并经下行把恢复信息转发给目的地面用户；目的用户通过语义解码器 $D_\psi(\cdot)$ 重建图像。

下文详细阐述上述四个阶段，并讨论 GF 通信系统的主要挑战。

## III. 系统模型与问题表述

本节给出 GF 系统的系统模型并介绍其主要问题。此处以图像传输为例，但所提框架可扩展到视频、音频等其他数据类型，如图 2 所示。

### A. Token 化

**1) Token 表示。** 对给定源图像 $X\in\mathbb R^{H\times W\times 3}$，发射端用神经网络编码器 $F_\phi(\cdot)$ 把图像直接映射为 token 表示：

$$
Y=F_\phi(X)\in\mathbb R^{K\times D}.\tag{1}
$$

token 表示可写为

$$
Y=\left[\mathbf y_1,\mathbf y_2,\ldots,\mathbf y_K\right]^T.\tag{2}
$$

其中 $\mathbf y_n\in\mathbb R^D$ 表示第 $n$ 个 token，即源图像的局部潜 patch。Token 化把图像转换为局部特征序列，从而降低像素级冗余、支持高效压缩与打包 [18]；这种局部 token 表示也适合第 IV 节的扩散模型。

**2) 数字信源编码。** 由于上行带宽有限，token 表示 $Y$ 在传输前需进行有损压缩。高效有损信源编码器的设计一般需要知道 token 分布，但由于图像分布难以刻画、语义编码器非线性，$Y$ 的精确分布难以表征。为使信源编码设计可处理，我们假设 token 独立同分布（i.i.d.），且每个 $\mathbf y_n$ 近似服从多元高斯分布：

$$
\mathbf y_n\sim\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma),\tag{3}
$$

其中 $\boldsymbol\mu\in\mathbb R^D$ 与 $\boldsymbol\Sigma\in\mathbb R^{D\times D}$ 为由训练样本估计的均值向量与协方差矩阵，$\boldsymbol\Sigma$ 刻画 token 各分量之间的统计相关性。

此处采用线性变换编码 [25] 来编码相关高斯源：它自然利用二阶相关结构，同时保持较低实现复杂度；并且可通过调整量化分辨率方便地使信源编码速率适配上行信道条件。具体地，协方差矩阵的特征分解为 $\boldsymbol\Sigma=\mathbf U\boldsymbol\Lambda\mathbf U^T$，其中 $\mathbf U$ 正交、$\boldsymbol\Lambda=\operatorname{diag}(\lambda_1,\lambda_2,\ldots,\lambda_D)$ 含特征值。每个 token 解相关为 $\mathbf z_n=\mathbf U^T(\mathbf y_n-\boldsymbol\mu)$，其中 $\mathbf z_n=[z_{n,1},\ldots,z_{n,D}]^T$。每个系数均匀量化 [26] 为

$$
\hat z_{n,k}=\frac{\Delta_k}{\sqrt{\lambda_k}}\left\lfloor\frac{z_{n,k}}{\Delta_k/\sqrt{\lambda_k}}+\frac12\right\rfloor,\tag{4}
$$

其中 $\lfloor\cdot\rfloor$ 为下取整算子、$\Delta_k=\sqrt{\lambda_k}/s$，$s>0$ 控制量化分辨率。随后用 Huffman 编码 [27] 以约 $B_{n,k}\approx-\log_2P_k(\hat z_{n,k})$ 比特编码每个值，$P_k$ 为概率质量函数。

熵解码后，逆变换给出 $\hat{\mathbf y}_n=\mathbf U\hat{\mathbf z}_n+\boldsymbol\mu$。由（4）有

$$
\hat{\mathbf y}_n=\mathbf y_n+\mathbf q_n,\tag{5}
$$

其中 $\mathbf q_n=\mathbf U\mathbf e_n$、$\mathbf e_n=\hat{\mathbf z}_n-\mathbf z_n$ 为量化误差。当 $D$ 充分大时，由中心极限定理 [28] 得 $\mathbf q_n\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma_q)$，其中

$$
\boldsymbol\Sigma_q=\mathbf U\operatorname{diag}\left(\frac{\Delta_1^2}{12},\ldots,\frac{\Delta_D^2}{12}\right)\mathbf U^T=\frac{1}{12s^2}\boldsymbol\Sigma.\tag{6}
$$

### B. 上行传输

经 token 化与信源编码后，压缩比特流由地面设备发送至中继卫星。

**1) 交织与打包。** 记图像的源编码比特流为 $\mathbf b=\{b_1,b_2,\ldots,b_K\}$，$b_n$ 为第 $n$ 个 token 的压缩比特序列。为缓解突发错误影响，对比特序列做交织，其由置换 $\pi(\cdot)$ 定义，交织后比特流为 $\mathbf b_\pi=\{b_{\pi(1)},b_{\pi(2)},\ldots,b_{\pi(K)}\}$。

交织后，token 被组装为长度 $L_p$ 的固定长度数据包。每个包含长度 $L_h$ 的包头与 $L_{\mathrm{pay}}=L_p-L_h$ 的载荷。为防止错误传播 [29]，每个 token 的比特流被视为不可分割单元，即 token 不能跨多个包分割；若分配给该 token 的比特少于载荷容量，则用零填充。令 $\mathcal I_m$ 表示分配给第 $m$ 个包的 token 索引有序集，则第 $m$ 个包构造为

$$
\mathbf p_m=\left[\mathbf h_m,\mathbf b_{\pi(i_1)},\ldots,\mathbf b_{\pi(i_k)},\mathbf 0\right],\tag{7}
$$

其中 $\mathbf h_m$ 为包头、$i_k\in\mathcal I_m$、$\mathbf 0$ 表示零填充比特。包头承载 token 重建所需的控制信息，包括有序 token 索引与填充长度。最终包序列记为 $P=\{\mathbf p_1,\mathbf p_2,\ldots,\mathbf p_M\}$，$M$ 为总包数。

**2) 信道编码。** 每个包经信道编码为

$$
\mathbf c_m=\mathcal C(\mathbf p_m)\in\mathbb C^{L_c},\tag{8}
$$

其中 $\mathcal C(\cdot)$ 为编码器、$L_c$ 为块长。码率为 $r_u=L_p/L_c$，故在带宽 $B$ 上的上行比特率为 $R_u=Br_u$。

**3) 上行模型。** 考虑块衰落信道模型 [8]，卫星处第 $m$ 个包的接收信号为

$$
\mathbf r_m=h_m\sqrt{p_u}\,\mathbf c_m+\mathbf w_m,\tag{9}
$$

其中 $p_u$ 为发射功率、$h_m$ 为信道系数、$\mathbf w_m\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I)$ 为加性噪声。

信道分解为 $h_m=\sqrt{\ell_m}g_m$，其中 $\ell_m$ 为大尺度增益、$g_m$ 为 Rician 衰落系数。前者为

$$
\ell_m=\frac{G_tG_r}{L_{\mathrm{fs}}(d_m,f_c)\xi_m},\tag{10}
$$

其中 $G_t$、$G_r$ 为天线增益，$d_m$ 为传播距离，$f_c$ 为载频，$L_{\mathrm{fs}}$ 为自由空间路径损耗，$\xi_m$ 刻画附加衰减。接收 SNR 为 $\gamma_m=p_u|h_m|^2/\sigma^2$。在块长 $L_c$ 下，译码错误概率近似为 [30]

$$
\rho_m\approx Q\left(\frac{\sqrt{L_c}\left(C(\gamma_m)-r_u\right)}{\sqrt{V(\gamma_m)}}\right),\tag{11}
$$

其中 $C(\gamma_m)=\log_2(1+\gamma_m)$、$V(\gamma_m)=(1-(1+\gamma_m)^{-2})(\log_2e)^2$、$Q(\cdot)$ 分别表示信道容量、信道散度与高斯 Q 函数。

### C. 在轨 token 生成

接收上行信号后，卫星执行解调与信道译码以恢复传输包。通过收集所有译码包并经去包、解交织与信源解码，卫星得到失真 token 表示

$$
\tilde Y=[\tilde{\mathbf y}_1,\tilde{\mathbf y}_2,\ldots,\tilde{\mathbf y}_K]^T\in\mathbb R^{K\times D}.\tag{12}
$$

由于卫星通信中严重的信道损伤，一些包可能译码错误或完全丢失，丢失的 token 用全零向量替换。等价地，失真 token 表示可建模为

$$
\tilde Y=A\odot\hat Y,\tag{13}
$$

其中 $A\in\{0,1\}^{K\times D}$ 为错误掩码矩阵，指示丢失 token 的位置，$\odot$ 为 Hadamard 积。具体地，若第 $n$ 个 token 丢失，则 $A$ 的第 $n$ 行为全零向量，否则为全一向量。由于丢包由信道译码结果决定，错误掩码 $A$ 可在卫星处通过信道译码与循环冗余校验（CRC）[31] 获得。基于接收信号 $\tilde Y$，我们设计生成模块恢复受损 token，得到

$$
\bar Y=G_\Theta\left(\tilde Y,A\right).\tag{14}
$$

### D. 下行转发传输

生成完成后，卫星把恢复的 token 表示 $\bar Y$ 转发给目的地面设备。令 $R_{s,\mathrm{dl}}$ 表示编码 $\bar Y$ 的平均源比特长度，编码过程与上行相同。

与上行不同（上行中受限的发射功率与天线增益使 token 丢失成为关键问题），下行被认为以足够高的传输速率与低误包率运行 [6]。因此下行速率（比特/秒）用 Shannon 容量建模：

$$
R_d=B_{\mathrm{dl}}\log_2(1+\gamma_{\mathrm{dl}}),\tag{15}
$$

其中 $B_{\mathrm{dl}}$ 为下行带宽、$\gamma_{\mathrm{dl}}$ 为接收下行 SNR。

收到下行比特流后，目的地面用户执行熵解码与 token 重建以恢复 token 表示。令 $\breve Y\in\mathbb R^{K\times D}$ 表示用户侧最终收到的 token 表示，则通过语义解码器 $D_\psi(\cdot)$ 重建图像：

$$
\hat X=D_\psi(\breve Y).\tag{16}
$$

### E. 问题表述

设计卫星 GF 系统引出两个主要问题。

**1) 作为逆问题的 token 生成。** 根据（5）与（13），卫星处收到的 token 表示可建模为

$$
\tilde Y=\underbrace{A}_{\text{丢包}}\odot\left(Y+\underbrace{Q}_{\text{压缩损失}}\right).\tag{17}
$$

因此接收 token 同时受信道引起的丢包与源压缩损失影响。给定 $A$ 与 $Q$ 的协方差矩阵，从 $\tilde Y$ 恢复 $Y$ 是不适定逆问题 [32]。基于贝叶斯恢复 [32] 等传统方法需要准确的 token 分布先验，否则性能可能显著退化。这促使我们使用扩散模型，其直接从训练数据学习 token 分布。然而，扩散后验采样（DPS）[17] 等传统扩散方法主要面向图像域逆问题（如图像修复），未考虑卫星系统中 token 表示的特殊性质。

**2) 能量受限下的星上部署。** 生成模型的星上部署对卫星系统仍是挑战：卫星受太阳能收集限制，计算资源约束严格。因此生成模型设计必须在性能、计算复杂度与能量资源之间折中。该问题将在第 V 节详细讨论。

## IV. 信道失真感知的扩散理论

本节通过求解（17）中的逆问题，推导信道失真感知的扩散理论。我们先引入相应 SDE，再给出求解算法；随后给出以 DF 方案为基准的性能分析。

### A. 基于信道后验的 SDE

扩散理论的核心思想是：定义把干净数据逐步扰动为各向同性高斯噪声的前向过程，并学习逐步去噪的反向过程。为求解（17）的逆问题，反向过程被进一步发展：不仅从噪声、还以接收测量 $\tilde Y$ 为条件生成目标数据。

具体地，前向过程可由 Itô SDE [24] 定义：

$$
dY_t=-\frac{\alpha(t)}{2}Y_t\,dt+\sqrt{\alpha(t)}\,dW_t,\tag{18}
$$

其中 $W_t\in\mathbb R^{K\times D}$ 为标准 Wiener 过程 [24]，$\alpha(t)>0$ 为过程的噪声调度。$t=0$ 时 $Y_0=Y\sim p(Y)$；当 $t=T$ 且 $T$ 充分大时，数据被高斯噪声淹没，即 $Y_T\sim\mathcal N(\mathbf 0,\mathbf I)$。随后，反向过程从高斯噪声与 $\tilde Y$ 迭代生成干净数据，遵循 Itô 反向 SDE [24]：

$$
dY_t=\left[-\frac{\alpha(t)}{2}Y_t-\alpha(t)\nabla_{Y_t}\log p_t\left(Y_t\mid\tilde Y;A,\boldsymbol\Sigma_q\right)\right]dt+\sqrt{\alpha(t)}\,d\bar W_t,\tag{19}
$$

其中 $\bar W_t$ 为标准 Wiener 过程，$p_t(Y_t\mid\tilde Y;A,\boldsymbol\Sigma_q)$ 为在给定 $\tilde Y$（及 $A$、$\boldsymbol\Sigma_q$）时 $Y_t$ 的概率密度函数（PDF）。注意 $\nabla_{Y_t}\log p_t(Y_t\mid\tilde Y;A,\boldsymbol\Sigma_q)$ 即**基于后验的 score 函数**，它指向含噪样本更接近数据样本的方向。由贝叶斯公式 [28]，

$$
\nabla_{Y_t}\log p_t\left(Y_t\mid\tilde Y;A,\boldsymbol\Sigma_q\right)=\nabla_{Y_t}\log p_t(Y_t)+\nabla_{Y_t}\log p_t\left(\tilde Y\mid Y_t;A,\boldsymbol\Sigma_q\right).\tag{20}
$$

第一项为先验 score，可由预训练 score 网络 $\nabla_{Y_t}\log p_t(Y_t)\approx S_\Theta(Y_t,t)$（参数 $\Theta$）近似。主要挑战是刻画 PDF $p_t(\tilde Y\mid Y_t;A,\boldsymbol\Sigma_q)$。为简化记号，我们在 PDF 中省略 $\{A,\boldsymbol\Sigma_q\}$。由贝叶斯公式，$p_t(\tilde Y\mid Y_t)$ 可分解为

$$
p_t\left(\tilde Y\mid Y_t\right)=\int p_t\left(\tilde Y,Y\mid Y_t\right)dY=\int p_t\left(Y\mid Y_t\right)p\left(\tilde Y\mid Y\right)dY.\tag{21}
$$

条件 PDF $p_t(Y\mid Y_t)$ 不可解，故采用**伪逆高斯近似** [33]：

$$
p_t\left(Y\mid Y_t\right)\approx\mathcal N\left(\check Y_t,r_t^2\mathbf I_{K\times D}\right),\tag{22}
$$

其中 $\check Y_t\triangleq\mathbb E(Y\mid Y_t)$，$r_t>0$ 为随时间变化的高斯近似参数。另一方面，$p(\tilde Y\mid Y)$ 可直接由（17）的逆模型得到。基于这些模型，我们有如下命题。

**命题 4.1（基于信道后验的 score 函数）.** 对（17）中给定 $\{A,\boldsymbol\Sigma_q\}$ 的逆问题，基于后验的 score 函数可近似为

$$
\nabla_{Y_t}\log p_t\left(Y_t\mid\tilde Y\right)\approx S_\Theta\left(Y_t,t\right)+\underbrace{\operatorname{unvec}\left(\mathbf J_t^{\top}\operatorname{vec}\left(G_t\right)\right)}_{\triangleq L_t},\tag{23}
$$

其中 $\operatorname{vec}(\cdot)$ 与 $\operatorname{unvec}(\cdot)$ 分别表示向量化与去向量化，$\mathbf J_t\triangleq\frac{\partial\operatorname{vec}(\check Y_t)}{\partial\operatorname{vec}(Y_t)}$ 为 $\check Y_t$ 关于 $Y_t$ 的向量化 Jacobian，且

$$
G_t\triangleq A\odot\left[\left(\tilde Y-\check Y_t\right)\left(r_t^2\mathbf I_D+\boldsymbol\Sigma_q\right)^{-1}\right].\tag{24}
$$

**证明：** 见附录 A。

基于命题 4.1 的 score 函数，（19）的反向 SDE 可由 Euler–Maruyama [34] 等通用随机采样器求解。然而这些方法通常需要很多步并反复施加随机扰动，导致计算成本高、重建质量不稳定。

### B. 信道失真感知的 DDIM 算法

本小节采用高效离散化算法——DDIM 采样器 [15]——求解（18）与（19）的 SDE。相比通用随机采样器，DDIM 提供更稳定的重建质量且只需少量采样步。我们把时间离散为共 $T$ 步，$t\in\{0,1,\ldots,T\}$ 表示离散步索引。

**1) 前向过程。** 离散化后，第 $t$ 步的前向过程为

$$
Y_t=\sqrt{\bar\alpha_t}Y_0+\sqrt{1-\bar\alpha_t}\,\epsilon_t,\qquad\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I_{K\times D}),\tag{25}
$$

其中 $\bar\alpha_t\in(0,1]$ 为预先设计的累积噪声调度 [15]。

**2) 带插入项的反向过程。** 反向过程的目标是从含噪样本 $Y_t$ 与测量 $\tilde Y$ 预测数据样本 $Y_{t-1}$。这本质上等价于学习条件概率 $p_\Theta(Y_{t-1}\mid Y_t,\tilde Y)$，$\Theta$ 为深度神经网络参数。按照传统 DDIM 更新 [15]，我们建模

$$
p_\Theta\left(Y_{t-1}\mid Y_t,\tilde Y\right)\sim\mathcal N\left(Y_{t-1};\sqrt{\bar\alpha_{t-1}}\,\hat Y_{t}^{\mathrm{post}}+\sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\,\hat\epsilon_{\Theta,t},\ \sigma_t^2\mathbf I_{K\times D}\right),\tag{26}
$$

其中 $\hat Y_t^{\mathrm{post}}\triangleq\mathbb E(Y\mid Y_t,\tilde Y)$ 为后验均值，$\sigma_t^2$ 控制反向过程随机性的方差参数（为稳定采样通常置接近零）。$\hat\epsilon_{\Theta,t}(Y_t,t)$ 为噪声预测器，由 U-Net [16] 实现，并通过最小化如下 MSE 损失训练：

$$
\min_\Theta\ \mathbb E_{Y_0,t,\epsilon}\left[\left\|\epsilon_t-\hat\epsilon_\Theta(Y_t,t)\right\|_2^2\right],\tag{27}
$$

其中 $Y_t$ 按（25）生成。噪声预测器与 score 函数的关系为 $S_\Theta(Y_t,t)\approx-\hat\epsilon_{\Theta,t}/\sqrt{1-\bar\alpha_t}$。

在（26）中，后验均值可计算为

$$
\begin{aligned}
\hat Y_t^{\mathrm{post}}&\overset{(a)}{=}\frac{1}{\sqrt{\bar\alpha_t}}\left(Y_t+\left(1-\bar\alpha_t\right)\nabla_{Y_t}\log p_t\left(Y_t\mid\tilde Y\right)\right)\\
&\overset{(b)}{\approx}\frac{1}{\sqrt{\bar\alpha_t}}\left(Y_t+\left(1-\bar\alpha_t\right)S_\Theta(Y_t,t)+\left(1-\bar\alpha_t\right)L_t\right)\\
&=\frac{1}{\sqrt{\bar\alpha_t}}\left(Y_t+\left(1-\bar\alpha_t\right)S_\Theta(Y_t,t)\right)+\frac{1-\bar\alpha_t}{\sqrt{\bar\alpha_t}}L_t\\
&\overset{(c)}{=}\check Y_t+\frac{1-\bar\alpha_t}{\sqrt{\bar\alpha_t}}L_t,
\end{aligned}\tag{28}
$$

其中 (a) 由把 Tweedie 方法 [15] 用于后验均值计算得到，(b) 由命题 4.1 得到，(c) 用到 Tweedie 公式 [15] 给出的 $\check Y_t\triangleq\mathbb E(Y\mid Y_t)=\frac{1}{\sqrt{\bar\alpha_t}}\left(Y_t+\left(1-\bar\alpha_t\right)S_\Theta(Y_t,t)\right)$。进一步由 score—噪声关系有

$$
\check Y_t\approx\frac{1}{\sqrt{\bar\alpha_t}}\left(Y_t-\sqrt{1-\bar\alpha_t}\,\hat\epsilon_{\Theta,t}\right).\tag{29}
$$

根据（26）的反向条件模型，对每个反向步 $t\to t-1$，$Y_{t-1}$ 可写为

$$
Y_{t-1}=\sqrt{\bar\alpha_{t-1}}\,\hat Y_t^{\mathrm{post}}+\sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\,\hat\epsilon_{\Theta,t}+\sigma_t\mathbf z_t,\tag{30}
$$

其中 $\mathbf z_t\sim\mathcal N(\mathbf 0,\mathbf I_{K\times D})$。把（28）代入（30）得

$$
Y_{t-1}=\underbrace{Y_{t-1}^{\mathrm{ddim}}}_{\text{朝 }p(Y)\text{ 的方向}}+\underbrace{\eta_tL_t}_{\text{基于信道失真的方向}},\tag{31}
$$

其中 $\eta_t=\eta\sqrt{\bar\alpha_{t-1}}\left(1-\bar\alpha_t\right)/\sqrt{\bar\alpha_t}$，且

$$
Y_{t-1}^{\mathrm{ddim}}=\sqrt{\bar\alpha_{t-1}}\,\check Y_t+\sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\,\hat\epsilon_{\Theta,t}+\sigma_t\mathbf z_t.
$$

此处我们引入参数 $\eta>0$ 控制信道失真修正的强度。由（31），第一项正是传统 DDIM 步 [15]，推动样本朝数据分布移动；第二项是由接收信号 $\tilde Y$ 与信道条件决定的信道感知修正项。注意在所提 DDIM 算法中，后验修正 $L_t$ 被直接插入（31）的反向更新而无需额外训练。

### C. 性能分析

本小节分析所提 DDIM 算法在反向步索引 $t$ 从 $T$ 降至 $0$ 时的性能。记 $\delta_t\triangleq\eta\sqrt{\bar\alpha_{t-1}}\left(1-\bar\alpha_t\right)/\sqrt{\bar\alpha_t}$，则每个反向步的重建误差为

$$
E_{t-1}\triangleq\mathbb E\left[\left\|Y_{t-1}-Y\right\|_F^2\right].\tag{32}
$$

期望对扩散噪声、图像 token $Y$、错误掩码 $A$ 与压缩噪声 $Q$ 取。错误掩码 $A$ 由信道损伤造成，并由包译码决定：若第 $n$ 个包成功译码则相应掩码行为全一，否则为全零。因此建模

$$
A=\mathbf a\mathbf 1_D^T,\qquad a_n\overset{\mathrm{i.i.d.}}{\sim}\mathrm{Bernoulli}(1-\rho),\tag{33}
$$

其中 $\rho=\mathbb E\{\rho_m\}$ 为平均误包率。

**近似 1（去噪误差模型）.** 在反向步 $t$，噪声预测器近似为

$$
\hat\epsilon_{\Theta,t}\approx\epsilon_t+U_t,\tag{34}
$$

其中 $U_t\in\mathbb R^{K\times D}$ 为与 $\epsilon_t$ 独立的训练引起去噪误差，其元素为 i.i.d. 零均值高斯随机变量、方差固定为 $\sigma_u^2$，可由离线训练估计。

于是有如下结果。

**命题 4.2（近似误差刻画）.** 在近似 1、式（22）的伪逆近似、确定性 DDIM 设定 $\sigma_t=0$ 以及 Jacobian 界 $\|\mathbf J_t\|_2\leq\kappa$ 下，每个反向步 $t-1$ 的误差可近似上界为

$$
E_{t-1}\lesssim\left(\sqrt{a_t^{\mathrm{ddim}}}+\delta_t\kappa\sqrt{\chi_t}\right)^2\triangleq E_{t-1}^{\mathrm{up}},\tag{35}
$$

其中

$$
\mathbf B_t\triangleq\left(r_t^2\mathbf I_D+\boldsymbol\Sigma_q\right)^{-1},\tag{36}
$$

$$
\chi_t\triangleq(1-\rho)K\operatorname{tr}\left(\mathbf B_t\left(\boldsymbol\Sigma_q+\frac{1-\bar\alpha_t}{\bar\alpha_t}\sigma_u^2\mathbf I_D\right)\mathbf B_t\right),\tag{37}
$$

且

$$
\begin{aligned}
a_t^{\mathrm{ddim}}={}&\left(\sqrt{\bar\alpha_{t-1}}-1\right)^2K\left(\|\boldsymbol\mu\|_2^2+\operatorname{tr}(\boldsymbol\Sigma)\right)+\left(1-\bar\alpha_{t-1}\right)KD\\
&+KD\sigma_u^2\left(\sqrt{1-\bar\alpha_{t-1}}-\sqrt{\frac{\bar\alpha_{t-1}\left(1-\bar\alpha_t\right)}{\bar\alpha_t}}\right)^2.
\end{aligned}\tag{38}
$$

此处 $E_T=\mathbb E\left[\left\|Y_T-Y\right\|_F^2\right]=K\left(\|\boldsymbol\mu\|_2^2+\operatorname{tr}(\boldsymbol\Sigma)\right)+KD$，其中 $Y_T\sim\mathcal N(\mathbf 0,\mathbf I)$。**证明：** 见附录 B。

> **注 4.1（渐进去噪趋势）.** 随着步索引 $t$ 减小，（19）的反向时间 SDE 把含噪样本逐步输运向数据分布 [24]。相应地，$\bar\alpha_{t-1}$ 趋近于 1 且预设扩散方差减小。当扩散模型训练良好（$\sigma_u^2$ 充分小）且后验修持有界时，这些依赖调度的收缩主导误差上界。因此 $E_{t-1}^{\mathrm{up}}$ 在给定噪声调度下呈现总体下降趋势，与反向 SDE 的渐进去噪行为一致。

基于命题 4.2 的可处理上界，可进一步通过与传统 DF 方案（传输受损 token $\tilde Y$）比较来分析即插即用 DDIM 的性能。此处假设下行传输的压缩损失可忽略。

**推论 4.1（扩散激活阈值）.** 对 DF 方案，受损 token $\tilde Y$ 不经生成过程直接传至接收端，故均方误差为

$$
\mathrm{MSE}=\mathbb E\left[\left\|\tilde Y-Y\right\|_F^2\right]=K\left[\rho\left(\|\boldsymbol\mu\|_2^2+\operatorname{tr}(\boldsymbol\Sigma)\right)+(1-\rho)\operatorname{tr}(\boldsymbol\Sigma_q)\right].\tag{39}
$$

由（35）预测可超越 DF 方案的反向步为

$$
t_{\mathrm{threshold}}=\max\left\{t\in\{0,\ldots,T-1\}:E_t^{\mathrm{up}}<\mathrm{MSE}\right\}.\tag{40}
$$

**证明：** 由（17）的逆模型可直接算出（39）的 MSE，再把（35）的上界 $E_t^{\mathrm{up}}$ 与该 MSE 比较即得阈值步 $t_{\mathrm{threshold}}$。

**对 E2E 图像质量的影响。** 上述分析在 token 域进行。为考察恢复 token 如何影响 E2E 图像质量，我们把每个反向步的中间 token 表示送入图像恢复模块，得到

$$
\hat X_t=D_\psi(Y_t),\tag{41}
$$

再用学习感知图像块相似度（LPIPS）[35] 比较 $\hat X_t$ 与原图 $X$。

如图 4 所示，LPIPS 分数随扩散步数增加而下降。虽然推论 4.1 由 token 域的平方 Frobenius 范数导出，它仍能有效估计在图像质量上超越 DF 方案所需的扩散步数。原因在于：学习到的 token 被训练为保留图像中感知相关的信息，降低 token 域重建误差通常可改善视觉质量的保持。

## V. 卫星上的最优扩散步数

本节优化卫星在轨道能量限制下可执行的反向扩散步数。我们先建模收集的太阳能与扩散计算、下行转发的能耗，再推导最优扩散步数。

### A. 能量收集模型

**1) 太阳能收集。** 记物理轨道时间为 $\tau$，以区别于反向扩散索引 $t$。$\tau=0$ 时卫星位于离太阳最远处。收集的太阳能功率建模为 [36]

$$
P_h(\tau)=\begin{cases}0,&\tau\in\Omega_{\mathrm{ecl}},\\P_{\max}\cos\theta(\tau),&\text{其他},\end{cases}\tag{42}
$$

其中 $\Omega_{\mathrm{ecl}}$ 为地影区间，$P_{\max}$ 为太阳能板面积与能量转换效率决定的峰值功率，$\theta(\tau)$ 为太阳能板法线与太阳方向的夹角。采用单轴太阳跟踪 [36] 时，

$$
\theta(\tau)=\arccos\left(\sqrt{1-\cos^2\beta\cos^2(\tau\omega)}\right),\tag{43}
$$

其中 $\beta$ 为卫星轨道平面与阳光方向的夹角，$\omega$ 为卫星轨道角速度。

**2) 能量消耗。** 卫星能耗来自三部分：(i) 反向扩散计算，(ii) 下行转发，(iii) 其他卫星基础系统（如姿态控制与热管理）[37]。令 $E_{\mathrm{step}}$ 表示单次反向扩散步的能耗，一般可写为

$$
E_{\mathrm{step}}=P_{\mathrm{step}}\tau_{\mathrm{step}},\tag{44}
$$

其中 $P_{\mathrm{step}}$ 与 $\tau_{\mathrm{step}}$ 分别为单步的平均执行功率与执行时间。由（15）的下行速率，转发恢复 token 的下行传输时间为 $T_{\mathrm{dl}}^{\mathrm{tx}}=R_{s,\mathrm{dl}}/R_d$，其中 $T_{\mathrm{dl}}$ 为最大允许下行传输时长。令 $p_{\mathrm{dl}}$ 为卫星下行发射功率，则下行传输能量为

$$
E_{\mathrm{dl}}=p_{\mathrm{dl}}T_{\mathrm{dl}}^{\mathrm{tx}}=p_{\mathrm{dl}}\frac{R_{s,\mathrm{dl}}}{R_d}.\tag{45}
$$

令 $E_{\mathrm{base}}$ 表示其他卫星系统的能耗，则与扩散调度相关的总能耗为

$$
E_{\mathrm{cons}}(N)=NE_{\mathrm{step}}+E_{\mathrm{base}}+E_{\mathrm{dl}},\tag{46}
$$

其中 $N$ 为计划执行的反向扩散步数。

### B. 扩散步优化

令 $\tau_0$ 为上行业务译码后开始星上扩散的起始时间，$\tau_{\mathrm{end}}$ 为恢复 token 必须送达目的地的最晚时间。由于下行转发需 $T_{\mathrm{dl}}^{\mathrm{tx}}$ 秒，扩散的最大可执行时间为

$$
T_{\mathrm{exe}}=\left[\tau_{\mathrm{end}}-\tau_0-T_{\mathrm{dl}}^{\mathrm{tx}}\right]^+.\tag{47}
$$

在该区间内收集的能量为

$$
E_h^{\mathrm{exe}}=\int_{\tau_0}^{\tau_0+T_{\mathrm{exe}}}P_h(\tau)\,d\tau.\tag{48}
$$

令 $B_0$ 为 $\tau_0$ 时的电池能量，则在电池饱和与保留保护后可用于调度的能量为

$$
E_{\mathrm{av}}=\left[\min\left\{B_{\max},B_0+E_h^{\mathrm{exe}}\right\}-B_{\min}-E_{\mathrm{base}}-E_{\mathrm{dl}}\right]^+,\tag{49}
$$

其中 $B_{\max}$ 为电池容量、$B_{\min}$ 为保留电池能量。

根据推论 4.1，当反向过程达到 $t_{\mathrm{threshold}}$ 时，即插即用 DDIM 被预测为超越 DF 基线。因此所需最小扩散步数为 $N_{\mathrm{th}}=T-t_{\mathrm{threshold}}$。遵循注 4.1 的渐进去噪趋势，我们的目标是在区间 $[\tau_0,\tau_0+T_{\mathrm{exe}}]$ 内最大化可执行扩散步数，同时确保执行步数达到 $N_{\mathrm{th}}$：

$$
\max_N\ N\tag{50a}
$$

$$
\text{s.t.}\quad N\geq N_{\mathrm{th}},\tag{50b}
$$

$$
N\tau_{\mathrm{step}}\leq T_{\mathrm{exe}},\tag{50c}
$$

$$
NE_{\mathrm{step}}\leq E_{\mathrm{av}}.\tag{50d}
$$

第一个约束强制最小反向扩散步数；第二个约束为可执行时间约束；第三个约束为预留下行传输能量后的能量因果约束。该问题有闭式解：

$$
N^{\star}=\begin{cases}\min\left\{T,\left\lfloor\dfrac{T_{\mathrm{exe}}}{\tau_{\mathrm{step}}}\right\rfloor,\left\lfloor\dfrac{E_{\mathrm{av}}}{E_{\mathrm{step}}}\right\rfloor\right\},&N_{\max}^{\mathrm{exe}}\geq N_{\mathrm{th}},\\[8pt]0,&\text{其他},\end{cases}\tag{51}
$$

其中

$$
N_{\max}^{\mathrm{exe}}=\min\left\{T,\left\lfloor\frac{T_{\mathrm{exe}}}{\tau_{\mathrm{step}}}\right\rfloor,\left\lfloor\frac{E_{\mathrm{av}}}{E_{\mathrm{step}}}\right\rfloor\right\}.\tag{52}
$$

当 $N_{\max}^{\mathrm{exe}}<N_{\mathrm{th}}$ 时，当前能量与时间约束下无法达到预测阈值。此时扩散过程不可行，$N^{\star}=0$，系统退化为 DF 方案。

## VI. 实验结果

### A. 实验设置

**1) 模型架构。** 我们用稳定潜扩散模型 [16] 的第一阶段卷积自编码器实现 token 化编解码器；对所提即插即用 DDIM 算法，使用稳定潜扩散模型 [16] 的预训练噪声预测器。所有神经网络模块在 PyTorch [38] 中实现。NVIDIA A100 GPU 作为地面性能分析平台，用于测量扩散工作负载的执行成本。该设置合理，因为 Starcloud [10] 等近期在轨 AI 计算平台已采用具有更高 AI 吞吐的 H100 级 GPU。

**2) 数据集。** 实验在 AFHQ 数据集 [39] 上进行，这是用于高质量图像合成的大规模图像数据集，含 15,000 幅原始分辨率 $512\times512$ 的图像。我们用训练集估计 token 统计量 $\{\boldsymbol\mu,\boldsymbol\Sigma\}$，所有报告结果在验证集上评估；并在 Kodak 数据集 [40] 上进一步验证视觉性能。

**3) 星上部署讨论。** 去噪 U-Net 含 8.5952 亿参数，以 FP16 权重计约占用 1.60 GiB。对 $512\times512$ 图像，使用自动混合精度（AMP）时每个反向步在 A100 上约需 167 ms。这些需求与 Starcloud-1 等新兴高性能轨道平台兼容，而资源受限的 CubeSat 则需要模型压缩。

**4) 参数设置。** 轨道参数与计算—能量设置参考近期 AI 计算卫星工作（如 Starcloud）与 NASA 微小卫星设置 [10]、[37]，汇总于表 I。源速率由量化步长 $s$ 控制，误包率按（11）的有限块长理论计算。小尺度衰落服从 Rician 分布、因子为 1，即 $g_m\sim\mathcal{CN}(\sqrt{1/2},1/2)$。下行传输假设无差错。包头开销约占总源比特的 20%。上行传输速率约 18 kb/s，下行传输速率依信道条件可达数百 kHz。下行压缩比特率设为 0.4 bpp。

**5) 基准方案。** 我们不使用像素级 MSE，而采用 LPIPS 指标评价接收图像的感知质量。所提 SpaceDiffusion 与以下方案比较。

- **JPEG2000+DF**：源图像用 JPEG2000 [41] 压缩，经相同信道码保护，在卫星处译码后不进行生成恢复直接转发至目的端。
- **Tokenization+DF**：该方案使用与 SpaceDiffusion 完全相同的第一阶段自编码器、变换编码、量化、熵编码、打包与信道编码；信道译码后，受损潜 token 不经星上生成恢复直接转发。
- **DPS+GF**：作为生成式基线，我们在卫星处采用传统 DPS 算法 [17] 做 token 生成。由于 DPS 原本用于图像域逆问题，我们在不改变其主要结构的前提下重新设计为 token 域生成。

### B. E2E 时延比较

首先考察所提 SpaceDiffusion 在不同卫星高度下的 E2E 时延。俯仰角设为 $5^\circ$ 以研究卫星通信较差的信道条件，误包率设为 0.1。所考虑的 DF 中继采用 NB-IoT NTN 设定下的单进程停止—等待重传协议：当上行包被译码时，卫星向源反馈 ACK/NACK，源重传丢失包直至译码成功。因此 DF 方案的时延显式包含重传带来的额外传输时间与 ACK/NACK 引起的 RTT 惩罚。

图 5 在约 0.2 LPIPS 的相同目标质量下比较各方案。SpaceDiffusion 在所考虑卫星高度上维持约 6—7 s/图像 的近恒定延迟，因为它避免了上行重传与 ACK/NACK 反馈；相反，DF 基线随高度增加而变慢，JPEG2000+DF 在高空超过 300 s/图像。因此 SpaceDiffusion 相对 DF 基线取得 4—50 倍的时延降低，也快于需要 100 而非 20 个反向步的 DPS+GF。

图 5(b) 的分解解释了这些增益。生成式恢复使 SpaceDiffusion 在相同感知质量下使用比 JPEG2000 低约 6 倍的 bpp；它还把 Tokenization+DF 中 7.8 s/图像 的 RTT 分量替换为 3.9 s/图像 的本地扩散计算，使时延降低约 40%。此外，使用 20 而非 100 个反向步把 DPS 计算时延从 23.5 s/图像 降至 3.9 s/图像。值得注意的是，所提方案的计算时延可通过更轻量模型与并行图像处理进一步降低。

### C. 重建性能比较

本小节比较 SpaceDiffusion 与基准方案的重建性能。量化步长设为 0.8，bpp 约 0.1，所有方案的带宽比为 0.49；卫星高度设为 600 km，太阳能足以支持扩散计算。

图 6 给出 LPIPS 随误包率的变化（禁用重传协议以评估各方案的鲁棒性能）。此处省略 JPEG2000 方案，因其鲁棒性能远差于其他方案。可以看到，所有基准方案在严重丢包下都退化，但 SpaceDiffusion 始终取得最低 LPIPS。例如在误包率 0.1 时，SpaceDiffusion 的 LPIPS 约 0.22，而 GF with DPS 与无生成 token 化分别约 0.30 与 0.39。性能差距在中高误码区更明显，因为非生成 token 化基线受未恢复 token 擦除影响。这表明所提 SpaceDiffusion 能有效恢复缺失内容，在无损上行信道下改善 E2E 图像质量。

图 7 进一步评估性能随上行发射功率的变化。随发射功率增加，信道更可靠，所有基于 token 的方案 LPIPS 都下降。所提 SpaceDiffusion 以低得多的发射功率实现高质量图像传输。例如目标 LPIPS 约 0.25 时，SpaceDiffusion 相对非生成 token 化基线节省约 15 dB 上行发射功率。这种功率节省使所提方案特别适合功率受限的 NTN IoT 终端与手持设备。

为考察生成保真度与潜在幻觉，图 8 与图 9 给出 AFHQ 与 Kodak 数据集在上行速率约 0.11 bpp、误包率 0.1 下的重建示例。带重传的 JPEG2000 产生可见模糊，而无生成 token 化留下由包擦除造成的结构化空洞；DPS 部分填补缺失区域但出现纹理不一致与残留伪影。相比之下，SpaceDiffusion 产生更连贯的结构与纹理，并在两个数据集上取得最低 LPIPS。虽然生成的局部细节可能与源不完全一致，但 SpaceDiffusion 有助于保留足够的语义信息供人理解。

### D. 能量受限场景的讨论

最后考察当卫星能量供给受轨道光照约束时 SpaceDiffusion 是否仍然实用。图 10(a) 比较了晨昏太阳同步轨道（DDSSO）与非太阳同步轨道（Non-SSO）。DDSSO 情形有近乎连续的光照，收集功率接近峰值；此处最大扩散步数设为 $N=40$，卫星高度约 600 km，最大可执行时间与初始电池容量分别设为 8 s 与 0 mAh。

图 10(a) 表明 DDSSO 的近乎连续光照支持完整的 $N^{\star}=40$ 个反向步，而 Non-SSO 情形只在可用能量足以支持至少 $N_{\mathrm{th}}$ 步时才执行扩散，否则置 $N^{\star}=0$ 并回退到 DF。该阈值策略避免了无效的部分生成。如图 10(b) 所示，更大的太阳 beta 角缩短地影并增加可用于生成的能量。优化策略因此在能量稀缺情形把平均 LPIPS 从约 0.36 降至 0.32，在 beta 角足够大时降至 0.24，同时避免无门控生成产生的较差中间重建。

## VII. 结论

本文提出 SpaceDiffusion 框架，利用星上计算资源在受限卫星链路上实现高效图像传输。一个有趣的洞见是：信道失真模型可作为插入的"提示"来引导扩散重建。因此 GF 框架可复用为图像生成任务训练的成熟潜扩散模型，而无需信道特定重训练。仿真结果进一步表明，星上生成显著降低 E2E 时延，因为它用生成式重建替代了反馈驱动的上行重传；这一时延降低尤其有利于时延敏感的 IoT 与手持应用。

若干方向值得进一步研究：SpaceDiffusion 可扩展到多用户与多卫星网络，通过通信、计算与能量的联合分配实现；为缓解生成幻觉，未来可研究对语义重要 token 的不等错误保护；其他有前景的方向包括面向视频、音频与感知数据的多模态 GF，以及面向实际星上部署的硬件感知加速。

## 附录

### A. 命题 4.1 的证明

令 $a_n\in\{0,1\}$ 表示 $A$ 第 $n$ 行的公共元素，即

$$
[A]_{n,d}=a_n,\qquad\forall d\in\{1,\ldots,D\}.\tag{53}
$$

并令 $\tilde{\mathbf y}_n$ 与 $\check{\mathbf y}_{t,n}$ 分别表示 $\tilde Y$ 与 $\check Y_t$ 的第 $n$ 行。在（22）的伪逆高斯近似下，每行满足

$$
\mathbf y_n\mid Y_t\approx\mathcal N\left(\check{\mathbf y}_{t,n},r_t^2\mathbf I_D\right).\tag{54}
$$

根据（17）的逆模型，逐行观测模型为

$$
\tilde{\mathbf y}_n=\begin{cases}\mathbf y_n+\mathbf q_n,&a_n=1,\\\mathbf 0,&a_n=0,\end{cases}\tag{55}
$$

其中 $\mathbf q_n\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma_q)$。因此当 $a_n=1$ 时，

$$
\begin{aligned}
p_t\left(\tilde{\mathbf y}_n\mid Y_t\right)&=\int p_t\left(\mathbf y_n\mid Y_t\right)p\left(\tilde{\mathbf y}_n\mid\mathbf y_n\right)d\mathbf y_n\\
&\approx\int\mathcal N\left(\mathbf y_n;\check{\mathbf y}_{t,n},r_t^2\mathbf I_D\right)\mathcal N\left(\tilde{\mathbf y}_n;\mathbf y_n,\boldsymbol\Sigma_q\right)d\mathbf y_n\\
&=\mathcal N\left(\tilde{\mathbf y}_n;\check{\mathbf y}_{t,n},r_t^2\mathbf I_D+\boldsymbol\Sigma_q\right).
\end{aligned}\tag{56}
$$

当 $a_n=0$ 时，$\tilde{\mathbf y}_n=\mathbf 0$ 为确定性，故只贡献与 $Y_t$ 无关的常数。因此，在相差与 $Y_t$ 无关的可加常数 $c$ 的意义下，

$$
\log p_t\left(\tilde Y\mid Y_t\right)=c-\frac12\sum_{n=1}^{K}a_n\left(\tilde{\mathbf y}_n-\check{\mathbf y}_{t,n}\right)\left(r_t^2\mathbf I_D+\boldsymbol\Sigma_q\right)^{-1}\left(\tilde{\mathbf y}_n-\check{\mathbf y}_{t,n}\right)^{\top}.\tag{57}
$$

对 $\check Y_t$ 求导得

$$
\nabla_{\check Y_t}\log p_t\left(\tilde Y\mid Y_t\right)=A\odot\left[\left(\tilde Y-\check Y_t\right)\left(r_t^2\mathbf I_D+\boldsymbol\Sigma_q\right)^{-1}\right].\tag{58}
$$

再由向量化形式的链式法则，

$$
\operatorname{vec}\left(\nabla_{Y_t}\log p_t\left(\tilde Y\mid Y_t\right)\right)=\left(\frac{\partial\operatorname{vec}\left(\check Y_t\right)}{\partial\operatorname{vec}\left(Y_t\right)}\right)^{\top}\operatorname{vec}\left(\nabla_{\check Y_t}\log p_t\left(\tilde Y\mid Y_t\right)\right)=\mathbf J_t^{\top}\operatorname{vec}\left(G_t\right).\tag{59}
$$

等价地，$\nabla_{Y_t}\log p_t(\tilde Y\mid Y_t)=\operatorname{unvec}\left(\mathbf J_t^{\top}\operatorname{vec}(G_t)\right)$。把它代入（20）得

$$
\nabla_{Y_t}\log p_t\left(Y_t\mid\tilde Y\right)\approx S_\Theta(Y_t,t)+\operatorname{unvec}\left(\mathbf J_t^{\top}\operatorname{vec}(G_t)\right).\tag{60}
$$

即得命题 4.1 的结论，证毕。

### B. 命题 4.2 的证明

在确定性 DDIM 设定 $\sigma_t=0$ 下，

$$
Y_{t-1}=\sqrt{\bar\alpha_{t-1}}\,\check Y_t+\sqrt{1-\bar\alpha_{t-1}}\,\hat\epsilon_{\Theta,t}+\delta_tL_t.\tag{61}
$$

令 $e_t=Y_{t-1}^{\mathrm{ddim}}-Y$，则重建误差可计算为

$$
\begin{aligned}
E_{t-1}&=\mathbb E\left[\left\|Y_{t-1}-Y\right\|_F^2\right]=\mathbb E\left[\left\|e_t+\delta_tL_t\right\|_F^2\right]\\
&=\mathbb E\left[\left\|e_t\right\|_F^2\right]+2\delta_t\mathbb E\left[\left\langle e_t,L_t\right\rangle\right]+\delta_t^2\mathbb E\left[\left\|L_t\right\|_F^2\right]\\
&\overset{(a)}{\leq}\left(\sqrt{\mathbb E\left[\left\|e_t\right\|_F^2\right]}+\delta_t\sqrt{\mathbb E\left[\left\|L_t\right\|_F^2\right]}\right)^2\\
&\overset{(b)}{\approx}\left(\sqrt{a_t^{\mathrm{ddim}}}+\delta_t\sqrt{\mathbb E\left[\left\|L_t\right\|_F^2\right]}\right)^2\overset{(c)}{\lesssim}\left(\sqrt{a_t^{\mathrm{ddim}}}+\delta_t\kappa\sqrt{\chi_t}\right)^2,
\end{aligned}\tag{62}
$$

其中 $\langle\cdot,\cdot\rangle$ 为 Frobenius 内积。各步理由如下。

- **步 (a)**：由 Cauchy–Schwarz 不等式 [28] 有

$$
\left|\mathbb E\left[\left\langle e_t,L_t\right\rangle\right]\right|\leq\sqrt{\mathbb E\left[\left\|e_t\right\|_F^2\right]\mathbb E\left[\left\|L_t\right\|_F^2\right]}.\tag{63}
$$

- **步 (b)**：由（29）与近似 1，传统 DDIM 误差可写为

$$
e_t=\frac{\sqrt{\bar\alpha_{t-1}}}{\sqrt{\bar\alpha_t}}Y_t-Y+\left(\sqrt{1-\bar\alpha_{t-1}}-\sqrt{\frac{\bar\alpha_{t-1}\left(1-\bar\alpha_t\right)}{\bar\alpha_t}}\right)\left(\epsilon_t+U_t\right).\tag{64}
$$

用（25）的前向轨迹近似

$$
Y_t\approx\sqrt{\bar\alpha_t}Y+\sqrt{1-\bar\alpha_t}\,\epsilon_t,\tag{65}
$$

代入（64）得

$$
e_t\approx\left(\sqrt{\bar\alpha_{t-1}}-1\right)Y+\sqrt{1-\bar\alpha_{t-1}}\,\epsilon_t+\left(\sqrt{1-\bar\alpha_{t-1}}-\sqrt{\frac{\bar\alpha_{t-1}\left(1-\bar\alpha_t\right)}{\bar\alpha_t}}\right)U_t.\tag{66}
$$

由于 $\epsilon_t$ 与 $U_t$ 零均值且与 $Y$ 独立，取期望即得 $\mathbb E[\|e_t\|_F^2]\approx a_t^{\mathrm{ddim}}$（见（38））。

- **步 (c)**：对 $G_t$ 的第 $n$ 行 $\mathbf g_{t,n}$，命题 4.1 给出

$$
\mathbf g_{t,n}=a_n\left(\tilde{\mathbf y}_n-\check{\mathbf y}_{t,n}\right)\mathbf B_t=a_n\left(\mathbf q_n+\sqrt{\frac{1-\bar\alpha_t}{\bar\alpha_t}}\,u_{t,n}\right)\mathbf B_t,\tag{67}
$$

其中 $a_n=1$ 时 $\tilde{\mathbf y}_n=\mathbf y_n+\mathbf q_n$，且 $\check{\mathbf y}_{t,n}\approx\mathbf y_n-\sqrt{(1-\bar\alpha_t)/\bar\alpha_t}\,u_{t,n}$。由于 $a_n$、$\mathbf q_n$、$u_{t,n}$ 相互独立，$\mathbb E[\|G_t\|_F^2]=\chi_t$。另外由 $L_t=\operatorname{unvec}(\mathbf J_t^{\top}\operatorname{vec}(G_t))$ 与 $\|\mathbf J_t\|_2\leq\kappa$ 得

$$
\|L_t\|_F^2=\left\|\mathbf J_t^{\top}\operatorname{vec}\left(G_t\right)\right\|_2^2\leq\|\mathbf J_t\|_2^2\|G_t\|_F^2\leq\kappa^2\|G_t\|_F^2,\tag{68}
$$

取期望即得 $\mathbb E[\|L_t\|_F^2]\leq\kappa^2\chi_t$，证毕。

## 图注与表注

### 表 I：默认仿真参数（原 PDF 第 9 页）

| 参数 | 默认取值 |
|---|---|
| DDIM 参数 | $\sigma_t=0$、$\eta=0.8$ |
| 包长 | 2048 |
| 上行信道编码速率 | 0.1 |
| 载波频率 | 2 GHz |
| 带宽 | 180 kHz |
| 上行发射功率 | 23 dBm |
| 下行发射功率 | 30 dBm |
| 设备发射/接收天线增益 | 0 dBi |
| 卫星接收天线增益 | 15 dBi |
| 卫星发射天线增益 | 25 dBi |
| 仰角 | $30^\circ$ |
| 太阳能收集峰值功率 | 800 W |
| 计算功率 | 200 W |
| 卫星基础能耗 | 200 W |

### 图注

**图 1（原 PDF 第 1—2 页）：** 卫星生成转发（GF）方案与传统译码转发（DF）方案比较。(a) DF 要求上下行速率相等；(b) GF 允许上下行速率不对称：卫星利用 GenAI 在轨道上恢复缺失特征/token，从而以低速率上行支撑更丰富的下行数据。（原文抽取中出现两段图 1 图注文本，以上为合并后的完整描述。）

**图 2（原 PDF 第 3 页）：** 卫星 GF 系统框架：地面发射端完成 token 化与数字编码，经上行传输至卫星；卫星做数字译码、在轨生成与数字编码，再经下行传输至地面接收端，最终完成图像恢复。

**图 3（原 PDF 第 6 页）：** 所提基于后验的扩散理论示意。(a) 含与不含插入项 $L_t$ 的反向过程比较；(b) 即插即用 DDIM 算法反向过程的计算流：接收 token $\tilde Y$、包错误掩码 $A$、压缩损失协方差 $\boldsymbol\Sigma_q$ 与扩散步 $t$ 一同进入修正项。

**图 4（原 PDF 第 8 页）：** LPIPS 分数随反向扩散步数的变化。总步数 $T$、平均误包率 $\rho$ 与量化步长 $s$ 分别设为 40、0.1 与 1。

**图 5（原 PDF 第 9 页）：** E2E 时延比较（所有方案 LPIPS 约 0.2）。(a) 时延随卫星高度的变化（800 km—36,000 km）；(b) 2000 km 高度下的时延分解（通信、RTT 与计算时延）。

**图 6（原 PDF 第 10 页）：** 重建质量随误包率的变化（LPIPS）。

**图 7（原 PDF 第 10 页）：** 重建质量随上行发射功率的变化（LPIPS 对 dBm）。

**图 8（原 PDF 第 11 页）：** AFHQ 数据集上的视觉重建示例（无 GF、真值、SpaceDiffusion、JPEG2000+DF、GF with DPS，并标注各自 LPIPS）。

**图 9（原 PDF 第 12 页）：** Kodak 数据集 [40] 上的视觉重建示例（标注各方案 LPIPS）。

**图 10（原 PDF 第 12 页）：** 能量受限的扩散调度。(a) 轨道时间上的太阳能功率（DDSSO $85^\circ$ 与 Non-SSO $30^\circ$）与优化后的扩散步数 $N^{\star}$（含阈值 $N_{\mathrm{th}}$）；(b) 平均 LPIPS 随太阳 beta 角的变化（优化调度、未优化与无生成三种设置）。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

[1] S. Meng, S. Wu, J. Zhang, J. Cheng, H. Zhou, and Q. Zhang, "Semantics-empowered space-air-ground-sea integrated network: New paradigm, frameworks, and challenges," IEEE Communications Surveys & Tutorials, vol. 27, no. 1, pp. 140–183, June 2024.

[2] D. Wen, S. Xie, X. Cao, Y. Cui, J. Xu, Y. Shi, and S. Cui, "Integrated sensing, communication, and computation for over-the-air federated edge learning," IEEE Trans. Wire. Commun., vol. 25, no. 1, pp. 2748–2762, Aug. 2025.

[3] G. Qu, Q. Chen, W. Wei, Z. Lin, X. Chen, and K. Huang, "Mobile edge intelligence for large language models: A contemporary survey," IEEE Commun. Sur. Tut., vol. 27, no. 6, pp. 3820–3860, Jan. 2025.

[4] O. Kodheli, E. Lagunas, N. Maturo, S. K. Sharma, B. Shankar, J. F. M. Montoya, J. C. M. Duncan, D. Spano, S. Chatzinotas, S. Kisseleff, J. Querol, L. Lei, T. X. Vu, and G. Goussetis, "Satellite communications in the new space era: A survey and future challenges," IEEE Commun. Surveys Tuts., vol. 23, no. 1, pp. 70–109, 2021.

[5] Z. Wang, Q. Zeng, H. Zheng, and K. Huang, "Revisiting outage for edge inference systems," IEEE Trans. Comun., vol. 74, pp. 10 111–10 125, June 2026.

[6] 3GPP, "Study on new radio (NR) to support non-terrestrial networks," Tech. Rep. TR 38.811, V15.4.0, Sept. 2020.

[7] R. B. Sørensen, H. K. Møller, and P. Koch, "5G NB-IoT via low density LEO constellations," in Proc. Small Satellite Conf., 2021. [Online]. Available: https://arxiv.org/abs/2108.06172

[8] A. Talgat, M. A. Kishk, and M.-S. Alouini, "Stochastic geometry-based uplink performance analysis of iot over leo satellite communication," IEEE Trans. Aerosp. Electron. Syst., vol. 60, no. 4, pp. 4198–4213, Aug. 2024.

[9] Z. Wang, H. Yang, M. Sheng, K. B. Letaief, and K. Huang, "SpaceMoE: Realizing distributed mixture-of-experts inference over space networks," arXiv preprint arXiv:2605.00515, May 2026.

[10] E. Feilden, A. Oltean, and P. Johnston, "Why we should train AI in space," Lumen Orbit, Tech. Rep. White Paper v1.03, Sep. 2024, [Online]. Available: https://starcloudinc.github.io/wp.pdf.

[11] Zhejiang Lab, "Three-body computing constellation," [Online]. Available: https://en.zhejianglab.com/news/202507/t20250716 4165.shtml, 2025.

[12] Z. Chen, B. Di, and Z. Han, "Breaking the kbps uplink barrier: Semantic-guided generative satellite communications for video transmission," IEEE Trans. Commun., pp. 1–1, June 2026.

[13] 3GPP, "Solutions for NR to support non-terrestrial networks (NTN)," Technical Report TR 38.821 V16.2.0, Mar. 2023.

[14] B. Makki, T. Svensson, and M. Zorzi, "Finite block-length analysis of the incremental redundancy harq," IEEE Wireless Commun. Lett., vol. 3, no. 5, pp. 529–532, Oct. 2014.

[15] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proc. Int. Conf. Learn. Represent. (ICLR), May 2021, pp. 1–20.

[16] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, "High-resolution image synthesis with latent diffusion models," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit., June 2022, pp. 10 684–10 695.

[17] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, "Diffusion posterior sampling for general noisy inverse problems," in Proc. Int. Conf. Learn. Represent., 2023.

[18] S. Wang, J. Dai, X. Qin, K. Yang, K. Niu, and P. Zhang, "ResiComp: Loss-resilient image compression via dual-functional masked visual token modeling," IEEE Trans. Circuits Syst. Video Technol., vol. 35, no. 7, pp. 7181–7195, Jul. 2025.

[19] L. Qiao, M. B. Mashhadi, Z. Gao, R. Tafazolli, M. Bennis, and D. Niyato, "Token communications: A large model-driven framework for cross-modal context-aware semantic communications," IEEE Wireless Commun., vol. 32, no. 5, pp. 80–88, Oct. 2025.

[20] J. Huang, Q. Zeng, H. Du, and K. Huang, "Generative feature imputing—a technique for error-resilient semantic communication," IEEE Trans. Wireless Commun., vol. 25, pp. 18 410–18 423, 2026.

[21] P. Jiang, C.-K. Wen, X. Li, S. Jin, and G. Y. Li, "Semantic satellite communications based on generative foundation model," IEEE J. Sel. Areas Commun., vol. 43, no. 7, pp. 2431–2445, Jul. 2025.

[22] H. Lee, S. Kim, H. Kim, J. Park, J. Choi, and D. Oh, "Generative semantic communication for efficient utilization of satellite resources in 6g," Inter. J. Sate. Commun. Net., vol. 44, no. 4, pp. 368–377, Jul. 2026.

[23] Y. Shi, J. Zhu, C. Jiang, L. Kuang, and K. B. Letaief, "Satellite edge artificial intelligence with large models: Architectures and technologies," Sci. China Inf. Sci., vol. 68, no. 7, p. 170302, 2025.

[24] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, "Score-based generative modeling through stochastic differential equations," in Proc. Int. Conf. Learn. Represent. (ICLR), vol. 1, May 2021, pp. 1–36.

[25] J. J. Y. Huang and P. M. Schultheiss, "Block quantization of correlated gaussian random variables," IEEE Trans. Commun. Syst., vol. 11, no. 3, pp. 289–296, Sep. 1963.

[26] R. M. Gray and D. L. Neuhoff, "Quantization," IEEE Transactions on Information Theory, vol. 44, no. 6, pp. 2325–2383, 1998.

[27] D. A. Huffman, "A method for the construction of minimum-redundancy codes," Proc. IRE, vol. 40, no. 9, pp. 1098–1101, Sep. 1952.

[28] V. K. Rohatgi and A. M. E. Saleh, An introduction to probability and statistics. John Wiley & Sons, 2015.

[29] J. Huang, K. Yuan, C. Huang, and K. Huang, "D2-JSCC: Digital deep joint source-channel coding for semantic communications," IEEE J. Sel. Areas Commun., vol. 43, no. 4, pp. 1246–1261, Jan. 2025.

[30] Y. Polyanskiy, H. V. Poor, and S. Verdú, "Channel coding rate in the finite blocklength regime," IEEE Trans. Inf. Theory, vol. 56, no. 5, pp. 2307–2359, 2010.

[31] W. W. Peterson and D. T. Brown, "Cyclic codes for error detection," Proc. IRE, vol. 49, no. 1, pp. 228–235, Jan. 1961.

[32] J. A. Guerrero-Colón, L. Mancera, and J. Portilla, "Image restoration using space-variant gaussian scale mixtures in overcomplete pyramids," IEEE Trans. Image Process., vol. 17, no. 1, pp. 27–41, Jan. 2008.

[33] J. Song, A. Vahdat, M. Mardani, and J. Kautz, "Pseudoinverse-guided diffusion models for inverse problems," in Proc. Int. Conf. Learn. Represent. (ICLR), vol. 1, May 2023, pp. 1–30.

[34] D. J. Higham, "An algorithmic introduction to numerical simulation of stochastic differential equations," SIAM Rev., vol. 43, no. 3, pp. 525–546, Sep. 2001.

[35] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang, "The unreasonable effectiveness of deep features as a perceptual metric," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR), Jun. 2018, pp. 586–595.

[36] Y. Yang, M. Xu, D. Wang, and Y. Wang, "Towards energy-efficient routing in satellite networks," IEEE J. Sel. Areas Commun., vol. 34, no. 12, pp. 3869–3886, Dec. 2016.

[37] NASA Small Spacecraft Systems Virtual Institute, "State-of-the-art of small spacecraft technology: Power subsystems (chapter 3)," https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/, 2026, NASA Ames Research Center, Small Spacecraft Technology State-of-the-Art Report; Last updated: May 14, 2026.

[38] A. Paszke, S. Gross, F. Massa, A. Lerer, J. Bradbury, G. Chanan, T. Killeen, Z. Lin, N. Gimelshein, L. Antiga et al., "Pytorch: An imperative style, high-performance deep learning library," Advances neural inf. process. sys., vol. 32, 2019.

[39] Y. Choi, Y. Uh, J. Yoo, and J.-W. Ha, "Stargan v2: Diverse image synthesis for multiple domains," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit., 2020, pp. 8188–8197.

[40] Eastman Kodak Company, "Kodak photocd dataset," URL: http://r0k.us/graphics/kodak/, 1993.

[41] V. Sanchez and M. Mandal, "Robust transmission of jpeg2000 images over noisy channels," IEEE Trans. Consum. Electron., vol. 48, no. 3, pp. 451–456, Aug. 2002.

**本页范围与校对状态：** 本页依据 arXiv:2609.20899v1（cs.IT，2026-09-17，14 页）完成全文中文翻译：摘要、索引词、第 I—VII 节（含 II 的四阶段流程、III-A—III-E、IV-A—IV-C、V-A—V-B、VI-A—VI-D、VII）、图 1—10 中文图注、表 I 逐格转录、附录 A—B（命题 4.1 与 4.2 的完整证明）、参考文献 [1]—[41] 英文原条目（按原编号）均按原文结构录入。编号公式 (1)—(68) 按原文保留（含（50a）—（50d）约束分项、（53）—（60）附录 A、（61）—（68）附录 B）。表 I 已用 PDF 第 9 页渲染图逐格核对一致。**逐句逐式终校未做**；图内重建图像与曲线未作数字化读取，只转录图注与正文给出的关键数值（如 LPIPS≈0.2 目标质量、6—7 s/图像、4—50 倍时延降低、约 15 dB 功率节省等）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①原文抽取文本中出现两段图 1 图注（"Fig. 1: Comparison..." 与 "Fig. 1. The GF scheme..."），本页合并为一处并加注说明；②原文式（51）分情形解中的 $N^{\star}$ 与式（52）的 $N_{\max}^{\mathrm{exe}}$ 定义在抽取中排版相近，已按渲染语义转录（表 I 所在页渲染图核对一致）；③论文注明已提交 IEEE 供发表、版权可能转移，已照录。原文为双栏 IEEE 格式，无作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
