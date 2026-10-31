---
layout: page
title: "面向不可观测图像结构扩散恢复的连续后验融合｜中文全文译文"
permalink: /papers/translations/2026-10-31-2610-03261-consecutive-posterior-fusion-for-diffusive-recovery-of-unobservable-im/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/34ffbb5befb01a12/) · [原文 arXiv](https://arxiv.org/abs/2610.03261) · [全部目录](/papers/catalog/)

# 面向不可观测图像结构扩散恢复的连续后验融合

> **许可与登记说明：** 原文为 arXiv 预印本，**许可为 CC0**（公共领域贡献），可登记为本站「可公开全文」译稿。本页为中文全文译稿，供学习与研究使用；如原文版本更新，以 arXiv 最新版为准。

**原题：** Consecutive Posterior Fusion for Diffusive Recovery of Unobservable Image Structures  
**作者：** Elena Morotti、Davide Evangelista、Elena Loli Piccolomini（意大利博洛尼亚大学计算机科学与工程系）  
**版本：** arXiv:2610.03261（预印本，页面标注 October 5, 2026），21 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1—6 节、参考文献（英文原条目 35 条）、表 1—表 2、图 1—图 7 图注；逐句逐式终校未做。

## 摘要

求解严重病态的成像逆问题，需要恢复**测量无法观测或仅弱约束**的图像结构。扩散模型为推断这类缺失信息提供了表达力强的学习先验，而后验采样在反向过程中引入**测量一致性**。然而，标准扩散后验采样器依赖**瞬时**的测量感知估计，**未显式利用先前**后验修正所携带的信息。

本文提出**连续后验融合去噪扩散零空间模型（CPF-DDNM）**——一种**推断时**策略，融合**连续**的测量感知估计以改善不可观测图像结构的扩散恢复，且**无需重新训练、也无需额外去噪器评估**。本文把该原理在 DDNM 中实例化：DDNM 的**值域/零空间分解**表明，连续融合**保持**由测量决定的成分，而**仅作用**于先验驱动的零空间估计。据此本文给出 CPF-DDNM 的**几何解释**与**局部误差分析**，刻画最优的时变融合系数，包括**外推**情形。

在稀疏视角与模拟低剂量计算机断层成像（CT）以及医学图像超分辨率上的实验表明，CPF-DDNM 相对 DDNM 有一致改进，并与基于扩散的逆问题求解器具有竞争力。

**关键词：** 扩散模型；医学图像重建；逆问题；零空间方法；后验融合。

## 1 引言

成像逆问题旨在由通过物理采集过程与之关联的间接测量恢复未知图像。在许多实际成像场景中，这些测量可能不完整、欠采样或受噪声影响，使重建问题严重病态 [2]；例如 CT、磁共振成像（MRI）、图像修补与超分辨率。此时采集过程可能无法唯一确定图像：欠采样留下**从数据不可观测**的成分，而测量噪声进一步增加沿前向算子弱可观测方向的不确定性。因此重建质量**关键取决于**用于推断缺失或弱约束信息的先验。

考虑无噪线性成像模型 $\mathbf y=\mathbf K\mathbf x$，其中 $\mathbf K$ 为成像系统的前向算子、$\mathbf y$ 为采集数据、$\mathbf x$ 为待重建图像。只要 $\mathbf K$ 具有非平凡零空间 $\operatorname{Ker}(\mathbf K)$ 且 $\mathbf y\in\operatorname{Range}(\mathbf K)$，数据一致解集为仿射空间

$$
\mathbf x=\mathbf K^{\dagger}\mathbf y+\mathbf z,\qquad\mathbf z\in\operatorname{Ker}(\mathbf K),\tag{1}
$$

其中 $\mathbf K^{\dagger}$ 为前向算子的伪逆，$\mathbf K^{\dagger}\mathbf y$ 是由测量确定的最小范数解，$\mathbf z$ 对采集算子**不可见**。改变 $\mathbf z$ 即可得到无穷多个数据一致重建。存在噪声时，这种模糊性依然存在，并叠加沿弱可观测方向的不确定性。

经典变分方法通过**手工正则项**（促进稀疏、光滑或结构一致性）解决该模糊性 [6]、[11]、[12]；深度学习则直接从数据学习图像统计。在医学重建中，学习成分被用作**后处理算子** [13]、[23]、嵌入**展开优化**方案 [10]、[20]，或与显式基于模型的过程结合 [24]。近年来，**扩散生成模型**已成为逆问题的表达力强的学习先验。

在众多用扩散模型驱动图像重建的方法中，本文聚焦**扩散后验采样**方法：它们通常把预训练生成先验与贯穿反向轨迹的**测量感知修正**结合，从而在保持与观测数据兼容的解中选择合理者。具体做法是：用测量感知项调整扩散模型在时刻 $t$ 得到的**干净图像预测** $\widehat{\mathbf x}_{0|t}$，产生修正 $\mathbf D_t$，再以之替换原 $\widehat{\mathbf x}_{0|t}$ 插入反向扩散过程。

该类的代表性方法是**去噪扩散零空间模型（DDNM）**[27]，因为它把测量决定的信息与先验推断的信息**显式分离**，其修正定义为

$$
\mathbf D_t=\mathbf K^{\dagger}\mathbf y+\left(\mathbf I-\mathbf K^{\dagger}\mathbf K\right)\widehat{\mathbf x}_{0|t},\tag{2}
$$

其中 $\mathbf K^{\dagger}\mathbf y$ 是由测量确定的成分，$(\mathbf I-\mathbf K^{\dagger}\mathbf K)\widehat{\mathbf x}_{0|t}$ 是由学习先验推断的**零空间补全**。该结构对严重欠采样的医学成像问题（如稀疏视角 CT 与高倍超分辨率）尤为相关，因为其解强烈依赖不可观测图像成分的恢复。然而，经典扩散后验采样方法的局限在于：尤其在早期时间步（噪声主导反向过程）时，修正项 $\mathbf D_t$ **波动大**，有时使过程发散到分布外解。在本文近期提出的**滞后多步后验（LAMP）**方法 [8] 中，作者已表明连续的测量感知估计**高度相关**，因而可结合以降低方差、稳定重建轨迹。LAMP 给出了基于底层微分方程多步近似的通用机制，但**未研究**连续后验修正如何与底层逆问题的**特定结构**相互作用。

本文在 DDNM 框架内回答该问题：其显式值域/零空间分解使我们能识别连续后验的使用**作用在何处**。为此定义

$$
\widetilde{\mathbf D}_t:=\mathbf D_t+\beta_t\left(\mathbf D_{t+\Delta t}-\mathbf D_t\right),\tag{3}
$$

其中 $\mathbf D_{t+\Delta t}$ 是前一反向迭代产生的修正，$\beta_t$ 为**时变融合系数**。本文把这一通用修正策略称为**连续后验融合（CPF）**，其在 DDNM 上的应用记为 **CPF-DDNM**。下文将表明：连续的 DDNM 修正 $\mathbf D_{t+\Delta t}$ 与 $\mathbf D_t$ **共享同一**由测量确定的成分 $\mathbf{K}^{\dagger}\mathbf y$，因此 (3) 的融合修正**保持**由测量确定的成分、**只修改**先验驱动的不可观测成分恢复。

DDNM 的值域/零空间结构还为融合机制给出直接的**几何解释**，并允许专门从零空间恢复角度分析融合系数的作用，包括**插值**（$0<\beta_t<1$）与**外推**（$\beta_t>1$）两种选择。特别地，本文研究时变系数，使其可越过连接连续零空间估计的线段，同时**不改变测量决定的成分**。

本文主要贡献如下：

- 把连续后验融合**特化到 DDNM 的值域/零空间分解**，证明融合保持由测量决定的成分、仅修改先验推断的补全；
- 研究**外推情形**，将其解释为零空间内的**过松弛**，并推导**局部最优性条件**，说明外推系数何时能最小化期望补全误差；
- 引入 $\{\beta_t\}_{t\in[0,T]}$ 的**时变调度**，并在模拟稀疏视角 CT、低剂量 CT 与医学图像超分辨率上评估 CPF-DDNM。CPF-DDNM 在全部实验中均优于原始 DDNM 基线，且**无需重训**扩散先验、**不增加**去噪器评估；相对其他先进扩散逆问题求解器亦表现相当或更优。

**结构安排。** 第 2 节回顾基于扩散的成像逆问题方法；第 3 节介绍 CPF-DDNM 及其几何解释与理论分析；第 4 节描述实验协议；第 5 节给出并讨论结果；第 6 节总结主要发现并展望未来工作。

## 2 相关工作

扩散模型已被广泛用作成像逆问题的学习先验，现有方法的差异主要在**如何把测量信息纳入反向过程**。DDRM [16] 通过线性退化算子的谱分解推导后验更新；DPS [5] 引入近似似然梯度，可处理含噪与非线性逆问题；DDNM [27] 通过显式值域/零空间分解强制测量一致性；DiffPIR [35] 把预训练扩散去噪器嵌入**即插即用半二次分裂**方案。尽管数据一致性实现方式不同，这些方法都沿反向轨迹产生**一系列测量感知估计**。

为加速生成或改善扩散轨迹稳定性，近期若干工作研究了反向扩散动力学的**多步离散化** [18]、[21]、[33]，利用多个扩散步的信息构造生成轨迹的高阶近似。相比之下，扩散后验采样器中**连续测量感知估计之间的时间关系**仍较少被研究。

该方向的近期一步是 **LAMP** [8]：它引入由后验动力学二阶离散化导出的**滞后时间修正**，给出连续测量感知估计含有被标准后验更新丢弃的有用信息的初步证据。其表述**与骨干方法无关**，并在 DiffPIR、DDRM 上以连续估计的线性组合得到验证。然而，由于二阶离散化表述，它总是得到系数 $\beta_t\in[0,1]$ 的**凸组合**。CPF-DDNM 则聚焦**外推**情形：连续估计在零空间内定义**过松弛方向**。因此二者利用同一时间信息来源，但处于不同区间、服务不同目的。

扩散模型在医学图像重建中也日益受关注，为高度病态采集问题提供灵活的学习先验 [17]、[29]，应用包括稀疏视角与低剂量 CT、加速 MRI、PET 重建与多模态成像。在 CT 中，已有面向稀疏视角重建与伪影抑制的扩散方法，包括把采集模型直接纳入生成过程的方法 [30]、[32]；加速 MRI 与联合 PET–MRI 重建也有相应后验采样策略 [1]、[31]。多数工作聚焦模态特定的条件机制、数据一致性算子或后验采样规则；CPF-DDNM 与它们**互补**：它修改既有 DDNM 求解器**如何使用连续测量感知估计**，而无需重训或改变先验。

## 3 方法

本节提出面向基于扩散的医学图像重建的后验融合策略。CPF-DDNM 建立在 DDNM 的零空间表述之上，用两个**连续**后验估计的融合替换当前反向迭代所计算的后验估计。

### 3.1 用于图像生成的扩散模型

扩散模型是基于深度学习的图像生成最有效范式之一。在后验采样语境下，本文关注**去噪扩散隐式模型（DDIM）**[25]，其采样表述为本文考虑的重建方法提供基础；下面简要回顾其生成机制以建立全文记号。

令 $\mathbf x_0$ 为干净图像分布 $p_0(\mathbf x)$ 的样本。给定满足 $\alpha_t^{2}+\sigma_t^{2}=1$ 的两个序列 $\{\alpha_t\}_{t=1}^{T}$ 与 $\{\sigma_t\}_{t=1}^{T}$（分别称**信号率**与**噪声率**调度），定义随机过程

$$
\mathbf x_t=\alpha_t\mathbf x_0+\sigma_t\boldsymbol\epsilon_t,\qquad\boldsymbol\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I).\tag{4}
$$

