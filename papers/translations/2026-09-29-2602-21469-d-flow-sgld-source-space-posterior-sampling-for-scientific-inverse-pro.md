---
layout: page
title: "D-Flow SGLD：用流匹配进行科学逆问题的源空间后验采样｜中文全文译文"
permalink: /papers/translations/2026-09-29-2602-21469-d-flow-sgld-source-space-posterior-sampling-for-scientific-inverse-pro/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3aef3ac592639816/) · [原文 arXiv](https://arxiv.org/abs/2602.21469) · [全部目录](/papers/catalog/)

# D-Flow SGLD：用流匹配进行科学逆问题的源空间后验采样

**原题：** D-Flow SGLD: Source-Space Posterior Sampling for Scientific Inverse Problems with Flow Matching  
**作者：** Meet Hemant Parikh$^{a}$、Yaqin Chen$^{b}$、Jian-Xun Wang$^{a,b}$  
**单位：** $^{a}$ 康奈尔大学 Sibley 机械与航空航天工程学院（Ithaca, NY, USA）；$^{b}$ 圣母大学航空航天与机械工程系（Notre Dame, IN, USA）。  
**版本：** arXiv:2602.21469v1（cs.LG），2026 年 2 月 25 日；原文 43 页（正文 + 致谢 + 附录 A—G + 参考文献）。  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节、致谢与生成式 AI 使用声明、附录 A—G、图 1—10 与图 E.11/F.12/F.13/G.14—G.19 中文图注、表 1/表 2/表 D.3 逐格转录、参考文献 [1]—[39]（英文原条目，按原编号）均按原文结构录入；逐句逐式终校未做。

## 摘要

数据同化与科学逆问题需要从稀疏、含噪的观测中重建高维物理状态，理想情况下应给出既忠实于所学先验、又遵循控制物理的后验样本。免训练的条件生成在扩散模型中已发展成熟，但面向流匹配（Flow Matching, FM）先验的相应条件化与后验采样策略仍相对缺乏探索，尤其是在必须超越测量失配来评估保真度的科学基准上。本文研究 FM 先验下科学逆问题的免训练条件生成，并按测量信息注入的位置对现有推理期策略进行组织：(i) 引导式传输动力学——利用似然信息扰动采样轨迹；(ii) 源分布推断——在保持所学传输不变的前提下，对源变量做后验推断。基于后者，我们提出 **D-Flow SGLD**：一种源空间后验采样方法，在可微源推断的基础上加入预条件随机梯度 Langevin 动力学，从而在无需重训先验、也不修改所学 FM 动力学的情况下，可扩展地探索由新测量算子诱导的源后验。我们在一组分层问题上对两类代表性方法进行基准测试：2D 玩具后验、混沌 Kuramoto–Sivashinsky 轨迹，以及壁面约束湍流重建。在这些设定中，我们量化了测量同化、后验多样性与物理/统计保真度之间的权衡，并把 D-Flow SGLD 确立为科学逆问题中实用且兼容 FM 的后验采样器。

**关键词：** 免训练条件生成、数据同化、湍流重建、生成式建模、科学逆问题

## 1. 引言

数据同化与逆问题等科学推断任务，旨在从间接、稀疏且含噪的观测中重建未知的高维物理状态。许多情形下前向映射已知（如测量算子、数值求解器或传感器模型），但状态的后验分布仍高度非高斯、多峰，使经典采样型贝叶斯流程的不确定性量化（UQ）在计算上颇具挑战 [1]。近来，深度生成模型已成为强大的数据驱动先验，能够表示科学场、轨迹与湍流涨落上的复杂分布 [2–4]。除无条件生成外，实际科学应用常需要**条件生成**：采样同时满足 (i) 与观测或约束一致，以及 (ii) 在所学先验（若适用，还包括控制物理）下合理 [2, 5, 6]。

基于分数的扩散模型与相关的去噪型生成器已在科学代理建模与条件重建中取得令人瞩目的结果 [7–12]。逆问题中的一个关键吸引力在于：可复用无条件先验，并在测试时施加新的观测模型，从而避免针对每个前向算子或传感配置重新训练 [5, 13]。这种免训练（或零样本）条件化范式在如下科学应用中尤为有吸引力：每个测量设置都缺乏成对训练数据，且研究者希望在变化的实验条件下探查后验不确定性 [14–16]。

在近期的生成范式中，流匹配（FM）通过沿简单源分布与数据分布之间规定的概率路径回归时间相关向量场，为连续时间生成模型提供了一种免模拟（simulation-free）的训练目标 [17]。FM 把扩散型概率路径作为特例包含在内，也支持其他路径族（如受最优传输启发的构造），依据所选路径与数值求解器，可在训练鲁棒性与采样效率之间取得有利的实践权衡 [18]。尽管如此，FM 在科学应用中的探索仍较少，只有少量但不断增多的工作涉及 PDE 驱动系统、物理约束采样与湍流重建 [4, 19–22]。对逆问题更重要的是，**免训练条件生成**（即在不重训的情况下让固定的预训练先验以新测量算子为条件）在扩散模型中已相当成熟 [5]，但对 FM 而言相对不成熟 [4]，尤其是在超越测量失配的科学保真度要求之下。因此，现有兼容 FM 的条件化策略在不同算子与噪声区制下表现如何、哪些方法最能保持物理相关结构与统计量，仍不清楚。这一空白促使我们 (i) 在 FM 框架内对免训练条件化方法做系统基准测试，以及 (ii) 面向科学数据集设计可扩展且兼容 FM 的后验采样器。

现有免训练方法可按**测量信息在推理时注入的位置**来组织：(i) **引导式传输动力学**（轨迹级条件化）与 (ii) **源分布推断**（源空间条件化）。两族方法都旨在从观测模型诱导的后验中采样，区别在于条件化是修改生成过程中的**传输动力学**，还是在保持所学传输不变的前提下对**源变量/分布**做推断。第一族利用似然信息扰动采样动力学来条件化生成，与扩散后验采样和基于引导的求解器密切相关 [5, 13]。实践中，这些方法修改生成 ODE/SDE 的漂移（或其离散化更新），使演化中的样本持续被拉向测量一致的区域，形成"带引导的积分"过程而非重训先验 [23–25]。代表性实例包括即插即用式流引导 [26]，以及沿轨迹控制似然注入强度的退火调度 [25]；近期扩展还引入无梯度或粒子式机制以改善鲁棒性与多样性 [14, 27]。虽然这类方法在许多图像恢复问题中有效，但**动力学层面的引导**在科学设定中可能较为脆弱：过度强制测量一致性会把中间状态驱入所学先验支撑较差的区域，并使保持具有物理意义的结构（跨尺度）变得复杂。

第二族方法保持所学传输动力学不变，转而对其中的源场（传输映射的初值）做后验推断，寻求一个源后验，使其推前（pushforward）产生测量一致的状态 [28–32]。D-Flow 等方法通过对 ODE 求解器求导来优化源 [29]，相关工作则利用一致性模型进行高效源优化 [28]；更近期的工作探索用随机动力学 [30] 或无梯度推断 [32] 来估计源后验。理论上，这一范式对科学问题很有吸引力，因为条件样本仍是预训练传输的精确输出；但它也带来了实际权衡：重复前向/伴随求解的开销，与需要混合良好、多样的后验集合之间的矛盾。

本文在 FM 框架下研究科学逆问题的免训练条件生成，并针对可扩展、能保持物理相关结构的后验采样方法之缺失作出回应。具体而言，我们 (i) 对 FM 先验的代表性免训练条件化策略做系统基准测试，覆盖引导式传输动力学与源分布推断两族，并在区分测量同化与先验/物理保真度的互补指标下评估；(ii) 提出 **D-Flow SGLD**，一种源空间后验采样方法，把可微源推断与**预条件随机梯度 Langevin 动力学（SGLD）** [33] 相结合，从而在无需修改所学 FM 动力学、也无需重训先验的前提下，高效探索新测量算子诱导的源后验。我们在一组分层逆问题上验证这些想法，包括带高质量参考后验的 2D 玩具问题、带 PDE 残差保真度的混沌 Kuramoto–Sivashinsky 轨迹，以及带谱诊断的壁面约束湍流重建，从而厘清动力学层面引导与源空间推断各自何时更可靠，并为科学逆问题提供一个实用的兼容 FM 的后验采样器。

## 2. 方法

我们研究使用预训练无条件流匹配先验的**免训练**贝叶斯逆问题。给定从代表性数据学到的生成传输映射，目标是在不重训生成模型的前提下逼近部分、含噪观测所诱导的后验分布。我们按**测量信息进入生成过程的环节**来组织推理期条件化：(i) **速度场引导**，在采样期间利用似然驱动的修正来修改传输动力学；(ii) **源空间引导**，保持所学传输不变，转而对源变量做推断，把推断出的源经固定映射推前。在源空间一族中，现有方法通常是确定性（MAP）优化器，如 D-Flow。我们引入其随机变体 **D-Flow SGLD**，通过 SGLD 瞄准源后验，并经由一次推前返回后验样本。

### 2.1 带流匹配先验的贝叶斯逆问题

给定物理状态 $x_1\in\mathbb R^n$（如 2D/3D 速度场）与含噪、部分观测量 $y\in\mathbb R^m$（$m\ll n$），我们希望以既物理合理又与 $y$ 一致的方式重建 $x_1$。假设（可能非线性的）状态到可观测量的算子 $F:\mathbb R^n\to\mathbb R^m$ 带有加性噪声：

$$
y=F(x_1)+\epsilon,\qquad \epsilon\sim p_\epsilon,\tag{1}
$$

它定义了似然 $p(y|x_1)$。常见实例包括掩码或裁剪观测、稀疏传感器、线性投影以及非线性导出量（如涡量）。对高斯噪声 $\epsilon\sim\mathcal N(0,\sigma_y^2I)$，有 $-\log p(y|x_1)=(2\sigma_y^2)^{-1}\|y-F(x_1)\|_2^2+\text{const}$。贝叶斯逆问题即刻画后验

$$
p(x_1|y)\propto p(y|x_1)p(x_1),\tag{2}
$$

其中 $p_1=p(x_1)$ 是物理可行状态上的所学先验。本文同时考虑 (i) 经由最大后验（MAP）解的点估计

$$
x^{\mathrm{MAP}}\in\arg\min_{x_1}\left(-\log p(y|x_1)-\log p(x_1)\right),\tag{3}
$$

以及 (ii) 用于不确定性量化与下游统计的后验采样。

### 2.2 流匹配先验：由 (OT-)CFM 学到的传输映射

我们用由 ODE 定义的确定性传输映射 $T_\theta$ 参数化学到的先验 $p_1$：

$$
\frac{dx_\tau}{d\tau}=\nu_\theta(\tau,x_\tau),\qquad x_0\sim p_0,\qquad x_1=T_\theta(x_0),\qquad \tau\in[0,1],\tag{4}
$$

于是 $p_1=p(x_1)$ 是数据分布的先验近似。在下面考虑的所有逆问题中，$T_\theta$（等价地 $\nu_\theta$）先在代表性无条件数据上预训练一次，随后保持固定。我们用 CFM [17] 及其小批量最优传输变体（OT-CFM）[18] 训练 $\nu_\theta$。

**流匹配与条件化。** 令 $\{p_\tau\}_{\tau\in[0,1]}$ 表示连接 $p_0$ 与 $p_1$ 的（一般不可积的）边际密度路径，其关联边际速度场 $\nu(\tau,x)$ 满足连续性方程。流匹配通过在均方意义下匹配该边际速度来学习 $\nu_\theta$：

$$
\mathcal L_{\mathrm{FM}}(\theta)=\mathbb E_{\tau\sim U[0,1],\ x_\tau\sim p_\tau}\left[\left\|\nu_\theta(\tau,x_\tau)-\nu(\tau,x_\tau)\right\|_2^2\right].\tag{5}
$$

困难在于采样 $x_\tau\sim p_\tau$ 与评估边际速度 $\nu$ 都不可积。CFM 的解决办法是把边际路径表示为可积条件路径的**混合**：引入辅助变量 $z\sim q(z)$ 与条件密度 $p_\tau(\cdot|z)$，使得

$$
p_\tau(x)=\int p_\tau(x|z)q(z)dz.\tag{6}
$$

每条条件路径配有已知的条件速度 $\nu(\tau,x|z)$（按设计选取）。对于连续性方程解的混合，诱导出的边际速度满足标准恒等式 [17]

$$
\nu(\tau,x)=\mathbb E_{z\sim q(z|x,\tau)}\left[\nu(\tau,x|z)\right],\qquad q(z|x,\tau)=\frac{p_\tau(x|z)q(z)}{p_\tau(x)},\tag{7}
$$

即边际速度是混合变量下条件速度的后验期望。于是 CFM 通过从条件路径采样，把式（5）中不可积的回归目标 $\nu(\tau,x)$ 替换为可积的条件目标 $\nu(\tau,x|z)$：

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{\tau\sim U[0,1],\ z\sim q(z),\ x_\tau\sim p_\tau(\cdot|z)}\left[\left\|\nu_\theta(\tau,x_\tau)-\nu(\tau,x_\tau|z)\right\|_2^2\right].\tag{8}
$$

在 [17] 的正则条件下，$\nabla_\theta\mathcal L_{\mathrm{CFM}}$ 与 $\nabla_\theta\mathcal L_{\mathrm{FM}}$ 在相差常数的意义下一致，因此最小化（8）得到沿 $\{p_\tau\}$ 的边际速度场的一致估计量，同时避免了似然评估与 Jacobian 迹计算。

**OT-CFM 实例。** CFM 在辅助变量 $z\sim q(z)$ 及相应条件路径族 $\{p_\tau(\cdot|z),\nu(\tau,\cdot|z)\}$ 的选择上有很大灵活性。一般而言，$z$ 可编码 (i) 独立采样的端点对 $(x_0,x_1)$、(ii) $p_0$ 与 $p_1$ 之间的结构化耦合（如最优传输方案），或 (iii) 其他能给出可积中间分布与已知条件速度的潜变量构造 [18]。这些选择影响所学传输的几何结构；尤其更强的端点耦合往往使训练偏向更直的轨迹与更快的 ODE 采样。

本文使用 Tong 等 [18] 的小批量 2-Wasserstein OT 耦合。具体地，把辅助变量设为从一个小批量 OT 方案 $\pi(x_0,x_1)$ 中采样的端点对 $z=(x_0,x_1)$。对每个小批量，我们在源样本 $\{x_0^{(i)}\}_{i=1}^{B}\sim p_0$ 与数据样本 $\{x_1^{(i)}\}_{i=1}^{B}\sim p_1$ 之间构造近似的 2-Wasserstein 耦合，采样 $(x_0,x_1)\sim\pi$，并定义均值线性插值的高斯桥：

$$
p_\tau(x_\tau|x_0,x_1)=\mathcal N\left((1-\tau)x_0+\tau x_1,\ \sigma^2I\right),\tag{9a}
$$

$$
\nu(\tau,x_\tau|x_0,x_1)=x_1-x_0.\tag{9b}
$$

我们通过采样 $x_\tau\sim p_\tau(\cdot|x_0,x_1)$ 来优化（8）。OT 配对使训练偏向低代价耦合，经验上产生近乎直线的传输轨迹，从而降低（4）的数值刚性，并减少从预训练先验采样所需的 ODE 函数评估次数。训练细节（小批量 OT 求解器、$\sigma$、网络结构与优化器设置）见附录 D。

### 2.3 免训练条件化 I：引导式传输动力学

速度场引导通过在推理时修改固定、预训练 OT-CFM 先验的采样动力学，实现从后验 $p(x_1|y)$ 的免训练条件采样。其指导原则与扩散模型中的后验分数引导平行：当采样器可写成概率流 ODE 时，把先验分数替换为后验分数 $\nabla_{x_1}\log p(x_1|y)=\nabla_{x_1}\log p(x_1)+\nabla_{x_1}\log p(y|x_1)$ 会引入一个加性的似然驱动修正 [5, 34, 35]。我们在流匹配设定中采用相同结构，用近似似然梯度项增广 OT-CFM 传输速度。分数/流联系及其与概率流动力学关系的推导见附录 A。

**引导式传输 ODE。** 令 $\nu_\theta(\tau,x)$ 表示定义无条件先验传输（4）的预训练 OT-CFM 速度场。定义引导动力学

$$
\frac{dx_\tau}{d\tau}=\nu_\theta(\tau,x_\tau)+\lambda(\tau)g(\tau,x_\tau;y),\qquad\tau\in[0,1],\tag{10}
$$

其中 $\lambda(\tau)\geq0$ 为引导调度，$g$ 的选取要提升测量一致性（似然），同时与所学先验传输相容。修正场 $g$ 一般并不唯一。我们选择使其与似然分数对齐，因为 $\nabla_{x_1}\log p(y|x_1)$ 给出提升数据似然的最陡上升方向，且当把后验分数分解代入扩散模型的概率流 ODE 时它自然作为附加项出现（推导见附录 A）。实践中，由于 $F$ 定义在干净状态上而 $x_\tau$ 是中间传输状态，我们在由 $x_\tau$ 构造的去噪预测器 $\hat x_{1|\tau}$ 处评估似然梯度。假设高斯测量噪声 $p(y|x_1)=\mathcal N(F(x_1),\sigma_y^2I)$，有

$$
\nabla_{x_1}\log p(y|x_1)=-\frac{1}{\sigma_y^2}\nabla_{x_1}\left\|y-F(x_1)\right\|_2^2.\tag{11}
$$

对 OT-CFM，我们使用直线路径单步预测器

$$
\hat x_{1|\tau}=x_\tau+(1-\tau)\nu_\theta(\tau,x_\tau),\tag{12}
$$

并用插入式（plug-in）梯度定义修正方向

$$
g(\tau,x_\tau;y)\propto\nabla_{x_\tau}\log p(y|\hat x_{1|\tau})=-\frac{1}{\sigma_y^2}\nabla_{x_\tau}\left\|y-F\left(\hat x_{1|\tau}\right)\right\|_2^2.\tag{13}
$$

梯度通过 $F$（可选地，也通过预测器（12））的自动微分获得。

**Grad-free 与 Grad 实现。** 式（13）可能在 $\hat x_{1|\tau}$ 内部对 $\nu_\theta$ 反传。我们报告两种实现：(i) **Grad-free**，在（12）中对 $\nu_\theta$ 停止梯度（成本较低、修正有偏）；(ii) **Grad**，对 $\nu_\theta$ 求导（成本较高，条件化通常更锐利）。

**归一化引导与调参。** 为在不同逆问题间稳定调参，我们对数据失配梯度方向做归一化，并用用户指定的强度 $b$ 与无条件速度的幅度缩放：

$$
g(\tau,x_\tau;y)=-b\left\|\nu_\theta(\tau,x_\tau)\right\|_2\frac{\nabla_{x_\tau}\left\|y-F\left(\hat x_{1|\tau}\right)\right\|_2^2}{\left\|\nabla_{x_\tau}\left\|y-F\left(\hat x_{1|\tau}\right)\right\|_2^2\right\|_2+\varepsilon},\tag{14}
$$

其中 $\varepsilon>0$ 防止除以零。$\lambda(\tau)$ 与 $b$ 的取值见附录 D。

### 2.4 免训练条件化 II：源空间后验采样（D-Flow SGLD）

速度场引导（2.3 节）通过扰动预训练传输动力学来强制测量一致性。虽然有效且完全免训练，这一策略带来实际权衡：条件轨迹依赖引导调度与强度，修正方向通常由在去噪预测器处评估的插入式似然梯度构造。于是，强引导会使采样路径产生偏差、增加路径长度（进而增加数值刚性），并把中间状态引向所学先验支撑较差的区域。这些考虑促使我们采用一种互补的条件化机制：**保持预训练传输映射固定**，仅通过源变量上的推断来纳入测量。

**固定 OT-CFM 先验诱导的源空间后验。** 回顾预训练传输表示（4）：$x_0\sim p_0$，$x_1=T_\theta(x_0)$，且 $p_1=(T_\theta)_\#p_0$。以带似然 $p(y|x_1)$ 的观测 $y$ 为条件，在源变量上诱导出后验

$$
p(x_0|y)\propto p(y|T_\theta(x_0))p_0(x_0).\tag{15}
$$

这种**源空间引导**保持所学传输几何，并通过推前生成条件样本：

$$
x_1^{(s)}=T_\theta\left(x_0^{(s)}\right),\qquad x_0^{(s)}\sim p(x_0|y).\tag{16}
$$

**确定性源推断：D-Flow。** 通过在源空间计算 MAP 估计可得（15）的确定性实例：

$$
x_0^{\star}\in\arg\min_{x_0}\left[-\log p\left(y|T_\theta(x_0)\right)-\log p_0(x_0)\right],\qquad x_1^{\star}=T_\theta\left(x_0^{\star}\right),\tag{17}
$$

它对应 D-Flow [29]。式（17）的目标可视为数据失配项（如由 $F$ 与噪声模型诱导）加上由负对数源先验给出的显式源空间正则。对常见选择 $p_0=\mathcal N(0,I)$，有 $-\log p_0(x_0)=\frac12\|x_0\|_2^2+\text{const}$，给出一个 $\ell_2$ 正则项，使推断出的源样本保持在预训练生成器的典型集区域内；但实践中该项被忽略，因为作者证明 D-Flow 通过最小化以源样本 $x_0$ 为变量的负对数似然而被隐式正则化 [29]。更一般地，可以加入额外的问题相关惩罚（如平滑、稀疏或物理启发约束），既可作为增广的源正则项，也可作为重建状态上的惩罚项：

$$
x_0^{\star}\in\arg\min_{x_0}\left[-\log p\left(y|T_\theta(x_0)\right)-\log p_0(x_0)+\alpha R_0(x_0)+\beta R_1\left(T_\theta(x_0)\right)\right],\tag{18}
$$

其中权重 $\alpha,\beta\geq0$。实践中（17）（或使用时的（18））通过基于梯度的优化求解，需要对测量算子 $F$ 与固定传输映射 $T_\theta$（即经由 $\nu_\theta$ 定义的 ODE 求解）求导。D-Flow 返回单个高概率重建（一个后验众数），因此不提供后验不确定性。

**用于后验采样的 D-Flow SGLD。** 为超越点估计（17）并量化后验不确定性，我们提出 **D-Flow SGLD**：一种免训练的 MCMC 方法，瞄准完整的源后验（15），并通过固定传输映射 $T_\theta$ 的一次推前产生状态空间样本。

定义源空间能量，使其 Boltzmann 分布等于期望后验：

$$
U(x_0;y)=-\log p\left(y|T_\theta(x_0)\right)-\log p_0(x_0)+\alpha R_0(x_0)+\beta R_1\left(T_\theta(x_0)\right),\tag{19}
$$

于是 $p(x_0|y)\propto\exp\{-U(x_0;y)\}$。对 $p_0=\mathcal N(0,I)$，先验贡献 $-\log p_0(x_0)=\frac12\|x_0\|_2^2+\text{const}$，把推断正则化到预训练生成器的典型集区域，并稳定高维源空间中的优化。

我们用预条件随机梯度 Langevin 动力学（SGLD）[33] 从 $\exp\{-U(x_0;y)\}$ 采样：

$$
x_0^{k+1}=x_0^{k}-\eta_kP_k\nabla_{x_0}U\left(x_0^{k};y\right)+\sqrt{2\eta_k}P_k^{1/2}\xi_k,\qquad\xi_k\sim\mathcal N(0,I),\tag{20}
$$

其中 $\{\eta_k\}$ 为步长调度，$P_k\succ0$ 为（对角）自适应预条件器，由 $\nabla_{x_0}\log p(y|T_\theta(x_0))$ 的滑动二阶矩统计计算。预条件器被一致地施加于漂移项与扩散项，以在不同源坐标呈现高度各向异性曲率时改善混合。每次评估 $\nabla_{x_0}U$ 都要对测量算子 $F$ 与固定传输映射 $T_\theta$（即经由 $\nu_\theta$ 定义的 ODE 求解）求导，但无需重训 $\nu_\theta$。本文用 $M$ 个独立同分布标准高斯样本 $x_0^{(j),0}\sim\mathcal N(0,I)$ 初始化 D-Flow SGLD 的 $M$ 条并行链。为减少 burn-in 并改善多峰后验下的鲁棒性，可从部分优化的确定性源 MAP 解热启动 SGLD：具体地，用不同随机种子运行 $M$ 次独立 MAP 优化的若干步，得到候选众数集合 $\{x_{0,\mathrm{MAP}}^{(j)}\}_{j=1}^{M}$，用这些众数初始化 $M$ 条 SGLD 链：

$$
x_0^{(j),0}=x_{0,\mathrm{MAP}}^{(j)},\qquad j=1,\ldots,M.\tag{21}
$$

这种"深度集成（deep-ensemble）"做法虽然带来略高的计算成本，但产生的并行链能探索多峰后验中不同的高密度盆地，同时所有链共享同一目标能量。

burn-in 之后，我们收集源样本 $\{x_0^k\}_{k\in\mathcal K}$（可选地抽稀以降低自相关），并通过推前返回状态空间中的条件样本：

$$
x_1^{(j),k}=T_\theta\left(x_0^{(j),k}\right),\qquad j=1,\cdots,M,\ k\in\mathcal K.\tag{22}
$$

我们把（20）—（22）称为 **D-Flow SGLD**。伪代码与超参数设置（burn-in、抽稀、步长调度与预条件器构造）分别见附录 B 与附录 D。

## 3. 数值结果

### 3.1 数据生成

我们在三个数据集上评估免训练条件化，其维度与物理复杂度递增。所有情形中，生成先验在无条件训练集上训练，而条件生成在同一分布的留出验证集上进行。

**玩具分布。** 考虑两个标准二维基准：**S 曲线**与**双月**（two-moons）分布。对每个数据集，抽取 10,240 个独立同分布样本训练流匹配先验；条件实验使用留出验证集。除非另有说明，样本被各向同性高斯噪声 $\epsilon\sim\mathcal N(0,\sigma^2I)$ 扰动。完整采样细节（参数化与缩放）见附录 C。

**Kuramoto–Sivashinsky（KS）动力学。** 用 JAX-CFD [36] 的谱求解器，在长度 $L=20\pi$ 的周期域上生成一维 KS 方程的时空解轨迹 $u(x,t)$。每条轨迹存储在尺寸 $N_x\times N_t=256\times256$ 的均匀网格上，时间步 $\Delta t=0.2$。初始条件 $u(x,0)$ 采样为带随机相位与幅度的正弦模态的随机线性组合。共生成 10,000 条轨迹，并划分为训练/验证集，分别用于先验学习与条件评估。

**湍流槽道流（DNS）。** 使用摩擦 Reynolds 数 $Re_\tau=180$ 的不可压槽道流直接数值模拟（DNS），由我们自研的 GPU CFD 求解器 Diff-FlowFSI [37] 计算。从模拟中提取壁面法向位置 $y^+=40$ 处速度涨落 $u'=[u',v',w']$ 的 21,900 个快照，采样无量纲间隔 $\Delta t^+=0.4$。每个快照由原始 $n_x\times n_z=320\times200$ 网格经双三次插值降采样到 $128\times128$。条件生成在未用于训练的留出验证集上评估。

