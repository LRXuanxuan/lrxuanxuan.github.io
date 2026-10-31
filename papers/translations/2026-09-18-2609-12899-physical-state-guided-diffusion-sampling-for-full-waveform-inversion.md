---
layout: page
title: "物理状态引导的全波形反演扩散采样｜中文全文译文"
permalink: /papers/translations/2026-09-18-2609-12899-physical-state-guided-diffusion-sampling-for-full-waveform-inversion/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/90965c3b3b928369/) · [原文 arXiv](https://arxiv.org/abs/2609.12899) · [全部目录](/papers/catalog/)

# 物理状态引导的全波形反演扩散采样

**原题：** Physical-State-Guided Diffusion Sampling for Full-Waveform Inversion  
**作者：** Chen Min¹、Haowen Jiang¹、Zheng Ma^{1,2,\*}、Xiongbin Yan^{3,\*}（¹ 上海交通大学数学科学学院，中国上海；² 上海交通大学 CMA-Shanghai；³ 兰州大学数学与统计学院，中国兰州；\* 通讯作者：Zheng Ma（zhengma@sjtu.edu.cn）、Xiongbin Yan（yanxb@lzu.edu.cn））  
**版本：** arXiv:2609.12899v1（cs.LG），2026 年 9 月 11 日提交，原文 43 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1—4 节、附录 A—B、算法 1—2、表 1—表 6、图 1—图 13 图注与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

全波形反演（FWI）从地震记录中估计地下速度，但其**不适定性与非线性**使准确重建强烈依赖初始模型与先验信息。扩散后验采样提供了学习到的地质先验，然而把其去噪器直接耦合到非线性波动方程求解器会得到不可靠的物理引导。本文提出**物理状态引导扩散采样（PSG）**，它通过**高斯桥**把一个持续存在的物理速度与扩散先验耦合起来。物理状态由**以去噪速度为正则项**的波形拟合精化，进而引导反向扩散过程。该表述分离了波动方程梯度与去噪器梯度，同时保留了传统 FWI 初始化与累积的优化历史。在四个 OpenFWI 族上，PSG 的终端去噪估计在干净数据与缺道采集下优于经典基线及基于扩散的基线，并在测量噪声下保持强结构恢复能力。重复的随机运行保留了主导地质结构，集成变异性集中于地质界面附近，并与局部反演误差呈正相关。一个**冻结的** OpenFWI 训练先验进一步支持对更大规模的 Marmousi、Overthrust 与 BP2004 Salt 模型进行反演，在**不重新训练**的情况下恢复复杂地质结构。

**关键词：** 全波形反演；扩散后验采样；PDE 约束反问题；地震成像。

## 1 引言

地震成像旨在从地表或近地表记录的波场中获取地下的定量描述，应用包括资源勘探、环境监测与地震灾害评估 [1]、[2]。可用技术包括速度分析、走时层析、偏移与 Born 近似下的线性化反演。其中，**全波形反演（FWI）** [3]、[4]、[5] 具有特别高的空间分辨率，因为它通过波动方程求解器匹配模拟与观测地震图的相位与振幅来估计速度场。因此 FWI 是**PDE 支配反问题**的代表：控制物理提供了准确的正演映射，但其本身并不保证稳定或唯一的反演。

主要困难在于波形匹配目标既非线性又严重不适定。有限的采集孔径与带限震源使模型的部分区域约束很弱，测量噪声与不完整的检波器覆盖进一步减少数据所携带的信息 [6]、[7]、[8]。由此形成的非凸地形包含许多伪极小盆地，使重建强烈依赖初始速度模型。这种依赖最明显地表现为**周期跳跃（cycle skipping）**：当模拟与观测到时之间的偏差超过约半个主周期时，局部伴随梯度会对齐错误的波周期，把迭代驱向错误模型 [9]、[10]、[11]。因此有效的 FWI 方法不仅须控制更新幅度，还须控制**地质合理性**以及用于计算波形梯度的物理状态所处的盆地。

经典方法通过目标函数与优化调度改善稳定性。Tikhonov 正则化抑制快速变化分量，而全变差（TV）促进具有锐利界面的分片常值模型 [12]、[13]、[14]、[15]。两者都是标准且有用的约束，但前者倾向模糊地质边界，后者可能引入阶梯状伪影。互补策略通过从低频延续到高频，或用以相位、包络、自适应或最优传输为基础的失配替代逐点波形残差来扩大吸引域 [16]、[17]、[18]、[19]、[20]。这些方法处理了数据项中的重要不稳定性，但其手工设计的正则项只包含关于合理地下模型可能呈现结构的有限信息。

基于学习的反演从样本中获得更丰富的结构信息。监督网络学习从地震观测到速度模型的直接映射 [21]、[22]、[23]、[24]；物理约束表述把控制方程嵌入训练，或用神经网络参数化未知场 [25]、[26]；神经算子学习函数空间之间的映射 [27]、[28]。其计算效率具有吸引力，但直接预测模型依赖训练对的联合分布，当地质、观测噪声或采集几何与训练设置不同时常会退化。生成式先验提供了另一种分工方式：只学习速度模型的分布、而不为固定观测学习逆映射，同时由波动方程算子在推理时纳入实际观测 [29]。

扩散模型的快速发展推进了生成建模，并为求解反问题引入新范式。仅在速度场上训练的模型学习逐步污染边缘分布的分数，并通过积分相应的反向时间动力学生成地质样本 [30]、[31]、[32]。一旦训练完成，同一先验可与不同观测及可微正演算子结合而无需配对重训练——这一思想催生了面向反问题的广泛扩散求解器族 [33]、[34]、[35]、[36]、[37]。近期工作通过若干算法路线把该原理适配到 FWI。DiffusionFWI [38] 代表变量分裂类方法：它与随后的波数感知扩展 [39] 在波形一致性优化与反向采样步骤之间交替，以恢复与所学先验一致的速度模型。Taufik 与 Alkhalifah [40] 发展了一种 DAPS 式后验采样器，在干净空间做 Langevin 精化并在扩散层级间重新加噪。RED-DiffEq [41] 是把基于扩散的变分正则化直接应用于 FWI，并提供稳健的数值实现。Xie 等 [42] 把分数重匹配扩散先验直接引入干净空间 FWI 优化。SGDS-FWI [29] 通过把基于 SDEdit [43] 的先验投影算子嵌入 FWI 优化来保持先验一致性。解耦潜变量优化（DLO）[44] 用二次罚把 DMPlug [45] 与 D-Flow [46] 的潜变量优化表述松弛为对物理速度与潜变量的联合优化，以适应 FWI。其他工作 [47] 通过对似然引导进行时间与空间重标定，把经典条件采样算法适配到地震波场特性。这些结果共同确立了学习地质先验的价值，同时把**含噪扩散状态、由先验表示的速度与非线性波算子之间的耦合**留作核心算法选择。

扩散后验采样（DPS）[34] 对该设置尤其有吸引力，因为它保留条件反向扩散，并允许非线性可微正演算子而无需重训练先验。然而其实际更新在单个 **Tweedie 估计** $D_\theta(\mathbf x_t,t)\approx\mathbb E[\mathbf x_0\mid\mathbf x_t]$ 处评估观测似然，以替代通过对 $p_t(\mathbf x_0\mid\mathbf x_t)$ 积分得到的难处理含噪似然。直接 FWI 特化随后会遇到两个相关问题。第一，在高扩散噪声下条件均值可能模糊界面或平均不同地质模态，而波动方程却在该点估计处求值，其伴随梯度经去噪器 Jacobian 传播。所得复合路径在单次引导步骤中耦合了非线性物理梯度与噪声相关的去噪器敏感度。第二，反向链在每个扩散时刻都从当前含噪状态重新计算去噪速度估计，但在轨迹上并不维持持续的物理状态。因此它无法直接保留传统 FWI 初始化或先前波形更新累积的优化历史——而在存在周期跳跃时这两者都至关重要。

本文用**物理状态引导扩散采样（PSG）**解决这些问题，它把反演组织在一条完整的条件反向扩散轨迹周围。高斯增广（变量分裂类方法亦使用 [29]）提供了持续物理速度与先验分布场之间的耦合机制。在每个噪声水平上，波形拟合以向去噪器条件均值的吸引来精化物理速度；随后对桥积分做 DPS 式评估，给出把更新后物理条件反馈到反向扩散的**分数消息**。PSG 从可用的 FWI 初始模型出发，并在整个反向调度上携带物理速度及其优化器状态。这分离了波动方程伴随与去噪器向量—Jacobian 乘积，并把正演求解器限制在持续物理状态上。与 RED-DiffEq、SGDS-FWI 的区别在于**演化的扩散状态**：PSG 保留并引导一条完整生成轨迹，其去噪预测在整个推理过程中塑造物理精化。实验评估了由此得到的锐利地质界面恢复能力。

**贡献。** 本文主要贡献概括如下。

- 本文为 FWI 发展一种引导式条件扩散方案，把完整反向采样轨迹与持续物理速度耦合。高斯桥提供变分物理目标与条件分数消息，使波形信息能够引导演化的扩散状态。耦合更新分离了波动方程伴随与去噪器 Jacobian，同时保留传统 FWI 初始化与累积优化器历史。
- 本文在代表性 OpenFWI 族上于干净数据、高斯噪声与缺检波器条件下验证 PSG。这些受控比较评估了重建精度、对退化观测的鲁棒性，以及该耦合采样方案相对直接 DPS、既有正则化方法与扩散先验方法的行为。
- 本文通过集成重建研究对随机反演轨迹的敏感性，并评估向更大规模 Marmousi、Overthrust 与 BP2004 Salt 模型的迁移。前者考察主要地质结构在随机种子间的保持情况以及集成变异性与重建误差的空间关联；后者用冻结的 OpenFWI 先验与分布外实验所报告的求解器设置，探讨对初始模型与观测噪声的敏感性。

本文其余部分安排如下。第 2 节先给出 FWI 与扩散后验采样的表述，再发展 PSG 的增广模型、持续物理更新与分离似然消息。第 3 节给出 OpenFWI 重建实验、随机轨迹集成研究以及 Marmousi、Overthrust 与 BP2004 Salt 的评估。第 4 节总结发现与未来方向。附录 A 发展扩散预备知识，附录 B 提供实现细节、基线设置与计算代价。

## 2 方法

### 2.1 全波形反演

全波形反演（FWI）从地表检波器记录的地震道估计空间变化的地下波速 $v(\mathbf r)$ [4]、[48]。包含相位、振幅与多次到达信息的完整记录，与由波传播模型支配的合成地震道比较。在常密度声学近似下，空间域为矩形 $\Omega=[0,L_x]\times[0,L_z]\subset\mathbb R^{2}$，其中 $\mathbf r=(x,z)$ 表示水平位置与深度，记录时间区间为 $(0,T]$。上边界 $\Gamma_{\mathrm{surf}}=[0,L_x]\times\{0\}$ 表示采集表面。对震源项 $q(\mathbf r,t)$，相应压力波场 $p_q(\mathbf r,t)$ 在物理域中满足声波方程与零初始条件：

$$
\begin{cases}\dfrac{1}{v(\mathbf r)^{2}}\dfrac{\partial^{2}p_q(\mathbf r,t)}{\partial t^{2}}-\nabla^{2}p_q(\mathbf r,t)=s_q(\mathbf r,t), & (\mathbf r,t)\in\Omega\times(0,T],\\[6pt] p_q(\mathbf r,0)=0,\quad\partial_t p_q(\mathbf r,0)=0, & \mathbf r\in\Omega,\end{cases}\tag{1}
$$

其中 $v(\mathbf r)>0$ 为未知波速，$\nabla^{2}$ 为空间 Laplacian。零初始数据指定震源激发前的静止介质。边界条件补全正演模型；实验所用数值离散与边界处理见附录 B.2。

张量积网格 $\{(x_i,z_j)\}_{i=1,\ldots,m_x;j=1,\ldots,m_z}$ 离散化 $\Omega$，其上波速由节点矩阵 $\mathbf V=(v(x_i,z_j))\in\mathbb R^{m_x\times m_z}$ 表示。其向量化（用同一符号记为 $\mathbf v\in\mathcal X\subset\mathbb R^{m}$，$m=m_xm_z$）属于正速度模型的容许集 $\mathcal X$。震源与检波器布置在 $\Gamma_{\mathrm{surf}}$ 附近。位于 $\{\xi_q\}_{q=1}^{N_s}\subset\Omega$ 的震源生成波场 $p_q(\mathbf r,t;\mathbf v,\xi_q)$，而检波器集合 $\Gamma_r=\{\mathbf r_j\}_{j=1}^{N_r}\subset\Omega$ 定义限制算子

$$
(\mathcal R p_q)_j(t):=p_q(\mathbf r_j,t;\mathbf v,\xi_q),\qquad j=1,\ldots,N_r.\tag{2}
$$

对记录时刻 $\{t_k\}_{k=1}^{N_t}\subset(0,T]$，堆叠这些地震道定义**参数到观测的映射**

$$
F:\mathcal X\to\mathcal Y,\qquad[F(\mathbf v)]_{q,k,j}=(\mathcal R p_q)_j(t_k),\qquad\mathcal Y=\mathbb R^{N_s\times N_t\times N_r},\tag{3}
$$

它把速度模型映射为其模拟炮集集合。相应观测模型为

$$
\mathbf y=F(\mathbf v^{\dagger})+\mathbf n,\tag{4}
$$

其中 $\mathbf y\in\mathcal Y$ 表示记录数据，$\mathbf v^{\dagger}$ 为真实速度，$\mathbf n$ 汇总测量与建模误差。图 1 展示了该正演建模与反演设置。

经典 FWI 的优化通常从粗略速度估计初始化，最小化 $F(\mathbf v)$ 与 $\mathbf y$ 之间的波形失配目标，其梯度通常用伴随状态法计算 [3]、[4]。所得反问题经 $F$ 非线性，并在表面采集提供的不完整地下照明下不适定，产生大量伪局部极小，其中**周期跳跃解**是该不适定性的突出表现。当相位偏差大于约半个主周期时，优化器对齐不同的波周期并收敛到错误速度，即产生此类解 [6]、[10]、[9]。被污染与不完整的观测进一步减少区分容许速度模型的信息，增加反演难度，并催生合适的正则化或先验信息。

### 2.2 FWI 的贝叶斯表述

贝叶斯全波形反演把未知地下速度视为随机变量，求其后验分布 $p(\mathbf v\mid\mathbf y)$，它把来自观测的信息与关于容许速度模型的结构知识结合。对固定数据 $\mathbf y$，与式 (4) 观测模型的一致程度通过似然进入。把其负对数写为 $\ell_{\mathbf y}(\mathbf v):=-\log p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)$，则相差一个加性常数有一般表示 [49]

$$
p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\propto\exp\{-\ell_{\mathbf y}(\mathbf v)\}.\tag{5}
$$

式 (4) 的经典噪声模型假设加性高斯误差 $\mathbf n\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma_y)$，其中 $\boldsymbol\Sigma_y$ 为数据空间协方差，在独立同分布噪声下退化为 $\sigma_y^{2}\mathbf I$。在该模型下似然为

$$
p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\propto\exp\left\{-\frac{1}{2}\lVert F(\mathbf v)-\mathbf y\rVert_{\boldsymbol\Sigma_y^{-1}}^{2}\right\},\qquad
\lVert\mathbf r\rVert_{\boldsymbol\Sigma_y^{-1}}^{2}:=\mathbf r^{\top}\boldsymbol\Sigma_y^{-1}\mathbf r,\tag{6}
$$

对应 $\ell_{\mathbf y}(\mathbf v)=\frac{1}{2}\lVert F(\mathbf v)-\mathbf y\rVert_{\boldsymbol\Sigma_y^{-1}}^{2}$。

仅凭数据似然无法正则化采集约束很弱的速度分量。因此贝叶斯 FWI 给速度赋予先验密度 $p(\mathbf v)$，通过它可在拟合观测之前偏好容许的地质结构。当有限采集几何与带限数据使反问题不适定时，该信息尤为重要，因为仅数据优化可能产生非唯一、不稳定的重建，或陷入地质上不合理的局部极小。一旦指定似然与先验，贝叶斯公式给出

