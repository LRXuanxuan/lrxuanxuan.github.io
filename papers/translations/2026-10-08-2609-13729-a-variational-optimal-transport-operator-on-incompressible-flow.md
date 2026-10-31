---
layout: page
title: "不可压缩流上的变分最优传输算子｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-13729-a-variational-optimal-transport-operator-on-incompressible-flow/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e8bdd417cfd6310c/) · [原文 arXiv](https://arxiv.org/abs/2609.13729) · [全部目录](/papers/catalog/)

# 不可压缩流上的变分最优传输算子

**原题：** A Variational Optimal Transport Operator on Incompressible Flow  
**作者：** JINJIN HE、SHENYIFAN LU、SINAN WANG、ZHIQI LI、DUOWEN CHEN、BO ZHU（均为美国佐治亚理工学院交互计算学院，Atlanta, Georgia, USA；作者联系邮箱：jhe433@gatech.edu、slu361@gatech.edu、swang3081@gatech.edu、zli3167@gatech.edu、dchen322@gatech.edu、bo.zhu@gatech.edu）  
**版本：** arXiv:2609.13729v1（cs.LG），2026 年 9 月 12 日提交，原文 17 页（ACM 期刊双栏格式，含图 1–16、表 1–9、算法 1、参考文献 71 条）。  
**关键词：** 最优传输、不可压缩流、生成建模、神经算子。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含全部小节）、结论以及局限与未来工作、图注与表注、算法 1、全部公式 (1)–(22)、参考文献英文原条目（按原文顺序）均按原文结构录入；原文无附录；逐句逐式终校未做。

**图 1：** VIOT 算子在不可压缩流控制上的结果。每一行给出由同一个训练好的 VIOT 算子通过重复网络查询与数值平流生成的一组样例（红色边框单元格为目标关键帧，右下角小图为真值）：自上而下依次为 2D MNIST 数字、2D MPEG-7 轮廓、3D “SMOKE” 字体序列、3D 人体姿态序列，以及 3D 球体到飞机的传输。所有速度场均为谱域无散度速度。

## 摘要

我们提出**变分不可压缩最优传输**（Variational Incompressible Optimal Transport，VIOT）算子——一种用于摊销式（amortized）不可压缩密度传输的生成式神经算子。给定一个新的源–目标密度对，VIOT 预测一个无散度速度场，并通过前馈推理生成完整的传输轨迹，从而替代伴随流体求解器与可微仿真基线所需的、按对耗时约一小时的逐对优化。该系统由三部分组成：以流函数或矢量势表示速度、从构造上保证不可压缩性的表示；在端点精度与流动光滑性之间折中的正则化不可压缩传输目标；以及在新的密度对与网格分辨率上摊销求解的傅里叶神经算子骨干。三者结合，使不可压缩传输成为一个可复用的神经算子，可服务于多种传输过程。此外，该生成能力可以超出训练分布：在实时交互系统中，VIOT 能为用户手绘的源–目标对生成不可压缩传输。我们在 2D 与 3D 密度传输基准上演示 VIOT：2D 与 3D 的 rollout 都能以每对秒级时间完成，而我们 2D 比较中的逐实例基线需要对每个新密度对从头优化、耗时约一小时量级，因此在线加速约为 $10^4$ 倍。

## 1. 引言

模拟与控制传输过程在计算机图形学中具有重要作用，例如在受控帧之间传输密度场、界面以及角色运动（参见 [Foster and Fedkiw 2001; Gou et al. 2025; Holden et al. 2017; Holl and Thuerey 2024; Li et al. 2025; McNamara et al. 2004; Pan and Manocha 2017; Stam 1999; Treuille et al. 2003; Zhu and Bridson 2005] 等示例）。尽管这类任务通常由源状态与目标状态指定，但结果的视觉与物理质量本质上取决于二者之间的**传输过程**：质量如何在空间中移动、运动是否保持体积、诱导出的速度场是否遵循预期的物理模型。在此类设定中，传输过程本身成为生成内容的一部分，通常需要大量计算才能获得。本文所考虑的逐实例控制方法中，一个源–目标对定义了一个关于中间速度或控制力的优化问题。

获得此类传输过程的一种典型方式，是用伴随方法与可微仿真器求解逆问题（例如 [Holl et al. 2020; Holl and Thuerey 2024; Hu et al. 2019a,b; Li et al. 2025; McNamara et al. 2004; Takahashi et al. 2021; Treuille et al. 2003]）。在其逐实例配置下，这些方法为每一个源–目标对优化一条流；若要摊销这部分计算，还需额外的学习表述。神经前向模型加速流体仿真 [Kochkov et al. 2021; Pfaff et al. 2020; Sanchez-Gonzalez et al. 2020; Stachenfeld et al. 2021; Um et al. 2020]；神经控制方法则通过可微仿真训练任务特定的控制器 [Li et al. 2024]。这些控制器针对指定的控制目标进行优化，而不是作为跨源–目标密度对的传输算子来训练。

近期的基于流的生成模型提供了另一种视角：在数据分布之间摊销生成 [Ho et al. 2020; Lipman et al. 2022, 2024]。特别地，流匹配表述参数化一个时间条件速度场，沿连续时间 ODE 将基分布推向数据分布，同一模型通过数值 ODE rollout 产生样本，无需逐样本优化。最近的扩展进一步表明，此类流可以在具有既定结构的非欧空间上学习 [Chen and Lipman 2023]；另一条并行研究路线则用扩散或流匹配先验合成带有内在约束的物理场 [Baldan et al. 2025; Wei et al. 2024]，或在粗粒度仿真之上合成并渲染流体细节 [Chen et al. 2025]。

本文将学习一个可在关键帧之间传输密度的可复用算子。给定当前密度、目标密度与时间，VIOT 预测一个流函数或矢量势，将其转换为谱域无散度速度，并对密度进行数值推进。在端点对分布上训练即摊销了传输优化，使新的过渡可由前馈 rollout 生成。

该表述的动机来自不可压缩最优传输。Benamou–Brenier 动能代价度量密度传输，而将速度限制在无散度子空间，会在连续介质中施加保体积的重排 [Arnold 1966; Brenier 1989; Emerick and Bamieh 2025]。我们将该传输代价与耗散正则项以及有限终端罚项结合，以平衡关键帧精度与光滑性。对平流过程求导，使算子可直接由密度对训练，而无需预计算监督传输轨迹。权重与数值归约（包括 3D 中仅含耗散项的最终训练阶段）在第 4.4 节给出。傅里叶神经算子 [Li et al. 2020] 提供全局感受野与按模态索引的权重，可在多种网格上求值；我们测量了由此得到的迁移精度。

本文贡献如下。（1）我们把端点条件的不可压缩密度传输表述为摊销式正则优化问题，仅由端点对训练，无需轨迹监督。（2）我们用谱域流函数与矢量势实现该算子，并评估 curl、投影与软罚三种参数化下的约束满足与终端精度。（3）我们在四个 2D 与三个 3D 设定上展示复用能力，将互不相交的形状与字体评估同姿态插值、池内研究区分开。对于所展示的 2D 链，该算子相对所比较的优化器将在线逐对代价降低约 $10^4$ 倍。（4）我们量化动量一致性与数值密度变化，并在用户手绘输入上演示交互式传输。

## 2. 相关工作

**流体控制.** 通过 PDE 约束优化进行流体的关键帧控制可追溯到 Treuille et al. [2003] 与 McNamara et al. [2004]：他们在仿真器中加入控制力，并用伴随方法优化这些控制力；后续工作通过约束表述 [Inglis et al. 2017; Pan and Manocha 2017] 与缩减的力基 [Tang et al. 2021] 提升了效率。可微仿真器 [Du et al. 2021; Holl et al. 2020; Holl and Thuerey 2024; Hu et al. 2019a; Takahashi et al. 2021] 使此类伴随方法得到广泛使用，并促成了耦合与降阶设定下的控制 [Chen et al. 2024; Li et al. 2024, 2025, 2023]；扩散模型也被用作物理控制的先验 [Wei et al. 2024]。经典关键帧求解器会为每一次请求的过渡优化一条轨迹，而学习到的仿真组件与生成先验可以跨实例复用信息。VIOT 面向一个端点条件的密度传输算子，其推理由重复的网络查询与平流步组成，不需要逐对控制优化。其动量残差提供了与预测速度相容的强迫项诊断，而训练目标并不求解受控动量方程。

**最优传输、流匹配与摊销式传输.** 最优传输的动态表述 [Benamou and Brenier 2000; Peyré and Cuturi 2019] 寻求两个密度之间动能最小的速度场，其在不可压缩情形下的对应物——由保体积流实现的传输——具有经典的几何理论 [Arnold 1966; Brenier 1989; Ebin and Marsden 1970; Shnirelman 1994] 与近期的控制论处理 [Emerick and Bamieh 2025]。连续归一化流学习可逆的时间相关动力学，通常通过似然目标 [Chen et al. 2018]；OT-Flow 加入受最优传输启发的正则项 [Onken et al. 2021]。流匹配方法通过与选定条件路径相关联的速度回归来学习速度场 [Albergo et al. 2023; Lipman et al. 2022, 2024; Liu et al. 2022; Tong et al. 2023; Wang et al. 2026]。相关工作在测度对之间摊销传输映射或对偶势 [Amos et al. 2022]，学习条件速度场族 [Atanackovic et al. 2025]，或用学习到的势求解 Wasserstein 拉格朗日流 [Neklyudov et al. 2023]。VIOT 结合了密度场上的端点条件、谱域无散度参数化，以及在无监督传输轨迹下训练的变分密度 rollout。

**神经流体仿真与无散度网络.** 学习型模型通过学到的修正 [Kochkov et al. 2021; Stachenfeld et al. 2021; Um et al. 2020]、图网络 [Pfaff et al. 2020; Sanchez-Gonzalez et al. 2020]、物理信息损失 [Raissi et al. 2019]、超分辨率 [Kim et al. 2019]、生成式运动模型 [Chu et al. 2022, 2021]、在粗仿真之上合成并渲染流体细节的视频扩散模型 [Chen et al. 2025] 以及 Transformer [Roy 2024] 来加速或增强流体仿真。这些方法面向前向预测、重建或视觉合成，其学习到的权重可以跨输入复用。VIOT 面向同时以当前密度与给定终端密度为条件的传输，这与无约束前向 rollout 是不同的任务。流函数与矢量势参数化提供了无散度速度表示，并已被神经场与生成模型采用 [Chang et al. 2021; Ni et al. 2025; Richter-Powell et al. 2022]。我们将二者与傅里叶神经算子内部的谱域旋度结合使用 [Kovachki et al. 2023; Li et al. 2020]，并结合神经算子的离散化误差分析衡量跨分辨率精度 [Gao et al. 2025; Lanthaler et al. 2024]。

**图 2：** 3D 体素字体传输。同一个训练好的 3D 算子产生七条长链，自上而下依次为 GRAPH（G→R→A→P→H）、SHAPE（S→H→A→P→E）、FLUID（F→L→U→I→D）、SIGAS（S→I→G→A→S）、THANK（T→H→A→N→K）、2026S（2→0→2→6→S）、12345（1→2→3→4→5）。红色边框单元格为目标关键帧；相邻关键帧之间两个无边框单元格为中间 rollout 帧。颜色编码 rollout 相位（红→粉），并在每一行内保持一致。

## 3. 背景

### 3.1 连续时间速度场

设 $\Omega\subset\mathbb R^d$（$d\in\{2,3\}$）为空间域，$\mathbf x\in\Omega$ 为位置，$t\in[0,1]$ 为归一化时间，网络参数记为 $\theta$。逐点矢量范数取欧氏范数，$\|\cdot\|_F$ 表示 Frobenius 矩阵范数。将一个密度传输为另一个密度的一种自然方式是给定时间相关速度场 $\mathbf v_\theta:\Omega\times[0,1]\to\mathbb R^d$，并积分流 ODE