当 $\alpha_T\approx0$ 时，终端变量近似服从标准高斯，即 $\mathbf x_T\sim\mathcal N(\mathbf 0,\mathbf I)$。神经网络去噪器 $\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t)$ 通过最小化下式训练，以从含噪样本 $\mathbf x_t$ 预测噪声分量 $\boldsymbol\epsilon_t$：

$$
\mathcal L(\boldsymbol\Theta)=\mathbb E_{\mathbf x_0\sim p_0,\ t\sim\mathcal U[0,T],\ \boldsymbol\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I)}\left[\left\lVert\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t)-\boldsymbol\epsilon_t\right\rVert_2^{2}\right].\tag{5}
$$

训练完成后，去噪器可通过逆 (4) 的过程从 $p_0(\mathbf x)$ 逐步生成样本。特别地，干净样本可由 **Tweedie 估计**近似：

$$
\widehat{\mathbf x}_{0|t}:=\frac{\mathbf x_t-\sigma_t\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t)}{\alpha_t},\tag{6}
$$

它由从 (4) 中解出 $\mathbf x_0$、并把未知噪声 $\boldsymbol\epsilon_t$ 替换为神经网络估计得到。$\widehat{\mathbf x}_{0|t}$ 因此表示基于时刻 $t$ 可用信息的 ${\mathbf x}_0$ 估计；随反向过程从 $T$ 推进到 0，该估计通常越来越精细、连贯。

由 (6)，DDIM 按下式在下一反向时刻引入噪声（对应更低噪声水平 $\sigma_{t-\Delta t}$）：

$$
\mathbf x_{t-\Delta t}=\alpha_{t-\Delta t}\widehat{\mathbf x}_{0|t}+\sigma_{t-\Delta t}\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t),\tag{7}
$$

其中 $\Delta t$ 为反向过程的时间步长。从 $\mathbf x_T\sim\mathcal N(\mathbf 0,\mathbf I)$ 出发重复应用 (6)、(7) 直到 $\mathbf x_0$，DDIM 即从 $p_0(\mathbf x)$ 生成新样本。参数 $\Delta t>0$ 决定去噪迭代次数：从 $\mathbf x_T$ 生成 $\mathbf x_0$ 需 $N=T/\Delta t$ 个反向步；步数越多通常计算成本越高，但提供更精细的反向轨迹离散化、可能得到更准确的生成样本。

### 3.2 扩散后验采样器

3.1 节的生成过程可产生高质量样本，但**不直接控制生成哪张图像**；求解逆问题要求生成图像与观测测量保持兼容。扩散后验采样器在每个反向时刻、计算出干净估计 $\widehat{\mathbf x}_{0|t}$ 之后立即引入**测量感知修正**，从而逐步把反向轨迹导向与测量一致，而扩散先验则通过估计 (1) 中不可观测成分 $\mathbf z\in\operatorname{Ker}(\mathbf K)$ 来补足信息。

考虑在代表待处理图像的数据集上**无监督**训练的预训练扩散模型 $\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t)$。给定初始迭代 $\mathbf x_T\sim\mathcal N(\mathbf 0,\mathbf I)$，每步按 (6) 计算干净估计 $\widehat{\mathbf x}_{0|t}$，随后引入测量感知修正算子 $\mathbf C(\widehat{\mathbf x}_{0|t},t,\mathbf K,\mathbf y)$（其形式取决于所选后验采样方法），把修正后图像记为 $\mathbf D_t:=\mathbf C(\widehat{\mathbf x}_{0|t},t,\mathbf K,\mathbf y)$。用 $\mathbf D_t$ 替换 (7) 中的 $\widehat{\mathbf x}_{0|t}$，得到**扩散后验采样更新**：

$$
\mathbf x_{t-\Delta t}=\alpha_{t-\Delta t}\mathbf D_t+\sigma_{t-\Delta t}\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t),\tag{8}
$$

通过它，扩散轨迹逐步以采集测量为条件；迭代 (8) 直到 $t=\Delta t$ 即得最终重建 $\mathbf x_0$。

多种后验采样器都可在该测量修正框架下理解，$\mathbf C(\cdot)$ 的选择决定具体方法；不同方法在**何时**引入修正上也不同。对 DDNM [27]，其修正即 (2)。把到 $\mathbf K$ 核上的投影算子记为 $\mathbf P_{\mathrm{Ker}}:=\mathbf I-\mathbf K^{\dagger}\mathbf K$ [6]，则 DDNM 修正为

$$
\mathbf D_t=\mathbf K^{\dagger}\mathbf y+\mathbf P_{\mathrm{Ker}}\widehat{\mathbf x}_{0|t}.\tag{9}
$$

在无噪设置下，该式对 $\widehat{\mathbf x}_{0|t}$ 的修正给出清晰几何解释：DDNM **只保留**估计的零空间分量 $\mathbf P_{\mathrm{Ker}}\widehat{\mathbf x}_{0|t}$，而把 $\widehat{\mathbf x}_{0|t}$ 的值域分量替换为由测量确定的项 $\mathbf K^{\dagger}\mathbf y$。当 $\mathbf K^{\dagger}$ 为精确 Moore–Penrose 伪逆且测量属于 $\mathbf K$ 的值域时，该构造在每个修正估计处强制**精确数据一致性**。此外，这种显式分离使扩散模型的作用**尤为透明**：学习先验只影响无法直接从测量恢复的图像成分。

然而，把同一修正直接用于含噪测量可能**放大**重建噪声：在病态问题中，伪逆会强烈放大与小奇异值相关的测量分量，$\mathbf K^{\dagger}\mathbf y$ 可能变得不稳定。

### 3.3 CPF-DDNM 方法

(8) 的反向扩散过程虽产生同一未知图像的一系列强相关估计，标准 DDNM 却**仅用当前时刻**的去噪估计构造修正，前一反向迭代的估计被丢弃——尽管它给出同一不可观测图像成分的**密切相关预测**。受此启发，本文把**两个连续反向迭代**所得的 DDNM 修正结合，即 (3) 的融合修正，其中 $\beta_t\in\mathbb R$ 控制前一修正的贡献。展开两个 DDNM 项可写成

