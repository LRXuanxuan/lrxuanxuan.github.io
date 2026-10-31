---
layout: page
title: "快速且忠实：逆问题的有原则条件流匹配｜中文全文译文"
permalink: /papers/translations/2026-09-16-2609-12953-fast-and-faithful-principled-conditional-flow-matching-for-inverse-pro/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/214927ad0ff3fd23/) · [原文 arXiv](https://arxiv.org/abs/2609.12953) · [全部目录](/papers/catalog/)

# 快速且忠实：逆问题的有原则条件流匹配

**原题：** Fast and Faithful: Principled Conditional Flow Matching for Inverse Problems  
**作者：** Shirin Shoushtari$^1$、Edward P. Chandler$^2$、Xiao Shi$^2$、Ulugbek S. Kamilov$^2$  
**单位：** $^1$ 圣路易斯华盛顿大学（WashU）；$^2$ 威斯康星大学麦迪逊分校（UW-Madison）；邮箱：s.shirin@wustl.edu、epchandler@wisc.edu、xiao.shi@wisc.edu、kamilov@wisc.edu。  
**版本：** arXiv:2609.12953v1（cs.CV），v1 日期 2026 年 9 月 11 日；原文 34 页（含附录 A–E）。  
**原文信息核对：** PDF 页首标注 "Computational Imaging Group (CIG)" 与 arXiv 戳 "arXiv:2609.12953v1 [cs.CV] 11 Sep 2026"，与库内登记编号 2609.12953 一致；文末无独立致谢节。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节正文与编号小节、图 1–17 中文图注、表 1–13 逐格转写、算法 1–3、附录 A–E（证明、算法细节、相关工作、实现细节与补充结果），以及参考文献 64 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

用于成像逆问题的流匹配方法通常以两种方式引入测量：基于条件化的方法把由测量导出的信息作为网络输入（常通过拼接），而推理引导方法把无条件速度场与单独的数据一致性更新结合。在这些常见表述中，前向模型并未在学习到的条件速度场内部被显式强制。我们提出一种**面向测量的条件速度场**的有原则参数化，用于求解逆问题。在线性插值下，我们把条件速度 $v(\mathbf x_t,t,\mathbf y)$ 表示为后验均值 $\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]$ 的函数，并把该均值刻画为一个数据一致性项显式的变分目标的唯一极小化者。我们进一步证明该速度场定义了从源分布到测量条件后验的概率流。把变分目标拆分可得到带算子相关数据一致性更新的条件速度参数化；我们在流匹配目标下端到端训练它，推理时不需要任何额外引导。与最强的流匹配基线相比，我们的方法以 $50\times$ 更少的函数评估达到最先进的 PSNR。改变采样步数可在不重训练的情况下对失真–感知折中提供测试时控制。

## 1. 引言

成像逆问题旨在从退化测量中恢复未知图像，出现在磁共振成像（MRI）、计算机断层成像（CT）、显微成像、天文成像与遥感中 [1, 2, 3]。由于前向算子常常欠定，测量不能唯一确定图像，重建因此需要先验信息。常见的经典方法把数据保真项与手工设计的正则项（如稀疏性或平滑性）结合 [4, 5, 6, 7]。基于学习的方法常用从数据中学到的先验替代或补充手工正则。

基于得分的扩散模型 [8, 9] 与流匹配模型 [10, 11, 12] 为成像逆问题提供了表达力强的学习先验 [13]。生成式逆问题求解器的一个关键区别在于测量信息以何种方式、在何时进入重建。

一种常见范式使用图像分布 $p(\mathbf x)$ 的预训练生成模型，在推理时引入测量。DiffPIR [14] 与 DDRM [15] 通过近端或谱更新引入数据一致性，而变分 PnP 扩散 [16] 在去噪与数据一致性投影之间交替。流匹配方法同样把无条件速度场与基于梯度或投影的一致性更新结合 [17, 18, 19]。推理时条件化使预训练先验可跨逆问题与测量算子复用。然而，生成动力学本身仍是无条件的，测量一致性是在采样过程中施加的，而非学习得到的。进一步讨论见附录 C。

第二种方法训练以测量 $\mathbf y$ 为条件的得分或速度场 [20, 21, 22]，从而免去推理时单独的测量修正。此时测量作为网络输入进入——通过 $\mathbf y$、$\mathbf A^T\mathbf y$ 或学习到的嵌入——但前向算子并未在学习到的动力学内部被应用。算子信息只能通过该输入与配对训练分布获得。

我们改为学习一个把前向算子直接纳入生成动力学的测量条件速度场。在线性插值下，$\mathbf x_t$ 与 $\mathbf y$ 是干净图像 $\mathbf x_1$ 的条件独立含噪观测，它们的联合后验均值决定最优条件速度，$v(\mathbf x_t,t,\mathbf y)=(\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]-\mathbf x_t)/(1-t)$。我们证明该后验均值极小化一个结合流一致性、显式测量一致性与隐式正则的变分目标；并进一步证明最优速度定义了从源分布到测量条件后验的概率流。该理论刻画使数据一致性成为条件动力学的一部分，而不是外部的采样修正。隐式正则项没有闭式。因此我们通过交替进行算子相关的数据一致性求解与学习到的先验更新来估计后验均值。该交替估计器参数化条件速度，并在流匹配目标下端到端训练。于是前向算子作用于每一次速度评估内部，而不只是作为网络输入进入。

我们的贡献有三方面。(a) 我们为成像逆问题提出一种新的流匹配方法，提供一种把前向算子系统性地纳入学习到的测量条件速度场的方式。(b) 我们给出新的理论刻画，表明我们的变分表述得到最优测量条件速度；并进一步证明相关联的概率流把源分布输运到测量条件后验。(c) 我们的方法以比表现最好的流匹配基线少 $50\times$ 的函数评估取得最先进重建，并可在测试时控制失真–感知折中而无需重训练。

## 2. 背景

**逆问题。** 成像逆问题旨在从退化测量 $\mathbf y\in\mathbb R^m$ 中恢复未知图像 $\mathbf x\in\mathbb R^n$，常见模型为

$$
\mathbf y=\mathbf A\mathbf x+\boldsymbol\eta, \tag{1}
$$

其中 $\mathbf A:\mathbb R^n\to\mathbb R^m$ 是测量算子，$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I)$ 是标准差为 $\sigma$ 的加性高斯噪声。由于 $\mathbf A$ 可能不可逆或欠定，测量未必唯一确定 $\mathbf x$；即使解唯一，病态性也可能使恢复不稳定。因此重建需要先验信息。常见的变分估计器为

$$
\hat{\mathbf x}=\arg\min_{\mathbf x}\left\{g(\mathbf x)+h(\mathbf x)\right\}, \tag{2}
$$

其中 $g(\mathbf x)$ 强制测量一致性，$h(\mathbf x)$ 编码先验信息。在加性高斯噪声下，标准选择是 $g(\mathbf x)=\frac12\|\mathbf A\mathbf x-\mathbf y\|_2^2$，而 $h$ 可促进全变差、小波稀疏或稀疏字典表示等性质 [23, 24, 25]。

**PnP 与 HQS。** 即插即用（PnP）方法保留数据保真项，用学习到的去噪器替代手工正则项的近端更新 [26]。近端算子为

$$
\mathrm{prox}_{\gamma h}(\mathbf x)=\arg\min_{\mathbf u}\left\{h(\mathbf u)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|_2^2\right\}. \tag{3}
$$

当 $h$ 是负对数先验时，该算子对应噪声水平为 $\sqrt\gamma$ 的 MAP 去噪；PnP 方法则用学习到的去噪器隐式编码先验信息 [27, 28, 29]。半二次分裂（HQS）引入辅助变量 $\mathbf z$，把数据保真项与正则项分离为

$$
\min_{\mathbf x,\mathbf z}\left\{g(\mathbf x)+h(\mathbf z)+\frac{\mu}{2}\|\mathbf x-\mathbf z\|_2^2\right\}, \tag{4}
$$

其中 $\mu>0$ 控制 $\mathbf x$ 与 $\mathbf z$ 之间的耦合。交替极小化给出

$$
\mathbf x^{k+1}=\arg\min_{\mathbf x}\left\{g(\mathbf x)+\frac{\mu}{2}\|\mathbf x-\mathbf z^k\|_2^2\right\}=\left(\mathbf A^\top\mathbf A+\mu\mathbf I\right)^{-1}\left(\mathbf A^\top\mathbf y+\mu\mathbf z^k\right), \tag{5}
$$

$$
\mathbf z^{k+1}=\arg\min_{\mathbf z}\left\{h(\mathbf z)+\frac{\mu}{2}\|\mathbf x^{k+1}-\mathbf z\|_2^2\right\}=\mathrm{prox}_{h/\mu}\left(\mathbf x^{k+1}\right). \tag{6}
$$

$\mathbf x$ 更新强制数据一致性，$\mathbf z$ 更新施加先验信息。PnP 用噪声水平 $1/\sqrt\mu$ 处的学习去噪器替代后者。算法展开把交替更新视为可端到端训练的可微网络层 [30, 31]。

**流匹配。** 流匹配 [10, 12, 11] 通过学习从源分布 $p_0$ 到目标分布 $p_1$ 的连续输运动力学来构造生成模型。中间分布 $\{p_t\}_{t\in[0,1]}$ 满足连续性方程

$$
\partial_tp_t+\nabla\cdot(p_t\mathbf v_t)=0, \tag{7}
$$

其中 $\mathbf v_t$ 是速度场，样本按 $\mathrm d\mathbf x_t/\mathrm dt=\mathbf v_t(\mathbf x_t)$ 演化。沿用流匹配与整流流中的线性插值路径 [10, 12]，有

$$
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1,\qquad t\in[0,1], \tag{8}
$$

其中 $\mathbf x_0\sim p_0$、$\mathbf x_1\sim p_1$。最优边缘速度为 $\mathbf v(\mathbf x_t,t)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t]$。由于该条件期望一般不可得，条件流匹配（CFM）[10, 32] 直接回归样本级路径速度：

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{t,\mathbf x_0,\mathbf x_1}\left\|\mathbf v_\theta(\mathbf x_t,t)-(\mathbf x_1-\mathbf x_0)\right\|^2, \tag{9}
$$

其梯度与边缘流匹配目标一致。这里"条件"指的是构造训练目标所用的概率路径，而非测量条件化。对线性路径，最优速度也可写为

$$
\mathbf v(\mathbf x_t,t)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t]=\frac{\mathbb E[\mathbf x_1\mid\mathbf x_t]-\mathbf x_t}{1-t}. \tag{10}
$$

因此速度估计归约为条件均值估计。样本级路径是直线，这促使在整流流模型中用相对较少的步数进行数值积分 [12, 32]。训练后，通过求解

$$
\hat{\mathbf x}_1=\mathbf x_0+\int_0^1\mathbf v_\theta(\mathbf x_t,t)\,\mathrm dt \tag{11}
$$

向 $t=1$ 生成样本。数值求解器只在 $t<1$ 时评估 (10) 中的表示，此时它仍有良好定义。

## 3. 方法

### 3.1 理论刻画

在线性插值下，插值状态 $\mathbf x_t$ 与测量 $\mathbf y=\mathbf A\mathbf x_1+\boldsymbol\eta$ 是 $\mathbf x_1$ 的条件独立含噪观测。它们构成增广观测模型

$$
\underbrace{\begin{pmatrix}\mathbf x_t\\ \mathbf y\end{pmatrix}}_{\widetilde{\mathbf y}}=\underbrace{\begin{pmatrix}t\mathbf I\\ \mathbf A\end{pmatrix}}_{\widetilde{\mathbf A}}\mathbf x_1+\underbrace{\begin{pmatrix}(1-t)\mathbf x_0\\ \boldsymbol\eta\end{pmatrix}}_{\widetilde{\mathbf b}},\qquad \widetilde{\mathbf b}\sim\mathcal N\left(\mathbf 0,\mathrm{diag}\left((1-t)^2\mathbf I,\sigma^2\mathbf I\right)\right). \tag{12}
$$

增广观测模型（$\widetilde{\mathbf y}=\widetilde{\mathbf A}\mathbf x_1+\widetilde{\mathbf b}$）下 $\mathbf x_1$ 的 MMSE 估计器就是后验均值 $\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]$。下一命题把后验均值与最优测量条件速度联系起来，把后验均值刻画为变分目标的极小化者，并证明最优场把源分布输运到测量条件后验。

**命题 1.** 对具有有界支撑的非退化 $p_1$、$\sigma>0$ 与 $t\in(0,1)$：
(a) 存在正则项 $\phi_t:\mathbb R^n\to\mathbb R\cup\{+\infty\}$（至多相差一个加性常数唯一），使 $\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]$ 是

$$
\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]=\arg\min_{\mathbf x\in\mathbb R^n}\left\{\frac{1}{2(1-t)^2}\left\|\mathbf x_t-t\mathbf x\right\|_2^2+\frac{1}{2\sigma^2}\left\|\mathbf y-\mathbf A\mathbf x\right\|_2^2+\phi_t(\mathbf x)\right\} \tag{13}
$$

的唯一全局极小化者与唯一驻点，其中极小化者确定最优测量条件速度

$$
\mathbf v(\mathbf x_t,t,\mathbf y)=\frac{\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]-\mathbf x_t}{1-t}. \tag{14}
$$

(b) 此外，$\mathbf v$ 满足条件连续性方程

$$
\partial_tp_t(\mathbf x\mid\mathbf y)+\nabla\cdot\left(p_t(\mathbf x\mid\mathbf y)\mathbf v(\mathbf x,t,\mathbf y)\right)=0. \tag{15}
$$

对每个 $\tau<1$，相应流把高斯源输运到 $p_\tau(\cdot\mid\mathbf y)$，且当 $\tau\to1^-$ 时 $p_\tau(\cdot\mid\mathbf y)\Rightarrow p(\mathbf x_1\mid\mathbf y)$。

证明见附录 A.3。该变分陈述把 [33] 的 MMSE 刻画应用于 (12) 的增广模型。在 (13) 中，两个二次项分别强制插值一致性与测量一致性，而 $\phi_t$ 捕捉其余结构。极小化者给出后验均值，从而给出最优条件速度，其概率流把源分布输运到测量条件后验。由于 $\phi_t$ 不可得，下一小节把这一有原则的刻画转化为实际算法。

