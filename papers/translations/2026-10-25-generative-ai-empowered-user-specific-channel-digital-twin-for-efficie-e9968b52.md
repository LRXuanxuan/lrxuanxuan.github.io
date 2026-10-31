---
layout: page
title: "生成式 AI 赋能的用户级信道数字孪生｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-25-generative-ai-empowered-user-specific-channel-digital-twin-for-efficie-e9968b52/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e9968b52681439f5/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

# 生成式 AI 赋能的用户级信道数字孪生

**原题：** Generative AI-Empowered User-Specific Channel Digital Twin for Efficient Wireless Optimization  
**作者：** Shaowen Xiong（熊绍文，Graduate Student Member, IEEE）、Shiwen He（何世文，Senior Member, IEEE）、Guanghui Chen（陈光辉，Member, IEEE）、Zhenyu Tao（陶振宇，Graduate Student Member, IEEE）、Hongxin Lin（林鸿鑫）、Yongming Huang（黄永明，Fellow, IEEE）  
**单位：** 东南大学信息科学与工程学院移动通信国家重点实验室（南京 210096）与紫金山实验室；中南大学计算机科学与工程学院（长沙 410083）；郑州大学电气与信息工程学院（郑州 450001）；紫金山实验室（南京 210096）。通讯作者：黄永明、何世文。  
**版本：** IEEE Transactions on Wireless Communications, vol. 25, 2026, pp. 20447–20462（IEEE 正式版/期刊，DOI: 10.1109/TWC.2026.3714387）；本地 PDF 16 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VI 节正文、图 1–17 中文图注、表 I–V 逐格转写、算法 1–2 伪代码、附录 A–C（命题 1–2 与定理 1 证明）、参考文献 44 条英文原条目（按原编号），以及 6 位作者简介。逐句逐式终校未做。

> **原文首页脚注：** 收稿 2025 年 8 月 29 日；修回 2026 年 1 月 27 日与 2026 年 6 月 8 日；录用 2026 年 7 月 13 日；当前版本日期 2026 年 7 月 24 日。本工作部分得到国家自然科学基金（62225107、62171474）、移动信息网络国家科技重大专项（2025ZD1305000）、中央高校基本科研业务费（2242022k60002）、江苏省前沿引领技术基础研究专项（BK20222001）以及 2025 年湖南省十大技术攻关项目（2025QK1009）资助。负责本文审稿并批准发表的副编辑为 H. Seo。（通讯作者：黄永明、何世文。）  
> **版权声明（原文）：** 1536-1276 © 2026 IEEE。保留所有权利，包括用于文本与数据挖掘、以及训练人工智能及类似技术的权利。允许个人使用，但再发表/再分发需获得 IEEE 许可。

## 摘要

免反馈的用户级信道获取对网络数字孪生（DT）与信道预测等无线应用至关重要，对感兴趣位置（POI）尤为如此。然而无线信道维度的不断增长给高效信道获取带来重大挑战。本文针对多输入多输出正交频分复用（MIMO-OFDM）系统提出一种用户级信道生成模型，称为位置到信道生成网络（P2CGNet）。通过把无分类器引导的扩散模型与 Transformer 架构结合，P2CGNet 以用户位置与频偏为条件生成高保真信道。为在保持生成保真度的同时提升计算效率，进一步提出基于块的子信道分解策略与隐式去噪机制。理论分析表明 P2CGNet 能学习底层信道分布并加速推理。作为实际验证，P2CGNet 被集成到信道 DT 中，用于在仅有稀疏探测波束测量的多用户 MIMO-OFDM 系统中做空间–时间–频率资源联合优化。为此提出智能资源块分配与波束对齐（R2BA）模型，它借助信道 DT 与先验通信模型获取意图导向测量，并用分层图神经网络提取有效表示。数值结果表明，P2CGNet 在信道生成质量、数据效率、天线规模可扩展性与计算开销方面总体优于原始扩散模型与基于生成对抗网络的方法；此外 P2CGNet 具有更好的陈旧度鲁棒性，并能通过为给定 POI 生成信道显著提升下游任务的谱效。

**索引词：** MIMO、OFDM、生成式 AI、扩散模型、信道生成、数字孪生、资源管理。

## I. 引言

高性能计算与人工智能（AI）的近期进展推动了面向无线优化任务的数据驱动方案，包括信号检测、预编码与空时频（STF）资源管理，以缓解传统方法的计算负担 [1], [2]。然而随着 5G/6G 系统采用大规模 MIMO 与 OFDM 架构，信道状态信息（CSI）维度呈指数增长。传统 CSI 估计依赖周期性导频发送与反馈机制，存在过高频谱开销与时延，在需要精确 CSI 做波束对齐（BA）与预编码的动态环境中尤为突出。同时，6G 网络中新兴的数字孪生（DT）应用需要高效预验证能力 [3]–[6]，要求在位置或 STF 特定条件下可靠生成虚拟 CSI [7]。

本文关注在相对稀疏的测量数据下、不依赖精确信道模型或高保真三维环境模型，实现足够准确的站点特定信道重建。尽管 COST 与 3GPP CDL 等标准化模型在大尺度信道表征与标准化方面取得巨大成功，但若无专家驱动的重新配置，难以适配站点特定信道分布。基于射线追踪的方法灵活性更高，但其计算成本随天线规模与材料复杂度显著上升，且性能依赖往往构建与校准成本高昂的精确三维环境模型。经典空间插值方法在稀疏或含噪测量下也受限，且通常缺乏产生物理一致外推的能力。一个有前景的替代方案是利用先进生成模型与相对稀疏的 STF-CSI 测量构建轻量预测模型，从而实现面向 BA 与定位等通信 AI 任务的高性价比欠采样 CSI 获取。

### A. 相关工作

近年来已有大量工作研究高效信道建模与预测，尤其借助数据驱动方法，以降低信道获取开销或提供 DT 等定向服务。主要有如下几条技术路线。

**1) 信道地图（CM）构建：** CM 是支撑环境感知通信的新兴 CSI 获取工具 [8]。实现方式之一是利用历史环境感知 CSI 数据或经信道模型合成的数据构建环境感知 CSI 映射模型 [9]–[12]；换言之，这是由纯数据或数据加模型驱动的 CSI 插值或增广方法。另一条路线是利用以 [13]–[16] 为代表的神经辐射场技术；相比传统确定性射线追踪方法，该方式在模拟电磁传播的同时降低了计算复杂度。但这些工作主要关注大尺度 CSI（如信道增益）获取，难以直接用于预编码与 BA 等复杂无线优化任务。此外，这些工作的骨干方法主要是多层感知机（MLP）或卷积网络等传统神经网络，它们本质上难以捕捉环境与 CSI 之间的分布关系，导致泛化性差或需要高密度训练数据测量/采样。

**2) 数据驱动信道估计：** 许多工作通过利用隐式 CSI 测量做信道估计或外推来降低导频开销 [17]–[22]。生成对抗网络（GAN）与扩散模型（DM）已被用于学习导频测量与信道矩阵之间的分布 [17]–[20]。DM 可与通信理论模型有效结合，例如 [19] 用 DM 学习 CSI 先验并从导频与接收信号推导变分 CSI 推断；[20] 通过基于解析导频–信号建模的后验推断提升信道重建精度。降低导频或反馈开销的另一途径是信道外推或插值 [21], [22]。为避免大规模 MIMO 中的全维 CSI 反馈，文献发展了基于插值/外推的少样本反馈与时间–频率–天线三维外推方法用于 CSI 重建 [21]。尽管这些方法配合导频反馈有效，但不适用于免反馈的用户级信道生成。为此，[22] 基于指定信道模型提出一种 MIMO-OFDM 信道生成方法，但其本质是拟合信道模型超参数，需要昂贵的高密度天线域 CSI 采样，且推广到未知无线环境时可能面临理论局限。

**3) 生成式信道模型：** 作为新兴且强大的技术，以 GAN 与 DM 为代表的生成式 AI（GAI）已受到越来越多关注并广泛应用于无线网络 [23]。除数据驱动信道估计外，GAI 也被用于用户级信道数据合成。[24] 用 GAN 增强用户级单频 MIMO 信道数据；[25] 为从地理位置生成 MIMO 预编码矩阵，把自监督潜信道表示与 Transformer、DM 结合，但其性能依赖全面信道采样以做稳健潜解码，推理速度也受限。此外，[26] 提出基于条件扩散去噪隐式模型（cDDIM）的用户级 MIMO 信道生成模型，但未能有效利用 cDDIM 天然的推理加速特性，因而需要额外设计推理加速；其用户级信道预测精度也较差，阻碍了高精度需求场景中的应用。

### B. 动机与贡献

已有若干用户级信道生成研究，但我们发现如下局限：1) 部分工作（如 [25]）在潜信道表示下构建生成信道模型；这虽降低问题建模复杂度，但训练稳健潜模型需要海量数据，代价高昂。2) 基于 GAN 或原始 DM 的高维用户级 MIMO-OFDM 信道生成方法 [24], [26] 难以取得高生成质量或信道一致性，因为它们无法高效捕捉复杂分布；此外，为绿色计算与瞬时场景的及时 CSI 获取，推理时延也需优化。3) 现有下游验证工作 [26] 主要聚焦信道压缩反馈或 BA 等简单网络优化的数据增广，而扩展到 DT 等应用时，系统级关键性能指标验证更有价值。

总体而言，本文提出高效的免反馈用户级信道生成模型——位置到信道生成网络（P2CGNet），它也是 CM 的一种实现，用于预测用户级信道¹。把 P2CGNet 集成到信道 DT 后，在多用户（MU）MIMO-OFDM 通信系统中进行 STF 资源联合优化。贡献总结如下。

- 我们在波束空间信道域中设计了一种高效的免反馈用户级 MIMO-OFDM 信道生成方法 P2CGNet：采用无分类器（CF）引导的 cDDIM 机制与基于块化 Transformer 的扩散得分估计网络。P2CGNet 在无需额外加速设计的情况下实现高采样质量与高效推理速度。
- 我们从理论上分析了 P2CGNet 的有效性，包括为何借助 CF 引导的 cDDIM 推理机制可实现更准确的扩散得分匹配，以及以更少去噪步实现有效 cDDIM 推理加速的前提条件。
- 我们把 P2CGNet 集成到信道 DT 中，用于 MU MIMO-OFDM STF 资源管理；据此提出基于探测波束（PB）测量的模型——资源块分配与波束对齐（R2BA）。为降低测量成本，R2BA 通过 P2CGNet 与先验通信模型获取意图导向测量，并用分层图神经网络（HGNN）提取有效表示。
- 数值仿真表明，P2CGNet 在信道生成质量、数据效率、天线规模可扩展性与计算开销方面总体优于原始 DM 与基于 GAN 的方法。对下游任务，DT 辅助的 R2BA 提升了陈旧度鲁棒性，并相对原生 R2BA 显著提高总数据速率。

> **原文脚注 1：** 与信道图（CC）[27] 这一无需位置标签、自监督学习 CSI 地图低维表示的技术不同，P2CGNet 关注从稀疏测量推断欠采样位置的 CSI。借助 P2CGNet，可用相对较低的采样开销高效构建 CC 地图。

### C. 组织结构与记号

本文其余部分组织如下：第 II 节描述信道模型与目标问题；第 III 节介绍用户级信道生成模型 P2CGNet；第 IV 节为评估 P2CGNet 的有效性，设计一种解决 MU MIMO 通信系统中联合 TF 资源分配与 BA 优化的方法；第 V 节给出数值仿真结果；第 VI 节总结全文。

**记号：** 小写字母与粗体大写字母分别表示向量与矩阵。$\mathbf A^H$ 表示矩阵 $\mathbf A$ 的共轭转置，$\mathbf a^T$ 表示向量 $\mathbf a$ 的转置。$|\cdot|$ 与 $\|\cdot\|$ 分别表示复标量的绝对值与欧氏向量范数。$\mathbb C$ 与 $\mathbb R$ 分别表示复数与实数集合。

## II. 系统模型

本节描述 MIMO-OFDM 通信系统下的信道模型与目标问题，随后建立 MU MIMO-OFDM 通信系统中的联合资源块组分配（RBGA）与 BA 问题，作为所提信道生成方法的实际评估指标。

### A. 信道模型与问题描述

考虑单基站（BS）服务覆盖区域 $\Omega\subseteq\mathbb R^{3\times1}$ 内 $N_{\mathrm u}$ 个用户设备（UE）的 MIMO-OFDM 通信系统。BS 与每个 UE 分别配备 $N_t$ 与 $N_r$ 根天线阵列。采用 OFDM 传输技术时，在时刻 $\tau$、第 $k$ 个子载波上，BS 与位于相对 BS 位置 $\mathbf x_u\in\Omega$ 的任意 UE $u\in\mathcal N_{\mathrm u}\triangleq\{1,\cdots,N_{\mathrm u}\}$ 之间经 $L$ 条传输路径的信道 $\mathbf H_{u,k}^\tau\in\mathbb C^{N_r\times N_t}$ 可表示为

$$
\mathbf H_{u,k}^\tau=\sum_{\ell=1}^{L}\beta_{u,k,\ell}^\tau\mathbf a_r\left(\overleftarrow{\vartheta}_\ell^\tau,\overleftarrow{\psi}_\ell^\tau\right)\mathbf a_t^H\left(\overrightarrow{\vartheta}_\ell^\tau,\overrightarrow{\psi}_\ell^\tau\right), \tag{1}
$$

其中信道增益 $\beta_{u,k,\ell}^\tau$ 为

$$
\beta_{u,k,\ell}^\tau=\sqrt{p_{u,k,\ell}^\tau/N_{\mathrm{sc}}}e^{\mathrm j\left(\varphi_{u,k,\ell}^\tau+\frac{B}{N_{\mathrm{sc}}}\frac{2\pi k}{N_{\mathrm{sc}}}\iota_{u,k,\ell}^\tau\right)}, \tag{2}
$$

