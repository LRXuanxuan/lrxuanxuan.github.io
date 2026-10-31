---
layout: page
title: "RMSampler：稀疏无线电地图重建的主动采样与扩散后验校正｜中文全文译文"
permalink: /papers/translations/2026-10-31-2610-27464-rmsampler-sparse-radio-map-reconstruction-with-active-sampling-and-dif/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/16a55e81fda01b8f/) · [原文 arXiv](https://arxiv.org/abs/2610.27464) · [全部目录](/papers/catalog/)

# RMSampler：稀疏无线电地图重建的主动采样与扩散后验校正

**原题：** RMSampler: Sparse Radio Map Reconstruction with Active Sampling and Diffusion Posterior Correction  
**作者：** Nan Cheng、Xiucheng Wang（西安电子科技大学电信工程学院，西安，中国）  
**版本：** arXiv:2610.27464，2026-10-31 推荐，原文 12 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VI 节及全部小节（III-A–C、IV-A–H、V-A–G）、式 (1)–(30)（其中少量分式在 PDF 中跨行、以文字说明其定义）、定理 1/3、推论 2、命题 4、表 I–II（逐格转写）、图 1–8 图注、参考文献 [1]–[41]（英文原条目）均按原文结构录入；原文无附录。逐句逐式终校未做。

## 摘要

从稀疏接收功率测量重建无线电地图（radio map，RM）可支撑非协作干扰监测与频谱管理。然而稀疏测量使**全局 RM** 与**干扰发射机位置**都带有不确定性，从而使"有信息量的采样"与"准确重建"两个环节都变得困难。为应对这些挑战，本文提出一种名为 **RMSampler** 的联合采样与重建方法，以在有限测量预算下改进测量选择与 RM 重建。对于测量选择，RMSampler 用扩散生成 RM 的协方差评估**全局 RM 误差降低**，用候选发射机位置评估**定位误差降低**。由于这两类误差单位不同，它们期望的**相对降低量**被组合成一个**尺度不变**的采样准则，且每次获得的测量都同时更新这两个不确定性估计。采样结束后，更新后的发射机位置概率引导一个**独立**的条件扩散集成以完成最终重建。为改善与测量的一致性，一个**有效样本量**（effective sample size，ESS）目标引导稳健后验校正，随后由一个**最小失真投影**施加测量约束与建筑约束。对重建集成，分析表明提高似然幂会降低期望的稳健测量损失，同时预训练神经网络的参数与架构保持不变。在仿真数据与真实测量数据上的实验表明，在匹配的测量预算下重建得到改进。在重庆真实测量数据实验中，相对随机采样，在相同重建方法下均方根误差（RMSE）从 3.54 dB 降至 2.73 dB。

**关键词：** 无线电地图重建、扩散模型、测量位置优化、免训练推断、后验校正、主动采样。

## I. 引言

从稀疏接收功率测量重建无线电地图（RM）可支持跨区域的非协作干扰监测 [1]。RM 通过估计未测量位置的接收功率来识别受干扰影响区域并支撑频谱管理 [2]。在非协作场景中，干扰发射机位置与传播参数可能不可得，使接收机测量与环境信息成为重建的核心 [3]。获取这些测量消耗感知时间与设备资源，故穷举式测量活动成本高昂 [4]；有限的测量预算因此要求**有信息量的采样位置**，以及一种能有效利用已获取测量值的推断方法。然而稀疏测量使全局 RM 与干扰发射机位置同时存在不确定性，这构成一个用于测量选择的**联合估计问题**。

建筑遮挡与多径传播产生的接收功率变化，是简单距离模型无法刻画的 [5]。学习到的传播先验有助于从稀疏观测重建这些变化 [6]，而基于扩散的逆估计可在发射机位置未知时重建 RM [3]。为选择进一步的测量，预测不确定性可引导高斯过程（GP）主动学习 [4] 与基于流匹配的 RM 感知 [7]；评估某个测量在 RM 上的重建收益还需要候选测量与未测量位置之间的**空间依赖性** [8]；移动 GP 感知亦通过基于置信度的采集同时处理 RM 重建与发射机定位 [9]。这些估计目标促使我们采用一个共同准则：评估**同一个测量**如何同时降低全局 RM 误差与发射机定位误差。

把这些误差的期望降低量**归一化**，可使两个估计目标在同一尺度上共同引导下一次采样决策。来自预训练扩散模型 [10] 的候选 RM 提供候选测量与未测量 RM 位置之间的空间协方差；用已获测量更新候选权重，使该协方差反映当前重建不确定性。在高斯近似下，它可预测候选测量对全局 RM 误差的降低量。对发射机定位，候选发射机位置下的接收功率预测量化了同一观测可降低多少期望坐标误差。把每个预测降低量除以相应的当前期望误差，可消除二者单位与量级差异；归一化和因此按联合估计收益对采样位置排序，且每个获取的值都会更新 RM 权重与发射机位置概率，供下一次决策使用。

为实现该联合准则，本文提出新的采样与 RM 重建方法 **RMSampler**，以在有限测量预算下改进测量选择与重建。该准则引导序贯采样，同时所获测量值更新候选发射机位置的概率；这些概率随后作为**独立**扩散集成的条件以完成最终 RM 重建，从而把采样阶段获得的信息与重建先验连接起来。为改善与已获测量的一致性，生成的 RM 由稳健测量似然重新加权；一个 ESS 目标引导校正强度，以平衡测量一致性与权重集中度，之后由最小失真投影施加有界测量约束与建筑约束。该测量相关推断使用两个预训练模型而不改变其神经参数或架构（图 2）。

**图 1（原文 Fig. 1）：** 一个选定测试样例（8 个测量）与常用条件扩散重建器。

**图 2（原文 Fig. 2）：** RMSampler 利用建筑地图、接收功率测量与发射机（Tx）位置假设进行采样与重建（扩散粒子）。

本文主要贡献概括如下。

1. 我们把**受测量预算约束的 RM 重建**表述为发射机位置未知情形下的**联合序贯估计与采样问题**。每次获取的测量同时更新 RM 重建不确定性与发射机位置不确定性，使两个估计目标都能为后续采样提供信息。
2. 我们由期望全局 RM 误差与发射机坐标误差的**分数降低量**导出采样准则：空间协方差评估重建贡献，候选发射机位置评估定位贡献。我们证明：当相应方差被等比例缩放时，该准则对接收功率的**尺度与偏移**变化具有不变性；在高斯近似与有限假设近似下，最大化该准则即最小化**截断归一化单步联合估计误差**。
3. 我们为单独生成的条件 RM 集成提出 **ESS 引导的稳健后验校正**。对固定集成，我们导出 KL 正则化变分表述，并证明提高似然幂会降低期望稳健测量损失；ESS 引导搜索选择校正强度，最小失真投影施加有界测量与建筑约束，同时保持两个预训练扩散模型不变。
4. 我们在 100 个 RadioMapSeer 测试场景 [5]、Vienna 真实测量数据 [11] 与重庆真实测量数据 [12] 上评估 RMSampler。仿真 RM 比较评估归一化均方误差（NMSE）、结构相似性（SSIM）与发射机定位；RMSampler、Uniform 与 Random 共享同一条件扩散重建器以隔离采样收益，而真实测量数据对照实验分别评估重建与采样。在重庆真实测量数据的新无线小区标识（NCI）分组实验中，相对随机采样，在相同重建方法下 RMSE 从 3.54 dB 降至 2.73 dB。

## II. 相关工作

**RM 重建。** RM 重建把稀疏测量与推断前学习或指定的空间依赖结合起来。插值与图正则化直接利用这些依赖性 [1]，神经补全则从其他环境学习传播模式 [6]；低秩神经模型把补全扩展到多维无线电数据 [13]。对城市 RM，RadioUNet 学习几何对接收功率的影响 [5]，DeepREM 从稀疏观测估计未测量值 [14]，条件对抗学习提供另一种数据驱动重建途径 [15]。这些方法提供重建机制，而主动采样还要求**在观测到测量值之前**预测该测量的期望收益。

**生成先验**可表示与不完整观测一致的多种重建。学习到的生成表示约束逆恢复 [16], [17]，扩散与分数模型通过迭代去噪生成样本 [18], [19]，潜扩散在学习到的压缩表示中完成生成 [20]。在 RM 构建中，RadioDiff 提供以几何为条件的传播先验 [10]，其扩展处理三维 RM [21]、通过 Helmholtz 方程处理多径结构 [22]、以及从含噪稀疏测量进行贝叶斯恢复 [3]；前向预测、逆重建与物理信息之间的更广泛关系见综述 [2]。扩散逆求解器通过流形校正 [23]、去噪恢复 [24]、似然引导后验采样 [25] 或伪逆引导 [26] 纳入测量一致性。这些方法使用指定位置处的观测，这促使我们为**选择**观测位置补充一条决策规则。

**主动采样**在采集之前通过特定估计目标评估测量。贝叶斯实验设计形式化了该决策 [27]，期望误差降低 [28]、互信息传感器布置 [8] 与上置信界采集 [29] 提供不同准则；自适应源定位用观测降低位置不确定性 [30]。对 RM 重建，GP 集成提供预测不确定性 [4]，GP 上置信界采样与交叉熵规划（GP-UCB-CE）纳入接收机移动性 [9]；流匹配亦利用生成多样性引导测量选择 [7]；几何感知 Cholesky 投影（GACP）利用环境几何，GACP 与自编码器重建结合（GACP-AE）把该选择与学习到的 RM 补全结合 [31]；能量修正杠杆采样（EMLS）利用低秩结构 [32]。RMSampler 评估**同一候选观测**的期望 RM 误差与发射机坐标误差降低量，并用归一化使二者可比。

**真实测量数据**使这些重建先验能在不同于训练条件的传播环境中被评估。Vienna 数据集把城市尺度第四代（4G）与第五代（5G）无线测量与高分辨率建筑、地形模型结合 [11]；重庆宏小区数据集提供复杂地形描述下的地面与空中测量 [12]。其记录的接收机测量与环境数据补充了完整仿真 RM，可支持在……（原文此句延续至下一页，见 PDF）。

## III. 系统模型与问题表述

序贯采样与 RM 重建通过每次获取测量所更新的后验相互连接：当前后验预测候选测量的期望收益，而所获值更新用于后续采样与重建的信息。我们通过**期望 RM 重建误差**与**期望发射机位置误差**表达这种依赖。整个推断过程中建筑地图已知，含噪室外接收功率测量按序到达，且无法获得……（完整 RM）。

### A. 场景与测量模型

我们考虑高度为 \(H\)、宽度为 \(W\)、共 \(D=HW\) 个像素的网格上的静态单发射机场景。二值建筑地图 \(\mathbf m\in\{0,1\}^D\) 在整个推断中准确可得，其中 \(m_i=1\) 标识建筑像素。建筑集合为 \(\mathcal B=\{i:m_i=1\}\)，可用户外位置集合为 \(\mathcal O=\{1,\ldots,D\}\setminus\mathcal B\)。建筑像素值 \(v_i\) 遵循已知地图约定、作为**边信息**提供而不消耗采样预算。未知发射机坐标 \(\tau\) 属于 \(\mathcal O\)，RM \(\mathbf x\in[0,1]^D\) 包含归一化接收功率。在室外区域，我们把 RM 分解为背景分量 \(\mathbf b\) 与依赖发射机的分量 \(\mathbf s(\tau)\)：

$$
x_i=\begin{cases}b_i+s_i(\tau),&i\in\mathcal O,\\ v_i,&i\in\mathcal B.\end{cases}\tag{1}
$$

(1) 的分解把背景接收功率变化与发射机位置相关的变化分离：扩散粒子近似前者，而标定传播模型预测与替代发射机坐标相关的接收功率变化。因此每次新测量都可同时更新候选 RM 权重与发射机位置概率。

移动传感器在不同室外像素上序贯获取含噪接收功率测量。设 \(k_n\in\mathcal O\) 为第 \(n\) 轮选择的位置、\(y_n\) 为相应测量；第 \(j\) 轮后累计数据为 \(\mathcal D_j=\{(k_1,y_1),\ldots,(k_j,y_j)\}\)。传感器噪声方差 \(k_n\) 已知（记作 \(\sigma_{k_n}^2\)）且满足 \(\mathbb E[\epsilon_n]=0\)、\(\mathbb E[\epsilon_n^2]=\sigma_{k_n}^2\)。稳健似然分别计入模型偏差，得到测量模型

$$
y_n=x_{k_n}+\epsilon_n=b_{k_n}+s_{k_n}(\tau)+\epsilon_n.\tag{2}
$$

采样预算按每个选定室外位置的一次接收功率测量计。所有候选位置具有相同的测量……（成本假设）。

### B. 联合后验与决策

用于采样的后验把加权背景粒子与有限发射机位置假设结合。设 \(P\) 个背景粒子取自冻结的无条件像素域 RadioDiff 先验，\(M\) 个发射机位置假设带概率与拟合幅度；假设初始覆盖基于建筑地图的室外网格，高概率单元随测量到达而被细化。标定传播模型预测候选像素 \(i\) 处的 \(s_i(\tau_m;\alpha_m)\)。观测到 \(y_n\) 后，RMSampler 通过式 (3) 中的 Student-\(t\) 因子更新位置概率：对第 \(j\) 次测量有

$$
\rho_{m|j}\propto\rho_m\,\ell_\nu\!\left(y_j-s_{k_j}(\tau_m;\varsigma_s^2)\right)^{\kappa_j},
$$

其中 \(\ell_\nu\) 为自由度为 \(\nu\) 的 Student-\(t\) 似然、\(\varsigma_s^2\) 为残差尺度、\(\kappa_j\) 为温度系数；另加一个小的均匀概率成分，以在传播模型失配时保留其他可能位置（式 (3) 的完整乘积形式见原文）。同一观测以温度化似然修正 RM 粒子权重，并在其 ESS 过小时施加正则化。因此下一次采样决策同时使用两个经测量更新的不确定性估计。

用于采样的因子化分布 \(Q_n\) 对每对 \((\mathbf b^{(p)},\tau_m)\) 赋予质量 \(w_p\rho_m\)；其矩引导采集，而 \(\Pi_n\) 描述采样后的条件重建。RMSampler 用自适应发射机位置网格中**概率代表性**的子集来估计期望坐标误差：为保留空间上分离假设的贡献，按坐标排序、构造累积概率，并通过确定性系统抽样选择等间距概率分位数；重复选中的假设被合并，其重数决定保留权重。随后在这些选中坐标处的接收功率预测近似全空间概率分布上的期望误差。

### C. 序贯测量—位置优化

采样预算为 \(K\) 次测量，终末目标为

$$
J_K(P)=\mathbb E_P\left[\frac{R_x(\mathcal D_K)}{R_x(\mathcal D_0)}+\frac{R_\tau(\mathcal D_K)}{R_\tau(\mathcal D_0)}\right],\tag{8}
$$

其中 \(R_x(\mathcal D_n)\) 与 \(R_\tau(\mathcal D_n)\) 分别为第 \(n\) 次测量后的期望 RM 重建误差与期望发射机位置误差：

$$
R_x(\mathcal D_n)=\mathbb E_{\Pi_n}\left[\left\|\mathbf x_{\mathcal O}-\boldsymbol\mu_{n,\mathcal O}\right\|_2^2\middle|\mathcal D_n\right]=\operatorname{Tr}\left(\operatorname{Cov}_{\Pi_n}(\mathbf x_{\mathcal O}|\mathcal D_n)\right),\tag{6}
$$

$$
R_\tau(\mathcal D_n)=\sum_{\tau'\in\mathcal H_n}\pi_n(\tau')\left\|\tau'-\boldsymbol\delta_n\right\|_2^2,\tag{7}
$$

其中 \(\Pi_n\) 为 \(n\) 次测量后的目标模块化后验、\(\mathcal H_n\) 为发射机位置假设集、\(\boldsymbol\delta_n\) 为当前位置估计。目标模块化后验为

$$
\Pi_n(\mathbf x,\tau)\propto q_\theta(\mathbf x|\mathbf m,r(\tau))\,\pi_{s,n}(\tau)\times\prod_{j=1}^{n}\ell_\nu\left(y_j-x_{k_j};\varsigma^2\right)^{\gamma_n},\tag{5}
$$

其中 \(q_\theta\) 为条件扩散先验、\(r(\tau)\) 为发射机坐标的栅格化表示、\(\pi_{s,n}(\tau)\) 为发射机位置先验、\(\gamma_n\) 为温度。把候选位置预测中**负**的位置改进置零，即得下述单步准则；随后已获测量支持对重建 RM 的后验校正。

## IV. 联合主动采样与 RM 重建

RMSampler 通过测量更新的发射机位置后验把序贯采样与最终 RM 重建连接起来，并为两项任务使用**独立**的扩散集成（图 2）：无条件像素域集成的空间相关性支撑采样，每个获取值更新其权重与有限位置概率；采样结束后，保留的位置模态作为潜扩散集成的条件用于重建，测量一致性在 ESS 控制下决定其后验权重，投影施加已知值约束；两个网络均保持预训练参数。

### A. 采样用因子化后验

如第 III-B 节所述，采样后验把加权背景粒子与有限发射机位置假设结合；因子化分布 \(Q_n\) 的矩提供候选处接收功率的预测均值、方差与空间协方差，这些量正是第 IV-B、IV-C 节不确定性降低公式的输入。发射机位置假设集合通过自适应网格与系统抽样的概率代表子集实现（见 III-B）。

### B. 归一化 RM 重建不确定性降低

对候选比较，记 \(\mathbf x\) 为采样近似 \(Q_n\) 下未观测的室外目标值，\(\boldsymbol\Sigma_x=\operatorname{Cov}_{Q_n}(\mathbf x)\)、\(\mathbf c_k=\operatorname{Cov}_{Q_n}(\mathbf x,y_k)\)、\(v_k=\operatorname{Var}_{Q_n}(y_k)>0\)（含传感器噪声与模型偏差）。固定这些矩，按高斯条件化并对迹取和，可得预测的**分数 RM 误差降低**：

$$
\Delta_x(k)=\frac{\left\|\operatorname{Cov}(\mathbf x,y_k)\right\|_2^2}{\operatorname{Var}(y_k)\operatorname{Tr}\left(\operatorname{Cov}(\mathbf x)\right)}=\frac{\left\|\mathbf c_k\right\|_2^2}{v_k\operatorname{Tr}(\boldsymbol\Sigma_x)},\tag{10}
$$

其中高斯条件化给出 \(\boldsymbol\Sigma_x^+=\boldsymbol\Sigma_x-\mathbf c_k\mathbf c_k^\top/v_k\)。实现中，(10) 中的 \(\mathbf x\) 限制在固定步长的未观测室外目标像素集合上；协方差分子通过粒子空间中的背景、发射机相关与交叉协方差 Gram 矩阵计算，避免形成稠密 \(D\times D\) 协方差矩阵。该归一化把期望误差降低表示为候选 \(k\) 的当前 RM 重建误差的**分数**；若目标迹为零，则该项定义为零。

### C. 有限假设发射机位置不确定性降低

与 RM 项互补，发射机位置分量评估所实现 **MAP 估计**的期望坐标误差。设 \(d=\tau_{m^\star}\)，其中 \(m^\star=\arg\max_m\rho_m\)，定义当前期望坐标误差 \(R_{\rm MAP}\)。对候选 \(k\)，每个保留假设 \(i\) 给出预测接收功率测量 \(\tilde y_{i,k}=s_k(\tau_i;\alpha_i)\)，该预测测量对应的后验为

$$
\rho_{m|i,k}=\frac{\rho_m\ell_\nu\left(\tilde y_{i,k}-s_k(\tau_m;\alpha_m);\varsigma_k^2\right)}{\sum_j\rho_j\ell_\nu\left(\tilde y_{i,k}-s_k(\tau_j;\alpha_j);\varsigma_k^2\right)}.\tag{11}
$$

对每个预测值重算 MAP 坐标 \(\hat\tau_{i,k}\) 与条件误差，并用当前假设权重 \(\rho_i\) 对这些条件误差加权平均：

$$
R_\tau^+(k)=R_{\rm MAP}-\sum_i\rho_i\left(R_{\rm MAP}-\hat R_{i,k}\right)_+\,,\qquad
\Delta_\tau(k)=1-\frac{R_\tau^+(k)}{R_\tau},\tag{12}
$$

其中 \((\cdot)_+=\max\{\cdot,0\}\)。外层平均使用有限个预测测量值，而 Student-\(t\) 似然决定每个条件位置后验；该有限近似定义了对采样的位置贡献。当当前期望坐标误差为零时，其归一化降低定义为零。

### D. 联合采样准则与尺度不变性

由于 RM 与发射机位置降低量都是其当前期望误差的**分数**，两项都无量纲，可在同一尺度上组合。RMSampler 为候选 \(k\) 赋分

$$
a_k=\Delta_x(k)+\Delta_\tau(k),\qquad k^\star=\arg\max_{k\in\mathcal O\setminus\mathcal D_n}a_k,\tag{13}
$$

并选择得分最高的未测量室外位置。

**定理 1（单步联合估计误差最小化）。** 设 \(\boldsymbol\Sigma_x=\operatorname{Cov}(\mathbf x)\)、\(\mathbf c_k=\operatorname{Cov}(\mathbf x,y_k)\)、\(v_k=\operatorname{Var}(y_k)>0\)、\(R_x=\operatorname{Tr}(\boldsymbol\Sigma_x)>0\)、\(R_\tau=R_{\rm MAP}>0\)，并定义测量后的 RM 重建误差与期望坐标误差（式 (14)–(15)）。则 RMSampler 的采样得分为

$$
a_k=\left(1-\frac{R_x^+(k)}{R_x}\right)+\left(1-\min\left\{\frac{R_\tau^+(k)}{R_\tau},1\right\}\right),\tag{15}
$$

因此在高斯 RM 近似与带 Student-\(t\) 似然的有限发射机位置测量模型下，最大化 \(a_k\) 恰好最小化截断归一化单步联合估计误差。

**证明。** 对高斯秩一协方差更新取迹给出 \(\operatorname{Tr}(\boldsymbol\Sigma_x^+)/R_x=1-\Delta_x(k)\)；截断坐标降低量为 \(\Delta_\tau(k)=1-\min\{R_\tau^+(k)/R_\tau,1\}\)。把两个恒等式相加即得 (15)。由于加性常数与 \(k\) 无关，最大化该得分即最小化所陈述的联合估计误差。∎

定理 1 在所述高斯与有限假设模型下把候选排序与联合估计目标联系起来。每次测量后重算两项，可使下一次选择适应已获信息；增加预算则延续同一序列，从而得到用于**跨预算比较的嵌套测量集合**。

**推论 2（仿射表示不变性）。** 对每个 RM 值、观测或预测测量、功率预测施加 \(z'=cz+d\)（\(c\ne0\)），并把每个传感器与模型偏差方差乘以 \(c^2\)，则对每个候选有 \(\Delta'_k=a_k\)；因此 (13) 中的最大化位置集合不变。

**证明。** 平移在协方差与残差中消失，而乘以 \(c\) 使 (10) 的分子与分母同获因子 \(c^4\)；式 (16d) 使每个相对 Student-\(t\) 因子不变，故以预测测量为条件的后验、其 MAP 估计与期望坐标误差均相同。因此每个候选的两两排序与并列关系都被保持。∎

推论 2 表明：当传感器与模型偏差方差被一致变换时，接收功率的仿射换算不改变所选取的采样位置。

### E. 后验校正的条件扩散

采样结束后，更新后的发射机位置后验决定最终 RM 重建的条件。RMSampler 把该后验分组为分离的模态；对模态 \(m\)，把坐标 \(\tau_m\) 栅格化为 \(r(\tau_m)\) 并输入 RadioDiff 的预训练条件潜扩散模型。条件输入遵循该模型原始训练规范，仅包含建筑掩码与测量导出的发射机位置栅格；已获室外接收功率进入下述似然与投影操作，而预训练模型的参数与架构保持不变。

对这些保留的发射机位置模态，候选 RM 由独立潜噪声生成。设每个模态的 RM 粒子数为 \(L\)，把每个模态条件重复 \(L\) 次得到联合集成：

$$
\mathbf x^{(m,\ell)}=G_\theta\left(\mathbf z^{(m,\ell)};\mathbf m,r(\tau_m)\right),\tag{17}
$$

其中 \(G_\theta\) 为预训练条件生成器、\(\mathbf z^{(m,\ell)}\) 为独立潜噪声；有界批次以全局后验归一化评估这些反向扩散轨迹，并保留指定先验权重与独立潜噪声。该集成既表示每个模态内的 RM 变化，也表示发射机位置不确定性。

为使候选 RM 能解释已收集的测量，RMSampler 使用稳健负对数似然

$$
E_{m,\ell}=\frac{1}{|\mathcal D_n|}\sum_{(k_j,y_j)\in\mathcal D_n}\log\left(1+\frac{(y_j-x^{(m,\ell)}_{k_j})^2}{\nu(\sigma^2+\sigma_d^2)}\right),\tag{18}
$$

其中 \(\nu\) 为 Student-\(t\) 自由度、\(\sigma^2\) 为传感器噪声方差、\(\sigma_d^2\) 为扩散模型偏差方差。Student-\(t\) 损失限制有限集成难以解释的测量的影响。式 (19) 中的权重

$$
u_{m,\ell}(\gamma)=\frac{u^0_{m,\ell}\exp(-\gamma E_{m,\ell})}{\sum_{a,b}u^0_{a,b}\exp(-\gamma E_{a,b})}\tag{19}
$$

使能更好匹配已获值的候选 RM 获得更高权重，故测量也影响未测量位置处的估计。ESS 引导的校正平衡测量拟合与权重集中：定义 \(\operatorname{ESS}(\gamma)=\left(\sum_{m,\ell}u_{m,\ell}(\gamma)^2\right)^{-1}\) [35]，目标为名义值 \(N_{\min}\)；似然幂按

$$
\gamma^\star=\begin{cases}1,&\operatorname{ESS}(1)\ge N_{\min},\\ \gamma_{\rm lo},&\text{否则}\end{cases}\tag{20}
$$

选择，其中 \(\gamma_{\rm lo}\) 为以 0 与 1 初始化的 40 步括号搜索后的下端点：ESS 可接受的中间点替代下端点，其他中间点替代上端点；若未找到可接受中间点，则端点保持为零、即保留模态加权的粒子先验。不相等的模态概率可能使其初始 ESS 低于名义目标。

**定理 3（变分后验校正）。** 对联合损失 \(E_r\) 排序。对每个 \(\gamma\in[0,1]\)，式 (19) 中的权重唯一求解 KL 正则化问题

$$
\min_{\mathbf q\in\Delta_I}\ \left(\operatorname{KL}(\mathbf q\|\mathbf u^0)+\gamma\sum_r q_rE_r\right),\tag{21}
$$

其中 \(\Delta_I\) 为概率单纯形；其期望稳健损失 \(\bar E(\gamma)=\sum_r u_r(\gamma)E_r\) 满足

$$
\frac{{\rm d}\bar E(\gamma)}{{\rm d}\gamma}=-\operatorname{Var}_{\mathbf u(\gamma)}(E)\le0.\tag{22}
$$

**证明。** 单纯形约束下的一阶条件给出 \(q_r\propto u^0_re^{-\gamma E_r}\)；归一化即得 (19)，KL 项的严格凸性给出唯一性。对归一化权重求导得 \({\rm d}u_r/{\rm d}\gamma=u_r(\bar E-E_r)\)，再乘 \(E_r\) 求和即得 (22)。∎

定理 3 说明：增大似然幂会降低固定集成上的期望稳健损失。ESS 在数值搜索中直接评估，因为不相等的先验权重可能使其随该幂非单调。搜索及其"零校正"回退都使用已获测量。

### F. 后验均值重建与发射机定位

校正后的粒子权重同时决定 RM 与发射机位置估计。其加权平均给出未投影 RM：

$$
\mathbf x=\sum_{m=1}^{M^\star}\sum_{\ell=1}^{L}u_{m,\ell}(\gamma^\star)\mathbf x^{(m,\ell)}.\tag{23}
$$

在每个模态内对校正粒子权重求和，得到发射机位置概率 \(\rho_m=\sum_\ell u_{m,\ell}(\gamma^\star)\)，相应 MAP 估计 \(\hat\tau=\tau_{\arg\max_m\rho_m}\) 使用与 RM 估计相同的测量信息。投影在后验加权之后施加有界测量与建筑约束：令 \(\mathcal K=\{k_1,\ldots,k_K\}\)，在每个已获像素处定义 \(y_b(i)=\operatorname{clip}(y(i),0,1)\)；似然使用原始含噪值 \(y(i)\)，而最终投影为

$$
\mathbf x_i=\begin{cases}y_b(i),&i\in\mathcal K,\\ v_i,&i\in\mathcal B,\\ \min\{1,\max\{0,x_i\}\},&\text{否则}.\end{cases}\tag{24}
$$

式 (24) 同时匹配有界测量目标与规定建筑值；未采样像素保留截断到归一化 RM 范围的后验估计。权重估计先于投影，故所强制的值不进入权重计算。

### G. 投影与计算性质

投影把后验均值约束到可行集，且具有"最小平方变化"性质。约束定义可行 RM 集

$$
\mathcal C_K=\left\{\mathbf z\in\mathbb R^D:z_i=y_b(i),\ i\in\mathcal K;\ z_i=v_i,\ i\in\mathcal B;\ 0\le z_i\le1,\ i\notin\mathcal K\cup\mathcal B\right\}.\tag{25}
$$

**命题 4（最小失真投影）。** 设 \(P_K\) 表示 (24) 中的算子。对每个后验均值 \(\mathbf p\in\mathbb R^D\)，其输出是

$$
P_K(\mathbf p)=\arg\min_{\mathbf z\in\mathcal C_K}\left\|\mathbf z-\mathbf p\right\|_2^2\tag{26}
$$

的唯一解。

计算上，采样与重建共享同一冻结 RadioDiff 网络：采样集成使用无条件像素域模型（12 个粒子、16 步反向），重建集成使用条件潜扩散模型（每个保留模态 4 个粒子、3 步反向、至多 4 个模态）；协方差计算限于固定步长目标集与至多 96 个代表性发射机位置假设，从而避免稠密 \(D\times D\) 运算。全部神经参数保持冻结，故本方法为**免训练推断**。

### H. 对真实测量数据的适配

对真实测量数据，由于参考信号接收功率（RSRP）的动态范围与仿真不同，RMSampler 在最后一步引入**环境残差校正**。记采样位置处的扩散粒子加权均值为 \(\bar x_k\)，并令 \(\mathbf z_i\) 收集推断时可用的地形、建筑与局部密度特征。一个岭正则化的**环境核**拟合采样位置上的残差 \(y_k-\beta\bar x_k\)，并预测未测量接收机位置处的校正：

$$
\hat x_i^{\rm meas}=\Pi_{[0,1]}\left(\beta\bar x_i+\eta\,br_i(\mathbf z_i,\mathcal D_n)\right),\tag{29}
$$

其中 \(\beta\) 为全局尺度、\(br_i(\cdot)\) 为环境核回归输出、\(\eta\) 为校正系数、\(\Pi_{[0,1]}\) 截断到 \([0,1]\)。为在无发射机真值时指导采样，真实数据下的采集分数用归一化**最大最小覆盖** \(c_k^{\rm cov}\) 与不确定性分数组合：

$$
a^{\rm meas}_k=(1-q)c^{\rm cov}_k+q\,N_n\left(\Delta_x^{\rm env}+\omega_\tau\Delta_\tau\right)(k),\tag{30}
$$

其中 \(q\in[0,1]\) 为混合权重、\(N_n\) 为按当前分数量级归一化、\(\omega_\tau=0.01\) 缩放定位项；环境覆盖项用扩散粒子的空间方差近似。

## V. 实验评估

评估通过把同一条件扩散重建器应用于 RMSampler、Uniform 与 Random 以在仿真 RM 上隔离**采样收益**；外部基线保留其完整流程。在真实测量数据上，共同位置与共同重建器对照把重建质量与采样有效性分开。

### A. 协议、基线与指标

仿真研究使用 RadioMapSeer [5] 的主路径模型 RM。固定场景级置换（种子 42）把数据划分为 500 训练/100 验证/100 测试场景，各划分间无场景重叠。我们在全部 100 个测试场景（训练中未见）上评估，使用冻结扩散模型进行**零样本** RM 重建。每个场景提供 80 个 Tx 位置及各自的单 Tx RM；我们使用每个测试场景中提供的第一个 Tx 配置，得到每场景一个仅含该 Tx 贡献的 \(256\times256\) RM。推断时按第 III 节规定可获得精确建筑地图，而真实 Tx 坐标与未测量室外接收功率值仅用于评估。我们评估 8 与 16 个室外测量（记 B8、B16），归一化加性噪声标准差 0.02。所有方法共享测试场景、预算、掩码与噪声约定；已知建筑像素值不计入评估。

三种采样策略共享相同的条件重建设置，测量集由种子 42031 生成：无条件像素域扩散模型提供 12 个采样粒子与 16 步反向；全局 RM 准则使用四像素目标步长与至多 96 个代表性发射机位置假设；最终重建对每个保留 Tx 模态生成 4 个条件潜扩散粒子（3 步反向、至多 4 个模态），每个模态使用峰值归一化、标准差一个像素的高斯栅格。Student-\(t\) 似然自由度 4、偏差标准差 0.1、名义 ESS 目标取"两个粒子"与"0.35 倍集成规模"中的较大者。后验校正与投影使用各策略所获测量与固定的场景特定潜噪声流。条件推断在 NVIDIA RTX 3060 Ti 上运行（每模态 4 粒子批次、全局权重归一化），外部方法在 RTX 4090 上评估。

外部基线为独立的、受论文约束的重实现，保留已发表采样与重建机制并按此处数据集与预算适配。集成 GP 主动学习（EGP-AL）使用 11 个径向基随机特征 GP 专家、预测似然加权、高斯混合方差（GM-Var）采样与混合均值重建 [4]，其初始化被适配到稀疏预算（原文实验从 100 个标注点开始）。GP-UCB-CE 保留在线 GP 拟合、已发表的上置信界奖励、受限独轮车运动、五步时域与梯度增强交叉熵规划 [9]。几何与低秩基线使用不同的结构信息：GACP-AE 保留其 \(32\times32\) 格点、几何感知协方差、主元 Cholesky 投影与已发表自编码器 [31]（几何用文档化的建筑轮廓适配替代不可得障碍高度），训练 100 轮后验证均方误差 0.00407（未投影到测量值）；EMLS 与矩阵补全（EMLS-MC）保留其两轮采样器并用奇异值阈值（SVT）重建 [32]，其已发表协议覆盖 5%–45% 采样，而 B8/B16 仅暴露约 0.01%/0.02% 网格，固定 600 次迭代后其观测项残差仍为 0.6075 与 0.6099，超过未改动的 \(10^{-4}\) 阈值，故表 I 按该停止规则记为未收敛（NC）。外部方法使用各自采样与重建流程，并与所述共享重建对照并列；未测量的接收功率值不进入任何方法的推断输入。

仿真报告室外 NMSE 与 SSIM [36]，每场景先转为分贝再平均。峰值比比较真实发射机五像素邻域内预测与参考最大归一化 RM 值（理想值为 1）；Top-1% 召回率为参考 Top-1% 室外像素中被预测 Top-1% 像素同时识别的比例。定位方面，三种采样策略使用校正后 Tx 模态概率的 MAP 估计，外部方法使用室外 RM 峰值；误差度量到真实天线坐标的欧氏距离，并报告 5、10、20 像素内的命中率。均值覆盖同样的 100 个场景。图像使用 5000 次场景 bootstrap 重采样给出均值区间 [37]，配对差使用 20000 次重采样与 100000 次符号翻转；Holm 校正覆盖两个预算与两个采样比较对象（每个指标），外部流程比较构成单独族。B8 与 B16 暴露的网格不足 0.025%，故评估中包含远多于测量位置的未采样位置。

### B. 聚合 RM 重建

固定条件重建器后，表 I 把采样位置选择相对 Uniform 与 Random 的收益隔离出来。RMSampler 在 B8 与 B16 下 NMSE 达 **−18.1546** 与 **−19.2801 dB**，相对 Random 改善 **1.94 与 1.05 dB**；两个预算下其平均 SSIM 也最高（0.9178/0.9255）。收益行使用每个指标最强的已报告基线。图 3 给出均值不确定性区间，图 4 给出配对场景级分布。室外指标包含全部未采样位置（超出测量投影固定的像素）。

**表 I（原文 TABLE I）：100 个留出 RadioMapSeer 场景上的 RM 重建。RMSampler、Uniform 与 Random 共享条件扩散重建器，外部方法保留完整流程。加粗与下划线分别标记最佳方法与最佳基线（按未取整均值）；NC 表示 B8/B16 下 SVT 停止准则未满足。**

| 方法 | B8 NMSE/dB↓ | B8 SSIM↑ | B8 峰值比↑ | B8 Top-1% 召回↑ | B8 Tx 误差/px↓ | B16 NMSE/dB↓ | B16 SSIM↑ | B16 峰值比↑ | B16 Top-1% 召回↑ | B16 Tx 误差/px↓ |
|---|---|---|---|---|---|---|---|---|---|---|
| **RMSampler** | **−18.1546** | **0.9178** | **0.7415** | **0.4416** | **20.12** | **−19.2801** | **0.9255** | **0.8092** | **0.5265** | **14.69** |
| Uniform | −14.4682 | 0.8788 | 0.6020 | 0.2045 | 39.60 | −17.0566 | 0.9009 | 0.7065 | 0.3685 | 25.54 |
| Random | −16.2121 | 0.8977 | 0.6721 | 0.3062 | 31.24 | −18.2314 | 0.9180 | 0.7534 | 0.4237 | 19.48 |
| EGP-AL (GM-Var) | −5.5441 | 0.5199 | 0.2905 | 0.0470 | 71.50 | −8.6235 | 0.6470 | 0.4307 | 0.0860 | 56.28 |
| GP-UCB-CE | −6.3925 | 0.7221 | 0.3214 | 0.0258 | 108.34 | −6.5208 | 0.7310 | 0.3617 | 0.0407 | 91.11 |
| GACP-AE | −3.0874 | 0.3960 | 0.1836 | 0.0462 | 75.78 | −3.5133 | 0.3970 | 0.2458 | 0.0695 | 62.08 |
| EMLS-MC† | NC（B8/B16 下 SVT 残差仍高于固定 \(10^{-4}\) 阈值） | | | | | | | | | |
| RMSampler 增益 | +1.94 dB | +0.0201 | +0.0694 | +0.1353 | +11.12 px | +1.05 dB | +0.0074 | +0.0558 | +0.1029 | +4.79 px |

**图 3（原文 Fig. 3）：** 平均室外 NMSE 与 SSIM（含场景 bootstrap 95% 置信区间）。**图 4（原文 Fig. 4）：** RMSampler 相对基线的配对 NMSE 增益及其分布。

### C. 空间保真与可视化比较

高功率区域指标评估最强干扰区域的恢复。B8 下 RMSampler 在相同条件重建器下把峰值比从 Random 的 0.6721 提升至 **0.7415**、Top-1% 召回从 0.3062 提升至 **0.4416**；两者在 B16 下进一步改善（图 5），说明重建误差降低伴随强信号区域恢复的改善。图 6 在共同归一化色标下比较 RM：六个场景按"相对所有比较基线的最小 B8 NMSE 增益最大"从测试结果中选出，属有利个例；其重建在高功率区域、沿街传播与建筑阴影处更接近真值。完整队列指标给出更全面的结论。

**图 5（原文 Fig. 5）：** 峰值幅度恢复与 Top-1% 室外像素召回。**图 6（原文 Fig. 6）：** 六个测试场景上的 B8 RM 比较（列为方法、行为场景、圆圈为采样位置、星号为真实 Tx 位置）。

### D. 测量—位置行为

采样准则的平衡随已获测量消解发射机位置模糊性而变化。图 7 显示采样早期发射机位置项较大、随后 RM 重建项持续占优；粒子 ESS 与位置熵刻画了相应的权重集中与残余模糊性。结合图 1，这些轨迹说明了测量更新如何引导后续采样。

**图 7（原文 Fig. 7）：** 中位归一化期望误差降低与后验集中度（阴影为四分位距）。

### E. 统计可靠性

在固定条件重建器的配对推断中：相对 Random，B8/B16 的平均 NMSE 校正后 \(p=0.00086\) 与 \(0.0170\)；相对 Uniform 的差异为 **3.686 与 2.223 dB**，区间为正且校正后 \(p<0.001\)。两个预算下的 SSIM 比较也都通过校正检验。图 4 保留完整分布：100 个场景中 RMSampler 分别在 62 与 57 个场景上 NMSE 低于 Random。三个外部流程的 NMSE 比较在两个预算下区间均为正。逐场景预测、测量集与未收敛结果均被保留以便复现。

### F. 发射机定位性能

同一校正后的 Tx 后验支撑三种采样策略的共同定位比较。B16 下平均定位误差从 Random 的 19.48 降至 **14.69 像素**（表 I），配对降低 **4.79 像素**，95% 区间 \([0.47,9.49]\) 像素、Holm 校正后 \(p=0.0345\)；相对 Uniform 与 Random 的四个坐标误差比较均通过校正检验。RMSampler 的命中率（5/10/20 像素内）在表 I 对应行中随预算增加而提高。

### G. 真实测量数据验证

Vienna 与重庆实验中所有 RadioMapSeer 预训练神经参数保持冻结，未在测量数据上微调。记录的参考信号接收功率（RSRP）来自 Vienna 扫描仪测量 [11] 与重庆地面测量 [12]：在最大接收机轨迹分量的最密集 1 km 裁剪区内，按 4 m 像素对每个快照最强同步信号块（SSB）作中值聚合。Vienna 提供 1 m 建筑/地形地图，重庆使用地形与全自由掩码；归一化固定为 \([-147,-47]\) dBm。开发/验证/测试划分为 Vienna 四/四/四小区、重庆四/四/八小区，每个小区平均三个固定种子；真实发射机坐标与未获取值不参与。开发与验证选择数值设置，而已获测量只更新后验量与残差系数。在留出接收机位置评估 RMSE 与 90 分位绝对误差（P90），各小区……（原文续见 PDF）。在共同均匀位置上，表 II 把重建与 RadioUNet [5]、Sparse-Guided RadioUNet [38]、Saipp-Net [39]、Physics-Feature U-Net [40] 与 SIP2Net [41] 的独立实现比较；RadioDiff 先验对与测量对齐的候选取平均，而 RMSampler 后验重新加权。

**表 II（原文 TABLE II）：留出真实测量数据上的 RMSE（dB），采样位置相同且网络参数冻结**

| 方法 | Vienna B8 | Vienna B16 | Chongqing B8 | Chongqing B16 |
|---|---|---|---|---|
| **RMSampler** | **4.84** | **4.29** | **3.75** | **3.08** |
| Kriging | 5.74 | 4.68 | 3.92 | 3.17 |
| GACP-AE | 4.97 | 5.03 | 5.22 | 5.52 |
| RMSampler 后验 | 7.85 | 6.92 | 5.24 | 5.37 |
| RadioDiff 先验 | 9.17 | 9.22 | 6.12 | 6.30 |
| Saipp-Net | 9.21 | 8.97 | 10.30 | 9.68 |
| Physics-Feature U-Net | 9.47 | 8.43 | 13.18 | 12.39 |
| Sparse-Guided RadioUNet | 10.97 | 9.85 | 9.79 | 11.03 |
| RadioUNet | 13.48 | 12.01 | 16.15 | 16.31 |
| SIP2Net | 13.71 | 11.30 | 8.41 | 7.55 |

在图 8 的重庆 NCI 分组端到端采样实验（10 个留出分组）中，取 \(q=0.3\)、\(\omega_\tau=0.01\)；相对随机采样的配对增益为 B8/B16 下 **0.67/0.81 dB**，且小区 bootstrap 区间为正；相对均匀采样的增益为 0.10/0.06 dB，区间包含零。

**图 8（原文 Fig. 8）：** 在 10 个留出重庆 NCI 分组真实 RSRP 上的端到端采样（Kriging 仅使用其自身的 Uniform 或 Random 位置）。

## VI. 结论

RMSampler 通过在干扰发射机位置未知时把**下一位置选择**与**测量条件的推断**耦合，改进稀疏 RM 重建。全局 RM 不确定性与发射机位置不确定性的归一化降低量引导采样，而 ESS 引导校正与最小失真投影在不改变预训练神经参数或架构的前提下利用已收集测量。在仿真 RM 以及 Vienna、重庆真实测量数据上的评估展示了重建改进，包括在共同重建器的重庆协议下相对随机采样更低的 RMSE。

## 参考文献（英文原书目）

[1] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, 2022.

[2] X. Wang, Y. Pan, N. Cheng, Ç. Yapar, R. Sun, Z. Yin, C. Zhou, W. Xu, Y. Zhang, J. Zhang, et al., "A tutorial on learning-based radio map construction: Data, paradigms, and applications," 2025.

[3] X. Wang, Z. Fang, N. Cheng, R. Sun, H. Zhou, Z. Su, Z. Li, and X. Shen, "RadioDiff-inverse: Diffusion enhanced Bayesian inverse estimation for ISAC radio map construction," 2025.

[4] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder, Z.-L. Zhang, and G. B. Giannakis, "Bayesian active learning for sample efficient 5G radio map reconstruction," 2024.

[5] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[6] Y. Teganya and D. Romero, "Deep completion autoencoders for radio map estimation," IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1710–1724, 2022.

[7] H. Sun, S. Liu, X. Yu, Y. Sun, and L. Cao, "Active learning for low-altitude radio map construction via plug-and-play flow matching," arXiv:2609.27486, 2026.

[8] A. Krause, A. Singh, and C. Guestrin, "Near-optimal sensor placements in Gaussian processes: Theory, efficient algorithms and empirical studies," J. Mach. Learn. Res., vol. 9, pp. 235–284, 2008.

[9] N. Zhang, R. Zhou, M.-Y. You, and W. Pu, "Adaptive sampling for online UAV-aided radio map sensing," in Proc. 33rd Eur. Signal Process. Conf., 2025, pp. 985–989.

[10] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction," IEEE Trans. Cogn. Commun. Netw., 2024.

[11] W. Wiedner, L. Eller, M. Mussbah, D. Rössler, V. Maresch, P. Svoboda, and M. Rupp, "The Vienna 4G/5G drive-test dataset," arXiv:2603.02638, 2026.

[12] T. Xu, N. Xu, Y. Xu, and W. Yang, "A real-time 5G macro-cells signal dataset for signal model simulation and prediction within complex terrain area," Sci. Data, 2026.

[13] S. Shrestha, X. Fu, and M. Hong, "Deep spectrum cartography: Completing radio map tensors using learned neural models," IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, 2022.

[14] A. Chaves-Villota and C. A. Viteri-Mera, "DeepREM: Deep-learning-based radio environment map estimation from sparse measurements," IEEE Access, vol. 11, pp. 48 697–48 714, 2023.

[15] S. Zhang, A. Wijesinghe, and Z. Ding, "RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet Things J., 2023.

[16] A. Bora, A. Jalal, E. Price, and A. G. Dimakis, "Compressed sensing using generative models," in Proc. 34th Int. Conf. Mach. Learn., vol. 70, 2017, pp. 537–546.

[17] M. Mardani, E. Gong, J. Y. Cheng, S. S. Vasanawala, G. Zaharchuk, L. Xing, and J. M. Pauly, "Deep generative adversarial neural networks for compressive sensing MRI," IEEE Trans. Med. Imag., vol. 38, no. 1, pp. 167–179, 2019.

[18] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Adv. Neural Inf. Process. Syst., vol. 33, 2020, pp. 6840–6851.

[19] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, "Score-based generative modeling through stochastic differential equations," in Int. Conf. Learn. Represent., 2021.

[20] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and O. Ommer, "High-resolution image synthesis with latent diffusion models," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit., 2022, pp. 10 684–10 695.

[21] X. Wang, Q. Zhang, N. Cheng, J. Chen, Z. Zhang, Z. Li, S. Cui, and X. Shen, "RadioDiff-3D: A 3D×3D radio map dataset and generative diffusion based benchmark for 6G environment-aware communication," 2025.

[22] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, "RadioDiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction," 2025.

[23] H. Chung, B. Sim, D. Ryu, and J. C. Ye, "Improving diffusion models for inverse problems using manifold constraints," in Adv. Neural Inf. Process. Syst., vol. 35, 2022.

[24] B. Kawar, M. Elad, S. Ermon, and J. Song, "Denoising diffusion restoration models," in Adv. Neural Inf. Process. Syst., vol. 35, 2022, pp. 23 593–23 606.

[25] H. Chung, J. Kim, M. T. McCann, M. Klasky, and J. C. Ye, "Diffusion posterior sampling for general noisy inverse problems," in Int. Conf. Learn. Represent., 2023.

[26] J. Song, A. Vahdat, M. Mardani, and J. Kautz, "Pseudoinverse-guided diffusion models for inverse problems," in Int. Conf. Learn. Represent., 2023.

[27] K. Chaloner and I. Verdinelli, "Bayesian experimental design: A review," Statistical Science, vol. 10, no. 3, pp. 273–304, 1995.

[28] D. A. Cohn, Z. Ghahramani, and M. I. Jordan, "Active learning with statistical models," J. Artif. Intell. Res., vol. 4, pp. 129–145, 1996.

[29] N. Srinivas, A. Krause, S. M. Kakade, and M. Seeger, "Gaussian process optimization in the bandit setting: No regret and experimental design," in Proc. 27th Int. Conf. Mach. Learn., 2010.

[30] M. Vergassola, E. Villermaux, and B. I. Shraiman, "Infotaxis as a strategy for searching without gradients," Nature, vol. 445, no. 7126, pp. 406–409, 2007.

[31] S. Chai, M. Ma, J. Li, S. Wu, X. Tong, W. Cui, and X. Fan, "Geometry-aware Cholesky projection for indoor radio map sampling," IEEE Signal Process. Lett., vol. 33, 2026.

[32] H. Sun and J. Chen, "Energy-modified leverage sampling for radio map construction via matrix completion," IEEE Signal Process. Lett., vol. 31, pp. 1780–1784, 2024.

[33] P. G. Bissiri, C. C. Holmes, and S. G. Walker, "A general framework for updating belief distributions," J. Roy. Statist. Soc. Ser. B, vol. 78, no. 5, pp. 1103–1130, 2016.

[34] K. L. Lange, R. J. A. Little, and J. M. G. Taylor, "Robust statistical modeling using the t distribution," J. Amer. Statist. Assoc., vol. 84, no. 408, pp. 881–896, 1989.

[35] A. Kong, J. S. Liu, and W. H. Wong, "Sequential imputations and Bayesian missing data problems," J. Amer. Statist. Assoc., vol. 89, no. 425, pp. 278–288, 1994.

[36] Z. Wang, A. C. Bovik, H. R. Sheikh, and E. P. Simoncelli, "Image quality assessment: From error visibility to structural similarity," IEEE Trans. Image Process., vol. 13, no. 4, pp. 600–612, 2004.

[37] B. Efron, "Bootstrap methods: Another look at the jackknife," Ann. Statist., vol. 7, no. 1, pp. 1–26, 1979.

[38] R. Kojima, S. Ito, T. Nagao, and M. Taya, "Sparse-guided RadioUNet with adaptive sampling for the MLSP 2025 sampling-assisted pathloss radio map prediction data competition," 2025.

[39] B. Feng, M. Zheng, W. Liang, and L. Zhang, "Saipp-Net: A sampling-assisted indoor pathloss prediction method for wireless communication systems," in Proc. IEEE 35th Int. Symp. Pers. Indoor Mobile Radio Commun., 2024.

[40] K. Petrosyan, R. Mkrtchyan, H. Khachatrian, and T. P. Raptis, "U-Net for indoor pathloss prediction from sparse measurements with physics-based features," in Proc. IEEE Int. Conf. Commun. Workshops, 2025.

[41] W. Lu, Z. Lu, J. Yan, and S. Gao, "SIP2Net: Situational-aware indoor pathloss-map prediction network for radio map generation," in Proc. IEEE Int. Conf. Acoust. Speech Signal Process., 2025.

## 图注与表注

**图注：** 图 1（8 个测量的选定测试样例与常用条件扩散重建器）；图 2（RMSampler 利用建筑地图、稀疏测量与 Tx 位置假设的采样与重建示意）；图 3（平均室外 NMSE 与 SSIM，含场景 bootstrap 95% 置信区间）；图 4（RMSampler 相对基线的配对 NMSE 增益分布）；图 5（峰值幅度恢复与 Top-1% 室外像素召回）；图 6（B8 下六个测试场景的 RM 比较，列为方法、行为场景、圆圈为采样位置、星号为真实 Tx）；图 7（中位归一化期望误差降低与后验集中度，阴影为四分位距）；图 8（10 个留出重庆 NCI 分组的端到端采样，Kriging 仅用自身采样位置）。图注已随文置于相应位置。

**表注：** 表 I（100 个留出 RadioMapSeer 场景上的 RM 重建，含 8/16 测量的 5 项指标 × 6 方法及增益行）与表 II（Vienna、重庆留出真实测量数据上的 RMSE，10 个方法 × 2 数据集 × 2 预算）均已在本页逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VI 节全部正文与小节（III-A–C、IV-A–H、V-A–G）、式 (1)–(30)、定理 1/3 与证明、推论 2 与证明、命题 4、表 I–II（逐格转写）、图 1–8 图注、参考文献 [1]–[41]（英文原条目）。原文无附录。**原文说明 3 处已加注：** ① 式 (3)、(4)、(9)、(14)、(16)、(27)、(28) 在 PDF 中跨行断排、抽取时仅保留片段，本页在相应位置以文字准确说明其含义并按原文编号标注，未改写公式；② 若干句子在 PDF 中跨页截断（II 节末、III 节首、V-G 节中），本页按可见部分翻译并以"（原文续见 PDF）"标注；③ 表 I 中 EMLS-MC 行按原文为未收敛（NC）说明，未给出数值。逐句逐式终校未做；供后续 QA 重点核对：式 (10)–(15) 的归一化降低量与定理 1 的截断记号、式 (18)–(22) 的 Student-\(t\) 损失与 KL 表述、表 I/II 数值、以及真实数据实验的种子与划分描述。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
