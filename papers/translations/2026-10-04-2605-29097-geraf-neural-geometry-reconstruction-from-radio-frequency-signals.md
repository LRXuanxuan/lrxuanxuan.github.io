---
layout: page
title: "GeRaF：从射频信号重建神经几何｜中文全文译文"
permalink: /papers/translations/2026-10-04-2605-29097-geraf-neural-geometry-reconstruction-from-radio-frequency-signals/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/fdb8bece62f0fa86/) · [原文 arXiv](https://arxiv.org/abs/2605.29097) · [全部目录](/papers/catalog/)

# GeRaF：从射频信号重建神经几何

**原题：** GeRaF: Neural Geometry Reconstruction from Radio Frequency Signals  
**作者：** Jiachen Lu\*、Hailan Shanbhag\*、Haitham Al Hassanieh（\*共同第一作者，贡献相同）；单位：洛桑联邦理工学院（École Polytechnique Fédérale de Lausanne，EPFL）  
**版本：** arXiv:2605.29097v2（cs.CV），v2 日期 2026 年 8 月 4 日；论文标注为第 39 届神经信息处理系统大会（NeurIPS 2025）；原文 24 页（含附录 A–E）。  
**范围与状态：** 全文中文译稿：摘要、第 1–10 节正文、致谢、图 1–18 图注、表 1 逐格转写、附录 A–E（含算法 1–2 与式 (9)–(24)）、参考文献 68 条英文原条目（按原编号）按原文结构录入。逐句逐式终校未做。

> **原文疑点（元数据）：** 原文首页同时标注 "39th Conference on Neural Information Processing Systems (NeurIPS 2025)" 与 "arXiv:2605.29097v2 [cs.CV] 4 Aug 2026"，即会议年份早于 arXiv 版本日期，二者按原文照录，未作推断或改动。

## 摘要

GeRaF 是首个利用神经隐式学习从射频（radio frequency，RF）信号中进行近距 3D 几何重建的方法。与基于 RGB 或 LiDAR 的方法不同，射频感知能够穿透遮挡，但由于其无透镜成像（lensless imaging）的本质，存在分辨率低、噪声大的问题。RGB 成像中的透镜把采样约束在一维射线上，而射频信号会传播穿过整个空间，从而引入显著噪声，并导致体渲染的三次复杂度。此外，射频信号通过镜面反射与表面相互作用，需要根本不同的建模方式。为应对这些挑战，GeRaF (1) 引入基于滤波器的渲染以抑制无关信号，(2) 实现基于物理的射频体渲染管线，(3) 提出一种新的无透镜采样与无透镜 alpha 混合策略，使训练期间的全空间采样成为可行。通过 MLP 与可训练参数学习符号距离函数、反射率与信号功率，GeRaF 迈出了在真实环境中从射频信号重建毫米级几何的第一步。

## 1. 引言

几何重建是一个基础问题，支撑着虚拟现实 [14, 21, 32] 与机器人 [22, 29] 等领域的广泛应用。近年来，神经重建方法 [55, 51, 40, 41, 35] 受到广泛关注。这些方法的一个关键优势是能够连续地表示场景几何，这对许多下游任务有帮助。然而，基于视觉的传感器在恶劣天气条件下 [67, 20, 37, 34] 常常难以工作，甚至在物体被遮挡时完全不可用 [2, 65, 66, 30, 57, 12, 13]。

相反，射频（RF）感知，特别是无线毫米波（mmWave）感知，具有**穿透遮挡**的能力，在挑战性可见性条件下依然稳健，而且不像 X 射线那样对人体有害 [56]，这使其成为 3D 重建的一个有吸引力的替代方案。这可以开辟大量应用；例如，无需打开盒子就能判断盒内物品是否正确、是否损坏或是否构成威胁。另一方面，毫米波分辨率相比视觉极低。图 1 给出一幅雷达图像的示例，其视觉上下文远少于相机图像，因此仅凭雷达图像直接提取 3D 重建很困难。为了进行更完整的 3D 重建，一些工作 [2, 65, 30, 57, 13] 通过利用运动或模拟更大的天线孔径来做 3D 点云重建或人体跟踪，但从射频恢复的点云仍然过于稀疏、噪声过大，无法可靠恢复精细几何。另一些工作 [6, 24] 提出对射频感知使用神经隐式表示，旨在通过神经优化从强噪声中浓缩场景信息。然而，这些系统面向大规模环境设计，远未达到毫米级精度。与近场表面重建相比，当物体靠近雷达时，射频信号的传播特性会发生剧烈变化 [57, 45]，这意味着面向大规模场景的处理方法（例如波束成形 [5]）会引入大量失真与噪声，常常超过梯度下降可接受的噪声水平，导致优化不稳定。

本文提出**首个**利用神经表示学习克服"输入中巨量射频噪声"与"毫米级几何重建"这一根本矛盾的方法，如图 1 所示。然而，实现这一目标并不简单。直接使用射频成像推断表面几何，与传统的基于图像的方法相比存在三个方面的根本性不同挑战。(1) 一个关键挑战是无线系统中**缺少基于透镜的成像模型**。视觉渲染使用透镜来过滤与聚焦相关光线，而无线系统通过**无透镜成像**工作，接收所有入射射频信号而不做方向性滤波。由于无法排除无关信号，这导致信噪比很低。(2) 射频信号与可见光的传播特性存在根本差异。可见光传播主要由散射决定，而射频反射以**镜面反射**为主。因此，为基于散射的视觉传感器设计的体渲染技术不适用于射频成像。(3) 最后，一个主要挑战是无透镜体渲染的高计算代价。与沿一维射线采样的基于透镜的渲染不同，无透镜渲染需要在完整 3D 空间中采样，导致三次复杂度，使朴素实现不可行。

为应对上述挑战，我们提出以下关键贡献：(1) 我们通过把**匹配滤波器**（matched filter，MF）引入框架来进行几何重建，它丢弃无关信号并保留信息量最大的信号。(2) 我们实现**基于物理的射频体渲染**，把射频专用的反射模型与镜面反射的数学框架直接集成到渲染过程中。(3) 我们提出新的**无透镜采样与无透镜 alpha 混合**策略，在实现全面场景覆盖的同时显著降低计算代价，使体渲染对毫米级射频应用变得可行。基于这些组件，我们设计了具有三个关键子网络的神经模型：符号距离函数（signed distance function，SDF）网络、反射网络与信号功率预测网络，分别用 MLP 或可训练参数实现。

我们使用安装在机械臂上的 77 GHz 毫米波雷达扫描各种真实物体来评估系统。结果表明，**GeRaF** 在从射频信号进行精确 3D 重建方面迈出了重要的第一步，在重建质量与对实验噪声的稳健性上都优于当前采用的方法。这些发现表明，相比现有方法，GeRaF 即使在挑战性感知条件下也能推断更详细的场景几何。

> **图 1（原文 Fig. 1）：** GeRaF 是首个利用神经隐式表示从射频（RF）信号重建非视距物体毫米级几何的方法。右侧展示了单次扫描的雷达热图、相机扫描、直接从雷达热图图像重建的表面，以及 GeRaF 输出的表面。

## 2. 相关工作

**基于视觉的多视图 3D 重建与逆渲染。** 传统方法利用图像间的光度一致性 [17]，并把得到的深度图融合为稠密点云 [16, 63, 58]。为获得表面表示，通常把 Alpha Shapes [15] 与 Poission 表面重建 [27] 等技术作为点云的后处理步骤。随着深度学习的兴起，神经辐射场（NeRF）[39] 与高斯溅射（Gaussian Splatting，3DGS）[28] 等方法使用可学习参数从多视图图像重建 3D 场景。在神经隐式表示 [42, 62, 61, 55] 与 3DGS [23, 25, 33, 18, 8] 的基础上，近期工作进一步把场景分解为显式几何并重建表面网格。此外，[46, 7, 41, 59, 26, 35, 19, 60] 基于带 BRDF 的显式前向渲染方程，通过考虑复杂光相互作用来应对光照与材质属性预测的挑战，这一过程称为逆渲染。该技术具有更强的物理依据，使重建结果更接近真实外观。虽然这些方法通常基于有透镜的 RGB 图像，[38] 提出了无透镜 RGB 图像上的新视图合成。然而，无透镜 RGB 图像仍可映射到基于透镜的成像模型而不改变底层光线物理，而射频信号则不同，这种变换从根本上不成立。迄今为止，所有这些 3D 表示都源自 **RGB 图像**，难以直接迁移到**毫米波数据**。

**3D 雷达成像。** 一些工作使用低频雷达估计人体 3D 姿态并穿墙、穿透遮挡地跟踪人体 [2, 1, 65, 30]。然而这些工作利用人体运动来对抗镜面性，且面向人体网格重建。以往工作也在毫米波雷达数据的成像或点云补全中利用深度学习，但这些工作主要面向自动驾驶场景，那里图像分辨率并不重要，且可能无法泛化到其他物体 [20, 47, 31, 48, 49]。

更近期，[36, 68, 9] 受 NeRF [39] 启发，解决一个不同的问题：基于空间中不同反射体发射的预测信号来估计无线信道。一类工作 [4, 52] 把 NeRF 应用于模拟卫星图像；[6, 24] 试图通过在频域表示无线信号并学习不同点的反射率与占据情况来重建 3D 场景。然而，所有这些先前工作都试图执行面向大规模场景（如街道或卫星图像）重建的雷达图像渲染，并未处理近距离高分辨率物体重建——后者需要不同的波传播建模，如附录 A.4 所述。[50] 的作者提出一种物体 3D 神经重建方法。然而其评估局限于模拟数据，而在处理无线信号时，模拟数据远不能代表真实世界实验的复杂度。

需要区分的重要一点是：所有先前使用射频进行 3D 神经重建的工作，要么局限于模拟数据，要么面向远距离场景重建；而本文是首个提出完整高分辨率 3D 网格重建的论文。

## 3. 技术背景

**雷达基础。** 毫米波雷达通过发射无线信号并接收来自场景中反射体的回波来工作。它运行在毫米波频段，使用调频连续波（Frequency Modulated Continuous Wave，FMCW）与天线阵列来帮助消除空间模糊。如图 2(a) 所示，发射的 FMCW 是一种频率随时间线性增加的函数。考虑单个反射体与单个天线，接收到的 chirp 只是发射 chirp 的时延版本，见图 2(b)。为消除距离模糊，将接收 chirp 与发射 chirp 的共轭相乘，可表示为一个复函数：

$$
s(t)=A\cdot \mathrm{e}^{-\mathrm{j}2\pi(f+kt)d/c}=A\cdot \mathrm{e}^{-(\mathrm{j}2\pi k\tau)t}\cdot \mathrm{e}^{-\mathrm{j}2\pi f\tau}, \tag{1}
$$

其中 $A$ 是信号幅度，$d$ 是往返传播距离，$c$ 是光速，$\tau=d/c$ 是往返时延，$f$ 是起始频率，$k$ 是 chirp 斜率。对多个反射体，我们只需接收所有反射的线性组合。

> **图 2（原文 Fig. 2）：** (a) 调频连续波，(b) 反射信号是发射信号的延迟版本，用于分辨距离。(c) 镜面反射主导雷达波传播，而 (d) 扩散反射主导视觉；(e) 为纳入镜面反射与信号扩散而建模的雷达反射。

**反射。** 与光不同，光的波长（约 $10^{-7}$ 米量级）远小于表面不规则度，因而以扩散反射为主；射频信号的波长长得多（约 $10^{-3}$ 米量级）。在这种情况下，大多数表面对射频信号而言相对光滑，镜面反射比扩散散射更显著。对镜面反射，入射角等于反射角，而扩散反射倾向于在不同角度散射。图 2(c,d) 展示了这一差异。

本文主要期望镜面反射。我们遵循平移朗伯模型（shifted Lambertian model）[44, 43]：返回接收机的反射功率按法线与信号反射角进行缩放，见图 2(e)。接收功率由方向缩放因子 $(\omega_o\cdot\omega_r)$ 调制，其中 $\omega_o$ 是理想镜面向量，$\omega_r$ 是从反射面到接收机的向量（见附录 A.3）。反射强度还依赖材料属性与物体厚度，我们用反射系数 $a$ 对其建模。

另有一个 $1/(4\pi u)^2$ 的功率衰减因子从接收反射幅度中除去（功率为 $1/(4\pi u)^4$），其中 $u$ 是点到天线的距离，以精确建模自由空间路径损耗（见附录 A.2）。给定幅度为 $A_{\mathrm{tx}}$ 的输入信号，接收信号幅度 $A_{\mathrm{rx}}$ 可表示为

$$
A_{\mathrm{rx}}\propto\frac{a}{(4\pi u)^2}A_{\mathrm{tx}}\,(\omega_o\cdot\omega_r). \tag{2}
$$

**无透镜成像。** 与依赖透镜的传统视觉成像系统不同，雷达成像本质上是一种**无透镜**成像技术。如图 3a 所示，视觉系统中的针孔充当物理滤波器，只允许每个场景点的一条光线到达 CMOS 传感器，而阻挡无关光线。摄影中，增大孔径允许更多光线进入，但也会导致图像模糊与噪声。当孔径趋近无穷大时，系统过渡为无透镜成像模型。无透镜成像（例如使用雷达天线阵列）不使用任何物理针孔——**所有**入射光线都被所有天线接收。

相反，雷达成像依赖算法处理来重建场景。核心思想是应用数字滤波器去除不真实的信号并保留最相关的信号，利用接收信号的时变与相位延迟信息。每路接收信号经由不同路径到达，携带由传播延迟决定的不同相移。用于该过程的算法称为**匹配滤波器**。

**可微匹配滤波器。** 该算法通过把接收信号与理想参考信号相关来实现。由式 1，单反射体、单天线的参考信号已知。对多天线测量，有

$$
P(\mathbf{x})=\left|\sum_{i=1}^{N_{\mathrm{ant}}}\sum_{t}s(i,t)\,\mathrm{e}^{\mathrm{j}2\pi k\tau_i t}\mathrm{e}^{\mathrm{j}2\pi f\tau_i}\right|, \tag{3}
$$

其中 $N_{\mathrm{ant}}$ 是天线数，$\tau_i$ 是第 $i$ 根天线对应的往返时延，$s(i,t)$ 表示第 $i$ 根天线在时刻 $t$ 接收到的信号。由于发射幅度 $A_{\mathrm{tx}}$ 是常数，我们将其省略。这一过程有效地平均掉与假设信号模型不一致的信号，图 3b 给出一个匹配滤波器（MF）功率图像。

为便于集成到可微渲染框架，我们还计算 MF 的反向传播。前向与反向传播都在 GPU 上并行实现。所有实现细节见附录 A.5 与 A.6。

> **图 3（原文 Fig. 3）：** a) 基于透镜成像与无透镜成像模型的比较。b) 金属兔子（bunny）的匹配滤波图像，沿垂直、水平与深度轴分别求和。

