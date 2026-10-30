---
layout: page
title: "无线信号场景重建：物理表征与扩散后验推断｜中文全文译文"
permalink: /papers/translations/2026-10-20-wireless-scene-reconstruction-diffusion-2610-22120/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2610.22120)

# 基于物理约束表征与扩散后验推断，利用泛在无线信号重建场景

**原题：** Scene Reconstruction Using Ubiquitous Wireless Signals via Diffusion Posterior Inference over Physics-Grounded Representations  
**作者：** Vahid Yazdnian、Yasaman Ghasempour（普林斯顿大学）  
**版本：** arXiv:2610.22120v1，2026 年 10 月 15 日。  
**翻译进度：** 摘要、第 1—5 节、附录 A—N（含式（1）—（27））与全部参考文献已译出（其中第 4 节、第 5 节、附录与书目于 2026-10-30 补入）。仍为对照原文抽取文本的补译稿，逐句人工终校与图表数值复核尚未进行；**本页不声明为完整全文。**

## 摘要

了解真实世界的空间布局对于许多应用至关重要，但我们通常依赖的传感器（例如摄像机和激光雷达）可能在黑暗、恶劣天气或墙体遮挡条件下失效。无线信号不存在同样的限制：基站与用户之间的每条链路都会受到其穿过、反射或遮挡的建筑物影响，因此周围环境的信息会被编码进链路两端测得的无线信道中。

然而，从信道测量反推环境是一个严重的不适定问题：单次测量只能记录与其电磁传播路径发生相互作用的结构，甚至这些观测也往往可以用多种不同但合理的场景解释。因此，本文将无线场景重建表述为**后验推断（posterior inference）**，并提出一个包含两个互补阶段的层次化框架。首先，预训练一个符合传播物理规律的无线基础模型，将每次信道测量转换为能够反映产生该观测的场景结构的表征。随后，扩散模型联合融合多次测量的表征，建模并采样建筑物占据状态的后验分布，最终通过对多个样本达成共识产生重建结果。

实验表明，仅利用无线信道测量即可准确恢复建筑物的平面轮廓，且框架性能同时依赖两个设计要素：物理约束的表征能够揭示与场景相关的信息，联合后验推断则能够一致地整合互补观测。

## 1. 引言

每条无线链路实际上已经在无意中测量周围环境。基站发出的信号到达接收机之前，可能被一栋建筑物遮挡，从另一栋建筑物反射，或绕过墙角发生衍射。因此，环境的信息事实上已经写入接收机观测到的无线信道。如果能够从中反推出环境，已大规模部署的无线通信基础设施便可被重新用作传感器网络，在摄像机和激光雷达性能下降甚至完全失效的黑暗、遮挡或极端天气条件下绘制环境地图（Zhao et al., 2018；Dodds et al., 2026）。

这种能力还有助于在场景快速变化时保持地图更新。例如，地震或洪水发生后，街区布局可能在数分钟内变化，而通信网络可能是仍在工作的少数传感基础设施之一。当前特定场景数字孪生的构建与维护往往需要昂贵的测量或人工几何建模，也有望利用网络原本就承载的通信业务进行更新（Hoydis et al., 2023；Li et al., 2024；Testolina et al., 2024）。传播环境知识还可用于提高无线网络吞吐量（Zhao et al., 2023；Demirhan & Alkhateeb, 2023），并推动作为下一代网络重要支柱之一的通信感知一体化（ISAC）技术（Akyildiz et al., 2020；Wang et al., 2024）。

从波测量恢复几何结构，在声学领域已有较长的研究历史：可以依据可分辨回声和几何传播模型推断房间形状（Dokmanić et al., 2013；El Baba et al., 2018）。最近的学习方法放宽了一些假设，能够直接预测平面图（Yeon & Choi, 2024；Yeon et al., 2024），但仍依赖可归因于具体表面的回声结构。

在射频（RF）领域，场景重建主要依赖专用雷达感知系统（Casmin & Oliveira, 2025；Borts et al., 2026），使用毫米波或超宽带反射回波，结合几何推断、运动合成孔径、结构先验或生成模型来恢复占据网格和平面图（Lu et al., 2020；Sun et al., 2022；Zhou et al., 2025；Lai et al., 2026）。近期方法包括基于稀疏雷达热力图的扩散式室内场景补全，以及利用移动雷达收集多次反射回波的转角遮挡场景重建。这些方法需要专用硬件，且经常需要在环境中移动设备，带来额外部署成本。

本文希望直接利用已部署通信基础设施所传输的信号重建场景。关键挑战是：在不附加结构假设的情况下，从原始信道测量提取环境分量是一项**结构性不适定逆问题**，并非只是噪声带来的偶然困难。

首先，一次测量只受与其传播路径发生交互的场景结构影响，因此测量似然对于场景其余部分严格不变。其次，即使在被观测区域，几何到信道的映射也可能是多对一的：有限带宽和阵列孔径限制了时延与角度的分辨率，因此在分辨限度内移动的散射体可能产生不可区分的测量。最后，结构只通过其对某条链路所起的作用影响信道，例如反射、遮挡或没有影响，而这种作用取决于结构相对于收发机的位置；对于一条链路具有相同角色的不同占据模式可能不可辨识。因此单次测量对应的不是一个确定场景，而是一族候选场景。

对此，本文将场景重建视为占据状态的后验推断：目标是获得场景的分布，并依据观测区分哪些部分已经受到数据约束、哪些部分仍未确定。据作者所知，这是第一种不预设散射体数量、形状、凸性或位置的无线场景重建方法。

从原始信道测量直接学习整个后验并不切实际，因为单个解码器必须同时解决两个困难问题：一是从有限数据中学习几何如何通过传播物理规律影响信道；二是在组合规模巨大的场景空间中生成合理场景。为此，采用分层设计。第一阶段的多模态无线基础模型经过预训练，学习电磁传播物理关系，并将信道观测与产生该观测的场景相关结构对齐，得到每次测量的环境表征。第二阶段将同一环境的多个观测表征融合，用于条件化扩散解码器，对占据状态后验建模并生成与信道相符的场景；最终逐网格聚合这些样本，得到重建图。

在约 700 个完全独立于训练阶段的保留环境上，论文评估了不同几何结构的恢复能力，涵盖高密度城区和分布稀疏的孤立建筑场景。控制实验发现，两级结构均不可或缺：对每个观测单独重建后再聚合效果明显较差；直接以原始信道测量作为扩散解码器条件则会导致性能崩溃。实验通过独立改变输入表征和后验推断机制，分别检验两个阶段的贡献。

本文贡献包括：① 将无线场景重建形式化为非参数化占据状态后验推断，刻画不适定性与可恢复区域，并给出有限样本界，证明后验样本共识估计对每个网格的贝叶斯最优性及其在可恢复区域的收敛性；② 通过符合传播物理规律的预训练与场景结构对齐，学习能够表达局部证据和其他位置不确定性的单观测嵌入；③ 构造以单观测表征集合为条件的扩散解码器，并通过样本共识融合多个视角而无需预设场景结构。

## 2. 预备知识与问题形式化

### 2.1 无线传播

基站信号沿着由环境决定的多条传播路径抵达接收机。每条路径对应信号与物理结构之间一系列相互作用：可能直接传播、在建筑表面发生镜面反射、从边缘衍射或被遮挡。

对于位于 $\mathbf p$ 的接收机，场景 $\mathbf s$ 决定传播路径集合

$$
\mathcal P(\mathbf s,\mathbf p)
=\{(\alpha_\ell,\tau_\ell,\theta_\ell,\phi_\ell)\}_{\ell=1}^{L},
$$

其中 $\alpha_\ell$、$\tau_\ell$、$\theta_\ell$、$\phi_\ell$ 依次为路径复增益、时延、到达角和出发角。这些量依赖场景几何：时延由各传播段长度决定，角度由相互作用表面的朝向决定，增益则由自由空间损耗和表面反射系数决定。

接收机不能单独观测每条路径，而是观测其叠加。对于具有 $N_{\mathrm{tx}}$ 个发射天线、$N_{\mathrm{rx}}$ 个接收天线和 $N_{\mathrm{sc}}$ 个子载波的宽带 MIMO 链路，信道张量属于 $\mathbb C^{N_{\mathrm{tx}}\times N_{\mathrm{rx}}\times N_{\mathrm{sc}}}$。对于发射天线 $t$、接收天线 $r$、子载波频率 $f$，信道为

$$
H[t,r,f]=\sum_{\ell\in\mathcal P(\mathbf s,\mathbf p)}
\alpha_\ell a_r(\theta_\ell)a_t^*(\phi_\ell)
e^{-j2\pi f\tau_\ell}. \tag{1}
$$

$a_t,a_r$ 为阵列响应函数（见附录 A）。这一定义给出从场景和链路几何到观测信道的前向算子 $H=\mathcal F(\mathbf s,\mathbf p)$。场景信息通过路径参数写入信道，但接收机仅观测路径叠加的结果。

并非环境中的所有位置都参与某次测量。只有与传播路径产生作用的结构——包括与自由传播、直达路径遮挡、反射或衍射有关的结构——才进入路径集合并影响信道。论文将其称为该次观测的**传播相关集合（propagation-relevant set）**；集合外的结构变化不会改变该次测量。

### 2.2 逆问题

研究目标是利用已部署网络维持的无线链路观测场景。一个基站服务 $K$ 个用户，第 $k$ 个用户位于 $\mathbf p_k$，提供信道测量 $\mathbf H_k$。全部观测为

$$
\mathcal O=\{(\mathbf H_k,\mathbf p_k)\}_{k=1}^{K}.
$$

令 $a_k$ 是第 $k$ 次观测的传播相关区域，则可观测区域为 $A=\bigcup_{k=1}^{K}a_k$。环境采用空间分辨率为 $\Delta R$ 的二维方形占据网格表示：$\mathbf s\in\{0,1\}^{N\times N}$，当单元 $i$ 包含结构时 $s_i=1$。目标是从 $\mathcal O$ 反演 $\mathcal F$ 并恢复 $\mathbf s$，不对结构的数目、形状、凸性及位置施加参数化假设。

**为何不适定？** 按 Hadamard 框架，虽然至少存在一种可行解，但观测无法唯一确定场景（附录 B）。不唯一性具有三个来源：

第一，区域 $A$ 外的结构无法改变任何一次测量，因此似然对这些结构严格不变。在区域补集 $A^c$ 中，无论怎样翻转占据单元，仍可能解释同一观测，仅这一部分便对应指数级数量的候选场景。第二，即使位于 $A$ 内，有限带宽和有限孔径也使传播时延、角度只能在有限分辨率下区分；低于这一分辨能力的结构位移可能不可辨识。第三，建筑物通过其对每条链路产生的作用影响信道：它可能反射某个用户的信号、遮挡另一个用户的信号，对第三个用户却完全不可见。当不同场景中的结构对全部链路扮演相同角色时，即使提高硬件分辨率仍可能无法区分。

多次观测可通过交集约束减少候选场景的不确定性，新增用户和反射路径也会扩大 $A$，但未观测区域的歧义仍然存在，分辨率与角色等价造成的不唯一性也不一定完全消失。

