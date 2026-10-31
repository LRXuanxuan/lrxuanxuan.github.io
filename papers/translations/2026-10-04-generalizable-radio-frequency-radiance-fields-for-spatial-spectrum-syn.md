---
layout: page
title: "面向空间谱合成的可泛化射频辐射场｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-04-generalizable-radio-frequency-radiance-fields-for-spatial-spectrum-syn/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6cecae8cc71b3be3/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 面向空间谱合成的可泛化射频辐射场

**原题：** Generalizable Radio-Frequency Radiance Fields for Spatial Spectrum Synthesis  
**作者：** Kang Yang、Yuning Chen、Wan Du  
**单位：** 加州大学默塞德分校（University of California, Merced）；邮箱：{kyang73, ychen372, wdu3}@ucmerced.edu。  
**版本：** 会议论文集版本（Yang_Generalizable_Radio-Frequency_Radiance_Fields_for_Spatial_Spectrum_Synthesis，CVPR 2026；CVF Open Access 版本），本地 PDF 11 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、第 1–6 节正文与编号小节、图 1–6 中文图注、表 1–6 逐格转写、定理 1、致谢，以及参考文献 59 条英文原条目（按原编号）。原文的补充材料（Supplementary Materials，含 §A–§F）不在本地 11 页论文集版本内，故本页未纳入翻译范围。逐句逐式终校未做。

## 摘要

我们提出 GRaF（Generalizable Radio-Frequency Radiance Fields，可泛化射频辐射场），一个对射频（RF）信号传播建模、在任意发射机或接收机位置合成空间谱的框架；这里每个空间谱度量接收机处所有方向上的信号功率。与把原始神经辐射场（NeRF）适配到 RF 域并做场景特定训练的最先进方法不同，GRaF 跨场景泛化以合成空间谱。为实现这一点，我们证明 RF 域中的插值理论：某发射机的空间谱可用地理邻近发射机的空间谱近似。基于该理论，GRaF 包含两个组件：(i) 一个几何感知 Transformer 编码器，从邻近发射机捕捉空间相关性以学习场景无关的潜在 RF 辐射场；(ii) 一个神经光线追踪算法，估计接收机处的空间谱接收。实验结果表明，GRaF 在单场景基准上优于现有方法，并在未见场景布局上达到最先进性能。

## 1. 引言

WiFi 与第六代（6G）蜂窝网络等无线通信系统的演进，已在智慧城市与智慧医疗等领域催生变革性应用 [13, 19, 38, 40]。这些网络既是通信骨干，也是感知平台。可靠通信需要细致的网络规划以缓解死区与中断等问题 [1]；而基于 WiFi 的定位 [3, 34] 等感知应用则依赖大量高质量数据来训练深度神经网络（DNN）。为通信与感知采集数据需要开展现场勘测 [15, 48, 49]。然而此类勘测需要在大量位置进行密集测量，既耗时又耗力 [10, 18]。

一种替代方案是通过传播建模合成射频（RF）数据集，生成捕捉接收机周围所有方向接收功率的空间谱（§2.1）。给定发射机与接收机位置，RF 传播建模在考虑反射、绕射与散射的同时估计接收谱 [17, 32]。在自由空间中，Maxwell 方程 [28] 可实现精确信号计算 [45]；但在复杂实际环境中，直接求解变得棘手 [57]。为近似这些场景，光线追踪仿真 [12, 14, 27, 54] 使用计算机辅助设计（CAD）场景模型对传播路径建模 [23, 31]。然而获得精确 CAD 模型与光线追踪的高计算成本，使此类仿真在实践中既不实用也不可靠。

近来，NeRF² [58] 与 NeWRF [24] 把原本面向光学域新视角合成的神经辐射场（NeRF）[21, 26, 30, 36] 适配到 RF 信号传播建模与空间谱合成。这些方法通过学习面向 RF 信号的神经辐射场，在 RF 数据合成上达到最先进性能。然而与原始 NeRF 一样，它们倾向于过拟合所训练的场景，每遇新场景都需耗时重训练 [22, 30, 41]。

本文提出 GRaF，它在场景内增强 RF 空间谱合成，并能泛化到未见场景。如图 1 所示，训练场景中从多个发射机位置采集的空间谱用于训练 GRaF；训练完成后，GRaF 可为新场景中的任意位置合成高质量空间谱。该能力由我们的**插值定理 1**（§4.1）支撑，它确立：任意发射机位置处的空间谱都可由地理邻近发射机的空间谱插值近似。基于该理论，GRaF 从邻近发射机的空间谱学习潜在 RF 辐射场，从而实现训练场景之外的空间谱合成。

构建这样的场需要与光学辐射场根本不同的方法，因为 RF 信号的传播特性不同。不同于可见光，RF 信号波长为厘米量级，与障碍物相互作用时涉及更复杂机制，包括吸收、反射、绕射与散射 [17, 32]。为计入这些相互作用，我们把体素属性表示为学习到的辐射场中的潜在向量，并用带交叉注意力的几何感知 Transformer 编码器构建该场。该编码器处理邻近发射机的空间谱及其与目标发射机位置的几何关系。此外，我们提出在潜在 RF 辐射场上运行的神经光线追踪算法以估计空间谱。该算法从接收机向外追踪光线，沿每条路径采样体素以计入场景内相互作用；在每个体素处预测复值贡献，以捕捉 RF 传播引起的幅度与相位变化；随后沿每条光线聚合这些贡献，计入自由空间路径损耗与传播时延引起的相位偏移，从而计算接收空间谱。

本工作的关键贡献是一种面向可泛化 RF 空间谱合成的新范式，其理论基础是从邻近发射机空间谱估计目标位置空间谱的插值理论。GRaF 以几何感知 Transformer 编码来自邻近发射机的空间相关性为潜在 RF 辐射场，替代场景特定的 NeRF 式方法，随后用神经光线追踪算法聚合这些特征以计算空间谱。我们证明 GRaF 在单场景与跨场景设置下均达到最先进性能，并进一步提升下游定位性能。

> **图 1（原文 Fig. 1）：** 在训练场景中，接收机从所有环绕方向测量每个发射机的射频（RF）信号以构成空间谱。在该场景上训练后，GRaF 可为未见场景中的任意发射机位置合成空间谱。

> **图 2（原文 Fig. 2）：** 空间谱在三维与二维视图下的示意：(a) 三维球面视图；(b) 二维投影视图。

## 2. 预备知识

### 2.1 空间谱

空间谱刻画发射机发射 RF 信号时，接收机周围接收 RF 信号功率在三维方向（方位角与俯仰角）上的分布。我们先给出无线信道模型，再描述空间谱的计算方式。

**无线信道模型。** 无线通信系统由发射机与接收机组成。发送信号可表示为复数 $x=Ae^{\mathrm j\psi}$，其中 $A$ 是幅度、$\psi$ 是相位。信号经无线信道传播时，幅度被 $A_{\mathrm{att}}$ 衰减、相位偏移 $\Delta\psi$。单天线接收机接收到的信号为

