---
layout: page
title: "生成式 AI 赋能的用户专属信道数字孪生｜中文译稿（未完成）"
permalink: /papers/translations/2026-10-25-user-channel-digital-twin-p2cgnet/
math: true
toc: true
---

[← 返回论文库](/papers/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3714387)

# 生成式人工智能赋能的用户专属信道数字孪生：面向高效无线优化

**原题：** Generative AI-Empowered User-Specific Channel Digital Twin for Efficient Wireless Optimization  
**作者：** Shaowen Xiong、Shiwen He、Guanghui Chen、Zhenyu Tao、Hongxin Lin、Yongming Huang  
**来源：** *IEEE Transactions on Wireless Communications*, Vol. 25 (2026), DOI: 10.1109/TWC.2026.3714387。  
**译稿状态（2026-10-25）：** 阶段性译稿，非全文。覆盖摘要、第一节、第二节问题表述、第三节生成模型的主要思想及公式、第四节下游任务的框架说明、第五节部分结论和第六节结论；未逐式翻译完整训练算法、全部实验图表、附录及参考文献。请以英文原文核对公式、定理和实验数据。本站未重复上传原始 PDF 或图片。

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

**译稿缺口：** 此页面尚未完成第三节逐式算法、第四节完整 R2BA 模型、第五节所有图表以及附录证明和参考文献的翻译；其中 IEEE 正式版共 16 页。当前页面不能冒充逐字逐句全文译文。论文版权归原权利人所有，公开传播许可依 IEEE 规定核验。


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
$\widetilde{\mathbf G}_{x,q}^{t}
=-\widetilde\sigma_t\nabla_{\widetilde{\mathbf H}^{t}}\log p(\widetilde{\mathbf H}^{t}\mid x,q)$。
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

**本轮范围：** 补入第三节条件推断及网络的公式（11）–（28e）、算法 1–2，并补入第四节公式（29）–（37）与闭环训练逻辑。第五节完整结果仍需按图 5–17、表 I 及正文逐项核验，附录 A–C 的全部证明未完成逐式终校。
