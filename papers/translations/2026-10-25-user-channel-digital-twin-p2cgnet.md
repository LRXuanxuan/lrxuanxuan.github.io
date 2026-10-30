---
layout: page
title: "生成式 AI 赋能的用户专属信道数字孪生｜中文译稿（2026-10-30 补译，未逐句终校）"
permalink: /papers/translations/2026-10-25-user-channel-digital-twin-p2cgnet/
math: true
toc: true
---

[← 返回论文库](/papers/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3714387)

# 生成式人工智能赋能的用户专属信道数字孪生：面向高效无线优化

**原题：** Generative AI-Empowered User-Specific Channel Digital Twin for Efficient Wireless Optimization  
**作者：** Shaowen Xiong、Shiwen He、Guanghui Chen、Zhenyu Tao、Hongxin Lin、Yongming Huang  
**来源：** *IEEE Transactions on Wireless Communications*, Vol. 25 (2026), DOI: 10.1109/TWC.2026.3714387。  
**译稿状态（2026-10-30）：** 已扩充正文 I–VI、公式（1）–（47）、算法 1–2、实验与结果、附录 A–C 及证明细节；本轮补入原文表 I 仿真参数的逐格转录与全部 44 条英文参考文献。表 II–V 仍为关键数值概述，逐句人工终校未做。**目前不是完整精校译本。**

## 摘要

无需反馈的用户专属信道获取对于网络数字孪生（digital twin，DT）和信道预测等无线应用至关重要，特别是在感兴趣位置（positions of interest，POI）处。然而，无线信道维度不断增加，给高效信道获取带来了重大挑战。本文提出一种用于多输入多输出正交频分复用（MIMO-OFDM）系统的用户专属信道生成模型，称为**位置到信道生成网络**（Position-to-Channel Generative Network，P2CGNet）。

通过将无分类器引导（classifier-free guidance）扩散模型与 Transformer 架构相结合，P2CGNet 可以在给定用户位置和频率偏移量的条件下生成高保真信道。为了在保持生成保真度的同时提高计算效率，本文进一步开发了基于 patch 的子信道分解策略和隐式去噪机制。理论分析表明，P2CGNet 能够学习潜在信道分布并加速推理。

作为实际应用验证，本文将 P2CGNet 集成到信道数字孪生中，在使用稀疏探测波束测量的多用户 MIMO-OFDM 系统中，执行空间—时间—频率联合资源优化。为此，提出智能资源块分配和波束对准模型（Resource Block assignment and Beam Alignment，R2BA），借助信道数字孪生与先验通信模型获取面向任务意图的测量，并采用分层图神经网络提取有效表示。

数值结果表明，在信道生成质量、数据效率、天线规模可扩展性和计算开销方面，P2CGNet 总体优于普通扩散模型以及基于生成对抗网络的方法。同时，P2CGNet 在信道信息陈旧时具有更好的鲁棒性；它能够根据给定 POI 生成信道，显著提升下游任务的频谱效率。

**索引词：** MIMO、OFDM、生成式人工智能、扩散模型、信道生成、数字孪生、资源管理。

## I. 引言

高性能计算和人工智能（AI）的快速发展推动了数据驱动方法在无线优化任务中的应用，包括信号检测、预编码，以及空间—时间—频率（spatio-temporal-frequency，STF）资源管理。这些方法能够缓解传统方案的计算负担 [1]、[2]。然而，随着 5G/6G 系统采用大规模 MIMO 和 OFDM 架构，无线信道状态信息（CSI）的维度显著增加。传统 CSI 估计依赖周期性导频传输与反馈机制，带来过高的频谱开销和时延；在需要准确 CSI 进行波束对准（beam alignment，BA）和预编码的动态环境中尤其如此。

与此同时，6G 网络中的新兴数字孪生应用需要高效的预验证能力 [3]–[6]，因此要求在给定位置或 STF 条件下可靠地生成虚拟 CSI [7]。本文关注的是：不依赖精确信道模型或高保真三维环境模型，只使用相对稀疏的测量数据，如何重建足够准确的、与具体场景相适应的信道。

尽管 COST 和 3GPP CDL 等标准化模型已经在大规模信道表征方面取得显著成效，但如果没有专家驱动的重新配置，往往难以适应特定地点的信道分布。基于射线追踪的方法具有更高的灵活性，但计算成本随天线阵列规模和材料复杂度增加而显著升高，而且性能依赖通常难以构建和校准的准确三维环境模型。传统空间插值方法在稀疏或含噪测量条件下也受到限制，通常难以生成与物理传播规律一致的外推结果。

一种有前景的替代方案是利用先进的生成模型和相对稀疏的 STF-CSI 测量建立轻量级预测模型，从而以较低成本获取欠采样位置的 CSI，服务于波束对准和定位等无线 AI 任务。

### A. 相关工作

**1）信道地图构建：** 信道地图（channel map，CM）是一种面向环境感知通信的新兴 CSI 获取工具 [8]。构建方法之一是借助历史环境感知 CSI 数据或信道模型生成数据，学习环境相关的 CSI 映射 [9]–[12]。换言之，这是一类数据驱动或模型与数据联合驱动的 CSI 插值、增强方案。另一类方法利用神经辐射场技术 [13]–[16]，在一定程度上模拟电磁传播，同时降低传统确定性射线追踪的计算复杂度。但这类方法多集中于信道增益等大尺度 CSI 的获取，难以直接用于预编码、波束对准等需要复杂小尺度信道信息的无线优化任务。此外，相关研究多采用 MLP 或卷积神经网络作为骨干，捕获环境与 CSI 之间复杂分布关系的能力有限，因此可能出现泛化不足或需要高密度训练测量的问题。

**2）数据驱动信道估计：** 为降低导频开销，已有研究利用隐式 CSI 测量进行信道估计或外推 [17]–[22]。生成对抗网络（GAN）和扩散模型（diffusion model，DM）被用于学习导频测量与信道矩阵之间的分布关系。扩散模型还可以与通信理论模型结合：例如，先学习 CSI 先验，再从导频和接收信号推导变分 CSI 推断方法；或者使用解析导频信号模型进行后验推断，以提高信道重建精度。另一类方法通过时频域及天线维度的少样本插值、外推避免完整高维 CSI 反馈。但这类方法仍依赖一定导频反馈，难以满足完全无反馈的用户专属信道生成需求。

**3）生成式信道模型：** 生成式 AI 已被用于合成用户专属信道数据。既有研究使用 GAN 增强单频 MIMO 信道数据，或结合自监督潜在信道表示、Transformer 和位置输入，生成 MIMO 预编码矩阵。但潜在表示的可靠解码常需要全面的信道采样，推理速度也有限。另有研究提出条件去噪扩散隐式模型（conditional denoising diffusion implicit model，cDDIM），用于用户专属 MIMO 信道生成；不过在推理加速与具体位置条件下的生成精度方面仍有改进空间。

### B. 研究动机与贡献

作者总结了现有用户专属信道生成方法的三类局限。第一，潜在信道表示虽然降低了建模维度，却可能需要大量昂贵的训练数据才能得到稳定的潜在模型。第二，GAN 或普通扩散模型难以在高维 MIMO-OFDM 信道下同时保证质量、一致性和足够低的推理时延。第三，现有下游验证往往局限于信道压缩反馈或波束对准等相对简单的问题，缺少对数字孪生系统级关键性能指标的验证。

因此，本文提出无需反馈的 P2CGNet，并将其作为信道地图的一种实现，预测与具体用户位置相关的小尺度 MIMO-OFDM 信道。不同于不需要位置标签、用于学习 CSI 低维表示的信道图（channel charting），P2CGNet 的目标是从稀疏测量中推断欠采样位置的 CSI。作者还将 P2CGNet 集成到信道数字孪生，在多用户 MIMO-OFDM 系统中验证联合 STF 资源优化。

主要贡献包括：在波束域构建基于无分类器引导 cDDIM 与 patch 化 Transformer 分数估计网络的高效用户专属 MIMO-OFDM 信道生成模型；从理论上分析条件引导扩散分数匹配精度及少步推理加速所需条件；开发面向资源块组分配和波束对准的 R2BA 框架，通过先验通信模型与 P2CGNet 合成任务相关数据，并使用分层图神经网络提取有效特征；最后在信道生成质量、数据效率、天线规模扩展性、计算开销以及下游通信性能方面开展仿真验证。

## II. 系统模型

### A. 信道模型与问题说明

考虑单基站、多用户 MIMO-OFDM 通信系统，覆盖区域为 $\Omega\subseteq\mathbb R^3$，基站（BS）和每个用户设备（UE）分别具有 $N_t$ 根发送天线和 $N_r$ 根接收天线。设用户 $u$ 相对于基站的位置为 $\mathbf x_u\in\Omega$，在时刻 $\tau$、第 $k$ 个子载波上，其 MIMO 信道为 $\mathbf H^\tau_{u,k}\in\mathbb C^{N_r\times N_t}$。

在 $L$ 条传播路径的几何多径模型下，信道由各路径的复增益、到达角与出发角所对应的阵列响应叠加而成：

$$
\mathbf H^\tau_{u,k}
=\sum_{\ell=1}^L\beta^\tau_{u,k,\ell}\,
\mathbf a_r(\overleftarrow\theta^\tau_\ell,\overleftarrow\psi^\tau_\ell)
\mathbf a_t^H(\overrightarrow\theta^\tau_\ell,\overrightarrow\psi^\tau_\ell).
\tag{1}
$$

其中 $N_{\rm sc}$ 为子载波总数，$B$ 为带宽参数；$\overleftarrow\theta$、$\overleftarrow\psi$ 对应方位与俯仰到达角，$\overrightarrow\theta$、$\overrightarrow\psi$ 对应出发角；每条路径还具有路径功率、相位和时延。原文式（2）给出了复信道增益与功率、相位及频率相关时延项之间的关系。

对固定时刻 $\tau$，用户位置、角度、多径数和路径复增益等量具有用户专属性与随机性。随着 MIMO-OFDM 系统规模扩大，直接获取完整信道矩阵成本不断增加，传统 CSI 估计难以满足数字孪生应用。因此，作者希望利用稀疏真实 CSI 数据学习位置相关的**小尺度信道生成模型** P2CGNet，再将其集成到信道数字孪生中，为感兴趣位置（POI）的下游任务提供 CSI。

论文特别说明：当前模型是一种面向任务、与测量同步更新的虚拟信道表示，**而不是完整物理层无线数字孪生**。它定期通过稀疏 CSI 与位置测量更新，能够依据空间与频率信息生成瞬时 CSI，但不显式模拟连续的时间演化。因此更适合局部准静态场景；当高速移动导致明显多普勒效应时，需要额外引入显式时变信道模型。

