---
layout: page
title: "无人机辅助三维 ISAC 的锚点部署优化与速率-CRLB 帕累托权衡｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-14930-pareto-optimal-rate-crlb-tradeoff-via-anchor-placement-optimization-fo/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/d5bac04a09255471/) · [原文 arXiv](https://arxiv.org/abs/2609.14930) · [全部目录](/papers/catalog/)

# 无人机辅助三维 ISAC 的锚点部署优化与速率-CRLB 帕累托权衡

**原题：** Pareto-Optimal Rate-CRLB Tradeoff via Anchor Placement Optimization for UAV-Assisted 3D ISAC  
**作者：** Haoyu Jiang（IEEE 学生会员）、Hengyou Kong、Xiaoli Xu（IEEE 会员）、Yong Zeng（IEEE 会士，通讯作者）  
**单位：** 均就职于东南大学移动通信国家重点实验室（南京 210096，中国）；Yong Zeng 同时任职于紫金山实验室（南京 211111，中国）。  
**版本：** arXiv:2609.14930v1（eess.SP），2026 年 9 月 14 日，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VI 节及全部小节、定理 1–2、命题 1–2、引理 1–2、式 (1)–(102)、算法 1、表 I、图 1–8 图注、附录 A–F（六个证明的完整推导）、参考文献 [1]–[30]（英文原条目）均按原文结构录入；原文无致谢段。逐句逐式终校未做。

## 摘要

本文研究一种无人机（unmanned aerial vehicle，UAV）辅助的三维（3D）通信感知一体化（integrated sensing and communication，ISAC）系统：无人机与基站（base station，BS）通信，同时监测某个感兴趣区域（volume of interest，VoI）。通过利用无人机锚点节点的灵活部署，我们旨在刻画通信速率与感知 Cramér–Rao 下界（CRLB）之间的帕累托最优权衡。对于单点 VoI 的特例，我们证明帕累托最优的无人机锚点部署集合恰为连接基站与感知目标的线段。对于径向截断球扇区 VoI，我们推导出使全部帕累托最优无人机位置都被限制在内径向边界内部轴向线段上的几何条件。对于一般 VoI，我们证明了区域最坏情况 CRLB 在内区域的凸性，推导出帕累托最优半径上界，并提出一种高效算法来寻找帕累托最优的无人机锚点部署。数值结果验证了解析得到的部署结构，并表明所提设计相比基准方案显著扩大了速率-CRLB 区域。

**关键词：** 三维 ISAC、无人机辅助 ISAC、速率-CRLB 权衡、帕累托最优、锚点部署。

## I. 引言

通信感知一体化（ISAC）力图利用共同的硬件、频谱与发射信号同时完成信息传输与环境感知 [1]–[3]。通过把通信基础设施转化为态势信息来源，ISAC 可支撑智能交通、工业自动化、环境监测与低空监视等应用 [4]–[7]。然而这两种功能通常会在发射功率、空间自由度、带宽等系统资源上相互竞争，因此必须联合而非孤立地考察二者的可达性能。这促使人们研究通信—感知权衡，包括基于可达速率、估计精度、检测性能与感知互信息的信息论刻画与设计 [8]–[12]。在这些指标中，当感知任务为目标定位时，Cramér–Rao 下界（CRLB）[13] 尤为合适，因为它量化的是用于估计目标参数的信息量，而不只是接收回波的强度。

大量 ISAC 研究通过信号域设计来刻画这种权衡 [9]–[11], [14]–[17]。例如，[9] 通过优化发射分布研究了矢量高斯信道下的速率-CRLB 区域；[10] 通过优化发射协方差得到了点目标与扩展目标下的 MIMO 速率-CRLB 边界；[11] 设计了联合雷达通信波束成形，在通信服务质量约束下最小化感知 CRLB。相关研究在不同感知准则下优化波形、波束成形、功率分配与时频资源。尽管这些表述揭示了共享无线电资源应如何划分或复用，但发射机、接收机与感知目标的位置通常是预先给定的。该假设对建立在固定基础设施上的地面系统而言很自然，但它把传播距离、视角与感知几何当作环境条件，而非设计变量。相反，新兴无线网络越来越多地涉及与网络连接的自主智能体，例如地面机器人与无人机，其物理位置可以被主动控制 [18]。它们的移动性引入了额外设计自由度，因为这些智能体的位置与编队直接决定通信与感知信道。因此，除了传统信号域资源分配，还可能通过**物理位置优化**重塑可达的通信—感知权衡 [19]。

无人机的可控移动性为 ISAC 系统引入了这种几何自由度 [20]–[23]。现有无人机辅助 ISAC 研究主要通过轨迹与机动优化来利用该移动性：在周期性感知与通信一体化中，无人机轨迹与用户关联、目标感知选择、发射波束成形联合设计，以在周期性感知需求下最大化系统吞吐量 [24]；可适配 ISAC 设计在任务区间内优化无人机轨迹与通信/感知波束成形，并允许按需执行感知 [17]；三维轨迹与资源分配也被用于以通信与雷达估计速率为指标的无人机辅助物联网系统 [25]。这些工作展示了无人机移动性的价值，但其主要关注通常是无人机的时间演化、累积通信性能、感知调度或飞行约束下的资源分配 [26]–[28]。它们并未直接回答一个更基本的问题：对作为双站 ISAC 系统中锚点节点的协作无人机而言，要实现监测感兴趣区域（VoI）的通信速率与定位精度之间的帕累托最优权衡，无人机锚点应部署在何处？

为回答上述基本问题，本文研究一种无人机辅助的双站 ISAC 系统：一台协作无人机向基站发射携带信息的 ISAC 波形，并协助基站监测一个三维 VoI。在目标被定位之前，其精确位置未知，仅假设 VoI 已知。因此无人机锚点节点必须在与基站通信的同时，为 VoI 内所有可能目标提供可靠定位。我们以可达速率衡量通信性能、以 VoI 上的最坏情况三维定位 CRLB 衡量感知性能，并通过无人机部署优化刻画二者的帕累托权衡。该问题与固定几何下的优化有本质不同：通信速率主要取决于基站—无人机距离，而 CRLB 还依赖无人机—目标距离、目标相对基站阵列的可见性，以及由基站—目标—无人机几何引入的时延—角度耦合。此外，取得区域最坏情况 CRLB 的目标可能随无人机位置变化，某些外侧区域部署还会因可能目标在几何上不可分辨而使 CRLB 无界。

本文主要贡献概括如下。

- 我们建立了刻画三维无人机辅助双站 ISAC 帕累托最优速率-CRLB 权衡的优化问题。可达通信速率取决于基站—无人机距离，而区域感知指标定义为 VoI 上的最坏情况 CRLB。我们对代表性 VoI 解析刻画了帕累托最优无人机部署结构：对单点 VoI，证明精确的帕累托最优部署集合是连接基站与目标的线段，并以闭式得到相应的速率-CRLB 帕累托边界；对径向截断球扇区 VoI，我们建立内区域凸性，并导出使每个帕累托最优部署都被限制在基站与 VoI 内径向边界之间轴向线段上的几何条件。
- 我们提出一种寻找帕累托最优无人机锚点部署的算法。我们证明：当无人机比所有可能目标都更接近基站时，区域最坏情况 CRLB 是凸的；并导出帕累托最优部署的半径上界。基于这些性质，提出两阶段流程：内区域采用凸的半径上限优化，外区域采用固定半径方向搜索。
- 数值结果验证了单点与径向截断球扇区两种部署结构，并揭示了一般离轴旋转椭球 VoI 下的行为。在所评估的帕累托速率区间内，基于 CRLB 的设计比基于感知 SNR 与基于 VoI 中心的设计取得更低的区域最坏情况 CRLB；这进一步说明接收回波强度或靠近 VoI 中心并不必然带来有利的区域定位几何，反而可能显著降低最坏情况定位性能。基于 CRLB 优化得到的位置构成一条弯曲的三维路径，表明最优方向可能随通信需求变化。进一步实验表明：一旦角度项与耦合项成为限制，提升波形均方根（RMS）带宽带来的定位收益会递减；而在天线总数固定时，改变 UPA 长宽比会同时改变帕累托边界与最优无人机方向。

本文其余部分安排如下：第 II 节给出三维无人机辅助双站 ISAC 模型，定义通信与区域定位指标，并表述速率-CRLB 帕累托问题；第 III 节分析单点与径向截断球扇区 VoI 的帕累托最优部署；第 IV 节给出一般 VoI 的结构性结果与两阶段计算流程；第 V 节给出数值结果；第 VI 节总结全文。

**符号说明：** 标量、向量与矩阵分别用斜体字母、粗体小写字母与粗体大写字母表示。\(\mathbb R^n\) 与 \(\mathbb C^n\) 分别表示 \(n\) 维实向量与复向量空间。对向量 \(\mathbf x\)，\(\|\mathbf x\|\) 为其欧氏范数；\((\cdot)^T\)、\((\cdot)^H\)、\((\cdot)^{-1}\) 与 \(\operatorname{Tr}(\cdot)\) 分别表示转置、共轭转置、求逆与迹。此外，\(\mathbf I_N\) 表示 \(N\) 维单位矩阵。

## II. 系统模型

如图 1 所示，我们考虑由基站、协作无人机与三维 VoI 组成的三维无人机辅助双站 ISAC 系统。协作无人机与基站通信，同时协助基站监测 VoI。具体而言，对任何进入 VoI、雷达截面积（radar cross section，RCS）不小于某阈值的威胁无人机之类的目标，系统应能估计其位置。我们考虑一个典型感知目标，其 RCS 记为 \(\kappa\)，在定位前未知但满足 \(\kappa\ge\kappa_L\)，其中 \(\kappa_L\) 为 RCS 阈值。协作无人机应部署在与基站通信的位置，同时保证对 VoI 内所有 RCS 不小于 \(\kappa_L\) 的可能目标位置都能可靠定位。

基站位于原点，配备部署在 \(yz\) 平面上的均匀平面阵列（uniform planar array，UPA）。UPA 沿 \(y\) 轴与 \(z\) 轴分别有 \(N_y\) 与 \(N_z\) 个天线阵元，总天线数 \(N_R=N_yN_z\)。阵元间距 \(d=\lambda/2\)，其中 \(\lambda=c/f_c\)，\(f_c\) 为载频，\(c\) 为光速。待监测 VoI 记为 \(\mathcal A\subset\mathbb R^3\)。令 \(\mathbf q_t=[x_t,y_t,z_t]^T\in\mathcal A\) 表示 VoI 内感知目标可能出现的位置，\(\mathbf q_u=[x_u,y_u,z_u]^T\) 表示待优化的协作无人机位置。对 \(i\in\{u,t\}\)，球坐标表示为

$$
\mathbf q_i=r_i\left[\cos\theta_i\cos\phi_i,\ \cos\theta_i\sin\phi_i,\ \sin\theta_i\right],\tag{1}
$$

其中 \(r_i=\|\mathbf q_i\|\)，\(\theta_i\) 为俯仰角，\(\phi_i\) 为方位角。无人机—目标距离为

$$
r_{ut}=\left(r_u^2+r_t^2-2r_ur_t\left[\sin\theta_u\sin\theta_t+\cos\theta_u\cos\theta_t\cos(\phi_u-\phi_t)\right]\right)^{1/2}.\tag{2}
$$

