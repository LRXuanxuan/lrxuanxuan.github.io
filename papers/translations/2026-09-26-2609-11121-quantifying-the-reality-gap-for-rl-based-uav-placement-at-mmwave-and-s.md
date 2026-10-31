---
layout: page
title: "毫米波与亚太赫兹下强化学习无人机部署的现实差距量化｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-11121-quantifying-the-reality-gap-for-rl-based-uav-placement-at-mmwave-and-s/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/f729f51b05c314a8/) · [原文 arXiv](https://arxiv.org/abs/2609.11121) · [全部目录](/papers/catalog/)

# 毫米波与亚太赫兹下强化学习无人机部署的现实差距量化

**原题：** Quantifying the Reality Gap for RL-Based UAV Placement at mmWave and Sub-THz  
**作者：** Abdullateef Almohamad、Mostafa Ibrahim、Sabit Ekin、Khalid Qaraqe  
**单位：** 得克萨斯 A&M 大学电气与计算机工程系（College Station, TX, USA）；卡塔尔哈马德·本·哈利法大学科学与工程学院（Doha, Qatar）。  
**版本：** arXiv:2609.11121v1（eess.SY），v1 日期 2026 年 9 月 10 日；原文 7 页。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.11121v1 [eess.SY] 10 Sep 2026"，与库内登记编号 2609.11121 一致；首页无独立资助脚注（致谢在文末），作者邮箱为 abdullateef.almhd@tamu.edu。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–V 节正文与编号小节、图 1–4 中文图注、表 I–II 逐格转写、致谢、参考文献 17 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

毫米波与亚太赫兹网络中无人机（UAV）部署的强化学习（RL）策略通常只在简化的解析信道上训练。我们在卡塔尔多哈的真实城市地图上量化由此产生的仿真到现实（sim-to-real）差距，载波取 {28, 140, 183, 300} GHz、高度取 {50, 75, 100, 125} m，并评估三种信道管线：解析模型（自由空间路径损耗 FSPL + 大气吸收 + 立方体视距 LoS）、Sionna RT 中带 ITU-R P.676-13 吸收的全 Monte-Carlo 射线追踪，以及在闭式路径增益表达式下复用 Sionna 网格的确定性 LoS 混合管线。我们通过四个指标在空间 SNR 分布上形式化该差距：偏差、RMSE、Jensen–Shannon 散度与最优部署位移。由此得到三点发现：在 28/140 GHz，表观 −5.6/−4.8 dB 的 Sionna 偏差中约 70% 是 Monte-Carlo 欠采样，缓解后缩小到 −1.7/−1.5 dB；在 183 GHz，−9.2 dB 的残差分离出大气吸收与 ITU-R P.676 线形之间的不一致；在 300 GHz，随机射线追踪与解析模型的一致只是巧合，确定性 LoS 管线暴露出 +3.8 dB 的结构性偏移。在所有载波上，解析信道训练所得策略的线性域遗憾值始终 ≥ 0.93，表明实际接近最优，但存在应按载波分别报告的 SNR 偏差，值得显式说明。

**索引词：** 无人机网络、SAG 网络、强化学习、射线追踪、太赫兹通信、仿真到现实、现实差距、Sionna、ITU-R P.676。

## I. 引言

空地一体化（space–air–ground，SAG）网络是 6G 愿景的核心架构要素，无人机（UAV）与高空平台被定位为密集低地球轨道星座与地面用户之间的敏捷中继 [1]。随着 6G 业务从毫米波（mmWave，30–100 GHz）进入亚太赫兹（sub-THz，100–300 GHz）频段 [2], [3]，传播信道同时变得高度方向性与强载波选择性。在 28 GHz 下给出较宽准全向覆盖的同一城市几何，在 300 GHz 下坍缩为一条细窄的视距（LoS）服务壳层；在 300 GHz 处大气吸收可达 10 dB km⁻¹ 至 50 dB km⁻¹ [4]，并主导链路预算。因此中继放在哪里成为一个具有显著地形结构的逐载波优化问题。

概率 LoS 下的闭式高度与三维部署分析 [1], [5], [6]，以及多 UAV 情形的凸松弛 [7]，早于基于学习的方法，但通常假设频率平坦信道，难以干净地扩展到亚太赫兹——那里吸收强频率选择性并由大气共振结构化。强化学习（RL）此后成为 UAV 部署与轨迹的灵活工具 [8], [9]，但其训练需要真实测量或全波射线追踪无法提供的信道评估量。惯常的折中是：在简化解析信道上训练，再在高保真参考上验证学到的策略；而多数既有 RL 工作在同一个仿真器内训练与评估，因此任何与物理级信道的分歧都被沉默地掩盖。这种分歧就是机器人学中已被充分研究的仿真到现实（sim-to-real）或"现实差距"在无线领域的对应物 [10], [11]：当训练信道与验证信道的最优解不一致时，策略无法迁移。

