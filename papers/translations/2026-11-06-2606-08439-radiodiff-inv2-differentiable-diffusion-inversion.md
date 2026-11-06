---
layout: page
title: "RadioDiff-Inv2：稀疏含噪测量与定位漂移下的可微扩散反演无线电地图估计｜中文全文译文"
permalink: /papers/translations/2026-11-06-2606-08439-radiodiff-inv2-differentiable-diffusion-inversion/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8426d97a2d1dfa23/) · [原文 arXiv](https://arxiv.org/abs/2606.08439/) · [全部目录](/papers/catalog/)

# RadioDiff-Inv2：稀疏含噪测量与定位漂移下的可微扩散反演无线电地图估计

**原题：** RadioDiff-Inv2: Differentiable Diffusion Inversion under Location Drift from Sparse Noisy Measurements for Radio Map Estimation  
**作者：** Xiucheng Wang、Kailong Wang、Nan Cheng（单位按 PDF 原文转写）  
**作者单位（PDF 第 1 页）：** 中国西安 710071，西安电子科技大学（Xidian University）综合业务网理论及关键技术国家重点实验室（State Key Laboratory of ISN）与通信工程学院（School of Telecommunications Engineering）；邮箱：`{xcwang1, 24012100069}@stu.xidian.edu.cn`、`dr.nan.cheng@ieee.org`；通讯作者：Nan Cheng。  
**版本：** arXiv:2606.08439v1（PDF 首页 arXiv 戳：arXiv:2606.08439v1 [eess.SY]，7 Jun 2026）；13 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、索引词、正文第 I–VI 节及全部小节（§II-A–B、§III-A–D、§IV-A–D、§V-A–C）、式 (1)–(30)（含 (22a)–(22c)）、算法 1（22 行逐行）、表 I–IV 逐格、图 1–4 图注、参考文献 [1]–[39] 英文原条目；许可：arXiv 预印本（公开可读）。原文无附录、无定理/命题环境。逐句逐式终校未做。

**资助声明（原文第 1 页脚注）：** 本工作受国家重点研发计划（National Key Research and Development Program of China，2020YFB1807700）与国家自然科学基金（National Natural Science Foundation of China，NSFC，Grant No. 62201432）资助。

## 摘要

无线电地图（radio map，RM）估计是实现 6G 无线网络环境感知优化的关键使能技术。在实践中，RM 构建日益依赖众包接收信号强度（received signal strength，RSS）反馈，而这类反馈本质上**稀疏且含噪**。一个更隐蔽、且常被忽视的挑战是**定位漂移**（location drift）：隐私约束与用户移动会使上报的采样坐标偏离真实测量位置。与加性测量噪声不同，定位漂移扰动的是**感知算子本身**，因为每个 RSS 样本实际上是在错误的空间坐标上查询底层 RM。这种算子不确定性，叠加稀疏含噪感知，使逆问题严重不适定，并限制了依赖解析指定先验的传统估计器。本文提出 **RadioDiff-Inv2**，一个可微扩散反演框架，用于在定位漂移下从稀疏含噪测量中估计 RM。我们引入**高斯重采样**方案，在基于网格的无线电地图上构造可微的漂移感知测量算子；并利用**概率流常微分方程**（ordinary differential equation，ODE）把扩散采样器转化为从初始噪声码到估计 RM 的确定性可微映射。通过反向传播、以**漂移边缘化**后的数据保真目标优化该噪声码，RadioDiff-Inv2 产生既符合先验、又与测量一致的重建结果，而无需昂贵的后验采样。大量实验表明，在不同稀疏度与漂移水平下，RadioDiff-Inv2 在 PSNR 上比最佳竞争基线高 4 至 14 dB。该优势在低 SNR 区间最为显著：学习到的扩散先验保持近乎恒定的重建保真度，而传统方法严重退化。代码见 https://github.com/UNIC-Lab/RadioDiff-inv2。

**索引词（Index Terms）：** 无线电地图估计、定位漂移、扩散模型、可微反演。

## I. 引言

在 6G 网络中，环境感知智能有望成为核心能力，而无线电地图（RM）提供了支撑这一愿景的空间显式传播抽象 [1]–[3]。通过刻画信号强度与阴影衰落如何随空间变化，RM 直接支撑覆盖规划 [4]、干扰协调 [5]、移动性感知的资源管理 [6]，以及其他仅靠瞬时链路测量难以实现的主动控制功能 [7]。然而在运营场景中，大规模获取密集且可靠的 RM 仍是主要实践瓶颈 [5]。RM 构建日益由机会式地从用户设备采集的众包接收信号强度（RSS）反馈驱动，因为专用路测与密集基础设施感知成本高昂且难以持续 [8], [9]。众包范式虽具可扩展性，但受参与度有限、硬件异构与测量条件时变的影响，所得观测在空间上稀疏、在幅度上含噪 [10]。除稀疏性与噪声之外，众包还引入了重塑逆问题的一种更根本的不确定性，即采样位置本身可能不可靠。

这种位置不确定性称为**定位漂移**，其成因在于隐私保护与用户移动使众包测量难以被准确定位 [11]。在隐私保护部署中，细粒度的全球定位系统（GPS）坐标往往不可得、被混淆或在上报网络之前被量化 [12]；而在高移动场景中，测量在移动过程中采集，与假定的采样时刻存在时间失配 [13]。结果，上报坐标可能以随机偏移偏离真实采样位置。与加性幅度噪声不同，定位漂移通过在错误的空间坐标上求值潜藏 RM 而扰动**测量算子本身** [14]。这一区别在 6G 相关环境中尤其关键：在建筑边缘、遮挡边界以及由绕射与多径塑造的区域附近，传播表现出陡峭的空间过渡 [15]。在此类条件下，即使中等程度的漂移也可能把测量映射到性质截然不同的传播区制中，放大重建偏差并使逆问题严重不适定 [16]。因此，网络只能观测到与不精确坐标相关联的稀疏含噪 RSS 上报，而底层 RM 必须在整个空间域上推断——这使**待重建的场**与**有效感知位置**同时不确定。定位漂移与低测量 SNR 的复合效应尤其有害：高噪声水平掩盖了本就稀少的空间样本，而漂移同时误导感知算子，使传统估计器既没有准确数值、也没有可靠位置来锚定重建。

现有稀疏 RM 重建方法在应对这一复合挑战方面存在根本局限。插值与核方法（包括 Kriging 类方法 [17]）施加平稳性与平滑性假设，而在遮挡与绕射导致陡峭空间过渡的真实城市传播环境中，这些假设常被违背 [18], [19]。当测量 SNR 较低时，这些估计器还会通过插值核对噪声进一步放大，使重建质量随 SNR 下降迅速恶化。压缩感知与最大后验（maximum a posteriori，MAP）表述把测量保真项与结构先验结合，但其实际效果关键取决于指定一个与任务匹配、能如实刻画多样场景下 RM 分布的先验 [5], [17], [20]。漂移引起的感知失配进一步加剧了先验指定的困难：似然本身也变为误指定 [21]。在低 SNR 条件下，微弱的数据保真信号不足以约束解，而误指定的先验会导致很大的估计偏差。近期基于扩散的生成模型已展现出直接从数据学习高保真 RM 先验的强大能力 [10], [18], [22]，但要把这些学习到的先验转化为定位漂移下与测量一致的重建仍非易事。多数测量引导的扩散表述隐含假设感知算子固定且配准正确 [23]，而在定位漂移下该假设失效，导致优化信号有偏，且往往需要昂贵的后验采样来维持稳定。这些局限在低 SNR 区间最为突出：此时测量携带的信息最少，而强且良好校准的生成先验对恢复底层场变得不可或缺。上述观察促使我们提出一种**漂移感知**的反演框架，能够利用扩散学习到的先验，在测量质量严重退化时仍给出稳健重建。

为应对这些挑战，本文提出 RadioDiff-Inv2，一个用于定位漂移下由稀疏含噪测量进行 RM 估计的可微扩散反演框架。该框架建立在两个相互耦合的思想之上。第一，利用**概率流常微分方程**（ODE）[24] 把扩散采样器转化为从初始噪声码到估计 RM 的确定性、可微映射，从而通过直接优化噪声码实现基于梯度的反演，而不再依赖重复随机采样或昂贵的后验探索。第二，引入**高斯重采样**方案，把每个漂移后的坐标查询转化为网格地图上平滑、可微的测量算子，使梯度可同时穿过扩散 ODE 轨迹与漂移感知感知模型。通过反向传播优化初始噪声码以最小化漂移边缘化的数据保真目标，RadioDiff-Inv2 产生同时符合先验、且与稀疏含噪漂移观测一致的重建，相比基于采样的扩散基线显著提升了推断效率。该设计的一个显著优势是其对低测量 SNR 的鲁棒性：由于扩散先验隐含地把解约束在学习到的 RM 流形上，重建质量在很大程度上对噪声强度不敏感；相反，传统基线在 SNR 降低时性能迅速恶化。本文主要贡献概括如下。

1) 面向 6G 场景下由众包 RSS 进行 RM 估计，本文提出**漂移感知的稀疏反演问题**，显式刻画测量噪声与定位漂移的联合影响（二者使感知算子不确定）。
2) 面向基于网格的 RM，本文提出**基于高斯重采样的可微漂移感知测量算子**，使梯度可稳定地穿过由隐私约束与用户移动引起的空间失配。
3) 利用概率流 ODE 把扩散生成器转化为从初始噪声码到 RM 的确定性可微映射，并通过优化该噪声码以强制漂移感知的测量一致性，从而实现**免采样扩散反演**。
4) 通过大量实验验证 RadioDiff-Inv2，表明其在广泛稀疏度与漂移水平下均具有更好的重建保真度与鲁棒性，并相对传统基线与基于采样的扩散方法具有更优的推断效率。特别地，该方法在 0 dB 至 10 dB 的 SNR 范围内表现出近乎恒定的重建质量，在 0 dB SNR 下相对最佳竞争基线取得超过 15 dB 的 PSNR 增益与超过 0.41 的 SSIM 提升——这证实了在极端测量退化下学习到的扩散先验具有强正则化效果。

