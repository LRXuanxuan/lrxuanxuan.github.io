---
layout: page
title: "DC-FM：面向条件流匹配的难度校准插值路径｜中文完整译稿（待逐式复核）"
permalink: /papers/translations/2026-10-16-difficulty-calibrated-flow-matching-2608-21286/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原论文 arXiv](https://arxiv.org/abs/2608.21286) · [原始 PDF](https://arxiv.org/pdf/2608.21286v1)

# 面向条件流匹配的难度校准插值路径

**英文题名：** Difficulty-Calibrated Interpolation Paths for Conditional Flow Matching  
**作者：** Airin Akter Tania、Md Raihan Khan  
**作者单位：** 孟加拉国库尔纳工程技术大学电气与电子工程系；孟加拉国库尔纳西北大学电气与电子工程系  
**来源：** arXiv:2608.21286v1，2026 年 8 月 21 日，6 页。  
**翻译范围：** 原文摘要、关键词、第 I–VI 节、公式 (1)–(13)、命题 1 与证明、图 1–4 的图题和可读文字、表 I–IV、参考文献 [1]–[18]。原始图片不在本站重复托管，请通过 PDF 查看。  
**质量状态：** 已形成原文结构完整的中文译稿；排版与数值已对照，尚待逐词逐式终校，故暂不计入“已验收全文”统计。原文有几处相互矛盾的数值或叙述，已在文末按原文标出，未擅自修改。译文未经原作者审核。

## 摘要

条件流匹配（Conditional Flow Matching，CFM）通过使网络回归预先规定的噪声到数据插值路径上的速度，来训练生成模型。塑造该路径的插值调度已知会影响收敛性与样本质量，但通常事先固定，既不依赖数据，也不依赖模型。本文表明，条件流匹配的回归难度沿路径发生有规律的变化，并提出**难度校准流匹配**（Difficulty-Calibrated Flow Matching，DC-FM），由模型自身推导插值调度：首先以线性路径进行一次简短的预训练运行，记录各时间位置的损失；然后将调度设为该难度分布的分位数函数，使轨迹在最难学习速度的区域停留更久。

该方法只有一个超参数，不改变训练目标及其梯度等价关系，可与无分类器引导（classifier-free guidance）组合，并仅增加约 2% 的训练开销。在 CIFAR-10、MNIST 和 Fashion-MNIST 上，使用同一紧凑型 U-Net 进行受控实验。结果表明，校准路径在完整采样预算下于 CIFAR-10 取得最优 FID，并在大批量、少参数更新的设置中明显优于所有固定调度；而这恰好是计算资源最紧缺的情形。

**关键词：** 流匹配、生成模型、扩散模型、插值调度、资源受限训练。

## I. 引言

生成建模旨在把简单的先验分布变换为复杂的数据分布。扩散模型 [1]–[3] 和流匹配（Flow Matching，FM）[4] 已成为完成这一任务的主要框架：它们沿常微分方程（ODE）积分学习到的时变速度场，以生成样本。条件流匹配（CFM）[4]–[6] 不必在训练时仿真整个流，也不必直接回归难以计算的边缘速度场，而是对一组噪声—数据样本进行条件化，使插值路径及其目标速度具有闭式表达。由于两个目标的梯度相同，可以通过优化容易计算的条件目标，间接优化困难的边缘目标；这正是 CFM 的关键。

插值调度 $\alpha(t)$ 决定噪声到样本的运动路径，是 CFM 的核心组成部分。该调度直接影响训练路径、收敛和样本质量 [7]–[9]。然而，通常调度在训练前就已经确定，独立于数据及待训练模型。这种统一调度忽略了回归任务的一个基本事实：沿路径的每个位置并非同样困难。有些片段存在明显训练误差，其他片段则几乎不需要学习。如果为两者分配相同的轨迹预算，就会浪费资源；在计算资源和采样步数受限时尤其如此。

本文提出 DC-FM，根据模型实际测得的难度，而非预设的数据无关先验，确定插值调度（图 1）。先使用线性路径进行简短的预训练，并记录不同时间位置的学习难度。由于线性路径的目标速度范数不随 $t$ 改变，难度曲线反映的是实际学习难度，而非目标尺度随时间变化造成的假象。把难度曲线视为路径坐标上的未归一化密度，取其分位数函数作为调度（图 2）。这样，轨迹会在困难区域减速，在容易区域快速通过，将预算重新分配给速度场更难学习的区域。强调指数 $\gamma$ 控制校准强度，$\gamma=0$ 时精确恢复线性路径。

DC-FM 无须修改 CFM 的目标函数。主训练开始前，调度已经冻结，因此支撑 CFM 的梯度等价性质保持成立；方法也无须修改即可与无分类器引导 [10] 组合。它与非均匀时间步采样 [3]、[8] 亦不同：后者改变被选中用于训练的时间 $t$，却不改变推断路径；DC-FM 则通过重塑 $\alpha$ 缩放目标速度，从而改变采样动力学。

本文贡献如下：

1. 证明 CFM 的回归难度沿插值路径呈现系统性变化，而预先固定的调度不顾这种差异，均匀消耗轨迹预算。
2. 提出两阶段 DC-FM：在预训练阶段测量逐时间难度，再根据其分位数函数构造由单个超参数 $\gamma$ 控制的插值调度。该结构保持 CFM 目标及其梯度等价性，并兼容无分类器引导。
3. 在 CIFAR-10、MNIST 和 Fashion-MNIST 上，将 DC-FM 与线性（Rectified Flow）、余弦（GVP）及 Sigmoid 调度比较。文中报告 CIFAR-10 的完整采样预算优势，以及在批量大小为 512 的 MNIST 少更新实验中，DC-FM 的 FID@100 为 8.13，线性基线为 10.16。（原文在此段写出“5.44 对 55.13”，与表 I 不一致，详见文末校对备注。）

**图 1｜DC-FM 概念示意。** 样本 $x_t$ 沿插值路径从噪声 $x_0$ 移向数据 $x_1$；网络 $v_\theta$ 用均方误差损失回归目标速度 $u_t$。DC-FM 使轨迹点更多地分布在逐时间难度 $w(t)$ 较大的位置，从而让路径在困难区域停留更久。图中标注包括“数据”“噪声”“速度 ODE 轨迹”“MSE”“$v_\theta$”和“$u_t$”。

## II. 相关工作

### A. 流匹配与迭代生成

迭代生成模型通过学习的轨迹将简单先验传输到数据分布。扩散模型开创了这类范式：DDPM [1] 使用固定马尔可夫前向过程进行去噪；DDIM [2] 将采样重写为非马尔可夫确定性过程以加速推断；EDM [3] 系统整理扩散生成模型中的噪声调度和权重设计空间。

流匹配 [4] 则通过回归预定条件概率路径的速度，以无需仿真的方式训练连续归一化流；这一框架包含扩散路径，也允许使用最优传输插值。Rectified Flow [9] 学习沿噪声—数据直线路径运动的 ODE，并通过反复 reflow 进一步使轨迹变直。随机插值（stochastic interpolants）[6] 则从连接源分布与目标分布的任意密度插值推导速度场，在理论上统一上述两种视角。小批量最优传输的条件流匹配 [5] 与可扩展插值 Transformer（SiT）[7] 将该框架扩展到实用耦合与网络架构。这些方法都定义了一条需要在推断时经过多个步骤积分的轨迹。

### B. 少步与单步生成

上述模型的主要计算成本来自积分轨迹所需的函数调用次数，这推动了大量生成加速研究。除 reflow [9] 外，近期工作还直接训练少步生成器：MeanFlow [11] 建模平均速度而非瞬时速度，单次网络求值即可取得有竞争力的生成质量；SoFlow [12] 引入解一致性损失，避免相关一致性目标所需的雅可比—向量积；AlphaFlow [13] 通过逐渐改变训练课程，把轨迹流匹配、shortcut 模型和 MeanFlow 统一起来；W-Flow [14] 将 Wasserstein 梯度流压缩为单步生成器。Latent Flow Transformer [15] 将类似原理用于压缩 Transformer 层块。这些工作通过改变目标函数或蒸馏轨迹来降低推断成本。本文研究方向与其不同：保持标准多步 CFM 目标不变，只重新分配轨迹预算的使用位置。

### C. 插值路径与时间调度

与本文最接近的工作是改变路径遍历方式的研究。已知插值调度会影响收敛与样本质量 [7]。Scaling Rectified Flow [8] 使用 logit-normal 时间步采样，使训练偏向中间时间位置；EDM [3] 调节不同噪声水平的损失权重。

其他方法通过数据几何结构重塑路径：Carré du champ Flow Matching [16] 用具有流形感知能力的各向异性噪声取代各向同性噪声；LapFlow [17] 将图像分解为并行生成的拉普拉斯金字塔尺度；Rectified-CFG++ [18] 则针对整流流调整无分类器引导的几何结构。关键区别在于：时间步重加权只改变训练哪些 $t$，不改变推断轨迹；本文根据模型实际测得的逐时间难度推导调度，并缩放目标速度，使采样动力学本身，而不仅是训练时间分布，能够适应回归难度。

## III. 预备知识：流匹配

采用连续归一化流（Continuous Normalizing Flow，CNF）的生成建模，通过积分时变速度场 $v:\mathbb R^d\times[0,1]\to\mathbb R^d$，将简单源密度 $p_0=\mathcal N(0,I)$ 传输到数据密度 $p_1$。对应的常微分方程为

$$
\frac{\mathrm d}{\mathrm dt}\phi_t(x)
=v_t(\phi_t(x)),\qquad \phi_0(x)=x. \tag{1}
$$

流 $\phi_t$ 诱导概率路径 $p_t$，即从 $p_0$ 插值到 $p_1$ 的边缘分布族。通过最大似然训练 CNF 需要仿真式 (1)，因而代价较高。流匹配 [4] 通过使网络回归产生选定路径的目标场 $u_t$ 来避免训练时仿真：

$$
\mathcal L_{\rm FM}(\theta)
=\mathbb E_{t,\,x\sim p_t}
\bigl\|v_\theta(x,t)-u_t(x)\bigr\|^2. \tag{2}
$$

边缘速度场 $u_t$ 依赖所有数据，通常难以计算。条件流匹配（CFM）[4]–[6] 对单一数据—噪声样本对 $(x_0,x_1)$ 条件化，使条件路径 $p_t(x\mid x_1)$ 和条件速度 $u_t(x\mid x_1)$ 有闭式表达：

$$
\mathcal L_{\rm CFM}(\theta)
=\mathbb E_{t,\,q(x_1),\,p_t(x\mid x_1)}
\bigl\|v_\theta(x,t)-u_t(x\mid x_1)\bigr\|^2. \tag{3}
$$

一个核心结果是，式 (2) 和式 (3) 对 $\theta$ 具有相同梯度，因此最小化易计算的 $\mathcal L_{\rm CFM}$ 等价于优化 $\mathcal L_{\rm FM}$ [4]。

**a) 高斯插值。** 本文采用标准线性（最优传输）插值 [4]、[9]。令 $x_0\sim\mathcal N(0,I)$，$x_1$ 为数据样本，并定义单调调度 $\alpha:[0,1]\to[0,1]$，满足 $\alpha(0)=0$、$\alpha(1)=1$，则