$$
y=x\cdot A_{\mathrm{att}}e^{\mathrm j\Delta\psi}=A\cdot A_{\mathrm{att}}e^{\mathrm j(\psi+\Delta\psi)}. \tag{1}
$$

对配置为 $M\times N$ 天线阵列的接收机，接收信号表示为矩阵 $\mathbf Y=[y_{m,n}]_{m,n=0}^{M-1,N-1}$，其中 $y_{m,n}$ 表示第 $(m,n)$ 个阵元接收的信号。每个阵元信号计算为

$$
y_{m,n}=A\cdot A_{\mathrm{att}}e^{\mathrm j(\psi+\Delta\psi+\Delta\sigma_{m,n})}, \tag{2}
$$

其中 $A_{\mathrm{att}}e^{\mathrm j\Delta\psi}$ 是信道引入的衰减与相移，$\Delta\sigma_{m,n}$ 是第 $(m,n)$ 个阵元因其相对阵列中心 $(0,0,0)$ 的位置而产生的几何相移，由阵元位置与到达角决定：

$$
\Delta\sigma_{m,n}=\frac{2\pi}{\lambda}\left(md\sin\beta\cos\alpha+nd\sin\beta\sin\alpha\right), \tag{3}
$$

其中 $\lambda$ 是信号波长，$d=\lambda/2$ 是阵元间距，$\alpha$ 与 $\beta$ 分别是入射信号的方位角与俯仰角。

**空间谱计算。** 空间谱由接收信号矩阵 $\mathbf Y$ 计算，用于估计功率在方位角 $\alpha$ 与俯仰角 $\beta$ 上的分布。对给定方向 $(\alpha,\beta)$，接收信号功率为

$$
\mathrm{SS}(\alpha,\beta)=\left|\sum_{m=0}^{M-1}\sum_{n=0}^{N-1}y_{m,n}e^{-\mathrm j\Delta\sigma_{m,n}}\right|^2, \tag{4}
$$

其中 $\Delta\sigma_{m,n}$ 是式 (3) 定义的理论几何相移。以一度分辨率并只考虑上半球，空间谱 $\mathrm{SS}$ 表示为规模 $(N_a,N_e)$ 的矩阵：$\mathrm{SS}=[\mathrm{SS}_{p,q}]_{p,q=0}^{N_a-1,N_e-1}$，其中 $N_a=360$（方位角）、$N_e=90$（俯仰角）。图 2a 给出三维空间谱，图 2b 给出其在 X–Y 平面上的对应二维投影，其中径向距离为 $\cos(\beta)$。

### 2.2 用于空间谱合成的原始 NeRF

原始 NeRF 近来已被适配到 RF 空间谱合成 [24, 58]。它用 8 维输入的多层感知机（MLP）对三维场景建模：

$$
F_\Theta:\left(\{x,y,z\},\alpha,\beta,\{x_{\mathrm{tx}},y_{\mathrm{tx}},z_{\mathrm{tx}}\}\right)\to(\delta,\xi), \tag{5}
$$

其中 $\{x,y,z\}$ 是体素坐标，$(\alpha,\beta)$ 是确定从接收机追踪的光线视线方向的方位角与俯仰角。由于每个体素的属性受发射机位置影响，发射机坐标 $\{x_{\mathrm{tx}},y_{\mathrm{tx}},z_{\mathrm{tx}}\}$ 也作为输入。输出 $(\delta,\xi)$ 表示体素的 RF 特性，其中 $\delta$ 是衰减、$\xi$ 是信号发射，每个体素被视为次级 RF 信号源 [5]。

为生成空间谱，NeRF² [58] 在空间谱的每个方向上做光线追踪：沿每条光线 $r$ 取离散采样体素 $\{V_1,\dots,V_S\}$，用其坐标查询 MLP 以预测 $\delta$ 与 $\xi$。每条光线 $r$ 的结果 $\mathrm{SS}(r)$ 计算为

$$
\mathrm{SS}(r)=\sum_{i=1}^{S}\exp\left(\sum_{j=1}^{i-1}\delta_j\right)\xi_i, \tag{6}
$$

其中光线上的体素重新发射的 RF 信号被聚合，每个体素作为源，其贡献被中间体素衰减。

> **原文疑点：** §2.2 中公式 (5) 的 MLP 输出记为 $(\delta,\xi)$，但紧接着的正文写作"predict $\delta$ and $\epsilon$"（预测 $\delta$ 与 $\epsilon$），符号 $\xi$ 与 $\epsilon$ 不一致；此处按原文照录并加注。

## 3. 相关工作

**光学 NeRF 中的泛化。** 光学 NeRF 通过从图像学习场景表示革新了新视角合成，但原始 NeRF 需要大量逐场景训练，限制了对新场景的泛化 [30, 36, 41]。可泛化 NeRF 通过无需重训练即适配未见场景来克服该限制 [4, 6, 7, 9, 22, 37, 39, 46, 47, 52, 59]。例如 MVSNeRF 把多视图立体与神经渲染结合，从少量输入视图重建辐射场 [6]；WaveNeRF 采用基于小波的表示实现泛化 [46]；GSNeRF 纳入语义信息，为未见场景生成新视角与语义图 [9]。由于波长与传播行为的根本差异，这些方法不能直接用于 RF 信号。本工作把可泛化 NeRF 扩展到 RF 域以合成空间谱。

**RF 空间谱合成。** 近来若干工作探索了 RF 域的 NeRF 式方法 [33, 58]。例如 NeRF² [58] 训练 MLP 计算体素属性，并用式 (6) 做光线追踪以计算空间谱，但它需要为每个场景训练单独模型，限制可扩展性并阻碍对新场景的泛化。NeWRF [24] 利用到达方向（DoA）先验减少光线采样并提升效率，但需要专用天线阵列做 DoA 测量，往往不实用。WiNeRT [33] 采用基于 CAD 场景几何的可微光线追踪，但实践中难以获得精确 CAD 模型。RFScape [8] 用基于神经符号距离函数（SDF）的场景几何对 RF 传播建模，但需要已知物体形状与布局，限制实用性。相反，GRaF 无需场景特定训练、无需 DoA 测量、也无需场景先验模型，是 RF 空间谱合成的实用方案。GeRaF [25] 从近场 RF 扫描重建三维物体几何，而本工作对场景级 RF 空间谱合成建模并跨不同场景泛化。

基于 3DGS [16, 51, 53] 的空间谱合成方法 [20, 43, 50, 55, 56] 改善了 NeRF² [58] 在单场景内的训练与推理时间。相反，本工作关注实现跨场景的空间泛化。

## 4. 方法

给定一组训练场景 $\{1,\dots,K\}$，每个场景含空间谱与发射机位置 $\mathcal S^{(k)}=\{\mathrm{SS}_i^{(k)},\mathbf P_i^{(k)}\}_{i=1}^{N_k}$，其中 $\mathrm{SS}_i^{(k)}\in\mathbb R^{360\times90}$ 表示空间谱、$\mathbf P_i^{(k)}\in\mathbb R^3$ 表示发射机位置，目标是学习模型 $F_\Theta$，使其能在任意场景 $j$ 中、对位于 $\mathbf P_{\mathrm{target}}^{(j)}$ 的发射机，利用其 $L$ 个最近邻发射机 $\mathcal N_L^{(j)}\subset\mathcal S^{(j)}$ 合成空间谱 $\mathrm{SS}_{\mathrm{target}}^{(j)}$。其依据见补充材料 §F.1。该目标可表述为