## II. 预备知识与相关工作

### A. 扩散模型

去噪扩散概率模型（denoising diffusion probabilistic models，DDPM）[25] 通过把干净样本 \(x_0\sim q(x_0)\) 经高斯噪声注入逐步扰动为隐变量序列 \(\{x_t\}_{t=1}^{T}\)，从而定义生成模型。设 \(\{\beta_t\}_{t=1}^{T}\) 为方差调度且 \(\beta_t\in(0,1)\)，定义 \(\alpha_t=1-\beta_t\) 与 \(\bar\alpha_t=\prod_{s=1}^{t}\alpha_s\)。前向扩散为马尔可夫链

$$
q(x_t|x_{t-1})=\mathcal N\left(x_t;\sqrt{\alpha_t}x_{t-1},(1-\alpha_t)\mathbf I\right).\tag{1}
$$

由链式合成，边缘分布具有闭式形式

$$
q(x_t|x_0)=\mathcal N\left(x_t;\sqrt{\bar\alpha_t}x_0,(1-\bar\alpha_t)\mathbf I\right),\tag{2}
$$

其等价表示为

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon,\qquad \epsilon\sim\mathcal N(\mathbf 0,\mathbf I).\tag{3}
$$

DDPM 构造逆向时间的生成过程 \(p_\theta(x_{t-1}|x_t)\)，以反转前向破坏过程。前向链的精确逆后验同样为高斯分布：

$$
q(x_{t-1}|x_t,x_0)=\mathcal N\left(x_{t-1};\tilde{\boldsymbol\mu}(x_t,x_0,t),\tilde\beta_t\mathbf I\right),\tag{4}
$$

其中

$$
\tilde{\boldsymbol\mu}(x_t,x_0,t)=\frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}x_t+\frac{\sqrt{\bar\alpha_{t-1}}(1-\alpha_t)}{1-\bar\alpha_t}x_0,\tag{5}
$$

$$
\tilde\beta_t=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t.\tag{6}
$$

实践中，逆转移被参数化为

$$
p_\theta(x_{t-1}|x_t)=\mathcal N\left(x_{t-1};\boldsymbol\mu_\theta(x_t,t),\sigma_t^{2}\mathbf I\right),\tag{7}
$$

其中 \(\sigma_t^{2}\) 取为 \(\tilde\beta_t\) 或可学习变体，\(\boldsymbol\mu_\theta\) 由神经网络产生。一种常用而有效的参数化方式是预测 (6) 中的加性噪声 \(\epsilon\)。给定噪声预测器 \(\epsilon_\theta(x_t,t)\)，干净样本的估计由下式得到：

$$
\hat x_0(x_t,t)=\frac{x_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta(x_t,t)}{\sqrt{\bar\alpha_t}}.\tag{8}
$$

把 \(\hat x_0\) 代入后验均值，即得标准 DDPM 采样均值

$$
\boldsymbol\mu_\theta(x_t,t)=\tilde{\boldsymbol\mu}\left(x_t,\hat x_0(x_t,t),t\right).\tag{9}
$$

训练通常通过在 \(t\in\{1,\ldots,T\}\) 上均匀采样并最小化噪声预测目标完成：

$$
\min_\theta\ \mathbb E_{t,x_0,\epsilon}\left[\left\|\epsilon-\epsilon_\theta(x_t,t)\right\|_2^{2}\right].\tag{10}
$$

在 \(\sigma_t^{2}\) 的标准取法下，该目标对应于变分界优化，并产生一个可通过从 \(x_T\sim\mathcal N(\mathbf 0,\mathbf I)\) 起迭代 \(p_\theta(x_{t-1}|x_t)\) 直至 \(x_0\) 来采样的模型。

去噪扩散隐式模型（denoising diffusion implicit models，DDIM）[26] 保留相同的前向边缘分布 \(q(x_t|x_0)\) 并复用同一个已训练预测器 \(\epsilon_\theta(x_t,t)\)，但把逆向轨迹改为可被确定化的非马尔可夫族。给定 \(x_t\)，DDIM 先按 (8) 计算 \(\hat x_0(x_t,t)\)，然后更新

$$
x_{t-1}=\sqrt{\bar\alpha_{t-1}}\hat x_0(x_t,t)+\sqrt{1-\bar\alpha_{t-1}-\sigma_t^{2}}\,\epsilon_\theta(x_t,t)+\sigma_t z,\tag{11}
$$

其中 \(z\sim\mathcal N(\mathbf 0,\mathbf I)\)，噪声尺度 \(\sigma_t\) 由参数 \(\eta\in[0,1]\) 控制：

$$
\sigma_t=\eta\sqrt{\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}}\sqrt{1-\frac{\bar\alpha_t}{\bar\alpha_{t-1}}}.\tag{12}
$$

取 \(\eta=1\) 可恢复与 DDPM 方差选择相匹配的随机轨迹，而取 \(\eta=0\) 则得到完全确定性的采样器：

$$
x_{t-1}=\sqrt{\bar\alpha_{t-1}}\hat x_0(x_t,t)+\sqrt{1-\bar\alpha_{t-1}}\,\epsilon_\theta(x_t,t).\tag{13}
$$

一个关键推论是：当 \(\eta=0\) 时，生成的样本成为初始噪声 \(x_T\) 的确定性函数，从而建立从初始隐码到重建输出的一一映射。此外，DDIM 天然支持通过在时间步子序列上运行来加速采样，因为其更新只依赖 \(\bar\alpha_t\)，而不要求全部中间马尔可夫转移。

### B. 无线电地图估计

稀疏测量下的 RM 估计已研究多年，始于经典空间插值与统计学习 [27]。代表性技术包括反距离加权、Kriging [17] 与高斯过程回归 [28]，它们通过手工设计的核施加平稳性与平滑性，从有限样本外推密集场。这些方法因简单与可解释而具吸引力，但在室外城市环境中常显吃力：接收功率因遮挡与绕射而呈现陡峭过渡。为降低模型失配并提升可扩展性，基于学习的重建已成为主导范式 [29]。RadioUNet [30] 及其变体等卷积编码器—解码器框架学习从稀疏测量与环境上下文到密集 RM 的直接映射，深度去噪正则化也被探索用于提升测量噪声下的鲁棒性 [27]。这些**点估计**方法在中等稀疏度下可给出较高精度，但往往过平滑细节结构，且在观测极度稀疏或分布不均时性能下降。

为更好地刻画长程依赖与全局传播模式，近期工作引入了超越纯卷积的架构。条件对抗学习，包括 Pix2Pix 式表述与 TiRE-GAN [31]、RME-GAN [32] 等任务驱动变体，可锐化阴影边界并增强高频细节，但当对抗目标压过数据保真时，可能引入视觉上合理却物理不一致的伪影。基于 Transformer 的模型旨在更显式地建模全局交互。RMTransformer [33]、MARS [34] 与 RadioFormer [35] 等设计利用注意力聚合全图上的稀疏证据，并改善复杂布局下的重建。图神经网络提供了互补方向：把测量位置与预测位置表示为节点，并通过消息传递传播信息，RadioGAT [36] 为其代表。这些进展提升了对不规则采样模式的利用能力，但多数表述仍假设每个测量都被正确配准到其上报坐标，因而在推断期间把感知算子视为固定的。

生成式建模近来成为学习超越确定性回归器的无线电地图先验的有力工具。RadioDiff [10] 等基于扩散的框架在学习高保真无线电地图分布方面展现出强大能力，而 RMDM [37] 与 iRadioDiff [38] 等物理感知变体纳入传播相关约束以增强物理一致性。扩散生成的一个实践顾虑是迭代去噪带来的推断时延，这推动了加速研究，包括 RadioFlow [39] 等基于流匹配的模型——它们通过常微分方程求解器以更少步数生成样本。对于逆问题，扩散先验通常通过测量引导、即插即用式正则或后验采样来利用 [5]。然而，这些策略通常假设感知算子被正确指定且已配准。在空间失配下，朴素引导会产生有偏的优化信号，而基于采样的后验推断会变得愈发昂贵，因为感知算子的不确定性必须与潜场联合求解。

本文与现有稀疏无线电地图重建及基于扩散的估计之间的一个关键区别在于：本文显式处理众包感知中的定位漂移——隐私约束与用户移动使上报坐标偏离真实采样位置。在此设置下，测量不仅稀疏含噪，还关联着**不确定的空间查询**，这从根本上改变了推断问题。通过以漂移边缘化似然来表述漂移感知无线电地图估计，并发展在坐标不确定性下强制测量一致性的可微反演机制，所提框架针对的是此前基于学习与生成式方法通常忽视的**真实性差距**。

## III. 系统模型与问题表述

### A. 环境模型

本文考虑记为 \(\Omega\subset\mathbb R^{2}\) 的室外感兴趣区域。该区域被离散为均匀网格：沿水平方向 \(N_x\) 个单元，沿垂直方向 \(N_y\) 个单元。设 \(\mathcal G=\{\mathbf p_{i,j}\}\) 表示网格中心位置集合，其中 \(\mathbf p_{i,j}\in\Omega\) 为与索引 \((i,j)\) 的单元相关联的物理坐标。网格分辨率由单元间距 \(\Delta_x\) 与 \(\Delta_y\) 刻画，它们既决定 RM 表示的空间粒度，也决定后续反演中所用的测量算子。建筑分布由二值占据矩阵 \(\mathbf H\in\{0,1\}^{N_x\times N_y}\) 表示。元素 \(H_{i,j}=1\) 表示对应单元被建筑占据，因而被视为室外传播的遮挡区域；元素 \(H_{i,j}=0\) 表示该单元属于自由空间，可承载有效接收机位置。矩阵 \(\mathbf H\) 提供环境的紧凑几何描述，并用于确定传播模型中的可见性、遮挡与交互事件。目标量是定义在同一网格上的无线电地图 \(\mathbf R\in\mathbb R^{N_x\times N_y}\)。对每个自由空间单元，元素 \(R_{i,j}\) 表示在给定发射机配置与传播环境下与位置 \(\mathbf p_{i,j}\) 相关联的大尺度接收信号强度。全文把 RM 值建模在**对数功率尺度**上，以便在观测模型与漂移感知反演流程中一致地处理测量噪声与模型失配。

