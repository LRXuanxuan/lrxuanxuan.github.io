---
layout: page
title: "Channel2World：面向 RF 环境表示的无线基础模型｜中文译文"
permalink: /papers/translations/channel2world/
math: true
toc: true
---

[← 返回论文条目](/papers/items/749bfdb8ab82b176/) · [原文 arXiv](https://arxiv.org/abs/2608.17544) · [原文 PDF](https://arxiv.org/pdf/2608.17544v1)

# Channel2World：面向射频环境表征的无线基础模型

**原题：** CHANNEL2WORLD: A Wireless Foundation Model for RF Environment Representation  
**作者：** Hyung-Joo Moon、Joonkyu Jang、Kwang Soon Kim、Seong-Lyun Kim、Robert W. Heath, Jr.、Chan-Byoung Chae  
**机构：** 韩国延世大学；美国加州大学圣迭戈分校  
**原文版本：** arXiv:2608.17544v1，2026-08-18  
**版权说明：** 原文采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本中文译本为改编，注明作者、出处、版本和许可，不代表作者认可译本。图像不在本站重复储存，保留全部图注及原文页码以便对照。公式编号与论文原文对应。

## 摘要（Abstract）

无线信道通常被当作特定链路的观测，尽管信道的多径结构实际上受周围射频（RF）环境支配。本文提出 Channel2World，一种根据 MIMO 信道—位置联合观测学习可复用**环境级表示**的无线基础模型。它采用基于 Transformer 的编码器，将同一个以基站为中心的环境内采集的信道聚合成**无线世界嵌入（wireless world embedding）**。编码器通过“上下文—查询预测”预训练：利用上下文信道，预测与之不重叠的查询信道对应 UE 位置及相对路径增益。预训练后，冻结编码器，将其作为任务无关的环境条件模块供下游无线模型使用，从而不经站点专属微调即可适配未见环境。

为学习跨部署场景泛化的环境级潜在空间，我们采用来自 26,000 个环境的射线追踪数据进行预训练，每个环境约有 5,000 个信道测量样本。在 UE 定位、波束域 CSI 重建及 RF 可观测几何重建上的评估表明，学习到的 embedding 可在未见环境中提供有效的条件信息。对于定位和 CSI 重建任务，embedding 条件化方法的性能优于或能够与站点专属微调相当，而后者需要额外的任务标注数据及基于梯度的适配。此外，该嵌入支持重建主要反射体结构，说明它可以充当跨任务复用的环境先验。

**关键词：** 无线基础模型、MIMO 信道、定位、射线追踪、环境感知通信。

## I. 引言（Introduction）

Massive MIMO 及高频无线通信系统扩大了信道数据的用途。随着天线阵列规模、系统带宽以及传播方向性的增强，一次信道观测在空间、时延和频率域都包含结构化信息。无线信道中的多径由基站（BS）位置、用户设备（UE）位置、周围反射体与散射体，以及与材料性质相关的传播效应共同决定 [1]。因此，MIMO 信道不仅是需要为链路自适应或波束成形估计的通信变量，也是对物理传播环境的一次不完整 RF 观测。

这一理解赋予信道数据在 AI 原生无线系统中更广泛的作用。除作为链路级推理的输入或目标外，信道—位置观测还可以作为对部署环境的 RF 感知测量。现有基于学习的无线方法主要将每次信道观测作为某项特定任务的独立样本，例如信道估计、CSI 反馈、波束预测、定位或资源分配 [2]–[4]。近年的无线基础模型则利用大量信道、CSI 序列、信道冲激响应（CIR）或同相/正交（I/Q）信号预训练可复用模型 [5]–[10]。本文所说的无线基础模型，是指在大规模无线观测上预训练，并作为下游无线任务共享骨干或条件模块进行复用的模型。

本文关注一种互补的基础模型形式：表示对象不是单独的一次无线观测，而是由许多携带位置信息的信道共同观测到的 RF 传播环境。这种环境级表示可以提供与具体部署站点相适应的传播上下文。

这种环境上下文很重要，因为环境依赖是无线学习的普遍难题。对给定任务而言，观测与目标之间的对应关系会随环境改变：周围几何决定反射体构成以及路径是否可见。已有方法主要采取两条路线。第一种是收集站点专属数据，为每个部署地点分别训练或微调任务模型 [11], [12]；这一方案有时有效，但需要目标站点的任务标签，而且在样本很少时不够可靠。第二种是向模型提供显式环境上下文，如地图、点云、图像、无线电地图或神经场景表示 [13]；虽然这种上下文有利于跨环境泛化，但其采集、标定和维护可能非常困难。

本文选择**直接从无线观测推断部署环境先验**。在某个 UE 位置测量的单次信道只是局部 RF 观测；同一站点不同位置的信道—位置样本，则从多个视角观察同一底层传播结构。因此，我们训练环境编码器，把这些观测映射到捕捉共同传播结构的可复用先验。这不需要显式场景信息，也不需要目标站点的任务标签。

基于此，我们提出 CHANNEL2WORLD：从信道—位置观测推断以基站为中心的 RF 环境表示。我们把这个环境级表示称为 **wireless world embedding**。如图 1 所示，来自同一 RF 环境的多个信道—位置观测先分解为路径 token，再由环境编码器聚合。预训练时，context channels 用于推断 embedding，而同一环境内与之不重叠的 query channels 提供 UE 位置和相对路径增益预测监督。预训练后冻结环境编码器，并在下游任务中复用。对于新环境，只需采集一个规模适中的信道—位置上下文集，即可产生该环境的 embedding，再用于条件化下游模型。

**图 1（原文第 2 页）**：来自同一 RF 环境的 BS 多个 MIMO 信道—位置观测被编码为无线世界嵌入，为后续无线通信及 RF 可观测几何推断任务提供环境级条件。

### A. 相关工作及本文贡献（Related Work and Our Contributions）

**任务专用物理层学习。** 早期无线深度学习主要是面向单项物理层任务的工具，已用于 CSI 反馈 [2]、信道估计与信号检测 [14]、波束预测与管理 [11], [15]，以及收发机端到端设计 [16]。这些工作说明无线信道及信号具有能够学习、并有助于改善物理层处理的结构。但模型通常绑定某项任务、特定天线结构、信道分布或站点，这既制约任务泛化，也制约环境泛化 [4], [11]。

**无线基础模型。** 基础模型试图通过大规模无线数据预训练共享骨干，从而克服任务依赖 [17]。已有研究从实测或仿真信道学习嵌入 [5]，通过时空频掩码预测建模 [6]，面向通信和感知进行生成式预训练 [7]，结合掩码重建及对比学习 [8]，对齐 CSI 与 CIR 表示 [9]，或将预训练拓展到 I/Q 流 [10]。WavesFM 还展示了通信、感知、定位的共享骨干，用任务专属预测头和参数高效微调完成适配 [12]。这些研究为任务通用的无线模型奠定基础，但**环境依赖仍然存在**：局部几何、阻挡、反射体可见性的变化，会改变输入观测与目标之间的映射。多数基础模型因此仍依赖预训练数据涵盖足够多的环境，或依赖目标站点的参数高效微调。任务依赖虽得到一定缓解，环境适配仍通常需要额外的站点专属步骤。

**显式环境先验。** 更直接的做法是把环境上下文提供给无线模型。CKM 可以学习或储存随位置变化的信道知识 [18], [19]，并已用于混合波束成形 [20]。多模态方法利用 LiDAR、视觉、语义信息或多传感器数据集进行波束选择、对齐与阻挡预测 [21]–[25]。无线数字孪生及神经传播模型从环境布局或测量中建立无线电地图、电磁场或站点专属信道渲染器 [26]–[29]。近年的 MUSE-FM 与 WWM 也将显式场景、点云或多模态几何先验用于环境感知的基础模型 [13], [30]。这些工作说明先验可通过提供部署上下文改善环境泛化，但它们的先验一般来自显式地图、传感器观测、无线场或站点专属神经表示；获得、标定和更新这些信息需要额外开销。

**本文方案。** CHANNEL2WORLD 将基站收集的 MIMO 信道—位置样本视作对 RF 环境的感知，通过它们产生 embedding。该 embedding 作为紧凑环境先验，与任务专属输入一起条件化下游预测。对于未见环境，可以直接利用常规采集的少量信道—位置观测推断这个先验，无需显式场景信息，也无需对编码器或下游模型进行梯度更新。

本文的主要贡献为：

1. 提出无线世界嵌入作为用于环境适配的紧凑 RF 环境表示。它由同一 BS 中心环境内的多个信道—位置观测推断，包含不同信道共享的传播结构。
2. 提出基于 Transformer 的 CHANNEL2WORLD 架构，将分解出的多径物理参数转成路径 token，并将可变规模上下文集聚合成固定维度的环境表示。
3. 提出无需下游任务标签的 context-query 预训练：context channels 产生环境 embedding，不重叠的 query channels 提供由 embedding 条件化的位置及增益预测监督。
4. 在由随机建筑布局生成的 26,000 个 BS 中心射线追踪环境上训练并验证，平均每个环境约 5,000 个有效信道—位置样本。
5. 采用**冻结编码器**的下游评估协议，把环境先验应用于从空间信道矩阵估计 UE 位置、从稀疏波束测量恢复完整 DFT 波束域 CSI，以及重建 RF 可观测环境几何。

## II. 系统模型（System Model）

考虑基站在一个较短的“环境相干时间”内从多个 UE 收集上行宽带 MIMO 信道观测；在这一时段内，传播环境近似静止。每个观测与以 BS 为中心的坐标系中的 UE 位置关联。同一环境的信道—位置集合可被视为对相同传播场景的多个 RF 观测，也是 CHANNEL2WORLD 的测量数据。

本节先定义 BS 中心坐标系及上行宽带 MIMO 信道张量，再介绍由信号分解得到的多径表示，包括每条路径的到达角（AoA）、时延和增益。虽然原始观测为宽带 MIMO 信道张量，CHANNEL2WORLD 的输入却是由信道分解得到的**路径级物理参数估计**。因此其学习架构与天线数量、阵列布局、信道探测配置分离，可直接处理不同天线配置的基站。

### A. 上行信道张量及多径参数（Uplink Channel Tensor and Multipath Parameters）

用 $e\in\{1,\dots,E\}$ 表示 BS 中心环境编号。一个环境对应确定的传播场景、BS 放置位置、阵列朝向与遮挡配置，包含 $N_e$ 个 UE 信道观测。设 BS 阵列在全球坐标系中的位置为 $\widetilde{\mathbf p}^{BS}_e\in\mathbb R^3$。BS 中心坐标系与阵列相连：$x_e$、$y_e$ 分别与矩形阵列的水平及垂直方向对齐，$z_e$ 是指向服务区域的阵列法线。设这三个局部基轴在全球坐标系中的单位正交向量为 $\mathbf b_{e,x},\mathbf b_{e,y},\mathbf b_{e,z}$，令 $\mathbf B_e=[\mathbf b_{e,x},\mathbf b_{e,y},\mathbf b_{e,z}]$。全球位置为 $\widetilde{\mathbf p}^{UE}_{e,i}$ 的用户，其 BS 中心位置为

$$
\mathbf p_{e,i}
=\mathbf B_e^T
\left(\widetilde{\mathbf p}^{UE}_{e,i}
-\widetilde{\mathbf p}^{BS}_e\right).
\tag{1}
$$

转换后，BS 阵列中心成为原点，$\mathbf B_e^T$ 将全球 BS-UE 位移映射到局部坐标。本文所有 UE 位置和 AoA 均以此坐标系表示。实际采集的 UE 位置可能有误差，记作

$$
\widehat{\mathbf p}_{e,i}
=\mathbf p_{e,i}+\boldsymbol\varepsilon^{pos}_{e,i},
\quad
\boldsymbol\varepsilon^{pos}_{e,i}
\sim\mathcal N(\mathbf 0_3,\sigma_{pos}^2\mathbf I_3).
\tag{2}
$$

$\sigma_{pos}$ 为各坐标轴的位置误差标准差，误差假定在不同 UE 观测间相互独立，各轴同分布。

环境 $e$ 中 BS 使用 $N_{x,e}\times N_{y,e}$ 矩形阵列，两轴阵元间距为 $d_{x,e}$、$d_{y,e}$；每个 UE 使用一根天线。若某条路径到达 BS 的方向与 $z_e$ 轴夹角为 $\theta$，在 $x_e$-$y_e$ 平面从 $x_e$ 轴测得的方位角为 $\phi$，其两轴方向余弦为

$$
u_x(\theta,\phi)=\sin\theta\cos\phi,\qquad
u_y(\theta,\phi)=\sin\theta\sin\phi.
\tag{3}
$$

对载波波长 $\lambda$、间距 $d$ 的 $N_a$ 元 ULA，阵列响应定义为

$$
\mathbf a_{N_a,d,\lambda}(u)
=[1,e^{-j2\pi du/\lambda},\ldots,
e^{-j2\pi d(N_a-1)u/\lambda}]^T.
\tag{4}
$$

BS 阵列响应矩阵为

$$
\mathbf A_e(\theta,\phi)
=\mathbf a_{N_{x,e},d_{x,e},\lambda}(u_x)
\mathbf a_{N_{y,e},d_{y,e},\lambda}^{T}(u_y)
\in\mathbb C^{N_{x,e}\times N_{y,e}}.
\tag{5}
$$

基站估计 OFDM 载波集 $\mathcal N_{sc,e}=\{0,\ldots,N_{sc,e}-1\}$ 上的复基带等效上行信道。第 $n$ 个子载波的基带频率和占用带宽分别为

$$
\nu_{e,n}
=\left(n-\frac{N_{sc,e}-1}{2}\right)\Delta f_e,
\tag{6}
$$

以及 $B_{w,e}=N_{sc,e}\Delta f_e$。对 UE $i$，设其多径数为 $L_{e,i}$，$\mathbf H_{e,i,n}\in\mathbb C^{N_{x,e}\times N_{y,e}}$ 是子载波 $n$ 的空间信道矩阵。在远场有限路径模型下，

$$
\mathbf H_{e,i,n}
=e^{j\kappa_{e,i}}\sum_{\ell=1}^{L_{e,i}}
10^{p_{e,i,\ell}/20}
\mathbf A_e(\theta_{e,i,\ell},\phi_{e,i,\ell})
e^{-j2\pi\nu_{e,n}\tau_{e,i,\ell}}.
\tag{7}
$$

其中 $\kappa_{e,i}\in[0,2\pi)$ 为 RF 前端随机相位，$p_{e,i,\ell}$ 为第 $\ell$ 条路径的 dB 增益，$(\theta_{e,i,\ell},\phi_{e,i,\ell})$ 为 BS 中心 AoA，$\tau_{e,i,\ell}$ 为相对于接收机定时基准的路径时延。沿频率模式堆叠各子载波矩阵，得到三阶信道张量

$$
\mathbf H_{e,i}
=[\mathbf H_{e,i,0},\ldots,
\mathbf H_{e,i,N_{sc,e}-1}]
\in\mathbb C^{N_{x,e}\times N_{y,e}\times N_{sc,e}},
\tag{8}
$$

其三个模式分别对应 BS 两个空间方向及子载波。

式 (7) 的时延包含真实传播时延和同步误差。设第 $\ell$ 条路径实际传播距离为 $d_{e,i,\ell}^{path}$、光速为 $c_0$，则

$$
\tau_{e,i,\ell}^{prop}
=d_{e,i,\ell}^{path}/c_0,\qquad
\tau_{e,i,\ell}
=\tau_{e,i,\ell}^{prop}+b_{e,i}^{\tau}.
\tag{9}
$$

其中 $b_{e,i}^{\tau}$ 是同一 UE 信道所有路径共享的定时偏置，概括接收时钟基准选择和同步残差。此外路径增益建模为

$$
p_{e,i,\ell}
=p_{e,i,\ell}^{phy}
+\xi_{e,i,\ell}^{UE}
+\zeta_{e,i}^{g}.
\tag{10}
$$

$p^{phy}$ 是物理传播决定的 dB 增益，包括距离相关路径损耗，以及反射、绕射、散射、材料衰减等交互；$\xi^{UE}$ 描述 UE 天线增益方向图、人体/手部遮挡以及设备朝向，仿真中建模为独立零均值高斯随机量 $\mathcal N(0,\sigma_\xi^2)$；$\zeta^g$ 是同一信道各路径共有的增益尺度项，反映发射功率不确定性、接收机自动增益及标定效应。

### B. 信道分解及参数估计（Channel Decomposition and Parameter Estimation）

进入 CHANNEL2WORLD 前，每个宽带信道张量都转成有限多径参数集合。根据式 (7)，无噪信道是多个路径诱导分量的和，这些分量沿两个空间模式与一个频率模式都有结构化响应。即使存在加性噪声，这种低秩多线性结构仍能支持 $x_e$-$y_e$-频率域的三维参数估计。相比一维或二维混合信号表示，联合空间—频率观测提供更多路径可分性，从而改善 AoA、时延和增益的可辨识性。已有张量及子空间估计器能够利用这种结构 [31], [32]。

令通过导频获得的信道估计为

$$
\widehat{\mathbf H}_{e,i}
=\mathbf H_{e,i}+\mathbf W_{e,i},
\tag{11}
$$

其中 $\mathbf W_{e,i}$ 包括接收噪声及残余建模误差。采用分解式信号分离，可以从 $\widehat{\mathbf H}_{e,i}$ 估计

$$
\left\{(\widehat\tau_{e,i,\ell},
\widehat\theta_{e,i,\ell},
\widehat\phi_{e,i,\ell},
\widehat p_{e,i,\ell})\right\}_{\ell=1}^{\widehat L_{e,i}},
\tag{12}
$$

其中 $\widehat L_{e,i}$ 是估计路径数，$\widehat\tau$ 包含不完善定时基准下的时延，$\widehat p$ 为 dB 增益估计。

式 (12) 的原始估计包含式 (9) 的公共定时偏差 $b^\tau$ 和式 (10) 的公共增益尺度 $\zeta^g$。这些量可通过每个 UE 信道内部的归一化消去。首先把最早估计到达的路径作为时延基准：

$$
\widehat\ell^{min}_{e,i}
=\arg\min_{\ell\in\{1,\ldots,\widehat L_{e,i}\}}
\widehat\tau_{e,i,\ell},
\tag{13}
$$

$$
\widehat{\overline\tau}_{e,i,\ell}
=\widehat\tau_{e,i,\ell}
-\widehat\tau_{e,i,\widehat\ell^{min}_{e,i}}.
\tag{14}
$$

这样可去除信道公共时偏，但也丢弃绝对时延原点，只保留路径间超额时延。增益则以最强路径为基准：

$$
\widehat\ell^{max}_{e,i}
=\arg\max_{\ell\in\{1,\ldots,\widehat L_{e,i}\}}
\widehat p_{e,i,\ell},
\tag{15}
$$

$$
\widehat{\overline g}_{e,i,\ell}
=\widehat p_{e,i,\ell}
-\widehat p_{e,i,\widehat\ell^{max}_{e,i}}.
\tag{16}
$$

它消除绝对增益尺度，并把最强路径归一化到 0 dB。最终估计多径集为

$$
\widehat{\mathcal P}_{e,i}
=\{(\widehat{\overline\tau}_{e,i,\ell},
\widehat\theta_{e,i,\ell},
\widehat\phi_{e,i,\ell},
\widehat{\overline g}_{e,i,\ell})
\}_{\ell=1}^{\widehat L_{e,i}}.
\tag{17}
$$

OFDM 频率采样决定了时延估计的无模糊窗口和分辨率：子载波间距 $\Delta f_e$ 决定无模糊时延范围，占用带宽 $B_{w,e}$ 决定时延分辨率 [31], [32]。本文宽带设置在频率域进行密集导频配置，其无模糊时延远大于场景实际多径时延扩展。例如 $\Delta f_e=15$ kHz 对应约 $c_0/\Delta f_e=20$ km 的无模糊距离 [33]。因此不单独建模整数时延模糊，并假定最大传播距离不超过无模糊范围。有限时延分辨率及其他分解误差由下面的误差模型体现。

对于已识别并与真实路径关联的每条主导路径，参数估计写作

$$
\begin{aligned}
\widehat{\overline\tau}_{e,i,\ell}
&=\overline\tau_{e,i,\ell}+\varepsilon^\tau_{e,i,\ell},\\
\widehat\theta_{e,i,\ell}
&=\theta_{e,i,\ell}+\varepsilon^\theta_{e,i,\ell},\\
\widehat\phi_{e,i,\ell}
&=\phi_{e,i,\ell}+\varepsilon^\phi_{e,i,\ell},\\
\widehat{\overline g}_{e,i,\ell}
&=\overline g_{e,i,\ell}+\varepsilon^g_{e,i,\ell}.
\end{aligned}
\tag{18}
$$

式 (18) 的参考值已去除公共时偏及绝对增益尺度。对应的理想相对时延和相对 dB 增益定义为

$$
\begin{aligned}
\overline\tau_{e,i,\ell}
&=\tau_{e,i,\ell}-\tau_{e,i,\ell_{e,i}^{min}},&
\ell_{e,i}^{min}
&=\arg\min_q\tau_{e,i,q},\\
\overline g_{e,i,\ell}
&=p_{e,i,\ell}-p_{e,i,\ell_{e,i}^{max}},&
\ell_{e,i}^{max}
&=\arg\max_qp_{e,i,q},
\end{aligned}
\tag{19}
$$

其中 $q\in\{1,\ldots,L_{e,i}\}$。$\ell^{min}$ 为最早路径索引，$\ell^{max}$ 为最强路径索引。式 (18) 中各 $\varepsilon$ 为“等效信道分解误差”，共同概括接收噪声、有限带宽、有限孔径及多径分离的残余误差。由于信道分解本身不是本文重点，作者使用可控的等效参数误差模型评估 CHANNEL2WORLD。具体假定误差独立且零均值高斯：$\varepsilon^\tau\sim\mathcal N(0,\sigma_\tau^2)$、$\varepsilon^\theta\sim\mathcal N(0,\sigma_\theta^2)$、$\varepsilon^\phi\sim\mathcal N(0,\sigma_\phi^2)$、$\varepsilon^g\sim\mathcal N(0,\sigma_g^2)$，四个标准差分别衡量相对时延、天顶角、方位角及相对增益估计误差。

## III. CHANNEL2WORLD

本节介绍 CHANNEL2WORLD：基于 Transformer，把同一 BS 中心环境的信道观测转换成无线世界嵌入。如图 2，模型由**环境编码器**及**预测头**构成。前者将多个信道—位置观测聚合成潜在环境 token，对样本数目及路径排列顺序不敏感；后者利用这些 token 预测查询 token 的目标变量。查询 token 与构建 embedding 的上下文 token 互不重叠，从而向环境编码器提供训练信号。

**图 2（原文第 5 页）**：CHANNEL2WORLD 架构。上下文信道—位置对生成路径 token，通过注意力聚合为无线世界 embedding token；这些 token 又为查询侧位置和路径增益预测头提供条件。

### A. 环境级数据组织及 Token 构造

采用第二节中信道分解得到的多径参数域表示。每个环境由一组信道—位置对构成：

$$
\mathcal D_e=
\{(\widehat{\mathbf p}_{e,i},\widehat{\mathcal P}_{e,i})
\}_{i=1}^{N_e}.
\tag{20}
$$

一次预训练样本仅来自一个环境。从 $\{1,\ldots,N_e\}$ 中抽取上下文信道索引集 $\mathcal C_e$ 与查询信道索引集 $\mathcal Q_e$，满足 $\mathcal C_e\cap\mathcal Q_e=\emptyset$。上下文观测用于推断环境 embedding，查询信道则用于独立的环境条件预测监督。若信道 $i$ 有 $\widehat L_{e,i}$ 条估计路径，定义其路径索引集 $\mathcal L_{e,i}=\{1,\ldots,\widehat L_{e,i}\}$。对上下文信道 $i\in\mathcal C_e$ 的第 $\ell$ 条路径，token 定义为

$$
\mathbf x^{ctx}_{e,i,\ell}
=[\widehat{\overline\tau}_{e,i,\ell},
\sin\widehat\theta_{e,i,\ell},
\cos\widehat\theta_{e,i,\ell},
\sin\widehat\phi_{e,i,\ell},
\cos\widehat\phi_{e,i,\ell},
\widehat{\overline g}_{e,i,\ell},
\widehat{\mathbf p}_{e,i}^{T}]^T.
\tag{21}
$$

它包含相对时延、BS 中心 AoA、相对路径增益及 UE 位置。

特别地，**查询信道只从 LoS UE 信道中选择**。设 $\mathcal I_e^{LoS}$ 是具有 LoS 路径的信道索引集，则 $\mathcal Q_e\subseteq\mathcal I_e^{LoS}$。对于这些信道，UE 位置提供 BS 至 UE 的距离参考，可用 LoS 路径校准定时基准。校准后，可为查询信道的每条路径（包括 NLoS 路径）得到传播时延估计。这种限制对于预训练不算苛刻，因为 query 仅用于监督，数目远小于 context。对于查询信道 $j\in\mathcal Q_e$ 的路径 $\ell$，token 为

$$
\mathbf x^{qry}_{e,j,\ell}
=[\widehat\tau^{prop}_{e,j,\ell},
\sin\widehat\theta_{e,j,\ell},
\cos\widehat\theta_{e,j,\ell},
\sin\widehat\phi_{e,j,\ell},
\cos\widehat\phi_{e,j,\ell}]^T.
\tag{22}
$$

这里 $\widehat\tau^{prop}$ 是校准后的传播时延估计。query token **不显式包含**查询 UE 的真实观测位置 $\widehat{\mathbf p}_{e,j}$，也不包含相对增益 $\{\widehat{\overline g}_{e,j,\ell}\}$；两者专门留作监督标签。于是

$$
\begin{aligned}
\mathcal X_e^{ctx}
&=\{\mathbf x_{e,i,\ell}^{ctx}:i\in\mathcal C_e,\ell\in\mathcal L_{e,i}\},\\
\mathcal X_{e,j}^{qry}
&=\{\mathbf x_{e,j,\ell}^{qry}:\ell\in\mathcal L_{e,j}\},
\quad j\in\mathcal Q_e.
\end{aligned}
\tag{23}
$$

这种 context-query 组织迫使潜在环境 token 学习同一环境内不同信道共享的传播信息，从而解释那些未曾用于构建 embedding 的查询信道。

### B. 用于无线世界嵌入的环境编码器

编码器把上下文 token 集映射成潜在环境 token。它借鉴基于注意力的集合编码器：通过固定数量的可训练 latent token，利用交叉注意力和自注意力归纳大小可变的输入集合 [34], [35]。先用共享线性投影把每个 context token 嵌入到 $D_m$ 维空间，再在每个 context channel 内的路径 token 上执行自注意力，以编码信道内部多径结构。逐信道处理后，所有 context channel 的路径 token 组成规模可变的集合。

为把它转成固定长度表示，CHANNEL2WORLD 使用 $K_z$ 个可训练 latent token 作为聚合槽位，初始矩阵为

$$
\mathbf Z^{(0)}
=[\mathbf z_1^{(0)},\ldots,
\mathbf z_{K_z}^{(0)}]^T
\in\mathbb R^{K_z\times D_m}.
\tag{24}
$$

$\mathbf z_k^{(0)}\in\mathbb R^{D_m}$ 为第 $k$ 个可训练 token。同一组初始 token 在所有环境中共享，并与其他模型参数一起学习。

全局聚合阶段在双向交叉注意力与自注意力之间交替。每个交叉注意力块中，latent token 关注处理后的 context path token，以收集环境信息；context token 同时反向关注 latent token，使其吸收当前 latent 表示。随后在两个 token 集中分别执行自注意力，在下一次交叉注意力前进一步细化信息。反复迭代后，固定数目的 latent token 充当环境观测的聚合槽位，最终得到

$$
\mathbf Z_e
=\mathrm{Enc}_\Theta
(\mathcal X_e^{ctx},\mathbf Z^{(0)})
\in\mathbb R^{K_z\times D_m},
\tag{25}
$$

$\mathrm{Enc}_\Theta$ 为环境编码器，$\Theta$ 为可训练参数；$\mathbf Z_e$ 就是环境 $e$ 的无线世界嵌入。

### C. 由环境条件化的预测头

估计模块使用 $\mathbf Z_e$，对与 context 不重叠的 query channels 进行条件预测。它包括三个头：**逐路径 UE 位置估计、相对路径增益估计、逐信道 UE 位置估计**。每个查询 token 先投影到 $D_m$ 维，再与 $\mathbf Z_e$ 经双向交叉注意力交互，让该路径依据校准传播时延及 AoA 提取相关环境信息。得到的路径 token 为

$$
\mathbf r^{path}_{e,j,\ell}
=\mathrm{Dec}^{path}_\Theta
(\mathbf x^{qry}_{e,j,\ell},\mathbf Z_e)
\in\mathbb R^{D_m}.
\tag{26}
$$

**1）逐路径位置估计。** 查询路径的 AoA 给出 BS 侧射线方向，传播时延提供距离相关信息，但二者通常不能唯一确定 UE 位置。环境 token 根据 context channels 编码与反射体有关的站点信息，补充缺失上下文。因此用高斯混合模型（GMM）预测 BS 中心 UE 位置的条件密度 $p^{path}_\Theta(\mathbf p\mid\mathbf r^{path}_{e,j,\ell})$。GMM 分量由一层隐藏层的 MLP 根据环境条件化路径 token 预测。训练时将该密度在实际观测的 query UE 位置 $\widehat{\mathbf p}_{e,j}$ 处求值，作为每条查询路径的监督目标。

**2）相对路径增益估计。** 路径 token 与环境交叉注意力融合后，再在查询信道内部通过自注意力联合细化：

$$
\{\widetilde{\mathbf r}^{path}_{e,j,\ell}\}_{\ell\in\mathcal L_{e,j}}
=\mathrm{Ref}_\Theta
(\{\mathbf r^{path}_{e,j,\ell}\}_{\ell\in\mathcal L_{e,j}}).
\tag{27}
$$

$\mathrm{Ref}_\Theta$ 为信道内自注意力，输出 $\widetilde{\mathbf r}^{path}\in\mathbb R^{D_m}$。这样预测头可利用同一查询信道不同路径之间的相对关系。相对路径增益预测为 $\widehat{\overline g}^{pred}_{e,j,\ell}=f_\Theta^g(\widetilde{\mathbf r}^{path}_{e,j,\ell})$，其中 $f_\Theta^g$ 是共享的一层隐藏层 MLP，输出标量，监督目标为估计相对 dB 增益 $\widehat{\overline g}_{e,j,\ell}$。

**3）逐信道位置估计。** 为输出最终信道级位置分布，对所有细化后的路径表征执行注意力池化。查询信道 $j$ 第 $\ell$ 条路径的池化权重为

$$
\alpha_{e,j,\ell}
=\frac{\exp(\mathbf w_p^T\widetilde{\mathbf r}^{path}_{e,j,\ell})}{
\sum_{q\in\mathcal L_{e,j}}
\exp(\mathbf w_p^T\widetilde{\mathbf r}^{path}_{e,j,q})},
\tag{28}
$$

其中 $\mathbf w_p\in\mathbb R^{D_m}$ 可训练。信道 token 定义为

$$
\mathbf r^{ch}_{e,j}
=\sum_{\ell\in\mathcal L_{e,j}}
\alpha_{e,j,\ell}
\widetilde{\mathbf r}^{path}_{e,j,\ell}.
\tag{29}
$$

逐信道位置头根据 $\mathbf r^{ch}_{e,j}$ 用一层隐藏层的 MLP 参数化 GMM，预测 $p^{ch}_\Theta(\mathbf p\mid\mathbf r^{ch}_{e,j})$，仍在目标观测位置 $\widehat{\mathbf p}_{e,j}$ 上监督。逐路径头保留单条传播路径的定位歧义，逐信道头则融合多条环境条件化路径，提供最终 UE 位置概率分布。

### D. 训练目标（Training Objective）

预训练同时使用上述三个任务。记 $\mathcal E_{tr}$、$\mathcal E_{te}$ 分别为训练及测试环境集。对抽样训练环境 $e\in\mathcal E_{tr}$，取互不重叠的 context/query 信道集合。设 query 路径 token 总数为 $N_{path}^{qry}=\sum_{j\in\mathcal Q_e}|\mathcal L_{e,j}|$。逐路径位置损失、相对增益损失与逐信道位置损失定义为

$$
\begin{aligned}
\mathcal L^{path}_{pos}
&=-\frac1{N_{path}^{qry}}
\sum_{j\in\mathcal Q_e}\sum_{\ell\in\mathcal L_{e,j}}
\log p^{path}_\Theta
(\widehat{\mathbf p}_{e,j}\mid\mathbf r^{path}_{e,j,\ell}),\\
\mathcal L_{gain}
&=\frac1{N_{path}^{qry}}
\sum_{j\in\mathcal Q_e}\sum_{\ell\in\mathcal L_{e,j}}
(\widehat{\overline g}^{pred}_{e,j,\ell}
-\widehat{\overline g}_{e,j,\ell})^2,\\
\mathcal L^{ch}_{pos}
&=-\frac1{|\mathcal Q_e|}
\sum_{j\in\mathcal Q_e}
\log p^{ch}_\Theta
(\widehat{\mathbf p}_{e,j}\mid\mathbf r^{ch}_{e,j}).
\end{aligned}
\tag{30}
$$

单次环境级任务的总损失为

$$
\mathcal L_e
=\mathcal L^{path}_{pos}
+\lambda_g\mathcal L_{gain}
+\lambda_{ch}\mathcal L^{ch}_{pos},
\tag{31}
$$

$\lambda_g,\lambda_{ch}>0$ 分别控制相对增益及信道级定位损失。总体训练目标是

$$
\min_\Theta
\mathbb E_{e\sim\mathcal E_{tr}}
\mathbb E_{\mathcal C_e,\mathcal Q_e}[\mathcal L_e].
\tag{32}
$$

外层对训练环境抽样求期望，内层对环境中的 context/query 划分求期望。整个训练及评估协议见图 3：预训练联合优化环境编码器与预测头；下游任务中冻结编码器，只更新任务专属下游模型；最终测试时编码器和下游模型都固定，只在完全未见的测试环境上评估泛化。

**图 3（原文第 8 页）**：预训练及下游协议。用 context-query 信道集合预训练编码器，随后冻结编码器，通过任务专属下游学习进行评估。

## IV. 下游任务（Downstream Tasks）

预训练后，冻结的编码器为环境 $e$ 输出 $\mathbf Z_e\in\mathbb R^{K_z\times D_m}$。设 UE 信道 $i$ 对应任务专属观测为 $\mathbf o_{e,i}$，预测目标为 $\widehat{\mathbf y}_{e,i}$，则条件化预测器统一写成

$$
\widehat{\mathbf y}_{e,i}
=f_\Psi(\mathbf o_{e,i},\mathbf Z_e),
\tag{33}
$$

其中 $\Psi$ 为任务专属可训练参数。本文考察三项任务：由单个空间信道矩阵估计 UE 位置、由稀疏波束测量恢复波束域 CSI、利用 NLoS 路径方向重建 RF 可观测几何。这分别检验 embedding 在定位、通信及几何推断任务中的复用能力。

### A. 从信道矩阵估计位置（Environment-Aware Channel Matrix-to-Position Estimation）

第一项任务测试环境嵌入能否帮助从**单个空间信道矩阵**推断 UE 位置。与预训练时显式提供路径时延及 AoA 不同，这里输入是 $\mathbf H_{e,i}\in\mathbb C^{N_x\times N_y}$，目标是 BS 中心位置 $\mathbf p_{e,i}\in\mathbb R^3$。预测器为

$$
\mathbf p^{pred}_{e,i}
=f_\Psi^{pos}(\mathbf H_{e,i},\mathbf Z_e).
\tag{34}
$$

将复信道矩阵按元素向量化，拼接实部与虚部形成实值特征；再与通过对 $\mathbf Z_e$ 进行注意力池化得到的环境特征拼接，输入 MLP 预测头输出位置。损失为平均位置平方误差：

$$
\mathcal L^{ds}_{pos}
=\mathbb E[\|\mathbf p^{pred}_{e,i}-\mathbf p_{e,i}\|_2^2].
\tag{35}
$$

该任务检验 $\mathbf Z_e$ 能否提供超出单个信道矩阵本身信息的站点专属定位上下文。

### B. 环境感知波束域 CSI 重建（Environment-Aware Beam-Domain CSI Reconstruction）

第二项任务研究根据 UE 反馈的部分波束增益重建下行波束域 CSI。实际波束管理中，受导频与反馈开销限制，BS 只能获得一部分波束测量；目标是根据稀疏、含噪的波束观测恢复完整二维 DFT 波束域接收功率地图。这有助于多用户 MIMO 中感知干扰的波束选择与信道状态预测 [11]。

所有环境使用相同的 BS 阵列配置和固定二维 DFT 波束码本 $\mathcal B=\{\mathbf f_m\}_{m=1}^M$，$\mathbf f_m\in\mathbb C^{N_xN_y}$，$M=N_xN_y$。UE $i$ 的完整下行波束域功率向量为 $\boldsymbol\gamma_{e,i}\in\mathbb R^M$，单位 dBm；第 $m$ 项代表 BS 用波束 $\mathbf f_m$ 时 UE 端的接收功率。设实际测量的码本索引集合为 $\Omega\subset\{1,\ldots,M\}$，稀疏观测定义为

$$
[\boldsymbol\gamma^\Omega_{e,i}]_m=
\begin{cases}
\widetilde\gamma_{e,i,m},&m\in\Omega,\\
0,&m\notin\Omega,
\end{cases}
\tag{36}
$$

$\widetilde\gamma$ 是在各向同性单天线 UE 假设下得到的含噪 dBm 功率。环境感知重建器为

$$
\widehat{\boldsymbol\gamma}_{e,i}
=f_\Psi^{beam}(\boldsymbol\gamma^\Omega_{e,i},\mathbf Z_e).
\tag{37}
$$

其中 $f_\Psi^{beam}$ 是使用环境潜在条件的 CNN，输出全波束功率向量。首先将稀疏 dBm 向量重排为二维 DFT 波束网格，再用卷积提取波束域特征；并行地，对 $\mathbf Z_e$ 的 latent tokens 执行注意力池化，形成环境上下文特征。随后拼接两类特征，由 MLP 预测完整 dBm 波束域输出。训练目标为

$$
\mathcal L^{ds}_{beam}
=\mathbb E[\|\widehat{\boldsymbol\gamma}_{e,i}
-\boldsymbol\gamma_{e,i}\|_2^2].
\tag{38}
$$

该任务检验环境 embedding 是否也能用于不直接表述成几何反演问题的站点专属通信任务。

### C. 由交互点估计进行环境重建（Environment Reconstruction via Interaction Point Estimation）

第三项任务测试 embedding 是否包含**可恢复的 RF 可观测几何信息**，而不仅能充当通信模型的条件变量。具体目标是重建 NLoS 路径与 BS 一侧关联的**第一交互点**。在已知路径 BS 中心 AoA 的情况下，模型沿该射线预测到第一个交互点的距离；收集这些点可得到以 BS 为中心的部分传播相关几何。

对于环境 $e$ 中 UE $i$ 的一条 NLoS 路径 $\ell$，设第一 BS 侧交互点为 $\mathbf s^{(1)}_{e,i,\ell}\in\mathbb R^3$，距离为 $r^{(1)}_{e,i,\ell}=\|\mathbf s^{(1)}_{e,i,\ell}\|$。路径级 AoA 观测为

$$
\boldsymbol\eta_{e,i,\ell}
=[\sin\widehat\theta_{e,i,\ell},
\cos\widehat\theta_{e,i,\ell},
\sin\widehat\phi_{e,i,\ell},
\cos\widehat\phi_{e,i,\ell}]^T.
\tag{39}
$$

以 GMM 建模的单维距离条件密度为

$$
p_\Psi^{rec}
(r\mid\boldsymbol\eta_{e,i,\ell},\mathbf Z_e).
\tag{40}
$$

采用训练环境 NLoS 路径样本上的负对数似然：

$$
\mathcal L_{rec}^{ds}
=-\mathbb E[
\log p_\Psi^{rec}
(r^{(1)}_{e,i,\ell}\mid\boldsymbol\eta_{e,i,\ell},\mathbf Z_e)].
\tag{41}
$$

根据预测距离分布，用最大似然得到距离点估计

$$
\widehat r_{e,i,\ell}^{(1)}
=\arg\max_r p_\Psi^{rec}
(r\mid\boldsymbol\eta_{e,i,\ell},\mathbf Z_e).
\tag{42}
$$

定义与 AoA 对应的单位方向向量

$$
\mathbf u^{AoA}_{e,i,\ell}
=[\sin\widehat\theta\cos\widehat\phi,
\sin\widehat\theta\sin\widehat\phi,
\cos\widehat\theta]^T,
\tag{43}
$$

其中 $\widehat\theta,\widehat\phi$ 指当前路径的 AoA，最终重建位置是

$$
\widehat{\mathbf s}_{e,i,\ell}^{(1)}
=\widehat r_{e,i,\ell}^{(1)}
\mathbf u^{AoA}_{e,i,\ell}.
\tag{44}
$$

在多条 NLoS 路径上重复此过程，即可获得稀疏的 RF 可观测环境几何重建。

## V. 仿真结果（Simulation Results）

本节使用从 26,000 个 BS 中心工厂场景生成的射线追踪信道评估 CHANNEL2WORLD。表 I 总结数据、模型及训练参数。预训练使用 $K_z=16$ 个环境 latent tokens，每个维度 $D_m=128$。一次预训练样本包含 128 个共同输入的上下文信道和同一环境的 32 个查询信道。环境编码器有四层信道内路径自注意力，以及六层交替的双向交叉注意力和自注意力聚合；预测模块包含八层双向交叉注意力、两层查询路径后处理自注意力。所有块都采用 Transformer 残差连接、四个注意力头、FFN 扩展比例 4，且不使用 dropout [36]。全模型可训练参数量约 **920 万**。

预训练分别考察 **error-aware** 和 **error-free** 两种输入。error-aware 将式 (18) 的等效分解误差施加到路径参数，并按式 (2) 在 UE 位置上注入观测误差：$\sigma_\tau=1$ ns，$\sigma_\theta=\sigma_\phi=1^\circ$，$\sigma_{pos}=0.1$ m，$\sigma_\xi=3$ dB。error-free 移除时延、角度和位置扰动，但同样保留 $\sigma_\xi=3$ dB 的 UE 侧增益波动。

**表 I　主要仿真和模型参数**

| 参数 | 数值 |
|---|---|
| 工厂基础布局 | 26 个随机布局 |
| 基础布局级训练/验证/测试划分 | 22 / 2 / 2 |
| 每布局 BS 数量 | 500 |
| BS 中心环境总数 | 26,000 |
| BS 高度及距墙偏移 | 15 m；0.2 m |
| UE 高度 | 1.5 m |
| UE 网格间隔 | 在 0.6–0.7 m 内随机 |
| 载波频率 | 7.0 GHz |
| 每信道最多路径数 | 12 |
| 每条路径最多交互次数 | 3 |
| 环境 latent token 数 $K_z$ | 16 |
| token 维度 $D_m$ | 128 |
| context / query 信道数量 | 128 / 32 |
| 注意力头 | 4 |
| 信道内路径自注意力层 | 4 |
| 编码器交叉注意力层 | 6 |
| 编码器自注意力层 | 6 |
| query 交叉注意力层 | 8 |
| query 路径自注意力层 | 2 |
| GMM 分量数 | 8 |
| GMM 最小标准差 $\sigma_{min}$ | 0.5 m |
| 预训练 batch size | 32 |
| 损失权重 $\lambda_g,\lambda_{ch}$ | 0.1；0.5 |
| error-aware 位置误差 $\sigma_{pos}$ | 0.1 m |
| error-aware 时延误差 $\sigma_\tau$ | 1 ns |
| error-aware 角度误差 $\sigma_\theta,\sigma_\phi$ | 1°；1° |
| UE 侧增益起伏 $\sigma_\xi$ | 3 dB |

### A. 数据生成（Dataset Generation）

数据使用 Remcom Wireless InSite 射线追踪生成。图 4 是代表性工厂布局。研究生成 26 种建筑几何随机化的基础布局，每种布局沿一面大墙每隔 1 m 安放一个 BS，共 500 个 BS 位置。BS 高度为 15 m，与墙面水平相距 0.2 m。UE 位置在服务区域内的密集二维网格上采样，网格间距随机在 0.6–0.7 m 变化，以削弱学习时对规则采样网格的依赖。

对于给定的工厂布局和 BS 位置，有效 UE 信道集合定义一个 BS 中心传播环境。射线追踪中关闭绕射，考虑最多三次反射的反射路径；每个信道最多保留最强的 12 条路径，剔除没有有效传播路径的信道。过滤后，每个环境包含 833–9,024 个有效信道—位置对，平均 4,999 对。随后执行水平镜像增强：反转 $x_e$ 轴并变换 UE 位置及路径参数。最终得到 $26\times500\times2=26,000$ 个唯一 BS 中心环境。

训练/验证/测试**按整个工厂基础布局划分**，而不是按 BS 位置划分，以阻止同一布局的邻近 BS 环境、镜像版本和 UE 样本跨集合泄漏。因此下游评估确实测试**未见建筑实现**的泛化，而不是对已经出现过的布局中的 BS 位置插值。

**图 4（原文第 9 页）**：射线追踪工厂数据集。一个沿墙的一维 BS 网格配合密集二维 UE 网格，为每个建筑布局生成多个 BS 中心传播环境。

### B. Channel2World 预训练（Channel2World Pretraining）

图 5 展示三项预训练目标随 epoch 的验证结果。两条位置曲线分别对应逐路径与逐信道 GMM 的负对数似然，增益曲线是相对路径增益的 RMSE。GMM 的虚线下界由最小分量标准差 $\sigma_{min}=0.5$ m 决定：对于均值正好落在目标位置上的三维球对称高斯，其最小 NLL 为 $(3/2)\log(2\pi\sigma_{min}^2)$。相对增益 RMSE 的下界为 $\sigma_\xi=3$ dB，因为目标中包含无法从信道—位置上下文预测的独立 UE 侧增益扰动。

图 6 可视化一个测试环境中单条 query path 的 UE 位置 GMM。查询 token 仅包含该路径的校准传播时延和 BS 中心 AoA。对于所展示的 NLoS 路径，这两项不足以唯一确定 UE 位置，因为逆映射取决于环境反射体几何。然而，error-aware 与 error-free 两个模型均能把 GMM 分量放到真实 UE 位置附近，即使环境没有参与预训练也如此。这表明从多个 context channel token 推断出的 $\mathbf Z_e$ 确实提供了足够环境信息，使模型能够结合周围反射体结构解释时延和 AoA。error-aware 输出分布更宽，符合注入噪声的情况；error-free 在理想路径输入下的估计更集中。

**图 5（原文第 10 页）**：error-aware/error-free 输入下的位置 GMM 验证损失及相对增益 RMSE。  
**图 6（原文第 10 页）**：一个测试环境中，查询路径对应的逐路径 UE 位置 GMM。

### C. 跨环境潜在空间连续性（Latent Continuity Across Environments）

图 7 分析无线世界 embedding 的潜在几何结构。每个 embedding 都由相应 BS 中心环境中随机选取的 1,024 个上下文信道推断。先从全部 26,000 个 embedding 中减去经验均值，再计算中心化 embedding 的余弦相似度。随机环境配对的参考线使用相同中心化和归一化程序，其平均相似度接近零，说明相近环境的正相似度并非由整体 embedding 偏置引起。

“同一镜像符号”曲线比较同一工厂基础布局、同一镜像增强标记下的 BS 中心环境。随着 BS 间距增加，相似度下降：相邻 BS 会观察到部分重叠的反射和遮挡结构，而距离较远的 BS 则具有更不同的局部传播关系。间距为零时，两个 embedding 对应同一环境，但使用不同随机上下文子集推断，因此相似度略低于 1。镜像符号不同的环境与随机配对参考线相近。虽然镜像场景可能共享粗略建筑复杂度，它的 BS 中心几何和 AoA—反射体对应关系却不同。

error-aware 编码器的同镜像环境相似度一般高于 error-free，意味着加入误差感知预训练可得到对局部扰动更平滑的潜在空间；相反，error-free 编码器保留更多站点专属细节，使相邻 BS 环境之间分得更清楚。

**图 7（原文第 10 页）**：同一工厂布局中相邻 BS 所获得无线世界 embedding 的余弦相似度。

### D. 以环境为条件的下游评估（Environment-Conditioned Downstream Evaluation）

使用冻结的 CHANNEL2WORLD 编码器，对信道矩阵—位置估计及波束域 CSI 重建执行环境条件化。实验从测试工厂布局随机选取 16 个 BS 中心环境，每个环境按 80%/20% 划分训练和测试子集，所有指标都在测试子集计算。比较设置如下：

- **Test: Site-specific：** 在每个选定测试环境的自身训练集上分别训练一个站点专属模型。
- **Test: Combined：** 合并全部 16 个目标测试环境的训练样本来训练一个模型。
- **Global：** 仅使用训练环境的所有样本训练统一模型，不使用测试环境样本。
- **Global + fine-tuning：** 从 Global 模型开始，用目标环境的 128、256 或 1,024 个任务标注样本，只更新轻量输出模块。
- **Proposed：** 与 Global 使用相同训练数据，但分别以冻结的 error-aware/error-free 编码器产生的 embedding 为条件。评估时，用目标环境训练子集的 128 个信道—位置样本推断 $\mathbf Z_e$，编码器和下游模型均不更新。
- **Mean、Shuffled：** 保持 Proposed 训练好的下游模型不变，在评估时用经验平均 embedding 或其他测试环境的 embedding 替换目标环境 embedding。

站点专属、合并训练和微调基线都使用目标环境的任务标签来训练或适配下游预测器。相比之下 Proposed 只使用目标环境样本**推断 embedding**，不做梯度适配。各方案使用相同的任务预测骨干，Proposed 仅额外加入轻量的 embedding 注意力池化模块。后续结果展示 $\mathbf Z_e$ 包含对下游任务有用的环境信息，可用于未见环境，而不必进行任务专属的目标环境适配。

**1）由信道矩阵估计位置。** 第一项任务在 7 GHz、$4\times8$ BS 阵列下，根据一个上行空间信道矩阵 $\mathbf H_{e,i}\in\mathbb C^{4\times8}$ 推断 BS 中心 UE 位置。图 8 绘制位置 RMSE 与下游模型可训练参数量的关系。各种模型规模下，Proposed 均优于不带环境条件的 Global。由于比较考虑了条件模块带来的参数变化，增益主要来自 $\mathbf Z_e$ 的目标环境信息，而不是模型规模。Proposed 也优于 Test: Site-specific 和 Test: Combined，虽然后两者使用了目标环境训练样本。这被归因于所选测试环境中的有限训练数据不足以涵盖足够多样的信道—位置映射。

对于微调基线，将 Global 最后一层线性层替换为一个带一层隐藏层的 MLP 适配头，只更新该头。随着目标环境样本增加，微调性能提升。使用 128 个样本时，即便其使用了与 Proposed 相同数量的目标环境样本，微调仍显著落后于 embedding 条件化；当使用 1,024 个样本时，微调利用远多于 Proposed 的**任务标注样本**超过后者。Mean 与 Shuffled 消融大幅退化，甚至差于 Global，证明条件化增益需要**与目标环境匹配的 embedding**。error-aware 与 error-free 的下游结果几乎相同，说明本文考虑的路径估计误差尚不足以显著损害这种 embedding 的用途。

**图 8（原文第 11 页）**：测试环境中的信道矩阵—UE 位置估计，展示位置 RMSE 对下游模型参数量的关系。

**2）波束域 CSI 重建。** 第二项任务在 7 GHz 用稀疏、含噪的测量恢复完整 $8\times16$ DFT 波束域接收功率图。BS 阵列为 $8\times16$，BS/UE 都使用各向同性天线元件（UE 单天线）。总发射功率、系统带宽和接收噪声功率谱密度分别为 24 dBm、20 MHz、$-174$ dBm/Hz。测量码本规模 $|\Omega|=12,16,24,32$ 对应固定波束子集 $2\times6$、$4\times4$、$3\times8$、$4\times8$。

Test: Site-specific、Test: Combined、Global 及微调模型约有 180 万参数，而 Proposed 因加入 latent pooling 约有 186 万参数。对于此类高维输入输出问题，微调基线不增加新初始化的适配头（少量目标环境样本可能导致过拟合），而是从 Global 权重出发，仅更新最后两层 MLP 预测块。图 9 给出以 dB 为单位的重建 RMSE。

随着测量波束数增加，误差一般下降；但由于不同固定波束图案提供的信息不同，趋势不是严格单调。Proposed 优于 Global，不过优势没有定位任务明显，因为波束重建在很大程度上属于已有波束测量之间的插值。目标环境基线反映此类高维任务的数据需求：Site-specific 受单环境样本量限制，而 Combined 受益于跨环境合并样本，在较大码本下更有竞争力。使用 128 和 256 个样本的微调与 Proposed 表现接近，但前者需要目标环境的波束域 CSI 标签及额外梯度适配。Mean、Shuffled 消融比定位任务更接近 Proposed，说明当稀疏波束测量已提供较充分的插值信息时，重建任务对 embedding 是否精确匹配环境不那么敏感。

**图 9（原文第 11 页）**：在测试环境中，根据稀疏码本波束观测重建波束域 CSI 的 RMSE。

**3）环境几何重建。** 第三项任务检验 embedding 是否包含可恢复的环境几何。由于 BS 中心 AoA 只能给出射线方向，第一个 BS 侧交互点的距离需要由 $\mathbf Z_e$ 推断。训练两个距离预测器：一个基于 error-aware 编码器、128 个 context channel-position 样本；另一个基于 error-free 编码器、1,024 个 context 样本。尽管 error-aware 只用较少且带扰动的观测，它仍达到 RMSE 3.91 m、MAE 1.94 m，与 error-free 的 RMSE 3.88 m、MAE 1.84 m 接近。图 10 展示部分重建案例，主要 BS 侧反射体结构及其大致空间范围得以恢复，但在拐角、不连续边界与观测稀疏区域精度较差。这是因为解码器对每条 AoA 射线**分别预测一个距离**，未加入表面连续性约束。因此只能认为 $\mathbf Z_e$ 保留了可恢复的 RF 可观测几何信息，不能把这个解码器当作完整的环境重建算法。

**图 10（原文第 12 页）**：由 NLoS 路径方向重建 RF 可观测几何。比较使用 error-aware 编码器及 128 个 context channel，与 error-free 编码器及 1,024 个 context channel 所推断 embedding 得到的交互点。

## VI. 结论（Conclusion）

本文提出 CHANNEL2WORLD，一种从 MIMO 信道—位置观测推断 BS 中心 RF 环境表示的无线基础模型。它把这些观测聚合成无线世界 embedding token，通过 context-query 预训练学习环境编码器。26,000 个随机 BS 中心环境的射线追踪评估说明，这些 embedding 捕获了站点专属传播结构，并能泛化至未见建筑布局。与不带条件和错误匹配 embedding 的基线相比，所推断的环境 embedding 改善了 UE 位置估计和稀疏波束域 CSI 重建。此外，RF 可观测几何重建表明 embedding 具有恢复主要反射体结构所需的信息。结果显示，信道—位置观测可为 AI 原生环境感知无线系统提供可复用的 RF 环境先验。未来工作包括利用多站点实测信道数据验证所提出框架。

## 参考文献（References）

参考文献编号与原文一致；作者姓名、年份、卷页等保留原文书目写法，以下翻译文献标题以便检索原意。正式论文引用请以[原文 References](https://arxiv.org/pdf/2608.17544v1) 为准。

[1] Hoydis 等（2022），《Sionna：面向下一代物理层研究的开源库》，arXiv:2203.11854。  
[2] Wen、Shih、Jin（2018），《面向大规模 MIMO CSI 反馈的深度学习》，IEEE WCL 7(5):748–751。  
[3] He 等（2019），《面向物理层通信的模型驱动深度学习》，IEEE Wireless Communications 26(5):77–83。  
[4] Heng、Mo、Andrews（2022），《学习站点专属探测波束以实现快速毫米波波束对齐》，IEEE TWC 21(8):5785–5800。  
[5] Alikhani、Charan、Alkhateeb（2025），《Large Wireless Model：面向无线信道的基础模型》，arXiv:2411.08872。  
[6] Liu 等（2025），《WiFo：面向信道预测的无线基础模型》，Science China Information Sciences 68(6):162302。  
[7] Yang 等（2025），《WirelessGPT：面向无线通信的生成式预训练多任务学习框架》，IEEE Network 39(5):58–65。  
[8] Guler、Geraci、Jafarkhani（2026），《使用对比学习和掩码自动编码器学习的多任务无线信道表征基础模型》，IEEE JSAC 44:4489–4504。  
[9] Jiang 等（2025），《利用 CIR–CSI 一致性的 MIMO 无线信道基础模型》，IEEE ICMLCN。  
[10] Mashaal、Abou-Zeid（2026），《IQFM：面向 AI 原生 6G I/Q 流的无线基础模型》，IEEE Open Journal of the Communications Society 7:1426–1441。  
[11] Moon 等（2026），《基于在线信道合成的 FR3 FDD MIMO AI 波束管理》，IEEE JSAC 44:3444–3458。  
[12] Aboulfotouh、Mohammed、Abou-Zeid（2025），《6G WavesFM：面向感知、通信与定位的基础模型》，IEEE Open Journal of the Communications Society 6:6792–6807。  
[13] Zheng 等（2026），《MUSE-FM：面向无线通信的多任务环境感知基础模型》，IEEE TWC 25:19791–19806。  
[14] Ye、Li、Juang（2018），《深度学习在 OFDM 信道估计与信号检测中的作用》，IEEE WCL 7(1):114–117。  
[15] Alrabeiah、Alkhateeb（2020），《使用 sub-6 GHz 信道进行毫米波波束及阻挡预测的深度学习》，IEEE Transactions on Communications 68(9):5504–5518。  
[16] O'Shea、Hoydis（2017），《物理层深度学习导论》，IEEE Transactions on Cognitive Communications and Networking 3(4):563–575。  
[17] Jiang 等（2025），《迈向信道基础模型：动机、方法与机遇》，arXiv:2507.13637。  
[18] Zeng、Xu（2021），《通过信道知识地图迈向环境感知 6G 通信》，IEEE Wireless Communications 28(3):84–91。  
[19] Zeng 等（2024），《通过信道知识地图实现 6G 环境感知通信：教程》，IEEE Communications Surveys & Tutorials 26(3):1478–1519。  
[20] Wu 等（2024），《利用信道知识地图实现环境感知混合波束成形》，IEEE TWC 23(5):4990–5005。  
[21] Klautau、González-Prelcic、Heath（2019），《利用 LiDAR 数据进行基于深度学习的毫米波波束选择》，IEEE WCL 8(3):909–912。  
[22] Alrabeiah 等（2020），《ViWi：视觉辅助无线通信的深度学习数据集框架》，IEEE VTC-Spring。  
[23] Xu 等（2023），《车联网通信中由计算机视觉辅助的毫米波波束对齐》，IEEE TWC 22(4):2699–2714。  
[24] Yang 等（2023），《环境语义辅助无线通信：毫米波波束预测及阻挡预测案例》，IEEE JSAC 41(7):2025–2040。  
[25] Alkhateeb 等（2023），《DeepSense 6G：大规模实测多模态感知和通信数据集》，IEEE Communications Magazine 61(9):122–128。  
[26] Levie 等（2021），《RadioUNet：利用卷积神经网络快速估计无线电地图》，IEEE TWC 20(6):4001–4015。  
[27] Jiang 等（2025），《可学习无线数字孪生：利用神经表示重建电磁场》，IEEE Open Journal of the Communications Society 6:1568–1590。  
[28] Zhang 等（2026），《RF-3DGS：结合无线电辐射场与三维高斯泼溅的无线信道建模》，IEEE TWC 25:10419–10433。  
[29] Yu 等（2025），《ChannelGPT：迈向用于 6G 环境智能通信的真实信道基础模型》，IEEE Communications Magazine 63(10):68–74。  
[30] Chen 等（2026），《面向 AI 原生 6G 网络的无线世界模型》，arXiv:2603.25216。  
[31] Zhou 等（2017），《低秩张量分解辅助的毫米波 MIMO-OFDM 信道估计》，IEEE JSAC 35(7):1524–1538。  
[32] Lin 等（2020），《考虑双宽带效应的毫米波 MIMO-OFDM 张量信道估计》，IEEE Transactions on Communications 68(7):4218–4232。  
[33] Moon 等（2026），《MAP-X：利用配备 MIMO 的高空平台进行实时广域测绘的大规模场数据处理》，IEEE TWC 25:4358–4373。  
[34] Lee 等（2019），《Set Transformer：基于注意力、对排列不变的神经网络框架》，ICML:3744–3753。  
[35] Jaegle 等（2021），《Perceiver：利用迭代注意力的通用感知》，ICML:4651–4664。  
[36] Vaswani 等（2017），《Attention Is All You Need》，NeurIPS 30。