$$
p(\mathbf v\mid\mathbf y)\propto p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)p(\mathbf v)\propto\exp\{-\ell_{\mathbf y}(\mathbf v)\}p(\mathbf v).\tag{7}
$$

所得后验在波形一致性与先验合理性之间权衡，在本文中作为基于扩散的反演的**计算目标**，而非标定后验不确定性量化的基础。

解析先验通常通过选取正则泛函 $R$ 并赋予 Gibbs 密度 $p(\mathbf v)\propto\exp\{-\lambda R(\mathbf v)\}$（$\lambda>0$）构成。对式 (7) 取负对数，则相差一个与 $\mathbf v$ 无关的常数，得到正则化 MAP 问题

$$
\mathbf v_{\mathrm{MAP}}\in\arg\min_{\mathbf v\in\mathcal X}\left\{\ell_{\mathbf y}(\mathbf v)+\lambda R(\mathbf v)\right\},\tag{8}
$$

其中 $\mathcal X$ 强制物理容许性，$\lambda>0$ 控制先验强度。把速度置于不同函数空间并惩罚相应半范数，可得到两种经典选择 [29]：Hilbert 空间假设 $\mathbf v\in H^{1}(\Omega)$（弱梯度平方可积）给出**一阶 Tikhonov 罚**；Banach 空间假设 $\mathbf v\in BV(\Omega)$（分布导数具有有限全变差）给出 **TV 罚**：

$$
R_{\mathrm{Tik}}(\mathbf v)=|\mathbf v|_{H^{1}(\Omega)}^{2}:=\int_{\Omega}|\nabla v(\mathbf r)|^{2}\,\mathrm d\mathbf r,\qquad
R_{\mathrm{TV}}(\mathbf v)=|D\mathbf v|(\Omega).\tag{9}
$$

这里 $|D\mathbf v|(\Omega)$ 表示全变差测度，对足够正则的速度场退化为 $\int_{\Omega}|\nabla v(\mathbf r)|\,\mathrm d\mathbf r$。Tikhonov 正则化抑制高频波动并偏好平滑背景，而 TV 促进稀疏梯度并更好保持锐利界面 [12]、[13]、[14]、[15]。在标准变分假设下，这些正则项通过改善稳定性与收敛性、保证极小元存在并增强恢复速度的可解释性来缓解 FWI 的不适定性。然而传统函数空间正则项捕捉细尺度细节与复杂地质特征的能力有限；它们施加的显式约束还可能引入特征性重建偏差：TV 可能把平滑变化结构表示为阶梯图案，而 Tikhonov 正则化可能模糊锐利界面。这些局限推动了数据驱动正则化策略的发展，其中基于扩散的先验学习因其刻画复杂先验流形并从中采样的能力，已成为主流方法。

### 2.3 扩散生成模型作为数据先验

基于分数的扩散模型背后的前向状态演化由 $t\in[0,T]$ 上的 Itô 随机微分方程（SDE）[31] 指定：

$$
\mathrm d\mathbf x_t=\mathbf f(\mathbf x_t,t)\,\mathrm dt+g(t)\,\mathrm d\mathbf w_t,\qquad\mathbf x_0\sim p_{\mathrm{data}}.\tag{10}
$$

这里 $\mathbf x_0\in\mathbb R^{d}$（离散速度场时 $d=m$）表示从未知数据密度 $p_{\mathrm{data}}$（即地质先验）抽取的无扰动速度模型；$\mathbf w_t$ 为标准 $d$ 维 Wiener 过程，$\mathbf f$ 与 $g$ 分别为漂移与扩散系数。系数选取使 $t=0$ 处的地质结构逐渐被遮蔽，$t=T$ 处终端分布接近可处理的参考分布。

当漂移与扩散系数满足通常正则条件时，每个状态 $\mathbf x_t$ 具有密度 $p_t$，满足 Fokker–Planck 方程

$$
\frac{\partial p_t(\mathbf x)}{\partial t}=-\nabla_{\mathbf x}\cdot\left(\mathbf f(\mathbf x,t)p_t(\mathbf x)\right)+\frac{1}{2}g(t)^{2}\Delta_{\mathbf x}p_t(\mathbf x),\qquad p_0=p_{\mathrm{data}}.\tag{11}
$$

令 $q_{0t}(\mathbf x\mid\mathbf x_0)$ 表示由式 (10) 诱导的转移密度；对数据密度边缘化定义**连续含噪边缘分布族**

$$
p_t(\mathbf x)=\int_{\mathbb R^{d}}q_{0t}(\mathbf x\mid\mathbf x_0)p_{\mathrm{data}}(\mathbf x_0)\,\mathrm d\mathbf x_0,\qquad t\in[0,T],\tag{12}
$$

它把结构化数据分布 $p_0=p_{\mathrm{data}}$ 与终端参考密度 $p_T$ 通过逐步扰动的中间分布连接起来。

**方差保持（VP）**过程把式 (10) 特化为线性 SDE

$$
\mathrm d\mathbf x_t=-\frac{1}{2}\beta(t)\mathbf x_t\,\mathrm dt+\sqrt{\beta(t)}\,\mathrm d\mathbf w_t,\qquad\beta(t)>0,\tag{13}
$$

其中 $\beta(t)$ 规定污染速率 [30]、[31]。定义 $\bar\alpha_t=\exp\{-\int_0^{t}\beta(s)\,\mathrm ds\}$，给出闭式高斯转移核

$$
q_{0t}(\mathbf x_t\mid\mathbf x_0)=\mathcal N\left(\mathbf x_t;\sqrt{\bar\alpha_t}\,\mathbf x_0,(1-\bar\alpha_t)\mathbf I\right),\tag{14}
$$

或等价地，重参数化

$$
\mathbf x_t=\sqrt{\bar\alpha_t}\,\mathbf x_0+\sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon,\qquad\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I).\tag{15}
$$

相对噪声方差 $\sigma_t^{2}=(1-\bar\alpha_t)/\bar\alpha_t$ 随 $\bar\alpha_t$ 减小而增大，其倒数给出信噪比。满足 $\bar\alpha_T\approx0$ 的调度使 $p_T\approx\mathcal N(\mathbf 0,\mathbf I)$ 且几乎与初始速度模型无关。

生成沿同一边缘族在相反方向进行。对状态无关的扩散系数，式 (10) 的时间反演满足

$$
\mathrm d\mathbf x_t=\left[\mathbf f(\mathbf x_t,t)-g(t)^{2}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\right]\mathrm dt+g(t)\,\mathrm d\bar{\mathbf w}_t,\qquad t:T\to0,\tag{16}
$$

其中 $\bar{\mathbf w}_t$ 为反向时间参数化下的 Wiener 过程，$\mathrm dt$ 为负 [31]。从 $\mathbf x_T\sim p_T$ 出发，当边缘分数 $\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 精确时该动力学恢复 $p_0$。确定性**概率流 ODE**

$$
\frac{\mathrm d\mathbf x_t}{\mathrm dt}=\mathbf f(\mathbf x_t,t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\tag{17}
$$

具有相同的一次边缘分布，并提供穿过该分布族的另一种传输方式。

边缘分数无法直接获得，因为 $p_{\mathrm{data}}$ 仅由样本表示。然而式 (14) 中的高斯转移允许以可计算目标训练去噪器 $D_\theta(\mathbf x_t,t)$：

$$
\theta^{\star}=\arg\min_{\theta}\mathbb E_{\substack{t\sim\rho,\ \mathbf x_0\sim p_{\mathrm{data}},\\ \boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)}}\left[\lambda(t)\left\lVert D_\theta\left(\sqrt{\bar\alpha_t}\mathbf x_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon,t\right)-\mathbf x_0\right\rVert_2^{2}\right],\tag{18}
$$

其中 $\rho$ 采样扩散时刻，$\lambda(t)>0$ 平衡各噪声水平。在无约束去噪器上的总体最优处，去噪器给出条件均值 $D_{\theta^{\star}}(\mathbf x_t,t)=\mathbb E[\mathbf x_0\mid\mathbf x_t]$，后者通过 **Tweedie 公式** [50] 确定边缘分数：

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)=\frac{\sqrt{\bar\alpha_t}\,\mathbb E[\mathbf x_0\mid\mathbf x_t]-\mathbf x_t}{1-\bar\alpha_t}\approx\frac{\sqrt{\bar\alpha_t}\,D_\theta(\mathbf x_t,t)-\mathbf x_t}{1-\bar\alpha_t}.\tag{19}
$$

这些动力学背后的密度演化、**VP–VE 对应关系**以及去噪与分数匹配之间的联系在附录 A 中展开。

因此训练扩散模型仅从数据便刻画出关于解的高质量先验信息，且与反问题的不适定性相分离 [51]。然而把该预训练先验嵌入反问题的求解，需要一个精心设计的算法，以规定如何从预训练模型中提取先验信号，以及如何使其与基于物理的数据保真度交互。

### 2.4 扩散后验采样

扩散后验采样（DPS）修改第 2.3 节的反向过程以抽取以观测为条件的样本 [34]。给定含噪测量 $\mathbf y=A(\mathbf x_0)+\mathbf n$（$\mathbf n\sim\mathcal N(\mathbf 0,\sigma_y^{2}\mathbf I)$）与可能非线性的算子 $A$，从 $p(\mathbf x_0\mid\mathbf y)$ 采样把式 (16) 中的边缘分数替换为其条件对应物，得到反向时间 SDE

$$
\mathrm d\mathbf x_t=\left[\mathbf f(\mathbf x_t,t)-g(t)^{2}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf y)\right]\mathrm dt+g(t)\,\mathrm d\bar{\mathbf w}_t,\qquad t:T\to0.\tag{20}
$$

其余采样流程遵循第 2.3 节的无条件反向过程，因此条件生成归结为评估条件分数；贝叶斯公式把它分解为

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf y)=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t),\tag{21}
$$

其中第一项是式 (19) 提供的学习先验分数，第二项承载似然引导，通常难以处理，因为观测依赖无扰动速度 $\mathbf x_0$ 而非直接依赖 $\mathbf x_t$。给定 $\mathbf x_0$ 时 $\mathbf y$ 与 $\mathbf x_t$ 条件独立，故

$$
p_t(\mathbf y\mid\mathbf x_t)=\int p_{\mathrm{obs}}(\mathbf y\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0,\tag{22}
$$

它把干净数据似然在当前含噪状态相容的全部信号上做平均。DPS 用去噪器均值 $\widehat{\mathbf x}_0(\mathbf x_t)=D_\theta(\mathbf x_t,t)$ 替代该分布，并在该单点估计处评估似然：

$$
p_t(\mathbf y\mid\mathbf x_t)\approx p_{\mathrm{obs}}\left(\mathbf y\mid\widehat{\mathbf x}_0(\mathbf x_t)\right),\qquad\widehat{\mathbf x}_0(\mathbf x_t)=D_\theta(\mathbf x_t,t).\tag{23}
$$

在上述高斯观测模型下，式 (23) 的点代入给出

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t)\approx-\frac{1}{2\sigma_y^{2}}\nabla_{\mathbf x_t}\left\lVert\mathbf y-A\left(D_\theta(\mathbf x_t,t)\right)\right\rVert_2^{2}.\tag{24}
$$

把该近似代入式 (21) 得到实用的 DPS 条件分数：

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf y)\approx\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)-\zeta_t\nabla_{\mathbf x_t}\left\lVert\mathbf y-A\left(D_\theta(\mathbf x_t,t)\right)\right\rVert_2^{2},\tag{25}
$$

其中 $\zeta_t>0$ 为用户指定的引导强度参数，用于重标定数据一致性项以补偿其目标尺度 [34]。

以 DPS 为代表的条件采样方法通过似然近似、投影与分裂方案，以及退火或变分更新，在图像反问题上取得了实质进展 [35]、[52]、[53]、[36]、[51]。然而近期基准研究指出，一些基于扩散的 FWI 求解器对超参数与数值求解器稳定性敏感，可能不如良好初始化的经典 FWI [54]。若干 FWI 特有的困难有助于解释这些局限。

**(i) 周期跳跃与非凸性。** 逐点 $\ell_2$ 波形差异对相位偏移高度敏感，会产生振荡梯度与大量伪局部极小。因此，在粗糙的早期去噪估计处评估的似然梯度可能指向周期跳跃盆地，提供无效或误导的引导。

**(ii) 波形引导失衡。** 二次残差强调高振幅到达，同时压制携带深层或照明不良区域信息的较弱相位。连同 FWI 强烈空间相关的敏感度，这种失衡使单标量 $\zeta_t$ 不足以平衡模型域与反向时间轨迹上的更新 [47]。

**(iii) 非物理去噪估计。** 在每个反向步骤，DPS 都在 $D_\theta(\mathbf x_t,t)$ 上评估正演算子，而后者近似的是后验均值 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$ 而非来自学习先验的样本。该平均速度场不必位于高密度先验流形上，尤其在采样早期的高噪声水平处，常表现为模糊、非地质的中间图。由于波传播是非线性的，由该平均速度模拟的波场可能与合理先验样本对应的波场差异显著，产生不可靠的似然梯度。反向链随后在下一步丢弃该去噪估计，因而无法保留传统 FWI 初始化或累积的优化状态。

为解决这些困难，本文发展**物理状态引导扩散采样（PSG）**，从两方面修改原始后验引导。第一，PSG 维持一个显式**物理速度状态**，它从传统 FWI 初始化出发，并在整个反向轨迹中被持续精化。第二，高斯桥把该物理状态与由扩散先验表示的速度耦合；在条件数据分布上对桥积分得到物理分支的正则项，而对同一积分的条件均值评估向扩散变量提供简单的**一致性消息**。因此非线性波动方程**仅在持续物理状态上**求值。这两处修改在下节展开。

### 2.5 物理状态引导扩散采样

针对 $p(\mathbf x_0\mid\mathbf y)$ 的扩散采样需要沿含噪轨迹的条件分数 $\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf y)$，因而需要式 (21) 中难处理的似然—分数项 $\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t)$ 的近似。基于去噪器的 DPS 近似导致前述 FWI 实现困难。本文用高斯增广构造反向扩散的可处理物理条件，并把推断组织在所得到的引导采样轨迹周围。

考虑一个被区分的**物理速度** $\mathbf v$，并假设 $\mathbf v$ 与先验速度场 $\mathbf x_0$ 之间存在小的零均值高斯偏差，得到**高斯桥**

$$
r(\mathbf v\mid\mathbf x_0)=\mathcal N\left(\mathbf v;\mathbf x_0,\boldsymbol\Sigma\right),\tag{26}
$$

其中 $\boldsymbol\Sigma\succ0$ 指定误差协方差。

该假设连同观测模型 $\mathbf y=A(\mathbf v)+\boldsymbol\epsilon$ 及其似然 $p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)$，在数据层面给出增广条件分布（FWI 中 $A=F$）：

$$
\widetilde\pi(\mathbf x_0,\mathbf v\mid\mathbf y)=\frac{p_{\mathrm{data}}(\mathbf x_0)r(\mathbf v\mid\mathbf x_0)p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)}{\widetilde p(\mathbf y)}\propto p_{\mathrm{data}}(\mathbf x_0)r(\mathbf v\mid\mathbf x_0)p_{\mathrm{obs}}(\mathbf y\mid\mathbf v).\tag{27}
$$

式 (27) 用两个条件因子 $r(\mathbf v\mid\mathbf x_0)$ 与 $p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)$ 替代观测数据似然 $p_{\mathrm{obs}}(\mathbf y\mid\mathbf x_0)$。对固定 $\mathbf v$，波形一致性独立于 $\mathbf x_0$，并且只通过桥影响先验速度。物理支撑限制可通过在 $\mathcal X$ 之外把固定数据似然延拓为零来纳入。对物理状态边缘化给出

$$
\widetilde\pi(\mathbf x_0\mid\mathbf y)\propto p_{\mathrm{data}}(\mathbf x_0)\int r(\mathbf v\mid\mathbf x_0)p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\,\mathrm d\mathbf v
\;\xrightarrow[\boldsymbol\Sigma\to0]{}\;p_{\mathrm{data}}(\mathbf x_0)p_{\mathrm{obs}}(\mathbf y\mid\mathbf x_0),\tag{28}
$$