### 3.2 算子感知的条件速度

命题 1 把最优条件速度的构造归约为极小化 (13)。然而隐式正则项 $\phi_t$ 没有闭式。因此我们应用 HQS 把目标拆分为显式数据一致性更新与和 $\phi_t$ 关联的学习更新。引入辅助变量 $\mathbf z$ 与二次罚项得

$$
\min_{\mathbf x,\mathbf z}\left\{\frac{1}{2(1-t)^2}\left\|\mathbf x_t-t\mathbf z\right\|_2^2+\frac{1}{2\sigma^2}\left\|\mathbf y-\mathbf A\mathbf x\right\|_2^2+\phi_t(\mathbf z)+\frac{\mu}{2}\left\|\mathbf x-\mathbf z\right\|_2^2\right\}, \tag{16}
$$

其中 $\mu>0$ 控制耦合。对 $\mathbf x$ 与 $\mathbf z$ 交替极小化给出

$$
\mathbf x^{k+1}=\arg\min_{\mathbf x}\left\{\frac{1}{2\sigma^2}\|\mathbf y-\mathbf A\mathbf x\|_2^2+\frac{\mu}{2}\left\|\mathbf x-\mathbf z^k\right\|_2^2\right\}, \tag{17}
$$

$$
\mathbf z^{k+1}=\arg\min_{\mathbf z}\left\{\phi_t(\mathbf z)+\frac{1}{2(1-t)^2}\left\|\mathbf x_t-t\mathbf z\right\|_2^2+\frac{\mu}{2}\left\|\mathbf x^{k+1}-\mathbf z\right\|_2^2\right\}. \tag{18}
$$

$\mathbf x$ 更新显式强制与测量模型一致，$\mathbf z$ 更新把插值一致性与隐式正则结合。由于 $\phi_t$ 未知，我们用学习到的估计器实现 $\mathbf z$ 更新。算法的完整实现见附录 B 与算法 3。

令 $\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)$ 表示 $K$ 次迭代后的输出。该输出估计测量条件后验均值 $\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]$，并定义学习到的速度

$$
\mathbf v_\theta(\mathbf x_t,t,\mathbf y)=\frac{\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)-\mathbf x_t}{1-t}. \tag{19}
$$

因此前向算子通过每次迭代中的数据一致性更新进入学习到的速度。

### 3.3 训练条件速度场

给定干净图像 $\mathbf x_1$，生成测量 $\mathbf y=\mathbf A\mathbf x_1+\boldsymbol\eta$，独立采样 $\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$，并抽取 $t\sim\mathcal U[t_{\min},t_{\max}]$。插值状态为

$$
\mathbf x_t=t\mathbf x_1+(1-t)\mathbf x_0. \tag{20}
$$

算法 3 给出测量条件后验均值的算子感知估计 $\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)$。我们使用稳定的时间尺度

$$
\tau_t=\max(1-t,\tau_{\min}), \tag{21}
$$

其中 $t_{\max}<1$ 排除奇异端点，$\tau_{\min}>0$ 界定速度缩放。预测与目标速度为

$$
\mathbf v_\theta(\mathbf x_t,t,\mathbf y)=\frac{\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)-\mathbf x_t}{\tau_t},\qquad \mathbf v_{\mathrm{target}}=\frac{\mathbf x_1-\mathbf x_t}{\tau_t}, \tag{22}
$$

其中 $\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)$ 是算法 3 提供的后验均值。我们用加权流匹配损失端到端训练完整估计器：

$$
\mathcal L(\theta)=\mathbb E_{\mathbf x_1,\mathbf x_0,t,\mathbf y}\left[\omega(t)\left\|\mathbf v_\theta(\mathbf x_t,t,\mathbf y)-\mathbf v_{\mathrm{target}}\right\|_2^2\right],\qquad \omega(t)=\frac{1+\tau_t^3}{\tau_t}. \tag{23}
$$

算法 1 总结训练过程。

> **算法 1　训练**
> **Require：** $\mathbf A$、$\sigma$、$[t_{\min},t_{\max}]$、$\tau_{\min}$
> 1: **repeat**
> 2: 　$\mathbf x_1\sim p_1$，$\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$，$t\sim\mathcal U[t_{\min},t_{\max}]$
> 3: 　$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I)$，$\mathbf y\leftarrow\mathbf A\mathbf x_1+\boldsymbol\eta$
> 4: 　$\mathbf x_t\leftarrow t\mathbf x_1+(1-t)\mathbf x_0$，$\tau_t=\max(1-t,\tau_{\min})$
> 5: 　$\mathbf z_\theta^K\leftarrow\text{POSTMEAN}(\mathbf x_t,t,\mathbf y,\mathbf A)$　▷ 算法 3
> 6: 　$\mathbf v_\theta\leftarrow(\mathbf z_\theta^K-\mathbf x_t)/\tau_t$
> 7: 　$\mathbf v_{\mathrm{target}}\leftarrow(\mathbf x_1-\mathbf x_t)/\tau_t$
> 8: 　用 (23) 更新 $\theta$
> 9: **until** 收敛

> **算法 2　采样**
> **Require：** 测量 $\mathbf y$、前向算子 $\mathbf A$、已训练模型、步数 $N$
> 1: 采样 $\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$
> 2: $\Delta t\leftarrow1/N$
> 3: **for** $i=0,\dots,N-1$ **do**
> 4: 　$t_i\leftarrow i\Delta t$
> 5: 　$\mathbf z_{\theta,i}^K\leftarrow\text{POSTMEAN}(\mathbf x_i,t_i,\mathbf y,\mathbf A)$　▷ 算法 3
> 6: 　$\mathbf v_i\leftarrow(\mathbf z_{\theta,i}^K-\mathbf x_i)/(1-t_i)$
> 7: 　$\mathbf x_{i+1}\leftarrow\mathbf x_i+\Delta t\mathbf v_i$
> 8: **return** $\mathbf x_N$

### 3.4 用条件速度场采样

推理时我们使用理论尺度 $1-t$，而非训练时的下限 $\tau_t$。对状态 $\mathbf x_t$，算法 3 返回 $\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)$，学习到的条件速度用 (19) 计算。从 $\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$ 出发，我们用 $N$ 个显式 Euler 步积分

$$
\frac{\mathrm d\mathbf x_t}{\mathrm dt}=\mathbf v_\theta(\mathbf x_t,t,\mathbf y). \tag{24}
$$

取 $\Delta t=1/N$、$t_i=i\Delta t$，更新为

$$
\mathbf z_{\theta,i}^K=\mathbf z_\theta^K(\mathbf x_i,t_i,\mathbf y), \tag{25}
$$

$$
\mathbf v_i=\frac{\mathbf z_{\theta,i}^K-\mathbf x_i}{1-t_i}, \tag{26}
$$

$$
\mathbf x_{i+1}=\mathbf x_i+\Delta t\mathbf v_i,\qquad i=0,\dots,N-1. \tag{27}
$$

由于每次速度评估时 $t_i<1$，分母始终有良好定义。后验均值估计器已纳入前向算子，因此采样不需要外部引导。改变 $N$ 可在不重训练的情况下对失真–感知折中提供测试时控制。算法 2 总结采样过程。

> **表 1（原文 Table 1）：** 100 张 CelebA 测试图像上的定量结果。最优与次优结果分别以蓝色与红色标出。我们的方法在达到有竞争力感知质量的同时取得最佳重建质量。

| 方法 | 去噪 PSNR | SSIM | LPIPS | 去模糊 PSNR | SSIM | LPIPS | 超分 PSNR | SSIM | LPIPS | 随机修复 PSNR | SSIM | LPIPS | 框修复 PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 退化输入 | 20.00 | 0.348 | 0.371 | 27.81 | 0.740 | 0.125 | 10.25 | 0.183 | 0.827 | 11.95 | 0.196 | 1.041 | 22.26 | 0.743 | 0.213 |
| PnP-GS | 32.54 | 0.908 | 0.035 | 33.97 | 0.924 | 0.041 | 31.23 | 0.890 | 0.065 | 29.20 | 0.875 | 0.069 | – | – | – |
| PnP-HQS | 32.17 | 0.897 | 0.044 | 34.87 | 0.946 | 0.033 | 32.33 | 0.911 | 0.075 | 32.81 | 0.945 | 0.023 | – | – | – |
| ISTA-Net | – | – | – | 35.38 | 0.950 | 0.035 | 33.54 | 0.937 | 0.038 | 34.70 | 0.960 | 0.022 | – | – | – |
| DiffPIR | 31.12 | 0.883 | 0.060 | 32.68 | 0.910 | 0.060 | 31.46 | 0.893 | 0.034 | 31.69 | 0.916 | 0.025 | – | – | – |
| I²SB | – | – | – | 33.25 | 0.924 | **0.012** | 31.92 | 0.891 | **0.014** | 32.80 | 0.938 | **0.011** | 28.72 | 0.803 | 0.042 |
| OT-ODE | 30.49 | 0.858 | 0.032 | 32.96 | 0.920 | 0.029 | 31.34 | 0.903 | 0.027 | 28.65 | 0.870 | 0.051 | 29.37 | 0.919 | 0.038 |
| D-Flow | 26.01 | 0.606 | 0.092 | 31.21 | 0.854 | 0.037 | 30.44 | 0.843 | 0.026 | 33.61 | 0.942 | 0.015 | 30.59 | 0.898 | 0.027 |
| Flow-Priors | 29.31 | 0.767 | 0.135 | 31.51 | 0.857 | 0.056 | 28.36 | 0.715 | 0.100 | 32.87 | 0.943 | 0.019 | 30.06 | 0.859 | 0.048 |
| PnP-Flow1 | 31.75 | 0.904 | 0.044 | 34.48 | 0.936 | 0.039 | 31.04 | 0.901 | 0.045 | 33.02 | 0.944 | 0.018 | 30.45 | 0.933 | 0.037 |
| PnP-Flow5 | 32.24 | 0.910 | 0.056 | 34.80 | 0.941 | 0.046 | 31.44 | 0.905 | 0.056 | 33.95 | 0.953 | 0.022 | 31.06 | 0.939 | 0.043 |
| Flower1-OT | 32.22 | 0.913 | 0.033 | 34.95 | 0.947 | 0.025 | 32.30 | 0.922 | 0.034 | 33.05 | 0.944 | 0.017 | 31.17 | 0.945 | 0.022 |
| Flower5-OT | 33.07 | 0.925 | 0.038 | 35.65 | 0.954 | 0.031 | 33.03 | 0.931 | 0.039 | 33.92 | 0.953 | 0.020 | 31.85 | 0.952 | 0.023 |
| 本文（$N=2$） | **33.67** | **0.932** | 0.034 | **36.04** | **0.957** | 0.029 | **34.39** | **0.949** | 0.028 | **35.03** | **0.963** | 0.018 | **33.25** | **0.960** | **0.022** |
| 本文（$N=4$） | 33.24 | 0.928 | 0.034 | 35.78 | 0.956 | 0.028 | 33.96 | 0.946 | 0.026 | 34.67 | 0.962 | 0.016 | 32.57 | 0.958 | 0.021 |
| 本文（$N=10$） | 32.26 | 0.914 | **0.032** | 35.03 | 0.950 | **0.023** | 33.13 | 0.937 | 0.022 | 33.98 | 0.956 | **0.014** | 31.85 | 0.953 | 0.020 |
| 本文（$N=25$） | 31.56 | 0.901 | **0.028** | 31.46 | 0.848 | 0.026 | 30.39 | 0.837 | 0.029 | 33.42 | 0.951 | **0.013** | 31.33 | 0.947 | **0.020** |

## 4. 实验结果

我们在五个逆问题上评估方法：去噪、去模糊、超分辨率、随机掩码修复与框修复。实验使用 CelebA [34] 与 AFHQ-Cat [35]，遵循 [17] 与 [18] 的数据集与评估协议以公平比较。CelebA 含对齐人脸图像，我们中心裁剪并缩放到 $128\times128$，使用标准训练、验证与测试划分；AFHQ-Cat 图像缩放到 $256\times256$。由于 AFHQ-Cat 没有官方验证划分，我们遵循 [17] 把 32 张测试图像留作验证。所有图像归一化到 $[-1,1]$。

我们与最先进的 PnP、展开、基于扩散与基于流的逆问题求解器比较：PnP-GS [36]、PnP-HQS（DPIR）[37]、ISTA-Net [38]、DiffPIR [14]、I²SB [22]、OT-ODE [39]、D-Flow [40]、Flow Priors [19]、PnP-Flow [17] 与 Flower [18]。

### 4.1 主要结果

我们在五个复原任务上评估，报告 PSNR（↑）、SSIM（↑）与 LPIPS（↓）[41]，在 100 张测试图像上平均。我们采用 [17] 与 [18] 的退化设置不作修改。去噪使用 $\sigma=0.2$ 的高斯噪声；去模糊使用 $61\times61$ 高斯核，CelebA 上 $\sigma_b=1.0$、AFHQ-Cat 上 $\sigma_b=3.0$，且 $\sigma=0.05$；超分辨率在 CelebA 上 $2\times$ 下采样、AFHQ-Cat 上 $4\times$，$\sigma=0.05$；随机修复以 $\sigma=0.01$ 掩蔽 70% 像素；框修复在 CelebA 上施加 $40\times40$、AFHQ-Cat 上 $80\times80$ 的中心掩码，$\sigma=0.05$。表中"–"标记基线不适用的设置。

表 1 与表 2 报告 CelebA 与 AFHQ-Cat 的结果。我们的方法在多数设置中排名第一或第二。改变采样步数可控制失真–感知折中：更少步数偏向 PSNR 与 SSIM，而更多步数改善 LPIPS，使一个训练模型无需重训练即可覆盖两种区间。图 1 与图 2 展示代表性重建。遵循 [18]，我们还在表 11 与表 12 中在更大测试集上评估本文方法与更快的基线。

> **图 1（原文 Fig. 1）：** AFHQ-Cat 上（上：去噪；下：去模糊）的定性重建。每个面板下方的数值为 PSNR/SSIM/LPIPS。我们的方法只用 $N=2$ 个采样步就保留精细图像细节并产生忠实重建。

> **图 2（原文 Fig. 2）：** CelebA 上的定性重建。每个面板下方的数值报告 PSNR/SSIM/LPIPS。注意我们的方法恢复了其他基线无法恢复的细节，同时只需 $N=2$ 个 ODE 步。