$$
x_t=(1-\alpha(t))x_0+\alpha(t)x_1. \tag{4}
$$

对式 (4) 求导，条件目标速度的闭式表达为

$$
u_t=\frac{\mathrm dx_t}{\mathrm dt}
=\alpha'(t)(x_1-x_0), \tag{5}
$$

网络 $v_\theta(x_t,t)$ 即对该速度进行回归。不同 $\alpha$ 对应不同调度：$\alpha(t)=t$ 为线性调度；$\alpha(t)=1-\cos(\pi t/2)$ 为余弦调度；还可采用 S 形 Sigmoid 调度。既有研究 [7]、[8] 已表明，调度选择会显著影响收敛和样本质量，这是本文的研究动机。

**图 2｜DC-FM 整体流程。** (a) 标准 CFM：把数据样本 $x_1$ 与噪声 $x_0$ 通过插值式混合，U-Net 在流匹配损失下回归目标速度，推断时对 ODE 积分生成样本。示意网络宽度为 64、约 390 万参数，采用正弦时间嵌入与多层感知机；采样使用 Euler 法，NFE 为 100 或 20，通过与 5,000 个真实图像的 FID 比较评价。(b) 线性、余弦、Sigmoid、DC-FM 四种 $\alpha(t)$ 曲线，受控比较中仅改变调度，网络、轮次、批量大小、优化器和随机种子相同。(c) DC-FM 先测量线性预训练的逐时间难度 $w(t)$，再将调度设为 $w^\gamma$ 对应的分位数函数，使轨迹在困难区域减速、容易区域加速。