### 2.3 概率形式化

既然数据不能确定唯一场景，本文就不把单个场景作为原始推断对象，而是考虑场景后验：

$$
p(\mathbf s\mid\mathcal O)\propto
p(\mathcal O\mid\mathbf s)p(\mathbf s).
$$

由于区域 $A$ 外的结构不影响观测似然，可以将其写为

$$
p(\mathbf s\mid\mathcal O)
=\underbrace{p(\mathbf s_A\mid\mathcal O)}_{\text{由观测数据约束}}
\underbrace{p(\mathbf s_{A^c}\mid\mathbf s_A)}_{\text{由条件先验决定}}. \tag{2}
$$

第二个因子不包含观测集合：观测只能直接约束场景的可观测部分，余下部分仍由先验在已知部分条件下决定。令 $\pi_i=p(s_i=1\mid\mathcal O)$ 为第 $i$ 个单元的后验边缘概率。对于 $i\in A$，随着证据增加，该概率有可能趋近 0 或 1；但对于 $i\notin A$，该概率仍由条件先验决定，方差不能仅凭无线测量收敛到零。确定性回归器必须给每个单元输出一个值，因而无法表达这种区别，容易对数据没有约束的区域给出过度确定的预测；概率后验则能够保留未知性。

由于利用射线追踪隐式定义的似然 $p(\mathcal O\mid\mathbf s)$ 不具有可用的解析闭式形式，本文从物理一致的数据配对 $(\mathbf s,\mathcal O)\sim\mathcal D$ 中直接学习后验。

## 3. 设计与方法

本文希望根据网络已经收集的观测学习场景后验。其难点不仅在于后验维度高，更在于从原始信道直接训练的模型必须同时学习几何—信道映射中的传播物理规律，以及满足该映射的合理场景生成分布。

因此采用**两阶段层次化框架**（图 1）。第一阶段一次性学习不同链路共享的传播规律：预训练多模态基础模型，将信道、位置与相关场景结构对齐，使单次测量被编码为产生该观测的场景属性的摘要。第二阶段联合融合多个观测嵌入，将其作为扩散模型的条件，学习占据状态后验；从中采样后通过共识得到最终场景。相比直接条件化于原始信道，使用与几何属性对齐的潜在表征，能让生成模型集中解决与观测相容的场景推断问题。

**图 1：** 无线场景重建总体框架。基站与多个用户之间的直达、反射及被遮挡路径共同决定各自信道；PHOENIX 为每条链路生成物理表征，扩散解码器据此生成若干建筑物占据图，最后将样本进行共识融合。

### 3.1 物理约束的表征学习

该阶段介绍 PHOENIX（Physics-grounded Heterogeneous Observation Embedding for Neural Inference across wireless conteXts），一种用于学习统一无线传播物理表征的多模态基础模型。完整结构见图 2。

PHOENIX 采用单流多模态 Transformer 特征嵌入框架，通过不同模态间的关联学习鲁棒的全局信道表征。输入涉及无线信道、发射机与接收机的位置，以及接收信号的空间—时间特性。具体来说，信道张量先转换为幅度和相位，再按天线对和相邻子载波划分为 token；高度图（height map）被划分成互不重叠的 patch；接收机位置被映射为一个 token。各 token 还携带其物理来源信息，包括天线／子载波编号或归一化空间坐标以及模态标识。

专用的 [PHYSC] token 负责跨模态聚合信息。注意力掩码具有非对称结构：[PHYSC] 可以关注全部模态 token，而其他 token 在计算注意力时不能将 [PHYSC] 作为键。这一设计用于使 [PHYSC] 汇集与传播相关的环境信息。

关键在于让表征真正符合观测中的传播物理联系。传统图文对比学习目标并不完全适用：不同场景和用户位置可通过不同路径组合产生近似信道，因此简单定义匹配和不匹配的信道—场景对并不可靠。PHOENIX 转而采用两类互补的自监督预训练机制。

**第一类：双向重建。** 从其他模态恢复被遮蔽模态的信息：一方面利用剩余信道 token、场景和位置数据恢复被遮蔽的复信道值；另一方面从所观测的信道恢复被遮蔽的建筑地图区域。场景遮蔽并不是全图均匀施加，因为单次无线观测只能约束其传播路径触达的环境；要求模型推断完全未参与传播的区域，可能鼓励模型凭空生成缺乏观测支持的几何结构。因此只在该链路所有传播路径经过的场景 patch 内进行遮蔽，并以这些位置的粗粒度占据情况作为重建目标。这既促使网络对齐信道与真正参与传播的几何结构，也避免对细粒度结构过拟合，同时保留遮挡、反射和衍射等主导效应。

**第二类：物理引导的跨模态蒸馏。** 这一机制用于塑造 [PHYSC] token，使其预测由环境、链路几何与观测信道共同确定的物理量——空间谱（spatial spectrum）。空间谱描述信号能量沿不同传播方向的分布，可揭示主导出发角与到达角，因此将 [PHYSC] 与空间谱对齐，可使表征具备跨环境仍有意义的传播物理解释。

进一步地，将传播相关场景 patch 的编码汇聚为场景表征，推动 [PHYSC] 与真实产生该次观测的场景部分对齐，同时拉开与无关链路表征的距离；对于空间上接近、可能与同一组结构发生交互的链路，适当放宽这种分离要求。正是这种对齐，使单观测嵌入 $\mathbf z_k$ 可以被视为产生测量的环境结构的摘要。

预训练结束后冻结编码器 $f_\phi$，通过

$$
\mathbf z_k=f_\phi(\mathbf H_k,\mathbf p_k),\qquad
\mathcal Z=\{\mathbf z_k\}_{k=1}^{K}
$$

得到一个场景的全部物理约束表征，作为后续环境重建的输入。

**图 2：** PHOENIX 自监督预训练。图中展示信道／场景／位置 token 化、多模态 Transformer、被遮蔽信道和场景 patch 双向重建，以及利用空间谱和场景关联进行的物理引导信息聚合。

### 3.2 场景上的扩散后验

单观测嵌入提供该次测量能够揭示的环境部分信息，剩余任务是融合多次不完整且有歧义的观测，推断完整场景的后验。因此第二阶段直接建模 $p_\theta(\mathbf s\mid\mathcal Z)$，优化数据分布下的负对数似然期望。

**参数化。** 虽然目标占据图为二值网格，实际扩散过程采用连续松弛。令

$$
\mathbf x_0=2\mathbf s-1\in\{-1,+1\}^{N^2},
\qquad \widehat{\mathbf s}=\mathbf 1[\mathbf x_0>0].
$$

利用标准去噪扩散模型的高斯前向扰动与余弦噪声日程 $\bar\alpha_t$：

$$
q(\mathbf x_t\mid\mathbf x_0)
=\mathcal N\left(
\mathbf x_t;\sqrt{\bar\alpha_t}\mathbf x_0,
(1-\bar\alpha_t)\mathbf I\right),
\qquad
\mathbf x_t=\sqrt{\bar\alpha_t}\mathbf x_0+
\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon. \tag{3}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(0,\mathbf I)$。该形式允许在任意扩散时间步直接根据干净场景生成带噪状态。

反向去噪器 $\boldsymbol\epsilon_\theta$ 预测加入场景的噪声，同时以 $\mathcal Z$ 为条件。它由作用于 $N^2$ 个网格 token 的 Transformer 构成，每个 token 对应一个占据单元，并融合该单元的带噪占据值和相对于基站的位置嵌入。各 Transformer 块对网格执行自注意力，以具有零初始化门控的自适应层归一化注入扩散时间信息，然后进行交叉注意力：网格 token 作为 Query，$\mathcal Z$ 中各单观测嵌入作为 Key 和 Value。

这种交叉注意力适合该任务有两个原因：它对观测集合的排列顺序不敏感，并支持可变数量的观测，因此同一个模型无需随用户数 $K$ 改变而重新训练；此外，每个网格单元都可以有选择地从那些确实携带该区域证据的观测中获取信息。

**图 3：** 物理表征条件下的扩散后验训练框架。冻结的 PHOENIX 输出观测嵌入集合；占据网格 token 通过自注意力和对观测集合的交叉注意力进行噪声预测。

**训练目标。** 对每个样本，随机选择扩散时间 $t$ 和高斯噪声 $\boldsymbol\epsilon$，按照式（3）构造 $\mathbf x_t$，训练去噪器恢复注入噪声：

$$
\theta^\star=\arg\min_\theta
\mathbb E_{(\mathbf s,\mathcal O)\sim\mathcal D}
\mathbb E_{t\sim\mathcal U\{1,\ldots,T\},
\boldsymbol\epsilon\sim\mathcal N(0,\mathbf I)}
\left[\|\boldsymbol\epsilon-
\boldsymbol\epsilon_\theta(\mathbf x_t,t,\mathcal Z)\|_2^2\right].
\tag{4}
$$

其中 $\mathcal Z=f_\phi(\mathcal O)$ 来自冻结的 PHOENIX 编码器，仅更新扩散模型参数 $\theta$。架构与噪声日程细节见附录 E。

**基于共识的读出。** 推断时，从学习到的后验中独立抽取 $M$ 个场景。每条生成轨迹从高斯噪声初始化，并使用独立噪声序列进行祖先采样。将每个样本二值化为 $\widehat{\mathbf s}^{(m)}$ 后，计算每个网格的样本平均占据率：

$$
\widehat\pi_i=\frac{1}{M}\sum_{m=1}^{M}\widehat s_i^{(m)},
\qquad
\widehat s_i^{\mathrm{cons}}
=\mathbf 1\!\left[\widehat\pi_i>\frac12\right]. \tag{5}
$$

这一读出方式直接来自概率后验形式化。附录 F 的命题 3 证明 $\widehat\pi_i$ 以 Hoeffding 型速率集中于模型后验边缘概率 $\pi_i^\theta=p_\theta(s_i=1\mid\mathcal Z)$。因此，只要模型后验足够准确，共识结果就收敛至逐网格贝叶斯最优判决；可靠恢复某个单元所需样本量与其后验判决间隔 $|\pi_i^\theta-1/2|$ 的平方倒数相关。命题 4 进一步说明，当学习到的后验充分接近真实分布时，随着观测增多，共识判决能够在可观测区域 $A$ 上恢复真实场景；而 $A$ 外的部分仍受条件先验支配。

这一框架与 unCLIP（Ramesh et al., 2022）在整体形式上相似，二者均利用冻结的表征和扩散解码器。然而，两者对采样差异性的理解不同：unCLIP 根据语义嵌入生成图像，随机性主要补充未指定的视觉细节，因此多样性可能是目标；这里的真实环境只有一个，样本差异代表**观测尚未消除的物理不确定性**。因此使用共识保留跨样本反复得到支持的建筑轮廓，抑制由尚未解决的歧义造成的结构。

## 4. 实验

基础模型使用包含 11,000 个室外环境和 3,000 万条射线追踪信道观测的数字孪生语料，按所提出的物理引导自监督目标进行预训练。预训练模型提供物理约束的单观测表征，再用于条件化场景后验扩散模型；这一完整组合在论文中记为 **Diffusion + FM**。