## 4. 总览

给定原始射频信号与多个天线平面上所有天线的位置，GeRaF 旨在通过预测符号距离函数（SDF）来重建物体表面几何，且不需要任何额外信息。GeRaF 由五个主要组件构成，如图 4 所示：(1) 从点采样开始。与基于视觉的方法 [39] 中基于射线的采样不同，我们提出与雷达感知物理本质一致的**无透镜采样**策略。细节见第 6 节。(2) 采样点通过三个子网络预测场景几何、反射属性与雷达信号功率。(3) 利用这些预测，连同表面法线（由 SDF 的梯度计算）、反射方向与功率衰减，我们对每根天线执行**基于物理的射频体渲染**，如第 5 节所述。为在无透镜设定下正确计算不透明度与透射率，我们引入新的无透镜 alpha 混合策略，详见第 6 节。(4) 接下来，我们应用式 3 定义的匹配滤波器（MF）计算每个采样点的反射功率并生成渲染的 MF 热图。该步骤把高频时域信号转换为场景的低维空间表示。(5) 最后，我们对渲染热图与真值之间的差异施加 $L_2$ 损失，通过反向传播实现整个框架的端到端优化。

> **图 4（原文 Fig. 4）：** GeRaF 框架总览。(1) 无透镜采样取代基于射线的方法。(2) 神经隐式模型预测几何、反射率与功率。(3) 射频体渲染模拟物理信号传播。(4) 匹配滤波产生 MF 功率图像（热图）。(5) 用 $L_2$ 损失比较渲染功率与真值功率，实现端到端训练。

## 5. 基于物理的射频体渲染

本节从一个简单的基于射线追踪的采样策略开始。假设我们采样一条从位于 $\mathbf{x}_{\mathrm{ant}}$ 的接收天线沿方向 $\omega_r$ 发出的射线。射线上的点 $\mathbf{x}$ 可表示为 $\mathbf{x}=\mathbf{x}_{\mathrm{ant}}+u\,\mathbf{r}$，其中 $u$ 是沿射线的采样距离，$\mathbf{r}$ 是与 $\omega_r$ 相反的单位方向向量。我们首先介绍**信号追踪**，它计算信号的频率与相位偏移；然后介绍**信号幅度渲染**，它对接收信号的幅度项进行"渲染"。

### 5.1 信号追踪

信号追踪基于假设的场景或空间配置，为所有可能的传播路径生成期望信号响应。模拟接收信号等价于对每根天线建模接收到的 chirp。利用式 1 的单反射体表达式，多反射体场景的参考信号是所有反射体贡献的叠加。然而实践中并不存在显式的"反射体"；取而代之的是连续的 3D 场景。我们把计算空间 $\Omega_{\mathrm{pts}}$ 中的每个点 $\mathbf{x}$ 都视为潜在反射体，无论它位于自由空间还是物体表面。体积密度与反射属性则编码在幅度项 $A(\mathbf{x})$ 中。接收信号由式 4 表示，并在 GPU 上并行实现。实现细节见附录 A.5 与 A.6。

$$
s(\mathbf{x}_{\mathrm{ant}},t)=\sum_{\mathbf{x}\in\Omega_{\mathrm{pts}}}A_{\mathrm{rx}}(\mathbf{x})\,\mathrm{e}^{-\mathrm{j}2\pi k\tau_{\mathbf{x}}t}\,\mathrm{e}^{-\mathrm{j}2\pi f\tau_{\mathbf{x}}}. \tag{4}
$$

### 5.2 信号幅度追踪

反射射频信号的幅度受多个因素影响，包括表面几何、材料反射率、反射角以及传播距离导致的功率衰减。与基于视觉的 NeRF 渲染 [39] 不同，雷达感知涉及**往返**路径，要求我们同时建模来自发射机的入射射线与到接收机的出射射线。

给定不透明度密度 [55] $\rho(u)$，沿入射路径的累积透射率可计算为 $T(u)=\exp\left(-\int_0^u\rho(v)\,\mathrm{d}v\right)$。然而，由于雷达信号的往返路径，有效累积透射率变为 $T(u)^2$，即只有 $T(u)^2$ 比例的信号在返回接收机后仍然存在。

结合体渲染、反射率、反射角与式 2 定义的功率衰减，假设沿同一射线对称返回，接收天线（rx）处反射信号的幅度为

$$
A_{\mathrm{rx}}(\mathbf{x}_{\mathrm{ant}},\omega_r)=a(u)\,(\omega_o\cdot\omega_r)\,\gamma(u)\,T(u)^2\rho(u)\,A'_{\mathrm{tx}}\,\mathrm{d}t, \tag{5}
$$

其中 $a(u)$ 是距离 $u$ 处的反射率，$\omega_o$ 是出射方向，计算为 $\omega_o=\omega_i-2(\mathbf{n}\cdot\omega_i)\mathbf{n}$，$\omega_i$ 是入射方向，$\mathbf{n}$ 是表面法线（由 SDF 的梯度得到），$\gamma$ 是功率衰减，$A'_{\mathrm{tx}}$ 是发射的输入功率。式 2 中的比例常数 $a$ 在射线上所有点保持不变。因此，不失一般性，我们把该常数吸收到发射幅度项 $A_{\mathrm{tx}}$ 中，并定义有效发射幅度 $A'_{\mathrm{tx}}$。