$$
\widetilde{\mathbf D}_t=\mathbf K^{\dagger}\mathbf y+\mathbf P_{\mathrm{Ker}}\left(\widehat{\mathbf x}_{0|t}+\beta_t\left(\widehat{\mathbf x}_{0|t+\Delta t}-\widehat{\mathbf x}_{0|t}\right)\right),\tag{10}
$$

其中 $\mathbf P_{\mathrm{Ker}}:=\mathbf I-\mathbf K^{\dagger}\mathbf K$。把标准 DDNM 修正 $\mathbf D_t$ 替换为其融合对应物 $\widetilde{\mathbf D}_t$，即得所提反向步：

$$
\mathbf x_{t-\Delta t}=\alpha_{t-\Delta t}\widetilde{\mathbf D}_t+\sigma_{t-\Delta t}\boldsymbol\epsilon_{\boldsymbol\theta}(\mathbf x_t,t).\tag{11}
$$

这一 DDNM 扩展（即 **CPF-DDNM**）只需**存储前一反向迭代的修正**；它不引入额外去噪器评估，也无需修改或重训预训练扩散模型。

(10) 还表明 CPF-DDNM **保留**原 DDNM 修正的值域/零空间结构。为显式说明，令

$$
\mathbf z_t:=\mathbf P_{\mathrm{Ker}}\widehat{\mathbf x}_{0|t}\tag{12}
$$

表示反向时刻 $t$ 预测的零空间补全，则标准 DDNM 修正可写为 $\mathbf D_t=\mathbf K^{\dagger}\mathbf y+\mathbf z_t$；前一反向迭代的修正为 $\mathbf D_{t+\Delta t}=\mathbf K^{\dagger}\mathbf y+\mathbf z_{t+\Delta t}$，而 CPF-DDNM 修正具有分解

$$
\widetilde{\mathbf D}_t=\mathbf K^{\dagger}\mathbf y+\widetilde{\mathbf z}_t,\qquad\widetilde{\mathbf z}_t:=\mathbf z_t+\beta_t\left(\mathbf z_{t+\Delta t}-\mathbf z_t\right).\tag{13}
$$

因此测量决定成分 $\mathbf K^{\dagger}\mathbf y$ **保持不变**，融合**只作用于**先验驱动的零空间补全。下述命题形式化该性质并给出相应数据一致性结果。

**命题 1（零空间保持与数据一致性）。** 假设 $\mathbf K^{\dagger}$ 为 $\mathbf K$ 的 Moore–Penrose 伪逆，故 $\mathbf P_{\mathrm{Ker}}=\mathbf I-\mathbf K^{\dagger}\mathbf K$ 是到 $\operatorname{Ker}(\mathbf K)$ 的正交投影。则对任意 $\beta_t\in\mathbb R$，CPF-DDNM 修正满足

$$
\widetilde{\mathbf D}_t=\mathbf K^{\dagger}\mathbf y+\widetilde{\mathbf z}_t,\qquad\widetilde{\mathbf z}_t\in\operatorname{Ker}(\mathbf K),\tag{14}
$$

从而

$$
\mathbf K\widetilde{\mathbf D}_t=\mathbf K\mathbf K^{\dagger}\mathbf y.\tag{15}
$$

若 $\mathbf y\in\operatorname{Range}(\mathbf K)$，则 $\mathbf K\widetilde{\mathbf D}_t=\mathbf y$，融合修正是**精确数据一致**的。

**证明。** 把 $\mathbf D_t=\mathbf K^{\dagger}\mathbf y+\mathbf z_t$、$\mathbf D_{t+\Delta t}=\mathbf K^{\dagger}\mathbf y+\mathbf z_{t+\Delta t}$ 代入 (3) 得

$$
\widetilde{\mathbf D}_t=\mathbf K^{\dagger}\mathbf y+\mathbf z_t+\beta_t\left(\mathbf z_{t+\Delta t}-\mathbf z_t\right)=\mathbf K^{\dagger}\mathbf y+\widetilde{\mathbf z}_t.\tag{16}
$$

由 $\mathbf z_t,\mathbf z_{t+\Delta t}\in\operatorname{Ker}(\mathbf K)$ 且 $\operatorname{Ker}(\mathbf K)$ 为线性子空间，其仿射组合 $\widetilde{\mathbf z}_t$ 仍属于 $\operatorname{Ker}(\mathbf K)$，故 $\mathbf K\widetilde{\mathbf z}_t=\mathbf 0$、$\mathbf K\widetilde{\mathbf D}_t=\mathbf K\mathbf K^{\dagger}\mathbf y$。当 $\mathbf y\in\operatorname{Range}(\mathbf K)$ 时，由 Moore–Penrose 恒等式 $\mathbf K\mathbf K^{\dagger}\mathbf y=\mathbf y$ 得精确数据一致性。$\square$

命题 1 假设可访问精确 Moore–Penrose 伪逆。在本文的 CT 实验中，所需伪逆运算由**有限次 CGLS 迭代**近似，故相应零空间投影与数据一致性只在数值误差范围内成立。


### 3.4 关于融合参数的洞见

现在可在零空间内几何地解释 $\beta_t$ 的作用。定义两个连续零空间估计之间的**位移**：

$$
\mathbf d_t:=\mathbf z_{t+\Delta t}-\mathbf z_t.\tag{17}
$$

用该记号，(13) 变为

$$
\widetilde{\mathbf z}_t=\mathbf z_t+\beta_t\mathbf d_t.\tag{18}
$$

因此对 $(\mathbf z_t,\mathbf z_{t+\Delta t})$ 确定了零空间内的**局部方向** $\mathbf d_t$，而 $\beta_t$ 确定融合估计在穿过这两个估计的**仿射线**上的位置。由于测量决定成分 $\mathbf K^{\dagger}\mathbf y$ 不变，该位移**只影响**不由测量决定的成分。

对 $0\le\beta_t\le1$，融合估计位于连接 $\mathbf z_t$ 与 $\mathbf z_{t+\Delta t}$ 的线段上，故为**插值**：$\beta_t=0$ 恢复当前估计 $\mathbf z_t$，$\beta_t=1$ 选取前一反向迭代的 $\mathbf z_{t+\Delta t}$。当 $\beta_t>1$，融合估计沿 $\mathbf d_t$ 方向越过 $\mathbf z_{t+\Delta t}$，更新成为**外推**。此时 (18) 可等价写为

$$
\widetilde{\mathbf z}_t=\mathbf z_{t+\Delta t}+\mathbf m_t,\tag{19}
$$

其中

$$
\mathbf m_t:=(\beta_t-1)\mathbf d_t=(\beta_t-1)\left(\mathbf z_{t+\Delta t}-\mathbf z_t\right).\tag{20}
$$

$\mathbf m_t$ 表示越过 $\mathbf z_{t+\Delta t}$ 的附加位移，可解释为**仅在 $\operatorname{Ker}(\mathbf K)$ 内作用的过松弛项**；它也具有**类动量**的代数形式——沿两个连续后验估计之差所识别的方向延伸。图 1 给出该外推情形的几何解释。

**局部误差模型。** 上述几何描述说明融合估计随 $\beta_t$ 如何移动，其潜在优势可通过**局部不确定性模型**分析。令 $\mathbf z^{*}$ 表示与未知图像关联的理想零空间分量，把两个连续估计表示为

$$
\mathbf z_t=\mathbf z^{*}+\boldsymbol\eta_t,\qquad\mathbf z_{t+\Delta t}=\mathbf z^{*}+\boldsymbol\eta_{t+\Delta t},\tag{21}
$$

其中 $\boldsymbol\eta_t,\boldsymbol\eta_{t+\Delta t}$ 为相应先验驱动估计的误差；在 CT 实验中，这些项还可能包含伪逆数值近似引入的扰动。把 (21) 代入 (13) 得

$$
\widetilde{\mathbf z}_t-\mathbf z^{*}=(1-\beta_t)\boldsymbol\eta_t+\beta_t\boldsymbol\eta_{t+\Delta t}.\tag{22}
$$

因此 CPF-DDNM 可理解为**结合同一未知零空间分量的两个相关估计**：融合估计的误差本身是两个连续后验估计误差的线性组合，提示适当选择 $\beta_t$ 可降低期望重建误差。

对固定反向时刻 $t$，形式化该观察：定义

$$
J_t(\beta):=\mathbb E\left[\left\lVert(1-\beta)\boldsymbol\eta_t+\beta\boldsymbol\eta_{t+\Delta t}\right\rVert_2^{2}\right],\tag{23}
$$

期望对所考虑时刻产生重建误差的随机性取。令

$$
A_t:=\mathbb E\left[\left\lVert\boldsymbol\eta_t\right\rVert_2^{2}\right],\qquad B_t:=\mathbb E\left[\left\lVert\boldsymbol\eta_{t+\Delta t}\right\rVert_2^{2}\right],\qquad C_t:=\mathbb E\left[\langle\boldsymbol\eta_t,\boldsymbol\eta_{t+\Delta t}\rangle\right].\tag{24}
$$