论文还设计了一种易于解释的对照配置 **Marginal Prob. + FM**：不使用扩散后验，而是让确定性解码器对每个观测分别估计占据概率和传播相关区域置信度，再进行融合，以检验联合后验建模的贡献。

为隔离设计中的每一项贡献，原文另设两个受控基线（作者说明：既有工作并未直接处理“从通信基础设施数据、且不借助几何先验”的场景重建，因此无法直接横向对照，只能逐组件做受控消融）：

- **Diffusion + Raw Meas.**：与 Diffusion + FM 完全相同的扩散模型，但以原始观测与用户位置为条件，用以检验不借助场景对齐的中间表征能否学出场景后验；该配置在思路上最接近 (Hehn et al., 2025)——后者在已知地板与天花板几何的假设下，从单条链路的接收功率重建室内几何。
- **Marginal Prob. + Raw Meas.**：在二元交叉熵目标下从每次测量直接预测整幅网格的占据，再聚合逐测量预测，不建模各观测专属的传播相关区域。

全部模型的训练目标与实现细节见附录 G–I。评测在约 700 个环境上进行，这些环境从训练的每个阶段都留出，布局覆盖密集城市街区到含孤立建筑的开放区域。每次观测由单一基站采集的完整无线信道和用户位置组成。指标为重建占据网格相对真值的平衡准确率、F1 与交并比（IoU）。附录 G 详述阵列与波形配置，附录 J 定义指标，附录 L–M 研究位置信息不完整与含噪的影响。

### 4.1 主要结果

图 4 给出本文框架在训练中未见过的代表性环境上的重建结果。给定来自单一基站节点的 500 次无线信道测量，框架即可仅凭信道观测与用户位置恢复周边建筑轮廓的位置、范围与排布，不需要任何场景先验信息。在空间密度与结构差异显著的多个环境中，重建结果都紧贴真值布局。据作者所知，这是首次证明通信基础设施的信道测量可以在不对结构数量、形状或位置作假设的前提下支持任意室外场景几何的重建。通过物理约束表征上的后验推断，该框架把这个不适定逆问题变得可处理，并使现有无线链路能够充当环境传感器。

可恢复的范围由测量决定：基站采用均匀线阵时，信道只在方位角上分辨路径，建筑高度因而严重欠定，所以把场景重建为建筑轮廓的二维占据网格；利用可分辨俯仰角的均匀矩形阵扩展到三维，留作未来工作。

**表 1：不同模型在完整测试集上的场景重建性能。** ↑ 表示越大越好；每格依次为均值／中位数／P90，数值照录原文。

| 模型 | 平衡准确率：均值 / 中位 / P90 | F1：均值 / 中位 / P90 | IoU：均值 / 中位 / P90 |
|---|---|---|---|
| Diffusion + Raw Meas. | 0.505 / 0.500 / 0.519 | 0.054 / 0.016 / 0.162 | 0.030 / 0.008 / 0.088 |
| Marginal Prob. + Raw Meas. | 0.621 / 0.618 / 0.668 | 0.397 / 0.398 / 0.503 | 0.251 / 0.248 / 0.336 |
| Marginal Prob. + FM（本文） | 0.738 / 0.739 / 0.803 | 0.633 / 0.642 / 0.737 | 0.470 / 0.473 / 0.584 |
| Diffusion + FM（本文） | **0.758 / 0.746 / 0.868** | **0.663 / 0.655 / 0.810** | **0.506 / 0.487 / 0.680** |

表 1 汇总重建性能。本文框架在全部指标上最强，明显优于两个原始测量基线，并优于边缘概率变体。据作者所知，这是从通信基础设施测量报告的最强场景重建结果，也显著优于该问题此前的尝试。由结果可得几点结论。

与 Diffusion + Raw Meas. 的对比隔离出物理约束表征的价值：解码器、噪声日程与采样器完全相同，仅把条件换成原始信道，性能就跌至接近随机。这说明问题在于**可学习性**而非信息缺失：原始信道所含的场景信息不少于其学习到的表征，但解码器必须同时发现传播到几何的映射，并从高维输入出发完成后验生成。相比之下，基础模型给出场景对齐的表征，大幅简化后验推断。

Marginal Prob. + Raw Meas. 失败的原因不同：它的整图交叉熵要求每次观测都预测每个场景网格，而测量只在传播相关区域内有信息。于是无信息区域出现的过度自信预测在融合中被不断累加——从未感知某网格的观测仍会给它投票。Marginal Prob. + FM 使用相同的融合，但每个逐观测信念都建立在该观测的物理约束表征与其传播相关网格邻域上，并在其他位置弃权，因此每一票在投出之处都是有信息的，聚合也能更好地恢复场景。本文设计相对该基线在平衡准确率上提升 22.1%、在 F1 上提升 67.0%。

最后，结果说明联合后验在该设定下优于边缘概率融合。主要优势集中在逐场景分布的上尾：两模型的中位 IoU 相对差约为 3%，而到第 90 百分位时差距扩大到 16%。边缘概率变体独立处理观测并用固定规则合并：置信度门控会丢弃在单个观测中弱、在组合中却有信息的证据，且融合中的任何环节都不强制结果是一个合理的场景。相反，扩散解码器学习在给定完整观测集合下整幅网格的联合后验，在表征空间中融合证据，并在测量沉默处通过学到的先验补全场景——即式（2）的第二个因子。附录 N 另给出四种方法在多种环境下的可视化对比。

### 4.2 学得信念的物理解释

作者用 Marginal Prob. + FM 检验逐观测边缘预测的物理可解释性，因为该变体对每次测量单独给出信念。具体问题是：每个信念是否刻画了其传播路径所涉及的环境区域，同时在其余位置保持不确定。图 5 把同一环境中两次测量的边缘占据概率、真值布局与相应传播路径并列展示。该信念恢复了沿直达与反射路径的自由空间走廊、产生反射的结构，以及直达路径被阻挡时的遮挡构件；其余位置的预测仍接近二分之一，表示该区域没有来自该测量的信息。因此信念恢复的不是任意的局部重建，而是对塑造该观测真正负责的那部分具体几何，无关区域保持未知。这种行为由物理引导的预训练诱导而来，使边缘预测具有物理可解释性：每个信念都可以被读作“该链路遇到了哪些结构”的陈述。

### 4.3 场景密度下的性能

场景密度决定传播条件的复杂度，也随之决定逆问题的难度：稀疏环境中大多数链路穿过自由空间，每次测量只对应很窄的一族相容场景；而遮挡、反射与高阶相互作用会扩大这一族，并迫使后验一次协调许多这样的族。因此把测试环境按占据比例（测试集跨 1%–70%）分成三个等宽区间——稀疏、中等、密集，并在表 2 中分别报告性能。

**表 2：按场景密度划分的平均重建性能。** 每格依次为平衡准确率／F1／IoU，↑ 表示越大越好；括号内为该区间的场景数。

| 模型 | 稀疏（88） | 中等（565） | 密集（18） |
|---|---|---|---|
| Diffusion + Raw Meas. | 0.518 / 0.066 / 0.039 | 0.503 / 0.048 / 0.027 | 0.508 / 0.179 / 0.105 |
| Marginal Prob. + Raw Meas. | 0.647 / 0.434 / 0.283 | 0.617 / 0.393 / 0.248 | 0.589 / 0.316 / 0.190 |
| Marginal Prob. + FM（本文） | 0.764 / 0.631 / 0.468 | 0.735 / 0.635 / 0.471 | 0.712 / 0.607 / 0.457 |
| Diffusion + FM（本文） | **0.786 / 0.665 / 0.510** | **0.752 / 0.659 / 0.501** | **0.806 / 0.775 / 0.652** |

Diffusion + FM 在三个区间都最好，且优势在密集场景最明显。两个边缘估计器的平衡准确率都随密度单调下降，而 Diffusion + FM 在三个区间保持稳健；相对 Marginal Prob. + FM，其平衡准确率优势从 2.9% 扩大到 13.2%，IoU 优势从 9.0% 扩大到 42.7%。这与两者合并证据的方式一致：环境越密集，单次观测能提供信息的场景比例越小；边缘概率形式必须在这些不完整证据下聚合独立估计的信念，而扩散模型联合推断场景，并用学到的先验补全直接证据有限的区域。

### 4.4 无线测量数目的影响

图 6 报告每个场景 50 到 1,000 次测量时的重建质量，显示额外观测如何提供互补信息。由于两个扩散解码器都以 $K\in[100,500]$ 训练，扫描的两端也检验了模型在观测数上的泛化。

Diffusion + FM 与两个边缘概率变体都随测量增多而改善，随后饱和。额外观测通过两条途径起作用：新的链路——特别是新的反射路径——会到达此前任何观测都未触及的网格并扩大可观测集合；而对已观测网格的额外覆盖会按命题 4 所述使该处后验更尖锐。饱和也来自同一分析：当单一基站的用户几乎照亮了其链路可达的全部场景后，后续观测只是在重访已覆盖网格，剩余误差集中于没有链路能够到达的结构。相反，Diffusion + Raw Meas. 全程接近随机：若不提供揭示观测中场景相关结构的表征，更多的原始数据也无法变成可用的证据。

两个使用基础模型的方法表现出不同的伸缩行为。在观测较少或中等时，Marginal Prob. + FM 与 Diffusion + FM 相当，因为二者依赖相同的表征、面临相似的不完整证据；但随着测量累积，它逐渐被超越。因此，一旦有足够多的互补观测可供整合，联合后验建模的价值就显现出来，这也反映了两个组成部分的互补作用。

## 5. 结论

本文提出了一个层次化框架，把物理约束表征学习与联合生成式后验推断结合起来，从无线信道测量重建环境几何。无线基础模型先从单次观测中提取与场景相关的信息，扩散模型再联合整合这些表征以推断场景占据的后验，并通过对采样场景的逐网格共识恢复建筑轮廓。结果表明，该框架能够从通信信号恢复此前未见的场景结构；受控对比说明这一层次化设计对有效求解底层不适定逆问题的重要性。结果凸显了现有无线基础设施用于环境感知的潜力。

## 附录 A：前向模型细节（式 6）

**阵列响应。** 对含 $N$ 个阵元、阵元间距 $d$、波长 $\lambda$ 的均匀线阵，角度 $\vartheta$ 处的阵列响应为

$$
\mathbf a(\vartheta)=\left[
1,\ e^{-j\frac{2\pi d}{\lambda}\sin\vartheta},\ \ldots,\ e^{-j\frac{2\pi d(N-1)}{\lambda}\sin\vartheta}
\right]^{\top}.\tag{6}
$$

把式（6）代入正文的路径求和式，即得每个收发天线对与子载波上的信道项。下文使用的角分辨率由该孔径的 Rayleigh 判据给出：主视轴附近 $\Delta\theta\approx2/N_{\mathrm{tx}}$（弧度），时延分辨率为 $\Delta\tau=1/B$（占用带宽 $B$）。

**路径生成。** 路径集合 $\mathcal P(\mathbf s,\mathbf p)$ 由对场景几何按发射—接收对做射线追踪产生。每条路径以其与场景结构的相互作用序列刻画：存在直达路径时的直达分量、经建筑立面的单次与高阶镜面反射，以及建筑边缘处的绕射。增益 $\alpha_\ell$ 把自由空间路径损耗与沿该相互作用序列的反射、绕射系数合并在一起。