**不透明度密度表示。** 为表示体积密度与累积透射率，我们从 SDF 出发。场景由 SDF $f:\mathbb{R}^3\to\mathbb{R}$ 定义，它把空间位置 $\mathbf{x}\in\mathbb{R}^3$ 映射到其到物体最近表面的符号距离。该函数由 MLP 参数化。物体表面 $S$ 定义为 SDF 的零水平集。

沿用 [55]，我们使用 S-密度函数 $\phi_s(f(\mathbf{x}))$，它定义为 sigmoid 函数 $\Phi_s(f(\mathbf{x}))$ 的导数。不透明度密度 $\rho(u)$ 基于占据场 $\Phi_s$ 沿射线方向的变化率计算。

**信号表示。** 我们采用另一个 MLP，以 3D 空间位置 $\mathbf{x}$ 为输入预测反射系数 $a$。有效输入幅度 $A'_{\mathrm{tx}}$ 被当作可学习的全局参数，因为发射幅度在所有实验中固定且一致。

**离散化。** 我们采用与 [55] 相同的离散化方案，用 alpha 混合估计不透明度密度与透射率。表面法线 $\mathbf{n}$ 计算为 SDF 的梯度。

**积分。** 根据式 4，每根天线接收的信号计算为对式 5 定义的幅度的积分。为计算该积分，我们采用蒙特卡洛采样，在空间中为每根天线追踪 $N_{\mathrm{ray}}$ 条射线。

然而，把所有组件组合起来后，整体计算复杂度高得不可行。假设我们在每条射线上采样 $N_z$ 个深度点，并为每根天线追踪 $N_{\mathrm{ray}}$ 条射线。MLP 网络的计算代价为 $C_{\mathrm{mlp}}$。信号追踪步骤在前向与反向传播中的复杂度为

$$
\mathcal{O}\left(N_{\mathrm{ray}}N_zN_{\mathrm{ant}}C_{\mathrm{mlp}}\right). \tag{6}
$$

实践中，要达到 1 mm 分辨率，体素数目会变得非常大。若合成孔径天线阵列包含约 $10^5$ 根天线量级，总计算量迅速达到不现实的极限。即使有 GPU 加速，该设置下单次前向传播此前需要超过一小时的计算。这一规模远超可用 GPU 线程数，使基于反向传播的学习在这种暴力计算策略下不可行。

## 6. 无透镜采样与无透镜 alpha 混合

为使体渲染在计算上可行，我们观察到先前的蒙特卡洛采样策略存在显著冗余。具体地，来自不同天线的射线经常在同一空间位置相交，导致重复计算。一个直接的解决方案可能是在 3D 空间中采用均匀网格采样。然而，这种方法无法保留沿单条射线的透射率累积结构，而后者对精确信号建模至关重要。

为同时解决冗余与物理正确性，我们提出无透镜采样。关键洞见是跨不同天线共享不透明度密度与累积透射率的计算，即 $\rho(u)$ 与 $T(u)$ 对每个位置只需计算一次，供所有与该位姿相交的天线射线使用。

**主射线。** 我们首先采样与雷达主方向 $\omega_p$ 对齐的平行射线。这些射线的起点 $\mathbf{x}_{\mathrm{apr}}$ 在天线孔径内采样，然后沿每条射线采样点。起初，我们忽略 $\rho(u)$ 与 $T(u)$ 依赖真实射线方向这一事实，实际是用共享的主方向 $\omega_p$ 替换所有单独的接收方向 $\omega_r$。采样点表示为 $\mathbf{x}=\mathbf{x}_{\mathrm{apr}}+u\,\mathbf{p}$，假设这些值在所有经过同一空间位置的射线间共享。具体地，对每个位置，我们用 [55] 计算一次 $\rho(u)$ 与 $T(u)$，并为所有天线复用。我们选择雷达主方向作为射线方向，以最小化近似射线与天线实际发射射线之间的差异。

**无透镜 alpha 混合。** 在原理上，忽略 $\rho(u)$ 与 $T(u)$ 对射线方向的依赖会导致不准确。然而我们在附录 B.1 中证明，当计算 $\alpha_i=1-\exp\left(-\int_{u_i}^{u_{i+1}}\rho(u)\,\mathrm{d}u\right)$ 时，射线方向的影响相互抵消，$\alpha_i$ 与沿主射线计算的值完全相同。

此外，对累积透射率，我们可以证明：从 logistic 分布出发，不同射线方向间 $T(u)$ 的差异等于射线起点处 sigmoid-SDF 值的差异。推导细节见附录 B.2。形式上，沿真实射线方向的透射率 $T(u')$ 可由沿主射线方向的透射率 $T(u)$ 通过调整各自射线起点处的 sigmoid-SDF 值来高效导出，而不必计算依赖射线的累积 alpha 乘积：

$$
T(u')=T(u)-\Phi_s(f(\mathbf{x}(u_s)))+\Phi_s(f(\mathbf{x}(u_s'))), \tag{7}
$$