在高斯近似恒等核的通常连续性与可积性条件下 [55]，它恢复 DPS 所瞄准的后验。在有限 $\boldsymbol\Sigma$ 下，分裂目标不同于原始后验；其物理边缘分布为

$$
\widetilde\pi(\mathbf v\mid\mathbf y)\propto p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\int p_{\mathrm{data}}(\mathbf x_0)\varphi_{\boldsymbol\Sigma}(\mathbf v-\mathbf x_0)\,\mathrm d\mathbf x_0=p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\left(p_{\mathrm{data}}\ast\varphi_{\boldsymbol\Sigma}\right)(\mathbf v),\tag{29}
$$

其中 $\varphi_{\boldsymbol\Sigma}=\mathcal N(\mathbf 0,\boldsymbol\Sigma)$。因此物理速度被一个**高斯平滑的地质先验**正则化，允许其偏离原始先验的高密度区域，同时保持结构约束。紧桥极限针对的是这些模型分布，并不主张数值算法收敛到 DPS。

为推导与该目标相关的条件分数，本文用第 2.3 节的前向过程构造式 (27) 的含噪对应物。仅对 $\mathbf x_0$ 做扩散、保持 $\mathbf v$ 固定，给出

$$
\widetilde\pi_t(\mathbf x_t,\mathbf v\mid\mathbf y):=\int q_{0t}(\mathbf x_t\mid\mathbf x_0)\widetilde\pi(\mathbf x_0,\mathbf v\mid\mathbf y)\,\mathrm d\mathbf x_0
=\frac{p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)}{\widetilde p(\mathbf y)}\int q_{0t}(\mathbf x_t\mid\mathbf x_0)p_{\mathrm{data}}(\mathbf x_0)r(\mathbf v\mid\mathbf x_0)\,\mathrm d\mathbf x_0
$$
$$
=\frac{p_t(\mathbf x_t)p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)}{\widetilde p(\mathbf y)}\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0.\tag{30}
$$

把式 (30) 以 $(\mathbf v,\mathbf y)$ 为条件，贝叶斯公式给出 $\widetilde\pi_t(\mathbf x_t\mid\mathbf v,\mathbf y)\propto p_t(\mathbf x_t)\widetilde p_t(\mathbf v,\mathbf y\mid\mathbf x_t)$，并把反向过程所需的分数分解为两个显式项：

$$
\nabla_{\mathbf x_t}\log\widetilde\pi_t(\mathbf x_t\mid\mathbf v,\mathbf y)=\underbrace{\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)}_{\text{先验分数}}+\underbrace{\nabla_{\mathbf x_t}\log\widetilde p_t(\mathbf v,\mathbf y\mid\mathbf x_t)}_{\text{条件似然分数}},\tag{31}
$$

其中含噪状态的条件似然为

$$
\widetilde p_t(\mathbf v,\mathbf y\mid\mathbf x_t):=p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0.\tag{32}
$$

预训练模型提供式 (31) 中的先验分数项（与 DPS 相同），而式 (32) 中的增广似然通过同一联合后验把物理精化与条件采样联系起来。

实践中 PSG 维持一个持续物理速度 $\mathbf v$，它由传统 FWI 模型初始化，并针对波形一致性与对去噪速度估计的一致程度进行优化。其通过高斯桥的反馈把观测约束逐步传递给扩散轨迹。考虑固定 $t,\mathbf x_t,\mathbf y$ 处的式 (30) 联合后验，其负对数密度可分解为物理变量 $\mathbf v$ 的势 $U_t(\mathbf v;\mathbf x_t,\mathbf y)$ 与独立于 $\mathbf v$ 的项：

$$
-\log\widetilde\pi_t(\mathbf x_t,\mathbf v\mid\mathbf y)=U_t(\mathbf v;\mathbf x_t,\mathbf y)+\underbrace{-\log p_t(\mathbf x_t)+\log\widetilde p(\mathbf y)}_{\text{独立于 }\mathbf v},
$$
$$
U_t(\mathbf v;\mathbf x_t,\mathbf y):=-\log p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)-\log\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0.\tag{33}
$$

该分解给出物理状态的条件 MAP 判据：在 $\mathbf v$ 上最大化联合后验等价于最小化 $U_t$：

$$
\mathbf v_t^{\mathrm{MAP}}(\mathbf x_t,\mathbf y)\in\arg\max_{\mathbf v\in\mathcal X}\widetilde\pi_t(\mathbf x_t,\mathbf v\mid\mathbf y)=\arg\max_{\mathbf v\in\mathcal X}\widetilde\pi_t(\mathbf v\mid\mathbf x_t,\mathbf y)=\arg\min_{\mathbf v\in\mathcal X}U_t(\mathbf v;\mathbf x_t,\mathbf y).\tag{34}
$$

直接对 $U_t$ 变分涉及 $\mathbf x_0$ 在由 $r(\mathbf v\mid\mathbf x_0)$ 重加权后的去噪条件分布下的期望，而预训练去噪器估计的是 $p_t(\mathbf x_0\mid\mathbf x_t)$ 下的期望。为基于后一分布获得物理目标，Jensen 不等式给出变分上界

$$
U_t(\mathbf v;\mathbf x_t,\mathbf y)=\ell_{\mathbf y}(\mathbf v)-\log\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0
\le\ell_{\mathbf y}(\mathbf v)-\int\log r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0
$$
$$
=\underbrace{\left[\ell_{\mathbf y}(\mathbf v)+\frac{1}{2}\int\left\lVert\mathbf v-\mathbf x_0\right\rVert_{\boldsymbol\Sigma^{-1}}^{2}p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0\right]}_{\Psi_t(\mathbf v;\mathbf x_t,\mathbf y)}+\kappa_{\boldsymbol\Sigma}.\tag{35}
$$

这里 $\kappa_{\boldsymbol\Sigma}=\frac{1}{2}\log\left((2\pi)^{m}\det\boldsymbol\Sigma\right)$ 为高斯对数归一化常数，括号定义物理目标 $\Psi_t$。等价地，$-\Psi_t-\kappa_{\boldsymbol\Sigma}$ 下界式 (32) 中的对数因子。该界把去噪条件分布 $p_t(\mathbf x_0\mid\mathbf x_t)$ 作为固定变分选择，详见下文。固定 $t,\mathbf x_t$ 时条件密度 $p_t(\mathbf x_0\mid\mathbf x_t)$ 与 $\mathbf v$ 无关。在 $\ell_{\mathbf y}$ 可微处，对式 (35) 中标量目标 $\Psi_t$ 关于 $\mathbf v$ 取一阶变分即得梯度

$$
\nabla_{\mathbf v}\Psi_t(\mathbf v;\mathbf x_t,\mathbf y)=\nabla_{\mathbf v}\ell_{\mathbf y}(\mathbf v)+\int\boldsymbol\Sigma^{-1}(\mathbf v-\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0
=\nabla_{\mathbf v}\ell_{\mathbf y}(\mathbf v)+\boldsymbol\Sigma^{-1}\left(\mathbf v-\boldsymbol\mu_t(\mathbf x_t)\right),\tag{36}
$$

其中 $\boldsymbol\mu_t(\mathbf x_t):=\mathbb E[\mathbf x_0\mid\mathbf x_t]$ 表示给定 $\mathbf x_t$ 时干净速度场的条件期望，由预训练去噪器 $D_\theta(\mathbf x_t,t)$ 估计。每个反向步骤用该去噪估计执行一次物理更新。对从 $t_n$ 到 $t_{n-1}$ 的转移，梯度步取

$$
\mathbf v_{t_{n-1}}=\mathbf v_{t_n}-\eta_v\left[\nabla_{\mathbf v}\ell_{\mathbf y}(\mathbf v_{t_n})+\boldsymbol\Sigma^{-1}\left(\mathbf v_{t_n}-D_\theta(\mathbf x_{t_n},t_n)\right)\right],\tag{37}
$$

其中 $\eta_v>0$ 为物理步长，$\mathbf v_{t_n}$ 为从前一反向步骤携带的状态。从 $\mathbf v_{t_N}=\mathbf v_{\mathrm{init}}$ 出发，对 $n=N,\ldots,1$ 迭代。更新后的状态 $\mathbf v_{t_{n-1}}$ 随后引导从 $\mathbf x_{t_n}$ 到 $\mathbf x_{t_{n-1}}$ 的扩散转移。数值实现见附录 B。

因此物理分支执行的是由去噪速度场引导并正则化的 FWI 优化。

为评估该上界的差距，记桥积分及其归一化重加权条件密度为

$$
B_t(\mathbf v\mid\mathbf x_t):=\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0,\qquad
\rho_t^{v}(\mathbf x_0\mid\mathbf x_t):=\frac{r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)}{B_t(\mathbf v\mid\mathbf x_t)}.
$$

桥按候选干净场与当前物理速度 $\mathbf v$ 的一致程度对其重加权。从式 (35) 上界中减去 $U_t$ 会抵消共同的波形损失。由于 $p_t(\mathbf x_0\mid\mathbf x_t)$ 积分为一，剩余差异可写为

$$
\Psi_t(\mathbf v;\mathbf x_t,\mathbf y)+\kappa_{\boldsymbol\Sigma}-U_t(\mathbf v;\mathbf x_t,\mathbf y)=\log B_t(\mathbf v\mid\mathbf x_t)-\int p_t(\mathbf x_0\mid\mathbf x_t)\log r(\mathbf v\mid\mathbf x_0)\,\mathrm d\mathbf x_0
$$
$$
=\int p_t(\mathbf x_0\mid\mathbf x_t)\log\frac{B_t(\mathbf v\mid\mathbf x_t)}{r(\mathbf v\mid\mathbf x_0)}\,\mathrm d\mathbf x_0
=\int p_t(\mathbf x_0\mid\mathbf x_t)\log\frac{p_t(\mathbf x_0\mid\mathbf x_t)}{\rho_t^{v}(\mathbf x_0\mid\mathbf x_t)}\,\mathrm d\mathbf x_0
=\mathrm{KL}\left(p_t(\cdot\mid\mathbf x_t)\,\Vert\,\rho_t^{v}(\cdot\mid\mathbf x_t)\right)\ge0.\tag{38}
$$

最后一个积分定义原始去噪条件分布与其桥重加权版本之间的 Kullback–Leibler（KL）散度 [56]。此处它度量上界高出精确物理能量多少，并在两个分布一致时消失；其非负性与 Jensen 不等式一致。该上界选择与 $\boldsymbol\mu_t$ 的网络估计是两种不同的近似。由于差距一般依赖 $\mathbf v$，减小替代目标不必减小精确条件能量或恢复其 MAP 解。

对条件采样，精化后的物理状态 $\mathbf v$ 保持固定。把式 (32) 代入式 (31) 第二项得

$$
\nabla_{\mathbf x_t}\log\widetilde\pi_t(\mathbf x_t\mid\mathbf v,\mathbf y)=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log\widetilde p_t(\mathbf v,\mathbf y\mid\mathbf x_t)
$$
$$
=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log\left[p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0\right]
$$
$$
=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\underbrace{\nabla_{\mathbf x_t}\log p_{\mathrm{obs}}(\mathbf y\mid\mathbf v)}_{=0}+\nabla_{\mathbf x_t}\log\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0
=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log\int r(\mathbf v\mid\mathbf x_0)p_t(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0.\tag{39}
$$

在增广模型下以上等式均精确成立。波形似然从条件似然分数中消失，因为它只依赖固定的 $\mathbf v$ 与 $\mathbf y$。剩余积分与 DPS 中式 (22) 的含噪状态似然结构相同；此处桥似然 $r(\mathbf v\mid\mathbf x_0)$ 使用线性恒等观测算子、以当前物理速度 $\mathbf v$ 为目标，而 FWI 似然涉及非线性波传播算子 $F$。与 DPS 式 (23) 相同的点估计近似在 $\mathbf x_0$ 的条件期望（由 $D_\theta(\mathbf x_t,t)$ 估计）处评估桥因子，从而直接比较去噪速度与物理状态，给出

$$
\nabla_{\mathbf x_t}\log\widetilde\pi_t(\mathbf x_t\mid\mathbf v,\mathbf y)\approx\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log r\left(\mathbf v\mid D_\theta(\mathbf x_t,t)\right)
$$
$$
=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)-\frac{1}{2}\nabla_{\mathbf x_t}\left\lVert\mathbf v-D_\theta(\mathbf x_t,t)\right\rVert_{\boldsymbol\Sigma^{-1}}^{2}
=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+J_{D_\theta}(\mathbf x_t,t)^{\top}\boldsymbol\Sigma^{-1}\left(\mathbf v-D_\theta(\mathbf x_t,t)\right).\tag{40}
$$

回顾第 2.3 节的 VP 噪声调度 $\beta(t)$ 及其累积衰减 $\bar\alpha_t=\exp\{-\int_0^{t}\beta(s)\,\mathrm ds\}$。在反向网格 $t_N>\cdots>t_0$ 上，相应离散系数为 $\alpha_{t_n}=\bar\alpha_{t_n}/\bar\alpha_{t_{n-1}}$、$\beta_{t_n}=1-\alpha_{t_n}$。使用 DPS [34] 算法 1 中固定反向方差的祖先 VP 均值，单步采样取

$$
\widehat{\mathbf x}'_{t_{n-1}}=\frac{\sqrt{\alpha_{t_n}}\left(1-\bar\alpha_{t_{n-1}}\right)}{1-\bar\alpha_{t_n}}\mathbf x_{t_n}+\frac{\sqrt{\bar\alpha_{t_{n-1}}}\beta_{t_n}}{1-\bar\alpha_{t_n}}D_\theta(\mathbf x_{t_n},t_n)+\gamma_{t_n}\mathbf z_{t_n},
$$
$$
\mathbf x_{t_{n-1}}=\widehat{\mathbf x}'_{t_{n-1}}-\frac{\xi_{t_n}}{2}\nabla_{\mathbf x_{t_n}}\left\lVert\mathbf v_{t_{n-1}}-D_\theta(\mathbf x_{t_n},t_n)\right\rVert_{\boldsymbol\Sigma^{-1}}^{2}.\tag{41}
$$

这里 $\xi_{t_n}\ge0$ 为扩散引导步长，$\mathbf z_{t_n}\sim\mathcal N(\mathbf 0,\mathbf I)$ 在每步独立抽取。对该祖先形式，本文按 DDPM 参数化 [30] 固定反向方差 $\gamma_{t_n}^{2}=\beta_{t_n}(1-\bar\alpha_{t_{n-1}})/(1-\bar\alpha_{t_n})$，即高斯前向桥 $q(\mathbf x_{t_{n-1}}\mid\mathbf x_{t_n},\mathbf x_0)$ 的方差。实验离散化见附录 B.3。

PSG 在以物理速度为条件的线性恒等观测模型下遵循完整反向扩散轨迹。在每个噪声水平上，由当前去噪场正则化的波形拟合精化该物理条件，后者再引导下一步扩散。两个状态都在轨迹中持续存在，因此生成动力学与物理精化在整个推断中保持耦合。物理条件通过优化演化，所得耦合轨迹并未被证明精确采样增广后验。

**算法 1　物理状态引导扩散采样（PSG）**

```text
Require: 反向步数 N; 观测波形 y; 预训练去噪器 D_θ; 初始物理速度 v_init;
         桥协方差 Σ; 物理步长 η_v; 反向时间网格 {t_n}_{n=0}^N（t_N > … > t_0）;
         扩散引导步长 {ξ_{t_n}}_{n=1}^N
1: x_{t_N} ~ N(0, I), v_{t_N} ← v_init
2: for n = N to 1 do
3:     x̂_0 ← D_θ(x_{t_n}, t_n)
4:     v_{t_{n-1}} ← v_{t_n} − η_v [ ∇_v ℓ_y(v_{t_n}) + Σ^{-1}(v_{t_n} − x̂_0) ]
5:     z_{t_n} ~ N(0, I)
6:     x̂'_{t_{n-1}} ← (√α_{t_n}(1−ᾱ_{t_{n-1}})/(1−ᾱ_{t_n})) x_{t_n}
                      + (√ᾱ_{t_{n-1}} β_{t_n}/(1−ᾱ_{t_n})) x̂_0 + γ_{t_n} z_{t_n}
7:     x_{t_{n-1}} ← x̂'_{t_{n-1}} − (ξ_{t_n}/2) ∇_{x_{t_n}} ||v_{t_{n-1}} − x̂_0||²_{Σ^{-1}}
8: end for
9: return v_{t_0}（物理输出）与 x̂_0（去噪输出）
```