下述结果刻画局部模型下最小化期望误差的融合系数。

**命题 2（最优融合系数）。** 假设连续零空间估计满足 (21)。若 $A_t+B_t-2C_t>0$，则 $J_t(\beta)$ 严格凸，且存在唯一极小点

$$
\beta_t^{*}=\frac{A_t-C_t}{A_t+B_t-2C_t}.\tag{25}
$$

**证明。** 展开 (23) 得

$$
J_t(\beta)=(1-\beta)^{2}A_t+\beta^{2}B_t+2\beta(1-\beta)C_t.\tag{26}
$$

对 $\beta$ 求导得

$$
\frac{\partial J_t}{\partial\beta}=2\left(C_t-A_t\right)+2\beta\left(A_t+B_t-2C_t\right).\tag{27}
$$

令导数为零即得 (25)；此外

$$
\frac{\partial^{2}J_t}{\partial\beta^{2}}=2\left(A_t+B_t-2C_t\right)>0,\tag{28}
$$

这证明 $\beta_t^{*}$ 是唯一极小点。$\square$

命题 2 表明最优融合系数同时取决于**连续估计的误差幅度**与**它们的相关性**，因此其取值**不限于**插值区间 $[0,1]$。特别地，在命题 2 条件下

$$
\beta_t^{*}>1\ \Longleftrightarrow\ C_t>B_t,\tag{29}
$$

说明当**当前与前一误差的互相关**相对前一估计的误差能量足够大时，**外推**更新可最小化期望误差。该结果为图 1 的几何解释提供了统计对应，且无需引入单独模型。

**融合系数调度。** 统计量 $A_t,B_t,C_t$ 依赖未知重建误差，**推断时不可用**；故本文不直接计算 (25)，而以**任务相关的调度**参数化 $\beta_t$：

$$
\beta_t=c_1+c_2\sqrt{1-\frac{t}{T}},\tag{30}
$$

其中 $c_1,c_2$ 控制融合强度沿反向轨迹的演化。特别地，

$$
\beta_T=c_1,\qquad\beta_0=c_1+c_2.\tag{31}
$$

因此不同 $c_1,c_2$ 可使融合强度在采样中增或减、在反向过程接近干净图像区间时消失，或在整个轨迹（包括外推区间）保持活跃。本文考虑的调度及其对重建性能的影响见第 5.2 节。

## 4 实验设置

本节描述所提方法的实现细节及后续给出结果的医学成像应用。全部实验用 Python 3.12.12、PyTorch v2.7.1、MONAI v1.5.1 与 ASTRA Toolbox v2.4.1 实现；训练与推断在 24 GB 显存的 NVIDIA A4000 GPU 上完成。除另有说明，全部实验使用随机种子 42。源代码、配置文件、预训练检查点与患者级数据划分将公开。

### 4.1 数据集与预处理

所用数据集为 **Mayo Clinic 数据集** [22]，含 11 位患者的 3631 幅 $512\times512$ 人胸图像；本文将其下采样到 $256\times256$ 并归一化到 $[0,1]$。具体地，取 10 位患者的 3305 幅用于训练，剩余 1 位患者的 326 幅用于测试。图 2 给出测试集代表性 CT 图像，选取以展示不同解剖区域与结构特征；第二行对应的放大区域突出软组织边界、肺部结构与骨界面等精细解剖细节。留出测试集图像在训练中完全未使用。


### 4.2 扩散模型与训练

全部实验的扩散先验取自 [7]，其在 Mayo Clinic 图像上**从头训练**：采用 MONAI Generative Models 框架 [3] 提供的二维 `DiffusionModelUNet` 架构，输入一批灰度 $256\times256$ 图像，经四级 UNet（特征通道 64、128、256、512）处理，每个分辨率级含两个残差块；按惯例仅在两个最深分辨率级使用自注意力（空间维更小、长程依赖可在更低计算成本下建模），注意力层每头 32 通道。网络接收含噪图像 $\mathbf x_t$ 及经正弦嵌入的扩散时刻 $t$，预测 (5) 中单通道噪声估计 $\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t)$。

训练使用离散 DDPM 前向过程，$T=1000$ 个扩散步，线性方差调度 $\beta_1=10^{-4}$、$\beta_T=2\times10^{-2}$。每次训练迭代采样干净图像 $\mathbf x_0$ 与均匀取自 1000 个扩散步的时刻 $t$；施加前向扩散前，将原归一化到 $[0,1]$ 的强度线性映射到 $[-1,1]$；随后按该时刻噪声水平生成高斯噪声 $\boldsymbol\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I)$ 并加到干净图像上，把所得含噪图像送入 U-Net，通过最小化均方误差训练其恢复注入噪声：

$$
\mathcal L_{\mathrm{DDPM}}(\boldsymbol\Theta)=\mathbb E_{\mathbf x_0,t,\boldsymbol\epsilon_t}\left[\left\lVert\boldsymbol\epsilon_{\boldsymbol\Theta}(\mathbf x_t,t)-\boldsymbol\epsilon_t\right\rVert_2^{2}\right],\tag{32}
$$

与 (5) 的噪声预测目标一致。模型参数用 Adam、学习率 $10^{-4}$、批大小 16 优化，共 100 轮。

### 4.3 医学应用与成像任务

本文在两个医学成像逆问题上评估 CPF-DDNM：**CT 重建**与**单图像超分辨率**。CT 考虑**稀疏视角**与**低剂量**两种采集设置。尽管退化方式不同，这些问题都含**不可观测或仅弱约束**的图像成分，因此需要先验信息才能获得合理重建。

#### 4.3.1 CT 图像重建

CT 由不同视角的投影测量重建横断面图像。本文考虑二维平行束几何：每个投影角定义一族穿过物体的平行 X 射线路径，探测器记录相应线积分测量；角度范围内全部投影构成**正弦图**。

令 $\mathbf x\in\mathbb R^{M^{2}}$ 表示真值图像、$\mathbf K$ 为离散平行束投影算子，对每幅图像按

$$
\mathbf y=\mathbf K\mathbf x+\delta\left\lVert\mathbf K\mathbf x\right\rVert_{\infty}\mathbf e,\qquad\mathbf e\sim\mathcal N(\mathbf 0,\mathbf I)\tag{33}
$$

生成模拟测量，其中 $\delta$ 控制相对噪声水平；$\mathbf K$ 与 $\mathbf K^{\top}$ 均以 ASTRA Toolbox [26] 实现。对 $M\times M$ 图像、$N_{\theta}$ 个投影角与 $N_{d}$ 个探测器单元，对应离散化矩阵规模为 $N_{\theta}N_{d}\times M^{2}$；本文全部 CT 实验取 $M=256$、$N_{d}=512$。

**稀疏视角 CT。** 此时采集测量数少于未知像素数：本文所有几何均有 $N_{\theta}N_{d}<M^{2}$，故系统欠定、$\mathbf K$ 必有非平凡零空间；投影角越少，可用信息进一步减少，未分辨图像子空间通常越大。本文测试三种采集几何 $G_{60},G_{45},G_{30}$，分别对应在 $[0,180^{\circ})$ 上均匀分布的 $N_{\theta}\in\{60,45,30\}$ 个投影角；稀疏视角实验相对噪声水平均为 $\delta=0.01$。

**低剂量 CT。** 平行束几何固定为 $N_{\theta}=180$（$[0,180^{\circ})$ 均匀分布），使测量数量与空间安排在实验中保持不变。真实低剂量 CT 中光子数减少会提高测量不确定性、降低投影数据信噪比；本文用 (33) 的**加性对数后高斯噪声模型**近似该效应，取相对噪声水平 $\delta\in\{0.1,0.3,0.5\}$。该模型应理解为对经对数预处理后 CT 测量所受量子与电子噪声的**简化近似**，而非光子计数采集过程的完整物理仿真。此设置下系统矩阵行数虽多于列数，但标称测量数 $N_{\theta}N_{d}$ **高估**了重建可用的有效信息，因为不与图像支撑相交的射线对应探测器 bin 产生零测量。对边长 $M$ 的方图，支撑在角度 $\theta$ 处的投影宽度约为 $M(|\cos\theta|+|\sin\theta|)$，故对均匀投影角，有效非零测量数可近似为

$$
m_{\mathrm{eff}}\approx M\sum_{k=0}^{N_{\theta}-1}\left(|\cos\theta_{k}|+|\sin\theta_{k}|\right)\approx\frac{4}{\pi}MN_{\theta}.\tag{34}
$$