$$
\Theta^\ast=\arg\max_\Theta\prod_{k=1}^{K}\prod_{i=1}^{N_k}p\left(\mathrm{SS}_i^{(k)}\,\middle|\,\mathcal N_L^{(k)}\left(\mathbf P_i^{(k)}\right),\mathbf P_i^{(k)},\Theta\right), \tag{7}
$$

其中 $\mathcal N_L^{(k)}(\mathbf P_i^{(k)})$ 表示 $\mathcal S^{(k)}$ 中距 $\mathbf P_i^{(k)}$ 最近的 $L$ 个发射机。推理时，对任意场景 $j$（训练中见过或未见），给定目标发射机位置 $\mathbf P_{\mathrm{target}}^{(j)}$ 及其邻域 $\mathcal N_L^{(j)}\subset\mathcal S^{(j)}$，学习到的模型合成相应空间谱为

$$
\mathrm{SS}_{\mathrm{target}}^{(j)}=F_{\Theta^\ast}\left(\mathcal N_L^{(j)}\left(\mathbf P_{\mathrm{target}}^{(j)}\right),\mathbf P_{\mathrm{target}}^{(j)}\right). \tag{8}
$$

> **图 3（原文 Fig. 3）：** GRaF 的架构。每个体素由特征 $\mathbf v_i^s$ 表示，其中 $i$ 索引 $M$ 条光线、$s$ 表示体素沿第 $i$ 条光线的位置。神经驱动光线追踪算法计算每条光线的接收信号功率（TX：发射机，RX：接收机）。

### 4.1 射频空间谱插值理论

**定理 1（空间谱插值）。** 设 $\mathrm{SS}(\mathbf P)$ 表示位于 $\mathbf P\in\mathbb R^3$ 的发射机的空间谱，$\mathcal N_L(\mathbf P)=\{\mathbf P_i\}_{i=1}^{L}$ 为其 $L$ 个最近邻、对应空间谱为 $\mathrm{SS}_i$。则 $\mathbf P$ 处的空间谱可近似为 $\mathrm{SS}(\mathbf P)\approx\sum_{i=1}^{L}w_i\mathrm{SS}_i$，其中重心权重 $\{w_i\}$ 由局部发射机几何决定。插值误差满足 $\epsilon\le K\delta^2$，其中 $\delta=\max_i\|\mathbf P-\mathbf P_i\|$ 表示邻域半径，$K$ 刻画环境曲率。完整定理与证明见补充材料 §A。

### 4.2 模型概览

如图 3 所示，GRaF 包含两个关键组件：(i) 由几何感知 Transformer 学习的潜在 RF 辐射场，从邻近发射机捕捉空间相关性；(ii) 神经光线追踪算法，沿方向光线聚合潜在体素特征以计算空间谱。

该过程的核心是潜在变量 $Z$ [29]，它概括场景的 RF 传播特性，如路径损耗与多径效应。特别地，$Z$ 表示定理 1 中的插值权重，并经非线性变换细化，以捕捉简单线性组合之外的传播行为。相应地，给定 $L$ 个最近邻 $\mathcal N_L$ 与发射机位置 $\mathbf P$ 时空间谱 $\mathrm{SS}$ 的似然为

$$
p(\mathrm{SS}\mid\mathcal N_L,\mathbf P)=\int p(\mathrm{SS}\mid Z,\mathbf P)\,p(Z\mid\mathcal N_L)\,\mathrm dZ, \tag{9}
$$

其中 $\mathcal N_L=\mathcal N_L(\mathbf P)$ 表示距 $\mathbf P$ 最近的 $L$ 个发射机。由于 $Z$ 编码全局 RF 传播特性（如材料与几何），每条光线上的信号功率只依赖 $Z$。神经光线追踪算法把插值理论按方向应用，从 $Z$ 导出光线特定权重以估计每个方向的空间谱。因此似然可按光线分解为

$$
p(\mathrm{SS}\mid\mathcal N_L,\mathbf P)=\int\prod_{r=1}^{Q}p(\mathrm{SS}(r)\mid Z,\mathbf P)\,p(Z\mid\mathcal N_L)\,\mathrm dZ, \tag{10}
$$

其中 $Q=N_a\times N_e$ 表示在方位角（$\alpha$）与俯仰角（$\beta$）上离散化的光线总数。例如，一度分辨率下 $Q=360\times90$，覆盖以接收机为中心的上半球。

### 4.3 潜在 RF 辐射场

潜在 RF 辐射场计算潜在变量 $Z$，它编码场景的 RF 传播特性，包括路径损耗、阴影与多径相互作用（如反射与绕射）。这种上下文表示使 GRaF 通过对 RF 传播行为的统一编码，跨多样场景泛化空间谱合成。潜在变量 $Z$ 由参数化函数 $T_\Psi$ 得到，其输入为 $L$ 个最近邻 $\mathcal N_L$ 与发射机位置 $\mathbf P\in\mathbb R^3$：

$$
Z=T_\Psi\left(\mathcal N_L,\mathbf P\right). \tag{11}
$$

$T_\Psi$ 的架构设计用于有效整合来自 $\mathcal N_L$ 的谱信息与几何信息。它以 ResNet-18 特征提取器开始，处理每个邻居的空间谱 $\mathrm{SS}_i\in\mathcal N_L$，产生紧凑特征向量，捕捉方向功率分布与信号强度变化等高层模式。同时，相对位置 $(\mathbf P_i-\mathbf P)$（对每个邻居 $\mathbf P_i\in\mathcal N_L$）用位置编码表示，以保持目标发射机与其邻居之间的空间关系。这些谱特征与几何嵌入共同捕捉 RF 信号特性与场景几何上下文。

联合的谱–几何表示随后由带交叉注意力层的几何感知 Transformer 编码器处理。交叉注意力机制通过加权邻居的谱与几何特征，动态强调最具影响力的邻近发射机，从而有效学习定理 1 的插值权重，并捕捉干扰、绕射与多径散射等非线性传播效应。Transformer 编码器的输出随后由两个 MLP 细化，映射为最终潜在变量 $Z\in\mathbb R^d$。所得 $Z$ 作为紧凑的上下文编码，概括场景的 RF 传播行为与邻近发射机间的空间关系，使 GRaF 能合成空间谱。

### 4.4 神经光线追踪算法

神经光线追踪算法利用上下文潜在变量 $Z$ 合成空间谱 $\mathrm{SS}_\Theta$。它从接收机追踪方向光线，沿每条光线聚合潜在特征以估计该方向的信号功率，产生完整空间谱。对每条方向为 $(\alpha,\beta)$ 的光线 $r$，我们沿其路径采样 $S$ 个点 $\{\mathbf x_s\}_{s=1}^{S}$，均匀分布以覆盖场景空间范围。在每个采样点 $\mathbf x_s$，通过组合潜在变量 $Z$、发射机位置 $\mathbf P\in\mathbb R^3$ 以及 $\mathbf x_s$ 与光线方向 $(\alpha,\beta)$ 的位置编码，计算体素特定特征 $\mathbf v_s\in\mathbb R^d$：