### 3.2 评估指标

我们用两个互补准则评估条件生成：(i) **测量同化**，即生成样本在测量算子下是否与观测数据一致；(ii) **先验/物理保真度**，即条件样本在所学数据分布（若可用，还包括控制物理）下是否仍然合理。第一个准则对所有数据集通用，第二个准则因案例而异，因为"保真度"对玩具分布、PDE 轨迹与湍流场有不同的操作定义。

**测量同化（数据失配）。** 对每个带观测 $y$ 的验证实例，生成 $N$ 个条件样本 $\{\hat x_1^{(i)}\}_{i=1}^{N}$，并计算预测测量 $\hat y^{(i)}=F(\hat x_1^{(i)})$。我们报告平均绝对误差（MAE）

$$
\mathrm{MAE}(y)=\frac1N\sum_{i=1}^{N}\frac1m\left\|\hat y^{(i)}-y\right\|_1,\tag{23}
$$

并在所有验证实例上平均。

**案例相关的先验/物理保真度。** 在科学逆问题中，仅测量一致性并不充分：条件方法可能匹配测量，却产生偏离所学流形或违反物理的样本。因此我们用针对各数据集定制的指标评估保真度。

对 2D 玩具问题，我们构造高质量参考后验 $p(\cdot|y)$（通过重要性重采样），并用 1-Wasserstein 距离量化分布一致性：