有三点观察促成这项工作。第一，针对太赫兹 UAV 网络的定量现实差距研究很少：现有工作或者比较不同解析模型，或者把射线追踪限制在固定发射位置，或者只考虑单一载波。第二，Sionna RT 的开源发布 [12]——一个 GPU 加速、可微、带 ITU-R P.676-13 大气吸收 [4] 的 Monte-Carlo 射线追踪器——如今使大规模载波感知城市射线追踪变得可行，从而可在物理级信道上重放同一 RL 评估。第三，解析太赫兹模型常用的 100–450 GHz Kokkoniemi–Lehtomäki 吸收拟合 [13]（六条 Lorentzian 共振线加多项式水汽连续项）在远离强吸收线处精确到每公里几 dB 以内，但在 183 GHz 水汽与 325 GHz 氧气共振附近可能与 ITU-R P.676-13 有实质偏差；此外，标准 Monte-Carlo 射线追踪管线引入非平凡的采样伪影，若不校正，它会伪装成物理分歧，把表观差距放大一个数量级。

我们的目标是：定量、逐载波地表征"在解析信道训练所得 RL UAV 部署策略对抗射线追踪信道部署时"所产生的现实差距，并把 Monte-Carlo 采样伪影与真实物理分歧分离开来，使从业者知道针对给定载波应升级仿真栈的哪个部分。为此，本文有四方面贡献。(i) 在真实城市地图上为 RL 驱动的 UAV 部署提供可复现的现实差距基准，覆盖四个载波 {28, 140, 183, 300} GHz 与四个高度 {50, 75, 100, 125} m。(ii) 基于逐部署 SNR 分布的位置分布现实差距框架，含四个操作指标——偏差、RMSE、Jensen–Shannon（JS）散度与最优部署位移——分别解耦系统性偏移、分布扩散与决策级误差，并辅以直接量化策略迁移代价的线性域遗憾比。(iii) 确定性 LoS 管线：在闭式路径增益表达式下复用 Sionna 的网格几何，从而把表观 Monte-Carlo 差距精确分解为采样诱导分量与物理诱导分量。(iv) 刻画"何时解析信道训练的策略能迁移到射线追踪"：28/140 GHz 由采样主导，183 GHz 由吸收模型主导，300 GHz 则在巧合性小偏差下结构不同。

本文其余部分组织如下：第 II 节形式化三种信道管线与部署 MDP；第 III 节描述 RL 训练、Sionna 处理与现实差距框架；第 IV 节报告数值结果；第 V 节总结。

## II. 系统模型

一架单旋翼 UAV 在密集城区上方固定高度 z 悬停，为服务区内均匀分布的地面用户提供宽带下行覆盖。两端均假设为各向同性单天线终端；后两条假设可在本研究的扩展版本中放松。

UAV 工作在单一载波 fc∈{28, 140, 183, 300} GHz（覆盖毫米波到亚太赫兹），并处于高度 z∈{50, 75, 100, 125} m 之一。由于阻塞与吸收强依赖载波，最优悬停位置随 fc 变化，因此多频段 UAV 仍需解决四个独立部署问题，我们对每个问题各用一个专用 RL 智能体处理（§II-D）。运营商的任务是选择悬停位置 pu=(ux,uy,z)，最大化向地面用户群体提供的总信号质量；对用户求和是 UAV 部署中标准的、不考虑公平性的覆盖目标。本节其余部分形式化几何、三种信道管线以及驱动 RL 奖励与现实差距分析的逐位置 SNR 分布。

### A. 几何与建筑模型

服务区为卡塔尔多哈市中心 3.75 km × 1.98 km 的区域，在均匀笛卡尔网格 G={(x,y): 0≤x<Gx, 0≤y<Gy} 上离散，Gx=375、Gy=198，单元尺寸 Δ=10 m。UAV 工作在四个高度 Z={50, 75, 100, 125} m 之一，以 z 索引。建筑几何从三角化三维网格（STL）提取，并预处理为轴对齐立方体；当其底面相邻且高度相近（相差 1 m 以内）时迭代合并，以减少建筑数量与计算代价；所得逐单元高度图 h: G→R≥0 只允许 h(x,y)<z 的位置可部署，定义安全部署集合

$$
\mathcal P_z=\left\{\mathbf p_u=(u_x,u_y,z):\ h(u_x,u_y)<z\right\}, \tag{1}
$$

载波以 f∈{0,1,2,3} 索引，分别对应 fc∈{28, 140, 183, 300} GHz。

### B. 三种信道管线