## IV. 难度校准流匹配

现有调度事先给定，与数据或模型无关。然而，式 (3) 的回归在不同 $t$ 处并非同等困难：部分区域占据了大量误差，其他区域几乎无须学习。在计算预算紧张时，对所有区域均匀分配轨迹预算尤其浪费。因此本文根据模型自身测得的难度来推导调度。

### A. 形式化定义

把 $t$ 处的期望条件损失定义为逐时间难度：

$$
w(t)=\mathbb E_{x_0,x_1}
\bigl\|v_\theta(x_t,t)-u_t\bigr\|^2. \tag{6}
$$

将 $w$ 视作路径坐标上的未归一化密度，并把插值调度设成其分位数函数。引入强调指数 $\gamma\geq0$：

$$
\rho(s)=\frac{w(s)^\gamma}{\int_0^1w(u)^\gamma\,\mathrm du}, \tag{7}
$$

$$
R(s)=\int_0^s\rho(u)\,\mathrm du, \tag{8}
$$

$$
\alpha(t)=R^{-1}(t). \tag{9}
$$

**命题 1（有效性）。** 若在 $[0,1]$ 上有 $w(s)>0$，则 $\alpha=R^{-1}$ 是有效调度：$\alpha(0)=0$，$\alpha(1)=1$，并且严格递增。