### B. 下游任务：资源块组分配与波束对准联合优化

考虑下行多用户 MIMO-OFDM 单流传输系统，将时频资源组织为物理资源块（physical resource block，PRB），再将多个 PRB 归并为资源块组（resource block group，RBG），作为资源分配单位。用二元变量 $\mu_{u,q}\in\{0,1\}$ 表示是否将第 $q$ 个 RBG 分配给用户 $u$。基站为用户配置发送波束 $\mathbf w_u$，用户配置接收波束 $\mathbf v_u$，每条链路还受到其他用户干扰和加性高斯白噪声的影响。

原文式（3）与式（4）分别建立接收信号和干扰模型，第 $u$ 个用户在第 $q$ 个 RBG 上的信干噪比定义为

$$
\gamma_{u,q}=
\frac{\mu_{u,q}p_{u,q}
|\mathbf v_u^H\mathbf H_{u,q}\mathbf w_u|^2}
{\sum_{u'\ne u}\mu_{u',q}p_{u',q}
|\mathbf v_u^H\mathbf H_{u,q}\mathbf w_{u'}|^2+\sigma^2}.
\tag{5}
$$

相应的可达数据率为

$$
R_u=\sum_{q\in\mathcal Q}B_q\log_2(1+\gamma_{u,q}),
\qquad u\in\mathcal N_u. \tag{6}
$$

其中 $B_q$ 是第 $q$ 个 RBG 的带宽。为兼顾总数据率与用户公平性，作者使用 $\alpha$-比例效用函数：

$$
U^\alpha(x)=
\begin{cases}
(1-\alpha)^{-1}x^{1-\alpha}, & 0\le\alpha\lt 1,\\
\log x, & \alpha=1.
\end{cases} \tag{7}
$$

于是，原文式（8）给出的联合优化问题目标是在波束范数约束、二元资源分配约束以及所有活跃用户最低速率约束下，最大化 $\sum_uU^\alpha(R_u)$。作者指出，该问题为 NP-hard。若完全依赖真实信道测量，需要很高的 CSI 采集与模型校准开销。因此，下文引入 P2CGNet 辅助的 R2BA，以更低成本获得面向该优化任务的训练数据。

## III. P2CGNet 设计

### A. 使用扩散模型学习无条件信道分布

P2CGNet 不假定位置及频率条件下的显式信道概率分布已知。考虑到 MIMO 信道在空间上具有相关性，作者首先采用波束域（beamspace）表示。用发送端和接收端的酉 DFT 矩阵 $\mathbf D_t,\mathbf D_r$ 将天线域信道变换为

$$
\widehat{\mathbf H}_{\mathbf x,q}
=\mathbf D_r^H\mathbf H_{\mathbf x,q}\mathbf D_t,
\qquad \mathbf x\in\Omega,\ q\in\mathcal Q. \tag{9}
$$

经过相应逆 DFT 可以恢复天线域信道。P2CGNet 的目标是从稀疏位置—频率—CSI 测量样本中，学习条件分布 $p(\widehat{\mathbf H}_{\mathbf x,q}\mid\mathbf x,q)$ 的生成近似。原文定义 1 使用统计散度表示生成分布与真实条件信道分布之间的距离，并要求在空间和频率条件上使该差异趋近于零，见原文式（10）。

P2CGNet 将复波束域信道划分为实部和虚部，分别进行处理。令 $\widetilde{\mathbf H}_{\mathbf x,q}^0$ 表示干净的实部或虚部矩阵，扩散前向过程通过逐步注入高斯噪声构造噪声状态。原文式（11）给出了每一步的条件高斯分布，相应的任意时间直接采样表达式为

$$
\widetilde{\mathbf H}_{\mathbf x,q}^t
=\sqrt{\bar\nu_t}\,\widetilde{\mathbf H}_{\mathbf x,q}^0+
\sqrt{1-\bar\nu_t}\,\mathbf N_t,\qquad
\mathbf N_t\sim\mathcal N(0,I). \tag{12}
$$

这里 $\bar\nu_t$ 由正向噪声调度决定。在扩散末端，信道的噪声化表示趋近标准高斯。反向去噪阶段则利用参数化神经网络，逐步近似各阶段的后验分布，从高斯噪声生成信道样本。

### B. 无分类器引导与条件信道生成

只学习无条件信道分布，无法满足给定位置与频率条件的生成需求。因此，作者采用贝叶斯关系，将位置与频率条件引入扩散分数（score）函数。分数估计网络既可以不提供条件输入，也可以接收位置 $\mathbf x$、资源块组索引 $q$ 和扩散时间 $t$，学习相应的噪声预测。

如果仅使用显式分类器引导，需要为整个去噪链训练可靠的后验分类器；对此，本文采用无分类器引导，组合条件与无条件噪声预测，并引入引导强度 $\lambda$。原文式（21）的核心形式为

$$
G^t_{\mathbf x,q}
=\lambda\varepsilon_\theta(\widetilde{\mathbf H}^t_{\mathbf x,q},\mathbf x,q,t)
+(1-\lambda)\varepsilon_\theta(\widetilde{\mathbf H}^t_{\mathbf x,q},t).
\tag{21}
$$

这个组合允许在生成时调整条件一致性与样本分布之间的权衡。在后续 cDDIM 推理中，作者利用非马尔可夫式去噪机制减少采样步数，降低条件信道生成时延。论文还从理论上分析了无分类器引导的条件分数近似效果及少步推理所需条件；具体定理与证明在英文原文及附录中给出，本阶段译稿未完整覆盖这些推导。

### C. P2CGNet 架构

为适应大规模 MIMO-OFDM 信道的高维结构，P2CGNet 在波束域采用基于 patch 的子信道分解：将信道矩阵分割成较小子信道，再交由 Transformer 骨干处理。每个子信道既包含自身局部结构信息，也携带逻辑位置编码。作者利用卷积神经网络编码子信道，并使用基于正弦函数的位置编码器表示其位置；之后通过多头自注意力（multi-head self-attention，MHSA）、层归一化与 MLP 等模块进行跨 patch 特征融合。

经过若干 Transformer 模块处理后，网络将各子信道结果重新拼接为完整的信道矩阵，并同时构造有条件与无条件去噪网络输出，进而通过式（21）形成生成所需的引导分数。训练时，首先将稀疏测量数据整体变换到波束域，再按批采样信道、位置和频率条件，学习对应去噪任务。作者还设计了减少推理步骤的机制，以同时兼顾信道生成精度与低计算开销。具体网络逐层计算、训练损失和算法步骤见原文式（22）–（28）及其后的正文，目前尚未逐式翻译。

## IV. 下游任务：RBGA 与 BA 联合优化

本节利用 P2CGNet，设计基于轻量探测波束（probing beam，PB）测量的联合 RBG 分配与波束对准算法。其思路是：宽探测波束测量隐式地包含链路质量和周围环境信息，因此可以在不恢复完整高维 CSI 的前提下，为资源分配和波束管理提供依据。

### A. 实现框架

令 $\mathbf F_t^{\rm pb}$ 和 $\mathbf F_r^{\rm pb}$ 分别为基于 DFT 码本的发送与接收探测波束矩阵。基站周期性使用若干发送探测波束广播探测符号，用户使用接收探测波束测量接收功率。波束扫描开销由发送和接收探测波束数决定，而不必等于全维波束码本扫描成本。

这些探测结果能够作为任务相关的隐式环境观测。通过引入历史测量、用户位置与先验通信模型，R2BA 使用分层图神经网络（hierarchical graph neural network，HGNN）处理用户、频率资源和波束之间的关系，预测资源块分配及波束选择。P2CGNet 则可根据感兴趣位置生成或增强训练样本，使下游模型在较低实时测量开销下仍能完成联合优化。

### B. 生成式信道数字孪生对 R2BA 的帮助

将 P2CGNet 集成到信道数字孪生后，系统可以对已有的稀疏 CSI 与位置测量进行周期性同步，使用生成模型填充未观测或当前不便测量的位置—频率条件，再结合已有通信模型构造 PB 测量或任务标签。这为 R2BA 提供了面向优化意图的数据增强手段，而无需对每一种候选资源分配都开展完整信道扫描。

需要注意，作者提出的数字孪生主要面向**任务导向的、按测量周期同步的虚拟信道生成**，并不显式求解动态多径几何演化的全部物理过程。实时性与鲁棒性依赖测量更新频率；如果环境变化很快，长期未同步的信道数字孪生仍可能出现信息陈旧问题。

## V. 仿真结果（目前仅包含结论性段落）

原文通过信道生成质量、训练数据效率、天线规模变化、推理开销与下游资源优化性能等方面评价 P2CGNet，并将其与普通扩散模型、GAN 类信道生成方法及其他基线进行比较。总体结果支持 P2CGNet 在这些方面具有较好的综合性能，但各指标的具体数值、表格与曲线比较必须按原版逐项核验，不能由本译稿的概述替代。

对于下游任务，原文进一步比较了信道数字孪生辅助与未经辅助的 R2BA，以及其他资源管理基线。第五节末尾指出，在信息陈旧时间达到 800 ms 时，一种数字孪生辅助方案仍保持接近零的速率约束违背比例，而另一方案的违背比例上升至约 0.0025。整体上，数字孪生辅助的 R2BA 可减少 CSI 测量开销；更频繁的数字孪生同步提高了保真度，维持更高总数据速率，并增强了对移动性引起的信息陈旧的鲁棒性。

*原文图 1–17 的完整图注、参数配置、基线说明和实验数据尚未逐图翻译与核验。上述结果段落不能视为完整的第五节译文。*

## VI. 结论

本文提出用于无线优化的高效、无需反馈的用户专属 MIMO-OFDM 信道生成模型 P2CGNet。该模型基于无分类器引导的信道条件 DDIM，并采用 Transformer 作为骨干。理论分析和数值仿真表明，相比已有基线方法，P2CGNet 能够实现更准确的信道生成。为了展示其在信道数字孪生中的实用性，作者将 P2CGNet 集成到资源块组分配与波束对准联合优化任务中，并开发了图神经网络驱动的 R2BA 模型。结果表明，P2CGNet 能有效增强 R2BA，改善下游无线优化性能。

不过，P2CGNet 仍存在若干局限。模型未显式建模天线单元间距、阵列方向等细粒度物理属性；这些属性对于准确描述 MIMO 传播十分重要，但如果全部加入条件建模，也可能带来新的可扩展性问题。作为数据驱动模型，P2CGNet 同样没有对环境几何、材料及散射体进行显式物理建模，因此其泛化能力受到训练与测量数据覆盖情况的约束。对于显著动态或具有强多普勒效应的场景，仍需进一步研究时变信道建模。

---

**页面状态：** 正文 I–VI、式（1）–（47）、算法 1–2、表 I 与 44 条参考文献已译出；表 II–V 仅按关键数值概述，图 1–17 仅保留中文图注，逐句人工终校未做。其中 IEEE 正式版共 16 页。当前页面不声明为逐字逐句全文译文。论文版权归原权利人所有，公开传播许可依 IEEE 规定核验。


## 补译：II. 系统模型中的信道增益与资源优化公式（原文第 3–4 页）

在原文式（1）的几何多径信道模型中，第 $\ell$ 条路径的复信道增益写为

$$
\beta_{u,k,\ell}^{\tau}
=\sqrt{\frac{p_{u,k,\ell}^{\tau}}{N_{\rm sc}}}
\exp\left[j\left(\varphi_{u,k,\ell}^{\tau}
+\frac{2\pi kB}{N_{\rm sc}}\iota_{u,k,\ell}^{\tau}\right)\right].\tag{2}
$$

其中 $N_{\rm sc}$ 与 $L$ 分别为总子载波数和传播路径数，$B$ 为子载波带宽相关参数，$p_{u,k,\ell}^{\tau}$、$\varphi_{u,k,\ell}^{\tau}$、$\iota_{u,k,\ell}^{\tau}$ 分别为路径功率、相位及传播时延。接收和发送阵列响应向量由具体阵列架构决定。对于固定时间 $\tau$，用户相对位置、AoA、AoD、路径数量及路径复增益为用户专属条件随机变量。随着 MIMO-OFDM 规模扩大，直接获取完整信道的代价显著升高，传统 CSI 估计也难以直接满足数字孪生的需求。因此，本文旨在借助稀疏真实 CSI 数据，开发用户专属的小尺度信道生成模型 P2CGNet，并将其纳入信道数字孪生，以支持感兴趣位置（POI）处的 CSI 获取和下游优化任务。

这里需要注意原文脚注中的范围限制：所构建的模型是**面向任务、通过测量同步更新的虚拟信道表示**，并非完整的物理机制级无线电数字孪生。它通过周期性稀疏 CSI 和位置测量更新虚拟信道状态，在给定空间及频率条件下生成瞬时 CSI。由于没有显式建模连续的时间演化，该框架更适合局部准静态场景；在具有显著多普勒效应的高移动性环境下，仍需要明确的时变信道模型。

### B. 下游任务：联合资源块组分配与波束对准

考虑多用户 MIMO-OFDM 下行单流传输，系统带宽被划分为若干子载波，并以物理资源块（physical resource block，PRB）组织资源。每个 PRB 由一个传输时间间隔和 $k_0$ 个子载波组成，是最小的分配单位。为降低实际 PRB 分配中的处理开销，将 PRB 进一步分组为资源块组（resource block group，RBG），每个 RBG 包含 $q_0$ 个 PRB，总数为 $Q$。在该任务中，作者关注极密集连接场景，为简化符号不再显式考虑时间索引。第 $q$ 个 RBG 上用户 $u$ 的信道 $\mathbf H_{u,q}\in\mathbb C^{N_r\times N_t}$ 由相应的代表子载波信道近似。

假设所有用户均处于活动状态，基站使用与资源分配相关的等功率策略。用 $\mu_{u,q}\in\{0,1\}$ 表示二元资源块组分配决策；$\mu_{u,q}=1$ 表示第 $q$ 个 RBG 分配给用户 $u$，否则为零。设基站对该用户使用发送波束 $\mathbf w_u\in\mathbb C^{N_t\times1}$，用户使用接收波束 $\mathbf v_u\in\mathbb C^{N_r\times1}$，且两者在该用户所有已分配 RBG 上保持相同。单位功率符号为 $s$，则接收信号为

$$
y_{u,q}=\mu_{u,q}\left(
\sqrt{p_{u,q}}\mathbf v_u^H\mathbf H_{u,q}\mathbf w_u s
+I_{u,q}\right).\tag{3}
$$

干扰与噪声项由其他用户的同频传输以及加性白高斯噪声组成：

$$
I_{u,q}=\sum_{u'\in\mathcal N_u\setminus\{u\}}
\mu_{u',q}\sqrt{p_{u',q}}\,
\mathbf v_u^H\mathbf H_{u,q}\mathbf w_{u'}s
+\mathbf v_u^H\mathbf n_{u,q}.\tag{4}
$$

其中 $\mathbf n_{u,q}\sim\mathcal{CN}(\mathbf0,\sigma^2\mathbf I)$。因此，第 $q$ 个 RBG 上用户 $u$ 的 SINR 为

$$
\gamma_{u,q}=
\frac{\mu_{u,q}p_{u,q}
|\mathbf v_u^H\mathbf H_{u,q}\mathbf w_u|^2}
{\sum_{u'\in\mathcal N_u\setminus\{u\}}
\mu_{u',q}p_{u',q}
|\mathbf v_u^H\mathbf H_{u,q}\mathbf w_{u'}|^2+\sigma^2}.
\tag{5}
$$

用户的可达速率由其分配到的 RBG 上的贡献求和得到：

$$
R_u=\sum_{q\in\mathcal Q}B_q\log_2(1+\gamma_{u,q}).\tag{6}
$$

其中 $B_q$ 为第 $q$ 个 RBG 的带宽。

**2）优化问题表述。** 联合 RBGA 与 BA 的目的是在考虑频率选择性衰落的情况下，权衡用户吞吐率与公平性。作者采用 $\alpha$ 比例公平效用函数：

$$
U^\alpha(x)=
\begin{cases}
\dfrac{x^{1-\alpha}}{1-\alpha},&0\le\alpha\lt 1,\\
\log x,&\alpha=1.
\end{cases}\tag{7}
$$

相应的联合优化问题为

$$
\begin{aligned}
\mathrm{P0}:\quad&
\max_{\{\mu_{u,q},\mathbf w_u,\mathbf v_u\}}
\sum_{u\in\mathcal N_u}U^\alpha(R_u), &&\tag{8a}\\
&\|\mathbf w_u\|_2=1,\quad \|\mathbf v_u\|_2=1,\quad
&&\forall u,\tag{8b}\\
&\mu_{u,q}\in\{0,1\},&&\forall u,q,\tag{8c}\\
&R_u\ge R_0,&&\forall u.\tag{8d}
\end{aligned}
$$

其中 $R_0$ 为活动用户的基本速率需求。作者指出问题 P0 为 NP-hard。为克服直接求解与完整 CSI 数据采样的成本，提出 R2BA 方法：使用 P2CGNet 与先验通信模型合成面向目标任务的训练数据，并采用分层图神经网络（HGNN）提取有效特征，从而支撑资源分配和波束对准。

**校对备注：** 本节补录公式（2）–（8），但射频波束幅度约束的具体表达、发射功率分配的原文记号和含有下标的符号仍需结合正式 PDF 逐式终校。后续 P2CGNet 网络训练、理论证明、完整 R2BA 实现、全部实验和参考书目仍不完整。


## 正文补译：III. P2CGNet 的条件扩散推断、网络结构与算法

### A. 用扩散模型学习无条件信道分布（公式补录）

对任意实测信道 $\mathbf H_{x,q}^{0}\sim\mathcal H^{\rm samp}$，首先按式（9）进行 DFT 变换，得到波束域信道。P2CGNet 将波束域信道的实部、虚部分开处理。为方便表示，以下以 $\widetilde{\mathbf H}_{x,q}\in\mathbb R^{N_r\times N_t}$ 统指其中任一部分。

在前向扩散中，逐步向干净信道添加高斯噪声。第 $t$ 步的转移概率为

$$
\hat q\bigl(\widetilde{\mathbf H}_{x,q}^t\mid
\widetilde{\mathbf H}_{x,q}^{t-1}\bigr)
=\mathcal N\left(
\widetilde{\mathbf H}_{x,q}^t;\
\sqrt{1-\rho_t}\,\widetilde{\mathbf H}_{x,q}^{t-1},\
\rho_t\mathbf I\right). \tag{11}
$$

其中 $\rho_t\in[0,1)$ 是第 $t$ 步的噪声方差，可通过指定调度器产生。根据高斯分布的性质，可直接从干净样本构造任意噪声时刻的样本：

$$
\widetilde{\mathbf H}_{x,q}^t=
\sqrt{\bar\nu_t}\,\widetilde{\mathbf H}_{x,q}^0+
\sqrt{1-\bar\nu_t}\,\mathbf N_t,\quad
\mathbf N_t\sim\mathcal N(\mathbf0,\mathbf I),\quad
\bar\nu_t=\prod_{t'=1}^{t}\nu_{t'},\quad
\nu_{t'}=1-\rho_{t'}. \tag{12}
$$

当扩散步数足够多，终端状态趋于标准高斯分布。反向去噪使用由神经网络参数化的近似转移分布：

$$
p_\theta\bigl(\widetilde{\mathbf H}_{x,q}^{t-1}\mid
\widetilde{\mathbf H}_{x,q}^{t}\bigr)
=\mathcal N\left(
\widetilde{\mathbf H}_{x,q}^{t-1};\
\widehat{\boldsymbol\mu}_{\theta}(\widetilde{\mathbf H}_{x,q}^{t},t),\
\widehat\sigma_{\theta}(\widetilde{\mathbf H}_{x,q}^{t},t)\mathbf I
\right). \tag{13}
$$

在实际实现中将方差固定为 $\widetilde\sigma$，均值可通过噪声预测网络 $\epsilon_\theta$ 重参数化：

$$
\widehat{\boldsymbol\mu}_{\theta}
(\widetilde{\mathbf H}_{x,q}^{t},t)
=\frac{1}{\sqrt{\nu_t}}\left[
\widetilde{\mathbf H}_{x,q}^{t}
-\frac{\rho_t}{\sqrt{1-\bar\nu_t}}
\epsilon_\theta(\widetilde{\mathbf H}_{x,q}^{t},t)
\right]. \tag{14}
$$

该网络以最小化添加噪声与预测噪声之间的平方误差进行训练：

$$
\mathcal L_{\rm SM}(\theta)
=\mathbb E_{\widetilde{\mathbf H}_{x,q}^{0},\mathbf N_t,t}
\left[\left\|
\mathbf N_t-\epsilon_\theta(\widetilde{\mathbf H}_{x,q}^{t},t)
\right\|_2^2\right]. \tag{15}
$$

### B. 条件后验推断（公式补录）

无条件扩散只能学习总体信道分布，而 P2CGNet 需要根据用户位置 $x$ 和资源块索引 $q$ 生成服从 $p(\widehat{\mathbf H}_{x,q}\mid x,q)$ 的信道。文章基于概率流常微分方程，将条件去噪一步表示为

$$
\widetilde{\mathbf H}_{x,q}^{t-1}
=\widetilde{\mathbf H}_{x,q}^{t}
-\widetilde\sigma_t
\nabla_{\widetilde{\mathbf H}_{x,q}^{t}}
\log p(\widetilde{\mathbf H}_{x,q}^{t}\mid x,q). \tag{16}
$$

设真实条件得分对应的噪声项为

$$
\widetilde{\mathbf G}_{x,q}^{t}
=-\widetilde\sigma_t\nabla_{\widetilde{\mathbf H}^{t}}\log p(\widetilde{\mathbf H}^{t}\mid x,q).
$$

根据贝叶斯公式，将其分解为无条件先验得分和条件似然得分：

$$
\widetilde{\mathbf G}_{x,q}^{t}
=-\widetilde\sigma_t
\nabla_{\widetilde{\mathbf H}^{t}}\log p(\widetilde{\mathbf H}^{t})
-\widetilde\sigma_t
\nabla_{\widetilde{\mathbf H}^{t}}\log p(x,q\mid\widetilde{\mathbf H}^{t}). \tag{17}
$$

无条件网络与条件网络分别近似两种噪声得分：

$$
\epsilon_\theta(\widetilde{\mathbf H}^{t},t)
\approx-\widetilde\sigma_t\nabla_{\widetilde{\mathbf H}^{t}}
\log p(\widetilde{\mathbf H}^{t}), \tag{18}
$$

$$
\epsilon_\theta(\widetilde{\mathbf H}^{t},x,q,t)
\approx-\widetilde\sigma_t\nabla_{\widetilde{\mathbf H}^{t}}
\log p(\widetilde{\mathbf H}^{t}\mid x,q). \tag{19}
$$

由两者差分可以近似条件分类器的得分：

$$
\begin{aligned}
\widetilde{\mathbf G}_{x,q}^{t,0}
&=\nabla_{\widetilde{\mathbf H}^{t}}
\log p(\widetilde{\mathbf H}^{t}\mid x,q)
-\nabla_{\widetilde{\mathbf H}^{t}}\log p(\widetilde{\mathbf H}^{t})\\
&\approx-\frac1{\widetilde\sigma_t}
\left[
\epsilon_\theta(\widetilde{\mathbf H}^{t},x,q,t)
-\epsilon_\theta(\widetilde{\mathbf H}^{t},t)
\right].
\end{aligned}\tag{20}
$$

引入引导系数 $\lambda$，得到无分类器引导（classifier-free guidance，CFG）噪声估计：

$$
\mathbf G_{x,q}^{t}
=\lambda\epsilon_\theta(\widetilde{\mathbf H}^{t},x,q,t)
+(1-\lambda)\epsilon_\theta(\widetilde{\mathbf H}^{t},t). \tag{21}
$$

无条件网络刻画信道的整体统计规律，条件网络刻画特定位置和频率对应的信道特征。作者认为适当的混合有助于改善未见条件下的泛化，并给出**命题 1**：对于未见条件集合，在恰当选择 $\lambda'>0$ 时，CFG 得分估计的均方误差不超过仅使用条件网络的误差，

$$
\operatorname{MSE}_{\rm CF}(\lambda')
\le \operatorname{MSE}_{\rm Cond}. \tag{22}
$$

原文**备注 1**建议将 $\lambda$ 限制于 $[0,1]$，使式（21）成为凸组合，并通过验证集交叉验证或网格搜索选取系数。

为了减少去噪步骤，作者采用条件去噪扩散隐式模型（cDDIM）：从原有 $T$ 个时刻选取较短的子序列 $\{\varrho_s\}_{s=1}^{S}$，通过确定性的跨步递推恢复信道。

**定理 1（少步 cDDIM）。** 对经过训练的 P2CGNet，给定扩散时刻子序列，可按

$$
\widetilde{\mathbf H}_{x,q}^{\varrho_{s-1}}
=V_{\widetilde H}^{\varrho_s}\,
\widetilde{\mathbf H}_{x,q}^{\varrho_s}
+V_G^{\varrho_s}\,\mathbf G_{x,q}^{\varrho_s},\tag{23}
$$

生成相邻采样时刻的信道，其中

$$
V_{\widetilde H}^{\varrho_s}=
\sqrt{\frac{\bar\nu_{\varrho_{s-1}}}
{\bar\nu_{\varrho_s}}},\qquad
V_G^{\varrho_s}
=\sqrt{1-\bar\nu_{\varrho_{s-1}}}
-\sqrt{\frac{\bar\nu_{\varrho_{s-1}}
(1-\bar\nu_{\varrho_s})}{\bar\nu_{\varrho_s}}}.
$$

原文采用等间隔的跳步子序列，也允许线性以外的采样策略。**命题 2**指出，少步采样要保持效果，需要选定的每个去噪时刻均有准确的噪声得分估计；若误差不趋近于零，少步生成的准确性无法保证。

### C. P2CGNet 网络结构与训练、推理

图 2 展示了整体架构：先将测得信道变换到波束域并加噪，然后由 Transformer 主干训练条件和无条件得分估计器，最后通过 CFG-cDDIM 反向去噪并进行逆 DFT。两种得分估计器共享同一网络，通过随机屏蔽位置与频率条件进行联合训练：

$$
\epsilon_\theta(\widetilde{\mathbf H}^{t},\cdot)
=
\epsilon_\theta\left(
\widetilde{\mathbf H}^{t},
x\,\mathbf1_{\widehat p_\epsilon>p_{\rm th}},
q\,\mathbf1_{\widehat p_\epsilon>p_{\rm th}},t
\right). \tag{24}
$$

其中 $\widehat p_\epsilon\sim\operatorname{Uniform}[0,1)$，$p_{\rm th}>0$ 控制条件屏蔽的概率。去噪时刻 $t$ 与资源块索引 $q$ 使用正弦位置编码，位置 $x$ 使用 MLP 编码。文章给出的正弦编码形式为

$$
\begin{aligned}
\operatorname{sinp}(o,2i)
&=\sin\!\left(\frac{o}{10000^{2i/z}}\right), &&\tag{25a}\\
\operatorname{sinp}(o,2i+1)
&=\cos\!\left(\frac{o}{10000^{2i/z}}\right), &&\tag{25b}\\
\operatorname{SP}(o)
&=[\operatorname{sinp}(o,0),\ldots,\operatorname{sinp}(o,z-1)].
&&\tag{25c}
\end{aligned}
$$

三个条件嵌入通过按元素相加融合：

$$
\mathbf f_{\rm fuse}
=\mathcal E_x(x\mid\Theta)
\oplus\mathcal E_q(\operatorname{SP}(q)\mid\Theta)
\oplus\mathcal E_t(\operatorname{SP}(t)\mid\Theta). \tag{26}
$$

为了提取细粒度信道结构并降低注意力复杂度，将 $\widetilde{\mathbf H}_{x,q}$ 划分为 $N_{\rm sc}$ 个尺寸为 $H\times W$ 的子信道 patch。自注意力运算的主导复杂度从对整个信道使用时的 $O(N_t^2N_r^2d)$，降低为基于子信道 token 的 $O(N_{\rm sc}^2d)$；其中 $d$ 是注意力隐特征维数。随后多个 Transformer 块处理这些 patch 及融合条件。

为了让条件调节作用于注意力和 MLP 两个子层，采用自适应层归一化（AdaLN）和残差连接。六组调节系数通过 MLP 生成：

$$
\boldsymbol\Upsilon=\mathcal G_{\rm Scale,Shift}
(\mathbf f_{\rm fuse}\mid\Theta)
=[\upsilon^1_{\rm scale},\upsilon^1_{\rm shift},
\upsilon^2_{\rm scale},\upsilon^3_{\rm scale},
\upsilon^2_{\rm shift},\upsilon^4_{\rm scale}]. \tag{27}
$$

单个 Transformer 块对 patch $i$ 的处理步骤为

$$
\begin{aligned}
\mathbf f_{\rm sc}
&=\mathcal E_{\rm sc}(\widetilde{\mathbf H}_{x,q,i}\mid\Theta)
\oplus\mathcal E_{\rm sc,pos}(i\mid\Theta),
&&\tag{28a}\\
\mathbf f_{\rm sc,scale,shift}
&=\operatorname{LN}(\mathbf f_{\rm sc})\odot
(1+\upsilon^1_{\rm scale})\oplus\upsilon^1_{\rm shift},
&&\tag{28b}\\
\mathbf f'_{\rm sc}
&=\upsilon^2_{\rm scale}\odot
\operatorname{MHSA}(\mathbf f_{\rm sc,scale,shift})
\oplus\mathbf f_{\rm sc},
&&\tag{28c}\\
\mathbf f'_{\rm sc,scale,shift}
&=\operatorname{LN}(\mathbf f'_{\rm sc})\odot
(1+\upsilon^3_{\rm scale})\oplus\upsilon^2_{\rm shift},
&&\tag{28d}\\
\mathbf f''_{\rm sc}
&=\upsilon^4_{\rm scale}\odot
\operatorname{MLP}(\mathbf f'_{\rm sc,scale,shift})
\oplus\mathbf f'_{\rm sc}.
&&\tag{28e}
\end{aligned}
$$

其中 $\odot$ 表示逐元素乘法，$\oplus$ 表示相加，$\operatorname{LN}$ 为层归一化，$\operatorname{MHSA}$ 为多头自注意力。经过多层 Transformer 后，对所有 patch 执行反 patch 化，得到完整信道的噪声预测。

**算法 1：P2CGNet 的训练。** 输入噪声调度 $\{\bar\nu_t\}_{t=1}^{T}$、训练信道集、批大小 $B$、屏蔽门限 $p_{\rm th}$ 和学习率。先由式（9）得到波束域数据集；在每个 epoch 随机选择批次，对每个样本抽取 $t$ 和标准高斯噪声，根据式（12）生成带噪样本；再抽取 $\widehat p_\epsilon$，以式（24）随机启用或屏蔽位置与频率条件；计算式（15）的噪声预测损失并作随机梯度下降，最终输出训练好的共享 $\epsilon_\theta$ 网络。

**算法 2：P2CGNet 的推理。** 输入经过训练的网络、选定的跳步时刻序列 $\{\varrho_s\}$、噪声水平 $\{\bar\nu_{\varrho_s}\}$、CFG 系数 $\lambda$ 与目标位置和资源块索引。先初始化末端 $\widetilde{\mathbf H}_{x,q}^{\varrho_S}\sim\mathcal N(0,\mathbf I)$；随后按 $s=S,S-1,\ldots,1$ 迭代：分别计算有条件及无条件噪声预测，利用式（21）构造 CFG 得分，再用式（23）完成跨步去噪。结束后对生成的波束域信道执行 IDFT，输出天线域信道样本。

## 正文补译：IV. R2BA 的测量模型、图神经网络与动态罚函数

### A. 探测波束测量

宽波束（probing beam，PB）测量包含隐式信道质量及环境信息，可供低开销的资源分配与波束管理。令 $\mathbf F_t^{\rm pb}\in\mathbb C^{N_t^{\rm pb}\times N_t}$ 和 $\mathbf F_r^{\rm pb}\in\mathbb C^{N_r^{\rm pb}\times N_r}$ 为发送、接收探测码本。基站周期性发送探测符号 $\mathbf s^{\rm pb}$，用户用接收感知波束测量对应功率。对用户 $u$ 的第 $q$ 个 RBG，组合接收信号为

$$
\mathbf Y_{u,q}=
\sqrt{p_{\rm pb}}(\mathbf F_r^{\rm pb})^H
\mathbf H_{u,q}\mathbf F_t^{\rm pb}
\operatorname{diag}(\mathbf s^{\rm pb})
+(\mathbf F_r^{\rm pb})^H\mathbf N^{\rm pb}. \tag{29}
$$

$\mathbf N^{\rm pb}$ 为探测噪声矩阵；本文考虑 $N_t^{\rm pb}=N_r^{\rm pb}=N^{\rm pb}$，以降低反馈开销。用户从测量矩阵对角元素的幅度平方形成低维反馈：

$$
\mathbf Z_{u,q}=
\operatorname{vec}\left[
\operatorname{diag}\bigl(
|\mathbf Y_{u,q}|\odot|\mathbf Y_{u,q}|
\bigr)\right]
\in\mathbb R^{N^{\rm pb}\times1}. \tag{30}
$$

所有用户的反馈合成张量 $\mathbf Z\in\mathbb R^{N_u\times Q\times N^{\rm pb}}$，送往基站完成资源调度和发射波束生成。

### B. R2BA 的网络结构

图 3 展示整体网络。RBGA 模块采用两级图神经网络：用户级干扰感知模块抽取同一 RBG 上其他用户的统计信息；RBG 级竞争感知模块再描述同一用户在其他资源块上的相互竞争。对用户 $u$、资源块 $q$，前者输出

$$
\widetilde{\mathbf z}_{u'\to u,q}^{\rm inter}
=\frac1{N_u-1}\sum_{u'\in\mathcal N_u\setminus\{u\}}
\mathcal E_{\rm pb}(\mathbf Z_{u',q}\mid\Theta). \tag{31}
$$

$\mathcal E_{\rm pb}$ 是 MLP 型 PB 编码器。将干扰信息和本用户的 PB 测量拼接后，计算资源块竞争表征：

$$
\widetilde{\mathbf z}_{u,q'\to q}^{\rm cont}
=\frac1{Q-1}\sum_{q'\in\mathcal Q\setminus\{q\}}
\mathcal E_{\rm inter}\!\left(
\widetilde{\mathbf z}_{u'\to u,q'}^{\rm inter}
\circledast\mathbf Z_{u,q'}\mid\Theta\right). \tag{32}
$$

其中 $\circledast$ 表示拼接。两类表征通过资源分配生成器得到连续的资源分配概率：

$$
\mu_{u,q}=
\operatorname{Sigmoid}\!\left[
\mathcal E_{\rm RBA}\left(
\widetilde{\mathbf z}_{u'\to u,q}^{\rm inter}
\circledast
\widetilde{\mathbf z}_{u,q'\to q}^{\rm cont}
\mid\Theta\right)\right].\tag{33}
$$

各 RBG 的分配概率组成用户向量

$$
\boldsymbol\mu_u=[\mu_{u,1},\ldots,\mu_{u,Q}]^T
\in(0,1)^{Q\times1}. \tag{34}
$$

用分配概率加权激活 PB 测量后，基站和用户分别由 MLP 输出候选复波束；再跨 RBG 加权求平均，并实施恒模单位功率归一化：

$$
\begin{aligned}
\mathbf W'_u
&=\mathcal E_w^{\rm Re}(\mathbf Z'_u\mid\Theta)
+j\mathcal E_w^{\rm Im}(\mathbf Z'_u\mid\Theta),
&&\tag{35a}\\
\mathbf w'_u
&=\frac{\sum_{q\in\mathcal Q}\mu_{u,q}\mathbf W'_{u,q}}
{\sum_{q\in\mathcal Q}\mu_{u,q}},\quad
\mathbf w_u=\frac{\mathbf w'_u}{|\mathbf w'_u|\sqrt{N_t}},
&&\tag{35b}\\
\mathbf V'_u
&=\mathcal E_v^{\rm Re}(\mathbf Z'_u\mid\Theta)
+j\mathcal E_v^{\rm Im}(\mathbf Z'_u\mid\Theta),
&&\tag{35c}\\
\mathbf v'_u
&=\frac{\sum_{q\in\mathcal Q}\mu_{u,q}\mathbf V'_{u,q}}
{\sum_{q\in\mathcal Q}\mu_{u,q}},\quad
\mathbf v_u=\frac{\mathbf v'_u}{|\mathbf v'_u|\sqrt{N_r}}.
&&\tag{35d}
\end{aligned}
$$

式（35b）、（35d）中的绝对值按元素计算，从而分别构成发射和接收的恒模向量。

### C. 信道数字孪生驱动的模型优化

仅依靠稀疏历史测量训练 R2BA，难以覆盖当前无线传播的变化；如果增加真实 CSI 采样密度，则会消耗大量无线资源。图 4 给出闭环优化：实际网络周期性采集稀疏 CSI 和位置测量，与信道数字孪生同步；训练好的 P2CGNet 在目标区域 $\Omega^{\rm intent}$ 上生成欠采样或预测位置的虚拟信道集合 $\mathcal H^{\rm intent}$；将其与实测集并成扩增集 $\mathcal H^{\rm aug}=\mathcal H^{\rm samp}\cup\mathcal H^{\rm intent}$；依式（29）生成对应 PB 测量，并在虚拟环境中训练或微调 R2BA；随后将更新后的 R2BA 部署到真实网络。

为处理最低速率需求，原文采用在训练 epoch $e$ 更新惩罚权重 $w^{(e)}$ 的交替优化。首先固定权重训练 R2BA，使

$$
\max_{\{\mu_{u,q},\mathbf w_u,\mathbf v_u\}}
\mathbb E_{u\sim\mathcal N_u,\ \mathbf H\sim\mathcal H^{\rm aug},\ \mathbf Z}
\left[U^\alpha(R_u)-w^{(e)}\Delta_u^{\min}\right],
\qquad
\Delta_u^{\min}=[\min(R_0-R_u,0)]^2. \tag{36}
$$

然后固定当前模型输出，以违反最低速率约束的程度更新权重：

$$
w^{(e+1)}\gets w^{(e)}
+\varsigma_w\,\mathbb E_{u,\mathbf H,\mathbf Z}
[\Delta_u^{\max}],\qquad
\Delta_u^{\max}=[\max(R_0-R_u,0)]^2. \tag{37}
$$

两阶段交替执行，直至式（8a）的目标收敛。**原文核验提示：** 式（36）采用 $\min(R_0-R_u,0)$，而式（37）采用 $\max(R_0-R_u,0)$；这可能与通常惩罚速率约束违反的直觉不一致。此处严格保留原文写法，未擅自更正，建议后续核对论文勘误或实现代码。

**前一轮范围（2026-10-25）：** 补入第三节条件推断及网络的公式（11）–（28e）、算法 1–2，并补入第四节公式（29）–（37）与闭环训练逻辑。本页已在 2026-10-30 补入表 I 逐格转录、44 条参考文献与附录 A–C 证明细节；表 II–V 的逐格数据与逐句终校仍余。


## 正文补译：V. 仿真结果与实验验证（原文第 9–14 页）

### A. 仿真场景

图 5 给出了仿真环境。作者采用开源 Sionna 射线追踪库构建具有多栋建筑的频率选择性衰落场景，并在不同区域随机布置用户位置，分别用于信道生成和下游资源优化。除非另外说明，每个物理资源块 PRB 含 $k_0=12$ 个子载波，每个子载波间隔为 60 kHz；135 个 PRB 被划分为 $Q=27$ 个资源块组 RBG，每组有 $q_0=5$ 个 PRB。实验运行于 Intel Core i7-13700K 和 NVIDIA GeForce RTX 4080 SUPER 工作站。其他通信系统配置列于原文表 I。

**表 I：仿真参数（原表逐格转录）。** 表中“16, 16×1 ULA/4×4 UPA”这类条目的含义为：总阵元数 $N$，以及对应的 ULA 与 UPA 排布方式。

| 参数 | 取值 |
|---|---|
| 环境区域（Environment Region） | $140\ \mathrm{m}\times100\ \mathrm{m}$ |
| 采样位置数 $\lvert\Omega^{\mathrm{samp}}\rvert$ | 1000–5000 |
| 下游测试区域（Downstream Test Region） | $70\ \mathrm{m}\times20\ \mathrm{m}$ |
| 带宽（Bandwidth） | 100 MHz |
| 载波频率（Carrier Frequency） | 2.4/3.5/28/58 GHz |
| 天线间距（Antenna Spacing） | 0.5 m |
| 基站天线 $N_{\mathrm{t}}$ | 16，16×1 ULA／4×4 UPA；32，32×1 ULA／4×8 UPA；64，64×1 ULA／8×8 UPA；128，128×1 ULA／8×16 UPA |
| 用户天线 $N_{\mathrm{r}}$ | 2，2×1 ULA；4，4×1 ULA／2×2 UPA；8，8×1 ULA／2×4 UPA |

> **转录说明：** 源 PDF 的表体为版式化排版，`pypdf`/PyMuPDF 的文本抽取均未取到表体文字；上表是依据源 PDF 第 9 页（p. 20455）该表的渲染图像逐格人工转录的，数值与 ULA／UPA 排布均照录。

### B. P2CGNet 信道生成性能

作者从定量误差、生成可视化和推理时间三个方面比较不同信道生成方法。基线包括：取最近五个邻居的反距离加权插值 IDW-inter.；使用 12 近邻和线性核的径向基函数插值 RBF-inter.；可获得精确三维场景模型时的射线追踪；基于 U-Net 的条件 GAN（Chan-cGAN）；采用 U-Net 得分估计器的条件 DDIM（Chan-cDDIM）；以及本文采用 Transformer、无分类器引导和子信道 patch 的 P2CGNet。

主要评价指标为信道归一化均方误差（NMSE，单位 dB）：

$$
\operatorname{NMSE}
=10\log_{10}\!\left[
\mathbb E_{x\sim\Omega,\ q\sim\mathcal Q}
\left(\frac{\|\mathbf H'_{x,q}-\mathbf H_{x,q}\|_2^2}
{\|\mathbf H_{x,q}\|_2^2}\right)
\right]. \tag{38}
$$

其中 $\mathbf H'_{x,q}$ 是生成信道，$\mathbf H_{x,q}$ 是真实信道。作者以学习率 $10^{-4}$、批大小 256 训练 Chan-cDDIM 和 P2CGNet。对 P2CGNet，采用两个 Transformer 块，patch 尺寸 $2\times2$、训练噪声步数 $T=256$、条件屏蔽门限 $p_{\rm th}=0.1$。

**图 6：训练收敛。** 以 1000 个位置的信道数据训练 P2CGNet，不同天线阵列架构下均能在约 7000 个 epoch 内稳定收敛。

**图 7：去噪步数对 NMSE 与时延的影响。** 虽然 Chan-cDDIM 采用隐式扩散采样，但 U-Net 难以充分捕获高维信道、位置和频率偏移间的联合统计关系，因此减少去噪步数时噪声估计不稳定。P2CGNet 在减小步数时反而可以改善 NMSE，作者认为这是因为减少了多次迭代的噪声估计误差累积。后续实验默认 Chan-cDDIM 使用 $S=256$ 步，而 P2CGNet 使用 **$S=3$ 步**。

**图 8：引导系数、patch 尺寸及骨干网络消融。** 对 1000 个训练样本、$4\times32$ 天线设置，最优性能出现在 $\lambda=0.8$ 和 $2\times2$ patch。相较只使用条件得分的 $\lambda=1$，适度融合无条件先验改善了信道生成；引导过弱或过强均有损稳定性。采用 Transformer 的 P2CGNet 在最佳设置下相对 Chan-cDDIM 取得约 **1.4 dB 的 NMSE 优势**，说明网络主干与合理 patch 划分共同起作用。

**图 9：训练采样密度、天线规模与载频变化。** 两种经典空间插值方法表现较差；P2CGNet 在所测试设置中取得较好的 NMSE 和数据效率。随位置采样密度提高，各种方法的 NMSE 均下降。固定采样位置数为 1000 时，随载频增加的 NMSE 变化较平缓。在 ULA 和 UPA 两种阵列下，P2CGNet 均优于相应基线。不过 ULA 规模扩大时，其 NMSE 也出现下降趋势；作者将其归因于 0.5 m 天线间距削弱相关性，使只以基站中心位置作为条件的生成方式难以捕获所有天线相关变化。Chan-cDDIM 的 NMSE 随天线尺寸增大则出现明显恶化。

**图 10：三组随机生成信道的可视化。** 在 5000 个训练样本下，P2CGNet 在天线域幅度及与真实信道的一致性方面均优于所比较的两种深度生成基线。Chan-cGAN 的 NMSE 可能接近其他方法，但其空间结构一致性较差，故后续不再把它作为主要基线。

**图 11：频率插值和定位误差。** 在剩余 108 个 PRB 上进行 RBG 级别插值，P2CGNet 的 NMSE 接近已训练资源块上的表现，Chan-cDDIM 则明显退化。随位置误差增大，两者性能均下降，但 P2CGNet 在误差不超过约 2 m 时仍能保持可接受的生成性能。

**表 II、表 III：复杂度与推理时延。** 在所测最大 $8\times128$ 天线阵列中，相比 Chan-cDDIM，P2CGNet 将 FLOPs、训练时间和训练 GPU 显存分别降低 **58.9%、78.0%、83.3%**。推理所需 CPU 内存略高，但差异不大。每信道的推理时延约 **1–3 ms**，与轻量 IDW 插值处于相近量级；Chan-cDDIM 与传统射线追踪随着阵列规模增加，推理时延上升更快。

### C. 不同场景的泛化验证

作者还在四个更接近真实部署的场景中验证：图 12 的两组射线追踪三维场景（etoile、munich）以及两组实际测量场景（Outdoor、Indoor）。四个场景基站高度依次为 50 m、50 m、10.09 m、1.42 m。室外和室内实测场景分别包含 983 和 1200 个测量位置。只有在具备三维场景模型的情况下，才能公平地应用射线追踪基线；对于实测数据中的载波相位误差、采样时钟偏差、用户朝向未知等校准困难，采用天线域幅度计算 NMSE。

图 13 表明，P2CGNet 在四个场景中整体表现出较好的数据效率和 NMSE。etoile、munich 等覆盖面积较大的场景，位置到信道映射需要更高的空间测量密度；Outdoor、Indoor 等实际测量场景虽然覆盖范围较小，其他方法仍可能因测量不确定性和空间相关性降低而受限。在具有较为准确三维模型的 Indoor 场景中，射线追踪结果可以接近 Chan-cGAN；而在 Outdoor 场景，仅有建筑物的三维模型不足以生成准确的实测信道，体现了数据驱动模型在缺少完整场景模型时的适用价值。

### D. 下游 R2BA 的端到端效果

下游优化采用 15 个活动用户、27 个 RBG，基本速率要求 $R_0=5$ Mbps。学习方法以批大小 100 训练，R2BA 学习率 $10^{-4}$，比例公平参数 $\alpha=1$，动态罚系数更新率 $\varsigma_w$ 从 $\{0.1,0.01,0.001\}$ 中选取，初始罚系数 $w_0=1$。比较方法包括：使用完整 CSI 的迭代加权最小均方误差（WMMSE）；只用 MLP 合成波束的 MBA-FRB；联合 MLP 波束对准与分组的 MBA-MRB；本文图网络结构的 R2BA；以及用 CDL-C、Chan-cDDIM、P2CGNet 生成数据增强的 R2BA-Syn.-0、R2BA-Syn.-1、R2BA-Syn.-2。

图 14 给出探测波束对数变化时的用户总数据率与速率要求违反情况。学习方法总体随 PB 对数增加而改善，但超过约 14 对后收益减少。PB 角分辨率较低、对数少于 16 时，纯 MLP 的 RBGA 难以刻画多用户间的同资源块干扰，MBA-MRB 可能反而差于不进行该类分组的 MBA-FRB。利用两级图网络推断用户级干扰与 RBG 竞争的 R2BA 表现更好。使用 P2CGNet 合成数据增强的 R2BA-Syn.-2 在不同 PB 对数下均优于使用 Chan-cDDIM 和 CDL-C 增强的版本；相比未增强的 R2BA，平均总数据率提升 **10.08%（约 900 Mbps）**，而 Chan-cDDIM 增强版本平均提升 3.26%（约 315 Mbps）。

图 15 将生成信道转换到功率时延谱（PDP）、到达角（AoA）和出发角（AoD）分布进行对照。标准化 CDL-C 与该场景的实际分布差异较大，导致合成数据误导下游模型训练；Chan-cDDIM 与 P2CGNet 的统计分布更接近真实信道。不过 P2CGNet 的 PDP 仍有明显完善空间，说明时延域的生成保真度仍需改进。

图 16 使用 Jain 公平性指数（JFI）评估用户公平程度，定义为

$$
\operatorname{JFI}
=\frac{(\sum_{u=1}^{N_u}a_u)^2}{N_u\sum_{u=1}^{N_u}a_u^2},
\qquad a_u=U^\alpha(R_u).
$$

WMMSE 的 JFI 较差，其余学习方法在速率效用上的公平性接近理想值，而直接按用户速率计算的公平性仍有限。最大化对数效用倾向在保障弱用户速率的同时，使具有更好信道的用户进一步获得更高数据率；如果希望更均衡，可以对每用户分配的 RBG 数量增加上界，或引入功率分配，但这些问题超出本文范围。

**数字孪生同步过期实验（图 17）。** 15 个用户以 2 m/s 在区域内随机移动，28 GHz 下理论相干时间约 2.27 ms；实际 RBG 与波束分配每 10 ms 更新一次。孪生与真实网络之间的测量同步间隔设为 $t_{\rm sync}\in\{100,200,300,400,800\}$ ms，使用 16 对 PB。每次同步后，数字孪生根据真实测量校准，使用简单线性回归估计各用户短期运动趋势，并在一个同步区间中并行合成 $\lfloor t_{\rm sync}/t_{\rm allc}\rfloor$ 组信道，用于 R2BA 的在线微调。信道孪生校准及模型优化与真实网络异步进行；文中端到端延迟约为 19.90 ms，系统测试运行 40 s。

图 17a 表明，R2BA-Syn.-2 的信道 NMSE 始终比 R2BA-Syn.-1 低约 3.3–3.4 dB，说明 P2CGNet 生成的虚拟信道更忠实；相比之下，低维 PB 增益 NMSE 的变化较小。图 17b 中，R2BA-Syn.-2 的平均总速率比 R2BA-Syn.-1、R2BA 和 WMMSE 分别提高约 6.0%、10.6%、35.8%。当同步间隔拉长至 800 ms，其总速率仍为 **9120.8 Mbps**，分别高于上述三种基线 6.2%、14.2%、20.2%。图 17c 中，R2BA-Syn.-2 的速率违背率接近零，而 R2BA-Syn.-1 在 800 ms 时上升至 0.0025。该实验说明，及时更新与更准确的生成模型能够缓解数字孪生的信道陈旧问题，但并不意味着已显式学习连续时变多径。

## 附录 A–C：论证结构与长公式补录

### 附录 A：命题 1 的证明

令条件与无条件估计得分之差为

$$
\Delta_\epsilon(x,q,t)=
\epsilon_\theta(\widetilde{\mathbf H}_{x,q}^{t},x,q,t)
-\epsilon_\theta(\widetilde{\mathbf H}_{x,q}^{t},t).
$$

无分类器引导得分可重写为

$$
\mathbf G_{x,q}^{t}
=\epsilon_\theta(\widetilde{\mathbf H}_{x,q}^{t},t)
+\lambda\Delta_\epsilon(x,q,t). \tag{39}
$$

作者将无条件噪声得分估计器近似看作无偏，即其期望接近总体波束域分布的得分。由此定义

$$
\operatorname{MSE}_{\rm CF}(\lambda)
=\mathbb E_{(x,q)\sim\mathcal H^{\rm unsee}}
\left[\|\mathbf G_{x,q}^{t}-\widetilde{\mathbf G}_{x,q}^{t}\|_2^2\right].\tag{41}
$$

结合式（17）和式（39），可将最小二乘目标转换为

$$
\operatorname{MSE}_{\rm CF}(\lambda)
=\mathbb E_{(x,q)\sim\mathcal H^{\rm unsee}}
\left[\|\lambda\Delta_\epsilon(x,q,t)
-\widetilde{\mathbf G}_{x,q}^{t,0}\|_2^2\right].\tag{42}
$$

其中 $\operatorname{MSE}_{\rm Cond}=\operatorname{MSE}_{\rm CF}(1)$。右侧关于 $\lambda$ 是凸二次函数，只要 $\mathbb E\|\Delta_\epsilon\|^2>0$，便可以选取最优系数，其误差不会高于固定 $\lambda=1$ 的结果。需要强调：该存在性结论并不证明任意选取的 $\lambda$ 都优于条件网络。

### 附录 B：定理 1 的证明

作者考虑不额外注入随机噪声的去噪联合分布：

$$
p(\widetilde{\mathbf H}^{1:T}\mid\widetilde{\mathbf H}^{0})
=p(\widetilde{\mathbf H}^{T}\mid\widetilde{\mathbf H}^{0})
\prod_{t=2}^{T}
p(\widetilde{\mathbf H}^{t-1}\mid
\widetilde{\mathbf H}^{t},\widetilde{\mathbf H}^{0}).\tag{43}
$$

其中 $\widetilde{\mathbf H}^{T}\mid\widetilde{\mathbf H}^{0}$
服从均值为 $\sqrt{\bar\nu_T}\widetilde{\mathbf H}^0$、协方差为 $(1-\bar\nu_T)I$ 的高斯分布。对 $t>1$，给出确定性条件高斯转移（零方差）：

$$
p(\widetilde{\mathbf H}^{t-1}\mid
\widetilde{\mathbf H}^{t},\widetilde{\mathbf H}^{0})
=\mathcal N\!\left(
\vartheta_0\widetilde{\mathbf H}^{0}
+\vartheta_t\widetilde{\mathbf H}^{t},0
\right). \tag{44}
$$

在前向边缘分布保持不变时，训练目标只依赖 $p(\widetilde{\mathbf H}^{t}\mid\widetilde{\mathbf H}^{0})$，因而推理可以选择比训练时刻更稀疏的子序列，而不需要重新训练。使用得分预测干净信道，再代回零方差条件转移，即得到正文式（23）的跳步递推。子序列末端 $\varrho_S$ 应足够接近 $T$，以便初始先验近似标准高斯噪声。

### 附录 C：命题 2 的证明

由于 cDDIM 的跳步递推是线性的，执行 $S$ 步后，输出可表示为初始噪声与每个时刻得分的线性组合：

$$
\widetilde{\mathbf H}_{x,q}^{0}
=\eta\,\widetilde{\mathbf H}_{x,q}^{T}
+\sum_{s=1}^{S}\widetilde\gamma_{\varrho_s}
\bigl(\widetilde{\mathbf G}_{x,q}^{\varrho_s}
+\Delta_{x,q}^{\varrho_s}\bigr), \tag{46}
$$

其中 $\Delta_{x,q}^{\varrho_s}=\mathbf G_{x,q}^{\varrho_s}-\widetilde{\mathbf G}_{x,q}^{\varrho_s}$ 为噪声得分估计误差，系数 $\eta$ 和 $\widetilde\gamma_{\varrho_s}$ 由固定噪声调度决定。累计误差为 $\Delta_{x,q}=\sum_s\widetilde\gamma_{\varrho_s}\Delta_{x,q}^{\varrho_s}$。利用三角不等式，

$$
\mathbb E\|\Delta_{x,q}\|
\le \sum_{s=1}^{S}
|\widetilde\gamma_{\varrho_s}|\,
\mathbb E\|\Delta_{x,q}^{\varrho_s}\|. \tag{47}
$$

因此，当被选中的每个时刻均具有足够小的得分估计误差时，累计误差可以得到控制；反之，仅减少步数本身不能保证生成质量。对于不同的去噪步数 $S$，结论均需结合所选时刻的得分误差分析。

**校对范围：** 第五节的主要实验段落、图 5–17 所陈述的趋势和关键定量结果已补入；附录 A–C 补录了主要长公式与证明思路。但表 I–V 的逐项数据复刻、附录式（40）、（45）的符号细节及完整参考文献仍未通过逐项终校。


### 附录 A、B：公式（40）与（45）的原文补录

在附录 A 中，作者用下面的近似无偏假设描述无条件噪声网络对整体波束域信道分布的拟合：

$$
\mathbb E_{\{x,q\}\sim\mathcal H^{\rm unsee}}
\left[\epsilon_\theta(\widetilde{\mathbf H}_{x,q}^{t},t)\right]
\approx \nabla_{\widetilde{\mathbf H}_{x,q}^{t}}
\log p(\widetilde{\mathbf H}_{x,q}^{t}). \tag{40}
$$

**忠实性提醒：** 按原文抄录式（40）。它与正文式（18）中带有 $-\widetilde\sigma_t$ 的网络噪声得分对应式存在缩放与符号上的表述差异，不能未经检查就视作严格恒等关系。

在附录 B 中，对选定的推理时刻 $\varrho_s$，由带噪样本和估计得分恢复干净样本：

$$
\widetilde{\mathbf H}^{0}
=\frac{1}{\sqrt{\bar\nu_{\varrho_s}}}
\widetilde{\mathbf H}^{\varrho_s}
-\sqrt{\frac{1-\bar\nu_{\varrho_s}}{\bar\nu_{\varrho_s}}}\,
\mathbf G_{x,q}^{\varrho_s}. \tag{45}
$$

将式（45）代入零方差的条件转移式（44），即可得到正文的跨步采样公式（23）。这里需要 $\varrho_S$ 充分接近扩散终端 $T$，以确保从标准高斯先验开始反向生成具有合理的近似依据。

### 附录 A–C 证明细节补录（2026-10-30）

**附录 A 补充：$\operatorname{MSE}_{\rm CF}(\lambda)$ 的凸性与最优系数。** 原文把式（41）的 $\operatorname{MSE}_{\rm CF}(\lambda)$ 定义为无分类器引导得分 $\mathbf G^t_{x,q}$ 与真实得分 $\widetilde{\mathbf G}^t_{x,q}$ 之间的均方误差，并用式（17）与式（39）把它改写为对 $\widetilde{\mathbf G}^{t,\prime}_{x,q}$ 的二次型（式（42））。由此得到三点：

1. $\operatorname{MSE}_{\rm Cond}=\operatorname{MSE}_{\rm CF}(1)$，即纯条件得分对应的误差；
2. $\operatorname{MSE}_{\rm CF}(\lambda)$ 关于 $\lambda$ 是**凸二次函数**；
3. 由于存在 $x,q\in\widetilde{\mathcal H}^{\rm unsee}$、$t\in\mathcal T$ 使 $\mathbb E_{\{x,q\}\sim\mathcal H^{\rm unsee}}[\lVert\Delta_\epsilon(x,q,t)\rVert^2]>0$，故存在 $\lambda'>0$ 使 $\operatorname{MSE}_{\rm CF}(\lambda')\le\operatorname{MSE}_{\rm Cond}$；而 $\lambda^\ast=\arg\min_\lambda\operatorname{MSE}_{\rm CF}(\lambda)$，在 $\lambda^\ast=1$ 处 $\operatorname{MSE}_{\rm CF}(\lambda')=\operatorname{MSE}_{\rm Cond}$。

> **原文疑点：** 源 PDF 该段末句（"Note that ... holds at $\lambda^\ast=1$ with $\lambda^\ast=\arg\min_\lambda\operatorname{MSE}_{\rm CF}(\lambda)$"）表述较为含混：按凸二次函数的形式，最小点未必恰在 $\lambda=1$，且"存在 $\lambda'$ 使误差不高于条件误差"与"$\lambda^\ast=1$"并不等价。此处照录原文论断并加注，未擅自改动。

**附录 B 补充：$\vartheta_0$、$\vartheta_t$ 的显式定义与边缘分布依据。** 式（44）中的两个系数为

$$
\vartheta_0=\sqrt{\bar\nu_{t-1}}-\frac{\sqrt{\bar\nu_t}\,(1-\bar\nu_{t-1})}{\sqrt{1-\bar\nu_t}},\qquad
\vartheta_t=\frac{\sqrt{1-\bar\nu_{t-1}}}{\sqrt{1-\bar\nu_t}},
$$

其中 $\bar\nu_t$ 为（前向）噪声日程的累积系数。原文指出，根据文献 [32] 的 Lemma 1，前向边缘分布 $p(\widetilde{\mathbf H}^{t}\mid\widetilde{\mathbf H}^{0})=\mathcal N(\sqrt{\bar\nu_t}\widetilde{\mathbf H}^0,(1-\bar\nu_t)\mathbf I)$ 成立；由于训练目标式（15）只依赖这些边缘分布 $p(\widetilde{\mathbf H}^t\mid\widetilde{\mathbf H}^0)$、$t\in\mathcal T$，只要边缘不变，就可以在**不重新训练**的前提下选用更小的反向去噪步数来加速推断。原文进一步假设选取子序列 $\{\varrho_s\}_{s=1}^{S}\subset\mathcal T$，并给出由得分估计恢复干净信道的式（45）；再把它代入式（44）即得以均值采样方式导出的跳步递推（式（23））。还需 $p(\widetilde{\mathbf H}^T\mid\widetilde{\mathbf H}^0)$ 中的 $\varrho_S$ 接近 $T$，以便使用先验 $p(\widetilde{\mathbf H}^T)=\mathcal N(\mathbf 0,\mathbf I)$。

**附录 C 补充：累计误差的比例关系与 $\sup$ 论证。** 由式（46）可把第 $q$ 个 RBG、相对位置 $x$ 处的去噪输出写成初始噪声与各时刻（含误差的）得分之线性组合。累计误差 $\Delta_{x,q}=\sum_{s=1}^{S}\widetilde\gamma_{\varrho_s}\Delta^{\varrho_s}_{x,q}$ 完全由各步误差 $\Delta^{\varrho_s}_{x,q}$ 决定，因为 $\eta$ 与 $\widetilde\gamma_{\varrho_s}$ 由确定的 $\{\bar\nu_{\varrho_s}\}_{s=1}^{S}$ 决定。由三角不等式得式（47），并进一步有

$$
\mathbb E_{\{x,q\}\sim\mathcal H^{\rm samp}}\left[\lVert\Delta_{x,q}\rVert\right]\ \propto\ \mathbb E_{\{x,q\}\sim\mathcal H^{\rm samp}}\left[\lVert\Delta^{\varrho_s}_{x,q}\rVert\right],\qquad \forall s=1,\cdots,S .
$$

由此：若每个被选时刻都满足 $\mathbb E\lVert\Delta^{\varrho_s}_{x,q}\rVert\to0$（$s=1,\cdots,S$），则累计误差 $\mathbb E\lVert\Delta_{x,q}\rVert\to0$；反之，若某个被选时刻的 $\mathbb E\lVert\Delta^{\varrho_s}_{x,q}\rVert\gg0$，则推理性能无法保证，因为 $\sup\mathbb E\lVert\Delta_{x,q}\rVert\propto\mathbb E\lVert\Delta^{\varrho_s}_{x,q}\rVert$（$\forall s$）。该结论对任意去噪步数 $S$ 都成立。

## 参考文献

原文为 IEEE 编号引用制，以下按原编号逐条转录英文原条目（共 44 条，源文 pp. 15–16）。按版权口径，本页不转录作者简介。

[1] Y. Huang, "Challenges and opportunities of sub-6 GHz integrated sensing and communications for 5G-advanced and beyond," Chin. J. Electron., vol. 33, no. 2, pp. 323–325, Mar. 2024.

[2] X. You, Y. Huang, C. Zhang, J. Wang, H. Yin, and H. Wu, "When AI meets sustainable 6G," Sci. China Inf. Sci., vol. 68, no. 1, Jan. 2025, Art. no. 110301.

[3] A. Alkhateeb, S. Jiang, and G. Charan, "Real-time digital twins: Vision and research directions for 6G and beyond," IEEE Commun. Mag., vol. 61, no. 11, pp. 128–134, Nov. 2023.

[4] Z. Tao, W. Xu, Y. Huang, X. Wang, and X. You, "Wireless network digital twin for 6G: Generative AI as a key enabler," IEEE Wireless Commun., vol. 31, no. 4, pp. 24–31, Aug. 2024.

[5] H. Chai, H. Wang, T. Li, and Z. Wang, "Generative AI-driven digital twin for mobile networks," IEEE Netw., vol. 38, no. 5, pp. 84–92, Sep. 2024.

[6] S. Xiong, Y. Huang, S. He, and C. Zhang, "Enhancing radio resource management in RAN slicing by diffusion model and digital twin," IEEE Trans. Commun., vol. 73, no. 12, pp. 15295–15311, Dec. 2025.

[7] Y. Cao et al., "Advancing ubiquitous wireless connectivity through channel twinning," 2024, arXiv:2406.12268.

[8] Y. Zeng et al., "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1478–1519, 3rd Quart., 2024.

[9] X. Xu and Y. Zeng, "How much data is needed for channel knowledge map construction?" IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13011–13021, Oct. 2024.

[10] G. Kim, R. Jin, W. Funk, S.-J. Kim, and H. Lim, "Multiantenna channel map estimation using deep spatial interpolation," in Proc. IEEE Int. Conf. Acoust., Speech, Signal Process. Workshops (ICASSPW), Apr. 2024, pp. 790–794.

[11] Q. Chen, M. Huang, and J. Yang, "REM-Net+: 3D radio environment map construction guided by radio propagation model," IEEE Trans. Veh. Technol., vol. 75, no. 4, pp. 6351–6362, Apr. 2026.

[12] Y. Wang, S. Sun, N. Liu, L. Xu, and L. Wang, "Two-stage radio map construction with real environments and sparse measurements," IEEE Wireless Commun. Lett., vol. 14, no. 4, pp. 969–973, Apr. 2025.

[13] X. Zhao, Z. An, Q. Pan, and L. Yang, "NeRF2: Neural radio-frequency radiance fields," in Proc. 29th Annu. Int. Conf. Mobile Comput. Netw., Oct. 2023, pp. 1–15.

[14] H. Lu, C. Vattheuer, B. Mirzasoleiman, and O. Abari, "NeWRF: A deep learning framework for wireless radiation field reconstruction and channel prediction," 2024, arXiv:2403.03241.

[15] C. Wen, J. Tong, Y. Hu, Z. Lin, and J. Zhang, "Neural representation for wireless radiation field reconstruction: A 3D Gaussian splatting approach," 2024, arXiv:2412.04832.

[16] Z. Li et al., "Wideband RF radiance field modeling using frequency-embedded 3D Gaussian splatting," 2025, arXiv:2505.20714.

[17] E. Balevi, A. Doshi, A. Jalal, A. Dimakis, and J. G. Andrews, "High dimensional channel estimation using deep generative networks," IEEE J. Sel. Areas Commun., vol. 39, no. 1, pp. 18–30, Jan. 2021.

[18] M. Arvinte and J. I. Tamir, "MIMO channel estimation using score-based generative models," IEEE Trans. Wireless Commun., vol. 22, no. 6, pp. 3698–3713, Jun. 2023.

[19] Z. Chen, H. Shin, and A. Nallanathan, "Generative diffusion model-based variational inference for MIMO channel estimation," IEEE Trans. Commun., vol. 73, no. 10, pp. 9254–9269, Oct. 2025.

[20] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Trans. Wireless Commun., vol. 24, no. 7, pp. 5840–5854, Jul. 2025.

[21] B. Zhou, X. Yang, S. Ma, F. Gao, and G. Yang, "Low-overhead channel estimation via 3D extrapolation for TDD mmWave massive MIMO systems under high-mobility scenarios," IEEE Trans. Wireless Commun., vol. 24, no. 4, pp. 2797–2813, Apr. 2025.

[22] B. Chatelier, V. Corlay, M. Crussière, and L. Le Magoarou, "Model-based learning for multi-antenna multi-frequency location-to-channel mapping," IEEE J. Sel. Topics Signal Process., vol. 19, no. 3, pp. 520–535, Apr. 2025.

[23] X. Xu, X. Mu, Y. Liu, H. Xing, Y. Liu, and A. Nallanathan, "Generative artificial intelligence for mobile communications: A diffusion model perspective," IEEE Commun. Mag., vol. 63, no. 7, pp. 98–105, Jul. 2025.

[24] F. Euchner, J. Sanzi, M. Henninger, and S. Ten Brink, "GAN-based massive MIMO channel model trained on measured data," in Proc. 27th Int. Workshop Smart Antennas (WSA), Mar. 2024, pp. 109–116.

[25] Z. Liu et al., "Leveraging self-supervised learning for MIMO-OFDM channel representation and generation," 2024, arXiv:2407.07702.

[26] T. Lee, J. Park, H. Kim, and J. G. Andrews, "Generating high dimensional user-specific wireless channels using diffusion models," 2024, arXiv:2409.03924.

[27] P. Ferrand, M. Guillaud, C. Studer, and O. Tirkkonen, "Wireless channel charting: Theory, practice, and applications," IEEE Commun. Mag., vol. 61, no. 6, pp. 124–130, Jun. 2023.

[28] S. He et al., "An overview on the application of graph neural networks in wireless networks," IEEE Open J. Commun. Soc., vol. 2, pp. 2547–2565, 2021.

[29] S. He, S. Xiong, W. Zhang, Y. Yang, J. Ren, and Y. Huang, "GBLinks: GNN-based beam selection and link activation for ultra-dense D2D mmWave networks," IEEE Trans. Commun., vol. 70, no. 5, pp. 3451–3466, May 2022.

[30] S. He, S. Xiong, Z. An, W. Zhang, Y. Huang, and Y. Zhang, "An unsupervised deep unrolling framework for constrained optimization problems in wireless networks," IEEE Trans. Wireless Commun., vol. 21, no. 10, pp. 8552–8564, Oct. 2022.

[31] Y. Heng and J. G. Andrews, "Grid-free MIMO beam alignment through site-specific deep learning," IEEE Trans. Wireless Commun., vol. 23, no. 2, pp. 908–921, Feb. 2024.

[32] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," 2020, arXiv:2010.02502.

[33] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Proc. Adv. Neural Inf. Process. Syst., vol. 33, 2020, pp. 6840–6851.

[34] J. Ho and T. Salimans, "Classifier-free diffusion guidance," 2022, arXiv:2207.12598.

[35] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," 2015, arXiv:1505.04597.

[36] A. Vaswani et al., "Attention is all you need," in Proc. Adv. Neural Inf. Process. Syst., vol. 30, 2017, pp. 1–11.

[37] A. Dosovitskiy et al., "An image is worth 16 × 16 words: Transformers for image recognition at scale," 2020, arXiv:2010.11929.

[38] J. Hoydis et al., "Sionna: An open-source library for next-generation physical layer research," 2022, arXiv:2203.11854.

[39] J. Hoydis et al., "Sionna RT: Differentiable ray tracing for radio propagation modeling," in Proc. IEEE Globecom Workshops (GC Wkshps), Dec. 2023, pp. 317–321.

[40] G. Y. Lu and D. W. Wong, "An adaptive inverse-distance weighting spatial interpolation technique," Comput. Geosci., vol. 34, no. 9, pp. 1044–1055, Sep. 2008.

[41] T. Du and T. Wilna, "Radial basis function interpolation," Ph.D. dissertation, Stellenbosch Univ., Stellenbosch, South Africa, 2008.

[42] F. Euchner and M. Gauger, "CSI Dataset dichasus-dxxx-complete: Outdoor—Three arrays distributed along the facade," Inst. Telecommun., Univ. Stuttgart (DaRUS), Stuttgart, Germany, Tech. Rep. DARUS-3153, ver. 1, 2022, doi: 10.18419/darus-3153.

[43] F. Euchner et al., "CSI Dataset dichasus-dcxx: Institute hallway with known 3D model, distributed antennas," DaRUS, Inst. Telecommun., Univ. Stuttgart, Stuttgart, Germany, Tech. Rep. DARUS-3831, ver. 1, 2023, doi: 10.18419/darus-3831.

[44] R. Jain, D. M. W. Chiu, and W. R. Hawe, "A quantitative measure of fairness and discrimination," Eastern Res. Lab., Digit. Equip. Corp., Hudson, MA, vol. 21, no. 1, p. 2022, 1984.

## 本轮补齐与仍余事项

本轮（2026-10-30）在该页已有正文 I–VI、式（1）—（47）与附录 A–C 主公式的基础上补入：① 原文**表 I：仿真参数**的逐格转录（源 PDF 第 9 页，p. 20455；表体为排版对象、文本抽取取不到，按渲染图像人工转录并标注）；② 全部 **44 条英文参考文献**（源文 pp. 15–16）；③ 附录 A 的凸性与最优系数论证、附录 B 的 $\vartheta_0/\vartheta_t$ 显式定义与"边缘不变即可跳步"的依据、附录 C 的累计误差比例关系与 $\sup$ 论证，并对原文附录 A 末句的含混表述加注"原文疑点"。

仍余：① 表 II–V（复杂度、推理时延、四场景泛化与下游端到端结果）仅按正文关键数值概述，未逐格转录；② 图 1–17 原始图像未转录（站点不上传图像，仅保留中文图注与关键数值）；③ 逐句人工终校未做；④ 该论文为 IEEE 版权（DOI 10.1109/TWC.2026.3714387），**公开再传播许可需另行核验**，本页按既有做法只补结构、公式、表格与英文书目，未新增作者简介等纯原文转述内容。因此本页仍标为"未完成"。
