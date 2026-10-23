---
layout: page
title: "多径不确定性下的射频线索具身导航｜中文全文译稿（待终校）"
permalink: /papers/translations/2026-10-23-rf-navigation-multipath-2610-08105/
math: true
toc: true
---

[← 返回论文库](/papers/) · [arXiv](https://arxiv.org/abs/2610.08105) · [原文 PDF](https://arxiv.org/pdf/2610.08105v1)

# 利用射频线索导航：多径不确定性下的具身感知—行动

**原题：** Navigation with RF Cues: Embodied Perception–Action under Multipath Uncertainty  
**作者：** Wenlihan Lu、Tianshun Li、Liuqing Yang、Shijian Gao  
**单位：** 香港科技大学（广州），中国广州  
**版本：** arXiv:2610.08105v1，2026 年 10 月 6 日，6 页。  
**状态：** 正文 I—V、编号公式（1）—（16）、全部图表说明与表格已译；文末 18 条参考文献保留英文原始书目，仍待逐式终校。本文不在本站重复上传 PDF 图像。

## 摘要

智能工厂巡检要求机器人在没有先验地图或已知目标坐标的情况下到达联网设备。当遮挡或照明不良妨碍目标检测时，目标发出的射频（radio-frequency，RF）信号可提供方向线索，补充视觉观测。然而，多径传播可能扭曲这些线索，使机器人难以仅凭瞬时 RF 测量推断目标真实方位。为支持此类条件下的导航研究，我们首先构建了 Habitat–Sionna RT 基准环境，利用精细的场景几何与指定的材料属性，响应机器人的动作生成相互对齐的视觉与 RF 观测。在该基准上，提出一种不确定性感知的多模态导航框架，根据 RF、视觉和位姿观测历史联合估计目标方向及其不确定性，并结合视觉上下文选择动作。在未见过的场景中，相比评估中表现最好的基线，该方法的成功率（success rate，SR）相对提高 18.2%，按路径长度加权的成功率（success weighted by path length，SPL）相对提高 11.5%。

**索引词：** RF 辅助导航、具身感知—行动、多径不确定性、Habitat–Sionna RT。

## I. 引言

在智能工厂中，即使缺乏室内定位信息，移动机器人仍可能需要靠近联网设备并实施巡检。这构成一种具身导航任务：机器人必须利用自身传感器的观测寻找并抵达坐标未知的目标。视觉观测有助于探索和避障，但机械设备和货架可能遮挡目标，从而限制视觉导航。对于具备 Wi-Fi 或低功耗蓝牙（Bluetooth Low Energy，BLE）连接能力的设备，接收信号强度 [1]、[2] 和到达方向 [3] 等 RF 测量能够提供额外的位置线索。这些测量利用常规通信过程中发射的信号 [4]、[5] 补充视觉观测，无须设置专用导航信标。

这些位置线索的可靠性受室内多径传播影响。反射在目标与机器人之间形成多条传播路径，强反射分量可能使估计到达方向偏离目标的真实方位。路径间干涉也会引起接收信号强度波动，因此更强的接收信号并不一定说明机器人正在接近目标。机器人移动时，各路径的相对长度和强度持续变化，RF 观测线索也随之改变，使机器人难以仅依据瞬时测量持续朝目标导航。

为了缓解误导性的 RF 线索，mmWave-LSC [6] 联合路径估计与链路状态分类，在 RF 方向引导和视觉探索之间切换。PIRL [7] 将传播特性引入奖励设计，PiPRL [8] 则通过符号程序和估计链路状态引导导航。这些方法需要毫米波硬件提供详细信道测量，因而难以直接应用于仅具有 Wi-Fi 或 BLE 的目标。此外，小型接收阵列空间分辨率有限，难以区分多径分量，目标方向也具有不确定性。因此，我们从多模态观测历史中联合估计目标方向及其不确定性，并结合视觉上下文来选择动作。

多径条件下的导航评价需要交互式基准，以支持具身导航的感知—行动闭环：机器人执行动作，在新位姿获得视觉与 RF 观测，再作出下一步决策。P2SLAM [9]、WAIS [10] 等现有数据集包含真实 Wi-Fi 测量及视觉、运动数据，但其轨迹固定，无法为导航策略任意选取的动作提供对应观测，限制了闭环评价。mmWave-LSC [6] 的仿真基准支持交互，但 RF 仿真依赖简化平面图几何，忽略更细致的场景结构。这些局限促使我们构建一种保留精细几何、并可随机器人动作生成对齐的视觉与 RF 观测的交互式导航基准。

为解决 RF 线索不可靠以及缺少精细场景交互基准的问题，我们共同开发导航框架与仿真基准。框架将不确定性感知的目标预测器与改进的场景记忆 Transformer [11] 相结合。预测器根据包含 RF 观测（RSSI 与 MUSIC 空间谱）、RGB 图像、深度图像和位姿信息的多模态历史，估计目标方位的概率分布；场景记忆则融合这些信息与视觉、位姿特征以选择动作。Habitat–Sionna RT 基准利用 MP3D 场景 [12] 将具身导航 [13] 与 RF 仿真 [14] 相耦合，保留精细几何和依赖材料的传播效应，并响应机器人动作生成观测。在 27 个未见场景中的 1,350 次任务测试中，该方法达到 SR = 0.546、SPL = 0.456，分别较最强基线相对提高 18.2% 和 11.5%。

## II. 问题表述

考虑未知室内环境中移动机器人向静止目标导航的问题。没有先验地图或目标坐标时，机器人必须利用车载观测探索环境、到达目标并在其附近停止。视觉和运动观测辅助探索及避障，位于目标处的 RF 发射机则额外提供可能受多径扭曲的方向线索。下文定义任务设置与目标。

### A. 任务设置

用 $\mathcal C$ 表示室内场景，$\mathcal X_{\mathcal C}$ 表示其中可通行的空间。目标位于未知位置 $\mathbf g\in\mathcal X_{\mathcal C}$。在时刻 $t$，机器人位姿为 $\mathbf p_t=(x_t,y_t,\phi_t)$，其中 $(x_t,y_t)$ 是位置，$\phi_t$ 是朝向。机器人从 $\mathbf p_0$ 出发，接收观测

$$
\mathbf o_t=(I_t^{\rm rgb},I_t^{\rm d},\mathbf u_t,\mathbf w_t).\tag{1}
$$

其中 $I_t^{\rm rgb}$ 和 $I_t^{\rm d}$ 分别是以机器人自身为参考的 RGB 图像和深度图；$\mathbf u_t$ 表示相对于初始位姿的里程计测量；$\mathbf w_t$ 包含 RF 线索。空间谱可提供方向信息，但室内反射和散射形成的多径传播可能使估计到达方向偏离目标的几何方位。

在每一步，机器人从下列动作集中选择动作：

$$
\mathcal A=\{\text{MOVE FORWARD},\ \text{TURN LEFT},\ \text{TURN RIGHT},\ \text{STOP}\}.\tag{2}
$$

采用离散动作配置 [15]：每次前进移动 $0.25\,\mathrm m$，每次左转或右转改变朝向 $15^\circ$。机器人每次移动后获取新观测，并据此判断何时停止。

### B. 任务目标

导航策略根据截至当前的所有观测和此前动作选择行为。当机器人选择 STOP 或达到最大动作数 $T_{\max}$ 时，一次任务（episode）终止。令 $\tau$ 表示该任务的轨迹，$t_{\rm end}$ 为最终决策时刻。若机器人选择 STOP 时所处位置到目标的测地距离小于成功阈值 $\epsilon$，则判定导航成功，成功指示量定义为

$$
\sigma(\tau)\triangleq\mathbb I\left[a_{t_{\rm end}}=\mathrm{STOP}\ \wedge\ d_{\rm geo}(\mathbf p_{t_{\rm end}},\mathbf g)<\epsilon\right].\tag{3}
$$

这里 $\mathbb I[\cdot]$ 是指示函数，$d_{\rm geo}(\mathbf p_t,\mathbf g)$ 是由机器人当前位姿到目标的最短可通行路径距离。

任务不仅要求成功到达，还要求路径高效。以 $L(\tau)$ 表示实际行进总距离，以 $L^*=d_{\rm geo}(\mathbf p_0,\mathbf g)$ 表示起始位置到目标的最短路径长度。任务级目标为最大化期望 SPL：

$$
\max_\pi\ \mathbb E_{\tau\sim P_\pi}\!\left[\sigma(\tau)\frac{L^*}{\max\{L(\tau),L^*\}}\right].\tag{4}
$$

其中 $P_\pi$ 是由导航策略以及场景、初始位姿、目标位置的分布共同诱导的轨迹分布。

## III. 所提方案

图 1 展示了整体架构：RF 观测提供目标方向线索，视觉观测提供用于空间理解和避障的场景上下文。不确定性感知目标预测器根据多模态历史估计目标方向的概率分布，场景记忆 Transformer 随时间融合该分布与视觉、位姿特征，引导导航。

### A. RF 与视觉观测编码

RF 前端采用一个朝向前方的 $1\times2$ 贴片天线阵列，获取 RSSI 和 MUSIC 空间谱 [16]。令 $\mathbf x_{t,k}\in\mathbb C^2$ 为 $t$ 时刻的第 $k$ 个阵列快拍，样本协方差为

$$
\widehat{\mathbf R}_t=\frac{1}{K}\sum_{k=1}^K\mathbf x_{t,k}\mathbf x_{t,k}^{\rm H}.\tag{5}
$$

其中 $(\cdot)^{\rm H}$ 表示共轭转置。通过考察阵列导向向量与由 $\widehat{\mathbf R}_t$ 估计的噪声子空间之间的正交性，得到 MUSIC 空间谱 $P_t(\theta)$ [16]。以谱峰为依据的方向估计为

$$
\widehat\theta_t^{\rm MUSIC}=\arg\max_{\theta\in\Theta}P_t(\theta),\tag{6}
$$

其中 $\Theta$ 是机器人坐标系下的扫描方位角集合。在多径传播中，最强峰可能对应反射路径，而不是目标的几何方向。因此，除了 RSSI，我们还将采样的完整空间谱纳入 RF 观测 $\mathbf w_t$，为后续目标方向与不确定性预测保留单一峰值以外的信息。

将 RF 观测 $\mathbf w_t$ 编码为特征 $\mathbf r_t^{\rm rf}$。独立编码器分别生成 RGB 和深度 token $\mathbf e_t^{\rm v}$、$\mathbf e_t^{\rm d}$；位姿编码器联合里程计与前一动作生成 $\mathbf e_t^{\rm p}$：

$$
\begin{aligned}
\mathbf r_t^{\rm rf}&=f_{\rm rf}(\mathbf w_t), &\mathbf e_t^{\rm p}&=f_{\rm p}(\mathbf u_t,a_{t-1}),\\
\mathbf e_t^{\rm v}&=f_{\rm v}(I_t^{\rm rgb}), &\mathbf e_t^{\rm d}&=f_{\rm d}(I_t^{\rm d}).
\end{aligned}\tag{7}
$$

这些特征相互补充：RF 提供方向线索，RGB 和深度提供场景上下文，位姿特征描述机器人运动。目标预测器联合处理它们的历史以估计射频源方向，并将估计方向及其不确定性编码为目标 token，与视觉和位姿 token 一起输入场景记忆 Transformer。通过这样的融合，策略能够结合周围障碍与可通行区域来评估朝向目标的运动。

**图 1：** 所提框架示意。A：RF、里程计、RGB、深度的观测编码；B：不确定性感知目标预测器利用多模态观测历史预测射频源方向的 von Mises 分布；C：目标、RGB、深度与位姿 token 构成场景记忆，由当前观测查询并经交叉注意力提取历史上下文；D：Actor–Critic 输出前进、左转、右转与停止的动作概率及状态价值。真实方向标签仅在训练时使用。

### B. 不确定性感知目标预测器

预测器根据多模态观测历史估计射频源方位及其不确定性，以降低对反射造成的 MUSIC 谱峰的依赖。传播融合 Transformer 处理 RF、RGB、深度和位姿特征的拼接序列：

$$
\mathbf m_{1:t}^{\rm f}=F_{\rm prop}\!\left(\{[\mathbf r_i^{\rm rf};\mathbf e_i^{\rm v};\mathbf e_i^{\rm d};\mathbf e_i^{\rm p}]\}_{i=1}^{t}\right).\tag{8}
$$

当前表示 $\mathbf m_t^{\rm f}$ 汇集跨时刻观测和机器人运动中的方向证据及视觉上下文。用圆周上正态分布的对应形式——von Mises 分布——描述目标方位。不同于线性变量，方位角在 $[0,2\pi)$ 上周期变化，其中 $0$ 与 $2\pi$ 表示相同方向。von Mises 分布满足这一周期性，并以集中度参数描述方向不确定性，因此适合方位预测。预测头将 $\mathbf m_t^{\rm f}$ 映射为平均方向 $\mu_t$ 和非负集中度 $\kappa_t$：

$$
p(\theta\mid\mu_t,\kappa_t)=\frac{\exp[\kappa_t\cos(\theta-\mu_t)]}{2\pi I_0(\kappa_t)}.\tag{9}
$$

其中 $\theta$ 是机器人坐标系下的候选方位，$I_0$ 为零阶修正贝塞尔函数。$\kappa_t$ 越大，预测分布越集中。给定真实方位 $\theta_t^*$，训练时最小化负对数似然：

$$
\mathcal L_{\rm goal}=\mathbb E_t\left[\log\bigl(2\pi I_0(\kappa_t)\bigr)-\kappa_t\cos(\theta_t^*-\mu_t)\right].\tag{10}
$$

真实方位只用于训练。与式（6）中的瞬时谱峰 $\widehat\theta_t^{\rm MUSIC}$ 不同，$\mu_t$ 来自多模态观测历史。将预测分布参数编码为目标 token：$\mathbf e_t^{\rm f}=f_{\rm goal}([\cos\mu_t;\sin\mu_t;\kappa_t])$，其中 $f_{\rm goal}$ 是多层感知机（MLP），$[\cdot;\cdot]$ 表示拼接。正余弦共同表示周期性方位，$\kappa_t$ 表示方向集中程度；该 token 将方向与不确定性传给场景记忆 Transformer。

### C. 基于记忆的导航策略

为将场景记忆 Transformer [11] 应用于 RF 辅助导航，我们在其观测表示中加入不确定性感知的目标 token。式（7）中的 RGB、深度及位姿 token $\mathbf e_t^{\rm v}$、$\mathbf e_t^{\rm d}$、$\mathbf e_t^{\rm p}$ 提供视觉场景上下文和运动信息；目标预测器联合 RF 特征 $\mathbf r_t^{\rm rf}$、视觉及位姿历史估计 $\mu_t,\kappa_t$，编码为 $\mathbf e_t^{\rm f}$。最终的观测表示是 $\mathcal E_t=\{\mathbf e_t^{\rm v},\mathbf e_t^{\rm d},\mathbf e_t^{\rm p},\mathbf e_t^{\rm f}\}$。沿时间保留这些 token，使历史目标估计及其不确定性与视觉、运动上下文共同服务于动作选择。历史 token 被处理为场景记忆上下文：

$$
\mathbf M_{1:t-1}=F_{\rm mem}(\{\mathcal E_i\}_{i=1}^{t-1}).\tag{11}
$$

由当前 token 构造观测查询 $\mathbf Q_t$，通过交叉注意力检索相关历史特征：

$$
\mathbf c_t^{\rm mem}=\operatorname{softmax}\left(\frac{\mathbf Q_t\mathbf K_t^\top}{\sqrt{d_k}}\right)\mathbf V_t^{\rm mem}.\tag{12}
$$

其中 $\mathbf K_t$ 和 $\mathbf V_t^{\rm mem}$ 是从 $\mathbf M_{1:t-1}$ 派生的键与值，$d_k$ 是键的维度，Softmax 沿历史 token 维度计算。当前 token 在每次决策后写入记忆，每个任务开始时重置记忆。

将检索上下文与当前观测表示拼接得到策略特征 $\mathbf z_t$。Actor 将其映射为四种导航动作的概率分布，Critic 估计期望回报：

$$
\pi_\psi(a_t\mid h_t)=\operatorname{softmax}(f_{\rm actor}(\mathbf z_t)),\tag{13}
$$

$$
V_t=f_{\rm critic}(\mathbf z_t).\tag{14}
$$

其中 $\psi$ 为策略参数，$h_t$ 为截至时刻 $t$ 的观测及此前动作构成的交互历史。导航奖励鼓励朝目标前进和成功停止：

$$
\begin{aligned}
r_t={}&\alpha(d_{\mathrm{geo},t}-d_{\mathrm{geo},t+1})\\
&+\beta\mathbb I[D_t=1\wedge\sigma_t=1]\\
&-\eta\mathbb I[D_t=1\wedge\sigma_t=0].
\end{aligned}\tag{15}
$$

$\alpha$、$\beta$、$\eta$ 分别是导航进度、成功终止和失败终止的正权重。设置较大的 $\beta$ 和较小的 $\eta$，突出成功导航，同时对失败施加适度惩罚。$d_{\mathrm{geo},t}=d_{\rm geo}(\mathbf p_t,\mathbf g)$，$D_t$ 指示任务结束，$\sigma_t=\mathbb I[a_t=\mathrm{STOP}\wedge d_{\mathrm{geo},t}<\epsilon]$ 是与式（3）对应的单步成功指示量。距离及成功信息仅用于训练，不作为策略输入。

采用近端策略优化（proximal policy optimization，PPO）[17]，在辅助方向预测目标的配合下最大化期望折扣导航回报。联合损失是

$$
\mathcal L=\mathcal L_{\rm PPO}+c_v\mathcal L_V-c_e\operatorname{Ent}(\pi_\psi)+\lambda_g\mathcal L_{\rm goal},\tag{16}
$$

其中 $\mathcal L_{\rm PPO}$ 为截断策略损失，$\mathcal L_V$ 为价值损失，$\operatorname{Ent}(\pi_\psi)$ 为策略熵。方向预测损失学习带不确定性的方向表示，导航目标则学习如何综合该表示与场景记忆选择动作。

## IV. 实验

### A. 基准及实验配置

实验使用 90 个 Matterport3D（MP3D）场景 [12]，每个场景均配备对应的 Habitat 可通行网格和 Sionna RT 资源。按场景固定划分：63 个用于训练，27 个用于评估，二者不重叠。训练时，Habitat Pathfinder 对测地距离在 $[8,20]\,\mathrm m$ 范围内的可通行起点和目标点采样。评估中，每个留出场景设置 50 次固定任务，起终点距离范围相同，总共 1,350 次任务。成功阈值为 $\epsilon=1\,\mathrm m$；每次任务最多 $T_{\max}=200$ 个动作，RGB-D 图像分辨率为 $256\times256$。

**图 2：** 由 MP3D 场景构建 Habitat–Sionna RT 基准。Habitat 渲染机器人视角 RGB-D 观测；对于 RF 仿真，按照语义分割结果对场景网格分区，利用 ITU 材料模型为不同区域指定电磁属性，再用 Sionna RT 计算无线传播。

**图 3：** （a）最短路径专家轨迹上视距（LOS）、非视距（NLOS）和无效观测的比例；（b）训练期间的每步平均奖励。

**表 I：训练及 RF 仿真参数**

| 参数 | 数值 |
|---|---|
| 每次任务最大动作数 $T_{\max}$ | 200 |
| 初始测地距离 | $[8,20]\,\mathrm m$ |
| 成功阈值 $\epsilon$ | $1\,\mathrm m$ |
| RGB-D 分辨率 | $256\times256$ |
| 奖励权重 $(\alpha,\beta,\eta)$ | $(2.0,10.0,1.0)$ |
| 载波频率 | 2.4 GHz |
| 接收天线阵列 | $1\times2$ 贴片阵列 |
| 天线间距 | 半波长 |
| 最大反射／折射深度 | 5 |
| 接收机热噪声 | 启用 |

如图 2 所示，该基准通过 Habitat 和 Sionna RT 根据 MP3D 几何生成成对的视觉及 RF 观测。Habitat 渲染机器人视角的 RGB-D 图像。RF 仿真方面，按照语义标注划分场景网格，为不同区域分配材料类别，再使用仿真频率处的 ITU 材料模型设定电磁属性。通过固定坐标变换，对齐两个仿真器中的机器人位姿和发射机位置。在每个导航时刻，Sionna RT 根据表 I 配置模拟多径传播，提供与当前位姿对应的 RF 观测。

为刻画传播条件，分析从各起点到目标的最短路径专家轨迹。如果无法解析出任何传播路径，则 RF 观测无效；否则，若存在无障碍、零次交互的路径，则记为 LOS；其余记为 NLOS。专家轨迹中 27.4% 的观测为 LOS，67.1% 为 NLOS，5.5% 为无效（图 3a）。因此，即使沿最短路径移动，间接传播也占主导。

在原方案允许的情况下，所有方法共用场景划分、动作空间、视觉编码器、训练观测和环境交互预算。评价指标包括 SR、SPL 与目标最终距离（distance to goal，DTG），后者定义为 $d_{\mathrm{geo},t_{\rm end}+1}$。SR、SPL 越大越好，DTG 越小越好。

### B. 对比方法与结果

比较以下基线：（1）**随机策略**：随机选择导航动作；（2）**RSSI 梯度控制器**：依据接收信号强度的变化向更强信号方向导航；（3）**MUSIC-DOA 控制器**：将 MUSIC 空间谱峰值方向作为目标方位；（4）**mmWave-LSC [6]**：联合路径估计及链路状态分类，在 RF 方向引导与视觉探索之间切换，并适配本实验可获得的 RF 观测；（5）**PiPRL [8]**：利用符号程序与估计链路状态引导导航，也适配本实验的 RF 观测；（6）**SAVN-CE [18]**：采用确定性目标表示的记忆式导航基线。所有经过适配的学习基线均在相同训练划分上重新训练。表 II 汇报留出测试任务上的结果。

**表 II：27 个未见 MP3D 场景、1,350 次任务上的主要结果**

| 方法 | SR ↑ | SPL ↑ | DTG（m）↓ |
|---|---:|---:|---:|
| 随机策略 | 0.000 | 0.000 | 12.512 |
| RSSI 梯度控制器 | 0.002 | 0.001 | 10.129 |
| MUSIC-DOA 控制器 | 0.074 | 0.069 | 8.360 |
| mmWave-LSC [6]（适配） | 0.155 | 0.116 | 8.173 |
| PiPRL [8]（适配） | 0.328 | 0.264 | 7.030 |
| SAVN-CE [18] | 0.462 | 0.409 | 5.810 |
| 所提方法 | **0.546** | **0.456** | **4.176** |

RSSI 梯度和 MUSIC-DOA 控制器成功率很低，SR 分别只有 0.002 和 0.074，表明仅靠 RF 线索难以成功导航，也凸显视觉观测的重要性。适配后的学习方法表现更好，PiPRL 达到 SR = 0.328、SPL = 0.264。最强基线 SAVN-CE 达到 SR = 0.462、SPL = 0.409。

所提方法在 SR、SPL 上均为最高，分别达到 0.546 和 0.456，训练期间的每步平均奖励总体也呈增长趋势（图 3b）。与 SAVN-CE 相比，SR 绝对提高 8.4 个百分点，SPL 绝对提高 0.047，对应相对增幅 18.2% 和 11.5%。同时 DTG 从 5.810 m 降为 4.176 m，说明任务结束时平均距离目标更近。这些比较支持所提框架在以间接 RF 传播为主的未知室内场景中的有效性。图 4 展示不同 RF 传播条件下的四条定性轨迹。

**图 4：** 所提方法的四组定性导航轨迹。彩色轨迹段标示 LOS、NLOS 和 RF 信号不可用状态，标记分别表示起点与目标。

### C. 消融实验

表 III 考察方向不确定性和 RF 历史的重要性。从目标 token 中移除 $\kappa$，SR 从 0.546 降为 0.489，SPL 从 0.456 降为 0.420，支持显式编码不确定性的作用。若只使用当前时刻的 RF 观测，性能下降最明显，SR 降至 0.263，SPL 降至 0.217，强调利用 RF 历史的重要性。

**表 III：未见场景上的消融结果**

| 变体 | SR ↑ | SPL ↑ |
|---|---:|---:|
| 完整模型 | 0.546 | 0.456 |
| 目标 token 不含 $\kappa$ | 0.489 | 0.420 |
| 只使用当前时刻 RF | 0.263 | 0.217 |
| 确定性目标（SAVN-CE） | 0.462 | 0.409 |

表 IV 汇报减少 RGB 曝光量时完整模型的性能。

**表 IV：降低 RGB 曝光量时的导航性能**

| 曝光系数 | SR ↑ | SPL ↑ |
|---|---:|---:|
| 1.0 | 0.546 | 0.456 |
| 0.7 | 0.515 | 0.436 |
| 0.5 | 0.511 | 0.436 |

曝光系数从 1.0 降至 0.7 时，SR 从 0.546 降至 0.515，SPL 从 0.456 降至 0.436；进一步降至 0.5，SR 为 0.511，SPL 在报告精度下仍为 0.436。与正常曝光相比，曝光系数为 0.5 时 SR 绝对降低 0.035，SPL 绝对降低 0.020。这表明模型对实验涉及的曝光衰减具有一定容忍度，性能下降相对温和。

## V. 结论

本文提出一种面向 RF 信号源室内导航的多模态框架。Habitat–Sionna RT 基准通过为经过语义分割的 MP3D 场景网格赋予电磁属性，将具身导航与材料感知的无线传播仿真结合起来。它保留精细场景几何，并在机器人移动时生成空间对齐的视觉及 RF 观测。所提导航方法将不确定性感知的 RF 目标表示与多模态记忆相结合，以应对多径传播导致的不可靠方向线索。在 27 个未见场景上的实验表明，其导航成功率和路径效率优于评价中的基线。未来工作将着重于真实机器人验证，以及利用更大规模天线阵列提升角分辨率。

## 参考文献（原文 18 条，题名中文翻译；刊物与作者保留原貌）

[1] C. Wu, Z. Yang, Z. Zhou, Y. Liu, and M. Liu，“减轻智能手机 Wi-Fi 室内定位中的大误差”，*IEEE Transactions on Vehicular Technology*, 66(7): 6246–6257, 2017。

[2] W. Lu, S. Gao, M. Wen, Y. Liang, L. Yang, C.-B. Chae, and H. V. Poor，“用于主动无线电地图构建的贝叶斯驱动图推理”，*2025 Seventeenth International Conference on Wireless Communications and Signal Processing (WCSP)*, 2025。

[3] M. Kotaru, K. Joshi, D. Bharadia, and S. Katti，“SpotFi：利用 Wi-Fi 实现分米级定位”，*ACM SIGCOMM 2015 Conference*, 2015。

[4] F. de Ponte Müller, M. Schmidhammer, and S. Sand，“车载环境中的无线电感知：弱势道路使用者的鲁棒定位与跟踪”，*2023 IEEE 97th Vehicular Technology Conference (VTC2023-Spring)*, 2023。

[5] S. Bi, J. Yu, Z. Yang, X. Lin, and Y. Wu，“无人机辅助通信与定位一体化的联合三维部署及资源分配”，*IEEE Wireless Communications Letters*, 12(10): 1672–1676, 2023。

[6] M. Yin, A. Veldanda, A. Trivedi, J. Zhang, K. Pfeiffer, Y. Hu, S. Garg, E. Erkip, L. Righetti, and S. Rangan，“利用链路状态分类辅助的毫米波无线机器人导航”，arXiv:2110.14789, 2021。

[7] T. Li, H. Lei, H. Guo, M. Yin, Y. Hu, Q. Zhu, and S. Rangan，“数字孪生增强的无线室内导航：通过零样本强化学习实现高效环境感知”，*IEEE Open Journal of the Communications Society*, 6: 2356–2372, 2025。

[8] T. Li, H. Lei, M. Yin, and Y. Hu，“利用物理知识符号程序先验的强化学习实现零样本无线室内导航”，arXiv:2506.22365, 2025。

[9] A. Arun, R. Ayyalasomayajula, W. Hunter, and D. Bharadia，“P2SLAM：面向室内机器人的基于方位信息的 Wi-Fi 同步定位与建图”，*IEEE Robotics and Automation Letters*, 7(2): 3326–3333, 2022。

[10] A. Arun, W. Hunter, R. Ayyalasomayajula, and D. Bharadia，“WAIS：利用 Wi-Fi 实现资源高效的同步定位与建图”，*22nd Annual International Conference on Mobile Systems, Applications and Services (MobiSys)*, 2024。

[11] K. Fang, A. Toshev, L. Fei-Fei, and S. Savarese，“面向长时程任务具身智能体的场景记忆 Transformer”，*IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2019。

[12] A. Chang, A. Dai, T. Funkhouser, M. Halber, M. Nießner, M. Savva, S. Song, A. Zeng, and Y. Zhang，“Matterport3D：从室内环境 RGB-D 数据中学习”，*International Conference on 3D Vision (3DV)*, 2017。

[13] M. Savva, A. Kadian, O. Maksymets, Y. Zhao, E. Wijmans, B. Jain, J. Straub, J. Liu, V. Koltun, J. Malik, D. Parikh, and D. Batra，“Habitat：具身人工智能研究平台”，*IEEE/CVF International Conference on Computer Vision (ICCV)*, 2019。

[14] J. Hoydis, F. Aït Aoudia, S. Cammerer, M. Nimier-David, N. Binder, G. Marcus, and A. Keller，“Sionna RT：用于无线电传播建模的可微射线追踪”，*IEEE Globecom Workshops (GC Wkshps)*, 2023。

[15] J. Krantz, E. Wijmans, A. Majumdar, D. Batra, and S. Lee，“超越导航图：连续环境中的视觉—语言导航”，*European Conference on Computer Vision (ECCV)*, 2020。

[16] R. O. Schmidt，“多个辐射源的定位与信号参数估计”，*IEEE Transactions on Antennas and Propagation*, 34(3): 276–280, 1986 年 3 月。

[17] J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov，“近端策略优化算法”，arXiv:1707.06347, 2017。

[18] Y. Zeng, H. Wang, M. Liu, Y. Zhou, C. Gao, K. Chen, and G. Huang，“连续环境中的语义视听导航”，*IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2026。

> 说明：参考文献的中文标题为译名，正式检索请使用[原始 PDF](https://arxiv.org/pdf/2610.08105v1#page=6)中的英文标题。正文与公式仍保留待逐式终校状态。