**证明。** 因为 $\rho>0$，所以 $R$ 连续且严格递增，并满足 $R(0)=0$、$R(1)=1$。因此 $R$ 是区间 $[0,1]$ 到自身的双射，逆函数 $R^{-1}$ 继承严格单调性及指定端点值。证毕。

由逆函数定理并结合式 (9)，调度速度具有闭式表达：

$$
\alpha'(t)
=\frac{1}{R'(\alpha(t))}
=\frac{1}{\rho(\alpha(t))}. \tag{10}
$$

因此，当难度较大、$\rho$ 较大时，$\alpha'(t)$ 较小：轨迹在困难区域停留更久，在容易区域迅速穿过。将式 (9)、(10) 代入式 (4)、(5)，即可得到校准后的插值状态和目标速度，无须改变 CFM 公式。

**a) 强调指数。** 当 $\gamma=0$ 时，式 (7) 给出均匀密度 $\rho$，于是 $R(s)=s$、$\alpha(t)=t$，精确恢复线性路径。当 $\gamma=1$ 时，路径位置的采样密度与难度成正比；$\gamma>1$ 将更强烈地集中到困难区域。$\gamma$ 是该方法唯一的超参数。

**b) 经验估计器。** 实践中将 $[0,1]$ 均匀划为 $B$ 个箱，在预训练过程中，把逐样本损失累计到各箱并做滑动平均，得到 $\widehat w_1,\ldots,\widehat w_B$。对其平滑并设置正下界后，按式 (7) 累积构造分段线性的 $\widehat R$；再通过线性插值计算 $\alpha=\widehat R^{-1}$，并根据式 (10) 求 $\alpha'$。额外计算成本可以忽略。

### B. 学习目标

DC-FM 分两个阶段执行，以使训练保持标准 CFM 形式。