算法 1 返回两个速度估计：来自条件采样分支的终端去噪估计 $\widehat{\mathbf x}_0$ 与最终物理速度 $\mathbf v_{t_0}$。一般而言，两者呈现相似的整体重建，仅在细尺度细节上有细微差异。对第 3.2 节 OpenFWI 基准的主要实验，PSG 取终端去噪估计 $\widehat{\mathbf x}_0$ 作为反演结果，因为相比物理优化过程的输出，它更忠实地保留了学习先验所编码的地质特征，包括锐利边界、清晰地质界面与地质区域内的连续性。第 3.3 节集成不确定性分析使用同一输出。对第 3.4 节分布外（OOD）实验，本文取物理输出 $\mathbf v_{t_0}$ 作为反演结果，以便泛化到学习先验之外的地质结构。该输出不被直接限制在学习先验所表示的结构上，使波形拟合能恢复未知物理结构，而基于先验的结构正则化促进连续性与地质细节的恢复。

## 3 数值实验

本节在既有全波形反演基准上评估 PSG 的反演精度与稳定性。第 3.1 节介绍评估重建质量的指标；第 3.2 节给出 OpenFWI 基准 [57] 上跨四个不同复杂场景的主要验证结果；第 3.3 节研究并可视化 PSG 在随机采样轨迹下的集成不确定性；第 3.4 节评估该基于扩散的逆求解器直接泛化到分布外速度模型（Marmousi、Overthrust 与 BP2004 Salt）的能力。实验细节（基线定义、超参数设置、采样方案与计算代价）见附录 B。

### 3.1 评估指标

重建精度用均方根误差（RMSE）、平均绝对误差（MAE）与结构相似性指数（SSIM）量化。速度按附录 B.1 以中心 3000 m/s、尺度 1500 m/s 做仿射归一化。令 $\widehat{\mathbf v},\mathbf v\in\mathbb R^{m}$ 分别表示空间网格上归一化的重建与真值速度场。RMSE 与 MAE 量化逐点偏差：

$$
\mathrm{RMSE}=\sqrt{\frac{1}{m}\sum_{i=1}^{m}\left(v_i-\widehat v_i\right)^{2}},\qquad
\mathrm{MAE}=\frac{1}{m}\sum_{i=1}^{m}\left|v_i-\widehat v_i\right|,\tag{42}
$$

其中 RMSE 更强调大残差，MAE 度量平均绝对偏差。这些误差直接在归一化场上评估，并乘以 1500 m/s 以物理单位报告；数值越低表示越准确。

对 SSIM [58]，两个归一化场先裁剪到 $[-1,1]$、再线性重缩放到 $[0,1]$。局部结构一致性量化为

$$
\mathrm{SSIM}(\mathbf v,\widehat{\mathbf v})=\frac{\left(2\mu_v\mu_{\widehat v}+C_1\right)\left(2\sigma_{v,\widehat v}+C_2\right)}{\left(\mu_v^{2}+\mu_{\widehat v}^{2}+C_1\right)\left(\sigma_v^{2}+\sigma_{\widehat v}^{2}+C_2\right)},\tag{43}
$$

其中 $\mu_v,\mu_{\widehat v}$ 为重缩放场的局部均值，$\sigma_v^{2},\sigma_{\widehat v}^{2}$ 为其局部方差，$\sigma_{v,\widehat v}$ 为其局部协方差。这些统计量使用标准差 1.5 个网格单元、面积 $11\times11$ 的归一化高斯窗，并在网格边界做五单元零填充。对单位数据范围取 $C_1=0.01^{2}$、$C_2=0.03^{2}$，并在全部原始网格点上平均局部得分得到所报 SSIM；数值越高表示结构一致性越强。RMSE 与 MAE 刻画整体速度振幅误差，而 SSIM 度量感知与结构一致性，二者共同提供互补的反演质量评估。

### 3.2 OpenFWI 数据集上的验证

OpenFWI [57] 是面向全波形反演的大规模基准，把地下速度模型与跨多样合成地质结构的模拟地震记录配对。本文考虑覆盖不同复杂场景的四个代表性族：**FlatVel-B（FV-B）**，具有被锐利速度对比分隔的水平层；**FlatFault-B（FF-B）**，层状背景被断层错断；**CurveVel-B（CV-B）**，具有横向变化的弯曲与倾斜界面；**CurveFault-B（CF-B）**，弯曲层理被断层切割。

本文把 PSG 与以下基线比较：无正则化的标准 FWI、Tikhonov-FWI [12]、TV-FWI [13]、DPS [34]、RED-DiffEq [41]、DiffusionFWI [38] 与 SGDS-FWI [29]。所有方法在一致的物理条件下评估，扩散类方法共享同一神经先验，以确保公平比较。

对每个族，本文独立训练一个 EDM 扩散模型 [59]，并在该族上评估的所有扩散类方法间共享预训练模型。预训练设置见附录 B.1。该**方差爆炸（VE）**参数化在连续噪声水平上做去噪训练，天然适配连续时间轴上的自定义噪声调度。因此，所有原本基于 DDPM 表述 [30] 的比较方法，都通过 VE 与方差保持（VP）状态之间依赖于时间的线性重标定及相关噪声水平换算加以适配，与 InverseBench [54] 一致。方法实现协议与超参数设置见附录 B.3 与 B.4。图 3 可视化了测试数据集中的真值速度模型，以及各预训练模型经 1000 步确定性 DDIM 采样 [32] 生成的无条件样本，展示所学先验捕捉到的特征性层状与断层结构。

#### 3.2.1 干净地震数据

本文在每个速度族测试数据集的 100 个速度—波形对上评估所有方法。观测波场在 70 个地表检波器上采样，共 1000 个时间步。对需要初始速度模型的方法，本文用标准差 $\sigma_{\mathrm{init}}=10$ 的高斯滤波器平滑真值速度，提供共享的 oracle 初始化。

对基于优化的方法（包括 FWI 及其正则化变体与 RED-DiffEq [41]），按 RED-DiffEq 官方仓库的基准配置使用 300 次迭代。对 DiffusionFWI [38]，遵循其官方仓库设置，使用 100 个反向扩散步、相邻扩散更新之间 10 次 FWI 优化步。对 SGDS-FWI [29]，采用作者官方仓库中总共 1050 次 FWI 优化步的设置。DPS 与 PSG 都把与 DDPM [30] 相关的 VP 噪声调度离散为 1000 步。PSG 的每步运行时间分解见附录 B.5；算法描述与超参数设置见附录 B.3 与 B.4；声学正演算子及其数值离散见附录 B.2。

图 4 比较了每个族中一个固定测试样本的重建速度场，并给出真值与平滑初始模型。表 1 报告每个族 100 个测试样本上平均的 MAE、RMSE 与 SSIM。

无正则化 FWI 呈现振荡伪影与不准确的速度振幅，在较深区域尤其明显。Tikhonov 与 TV 正则化减少这些伪影，但 Tikhonov 倾向模糊界面，而 TV 保持更锐利对比却仍未解析细结构。直接 DPS 产生的速度场保留学习先验的结构模式，但界面位置错误、速度振幅不正确，导致误差显著更大；部分原因可归于缺少合适的物理初始化以在采样早期支持有效的梯度引导。DiffusionFWI 恢复主导层状结构，但在弯曲与断层族中细细节重建仍不够准确。RED-DiffEq 抑制伪影并改善与真值的一致性，在 FF-B、CV-B 与 CF-B 上取得最强基线指标。SGDS-FWI 产生相对锐利的边界与清晰地质图案，但模型底部附近的内部细节解析不够准确。PSG 引导采样过程的输出更好地保留了学习先验的图像质量，具有锐利界面与连贯的细尺度细节（包括较深区域）。与这些视觉观察一致，PSG 在全部四个数据集上取得最低的平均 MAE 与 RMSE 以及最高的平均 SSIM，提供更准确的速度重建。

**表 1：干净地震数据下的 OpenFWI 结果（每个族 100 个测试样本平均）。** MAE 与 RMSE 单位为 m/s。原文以粗体表示各指标、各族的最优均值。

| 方法 | FV-B MAE | FV-B RMSE | FV-B SSIM | FF-B MAE | FF-B RMSE | FF-B SSIM | CV-B MAE | CV-B RMSE | CV-B SSIM | CF-B MAE | CF-B RMSE | CF-B SSIM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FWI | 214.9 | 338.7 | 0.681 | 175.0 | 269.0 | 0.696 | 350.6 | 531.5 | 0.522 | 263.7 | 400.8 | 0.603 |
| Tikhonov-FWI | 207.4 | 328.1 | 0.702 | 168.3 | 259.7 | 0.730 | 339.6 | 515.9 | 0.543 | 252.1 | 384.1 | 0.633 |
| TV-FWI | 198.3 | 320.7 | 0.741 | 156.7 | 247.7 | 0.783 | 328.3 | 507.0 | 0.580 | 241.3 | 372.3 | 0.669 |
| DPS | 671.2 | 895.7 | 0.556 | 469.8 | 649.2 | 0.536 | 718.9 | 976.8 | 0.387 | 495.5 | 698.8 | 0.421 |
| RED-DiffEq | 167.0 | 280.4 | 0.797 | 135.3 | 216.7 | 0.841 | 263.7 | 418.9 | 0.673 | 174.1 | 276.2 | 0.774 |
| DiffusionFWI | 144.3 | 249.3 | 0.830 | 141.2 | 243.1 | 0.798 | 300.0 | 490.5 | 0.634 | 200.1 | 332.0 | 0.715 |
| SGDS-FWI | 173.6 | 289.4 | 0.803 | 152.1 | 254.1 | 0.796 | 311.6 | 505.1 | 0.628 | 210.1 | 346.6 | 0.720 |
| PSG | 110.2 | 209.6 | 0.880 | 84.9 | 166.4 | 0.904 | 188.1 | 357.3 | 0.789 | 112.0 | 219.1 | 0.860 |

#### 3.2.2 含噪地震数据

本文继而评估对加性测量噪声的鲁棒性。地震观测被标准差 $\sigma\in\{0.1,0.3,0.5\}$ 的独立高斯噪声扰动（原始振幅尺度）。这些水平在 400 个测试模型上对应平均每样本信噪比 24.1、14.6 与 10.2 dB。所有方法接收相同含噪观测，并保持干净数据实验的初始化与超参数设置。

图 5 给出 CF-B 测试样本 413 在三个噪声水平下的含噪炮集与重建。该样本用于展示随噪声增大的退化趋势。表 2 报告每个族 100 个测试样本上平均的 MAE、RMSE 与 SSIM。

随噪声水平升高，无正则化 FWI 与 Tikhonov-FWI 出现愈发明显的振荡伪影，在较深区域尤为显著。TV-FWI 抑制了大部分污染，但其分片常值重建引入阶梯图案且未解析细界面。DPS 继续表现出干净数据下的行为：输出保留学习先验的结构模式，但界面位置错误与速度振幅不正确导致重建不准确。DiffusionFWI 与 SGDS-FWI 表现出相似的噪声敏感性：两者在低噪声下恢复可辨认结构，但更强的扰动引入大量伪影并破坏速度模型连贯的层与断层图案。

PSG 对测量噪声也表现出显著的鲁棒性：在 $\sigma=0.1$ 时于全部四个族上取得最低平均 MAE 与 RMSE 以及最高平均 SSIM。随噪声增大，RED-DiffEq 在扩散类基线中提供最一致的重建精度。在 $\sigma=0.3$ 时，PSG 在全部四个族上取得最低平均 MAE 与最高平均 SSIM，而 RED-DiffEq 在其中三个族上取得更低 RMSE。在 $\sigma=0.5$ 时，PSG 在 FV-B 与 CV-B 上保持最低平均 MAE，尽管 RED-DiffEq 在全部四个族上取得更低 RMSE。在所测噪声水平上，PSG 一般取得比 DPS、DiffusionFWI 与 SGDS-FWI 更低的误差。

如图 5 所示，PSG 的退化在较深区域最为明显：重建模型在学习先验下保留合理结构，但层边界与断层几何偏离真值。尽管存在这些扭曲，PSG 在全部 12 个族—噪声条件下取得最高平均 SSIM。该结构优势与条件采样和扩散正则化物理优化之间的区别一致：PSG 把条件扩散轨迹与演化的物理状态耦合，即使恢复的速度振幅变得不够准确，也能保持连贯的先验结构。这些结果支持 PSG 作为含噪观测下 FWI 条件扩散求解器的鲁棒性。

**表 2：高斯噪声下的 OpenFWI 结果（每个族 100 个测试样本平均）。** MAE 与 RMSE 单位为 m/s。原文以粗体表示各指标、各族、各噪声水平的最优均值。

**FV-B**

| 方法 | σ=0.1 MAE | σ=0.1 RMSE | σ=0.1 SSIM | σ=0.3 MAE | σ=0.3 RMSE | σ=0.3 SSIM | σ=0.5 MAE | σ=0.5 RMSE | σ=0.5 SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 245.3 | 373.3 | 0.604 | 288.1 | 422.7 | 0.488 | 323.5 | 466.0 | 0.415 |
| Tikhonov-FWI | 230.6 | 353.2 | 0.655 | 259.5 | 383.7 | 0.569 | 278.7 | 403.2 | 0.506 |
| TV-FWI | 214.3 | 338.9 | 0.731 | 232.4 | 357.8 | 0.704 | 241.5 | 366.0 | 0.676 |
| DPS | 667.3 | 890.7 | 0.563 | 668.9 | 891.3 | 0.559 | 684.3 | 904.0 | 0.543 |
| RED-DiffEq | 187.7 | 308.1 | 0.782 | 211.5 | 333.3 | 0.760 | 225.4 | 347.8 | 0.745 |
| DiffusionFWI | 161.4 | 272.2 | 0.812 | 212.1 | 341.3 | 0.668 | 273.1 | 423.0 | 0.521 |
| SGDS-FWI | 177.1 | 292.5 | 0.796 | 212.2 | 334.2 | 0.690 | 273.0 | 411.8 | 0.549 |
| PSG | 128.9 | 240.7 | 0.857 | 179.8 | 316.5 | 0.812 | 206.5 | 352.5 | 0.778 |

**FF-B**

| 方法 | σ=0.1 MAE | σ=0.1 RMSE | σ=0.1 SSIM | σ=0.3 MAE | σ=0.3 RMSE | σ=0.3 SSIM | σ=0.5 MAE | σ=0.5 RMSE | σ=0.5 SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 217.8 | 323.6 | 0.595 | 267.2 | 386.8 | 0.478 | 306.8 | 439.0 | 0.409 |
| Tikhonov-FWI | 201.0 | 299.8 | 0.666 | 232.1 | 335.3 | 0.579 | 255.5 | 362.8 | 0.517 |
| TV-FWI | 183.1 | 279.9 | 0.752 | 202.6 | 300.2 | 0.712 | 213.1 | 310.9 | 0.681 |
| DPS | 463.6 | 641.2 | 0.538 | 448.7 | 624.6 | 0.537 | 449.5 | 624.3 | 0.534 |
| RED-DiffEq | 170.5 | 259.7 | 0.804 | 200.9 | 293.2 | 0.762 | 217.8 | 310.8 | 0.738 |
| DiffusionFWI | 166.8 | 273.3 | 0.755 | 234.4 | 369.3 | 0.592 | 308.3 | 469.6 | 0.478 |
| SGDS-FWI | 155.7 | 257.8 | 0.781 | 201.3 | 320.9 | 0.636 | 266.5 | 411.0 | 0.519 |
| PSG | 127.8 | 227.5 | 0.867 | 194.0 | 321.7 | 0.800 | 228.9 | 366.5 | 0.764 |

**CV-B**

