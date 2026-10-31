---
layout: page
title: "LyapuFlow：用 Lyapunov 反馈控制生成流求解逆问题｜中文全文译文"
permalink: /papers/translations/2026-10-08-2610-04326-lyapuflow-controlling-generative-flows-with-lyapunov-feedback-for-inve/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8af7f5b90a118edb/) · [原文 arXiv](https://arxiv.org/abs/2610.04326) · [全部目录](/papers/catalog/)

# LyapuFlow：用 Lyapunov 反馈控制生成流求解逆问题

**原题：** LyapuFlow: Controlling Generative Flows with Lyapunov Feedback for Inverse Problems  
**作者：** Minseon Gwak、Hans Hao-Hsun Hsu、Danielle C. Maddix、N. Benjamin Erichson（论文署名单位：1 劳伦斯伯克利国家实验室；2 佐治亚理工学院；3 西门子；4 国际计算机科学研究所。通讯作者：Minseon Gwak，mgwak@lbl.gov；N. Benjamin Erichson，erichson@lbl.gov。Danielle C. Maddix 的工作完成于其在 AWS 任职期间。）  
**版本：** arXiv:2610.04326v1（cs.LG），2026 年 10 月 3 日提交，原文 40 页（正文与参考文献至第 13 页，附录 A–C 至第 40 页）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节（含全部小节）、结论与局限、致谢、附录 A–C、全部图注与表注、公式 (1)–(68)、算法 1–2、表 1–12、图 1–23 的说明，以及 44 条参考文献英文原条目，均按原文结构录入；逐句逐式终校未做。

## 摘要

预训练的流模型如今被广泛用作科学与视觉任务中的生成先验，并借助推理时引导在不重新训练的前提下施加测试时约束。现有方法或采用投影、后验采样，或对生成轨迹做迭代优化。我们提出 LyapuFlow，一种基于 Lyapunov 反馈控制的替代方案。在每个采样步，LyapuFlow 预测当前流正在趋向的终端样本，并在该预测上评估约束违反程度；随后计算满足既定 Lyapunov 下降条件的最小范数控制。当无控动力学已按规定速率降低约束违反时，所得控制保持不激活；否则，它在一个与流相对的反馈信赖域内给出修正更新，避免控制压倒预训练动力学。我们在数据空间与潜空间中演示 LyapuFlow，在科学机器学习与图像逆问题中优于多种测试时约束施加机制。

## 1. 引言

流匹配（flow matching）已成为对复杂数据分布建模的一种灵活框架 [Lipman et al., 2023]。在许多下游应用中，生成样本的质量关键在于其是否满足任务特定约束。例如在科学领域，偏微分方程（PDE）的生成解需要与硬性物理要求一致，包括初始条件与守恒律；在图像逆问题中，生成样本必须复现经前向算子退化后的观测。条件生成模型可以纳入训练阶段可获得的约束 [Tong et al., 2024, Keegan and Ruthotto, 2026]，但推理阶段才给定的约束促使人们研究**测试时约束生成**：引导预训练模型的采样轨迹以满足指定约束。

现有测试时约束生成方法通过迭代优化或在线引导修改采样轨迹 [Daras et al., 2024]。迭代轨迹优化反复积分生成动力学以评估结果并修正轨迹 [Ben-Hamu et al., 2024, Liu et al., 2023, Wang et al., 2024]；在线引导则在单次采样 rollout 过程中施加即时修正。具体而言，基于投影的方法把中间状态或预测终点映射到约束定义的可行集 [Christopher et al., 2024, Cheng et al., 2025, Utkarsh et al., 2025]。这类投影能强有力地保证可行性，但可能过度优先满足约束而牺牲样本保真度。后验引导方法使轨迹偏向那些满足约束的后验概率更高的样本 [Chung et al., 2023, Patel et al., 2025, Kim et al., 2025]，通常依赖任务与模型相关的引导强度。机器人领域针对生成式策略的控制论方法 [Yang et al., 2025, Huang et al., 2025] 直接由演化状态上的约束构造反馈，而基于显式终端预测的反馈仍未被探索。

为此，我们提出一种替代引导方式：对预测终端样本的约束满足情况施加 Lyapunov 反馈控制 [Khalil and Grizzle, 2002]。给定将 $\mathbf x_0\sim p_0$ 传输到 $\mathbf x_1\sim p_1$ 的预训练流 $\mathbf v_\theta(\mathbf x_t,t)$，我们为其动力学加入推理时控制 $\mathbf u(\mathbf x_t,t)$：

$$
\dot{\mathbf x}_t=\mathbf v_\theta(\mathbf x_t,t)+\mathbf u(\mathbf x_t,t),
\qquad\text{满足测试时约束 } h(\mathbf x_1)=\mathbf 0, \tag{1}
$$

其中 $p_0$ 与 $p_1$ 分别表示基分布与目标分布。难点在于控制作用于中间状态 $\mathbf x_t$，而约束定义在终端样本 $\mathbf x_1$ 上。LyapuFlow 通过预测当前流正在趋向的终端样本并在该预测上评估约束来解决这一困难：所得约束能量定义了一个终端感知的 Lyapunov 函数。每个积分步，LyapuFlow 由既定 Lyapunov 下降条件求出闭式的最小范数反馈。当预训练流已满足该条件时反馈消失，样本可沿原始生成轨迹演化；否则，它在一个与流相对的反馈信赖域内给出修正更新，防止干预过度，且无需迭代优化。主要贡献如下：

- 提出 **LyapuFlow**，一个面向预训练流模型的测试时反馈控制器：由每个中间状态预测终端样本，并由既定 Lyapunov 下降条件计算闭式最小范数反馈（见第 3 节）。
- 刻画连续时间反馈在有限步积分下的行为，并引入反馈信赖域以限制过大的修正（见第 3.1 节）；进一步把 LyapuFlow 扩展到潜空间模型，将约束梯度经解码器传播，并可选择性恢复速度–雅可比贡献以进行更细尺度的精修（见第 3.2 节）。
- 在数据空间的物理约束生成（见第 4.1 节）与潜空间的图像逆问题（见第 4.2 节）上评估 LyapuFlow。两种设定下，LyapuFlow 在保持有竞争力的约束满足的同时提升样本保真度。

## 2. 背景与相关工作

本节回顾施加一般等式约束 $h(\mathbf x)=\mathbf 0$ 的既有方法。如图 1 所示，$h$ 的含义随领域而变化，从 PDE 的物理约束到图像逆问题中的测量一致性约束。下面按机制考察各类方法在“把生成轨迹导向这些约束”上的差异。

**图 1：** 科学与图像逆问题中的测试时约束示意。(a) 物理约束引导 PDE 解的生成：从初始状态 $\mathbf x_0$ 经中间状态 $\mathbf x_t$ 演化到满足 $h(\mathbf x)=\mathbf 0$ 的生成解 $\mathbf x_1^*$；(b) 测量引导的图像超分辨率与高斯／运动去模糊，目标是从退化观测恢复与测量一致的高质量图像。图中以“✔ 测量一致性”和“✔ 用物理约束引导生成过程”概括两类任务，并以箭头标出从 $t=0$ 到 $t=1$ 的采样轨迹（初始状态、中间状态、生成解）。

### 2.1 基于投影的约束施加

投影方法显式地把生成样本校正到约束集 [Hansen et al., 2023, Christopher et al., 2024]。对可微残差 $h:\mathbb R^d\to\mathbb R^m$，考虑约束的局部线性化 $h(\mathbf x)+\mathbf J_h(\mathbf x)\Delta\mathbf x=\mathbf 0$，其中 $\mathbf J_h=\partial h/\partial\mathbf x$。假定 $\mathbf J_h$ 行满秩（通常 $d>m$），最小范数修正为

$$
\mathbf x^+=\mathbf x-\mathbf J_h(\mathbf x)^\top
\left(\mathbf J_h(\mathbf x)\mathbf J_h(\mathbf x)^\top\right)^{-1}h(\mathbf x). \tag{2}
$$

ECI 采样用一个问题特定的校正算子对经外推的终点施加约束校正，再把校正后的终点与 $\mathbf x_0$ 插值作为下一个采样步 [Cheng et al., 2025]。PCFM 借助基于雅可比的高斯–牛顿更新，把基于投影的校正扩展到可微非线性等式约束 [Utkarsh et al., 2026, 2025]。对非线性约束，式 (2) 需要在每次投影时求解 $m\times m$ 线性系统，严重限制其可扩展性。

### 2.2 后验与梯度引导

另一类方法利用似然或任务目标梯度引导生成。对观测 $\mathbf y\in\mathbb R^m$，后验采样目标为

$$
p(\mathbf x_1\mid\mathbf y)\propto p_1(\mathbf x_1)\,p(\mathbf y\mid\mathbf x_1), \tag{3}
$$

其中 $p_1$ 表示预训练生成分布，$p(\mathbf y\mid\mathbf x_1)$ 表示测量似然。DPS 通过估计测量似然梯度来引导反向扩散过程，从而近似从式 (3) 采样 [Chung et al., 2023]。FlowChef 对整流流模型施加高效的任务目标引导，同时避免通过速度模型反向传播 [Patel et al., 2025]。FlowDPS 用估计干净状态处的测量似然梯度，把后验引导扩展到流模型，同样绕过速度模型的雅可比 [Kim et al., 2025]。ProFlow 类似地精修终端估计，以改善 PDE 问题的物理一致性 [Yu et al., 2026]。这些方法在不显式投影到约束集的情况下引导轨迹，但合适的引导强度在不同任务间差异很大。

### 2.3 控制与轨迹优化

控制理论提供了修改预训练生成动力学的另一条途径。FlowGrad 与 OC-Flow 迭代精修完整的控制输入序列以改善终端目标 [Liu et al., 2023, Wang et al., 2024]。OC-Flow 把该精修表述为最优控制问题，并用 Pontryagin 极大值原理求解 [Pontryagin, 1987]，在终端损失与控制代价之间权衡：

$$
\mathbf u^*_{[0,1]}\in\arg\min_{\mathbf u_{[0,1]}}
\mathcal L(\mathbf x_1)+\lambda\int_0^1\|\mathbf u_t\|^2\,dt, \tag{4}
$$

其中 $\lambda>0$ 为控制代价权重。SAD-Flower 与 UniConFlow 基于机器人规划中的 Lyapunov 条件与障碍（barrier）条件，通过二次规划计算瞬时 $\mathbf u_t$ [Huang et al., 2025, Yang et al., 2025]。这些条件在部分去噪样本上度量约束违反，而如何保持对生成先验的保真度仍是挑战。

## 3. LyapuFlow：面向约束生成的 Lyapunov 反馈

本节针对式 (1) 引入的可控生成动力学构建 LyapuFlow。给定预训练速度场 $\mathbf v_\theta$ 与终端约束 $h(\mathbf x_1)=\mathbf 0$，目标是构造推理时反馈控制 $\mathbf u(\mathbf x_t,t)$，既降低终端约束违反，又避免对生成动力学的过大修正。主要困难在于控制作用在中间状态 $\mathbf x_t$，而约束只定义在终端样本 $\mathbf x_1$ 上。图 2 给出 LyapuFlow 采样的总览，说明终端约束如何传播到中间状态，以及反馈如何始终与预训练生成动力学绑定。

为得到可驱动局部反馈的量，我们用剩余积分区间上的一阶外推来预测终端样本：

$$
\hat{\mathbf x}_{1|t}=\mathbf x_t+(1-t)\,\mathbf v_\theta(\mathbf x_t,t). \tag{5}
$$

为量化终端约束的违反程度，采用二次残差损失 $\mathcal L(\mathbf x)=\tfrac12\|h(\mathbf x)\|_2^2$，它非负且在约束满足时为零。在预测终端样本处评估该损失，定义

$$
V(\mathbf x_t,t)=\mathcal L\left(\hat{\mathbf x}_{1|t}\right)
=\frac12\left\|h\left(\hat{\mathbf x}_{1|t}\right)\right\|_2^2. \tag{6}
$$

因此 $V$ 可解释为预测终端样本的约束能量：它在每个中间状态给出一个终端感知的量，而 $\hat{\mathbf x}_{1|t}=\mathbf x_1$ 保证生成结束时 $V(\mathbf x_1,1)=\mathcal L(\mathbf x_1)$。我们以 $V$ 作为 Lyapunov 函数来确定反馈控制。沿受控动力学 $\dot{\mathbf x}_t=\mathbf v_\theta(\mathbf x_t,t)+\mathbf u_t$，其全导数为

$$
\dot V=\partial_tV+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)
+\nabla_{\mathbf x_t}V^\top\mathbf u_t. \tag{7}
$$

选择控制使预测终端约束违反按如下方式下降：

$$
\dot V\le-\alpha V,\qquad\alpha\ge 0, \tag{8}
$$