$$
\frac{d\boldsymbol\phi_t(\mathbf x)}{dt}=\mathbf v_\theta(\boldsymbol\phi_t(\mathbf x),t),\qquad
\boldsymbol\phi_0(\mathbf x)=\mathbf x, \tag{1}
$$

在该流之下，密度 $\rho_t$ 按连续性方程演化：

$$
\partial_t\rho_t+\nabla\cdot(\rho_t\mathbf v_\theta)=0. \tag{2}
$$

这一模板是连续归一化流 [Chen et al. 2018] 与近期流匹配框架 [Albergo et al. 2023; Lipman et al. 2022; Liu et al. 2022] 的基础，后者通过与选定条件概率路径相关联的速度做回归来训练 $\mathbf v_\theta$。我们采用其模型类别，即一个学习到的时间相关速度，用以生成概率路径；但不采用流匹配回归损失，也不采用样本级推理。VIOT 的训练方式是：在密度场对上直接最小化正则化传输目标（第 4.1 节），并在推理时通过密度的欧拉平流产生传输轨迹。

### 3.2 动态最优传输

最优传输的动态表述源自 Benamou 与 Brenier [Benamou and Brenier 2000; Peyré and Cuturi 2019]：它寻求动能最小、能把 $\rho_0$ 传输到 $\rho_1$ 的速度场。形式化地，**Benamou–Brenier 问题**为

$$
\min_{\mathbf v,\rho}\ \int_0^1\int_\Omega
\frac12\rho_t(\mathbf x)\|\mathbf v_t(\mathbf x)\|^2\,d\mathbf x\,dt \tag{3}
$$

约束为连续性方程 (2) 与边界条件 $\rho_{t=0}=\rho_0$、$\rho_{t=1}=\rho_1$。其极小元定义了 $L^2$-Wasserstein 空间 $(\mathcal P_2(\Omega),W_2)$ 中的测地线，最小值等于 $\tfrac12W_2^2(\rho_0,\rho_1)$。这里 $\mathcal P_2(\Omega)$ 为具有有限二阶矩的概率测度空间，$W_2$ 为 2-Wasserstein 距离。

Benamou–Brenier 问题的最优速度场是梯度场 $\mathbf v_t=\nabla\Phi_t$，即它是无旋的 [Peyré and Cuturi 2019]。这样的速度一般不满足额外的不可压缩性约束。在适当的正则性下，无散度速度反而会生成保体积的流映射，从而限制可容许的密度路径。

**终端匹配代价.** 实践中，硬端点约束 $\rho_{t=1}=\rho_1$ 被松弛为终端罚项 $D(\rho_1^{\rm pred},\rho_1)$。任何可微的密度度量均可使用；我们的训练采用平方 $L^2$，其数值缩放见第 4.4 节。注 1 说明了一个连续介质中的可行性障碍，它正是采用近似端点匹配的动机。

### 3.3 不可压缩传输

**不可压缩流.** 对均质流体，速度 $\mathbf v$ 与运动学黏度 $\nu$ 满足

$$
\partial_t\mathbf v+(\mathbf v\cdot\nabla)\mathbf v=-\nabla p+\nu\Delta\mathbf v+\mathbf f, \tag{4}
$$

$$
\nabla\cdot\mathbf v=0, \tag{5}
$$

其中 $p$ 为压强除以常数流体密度，$\mathbf f$ 为单位质量所受的力。我们通过速度的表示方式来施加不可压缩性，并在第 5.5.2 节把动量方程用作诊断。诊断所用黏度 $\nu$ 独立于训练正则化权重另行指定。

**几何解释.** Arnold [1966] 与 Ebin and Marsden [1970] 将不可压缩 Euler 流与保体积微分同胚群上的测地线联系起来。这一变分解释涉及映射的路径，其欧拉速度变分服从 Lin 约束 [Bretherton 1970; Salmon 1988]。广义不可压缩流扩展了经典的可容许类 [Brenier 1989; Shnirelman 1994]。密度端点传输则寻求一个无散度速度，把一个给定的标记密度输运向另一个 [Emerick and Bamieh 2025]。这一密度端点视角正是我们正则化传输目标的动机。

**正则化传输作用量.** 我们使用独立加权的动能项与梯度项

$$
\mathcal A_{\alpha,\beta}[\rho,\mathbf v]
=\int_0^1\int_\Omega\left[
\frac{\alpha}{2}\rho_t\|\mathbf v\|^2+\beta\|\nabla\mathbf v\|_F^2
\right]d\mathbf x\,dt, \tag{6}
$$

其定义域为无散度速度，$\alpha,\beta\ge 0$。这里 $\rho_t$ 为被传输的标记密度；动能项度量该标记的输运，环境流体密度为常数。梯度项惩罚小尺度速度变化，与黏性耗散成正比。对周期域上或具有齐次无滑移边界、足够正则的无散度场，由分部积分可得

$$
\mathcal E[\mathbf v]=\int_\Omega\|\nabla\mathbf v\|_F^2\,d\mathbf x
=\int_\Omega\|\boldsymbol\omega\|^2\,d\mathbf x,\qquad
\boldsymbol\omega=\nabla\times\mathbf v. \tag{7}
$$

令 $\alpha=0$ 即得到耗散正则化的端点匹配。式 (6) 规定了一个传输目标；动量相容性另行评估。第 4.4 节给出其离散实现与归一化。

**注 1（端点可行性）.** 假设 $\mathbf v$ 无散度，且具有关于空间 Lipschitz 有界、并在时间上可积的界。则其流映射 $\boldsymbol\phi_t$ 保体积，且 $\rho_t=\rho_0\circ\boldsymbol\phi_t^{-1}$。因此 $\rho_t$ 的每个上水平集都保持其体积。于是，密度值分布的相等性是精确端点匹配的必要条件，它比总质量相等更强。有限的终端罚项可容纳近似匹配，并带来精度–正则化之间的权衡。该运动学条件对受迫与无受迫的不可压缩平流同样成立。

## 4. 方法

下面详细描述 VIOT。第 4.1 节给出所求解的变分问题；第 4.2 节描述强制硬不可压缩性的流函数（2D）与矢量势（3D）参数化；第 4.3 节介绍神经架构；第 4.4 节详述训练目标与推理过程。图 3 给出完整流程的总览。

**图 3：** VIOT 总览。FNO $f_\theta$ 接收当前时刻 $t$ 的密度 $\rho_t$、终端时刻 $T=1$ 的目标 $\rho_T$（$\rho_T=\rho_1$）以及 $t$；其各层使用式 (15)–(16) 中的特征张量 $\mathbf z$ 与算子。2D 示例使用标量流函数 $\psi$ 与速度 $\nabla^\perp\psi=(\partial_y\psi,-\partial_x\psi)$；3D 中由矢量势 $\boldsymbol\Psi$ 经其旋度给出速度。平流以时间步 $\Delta t$ 推进密度，重复若干步后得到 $\rho_1^{\rm pred}$。训练利用第 4.4 节归一化的动能项、耗散项与终端项，穿过 rollout 反向传播；动能项在 3D 的最终训练阶段被关闭。

### 4.1 摊销式不可压缩传输

VIOT 把当前密度 $\rho_t$、目标密度 $\rho_1$ 与时间 $t$ 映射为 2D 的流函数 $\psi_\theta$ 或 3D 的矢量势 $\boldsymbol\Psi_\theta$。速度为：2D 中 $\mathbf v_\theta=\nabla^\perp\psi_\theta$，其中 $\nabla^\perp=(\partial_y,-\partial_x)$；3D 中 $\mathbf v_\theta=\nabla\times\boldsymbol\Psi_\theta$。单个训练好的算子通过重复的预测与平流生成新的过渡，无需逐对优化。连续介质目标为

$$
\min_\theta\ \mathbb E_{(\rho_0,\rho_1)}
\left[
\mathcal A_{\alpha,\beta}[\rho,\mathbf v_\theta]
+\gamma D(\rho_1^{\rm pred},\rho_1)
\right], \tag{8}
$$

其中 $\gamma>0$，约束为连续性方程 $\partial_t\rho_t+\nabla\cdot(\rho_t\mathbf v_\theta)=0$ 与初始密度 $\rho_0$。预测端点为 $\rho_1^{\rm pred}$，$D$ 为平方 $L^2$ 距离。被传输量 $\rho$ 是均质环境流体中的标记密度。有限权重在有限带宽的神经参数化范围内平衡端点精度、动能传输与光滑性。3D 的最终训练阶段将动能系数置零；部分算子由包含动能项的早期阶段初始化得到。

**速度表示与密度 rollout.** 对每一个网络输入与权重，谱域旋度都在浮点舍入误差范围内满足散度约束。密度演化通过可微数值平流计算，每一步都在当前平流后的密度上重新查询算子。线性插值以及正性/质量校正属于该数值 rollout 的一部分。谱域保证只对表示出的速度成立；全局质量校正控制密度总和，而局部输运与密度值分布仍受离散化误差影响。

**动量一致性.** 默认传输目标并不施加动量方程。为进行评估，用 Leray 投影去掉动量失衡中由压强平衡的那一部分，留下相容的控制力。第 5.5.2 节度量该控制力、数值质量变化与密度分布变化，并研究训练期间额外加入动量罚项的影响。

**由端点对训练.** 我们仅利用端点对、穿过平流 rollout 优化式 (8)，不使用预计算的传输轨迹或速度目标。这与流匹配 [Lipman et al. 2022; Tong et al. 2023] 不同：后者回归与规定条件路径相关联的速度。第 5.2 与 5.3 节报告与 CFM 的对比；第 5.5.1 节比较各种约束参数化。

**光滑性控制.** 耗散项惩罚速度梯度，从而补充架构层面的带宽截断。在第 5.5 节的 2D 扫描中，零权重配置给出的传输效果很差，而所测试的正权重 $[10^{-3},2\times10^{-2}]$ 给出可比的终端精度与更低的拟涡能。我们保留 $\mu$ 作为该离散耗散系数的沿用记号，并用 $\nu$ 表示诊断用的物理黏度。

### 4.2 通过流函数施加无散度约束

**流函数参数化.** 在周期域 $\Omega=[0,1]^2$ 上，足够光滑的矢量场具有带常数均值模态的 Helmholtz 分解：

$$
\mathbf v=\bar{\mathbf v}+\nabla\Phi+\nabla^\perp\psi, \tag{9}
$$

其中 $\bar{\mathbf v}$ 为空间均值，周期势 $\Phi$ 与 $\psi$ 可通过固定其均值而唯一化。我们的周期旋度参数化表示零均值的螺线分量，不表示独立的均匀速度。螺线分量 $\nabla^\perp\psi$ 由构造即无散度：

$$
\nabla\cdot(\nabla^\perp\psi)
=\partial_x(\partial_y\psi)-\partial_y(\partial_x\psi)=0. \tag{10}
$$

我们参数化神经网络 $f_\theta$，使其输出**标量**流函数 $\psi_\theta(\mathbf x,t;\rho_t,\rho_1)$，并将速度场定义为

$$
\mathbf v_\theta=\nabla^\perp\psi_\theta
=\left(\frac{\partial\psi_\theta}{\partial y},-\frac{\partial\psi_\theta}{\partial x}\right). \tag{11}
$$

无论网络权重 $\theta$ 取何值，这都恒等地保证 $\nabla\cdot\mathbf v_\theta=0$。