$$
\mathbf v_s=\mathrm{MLP}\left(Z,\mathrm{PosEnc}(\mathbf x_s,(\alpha,\beta),\mathbf P)\right), \tag{12}
$$

其中 $\mathrm{MLP}$ 是多层感知机，$\mathrm{PosEnc}$ 表示位置编码函数。所得特征随后由 RF 相关函数 $R_\Phi$ 处理，以估计该光线的信号功率：

$$
\widehat{\mathrm{SS}}_\Theta(r)=R_\Phi\left(\{\mathbf v_s\}_{s=1}^{S}\right). \tag{13}
$$

为纳入 RF 特定特性，$R_\Phi$ 对沿光线的每个采样点 $\mathbf x_s$ 处的辐射复信号与复值衰减建模。受无线信道模型启发，辐射信号 $s(\mathbf x_s,\alpha,\beta)$ 与衰减 $a(\mathbf x_s,\alpha,\beta)$ 计算为

$$
s(\mathbf x_s,\alpha,\beta)=I_s(\mathbf x_s,\alpha,\beta)+\mathrm jQ_s(\mathbf x_s,\alpha,\beta)=\mathrm{MLP}_s(\mathbf v_s),\qquad
a(\mathbf x_s,\alpha,\beta)=A_s(\mathbf x_s,\alpha,\beta)+\mathrm jB_s(\mathbf x_s,\alpha,\beta)=\mathrm{MLP}_a(\mathbf v_s), \tag{14}
$$

其中 $\mathrm{MLP}_s$ 与 $\mathrm{MLP}_a$ 分别把特征 $\mathbf v_s$ 映射为复信号与复衰减。衰减项 $a(\mathbf x_s,\alpha,\beta)$ 编码 $\mathbf x_s$ 处引入的幅度衰减与相位偏移。接收光线信号 $y_r$ 随后由沿光线所有采样点贡献聚合得到（详细推导与证明见补充材料 §B）：

$$
y_r=\sum_{s=1}^{S}\left(\prod_{j=1}^{s-1}a(\mathbf x_j,\alpha,\beta)\right)s(\mathbf x_s,\alpha,\beta)\cdot\frac{\lambda}{4\pi d_s}e^{-\mathrm j2\pi f\frac{d_s}{c}}, \tag{15}
$$

其中 $d_s$ 是采样点距接收机的距离，$c$ 是光速。该聚合过程可通过 Transformer 把体素特征 $(\delta,\xi)$ 映射为 token 特征来建模，其中注意力分数自然表示沿光线的累积衰减。最后，光线 $r$ 的预测空间谱取值为其接收信号的功率：$\widehat{\mathrm{SS}}_\Theta(r)=|y_r|^2$。该过程作用于所有光线，光线以一度分辨率在方位角与俯仰角上离散化空间谱，得到完整空间谱 $\mathrm{SS}_\Theta$。

**损失函数。** 计算得空间谱 $\mathrm{SS}_\Theta$ 后，优化全部参数 $\Theta$（包含 $T_\Psi$ 中的 $\Psi$ 与 $R_\Phi$ 中的 $\Phi$）以最大化观测空间谱的对数似然，如式 (7) 所定义：

$$
\Theta^\ast=\arg\max_\Theta\log p(\mathrm{SS}_\Theta\mid\mathcal N_L,\mathbf P)=\arg\max_\Theta\log\int\prod_{r=1}^{Q}p(\mathrm{SS}(r)\mid Z,\mathbf P)\,p(Z\mid\mathcal N_L)\,\mathrm dZ. \tag{16}
$$

由于 $Z$ 的高维性，该积分直接计算是棘手的。由于 $Z$ 由潜在 RF 辐射场确定性产生，优化归结为监督重建问题（推导见补充材料 §C）：

$$
\Theta^\ast=\arg\min_\Theta\sum_{r=1}^{Q}\left\|\mathrm{SS}(r)-\widehat{\mathrm{SS}}_\Theta(r)\right\|^2. \tag{17}
$$

> **图 4（原文 Fig. 4）：** 两种房间布局的俯视图：(a) 会议室；(b) 办公室。

## 5. 实验

实现细节见补充材料 §D。我们先在单场景设置下评估 GRaF，再评估其跨场景性能。

### 5.1 实验设置

- **数据集** （I）RFID 数据集：由 NeRF² [58] 引入，RF 识别（RFID）工作在 915 MHz，接收机位于固定位置并配备 $4\times4$ 天线阵列。该数据集含 6123 个发射机位置，每个位置关联一个空间谱。（II）MATLAB 数据集：我们考虑两种代表性室内布局——会议室与办公室，其几何如图 4 所示，尺寸分别为 $9.8\ \mathrm{ft}\times9.8\ \mathrm{ft}\times8.2\ \mathrm{ft}$ 与 $26.2\ \mathrm{ft}\times16.4\ \mathrm{ft}\times9.8\ \mathrm{ft}$。每种布局由 CAD 模型表示，并用 Blender 修改物体摆放以进一步派生为多个场景版本。对会议室布局（图 4a），定义三个场景版本：ConferenceV1 含 Chair 1 与 Chair 2，ConferenceV2 只含 Chair 1，ConferenceV3 两者都不含。对办公室布局（图 4b），同样定义三个场景版本：OfficeV1 含 Table 1 与 Table 2，OfficeV2 只含 Table 1，OfficeV3 两者都不含。每个场景版本中放置固定天线阵列的接收机，发射机随机分布在整个空间。共放置 4,416、4,453、3,107、8,481、7,274 与 4,894 个发射机，用 MATLAB 光线追踪仿真 [27] 为每个场景版本采集空间谱。除另行说明，80% 数据用于训练、20% 用于测试。（III）附加布局（卧室与室外场景）见补充材料 §E。
- **基线** 我们与三个基线比较。（I）K 近邻（KNN）：通过平均 $L$ 个最近邻的空间谱预测目标发射机位置的空间谱，$L$ 与 GRaF 保持一致以公平比较。（II）KNN-DL：与 KNN 类似，但对每个邻居分配规模 $(N_a,N_e)$ 的权重矩阵而非等权平均。空间谱的每个像素有可学习权重，目标谱由所有邻居谱按其权重矩阵加权求和得到；权重矩阵用 $\ell_2$ 损失优化。细节见补充材料 §A.2。（III）NeRF²：见 §2.2。NeWRF [24] 本质上与 NeRF² 相同，只是额外使用 DoA 测量以减少光线数；由于实践中难以获得 DoA 数据，我们在评估中把 NeRF² 与 NeWRF 视为等价方法。其他方法（如 WiNeRT [33] 与 RFScape [8]）需要场景先验模型，无法直接比较。
- **指标** 均方误差（MSE）度量空间谱中所有方向上预测与真值信号功率的平均平方差，作为域损失。由于空间谱（见图 2b）可看作图像，采用图像质量指标评估像素级差异与结构一致性 [42]，以捕捉方向性模式。据此我们用四个广泛采用的指标评估性能：MSE↓、学习感知图像块相似度（LPIPS↓）、峰值信噪比（PSNR↑）与结构相似性指数（SSIM↑）。

