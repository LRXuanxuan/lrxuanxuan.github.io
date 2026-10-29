---
layout: page
title: "几何辅助信道推断：部分 CSI 与未标定数字孪生｜中文译稿（待终校）"
permalink: /papers/translations/2026-10-29-geometry-aided-channel-2609-37277/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2609.37277)

# 利用部分信道估计与未标定数字孪生的几何辅助信道推断

**原题：** Geometry-Aided Channel Deduction with Partial Channel Estimates and Uncalibrated Digital Twin  
**作者：** Hongning Ruan、Zhaoyang Zhang、Zirui Chen、Ziqing Xing、Zhaohui Yang、Merouane Debbah  
**版本：** arXiv:2609.37277v1，2026 年 9 月 29 日，共 16 页。部分工作曾发表于 IEEE PIMRC 2026。  
**状态：** 中文翻译与公式校对中；尚未完成逐页逐式终校。

## 摘要

无线多输入多输出（MIMO）正交频分复用（OFDM）系统中的高维信道状态信息（CSI）获取，通常需要较大的导频开销，或者依赖准确而完备的位置与环境信息。本文提出几何辅助信道推断（geometry-aided channel deduction，GCD）方法，利用仅包含近似环境几何与位置、尚未经校准的数字孪生（DT）辅助信道获取。其基本依据是：即便几何信息不够准确，也能提供当前信道的一部分结构性特征，而且这些信息可通过无线感知或现有地理数据库提前获得；与此同时，借助少量导频得到的粗略瞬时信道估计可以提供与信道结构对应的特定信息，进一步补偿几何误差和其他未知信道因素。

为此，作者首先从数字孪生中提取仅包含简单信道结构的几何特征，然后提出“随机提示增强”（random prompt augmentation）：把几何多径结构转为类似 CSI 的提示表示，同时抑制其他未知信道参数所造成的干扰。随后通过信道推断网络融合提示与基于导频的瞬时信道估计。为了进一步提高网络通用性，作者将导频配置纳入学习架构，支持可变导频图样。实验表明，所提方法能在较低导频开销下获得较高信道获取精度，对非理想几何信息具有鲁棒性。结构化提示还提供与场景相关的上下文，使方法能够较好地泛化至新场景。

**关键词：** 信道获取、信道推断、数字孪生、射线追踪、跨场景泛化。

## I. 引言

### A. 研究背景

未来无线网络将朝着更高连接密度、数据速率、频谱效率及智能化程度发展，推动技术包括超大规模 MIMO [2]、太赫兹通信、可重构智能表面（RIS）、堆叠智能超表面（SIM）[3] 与通信感知一体化（ISAC）[4]。阵列尺寸增大和带宽扩展令信道维数快速上升，低导频开销获取高维 CSI 越来越困难。

由于不同天线和子载波对应的物理传播环境相似，可用 CSI 的一个子集推断完整 CSI，从而降低导频开销。然而，复杂电磁传播机制使传统插值不容易取得最优性能。部分方法 [5]、[6] 从导频测量估计路径参数再重建 CSI，但参数估计往往需要较高复杂度。深度学习能够提取高维数据的潜在特征，已应用于信道估计 [7]；然而无线环境不断动态变化，数据驱动方法面临泛化问题：当传播条件因环境变化或用户跨场景移动而改变时，网络能否维持性能 [8]？同时，网络还应适应不同系统配置和导频图样。这些问题直接影响学习方法的实际部署。

### B. 相关工作

**1）基于导频的信道估计。** 神经网络已被广泛用于信道估计。例如，[9]、[10] 利用卷积神经网络（CNN）在频域插值，[11] 利用多层感知机（MLP）从部分天线 CSI 外推其他天线。文献 [12] 提出受物理结构启发的复数域 MLP-Mixer（CMixer），将部分天线—子载波估计映射为完整空频域 CSI，在多种情形下优于 MLP/CNN。这些网络通常只适用于特定导频配置。扩散模型 [13]–[15] 可通过后验采样支持任意导频设置，但在复杂多径条件下，仍需要足够导频才能保证估计质量。