$$
W_1\left(p(\cdot|y),\hat p(\cdot|y)\right)=\inf_{\gamma\in\Pi\left(p(\cdot|y),\hat p(\cdot|y)\right)}\mathbb E_{(x,\hat x)\sim\gamma}\left[\|x-\hat x\|_2\right],\tag{24}
$$

其中 $\Pi(\cdot,\cdot)$ 表示所有以 $p(\cdot|y)$ 与 $\hat p(\cdot|y)$ 为边际的联合分布的集合。我们辅以条件样本可视化来诊断流形违反。

对 KS 动力学，我们用有限差分在生成轨迹上计算 PDE 残差来衡量物理保真度：

$$
\begin{aligned}
R_j^n={}&\frac{u_j^{n+1}-u_j^{n-1}}{2\Delta t}+u_j^n\frac{u_{j+1}^n-u_{j-1}^n}{2\Delta x}\\
&+\frac{u_{j+1}^n-2u_j^n+u_{j-1}^n}{(\Delta x)^2}+\frac{u_{j+2}^n-4u_{j+1}^n+6u_j^n-4u_{j-1}^n+u_{j-2}^n}{(\Delta x)^4},
\end{aligned}\tag{25}
$$

其中 $u_j^n\approx u(j\Delta x,n\Delta t)$ 是空间步长 $\Delta x$、时间步长 $\Delta t$ 的离散网格上的数值解。我们用平均绝对残差 $\frac{1}{N_xN_t}\sum_{j,n}|R_j^n|$ 概括物理一致性，并对条件样本与验证实例平均。

对湍流槽道流数据集，保真度用流向（$k_x$）与展向（$k_z$）的一维湍动能（TKE）谱评估。令 $\hat u_i(k)$ 表示第 $i$ 个速度分量沿某一均匀方向的离散 Fourier 变换，计算

$$
E_{u_iu_i}(k)=k\left\langle\hat u_i(k)\hat u_i^{*}(k)\right\rangle,\tag{26}
$$

其中 $\langle\cdot\rangle$ 表示在正交均匀方向与集合成员上平均。匹配这些谱表明条件样本在点对点匹配测量之外，仍保持湍流特征性的多尺度能量分布。

