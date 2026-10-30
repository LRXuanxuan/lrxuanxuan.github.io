---
layout: page
title: "MultiCE-Flow：基于流匹配多模态扩散模型的信道估计（全文译稿）｜中文全文译文"
permalink: /papers/translations/2026-10-12-multice-flow/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原论文（arXiv）](https://arxiv.org/abs/2603.13440)

> **翻译状态：全文完成。** 对应 2603.13440v1，原文共 6 页。正文、图题、公式及结论均已译出；参考文献保留原文英文书目信息，图像不另行复制。为便于核对，保留原始公式编号。

# 基于流匹配的多模态扩散模型改进信道估计

**英文标题：** Improving Channel Estimation via Multimodal Diffusion Models with Flow Matching  
**作者：** Xiaotian Fan、Xingyu Zhou、Le Liang、Xiao Li、Shi Jin  
**原文版本：** arXiv:2603.13440v1，2026 年 3 月 13 日  
**机构：** 东南大学信息科学与工程学院；紫金山实验室（Le Liang）

## 摘要

深度生成模型通过学习复杂的信道分布，为传统信道估计提供了一种强有力的替代方案。本文融合现代感知辅助网络中丰富的环境信息，提出 MultiCE-Flow：一种基于流匹配（Flow Matching）和扩散 Transformer（Diffusion Transformer，DiT）的多模态信道估计框架。本文设计专门的多模态感知模块，将激光雷达（LiDAR）、摄像机和位置信息融合为语义条件，同时将稀疏导频作为结构条件。这些条件共同引导 DiT 主干网络重构高保真信道。与标准扩散模型不同，本文利用流匹配学习从噪声到数据的线性轨迹，实现高效的单步采样。通过利用环境语义信息，该方法缓解了稀疏导频条件下估计问题的病态性。大量实验表明，MultiCE-Flow 持续优于传统基线和已有生成模型。特别地，该方法对分布外场景和不同导频密度表现出更强的鲁棒性，适用于环境感知通信系统。

**关键词：** 信道估计；多模态；扩散 Transformer；流匹配。

## I. 引言

大规模多输入多输出（Massive Multiple-Input Multiple-Output，Massive MIMO）系统高度依赖准确的信道状态信息（Channel State Information，CSI），才能实现预期的频谱效率增益 [1]。然而，通过导频传输获取准确 CSI 会产生显著开销，对实际部署构成重大挑战。在导频受限场景中，传统最小二乘（Least Squares，LS）估计在低信噪比（Signal-to-Noise Ratio，SNR）条件下性能较差。线性最小均方误差（Linear Minimum Mean-Square Error，LMMSE）估计虽然性能更好，但需要准确的信道协方差矩阵，因此计算复杂度较高。利用信道在角度域或时延域中的稀疏性能够减少导频开销，但真实信道的复杂特征难以由过度简化的稀疏性假设充分表征。

为了克服上述局限，近期研究转向能够直接从数据建模高维分布的数据驱动方法 [2]。其中，深度生成模型已经成为有力工具。扩散模型（Diffusion Model，DM）因能够学习复杂先验而被广泛用于无线信道估计。早期研究 [3] 使用基于分数的模型利用学习到的信道先验。针对数据匮乏与鲁棒推断问题，文献 [4] 提出先验辅助估计框架，通过后验采样从含噪或量化测量中恢复高维信道。变分推断方法进一步使用预训练的扩散先验推断信道后验分布 [5]。为了减少计算开销，文献 [6]、[7] 提出轻量级扩散架构，使推理更快，能够用于实时场景。

然而，多数基于扩散模型的估计器只依赖从导频到信道的映射，在很大程度上忽略物理传播环境。虽然近期研究已经开始探索环境与无线信道之间的关联 [8]、[9]，进一步发展仍需要向更鲁棒的框架转变：深度融合多模态环境语义，并采用基础模型架构。

一方面，无线信道在根本上由物理传播过程决定。多模态传感器（LiDAR、摄像机）以及定位信息能够获取塑造这些信道的环境几何特征。通过融合这些模态，可以提取引导信道重构的语义先验，使得即使导频极度稀疏，也能准确推断。

另一方面，扩散模型已经由 U-Net 演进为基于 Transformer 的基础模型，如 PixArt-α 和 Stable Diffusion 3 [10]、[11]。这些模型通过以文本提示为条件，产生高保真生成结果。受此启发，本文将信道估计表述为条件生成任务：稀疏导频提供结构指导，多模态数据则作为重构所需的语义提示。为此，本文使用流匹配 [12]，学习从噪声到数据的直接传输路径，以获得更快、更高质量的推断。

基于这一思想，本文提出利用扩散 Transformer 和流匹配的多模态信道估计框架 MultiCE-Flow。我们设计可扩展的扩散 Transformer，将异构模态与稀疏导频融合。通过学习将噪声直接传输至信道分布的速度场，该方法能够进行快速的单步估计。实验表明，所提方法优于传统和生成式学习基线，并对分布外（Out-of-Distribution，OOD）场景具有更强鲁棒性。

## II. 系统模型与多模态数据

### A. 系统模型

本文考虑一个下行车辆到基础设施（Vehicle-to-Infrastructure，V2I）的大规模 MIMO 正交频分复用（OFDM）系统。作为基站的路侧单元（Roadside Unit，RSU）配备具有 $N_t$ 根发射天线的均匀线性阵列（Uniform Linear Array，ULA）；每辆联网自动驾驶车辆（Connected and Autonomous Vehicle，CAV）均配备具有 $N_r$ 根接收天线的 ULA。系统使用 $N_c$ 个子载波，子载波间隔为 $\Delta f$。第 $k$ 个子载波（$k=0,\ldots,N_c-1$）上的频域信道矩阵 $\mathbf H[k]\in\mathbb C^{N_r\times N_t}$ 建模为 $L$ 条传播路径的叠加：

$$
\mathbf H[k]=\sum_{l=1}^{L}\mathbf A_l e^{-j2\pi k\Delta f\tau_l}. \tag{1}
$$

其中，$L$ 表示多径分量数量。对于第 $l$ 条路径，$\mathbf A_l\in\mathbb C^{N_r\times N_t}$ 是复数路径增益矩阵，$\tau_l$ 是传播时延。

在导频发送阶段，RSU 在子载波子集 $\mathcal P\subset\{0,1,\ldots,N_c-1\}$ 上发送导频符号。为了保证发射天线之间的正交性，本文采用频域交织导频：各个导频子载波以循环方式分配给不同的发射天线，使任意导频子载波 $k\in\mathcal P$ 上只有一根发射天线 $t_k$ 处于激活状态。CAV 接收信号为

$$
\mathbf y[k]=\mathbf H[k]\mathbf x[k]+\mathbf n[k]
=\mathbf h_{t_k}[k]s[k]+\mathbf n[k],\quad k\in\mathcal P. \tag{2}
$$

这里 $\mathbf x[k]\in\mathbb C^{N_t\times1}$ 是稀疏导频向量，仅有与激活天线 $t_k$ 对应的元素 $s[k]$ 非零；$\mathbf h_{t_k}[k]\in\mathbb C^{N_r\times1}$ 为信道矩阵 $\mathbf H[k]$ 的第 $t_k$ 列；$\mathbf n[k]\sim\mathcal{CN}(0,\sigma^2\mathbf I_{N_r})$ 是加性高斯白噪声。目标是在全部子载波上估计完整信道张量 $\mathbf H\in\mathbb C^{N_r\times N_t\times N_c}$。

### B. 多模态数据与对齐

本文使用用于感知与通信的大规模 Multimodal-Wireless 数据集 [13]。该数据集包含 16 个不同场景，覆盖多样化的城市布局和交通密度。每个场景记录 CAV 在环境中行驶时同步的通信与感知数据流。数据规格如下。

- **LiDAR：** 每辆 CAV 配备 64 线 LiDAR，探测距离 120 m，垂直视场角为 $-25^\circ$ 至 $2^\circ$，每帧约产生 30,000 个点，为周围散射体提供三维几何表示。
- **摄像机：** 每辆 CAV 配备四个 RGB 摄像机，分别面向前、后、左、右，覆盖完整的 $360^\circ$ 水平视场角。每幅图像分辨率为 $640\times480$。
- **定位信息：** 记录 CAV 和 RSU 的全局坐标与航向角。

在构建的数据集中，无线信道每 10 ms 采样一次，而多模态传感器每 100 ms 采集一次，二者存在采样率不匹配。为解决这一问题，本文采用一对多时间对齐策略：时间 $t$ 处的一次传感器测量与从 $t$ 到 $t+90$ ms 的连续 10 个信道样本配对。这一策略的依据是：相对于 100 ms 的传感器采样间隔，物理环境变化较慢，因此同一次环境观测能够为该时间窗口内的多次信道估计提供有效背景信息。

在空间对齐方面，本文将所有空间模态变换到统一的以 CAV 为中心的坐标系，以便稳健地学习几何特征。具体来说，将原始全局坐标映射到 CAV 车体坐标系，其原点位于车辆中心，$x$ 轴与车辆行驶方向一致。在这一坐标系中，RSU 位置以相对向量而非绝对全局坐标表示。该变换消除了任意坐标原点引入的偏差，使模型能够聚焦于直接决定无线传播的相对空间拓扑。

## III. 所提方法

本文提出 MultiCE-Flow，该框架结合稀疏导频和丰富环境语义，重构高保真无线信道。

### A. 整体框架

MultiCE-Flow 将信道估计视为条件生成任务。如图 1 所示，系统由两个核心模块组成：多模态感知模块和条件 DiT。其工作流程如下。

首先，从异构感知数据中提取语义条件。通过处理 LiDAR 点云、摄像机图像和定位信息，捕获环境背景。这些输入被融合为潜在序列 $\mathbf C_{\mathrm{env}}$，作为细化估计结果的语义条件。

与此同时，根据稀疏导频观测 $\{\mathbf Y[k]\}_{k\in\mathcal P}$ 构造结构条件。通过 LS 估计、插值和域变换，获得粗略的角度–时延域表示 $\mathbf C_{\mathrm{pilot}}$。该张量捕获稀疏多径簇，提供重构所需的主要结构骨架。

最后，DiT 通过流匹配生成目标信道估计 $\hat{\mathbf H}$。在结构骨架 $\mathbf C_{\mathrm{pilot}}$ 和环境语义 $\mathbf C_{\mathrm{env}}$ 的双重条件下，模型学习沿确定性路径将高斯噪声传输到干净信道分布。下面进一步介绍数据处理和网络架构。

**图 1 图题译文：** MultiCE-Flow 的架构。（左）多模态感知模块将 LiDAR、摄像机和定位信息编码为融合语义条件 $\mathbf C_{\mathrm{env}}$。（右）DiT 主干网络采用流匹配将噪声传输至信道分布，同时以环境语义和基于导频的结构条件 $\mathbf C_{\mathrm{pilot}}$ 为条件。

### B. 多模态编码与融合

本文使用 Perceiver 重采样器和基于 Transformer 的融合模块融合异构感知数据。通过将不同模态映射到共享潜在空间，该架构能够在保留与信道有关的几何和语义特征的同时，将各种输入压缩成紧凑的 token。

#### 1）多模态编码

融合之前，三个不同模态分别由专门的分支处理。

**LiDAR 分支。** 将原始点云投影为编码高度和密度的多通道鸟瞰图（Bird's-Eye View，BEV）。为了处理稀疏、高维的 BEV 地图，本文采用带可学习查询 token 的 Perceiver 重采样器 [14]、[15]，使用交叉注意力提取相关特征。给定 BEV 特征 $\mathbf M_{\mathrm{lidar}}\in\mathbb R^{H\times W\times C}$，重采样器输出 $\mathbf Z_{\mathrm{lidar}}\in\mathbb R^{N_{\mathrm{lidar}}\times D}$，其中 $N_{\mathrm{lidar}}$ 为 token 序列长度，$D$ 为嵌入维数。这一操作通过有选择地收集与环境有关的信息，将 LiDAR 数据压缩为紧凑表示。

**摄像机分支。** 四个摄像机提供 $360^\circ$ 视角覆盖。本文采用预训练 ResNet-34 [16] 提取各个视角的语义特征，再使用 Perceiver 重采样器生成 token $\mathbf Z_{\mathrm{cam}}\in\mathbb R^{N_{\mathrm{cam}}\times D}$。为区分前、后、左、右视角，还加入可学习的摄像机 ID 嵌入。

**定位信息分支。** 相对位置和速度决定路径损耗、阴影衰落等大尺度衰落属性。对每个实体，构造四维特征向量 $\mathbf v_{\mathrm{phy}}=[x,y,z,\log(d)]$，其中 $(x,y,z)$ 为以 CAV 为中心的相对坐标，$d$ 为欧几里得距离。随后使用多层感知机将其投影为 token $\mathbf Z_{\mathrm{phy}}\in\mathbb R^{N_{\mathrm{phy}}\times D}$。

#### 2）统一 Transformer 融合

为了刻画不同模态之间复杂的交互关系，本文采用多模态 Transformer 编码器进行深度融合。首先将全部分支的 token 拼接为异构序列：

$$
\mathbf Z_{\mathrm{mul}}=
[\mathbf Z_{\mathrm{lidar}},\mathbf Z_{\mathrm{cam}},\mathbf Z_{\mathrm{phy}}]
\in\mathbb R^{(N_{\mathrm{lidar}}+N_{\mathrm{cam}}+N_{\mathrm{phy}})\times D}. \tag{3}
$$

为了保留模态特有的信息，在属于各类传感器的 token 上加入可学习模态嵌入。此外，再加入可学习位置嵌入以编码序列顺序。组合后的序列由具有自注意力机制的多层 Transformer 编码器处理，输出多模态语义条件 $\mathbf C_{\mathrm{env}}$，作为后续生成过程的语义提示。

### C. 扩散 Transformer 架构

本文设计的 DiT 采用双流条件化策略：导频提供结构指导，环境提供语义指导。通过将信道数据转换至角度–时延域并使用流匹配，模型学习确定性传输映射，以高效完成高保真重构。

#### 1）条件构建与 token 化

首先，从稀疏观测 $\{\mathbf Y[k]\}_{k\in\mathcal P}$ 构建导频结构条件。通过 LS 估计和线性插值获得粗略估计 $\hat{\mathbf H}_{\mathrm{interp}}$。为利用物理稀疏性，通过二维离散傅里叶变换将其转换至角度–时延域，并拆分实部和虚部，得到导频张量 $\mathbf C_{\mathrm{pilot}}\in\mathbb R^{N_r\times N_t\times2N_c}$。

同时，为流匹配过程准备输入。对真实信道 $\mathbf H$ 执行同样的域变换，得到目标张量 $\mathbf H_1$，其维度与 $\mathbf C_{\mathrm{pilot}}$ 一致。根据条件最优传输形式 [12]，采样时间步 $t\sim\mathcal U[0,1]$，并在目标数据 $\mathbf H_1$ 和标准高斯噪声 $\mathbf H_0$ 之间线性插值：

$$
\mathbf H_t=t\mathbf H_1+(1-t)\mathbf H_0.
$$

由此得到对应于直线概率路径的含噪状态，它能够最小化传输代价，并简化学习目标。

随后，$\mathbf H_t$ 和 $\mathbf C_{\mathrm{pilot}}$ 均被分割为三维 patch。本文将张量划分为大小 $(p_{\mathrm{ant}},p_{\mathrm{ant}},p_{\mathrm{freq}})$ 的块，将其展平后线性投影到 DiT 隐空间维度 $D$，得到含噪信道 token $\mathbf E_{\mathrm{ch}}\in\mathbb R^{L\times D}$ 和导频条件 token $\mathbf E_{\mathrm{pilot}}\in\mathbb R^{L\times D}$，其中 $L$ 为 patch 数量。

#### 2）条件注入机制

完成 token 化后，DiT 沿不同路径融合两类输入，以充分发挥各自作用。

**导频条件（拼接）。** 导频 token $\mathbf E_{\mathrm{pilot}}$ 作为强条件，与含噪信道 token $\mathbf E_{\mathrm{ch}}$ 显式拼接，并加入可学习三维位置嵌入 $\mathbf P_{\mathrm{pos}}$。组合序列

$$
\mathbf E_{\mathrm{DiT}}=[\mathbf E_{\mathrm{ch}},\mathbf E_{\mathrm{pilot}}]+\mathbf P_{\mathrm{pos}}
$$

作为主干网络主要输入，直接向网络提供信道的粗略结构。

**环境语义条件（交叉注意力）。** 多模态语义条件 $\mathbf C_{\mathrm{env}}$ 作为特定上下文提示。与导频 token 不同，$\mathbf C_{\mathrm{env}}$ 通过多头交叉注意力层注入每个 DiT 模块，使模型能够动态查询环境几何与语义信息，细化重构结果中的细节。

最后，插值时间步 $t$ 通过自适应层归一化注入网络，调制各层的信道统计特征，以指导去噪轨迹。

#### 3）流匹配目标

模型通过预测驱动噪声流向数据的速度场 $v_t=d\mathbf H_t/dt=\mathbf H_1-\mathbf H_0$ 进行训练 [12]。最小化均方误差：

$$
\mathcal L(\theta)=
\mathbb E_{t\sim\mathcal U[0,1]}
\left[\left\|
v_\theta(\mathbf H_t,t,\mathbf E_{\mathrm{pilot}},\mathbf C_{\mathrm{env}})
-(\mathbf H_1-\mathbf H_0)
\right\|_2^2\right]. \tag{4}
$$

其中，网络 $v_\theta$ 同时以稀疏导频 token $\mathbf E_{\mathrm{pilot}}$ 和环境语义 $\mathbf C_{\mathrm{env}}$ 为条件。通过学习这一最优传输路径，可以约束生成过程接近直线轨迹，从而最大化采样效率。

#### 4）采用无分类器引导（CFG）的推理

本文使用无分类器引导（Classifier-Free Guidance，CFG）[17] 控制环境语义条件对信道估计的影响。在训练期间，以 $p_{\mathrm{drop}}=0.1$ 的概率丢弃 $\mathbf C_{\mathrm{env}}$，并替换为可学习空嵌入 $\mathbf C_\varnothing$，以学习无条件先验。推理阶段组合有条件与无条件速度预测：

$$
\begin{aligned}
\tilde v_\theta(\mathbf H_t,t)
=&\ v_\theta(\mathbf H_t,t,\mathbf E_{\mathrm{pilot}},\mathbf C_\varnothing)\\
&+w\bigl[
v_\theta(\mathbf H_t,t,\mathbf E_{\mathrm{pilot}},\mathbf C_{\mathrm{env}})
-v_\theta(\mathbf H_t,t,\mathbf E_{\mathrm{pilot}},\mathbf C_\varnothing)
\bigr].
\end{aligned}\tag{5}
$$

其中，$w$ 控制相对于导频观测而言的环境引导强度。较小的 $w$（例如 $w<1$）会优先依赖学习到的先验和导频输入，因此能够在环境语义不可靠时提高鲁棒性，尤其适用于 OOD 场景。

最后，借助流匹配学得的近似直线速度场，使用单次欧拉步恢复目标信道 token：

$$
\hat{\mathbf H}_1=\mathbf H_0+\tilde v_\theta(\mathbf H_0,0). \tag{6}
$$

将估计 token 重塑形状并变换回频域，即可得到最终信道估计 $\hat{\mathbf H}$。相较于多步扩散过程，这种单步生成显著降低了时延。

## IV. 仿真结果

### A. 实验设置

本文使用 Multimodal-Wireless 数据集 [13]，其包含 16 个具有不同城市布局的场景。为扩增训练数据，采用子载波拆分策略，将每帧的完整带宽划分为 16 个互不重叠的子带。此方法将数据集规模有效扩大 16 倍，最终产生约 850,000 个样本。每个样本包含一个 MIMO-OFDM 信道实例（$N_r=4$，$N_t=4$，$N_c=64$）、64 线 LiDAR 点云、四视角 RGB 图像及定位信息。

本文将 15 个场景作为源域，并按 8:1:1 随机划分为训练集、验证集与分布内测试集。这样得到约 640,000 个训练样本和 80,000 个分布内测试样本。另保留 “Town07 single-lane road” 场景（48,000 个样本）进行 OOD 测试。与训练集的城市环境不同，该场景是建筑较为稀疏、植被茂密的乡村环境，可用于检验所提模型的泛化能力。

DiT 主干网络使用 $N_{\mathrm{depth}}=6$ 层、$N_{\mathrm{head}}=6$ 个注意力头和隐藏维度 $D=384$。信道数据使用大小为 $(2,2,8)$ 的三维 patch 进行 token 化。训练采用 AdamW 优化器，批量大小为 96，权重衰减为 0.05。学习率使用余弦退火调度，从 $2\times10^{-4}$ 降至 $1\times10^{-6}$。为增强鲁棒性，训练时从集合 $\{2,4,8\}$ 中随机选取导频间隔 $S_p$，并在 $[-10,30]$ dB 内均匀采样导频 SNR。

主要性能指标为归一化均方误差（Normalized Mean-Squared Error，NMSE），定义为

$$
\mathrm{NMSE}=
\frac{\mathbb E\{\|\mathbf H-\hat{\mathbf H}\|_F^2\}}
{\mathbb E\{\|\mathbf H\|_F^2\}}.
$$

另外，采用余弦相似度评估结构对齐和波束成形方向准确性，计算为

$$
\mathbb E\left\{
\frac{\left|\operatorname{tr}(\mathbf H^H\hat{\mathbf H})\right|}
{\|\mathbf H\|_F\|\hat{\mathbf H}\|_F}
\right\},
$$

其中 $\|\cdot\|_F$ 表示 Frobenius 范数。

本文将 MultiCE-Flow 与以下基线比较：

- **LMMSE：** 使用从测试数据计算的完整信道协方差矩阵的线性估计器。
- **DMPS [4]：** 通过学习无条件信道先验、使用后验采样进行信道估计的扩散估计器。为确保公平比较，该基线与多模态模型使用相同的 DiT 主干网络。
- **Pilots Only（仅导频）：** 不使用多模态条件的 MultiCE-Flow（引导系数 $w=0$）。

首先评估不同 SNR 条件下的估计精度。如图 2 所示，本文多模态方法在整个 SNR 范围内持续优于所有基线。LS 估计器因其本身无法抑制噪声而严重退化，在低 SNR 时尤为明显。LMMSE 虽借助二阶信道统计特征优于 LS，但仍受限于线性模型的表达能力。

值得注意的是，在低 SNR 时，DMPS 的表现不如 Pilots Only。这是因为迭代式后验采样在显著噪声条件下容易出现不稳定。相比之下，作为条件生成模型运行的 Pilots Only，能够有效地将估计视为受导频 token 指导的鲁棒去噪任务。

本文多模态方法在整个 SNR 区间都获得最低的 NMSE 和最高的余弦相似度。这说明融合环境语义可提供关键的信息指导，在导频观测极为稀疏时有效弥补信号的歧义性。

**图 2 图题译文：** MultiCE-Flow 在不同 SNR 下的性能（$S_p=8$）。（a）NMSE 随 SNR 变化；（b）余弦相似度随 SNR 变化。

图 3(a) 评估了 MultiCE-Flow 在不同导频间隔 $S_p\in\{2,4,8\}$ 下的鲁棒性。随着导频愈加稀疏，所有对比方法的性能均有所下降，但 MultiCE-Flow 始终保持显著优势。特别是，即使在导频极为稀疏（$S_p=8$）时，所提框架依然达到 $-17$ dB 的 NMSE，优于在密集导频（$S_p=2$）下工作的 LMMSE 估计器。这说明环境语义能够有效弥补稀疏导频场景中信道观测不足的问题。

图 3(b) 的消融实验量化了各数据模态的单独作用。Pilots Only 基线性能最差，反映了仅依据稀疏观测重构高维信道的困难。在 $-10$ dB SNR 时，加入位置信息可利用大尺度衰落相关性，产生约 5 dB 的增益。此外，加入视觉模态（LiDAR 和摄像机）可通过识别散射几何结构带来显著改善。完整 MultiCE-Flow 框架的表现确认：融合多样化环境语义，对于鲁棒信道估计非常重要。

**图 3 图题译文：** MultiCE-Flow 的性能分析。（a）导频间隔的影响；（b）消融实验（$S_p=8$）。

为了评估泛化能力，本文在未见过的 “Town07 single-lane road” 场景上测试。如图 4 所示，多模态方法表现出更强的 OOD 鲁棒性。将 CFG 系数设为 $w=0.5$ 以平衡环境引导后，该方法在低 SNR 条件下，相较于 Pilots Only 将 NMSE 改善超过 3 dB，并在全部 SNR 条件下保持较高的余弦相似度（$>0.86$）。这表明训练期间学到的环境语义能够有效泛化至未见场景。

在计算复杂度方面，LMMSE 估计器相对轻量，但计算 $1024\times1024$ 协方差矩阵仍带来明显时延（2.9 ms）。使用相同 DiT 主干网络的扩散模型 DMPS，因迭代采样而产生较高成本（69.4 GFLOPs，5.8 ms）。相比之下，MultiCE-Flow 更高效：通过单步推理，并在每 10 帧之间共享多模态条件，其复杂度降低至每样本 5.6 GFLOPs、1.2 ms，展现出更好的实时可行性。

**图 4 图题译文：** MultiCE-Flow 的泛化性能（$S_p=8$）。（a）NMSE 随 SNR 变化；（b）余弦相似度随 SNR 变化。

## V. 结论

本文提出 MultiCE-Flow，利用流匹配和 DiT 将信道估计重新表述为条件生成任务。我们引入双条件化策略：将稀疏导频作为结构指导，将融合的多模态感知数据作为语义指导。为了支持高效推理，本文采用具有最优传输路径的流匹配方法，学习确定性传输映射，将生成过程简化为直线轨迹。

实验结果表明，相较于传统方法和生成式基线，MultiCE-Flow 实现了更高的重构精度，在具有挑战性的分布外环境中尤为明显。此外，所提方法只需一次采样步骤即可恢复高保真信道，符合实时通信系统对低时延的要求。

## 参考文献

以下保留原文参考文献的英文题名与书目信息，以便检索核对。

[1] L. Lu et al., “An overview of massive MIMO: Benefits and challenges,” *IEEE J. Sel. Topics Signal Process.*, vol. 8, no. 5, pp. 742–758, 2014.

[2] Z. Qin et al., “AI empowered wireless communications: From bits to semantics,” *Proc. IEEE*, vol. 112, no. 7, pp. 621–652, 2024.

[3] M. Arvinte et al., “MIMO channel estimation using score-based generative models,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 6, pp. 3698–3713, 2023.

[4] X. Zhou et al., “Generative diffusion models for high dimensional channel estimation,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 7, pp. 5840–5854, 2025.

[5] Z. Chen et al., “Generative diffusion model-based variational inference for MIMO channel estimation,” *IEEE Trans. Commun.*, vol. 73, no. 10, pp. 9254–9269, 2025.

[6] B. Fesl et al., “Diffusion-based generative prior for low-complexity MIMO channel estimation,” *IEEE Wireless Commun. Lett.*, vol. 13, no. 12, pp. 3493–3497, 2024.

[7] X. Fan et al., “Low-complexity MIMO channel estimation with latent diffusion models,” 2025, arXiv:2510.21386. https://arxiv.org/abs/2510.21386

[8] G. Liang et al., “Environment-aware channel inference via cross-modal flow: From multimodal sensing to wireless channels,” 2025, arXiv:2512.04966. https://arxiv.org/abs/2512.04966

[9] S. Kim et al., “Large multimodal model-based environment-aware channel estimation,” *IEEE J. Sel. Areas Commun.*, 2026 (Early Access).

[10] J. Chen et al., “PixArt-α: Fast training of diffusion transformer for photorealistic text-to-image synthesis,” *ICLR*, 2024.

[11] P. Esser et al., “Scaling rectified flow transformers for high-resolution image synthesis,” *ICML*, 2024.

[12] Y. Lipman et al., “Flow matching for generative modeling,” *ICLR*, 2023.

[13] T. Mao et al., “Multimodal-wireless: A large-scale dataset for sensing and communication,” 2025, arXiv:2511.03220. https://arxiv.org/abs/2511.03220

[14] J. B. Alayrac et al., “Flamingo: A visual language model for few-shot learning,” *NeurIPS*, vol. 35, pp. 23716–23736, 2022.

[15] M. Reuss et al., “Multimodal diffusion transformer: Learning versatile behavior from multimodal goals,” 2024, arXiv:2407.05996. https://arxiv.org/abs/2407.05996

[16] K. He et al., “Deep residual learning for image recognition,” *CVPR*, pp. 770–778, 2016.

[17] J. Ho et al., “Classifier-free diffusion guidance,” *NeurIPS Workshop Deep Generative Models Big Data*, 2021.


### 参考文献题名中译

以下与上面的 17 条英文书目逐条对应，保留原始英文引文便于检索。

1. **Massive MIMO 概述：收益与挑战**。
2. **AI 赋能无线通信：从比特到语义**。
3. **利用基于分数的生成模型进行 MIMO 信道估计**。
4. **用于高维信道估计的生成式扩散模型**。
5. **基于生成式扩散模型变分推断的 MIMO 信道估计**。
6. **用于低复杂度 MIMO 信道估计的扩散式生成先验**。
7. **使用潜在扩散模型进行低复杂度 MIMO 信道估计**。
8. **通过跨模态流进行环境感知信道推断：从多模态感知到无线信道**。
9. **基于大型多模态模型的环境感知信道估计**。
10. **PixArt-α：用于逼真文本到图像合成的快速扩散 Transformer 训练**。
11. **扩展整流流 Transformer 以实现高分辨率图像合成**。
12. **用于生成建模的流匹配**。
13. **Multimodal-Wireless：面向感知与通信的大规模数据集**。
14. **Flamingo：用于少样本学习的视觉语言模型**。
15. **多模态扩散 Transformer：从多模态目标学习通用行为**。
16. **面向图像识别的深度残差学习**。
17. **无分类器扩散引导**。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。