其中 $N_{\mathrm{sc}}$ 与 $L$ 分别表示子载波总数与传输路径数，$B$ 表示子载波带宽。$(\overleftarrow{\vartheta}_\ell^\tau,\overleftarrow{\psi}_\ell^\tau)$ 与 $(\overrightarrow{\vartheta}_\ell^\tau,\overrightarrow{\psi}_\ell^\tau)$ 分别表示到达角（AoA）与离开角（AoD）的方位角与俯仰角对，$p_{u,k,\ell}^\tau$、$\varphi_{u,k,\ell}^\tau$ 与 $\iota_{u,k,\ell}^\tau$ 分别表示第 $\ell$ 条路径的功率、相位与时延。$\mathbf a_r(\cdot)\in\mathbb R^{N_r\times1}$ 与 $\mathbf a_t(\cdot)\in\mathbb R^{N_t\times1}$ 分别为接收与发送阵列响应向量，其细节由具体天线架构决定，此处从略。

在时刻 $\tau$，给定相对位置 $\mathbf x_u$ 后，AoA、AoD、$L$ 与 $\beta_{u,k,\ell}^\tau$ 都是用户特定条件随机变量，这使随 MIMO-OFDM 系统规模扩大 $\mathbf H$ 的获取成本更具挑战，传统 CSI 估计方法也难以用于 DT。我们的目标是利用稀疏真实 CSI 数据开发用户级小尺度（天线域信道矩阵）信道生成模型² P2CGNet，并把它集成到信道 DT [7] 中，以促进面向 POI 的 CSI 获取以服务下游任务。图 1 展示以站点特定丰富大/小尺度先验信道知识为特征的信道 DT 如何赋能下游无线网络优化任务。简言之，借助已建成的信道 DT，给定 POI 或其预测值，下游策略优化任务所需数据可直接获取，或利用必要先验引导信息合成；此外，采样点上的信道数据可周期性更新以应对陈旧性。据此引入如下任务作为实际评估指标。

> **原文脚注 2：** 当前模型是任务导向、测量同步的虚拟信道表示，而非完整物理级无线电孪生。它由稀疏 CSI 与位置测量周期性更新，以刷新面向下游任务的虚拟信道状态，并在给定空间与频率信息条件下生成瞬时 CSI。由于未显式建模连续时间信道演化，本框架最适合局部准静态场景；具有显著多普勒效应的高移动性场景需要显式时变信道建模。

> **图 1（原文 Fig. 1）：** 信道 DT 辅助的下游无线网络优化。

### B. 下游任务：联合 RBGA 与 BA 问题

**1) 传输模型。** 考虑下行 MU MIMO-OFDM 单流传输系统，其带宽划分为子载波，无线资源组织为物理资源块（PRB）。每个 PRB 由一个传输时间间隔与 $k_0$ 个子载波组成，是最小分配单元。为降低实际 PRB 分配中的系统处理开销，PRB 进一步组合为资源块组（RBG），记为 $\mathcal Q\triangleq\{1,\cdots,Q\}$，每个 RBG 含 $q_0$ 个 PRB，$Q$ 是 RBG 总数。对本任务我们关注极端连接场景，为简洁忽略时间 $\tau$。假设第 $q$ 个 RBG 上的信道 $\mathbf H_{u,q}\in\mathbb C^{N_r\times N_t}$ 取为 $\mathbf H_{u,q}=\mathbf H_{u,k}$，其中 $k=\lfloor(2q-1)k_0q_0/2\rfloor$，$\lfloor\cdot\rfloor$ 表示向下取整。

假设 $\mathcal N_{\mathrm u}$ 中所有 UE 均处于激活状态，且 BS 对所有 UE 采用相同发送功率，即 BS 在第 $q$ 个 RBG 上向第 $u$ 个 UE 的发送功率为

$$
p_{u,q}=\frac{\mu_{u,q}P_{\max}}{\sum_{q'\in\mathcal Q}\mu_{u,q'}},\qquad\forall u\in\mathcal N_{\mathrm u},\ q\in\mathcal Q,
$$

其中 $P_{\max}$ 表示 BS 的最大发送功率。记 RBGA 结果为二元变量 $\mu_{u,q}\in\{0,1\}$（$\forall u\in\mathcal N_{\mathrm u},q\in\mathcal Q$），其中 $\mu_{u,q}=1$ 表示第 $q$ 个 RBG 分配给第 $u$ 个 UE，否则为 0。对第 $u$ 个 UE，若 BS 采用发送波束 $\mathbf w_u\in\mathbb C^{N_t\times1}$ 发送符号 $s$，UE 在所有被分配 RBG 上采用接收波束 $\mathbf v_u\in\mathbb C^{N_r\times1}$，则第 $q$ 个 RBG 上的接收信号可写为

$$
y_{u,q}=\mu_{u,q}\cdot\left(\sqrt{p_{u,q}}\mathbf v_u^H\mathbf H_{u,q}\mathbf w_us+I_{u,q}\right), \tag{3}
$$

其中干扰加噪声项 $I_{u,q}$ 为

$$
I_{u,q}=\sum_{u'\in\mathcal N_{\mathrm u}\backslash u}\mu_{u',q}\cdot\left(\sqrt{p_{u',q}}\mathbf v_u^H\mathbf H_{u,q}\mathbf w_{u'}s+\mathbf v_u^H\mathbf n_{u,q}\right), \tag{4}
$$

其中 $\mathbf n_{u,q}\in\mathbb C^{N_r\times1}\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I)$ 表示加性白高斯噪声（AWGN）。假设发送符号 $s$ 为单位功率，则第 $u$ 个 UE 在第 $q$ 个 RBG 上的信干噪比为

$$
\gamma_{u,q}=\frac{\mu_{u,q}p_{u,q}\left|\mathbf v_u^H\mathbf H_{u,q}\mathbf w_u\right|^2}{\sum_{u'\in\mathcal N_{\mathrm u}\backslash u}\mu_{u',q}p_{u',q}\left|\mathbf v_u^H\mathbf H_{u,q}\mathbf w_{u'}\right|^2+\sigma^2}. \tag{5}
$$

于是第 $u$ 个 UE 在其被分配 RBG 上可达的数据速率为

$$
R_u=\sum_{q\in\mathcal Q}B_q\log_2\left(1+\gamma_{u,q}\right),\qquad\forall u\in\mathcal N_{\mathrm u}, \tag{6}
$$

其中 $B_q$ 表示第 $q$ 个 RBG 的带宽。

**2) 问题建模。** 目标是通过设计联合 RBGA 与 BA 方案，在考虑频率选择性衰落的条件下最大化总数据速率，从而在数据速率与 UE 公平性之间取得折中。对公平性问题采用 $\alpha$-比例效用函数，即

$$
U_\alpha(x)=\begin{cases}(1-\alpha)^{-1}x^{1-\alpha}, & 0\le\alpha<1,\\ \log(x), & \alpha=1.\end{cases} \tag{7}
$$

于是优化问题建模为

$$
\mathrm{P0}:\ \max_{\{\mu_{u,q},\mathbf w_u,\mathbf v_u\}}\sum_{u\in\mathcal N_{\mathrm u}}U_\alpha\left(R_u\right) \tag{8a}
$$

$$
\text{s.t.}\quad\left\|\mathbf w_u\right\|^2=1,\ \left\|\mathbf v_u\right\|^2=1,\quad\forall u\in\mathcal N_{\mathrm u}, \tag{8b}
$$

$$
\mu_{u,q}\in\{0,1\},\quad\forall u\in\mathcal N_{\mathrm u},\ q\in\mathcal Q, \tag{8c}
$$

$$
R_u\ge R_0,\quad\forall u\in\mathcal N_{\mathrm u}, \tag{8d}
$$

其中 $\|\cdot\|_2$ 表示 $L_2$ 范数。约束 (8b) 限制 BS 与 UE 采用的单位模波束；(8d) 中 $R_0$ 表示激活 UE 的基本通信需求。P0 是 NP 难的。为求解它，受数据驱动方法在类似难题上成功的启发 [28]–[31]，本研究采用并行策略。获得稳健模型需要全面数据样本，而利用隐式 PB 测量 [31] 仍需大量信道采样来校准模型，不可避免地带来过高开销并阻碍实际部署。为此，在 P2CGNet 辅助下设计智能算法 R2BA 来管理 P0 的 STF 资源：R2BA 借助 P2CGNet 获取或增广意图训练数据，并利用 HGNN 高效抽象有效信息。

## III. P2CGNet 的设计

显式信道分布 $p(\mathbf H_{x,q})$（$x\in\Omega,q\in\mathcal Q$）未知，且我们不作任何关于它的假设。为便于信道表示与学习，应利用具有显著空间相关性的 MIMO 信道的波束空间表示 [26]。因此 P2CGNet 在波束空间信道表示 $\hat{\mathbf H}_{x,q}\in\mathbb C^{N_r\times N_t}$ 下设计，可高效实施为

$$
\hat{\mathbf H}_{x,q}=\mathbf D_r^H\mathbf H_{x,q}\mathbf D_t,\qquad\forall x\in\Omega,\ q\in\mathcal Q, \tag{9}
$$

其中 $\mathbf D_r\in\mathbb C^{N_r\times N_r}$ 与 $\mathbf D_t\in\mathbb C^{N_t\times N_t}$ 是酉离散傅里叶变换（DFT）矩阵。反之，利用逆 DFT（IDFT）可由 $\hat{\mathbf H}_{x,q}$ 恢复 $\mathbf H_{x,q}$。

P2CGNet 旨在利用有限的地面测量 $\mathbf H^{\mathrm{samp}}=\{\mathbf H_{x,q},x,q\}$（$x\in\Omega^{\mathrm{samp}}\subset\Omega$、$q\in\mathcal Q^{\mathrm{samp}}\subset\mathcal Q$）学习逼近 $p(\hat{\mathbf H}_{x,q}|x,q)$ 的位置到信道（P2C）条件分布，其中 $\Omega^{\mathrm{samp}}$ 与 $\mathcal Q^{\mathrm{samp}}$ 分别表示测量区域与 RBG 索引集合。对宽带系统，获取全部频域信道会带来难以承受的开销，故信道插值/外推是必要的。总体目标由定义 1 给出。

**定义 1（P2CGNet 的目标）：** 给定稀疏测量数据集 $\mathbf H^{\mathrm{samp}}$，P2CGNet 旨在学习带可学习参数 $\Theta$ 的生成网络 $\mathcal G(x,q|\Theta)$，使其在 $x\in\Omega$ 与 $q\in\mathcal Q$ 上逼近 $p(\hat{\mathbf H}_{x,q}|x,q)$，形式化地

$$
\mathbb E_{x\sim\Omega,q\sim\mathcal Q}\left[\mathcal D\left(\mathcal G(x,q|\Theta),p(\hat{\mathbf H}_{x,q}|x,q)\right)\right]\to0, \tag{10}
$$

其中 $\mathcal D(\cdot)$ 是生成信道与真实信道分布之间的统计散度度量。

分布 $p(\mathbf H_{x,q})$ 本身未必像自然图像分布那样复杂，但在特定约束（如稀疏的位置–频率–CSI 数据，或在不匹配站点特定信道模型的情况下需要快速仿真）下做高保真建模仍具挑战。关键在于从 $\mathbf H^{\mathrm{samp}}$ 中提取潜在的跨域相关性（从 $x,q$ 到 $\mathbf H_{x,q}$）以增强 P2CGNet 的泛化能力。为此，生成式 AI 是有效工具。CF 引导的 cDDIM 通过建模条件概率分布、同时克服传统条件扩散概率模型（cDDPM）的马尔可夫链限制来促成这一点，从而有利于提升模型泛化性与推理速度。

下面先在第 III-A 节介绍如何利用 DM 学习无条件信道分布 $p(\hat{\mathbf H}_{x,q})$，再在第 III-B 节研究 CF-cDDIM 如何增强 $p(\hat{\mathbf H}_{x,q}|x,q)$ 的推断，随后在第 III-C 节给出 P2CGNet 的架构与优化算法。

### A. 用 DM 学习无条件信道分布

给定任意干净 MIMO 信道 $\mathbf H_{x,q}^0\sim\mathbf H^{\mathrm{samp}}$，首先按 (9) 对 $\mathbf H_{x,q}^0$ 施加 DFT 变换得到 $\hat{\mathbf H}_{x,q}^0$。P2CGNet 把 $\hat{\mathbf H}_{x,q}$ 分解为实部与虚部分别处理。为便于描述，在介绍 P2CGNet 时把 $\tilde{\mathbf H}_{x,q}\in\mathbb R^{N_r\times N_t}$ 视为 $\hat{\mathbf H}_{x,q}^0$ 的实部或虚部。在前向过程中，DM 在每个时间步 $t\in\{0,\cdots,T\}\triangleq\mathcal T$ 加高斯噪声来破坏 $\hat{\mathbf H}_{x,q}^0$，即

$$
\hat q\left(\tilde{\mathbf H}_{x,q}^t|\tilde{\mathbf H}_{x,q}^{t-1}\right)=\mathcal N\left(\tilde{\mathbf H}_{x,q}^t;\sqrt{1-\rho_t}\tilde{\mathbf H}_{x,q}^{t-1},\rho_t\mathbf I\right), \tag{11}
$$

其中 $\rho_t\in[0,1)$ 表示由特定 $\rho$-调度器得到的第 $t$ 个加噪步的方差。利用高斯分布性质，任意 $t\in\mathcal T$ 处的 $\tilde{\mathbf H}_{x,q}^t$ 可由如下闭式得到 [32]：