无人机—基站直达传播时延与双站感知时延分别为 \(\tau_u=r_u/c\) 与 \(\tau_t=(r_t+r_{ut})/c\)，其中 \(c\) 为光速。由于 UPA 部署在 \(yz\) 平面上，方向 \((\theta,\phi)\) 对应的导向矢量为

$$
\mathbf a(\theta,\phi)=\mathbf a_y(\theta,\phi)\otimes\mathbf a_z(\theta),\tag{3}
$$

其中

$$
\mathbf a_y(\theta,\phi)=\left[1,\ e^{-\mathrm{j}\pi\cos\theta\sin\phi},\ \ldots,\ e^{-\mathrm{j}\pi(N_y-1)\cos\theta\sin\phi}\right]^T,\tag{4}
$$

$$
\mathbf a_z(\theta)=\left[1,\ e^{-\mathrm{j}\pi\sin\theta},\ \ldots,\ e^{-\mathrm{j}\pi(N_z-1)\sin\theta}\right]^T.\tag{5}
$$

### A. 信号模型

无人机发射 OFDM 等 ISAC 信号，观测区间为 \(\mathcal T_{\rm obs}\triangleq[0,T_{\rm obs}]\)。令 \(s(t)\) 表示满足 \(\mathbb E[|s(t)|^2]=1\) 的归一化复基带波形。发射信号记为 \(x(t)=\sqrt{P_t}s(t)\)，其中 \(P_t\) 为无人机平均发射功率。基站处的接收信号为

$$
y(t)=\sqrt{P_t}\alpha_u\mathbf a(\theta_u,\phi_u)s(t-\tau_u)+\sqrt{P_t}\alpha_t\mathbf a(\theta_t,\phi_t)s(t-\tau_t)+n(t),\quad t\in\mathcal T_{\rm obs},\tag{6}
$$

其中 \(\alpha_u\) 与 \(\alpha_t\) 分别表示直达视距（line-of-sight，LoS）信道增益与目标反射信道增益，\(n(t)\) 为双边功率谱密度 \(N_0\) 的加性白高斯噪声。在 Friis 传播模型下，直达路径功率增益为

$$
|\alpha_u|^2=\zeta_0r_u^{-2},\tag{7}
$$

其中 \(\zeta_0\triangleq c^2/((4\pi)^2f_c^2)\) 表示参考距离 1 米处的信道功率增益。

对目标反射路径，双站雷达方程给出

$$
|\alpha_t|^2=\frac{c^2\kappa}{(4\pi)^3f_c^2}r_{ut}^{-2}r_t^{-2}\ge\xi_0r_{ut}^{-2}r_t^{-2},\tag{8}
$$

其中 \(\xi_0\triangleq c^2\kappa_L/((4\pi)^3f_c^2)\)。该下界在 \(\kappa=\kappa_L\) 时取等号；全文采用该下界来刻画最弱目标回波下的保证性能。

### B. 通信指标

对无人机上行通信，基站解码经无人机—基站视距链路传输的携带信息波形。由于直达 LoS 路径通常远强于目标反射路径，通信信道近似为

$$
\mathbf h_c=\alpha_u\mathbf a(\theta_u,\phi_u).\tag{9}
$$

在基站采用最大比合并时，通信 SNR 为

$$
\Upsilon_c(\mathbf q_u)=\frac{P_t\|\mathbf h_c\|^2}{N_0B}=\frac{P_tN_R\zeta_0}{N_0Br_u^2}=\zeta_1r_u^{-2},\tag{10}
$$

其中 \(B\) 为通信带宽，\(\zeta_1\triangleq P_tN_R\zeta_0/(N_0B)\)。可达通信谱效率为

$$
\mathcal R(\mathbf q_u)=\zeta_2\log_2\left(1+\zeta_1r_u^{-2}\right),\tag{11}
$$

其中 \(0<\zeta_2\le1\) 计入波形相关的可能开销。

### C. 感知指标

对感知而言，假设在目标参数估计前已用空间域或多普勒域滤波器 [29] 抑制无人机—基站直达分量。剩余的目标反射信号为

$$
y_s(t)=\sqrt{P_t}\alpha_t\mathbf a(\theta_t,\phi_t)s(t-\tau_t)+n(t),\quad t\in\mathcal T_{\rm obs}.\tag{12}
$$

假设目标状态在相干处理区间（coherent processing interval，CPI）\(T_{\rm obs}\) 内静止，则感知通过在 CPI 内对全部信息相干合并接收信号来完成。因此，累积 SNR 为

$$
\Upsilon_s(\mathbf q_t,\mathbf q_u)=\frac{|\alpha_t|^2P_tT_{\rm obs}\|\mathbf a(\theta_t,\phi_t)\|^2}{N_0}=\frac{P_tT_{\rm obs}N_R\xi_0}{N_0r_{ut}^2r_t^2}=\frac{\xi_1}{r_{ut}^2r_t^2},\tag{13}
$$

其中 \(\xi_1\triangleq P_tT_{\rm obs}N_R\xi_0/N_0\)。注意该 SNR 不仅与无人机部署 \(\mathbf q_u\) 有关，还与 VoI 内可能的目标位置 \(\mathbf q_t\) 有关。

对目标感知而言，潜在目标定位的一个重要指标是 CRLB。在我们此前的工作 [30] 中，我们推导出双站感知模式下 CRLB 的显式表达式，它是无人机位置 \(\mathbf q_u\) 与可能目标位置 \(\mathbf q_t\) 的函数：

$$
\mathcal C(\mathbf q_t,\mathbf q_u)=\underbrace{\frac{c^2r_{ut}^2r_t^2}{\xi_\tau h^2}}_{\mathcal C_\tau}+\underbrace{\frac{r_{ut}^2r_t^4}{\ell_x^2}\left(\frac{1-\ell_z^2}{\xi_y}+\frac{1-\ell_y^2}{\xi_z}\right)}_{\mathcal C_{\rm ang}}+\underbrace{\frac{4r_t^2}{h^2\ell_x^2}\left(\frac{S_{xy}^2}{\xi_y}+\frac{S_{xz}^2}{\xi_z}\right)}_{\mathcal C_{\rm cpl}},\tag{14}
$$

其中

$$
\xi_y\triangleq\frac{\pi^2(N_y^2-1)\xi_1}{6},\qquad \xi_z\triangleq\frac{\pi^2(N_z^2-1)\xi_1}{6},\tag{15}
$$

$$
\xi_\tau\triangleq8\pi^2\beta_{\rm rms}^2\xi_1,\qquad [\ell_x,\ell_y,\ell_z]^T\triangleq\frac{\mathbf q_t}{r_t},\tag{16}
$$

$$
\beta_{\rm rms}^2=\frac{\int(f-\bar f)^2|S(f)|^2{\rm d}f}{\int|S(f)|^2{\rm d}f},\qquad \bar f=\frac{\int f|S(f)|^2{\rm d}f}{\int|S(f)|^2{\rm d}f},\tag{17}
$$

$$
h\triangleq1+\frac{\mathbf q_t^T(\mathbf q_t-\mathbf q_u)}{r_tr_{ut}}=\frac{(r_t+r_{ut})^2-r_u^2}{2r_tr_{ut}},\tag{18}
$$

$$
S_{xy}\triangleq\frac12\left|\mathbf e_z^T(\mathbf q_t\times\mathbf q_u)\right|,\qquad S_{xz}\triangleq\frac12\left|\mathbf e_y^T(\mathbf q_t\times\mathbf q_u)\right|.\tag{19}
$$

这里 \(S(f)\) 为 \(s(t)\) 的傅里叶变换。式 (14) 中三项分别刻画时延、角度与"时延—角度"耦合对位置误差的贡献。时延项 \(\mathcal C_\tau\) 随 RMS 带宽减小，因为 \(\xi_\tau\propto\beta_{\rm rms}^2\)，而其几何敏感度由 \(h\) 决定。角度项 \(\mathcal C_{\rm ang}\) 由两个 UPA 孔径通过 \(\xi_y\) 与 \(\xi_z\) 决定，并在目标接近 UPA 端射平面时被 \(\ell_x^{-2}\) 放大。耦合项 \(\mathcal C_{\rm cpl}\) 来自时延信息与角度信息之间的非正交性，其中 \(S_{xy}\) 与 \(S_{xz}\) 分别是"基站—目标—无人机"三角形在 \(xy\) 平面与 \(xz\) 平面上的投影面积。参数 \(P_t\)、\(T_{\rm obs}\)、\(\kappa\) 与 \(N_0\) 通过 \(\xi_1\) 同比例缩放全部 CRLB 项，而 \(\beta_{\rm rms}\)、\(N_y\) 与 \(N_z\) 改变各项的相对权重，因而可能改变最优无人机部署。关于 CRLB 推导与含义的更多细节，感兴趣的读者可参阅 [30]。

对感知 VoI \(\mathcal A\)，最坏情况 CRLB 定义为

$$
\mathcal C_{\max}(\mathbf q_u)\triangleq\max_{\mathbf q_t\in\mathcal A}\ \mathcal C(\mathbf q_t,\mathbf q_u).\tag{20}
$$

由式 (11)、(14) 与 (20) 可见，谱效率意义下的通信性能与 CRLB 意义下的感知性能都依赖协作无人机的部署位置。通信速率只依赖基站—无人机距离 \(r_u\)，因此倾向于让无人机靠近基站；而 \(\mathcal C(\mathbf q_t,\mathbf q_u)\) 还取决于无人机—目标距离以及整个 VoI 上的双站定位几何。因此，通信有利的部署可能带来较差的定位精度，这促使我们通过无人机部署优化来权衡通信与感知性能。

### D. 速率-CRLB 帕累托边界表述

我们希望通过协作无人机部署同时改善通信速率与区域定位精度。可达速率-CRLB 区域定义为

$$
\Omega_{\mathcal C}\triangleq\bigcup_{\mathbf q_u\in\mathcal Q}\left\{(\widehat {\mathcal R},\widehat {\mathcal C})\mid \widehat {\mathcal R}=\mathcal R(\mathbf q_u),\ \widehat {\mathcal C}=\mathcal C_{\max}(\mathbf q_u)\right\},\tag{21}
$$

其中 \(\mathcal Q\) 表示可行的无人机部署集合。\(\Omega_{\mathcal C}\) 的帕累托边界由这样的工作点组成：在不恶化另一指标的前提下，既不能提高通信速率、也不能降低最坏情况 CRLB。相应的双目标优化问题表述为

$$
({\rm P\text{-}CRLB}):\quad \min_{\mathbf q_u\in\mathcal Q}\ \mathbf f(\mathbf q_u)\triangleq\begin{bmatrix}\mathcal C_{\max}(\mathbf q_u)\\-\mathcal R(\mathbf q_u)\end{bmatrix},\tag{22}
$$

其中向量极小化按帕累托意义理解：若不存在可行部署同时取得更小的 \(\mathcal C_{\max}\) 与 \(-\mathcal R\)，则 \(\mathbf q_u^\star\) 为帕累托最优。

由于 \(\mathcal R(\mathbf q_u)\) 关于 \(r_u=\|\mathbf q_u\|\) 严格递减，定义最小与最大可行基站—无人机距离为

$$
r_{\mathcal Q}^{\min}\triangleq\min_{\mathbf q_u\in\mathcal Q}\|\mathbf q_u\|,\qquad r_{\mathcal Q}^{\max}\triangleq\max_{\mathbf q_u\in\mathcal Q}\|\mathbf q_u\|.\tag{23}
$$