**带带宽控制的谱域旋度.** 我们不在有限差分上计算旋度，而是在傅里叶域中施加旋度算子。向量 $\mathbf k$ 包含以每样本周期数表示的傅里叶频率，$\mathbf 1[\cdot]$ 表示指示函数。给定像素空间输出 $\psi_\theta$，我们经 FFT 计算 $\hat\psi_{\mathbf k}=\mathcal F[\psi_\theta]$，施加硬低通掩膜 $M(\mathbf k)=\mathbf 1[\|\mathbf k\|\le k_{\max}]$，并在谱坐标中解析地计算旋度：

$$
\hat{\mathbf v}_{\mathbf k}=2\pi i\left(
k_yM(\mathbf k)\hat\psi_{\mathbf k},\,
-k_xM(\mathbf k)\hat\psi_{\mathbf k}\right),\qquad
\mathbf v_\theta=\mathcal F^{-1}[\hat{\mathbf v}_{\mathbf k}]. \tag{12}
$$

以这种方式计算旋度相对有限差分有两个优势。第一，空间导数在带限场上**精确**：不会因离散化引入截断误差。第二，截断 $k_{\max}$ 控制所表示速度的最高频率。较小的截断会抑制细尺度运动，但可能使细薄的目标特征更难匹配。除 Font 2D 使用 0.0625 外，所报告的算子均使用 0.25。我们以每样本周期数指定 $k_{\max}$（0.25 是 Nyquist 频率的一半）；它与网格分辨率的相互作用在第 5.5 节分析。

**旋度与 Helmholtz 参数化.** 网络也可以预测无约束速度并施加可微 Leray 投影。对非零傅里叶模态，投影与旋度参数化都产生螺线子空间中的速度；二者的参数冗余、频率缩放与均值模态处理不同，这可能影响优化。在表 5 中，旋度模型与 Helmholtz 模型在训练第 5000 步、于 100 个公共池内对上评估。该配置下旋度模型的终端误差约低 2.7 倍，而二者都施加了谱域不可压缩性。

**扩展到 3D：矢量势.** 三维中，标量流函数被替换为**矢量势** $\boldsymbol\Psi\in\mathbb R^3$，无散度速度为其旋度：

$$
\mathbf v=\nabla\times\boldsymbol\Psi,\qquad
\nabla\cdot\mathbf v=\nabla\cdot(\nabla\times\boldsymbol\Psi)\equiv 0. \tag{13}
$$

下标 $d,h,w$ 表示数组按深度、高度、宽度轴的有序排列；势与速度分量采用相同顺序，因此 $\mathbf k=(k_d,k_h,k_w)$。记 $\hat{\boldsymbol\Psi}_{\mathbf k}=\mathcal F[\boldsymbol\Psi_\theta]$ 为矢量势的 3D 傅里叶变换，$M(\mathbf k)=\mathbf 1[\|\mathbf k\|\le k_{\max}]$ 为谱截断掩膜。3D 谱域旋度经旋度恒等式解析计算：

$$
\hat v_d(\mathbf k)=2\pi iM(\mathbf k)\left(k_h\hat\Psi_w-k_w\hat\Psi_h\right),
$$
$$
\hat v_h(\mathbf k)=2\pi iM(\mathbf k)\left(k_w\hat\Psi_d-k_d\hat\Psi_w\right), \tag{14}
$$
$$
\hat v_w(\mathbf k)=2\pi iM(\mathbf k)\left(k_d\hat\Psi_h-k_h\hat\Psi_d\right),
$$

随后经逆 FFT 得到 $\mathbf v_\theta=\mathcal F^{-1}[\hat{\mathbf v}]$。与 2D 相同，导数在带限场上精确，截断 $k_{\max}$ 提供有原则的光滑性控制。

### 4.3 神经算子架构

VIOT 通过傅里叶神经算子（FNO）骨干 [Li et al. 2020] 把条件 $(\rho_t,\rho_1,t)$ 映射为流函数 $\psi_\theta$（2D）或矢量势 $\boldsymbol\Psi_\theta$（3D）。我们选择 FNO 而非标准卷积或 Transformer 骨干，是因为其谱层从第一层起就给出全局感受野、产生天然光滑的输出，且其可学习权重按傅里叶模态而非像素索引，因此单个训练好的模型无需改动架构即可在其他网格分辨率上求值；第 5.5 节量化了这种迁移在何时准确。我们在第 5 节与 CNN+MLP、Transformer 及 DiT 骨干做经验比较。

**输入编码.** 当前密度与目标密度 $\rho_t,\rho_1$ 沿通道维拼接为 2 通道输入（在 2D 或 3D 空间网格上），再由一个逐点卷积提升到 $w$ 个特征通道。时间 $t\in[0,1]$ 映射为正弦位置编码，再经一个小型 MLP 映射为条件向量。该条件向量通过 FiLM 风格的尺度–平移调制 [Perez et al. 2018] 对特征通道广播到每个 FNO 层。

**FNO 层.** 每个 FNO 层 [Li et al. 2020] 都沿两个并行分支处理输入特征张量 $\mathbf z$：学习全局频域滤波器的**谱分支**，以及施加逐点 $1\times1$ 卷积的**局部分支**。谱分支把傅里叶表示截断到每维有限个模态 $n_{\rm modes}$，并施加一个学习到的复值权重张量 $W$：

$$
\mathcal S(\mathbf z)=\mathcal F^{-1}
\left[W\cdot\Pi_{n_{\rm modes}}\left[\mathcal F(\mathbf z)\right]\right], \tag{15}
$$

其中 $\Pi_{n_{\rm modes}}$ 截断到每维最低的 $n_{\rm modes}$ 个模态，$\cdot$ 表示沿通道维的逐模态矩阵乘法。该层输出用 FiLM 条件化与残差连接合并两个分支：

$$
\mathbf z_{\rm out}=\mathbf z+\sigma\left(
\mathrm{GN}\left(\mathrm{FiLM}_t\left[\mathcal S(\mathbf z)+W_{\rm loc}\mathbf z\right]\right)
\right), \tag{16}
$$

其中 $W_{\rm loc}$ 为 $1\times1$ 卷积，GN 为组归一化，$\sigma$ 为 GELU 激活。3D 中谱分支使用 3D FFT 与模态 $(k_d,k_h,k_w)$，其余完全相同。由于谱权重 $W$ 只依赖 $n_{\rm modes}$ 与宽度 $w$，而二者都不依赖空间网格尺寸，FNO 骨干可在任意网格尺寸上求值。

**输出头.** 经过 $L$ 个 FNO 层后，一个小的两层逐点 MLP（两个 $1\times1$ 卷积加 GELU 激活）把特征投影为 2D 的单通道流函数 $\psi_\theta$，或 3D 的三通道矢量势 $\boldsymbol\Psi_\theta=(\Psi_d,\Psi_h,\Psi_w)$。随后由带宽截断为 $k_{\max}$ 的谱域旋度（式 (12)；3D 为式 (14)）得到无散度速度 $\mathbf v_\theta$。谱域旋度与带宽截断是固定的（非学习的）算子，投影 MLP 是逐点的，因此同一组权重 $\theta$ 可在其他网格尺寸上求值；第 5.5 节测量由此得到的精度以及速度单位重缩放的影响。

### 4.4 训练与推理

**基于 rollout 的训练.** 中间密度依赖于此前所有预测速度。我们穿过 $K$ 个平流步做微分，在 $t_k=k/K$ 处查询 $f_\theta(\rho_{t_k},\rho_1,t_k)$ 并数值推进密度。2D 训练实现使用带中点半拉格朗日回溯的无限 MacCormack 校正，每一趟都做一次回溯。2D 中的插值为双线性，3D 半拉格朗日实现中为三线性，并在网格外做边界延拓。3D 定量实现使用单次半拉格朗日回溯，并在每步冻结速度。平流后对负密度做截断。2D 训练与留出评估流程还会把每个密度重新缩放到其初始总质量；峰值归一化的 3D 训练分支省略该重缩放。它们对质量与密度值分布的影响在第 5.5.2 节测量。算法 1 把质量校正选项显式化。

**离散损失.** 设 $G$ 为网格单元数，$\mathrm{mean}_{\mathbf x}$ 表示单元平均。下标 $h$ 标识数值网格上的量；导数模板使用单位像素间距。离散 rollout 累积

$$
\mathcal K_h=\frac1K\sum_{k=0}^{K-1}
\mathrm{mean}_{\mathbf x}\left[\rho_{t_k}\|\mathbf v_{t_k}\|^2\right], \tag{17}
$$

$$
\mathcal E_h=\frac1K\sum_{k=0}^{K-1}
\mathrm{mean}_{\mathbf x}\left[\|\mathrm{curl}_h\mathbf v_{t_k}\|^2\right], \tag{18}
$$

$$
\mathcal D_h=\mathrm{mean}_{\mathbf x}
\left[\left(s(\rho_1^{\rm pred}-\rho_1)\right)^2\right]. \tag{19}
$$

这里 $\mathrm{curl}_h$ 是训练器所用的、带循环填充的中心有限差分涡量算子。尺度为：单位质量 2D 输入取 $s=G$，峰值归一化 3D 分支取 $s=1$；非峰值归一化的 3D 分支使用 $s=G$。训练损失为

$$
\mathcal L_h=\alpha_h\mathcal K_h+\beta_h\mathcal E_h+\gamma_h\mathcal D_h, \tag{20}
$$

并在小批量上取平均。实现系数为 $\alpha_h=\lambda_{\rm KE}$、$\beta_h=\lambda_\mu$、$\gamma_h=\lambda_{\rm terminal}$，其中 2D 训练器取 $\gamma_h=1$。训练方案可在规定的预热期内逐步调整这些系数；配置表报告其最终值。这些数值系数吸收了单元平均、密度缩放、像素单位导数以及不计 $1/2$ 因子的动能约定。涡量正则项使用所述有限差分模板。所报告的 3D checkpoint 在最终训练阶段取 $\alpha_h=0$，因此其有效损失只含终端匹配与耗散正则。部分 3D checkpoint 延续了使用动能罚项的早期阶段。2D 消融图中沿用的符号 $\mu$ 表示离散系数 $\beta_h$，而非物理黏度。

混合精度与激活检查点（activation checkpointing）降低了 3D 可微 rollout 的显存需求。

**推理.** 推理时反复由当前密度、目标与归一化时间预测速度，然后在 $[0,1]$ 上分 $K_{\rm infer}$ 步推进密度。2D 定量评估器使用中点回溯的 MacCormack 平流 [Selle et al. 2008]，随后做正性截断与质量重归一化。部分可视化流程使用局部极值限制器或 WENO 平流 [Jiang and Shu 1996]。积分器与校正策略决定了反馈给网络的密度，并对每次评估分别指定。所测量的 50 步 rollout 代价在第 5.6 节报告。

**算法 1　VIOT 离散 rollout 训练.** 势 $a$ 在 2D 中为标量 $\psi_\theta$、在 3D 中为矢量 $\boldsymbol\Psi_\theta$；$\varepsilon=10^{-12}$ 用于防止除零。

输入：端点对采样器、步数 $K$、权重 $\alpha_h,\beta_h,\gamma_h$、截断 $k_{\max}$、终端尺度 $s$、质量校正标志 $c_m$

输出：训练后参数 $\theta$