$$
\tilde{\mathbf H}_{x,q}^t=\sqrt{\bar\nu_t}\tilde{\mathbf H}_{x,q}^0+\sqrt{1-\bar\nu_t}\mathcal N_t,\qquad\mathcal N_t\sim\mathcal N(\mathbf 0,\mathbf I), \tag{12}
$$

其中 $\bar\nu_t=\prod_{t'=1}^{t}\nu_{t'}$、$\nu_{t'}=1-\rho_{t'}$。前向 $T$ 步后，$\tilde{\mathbf H}_{x,q}^T$ 在 $\bar\nu_0\approx0$ 时逼近 $\mathcal N(\mathbf 0,\mathbf I)$。

相反，反向去噪阶段旨在利用如下时间相关的参数化神经网络逼近每个前向步 $t\in\mathcal T$ 的真实后验：

$$
p_\theta\left(\tilde{\mathbf H}_{x,q}^{t-1}|\tilde{\mathbf H}_{x,q}^t\right)=\mathcal N\left(\tilde{\mathbf H}_{x,q}^{t-1};\hat{\boldsymbol\mu}_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right),\hat\sigma_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)\mathbf I\right). \tag{13}
$$

具体地，采样 $\tilde{\mathbf H}_{x,q}^T\sim\mathcal N(\mathbf 0,\mathbf I)$ 并逐步去噪即可生成信道。实践中 $\hat\sigma_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 设为固定常数 $\tilde\sigma$，而 $\hat{\boldsymbol\mu}_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 可重参数化为

$$
\hat{\boldsymbol\mu}_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)=\frac{1}{\sqrt{\nu_t}}\left(\tilde{\mathbf H}_{x,q}^t-\frac{\rho_t}{1-\bar\nu_t}\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)\right), \tag{14}
$$

其中估计网络 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}^t,t)$ 被训练以预测每个前向步 $t\in\mathcal T$ 加入的高斯噪声 $\mathcal N_t\sim\mathcal N(\mathbf 0,\mathbf I)$，目标用如下损失函数最小化噪声重建误差 [32]：

$$
\mathcal L_{\mathrm{SM}}(\theta)=\mathbb E_{\tilde{\mathbf H}_{x,q}^0,\mathcal N_t,t}\left[\left\|\mathcal N_t-\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)\right\|_2^2\right]. \tag{15}
$$

### B. 后验推断的推导

第 III-A 节介绍的原始 DM 运行于无条件生成范式，而 P2CGNet 应建立在条件推断机制上以逼近 $p(\hat{\mathbf H}_{x,q}|x,q)$。由概率流常微分方程 [33]，可通过条件扩散去噪操作合成信道实现。具体地，在每个去噪步 $t\in\mathcal T$，条件生成过程数学上表述为

$$
\tilde{\mathbf H}_{x,q}^{t-1}=\tilde{\mathbf H}_{x,q}^t-\tilde\sigma_t\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t|x,q\right), \tag{16}
$$

其中 $\tilde{\mathbf G}_{x,q}^t\triangleq-\tilde\sigma_t\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p(\tilde{\mathbf H}_{x,q}^t|x,q)$ 表示条件得分函数，是生成样本的核心成分。$\tilde{\mathbf G}_{x,q}^t$ 未知，但由贝叶斯公式可改写为

$$
\tilde{\mathbf G}_{x,q}^t=-\tilde\sigma_t\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t\right)-\tilde\sigma_t\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(x,q|\tilde{\mathbf H}_{x,q}^t\right), \tag{17}
$$

其中无条件得分 $-\tilde\sigma_t\nabla_{\mathbf H_{x,q}^t}\log p(\tilde{\mathbf H}_{x,q}^t)$ 可由 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 镜像 [19], [20], [34]，即

$$
\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)\approx-\tilde\sigma_t\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t\right). \tag{18}
$$

推断 $\tilde{\mathbf G}_{x,q}^t$ 还需要分类器得分 $\tilde{\mathbf G}_{x,q}^{t,\prime}\triangleq\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p(x,q|\tilde{\mathbf H}_{x,q}^t)$，它与我们的目标相反。用分类器对 $\mathbf H_{x,q}^t$ 引导每个反向去噪步的采样是理想做法，但需要在所有反向步上训练稳健后验估计器，挑战很大。为此 CF 引导 DM 可高效估计 $\tilde{\mathbf G}_{x,q}^{t,\prime}$：它把 $x$ 与 $q$ 作为 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 的另两路条件输入，得到如下条件近似

$$
\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,x,q,t\right)\approx-\tilde\sigma_t\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t|x,q\right). \tag{19}
$$

随后利用贝叶斯公式、(18) 与 (19) 两个近似，按如下方式

$$
\tilde{\mathbf G}_{x,q}^{t,\prime}=\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t|x,q\right)-\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t\right)\approx-\frac{1}{\tilde\sigma_t}\left(\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,x,q,t\right)-\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)\right), \tag{20}
$$

即可由两个噪声估计网络得到 $\tilde{\mathbf G}_{x,q}^{t,\prime}$ 的近似。随后对 (20) 引入引导缩放因子 $\lambda$，并把 (18) 与 (20) 代入 (17)，$\tilde{\mathbf G}_{x,q}^t$ 可近似为 CF 引导扩散得分 $\mathbf G_{x,q}^t$，即

$$
\mathbf G_{x,q}^t\triangleq\lambda\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,x,q,t\right)+(1-\lambda)\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right). \tag{21}
$$

相应地，需要优化两个得分估计网络 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 与 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,x,q,t)$ 来建模 $\mathbf G_{x,q}^t$。CF 引导机制是贝叶斯推断中结合似然（条件）与先验（无条件）的稳健策略：通过 $\lambda$ 融合条件得分估计器与无条件得分估计器，模型降低了对训练中所见特定条件的过度依赖。$\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 作为通用先验稳定得分估计，尤其当条件输入 $\{x,q\}$ 偏离训练分布时。因此，对适当选取的 $\lambda$，与仅条件得分估计器相比，CF 引导估计器既保持条件相关性，又保留无条件 DM 捕捉的全局信道规律，从而在未见数据上取得更低的估计误差与更好的泛化，命题 1 形式化了这一点。

**命题 1：** 给定未见推断集 $\mathbf H^{\mathrm{unsee}}$，若适当选取 $\lambda'>0$，则对 $\forall x,q\in\mathbf H^{\mathrm{unsee}}$、$t\in\mathcal T$，CF 引导得分 (21) 相对条件得分 (19) 具有更稳健的泛化能力，即

$$
\mathrm{MSE}_{\mathrm{CF}}(\lambda')\le\mathrm{MSE}_{\mathrm{Cond}}, \tag{22}
$$

其中 $\mathrm{MSE}_{\mathrm{CF}}(\lambda')\triangleq\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{unsee}}}[\|\mathbf G_{x,q}^t-\tilde{\mathbf G}_{x,q}^t\|^2]$ 与 $\mathrm{MSE}_{\mathrm{Cond}}\triangleq\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{unsee}}}[\|\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,x,q,t)-\tilde{\mathbf G}_{x,q}^t\|^2]$ 分别表示 CF 引导与仅条件化的得分估计均方误差（MSE）。

**证明：** 见附录 A。∎

**注 1（$\lambda$ 的选取指导）：** 为防止估计值范数膨胀并保证误差有界，可把 $\lambda$ 约束在 $[0,1]$，使式 (21) 成为凸组合。实践中（次）最优 $\hat\lambda$ 通过交叉验证与网格搜索确定，即在验证集 $\mathbf H^{\mathrm{val}}$（模拟未见数据）上最小化 MSE：

$$
\hat\lambda=\arg\min_{\lambda\in\Lambda}\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{val}}}\left[\left\|\mathbf G_{x,q}^t-\tilde{\mathbf G}_{x,q}^t\right\|^2\right],
$$

其中 $\Lambda$ 是约束在 $[0,1]$ 内的离散集。

一般而言，高维样本推断需要大量去噪步，从而增加推理时延。为实现高效推理加速，利用 cDDIM 推理机制，通过打破马尔可夫链生成约束以少量去噪步生成确定性信道 [32]。CF 引导 cDDIM 推断的可行性与实现由定理 1 给出。

**定理 1：** 给定优化后的 P2CGNet 与预设子序列 $\{\varrho_s\}_{s=1}^{S}\subset\mathcal T$（$\varrho_S\to T$），第 $q$ 个 RBG 上相对位置 $x$ 处的确定性信道 $\tilde{\mathbf H}_{x,q}^0$ 可通过从 $\tilde{\mathbf H}_{x,q}^{\varrho_s}$ 到 $\tilde{\mathbf H}_{x,q}^{\varrho_{s-1}}$ 的跨步递归去噪加速生成：

$$
\tilde{\mathbf H}_{x,q}^{\varrho_{s-1}}=V_{\varrho_s}^{\tilde{\mathbf H}}\tilde{\mathbf H}_{x,q}^{\varrho_s}+V_{\varrho_s}^{\mathbf G}\mathbf G_{x,q}^{\varrho_s}, \tag{23}
$$

其中 $V_{\varrho_s}^{\tilde{\mathbf H}}=\sqrt{\bar\nu_{\varrho_{s-1}}/\bar\nu_{\varrho_s}}$，$V_{\varrho_s}^{\mathbf G}=\sqrt{1-\bar\nu_{\varrho_{s-1}}}-\sqrt{\bar\nu_{\varrho_{s-1}}}(1-\bar\nu_{\varrho_s})/\sqrt{\bar\nu_{\varrho_s}}$，$\mathbf G_{x,q}^{\varrho_s}$ 由 P2CGNet 估计。

**证明：** 见附录 B。∎

**注 2：** cDDIM 未规定前向过程。实践中子序列 $\{\varrho_s\}_{s=1}^{S}\subset\mathcal T$ 可用多种方法选取（如线性或二次方式），只要 $\varrho_S\to T$。我们选择前者，即 $\varrho_s=(s-1)\lfloor T/S\rfloor$（$\forall s=1,\cdots,S-1$）且 $\varrho_S=T$。

关键问题是在不降低性能的前提下 $S$ 可以取多小，这由命题 2 讨论。

**命题 2：** 设扩散得分估计误差为 $\Delta_{x,q}^{\varrho_s}\triangleq\mathbf G_{x,q}^{\varrho_s}-\tilde{\mathbf G}_{x,q}^{\varrho_s}$（$\forall x,q\in\mathbf H^{\mathrm{samp}}$、$\varrho_s\in\{\varrho_s\}_{s=1}^{S}$）。若 $\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}[\|\Delta_{x,q}^{\varrho_s}\|]\to0$（$\forall s=1,\cdots,S$），则可采用更小的 $S$ 达到与更大 $S$ 相当的性能；否则性能无法保证。

**证明：** 见附录 C。∎

由命题 2，要用 DDIM 推理机制实现有效推理加速，应准确估计 $\mathbf G_{x,q}^{\varrho_s}$（$\forall\varrho_s\in\{\varrho_s\}_{s=1}^{S}$）。为此下面介绍 P2CGNet 的具体设计。

### C. P2CGNet 架构

P2CGNet 的工作流程见图 2。训练时，干净 MIMO-OFDM 信道经 DFT 变换到波束空间 $\tilde{\mathbf H}$，随后施加 $T$ 个加噪步。两个扩散得分估计器 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 与 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,x,q,t)$ 通过最小化 (15) 联合优化。推断阶段采用 CF 引导 cDDIM 机制，按式 (23) 有效加速反向扩散过程。

P2CGNet 的核心是优化 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 与 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,x,q,t)$；为简化，可用单一网络 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,\cdot)$ 通过以条件激活概率阈值 $p_{\mathrm{th}}>0$ 丢弃条件信息来一起优化。具体地，给定 $p_{\mathrm{th}}$，并以概率方式激活条件信息 $x,q$，$\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,\cdot)$ 的输入可建模为

$$
\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,\cdot\right)\triangleq\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,x\cdot\mathbb 1_{\hat p_\epsilon>p_{\mathrm{th}}},q\cdot\mathbb 1_{\hat p_\epsilon>p_{\mathrm{th}}},t\right), \tag{24}
$$

其中当采样概率 $\hat p_\epsilon>p_{\mathrm{th}}$ 时指示函数 $\mathbb 1_{\hat p_\epsilon>p_{\mathrm{th}}}=1$，否则为 0。时间步 $t$、激活后的条件 $x$ 与 $q$ 分别经独立嵌入器 $\mathcal E_t(\mathrm{SP}(t)|\Theta)$、$\mathcal E_x(x|\Theta)$ 与 $\mathcal E_q(\mathrm{SP}(q)|\Theta)$ 嵌入，其中 $\mathrm{SP}(\circ)\in\mathbb R^{z\times1}$ 是输出 $z$ 维嵌入向量的正弦位置编码器，即

$$
\sinp(\circ,2i)=\sin\left(\circ/10000^{2i/z}\right),\qquad \sinp(\circ,2i+1)=\cos\left(\circ/10000^{2i/z}\right), \tag{25a,b}
$$

$$
\mathrm{SP}(\circ)=\left[\sinp(\circ,0),\sinp(\circ,0),\cdots,\sinp(\circ,z-1)\right], \tag{25c}
$$

其中 $\circ$ 表示输入 $t$ 或 $q$，$i$ 表示维度索引。具体地，$t$ 与 $q$ 先由 $\mathrm{SP}(\circ)$ 编码为高维嵌入向量，再送入基于 MLP 的网络。$\mathcal E_x(x|\Theta)$ 设计为基于 MLP 的网络。随后这些条件嵌入经逐元素加法 $\oplus$ 融合：

$$
\mathbf f^{\mathrm{fuse}}=\mathcal E_x(x|\Theta)\oplus\mathcal E_q(\mathrm{SP}(q)|\Theta)\oplus\mathcal E_t(\mathrm{SP}(t)|\Theta). \tag{26}
$$