> **图 5（原文 Fig. 5）：** 合成空间谱的视觉比较。

### 5.2 单场景性能

共七个场景：一个来自 RFID 数据集，六个来自 MATLAB 数据集（ConferenceV1–V3、OfficeV1–V3）。本节为每个场景训练并评估一个单独模型，用 80% 数据训练、其余 20% 测试。

**分析。** 我们先给出四个随机选取的发射机位置的空间谱，以及 NeRF² 与 GRaF 合成的空间谱，如图 5 所示。视觉上，GRaF 合成的空间谱与真值高度接近，优于 NeRF² 生成的结果。与视觉比较一致，GRaF 取得更优指标，如表 1 所示。与 KNN 和 KNN-DL 相比，GRaF 的 PSNR 分别提高 44.7% 与 5.5%。这些结果表明邻近空间谱确实有助于预测目标发射机的空间谱。然而 KNN 的简单平均无法捕捉邻近谱之间复杂的空间关系；KNN-DL 优于 KNN，表明对邻近谱的细致解释可提升预测精度，但它未考虑谱之间的几何关系，限制了其效果。最后，GRaF 在 MSE、LPIPS、PSNR 与 SSIM 上分别比 NeRF² 优 26.9%、50.4%、10.2% 与 8.8%。该提升凸显 GRaF 能利用邻近空间谱学习捕捉复杂传播行为的潜在体素特征，并在光线追踪中通过注意力机制动态分配权重。

> **原文疑点：** §5.2 正文称展示"四个随机选取的发射机位置"的空间谱，但图 5 展示的是 Position 1–7 共七个位置；此处按原文照录并加注。

> **表 1（原文 Table 1）：** 单场景设置下的模型性能。

| 模型 | MSE↓ | LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| KNN | 0.089 | 0.357 | 15.16 | 0.543 |
| KNN-DL | 0.048 | 0.198 | 20.81 | 0.675 |
| NeRF² | 0.052 | 0.274 | 19.93 | 0.704 |
| **GRaF** | **0.038** | **0.136** | **21.94** | **0.766** |

### 5.3 对未见场景的泛化

我们评估 GRaF 跨未见场景的泛化能力，特别是布局中物体配置变化时。具体地，为会议室与办公室布局分别训练两个模型：会议室模型在 ConferenceV1 上训练，在 ConferenceV2 与 ConferenceV3 的测试划分上测试；办公室模型在 OfficeV1 上训练，在 OfficeV2 与 OfficeV3 上测试。所有基线在相同设置下训练与评估以公平比较。反向设置（交换训练与测试场景）见补充材料 §E.2。

**分析。** 表 2 给出两个布局模型的平均定量结果。与单场景设置（表 1）相比，KNN 在两种场景下性能相近，说明邻近空间信息持续有价值。相反 KNN-DL 与 NeRF² 在未见场景设置下性能下降，因为它们依赖对训练场景过拟合的模型，泛化能力受限。不过由于训练与测试场景之间差异仅涉及少量改动（如增减一两张桌子或椅子），性能退化幅度中等，KNN-DL 与 NeRF² 的 PSNR 分别下降 8.51% 与 12.90%。相比之下，GRaF 在两种设置下都取得最高精度，这得益于其几何感知潜在 RF 辐射场与神经光线追踪算法，使其能跨多样场景布局有效泛化。

> **表 2（原文 Table 2）：** 未见场景设置下的模型性能。

| 模型 | MSE↓ | LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| KNN | 0.083 | 0.361 | 14.77 | 0.552 |
| KNN-DL | 0.053 | 0.279 | 19.04 | 0.614 |
| NeRF² | 0.065 | 0.337 | 17.36 | 0.691 |
| **GRaF** | **0.039** | **0.215** | **20.96** | **0.705** |

### 5.4 对未见布局的泛化

我们进一步在更具挑战性的设置下评估 GRaF 的泛化能力：模型在会议室布局的全部三个版本（ConferenceV1–V3 的训练划分）上训练，在办公室布局的全部三个版本（OfficeV1–V3）上测试；同时进行反向实验，即在 OfficeV1–V3 上训练、在 ConferenceV1–V3 上测试。三个基线在相同实验设置下评估以公平比较。

**分析。** 表 3 给出未见布局的定量结果。KNN 在各设置下表现稳定、PSNR 略有波动，反映邻近空间谱信息的有效性。相反，与单场景设置相比，KNN-DL 与 NeRF² 在未见布局下性能显著下降：KNN-DL 的 PSNR 下降 28.2%，NeRF² 下降 35.9%，凸显场景特定训练导致泛化能力有限。GRaF 在所有设置下取得最高精度，展现出鲁棒泛化能力，这归因于其几何感知体素特征与神经光线追踪，使其能适配多样场景。不过跨布局实验中 GRaF 合成的空间谱质量低于单场景实验，该性能下降源于多样布局与物体材料带来的挑战 [45]。

训练好的 GRaF 还在附加布局（Bedroom 与 Outdoor）以及真实世界数据集上评估，以引入多样空间特性。Bedroom 是受限空间、多径丰富；Outdoor 是大尺度开放环境、反射体稀疏；RFID 数据集引入真实世界噪声、硬件差异与时间效应。结果见补充材料 §E.3。

> **表 3（原文 Table 3）：** 未见布局设置下的模型性能。

| 模型 | MSE↓ | LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| KNN | 0.085 | 0.359 | 15.32 | 0.539 |
| KNN-DL | 0.087 | 0.429 | 14.94 | 0.498 |
| NeRF² | 0.092 | 0.477 | 12.76 | 0.481 |
| **GRaF** | **0.042** | **0.268** | **17.81** | **0.629** |

### 5.5 消融研究

本节沿用 §5.3 的未见场景设置，结果见表 4。邻居数 $L$ 的影响见补充材料 §E.4。

**潜在 RF 辐射场。** 在模型的参数化函数 $T_\Psi$ 中，我们采用几何感知交叉注意力层学习上下文潜在表示。为评估注意力机制的作用，我们把交叉注意力层替换为更简单的点积注意力层。表 4 第一行与第三行的比较表明，采用交叉注意力机制的 GRaF 性能略优，说明 GRaF 的泛化能力源于其建模邻近空间谱间相互作用的能力。

**神经光线追踪。** 我们把神经光线追踪算法替换为基于式 (6) 的简化方法，后者对每个体素只用两个属性建模：信号发射与衰减。表 4 第二行与第三行的比较表明我们的神经方法优于简化方法，凸显体素级向量表示与模型学习自适应融合权重的优势。GRaF 的消融版本（表 4"Without neural ray tracing"）与 NeRF² 的差别在于场景表示：消融版本保留处理邻近谱的参数化函数 $T_\Psi$，但简化体素建模并使用 NeRF² 的光线追踪模块。如表 2 所示，NeRF² 的 PSNR 为 17.36 dB，而消融版本为 16.79 dB（表 4），该性能差距凸显 GRaF 完整流水线的重要性。