**2）无导频信道预测。** 这类研究基于某些辅助信息可以确定性映射到完整 CSI 的假设，使用过去时隙的信道 [16]、[17]、用户位置 [18]、[19]、实时感知 [20] 或无线环境信息 [21]–[26] 进行预测。但小尺度移动与微小环境变化难以预测，自回归会累积误差。仅凭位置预测复数 CSI 通常要求远小于波长的定位误差，而仅依赖位置的模型还缺乏跨场景泛化。多模态实时感知方法会受到传感设备与未知电磁环境因素的制约。

一些工作 [21]–[23] 利用已知环境几何及实测信道数据校准材料参数或学习电磁交互，然后使用标定的数字孪生和射线追踪预测任意位置的信道；另一些方法 [24]–[26] 则不依赖显式环境几何，而根据实测信道重建无线辐射场。但这些方法往往仍需要高精度定位，并在每个场景产生额外数据采集和计算成本。由于天线硬件和设备朝向会改变辐射特性，缺少导频时，实际通常只能较可靠地获得接收信号强度或信道增益等大尺度信息 [31]、[32]，而难以获得完整复数 CSI，因此无法直接服务于多径条件下的检测与预编码。

**3）混合信道获取。** 近期研究尝试把导频与辅助信息融合：辅助信息提供信道先验结构以减少导频，少量即时导频又可校准不可预测的小尺度变化并降低对辅助信息精度的要求。[27] 的信道推断（CD）框架利用历史信道提供大尺度特征；[28] 的位置辅助 CMixer（PCMixer）融合位置和 CSI，可容忍一定定位误差。为进一步提升场景感知与泛化，[29] 从多视角图像提取环境特征后与部分 CSI 融合，但需要终端安装感知设备并持续采集图像。[28] 提出的空间信道推断（SCD）利用当前场景历史 CSI，[30] 则使用完整数字孪生提取知识。虽然这些方法有较高性能，但获取真实信道数据的成本较高，而完整数字孪生也要求昂贵的高精度环境信息和电磁参数标定。

**表 I：** 对基于导频估计、无导频预测与混合信道获取的相关工作进行比较，维度包括辅助信息、导频开销、对信息误差的鲁棒性、是否存在误差传播、跨场景泛化能力和数据采集成本。本文方法使用易获得的几何信息，并与少量导频结合，在这些维度之间实现不同的权衡。

### C. 动机与贡献

无线感知和既有地理数据库的发展，使静态环境地图相对容易获得，可据此建立近似的物理环境数字孪生。根据环境几何及收发机位置，可用射线追踪获取信道多径结构 [33]、[34]。即使几何存在误差，材料、天线方向图等多种因素不可观测，这些结构特征仍能作为有用先验；少量导频得到的即时估计则可补偿几何误差及其他未知因素。因而，无需电磁材料属性的未标定数字孪生也可有效辅助 CSI 获取。从网络训练角度看，几何先验还提供场景上下文，使网络可通过多场景协同训练抽取共性知识，改善新场景泛化。

虽然与数字孪生 [35] 或信道知识地图（CKM）[36] 辅助导频估计的研究有共同点，但本文存在三方面区别。第一，理想数字孪生既要求误差远小于波长的极高几何精度，也需要采集与计算资源校准环境材料的未知电磁参数 [21]。本文仅用近似几何产生结构信息，并通过随机提示增强消除未知路径幅度、相位的干扰。第二，实时数字孪生往往需要在线射线追踪 [34]；本文只在离线阶段进行射线追踪，在线阶段根据用户位置在邻域中查询已有特征。第三，CKM 通常部署于 BS，需要上传用户位置才能查询 [37]，因此更适于上行并可能引发隐私顾虑；本文允许用户端本地储存和查询预提取的结构数据，支持下行 CSI 获取，同时不必向 BS 泄露用户精确位置。

主要贡献为：建立基于可获得几何路径参数的 GCD 框架，用信道推断网络融合 DT 结构特征与基于导频的部分 CSI；提出随机提示增强，将简单几何转换为完整 CSI 形式，同时抑制未知因素；构造 GCDNet 与支持可变导频设置的 mGCDNet 两种网络；通过多种实验检验估计精度、几何误差鲁棒性、多场景训练与跨场景泛化。

第二节给出电磁传播及信道模型，第三节描述 GCD 及实现，第四节评估性能，第五节总结。

## II. 系统模型