融合后的条件信息 $\mathbf f^{\mathrm{fuse}}$ 与信道 $\tilde{\mathbf H}_{x,q}$ 一起在若干 Transformer 块中处理。为实现细粒度信道信息捕捉并降低 P2CGNet 的计算复杂度，对 $\tilde{\mathbf H}_{x,q}$ 做块化（patchify）操作：把 $\tilde{\mathbf H}_{x,q}$ 块化为共 $N_{\mathrm{sc}}$ 个子信道块 $\{\tilde{\mathbf H}_{x,q,i}\}_{i=1}^{N_{\mathrm{sc}}}$，每块尺寸 $H\times W$，其中 $H\le N_r$、$W\le N_t$。这样所有子信道都可用自注意力（SA）机制独立处理，便于聚焦局部细粒度信道信息而不忽略全局信息。与在整幅信道上处理相比，SA 的主要计算复杂度从 $\mathcal O(N_t^2N_r^2d)$ 降至 $\mathcal O(N_{\mathrm{sc}}^2d)$，其中一般有 $N_{\mathrm{sc}}\ll N_tN_r$，$d$ 表示 SA 的潜特征维度。

随后若干基于 Transformer 的块用于处理 $\{\tilde{\mathbf H}_{x,q,i}\}_{i=1}^{N_{\mathrm{sc}}}$ 与 $\mathbf f^{\mathrm{fuse}}$。受 UNet [35] 中自适应归一化层（AdNL）与残差连接优越性能的启发，Transformer 块中采用这些机制以提升 P2CGNet 的生成质量。具体地，AdNL 的系数由 $\mathbf f^{\mathrm{fuse}}$ 送入基于 MLP 的"缩放"与"平移"权重生成器 $\mathcal G_{\mathrm{Scale,Shift}}(\cdot|\Theta)$ 得到：

$$
\Upsilon\leftarrow\mathcal G_{\mathrm{Scale,Shift}}\left(\mathbf f^{\mathrm{fuse}}|\Theta\right), \tag{27}
$$

其中 $\Upsilon=[\upsilon_{\mathrm{scale}}^1,\upsilon_{\mathrm{shift}}^1,\upsilon_{\mathrm{scale}}^2,\upsilon_{\mathrm{scale}}^3,\upsilon_{\mathrm{shift}}^2,\upsilon_{\mathrm{scale}}^4]$。在 Transformer 块架构内，每个子信道 $\tilde{\mathbf H}_{x,q,i}$（$i=1,\cdots,N_{\mathrm{sc}}$）以 AdNL 系数为条件顺序处理：

$$
\mathbf f^{\mathrm{sc}}=\mathcal E^{\mathrm{sc}}\left(\tilde{\mathbf H}_{x,q,i}|\Theta\right)\oplus\mathcal E_{\mathrm{pos}}^{\mathrm{sc}}(i|\Theta), \tag{28a}
$$

$$
\mathbf f^{\mathrm{sc,scale,shift}}=\mathrm{LN}\left(\mathbf f^{\mathrm{sc}}\right)\odot\left(1+\upsilon_{\mathrm{scale}}^1\right)\oplus\upsilon_{\mathrm{shift}}^1, \tag{28b}
$$

$$
\mathbf f^{\prime\mathrm{sc}}=\upsilon_{\mathrm{scale}}^2\odot\mathrm{MHSA}\left(\mathbf f^{\mathrm{sc,scale,shift}}\right)\oplus\mathbf f^{\mathrm{sc}}, \tag{28c}
$$

$$
\mathbf f^{\prime\mathrm{sc,scale,shift}}=\mathrm{LN}\left(\mathbf f^{\prime\mathrm{sc}}\right)\odot\left(1+\upsilon_{\mathrm{scale}}^3\right)\oplus\upsilon_{\mathrm{shift}}^2, \tag{28d}
$$

$$
\mathbf f^{\prime\prime\mathrm{sc}}=\upsilon_{\mathrm{scale}}^4\odot\mathrm{MLP}\left(\mathbf f^{\prime\mathrm{sc,scale,shift}}\right)\oplus\mathbf f^{\prime\mathrm{sc}}, \tag{28e}
$$

其中基于卷积网络的 $\mathcal E^{\mathrm{sc}}(\cdot|\Theta)$ 与基于正弦位置编码的 $\mathcal E_{\mathrm{pos}}^{\mathrm{sc}}(\cdot|\Theta)$ 分别表示子信道及其逻辑位置索引的编码器；$\odot$ 表示 Hadamard 积；$\mathrm{LN}(\cdot)$、$\mathrm{MHSA}(\cdot)$ 与 $\mathrm{MLP}(\cdot)$ 分别表示层归一化、多头自注意力与基于 MLP 的神经网络算子，其具体设计见 [35]–[37]。最后，所有经多个 Transformer 块处理的子信道结果 $\{\tilde{\mathbf H}_{x,q}^{(i)}\}_{i=1}^{N_{\mathrm{sc}}}$ 被反块化（unpatchify），得到 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,x,q,t)$ 与 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 的输出。按 (21) 即得 $\tilde{\mathbf H}_{x,q}$ 在第 $t$ 个去噪步的得分 $\mathbf G_{x,q}^t$。

训练过程中，给定 $\mathbf H^{\mathrm{samp}}$，先对所有数据样本做 DFT 得到波束空间数据集 $\tilde{\mathbf H}^{\mathrm{samp}}=\{\tilde{\mathbf H}_{x,q},x,q\}$。随后每个训练轮从 $\tilde{\mathbf H}^{\mathrm{samp}}$ 随机采样一批样本 $\mathcal B=\{\tilde{\mathbf H}_{x,q}^{(b)},x^{(b)},q^{(b)}\}_{b=1}^{B}$（批大小 $B$），并对每个样本的条件信息做概率掩码。完整训练流程见算法 1；相应地，推断过程遵循 CF 引导 cDDIM，见算法 2。

> **算法 1　P2CGNet 训练过程**
> 1: **Require：** 预设 $\{\bar\nu_t\}_{t=1}^{T}$、训练数据集 $\mathbf H^{\mathrm{samp}}$
> 2: **Inputs：** 批大小 $B$、条件训练概率阈值 $p_{\mathrm{th}}>0$、学习率 $\varsigma_{\mathrm{P2CGNet}}>0$
> 3: 按式 (9) 把 $\mathbf H^{\mathrm{samp}}$ 变换为 $\tilde{\mathbf H}^{\mathrm{samp}}$
> 4: **for** 每个训练轮 **do**
> 5: 　从 $\tilde{\mathbf H}^{\mathrm{samp}}$ 随机采样一批样本 $\mathcal B$
> 6: 　对每个 $\tilde{\mathbf H}_{x,q}\in\mathcal B$ 采样 $t\sim\mathcal T$ 与 $\mathcal N_t\sim\mathcal N(\mathbf 0,\mathbf I)$，再按式 (12) 得到扰动样本
> 7: 　采样 $\hat p_\epsilon\sim\mathrm{Uniform}([0,1))$，令 $x,q\leftarrow x\cdot\mathbb 1_{\hat p_\epsilon>p_{\mathrm{th}}},q\cdot\mathbb 1_{\hat p_\epsilon>p_{\mathrm{th}}}$，按式 (24) 计算扩散得分
> 8: 　按式 (15) 计算得分匹配损失，并以 $\varsigma_{\mathrm{P2CGNet}}$ 做随机梯度下降
> 9: **end for**
> 10: **Output：** 优化后的 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,\cdot)$

> **算法 2　P2CGNet 推断过程**
> 1: **Require：** 预设步子序列 $\{\varrho_s\}_{s=1}^{S}$、扩散噪声水平 $\{\bar\nu_{\varrho_s}\}_{s=1}^{S}$、优化后的 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,\cdot)$
> 2: **Inputs：** 引导缩放因子 $\lambda$、信道条件 $x$ 与 $q$
> 3: 初始化 $\tilde{\mathbf H}_{x,q}^{\varrho_S}\sim\mathcal N(\mathbf 0,\mathbf I)$
> 4: **for** $s=S$ 到 1 **do**
> 5: 　用优化的 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,\cdot)$ 计算扩散得分 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^{\varrho_s},x,q,\varrho_s)$ 与 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^{\varrho_s},\varrho_s)$
> 6: 　按式 (21) 得 CF 引导得分 $\mathbf G_{x,q}^{\varrho_s}$
> 7: 　按式 (23) 由 $\tilde{\mathbf H}_{x,q}^{\varrho_s}$ 采样 $\tilde{\mathbf H}_{x,q}^{\varrho_{s-1}}$
> 8: **end for**
> 9: 用 IDFT 把 $\tilde{\mathbf H}_{x,q}^0$ 变换为 $\mathbf H_{x,q}^0$
> 10: **Output：** 推断得到的 $\mathbf H_{x,q}^0$

> **图 2（原文 Fig. 2）：** P2CGNet 架构示意，基于 CF 引导 cDDIM 与 Transformer 骨干设计。

## IV. 下游任务：联合 RBGA 与 BA 优化

本节借助 P2CGNet 为该下游任务设计一种基于轻量 PB 测量的联合 RBGA 与 BA 算法。下面先介绍实现框架，再给出求解该问题的方案 R2BA，最后介绍 P2CGNet 如何增强 R2BA。

### A. 实现框架

宽 PB 增益测量隐含了信道质量与周围环境信息，这为以轻量方式促成资源分配与波束管理提供了途径 [31]。令 $\mathbf F_t^{\mathrm{pb}}\in\mathbb C^{N_t^{\mathrm{pb}}\times N_t}$ 与 $\mathbf F_r^{\mathrm{pb}}\in\mathbb C^{N_r^{\mathrm{pb}}\times N_r}$ 分别为基于 DFT 码本的发送与接收 PB 矩阵。BS 用 $\mathbf F_t^{\mathrm{pb}}$ 中的 $N_t^{\mathrm{pb}}$ 个发送 PB 周期性广播探测符号 $s^{\mathrm{pb}}$，UE 则用 $\mathbf F_r^{\mathrm{pb}}$ 中的 $N_r^{\mathrm{pb}}$ 个接收感知波束测量接收信号功率。总波束扫描开销恒定，且由 $\mathbf F_t^{\mathrm{pb}}$ 与 $\mathbf F_r^{\mathrm{pb}}$ 的规模决定，因为多个 UE 可在共享时间与频率资源上测量 PB 增益。相应地，对任意 UE $u\in\mathcal N_{\mathrm u}$，第 $q$ 个 RBG 上所有探测与感知波束组合对应的复合测量信号功率 $\mathbf Y\in\mathbb C^{Q\times N_r^{\mathrm{pb}}\times N_t^{\mathrm{pb}}}$ 可写为

$$
\mathbf Y_{u,q}=\sqrt{p^{\mathrm{pb}}}\left(\mathbf F_r^{\mathrm{pb}}\right)^H\mathbf H_{u,q}\mathbf F_t^{\mathrm{pb}}\mathrm{diag}\left(\mathbf s^{\mathrm{pb}}\right)+\left(\mathbf F_r^{\mathrm{pb}}\right)^H\mathbf N^{\mathrm{pb}}, \tag{29}
$$

其中 $p^{\mathrm{pb}}$ 表示探测发送功率，$\mathbf s^{\mathrm{pb}}\in\mathbb C^{N_t^{\mathrm{pb}}\times1}$ 是发送探测符号向量，$\mathrm{diag}(\cdot)$ 表示向量对角化操作，$\mathbf N^{\mathrm{pb}}\in\mathbb C^{N_r^{\mathrm{pb}}\times N_t^{\mathrm{pb}}}$ 表示 AWGN 测量噪声矩阵，其每个元素的噪声功率为 $\sigma_{\mathrm{pb}}^2$。

为降低 $\mathbf Y$ 的反馈开销，考虑 $N_r^{\mathrm{pb}}=N_t^{\mathrm{pb}}=N^{\mathrm{pb}}$ 的特殊情形。波束扫描后，第 $u$ 个 UE 用如下预设测量

$$
\mathbf Z_{u,q}=\mathrm{vec}\left(\mathrm{diag}\left(|\mathbf Y_{u,q}|\odot|\mathbf Y_{u,q}|\right)\right)\in\mathbb R^{N^{\mathrm{pb}}\times1}, \tag{30}
$$

（$q\in\mathcal Q$，$\mathrm{vec}(\cdot)$ 表示向量化）以特定设计的波束合成器获得接收波束。随后所有 UE 的测量张量 $\mathbf Z\in\mathbb R^{N_{\mathrm u}\times Q\times N^{\mathrm{pb}}}$ 被反馈给 BS，用于无线资源管理与发送波束合成。

与 [31] 的目标不同，P0 是联合优化问题且为 NP 难；下一小节将利用测量 $\mathbf Z$ 为其提出求解方案。

### B. R2BA 网络架构

联合 RBGA 与 BA 优化（称为 R2BA）的整体框图见图 3。给定 PB 增益张量 $\mathbf Z$，BS 用基于 GNN 的 RBGA 模块为所有激活 UE 分配 RBG。对共享同一 RBG 的 UE，为理解 UE 间干扰与 RBG 竞争，RBGA 模块中引入两个 UE 级干扰与 RBG 级竞争感知 GNN 模块。具体地，对 UE 级干扰感知模块，考虑第 $u$ 个 UE 由第 $q$ 个 RBG 服务，从 $u'\in\mathcal N_{\mathrm u}\backslash u$ 感知到的潜在干扰信息 $\tilde{\mathbf z}_{u'\to u,q}^{\mathrm{inter}}\in\mathbb R^{f_1\times1}$ 可写为