相应的最大与最小可行通信速率（分别记为 \(\overline R\) 与 \(\underline R\)）于是在 \(\mathbf q_u\) 取到 \(r_{\mathcal Q}^{\min}\) 与 \(r_{\mathcal Q}^{\max}\) 时达到。据此，可通过变化 \(\widetilde R\) 并求解如下优化问题来生成帕累托边界候选点：

$$
({\rm P\text{-}CRLB\text{-}}\widetilde R):\quad\min_{\mathbf q_u\in\mathcal Q}\ \mathcal C_{\max}(\mathbf q_u)\quad\text{s.t.}\ \ \mathcal R(\mathbf q_u)\ge\widetilde R,\tag{24}
$$

其中 \(\widetilde R\in[\underline R,\overline R]\)。

在求解问题 \(({\rm P\text{-}CRLB\text{-}}\widetilde R)\) 之前，先考虑可达速率-CRLB 区域的两个端点，即通信导向与定位导向的部署。通信最优部署从最接近基站的可行位置中选取：

$$
\mathbf q_u^{\rm com}=\arg\min_{\mathbf q_u\in\mathcal Q,\ \|\mathbf q_u\|=r_{\mathcal Q}^{\min}}\mathcal C_{\max}(\mathbf q_u).\tag{25}
$$

感知最优部署为

$$
\mathbf q_u^{\rm sen}=\arg\min_{\mathbf q_u\in\mathcal Q_{\mathcal C}^{\rm sen}}\|\mathbf q_u\|,\qquad\text{其中}\ \mathcal Q_{\mathcal C}^{\rm sen}\triangleq\arg\min_{\mathbf q_u\in\mathcal Q}\mathcal C_{\max}(\mathbf q_u),\tag{26}
$$

相应的帕累托边界端点记为

$$
(R^{\rm com},C^{\rm com})\triangleq\left(\mathcal R(\mathbf q_u^{\rm com}),\mathcal C_{\max}(\mathbf q_u^{\rm com})\right),\qquad (R^{\rm sen},C^{\rm sen})\triangleq\left(\mathcal R(\mathbf q_u^{\rm sen}),\mathcal C_{\max}(\mathbf q_u^{\rm sen})\right).\tag{27}
$$

## III. 典型 VoI 的帕累托最优速率-CRLB 分析

由于最坏情况感知性能取决于 VoI，求解问题 (22) 需要明确指定 VoI。本节考虑若干可得到速率-CRLB 帕累托边界闭式表达的特殊 VoI，一般 VoI 的求解留待第 IV 节。

### A. 单点 VoI

首先考虑 VoI 退化为一个给定目标位置的特例，即

$$
\mathcal A=\{\bar{\mathbf q}_t\},\qquad \bar{\mathbf q}_t=\bar r_t\bar{\mathbf e}_r,\qquad [\bar\ell_x,\bar\ell_y,\bar\ell_z]^T=\bar{\mathbf e}_r,\tag{28}
$$

其中 \(\bar r_t=\|\bar{\mathbf q}_t\|\)，\(\bar\ell_x\) 为目标沿基站 UPA 法线方向的方向余弦。此时区域最坏情况 CRLB 退化为 \(\mathcal C_{\max}(\mathbf q_u)=\mathcal C(\bar{\mathbf q}_t,\mathbf q_u)\)。由于 \(\mathcal R(\mathbf q_u)\) 关于 \(r_u\) 严格递减，问题 (22) 变为

$$
({\rm P\text{-}CRLB\text{-}S}):\quad\min_{\mathbf q_u\in\mathcal Q}\begin{bmatrix}\mathcal C_{\max}(\mathbf q_u)\\r_u\end{bmatrix}.\tag{29}
$$

定义基站—目标线段为

$$
\mathcal L_t\triangleq\left\{\epsilon\bar{\mathbf q}_t\mid 0\le\epsilon\le1\right\}.\tag{30}
$$

我们假设 \(\mathcal L_t\subseteq\mathcal Q\)，且目标方向避开 UPA 的角度奇异性，即 \(\bar\ell_x\ne0\)。此时帕累托最优部署集合可闭式刻画。

**定理 1：** 对单点 VoI \(\mathcal A=\{\bar{\mathbf q}_t\}\)，若 \(\mathcal L_t\subseteq\mathcal Q\) 且 \(\bar\ell_x\ne0\)，则问题 (29) 的帕累托最优无人机部署集合为

$$
\mathcal L_{\rm Pareto}^{\rm sing}=\left\{\mathbf q_u^\star=\epsilon\bar{\mathbf q}_t\mid 0\le\epsilon\le1\right\}.\tag{31}
$$

等价地，帕累托最优距离满足

$$
r_u^\star=\bar r_t-r_{ut}^\star,\qquad 0\le r_{ut}^\star\le\bar r_t.\tag{32}
$$

**证明：** 见附录 A。

定理 1 把原始三维部署问题化为沿基站—目标线段的一维权衡。在每个帕累托最优位置上，无人机位于基站与目标之间。把式 (32) 代入式 (14) 得

$$
\mathcal C^\star(r_{ut})=\Gamma_tr_{ut}^2,\qquad 0\le r_{ut}\le\bar r_t,\tag{33}
$$

其中

$$
\Gamma_t\triangleq\frac{c^2\bar r_t^2}{4\xi_\tau}+\frac{\bar r_t^4}{\bar\ell_x^2}\left(\frac{1-\bar\ell_z^2}{\xi_y}+\frac{1-\bar\ell_y^2}{\xi_z}\right)=\frac1{\xi_1}\left[\frac{\lambda^2\bar r_t^2}{32\pi^2\bar\beta^2}+\frac{6\bar r_t^4}{\pi^2\bar\ell_x^2}\left(\frac{1-\bar\ell_z^2}{N_y^2-1}+\frac{1-\bar\ell_y^2}{N_z^2-1}\right)\right],\tag{34}
$$

其中 \(\bar\beta=\beta_{\rm rms}/f_c\)。相应的通信速率为

$$
\mathcal R^\star(r_{ut})=\zeta_2\log_2\left(1+\frac{\zeta_1}{(\bar r_t-r_{ut})^2}\right).\tag{35}
$$

在式 (33) 与 (35) 之间消去 \(r_{ut}\)，得到闭式帕累托边界

$$
\mathcal R^\star(\mathcal C^\star)=\zeta_2\log_2\left(1+\frac{\zeta_1}{\left(\bar r_t-\sqrt{\mathcal C^\star/\Gamma_t}\right)^2}\right),\qquad 0\le\mathcal C^\star\le\Gamma_t\bar r_t^2.\tag{36}
$$

图 2 数值展示了定理 1 与式 (36) 的闭式边界。如图 2a 所示，所有数值识别出的帕累托最优无人机位置都位于基站—目标线段上。把无人机从基站一侧的通信最优端点向目标移动会减小 \(r_{ut}\)、从而降低 CRLB，但代价是 \(r_u\) 增大、通信速率下降。因此图 2b 中的数值帕累托点与闭式边界完全吻合；灰色叉号表示全部搜索候选点的速率-CRLB 配对。

搜索过程通过对 \(\mathcal Q\) 离散化实现，其中 \(\mathcal Q\) 受 \(d_{\min}\le r_u\le d_{\max}\) 限制，\(d_{\min}\) 与 \(d_{\max}\) 分别表示最小与最大基站—无人机距离。该边界关于 \(\mathcal C^\star\) 严格递增。在理想点目标模型下，感知最优端点在 \(\mathbf q_u\to\bar{\mathbf q}_t\) 的极限情形达到，给出

$$
(R^{\rm sen},C^{\rm sen})=\left(\zeta_2\log_2\left(1+\frac{\zeta_1}{\bar r_t^2}\right),0\right).\tag{37}
$$

在另一端，若存在实际的最小基站—无人机距离 \(d_{\min}>0\)，则通信最优端点为

$$
(R^{\rm com},C^{\rm com})=\left(\zeta_2\log_2\left(1+\frac{\zeta_1}{d_{\min}^2}\right),\ \Gamma_t(\bar r_t-d_{\min})^2\right).\tag{38}
$$

式 (31) 中的参数 \(\epsilon\) 是沿帕累托线段的归一化基站—无人机距离，满足 \(\epsilon=r_u^\star/\bar r_t=1-r_{ut}^\star/\bar r_t\)，可解释为几何权衡变量。增大 \(\epsilon\) 使无人机从基站移向目标，从而降低定位 CRLB、同时降低通信速率。具体地，

$$
\mathcal C^\star=\Gamma_tr_{ut}^2=\Gamma_t\bar r_t^2(1-\epsilon)^2,\qquad \mathcal R^\star=\zeta_2\log_2\left(1+\frac{\zeta_1}{\epsilon^2\bar r_t^2}\right).\tag{39}
$$

系数 \(\Gamma_t\) 表示单位"无人机—目标间距平方"的定位代价。波形与阵列参数并不改变单点帕累托部署集合的几何形式——它始终位于基站—目标线段上；它们只决定为达到给定 CRLB，无人机需沿该线段移动多远。更小的归一化带宽 \(\bar\beta\)、由 \(N_y\) 与 \(N_z\) 刻画的小阵列孔径、或由 \(\bar\ell_x\) 刻画的较差目标可见性都会增大 \(\Gamma_t\)，迫使无人机更靠近目标，并在相同定位需求下造成更大的通信速率损失。因此不利的感知条件使速率-CRLB 权衡更显著，而增大 \(\bar\beta\)、\(N_y\) 或 \(N_z\) 则允许无人机更靠近基站。通信参数 \(\zeta_1\) 与 \(\zeta_2\) 同样不改变部署支撑集，只改变每个帕累托最优位置对应的速率。

实践中，若要求最小基站—无人机间距 \(d_{\min}>0\)，则可行帕累托线段被截断为

$$
d_{\min}/\bar r_t\le\epsilon\le1.\tag{40}
$$

### B. 径向截断球扇区 VoI

如图 3 所示，接下来考虑一个特定 VoI \(\mathcal A\)：它由圆锥与半径 \(r_{\min}\)、\(r_{\max}\) 界定的球壳相交而成，称为径向截断球扇区。圆锥以正 \(x\) 轴为中心、半孔径角为 \(\vartheta_{\max}\)；协作无人机被限制在前半空间 \(x>0\)。为获得旋转对称的 CRLB 性质，我们把基站阵列取为方形 UPA，即

$$
N_y=N_z,\qquad \xi_y=\xi_z.\tag{41}
$$

对任意点 \(\mathbf q_i\)，\(i\in\{u,t\}\)，定义其相对正 \(x\) 轴的离轴角为

$$
\vartheta_i\triangleq\arccos\left(\frac{\mathbf e_x^T\mathbf q_i}{r_i}\right),\qquad \mathbf e_x\triangleq[1,0,0]^T.\tag{42}
$$

目标 VoI 由如下约束刻画：

$$
{\rm C1}:\ r_{\min}\le r_t\le r_{\max},\tag{43}
$$

$$
{\rm C2}:\ 0\le\vartheta_t\le\vartheta_{\max},\tag{44}
$$

其中 \(r_{\min}\) 与 \(r_{\max}\) 给出 VoI 的径向范围，\(\vartheta_{\max}\) 表示圆锥半孔径角。假设 \(0\le\vartheta_{\max}<\pi/2\)。据此，径向截断球扇区 VoI 定义为

$$
\mathcal A=\{\mathbf q_t\mid{\rm C1},{\rm C2}\}.\tag{45}
$$