1. 按训练配方初始化或加载 $\theta$
2. **for each** 训练迭代 **do**
3. 　采样一个小批量 $(\rho_0,\rho_1)$
4. 　$\rho\leftarrow\rho_0$，$m_0\leftarrow\sum_{\mathbf x}\rho_0$，$\mathcal K_h\leftarrow0$，$\mathcal E_h\leftarrow0$，$\Delta t\leftarrow1/K$
5. 　**for** $k=0,\dots,K-1$ **do**
6. 　　$t_k\leftarrow k/K$
7. 　　$a\leftarrow f_\theta(\rho,\rho_1,t_k)$
8. 　　$\mathbf v\leftarrow\mathrm{SpectralCurl}_{k_{\max}}(a)$　▷ 2D 或 3D 谱域速度
9. 　　$\mathcal K_h\mathrel{+}=\mathrm{mean}_{\mathbf x}(\rho\|\mathbf v\|^2)/K$
10. 　　$\mathcal E_h\mathrel{+}=\mathrm{mean}_{\mathbf x}(\|\mathrm{curl}_h\mathbf v\|^2)/K$
11. 　　$\rho\leftarrow\max\left(\mathrm{Advect}(\rho,\mathbf v,\Delta t),0\right)$
12. 　　**if** $c_m$ **then**
13. 　　　$\rho\leftarrow m_0\rho/\left(\sum_{\mathbf x}\rho+\varepsilon\right)$
14. 　　**end if**
15. 　**end for**
16. 　$\mathcal D_h\leftarrow\mathrm{mean}_{\mathbf x}\left(\left[s(\rho-\rho_1)\right]^2\right)$
17. 　$\mathcal L_h\leftarrow\mathrm{mean}_{\rm batch}\left(\alpha_h\mathcal K_h+\beta_h\mathcal E_h+\gamma_h\mathcal D_h\right)$
18. 　用 $\nabla_\theta\mathcal L_h$ 更新 $\theta$
19. **end for**

## 5. 结果与讨论

### 5.1 实现细节

**架构与优化.** 被评估的算子使用以当前密度、目标密度与时间为条件的 FNO 骨干。表 1 列出架构与最终阶段损失系数。输出在 2D 中为标量流函数，在 3D 中为矢量势。谱截断以每样本周期数给出。离散损失 (20) 用 Adam 优化，采用算子特定的权重日程，该日程并未针对评估对单独调参。训练 rollout 使用十步；步数与分辨率的研究在第 5.5 节报告。训练批大小、日程与初始化历史在不同算子间有所差异。对延续训练的算子，表中列出最终阶段的损失系数。

**表 1：** 被评估算子的架构与预热后最终阶段的离散损失系数。$w$、$m$、$L$ 分别为 FNO 宽度、每轴保留模态数与层数。截断以每样本周期数给出。各系数乘以前文第 4.4 节归一化后的数值归约。表中列出原始的整池算子；拆分重训练版本在表 2 中单独评估。

| 算子 | 网格 | $w/m/L$ | $k_{\max}$ | $\alpha_h$ | $\beta_h$ | $\gamma_h$ |
|---|---|---:|---:|---:|---:|---:|
| Font 2D | $256^2$ | 64/16/8 | 0.0625 | 1 | 0.05 | 1 |
| MNIST 2D | $256^2$ | 64/32/8 | 0.25 | 1 | 0.01 | 1 |
| CJK 2D | $256^2$ | 64/32/8 | 0.25 | 1 | 0.01 | 1 |
| MPEG-7 2D | $256^2$ | 64/32/8 | 0.25 | 1 | 0.01 | 1 |
| Sphere→airplane 3D | $128^3$ | 32/16/6 | 0.25 | 0 | 0.003 | 10 |
| HuMMan 3D | $128^3$ | 32/16/6 | 0.25 | 0 | 0.005 | 10 |
| Font 3D | $128^3$ | 32/16/6 | 0.25 | 0 | 0.0025 | 10 |

**数据与评估.** 四个 2D 数据集为 MNIST 数字 [LeCun et al. 2002]、496 个 DejaVu 字体字形、约 9k 个渲染 CJK 字符，以及 1,294 个 MPEG-7 轮廓 [Latecki et al. 2000]。3D 中我们使用 1,364 个体素化字形、来自 ShapeNet 的 4,045 架飞机 [Chang et al. 2015]，以及来自 HuMMan 的 5,000 个姿态 [Cai et al. 2022]。飞机目标与一个规范球体源配对。预处理会缩放形状并归一化其密度尺度。评估池、输入缩放与采样协议在下面指定。2D 定量评估使用 50 步无限中点回溯 MacCormack 平流，带边界延拓、正性截断与质量重归一化。可视化代码路径还可以额外使用局部极值限制器或 WENO 平流。3D 定量评估器使用单趟半拉格朗日步，带三线性插值与边界延拓，随后做同样的正性与质量校正。

**逐实例比较.** 我们与 DiffFlowMap [Li et al. 2025]、EigenFluid [Chen et al. 2024]、改进半拉格朗日（Improved SL）[Tang et al. 2021] 以及 SL [Treuille et al. 2003] 比较。DiffFlowMap 使用其发布的配置；其余方法使用所报告的复现与其控制设置。这些方法对每个过渡分别优化，而 VIOT 复用训练好的权重。图 7 与图 8 在所展示的链上比较各方法。与学习型基线（CFM）的比较随 2D 与 3D 结果分别在第 5.2 与 5.3 节报告。

**条件流匹配基线.** 我们的 OT-CFM 基线训练一个以固定源密度、目标密度与时间为条件的 FNO，沿条件位移路径做速度回归 [Lipman et al. 2022; Tong et al. 2023]。其无约束速度以周期性保守有限体积（FV）格式演化单位质量密度，不做密度截断或质量重归一化。每次 rollout 在 $[0,1]$ 上使用 50 次网络查询，并以阈值 0.45 做受 CFL 限制的 FV 子步。在评估终端误差之前，细网格单元质量被求和回度量网格。

**指标.** 终端 $L^2$ 为所述网格与输入尺度下的 $\|\rho_1^{\rm pred}-\rho_1\|_2$；相对 $L^2$ 先把每对的误差除以其目标范数再平均。这些评估范数与缩放后的均方训练损失 $\mathcal D_h$ 不同。跨 2D 单位质量输入与 3D 峰值归一化输入的原始范数不可直接比较。我们报告所表示速度的谱域散度，并在终端精度可比的条件下，用动能（KE）与有限差分拟涡能作为活动性与正则性的度量。数值质量与密度分布变化在修正前后的量化见第 5.5.2 节。

**评估协议.** 对自传输，训练从包含 $N$ 个形状的池中独立、均匀、有放回地抽取源与目标，在任何增广之前给出 $N^2$ 个可能的有序对。球体→飞机设定则使用一个规范球体与 $N$ 个可能的飞机目标。训练使用端点对，不使用监督的中间轨迹。我们区分**池内**评估、**形状不相交**评估，以及**插值**或**跨数据集迁移**。对表 2 中的每个报告误差，我们从相应池中评估 100 个采样得到的源–目标对，使用种子 42 与 $t\in[0,1]$ 上的 50 个推理步。池大小数字统计可用形状数；误差统计使用采样得到的对。误差以对上的均值与样本标准差报告，括号中为平均逐对相对误差。留出评估在 2D 中使用单位质量输入，在 3D 中使用训练器经域检查的峰值归一化采样器；平流与质量校正遵循上述流程。对球体→飞机，留出标记适用于目标，而源球体保持不变。对 MNIST，留出池为官方测试划分。对字形数据集，我们使用训练流程渲染 3,000 个训练字符之外的字符（相同字体）、两种未见字体的相同字符（楷体、仿宋），以及 62 个拉丁字形在八个未见字体族（2D）中的渲染，或在 FreeSans、FreeSerif、FreeMono 与 Roboto Slab 的八个未见面（3D）中的渲染。原始 MPEG-7 与飞机算子使用了整池，因此我们在受限划分上用原始模型配方重新训练这两个算子。MPEG-7 使用 1,294 个轮廓的随机 90/10 划分，划分种子为 0。飞机使用 4,045 个形状的官方 PC15k 划分，训练+验证用于训练，808 架测试飞机留出。对 HuMMan，我们在同一运动片段相邻采样帧之间、去除全局朝向与平移后，合成 1,181 个顶点级中点的人体配置，并用训练流程体素化。这测试的是已知姿态之间的插值，而非对独立受试者或运动片段的泛化。

约束比较（表 5）与表 7 中的诊断在每个设定上使用相同数量的对。CFM 每个任务使用 20 个验证实例（表 3）；跨数据集与分辨率迁移研究每个数据集使用 20 对。

除非明确标识为拆分重训练，实验与交互式演示使用表 1 中列出的原始整池算子。约束与分辨率研究使用池内形状；诊断池在表 7 中标识。

### 5.2 2D 密度传输

我们在 MNIST 数字、496 个 DejaVu 字形、约 9k 个 CJK 字符与 1,294 个 MPEG-7 轮廓上为每个数据集训练一个算子，评估池的区分见第 5.1 节。四者都是自传输，源与目标从同一训练集中独立抽取。

我们在两条四关键帧链上把 VIOT 与四个逐实例基线比较：MNIST 数字链 1→3→5→7 与 MPEG-7 轮廓链 mouse→horse→bird→butterfly，报告各方法质量归一化最终密度与规范真值目标之间的终端 $L^2$。在 MNIST 上，VIOT 达到 $L^2=0.0007$（相对 $L^2=0.083$），而 EigenFluid [Chen et al. 2024] 为 0.0079、半拉格朗日（SL）为 0.0089、Improved-SL 为 0.0099、DiffFlowMap [Li et al. 2025] 为 0.0103，相对最强基线有 11 倍优势。在 MPEG-7 上，VIOT 达到 0.0023（相对 $L^2=0.289$），而 Improved-SL 为 0.0031、EigenFluid 为 0.0037、DiffFlowMap 为 0.0049、SL 为 0.0066，优势为 1.3 倍。在更具尺度不变性的相对 $L^2$ 指标上，基线在 MNIST 上聚集在 1.0 附近、在 MPEG-7 上聚集在 0.4–0.8，这为所展示的链在所述归一化下提供了另一重比较。

图 6、7、8、9、10 展示了全部四个 2D 数据集上的定性结果。这些增益是在每个基线都获得其完整逐对优化预算（在同一块 A100 上约每小时一个源–目标对，约每三小时一条四关键帧链）的情况下取得的；同一个训练好的 VIOT 算子可通过前馈 rollout 复用于新的对，而每个基线都必须为每一对新输入从头重新优化。

**图 6：** 字形长链传输。两个字母串 “FLUIDOT OPERATOR”（上）与 “SIGGRAPH ASIA 2026”（下）经单个训练好的 2D 算子逐字形渲染。每个字符是一个目标关键帧（在每个关键帧单元格右上角标出）；未标记的单元格为中间 rollout 帧。

**图 7：** 手写 MNIST 数字长链传输（1→3→5→7）。各行在同一源–目标链上比较 VIOT 与四个逐实例基线（自上而下：VIOT、DiffFlowMap [Li et al. 2025]、EigenFluid [Chen et al. 2024]、Improved-SL [Tang et al. 2021]、SL [Treuille et al. 2003]）；各列在等间隔时刻采样 rollout。红色边框单元格为目标关键帧；无边框单元格为中间 rollout 帧。

**图 8：** MPEG-7 轮廓长链传输（mouse→horse→bird→butterfly）。五行方法的行序与 rollout 约定同图 7：在同一源–目标链上把 VIOT（最上）与 DiffFlowMap、EigenFluid、Improved-SL、SL 比较。

**图 9：** 汉字长链传输。一条 14 字链渲染唐代诗作《春江花月夜》的开篇对句“春江潮水连海平，海上明月共潮生”。约定同图 7。

**图 10：** 100 个随机 MPEG-7 过渡的 $10\times10$ 网格，每个网格单元展示一次 5 链推理（同一训练好的 VIOT 算子连续五段 rollout，段间不重训练）最终目标处的密度。每个单元左上角的小幅深色插图为对应的真值目标轮廓。

**泛化.** 表 2 报告 2D 泛化结果。重训练的 MPEG-7 算子的留出终端 $L^2$ 为 0.00110，而池内为 0.00102。CJK 未见字体的相对 $L^2$ 为 0.187，池内为 0.173，未见字符上为 0.140。2D 字体算子在未见字体族上为 0.210，池内为 0.224。