$$
\tilde{\mathbf z}_{u'\to u,q}^{\mathrm{inter}}=\frac{1}{N_{\mathrm u}-1}\sum_{u'\in\mathcal N_{\mathrm u}\backslash u}\mathcal E_{\mathrm{pb}}\left(\mathbf Z_{u',q}|\Theta\right), \tag{31}
$$

其中 $\mathcal E_{\mathrm{pb}}(\cdot|\Theta)\in\mathbb R^{f_1\times1}$ 表示基于 MLP 的 PB 增益编码器，$\Theta$ 是可学习参数。随后 $\tilde{\mathbf z}_{u'\to u,q}^{\mathrm{inter}}$ 与 $\mathbf Z_{u,q}$ 级联后送入 RBG 级竞争感知模块，即

$$
\tilde{\mathbf z}_{u,q'\to q}^{\mathrm{cont}}=\frac{1}{Q-1}\sum_{q'\in\mathcal Q\backslash q}\mathcal E_{\mathrm{inter}}\left(\tilde{\mathbf z}_{u'\to u,q'}^{\mathrm{inter}}\circledast\mathbf Z_{u,q'}|\Theta\right), \tag{32}
$$

得到第 $u$ 个 UE 在各 RBG 上的竞争信息 $\tilde{\mathbf z}_{u,q'\to q}^{\mathrm{cont}}$，其中 $\mathcal E_{\mathrm{inter}}(\cdot|\Theta)\in\mathbb R^{f_2\times1}$ 表示干扰信息的基于 MLP 的编码器，$\circledast$ 表示拼接操作。随后 $\tilde{\mathbf z}_{u'\to u,q}^{\mathrm{inter}}$ 与 $\tilde{\mathbf z}_{u,q'\to q}^{\mathrm{cont}}$ 拼接并送入基于 MLP 的 RBGA 生成器 $\mathcal E^{\mathrm{RBA}}(\cdot|\Theta)\in\mathbb R$，得到第 $u$ 个 UE 在第 $q$ 个 RBG 上的 RBGA 概率：

$$
\mu_{u,q}=\mathrm{Sigmoid}\left(\mathcal E^{\mathrm{RBA}}\left(\tilde{\mathbf z}_{u'\to u,q}^{\mathrm{inter}}\circledast\tilde{\mathbf z}_{u,q'\to q}^{\mathrm{cont}}|\Theta\right)\right), \tag{33}
$$

其中 $\mathrm{Sigmoid}(x)=\frac{1}{1+e^{-x}}\in(0,1)\triangleq\mathcal R_{\mathrm{Sig}}$。

转到发送与接收波束合成：对第 $u$ 个 UE，其所有 RBG 上的 RBGA 概率向量为

$$
\boldsymbol\mu_u=[\mu_{u,1},\cdots,\mu_{u,Q}]^T\in\mathcal R_{\mathrm{Sig}}^{Q\times1}. \tag{34}
$$

结合 PB 张量 $\mathbf Z_u$ 与 RBGA 结果 $\boldsymbol\mu_u$，激活的 PB 增益为 $\mathbf Z_u'=\boldsymbol\mu_u\mathbf Z_u$（$\forall u\in\mathcal N_{\mathrm u}$）。由于 UE 间干扰与 RBG 竞争已由 RBGA 模块处理，对第 $u$ 个 UE，发送与接收波束可由简单的基于 MLP 的网络合成而无需再次考虑这些因素，即

$$
\mathbf W_u'=\mathcal E_w^{\mathrm{Re}}\left(\mathbf Z_u'|\Theta\right)+\mathrm j\mathcal E_w^{\mathrm{Im}}\left(\mathbf Z_u'|\Theta\right), \tag{35a}
$$

$$
\mathbf w_u=\frac{\mathbf w_u'}{|\mathbf w_u'|}\sqrt{N_t},\qquad \mathbf w_u'=\frac{\sum_{q\in\mathcal Q}\mu_{u,q}\mathbf W_{u,q}'}{\sum_{q\in\mathcal Q}\mu_{u,q}}, \tag{35b}
$$

$$
\mathbf V_u'=\mathcal E_v^{\mathrm{Re}}\left(\mathbf Z_u'|\Theta\right)+\mathrm j\mathcal E_v^{\mathrm{Im}}\left(\mathbf Z_u'|\Theta\right), \tag{35c}
$$

$$
\mathbf v_u=\frac{\mathbf v_u'}{|\mathbf v_u'|}\sqrt{N_r},\qquad \mathbf v_u'=\frac{\sum_{q\in\mathcal Q}\mu_{u,q}\mathbf V_{u,q}'}{\sum_{q\in\mathcal Q}\mu_{u,q}}, \tag{35d}
$$

其中 $\mathcal E_\cdot^{\mathrm{Re}}(\cdot|\Theta)$ 与 $\mathcal E_\cdot^{\mathrm{Im}}(\cdot|\Theta)$ 分别表示 $\mathbf w$ 与 $\mathbf v$ 的实部与虚部合成器。式 (35b) 与 (35d) 对平均后的波束赋形向量做单位功率、恒模操作。至此 R2BA 的架构设计完成，其优化方法将在下一小节介绍。

> **图 3（原文 Fig. 3）：** R2BA 框图：联合 RBGA 与 BA 优化模型。

### C. 由 P2CGNet 赋能的信道 DT 优化 R2BA

仅用稀疏历史 CSI 测量优化 R2BA 很困难：不足的 CSI 观测可能无法刻画当前无线环境，而密集 CSI 获取又会带来不可忽略的无线资源开销。为此，信道 DT 通过集成稀疏真实测量同步、信道 DT 校准、意图导向虚拟信道生成、R2BA 模型优化与部署 R2BA 更新，构建了闭环优化框架，如图 4 所示。具体地，真实网络周期性采集 UE 上报的稀疏 CSI 测量与位置信息，这些测量被上传到信道 DT，用于把虚拟无线环境与当前 UE 移动模式及信道条件同步。基于同步后的低密度信道数据集 $\mathbf H^{\mathrm{samp}}$，训练良好的 P2CGNet 作为信道生成器，推断 UE 移动轨迹上欠采样或预测位置 $\Omega^{\mathrm{intent}}\subset\Omega$ 处的信道。生成的意图导向信道构成 $\mathbf H^{\mathrm{intent}}$，与测量样本合并为增广信道数据集 $\mathbf H^{\mathrm{aug}}\triangleq\mathbf H^{\mathrm{samp}}\cup\mathbf H^{\mathrm{intent}}$。与 $\mathbf H^{\mathrm{intent}}$ 关联的 PB 增益随后按式 (29) 合成。用来自真实测量与 DT 生成数据的预设 $\mathbf Z$，R2BA 模型在信道 DT 中通过最大化 (8a) 训练或微调。经 DT 优化的 R2BA 模型随后反馈给真实网络以支持 RBGA 与 BA。这样，信道 DT 周期性减小虚拟信道表示与实测无线环境之间的失配，并在稀疏 CSI 获取下为稳健 R2BA 优化提供自适应闭环机制。

对 P0 的约束，(8b) 与 (8c) 由 (35b)、(35d) 与 (33) 的 R2BA 设计天然满足。为满足 (8d)，我们采用基于动态惩罚权重的交替优化方法：设第 $e$ 轮更新惩罚权重 $w^{(e)}$，R2BA 模型以学习率 $\varsigma_{\mathrm{R2BA}}>0$ 优化以最大化

$$
\max_{\{\mu_{u,q},\mathbf w_u,\mathbf v_u\}}\mathbb E_{u\sim\mathcal N_{\mathrm u},\mathbf H\sim\mathbf H^{\mathrm{aug}},\mathbf Z}\left[U_\alpha(R_u)-w^{(e)}\Delta_u^{\min}\right], \tag{36}
$$

其中 $\Delta_u^{\min}=[\min(R_0-R_u,0)]^2$。反之，给定第 $e$ 轮 R2BA 模型优化后的 $\{\mu_{u,q}^{(e)},\mathbf w_u^{(e)},\mathbf v_u^{(e)}\}$，$w$ 按 UE 速率需求违反程度 $\Delta_u^{\max}=[\max(R_0-R_u,0)]^2$ 调整，即

$$
w^{(e+1)}\leftarrow w^{(e)}+\varsigma_w\cdot\mathbb E_{u\sim\mathcal N_{\mathrm u},\mathbf H\sim\mathbf H^{\mathrm{aug}},\mathbf Z}\left[\Delta_u^{\max}\right], \tag{37}
$$

其中 $\varsigma_w>0$ 表示更新 $w$ 的学习率。该两阶段交替优化过程迭代进行，直到目标 (8a) 达到收敛状态。

> **图 4（原文 Fig. 4）：** 信道 DT 如何赋能 R2BA 的示意。

## V. 数值结果

本节通过数值仿真对 P2CGNet 及其增强的下游任务做全面性能评估。先建立仿真框架（含信道传播参数与系统配置），再验证 P2CGNet 的信道生成能力，最后对联合 RBGA 与 BA 优化方案做端到端性能评估。

### A. 仿真设置

仿真环境见图 5。如图 5(a) 所示，设置若干建筑物块以建模频率选择性衰落环境；MIMO-OFDM 信道由开源库 Sionna [38], [39] 实现的射线追踪技术生成，该库支持下一代无线物理层研究。图 5(b) 给出 P2CGNet 与下游任务的仿真部署，所有 UE 位置在各仿真区域内均匀采样。除另行说明，每个 PRB 占用 $k_0=12$ 个子载波、每个子载波 60 kHz；共 135 个 PRB 组织为 $Q=27$ 个 RBG，每个 RBG 含 $q_0=5$ 个 PRB。其他仿真配置见表 I。仿真在第 13 代 Intel(R) Core(TM) i7-13700K 与 NVIDIA GeForce RTX 4080 SUPER 服务器上进行。

> **图 5（原文 Fig. 5）：** 仿真环境示意。子图 (b) 中外层黄色与内层红色虚线框分别表示信道生成与下游任务评估区域。

> **表 I（原文 Table I）：** 仿真参数。

| 参数 | 取值 |
|---|---|
| 环境区域（$\lvert\Omega^{\mathrm{samp}}\rvert$） | 140 m × 100 m |
| 采样位置数 | 1000–5000 |
| 下游测试区域 | 70 m × 20 m |
| 带宽 | 100 MHz |
| 载波频率 | 2.4/3.5/28/58 GHz |
| 天线间距 | 0.5 m |
| BS 天线 $N_t$ | 16：16×1 ULA / 4×4 UPA；32：32×1 ULA / 4×8 UPA；64：64×1 ULA / 8×8 UPA；128：128×1 ULA / 8×16 UPA |
| UE 天线 $N_r$ | 2：2×1 ULA；4：4×1 ULA / 2×2 UPA；8：8×1 ULA / 2×4 UPA |

### B. P2CGNet 评估

我们从定量、可视化与推理速度三方面评估不同信道生成策略。考虑如下基线：

- **IDW-inter.：** 经典反距离加权（IDW）插值方法 [40]，用 $\tilde{\mathbf H}^{\mathrm{samp}}$ 推断测试样本；采用前 5 个加权邻居，实测效果最佳。
- **RBF-inter.：** 基于径向基函数（RBF）的插值算法 [41]，用 $\tilde{\mathbf H}^{\mathrm{samp}}$ 的 12 个最近邻与线性核函数推断测试样本。
- **Ray-tracing：** 典型的基于射线追踪的 MIMO-OFDM 信道合成方法，仅在可获得实测场景三维模型时执行。
- **Chan-cGAN：** 基于条件 GAN（cGAN）的生成信道模型，UNet 骨干，改配自 [24]。
- **Chan-cDDIM：** 把 P2CGNet 的扩散得分估计替换为 UNet，改配自 [26]；以 $p_{\mathrm{th}}=0.1$、$T=256$ 训练。
- **P2CGNet：** 本文方法，采用 $N=2$ 个 Transformer 块、子信道块尺寸 $2\times2$，以 $p_{\mathrm{th}}=0.1$、$T=256$ 训练。

定量评估采用以 dB 为单位的归一化 MSE（NMSE）作为度量 $\mathcal D(\cdot)$，定义为

$$
\mathrm{NMSE}=10\log_{10}\left\{\mathbb E_{x\sim\Omega,q\sim\mathcal Q}\left[\frac{\left\|\mathbf H_{x,q}'-\mathbf H_{x,q}\right\|_2^2}{\left\|\mathbf H_{x,q}\right\|_2^2}\right]\right\}, \tag{38}
$$

其中 $\mathbf H_{x,q}'$ 由各算法生成。Chan-cDDIM 与 P2CGNet 以 $\varsigma=1\times10^{-4}$、$B=256$ 训练。

图 6 首先给出 P2CGNet 在 1000 个位置采样数据上的训练收敛过程：可见在不同天线架构下 P2CGNet 都能在 7000 轮内稳定收敛。图 7 给出 Chan-cDDIM 与 P2CGNet 在不同去噪步数下的 NMSE 与推理时延。尽管 Chan-cDDIM 采用 DDIM 采样，其 UNet 骨干无法对高维信道、位置与频偏的复杂联合分布建模，导致小 $S$ 时噪声估计不稳定；相反 P2CGNet 的 NMSE 随 $S$ 减小而改善，因为更少去噪步减少了累积的噪声估计误差。除另行说明，Chan-cDDIM 与 P2CGNet 的去噪步数分别设为 $S=256$ 与 $S=3$。图 8 给出 CF 引导缩放 $\lambda$、骨干架构与块化尺寸的消融研究：P2CGNet 在 $\lambda=0.8$、$2\times2$ 块尺寸下取得最低 NMSE，表明适度 CF 引导相对纯条件情形（$\lambda=1$）可改善条件信道生成，而引导过弱或过强都会损害生成稳定性。与 Chan-cDDIM 相比，P2CGNet 在最佳工作点取得约 1.4 dB 更低的 NMSE，验证了 Transformer 骨干对空间–频率依赖关系建模的有效性；$2\times2$ 块尺寸进一步通过平衡 token 长度与局部信道结构保持取得最佳性能，证实 CF 引导、Transformer 建模与适当块化的联合收益。

> **图 6（原文 Fig. 6）：** P2CGNet 按轮次的训练收敛曲线。

> **图 7（原文 Fig. 7）：** Chan-cDDIM 与 P2CGNet 在不同去噪步数 $S$ 下的 NMSE 与推理时延比较。

> **图 8（原文 Fig. 8）：** 在 1000 个训练样本与 $4\times32$ 天线构型下，NMSE 随 CF 引导缩放、块化尺寸与骨干的变化。

图 9 比较不同采样位置数、天线构型与载波频率下各信道生成方法。IDW-inter 与 RBF-inter 性能最差，而 P2CGNet 始终取得更优 NMSE 与更高的训练数据效率。随位置采样密度增加，所有方法 NMSE 下降；在 1000 个固定采样位置下，其 NMSE 随载波频率升高保持稳定。如图 9 中间两幅子图所示，随天线规模增大，P2CGNet 在均匀线阵（ULA）与均匀面阵（UPA）两种天线构型下都始终优于其他算法。P2CGNet 的 NMSE 随 ULA 规模增大而变差，因为 0.5 m 天线间距削弱了天线间相关性，使以 BS 中心为基准的生成在捕捉天线相关信道变化时效果下降；相反 Chan-cDDIM 随阵列规模增大出现 NMSE 崩溃。

为直观比较各种信道合成架构，图 10 给出用 5000 个训练样本得到的三个随机采样推断结果。无论天线域信道幅值还是一致性，P2CGNet 都优于 Chan-cGAN 与 Chan-cDDIM。Chan-cGAN 虽取得可比 NMSE，但信道一致性较差，因此后文不再把 Chan-cGAN 作为基线。此外，图 11(a) 评估 P2CGNet 与 Chan-cDDIM 在其余 108 个 PRB 上的 RBG 级插值性能：P2CGNet 的 NMSE 接近其在训练 RBG 上的水平，而 Chan-cDDIM 性能显著退化，说明 P2CGNet 插值能力更强。图 11(b) 评估 Chan-cDDIM 与 P2CGNet 对定位误差的鲁棒性：随误差增大 NMSE 性能退化，但 P2CGNet 在 2 m 以内误差下仍保持可接受性能。

> **图 9（原文 Fig. 9）：** 不同算法在变化采样位置数、天线构型与载波频率下的 NMSE 比较。

> **图 10（原文 Fig. 10）：** 3 个随机选取的合成/真实信道示例可视化。

> **图 11（原文 Fig. 11）：** (a) RBG 信道插值："XX: Trained" 表示在训练 RBG 索引上的 NMSE，"XX: Inter." 表示由 "XX" 插值得到；(b) 定位误差对 NMSE 的影响：Chan-cDDIM 与 P2CGNet。

表 II 表明 P2CGNet 的复杂度始终低于 Chan-cDDIM，且系统规模越大效率优势越明显。在最大 8×128 情形下，P2CGNet 把 FLOPs、训练时间与训练 GPU 显存占用分别降低 58.9%、78.0% 与 83.3%。尽管推理时 CPU 内存略高，但该开销可忽略。这些结果表明 P2CGNet 具有更好的可扩展性与训练效率，对大规模信道估计更实用。此外，表 III 给出每信道样本的推理时延：随天线规模增大，Chan-cDDIM 推理时延急剧上升，Ray-tracing 也显著增加；而 P2CGNet 精心设计的架构使其推理时延与 IDW-inter. 方法处于同一量级，即近实时的 1～3 ms。

> **表 II（原文 Table II）：** Chan-cDDIM 与 P2CGNet 的复杂度分析。

| 天线构型 $(N_r,N_t)$ | P2CGNet FLOPs | 训练时间 $T_{\mathrm{tr}}$ | 训练显存 $M_{\mathrm{tr}}$ | 推理内存 $M_{\mathrm{te}}$ | Chan-cDDIM FLOPs | 训练时间 $T_{\mathrm{tr}}$ | 训练显存 $M_{\mathrm{tr}}$ | 推理内存 $M_{\mathrm{te}}$ |
|---|---|---|---|---|---|---|---|---|
| 4×32 | 51.8 M | 1.75 h | 0.9 G | 0.3 G | 124.6 M | 1.59 h | 1.2 G | 0.2 G |
| 4×64 | 102.4 M | 1.94 h | 1.2 G | 0.3 G | 249.1 M | 3.88 h | 2.5 G | 0.2 G |
| 8×128 | 409.6 M | 2.14 h | 1.3 G | 0.3 G | 996.1 M | 9.72 h | 7.8 G | 0.2 G |

（注：$T_{\mathrm{tr}}$ 表示以 1000 个位置采样数据、批大小 $B=256$ 训练 7000 轮的总训练小时数；$M_{\mathrm{tr}}$ 表示训练期间显存占用；$M_{\mathrm{te}}$ 表示推理期间 CPU 内存占用。）

> **表 III（原文 Table III）：** 推理时延比较。

| 算法 | 16×2 | 32×4 | 64×4 | 128×8 |
|---|---|---|---|---|
| IDW | 0.43 ms | 0.50 ms | 0.59 ms | 1.21 ms |
| RBF | 0.63 ms | 1.36 ms | 2.38 ms | 7.97 ms |
| Ray-tracing | 7.40 ms | 16.58 ms | 30.87 ms | 99.63 ms |
| Chan-cGAN | 0.13 ms | 0.14 ms | 0.17 ms | 0.19 ms |
| Chan-cDDIM | 95.76 ms | 178.67 ms | 193.09 ms | 482.27 ms |
| P2CGNet | 0.80 ms | 1.03 ms | 1.42 ms | 2.56 ms |

（注：Chan-cDDIM 与 P2CGNet 的扩散推理步 $S$ 分别设为 256 与 3。时延为 100 个样本的平均值；Ray-tracing（情形 2）包含 $\mathbf H$ 的计算。）

### C. 场景泛化评估

我们进一步考虑四个更真实的场景，环境与系统设置见图 12 与表 IV。四个场景的 BS 高度分别为 50、50、10.09、1.42 m；室外与室内场景分别测量了 983 与 1200 个位置的 CSI。Ray-tracing 方法仅在真实室外与室内场景执行，其中相应三维模型利用 OpenStreetMap 与三维创作软件 Blender 构建。鉴于实测 CSI 中存在载波相位与采样时间偏移，以及未知的 UE 朝向等难以校准的因素，真实场景的 NMSE 在天线域幅值上计算。如图 13 所示，总体而言 P2CGNet 在 NMSE 性能与训练数据效率上优于其他基线。对 'etoile' 与 'munich' 等大面积场景，需要更高的位置采样密度才能更好地学习位置到信道的映射。在 'Outdoor' 与 'Indoor' 等真实场景中，尽管测量区域相对较小，除 P2CGNet 外的所有算法空间信道生成能力都有限；这可能是测量不确定性削弱了信道空间相关性、使其难以利用所致。此外，在相对精确的三维环境模型下，Ray-tracing 在 'Indoor' 场景取得与 Chan-cGAN 相当的性能；对 'Outdoor' 场景，仅含建筑的三维模型不足以得到真实射线追踪信道，这凸显了在缺乏精确环境模型时数据驱动方法的优势。

> **图 12（原文 Fig. 12）：** 四个真实场景示意。场景 (a)(b) 为 [39] 提供的两个真实射线追踪三维模型（配置了合理材料等信息）；场景 (c)(d) 为两个实测环境，其 CSI 数据分别在 [42] 与 [43] 开源。

> **表 IV（原文 Table IV）：** 系统配置参数。

| 场景 | 带宽 | 载频 | BS 天线 $N_t$ | UE 天线 $N_r$ |
|---|---|---|---|---|
| Etoile | 100 MHz | 28 GHz | 32，32×1 ULA | 4，4×1 ULA |
| Munich | 100 MHz | 28 GHz | 32，32×1 ULA | 4，4×1 ULA |
| Outdoor | 50 MHz | 1.272 GHz | 48，三个 2×8 UPA | 1 |
| Indoor | 50 MHz | 3.438 GHz | 32，4×8 UPA | 1 |

> **图 13（原文 Fig. 13）：** 四个真实场景上的性能评估。

### D. 下游任务评估

本小节评估由 P2CGNet 增强的 R2BA 模型在 MU MIMO-OFDM 通信系统 RBGA 与 BA 联合优化中的表现。比较如下基线：

- **WMMSE：** 计算复杂的全 CSI 迭代加权最小均方误差（WMMSE）基准，以比例公平效用、最小速率惩罚与贪心 RBG 分配启发式联合优化发送/接收波束赋形，迭代至效用收敛。
- **MBA-FRB：** 仅做 BA、不做 RBGA 的基于 MLP 的波束合成器方法。
- **MBA-MRB：** 基于 MLP 的 BA 与 RBGA。
- **R2BA：** 由两个基于 MLP 的波束合成器做 BA，以及基于 GNN 的 RBGA 生成器组成。
- **R2BA-Syn.-0、R2BA-Syn.-1、R2BA-Syn.-2：** 分别用 CDL-C 模型、Chan-cDDIM 与 P2CGNet 合成的样本增强的 R2BA 模型。

考虑 $N_{\mathrm u}=15$ 个激活 UE、$Q=27$ 个 RBG 的 MU-MIMO 通信，基本速率需求设为 $R_0=5$ Mbps。对基于学习的方法，所有模型以批大小 $B=100$ 训练至收敛。具体地，学习率 $\varsigma_{\mathrm{R2BA}}$ 设为 0.0001，$\alpha$-效用函数取 $\alpha=1$，不同方法的最佳 $\varsigma_w$ 从 $\{0.1,0.01,0.001\}$ 中选取，初始惩罚权重 $w_0=1$。

我们先评估不同 PB 对数下各方法的性能，因为 PB 对数直接影响所捕获的信道质量信息。$\mathbf H^{\mathrm{intent}}$ 按上报的 1000 个位置随机诱导的位置合成。如图 14 所示，WMMSE 在和用户速率（SR）与速率违反样本方面表现最差，因为其设计采用贪心方式降低 UE 间干扰。对其他算法，SR 随 PB 对数增加而提升，但 PB 对数超过 14 后额外增益变小。此外，当 PB 对数低于 16 时 MBA-MRB 的 SR 低于 MBA-FRB，因为基于 MLP 的 RBGA 难以从低角分辨率探测波束测量中捕捉共享同一 RBG 的 UE 间潜在干扰信息。R2BA 类算法通过从 PB 测量推断 UE 间干扰与 RBG 竞争，SR 优于其他方法。

对合成增强的 R2BA，如图 14 所示，R2BA-Syn.-2 在不同 PB 对数下 SR 均优于 R2BA-Syn.-0 与 R2BA-Syn.-1。具体地，相对 R2BA，R2BA-Syn.-2 在所有 PB 对数上取得平均 10.08% 的相对 SR 增益（约 900 Mbps），而 R2BA-Syn.-1 仅为 3.26%（约 315 Mbps）。尽管实验设置具有有利条件（如高带宽、靠近 BS），R2CGNet 取得的 10.08% 平均增益仍稳健地证明了合成信道数据对系统优化的实际价值与有效性。R2BA-Syn.-0 除 WMMSE 外劣于多数基线，因为 CDL-C 是宏观场景通用模型而非场景特定模型。我们通过频率到延迟、阵列到角度的变换从信道矩阵导出 PDP、AoA 与 AoD；如图 15 所示，CDL-C 生成的信道分布与真实分布差异显著，从而误导 R2BA 训练。相反，Chan-cDDIM 与 P2CGNet 生成的 PDP、AoA 与 AoD 分布在经验上更接近真实分布；不过即便 P2CGNet 在 PDP 保真度上仍有改进空间，说明未来工作需增强延迟域建模。

> **图 14（原文 Fig. 14）：** 不同 PB 对数下 SR 比较。用 2000 个样本训练 R2BA-Syn.-0、-1、-2，其中 1000 个采自真实网络、1000 个由模型合成。

> **图 15（原文 Fig. 15）：** 各信道合成方法的信道分布比较。

UE 公平性结果见图 16，采用 Jain 公平性指数（JFI）[44] 作为公平性度量。具体地，

$$
\mathrm{JFI}=\frac{\left(\sum_{u\in\mathcal N_{\mathrm u}}a_u\right)^2}{N_{\mathrm u}\sum_{u\in\mathcal N_{\mathrm u}}a_u^2},
$$

其中对 SR 取 $a_u=R_u$，对 SR 的 $\alpha$-效用取 $a_u=U_\alpha(R_u)$。WMMSE 的 JFI 最差，其他方法对 SR 取得中等 JFI、对 $\alpha$-效用的 JFI 接近完美。SR 的 JFI 未进一步提升，是因为 $\alpha$-效用最大化倾向于提高信道条件好的 UE 的 SR，同时把信道差的 UE 的 SR 保持在接近最优水平，如图 16 箱线图所示。在该公平性保证下最大化 SR 是合理的。要实现更均衡的 UE 公平性，可能需要限制分配给每个 UE 的最大 RBG 数或引入功率分配，这超出本文范围。

> **图 16（原文 Fig. 16）：** 各算法 UE 公平性比较示意。训练 R2BA-Syn.-0、-1、-2 的 CSI 部分采样自 1000 个位置，部分在 1000 个测试 POI 上合成。

尽管显式时变信道预测超出本文范围，我们用不同同步间隔下的用户轨迹样本评估移动引起的 DT 陈旧度。间隔越大，真实信道更新越不频繁，虚拟信道副本越陈旧。具体地，15 个 UE 在测试区域内以 2 m/s 随机移动。载频 28 GHz 下理论信道相干时间约 2.27 ms，大于表 V 报告的 R2BA 推理时间。UE 的 RBG 与波束分配每 $t_{\mathrm{alloc}}=10$ ms 更新一次。对 DT 构建，各 UE 的真实测量同步间隔 $t_{\mathrm{sync}}$ 从 100、200、300、400、800 ms 中选取，PB 对数取 16。每个间隔内，DT 用真实测量校准，通过简单线性回归估计每个 UE 的短期移动趋势，并并行合成 $\lfloor t_{\mathrm{sync}}/t_{\mathrm{alloc}}\rfloor$ 个信道样本用于 R2BA 训练；信道 DT 校准与 R2BA 调优随后与真实网络连续异步进行。由表 V，$T_{\mathrm{E2E}}$ 约 19.90 ms，系统运行时间 40 s。结果定量证实了及时 DT 同步的收益。图 17(a) 中，R2BA-Syn.-2 在各同步间隔下的信道 NMSE 始终低于 R2BA-Syn.-2，差约 3.3–3.4 dB，表明虚拟信道副本保持更好。相反，PB 增益 NMSE 变化很小，说明这一更低维的波束域度量对 DT 陈旧度不如信道矩阵敏感。该保真度增益带来明显的资源分配收益：如图 17(b) 所示，R2BA-Syn.-2 相对 R2BA-Syn.-1 平均和速率提高约 6.0%，相对 R2BA 提高 10.6%，相对 WMMSE 提高 35.8%。在最长的 800 ms 同步间隔下，R2BA-Syn.-2 仍提供 9120.8 Mbps，分别比 R2BA-Syn.-1、R2BA 与 WMMSE 高 6.2%、14.2% 与 20.2%。图 17(c) 进一步表明 R2BA-Syn.-2 保持近零的速率违反率，而 R2BA-Syn.-1 在 800 ms 时升至 0.0025。总体而言，DT 辅助的 R2BA 降低了 CSI 测量开销，而频繁的 DT 同步可提升保真度、维持更高 SR 并增强对移动引起的陈旧度的鲁棒性。

> **表 V（原文 Table V）：** 下游端到端时延。

| 时延 | 8 对 PB | 10 对 PB | 12 对 PB | 14 对 PB | 16 对 PB |
|---|---|---|---|---|---|
| $T_{\mathrm{gen}}$ | 1.03 ms | 1.03 ms | 1.03 ms | 1.03 ms | 1.03 ms |
| $T_{\mathrm{pb}}$ | 0.46 ms | 0.53 ms | 0.68 ms | 0.87 ms | 1.07 ms |
| $T_{\mathrm{R2BA}}^{\mathrm{train}}$ | 15.66 ms | 16.14 ms | 16.56 ms | 17.31 ms | 17.80 ms |
| $T_{\mathrm{E2E}}$ | 17.15 ms | 17.70 ms | 18.27 ms | 19.21 ms | 19.90 ms |
| $T_{\mathrm{R2BA}}^{\mathrm{infer}}$ | 0.43 ms | 0.44 ms | 0.45 ms | 0.47 ms | 0.52 ms |

（注：$T_{\mathrm{gen}}$、$T_{\mathrm{pb}}$ 与 $T_{\mathrm{R2BA}}^{\mathrm{train}}$ 分别表示每信道样本生成、PB 增益合成与 R2BA 每轮训练的时间代价；$T_{\mathrm{E2E}}=T_{\mathrm{gen}}+T_{\mathrm{pb}}+T_{\mathrm{R2BA}}^{\mathrm{train}}$ 表示 DT 辅助的端到端时延；$T_{\mathrm{R2BA}}^{\mathrm{infer}}$ 表示 R2BA 推理时延。）

> **图 17（原文 Fig. 17）：** 不同 DT–真实网络同步间隔下的 DT 保真度与陈旧度性能分析。

## VI. 结论

本文提出 P2CGNet——一种用于无线优化的高效免反馈用户级 MIMO-OFDM 信道生成模型。P2CGNet 构建在带 Transformer 骨干的 CF 引导 Chan-cDDIM 之上，取得比现有基线更准确的信道生成，已由理论分析与仿真验证。为展示其在信道 DT 中的效用，我们把 P2CGNet 集成到 RBGA 与 BA 联合优化中，并开发 GNN 驱动的 R2BA 模型；结果表明 P2CGNet 有效增强 R2BA、提升下游无线优化性能。不过 P2CGNet 仍有若干局限：它未显式建模天线阵元间距、阵列朝向等细粒度物理属性，而这些对精确 MIMO 传播很重要，也可能带来可扩展性问题；作为数据驱动模型，它也缺乏对环境几何、材料与散射体分布的显式感知。未来工作可纳入来自射线追踪或无线感知的环境感知信息以提升保真度、效率与泛化性；另一方向是把瞬时信道生成器扩展为时间维生成器，通过历史 CSI、速度或多普勒特征以及时间索引进行条件化，并结合时间注意力或循环更新，使 DT 能为车载与毫米波跟踪合成时间相关信道序列。

## 附录 A 命题 1 的证明

令估计的条件扩散得分与无条件得分之差为 $\Delta_{\boldsymbol\epsilon}(x,q,t)=\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,x,q,t)-\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$，则 (21) 可改写为

$$
\mathbf G_{x,q}^t=\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)+\lambda\Delta_{\boldsymbol\epsilon}(x,q,t). \tag{39}
$$

由于 $\boldsymbol\epsilon_\theta(\tilde{\mathbf H}_{x,q}^t,t)$ 旨在学习波束空间信道分布本身，可视为近似无偏，即

$$
\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{unsee}}}\left[\boldsymbol\epsilon_\theta\left(\tilde{\mathbf H}_{x,q}^t,t\right)\right]\approx\nabla_{\tilde{\mathbf H}_{x,q}^t}\log p\left(\tilde{\mathbf H}_{x,q}^t\right). \tag{40}
$$

$\mathbf G_{x,q}^t$ 与真实得分 $\tilde{\mathbf G}_{x,q}^t$ 之间的 MSE 定义为

$$
\mathrm{MSE}_{\mathrm{CF}}(\lambda)=\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{unsee}}}\left[\left\|\mathbf G_{x,q}^t-\tilde{\mathbf G}_{x,q}^t\right\|^2\right]. \tag{41}
$$

把 (17) 与 (39) 代入 (41)，$\mathrm{MSE}_{\mathrm{CF}}(\lambda)$ 改写为

$$
\mathrm{MSE}_{\mathrm{CF}}(\lambda)=\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{unsee}}}\left[\left\|\lambda\Delta_{\boldsymbol\epsilon}(x,q,t)-\tilde{\mathbf G}_{x,q}^{t,\prime}\right\|^2\right]. \tag{42}
$$