在式 (41) 的方形 UPA 条件下有 \(\xi_y=\xi_z\)。此外，由于 \(\ell_x^2+\ell_y^2+\ell_z^2=1\) 且 \(\ell_x=\cos\vartheta_t\)，式 (14) 中的几何 CRLB 简化为

$$
\mathcal C(\mathbf q_t,\mathbf q_u)=\frac{c^2r_{ut}^2r_t^2}{\xi_\tau h^2}+\frac{r_{ut}^2r_t^4\left(1+\ell_x^2\right)}{\xi_y\ell_x^2}+\frac{4r_t^2\left(S_{xy}^2+S_{xz}^2\right)}{\xi_yh^2\ell_x^2}.\tag{46}
$$

式 (46) 中的 CRLB 对目标与无人机位置绕 \(x\) 轴的旋转不变。具体地，对任意绕 \(x\) 轴的旋转矩阵 \(\mathbf R_x(\omega)\)，有

$$
\mathcal C\left(\mathbf R_x(\omega)\mathbf q_t,\mathbf R_x(\omega)\mathbf q_u\right)=\mathcal C(\mathbf q_t,\mathbf q_u).\tag{47}
$$

由于 \(\mathcal A\) 在此类旋转下也不变，区域最坏情况 CRLB 只依赖无人机距离 \(r_u\) 与其离轴角 \(\vartheta_u\)。因此不失最优性，可把候选无人机位置表示在 \(xz\) 平面上为

$$
\mathbf q_u=r_u\left[\cos\vartheta_u,0,\sin\vartheta_u\right],\qquad r_u\ge0,\ 0\le\vartheta_u\le\frac\pi2.\tag{48}
$$

相应地，简化的无人机候选域为

$$
\mathcal Q\triangleq\left\{\mathbf q_u\mid r_u\ge0,\ 0\le\vartheta_u\le\frac\pi2\right\}=\mathcal Q_1\cup\mathcal Q_2,\tag{49}
$$

其中

$$
\mathcal Q_1\triangleq\left\{\mathbf q_u\mid 0\le r_u<r_{\min},\ 0\le\vartheta_u\le\frac\pi2\right\},\tag{50}
$$

$$
\mathcal Q_2\triangleq\left\{\mathbf q_u\mid r_u\ge r_{\min},\ 0\le\vartheta_u\le\frac\pi2\right\}.\tag{51}
$$

这里 \(\mathcal Q_1\) 包含比一切可能目标点都更接近基站的无人机位置，而 \(\mathcal Q_2\) 包含 \(\mathcal Q_1\) 之外的无人机位置。

**命题 1（内区域凸性）：** 对任意固定目标 \(\mathbf q_t\in\mathcal A\)，\(\mathcal C(\mathbf q_t,\mathbf q_u)\) 在 \(\|\mathbf q_u\|<\|\mathbf q_t\|\) 上关于 \(\mathbf q_u\) 为凸；因此 \(\mathcal C_{\max}(\mathbf q_u)\) 在 \(\mathcal Q_1\) 上为凸。

**证明：** 见附录 B。

**引理 1：** 对式 (45) 的径向截断球扇区 VoI，假设基站配备任意矩形 UPA。若无人机候选域限制在 \(\mathcal Q_1\)，则每个帕累托最优无人机位置都位于扇区轴线上，即 \(\mathbf q_u^\star=r_u^\star\mathbf e_x\)，其中 \(0\le r_u^\star<r_{\min}\)。

**证明：** 见附录 C。

**引理 2：** 对式 (45) 的径向截断球扇区 VoI 与式 (41) 的方形 UPA 条件，若

$$
\frac{r_{\min}}{r_{\max}}\ge\cos\left(2\vartheta_{\max}\right),\tag{52}
$$

则 \(\mathcal Q_2\) 中每个无人机位置都被 \(\mathcal Q_1\) 中某个无人机位置支配。

**证明：** 见附录 D。

**定理 2：** 对式 (45) 的径向截断球扇区 VoI 与可行无人机部署域 \(\mathcal Q\)，假设基站配备满足式 (41) 的方形 UPA。若

$$
\frac{r_{\min}}{r_{\max}}\ge\cos\left(2\vartheta_{\max}\right),\tag{53}
$$

则每个帕累托最优无人机位置都满足

$$
\mathbf q_u^\star=r_u^\star\mathbf e_x,\qquad 0\le r_u^\star<r_{\min},\tag{54}
$$

且帕累托最优无人机位置可刻画为

$$
\mathcal L_{\rm Pareto}^{\rm RTSS}\subseteq\{r_u\mathbf e_x:0\le r_u<r_{\min}\}.\tag{55}
$$

**证明：** 见附录 E。

图 4 数值展示了定理 2 刻画的部署结构。如图 4a 所示，全部非支配无人机位置都位于扇区轴线上且满足 \(0\le r_u^\star<r_{\min}\)，而该轴向线段中只有一部分是帕累托最优的。图 4b 给出相应的速率-CRLB 边界，其中灰色叉号表示穷举搜索点，两个端点分别对应通信导向与感知导向部署。与单点情形相比，在所考虑设置下径向截断球扇区帕累托边界的感知性能变化明显更小：区域最坏情况运行限制了可获得的定位增益，并产生更平坦的速率-CRLB 边界。

定理 2 刻画了帕累托最优部署的支撑集，但并不保证式 (54) 中每个半径都帕累托最优。实际帕累托子集可通过在 \(0\le r_u<r_{\min}\) 上评估 \(\mathcal C_{\max}(r_u\mathbf e_x)\) 并剔除被支配点得到。然而超出定理条件时，轴向结构不再有保证。这与单点情形有本质不同——单点时帕累托最优集合仅由目标参数决定。例如，若 \(N_y\ne N_z\)，CRLB 失去旋转对称性，于是阵列维度 \(N_y\) 与 \(N_z\) 连同 \(\bar\beta\) 都可能改变最优无人机方向。这些情形由第 IV 节发展的通用半径逐点计算处理。

## IV. 一般 VoI 的帕累托最优无人机部署

前几节已对代表性 VoI 导出闭式帕累托部署结构。对一般 VoI，此类结构通常不可得，因为最坏情况目标可能随无人机位置变化。尽管如此，区域 CRLB 具有内区域凸性，这使两阶段计算流程成为可能：内区域采用凸的半径上限优化，外区域采用固定半径搜索。

### A. 一般 CRLB 结构

如图 5 所示，对 VoI \(\mathcal A\)，定义其最小与最大基站—目标距离为

$$
r_{\mathcal A}^{\min}\triangleq\min_{\mathbf q_t\in\mathcal A}\|\mathbf q_t\|,\qquad r_{\mathcal A}^{\max}\triangleq\max_{\mathbf q_t\in\mathcal A}\|\mathbf q_t\|.\tag{56}
$$

内区域定义为

$$
\mathcal Q_{\rm in}=\left\{\mathbf q_u\in\mathcal Q\mid\|\mathbf q_u\|\le r_{\mathcal A}^{\min}\right\}.\tag{57}
$$

假设 \(r_{\mathcal A}^{\min}>0\)，且所有目标方向都避开 UPA 的角度奇异性，即对全部 \(\mathbf q_t\in\mathcal A\) 有 \(\ell_x\ne0\)。命题 1 的结果对任意 VoI 与任意矩形 UPA 都成立。因此若 \(\mathcal Q\) 为凸，则在半径上限 \(r<r_{\mathcal A}^{\min}\) 下最小化采样区域 CRLB 是一个凸问题。下面找出使最坏情况 CRLB 无界的无人机位置：

$$
\mathcal Q_\infty\triangleq\left\{\mathbf q_u\in\mathcal Q\mid\exists\mathbf q_t\in\mathcal A,\ \mathbf q_u=\alpha\mathbf q_t,\ \alpha>1\right\}.\tag{58}
$$

集合 \(\mathcal Q_\infty\) 与式 (57) 的内区域不相交，而其排除通常会使外区域可行集非凸。此外，帕累托搜索还服从以下一般半径界。

**命题 2（帕累托最优无人机半径界）：** 考虑有限 CRLB 的无人机位置 \(\mathbf q_u=R\mathbf e\in\mathcal Q\)，其中 \(\|\mathbf e\|=1\) 且 \(R>r_{\mathcal A}^{\max}\)。若存在 \(\tilde r\in[r_{\mathcal A}^{\max},R)\) 使 \(\tilde r\mathbf e\in\mathcal Q\) 且 \(\mathcal C_{\max}(\tilde r\mathbf e)<\infty\)，则 \(\mathbf q_u=R\mathbf e\) 不可能是速率-CRLB 帕累托最优的。

**证明：** 见附录 F。

在命题 2 的径向可行性条件下，帕累托搜索可限制在

$$
0\le r_u\le r_{\mathcal A}^{\max}.\tag{59}
$$

### B. 两阶段计算流程

为数值评估，把 VoI 离散化为 \(\{\mathbf q_{t,n}\}_{n=1}^{N}\)，并定义

$$
\mathcal C_{\max}^{(N)}(\mathbf q_u)\triangleq\max_{n=1,\ldots,N}\mathcal C(\mathbf q_{t,n},\mathbf q_u).\tag{60}
$$

由于 \(\mathcal R(\mathbf q_u)\) 只依赖 \(r_u\) 且随其单调递减，帕累托最优计算可在 \(r_{\mathcal A}^{\min}\) 处划分。定义半径上限候选集与固定半径候选集为

$$
\mathcal Q_{\le}(r)\triangleq\left\{\mathbf q_u\in\mathcal Q\mid\|\mathbf q_u\|\le r\right\},\qquad \mathcal Q(r)\triangleq\left\{\mathbf q_u\in\mathcal Q\mid\|\mathbf q_u\|=r\right\}.\tag{61}
$$

完整帕累托集通过合并以下两阶段的候选、并剔除重复与被支配元素得到。

- 对 \(0\le r<r_{\mathcal A}^{\min}\)，半径上限下的感知最优部署由下式给出：

$$
\mathbf q_u^{\rm in}(r)\in\arg\min_{\mathbf q_u\in\mathcal Q_{\le}(r)}\mathcal C_{\max}^{(N)}(\mathbf q_u).\tag{62}
$$

若 \(\mathcal Q_{\le}(r)\) 为凸，则 (62) 是凸优化问题。

- 对 \(r_{\mathcal A}^{\min}\le r\le r_{\mathcal A}^{\max}\)，凸性不再有保证，因此在每个固定半径上搜索：

$$
\mathbf q_u^{\rm out}(r)\in\arg\min_{\mathbf q_u\in\mathcal Q(r)\setminus\mathcal Q_\infty}\mathcal C_{\max}^{(N)}(\mathbf q_u).\tag{63}
$$

整个流程汇总于算法 1。由此可得出结论：无人机部署优化把可避免的几何低效与固有的速率—定位权衡分离开来。在给定基站—无人机距离 \(r_u\) 下，所有无人机方向取得相同通信速率；因此方向优化可在不损失速率的情况下降低区域 CRLB，甚至可能通过把无人机移出 CRLB 无界区域来恢复有限 CRLB。这类几何奇异性无法仅靠增大发射功率 \(P_t\) 或观测时长 \(T_{\rm obs}\) 消除。在每个半径上选定 CRLB 最优方向后，变化 \(r_u\) 便揭示出通信邻近性与定位精度之间不可避免的权衡。

**算法 1：一般 VoI 的帕累托最优无人机部署**