### A. 电磁波传播

考虑从发射天线到接收天线的一条单频波传播链路 [38, 第 3 章]。天线的方向依赖辐射方向图定义为 $\mathbf g(\widehat{\mathbf k})=g(\widehat{\mathbf k})\widehat{\boldsymbol\psi}(\widehat{\mathbf k})$，其中 $\widehat{\mathbf k}$ 是三维辐射方向单位向量，$g$ 是复幅度增益，$\widehat{\boldsymbol\psi}$ 表示天线极化，即电场振荡方向。归一化约定 $g=1$ 对应无损各向同性天线。电场远场与 $d^{-1}e^{-jkd}\mathbf g(\widehat{\mathbf k})$ 成比例，$d$ 为传播距离，$k$ 为波数。

一般传播信道包含 $N_p$ 条路径。第 $p$ 条路径有长度 $d_p$、发射端出发方向 $\widehat{\mathbf k}_{T,p}$、接收端到达方向 $\widehat{\mathbf k}_{R,p}$ 及散射矩阵 $\boldsymbol\Xi_p=\xi_p\boldsymbol\Psi_p\in\mathbb C^{3\times3}$。$\xi_p$ 表示与环境电磁交互有关的复衰减和相移，$\boldsymbol\Psi_p$ 则表征不同极化分量间的相对幅相作用。LoS 路径满足 $\boldsymbol\Xi_p=\mathbf I$。

天线方向图的严格归一化约束为 $\int_0^{2\pi}\int_0^\pi \|\mathbf g(\widehat{\mathbf k})\|^2\sin\theta\,d\theta\,d\phi=4\pi\eta$，其中 $\theta,\phi$ 是天顶角和方位角，$\eta$ 为天线效率，表示输入功率中被转化为辐射的比例。

信道频率响应为

$$
h=\sum_{p=1}^{N_p}\alpha_p e^{-j2\pi f\tau_p},\qquad
\tau_p=d_p/c. \tag{1}
$$

$f$ 是载波频率，$c$ 为光速。发射和接收天线方向图分别为 $\mathbf g_T,\mathbf g_R$，路径系数为

$$
\alpha_p=\frac{\lambda}{4\pi d_p}
\mathbf g_R(\widehat{\mathbf k}_{R,p})^\mathsf H
\boldsymbol\Xi_p\,
\mathbf g_T(\widehat{\mathbf k}_{T,p}). \tag{2}
$$

这一表达考虑传播距离、天线辐射、环境电磁交互以及入射与接收极化失配。

### B. 信道模型

考虑包含 $N_t$ 根 BS 天线和 $N_c$ 个子载波的 MIMO-OFDM 系统，BS 服务单天线用户。下行空频域信道记为 $\mathbf H\in\mathbb C^{N_t\times N_c}$。第 $n_c$ 个子载波相对频率偏移为 $\Delta f_{n_c}=n_c\Delta f$，$\Delta f$ 是子载波间距。令 $\mathbf d_{n_t}$ 表示第 $n_t$ 根 BS 天线相对本地原点的位置。假设 BS 端波前局部为平面波，由天线相对位置导致的传播延迟差为 $\Delta\tau_{n_t,p}=-\mathbf d_{n_t}^\mathsf T\widehat{\mathbf k}_{T,p}/c$。将频率与延迟偏移代入式（1），得到

$$
H[n_t,n_c]=\sum_{p=1}^{N_p}
\alpha_p e^{-j2\pi(f+\Delta f_{n_c})(\tau_p+\Delta\tau_{n_t,p})}. \tag{3}
$$

近似展开为

$$
H[n_t,n_c]\approx\sum_{p=1}^{N_p}
\alpha_p e^{-j2\pi f\tau_p}
e^{-j2\pi n_c\Delta f\tau_p}
e^{jk\mathbf d_{n_t}^\mathsf T\widehat{\mathbf k}_{T,p}}. \tag{4}
$$

利用 $N_{t,\pi}$ 根天线、$N_{c,\pi}$ 个子载波发送未预编码导频，得到部分信道 $\mathbf H_\pi=\mathbf H[\Omega]\in\mathbb C^{N_{t,\pi}\times N_{c,\pi}}$，其中 $\Omega=\Omega_t\times\Omega_c$ 为导频在天线—子载波索引中的笛卡儿积。假设导频在 $N_t\times N_c$ 网格中均匀间隔，图样为