其中 $\Phi_s(\cdot)$ 表示 logistic 分布的累积分布函数（CDF），$\mathbf{x}(u_s)$ 与 $\mathbf{x}(u_s')$ 是相应射线的起点。功率衰减项 $\gamma$ 以及时间与相位分量都用真实射线确定性计算。此外，用于校正累积透射率的射线起点处 Sigmoid-SDF 值被排除在反向传播之外，以确保计算效率。

**信号追踪库。** 在式 3 中，我们遍历采样点，并对每个点跨所有天线执行信号追踪。在每次信号追踪操作内部，我们又遍历沿射线的所有采样点。尽管这些计算不可避免，但我们可以利用匹配滤波器不含可训练参数这一事实显著降低计算负担。这使我们能够复用大多数天线在前几次迭代中的信号追踪结果。训练时，我们实现一种记忆库（memory bank）机制。我们把天线孔径划分为若干 patch，类似于卷积处理。每次训练迭代只对单个 patch 内的天线执行信号追踪，其他 patch 内天线的信号追踪结果从记忆库取回。每次迭代后，用当前 patch 新计算的结果更新记忆库。

**计算复杂度。** 通过复用主射线，我们前向与反向传播都只需评估共享的不透明度密度与累积透射率 $\mathcal{O}(N_{\mathrm{ray}}N_zC_{\mathrm{mlp}})$ 次。无透镜近似只影响前向计算，而引入信号追踪库后，每次迭代的有效天线规模变为常数。因此，整体可学习组件的复杂度降为 $\mathcal{O}(N_{\mathrm{ray}}N_zC_{\mathrm{mlp}})$。对于信号追踪与匹配滤波的确定性组件，前向与反向传播的计算时间仍有界于 $\mathcal{O}(N_{\mathrm{ray}}N_zN_t)$。这使得总复杂度显著低于式 6 给出的原始表述。

> **图 5（原文 Fig. 5）：** **左：** 朴素采样为每根天线在整个空间追踪射线，计算复杂度最高。**中：** 无透镜采样策略沿雷达主射线方向采样点，并在天线间复用网络预测；alpha 混合与透射率用无透镜 alpha 混合计算。**右：** 信号追踪库：每次迭代只处理一部分天线，降低前向与反向传播的计算量。

图 7 展示了不同采样配置下的延迟与 GPU 内存占用。基线配置为 $N_{\mathrm{ray}}=1024$、$N_z=32$，信号追踪库的 patch 大小为 3200 根天线。若不用无透镜采样，由于同时处理 $N_{\mathrm{ant}}N_{\mathrm{ray}}N_z$ 个采样点的内存需求过高，训练变得不可行。信号追踪库大幅降低了训练时间与内存消耗。我们在所有实验中采用该基线配置以确保效率。

> **图 7（原文 Fig. 7）：** 实线表示延迟（每次迭代的时间），虚线表示 GPU 内存使用量。绿色表示信号追踪库中 patch 天线大小的配置；橙色表示射线数目，其中 "w.o. lens-less" 指禁用无透镜采样，其内存使用量过大而无法实验测量，故由理论推算；紫色表示每条射线上的采样点数。

## 7. 优化

**动态损失掩码。** 在雷达成像中，仅用 $L_2$ 损失最小化渲染雷达图像与真值之间的差异并不有效。这是因为雷达测量基于反射信号，而反射信号不仅受体积密度存在的影响，还受反射方向影响。这意味着渲染雷达图像中的弱信号响应可能由两个不同因素引起：(1) 采样位置处体积密度低，或 (2) 体积密度高但信号因几何失准被反射到远离接收机的方向。这种固有歧义使直接监督不可靠。

为此，我们在训练中引入掩码策略。若某个采样点在之前任一次迭代中表现出高匹配滤波响应，但在当前迭代产生低功率，我们认为它不可靠并将其排除在损失计算之外。这避免了因物理上有效但未能反射回接收机的信号路径而惩罚模型。

## 8. 实验

**数据集与实现。** 由于没有公开可用的近距离成像雷达数据集，我们使用 TI 1843BOOST 毫米波雷达 [53] 配 DCA1000EVM 采集原始数据，构建了自己的数据集；雷达安装在通过 FrankaPy 库 [64] 控制的 Franka Research 3 机械臂上。我们通过机械臂移动雷达来模拟 2D 阵列，每个物体取 17–68 个阵列视角。真值采集使用 iPhone 上的 Scaniverse App，它利用相机与 LiDAR 扫描计算 3D 网格与点云。我们在单块 NVIDIA H100 GPU 上训练模型 50,000 次迭代，耗时 32 小时。详细数据描述与训练超参数见附录 C。

> **表 1（原文 Table 1）：** 定量结果（$\star$ 表示被遮挡）。

| 物体 | F1 ↑（MF） | F1 ↑（本文） | CD（mm）↓（MF） | CD（mm）↓（本文） |
|---|---|---|---|---|
| Wrench | 0.52 | **0.88** | 0.29 | **0.07** |
| Bunny | 0.56 | **0.81** | 0.03 | **0.01** |
| Elephant | 0.65 | **0.79** | 0.25 | **0.14** |
| Bottle | 0.44 | **0.97** | 0.35 | **0.05** |
| Knife | 0.44 | **0.71** | 0.59 | **0.49** |
| Star | 0.80 | **0.86** | 0.60 | **0.50** |
| Knife$\star$ | 0.45 | **0.83** | 0.84 | **0.26** |
| Elephant$\star$ | 0.42 | **0.52** | 0.52 | **0.46** |
| Boat$\star$ | 0.51 | **0.69** | 0.35 | **0.30** |
| Wrench$\star$ | 0.63 | **0.86** | 0.29 | **0.14** |

**与基线比较。** 作为基线，我们把 GeRaF 的结果与所有图像的匹配滤波求和结果比较。由于对应输出是热图，我们对图像做阈值处理，并对点云执行 Poisson 表面重建。定性比较见图 6。第一行是被成像的物体，随后是相机扫描、基线匹配滤波重建，最后是 GeRaF 的输出。前四列是物体位于雷达视距内时的重建结果，后三列是物体被盒子或大张纸遮挡时的结果。在非视距数据处理中，从 MF 图像中裁剪掉盒子，只重建盒子内部的物体。显然，从匹配滤波真值提取的网格不如 GeRaF 的输出完整，且我们的方法在视觉方法会失败时（例如视线被完全遮挡时）仍然有效。

> **图 6（原文 Fig. 6）：** **左：** 雷达与物体之间没有任何遮挡时的物体实验结果。**右：** 物体被雷达遮挡时的结果。相机扫描在视距下完成。

尽管 GeRaF 的输出可能不如相机扫描精细，这主要是由于我们的扫描局限于单一俯仰轴，限制了能从物体接收到的反射数量；该局限在附录 E 中有更详细讨论。图 8 展示了渲染输出与真值雷达热图相似性的示例。更多定性结果将放入补充材料。

> **图 8（原文 Fig. 8）：** 渲染热图与真实热图的比较。

定量结果见表 1，包括 F1 分数（F1）与以毫米为单位的 Chamfer 距离（CD），解释见附录 C；其中点在相机网格、匹配滤波网格与 GeRaF 网格上均匀采样。可以看到，我们的方法在 F-Score 与 Chamfer 距离上都优于匹配滤波（MF）基线，当物品被移入盒子时精度略有下降。

**新视图合成。** 我们还展示了 GeRaF 在新视图合成（NVS）[39] 方面的能力。为评估这一点，我们把可用视图划分为训练集与测试集。GeRaF 只用训练视图训练，并在留出的测试视图上评估。为评估合成匹配滤波图像的质量，我们计算渲染输出与真值匹配滤波图像之间的峰值信噪比（PSNR）。PSNR 是评估图像重建保真度的常用指标，值越高表示与参考越接近。峰值信噪比（PSNR）计算为

$$
\mathrm{PSNR}=10\cdot\log_{10}\left(\frac{\mathrm{MAX}^2}{\mathrm{MSE}}\right), \tag{8}
$$

其中 $\mathrm{MAX}$ 是图像可能的最大像素值，$\mathrm{MSE}$ 是合成图像与真值之间的均方误差。与 RGB 图像不同，匹配滤波（MF）图像没有固定的最大像素值。为使 PSNR 计算有意义，我们把每幅 MF 图像除以其最大值进行归一化。因此，所有 PSNR 评估中可能的最大像素强度设为 $\mathrm{MAX}=1.0$。

图 9 给出 Bunny 物体上的四个新视图合成结果。所选视图包括物体的前、左、后、右侧。每种情况下，GeRaF 生成的可视化都与真值密切吻合。定量上，合成的匹配滤波图像达到约 30 dB 的 PSNR，证明 GeRaF 在新视图合成任务上的可行性与有效性。

> **图 9（原文 Fig. 9）：** 四个选定新平面上的新视图合成。我们用最大强度投影沿三个轴投影 3D 匹配滤波图像进行可视化。

## 9. 消融研究

### 9.1 雷达扫描平面数

我们研究训练中使用的雷达扫描平面数（类比于视觉重建中的视图数）的影响。为覆盖物体完整的 360 度视图，共测量 104 个平面。我们均匀采样这些平面的子集以模拟不同输入设置。

即使只有 8 个平面，GeRaF 也能重建 Bunny 的基本形状，尽管结果包含明显噪声与不准确的细节。当平面数少于 40 时，重建形状出现可见畸变，噪声水平显著增加。当平面数多于 72 时，整体形状被正确重建，差异主要限于细节。这表明一旦达到足够的覆盖阈值，GeRaF 对输入平面数稳健。

总体上，结果呈现清晰趋势：增加雷达扫描平面数可提升重建质量，得到更精确的几何与更少噪声。

> **图 10（原文 Fig. 10）：** 雷达扫描平面数的消融研究。F1 表示 F1-Score，CD 表示 Chamfer 距离。↑ 表示越大越好，↓ 表示越小越好。

### 9.2 时间采样数

我们研究时间采样数 $N_t$ 对几何重建质量的影响。根据匹配滤波方程：

$$
P(\mathbf{x})=\left|\sum_{i=1}^{N_{\mathrm{ant}}}\sum_{t=1}^{N_t}s(i,t)\,\mathrm{e}^{\mathrm{j}2\pi k\tau_i t}\mathrm{e}^{\mathrm{j}2\pi f\tau_i}\right|,
$$

增加时间采样数会提高分辨率。然而，匹配滤波的计算代价随 $N_t$ 增加。为评估这一权衡，我们评估不同 $N_t$ 下的重建质量，如图 11 所示。经验上，我们观察到 $N_t$ 变化时性能没有显著退化，说明 GeRaF 对噪声稳健。虽然使用更少时间采样理论上会降低真值匹配滤波图像的质量，但更大 $N_t$ 带来的延迟增加相对有限。综合考虑性能与效率，我们在最终实现中取 $N_t=64$。

### 9.3 位置编码频率级数

我们采用 NeRF [39] 中的正弦位置编码，把每个输入 $\mathbf{x}$ 用下式映射到更高维空间：

$$
\gamma(\mathbf{x})=\left[\sin(2^0\pi\mathbf{x}),\cos(2^0\pi\mathbf{x}),\dots,\sin(2^{N_{\mathrm{level}}-1}\pi\mathbf{x}),\cos(2^{N_{\mathrm{level}}-1}\pi\mathbf{x})\right],
$$

其中 $N_{\mathrm{level}}$ 控制频带数。

低频级（例如 $2^0$、$2^1$）捕获粗糙、平滑的变化，而高频级（例如 $2^9$、$2^{10}$）捕获精细、高频的细节，如锐利边缘或细结构。频率级数 $N_{\mathrm{level}}$ 控制表达能力与过拟合之间的权衡：更高的 $N_{\mathrm{level}}$ 能建模更精细的细节，而更低的 $N_{\mathrm{level}}$ 降低模型复杂度并有助于防止对噪声过拟合。

为评估这一权衡，我们评估不同位置编码频率级 $N_{\mathrm{level}}$ 下的重建质量，如图 11 底部所示。

我们观察到，更高频率级能更好地重建 Bunny 的精细细节，并提高对射频信号噪声的稳健性。此外，增加 $N_{\mathrm{level}}$ 会带来更高计算延迟，但增幅相对有限。考虑这一权衡，我们在最终配置中取 $N_{\mathrm{level}}=10$。

> **图 11（原文 Fig. 11）：** **上：** 时间采样数 $N_t$ 的消融研究。**下：** 位置编码频率级 $N_{\mathrm{level}}$ 的消融研究。Lat 表示延迟，MEM 表示 GPU 内存使用量。

### 9.4 分辨率

第 6 节讨论了不同训练时采样分辨率所需的计算资源。

就采样射线数而言，结果表明增加射线数会带来更高内存使用与更长延迟，但重建性能反而更差。一种可能解释是：在射频数据中，更稠密采样引入更多噪声，从而减慢收敛。因此，在固定训练迭代数下，更高采样分辨率可能因收敛不足而得到次优解。基于这些观察，我们在最终配置中取 $N_{\mathrm{ray}}=1024$。

就深度采样数 $N_z$ 而言，结果表明更少深度采样会导致更低重建细节与更粗糙的整体形状。虽然减少深度采样在时间上线性提升训练效率，但代价是保真度下降。因此，我们取 $N_z=32$ 作为最终配置，以平衡质量与性能。

> **图 12（原文 Fig. 12）：** **上：** 射线采样数 $N_{\mathrm{ray}}$ 的消融研究。**下：** 深度采样数 $N_z$ 的消融研究。Lat 表示延迟，MEM 表示 GPU 内存使用量。

### 9.5 动态损失掩码

第 7 节讨论了使用动态损失掩码的动机。主要原因在于解释匹配滤波（MF）成像中低功率区域时的固有歧义。具体地，渲染雷达图像中的弱信号响应可能源于两个不同原因：(1) 采样位置处体积密度低，或 (2) 体积密度高但信号因几何失准被反射到远离接收机的方向。这种歧义使低反射区域的直接监督不可靠。

如图 13 所示，不使用动态损失掩码训练会导致错误重建。模型倾向于把低强度区域解释为低密度，从而产生伪影——例如 Bunny 示例中扭曲的耳朵——而真实几何因朝向导致弱反射，并非材质缺失。这凸显了在训练中掩码不可靠区域以提升几何保真度的重要性。

> **图 13（原文 Fig. 13）：** 动态损失掩码的消融研究。"w.o." 表示不使用掩码，"w." 表示使用掩码。

### 9.6 雷达物理的影响

我们在第 3 节引入雷达物理。雷达反射以镜面效应为主，常用朗伯模型 [44] 近似。本节研究把朗伯模型纳入公式的影响。

为隔离其影响，我们从式 2 中移除 $\omega_o\cdot\omega_r$ 项。如图 14 所示，使用与不使用朗伯模型的视觉差异看起来很小。然而定量结果表明，省略朗伯项会导致更差性能。具体地，在左侧视图中，重建的 Bunny 底部看起来明显大于右侧视图，导致更高的 Chamfer 距离误差。

也就是说，朗伯模型并不能完全刻画雷达反射的物理行为，特别是在镜面与材料相关条件下。因此，虽然它提供了有用的近似，但朗伯模型并非真实雷达物理的最优表示。

> **图 14（原文 Fig. 14）：** 雷达物理的消融研究。"Without radar physics" 表示不使用朗伯模型 [44]。

## 10. 结论

本文提出了首个把可微渲染应用于射频信号、以进行高分辨率几何重建的方法。我们的方法处理了射频成像与光学成像之间的根本差异，并在真实采集数据上给出评估。我们提出了一个物理感知的体渲染管线，纳入雷达特定的信号传播与反射模型，以及一种新的无透镜采样策略，在保持分辨率的同时显著降低计算代价。尽管存在局限（见附录 E），我们相信本文是朝着用神经表示学习实现毫米级几何重建迈出的**第一步**。

## 致谢

我们感谢匿名审稿人与 SENS 实验室成员的有益反馈。我们还要感谢 Sony Research 的 Ralf Boehnke、Dymtro Rachkov 与 Daniel Ardila Palomino 的有益反馈。本项目部分获得 Sony Faculty Innovation Fellowship 资助。

## 参考文献（英文原书目）

- [1] Fadel Adib, Chen-Yu Hsu, Hongzi Mao, Dina Katabi, and Frédo Durand. Capturing the human figure through a wall. ACM Transactions on Graphics (TOG), 2015.
- [2] Fadel Adib and Dina Katabi. See through walls with wifi! In SIGCOMM, 2013.
- [3] Fredrik Andersson, Randolph Moses, and Frank Natterer. Fast fourier methods for synthetic aperture radar imaging. IEEE Transactions on Aerospace and Electronic Systems, 2012.
- [4] Emile Barbier-Renard, Florence Tupin, Nicolas Trouvé, and Loïc Denis. Multi-view 3d surface reconstruction from sar images by inverse rendering, 2025.
- [5] Jacob Benesty, Jingdong Chen, and Yiteng Huang. Conventional beamforming techniques. Microphone array signal processing, 2008.
- [6] David Borts, Erich Liang, Tim Broedermann, Andrea Ramazzina, Stefanie Walz, Edoardo Palladin, Jipeng Sun, David Brueggemann, Christos Sakaridis, Luc Van Gool, et al. Radar fields: Frequency-space neural scene representations for fmcw radar. In SIGGRAPH, 2024.
- [7] Mark Boss, Raphael Braun, Varun Jampani, Jonathan T Barron, Ce Liu, and Hendrik Lensch. Nerd: Neural reflectance decomposition from image collections. In ICCV, 2021.
- [8] Hanlin Chen, Chen Li, and Gim Hee Lee. Neusg: Neural implicit surface reconstruction with 3d gaussian splatting guidance. arXiv preprint, 2023.
- [9] Xingyu Chen, Zihao Feng, Kun Qian, and Xinyu Zhang. Radio frequency ray tracing with neural object representation. arXiv preprint, 2024.
- [10] MMDetection3D Contributors. MMDetection3D: OpenMMLab next-generation platform for general 3D object detection. https://github.com/open-mmlab/mmdetection3d, 2020.
- [11] Robert L Cook and Kenneth E. Torrance. A reflectance model for computer graphics. ACM Transactions on Graphics (TOG), 1982.
- [12] Laura Dodds, Tara Boroushaki, Cusuh Ham, and Fadel Adib. Mito: A millimeter-wave dataset and simulator for non-line-of-sight perception. arXiv preprint, 2025.
- [13] Laura Dodds, Hailan Shanbhag, Junfeng Guan, Saurabh Gupta, and Haitham Hassanieh. Around the corner mmwave imaging in practical environments. In Proceedings of the 30th Annual International Conference on Mobile Computing and Networking, pages 953–967, 2024.
- [14] Zhao Dong, Ka Chen, Zhaoyang Lv, Hong-Xing Yu, Yunzhi Zhang, Cheng Zhang, Yufeng Zhu, Stephen Tian, Zhengqin Li, Geordie Moffatt, et al. Digital twin catalog: A large-scale photorealistic 3d object digital twin dataset. In CVPR, 2025.
- [15] Herbert Edelsbrunner, David Kirkpatrick, and Raimund Seidel. On the shape of a set of points in the plane. IEEE Transactions on information theory, 1983.
- [16] Yasutaka Furukawa, Carlos Hernández, et al. Multi-view stereo: A tutorial. Foundations and trends® in Computer Graphics and Vision, 2015.
- [17] Yasutaka Furukawa and Jean Ponce. Accurate, dense, and robust multiview stereopsis. IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI), 2009.
- [18] Jian Gao, Chun Gu, Youtian Lin, Zhihao Li, Hao Zhu, Xun Cao, Li Zhang, and Yao Yao. Relightable 3d gaussians: Realistic point cloud relighting with brdf decomposition and ray tracing. In ECCV, 2024.
- [19] Chun Gu, Xiaofei Wei, Zixuan Zeng, Yuxuan Yao, and Li Zhang. Irgs: Inter-reflective gaussian splatting with 2d gaussian ray tracing. In CVPR, 2025.
- [20] Junfeng Guan, Sohrab Madani, Suraj Jog, Saurabh Gupta, and Haitham Hassanieh. Through fog high-resolution imaging using millimeter wave radar. In CVPR, 2020.
- [21] Junfu Guo, Yu Xin, Gaoyi Liu, Kai Xu, Ligang Liu, and Ruizhen Hu. Articulatedgs: Self-supervised digital twin modeling of articulated objects using 3d gaussian splatting. arXiv preprint, 2025.
- [22] Nick Heppert, Muhammad Zubair Irshad, Sergey Zakharov, Katherine Liu, Rares Andrei Ambrus, Jeannette Bohg, Abhinav Valada, and Thomas Kollar. Carto: Category and joint agnostic reconstruction of articulated objects. In CVPR, 2023.
- [23] Binbin Huang, Zehao Yu, Anpei Chen, Andreas Geiger, and Shenghua Gao. 2d gaussian splatting for geometrically accurate radiance fields. In SIGGRAPH, 2024.
- [24] Tianshu Huang, John Miller, Akarsh Prabhakara, Tao Jin, Tarana Laroia, Zico Kolter, and Anthony Rowe. Dart: Implicit doppler tomography for radar novel view synthesis. In CVPR, 2024.
- [25] Yingwenqi Jiang, Jiadong Tu, Yuan Liu, Xifeng Gao, Xiaoxiao Long, Wenping Wang, and Yuexin Ma. Gaussianshader: 3d gaussian splatting with shading functions for reflective surfaces. In CVPR, 2024.
- [26] Haian Jin, Isabella Liu, Peijia Xu, Xiaoshuai Zhang, Songfang Han, Sai Bi, Xiaowei Zhou, Zexiang Xu, and Hao Su. Tensoir: Tensorial inverse rendering. In CVPR, 2023.
- [27] Michael Kazhdan, Matthew Bolitho, and Hugues Hoppe. Poisson surface reconstruction. In Proceedings of the fourth Eurographics symposium on Geometry processing, 2006.
- [28] Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler, and George Drettakis. 3d gaussian splatting for real-time radiance field rendering. ACM Transactions on Graphics (TOG), 2023.
- [29] Justin Kerr, Chung Min Kim, Mingxuan Wu, Brent Yi, Qianqian Wang, Ken Goldberg, and Angjoo Kanazawa. Robot see robot do: Imitating articulated object manipulation with monocular 4d reconstruction. In Conference on Robot Learning (CoRL), 2024.
- [30] Belal Korany, Chitra R Karanam, Hong Cai, and Yasamin Mostofi. Xmodal-id: Using wifi for through-wall person identification from candidate video footage. In MobiCom, 2019.
- [31] Haowen Lai, Gaoxiang Luo, Yifei Liu, and Mingmin Zhao. Enabling visual recognition at radio frequency. In MobiCom, 2024.
- [32] Ren Li, Cong Cao, Corentin Dumery, Yingxuan You, Hao Li, and Pascal Fua. Single view garment reconstruction using diffusion mapping via pattern coordinates. In SIGGRAPH, 2025.
- [33] Zhihao Liang, Qi Zhang, Ying Feng, Ying Shan, and Kui Jia. Gs-ir: 3d gaussian splatting for inverse rendering. In CVPR, 2024.
- [34] Yang Liu, Feng Wang, Naiyan Wang, and Zhaoxiang Zhang. Echoes beyond points: Unleashing the power of raw radar data in multi-modality fusion. In NeurIPS, 2023.
- [35] Yuan Liu, Peng Wang, Cheng Lin, Xiaoxiao Long, Jiepeng Wang, Lingjie Liu, Taku Komura, and Wenping Wang. Nero: Neural geometry and brdf reconstruction of reflective objects from multiview images. ACM Transactions on Graphics (TOG), 2023.
- [36] Haofan Lu, Christopher Vattheuer, Baharan Mirzasoleiman, and Omid Abari. Newrf: A deep learning framework for wireless radiation field reconstruction and channel prediction. In ICML, 2024.
- [37] Sohrab Madani, Jayden Guan, Waleed Ahmed, Saurabh Gupta, and Haitham Hassanieh. Radatron: Accurate detection using multi-resolution cascaded mimo radar. In ECCV, 2022.
- [38] Rakesh Raj Madavan, Akshat Kaimal, Vinayak Gupta, Rohit Choudhary, Chandrakala Shanmuganathan, Kaushik Mitra, et al. Ganesh: Generalizable nerf for lensless imaging. In WACV, 2025.
- [39] Ben Mildenhall, Pratul P Srinivasan, Matthew Tancik, Jonathan T Barron, Ravi Ramamoorthi, and Ren Ng. Nerf: Representing scenes as neural radiance fields for view synthesis. Communications of the ACM, 2021.
- [40] Thomas Müller, Alex Evans, Christoph Schied, and Alexander Keller. Instant neural graphics primitives with a multiresolution hash encoding. ACM Transactions on Graphics (TOG), 2022.
- [41] Jacob Munkberg, Jon Hasselgren, Tianchang Shen, Jun Gao, Wenzheng Chen, Alex Evans, Thomas Müller, and Sanja Fidler. Extracting triangular 3d models, materials, and lighting from images. In CVPR, 2022.
- [42] Michael Niemeyer, Lars Mescheder, Michael Oechsle, and Andreas Geiger. Differentiable volumetric rendering: Learning implicit 3d representations without 3d supervision. In CVPR, 2020.
- [43] Ming-Hao Ren, Xi Liao, Jihua Zhou, Yang Wang, Yu Shao, Shasha Liao, and Jie Zhang. Diffuse scattering directive model parameterization method for construction materials at mmwave frequencies. International Journal of Antennas and Propagation, 2020.
- [44] Mark A Richards, Jim Scheer, William A Holm, and William L Melvin. Principles of modern radar. 2010.
- [45] David M Sheen, Douglas L McMakin, and Thomas E Hall. Three-dimensional millimeter-wave imaging for concealed weapon detection. IEEE Transactions on microwave theory and techniques, 2001.
- [46] Pratul P Srinivasan, Boyang Deng, Xiuming Zhang, Matthew Tancik, Ben Mildenhall, and Jonathan T Barron. Nerv: Neural reflectance and visibility fields for relighting and view synthesis. In CVPR, 2021.
- [47] Yue Sun, Zhuoming Huang, Honggang Zhang, Zhi Cao, and Deqiang Xu. 3drimr: 3d reconstruction and imaging via mmwave radar based on deep learning. In IEEE International Performance, Computing, and Communications Conference (IPCCC), 2021.
- [48] Yue Sun, Zhuoming Huang, Honggang Zhang, and Xiaohui Liang. 3d reconstruction of multiple objects by mmwave radar on uav. In 2022 IEEE 19th International Conference on Mobile Ad Hoc and Smart Systems (MASS), 2022.
- [49] Yue Sun, Honggang Zhang, Zhuoming Huang, and Benyuan Liu. R2p: A deep learning model from mmwave radar to point cloud. In International Conference on Artificial Neural Networks, 2022.
- [50] Harshvardhan Takawale and Nirupam Roy. Spinr: Neural volumetric reconstruction for fmcw radars. arXiv preprint, 2025.
- [51] Towaki Takikawa, Joey Litalien, Kangxue Yin, Karsten Kreis, Charles Loop, Derek Nowrouzezahrai, Alec Jacobson, Morgan McGuire, and Sanja Fidler. Neural geometric level of detail: Real-time rendering with implicit 3d shapes. In CVPR, 2021.
- [52] Weiyi Tan, Yu Wang, Biao Tian, and Shiyou Xu. Fast 3d reconstruction of space targets from isar image sequences based on neural network. In IEEE 8th International Conference on Vision, Image and Signal Processing (ICVISP), 2024.
- [53] TI Inc. Texas instrument awr1843. https://www.ti.com/product/AWR1843, 2023.
- [54] Dor Verbin, Peter Hedman, Ben Mildenhall, Todd Zickler, Jonathan T Barron, and Pratul P Srinivasan. Ref-nerf: Structured view-dependent appearance for neural radiance fields. In CVPR, 2022.
- [55] Peng Wang, Lingjie Liu, Yuan Liu, Christian Theobalt, Taku Komura, and Wenping Wang. Neus: Learning neural implicit surfaces by volume rendering for multi-view reconstruction. In NeurIPS, 2021.
- [56] Ting Wu, Theodore S Rappaport, and Christopher M Collins. Safe for generations to come: Considerations of safety for millimeter waves in wireless communications. IEEE microwave magazine, 2015.
- [57] Muhammet Emin Yanik and Murat Torlak. Near-field 2-d sar imaging by millimeter-wave radar for concealed item detection. In 2019 IEEE radio and Wireless Symposium (RWS), 2019.
- [58] Yao Yao, Zixin Luo, Shiwei Li, Tian Fang, and Long Quan. Mvsnet: Depth inference for unstructured multi-view stereo. In ECCV, 2018.
- [59] Yao Yao, Jingyang Zhang, Jingbo Liu, Yihang Qu, Tian Fang, David McKinnon, Yanghai Tsin, and Long Quan. Neilf: Neural incident light field for physically-based material estimation. In ECCV, 2022.
- [60] Yuxuan Yao, Zixuan Zeng, Chun Gu, Xiatian Zhu, and Li Zhang. Reflective gaussian splatting. In ICLR, 2025.
- [61] Lior Yariv, Jiatao Gu, Yoni Kasten, and Yaron Lipman. Volume rendering of neural implicit surfaces. In NeurIPS, 2021.
- [62] Lior Yariv, Yoni Kasten, Dror Moran, Meirav Galun, Matan Atzmon, Basri Ronen, and Yaron Lipman. Multiview neural surface reconstruction by disentangling geometry and appearance. In NeurIPS, 2020.
- [63] Zehao Yu and Shenghua Gao. Fast-mvsnet: Sparse-to-dense multi-view stereo with learned propagation and gauss-newton refinement. In CVPR, 2020.
- [64] Kevin Zhang, Mohit Sharma, Jacky Liang, and Oliver Kroemer. A modular robotic arm control stack for research: Franka-interface and frankapy. arXiv preprint arXiv:2011.02398, 2020.
- [65] Mingmin Zhao, Tianhong Li, Mohammad Abu Alsheikh, Yonglong Tian, Hang Zhao, Antonio Torralba, and Dina Katabi. Through-wall human pose estimation using radio signals. In CVPR, 2018.
- [66] Mingmin Zhao, Yingcheng Liu, Aniruddh Raghu, Tianhong Li, Hang Zhao, Antonio Torralba, and Dina Katabi. Through-wall human mesh recovery using radio signals. In ICCV, 2019.
- [67] Mingmin Zhao, Yonglong Tian, Hang Zhao, Mohammad Abu Alsheikh, Tianhong Li, Rumen Hristov, Zachary Kabelac, Dina Katabi, and Antonio Torralba. Rf-based 3d skeletons. In Proceedings of the Conference of the ACM Special Interest Group on Data Communication, 2018.
- [68] Xiaopeng Zhao, Zhenlin An, Qingrui Pan, and Lei Yang. Nerf2: Neural radio-frequency radiance fields. In MobiCom, 2023.