对 UAV 位置 pu 与地面单元 pr=(rx,ry,0)，链路距离 d≜‖pu−pr‖₂，我们评估三种信道管线：解析（M）、Sionna 随机射线追踪（S）与 Sionna 确定性（L），每种对 i∈I≜{M,S,L} 产生线性路径增益 gi(pu,pr,fc)。

**1) 解析管线（M）。** 解析管线把链路增益表示为三个因子的乘积：自由空间路径损耗（FSPL）、分子吸收与几何 LoS 指示：

$$
g_{\mathcal M}(\mathbf p_u,\mathbf p_r,f_c)=\underbrace{\left(\frac{c}{4\pi f_cd}\right)^2}_{\mathrm{FSPL}}\cdot\underbrace{e^{-\frac12d\,\Sigma_K(f_c)}}_{\text{吸收}}\cdot\underbrace{\mathbb 1\left[\mathrm{LoS}_{\mathrm{cube}}(\mathbf p_u,\mathbf p_r)\right]}_{\mathrm{LoS}}, \tag{2}
$$

其中 c 为光速。吸收系数 ΣK(fc) 为简化的 100–450 GHz Kokkoniemi–Lehtomäki 分子吸收拟合 [13]，由六条 Lorentzian 共振线与多项式水汽连续项组成，在标准大气 T=293.15 K、p=1013 hPa、相对湿度 ϕ=0.5 下求值。LoS 谓词 LoS_cube 是针对合并轴对齐立方体建筑表示的 2.5 维屋顶投影阻塞测试；非 LoS 单元获得零线性增益，即不考虑反射或散射。

> **原文疑点：** 正文称该吸收拟合由"六条 Lorentzian 共振线"组成，但紧接其后只列出五个频率（183.3、325.2、380.4、439.5 与 448.2 GHz），第六条的频率未在文中给出；此处按原文照录并加注。

**2) 随机射线追踪管线（S）。** 随机管线在实际网格几何上用物理级评估替换 M 的闭式简化。Sionna RT [12] 在由同一数据集导出的闭合网格三角化建筑表示上执行 Monte-Carlo 路径追踪：每个 UAV 位置 Ns=10⁵ 条射线、最大反弹深度 D=1、仅镜面反射（不含衍射或散射）；省略衍射与漫散射会低估建筑边缘附近的非 LoS 能量。大气吸收遵循 ITU-R P.676-13 [4]，参数为 (T, p, 水汽密度 ρw=12 g m⁻³)；材料电特性 (εr, σ) 取自 ITU-R P.2040 数据库 [14]。大气衰减在射线追踪调用之后按逐地面单元距离施加。

**3) 确定性 LoS 管线（L）。** 为把采样诱导效应与真实建模差异分离，我们引入第三条管线：在确定性 LoS 测试下复用 Sionna 的网格几何。路径增益以闭式给出：

$$
g_{\mathcal L}(\mathbf p_u,\mathbf p_r,f_c)=\left(\frac{c}{4\pi f_cd}\right)^2e^{-\frac12d\,\gamma_{\mathrm{ITU}}(f_c)}\,\mathbb 1\left[\mathrm{LoS}_{\mathrm{mesh}}(\mathbf p_u,\mathbf p_r)\right], \tag{3}
$$

其中 LoS_mesh 是 Mitsuba [15] 中实现的确定性射线–AABB（轴对齐包围盒）遮挡测试，γ_ITU(fc) 是 ITU-R P.676-13 比衰减系数。按构造，L 与 S 共享几何与吸收物理，但既不暴露 Monte-Carlo 方差也不含多次反弹反射；因此它是一个干净的消融点，把 M 与 S 之间的两类分歧——几何/物理与采样效应——解耦。

**4) 逐位置聚合路径损耗。** 对每条管线 i∈I，UAV 位置 pu 处的聚合路径损耗为

$$
\mathrm{PL}^i(\mathbf p_u,f_c)=-10\log_{10}\left(\frac{1}{|\mathcal G|}\sum_{\mathbf p_r\in\mathcal G}g_i(\mathbf p_u,\mathbf p_r,f_c)\right)\ [\mathrm{dB}], \tag{4}
$$

它描述 UAV 向均匀分布地面用户群体提供的平均线性增益。由于 (4) 对发射功率不变，三条管线以相同方式校准，任何分歧反映的是信道建模而非链路预算选择。

### C. 逐位置 SNR 与部署分布

给定通用的载波相关链路预算 (Pt, Gt, Gr, η, B(fc))，管线 i∈I 下的逐位置接收 SNR 为

$$
\mathrm{SNR}^i(\mathbf p_u,f_c)=P_t+G_t+G_r-\mathrm{PL}^i(\mathbf p_u,f_c)-N_0(f_c), \tag{5}
$$