### B. 传播模型

给定发射机配置与环境地图 \(\mathbf H\)，任意接收机位置 \(\mathbf p\in\Omega\) 处的接收信号强度由基于物理的传播算子预测，该算子近似室外场景中的电磁波传播。该模型被视为确定性正演算子

$$
\mathrm{RSS}(\mathbf p)=\mathcal F(\mathbf p;\mathbf H),\tag{14}
$$

它把接收机位置与环境映射到相应的接收功率水平。

在对数功率尺度下，位置 \(\mathbf p\) 处的接收信号强度由链路预算形式表示：

$$
\mathrm{RSS}(\mathbf p)=P_t+G_t(\mathbf p)+G_r(\mathbf p)-L(\mathbf p),\tag{15}
$$

其中 \(P_t\) 表示发射功率，\(G_t(\mathbf p)\) 表示沿指向 \(\mathbf p\) 的有效传播方向的发射天线增益，\(G_r(\mathbf p)\) 表示接收天线增益，\(L(\mathbf p)\) 表示以分贝计的有效路损。

有效路损通过对自由空间衰减、距离相关项以及环境引起的附加交互损耗进行组合来建模，写为

$$
L(\mathbf p)=20\log_{10}\left(\frac{4\pi}{\lambda}\right)+10\kappa(\mathbf p)\log_{10}\left(d(\mathbf p)\right)+L_{\mathrm{int}}(\mathbf p)-G_{\mathrm{wg}}(\mathbf p)-G_t(\mathbf p),\tag{16}
$$

其中 \(\lambda\) 为载波波长，\(d(\mathbf p)\) 为与到达 \(\mathbf p\) 的主传播路线相关联的有效传播路径长度，\(\kappa(\mathbf p)\) 为由 \(\mathbf p\) 处传播条件决定的场景相关路损指数。项 \(L_{\mathrm{int}}(\mathbf p)\) 汇总主路线上由反射与绕射等环境机制贡献的交互损耗，\(G_{\mathrm{wg}}(\mathbf p)\) 刻画室外街道峡谷中可能的波导式增益效应。显式包含发射天线增益 \(G_t(\mathbf p)\) 是为了计入定向辐射及其对空间 RSS 变化的影响。

为刻画交互损耗的累积，\(L_{\mathrm{int}}(\mathbf p)\) 被表示为主路线上各交互事件之和：

$$
L_{\mathrm{int}}(\mathbf p)=\sum_{k=1}^{K(\mathbf p)}\ell_k(\mathbf p),\tag{17}
$$

其中 \(K(\mathbf p)\) 表示交互事件数，\(\ell_k(\mathbf p)\) 表示第 \(k\) 个事件的损耗。环境地图 \(\mathbf H\) 支配可见性与遮挡，从而决定是否存在可行路线，并塑造 \(d(\mathbf p)\)、\(K(\mathbf p)\) 及相应的损耗与增益项；这进而在室外场景的遮挡边界附近引起 \(\mathrm{RSS}(\mathbf p)\) 的陡峭空间过渡。

### C. 测量模型

众包感知在感兴趣区域内提供一组空间稀疏的接收信号强度观测。设 \(\mathcal D=\{(\tilde{\mathbf p}_m,y_m)\}_{m=1}^{M}\) 表示测量集合，其中 \(\tilde{\mathbf p}_m\in\Omega\) 为第 \(m\) 个样本的上报坐标，\(y_m\) 为对数功率尺度下的相应 RSS 值。测量数远小于网格单元数，因此感知过程强烈欠定。上报的 RSS 值被建模为在真实感知位置处求值的潜藏 RM 的含噪观测。具体而言，对每个测量，幅度噪声由加性项建模：

$$
y_m=\mathrm{RSS}(\mathbf p_m)+n_m,\tag{18}
$$

其中 \(\mathbf p_m\) 为未知真实采样位置，\(n_m\) 刻画聚合的测量不确定性，包括设备异构、上报误差以及传播模型未表示的残余小尺度起伏。由于隐私保护与用户移动，真实采样位置 \(\mathbf p_m\) 无法直接获得；网络只能观测上报坐标 \(\tilde{\mathbf p}_m\)，它与 \(\mathbf p_m\) 相差一个随机漂移。我们把该定位漂移建模为高斯扰动：

$$
\mathbf p_m=\tilde{\mathbf p}_m+\boldsymbol\delta_m,\qquad \boldsymbol\delta_m\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma_\delta),\tag{19}
$$

其中 \(\boldsymbol\Sigma_\delta\) 控制漂移尺度与各向异性。该漂移模型意味着每个 RSS 上报都关联着对底层 RM 的一个**不确定空间查询**。其结果是，感知算子不再仅由上报坐标确定，因为观测是在 \(\mathbf p_m\) 而非 \(\tilde{\mathbf p}_m\) 处生成的。这种算子不确定性叠加稀疏含噪感知，显著增加了 RM 估计的不适定性，并促使后续章节采用漂移感知的推断机制。

**图 1（原文 Fig. 1）：** 所提 RadioDiff-Inv2 在稀疏含噪测量与高斯定位漂移下的推断流水线总览。初始噪声种子作为优化变量，被送入以环境占据地图为条件的扩散骨干网络以生成密集无线电地图；一个可微后处理施加漂移感知的高斯重采样与空间掩蔽，以产生与上报坐标对齐的稀疏观测预测；预测与采集到的稀疏 RSS 测量之间的均方误差被反向传播以更新初始种子，从而在定位不确定性下得到既符合先验、又与测量一致的重建。图中模块依次为：I. 条件输入（建筑地图、稀疏 RSS、采样掩码、漂移 \(\boldsymbol\Sigma_\delta\) 与噪声 \(\sigma\)）；II. 粗重建（measurement、\(X_{\mathrm{coarse}}\)）；III. 隐变量（初始种子 \(z_0\)、基于梯度的更新、优化后的 \(z^{(N)}(z^*)\)）；IV. 条件扩散先验（Buildings Condition，U 形编码器—解码器）；V. 可微前向测量模型（加入噪声/定位漂移、\(\hat y_n\)、sparse measurement）；VI. 联合一致性优化（predicted sparse \(\hat y_n\)、observed sparse \(y\)、MSE loss 与损失曲线）；VII. 输出（rec.png、PSNR）。

### D. 问题表述

给定环境地图 \(\mathbf H\)、发射机配置、传播算子 \(\mathcal F(\cdot;\mathbf H)\) 与众包数据集 \(\mathcal D=\{(\tilde{\mathbf p}_m,y_m)\}_{m=1}^{M}\)，目标是在感兴趣区域上估计密集 RM \(\mathbf R\in\mathbb R^{N_x\times N_y}\)。RM 定义在网格 \(\mathcal G\) 上，\(R_{i,j}\) 表示与网格位置 \(\mathbf p_{i,j}\) 相关联的接收信号强度。对由 \(H_{i,j}=1\) 指示的建筑物占据单元，这些 RM 值不会被有效用户位置查询，因而在观测模型中由空间掩码排除。每个测量 \(y_m\) 在未知真实位置 \(\mathbf p_m\) 处生成，该位置以高斯漂移偏离上报坐标 \(\tilde{\mathbf p}_m\)，并进一步受加性测量噪声扰动。设 \(\mathcal S(\mathbf R,\mathbf p)\) 表示采样算子，它通过基于网格的查询规则返回连续坐标 \(\mathbf p\) 处的 RM 值。测量模型写为

$$
y_m=\mathcal S(\mathbf R,\mathbf p_m)+n_m,\qquad n_m\sim\mathcal N(0,\sigma_n^{2}),\tag{20}
$$

$$
\mathbf p_m=\tilde{\mathbf p}_m+\boldsymbol\delta_m,\qquad \boldsymbol\delta_m\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma_\delta),\tag{21}
$$

其中 \(\sigma_n^{2}\) 与 \(\boldsymbol\Sigma_\delta\) 假设已知或可由系统统计量估计。推断目标是：在对未知漂移变量边缘化之后，\(\mathbf R\) 在给定上报坐标与含噪 RSS 测量下的后验分布。设 \(p(\mathbf R)\) 表示 RM 上的先验分布。对每个测量，漂移边缘化似然通过对高斯漂移分布积分得到。由此得到如下漂移感知的最大后验表述。

**问题 1.**

$$
\max_{\mathbf R}\ \log p(\mathbf R)+\sum_{m=1}^{M}\log p(y_m\mid\mathbf R,\tilde{\mathbf p}_m),\tag{22}
$$

$$
\text{s.t.}\quad p(y_m\mid\mathbf R,\tilde{\mathbf p}_m)=\int p(y_m\mid\mathbf R,\tilde{\mathbf p}_m+\boldsymbol\delta)\,p(\boldsymbol\delta)\,d\boldsymbol\delta,\tag{22a}
$$

$$
p(y_m\mid\mathbf R,\tilde{\mathbf p}_m+\boldsymbol\delta)=\mathcal N\left(y_m;\mathcal S(\mathbf R,\tilde{\mathbf p}_m+\boldsymbol\delta),\sigma_n^{2}\right),\tag{22b}
$$

$$
p(\boldsymbol\delta)=\mathcal N(\boldsymbol\delta;\mathbf 0,\boldsymbol\Sigma_\delta).\tag{22c}
$$

问题 1 严重不适定：测量数远小于网格值数，而感知算子又因未知漂移而不确定。下一节发展一个推断框架，利用学习到的生成先验与可微的漂移感知测量机制来高效求解上述表述。