**传播相关集合。** 对观测 $k$，定义

$$
\mathfrak a_k=\left\{i:\ \text{cell}_i\cap\ell\ne\varnothing\ \text{for some}\ \ell\in\mathcal P(\mathbf s,\mathbf p_k)\right\},\qquad
\mathcal A=\bigcup_{k=1}^{K}\mathfrak a_k,\tag{7}
$$

即对每条路径记录其各段所经过的网格以及它与结构发生相互作用的网格。作者另外记录这些网格的一阶邻域 $\partial\mathfrak a_k$，用于在分析中定义边界带。

## 附录 B：逆问题的不适定性

本附录把正文所述三种不唯一性来源形式化。

### B.1 传播相关集合之外的严格不变性

由式（7）的定义，$\mathfrak a_k$ 之外的网格不参与观测 $k$ 的任何路径，因此该观测的似然不依赖这些网格；对观测集合汇总即得正文所述的不变性。它对“与测量相容的场景数目”的推论如下。

**命题 1（相容场景族的规模）。** 固定观测 $k$，令 $\mathbf s^\star$ 为真实场景，$\mathcal S_k(\mathbf H_k)=\{\mathbf s:\mathcal F(\mathbf s,\mathbf p_k)=\mathbf H_k\}$ 为精确复现无噪测量的场景集合，则 $|\mathcal S_k(\mathbf H_k)|\ge2^{|\mathfrak a_k^c|}$。

**证明。** 由 $\mathfrak a_k$ 的定义，$\mathfrak a_k^c$ 中的任何网格都不参与 $\mathcal P(\mathbf s^\star,\mathbf p_k)$ 的任何路径；路径参数 $(\alpha_\ell,\tau_\ell,\theta_\ell,\phi_\ell)$ 因而不依赖 $\mathbf s_{\mathfrak a_k^c}$，路径求和也不依赖。于是对任意子集 $J\subseteq\mathfrak a_k^c$，把 $J$ 中网格的占用状态翻转得到的场景 $\mathbf s^\star\oplus\mathbf e_J$ 满足 $\mathcal F(\mathbf s^\star\oplus\mathbf e_J,\mathbf p_k)=\mathbf H_k$，属于 $\mathcal S_k(\mathbf H_k)$。不同子集给出不同场景，共有 $2^{|\mathfrak a_k^c|}$ 个。$\square$

该不等式一般是严格的：计数只枚举了与 $\mathbf s^\star$ 在 $\mathfrak a_k$ 之外不同的场景，B.2 与 B.3 的歧义还会贡献在 $\mathfrak a_k$ 之内不同的更多成员。对观测集合汇总后，$\mathfrak a_k^c$ 换成 $\mathcal A^c$，得 $|\mathcal S(\mathcal O)|\ge2^{|\mathcal A^c|}$：残余非唯一性在任何路径都未触及的网格数上呈指数增长。

### B.2 有限分辨率

在 $\mathcal A$ 内部，几何到信道的映射仍是多对一的。带宽为 $B$ 的测量只能把路径时延分辨到 $\Delta\tau=1/B$，$N_{\mathrm{tx}}$ 个阵元的孔径只能把角度分辨到 $\Delta\theta\approx2/N_{\mathrm{tx}}$。若两个场景诱导的路径参数集合在这些限度内一致，