热噪声底 N0(fc)=−174+10log₁₀B(fc)+η dBm。把 UAV 位置视为 Pz 上的均匀随机变量，得到经验位置分布 SNR

$$
\Phi^i_{z,f}\triangleq\left\{\mathrm{SNR}^i(\mathbf p_u,f_c):\ \mathbf p_u\in\mathcal P_z\right\}, \tag{6}
$$

它正是我们现实差距分析的中心对象。

### D. UAV 部署作为马尔可夫决策过程

我们把部署建模为离散网格上的有限时域 MDP ⟨X, A, P, r, γrl⟩。状态 xt∈[0,1]⁹ 编码归一化 UAV 位置、四方向遮挡射线投射距离、局部信号质量与剩余时间；动作集 A={hover, ±x, ±y, ±z} 的基数为 7；转移 P 是确定性的；折扣 γrl=0.995；每步奖励为

$$
r_t=\underbrace{w_s s_t+w_c c_t}_{r_{\mathrm{quality}}\in[0,1]}+\underbrace{\alpha(q_t-q_{t-1})\mathbb 1[a_t\neq\text{hover}]}_{r_{\mathrm{shape}}}+\underbrace{\beta q_T\mathbb 1[t=T]}_{r_{\mathrm{terminal}}}, \tag{7}
$$

其中 ws=0.6、wc=0.4、α=0.5、β=5、回合时域 T=500，质量代理 qt=ws st+wc ct。信号代理 st∈[0,1] 是 PL^M 在 Pz 上的 min-max 归一化；覆盖代理 ct∈[0,1] 是 G 上的 LoS 占比；与建筑碰撞则终止回合并给奖励 −10。

## III. 方法

### A. RL 训练

对每个载波，我们在式 (2) 的解析信道上用 Stable-Baselines3 [17] 训练一个独立 PPO 智能体 [16]。超参数：Ne=8 个并行环境、T_tot=3×10⁶ 环境步、线性退火学习率 3×10⁻⁴→1×10⁻⁵、GAE λ=0.95、裁剪范围 0.2、小批量 512、熵系数 0.01、2×128-tanh MLP 策略。奖励用滑动估计器归一化；观测不归一化（已在 [0,1]⁹ 内）。每个策略在单块 RTX 级 GPU 上约 4 h 收敛。训练好的策略随后在三种信道管线下评估，不再微调。

### B. Sionna 预计算

在每个 RL 步调用射线追踪在计算上不可行。我们改为在跨步子网格（x、y 方向步长 σ=5）上预计算四维张量 PL^S∈R^{4×4×Gx×Gy}，再双线性插值到全分辨率。经式 (1) 的建筑高度掩码后，每个高度得到 |Pz|≈1.6×10⁴ 个可部署位置。每次 Sionna 调用以 §II-B2 的参数调用 RadioMapSolver；ITU-R P.676-13 吸收在射线追踪步之后按逐地面单元距离施加，确保整个网格处理一致。在 Colab L4 GPU 上每个载波总预计算时间约 3 h。

### C. 采样诱导偏差与确定性 LoS 构造

随机 Sionna 管线仅当至少一条射线到达某地面单元时才把该单元标记为覆盖。由于 Ns=10⁵ 条射线在 4π 球面上发射，链路距离 d 处面积为 Δ² 的地面单元张开的立体角约为 Δ²z/d³，期望射线命中数 n̄(d)≈NsΔ²z/(4πd³)；因此按 Poisson 近似，超过临界距离 dc=(NsΔ²z/4π)^{1/3}（此时 n̄=1）的单元被漏掉的概率趋近于 1。在 z=100 m 时 dc≈430 m：UAV 周围良好采样的圆盘仅占服务区约 7%，与 S 的经验 LoS 覆盖约 0.06、而 M 约 0.70 一致，且 dc∝z^{1/3} 的标度复现了表 I 的高度趋势。我们强调 §III-E 的采样/物理分解直接由经验 S–L 比较测得，并不依赖该模型。为把这一 Monte-Carlo 伪影与真实建模差异分离，我们评估式 (3) 的确定性 LoS 管线：向每个地面单元中心投射一条射线，对 Mitsuba 场景图测试遮挡，并由确定性 LoS 图、FSPL 与 ITU-R P.676 吸收以闭式构造完整 PL^L 张量，无 Monte-Carlo 方差，计算量仅为随机管线的一小部分。

### D. 现实差距框架

令 Φ^i_{z,f} 表示管线 i∈I 下的经验位置分布 SNR（式 (6)），令 T∈{S,L} 索引射线追踪目标。我们通过四个解耦系统性偏移、分布扩散与决策级误差的现实差距指标，量化解析参考 M 与 T 的分歧：平均偏差 (8) 捕获系统性 dB 偏移；逐位置 RMSE (9) 捕获围绕偏差的逐点扩散；Jensen–Shannon 散度 (10) 捕获群体层面的分布分歧；最优部署位移 (11) 捕获逐管线 argmax 之间的决策级误差。线性域遗憾比 (12) 把位移换算为操作性的 SNR 代价。