## IV. RadioDiff-Inv2 框架

### A. 先验适配

所提框架建立在 RadioDiff 的去噪骨干之上，并保留其核心架构原则。具体而言，我们复用相同的多尺度 U 形去噪器（带时间相关嵌入与层次化特征融合），使模型保留从大规模无线电地图数据中习得的强大生成能力。前向扩散调度与标准噪声预测训练目标也保持不变，从而确保适配后的模型在所考虑的环境类别内仍是有效的 RM 扩散先验。

关键修改在于条件接口。RadioDiff 被训练为完全条件扩散模型，其去噪器由两个空间条件通道引导，分别编码环境占据与发射机位置。然而，在众包感知的 RM 估计中，发射机位置常因元数据访问受限与隐私约束而对网络不可得。此外，当环境与发射机位置均已知时，RM 在很大程度上由基于物理的传播建模决定，稀疏 RSS 测量对恢复该场所能提供的额外信息有限。这促使我们采用一种不依赖显式发射机位置条件的推断先验，使其可作为面向特定环境的 RM 先验。

为在保持网络接口不变的同时实现发射机无关的条件化，我们把发射机位置条件通道替换为环境占据地图的复制副本。结果，去噪器仍接收两个与 RadioDiff 维数相同的空间条件通道，但条件语义变为**仅环境**。该设计产生一个特定于给定环境布局、却独立于发射机位置输入的扩散先验，因而与后续不假设发射机信息可用的反演阶段兼容。

适配采用轻量微调完成。去噪骨干保持固定，仅更新与条件相关的模块，包括条件编码器以及把条件特征注入去噪器的各层。把这些参数更新限制在这些组件上，使适配后的模型能将其条件通路与新的仅环境语义对齐，同时大体保留预训练生成先验。这显著降低训练成本，并避免从头重训扩散模型。

### B. 确定性映射

设 \(\mathbf R\in\mathbb R^{N_x\times N_y}\) 表示网格上的目标 RM，\(\mathbf H\) 表示在先前适配后被用作条件的环境占据地图。我们把逆时间扩散生成视为固定条件下从初始种子到最终 RM 的确定性映射。具体而言，考虑具有递减时间索引集合 \(\mathcal T=\{t_K>t_{K-1}>\cdots>t_1>t_0\}\) 的确定性采样器，其中 \(t_K\) 对应噪声最大的状态，\(t_0\) 对应最终输出。给定从标准高斯分布抽取的初始种子 \(\mathbf z\)，采样器通过重复施加确定性更新规则产生序列 \(\{\mathbf x_{t_k}\}_{k=0}^{K}\)：

$$
\mathbf x_{t_{k-1}}=\Phi_{t_k\to t_{k-1}}(\mathbf x_{t_k};\mathbf H),\qquad k=1,2,\ldots,K,\tag{23}
$$

其中 \(\Phi_{t_k\to t_{k-1}}(\cdot)\) 由去噪器预测与所选确定性轨迹定义。整个逆向过程因此是确定性变换的复合：

$$
\mathcal R=\mathcal R(\mathbf z;\mathbf H)=\Phi_{t_1\to t_0}\circ\Phi_{t_2\to t_1}\circ\cdots\circ\Phi_{t_K\to t_{K-1}}(\mathbf z;\mathbf H),\tag{24}
$$

这意味着，对固定环境条件 \(\mathbf H\) 与固定网络参数，生成的 RM 由种子 \(\mathbf z\) 唯一确定。一个具体实现使用确定性常微分方程（ODE）轨迹，得到无逐步随机噪声注入的采样路径。此时逆时间演化由 ODE 支配，其漂移项由学习到的得分或噪声预测器参数化，最终地图由终端时刻的 ODE 解给出。作为替代，也可使用确定性离散时间采样器：每次更新从当前含噪状态计算干净样本的估计，然后确定性地推进到下一时间层。两种选择都导致反演所需的同一本质性质，即映射 \(\mathbf z\mapsto\mathcal R(\mathbf z;\mathbf H)\) 是确定性的，且关于种子**几乎处处可微**。

**算法 1　RadioDiff-Inv2 高斯定位漂移下的反演**

```text
输入: 环境地图 H；测量 D = {(p̃_m, y_m)}_{m=1}^M；漂移协方差 Σ_δ；RSS 噪声方差 σ_n²
输入: 确定性生成器 R(·;H)；重采样算子 T_δ(·)；采样算子 S(·,·)
输入: 种子更新步数 K；漂移样本数 S；步长 {η_k}_{k=0}^{K−1}
输出: 估计的 RM R̂
1: 初始化种子 z^(0) ~ N(0, I)
2: for k = 0 to K−1 do
3:     R^(k) ← R(z^(k); H)
4:     L ← 0
5:     for m = 1 to M do
6:         ℓ_m ← 0
7:         for s = 1 to S do
8:             采样漂移 δ_m^(s) ~ N(0, Σ_δ)
9:             R_m^(k,s) ← T_{δ_m^(s)}(R^(k))
10:            ŷ_m^(k,s) ← S(R_m^(k,s), p̃_m)（并按 H 施加自由空间掩蔽）
11:            ℓ_m ← ℓ_m + 1/(2σ_n²) (y_m − ŷ_m^(k,s))²
12:        end for
13:        L ← L + (1/S) ℓ_m
14:    end for
15:    g^(k) ← 经 S、T_δ 与 R 反向传播求得的 ∇_z L
16:    z^(k+1) ← z^(k) − η_k g^(k)
17:    if 满足停止准则 then
18:        break
19:    end if
20: end for
21: R̂ ← R(z^(k+1); H)
22: return R̂
```

这种确定性映射使逆问题的**种子空间重参数化**成为可能。我们不再在手设计正则下直接优化高维 RM \(\mathbf R\)，而是通过写 \(\mathbf R=\mathcal R(\mathbf z;\mathbf H)\) 把搜索限制在生成映射的值域内，并优化种子变量：

$$
\hat{\mathbf z}=\arg\min_{\mathbf z}\ \mathcal L_{\mathrm{data}}\left(\mathcal M(\mathcal R(\mathbf z;\mathbf H)),\mathbf y\right),\qquad \hat{\mathbf R}=\mathcal R(\hat{\mathbf z};\mathbf H),\tag{25}
$$

其中 \(\mathbf y\) 表示稀疏含噪测量，\(\mathcal M(\cdot)\) 表示将在漂移感知设置中具体说明的前向测量算子。由于扩散先验嵌入在生成器值域中，所得估计被促使保持先验合理，同时目标函数强制测量一致性。种子空间优化的另一个好处是，避免了在去噪动力学与外部校正操作之间交替的逐步干预。逆向采样器保持完整并被当作固定可微函数，而测量约束通过优化目标全局施加。这种分离降低了中间时间步的局部校正扰乱生成轨迹的风险，并通过确定性映射 \(\mathcal R(\cdot;\mathbf H)\) 提供从测量损失到种子的稳定梯度通路。

### C. 高斯重采样

定位漂移意味着每个上报坐标只是真实感知位置的不精确代理。设 \(\tilde{\mathbf p}_m\) 表示第 \(m\) 个 RSS 上报的上报坐标，\(\mathbf p_m\) 表示未知的真实感知位置。在高斯漂移模型下，\(\mathbf p_m\) 以由漂移统计量确定的协方差分布在 \(\tilde{\mathbf p}_m\) 周围。因此，测量一致性不能通过在 \(\tilde{\mathbf p}_m\) 处直接查询重建 RM 来强制；相反，观测应与在由漂移引起的不确定空间查询处求值的 RM 保持一致。这促使一种相对于重建 RM 可微、并可与确定性扩散映射复合以进行端到端反演的漂移感知测量算子。

设 \(\mathbf R\) 为基于网格的 RM，\(\mathcal S(\mathbf R,\mathbf p)\) 表示通过网格上的双线性插值返回连续坐标 \(\mathbf p\) 处 RM 值的采样算子。对给定漂移实现 \(\boldsymbol\delta\)，与 \(\tilde{\mathbf p}_m\) 相关联的预测测量为 \(\mathcal S(\mathbf R,\tilde{\mathbf p}_m+\boldsymbol\delta)\)。漂移感知一致性通过对漂移分布边缘化得到，从而对每个上报得到漂移边缘化似然。由于对一般 RM 该边缘化没有闭式解，我们用蒙特卡洛采样近似。在每次反演迭代中，从高斯漂移分布抽取 \(S\) 个独立漂移样本 \(\{\boldsymbol\delta_m^{(s)}\}_{s=1}^{S}\)，并通过对逐样本负对数似然取平均形成漂移感知数据项：

$$
\mathcal L_{\mathrm{drift}}(\mathbf R)=\sum_{m=1}^{M}\frac{1}{S}\sum_{s=1}^{S}\ell\left(y_m,\mathcal S\left(\mathbf R,\tilde{\mathbf p}_m+\boldsymbol\delta_m^{(s)}\right)\right),\tag{26}
$$

其中 \(\ell(\cdot,\cdot)\) 依据 RSS 噪声模型选取，例如与高斯幅度噪声一致的加权平方误差。当采样算子可微时，该构造给出关于 \(\mathbf R\) 的**无偏梯度估计器**，使反向传播可穿过漂移感知数据项。

为在网格上高效实现 \(\mathcal S(\mathbf R,\tilde{\mathbf p}_m+\boldsymbol\delta)\)，我们采用重采样视角。在漂移坐标处对 \(\mathbf R\) 求值，等价于对整幅地图施加空间移位，然后在上报坐标处采样。因此我们定义可微重采样算子 \(\mathcal T_{\boldsymbol\delta}(\cdot)\)，它用双线性插值产生移位后的地图 \(\mathbf R_{\boldsymbol\delta}=\mathcal T_{\boldsymbol\delta}(\mathbf R)\)。预测测量随后可写为 \(\mathcal S(\mathbf R_{\boldsymbol\delta},\tilde{\mathbf p}_m)\)。实践中，重采样通过基于网格的双线性插值实现，对固定移位而言它关于输入 RM 是线性的。因此，损失关于 \(\mathbf R\) 的梯度按相同双线性权重被分配到每个采样位置的四个相邻像素。该性质提供稳定梯度，并避免反演期间出现不可微的索引操作。