1. 输入：\(\mathcal A\)、\(\mathcal Q\) 与目标采样 \(\{\mathbf q_{t,n}\}_{n=1}^{N}\)。
2. 输出：帕累托最优无人机部署集合 \(\mathcal P_{\mathcal C}\)。
3. \(\mathcal P_{\mathcal C}\leftarrow\varnothing\)。
4. 对每个采样 \(r\in[0,r_{\mathcal A}^{\min})\) 执行
5. \(\widehat{\mathcal Q}_{\rm in}(r)\leftarrow\mathcal Q_{\le}(r)\)。
6. 若 \(\widehat{\mathcal Q}_{\rm in}(r)\ne\varnothing\) 则
7. \(\mathbf q_u^{\rm in}(r)\in\arg\min_{\mathbf q_u\in\widehat{\mathcal Q}_{\rm in}(r)}\mathcal C_{\max}^{(N)}(\mathbf q_u)\)。
8. 把 \(\left(\mathbf q_u^{\rm in}(r),\mathcal R(\mathbf q_u^{\rm in}(r)),\mathcal C_{\max}^{(N)}(\mathbf q_u^{\rm in}(r))\right)\) 加入 \(\mathcal P_{\mathcal C}\)。
9. 结束条件判断
10. 结束循环
11. 对每个采样 \(r\in[r_{\mathcal A}^{\min},r_{\mathcal A}^{\max}]\) 执行
12. \(\widehat{\mathcal Q}_{\rm out}(r)\leftarrow\mathcal Q(r)\setminus\mathcal Q_\infty\)。
13. 若 \(\widehat{\mathcal Q}_{\rm out}(r)\ne\varnothing\) 则
14. \(\mathbf q_u^{\rm out}(r)\in\arg\min_{\mathbf q_u\in\widehat{\mathcal Q}_{\rm out}(r)}\mathcal C_{\max}^{(N)}(\mathbf q_u)\)。
15. 把 \(\left(\mathbf q_u^{\rm out}(r),\mathcal R(\mathbf q_u^{\rm out}(r)),\mathcal C_{\max}^{(N)}(\mathbf q_u^{\rm out}(r))\right)\) 加入 \(\mathcal P_{\mathcal C}\)。
16. 结束条件判断
17. 结束循环
18. 从 \(\mathcal P_{\mathcal C}\) 中剔除重复与被支配元素。
19. 返回 \(\mathcal P_{\mathcal C}\)。

## V. 仿真结果

本节通过数值仿真在代表性 VoI 与一般 VoI 下评估速率-CRLB 权衡。除特别说明外，基站位于原点并配备部署在 \(yz\) 平面上的 \(8\times8\) UPA，天线间距为半波长。常用仿真参数汇总于表 I。对每个区域感知场景，所有比较的部署方案都使用相同目标样本评估，其帕累托部署均采用第 IV 节所述搜索方法获得。

**表 I（原文 Table I）：常用仿真参数**

| 参数 | 符号 | 取值 |
|---|---|---|
| 载频 | \(f_c\) | 24 GHz |
| 波长 | \(\lambda\) | 12.5 mm |
| 发射功率 | \(P_t\) | 0.5 W |
| 观测时长 | \(T_{\rm obs}\) | 1 ms |
| 噪声功率谱密度 | \(N_0\) | −170 dBm/Hz |
| 通信带宽 | \(B\) | 100 MHz |
| RCS 系数 | \(\kappa\) | 0.1 m² |
| UPA 配置 | \(N_y\times N_z\) | \(8\times8\) |
| 天线间距 | \(d\) | \(\lambda/2=6.25\) mm |
| RMS 带宽 | \(\beta_{\rm rms}\) | 20 MHz |
| 归一化 RMS 带宽 | \(\bar\beta\) | \(8.33\times10^{-4}\) |
| 速率前因子 | \(\zeta_2\) | 1 |
| 最小基站—无人机距离 | \(d_{\min}\) | 10 m |

### A. 一般 VoI 与基准比较

我们考虑一个建模为旋转椭球的一般离轴 VoI，并把所提基于 CRLB 的部署与两种基准方案比较。对基于 SNR 的方案，在每个固定基站—无人机距离上按最大化区域最坏情况感知 SNR 选取无人机方向，而所得部署再用区域最坏情况 CRLB 评估。对基于中心的方案，无人机被约束在从基站指向椭球中心的射线上。它们都在由 CRLB 准则生成的帕累托最优速率区间上评估。

图 6a 表明，所提基于 CRLB 的部署在整个速率区间都取得最好的 CRLB，其曲线呈现预期的单调权衡。相反，基于 SNR 的曲线非单调且包含一段被支配的低速率分支，其最小 CRLB 出现在中等速率处；因此仅增大基站—无人机距离并不必然有利于定位。该结果还表明：区域最坏情况感知 SNR 并非定位精度的可靠代理——尽管基于 SNR 的方案在每个半径上优化了接收感知功率，它并不必然提供足够的位置估计时延—角度信息。基于中心的方案把无人机约束在从基站指向椭球中心的射线上，在大部分速率区间内其有限 CRLB 性能优于基于 SNR 的方案，其感知最优点同样出现在中等半径处。当无人机沿中心方向射线继续远离并进入 VoI 内部的定位奇异区域时（如图 6a 顶部叉号所示），相应的区域最坏情况 CRLB 变为无界。

图 6b 的空间部署进一步揭示了不同的设计机理。基于中心的部署始终位于连接基站与椭球中心的固定射线上；基于 SNR 的部署也沿近乎直线轨迹，只有有限的方向调整。相比之下，基于 CRLB 的部署构成一条明显弯曲的三维路径，明显偏离两种基准方向：它们选择更高、更侧向偏移的位置，以在整个 VoI 上平衡双站定位几何，而不是简单靠近其中心或最大化接收回波强度。

这一区别在图 6c 中更清晰。由于中心方向与基站—无人机距离无关，其所有角度部署都重合于同一点，两个端点标记重叠。基于 SNR 的方向保持在很窄的邻域内，表明其速率变化主要通过径向运动实现。相反，基于 CRLB 的方向跨越范围宽得多；这条弯曲且局部非单调的角度轨迹表明，定位最优方向随通信需求变化——很可能是因为活跃的最坏情况几何以及时延、角度与耦合信息的相对贡献发生变化。

### B. RMS 带宽的影响

接下来考察波形 RMS 带宽 \(\beta_{\rm rms}\) 对速率-CRLB 边界及相应最优无人机部署的影响。采用与前一实验相同的旋转椭球 VoI 与系统配置，把 \(\beta_{\rm rms}\) 分别设为 1、2 与 20 MHz。

如图 7a 所示，增大 \(\beta_{\rm rms}\) 会在整条帕累托边界上改善区域定位性能，同时不改变最大可达通信速率。这是因为通信速率与感知波形带宽无关，而时延信息系数满足 \(\xi_\tau\propto\beta_{\rm rms}^2\)，故时延相关 CRLB 项近似按 \(\beta_{\rm rms}^{-2}\) 减小。该改善在边界靠近感知导向的一端尤为显著。然而增益呈现明显的边际递减：\(\beta_{\rm rms}=2\) MHz 与 20 MHz 的边界在大部分速率区间几乎无法区分，而 \(\beta_{\rm rms}=1\) MHz 的边界仍明显更高。一旦时延贡献被充分压低，区域 CRLB 主要受角度信息与"时延—角度"耦合信息限制，而这些无法仅靠增大波形带宽进一步改善。

图 7c 的角度部署进一步表明，带宽不仅影响 CRLB 数值，还影响最优无人机方向。在感知最优端点处，增大 \(\beta_{\rm rms}\) 使俯仰角从 1 MHz 时约 \(68^\circ\) 移至 2 MHz 时约 \(75^\circ\)、20 MHz 时约 \(78^\circ\)，而相应方位角保持在约 \(30^\circ\)–\(32^\circ\) 的较窄范围内。随着通信速率提高，三条角度轨迹逐渐相互靠近，并最终收敛到几乎相同的通信最优方向。在该高速率区间，最小允许基站—无人机距离与相关通信需求在很大程度上决定了部署，留给方向调整的自由度较小。相比之下，在感知导向端点附近，无人机具有更大空间自由度，改变时延信息的相对权重会导致明显不同的最优方向。

### C. UPA 配置的影响

最后考察 UPA 配置如何影响速率-CRLB 权衡与相应的最优无人机部署。我们考虑三种阵列配置：\(8\times8\)、\(4\times16\) 与 \(16\times4\)。所有配置总天线数相同，即 \(N_R=64\)，并采用相同的半波长阵元间距。

图 8a 表明，方形 \(8\times8\) UPA 在所考虑速率区间内取得最小的区域最坏情况 CRLB；通信最优端点处的差距比感知最优端点处更明显。尽管每种矩形 UPA 在一个轴向上提供更大孔径，它同时减少了正交轴向上的阵元数与角度信息。均衡的 \(8\times8\) 配置在两个阵列维度上提供更均匀的角度分辨率，因此取得显著更低的最坏情况 CRLB。两种矩形配置尽管总天线数相同、维度互换，性能也彼此不同：其中 \(16\times4\) UPA 始终优于 \(4\times16\) UPA。该结果表明，对所考虑的离轴旋转 VoI，两个阵列轴不可互换——目标区域朝向及相应双站几何对 \(y\) 轴孔径所提供信息的要求更高。这一顺序依赖几何，当 VoI 朝向或形状改变时可能变化。

图 8c 进一步表明，UPA 配置不仅改变可达 CRLB，还改变最优无人机部署。在低速率与中速率区间，三条角度轨迹差异明显：\(8\times8\) 与 \(4\times16\) 阵列选择相对紧凑的方向路径，而 \(16\times4\) 阵列在 \(\phi_u\) 上呈现更大变化。这些变化表明，改变相对角度信息权重会改变活跃的最坏情况目标几何，并在基站—无人机距离变化时使最优无人机方向在不同方向分支之间切换。然而在通信最优端点附近，三条轨迹收敛到几乎相同的方向；因此在严格的高速率需求下，所考虑场景中的部署方向对阵列长宽比相对不敏感。尽管如此，相应的 CRLB 数值仍明显不同。

## VI. 结论

本文通过协作无人机在 VoI 上的三维部署定位，刻画了双站 ISAC 的帕累托最优速率-CRLB 权衡。对单点 VoI，证明了完整帕累托集为基站—目标线段，并以闭式导出相应边界。对径向截断球扇区 VoI，在给定条件下证明帕累托集被限制在扇区轴线与内径向区域内。对一般 VoI，内区域凸性与帕累托半径界导出了两阶段计算流程。数值结果表明，基于感知 SNR 与基于 VoI 中心的部署可能被支配，或产生无界的最坏情况 CRLB；结果还表明，RMS 带宽与 UPA 配置可以改变最优无人机方向，而不仅仅是缩放定位误差。

## 附录 A：定理 1 的证明

对单点 VoI \(\mathcal A=\{\bar{\mathbf q}_t\}\)，目标相关量 \(\bar r_t\)、\(\bar\ell_x\)、\(\bar\ell_y\) 与 \(\bar\ell_z\) 均固定。定义

$$
\Gamma_t\triangleq\frac{c^2\bar r_t^2}{4\xi_\tau}+\frac{\bar r_t^4}{\bar\ell_x^2}\left(\frac{1-\bar\ell_z^2}{\xi_y}+\frac{1-\bar\ell_y^2}{\xi_z}\right)>0.\tag{64}
$$

对任意非奇异无人机位置 \(\mathbf q_u\)，式 (14) 中的双站因子满足 \(0<h\le2\)。由于式 (14) 中的耦合项非负，可得