其中 $\alpha$ 指定期望的下降速率。把受控动力学代入式 (8)，得到对瞬时控制的线性约束

$$
\nabla_{\mathbf x_t}V^\top\mathbf u_t\le-\partial_tV
-\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)-\alpha V. \tag{9}
$$

沿用 Freeman and Kokotovic [2008] 中经典的逐点最小范数构造，选取满足该条件的最小瞬时修正：

$$
\min_{\mathbf u_t}\ \frac12\|\mathbf u_t\|_2^2
\quad\text{s.t.}\quad
\nabla_{\mathbf x_t}V^\top\mathbf u_t+\partial_tV
+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)+\alpha V\le 0. \tag{10}
$$

式 (10) 的约束在控制空间中定义了一个半空间，其最小范数解为（推导见附录 A.1）

$$
\mathbf u_t^\star=-\eta_t\nabla_{\mathbf x_t}V,\qquad
\eta_t=\frac{\left[\partial_tV+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)+\alpha V\right]_+}
{\|\nabla_{\mathbf x_t}V\|_2^2}. \tag{11}
$$

标量 $\eta_t$ 是由生成流当前状态决定的自适应反馈增益。当 $[\cdot]_+$ 内的项非正时，预训练流已按要求的速率降低 $V$，此时 $\eta_t=0$；否则，$\eta_t$ 是沿 $-\nabla_{\mathbf x_t}V$ 方向满足 Lyapunov 下降条件的最小增益。与固定尺度的梯度引导不同，修正强度因此自适应于名义流、当前约束违反量与 $V$ 的局部梯度。

**流感知反馈（flow-aware feedback）.** 梯度 $\nabla_{\mathbf x_t}V$ 同时依赖终端约束与预训练流的局部敏感度。对式 (6) 经终端预测求导，得

$$
\nabla_{\mathbf x_t}V=\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L
+(1-t)\,\boldsymbol J_v(\mathbf x_t,t)^\top\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L, \tag{12}
$$

其中 $\boldsymbol J_v(\mathbf x_t,t)=\partial\mathbf v_\theta(\mathbf x_t,t)/\partial\mathbf x_t$。右端第一项刻画扰动当前状态对终端预测的直接影响；第二项刻画经预训练速度场状态依赖的间接影响。因子 $(1-t)$ 使 $\boldsymbol J_v$ 在接近终端时刻的影响减弱，此时 $\nabla_{\mathbf x_t}V$ 趋近于 $\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L$。

计算第一项只需终端预测处的约束损失梯度；第二项还需要对预训练速度模型求导，增加反馈开销。我们只需用反向模式自动微分 [Baydin et al., 2018] 计算向量–雅可比积 $\boldsymbol J_v^\top\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L$。在潜空间扩展中，为进一步提高效率，还会考虑省去该雅可比相关项，见第 3.2 节；效率分析见附录 B.4 与 C.4。

控制器还依赖显式时间导数 $\partial_tV$。对终端预测关于 $t$ 求导并与式 (12) 结合，得

$$
\partial_tV+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta
=(1-t)\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L^\top
\left[\partial_t\mathbf v_\theta+\boldsymbol J_v\mathbf v_\theta\right]. \tag{13}
$$

方括号内是预训练速度沿其自身轨迹的变化率。$\dot V$ 的无控部分度量了预测终端约束因学到的速度场沿流变化而发生的变化。

### 3.1 离散化与反馈信赖域

式 (11) 由连续时间 Lyapunov 下降条件导出。采样器在离散时间网格 $\{t_k\}_{k=0}^K$ 上施加该反馈，其中 $K$ 表示函数评估次数（NFE）。记第 $k$ 个积分步的状态为 $\mathbf x_k$，并记 $V_k:=V(\mathbf x_k,t_k)$。在欧拉积分下，由 $\mathbf u_k^\star=-\eta_k\nabla_{\mathbf x_k}V_k$ 控制的动力学为

$$
\mathbf x_{k+1}=\mathbf x_k+\Delta t_k\,\mathbf v_\theta(\mathbf x_k,t_k)
-\Delta t_k\,\eta_k\nabla_{\mathbf x_k}V_k. \tag{14}
$$

经此离散化后，为满足式 (8) 瞬时条件而选取的反馈幅值对有限步更新可能过大，使样本越过局部下降性被评估的区域 [Taylor et al., 2021]。这类大修正对生成流同样不利，因为偏离学习到的传输路径会降低样本保真度 [Saini et al., 2026]。我们因此引入反馈信赖域，并刻画由此产生的权衡。

记第 $k$ 个积分步实际施加的控制为 $\tilde{\mathbf u}_k$。用下式量化其对连续时间 Lyapunov 条件的违反：

$$
\xi_k=\left[\partial_tV_k+\nabla_{\mathbf x_k}V_k^\top
(\mathbf v_k+\tilde{\mathbf u}_k)+\alpha V_k\right]_+. \tag{15}
$$

若施加的反馈正是式 (11) 的闭式控制 $\tilde{\mathbf u}_k=\mathbf u_k^\star$，则 Lyapunov 条件满足且 $\xi_k=0$。当反馈被有界化时，$\tilde{\mathbf u}_k$ 可能偏离 $\mathbf u_k^\star$，$\xi_k$ 度量由此损失的既定 Lyapunov 下降量。

**命题 1（离散时间 Lyapunov 界）.** 设 $V(\mathbf x,t)$ 关于 $(\mathbf x,t)$ 具有 $L_V$-Lipschitz 梯度。在步长为 $\Delta t_k$、施加反馈 $\tilde{\mathbf u}_k$ 的欧拉步下，

$$
V_{k+1}-V_k\le-\alpha\Delta t_kV_k+\Delta t_k\xi_k
+\frac{L_V}{2}\Delta t_k^2\left(1+\|\mathbf v_k+\tilde{\mathbf u}_k\|_2^2\right). \tag{16}
$$

右端第二项度量反馈被有界化时 Lyapunov 下降的损失；末项是离散化误差，它随受控速度的幅值增大而增大，因此限制控制幅值可以抑制该贡献。于是命题 1 揭示了“保持期望的 Lyapunov 下降”与“限制离散化误差”之间的权衡，可通过选取合适的反馈界来平衡。

为此，我们定义**反馈信赖域**来限制反馈位移，即 $\|\Delta t_k\tilde{\mathbf u}_k\|_2\le\Delta t_k\bar u_k$。逐步显式优化 $\bar u_k$ 会带来额外计算，因此改用基于流幅值的简单自适应规则

$$
\bar u_k=c_{\rm tr}\|\mathbf v_k\|_2, \tag{17}
$$

其中 $c_{\rm tr}>0$ 为常数。第 $k$ 步实际施加的控制为

$$
\tilde{\mathbf u}_k=\frac{\bar u_k}{\max\left(\bar u_k,\|\mathbf u_k^\star\|_2\right)}\,\mathbf u_k^\star. \tag{18}
$$

算法 1 总结了我们的采样器；证明与进一步分析见附录 A.2。

**算法 1　LyapuFlow（数据空间）**

输入：$\mathbf v_\theta$、衰减率 $\alpha$、信赖域因子 $c_{\rm tr}$

1. $\mathbf x_0\sim p_0$
2. **for** $k=0,\dots,K-1$ **do**
3. 　$\mathbf v_k\leftarrow\mathbf v_\theta(\mathbf x_k,t_k)$
4. 　$\hat{\mathbf x}_{1|k}\leftarrow\mathbf x_k+(1-t_k)\mathbf v_k$
5. 　$V_k\leftarrow\mathcal L(\hat{\mathbf x}_{1|k})$
6. 　$\mathbf g_k\leftarrow\nabla_{\mathbf x_k}V_k$，$q_k\leftarrow\partial_tV(\mathbf x_k,t_k)$
7. 　$\mathbf u_k^\star\leftarrow-\dfrac{[q_k+\mathbf g_k^\top\mathbf v_k+\alpha V_k]_+}{\|\mathbf g_k\|_2^2}\,\mathbf g_k$
8. 　$\tilde{\mathbf u}_k\leftarrow\min\left(1,\dfrac{c_{\rm tr}\|\mathbf v_k\|_2}{\|\mathbf u_k^\star\|_2}\right)\mathbf u_k^\star$
9. 　$\mathbf x_{k+1}\leftarrow\mathbf x_k+\Delta t_k(\mathbf v_k+\tilde{\mathbf u}_k)$
10. **end for**
11. **return** $\mathbf x_K$

**图 2：** LyapuFlow 示意。每个积分步中，LyapuFlow 评估预训练速度、预测终端样本、由 Lyapunov 下降条件计算最小范数反馈、用信赖域对反馈作界，然后推进受控流。(a) 当预训练动力学已满足 Lyapunov 下降条件时，不施加任何反馈（不激活控制）；(b) 否则，LyapuFlow 施加有界控制（激活控制），图中阴影圆盘表示信赖域，箭头分别表示无控流、终端预测、原始控制、有界控制与受控流。

### 3.2 潜空间模型的实用扩展

上述表述在流与约束定义于同一数据空间时直接适用。在已有成熟潜表示的领域，生成模型常在潜空间工作，而约束仍位于数据空间 [Rombach et al., 2022, Rout et al., 2023]。设 $\mathbf z_t$ 为潜状态、$D$ 为解码器。终端预测沿如下计算路径得到：

$$
\mathbf z_t\ \xrightarrow{\ \mathbf v_\theta\ }\
\hat{\mathbf z}_{1|t}=\mathbf z_t+(1-t)\mathbf v_\theta(\mathbf z_t,t)
\ \xrightarrow{\ D\ }\ \hat{\mathbf x}_{1|t}=D(\hat{\mathbf z}_{1|t}), \tag{19}
$$

并用解码后的终端预测定义 Lyapunov 函数 $V(\mathbf z_t,t)=\mathcal L(D(\hat{\mathbf z}_{1|t}))$。于是关于潜状态的约束梯度为

$$
\nabla_{\mathbf z_t}V=\boldsymbol J_D^\top\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L
+(1-t)\,\boldsymbol J_v^\top\boldsymbol J_D^\top\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L, \tag{20}
$$

其中 $\boldsymbol J_D=\partial D(\hat{\mathbf z}_{1|t})/\partial\hat{\mathbf z}_{1|t}$，$\boldsymbol J_v=\partial\mathbf v_\theta(\mathbf z_t,t)/\partial\mathbf z_t$。这是式 (12) 的潜空间对应形式：第一项只经解码器传播约束梯度，第二项则考虑当前潜状态扰动如何经速度场改变预测终点。在现代潜生成模型中，速度网络往往比解码器更大 [Chen et al., 2024, Fang et al., 2024]。因此我们考虑在速度预测处停止梯度，$\bar{\mathbf v}_t=\mathrm{stopgrad}(\mathbf v_\theta(\mathbf z_t,t))$，并使用由此得到的代理梯度

$$
\tilde{\mathbf g}_t=\boldsymbol J_D^\top\nabla_{\hat{\mathbf x}_{1|t}}\mathcal L. \tag{21}
$$

stopgrad 操作去除了速度预测对潜状态与时间的依赖，从而把无界反馈的有效形式简化为

$$
\mathbf u_t^\star=-\frac{\alpha V}{\|\tilde{\mathbf g}_t\|_2^2}\,\tilde{\mathbf g}_t. \tag{22}
$$

这些代理导数未必等于 $V$ 的真实导数，因此该潜空间近似一般不能保证真实 Lyapunov 函数下降。在多数潜空间实验中，该近似在整个采样过程中提供了足够的约束引导。对需要高频修正的设定，恢复 $\boldsymbol J_v$ 贡献可能有益 [Lai et al., 2026]。经验上，解码器传播的梯度主要修正低频成分，而式 (20) 中的流感知项改善高频结构。然而从一开始就纳入速度–雅可比项可能过度强调高频修正，导致过于激进的精修。因此我们引入**梯度切换步** $k_{\rm sg}$：早期步省去速度–雅可比贡献，后期步启用完整梯度：

$$
\bar{\mathbf v}_k=
\begin{cases}
\mathrm{stopgrad}\left(\mathbf v_\theta(\mathbf z_k,t_k)\right), & k<k_{\rm sg},\\[2pt]
\mathbf v_\theta(\mathbf z_k,t_k), & k\ge k_{\rm sg}.
\end{cases} \tag{23}
$$

算法 2 总结了潜空间中的 LyapuFlow 采样过程。

**算法 2　LyapuFlow（潜空间）**

输入：$\mathbf v_\theta$、$\alpha$、$c_{\rm tr}$、解码器 $D$、梯度切换步 $k_{\rm sg}$