$$
\mathrm{bias}^{\mathcal T}_{f,z}\triangleq\mathbb E_{\mathbf p_u\sim\mathcal U(\mathcal P_z)}\left[\mathrm{SNR}^{\mathcal T}-\mathrm{SNR}^{\mathcal M}\right], \tag{8}
$$

$$
\mathrm{RMSE}^{\mathcal T}_{f,z}\triangleq\sqrt{\mathbb E_{\mathbf p_u}\left[\left(\mathrm{SNR}^{\mathcal T}-\mathrm{SNR}^{\mathcal M}\right)^2\right]}, \tag{9}
$$

$$
D^{\mathcal T}_{\mathrm{JS}}\triangleq\frac12D_{\mathrm{KL}}\left(\Phi^{\mathcal M}\|\bar\Phi\right)+\frac12D_{\mathrm{KL}}\left(\Phi^{\mathcal T}\|\bar\Phi\right), \tag{10}
$$

$$
\delta^{\mathcal T}_{f,z}\triangleq\left\|\mathbf p_u^{\mathcal T\star}-\mathbf p_u^{\mathcal M\star}\right\|_2, \tag{11}
$$

$$
\rho^{\mathcal T}_{f,z}\triangleq\frac{\mathrm{snr}^{\mathcal T}_{\mathrm{lin}}\left(\mathbf p_u^{\mathcal M\star}\right)}{\mathrm{snr}^{\mathcal T}_{\mathrm{lin}}\left(\mathbf p_u^{\mathcal T\star}\right)}\in(0,1], \tag{12}
$$

其中 Φ̄=(Φ^M+Φ^T)/2，D_KL 是在共享支撑的 80 桶经验直方图上的 Kullback–Leibler 散度（D_JS∈[0,ln 2]，以 nat 计），而 p_u^{i⋆}≜argmax_{pu∈Pz} SNR^i(pu,fc)。dB 指标 (8)–(10) 与遗憾 (12) 对链路预算偏移 Pt+Gt+Gr−N0(fc) 不变，因此跨管线比较反映信道建模而非链路预算选择；δ^T 以米为单位。

### E. 分解为采样与物理分量

把偏差对两个目标 {S,L} 作比较，可得到干净的分解：

$$
\underbrace{\mathrm{bias}^{\mathcal S}_{f,z}}_{\text{表观差距}}=\underbrace{\left(\mathrm{bias}^{\mathcal S}_{f,z}-\mathrm{bias}^{\mathcal L}_{f,z}\right)}_{\text{采样分量}}+\underbrace{\mathrm{bias}^{\mathcal L}_{f,z}}_{\text{物理分量}}, \tag{13}
$$

其中第一项捕获 Monte-Carlo 欠采样（因为 S 与 L 共享几何与吸收物理，仅在采样与反射上不同），第二项捕获 M 与确定性射线追踪参考之间的残余分歧。如 §IV 所示，该分解是把"需要物理升级的载波"与"只需采样升级的载波"区分开的有效诊断。

## IV. 结果

### A. 设置

除非另有说明，结果在高度 z=100 m 处报告，此时 |Pz|≈1.39×10⁴。链路预算假设 Pt=30 dBm、Gt=Gr=0 dBi（各向同性）、η=8 dB、T0=290 K，逐载波带宽 B(fc)∈{200, 1000, 2000, 5000} MHz 对应 fc∈{28, 140, 183, 300} GHz。所有偏差、RMSE、D_JS 与 ρ 值都与链路预算无关；只有绝对 SNR 值随链路预算偏移而变化。

> **原文疑点：** §III-B 称每个高度 |Pz|≈1.6×10⁴ 个可部署位置，而 §IV-A 称 z=100 m 时 |Pz|≈1.39×10⁴；两处数值不同且文中未说明差异来源（例如是否为插值前/后的统计），此处按原文照录并加注。

### B. LoS 覆盖

表 I 报告三种管线在 Pz 上的平均 LoS 占比。由此可得两点观察。(i) 随机 Sionna 的 LoS 占比在每个高度都比解析模型低一个数量级，例如 z=100 m 时 0.057 对 0.700，与 §III-C 的 Monte-Carlo 欠采样分析一致。(ii) 确定性 LoS 管线恢复了显著更大的 LoS 占比（例如 100 m 处 0.283），但未达到解析值。剩余差距反映 MATLAB 合并立方体建筑模型与 Sionna 闭合网格表示之间的真实几何差异。如下所示，该几何差异在 28 GHz 处只转化为很小的（约 1.7 dB）PL 偏差，因为在 MATLAB 中为 LoS、而在 Sionna 中非 LoS 的单元位于离 UAV 很远的位置，贡献的线性增益可忽略。

