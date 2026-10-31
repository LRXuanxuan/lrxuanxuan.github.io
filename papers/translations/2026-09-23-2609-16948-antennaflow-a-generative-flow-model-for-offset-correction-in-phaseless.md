---
layout: page
title: "AntennaFlow：相位缺失测量的偏移矫正生成流模型｜中文全文译文"
permalink: /papers/translations/2026-09-23-2609-16948-antennaflow-a-generative-flow-model-for-offset-correction-in-phaseless/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/513389bafd3f710a/) · [原文 arXiv](https://arxiv.org/abs/2609.16948) · [全部目录](/papers/catalog/)

# AntennaFlow：相位缺失天线测试中偏移矫正的生成流模型

**原题：** AntennaFlow: A Generative Flow Model for Offset Correction in Phaseless Antenna Testing  
**作者：** Yongzhi Li¹、Chongting Shen²、Menglin Chen²、Xun Jiang³、Zhengpeng Wang⁴（¹ 新加坡南洋理工大学计算与数据科学学院；² 北京航空航天大学中法工程师学院；³ 电子科技大学计算机科学与工程学院；⁴ 北京航空航天大学电子信息工程学院）  
**版本：** arXiv:2609.16948v1（cs.AI），2026 年 9 月 15 日提交，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—V 节、表 I—表 IV、图 1—图 6 图注与参考文献（英文原条目 17 条）按原文结构录入；逐句逐式终校未做。

## 摘要

近场到远场变换是大口径天线测试的核心，但仍存在两个相互耦合的挑战：毫米波段**相位获取代价高昂**，以及**偏移安装**下违背对中假设。现有方法分别处理这两个问题，需要密集全场数据或偏移向量。本文利用一个关键观察**同时**解决二者：不同偏移下的幅度场是**同一近场的坐标变换视角**。难点在于：在没有相位、也没有偏移向量的条件下，从偏移幅度中恢复对中（center-aligned）场。本文提出 **AntennaFlow**——三阶段框架：**对比学习编码器**把偏移视角映射为偏移不变的嵌入；**确定性流匹配传输**把偏移幅度映射为对中幅度；以及**简化外推技术（SET）**，其 Green 函数 Taylor 展开仅在**对中**场下有效。实验表明，AntennaFlow 能从**稀疏、仅幅度**测量中实现快速、无相位、无需偏移向量的近场—远场（NF–FF）重建，一致优于现有基线并保持物理一致性。

**关键词：** 无相位天线测试；偏移矫正；生成式 AI；对比学习；条件流匹配。

## I. 引言

随着 6G 的兴起 [1]，大规模 MIMO 与相控阵 [2] 等大口径阵列被广泛用于卫星与雷达。大的电尺寸导致 Rayleigh 距离过长，使直接远场测试不切实际。因此近场到远场（NF–FF）变换 [3] 成为主要的空口（OTA）测试手段，可通过近场实现精确测量。

尽管已相当成熟，近场测量在实践中仍面临两个关键挑战：**相位获取**与**偏移摆放** [4]。在毫米波频段，精确相位测量需要稳定的射频电缆与精确同步，导致成本高、采集时间长。为此出现了 ET [5] 与简化外推技术（SET）[6] 等**无相位**方法，从仅幅度数据重建远场，避免相位测量负担。

然而，阵列天线常作为子系统安装在复杂平台（卫星、车辆、雷达罩）上，使其与测量坐标中心的精确对准变得困难，进而降低测得的幅度与相位。TSWE [7] 可补偿偏移安装，SRM [8] 可恢复相位并缓解偏移；但二者采样效率低且依赖偏移向量，限制实际适用性。因此，在无相位设置下能高效处理偏移矫正的方法很少，这促使我们研究**无需偏移向量的偏移矫正**（如图 1 所示）。

我们的解法基于这样一个观察：不同偏移摆放只是同一近场的**坐标变换视角**。难点在于：在没有相位与偏移向量的情况下从偏移幅度恢复对中场。为此 AntennaFlow 用对比学习得到偏移不变的嵌入，用确定性流把偏移幅度映射到对中幅度，再用 SET 从对中输出提取远场。三个阶段因此在 NF–FF 流水线中去除了偏移诱导的误差，且全程从未观测偏移向量或任何相位信息。本工作的主要贡献如下：

- 把无相位 NF–FF 变换与偏移矫正统一为一个**无需相位、无需偏移向量的端到端幅度校准**。
- 以 AntennaFlow 实现之：偏移不变的幅度嵌入、确定性流匹配传输、以及面向对中场的 SET 提取，从而实现高效的 NF–FF 重建。
- 据我们所知，这是**生成式 AI 在 NF–FF 变换中的首次应用**，在真实测量扰动下于重建质量、效率与稳健性方面取得一致增益。

## II. 背景

### A. 天线测试

**1）无相位测试。** 基于 Hansen 球面波展开（SWE）[9] 的球面近场测量是高精度天线测试的基准。然而昂贵且不稳定的相位测量推动了从仅幅度数据重建远场的无相位方法。SRM [8] 通过迭代优化估计等效源，ET [5] 用多项式拟合做增益校准。本文采用**简化外推技术（SET）**[6] 作为核心求解器：它直接拟合幅度衰减曲线，避免迭代局部极小与缓慢推理，并因其对阵列对中的依赖而与本文的校准天然契合。

**2）偏移矫正。** 偏移安装会扩大包围球、增加 Nyquist 采样需求与成本，并导致测量退化。TSWE [7] 需要全场数据，SRM 依赖代价高昂的相位恢复，而 SET 由 Green 公式配合局部 Taylor 展开导出、无法处理偏移。因此现有方法要么需要偏移向量与完整数据，要么需要大量计算。相反，本文利用偏移诱导畸变之间的**共享结构**，学习一个校准映射，在稀疏、无相位测量下完成矫正，且不需要偏移向量输入。表 I 汇总了比较。

**表 I：现有方法与所提方法的比较**（✓ 表示具备该能力，✗ 表示不具备）。

| 能力 | ET | SET | SWE | TSWE | SRM | 本文 |
|---|---|---|---|---|---|---|
| 稀疏采样 | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| 快速推理 | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| 无相位 | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| 偏移矫正 | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| 无需偏移向量 | – | – | – | ✗ | ✗ | ✓ |

### B. 生成式 AI

**1）基于扩散与流模型的图像生成。** 近期基于扩散的生成模型 [10]、[11] 在图像生成 [12] 上取得很强性能。然而本文任务是把偏移近场幅度映射为物理上有意义的对中对应物，而非生成多样图像。基于 SDE 的模型引入随机性——这有利于自然图像生成，却会给精确的近场校准带来不良波动。相反，基于 ODE 的流匹配模型提供**确定性映射**，与本任务要求更契合。

**2）对比学习。** 对比学习通过拉近正对、推远负对来组织表示。在本文设置中，我们在监督对比框架 [13] 下用**天线身份**作为监督信号：把同一天线在不同偏移下的视角作为正例，把不同天线的视角作为负例。这促使编码器捕捉对空间偏移不变的特征，得到稳健的近场表示，支撑无需偏移向量的重建。

## III. 方法

### A. 设计概览

AntennaFlow 的动机来自一个简单的测量事实：偏移摆放并不改变潜在物理近场，只改变其坐标表示。因此核心挑战是在无法获得相位或偏移向量的情况下，从仅幅度测量中恢复**规范的对中场**。为此本文把问题分解为三部分：第一，学习一个**偏移不变表示** $f$，捕捉不同偏移测量间共享的**天线特定特征**；第二，建模一个**确定性条件传输**，把输入幅度场映射为其对中对应物，并以 $f$ 提供不变的结构引导；第三，确保重建场满足下游无相位求解器（SET）所需假设——SET 的公式仅在**对中**条件下有效。三部分共同构成偏移矫正与无相位 NF–FF 变换的端到端流水线（如图 2 所示）。

### B. 用于近场校准的 AntennaFlow

AntennaFlow 使用对比预训练的 ResNet 编码器 [14] 与以其嵌入为条件的 U-Net 流匹配主干 [15]，学习从偏移幅度到对中幅度的确定性传输。

**1）偏移不变的天线嵌入。** 对一批带标签的预训练样本 $\{(X_i,Y_i)\}_{i=1}^{B}$，$X_i$ 表示近场幅度，$Y_i$ 表示天线身份标签（仅在训练阶段可用）；编码表示为 $h_i=E(X_i)$，其中 $E(\cdot)$ 为特征编码器。在该标签分配下，监督对比范式 [13] 成为把每根天线的偏移视角集合压缩为紧簇的直接机制：对每个锚点 $i$，其正例集 $\mathcal P(i)=\{j\ne i\mid Y_j=Y_i\}$ 汇集同一天线的偏移视角，其余 $Y_j\ne Y_i$ 为负例。以温度 $\tau$ 缩放的余弦相似度为

$$
s_{ij}=\frac{h_i^{\top}h_j}{\tau}.\tag{1}
$$

监督 InfoNCE 损失定义为

$$
\mathcal L_{\mathrm{SupCon}}=-\frac{1}{B}\sum_{i=1}^{B}\frac{1}{|\mathcal P(i)|}\sum_{p\in\mathcal P(i)}\log\frac{\exp(s_{ip})}{\sum_{j=1,j\ne i}^{B}\exp(s_{ij})}.\tag{2}
$$

最小化 $\mathcal L_{\mathrm{SupCon}}$ 促使嵌入在不同偏移近场间近似不变。随后一个可学习的 MLP $M(\cdot)$ 产生最终条件嵌入：

$$
f=M\left(E(X_i)\right),\tag{3}
$$

它支撑下一步的确定性传输。

**2）经由条件流匹配的确定性传输。** 给定偏移幅度 $x$ 与其对中对应物 $x_1$，本文学习**条件传输**而非无条件生成。具体地，在噪声先验 $x_0\sim\mathcal N(\mathbf 0,\mathbf I)$ 与 $x_1$ 之间构造位移插值 $x_t=(1-t)x_0+tx_1$，其时间导数给出常数真值速度 $v^{*}(x_t)=\mathrm dx_t/\mathrm dt=x_1-x_0$。速度场 $v_\theta(\cdot,\cdot,f)$ 由 U-Net 参数化，输入插值状态 $x_t$、时间步 $t$ 与条件嵌入 $f$，输出与 $x_t$ 同维的速度向量。模型训练目标为

$$
\mathcal L_{\mathrm{FM}}=\mathbb E_{x_0,x_1,t}\left\lVert v_\theta(x_t,t,f)-v^{*}(x_t)\right\rVert_2^{2}.\tag{4}
$$

关键在于：条件 $f=M(E(x))$ **从输入幅度 $x$ 中提取**，作为天线身份的偏移不变锚点。因此传输是经由 $f$ 以 $x$ 为条件的，而非丢弃输入信息。推理时从 $x_0\sim\mathcal N(\mathbf 0,\mathbf I)$ 出发，以 U-Net 速度场积分：

$$
x_{t_{k+1}}=x_{t_k}+\Delta t\,v_\theta(x_{t_k},t_k,f),\tag{5}
$$

最终状态 $\widehat x_1$ 即生成的样本。

### C. 经由 SET 的远场变换

去除偏移后，本文把 SET [6] 作为 NF–FF 变换模块：AntennaFlow 以多个测量半径下的偏移近场幅度为条件，生成**校准后的近场幅度**。本工作生成 3 个不同距离 $r_1,r_2,r_3$ 下的校准近场图，作为 SET 所需的输入。令 $\widehat x_1(r,\theta,\phi)$ 表示半径 $r$ 处的校准近场幅度。在 AntennaFlow 保证的对中性质下，近场的空间变化由角坐标 $(\theta,\phi)$ 参数化。遵循 SET 表述，把功率密度 $P(r,\theta,\phi)=|\widehat x_1(r,\theta,\phi)|^{2}$ 与 $r^{2}$ 之积用 $r^{-2k}$ 的截断多项式展开建模，该展开来自 Green 函数的 Taylor 展开：

$$
P(r,\theta,\phi)\cdot r^{2}\approx\sum_{k=0}^{K}A'_{2k}(\theta,\phi)\cdot r^{-2k},\tag{6}
$$

其中 $A'_{00}$ 为表示远场辐射特性的零阶截距系数，高阶项刻画近场的**无功与辐射衰减**分量。实践中，对足够大的测量距离，高阶项随 $r^{-2}$ 的幂次迅速衰减，已有工作表明仅用前三项即可获得准确近似：

$$
P(r,\theta,\phi)\cdot r^{2}\approx A'_{00}(\theta,\phi)+\frac{A'_{02}(\theta,\phi)}{r^{2}}+\frac{A'_{04}(\theta,\phi)}{r^{4}}.
$$

为估计远场系数 $A'_{00}$，AntennaFlow 在三个不同中场距离 $r_1,r_2,r_3$ 处生成校准幅度图。对每个距离 $r_m$，定义处理后的观测为

$$
y_m(\theta,\phi)=\left|\widehat x_1(r_m,\theta,\phi)\right|^{2}r_m^{2}=P(r_m,\theta,\phi)\cdot r_m^{2}.\tag{7}
$$

所得观测构成求解多项式系数的线性系统：

$$
\begin{bmatrix}y_1(\theta,\phi)\\ y_2(\theta,\phi)\\ y_3(\theta,\phi)\end{bmatrix}=\begin{bmatrix}1 & r_1^{-2} & r_1^{-4}\\ 1 & r_2^{-2} & r_2^{-4}\\ 1 & r_3^{-2} & r_3^{-4}\end{bmatrix}\begin{bmatrix}A'_{00}(\theta,\phi)\\ A'_{02}(\theta,\phi)\\ A'_{04}(\theta,\phi)\end{bmatrix}.\tag{8}
$$

对每个角像素 $(\theta,\phi)$ 独立求解该系统，得到远场系数 $A'_{00}$。远场方向图 $F(\theta,\phi)$ 随后由该截距项得到：

$$
F(\theta,\phi)\propto\sqrt{A'_{00}(\theta,\phi)}.\tag{9}
$$

该流水线经由与 SET 一致的学习式对中，实现无相位、无偏移的 NF–FF 变换。

### D. 训练数据收集

本文构造合成数据集以建模阵列天线在空间失配下的近场幅度响应。对每根天线，其近场由阵列结构与单元参数唯一确定，并计算为

$$
E(\mathbf r)=\sum_{n=1}^{N}I_nf_n(\theta_n,\phi_n)\frac{e^{-\mathrm jk\left|\mathbf r-(\mathbf r_n+\mathbf d)\right|}}{\left|\mathbf r-(\mathbf r_n+\mathbf d)\right|},\tag{10}
$$

其中 $N$ 为单元数，$I_n$ 为固定单元激励，$f_n(\theta,\phi)$ 为归一化单元方向图，$\mathbf r_n$ 为相对测量中心的单元位置，$\mathbf d$ 为表示阵列失配的**偏移向量**。根据非均匀间距阵列近场合成方面的既有工作 [16]，近场方向图由单元位置、间距与单元参数决定；因此阵列位置或间距的任何变化都会导致不同的近场分布。于是在本工作定义的采样条件与参数空间下，球面域上采样的每个幅度图都来自**唯一**的天线配置，可作为生成模型与后续测量验证的**单解监督目标**。

## IV. 实验与结果

### A. 实验设置

**1）测试数据集。** 为评估对未见天线的泛化，本文构造独立测试集：1200 个由 MATLAB 生成、300 个由全波 FEKO 生成的近场。训练与测试天线**严格不相交**，并在单元类型、间距与孔径尺寸上不同，另含未见的偏移配置。FEKO 数据集引入更丰富的电磁效应与求解器差异，用于评估**跨求解器稳健性**。这些设置共同支持对模型完全未见天线的重建质量、物理保真度与稳健性的全面评估。

**2）评估指标。** 为定量评估 AntennaFlow 在远场与校准近场中重建幅度方向图的质量，本文采用天线测量中的标准指标**等效杂散信号（ESS）**[17]：它把重建误差解释为叠加在目标方向图上的等效杂散辐射场。令 $E_{\mathrm{rec}}(\theta)$ 与 $E_{\mathrm{ref}}(\theta)$ 分别表示重建与参考方向图的归一化幅度（可在近场固定测量半径或远场定义）。遵循 [6]，角度 $\theta$ 处的 ESS 定义为

$$
\mathrm{ESS}(\theta)=20\log_{10}\left(E_{\mathrm{ref}}(\theta)\right)+20\log_{10}\left[\frac{1-10^{-\Delta_{\mathrm{dB}}(\theta)/20}}{2}\right],\tag{11}
$$

其中 $\Delta_{\mathrm{dB}}(\theta)=20\log_{10}(E_{\mathrm{rec}}(\theta))-20\log_{10}(E_{\mathrm{ref}}(\theta))$ 表示以 dB 计的方向图差异。ESS 用其**均方根（RMS）**与**峰值（Peak）**评估：RMS ESS 越低表示整体重建保真度越好，Peak ESS 反映最大局部偏差。按设计，ESS 对高能量区域的误差更敏感、对物理相关性有限的低能量区域差异较不敏感，因而强调影响辐射特性的偏差，更好反映物理场行为而非局部数值伪影；因此它能有效刻画重建误差对旁瓣电平等关键特征的影响。

**3）比较方法。** 为严格验证所提框架，本文与 SET、TSWE、SRM 比较，评估近场与远场重建质量。

### B. 结果

**1）定量分析。** 如图 3 所示，现有方法在偏移条件下退化：SET 产生方向图偏移，TSWE 未能恢复主瓣，SRM 出现旁瓣畸变。相反，AntennaFlow 在整个角谱上与真值精确对齐、ESS 低，展示了无相位设置下对偏移的稳健性，并保持了包括主瓣与旁瓣在内的物理一致辐射特性。表 II 进一步表明 AntennaFlow 在两个数据集上都取得最低的 RMS 与 Peak ESS，说明重建质量更优、误差集中在较不重要区域；同时其推理远比 TSWE 与 SRM 快、与 SET 相当，在保真度与效率上兼具优势。

**表 II：远场重建精度的定量比较（RMS ESS 与 Peak ESS，单位 dB；↓ 表示越低越好）。**

| 数据集 | 指标 | SET | TSWE | SRM | 本文 |
|---|---|---|---|---|---|
| MATLAB | RMS ESS (↓) | −18.97 | −28.37 | −34.44 | **−36.90** |
| MATLAB | Peak ESS (↓) | −6.91 | −18.48 | −24.32 | **−27.06** |
| FEKO | RMS ESS (↓) | −18.28 | −25.25 | −29.70 | **−33.81** |
| FEKO | Peak ESS (↓) | −8.42 | −15.34 | −18.33 | **−25.58** |
| – | 推理时间 | **4 s** | 10 min | 30 min | 9 s |

**2）可视化结果。** 为评估重建保真度，本文对远场（图 4）与近场（图 5）结果做比较分析。在远场，本方法相比 SET、TSWE、SRM 质量更优：它从仅幅度数据中矫正严重失配并重建高保真方向图，同时保持主瓣与旁瓣。在近场，图 5 把同一天线的多种偏移摆放与其重建、真值分组展示：尽管偏移各异，重建结果收敛到几乎相同的对中场并与真值高度吻合。这种在异构偏移输入下的一致性，是 AntennaFlow 提取天线偏移不变嵌入并重建其近场幅度的直接视觉证据，而这正是下游 SET 提取所依赖的性质。

**表 III：对比预训练效果的消融研究。**

| CL 使用情况 | NF RMS | NF Peak | FF RMS | FF Peak |
|---|---|---|---|---|
| 无 CL | −25.74 | −19.18 | −24.43 | −16.46 |
| 有 CL | −34.39 | −26.40 | −33.81 | −25.58 |

### C. 学习到的嵌入与重建的验证

AntennaFlow 的两个要点——偏移不变的嵌入与以其为条件的确定性流匹配传输——共同承担把偏移幅度转换为对中幅度的任务。本文通过三项互补检查验证各部分按预期工作。

第一，用 t-SNE 可视化 24 根天线的偏移样本嵌入（图 6），验证编码器捕捉偏移不变特征：不同天线的嵌入被良好分离，同一天线在不同偏移下的嵌入形成紧簇，证实编码器捕捉到对偏移不变的天线特定特征。

第二，检查该嵌入是否足以驱动确定性流匹配传输回到对中场。如图 5 所示，同一天线不同偏移的重建几乎相同并与真值高度吻合；NF ESS 与 FF ESS 评估进一步表明重建场在保持关键信息的同时保持物理一致。

第三，通过**移除对比预训练并端到端重训**做消融。如表 III 所示，所有指标均退化，证实对比预训练在提取偏移不变特征中的关键作用。

### D. 仿真到真实的稳健性评估

为便于部署到 OTA 天线测试，本文显式评估由**探头相关测量响应**与**环境噪声**造成的仿真—真实差距。为近似真实测量条件，引入两类代表性扰动：(1) **探头失配**——使用喇叭与偶极子探头模拟真实采样条件与实验室常见情形；(2) **加性噪声**——用于建模硬件不完美与环境不确定性带来的耦合效应与多径干扰。这些因素构成仿真与真实 OTA 测量之间的主要差异来源。如表 IV 所示，AntennaFlow 在这些扰动下保持稳定，重建精度仅有轻微退化，表明其对真实测量条件具有强稳健性，能够有效泛化到理想化仿真之外。

**表 IV：仿真到真实的稳健性评估（RMS ESS 与 Peak ESS，单位 dB）。**

| 扰动 | NF RMS | NF Peak | FF RMS | FF Peak |
|---|---|---|---|---|
| 默认 | −35.39 | −26.40 | −33.81 | −25.58 |
| 喇叭探头 | −33.94 | −25.89 | −32.67 | −24.50 |
| 偶极子探头 | −34.28 | −24.48 | −32.91 | −24.81 |
| 加性噪声 | −33.49 | −25.18 | −31.07 | −23.67 |

## V. 结论

本文提出 AntennaFlow，其出发点是测量坐标系中的一个基本事实：同一天线在偏移安装下的测量只是同一物理近场的不同坐标视角。特征编码器把这一事实转化为可直接从偏移安装的幅度测量中提取的偏移不变嵌入；以该嵌入为条件的确定性流匹配传输重建对中近场；而恢复的对中性恰是 SET 完成无相位、无需偏移向量 NF–FF 重建所需的前提。AntennaFlow 优于本文比较中最强基线 SRM，为现代 OTA 天线测试提供了准确、高效、低复杂度的方案。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 17 条，源文 p. 6）。

[1] W. Jiang, B. Han, M. A. Habibi, and H. D. Schotten, "The road towards 6G: A comprehensive survey," IEEE Open Journal of the Communications Society, vol. 2, pp. 334–366, 2021.

[2] E. Björnson, L. Sanguinetti, H. Wymeersch, J. Hoydis, and T. L. Marzetta, "Massive MIMO is a reality—what is next?: Five promising research directions for antenna arrays," Digital Signal Processing, vol. 94, pp. 3–20, 2019.

[3] O. M. Bucci, F. D'Agostino, C. Gennarelli, G. Riccio, and C. Savarese, "Near-field–far-field transformation with spherical spiral scanning," IEEE Antennas and Wireless Propagation Letters, vol. 2, pp. 263–266, 2005.

[4] M. Sørensen, O. Franek, G. F. Pedersen, A. Radchenko, K. Kam, and D. Pommerenke, "Estimate on the uncertainty of predicting radiated emission from near-field scan caused by insufficient or inaccurate near-field data: Evaluation of the needed step size, phase accuracy and the need for all surfaces in the Huygens' box," in International Symposium on Electromagnetic Compatibility-EMC EUROPE. IEEE, 2012, pp. 1–6.

[5] A. Newell, R. Baird, and P. Wacker, "Accurate measurement of antenna gain and polarization at reduced distances by an extrapolation technique," IEEE Transactions on Antennas and Propagation, vol. 21, no. 4, pp. 418–431, 1973.

[6] L. Yu, F. Zhang, Y. Zhang, X. Zhang, Z. Wang, Y. Jing, and W. Fan, "Antenna pattern reconstruction based on mid-field phaseless measured data using simplified extrapolation technique," IEEE Transactions on Antennas and Propagation, 2025.

[7] R. Cornelius and D. Heberling, "Spherical wave expansion with arbitrary origin for near-field antenna measurements," IEEE Transactions on Antennas and Propagation, vol. 65, no. 8, pp. 4385–4388, 2017.

[8] A. Paulus, J. Knapp, and T. F. Eibert, "Phaseless near-field far-field transformation utilizing combinations of probe signals," IEEE Transactions on Antennas and Propagation, vol. 65, no. 10, pp. 5492–5502, 2017.

[9] J. E. Hansen, Spherical Near-Field Antenna Measurements. IET, 1988, vol. 26.

[10] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," Advances in Neural Information Processing Systems, vol. 33, pp. 6840–6851, 2020.

[11] Y. Lipman, R. T. Chen, H. Ben-Hamu, M. Nickel, and M. Le, "Flow matching for generative modeling," arXiv preprint arXiv:2210.02747, 2022.

[12] Y. Li, S. Zhang, Y. Chen, B. Li, Y. Zhang, and X. Du, "SpotDiff: Spotting and disentangling interference in feature space for subject-preserving image generation," arXiv preprint arXiv:2510.07340, 2025.

[13] P. Khosla, P. Teterwak, C. Wang, A. Sarna, Y. Tian, P. Isola, A. Maschinot, C. Liu, and D. Krishnan, "Supervised contrastive learning," Advances in Neural Information Processing Systems, vol. 33, pp. 18 661–18 673, 2020.

[14] K. He, X. Zhang, S. Ren, and J. Sun, "Deep residual learning for image recognition," in Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, 2016, pp. 770–778.

[15] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," in International Conference on Medical Image Computing and Computer-Assisted Intervention. Springer, 2015, pp. 234–241.

[16] M. Narasimhan and B. Philips, "Synthesis of near-field patterns of a nonuniformly spaced array," IEEE Transactions on Antennas and Propagation, vol. 35, no. 11, pp. 1189–1198, 1987.

[17] D. W. Hess, "Historical background on the use of equivalent stray signal in comparison of antenna patterns," in Proceedings of the 5th European Conference on Antennas and Propagation (EUCAP). IEEE, 2011, pp. 2522–2526.

## 图注与表注

**图 1：偏移安装下远场重建的比较。** 先前方法要么对偏移敏感、要么依赖偏移向量，而 AntennaFlow 取得更优的重建质量。图中比较了 TSWE、SRM 与本文方法在相同偏移近场输入下的推理结果与远场重建：TSWE 因偏移而严重失真，SRM 以伪影为主、仅部分恢复，本文方法重建良好；并标注各方法的推理速度（快/慢）与是否需要对偏移向量。

**图 2：用于 NF–FF 变换的 AntennaFlow 流水线。** (1) **数据采集**：从不同天线配置采样近场数据。(2) **特征编码器**用监督对比学习框架训练，以学习具判别性的表示。(3) **流匹配传输**：采用基于 U-Net 的架构学习用于对中近场生成的流匹配速度场。(4) **经由 SET 的远场重建**：注意 SET 需要来自多个不同表面的测量，为简洁图中只画出一个表面。

**图 3：使用不同无相位重建方法的天线远场重建比较。** 红色实线为重建远场方向图，黑色虚线为理论远场参考，青色曲线为相应的 ESS。

**图 4：偏移条件下重建远场幅度方向图的可视化比较。** 从左到右依次为 SET、TSWE、SRM、AntennaFlow 与真值；AntennaFlow 在恢复细节方向图纹理方面与真值最接近（高保真）。

**图 5：由偏移近场测量重建。** 不同偏移输入（上）被映射为一致的对中场（下），并与真值（左）对比。

**图 6：768 个幅度样本编码器嵌入的 t-SNE 投影**，样本来自 24 种不同天线配置、在随机偏移下采集；颜色表示天线身份。同一天线的样本落入紧簇，不同天线的簇清晰分离。

**表注：** 表 I 为现有方法与所提方法的能力比较（稀疏采样、快速推理、无相位、偏移矫正、无需偏移向量）；表 II 为远场重建精度的定量比较（MATLAB 与 FEKO 两数据集上的 RMS/Peak ESS 及推理时间）；表 III 为对比预训练效果的消融（NF/FF 的 RMS/Peak ESS）；表 IV 为仿真到真实的稳健性评估（默认、喇叭探头、偶极子探头、加性噪声四类扰动下的 NF/FF 的 RMS/Peak ESS）。原文表 II—表 IV 以粗体标出最优值。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.16948v1（cs.AI，2026-09-15）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（大口径阵列测试背景、相位获取与偏移摆放两大挑战、相关工作 ET/SET/TSWE/SRM、核心观察与三项贡献）；第 II 节背景（II-A 天线测试：无相位测试与偏移矫正 + 表 I；II-B 生成式 AI：扩散/流模型与对比学习）；第 III 节方法（III-A 设计概览；III-B 近场校准：偏移不变嵌入与式 (1)—(3)、条件流匹配与式 (4)—(5)；III-C 经由 SET 的远场变换与式 (6)—(9)；III-D 训练数据收集与式 (10)）；第 IV 节实验与结果（A 设置：测试数据集、ESS 指标与式 (11)、比较方法；B 结果：定量分析与表 II、可视化；C 嵌入与重建验证 + 表 III；D 仿真到真实 + 表 IV）；第 V 节结论；17 条英文参考文献；表 I—表 IV 表注与图 1—图 6 图注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言、图 1）→ 第 2 页（引言续、贡献、第 II 节、表 I）→ 第 3 页（第 III 节、式 (1)—(5)、图 2）→ 第 4 页（式 (6)—(11)、第 IV 节 A 设置）→ 第 5 页（图 3—图 5、表 II、结果与表 III）→ 第 6 页（图 6、表 IV、仿真到真实、第 V 节结论、参考文献 [1]—[17]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I—表 IV 的全部条目/数值已按 PDF 第 2、5、6 页渲染图逐项核对（表 II 的 −18.97/−28.37/−34.44/−36.90 等、表 III 的 −25.74/−34.39 等、表 IV 的 −35.39/−33.94/−34.28/−33.49 等），未改变任何数值。
2. 图 1—图 6 均未上传图片；本页以"图注与表注"小节统一给出 6 条中文图注与 4 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖原文编号式 (1)—(11)，全部保留原编号；其中式 (6)—(9) 为 SET 的外推公式链。
4. **原文疑点／说明：** ①原文在式 (6) 前把 $A'_{2k}$ 的 $k=0$ 项记作 $A'_{00}$、$k=1$ 记作 $A'_{02}$、$k=2$ 记作 $A'_{04}$（下标并非 $2k$ 而是"偶次项编号"），译文照录该记号；②第 III-C 节明确"为简洁图中只画出一个测量表面"，而 SET 需要多个不同表面的测量，译文保留该说明；③第 IV-C 节称"三项互补检查"：t-SNE 聚类、流匹配重建一致性、移除对比预训练的消融，译文按原文顺序给出；④第 IV-D 节的第 (2) 项扰动在原文表述中被截断为"introduced to model coupling effects..."（缺主语），译文按上下文补为"加性噪声用于建模…"并在表 IV 中对应 "Additive noise" 行；⑤表 II 的推理时间行在原文首列为 "–"，译文照录。
5. 原文为 arXiv 预印本（cs.AI），6 页（短文）；页面目录日期 2026-09-23 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-15）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