它被转化为关于 $\tilde{\mathbf G}_{x,q}^{t,\prime}$ 的目标。特别地，$\mathrm{MSE}_{\mathrm{Cond}}=\mathrm{MSE}_{\mathrm{CF}}(1)$。由于 $\mathrm{MSE}_{\mathrm{CF}}(\lambda)$ 是关于 $\lambda$ 的凸二次函数，且存在 $x,q\in\tilde{\mathbf H}^{\mathrm{unsee}}$、$t\in\mathcal T$ 使 $\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{unsee}}}[\|\Delta_{\boldsymbol\epsilon}(x,q,t)\|^2]>0$，因此存在 $\lambda'>0$ 使 $\mathrm{MSE}_{\mathrm{CF}}(\lambda')\le\mathrm{MSE}_{\mathrm{Cond}}$。注意在 $\lambda^\ast=\arg\min_\lambda\mathrm{MSE}_{\mathrm{CF}}(\lambda)=1$ 处 $\mathrm{MSE}_{\mathrm{CF}}(\lambda')=\mathrm{MSE}_{\mathrm{Cond}}$ 成立。

## 附录 B 定理 1 的证明

推断阶段，不加噪声的去噪分布可写为

$$
p\left(\tilde{\mathbf H}^{1:T}|\tilde{\mathbf H}^0\right)=p\left(\tilde{\mathbf H}^T|\tilde{\mathbf H}^0\right)\prod_{t=2}^{T}p\left(\tilde{\mathbf H}^{t-1}|\tilde{\mathbf H}^t,\tilde{\mathbf H}^0\right), \tag{43}
$$

其中 $p(\tilde{\mathbf H}^T|\tilde{\mathbf H}^0)=\mathcal N(\sqrt{\bar\nu_T}\tilde{\mathbf H}^0,(1-\bar\nu_T)\mathbf I)$。对 $t>1$，$p(\tilde{\mathbf H}^{t-1}|\tilde{\mathbf H}^t,\tilde{\mathbf H}^0)$ 可定义为

$$
p\left(\tilde{\mathbf H}^{t-1}|\tilde{\mathbf H}^t,\tilde{\mathbf H}^0\right)=\mathcal N\left(\vartheta_0\tilde{\mathbf H}^0+\vartheta_t\tilde{\mathbf H}^t,\mathbf 0\right), \tag{44}
$$

其中 $\vartheta_0=\sqrt{\bar\nu_{t-1}}-\sqrt{\bar\nu_t(1-\bar\nu_{t-1})}/\sqrt{1-\bar\nu_t}$、$\vartheta_t=\sqrt{1-\bar\nu_{t-1}}/\sqrt{1-\bar\nu_t}$。由 [32] 的引理 1，$p(\tilde{\mathbf H}^t|\tilde{\mathbf H}^0)=\mathcal N(\sqrt{\bar\nu_t}\tilde{\mathbf H}^0,(1-\bar\nu_t)\mathbf I)$ 成立。考虑训练目标 (15) 只依赖边缘分布 $p(\tilde{\mathbf H}^t|\tilde{\mathbf H}^0)$（$t\in\mathcal T$），只要该边缘固定，就可在不重训练的情况下选择更小的反向去噪步数以加速推理 [32]。假设选取子序列 $\{\varrho_s\}_{s=1}^{S}\subset\mathcal T$，给定 $\tilde{\mathbf H}^{\varrho_s}$ 与 CF 引导扩散得分估计 $\mathbf G_{x,q}^{\varrho_s}$，$\tilde{\mathbf H}^0$ 可由下式预测：

$$
\tilde{\mathbf H}^0=\frac{1}{\sqrt{\bar\nu_{\varrho_s}}}\tilde{\mathbf H}^{\varrho_s}-\frac{\sqrt{1-\bar\nu_{\varrho_s}}}{\bar\nu_{\varrho_s}}\mathbf G_{x,q}^{\varrho_s}. \tag{45}
$$

再把 (45) 代入 (44)，按均值采样即可导出 (23)。考虑到 (43) 中 $p(\tilde{\mathbf H}^T|\tilde{\mathbf H}^0)$，$\varrho_S$ 应接近 $T$，即应利用先验 $p(\tilde{\mathbf H}^T)=\mathcal N(\mathbf 0,\mathbf I)$。

## 附录 C 命题 2 的证明

按 cDDIM 推断过程 (23)，对 $\mathbf H^{\mathrm{samp}}$ 中相对位置 $x$ 处的第 $q$ 个 RBG，设 $\{\varrho_s\}_{s=1}^{S}$ 且 $S\ll T$，去噪后的 $\tilde{\mathbf H}_{x,q}^0$ 可重写为

$$
\tilde{\mathbf H}_{x,q}^0=\eta\tilde{\mathbf H}_{x,q}^T+\sum_{s=1}^{S}\tilde\gamma_{\varrho_s}\cdot\left(\tilde{\mathbf G}_{x,q}^{\varrho_s}+\Delta_{x,q}^{\varrho_s}\right), \tag{46}
$$

其中 $\eta$ 与 $\tilde\gamma_{\varrho_s}$ 分别是 $\tilde{\mathbf H}_{x,q}^T$ 与第 $\varrho_s$ 个推断步对应的系数。在第 $\varrho_s$ 个推断步，$\tilde{\mathbf G}_{x,q}^{\varrho_s}$ 表示目标噪声，$\Delta_{x,q}^{\varrho_s}$ 表示噪声估计误差矩阵。去噪 $S$ 步后的累积估计误差为 $\Delta_{x,q}=\sum_{s=1}^{S}\tilde\gamma_{\varrho_s}\Delta_{x,q}^{\varrho_s}$，它直接受 $\Delta_{x,q}^{\varrho_s}$ 影响，因为 $\eta$ 与 $\tilde\gamma_{\varrho_s}$ 由确定性 $\{\bar\nu_{\varrho_s}\}_{s=1}^{S}$ 决定。于是

$$
\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}\left[\left\|\Delta_{x,q}\right\|\right]\le\sum_{s=1}^{S}\left|\tilde\gamma_{\varrho_s}\right|\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}\left[\left\|\Delta_{x,q}^{\varrho_s}\right\|\right]\propto\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}\left[\left\|\Delta_{x,q}^{\varrho_s}\right\|\right],\quad\forall s=1,\cdots,S. \tag{47}
$$