### 3.3 案例 1：玩具逆问题

我们先从两个二维基准（S 曲线与双月）开始，作为条件采样的受控试验台。这些案例允许 (i) 直接可视化条件分布，以及 (ii) 与高质量参考后验做定量比较，因而适合诊断测量同化与先验保真度之间的权衡。

我们考虑两个诱导定性不同后验的观测算子：

$$
F_1(x)=5|x_0-x_1|,\qquad p(y|x)=\mathcal N\left(F_1(x),0.01\right),
$$

$$
F_2(x)=x_0+x_1-1.5,\qquad p(y|x)=\mathcal N\left(F_2(x),0.1\right).
$$

算子 $F_1$ 给出尖锐集中的后验，类似强制物理约束（如守恒律）的场景；而 $F_2$ 因测量噪声更高而产生明显更宽的后验。对每个算子，我们用重要性重采样构造经验参考后验，并与四种免训练方法生成的条件样本比较：速度场引导（Grad / Grad-Free）与源空间推断（D-Flow / D-Flow SGLD）。

图 1 与图 2 给出代表性观测下从所学先验采样的无条件样本（灰色）与条件样本（橙色）。在两个数据集上，源空间方法（D-Flow 与 D-Flow SGLD）产生的条件样本大体仍支撑在所学数据流形上，即橙色点大多位于或接近灰色 S 曲线/双月几何上；例外是当目标后验占据分布极端尾部时的 D-Flow（见图 2 底行）。相比之下，速度场引导（Grad 与 Grad-Free）倾向于把似然信号直接注入采样动力学，可在牺牲先验保真度的情况下强制测量一致性：不可忽略比例的条件样本明显偏离灰色流形并落入流形外区域。当引导强度增大时该效应尤为明显（见附录 E），表明动力学层面引导可能被似然项过度主导，从而扭曲所学分布。第二个定性区别是多样性：D-Flow 往往给出更尖锐、更集中的条件样本，这与对每个样本做确定性源优化一致；D-Flow SGLD 生成的样本更分散，反映源空间中的随机探索，这在较宽后验设定中能更好保持后验多样性，但也可能引入低概率样本，相对参考表现为更厚的支撑或弱的额外模态。

为定量评估分布精度，我们计算经验条件分布与经验参考后验之间的 1-Wasserstein 距离 $W_1$（表 1，越小越好）。当后验尖锐集中时（$F_1(\cdot)$ 测量似然下），D-Flow 达到最优，D-Flow SGLD 次之；相反，在诱导更弥散后验的测量似然 $F_2(\cdot)$ 下，其他方法性能急剧退化：特别地，引导式传输方法（Grad 与 Grad-Free）与确定性 D-Flow 的 1-Wasserstein 距离显著更高。在这些较宽后验区制中，D-Flow SGLD 取得最低 $W_1$，证实随机源空间推断具有更优鲁棒性。

最后，Grad 与 Grad-Free 对引导强度 $b$ 敏感：随着 $b$ 增大，条件样本逐渐更多受似然影响，可能降低数据失配，但也增加流形外行为。我们在附录 E（图 E.11）给出对 $b$ 的受控比较，说明基于引导的方法需要针对任务调参才能在同化与先验保真度之间取得平衡。

### 3.4 案例 2：Kuramoto–Sivashinsky 动力学

我们接着评估一维 KS 系统逆问题的免训练条件化，其中每个样本是时空场 $x\equiv u(x,t)\in\mathbb R^{N_x\times N_t}$。我们用 U-Net 速度模型 $\nu_\theta(\tau,x)$ 训练 OT-CFM 先验（结构细节见附录 D）。测试时不重训 $\nu_\theta$，以部分观测为条件，比较四种免训练方法：Grad、Grad-Free、D-Flow 与我们的 D-Flow SGLD。

对混沌动力学，我们考虑两个典型的条件采样任务。第一个是**单次时间预报**：给定前 $r$ 个时间帧，采样未来段 $t>r$，即从 $p\left(u(x,t)\,\middle|\,u(x,t\leq r)\right)$ 采样。相应测量算子提取已观测前缀：

$$
y=F_1(u)\equiv u(x,t\leq r).\tag{27}
$$

第二个任务是从随机散布在时空域中的一组传感器位置 $\mathcal S=\{(\hat x_\ell,\hat t_\ell)\}_{\ell=1}^{|\mathcal S|}$ 的点测量重建完整时空场。测量算子 $F_2$ 从完整场中提取传感器测量：

$$
y=F_2(u)\equiv\left\{u(\hat x_\ell,\hat t_\ell)\right\}_{\ell=1}^{|\mathcal S|}.\tag{28}
$$

为考察鲁棒性，我们评估**无噪声**观测与受 10% 加性噪声（相对于归一化所用信号尺度）污染的观测。

遵循 3.2 节，我们把**测量同化**（观测区域内的 MAE）与**先验/物理保真度**（KS PDE 残差）分开。图 3 与图 4 分别可视化无噪声与含噪测量下的时间预报。上排展示测量（第一列）与每种方法的一个代表性条件样本；白线标出条件边界 $t=r$，$t>r$ 区域为预报窗口。对每种方法，我们由给定 $y$ 生成条件样本集合，并展示随机选取的一个实现；对 Grad、Grad-Free 与 D-Flow SGLD 生成 100 个样本，对 D-Flow 因其推理成本显著更高（表 2）只生成 20 个样本。无噪声情形（图 3）中，所有方法都给出视觉上连贯的观测前缀延续，在条件边界处没有明显接缝。在 10% 测量噪声下（图 4），差异更明显：Grad-Free 在 $t=r$ 附近呈现尖锐界面，表明对污染观测的敏感性；相反，D-Flow 与 D-Flow SGLD 给出的延续更平滑，与先验学到的时空结构在视觉上保持一致。图 3—4 的中排可视化观测区域上的逐点 MAE。如动力学层面引导所预期，Grad 与（稳定时的）Grad-Free 通过把似然信息直接注入采样动力学，取得比源空间方法更低的 MAE，在无噪声情形误差尤其小。底排用 KS 残差 $R_j^n$ 评估物理保真度：残差大表明违反控制 KS 方程。无噪声设定中所有方法残差都相对较小，说明生成轨迹仍接近 KS 一致动力学；但在含噪测量下，Grad 与 Grad-Free 在整个场内产生明显更大的残差。重要的是，残差增大并不限于预报窗口 $t>r$，在**观测区域** $t\leq r$ 尤其升高，表明引导会以破坏 KS 一致性的方式过拟合测量噪声——即使在数据被强制约束的地方也是如此。相反，D-Flow 与 D-Flow SGLD 在含噪情形保持显著更低的残差，说明源空间推断对污染观测更鲁棒：它避免了迫使轨迹匹配噪声。我们在稀疏传感器重建任务中观察到相同的定性趋势；更多结果见附录 F。

图 5 用平均绝对 KS 残差 $\bar R=\frac{1}{N_tN_x}\sum_{n=1}^{N_t}\sum_{j=1}^{N_x}|R_j^n|$ 汇总各验证实例上的物理保真度，以每个验证实例与场景的条件样本上的均值（柱高）与标准差（误差棒）报告。在两个逆问题（时间预报与稀疏传感器重建）与两种噪声水平下，D-Flow SGLD 都取得一致最低的残差，表明即使观测被污染，也能稳健遵循控制 KS 动力学。D-Flow 在若干设定下达到相近的平均残差，但在某些情形方差显著更大，这与确定性源优化对条件实例和优化景观的敏感性一致；此外，其高推理成本限制实际集合生成。Grad 与 Grad-Free 在无噪声测量下残差中等，但在 10% 噪声下急剧退化，$\bar R$ 增加数量级；对 Grad 尤其出现明显波动（大 STD）。这一行为与动力学层面引导过度同化含噪观测、从而牺牲 KS 一致性并降低条件样本可靠性相符。

### 3.5 案例 3：壁面约束湍流

最后一个案例中，我们从壁面法向位置 $y^+=40$ 的湍流槽道流学习近壁速度涨落 $x\equiv u'$ 上的无条件 OT-CFM 先验。近壁涨落在壁面约束湍流的自维持机制中起核心作用。虽然壁面约束湍流的高保真 DNS/LES 求解器已成熟，但把稀疏、含噪的实验测量纳入此类模拟在实践中仍具挑战，尤其当我们希望得到不确定性感知的重建而非单个最佳拟合场时。本案例研究中，我们展示学到的 OT-CFM 先验 $\nu_\theta(\tau,x)$ 与免训练条件化结合，为在保持湍流相关多尺度结构的同时获得测量一致重建提供了实用途径。为此考虑"损坏数据"修补场景：空间场的一段连续区域未被观测，必须用与可用测量一致且忠实于湍流统计的样本进行填补。由于湍流应用通常需要大集合才能得到收敛统计，我们在此案例中因 D-Flow 推理成本过高而不予考虑。

令 $F$ 表示提取涨落场已观测区域的测量算子：

$$
u'(a_l\leq x\leq a_u,\ b_l\leq z\leq b_u)=F(u'),\tag{29}
$$

其中 $a_l,a_u$ 与 $b_l,b_u$ 分别表示流向（$x$）与展向（$z$）可用数据的上下界。这种部分观测形式在实验与模拟中都很常见：例如实验诊断往往只在有限空间窗口或选定平面上给出测量，而高保真模拟数据可能因欠采样、I/O 限制或存储与后处理中的数据损坏而缺失。我们评估无噪声测量与受 10% 加性噪声（相对）污染的测量，条件化协议与前两个案例相同。

图 6 与图 7 分别给出无噪声与含噪测量下代表性条件样本（上排）和观测区域上的逐点 MAE（下排）。无噪声设定中，Grad 与 Grad-Free 在观测区域达到接近零的 MAE，表明测量同化非常强；D-Flow SGLD 的 MAE 略大，这与随机后验采样不会把质量全部集中在最小失配解上一致。视觉上，所有方法都产生类似真实近壁条带结构的修补场，且所展示样本中修补区域在测量边界处没有明显不连续。在 10% 噪声污染下（图 7），同化与保真度之间的权衡变得明显：Grad 与 Grad-Free 仍把观测区域 MAE 压到接近零，但重建场明显继承了含噪测量中的高频伪影，说明引导可能把测量噪声印入条件样本。相反，D-Flow SGLD 保持与无噪声情形相当的 MAE，并给出受噪声污染更小的重建，表明观测不可靠时鲁棒性更好。