$$
\Omega_t=S_t+\{0,R_t,\ldots,(N_{t,\pi}-1)R_t\},
\quad S_t\in\{1,\ldots,R_t\},\quad R_t=N_t/N_{t,\pi}, \tag{5a}
$$

$$
\Omega_c=S_c+\{0,R_c,\ldots,(N_{c,\pi}-1)R_c\},
\quad S_c\in\{1,\ldots,R_c\},\quad R_c=N_c/N_{c,\pi}. \tag{5b}
$$

$R_t,S_t$ 分别是空间域天线导频的间隔和起点，$R_c,S_c$ 是频域子载波导频的间隔和起点。具体而言，在一个近似不变的信道相干块内，BS 在 $\Omega_c$ 中各子载波上进行 $N_q\ge N_{t,\pi}$ 次导频传输。第 $q$ 次在子载波 $n_c\in\Omega_c$ 上收到 $y_{q,n_c}=\mathbf h_{n_c}^\mathsf T\mathbf x_{q,n_c}+w_{q,n_c}$，其中 $\|\mathbf x_{q,n_c}\|_2^2=P$，噪声 $w_{q,n_c}\sim\mathcal{CN}(0,\sigma_w^2)$。

按 [39] 的方案，取 $N_q=N_{t,\pi}$，$\Omega_t$ 中各天线在不同传输时隙轮流发送导频。于是每个导频向量只有一项非零，在导频位置能直接估计 $h'_{n_t,n_c}=y_{q(n_t),n_c}/x_{q(n_t),n_c}=h_{n_t,n_c}+\widetilde w_{q(n_t),n_c}$，其中估计噪声方差 $\widetilde\sigma_w^2=\sigma_w^2/P$。除专门的噪声实验外，论文默认能够获得无噪声的部分 CSI $\mathbf H_\pi$。

### C. 可获取的信道特征

将式（4）改写为

$$
H[n_t,n_c]=\boldsymbol\phi_{n_t,n_c}^\mathsf T\widetilde{\boldsymbol\alpha}, \tag{6}
$$

其中 $\boldsymbol\phi_{n_t,n_c},\widetilde{\boldsymbol\alpha}\in\mathbb C^{N_p}$，其第 $p$ 个元素为

$$
\phi_{n_t,n_c,p}
=e^{-j2\pi n_c\Delta f\tau_p}
e^{jk\mathbf d_{n_t}^\mathsf T\widehat{\mathbf k}_{T,p}}, \tag{7}
$$

$$
\widetilde\alpha_p=\alpha_p e^{-j2\pi f\tau_p}. \tag{8}
$$

$\boldsymbol\phi$ 描述天线与子载波对应的相位偏移，取决于路径几何参数 $\{(d_p,\widehat{\mathbf k}_{T,p})\}_{p=1}^{N_p}$ 与系统参数 $(f,\Delta f,\mathbf d_{n_t})$。只要环境地图、BS 和用户位置已知，就可通过射线追踪得到多径长度与出发方向。实践中，环境地图可通过无线感知或 GIS 获取，位置可由 GNSS 等提供，但出于隐私考虑，收发方可能不愿向外部透露位置。

几何数据存在误差，因此载频相关的快速相位项 $e^{-j2\pi f\tau_p}$ 可能无法预测 [40]。作者故意不把它放进可获得的结构特征 $\boldsymbol\phi$，而是并入未知的 $\widetilde{\boldsymbol\alpha}$。相比之下，工作频率、子载波间距和阵列相对位置是由频段配置和阵列硬件确定的固定量，假设可以准确取得。因此 $\boldsymbol\phi$ 可以根据可用信息计算。

将式（2）代入式（8）得

$$
\widetilde\alpha_p=
\frac{\lambda}{4\pi d_p}
\mathbf g_R(\widehat{\mathbf k}_{R,p})^\mathsf H
\boldsymbol\Xi_p\mathbf g_T(\widehat{\mathbf k}_{T,p})
e^{-j2\pi f\tau_p}. \tag{9}
$$