由此，若 $\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}[\|\Delta_{x,q}^{\varrho_s}\|]\to0$（$\forall s=1,\cdots,S$），则 $\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}[\|\Delta_{x,q}\|]\to0$。反之，$\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}[\|\Delta_{x,q}^{\varrho_s}\|]\gg0$ 会使推断性能无法保证，因为 $\sup\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}[\|\Delta_{x,q}\|]\propto\mathbb E_{\{x,q\}\sim\mathbf H^{\mathrm{samp}}}[\|\Delta_{x,q}^{\varrho_s}\|]$（$\forall s=1,\cdots,S$），且对任意 $S$ 均成立。

## 参考文献（英文原书目）

- [1] Y. Huang, "Challenges and opportunities of sub-6 GHz integrated sensing and communications for 5G-advanced and beyond," Chin. J. Electron., vol. 33, no. 2, pp. 323–325, Mar. 2024.
- [2] X. You, Y. Huang, C. Zhang, J. Wang, H. Yin, and H. Wu, "When AI meets sustainable 6G," Sci. China Inf. Sci., vol. 68, no. 1, Jan. 2025, Art. no. 110301.
- [3] A. Alkhateeb, S. Jiang, and G. Charan, "Real-time digital twins: Vision and research directions for 6G and beyond," IEEE Commun. Mag., vol. 61, no. 11, pp. 128–134, Nov. 2023.
- [4] Z. Tao, W. Xu, Y. Huang, X. Wang, and X. You, "Wireless network digital twin for 6G: Generative AI as a key enabler," IEEE Wireless Commun., vol. 31, no. 4, pp. 24–31, Aug. 2024.
- [5] H. Chai, H. Wang, T. Li, and Z. Wang, "Generative AI-driven digital twin for mobile networks," IEEE Netw., vol. 38, no. 5, pp. 84–92, Sep. 2024.
- [6] S. Xiong, Y. Huang, S. He, and C. Zhang, "Enhancing radio resource management in RAN slicing by diffusion model and digital twin," IEEE Trans. Commun., vol. 73, no. 12, pp. 15295–15311, Dec. 2025.
- [7] Y. Cao et al., "Advancing ubiquitous wireless connectivity through channel twinning," 2024, arXiv:2406.12268.
- [8] Y. Zeng et al., "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1478–1519, 3rd Quart., 2024.
- [9] X. Xu and Y. Zeng, "How much data is needed for channel knowledge map construction?" IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13011–13021, Oct. 2024.
- [10] G. Kim, R. Jin, W. Funk, S.-J. Kim, and H. Lim, "Multiantenna channel map estimation using deep spatial interpolation," in Proc. IEEE Int. Conf. Acoust., Speech, Signal Process. Workshops (ICASSPW), Apr. 2024, pp. 790–794.
- [11] Q. Chen, M. Huang, and J. Yang, "REM-Net+: 3D radio environment map construction guided by radio propagation model," IEEE Trans. Veh. Technol., vol. 75, no. 4, pp. 6351–6362, Apr. 2026.
- [12] Y. Wang, S. Sun, N. Liu, L. Xu, and L. Wang, "Two-stage radio map construction with real environments and sparse measurements," IEEE Wireless Commun. Lett., vol. 14, no. 4, pp. 969–973, Apr. 2025.
- [13] X. Zhao, Z. An, Q. Pan, and L. Yang, "NeRF2: Neural radio-frequency radiance fields," in Proc. 29th Annu. Int. Conf. Mobile Comput. Netw., Oct. 2023, pp. 1–15.
- [14] H. Lu, C. Vattheuer, B. Mirzasoleiman, and O. Abari, "NeWRF: A deep learning framework for wireless radiation field reconstruction and channel prediction," 2024, arXiv:2403.03241.
- [15] C. Wen, J. Tong, Y. Hu, Z. Lin, and J. Zhang, "Neural representation for wireless radiation field reconstruction: A 3D Gaussian splatting approach," 2024, arXiv:2412.04832.
- [16] Z. Li et al., "Wideband RF radiance field modeling using frequency-embedded 3D Gaussian splatting," 2025, arXiv:2505.20714.
- [17] E. Balevi, A. Doshi, A. Jalal, A. Dimakis, and J. G. Andrews, "High dimensional channel estimation using deep generative networks," IEEE J. Sel. Areas Commun., vol. 39, no. 1, pp. 18–30, Jan. 2021.
- [18] M. Arvinte and J. I. Tamir, "MIMO channel estimation using score-based generative models," IEEE Trans. Wireless Commun., vol. 22, no. 6, pp. 3698–3713, Jun. 2023.
- [19] Z. Chen, H. Shin, and A. Nallanathan, "Generative diffusion model-based variational inference for MIMO channel estimation," IEEE Trans. Commun., vol. 73, no. 10, pp. 9254–9269, Oct. 2025.
- [20] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Trans. Wireless Commun., vol. 24, no. 7, pp. 5840–5854, Jul. 2025.
- [21] B. Zhou, X. Yang, S. Ma, F. Gao, and G. Yang, "Low-overhead channel estimation via 3D extrapolation for TDD mmWave massive MIMO systems under high-mobility scenarios," IEEE Trans. Wireless Commun., vol. 24, no. 4, pp. 2797–2813, Apr. 2025.
- [22] B. Chatelier, V. Corlay, M. Crussière, and L. Le Magoarou, "Model-based learning for multi-antenna multi-frequency location-to-channel mapping," IEEE J. Sel. Topics Signal Process., vol. 19, no. 3, pp. 520–535, Apr. 2025.
- [23] X. Xu, X. Mu, Y. Liu, H. Xing, Y. Liu, and A. Nallanathan, "Generative artificial intelligence for mobile communications: A diffusion model perspective," IEEE Commun. Mag., vol. 63, no. 7, pp. 98–105, Jul. 2025.
- [24] F. Euchner, J. Sanzi, M. Henninger, and S. Ten Brink, "GAN-based massive MIMO channel model trained on measured data," in Proc. 27th Int. Workshop Smart Antennas (WSA), Mar. 2024, pp. 109–116.
- [25] Z. Liu et al., "Leveraging self-supervised learning for MIMO-OFDM channel representation and generation," 2024, arXiv:2407.07702.
- [26] T. Lee, J. Park, H. Kim, and J. G. Andrews, "Generating high dimensional user-specific wireless channels using diffusion models," 2024, arXiv:2409.03924.
- [27] P. Ferrand, M. Guillaud, C. Studer, and O. Tirkkonen, "Wireless channel charting: Theory, practice, and applications," IEEE Commun. Mag., vol. 61, no. 6, pp. 124–130, Jun. 2023.
- [28] S. He et al., "An overview on the application of graph neural networks in wireless networks," IEEE Open J. Commun. Soc., vol. 2, pp. 2547–2565, 2021.
- [29] S. He, S. Xiong, W. Zhang, Y. Yang, J. Ren, and Y. Huang, "GBLinks: GNN-based beam selection and link activation for ultra-dense D2D mmWave networks," IEEE Trans. Commun., vol. 70, no. 5, pp. 3451–3466, May 2022.
- [30] S. He, S. Xiong, Z. An, W. Zhang, Y. Huang, and Y. Zhang, "An unsupervised deep unrolling framework for constrained optimization problems in wireless networks," IEEE Trans. Wireless Commun., vol. 21, no. 10, pp. 8552–8564, Oct. 2022.
- [31] Y. Heng and J. G. Andrews, "Grid-free MIMO beam alignment through site-specific deep learning," IEEE Trans. Wireless Commun., vol. 23, no. 2, pp. 908–921, Feb. 2024.
- [32] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," 2020, arXiv:2010.02502.
- [33] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Proc. Adv. Neural Inf. Process. Syst., vol. 33, 2020, pp. 6840–6851.
- [34] J. Ho and T. Salimans, "Classifier-free diffusion guidance," 2022, arXiv:2207.12598.
- [35] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," 2015, arXiv:1505.04597.
- [36] A. Vaswani et al., "Attention is all you need," in Proc. Adv. Neural Inf. Process. Syst., vol. 30, 2017, pp. 1–11.
- [37] A. Dosovitskiy et al., "An image is worth 16 × 16 words: Transformers for image recognition at scale," 2020, arXiv:2010.11929.
- [38] J. Hoydis et al., "Sionna: An open-source library for next-generation physical layer research," 2022, arXiv:2203.11854.
- [39] J. Hoydis et al., "Sionna RT: Differentiable ray tracing for radio propagation modeling," in Proc. IEEE Globecom Workshops (GC Wkshps), Dec. 2023, pp. 317–321.
- [40] G. Y. Lu and D. W. Wong, "An adaptive inverse-distance weighting spatial interpolation technique," Comput. Geosci., vol. 34, no. 9, pp. 1044–1055, Sep. 2008.
- [41] T. Du and T. Wilna, "Radial basis function interpolation," Ph.D. dissertation, Stellenbosch Univ., Stellenbosch, South Africa, 2008.
- [42] F. Euchner and M. Gauger, "CSI dataset dichasus-dxxx-complete: Outdoor—Three arrays distributed along the facade," Inst. Telecommun., Univ. Stuttgart (DaRUS), Stuttgart, Germany, Tech. Rep. DARUS-3153, ver. 1, 2022, doi: 10.18419/darus-3153.
- [43] F. Euchner et al., "CSI dataset dichasus-dcxx: Institute hallway with known 3D model, distributed antennas," DaRUS, Inst. Telecommun., Univ. Stuttgart, Stuttgart, Germany, Tech. Rep. DARUS-3831, ver. 1, 2023, doi: 10.18419/darus-3831.
- [44] R. Jain, D. M. W. Chiu, and W. R. Hawe, "A quantitative measure of fairness and discrimination," Eastern Res. Lab., Digit. Equip. Corp., Hudson, MA, vol. 21, no. 1, p. 2022, 1984.

