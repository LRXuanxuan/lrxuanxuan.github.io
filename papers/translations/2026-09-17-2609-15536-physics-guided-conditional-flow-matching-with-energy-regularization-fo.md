---
layout: page
title: "能量正则化的物理引导条件流匹配｜中文全文译文"
permalink: /papers/translations/2026-09-17-2609-15536-physics-guided-conditional-flow-matching-with-energy-regularization-fo/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/5cdd2cbc4dcb1cfc/) · [原文 arXiv](https://arxiv.org/abs/2609.15536) · [全部目录](/papers/catalog/)

# 能量正则化的物理引导条件流匹配

**原题：** Physics-Guided Conditional Flow Matching with Energy Regularization for Robust PDE Inverse Problems  
**作者：** Yongsheng Chen（†，共同第一作者）、Shuo Lu（‡，共同第一作者）、Wei Guo（§）、Xinghui Zhong（¶）  
**单位：** †‡¶ 浙江大学数学科学学院（杭州 310027，中国）；§ 德克萨斯理工大学数学与统计系（Lubbock, TX 70409, USA）。  
**版本：** arXiv:2609.15536v1（math.NA），2026 年 9 月 14 日，原文 26 页。  
**代码：** https://github.com/mosdf/PG-CFM-ERFM  
**范围与状态：** 全文中文译稿：摘要、关键词、MSC 分类号、第 1–6 节及全部小节、式 (2.1)–(5.18)、算法 3.1 与 4.1、定理 4.1 及其证明、注 3.1、表 1–9（逐格转写）、图 1–9 图注、参考文献 [1]–[41]（英文原条目）均按原文结构录入；原文无致谢段。逐句逐式终校未做。

## 摘要

我们研究从稀疏、含噪且被污染观测出发的偏微分方程（PDE）反问题，目标是在无网格（mesh-free）设定下恢复未知系数场与相关状态变量。在此类稀疏、被污染的观测下，标准物理知情方法与生成式方法通常不加区分地对待所有样本，因而缺乏在物理规律与受污染数据之间取得协调的原则性机制。我们用一个两阶段流匹配框架应对该困难。第一阶段提出**物理引导条件流匹配**（PG-CFM）：沿生成轨迹施加残差正则化，并加入间歇性的全局配点约束，从而纳入强形式 PDE 信息。第二阶段引入**能量正则流匹配**（ERFM）：从一个冻结教师模型为每个观测赋予"物理—数据能量分"，并对流匹配目标重新加权，以削弱高能量、与 PDE 不一致样本的影响。我们证明所得第二阶段目标等价于在教师诱导的重加权数据分布下进行流匹配，这为鲁棒性机制给出了总体层面的解释。在若干反问题基准（包括 Poisson 与 Navier–Stokes 问题）上的数值实验表明，该框架相比鲁棒 PINN 变体与竞争生成基线，能取得更准确的系数恢复。

**关键词：** PDE 反问题、条件流匹配、物理知情学习、鲁棒学习。  
**MSC 分类号：** 65M32, 65N21, 68T07。

## 1. 引言

偏微分方程（PDE）反问题旨在从观测中恢复未知系数场、源项或潜在状态变量，广泛出现在地下流动、流体重建等科学工程应用中。实践中观测不可避免地稀疏、不规则分布且含噪，使反问题严重不适定。经典变分与伴随方法为此类问题提供了坚实基础 [16, 1, 7]，但在异方差噪声下其性能可能显著下降。

近期大量工作通过物理知情优化处理 PDE 反问题，最著名的是物理知情神经网络（PINNs）及其变体 [24, 17]。这些方法把数据失配项与 PDE 残差罚项合并为单一目标，给出灵活的无网格表述。然而当观测稀疏或含噪时，数据拟合项与 PDE 残差项可能引发梯度失衡，导致预测不准 [31]。鲁棒 PINN 变体通过自适应加权 [33]、数据引导预训练 [41] 或贝叶斯表述 [34] 改善稳定性；CoPINN 动态评估每个样本的难度并从易到难优化采样区域 [12]。这些方法以不同方式改善优化鲁棒性，但仍主要通过局部损失塑形、训练调度或后验推断起作用，而非通过识别"全局上与支配 PDE 不一致"的观测的机制。

生成式表述提供了另一条途径：通过扩散、基于分数、归一化流或流匹配动力学学习潜在场上的分布 [14, 11, 28, 8, 19]。在 PDE 设定下，许多近期方法工作在数据丰富的离线机制中，用大量干净模拟预训练代理模型或先验 [18, 40, 36]，随后可在推理时加入物理约束（例如通过扩散后验采样 [15, 10, 35]），或通过物理知情生成目标更直接地纳入训练 [3, 29, 37, 2]；函数空间流匹配表述进一步扩展了可用的约束机制 [9, 30, 6]。这些进展很有前景，但并不天然适合本文研究的单实例反问题：许多方法假设噪声相对温和、依赖固定网格，或旨在平衡数据拟合与物理，而非在二者明显冲突时降低受污染测量的权重。

一个相关问题在含噪数据学习中更普遍地出现。鲁棒性常通过鲁棒损失 [13, 38]、样本选择或协同教学 [32, 27]、元重加权 [25, 39]、基于影响函数的准则 [4, 20]，或减少有害样本足迹的机器遗忘机制 [23, 21, 26] 来改善。这些策略在许多统计设定中有效，但大体上是**物理无关**的：统计上看似合理的样本仍可能违反支配 PDE，而较大残差也可能表明真实模型失配而非数据污染。这促使我们采用由数据拟合与物理一致性共同引导的鲁棒性机制。

我们在在线反问题设定中考虑该问题：直接从规则观测求解单个 PDE 反问题，而不依赖大规模离线预训练数据。我们的表述建立在条件流匹配之上，包含两个阶段。第一阶段 PG-CFM 在生成轨迹上增加强形式 PDE 正则化并周期性加入全局配点罚项，促使整个流过程（而不仅是最终重建）与 PDE 解流形对齐。第二阶段 ERFM 把第一阶段解作为冻结教师，为每个观测赋予"物理—数据能量分"，并重加权流匹配目标，以削弱高能量、与 PDE 不一致样本的影响。

主要理论结果表明，ERFM 目标等价于在教师诱导的重加权数据分布下进行条件流匹配，为第二阶段的鲁棒性机制给出总体层面的解释。数值实验中，我们在若干反问题基准（包括 Poisson 与 Navier–Stokes 问题）上评估方法，在异质污染与重尾噪声下取得更好的系数恢复与场重建。

本文其余部分安排如下：第 2 节给出 PDE 反问题表述并回顾条件流匹配背景；第 3 节提出物理引导条件流匹配框架；第 4 节引入能量正则精化阶段；第 5 节报告数值实验（基准比较、消融、鲁棒性、敏感性分析与计算诊断）；第 6 节讨论结论与未来工作。

## 2. 问题表述与流匹配背景

### 2.1. PDE 反问题

我们在物理区域 \(\Omega\subset\mathbb R^{d_\xi}\) 上考虑 PDE 反问题，其中坐标 \(\xi\in\Omega\) 汇集所有相关自变量；对时间相关问题可取 \(\Omega=\Omega_{\rm space}\times[0,T]\)（记号中不显式区分）。目标是恢复未知状态场与系数场 \(u^\star:\Omega\to\mathbb R^{d_u}\)、\(a^\star:\Omega\to\mathbb R^{d_a}\)，使其满足支配 PDE 及相应边界/初始条件：

$$
F\big(u^\star,a^\star;\xi\big)=0,\qquad \xi\in\Omega,\tag{2.1}
$$

$$
B\big(u^\star,a^\star;\xi\big)=0,\qquad \xi\in\partial\Omega.\tag{2.2}
$$

这里 \(F\) 是涉及 \(u^\star\)、\(a^\star\) 及其导数的微分算子，\(B\) 表示给定的边界与初始约束。

在反问题设定中，场 \(u^\star\) 只被部分观测。我们给定 \(N\) 个含噪、可能被污染的测量

$$
y_i=u^\star(\xi_i)+\varepsilon_i,\qquad \xi_i\in\Omega,\quad i=1,\ldots,N,
$$

采集于散乱位置 \(\xi_i\)，其中 \(\varepsilon_i\) 可能异方差、重尾或包含离群点。该设定要求能直接作用于不规则观测的无网格重建方法。为记号方便，记 \((\xi,y)\sim p_{\rm data}\) 为数据生成分布，并用 \(\{(y_i,\xi_i)\}_{i=1}^{N}\) 上的经验平均近似 \(p_{\rm data}\) 下的期望。我们的目标是在强制满足 (2.1)–(2.2) 的同时，从这些含噪、被污染观测重建 \(u^\star\) 与 \(a^\star\)。全文聚焦**单实例**设定：直接由某一反问题的不规则测量求解它，而非从大规模完全观测 PDE 解的离线数据集中学习。

### 2.2. 条件流匹配

简要回顾下文所用的条件流匹配（CFM）表述，一般处理见 [19]。设 \(\{p_t\}_{t\in[0,1]}\) 为 \(\mathbb R^{d_u}\) 上从简单基分布 \(p_0\) 到目标分布 \(p_1\) 的概率路径，该路径由时变速度场 \(w_t:\mathbb R^{d_u}\to\mathbb R^{d_u}\) 通过连续性方程支配：

$$
\partial_tp_t(u)+\nabla_u\cdot\left(p_t(u)w_t(u)\right)=0,\qquad u\in\mathbb R^{d_u}.\tag{2.3}
$$

边际速度 \(w_t(u)\) 的神经网络近似 \(v_t(u;\theta)\) 可通过最小化下式学习：

$$
\mathcal L_{\rm FM}(\theta):=\mathbb E_{t\sim{\rm Unif}[0,1],\ u\sim p_t}\left[\left\|v_t(u;\theta)-w_t(u)\right\|_2^2\right].\tag{2.4}
$$

然而边际速度 \(w_t\) 一般难以计算。CFM 通过引入条件变量 \(z\sim q(z)\) 与一族条件路径 \(\{p_t(\cdot|z)\}_{t\in[0,1]}\) 解决该困难，使得

$$
p_t(u)=\int p_t(u|z)q(z){\rm d}z,\tag{2.5}
$$

且每条条件路径满足

$$
\partial_tp_t(u|z)+\nabla_u\cdot\left(p_t(u|z)w_t(u|z)\right)=0.\tag{2.6}
$$

当条件速度 \(w_t(u|z)\) 可计算时，\(v_t\) 可改为通过下式训练：

$$
\mathcal L_{\rm CFM}(\theta):=\mathbb E_{\substack{t\sim{\rm Unif}[0,1]\\z\sim q(z),\ u\sim p_t(\cdot|z)}}\left[\left\|v_t(u;\theta)-w_t(u|z)\right\|_2^2\right].\tag{2.7}
$$

实践中我们从 \({\rm Unif}[\varepsilon_{\rm fm},1-\varepsilon_{\rm fm}]\) 采样 \(t\)（\(\varepsilon_{\rm fm}>0\) 很小）以避免端点附近的数值问题。在温和正则假设下，条件目标 (2.7) 与边际流匹配具有相同极小点、梯度仅相差常数因子 [19]。因此 CFM 无需显式模拟边际速度即可训练连续输运模型。

### 2.3. 观测条件路径

为把 CFM 应用于本文反问题，我们把每个观测对 \((\xi_i,y_i)\) 与状态空间中的一个终端目标相关联。用神经向量场 \(v_\theta:[0,1]\times\mathbb R^{d_u}\times\Omega\times\mathbb R^{d_a}\to\mathbb R^{d_u}\) 建模该流，其输入为流时间 \(t\)、当前状态 \(u\)、坐标 \(\xi\) 与系数值 \(a_\Phi(\xi)\)；若使用强迫项等问题相关输入，则作为附加条件变量纳入（可读性考虑下一般不写）。未知系数场由神经表示 \(a_\Phi:\Omega\to\mathbb R^{d_a}\) 近似，可训练参数为 \(\Phi\)。

对固定坐标 \(\xi\in\Omega\)，诱导输运满足

$$
\frac{{\rm d}s(t,\xi)}{{\rm d}t}=v_\theta\left(t,s(t,\xi),\xi,a_\Phi(\xi)\right),\qquad s(0,\xi)\sim p_0,\tag{2.8}
$$

其中 \(p_0\) 为 \(\mathbb R^{d_u}\) 上的标准高斯。对每个观测对 \((\xi_i,y_i)\)，采样 \(\epsilon\sim p_0\) 与 \(t\sim{\rm Unif}[0,1]\)，并定义线性条件路径

$$
\bar s(t,\xi_i)=(1-t)\epsilon+ty_i,\qquad t\in[0,1].\tag{2.9}
$$

对该标准 CFM 线性桥，条件速度为

$$
w_t\left(\bar s(t,\xi_i)\big|\xi_i,y_i,\epsilon\right)=y_i-\epsilon.\tag{2.10}
$$

所得观测条件 CFM 目标为

$$
\mathcal L_{\rm CFM}(\theta,\Phi):=\mathbb E_{\substack{t\sim{\rm Unif}[0,1]\\(\xi_i,y_i)\sim p_{\rm data}\\\epsilon\sim p_0}}\left[\left\|v_\theta\left(t,\bar s(t,\xi_i),\xi_i,a_\Phi(\xi_i)\right)-(y_i-\epsilon)\right\|_2^2\right].\tag{2.11}
$$

(2.11) 本身能从含噪观测学习条件输运模型，但不使用支配 PDE，也不区分物理一致测量与受污染测量。下一节引入 (2.11) 的物理引导扩展，用强形式 PDE 信息正则化输运动力学。

**图 1（原文 Fig. 1）：** 所提两阶段框架概览。第一阶段中，PG-CFM 通过把观测条件流匹配与局部、全局 PDE 正则化相结合，学习物理引导的条件输运模型。第二阶段中，冻结的第一阶段解诱导"物理—数据能量分"，对流匹配损失重新加权以做 ERFM 微调。

## 3. 物理引导条件流匹配

CFM 目标 (2.11) 从含噪观测学习输运模型，但不强制支配 PDE。因此仅拟合桥速度不足以保证所学轨迹保持物理一致，尤其当观测稀疏或被污染时。于是用基于 PDE 的正则化增强 CFM，得到第一阶段模型**物理引导条件流匹配**（PG-CFM）。图 1 概括完整两阶段流程。本节发展第一阶段 PG-CFM 模型，把观测条件流匹配与桥局部、全局 PDE 残差罚项结合；第二阶段基于能量的精化（用冻结的第一阶段解重加权流匹配目标）在第 4 节引入。

### 3.1. 物理引导正则化

为纳入物理结构，我们加入由 (2.1) 中算子构建的残差罚项。对候选状态场 \(\hat u\) 与系数场 \(a\)，定义

$$
\mathcal R[\hat u,a](\xi):=F(\hat u,a;\xi),\tag{3.1}
$$

其中 \(F\) 中的导数用自动微分 [5] 计算。我们使用两个残差罚项：第一个是沿附着于含噪观测的轨迹评估的**局部桥条件损失**，第二个是在整个区域上施加的**全局配点损失**。局部项约束观测数据附近的输运，全局项促进区域上的一致性。

#### 3.1.1. 局部桥条件物理损失

局部桥条件物理损失旨在对由桥状态生成的终端预测施加 PDE 一致性。记 \(\Gamma_{t\to1}^{(K_1)}\) 为由 (2.8) 从流时间 \(t\) 到 1 施加 \(K_1\) 次定步长 Heun 更新所得的数值流映射。从桥状态 \(\bar s(t,\xi_i)\) 出发，定义

$$
\tilde u_{\theta,\Phi}(\xi_i)=\Gamma_{t\to1}^{(K_1)}\left(\bar s(t,\xi_i),\xi_i,a_\Phi(\xi_i);\theta\right).\tag{3.2}
$$

相应局部残差为

$$
\mathcal R_{\rm loc}(\xi_i,t;\theta,\Phi)=\mathcal R[\tilde u_{\theta,\Phi},a_\Phi](\xi_i),\tag{3.3}
$$

局部物理损失为

$$
\mathcal L_{\rm PDE,loc}(\theta,\Phi)=\mathbb E_{\substack{t\sim{\rm Unif}[0,1],(\xi_i,y_i)\sim p_{\rm data}\\\epsilon\sim p_0}}\left[\left\|\mathcal R_{\rm loc}(\xi_i,t;\theta,\Phi)\right\|_2^2\right].\tag{3.4}
$$

这里"局部"指 PDE 残差在由观测条件中间桥状态所得的终端预测上评估：对每个采样观测 \((\xi_i,y_i)\) 与流时间 \(t\)，桥状态 \(\bar s(t,\xi_i)\) 被作为所学向量场的初始条件，并从 \(t\) 积分到 1。这与"从基状态 \(s_0\) 在 \([0,1]\) 上积分完整轨迹以生成预测"不同，减少了流匹配所用桥插值与残差评估所用物理场之间的不匹配。

#### 3.1.2. 全局配点物理损失

仅局部损失不足以约束远离观测集的恢复解。因此我们在 \(\Omega\) 上采样配点 \(\xi\sim p_{\rm res}\)（\(p_{\rm res}\) 表示配点采样分布），并独立于测量施加 PDE 残差。记 \(\Gamma_{0\to1}^{(K_2)}\) 为在 \([0,1]\) 上施加 \(K_2\) 次定步长 Heun 更新所得的数值流映射。定义确定性全局预测

$$
u_{\theta,\Phi}^\dagger(\xi)=\Gamma_{0\to1}^{(K_2)}\left(u_{\rm base},\xi,a_\Phi(\xi);\theta\right),\qquad u_{\rm base}=0.\tag{3.5}
$$

(3.5) 中的确定性初始化在每个配点给出单一可微场值，便于评估全局残差与报告点预测。相应全局残差为

$$
\mathcal R_{\rm glob}(\xi;\theta,\Phi)=\mathcal R[u_{\theta,\Phi}^\dagger,a_\Phi](\xi),\tag{3.6}
$$

全局物理损失为

$$
\mathcal L_{\rm PDE}(\theta,\Phi)=\mathbb E_{\xi\sim p_{\rm res}}\left[\left\|\mathcal R_{\rm glob}(\xi;\theta,\Phi)\right\|_2^2\right].\tag{3.7}
$$

该项促进全域一致性，促使推断的状态与系数场在远离测量位置处满足支配 PDE。实践中可间歇性评估以降低计算成本。

### 3.2. 边界与初始条件

当边界或初始条件可得时，我们通过附加平方罚项施加。令 \(\partial\Omega_u\subseteq\Omega\) 表示给定了状态值的时空边界部分，\(u_{\rm bc}(\xi)\) 为相应边界或初始数据。定义

$$
\mathcal L_{\rm BC}^u(\theta,\Phi)=\mathbb E_{\xi\sim p_{\partial\Omega_u}}\left[\left\|\mathcal B_u[u_{\theta,\Phi}^\dagger](\xi)-u_{\rm bc}(\xi)\right\|_2^2\right],\tag{3.8}
$$

其中 \(\mathcal B_u\) 为状态的边界或初始条件算子。对时间相关问题，初始条件通过把时间边界（如 \(\{t_{\rm phys}=0\}\)）纳入 \(\partial\Omega_u\) 来施加。若系数场在子集 \(\partial\Omega_a\subseteq\Omega\) 上已知，还使用

$$
\mathcal L_{\rm BC}^a(\Phi)=\mathbb E_{\xi\sim p_{\partial\Omega_a}}\left[\left\|a_\Phi(\xi)-a_{\rm bc}(\xi)\right\|_2^2\right].\tag{3.9}
$$

当此类信息不可得时，相应罚项权重设为零。

### 3.3. PG-CFM 目标与第一阶段重建

**算法 3.1 第一阶段：PG-CFM 训练步（一个 minibatch）**

1. 输入：minibatch \((\xi,y)\)。
2. 采样 \(t\sim{\rm Unif}[\varepsilon_{\rm fm},1-\varepsilon_{\rm fm}]\)、\(\epsilon\sim p_0\)。
3. \(s_t\leftarrow(1-t)\epsilon+ty\)（线性桥）。
4. \(u_{\rm loc}\leftarrow\Gamma_{t\to1}^{(K_1)}(s_t,\xi,a_\Phi(\xi);\theta)\)。
5. \(\mathcal L_{\rm FM}\leftarrow\) FM 损失 \((v_\theta,s_t,y,\epsilon)\)（式 2.11）。
6. \(\mathcal L_{\rm PDE,loc}\leftarrow\) 局部 PDE 损失 \((u_{\rm loc},a_\Phi,\xi)\)（式 3.4）。
7. \(\mathcal L_{\rm PDE}\leftarrow\) 全局 PDE 损失 \((u_{\theta,\Phi}^\dagger,a_\Phi)\)（式 3.7，偶尔评估）。
8. \(\mathcal L_{\rm PG\text{-}CFM}\leftarrow\mathcal L_{\rm CFM}+\lambda_{\rm loc}\mathcal L_{\rm PDE,loc}+\lambda_{\rm PDE}\mathcal L_{\rm PDE}\)。
9. 若使用边界或初始罚项，则
10. \(\mathcal L_{\rm PG\text{-}CFM}\leftarrow\mathcal L_{\rm PG\text{-}CFM}+\lambda_{\rm BC}^u\mathcal L_{\rm BC}^u+\lambda_{\rm BC}^a\mathcal L_{\rm BC}^a\)。
11. 用一步优化器更新 \((\theta,\Phi)\) 以最小化 \(\mathcal L_{\rm PG\text{-}CFM}\)。

把 CFM 损失与局部、全局物理正则项结合，得到 PG-CFM 目标

$$
\mathcal L_{\rm PG\text{-}CFM}(\theta,\Phi)=\mathcal L_{\rm CFM}(\theta,\Phi)+\lambda_{\rm loc}\mathcal L_{\rm PDE,loc}(\theta,\Phi)+\lambda_{\rm PDE}\mathcal L_{\rm PDE}(\theta,\Phi)+\lambda_{\rm BC}^u\mathcal L_{\rm BC}^u(\theta,\Phi)+\lambda_{\rm BC}^a\mathcal L_{\rm BC}^a(\Phi).\tag{3.10}
$$

这里 \(\lambda_{\rm loc}\) 与 \(\lambda_{\rm PDE}\) 加权局部与全局物理罚项，\(\lambda_{\rm BC}^u\) 与 \(\lambda_{\rm BC}^a\) 加权给定状态与系数边界/初始数据的罚项。实现中，\(\mathcal L_{\rm CFM}\) 与 \(\mathcal L_{\rm PDE,loc}\) 在同一数据 minibatch 上评估，而 \(\mathcal L_{\rm PDE}\) 在从 \(p_{\rm res}\) 采样的配点上计算。系数网络 \(a_\Phi\) 与条件向量场 \(v_\theta\) 通过最小化 (3.10) 联合训练；因此 \(a_\Phi\) 既因其在流模型中的作用、也因其在 PDE 残差中的出现而被更新。

第一阶段最小化 (3.10) 得到物理引导基线模型。两个残差项作用不同：\(\mathcal L_{\rm PDE,loc}\) 约束观测条件桥附近的输运，\(\mathcal L_{\rm PDE}\) 促进区域上更广泛的一致性；在稀疏反问题中二者都用是有益的，因为局部观测信息与全局配点信息单独都不充分。

训练后，模型给出推断的系数场 \(a_\Phi\) 及定义恢复状态的输运场 \(v_\theta\)。推理时，点预测由 (3.5) 中确定性映射 \(u_{\theta,\Phi}^\dagger\) 得到。对 \((u_{\theta,\Phi}^\dagger,a_\Phi)\) 即第一阶段反问题解，并作为第 4 节第二阶段精化的冻结教师。

**注 3.1（数值积分）。** 流映射 \(\Gamma_{t\to1}^{(K_1)}\) 与 \(\Gamma_{0\to1}^{(K_2)}\) 在默认实验中用定步长 Heun 积分计算，训练与评估使用相同积分方案。对局部物理项，桥条件残差只需从中间流时间 \(t\) 积分到终端时间 1，通常比反复演化完整 \([0,1]\) 轨迹更便宜。

算法 3.1 汇总单个 PG-CFM 训练步，含观测条件流匹配项、局部与全局物理罚项、以及可选的边界/初始条件项。

## 4. 能量正则流匹配

(3.10) 的第一阶段 PG-CFM 目标均匀加权所有观测。然而实践中部分测量可能被污染、与支配 PDE 不一致。为此我们引入**能量正则流匹配**（ERFM）：这一第二阶段精化从冻结的第一阶段模型为每个观测赋予"物理—数据能量分"，并据此重加权观测条件流匹配损失。

### 4.1. 物理—数据能量分

记 \((u_{\theta_0,\Phi_0}^\dagger,a_{\Phi_0})\) 为 PG-CFM 所得第一阶段解，第二阶段中保持固定。对每个观测 \((\xi_i,y_i)\)，我们在同一位置评估确定性 PG-CFM 预测与相应 PDE 残差：

$$
u_i^0:=u_{\theta_0,\Phi_0}^\dagger(\xi_i),\qquad \mathcal R_i^0:=F\left(u_i^0,a_{\Phi_0}(\xi_i);\xi_i\right).\tag{4.1}
$$

随后定义观测失配与物理残差幅值：

$$
r_i^{\rm obs}:=\left\|u_i^0-y_i\right\|_2,\qquad r_i^{\rm phys}:=\left\|\mathcal R_i^0\right\|_2.\tag{4.2}
$$

二者合成为原始误差分

$$
e_i:=\omega_{\rm obs}r_i^{\rm obs}+\omega_{\rm phys}r_i^{\rm phys},\tag{4.3}
$$

其中 \(\omega_{\rm obs},\omega_{\rm phys}\ge0\) 控制数据失配与 PDE 违背的相对重要性。然后用中位数与中位绝对偏差对 \(\{e_i\}_{i=1}^{N}\) 归一化，得到无量纲的鲁棒分。令

$$
m:={\rm median}_{1\le i\le N}\,e_i,\qquad {\rm MAD}:={\rm median}_{1\le i\le N}\,|e_i-m|.
$$

设

$$
\mu:=m+\kappa\,{\rm MAD},\qquad \tilde e_i:=\frac{e_i-\mu}{{\rm MAD}+\delta},
$$

其中 \(\kappa\ge0\) 控制把样本视为非典型的阈值，\(\delta>0\) 为小稳定常数。最终能量分为

$$
E_i:=\rho(\tilde e_i),\qquad \rho(x)=\frac{x}{1+|x|}.\tag{4.4}
$$

\(E_i\) 的正值越大，说明该观测与第一阶段拟合及支配 PDE 越不一致。能量分由冻结的第一阶段参数 \((\theta_0,\Phi_0)\) 一次算出，并在第二阶段保持固定；保持固定使权重估计与参数更新解耦，避免"移动目标"目标函数。

### 4.2. 能量加权流匹配

第二阶段按能量分重加权观测条件流匹配损失。对每个观测 \((\xi_i,y_i)\) 赋权

$$
w_i:=w(E_i),
$$

其中 \(w:\mathbb R\to(0,1]\) 递减。实现中使用

$$
w(E)=\sigma(-\lambda E),\qquad \sigma(r)=\frac{1}{1+\exp(-r)},\tag{4.5}
$$

逆温度参数 \(\lambda>0\)。于是小能量观测获得接近 1 的权重，大能量观测被降权。利用这些权重定义 ERFM 目标

$$
\mathcal L_{\rm ERFM}(\theta,\Phi):=\mathbb E_{\substack{t\sim{\rm Unif}[0,1]\\(\xi_i,y_i)\sim p_{\rm data}\\\epsilon\sim p_0}}\left[w_i\left\|v_\theta\left(t,\bar s(t,\xi_i),\xi_i,a_\Phi(\xi_i)\right)-(y_i-\epsilon)\right\|_2^2\right].\tag{4.6}
$$

该重加权并不丢弃观测，而是改变每个样本对输运更新的贡献强度，削弱被冻结教师判为大能量观测的影响。

### 4.3. 重加权的解释

(4.6) 的第二阶段目标可解释为在重加权数据分布下的标准观测条件流匹配。能量权重不改变桥构造或输运动力学本身，而是改变微调期间观测上的有效采样测度。为精确表述，定义归一化权重

$$
\tilde w_i:=\frac{w_i}{\sum_{j=1}^{N}w_j},\qquad i=1,\ldots,N,\tag{4.7}
$$

并令

$$
\tilde p(i):=\tilde w_i\tag{4.8}
$$

表示观测索引上的相应经验分布。沿用第 2.3 节的桥构造 \(\bar s(t,\xi_i)=(1-t)\epsilon+ty_i\)（\(\epsilon\sim p_0\)、\(t\sim{\rm Unif}[0,1]\)），考虑从加权经验分布 \(\tilde p\) 采样观测索引所得的标准观测条件流匹配目标：

$$
\widetilde{\mathcal L}_{\rm CFM}(\theta,\Phi):=\mathbb E_{\substack{t\sim{\rm Unif}[0,1]\\i\sim\tilde p\\\epsilon\sim p_0}}\left[\left\|v_\theta\left(t,\bar s(t,\xi_i),\xi_i,a_\Phi(\xi_i)\right)-(y_i-\epsilon)\right\|_2^2\right].\tag{4.9}
$$

下述结果表明，ERFM 目标在正比例常数意义下等价于倾斜经验分布 \(\tilde p\) 下的标准观测条件流匹配。

**定理 4.1。** 设能量分 \(\{E_i\}_{i=1}^{N}\) 在第二阶段固定，\(w_i=w(E_i)>0\) 为相应权重。则 (4.6) 的 ERFM 目标满足

$$
\mathcal L_{\rm ERFM}(\theta,\Phi)=C_w\widetilde{\mathcal L}_{\rm CFM}(\theta,\Phi),\tag{4.10}
$$

其中

$$
C_w:=\frac1N\sum_{j=1}^{N}w_j>0.\tag{4.11}
$$

因此

$$
\nabla_{(\theta,\Phi)}\mathcal L_{\rm ERFM}(\theta,\Phi)=C_w\nabla_{(\theta,\Phi)}\widetilde{\mathcal L}_{\rm CFM}(\theta,\Phi),\tag{4.12}
$$

且两目标具有相同极小点。

**证明。** 对每个观测索引 \(i\)，定义

$$
\ell_i(\theta,\Phi):=\mathbb E_{\substack{t\sim{\rm Unif}[0,1]\\\epsilon\sim p_0}}\left[\left\|v_\theta\left(t,\bar s(t,\xi_i),\xi_i,a_\Phi(\xi_i)\right)-(y_i-\epsilon)\right\|_2^2\right].
$$

利用 (4.7)–(4.8) 的经验分布，加权流匹配目标 (4.9) 可写为

$$
\widetilde{\mathcal L}_{\rm CFM}(\theta,\Phi)=\sum_{i=1}^{N}\tilde w_i\ell_i(\theta,\Phi)=\frac{1}{\sum_{j=1}^{N}w_j}\sum_{i=1}^{N}w_i\ell_i(\theta,\Phi).
$$

另一方面，由 (4.6) 中经验期望的定义，

$$
\mathcal L_{\rm ERFM}(\theta,\Phi)=\frac1N\sum_{i=1}^{N}w_i\ell_i(\theta,\Phi).
$$

结合两恒等式得

$$
\mathcal L_{\rm ERFM}(\theta,\Phi)=\left(\frac1N\sum_{j=1}^{N}w_j\right)\widetilde{\mathcal L}_{\rm CFM}(\theta,\Phi),
$$

即证 (4.10)。由于能量分由冻结的第一阶段教师一次算出并在第二阶段保持固定，常数 \(C_w\) 与 \((\theta,\Phi)\) 无关；对 (4.10) 求导即得 (4.12)。因 \(C_w>0\)，两目标极小点相同。∎

定理 4.1 表明，ERFM 等价于在向低能量观测倾斜的经验分布下的标准观测条件流匹配。在这个意义上，第二阶段不修改输运机制本身，而是改变优化器所见的有效训练分布：被冻结第一阶段教师判为大能量的观测在微调中贡献较小，而与所学"物理—数据"结构更相容的观测获得更大权重。

该解释有自然的总体对应。令 \(Z=(\xi,y)\) 为服从 \(p_{\rm data}\) 的一般观测，\(E(Z)\) 为第一阶段教师诱导的冻结能量分。第二阶段目标的总体对应是加权风险

$$
\mathbb E_{Z\sim p_{\rm data}}\left[w(E(Z))\ell(\theta,\Phi;Z)\right],
$$

其中 \(\ell(\theta,\Phi;Z)\) 为与 \(Z\) 相关的观测条件流匹配被积函数。定义归一化常数

$$
C_w:=\int w(E(z))p_{\rm data}({\rm d}z),
$$

并假设 \(0<C_w<\infty\)。这诱导概率测度

$$
q({\rm d}z):=\frac{w(E(z))p_{\rm data}({\rm d}z)}{C_w},\tag{4.13}
$$

即原始数据分布的能量倾斜版本。在该定义下，

$$
\mathbb E_{Z\sim p_{\rm data}}\left[w(E(Z))\ell(\theta,\Phi;Z)\right]=C_w\mathbb E_{Z\sim q}\left[\ell(\theta,\Phi;Z)\right].
$$

因此总体层面，ERFM 在正比例常数意义下等价于倾斜分布 \(q\) 下的标准观测条件流匹配：第二阶段把有效训练分布集中到与第一阶段"物理—数据"结构更相容的观测上。

### 4.4. 第二阶段精化

实践中，第二阶段优化在能量加权流匹配项之外，加入与第一阶段相同的物理正则项，所得目标为

$$
\mathcal J_{\rm ERFM}(\theta,\Phi)=\mathcal L_{\rm ERFM}(\theta,\Phi)+\lambda_{\rm loc}\mathcal L_{\rm PDE,loc}(\theta,\Phi)+\lambda_{\rm PDE}\mathcal L_{\rm PDE}(\theta,\Phi)+\lambda_{\rm BC}^u\mathcal L_{\rm BC}^u(\theta,\Phi)+\lambda_{\rm BC}^a\mathcal L_{\rm BC}^a(\Phi),\tag{4.14}
$$

其中 \(\mathcal L_{\rm PDE,loc}\) 与 \(\mathcal L_{\rm PDE}\) 为 (3.4)、(3.7) 定义的局部与全局物理罚项。若第一阶段包含边界/初始条件罚项，相应项也可在第二阶段保留。\(\lambda_{\rm loc}\) 与 \(\lambda_{\rm PDE}\) 通常取与第一阶段相同的值。第二阶段并非从零重学完整物理引导模型，而是用能量加权观测损失精化第一阶段解：低能量观测对输运更新影响更大，高能量观测被降权；保留的物理罚项作为软约束，在微调中稳定输运动力学与恢复场。第二阶段从 PG-CFM 参数 \((\theta_0,\Phi_0)\) 初始化，并运行更少的优化步。结合第 4.3 节的重加权解释，这说明 ERFM 可视为物理知情精化阶段：把有效训练分布向与冻结教师更相容的观测倾斜，同时保留足够物理正则以防微调模型偏离第一阶段所学 PDE 结构。

**算法 4.1 第二阶段：ERFM 微调步（一个 minibatch）**

1. 输入：观测 minibatch \((\xi,y,E)\)；当前参数 \((\theta,\Phi)\)。
2. # 第二阶段由 \((\theta_0,\Phi_0)\) 初始化，能量 \(E\) 由冻结第一阶段模型经 (4.4) 预先计算。
3. 采样 \(t\sim{\rm Unif}[\varepsilon_{\rm fm},1-\varepsilon_{\rm fm}]\)、\(\epsilon\sim p_0\)。
4. \(s_t\leftarrow(1-t)\epsilon+ty\)（到含噪观测的桥）。
5. \(u_{\rm loc}\leftarrow{\rm FlowStep}(v_\theta,s_t,\xi,a_\Phi)\)。
6. \(w(E)=\sigma(-\lambda E)\)。
7. \(\mathcal L_{\rm ERFM}\leftarrow w\cdot\) FM 损失 \((v_\theta,s_t,y,\epsilon)\)（式 4.6）。
8. \(\mathcal L_{\rm PDE,loc}\leftarrow\) 局部 PDE 损失 \((u_{\rm loc},a_\Phi,\xi)\)。
9. \(u_{\rm loc}\leftarrow\Gamma_{t\to1}^{(K_1)}(s_t,\xi,a_\Phi(\xi);\theta)\)。
10. \(\mathcal J_{\rm ERFM}\leftarrow\mathcal L_{\rm ERFM}+\lambda_{\rm loc}\mathcal L_{\rm PDE,loc}+\lambda_{\rm PDE}\mathcal L_{\rm PDE}\)（式 4.14）。
11. 若保留边界或初始罚项，则
12. \(\mathcal J_{\rm ERFM}\leftarrow\mathcal J_{\rm ERFM}+\lambda_{\rm BC}^u\mathcal L_{\rm BC}^u+\lambda_{\rm BC}^a\mathcal L_{\rm BC}^a\)。
13. 用一步优化器更新 \((\theta,\Phi)\) 以最小化 \(\mathcal J_{\rm ERFM}\)。

## 5. 数值实验

我们在五个反问题上评估 PG-CFM-ERFM：Poisson 反问题（PInv）、Navier–Stokes 反问题（NSInv）、Heat 反问题（HInv）、Burgers 反问题（BInv）与 Wave 反问题（WInv）。这些例子覆盖椭圆、抛物与双曲 PDE，既含空间变化系数场，也含全局标量参数。主要定量与定性比较聚焦 PInv 与 NSInv，HInv、BInv、WInv 作为附加测试问题。

所有实验在三个随机种子上重复，报告均值 ± 标准差。主指标为相对 \(L_2\) 误差（L2RE）。令 \(\hat q=(\hat q_1,\ldots,\hat q_n)\) 与 \(q^\star=(q_1^\star,\ldots,q_n^\star)\) 分别表示测试网格上的预测与参考解：

$$
{\rm L2RE}(\hat q)=\frac{\left\|\hat q-q^\star\right\|_2}{\left\|q^\star\right\|_2}=\sqrt{\frac{\sum_{j=1}^{n}(\hat q_j-q_j^\star)^2}{\sum_{j=1}^{n}(q_j^\star)^2}}.\tag{5.1}
$$

我们还报告相对 \(L_1\) 误差（L1RE）、均方误差（MSE）与最大绝对误差（MAE）：

$$
{\rm L1RE}(\hat q)=\frac{\left\|\hat q-q^\star\right\|_1}{\left\|q^\star\right\|_1}=\frac{\sum_{j=1}^{n}\left|\hat q_j-q_j^\star\right|}{\sum_{j=1}^{n}\left|q_j^\star\right|},\tag{5.2}
$$

$$
{\rm MSE}(\hat q)=\frac1n\sum_{j=1}^{n}(\hat q_j-q_j^\star)^2,\tag{5.3}
$$

$$
{\rm MAE}(\hat q)=\max_{1\le j\le n}\left|\hat q_j-q_j^\star\right|.\tag{5.4}
$$

观测数据由参考解在固定网格或随机采样点上取值后加噪得到；内部配点用于 PDE 残差约束；施加边界或初始约束时，在相应约束集上额外采样。

### 5.1. 实验设置

#### 5.1.1. 基准任务与数据生成

**Poisson 反问题（PInv）。** 我们重建椭圆 PDE

$$
-\nabla\cdot\left(a(x,y)\nabla u(x,y)\right)=f(x,y),\qquad(x,y)\in\Omega=[0,1]^2\tag{5.5}
$$

中空间变化的扩散系数 \(a(x,y)\)。真值解为

$$
u(x,y)=\sin(\pi x)\sin(\pi y),\tag{5.6}
$$

源项选择为使 \((a,u)\) 在真值系数场

$$
a(x,y)=\frac{1}{1+x^2+y^2+(x-1)^2+(y-1)^2},\qquad(x,y)\in\Omega\tag{5.7}
$$

下满足该 PDE，即

$$
\begin{aligned}
f(x,y)={}&\frac{2\pi^2\sin(\pi x)\sin(\pi y)}{1+x^2+y^2+(x-1)^2+(y-1)^2}\\
&+\frac{2\pi\left((2x-1)\cos(\pi x)\sin(\pi y)+(2y-1)\sin(\pi x)\cos(\pi y)\right)}{\left(1+x^2+y^2+(x-1)^2+(y-1)^2\right)^2}.
\end{aligned}\tag{5.8}
$$

为确保可辨识性，我们在 \(\partial\Omega\) 上给定 \(a\) 的真实系数值作为其边界条件。

**训练数据。** 在 \(\Omega\) 内 \(50\times50\) 均匀网格上采集 \(N_D=2{,}500\) 个 \(u\) 的观测。对 60% 网格点用 i.i.d. 高斯噪声 \(\mathcal N(0,1.0)\) 污染，其余 40% 用 \(\mathcal N(0,0.01)\)。采样 \(N_R=8{,}192\) 个内部配点与 \(N_B=2{,}048\) 个边界点。**测试数据。** 在 \(100\times100\) 均匀网格上的无噪测试集（\(N_t=10{,}000\) 点）评估。

**Navier–Stokes 反问题（NSInv）。** 考虑时空域 \([1,8]\times[-2,2]\times[0,7]\) 上的二维不可压 Navier–Stokes 系统

$$
\begin{cases}u_t+\beta_1\left(uu_x+vu_y\right)=-p_x+\beta_2\left(u_{xx}+u_{yy}\right),\\ v_t+\beta_1\left(uv_x+vv_y\right)=-p_y+\beta_2\left(v_{xx}+v_{yy}\right),\\ u_x+v_y=0,\end{cases}\tag{5.9}
$$

采用 [24] 的圆柱绕流基准，真值系数为 \(\beta_1=1\)、\(\beta_2=0.01\)。反问题任务是从速度观测恢复 \((\beta_1,\beta_2)\) 与压力场 \(p(x,y,t)\)。**训练数据。** 从基准参考解中随机选取 \(N_D=5{,}000\) 个内部时空位置及其对应速度值，其中 60% 加性高斯噪声 \(\mathcal N(0,0.5)\)、其余 40% 用 \(\mathcal N(0,0.01)\)；另采样 \(N_R=2{,}000\) 个内部配点用于 PDE 残差约束。**测试数据。** 在未用于训练的其余无噪基准速度样本上测试。

**Heat 反问题（HInv）。** 重建抛物 PDE

$$
u_t(x,y,t)-\nabla\cdot\left(a(x,y)\nabla u(x,y,t)\right)=f(x,y,t),\qquad(x,y,t)\in[-1,1]^2\times[0,1]\tag{5.10}
$$

中空间变化的扩散系数 \(a(x,y)\)。真值解为

$$
u(x,y,t)=e^{-t}\sin(\pi x)\sin(\pi y),\tag{5.11}
$$

真值系数为

$$
a(x,y)=2+\sin(\pi x)\sin(\pi y),\qquad(x,y)\in[-1,1]^2,\tag{5.12}
$$

边界条件 \(a(x,y)=2\)（\(\partial\Omega\) 上）。强迫项 \(f\) 定义为使 \((a,u)\) 满足该 PDE：

$$
f(x,y,t)=\left[(4\pi^2-1)\sin(\pi x)\sin(\pi y)+\pi^2\left(2\sin^2(\pi x)\sin^2(\pi y)-\cos^2(\pi x)\sin^2(\pi y)-\sin^2(\pi x)\cos^2(\pi y)\right)\right]e^{-t}.\tag{5.13}
$$

**训练数据。** 在 \([-1,1]^2\times[0,1]\) 上均匀随机采样 \(N_D=2{,}500\) 个观测点，60% 用 \(\mathcal N(0,1.0)\)、40% 用 \(\mathcal N(0,0.01)\) 污染；使用 \(N_R=8{,}192\) 个残差点与 \(N_B=2{,}048\) 个边界/初始点。**测试数据。** 在 \([−1,1]^2\times[0,1]\) 上 \(60\times60\times50\) 的无噪均匀网格（\(N_t=180{,}000\) 点）评估。

**Burgers 反问题（BInv）。** 考虑 \((x,t)\in[-1,1]\times[0,1]\) 上的一维黏性 Burgers 方程

$$
u_t+uu_x=\nu u_{xx},\qquad(x,t)\in[-1,1]\times[0,1],\tag{5.14}
$$

黏度 \(\nu\) 未知。初始条件为

$$
u(x,0)=0.5-0.5\tanh(2.5x),\tag{5.15}
$$

Dirichlet 边界条件为

$$
u(-1,t)=0.5-0.5\tanh(2.5(-1-0.5t)),\qquad u(1,t)=0.5-0.5\tanh(2.5(1-0.5t)).\tag{5.16}
$$

对 \(\nu=0.1\)，解析解为

$$
u(x,t)=0.5-0.5\tanh(2.5(x-0.5t)).\tag{5.17}
$$

**训练数据。** 在 \([−1,1]\times[0,1]\) 的 \(200\times200\) 均匀网格上生成解值并随机选 \(N_D=10{,}000\) 点作为带标签观测，其中 60% 用 \(\mathcal N(0,1.0)\)、40% 用 \(\mathcal N(0,0.01)\) 污染；另采样 \(N_R=2{,}000\) 个内部配点、\(\{t=0\}\) 上 \(N_I=100\) 个初始条件点、\(\{x=-1,1\}\) 上 \(N_B=200\) 个边界点。**测试数据。** 其余网格点作为无噪测试集。

**一维 Wave 反问题（WInv）。** 考虑 \((x,t)\in[0,1]\times[0,1]\) 上波速 \(c\) 未知的 1D 波动方程

$$
u_{tt}(x,t)-c^2u_{xx}(x,t)=0.\tag{5.18}
$$

初始与边界条件为 \(u(x,0)=\sin(\pi x)+\frac12\sin(4\pi x)\)、\(u_t(x,0)=0\)、\(u(0,t)=u(1,t)=0\)。对 \(c=2\)，解析解为 \(u(x,t)=\sin(\pi x)\cos(c\pi t)+\frac12\sin(4\pi x)\cos(4c\pi t)\)。**训练数据。** 在 \([0,1]\times[0,1]\) 的 \(200\times200\) 均匀网格上生成数据并随机选 \(N_D=10{,}000\) 点训练（60% 用 \(\mathcal N(0,1.0)\)、40% 用 \(\mathcal N(0,0.01)\) 污染），采样 \(N_R=2{,}000\) 个内部配点、\(N_I=100\) 个初始点与 \(N_B=200\) 个边界点。**测试数据。** 其余网格点作为无噪测试集。

#### 5.1.2. 消融设置

对物理项放置消融，比较 CFM（\(\lambda_{\rm loc}=\lambda_{\rm PDE}=0\)）、仅局部损失的 PG-CFM（CFM-\(\ell\)，\(\lambda_{\rm loc}>0\)、\(\lambda_{\rm PDE}=0\)）、仅全局损失的 PG-CFM（CFM-g，\(\lambda_{\rm loc}=0\)、\(\lambda_{\rm PDE}>0\)）以及两个物理损失都激活的 PG-CFM，以分离桥局部项与全局物理项各自的贡献。对第二阶段重加权消融，所有方法从同一训练好的第一阶段 PG-CFM 模型出发、使用相同第二阶段优化预算，比较 ERFM 与继续训练 PG-CFM 及标签精化对照（见下文基线描述），以把能量重加权的作用与"额外优化"或"用第一阶段预测替换含噪标签"区分开。

鲁棒性消融以 NSInv 为代表基准，考察污染模型三方面：污染比例 \(\rho\)、污染噪声尺度 \(\sigma_{\rm bad}\) 与噪声类型。研究污染比例时固定 \(\sigma_{\rm bad}=0.5\)、令 \(\rho\in\{0.2,0.4,0.6,0.8,1.0\}\)；研究噪声尺度时固定 \(\rho=0.6\)、令 \(\sigma_{\rm bad}\in\{0.1,0.3,0.5,0.7,0.9\}\)；研究噪声类型时考虑高斯、Laplace、Student-\(t\)、均匀与离群混合噪声。Laplace 分布尺度设为 \(b=\sigma/\sqrt2\)；Student-\(t\) 取 \(\nu=3\)；均匀噪声取 \({\rm Unif}(-\sqrt3\sigma,\sqrt3\sigma)\) 使方差为 \(\sigma^2\)；离群混合定义为以 0.1 概率从 \(\mathcal N(0,2.02)\) 抽取、否则从 \(\mathcal N(0,\sigma^2)\) 抽取。

#### 5.1.3. 基线

除另有说明，所有基线给定相同观测集、污染协议与可用配点/边界/初始数据。对基于网格的生成基线，先把相同观测插值到其架构要求的规则网格上。

**PINN。** 原始 PINN 基线 [24] 学习直接由坐标到状态的映射连同未知系数场（或标量参数），最小化由数据失配项、PDE 残差项与边界/初始条件罚项组成的复合目标。**R-PINN。** 使用与 PINN 相同的架构与训练数据，但用鲁棒 Huber 型罚项 [22] 替换二次数据失配项，以隔离 PINN 框架内损失级鲁棒化的作用。**B-PINN。** [34] 使用相同 PINN 表述，但以贝叶斯方式处理网络参数并通过后验平均形成预测，作为相同数据与物理约束下的概率 PINN 基线。**CFM。** 使用与本方法相同的观测条件桥构造，但只用流匹配损失 \(\mathcal L_{\rm CFM}\) 训练、不含 PDE 正则化，以隔离物理项贡献。**PG-CFM。** 本方法的第一阶段版本：使用相同基于坐标的流模型与观测，但只以 (3.10) 的物理引导目标训练，不含第二阶段能量精化。**SD-PG-CFM 与 SF-PG-CFM。** SD-PG-CFM（自蒸馏 PG-CFM）用训练好的第一阶段 PG-CFM 预测所得标签替换含噪观测并在这些精化标签上重训 PG-CFM；SF-PG-CFM（自精化 PG-CFM）使用相同精化标签但从第一阶段参数继续优化而非从零重训。这些对照用于把第二阶段重加权的作用与单纯标签精化的作用分离。**继续训练 PG-CFM。** 我们还考虑相同第二阶段优化预算但无能量重加权（即均匀样本权重）的 PG-CFM 继续训练版本，以隔离重加权相对单纯额外优化的作用。**PIDM 与 PBFM。** 对主要 PInv 与 NSInv 基准，额外比较基于网格的生成物理基线 PIDM（含 PIDM-ME 与 PIDM-SE 两个变体）[3] 与 PBFM [2]。这些方法在同一反问题实例上训练并使用相同含噪观测，但与本文基于坐标的表述不同，它们要求先把稀疏观测插值到规则网格再训练，从而说明依赖网格的生成基线在同一污染反问题设定下的表现。

#### 5.1.4. 实现细节与训练设置

模型由时变向量场 \(v_\theta\) 与系数网络 \(a_\Phi\) 或可训练标量参数（取决于基准）组成。对时间相关问题，\(t\) 表示流时间、\(\tau\) 表示物理时间变量。向量场输入为当前状态、流时间、物理坐标以及适用时的问题相关输入。各基准的网络参数化见表 1。对每个训练对 \((\xi,y)\)，采样 \(\epsilon\sim p_0=\mathcal N(0,I)\)、\(t\sim{\rm Unif}[\varepsilon_{\rm fm},1-\varepsilon_{\rm fm}]\)，构造桥 \(s(t,\xi)=(1-t)\epsilon+ty\)，目标速度为 \(y-\epsilon\)。局部与全局物理项用定步长 Heun 积分评估：局部项从采样桥时间 \(t\) 到 1 用 \(K_1\) 步；全局项从 0 到 1 用 \(K_2\) 步、从确定性基状态 \(u_{\rm base}=0\) 出发。全局物理项与边界/初始条件项每 10 个优化步评估一次。第一阶段最小化 PG-CFM 目标 (3.10)，第二阶段从第一阶段参数初始化并最小化 ERFM 目标 (4.14)。能量分由冻结第一阶段模型一次算出，经中位数与中位绝对偏差归一化，再转换为权重 \(w_i=\sigma(-\lambda E_i)\)。两阶段均使用 Adam。各基准的积分设置与训练超参见表 2。

超参数按阶段选择：第一阶段调节物理权重 \((\lambda_{\rm loc},\lambda_{\rm PDE})\) 以获得稳定基线模型；第二阶段默认取 \(\omega_{\rm obs}=1.0\)、\(\omega_{\rm phys}=0.1\)，仅当 PDE 残差项相对较大时减小 \(\omega_{\rm phys}\)；多数实验中还默认取 \(\kappa=0.5\)、\(\lambda=5\)。跨基准的主要差异在局部与全局物理罚项权重，以及第二阶段能量分中 \(\omega_{\rm obs}\)、\(\omega_{\rm phys}\) 的少量调整。

**表 1（原文 Table 1）：PG-CFM-ERFM 中使用的神经参数化。对时间相关问题，\(t\) 表示流时间、\(\tau\) 表示物理时间变量。**

| 基准 | 网络 | 映射 | 架构 |
|---|---|---|---|
| NSInv | \(v_\theta\) | \((u,v,t,x,y,\tau)\mapsto\mathbb R^2\) | 3 层 MLP，宽度 256，SiLU |
| NSInv | \(p_\Phi\) | \((x,y,\tau)\mapsto\mathbb R\) | 4 层 MLP，宽度 256，SiLU |
| NSInv | \((\beta_1,\beta_2)\) | 可训练标量 | – |
| PInv | \(v_\theta\) | \((u,t,x,y,f)\mapsto\mathbb R\) | 3 层 MLP，宽度 64，SiLU |
| PInv | \(a_\Phi\) | \((x,y)\mapsto\mathbb R\) | 4 层 MLP，宽度 64，SiLU |
| HInv | \(v_\theta\) | \((u,t,x,y,\tau,a_\Phi,f)\mapsto\mathbb R\) | 6 层 MLP，宽度 128，Tanh |
| HInv | \(a_\Phi\) | \((x,y)\mapsto\mathbb R\) | 4 层 MLP，宽度 128，Tanh |
| WInv | \(v_\theta\) | \((u,t,x,\tau)\mapsto\mathbb R\) | 3 层 MLP，宽度 256，SiLU |
| WInv | \(c\) | 可训练标量 | – |
| BInv | \(v_\theta\) | \((u,t,x,\tau,f)\mapsto\mathbb R\) | 3 层 MLP，宽度 64，SiLU |
| BInv | \(\nu\) | 可训练标量 | – |

**表 2（原文 Table 2）：PG-CFM-ERFM 的各基准积分设置与训练超参数（"lr" 表示学习率）。**

| 基准 | \(K_1\) | \(K_2\) | 第一阶段 lr | 第一阶段 epochs | 第二阶段 lr | 第二阶段 epochs | \(\lambda\) | \(\kappa\) | \(\omega_{\rm phys}\) |
|---|---|---|---|---|---|---|---|---|---|
| NSInv | 5 | 10 | \(10^{-3}\) | 5000 | \(10^{-3}\) | 1000 | 5.0 | 0.5 | 0.10 |
| PInv | 5 | 10 | \(10^{-3}\) | 7000 | \(10^{-4}\) | 1000 | 5.0 | 0.5 | 0.05 |
| HInv | 10 | 10 | \(10^{-3}\) | 3600 | \(10^{-3}\) | 500 | 1.0 | 0.0 | 0.10 |
| WInv | 10 | 10 | \(10^{-3}\) | 5000 | \(2\times10^{-4}\) | 3000 | 5.0 | 0.5 | 0.10 |
| BInv | 10 | 10 | \(10^{-3}\) | 5000 | \(10^{-3}\) | 1000 | 5.0 | 0.5 | 0.01 |

### 5.2. 核心反问题的主要结果

#### 5.2.1. PInv 与 NSInv 的定量比较

表 3、表 4 以三个随机种子的均值 ± 标准差汇总混合污染下 PInv 与 NSInv 的定量结果。

**表 3（原文 Table 3）：PInv 系数恢复的误差指标均值 ± 标准差（三个随机种子）。**

| 指标 | PG-CFM-ERFM | PG-CFM | CFM | PINN | R-PINN | B-PINN | PBFM | PIDM-ME | PIDM-SE |
|---|---|---|---|---|---|---|---|---|---|
| L2RE | **1.95E-2** ± 1.62E-2 | 2.61E-2 ± 2.55E-2 | 1.91E-1 ± 3.05E-3 | 5.63E-2 ± 1.49E-2 | 5.43E-2 ± 5.84E-3 | 3.27E-1 ± 1.89E-1 | 1.02E+0 ± 3.05E-2 | 6.58E-1 ± 8.00E-2 | 9.84E-1 ± 1.88E-2 |
| L1RE | **1.55E-2** ± 1.34E-2 | 2.13E-2 ± 2.12E-2 | 1.57E-1 ± 2.53E-3 | 4.56E-2 ± 1.46E-2 | 4.19E-2 ± 5.41E-3 | 2.85E-1 ± 1.80E-1 | 1.00E+0 ± 7.15E-3 | 6.03E-1 ± 4.43E-2 | 9.84E-1 ± 1.86E-2 |
| MSE | **1.04E-4** ± 1.43E-4 | 2.09E-4 ± 3.17E-4 | 6.82E-3 ± 2.17E-4 | 6.33E-4 ± 3.43E-4 | 5.58E-4 ± 1.17E-4 | 2.66E-2 ± 2.50E-2 | 1.94E-1 ± 1.17E-2 | 8.19E-2 ± 2.04E-2 | 1.80E-1 ± 6.85E-3 |
| MAE | **1.72E-2** ± 1.26E-2 | 2.22E-2 ± 2.01E-2 | 1.59E-1 ± 2.49E-3 | 5.61E-2 ± 8.81E-3 | 5.69E-2 ± 1.08E-2 | 2.63E-1 ± 1.05E-1 | 8.73E-1 ± 5.75E-1 | 2.59E-1 ± 1.90E-2 | 4.23E-1 ± 8.00E-3 |

在 PInv 上，PG-CFM-ERFM 取得最低的 L2RE、L1RE、MSE 与 MAE，MSE 降至 1.04E−4。CFM 在受污染标签下差得多，PINN 类基线精度较低：其中 R-PINN 相对 PINN 仅有边际且不均衡的改善，而 B-PINN 呈现最大的平均误差与方差。基于网格的生成基线 PIDM 与 PBFM 也显著差于所提方法，这反映出把稀疏、离格观测插值到规则网格后处理的困难。

在 NSInv 上，PG-CFM-ERFM 把 L2RE 从 CFM 的 3.17E+1 降至 4.06E−1，并明显优于 PINN、R-PINN 与 B-PINN。与 PIDM、PBFM 相比，PG-CFM-ERFM 在所有报告指标上取得更低平均误差，相对误差与 MSE 指标上的优势最明显，与 PIDM 的 MAE 差距较小。CFM 与 PG-CFM 的差异说明：在所测污染设定下加入 PDE 残差罚项能显著改善该基准；从 PG-CFM 到 PG-CFM-ERFM 的进一步降低，与"对冻结第一阶段模型判为大能量观测降权"的效果一致。这些结果也凸显无网格坐标表述的优势：PG-CFM-ERFM 直接使用不规则观测，而 PIDM、PBFM 依赖网格插值且不含样本自适应抑制受污染测量的内在机制。

表 5 报告 NSInv 系数 \((\beta_1,\beta_2)\) 的恢复误差。相对 CFM，PG-CFM 与 PG-CFM-ERFM 都显著降低系数误差；PG-CFM-ERFM 对 \(\beta_2\) 给出最低 MSE，并在多数基线上改善 \(\beta_1\) 的恢复（尽管 R-PINN 对 \(\beta_1\) 给出最小 MSE）。结合表 4，这些结果表明所提方法在该问题的压力恢复与系数辨识两方面都保持竞争力。

**表 4（原文 Table 4）：NSInv 压力恢复的误差指标均值 ± 标准差。**

| 指标 | PG-CFM-ERFM | PG-CFM | CFM | PINN | R-PINN | B-PINN | PBFM | PIDM-ME | PIDM-SE |
|---|---|---|---|---|---|---|---|---|---|
| L2RE | **4.06E-1** ± 4.75E-2 | 5.75E-1 ± 7.38E-2 | 3.17E+1 ± 7.90E+0 | 3.44E+0 ± 1.09E+0 | 3.58E+0 ± 2.24E+0 | 1.99E+0 ± 1.84E-1 | 1.01E+0 ± 4.50E-3 | 1.55E+0 ± 2.00E-1 | 1.50E+0 ± 3.82E-1 |
| L1RE | **4.26E-1** ± 6.13E-2 | 5.98E-1 ± 7.81E-2 | 3.33E+1 ± 9.27E+0 | 3.80E+0 ± 8.43E-1 | 4.86E+0 ± 3.30E+0 | 2.26E+0 ± 1.98E-1 | 1.03E+0 ± 3.28E-3 | 2.01E+0 ± 2.52E-1 | 1.93E+0 ± 5.16E-1 |
| MSE | **1.78E-3** ± 4.05E-4 | 3.56E-3 ± 9.18E-4 | 1.12E+1 ± 5.30E+0 | 2.73E-1 ± 1.47E-1 | 3.10E-1 ± 3.19E-1 | 1.21E+0 ± 2.26E-1 | 1.96E-2 ± 1.74E-4 | 4.23E-2 ± 1.06E-2 | 4.16E-2 ± 1.87E-2 |
| MAE | **1.70E-1** ± 3.00E-2 | 2.34E-1 ± 3.56E-2 | 1.21E+1 ± 2.06E+0 | 3.46E+0 ± 1.03E+0 | 1.44E+0 ± 2.48E-1 | 3.86E+0 ± 1.82E-1 | 5.35E-1 ± 8.70E-3 | 1.83E-1 ± 2.30E-2 | 1.76E-1 ± 4.70E-2 |

**表 5（原文 Table 5）：恢复的 NSInv 系数 \(\beta_1\)、\(\beta_2\) 的 MSE 均值 ± 标准差（真值 \(\beta_1=1.0\)、\(\beta_2=0.01\)）。**

| 方法 | PG-CFM-ERFM | PG-CFM | CFM | PINN | R-PINN | B-PINN | PBFM | PIDM-ME | PIDM-SE |
|---|---|---|---|---|---|---|---|---|---|
| \(\beta_1\) | 1.27E-2 ± 1.36E-3 | 6.47E-2 ± 1.80E-3 | 2.57E-1 ± 1.50E-2 | 2.47E-1 ± 8.49E-2 | **3.11E-3** ± 1.69E-3 | 5.30E-2 ± 2.30E-2 | 1.00E+0 ± 4.07E-4 | 2.30E-1 ± 3.52E-2 | 9.88E-1 ± 3.82E-3 |
| \(\beta_2\) | **3.53E-6** ± 4.70E-6 | 9.00E-6 ± 1.35E-5 | 1.10E-4 ± 2.56E-5 | 5.02E-4 ± 4.54E-4 | 2.79E-5 ± 6.68E-6 | 8.85E-5 ± 1.38E-5 | 1.00E-4 ± 1.10E-6 | 1.00E-4 ± 6.00E-8 | 1.00E-4 ± 9.68E-8 |

#### 5.2.2. 定性比较

图 2 与图 3 给出 PInv 与 NSInv 的代表性重建。两个问题上，CFM 在混合污染下产生可见的结构误差；PG-CFM 更准确地恢复整体结构，PG-CFM-ERFM 进一步减少局部伪影，重建在视觉上更接近参考解。PINN 类基线对受污染观测更敏感：两个基准上 PINN 都呈现可见偏差，R-PINN 减少部分伪影，B-PINN 仍有明显伪影。这些视觉趋势与表 3、表 4 的定量结果一致。

**图 2（原文 Fig. 2）：** PInv 系数场 \(a\) 的代表性重建。子图 (a)–(c) 分别为 CFM、PG-CFM 与 PG-CFM-ERFM 的结果；(d) 为真值；(e)–(g) 为 PINN、B-PINN 与 R-PINN。

**图 3（原文 Fig. 3）：** NSInv 压力场 \(p\) 的代表性重建。子图 (a)–(c) 分别为 CFM、PG-CFM 与 PG-CFM-ERFM 的结果；(d) 为真值；(e)–(g) 为 PINN、B-PINN 与 R-PINN。

### 5.3. 附加反问题与鲁棒性

#### 5.3.1. 附加反问题

我们还报告 HInv、BInv 与 WInv 的结果（见表 6–8）。这些问题上 PG-CFM-ERFM 的报告误差低于 PG-CFM 与 CFM，并在所报告的场或参数恢复指标上优于基于网格的生成基线。

在 HInv 上，PG-CFM-ERFM 在所有报告指标上取得最准确的系数恢复：相对 PG-CFM 把 L2RE 从 9.28E−2 降至 5.17E−2、MSE 从 3.64E−2 降至 1.13E−2；与 CFM 的差距更大，说明纯数据驱动输运对污染尤为敏感；基于网格的生成基线同样显著更差。在 BInv 与 WInv（反问题任务是恢复标量参数）上，PG-CFM-ERFM 再次给出最低 MSE 与最小或接近最小的方差；PIDM 与 PBFM 基线精度较低，PINN 类基线也仍落后于所提方法。综合来看，这些结果表明路径级物理引导与基于能量的精化的组合在椭圆、抛物与双曲反问题上都保持有效。

**表 6（原文 Table 6）：HInv 系数恢复的误差指标均值 ± 标准差。**

| 指标 | PG-CFM-ERFM | PG-CFM | CFM | PINN | R-PINN | B-PINN | PIDM-ME | PIDM-SE | PBFM |
|---|---|---|---|---|---|---|---|---|---|
| L2RE | **5.17E-2** ± 4.73E-4 | 9.28E-2 ± 1.33E-3 | 1.78E-1 ± 2.30E-2 | 1.31E-1 ± 1.16E-2 | 1.37E-1 ± 8.86E-3 | 1.92E-1 ± 1.74E-2 | 3.05E-1 ± 1.51E-1 | 4.65E-1 ± 1.00E-1 | 2.66E-1 ± 3.00E-2 |
| L1RE | **3.95E-2** ± 3.92E-4 | 6.56E-2 ± 8.64E-4 | 1.45E-1 ± 2.45E-2 | 1.01E-1 ± 1.06E-2 | 1.08E-1 ± 7.89E-3 | 1.60E-1 ± 1.63E-2 | 2.52E-1 ± 1.28E-1 | 4.18E-1 ± 1.08E-1 | 2.17E-1 ± 1.93E-2 |
| MSE | **1.13E-2** ± 2.16E-4 | 3.64E-2 ± 1.01E-3 | 1.37E-1 ± 3.39E-2 | 7.31E-2 ± 1.25E-2 | 7.96E-2 ± 1.05E-2 | 1.58E-1 ± 2.80E-2 | 4.92E-1 ± 3.83E-1 | 9.61E-1 ± 3.66E-1 | 3.04E-1 ± 7.03E-2 |
| MAE | **7.88E-2** ± 8.50E-4 | 1.31E-1 ± 1.61E-3 | 1.33E+0 ± 5.02E-1 | 2.03E-1 ± 2.12E-2 | 2.17E-1 ± 1.58E-2 | 3.19E-1 ± 3.26E-2 | 5.05E-1 ± 2.56E-1 | 8.35E-1 ± 2.17E-1 | 1.23E+0 ± 2.08E-1 |

**表 7（原文 Table 7）：BInv 上辨识黏度 \(\nu\) 的 MSE 均值 ± 标准差。**

| 方法 | PG-CFM-ERFM | PG-CFM | CFM | PINN | R-PINN | B-PINN | PIDM-ME | PIDM-SE | PBFM |
|---|---|---|---|---|---|---|---|---|---|
| MSE | **3.63E-5** ± 2.77E-5 | 1.89E-4 ± 1.65E-4 | 3.96E-3 ± 3.51E-3 | 1.96E-4 ± 1.74E-4 | 2.21E-4 ± 1.63E-4 | 2.01E-4 ± 1.85E-4 | 3.72E-1 ± 3.00E-4 | 3.53E-1 ± 4.15E-3 | 1.31E-1 ± 1.70E-1 |

**表 8（原文 Table 8）：WInv 上辨识波速 \(c\) 的 MSE 均值 ± 标准差。**

| 方法 | PG-CFM-ERFM | PG-CFM | CFM | PINN | R-PINN | B-PINN | PIDM-ME | PIDM-SE | PBFM |
|---|---|---|---|---|---|---|---|---|---|
| MSE | **5.47E-3** ± 5.03E-3 | 1.91E-2 ± 8.15E-3 | 1.45E+0 ± 1.76E-2 | 3.95E-2 ± 2.03E-3 | 1.00E-2 ± 5.36E-3 | 2.78E-2 ± 2.35E-3 | 4.91E-1 ± 1.23E-3 | 5.20E-1 ± 4.52E-3 | 7.46E-1 ± 2.70E-1 |

#### 5.3.2. 噪声与污染下的鲁棒性

接下来报告多种污染设定与控制比较下的鲁棒性结果（除另有说明，均为三个随机种子的 L2RE 均值 ± 标准差）。图 4(a) 比较物理项的不同放置方式（PIDM、PBFM、CFM、CFM-\(\ell\)、CFM-g 与 PG-CFM），该实验中局部 PDE 权重固定为 0.001。PG-CFM 在所测设定下给出最低误差与最稳定表现，说明桥局部正则化与全域配点提供互补信息。图 4(b) 比较 PG-CFM-ERFM 与继续训练、标签精化对照：所提方法在 PInv 与 NSInv 上持续优于这些替代方案，说明第二阶段增益不能仅由额外优化解释，而来自能量重加权本身。

图 5(a)、5(b) 显示变化污染比例 \(\rho\) 与污染噪声尺度 \(\sigma_{\rm bad}\) 对 NSInv 的影响。在污染比例扫描中，PG-CFM-ERFM 在 \(\rho\le0.8\) 时误差低于 PG-CFM，而在 \(\rho=1.0\)（全部观测都被污染）时差距消失；这与"该极端情形下不再有干净观测子集、第一阶段能量难以可靠识别可信样本"的事实一致。在噪声尺度扫描中，PG-CFM-ERFM 在所测 \(\sigma_{\rm bad}\) 范围内始终比 PG-CFM 更准确。两种扫描中 PINN 类基线误差与波动都显著更大。最后我们评估不同噪声律下的鲁棒性（高斯、Laplace、Student-\(t\)、均匀与离群混合）。图 6 表明 PG-CFM-ERFM 在所有测试分布下都是最稳定的方法，尤其在重尾 Student-\(t\) 噪声（大离群点比高斯污染更频繁）下仍保持稳定。这些结果表明重加权准则并不局限于主比较所用的高斯污染模型。

**图 4（原文 Fig. 4）：消融 A 与 B。子图 (a) 比较把物理信息纳入流模型的不同方式；(b) 比较 ERFM 与继续训练及标签精化对照。**

**图 5（原文 Fig. 5）：消融 C 与 D：NSInv 上对污染幅度的鲁棒性。**

**图 6（原文 Fig. 6）：消融 E：NSInv 上不同噪声分布下的性能。**

### 5.4. 敏感性与计算诊断

#### 5.4.1. 对 ERFM 超参数的敏感性

我们考察 ERFM 对两个主要超参数的敏感性：加权函数 \(w(E)=\sigma(-\lambda E)\) 中的逆温度 \(\lambda\)，以及鲁棒能量归一化中的阈值参数 \(\kappa\)。图 7 报告两个参数扫描下的 NSInv 结果。方法在所测范围内相当稳定：较小的 \(\kappa\) 往往给出更低重建误差；误差随 \(\lambda\) 从小值增大而下降、随后趋于平台。总体上，结果表明第二阶段重加权对这两个参数的适度变化并不高度敏感。

#### 5.4.2. 对数值积分与残差评估的敏感性

我们进一步研究方法对局部与全局物理损失所用数值近似的敏感性。图 8 显示 NSInv 中变化 Heun 步数 \(K_1\)、\(K_2\) 的影响。在所测取值上，PG-CFM-ERFM 始终比 PG-CFM 更准确，且两种方法随积分深度变化的趋势相似，说明第二阶段增益不依赖于特定 Heun 步数选择。

为进一步评估第二阶段加权是否具有物理意义，图 9 比较真值观测误差与冻结第一阶段模型产生的能量分。高能量区域大体与受强污染观测重合，支持在该实验中使用"物理—数据能量"作为样本重加权准则。由于该分数由冻结第一阶段模型计算，它结合了观测失配与 PDE 残差信息，给出数据差异与物理不一致的联合诊断。

**图 7（原文 Fig. 7）：ERFM 在 NSInv 上对超参数 \(\kappa\) 与 \(\lambda\) 的敏感性。报告重建误差（L2RE，三个种子的均值 ± 标准差）随鲁棒归一化阈值 \(\kappa\) 与逆温度 \(\lambda\) 的变化。**

**图 8（原文 Fig. 8）：对局部与全局物理损失所用 Heun 步数的敏感性（NSInv）。L2RE（均值 ± 标准差）随 \(K_1\) 与 \(K_2\) 的变化。**

**图 9（原文 Fig. 9）：NSInv 上观测误差与第一阶段能量分的比较。高能量区域与受强污染观测重合。**

#### 5.4.3. 计算成本

表 9 报告 NSInv 上的运行时间与峰值 GPU 显存。报告的训练时间是各方法达到最终结果所需成本，而非共同 epoch 或步数预算下的成本。PG-CFM-ERFM 比 CFM 与基于网格的生成基线更昂贵，但其训练时间与 PINN 类方法同量级；ERFM 相对 PG-CFM 只增加适度开销，这与其作为短第二阶段精化而非第二次完整训练的作用一致。这些结果应与表 4、表 5 一起解读：CFM 与基于网格的生成基线在该实验中更便宜，但在所测受污染观测下重建或系数误差更大，而 PG-CFM-ERFM 以额外训练成本换取更好的反问题恢复。

**表 9（原文 Table 9）：NSInv 上代表性学习方法在 NVIDIA RTX 3090 Ti GPU 上的运行时间与峰值 GPU 显存。报告的训练时间是各方法达到最终结果所需成本，而非共同 epoch 或步数预算下的成本。**

| 方法 | 训练时间 (s) | 推理时间 (s) | 训练峰值显存 (MB) | 推理峰值显存 (MB) |
|---|---|---|---|---|
| PG-CFM-ERFM | 1.32E+3 | 4.24E-3 | 1.44E+3 | 1.91E+2 |
| PG-CFM | 1.01E+3 | 4.13E-3 | 1.44E+3 | 1.57E+2 |
| CFM | 1.97E+1 | 4.84E-3 | 1.24E+2 | 3.32E+2 |
| PINN | 1.20E+3 | 5.12E-3 | 1.56E+2 | 2.86E+2 |
| R-PINN | 8.48E+2 | 5.09E-3 | 1.56E+2 | 2.86E+2 |
| B-PINN | 6.63E+2 | 2.36E-1 | 1.64E+2 | 4.88E+2 |
| PBFM | 2.16E+2 | 9.66E-3 | 1.08E+2 | 1.08E+2 |
| PIDM-ME | 6.72E+1 | 1.20E-1 | 2.63E+3 | 1.03E+3 |
| PIDM-SE | 5.41E+1 | 7.43E-2 | 2.65E+3 | 1.04E+3 |

## 6. 结论

我们提出一种面向稀疏、含噪且被污染观测下 PDE 反问题的两阶段无网格流匹配方法。第一阶段 PG-CFM 引入物理引导条件流匹配：把观测条件输运与沿短求解器积分轨迹的强形式残差罚项、以及间歇的全局配点约束相结合。第二阶段 ERFM 使用冻结的第一阶段教师构造"物理—数据能量分"，重加权观测条件流匹配损失以削弱与 PDE 不一致样本的影响。我们证明 ERFM 等价于在教师诱导的重加权经验分布下进行观测条件流匹配，从而把第二阶段解释为分布重加权步骤而非完整重训练过程。

在异质污染与重尾噪声下的五个基准上，PG-CFM-ERFM 相对 PINN 类基线、标准 CFM 与竞争生成基线持续改善场与系数恢复。消融进一步表明：ERFM 的改善不能仅归因于额外优化；桥局部与全局物理损失在第一阶段模型中起互补作用。

当前表述有两个主要局限。第一，物理引导损失依赖定步长显式 Heun 积分，效率高但在刚性区间可能不可靠。第二，ERFM 的效果依赖第一阶段教师产生有信息量能量分的能力；在极端严重污染下，相对可靠观测与受污染观测之间的分离可能退化。未来工作将考虑用于路径物理损失的隐式或自适应积分器、更复杂的边界与初始算子及多物理耦合，以及在更高维或实验设定、更强模型失配与结构化污染下的大规模评估。

## 参考文献（英文原书目）

[1] S. Arridge, P. Maass, O. Öktem, and C.-B. Schönlieb, Solving inverse problems using data-driven models, Acta Numerica, 28 (2019), pp. 1–174.

[2] G. Baldan, Q. Liu, A. Guardone, and N. Thuerey, Flow matching meets PDEs: A unified framework for physics-constrained generation, arXiv preprint arXiv:2506.08604, (2025).

[3] J.-H. Bastek, W. Sun, and D. Kochmann, Physics-informed diffusion models, in The Thirteenth International Conference on Learning Representations, 2025.

[4] S. Basu, P. Pope, and S. Feizi, Influence functions in deep learning are fragile, in International Conference on Learning Representations, 2021.

[5] A. G. Baydin, B. A. Pearlmutter, A. A. Radul, and J. M. Siskind, Automatic differentiation in machine learning: a survey, Journal of Machine Learning Research, 18 (2018), pp. 1–43.

[6] H. Ben-Hamu, O. Puny, I. Gat, B. Karrer, U. Singer, and Y. Lipman, D-Flow: Differentiating through flows for controlled generation, in Forty-first International Conference on Machine Learning, 2024.

[7] M. Benning and M. Burger, Modern regularization methods for inverse problems, Acta Numerica, 27 (2018), pp. 1–111.

[8] R. T. Chen, Y. Rubanova, J. Bettencourt, and D. K. Duvenaud, Neural ordinary differential equations, Advances in Neural Information Processing Systems, 31 (2018).

[9] C. Cheng, B. Han, D. C. Maddix, A. F. Ansari, A. Stuart, M. W. Mahoney, and B. Wang, Gradient-free generation for hard-constrained systems, in The Thirteenth International Conference on Learning Representations, 2025.

[10] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, Diffusion posterior sampling for general noisy inverse problems, in The Eleventh International Conference on Learning Representations, 2023.

[11] P. Dhariwal and A. Nichol, Diffusion models beat GANs on image synthesis, Advances in Neural Information Processing Systems, 34 (2021), pp. 8780–8794.

[12] S. Duan, W. Wu, P. Hu, Z. Ren, D. Peng, and Y. Sun, CoPINN: Cognitive physics-informed neural networks, in Forty-second International Conference on Machine Learning, 2025.

[13] A. Ghosh, H. Kumar, and P. S. Sastry, Robust loss functions under label noise for deep neural networks, in Proceedings of the AAAI Conference on Artificial Intelligence, vol. 31, 2017.

[14] J. Ho, A. Jain, and P. Abbeel, Denoising diffusion probabilistic models, Advances in Neural Information Processing Systems, 33 (2020), pp. 6840–6851.

[15] J. Huang, G. Yang, Z. Wang, and J. J. Park, DiffusionPDE: Generative PDE-solving under partial observation, in The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.

[16] V. Isakov, Inverse Problems for Partial Differential Equations, vol. 127, Springer, 2017.

[17] G. E. Karniadakis, I. G. Kevrekidis, L. Lu, P. Perdikaris, S. Wang, and L. Yang, Physics-informed machine learning, Nature Reviews Physics, 3 (2021), pp. 422–440.

[18] E. Li, Z. Wang, J. Huang, and J. J. Park, VideoPDE: Unified generative PDE solving via video inpainting diffusion models, arXiv preprint arXiv:2506.13754, (2025).

[19] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, Flow matching for generative modeling, in The Eleventh International Conference on Learning Representations, 2023.

[20] S. Liu, Y. Yao, J. Jia, S. Casper, N. Baracaldo, P. Hase, Y. Yao, C. Y. Liu, X. Xu, H. Li, et al., Rethinking machine unlearning for large language models, Nature Machine Intelligence, (2025), pp. 1–14.

[21] Z. Liu, H. Ye, C. Chen, Y. Zheng, and K.-Y. Lam, Threats, attacks, and defenses in machine unlearning: A survey, IEEE Open Journal of the Computer Society, (2025).

[22] G. P. Meyer, An alternative probabilistic interpretation of the Huber loss, in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2021, pp. 5261–5269.

[23] G. Pruthi, F. Liu, S. Kale, and M. Sundararajan, Estimating training data influence by tracing gradient descent, Advances in Neural Information Processing Systems, 33 (2020), pp. 19920–19930.

[24] M. Raissi, P. Perdikaris, and G. E. Karniadakis, Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations, Journal of Computational Physics, 378 (2019), pp. 686–707.

[25] M. Ren, W. Zeng, B. Yang, and R. Urtasun, Learning to reweight examples for robust deep learning, in International Conference on Machine Learning, PMLR, 2018, pp. 4334–4343.

[26] L. Simone, D. Bacciu, and S. Ma, ContinualFlow: Learning and unlearning with neural flow matching, in ICML 2025 Workshop on Machine Unlearning for Generative AI, 2025.

[27] H. Song, M. Kim, D. Park, Y. Shin, and J.-G. Lee, Learning from noisy labels with deep neural networks: A survey, IEEE Transactions on Neural Networks and Learning Systems, 34 (2022), pp. 8135–8153.

[28] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, Score-based generative modeling through stochastic differential equations, in International Conference on Learning Representations, 2021.

[29] J. Tauberschmidt, S. Fellenz, S. J. Vollmer, and A. B. Duncan, Physics-constrained fine-tuning of flow-matching models for generation and inverse problems, arXiv preprint arXiv:2508.09156, (2025).

[30] U. Utkarsh, P. Cai, A. Edelman, R. Gomez-Bombarelli, and C. V. Rackauckas, Physics-constrained flow matching: Sampling generative models with hard constraints, in The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[31] S. Wang, Y. Teng, and P. Perdikaris, Understanding and mitigating gradient flow pathologies in physics-informed neural networks, SIAM Journal on Scientific Computing, 43 (2021), pp. A3055–A3081.

[32] X. Xia, T. Liu, B. Han, M. Gong, J. Yu, G. Niu, and M. Sugiyama, Sample selection with uncertainty of losses for learning with noisy labels, in International Conference on Learning Representations, 2022.

[33] Z. Xiang, W. Peng, X. Liu, and W. Yao, Self-adaptive loss balanced physics-informed neural networks, Neurocomputing, 496 (2022), pp. 11–34.

[34] L. Yang, X. Meng, and G. E. Karniadakis, B-PINNs: Bayesian physics-informed neural networks for forward and inverse PDE problems with noisy data, Journal of Computational Physics, 425 (2021), p. 109913.

[35] J. Yao, A. Mammadov, J. Berner, G. Kerrigan, J. C. Ye, K. Azizzadenesheli, and A. Anandkumar, Guided diffusion sampling on function spaces with applications to PDEs, in The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[36] Z. Ye, Z. Liu, B. Wu, et al., PDEformer-2: A versatile foundation model for two-dimensional partial differential equations, arXiv preprint arXiv:2507.15409, (2025).

[37] M. Yuan, P. Jin, N. Li, and Q. Li, PIRF: Physics-informed reward fine-tuning for diffusion models, in NeurIPS 2025 AI for Science Workshop, 2025.

[38] Z. Zhang and M. Sabuncu, Generalized cross entropy loss for training deep neural networks with noisy labels, Advances in Neural Information Processing Systems, 31 (2018).

[39] Z. Zhang, H. Zhang, S. O. Arik, H. Lee, and T. Pfister, Distilling effective supervision from severe label noise, in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2020, pp. 9294–9303.

[40] A. Zhou, Z. Li, M. Schneier, J. R. B. Jr, and A. B. Farimani, Text2PDE: Latent diffusion models for accessible physics simulation, in The Thirteenth International Conference on Learning Representations, 2025.

[41] W. Zhou and Y. Xu, Data-guided physics-informed neural networks for solving inverse problems in partial differential equations, arXiv preprint arXiv:2407.10836, (2024).

## 图注与表注

**图注：** 图 1–9 的图注已随文置于相应位置：图 1（第 2.3 节末/第 3 节开头）、图 2–图 3（第 5.2.2 节）、图 4–图 6（第 5.3 节）、图 7–图 9（第 5.4 节）。图 4(a) 为物理项放置方式比较（CFM、CFM-\(\ell\)、CFM-g、PG-CFM、PBFM、PIDM-ME、PIDM-SE 在 NSInv 与 PInv 上的 L2RE）；图 4(b) 为计算匹配对照（PG-CFM-ERFM、更长训练 PG-CFM、SD-PG-CFM、SF-PG-CFM）。图 5(a) 为离群比例扫描 \(\rho\)、5(b) 为离群噪声尺度扫描 \(\sigma_{\rm bad}\)。图 9 左右子图分别为真值观测误差 \(|\varepsilon|\) 与第一阶段能量分 \(E\)。

**表注：** 原文共 9 张表：表 1（神经参数化）、表 2（各基准积分设置与超参数）、表 3–5（PInv/NSInv 主结果与系数辨识）、表 6–8（HInv/BInv/WInv 附加反问题）、表 9（NSInv 运行时间与显存），均已在本页相应位置逐格转写（表 3–8 以"均值 ± 标准差"形式给出）。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、MSC 分类号、第 1–6 节全部正文与小节（含 2.1–2.3、3.1–3.3（含 3.1.1/3.1.2）、4.1–4.4、5.1–5.4（含 5.1.1–5.1.4、5.2.1/5.2.2、5.3.1/5.3.2、5.4.1–5.4.3））、式 (2.1)–(5.18)、算法 3.1 与 4.1、定理 4.1 及其完整证明、注 3.1、表 1–9（全部逐格转写）、图 1–9 图注、参考文献 [1]–[41]（英文原条目，编号与原文一致）。原文无致谢段（首页脚注含投稿与代码链接信息，已录入"代码"与范围说明）。全部表格按 PDF 渲染页（p17、p18、p20、p21、p24）逐格核对；公式按正文逐式转写，长式 (5.8)、(5.13)、(3.10)、(4.14) 等按原文结构录入。**原文疑点/排版说明：** 表 3–8 中原文以粗体标出最优值，本页亦以**加粗**标注；表 5 的"Method"列在原文中为"Methods"（首行表头），本页按"方法"统一处理；式编号采用原文的章节式编号 (2.1)–(5.18)，原文未另行编号算法与定理（算法 3.1/4.1、定理 4.1 为原文编号）。逐句逐式终校未做；供后续 QA 重点核对：式 (3.10) 与 (4.14) 的罚项权重、表 3–8 中"±"两侧数值与表 9 指数格式。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