其中唯一可直接确定的是传播距离给出的衰减 $\lambda/(4\pi d_p)$。散射矩阵取决于材料电磁性质，收发天线方向图则取决于硬件状态和设备朝向，高频相位又对几何误差敏感。所以 $\boldsymbol\phi$ 表示可获得的结构信息在天线与子载波上的投影，而 $\widetilde{\boldsymbol\alpha}$ 表示跨天线与子载波共享的未知信息。虽然 CSI 维度达到 $O(N_tN_c)$，潜在未知路径系数的维数却相对较低。利用已知几何信息可减少需要由导频补偿的未知量。

**图 1：** 所提信道获取框架总览：环境地图和 BS 位置形成场景表示，用户用位置检索上下文，与部分 CSI 一并输入神经网络，得到完整 CSI。

## III. 所提框架

为利用已知结构信息提升信道获取效率，本文提出 GCD 框架。BS 维护一个未标定 DT，包含 BS 位置与近似环境地图。用户在本地根据其位置检索 DT 几何特征，并结合已知系统配置转为场景提示。同时，用户从导频及接收信号估计部分瞬时信道。最终在用户端部署神经网络，融合提示与部分 CSI 并生成完整 CSI。图 2(a) 展示具体流程。

### A. 几何特征提取

直接根据真实用户位置在线射线追踪存在两个缺点：必须在 BS 与用户之间交换位置，造成隐私顾虑；用户位置变化又要求反复进行实时射线追踪，导致较大的计算开销和推理时延 [34]。

因此，作者改为由 BS 离线预提取多径信息，无需真实用户位置。首先在环境地图上采样 $N$ 个虚拟用户位置 $\mathbf x_1,\ldots,\mathbf x_N$，粗略覆盖潜在用户活动区域。然后在这些位置开展射线追踪，获得几何特征集合

$$
\mathcal F=\{(\mathcal P_1,\mathbf x_1),\ldots,
(\mathcal P_N,\mathbf x_N)\},\qquad
\mathcal P_i=\{(d_{i,p},\widehat{\mathbf k}_{i,p})\}_{p=1}^{N_{p,i}}.
$$

$\mathcal P_i$ 表示虚拟位置 $\mathbf x_i$ 的信道结构，$N_{p,i}$ 是从 BS 到该位置的路径数，$d_{i,p}$ 与 $\widehat{\mathbf k}_{i,p}$ 是路径长度和出发方向。由于 $\mathcal F$ 只包含离散有限位置的路径参数，数据量较小，可作为紧凑场景表示，在初始接入时提供给用户并储存于用户侧。多用户共处同一场景时，可通过广播/组播共享，避免重复传输。

用户获得 $\mathcal F$ 后，可在本地利用自身位置 $\mathbf x$ 检索距离最近的 $n$ 个虚拟位置 $\mathbf x_{i_1},\ldots,\mathbf x_{i_n}$ 及相应结构 $\mathcal P_{i_1},\ldots,\mathcal P_{i_n}$。假设空间邻近位置的散射环境具有相似性，便可用这些邻居的结构近似实际位置的结构，无须向 BS 报告精确位置。

### B. 随机提示增强

GCD 要融合的几何特征与部分 CSI 属于不同模态，数据格式差异较大。为便于在同一表示空间中学习，作者把各 $\mathcal P_i$ 转为完整形状的伪信道 $\widetilde{\mathbf H}_i\in\mathbb C^{N_t\times N_c}$，作为能够与 $\mathbf H_\pi$ 直接融合的上下文提示。该模态对齐看似类似视觉语言模型把图像转换为文本 token，但路径参数和信道响应之间受确定的物理规律约束 [41]，若仅让可学习模块自行寻找映射，未必符合传播规律。随机提示增强不直接学习这种映射，而是根据式（6）的物理信道形式手动计算伪信道，让后续网络以和真实 CSI 相同的形式处理它。

设 $\widetilde H_i[n_t,n_c]=\boldsymbol\phi_{i,n_t,n_c}^\mathsf T\widetilde{\mathbf z}_i$，其中几何结构与系统配置可确定

$$
\phi_{i,n_t,n_c,p}
=e^{-j2\pi n_c\Delta f\tau_{i,p}}
e^{jk\mathbf d_{n_t}^\mathsf T\widehat{\mathbf k}_{i,p}},
\qquad \tau_{i,p}=d_{i,p}/c. \tag{10}
$$