该结果的完整证明见 [14]。由于 $\operatorname{rank}(\mathbf K)\le m_{\mathrm{eff}}$，条件 $m_{\mathrm{eff}}<M^{2}$ 足以推出 $\operatorname{rank}(\mathbf K)<M^{2}$，从而 $\operatorname{Ker}(\mathbf K)\ne\{\mathbf 0\}$；用 (34) 的近似，该条件化为相应不等式。本文实验取 $M=256$、$N_{\theta}=180$，而 $\frac{\pi}{4}M\approx201.1$；按该基于支撑的维数估计，低剂量实验的离散投影算子预期具有**非平凡核**。除这一精确零空间成分外，所加测量噪声还沿 CT 算子病态且弱可观测方向引入显著不确定性。

#### 4.3.2 医学图像超分辨率

单图像超分辨率旨在从空间下采样观测重建高分辨率图像。本文设置中，每个低分辨率像素由高分辨率像素的**非重叠块**平均得到；该操作删除精细解剖信息（小结构、锐利组织边界），仅凭观测图像无法唯一恢复。

采集模型写作 $\mathbf y=\mathbf K\mathbf x+\mathbf e$，其中 $\mathbf x\in\mathbb R^{M^{2}}$ 为未知高分辨率图像、$\mathbf K$ 为块平均下采样算子、$\mathbf e$ 为 (33) 所定义的加性测量噪声。考虑无噪与轻度含噪两种设置，$\delta\in\{0,0.01\}$。对整数倍率 $s>1$，观测图像含 $(M/s)^{2}$ 像素，前向算子相应为块平均；由于 $(M/s)^{2}<M^{2}$，逆问题必然欠定、$\mathbf K$ 有非平凡零空间，更精确地

$$
\dim\operatorname{Ker}(\mathbf K)=M^{2}-\operatorname{rank}(\mathbf K)\ge M^{2}-\left(\frac{M}{s}\right)^{2}.\tag{35}
$$

因此多幅高分辨率图像可产生同一低分辨率观测，被下采样删除的精细成分必须借助先验推断；这种零空间模糊使超分辨率成为 DDNM 与 CPF-DDNM 的自然应用。全部超分辨率实验取倍率 $s=4$。

### 4.4 伪逆计算与算法实现

所提方法需要应用 (10) 中的伪逆 $\mathbf K^{\dagger}$，其计算方式取决于前向算子结构，这一区别对本文考虑的问题很重要。

**超分辨率**的退化算子为逐块平均下采样，其 SVD 有**闭式**（每个低分辨率像素对应非重叠高分辨率块的平均），故伪逆可精确计算（应用相应逐块 SVD），从而以精确 $\mathbf K^{\dagger}$ 实现 DDNM 修正。

**CT** 中 $\mathbf K$ 把图像映射为正弦图；在本文图像尺寸下，$\mathbf K$ 的矩阵表示过大，无法显式构造与分解，因此不能经显式 SVD 计算 Moore–Penrose 伪逆作用。本文不精确构造 $\mathbf K^{\dagger}$，而用从零图像初始化的**共轭梯度最小二乘（CGLS）**算法数值近似其作用；CGLS 只需应用 $\mathbf K$ 与其伴随 $\mathbf K^{\top}$，适合大规模断层重建。对固定迭代次数 $J$，记所得近似逆作用为 $\mathbf K^{\dagger}\mathbf w\approx\mathrm{CGLS}_{J}(\mathbf K,\mathbf w)$（$\mathbf w$ 为一般测量空间向量）。由于计算 $\widetilde{\mathbf D}_t$ 只需 $\mathbf K^{\dagger}\mathbf y$ 与 $(\mathbf I-\mathbf K^{\dagger}\mathbf K)\widehat{\mathbf x}_{0|t}$，DDNM 修正可在**不显式构造**投影算子 $\mathbf K^{\dagger}$ 的情况下实现。CT 实验中以有限迭代 CGLS 近似替代精确伪逆作用，取

$$
\mathbf D_t=\mathrm{CGLS}_{J}(\mathbf K,\mathbf y)+\mathrm{CGLS}_{J}\left(\mathbf K,\mathbf K\widehat{\mathbf x}_{0|t}\right),\qquad J=16.\tag{36}
$$

因此修正估计可能受两类不同近似影响：扩散模型先验驱动预测的误差，以及有限迭代近似 $\mathbf K^{\dagger}$ 的数值误差。与理论分析的精确伪逆设置不同，数据一致性与值域/零空间分解只成立到 CGLS 近似精度；本文观察到有限迭代 CGLS 引入**隐式正则化**效应，在存在测量噪声时可能有益。

完整重建流程见算法 1。

**算法 1　CPF-DDNM 重建**

```text
Require: 测量 y、前向算子 K、预训练去噪器 ε_θ、融合调度 β(t)、CGLS 迭代数 J
1: 初始化 x_T ∼ N(0, I)，D_prev ← None
2: for t = T, T−Δt, …, Δt do
3:     计算 x̂_{0|t} = (x_t − σ_t ε_θ(x_t, t))/α_t
4:     计算 K†K x̂_{0|t} = CGLS_J(K, K x̂_{0|t})
5:     计算 D_t = K†y + x̂_{0|t} − K†K x̂_{0|t}（如式 (9)）
6:     if D_prev ≠ None then
7:         置 β_t = β(t)
8:         计算 D̃_t = D_t + β_t(D_prev − D_t)（如式 (3)）
9:     else
10:        D̃_t ← D_t
11:    end if
12:    计算 x_{t−Δt} = α_{t−Δt} D̃_t + σ_{t−Δt} ε_θ(x_t, t)
13:    D_prev ← D_t
14: end for
15: return x_0
```

### 4.5 对比方法、参数设置与评价指标

所提 CPF-DDNM 与 DDNM [27]、DiffPIR [35]、扩散后验采样（DPS）[5] 及其 Posterior Sampling Plus 变体（PS+）[5] 比较。DDNM 是主要基线，因为 CPF-DDNM 直接修改其零空间补全策略。稀疏视角与低剂量 CT 实验还考虑解析滤波反投影（FBP）[15] 与两种基于模型的迭代重建：同时迭代重建技术（SIRT）[9]，以及用 Chambolle–Pock 算法求解的 $\ell_2$-TV 正则最小二乘方法 [4]、[19]。

对比方法参数在训练集上调好后，在同一任务、同一采集设置下对所有测试图像**固定不变**。DDNM 与 CPF-DDNM 全部实验取 $\Delta t=50$，结合 $T=1000$ 得 $N=20$ 个反向扩散步。CT 实验中伪逆 $\mathbf K^{\dagger}$ 用 $J=16$ 次 CGLS 迭代近似，该设置在所考虑采集条件下提供稳定性能；注意限制 CGLS 迭代次数引入隐式正则化（早停减少沿病态分量对测量噪声的放大），故本文对 DDNM 与 CPF-DDNM 都用该截断 CGLS 近似，作为 DDNM+ 显式噪声处理策略的替代。

融合系数 $\beta_t$ 的选择是 CPF-DDNM 的关键。第 5.2 节在稀疏视角 CT 上做消融，考虑常数系数与时变调度；实验分析表明 CT 重建任务受益于在整条反向轨迹上保持 $\beta_t>1$，从而保留融合的外推效应。全部 CT 实验按如下时变调度定义融合系数：

$$
\beta_t=1.8-0.6\sqrt{1-\frac{t}{T}},\tag{37}
$$

使 $\beta_t$ 在整个反向扩散过程中处于外推区间，$\beta_t\in[1.2,1.8]$。对超分辨率，最有效的调度则在反向过程中逐渐降至零：

$$
\beta_t=1-\sqrt{1-\frac{t}{T}}.\tag{38}
$$

重建质量用三个互补指标定量评价：结构相似性 SSIM [28]（衡量结构相似度）、PSNR（像素级重建保真度）、LPIPS [34]（学习特征空间中的感知相似度）。每次重建用五种随机初始化重复；对每幅测试图像先在五次运行间平均指标，再在测试图像间计算所报均值与标准差。

## 5 结果与讨论

本节给出第 4 节所述实验的结果并讨论。

### 5.1 稀疏视角 CT 重建结果

第一个数值实验考察稀疏视角 CT 重建，用 60、45、30 个投影角评估方法在日益严重角度欠采样下的表现。

**表 1：在 30、45、60 投影角采集几何下、整个测试集上五次不同初始噪声实现运行的定量评价指标。粗体为每个实验的最优结果。**