该漂移感知算子进一步与环境占据地图 \(\mathbf H\) 耦合以保证物理可行性。我们把有效感知位置限制在自由空间单元，并排除建筑占据单元对预测测量的贡献。这通过在采样期间施加由 \(\mathbf H\) 导出的空间掩码、并在邻域与遮挡单元重叠时重新归一化插值权重来实现，使算子保持数值一致，且预测 RSS 不被无效区域污染。借助该漂移感知可微测量算子，反演目标可通过反向传播穿过确定性扩散映射进行优化，从而在稀疏感知与高斯定位漂移下强制测量一致性。

### D. 反演算法

现在我们给出端到端可微反演流程，它结合了发射机无关的扩散先验、确定性逆映射与漂移感知高斯重采样算子。关键重参数化是把未知 RM 表示为受种子变量驱动的确定性生成器输出。设 \(\mathbf z\) 表示初始种子，\(\mathcal R(\mathbf z;\mathbf H)\) 表示环境条件 \(\mathbf H\) 下的确定性逆映射。估计的 RM 写为

$$
\mathbf R=\mathcal R(\mathbf z;\mathbf H).\tag{27}
$$

该参数化把搜索空间限制在与学习到的扩散先验一致的 RM 上，同时把种子 \(\mathbf z\) 留作可通过适配以匹配测量的优化变量。

设 \(\mathcal D=\{(\tilde{\mathbf p}_m,y_m)\}_{m=1}^{M}\) 为稀疏众包数据集，\(\sigma_n^{2}\) 表示 RSS 噪声方差。漂移感知测量一致性通过对高斯漂移的蒙特卡洛边缘化施加。每次迭代抽取 \(S\) 个独立漂移样本 \(\boldsymbol\delta_m^{(s)}\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma_\delta)\)，并定义漂移感知数据保真项

$$
\mathcal L_{\mathrm{data}}(\mathbf z)=\sum_{m=1}^{M}\sum_{s=1}^{S}\frac{1}{2S\sigma_n^{2}}\left(y_m-\mathcal S\left(\mathcal T_{\boldsymbol\delta_m^{(s)}}\left(\mathcal R(\mathbf z;\mathbf H)\right),\tilde{\mathbf p}_m\right)\right)^{2},\tag{28}
$$

其中 \(\mathcal T_{\boldsymbol\delta}(\cdot)\) 表示按漂移实现移位 RM 的双线性重采样算子，\(\mathcal S(\cdot,\tilde{\mathbf p}_m)\) 表示返回上报坐标处预测 RSS 的基于网格采样算子。环境占据地图 \(\mathbf H\) 用于在采样期间掩蔽无效区域，使测量只与自由空间位置匹配。

反演通过关于种子变量最小化 (28) 完成：

$$
\hat{\mathbf z}=\arg\min_{\mathbf z}\ \mathcal L_{\mathrm{data}}(\mathbf z),\qquad \hat{\mathbf R}=\mathcal R(\hat{\mathbf z};\mathbf H).\tag{29}
$$

\(\mathcal L_{\mathrm{data}}\) 关于 \(\mathbf z\) 的梯度通过完整计算图反向传播获得。特别地，梯度从测量残差出发，穿过采样算子、双线性重采样算子，再穿过由扩散采样器实现的确定性逆映射。这种端到端可微性对于在不修改逆向动力学本身的前提下强制漂移感知一致性至关重要。

在算法上，该过程在确定性生成与种子更新之间迭代。从初始化 \(\mathbf z^{(0)}\sim\mathcal N(\mathbf 0,\mathbf I)\) 出发，每次迭代生成 RM \(\mathbf R^{(k)}=\mathcal R(\mathbf z^{(k)};\mathbf H)\)，用 \(S\) 个漂移样本评估漂移感知数据保真项，并用一阶方法更新种子：

$$
\mathbf z^{(k+1)}=\mathbf z^{(k)}-\eta_k\nabla_{\mathbf z}\mathcal L_{\mathrm{data}}\left(\mathbf z^{(k)}\right),\tag{30}
$$

其中 \(\eta_k\) 为步长。当损失改进可忽略或达到最大迭代次数时算法终止，并输出 \(\hat{\mathbf R}\)。该推断策略有两个实践优势。第一，避免为每种感知配置重新训练扩散模型。以稀疏测量图为条件训练扩散模型，会把模型绑定到特定的采样密度、采样几何、噪声水平与漂移尺度分布；当这些因素变化时，条件输入可能大幅偏离训练分布，导致泛化不稳定。相反，所提反演保持扩散先验固定，把感知变化吸收到漂移感知数据项与算子中，提升了对异构众包区制的适应性。第二，推断成本可由两个旋钮控制，即用于评估 \(\mathcal R(\cdot;\mathbf H)\) 的确定性采样步数，以及 (28) 中使用的漂移样本数 \(S\)。减少其中任一量都会降低时延，而由此产生的精度权衡可在评估章节中经验刻画。

## V. 实验结果

### A. 实验设置

我们在 **RadioMapSeer** 数据集 [30] 上开展实验，该数据集包含 701 个建筑布局各异的城市环境拓扑。其中 600 个环境用于训练扩散先验，其余 101 个环境完全留作测试。每个环境由二值占据地图 \(\mathbf H\in\{0,1\}^{N_x\times N_y}\) 及由基于物理的传播仿真器生成的一组真值无线电地图表示。该数据集为在异构传播条件下评估 RM 估计提供了多样且贴近真实的基准。

我们把 RadioDiff-Inv2 与三个代表性基线进行比较，它们覆盖经典、基于学习与生成式三类估计范式：

- **Kriging [27]**：基于高斯过程回归的经典空间插值方法，通过手工构造的协方差核施加平稳性与平滑性。它代表非参数统计估计器。
- **RadioUNet [30]**：卷积编码器—解码器网络，学习从稀疏测量与环境上下文到密集 RM 的直接映射。它代表基于监督学习的重建范式。
- **RME-GAN [32]**：用于 RM 估计的条件生成对抗网络，通过对抗训练锐化阴影边界与高频细节。它代表基于 GAN 的生成式估计范式。
- **RadioDiff-Inv1 [5]**：扩散增强的贝叶斯逆向估计框架，使用无条件生成扩散模型。

我们采用四项互补指标以全面评估重建保真度。

- **PSNR**（Peak Signal-to-Noise Ratio，峰值信噪比，dB）：衡量像素级重建精度，越高越好。
- **SSIM**（Structural Similarity Index，结构相似性指数）：评估感知结构相似性，越高越好。
- **LPIPS**（Learned Perceptual Image Patch Similarity，学习感知图像块相似度）：通过深层特征刻画高层感知质量，越低越好。
- **NMSE**（Normalized Mean Squared Error，归一化均方误差）：量化信号功率上的相对重建误差，越低越好。

除非另有说明，实验采用默认采样率 \(k_p=0.05\)、信噪比 \(\mathrm{SNR}=5\) dB 以及协方差 \(\boldsymbol\Sigma_\delta=0.8\) 的高斯定位漂移。通过每次只改变一个因素开展三组受控实验：(i) 采样率 \(k_p\in\{0.005,0.01,0.05,0.1\}\)；(ii) 测量 SNR \(\in\{0,1,5,10\}\) dB；(iii) 漂移尺度 \(\boldsymbol\Sigma_\delta\in\{0.0,0.8,1.6,2.4,3.2\}\)。

**表 I（原文 TABLE I）：不同采样率、SNR 与 \(\Sigma_\delta\) 设置下的 PSNR 比较（越高越好）。** 每行最优结果**加粗**，次优结果以*斜体*表示（原文为下划线）；相对增益按 (最优 − 次优)/次优 计算。

| 设置 | RadioDiff-Inv2（本文） | RadioDiff-Inv1 | Kriging | RadioUNet | RME-GAN |
|---|---|---|---|---|---|
| **采样率（SNR=5，Σδ=0.8）** | | | | | |
| kp=0.005 | **23.8166（+18.92%）** | 16.4509 | *20.0272* | 18.4192 | 18.6240 |
| kp=0.01 | **25.9965（+31.46%）** | 17.5264 | *19.7745* | 18.3819 | 18.0740 |
| kp=0.05 | **31.3158（+33.38%）** | *23.4786* | 21.3934 | 16.5840 | 17.2337 |
| kp=0.1 | **35.2599（+35.19%）** | *26.0809* | 20.8388 | 14.7310 | 17.6324 |
| **SNR（kp=0.05，Σδ=0.8）** | | | | | |
| SNR=0 | **31.3326（+35.18%）** | *23.1789* | 16.3286 | 9.8380 | 10.3833 |
| SNR=1 | **31.3401（+34.32%）** | *23.3322* | 17.2021 | 11.1680 | 11.6925 |
| SNR=5 | **31.3330（+33.28%）** | *23.5085* | 21.4634 | 16.5840 | 17.2337 |
| SNR=10 | **31.3377（+29.11%）** | 23.5789 | 22.6505 | 21.9962 | *24.2726* |
| **Σδ（kp=0.05，SNR=5）** | | | | | |
| Σδ=0.0 | **35.6778（+52.35%）** | *23.4182* | 21.3606 | 16.5753 | 17.2537 |
| Σδ=0.8 | **31.3414（+32.89%）** | *23.5850* | 21.5808 | 16.5840 | 17.2337 |
| Σδ=1.6 | **30.2325（+30.26%）** | *23.2091* | 21.3757 | 16.5210 | 17.1866 |
| Σδ=2.4 | **29.3789（+25.04%）** | *23.4959* | 21.3979 | 16.3748 | 17.2023 |
| Σδ=3.2 | **29.1051（+24.43%）** | *23.3902* | 21.1048 | 16.3402 | 17.2325 |