1. $\mathbf z_0\sim p_0$
2. **for** $k=0,\dots,K-1$ **do**
3. 　$\bar{\mathbf v}_k\leftarrow\mathrm{stopgrad}\left(\mathbf v_\theta(\mathbf z_k,t_k)\right)$（当 $k<k_{\rm sg}$），否则 $\bar{\mathbf v}_k\leftarrow\mathbf v_\theta(\mathbf z_k,t_k)$
4. 　$\hat{\mathbf z}_{1|k}\leftarrow\mathbf z_k+(1-t_k)\bar{\mathbf v}_k$
5. 　$V_k\leftarrow\mathcal L\left(D(\hat{\mathbf z}_{1|k})\right)$
6. 　$\mathbf g_k\leftarrow\nabla_{\mathbf z_k}V_k$，$q_k\leftarrow\partial_tV(\mathbf z_k,t_k)$
7. 　$\mathbf u_k^\star\leftarrow-\dfrac{[q_k+\mathbf g_k^\top\bar{\mathbf v}_k+\alpha V_k]_+}{\|\mathbf g_k\|_2^2}\,\mathbf g_k$
8. 　$\tilde{\mathbf u}_k\leftarrow\min\left(1,\dfrac{c_{\rm tr}\|\bar{\mathbf v}_k\|_2}{\|\mathbf u_k^\star\|_2}\right)\mathbf u_k^\star$
9. 　$\mathbf z_{k+1}\leftarrow\mathbf z_k+\Delta t_k(\bar{\mathbf v}_k+\tilde{\mathbf u}_k)$
10. **end for**
11. **return** $D(\mathbf z_K)$

## 4. 实验结果

我们评估 LyapuFlow 在两类差异较大的应用中的表现：数据空间的物理约束 PDE 解生成，以及潜空间的图像逆问题。作为对比，考虑若干代表性的测试时约束生成基线，包括 DPS [Chung et al., 2023]、SAD-Flower [Huang et al., 2025]、FlowDPS [Kim et al., 2025]、ProFlow [Yu et al., 2026]、PCFM [Utkarsh et al., 2025] 与 OC-Flow [Wang et al., 2024]；其中 DPS 指其基于流的变体，即对速度模型求导的版本。我们还与面向潜空间的高效低迭代基线 FlowChef [Patel et al., 2025] 和 FlowDPS [Kim et al., 2025] 比较（效率分析见附录 C.4）。PDE 实验细节见附录 B，图像实验细节（数据集、预训练模型、约束定义、评价指标、基线配置与超参数）见附录 C。

> **原文疑点：** 原文此处为 “We evaluate whether LyapuFlow across two diverse applications”，句子成分残缺（似漏 “generalizes” 之类动词），本译按语义译为“评估 LyapuFlow 在两类应用中的表现”，不作推测性补写。

### 4.1 物理约束生成

首先考虑 PDE 解生成：引导预训练流满足训练时未显式施加的硬物理要求。在此设定下，学习数据分布下的高似然本身并不保证物理有效性。沿用 ECI [Cheng et al., 2025] 与 PCFM [Utkarsh et al., 2025]，我们在四个 PDE 基准上测试：1D 热方程（Heat）、1D Burgers、1D 反应–扩散（RD）与 2D Navier–Stokes（NS）。这些基准覆盖从光滑扩散动力学到含尖锐间断的演化。所评估约束包括初始条件（IC）、线性守恒律（CL）、非线性守恒律（NCL），以及基于 Godunov 更新的非线性动力学（ND）。性能从约束误差（CE）与所得条件解分布的保真度两方面评估（指标见附录 B.3）。

表 1 显示，LyapuFlow 在全部四个任务上取得最优 MMSE/CMMSE，并在三个任务上取得最优 SMSE/CSMSE 与 FPD。LyapuFlow 在全部任务上达到零或近零 CE，包括在三次最终投影之后的 Burgers；而基线在相同投影预算下仍存在不可忽略的约束误差。主要差异体现在样本保真度：LyapuFlow 更准确地恢复与指定物理条件相关的分布。图 3 以 Burgers 为例说明这一行为：在基线中，只有 LyapuFlow 与 DPS 恢复了非线性动力学诱导的局部激波结构。与 DPS 的详细比较见第 4.3 节。

**表 1：** 物理约束生成的定量评估。粗体为最优，下划线为次优（原文标记；本页 Markdown 表格以纯数值照录，不保留强调格式）。所有方法施加相同次数的最终投影（Burgers：3 次；其他任务：1 次）。

| 数据集 | 指标↓ | LyapuFlow | DPS | SAD-Flower | FlowDPS | ProFlow | PCFM | OC-Flow | FFM + 投影 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1D Heat | MMSE/$10^{-2}$ | 0.012 | 0.221 | 3.463 | 2.127 | 0.485 | 0.115 | 0.134 | 5.206 |
| 1D Heat | SMSE/$10^{-2}$ | 0.004 | 0.002 | 1.835 | 1.234 | 0.335 | 0.700 | 0.339 | 2.809 |
| 1D Heat | FPD | 0.006 | 0.093 | 1.064 | 0.826 | 0.377 | 0.639 | 0.353 | 1.481 |
| 1D Heat | CE(IC)/$10^{-2}$ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1D Heat | CE(CL)/$10^{-2}$ | 0 | 0 | 0.003 | 0.001 | 0.002 | 0 | 0.001 | 0.001 |
| 1D Burgers | CMMSE/$10^{-2}$ | 0.163 | 0.254 | 6.874 | 7.578 | 9.326 | 4.303 | 4.172 | 8.266 |
| 1D Burgers | CSMSE/$10^{-2}$ | 0.212 | 0.377 | 5.708 | 6.234 | 6.896 | 2.171 | 6.150 | 6.715 |
| 1D Burgers | FPD | 0.204 | 0.649 | 3.967 | 2.911 | 3.307 | 7.072 | 1.020 | 1.414 |
| 1D Burgers | CE(IC)/$10^{-2}$ | 0 | 0 | 0.002 | 0.003 | 0.003 | 0 | 0.002 | 0.003 |
| 1D Burgers | CE(ND)/$10^{-2}$ | 0.010 | 0.015 | 10 | 18 | 27 | 0 | 13 | 20 |
| 1D Burgers | CE(CL)/$10^{-2}$ | 0.005 | 0.007 | 21 | 116 | 152 | 0 | 82 | 124 |
| 1D RD | CMMSE/$10^{-2}$ | 0.019 | 0.090 | 3.379 | 2.070 | 1.086 | 0.386 | 0.083 | 3.931 |
| 1D RD | CSMSE/$10^{-2}$ | 0.028 | 0.053 | 1.903 | 1.138 | 0.819 | 1.225 | 0.194 | 2.196 |
| 1D RD | FPD | 0.002 | 0.008 | 12 | 24 | 4.613 | 3.712 | 1.928 | 7.808 |
| 1D RD | CE(IC)/$10^{-2}$ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1D RD | CE(NCL)/$10^{-2}$ | 0 | 0 | 0 | 0.002 | 0.001 | 0 | 0 | 0.008 |
| 2D NS | CMMSE/$10^{-2}$ | 5.457 | 5.871 | 23 | 22 | 22 | 23 | 13 | 23 |
| 2D NS | CSMSE/$10^{-2}$ | 2.480 | 2.834 | 6.193 | 6.131 | 6.227 | 13 | 5.876 | 6.270 |
| 2D NS | FPD | 0.568 | 0.763 | 0.663 | 0.638 | 0.366 | 0.314 | 0.263 | 0.653 |
| 2D NS | CE(IC)/$10^{-2}$ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2D NS | CE(CL)/$10^{-2}$ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**图 3：** 固定初始条件组内 1D Burgers 的平均解（上行）与相对真值的逐点绝对误差（下行）；约束包括 IC、前五个时间步上的 ND 约束以及 CL 约束。图中每一列对应一种采样器（真值、LyapuFlow、DPS、SAD-Flower、FlowDPS、ProFlow、PCFM、OC-Flow、FFM + 投影），横轴为时间、纵轴为空间，右侧两条色标自下而上分别对应场值（0–1）与绝对误差（0–0.75）。其他 PDE 数据集的结果见附录 B.7。

### 4.2 图像逆问题

接着考虑带测量一致性约束的图像逆问题。给定退化算子 $\mathbf A$ 与含噪观测 $\mathbf y$，定义 $h(\mathbf x)=\mathbf A(\mathbf x)-\mathbf y$，于是 $h(\mathbf x)=\mathbf 0$ 即对应测量一致性。我们在 AFHQ、FFHQ 与 DIV2K 数据集上，用预训练潜流模型 Stable Diffusion 3.5-Medium [Esser et al., 2024] 测试 $\times4$ 超分辨率、高斯去模糊与运动去模糊。该设定检验 LyapuFlow 能否在施加数据一致性的同时保留底层图像中实例特有的结构。

表 2 在匹配的 28-NFE 预算下比较三种逆问题的重建质量。LyapuFlow 在各项指标上取得最优或次优性能，包括 SSIM 与 LPIPS 全面最优。这一结果仅靠每个流步一次反馈更新实现，没有迭代内层优化。图 4 定性展示了同样的趋势：在超分辨率中，FlowDPS 在蝴蝶图像上引入目标图像中不存在的天线状结构；在运动去模糊中，它产生更模糊的重建并抹掉猫嘴周围有辨识度的纹理。这些例子表明，测量引导可以生成看似合理、却丢失实例特有细节的重建；LyapuFlow 在保持测量一致性的同时更好地保留了这些结构。补充结果见附录 C.5。

**表 2：** 图像逆问题的定量评估。所有实验使用 Stable Diffusion 3.5-Medium、28 NFE。粗体为最优，下划线为次优（原文标记；本页以纯数值照录）。

**AFHQ 1k（$768\times768$）**

| 方法 | 超分 ×4（双三次）PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 运动去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FlowChef | 29.43 | 0.798 | 27.30 | 0.095 | 25.22 | 0.717 | 40.81 | 0.274 | 26.33 | 0.739 | 40.83 | 0.230 |
| FlowDPS | 28.24 | 0.746 | 16.05 | 0.122 | 25.41 | 0.680 | 26.87 | 0.244 | 25.95 | 0.693 | 22.78 | 0.212 |
| LyapuFlow（本文） | 30.05 | 0.829 | 9.68 | 0.045 | 26.88 | 0.723 | 20.21 | 0.172 | 27.03 | 0.740 | 20.47 | 0.166 |

**FFHQ 1k（$768\times768$）**

| 方法 | 超分 ×4（双三次）PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 运动去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FlowChef | 30.02 | 0.831 | 67.74 | 0.074 | 25.67 | 0.763 | 108.32 | 0.232 | 26.97 | 0.783 | 94.39 | 0.193 |
| FlowDPS | 28.99 | 0.756 | 27.36 | 0.098 | 26.03 | 0.716 | 46.25 | 0.210 | 26.74 | 0.723 | 38.52 | 0.177 |
| LyapuFlow（本文） | 29.97 | 0.836 | 27.91 | 0.046 | 27.56 | 0.761 | 41.83 | 0.144 | 27.81 | 0.778 | 40.92 | 0.138 |

**DIV2K 0.8k（$768\times768$）**

| 方法 | 超分 ×4（双三次）PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 运动去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FlowChef | 24.47 | 0.671 | 51.53 | 0.111 | 20.72 | 0.533 | 98.34 | 0.343 | 21.77 | 0.575 | 86.97 | 0.285 |
| FlowDPS | 23.74 | 0.612 | 33.68 | 0.117 | 20.55 | 0.482 | 95.47 | 0.346 | 21.35 | 0.519 | 76.59 | 0.281 |
| LyapuFlow（本文） | 24.78 | 0.710 | 25.54 | 0.051 | 21.79 | 0.547 | 75.67 | 0.252 | 22.28 | 0.589 | 68.05 | 0.230 |

> **原文疑点：** FFHQ 一组中，按表格数值，高斯去模糊 SSIM 为 FlowChef 0.763、LyapuFlow 0.761，运动去模糊 SSIM 为 FlowChef 0.783、LyapuFlow 0.778，即 FlowChef 的 SSIM 更高；但原文粗体／下划线标记把 LyapuFlow 这两格标为最优，且第 4.2 节正文称 “best SSIM and LPIPS throughout”。本译按原表数值照录，标记与正文表述之间的不一致照原文保留，供读者留意。

**图 4：** 重建保真度的定性比较。左起为测量、FlowChef、FlowDPS、LyapuFlow（本文）与真值；上行为超分辨率，下行为运动去模糊。LyapuFlow 避免了幻觉结构（上行），并更好地保留细节（下行）。

### 4.3 消融研究

**LyapuFlow 各组件的作用.** 我们隔离反馈构造中的两个组件：显式时间导数与反馈信赖域。表 3 表明，去掉时间导数项会一致地降低 Burgers 与 NS 上的保真度（完整表见附录 B.5），这与其追踪预测终端约束沿流变化的作用一致。经验上，去掉信赖域总体上会降低性能，这与其限制大有限步修正的作用一致。关于梯度切换步 $k_{\rm sg}$ 的消融见附录 C.5。