| 方法 | SSIM (↑) | LPIPS (↓) | PSNR (↑) |
|---|---|---|---|
| $G_{30}$：FBP | 0.407±0.014 | 0.442±0.016 | 22.83±0.46 |
| $G_{30}$：SIRT | 0.636±0.021 | 0.384±0.014 | 26.52±0.55 |
| $G_{30}$：$\ell_2$-TV | 0.828±0.009 | 0.132±0.015 | 30.61±0.48 |
| $G_{30}$：DPS | 0.756±0.018 | 0.136±0.024 | 26.62±0.72 |
| $G_{30}$：PS+ | 0.524±0.018 | 0.231±0.013 | 19.96±0.52 |
| $G_{30}$：DiffPIR | 0.851±0.012 | 0.085±0.011 | 32.12±0.62 |
| $G_{30}$：DDNM | 0.784±0.018 | 0.132±0.011 | 31.06±0.62 |
| $G_{30}$：**CPF-DDNM** | **0.851±0.009** | **0.083±0.015** | **32.40±0.52** |
| $G_{45}$：FBP | 0.518±0.018 | 0.364±0.012 | 25.84±0.49 |
| $G_{45}$：SIRT | 0.705±0.016 | 0.322±0.011 | 28.19±0.53 |
| $G_{45}$：$\ell_2$-TV | 0.860±0.006 | 0.092±0.013 | 32.62±0.45 |
| $G_{45}$：DPS | 0.759±0.017 | 0.135±0.022 | 26.74±0.66 |
| $G_{45}$：PS+ | 0.525±0.018 | 0.231±0.013 | 19.98±0.53 |
| $G_{45}$：DiffPIR | 0.888±0.011 | 0.060±0.009 | 34.10±0.63 |
| $G_{45}$：DDNM | 0.824±0.016 | 0.106±0.011 | 32.67±0.61 |
| $G_{45}$：**CPF-DDNM** | **0.913±0.006** | **0.036±0.003** | **34.86±0.49** |
| $G_{60}$：FBP | 0.602±0.019 | 0.317±0.012 | 27.63±0.50 |
| $G_{60}$：SIRT | 0.758±0.015 | 0.264±0.010 | 29.55±0.54 |
| $G_{60}$：$\ell_2$-TV | 0.880±0.006 | 0.076±0.010 | 33.72±0.45 |
| $G_{60}$：DPS | 0.759±0.016 | 0.135±0.021 | 26.74±0.61 |
| $G_{60}$：PS+ | 0.525±0.018 | 0.230±0.013 | 19.99±0.53 |
| $G_{60}$：DiffPIR | 0.912±0.009 | 0.043±0.007 | 35.61±0.63 |
| $G_{60}$：DDNM | 0.853±0.014 | 0.084±0.010 | 33.89±0.62 |
| $G_{60}$：**CPF-DDNM** | **0.938±0.006** | **0.021±0.003** | **37.27±0.66** |

如预期，多数方法性能随采集视角数增加而改善。**CPF-DDNM 在全部三种采集几何、三项指标上都取得最优均值**（最高 SSIM、PSNR，最低 LPIPS）。在最困难的 30 视角几何下，CPF-DDNM 与 DiffPIR 非常接近；但它相对原始 DDNM 基线有明显提升——SSIM 从 0.7837 提到 0.8511、PSNR 从 31.06 提到 32.40 dB，LPIPS 从 0.1322 降到 0.0829。

对 45 与 60 视角几何，CPF-DDNM 相对竞争扩散方法的优势更明显：45 视角下 PSNR 比 DiffPIR 高约 0.77 dB，LPIPS 从 0.0601 降到 0.0356，SSIM 也更高（0.9125 对 0.8877）；60 视角下更显著——PSNR 达 37.27 dB、比 DiffPIR 高约 1.66 dB，LPIPS 从 0.0433 降至 0.0208。相对原始 DDNM，所提融合在两种设置中都一致改善三项指标。总体上，从 45 到 60 视角性能差距增大，与"连续后验融合能更有效利用更密角度采样所提供的额外测量信息"这一假设一致。

图 3 给出 30、45、60 视角几何的重建定性比较（自上而下）。如预期，随投影角增加，重建质量逐步改善，解剖结构更清晰、条纹与模糊伪影减少。在最困难的 30 视角下，FBP 与 SIRT 受重建伪影严重影响；$\ell_2$-TV 抑制了多数条纹但显得**过度平滑**；扩散方法给出更符合解剖的重建，但 DPS 与 PS+ 结构保真有限；DiffPIR、DDNM 与 CPF-DDNM 更准确恢复主要解剖结构，其中 CPF-DDNM 边界略更锐利、细节保持更好。45 与 60 视角下差异更明显：随投影信息增多，CPF-DDNM 更有效地结合测量一致性与学习先验。这些定性观察与表 1 的定量结果一致，确认连续后验融合能提升原始 DDNM 基线。



图 4 对 45 视角几何作更详细分析，分两部分：上部给出整个测试集、五次不同初始噪声实现运行的 SSIM 与 LPIPS 箱线图，CPF-DDNM 取得最佳总体分布（更高 SSIM、更低 LPIPS），相对 DDNM 的提升在两指标上均清楚可见；下部在与图 3 不同的测试图像上做进一步定性比较，放大感兴趣区域突出低对比度结构恢复的差异。

### 5.2 融合系数消融

本文通过常数系数与时变调度考察融合系数 $\beta_t$ 对重建动力学的影响，分析基于 45 投影角的稀疏视角 CT 重建；对每种 $\beta_t$ 选择，监测反向扩散轨迹上 SSIM、LPIPS、PSNR 与**平方数据残差**的演化（在训练集上平均）。

按第 3.3 节几何解释，先考虑常数

$$
\beta_t=\beta,\qquad\beta\in\{0,0.5,1,1.5\}.
$$

这里 $\beta=0$ 对应非融合 DDNM，(0,1] 为插值区间，$\beta=1.5$ 为外推更新。另评估三种时变调度。令

$$
s_t=1-\frac{t}{T}\in[0,1]\tag{39}
$$

表示反向扩散过程的归一化进度：采样开始时 $t=T$、$s_t=0$，反向轨迹结束时 $t=0$、$s_t=1$。三种调度定义为：**A**（纯插值，$\beta_t$ 恒不超过 1）；**B**（从外推值 $\beta_T=1.8$ 出发、越过 $\beta_t=1$、在轨迹末段趋近 0）；**C**（在整个轨迹保持外推区间并逐步减小）。三者都随反向过程接近干净图像而单调降低融合系数，区别在于取值范围：A 始终插值；B 起点外推、末端趋于零；C 始终外推。

图 5 比较不同 $\beta_t$ 选择下的重建动力学。在反向轨迹早期，各指标曲线非常相似：这些阶段扩散噪声高，连续去噪估计仍含不完整结构信息，其融合作用有限；差异在最后若干反向步更明显——此时后验估计更有信息量，其位移定义了更有意义的重建方向。

常数选择 $\beta_t\le1$ 一般产生比外推配置更平滑的轨迹；由于不引入过松弛，其轨迹更接近标准 DDNM。常数 $\beta_t=1.5$ 与调度 C 则在整个反向过程中保持外推：附加项 $\mathbf m_t=(\beta_t-1)(\mathbf D_{t+\Delta t}-\mathbf D_t)$ 沿两个连续反向迭代识别的方向把重建推过前一后验估计，这种过松弛更新在轨迹末段使 SSIM、LPIPS、PSNR 出现可见振荡；但振荡的有利相位达到比插值配置更高的 SSIM/PSNR 与更低 LPIPS。

比较常数 $\beta_t=1.5$ 与调度 C 表明：**仅保持 $\beta_t>1$ 并不足够**——二者都产生振荡，但常数系数可能在**不利相位**结束反向过程，导致最终重建退化；调度 C 把外推强度从 1.8 逐步降到 1.2，在所考虑配置中取得最佳最终图像质量指标。这一结果促使本文在全部 CT 实验中使用调度 C。

平方数据残差对所有配置总体下降，但外推选择在最后若干反向步引入明显振荡；对某些外推配置，最后一个反向迭代可能落在振荡动力学的不利相位，导致图像质量指标比前一次迭代更差。有趣的是，验证实验显示**数据残差最小的迭代不一定对应最佳图像质量指标**；这提示残差轨迹可能含有识别有利终端迭代的有用信息，但系统化停止准则的设计留待未来工作。

总体上，消融表明：**适当调制的**外推调度能比纯插值融合或纯外推常数更有效地利用连续后验估计中的方向信息。


### 5.3 低剂量 CT 重建

本节给出模拟低剂量采集实验（见第 4.3.1 节）的结果。图 6 评估重建方法对不同噪声水平的稳健性；柱状图给出整个测试集、五次不同初始噪声实现运行的 SSIM 与 LPIPS 均值，须线为标准差。

如预期，重建质量随噪声增强而总体退化（SSIM 下降、LPIPS 上升）。**CPF-DDNM 在所有考虑的噪声水平上取得最高 SSIM**；LPIPS 方面，DiffPIR 在最低噪声水平 $\delta=0.1$ 最佳，而 CPF-DDNM 在 $\delta=0.3$ 与 $0.5$ 取得最低值。有趣的是，CPF-DDNM 的相对优势随测量噪声增大而更明显，尤其在最高噪声水平；这表明连续后验融合提升了原始 DDNM 表述的稳健性，并在日益严重的测量噪声下仍然有效。定性结果确认 CPF-DDNM 给出最佳重建，低对比度区域的放大视图进一步突出这一点：噪声被有效抑制，同时保持锐利、明确的物体边界。