### 4.2 推理代价与可扩展性

表 3 报告 CelebA 去模糊的推理时间、峰值 GPU 显存与函数评估数（NFE），在单块 NVIDIA RTX A6000 上对 10 张图像平均。我们的推理代价为 $\mathcal O(NK)$，其中 $N$ 是 ODE 步数、$K=5$ 是内层 HQS 迭代数；因此 $N=2$ 配置需要 10 次 NFE。虽然其每次 NFE 代价与 PnP-Flow 和 Flower 相当，我们的方法所需评估少 $50\times$。在取得最佳失真指标的配置下，它可在 0.24 s 内重建一幅图像，而 Flower5-OT 为 13.03 s。我们的方法比 PnP-Flow 与 Flower 使用更多峰值显存，因为它保留中间迭代，但明显少于其他基线。

> **表 2（原文 Table 2）：** 100 张 AFHQ-Cat 测试图像上的定量结果。最优与次优结果分别以蓝色与红色标出。我们的方法在取得最佳或有竞争力感知质量的同时取得最佳重建质量。

| 方法 | 去噪 PSNR | SSIM | LPIPS | 去模糊 PSNR | SSIM | LPIPS | 超分 PSNR | SSIM | LPIPS | 随机修复 PSNR | SSIM | LPIPS | 框修复 PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 退化输入 | 20.00 | 0.293 | 0.529 | 24.38 | 0.529 | 0.436 | 11.59 | 0.212 | 0.867 | 13.23 | 0.213 | 1.082 | 21.52 | 0.727 | 0.215 |
| PnP-GS | 33.00 | 0.895 | 0.078 | 28.39 | 0.787 | 0.387 | 24.44 | 0.639 | 0.411 | 29.82 | 0.844 | 0.143 | – | – | – |
| PnP-HQS | 32.69 | 0.896 | 0.108 | 29.34 | 0.793 | 0.362 | 26.58 | 0.724 | 0.441 | 33.07 | 0.916 | 0.051 | – | – | – |
| ISTA-Net | – | – | – | 29.36 | 0.790 | 0.342 | 28.22 | 0.784 | 0.297 | 34.10 | 0.929 | 0.049 | – | – | – |
| DiffPIR | 31.05 | 0.839 | 0.186 | 28.24 | 0.747 | 0.319 | 24.24 | 0.650 | 0.385 | 32.31 | 0.886 | 0.057 | – | – | – |
| I²SB | – | – | – | 27.72 | 0.725 | 0.077 | 27.19 | 0.739 | **0.070** | 31.79 | 0.879 | **0.026** | 27.32 | 0.763 | 0.072 |
| OT-ODE | 30.48 | 0.818 | 0.081 | 27.82 | 0.735 | 0.126 | 26.71 | 0.737 | 0.108 | 29.99 | 0.849 | 0.087 | 24.47 | 0.873 | 0.095 |
| D-Flow | 26.44 | 0.573 | 0.180 | 28.60 | 0.746 | 0.167 | 25.20 | 0.616 | 0.188 | 32.79 | 0.898 | 0.044 | 27.02 | 0.840 | 0.081 |
| Flow-Priors | 29.67 | 0.756 | 0.165 | 27.28 | 0.726 | 0.188 | 23.95 | 0.566 | 0.274 | 32.95 | 0.909 | 0.051 | 26.13 | 0.809 | 0.130 |
| PnP-Flow1 | 31.62 | 0.866 | 0.139 | 28.71 | 0.779 | 0.285 | 27.56 | 0.780 | 0.158 | 33.71 | 0.923 | 0.038 | 26.45 | 0.895 | 0.111 |
| PnP-Flow5 | 31.87 | 0.868 | 0.170 | 29.01 | 0.785 | 0.312 | 28.01 | 0.791 | 0.167 | 34.44 | 0.932 | 0.045 | 27.14 | 0.900 | 0.127 |
| Flower1-OT | 32.12 | 0.881 | 0.113 | 29.38 | 0.793 | 0.237 | 26.76 | 0.759 | 0.262 | 33.68 | 0.922 | 0.042 | 26.67 | 0.914 | 0.065 |
| Flower5-OT | 32.75 | 0.892 | 0.126 | 29.73 | 0.801 | 0.264 | 27.09 | 0.767 | 0.272 | 34.36 | 0.931 | 0.048 | 27.32 | 0.922 | 0.067 |
| 本文（$N=2$） | **33.31** | **0.904** | 0.081 | **29.89** | **0.809** | 0.229 | **29.10** | **0.816** | 0.167 | **34.71** | **0.936** | 0.043 | **29.27** | **0.924** | 0.060 |
| 本文（$N=4$） | 32.93 | 0.898 | 0.079 | 29.42 | 0.796 | 0.188 | 28.50 | 0.801 | 0.141 | 34.30 | 0.932 | 0.039 | 28.65 | 0.921 | **0.052** |
| 本文（$N=10$） | 31.96 | 0.879 | **0.072** | 28.72 | 0.775 | 0.145 | 27.75 | 0.777 | 0.115 | 33.53 | 0.922 | 0.033 | 27.94 | 0.916 | 0.047 |
| 本文（$N=25$） | 29.69 | 0.776 | 0.081 | 28.16 | 0.754 | **0.119** | 26.54 | 0.676 | 0.121 | 32.91 | 0.912 | **0.030** | 26.76 | 0.819 | 0.077 |

> **表 3（原文 Table 3）：** CelebA（$128\times128$）去模糊任务的计算时间、显存与函数评估数（NFE）。三项指标越低越好。最优与次优结果分别以蓝色与红色标出。

| 指标 | OT-ODE | D-Flow | Flow Priors | PnP-Flow1 | PnP-Flow5 | Flower1 | Flower5 | 本文 $N=2$ | 本文 $N=4$ | 本文 $N=10$ | 本文 $N=25$ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 时间（s）↓ | 6.37 | 299.25 | 41.27 | 2.33 | 11.46 | 2.67 | 13.03 | **0.24** | 0.50 | 1.21 | 3.13 |
| 峰值显存（MB）↓ | 743 | 6124 | 2728 | **192** | **192** | 193 | 193 | 331 | 331 | 331 | 331 |
| NFE ↓ | 180 | – | 100 | 100 | 500 | 100 | 500 | **10** | 20 | 50 | 125 |

### 4.3 消融研究

**采样步数 $N$。** 图 3 展示采样步数如何影响重建质量。在多数任务上，增加 $N$ 会降低 PSNR 但改善 LPIPS。粗积分产生类后验均值的重建，而更细的积分移向感知真实的样本。因此 $N$ 用单个训练模型提供对失真–感知折中的测试时控制。

> **图 3（原文 Fig. 3）：** ODE 步数 $N$ 对 AFHQ-Cat 去模糊的影响。每幅重建下方的数值报告该图的 PSNR/LPIPS，右侧面板报告测试集平均。增加 $N$ 以更低 PSNR 为代价改善感知质量，使单个训练模型可在测试时控制失真–感知折中。

**迭代深度 $K$。** 表 4 在随机修复、$N=2$ 下评估 $K\in\{3,5,7\}$。增大 $K$ 改善 PSNR，而 LPIPS 在 $K=5$ 处最小。由于推理代价按 $\mathcal O(NK)$ 增长，我们全程使用 $K=5$，在重建质量与约为 $K=7$ 的 70% 代价之间平衡。

> **表 4（原文 Table 4）：** 迭代深度 $K$。

| $K$ | PSNR↑ | SSIM↑ | LPIPS↓ | 时间（ms）↓ |
|---|---|---|---|---|
| 3 | 34.63 | 0.959 | 0.020 | 137 |
| 5 | 35.03 | 0.963 | **0.018** | 223 |
| 7 | **35.21** | **0.964** | 0.019 | 322 |

**对噪声水平与算子失配的鲁棒性。** 用固定前向模型训练会把学到的场绑定到算子 $\mathbf A$ 与噪声水平 $\sigma$。我们在表 6 与表 5 中评估对这种失配的鲁棒性。表 6 把用 0.7 修复掩码比例训练的模型应用于 0.5 到 0.8 的比例。性能在该范围内平滑变化，并在掩蔽像素更少时改善，表明是优雅迁移而非失效。由于我们未在每个比例处训练匹配模型，该实验衡量鲁棒性，但不量化失配惩罚。表 5 评估在 $\sigma=0.01$ 处训练的模型在其他噪声水平上的表现。尽管存在该失配，我们的模型在两个测试噪声水平上都在三项指标上优于算子无关的 Flower5-OT。

> **表 6（原文 Table 6）：** 随机修复中算子失配的敏感性。在掩码比例 $p=0.7$（†）处训练的模型在不重训练的情况下于不同测试时掩码比例下评估。虽然移除更多像素会降低重建质量，性能并未在失配下出现突变式退化。

| $p$ | PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|
| 0.5 | 38.26 | 0.978 | 0.008 |
| 0.6 | 36.95 | 0.973 | 0.012 |
| 0.7† | 35.03 | 0.963 | 0.018 |
| 0.8 | 32.10 | 0.936 | 0.034 |

> **表 5（原文 Table 5）：** 噪声水平失配。

| 方法 | $\sigma_{\mathrm{test}}=0.005$ PSNR | SSIM | LPIPS | $\sigma_{\mathrm{test}}=0.02$ PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|
| Flower5-OT | 34.02 | 0.954 | 0.019 | 33.65 | 0.947 | 0.024 |
| 本文 | **35.19** | **0.965** | **0.018** | **34.57** | **0.954** | **0.020** |

### 4.4 附加结果

附录 E 提供额外定量与定性评估。表 11 与表 12 报告 400 张 AFHQ-Cat 与 1000 张 CelebA 更大测试集上的结果（含标准差）。附录还考察失真–感知折中（图 7 与图 8）、重建轨迹（图 11–13）、误差图（图 9）、推理代价（图 10）、算子失配（图 6）、求解器内部迭代（图 16）与后验样本多样性（图 14）。附录 E.4 把评估扩展到欠采样 Fourier 测量，附录 E.3 在玩具问题上研究后验采样与条件均值估计。

## 5. 结论

我们提出了测量条件流匹配，把前向算子直接嵌入学习到的条件速度场。我们把最优速度表示为测量条件后验均值的函数，并证明理想场把源分布输运到相应后验。在两个数据集的五个复原任务上，我们的方法以基于流的求解器推理代价的一小部分取得最佳总体失真指标。改变采样步数还使单个训练模型无需重训练即可覆盖失真–感知折中。

**局限。** 我们的理论分析假设已知线性前向模型与加性高斯噪声。把框架扩展到非线性测量过程与更一般的噪声模型是未来工作的重要方向。我们还聚焦线性插值与显式 Euler 采样；研究替代概率路径与数值求解器可能进一步提高采样效率。最后，实验集中在二维图像复原，在其他成像模态上的应用仍有待探索。

## 参考文献（英文原书目）