**表 3：** 关于反馈信赖域与时间导数的消融。

| 方法 | 1D Burgers CMMSE/$10^{-2}$ | CSMSE/$10^{-2}$ | FPD | CE(IC)/$10^{-2}$ | CE(ND)/$10^{-2}$ | CE(CL)/$10^{-2}$ | 2D NS CMMSE/$10^{-2}$ | CSMSE/$10^{-2}$ | FPD | CE(IC)/$10^{-2}$ | CE(CL)/$10^{-2}$ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LyapuFlow（本文） | 0.165 | 0.213 | 0.200 | 0 | 1.532 | 0.978 | 5.457 | 2.480 | 0.568 | 0 | 0 |
| 去掉反馈信赖域 | 0.285 | 0.237 | 0.474 | 0 | 1.303 | 0.896 | 5.497 | 2.473 | 0.576 | 0 | 0 |
| 去掉时间导数 | 0.574 | 0.401 | 1.890 | 0 | 4.757 | 3.067 | 6.038 | 2.712 | 0.761 | 0 | 0 |

> **原文疑点：** 表 3 与附录表 9 报告“同一组”消融，但数值不完全一致：1D Burgers 的 CMMSE/CSMSE/FPD 在表 9 为 0.163/0.212/0.204（表 3 为 0.165/0.213/0.200），CE(ND)/CE(CL) 在表 9 为 0.010/0.005（表 3 为 1.532/0.978），去掉时间导数一行同样差异较大（表 9 为 CE(ND)=2.208、CE(CL)=4.800，表 3 为 4.757、3.067）。2D NS 两表数值一致。疑为不同评估子集或表格录入不一致，本页两表均按原文照录。

**超参数敏感性.** 我们通过各自的主要引导参数比较 LyapuFlow 与 DPS。DPS 直接调节步长 $\eta_{\rm DPS}$，而 LyapuFlow 用衰减率 $\alpha$ 决定所需反馈。图 5 显示，DPS 的偏好步长在不同 PDE 间变化显著：较大取值有利于 NS，却使 Heat、Burgers 与 RD 变差。LyapuFlow 在所测试的 $\alpha$ 取值范围内更稳定，说明其对任务特定动力学的敏感性更低。全部采样器的扩展结果见附录 B.6。

**图 5：** DPS 与 LyapuFlow 分别对基础步长与衰减率的任务适应性。四个子图依次为 1D Heat、1D Burgers、1D RD 与 2D NS；横轴为两种主要超参数（LyapuFlow 的 $\alpha$ 取 10、20、30、40、50，DPS 的 $\eta_{\rm DPS}$ 取 0.2、0.4、0.6、0.8、1，同一位置对应两组取值），纵轴为 MMSE 或 CMMSE（$\times10^{-2}$）；蓝线为 LyapuFlow，橙线为 DPS。

**NFE 预算.** 我们首先检验重建增益在积分预算增加时是否保持。图 6 在 28 与 40 NFE 下比较 FlowDPS 与 LyapuFlow。增加预算消除了一些 FlowDPS 伪影，但并未恢复重建过程中丢失的实例特有细节：第一行中人脸雀斑在两种预算下都明显减弱，第二行中眼睑褶皱始终缺失；LyapuFlow 在两种预算下均保留这些结构。附录 C.5 中 40 NFE 的补充评估显示同样的总体趋势，说明差异并非只由积分步数解释。

**图 6：** 不同 NFE 预算下重建保真度的定性比较（高斯去模糊，NFE=28 与 40 两档）。左起依次为测量、FlowDPS（28 NFE）、FlowDPS（40 NFE）、LyapuFlow（28 NFE）、LyapuFlow（40 NFE）与真值；上下两行为两组不同的人脸样例。

## 5. 结论

我们提出 LyapuFlow，一个通过 Lyapunov 反馈对预训练生成流施加约束的测试时控制框架。通过在预测终端样本上评估约束违反，LyapuFlow 计算依赖状态的修正，并且只在预训练动力学无法提供足够 Lyapunov 下降时激活；反馈信赖域进一步限制控制幅值，以减少过大的有限步修正及其带来的离散化误差。我们在科学机器学习与图像逆问题中、于数据空间和潜空间展示了该方法。相对其他测试时约束施加策略，LyapuFlow 一致地取得较强的约束满足与较高的样本保真度。

**局限.** 当前局限在于 LyapuFlow 依赖可微约束函数来构造反馈信号，这限制了它直接适用于那些无法获得关于生成样本梯度的约束。把 LyapuFlow 扩展到不可微、离散或黑盒约束，是有趣的未来方向。此外，所提反馈在生成过程中引入额外的计算与内存开销，因此将 LyapuFlow 与加速技术 [Gupta et al., 2026, Nie et al., 2026] 结合是另一个有前景的方向。

## 致谢

MG、HH 与 NBE 感谢美国能源部（DOE）科学办公室先进科学计算研究办公室的支持：通过 EXPRESS（2025 年极端尺度科学探索研究）计划，以及通过“科学发现先进计算”（SciDAC）计划下的 RAPIDS 研究所，合同编号 DE-AC02-05CH11231，依托劳伦斯伯克利国家实验室。文中表述的观点、意见和/或结论仅代表作者本人，不应被解释为美国政府的官方观点或政策。

## 附录 A　额外分析与证明

本附录给出第 3 节中的推导与附加条件。我们借用鲁棒 Lyapunov 分析与采样数据非线性控制中的标准工具，来处理 LyapuFlow 引入的近似，即反馈的有限步实现 [Sontag, 1989, Lin et al., 1996, Nešić and Grüne, 2005, Nešić and Teel, 2006]。

全文中，所有正则性与有界性假设只要求在所考虑轨迹经过的区域上成立。假定预训练速度场 $\mathbf v_\theta(\mathbf x,t)$ 足够光滑，使相应的流映射与下文各导数存在；并假定约束损失 $\mathcal L$ 连续可微。离散时间结果需要附录 A.2 中单独陈述的更强光滑性条件。

### A.1 最小范数 Lyapunov 控制的推导

我们推导式 (11)，它是下述问题的最优解：

$$
\min_{\mathbf u_t}\ \frac12\|\mathbf u_t\|_2^2
\quad\text{s.t.}\quad
\nabla_{\mathbf x_t}V^\top\mathbf u_t+\partial_tV
+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)+\alpha V\le 0. \tag{24}
$$

为简洁记

$$
\mathbf g=\nabla_{\mathbf x_t}V,\qquad
b=\partial_tV+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)+\alpha V, \tag{25}
$$

于是约束变为

$$
\mathbf g^\top\mathbf u_t+b\le 0. \tag{26}
$$

对相应的拉格朗日函数

$$
J(\mathbf u_t,\lambda)=\frac12\|\mathbf u_t\|_2^2+\lambda(\mathbf g^\top\mathbf u_t+b),
\qquad\lambda\ge 0, \tag{27}
$$

KKT 条件为

$$
\mathbf u_t^\star+\lambda^\star\mathbf g=\mathbf 0
\qquad\text{（平稳性）} \tag{28}
$$

$$
\mathbf g^\top\mathbf u_t^\star+b\le 0
\qquad\text{（原始可行性）} \tag{29}
$$

$$
\lambda^\star\ge 0
\qquad\text{（对偶可行性）} \tag{30}
$$

$$
\lambda^\star(\mathbf g^\top\mathbf u_t^\star+b)=0
\qquad\text{（互补松弛）} \tag{31}
$$

由平稳性得

$$
\mathbf u_t^\star=-\lambda^\star\mathbf g. \tag{32}
$$

若 $b\le 0$，则不激活控制 $\mathbf u_t^\star=\mathbf 0$ 可行且最优。若 $b>0$，在 $\|\mathbf g\|_2>0$ 假设下，最优解处约束为激活约束，从而

$$
-\lambda^\star\|\mathbf g\|_2^2+b=0, \tag{33}
$$

于是

$$
\lambda^\star=\frac{b}{\|\mathbf g\|_2^2}. \tag{34}
$$

合并两种情形，

$$
\lambda^\star=\frac{[b]_+}{\|\mathbf g\|_2^2}. \tag{35}
$$

由式 (32)，

$$
\mathbf u_t^\star=-\frac{[b]_+}{\|\mathbf g\|_2^2}\,\mathbf g
=-\frac{\left[\partial_tV+\nabla_{\mathbf x_t}V^\top\mathbf v_\theta(\mathbf x_t,t)+\alpha V\right]_+}{\|\nabla_{\mathbf x_t}V\|_2^2}
\nabla_{\mathbf x_t}V, \tag{36}
$$

即证式 (11)。

### A.2 离散化与反馈信赖域

现在考虑连续时间 LyapuFlow 采样器的有限步实现。令

$$
V_k=V(\mathbf x_k,t_k),\quad
\mathbf v_k=\mathbf v_\theta(\mathbf x_k,t_k),\quad
\Delta t_k=t_{k+1}-t_k>0, \tag{37}
$$

并回忆闭式反馈可写为

$$
\mathbf u_k^\star=-\eta_k\nabla_{\mathbf x_k}V_k, \tag{38}
$$

其中 $\eta_k$ 是式 (11) 定义的自适应反馈增益。记数值采样器实际施加的反馈为 $\tilde{\mathbf u}_k$。欧拉更新为

$$
\mathbf x_{k+1}=\mathbf x_k+\Delta t_k(\mathbf v_k+\tilde{\mathbf u}_k). \tag{39}
$$

因此反馈贡献有限位移 $\Delta t_k\tilde{\mathbf u}_k$。在施加任何反馈界之前，其幅值为

$$
\|\Delta t_k\mathbf u_k^\star\|_2=\Delta t_k\eta_k\|\nabla_{\mathbf x_k}V_k\|_2. \tag{40}
$$

可见，即使 $\eta_k$ 是为满足瞬时连续时间条件而选，数值采样器实际作出的修正还依赖积分步长与局部梯度幅值。

如正文，我们用下式度量所要求的连续时间 Lyapunov 下降的缺口：

$$
\xi_k=\left[\partial_tV_k+\nabla_{\mathbf x_k}V_k^\top
(\mathbf v_k+\tilde{\mathbf u}_k)+\alpha V_k\right]_+. \tag{41}
$$

等价地，

$$
\partial_tV_k+\nabla_{\mathbf x_k}V_k^\top(\mathbf v_k+\tilde{\mathbf u}_k)
\le-\alpha V_k+\xi_k. \tag{42}
$$

若 $\tilde{\mathbf u}_k=\mathbf u_k^\star$，闭式控制器满足 Lyapunov 条件且 $\xi_k=0$。对反馈施加界可能改变实际控制，并引入正的缺口。

**命题 1 的证明.** 定义增广状态

$$
\mathbf z_k=\begin{bmatrix}\mathbf x_k\\ t_k\end{bmatrix},\qquad
\Delta\mathbf z_k=\Delta t_k\begin{bmatrix}\mathbf v_k+\tilde{\mathbf u}_k\\ 1\end{bmatrix}. \tag{43}
$$

假定 $V$ 关于增广变量 $(\mathbf x,t)$ 的梯度在包含 $\mathbf z_k$ 与 $\mathbf z_{k+1}$ 之间线段的邻域内为 $L_V$-Lipschitz。下降引理给出

$$
V_{k+1}-V_k\le\Delta t_k\left[\partial_tV_k
+\nabla_{\mathbf x_k}V_k^\top(\mathbf v_k+\tilde{\mathbf u}_k)\right]
+\frac{L_V}{2}\|\Delta\mathbf z_k\|_2^2. \tag{44}
$$

由于

$$
\|\Delta\mathbf z_k\|_2^2=\Delta t_k^2\left(1+\|\mathbf v_k+\tilde{\mathbf u}_k\|_2^2\right), \tag{45}
$$

代入式 (42) 得

$$
V_{k+1}-V_k\le-\alpha\Delta t_kV_k+\Delta t_k\xi_k
+\frac{L_V}{2}\Delta t_k^2\left(1+\|\mathbf v_k+\tilde{\mathbf u}_k\|_2^2\right), \tag{46}
$$

即证命题 1。

该界分离出修改反馈的两种效应：限制控制会增大 $\xi_k$，从而削弱瞬时 Lyapunov 下降；允许大控制则通过受控速度的幅值增大二阶项。这正是反馈信赖域背后的有限步权衡。

**单步收缩（one-step contraction）.** 同一边还给出欧拉步后保持收缩的充分条件。对任意 $\gamma\in(0,1)$，若

$$
\xi_k+\frac{L_V}{2}\Delta t_k\left(1+\|\mathbf v_k+\tilde{\mathbf u}_k\|_2^2\right)
\le(1-\gamma)\alpha V_k, \tag{47}
$$

则