> **表 I（原文 Table I）：** Pz 上的平均 LoS 覆盖（与频率无关）。

| 高度 | 解析 M | Sionna 随机 S | Sionna-LoS L |
|---|---|---|---|
| 50 m | 0.679 | 0.035 | 0.160 |
| 75 m | 0.703 | 0.049 | 0.230 |
| 100 m | 0.700 | 0.057 | 0.283 |
| 125 m | 0.712 | 0.063 | 0.325 |

### C. 位置分布 SNR

图 2 叠加 z=100 m 处四个载波下 Φ^M、Φ^S、Φ^L 的经验 CDF，图 3 给出带逐管线 argmax 标记的相应空间图。我们强调三个载波特定现象：

- 在 28 与 140 GHz，Φ^S 比 Φ^M 低约 5–6 dB，但 Φ^L 只低约 1.5–1.7 dB：表观差距的大部分由采样引起。
- 在 183 GHz，Φ^S 与 Φ^L 相对 Φ^M 都严重偏移（分别 −13.2 与 −9.2 dB）；两种情况下 JS 散度都饱和到 ln 2≈0.693，表明分布几乎不相交。
- 在 300 GHz，Φ^S 几乎与 Φ^M 对齐（偏差 +0.5 dB，D_JS=0.046）。然而确定性 LoS 管线暴露出 +3.8 dB 的结构性偏移（Φ^L 高于 Φ^M）与 D_JS=0.62。因此该载波处的随机一致性是巧合而非物理。

> **图 1（原文 Fig. 1）：** z=100 m、fc=28 GHz 处的地面平面 SNR 覆盖，按各管线自身的建筑几何与物理渲染。(a) 解析 M（FSPL + 吸收损耗 + 合并立方体 LoS）；(b) 确定性 LoS L（Sionna 网格 + FSPL + ITU-R P.676-13）；(c) 随机射线追踪 S（Sionna RT，D=1 镜面反射，ITU-R P.676-13）。

> **图 2（原文 Fig. 2）：** z=100 m 处位置分布 SNR Φ^M、Φ^S、Φ^L 的经验 CDF。

> **图 3（原文 Fig. 3）：** z=100 m 处 Pz 上的空间 SNR 图。红色星标表示逐管线 argmax。

### D. 现实差距量化

表 II 报告 z=100 m 处两个射线追踪目标的四个现实差距指标 (8)–(11) 与遗憾比 (12)，图 4 给出相应的并排柱状图。由此呈现三种机制。

**a) 采样主导机制（28、140 GHz）。** 相对随机 Sionna 的偏差为 bias^S∈{−5.58, −4.80} dB；缓解后降到 bias^L∈{−1.69, −1.47} dB。分解 (13) 把 28 GHz 处约 3.9 dB（140 GHz 处约 3.3 dB）归因于 Monte-Carlo 欠采样，残余约 1.5 dB 归因于真实几何/材料差异。JS 散度从 0.683/0.681 坍缩到 0.164/0.181，表明分布近乎重叠。最优部署位移显著收缩：28 GHz 处从 768 m 到 230 m（−70%），遗憾从 0.850 改善到 0.956。

**b) 吸收主导机制（183 GHz）。** 183.31 GHz 水汽共振在解析管线中表现为 Kokkoniemi–Lehtomäki 拟合 [13] 的第二条 Lorentzian（ν̃₂=6.11 cm⁻¹），但单个 Lorentzian 会低估完整 ITU-R P.676-13 线表的峰值幅度与翼尾，且该差异在式 (4) 的多单元聚合中累积。缓解只把 bias^S=−13.2 dB 降到 bias^L=−9.2 dB，且 D_JS 在两种情况下都保持饱和于 ln 2：两个 SNR 分布几乎不相交。位移仅有小幅收缩（864 m→768 m）。

**c) 巧合一致机制（300 GHz）。** 随机 Sionna 与解析模型一致（bias^S=+0.50 dB、D^S_JS=0.046、ρ^S=0.887），初看似乎说明解析信道足够。然而确定性 LoS 管线揭示 bias^L=+3.84 dB 与 D^L_JS=0.615。由 (13)，表观 +0.5 dB 偏差分解为 −3.3 dB 的采样分量与 +3.8 dB 的物理分量，二者几乎精确抵消。检查空间图（图 3 底行）可确认该机制：M 图呈现两个射线追踪管线都没有的高空间频率斑点，可追溯到位置相关的吸收多项式；平滑的 L 图由几何 LoS 梯度主导；随机 Sionna 把两种效应平均成偶然对齐。