> **表 4（原文 Table 4）：** GRaF 各消融版本在未见场景设置下的性能。

| 模型变体 | LPIPS↓ | PSNR↑ |
|---|---|---|
| 去掉交叉注意力层 | 0.239 | 19.37 |
| 去掉神经光线追踪 | 0.379 | 16.79 |
| 完整模型（GRaF） | **0.215** | **20.96** |

> **原文疑点：** §5.5 正文称"把交叉注意力层替换为更简单的点积注意力层"，而表 4 中对应行标为"Without cross-attention layer"（去掉交叉注意力层）；"替换"与"去掉"的表述不一致，此处按原文照录并加注。

### 5.6 射频频段的影响

为考察频段影响，我们在会议室（图 4a）采集 928 MHz、2.412 GHz 与 5.805 GHz 三个数据集，并分别在每个数据集上训练 GRaF。如表 5 所示，GRaF 能良好适配不同频段，同时保持高质量合成空间谱。该设计是合理的，因为各频段支持不同无线技术（如 5G、WiFi），需要专用硬件进行信号接收与处理 [11, 35, 44]。此外，表 6 评估仅在 2.412 GHz 数据集上训练（体素尺寸 $\lambda\approx0.124$ m）的 GRaF 版本直接用于 928 MHz 与 5.805 GHz 数据集而不重训练的结果；测试时体素尺寸固定为 0.124 m。该跨频率评估显示性能明显下降，主要因为两个因素。第一，RF 传播特性随频率变化：928 MHz 下信号穿透更强、衰减更小，而 5.805 GHz 下更易散射与吸收；这些波动行为差异限制模型跨频段泛化。第二，固定体素尺寸导致空间分辨率失配：对 928 MHz（$\lambda\approx0.323$ m），体素网格不必要地精细，保留了细节但增加计算成本；而对 5.805 GHz（$\lambda\approx0.052$ m），体素尺寸过粗，无法分辨细尺度传播效应。

> **表 5（原文 Table 5）：** 在每个频段上分别训练的性能。

| 指标 | 928 MHz | 2.412 GHz | 5.805 GHz |
|---|---|---|---|
| PSNR↑ | 25.70 | 24.53 | 24.91 |

> **表 6（原文 Table 6）：** 仅在 2.412 GHz 频段上训练后的性能。

| 指标 | 928 MHz | 5.805 GHz |
|---|---|---|
| MSE↓ | 0.104 | 0.218 |
| LPIPS↓ | 0.362 | 0.467 |
| PSNR↑ | 14.84 | 11.61 |
| SSIM↑ | 0.576 | 0.493 |

### 5.7 案例研究：到达角（AoA）估计

合成的空间谱可用于到达角（AoA）估计等下游任务以支持无线定位 [2]。我们使用角度人工神经网络（AANN），它由 ResNet-50 主干后接 MLP 头组成，处理空间谱并估计 AoA；该 AoA 对应发射机与接收机之间的视距（LoS）传播方向，从而支持发射机定位。通过生成合成训练数据集，GRaF 显著减少训练 AANN 所需的数据采集工作。为展示 GRaF 合成的高质量空间谱之益，我们在训练与测试阶段评估以下两种策略：

(i) **用合成空间谱训练 AANN。** 在四个数据集上训练 AANN：(1) 50% 真值（GT）；(2) 50% GT 加 50% NeRF² 合成空间谱；(3) 50% GT 加 50% GRaF 合成空间谱；(4) 100% GT。所有训练数据集使用相同发射机位置，每个训练好的 AANN 在发射机位置一致的共享测试集上评估。图 6a 给出估计 AoA 误差的累积分布函数（CDF）。相比仅用 50% GT 训练，GRaF 增强数据集把估计误差降低 61.6%；相比 NeRF² 增强数据集降低 25.8%。这些结果表明 GRaF 产生的高质量空间谱能有效改善定位模型训练。

(ii) **用合成空间谱测试 AANN。** 在 GT 空间谱上训练 AANN，并在三类测试数据集上评估：GT、NeRF² 合成空间谱与 GRaF 合成空间谱；所有测试谱对应相同发射机位置。图 6b 表明 GRaF 的空间谱给出更准确的 AoA 估计，凸显其合成空间谱的优越保真度。

> **图 6（原文 Fig. 6）：** 基于空间谱、通过 AANN [2] 的 AoA 估计：(a) 用于 AANN 训练；(b) 用于 AANN 测试。

## 6. 结论

本文提出 GRaF，一个用于空间谱合成的可泛化 RF 辐射场框架。我们首先建立 RF 域的插值理论作为理论基础。GRaF 整合几何感知潜在 RF 辐射场以捕捉空间相关的传播特性，并采用神经光线追踪算法聚合这些特征以精确计算空间谱。实验结果表明 GRaF 能跨场景泛化并提升下游任务性能。

## 致谢

本研究部分由美国国家科学基金会（NSF）资助，基金号 CNS-2239458 与 CCSS-2525613。本材料中表达的任何观点、发现与结论均为作者本人的，不一定反映资助机构的观点。

## 参考文献（英文原书目）