## 作者简介（原文）

**熊绍文（Shaowen Xiong，Graduate Student Member, IEEE）** 2022 年于中南大学获计算机科学与技术硕士学位，现于东南大学攻读信息与通信工程博士学位。研究方向包括智能无线通信与网络数字孪生。

**何世文（Shiwen He，Senior Member, IEEE）** 2009 年于成都理工大学获计算数学硕士学位，2013 年于东南大学获信息与通信工程博士学位。2018 年 4 月起任中南大学计算机科学与工程学院教授；2015 年 11 月至 2018 年 3 月任东南大学信息科学与工程学院副研究员；2013 年 9 月至 2015 年 10 月在东南大学无线电工程系毫米波国家重点实验室从事博士后研究。已发表/合著 180 余篇技术论文，获授权发明专利 121 项。研究方向包括无线人工智能原生通信的基础理论研究与标准协议开发、并行计算架构，以及可编程无线人工智能原生通信原型系统的研发。2015 年 12 月至 2018 年 7 月任 IEEE 802.11aj 技术副编辑，向 IEEE 标准提交 20 余项技术提案，获 IEEE 802.11aj 标准发展杰出贡献感谢证书；曾任 IEEE SIGNAL PROCESSING LETTERS 与 EURASIP Journal on Wireless Communications 高级领域编辑，并担任 Globecom、ICC、ICCC、WCSP 等会议 TPC 成员。

**陈光辉（Guanghui Chen，Member, IEEE）** 2025 年于东南大学获信息与通信工程博士学位；2026 年起任郑州大学电气与信息工程学院教师。研究方向聚焦智能无线通信。

**陶振宇（Zhenyu Tao，Graduate Student Member, IEEE）** 2022 年于东南大学获信息工程学士学位，现于该校攻读通信与信息系统博士学位。研究方向包括网络数字孪生、深度学习与面向无线网络的强化学习。

**林鸿鑫（Hongxin Lin）** 2013 年与 2016 年分别于华侨大学获学士与硕士学位，2022 年 6 月于东南大学获博士学位；2022 年 8 月起在紫金山实验室从事研究。研究方向包括 QoS 保障、毫米波通信、卫星通信、大规模 MIMO 无蜂窝网络与 URLLC 等无线通信技术。

**黄永明（Yongming Huang，Fellow, IEEE）** 2000 年与 2003 年分别于南京大学获学士与硕士学位，2007 年于东南大学获电气工程博士学位。2007 年 3 月起在东南大学信息科学与工程学院任教，现为教授；2019 年起兼任紫金山实验室泛在通信研究中心主任；2008–2009 年访问瑞典皇家理工学院（KTH）信号处理实验室。已发表 200 余篇同行评审论文，持有 80 余项发明专利。研究方向包括智能 5G/6G 移动通信与毫米波无线通信。向 IEEE 标准提交约 20 项技术贡献，获 IEEE 802.11aj 标准发展杰出贡献感谢证书；曾任 IEEE TRANSACTIONS ON SIGNAL PROCESSING 副编辑、IEEE JOURNAL ON SELECTED AREAS IN COMMUNICATIONS 客座编辑，现任 IEEE OPEN JOURNAL OF THE COMMUNICATIONS SOCIETY 编辑（Editor-at-Large）。

## 图注与表注索引

本页图 1–17 的中文图注与表 I–V 的表注均按原文出现位置内联在正文中（图 1–2 见第 I–II 节，图 3–4 见第 IV 节，图 5–17 见第 V 节；表 I 见第 V-A 节，表 II–III 见第 V-B 节，表 IV 见第 V-C 节，表 V 见第 V-D 节），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 IEEE Trans. Wireless Commun.（vol. 25, 2026, pp. 20447–20462）正式版全文（本地 PDF 16 页）的中文译稿：摘要、索引词、第 I–VI 节正文、图 1–17 的中文图注、表 I–V 的逐格转写、算法 1–2 伪代码、附录 A–C（含 (39)–(47) 的证明）、参考文献 44 条英文原条目（按原编号）以及 6 位作者简介。公式与表格已对照 PDF 渲染页核对：式 (1)–(47) 逐式核对（重点 (1)–(8)、(9)–(28)、(29)–(37)、(38)–(47)）；表 I、表 II、表 III、表 IV、表 V 均因文本抽取缺失表体，改用第 9、11、12、13 页渲染图逐格核对（表 I 环境/采样/带宽/载频/天线构型，表 II 复杂度三组 FLOPs 与时间/显存，表 III 六种算法四组天线时延，表 IV 四个真实场景配置，表 V 五种 PB 对数下五项时延，全部数值一致）。本页不上传原文图片，图 6–17 的曲线/可视化数值不作数字化估算；正文与表格中的实验数值按原文转写。**再传播许可待核验，本页仅作学习用途，不计入可公开全文。** 逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

{% endraw %}