| 方法 | σ=0.1 MAE | σ=0.1 RMSE | σ=0.1 SSIM | σ=0.3 MAE | σ=0.3 RMSE | σ=0.3 SSIM | σ=0.5 MAE | σ=0.5 RMSE | σ=0.5 SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 372.9 | 553.5 | 0.475 | 400.3 | 581.0 | 0.414 | 425.8 | 608.4 | 0.369 |
| Tikhonov-FWI | 355.4 | 529.2 | 0.513 | 371.5 | 540.8 | 0.468 | 384.2 | 549.8 | 0.433 |
| TV-FWI | 338.9 | 516.2 | 0.570 | 348.0 | 520.8 | 0.552 | 354.8 | 523.0 | 0.533 |
| DPS | 714.6 | 972.1 | 0.389 | 712.8 | 966.9 | 0.388 | 710.0 | 959.5 | 0.390 |
| RED-DiffEq | 280.9 | 434.3 | 0.664 | 311.6 | 458.8 | 0.638 | 332.9 | 474.9 | 0.618 |
| DiffusionFWI | 317.4 | 512.6 | 0.607 | 350.5 | 552.2 | 0.530 | 396.2 | 609.3 | 0.449 |
| SGDS-FWI | 315.1 | 507.5 | 0.621 | 347.7 | 542.9 | 0.553 | 402.1 | 609.2 | 0.471 |
| PSG | 204.2 | 388.7 | 0.781 | 269.0 | 480.8 | 0.718 | 325.5 | 557.6 | 0.670 |

**CF-B**

| 方法 | σ=0.1 MAE | σ=0.1 RMSE | σ=0.1 SSIM | σ=0.3 MAE | σ=0.3 RMSE | σ=0.3 SSIM | σ=0.5 MAE | σ=0.5 RMSE | σ=0.5 SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 303.9 | 450.8 | 0.529 | 340.3 | 493.6 | 0.449 | 369.1 | 529.9 | 0.396 |
| Tikhonov-FWI | 285.8 | 424.2 | 0.576 | 311.4 | 451.2 | 0.515 | 326.8 | 467.1 | 0.473 |
| TV-FWI | 268.0 | 404.8 | 0.632 | 284.5 | 419.4 | 0.594 | 290.8 | 423.1 | 0.570 |
| DPS | 494.2 | 696.5 | 0.421 | 487.2 | 682.4 | 0.418 | 482.5 | 671.4 | 0.413 |
| RED-DiffEq | 210.3 | 320.3 | 0.726 | 242.9 | 354.2 | 0.679 | 260.8 | 371.1 | 0.653 |
| DiffusionFWI | 242.4 | 387.7 | 0.658 | 297.8 | 464.1 | 0.555 | 360.3 | 546.3 | 0.466 |
| SGDS-FWI | 214.0 | 350.5 | 0.708 | 246.8 | 396.5 | 0.619 | 304.4 | 475.4 | 0.527 |
| PSG | 160.2 | 294.4 | 0.806 | 238.6 | 400.2 | 0.720 | 293.7 | 470.2 | 0.660 |

#### 3.2.3 缺道地震数据

本文最后评估不完整采集下的方法：从每个炮集中移除 70 条检波器道中的 10、35 与 60 条，对应缺失比例 14.3%、50.0% 与 85.7%。对每个测试模型，随机选取的缺失检波器位置在所有炮与方法间共享，且三个水平的缺失集相互嵌套。所有方法只在保留的检波器上评估波形失配。初始化与超参数设置遵循干净数据实验，且不加入加性噪声。

所有方法的反演结果见图 6。表 3 报告每个族 100 个测试样本上平均的 MAE、RMSE 与 SSIM。

重建质量一般随缺失道数增加而变差，仅在剩 10 个检波器时退化最严重。无正则化 FWI 及其经典正则化变体呈现明显伪影与细尺度细节丢失，在较深区域尤为突出。DiffusionFWI 与 SGDS-FWI 恢复主导层与断层图案，但在稀疏采集下仍存在局部伪影与不准确的深层界面。DPS 保留学习先验的结构特征，但继续产生不准确的层边界与断层几何。RED-DiffEq 抑制了许多此类伪影并保持连贯的大尺度结构。即使移除 70 条检波器中的 60 条，PSG 仍保持更锐利的界面与细尺度结构细节，在每个缺道水平下于全部四个族上取得最低平均 MAE 与 RMSE 以及最高平均 SSIM。结合第 3.2.2 节的高斯噪声结果，这些发现支持 PSG 对测量噪声与严重不完整采集的鲁棒性。

**表 3：缺道情况下的 OpenFWI 结果（每个族 100 个测试样本平均）。** MAE 与 RMSE 单位为 m/s。原文以粗体表示各指标、各族、各缺道水平的最优均值。

**FV-B**

| 方法 | 10/70 缺 MAE | RMSE | SSIM | 35/70 缺 MAE | RMSE | SSIM | 60/70 缺 MAE | RMSE | SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 216.1 | 339.9 | 0.679 | 219.2 | 343.2 | 0.673 | 229.5 | 351.8 | 0.640 |
| Tikhonov-FWI | 208.4 | 329.0 | 0.701 | 211.2 | 332.1 | 0.696 | 221.6 | 341.2 | 0.662 |
| TV-FWI | 199.4 | 321.5 | 0.739 | 202.0 | 324.6 | 0.735 | 210.8 | 332.6 | 0.710 |
| DPS | 648.0 | 867.7 | 0.575 | 635.2 | 849.4 | 0.562 | 618.8 | 834.9 | 0.565 |
| RED-DiffEq | 168.0 | 281.4 | 0.795 | 168.8 | 281.1 | 0.794 | 175.0 | 288.0 | 0.778 |
| DiffusionFWI | 145.2 | 251.2 | 0.829 | 146.7 | 253.6 | 0.828 | 151.5 | 258.5 | 0.819 |
| SGDS-FWI | 176.0 | 292.4 | 0.801 | 177.6 | 294.5 | 0.801 | 176.0 | 292.1 | 0.799 |
| PSG | 108.8 | 207.6 | 0.881 | 108.1 | 207.4 | 0.880 | 115.8 | 219.4 | 0.871 |

**FF-B**

| 方法 | 10/70 缺 MAE | RMSE | SSIM | 35/70 缺 MAE | RMSE | SSIM | 60/70 缺 MAE | RMSE | SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 177.2 | 271.6 | 0.693 | 181.5 | 276.1 | 0.683 | 216.0 | 315.9 | 0.594 |
| Tikhonov-FWI | 169.9 | 261.6 | 0.727 | 173.4 | 265.3 | 0.718 | 206.6 | 303.5 | 0.627 |
| TV-FWI | 158.1 | 249.4 | 0.781 | 161.0 | 252.2 | 0.773 | 191.6 | 287.4 | 0.693 |
| DPS | 460.4 | 636.9 | 0.537 | 444.9 | 622.4 | 0.544 | 458.2 | 632.6 | 0.518 |
| RED-DiffEq | 136.5 | 217.7 | 0.839 | 140.4 | 222.1 | 0.832 | 161.0 | 244.7 | 0.787 |
| DiffusionFWI | 141.2 | 242.3 | 0.798 | 142.7 | 244.0 | 0.795 | 160.1 | 262.5 | 0.758 |
| SGDS-FWI | 152.8 | 255.1 | 0.795 | 156.5 | 259.6 | 0.789 | 175.7 | 282.4 | 0.747 |
| PSG | 86.1 | 168.0 | 0.902 | 89.4 | 171.9 | 0.899 | 111.7 | 200.7 | 0.871 |

**CV-B**

| 方法 | 10/70 缺 MAE | RMSE | SSIM | 35/70 缺 MAE | RMSE | SSIM | 60/70 缺 MAE | RMSE | SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 349.6 | 530.1 | 0.523 | 352.4 | 532.4 | 0.516 | 372.4 | 543.9 | 0.473 |
| Tikhonov-FWI | 338.8 | 514.7 | 0.544 | 341.5 | 516.6 | 0.537 | 362.1 | 529.0 | 0.491 |
| TV-FWI | 327.6 | 506.4 | 0.580 | 330.7 | 508.9 | 0.573 | 351.3 | 519.9 | 0.527 |
| DPS | 701.5 | 957.7 | 0.394 | 691.5 | 943.5 | 0.401 | 681.2 | 911.0 | 0.392 |
| RED-DiffEq | 263.6 | 418.0 | 0.673 | 267.1 | 422.0 | 0.667 | 286.5 | 437.2 | 0.631 |
| DiffusionFWI | 300.8 | 491.6 | 0.632 | 299.6 | 489.2 | 0.631 | 312.8 | 497.9 | 0.608 |
| SGDS-FWI | 312.2 | 506.7 | 0.628 | 312.1 | 507.0 | 0.626 | 336.8 | 531.1 | 0.595 |
| PSG | 187.5 | 357.2 | 0.790 | 187.8 | 356.5 | 0.789 | 211.9 | 379.7 | 0.757 |

**CF-B**

| 方法 | 10/70 缺 MAE | RMSE | SSIM | 35/70 缺 MAE | RMSE | SSIM | 60/70 缺 MAE | RMSE | SSIM |
|---|---|---|---|---|---|---|---|---|---|
| FWI | 262.4 | 398.6 | 0.603 | 266.9 | 403.6 | 0.593 | 319.8 | 460.6 | 0.484 |
| Tikhonov-FWI | 251.2 | 382.6 | 0.632 | 255.6 | 387.5 | 0.621 | 308.0 | 444.0 | 0.508 |
| TV-FWI | 239.0 | 368.9 | 0.672 | 242.3 | 372.6 | 0.660 | 294.1 | 427.7 | 0.547 |
| DPS | 494.4 | 695.2 | 0.417 | 479.7 | 671.7 | 0.420 | 484.6 | 675.0 | 0.407 |
| RED-DiffEq | 174.0 | 275.8 | 0.773 | 179.3 | 282.6 | 0.764 | 221.0 | 328.1 | 0.673 |
| DiffusionFWI | 199.9 | 331.8 | 0.716 | 200.0 | 331.4 | 0.713 | 241.8 | 379.8 | 0.639 |
| SGDS-FWI | 208.7 | 345.6 | 0.720 | 213.5 | 349.6 | 0.709 | 251.7 | 392.7 | 0.645 |
| PSG | 112.9 | 220.5 | 0.859 | 113.3 | 220.1 | 0.858 | 143.9 | 262.0 | 0.820 |

### 3.3 随机轨迹敏感性与集成不确定性

PSG 通过初始扩散状态与反向时间 SDE 的噪声增量两方面具有随机性。为评估该随机性的影响，本文从每个 OpenFWI 族选取十个测试模型（索引 400—409），对每个模型执行 20 次独立运行，共 800 次反演。每次运行独立抽取 $\mathbf x_{t_N}\sim\mathcal N(\mathbf 0,\mathbf I)$ 与反向 SDE 噪声增量，而干净观测、物理初始化、预训练先验与超参数保持与第 3.2.1 节相同。本文以 20 个终端去噪速度场的逐像素均值作为集成预测，以其标准差作为跨随机轨迹变异性的度量。

图 7 表明集成均值保持接近真值速度场，保留了主体速度对比、层几何与断层图案。变异性主要集中于断层与地质界面附近，在深处还有额外离散；主要速度结构相对稳定，而局部界面位置与细尺度细节的不确定性在空间上与较大重建误差重合。

为量化该空间对应关系，本文对 40 个测试模型分别计算逐像素集成标准差与集成均值绝对误差之间的 Spearman 与 Pearson 相关系数。平均系数分别为 0.7063 与 0.6457，在 40 个模型中分别有 36 与 37 个呈正相关。两个均值均显著为正（$p<10^{-16}$，对零的双侧单样本 $t$ 检验），支持采样变异性与局部反演误差在多数测试模型中的关联。

为可视化该关系，本文把每个模型的像素按集成标准差分为十个分位数组（组 1 为最低不确定性、组 10 为最高），并计算每组内集成预测的平均绝对误差。各组像素数近似相等，表达每个模型内的相对不确定性。

图 8 显示在全部四个族中，不确定性更高的组一般具有更大局部误差。单条曲线保留模型特定差异，不必在每个分位数上都上升。该趋势支持用集成离散度识别重建中相对不够准确的区域。

在 40 个模型上，RMSE、MAE 与 SSIM 的模型内平均标准差分别为 40.9 m/s、27.5 m/s 与 0.0266。这些结果表明在所测条件下，主导地质结构恢复对采样随机性的敏感度有限。不同随机种子一般保持主要层与断层图案，而局部界面位置与速度值有所变化。集成离散度提供了经验指标，用以识别局部不稳定性更大、通常重建误差也更大的区域。

### 3.4 分布外模型上的验证

本文用 Marmousi [60]、Overthrust [61] 与 BP2004 Salt [62] 模型考察 PSG 能否重建 OpenFWI 训练分布之外的速度结构。Marmousi 结合了弯曲倾斜层、相交断层与深部细尺度界面；Overthrust 包含逆冲相关层位移与显著速度对比；由 BP2004 派生的 Salt 目标引入陡峭不规则盐边界及与周围介质的强烈速度对比，对从平滑初始模型恢复构成额外挑战。这些结构检验由 OpenFWI 学到的先验能否在不重训练的情况下支持对更复杂目标的反演。

每个源速度模型先用区域插值调整为 $70\times190$ 网格，再线性重缩放到 1500–4500 m/s 以匹配预训练先验的速度范围，并为 OOD 反演建立适当设置。三个模型都通过三个相互重叠的 $70\times70$ 分块使用同一预训练 CurveFault-B EDM。PSG 在 Marmousi 与 Overthrust 上保留其 OpenFWI 采样与优化设置；对 Salt，初步重建促使对求解器超参数与迭代预算（包括 PSG 的）做分阶段评估，选定配置为每个扩散步执行两次物理更新。EDM 保持冻结，且各模型的求解器参数在其初始化与噪声敏感性测试中保持不变。采集与分块适配见附录 B.2 与 B.3，超参数设置见附录 B.4。

#### 3.4.1 分布外速度模型的重建

本文先使用干净观测与 $\sigma_{\mathrm{init}}=20$ 的高斯平滑初始模型，遵循 DLO [44] 中的评估协议。图 9 与图 10 给出真值、初始化与重建速度场。FWI、Tikhonov-FWI、TV-FWI、RED-DiffEq、DiffusionFWI 与 SGDS-FWI 的结果与 PSG 在相同观测与初始模型下一并给出。图 9 中，FWI、Tikhonov-FWI、TV-FWI 与 RED-DiffEq 使用 300 次优化更新（与 OpenFWI 实验相同）。

在 Marmousi 上，PSG 恢复了平滑初始化中缺失的主导弯曲层与断层相关不连续。重建场遵循主要结构趋势，尽管深层薄层与局部速度对比仍未完全解析。在 Overthrust 上，PSG 恢复了错断的层几何与深部宽阔高速区，而局部界面位置与速度振幅仍偏离真值。两者 RMSE 分别为 331.6 与 216.2 m/s，SSIM 分别为 0.745 与 0.825。这些重建表明 OpenFWI 的 PSG 配置可迁移到两个目标，并恢复超出初始平滑背景的大量结构细节。

Salt 重建进一步检验向与层状训练样本不同几何的迁移能力。初始模型包含一个宽阔速度异常，几乎不含真实盐体轮廓。PSG 恢复了主要盐体及其不规则上边界与狭窄几何特征（图 10）。其 MAE、RMSE 与 SSIM 分别为 43.9 m/s、123.1 m/s 与 0.956，表明在该干净数据设置下与目标高度一致。在 Salt 情形选定的求解器参数下，冻结的 CurveFault-B EDM 支持恢复与其训练结构差异显著的盐几何。

#### 3.4.2 对初始化与观测噪声的敏感性

本文接着考察 OOD 重建如何依赖初始模型与观测质量。对初始化敏感性，使用干净数据并把高斯平滑尺度增大到 $\sigma_{\mathrm{init}}\in\{20,24,28,32\}$；对噪声敏感性，固定 $\sigma_{\mathrm{init}}=20$ 并加入 $\sigma\in\{0.1,0.3,0.5\}$ 的高斯观测噪声，保留干净情形作为零噪声参照。