- [1] Mario Bertero, Patrizia Boccacci, and Christine De Mol, Introduction to Inverse Problems in Imaging, CRC press, 2021.
- [2] Michael T McCann, Kyong Hwan Jin, and Michael Unser, "Convolutional Neural Networks for Inverse Problems in Imaging: A Review," IEEE Signal Process Mag., vol. 34, no. 6, pp. 85–95, 2017.
- [3] Gregory Ongie, Ajil Jalal, Christopher A Metzler, Richard G Baraniuk, Alexandros G Dimakis, and Rebecca Willett, "Deep Learning Techniques for Inverse Problems in Imaging," IEEE J. Sel. Areas Inf. Theory, vol. 1, no. 1, pp. 39–56, 2020.
- [4] Andrey N. Tikhonov and Vasiliy Y. Arsenin, Solutions of Ill-Posed Problems, V. H. Winston & Sons, Washington, D.C., 1977.
- [5] Curtis R Vogel, Computational methods for inverse problems, SIAM, 2002.
- [6] Albert Tarantola, Inverse Problem Theory and Methods for Model Parameter Estimation, SIAM, 2005.
- [7] Ali Mohammad-Djafari, "Regularization, Bayesian inference, and Machine Learning Methods for Inverse Problems," Entropy, vol. 23, no. 12, pp. 1673, 2021.
- [8] Jonathan Ho, Ajay Jain, and Pieter Abbeel, "Denoising Diffusion Probabilistic Models," in Proc. NeurIPS, 2020.
- [9] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole, "Score-Based Generative Modeling through Stochastic Differential Equations," in Proc. ICLR, 2020.
- [10] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le, "Flow Matching for Generative Modeling," Proc. ICLR, 2023.
- [11] Michael Albergo and Eric Vanden-Eijnden, "Building Normalizing Flows with Stochastic Interpolants," in Proc. ICLR, 2023.
- [12] Xingchao Liu, Chengyue Gong, and Qiang Liu, "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow," in Proc. ICLR, 2023.
- [13] Giannis Daras, Hyungjin Chung, Chieh-Hsin Lai, Yuki Mitsufuji, Jong Chul Ye, Peyman Milanfar, Alexandros G Dimakis, and Mauricio Delbracio, "A Survey on Diffusion Models for Inverse Problems," arXiv:2410.00083, 2024.
- [14] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool, "Denoising Diffusion Models for Plug-and-Play Image Restoration," in Proc. CVPR, 2023.
- [15] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song, "Denoising Diffusion Restoration Models," in Proc. NeurIPS, 2022.
- [16] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat, "A Variational Perspective on Solving Inverse Problems with Diffusion Models," in Proc. ICLR, 2024.
- [17] Ségolène Tiffany Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl, "PnP-Flow: Plug-and-Play Image Restoration with Flow Matching," in Proc. ICLR, 2025.
- [18] Mehrsa Pourya, Bassam El Rawas, and Michael Unser, "Flower: A Flow-Matching Solver for Inverse Problems," in Proc. ICLR, 2026.
- [19] Yasi Zhang, Peiyu Yu, Yaxuan Zhu, Yingshan Chang, Feng Gao, Ying Nian Wu, and Oscar Leong, "Flow Priors for Linear Inverse Problems via Iterative Corrupted Trajectory Matching," in Proc. NeurIPS, 2024.
- [20] Chitwan Saharia, Jonathan Ho, William Chan, Tim Salimans, David J Fleet, and Mohammad Norouzi, "Image Super-resolution via Iterative Refinement," IEEE Trans. Pattern Anal. Mach. Intell., vol. 45, no. 4, pp. 4713–4726, 2022.
- [21] Mauricio Delbracio and Peyman Milanfar, "Inversion by Direct Iteration: An Alternative to Denoising Diffusion for Image Restoration," TMLR, 2023.
- [22] Guan-Horng Liu, Arash Vahdat, De-An Huang, Evangelos A Theodorou, Weili Nie, and Anima Anandkumar, "I2SB: Image-to-Image Schrödinger Bridge," in Proc. ICML, 2023.
- [23] Leonid I Rudin, Stanley Osher, and Emad Fatemi, "Nonlinear Total Variation Based Noise Removal Algorithms," Physica D: nonlinear phenomena, vol. 60, no. 1-4, pp. 259–268, 1992.
- [24] Amir Beck and Marc Teboulle, "A fast Iterative Shrinkage-thresholding Algorithm for Linear Inverse Problems," SIAM Journal on Imaging Sciences, vol. 2, no. 1, pp. 183–202, 2009.
- [25] Mário AT Figueiredo and Robert D Nowak, "An EM Algorithm for Wavelet-based Image Restoration," IEEE Trans. Image Proc., vol. 12, no. 8, pp. 906–916, 2003.
- [26] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg, "Plug-and-play Priors for Model Based Reconstruction," in IEEE Glob. Conf. Signal Inf. Process., 2013, pp. 945–948.
- [27] Yaniv Romano, Michael Elad, and Peyman Milanfar, "The Little Engine that Could: Regularization by Denoising (RED)," SIAM Journal on Imaging Sciences, vol. 10, no. 4, pp. 1804–1844, 2017.
- [28] Rizwan Ahmad, Charles A Bouman, Gregery T Buzzard, Stanley Chan, Sizhuo Liu, Edward T Reehorst, and Philip Schniter, "Plug-and-play Methods for Magnetic Resonance Imaging: Using Denoisers for Image Recovery," IEEE Signal Process Mag., vol. 37, no. 1, pp. 105–116, 2020.
- [29] Ernest Ryu, Jialin Liu, Sicheng Wang, Xiaohan Chen, Zhangyang Wang, and Wotao Yin, "Plug-and-Play Methods Provably Converge with Properly Trained Denoisers," in Proc. ICML, 2019.
- [30] Karol Gregor and Yann LeCun, "Learning Fast Approximations of Sparse Coding," in Proc. ICML, 2010, pp. 399–406.
- [31] Vishal Monga, Yuelong Li, and Yonina C Eldar, "Algorithm Unrolling: Interpretable, Efficient Deep Learning for Signal and Image Processing," IEEE Signal Process Mag., vol. 38, no. 2, pp. 18–44, 2021.
- [32] Alexander Tong, Kilian Fatras, Nikolay Malkin, Guillaume Huguet, Yanlei Zhang, Jarrid Rector-Brooks, Guy Wolf, and Yoshua Bengio, "Improving and Generalizing Flow-based Generative Models with Minibatch Optimal Transport," TMLR, pp. 1–34, 2024.
- [33] Rémi Gribonval and Pierre Machart, "Reconciling "Priors" and "Priors" without Prejudice?," Proc. NeurIPS, 2013.
- [34] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang, "Deep Learning Face Attributes in the Wild," in Proc. ICCV, 2015, pp. 3730–3738.
- [35] Yunjey Choi, Youngjung Uh, Jaejun Yoo, and Jung-Woo Ha, "StarGAN v2: Diverse Image Synthesis for Multiple Domains," in Proc. CVPR, 2020, pp. 8188–8197.
- [36] Samuel Hurault, Arthur Leclaire, and Nicolas Papadakis, "Gradient Step Denoiser for Convergent Plug-and-Play," in Proc. ICLR, 2022.
- [37] Kai Zhang, Yawei Li, Wangmeng Zuo, Lei Zhang, Luc Van Gool, and Radu Timofte, "Plug-and-Play Image Restoration with Deep Denoiser Prior," IEEE Trans. Pattern Anal. Mach. Intell., vol. 44, no. 10, pp. 6360–6376, 2021.
- [38] Jian Zhang and Bernard Ghanem, "ISTA-Net: Interpretable optimization-inspired deep network for image compressive sensing," in Proc. CVPR, 2018, pp. 1828–1837.
- [39] Ashwini Pokle, Matthew J. Muckley, Ricky T. Q. Chen, and Brian Karrer, "Training-free Linear Image Inverses via Flows," TMLR, 2024.
- [40] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman, "D-Flow: Differentiating through Flows for Controlled Generation," in Proc. ICML, 2024.
- [41] Richard Zhang, Phillip Isola, Alexei A. Efros, Eli Shechtman, and Oliver Wang, "The Unreasonable Effectiveness of Deep Features as a Perceptual Metric," in Proc. CVPR, 2018, pp. 586–595.
- [42] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye, "Diffusion Posterior Sampling for General Noisy Inverse Problems," in Proc. ICLR, 2023.
- [43] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz, "Pseudoinverse-guided diffusion models for inverse problems," in International Conference on Learning Representations, 2023.
- [44] Yinhuai Wang, Jiwen Yu, and Jian Zhang, "Zero-shot image restoration using denoising diffusion null-space model," in Proc. ICLR, 2023.
- [45] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song, "Improving Diffusion Inverse Problem Solving with Decoupled Noise Annealing," in Proc. CVPR, 2025.
- [46] Jeongsol Kim, Bryan Kim, Jaemin Kim, and Jong Chul Ye, "FlowDPS: Flow-driven posterior sampling for inverse problems," in Proc. ICCV, 2025.
- [47] Jian Xu, Delu Zeng, John Paisley, and Qibin Zhao, "What Do Flow-Based Inverse Solvers Approximate? A Posterior-Transport View," arXiv preprint arXiv:2606.24516, 2026.
- [48] Chitwan Saharia, William Chan, Huiwen Chang, Chris Lee, Jonathan Ho, Tim Salimans, David Fleet, and Mohammad Norouzi, "Palette: Image-to-Image Diffusion Models," in ACM SIGGRAPH Conf. Proc., 2022, pp. 1–10.
- [49] Hyungjin Chung, Jeongsol Lee, and Jong Chul Ye, "Direct Diffusion Bridge Using Data Consistency for Inverse Problems," in Proc. NeurIPS, 2023.
- [50] Zongsheng Yue, Jianyi Wang, and Chen Change Loy, "ResShift: Efficient Diffusion Model for Image Super-Resolution by Residual Shifting," in Proc. NeurIPS, 2023.
- [51] Haina Qin, Wenyang Luo, Libin Wang, Dandan Zheng, Jingdong Chen, Ming Yang, Bing Li, and Weiming Hu, "Reversing Flow for Image Restoration," in Proc. CVPR, 2025.
- [52] Michael Samuel Albergo, Mark Goldstein, Nicholas Matthew Boffi, Rajesh Ranganath, and Eric Vanden-Eijnden, "Stochastic Interpolants with Data-Dependent Couplings," in Proc. ICML, 2024.
- [53] Jannis Chemseddine, Paul Hagemann, Gabriele Steidl, and Christian Wald, "Conditional Wasserstein Distances with Applications in Bayesian OT Flow Matching," J. Mach. Learn. Res., vol. 26, no. 141, pp. 1–47, 2025.
- [54] Shadab Ahamed and Eldad Haber, "DAWN-FM: Data-aware and Noise-informed Flow Matching for Solving Inverse Problems," arXiv:2412.04766, 2024.
- [55] Yan Yang, Jian Sun, Huibin Li, and Zongben Xu, "Deep ADMM-Net for Compressive Sensing MRI," in Proc. NeurIPS, 2016.
- [56] Jonas Adler and Ozan Öktem, "Learned Primal-Dual Reconstruction," IEEE Trans. Med. Img., vol. 37, no. 6, pp. 1322–1332, 2018.
- [57] Hemant K. Aggarwal, Merry P. Mani, and Mathews Jacob, "MoDL: Model-Based Deep Learning Architecture for Inverse Problems," IEEE Trans. Med. Img., vol. 38, no. 2, pp. 394–405, 2019.
- [58] Anuroop Sriram, Jure Zbontar, Tullie Murrell, Aaron Defazio, C. Lawrence Zitnick, Nafissa Yakubova, Florian Knoll, and Patricia Johnson, "End-to-End Variational Networks for Accelerated MRI Reconstruction," in Proc. MICCAI, 2020, pp. 64–73.
- [59] Yochai Blau and Tomer Michaeli, "The Perception-Distortion Tradeoff," in Proc. CVPR, 2018, pp. 6228–6237.
- [60] Dror Freirich, Tomer Michaeli, and Ron Meir, "A Theory of the Distortion-Perception Tradeoff in Wasserstein Space," in Proc. NeurIPS, 2021, vol. 34, pp. 25661–25672.
- [61] Guy Ohayon, Tomer Michaeli, and Michael Elad, "Posterior-Mean Rectified Flow: Towards Minimum MSE Photo-Realistic Image Restoration," in Proc. ICLR, 2025.
- [62] Nicolas Zilberstein, Morteza Mardani, and Santiago Segarra, "Flow Map Denoisers: Traversing the Distortion-Perception Plane for Inverse Problems," arXiv:2606.19802, 2026.
- [63] Matthieu Terris, Samuel Hurault, Maxime Song, and Julián Tachella, "Reconstruct Anything Model: A Lightweight Foundation Model for Computational Imaging," in Proc. ICLR, 2026.
- [64] Noam Elata, Hyungjin Chung, Jong Chul Ye, Tomer Michaeli, and Michael Elad, "InvFussion: Bridging Supervised and Zero-Shot Diffusion for Inverse Problems," in Proc. NeurIPS, 2025.

## 附录 A. 理论结果证明

**证明路线图。** 证明沿用与方法相同的两阶段构造。第一，把联合观测 $(\mathbf x_t,\mathbf y)$ 归约为等价的高斯去噪问题，[33] 的高斯 MMSE 刻画随后给出后验均值的变分形式。第二，证明该均值确定条件速度、该速度满足条件连续性方程，且其 ODE 把高斯源输运向后验。下面各引理分别验证这些步骤，最终证明把它们组合起来。

### A.1 变分刻画

高斯 MMSE 刻画把后验均值估计与变分优化联系起来。对高斯噪声中观测到的信号，后验均值是二次数据拟合项加上由信号分布与噪声协方差决定的隐式正则项的唯一极小化者。我们用该结果把测量条件后验均值表示为某个优化问题的解。

**引理 1（高斯 MMSE 刻画 [33, Cor. 1]）。** 设 $\mathbf z$ 在 $\mathbb R^n$ 上具有非退化分布，且

$$
\mathbf u=\mathbf z+\boldsymbol\xi,\qquad\boldsymbol\xi\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma),\quad\boldsymbol\Sigma\succ0, \tag{28}
$$

其中 $\boldsymbol\xi$ 与 $\mathbf z$ 独立。则存在函数 $\phi:\mathbb R^n\to\mathbb R\cup\{+\infty\}$，使

$$
\mathbb E[\mathbf z\mid\mathbf u]=\arg\min_{\mathbf z'\in\mathbb R^n}\left\{\frac12\left\|\mathbf u-\mathbf z'\right\|_{\boldsymbol\Sigma^{-1}}^2+\phi(\mathbf z')\right\}. \tag{29}
$$

该极小化者是唯一全局极小化者与驻点，且 $\phi$ 至多相差一个加性常数唯一。

**证明。** 这是 [33] 的推论 1，用 $\|\mathbf a\|_{\mathbf B}^2=\mathbf a^\top\mathbf B\mathbf a$ 重述。我们只使用 (29) 的存在性与唯一性结论。

插值状态 $\mathbf x_t$ 与测量 $\mathbf y$ 都是干净图像 $\mathbf x_1$ 的含噪线性观测。由于二者噪声项独立，两个观测可堆叠为噪声协方差块对角的单一线性高斯模型。

**引理 2。** 对 $t\in(0,1)$，定义

$$
\widetilde{\mathbf y}=\begin{pmatrix}\mathbf x_t\\ \mathbf y\end{pmatrix},\qquad\widetilde{\mathbf A}=\begin{pmatrix}t\mathbf I\\ \mathbf A\end{pmatrix},\qquad\widetilde{\boldsymbol\Sigma}=\begin{pmatrix}(1-t)^2\mathbf I&\mathbf 0\\ \mathbf 0&\sigma^2\mathbf I\end{pmatrix}. \tag{30}
$$

则

$$
\widetilde{\mathbf y}=\widetilde{\mathbf A}\mathbf x_1+\widetilde{\mathbf b},\qquad\widetilde{\mathbf b}\sim\mathcal N(\mathbf 0,\widetilde{\boldsymbol\Sigma}), \tag{31}
$$

且 $\widetilde{\mathbf b}$ 与 $\mathbf x_1$ 独立。

**证明。** 插值方程给出 $\mathbf x_t=t\mathbf x_1+(1-t)\mathbf x_0$，测量方程给出 $\mathbf y=\mathbf A\mathbf x_1+\boldsymbol\eta$。因此

$$
\widetilde{\mathbf b}=\begin{pmatrix}(1-t)\mathbf x_0\\ \boldsymbol\eta\end{pmatrix}. \tag{32}
$$

由于 $\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$ 与 $\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I)$ 彼此独立且与 $\mathbf x_1$ 独立，所述协方差与独立性成立。

增广模型是线性高斯的，但尚未具有引理 1 所需的加性去噪形式。我们按噪声水平组合插值状态与测量得到 $\mathbf u_t$。所得变量等价于在加性高斯噪声下直接观测 $\mathbf x_1$，其精度矩阵为 $\mathbf M_t$。

**引理 3。** 令

$$
\mathbf M_t=\widetilde{\mathbf A}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf A}=\frac{t^2}{(1-t)^2}\mathbf I+\frac{1}{\sigma^2}\mathbf A^\top\mathbf A \tag{33}
$$

并定义

$$
\mathbf u_t=\mathbf M_t^{-1}\widetilde{\mathbf A}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf y}. \tag{34}
$$

则 $\mathbf M_t\succ0$ 且