逐点数据失配不能诊断重建是否跨尺度保持湍流物理/统计性质。因此我们用流向 $k_x$ 与展向 $k_z$ 的一维能谱评估物理保真度（3.2 节）。图 8 把流向分量（$u_1$）的谱与真值谱比较（其他分量 $u_i$，$i\in\{2,3\}$ 见附录 G）。无噪声区制（图 8a）中，所有方法在低波数处都与真值吻合良好，捕捉到大尺度含能结构；差异出现在更高波数：Grad 与 Grad-Free 在高 $k$ 能量上系统性亏缺，表明条件样本丢失了小尺度内容，而 D-Flow SGLD 在全部波数范围内更贴近真值谱。在含噪测量场景（图 8b）中，速度场引导的谱偏差被放大：Grad 在中高波数处呈现明显衰减，给出过度平滑的重建。

> **原文疑点：** 原文此处连续出现两句语义高度重复的表述——"The Grad method exhibits a pronounced decay at moderate-to-high wavenumbers, yielding an overly smoothed reconstruction" 与 "Grad shows an accelerated roll-off at moderate-to-high wavenumbers, yielding overly smooth reconstructions that underrepresent small-scale fluctuations"；疑为修订时的重复表述。本页按原意合译并加注，未删改原文含义。

Grad-Free 在最高波数处表现出相反趋势，注入过多高 $k$ 能量，这与把测量噪声当作虚假小尺度内容纳入一致。D-Flow SGLD 在 $k_x$ 与 $k_z$ 上都最接近真值谱，表明随机源空间推断更好地平衡了测量信息与所学湍流先验：它抑制非相干噪声，同时保留相干多尺度结构。

总体而言，湍流实验强化了 KS 案例中观察到的核心模式：速度场引导（Grad/Grad-Free）能取得非常小的数据同化误差，但对测量噪声敏感，且可能扭曲多尺度统计；而 D-Flow SGLD 产生更鲁棒的条件样本，更好地保持物理相关谱结构。

## 4. 讨论

本节从机理上解释 D-Flow SGLD 为何在保持计算可扩展的同时给出鲁棒条件样本。先用一个玩具问题，利用 OT-CFM 的可逆性可视化条件解在源分布中的表示方式。这一视角揭示确定性源空间优化（D-Flow）的一种失效模式：过度强制测量一致性会把解推入源先验的低密度区域，进而在传输到目标空间后产生流形外伪影。随后说明 D-Flow SGLD 的随机源空间采样动力学与我们方法中定义的源空间先验项如何通过促进更校准的后验探索来缓解该问题。最后讨论计算成本，说明 D-Flow SGLD 显著降低生成大集合的摊销成本。

### 4.1 源空间中的后验几何：确定性优化 vs. 随机采样

基于流的模型的一个关键特性是**可逆性**。通过积分负速度场 $-\nu_\theta(\tau,x)$，目标分布 $x_1\sim p_1(x)$ 的样本可映回源分布 $x_0\sim p_0(x)$。这使条件解在源空间中的可视化成为可能：给定后验样本 $x_1\sim p_1(x|y)$，计算

$$
x_0=x_1+\int_1^0\left(-\nu_\theta(\tau,x_\tau)\right)d\tau.\tag{30}
$$

由于 OT-CFM 学到 $p_0$ 与 $p_1$ 之间近似直线的传输路径，我们预期后验几何（如模态分离）在该逆映射下得以保持。

图 9 支持这一假设：条件分布中不同模态在映回源空间后仍保持分离。同时，图 9 揭示了确定性源空间优化（D-Flow）的一个重要局限。虽然 D-Flow 可以从不同随机种子初始化（得到一组独立优化的源点）从而产生多样的条件输出，但每个样本都经由强烈优先满足测量的确定性优化轨迹得到。结果，一些被优化的源点被驱入源先验下的低概率区域（即远离中心高斯）。前向传输后，这些低密度源配置会在目标空间中表现为流形外或退化的样本，与图 1、图 2 观察到的失效模式一致。因此，这一源空间视角为确定性优化在含噪或部分信息测量下可能脆弱提供了具体的几何解释：测量过拟合可以通过离开所学先验的高密度区域来实现。

这一观察也澄清了我们 D-Flow SGLD 中源空间先验项的作用。具体地，D-Flow SGLD 瞄准一个在测量一致性与源先验合理性之间平衡的正则化目标：

$$
\min_{x_0}\left\|y-F\left(x_1(x_0)\right)\right\|_2^2+\lambda\left\|x_0\right\|_2^2,\tag{31}
$$

其中 $x_1(x_0)$ 表示 $x_0$ 在学到的速度场 $\nu_\theta$ 下的前向传输，$\lambda$ 控制源空间先验惩罚强度。重要的是，与多起点确定性优化不同，D-Flow SGLD 引入随机源空间动力学（经由 Langevin 更新），从而能探索高概率源配置的邻域，而不是每次运行都锁定单个优化点。

图 10 展示该机制的效果。若不强制源空间合理性，优化可能把条件解推离 $p_0$ 的典型集很远；而在源先验项与随机探索下，条件样本大体仍位于源的高密度区域内，同时仍反映测量诱导的后验结构。这带来更校准的后验探索并缓解流形外生成，为 D-Flow SGLD 在不利条件下的鲁棒性提供了直接解释。

### 4.2 计算成本

多数免训练引导方法把一组初始源点映射为相同数量的目标样本，使成本随所需集合规模线性增长。当需要大集合来估计收敛的后验统计时（如湍流），这变得不可承受。确定性源空间优化（D-Flow）在该区制下尤为昂贵，因为每个后验样本都需要单独的优化求解。

D-Flow SGLD 提供了更划算的替代方案。作为基于 MCMC 的方法，一旦达到 burn-in，单条链就能以很低的增量成本生成许多相关样本，相比基于独立优化的采样降低了每个后验样本的摊销成本。

> **原文疑点：** 原文（PDF 第 25 页）在该句与下一句之间插入了 "Gemini said" 字样，疑为写作/编辑过程残留的生成式文本；本页照录并加注，不将其视为作者论述内容。

表 2 汇总实际耗时（wall-clock）推理成本，玩具问题使用单块 NVIDIA L40 GPU，更高维的 KS 与湍流案例使用单块 NVIDIA A100 GPU。这些指标明确凸显了计算速度与方法鲁棒性之间的操作权衡。Grad-Free 最快，但精度较低且对测量噪声更敏感；D-Flow 准确，但对大规模问题成本过高；Grad 准确但仍可能昂贵。D-Flow SGLD 取得有利平衡：以显著低于 D-Flow、并可与基于梯度的引导竞争（约 2× 加速）的成本，产生鲁棒且物理合理的条件样本，使其成为复杂科学与工程设定中大集合条件生成的实用策略。

## 5. 结论

我们研究了使用预训练 FM 先验的科学逆问题免训练条件生成，重点是部分、含噪观测下仍忠实于所学物理结构的后验采样。我们把推理期条件化策略组织为两族：(i) 速度场引导，通过扰动采样期间的传输动力学注入似然信息；(ii) 源空间推断，保持所学传输映射固定，转而对源变量做后验推断，其推前给出测量一致的状态。基于源空间视角，我们提出 D-Flow SGLD——一种瞄准诱导源后验的预条件 SGLD 采样器，实现免重训 FM 先验的不确定性感知条件采样。

在一组分层基准上——包括 2D 玩具后验、混沌 KS 动力学与壁面约束湍流重建——我们观察到一致的同化—保真度权衡。动力学层面引导方法能取得非常小的同化误差，但对引导强度敏感，且会过拟合污染观测，导致物理一致性退化（如 KS 残差升高）与多尺度湍流统计扭曲（如高波数谱偏差）。确定性源优化（D-Flow）能给出准确的条件重建，但对大集合计算昂贵，且表现出依实例而变的波动。相反，D-Flow SGLD 提供了鲁棒的折中：在显式先验项下于源空间采样，它能更好地避免产生流形外伪影的"追尾"行为，在噪声下保持物理/统计保真度，并降低产生科学不确定性量化所需大条件集合的摊销成本。

这些结果凸显了源空间后验采样作为 FM 先验在科学逆问题中实用且可扩展的条件化机制，并推动未来在改进混合诊断（如有效样本数）、更丰富的源空间正则化，以及扩展到更复杂观测算子与更高 Reynolds 数湍流方面的工作。

## 致谢

作者感谢美国海军研究办公室（Office of Naval Research，Award No. N00014-23-1-2071）与美国国家科学基金会（National Science Foundation，Award No. OAC-2047127）的资助。

## 生成式 AI 使用声明

在本工作准备过程中，作者使用 ChatGPT 等大语言模型润色语法并提升稿件可读性。

## 图注与表注

### 表 1：玩具逆问题中有参考后验的 1-Wasserstein 距离（原 PDF 第 15 页）

| 方法 | S 曲线 $\mathcal F_1(\cdot)$ | S 曲线 $\mathcal F_2(\cdot)$ | 双月 $\mathcal F_1(\cdot)$ | 双月 $\mathcal F_2(\cdot)$ |
|---|---|---|---|---|
| D-Flow | **0.189** | 0.449 | **0.056** | 0.251 |
| D-Flow SGLD（本文） | <u>0.234</u> | **0.171** | <u>0.073</u> | **0.160** |
| Grad（$b=3$） | 0.357 | 0.625 | 0.129 | 0.603 |
| Grad-Free（$b=3$） | 0.442 | 0.596 | 0.132 | 0.559 |

> 原表说明：1-Wasserstein 距离 $W_1$（重要性重采样的经验参考后验与经验条件分布之间，越小越好）；最优与次优结果分别以粗体与下划线标出。

### 表 2：各方法的实际推理耗时（原 PDF 第 26 页）

| 案例 | D-Flow | D-Flow SGLD | Grad | Grad-Free |
|---|---|---|---|---|
| 玩具（$N=1000$） | 65 | 8 | 8 | 5 |
| KS（$N=100$） | 12000* | 578 | 1114 | 363 |
| 湍流（$N=1000$） | 200500† | 928 | 1841 | 840 |