图 11 给出三个模型在上述固定设置下的 PSG 指标；图 12 给出各模型对应的物理重建与真值，覆盖全部七种初始化与噪声条件。

初始化扫描显示 Marmousi 与 Overthrust 的敏感度有限。在 Marmousi 上，所测平滑尺度下 RMSE 从 331.6 降至 299.6 m/s，SSIM 从 0.745 变到 0.761；在 Overthrust 上，RMSE 保持在 215.5 至 217.4 m/s 之间、SSIM 在 0.825 至 0.827 之间。Salt 对初始模型信息损失更敏感：随平滑尺度从 20 增至 32，RMSE 从 123.1 升至 404.7 m/s，SSIM 从 0.956 降至 0.770。图 12 的物理重建显示盐体仍可辨认，但其边界位置与周围速度变得不够准确。

增大观测噪声一般会在三个目标上提高速度误差并降低结构一致性。在 Salt 上，PSG 在 $\sigma=0.1$ 与 $\sigma=0.3$ 时分别保持 0.876 与 0.782 的 SSIM，但最强噪声引入显著的边界与背景扭曲。Marmousi 与 Overthrust 同样随噪声增大而损失重建精度，在 $\sigma=0.5$ 时 SSIM 分别降至 0.552 与 0.582。

综合来看，这些实验证明 PSG 能够重建 OpenFWI 训练分布之外具有复杂不规则几何的速度场。PSG 把对主要结构的准确恢复与对中等观测噪声的鲁棒性、对初始化的有限敏感性结合起来。这些发现支持通过复用冻结扩散先验直接泛化到新的反演场景，凸显物理状态引导采样在不重训练扩散模型的情况下恢复陌生速度结构的能力。

## 4 结论

本文提出物理状态引导扩散采样（PSG）——一个通过持续物理速度状态把预训练扩散先验集成到全波形反演中的框架。通过把波形一致性驱动的物理更新与扩散采样耦合，PSG 容纳灵活的物理初始化，并在梯度计算中把非线性正演算子与去噪器分离。

四个 OpenFWI 族上的终端去噪估计恢复了锐利地质结构，在干净数据与缺道采集下取得最优平均重建指标，并在测量噪声下保持强结构恢复。重复随机运行保留了主导地质结构，图示集成均值保持接近真值场。变异性主要集中于断层与地质界面附近，并在多数测试模型上与局部反演误差正相关。Marmousi、Overthrust 与 BP2004 Salt 上的实验进一步表明，单一 OpenFWI 训练的 EDM 先验可在不重训练的情况下支持对更大、结构更复杂模型的反演。

物理状态引导表述为把学习先验与非线性 PDE 约束结合提供了一般途径。未来工作将聚焦更真实的地质先验与采集设置，并把框架扩展到其他 PDE 支配的反问题。

## 致谢

Zheng Ma 受国家自然科学基金（NSFC）项目 12531016 与北京应用物理与计算数学研究所资助 HX02023-6 支持。作者同时感谢上海数学与交叉学科研究院（SIMIS）的资助。本研究由 SIMIS 在资助号 SIMIS-ID-2025-ST 下资助。作者感谢 SIMIS 提供的资源与设施，它们对本工作的完成至关重要。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 64 条，源文 pp. 30–35）。

[1] Zhen-dong Zhang, Erdinc Saygin, Leiyu He, and Tariq Alkhalifah. Rayleigh wave dispersion spectrum inversion across scales. Surveys in Geophysics, 42(6):1281–1303, 2021.

[2] Malcolm Sambridge and Klaus Mosegaard. Monte carlo methods in geophysical inverse problems. Reviews of Geophysics, 40(3):3–1–3–29, 2002.

[3] Albert Tarantola. Inversion of seismic reflection data in the acoustic approximation. Geophysics, 49(8):1259–1266, 1984.

[4] J. Virieux and S. Operto. An overview of full-waveform inversion in exploration geophysics. Geophysics, 74(6):WCC1–WCC26, 12 2009.

[5] Andreas Fichtner. Full Seismic Waveform Modelling and Inversion. Springer Berlin, 01 2011.

[6] R Gerhard Pratt. Seismic waveform inversion in the frequency domain; part 1, theory and verification in a physical scale model. Geophysics, 64(3):888–901, 1999.

[7] Gang Yao, Nuno V da Silva, Michael Warner, Di Wu, and Chenhao Yang. Tackling cycle skipping in full-waveform inversion with intermediate data. Geophysics, 84(3):R411–R427, 2019.

[8] Zhigang Zhang, Zedong Wu, Zhiyuan Wei, Jiawei Mei, Rongxin Huang, and Ping Wang. FWI imaging: Full-wavefield imaging through full-waveform inversion. In SEG International Exposition and Annual Meeting, page D031S027R004. SEG, 2020.

[9] Odile Gauthier, Jean Virieux, and Albert Tarantola. Two-dimensional nonlinear inversion of seismic waveforms; numerical results. geophysics, 51(7):1387–1403, 1986.

[10] Arnaud Pladys, Romain Brossier, Yubing Li, and Ludovic Métivier. On cycle-skipping and misfit function modification for full-wave inversion: Comparison of five recent approaches. Geophysics, 86(4):R563–R587, 2021.

[11] Ludovic Métivier, Romain Brossier, Quentin Mérigot, Edouard Oudet, and Jean Virieux. Measuring the misfit between seismograms using an optimal transport distance: Application to full waveform inversion. Geophysical Supplements to the Monthly Notices of the Royal Astronomical Society, 205(1):345–377, 2016.

[12] Amir Asnaashari, Romain Brossier, Stéphane Garambois, François Audebert, Pierre Thore, and Jean Virieux. Regularized seismic full waveform inversion with prior model information. Geophysics, 78(2):R25–R36, 2013.

[13] Ernie Esser, Lluis Guasch, Tristan van Leeuwen, Aleksandr Y Aravkin, and Felix J Herrmann. Total variation regularization strategies in full-waveform inversion. SIAM Journal on Imaging Sciences, 11(1):376–406, 2018.

[14] Youzuo Lin and Lianjie Huang. Acoustic- and elastic-waveform inversion using a modified total-variation regularization scheme. Geophysical Journal International, 200(1):489–502, 2014.

[15] HS Aghamiry, A Gholami, and S Operto. Hybrid tikhonov+total-variation regularization for imaging large-contrast media by full-waveform inversion. In SEG International Exposition and Annual Meeting, pages SEG–2018. SEG, 2018.

[16] Carey Bunks, Fatimetou M Saleck, Stephane Zaleski, and Guy Chavent. Multiscale seismic waveform inversion. Geophysics, 60(5):1457–1473, 1995.

[17] Ebru Bozdağ, Jeannot Trampert, and Jeroen Tromp. Misfit functions for full waveform inversion based on instantaneous phase and envelope measurements. Geophysical Journal International, 185(2):845–870, 2011.

[18] Benxin Chi, Liangguo Dong, and Yuzhu Liu. Full waveform inversion method using envelope objective function without low frequency data. Journal of Applied Geophysics, 109:36–46, 2014.

[19] Michael Warner and Lluís Guasch. Adaptive waveform inversion: Theory. Geophysics, 81(6):R429–R445, 2016.

[20] Yunan Yang, Björn Engquist, Junzhe Sun, and Brittany F Hamfeldt. Application of optimal transport and the quadratic wasserstein metric to full-waveform inversion. Geophysics, 83(1):R43–R62, 2018.

[21] Yue Wu and Youzuo Lin. InversionNet: An efficient and accurate data-driven full waveform inversion. IEEE Transactions on Computational Imaging, 6:419–433, 2019.

[22] Zhongping Zhang, Yue Wu, Zheng Zhou, and Youzuo Lin. VelocityGAN: Subsurface velocity image estimation using conditional adversarial networks. In 2019 IEEE Winter Conference on Applications of Computer Vision (WACV), pages 705–714. IEEE, 2019.

[23] Zhongping Zhang and Youzuo Lin. Data-driven seismic waveform inversion: A study on the robustness and generalization. IEEE Transactions on Geoscience and Remote Sensing, 58(10):6900–6913, 2020.

[24] Vladimir Kazei, Oleg Ovcharenko, Pavel Plotnitskii, Daniel Peter, Xiangliang Zhang, and Tariq Alkhalifah. Mapping full seismic waveforms to vertical velocity profiles by deep learning. Geophysics, 86(5):R711–R721, 2021.

[25] George Em Karniadakis, Ioannis G Kevrekidis, Lu Lu, Paris Perdikaris, Sifan Wang, and Liu Yang. Physics-informed machine learning. Nature Reviews Physics, 3(6):422–440, 2021.

[26] Xiong-Bin Yan, Keke Wu, Zhi-Qin John Xu, and Zheng Ma. An unsupervised deep learning approach for the wave equation inverse problem. arXiv preprint arXiv:2311.04531, 2023.

[27] Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, and George Em Karniadakis. Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators. Nature Machine Intelligence, 3(3):218–229, 2021.

[28] Xinquan Huang, Fu Wang, and Tariq Alkhalifah. Physics-informed waveform inversion using pretrained wavefield neural operators. IEEE Transactions on Geoscience and Remote Sensing, 63:1–14, 01 2025.

[29] Yiran Shen, Yangkang Chen, and Björn Engquist. Diffusion-guided optimization for full waveform inversion. arXiv preprint arXiv:2607.21987, 2026.

[30] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851, 2020.

[31] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-Based Generative Modeling Through Stochastic Differential Equations. In International Conference on Learning Representations, 2021.

[32] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising Diffusion Implicit Models. In International Conference on Learning Representations, 2021.

[33] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.

[34] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion Posterior Sampling for General Noisy Inverse Problems. In International Conference on Learning Representations, 2023.

[35] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.

[36] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In International Conference on Learning Representations, volume 2024, pages 28027–28053, 2024.

[37] Zehao Dou and Yang Song. Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In International Conference on Learning Representations, volume 2024, pages 12069–12095, 2024.

[38] Fu Wang, Xinquan Huang, and Tariq A Alkhalifah. A prior regularized full waveform inversion using generative diffusion models. IEEE Transactions on Geoscience and Remote Sensing, 61:1–11, 2023.

[39] Mohammad H Taufik and Tariq Alkhalifah. Wavenumber-aware diffusion sampling to regularize multiparameter elastic full waveform inversion. Geophysical Journal International, 240(2):1215–1233, 2025.

[40] M Taufik and Tariq Alkhalifah. Diffusion model-based posterior sampling in full waveform inversion. In 87th EAGE Annual Conference & Exhibition, volume 2026, pages 1–5. European Association of Geoscientists & Engineers, 2026.

[41] Siming Shan, Min Zhu, Youzuo Lin, and Lu Lu. Regularization by denoising diffusion models for solving inverse PDE problems with application to full waveform inversion. Communications Physics, 9:242, 2026.

[42] Yuke Xie, Hervé Chauris, and Nicolas Desassis. Diffusion prior as a direct regularization term for FWI. arXiv preprint arXiv:2506.10141, 2025.

[43] Chenlin Meng, Yutong He, Yang Song, Jiaming Song, Jiajun Wu, Jun-Yan Zhu, and Stefano Ermon. SDEdit: Guided image synthesis and editing with stochastic differential equations. In International Conference on Learning Representations, 2022.

[44] Chen Min and Zheng Ma. Decoupled latent optimization of diffusion models for full waveform inversion. arXiv preprint arXiv:2606.14139, 2026.

[45] Hengkang Wang, Xu Zhang, Taihui Li, Yuxiang Wan, Tiancong Chen, and Ju Sun. DMPlug: A plug-in method for solving inverse problems with diffusion models. Advances in Neural Information Processing Systems, 37:117881–117916, 2024.

[46] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-Flow: Differentiating through flows for controlled generation. In Ruslan Salakhutdinov, Zico Kolter, Katherine Heller, Adrian Weller, Nuria Oliver, Jonathan Scarlett, and Felix Berkenkamp, editors, Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 3462–3483. PMLR, 21–27 Jul 2024.

[47] Jishen Peng, Enze Jiang, Zheng Ma, and Xiongbin Yan. Robust physics-guided diffusion for full-waveform inversion. arXiv preprint arXiv:2603.16393, 2026.

[48] Albert Tarantola. Inverse Problem Theory and Methods for Model Parameter Estimation. Society for Industrial and Applied Mathematics, 2005.

[49] Masoumeh Dashti and Andrew M. Stuart. The bayesian approach to inverse problems. In Handbook of Uncertainty Quantification, pages 311–428. Springer, 2017.

[50] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.

[51] Giannis Daras, Hyungjin Chung, Chieh-Hsin Lai, Yuki Mitsufuji, Jong Chul Ye, Peyman Milanfar, Alexandros G Dimakis, and Mauricio Delbracio. A survey on diffusion models for inverse problems. arXiv preprint arXiv:2410.00083, 2024.

[52] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In 2023 IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops (CVPRW), pages 1219–1229. IEEE, 2023.

[53] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. In 2025 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 20895–20905. IEEE, 2025.

[54] Hongkai Zheng, Wenda Chu, Bingliang Zhang, Zihui Wu, Austin Wang, Berthy Feng, Caifeng Zou, Yu Sun, Nikola Borislavov Kovachki, Zachary E Ross, Katherine Bouman, and Yisong Yue. InverseBench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In The Thirteenth International Conference on Learning Representations, 2025.

[55] Maxime Vono, Nicolas Dobigeon, and Pierre Chainais. Split-and-augmented Gibbs sampler—application to large-scale inference problems. IEEE Transactions on Signal Processing, 67(6):1648–1661, 2019.

[56] David M Blei, Alp Kucukelbir, and Jon D McAuliffe. Variational inference: A review for statisticians. Journal of the American Statistical Association, 112(518):859–877, 2017.

[57] Chengyuan Deng, Shihang Feng, Hanchen Wang, Xitong Zhang, Peng Jin, Yinan Feng, Qili Zeng, Yinpeng Chen, and Youzuo Lin. OpenFWI: Large-scale multi-structural benchmark datasets for full waveform inversion. Advances in Neural Information Processing Systems, 35:6007–6020, 2022.

[58] Zhou Wang, A.C. Bovik, H.R. Sheikh, and E.P. Simoncelli. Image quality assessment: from error visibility to structural similarity. IEEE Transactions on Image Processing, 13(4):600–612, 2004.

[59] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. Advances in Neural Information Processing Systems, 35:26565–26577, 2022.

[60] Roelof Versteeg. The Marmousi experience: Velocity model determination on a synthetic complex data set. The Leading Edge, 13(9):927–936, 1994.

[61] F Aminzadeh, J Brac, and T Kunz. 3-D salt and overthrust models, SEG/EAGE 3-D model. ser. 1. Society of Exploration Geophysicists, Tulsa, OK, 1997.

[62] FJ Billette and Sverre Brandsberg-Dahl. The 2004 BP velocity benchmark. In 67th EAGE Conference & Exhibition, pages cp–1. European Association of Geoscientists & Engineers, 2005.

[63] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat GANs on image synthesis. Advances in Neural Information Processing Systems, 34:8780–8794, 2021.

[64] Diederik P. Kingma and Jimmy Ba. Adam: A Method for Stochastic Optimization. In International Conference on Learning Representations, 2015.

## 附录 A：扩散模型预备知识

回顾第 2.3 节定义的含噪族 $\mathbf x_t=a_t\mathbf x_0+b_t\boldsymbol\epsilon$，其中 $\mathbf x_0\sim p_0$、$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$、$a_t=\sqrt{\bar\alpha_t}$、$b_t=\sqrt{1-\bar\alpha_t}$。令 $\varphi_b$ 表示 $\mathcal N(\mathbf 0,b^{2}\mathbf I)$ 的密度，则 $\mathbf x_t$ 的密度由卷积给出：

$$
p_t=\left[a_t^{-d}p_0(\cdot/a_t)\right]\ast\varphi_{b_t}.\tag{44}
$$

沿用 Karras 等 [59, 附录 B.5.1] 的频域推导，可得变换后密度及其时间导数：