**表 2：** 对单独构造的评估池的泛化。终端 $L^2$ 为 100 个对上的均值 ± 样本标准差，括号中为平均相对 $L^2$。“重训练”算子把其评估形状排除在训练之外。整池参考行评估的是包含于这些算子训练池中的子集。HuMMan 测试的是已知受试者与片段之间姿态的插值。

| 设定（算子） | 评估池 | 池内 $L^2$ | 评估 $L^2$ |
|---|---|---:|---:|
| MNIST 2D | 官方测试划分（10k） | $0.00112\pm0.00038$（0.127） | $0.00108\pm0.00036$（0.123） |
| CJK 2D | 300 个未见字符，相同字体 | $0.00152\pm0.00045$（0.173） | $0.00123\pm0.00021$（0.140） |
| CJK 2D | 300 个字符，2 种未见字体 | — | $0.00165\pm0.00090$（0.187） |
| Font 2D | 62 个字形，8 个未见字体族 | $0.00197\pm0.00068$（0.224） | $0.00185\pm0.00047$（0.210） |
| MPEG-7 2D，整池算子 | 129 个拆分出的形状（已见） | $0.00102\pm0.00043$（0.129） | — |
| MPEG-7 2D，在 1,165 上重训练 | 129 个拆分出的形状 | $0.00102\pm0.00046$（0.128） | $0.00110\pm0.00049$（0.139） |
| Sphere→airplane 3D，整池算子 | 808 架 PC15k 测试飞机（已见） | $18.71\pm3.21$（0.239） | — |
| Sphere→airplane 3D，在 3,237 上重训练 | 808 架 PC15k 测试飞机 | $18.47\pm5.00$（0.241） | $18.66\pm3.41$（0.238） |
| HuMMan 3D | 1,181 个中点姿态（插值） | $29.19\pm4.58$（0.269） | $26.64\pm3.48$（0.245） |
| Font 3D | 62 个字形，8 个未见面 | $25.76\pm3.32$（0.305） | $25.89\pm3.52$（0.307） |

**跨数据集迁移.** 跨数据集迁移检验的是复用的另一个方面，与留出划分不同。我们在每个数据集 20 个共享对上评估三个 2D 算子，这些对以种子 42 从原始 MNIST 训练划分以及完整 CJK、MPEG-7 池中采样。按 MNIST/CJK/MPEG-7 顺序，平均相对 $L^2$ 对 MNIST 算子为 0.14/0.22/0.21，对 CJK 算子为 0.21/0.17/0.28，对 MPEG-7 算子为 0.18/0.25/0.15。该矩阵度量了跨最终训练数据集的复用，并显示随之而来的误差上升。它补充第 5.4 节的用户手绘示例。

**条件流匹配.** MNIST 的 CFM 模型使用 55,000 张训练、5,000 张验证与 10,000 张官方测试图像。其网络与度量网格为 $128^2$，密度传输网格为 $512^2$。在以种子 42 采样的 20 个验证对（表 3）上，其平均相对终端 $L^2$ 为 $0.2722\pm0.0439$，平均绝对谱域散度为 1.460。仅把传输网格增至 $1024^2$，同一些对上的平均相对 $L^2$ 为 0.2757。被评估的 CFM 模型在满足不可压缩性上不及 VIOT；VIOT 的谱域旋度使散度保持在数值舍入误差附近（表 5）。

**表 3：** OT-CFM 在 MNIST 与球体到飞机传输上的结果。相对终端 $L^2$ 为每个任务 20 个验证实例上的均值 ± 样本标准差。散度是网络网格上的平均绝对谱域残差。FNO 网格与 FV 网格分别为网络/度量网格与密度传输网格。

| CFM 任务 | FNO 网格 | FV 网格 | 相对 $L^2$ | $\langle\lvert\nabla\cdot\mathbf v\rvert\rangle$ |
|---|---|---:|---:|---:|
| MNIST 2D | $128^2$ | $512^2$ | $0.2722\pm0.0439$ | 1.460 |
| Sphere→airplane 3D | $128^3$ | $128^3$ | $0.4196\pm0.0901$ | 0.228 |

### 5.3 3D 密度传输

我们在三个 3D 设定上为每个任务训练一个算子（评估协议见第 5.1 节）。DejaVu 字体字形（1,364 个形状，体素化为 $128^3$）与 HuMMan 人体姿态（5,000 个姿态）为自传输，源与目标取自同一训练集。第三个是跨分布的球体→飞机设定：源是体积与飞机平均密度体积相匹配的单个规范球体，目标取自 4,045 个 ShapeNet 飞机形状。

图 2 展示七条五关键帧字体链（GRAPH、SHAPE、FLUID、SIGAS、THANK、2026S、12345），图 4 展示五条人体姿态长链，二者各自都由同一个训练好的 3D 算子产生。图 5、图 11 与图 12 合起来展示来自跨分布算子的 21 个球体→飞机传输，真值飞机以插图形式显示在每条链的最后一帧上。

**泛化.** 表 2 报告留出飞机与字体以及 HuMMan 姿态插值的结果。重训练的飞机算子的终端 $L^2$ 留出为 18.66、池内为 18.47；整池参考在已见测试目标上为 18.71。对 3D 字体，相应误差为 25.89 与 25.76。HuMMan 中点姿态给出 26.64，而池内为 29.19，测试的是插值而非对未见受试者或片段的泛化。

**条件流匹配.** 球体→飞机 CFM 模型遵循第 5.1 节的协议，使用 2,981 个训练、256 个验证与 808 个测试目标，源为规范球体。其网络、度量与密度传输网格均为 $128^3$。在以种子 42 采样的 20 个验证目标（表 3）上，平均相对终端 $L^2$ 为 $0.4196\pm0.0901$，平均绝对谱域散度为 0.228。该 3D CFM 模型同样留下非零散度，而 VIOT 把谱域不可压缩性保持到数值精度（表 7）。

**图 4：** 3D 人体姿态长链传输。每一行可读作一个烟雾状人体，经五个随机挑选的目标姿态被平流输运，由单个训练好的 3D 算子产生。图中展示五条这样的链；目标关键帧标记在每个关键帧单元格的右下角，相邻关键帧之间的两个无边框单元格为中间平流帧。

**图 5：** 3D 球体到飞机传输（1/3）。列方向展示由同一训练好的 3D 算子产生的七个随机球体→飞机 rollout。行方向自上而下给出每条 50 步 rollout 的第 1、11、21、31、41、51 帧。每个底行单元格右上角的小插图为该 rollout 的真值飞机。

**图 11：** VIOT 球体到飞机传输（2/3）。另外七个 rollout，同一训练好的 3D 算子，布局同图 5。

**图 12：** 3D 球体到飞机传输（3/3）。另外七个 rollout，同一训练好的 3D 算子，布局同图 5。三部分合计 21 个 rollout。

### 5.4 实时交互控制

我们把 MNIST 训练得到的算子部署在一个交互式绘画链界面中（图 13）。用户在左侧画布上绘制源密度、在中间画布上绘制目标密度；手绘笔画会被做边界框裁剪、补成方形、缩放到画布 70% 填充、模糊，并做质量归一化，以匹配 MNIST 训练时的采样器。点击后，VIOT 在右侧画布中生成一条 50 步的无散度 rollout 到目标；其架构级合成输入基准在单块 A100 上约为 0.46 s（表 9），因此过渡感觉上是即时的。“Continue” 控件把最终密度移入源画布，从而在不重训练的情况下定义下一段。

用户绘制的笔画是任意文本与形状，远超出 MNIST 单数字训练分布。图 13 以手写的 “VIOS” 源传输到多行 “Thx You” 目标为例说明这一点：尽管训练只见孤立数字，该算子仍能处理空间布局与连笔字形。补充视频展示了更多分布外链与实时绘画。

**图 13：** 交互式绘画链图形界面。用户绘制源密度（左）与目标密度（中），VIOT 生成一条 50 步、无散度的传输并 rollout（右）。此处展示的源与目标都完全处于 MNIST 训练集分布之外。训练好的算子在无逐对优化的情况下处理演示的草图。实时使用与更多分布外链见补充视频。

### 5.5 验证与消融

#### 5.5.1 消融研究

我们考察骨干网络、不可压缩性参数化、耗散权重、空间分辨率以及 rollout 离散化。

**骨干.** 表 4 在 MNIST $64^2$ 上比较 FNO 与 CNN+MLP、patch Transformer 以及 DiT；图 14 展示共享的 6→7 示例。在这些配置中，FNO 具有最低的终端误差与最少的参数。约束满足与分辨率迁移在下面研究。

**表 4：** MNIST $64^2$ 上的参考骨干比较。终端 $L^2$ 为最终密度失配。KE/pix 在单元、保存的 rollout 步与评估对上平均 $\rho\|\mathbf v\|_2^2$，不含 $1/2$ 因子。Enst 对零填充中心差分所得的涡量平方做同样的平均。Params 为可训练参数量。图 14 展示 6→7 示例。

| 轴 | 变体 | $L^2$↓ | KE/pix | Enst | Params |
|---|---|---:|---:|---:|---:|
| Backbone @$64^2$ | CNN+MLP | 0.0236 | 0.216 | 943 | 7.5M |
| Backbone @$64^2$ | Transformer | 0.0197 | 0.126 | 473 | 7.7M |
| Backbone @$64^2$ | DiT | 0.0250 | 0.108 | 508 | 32.6M |
| Backbone @$64^2$ | FNO | 0.0081 | 0.046 | 67 | 6.4M |

**约束比较.** 我们在 MNIST $128^2$ 上比较 Helmholtz 投影、软散度罚与旋度参数化，使用 FNO 宽度 32、16 个模态、六层，$k_{\max}=0.25$。每个选定 checkpoint 都在相同的 100 个池内对上以种子 42、50 步 rollout 评估。表 5 报告所选 checkpoint 的终端误差与谱域散度。

两种硬约束的谱域散度都在数值舍入误差量级。在共同的训练阶段，旋度的终端误差低于 Helmholtz 投影。软罚项留下非零散度残差。

**表 5：** 在 100 个公共 MNIST $128^2$ 池内对上的约束比较。误差为均值 ± 样本标准差；散度为以像素单位表示的平均绝对谱域残差。所有 checkpoint 均使用相同的标量平流评估，带正性截断与质量重归一化。所选 checkpoint 来自不同训练阶段。

| 参数化 | 终端 $L^2$ | 相对 $L^2$ | $\langle\lvert\nabla\cdot\mathbf v\rvert\rangle$ |
|---|---:|---:|---:|
| Helmholtz 投影 | $0.01019\pm0.00248$ | $0.580\pm0.141$ | $3.2\times10^{-6}$ |
| 软罚项 | $0.00940\pm0.00240$ | $0.535\pm0.137$ | 0.386 |
| VIOT（硬旋度） | $0.00373\pm0.00074$ | $0.212\pm0.042$ | $4.1\times10^{-6}$ |

**图 14：** 在共享的 6→7 MNIST 对上做的三轴消融。最左侧两格：源 $\rho_0$（上）、目标 $\rho_1$（下）。各行：分辨率（三个分别在 $64^2$/$128^2$/$256^2$ 上训练的 FNO 算子；单个算子的零样本迁移见表 6）；架构（匹配 $64^2$ 的 Transformer / DiT / FNO；CNN+MLP 省略，见表 4）；约束（soft-div / Helmholtz 投影 / curl，定量比较见表 5）。绿色边框单元格对应 $128^2$ 上同一个已部署的 VIOT 算子。