- [1] Md Maruf Ahamed and Saleh Faruque, "5G network coverage planning and analysis of the deployment challenges," Sensors, vol. 21, no. 19, p. 6608, 2021.
- [2] Zhenlin An, Qiongzheng Lin, Ping Li, and Lei Yang, "General-purpose deep tracking platform across protocols for the Internet of Things," in ACM International Conference on Mobile Systems, Applications, and Services (MobiSys), 2020.
- [3] Roshan Ayyalasomayajula, Aditya Arun, Chenfeng Wu, Sanatan Sharma, Abhishek Rajkumar Sethi, Deepak Vasisht, and Dinesh Bharadia, "Deep learning based wireless localization for indoor navigation," in Annual International Conference on Mobile Computing and Networking (MobiCom), 2020.
- [4] Alexander Bergman, Petr Kellnhofer, Wang Yifan, Eric Chan, David Lindell, and Gordon Wetzstein, "Generative neural articulated radiance fields," in Conference on Neural Information Processing Systems, 2022.
- [5] Max Born and Emil Wolf, Principles of Optics. Cambridge University Press, 2013.
- [6] Anpei Chen, Zexiang Xu, Fuqiang Zhao, Xiaoshuai Zhang, Fanbo Xiang, Jingyi Yu, and Hao Su, "MVSNeRF: Fast generalizable radiance field reconstruction from multi-view stereo," in IEEE/CVF International Conference on Computer Vision (ICCV), 2021.
- [7] Jianchuan Chen, Wentao Yi, Liqian Ma, Xu Jia, and Huchuan Lu, "GM-NeRF: Learning generalizable model-based neural radiance fields from multi-view images," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2023.
- [8] Xingyu Chen, Zihao Feng, Kun Qian, and Xinyu Zhang, "Radio frequency ray tracing with neural object representation for enhanced RF modeling," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2025.
- [9] Zi-Ting Chou, Sheng-Yu Huang, I Liu, Yu-Chiang Frank Wang, et al., "GSNeRF: Generalizable semantic neural radiance fields with enhanced 3D scene understanding," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2024.
- [10] Cisco, Understand Site Survey Guidelines for WLAN Deployment, 2023. [Online].
- [11] Cliff Drubin, "Four megatrends for 5G mmWave technology in 2023 and beyond," Microwave Journal, vol. 66, no. 3, 2023.
- [12] Esteban Egea-Lopez, Jose Maria Molina-Garcia-Pardo, Martine Lienard, and Pierre Degauque, "Opal: An open source ray-tracing propagation simulator for electromagnetic characterization," Plos One, vol. 16, no. 11, p. e0260060, 2021.
- [13] Akshay Gadre, Revathy Narayanan, Anh Luong, Anthony Rowe, Bob Iannucci, and Swarun Kumar, "Frequency configuration for low-power wide-area networks in a heartbeat," in USENIX Symposium on Networked Systems Design and Implementation (NSDI), 2020.
- [14] Lidong Guo, Xuefei Ning, Yonggan Fu, Tianchen Zhao, Zhuoliang Kang, Jincheng Yu, Yingyan Celine Lin, and Yu Wang, "Rad-NeRF: Ray-decoupled training of neural radiance field," in Conference on Neural Information Processing Systems, 2024.
- [15] Pushpendu Kar and Bhasker Dappuri, "Site survey and radio frequency planning for the deployment of next generation WLAN," in IEEE International Conference on Wireless Communications, Signal Processing and Networking (WiSPNET), 2018.
- [16] Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler, and George Drettakis, "3D Gaussian splatting for real-time radiance field rendering," in International Conference on Computer Graphics and Interactive Techniques (SIGGRAPH), 2023.
- [17] R.G. Kouyoumjian and P.H. Pathak, "A uniform geometrical theory of diffraction for an edge in a perfectly conducting surface," Proceedings of the IEEE, vol. 62, no. 11, pp. 1448–1461, 1974.
- [18] Attila Kovári, "Synergizing 6G networks, IoT, and AI: Paving the way for next-generation intelligent ecosystems," International Journal of Service Science, Management, Engineering, and Technology, vol. 20, no. 1, pp. 114–128, 2025.
- [19] Pengfei Li, Jiaxin Fan, and Jianhong Wu, "Exploring the key technologies and applications of 6G wireless communication network," iScience, vol. 28, no. 5, 2025.
- [20] Zechen Li, Lanqing Yang, Yiheng Bian, Hao Pan, Yongjian Fu, Yezhou Wang, Yi-Chao Chen, Guangtao Xue, and Ju Ren, "Wideband RF radiance field modeling using frequency-embedded 3D Gaussian splatting," arXiv:2505.20714, 2025.
- [21] Lingjie Liu, Jiatao Gu, Kyaw Zaw Lin, Tat-Seng Chua, and Christian Theobalt, "Neural sparse voxel fields," in Conference on Neural Information Processing Systems, 2020.
- [22] Yuan Liu, Sida Peng, Lingjie Liu, Qianqian Wang, Peng Wang, Christian Theobalt, Xiaowei Zhou, and Wenping Wang, "Neural rays for occlusion-aware image-based rendering," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2022.
- [23] Zhongyu Liu, Qi Yao, Quanqing Li, Lixin Guo, and Shuo Hu, "Wireless channel model based on ray tracing algorithm in the sea environment," International Journal of Antennas and Propagation, vol. 2024, no. 1, p. 3080895, 2024.
- [24] Haofan Lu, Christopher Vattheuer, Baharan Mirzasoleiman, and Omid Abari, "NeWRF: A deep learning framework for wireless radiation field reconstruction and channel prediction," in International Conference on Machine Learning (ICML), 2024.
- [25] Jiachen Lu, Hailan Shanbhag, and Haitham Al Hassanieh, "GeRaF: Neural geometry reconstruction from radio frequency signals," in Conference on Neural Information Processing Systems, 2025.
- [26] Ricardo Martin-Brualla, Noha Radwan, Mehdi SM Sajjadi, Jonathan T Barron, Alexey Dosovitskiy, and Daniel Duckworth, "NeRF in the wild: Neural radiance fields for unconstrained photo collections," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2021.
- [27] MATLAB, Indoor MIMO-OFDM Communication Link Using Ray Tracing, 2023. [Online].
- [28] James Clerk Maxwell, A Treatise on Electricity and Magnetism. Oxford: Clarendon Press, 1873.
- [29] Quan Meng, Anpei Chen, Haimin Luo, Minye Wu, Hao Su, Lan Xu, Xuming He, and Jingyi Yu, "GNeRF: GAN-based neural radiance field without posed camera," in IEEE/CVF International Conference on Computer Vision (ICCV), 2021.
- [30] Ben Mildenhall, Pratul P Srinivasan, Matthew Tancik, Jonathan T Barron, Ravi Ramamoorthi, and Ren Ng, "NeRF: Representing scenes as neural radiance fields for view synthesis," Communications of the ACM, vol. 65, no. 1, pp. 99–106, 2021.
- [31] Cláudio Modesto, Lucas Mozart, Pedro Batista, André Cavalcante, and Aldebaro Klautau, "Accelerating ray tracing-based wireless channels generation for real-time network digital twins," arXiv:2504.09751, 2025.
- [32] Han Na and Thomas F Eibert, "A Huygens' principle based ray tracing method for diffraction calculation," in IEEE European Conference on Antennas and Propagation (EuCAP), 2022.
- [33] Tribhuvanesh Orekondy, Pratik Kumar, Shreya Kadambi, Hao Ye, Joseph Soriaga, and Arash Behboodi, "WiNeRT: Towards neural ray tracing for wireless channel modelling and differentiable simulations," in International Conference on Learning Representations (ICLR), 2023.
- [34] Andreas Savvides, Chih-Chieh Han, and Mani B Srivastava, "Dynamic fine-grained localization in ad-hoc networks of sensors," in Annual International Conference on Mobile Computing and Networking (MobiCom), 2001.
- [35] John Song, Lihao Zhang, Feng Ye, and Haijian Sun, "Terahertz spatial wireless channel modeling with radio radiance field," arXiv:2505.06277, 2025.
- [36] Matthew Tancik, Vincent Casser, Xinchen Yan, Sabeek Pradhan, Ben Mildenhall, Pratul P Srinivasan, Jonathan T Barron, and Henrik Kretzschmar, "Block-NeRF: Scalable large scene neural view synthesis," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2022.
- [37] Fengrui Tian, Shaoyi Du, and Yueqi Duan, "MonoNeRF: Learning a generalizable dynamic radiance field from monocular videos," in IEEE/CVF International Conference on Computer Vision (ICCV), 2023.
- [38] Shuai Tong, Jiliang Wang, Jing Yang, Yunhao Liu, and Jun Zhang, "Citywide LoRa network deployment and operation: Measurements, analysis, and implications," in ACM International Conference on Embedded Networked Sensor Systems (SenSys), 2023.
- [39] Alex Trevithick and Bo Yang, "GRF: Learning a general radiance field for 3D representation and rendering," in IEEE/CVF International Conference on Computer Vision (ICCV), 2021.
- [40] Shamsher Ullah, Jianqiang Li, Jie Chen, Ikram Ali, Salabat Khan, Abdul Ahad, Farhan Ullah, and Victor CM Leung, "A survey on emerging trends and applications of 5G and 6G to healthcare environments," ACM Computing Surveys, vol. 57, no. 4, pp. 1–36, 2024.
- [41] Qianqian Wang, Zhicheng Wang, Kyle Genova, Pratul P Srinivasan, Howard Zhou, Jonathan T Barron, Ricardo Martin-Brualla, Noah Snavely, and Thomas Funkhouser, "IBRNet: Learning multi-view image-based rendering," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2021.
- [42] Zhou Wang, Alan C Bovik, Hamid R Sheikh, and Eero P Simoncelli, "Image quality assessment: From error visibility to structural similarity," IEEE Transactions on Image Processing, vol. 13, no. 4, pp. 600–612, 2004.
- [43] Chaozheng Wen, Jingwen Tong, Yingdong Hu, Zehong Lin, and Jun Zhang, "WRF-GS: Wireless radiation field reconstruction with 3D Gaussian splatting," in IEEE Conference on Computer Communications (INFOCOM), 2025.
- [44] P Wesling, Heterogeneous Integration Roadmap, 2021 Version, 2021. [Online].
- [45] Po-zen Wong, Joel Koplik, and JP Tomanic, "Conductivity and permeability of rocks," Physical Review B, vol. 30, no. 11, p. 6606, 1984.
- [46] Muyu Xu, Fangneng Zhan, Jiahui Zhang, Yingchen Yu, Xiaoqin Zhang, Christian Theobalt, Ling Shao, and Shijian Lu, "WaveNeRF: Wavelet-based generalizable neural radiance fields," in IEEE/CVF International Conference on Computer Vision (ICCV), 2023.
- [47] Jiawei Yang, Marco Pavone, and Yue Wang, "FreeNeRF: Improving few-shot neural rendering with free frequency regularization," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2023.
- [48] Kang Yang, Yuning Chen, and Wan Du, "OrchLoc: In-orchard localization via a single LoRa gateway and generative diffusion model-based fingerprinting," in ACM International Conference on Mobile Systems, Applications, and Services (MobiSys), 2024.
- [49] Kang Yang, Yuning Chen, and Wan Du, "Generative diffusion model-assisted efficient fingerprinting for in-orchard localization," IEEE Transactions on Mobile Computing, 2025.
- [50] Kang Yang, Gaofeng Dong, Sijie Ji, Wan Du, and Mani Srivastava, "GSRF: Complex-valued 3D Gaussian splatting for efficient radio-frequency data synthesis," in Conference on Neural Information Processing Systems, 2025.
- [51] Kang Yang, Wan Du, and Mani Srivastava, "Scalable 3D Gaussian splatting-based RF signal spatial propagation modeling," in ACM International Conference on Embedded Networked Sensor Systems (SenSys), 2025.
- [52] Alex Yu, Vickie Ye, Matthew Tancik, and Angjoo Kanazawa, "pixelNeRF: Neural radiance fields from one or few images," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2021.
- [53] Zehao Yu, Anpei Chen, Binbin Huang, Torsten Sattler, and Andreas Geiger, "Mip-Splatting: Alias-free 3D Gaussian splatting," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2024.
- [54] Zhengqing Yun and Magdy F Iskander, "Ray tracing for radio propagation modeling: Principles and applications," IEEE Access, vol. 3, pp. 1089–1100, 2015.
- [55] Lihao Zhang, Haijian Sun, Samuel Berweger, Camillo Gentile, and Rose Qingyang Hu, "RF-3DGS: Wireless channel modeling with radio radiance field and 3D Gaussian splatting," arXiv:2411.19420, 2024.
- [56] Lihao Zhang, Zongtan Li, and Haijian Sun, "RF-PGS: Fully-structured spatial wireless channel representation with planar Gaussian splatting," arXiv:2508.16849, 2025.
- [57] Jun-Sheng Zhao and Weng Cho Chew, "Integral equation solution of Maxwell's equations from zero frequency to microwave frequencies," IEEE Transactions on Antennas and Propagation, vol. 48, no. 10, pp. 1635–1645, 2000.
- [58] Xiaopeng Zhao, Zhenlin An, Qingrui Pan, and Lei Yang, "NeRF²: Neural radio-frequency radiance fields," in Annual International Conference on Mobile Computing and Networking (MobiCom), 2023.
- [59] Haidong Zhu, Tianyu Ding, Tianyi Chen, Ilya Zharkov, Ram Nevatia, and Luming Liang, "CaesarNeRF: Calibrated semantic representation for few-shot generalizable neural rendering," in European Conference on Computer Vision (ECCV), 2024.