$$
\widehat p_t(\boldsymbol\xi)=\widehat p_0(a_t\boldsymbol\xi)\exp\left(-\frac{b_t^{2}}{2}\lVert\boldsymbol\xi\rVert^{2}\right),\qquad
\partial_t\widehat p_t(\boldsymbol\xi)=\frac{\dot a_t}{a_t}\boldsymbol\xi\cdot\nabla_{\boldsymbol\xi}\widehat p_t(\boldsymbol\xi)-\left(b_t\dot b_t-\frac{\dot a_t}{a_t}b_t^{2}\right)\lVert\boldsymbol\xi\rVert^{2}\widehat p_t(\boldsymbol\xi).\tag{45}
$$

变换回 $\mathbf x$ 即把密度演化表示为污染系数：

$$
\partial_t p_t(\mathbf x)=-\frac{\dot a_t}{a_t}\nabla_{\mathbf x}\cdot\left(\mathbf x p_t(\mathbf x)\right)+\left(b_t\dot b_t-\frac{\dot a_t}{a_t}b_t^{2}\right)\Delta_{\mathbf x}p_t(\mathbf x)
=-\frac{\dot{\bar\alpha}_t}{2\bar\alpha_t}\left[\nabla_{\mathbf x}\cdot\left(\mathbf x p_t(\mathbf x)\right)+\Delta_{\mathbf x}p_t(\mathbf x)\right].\tag{46}
$$

第二个等式由 $a_t^{2}+b_t^{2}=1$ 得到，后者给出 $b_t\dot b_t-(\dot a_t/a_t)b_t^{2}=-\dot a_t/a_t$。散度项计入信号尺度的变化，因此 VP 密度在原始 $\mathbf x$ 坐标中满足一个漂移—扩散方程。

为构造具有这些边缘分布的過程，考虑反向时间 SDE $\mathrm d\mathbf x_t=\mathbf f(\mathbf x_t,t)\,\mathrm dt+g(t)\,\mathrm d\bar{\mathbf w}_t$，其中 $t:T\to0$。此处 $\mathrm dt<0$，Brownian 增量的协方差为 $|\mathrm dt|\mathbf I$。因此其密度 $\rho_t$ 在递减的 $t$ 坐标下满足 Fokker–Planck 方程 [31]：

$$
\partial_t\rho_t(\mathbf x)=-\nabla_{\mathbf x}\cdot\left(\mathbf f(\mathbf x,t)\rho_t(\mathbf x)\right)-\frac{g(t)^{2}}{2}\Delta_{\mathbf x}\rho_t(\mathbf x).\tag{47}
$$

为恢复式 (46)，选取漂移

$$
\mathbf f(\mathbf x,t)=\frac{\dot a_t}{a_t}\mathbf x+\left(\frac{\dot a_t}{a_t}-\frac{g(t)^{2}}{2}\right)\nabla_{\mathbf x}\log p_t(\mathbf x).\tag{48}
$$

代入 $\rho_t=p_t$ 并利用 $\nabla_{\mathbf x}\cdot(p_t\nabla_{\mathbf x}\log p_t)=\Delta_{\mathbf x}p_t$ 即恢复指定密度演化。因此，对容许的 $g(t)\ge0$ 与终端密度 $p_T$，反向过程具有边缘 $p_t$。取 $g(t)=0$ 给出**概率流 ODE**

$$
\frac{\mathrm d\mathbf x_t}{\mathrm dt}=\frac{\dot a_t}{a_t}\left[\mathbf x_t+\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\right].\tag{49}
$$

从 $T$ 到 0 积分该 ODE 把 $p_T$ 输运回 $p_0$。在合适的时间与状态参数化下，该流构成 DDIM [31]、[32]、[59] 等确定性采样器的基础。

EDM 使用的**方差爆炸（VE）**参数化取 $\mathbf z_\sigma=\mathbf x_0+\sigma\boldsymbol\epsilon$，密度 $q_\sigma=p_0\ast\mathcal N(\mathbf 0,\sigma^{2}\mathbf I)$ [59]。信号尺度保持固定，而噪声方差增大。在固定 VP 水平 $\bar\alpha_t$ 下，其与 VE 族的关系为

$$
\sigma^{2}=\frac{1-\bar\alpha_t}{\bar\alpha_t},\qquad
\mathbf z_\sigma=\frac{\mathbf x_t}{a_t},\qquad
\mathbb E[\mathbf x_0\mid\mathbf x_t]=\mathbb E[\mathbf x_0\mid\mathbf z_\sigma].\tag{50}
$$

条件均值一致，因为在固定 $t$ 下该缩放可逆。因此可通过重缩放其输入并提供匹配的噪声水平，把 EDM 去噪器用于 VP 采样。采样所需的分数可通过去噪学习。在 $\sigma>0$ 的 VE 坐标下，对高斯卷积求导给出 Tweedie 公式 [50]、[59]：

$$
\nabla_{\mathbf z}\log q_\sigma(\mathbf z)=\frac{\int(\mathbf x_0-\mathbf z)p_0(\mathbf x_0)\varphi_\sigma(\mathbf z-\mathbf x_0)\,\mathrm d\mathbf x_0}{\sigma^{2}q_\sigma(\mathbf z)}.\tag{51}
$$

在固定噪声水平 $\sigma$ 下，考虑连续形式的去噪目标 [59, 附录 B.3]：

$$
L[D;\sigma]=\mathbb E_{\mathbf x_0,\boldsymbol\epsilon}\left[\left\lVert D(\mathbf x_0+\sigma\boldsymbol\epsilon,\sigma)-\mathbf x_0\right\rVert^{2}\right]
=\int q_\sigma(\mathbf z)\mathbb E\left[\left\lVert D(\mathbf z,\sigma)-\mathbf x_0\right\rVert^{2}\mid\mathbf z_\sigma=\mathbf z\right]\mathrm d\mathbf z
$$
$$
=\iint p_0(\mathbf x_0)\varphi_\sigma(\mathbf z-\mathbf x_0)\left\lVert D(\mathbf z,\sigma)-\mathbf x_0\right\rVert^{2}\mathrm d\mathbf x_0\,\mathrm d\mathbf z.\tag{52}
$$

在每个 $\mathbf z$ 处独立变分 $D$ 给出驻点条件

$$
0=\left.\frac{\delta L[D;\sigma]}{\delta D(\mathbf z,\sigma)}\right|_{D=D^{\star}}=2\int p_0(\mathbf x_0)\varphi_\sigma(\mathbf z-\mathbf x_0)\left(D^{\star}(\mathbf z,\sigma)-\mathbf x_0\right)\mathrm d\mathbf x_0.\tag{53}
$$

由于 $q_\sigma(\mathbf z)>0$，逐点二次型严格凸，其唯一极小元为

$$
D^{\star}(\mathbf z,\sigma)=\frac{\int\mathbf x_0p_0(\mathbf x_0)\varphi_\sigma(\mathbf z-\mathbf x_0)\,\mathrm d\mathbf x_0}{\int p_0(\mathbf x_0)\varphi_\sigma(\mathbf z-\mathbf x_0)\,\mathrm d\mathbf x_0}=\mathbb E[\mathbf x_0\mid\mathbf z_\sigma=\mathbf z].\tag{54}
$$

因此最优去噪器提供了式 (51) 所需的未知条件均值，给出分数 $(D^{\star}(\mathbf z,\sigma)-\mathbf z)/\sigma^{2}$；其在式 (19) 中的 VP 对应物由式 (50) 得到。实践中，神经去噪器最小化 $\mathbb E_{\sigma\sim\nu}[\lambda(\sigma)L[D_\theta;\sigma]]$，其中 $\nu$ 采样正噪声水平、$\lambda(\sigma)>0$。

这些关系解释了扩散采样的基本机制：含噪族规定密度演化，匹配其 Fokker–Planck 方程即得到由分数驱动的反向 SDE 与 ODE。训练数据集的有限样本并不直接提供密度 $p_0$，而是允许用经验平均逼近关于 $p_0$ 的积分。使用分数的神经近似，扩散模型在离散时间网格上数值求解反向 SDE 或概率流 ODE，把初始高斯噪声变换为数据分布的近似样本。

## 附录 B：实现细节

本附录说明先验预训练、声学求解器、方法实现协议、超参数与计算代价。

### B.1 扩散模型预训练

本文为每个 OpenFWI 族 [57]、[59] 独立训练一个无条件 EDM 模型，FlatVel-B 与 CurveVel-B 使用 24,000 个速度场，FlatFault-B 与 CurveFault-B 使用 48,000 个。每个族有独立的 6000 场监控划分，其中包含反演测试文件，但被排除在梯度训练之外。速度按 $\mathbf x=(\mathbf v-3000)/1500$ 归一化。

**网络结构。** 去噪器为 Dhariwal U-Net [63]，一输入一输出通道，通道宽度 $(64,128,192,256)$，每层两个残差块，并在分辨率 36、18、9 处设注意力。参数量约 2540 万。原生 $70\times70$ 场通过边界复制填充到 $72\times72$，去噪后再裁剪回去。

**训练设置。** 噪声水平分布、损失加权与预条件遵循官方 EDM 实现 [59]。使用 Adam [64]，学习率 $10^{-4}$、批大小 32，训练 400,000 次更新，前 500 步预热并使用 FP16 混合精度。最终 EMA 权重直接使用，未按监控损失做选择。图 13 给出 CurveFault-B 上记录的训练与验证损失。约 $3\times10^{5}$ 次优化步后，损失在缓慢下降的平台附近振荡。此类波动是随机 EDM 去噪目标的典型现象——每个小批量都会重新采样噪声水平与高斯扰动，因此经验损失即使在收敛附近仍保留采样变异性。

**算法调用的 VP 调度。** 扩散逆求解器基线与 PSG 在 DDPM 框架 [30] 内使用 VP 噪声坐标。算法 2 给出 RED-DiffEq 与 DiffusionFWI 所用的离散线性 DDPM 调度。EDM 去噪器以输入 $\mathbf x_t/\sqrt{\bar\alpha_t}$ 与噪声水平 $\sigma_t$ 调用，见式 (50)。方法特定的调度与离散化见附录 B.4。

**算法 2　DDPM 框架下的线性 $\beta$ 调度**

```text
Require: 层数 T = 1000; 初始方差 β_1 = 1e-4; 最终方差 β_T = 2e-2
1: ᾱ_0 ← 1
2: for t = 1 to T do
3:     β_t ← β_1 + ((t−1)/(T−1))(β_T − β_1)
4:     α_t ← 1 − β_t
5:     ᾱ_t ← α_t ᾱ_{t−1}
6:     σ_t ← sqrt((1−ᾱ_t)/ᾱ_t)
7: end for
8: return {β_t, α_t, ᾱ_t, σ_t}_{t=1}^T
```

DPS 与 PSG 使用采样实现中的连续 VP 调度 [31]、[54]，其速率与边缘系数为

$$
\beta(t)=\beta_{\min}+t\left(\beta_{\max}-\beta_{\min}\right)=0.1+19.9t,\quad 0\le t\le1,
$$
$$
\bar\alpha_t=\exp\left(-\int_0^{t}\beta(s)\,\mathrm ds\right)=\exp\left(-0.1t-9.95t^{2}\right),\qquad
\sigma_t=\sqrt{\bar\alpha_t^{-1}-1},
$$

其中 $\beta_{\min}=0.1$、$\beta_{\max}=20$，$\sigma_t$ 为传给 EDM 去噪器的相对噪声水平。1000 个分数评估时刻在 1 到 $10^{-3}$ 之间均匀分布；最后一次更新结束于 $\sigma_t=0.01$ 对应的时刻。连续速率 $\beta(t)$ 通过 $\beta(t_n)(t_n-t_{n-1})$ 确定 Euler–Maruyama 系数。对式 (41) 的祖先表示，离散方差改为 $\beta_{t_n}=1-\bar\alpha_{t_n}/\bar\alpha_{t_{n-1}}$。

### B.2 声波方程正演求解器

实验正演求解器使用四阶空间有限差分与二阶时间推进积分二维常密度声波方程。Ricker 子波激发震源。本文保留基准求解器的数值边界处理，使用带二次阻尼的海绵层以减少人工反射。震源在水平方向近似均匀分布，检波器位于每个水平网格点；二者都置于固定浅深度。OpenFWI 与 OOD 目标共享数值格式与采集设置，只是对更宽的模型增大水平范围与检波器数量。速度梯度由离散伴随计算，它把波形残差导数沿时间推进格式反向传播并与正演波场结合 [3]、[4]。表 4 汇总该配置。

**表 4：正演求解器配置。** OOD 目标包括 Marmousi、Overthrust 与 Salt。所有模型共享数值格式、震源子波与边界处理；更宽目标增大水平网格数与检波器数。网格覆盖为深度×宽度。

| 参数 | 符号 | OpenFWI | OOD 目标 | 单位 |
|---|---|---|---|---|
| 水平网格点数 | $m_x$ | 70 | 190 | — |
| 垂直网格点数 | $m_z$ | 70 | 70 | — |
| 网格间距 | $\Delta x,\Delta z$ | 10.0 | 10.0 | m |
| 时间采样数 | $N_t$ | 1000 | 1000 | — |
| 时间步长 | $\Delta t$ | 0.001 | 0.001 | s |
| 记录时长 | $T$ | 1.0 | 1.0 | s |
| 震源频率（Ricker） | $f$ | 15.0 | 15.0 | Hz |
| 震源数 | $N_s$ | 5 | 5 | — |
| 检波器数 | $N_r$ | 70 | 190 | — |
| 震源深度 | $z_s$ | 10 | 10 | m |
| 检波器深度 | $z_r$ | 10 | 10 | m |
| 边界处理 | — | 海绵层（二次阻尼） | — | — |
| 吸收层厚度 | $n_b$ | 120 | 120 | 网格点 |
| 网格覆盖 | — | $700\times700$ | $700\times1900$ | m² |
| 地震数据形状 | $(N_s,N_t,N_r)$ | $(5,1000,70)$ | $(5,1000,190)$ | — |

### B.3 方法实现协议

所有方法使用相同声学算子与观测波形，速度坐标按附录 B.1 归一化。下文 $\mathbf x$ 表示归一化速度场，$L_{\mathbf y}(\mathbf x)$ 表示换算到物理单位后评估的波形损失。扩散类方法共享每个族的预训练 EDM；VP 去噪器调用使用式 (50) 的换算。

**FWI。** 无正则化 FWI 通过伴随波形梯度迭代更新速度以最小化 $L_{\mathbf y}(\mathbf x)$ [3]、[4]，仅用地震观测约束重建。

**Tikhonov-FWI。** Tikhonov-FWI 在波形损失上加一阶正则项，惩罚相邻速度差的平方 [12]：

$$
\Phi_{\mathrm{Tik}}(\mathbf x)=\frac{1}{m}\sum_{i,j}\left[(x_{i+1,j}-x_{i,j})^{2}+(x_{i,j+1}-x_{i,j})^{2}\right],\tag{55}
$$

其中 $m=m_xm_z$ 为网格点数，差分只在有效邻居间取。该二次罚抑制空间振荡，但会平滑锐利界面与细尺度结构。

**TV-FWI。** TV-FWI 使用各向异性全变差罚 [13]：

$$
\Phi_{\mathrm{TV}}(\mathbf x)=\frac{1}{m}\sum_{i,j}\left[\left|x_{i+1,j}-x_{i,j}\right|+\left|x_{i,j+1}-x_{i,j}\right|\right],\tag{56}
$$

它偏好分片常值速度并保持锐利对比，但在真实速度平滑变化处可能引入阶梯图案。

**DPS。** 直接 DPS 通过在去噪速度处评估波形损失并对波求解器与去噪器同时求导，把反向扩散轨迹以地震观测为条件 [34]。算法流程在第 2.4 节详述；本文实现使用残差归一化引导的随机 VP 提议，并报告最终去噪速度。

**RED-DiffEq。** RED-DiffEq 用预测噪声与注入扩散噪声之间的残差增广波形梯度，从而把学习先验用作随机正则项。对均匀采样的扩散水平 $t$ 与 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$，其梯度下降形式为

$$
\mathbf x_t^{(k)}=\sqrt{\bar\alpha_t}\,\mathbf x^{(k)}+\sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon,\qquad
\mathbf x^{(k+1)}=\mathbf x^{(k)}-\eta_k\left[\nabla_{\mathbf x}L_{\mathbf y}(\mathbf x^{(k)})+\frac{\lambda}{m}\left(\widehat{\boldsymbol\epsilon}_\theta(\mathbf x_t^{(k)},t)-\boldsymbol\epsilon\right)\right].\tag{57}
$$