$$
\mathbf u_t=\mathbf x_1+\boldsymbol\xi_t,\qquad\boldsymbol\xi_t\sim\mathcal N\left(\mathbf 0,\mathbf M_t^{-1}\right), \tag{35}
$$

其中 $\boldsymbol\xi_t$ 与 $\mathbf x_1$ 独立。

**证明。** 对每个非零 $\mathbf a\in\mathbb R^n$，

$$
\mathbf a^\top\mathbf M_t\mathbf a=\frac{t^2}{(1-t)^2}\|\mathbf a\|_2^2+\frac{1}{\sigma^2}\|\mathbf A\mathbf a\|_2^2>0. \tag{36}
$$

故 $\mathbf M_t\succ0$。把 (31) 代入 (34) 得

$$
\mathbf u_t=\mathbf x_1+\mathbf M_t^{-1}\widetilde{\mathbf A}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf b}=:\mathbf x_1+\boldsymbol\xi_t. \tag{37}
$$

噪声 $\boldsymbol\xi_t$ 是高斯的且与 $\mathbf x_1$ 独立，其协方差为

$$
\mathrm{Cov}(\boldsymbol\xi_t)=\mathbf M_t^{-1}\widetilde{\mathbf A}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\boldsymbol\Sigma}\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf A}\mathbf M_t^{-1}=\mathbf M_t^{-1}. \tag{38}
$$

这证明了 (35)。

归约观测 $\mathbf u_t$ 只有在保留 $(\mathbf x_t,\mathbf y)$ 中关于 $\mathbf x_1$ 的全部信息时才有用。下一引理表明增广数据拟合项等于涉及 $\mathbf u_t$ 的高斯去噪项（至多相差一个与未知图像无关的常数）。因此对 $\mathbf u_t$ 条件化给出的后验均值与对原观测条件化相同。

**引理 4。** (34) 中统计量 $\mathbf u_t$ 对 $\widetilde{\mathbf y}$ 中的 $\mathbf x_1$ 充分。因此

$$
\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]=\mathbb E[\mathbf x_1\mid\widetilde{\mathbf y}]=\mathbb E[\mathbf x_1\mid\mathbf u_t]. \tag{39}
$$

此外，对每个 $\mathbf x\in\mathbb R^n$，

$$
\frac{1}{2(1-t)^2}\|\mathbf x_t-t\mathbf x\|_2^2+\frac{1}{2\sigma^2}\|\mathbf y-\mathbf A\mathbf x\|_2^2=\frac12\|\mathbf u_t-\mathbf x\|_{\mathbf M_t}^2+c(\widetilde{\mathbf y}),
$$

其中 $c(\widetilde{\mathbf y})$ 不依赖 $\mathbf x$。

**证明。** 由 $\mathbf M_t$ 与 $\mathbf u_t$ 的定义，

$$
\widetilde{\mathbf A}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf y}=\mathbf M_t\mathbf u_t. \tag{40}
$$

展开增广二次型并配方得

$$
\frac12\|\widetilde{\mathbf y}-\widetilde{\mathbf A}\mathbf x\|_{\widetilde{\boldsymbol\Sigma}^{-1}}^2=\frac12\mathbf x^\top\mathbf M_t\mathbf x-\mathbf x^\top\mathbf M_t\mathbf u_t+\frac12\widetilde{\mathbf y}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf y}=\frac12\|\mathbf u_t-\mathbf x\|_{\mathbf M_t}^2+c(\widetilde{\mathbf y}),
$$

其中

$$
c(\widetilde{\mathbf y})=\frac12\widetilde{\mathbf y}^\top\widetilde{\boldsymbol\Sigma}^{-1}\widetilde{\mathbf y}-\frac12\mathbf u_t^\top\mathbf M_t\mathbf u_t. \tag{41}
$$

逐块展开左边即得 (40)。

条件似然因此因子化为

$$
p(\widetilde{\mathbf y}\mid\mathbf x_1)=r(\widetilde{\mathbf y})\exp\left(-\frac12\|\mathbf u_t-\mathbf x_1\|_{\mathbf M_t}^2\right), \tag{42}
$$

其中 $r(\widetilde{\mathbf y})$ 与 $\mathbf x_1$ 无关。因子分解判据表明 $\mathbf u_t$ 对 $\mathbf x_1$ 充分，这证明了 (39)。

前面引理把观测 $(\mathbf x_t,\mathbf y)$ 归约为等价的高斯去噪观测 $\mathbf u_t$，且不丢失关于 $\mathbf x_1$ 的信息。因此可把高斯 MMSE 刻画应用于 $\mathbf u_t$，再用原观测重写其二次项。所得目标包含一个与插值状态相关的项与一个显式强制测量模型的项。

**引理 5。** 假设 $p_1$ 非退化。对每个 $t\in(0,1)$，存在函数 $\phi_t:\mathbb R^n\to\mathbb R\cup\{+\infty\}$（至多相差一个加性常数唯一），使

$$
\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]=\arg\min_{\mathbf x\in\mathbb R^n}\left\{\frac{1}{2(1-t)^2}\|\mathbf x_t-t\mathbf x\|_2^2+\frac{1}{2\sigma^2}\|\mathbf y-\mathbf A\mathbf x\|_2^2+\phi_t(\mathbf x)\right\}. \tag{43}
$$

后验均值是唯一全局极小化者与驻点。为可读性省略 $\phi_t$ 对固定算子 $\mathbf A$ 与噪声水平 $\sigma$ 的依赖。

**证明。** 引理 3 把 $\mathbf u_t$ 表示为高斯去噪模型

$$
\mathbf u_t=\mathbf x_1+\boldsymbol\xi_t,\qquad\boldsymbol\xi_t\sim\mathcal N\left(\mathbf 0,\mathbf M_t^{-1}\right). \tag{44}
$$

对噪声协方差 $\mathbf M_t^{-1}$ 应用引理 1 得到一个函数 $\phi_t$，使

$$
\mathbb E[\mathbf x_1\mid\mathbf u_t]=\arg\min_{\mathbf x\in\mathbb R^n}\left\{\frac12\|\mathbf u_t-\mathbf x\|_{\mathbf M_t}^2+\phi_t(\mathbf x)\right\}. \tag{45}
$$

引理 4 表明条件均值等于 $\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y]$，且该二次项与 (43) 中两个数据项仅相差一个与 $\mathbf x$ 无关的常数。加上或去掉该常数不改变极小化者或驻点，故结论成立。

### A.2 条件概率流

变分结果刻画后验均值，而流匹配需要速度场。在线性插值下，每条轨迹的速度只用其端点 $\mathbf x_1$ 与当前状态 $\mathbf x_t$ 即可写出。因此对以 $\mathbf x_t$ 与 $\mathbf y$ 为条件的可能端点取平均，就可用后验均值直接表示最优条件速度。

**引理 6。** 对 $t\in[0,1)$，最优测量条件速度为

$$
\mathbf v(\mathbf x,t,\mathbf y)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t=\mathbf x,\mathbf y]=\frac{\mathbb E[\mathbf x_1\mid\mathbf x_t=\mathbf x,\mathbf y]-\mathbf x}{1-t}. \tag{46}
$$

**证明。** 线性路径的速度为 $\dot{\mathbf x}_t=\mathbf x_1-\mathbf x_0$。由于

$$
\mathbf x_0=\frac{\mathbf x_t-t\mathbf x_1}{1-t}, \tag{47}
$$

得

$$
\mathbf x_1-\mathbf x_0=\frac{\mathbf x_1-\mathbf x_t}{1-t}. \tag{48}
$$

对 $\mathbf x_t=\mathbf x$ 与 $\mathbf y$ 取条件期望即证 (46)。

为建立概率流，必须首先表明后验均值随当前状态 $\mathbf x$ 光滑变化。有界支撑假设允许通过条件密度求导。所得 Jacobian 具有简单的协方差形式，用于控制条件速度的正则性。

**引理 7（条件均值的正则性）。** 假设 $\mathrm{supp}\,p_1\subseteq B(\mathbf 0,R)$ 并固定 $\mathbf y$。定义

$$
\mathbf m_t(\mathbf x)=\mathbb E[\mathbf x_1\mid\mathbf x_t=\mathbf x,\mathbf y]. \tag{49}
$$

对每个 $t\in[0,1)$，条件密度 $p_t(\mathbf x\mid\mathbf y)$ 正且光滑，$\mathbf m_t$ 关于 $(\mathbf x,t)$ 光滑。此外 $\|\mathbf m_t(\mathbf x)\|_2\le R$，且

$$
\nabla_{\mathbf x}\mathbf m_t(\mathbf x)=\frac{t}{(1-t)^2}\mathrm{Cov}(\mathbf x_1\mid\mathbf x_t=\mathbf x,\mathbf y). \tag{50}
$$

**证明。** 令 $\nu=p(\mathbf x_1\mid\mathbf y)$。由于高斯似然为正，$\nu$ 支撑于 $B(\mathbf 0,R)$。对 $t<1$，$\mathbf x_t$ 的条件密度为

$$
p_t(\mathbf x\mid\mathbf y)=\int\varphi_{1-t}(\mathbf x-t\mathbf x_1)\nu(\mathrm d\mathbf x_1), \tag{51}
$$

其中 $\varphi_s$ 表示 $\mathcal N(\mathbf 0,s^2\mathbf I)$ 的密度。高斯核正且光滑。由于 $\nu$ 有界支撑，其导数在 $\mathbb R^n\times[0,1)$ 的紧子集上一致地被控制，因此可在积分号下求导。

条件分布支撑于 $B(\mathbf 0,R)$，故其均值满足 $\|\mathbf m_t(\mathbf x)\|_2\le R$。贝叶斯公式给出

$$
q_{\mathbf x,t}(\mathrm d\mathbf x_1)=\frac{\varphi_{1-t}(\mathbf x-t\mathbf x_1)}{p_t(\mathbf x\mid\mathbf y)}\nu(\mathrm d\mathbf x_1). \tag{52}
$$

对其对数密度关于 $\mathbf x$ 求导得

$$
\nabla_{\mathbf x}\log q_{\mathbf x,t}(\mathbf x_1)=\frac{t}{(1-t)^2}\left(\mathbf x_1-\mathbf m_t(\mathbf x)\right). \tag{53}
$$

由于 $\mathbf m_t(\mathbf x)=\int\mathbf x_1q_{\mathbf x,t}(\mathrm d\mathbf x_1)$，在积分号下求导即得 (50)。

唯一概率流要求条件速度随当前状态正则变化。引理 7 的 Jacobian 恒等式使我们能通过 $\mathbf x_1$ 的条件协方差界定该变化。有界支撑给出统一的协方差界，使速度在每个时间区间 $[0,\tau]$（$\tau<1$）上全局 Lipschitz。

**引理 8（Lipschitz 条件速度）。** 在引理 7 的假设下，$\mathbf v(\cdot,t,\mathbf y)$ 对每个 $t\in[0,1)$ 全局 Lipschitz，且

$$
\mathrm{Lip}\left(\mathbf v(\cdot,t,\mathbf y)\right)\le\frac{1}{1-t}+\frac{tR^2}{(1-t)^3}. \tag{54}
$$

该界在每个 $\tau<1$ 上关于 $t\in[0,\tau]$ 一致。

**证明。** 利用引理 6 与引理 7，

$$
\nabla_{\mathbf x}\mathbf v(\mathbf x,t,\mathbf y)=\frac{t}{(1-t)^3}\mathrm{Cov}(\mathbf x_1\mid\mathbf x_t=\mathbf x,\mathbf y)-\frac{1}{1-t}\mathbf I. \tag{55}
$$

对每个单位向量 $\mathbf a$，

$$
\mathbf a^\top\mathrm{Cov}(\mathbf x_1\mid\mathbf x_t=\mathbf x,\mathbf y)\mathbf a\le\mathbb E\left[(\mathbf a^\top\mathbf x_1)^2\mid\mathbf x_t=\mathbf x,\mathbf y\right]\le R^2. \tag{56}
$$

因此条件协方差的算子范数至多为 $R^2$，给出 (54)。对每个 $\tau<1$，

$$
\sup_{t\in[0,\tau]}\mathrm{Lip}\left(\mathbf v(\cdot,t,\mathbf y)\right)\le\frac{1}{1-\tau}+\frac{\tau R^2}{(1-\tau)^3}<\infty. \tag{57}
$$

在 $t=0$ 处，恒等式 $\mathbf v(\mathbf x,0,\mathbf y)=\mathbb E[\mathbf x_1\mid\mathbf y]-\mathbf x$ 给出 Lipschitz 常数 1，与该界一致。

对每个可能端点 $\mathbf x_1$，线性插值定义一个具有已知速度的简单高斯概率路径。条件分布 $p_t(\mathbf x\mid\mathbf y)$ 通过把这些路径按 $\mathbf x_1$ 的后验分布平均得到。平均它们的概率通量即得最优测量条件速度并建立相应连续性方程。

**引理 9（条件连续性方程）。** 在引理 8 的假设下，条件密度 $p_t(\mathbf x\mid\mathbf y)$ 满足

$$
\partial_tp_t(\mathbf x\mid\mathbf y)+\nabla\cdot\left(p_t(\mathbf x\mid\mathbf y)\mathbf v(\mathbf x,t,\mathbf y)\right)=0,\qquad t\in[0,1). \tag{58}
$$

**证明。** 固定 $\mathbf y$ 并记 $\nu=p(\mathbf x_1\mid\mathbf y)$。对固定端点 $\mathbf x_1$，密度

$$
p_t(\mathbf x\mid\mathbf x_1)=\varphi_{1-t}(\mathbf x-t\mathbf x_1) \tag{59}
$$

由确定性映射 $\mathbf x_0\mapsto t\mathbf x_1+(1-t)\mathbf x_0$ 诱导，因此满足

$$
\partial_tp_t(\mathbf x\mid\mathbf x_1)+\nabla\cdot\left(p_t(\mathbf x\mid\mathbf x_1)\frac{\mathbf x_1-\mathbf x}{1-t}\right)=0. \tag{60}
$$

由于 $\mathbf x_0$ 与 $(\mathbf x_1,\mathbf y)$ 独立，

$$
p_t(\mathbf x\mid\mathbf y)=\int p_t(\mathbf x\mid\mathbf x_1)\nu(\mathrm d\mathbf x_1). \tag{61}
$$

把 (60) 关于 $\nu$ 积分得