> 原表说明：免训练条件生成方法的实际耗时（秒），玩具案例用单块 NVIDIA L40 GPU，其余案例用单块 NVIDIA A100 80GB GPU；$N$ 表示生成的后验样本数；* 与 † 分别表示由生成 20 与 1 个样本外推得到的成本（原文脚注中 "*" 号在 PDF 渲染中显示不完整，此处按表体标记补注）。

### 表 D.3：各案例免训练引导方法的超参数（原 PDF 第 32 页）

| 案例 | 方法 | 超参数设置 |
|---|---|---|
| 玩具 | D-Flow | $N_{optim}=10$（S 曲线）、20（双月）；ODE 求解器 = midpoint，6 步；优化器 = LBFGS；$\alpha=0$、$\beta=0$ |
| 玩具 | D-Flow SGLD | $N_{parallel}=10$；$N_{steps}=500$，burn=100；$\eta(i)=5\times10^{-2}$；$s(i)=1\times10^{-2}$，$\lambda=0.1$（S 曲线）/0.05（双月）；$\omega=0.99$；$\delta(i)=1\times10^{-3}$；ODE 求解器 = midpoint，6 步；$\alpha=0$、$\beta=0$ |
| 玩具 | Grad / Grad-Free | $\lambda(\tau)=1$；$b=\{1,3,10\}$；ODE 求解器 = euler，300 步 |
| KS | D-Flow | $N_{optim}=10$；ODE 求解器 = midpoint，6 步；优化器 = LBFGS；$\alpha=0$、$\beta=0$ |
| KS | D-Flow SGLD | $N_{parallel}=2$；$N_{steps}=300$，burn=100；$\eta(i)=1\times10^{-2}$；$s(i)=1\times10^{-3}$，$\lambda=1\times10^{-3}$；$\omega=0.99$；$\delta(i)=1\times10^{-3}$；ODE 求解器 = midpoint，6 步；$\alpha=0$、$\beta=0$ |
| KS | Grad / Grad-Free | $\lambda(\tau)=1$；$b=1$；ODE 求解器 = euler，300 步 |
| 湍流 | D-Flow | $N_{optim}=100$；ODE 求解器 = midpoint，6 步；优化器 = LBFGS；$\alpha=0$、$\beta=0$ |
| 湍流 | D-Flow SGLD | $N_{parallel}=20$；$N_{steps}=600$，burn=100；$\eta(i)=5\times10^{-2}$；$s(i)=1\times10^{-3}$，$\lambda=5\times10^{-6}$；$\omega=0.99$；$\delta(i)=1\times10^{-3}$；ODE 求解器 = midpoint，6 步；$\alpha=0$、$\beta=0$ |
| 湍流 | Grad / Grad-Free | $\lambda(\tau)=1$；$b=1$；ODE 求解器 = euler，300 步 |

### 图注

**图 1（原 PDF 第 13 页）：** S 曲线玩具逆问题。条件后验样本（$N=1000$，橙色）叠加在无条件 OT-CFM 样本（灰色）上。对速度场引导，修正强度取 $b=3$。子图为 Ground Truth、D-Flow、D-Flow SGLD（本文）、Grad、Grad-Free 的对比。

**图 2（原 PDF 第 14 页）：** 双月（moon-curve）玩具逆问题。条件后验样本（$N=1000$，橙色）叠加在无条件 OT-CFM 样本（灰色）上。对速度场引导，修正强度取 $b=3$。子图同上。

**图 3（原 PDF 第 16 页）：** 无噪声测量下的 KS 时间预报。上排：第一列为真值测量，其后为各方法条件生成的样本；白线以下（$t>r$）为预报部分。中排：逐点数据同化误差（MAE）。下排：在整个生成场上计算的 PDE 残差 $R_j^n$，用于评估物理合理性。

**图 4（原 PDF 第 17 页）：** 10% 噪声污染下的 KS 时间预报。布局同图 3。

**图 5（原 PDF 第 18 页）：** 不同引导方法在 KS 系统中的平均绝对 PDE 残差 $\bar R$。两个逆问题：时间预报（a-b）与稀疏传感器重建（c-d）；每个问题都测试无噪声测量（a、c）与 10% 噪声污染测量（b、d）。柱高表示平均残差，误差棒表示生成样本间的标准差。

**图 6（原 PDF 第 20 页）：** 无噪声测量下的湍流修补（$u_1$）。上：观测场（第一列）与各方法的一个代表性条件样本；斜线阴影区域（$x>2\pi$）表示缺失/被修补的部分。下：观测区域上的逐点 MAE。

**图 7（原 PDF 第 20 页）：** 含 10% 噪声测量下的湍流修补（$u_1$）。布局同图 6。

**图 8（原 PDF 第 22 页）：** $y^+=40$ 处流向速度分量 $u_1$ 的流向（右）与展向（左）一维能谱比较。(a) 无噪声情形；(b) 含噪污染情形。

**图 9（原 PDF 第 24 页）：** 对 S 曲线玩具问题分别使用测量函数 $\mathcal F_1(\cdot)$（左）与 $\mathcal F_2(\cdot)$（右）执行 D-Flow 算法优化后得到的 1000 个源分布样本。灰点表示无条件高斯分布的样本，橙色样本表示用 D-Flow 算法优化源项后生成的样本。

**图 10（原 PDF 第 25 页）：** 对 S 曲线玩具问题分别使用 $\mathcal F_1(\cdot)$（左）与 $\mathcal F_2(\cdot)$（右）执行 D-Flow SGLD 算法优化后得到的 1000 个源分布样本。灰点表示无条件高斯分布的样本；橙色点表示用 D-Flow 算法优化后生成的样本；青色点表示使用源项正则的 D-Flow SGLD 算法生成的样本。

**图 E.11（原 PDF 第 33 页）：** 测量算子 $\mathcal F_1(\cdot)$ 下引导尺度 $b$ 对 S 曲线玩具问题条件样本的影响。列为 Ground Truth、Scale=1、Scale=3、Scale=10；行为 Grad 与 Grad-Free。

**图 F.12（原 PDF 第 35 页）：** 无噪声测量下的 KS 稀疏传感器重建。上排：第一列为真值测量，其后为各方法条件生成的样本；白线以下（$t>r$）为预报部分。中排：逐点数据同化误差（MAE）。下排：在整个生成场上计算的 PDE 残差 $R_j^n$。

**图 F.13（原 PDF 第 35 页）：** 含 10% 噪声测量下的 KS 稀疏传感器重建。布局同图 F.12。

**图 G.14（原 PDF 第 36 页）：** 无噪声测量下的湍流修补（$u_2$）。上：观测场（第一列）与各方法的一个代表性条件样本；斜线阴影区域（$x>2\pi$）表示缺失/被修补的部分。下：观测区域上的逐点 MAE。

**图 G.15（原 PDF 第 36 页）：** 无噪声测量下的湍流修补（$u_3$）。布局同图 G.14。

**图 G.16（原 PDF 第 37 页）：** 含 10% 噪声测量下的湍流修补（$u_2$）。布局同图 G.14。

**图 G.17（原 PDF 第 37 页）：** 含 10% 噪声测量下的湍流修补（$u_3$）。布局同图 G.14。

**图 G.18（原 PDF 第 38 页）：** $y^+=40$ 处壁面法向速度分量 $u_2$ 的流向（右）与展向（左）一维能谱比较。(a) 无噪声情形；(b) 含噪污染情形。

**图 G.19（原 PDF 第 39 页）：** $y^+=40$ 处展向速度分量 $u_3$ 的流向（右）与展向（左）一维能谱比较。(a) 无噪声情形；(b) 含噪污染情形。

## 附录 A：与基于分数的后验引导的联系（原 PDF 第 28—29 页）

本附录给出 2.3 节所用速度场引导的推导。先回顾基于分数的扩散模型的概率流 ODE 表述 [34]，再说明贝叶斯法则在瞄准后验 $p(x_1|y)$ 时如何诱导出加性似然驱动修正。最后总结 DPS 近似 [5, 35]，并解释其与我们 OT-CFM 引导传输中所用插入式似然梯度代理的联系。

考虑把干净数据 $x_1\sim p_1$ 变换为含噪变量 $x_\tau$ 的前向扩散过程，由 Itô SDE 给出：

$$
dx=f(\tau,x_\tau)d\tau+g(\tau)dw_\tau,\tag{A.1}
$$

其中 $w_\tau$ 为标准 Brown 运动。在标准正则条件下，时间反演过程也是 SDE，其漂移涉及分数 $\nabla_x\log p_\tau(x_\tau)$ [34]：

$$
dx=\left[f(\tau,x_\tau)-g(\tau)^2\nabla_x\log p_\tau(x_\tau)\right]d\tau+g(\tau)d\bar w_\tau,\tag{A.2}
$$

其中 $\bar w_\tau$ 表示反向时间 Brown 运动。具有相同边际密度 $\{p_\tau\}_{\tau\in[0,1]}$ 的确定性采样器由概率流 ODE（PF-ODE）给出 [34]：

$$
\frac{dx_\tau}{d\tau}=f(\tau,x_\tau)-\frac12g(\tau)^2\nabla_x\log p_\tau(x_\tau).\tag{A.3}
$$

显然，PF-ODE 的修正漂移项（右端）就是 CFM 中的传输速度。

令 $y$ 表示由似然模型 $p(y|x_1)$（如 2.1 节的测量方程）生成的观测。贝叶斯法则给出 $p(x_1|y)\propto p(x_1)p(y|x_1)$，因此

$$
\nabla_{x_1}\log p(x_1|y)=\nabla_{x_1}\log p(x_1)+\nabla_{x_1}\log p(y|x_1).\tag{A.4}
$$

在扩散后验采样中，中间时刻有类似恒等式，给出 $\tau$ 处的后验分数 $\nabla_{x_\tau}\log p_\tau(x_\tau|y)=\nabla_{x_\tau}\log p_\tau(x_\tau)+\nabla_{x_\tau}\log p_\tau(y|x_\tau)$。把后验分数分解代入 PF-ODE，得到后验概率流 ODE：

$$
\frac{dx_\tau}{d\tau}=f(\tau,x_\tau)-\frac12g(\tau)^2\nabla_x\log p_\tau(x_\tau|y)=\underbrace{\left[f(\tau,x_\tau)-\frac12g(\tau)^2\nabla_x\log p_\tau(x_\tau)\right]}_{\text{先验 PF-ODE 漂移（速度）}}-\underbrace{\frac12g(\tau)^2\nabla_x\log p_\tau(y|x_\tau)}_{\text{似然驱动修正}}.\tag{A.5}
$$

