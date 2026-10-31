---
layout: page
title: "RF 线索导航：多径不确定性下的具身感知与行动｜中文全文译文"
permalink: /papers/translations/2026-10-23-navigation-with-rf-cues-embodied-perception-action-under-multipath-unc-2610-08105/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c5e01298c0328f14/) · [原文 arXiv](https://arxiv.org/abs/2610.08105) · [全部目录](/papers/catalog/)

# RF 线索导航：多径不确定性下的具身感知与行动

**原题：** Navigation with RF Cues: Embodied Perception–Action under Multipath Uncertainty  
**作者：** Wenlihan Lu、Tianshun Li、Liuqing Yang、Shijian Gao  
**单位：** 香港科技大学（广州）（Hong Kong University of Science and Technology (Guangzhou)），中国广州。  
**版本：** arXiv:2610.08105v1（cs.RO），2026 年 10 月 6 日；6 页（正文 + 参考文献，含图 1—4、表 I—IV）。  
**索引词：** RF 信息导航、具身感知—行动、多径不确定性、Habitat–Sionna RT。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—V 节（I 引言；II 问题表述含 A 任务设置/B 任务目标；III 所提方案含 A RF 与视觉观测编码/B 不确定性感知目标预测器/C 基于记忆的导航策略；IV 实验含 A 基准与实验设置/B 对比方法与结果/C 消融研究；V 结论）、**表 I—IV 逐格转录**（已用本地 PDF 第 5、6 页渲染图核对表 II—IV；表 I 按抽取文本转录）、图 1—4 中文图注、参考文献 [1]—[18]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(16) 按原文保留。逐句逐式终校未做。

## 摘要

智能工厂巡检要求机器人在**没有先验地图、也不知道目标坐标**的情况下到达相连的设备。来自目标的射频（RF）信号可以在地形遮挡或光照不良限制目标检测时，提供方向线索以补充视觉观测。然而**多径传播**会扭曲这些线索，使从瞬时 RF 测量中难以推断目标的真实方向。为在这些条件下开展导航研究，我们首先构建了 **Habitat–Sionna RT 基准**：它利用细致的场景几何与指定的材质属性，针对机器人的动作生成**对齐的视觉与 RF 观测**。基于该基准，我们提出一种**不确定性感知的多模态导航框架**：从 RF、视觉与位姿观测的历史中联合估计目标方向及其不确定性，并将这些估计与视觉上下文一起用于动作选择。在未见场景中的实验相较最强评测基线，成功率（SR）取得 18.2% 的相对提升，按路径长度加权的成功率（SPL）相对提升 11.5%。

## I. 引言

在智能工厂中，移动机器人可能需要靠近相连的设备进行巡检，却缺乏室内定位信息。这构成一个**具身导航任务**：机器人必须利用自身观测找到并到达坐标未知的目标。视觉观测支持探索与避障，但机械与货架可能遮挡目标、限制视觉引导。对具备 Wi-Fi 或低功耗蓝牙（BLE）连接的设备，接收信号强度 [1]、[2] 与到达方向 [3] 等 RF 测量可提供额外位置线索；这些测量利用正常通信期间发射的信号 [4]、[5] 补充视觉观测，无需专用导航信标。

这些位置线索的可靠性受室内**多径传播**影响：反射在目标与机器人之间产生多条信号路径，强反射分量可能使估计的到达方向偏离真实目标方位；路径间干扰还使接收信号强度波动，因此更强接收并不必然意味着机器人正在接近目标。随着机器人移动，这些路径的相对长度与强度变化进一步改变观测到的 RF 线索，使仅凭瞬时测量难以持续朝目标导航。

为缓解误导性 RF 线索，mmWave-LSC [6] 结合路径估计与链路状态分类，在 RF 方向引导与视觉探索之间选择；PIRL [7] 把传播特性纳入奖励设计；PiPRL [8] 用符号程序与估计的链路状态引导导航。这些方法需要来自毫米波硬件的详细信道测量，限制了其对仅有 Wi-Fi 或 BLE 目标的直接适用性。此外，紧凑接收阵列空间分辨率有限，使多径分量难以区分、目标方向不确定。因此我们**从多模态观测历史中联合估计目标方向及其不确定性**，并把二者与视觉上下文一起整合用于动作选择。

在多径条件下评估导航，需要一个支持**感知—行动闭环**的交互式基准：机器人执行动作，并在所得位姿处接收视觉与 RF 观测以进行下一次决策。P2SLAM [9] 与 WAIS [10] 等现有数据集提供真实 Wi-Fi 测量及视觉与运动数据，但其固定轨迹无法为导航策略选择的任意动作提供观测，限制了闭环评估的用途。mmWave-LSC [6] 中的仿真基准支持此类交互，但其 RF 仿真依赖简化的平面图几何，忽略了更细的场景细节。这些局限促使我们构建一种**保留细致场景几何、并能针对机器人动作生成对齐视觉与 RF 观测**的交互式 RF 导航基准。

为应对不可靠的 RF 线索与缺乏细致建模的交互式基准，我们开发了一个导航框架与一个仿真基准。框架把**不确定性感知目标预测器**与改编的场景记忆 Transformer [11] 相结合：预测器从包含 RF 观测（RSSI 与 MUSIC 空间谱）、RGB 图像、深度图像与位姿信息的多模态观测历史中估计目标方位分布，而场景记忆把这些信息与视觉、位姿特征整合用于动作选择。我们的 Habitat–Sionna RT 基准使用 MP3D 场景 [12]，把具身导航 [13] 与 RF 仿真 [14] 耦合，在保留细致几何与材质相关传播效应的同时，针对机器人动作生成观测。在 27 个未见场景的 1,350 个回合中，本方法取得 SR 0.546 与 SPL 0.456，分别超过最强评测基线 18.2% 与 11.5%。

## II. 问题表述

我们考虑移动机器人在未知室内环境中导航到静止目标。在无先验地图、也无法获得目标坐标的情况下，机器人必须利用自身观测探索环境、到达目标并在附近停止。视觉与运动观测支持探索与避障，而目标处 RF 发射机发出的信号提供额外的方向线索——这些线索可能被多径传播扭曲。下面说明任务设置与目标。

### A. 任务设置

记 $\mathcal C$ 为室内场景、$\mathcal X_{\mathcal C}$ 为其可导航空间，目标位于未知位置 $g\in\mathcal X_{\mathcal C}$。第 $t$ 步机器人具有位姿 $p_t=(x_t,y_t,\phi_t)$，其中 $(x_t,y_t)$ 为位置、$\phi_t$ 为朝向。从 $p_0$ 出发，机器人接收观测

$$
o_t=\left(I_t^{\mathrm{rgb}},I_t^{d},u_t,w_t\right),\tag{1}
$$

其中 $I_t^{\mathrm{rgb}}$ 与 $I_t^{d}$ 分别为以机器人为中心的 RGB 与深度图像，$u_t$ 表示相对初始位姿的里程计，$w_t$ 包含 RF 线索。空间谱提供导航方向线索；但室内环境中的反射与散射引起多径传播，使估计的到达方向可能偏离到目标的几何方位。

每一步机器人从

$$
\mathcal A=\{\text{MOVE FORWARD},\text{TURN LEFT},\text{TURN RIGHT},\text{STOP}\}\tag{2}
$$

中选择动作。我们采用离散动作配置 [15]：前进动作使机器人移动 0.25 m，每次左转或右转使朝向改变 $15^\circ$。机器人每次移动后获得新观测，并须根据可用信息判断何时停止。

### B. 任务目标

导航策略根据迄今为止接收的所有观测及先前动作选择每个动作。一个回合在机器人选择 STOP 或达到最大动作数 $T_{\max}$ 时终止。

记 $\tau$ 为导航回合中机器人的轨迹、$t_{\text{end}}$ 为该回合最终决策步。若机器人在到目标测地距离小于成功阈值 $\epsilon$ 的位置选择 STOP，则该回合成功。成功指示定义为

$$
\sigma(\tau)\triangleq\mathbb I\left[a_{t_{\text{end}}}=\text{STOP}\ \wedge\ d_{\text{geo}}\left(p_{t_{\text{end}}},g\right)<\epsilon\right],\tag{3}
$$

其中 $\mathbb I[\cdot]$ 为指示函数，$d_{\text{geo}}(p_t,g)$ 表示机器人在位姿 $p_t$ 处到目标 $g$ 的最短可通行路径距离。

该任务既要求导航成功，也要求行程高效。记 $L(\tau)$ 为机器人行进总距离、$L^*=d_{\text{geo}}(p_0,g)$ 为初始位置到目标的最短路径距离，则任务级目标是最大化期望 SPL：

$$
\max_\pi\ \mathbb E_{\tau\sim P_\pi}\left[\sigma(\tau)\frac{L^*}{\max\{L(\tau),L^*\}}\right],\tag{4}
$$

其中 $P_\pi$ 表示由导航策略以及场景、初始位姿与目标位置分布诱导的轨迹分布。

## III. 所提方案

图 1 展示所提架构：RF 观测提供目标方向线索，视觉观测提供用于空间理解与避障的场景上下文。不确定性感知目标预测器从多模态观测历史中估计目标方向上的分布；场景记忆 Transformer 把该分布与视觉、位姿特征在时间上整合以引导导航。

### A. RF 与视觉观测编码

RF 前端使用朝前的 $1\times2$ 贴片天线阵获取 RSSI 与 MUSIC 空间谱 [16]。令 $\mathbf x_{t,k}\in\mathbb C^2$ 表示时刻 $t$ 的第 $k$ 个阵列快拍，则样本协方差为

$$
\hat{\mathbf R}_t=\frac1K\sum_{k=1}^K\mathbf x_{t,k}\mathbf x_{t,k}^H.\tag{5}
$$

这里 $(\cdot)^H$ 表示共轭转置。我们通过评估阵列导向向量与由 $\hat{\mathbf R}_t$ 估计的噪声子空间之间的正交性，得到 MUSIC 空间谱 $P_t(\theta)$ [16]。基于峰值的到达方向估计为

$$
\hat\theta_t^{\mathrm{MUSIC}}=\arg\max_{\theta\in\Theta}P_t(\theta),\tag{6}
$$

其中 $\Theta$ 为机器人坐标系中扫描的方位角集合。在多径传播下，主导峰可能对应反射到达而非到目标的几何方向。因此我们把**采样谱**与 RSSI 一并纳入 RF 观测 $w_t$，在单一峰值之外保留方向信息，供后续目标方向与不确定性预测使用。

我们把 RF 观测 $w_t$ 编码为特征 $\mathbf r_t^{\mathrm{rf}}$。独立编码器产生 RGB 与深度 token $\mathbf e_t^{v}$ 与 $\mathbf e_t^{d}$，位姿编码器把里程计与先前动作结合产生 $\mathbf e_t^{p}$：

$$
\mathbf r_t^{\mathrm{rf}}=f^{\mathrm{rf}}(w_t),\quad\mathbf e_t^{p}=f^{p}(u_t,a_{t-1}),\quad\mathbf e_t^{v}=f^{v}(I_t^{\mathrm{rgb}}),\quad\mathbf e_t^{d}=f^{d}(I_t^{d}).\tag{7}
$$

这些特征为导航提供互补信息：RF 观测提供方向线索，RGB 与深度观测提供场景上下文，位姿特征描述机器人运动。它们的历史由目标预测器联合处理以支持源方向估计；目标预测器把估计方向及其不确定性编码为**目标 token**，再在场景记忆 Transformer 中与视觉、位姿 token 融合。这种融合使策略能在周围障碍与可通行空间的上下文中评估朝目标运动，引导动作选择趋向目标。

### B. 不确定性感知目标预测器

预测器利用多模态观测历史估计源方位及其不确定性，降低对反射引起的 MUSIC 峰值的依赖。一个**传播融合 Transformer** 处理拼接后的 RF、RGB、深度与位姿特征序列：

$$
\mathbf m_{1:t}^{f}=\mathcal F^{\mathrm{prop}}\left(\left\{[\mathbf r_i^{\mathrm{rf}};\mathbf e_i^{v};\mathbf e_i^{d};\mathbf e_i^{p}]\right\}_{i=1}^{t}\right).\tag{8}
$$

当前表示 $\mathbf m_t^{f}$ 捕捉跨观测与机器人运动的方向证据与视觉场景上下文。我们用 **von Mises 分布**——正态分布的圆周类比——建模目标方位。与线性变量不同，方位在 $[0,2\pi)$ 上周期，0 与 $2\pi$ 表示同一方向；von Mises 分布尊重这一周期性，并通过集中参数刻画方向不确定性，因而适合方位预测。预测头把 $\mathbf m_t^{f}$ 映射为均值方向 $\mu_t$ 与非负集中度 $\kappa_t$：

$$
p(\theta\mid\mu_t,\kappa_t)=\frac{\exp\left[\kappa_t\cos(\theta-\mu_t)\right]}{2\pi I_0(\kappa_t)},\tag{9}
$$

其中 $\theta$ 表示机器人坐标系中的候选方位，$I_0$ 为零阶修正 Bessel 函数；$\kappa_t$ 越大表示预测越集中。给定真值方位 $\theta_t^*$，训练最小化负对数似然：

$$
\mathcal L_{\mathrm{goal}}=\mathbb E_t\left[\log\left(2\pi I_0(\kappa_t)\right)-\kappa_t\cos\left(\theta_t^*-\mu_t\right)\right].\tag{10}
$$

真值方位仅用于训练。与式（6）的瞬时谱峰估计 $\hat\theta_t^{\mathrm{MUSIC}}$ 不同，$\mu_t$ 由多模态观测历史预测得到。预测分布参数被编码为目标 token $\mathbf e_t^{f}=f^{\mathrm{goal}}([\cos\mu_t;\sin\mu_t;\kappa_t])$，其中 $f^{\mathrm{goal}}$ 为 MLP、$[\cdot;\cdot]$ 表示拼接；正弦与余弦编码圆周方位，$\kappa_t$ 表示方向集中度。该 token 把方向与不确定性带入场景记忆 Transformer。

### C. 基于记忆的导航策略

我们通过用**不确定性感知目标 token** 增强观测表示，把场景记忆 Transformer [11] 改编用于 RF 信息导航。具体地，式（7）的 RGB、深度与位姿 token $\mathbf e_t^{v}$、$\mathbf e_t^{d}$、$\mathbf e_t^{p}$ 提供视觉场景上下文与机器人运动信息；同一式的 RF 特征 $\mathbf r_t^{\mathrm{rf}}$ 与视觉、位姿历史一起由目标预测器处理，以估计 $\mu_t$ 与 $\kappa_t$ 并编码为目标 token $\mathbf e_t^{f}$。所得观测表示为 $\mathbf E_t=\{\mathbf e_t^{v},\mathbf e_t^{d},\mathbf e_t^{p},\mathbf e_t^{f}\}$。通过随时间保留这些 token，场景记忆使历史目标估计及其不确定性同视觉、运动上下文一起用于动作选择。历史 token 被处理为场景记忆上下文：

$$
\mathbf M_{1:t-1}=\mathcal F^{\mathrm{mem}}\left(\{\mathbf E_i\}_{i=1}^{t-1}\right).\tag{11}
$$

观测查询 $\mathbf Q_t$ 由当前 token 形成，并通过交叉注意力检索相关历史特征：

$$
\mathbf c_t^{\mathrm{mem}}=\operatorname{softmax}\left(\frac{\mathbf Q_t\mathbf K_t^\top}{\sqrt{d_k}}\right)\mathbf V_t^{\mathrm{mem}},\tag{12}
$$

其中 $\mathbf K_t$ 与 $\mathbf V_t^{\mathrm{mem}}$ 为由场景记忆 $\mathbf M_{1:t-1}$ 导出的键与值，$d_k$ 为键维数；softmax 在历史 token 上计算。当前 token 在每次决策后存储，记忆在每个回合重置。

检索到的上下文与当前观测表示拼接，得到策略特征 $\mathbf z_t$。actor 把 $\mathbf z_t$ 映射为四个导航动作上的分布，critic 估计期望回报：

$$
\pi_\psi(a_t\mid h_t)=\operatorname{softmax}\left(f^{\mathrm{actor}}(\mathbf z_t)\right),\tag{13}
$$

$$
V_t=f^{\mathrm{critic}}(\mathbf z_t).\tag{14}
$$

这里 $\psi$ 表示策略参数，$h_t$ 表示交互历史——包含截至时刻 $t$ 接收的所有观测及先前动作。导航奖励鼓励朝目标前进与成功停止：

$$
r_t=\alpha\left(d_{\text{geo},t}-d_{\text{geo},t+1}\right)+\beta\mathbb I\left[D_t=1\wedge\sigma_t=1\right]-\eta\mathbb I\left[D_t=1\wedge\sigma_t=0\right],\tag{15}
$$

其中 $\alpha$、$\beta$、$\eta$ 分别为导航进展、成功终止与不成功终止的正系数。我们取较大的 $\beta$ 与较小的 $\eta$，以强调成功导航、同时对失败施加适度惩罚。距离为 $d_{\text{geo},t}=d_{\text{geo}}(p_t,g)$，$D_t$ 表示回合终止，$\sigma_t=\mathbb I[a_t=\text{STOP}\wedge d_{\text{geo},t}<\epsilon]$ 为对应式（3）的逐步成功指示。距离与成功信号仅用于训练，不作为策略输入。

我们用近端策略优化（PPO）[17] 训练模型以最大化期望折扣导航回报，并结合辅助方向预测目标，联合损失为

$$
\mathcal L=\mathcal L_{\mathrm{PPO}}+c_v\mathcal L_V-c_e\mathrm{Ent}(\pi_\psi)+\lambda_g\mathcal L_{\mathrm{goal}},\tag{16}
$$

其中 $\mathcal L_{\mathrm{PPO}}$ 为裁剪策略损失、$\mathcal L_V$ 为价值损失、$\mathrm{Ent}(\pi_\psi)$ 为策略熵。目标预测损失学习带不确定性的方向表示，而导航目标学习如何利用该表示与场景记忆进行动作选择。

## IV. 实验

### A. 基准与实验设置

实验使用 90 个 Matterport3D（MP3D）场景 [12]，配有成对的 Habitat 可导航网格与 Sionna RT 资产。固定的场景级划分把 63 个场景用于训练、27 个用于评估，两者不重叠。Habitat Pathfinder 采样测地距离在 $[8,20]$ m 的可导航起点与目标用于训练；评估在每个留出场景使用 50 个固定回合（相同距离范围），共 1,350 个回合。成功阈值 $\epsilon=1$ m，回合上限 $T_{\max}=200$ 个动作，RGB-D 观测以 $256\times256$ 分辨率渲染。

如图 2 所示，基准使用 MP3D 场景几何，通过 Habitat 与 Sionna RT 生成成对的视觉与 RF 观测：Habitat 渲染以机器人为中心的 RGB-D 图像；对 RF 仿真，我们按语义标注把场景网格分区、为所得区域指派材质类别，并在仿真频率下用 ITU 材质模型指定其电磁属性。固定的坐标变换在两个仿真器之间对齐机器人位姿与发射机位置。每个导航步，Sionna RT 按表 I 的设置仿真多径传播，给出对应当前机器人位姿的 RF 观测。

为刻画传播条件，我们分析从各起点到目标的最短路径**预言机轨迹**：沿这些轨迹，若未解析出任何传播路径则该 RF 观测无效；否则若有畅通无交互路径则为 LOS，若没有则为 NLOS。在预言机轨迹上，27.4% 的观测为 LOS、67.1% 为 NLOS、5.5% 为无效（图 3(a)）——可见即使沿最短路径，间接传播也占主导。

所有方法在原始设计允许时共享场景划分、动作空间、视觉编码器、训练观测与环境交互预算。我们报告 SR、SPL 与到目标的最终距离（DTG，定义为 $d_{\text{geo},t_{\text{end}}+1}$）；SR/SPL 越高、DTG 越低表示性能越好。

### B. 对比方法与结果

我们把所提框架与以下基线比较：

- **随机策略（Random policy）：** 随机选择导航动作。
- **RSSI 梯度控制器：** 利用接收信号强度的变化引导导航趋向更强接收。
- **MUSIC-DOA 控制器：** 用 MUSIC 空间谱的峰值方向作为估计目标方位。
- **mmWave-LSC** [6]：结合路径估计与链路状态分类，在方向引导与视觉探索间选择；适配到本设置可用的 RF 观测。
- **PiPRL** [8]：用符号程序与估计的链路状态引导导航；适配到本设置可用的 RF 观测。
- **SAVN-CE** [18]：作为带确定性目标表示的基于记忆的导航基线。

所有适配后的学习型基线都在相同训练划分上重训练。表 II 报告留出评估回合的性能。

RSSI 梯度与 MUSIC-DOA 控制器很少成功，SR 分别仅 0.002 与 0.074；这些结果表明仅依赖 RF 线索难以成功导航，凸显纳入视觉观测的重要性。适配后的学习方法表现更好，PiPRL 取得 SR 0.328 与 SPL 0.264；SAVN-CE 是最强基线，取得 SR 0.462 与 SPL 0.409。

所提方法取得最高 SR 与 SPL，分别为 0.546 与 0.456；其平均训练奖励也整体上升（图 3(b)）。与 SAVN-CE 相比，这相当于 SR 提高 8.4 个百分点、SPL 绝对提升 0.047，即相对提升分别为 18.2% 与 11.5%。本方法还把 DTG 从 5.810 m 降至 4.176 m，表明回合平均结束位置更接近目标。这些比较支持所提框架在间接 RF 传播占主导的未见室内场景中的有效性。图 4 展示了四种不同 RF 传播条件下的轨迹。

### C. 消融研究

表 III 考察方向不确定性与 RF 历史的作用。从目标 token 中移除 $\kappa$ 使 SR 从 0.546 降至 0.489、SPL 从 0.456 降至 0.420，支持显式编码不确定性的价值；仅使用当前步 RF 观测造成最大降幅——SR 降至 0.263、SPL 降至 0.217，凸显 RF 历史的重要性。

表 IV 报告完整模型在降低 RGB 曝光下的性能。把曝光因子从 1.0 降至 0.7，SR 从 0.546 降至 0.515、SPL 从 0.456 降至 0.436；进一步降至 0.5 得 SR 0.511，而 SPL 在报告精度下保持 0.436。相对正常曝光，曝光因子 0.5 时 SR 绝对下降 0.035、SPL 下降 0.020。这些结果提示模型能容忍所测试的曝光降低，性能退化幅度适中。

## V. 结论

本文提出一种朝向 RF 源的室内多模态导航框架。Habitat–Sionna RT 基准通过为语义分割的 MP3D 网格指派电磁属性，把具身导航与材质感知的无线传播仿真整合；它保留细致场景几何，并在机器人移动时生成空间对齐的视觉与 RF 观测。所提导航方法把不确定性感知的 RF 目标表示与多模态记忆结合，以应对多径传播下不可靠的方向线索。在 27 个未见场景上的实验表明其在导航成功率与路径效率上优于评测基线。未来工作将聚焦真实机器人验证与更大天线阵列以提升角分辨率。

## 图注与表注

### 图注

**图 1（原 PDF 第 3 页）：** 所提框架概览。不确定性感知目标预测器利用多模态观测历史预测源方向上的 von Mises 分布，其目标 token 与 RGB、深度、位姿 token 一同存入场景记忆 Transformer；由当前观测形成的查询通过交叉注意力检索历史上下文以供 actor-critic 导航使用。真值方向监督仅在训练中使用。图中含：(A) 观测编码（MUSIC+RSSI 经 RF 编码器得 $\mathbf r_t^{\mathrm{rf}}$；里程计+先前动作经位姿编码器得 $\mathbf e_t^{p}$；RGB/深度分别得 $\mathbf e_t^{v}$、$\mathbf e_t^{d}$）；(B) 不确定性感知目标预测器（传播融合 Transformer → von Mises 头输出 $\mu_t,\kappa_t$，训练时以真值方位 $\theta_t^*$ 计算 NLL 损失，目标嵌入 $[\cos\mu_t,\sin\mu_t,\kappa_t]$ 经 MLP 得 $\mathbf e_t^{f}$）；(C) 场景记忆 Transformer（存储历史 token 并于决策后更新）；(D) actor-critic 策略（动作概率 FLRS 与价值 $V_t$）。

**图 2（原 PDF 第 4 页）：** 从 MP3D 场景构建 Habitat–Sionna RT 基准：Habitat 渲染以机器人为中心的 RGB-D 观测，而语义分割网格被指派 ITU 材质模型的电磁属性、用于 Sionna RT 中的 RF 仿真；图中标注视觉 RGB-D 数据、无线信道数据、以机器人为中心的 RGB 视图、深度图、无线接收机与发射机、MUSIC 空间谱、语义分割与电磁材质指派。

**图 3（原 PDF 第 4 页）：** (a) 沿最短路径预言机轨迹的视距（LOS）、非视距（NLOS）与无效观测分布：LOS 27.4%、NLOS 67.1%、无效 5.5%。(b) 训练期间每步平均奖励随更新次数的变化。

**图 4（原 PDF 第 5 页）：** 所提方法的定性轨迹。彩色路段表示 LOS、NLOS 与 RF 信号不可用；标记表示起点与目标。(a)—(d) 为四种轨迹示例。

### 表 I：训练与 RF 仿真参数（原 PDF 第 4 页）

| 参数 | 取值 |
|---|---|
| 回合动作上限（$T_{\max}$） | 200 |
| 初始测地距离 | $[8,20]$ m |
| 成功阈值（$\epsilon$） | 1 m |
| RGB-D 分辨率 | $256\times256$ |
| 奖励权重（$\alpha,\beta,\eta$） | (2.0, 10.0, 1.0) |
| 载波频率 | 2.4 GHz |
| 接收阵列 | $1\times2$ 贴片 |
| 阵元间距 | 半波长 |
| 最大反射/折射深度 | 5 |
| 接收机热噪声 | 启用 |

### 表 II：27 个未见 MP3D 场景、1,350 个回合上的主要结果（原 PDF 第 5 页）

| 方法 | SR↑ | SPL↑ | DTG (m)↓ |
|---|---|---|---|
| 随机策略 | 0.000 | 0.000 | 12.512 |
| RSSI 梯度控制器 | 0.002 | 0.001 | 10.129 |
| MUSIC-DOA 控制器 | 0.074 | 0.069 | 8.360 |
| mmWave-LSC [6]（适配） | 0.155 | 0.116 | 8.173 |
| PiPRL [8]（适配） | 0.328 | 0.264 | 7.030 |
| SAVN-CE [18] | 0.462 | 0.409 | 5.810 |
| 本文方法 | **0.546** | **0.456** | **4.176** |

### 表 III：未见场景上的消融结果（原 PDF 第 6 页）

| 变体 | SR↑ | SPL↑ |
|---|---|---|
| 完整模型 | **0.546** | **0.456** |
| 目标 token 中移除 $\kappa$ | 0.489 | 0.420 |
| 仅当前步 RF | 0.263 | 0.217 |
| 确定性目标（SAVN-CE） | 0.462 | 0.409 |

### 表 IV：降低 RGB 曝光下的导航性能（原 PDF 第 6 页）

| 曝光因子 | SR↑ | SPL↑ |
|---|---|---|
| 1.0 | 0.546 | 0.456 |
| 0.7 | 0.515 | 0.436 |
| 0.5 | 0.511 | 0.436 |

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、卷号与在线链接。

[1] C. Wu, Z. Yang, Z. Zhou, Y. Liu, and M. Liu, "Mitigating large errors in WiFi-based indoor localization for smartphones," IEEE Transactions on Vehicular Technology, vol. 66, no. 7, pp. 6246–6257, 2017.

[2] W. Lu, S. Gao, M. Wen, Y. Liang, L. Yang, C.-B. Chae, and H. V. Poor, "Bayesian-driven graph reasoning for active radio map construction," in 2025 Seventeenth International Conference on Wireless Communications and Signal Processing (WCSP), 2025.

[3] M. Kotaru, K. Joshi, D. Bharadia, and S. Katti, "SpotFi: Decimeter level localization using WiFi," in ACM SIGCOMM 2015 Conference, 2015.

[4] F. de Ponte Müller, M. Schmidhammer, and S. Sand, "Radio-based sensing in vehicular environments: Robust localization and tracking of VRUs," in 2023 IEEE 97th Vehicular Technology Conference (VTC2023-Spring), 2023.

[5] S. Bi, J. Yu, Z. Yang, X. Lin, and Y. Wu, "Joint 3-D deployment and resource allocation for UAV-assisted integrated communication and localization," IEEE Wireless Communications Letters, vol. 12, no. 10, pp. 1672–1676, 2023.

[6] M. Yin, A. Veldanda, A. Trivedi, J. Zhang, K. Pfeiffer, Y. Hu, S. Garg, E. Erkip, L. Righetti, and S. Rangan, "Millimeter wave wireless assisted robot navigation with link state classification," arXiv:2110.14789, 2021.

[7] T. Li, H. Lei, H. Guo, M. Yin, Y. Hu, Q. Zhu, and S. Rangan, "Digital twin-enhanced wireless indoor navigation: Achieving efficient environment sensing with zero-shot reinforcement learning," IEEE Open Journal of the Communications Society, vol. 6, pp. 2356–2372, 2025.

[8] T. Li, H. Lei, M. Yin, and Y. Hu, "Reinforcement learning with physics-informed symbolic program priors for zero-shot wireless indoor navigation," arXiv:2506.22365, 2025.

[9] A. Arun, R. Ayyalasomayajula, W. Hunter, and D. Bharadia, "P2SLAM: Bearing based WiFi SLAM for indoor robots," IEEE Robotics and Automation Letters, vol. 7, no. 2, pp. 3326–3333, 2022.

[10] A. Arun, W. Hunter, R. Ayyalasomayajula, and D. Bharadia, "WAIS: Leveraging WiFi for resource-efficient SLAM," in 22nd Annual International Conference on Mobile Systems, Applications and Services (MobiSys), 2024.

[11] K. Fang, A. Toshev, L. Fei-Fei, and S. Savarese, "Scene memory transformer for embodied agents in long-horizon tasks," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2019.

[12] A. Chang, A. Dai, T. Funkhouser, M. Halber, M. Nießner, M. Savva, S. Song, A. Zeng, and Y. Zhang, "Matterport3D: Learning from RGB-D data in indoor environments," in International Conference on 3D Vision (3DV), 2017.

[13] M. Savva, A. Kadian, O. Maksymets, Y. Zhao, E. Wijmans, B. Jain, J. Straub, J. Liu, V. Koltun, J. Malik, D. Parikh, and D. Batra, "Habitat: A platform for embodied AI research," in IEEE/CVF International Conference on Computer Vision (ICCV), 2019.

[14] J. Hoydis, F. Aït Aoudia, S. Cammerer, M. Nimier-David, N. Binder, G. Marcus, and A. Keller, "Sionna RT: Differentiable ray tracing for radio propagation modeling," in IEEE Globecom Workshops (GC Wkshps), 2023.

[15] J. Krantz, E. Wijmans, A. Majumdar, D. Batra, and S. Lee, "Beyond the nav-graph: Vision-and-language navigation in continuous environments," in European Conference on Computer Vision (ECCV), 2020.

[16] R. O. Schmidt, "Multiple emitter location and signal parameter estimation," IEEE Transactions on Antennas and Propagation, vol. 34, no. 3, pp. 276–280, Mar. 1986.

[17] J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov, "Proximal policy optimization algorithms," arXiv:1707.06347, 2017.

[18] Y. Zeng, H. Wang, M. Liu, Y. Zhou, C. Gao, K. Chen, and G. Huang, "Semantic audio-visual navigation in continuous environments," in IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2026.

**本页范围与校对状态：** 本页依据 arXiv:2610.08105v1（cs.RO，2026-10-06，6 页）完成全文中文翻译：摘要、索引词、第 I—V 节（含 II-A/II-B、III-A—III-C、IV-A—IV-C）、图 1—4 中文图注、表 I—IV 逐格转录、参考文献 [1]—[18] 英文原条目（按原编号）均按原文结构录入；编号公式 (1)—(16) 按原文保留。**表 II、表 III、表 IV 已用本地 PDF 第 5、6 页渲染图逐格核对一致**；表 I 按抽取文本转录（参数与正文一致）。**逐句逐式终校未做**；图 1—4 的图像内容未数字化，只转录图注与正文关键数值（SR 0.546、SPL 0.456、相对提升 18.2%/11.5%、LOS/NLOS/无效比例 27.4%/67.1%/5.5% 等）；参考文献未联网核验 DOI、卷号与在线链接。原文疑点已就地加注：①表 II 中 SAVN-CE 为最强基线（SR 0.462/SPL 0.409），所提方法相对其提升 18.2%/11.5% 与正文一致；②表 III 的"Deterministic goal（SAVN-CE）"行与表 II 的 SAVN-CE 数值一致，属对照行而非新方法；③原文图 3(b) 训练奖励曲线的纵轴标注为 "Reward / step" 并给出 −0.5/0/0.15 刻度，属原图排版，本页仅按图注转录。原文为 arXiv 预印本（cs.RO），可作可公开全文登记。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