$$
\mathcal C(\bar{\mathbf q}_t,\mathbf q_u)\ge\frac{c^2r_{ut}^2\bar r_t^2}{4\xi_\tau}+\frac{r_{ut}^2\bar r_t^4}{\bar\ell_x^2}\left(\frac{1-\bar\ell_z^2}{\xi_y}+\frac{1-\bar\ell_y^2}{\xi_z}\right)=\Gamma_tr_{ut}^2.\tag{65}
$$

式 (65) 在无人机位于基站—目标线段上时取等号，因为此时 \(h=2\) 且 \(S_{xy}=S_{xz}=0\)。

我们首先证明线段 \(\mathcal L_t\) 之外的任何无人机位置都被 \(\mathcal L_t\) 上的某个位置支配。对任意 \(\mathbf q_u\in\mathcal Q\)，定义

$$
d\triangleq\min\{r_{ut},\bar r_t\},\qquad \widetilde{\mathbf q}_u\triangleq\left(1-\frac d{\bar r_t}\right)\bar{\mathbf q}_t.\tag{66}
$$

由 \(\mathcal L_t\subseteq\mathcal Q\)，位置 \(\widetilde{\mathbf q}_u\) 可行。此外，

$$
\widetilde r_{ut}=d,\qquad \widetilde r_u=\bar r_t-d,\qquad \mathcal C(\bar{\mathbf q}_t,\widetilde{\mathbf q}_u)=\Gamma_td^2.\tag{67}
$$

若 \(r_{ut}<\bar r_t\)，由反向三角不等式得 \(r_u\ge\bar r_t-r_{ut}=\widetilde r_u\)。若 \(r_{ut}\ge\bar r_t\)，则 \(\widetilde r_u=0\le r_u\)。因此两种情形下都有 \(\widetilde r_u\le r_u\)。进一步，由于 \(d\le r_{ut}\)，由 (65) 得

$$
\mathcal C(\bar{\mathbf q}_t,\widetilde{\mathbf q}_u)=\Gamma_td^2\le\Gamma_tr_{ut}^2\le\mathcal C(\bar{\mathbf q}_t,\mathbf q_u).\tag{68}
$$

对任意 \(\mathbf q_u\notin\mathcal L_t\)，\(\widetilde r_u\le r_u\) 与 (68) 中至少有一个是严格不等号。因此 \(\mathcal L_t\) 之外的每个无人机位置都被 \(\mathcal L_t\) 上的某个可行位置支配。

余下需证 \(\mathcal L_t\) 上不存在被支配的位置。用无人机—目标距离 \(d\) 参数化该线段上的位置，即

$$
\mathbf q_u(d)=\left(1-\frac d{\bar r_t}\right)\bar{\mathbf q}_t,\qquad 0\le d\le\bar r_t.\tag{69}
$$

其感知与通信目标满足

$$
\mathcal C(\bar{\mathbf q}_t,\mathbf q_u(d))=\Gamma_td^2,\qquad r_u(d)=\bar r_t-d.\tag{70}
$$

因此增大 \(d\) 严格增大 CRLB，但严格减小基站—无人机距离。故 \(\mathcal L_t\) 上任意两个不同点互不支配。于是帕累托最优无人机部署集合为

$$
\mathcal L_{\rm Pareto}^{\rm sing}=\left\{\mathbf q_u^\star=\alpha\bar{\mathbf q}_t\mid 0\le\alpha\le1\right\},\tag{71}
$$

其中端点 \(\alpha=1\) 在理想点目标传播模型下按极限意义理解。等价地，

$$
r_u^\star=\bar r_t-r_{ut}^\star,\qquad 0\le r_{ut}^\star\le\bar r_t.\tag{72}
$$

证毕。

## 附录 B：命题 1 的证明

对固定目标，定义 \(\mathbf e_t\triangleq\mathbf q_t/r_t\)、\(\mathbf p\triangleq\mathbf q_t-\mathbf q_u\)、\(d\triangleq\|\mathbf p\|\) 与 \(u\triangleq\mathbf e_t^T\mathbf p\)。若 \(\|\mathbf q_u\|<r_t\)，则

$$
u=r_t-\mathbf e_t^T\mathbf q_u\ge r_t-\|\mathbf q_u\|>0,\qquad h=\frac{d+u}{d}.\tag{73}
$$

定义单位向量

$$
\mathbf m_y\triangleq\frac{\mathbf e_z\times\mathbf e_t}{\sqrt{1-\ell_z^2}},\qquad \mathbf m_z\triangleq\frac{\mathbf e_y\times\mathbf e_t}{\sqrt{1-\ell_y^2}},\tag{74}
$$

当某系数为零时相应项省略。由于 \(\mathbf q_t\times\mathbf q_u=-r_t\mathbf e_t\times\mathbf p\)，投影面积满足

$$
4S_{xy}^2=r_t^2\left(1-\ell_z^2\right)\left(\mathbf m_y^T\mathbf p\right)^2,\qquad 4S_{xz}^2=r_t^2\left(1-\ell_y^2\right)\left(\mathbf m_z^T\mathbf p\right)^2.\tag{75}
$$

把 (73) 与 (75) 代入 (14) 得

$$
\mathcal C(\mathbf q_t,\mathbf q_u)=a_\tau\phi_\tau(\mathbf p)+a_y\phi_{\mathbf m_y}(\mathbf p)+a_z\phi_{\mathbf m_z}(\mathbf p),\tag{76}
$$

其中

$$
\phi_\tau(\mathbf p)\triangleq\frac{d^4}{(d+u)^2},\qquad \phi_{\mathbf m}(\mathbf p)\triangleq d^2+\frac{\left(\mathbf m^T\mathbf p\right)^2d^2}{(d+u)^2},
$$
$$
a_\tau\triangleq\frac{c^2r_t^2}{\xi_\tau},\qquad a_y\triangleq\frac{r_t^4\left(1-\ell_z^2\right)}{\ell_x^2\xi_y},\qquad a_z\triangleq\frac{r_t^4\left(1-\ell_y^2\right)}{\ell_x^2\xi_z}.\tag{77}
$$

余下需建立 \(\phi_\tau\) 与 \(\phi_{\mathbf m}\) 的凸性。定义 \(\eta\triangleq u/d\in(0,1]\)。对 \(\phi_\tau\)，选取单位向量 \(\mathbf b\) 使 \(\mathbf e_t=\eta\mathbf p/d+\sqrt{1-\eta^2}\mathbf b\)，并把任意方向分解为 \(\mathbf v=a\mathbf p/d+b\mathbf b+\mathbf v_\perp\)，其中 \(\mathbf v_\perp\) 同时与 \(\mathbf p\) 和 \(\mathbf b\) 正交。直接求导得

$$
\mathbf v^T\nabla_{\mathbf p}^2\phi_\tau(\mathbf p)\mathbf v=\frac{2}{(1+\eta)^4}\left[\begin{bmatrix}a&b\end{bmatrix}\mathbf M_\tau(\eta)\begin{bmatrix}a\\b\end{bmatrix}+(1+\eta)(2\eta+1)\|\mathbf v_\perp\|^2\right],\tag{78}
$$

其中

$$
\mathbf M_\tau(\eta)\triangleq\begin{bmatrix}(1+\eta)^2&-(1+\eta)\sqrt{1-\eta^2}\\-(1+\eta)\sqrt{1-\eta^2}&(1+\eta)(4-\eta)\end{bmatrix}.\tag{79}
$$

由于 \(\mathbf M_\tau(\eta)\) 的对角元为正且 \(\det\mathbf M_\tau(\eta)=3(1+\eta)^3>0\)，有 \(\mathbf M_\tau(\eta)\succ0\)，从而 \(\mathbf v^T\nabla_{\mathbf p}^2\phi_\tau(\mathbf p)\mathbf v\ge0\)。对 \(\phi_{\mathbf m}\)，把 \(\{\mathbf e_t,\mathbf m\}\) 扩充为正交基 \(\{\mathbf e_t,\mathbf m,\mathbf n\}\)，并写

$$
\mathbf p/d=\eta\mathbf e_t+\nu\mathbf m+\omega\mathbf n,\qquad \eta^2+\nu^2+\omega^2=1.\tag{80}
$$

由于 \(\phi_{\mathbf m}\) 为二次齐次函数，其 Hessian 只依赖 \(\eta\)、\(\nu\) 与 \(\omega\)。在上述基下，其顺序主子式为

$$
\Delta_1=\frac{2\left[(1+\eta)^2+3(1-\eta)\nu^2\right]}{(1+\eta)^2},\qquad \Delta_2=\frac{4Q(\eta,s)}{(1+\eta)^6},\qquad \Delta_3=\frac{8P(\eta,\nu^2)}{(1+\eta)^7},\tag{81}
$$

其中 \(s\triangleq\nu^2/(1-\eta^2)\in[0,1]\)（\(\eta<1\)；\(\eta=1\) 情形由连续性得到），且

$$
Q(\eta,s)=B_0(1-s)^3+3B_1s(1-s)^2+3B_2s^2(1-s)+B_3s^3,
$$
$$
B_0=(1+\eta)^4(\eta^2+2\eta+2),
$$
$$
B_1=\frac{(1+\eta)^3}{3}\left(3\eta^4+2\eta^3-6\eta^2+23\eta+8\right),
$$
$$
B_2=\frac{(1+\eta)^3}{3}\left(9\eta^3-15\eta^2+22\eta+14\right),
$$
$$
B_3=(1+\eta)^3(3\eta+7),\tag{82}
$$

以及

$$
P(\eta,z)=\eta^7+7\eta^6+22\eta^5+40\eta^4+45\eta^3+31\eta^2+12\eta+2+z\left(3\eta^5+15\eta^4+32\eta^3+33\eta^2+15\eta+2\right)+z^2\left(3\eta^3+9\eta^2+10\eta+2\right)+z^3(1+\eta).\tag{83}
$$

对 \(0<\eta\le1\)，所有 \(B_i\) 为正且 \(P(\eta,z)>0\)（\(z\ge0\)）。因此 \(\Delta_1\)、\(\Delta_2\)、\(\Delta_3\) 均为正，由 Sylvester 判据得 \(\nabla_{\mathbf p}^2\phi_{\mathbf m}(\mathbf p)\succ0\)。因此 \(\phi_\tau\) 与 \(\phi_{\mathbf m}\) 在 \(u>0\) 上均为凸。由于 \(a_\tau\)、\(a_y\)、\(a_z\) 非负，(76) 关于 \(\mathbf p\) 为凸；又因 \(\mathbf p=\mathbf q_t-\mathbf q_u\) 为仿射，(76) 关于 \(\mathbf q_u\) 也为凸。最后，凸函数的逐点最大值仍为凸，故 \(\mathcal C_{\max}(\mathbf q_u)\) 在 \(\mathcal Q_1\) 上为凸。

## 附录 C：引理 1 的证明

考虑任意 \(\mathbf q_u=[x_u,y_u,z_u]^T\in\mathcal Q_1\)。VoI 关于 \(xy\) 平面与 \(xz\) 平面的反射不变；此外，当目标与无人机位置同时关于任一平面反射时 CRLB 不变，即使 \(N_y\ne N_z\) 也成立。因此四个无人机位置 \(\mathbf q_u^{(i)}=[x_u,\pm y_u,\pm z_u]^T\) 具有相同的区域最坏情况 CRLB，其平均为 \(x_u\mathbf e_x\)。由命题 1，