## 附录

本附录组织如下：

- A 节提供更详尽的雷达背景知识。
- B 节给出无透镜 alpha 混合的证明。
- C 节详细描述采集数据的实验参数。
- D 节描述新视图合成实验的设置。
- E 节详细讨论局限、未来工作与社会影响。

### A. 雷达背景

#### A.1 雷达基础

毫米波雷达通过发射无线信号（chirp）并接收来自场景中各反射体的回波来工作。这里发射机与接收机同址，即并排放置。它工作在 77 GHz 毫米波频段，使用调频连续波（FMCW）与天线阵列帮助消除空间模糊。如图 2(a) 所示，发射的 FMCW 是频率随时间线性增加的函数。考虑单反射体与单天线，接收 chirp 只是发射 chirp 的时延版本，见图 2(b)。为消除距离模糊，把接收 chirp 与发射 chirp 的共轭相乘，可表示为复函数

$$
s(t)=A\cdot\mathrm{e}^{-\mathrm{j}2\pi(f+kt)d/c}=A\cdot\mathrm{e}^{-(\mathrm{j}2\pi k\tau)t}\cdot\mathrm{e}^{-\mathrm{j}2\pi f\tau}, \tag{9}
$$

其中 $A$ 是信号幅度，$d$ 是往返传播距离，$c$ 是光速，$\tau=d/c$ 是往返时延，$f$ 是起始频率，$k$ 是 chirp 斜率。对多个反射体，我们只需接收所有反射的线性组合。