**阶段 1（校准）。** 使用线性调度进行简短的预训练，并按照式 (6) 累计 $\widehat w(t)$。之所以选择线性路径，是因为其目标速度范数不依赖于 $t$：由于 $x_0$ 与 $x_1$ 独立，

$$
\mathbb E\|u_t\|^2
=\mathbb E\|x_1-x_0\|^2
=\mathbb E\|x_1\|^2+d, \tag{11}
$$

上式是常数。因此测得的 $w(t)$ 反映真正的学习难度，而不是非线性调度通过式 (5) 中 $\alpha'(t)$ 引入的目标尺度变化。

**阶段 2（训练）。** 将式 (9) 获得的 $\alpha$ 冻结，利用校准插值从头训练 $v_\theta$。给定 $x_0\sim\mathcal N(0,I)$、$x_1\sim q$、$t\sim U(0,1)$，训练目标是

$$
\mathcal L(\theta)
=\mathbb E_{t,x_0,x_1}
\left\|
v_\theta(x_t,t)-\alpha'(t)(x_1-x_0)
\right\|^2, \tag{12}
$$

其中 $x_t$ 由式 (4) 给出。由于第二阶段的 $\alpha$ 固定，第三节说明的 CFM 梯度等价关系原样成立。本文的改动完全体现在如何获得这一静态调度。推断时以学习到的 $v_\theta$ 从 $t=0$ 到 $t=1$ 积分式 (1)，完成样本生成。

**a) 与时间步加权的关系。** 定义 $\beta(t)=1-\alpha(t)$，重塑 $\alpha$ 相当于重新参数化沿固定几何路径的遍历速度。这与非均匀时间步采样 [3]、[8] 有关联，但后者改变训练所采用的 $t$，推断轨迹不变；本文的式 (10) 则缩放目标速度，进而改变采样动力学。实验中另以匹配时间步重加权的线性训练作对照，以区分两者。

### C. 无分类器引导

对标签 $c$ 条件下的生成，训练单个网络 $v_\theta(x_t,t,c)$，同时要求其支持无条件速度场：训练过程中以概率 $p_{\rm uncond}$ 将 $c$ 随机替换为空标记 $\varnothing$ [10]。除增加条件输入以外，式 (12) 的 DC-FM 目标不变。

推断时，无分类器引导通过使条件场相对无条件场外推，构造引导速度：

$$
\widetilde v_t(x,c)
=v_\theta(x,t,\varnothing)
+\omega\bigl(
v_\theta(x,t,c)-v_\theta(x,t,\varnothing)
\bigr), \tag{13}
$$

其中 $\omega\geq0$ 是引导系数（$\omega=0$ 恢复无条件采样，$\omega>0$ 增强类别一致性）。由于式 (4) 的高斯插值使式 (5) 的目标速度对端点呈仿射关系，式 (13) 的组合是流匹配中对应于得分引导 [10] 的形式。采样时用 $\widetilde v_t$ 代替 $v_t$ 积分式 (1)。引导与路径校准相互独立：调度 $\alpha$ 重塑轨迹的时间几何结构（IV-A），而式 (13) 改变其条件方向，两者可以原样组合。

## V. 实验

### A. 实验设置

**数据集。** 使用 CIFAR-10、MNIST 和 Fashion-MNIST，全部缩放为 $32\times32$。除非另外说明，难度校准与消融实验使用 MNIST。

**模型与训练。** 全部方法使用相同的紧凑型 U-Net 速度网络（约 390 万参数，基础通道宽度 64），以 Adam 优化 100 个 epoch，学习率为 $2\times10^{-4}$，批量大小为 128，梯度裁剪阈值 1.0，随机种子固定。方法之间只改变插值调度 $\alpha(t)$，其他设置均保持一致，以实施受控比较。

**采样与指标。** 使用 Euler 法积分概率流 ODE 生成样本。在函数求值次数（NFE）取 100 和 20 时，分别计算与 5,000 幅真实图像之间的 Fréchet Inception Distance（FID）；FID 越低越好，分别衡量正常预算下的质量与少步效率。