$$
V_{k+1}\le(1-\gamma\alpha\Delta t_k)V_k. \tag{48}
$$

因此当 $0<\gamma\alpha\Delta t_k<1$ 且 $V_k>0$ 时，该欧拉步保持严格收缩。

该条件也说明为何在约束接近满足时激进反馈可能出问题：即使 $\xi_k=0$，有限步误差仍随 $\Delta t_k\|\mathbf v_k+\tilde{\mathbf u}_k\|_2$ 增大，而式 (47) 右端随 $V_k$ 减小。因此一条瞬时有效的反馈律，在粗有限步下可能无法降低 $V$。

**累积离散化误差.** 考虑均匀网格 $\Delta t=1/K$。假设

$$
\xi_k\le\bar\xi,\qquad\|\mathbf v_k\|_2\le B_v,\qquad
\|\tilde{\mathbf u}_k\|_2\le B_u \tag{49}
$$

对所有 $k$ 成立，并设 $0<\alpha\Delta t<1$。则由命题 1 得

$$
V_{k+1}\le(1-\alpha\Delta t)V_k+\Delta t\bar\xi
+\frac{L_V}{2}\Delta t^2\left(1+(B_v+B_u)^2\right). \tag{50}
$$

迭代该递推式得

$$
V_K\le(1-\alpha\Delta t)^KV_0
+\left[\frac{\bar\xi}{\alpha}
+\frac{L_V\Delta t}{2\alpha}\left(1+(B_v+B_u)^2\right)\right]
\left[1-(1-\alpha\Delta t)^K\right]. \tag{51}
$$

当 $\bar\xi=0$ 时，欧拉积分引入的额外误差为 $O(\Delta t)=O(1/K)$，其常数随施加反馈的幅值增大。因此增加积分步数与增大允许的反馈幅值，对离散采样器具有耦合影响。

若 $\bar\xi>0$，网格细化仍能消除欧拉离散项，但 $\bar\xi/\alpha$ 这一贡献未必消失。这一区分很重要：减小 $\Delta t$ 控制的是数值积分误差，而 Lyapunov 条件的持续松弛会引入另一类误差源。

**反馈信赖域的作用.** 式 (18) 的反馈信赖域限制由反馈本身造成的有限位移：

$$
\|\Delta t_k\tilde{\mathbf u}_k\|_2\le\rho_k. \tag{52}
$$

我们取

$$
\rho_k=\Delta t_k\bar u_k, \tag{53}
$$

它等价于 $\|\tilde{\mathbf u}_k\|_2\le\bar u_k$。固定 $\bar u_k$ 时，反馈位移随积分网格细化而消失。相反，若让 $\rho_k$ 与 $\Delta t_k$ 无关地固定，则会允许 $\|\tilde{\mathbf u}_k\|_2=O(1/\Delta t_k)$，命题 1 中的有限步误差在网格细化下未必消失。

为显式说明截断的作用，记

$$
\tilde{\mathbf u}_k=\beta_k\mathbf u_k^\star,\qquad
\tilde\eta_k=\beta_k\eta_k, \tag{54}
$$

其中

$$
\beta_k=\begin{cases}
1, & \|\mathbf u_k^\star\|_2\le\bar u_k,\\[2pt]
\dfrac{\bar u_k}{\|\mathbf u_k^\star\|_2}, & \|\mathbf u_k^\star\|_2>\bar u_k.
\end{cases} \tag{55}
$$

于是

$$
\tilde{\mathbf u}_k=-\tilde\eta_k\nabla_{\mathbf x_k}V_k, \tag{56}
$$

即信赖域通过减小自适应反馈增益、同时保持其方向来起作用。

相应的 Lyapunov 缺口可以精确计算。令 $\mathbf g_k=\nabla_{\mathbf x_k}V_k$。由 $\eta_k$ 的定义，

$$
\eta_k\|\mathbf g_k\|_2^2
=\left[\partial_tV_k+\mathbf g_k^\top\mathbf v_k+\alpha V_k\right]_+. \tag{57}
$$

把 $\tilde{\mathbf u}_k=-\beta_k\eta_k\mathbf g_k$ 代入式 (41)，得

$$
\xi_k=(1-\beta_k)\eta_k\|\mathbf g_k\|_2^2
=(\eta_k-\tilde\eta_k)\|\mathbf g_k\|_2^2. \tag{58}
$$

因此，当信赖域不激活时 $\beta_k=1$，所要求的瞬时下降得以保持；当截断激活时，信赖域减小有限反馈位移

$$
\Delta t_k\|\tilde{\mathbf u}_k\|_2=\Delta t_k\tilde\eta_k\|\mathbf g_k\|_2, \tag{59}
$$

代价是式 (58) 显式刻画的缺口。这明确了反馈信赖域的作用：它调节的是有效有限步修正，而不改变 Lyapunov 控制器选定的方向。

**退化梯度.** 闭式控制器假定 $V$ 的梯度提供了控制能够改变 Lyapunov 导数的方向。若 $\nabla_{\mathbf x}V=\mathbf 0$ 而

$$
\partial_tV+\alpha V>0, \tag{60}
$$

则控制对 $\dot V$ 无一阶影响，任何有限瞬时控制都无法实现所要求的 Lyapunov 下降。因此本分析假定：在需要非零修正时 $\nabla_{\mathbf x}V\ne\mathbf 0$。若 $\nabla_{\mathbf x}V=\mathbf 0$ 且 Lyapunov 条件已满足，我们取 $\mathbf u^\star=\mathbf 0$。

## 附录 B　物理约束生成

本节提供物理约束生成的完整实验设置与补充结果。先描述 PDE 任务、预训练生成骨干、测试时约束与评价协议；随后给出计算代价、超参数敏感性与 LyapuFlow 各组件的补充分析；最后是扩展的定性结果。

### B.1 实验设置

#### B.1.1 任务与数据集

沿用 ECI 与 PCFM [Cheng et al., 2025, Utkarsh et al., 2025]，考虑四个覆盖不同动力学与约束结构的 PDE 基准：1D Heat、1D Burgers、1D 反应–扩散（RD）与 2D Navier–Stokes（NS）。空间坐标记作 $s$，物理时间记作 $\tau$，$U$ 表示均匀分布。表 4 汇总定量数据信息。

**表 4：** PDE 数据集汇总。

| 任务 | 空间维数 | 时间维数 | $d$ | 训练样本数 |
|---|---:|---:|---:|---:|
| 1D Heat | 100 | 100 | 10,000 | 5,000 |
| 1D Burgers | 101 | 101 | 10,201 | 6,400 |
| 1D RD | 128 | 100 | 12,800 | 6,400 |
| 2D NS | $64\times64$ | 50 | 204,800 | 10,000 |

**1D Heat.** 在空间域 $s\in[0,2\pi)$ 与时间区间 $\tau\in[0,1]$ 上，数据集由解析式生成：

$$
x(s,\tau)=\sin(s+\phi)\exp(-\nu\tau),\qquad
\phi\sim U(0,\pi),\ \nu\sim U(1,5). \tag{61}
$$

这是 $x_\tau=\nu x_{ss}$ 在周期边界条件下的精确解。空间与时间网格各含 100 个点，每条轨迹由新采样的 $(\phi,\nu)$ 对生成。

**1D Burgers.** 在 $s,\tau\in[0,1]$ 上，用 Godunov 通量求解无黏 Burgers 方程：

$$
x_\tau+\partial_s\left(\tfrac12x^2\right)=0,\qquad
x(s,0)=\frac{1}{1+\exp\left((s-p)/0.02\right)},\quad p\sim U(0.2,0.8). \tag{62}
$$

100 个空间与时间区间给出 $101\times101$ 的存储场。参数 $p$ 决定用作测试时初始条件目标的初始场。

**1D 反应–扩散.** 数据集由下式生成：

$$
x_\tau=\nu x_{ss}+\rho x(1-x),\qquad\rho=0.01,\ \nu=0.005. \tag{63}
$$

空间域在 $[0,1]$ 内含 128 个单元中心点，从 0 到 0.99 存储 100 个时刻。左、右扩散通量分别采样为 $g_L\in[0,0.05]$ 与 $g_R\in[-0.05,0]$。初始场是最多三个傅里叶模态的归一化随机组合，并偶尔施加符号、绝对值与紧支撑变换。

**2D Navier–Stokes.** 在单位二维环面上，令 $\mathbf s=(s_1,s_2)$ 表示空间坐标。涡量方程为

$$
\partial_\tau\omega+\mathbf v\cdot\nabla_{\mathbf s}\omega
=\mu\Delta_{\mathbf s}\omega+f,\qquad
\Delta_{\mathbf s}\psi=\omega,\quad
\mathbf v=(\partial_{s_2}\psi,-\partial_{s_1}\psi),\quad
\mu=10^{-3}. \tag{64}
$$

初始涡量从二维高斯随机场采样。强迫族为 $f_j(\mathbf s)=0.1\sqrt2\sin\left(2\pi(s_1+s_2)+\phi_j\right)$，共 100 个相位 $\phi_j\in[0,\pi/2]$。傅里叶空间 Crank–Nicolson 积分带 $2/3$ 去混叠，内部步长 $10^{-3}$，积分至时间 49 并记录 50 个快照。

#### B.1.2 生成骨干

我们使用无条件函数式流匹配（functional flow matching，FFM）骨干 [Kerrigan et al., 2023]，使测试时施加的物理条件在训练时对生成模型不可见。每个 PDE 专用模型用傅里叶神经算子（FNO）[Li et al., 2020] 学习速度场 $\mathbf v_\theta(\mathbf x,t)$，把函数先验 $\mathbf x_0\sim p_0$ 传输为解 $\mathbf x_1\sim p_{\rm data}$。对 $t\sim U(0,1)$，训练使用

$$
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1,\qquad
\mathbf v_t=\mathbf x_1-\mathbf x_0,\qquad
\mathcal L_{\rm FFM}=\mathbb E\left[\|\mathbf v_\theta(\mathbf x_t,t)-\mathbf v_t\|^2\right]. \tag{65}
$$

初始条件、边界条件与强迫不作为显式条件通道提供；骨干改为对由这些变化诱导的完整解场分布建模。Heat、Burgers 与 RD 模型使用四个傅里叶层，NS 模型使用两层。对 Heat、Burgers 与 RD，$p_0$ 是长度尺度 0.001、方差 1 的 Matérn 高斯过程先验；NS 使用独立同分布高斯先验。Heat、Burgers 与 RD 用 Adam 训练，学习率 $3\times10^{-4}$，批大小 256，20k 优化步。NS 用 AdamW 训练，学习率相同，批大小 24，500k 优化步。

#### B.1.3 测试时约束

推理时，每个任务引入训练时未提供给无条件骨干的物理信息。约束既包括对解的直接条件（如初始场），也包括耦合生成轨迹多个部分的守恒、平衡或局部动力学残差。这为四个 PDE 提供了不同维数与非线性程度的约束范围。表 5 汇总各残差。每个约束把展平解场 $\mathbf x\in\mathbb R^d$ 映射为残差 $h(\mathbf x)\in\mathbb R^m$，二次约束损失 $\mathcal L(\mathbf x)=\tfrac12\|h(\mathbf x)\|^2$。对 Burgers，局部非线性动力学残差在最初五个时间转移上施加 Godunov 更新；其质量平衡残差用 Burgers 通量 $F(x)=x^2/2$ 与时间梯形积分计入通过边界的输运，而不要求总质量保持恒定。对 RD，定义质量 $M_n=\int_\Omega x(\mathbf s,\tau_n)\,d\mathbf s$、空间积分反应源 $S_n=\int_\Omega\rho x(\mathbf s,\tau_n)(1-x(\mathbf s,\tau_n))\,d\mathbf s$，以及边界扩散贡献 $\Phi_n=\nu\left[x_s(\mathbf s_R,\tau_n)-x_s(\mathbf s_L,\tau_n)\right]$。对 NS，零均值强迫促使我们采用总涡量守恒约束。

**表 5：** 测试时 PDE 约束汇总。