$$
\partial_tp_t(\mathbf x\mid\mathbf y)=-\nabla\cdot\int p_t(\mathbf x\mid\mathbf x_1)\frac{\mathbf x_1-\mathbf x}{1-t}\nu(\mathrm d\mathbf x_1). \tag{62}
$$

由贝叶斯公式与引理 6，(62) 中的积分等于

$$
p_t(\mathbf x\mid\mathbf y)\mathbb E\left[\frac{\mathbf x_1-\mathbf x}{1-t}\mid\mathbf x_t=\mathbf x,\mathbf y\right]=p_t(\mathbf x\mid\mathbf y)\mathbf v(\mathbf x,t,\mathbf y). \tag{63}
$$

代入即证 (58)。

连续性方程确定了与条件速度相关联的概率路径，但良定义的采样器还要求相应 ODE 具有唯一轨迹。Lipschitz 界保证在每个早于 $t=1$ 结束的区间上存在唯一流。由于 ODE 流与条件路径从同一高斯分布出发并满足同一连续性方程，它们的分布一致。随后条件路径在 $t$ 趋于 1 时收敛到测量条件后验。

**引理 10（条件输运与后极限）。** 在引理 8 的假设下，对每个 $\tau<1$，ODE

$$
\frac{\mathrm d\mathbf x_t}{\mathrm dt}=\mathbf v(\mathbf x_t,t,\mathbf y) \tag{64}
$$

生成唯一流映射 $\Phi_{0\to\tau}$，满足

$$
(\Phi_{0\to\tau})_\#\mathcal N(\mathbf 0,\mathbf I)=p_\tau(\cdot\mid\mathbf y). \tag{65}
$$

此外，当 $\tau\to1^-$ 时

$$
p_\tau(\cdot\mid\mathbf y)\Rightarrow p(\mathbf x_1\mid\mathbf y)\qquad(\tau\to1^-). \tag{66}
$$

**证明。** 引理 7 与引理 8 表明速度在时间上连续、在 $\mathbf x$ 上全局 Lipschitz，且在每个区间 $[0,\tau]$（$\tau<1$）上一致。它关于 $\mathbf x$ 至多线性增长。Picard–Lindelöf 定理因此给出每个此类区间上的唯一全局流映射。

初始分布经该流的推前满足与 $\mathbf v$ 关联的连续性方程。由引理 9，$p_t(\cdot\mid\mathbf y)$ 满足同一方程。由于 $\mathbf x_0$ 与 $\mathbf y$ 独立，两个解具有相同初始分布：

$$
p_0(\cdot\mid\mathbf y)=\mathcal N(\mathbf 0,\mathbf I). \tag{67}
$$

全局 Lipschitz 速度下输运测度的唯一性证明 (65)。

最后，按 $\mathbf x_1\sim p(\mathbf x_1\mid\mathbf y)$ 与 $\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$ 独立抽样来耦合条件路径。则

$$
\mathbf x_\tau=\tau\mathbf x_1+(1-\tau)\mathbf x_0\longrightarrow\mathbf x_1\quad\text{几乎必然}. \tag{68}
$$

几乎必然收敛蕴含依分布收敛，证明 (66)。该结果不需要把流映射延拓到 $t=1$。

### A.3 命题 1 的证明

**证明。** 引理 5 证明测量条件后验均值是 (13) 的唯一极小化者。引理 6 把该均值转化为最优条件速度。最后，引理 9 与引理 10 表明所得速度定义条件概率流并弱收敛到测量条件后验。这些正是命题 1 的两个论断。

## 附录 B. 算法细节

本节给出用于参数化条件速度的 HQS 迭代实现细节。正文给出 HQS 目标及其两个交替子问题 (17) 与 (18)。

### B.1 数据一致性更新

$\mathbf x$ 子问题为

$$
\mathbf x^{k+1}=\arg\min_{\mathbf x}\left\{\frac{1}{2\sigma^2}\|\mathbf y-\mathbf A\mathbf x\|_2^2+\frac{\mu}{2}\left\|\mathbf x-\mathbf z^k\right\|_2^2\right\}. \tag{69}
$$

其最优性条件为

$$
\left(\sigma^{-2}\mathbf A^\top\mathbf A+\mu\mathbf I\right)\mathbf x^{k+1}=\sigma^{-2}\mathbf A^\top\mathbf y+\mu\mathbf z^k. \tag{70}
$$

定义 $\rho=\mu\sigma^2$ 即得实现所用的正规方程

$$
\left(\mathbf A^\top\mathbf A+\rho\mathbf I\right)\mathbf x^{k+1}=\mathbf A^\top\mathbf y+\rho\mathbf z^k. \tag{71}
$$

该更新显式依赖前向算子 $\mathbf A$。本文所考虑算子的闭式解见附录 B.4。

### B.2 学习正则化更新

精确 $\mathbf z$ 子问题为

$$
\mathbf z_\star^{k+1}=\arg\min_{\mathbf z}\left\{\phi_t(\mathbf z)+\frac{1}{2(1-t)^2}\left\|\mathbf x_t-t\mathbf z\right\|_2^2+\frac{\mu}{2}\left\|\mathbf x^{k+1}-\mathbf z\right\|_2^2\right\}. \tag{72}
$$

两个二次项可写为加权残差

$$
\frac12\left\|\widetilde{\mathbf y}_k-\widetilde{\mathbf A}_k\mathbf z\right\|_{\widetilde{\boldsymbol\Sigma}_k^{-1}}^2, \tag{73}
$$

其中

$$
\widetilde{\mathbf y}_k=\begin{pmatrix}\mathbf x_t\\ \mathbf x^{k+1}\end{pmatrix},\qquad\widetilde{\mathbf A}_k=\begin{pmatrix}t\mathbf I\\ \mathbf I\end{pmatrix},\qquad\widetilde{\boldsymbol\Sigma}_k=\begin{pmatrix}(1-t)^2\mathbf I&\mathbf 0\\ \mathbf 0&\mu^{-1}\mathbf I\end{pmatrix}. \tag{74}
$$

配方把两个观测归约为充分统计量

$$
\mathbf u_k=\frac{\frac{t}{(1-t)^2}\mathbf x_t+\mu\mathbf x^{k+1}}{\frac{t^2}{(1-t)^2}+\mu}, \tag{75}
$$

其精度为

$$
\mathbf M_k=\left(\frac{t^2}{(1-t)^2}+\mu\right)\mathbf I. \tag{76}
$$

因此 (72) 等价于（至多相差与 $\mathbf z$ 无关的项）

$$
\mathbf z_\star^{k+1}=\arg\min_{\mathbf z}\left\{\phi_t(\mathbf z)+\frac12\left\|\mathbf u_k-\mathbf z\right\|_{\mathbf M_k}^2\right\}. \tag{77}
$$

于是精确更新对插值状态与数据一致迭代的精度加权组合做去噪。该归约识别出正则化子问题的形式，但并不意味着 (77) 的任意极小化者都是后验均值。特别地，[33] 中 MMSE 刻画的逆命题一般并不成立。

由于 $\phi_t$ 不可得，我们遵循 PnP 实践 [26] 用学习到的估计器替代精确更新：

$$
\hat{\mathbf z}^{k+1}=\mathcal R_\theta\left(\mathbf x^{k+1},\mathbf x_t,t\right). \tag{78}
$$

网络分别接收 (75) 的两个分量，使其相对权重可依赖 $t$ 与 HQS 参数。

遵循 [29]，我们把学习估计向数据一致迭代阻尼：

$$
\mathbf z^{k+1}=(1-\beta)\mathbf x^{k+1}+\beta\hat{\mathbf z}^{k+1},\qquad\beta\in[0,1]. \tag{79}
$$

阻尼保留 $\mathbf x^{k+1}$ 的显式贡献，防止学习估计器完全覆盖数据一致迭代。

### B.3 速度参数化与代价

从 $\mathbf z^0=\mathbf x_t$ 出发，我们交替 (71)、(78) 与 (79) 共 $K$ 次迭代。最终迭代估计测量条件后验均值：

$$
\mathbf z_\theta^K(\mathbf x_t,t,\mathbf y)\approx\mathbb E[\mathbf x_1\mid\mathbf x_t,\mathbf y], \tag{80}
$$

并由 (19) 定义学习到的条件速度。

网络参数 $\theta$ 只通过 $\mathcal R_\theta$ 进入。每次速度评估需要 $K$ 次数据一致性求解与 $K$ 次学习估计器评估。由于每次数据一致性求解都依赖 $\mathbf A$ 与 $\mathbf y$，前向算子作用于学习速度场的每个内层迭代。算法 3 总结算子感知后验均值评估。

> **算法 3　算子感知后验均值估计**
> **Require：** 插值状态 $\mathbf x_t$、时间 $t<1$、测量 $\mathbf y$、前向算子 $\mathbf A$、学习估计器 $\mathcal R_\theta$、迭代数 $K$、耦合 $\rho$、阻尼 $\beta$
> **Ensure：** 后验均值估计 $\mathbf z^K$
> 1: $\mathbf z^0\leftarrow\mathbf x_t$
> 2: **for** $k=0,\dots,K-1$ **do**
> 3: 　$\mathbf x^{k+1}\leftarrow\left(\mathbf A^\top\mathbf A+\rho\mathbf I\right)^{-1}\left(\mathbf A^\top\mathbf y+\rho\mathbf z^k\right)$
> 4: 　$\hat{\mathbf z}^{k+1}\leftarrow\mathcal R_\theta(\mathbf x^{k+1},\mathbf x_t,t)$
> 5: 　$\mathbf z^{k+1}\leftarrow(1-\beta)\mathbf x^{k+1}+\beta\hat{\mathbf z}^{k+1}$
> 6: **return** $\mathbf z^K$

### B.4 算子特定的数据一致性解

**图像去噪。** 去噪时 $\mathbf A=\mathbf I$，(71) 给出

$$
\mathbf x^{k+1}=\frac{\mathbf y+\rho\mathbf z^k}{1+\rho}. \tag{81}
$$

该更新是测量与当前迭代的加权平均。

**图像修复。** 修复时 $\mathbf A=\mathbf M$ 是满足 $\mathbf M^\top\mathbf M=\mathbf M$ 的对角二元掩码。因此 (71) 可逐元素求解：

$$
x_i^{k+1}=\begin{cases}\dfrac{y_i+\rho z_i^k}{1+\rho}, & i\in\Omega,\\[8pt] z_i^k, & i\notin\Omega,\end{cases} \tag{82}
$$

其中 $\Omega$ 表示观测像素。

**图像超分辨率。** 我们用不带抗混叠预滤波的跨步下采样实现超分辨率。前向算子保留像素的周期子集，$\mathbf A^\top\mathbf A$ 是对角二元掩码，因此更新为 (82)，其中 $\mathbf y$ 替换为 $\mathbf A^\top\mathbf y$，$\Omega$ 表示采样网格位置。

**图像去模糊。** 去模糊时 $\mathbf A=\mathbf H$ 是空间不变模糊。在循环边界条件下 $\mathbf H=\mathbf F^H\boldsymbol\Lambda\mathbf F$，其中 $\boldsymbol\Lambda$ 含模糊核的 Fourier 系数。(71) 随后给出

$$
\mathbf x^{k+1}=\mathbf F^H\left[\frac{\boldsymbol\Lambda\mathbf F\mathbf y+\rho\mathbf F\mathbf z^k}{|\boldsymbol\Lambda|^2+\rho}\right], \tag{83}
$$

其中括号内运算均逐元素进行。

**欠采样 Fourier 测量。** 对附录 E.4 的压缩感知实验，令 $\mathbf A=\mathbf P\mathbf F$，其中 $\mathbf F$ 是正交二维 DFT，$\mathbf P=\mathrm{diag}(\mathbf p)$ 是采样掩码。记 $\hat{\mathbf z}^k=\mathbf F\mathbf z^k$，Fourier 域更新为

$$
\hat x_i^{k+1}=\begin{cases}\dfrac{y_i+\rho\hat z_i^k}{1+\rho}, & i\in\Omega,\\[8pt] \hat z_i^k, & i\notin\Omega,\end{cases}\qquad\mathbf x^{k+1}=\Re\left(\mathbf F^H\hat{\mathbf x}^{k+1}\right). \tag{84}
$$

对我们实验中所用共轭对称掩码，取实部等价于求解相应实正规方程。该算子对每个颜色通道独立施加。

**一般线性算子。** 对无可利用结构的算子，(71) 可用共轭梯度求解。本文所用全部算子都允许上述闭式更新。


## 附录 C. 相关工作

成像逆问题的生成式求解器主要在一点上不同：前向算子 $\mathbf A$ 是只在推理时进入、通过算子感知架构进入，还是在条件训练中进入。我们沿该轴组织先前工作。

**依赖预训练先验的推理时引导。** 扩散类方法把无条件先验与采样时的测量一致性结合。DPS 与 $\Pi$GDM 用去噪后的干净图像估计近似似然引导 [42, 43]；DDRM 与 DDNM 利用 $\mathbf A$ 的谱结构或零空间结构 [15, 44]；DiffPIR、变分 PnP 扩散与 DAPS 在生成更新与优化、投影或条件重采样之间交替 [14, 16, 45]。基于流的对应方法包括 OT-ODE、D-Flow、Flow Priors、FlowDPS、PnP-Flow 与 Flower [39, 40, 19, 46, 17, 18]。这些方法可在许多兼容算子上复用预训练先验，但在推理时只构造测量条件动力学的近似。近期后验输运分析把若干此类近似纳入统一框架并界定其后验偏差 [47]。

**摊销条件模型。** 条件复原方法改为从配对数据学习测量到图像的动力学。例子包括 SR3、Palette、InDI、I²SB、条件扩散桥、ResShift 与 ResFlow [20, 48, 21, 22, 49, 50, 51]。在流匹配中，数据相关随机插值与条件 Wasserstein 表述提供了理论基础 [52, 53]，而 DAWN-FM 把其速度场条件化于测量嵌入（通常为 $\mathbf A^\top\mathbf y$）与噪声水平 [54]。多数此类模型针对特定任务或退化族训练，并通过 $\mathbf y$、$\mathbf A^\top\mathbf y$ 或学习表示编码测量。我们的区别在于 $\mathbf A$ 通过生成动力学内部的数据一致性更新显式作用。