**基线。** 采用文献中三个固定调度：Rectified Flow 的线性/最优传输路径 [4]、[9]，三角形式的广义方差保持（GVP）路径 [6]、[7]，以及 Logistic（Sigmoid）调度。本文 DC-FM 根据测得的逐时间难度推导 $\alpha$（第四节）。

### B. 主要结果

表 I 给出各数据集的 FID。DC-FM 在 CIFAR-10 上取得最好的 FID@100（5.13），比线性基线改善 0.31。在 MNIST 与 Fashion-MNIST 上，原文正文称其与最佳方案处于测量噪声允许的范围内。线性（Rectified Flow）也是强基线，在低 NFE 下表现稳健：NFE=20 时，三角 GVP 路径在 MNIST 上从 6.84 退化到 11.06，而线性调度几乎不受步数变化影响。总体而言，不存在在所有情形下均占优的固定调度；DC-FM 在全部数据集上有竞争力，在最困难的 CIFAR-10 正常采样预算下最好，而短期校准带来的训练开销仅约为 2%。

**表 I｜主要结果：三个数据集在 NFE=100/20 下的 FID（越低越好；每列最优项在原文加粗）**

| 数据集 | 方法 | FID@100 | FID@20 |
|---|---|---:|---:|
| CIFAR-10 | Rectified Flow（线性）[9] | 5.44 | 5.85 |
| CIFAR-10 | GVP（余弦）[6] | 5.90 | 5.71 |
| CIFAR-10 | Logistic（Sigmoid） | 5.30 | 6.53 |
| CIFAR-10 | **DC-FM（本文）** | **5.13** | **5.15** |
| MNIST | Rectified Flow（线性）[9] | 5.70 | 5.92 |
| MNIST | GVP（余弦）[6] | 6.84 | 11.06 |
| MNIST | Logistic（Sigmoid） | 5.55 | 6.11 |
| MNIST | **DC-FM（本文）** | **5.11** | **5.42** |
| Fashion-MNIST | Rectified Flow（线性）[9] | 12.41 | 14.03 |
| Fashion-MNIST | GVP（余弦）[6] | 12.56 | 18.58 |
| Fashion-MNIST | Logistic（Sigmoid） | 16.53 | 22.20 |
| Fashion-MNIST | **DC-FM（本文）** | **8.43** | **9.58** |

### C. 消融实验

所有消融实验采用 MNIST；在每一张表内，四种方法具有相同计算预算，因此可在表内比较。

**强调指数 $\gamma$。** 表 II 显示适度的校准优于过度集中。DC-FM 在 $\gamma=1$ 附近达到最优（FID@100 为 5.81），其他取值会使性能下降。随着 $\gamma\to0$，调度逼近线性基线，与第四节 A 小节一致。原文这一段对小 $\gamma$ 与“过度集中”的因果表述存在不一致，译文保留数值而不替作者推定原因。

**表 II｜强调指数 $\gamma$ 的影响（MNIST）。原文标注该预算下线性基线 FID@100 约为 7.4。**

| 指标 / $\gamma$ | 0.1 | 0.5 | 1 | 1.5 | 2.0 |
|---|---:|---:|---:|---:|---:|
| FID@100 | 7.43 | 7.90 | **5.81** | 8.85 | 9.52 |
| FID@20 | 7.74 | 8.44 | **6.42** | 11.04 | 16.21 |

**难度分辨率 $B$。** 表 III 显示，取 $B=20$ 时 DC-FM 表现良好，较粗的 $B=10$ 曲线稍差。

**表 III｜难度分箱数量 $B$ 对 DC-FM 的影响（MNIST）。**

| 指标 / $B$ | 10 | 20 | 40 | 80 |
|---|---:|---:|---:|---:|
| FID@100 | 8.63 | **5.81** | 7.45 | 7.71 |
| FID@20 | 9.11 | **6.42** | 8.06 | 8.37 |