### 5.4 CT 图像超分辨率

最后一个数值实验评估第 4 节所述 $\times4$ 图像超分辨率设置。表 2 给出整个测试集上的 SSIM、LPIPS 与 PSNR 均值，图 7 给出含噪情形下两幅代表性重建。

**表 2：$\times4$ 超分辨率在无噪设置与噪声水平 $\delta=0.01$ 下的定量比较。结果以测试图像上的均值 ± 标准差给出（每幅图像先在五次随机初始化间平均指标）。粗体为每种设置的最优结果。**

| 噪声 | 方法 | SSIM↑ | LPIPS↓ | PSNR↑ |
|---|---|---|---|---|
| $\delta=0$ | DPS | 0.497±0.055 | 0.288±0.017 | 19.60±1.28 |
| $\delta=0$ | PS+ | 0.774±0.049 | 0.117±0.015 | 28.40±1.66 |
| $\delta=0$ | DiffPIR | 0.863±0.028 | 0.093±0.014 | 30.18±1.32 |
| $\delta=0$ | DDNM | 0.856±0.031 | **0.076±0.014** | **31.40±1.60** |
| $\delta=0$ | **CPF-DDNM** | **0.872±0.028** | 0.101±0.014 | 31.35±1.60 |
| $\delta=0.01$ | DPS | 0.495±0.055 | 0.288±0.017 | 19.60±1.28 |
| $\delta=0.01$ | PS+ | 0.771±0.055 | 0.118±0.014 | 28.23±1.60 |
| $\delta=0.01$ | DiffPIR | **0.839±0.028** | **0.111±0.019** | **29.59±1.27** |
| $\delta=0.01$ | DDNM | 0.808±0.028 | 0.131±0.017 | 29.03±1.30 |
| $\delta=0.01$ | CPF-DDNM | 0.828±0.027 | 0.142±0.014 | 29.19±1.39 |

无噪设置下，CPF-DDNM 取得最高 SSIM，PSNR 与 DDNM 基本相当，表明结构信息得到有效保持。引入测量噪声后，按表 2 的测试集平均值，DiffPIR 三项指标最佳；CPF-DDNM 相对原始 DDNM 基线在 SSIM 与 PSNR 上有所提升，但 LPIPS 更高。因此纯定量地看，含噪设置下 DiffPIR 总体表现最好。

然而图 7 的定性比较揭示出与定量排序**明显的不一致**：两个示例中 DiffPIR 重建明显更平滑，一些低对比度组织在放大感兴趣区域中分辨不清；CPF-DDNM 则产生更锐利的组织边界并保留若干局部细节。故在这两个含噪示例中，尽管平均指标较低，CPF-DDNM 的视觉结果最令人信服。这一差异说明 LPIPS 这类全局图像质量指标可能对具有临床或解剖意义的**局部**差异不敏感。


## 6 结论

本文提出 **CPF-DDNM**——一种**轻量推断时**策略，用于改善 DDNM 类逆问题求解器对不可观测图像成分的先验驱动恢复。该方法利用反向扩散轨迹上**已有**的信息，把连续测量感知估计结合，而无需修改或重训扩散模型、也不增加去噪器评估。

DDNM 的值域/零空间分解为所提融合给出直接几何解释：当伪逆为精确 Moore–Penrose 伪逆时，连续 DDNM 修正共享同一测量决定成分、仅在前向算子零空间中不同；故 CPF-DDNM **只修改先验驱动成分**，同时保持测量决定的信息——对无噪数据，它保持精确数据一致性。局部误差分析进一步给出外推最优融合系数可取得较小零空间恢复误差的条件。

实验表明，连续后验融合的收益取决于**前向算子**与**融合调度**。最大增益出现在稀疏视角 CT：CPF-DDNM 在各种采集几何与噪声水平上一致优于 DDNM，并优于所比较的扩散逆问题求解器。在超分辨率中，CPF-DDNM 相对 DDNM 改善了结构相似性，尽管在含噪设置下 DiffPIR 在某些指标上平均表现更好。方法在 CT 的数值近似伪逆与超分辨率的解析伪逆下都有效。

CPF-DDNM 相对 DDNM **不增加**去噪器评估或伪逆运算，只增加**前一修正的存储**与一次线性组合。剩余主要局限是**融合调度的选择**——目前由验证数据确定且依赖前向算子。未来工作将研究基于连续修正变化、数据残差等量的自适应推断时策略，并把 CPF 策略用于其他后验采样方法。

## 参考文献（英文原书目）

以下按原文编号逐条转录（共 35 条，条目文字不翻译；URL/DOI 从略，可在原文核对）。

[1] Yamin Arefeen, Brett Levac, Zach Stoebner, and Jonathan I. Tamir. INFusion: Diffusion regularized implicit neural representations for 2d and 3d accelerated MRI reconstruction. In 2024 58th Asilomar Conference on Signals, Systems, and Computers, pages 1886–1890. IEEE, 2024.

[2] Mario Bertero, Patrizia Boccacci, and Christine De Mol. Introduction to inverse problems in imaging. CRC press, 2021.

[3] M Jorge Cardoso, Wenqi Li, Richard Brown, Nic Ma, Eric Kerfoot, Yiheng Wang, Benjamin Murrey, Andriy Myronenko, Can Zhao, Dong Yang, et al. MONAI: An open-source framework for deep learning in healthcare. 2022.

[4] Antonin Chambolle and Thomas Pock. A first-order primal-dual algorithm for convex problems with applications to imaging. Journal of Mathematical Imaging and Vision, 40(1):120–145, 2011.

[5] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion Posterior Sampling for General Noisy Inverse Problems. In The Eleventh International Conference on Learning Representations, 2023.

[6] Heinz Werner Engl, Martin Hanke, and Andreas Neubauer. Regularization of inverse problems, volume 375. Springer, 1996.

[7] Davide Evangelista. Physics-guided flow matching for CT image reconstruction, 2026.

[8] Davide Evangelista, Elena Morotti, Francesco Pivi, and Maurizio Gabbrielli. Improving diffusion posterior samplers with lagged temporal corrections for image restoration. arXiv preprint arXiv:2605.12573, 2026.

[9] Peter F. C. Gilbert. Iterative methods for the three-dimensional reconstruction of an object from projections. Journal of Theoretical Biology, 36(1):105–117, 1972.

[10] Harshit Gupta, Kyong Hwan Jin, Ha Q Nguyen, Michael T McCann, and Michael Unser. CNN-based projected gradient descent for consistent CT image reconstruction. IEEE Transactions on Medical Imaging, 37(6):1440–1453, 2018.

[11] Per Christian Hansen. Rank-deficient and discrete ill-posed problems: numerical aspects of linear inversion. SIAM, 1998.

[12] Per Christian Hansen, James G Nagy, and Dianne P O'leary. Deblurring Images: Matrices, Spectra, and Filtering. SIAM, 2006.

[13] Kyong Hwan Jin, Michael T McCann, Emmanuel Froustey, and Michael Unser. Deep convolutional neural network for inverse problems in imaging. IEEE Transactions on Image Processing, 26(9):4509–4522, 2017.

[14] Jakob S Jorgensen, Emil Y Sidky, and Xiaochuan Pan. Quantifying admissible undersampling for sparsity-exploiting iterative image reconstruction in X-ray CT. IEEE Transactions on Medical Imaging, 32(2):460–473, 2013.

[15] Avinash C Kak and Malcolm Slaney. Principles of computerized tomographic imaging. SIAM, 2001.

[16] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.

[17] Amirhossein Kazerouni, Ehsan Khodapanah Aghdam, Moein Heidari, Reza Azad, Mohsen Fayyaz, Ilker Hacihaliloglu, and Dorit Merhof. Diffusion models in medical imaging: A comprehensive survey. Medical Image Analysis, 2023.

[18] Luping Liu, Yi Ren, Zhijie Lin, and Zhou Zhao. Pseudo numerical methods for diffusion models on manifolds. In International Conference on Learning Representations, 2022.

[19] Elena Loli Piccolomini and Elena Morotti. A model-based optimization framework for iterative digital breast tomosynthesis image reconstruction. Journal of Imaging, 7(2):36, 2021.

[20] Elena Loli Piccolomini, Marco Prato, Margherita Scipione, and Andrea Sebastiani. CTprintNet: an accurate and stable deep unfolding approach for few-view CT reconstruction. Algorithms, 16(6):270, 2023.

[21] Cheng Lu, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. DPM-Solver++: Fast solver for guided sampling of diffusion probabilistic models. Machine Intelligence Research, 22(4):730–751, 2025.

[22] C McCollough. Tu-fg-207a-04: Overview of the low dose CT grand challenge. Medical Physics, 43(6Part35):3759–3760, 2016.

[23] Elena Morotti, Davide Evangelista, and Elena Loli Piccolomini. A green prospective for learned post-processing in sparse-view tomographic reconstruction. Journal of Imaging, 7(8):139, 2021.