**算子感知的学习求解器。** 即插即用方法在数据保真更新中保留前向算子，同时用学习去噪器替代正则项 [26, 37, 36]。算法展开使这些迭代可端到端训练，产生 ISTA-Net、ADMM-Net、learned primal–dual、MoDL 与 VarNet 等方法 [38, 55, 56, 57, 58]。MoDL 在其数据一致性与共享权重学习更新之间的交替上尤其接近。这些架构通常训练为点估计器，本身并不定义后验采样器。我们的方法通过在每步 ODE 的每个内层迭代施加数据一致性，把它们的算子感知结构引入生成速度场。

**失真–感知控制。** 失真–感知折中是图像复原的基本问题 [59]。对 MSE 失真与 Wasserstein 感知，最优估计器在最小 MSE 与完美感知两个端点之间描绘一条 Wasserstein 测地线 [60]。PMRF 通过把后验均值估计输运向数据分布来实现该思想 [61]；相关插值机制出现在 InDI 与数据相关插值中 [21, 52]。流映射去噪器同样产生一族遍历失真–感知平面的估计器，并在高斯设定下建立最优性 [62]。我们的 Euler 步数 $N$ 起类似的经验作用。在理想条件速度下，一个 Euler 步退化为条件均值更新；对学习到的速度场，$N=1$ 的输出应解释为类后验均值，而非精确等于后验均值。增大 $N$ 会在越来越低的插值噪声水平处评估学习估计器，那里后验模态更易分辨。

我们的模型针对指定的前向算子族与噪声水平训练，属于摊销条件模型族。核心问题是：在给定算子特定训练的前提下，把 $\mathbf A$ 显式嵌入动力学是否优于仅把网络条件化于图像空间测量。我们在附录 E.2 研究该问题。我们还与推理时流求解器比较，因为它们是该基准的既定参照 [39, 40, 19, 17, 18]。跨算子族摊销的方法 [63, 64] 为扩展本文方法提供了自然方向。

## 附录 D. 实现细节

**估计器网络。** 学习估计器 $\mathcal R_\theta$ 是 U-Net，接收数据一致迭代 $\mathbf x^{k+1}$ 与流状态 $\mathbf x_t$ 沿通道维度的拼接（$2C$ 个输入通道），并通过宽度 $4c_h$ 的正弦嵌入注入每个残差块来以 $t$ 为条件。块使用 32 组的 GroupNorm 与 Swish 激活，并在表 7 所列分辨率处使用自注意力。权重在 $K$ 次内层迭代间共享，因此完整模型的参数数等于单个 U-Net：CelebA 模型用 $c_h=32$、乘子 $(1,2,4,8)$（34.5M 参数）；AFHQ-Cat 模型用乘子 $(1,2,4,8,8)$、$c_h=32$（59.9M），去模糊除外使用 $c_h=64$（239.4M）。

**求解器。** 我们使用 $K=5$ 次内层迭代、阻尼 $\beta=0.5$、对每个算子与噪声水平固定耦合 $\rho=0.01$。把数据一致步写为 $\mathbf x^{k+1}=(\mathbf A^\top\mathbf A+\rho\mathbf I)^{-1}(\mathbf A^\top\mathbf y+\rho\mathbf z^k)$ 会把噪声方差吸收进 $\rho=\mu\sigma^2$；对本文考虑的所有算子该求解为闭式（附录 B）。迭代从 $\mathbf z^0=\mathbf x_t$ 初始化。

**训练。** 用 AdamW，学习率 $10^{-4}$ 经余弦计划衰减到 $10^{-6}$，权重衰减 $10^{-4}$，梯度范数裁剪 1.0，不使用混合精度。总批大小 32（4 块 GPU 上每块 8，DDP）：CelebA 训练 500 个 epoch × 2000 步，AFHQ-Cat 训练 700 个 epoch × 750 步，每个 epoch 有放回重采样训练集。从第 20 个 epoch 起维护衰减 0.999 的权重指数滑动平均，用于所有验证与测试时评估。前 20 个 epoch 我们在无数据一致性下训练估计器，只对 $\mathbf A^\top\mathbf y$ 与 $\mathbf x_t$ 的拼接做一次网络调用，随后在剩余训练中启用 $K=5$ 的数据项求解器；该热启动避免通过未训练估计器的五次迭代反传。时间 $t$ 由 $[t_{\min},t_{\max}]$ 上 64 个等距分层的低差异分层采样抽取，而非 i.i.d. 均匀，这在小批下降低 epoch 平均损失的方差。训练大约需要 24–48 小时。

**评估协议。** PSNR 在 $[0,1]$ 上以 data_range=1 计算，匹配 [18] 的后处理，使数值可直接比较；SSIM 在钳制到 $[0,1]$ 的图像上计算，LPIPS 用 AlexNet 主干在钳制到 $[-1,1]$ 的图像上计算。所有运行使用种子 42。

> **表 7（原文 Table 7）：** 超参数。除注明外，五个任务共用全部取值。

| 项目 | CelebA（$128^2$） | AFHQ-Cat（$256^2$） |
|---|---|---|
| **求解器** | | |
| 迭代深度 $K$ | 5 | 5 |
| 阻尼 $\beta$ | 0.5 | 0.5 |
| 耦合 $\rho$ | 0.01 | 0.01 |
| 初始化 $\mathbf z_0$ | $\mathbf x_t$ | $\mathbf x_t$ |
| **流** | | |
| $t_{\min}/t_{\max}$ | $10^{-3}/0.995$ | $10^{-3}/0.995$ |
| 钳制 $\tau_{\min}$ | 0.1 | 0.1 |
| 积分器 | Euler | Euler |
| **网络** | | |
| 基础宽度 $c_h$ | 32 | 32（去模糊为 64） |
| 通道乘子 | (1,2,4,8) | (1,2,4,8,8) |
| 每层残差块数 | 6 | 6 |
| 自注意力分辨率 | 16, 8 | 32, 16 |
| 参数量 | 34.5 M | 59.9 M（239.4 M） |
| **优化** | | |
| 优化器 | AdamW | AdamW |
| 学习率（余弦到 $10^{-6}$） | $10^{-4}$ | $10^{-4}$ |
| 权重衰减 / 梯度裁剪 | $10^{-4}$ / 1.0 | $10^{-4}$ / 1.0 |
| 批大小（总） | 32 | 32 |
| epoch 数 × 每 epoch 步数 | $500\times2000$ | $700\times750$ |
| EMA 衰减（自第 20 epoch 起） | 0.999 | 0.999 |

### D.1 基线

**PnP-HQS (DPIR)。** PnP-HQS 即 DPIR [37]，是以 DRUNet 去噪器为先验的半二次分裂，在闭式数据步 $(\mathbf A^\top\mathbf A+\rho_k\mathbf I)\mathbf x=\mathbf A^\top\mathbf y+\rho_k\mathbf z$ 与噪声水平 $\sigma_k$ 处的去噪步之间交替；$\sigma_k$ 从 $49/255$ 对数间隔下降到测量噪声，$\rho_k=\lambda\sigma^2/\sigma_k^2$，$\lambda=0.23$（DPIR 默认）。算子与测量取自我们自己的实现，因此退化与本文方法及其他基线所用完全相同。为避免用通用先验削弱该基线，我们在与本文模型相同的数据与预处理上训练 DRUNet（32.6M 参数）：AFHQ-Cat 为 $256\times256$，CelebA 去噪器在 $128\times128$ 上类似训练。迭代数按任务调至验证子集平台：AFHQ-Cat 上去模糊与超分辨率 24 次、随机修复 100 次（需要更多迭代把填充传播到缺失像素）、去噪 1 次（$\mathbf A=\mathbf I$ 使数据步平凡，DPIR 退化为单次去噪器前传；更多迭代更差，8 与 16 次迭代分别为 32.32 与 32.36 dB，而单次为 32.69 dB）。CelebA 实验使用相同迭代数。超分辨率从测量的双三次上采样初始化（与 DPIR 相同）；其余任务用 $\mathbf x^0=\mathbf A^\top\mathbf y$。我们不报告框修复，因为高斯去噪器非生成式，无法填充大的连续空洞。

**ISTA-Net+。** 我们用 ISTA-Net+ [38] 作为代表性深度展开基线。使用 $K$ 个近端梯度步，每步为数据保真梯度步 $\mathbf x\leftarrow\mathbf x-\lambda_k\mathbf A^\top(\mathbf A\mathbf x-\mathbf y)$，随后是学习近端（卷积前向变换、软阈值、逆变换、残差），用标准重建损失加对称损失（$\gamma=0.01$）端到端训练。我们把它适配到三通道图像与本文所用测量算子。使用 $K=9$ 层、32 通道、不共享权重（0.35M 参数），每个任务训练一个模型，Adam、学习率 $10^{-4}$，从 $\mathbf A^\top\mathbf y$ 初始化（超分辨率用双三次）。框修复与去噪被省略，因为紧凑卷积近端无法填充大的连续空洞。

## 附录 E. 补充结果

### E.1 附加消融

**阻尼系数 $\beta$。** 表 8 报告 $N=2$、$K=5$ 时 $\beta\in\{0.25,0.5,0.75,1.0\}$ 在随机修复上的质量。该系数决定每次更新有多少来自学习估计器而非数据一致迭代，因此 $\beta=1$ 丢弃更新中的数据一致迭代（尽管 $\mathbf x^{k+1}$ 仍作为 $\mathcal R_\theta$ 的输入），在三项指标上最差。阻尼设置之间差异较小，且全部优于表 1 中所有基线。因此我们对所有任务使用 $\beta=0.5$，而非逐设置调优。

> **表 8（原文 Table 8）：** 阻尼系数 $\beta$ 的影响。

| $\beta$ | PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|
| 0.25 | **35.30** | **0.965** | **0.018** |
| 0.50 | 35.03 | 0.963 | **0.018** |
| 0.75 | 35.17 | 0.964 | **0.018** |
| 1.00 | 34.70 | 0.961 | 0.020 |

### E.2 消融 HQS 求解器

我们主张把测量算子 $\mathbf A$ 嵌入生成动力学优于把网络条件化于测量。这里我们用相同网络、目标与训练计划比较该效应，但把 $\mathbf A^\top\mathbf y$ 作为额外条件通道与 $\mathbf x_t$ 拼接输入，以替代 HQS 求解器。由于没有 HQS 内层迭代，代价会降低。我们在随机修复与去模糊任务上跨不同 ODE 步长报告结果于表 9。

> **表 9（原文 Table 9）：** CelebA（100 张图像）上的算子嵌入消融。Flow-only 是同一 U-Net 在同一目标下、对 $\mathbf A^\top\mathbf y$ 与 $\mathbf x_t$ 的拼接训练，不含 HQS 求解器，每个 Euler 步只需一次网络调用（本文方法需 $K=5$ 次）；各行按步数 $N$ 配对，因此本文方法使用 5 倍函数评估。每对中较优者加粗。

| $N$ | 方法 | 随机修复 PSNR↑ | SSIM↑ | LPIPS↓ | 去模糊 PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|
| 2 | Flow-only | 34.54 | 0.955 | **0.0186** | 35.77 | 0.952 | **0.0281** |
| 2 | 本文 | **35.03** | **0.963** | 0.0189 | **36.04** | **0.957** | 0.0295 |
| 4 | Flow-only | 34.15 | 0.953 | 0.0172 | 35.45 | 0.950 | **0.0256** |
| 4 | 本文 | **34.67** | **0.962** | **0.0169** | **35.78** | **0.956** | 0.0280 |
| 10 | Flow-only | 33.53 | 0.948 | 0.0149 | 34.72 | 0.943 | **0.0209** |
| 10 | 本文 | **33.98** | **0.956** | **0.0146** | **35.03** | **0.950** | 0.0235 |
| 25 | Flow-only | 33.07 | 0.943 | 0.0136 | **34.03** | **0.934** | **0.0174** |
| 25 | 本文 | **33.42** | **0.951** | **0.0134** | 31.46 | 0.848 | 0.0265 |

### E.3 玩具问题上的后验恢复

为对照真值评估后验保真度，我们考虑一个具有解析后验的二维问题。令 $\mathbf x=(u,v)\in\mathbb R^2$ 服从等权四分量高斯混合，均值为 $(\pm1.5,\pm1.5)$、分量标准差 0.2。我们观测 $\mathbf y=\mathbf A\mathbf x+\boldsymbol\eta$，其中 $\mathbf A=\mathrm{diag}(1,0)$、$\sigma=0.1$。因此 $u$ 被观测，而 $p(v\mid\mathbf y)$ 仍为双峰，其均值位于低密度点 $v=0$。我们把 U-Net 替换为小型 MLP，保留 $K=5$、$\beta=0.5$、$\rho=0.01$，并为每个固定测量抽取 4000 个样本。

在 $N=50$ 时，采样器恢复两个后验模态，经验权重 0.49/0.51，而精确值为 0.50/0.50（图 4）。被掩蔽坐标距离为 $W_1(v)\approx0.1$，观测坐标与测量一致在 $\pm0.02$ 内。剩余误差主要来自采样模态的轻微欠散布。

**采样步数的影响。** 表 10 与图 5 表明 $N=1$ 输出坍缩到后验均值区域，而增加 $N$ 逐步解析两个模态。模态覆盖率达到 $N=2$ 时的 77%、$N=4$ 时的 93%；对 $6\le N\le25$，恢复的权重与模态位置分别在解析值的 1% 与 0.05 内。

> **表 10（原文 Table 10）：** $u=+1.5$ 时使用 4000 个样本的后验恢复随 $N$ 的变化。解析后验在 $|v|<0.75$ 内质量可忽略、模态等权、模态位于 $\pm1.5$ 附近。

| $N$ | 1 | 2 | 4 | 50 |
|---|---|---|---|---|
| $W_1(v)$↓ | 1.44 | 0.44 | 0.13 | **0.11** |
| $\lVert v\rVert<0.75$ 内质量 | 100% | 23% | 7% | **0.5%** |
| 模态权重 | — | 0.50/0.50 | 0.52/0.48 | **0.49/0.51** |
| 经验模态 | 0 | ±1.26 | ±1.45 | **±1.52** |

对均匀 Euler 积分，$\Delta t=1/N=1-t_{N-1}$，因此最终更新满足