$$
\mathcal C_{\max}(x_u\mathbf e_x)\le\frac14\sum_{i=1}^{4}\mathcal C_{\max}\left(\mathbf q_u^{(i)}\right)=\mathcal C_{\max}(\mathbf q_u).\tag{84}
$$

若 \((y_u,z_u)\ne(0,0)\)，则 \(\|x_u\mathbf e_x\|<\|\mathbf q_u\|\)，故 \(x_u\mathbf e_x\) 还取得严格更高的通信速率。因此 \(\mathcal Q_1\) 中每个离轴位置都被支配，\(\mathcal Q_1\) 中任何帕累托最优位置必位于 \(x\) 轴上。

## 附录 D：引理 2 的证明

考虑任意无人机位置 \(\mathbf q_u^{(2)}\in\mathcal Q_2\)，记其距离与离轴角为 \(r_u^{(2)}\) 与 \(\vartheta_u^{(2)}\)。若 \(\vartheta_u^{(2)}\le\vartheta_{\max}\)，则 \(\mathcal C_{\max}(\mathbf q_u)\) 变为无界，显然被 \(\mathcal Q_1\) 中某位置支配。下面考虑 \(\vartheta_u^{(2)}>\vartheta_{\max}\) 的情形。由径向截断球扇区 VoI 与方形 UPA CRLB 的旋转对称性，不失一般性可把 \(\mathbf q_u^{(2)}\) 表示在任意轴向平面内。

首先构造 \(\mathcal Q_1\) 中一个可行的轴上无人机位置。由 \(\vartheta_u^{(2)}>\vartheta_{\max}\) 与 (52) 得

$$
r_{\max}\cos\left(\vartheta_u^{(2)}+\vartheta_{\max}\right)<r_{\max}\cos\left(2\vartheta_{\max}\right)\le r_{\min}.\tag{85}
$$

因此存在 \(r_0\) 满足

$$
\max\left\{0,\ r_{\max}\cos\left(\vartheta_u^{(2)}+\vartheta_{\max}\right)\right\}<r_0<r_{\min}.\tag{86}
$$

定义轴上无人机位置为 \(\mathbf q_u^{(0)}\triangleq r_0\mathbf e_x\)。显然 \(\mathbf q_u^{(0)}\in\mathcal Q_1\) 且 \(r_0<r_{\min}\le r_u^{(2)}\)。由于通信速率随基站—无人机距离递减，有

$$
\mathcal R\left(\mathbf q_u^{(0)}\right)>\mathcal R\left(\mathbf q_u^{(2)}\right).\tag{87}
$$

余下比较二者的区域最坏情况 CRLB。先说明对轴上位置 \(\mathbf q_u^{(0)}\)，最坏情况目标可取在锥的边界上。考虑距离为 \(r_t\)、离轴角为 \(\vartheta_t\) 的目标。由于 \(\mathbf q_u^{(0)}\) 的轴对称性，其 CRLB 与目标的周向角无关。令 \(\delta=\vartheta_t\) 表示基站—无人机方向与基站—目标方向之间的角间隔，并定义

$$
d\triangleq\left(r_0^2+r_t^2-2r_0r_t\cos\delta\right)^{1/2},\qquad h\triangleq1+\frac{r_t-r_0\cos\delta}{d}.\tag{88}
$$

由于 \(r_0<r_{\min}\le r_t\)，式 (46) 中的 CRLB 可写为

$$
\mathcal C_\delta=\frac{c^2r_t^2}{\xi_\tau}\left(\frac d h\right)^2+\frac{r_t^4}{\xi_y}d^2+\frac{2r_t^4}{\xi_y}\cos^2\delta\,\frac{d^2}{h},\tag{89}
$$

其中已使用恒等式 \(\frac{r_0^2\sin^2\delta}{h^2}=d^2\left(\frac2h-1\right)\)。进一步，

$$
\frac{\partial d}{\partial\delta}=\frac{r_0r_t\sin\delta}{d}>0,\tag{90}
$$

以及

$$
\frac{\partial}{\partial\delta}\left(\frac d h\right)=\frac{r_0\sin\delta\left[r_t(d+r_t)-r_0^2\right]}{\left(d+r_t-r_0\cos\delta\right)^2}>0,\tag{91}
$$

对 \(0<\delta<\pi\) 成立，其正性来自 \(r_0<r_t\)。因此 (89) 中每一项都关于 \(\delta=\vartheta_t\) 递增。于是 \(\mathbf q_u^{(0)}\) 的最坏情况目标可取为

$$
\vartheta_t^\star=\vartheta_{\max}.\tag{92}
$$

令 \(r_t^\star\in[r_{\min},r_{\max}]\) 表示对应的一个最坏情况径向坐标。由于 \(\mathbf q_u^{(0)}\) 位于锥轴上，该最坏情况目标的周向方向可任意选取。我们把它取在与 \(\mathbf q_u^{(2)}\) 相反的轴向平面上，并记所得目标位置为 \(\mathbf q_t^-\)。则

$$
\mathcal C_{\max}\left(\mathbf q_u^{(0)}\right)=\mathcal C\left(\mathbf q_t^-,\mathbf q_u^{(0)}\right).\tag{93}
$$

对所选目标 \(\mathbf q_t^-\)，对应于 \(\mathbf q_u^{(0)}\) 与 \(\mathbf q_u^{(2)}\) 的角间隔分别为

$$
\delta_0=\vartheta_{\max},\qquad \delta_2=\vartheta_u^{(2)}+\vartheta_{\max}>\delta_0.\tag{94}
$$

先考虑一个与 \(\mathbf q_u^{(2)}\) 同方向、距离为 \(r_0\) 的虚拟无人机位置。对固定 \(r_0\)、\(r_t^\star\) 与 \(\vartheta_{\max}\)，与 (91) 相同的单调性论证表明 CRLB 随间隔角 \(\delta\) 严格递增。因此

$$
\mathcal C\left(\mathbf q_t^-,r_0\mathbf e_u^{(2)}\right)>\mathcal C\left(\mathbf q_t^-,\mathbf q_u^{(0)}\right),\tag{95}
$$

其中 \(\mathbf e_u^{(2)}=\mathbf q_u^{(2)}/r_u^{(2)}\)。

接着沿方向 \(\mathbf e_u^{(2)}\) 把无人机距离从 \(r_0\) 增大到 \(r_u^{(2)}\)。对固定目标 \(\mathbf q_t^-\)，令 \(s\) 表示该射线上的无人机距离，并令 \(\delta=\delta_2\)。相应的无人机—目标距离与双站因子为

$$
d(s)=\left(s^2+(r_t^\star)^2-2sr_t^\star\cos\delta_2\right)^{1/2},\qquad h(s)=1+\frac{r_t^\star-s\cos\delta_2}{d(s)}.\tag{96}
$$

由 (86) 与 \(r_t^\star\le r_{\max}\) 得 \(s\ge r_0>r_t^\star\cos\delta_2\)。因此

$$
\frac{{\rm d}d(s)}{{\rm d}s}=\frac{s-r_t^\star\cos\delta_2}{d(s)}>0,\qquad \frac{{\rm d}h(s)}{{\rm d}s}=-\frac{sr_t^\star\sin^2\delta_2}{d^3(s)}<0.\tag{97}
$$

对固定 \(\mathbf q_t^-\) 与固定无人机方向，式 (46) 中各项分别与 \(\frac{d^2(s)}{h^2(s)}\)、\(d^2(s)\)、\(\frac{s^2}{h^2(s)}\) 成正比，系数为正。由 (97) 可知 CRLB 在 \([r_0,r_u^{(2)}]\) 上随 \(s\) 严格递增。因此

$$
\mathcal C\left(\mathbf q_t^-,\mathbf q_u^{(2)}\right)>\mathcal C\left(\mathbf q_t^-,r_0\mathbf e_u^{(2)}\right).\tag{98}
$$

结合 (93)、(95) 与 (98) 得

$$
\mathcal C_{\max}\left(\mathbf q_u^{(2)}\right)\ge\mathcal C\left(\mathbf q_t^-,\mathbf q_u^{(2)}\right)>\mathcal C\left(\mathbf q_t^-,\mathbf q_u^{(0)}\right)=\mathcal C_{\max}\left(\mathbf q_u^{(0)}\right).\tag{99}
$$

结合 (87) 可知 \(\mathbf q_u^{(0)}\in\mathcal Q_1\) 严格支配 \(\mathbf q_u^{(2)}\in\mathcal Q_2\)。由于 \(\mathbf q_u^{(2)}\) 任意选取，\(\mathcal Q_2\) 中每个位置都被 \(\mathcal Q_1\) 中某位置支配。证毕。

## 附录 E：定理 2 的证明

在条件 (53) 下，引理 2 表明 \(\mathcal Q_2\) 中每个无人机位置都被 \(\mathcal Q_1\) 中某个可行轴上位置支配；此外引理 1 表明 \(\mathcal Q_1\) 中每个离轴位置都被 \(\mathcal Q_1\) 中某个可行轴上位置支配。因此任何帕累托最优无人机位置都不可能属于 \(\mathcal Q_2\) 或 \(\mathcal Q_1\) 的离轴部分，每个帕累托最优无人机位置都必须满足 (54)。证毕。

## 附录 F：命题 2 的证明

令 \(\mathbf q_u=R\mathbf e\)、\(\widetilde{\mathbf q}_u=\tilde r\mathbf e\)，其中 \(r_{\mathcal A}^{\max}\le\tilde r<R\)。对任意目标 \(\mathbf q_t=r_t\mathbf e_t\in\mathcal A\)，定义 \(\cos\gamma=\mathbf e_t^T\mathbf e\) 以及

$$
d(s)\triangleq\left(s^2+r_t^2-2sr_t\cos\gamma\right)^{1/2},\qquad h(s)\triangleq1+\frac{r_t-s\cos\gamma}{d(s)}.\tag{100}
$$

由于 \(s\ge\tilde r\ge r_{\mathcal A}^{\max}\ge r_t\)，

$$
\frac{{\rm d}d(s)}{{\rm d}s}=\frac{s-r_t\cos\gamma}{d(s)}\ge0,\qquad \frac{{\rm d}h(s)}{{\rm d}s}=-\frac{sr_t\sin^2\gamma}{d^3(s)}\le0.\tag{101}
$$

此外 \(S_{xy}(s)\) 与 \(S_{xz}(s)\) 与 \(s\) 成正比。因此把无人机距离从 \(R\) 减至 \(\tilde r\) 不会增大 \(r_{ut}\) 或投影面积项，也不会减小 \(h\)。由于其余目标相关量固定，(14) 中每一项都非增，从而

$$
\mathcal C(\mathbf q_t,\tilde r\mathbf e)\le\mathcal C(\mathbf q_t,R\mathbf e),\qquad\forall\mathbf q_t\in\mathcal A.\tag{102}
$$

对 \(\mathcal A\) 取最大值得 \(\mathcal C_{\max}(\tilde r\mathbf e)\le\mathcal C_{\max}(R\mathbf e)\)。由于 \(\tilde r<R\)，位置 \(\tilde r\mathbf e\) 还取得严格更高的通信速率，因而支配 \(R\mathbf e\)。证毕。

## 参考文献（英文原书目）

[1] Q. Dai, Y. Zeng, H. Wang et al., “A tutorial on MIMO-OFDM ISAC: From far-field to near-field,” IEEE Commun. Surveys Tuts., vol. 28, pp. 4319–4358, Jan. 2026.