**耗散权重 $\mu$.** 我们在 MPEG-7 $256^2$ 上把耗散权重 $\mu$ 从 0 扫到 $2\times10^{-2}$ 共六个取值，在 10 个参考源–目标对上取平均（图 15 列出各取值）。在所测试的零正则化运行中，$\mu=0$ 无法产生有用的传输：相对 $L^2$ 升至 $0.73\pm0.22$，平均拟涡能爆炸到 204，比正正则化运行高一个数量级。所测试的正权重 $\mu\in[10^{-3},2\times10^{-2}]$ 产生稳定的 rollout，精度处于平坦平台（相对 $L^2$ 介于 0.12 与 0.14 之间），同时把平均拟涡能从 15.0 单调压到 6.8——这正是耗散项被设计来控制的那种权衡。图 16 展示同一时间区间内推理步数变化的效果。我们在下面量化这种敏感性，并在第 5.6 节报告运行时间测量。

**图 15：** 在一个代表性 MPEG-7 对上的耗散权重消融。各行展示 $\mu\in\{0,10^{-3},2.5\times10^{-3},5\times10^{-3},10^{-2},2\times10^{-2}\}$ 时的源到目标 rollout（自上而下）；各列在等间隔时刻采样 rollout。零权重行（$\mu=0$）偏离目标并带有高频速度结构；所测试的正权重改善匹配，更大的权重产生视觉上更光滑的运动。

**分辨率迁移.** FNO 权重按傅里叶模态而非像素索引，因此可在不同的兼容网格尺寸上执行。这并不保证与分辨率无关的精度 [Gao et al. 2025; Lanthaler et al. 2024]，而我们的流程含有两个依赖分辨率的约定：旋度对像素索引求导，平流消耗像素位移。设 $R_{\rm train}$ 与 $R$ 分别为训练与推理时每轴的网格采样数。对固定域与不变的势模态幅值，这些约定引入位移因子 $(R_{\rm train}/R)^2$，这促使我们做补偿性的速度重缩放。截断 $k_{\max}$ 以每样本周期数指定（0.25 为 Nyquist 频率的一半），因此物理截断也随 $R$ 改变。表 6 在相同的 20 个池内对上评估在 $256^2$ 上训练的 MPEG-7 算子，这些对以种子 42 采样、重采样到 $64^2$–$512^2$ 并 rollout 50 步。它报告相对终端 $L^2$ 与跨分辨率一致性，后者为把预测重采样到 $256^2$ 后与该变体在原生 $256^2$ 上预测之间的相对 $L^2$。在该实验中，朴素迁移的误差在 $192^2$ 与 $256^2$ 处最低。取 $k_{\max}(R)=\min(0.5,64/R)$ 周期/样本，可在网格允许时把物理截断保持在每域 64 周期，但并未在所测试范围内恢复精度。在所测试设定中，速度单位校正的影响大于该截断调整。把速度按 $(R/256)^2$ 重缩放可在不重训练的情况下改善迁移，在 $128^2/192^2/256^2/384^2$ 上给出相对 $L^2$ 0.20/0.15/0.15/0.23。$384^2$ 处的残余误差仍高于原生 $256^2$ 的数值。另外一次多分辨率微调使用 20k 额外步，网格尺寸每批从 $\{128,192,256,384\}$ 采样，在这些网格上给出 0.15/0.15/0.15/0.19，一致性 $\le0.11$。这些网格在微调期间被见过，且微调后的模型在评估时未使用显式速度重缩放。所有变体在所测试的极端 $64^2$ 与 $512^2$ 处误差都更大。因此，按模态索引的权重提供了可复用的表示，其迁移精度可由单位校正与多分辨率训练改善。

**表 6：** 在 20 个池内 MPEG-7 对上的分辨率迁移。前三行使用同一个 $256^2$ checkpoint 且不重训练；最后一行使用经 20k 多分辨率微调步后的另一个 checkpoint。条目为相对终端 $L^2$，括号中为（给出时的）一致性。“固定带宽”使用 $k_{\max}(R)=\min(0.5,64/R)$ 周期/样本，在 $64^2$ 与 $96^2$ 受 Nyquist 限制。“速度重缩放”把 $\mathbf v$ 乘以 $(R/256)^2$。微调使用网格 $\{128,192,256,384\}$ 且不做该重缩放。

| 网格 | $64^2$ | $96^2$ | $128^2$ | $192^2$ | $256^2$（训练） | $384^2$ | $512^2$ |
|---|---:|---:|---:|---:|---:|---:|---:|
| 同权重，朴素 | 0.85 | 0.52 | 0.21（0.21） | 0.14（0.11） | 0.15 | 0.47（0.43） | 0.71（0.69） |
| 固定带宽 | 0.83 | 0.52 | 0.26 | 0.14 | 0.15 | 0.47 | 0.71 |
| 速度重缩放 | 0.38 | 0.25 | 0.20（0.16） | 0.15（0.09） | 0.15 | 0.23（0.17） | 0.38（0.35） |
| 多分辨率微调 | 0.30 | 0.17 | 0.15（0.08） | 0.15（0.05） | 0.15 | 0.19（0.11） | 0.37（0.32） |

**训练 rollout 长度.** 默认训练 rollout 在 $t\in[0,1]$ 上取 $K=10$ 步。我们在一次受控的 MPEG-7 消融中令 $K\in\{5,8,10,12,20\}$，使用较小的 FNO 配置 $w=32$、$m=16$、$L=6$，每次运行 40k 训练迭代，并在 20 个池内对上用 50 个推理步评估。得到的终端 $L^2$ 分别为 0.00215、0.00175、0.00168、0.00163 与 0.00159。误差在这一测试序列上下降，超过 10 步后收益递减，从 10 步到 20 步约改善 5%。这些运行改变的是同一时间区间上的离散化与反向传播深度，而非物理时间跨度。另外的推理步数扫描在 10 步时给出终端 $L^2$ 0.00095、50 步时 0.00105、200 步时 0.00109；相对 10 步，后两者误差约增加 11% 与 15%。在所测试范围内观察到的退化是温和的；所有步数都覆盖同一时间区间。

**图 16：** 在一个代表性 MPEG-7 对上的推理步数消融。各行展示 $n\in\{5,10,20,50,100\}$ 个推理步的 rollout（自上而下）；各列在 $t\in\{0,0.25,0.5,0.75,1\}$ 处采样 rollout。

#### 5.5.2 动量一致性与数值传输

我们通过动量与密度传输诊断来刻画学习到的轨迹。对周期速度表示，定义

$$
\mathbf m=\partial_t\mathbf v+(\mathbf v\cdot\nabla)\mathbf v-\nu\Delta\mathbf v,\qquad
\mathbf f_{\rm imp}=\mathcal P[\mathbf m], \tag{21}
$$

其中 $\mathcal P$ 为 Leray 投影子 [Leray 1934; Temam 2024]。它去掉由周期压强平衡的分量，留下最小 $L^2$ 的相容力。我们用谱方法评估空间导数、用中心差分评估时间导数。以下结果取 $\nu=0$，因而度量的是 Euler 动量一致性。长度以域边长为单位表示，传输区间为 $[0,1]$。

对一个采样得到的矢量场 $\mathbf g$，我们定义时空矢量 RMS 范数 $\|\mathbf g\|=\left(\mathrm{mean}_{t,\mathbf x}\|\mathbf g_t(\mathbf x)\|_2^2\right)^{1/2}$。该平均覆盖网格单元与内部保存的速度时刻（排除首末时间样本），并对每一对分别进行。我们报告 $F_{\rm RMS}=\|\mathbf f_{\rm imp}\|$ 以及一个按加速度归一化的比值：

$$
q=\frac{\|\mathbf f_{\rm imp}\|}
{\|\partial_t\mathbf v\|+\|(\mathbf v\cdot\nabla)\mathbf v\|+\|\nu\Delta\mathbf v\|}. \tag{22}
$$

逐对的 RMS 值与比值随后被平均；零或数值上可忽略的分母按未定义处理。对下面的罚项扫描，我们还保留 $r=\|\mathcal P\mathbf m\|/\|\mathbf m\|$，即压强无法吸收的失衡比例。该比例与力量级描述的是轨迹的不同方面。

表 7 报告相同对上的 50 步与 100 步评估。除动量外，$\delta M$ 度量截断与重归一化之前最大绝对单步质量变化除以初始质量。密度分布变化 $\delta H$ 是排序后的最终与初始单元值之间的相对 $L^2$ 距离。两量都按对计算后再平均。2D 评估器使用中点 MacCormack 平流，3D 评估器使用单趟半拉格朗日平流。

所表示的速度保持谱域无散度。在这些设定中，每步平均最大原始质量变化低于 0.17%；3D 中更大的直方图变化反映了单趟密度格式的数值混合。因此，全局质量校正与密度值保持被分开评估。按加速度归一化的动量比值在两种步数之间变化很小。

**表 7：** 每个设定 100 个对上的动量与数值传输诊断。质量漂移 $\delta M$、直方图变化 $\delta H$、力 RMS $F_{\rm RMS}$ 与谱域散度来自 50 步 rollout；$q$ 另外用 100 步评估。质量与直方图列为百分比；力使用单位域长与单位传输时间。池标签区分各评估设定。

| 设定 | 池 | $\delta M$（%） | $\delta H$（%） | $F_{\rm RMS}$ | $q_{50}$ | $q_{100}$ | $\langle\lvert\nabla\cdot\mathbf v\rvert\rangle$ |
|---|---|---:|---:|---:|---:|---:|---:|
| MNIST 2D | 测试派生的缓存 | 0.0311 | 1.12 | 0.3303 | 0.521 | 0.527 | $4.0\times10^{-6}$ |
| Font 2D | 未见字体 | 0.0101 | 0.78 | 0.3146 | 0.581 | 0.594 | $3.3\times10^{-6}$ |
| CJK 2D | 未见字符 | 0.0014 | 0.44 | 0.1988 | 0.626 | 0.634 | $1.5\times10^{-6}$ |
| MPEG-7 2D | 已见子集 | 0.0067 | 1.61 | 0.3337 | 0.541 | 0.548 | $4.8\times10^{-6}$ |
| Sphere→airplane 3D | 留出目标 | 0.0987 | 33.87 | 0.0318 | 0.494 | 0.496 | $2.2\times10^{-7}$ |
| HuMMan 3D | 姿态插值 | 0.1301 | 21.86 | 0.0398 | 0.582 | 0.581 | $3.2\times10^{-7}$ |
| Font 3D | 未见面 | 0.1643 | 28.91 | 0.0430 | 0.539 | 0.539 | $1.4\times10^{-7}$ |

**动量罚项的影响.** 我们用按 $\lambda_{\rm mom}$ 加权的投影残差平方罚项训练单独的算子。训练罚项使用后向时间差分；评估使用中心差分。表 8 在 MPEG-7 $256^2$ 上扫描七个设定，$\nu=0$。随着权重增大，$r$ 从 0.84 降到 0.19，终端误差从 0.0013 升到 0.0053，平均拟涡能从 9.3 降到 0.6。对零罚项的 40k 步 checkpoint 再做 20k 步微调给出类似趋势。该扫描展示了端点拟合与动量正则化之间的经验权衡；$\lambda_{\rm mom}$ 是训练参数。

**表 8：** MPEG-7 $256^2$ 上的动量罚项扫描（40k 训练步，20 个池内评估对，$\nu=0$）。这里 $r$ 为全局投影范数与未投影范数之比（统计范围为保存的对、内部时间样本与网格单元）；范数先对矢量幅值的平方求和再开方。记录的拟涡能使用零填充中心有限差分，不同于循环填充的训练罚项；KE 为 $\rho\|\mathbf v\|^2$ 的 rollout 均值，不含 $1/2$ 因子。