因此，相对于无条件（先验）采样器，以 $y$ 为条件引入一个正比于似然分数的加性修正项。这是扩散模型 [5, 34, 35] 中后验分数引导以及 CFM 模型中速度场引导的概念基础。

### 附录 A.1 DPS 近似与插入式似然梯度

一个关键实践困难是 $\nabla_x\log p_\tau(y|x_\tau)$ 通常不可积，因为 $x_\tau$ 是含噪/中间变量，而测量算子 $F$ 定义在干净状态 $x_1$ 上。扩散后验采样（DPS）[5, 35] 通过 (i) 由 $x_\tau$ 构造去噪预测器 $\hat x_{1|\tau}$，以及 (ii) 使用插入式梯度来近似似然分数：

$$
\nabla_{x_\tau}\log p_\tau(y|x_\tau)\approx\nabla_{x_\tau}\log p(y|\hat x_{1|\tau}).\tag{A.6}
$$

对高斯测量噪声 $p(y|x_1)=\mathcal N(F(x_1),\sigma_y^2I)$，插入式梯度变为

$$
\nabla_{x_\tau}\log p(y|\hat x_{1|\tau})=-\frac{1}{\sigma_y^2}\nabla_{x_\tau}\left\|y-F\left(\hat x_{1|\tau}\right)\right\|_2^2,\tag{A.7}
$$

其中梯度通过自动微分对 $F$ 与预测器 $\hat x_{1|\tau}$ 计算。

### 附录 A.2 从扩散引导到流匹配引导传输

流匹配学习传输速度场 $\nu_\theta(\tau,x)$，经由 ODE（4）把 $p_0$ 映到 $p_1$，而无需显式指定 $(f,g)$。尽管如此，受式（A.5）中加性修正结构启发，我们采用引导传输形式

$$
\frac{dx_\tau}{d\tau}=\nu_\theta(\tau,x_\tau)+\lambda(\tau)g(\tau,x_\tau;y),\tag{A.8}
$$

其中 $g$ 选择为与 DPS 插入式似然梯度（A.7）对齐。对 OT-CFM，桥构造（9）意味着近似直线轨迹，这促使主文使用直线路径预测器：

$$
\hat x_{1|\tau}=x_\tau+(1-\tau)\nu_\theta(\tau,x_\tau).\tag{A.9}
$$

把（A.9）代入（A.7）即得 2.3 节所用的代理梯度。

## 附录 B：预条件 D-Flow SGLD 的算法（原 PDF 第 30—31 页）

D-Flow SGLD 方法总结于算法 1，是一种基于并行 MCMC 的方法，通过在源（潜）空间 $x_0$ 中迭代更新样本来从后验分布采样。每次迭代由四个主要步骤组成。

**算法 1：D-Flow SGLD**

1. **Require:** $\nu_\theta$、$N_{parallel}$、$N_{steps}$、burn、$x_0^{(0)}$、$y$、$F$、$R$、$\lambda$、$\omega$、$\eta$、$\delta$、$s$
2. `collect = []`
3. **do in parallel for** $1:N_{parallel}$
4. $\quad$ **for** $i\leftarrow1:N_{steps}$ **do**
5. $\quad\quad$ $x_1^{(i-1)}\leftarrow x_0^{(i-1)}+\int_{\tau=0}^{1}\nu_\theta\left(\tau,x_\tau^{(i-1)}\right)d\tau$
6. $\quad\quad$ $L_1\leftarrow\left\|y-F\left(x_1^{(i-1)}\right)\right\|_2^2$
7. $\quad\quad$ **if** 使用正则项 **then**
8. $\quad\quad\quad$ $L_2\leftarrow\lambda R\left(x_0^{(i-1)}\right)$
9. $\quad\quad\quad$ $L=L_1+L_2$
10. $\quad\quad$ **else**
11. $\quad\quad\quad$ $L=L_1$
12. $\quad\quad$ **end if**
13. $\quad\quad$ **if** 使用预条件器 **then**
14. $\quad\quad\quad$ $V\leftarrow\omega V+(1-\omega)\nabla_{x_0^{(i-1)}}L_1\odot\nabla_{x_0^{(i-1)}}L_1$
15. $\quad\quad\quad$ $P_k\leftarrow\operatorname{diag}\left(\mathbf 1\oslash\left(\sqrt V+\delta(i)\right)\right)$
16. $\quad\quad$ **else**
17. $\quad\quad\quad$ $P_k\leftarrow I$
18. $\quad\quad$ **end if**
19. $\quad\quad$ $x_0^{(i)}\leftarrow x_0^{(i-1)}-\eta(i)P_k\nabla_{x_0^{(i-1)}}L+\mathcal N\left(0,2\eta(i)s(i)P_k\right)$
20. $\quad\quad$ **if** $i\geq\mathrm{burn}$ **then**
21. $\quad\quad\quad$ 执行 collect.append（$x_0^{(i)}$）
22. $\quad$ **end for**
23. **end**
24. **return** `collect`

首先，一次前向传播用预训练流模型 $\nu_\theta$ 把当前潜样本 $x_0^{(i-1)}$ 映为目标空间样本 $x_1^{(i-1)}$。其次，计算损失函数 $L$，其中包括基于测量 $y$ 的数据一致性项与可选的源空间正则项 $R(x_0)$。第三，为高维问题计算可选的自适应预条件器 $P_k$ 以缩放梯度。最后，用预条件 Langevin 动力学步更新潜样本：它沿损失梯度前进，并加入退火噪声以引导探索。在指定 burn-in 期之后收集 $x_0$ 的样本，以确保它们代表目标后验分布。

## 附录 C：玩具数据生成细节（原 PDF 第 31 页）

本附录给出生成 2D 玩具数据集所用的精确采样流程。

**S 曲线。** 采样潜参数 $t\sim\mathrm{Unif}\left(-\frac{3\pi}{2},\frac{3\pi}{2}\right)$，并定义

$$
x=\begin{bmatrix}\sin(t)\\0.5\,\mathrm{sgn}(t)\left(\cos(t)-1\right)\end{bmatrix}+\epsilon,\qquad\epsilon\sim\mathcal N(0,\sigma^2I).\tag{C.1}
$$

**双月。** 给定请求的批大小 $B$，把样本分成两个半圆：$N_{out}=\lfloor B/2\rfloor$、$N_{in}=B-N_{out}$。对每个子集采样 $\phi\sim\mathrm{Unif}(0,\pi)$ 并设定

$$
x_{\mathrm{base}}=\begin{cases}\begin{bmatrix}\cos(\phi)\\\sin(\phi)\end{bmatrix},& N_{out}\ \text{个样本},\\[10pt]\begin{bmatrix}1-\cos(\phi)\\0.5-\sin(\phi)\end{bmatrix},& N_{in}\ \text{个样本}.\end{cases}\tag{C.2}
$$

然后施加各向同性噪声与仿射重缩放：

$$
x=\frac{1}{1.5}\left(x_{\mathrm{base}}+\epsilon+\begin{bmatrix}-0.5\\-0.25\end{bmatrix}\right),\qquad\epsilon\sim\mathcal N(0,\sigma^2I).\tag{C.3}
$$

## 附录 D：结构、训练与推理超参数细节（原 PDF 第 31—32 页）

对 KS 方程与壁面约束湍流案例，我们用现代化 U-Net [38] 参数化流匹配速度场 $\nu_\theta(\tau,x_\tau)$。其结构采用分层多分辨率设计，在降采样与升采样路径中都含残差块；每个块使用 SiLU 激活与卷积层，启用时在选定分辨率上加入自注意力。传输时间 $\tau$ 被映射为高维位置嵌入，经 MLP 处理后通过特征级线性调制（FiLM）[39] 注入网络，使速度预测以 $\tau$ 为条件。我们用 OT-CFM 目标训练 $\nu_\theta$，训练期间用小批量最优传输构造源—目标样本耦合，OT 求解器使用 torchcfm 仓库提供的实现。OT-CFM 路径参数 $\sigma$ 设为 $10^{-3}$；模型参数用 Adam 优化，学习率固定为 $10^{-4}$。

免训练条件生成还依赖推理期超参数（如引导强度、步长与采样器设置）。表 D.3 汇总了主实验各方法、各数据集所用的超参数。

## 附录 E：条件化尺度对 Grad 与 Grad-Free 方法的影响（原 PDF 第 33 页）

我们考察引导传输条件化对引导尺度 $b$ 的敏感性（Grad 与 Grad-Free 方法）。以 S 曲线玩具分布与测量算子 $\mathcal F_1(\cdot)$ 作为可直接可视化后验几何的受控设定。如图 E.11 所示，引导尺度 $b$ 控制测量同化与先验保真度之间清晰的权衡。$b$ 较小时，条件样本仍靠近所学流形（灰色先验支撑），但条件化较弱，许多样本的行为与无条件生成相似；随着 $b$ 增大，似然注入变强、测量同化改善，但代价是先验保真度。尤其在中等至较大 $b$ 时，偏离所学流形的样本比例增大，表明引导动力学可能被驱入预训练先验支撑较差的区域。该效应在 Grad-Free 上最明显，Grad 呈现相同趋势但极端离群点较少。总体而言，消融表明基于引导的条件化并不鲁棒，其性能关键取决于 $b$ 的调参；较大的 $b$ 可改善测量拟合却降低先验合理性，这在科学逆问题中是有问题的。

## 附录 F：KS 方程的稀疏传感器重建（原 PDF 第 34—35 页）

在稀疏传感器设定中，我们以时空域内均匀随机采样的 1000 个点测量为条件。给定捕捉 KS 解流形的预训练先验，这些稀疏观测可强约束底层轨迹附近的条件分布。图 F.12 与 F.13 表明，除 Grad-Free 外的所有引导方法都能恢复与传感器数据一致、视觉上合理的重建。

更细致的比较揭示了同化与物理保真度方面的重要差异。D-Flow SGLD 在无噪声与含噪情形都给出准确重建，并取得最低的 PDE 残差，表明对 KS 一致性的保持最好。D-Flow 也给出视觉上准确的重建，但在某些实例中残差更高，这与确定性源优化对条件实例与优化景观的敏感性一致。Grad 取得低 MAE，表明数据同化强，但在含噪测量下残差显著升高，表明以牺牲控制 PDE 为代价过拟合污染观测。Grad-Free 表现最差：即使在无噪声情形 MAE 也偏高，且随噪声进一步恶化，产生明显受损的重建与非常大的残差，凸显其在该稀疏传感器区制下鲁棒性有限。