| 任务 | 类型 | $m$ | 残差 |
|---|---|---:|---|
| 1D Heat | 线性 IC | 100 | $x(:,0)-x^{\rm ref}(:,0)$ |
| 1D Heat | 线性 CL | 99 | $\sum_s x(s,\tau)\Delta s-\sum_s x(s,0)\Delta s,\ \tau=1,\dots,99$ |
| 1D Heat | 合计 | 199 | — |
| 1D Burgers | 线性 IC | 101 | $x(:,0)-x^{\rm ref}(:,0)$ |
| 1D Burgers | 非线性 Dynamics | 495 | $R_n^j=x_j^{n+1}-x_j^n+\frac{\Delta\tau}{\Delta s}\left[G(x_j^n,x_{j+1}^n)-G(x_{j-1}^n,x_j^n)\right],\ n=0,\dots,4$ |
| 1D Burgers | 非线性 CL | 100 | $M_n-M_0+\Delta\tau\sum_{q=0}^{n-1}\frac{\Phi_q+\Phi_{q+1}}{2},\ n=1,\dots,100$ |
| 1D Burgers | 合计 | 696 | — |
| 1D RD | 线性 IC | 128 | $x(:,0)-x^{\rm ref}(:,0)$ |
| 1D RD | 非线性 CL | 99 | $M_n-M_0-\Delta\tau\sum_{q=0}^{n-1}\frac{(\Phi_q+S_q)+(\Phi_{q+1}+S_{q+1})}{2},\ n=1,\dots,100.$ |
| 1D RD | 合计 | 227 | — |
| 2D NS | 线性 IC | 4,096 | $\omega(:,:,0)-\omega_0$ |
| 2D NS | 线性 CL | 49 | $\sum_{s_1,s_2}\omega(\tau)\Delta s_1\Delta s_2-\sum_{s_1,s_2}\omega(0)\Delta s_1\Delta s_2,\ \tau=1,\dots,49$ |
| 2D NS | 合计 | 4,145 | — |

### B.2 基线与评价协议

我们与在生成轨迹不同位置介入的采样器比较。DPS [Chung et al., 2023] 与 SAD-Flower [Huang et al., 2025] 修正中间状态 $\mathbf x_t$；FlowDPS [Kim et al., 2025]、ProFlow [Yu et al., 2026] 与 PCFM [Utkarsh et al., 2025] 作用于终端预测 $\hat{\mathbf x}_{1|t}$；OC-Flow [Wang et al., 2024] 优化完整轨迹 $\mathbf x_{[0,1]}$。DPS 指其基于流的变体，提供了与 LyapuFlow 一样对预训练速度模型求导的比较。

为受控比较，所有采样器在生成后使用相同的最终投影。FFM 参考执行无条件采样后接该投影，不含中间测试时修正。我们逐任务调节各采样器的主要超参数，所选值见下；评价配置与方法特定超参数汇总于下列表格。

**表 6：** 用于 PDE 仿真的测试参考数据构造。对每个选定条件，参考轨迹从所指示的互补条件集中取出。

| 数据集 | 选定条件 | 每个条件的参考取出方式 | 合计 |
|---|---|---|---:|
| 1D Heat | 1 个 IC（$\phi=\pi/4$） | 512 条解析 $\nu$-轨迹，$\nu\sim U[1,5]$ | 512 |
| 1D 反应–扩散 | 16 个 IC | 每个 IC 32 条 BC 轨迹 | 512 |
| 1D Burgers | 16 个 IC | 每个 IC 32 条 BC 轨迹 | 512 |
| 2D Navier–Stokes | 10 个 IC（涡量） | 每个 IC 10 条强迫轨迹（涡量） | 100 |

**表 7：** 物理约束生成所用超参数。超参数扫描对每个数据集使用 $N=64$ 个样本，多条件数据集使用 $N_{\rm idx}\in\{16,10\}$ 个选定索引。$\alpha$ 与 $\alpha_{\rm SF}$ 分别为 LyapuFlow 与 SAD-Flower 的增益；$\eta_{\rm DPS}$ 是 DPS 的基础步长（用于 $\eta_{\rm DPS}/\|h(\mathbf x)\|$）；$K_{\rm iter}$ 为迭代次数；$\eta_{\rm FD}$、$\eta_{\rm PF}$、$\eta_{\rm OC}$ 分别为 FlowDPS、ProFlow 与 OC-Flow 的步长。

| 数据集 | LyapuFlow | DPS | SAD-Flower | FlowDPS | ProFlow | OC-Flow |
|---|---|---|---|---|---|---|
| 1D Heat | $\alpha=50$；$c_{\rm tr}=10$ | $\eta_{\rm DPS}=0.2$ | $\alpha_{\rm SF}=14$ | $K_{\rm iter}=3$；$\eta_{\rm FD}=0.02$ | $K_{\rm iter}=3$；$\eta_{\rm PF}=0.1$ | $K_{\rm iter}=3$；$\beta=0.995$；$\eta_{\rm OC}=0.5$ |
| 1D Burgers | $\alpha=10$；$c_{\rm tr}=1$ | $\eta_{\rm DPS}=0.4$ | $\alpha_{\rm SF}=5$ | $K_{\rm iter}=3$；$\eta_{\rm FD}=0.06$ | $K_{\rm iter}=3$；$\eta_{\rm PF}=0.1$ | $K_{\rm iter}=3$；$\beta=0.995$；$\eta_{\rm OC}=2.5$ |
| 1D RD | $\alpha=30$；$c_{\rm tr}=1$ | $\eta_{\rm DPS}=0.2$ | $\alpha_{\rm SF}=5$ | $K_{\rm iter}=3$；$\eta_{\rm FD}=0.06$ | $K_{\rm iter}=3$；$\eta_{\rm PF}=0.5$ | $K_{\rm iter}=3$；$\beta=0.995$；$\eta_{\rm OC}=0.5$ |
| 2D NS | $\alpha=50$；$c_{\rm tr}=1$ | $\eta_{\rm DPS}=1$ | $\alpha_{\rm SF}=14$ | $K_{\rm iter}=3$；$\eta_{\rm FD}=0.08$ | $K_{\rm iter}=3$；$\eta_{\rm PF}=0.5$ | $K_{\rm iter}=3$；$\beta=0.995$；$\eta_{\rm OC}=0.5$ |

### B.3 评价指标

部分物理条件通常使其他初始、边界或强迫变量未被指定，因而不能确定唯一的 PDE 轨迹；每个条件实际上定义了一个可容许解分布。我们除评估约束满足外，还评估生成样本是否恢复该条件分布。

对单个条件组，MMSE 比较逐点样本均值场：

$$
{\rm MMSE}=\frac1d\left\|\bar{\mathbf x}-\bar{\mathbf x}^{\rm ref}\right\|^2,
\qquad
{\rm SMSE}=\frac1d\left\|\sigma_{\mathbf x}-\sigma_{\mathbf x}^{\rm ref}\right\|^2, \tag{66}
$$

其中 $\bar{\mathbf x}=\frac1N\sum_{i=1}^N\mathbf x_i$，$\bar{\mathbf x}^{\rm ref}=\frac1N\sum_{i=1}^N\mathbf x_i^{\rm ref}$；SMSE 比较相应的逐点标准差场。

对 Burgers、RD 与 NS，我们评估多个部分条件并报告宏平均条件指标。给定 $G$ 个条件组、索引集 $\mathcal I_g$，

$$
{\rm CMMSE}=\frac1G\sum_{g=1}^G\frac1d\left\|\bar{\mathbf x}_g-\bar{\mathbf x}_g^{\rm ref}\right\|^2,
\qquad
{\rm CSMSE}=\frac1G\sum_{g=1}^G\frac1d\left\|\sigma_{\mathbf x,g}-\sigma_{\mathbf x,g}^{\rm ref}\right\|^2. \tag{67}
$$

这里 $\bar{\mathbf x}_g$ 与 $\sigma_{\mathbf x,g}$ 表示第 $g$ 组的均值场与标准差场，参考样本有类似定义。

约束误差度量单个生成样本的平均残差范数：

$$
{\rm CE}=\frac1N\sum_i\|h(\mathbf x_i)\|. \tag{68}
$$

我们另外报告 Fréchet Poseidon 距离（FPD）作为分布相似性的特征空间度量。生成场与参考场用 PDE 基础模型 Poseidon–B [Herde et al., 2024] 嵌入，再由所得高斯特征统计量计算 Fréchet 距离。对 1D 数据集，每个时空场作为一个特征处理；对 NS，每个时间帧单独嵌入并取逐帧距离的平均。$128\times100$ 的 RD 场在特征提取前中心裁剪为 $100\times100$，以匹配模型输入尺寸。

综合来看，CE 度量物理可行性，而 CMMSE、CSMSE 与 FPD 度量对条件解分布保真度的互补方面。

### B.4 采样效率

各采样器在施加测试时约束所需的计算量上差异显著。表 8 比较每样本运行时间与峰值 GPU 显存，其中包含评价时共用的最终投影。FlowDPS、ProFlow 与 OC-Flow 在所报告配置中使用 $K=3$ 次内层迭代，增加迭代会进一步增大其开销。OC-Flow 在全部四个任务上是最昂贵的方法，这与其反复优化完整控制轨迹一致。PCFM 也因雅可比计算与线性系统求解而带来额外开销。LyapuFlow 避免了轨迹级迭代优化，在全程施加约束感知反馈的同时保持有竞争力的计算开销。

**表 8：** 在同一块 NVIDIA A100 GPU、批大小 1、100 个采样步下测得的采样效率。实际耗时是每生成样本在 1 次预热后 5 次计时运行的平均值；峰值分配显存是这些运行中 CUDA 分配的最大值。两项测量均包含一步最终投影。

| 数据集 | 指标↓ | LyapuFlow（本文） | DPS | SAD-Flower | FlowDPS | ProFlow | PCFM | OC-Flow |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1D Heat | 每样本耗时（秒） | 1.106 | 0.802 | 0.401 | 0.71 | 0.774 | 0.618 | 2.992 |
| 1D Heat | 峰值显存（GiB） | 0.167 | 0.157 | 0.115 | 0.115 | 0.833 | 0.493 | 0.545 |
| 1D Burgers | 每样本耗时（秒） | 1.87 | 1.29 | 0.579 | 2.242 | 2.295 | 1.712 | 3 |
| 1D Burgers | 峰值显存（GiB） | 0.168 | 0.158 | 0.141 | 0.141 | 0.862 | 0.62 | 0.561 |
| 1D RD | 每样本耗时（秒） | 1.351 | 0.959 | 0.475 | 1.297 | 1.375 | 0.987 | 2.867 |
| 1D RD | 峰值显存（GiB） | 0.186 | 0.174 | 0.119 | 0.119 | 1.31 | 0.748 | 0.805 |
| 2D NS | 每样本耗时（秒） | 1.985 | 1.505 | 1.008 | 1.281 | 1.325 | 3.468 | 4.277 |
| 2D NS | 峰值显存（GiB） | 6.382 | 6.382 | 6.382 | 6.382 | 6.382 | 9.607 | 6.382 |

> **原文疑点：** 表 8 表头 “Second / sample” 的用词疑为 “Seconds / sample”（单位应为秒），本译按单位含义处理为“每样本耗时（秒）”。

### B.5 组件消融

我们隔离正文消融中考察的两个组件：Lyapunov 动力学中的显式时间导数与反馈信赖域。表 9 表明，去掉时间导数项一般会增大保真度误差，对 FPD 的影响尤其明显，这与其“计入预测终端约束沿预训练流变化”的作用一致。去掉信赖域的影响较小，在若干指标上性能仍接近完整方法，这支持它更适合作为“防止大有限步修正”的保障，而非反馈信号的主要来源。

**表 9：** 全部 PDE 任务上关于反馈信赖域与时间导数的消融。

**1D Heat / 1D Burgers**

| 方法 | 1D Heat MMSE/$10^{-2}$ | SMSE/$10^{-2}$ | FPD | CE(IC)/$10^{-2}$ | CE(CL)/$10^{-2}$ | 1D Burgers CMMSE/$10^{-2}$ | CSMSE/$10^{-2}$ | FPD | CE(IC)/$10^{-2}$ | CE(ND)/$10^{-2}$ | CE(CL)/$10^{-2}$ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LyapuFlow（本文） | 0.012 | 0.004 | 0.006 | 0 | 0 | 0.163 | 0.212 | 0.204 | 0 | 0.010 | 0.005 |
| 去掉信赖域 | 0.012 | 0.004 | 0.006 | 0 | 0 | 0.283 | 0.235 | 0.458 | 0 | 0.008 | 0.004 |
| 去掉时间导数 | 0.067 | 0.018 | 0.043 | 0 | 0 | 0.584 | 0.398 | 2.240 | 0 | 2.208 | 4.800 |

**1D RD / 2D NS**

| 方法 | 1D RD CMMSE/$10^{-2}$ | CSMSE/$10^{-2}$ | FPD | CE(IC)/$10^{-2}$ | CE(NCL)/$10^{-2}$ | 2D NS CMMSE/$10^{-2}$ | CSMSE/$10^{-2}$ | FPD | CE(IC)/$10^{-2}$ | CE(CL)/$10^{-2}$ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LyapuFlow（本文） | 0.019 | 0.028 | 0.002 | 0 | 0 | 5.457 | 2.480 | 0.568 | 0 | 0 |
| 去掉信赖域 | 0.019 | 0.028 | 0.002 | 0 | 0 | 5.497 | 2.473 | 0.576 | 0 | 0 |
| 去掉时间导数 | 0.052 | 0.029 | 3.525 | 0 | 0 | 6.038 | 2.712 | 0.761 | 0 | 0 |