[24] Elena Morotti, Davide Evangelista, Andrea Sebastiani, and Elena Loli Piccolomini. Adaptive weighted total variation boosted by learning techniques in few-view tomographic imaging. Journal of Scientific Computing, 2024.

[25] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In 9th International Conference on Learning Representations, ICLR 2021, pages 1–20, 2021.

[26] Wim Van Aarle, Willem Jan Palenstijn, Jan De Beenhouwer, Thomas Altantzis, Sara Bals, K Joost Batenburg, and Jan Sijbers. The ASTRA toolbox: A platform for advanced algorithm development in electron tomography. Ultramicroscopy, 157:35–47, 2015.

[27] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In The Eleventh International Conference on Learning Representations, pages 1–31, 2023.

[28] Zhou Wang, Eero P Simoncelli, and Alan C Bovik. Multiscale structural similarity for image quality assessment. In The Thirty-Seventh Asilomar Conference on Signals, Systems & Computers, 2003, volume 2, pages 1398–1402. IEEE, 2003.

[29] George Webber and Andrew J. Reader. Diffusion models for medical image reconstruction. BJR—Artificial Intelligence, 2024.

[30] Wenjun Xia, Wenxiang Cong, and Ge Wang. Patch-based denoising diffusion probabilistic model for sparse-view CT reconstruction. arXiv preprint arXiv:2211.10388, 2022.

[31] Taofeng Xie, Zhuo-Xu Cui, Chen Luo, Huayu Wang, Congcong Liu, Yuanzhi Zhang, Xuemei Wang, Yanjie Zhu, Guoqing Chen, Dong Liang, Qiyu Jin, Yihang Zhou, and Haifeng Wang. Joint diffusion: Mutual consistency-driven diffusion model for PET-MRI co-reconstruction. Physics in Medicine & Biology, 69(15):155019, 2024.

[32] Liutao Yang, Jiahao Huang, Guang Yang, and Daoqiang Zhang. CT-SDM: A sampling diffusion model for sparse-view CT reconstruction across various sampling rates. IEEE Transactions on Medical Imaging, 44(6):2581–2593, 2025.

[33] Qinsheng Zhang and Yongxin Chen. Fast sampling of diffusion models with exponential integrator. In International Conference on Learning Representations, 2023.

[34] Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The Unreasonable Effectiveness of Deep Features as a Perceptual Metric. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, pages 586–595, 2018.

[35] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising Diffusion Models for Plug-and-Play Image Restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 1219–1229, 2023.

## 图注与表注

**图 1：** 外推情形 $\beta_t>1$ 下 CPF-DDNM 融合的几何解释。当前与前一零空间估计 $\mathbf P_{\mathrm{Ker}}\widehat{\mathbf x}_{0|t}$ 与 $\mathbf P_{\mathrm{Ker}}\widehat{\mathbf x}_{0|t+\Delta t}$ 确定方向 $\mathbf d_t$；CPF-DDNM 通过附加贡献 $\mathbf m_t:=(\beta_t-1)\mathbf d_t$ 把估计延伸到 $\mathbf P_{\mathrm{Ker}}\widehat{\mathbf x}_{0|t+\Delta t}$ 之外，而测量决定成分 $\mathbf K^{\dagger}\mathbf y$ 不变。

**图 2：** 用作真值参考的 Mayo Clinic 数据集代表性轴位 CT 图像。第二行为对应的放大区域，突出软组织边界、肺部结构与骨界面等精细解剖细节。

**图 3：** 不同方法的稀疏视角 CT 重建定性比较。自上而下依次为 30、45、60 投影角；每种采集设置的第二行为对应重建的放大细节。

**图 4：** 45 视角稀疏 CT 几何的定量与定性比较。箱线图为整个测试集上五次不同初始噪声实现运行的 SSIM 与 LPIPS 分布；另给出代表性重建及放大感兴趣区域。

**图 5：** 不同常数系数与时变调度 $\beta_t$ 下，SSIM、LPIPS、PSNR 与平方数据残差沿反向扩散轨迹的演化（稀疏视角 CT，45 视角）。

**图 6：** 低剂量 CT 重建对测量噪声的稳健性。上部为噪声水平 $\delta=0.1,0.3,0.5$ 下整个测试集的 SSIM 与 LPIPS 均值（须线为标准差）；下部为 $\delta=0.3$ 时代表性重建与放大感兴趣区域。

**图 7：** 含测量噪声（$\delta=0.01$）时 $\times4$ 超分辨率的不同方法定性比较。给出测试集两幅代表性图像及相应重建。

**表注：** 表 1 为稀疏视角 CT 在 30、45、60 投影角三种采集几何下整个测试集五次运行的 SSIM/LPIPS/PSNR 定量结果，粗体为每个实验最优；表 2 为 $\times4$ 超分辨率在无噪与 $\delta=0.01$ 噪声下的定量比较（均值 ± 标准差，粗体为各设置最优）。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2610.03261（21 页）的全文中文译稿，按原文结构译出：摘要与关键词；第 1 节引言（病态逆问题、DDNM 零空间分解、连续后验融合思想、三项贡献、结构安排）；第 2 节相关工作（扩散后验采样器、多步离散化与 LAMP、医学图像扩散重建）；第 3 节方法（3.1 DDIM/扩散模型与式 (4)—(7)；3.2 扩散后验采样器与式 (8)—(9)；3.3 CPF-DDNM 与式 (10)—(16)、命题 1 及证明；3.4 融合参数的几何解释、局部误差分析与式 (17)—(29)、命题 2 及证明、式 (30)—(31) 的调度）；第 4 节实验设置（4.1 数据集与式；4.2 扩散模型与训练式 (32)；4.3 医学应用（4.3.1 CT 与式 (33)—(34)、4.3.2 超分辨率与式 (35)）；4.4 伪逆计算、式 (36) 与算法 1；4.5 对比方法、参数与指标、式 (37)—(38)）；第 5 节结果（5.1 稀疏视角 CT 与表 1、图 3—4；5.2 融合系数消融与式 (39)、图 5；5.3 低剂量 CT 与图 6；5.4 超分辨率与表 2、图 7）；第 6 节结论与未来工作；35 条英文参考文献；图 1—图 7 图注与表 1—表 2 表注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言开始）→ 第 2—3 页（引言、贡献、第 2 节、第 3.1—3.2 节）→ 第 4—6 页（第 3.3 节、命题 1、图 1、第 3.4 节）→ 第 7—8 页（式 (17)—(31)、第 4 节设置）→ 第 9—11 页（4.2—4.5、算法 1、式 (33)—(38)）→ 第 12—16 页（第 5.1—5.2 节、表 1、图 3—5）→ 第 17—19 页（5.3—5.4 节、表 2、图 6—7）→ 第 19—21 页（第 6 节、参考文献）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；**表 1 与表 2 的全部数值（含 ± 标准差与粗体最优项）已按 PDF 文本层逐行提取并核对**，与正文叙述一致（如 30 视角 DDNM 0.784/31.06 对应正文 0.7837/31.06 ✓；45 视角 CPF-DDNM 0.913/34.86 相对 DiffPIR 34.10 高约 0.77 dB ✓；60 视角 37.27 相对 DiffPIR 35.61 高约 1.66 dB ✓）。
2. 图 1—图 7 均未上传图片；本页以"图注与表注"小节统一给出 7 条中文图注与 2 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖原文 (1)—(39)，全部保留原编号、无缺号与重复；命题 1、命题 2 及其证明完整译出。
4. **原文疑点／说明：** ①表 1 中 $G_{30}$ 的 PS+ 与 $G_{45}/G_{60}$ 的 PS+ 数值几乎相同（0.524/0.231/19.96 与 0.525/0.231/19.98），原文如此，照录；②表 2 无噪设置下 DDNM 的 LPIPS/PSNR 用粗体标出，而 CPF-DDNM 的 SSIM 为粗体，原文的粗体标注在「各设置最优」上，本页照原文标注；③正文称无噪超分辨率 CPF-DDNM 的 PSNR「与 DDNM 基本可比」（31.35 对 31.40），照录；④图 6 的噪声水平与 §4.5 一致（$\delta\in\{0.1,0.3,0.5\}$），照录；⑤原文 (34) 的 $m_{\mathrm{eff}}$ 近似及其与 $M^{2}$ 的比较条件在 §4.3.1 中以文字给出，本页保留近似式与结论；⑥算法 1 伪代码的 else 分支与第 13 行 `D_prev` 更新按原文结构译出。
5. **许可与登记：** 原文为 arXiv 预印本，**许可为 CC0**（公共领域贡献），按任务要求**可登记为可公开全文译稿**；页面顶部已注明。页面目录日期 2026-10-31 为当日推荐/归档日期，版本行按原文标注的预印本日期（October 5, 2026）与本页面日期区分。
6. 版权：本页为中文翻译页面，未上传原文 PDF；CC0 许可下可再传播，引用遵循 arXiv 学术规范。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}