而未知路径复系数由随机占位向量 $\widetilde{\mathbf z}_i$ 替代：

$$
\widetilde H_i[n_t,n_c]
=\boldsymbol\phi_{i,n_t,n_c}^\mathsf T\widetilde{\mathbf z}_i, \tag{11}
$$

$$
\widetilde z_{i,p}=\frac{\lambda}{4\pi d_{i,p}}z_{i,p},
\qquad z_{i,p}\sim\mathcal{CN}(0,\sigma_z^2). \tag{12}
$$

$\sigma_z$ 控制未知因素的幅度尺度，实验设为 0.5，作者称方法对此参数不敏感。

随机占位项发挥两种作用。首先，它补足原本不可获得的路径参数，使已知多径结构可以变成一个完整的 CSI 格式，便于在同一个特征空间进行融合。其次，每次形成伪 CSI 都对未知路径因素随机采样，网络不易从这些随机数中学习稳定规律，因此更可能关注伪信道之间共享的几何结构，而不依赖随机占位与真实 CSI 的虚假相关性。这类似数据增强对过拟合的抑制，但增强对象不是训练标签样本，而是输入的场景提示。

**图 2：** (a) GCD 的 BS 离线几何提取与用户在线邻域采样、随机提示增强、部分 CSI 融合流程；(b) 固定导频和可变导频情况下预映射模块的差异。

### C. 信道推断网络

**1）GCDNet。** 遵照 [27]，使用信道推断网络融合伪信道与部分信道。先对 $\mathbf H_\pi$ 进行预映射，生成完整维度的 $\mathbf H_{\mathrm{PM}}\in\mathbb C^{N_t\times N_c}$；再融合邻域的 $\widetilde{\mathbf H}_{i_1},\ldots,\widetilde{\mathbf H}_{i_n}$ 与 $\mathbf H_{\mathrm{PM}}$，得到信息更丰富的 $\mathbf H_{\mathrm{FM}}$；最后精修成完整 CSI 输出 $\widehat{\mathbf H}$。

预映射和精修模块在空频域处理信道，都使用 CMixer [12]，其结构见图 3(a)。CMixer 将复输入 $\mathbf H_{\mathrm{in}}\in\mathbb C^{N_{t,\mathrm{in}}\times N_{c,\mathrm{in}}}$ 和复输出 $\mathbf H_{\mathrm{out}}\in\mathbb C^{N_{t,\mathrm{out}}\times N_{c,\mathrm{out}}}$ 表示成形状分别为 $N_{t,\mathrm{in}}\times N_{c,\mathrm{in}}\times2$、$N_{t,\mathrm{out}}\times N_{c,\mathrm{out}}\times2$ 的实数张量。它由 $K$ 层交错学习层和两个执行维数变换的交错线性投影组成；交错层结构见图 3(c)。这种设计契合空频域 CSI 的内在结构，具有较高参数效率。

一个 $K$ 层 CMixer 实现预映射 $\mathrm{PM}:\mathbb C^{N_{t,\pi}\times N_{c,\pi}}\to\mathbb C^{N_t\times N_c}$，产生 $\mathbf H_{\mathrm{PM}}=\mathrm{PM}(\mathbf H_\pi)$；另一个 $K$ 层 CMixer 实现精修 $\mathrm{RM}:\mathbb C^{N_t\times N_c}\to\mathbb C^{N_t\times N_c}$，输出 $\widehat{\mathbf H}=\mathrm{RM}(\mathbf H_{\mathrm{FM}})$。

信道信息融合模块采用注意力机制，使即时估计与多个伪信道的特征相互交互，结构见图 3(d)–(e)。各输入信道先经形状变换与线性投影压缩为 $D$ 维实数向量，再叠加可学习嵌入，以区分即时估计与场景伪信道。随后输入具有 $L$ 层的 Transformer 编码器进行信息交互。取对应 $\mathbf H_{\mathrm{PM}}$ 的最后输出向量，经线性投影与维数恢复得到 $\mathbf H_{\mathrm{FM}}$，整个过程记为