$$
\mathbf x_N=\mathcal E_\theta\left(\mathbf x_{N-1},t_{N-1},\mathbf y\right),\qquad t_{N-1}=\frac{N-1}{N}.
$$

因此增加 $N$ 会把最终估计器评估移向更接近 $t=1$（插值噪声更小）处，同时改变前面 Euler 步产生的状态。这解释了从小 $N$ 的类后验均值估计到大 $N$ 的模态解析样本的转变，与图像实验中观察到的失真–感知折中一致。

> **图 4（原文 Fig. 4）：** $N=50$ 时的后验恢复。上：在 $u=\pm1.5$ 附近测量下的样本（蓝色）与解析后验等高线（红色）；后验均值（×）位于两模态之间。下：采样与解析边缘 $p(v\mid y)$。

> **图 5（原文 Fig. 5）：** 后验恢复随 $N$ 的变化。上：$W_1(v)$ 与低密度谷内的质量。下：采样（蓝色）与解析（红色）边缘。模态在 $N\approx6$ 附近变得可分辨，随后在较大 $N$ 处出现轻微漂移与欠散布。

### E.4 压缩感知 Fourier 采样

我们考虑欠采样 Fourier 测量 $\mathbf A=\mathbf P\mathbf F$，即加速 MRI 的前向模型，其中 $\mathbf F$ 是二维 DFT、$\mathbf P$ 是二元采样掩码。我们在 AFHQ-Cat 上评估保留 $k$ 空间 21.88% 的笛卡尔掩码，复高斯噪声标准差 $\sigma=0.002$，对彩色图像逐通道施加该算子。我们与 Flower [18]（$\gamma=0$，$N=100$，$N_{\mathrm{avg}}=1$）以及零填充伴随 $\mathbf A^*\mathbf y$ 比较。图 17 与表 13 报告结果。

> **图 17（原文 Fig. 17）：** AFHQ-Cat（$256\times256$）上的压缩感知 Fourier 采样，$\sigma=0.002$。列：真值、零填充伴随 $\mathbf A^*\mathbf y$、Flower1-OT、本文（$N=2$，笛卡尔掩码 21.88%）。

> **表 13（原文 Table 13）：** AFHQ-Cat（平均 100 张图像）上的压缩感知 Fourier 采样。

| 方法 | PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|
| 零填充 | 25.62 | 0.725 | 0.343 |
| Flower1-OT | 31.17 | 0.870 | 0.062 |
| 本文（$N=2$） | **32.06** | **0.892** | 0.074 |
| 本文（$N=4$） | 31.71 | 0.885 | 0.064 |
| 本文（$N=10$） | 31.06 | 0.869 | **0.054** |

### E.5 更大测试集

遵循 [18]，我们在更大测试集上评估若干方法并报告标准差：CelebA 的 1,000 张图像与 AFHQ-Cat 的 400 张图像（原置于第 25–26 页的表 11 与表 12）。我们的方法在多数任务与步数下保持优势，且 $N=2$ 时在两项数据集的全部任务上均取得最佳 PSNR/SSIM；更大 $N$ 继续改善 LPIPS。

> **表 11（原文 Table 11）：** 1,000 张 CelebA 图像上的结果。最优与次优结果分别以蓝色与红色标出（此处以加粗表示最优）。

| 指标 | 退化输入 | OT-ODE | PnP-Flow1 | PnP-Flow5 | Flower1-OT | Flower5-OT | 本文 $N=2$ | 本文 $N=4$ | 本文 $N=10$ | 本文 $N=25$ |
|---|---|---|---|---|---|---|---|---|---|---|
| 去噪 PSNR | 20.00 | 30.48 | 31.79 | 32.27 | 32.25 | 33.10 | **33.68** | 33.25 | 32.27 | 31.58 |
| 去噪 SSIM | 0.351 | 0.856 | 0.903 | 0.909 | 0.912 | 0.924 | **0.931** | 0.927 | 0.914 | 0.901 |
| 去噪 LPIPS | 0.367 | 0.033 | 0.044 | 0.056 | **0.033** | 0.038 | 0.034 | 0.034 | 0.031 | 0.028 |
| 去模糊 PSNR | 27.82 | 33.00 | 34.56 | 34.89 | 35.01 | 35.71 | **36.09** | 35.82 | 35.05 | 31.46 |
| 去模糊 SSIM | 0.741 | 0.919 | 0.935 | 0.940 | 0.946 | 0.953 | **0.957** | 0.955 | 0.949 | 0.848 |
| 去模糊 LPIPS | 0.123 | 0.029 | 0.037 | 0.044 | **0.025** | 0.031 | 0.029 | 0.027 | 0.023 | 0.026 |
| 超分 PSNR | 10.38 | 31.43 | 31.12 | 31.53 | 32.41 | 33.14 | **34.52** | 34.10 | 33.27 | 30.48 |
| 超分 SSIM | 0.185 | 0.903 | 0.900 | 0.904 | 0.921 | 0.930 | **0.949** | 0.946 | 0.937 | 0.838 |
| 超分 LPIPS | 0.829 | **0.026** | 0.045 | 0.054 | 0.034 | 0.039 | 0.028 | 0.027 | 0.023 | 0.028 |
| 随机修复 PSNR | 12.13 | 28.87 | 33.23 | 34.20 | 33.26 | 34.15 | **35.27** | 34.93 | 34.23 | 33.66 |
| 随机修复 SSIM | 0.199 | 0.872 | 0.944 | 0.954 | 0.945 | 0.953 | **0.963** | 0.962 | 0.957 | 0.951 |
| 随机修复 LPIPS | 1.027 | 0.050 | **0.017** | 0.021 | **0.017** | 0.019 | 0.018 | 0.016 | 0.014 | 0.013 |
| 框修复 PSNR | 22.29 | 29.68 | 30.44 | 30.99 | 31.19 | 31.81 | **33.28** | 32.63 | 31.95 | 31.45 |
| 框修复 SSIM | 0.745 | 0.921 | 0.934 | 0.940 | 0.946 | 0.953 | **0.961** | 0.959 | 0.955 | 0.949 |
| 框修复 LPIPS | 0.211 | 0.035 | 0.036 | 0.042 | **0.021** | 0.022 | 0.022 | 0.021 | 0.020 | 0.019 |

> **表 12（原文 Table 12）：** 400 张 AFHQ-Cat 图像上的结果。

| 指标 | 退化输入 | OT-ODE | PnP-Flow1 | PnP-Flow5 | Flower1-OT | Flower5-OT | 本文 $N=2$ | 本文 $N=4$ | 本文 $N=10$ | 本文 $N=25$ |
|---|---|---|---|---|---|---|---|---|---|---|
| 去噪 PSNR | 20.00 | 30.07 | 31.22 | 31.47 | 31.70 | 32.35 | **32.90** | 32.50 | 31.51 | 29.39 |
| 去噪 SSIM | 0.311 | 0.813 | 0.861 | 0.862 | 0.876 | 0.888 | **0.901** | 0.894 | 0.874 | 0.776 |
| 去噪 LPIPS | 0.511 | 0.079 | 0.142 | 0.176 | 0.113 | 0.127 | 0.082 | 0.080 | 0.072 | 0.078 |
| 去模糊 PSNR | 24.16 | 27.23 | 28.18 | 28.48 | 28.85 | 29.20 | **29.37** | 28.88 | 28.15 | 27.57 |
| 去模糊 SSIM | 0.522 | 0.713 | 0.764 | 0.769 | 0.777 | 0.786 | **0.795** | 0.782 | 0.758 | 0.735 |
| 去模糊 LPIPS | 0.437 | **0.125** | 0.302 | 0.331 | 0.253 | 0.282 | 0.244 | 0.199 | 0.151 | **0.124** |
| 超分 PSNR | 11.88 | 26.13 | 27.15 | 27.61 | 26.41 | 26.73 | **28.56** | 27.94 | 27.19 | 26.08 |
| 超分 SSIM | 0.219 | 0.717 | 0.765 | 0.777 | 0.743 | 0.751 | **0.803** | 0.786 | 0.760 | 0.665 |
| 超分 LPIPS | 0.878 | **0.110** | 0.168 | 0.178 | 0.275 | 0.286 | 0.179 | 0.150 | 0.122 | 0.122 |
| 随机修复 PSNR | 13.56 | 29.52 | 33.15 | 33.88 | 33.12 | 33.82 | **34.12** | 33.70 | 32.93 | 32.32 |
| 随机修复 SSIM | 0.230 | 0.840 | 0.918 | 0.929 | 0.918 | 0.927 | **0.933** | 0.929 | 0.918 | 0.907 |
| 随机修复 LPIPS | 1.065 | 0.088 | **0.040** | 0.047 | 0.043 | 0.049 | 0.047 | 0.042 | 0.036 | 0.032 |
| 框修复 PSNR | 21.82 | 24.76 | 26.57 | 27.19 | 26.79 | 27.47 | **28.94** | 28.29 | 27.60 | 26.52 |
| 框修复 SSIM | 0.743 | 0.873 | 0.895 | 0.900 | 0.915 | 0.923 | **0.925** | 0.922 | 0.916 | 0.825 |
| 框修复 LPIPS | 0.201 | 0.091 | 0.110 | 0.127 | 0.065 | 0.067 | 0.059 | 0.051 | 0.045 | 0.071 |

（表 11 与表 12 在原文中均报告标准差；为可读性本页仅保留均值，标准差见原文第 25–26 页。）

> **图 6（原文 Fig. 6）：** 随机修复（CelebA，$128\times128$）在前向模型失配下的重建。在 0.7 掩码比例、$\sigma=0.01$ 处训练的单一模型被应用于掩码比例 0.5 到 0.8 的测试测量。质量随测试掩码比例单调变化，在两端均无失效模式。无匹配比例模型时，这些数值刻画优雅退化而非量化失配惩罚；定量值见表 6。

> **图 7（原文 Fig. 7）：** CelebA（$128\times128$）上的失真–感知折中。

> **图 8（原文 Fig. 8）：** AFHQ（$256\times256$）上的失真–感知折中。

> **图 9（原文 Fig. 9）：** 五个逆问题（去噪、去模糊、$\times2$ 超分辨率、随机修复、框修复）的重建（上）与逐像素误差图（下，magma，$[0,0.1]$）。列：真值、测量、PnP-Flow、Flower、本文（$N=2$）、本文（$N=25$）。每个面板下方报告 MAE/PSNR（dB）。本文（$N=2$）在每个任务上给出最低误差。

> **图 10（原文 Fig. 10）：** CelebA（$128\times128$）上重建质量随推理代价的变化。PSNR 在表 1 的五个复原任务上平均（每个任务 100 张测试图像）；横轴为单张 NVIDIA RTX A6000 上的每图像实际耗时，对数刻度。越靠左上越好。本文方法展示 $K=5$ 固定时 Euler 步数 $N\in\{2,4,10,25\}$，每个基线贡献单点。在 $N=2$ 时我们以约 $50\times$ 更低代价超过最强基线（Flower5）。沿本文曲线 PSNR 随 $N$ 增大而下降，因为额外步数以失真换取感知质量。

> **图 11（原文 Fig. 11）：** CelebA 随机修复：重建随采样步数增长（$N=1\to100$），更高 $N$ 增加细节。

> **图 12（原文 Fig. 12）：** CelebA 去模糊重建随采样步数（$N=1\to100$）的变化。

> **图 13（原文 Fig. 13）：** CelebA $\times2$ 超分辨率重建随采样步数（$N=1\to100$）的变化。

> **图 14（原文 Fig. 14）：** 框修复（CelebA，$128\times128$，$K=5$）中的后验样本多样性。对每张测试图像保持测量 $\mathbf y$ 固定，只改变源抽样 $\mathbf x_0\sim\mathcal N(\mathbf 0,\mathbf I)$。列展示真值、测量、$N=2$ 时 $S=8$ 个重建中的三个、全部八个样本的逐像素标准差，以及 $N=25$ 时相应样本与标准差。标准差图在全图共享单一色标。变化局限于被掩蔽区域，并在测量可用处消失，与命题 1 一致：学习场把源输运到测量条件后验而非单个点估计。更长积分（$N=25$）扩大分布，这解释了表 1 与表 11 中 LPIPS 改善与 PSNR 下降。

> **图 15（原文 Fig. 15）：** 图 14 的放大版本。

> **图 16（原文 Fig. 16）：** 框修复求解器的内部轨迹（$N=2$ 个 Euler 步、每步 $K=5$ 次 HQS 迭代）：从真值与测量出发，每个 Euler 步（行，按 $t$ 标记）通过其内层迭代 $K=1{:}5$ 精化估计，展示数据一致迭代 $x^k$（上）与阻尼学习更新 $z^k$（下）。

## 图注与表注索引

本页图 1–17 的中文图注与表 1–13 的表注均按原文出现位置内联在正文中（图 1–2 与表 1–3 见第 4.1–4.2 节，图 3 与表 4–6 见第 4.3 节；表 7–8 见附录 D 与 E.1，表 9 见附录 E.2，图 4–5 与表 10 见附录 E.3，图 17 与表 13 见附录 E.4，表 11–12 与原置于第 25–26 页，图 6–16 见附录 E），此处不重复罗列。原文为 CV 会议单栏排版（宽表与大量图），本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.12953v1 全文（34 页）的中文译稿：摘要、第 1–5 节正文与编号小节、算法 1–3、图 1–17 的中文图注、表 1–13 的逐格转写、附录 A–E（理论证明（引理 1–10）、算法细节、相关工作、实现细节与补充结果），以及参考文献 64 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：正文与附录 (1)–(84) 逐式核对（重点 (8)–(14)、(16)–(19)、(22)–(27)、(28)–(45)、(69)–(84)）；表 1 用第 5 页渲染图逐格核对，表 2–6 与表 7–13 的数值按原文逐行抽取数据转写，并核对表 11/表 12 的十列结构（退化输入、OT-ODE、PnP-Flow1/5、Flower1-OT/5-OT、本文 N=2/4/10/25）。原文疑点：表 1 与表 2 中 I²SB 的 LPIPS 优于本文（如去模糊 0.012 对 0.029），而摘要仅主张以 50× 更少评估取得最先进 PSNR、正文亦表述为"取得最佳重建质量的同时达到有竞争力感知质量"，未主张 LPIPS 最优，故不构成数值矛盾，此处仅说明。本页不上传原文图片，图内像素级重建与曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