| $\lambda_{\rm mom}$ | $r$↓ | 终端 $L^2$↓ | 拟涡能 | KE |
|---:|---:|---:|---:|---:|
| 0 | 0.835 | 0.00130 | 9.27 | 0.0376 |
| $10^{-6}$ | 0.793 | 0.00135 | 9.00 | 0.0383 |
| $10^{-5}$ | 0.752 | 0.00147 | 7.83 | 0.0348 |
| $10^{-4}$ | 0.627 | 0.00180 | 6.14 | 0.0312 |
| $10^{-3}$ | 0.423 | 0.00280 | 3.71 | 0.0255 |
| $10^{-2}$ | 0.252 | 0.00394 | 1.78 | 0.0151 |
| $10^{-1}$ | 0.192 | 0.00527 | 0.61 | 0.0057 |

### 5.6 性能

表 9 在一块 NVIDIA A100 上记录架构级 rollout 耗时。该基准使用合成的单位质量输入场。所测量的 50 步代价对报告的 $256^2$ 2D 架构约为 0.38–0.46 s，对 $128^3$ 3D 架构约为 5 s。相对于所展示 2D 比较中使用的约一小时量级逐实例预算，这在在线逐对代价上带来约四个数量级的降低。该在线比较不包含离线训练。对 $Q$ 个请求的源–目标对，总代价为 $T_{\rm train}+QT_{\rm infer}$，其中 $T_{\rm train}$ 为一次性离线训练代价，$T_{\rm infer}$ 为一个完整对 rollout 的代价。250 步列测量的是同一端点在 $[0,1]$ 上更细的离散化。

**表 9：** 单块 NVIDIA A100、批大小 1 上的合成输入 rollout 耗时。模型加载、传输与预热均不计入。两列都使用 $[0,1]$ 上的固定端点。数据集名称标识模型配置；HuMMan 的计时使用 exp63，这是一个与主打 exp59 模型架构相同的独立 checkpoint。

| Run | 维度 | 分辨率 | 骨干 | 参数量 | 单步（s） | 50 步（s） | 250 步（s） |
|---|---|---|---:|---:|---:|---:|---:|
| MNIST 2D | 2 | 256 | FNO $w64/m32/L8$ | 134.5M | 0.0093 | 0.463 | 3.245 |
| MPEG-7 2D | 2 | 256 | FNO $w64/m32/L8$ | 134.5M | 0.0093 | 0.463 | 3.211 |
| CJK 2D | 2 | 256 | FNO $w64/m32/L8$ | 134.5M | 0.0093 | 0.463 | 3.225 |
| Font 2D | 2 | 256 | FNO $w64/m16/L8$ | 33.8M | 0.0079 | 0.385 | 1.913 |
| MNIST 2D（small） | 2 | 128 | FNO $w32/m16/L6$ | 6.4M | 0.0063 | 0.316 | 1.583 |
| Sphere→airplane 3D | 3 | 128 | FNO $w32/m16/L6$ | 201.5M | 0.0995 | 4.977 | 24.887 |
| HuMMan 3D | 3 | 128 | FNO $w32/m16/L6$ | 201.5M | 0.0990 | 4.944 | 24.718 |
| Font 3D | 3 | 128 | FNO $w32/m16/L6$ | 201.5M | 0.0992 | 4.971 | 24.854 |

## 6. 结论

我们提出了 VIOT，一个用于摊销式不可压缩密度传输的神经算子，它把传输过程本身视为一个可学习的生成对象。通过用流函数与矢量势参数化速度场，VIOT 由构造施加谱域不可压缩性，并通过密度平流完成传输。模型通过最小化正则化传输目标来训练，其中耗散项平衡端点精度与流动光滑性。与所比较的逐实例伴随方法或可微仿真方法不同，VIOT 学习一个可复用的、密度对上的生成式传输算子，并通过前馈 rollout 生成过渡，无需内层优化或逐对重训练。结合傅里叶神经算子骨干，VIOT 支持多分辨率求值，并能以每对秒级时间产生 2D 与 3D rollout，且在 2D 中演示了实时交互式生成。我们的结果表明，用神经算子摊销不可压缩传输，是流体控制、密度插值、形状动画以及传输过程生成建模的一个有前景的方向。

**局限.** 我们的实验主要使用 2D 的 $256^2$ 网格与 3D 的 $128^3$ 网格，并采用较短的可微训练 rollout。更大的网格与更长的 rollout 会增大显存开销；跨分辨率精度还依赖速度单位与带宽。谱域表示是周期的、且只表示零均值速度，而网格外的密度样本使用边界延拓。固壁与无滑移条件需要相容的边界处理，独立的平均流需要额外的调和速度分量。当前表述不包含受控的质量源或汇，且传输目标并不施加动量方程。

数值平流、截断与重归一化会改变密度值分布，尤其在 3D 中，且某些形变会出现细尺度的丝状痕迹。对映射做空间正则化以及采用更少耗散的平流，可能减少这些伪影。关键帧段在其接合处可能出现速度跳变；以进入速度为条件或强制段间连续性，可以改善光滑性。

算子按数据集训练，HuMMan 研究测试的是姿态插值，而非对未见受试者或运动片段的泛化。我们的比较集合尚未包含混合的学习–仿真器控制流程。

**未来工作.** 刚–流耦合需要与无散度表示相容的边界条件；跨数据集的统一大规模训练可能产生无需按数据集重训练的通用算子；与 3D 形状生成模型耦合，可为基于传输的动画提供密度端点；通过 Blender 或 Houdini 插件面向艺术家的 DCC 集成，可将绘制的关键帧过渡带入既有工作流；把目标与约束扩展到黏弹性、多相与自由表面传输，是另一个方向。

## 参考文献（英文原条目，按原文顺序）

[1] Michael S Albergo, Nicholas M Boffi, and Eric Vanden-Eijnden. 2023. Stochastic interpolants: A unifying framework for flows and diffusions. *arXiv preprint arXiv:2303.08797* (2023).

[2] Brandon Amos, Samuel Cohen, Giulia Luise, and Ievgen Redko. 2022. Meta optimal transport. *arXiv preprint arXiv:2206.05262* (2022).

[3] Vladimir Arnold. 1966. Sur la géométrie différentielle des groupes de Lie de dimension infinie et ses applications à l’hydrodynamique des fluides parfaits. In *Annales de l’institut Fourier*, Vol. 16. 319–361.

[4] Lazar Atanackovic, Xi Nicole Zhang, Brandon Amos, Mathieu Blanchette, Leo J Lee, Yoshua Bengio, Alexander Tong, and Kirill Neklyudov. 2025. Meta flow matching: Integrating vector fields on the Wasserstein manifold. In *International Conference on Learning Representations*, Vol. 2025. 94586–94610.

[5] Giacomo Baldan, Qiang Liu, Alberto Guardone, and Nils Thuerey. 2025. Flow matching meets pdes: A unified framework for physics-constrained generation. *arXiv preprint arXiv:2506.08604* (2025).

[6] Jean-David Benamou and Yann Brenier. 2000. A computational fluid mechanics solution to the Monge-Kantorovich mass transfer problem. *Numer. Math.* 84, 3 (2000), 375–393.

[7] Yann Brenier. 1989. The least action principle and the related concept of generalized flows for incompressible perfect fluids. *Journal of the American Mathematical Society* 2, 2 (1989), 225–255.

[8] Francis P Bretherton. 1970. A note on Hamilton’s principle for perfect fluids. *Journal of Fluid Mechanics* 44, 1 (1970), 19–31.

[9] Zhongang Cai, Daxuan Ren, Ailing Zeng, Zhengyu Lin, Tao Yu, Wenjia Wang, Xiangyu Fan, Yang Gao, Yifan Yu, Liang Pan, et al. 2022. Humman: Multi-modal 4d human dataset for versatile sensing and modeling. In *European Conference on Computer Vision*. Springer, 557–577.

[10] Angel X Chang, Thomas Funkhouser, Leonidas Guibas, Pat Hanrahan, Qixing Huang, Zimo Li, Silvio Savarese, Manolis Savva, Shuran Song, Hao Su, et al. 2015. Shapenet: An information-rich 3d model repository. *arXiv preprint arXiv:1512.03012* (2015).

[11] Jumyung Chang, Ruben Partono, Vinicius C Azevedo, and Christopher Batty. 2021. Curl-flow: Boundary-respecting pointwise incompressible velocity interpolation for grid-based fluids. *arXiv preprint arXiv:2104.00867* (2021).

[12] Duowen Chen, Zhiqiang Lao, Yu Guo, and Heather Yu. 2025. Fluid Composer: Fluid Detail Composition and Rendering Using Video Diffusion Models. In *Computer Graphics Forum*. Wiley Online Library, e70300.

[13] Ricky TQ Chen and Yaron Lipman. 2023. Flow matching on general geometries. *arXiv preprint arXiv:2302.03660* (2023).

[14] Ricky TQ Chen, Yulia Rubanova, Jesse Bettencourt, and David K Duvenaud. 2018. Neural ordinary differential equations. *Advances in neural information processing systems* 31 (2018).

[15] Yixin Chen, David Levin, and Timothy Langlois. 2024. Fluid Control with Laplacian Eigenfunctions. In *ACM SIGGRAPH 2024 Conference Papers*. 1–11.

[16] Mengyu Chu, Lingjie Liu, Quan Zheng, Erik Franz, Hans-Peter Seidel, Christian Theobalt, and Rhaleb Zayer. 2022. Physics informed neural fields for smoke reconstruction with sparse data. *ACM Transactions on Graphics (TOG)* 41, 4 (2022), 1–14.

[17] Mengyu Chu, Nils Thuerey, Hans-Peter Seidel, Christian Theobalt, and Rhaleb Zayer. 2021. Learning meaningful controls for fluids. *ACM Transactions on Graphics (TOG)* 40, 4 (2021), 1–13.

[18] Tao Du, Kui Wu, Pingchuan Ma, Sebastien Wah, Andrew Spielberg, Daniela Rus, and Wojciech Matusik. 2021. Diffpd: Differentiable projective dynamics. *ACM Transactions on Graphics (ToG)* 41, 2 (2021), 1–21.

[19] David G Ebin and Jerrold Marsden. 1970. Groups of diffeomorphisms and the motion of an incompressible fluid. *Annals of Mathematics* 92, 1 (1970), 102–163.

[20] Max Emerick and Bassam Bamieh. 2025. Incompressible optimal transport and applications in fluid mixing. In *2025 IEEE 64th Conference on Decision and Control (CDC)*. IEEE, 3157–3162.

[21] Nick Foster and Ronald Fedkiw. 2001. Practical animation of liquids. In *Proceedings of the 28th annual conference on Computer graphics and interactive techniques*. 23–30.

[22] Wenhan Gao, Ruichen Xu, Yuefan Deng, and Yi Liu. 2025. Discretization-invariance? On the discretization mismatch errors in neural operators. In *International Conference on Learning Representations*, Vol. 2025. 19360–19384.

[23] Ruiyu Gou, Michiel Van De Panne, and Daniel Holden. 2025. Control Operators for Interactive Character Animation. *ACM Transactions on Graphics (TOG)* 44, 6 (2025), 1–20.

[24] Jonathan Ho, Ajay Jain, and Pieter Abbeel. 2020. Denoising diffusion probabilistic models. *Advances in neural information processing systems* 33 (2020), 6840–6851.

[25] Daniel Holden, Taku Komura, and Jun Saito. 2017. Phase-functioned neural networks for character control. *ACM Transactions on Graphics (TOG)* 36, 4 (2017), 1–13.

[26] Philipp Holl, Vladlen Koltun, Kiwon Um, and Nils Thuerey. 2020. phiflow: A differentiable pde solving framework for deep learning via physical simulations. In *NeurIPS workshop*, Vol. 2.

[27] Philipp Holl and Nils Thuerey. 2024. ΦFlow (PhiFlow): Differentiable Simulations for PyTorch, TensorFlow and Jax. In *International Conference on Machine Learning*. PMLR.