## 附录 G：壁面约束湍流案例的补充结果（原 PDF 第 36—39 页）

为完整起见，图 G.14 至 G.19 给出壁面法向（$u_2$）与展向（$u_3$）速度分量的结果，其趋势与 $u_1$ 相同。

## 参考文献（英文原书目）

以下按原 PDF 第 39—43 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] L. Biegler, G. Biros, O. Ghattas, M. Heinkenschloss, D. Keyes, B. Mallick, L. Tenorio, B. van Bloemen Waanders, K. Willcox, Y. Marzouk, Large-scale inverse problems and quantification of uncertainty, Vol. 712, Wiley Online Library, 2010.

[2] P. Du, M. H. Parikh, X. Fan, X.-Y. Liu, J.-X. Wang, Conditional neural field latent diffusion model for generating spatiotemporal turbulence, Nature Communications 15 (1) (2024) 10416.

[3] C. Drygala, B. Winhart, F. di Mare, H. Gottschalk, Generative modeling of turbulence, Physics of Fluids 34 (3) (2022).

[4] M. H. Parikh, X. Fan, J.-X. Wang, Conditional flow matching for generative modelling of near-wall turbulence with quantified uncertainty, Journal of Fluid Mechanics 1029 (2026) A32. doi:10.1017/jfm.2026.11193.

[5] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, J. C. Ye, Diffusion posterior sampling for general noisy inverse problems, arXiv preprint arXiv:2209.14687 (2022).

[6] A. Dasgupta, A. M. da Cunha, A. Fardisi, M. Aminy, B. Binder, B. Shaddy, A. A. Oberai, Unifying and extending diffusion models through pdes for solving inverse problems, Computer Methods in Applied Mechanics and Engineering 448 (2026) 118431.

[7] D. Shu, Z. Li, A. B. Farimani, A physics-informed diffusion model for high-fidelity flow field reconstruction, Journal of Computational Physics 478 (2023) 111972.

[8] C. Jacobsen, Y. Zhuang, K. Duraisamy, Cocogen: Physically consistent and conditioned score-based generative models for forward and inverse problems, SIAM Journal on Scientific Computing 47 (2) (2025) C399–C425.

[9] S. Shan, M. Zhu, Y. Lin, L. Lu, Red-diffeq: Regularization by denoising diffusion models for solving inverse pde problems with application to full waveform inversion, arXiv preprint arXiv:2509.21659 (2025).

[10] X. Dong, C. Chen, J.-L. Wu, Data-driven stochastic closure modeling via conditional diffusion model and neural operator, Journal of Computational Physics 534 (2025) 114005.

[11] X.-Y. Liu, M. H. Parikh, X. Fan, P. Du, Q. Wang, Y.-F. Chen, J.-X. Wang, Confild-inlet: Synthetic turbulence inflow using generative latent diffusion models with neural fields, Physical Review Fluids 10 (5) (2025) 054901.

[12] H. Gao, X. Han, X. Fan, L. Sun, L.-P. Liu, L. Duan, J.-X. Wang, Bayesian conditional diffusion models for versatile spatiotemporal turbulence generation, Computer Methods in Applied Mechanics and Engineering 427 (2024) 117023.

[13] M. Mardani, J. Song, J. Kautz, A. Vahdat, A variational perspective on solving inverse problems with diffusion models, arXiv preprint arXiv:2305.04391 (2023).

[14] F. Rozet, G. Andry, F. Lanusse, G. Louppe, Learning diffusion priors from observations by expectation maximization, Advances in Neural Information Processing Systems 37 (2024) 87647–87682.

[15] X. Fan, D. Akhare, J.-X. Wang, Neural differentiable modeling with diffusion-based super-resolution for two-dimensional spatiotemporal turbulence, Computer Methods in Applied Mechanics and Engineering 433 (2025) 117478.

[16] P. Du, M. Xu, X. Zhu, J.-x. Wang, Hug-vas: A hierarchical nurbs-based generative model for aortic geometry synthesis and controllable editing, arXiv preprint arXiv:2507.11474 (2025).

[17] Y. Lipman, R. T. Chen, H. Ben-Hamu, M. Nickel, M. Le, Flow matching for generative modeling, arXiv preprint arXiv:2210.02747 (2022).

[18] A. Tong, K. Fatras, N. Malkin, G. Huguet, Y. Zhang, J. Rector-Brooks, G. Wolf, Y. Bengio, Improving and generalizing flow-based generative models with minibatch optimal transport, arXiv preprint arXiv:2302.00482 (2023).

[19] Z. Li, A. Zhou, A. B. Farimani, Generative latent neural pde solver using flow matching, arXiv preprint arXiv:2503.22600 (2025).

[20] G. Baldan, Q. Liu, A. Guardone, N. Thuerey, Flow matching meets pdes: A unified framework for physics-constrained generation, arXiv preprint arXiv:2506.08604 (2025).

[21] U. Utkarsh, P. Cai, A. Edelman, R. Gomez-Bombarelli, C. V. Rackauckas, Physics-constrained flow matching: Sampling generative models with hard constraints, arXiv preprint arXiv:2506.04171 (2025).

[22] S. Wang, Z. Wu, D. van Dijk, L. Lu, Geofunflow: Geometric function flow matching for inverse operator learning over complex geometries, arXiv preprint arXiv:2509.24117 (2025).

[23] A. Pokle, M. J. Muckley, R. T. Chen, B. Karrer, Training-free linear image inverses via flows, arXiv preprint arXiv:2310.04432 (2023).

[24] J. Kim, B. S. Kim, J. C. Ye, Flowdps: Flow-driven posterior sampling for inverse problems, arXiv preprint arXiv:2503.08136 (2025).

[25] B. Zhang, W. Chu, J. Berner, C. Meng, A. Anandkumar, Y. Song, Improving diffusion inverse problem solving with decoupled noise annealing, in: Proceedings of the Computer Vision and Pattern Recognition Conference, 2025, pp. 20895–20905.

[26] S. Martin, A. Gagneux, P. Hagemann, G. Steidl, Pnp-flow: Plug-and-play image restoration with flow matching, arXiv preprint arXiv:2410.02423 (2024).

[27] F. E. Kelvinius, Z. Zhao, F. Lindsten, Solving linear-gaussian bayesian inverse problems with decoupled diffusion sequential monte carlo, arXiv preprint arXiv:2502.06379 (2025).

[28] H. Wang, X. Zhang, T. Li, Y. Wan, T. Chen, J. Sun, Dmplug: A plug-in method for solving inverse problems with diffusion models, Advances in Neural Information Processing Systems 37 (2024) 117881–117916.

[29] H. Ben-Hamu, O. Puny, I. Gat, B. Karrer, U. Singer, Y. Lipman, D-flow: Differentiating through flows for controlled generation, arXiv preprint arXiv:2402.14017 (2024).

[30] V. Purohit, M. Repasky, J. Lu, Q. Qiu, Y. Xie, X. Cheng, Consistency posterior sampling for diverse image synthesis, in: Proceedings of the Computer Vision and Pattern Recognition Conference, 2025, pp. 28327–28336.

[31] Z. Wang, A. Harting, M. Barreau, M. M. Zavlanos, K. H. Johansson, Source-guided flow matching, arXiv preprint arXiv:2508.14807 (2025).

[32] A. Kalaivanan, Z. Zhao, J. Sjölund, F. Lindsten, Ess-flow: Training-free guidance of flow-based models as inference in source space, arXiv preprint arXiv:2510.05849 (2025).

[33] C. Li, C. Chen, D. Carlson, L. Carin, Preconditioned stochastic gradient langevin dynamics for deep neural networks, in: Proceedings of the AAAI conference on artificial intelligence, Vol. 30, 2016.

[34] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, B. Poole, Score-based generative modeling through stochastic differential equations, arXiv preprint arXiv:2011.13456 (2020).

[35] H. Chung, J. Kim, J. C. Ye, Diffusion models for inverse problems, arXiv preprint arXiv:2508.01975 (2025).

[36] G. Dresdner, D. Kochkov, P. Norgaard, L. Zepeda-Núñez, J. A. Smith, M. P. Brenner, S. Hoyer, Learning to correct spectral methods for simulating turbulent flows (2022). doi:10.48550/ARXIV.2207.00556. URL https://arxiv.org/abs/2207.00556

[37] X. Fan, X.-Y. Liu, M. Wang, J.-X. Wang, Diff-flowfsi: A gpu-optimized differentiable cfd platform for high-fidelity turbulence and fsi simulations, Computer Methods in Applied Mechanics and Engineering 448 (2026) 118455.

[38] O. Ronneberger, P. Fischer, T. Brox, U-net: Convolutional networks for biomedical image segmentation, in: International Conference on medical image computing and computer-assisted intervention, Springer, 2015, pp. 234–241.

[39] E. Perez, F. Strub, H. De Vries, V. Dumoulin, A. Courville, Film: Visual reasoning with a general conditioning layer, in: Proceedings of the AAAI conference on artificial intelligence, Vol. 32, 2018.

**本页范围与校对状态：** 本页依据 arXiv:2602.21469v1（cs.LG，2026-02-25，43 页）完成全文中文翻译：摘要、关键词、第 1—5 节（含 2.1—2.4、3.1—3.5、4.1—4.2 等小节）、致谢、生成式 AI 使用声明、附录 A—G（含附录 A 的 (A.1)—(A.9)、算法 1、附录 C 的 (C.1)—(C.3)）、图 1—10 与图 E.11/F.12/F.13/G.14—G.19 共 19 条中文图注、表 1/表 2/表 D.3 逐格转录、参考文献 [1]—[39] 英文原条目（按原编号）。公式编号 (1)—(31) 与 (A.1)—(A.9)、(C.1)—(C.3) 均按原文保留。表 1、表 2、表 D.3 的数值已用 PDF 第 15、26、32 页渲染图逐格核对。**逐句逐式终校未做**；图内曲线未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：4.2 节处 PDF 第 25 页原文插入的 "Gemini said" 字样（疑为编辑残留），以及 3.5 节关于 Grad 谱衰减的两句重复表述；表 2 脚注中 "*" 号在 PDF 渲染中显示不完整，已按表体标记补注。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