**表 II（原文 TABLE II）：不同采样率、SNR 与 \(\Sigma_\delta\) 设置下的 SSIM 比较（越高越好）。** 每行最优结果**加粗**，次优结果以*斜体*表示（原文为下划线）；相对增益按 (最优 − 次优)/次优 计算。

| 设置 | RadioDiff-Inv2（本文） | RadioDiff-Inv1 | Kriging | RadioUNet | RME-GAN |
|---|---|---|---|---|---|
| **采样率（SNR=5，Σδ=0.8）** | | | | | |
| kp=0.005 | **0.8817（+12.95%）** | 0.5405 | 0.7262 | 0.6431 | *0.7806* |
| kp=0.01 | **0.8982（+19.94%）** | 0.5524 | 0.6670 | 0.6045 | *0.7489* |
| kp=0.05 | **0.9250（+17.54%）** | *0.7869* | 0.5425 | 0.4898 | 0.7210 |
| kp=0.1 | **0.9481（+10.77%）** | *0.8559* | 0.4407 | 0.4112 | 0.7228 |
| **SNR（kp=0.05，Σδ=0.8）** | | | | | |
| SNR=0 | **0.9250（+21.32%）** | *0.7624* | 0.4408 | 0.2778 | 0.5123 |
| SNR=1 | **0.9249（+19.08%）** | *0.7767* | 0.4573 | 0.3151 | 0.5557 |
| SNR=5 | **0.9250（+17.72%）** | *0.7857* | 0.5424 | 0.4898 | 0.7210 |
| SNR=10 | **0.9249（+7.96%）** | 0.7897 | 0.6157 | 0.6677 | *0.8567* |
| **Σδ（kp=0.05，SNR=5）** | | | | | |
| Σδ=0.0 | **0.9628（+22.60%）** | *0.7853* | 0.5420 | 0.4939 | 0.7239 |
| Σδ=0.8 | **0.9250（+17.26%）** | *0.7889* | 0.5473 | 0.4898 | 0.7210 |
| Σδ=1.6 | **0.9198（+17.67%）** | *0.7817* | 0.5436 | 0.4855 | 0.7199 |
| Σδ=2.4 | **0.9126（+15.81%）** | *0.7880* | 0.5444 | 0.4787 | 0.7196 |
| Σδ=3.2 | **0.9114（+16.46%）** | *0.7826* | 0.5410 | 0.4748 | 0.7186 |

**表 III（原文 TABLE III）：不同采样率、SNR 与 \(\Sigma_\delta\) 设置下的 LPIPS 比较（越低越好）。** 每行最优结果**加粗**，次优结果以*斜体*表示（原文为下划线）；相对增益按 (次优 − 最优)/次优 计算。

| 设置 | RadioDiff-Inv2（本文） | RadioDiff-Inv1 | Kriging | RadioUNet | RME-GAN |
|---|---|---|---|---|---|
| **采样率（SNR=5，Σδ=0.8）** | | | | | |
| kp=0.005 | **0.0613（−57.13%）** | 0.3695 | 0.1941 | 0.2762 | *0.1430* |
| kp=0.01 | **0.0477（−69.68%）** | 0.3451 | 0.2514 | 0.3004 | *0.1573* |
| kp=0.05 | **0.0286（−81.37%）** | *0.1535* | 0.4045 | 0.3782 | 0.1633 |
| kp=0.1 | **0.0185（−79.30%）** | *0.0894* | 0.5128 | 0.4479 | 0.1662 |
| **SNR（kp=0.05，Σδ=0.8）** | | | | | |
| SNR=0 | **0.0284（−83.32%）** | *0.1702* | 0.4631 | 0.5670 | 0.2785 |
| SNR=1 | **0.0285（−82.93%）** | *0.1669* | 0.4642 | 0.5303 | 0.2486 |
| SNR=5 | **0.0285（−82.44%）** | *0.1623* | 0.4004 | 0.3782 | 0.1633 |
| SNR=10 | **0.0285（−72.62%）** | 0.1529 | 0.3204 | 0.2535 | *0.1041* |
| **Σδ（kp=0.05，SNR=5）** | | | | | |
| Σδ=0.0 | **0.0178（−88.64%）** | *0.1566* | 0.4069 | 0.3742 | 0.1625 |
| Σδ=0.8 | **0.0285（−81.78%）** | *0.1564* | 0.4013 | 0.3782 | 0.1633 |
| Σδ=1.6 | **0.0316（−79.58%）** | *0.1548* | 0.4015 | 0.3804 | 0.1648 |
| Σδ=2.4 | **0.0335（−77.28%）** | *0.1474* | 0.4048 | 0.3848 | 0.1653 |
| Σδ=3.2 | **0.0362（−76.87%）** | *0.1565* | 0.4052 | 0.3881 | 0.1632 |

**表 IV（原文 TABLE IV）：不同采样率、SNR 与 \(\Sigma_\delta\) 设置下的 NMSE 比较（越低越好）。** 每行最优结果**加粗**，次优结果以*斜体*表示（原文为下划线）；相对增益按 (次优 − 最优)/次优 计算。

| 设置 | RadioDiff-Inv2（本文） | RadioDiff-Inv1 | Kriging | RadioUNet | RME-GAN |
|---|---|---|---|---|---|
| **采样率（SNR=5，Σδ=0.8）** | | | | | |
| kp=0.005 | **0.066586（−34.65%）** | 0.243266 | 0.104454 | 0.139334 | *0.101889* |
| kp=0.01 | **0.041929（−64.12%）** | 0.196484 | 0.150055 | 0.140056 | *0.116849* |
| kp=0.05 | **0.010989（−78.93%）** | *0.052166* | 0.075258 | 0.212081 | 0.140124 |
| kp=0.1 | **0.004001（−86.62%）** | *0.029898* | 0.085048 | 0.322920 | 0.128131 |
| **SNR（kp=0.05，Σδ=0.8）** | | | | | |
| SNR=0 | **0.010990（−80.24%）** | *0.055630* | 0.236122 | 1.002096 | 0.674556 |
| SNR=1 | **0.010984（−79.85%）** | *0.054514* | 0.197904 | 0.736565 | 0.499116 |
| SNR=5 | **0.010989（−79.15%）** | *0.052716* | 0.072380 | 0.212081 | 0.140124 |
| SNR=10 | **0.010987（−60.85%）** | 0.050245 | 0.066463 | 0.061498 | *0.028066* |
| **Σδ（kp=0.05，SNR=5）** | | | | | |
| Σδ=0.0 | **0.003916（−92.61%）** | *0.052986* | 0.078509 | 0.211420 | 0.139272 |
| Σδ=0.8 | **0.010986（−78.54%）** | *0.051193* | 0.070276 | 0.212081 | 0.140124 |
| Σδ=1.6 | **0.013278（−75.90%）** | *0.055088* | 0.077801 | 0.215149 | 0.141853 |
| Σδ=2.4 | **0.014795（−71.52%）** | *0.051948* | 0.076699 | 0.222143 | 0.141316 |
| Σδ=3.2 | **0.016698（−69.02%）** | *0.053901* | 0.090516 | 0.224014 | 0.139965 |

### B. 定量比较

表 I 至表 IV 报告了在固定 \(\mathrm{SNR}=5\) dB、\(\boldsymbol\Sigma_\delta=0.8\) 下改变采样率的结果。RadioDiff-Inv2 在全部四项指标与全部采样密度下始终取得最佳性能。

在 PSNR 方面，RadioDiff-Inv2 在 \(k_p=0.005\) 时比最佳竞争方法高 +18.92%，且该领先幅度随采样密度增加而显著增大，在 \(k_p=0.1\) 时达到 +69.20%。这一趋势表明，随着更多测量约束可用于锚定反演，学习到的扩散先验提供了越来越有效的引导。在 \(k_p=0.1\) 时，所提方法达到 35.26 dB，而 Kriging——该点上最强的竞争基线——为 20.84 dB，显示出超过 14 dB 的绝对增益。

在 SSIM 上观察到一致改进：差距从最稀疏设置的 +12.95% 上升到 \(k_p=0.1\) 时的 +31.17%，此时 RadioDiff-Inv2 取得 0.9481 的 SSIM，而 RME-GAN 为 0.7228。对 LPIPS，所提方法相对最佳基线把感知失真降低 57.13% 至 88.87%，且提升在较高采样率处最显著。对 NMSE，RadioDiff-Inv2 在 \(k_p=0.005\) 与 \(k_p=0.1\) 时分别带来 34.64% 与 95.26% 的降低，反映出在中高采样密度下接近精确的信号级重建。

值得注意的是，随着 \(k_p\) 增大，基线方法呈现收益递减或非单调。Kriging 与 RadioUNet 在较高采样率下 SSIM 反而下降，可能源于噪声放大与对不准确测量坐标的过拟合。相反，RadioDiff-Inv2 表现出稳健且单调的改进，受益于把解约束到物理可行 RM 流形上的强生成先验。

SNR 消融（\(k_p=0.05\)，\(\boldsymbol\Sigma_\delta=0.8\)）揭示了 RadioDiff-Inv2 最独特的优势。如表 I–IV 所示，RadioDiff-Inv2 的 PSNR 在所有 SNR 水平下几乎保持不变，从 \(\mathrm{SNR}=0\) 到 \(\mathrm{SNR}=10\) 一直维持在 31.33 dB 附近。这种近乎恒定的行为与在低 SNR 下迅速退化的基线形成鲜明对比。

在 \(\mathrm{SNR}=0\) dB 时，Kriging、RadioUNet 与 RME-GAN 分别取得 16.33、9.84 与 10.38 dB 的 PSNR——相对其 \(\mathrm{SNR}=10\) dB 的性能下降超过 6 dB。相反，RadioDiff-Inv2 在 \(\mathrm{SNR}=0\) 时保持 31.33 dB 的 PSNR，相对最佳基线取得 +91.89% 的增益。\(\mathrm{SNR}=0\) 时 SSIM 提升达到 +80.56%（0.9250 对 0.5123），NMSE 降低 95.36%。