**批量大小。** 表 IV 专门检验本文的核心主张。当批量大小为 512 时，固定计算预算意味着更少的梯度更新。DC-FM 的 FID@100 为 8.13，明显优于所有固定调度（线性 10.16、GVP 10.71、Logistic 11.05）。难度感知的预算分配在梯度更新次数稀缺时最有帮助，而这正是本文关注的资源受限情形。

**表 IV｜批量大小为 512 时各方法在 MNIST 上的 FID（NFE=100/20，越低越好）。**

| 方法 | FID@100 | FID@20 |
|---|---:|---:|
| Rectified Flow（线性）[9] | 10.16 | 10.61 |
| GVP（余弦）[6] | 10.71 | 22.44 |
| Logistic（Sigmoid） | 11.05 | 13.57 |
| **DC-FM（本文）** | **8.13** | **8.39** |

### D. 分析与定性结果

在全部数据集上，预训练测得的难度 $w(t)$ 都明显不均匀（图 3）：靠近 $t=1$ 的损失较高，CIFAR-10 在靠近 $t=0$ 时损失也较高，而中间部分较低。DC-FM 将这一特征转换为在高损失区域减速的调度。从定性结果看，DC-FM 在三个数据集上均能产生结构连贯的样本（图 4）。

其主要局限在极低 NFE 设置下：把轨迹时间集中于困难区域，可能让少步 Euler 积分比均匀速度的线性路径更不准确。如何缩小这一差距留待未来研究。

**图 3｜校准调度与难度。** 在 CIFAR-10（上）、Fashion-MNIST（中）、MNIST（下）上，依次展示插值调度 $\alpha(t)$（左）、遍历速度 $\alpha'(t)$（中）及预训练测得的逐时间难度 $w(t)$（右）。DC-FM 恰好在 $w(t)$ 较大的区域减速，即 $\alpha'(t)$ 较小。

**图 4｜DC-FM 的未经人工筛选的生成样本。** NFE=100；上排为 CIFAR-10，下排为 Fashion-MNIST。原图请见论文第 6 页。

## VI. 结论

本文提出了难度校准流匹配（DC-FM），以由模型自身测得的回归难度确定的调度，取代 CFM 预先指定的插值调度。一次简短的线性预训练估计逐时间损失曲线，再把调度设成该曲线的分位数函数，使轨迹在速度场最难学习的区域停留更久。

该结构仅有超参数 $\gamma$，保留 CFM 目标及其梯度等价性，可与无分类器引导组合，只带来约 2% 的额外训练开销。在 CIFAR-10、MNIST 和 Fashion-MNIST 的严格受控比较中，DC-FM 在最困难的数据集上取得最优 FID@100；在大批量、少参数更新的情况下，其优势进一步扩大，因为固定调度在该情形下浪费的预算最多。原文结论还称温和校准（$\gamma\approx0.1$–$0.5$）普遍优于更强集中，然而与表 II 的数值未完全吻合。未来研究包括：在推断中采用难度感知的步长位置分配，以缩小低 NFE 时的差距；在训练期间进行在线再校准；将方法拓展至更高分辨率及潜空间生成。

## 参考文献

> 保留原作者拼写、序号、发表场合及 arXiv 号码，并对题名提供中文释义，便于检索原文。下列条目不是译者新增文献。

[1] J. Ho, A. Jain, P. Abbeel，**去噪扩散概率模型**（Denoising Diffusion Probabilistic Models），NeurIPS，33 卷，2020 年，6840–6851 页。

[2] J. Song, C. Meng, S. Ermon，**去噪扩散隐式模型**（Denoising Diffusion Implicit Models），ICLR，2021 年。

[3] T. Karras, M. Aittala, T. Aila, S. Laine，**阐明基于扩散的生成模型的设计空间**（Elucidating the Design Space of Diffusion-Based Generative Models），NeurIPS，2022 年。

[4] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, M. Le，**用于生成建模的流匹配**（Flow Matching for Generative Modeling），ICLR，2023 年。

[5] A. Tong 等，**利用小批量最优传输改进并推广基于流的生成模型**（Improving and Generalizing Flow-Based Generative Models with Minibatch Optimal Transport），TMLR，2024 年。