#### A.2 自由空间功率衰减

在自由空间中，射频信号的功率因球面扩散而按传播距离的平方成比例衰减。考虑往返路径——信号从发射机传到空间中某点再反射回接收机——衰减更加显著。这称为**往返自由空间路径损耗**，从距离 $u$ 处反射的功率衰减因子为

$$
P_{\mathrm{rx}}\propto\frac{1}{(4\pi u)^4}P_{\mathrm{tx}}. \tag{10}
$$

该表达式计及两次平方反比扩散：一次是向该点发射，另一次是反射回接收机。因此接收功率按 $1/u^4$ 成比例下降。

#### A.3 雷达反射

在第 3 节基础上，我们主要期望镜面反射，尽管返回接收机的信号仍有一定灵活性。即使完美的镜面信号只有在反射面垂直于发射 chirp 时才会返回接收机，实际上存在一个余量：信号并非完美镜面，但仍有一部分返回。与常见的扩散反射建模方式类似，我们遵循平移朗伯模型 [44, 43]（有时也称为方向模型）。我们用单位向量 $\omega_i$ 表示入射方向，用 $\mathbf{n}$ 表示表面法线，理想镜面反射方向为

$$
\omega_o=\omega_i-2(\mathbf{n}\cdot\omega_i)\mathbf{n}. \tag{11}
$$

返回接收机天线的射线记为 $\omega_r$，通过取从表面点到接收机位置的单位向量计算。接收功率由方向缩放因子

$$
(\omega_o\cdot\omega_r) \tag{12}
$$

调制，遵循上述缩放朗伯模型。

#### A.4 近场与远场