这里 $m=m_xm_z$ 计入逐像素均值归约，$\widehat{\boldsymbol\epsilon}_\theta(\mathbf x_t,t)=(\mathbf x_t-\sqrt{\bar\alpha_t}D_\theta(\mathbf x_t,t))/\sqrt{1-\bar\alpha_t}$ 为由共享去噪器得到的噪声预测。实现按 Shan 等 [41] 的算法 1 对该方向应用 Adam，在正则项中把预测噪声视为固定，从而不评估去噪器 Jacobian。

**DiffusionFWI。** DiffusionFWI 把波形拟合优化嵌入反向扩散，在 DDPM 先验更新与一块物理速度更新之间交替 [38]。遵循官方实现协议，本文把正演建模适配到自己的声学求解器，同时保留从中间扩散水平开始的嵌套优化，以平滑速度为初始化，并在每个水平使用新的 Adam 优化器。

**SGDS-FWI。** Split Gibbs Diffusion Sampling for FWI 在似然驱动的物理精化与鼓励地质结构的扩散去噪之间交替 [29]。遵循作者发布的工作流，本文先用 FWI–TV 与 SDEdit 精化初始速度，然后交替热启动 FWI 块、衰减的探索噪声与一步 Tweedie 去噪，使用共享 EDM 与声学求解器。

**PSG。** PSG 对物理状态使用持续 Adam，对反向 VP SDE 使用 Euler–Maruyama 先验提议 [31]、[54]。遵循 DPS [34]，反馈对去噪预测与更新后物理速度之差的欧氏范数求导，并保持后者固定。这按残差逆幅度缩放平方残差梯度，平方残差下限取 $10^{-20}$ 以避免除零。每次物理 Adam 更新后，逐点把归一化速度裁剪到 $[-1,1]$（对应 1500–4500 m/s），同时保留优化器状态；越界值设为最近端点。终端去噪估计在换算到物理单位前也被裁剪到这些界内。在固定正扩散时刻，Euler 与祖先先验提议在步长一阶意义下一致，而有限步均值与方差不同 [30]、[31]。

**OOD 反演的域分解。** 为把预训练先验应用于更大的 OOD 场，本文采用 RED-DiffEq [41] 的域分解策略，在重叠子域上评估先验而无需重训练。对 $70\times190$ 的 OOD 场，共享 CurveFault-B 先验作用于三个 $70\times70$ 分块，列范围为 $[0,70)$、$[60,130)$ 与 $[120,190)$。预测在每个 10 列重叠区以等权平均。SGDS-FWI 在每次完整 SDEdit 或 Tweedie 调用前保持独立的分块状态与噪声抽取，之后折叠为完整场。其他基于学习的方法在其各自更新内使用相同分块位置与重叠平均。OOD 比较包括三种经典方法、RED-DiffEq、DiffusionFWI、SGDS-FWI 与 PSG。

### B.4 超参数设置

对 PSG 与基线方法，本文按 RED-DiffEq 仓库 [41] 使用平均 $\ell_1$ 波形损失；DPS 与 SGDS-FWI 按其官方实现使用平方残差 [34]、[29]。超参数在四个 OpenFWI 族与全部观测条件下固定。经典方法与 RED-DiffEq 使用 300 次 Adam 更新，学习率 0.03、余弦衰减。正则权重按 RED-DiffEq [41] 的经验设置取：Tikhonov-FWI 与 TV-FWI 为 0.01，RED-DiffEq 为 0.75。空间罚使用方向边缘平均，TV 采用平滑绝对值；RED-DiffEq 不加额外时间加权。

遵循官方协议 [38]，DiffusionFWI 在完整 $T=1000$ 的 DDPM 调度上从 $t=100$ 开始反向扩散，相邻去噪步之间做 10 次物理 Adam 更新，学习率 0.01、速度模糊尺度 0.2 网格单元、梯度裁剪系数 1。它与 RED-DiffEq 共享算法 2 中的线性调度。SGDS-FWI 使用 300 次 FWI–TV 种子更新，随后五个块、每块 150 次更新（恒定学习率 0.03），sigmoid 扩散调度从水平 250 开始，探索尺度 0.3 [29]。

DPS 与 PSG 使用附录 B.1 指定的连续 VP 调度与 1000 个随机步，归一化引导权重分别为 0.01 与 0.3 [34]、[54]。PSG 每个扩散步执行一次物理 Adam 更新（恒定学习率 0.03），逐像素均方速度残差的耦合权重为 0.5。每步计算代价在附录 B.5 分析。

**Salt 专用调整。** OOD 反演通过 RED-DiffEq [41] 的域分解策略复用 CurveFault-B EDM。不规则的 Salt 几何促使对先验权重、物理更新预算与稳定化设置做目标特定调整。表 5 中的学习方法参数通过在 Salt 上使用干净目标 SSIM 选定，随后在其初始化与噪声条件下固定；PSG 每个扩散步使用两次物理更新。经典方法保留 OpenFWI 学习率与正则权重，更新 1000 次。

**表 5：扩散类方法在 Salt 上的选定设置。** 未列出的参数保留附录 B.4 中相应的 OpenFWI 设置。

| 方法 | 选定配置 |
|---|---|
| RED-DiffEq | 1000 次更新；学习率 0.1、余弦衰减；正则 0.75；sigmoid beta 调度；无时间加权。 |
| DiffusionFWI | 100 个扩散水平，每个 25 次 FWI 更新；学习率 0.03；水平/垂直梯度平滑 0.5/1.0；速度模糊 0.4；禁用梯度归一化；裁剪系数 1。 |
| SGDS-FWI | 300 次种子 FWI 更新、五个各 1000 次更新的块、100 次终端更新；后段块与终端 TV 权重 100（以物理速度单位做均值空间归约）；Tweedie 前向噪声尺度 0.5；终端学习率 0.01。 |
| PSG | 1000 个扩散步；反馈 0.8；耦合 0.1；每步两次物理更新；物理学习率 0.03、余弦衰减。 |

### B.5 计算代价

PSG 每个反向步执行一次物理更新与一次去噪器评估，并复用去噪预测用于物理正则化与扩散引导。表 6 报告 CurveFault-B 测试模型的每步运行时间分解，去噪器计算用 FP16、波传播用 FP64。所有阶段均以 GPU 同步计时，不包括诊断指标与日志。在同一模型与设备上，一次 PSG 步的代价约为一次标准 FWI 迭代的 164%、以及一次基于扩散的求解器 RED-DiffEq 迭代的 121%。物理正演与反向操作占 PSG 运行时的 61.8%。观测到的峰值 GPU 显存占用（含缓存分配）约为 PSG 4.40 GiB、FWI 4.03 GiB。

与 DPS 一样，PSG 沿完整 1000 步反向扩散轨迹执行条件采样。FWI 与 RED-DiffEq 则使用 300 次优化迭代，在所采用的学习率调度下后期重建质量变化很小。其迭代次数约为 PSG 的三分之一（30%）。计入该步数差异，在此配置下 PSG 的总核心迭代时间约为 FWI 的 547%、RED-DiffEq 的 405%。考虑到 PSG 在实验中取得的速度恢复改善与地质结构保持，本文认为该额外计算代价可以接受。把 PSG 适配到反向步数更少的扩散采样方案，并评估能否以更低代价保留这些反演收益，是进一步研究的自然方向。

**表 6：PSG 在 $70\times70$ OpenFWI 速度模型（5 个震源）上的每步运行时间分解**，在单块 NVIDIA GeForce RTX 5090 上测量，对预热后 1000 个反向步取平均；± 表示一个样本标准差；不包括诊断指标与日志。

| 操作 | 时间 (s) | 占比 |
|---|---|---|
| EDM 去噪器前向 | 0.0362 ± 0.0049 | 25.3% |
| 正演 PDE 求解器与损失 | 0.0305 ± 0.0007 | 21.3% |
| 物理反向与 Adam 更新 | 0.0579 ± 0.0011 | 40.5% |
| 去噪器反向与引导 | 0.0178 ± 0.0023 | 12.4% |
| 反向扩散更新 | 0.0007 ± 0.0003 | 0.5% |
| 每 PSG 步总计 | 0.1431 ± 0.0064 | 100% |

## 图注与表注

**图 1：正演建模与全波形反演。** (a) 一个 CurveFault-B 速度模型，含五个震源（星形）与检波器（三角形），并给出正演映射与反问题：声波方程把速度映射为地震道，而贝叶斯 FWI 结合观测似然与速度先验形成后验。(b) 相应炮集，震源 A—E 按列排列、观测条件按行排列：干净数据、加性高斯噪声与缺失检波器道。

**图 2：物理状态引导扩散采样（PSG）概览。** 上：反向采样过程中物理速度 $\mathbf v_{t_n}$ 与扩散状态 $\mathbf x_{t_n}$ 的演化。下：单次反向步，包含正则化物理更新与引导扩散更新；物理支路用正演算子与伴随状态法计算 $\mathcal F(\mathbf v_{t_n})$ 与残差 $\mathbf y$，经 Adam 更新物理状态；扩散支路用冻结的预训练去噪器给出 $\widehat{\mathbf x}_0$，再经扩散步与关于 $\mathbf x_{t_n}$ 的线性引导更新。

**图 3：数据集样本与生成样本对比。** 左：OpenFWI 测试集速度模型（FlatVel-B、FlatFault-B、CurveVel-B、CurveFault-B）；右：对应预训练 EDM 模型的无条件样本。

**图 4：OpenFWI 干净数据定性比较。** 行分别为 FV-B、FF-B、CV-B 与 CF-B 的测试样本；列依次为真值、平滑初始模型以及八种方法的重建。所有面板共用以 m/s 为单位的速度色标。

**图 5：OpenFWI 含噪数据结果（高斯噪声）。** CF-B 在三个噪声水平（$\sigma=0.1,0.3,0.5$）下的单样本重建。从左到右：含噪炮集、真值速度模型与各比较方法的重建。

**图 6：OpenFWI 缺道结果。** CF-B 在移除 70 条检波器道中的 10、35、60 条时的单样本重建。从左到右：掩膜炮集、真值速度模型与各比较方法的重建。

**图 7：PSG 对随机采样轨迹的敏感性。** 行分别为 FV-B、FF-B、CV-B 与 CF-B 的测试样本；列依次为真值、20 次运行去噪输出的集成均值、逐像素集成标准差与集成均值的绝对误差。所有色标单位为 m/s；真值与均值共用速度色标，标准差与误差使用各自面板色标。

**图 8：不同不确定性分位下的局部重建误差。** 在每个测试模型内按集成标准差对像素分组；灰线为单个模型各组中集成均值的平均绝对误差（m/s），彩线为每个族十个模型上这些误差的中位数，阴影覆盖跨模型的第 25—75 百分位。更高分位表示更大不确定性；不同族的纵轴刻度不同。

**图 9：Marmousi 与 Overthrust 干净数据结果。** $\sigma_{\mathrm{init}}=20$ 下的真值、平滑初始化与各比较方法的重建。

**图 10：BP2004 Salt 干净数据结果。** $\sigma_{\mathrm{init}}=20$ 下的真值、平滑初始化与各比较方法的重建。

**图 11：PSG 在分布外模型上的敏感性。** 上：干净数据下 MAE、RMSE 与 SSIM 随初始化平滑度的变化；下：$\sigma_{\mathrm{init}}=20$ 下随高斯观测噪声的变化。每个点代表一次重建；零噪声值复用干净参照结果。

**图 12：OOD 初始化与噪声变化下的 PSG 重建。** 列为 Marmousi、Overthrust 与 BP2004 Salt；真值下方各行给干净数据下四个初始化平滑水平，以及 $\sigma_{\mathrm{init}}=20$ 下三个高斯噪声水平。所有面板共用同一速度色标。

**图 13：CurveFault-B 上的 EDM 预训练损失。** 加权去噪训练与验证损失随优化步的变化。其余三个预训练模型的训练与验证曲线在定性上相似。

**表注：** 表 1 为干净数据下 OpenFWI 四族的 MAE/RMSE/SSIM；表 2 为高斯噪声三水平下的结果（按族分块）；表 3 为缺道三水平下的结果（按族分块）；表 4 为正演求解器配置；表 5 为扩散类方法在 Salt 上的选定设置；表 6 为 PSG 每步运行时间分解。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.12899v1（cs.LG，2026-09-11）的全文中文译稿，按原文结构译出：摘要与关键词；第 1 节引言；第 2 节方法（2.1 FWI、2.2 贝叶斯表述、2.3 扩散生成模型作为数据先验、2.4 扩散后验采样、2.5 PSG，式 (1)—(41)、算法 1）；第 3 节数值实验（3.1 评估指标、3.2 OpenFWI 验证与 3.2.1—3.2.3 三个采集条件、3.3 随机轨迹敏感性与集成不确定性、3.4 OOD 验证与 3.4.1—3.4.2，式 (42)—(43)）；第 4 节结论；致谢；附录 A（式 (44)—(54)）；附录 B（B.1 预训练与算法 2、B.2 声学求解器、B.3 实现协议与式 (55)—(57)、B.4 超参数、B.5 计算代价）；64 条英文参考文献；图 1—图 13 图注与表 1—表 6 表注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言开头）→ 第 2—3 页（引言续与贡献）→ 第 4 页（第 2 节与 2.1、式 (1)—(4)）→ 第 5 页（图 1）→ 第 6—7 页（2.2、式 (5)—(9)、2.3 开头）→ 第 8 页（式 (10)—(19)）→ 第 9 页（2.4、式 (20)—(25)、三项困难）→ 第 10 页（2.5 开头、式 (26)—(29)）→ 第 11—12 页（式 (30)—(38)）→ 第 13 页（式 (39)—(41)）→ 第 14 页（图 2、算法 1）→ 第 15 页（3 节、3.1、式 (42)—(43)）→ 第 16—17 页（3.2、图 3）→ 第 18 页（图 4、表 1）→ 第 19 页（3.2.2、图 5）→ 第 20 页（表 2）→ 第 21 页（3.2.3、图 6）→ 第 22 页（表 3）→ 第 23—25 页（3.3、图 7—图 8）→ 第 25—29 页（3.4、图 9—图 12）→ 第 30 页（第 4 节、致谢、参考文献开头）→ 第 30—35 页（参考文献 [1]—[64]）→ 第 36—37 页（附录 A、式 (44)—(54)）→ 第 37—39 页（附录 B.1、算法 2、图 13）→ 第 39—40 页（B.2、表 4）→ 第 40—42 页（B.3、式 (55)—(57)、B.4、表 5）→ 第 43 页（B.5、表 6）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 1—表 6 的全部数值已按 PDF 文本层与第 20、22 页渲染图交叉核对（表 2、表 3 逐格核对；表 1、表 4—表 6 按文本层转录），未改变任何数值。原文各表以粗体标示各指标最优均值，本页在表题中说明而未逐格复刻粗体。
2. 图 1—图 13 均未上传图片；本页在"图注与表注"小节统一给出 13 条中文图注与 6 条表注，正文按"正文图 N/表 N"引用。
3. 公式覆盖原文编号式 (1)—(57)，全部保留原编号；算法 1—2 按原文逐步译出。
4. **原文疑点／说明：** ①原文 2.5 节中式 (30) 与式 (39) 的推导均**精确成立**（原文明确说明），译文照录其等价链；②式 (35) 的 Jensen 上界与式 (38) 的 KL 差距、以及"紧桥极限不等于算法收敛到 DPS"的限定按原文照录；③原文摘要与 2.5 节均强调 PSG 的耦合轨迹"未被证明精确采样增广后验"，译文保留该限定；④原文表 2/表 3 中个别数值在文本层被连写（如"225.4347.80.745"），已按渲染图拆分为 225.4 / 347.8 / 0.745；⑤原文附录 B.1 脚注 1 指向 EDM 官方仓库链接，译文照录。
5. 原文为 arXiv 预印本（cs.LG），43 页；页面目录日期 2026-09-18 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-11）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