[28] Yuanming Hu, Luke Anderson, Tzu-Mao Li, Qi Sun, Nathan Carr, Jonathan Ragan-Kelley, and Frédo Durand. 2019a. Difftaichi: Differentiable programming for physical simulation. *arXiv preprint arXiv:1910.00935* (2019).

[29] Yuanming Hu, Jiancheng Liu, Andrew Spielberg, Joshua B Tenenbaum, William T Freeman, Jiajun Wu, Daniela Rus, and Wojciech Matusik. 2019b. Chainqueen: A real-time differentiable physical simulator for soft robotics. In *2019 International conference on robotics and automation (ICRA)*. IEEE, 6265–6271.

[30] Tiffany Inglis, M-L Eckert, James Gregson, and Nils Thuerey. 2017. Primal-dual optimization for fluids. In *Computer Graphics Forum*, Vol. 36. Wiley Online Library, 354–368.

[31] Guang-Shan Jiang and Chi-Wang Shu. 1996. Efficient implementation of weighted ENO schemes. *Journal of computational physics* 126, 1 (1996), 202–228.

[32] Byungsoo Kim, Vinicius C Azevedo, Nils Thuerey, Theodore Kim, Markus Gross, and Barbara Solenthaler. 2019. Deep fluids: A generative network for parameterized fluid simulations. In *Computer graphics forum*, Vol. 38. Wiley Online Library, 59–70.

[33] Dmitrii Kochkov, Jamie A Smith, Ayya Alieva, Qing Wang, Michael P Brenner, and Stephan Hoyer. 2021. Machine learning–accelerated computational fluid dynamics. *Proceedings of the National Academy of Sciences* 118, 21 (2021), e2101784118.

[34] Nikola Kovachki, Zongyi Li, Burigede Liu, Kamyar Azizzadenesheli, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. 2023. Neural operator: Learning maps between function spaces with applications to pdes. *Journal of Machine Learning Research* 24, 89 (2023), 1–97.

[35] Samuel Lanthaler, Andrew M Stuart, and Margaret Trautner. 2024. Discretization error of Fourier neural operators. *arXiv preprint arXiv:2405.02221* (2024).

[36] Longin Jan Latecki, Rolf Lakamper, and T Eckhardt. 2000. Shape descriptors for non-rigid shapes with a single closed contour. In *Proceedings IEEE Conference on Computer Vision and Pattern Recognition. CVPR 2000 (Cat. No. PR00662)*, Vol. 1. IEEE, 424–429.

[37] Yann LeCun, Léon Bottou, Yoshua Bengio, and Patrick Haffner. 2002. Gradient-based learning applied to document recognition. *Proc. IEEE* 86, 11 (2002), 2278–2324.

[38] Jean Leray. 1934. Sur le mouvement d’un liquide visqueux emplissant l’espace. *Acta mathematica* 63, 1 (1934), 193–248.

[39] Yifei Li, Yuchen Sun, Pingchuan Ma, Eftychios Sifakis, Tao Du, Bo Zhu, and Wojciech Matusik. 2024. NeuralFluid: Neural fluidic system design and control with differentiable simulation. *Advances in Neural Information Processing Systems* 37 (2024), 84944–84967.

[40] Zhiqi Li, Jinjin He, Barnabás Börcsök, Taiyuan Zhang, Duowen Chen, Tao Du, Ming Lin, Greg Turk, and Bo Zhu. 2025. An adjoint method for differentiable fluid simulation on flow maps. In *Proceedings of the SIGGRAPH Asia 2025 Conference Papers*. 1–12.

[41] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. 2020. Fourier neural operator for parametric partial differential equations. *arXiv preprint arXiv:2010.08895* (2020).

[42] Zhehao Li, Qingyu Xu, Xiaohan Ye, Bo Ren, and Ligang Liu. 2023. Difffr: Differentiable sph-based fluid-rigid coupling for rigid body control. *ACM Transactions on Graphics (TOG)* 42, 6 (2023), 1–17.

[43] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. 2022. Flow matching for generative modeling. *arXiv preprint arXiv:2210.02747* (2022).

[44] Yaron Lipman, Marton Havasi, Peter Holderrieth, Neta Shaul, Matt Le, Brian Karrer, Ricky TQ Chen, David Lopez-Paz, Heli Ben-Hamu, and Itai Gat. 2024. Flow matching guide and code. *arXiv preprint arXiv:2412.06264* (2024).

[45] Xingchao Liu, Chengyue Gong, and Qiang Liu. 2022. Flow straight and fast: Learning to generate and transfer data with rectified flow. *arXiv preprint arXiv:2209.03003* (2022).

[46] Antoine McNamara, Adrien Treuille, Zoran Popović, and Jos Stam. 2004. Fluid control using the adjoint method. *ACM Transactions On Graphics (TOG)* 23, 3 (2004), 449–456.

[47] Kirill Neklyudov, Rob Brekelmans, Alexander Tong, Lazar Atanackovic, Qiang Liu, and Alireza Makhzani. 2023. A computational framework for solving Wasserstein Lagrangian flows. *arXiv preprint arXiv:2310.10649* (2023).

[48] Xingyu Ni, Jingrui Xing, Xingqiao Li, Bin Wang, and Baoquan Chen. 2025. Representing Flow Fields with Divergence-Free Kernels for Reconstruction. *Proceedings of the ACM on Computer Graphics and Interactive Techniques* 8, 4 (2025), 1–21.

[49] Derek Onken, Samy Wu Fung, Xingjian Li, and Lars Ruthotto. 2021. OT-Flow: Fast and accurate continuous normalizing flows via optimal transport. In *Proceedings of the AAAI Conference on Artificial Intelligence*, Vol. 35. 9223–9232.

[50] Zherong Pan and Dinesh Manocha. 2017. Efficient solver for spacetime control of smoke. *ACM Transactions on Graphics (TOG)* 36, 4 (2017), 1.

[51] Ethan Perez, Florian Strub, Harm De Vries, Vincent Dumoulin, and Aaron Courville. 2018. FiLM: Visual reasoning with a general conditioning layer. In *Proceedings of the AAAI conference on artificial intelligence*, Vol. 32.

[52] Gabriel Peyré and Marco Cuturi. 2019. *Computational optimal transport: With applications to data science*. Now Foundations and Trends.

[53] Tobias Pfaff, Meire Fortunato, Alvaro Sanchez-Gonzalez, and Peter W Battaglia. 2020. Learning mesh-based simulation with graph networks. *arXiv preprint arXiv:2010.03409* (2020).

[54] Maziar Raissi, Paris Perdikaris, and George E Karniadakis. 2019. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. *Journal of Computational physics* 378 (2019), 686–707.

[55] Jack Richter-Powell, Yaron Lipman, and Ricky TQ Chen. 2022. Neural conservation laws: A divergence-free perspective. *Advances in Neural Information Processing Systems* 35 (2022), 38075–38088.

[56] Bruno Roy. 2024. FluidsFormer: A Transformer-Based Approach for Continuous Fluid Interpolation. In *ACM SIGGRAPH 2024 Posters*. 1–2.

[57] Rick Salmon. 1988. Hamiltonian fluid mechanics. *Annual review of fluid mechanics* 20, 1 (1988), 225–256.

[58] Alvaro Sanchez-Gonzalez, Jonathan Godwin, Tobias Pfaff, Rex Ying, Jure Leskovec, and Peter Battaglia. 2020. Learning to simulate complex physics with graph networks. In *International conference on machine learning*. PMLR, 8459–8468.

[59] Andrew Selle, Ronald Fedkiw, Byungmoon Kim, Yingjie Liu, and Jarek Rossignac. 2008. An unconditionally stable MacCormack method. *Journal of Scientific Computing* 35, 2 (2008), 350–371.

[60] Alexander I Shnirelman. 1994. Generalized fluid flows, their approximation and applications. *Geometric & Functional Analysis GAFA* 4, 5 (1994), 586–620.

[61] Kimberly Stachenfeld, Drummond B Fielding, Dmitrii Kochkov, Miles Cranmer, Tobias Pfaff, Jonathan Godwin, Can Cui, Shirley Ho, Peter Battaglia, and Alvaro Sanchez-Gonzalez. 2021. Learned coarse models for efficient turbulence simulation. *arXiv preprint arXiv:2112.15275* (2021).

[62] Jos Stam. 1999. Stable fluids. In *Proceedings of the 26th annual conference on Computer graphics and interactive techniques*. 121–128.

[63] Tetsuya Takahashi, Junbang Liang, Yi-Ling Qiao, and Ming C Lin. 2021. Differentiable fluids with solid coupling for learning and control. In *Proceedings of the AAAI conference on artificial intelligence*, Vol. 35. 6138–6146.

[64] Jingwei Tang, Vinicius C. Azevedo, Guillaume Cordonnier, and Barbara Solenthaler. 2021. Honey, I Shrunk the Domain: Frequency-aware Force Field Reduction for Efficient Fluids Optimization. In *Computer Graphics Forum*, Vol. 40. Wiley Online Library, 339–353.

[65] Roger Temam. 2024. *Navier–Stokes equations: theory and numerical analysis*. Vol. 343. American Mathematical Society.

[66] Alexander Tong, Kilian Fatras, Nikolay Malkin, Guillaume Huguet, Yanlei Zhang, Jarrid Rector-Brooks, Guy Wolf, and Yoshua Bengio. 2023. Improving and generalizing flow-based generative models with minibatch optimal transport. *arXiv preprint arXiv:2302.00482* (2023).

[67] Adrien Treuille, Antoine McNamara, Zoran Popović, and Jos Stam. 2003. Keyframe control of smoke simulations. In *ACM SIGGRAPH 2003 Papers*. 716–723.

[68] Kiwon Um, Robert Brand, Yun Raymond Fei, Philipp Holl, and Nils Thuerey. 2020. Solver-in-the-loop: Learning from differentiable physics to interact with iterative pde-solvers. *Advances in Neural Information Processing Systems* 33 (2020), 6111–6122.

[69] Sinan Wang, Jinjin He, Shenyifan Lu, Ruicheng Wang, Greg Turk, and Bo Zhu. 2026. Generative Modeling with Orbit-Space Particle Flow Matching. *ACM Transactions on Graphics (TOG)* 45, 4 (2026), 1–27.

[70] Long Wei, Peiyan Hu, Ruiqi Feng, Haodong Feng, Yixuan Du, Tao Zhang, Rui Wang, Yue Wang, Zhi-Ming Ma, and Tailin Wu. 2024. Diffphycon: a generative approach to control complex physical systems. *Advances in Neural Information Processing Systems* 37 (2024), 4090–4147.

[71] Yongning Zhu and Robert Bridson. 2005. Animating sand as a fluid. *ACM Transactions on Graphics (TOG)* 24, 3 (2005), 965–972.

**原文插图：** 原 PDF 中的图 1–16 未重传至本页，仅保留中文图注与图例说明；全部原图与补充视频可通过页首的原文 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.13729v1（ACM 期刊格式，17 页）的全文中文译稿，覆盖摘要、正文第 1–6 节（含 3.1–3.3、4.1–4.4、5.1–5.6、5.5.1–5.5.2 等全部小节）、结论以及“局限”“未来工作”、全部图注与表注（图 1–16、表 1–9，表格数据逐格转录）、算法 1 以及 71 条参考文献英文原条目；公式 (1)–(22) 按原文编号以 `$$` 展示式录入。原文无附录、无 CCS Concepts 段；作者联系信息与关键词已在页首录入。**逐句终校未做**：表 1–9 的数值已用 PDF 文本层按坐标逐格抽取并与页面渲染核对（含表 2 误差的正负号、表 6 每格两侧的括号一致性数值、表 7–8 的 $10^{-6}$/$10^{-7}$ 量级后缀），但尚未完成逐句逐式的独立复核。页内未发现需要加注的原文内部矛盾；若后续核对发现，将按“只加注、不改数”的规则补充。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