无线成像系统依据传感器与目标之间的距离以不同方式工作，分别称为近场（或近距）与远场（或远距）成像。当物体与雷达之间的距离远大于波长与天线系统孔径时，物体处于远场，例如数十米外。此时入射波可**近似**为平面波 [44]，即所有入射信号彼此平行。这显著简化了图像重建：假设天线均匀间隔，(1) 相应滤波器权重可跨深度复用，(2) 权重均匀，允许我们使用**波束成形**与 Fourier 变换加速计算 [3]。然而在远场工作要以更低重建分辨率为代价，因为射频波传播越远越扩散。

另一方面，本文工作在近场。这意味着物体离天线孔径近得多，在我们情形中在一米以内。重要的是，这意味着从场景中物体反射的入射波不能再近似为平行。信号路径的差异如图 15 所示。此时必须考虑精确的信号传播路径，否则雷达图像会出现畸变 [57, 45]。为正确重建无畸变的雷达图像，**需要**使用匹配滤波器（见第 3 节），它带来较高的计算复杂度，但能获得更高分辨率图像。例如，图 16 展示了用波束成形与匹配滤波器处理同一扳手（wrench）数据时的热图差异。

> **图 15（原文 Fig. 15）：** 远场与近场射线的差异。左图表明入射射线可近似为近乎平行；右图中当物体靠近天线时，我们不再能做这一假设。

> **图 16（原文 Fig. 16）：** 用匹配滤波器与波束成形处理近场采集雷达数据的差异。

#### A.5 可微匹配滤波器与信号追踪

我们有式 3 给出的匹配滤波器前向路径：