### B.6 超参数敏感性

我们评估各采样器的主要引导参数能否跨不同 PDE 动力学可靠迁移，还是需要大量任务特定调整。图 7 每次只改变一个参数，其余设置固定。PCFM 没有对应的可调引导参数，以水平参考线表示。

对每种方法，先找出避免非有限取值的粗略范围，再在该范围内调参。直接参数化修正幅值的方法在某些候选取值下仍可能不稳定。LyapuFlow 调的是衰减率 $\alpha$，它只规定所要求的 Lyapunov 下降量，而反馈幅值由当前状态决定。在所评估任务上，LyapuFlow 在测试取值间的波动小于那些主要参数直接控制修正步长的方法。图 5 给出了与 DPS 的线性尺度对比视图（正文所用）。

**图 7：** 各 PDE 采样器的超参数敏感性。每种方法在其主要引导参数的五个取值上评估：LyapuFlow 取 $\alpha$，DPS 取 $\eta_{\rm DPS}$，SAD-Flower 取 $\alpha_{\rm SF}$，FlowDPS 取 $\eta_{\rm FD}$，ProFlow 取 $\eta_{\rm PF}$，OC-Flow 取 $\eta_{\rm OC}$；PCFM 无调优引导参数，以水平参考线表示。1D 任务使用对数纵轴，非有限取值以 × 标出。

### B.7 定性结果

以下示例补充聚合指标，展示不同采样器在给定测试时条件下如何修改完整的 PDE 解场。

**图 8：** 1D Heat 在初始条件与守恒律约束下的定性比较。每一列依次为真值、LyapuFlow、DPS、SAD-Flower、FlowDPS、ProFlow、PCFM、OC-Flow、FFM + 投影；上行为场值（−1 至 1），下行为绝对误差（0–0.4），横轴为时间、纵轴为空间。

**图 9：** 1D Burgers 在初始条件、局部动力学与质量平衡约束下的定性比较。布局同图 8：每一列依次为真值及各采样器，上行为场值（0–1），下行为绝对误差（0–0.75）。

**图 10：** 1D 反应–扩散在初始条件与平衡律约束下的定性比较。布局同图 8：每一列依次为真值及各采样器，上行为场值（0–1），下行为绝对误差（0–0.4）。

**图 11：** 2D Navier–Stokes 在初始涡量与总涡量约束下的定性比较。各行按时间帧（$=0,12,24,37,49$）排列，列依次为真值及各采样器；色标为涡量场值（约 −2 至 2）及绝对误差（0–1.2）。

**图 12：** 2D Navier–Stokes 在初始涡量与总涡量约束下的定性比较（第二组样例）。布局与色标范围同图 11。

## 附录 C　图像逆问题

本节提供潜空间图像逆问题的完整实验设置与补充结果。先描述数据集、预训练骨干、退化算子、基线配置与评价协议；随后考察采样效率、更大积分预算下的性能、频域行为与补充的定性重建。

### C.1 实验设置

#### C.1.1 数据集与骨干

我们在 1k 张 AFHQ 图像（含 0.5k 张狗与 0.5k 张猫）、1k 张 FFHQ 图像与 0.8k 张 DIV2K 图像上评估，分辨率均为 $768\times768$。所有方法使用 Stable Diffusion 3.5-Medium [Esser et al., 2024] 作为预训练潜空间流模型，无分类器引导（classifier-free guidance）尺度为 2 [Ho and Salimans, 2022]。AFHQ 使用提示词 “a photo of a dog” 与 “a photo of a cat”，FFHQ 使用 “a photo of a person”，DIV2K 使用 “a high quality photo of {DAPE tags}”，其中标签从经 DAPE 退化的图像中提取 [Wu et al., 2024]。

#### C.1.2 逆问题与观测

我们考虑 $\times4$ 双三次超分辨率、高斯去模糊与运动去模糊，核大小为 61。对每个任务，观测图像由施加相应前向算子并加入测量噪声 $\sigma_n=0.03$ 得到；所得观测定义测试时的数据一致性约束。因此同一预训练潜流在所有逆问题中复用，只有观测算子与观测在推理时改变。

### C.2 基线与评价协议

我们考虑 LatentDAPS [Zhang et al., 2025]、FlowChef [Patel et al., 2025]、FlowDPS [Kim et al., 2025]、FLAIR [Erbach et al., 2026] 与 FlowLPS [Park and Ye, 2025] 作为候选基线。正文的主要比较聚焦于 FlowChef 与 FlowDPS，因为它们与 LyapuFlow 一样不使用其他几种方法所需的大规模内层优化循环。所有候选基线的计算代价在附录 C.4 单独报告。

**方法特定设置.**

- **LatentDAPS** [Zhang et al., 2025]：从 $\sigma=1$ 到 $0.2$ 的 20 个 EDM 退火步，$\rho=7$；每个区间使用两步中点去噪，合计 40 NFE。非超分任务每个退火步使用 15 次朗之万（Langevin）MCMC 更新，学习率 $10^{-4}$；超分辨率使用 60 次更新，学习率 $10^{-3}$，每 5 次 MCMC 更新衰减 0.7；$\tau=0.03$。
- **FlowChef** [Patel et al., 2025]：每个流步一次数据一致性更新，步长为 15。
- **FlowDPS** [Kim et al., 2025]：每个流步三次数据一致性更新，步长为 15。
- **FLAIR** [Erbach et al., 2026]：使用官方仓库默认设置，每步 15 次数据项更新，数据项 SGD 学习率超分为 1.0、去模糊为 0.1，正则化尺度 0.5，内置校准日程，$t_{\min}=0.18$。
- **FlowLPS** [Park and Ye, 2025]：$N_L=5$ 次朗之万更新与 $N_P=10$ 次近端 SGD 更新。朗之万步长 $10^{-4}$，近端 SGD 学习率 0.1（无衰减），日程偏移为 3，并使用 pCN 重加噪。
- **LyapuFlow**：见表 10。

**表 10：** 28 与 40 NFE 下各任务的 LyapuFlow 设置。$k_{\rm sg}$ 表示关闭对 $\mathbf v_\theta$ 的停止梯度（stop-gradient）的控制步（从零开始索引）；$k_{\rm sg}$ 等于 NFE 数时表示整个采样过程中一直保持停止梯度。

| 数据集 | 任务 | 28 NFE：$\alpha$ | $k_{\rm sg}$ | $c_{\rm tr}$ | 40 NFE：$\alpha$ | $k_{\rm sg}$ | $c_{\rm tr}$ |
|---|---|---:|---:|---:|---:|---:|---:|
| AFHQ | 超分辨率（双三次） | 5 | 28 | 1.0 | 5 | 40 | 1.0 |
| AFHQ | 去模糊（高斯） | 5 | 3 | 1.0 | 5 | 40 | 1.0 |
| AFHQ | 去模糊（运动） | 5 | 7 | 1.0 | 5 | 40 | 1.0 |
| FFHQ | 超分辨率（双三次） | 5 | 28 | 1.0 | 5 | 40 | 1.0 |
| FFHQ | 去模糊（高斯） | 5 | 3 | 1.0 | 5 | 7 | 1.0 |
| FFHQ | 去模糊（运动） | 5 | 7 | 1.0 | 5 | 7 | 1.0 |
| DIV2K | 超分辨率（双三次） | 5 | 28 | 1.0 | 5 | 40 | 1.0 |
| DIV2K | 去模糊（高斯） | 5 | 3 | 1.0 | 5 | 40 | 1.0 |
| DIV2K | 去模糊（运动） | 7 | 7 | 1.0 | 5 | 40 | 1.0 |

### C.3 评价指标

我们报告峰值信噪比（PSNR）与结构相似性指数（SSIM），以衡量重建失真与结构一致性；另外报告学习到的感知图像块相似度（LPIPS）与 Fréchet Inception 距离（FID），以刻画像素空间失真未能完全反映的感知差异与分布差异。

### C.4 采样效率

候选图像基线在每个采样步内执行的计算量差异显著。表 11 在小规模评价子集上比较重建质量与运行时间。迭代繁重的方法 LatentDAPS、FLAIR 与 FlowLPS 的采样代价远高于单次更新方法。例如 FlowLPS 在运动去模糊上把 PSNR 相对 LyapuFlow 提高 1.21 dB，但所需采样时间超过 8 倍。这促使正文的主要比较对象选为 FlowChef 与 FlowDPS，它们处于更可比的质量–效率区间。

**表 11：** 采样速度与质量的权衡，在前 10 张 FFHQ 图像上评估。

| 采样器 | $N_{\rm iter}$ | NFE | 超分 ×4 PSNR | LPIPS | 高斯去模糊 PSNR | LPIPS | 运动去模糊 PSNR | LPIPS | 每图像耗时（秒） |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LyapuFlow（本文） | 1 | 40 | 30.63 | 0.041 | 28.76 | 0.117 | 28.87 | 0.120 | 13.8 |
| FlowChef | 1 | 40 | 30.90 | 0.060 | 26.62 | 0.219 | 28.52 | 0.175 | 11.9 |
| FlowDPS | 3 | 40 | 30.09 | 0.101 | 26.57 | 0.208 | 27.83 | 0.171 | 26.6 |
| FlowLPS | 15 | 40 | 24.86 | 0.060 | 28.87 | 0.075 | 30.08 | 0.065 | 112.6 |
| FLAIR | 15 | 40 | 22.84 | 0.044 | 26.29 | 0.094 | 26.93 | 0.088 | 112.8 |
| LatentDAPS | 15 或 60 | 40 | 27.05 | 0.116 | 25.22 | 0.238 | 25.29 | 0.249 | 112.6 |

### C.5 补充结果与消融

我们另外在 40 NFE 下评估各方法，以检验 28 NFE 下观察到的差异是否可由有限的积分预算解释。结果与主评价保持同样的总体趋势，随着流评估次数增加，LyapuFlow 维持较强的重建质量。

**表 12：** 图像逆问题的定量评估。所有实验使用 Stable Diffusion 3.5-Medium、40 NFE。粗体为最优，下划线为次优（原文标记；本页以纯数值照录）。

**AFHQ 1k（$768\times768$）**

| 方法 | 超分 ×4（双三次）PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 运动去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FlowChef | 29.67 | 0.807 | 22.34 | 0.077 | 25.42 | 0.719 | 38.55 | 0.256 | 26.56 | 0.743 | 36.37 | 0.2107 |
| FlowDPS | 28.51 | 0.764 | 18.45 | 0.124 | 25.67 | 0.697 | 29.65 | 0.244 | 26.20 | 0.710 | 25.21 | 0.2106 |
| LyapuFlow（本文） | 30.35 | 0.833 | 8.93 | 0.040 | 27.42 | 0.732 | 17.86 | 0.137 | 27.57 | 0.750 | 17.06 | 0.1429 |

**FFHQ 1k（$768\times768$）**

| 方法 | 超分 ×4（双三次）PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 运动去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FlowChef | 29.99 | 0.835 | 61.02 | 0.061 | 25.78 | 0.763 | 113.95 | 0.219 | 27.13 | 0.786 | 94.87 | 0.179 |
| FlowDPS | 29.39 | 0.778 | 28.45 | 0.098 | 26.29 | 0.739 | 50.23 | 0.206 | 27.09 | 0.747 | 40.28 | 0.173 |
| LyapuFlow（本文） | 30.28 | 0.836 | 26.48 | 0.044 | 28.04 | 0.770 | 40.20 | 0.122 | 28.21 | 0.782 | 35.86 | 0.123 |

**DIV2K 0.8k（$768\times768$）**

| 方法 | 超分 ×4（双三次）PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ | 运动去模糊 PSNR↑ | SSIM↑ | FID↓ | LPIPS↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FlowChef | 24.48 | 0.683 | 43.25 | 0.087 | 20.84 | 0.536 | 95.28 | 0.327 | 21.94 | 0.581 | 80.43 | 0.263 |
| FlowDPS | 24.07 | 0.637 | 32.96 | 0.113 | 20.81 | 0.505 | 89.69 | 0.334 | 21.66 | 0.541 | 73.33 | 0.269 |
| LyapuFlow（本文） | 24.82 | 0.710 | 23.35 | 0.047 | 22.24 | 0.564 | 68.25 | 0.211 | 22.74 | 0.607 | 61.19 | 0.204 |

> **原文疑点：** 表 12 的 AFHQ 运动去模糊一列中，三种方法的 LPIPS 均以四位小数给出（0.2107、0.2106、0.1429），与全表其余三位小数的写法不一致；本译按原表照录，未作四舍五入或改写。

如图 13 所示，通过速度场的完整梯度（$k_{\rm sg}=0$）在各项指标上结果较弱；引入合适的初始停止梯度窗口（$0<k_{\rm sg}<28$）可改善性能，而 $k_{\rm sg}=28$（全程停止速度梯度、仅使用解码器–雅可比反馈）也优于完整梯度设定。最佳中间切换点因任务与指标而异。

