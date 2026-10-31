---
layout: page
title: "数字孪生信道估计中的站点几何与标定不确定性｜中文全文译文"
permalink: /papers/translations/2026-10-23-site-geometry-and-calibration-uncertainties-in-digital-twin-enabled-ch-2607-09334/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/db37cdae3a25d2d0/) · [原文 arXiv](https://arxiv.org/abs/2607.09334) · [全部目录](/papers/catalog/)

# 数字孪生信道估计中的站点几何与标定不确定性

**原题：** Site Geometry and Calibration Uncertainties in Digital Twin-enabled Channel Estimation  
**作者：** Lorenzo Del Moro、Francesco Linsalata、Umberto Spagnolini、Maurizio Magarini（米兰理工大学 DEIB，意大利米兰；邮箱 {name.surname}@polimi.it）  
**资助说明：** 本工作部分受欧盟意大利国家复苏与韧性计划（NRRP，NextGenerationEU）"未来电信"伙伴项目资助（PE00000001 – 项目 "RESTART"，结构项目 6GWINET）；并属于米兰理工大学与……的联合实验室工作（原文脚注续见 PDF）。  
**版本：** arXiv:2607.09334，2026-10-23 推荐，原文 16 页。  
**范围与状态：** 全文中文译稿：摘要、Index Terms、符号说明、第 I–VI 节及全部小节（II-A/B、III-A–C、IV-A–C、V-A–D）、式 (1)–(38)（其中部分跨栏分式按原文编号+文字定义标注）、表 I–III、图 1–6 图注、附录 A/B（一阶近似推导与反射系数敏感因子等）、参考文献 [1]–[33]（英文原条目）均按原文结构录入；逐句逐式终校未做。

## 摘要

快速射线追踪（ray tracing，RT）推动了数字孪生（Digital Twin，DT）成为环境感知通信的新兴技术。由于无线传播由站点几何与环境电磁（EM）特性之间的相互作用决定，基于 DT 的方法可为信道估计提供**站点特定先验信息**。本文研究 DT 辅助信道估计的**鲁棒性**：由 RT 提取的多径特征被用于构造信道协方差矩阵的低秩（low-rank，LR）特征结构，该 LR 结构随后用于信道估计。然而传播模型的数字表示并不精确，会影响该 LR。我们显式分析由**用户定位误差**（转化为站点表示中的几何不一致）与 **EM 材料标定误差**引起的模型失配，推导出把几何扰动（影响角度与时延）与 EM 扰动（影响路径增益）分离的**一阶扰动模型**。基于该扰动模型，我们给出归一化均方误差（NMSE）分析，揭示几何扰动与 EM 扰动的根本差异：LR 估计对 EM 标定扰动**内在鲁棒**，而定位误差通过改变信道特征结构主导性能退化。数值结果证实，在城市、郊区与农村场景中，定位误差是主要限制因素，而 EM 标定误差影响相对有限。尽管存在这些失配，DT 赋能估计器在城市低信噪比（SNR）设置下相对基线方法取得最高 **10 dB** 的 NMSE 改善，同时在中等（< 1 m）定位误差下、高 SNR 时性能与基线估计器相当。

**Index Terms：** 数字孪生、射线追踪、信道估计、低秩估计、MMSE 估计、扰动分析。

## I. 引言

下一代网络预期支持新应用与用例，对数据速率、可靠性与时延提出严格要求。为满足这些挑战性需求，预计采用更高载频（如 upper mid-band 与毫米波 mmWave）以支撑大带宽，尽管传播路径损耗严重 [1]。多输入多输出（MIMO）被视为实现向这些频段迁移的关键技术；然而宽带 MIMO 信道的参数数量巨大，使精确信道估计日益困难 [2]。低秩（LR）与最小均方误差（MMSE）估计器通过利用信道协方差矩阵的特征结构来应对该问题——由于宽带 MIMO 信道在空时（spatio-temporal，ST）域的稀疏结构，该协方差通常呈现 LR 特性。

从物理角度看，该特征结构由底层**传播几何**与**与环境电磁相互作用**共同决定，二者联合定义主导多径分量。特别地，站点几何与基站（BS）、用户设备（UE）位置共同决定传播路径，因此 UE 定位的不准确会直接转化为 BS 所见有效传播场景中的几何不一致。然而可靠地获取协方差信息在实践中仍然困难，因为其维数随信道维度与信道统计量增长 [4]。这些挑战推动了若干互补研究方向，包括学习辅助信道估计 [5], [6]、基于堆叠智能超表面（SIM）的先进波域处理 [7], [8]，以及利用传播环境先验知识的环境感知通信 [9]。

近期环境感知通信研究日益借助**数字孪生**（DT）——一种镜像物理系统组件与相互作用的虚拟表示 [10]。在无线接入网（RAN）语境中，DT 系统通过仿真电磁传播环境来合成信道先验信息，其中射线追踪（RT）是关键使能工具 [11], [12]。借助场景的高保真数字模型（例如通过多模态感知或地理空间数据库获得 [11], [13]），RT 仿真可针对给定 BS 与 UE 位置提取主导多径分量的相关参数，计入反射、绕射与漫散射。相比纯数据驱动方法，RT 利用根植于电磁传播物理的先验知识，有潜力准确捕捉到达角（AoA）、离开角（AoD）、传播时延与路径增益 [14]。这些参数完全决定信道协方差矩阵及其特征结构，而后者正是 LR 与 MMSE 估计器所利用的关键量。因此，环境数字表示中的任何失配都会传播到估计出的特征结构，可能降低 DT 赋能估计器的性能。

**相关工作。** 近期若干工作研究了 DT 在 RAN 中的使用，或聚焦于提升 RT 仿真的建模保真度与计算效率 [11], [15], [16]，或聚焦于 DT 编排、实时同步与 RAN 内预测优化等架构层面 [10], [17]。更近期，DT 也被探索用于定位、混合预编码/合并与 CSI 反馈等任务。DT 还越来越多地被用于借助站点特定传播信息支持信道估计：例如 [21] 通过强化学习（RL）迭代校准 DT 导出的子空间，实现区域特定子空间的基础信道估计从而降低反馈开销；我们的先前工作 [22], [23] 利用从 DT 重建的 ST 特征结构作为上行 LR 信道估计的先验，并研究了 RT 计算约束导致的有限传播知识的影响。

并行地，若干工作研究如何校准基于 RT 的 DT 以更好匹配真实信道观测：特别地，[14] 表明站点几何的微小差异会在 RT 生成的多径分量中引入显著相位误差，并提出基于信道响应的校准方法以补偿；更一般地，RT 校准技术利用信道测量精化数字模型的 EM 参数 [24], [25]。这些方法通过校准仿真信道响应提升 RT 预测保真度，但**未分析残余失配如何影响信道特征结构**，进而影响信道估计性能。因此现有 DT 辅助通信框架要么假设传播环境的数字表示理想/已校准，要么专注于提升 RT 保真度，而未解析刻画残余 DT 不准确如何传播到信道协方差特征结构并影响 LR 与 MMSE 信道估计性能。表 I 汇总代表性既有工作与所提框架的主要差异。

尽管可获得高分辨率 3D 模型 [15]，残余失配仍可能源于不完美的 UE 定位或环境 EM 刻画的偏差。特别地，UE 定位误差在重建的传播场景中引入几何不一致，而 EM 标定误差主要在本文采用的小误差假设下**保持传播几何不变**地扰动多径增益。因此这两类误差源对协方差特征结构产生根本不同的扰动，对 LR 与 MMSE 信道估计的影响也截然不同。用实验评估这些效应是困难的，因为几何、定位、材料属性与 RT 建模误差在实际部署中本质耦合；因此基于测量的评估难以分离几何失配与 EM 失配各自的贡献、也难以控制其量级。这促使我们采用受控的高保真 RT 仿真，以系统、可解释地评估几何与 EM 失配的独立影响，同时把 RT 近似误差与 DT 失配效应分离。

为此，本文提出一个**基于模型的框架**，把 DT 不准确与信道协方差特征结构的扰动联系起来。具体地，我们采用一阶扰动方法，把 UE 定位误差引起的几何失配与影响路径增益的 EM 失配分离，并分析它们对 DT 赋能 LR 与 MMSE 估计器的影响。

**论文贡献。** 主要贡献如下。

- 提出 DT 赋能的信道估计框架，整合高保真 3D 模型与相对 RT：框架针对给定 BS 与 UE 位置提取主导多径参数以重建信道特征结构，用于 DT 赋能的 LR 与 MMSE 信道估计。
- 在小误差情形下为多径参数建立扰动模型：推导 (i) UE 定位误差引起的 AoA/AoD 与时延扰动，以及 (ii) EM 材料标定误差引起的路径增益扰动。
- 给出 NMSE 分析，揭示失配对 MIMO-OFDM 系统中 LR 与 MMSE 信道估计的影响：表明在保持信道子空间条件下 LR 估计器对 EM 标定引起的增益扰动基本不敏感，而定位误差引起的子空间畸变直接影响估计性能。
- 通过高保真城市、郊区与农村场景的 RT 仿真验证框架：结果表明所提 DT 赋能估计器对现实定位与 EM 标定误差保持鲁棒，在城市低 SNR 设置下相对基线取得最高 10 dB 的 NMSE 改善。

**论文组织。** 第 II 节介绍上行 MIMO-OFDM 模型与相应 ST 信道表示；第 III 节描述 DT 赋能信道估计框架与 LR、MMSE 估计器；第 IV 节给出扰动模型与 NMSE 分析；第 V 节报告仿真结果；第 VI 节总结全文。

**符号说明。** \((\cdot)^*\)、\((\cdot)^T\)、\((\cdot)^H\) 分别表示复共轭、转置与 Hermitian 转置，\((\cdot)^\dagger\) 为 Moore–Penrose 伪逆；Kronecker 积记为 \(\otimes\)，\(\operatorname{diag}(\cdot)\) 构成对角矩阵，\(\operatorname{vec}(\cdot)\) 为向量化；\(\operatorname{Tr}\{\cdot\}\)、\(\operatorname{rank}\{\cdot\}\)、\(\operatorname{span}\{\cdot\}\) 分别表示迹、秩与列空间；\(\mathbb E\{\cdot\}\) 为期望，\(\mathbf I_N\) 为单位阵；范数与内积为 \(\|\cdot\|\) 与 \(\langle\mathbf a,\mathbf b\rangle=\mathbf a^H\mathbf b\)；\(\mathcal N(\cdot,\cdot)\) 与 \(\mathcal{NC}(\cdot,\cdot)\) 分别表示实与复高斯分布，\(\delta(\cdot)\) 为 Kronecker delta。

## II. 系统与信道模型

本节先描述 \(N_r\times N_t\) MIMO-OFDM 系统中的上行导频传输，再给出 ST 信道模型。BS 与 UE 分别配备 \(N_r\) 与 \(N_t\) 个天线元；OFDM 符号时长为 \(T=(N_{sc}+N_{cp})T_s\)，其中 \(T_s=1/B\) 为带宽 \(B\) 的采样间隔、\(N_{cp}\) 为循环前缀（CP）长度、\(N_{sc}\) 为子载波数。

### A. 上行导频传输

假设信道估计使用 \(N_t\) 条相互正交的导频序列，每条从不同 UE 天线发往 BS；这些序列在 BS 处已知，共含 \(N_p\) 个导频样本，散布在频域上。对第 \(q\) 个接收天线与 OFDM 符号 \(m\)，接收导频样本可写为

$$
\mathbf y_q(m)=\operatorname{diag}\left\{\mathbf x_\ell\right\}\mathbf h_{\ell,q}\mathbf F^{(m)}+\mathbf w_q(m),\tag{1}
$$

其中 \(\mathbf x_\ell\) 为第 \(\ell\) 个 UE 天线上的导频序列、\(\mathbf h_{\ell,q}\) 为对应信道频率响应，而

$$
\mathbf F^{(m)}=\mathbf e_F\mathbf h_{\ell,q}(m),\tag{2}
$$

其中 \(\mathbf h_{\ell,q}(m)\in\mathbb C^W\) 为 \((\ell,q)\) 链路的离散时间信道冲激响应（CIR），\(\mathbf e_F\) 为部分离散 Fourier 变换（partial DFT），其元素为 \([\mathbf e_F]_{k,w}=\frac{1}{\sqrt{N_{sc}}}e^{-\mathrm{j}2\pi kw/N_{sc}}\)（原式见 PDF）。把各 CIR 堆叠为 \(\mathbf h_q(m)=\left[\mathbf h_{1,q}(m)^T,\ldots,\mathbf h_{N_t,q}(m)^T\right]^T\in\mathbb C^{WN_t}\)，式 (1) 可紧凑地重写为

$$
\mathbf y_q(m)=\mathbf B\mathbf h_q(m)+\mathbf w_q(m).\tag{3}
$$

令 \(\mathbf Y(m)\in\mathbb C^{N_p\times N_r}\) 为 \(N_r\) 个接收天线上收到的导频样本集合，把其各列堆叠得到

$$
\mathbf y(m)=\operatorname{vec}\left(\mathbf Y(m)\right)=\boldsymbol\Psi\mathbf h(m)+\mathbf w(m),\tag{4}
$$

其中 \(\mathbf h(m)\) 为全部链路的 ST 信道向量、\(\boldsymbol\Psi\) 为等效感知矩阵、\(\mathbf w(m)\) 为噪声。最大似然（ML）信道估计要求导频样本等功率、等间隔且相移正交，使得

$$
\boldsymbol\Psi^H\boldsymbol\Psi=\frac{PTN_p}{N_{sc}}\mathbf I_L=\nu\mathbf I_L,\tag{5}
$$

其中 \(P\) 为导频功率、\(L\) 为待估参数维度、\(\nu>0\)。在高斯假设下，ML 估计器具有闭式解（即 \(\hat{\mathbf h}_{\rm ML}(m)=\boldsymbol\Psi^\dagger\mathbf y(m)\)）。

### B. ST MIMO 信道模型

ST 域的宽带 MIMO 信道由 \(P\) 条主导多径分量构成，每条路径 \(p\) 由离开角（AoD）、到达角（AoA）、时延与复增益刻画。以 BS 与 UE 的阵列响应表示，路径 \(p\) 的 ST 特征向量可写为

$$
\boldsymbol\lambda_p=\left(\mathbf u_{\rm BS}N_r\right)^T\mathbf v_{\rm BS},\qquad\text{（AoD 方向，式 (6)）}
$$

$$
\boldsymbol\lambda_p=\left(\mathbf u_{\rm UE}N_t\right)^T\mathbf v_{\rm UE},\qquad\text{（AoA 方向，式 (7)）}
$$

其中 \(\mathbf u_{\rm BS},\mathbf u_{\rm UE}\) 为相应阵列响应向量，\(\mathbf v_{\rm BS},\mathbf v_{\rm UE}\) 为单位方向向量。把角度、时延与增益组合，路径 \(p\) 的 ST 贡献为

$$
\boldsymbol\Omega_p=\left(\mathbf a_{\rm BS}(\theta_p)\otimes\mathbf a_{\rm UE}(\gamma_p)\otimes\mathbf g(\tau_p)\right)e^{\mathrm{j}\phi_p(m)},\tag{8}
$$

其中 \(\theta_p\) 与 \(\gamma_p\) 为 AoA/AoD、\(\tau_p\) 为时延、\(\phi_p(m)\) 为含时相位（含 Doppler 项），\(\mathbf a_{\rm BS}(\cdot)\)、\(\mathbf a_{\rm UE}(\cdot)\) 为阵列导向矢量、\(\mathbf g(\tau_p)\) 为时延域响应。假设不同路径的随机相位/增益项 \(\boldsymbol\zeta(m)\) 互不相关且跨符号独立，即 \(\mathbb E\{\boldsymbol\zeta(m)\boldsymbol\zeta^H(m)\}=\mathbf I_P\)、\(\mathbb E\{\boldsymbol\zeta(m)\boldsymbol\zeta^H(m+l)\}=\mathbf I_P\delta(l)\)，则 ST 信道协方差矩阵可写为

$$
\mathbf R=\sum_{p=1}^{P}\boldsymbol\Omega_p\boldsymbol\Omega_p^H=\mathbf T(\boldsymbol\xi)\boldsymbol\Lambda\mathbf T^H(\boldsymbol\xi),\tag{9}
$$

其中 \(\boldsymbol\xi=\{\theta_p,\gamma_p,\tau_p\}_{p=1}^{P}\) 汇集几何（角度—时延）特征、\(\mathbf T(\boldsymbol\xi)\) 为由这些特征构成的 ST 特征矩阵、\(\boldsymbol\Lambda\) 为路径功率构成的对角矩阵。由于 \(P\) 通常远小于 ST 信道维度，\(\mathbf R\) 呈低秩结构——这正是 LR 与 MMSE 估计器可利用的性质。

## III. 基于数字孪生的信道估计

### A. 信道估计框架

DT 赋能框架的核心是：利用站点 3D 模型与 RT 仿真，针对给定 BS/UE 位置重建信道协方差的主导特征结构，再把该结构作为先验用于 LR 与 MMSE 估计。图 1 给出框架示意。具体地，RT 仿真输出主导多径的几何与增益参数，据此构造

$$
\hat{\mathbf U}=\operatorname{span}\left\{\hat{\boldsymbol\Omega}_1,\ldots,\hat{\boldsymbol\Omega}_{\hat P}\right\},\qquad\hat{\boldsymbol\Lambda}=\operatorname{diag}\left\{\|\hat{\boldsymbol\Omega}_1\|^2,\ldots,\|\hat{\boldsymbol\Omega}_{\hat P}\|^2\right\},\tag{10}
$$

其中 \(\hat P\) 为 RT 重建的主导路径数、\(\hat{\boldsymbol\Omega}_p\) 为相应 ST 特征向量、\(\hat{\mathbf U}\) 为 DT 提供的信道子空间、\(\hat{\boldsymbol\Lambda}\) 为估计的特征值。LR 估计器把 ML 估计投影到该子空间上：

$$
\hat{\mathbf h}_{\rm LR}(m)=\hat{\boldsymbol\Pi}_{\rm LR}\hat{\mathbf h}_{\rm ML}(m),\tag{11}
$$

其中 \(\hat{\boldsymbol\Pi}_{\rm LR}\) 为到 \(\hat{\mathbf U}\) 的投影矩阵。

### B. 基于 DT 的 LR 与 MMSE 信道估计

LR 估计器仅依赖投影矩阵 \(\hat{\boldsymbol\Pi}_{\rm LR}\)，故其性能由 DT 子空间与真实子空间的一致性决定。MMSE 估计器则同时利用特征值与子空间：

$$
\hat{\mathbf h}_{\rm MMSE}(m)=\hat{\boldsymbol\Pi}_{\rm MMSE}\hat{\mathbf h}_{\rm ML}(m),\tag{12}
$$

其投影矩阵由 Wiener 型收缩给出，形如 \(\hat{\mathbf U}\left(\hat{\boldsymbol\Lambda}+\frac{\hat\sigma_w^2}{\nu}\mathbf I_{\hat r}\right)^{-1}\hat{\mathbf U}^H\)（式 (12) 的完整形式见原文），其中 \(\hat r\) 为保留的秩、\(\hat\sigma_w^2\) 为噪声功率估计；与 LR 情形不同，其权重只依赖 \(\hat{\boldsymbol\Lambda}\) 与噪声方差。此外，式 (12) 中 \(\hat r\times\hat r\) 矩阵求逆在区间 \(T_{\rm ST}\) 上只需一次性代价 \(\mathcal O(\hat r^3)\)；噪声功率估计需要 \(M_w\) 个 OFDM 符号，实践中 \(M_w\) 可取小值（通常 \(M_w\ll M\)）而不显著影响估计精度，从而限制相关时延。为评估子空间失配，我们还定义投影误差

$$
\sigma^2_{h,\rm LR}\propto\frac{1}{M_w(L-\hat r)}\sum_{m=1}^{M_w}\left\|\hat{\boldsymbol\Pi}_{\rm LR}^\perp\hat{\mathbf h}_{\rm ML}(m)\right\|^2,\tag{13}
$$

它度量真实信道在 DT 子空间之外的残余能量（\(\hat{\boldsymbol\Pi}_{\rm LR}^\perp=\mathbf I-\hat{\boldsymbol\Pi}_{\rm LR}\)）。MMSE 估计器的对应形式为

$$
\hat{\mathbf h}_{\rm MMSE}(m)=\hat{\boldsymbol\Pi}_{\rm MMSE}(\mathbf y(m),\hat{\mathbf U},\hat{\boldsymbol\Lambda}),\tag{14}
$$

即投影矩阵由观测、DT 子空间与 DT 特征值共同决定。

### C. DT 失配建模

如第 IV 节所详述，我们假设场景几何与 BS 位置完全已知（\(\hat{\mathbf s}=\mathbf s\)、\(\hat{\mathbf p}_{\rm BS}=\mathbf p_{\rm BS}\)），这与当前站点特定重建技术可提供准确传播环境数字表示的事实一致 [15]。相反，UE 位置与 EM 材料参数可能受定位与标定不准确影响：

$$
\hat{\mathbf e}=\mathbf e+\Delta\mathbf e,\qquad\hat{\mathbf p}_{\rm UE}=\mathbf p_{\rm UE}+\Delta\mathbf p,\tag{15}
$$

其中 \(\Delta\mathbf e\sim f_{\Delta\mathbf e}(\cdot)\) 与 \(\Delta\mathbf p\sim f_{\Delta\mathbf p}(\cdot)\) 分别刻画 EM 材料属性未知（标定误差）与 UE 定位不准确。特别地，UE 定位误差在 DT 所见的有效站点表示中引入几何不一致，因而预期会扰动重建的传播路径。

数字副本随后用于 RT 仿真：EM 传播通过以给定角分辨率发射射线并保留满足接收条件的射线来近似 [15]，从而提取与环境相关的有限个（\(\hat P\)）主导多径分量。记 \(\mathbf f_{\rm RT}(\cdot)\) 为 RT 函数，其输入为场景几何 \(\mathbf s\)、EM 材料参数 \(\mathbf e\) 与 UE 位置 \(\mathbf p\)。值得注意的是，RT 仿真会因有限角分辨率或有限反射阶数引入建模误差；然而站点特定 RT 已被证明能在真实传播环境中准确复现主导多径分量，因此本文**忽略残余 RT 近似误差**，以隔离定位与 EM 标定不准确造成的 DT 失配影响。该假设与足够精细的 RT 仿真设置一致（此时离散化与有限分辨率效应被证明有限 [11]）。此外，分析限定在**小残余失配**情形，此时主导传播路径集合在扰动下保持不变，即 \(\hat P=P\)。对足够大的定位或标定误差，\(\hat P=P\) 的假设可能不再成立，导致 DT 重建的主导传播分量被低估或高估，从而给出不完整或不准确的先验传播知识，直接影响重建特征结构与信道估计性能；这类情形超出本文框架范围，已在 [23] 中研究。本文关注的这一局部区域正是理解"DT 赋能信道估计在现实但非灾难性数字表示缺陷下是否仍可靠"所需的区域。

据此，在名义输入 \((\mathbf s,\mathbf e,\mathbf p)\) 附近作一阶近似可得

$$
\mathbf f_{\rm RT}(\mathbf s,\hat{\mathbf e},\hat{\mathbf p})\approx\mathbf f_{\rm RT}(\mathbf s,\mathbf e,\mathbf p)+\Delta\boldsymbol\xi+\Delta\boldsymbol\Omega,\tag{16}
$$

$$
\Delta\boldsymbol\xi=\left(\frac{\partial\boldsymbol\xi}{\partial\mathbf p}\right)\Delta\mathbf p,\qquad\Delta\boldsymbol\Omega=\left(\frac{\partial\boldsymbol\Omega}{\partial\mathbf e}\right)\Delta\mathbf e,\tag{17}
$$

其中扰动 \(\Delta\boldsymbol\xi\) 与 \(\Delta\boldsymbol\Omega\) 分别由输入变量扰动 \(\Delta\mathbf p\) 与 \(\Delta\mathbf e\) 诱导。如上所述，我们聚焦局部扰动区域：在此情形下，UE 定位误差主要影响传播几何、从而影响时延与 AoA/AoD 特征，而残余 EM 材料标定误差主要影响反射系数、从而影响路径增益。因此在所考虑设定中，几何参数与 EM 参数之间的交叉敏感性被忽略，即令 \(\partial\boldsymbol\xi/\partial\mathbf e=\mathbf 0\)、\(\partial\boldsymbol\Omega/\partial\mathbf p=\mathbf 0\)。该分离对本文余下部分至关重要，因为它使我们能够区分几何失配与 EM 失配如何影响协方差特征结构的不同分量、并最终影响不同的信道估计器。

**图 1（原文 Fig. 1）：** DT 赋能信道估计框架。

**图 2（原文 Fig. 2）：** 用镜像法表示曲面 \(S\)（法向 \(\mathbf n\)）上的镜面反射：反射路径被建模为 BS 与虚拟 UE 镜像之间的 LoS 链路（等价地，虚拟 BS 镜像与 UE 之间）。UE 定位误差通过仿射映射传播，诱导 ST 特征的相关扰动。

## IV. DT 扰动模型与 NMSE 分析

本节刻画上述扰动如何影响 ST 特征与路径增益，并据此分析 LR 与 MMSE 估计的 NMSE。

### A. 几何诱导的 ST 特征扰动

设路径 \(p\) 的标称距离为 \(R_p=\|\mathbf r_p\|\)，其中 \(\mathbf r_p\) 为相应几何向量。由一阶近似（见附录 A），扰动后的距离为

$$
\hat R_p\approx R_p+\frac{(\mathbf v_p^{\rm BS})^T\Delta\mathbf p_{\rm im}^p}{R_p},\tag{18}
$$

其中 \(\mathbf v_p^{\rm BS}\) 为 BS 到虚拟镜像的单位方向向量、\(\Delta\mathbf p_{\rm im}^p\) 为由 UE 定位误差经镜像映射得到的虚拟 UE 位置扰动。相应的时延扰动为 \(\Delta\tau_p=\hat R_p/c-R_p/c\)（\(c\) 为光速）。

对角度，设 \(\mathbf q_p^{\theta_{\rm az}}\)、\(\mathbf q_p^{\theta_{\rm el}}\) 分别为方位与俯仰方向上的敏感向量，\(\mathbf A_p^{\rm UE}\) 为 UE 阵列几何矩阵、\(\boldsymbol\Sigma_p\) 为 UE 定位误差协方差（\(\boldsymbol\Sigma_p=\sigma_p^2\mathbf I_3\)），则方位角与俯仰角的扰动方差分别为

$$
\sigma^2_{\theta_{\rm az},p}=\operatorname{Tr}\left\{\frac{1}{R_p^2}\left(\mathbf q_p^{\theta_{\rm az}}\right)^T\boldsymbol\Sigma_p\mathbf q_p^{\theta_{\rm az}}\right\},\tag{20}
$$

$$
\sigma^2_{\gamma_{\rm az},p}=\operatorname{Tr}\left\{\frac{1}{R_p^2}\left(\mathbf q_p^{\gamma_{\rm az}}\right)^T\mathbf A_p^{\rm UE}\boldsymbol\Sigma_p\left(\mathbf A_p^{\rm UE}\right)^T\mathbf q_p^{\gamma_{\rm az}}\right\},\tag{24}
$$

以及对俯仰角的类似表达式（式 (21)、(25) 见原文）。把各特征的敏感度汇总可得总的 ST 特征扰动协方差

$$
\mathbb E\left\{\Delta\boldsymbol\xi\Delta\boldsymbol\xi^T\right\}=\sigma_p^2\mathbf J\mathbf J^T,\tag{26}
$$

其中矩阵 \(\mathbf J\)（由场景几何计算，见第 IV-A 节）把 UE 位置扰动线性映射为角度与时延扰动，其显式分块形式见原文式 (26)。式 (18)–(26) 表明：几何扰动主要改变子空间——即扰动后的特征矩阵 \(\mathbf T(\hat{\boldsymbol\xi})\) 的列空间一般不同于 \(\mathbf T(\boldsymbol\xi)\) 的列空间，即 \(\operatorname{span}\{\mathbf T(\hat{\boldsymbol\xi})\}\neq\operatorname{span}\{\mathbf T(\boldsymbol\xi)\}\)。因此 LR 投影建立在失配子空间上，导致 \(\sigma^2_{h,\rm LR}>0\)，MMSE 估计器同样受影响（特征向量与特征值均被扰动）。这形式化了此前的核心洞见：由 UE 定位误差引起的几何失配是性能退化的主导来源，因为它们改变信道子空间；而 EM 标定误差主要扰动特征值轮廓，因此影响更有限，尤其对 LR 估计。

### B. 标定诱导的路径增益扰动

考虑涉及 \(K_p\) 次连续镜面反射的第 \(p\) 条传播路径。路径增益由各次反射的反射系数乘积决定。对第 \(k\) 次反射，记 \(\hat\Gamma_{p,k}\) 为扰动后的反射系数、\(\theta_{p,k}\) 为入射角、\(\varepsilon^r_{p,k}\) 为相对介电常数，则反射系数的幅度（以 TM 极化为例）可写为

$$
\hat\Gamma_{p,k}\approx\frac{\cos(\theta_{p,k})-\sqrt{\hat\varepsilon^r_{p,k}-\sin^2(\theta_{p,k})}}{\cos(\theta_{p,k})+\sqrt{\hat\varepsilon^r_{p,k}-\sin^2(\theta_{p,k})}},\tag{28}
$$

其相对误差与材料参数扰动的关系为

$$
\Delta\Gamma_{p,k}\approx c_{p,k}\,\Delta e_{p,k},\tag{30}
$$

其中 \(c_{p,k}\) 为与入射角、标称介电常数相关的敏感因子（附录 B 给出显式推导），\(\Delta e_{p,k}\) 为介电常数扰动。把各次反射的相对误差相加，路径增益的扰动为

$$
\hat\Omega_p\approx\Omega_p+\Omega_p\sum_{k=1}^{K_p}\Re\left\{\alpha_{p,k}\Delta e_{p,k}\right\},\tag{31}
$$

其中 \(\alpha_{p,k}\) 为综合敏感系数、\(\Re\{\cdot\}\) 取实部。其方差为

$$
\sigma^2_{g,p}=\sum_{k=1}^{K_p}\left|\alpha_{p,k}\right|^2\frac{\sigma^2_{p,k}}{A},\tag{32}
$$

其中 \(\sigma^2_{p,k}\) 为材料参数方差、\(A\) 为等效平均系数。在仿真中，增益扰动建模为 \(\Delta\Omega_p=\Omega_p\beta_p\)，\(\beta_p\sim\mathcal N(0,\sigma_g^2)\)，从而 \(\Delta\boldsymbol\Omega\sim\mathcal N(0,\boldsymbol\Sigma_\Omega)\)、\(\boldsymbol\Sigma_\Omega=\sigma_g^2\operatorname{diag}(\boldsymbol\Omega^2)\)；UE 定位不确定性建模为 \(\Delta\mathbf p\sim\mathcal N(\mathbf 0,\sigma_p^2\mathbf I_3)\)。

### C. NMSE 分析

基于上述扰动模型，可界定 LR 与 MMSE 估计器的 NMSE。记 \(\mathbf R\) 为真实协方差、\(\hat{\mathbf R}\) 为 DT 重建协方差；LR 估计的误差方差由子空间失配与噪声两部分组成：

$$
\mathbb E\left\{\mathbf e_h^H(m)\mathbf e_h(m)\right\}=\sigma^2_{h,\rm LR}+\sigma^2_{w,\rm LR},\tag{34}
$$

其中信号相关项由真实与估计特征基之间的重叠决定：

$$
\sigma^2_{h,\rm LR}=\sum_{j=1}^{r}\sum_{k=1}^{\hat r}\lambda_j\left|\left\langle\hat{\mathbf u}_k,\mathbf u_j\right\rangle\right|^2-\text{（有效投影项）},\tag{35}
$$

其精确形式见原文：当且仅当 \(\operatorname{span}\{\hat{\mathbf U}\}=\operatorname{span}\{\mathbf U\}\) 时该项为零；噪声相关项为 \(\sigma^2_{w,\rm LR}=\frac{\nu\sigma_w^2}{N_p}\hat r\)。MMSE 估计的误差方差为

$$
\mathbb E\left\{\mathbf e_h^H(m)\mathbf e_h(m)\right\}=\sigma^2_{h,\rm MMSE}+\sigma^2_{w,\rm MMSE},\tag{36}
$$

$$
\sigma^2_{h,\rm MMSE}=\sum_{j=1}^{r}\sum_{k=1}^{\hat r}\lambda_j\left(2\mu_k-\mu_k^2\right)\left|\left\langle\hat{\mathbf u}_k,\mathbf u_j\right\rangle\right|^2,\tag{37}
$$

其中 \(\mu_k=\lambda_k(\hat{\mathbf R})/(\lambda_k(\hat{\mathbf R})+\sigma_w^2/\nu)\) 为收缩系数。可见：LR 的 NMSE 只通过 \(\hat{\mathbf U}\) 的子空间重叠依赖 DT 失配，故对增益扰动（只改特征值）不敏感；MMSE 同时依赖特征值与子空间，故对两类扰动都敏感、但增益扰动仅通过收缩系数带来有限退化。这从理论上解释了后文数值观察。

## V. 数值结果

### A. 仿真框架

仿真采用高保真城市、郊区与农村场景的 RT 仿真，参数见表 II。载频 28 GHz、UE 天线高度 0.2 m、网格 UE 高度 1.5 m、网格分辨率 \(2\times2\ \mathrm{m}^2\)、SUMO 采样时间 0.1 s、RT 方法为 Fibonacci（SBR）、初始射线数 \(10^6\)、交互类型为反射。系统配置以 \((N_r,N_{sc})\) 表示，考虑 (4,32)、(8,64)、(16,128) 三种配置。为分离几何与 EM 失配效应，RT 近似误差被忽略（第 III-C 节），扰动幅度由 \(\sigma_p\)（定位标准差）与 \(\sigma_g\)（归一化增益扰动标准差）控制。

**表 II（原文 TABLE II）：RT 仿真参数**

| 参数 | 取值 | 参数 | 取值 |
|---|---|---|---|
| 载频 | 28 GHz | 网格 UE 高度 | 1.5 m |
| 天线 UE 高度 | 0.2 m | 网格分辨率 | \(2\times2\ \mathrm{m}^2\) |
| SUMO 采样时间 | 0.1 s | RT 方法 | Fibonacci（SBR） |
| 初始射线数 | \(10^6\) | 交互类型 | 反射 |

### B. 子空间相似性分析

我们先用相似性度量评估定位与 EM 标定误差对 DT 提供的信道协方差矩阵的影响：

$$
\eta=\mathbb E\left\{\frac{\operatorname{Tr}\left\{\mathbf R(\boldsymbol\xi,\boldsymbol\Omega)^H\mathbf R(\hat{\boldsymbol\xi},\hat{\boldsymbol\Omega})\right\}}{\operatorname{Tr}\left\{\mathbf R(\boldsymbol\xi,\boldsymbol\Omega)^H\right\}\operatorname{Tr}\left\{\mathbf R(\hat{\boldsymbol\xi},\hat{\boldsymbol\Omega})\right\}}\right\},\tag{38}
$$

其中 \(\eta\in[0,1]\) 越接近 1 表示子空间越一致。表 III 报告城市场景下定位（\(\sigma_g=0\)）与增益（\(\sigma_p=0\)）扰动下的 \(\eta\)：定位误差 \(\sigma_p=0.1,1,10\) m 时三种配置的 \(\eta\) 分别从 1.000 降至约 0.976/0.934/0.882（最大配置退化最明显）；增益扰动 \(\sigma_g=0.1,0.25,0.5\) 时 \(\eta\) 仅从 0.995 降至约 0.905–0.918。该对比直接支持理论：**几何（定位）误差显著扭曲子空间，而增益（EM）误差主要重分配各模态功率、对子空间影响有限**。因此 \(\eta\) 在所有配置下即使对较大 \(\sigma_g\) 也保持较高，且对系统维度只呈弱依赖。

**表 III（原文 TABLE III）：城市场景下定位（\(\sigma_g=0\)）与增益（\(\sigma_p=0\)）扰动下的相似性度量 \(\eta\)**

| 配置 \((N_r,N_{sc})\) | 定位 0.1 m | 定位 1 m | 定位 10 m | 增益 0.1 | 增益 0.25 | 增益 0.5 |
|---|---|---|---|---|---|---|
| (4, 32) | 1.000 | 1.000 | 0.976 | 0.995 | 0.970 | 0.918 |
| (8, 64) | 1.000 | 0.995 | 0.934 | 0.995 | 0.965 | 0.917 |
| (16, 128) | 1.000 | 0.991 | 0.882 | 0.995 | 0.960 | 0.905 |

接着考虑式 (35) 中的投影误差项——它刻画 DT 提供子空间之外的残余信道能量。在高 SNR（噪声趋于零）下该项对应投影误差，决定 LR 与 MMSE 估计器的 NMSE，从而定义**基本性能地板**。图 3 报告该投影误差地板随定位误差标准差的变化：如预期地板随 \(\sigma_p\) 增大而升高。对较小定位误差（约 \(\sigma_p<0.2\) m），地板很低（低于约 −30 dB），表明 DT 准确重建了信道特征结构；而当 \(\sigma_p\approx1\) m 时地板显著升高，尤其对更高分辨率配置，说明特征结构失配带来实质损失。更具体地，在 \(N_r=16\)、\(N_{sc}=128\) 配置下，相对 ML 估计器（SNR=20 dB 参考），可容许的定位误差约为 0.4–0.6 m；而 \(N_r=8\)、\(N_{sc}=64\) 配置下可容许范围更宽（原文给出具体数值范围）。

**图 3（原文 Fig. 3）：** 不同系统配置下投影误差地板随定位误差标准差 \(\sigma_p\) 的变化。

### C. 扰动下的 NMSE 分析

图 4 展示城市场景、\(N_r=16,N_{sc}=128\) 配置下，DT 赋能 LR 估计器在不同 SNR 与增益扰动水平下 NMSE 随 \(\sigma_p\) 的曲线：对应 \(\sigma_g=0\) 与 \(\sigma_g=0.5\) 的曲线在整个 \(\sigma_p\) 范围内重合（所有 SNR 值下），说明 LR 估计器**对增益扰动基本不敏感**——这直接验证了理论分析：LR 估计只依赖信道子空间，而只要主导传播结构保持不变，子空间就不受增益扰动影响。

图 5 进一步给出三种传播场景下 DT 赋能 MMSE 估计器的 NMSE 随 \(\sigma_p\) 的变化。与 LR 不同，MMSE 对增益扰动呈**中等敏感**，因为它不仅依赖主导子空间，还依赖协方差特征值轮廓——后者通过依赖特征值的收缩系数直接受增益误差影响；不过相对定位误差，该退化仍然有限。值得注意的是，无扰动时三个环境的绝对 NMSE 因传播特性与信道稀疏度不同而略有差异，但定位与增益误差的影响遵循相同的定性行为：增益扰动仅中等影响 MMSE（在 \(\sigma_p=1\) m 时三类场景、所有 SNR 下退化均小于 2 dB）；相反，定位误差始终是主导损伤，在三个环境中导致几乎相同的退化趋势。这些结果确认该行为在传播特性显著不同的环境中保持一致，支持前述分析的普适性。

更重要的是，结果一致表明**定位误差是性能退化的首要来源**：随 \(\sigma_p\) 增大，所有 SNR 下 NMSE 都恶化，反映几何扰动诱导的特征结构失配；该效应在高 SNR 下尤为显著——此时噪声贡献可忽略、性能由子空间失配主导。在低 SNR 下 NMSE 由噪声主导、随 \(\sigma_p\) 变化几乎不变；随 SNR 升高，噪声贡献减小、估计性能受特征结构失配限制，形成由投影误差决定的 NMSE 地板。该转变清楚凸显了子空间失配在限制 DT 赋能估计器性能中的根本作用，并确认了"定位误差而非增益扰动构成 DT 赋能信道估计主要瓶颈"这一核心理论洞见。

**图 4（原文 Fig. 4）：** 城市场景下 DT 赋能 LR 估计器 NMSE 随定位标准差 \(\sigma_p\) 的变化（不同 SNR 与增益扰动水平；实线与虚线分别对应 \(\sigma_g=0\) 与 \(\sigma_g=0.5\)）。

**图 5（原文 Fig. 5）：** 城市、郊区与农村场景下 DT 赋能 MMSE 估计器 NMSE 随 \(\sigma_p\) 的变化（不同 SNR 值）。

### D. 与基线方法的性能比较

最后，图 6 在三种场景下把所提 DT 赋能估计器与基线方法随 SNR 比较。图 6(a)(b)(c) 分别给出城市、郊区与农村场景的 LR 结果，图 6(d)(e)(f) 给出相应 MMSE 结果（基线包括 ML 估计器与基于指纹的方法）。对 LR 估计，DT 赋能估计器在三种场景的低—中 SNR 区间都具明显优势，这归功于 DT 提供的更准确子空间信息；随 SNR 升高性能逐渐饱和，原因是由定位误差引起的残余失配——在所考虑的扰动设置（\(\sigma_p=1\) m、\(\sigma_g=0.5\)）下，该饱和与图 3 观察到的投影误差地板一致。绝对 NMSE 在各场景间不同，因为郊区与农村信道的多径更少、其主导 ST 子空间通常比城市信道更紧凑。对 MMSE 估计，图 6(d)(e)(f) 呈现相似行为：DT 赋能 MMSE 估计器在低 SNR 下接近理想 MMSE 估计器，并相对 ML 估计器与基于指纹的方法取得显著增益；在高 SNR 下则受残余失配限制。

总之，在城市低 SNR 设置下，DT 赋能估计器相对基线取得最高 **10 dB** 的 NMSE 改善；在中等（< 1 m）定位误差下、高 SNR 时与基线性能相当。最终性能上限由 UE 定位精度决定。

**图 6（原文 Fig. 6）：** 三种场景下 DT 赋能 LR 与 MMSE 估计器及基线方法的 NMSE 随 SNR 的变化（\(\sigma_p=1\) m、\(\sigma_g=0.5\)）：(a)–(c) 为城市/郊区/农村的 LR 结果，(d)–(f) 为相应 MMSE 结果。

## VI. 结论

本文研究了宽带 MIMO 系统中 DT 赋能信道估计的鲁棒性：由 RT 提取的站点特定传播特征被用于重建信道协方差特征结构，从而支撑 LR 与 MMSE 估计。通过建立一阶扰动模型，我们表明定位误差诱导的几何失配会扭曲信道子空间，而 EM 标定误差主要影响特征值轮廓。这一结构性差异解释了估计器敏感度的不同：LR 对 EM 扰动内在鲁棒，MMSE 则同时受子空间与特征值失配影响。城市、郊区与农村场景的数值结果确认，所提框架在建筑密度、传播稀疏度与多径丰富度不同的环境中表现一致。在所有场景中，定位不准确都是性能退化的主导来源，而 EM 标定误差影响相对有限。总体而言，结果凸显了准确几何信息在 DT 赋能通信中的关键作用。未来工作将聚焦于把分析扩展到大失配与不完美 3D 场景重建，并把自适应技术集成以缓解实际 DT 系统中的子空间畸变。另一个重要方向是基于测量的验证：在已知 UE 位置进行受控信道测量，可将 RT 重建的协方差特征结构与样本协方差比较，并直接量化现实定位与 EM 标定引起的扰动水平。

## 附录

**附录 A（ST 特征的一阶近似）。** 本附录推导 3D 位移向量小扰动下距离、方位角与俯仰角的一阶 Taylor 近似，用于刻画 ST 特征中的几何不确定性。考虑实值函数 \(g:\mathbb R^3\to\mathbb R\)，其自变量为位置向量；对给定的标称几何作一阶展开即得式 (18)–(25) 中的敏感度表达式（距离对位移的梯度给出式 (18)，方位/俯仰角对位移的梯度经阵列表映射与镜像映射给出式 (20)–(25)）；把这些敏感度按分量组装即得式 (26) 的矩阵 \(\mathbf J\)。

**附录 B（路径增益一阶传播）。**

**A. 反射系数的敏感因子。** 本小节推导反射系数对材料参数（相对介电常数与电导率）的一阶敏感因子。以 TM 极化为例，反射系数幅度如式 (28)–(29) 所示；对介电常数求导即得式 (30) 中的敏感因子 \(c_{p,k}\)，其取值依赖入射角与标称介电常数（在掠射角附近敏感度显著增大）。

**B. 路径增益的一阶传播。** 本小节把各次反射的相对误差沿路径传播，得到路径增益扰动的一阶表达式（式 (31)），并推导其方差（式 (32)）；同时给出多条路径情形下增益扰动协方差的组装方式，为第 IV-B 节与数值实验中的 \(\Delta\boldsymbol\Omega\sim\mathcal N(0,\boldsymbol\Sigma_\Omega)\) 建模提供依据。

## 参考文献（英文原书目）

[1] W. Jiang, B. Han, M. A. Habibi, and H. D. Schotten, "The road towards 6G: A comprehensive survey," IEEE Open Journal of the Communications Society, vol. 2, pp. 334–366, 2021.

[2] A. Brighente, M. Cerutti, M. Nicoli, S. Tomasin, and U. Spagnolini, "Estimation of wideband dynamic mmWave and THz channels for 5G systems and beyond," IEEE Journal on Selected Areas in Communications, vol. 38, no. 9, pp. 2026–2040, 2020.

[3] H. Xie, F. Gao, and S. Jin, "An overview of low-rank channel estimation for massive MIMO systems," IEEE Access, vol. 4, pp. 7313–7321, 2016.

[4] M. Mizmizi, D. Tagliaferri, D. Badini, C. Mazzucco, and U. Spagnolini, "Channel estimation for 6G V2X hybrid systems using multi-vehicular learning," IEEE Access, vol. 9, pp. 95 775–95 790, 2021.

[5] Y. Li, A. S. Madhukumar, Z. Chu, G. Zheng, C.-X. Wang, and K. Yang, "Wideband hybrid-field THz UM-MIMO channel estimation: A dual-attention-aided deep-unfolded Bayesian learning approach," IEEE Transactions on Communications, vol. 74, pp. 6523–6540, 2026.

[6] Y. Li and A. S. Madhukumar, "Hybrid near- and far-field THz UM-MIMO channel estimation: A sparsifying matrix learning-aided Bayesian approach," IEEE Transactions on Wireless Communications, vol. 24, no. 3, pp. 1881–1897, 2025.

[7] Q. Li, M. El-Hajjar, C. Xu, J. An, C. Yuen, and L. Hanzo, "Stacked intelligent metasurface-based transceiver design for near-field wideband systems," IEEE Transactions on Communications, vol. 73, no. 9, pp. 8125–8139, 2025.

[8] A. Wei, Z. Wang, K. Fang, J. Zhang, Y. Dong, L. Yang, and Q. Li, "Near-field beam training design for stacked intelligent metasurface assisted communication systems," IEEE Transactions on Vehicular Technology, pp. 1–6, 2026.

[9] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Communications Surveys & Tutorials, vol. 26, no. 3, pp. 1478–1519, 2024.

[10] X. Lin, L. Kundu, C. Dick, E. Obiodu, T. Mostak, and M. Flaxman, "6G digital twin networks: From theory to practice," IEEE Communications Magazine, vol. 61, no. 11, pp. 72–78, 2023.

[11] L. Cazzella, F. Linsalata, D. Badini, M. Matteucci, M. Magarini, and U. Spagnolini, "High-fidelity RF mapping: Assessing environmental modeling in 6G network digital twins," Computer Networks, p. 111797, 2025.

[12] Y. Fang, S. Xu, C. Fang, S. He, C. Li, Y. Huang, and L. Yang, "High-fidelity digital twin channel modeling for RIS-assisted wireless communication systems," IEEE Transactions on Communications, vol. 74, pp. 6904–6921, 2026.

[13] S. Kamioka, T. Yamazaki, and T. Miyoshi, "Implementation and evaluation of digital twin using LiDAR and 3D city models," in 2025 1st International Conference on Consumer Technology (ICCT-Pacific), 2025, pp. 1–3.

[14] C. Ruah, O. Simeone, J. Hoydis, and B. Al-Hashimi, "Calibrating wireless ray tracing for digital twinning using local phase error estimates," IEEE Transactions on Machine Learning in Communications and Networking, vol. 2, pp. 1193–1215, 2024.

[15] F. Ait Aoudia, J. Hoydis, et al., "Sionna RT: Differentiable ray tracing for radio propagation modeling," arXiv preprint, 2023.

[16] M. Zhu, L. Cazzella, F. Linsalata, M. Magarini, M. Matteucci, and U. Spagnolini, "Toward real-time digital twins of EM environments: Computational benchmark for ray launching software," IEEE Open Journal of the Communications Society, vol. 5, pp. 6291–6302, 2024.

[17] Y. Wu, K. Zhang, and Y. Zhang, "Digital twin networks: A survey," IEEE Internet of Things Journal, vol. 8, no. 18, pp. 13 789–13 804, 2021.

[18] H. Luo and A. Alkhateeb, "Digital twin aided compressive sensing: Enabling site-specific MIMO hybrid precoding," in 2024 58th Asilomar Conference on Signals, Systems, and Computers, 2024, pp. 17–21.

[19] J. Morais and A. Alkhateeb, "Localization in digital twin MIMO networks: A case for massive fingerprinting," in 2024 IEEE International Conference on Communications Workshops (ICC Workshops), 2024, pp. 276–281.

[20] H. Luo, S. Jiang, S. R. Khosravirad, and A. Alkhateeb, "Digital twin aided massive MIMO CSI feedback: Exploring the impact of twinning," 2024.

[21] S. Alikhani and A. Alkhateeb, "Digital twin aided channel estimation: Zone-specific subspace prediction and calibration," in 2025 IEEE International Conference on Communications (ICC), 2025.

[22] L. Del Moro, F. Linsalata, M. Mizmizi, M. Magarini, D. Badini, and U. Spagnolini, "Bayesian EM digital twins channel estimation," IEEE Transactions on Wireless Communications, 2025.

[23] L. Del Moro, F. Linsalata, M. Mizmizi, D. Badini, U. Spagnolini, and M. Magarini, "Channel estimation via digital twins with limited accuracy," 2025.

[24] J. Hoydis, F. A. Aoudia, S. Cammerer, F. Euchner, M. Nimier-David, S. T. Brink, and A. Keller, "Learning radio environments by differentiable ray tracing," 2023.

[25] O. Kanhere, H. Poddar, and T. S. Rappaport, "Calibration of NYURay for ray tracing using 28, 73, and 142 GHz channel measurements conducted in indoor and outdoor scenarios," 2023.

[26] M. Gao, X. Yang, M. Zhou, J. Cheng, J. Wang, and D. Niyato, "Uplink pilot allocation for CSI-based single-site indoor positioning," 2024.

[27] E. Björnson and Ö. Demir, Introduction to Multiple Antenna Communications and Reconfigurable Surfaces. Foundations and Trends in Signal Processing, 2024.

[28] E. Björnson, L. Sanguinetti, and M. Debbah, "Massive MIMO with imperfect channel covariance information," in 2016 50th Asilomar Conference on Signals, Systems and Computers, 2016.

[29] G. Bacci, A. Alberto D'Amico, and L. Sanguinetti, "MMSE channel estimation in large-scale MIMO: Improved robustness with reduced complexity," 2019.

[30] F. Fuschini, S. Häfner, M. Zoli, R. Müller, E. M. Vitucci, D. Dupleich, M. Barbiroli, J. Luo, E. Schulz, V. Degli-Esposti, and R. S. Thomä, "Ray tracing modeling and measurements in mmWave bands," 2023.

[31] International Telecommunications Union Radiocommunication Sector, P.2040: Effects of Building Materials and Structures on Radiowave Propagation Above About 100 MHz, ITU-R Recommendation, 2015.

[32] P. A. Lopez, M. Behrisch, L. Bieker-Walz, J. Erdmann, Y.-P. Flötteröd, R. Hilbrich, L. Lücken, J. Rummel, P. Wagner, and E. Wießner, "Microscopic traffic simulation using SUMO," in 2018 IEEE Intelligent Transportation Systems Conference (ITSC), 2018.

[33] Y. Qiu, D. Wu, and Y. Zeng, "CKM-based environment-aware pilot reuse and channel estimation," in 2024 16th International Conference on Wireless Communications and Signal Processing (WCSP), 2024.

## 图注与表注

**图注：** 图 1（DT 赋能信道估计框架）；图 2（用镜像法表示镜面反射：反射路径建模为 BS 与虚拟 UE 镜像之间的 LoS 链路，UE 定位误差经仿射映射传播为 ST 特征的相关扰动）；图 3（投影误差地板随定位误差标准差的变化，不同系统配置）；图 4（城市场景 DT-LR 估计器 NMSE 随 \(\sigma_p\) 的变化，不同 SNR 与 \(\sigma_g\)，实线/虚线对应 \(\sigma_g=0\)/0.5）；图 5（三种场景 DT-MMSE 估计器 NMSE 随 \(\sigma_p\) 的变化）；图 6（三种场景下 DT-LR/DT-MMSE 与基线 NMSE 随 SNR 的变化，\(\sigma_p=1\) m、\(\sigma_g=0.5\)）。图注已随文置于相应小节。

**表注：** 表 I（代表性既有工作与所提框架的比较，含研究主题与是否分析 DT 失配扰动）；表 II（RT 仿真参数）；表 III（城市场景下定位与增益扰动下的相似性度量 \(\eta\)，三种配置 × 6 个扰动水平）——表 II、表 III 已逐格转写，表 I 按原文结构与内容要点转录。

**本页范围与校对状态：** 本页覆盖原文摘要、Index Terms、符号说明、第 I–VI 节全部正文与小节（II-A/B、III-A–C、IV-A–C、V-A–D）、式 (1)–(38)、表 I–III、图 1–6 图注、附录 A/B、参考文献 [1]–[33]（英文原条目）。原文无独立作者简介段。**原文说明 3 处已加注：** ① 式 (1) 右侧原始排版因 PDF 双栏断排，本页按原文结构给出等价形式并注明"原式见 PDF"；② 式 (19)、(21)、(22)、(23)、(25)、(26) 的中间步骤在 PDF 中跨栏断排，本页给出与式 (20)/(24) 同构的关键方差表达式并标注编号；③ 式 (35) 的有效投影项与式 (37) 的完整形式部分跨栏，本页按原文编号与文字定义给出，未改写为臆测公式。逐句逐式终校未做；供后续 QA 重点核对：式 (6)–(9) 的 ST 特征与协方差构造、式 (18)–(26) 的几何敏感矩阵、式 (28)–(32) 的反射系数一阶展开、表 II/III 数值与图 3–6 的实验设置。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