> **表 II（原文 Table II）：** z=100 m 处两个射线追踪目标的现实差距指标。

| 目标 | 载波 | 偏差（dB） | RMSE（dB） | D_JS | δ（m） | ρ |
|---|---|---|---|---|---|---|
| S 随机 | 28 GHz | −5.58 | 6.51 | 0.683 | 768 | 0.850 |
| S 随机 | 140 GHz | −4.80 | 5.02 | 0.681 | 674 | 0.885 |
| S 随机 | 183 GHz | −13.20 | 13.22 | 0.693 | 864 | 0.880 |
| S 随机 | 300 GHz | +0.50 | 1.25 | 0.046 | 757 | 0.887 |
| L 确定性 | 28 GHz | −1.69 | 4.26 | 0.164 | 230 | 0.956 |
| L 确定性 | 140 GHz | −1.47 | 2.44 | 0.181 | 230 | 0.954 |
| L 确定性 | 183 GHz | −9.19 | 9.22 | 0.693 | 768 | 0.957 |
| L 确定性 | 300 GHz | +3.84 | 4.05 | 0.615 | 198 | 0.967 |

> **图 4（原文 Fig. 4）：** z=100 m 处的现实差距指标，按目标管线分组。

### E. 对 RL 策略迁移的启示

表 II 的最优位移与遗憾列是仿真到现实迁移的操作性量。尽管 δ 从 198 m 到 864 m 变化，每个载波的线性域遗憾 ρ^L≥0.93，因此解析最优部署的线性 SNR 代价从未超过约 7%（相对确定性射线追踪最优）。操作上，ρ 界定在解析最优处部署所牺牲的 SNR（此处 ≤0.3 dB），而 δ 表明最优位置的迁移远不如其数值可靠。

由此可得出三个操作性结论。在 28/140 GHz，解析信道足以用于部署：残余偏差在链路预算余量内（约 1.5 dB），遗憾 ≥0.95。在 183 GHz，需要吸收级升级（Kokkoniemi→ITU-R P.676）；仅靠 LoS 建模无法弥合差距，且 D_JS 饱和表明解析与射线追踪的 SNR 分布在操作上不等价。在 300 GHz，尽管确定性 LoS 比较揭示 +3.8 dB 的结构性偏移，遗憾比仍为 0.967：解析模型在部署决策上仍足够，尽管在绝对 SNR 意义上结构不等价。

> **原文疑点：** 摘要称"在所有载波上，解析信道训练所得策略的线性域遗憾值始终 ≥0.93"，但表 II 中相对随机 Sionna 的 ρ^S 为 0.850–0.887（低于 0.93），只有相对确定性 LoS 的 ρ^L（0.954–0.967）满足该说法；摘要未区分目标管线，此处按原文照录并加注。

## V. 结论

我们给出了覆盖毫米波到亚太赫兹四个载波的 RL 控制 UAV 中继的定量现实差距分析，使用真实城市地图与可公开复现的 Sionna 管线。简化几何信道与射线追踪之间的分歧强依赖载波：在 28/140 GHz，表观偏差由 Monte-Carlo 欠采样主导，并通过确定性 LoS 重算移除；在 183 GHz 存在残余偏差，可追溯到吸收线模型；在 300 GHz，随机射线追踪与解析模型巧合一致，而确定性 LoS 管线暴露结构性偏移。最优部署位移在数百米量级，但线性域遗憾比在所有载波上保持 ≥0.93，表明在简化信道上训练的策略仍有用，但对"线附近"的载波应在射线追踪上微调。本研究限于单城市、单种子随机运行、静态单 UAV 部署与各向同性天线、不考虑公平性的平均增益目标，以及无衍射的 D=1 镜面射线追踪。未来工作将把框架扩展到多 UAV、更真实的用户分布设置，以及把解析模型作为先验、射线追踪作为高保真预言的可微调优。

## 致谢

本出版部分得益于卡塔尔研究、开发与创新（QRDI）基金（卡塔尔基金会成员）的 NPRP14C-0909-210008，以及哈马德·本·哈利法大学主题研究资助计划第三轮的研究资助；部分得益于美国能源部科学办公室先进科学计算研究办公室早期职业研究计划（Award Number DE-SC0023957），以及美国国家科学基金会 Grant No. 2549088。

## 参考文献（英文原书目）