这种低 SNR 下的鲁棒性源于扩散先验的隐式正则化效应。学习到的生成模型把重建约束在物理真实 RM 的流形上，有效地把重建质量与测量噪声强度解耦。当噪声很高时，测量数据几乎不携带有用信息，先验成为决定重建场的主导因素。对仅依赖插值或回归的传统方法，高噪声会污染锚点，导致严重退化；对 RadioDiff-Inv2，种子空间优化在适配可用信号的同时，生成先验阻止估计发散到噪声主导的解。

表 I 至表 IV 报告了在 \(k_p=0.05\)、\(\mathrm{SNR}=5\) dB 下改变漂移尺度的性能，\(\boldsymbol\Sigma_\delta\) 从 0.0（无漂移）到 3.2（严重漂移）。

在 \(\boldsymbol\Sigma_\delta=0.0\) 时，RadioDiff-Inv2 达到 35.68 dB PSNR 与 0.9628 SSIM，相对最佳基线分别提升 +67.03% 与 +33.00%。当漂移增大到 \(\boldsymbol\Sigma_\delta=3.2\) 时，RadioDiff-Inv2 的 PSNR 从 35.68 温和下降到 29.11 dB——相对降幅仅 6.6 dB——而基线方法表现出相近的绝对性能，但相对退化大得多。相对最佳竞争者的 PSNR 优势在所有漂移水平下保持在 +37.30% 以上。类似地，RadioDiff-Inv2 的 SSIM 随 \(\boldsymbol\Sigma_\delta\) 增大从 0.9628 平缓退化到 0.9114，而 Kriging 与 RadioUNet 的竞争性 SSIM 值分别保持在 0.55 与 0.49 以下。

这种随漂移增加的平缓退化归因于漂移感知高斯重采样算子：它近似漂移边缘化似然，并使梯度穿过坐标不确定性传播。结果，即使单个测量严重失配，反演目标仍保持信息量；而在固定上报坐标处查询场的方法会随漂移幅度增大而累积偏差。

### C. 视觉比较

图 2–4 给出三种实验条件下的定性比较。

在默认设置（\(k_p=0.05\)，\(\mathrm{SNR}=5\)，\(\boldsymbol\Sigma_\delta=0.8\)，图 2）下，稀疏测量图（最左列）只包含零散的点观测，使重建问题严重欠定。RME-GAN 产生具有建筑级锐利结构的重建，但引入了真值中不存在的虚假热点与颜色伪影。RadioUNet 输出模糊，在建筑边缘与遮挡区域附近的信号强度梯度不正确。Kriging 产生过度平滑的估计，无法恢复细致的传播结构。相反，RadioDiff-Inv2 准确重建了大尺度阴影模式与建筑边界附近的精细空间过渡，在所有四个测试样本上都与真值高度吻合。在高 SNR（\(\mathrm{SNR}=10\)，图 3）下，基线在大尺度场恢复上有适度改进，但仍存在局部伪影。RadioDiff-Inv2 保持精确的重建质量，并继续正确捕获锐利的阴影边缘与传播走廊，表明即使测量质量良好，其优势依然存在。在高斯定位漂移（\(\boldsymbol\Sigma_\delta=0.8\)，图 4）下，坐标不确定性的影响变得明显：RME-GAN 与 RadioUNet 在预测与真值传播模式之间出现空间失配，部分样本的场方向不正确。Kriging 产生模糊输出，对错误测量位置做了平均。RadioDiff-Inv2 未表现出可见失配，证实漂移边缘化反演有效补偿了坐标不确定性，并产生与真实无线电传播场在几何上一致的重建。总体而言，视觉比较印证了定量结果，并凸显 RadioDiff-Inv2 在恢复精细空间结构、抑制噪声与漂移引起的伪影方面的定性优势。

**图 2（原文 Fig. 2）：** 采样率 \(k_p=0.05\)、\(\mathrm{SNR}=5\)、\(\boldsymbol\Sigma_\delta=0.8\) 下的视觉比较（4 个随机样本）。各列依次为：Samples、RME-GAN、RadioUNet、Kriging、RadioDiff-Inv1、RadioDiff-Inv2（本文）、Ground Truth。

**图 3（原文 Fig. 3）：** \(\mathrm{SNR}=10\)、\(k_p=0.05\)、\(\boldsymbol\Sigma_\delta=0.8\) 下的视觉比较（列布局同图 2）。

**图 4（原文 Fig. 4）：** \(\boldsymbol\Sigma_\delta=0.8\)、\(k_p=0.05\)、\(\mathrm{SNR}=5\) 下的视觉比较（列布局同图 2）。

## VI. 结论

本文提出 RadioDiff-Inv2，一个可微扩散反演框架。它通过构造漂移边缘化数据保真目标并借助确定性概率流 ODE 优化潜噪声种子，解决了无线电地图估计中稀疏含噪测量与高斯定位漂移的联合挑战，从而把学习到的生成先验与物理一致、漂移感知的测量算子统一起来。在 RadioMapSeer 数据集上的大量实验表明，RadioDiff-Inv2 在所有评估条件下始终优于 Kriging、RadioUNet 与 RME-GAN，相对最佳竞争基线取得高达 14 dB 的 PSNR 增益与超过 95% 的 NMSE 降低，并在 0 至 10 dB 的 SNR 范围内保持近乎恒定的重建保真度。所提框架为 6G 网络中可靠的环境感知智能提供了一条实践路径：由隐私受限的众包反馈重建出的准确无线电地图，可直接增强覆盖规划、干扰协调与移动性感知资源管理。未来工作将探索把漂移感知反演扩展到三维无线电地图，并集成物理信息扩散先验，以进一步提升复杂多径传播环境中的重建精度。

## 参考文献（英文原条目）

[1] Z. Wang, J. Zhang, H. Du, D. Niyato, S. Cui, B. Ai, M. Debbah, K. B. Letaief, and H. V. Poor, "A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1560–1605, 2024.

[2] N. Cheng, F. Chen, W. Chen, Z. Cheng, Q. Yang, C. Li, and X. Shen, "6G omni-scenario on-demand services provisioning: vision, technology and prospect (in chinese)," Sci Sin Inform, vol. 54, pp. 1025–1054, 2024.

[3] X. Shen, J. Gao, M. Li, C. Zhou, S. Hu, M. He, and W. Zhuang, "Toward immersive communications in 6G," Frontiers Comput. Science, vol. 4, p. 1068478, 2023.

[4] S. Zhang and R. Zhang, "Radio map-based 3d path planning for cellular-connected uav," IEEE Trans. Wireless Commun., vol. 20, no. 3, pp. 1975–1989, 2020.

[5] X. Wang, Z. Fang, N. Cheng, R. Sun, Z. Li et al., "Radiodiff-inverse: Diffusion enhanced bayesian inverse estimation for isac radio map construction," arXiv preprint arXiv:2504.14298, 2025.

[6] K. Raivio, O. Simula, J. Laiho, and P. Lehtimaki, "Analysis of mobile radio access network using the self-organizing map," in IFIP/IEEE Eighth International Symposium on Integrated Network Management, 2003. IEEE, 2003, pp. 439–451.

[7] Y. Zeng and X. Xu, "Toward environment-aware 6G communications via channel knowledge map," IEEE Wireless Commun., vol. 28, no. 3, pp. 84–91, 2021.

[8] Ç. Yapar, S. Bakirtzis, A. Lutu, I. Wassell, J. Zhang, and G. Caire, "The sampling-assisted pathloss radio map prediction competition," in 2025 IEEE 35th International Workshop on Machine Learning for Signal Processing (MLSP). IEEE, 2025, pp. 1–6.

[9] Y. Ye and B. Wang, "Rmapcs: Radio map construction from crowdsourced samples for indoor localization," IEEE Access, vol. 6, pp. 24 224–24 238, 2018.

[10] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction," IEEE Trans. Cognit. Commun. Networking, Early Access, pp. 1–13, 2024.

[11] S. Yang, P. Dessai, M. Verma, and M. Gerla, "Freeloc: Calibration-free crowdsourced indoor localization," in 2013 Proceedings IEEE INFOCOM. IEEE, 2013, pp. 2481–2489.

[12] S. Venkatraman, J. Caffery, and H.-R. You, "Location using los range estimation in nlos environments," in Vehicular Technology Conference. IEEE 55th Vehicular Technology Conference. VTC Spring 2002 (Cat. No. 02CH37367), vol. 2. IEEE, 2002, pp. 856–860.

[13] B. L. Le, K. Ahmed, and H. Tsuji, "Mobile location estimator with nlos mitigation using kalman filtering," in 2003 IEEE Wireless Communications and Networking, 2003. WCNC 2003., vol. 3. IEEE, 2003, pp. 1969–1973.

[14] H. Chung, B. Sim, D. Ryu, and J. C. Ye, "Improving diffusion models for inverse problems using manifold constraints," Advances Neural Inf. Process. Syst., vol. 35, pp. 25 683–25 696, 2022.

[15] G. A. Deschamps, "Ray techniques in electromagnetics," Proc. IEEE, vol. 60, no. 9, pp. 1022–1035, 1972.

[16] S. Slijepcevic, S. Megerian, and M. Potkonjak, "Location errors in wireless embedded sensor networks: sources, models, and effects on applications," Acm Sigmobile Mobile Comput. Commun. Review, vol. 6, no. 3, pp. 67–78, 2002.

[17] K. Sato and T. Fujii, "Kriging-based interference power constraint: Integrated design of the radio environment map and transmission power," IEEE Trans. Cogn. Commun. Netw., vol. 3, no. 1, pp. 13–25, 2017.

[18] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, "Radiodiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction," IEEE J. Sel. Areas Commun., vol. 44, pp. 2318–2333, 2026.