$$
\mathbf H_{\mathrm{FM}}=
\mathrm{FM}(\widetilde{\mathbf H}_{i_1},\ldots,
\widetilde{\mathbf H}_{i_n},\mathbf H_{\mathrm{PM}}).
$$

**2）掩码增强 GCDNet。** 以上预映射仅接收部分 CSI，不包含导频位置，因此只能适用固定的导频图样 $\Omega$（即 $R_t,R_c,S_t,S_c$ 均固定）。为提高通用性，作者把导频位置显式输入预映射模块。定义空频网格上的二值掩码

$$
M[n_t,n_c]=
\begin{cases}1,&(n_t,n_c)\in\Omega,\\
0,&(n_t,n_c)\notin\Omega.
\end{cases} \tag{13}
$$

在非导频位置填零，得到稀疏 CSI $\widetilde{\mathbf H}=\mathbf H\odot\mathbf M\in\mathbb C^{N_t\times N_c}$。先将其转为 $N_t\times N_c\times2$ 的实数张量，再拼接掩码得到 $N_t\times N_c\times3$。经过 $K$ 个与原 CMixer 类似的交错学习层，最后使用输入通道数为 3、输出通道数为 2 的 $1\times1$ 卷积，恢复 $N_t\times N_c\times2$ 形状。扩展模块称为 mCMixer，预映射写为 $\mathbf H_{\mathrm{PM}}=\mathrm{mPM}(\widetilde{\mathbf H},\mathbf M)$。用它替换 GCDNet 的原预映射层，得到掩码增强网络 mGCDNet，可处理不同导频间隔与起点。

**图 3：** (a) CMixer、(b) mCMixer、(c) 交错学习层、(d) Transformer 编码器、(e) 编码层。符号“+”表示残差连接，“C”表示拼接。

### D. 训练与推理

训练 (m)GCDNet 需要来自通信场景的数据集 $\mathcal D$，每个样本 $(\mathbf H,\mathbf x)$ 含完整 CSI 和用户位置，同时该场景应提供几何特征集 $\mathcal F$。由于几何先验带来场景上下文，可跨不同场景进行协同训练。假设共有 $M$ 个训练场景，每个具有自己的数据集和几何特征集；$M=1$ 就退化为单场景学习。为了增强 mGCDNet 的通用性，训练时还混合多个预定义导频图样 $\{\Omega_\ell\}_\ell$。

每个训练步骤先从 $\{1,\ldots,M\}$ 均匀抽取场景索引 $m$，再从对应数据集采样 $(\mathbf H,\mathbf x)$，同时从导频图样集中采样 $\Omega$。据此从完整 CSI 构造 $\mathbf H_\pi$、零填充 CSI $\widetilde{\mathbf H}$ 和掩码 $\mathbf M$，输入信道推断网络并得到 $\widehat{\mathbf H}$。

为减轻信道绝对幅度变化的影响，作者根据已知部分 CSI 估计平均功率 $P_H=\|\widetilde{\mathbf H}\|_F^2/\|\mathbf M\|_1$，在输入网络前执行 $\mathbf H\leftarrow\mathbf H/\sqrt{P_H}$。归一化使输入信道平均功率为 1，有利于稳定训练、降低学习负担。使用 Adam 优化器，最小化归一化真值与预测之间的均方误差：

$$
\mathcal L=\frac{\|\mathbf H-\widehat{\mathbf H}\|_F^2}{N_tN_c}.
$$

推理阶段同样使用 $\sqrt{P_H}$ 对输入归一化，再对预测执行 $\widehat{\mathbf H}\leftarrow\sqrt{P_H}\widehat{\mathbf H}$，恢复绝对幅度尺度。

由于射线追踪与特征提取离线执行，在线只需邻居搜索、伪 CSI 生成与网络前向传播。若在 $N$ 个虚拟位置的距离中寻找最小的 $n$ 个，邻域搜索开销为 $O(N+N\log n)=O(N\log n)$。伪 CSI 构造开销为 $O(N_tN_cN_p n)$，其中 $N_p$ 为最大路径数。网络前向复杂度可写为 $O\!\left(K(N_cN_t^2+N_tN_c^2)+N_tN_cDn+L(D^2(n+1)+D(n+1)^2)\right)$（具体各层常数取决于实现）。

{% endraw %}