- [1] M. Mozaffari, W. Saad, M. Bennis, Y.-H. Nam, and M. Debbah, "A tutorial on uavs for wireless networks: Applications, challenges, and open problems," IEEE Communications Surveys & Tutorials, vol. 21, no. 3, pp. 2334–2360, 2019.
- [2] T. S. Rappaport, Y. Xing, O. Kanhere, S. Ju, A. Madanayake, S. Mandal, A. Alkhateeb, and G. C. Trichopoulos, "Wireless communications and applications above 100 ghz: Opportunities and challenges for 6g and beyond," IEEE Access, vol. 7, pp. 78 729–78 757, 2019.
- [3] I. F. Akyildiz, J. M. Jornet, and C. Han, "Terahertz band: Next frontier for wireless communications," Physical Communication, vol. 12, pp. 16–32, 2014.
- [4] ITU-R, "Recommendation ITU-R P.676-13: Attenuation by Atmospheric Gases and Related Effects," International Telecommunication Union, 2022.
- [5] A. Al-Hourani, S. Kandeepan, and S. Lardner, "Optimal LAP altitude for maximum coverage," IEEE Wireless Communications Letters, vol. 3, no. 6, pp. 569–572, 2014.
- [6] E. Kalantari, H. Yanikomeroglu, and A. Yongacoglu, "On the number and 3D placement of drone base stations in wireless cellular networks," in IEEE VTC-Fall, 2016.
- [7] J. Lyu, Y. Zeng, R. Zhang, and T. J. Lim, "Placement optimization of uav-mounted mobile base stations," IEEE Communications Letters, vol. 21, no. 3, pp. 604–607, 2017.
- [8] H. Bayerlein, P. de Kerret, and D. Gesbert, "Trajectory optimization for autonomous flying base station via reinforcement learning," in IEEE SPAWC, 2018.
- [9] X. Liu, Y. Liu, Y. Chen, and L. Hanzo, "Trajectory design and power control for multi-uav assisted wireless networks: A machine learning approach," IEEE Transactions on Vehicular Technology, vol. 68, no. 8, pp. 7957–7969, 2019.
- [10] J. Tobin, R. Fong, A. Ray, J. Schneider, W. Zaremba, and P. Abbeel, "Domain randomization for transferring deep neural networks from simulation to the real world," in IEEE/RSJ IROS, 2017.
- [11] X. B. Peng, M. Andrychowicz, W. Zaremba, and P. Abbeel, "Sim-to-real transfer of robotic control with dynamics randomization," in IEEE ICRA, 2018.
- [12] J. Hoydis, S. Cammerer, F. Ait Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," arXiv preprint arXiv:2203.11854, 2023.
- [13] J. Kokkoniemi, J. Lehtomäki, and M. Juntti, "A line-of-sight channel model for the 100–450 gigahertz frequency band," EURASIP J. Wireless Communications and Networking, vol. 2021, no. 88, 2021.
- [14] ITU-R, "Recommendation ITU-R P.2040-2: Effects of Building Materials and Structures on Radiowave Propagation," International Telecommunication Union, 2021.
- [15] M. Nimier-David, D. Vicini, T. Zeltner, and W. Jakob, "Mitsuba 2: A retargetable forward and inverse renderer," Transactions on Graphics (Proceedings of SIGGRAPH Asia), vol. 38, no. 6, Dec. 2019.
- [16] J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov, "Proximal policy optimization algorithms," arXiv preprint arXiv:1707.06347, 2017.
- [17] A. Raffin, A. Hill, A. Gleave, A. Kanervisto, M. Ernestus, and N. Dormann, "Stable-Baselines3: Reliable reinforcement learning implementations," Journal of Machine Learning Research, vol. 22, no. 268, pp. 1–8, 2021.

## 图注与表注索引

本页图 1–4 的中文图注与表 I–II 的表注均按原文出现位置内联在正文中（图 1–3 见第 IV-C 节，图 4 见第 IV-D 节；表 I 见第 IV-B 节，表 II 见第 IV-D 节），此处不重复罗列。原文为 IEEE 双栏会议论文排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.11121v1 全文（7 页）的中文译稿：摘要、索引词、第 I–V 节正文与编号小节、图 1–4 的中文图注、表 I–II 的逐格转写、致谢，以及参考文献 17 条英文原条目（按原编号）。原文无附录。公式与表格已对照 PDF 渲染页核对：式 (1)–(13) 逐式核对（重点式 (2)–(3)、(7)–(13)），表 I 与表 II 用第 5 页渲染图逐格核对。已加注三处原文疑点：(i) 吸收拟合的"六条 Lorentzian 共振线"只列出五个频率；(ii) §III-B 的 |Pz|≈1.6×10⁴ 与 §IV-A 的 |Pz|≈1.39×10⁴ 不一致且未说明；(iii) 摘要的线性域遗憾 ≥0.93 仅对确定性 LoS 目标成立（ρ^L），而表 II 中相对随机 Sionna 的 ρ^S 为 0.850–0.887。本页不上传原文图片，图内曲线、色标与空间图数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