[19] X. Wang, Q. Zhang, N. Cheng, J. Chen, Z. Zhang, Z. Li, S. Cui, and X. Shen, "Radiodiff-3d: A 3d×3d radio map dataset and generative diffusion based benchmark for 6g environment-aware communication," IEEE Trans. Netw. Sci. Eng., vol. 13, pp. 3773–3789, 2026.

[20] D. Romero, T. N. Ha, R. Shrestha, and M. Franceschetti, "Theoretical analysis of the radio map estimation problem," IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13 722–13 737, 2024.

[21] H. Chung, J. Kim, S. Kim, and J. C. Ye, "Parallel diffusion models of operator and image for blind inverse problems," in Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, 2023, pp. 6059–6069.

[22] X. Wang, P. Zheng, H. Jia, N. Cheng, R. Sun, C. Zhou, and X. Shen, "Radiodiff-flux: Efficient radio map construction via generative denoise diffusion model trajectory midpoint reuse," IEEE Trans. Cogn. Commun. Netw., vol. 12, pp. 4882–4895, 2026.

[23] X. Wang, Q. Zhang, and N. Cheng, "Radiodiff-loc: Diffusion model enhanced scattering congnition for nlos localization with sparse radio map estimation," arXiv preprint arXiv:2509.01875, 2025.

[24] S. Chen, S. Chewi, H. Lee, Y. Li, J. Lu, and A. Salim, "The probability flow ode is provably fast," Advances Neural Inf. Process. Syst., vol. 36, pp. 68 552–68 575, 2023.

[25] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," Advances Neural Inf. Process. Syst., vol. 33, pp. 6840–6851, 2020.

[26] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proceedings of the 2020 International Conference on Learning Representations (ICLR), 2020, pp. 1–12.

[27] X. Wang, Y. Pan, and N. Cheng, "A tutorial on learning-based radio map construction: Data, paradigms, and physics-awarenes," arXiv preprint arXiv:2603.17499, 2026.

[28] Y. Zhang and S. Wang, "K-nearest neighbors gaussian process regression for urban radio map reconstruction," IEEE Commun. Lett., vol. 26, no. 12, pp. 3049–3053, 2022.

[29] A. Chaves-Villota and C. A. Viteri-Mera, "Deeprem: Deep-learning-based radio environment map estimation from sparse measurements," IEEE Access, vol. 11, pp. 48 697–48 714, 2023.

[30] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[31] Y. Zhou, A. Wijesinghe, Y. Ma, S. Zhang, and Z. Ding, "Tire-gan: Task-incentivized generative learning for radiomap estimation," IEEE Wireless Commun. Lett., 2025.

[32] S. Zhang, A. Wijesinghe, and Z. Ding, "RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet Things J., vol. 10, no. 20, pp. 18 016–18 027, 2023.

[33] Y. Li, C. Zhang, W. Wang, and Y. Huang, "Rmtransformer: Accurate radio map construction and coverage prediction," in 2025 IEEE 101st Vehicular Technology Conference (VTC2025-Spring). IEEE, 2025, pp. 1–5.

[34] C. Deng, N. Liu, W. Xie, L. Xu, and L. Wang, "Mars: Radio map super-resolution and reconstruction method under sparse channel measurements," arXiv preprint arXiv:2506.04682, 2025.

[35] Z. Fang, K. Liu, K. Chen, Q. Liu, J. Zhang, L. Song, and Y. Wang, "Radioformer: A multiple-granularity radio map estimation transformer with 1\textpertenthousand spatial sampling," arXiv preprint arXiv:2504.19161, 2025.

[36] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, "Radiogat: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks," IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 17 777–17 792, 2024.

[37] H. Jia, W. Chen, Z. Huang, L. Wang, H. Xiao, N. Jia, K. Wu, S. Lai, B. Tian, and Y. Yue, "Physics-informed representation alignment for sparse radio-map reconstruction," in Proceedings of the 33rd ACM International Conference on Multimedia, 2025, pp. 12 352–12 360.

[38] X. Wang, T. Yuan, Y. Cao, N. Cheng, R. Sun, and W. Zhuang, "iradiodiff: Physics-informed diffusion model for indoor radio map construction and localization," arXiv preprint arXiv:2511.20015, 2025.

[39] H. Jia, W. Chen, X. Wang, N. Cheng, H. Zhang, K. Yu, S. Lai, N. Jia, B. Tian, H. Xiao et al., "Radioflow: Efficient radio map construction framework with flow matching," arXiv preprint arXiv:2510.09314, 2025.

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、索引词（Index Terms）、第 I–VI 节及全部小节（§II-A–B、§III-A–D、§IV-A–D、§V-A–C）、式 (1)–(30)（含 (22a)–(22c)）、算法 1（22 行逐行）、表 I–IV（各 13 行数据，逐格转写并与 PDF 渲染页 4× 放大图像核对）、图 1–4 图注（图 1 管线总览含 I–VII 模块与图内标注；图 2–4 为 7 列视觉比较）、参考文献 [1]–[39]（英文原条目）。原文无附录、无定理/命题环境。**表格渲染说明：** 原文表注规定每行最优加粗、次优加下划线；Markdown 无法稳定渲染下划线，本页用**加粗**表示最优、*斜体*表示次优（等价于原文下划线），并在各表注中说明；表内数字全部照抄原文（含相对增益括号值）。**已知缺陷与核对疑点（重点）：** ① 表 I 中 \(k_p=0.005\) 时本文 23.8166 对实际次优（Kriging）20.0272，绝对增益 **3.7894 dB**；\(k_p=0.1\) 时 35.2599 对实际次优（RadioDiff-Inv1）26.0809，绝对增益 **9.1790 dB**（表注相对增益 +35.19%）。② 但 §V-B 正文称 \(k_p=0.1\) 时"Kriging——该点上最强的竞争基线——为 20.84 dB，显示出超过 14 dB 的绝对增益"，与表 I 不符：该行最强竞争基线应为 RadioDiff-Inv1（26.0809 dB）；35.2599 与 20.8388 之差 14.42 dB 并非相对最佳竞争者的增益。正文"margin … reaching +69.20% at \(k_p=0.1\)"也是相对 Kriging 20.8388 计算，与表 I 该行标注的 +35.19% 不一致。③ 摘要称"比最佳竞争基线高 4 至 14 dB"，但按表 I，相对实际次优的绝对增益在 \(k_p=0.005\) 处仅 3.79 dB（<4 dB）；14 dB 仅在 \(k_p=0.1\) 处相对 Kriging 成立。贡献 4)"0 dB SNR 下超过 15 dB PSNR 增益与超过 0.41 SSIM 提升"中，15 dB 与 0.41 分别只相对 Kriging（16.3286 dB）与 RME-GAN（0.5123 SSIM）成立；相对实际最佳基线 RadioDiff-Inv1（23.1789 dB、0.7624）则约为 8.15 dB 与 0.1626。④ §V-B 其他百分比（SSIM "+80.56%（0.9250 vs 0.5123）"、NMSE "95.36%"、"95.26%"、SSIM "+31.17% at \(k_p=0.1\)"、LPIPS "57.13%–88.87%"、漂移段 "+67.03%/+33.00%" 与 "above +37.30%"）多按 Kriging 或 RME-GAN 而非表注定义的次优列计算；部分数值（88.87% 对表 III 的 88.64%、95.26% 对表 IV 的 86.62%、34.64% 对表 IV 的 34.65%）与表不符或为四舍五入差异；漂移段"relative drop of only 6.6 dB"实为绝对降幅 6.57 dB（相对降幅约 18.4%）。以上均按原文翻译，未改动正文数字，供 QA 与作者核对。⑤ 原文称"三个代表性基线"，实际列出四个（Kriging、RadioUNet、RME-GAN、RadioDiff-Inv1），数目不一致。⑥ 式 (26) 的 \(\mathcal L_{\mathrm{drift}}\) 以对漂移样本取平均的逐样本负对数似然（式 (28) 为平均平方残差）来"近似"漂移边缘化似然 \(-\log\int p(y\mid\mathbf R,\tilde{\mathbf p}+\boldsymbol\delta)p(\boldsymbol\delta)d\boldsymbol\delta\)；由 Jensen 不等式，\(\mathbb E[-\log p]\ge-\log\mathbb E[p]\)，二者存在 **Jensen 间隙**，故该代理仅在期望损失/蒙特卡洛近似意义上成立，并非严格边缘化似然。⑦ 模型假设 \(n_m\) 与 \(\boldsymbol\delta_m\) 的方差 \(\sigma_n^{2}\)、协方差 \(\boldsymbol\Sigma_\delta\) 已知或可由系统统计量估计（式 (20)(21)），且漂移为零均值高斯；实验仅在 **RadioMapSeer 仿真数据**（701 个环境中 600 训练 / 101 测试）上完成，无真实众包测量验证。⑧ 式 (15) 已包含 \(+G_t(\mathbf p)\)，而式 (16) 的有效路损又减去 \(G_t(\mathbf p)\)，按原文公式存在发射天线增益被重复计入的疑点（译文按原文保留，未改动公式）。⑨ 图 2 与图 4 的图注条件实际几乎相同（均为 \(k_p=0.05\)、\(\mathrm{SNR}=5\)、\(\boldsymbol\Sigma_\delta=0.8\)），却分别置于采样率与漂移两组实验下，仅凭图注难以区分其差异来源。⑩ 参考文献 [35] 在 PDF 中原样印出未渲染的 LaTeX 宏 "\textpertenthousand"，译文按原文保留并在此说明；参考文献中的 "Ieee"/"Arxiv Preprint Arxiv:" 等自动排版格式已统一为 "IEEE"/"arXiv preprint arXiv:"（仅格式规范化，未改书目内容）。**建议后续 QA 重点：** 表 I–IV 与正文百分比/绝对增益的口径统一、摘要"4 至 14 dB"的范围、式 (26)/(28) 的估计量表述、式 (15)/(16) 的增益项、图 2 与图 4 的差异说明。逐句逐式终校未做。

**登记（2026-11-06）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。
{% endraw %}