$$
P(\mathbf{x}_j)=\left|\sum_{i=1}^{N_{\mathrm{ant}}}\sum_{t}s(i,t)\cdot\mathrm{e}^{\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{\mathrm{j}2\pi f\tau_i}\right|,\qquad \mathbf{x}_j\in\Omega_{\mathrm{pts}},
$$

反向传播到信号 $s(i,t)$ 的梯度为

$$
\frac{\partial L}{\partial s(i,t)}=\sum_{\mathbf{x}_j\in\Omega_{\mathrm{pts}}}\frac{1}{P(\mathbf{x})}\cdot\frac{\partial L}{\partial P(\mathbf{x})}\cdot\mathrm{e}^{-\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{-\mathrm{j}2\pi f\tau_i}. \tag{13}
$$

信号追踪由式 4 给出，

$$
s(i,t)=\sum_{\mathbf{x}_j\in\Omega_{\mathrm{pts}}}A_{\mathrm{rx}}(\mathbf{x}_j)\,\mathrm{e}^{-\mathrm{j}2\pi k\tau_j t}\,\mathrm{e}^{-\mathrm{j}2\pi f\tau_j},
$$

反向传播到幅度 $A_{\mathrm{rx}}(\mathbf{x}_j)$ 的梯度为

$$
\frac{\partial L}{\partial A_{\mathrm{rx}}(\mathbf{x}_j)}=\sum_{i=1}^{N_{\mathrm{ant}}}\sum_{t}\frac{\partial L}{\partial s(i,t)}\cdot\mathrm{e}^{\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{\mathrm{j}2\pi f\tau_i}. \tag{14}
$$

#### A.6 代码实现

**可微匹配滤波器。** 我们用 CUDA 并行实现匹配滤波器的前向与反向传播。对应伪代码见算法 1。

> **算法 1　可微匹配滤波器算法**
> **[1] 前向：** 输入信号 $s(i,t)$，其中 $i=0,\dots,N_{\mathrm{ant}}-1$，$t=0,\dots,N_t-1$；采样点 $\mathbf{x}_j$，其中 $j=0,\dots,N_{\mathrm{ray}}N_s-1$
> **for** 并行 $j=0,\dots,N_{\mathrm{ray}}N_s-1$ **do**
> 　$P(\mathbf{x}_j)\leftarrow0$
> 　**for** $i=0,\dots,N_{\mathrm{ant}}-1$ **do**
> 　　**for** $t=0,\dots,N_t-1$ **do**
> 　　　$P(\mathbf{x}_j)\leftarrow P(\mathbf{x}_j)+s(i,t)\cdot\mathrm{e}^{\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{\mathrm{j}2\pi f\tau_i}$
> 　$P(\mathbf{x}_j)\leftarrow\|P(\mathbf{x}_j)\|$
> **输出：** 所有 $j$ 的 $P(\mathbf{x}_j)$
> **[2] 反向：** 匹配滤波功率的梯度 $\frac{\partial L}{\partial P(\mathbf{x}_j)}$，其中 $j=0,\dots,N_{\mathrm{ray}}N_s-1$；输入信号 $s(i,t)$；采样点 $\mathbf{x}_j$
> **for** 并行 $i=0,\dots,N_{\mathrm{ant}}-1$ **do**
> 　**for** 并行 $t=0,\dots,N_t-1$ **do**
> 　　$\frac{\partial L}{\partial s(i,t)}\leftarrow0$
> 　　**for** $j=0,\dots,N_{\mathrm{ray}}N_s-1$ **do**
> 　　　$\frac{\partial L}{\partial s(i,t)}\leftarrow\frac{\partial L}{\partial s(i,t)}+\frac{1}{P(\mathbf{x}_j)}\cdot\frac{\partial L}{\partial P(\mathbf{x}_j)}\cdot\mathrm{e}^{-\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{-\mathrm{j}2\pi f\tau_i}$
> **输出：** 所有 $i,t$ 的 $\frac{\partial L}{\partial s(i,t)}$

**信号追踪。** 我们用 CUDA 并行实现信号追踪的前向与反向传播。对应伪代码见算法 2。

> **算法 2　信号追踪**
> **[1] 前向：** 采样点 $\mathbf{x}_j$，其中 $j=0,\dots,N_{\mathrm{ray}}N_s-1$；幅度 $A_{\mathrm{rx}}(\mathbf{x}_j)$，其中 $j=0,\dots,N_{\mathrm{ray}}N_s-1$
> **for** 并行 $i=0,\dots,N_{\mathrm{ant}}-1$ **do**
> 　**for** 并行 $t=0,\dots,N_t-1$ **do**
> 　　$s(i,t)\leftarrow0$
> 　　**for** $j=0,\dots,N_{\mathrm{ray}}N_s-1$ **do**
> 　　　$s(i,t)\leftarrow s(i,t)+A_{\mathrm{rx}}(\mathbf{x}_j)\cdot\mathrm{e}^{-\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{-\mathrm{j}2\pi f\tau_i}$
> **输出：** 所有 $i,t$ 的 $s(i,t)$
> **[2] 反向：** 信号的梯度 $\frac{\partial L}{\partial s(i,t)}$，其中 $i=0,\dots,N_{\mathrm{ant}}-1$，$t=0,\dots,N_t-1$；采样点 $\mathbf{x}_j$
> **for** 并行 $j=0,\dots,N_{\mathrm{ray}}N_s-1$ **do**
> 　$\frac{\partial L}{\partial A_{\mathrm{rx}}(\mathbf{x}_j)}\leftarrow0$
> 　**for** $i=0,\dots,N_{\mathrm{ant}}-1$ **do**
> 　　**for** $t=0,\dots,N_t-1$ **do**
> 　　　$\frac{\partial L}{\partial A_{\mathrm{rx}}(\mathbf{x}_j)}\leftarrow\frac{\partial L}{\partial A_{\mathrm{rx}}(\mathbf{x}_j)}+\frac{\partial L}{\partial s(i,t)}\cdot\mathrm{e}^{\mathrm{j}2\pi k\tau_i t}\cdot\mathrm{e}^{\mathrm{j}2\pi f\tau_i}$
> **输出：** 所有 $j$ 的 $\frac{\partial L}{\partial A_{\mathrm{rx}}(\mathbf{x}_j)}$

### B. 无透镜 alpha 混合

#### B.1 Alpha

沿用 [55]，沿主射线 $\mathbf{p}$ 计算的不透明度密度定义为

$$
\rho(u)=\max\left(\frac{-\frac{\mathrm{d}\Phi_s}{\mathrm{d}u}(f(\mathbf{x}(u)))}{\Phi_s(f(\mathbf{x}(u)))},0\right), \tag{15}
$$

其中 $\phi_s(x)$ 与 $\Phi_s(x)$ 分别表示 logistic 分布的概率密度函数（PDF）与累积分布函数（CDF）。

区间 $[u_i,u_{i+1}]$ 上的相应 alpha 值为

$$
\alpha_i=1-\exp\left(-\int_{u_i}^{u_{i+1}}\rho(u)\,\mathrm{d}u\right)=1-\exp\left(-\int_{u_i}^{u_{i+1}}\frac{-\frac{\mathrm{d}\Phi_s}{\mathrm{d}u}(f(\mathbf{x}(u)))}{\Phi_s(f(\mathbf{x}(u)))}\,\mathrm{d}u\right). \tag{16}
$$

从主射线 $\mathbf{p}$ 变换到真实射线 $\mathbf{r}$ 时，分子中的导数项变换为

$$
-\frac{\mathrm{d}\Phi_s}{\mathrm{d}u}(f(\mathbf{x}(u)))=-\frac{\mathrm{d}\Phi_s}{\mathrm{d}u'}(f(\mathbf{x}(u)))\cdot\left|\frac{\mathrm{d}u'}{\mathrm{d}u}\right|=\rho'(u')\cdot\left|\frac{\mathrm{d}u'}{\mathrm{d}u}\right|, \tag{17}
$$

其中 $u$ 与 $u'$ 分别是沿主射线与真实射线的采样参数，$\rho'(u')$ 表示沿真实射线计算的不透明度密度。

在积分中，有

$$
\alpha_i=1-\exp\left(-\int_{u_i}^{u_{i+1}}\rho(u)\,\mathrm{d}u\right)=1-\exp\left(-\int_{u_i}^{u_{i+1}}\rho(u)\,\mathrm{d}u'\cdot\left|\frac{\mathrm{d}u}{\mathrm{d}u'}\right|\right). \tag{18}
$$

把式 17 变换后的不透明度密度代入式 18，得到

$$
\alpha_i=1-\exp\left(-\int_{u_i'}^{u_{i+1}'}\rho'(u')\,\mathrm{d}u'\right)=\alpha_i', \tag{19}
$$

从而证明：从主射线过渡到真实射线时，计算得到的 $\alpha_i$ 保持不变。

#### B.2 透射率

沿用 [55]，在主射线方向 $\mathbf{p}$ 上，我们定义透射率为

$$
T(u)\rho(u)=\left|\nabla f(\mathbf{x}(u))\cdot\mathbf{p}\right|\phi_s(f(\mathbf{x}(u)))=-\frac{\mathrm{d}\Phi_s}{\mathrm{d}u}(f(\mathbf{x}(u))), \tag{20}
$$

其中 $\phi_s(\cdot)$ 与 $\Phi_s(\cdot)$ 分别是 logistic 分布的 PDF 与 CDF。

给定透射率定义为 $T(u)=\exp\left(-\int_0^u\rho(v)\,\mathrm{d}v\right)$，两边求导得

$$
\frac{\mathrm{d}T}{\mathrm{d}u}=\frac{\mathrm{d}}{\mathrm{d}u}\exp\left(-\int_0^u\rho(v)\,\mathrm{d}v\right)=-\rho(u)\exp\left(-\int_0^u\rho(v)\,\mathrm{d}v\right)=-\rho(u)T(u),
$$

这意味着

$$
T(u)\rho(u)=-\frac{\mathrm{d}T}{\mathrm{d}u}(u). \tag{21}
$$

结合式 20 与式 21，得到

$$
-\frac{\mathrm{d}\Phi_s}{\mathrm{d}u}(f(\mathbf{x}(u)))=-\frac{\mathrm{d}T}{\mathrm{d}u}(u). \tag{22}
$$

由于几何相关的符号距离函数（SDF）不随射线方向变化，我们假设边界条件：

$$
\Phi_s(f(\mathbf{x}(u)))=\Phi_s(f(\mathbf{x}(u'))).
$$

于是，给定主射线 $\mathbf{p}$ 上的起始 CDF 值 $\Phi_s(f(\mathbf{x}(u_s)))$ 与真实射线 $\mathbf{r}$ 上的 $\Phi_s(f(\mathbf{x}(u_s')))$，对式 22 积分得到

$$
T(u')-T(u)=\Phi_s(f(\mathbf{x}(u_s')))-\Phi_s(f(\mathbf{x}(u_s))), \tag{23}
$$

从而完成式 7 的证明。

### C. 实验细节

**数据采集设置。** 我们使用 TI 1843BOOST 毫米波雷达 [53] 配 DCA1000EVM 采集原始数据，雷达安装在通过 FrankaPy 库 [64] 控制的 Franka Research 3 机械臂上。我们通过机械臂移动雷达来模拟 2D 阵列，取 17–68 个不同阵列视角（复杂物体扫描更多），每个阵列尺寸为 0.14 m × 0.25 m，所有天线之间的天线间距约为 $(\lambda/4-\lambda/2)$。每个成像平面围绕物体位置中心做圆周（yaw）平移以测量不同视角。图 17 可视化了部分真值热图。虽然 GeRaF 使用的实际真值是 3D 热图，为便于可视化，我们分别沿 3 个维度（深度、方位、俯仰）对 3D 热图求和绘制。每一列展示来自不同扫描平面的雷达热图。

为采集 360° 扫描，我们使用旋转平台旋转放置在约 0.3–0.5 m 远处的物体。雷达参数设为起始频率 77 GHz、可用扫频带宽 3.59 GHz，给出 0.04 m 的距离分辨率。所用斜率为 70.15 (MHz/µs)，每个 chirp 以 1250 ksps 采样率采集 64 个 ADC 样本。

**训练设置。** 对 SDF 网络，我们使用 8 层、隐藏维数 256 的 MLP。我们采用 10 个频率级的正弦位置编码作为输入。反射率网络实现为 4 层、隐藏维数 256 的 MLP。信号功率预测实现为单个可训练参数。

我们在单块 NVIDIA H100 GPU 上训练模型 50,000 次迭代、耗时 32 小时，使用 mmDetection3D [10] 作为代码库。初始学习率为 $1\times10^{-3}$，但由于输入稀疏，SDF 网络的学习率降为 $1\times10^{-4}$。训练使用 AdamW 优化器与余弦退火学习率调度。

**指标计算。** 用于比较 GeRaF 与匹配滤波基线相对相机真值的指标是 F1-Score（以 $\tau=0.01$ 评估）与 Chamfer 距离。这两个指标评估两个 3D 点云之间的相似性。对网格到点云的转换，我们沿三个候选网格分别均匀采样 5000 个点。然后把匹配滤波点云对齐到相机基线，并把 GeRaF 的点云对齐到相机基线。

F1-Score 通过寻找相机点云中的最近点并在两个方向上计算距离得到。精确率与召回率计算为这些距离落在 $\tau$ 以下的比例，F1-Score 由下式导出：

$$
F1=\frac{2\cdot\mathrm{Precision}\cdot\mathrm{Recall}}{\mathrm{Precision}+\mathrm{Recall}}. \tag{24}
$$

Chamfer 距离通过在两片点云之间为每个点寻找最近邻并计算平方距离，返回平均距离，并在两个方向上计算。

### D. 新视图合成

我们还展示了 GeRaF 在新视图合成（NVS）[39] 方面的能力。为评估这一点，我们把可用视图划分为训练集与测试集。图 18 展示了详细的数据划分。结果见图 9。

> **图 18（原文 Fig. 18）：** 新视图合成设置。蓝色平面表示训练中未包含的新视图。

### E. 讨论

#### E.1 潜在社会影响

射频神经表示可能带来一些潜在负面影响。能够对遮挡物后方的物体进行 3D 重建，可能引发隐私担忧。此外，与许多其他基于学习的工作一样，巨大的算力消耗引发对环境可持续性的担忧。然而，这项工作也可能有助于可疑包裹检测等任务。

#### E.2 局限与未来工作

**雷达扫描。** 我们的方法目前受限于所采集的神经网络雷达热图真值的多样性。更具体地，若物体表面存在某点，在所采集的任何扫描中都不曾反射回雷达，则网络无法在该位置创建点，因为它从未接收到来自该位置的反射，使该点不可见。处理不可见表面与更全面的扫描方法需要未来工作。

**材料。** 我们目前用金属制成的物体测试系统，金属能产生更清晰的反射。另一方面，金属物体**非常**镜面化，意味着需要更多雷达扫描才能接收到物体所有部分的信号。处理其他材料或混合材料制成的物体留待未来工作，这需要显著调整雷达反射模型。

**厚遮挡。** 我们展示了一些遮挡（纸板、纸张）下的结果，但在更厚遮挡的情形下问题并不那么简单，因为这要求网络预测**两个或更多**表面，而不是忽略微弱的遮挡反射。需要未来工作把表面重建扩展到处理多层表面。

**更好的射频模型。** 如雷达物理一节所述，与视觉逆渲染常采用带 Fresnel 项、Schlick-GGX 几何函数与 Trowbridge-Reitz GGX 分布的 Cook–Torrance BRDF [11] 来建模衍射与金属反射不同，射频（RF）领域仍依赖简化的朗伯模型。该模型甚至不足以进行精确的前向渲染，导致显著的反射误差。因此，基于如此粗糙近似的逆渲染无法可靠重建精细几何，因为底层反射模型引入了大量误差。

**更低计算复杂度。** 即使引入了无透镜采样与 alpha 混合使实时可微渲染变得可行，计算代价相比基于视觉的渲染仍显著更高。在视觉领域，反射模型受益于 split-sum 近似 [41] 与球谐函数 [54] 等技术，它们通过在一维射线上高效运算避免昂贵的蒙特卡洛采样。

然而，直接把这些技术应用于雷达反射并不可行，因为传统 alpha 混合沿一维射线运作，而雷达渲染需要在 3D 空间采样。这一维度差异带来相当大的复杂度。因此，未来工作应探索如何以与一维射线采样相当的计算复杂度实现 3D 空间采样，以进一步提升基于射频的可微渲染效率。

**精确的多层表面表示。** 在基于视觉的几何重建中，多层表面通常不构成问题，因为被其他表面遮挡的表面在 RGB 图像中不可见，因而对重建没有贡献。但雷达感知并非如此：信号可以穿透并从多层几何反射，产生可观测的多层表面。因此，表示与重建这种多层结构成为基于射频的 3D 重建的关键挑战。开发有效的多层表面表示，对于充分发挥雷达的独特能力至关重要。

> **图 17（原文 Fig. 17）：** GeRaF 中用作真值的一部分匹配滤波图像。第一行是沿深度求和的雷达热图，给出相对 GeRaF 坐标系的物体正视图；第二行沿水平轴（方位）求和，给出侧视图；最后一行沿垂直轴（俯仰）求和，给出俯视或鸟瞰视图。

## 图注与表注索引

本页图 1–18 的中文图注与表 1 的表注均按原文出现位置内联在正文中（图 1–3 见第 1–3 节，图 4–9 见第 4–8 节，图 10–14 见第 9 节，图 15–18 见附录 A、D），此处不重复罗列。原文为 NeurIPS 双栏排版，部分图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2605.29097v2 全文（原文 24 页）的中文译稿：摘要、第 1–10 节正文与编号小节、图 1–18 的全部中文图注、表 1 的逐格转写、致谢、参考文献 68 条英文原条目（按原编号），以及附录 A–E（含算法 1–2 与式 (9)–(24)）。公式与表格已对照 PDF 渲染页核对：式 (1)–(24) 逐式核对（含式 (7)、(15)–(23) 的无透镜 alpha 混合推导），表 1 用 PDF 表格网格抽取后逐格转写。已加注一处元数据疑点（NeurIPS 2025 标注与 arXiv v2 日期 2026-08-04 的年份次序）；正文内容未发现明显笔误。本页不上传原文图片，图内标注、颜色映射与实验结果数值不作数字化估算（图 10–14 内的 F1/CD 数值仅在图注中按原图题说明引用，未逐点转录）。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