[6] M. S. Albergo, E. Vanden-Eijnden，**利用随机插值构建归一化流**（Building Normalizing Flows with Stochastic Interpolants），ICLR，2023 年。

[7] N. Ma 等，**SiT：利用可扩展插值 Transformer 探索基于流与扩散的生成模型**（SiT: Exploring Flow and Diffusion-Based Generative Models with Scalable Interpolant Transformers），ECCV，2024 年，23–40 页。

[8] P. Esser 等，**将整流流 Transformer 扩展到高分辨率图像合成**（Scaling Rectified Flow Transformers for High-Resolution Image Synthesis），ICML，2024 年。

[9] X. Liu, C. Gong, Q. Liu，**直且快地流动：利用整流流学习生成与传输数据**（Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow），ICLR，2023 年。

[10] J. Ho, T. Salimans，**无分类器扩散引导**（Classifier-Free Diffusion Guidance），NeurIPS Workshop on Deep Generative Models，2021 年。

[11] Z. Geng, M. Deng, X. Bai, J. Z. Kolter, K. He，**用于单步生成建模的 Mean Flows**（Mean Flows for One-Step Generative Modeling），NeurIPS，2025 年。

[12] T. Luo, H. Yuan, Z. Liu，**SoFlow：用于单步生成建模的解流模型**（SoFlow: Solution Flow Models for One-Step Generative Modeling），ICLR，2026 年。

[13] H. Zhang 等，**AlphaFlow：理解并改进 MeanFlow 模型**（AlphaFlow: Understanding and Improving MeanFlow Models），arXiv:2510.20771，2025 年。

[14] J. Han, P. Li, R. Xu, Q. Guo, S. Ermon, E. J. Candès，**通过 Wasserstein 梯度流实现单步生成建模**（One-Step Generative Modeling via Wasserstein Gradient Flows），arXiv:2605.11755，2026 年。

[15] Y.-C. Wu 等，**潜在流 Transformer**（Latent Flow Transformer），arXiv:2505.14513，2025 年。

[16] Anonymous，**Carré du champ 流匹配：生成模型中更好的质量—泛化权衡**（Carré du Champ Flow Matching: Better Quality-Generalisation Tradeoff in Generative Models），原文标注 ICLR 2026 在审。

[17] Z. Zhao, P. Molodyk, H. Xue, Y. Chen，**用于生成建模的拉普拉斯多尺度流匹配**（Laplacian Multi-Scale Flow Matching for Generative Modeling），arXiv:2602.19461，2026 年。

[18] S. Saini, S. Gupta, A. C. Bovik，**用于流模型的 Rectified-CFG++**（Rectified-CFG++ for Flow Based Models），arXiv 预印本，2025 年。

## 原文内部一致性校对备注（译者注）

以下仅提示**上传 PDF 的原文**中出现的冲突；表格数字按原文逐项保留，未替作者调整实验结果。

- **引言第 2 页数值：** 原文写“5.44 vs. 55.13 for linear”，但表 I 列出 CIFAR-10 的 DC-FM FID@100 为 **5.13**、线性基线为 **5.44**。此处疑有笔误。
- **第五节 B 小节：** 原文称在 MNIST/Fashion-MNIST 上 DC-FM 与最优方法处于测量噪声范围内，但表 I 的 DC-FM 均是对应列最低值，尤其 Fashion-MNIST 改善幅度较大。
- **第五节 C 小节与结论：** 表 II 的最佳 $\gamma$ 为 **1**；结论却将 $\gamma\approx0.1$–$0.5$ 称为普遍更优。对 $\gamma\leq0.5$ 与“过度集中”的措辞也不一致。
- **第四节 A 小节：** 原文称平滑/累积并通过线性插值计算逆分布；实现若使用分段线性近似，须注意分段常数 $\rho$、梯度近似和端点数值稳定性，并不能直接从理论有效性命题推断离散实现一定严格平滑。

以上为译者核对备注，不属于原论文正文。