**图 13：** 在 10 张 FFHQ 图像上对梯度切换步 $k_{\rm sg}$ 的消融。$k_{\rm sg}$ 取 $0,1,2,3,4,5,10,20,28$，四个子图依次为 PSNR（dB）、SSIM、FID、LPIPS；曲线对应高斯模糊、运动模糊与双三次超分辨率三类任务。$N=10$。

### C.6 频率分析

潜空间表述默认使用解码器传播的约束梯度，并在需要更细修正时于较晚采样步选择性恢复速度–雅可比贡献。为补充像素空间与感知指标，图 14 比较各数据集与逆问题中重建结果的谱密度。该视角有助于把空间频率恢复上的改善，与只能通过聚合重建指标才能察觉的变化区分开。

**图 14：** 28 NFE 下各数据集与逆问题任务（AFHQ、FFHQ、DIV2K 的超分、高斯去模糊、运动去模糊）的谱密度比较。

### C.7 定性结果

下列各图给出所有数据集与逆问题上的补充定性比较。图 15–17 为 AFHQ 结果，图 18–20 为 FFHQ 结果，图 21–23 为 DIV2K 结果。在这些示例中，重建结果补充了聚合指标，展示不同引导方法如何在满足观测约束的同时恢复实例特有的结构。

**图 15：** AFHQ 双三次超分辨率（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 16：** AFHQ 高斯去模糊（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 17：** AFHQ 运动去模糊（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 18：** FFHQ 双三次超分辨率（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 19：** FFHQ 高斯去模糊（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 20：** FFHQ 运动去模糊（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 21：** DIV2K 双三次超分辨率（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 22：** DIV2K 高斯去模糊（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

**图 23：** DIV2K 运动去模糊（Stable Diffusion 3.5-Medium，28 NFE）的定性比较。

## 参考文献（英文原条目，按原文顺序与编号）

[1] Atilim Gunes Baydin, Barak A. Pearlmutter, Alexey Andreyevich Radul, and Jeffrey Mark Siskind. “Automatic differentiation in machine learning: a survey.” *Journal of Machine Learning Research*, 18(153):1–43, 2018.

[2] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. “D-Flow: Differentiating through flows for controlled generation.” arXiv:2402.14017, 2024.

[3] Junsong Chen, Jincheng Yu, Chongjian Ge, Lewei Yao, Enze Xie, Zhongdao Wang, James Kwok, Ping Luo, Huchuan Lu, and Zhenguo Li. “PixArt-α: Fast training of diffusion transformer for photorealistic text-to-image synthesis.” *International Conference on Learning Representations*, 2024, pp. 57611–57640.

[4] Chaoran Cheng, Boran Han, Danielle Maddix, Abdul Fatir Ansari, Andrew Stuart, Michael W. Mahoney, and Bernie Wang. “Gradient-free generation for hard-constrained systems.” *International Conference on Learning Representations*, 2025, pp. 100510–100539.

[5] Jacob K. Christopher, Stephen Baek, and Ferdinando Fioretto. “Constrained synthesis with projected diffusion models.” *Advances in Neural Information Processing Systems*, 37:89307–89333, 2024.

[6] Hyungjin Chung, Jeongsol Kim, Michael Thompson McCann, Marc Louis Klasky, and Jong Chul Ye. “Diffusion posterior sampling for general noisy inverse problems.” *The Eleventh International Conference on Learning Representations*, 2023.

[7] Giannis Daras, Hyungjin Chung, Chieh-Hsin Lai, Yuki Mitsufuji, Jong Chul Ye, Peyman Milanfar, Alexandros G. Dimakis, and Mauricio Delbracio. “A survey on diffusion models for inverse problems.” arXiv:2410.00083, 2024.

[8] Julius Erbach, Dominik Narnhofer, Andreas Dombos, Bernt Schiele, Jan Eric Lenssen, and Konrad Schindler. “Solving inverse problems with FLAIR.” *Advances in Neural Information Processing Systems*, 38:136667–136704, 2026.

[9] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, et al. “Scaling rectified flow transformers for high-resolution image synthesis.” *Forty-first International Conference on Machine Learning*, 2024.

[10] Jiarui Fang, Jinzhe Pan, Xibo Sun, Aoyu Li, and Jiannan Wang. “xDiT: An inference engine for diffusion transformers (DiTs) with massive parallelism.” arXiv:2411.01738, 2024.

[11] Randy Freeman and Petar V. Kokotovic. *Robust Nonlinear Control Design: State-Space and Lyapunov Techniques*. Springer Science & Business Media, 2008.

[12] Aditi Gupta, Soon Hoe Lim, Annan Yu, and N. Benjamin Erichson. “Sharpen your flow: Sharpness-aware sampling for flow matching.” arXiv:2605.11547, 2026.

[13] Derek Hansen, Danielle C. Maddix, Shima Alizadeh, Gaurav Gupta, and Michael W. Mahoney. “Learning physical models that can respect conservation laws.” *International Conference on Machine Learning*, pp. 12469–12510, PMLR, 2023.

[14] Maximilian Herde, Bogdan Raonić, Tobias Rohner, Roger Käppeli, Roberto Molinaro, Emmanuel De Bezenac, and Siddhartha Mishra. “Poseidon: Efficient foundation models for PDEs.” *Advances in Neural Information Processing Systems*, 37:72525–72624, 2024.

[15] Jonathan Ho and Tim Salimans. “Classifier-free diffusion guidance.” arXiv:2207.12598, 2022.

[16] Tzu-Yuan Huang, Armin Lederer, Dai-Jie Wu, Xiaobing Dai, Sihua Zhang, Hsiu-Chin Lin, Shao-Hua Sun, Stefan Sosnowski, and Sandra Hirche. “SAD-Flower: Flow matching for safe, admissible, and dynamically consistent planning.” arXiv:2511.05355, 2025.

[17] Katherine Keegan and Lars Ruthotto. “Manifold-aware perturbations for constrained generative modeling.” arXiv:2601.23151, 2026.

[18] Gavin Kerrigan, Giosue Migliorini, and Padhraic Smyth. “Functional flow matching.” arXiv:2305.17209, 2023.

[19] Hassan K. Khalil and Jessy W. Grizzle. *Nonlinear Systems*, vol. 3. Prentice Hall, Upper Saddle River, NJ, 2002.

[20] Jeongsol Kim, Bryan Sangwoo Kim, and Jong Chul Ye. “FlowDPS: Flow-driven posterior sampling for inverse problems.” *2025 IEEE/CVF International Conference on Computer Vision (ICCV)*, pp. 12328–12337, IEEE, 2025.

[21] Bolin Lai, Xudong Wang, Saketh Rambhatla, James M. Rehg, Zsolt Kira, Rohit Girdhar, and Ishan Misra. “Toward diffusible high-dimensional latent spaces: A frequency perspective.” *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, pp. 43450–43460, 2026.

[22] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. “Fourier neural operator for parametric partial differential equations.” arXiv:2010.08895, 2020.

[23] Yuandan Lin, Eduardo D. Sontag, and Yuan Wang. “A smooth converse Lyapunov theorem for robust stability.” *SIAM Journal on Control and Optimization*, 34(1):124–160, 1996.

[24] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. “Flow matching for generative modeling.” *The Eleventh International Conference on Learning Representations*, 2023.

[25] Xingchao Liu, Lemeng Wu, Shujian Zhang, Chengyue Gong, Wei Ping, and Qiang Liu. “FlowGrad: Controlling the output of generative ODEs with gradients.” *2023 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, pp. 24335–24344, IEEE, 2023.

[26] D. Nešić and Andrew R. Teel. “Stabilization of sampled-data nonlinear systems via backstepping on their Euler approximate model.” *Automatica*, 42(10):1801–1808, 2006.

[27] Dragan Nešić and Lars Grüne. “Lyapunov-based continuous-time nonlinear controller redesign for sampled-data implementation.” *Automatica*, 41(7):1143–1156, 2005.

[28] Weili Nie, Julius Berner, Chao Liu, and Arash Vahdat. “NVIDIA FastGen: Fast generation from diffusion models.” 2026. URL https://github.com/NVlabs/FastGen.

[29] Jonghyun Park and Jong Chul Ye. “FlowLPS: Langevin-proximal sampling for flow-based inverse problem solvers.” arXiv:2512.07150, 2025.

[30] Maitreya Patel, Song Wen, Dimitris N. Metaxas, and Yezhou Yang. “FlowChef: Steering of rectified flow models for controlled generations.” *2025 IEEE/CVF International Conference on Computer Vision (ICCV)*, pp. 15308–15318, IEEE, 2025.

[31] Lev Semenovich Pontryagin. *Mathematical Theory of Optimal Processes*. CRC Press, 1987.

[32] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. “High-resolution image synthesis with latent diffusion models.” *2022 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, pp. 10674–10685, IEEE, 2022.

[33] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. “Solving linear inverse problems provably via posterior sampling with latent diffusion models.” *Advances in Neural Information Processing Systems*, 36:49960–49990, 2023.

[34] Shreshth Saini, Shashank Gupta, and Alan Bovik. “Rectified CFG++ for flow based models.” *Advances in Neural Information Processing Systems*, 38:149034–149074, 2026.

[35] Eduardo D. Sontag. “A ‘universal’ construction of Artstein’s theorem on nonlinear stabilization.” *Systems & Control Letters*, 13(2):117–123, 1989.

[36] Andrew J. Taylor, Victor D. Dorobantu, Yisong Yue, Paulo Tabuada, and Aaron D. Ames. “Sampled-data stabilization with control Lyapunov functions via quadratically constrained quadratic programs.” *IEEE Control Systems Letters*, 6:680–685, 2021.

[37] Alexander Tong, Kilian Fatras, Nikolay Malkin, Guillaume Huguet, Yanlei Zhang, Jarrid Rector-Brooks, Guy Wolf, and Yoshua Bengio. “Improving and generalizing flow-based generative models with minibatch optimal transport.” *Transactions on Machine Learning Research*, 2024. ISSN 2835-8856.

[38] Utkarsh Utkarsh, Pengfei Cai, Alan Edelman, Rafael Gomez-Bombarelli, and Christopher Rackauckas. “Physics-constrained flow matching: Sampling generative models with hard constraints.” *Advances in Neural Information Processing Systems*, 38:160217–160252, 2025.

[39] Utkarsh Utkarsh, Danielle C. Maddix, Ruijun Ma, Michael W. Mahoney, and Yuyang Wang. “End-to-end probabilistic framework for learning with hard constraints.” *International Conference on Learning Representations*, 2026, pp. 14291–14333.

[40] Luran Wang, Chaoran Cheng, Yizhen Liao, Yanru Qu, and Ge Liu. “Training free guided flow matching with optimal control.” arXiv:2410.18070, 2024.

[41] Rongyuan Wu, Tao Yang, Lingchen Sun, Zhengqiang Zhang, Shuai Li, and Lei Zhang. “SeeSR: Towards semantics-aware real-world image super-resolution.” *2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, pp. 25456–25467, IEEE, 2024.

[42] Zewen Yang, Xiaobing Dai, Dian Yu, Zhijun Li, Majid Khadiv, Sandra Hirche, and Sami Haddadin. “UniConFlow: A unified constrained flow-matching framework for certified motion planning.” arXiv:2506.02955, 2025.

[43] Zichao Yu, Ming Li, Wenyi Zhang, Difan Zou, and Weiguo Gao. “ProFlow: Zero-shot physics-consistent sampling via proximal flow guidance.” arXiv:2601.20227, 2026.

[44] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. “Improving diffusion inverse problem solving with decoupled noise annealing.” *2025 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, pp. 20895–20905, IEEE, 2025.

**原文插图：** 原 PDF 中的图 1–23 未重传至本页，仅保留中文图注、图例说明与正文给出的关键数值；全部原图可通过页首的原文 PDF 或 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2610.04326v1 的全文中文译稿，覆盖摘要、正文第 1–5 节（含全部小节）、结论与局限、致谢、附录 A–C（A.1–A.2、B.1–B.7、C.1–C.7）、全部图注与表注（图 1–23、表 1–12，表格数据逐格转录）以及 44 条参考文献英文原条目；公式 (1)–(68) 按原文编号以 `$$` 展示式录入，算法 1–2 以中文步骤表述。**逐句终校未做**：公式下标／上标、表格数值已用 PDF 文本层逐字抽取并与页面渲染交叉核对，但尚未完成逐句逐式的独立复核。页内 5 处“原文疑点”为翻译时发现的原文内部不一致（第 4 节引言句法、表 2 FFHQ 的 SSIM 标记与正文表述、表 3 与表 9 的消融数值、表 8 的耗时单位用词、表 12 的 LPIPS 小数位），均按原文照录，未作数值改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