[2] F. Liu, Y. Cui, C. Masouros et al., “Integrated sensing and communications: Toward dual-functional wireless networks for 6G and beyond,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, 2022.

[3] J. A. Zhang, F. Liu, C. Masouros et al., “An overview of signal processing techniques for joint communication and radar sensing,” IEEE J. Sel. Topics Signal Process., vol. 15, no. 6, pp. 1295–1315, 2021.

[4] Y. Cui, F. Liu, X. Jing et al., “Integrating sensing and communications for ubiquitous IoT: Applications, trends, and challenges,” IEEE Netw., vol. 35, no. 5, pp. 158–167, 2021.

[5] J. A. Zhang, M. L. Rahman, K. Wu et al., “Enabling joint communication and radar sensing in mobile networks—a survey,” IEEE Commun. Surveys Tuts., vol. 24, no. 1, pp. 306–345, 2022.

[6] Z. Wei, H. Qu, Y. Wang et al., “Integrated sensing and communication signals toward 5G-A and 6G: A survey,” IEEE Internet Things J., vol. 10, no. 13, pp. 11 068–11 092, 2023.

[7] S. Lu, F. Liu, Y. Li et al., “Integrated sensing and communications: Recent advances and ten open challenges,” IEEE Internet Things J., vol. 11, no. 11, pp. 19 094–19 120, 2024.

[8] X. Xu and Y. Zeng, “Hybrid mono- and bi-static OFDM-ISAC via BS-UE cooperation: Closed-form CRLB and coverage analysis,” 2026. [Online]. Available: https://arxiv.org/abs/2601.09057

[9] Y. Xiong, F. Liu, Y. Cui et al., “On the fundamental tradeoff of integrated sensing and communications under Gaussian channels,” IEEE Trans. Inf. Theory, vol. 69, no. 9, pp. 5723–5751, 2023.

[10] H. Hua, T. X. Han, and J. Xu, “MIMO integrated sensing and communication: CRB-rate tradeoff,” IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 2839–2854, 2024.

[11] F. Liu, Y.-F. Liu, A. Li et al., “Cramér-Rao bound optimization for joint radar-communication beamforming,” IEEE Trans. Signal Process., vol. 70, pp. 240–253, 2022.

[12] Z. Ren, Y. Peng, X. Song et al., “Fundamental CRB-rate tradeoff in multi-antenna ISAC systems with information multicasting and multi-target sensing,” IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 3870–3885, 2024.

[13] H. Wang, Z. Xiao, and Y. Zeng, “Cramér-Rao bounds for near-field sensing with extremely large-scale MIMO,” IEEE Trans. Signal Process., vol. 72, pp. 701–717, 2024.

[14] H. Hua, J. Xu, and T. X. Han, “Optimal transmit beamforming for integrated sensing and communication,” IEEE Trans. Veh. Technol., vol. 72, no. 8, pp. 10 588–10 603, 2023.

[15] W. Mao, Y. Lu, G. Pan et al., “Cramér–Rao bound optimization for bistatic ISAC: Transceiver design and attention-based ISACNet,” IEEE J. Sel. Areas Commun., vol. 44, pp. 181–195, 2026.

[16] K. Hou and S. Zhang, “Optimal beamforming for secure integrated sensing and communication exploiting target location distribution,” IEEE J. Sel. Areas Commun., vol. 42, no. 11, pp. 3125–3139, 2024.

[17] C. Deng, X. Fang, and X. Wang, “Beamforming design and trajectory optimization for UAV-empowered adaptable integrated sensing and communication,” IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 8512–8526, 2023.

[18] Y. Zeng, X. Xu, S. Jin et al., “Simultaneous navigation and radio mapping for cellular-connected UAV with deep reinforcement learning,” IEEE Trans. Wireless Commun., vol. 20, no. 7, pp. 4205–4220, 2021.

[19] Y. Zeng, “Capacity characterization and formation optimization for multi-user MIMO communications with UAV swarm,” 2026. [Online]. Available: https://arxiv.org/abs/2605.14298

[20] K. Meng, Q. Wu, J. Xu et al., “UAV-enabled integrated sensing and communication: Opportunities and challenges,” IEEE Wireless Commun., vol. 31, no. 2, pp. 97–104, 2024.

[21] Y. Zeng, Q. Wu, and R. Zhang, “Accessing from the sky: A tutorial on UAV communications for 5G and beyond,” Proc. IEEE, vol. 107, no. 12, pp. 2327–2375, Dec. 2019.

[22] Y. Song, Y. Zeng, Y. Yang et al., “An overview of cellular ISAC for low-altitude UAV: New opportunities and challenges,” IEEE Commun. Mag., vol. 63, no. 12, pp. 88–95, Dec. 2025.

[23] G. Abdissa Bayessa, R. Chai, C. Liang et al., “Joint UAV deployment and precoder optimization for multicasting and target sensing in UAV-assisted ISAC networks,” IEEE Internet Things J., vol. 11, no. 20, pp. 33 392–33 405, 2024.

[24] K. Meng, Q. Wu, S. Ma et al., “Throughput maximization for UAV-enabled integrated periodic sensing and communication,” IEEE Trans. Wireless Commun., vol. 22, no. 1, pp. 671–687, 2023.

[25] Z. Liu, X. Liu, Y. Liu et al., “UAV assisted integrated sensing and communications for internet of things: 3D trajectory optimization and resource allocation,” IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8654–8667, 2024.

[26] X. Jing, F. Liu, C. Masouros et al., “ISAC from the sky: UAV trajectory design for joint communication and target localization,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 12 857–12 872, 2024.

[27] Y. Jiang, Q. Wu, W. Chen et al., “UAV-enabled integrated sensing and communication: Tracking design and optimization,” IEEE Commun. Lett., vol. 28, no. 5, pp. 1024–1028, 2024.

[28] Z. Lyu, G. Zhu, and J. Xu, “Joint maneuver and beamforming design for UAV-enabled integrated sensing and communication,” IEEE Trans. Wireless Commun., vol. 22, no. 4, pp. 2424–2440, 2023.

[29] Z. Xu, Z. Zhou, D. Wu et al., “CKM-enabled joint spatial–doppler domain clutter suppression for low-altitude UAV ISAC,” IEEE Internet Things J., vol. 13, no. 14, pp. 31 752–31 767, 2026.

[30] H. Jiang, H. Kong, X. Xu et al., “Low-altitude UAV-assisted bistatic ISAC: Closed-form 3D CRLB and coverage analysis,” 2026. [Online]. Available: https://arxiv.org/abs/2607.18766

## 图注与表注

**图 1（原文 Fig. 1）：** 无人机辅助三维 ISAC 系统示意图。图中给出基站（位于原点，\(yz\) 平面 UPA）、协作无人机（位置 \(\mathbf q_u\)）、威胁无人机（目标，位置 \(\mathbf q_t\)，RCS \(\kappa\)）、待监测 VoI \(\mathcal A\)，以及目标与无人机的球坐标 \(\{\tau_t,\theta_t,\phi_t\}\)、\(\{\tau_u,\theta_u,\phi_u\}\) 与无人机—目标距离 \(r_{ut}\)。

**图 2（原文 Fig. 2）：** 定理 1 的数值图示：(a) 空间帕累托最优无人机部署；(b) 相应的闭式与数值速率-CRLB 帕累托边界。灰色叉号表示全部搜索候选点，蓝色圆圈表示所得帕累托边界。图中标出基站—目标线段、基站、目标、通信最优（Com-optimal）与感知最优（Sen-optimal）点；横轴为速率 \(R\)（bit/s/Hz）、纵轴为 \(\mathcal C_{\max}\)（m²，对数刻度），速率范围约 11–19。

**图 3（原文 Fig. 3）：** 径向截断球扇区 VoI 示意图。图中给出以正 \(x\) 轴为中心、半孔径角 \(\vartheta_{\max}\) 的圆锥，以及半径 \(r_{\min}\) 与 \(r_{\max}\) 界定的球壳；虚线表示无人机—目标距离 \(r_{ut}\)。

**图 4（原文 Fig. 4）：** 定理 2 中帕累托部署结构的数值图示：(a) 径向截断球扇区 VoI 的空间帕累托最优无人机位置；(b) 相应的速率-CRLB 边界。灰色叉号表示全部搜索候选部署。由图可见全部非支配位置位于扇区轴线上且 \(0\le r_u^\star<r_{\min}\)；边界明显比单点情形更平坦。

**图 5（原文 Fig. 5）：** 第 IV 节几何符号示意图。图中给出 VoI \(\mathcal A\)、内区域 \(\mathcal Q_{\rm in}\)、\(\mathcal Q_\infty\)、固定半径圆 \(\mathcal Q(r)\)、半径上限圆盘 \(\mathcal Q_{\le}(r)\)，以及 \(r_{\mathcal A}^{\min}\)、\(r_{\mathcal A}^{\max}\)。

**图 6（原文 Fig. 6）：** 一般旋转椭球 VoI 下的速率-CRLB 性能与无人机部署。(a) 不同方案的速率-CRLB 曲线（CRLB-based、SNR-based、Center-based，并标出 Com-optimal、Sen-optimal 与 \(\mathcal C_{\max}={\rm Inf}\)）；(b) 帕累托与基准无人机部署（三维散点，含 VoI、BS、RoI center）；(c) 无人机在 \(\theta_u\)-\(\phi_u\) 平面上的方向。结果表明基于 CRLB 的部署在整个速率区间取得最低 CRLB，并形成弯曲三维路径。

**图 7（原文 Fig. 7）：** RMS 带宽 \(\beta_{\rm rms}\) 对速率-CRLB 权衡及旋转椭球 VoI 下最优无人机方向的影响。(a) 速率-CRLB 帕累托边界（\(\beta_{\rm rms}=1,2,20\) MHz）；(b) 最优无人机部署；(c) 最优无人机方向；其中 (c) 中每个点对应一个帕累托速率样本，点按沿帕累托边界的顺序连接。增益呈边际递减，带宽还会改变最优无人机方向。

**图 8（原文 Fig. 8）：** UPA 配置对速率-CRLB 权衡及旋转椭球 VoI 下最优无人机部署方向的影响。(a) 速率-CRLB 帕累托边界（\(8\times8\)、\(4\times16\)、\(16\times4\)，总天线数均为 64）；(b) 最优无人机部署；(c) 最优无人机方向。方形 \(8\times8\) 阵列取得最低区域最坏情况 CRLB；\(16\times4\) 始终优于 \(4\times16\)。

> **表注：** 原文仅有表 I（常用仿真参数），已在本页第 V 节处逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VI 节全部正文与子节（含贡献列表、符号说明、第 V 节 A–C 三个实验）、定理 1–2、命题 1–2、引理 1–2、式 (1)–(102)、算法 1（19 步完整流程）、表 I（13 行参数逐格转写）、图 1–8 图注（含 (a)(b)(c) 子图说明）、附录 A–F（定理 1、命题 1、引理 1、引理 2、定理 2、命题 2 的完整证明推导）、参考文献 [1]–[30]（英文原条目按原编号）。原文没有致谢段。所有公式与表格均按 PDF 渲染页（p3–p8、p11–p12，以及 p13 的式 (100)–(102)）逐式核对后转写；算法 1 的 19 步流程经 p8 渲染页核对。原文疑点：本页暂未发现会导致结论错误的矛盾（式 (46) 的化简形式、引理与定理中的条件均在原文中一致出现）；页尾核对说明中"逐句逐式终校未做"如实保留。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