$$
\{(\tau_\ell,\theta_\ell,\phi_\ell,\alpha_\ell)\}_{\mathbf s}
\equiv
\{(\tau_\ell,\theta_\ell,\phi_\ell,\alpha_\ell)\}_{\mathbf s'}
\quad\text{within }(\Delta\tau,\Delta\theta),\tag{8}
$$

则 $\mathcal F(\mathbf s,\mathbf p_k)\approx\mathcal F(\mathbf s',\mathbf p_k)$，两个场景无法仅凭观测 $k$ 区分。该歧义来源随带宽与孔径增大而收缩。

### B.3 传播等价场景

按路径求和的在模型，链路 $k$ 的信道只通过它所诱导的路径集合 $\mathcal P(\mathbf s,\mathbf p_k)$ 及其参数依赖场景。因此诱导出相同逐链路路径参数的两个场景，无论其占据网格如何不同，都不能由 $\mathcal O$ 区分；作者称这类场景为**传播等价**。

**命题 2（传播等价场景不可区分）。** 若两个场景 $\mathbf s,\mathbf s'$ 对给定观测满足 $\mathcal P(\mathbf s,\mathbf p_k)=\mathcal P(\mathbf s',\mathbf p_k)$，即两个路径集合携带相同的参数 $(\alpha_\ell,\tau_\ell,\theta_\ell,\phi_\ell)$，则 $\mathcal F(\mathbf s,\mathbf p_k)=\mathcal F(\mathbf s',\mathbf p_k)$，任何估计器都无法从 $\mathcal O$ 区分二者，与带宽、孔径无关。

链路 $k$ 的信道项是 $\ell\in\mathcal P(\mathbf s,\mathbf p_k)$ 上只依赖 $(\alpha_\ell,\tau_\ell,\theta_\ell,\phi_\ell)$ 的项之和，因此参数化路径集合相等即蕴含路径求和相等，也蕴含该观测的似然 $p(\mathbf H_k\mid\cdot)$ 相等。

该陈述的实质在于传播等价场景集合有多大。占据到路径参数的映射是多对一的，其原因在几何而非在仪器。一个网格只通过它为某链路所扮演的**角色**影响该链路，

$$
\rho_k(i)=\rho(i,\mathbf p_k,\mathbf s)\in\{\mathrm{block},\mathrm{reflect},\mathrm{free},\mathrm{none}\},\tag{9}
$$

其中 block 表示一个被占据、移除了本可到达接收机的路径的网格；reflect 表示支持镜面或绕射相互作用、贡献一条路径的被占据网格；free 表示被某条有贡献的路径穿过的空网格；none 表示既不承载也不阻挡任何有贡献路径的网格。此外，$\rho_k(i)$ 是链路几何的函数而不仅是 $s_i$ 的函数：不同的占用取值对给定链路可以扮演相同角色。

**相互作用序列的混叠。** 不同的相互作用序列可以产生相同的路径参数。来自一个表面的单次镜面反射与来自另外两个表面的连续反射可能给出相同的总时延与相同的出发、到达角，此时两个场景在路径求和中的贡献项完全相同。这里角色本身不同（不同的网格在反射），但场景仍传播等价。该机制在几何使参数恰好重合时（如对称布局）精确成立，否则近似成立，并与附录 B.2 的有限分辨率歧义叠加。

**占据不蕴含遮挡。** 一个网格可以已被占据，却仍不能阻挡某条链路的视距段：基站与用户高度不同，直达射线会从其高度以上的结构上方通过；二维占据网格只记录“有建筑”，不记录建筑是否高到能截断射线。因此一个网格可以属于某次观测的传播相关集合（它位于链路所用的一条路径上），而该测量仍不含反对其被占据的证据：无阻挡信道与“射线从其上方掠过的结构”同样相容。

### B.4 联合观测

在给定场景时测量条件独立的前提下，

$$
p(\mathbf s\mid\mathcal O)\propto p(\mathbf s)\prod_{k=1}^{K}p(\mathbf H_k\mid\mathbf s),\tag{10}
$$

因此额外观测会与各族 $\mathcal S_k$ 求交并使后验更尖锐。该交集不会坍缩为一点：由命题 1，残余族的规模至少为 $2^{|\mathcal A^c|}$，而在 $\mathcal A$ 内部 B.2、B.3 的歧义依然存在。把不变性代入贝叶斯公式即得正文所述的分解，其第二个因子与 $\mathcal O$ 无关；因此 $i\notin\mathcal A$ 的网格满足 $\pi_i=p(s_i=1\mid\mathbf s_{\mathcal A})$，随着数据使 $p(\mathbf s_{\mathcal A}\mid\mathcal O)$ 变尖，其方差收敛到先验条件方差而不是零。

## 附录 C：基础模型结构与 token 化

**信道 token 化。** CSI 张量由实部与虚部分量转换为幅度与相位 $(a_{t,r,s},\phi_{t,r,s})$。对每个发射天线 $t$、接收天线 $r$ 以及由 $n_{\mathrm{sc}}$ 个相邻子载波组成的组 $g$，把一个信道 token 取为相应幅度与相位值的拼接：$x^{\mathrm{ch}}_{t,r,g}=[a_{t,r,g,1:n_{\mathrm{sc}}}\parallel\phi_{t,r,g,1:n_{\mathrm{sc}}}]\in\mathbb R^{2n_{\mathrm{sc}}}$，共 $N_{\mathrm{ch}}=N_{\mathrm{tx}}N_{\mathrm{rx}}N_{\mathrm{sc}}/n_{\mathrm{sc}}$ 个 token。每个 token 经一个可学习线性投影加层归一化映射到共享嵌入维 $d$。由于每个天线对携带不同的空间信息，该做法保留完整的发射与接收天线分辨率；同时通过分组子载波，紧凑地表示局部频率结构。

**场景与位置 token 化。** 高度图 $S\in\mathbb R^{N\times N}$ 划分为不重叠的 $p\times p$ patch，展平后按同样方式投影，得到 $(N/p)^2$ 个场景 token。接收机位置由单层线性层投影为一个位置 token。

**物理来源的位置与模态嵌入。** token 化只捕捉内容，不捕捉物理来源。对信道 token，沿发射、接收与子载波三个轴分别用正弦编码表示位置并拼接：$e^{\mathrm{ch}}_{t,r,g}=[\mathrm{PE}_{\mathrm{tx}}(t)\parallel\mathrm{PE}_{\mathrm{rx}}(r)\parallel\mathrm{PE}_{\mathrm{sc}}(g)]$，从而同时保留阵列的空间结构与信道的频率结构。对场景 patch，对 patch 相对基站的归一化距离与方位角的正弦特征应用两层 MLP，使每个 token 携带它相对参考位置的几何关系。可学习模态嵌入 $m(i)\in\{m_{\mathrm{ch}},m_{\mathrm{scn}},m_{\mathrm{loc}}\}$ 标识 token 类型。最终的输入 token 是三者之和：token 的内容、它在物理上的来源、它所属的模态。

**编码器。** 由于信道 token 的数量远多于场景与位置 token，先由轻量预编码器块只处理信道 token，在 $(t,r,g)$ 轴上使用旋转位置嵌入，在跨模态融合之前捕捉相邻天线与频率之间的局部相关；绝对编码保留给后续阶段。随后全部 token 拼成一个序列，前置 [PHYSC]，交给带合并 token 自注意力的单流 Transformer，使所有模态从第一层起就相互作用。一个二值注意力掩码实现正文所述的非对称性：[PHYSC] 是对所有 token 无约束的查询，但在所有地方都被排除为键，于是它能从序列读取，而没有任何 token 从它读取。

## 附录 D：完整预训练目标（式 11–16）

**掩蔽信道重建。** 记 $\mathcal M_{\mathrm{ch}}$ 为被掩蔽的信道 token，

$$
\mathcal L_{\mathrm{ch}}=
\sqrt{\frac{1}{|\mathcal M_{\mathrm{ch}}|}
\sum_{i\in\mathcal M_{\mathrm{ch}}}\left\|\widehat{\mathbf h}_i-\mathbf h_i\right\|_2^2}.\tag{11}
$$

**掩蔽场景重建。** 掩蔽只限于该链路的传播相关 patch。记 $\mathcal M_{\mathrm{scn}}\subseteq\mathfrak a_k$ 为被掩蔽的传播相关 patch，$o_i$ 为占用标签，

$$
\mathcal L_{\mathrm{scn}}=
-\frac{1}{|\mathcal M_{\mathrm{scn}}|}
\sum_{i\in\mathcal M_{\mathrm{scn}}}\left[o_i\log\widehat o_i+(1-o_i)\log(1-\widehat o_i)\right].\tag{12}
$$

把掩蔽限制在 $\mathfrak a_k$ 内，正是为了避免训练模型去推断在信道中没有留下痕迹的区域。

**掩蔽位置重建。** $\mathcal L_{\mathrm{loc}}$ 是预测接收机位置与真实位置之间的均方根误差。

**空间谱蒸馏。** 令 $H_n^{(\Psi)}$ 表示在参考天线与子载波处、沿发射或接收天线轴切出的 CSI 张量切片，则出发角谱与到达角谱为

$$
s_\Psi[b]=
\left|\sum_{n=0}^{N_\Psi-1}H_n^{(\Psi)}e^{-j2\pi nb/N_\Psi}\right|^2,
\qquad \Psi\in\{\mathrm{tx},\mathrm{rx}\},\tag{13}
$$

其中 $b$ 索引角度 bin。[PHYSC] token 被训练在这些谱上做重建：

$$
\mathcal L_\Psi=
D_{\mathrm{KL}}\!\left(\operatorname{softmax}(\mathbf s_\Psi)\,\|\,\operatorname{softmax}(\widehat{\mathbf s}_\Psi)\right)
+\lambda\,\mathrm{MSE}(\widehat{\mathbf s}_\Psi,\mathbf s_\Psi),\tag{14}
$$

其中 KL 项强调谱峰位置的对齐，MSE 项保持其相对强度。

**PHYSC–场景对比对齐。** 传播相关 patch 的编码 token 被汇聚为场景表征 $\mathbf z^{\mathrm{scn}}$，并且

$$
\mathcal L_{\mathrm{con}}=
-\frac{1}{N}\sum_{i=1}^{N}
\log\frac{\exp(\mathbf z_i^{\mathrm{physc}}\cdot\mathbf z_i^{\mathrm{scn}}/\tau)}
{\sum_{j=1}^{N}w_{ij}\exp(\mathbf z_i^{\mathrm{physc}}\cdot\mathbf z_j^{\mathrm{scn}}/\tau)},\tag{15}
$$

温度参数 $\tau$、权重 $w_{ij}\in(0,1]$ 用来降低来自空间邻近链路的负样本的权重，避免把真正具有相似传播几何的样本当作困难负例惩罚。

**预训练目标。** 五项合并为

$$
\mathcal L_{\mathrm{pre}}=
\lambda_{\mathrm{ch}}\mathcal L_{\mathrm{ch}}+
\lambda_{\mathrm{scn}}\mathcal L_{\mathrm{scn}}+
\lambda_{\mathrm{loc}}\mathcal L_{\mathrm{loc}}+
\lambda_{\mathrm{spec}}(\mathcal L_{\mathrm{tx}}+\mathcal L_{\mathrm{rx}})+
\lambda_{\mathrm{con}}\mathcal L_{\mathrm{con}},\tag{16}
$$

其中 $\mathcal L_{\mathrm{ch}}$、$\mathcal L_{\mathrm{loc}}$ 分别是掩蔽信道项与掩蔽位置上的重建误差；$\mathcal L_{\mathrm{scn}}$ 是掩蔽传播相关场景 patch 上的二元交叉熵；$\mathcal L_\Psi$ 把一个对齐预测与真实空间谱峰值的 KL 项和一个保持其相对强度的均方项组合起来；$\mathcal L_{\mathrm{con}}$ 是 [PHYSC] 与传播相关场景表征之间按距离加权的对比对齐。

**解码器与配置。** 沿用掩蔽自编码的做法，一个轻量 Transformer 解码器接收已编码的可见 token，连同代表缺失输入的可学习 token，预测相应的信道值、场景占用与位置。它仅在预训练期间使用，之后丢弃。

## 附录 E：扩散解码器细节

**噪声日程。** 采用余弦日程：$\bar\alpha_t=f(t)/f(0)$，其中

$$
f(t)=\cos^2\!\left(\frac{t/T+\varsigma}{1+\varsigma}\cdot\frac{\pi}{2}\right),
$$

偏移 $\varsigma=0.008$；$\beta_t=1-\bar\alpha_t/\bar\alpha_{t-1}$ 截断在 0.999 以保证数值稳定。

**去噪器。** 每个块由三部分组成：作用于网格 token、受时间步调制的自注意力；对条件集合的普通交叉注意力；受时间步调制的前馈网络。调制采用自适应层归一化：时间步嵌入为每个块产生 shift、scale 与 gate 参数，gate 初始化为零，使每个块一开始都是恒等映射。交叉注意力不加调制，因为可变大小的条件集合不能像标量时间步那样自然地折叠成单个全局调制向量。一个线性适配器把编码器嵌入维映射到解码器宽度，输出头零初始化。

**条件丢弃。** 训练时以概率 $p_{\mathrm{drop}}=0.15$ 把整个条件集合替换为学到的空嵌入。作者将其用作正则项，抑制对任一特定条件配置的过度依赖；采样时直接使用条件预测，不加引导。

**采样器。** 从 $\mathbf x_T\sim\mathcal N(0,\mathbf I)$ 出发做祖先采样。每一步先把干净场景估计 $\widehat{\mathbf x}_0=(\mathbf x_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta(\mathbf x_t,t,\mathcal Z))/\sqrt{\bar\alpha_t}$ 截断到 $[-1,1]$，再构造后验均值，从而稳定二值目标在 $t=0$ 处的轨迹。$M$ 条轨迹各由独立噪声驱动，并在最后一步按符号二值化；这正是附录 F 的集中性结果所要求的条件。

## 附录 F：共识命题的证明

下面证明刻画共识估计器理论性质的两个命题：先说明在学得后验下共识给出逐网格贝叶斯最优判决，再说明由近最优后验得到的共识可在可观测集合上恢复真实场景取值、且重建误差随观测数增加而减小。

**命题 3（共识即代入式贝叶斯判决）。** 令 $\widehat{\mathbf s}^{(1)},\ldots,\widehat{\mathbf s}^{(M)}$ 为 $p_\theta(\cdot\mid\mathcal Z)$ 的独立同分布抽样，$\pi_i^\theta=p_\theta(s_i=1\mid\mathcal Z)$。则对每个网格 $i$：（a）$\widehat\pi_i\to\pi_i^\theta$，且 $\Pr[|\widehat\pi_i-\pi_i^\theta|\ge\varepsilon]\le2e^{-2M\varepsilon^2}$；（b）若 $\pi_i^\theta\ne1/2$，则 $\widehat s_i^{\mathrm{cons}}$ 以至少 $1-2e^{-2M(\pi_i^\theta-1/2)^2}$ 的概率等于 $p_\theta$ 下的逐网格贝叶斯最优判决；（c）$\widehat\pi_i(1-\widehat\pi_i)\to\operatorname{Var}_\theta[s_i\mid\mathcal Z]$。

**命题 4（真实后验下的极限）。** 假设模型正确设定、$\mathcal Z$ 充分，且观测在给定 $\mathbf s$ 时条件独立。对 $i\notin\mathcal A$，边缘概率等于条件先验 $p(s_i=1\mid\mathbf s_{\mathcal A})$，数据无法降低其方差。对 $i\in\mathcal A$，令 $n_i$ 为把 $\mathbf s^\star$ 与在网格 $i$ 上不同的备选场景区分开的观测数，则共识恢复 $s_i^\star$ 的误差随 $n_i$ 衰减。

### F.1 命题 3 的证明

固定网格 $i$。每个样本 $\widehat s_i^{(m)}$ 是参数为 $\pi_i^\theta$ 的伯努利变量，且样本相互独立，因为每条反向轨迹由独立噪声驱动。

**(a) 集中性。** 变量取值于 $[0,1]$，Hoeffding 不等式给出：对任意 $\varepsilon>0$，

$$
\Pr\!\left[|\widehat\pi_i-\pi_i^\theta|\ge\varepsilon\right]\le2\exp(-2M\varepsilon^2),\tag{17}
$$

并由强大数定律，$M\to\infty$ 时 $\widehat\pi_i\to\pi_i^\theta$。

**(b) 判决。** 共识 $\widehat s_i^{\mathrm{cons}}=\mathbf1[\widehat\pi_i>1/2]$ 与 $\mathbf1[\pi_i^\theta>1/2]$ 不同，仅当 $\widehat\pi_i$ 落到 $1/2$ 的另一侧，这要求 $|\widehat\pi_i-\pi_i^\theta|\ge|\pi_i^\theta-1/2|$。在式（17）中取 $\varepsilon=|\pi_i^\theta-1/2|$，得

$$
\Pr\!\left[\widehat s_i^{\mathrm{cons}}\ne\mathbf1\!\left[\pi_i^\theta>\frac12\right]\right]
\le2\exp\!\left(-2M\left(\pi_i^\theta-\frac12\right)^2\right).\tag{18}
$$

极限 $\mathbf1[\pi_i^\theta>1/2]$ 是 $p_\theta$ 下网格 $i$ 在 0–1 损失下的贝叶斯判决，即逐网格汉明误差期望的最小化者：对伯努利后验，最优判决就是取更可能的值。

**(c) 方差。** 映射 $x\mapsto x(1-x)$ 连续，由连续映射定理，$\widehat\pi_i(1-\widehat\pi_i)\to\pi_i^\theta(1-\pi_i^\theta)=\operatorname{Var}_\theta[s_i\mid\mathcal Z]$。$\square$

**两点注记。** 其一，式（18）说明所需样本数按 $1/(\pi_i^\theta-1/2)^2$ 伸缩：边缘概率接近 $1/2$ 的网格恰是需要多次抽样才能稳定、也是样本分歧最大的网格——估计的不稳定与它所反映的歧义是同一现象。其二，该命题只涉及**学得的**后验：它说明抽样提取的是已编码在 $p_\theta$ 中的判决，本身不增加信息。

### F.2 命题 4 的证明

作者不假设每个被覆盖网格都有统一的信息缺口，而是直接用哪些观测能区分竞争假设来定义相关计数。

**定义 1（区分性观测）。** 若 $\mathcal F(\mathbf s,\mathbf p_k)\ne\mathcal F(\mathbf s',\mathbf p_k)$，即两个场景对链路 $k$ 诱导出不同的路径参数，则称观测 $k$ 区分场景 $\mathbf s,\mathbf s'$。对网格 $i$，记 $n_i$ 为把 $\mathbf s^\star$ 与在网格 $i$ 上不同的备选场景区分开的观测数。

有两类 $X_k=0$ 的情形按构造被排除在 $n_i$ 之外：$i\notin\mathfrak a_k$ 的观测对网格 $i$ 不变；对该场景对“角色退化”的观测尽管覆盖了该网格，却按命题 2 在两个假设下诱导相同的路径参数。二者都不需要额外假设，且一般有 $n_i\le|\{k:i\in\mathfrak a_k\}|$。

假设：（A1）模型正确设定，$p_\theta(\cdot\mid\mathcal Z)=p(\cdot\mid\mathcal O)$ 且 $\mathcal Z$ 对 $\mathbf s$ 充分；（A2）前向不变性，$p(\mathcal O\mid\mathbf s)$ 只通过 $\mathbf s_{\mathcal A}$ 依赖 $\mathbf s$；（A3）条件独立，观测在给定 $\mathbf s$ 时独立；（A4）正则性，对数似然比 $X_k$ 为次指数变量，其矩母函数在原点附近存在。

**(i) 不可观测网格。** 令 $i\notin\mathcal A$。把先验分解为 $p(\mathbf s)=p(\mathbf s_{\mathcal A})p(\mathbf s_{\mathcal A^c}\mid\mathbf s_{\mathcal A})$，并对贝叶斯公式应用（A2），即得式（2）的分解，其中 $\mathcal O$ 不出现在第二个因子。边缘化后 $\pi_i=p(s_i=1\mid\mathbf s_{\mathcal A})$，即网格 $i$ 处的信念完全由以场景可观测部分为条件的先验提供。随着数据使 $p(\mathbf s_{\mathcal A}\mid\mathcal O)$ 变尖，网格 $i$ 的方差收敛到先验条件方差 $\operatorname{Var}_{\mathrm{prior}}[s_i\mid\mathbf s_{\mathcal A}^\star]$——这是测量无法压低的下限。该结论在下面两种情形下都成立。

**(ii) 可观测网格。** 前向映射对**物理**场景是确定的（网格几何、建筑高度与材质属性；射线追踪据此计算传播），但占据网格 $\mathbf s$ 只是该描述的粗粒度投影。记物理场景为 $\mathrm{g}$，许多 $\mathrm{g}$ 与同一网格相容却产生不同信道；因此进入后验的似然是边缘分布

$$
p(\mathbf H_k\mid\mathbf s)=\int p(\mathbf H_k\mid\mathrm{g})\,p(\mathrm{g}\mid\mathbf s)\,d\mathrm{g},\tag{19}
$$

即使仿真器本身无噪，它也是对信道实现的密度而不是点质量，因此下文的 KL 散度有良好定义。令 $\delta_i>0$ 表示在 $n_i$ 计及的区分性观测与网格 $i$ 处竞争的备选场景 $\mathbf s'$ 上取的最小散度 $\mathrm{KL}\!\left(p(\mathbf H_k\mid\mathbf s^\star)\,\|\,p(\mathbf H_k\mid\mathbf s')\right)$；区分性保证 $\delta_i>0$。利用（A3），$\mathbf s^\star$ 与该备选场景之间的对数后验几率可分解为

$$
L=\log\frac{p(\mathbf s^\star\mid\mathcal O)}{p(\mathbf s'\mid\mathcal O)}
=\underbrace{\log\frac{p(\mathbf s^\star)}{p(\mathbf s')}}_{=:L_0}+\sum_{k=1}^{K}X_k,\qquad
X_k=\log\frac{p(\mathbf H_k\mid\mathbf s^\star)}{p(\mathbf H_k\mid\mathbf s')},\tag{20}
$$

其中对每个非区分性观测 $X_k\equiv0$，只剩 $n_i$ 个非零项。在真值下取期望有 $\mathbb E[X_k]\ge\delta_i$，因此漂移 $\mathbb E[\sum_k X_k]\ge n_i\delta_i$ 随 $n_i$ 线性增长，而由独立性，和的标准差为 $O(\sqrt{n_i})$。网格 $i$ 出错需要 $L\le0$，即和至少低于其均值 $n_i\delta_i+L_0$。Chernoff 界给出：对适当 $\lambda>0$，

$$
\Pr\!\left[\sum_k X_k+L_0\le0\right]
\le e^{\lambda L_0}\prod_{k\ \text{separating}}\mathbb E\!\left[e^{-\lambda X_k}\right]
\le e^{-c\,n_i\delta_i},\tag{21}
$$

其中常数 $c>0$ 取决于次指数参数，当 $n_i$ 足够大时 $L_0$ 被吸收。结合（A1）与命题 3，共识以随 $n_i\delta_i$ 衰减的误差恢复 $s_i^\star$。$\square$

**注记。** 式（19）的随机性来自问题本身，而非测量噪声的产物：占据网格并不决定建筑高度、立面材质或亚网格几何，而这些都会塑造信道，因此某网格的占用只是在分布意义上约束所观测信道。这与附录 B.3 讨论的表征缺口相同——链路可能整体从被占据网格上方通过。它同时给出任何数据量所能达到的界限：$\delta_i$ 受网格未指定的物理场景部分限制，这也是第 4.4 节精度随观测累积仍饱和在 1 以下的原因之一。决定某网格恢复的是 $n_i$，即真正把该处竞争假设区分开的观测数，它同时排除了未覆盖观测与角色退化观测。因此角色退化不会终止恢复，只会减少有效的信息观测数；只有当部署中每条链路对某对在该网格处不同的场景都不具区分性时，该网格才会保持未解。关于（A1），扩散模型只在数据与容量的极限下相合，并非在有限规模下相合，所以该命题描述的是理想后验，而实证问题是 $p_\theta$ 逼近它的程度；与以原始信道为条件的解码器的对比，检验的正是该假设中“充分性”的一半。关于（A2），真实传播会把弱能量泄漏到主导路径之外，因此实践中 $\mathcal A$ 的边界是软的，$\mathcal A^c$ 上的集中是慢的而不是严格不存在。

## 附录 G：数据集与训练细节

**数据集。** 信道用 Sionna RT（Hoydis et al., 2023）在 200 个城市、超过 11,000 个室外城市场景上仿真，每个场景覆盖 200 m × 200 m 区域，三维建筑几何由 OpenStreetMap（OpenStreetMap contributors, 2023）经 Geo2SigMap 流程（Li et al., 2024）提取。仿真载频 5.8 GHz、带宽 100 MHz、128 个子载波。基站配 $N_{\mathrm{tx}}=32$ 元均匀线阵，高度 15 m，每个环境服务 2,000 多个随机放置的用户，每个用户配 $N_{\mathrm{rx}}=8$ 元均匀线阵，高度 1.5 m。数据集含 3,000 万以上样本，每个样本由复信道张量、用户位置与建筑高度图组成。占据网格取 $20\times20$、即 $\Delta R=10$ m，其单元格与基础模型的场景 patch 一致。传播相关集合按附录 A 所述由射线追踪记录。

**基础模型预训练。** 编码器为 12 层 Transformer，嵌入维 512，上下文窗口 2,450 个 token，约 6,000 万可训练参数。预训练使用式（16）的目标，并采用渐进式掩蔽组合比例；在 32 块 NVIDIA L40 GPU 上训练 9,600 GPU 小时、共 48 个 epoch，处理约 8,820 亿 token。

**扩散解码器训练。** 去噪器深度 6、宽度 192、6 个注意力头、MLP 比 4，并用线性适配器把 512 维编码器嵌入映射到解码器宽度。由于编码器冻结，[PHYSC] 嵌入按场景对至多 2,000 次观测一次性提取并缓存，因此解码器训练不涉及通过编码器的前向或反向传播。取 $T=1000$、附录 E 的余弦日程、条件丢弃 $p_{\mathrm{drop}}=0.15$。为用一个模型服务任意观测数，每训练步的观测数从 $[K_{\min},K_{\max}]=[100,500]$ 均匀重抽，并在批次内各场景间共享。训练用 AdamW，学习率 $10^{-4}$、权重衰减 $10^{-4}$，第一轮从 $0.1\times$ 基础学习率线性预热后余弦衰减，梯度范数截断 1.0；8 块 GPU、每块 32 个场景，训练 100 轮、每轮 500 步。采样使用条件预测、不加引导，共识由 $M=32$ 个样本形成。

**评测。** 所有模型在 671 个留出测试环境上评测。对每个场景，观测只在最大扫描值 $K=1000$ 处载入一次，每个更小的 $K$ 使用同一序列的前缀，因此各扫描点的观测集是嵌套的，$K$ 之间的差异来自新增观测而非重新采样。每个模型对各场景的逐观测编码只算一次并在各扫描点复用；每个 $K$ 只重复融合步骤，或对两个扩散模型重复反向扩散采样。

## 附录 H：Marginal Prob. + FM

**逐观测解码器。** 该变体完整复用预训练模型，包括预训练阶段的轻量解码器。每次观测在高度图输入被完全掩蔽的条件下编码，解码器只凭信道和位置预测每个场景 patch 的占用：

$$
q_{k,i}=\sigma\!\left(g_\psi(f_\phi(\mathbf H_k,\mathbf p_k))_i\right),\tag{22}
$$

即仅由观测 $k$ 支持的占用信念。与 Diffusion + FM 不同，这里编码器不冻结：$\phi$ 与 $\psi$ 在下述目标下联合微调。

**置信度塑形目标。** 令 $\mathfrak a_k$ 为观测 $k$ 的传播相关集合，$\partial\mathfrak a_k$ 为距 $\mathfrak a_k$ 一步（8 连通）且不在其中的单元格，$u_k=(\mathfrak a_k\cup\partial\mathfrak a_k)^c$ 为其余单元格。记 $\mathrm{BCE}_\beta(q,s)=-[\beta s\log q+(1-s)\log(1-q)]$ 为类别平衡交叉熵，其中 $\beta=(1-\rho)/\rho$、$\rho$ 为场景中占据单元格的比例（截断到 $[0.01,0.99]$）。训练目标为

$$
\mathcal L_{\mathrm{marg}}=
\frac{1}{|\mathfrak a_k|}\sum_{i\in\mathfrak a_k}\mathrm{BCE}_\beta(q_{k,i},s_i)
-\lambda_c\frac{1}{|\mathfrak a_k|}\sum_{i\in\mathfrak a_k}\left|2q_{k,i}-1\right|
+\lambda_n\frac{1}{|\partial\mathfrak a_k|}\sum_{i\in\partial\mathfrak a_k}\mathrm{BCE}_\beta(q_{k,i},s_i)
+\lambda_u\frac{1}{|u_k|}\sum_{i\in u_k}\left(q_{k,i}-\frac12\right)^2.\tag{23}
$$

第一项拟合观测真正约束的单元格占用，第二项奖励这些位置的自信预测，第三项以较小权重监督相关集合边界（与路径相邻的单元格只受部分约束），第四项把观测触及不到的单元格预测推向 $1/2$。最后一项正是信念意义的来源：若只有交叉熵，每个单元格都会被推向确定标签，信念便无法再指示观测在何处无信息。传播相关集合只在训练时用于构造该损失，推断时并不需要。取 $\lambda_c=0.1$、$\lambda_n=0.3$、$\lambda_u=0.5$，第一项权重为 1。训练用 AdamW，学习率 $10^{-5}$、权重衰减 $10^{-4}$，每块 GPU 32 次观测，第一轮线性预热后余弦衰减，梯度范数截断 1.0，训练 20 轮，每轮覆盖训练语料的四分之一。

**置信度门控的几何融合。** 逐观测信念用置信度门控、几何加权的平均合并：一次观测只在它对某单元格的信念足够自信、且按该单元格到其链路的距离加权时才参与该单元格的投票，

$$
w_{k,i}=\gamma_{k,i}\,\mathbf 1\!\left[|2q_{k,i}-1|>\tau_c\right],\qquad
\gamma_{k,i}=\exp\!\left(-\frac{d_{k,i}^2}{2\sigma^2}\right),
$$

$$
P_i=\frac{\sum_k w_{k,i}q_{k,i}}{\sum_k w_{k,i}},\qquad
\widehat s_i=\mathbf 1\!\left[P_i>\frac12\ \wedge\ \sum_k w_{k,i}>\kappa\right],\tag{24}
$$

其中 $d_{k,i}$ 是单元格 $i$ 中心到基站—用户 $k$ 连线段的距离。几何权重只依赖推断时已知的基站与用户位置，传播相关集合不被使用。没有得到足够权重投票的单元格判为自由，因此每个单元格都有判决，全部指标都在整幅网格上计算。取 $\tau_c=0.75$、$\sigma=50$ m、$\kappa=0.05$。置信度门控使融合能够丢弃对某单元格无信息的观测，而它之所以有效，正是因为式（23）把这类信念推向 $1/2$。

## 附录 I：基线

**Diffusion + Raw Meas.** 去噪器结构、噪声日程、采样器与共识样本数都与 Diffusion + FM 相同。条件集合由原始观测经可学习 token 化器 $\tau_\omega$ 构成，并与解码器联合训练：

$$
\mathcal Z_{\mathrm{raw}}=\left\{\tau_\omega(\mathbf H_k,\mathbf p_k)\right\}_{k=1}^{K},\qquad
(\theta^\star,\omega^\star)=\arg\min_{\theta,\omega}\mathbb E_{(\mathbf s,\mathcal O)\sim\mathcal D}\mathbb E_{t,\boldsymbol\epsilon}\left[\left\|\boldsymbol\epsilon-\epsilon_\theta(\mathbf x_t,t,\mathcal Z_{\mathrm{raw}})\right\|_2^2\right].\tag{25}
$$

token 化器 $\tau_\omega$ 是 3 层、宽 256、8 头的浅层 Transformer 编码器。每个原始观测按基础模型的信道前端 token 化——每个收发天线对加 16 个子载波为一组、一个 token，共 2,048 个信道 token，并沿发射、接收、子载波轴使用因式化正弦位置编码——再加一个位置 token，编码后的序列经均值池化为每次观测一个 token。因此条件集合 $\mathcal Z_{\mathrm{raw}}$ 的基数与它所替代的 [PHYSC] 嵌入集合相同，均为 $K$，并通过线性适配器进入同一去噪器。$\tau_\omega$ 与 $\theta$ 从零开始联合训练，学习率 $10^{-4}$、条件丢弃 0.15、$K$ 从 $[100,500]$ 抽取，在 32 块 GPU 上训练 100 轮。由于解码器保持不变，它与 Diffusion + FM 的任何差异都可归因于条件。

**Marginal Prob. + Raw Meas.** 一个 12 层、宽 512、16 头的编码器 $h_\omega$（容量与基础模型编码器匹配、使用相同的信道与位置 token 化）从零开始在单次原始观测上训练，配 $N^2$ 个可学习位置查询 token（每单元格一个）读出整幅网格的占用：

$$
\widetilde q_{k,i}=\sigma\!\left(h_\omega(\mathbf H_k,\mathbf p_k)_i\right),\qquad
\mathcal L_{\mathrm{naive}}=\frac{1}{N^2}\sum_{i=1}^{N^2}w_{k,i}\,\mathrm{BCE}_\beta\left(\widetilde q_{k,i},s_i\right),\quad
w_{k,i}=\begin{cases}3,&i\in\mathfrak a_k,\\1,&\text{otherwise}.\end{cases}\tag{26}
$$

训练用 AdamW，学习率 $5\times10^{-5}$、权重衰减 $10^{-4}$，每块 GPU 32 次观测、共 32 块 GPU，第一轮线性预热后余弦衰减，梯度范数截断 1.0，训练 32 轮、每轮覆盖训练语料的四分之一。逐观测估计用与 Marginal Prob. + FM 相同的规则（式（24））融合，参数完全一致，因此两模型只在表征与训练目标上不同，在融合上相同。此处置信度门控失效：式（26）的损失对每个单元格都用硬标签监督，无论观测是否约束它——相关单元格被加权，但 $\mathfrak a_k$ 之外的单元格仍被推向其占用标签而不是 $1/2$。于是对观测从未感知的单元格，信念是自信的、能通过门控并进入平均。此时唯一剩下的筛选是几何权重，而它反映的是与视距段的接近程度而不是传播相关集合：反射路径会到达远离该线段的单元格，靠近该线段的单元格也未必与链路发生任何作用。

## 附录 J：评价指标

对重建 $\widehat{\mathbf s}$ 与真值 $\mathbf s$，令 TP、FP、TN、FN 统计四种结果的单元格数（占据单元格为正类），报告

$$
\mathrm{BA}=\frac12\left(\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FN}}+\frac{\mathrm{TN}}{\mathrm{TN}+\mathrm{FP}}\right),\qquad
\mathrm{F1}=\frac{2\,\mathrm{TP}}{2\,\mathrm{TP}+\mathrm{FP}+\mathrm{FN}},\qquad
\mathrm{IoU}=\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FP}+\mathrm{FN}}.\tag{27}
$$

平衡准确率对两类等权，因此常数或随机预测器无论占据比例多少都只得 50%，这使它成为机会水平的合适指标。F1 与 IoU 只依赖占据类，对多数场景中占主导的、被正确预测的自由空间不敏感，因而是更严格的轮廓恢复度量。对单个场景二者满足 $\mathrm{IoU}=\mathrm{F1}/(2-\mathrm{F1})$，但逐场景平均后不再相等，两者都报告以便与既有工作比较。全部指标在整幅 $N\times N$ 网格上逐场景计算，再对 671 个测试场景取平均。

## 附录 K：预训练表征的物理解释

第 3 节的层次设计建立在如下论断上：[PHYSC] token 概括的是产生观测的物理结构，而不是作为信号的信道。本附录不依赖重建任务，直接考察表征空间本身的几何来检验这一点。

**设置。** 用冻结的基础模型编码一组留出观测，并用 t-SNE（van der Maaten & Hinton, 2008）把得到的 [PHYSC] 嵌入投影到二维，从而保留局部邻域结构。作为对照，对计算这些嵌入所用的原始信道测量施加完全相同的投影。嵌入中可见而原始信道中不可见的结构，就是预训练目标引入的结构，因为编码器并不创造信息（第 2.3 节）。作者按三种属性给同一对投影着色，每种对应传播问题的一个侧面：用户位置的空间簇、链路的主导传播方向、观测所在环境的身份。

**观察。** 图 7 给出投影结果。三种着色下 [PHYSC] 嵌入形成的结构都明显比原始信道清晰，且三者分别对应本工作的不同判断。

按**用户位置**可分，说明该表征能分辨链路终止于何处——这是把观测携带的证据放到场景正确位置的前提。按**主导传播方向**可分，说明该表征解开了信道的角度分量，即决定一条链路与哪些结构发生作用的出发与到达方向，而不是保留这些分量混合其中的原始叠加。按**场景身份**可分与本工作最直接相关：同一环境中的观测被编码到相近的点，尽管用户位置不同、观测到的信道不同。因此该表征携带的是产生测量的环境信息，而不只是测量本身；这正是来自同一场景的一组嵌入能作为该场景后验的有效条件集合的原因。

**与条件化论证的关系。** 原始信道所含的信息不少于由它算出的嵌入，因此图 7 的对比不是信息含量的对比，而是可获取性的对比。在原始空间中，共享同一环境的观测并不相邻，在该空间条件化的解码器必须先学会从信道结构到场景结构的映射，才能利用条件；在表征空间中，这一结构已经显露。这是第 3 节可学习性论证的几何对应物，也与第 4 节两种条件化方案的表现一致：以原始测量为条件的扩散解码器不随观测累积而改善，而以 [PHYSC] 嵌入为条件的同一解码器则改善。

## 附录 L：位置信息的可得性

每次无线观测表示为信道测量与对应用户位置 $(\mathbf H_k,\mathbf p_k)$。为评估位置信息不完整的影响，作者把带位置标签的测量比例从 10% 变到 100%，同时保持每场景测量总数固定为 $K=500$。图 8 报告由此得到的平衡准确率。

原文对图 8 的读数：除 Diffusion + Raw Meas. 外，所有模型都随位置可得性提高而改善并最终饱和。Diffusion + FM 从 10% 时的 0.56 升到 100% 时的 0.76；Marginal Prob. + FM 从 0.62 升到 0.74；Marginal Prob. + Raw Meas. 从 0.54 升到 0.62。相反，Diffusion + Raw Meas. 全程维持在 0.50 附近。

位置信息之所以关键，是因为信道测量揭示了传播诱导的几何信息，但它本身并不把该信息锚定到场景中的绝对位置。用户位置把传播证据映射到具体的场景单元格，使模型能够对与每次观测相关的结构作空间定位；因此降低位置可得性也就直接减少了可用于重建的空间锚定证据。

性能曲线在约一半测量带有位置信息后基本饱和，说明一旦建立起足够的空间覆盖，额外的有标签观测收益递减。在低可得性时 Marginal Prob. + FM 起初优于 Diffusion + FM，随着带位置标签的观测增多次序反转。这一行为反映了两种推断机制：边缘概率形式采用显式几何融合规则，在锚定证据稀疏时仍有效；扩散模型则更受益于足够丰富、可经学得后验联合整合的观测集合。

最后，Diffusion + Raw Meas. 在整个扫描区间几乎不变的表现进一步说明，其重建质量差的主要原因不是位置信息不足，而是无法有效利用原始信道测量作为条件信息。

## 附录 M：位置信息含噪时的鲁棒性

附录 L 研究的是部分观测缺失位置标签的情形。部署中另一种非理想情形是：每次观测都带位置，但位置不准确。因此作者用扰动位置 $\widetilde{\mathbf p}_k=\mathbf p_k+\mathbf e_k$、$\mathbf e_k\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I_2)$、每个水平轴 $\sigma=5$ m、逐观测独立抽样，评测全部模型。所有模型都在精确位置上训练，噪声只在测试时施加，每场景 $K=500$ 次观测，其余设置与第 4 节相同。在该模型下径向误差 $\|\mathbf e_k\|$ 服从 Rayleigh 分布，中位数 $\sigma\sqrt{2\ln 2}\approx5.9$ m，均值 $\sigma\sqrt{\pi/2}\approx6.3$ m，第 95 百分位约 12.2 m。该范围与室外城市场景中消费级 GNSS 的表现相当（Merry & Bettinger, 2019；Palathinkal et al., 2026）。

**表 3：用户位置含噪（每轴 $\sigma=5$ m，$K=500$）下的重建。** 括号内为均值相对精确位置（表 1）的相对变化；↑ 表示越大越好。

| 模型 | 平衡准确率：均值（变化） / 中位 / P90 | F1：均值（变化） / 中位 / P90 | IoU：均值（变化） / 中位 / P90 |
|---|---|---|---|
| Diffusion + Raw Meas. | 0.505 (±0.0%) / 0.500 / 0.517 | 0.053 (−1.5%) / 0.018 / 0.150 | 0.030 (±0.0%) / 0.009 / 0.081 |
| Marginal Prob. + Raw Meas. | 0.609 (−1.9%) / 0.604 / 0.655 | 0.374 (−5.9%) / 0.371 / 0.480 | 0.233 (−7.1%) / 0.228 / 0.315 |
| Marginal Prob. + FM（本文） | 0.728 (−1.4%) / 0.725 / 0.797 | 0.617 (−2.5%) / 0.619 / 0.714 | 0.453 (−3.7%) / 0.449 / 0.556 |
| Diffusion + FM（本文） | 0.696 (−8.2%) / 0.676 / 0.829 | 0.553 (−16.5%) / 0.538 / 0.763 | 0.397 (−21.6%) / 0.368 / 0.617 |

**结果。** 表 3 显示，在位置信息非理想时本文设计的两种流程仍远高于基线。值得注意的是，扩散解码器把每个嵌入都当作关于特定位置的精确证据，且在训练中从未见过错位证据；当不同观测的证据被错移到不同方向时它们相互冲突，后验样本在受影响单元格上分歧、其边缘概率向 $1/2$ 移动，共识读出随之抑制本可恢复的轮廓。该机制主要移除真阳，这与 F1 和 IoU 的降幅大于平衡准确率一致。

Diffusion + FM 的敏感性属于训练—测试失配，而不是后验形式的局限，并且可以直接处理。可以把位置误差与位置缺失纳入观测模型：用由扰动或缺失位置算出的嵌入训练解码器，同时保持干净占用 $\mathbf s$ 作为目标，解码器便学到这些条件下的 $p_\theta(\mathbf s\mid\widetilde{\mathcal Z})$，而结构与训练目标都不变。作者把这一实现留作未来工作。

## 附录 N：全部模型重建结果的可视化

图 9 与图 10 分两页给出全部模型的重建结果与真值场景的视觉对比，每行从左到右依次为：真值、Diffusion + FM（本文）、Marginal Prob. + FM（本文）、Marginal Prob. + Raw Meas.、Diffusion + Raw Meas.。原文未附逐场景定量数值；本站不上传图像，此处仅记录版式与列序。

## 参考文献

原文使用作者—年份（author–year）引用制，参考文献表未编号。以下按原文顺序逐条转录英文原条目并加序号，便于站内核对（共 29 条，源文 pp. 10–12）。

[1] Ian F Akyildiz, Ahan Kak, and Shuai Nie. 6G and beyond: The future of wireless communications systems. IEEE Access, 8:133995–134030, 2020.

[2] Anatoly Bakushinsky and A Goncharsky. Ill-posed problems: theory and applications. Springer Science & Business Media, 2012.

[3] David Borts, Julian Ost, Shamik Basu, Tim Broedermann, Andrea Ramazzina, Christos Sakaridis, Mario Bijelic, and Felix Heide. Carafe: Camera-radar radiance fields for scene reconstruction. In Proceedings of the Special Interest Group on Computer Graphics and Interactive Techniques Conference Papers, pp. 1–12, 2026.

[4] Eugene Casmin and Rodolfo Oliveira. Survey on context-aware radio frequency-based sensing. Sensors, 25(3):602, 2025.

[5] Umut Demirhan and Ahmed Alkhateeb. Integrated sensing and communication for 6G: Ten key machine learning roles. IEEE Communications Magazine, 61(5):113–119, 2023.

[6] Laura Dodds, Maisy Lam, Waleed Akbar, Yibo Cheng, and Fadel Adib. Wave-former: Through-occlusion 3D reconstruction via wireless shape completion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 21713–21724, 2026.

[7] Ivan Dokmanić, Reza Parhizkar, Andreas Walther, Yue M Lu, and Martin Vetterli. Acoustic echoes reveal room shape. Proceedings of the National Academy of Sciences, 110(30):12186–12191, 2013.

[8] Yara El Baba, Andreas Walther, and Emanuël A P Habets. 3D room geometry inference based on room impulse response stacks. IEEE/ACM Transactions on Audio, Speech, and Language Processing, 26(5):857–872, 2018.

[9] Thomas Hehn, Markus Peschl, Tribhuvanesh Orekondy, Arash Behboodi, and Johann Brehmer. Differentiable and learnable wireless simulation with geometric transformers. In International Conference on Learning Representations (ICLR), 2025.

[10] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, volume 33, 2020.

[11] Jakob Hoydis, Fayçal Aït Aoudia, Sebastian Cammerer, Merlin Nimier-David, Nikolaus Binder, Guillermo Marcus, and Alexander Keller. Sionna RT: Differentiable ray tracing for radio propagation modeling. In IEEE Globecom Workshops (GC Wkshps), pp. 317–321, 2023.

[12] Haowen Lai, Zitong Lan, and Mingmin Zhao. Non-line-of-sight 3D reconstruction with radar. Advances in Neural Information Processing Systems, 38:72844–72869, 2026.

[13] Yiming Li, Zeyu Li, Zhihui Gao, and Tingjun Chen. Geo2SigMap: High-fidelity RF signal mapping using geographic databases. In IEEE International Symposium on Dynamic Spectrum Access Networks (DySPAN), pp. 277–285, 2024.

[14] Chris Xiaoxuan Lu, Stefano Rosa, Peijun Zhao, Bing Wang, Changhao Chen, John A Stankovic, Niki Trigoni, and Andrew Markham. See through smoke: Robust indoor mapping with low-cost mmWave radar. In Proceedings of the International Conference on Mobile Systems, Applications, and Services (MobiSys), pp. 14–27, 2020.

[15] Laurens van der Maaten and Geoffrey Hinton. Visualizing data using t-SNE. Journal of Machine Learning Research, pp. 2579–2605, 2008.

[16] Krista Merry and Pete Bettinger. Smartphone GPS accuracy study in an urban environment. PloS One, 14(7):e0219890, 2019.

[17] Alexander Quinn Nichol and Prafulla Dhariwal. Improved denoising diffusion probabilistic models. In International Conference on Machine Learning (ICML), pp. 8162–8171, 2021.

[18] OpenStreetMap contributors. OpenStreetMap. https://www.openstreetmap.org, 2023.

[19] Joshua Roy Palathinkal, Hardani Ismu Nabil, Muhammad Iqbal Rochman, Hossein Nasiri, Francis A Gatsi, and Monisha Ghosh. Evaluating smartphone GNSS accuracy for geofenced 6 GHz operations. In 2026 IEEE International Symposium on Spectrum Innovation (DySPAN), pp. 1–6. IEEE, 2026.

[20] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International Conference on Machine Learning, pp. 8748–8763. PMLR, 2021.

[21] Aditya Ramesh, Prafulla Dhariwal, Alex Nichol, Casey Chu, and Mark Chen. Hierarchical text-conditional image generation with CLIP latents. arXiv preprint arXiv:2204.06125, 2022.

[22] Yifei Sun, Jie Li, Tong Zhang, Rui Wang, Xiaohui Peng, Xiao Han, and Haisheng Tan. An indoor environment sensing and localization system via mmWave phased array. Journal of Communications and Information Networks, 7(4):383–393, 2022.

[23] Paolo Testolina, Michele Polese, Pedram Johari, and Tommaso Melodia. Boston Twin: The Boston digital twin for ray-tracing in 6G networks. In Proceedings of the ACM Multimedia Systems Conference (MMSys), pp. 441–447, 2024.

[24] Jiacheng Wang, Hongyang Du, Dusit Niyato, Jiawen Kang, Shuguang Cui, Xuemin Shen, and Ping Zhang. Generative AI for integrated sensing and communication: Insights from the physical layer perspective. IEEE Wireless Communications, 31(5):246–255, 2024.

[25] Inmo Yeon and Jung-Woo Choi. RGI-Net: 3D room geometry inference from room impulse responses with hidden first-order reflections. In IEEE International Workshop on Acoustic Signal Enhancement (IWAENC), pp. 439–443, 2024.

[26] Inmo Yeon, Iljoo Jeong, Seungchul Lee, and Jung-Woo Choi. EchoScan: Scanning complex room geometries via acoustic echoes. IEEE/ACM Transactions on Audio, Speech, and Language Processing, 2024.

[27] Mingmin Zhao, Tianhong Li, Mohammad Abu Alsheikh, Yonglong Tian, Hang Zhao, Antonio Torralba, and Dina Katabi. Through-wall human pose estimation using radio signals. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 7356–7365, 2018.

[28] Xiaopeng Zhao, Zhenlin An, Qingrui Pan, and Lei Yang. NeRF²: Neural radio-frequency radiance fields. In Proceedings of the Annual International Conference on Mobile Computing and Networking (MobiCom), 2023.

[29] Kaichen Zhou, Laura Dodds, Sayed Saad Afzal, and Fadel Adib. RISE: Single static radar-based indoor scene understanding. arXiv preprint arXiv:2511.14019, 2025.

## 范围与校对状态

本页原为逐节译稿，仅含摘要与第 1—3 节。本轮补译：第 4 节全部内容（实验设置与四个模型的定位、表 1、4.1 主要结果、4.2 学得信念的物理解释、4.3 场景密度与表 2、4.4 测量数目的影响）、第 5 节结论、附录 A—N 全部章节（含式（6）—（27）：前向模型、不适定性的三条来源与命题 1／2、基础模型结构与 token 化、完整预训练目标、扩散解码器细节、附录 F 中命题 3／4 的完整证明与定义 1、假设 A1—A4、式（19）—（21）、数据集与训练配置、Marginal Prob. + FM（式 22—24）、两个基线（式 25—26）、指标（式 27）、表征物理解释、位置可得性、位置含噪与表 3、可视化）、以及全部 29 条参考文献（英文原条目）。引用源文页码：第 4—5 节为 pp. 7—9；附录 A—F 为 pp. 12—18；附录 G—N 为 pp. 18—24；书目为 pp. 10—12。

尚余：① 与源 PDF 的逐句人工终校（本轮依据 `sources` 抽取文本补译，抽取文本对双栏与公式存在少量错行，已按编号与上下文交叉核对）；② 图 1—10 原始图像未转录（站点不上传图像，仅保留中文图注与关键数值）；③ 图 7 的 t-SNE、图 8 的曲线与图 9—10 的对比图无法以文字复现；④ 个别上下标在抽取中失真处已按上下文统一记号。**因此本页仍为“未完成”状态的补译稿，不声明通过全文 QA。**

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