## 图注与表注索引

本页图 1–6 的中文图注与表 1–6 的表注均按原文出现位置内联在正文中（图 1 见第 1 节，图 2 见 2.1 节，图 3 见 4.2 节前，图 4 见 4.4 节末，图 5 见 5.2 节，图 6 见 5.7 节；表 1 见 5.1 节末与 5.2 节，表 2 见 5.3 节，表 3 见 5.4 节，表 4 见 5.5 节，表 5–6 见 5.6 节），此处不重复罗列。原文为 CVPR 会议双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 CVPR 2026 会议论文集版本（本地 PDF 11 页）的中文译稿：摘要、第 1–6 节正文与编号小节、图 1–6 的中文图注、表 1–6 的逐格转写、定理 1、致谢，以及参考文献 59 条英文原条目（按原编号）。**原文的补充材料（Supplementary Materials，含 §A–§F）不在本地 11 页版本内，故本页未纳入翻译范围**；正文中相关引用按原文照录。公式与表格已对照 PDF 渲染页核对：式 (1)–(17) 逐式核对（重点 (3)–(6)、(9)–(17)）；表 1 用第 6 页渲染图逐格核对（KNN/KNN-DL/NeRF²/GRaF 四行四指标全部一致），表 2–4 按第 7 页渲染图与表格数据核对，表 5–6 按原文表格数据转写并用正文百分比与波长数值交叉校验。已加注三处原文疑点：(i) §2.2 公式输出符号 $(\delta,\xi)$ 与正文"predict $\delta$ and $\epsilon$"不一致；(ii) §5.2 正文称展示四个发射机位置而图 5 为 Position 1–7 共七个；(iii) §5.5 正文称"替换为点积注意力"而表 4 行标为"Without cross-attention layer"。本页不上传原文图片，图 2、5、6 的热图与 CDF 曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。**再传播许可待核验，本页仅作学习用途，不计入可公开全文。** 逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

{% endraw %}
