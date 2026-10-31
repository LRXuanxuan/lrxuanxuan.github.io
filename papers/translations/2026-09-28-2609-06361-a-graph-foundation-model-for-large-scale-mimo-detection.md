---
layout: page
title: "大规模 MIMO 检测的图基础模型｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-06361-a-graph-foundation-model-for-large-scale-mimo-detection/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e20b58b971f0cfd7/) · [原文 arXiv](https://arxiv.org/abs/2609.06361) · [全部目录](/papers/catalog/)

# 大规模 MIMO 检测的图基础模型

**原题：** A Graph Foundation Model for Large-Scale MIMO Detection  
**作者：** Xingyu Zhou、Le Liang（Member, IEEE）、Hao Ye（Member, IEEE）、Jing Zhang（Member, IEEE）、Chao-Kai Wen（Fellow, IEEE）、Xiao Li（Member, IEEE）、Shi Jin（Fellow, IEEE）、Wei Zhang（Fellow, IEEE）。单位：X. Zhou、L. Liang、J. Zhang、X. Li、S. Jin 为东南大学移动通信国家重点实验室（National Mobile Communications Research Laboratory, Southeast University, Nanjing 210096, China）；H. Ye 为美国加州大学圣克鲁兹分校电气与计算机工程系；C.-K. Wen 为台湾中山大学通信工程研究所；W. Zhang 为澳大利亚新南威尔士大学电气工程与电信学院。  
**版本：** arXiv:2609.06361v1（cs.IT），2026 年 9 月 6 日提交，原文 13 页（IEEE 双栏期刊投稿格式，含图 1–10、表 I–VI、公式 (1)–(29)、参考文献 51 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–V 节（含 II-A–C、III-A–D（其下再分小节）、IV-A–F 等全部小节）、结论、全部图注（图 1–10，含子图说明）、表 I–VI（逐格转录）、公式 (1)–(29)（含 (5a)–(8b) 的子式）与 51 条参考文献英文原条目；原文无附录、无作者简介；逐句逐式终校未做。

## 摘要

大规模多输入多输出（MIMO）检测是现代无线网络的基础，但受性能–复杂度折中制约。现有检测器无论经典还是基于学习，往往在可扩展性或跨异构场景的泛化性上存在欠缺。为克服这些局限，我们提出一种面向大规模 MIMO 检测的**无线原生图基础模型（GFM）**。所提 GFM 采用物理信息混合架构，把消息传递神经网络（MPNN）的局部相关性提取与图 Transformer 的全局注意力结合起来，并编码来自期望传播（EP）算法的物理干扰图样。通过充分预训练，这种协同使模型能学到可跨天线维度与信道条件扩展的通用检测映射。为快速下游部署，采用参数高效微调（PEFT）以最小开销把 GFM 适配到特定非理想系统区间。为提升推断效率，在下游部署中嵌入专家混合（MoE）机制，只动态激活必要的子模块。评估表明，所提 GFM 在各类挑战性零样本与少样本条件下，于精度、配置通用性与跨场景可迁移性方面一致优于经典检测器与先进数据驱动基线。

**关键词：** 深度学习、基础模型、图 Transformer、MIMO 检测。

## I. 引言

多输入多输出（MIMO）技术是现代无线通信的基础，支撑每秒太比特（Tbps）级数据速率与泛在连接 [1]。6G 及以后无线网络的这些需求推动了**超大规模 MIMO（XL-MIMO）**的发展，把天线数从 16–128 提升到 512 甚至更多 [2]。然而，天线数增加进一步加剧了本已在显著计算约束下困难重重的信号处理任务复杂度，例如高维信道状态信息（CSI）获取 [3] 与大规模 MIMO 检测 [4]。

具体而言，MIMO 检测是 MIMO 通信中的基本问题，目标是由接收信号与 CSI 恢复发射符号向量 [4]。由于搜索空间的组合性质，最优 MIMO 检测已知是非确定性多项式时间难（NP 难）的。虽然球形译码相较最优检测器的穷举搜索可降低平均复杂度并保持近最优性能，但在大规模 MIMO 系统中仍计算上不可承受 [5]。因此人们提出了大量次优算法以在复杂度与性能间折中，包括线性最小均方误差（LMMSE）、串行干扰消除与基于消息传递的检测器 [4]；但这些算法往往依赖在实际场景中未必成立的理想化假设，导致严重性能退化。

近期标准化研究 [6] 标志着把人工智能（AI）嵌入无线网络物理层的明确趋势 [7]。这一趋势并非把 AI 当作事后补充，而是期待一种 AI 原生架构 [8]，把物理层设计从刚性数学算法转向能进行场景感知自适应的数据驱动神经网络（NN）。对大规模 MIMO 检测这类高维处理任务，这种自适应智能有助于应对计算瓶颈、非理想硬件条件与跨场景泛化等传统挑战。

因此，基于学习的方法被日益用于处理 MIMO 检测中的关键性能–复杂度折中。例如，深度展开架构把可学习参数融入经典迭代检测过程，以有限训练开销加速收敛 [9]–[11]。并行地，神经增强方法利用图 NN（GNN）等架构增强传统检测器的中间计算，重度依赖数据学习复杂干扰图样而无需刚性统计假设 [12], [13]。然而，这些现有方法往往难以跨不同系统配置与分布外（OOD）信道环境泛化，违背了 AI 原生通信内在的自适应与自主目标，也限制了其在动态无线环境中的实际适用性。

近年来，受大规模 AI 模型（即基础模型 [14]）在视觉与语言处理中空前泛化能力的启发，研究者开始探索其在无线通信中的潜力。早期研究把通用基础模型（如大语言模型（LLM）与大型视觉模型（LVM））适配到物理层任务 [15]，包括信道预测 [16]、波束管理 [17] 与多任务联合处理 [18]。尽管性能可期，语言/视觉 token 与无线数据之间仍存在显著的模态鸿沟，且这些预训练基础模型难以满足物理层处理的严格时延要求。为应对这些不匹配，人们日益关注**无线原生基础模型**——在海量无线数据上从零预训练，以学习物理层任务的紧凑、可泛化表示 [19]–[22]，有望带来 AI 原生通信所期待的效率与可适应性。然而基础模型在物理层的应用仍处于起步阶段，对 MIMO 检测而言尤为如此：构建一个能捕获复杂干扰图样并跨多样场景泛化的基础模型仍是开放问题 [23]。

由于 MIMO 系统固有的图结构 [12], [24]——发射符号、接收信号与信道系数可自然表示为图中的节点与边——基于图学习的基础模型 [25] 已成为 MIMO 信号处理的有前景范式，在建模 MIMO 系统中复杂交互与依赖方面具有强表示能力与可扩展性。该范式的发展要求精细设计骨干架构。虽然经典 GNN（也称 MPNN）主导当前无线通信应用，但其表示能力因**过平滑瓶颈** [25] 而很快饱和，阻碍大规模图预训练的性能。为突破该容量壁垒，基于 Transformer 的架构通过全局自注意力机制提供了有效替代：把图拓扑作为可学习空间偏置显式纳入注意力分数计算 [26], [27] 后，图 Transformer（GT）弥合了标准 Transformer 在图信息编码上的差距，从而比 MPNN 更有效地捕获无线网络中复杂的长程干扰拓扑 [28]。尽管有这些结构进展，现有文献多聚焦任务特定的 GNN/GT 检测器，大规模预训练 GT 用于信号恢复任务的潜力尚未被探索。这自然引出一个研究问题：

**如何构建一个能跨复杂异构场景进行可扩展、可泛化 MIMO 检测的无线原生图基础模型？**

针对该问题，本文提出一种面向大规模 MIMO 检测的 GFM。为构建有表现力且可扩展的骨干，受 [29] 启发，我们提出一种**物理信息混合骨干**架构：组合 MPNN 与 GT 块，并把物理干扰（图边特征）显式编码进消息传递与注意力机制，使 GFM 能同时捕获 MIMO 数据流之间的局部相关性与全局依赖。通过把基于期望传播（EP）的 MIMO 检测 [30] 的统计原理注入边特征与结构设计，GFM 继承了 EP 的专家知识，便于准确的干扰表示与符号检测。GFM 在涵盖广泛系统配置与信道条件的大规模数据集上充分预训练。针对特定下游部署，我们引入参数高效微调（PEFT）技术，实现对实际大规模 MIMO 系统中普遍存在的异构系统区间的快速、低开销适配。为减轻基础模型的计算开销，嵌入专家混合（MoE）结构以进行输入相关的条件路由，选择性激活子网络以提升推断效率。数值结果表明，所提 GFM 检测器在各类挑战性零样本与少样本条件下一致优于传统检测器与先进深度学习基线。评估还验证了整体框架（涵盖预训练、快速适配与高效推断）的有效性。本文贡献概括如下。

- **面向大规模 MIMO 检测的物理信息 GFM 架构：** 我们开发了一种新 GFM 架构，把 MPNN 的局部相关性提取与 GT 层通过把图边特征显式注入为注意力偏置实现的、有物理依据的全局信息聚合结合起来，缓解过平滑瓶颈。该设计还把 EP 检测统计量嵌入边特征，用领域知识正则化数据驱动学习过程。
- **充分预训练与参数高效微调：** 我们建立两阶段学习流程，使所提检测器兼具稳健泛化性与场景感知自适应性。GFM 先在海量 MIMO 传输数据上预训练，以学习支持多种调制方案、天线配置与信道条件的通用 MIMO 检测表示；随后用 PEFT 以最小开销把预训练模型快速适配到未见过的非理想系统区间，例如少比特模数转换器（ADC）、非线性功率放大器（PA）或小区间干扰。
- **面向高效推断的专家混合学习：** 我们把 MoE 机制嵌入 GFM 以提升推断效率。该机制依据瞬时信道实现的特征，选择性地激活 GFM 内一个专门子网络（MPNN 或 GT），在保持检测精度的同时降低计算代价。

**记号：** 对任意矩阵 $\mathbf A$，$\mathbf A^\top$ 与 $\mathbf A^{-1}$ 分别表示转置与逆；${\rm diag}(\mathbf A)$ 返回矩阵 $\mathbf A$ 的对角向量，${\rm Diag}(\mathbf a)$ 表示以 $\mathbf a$ 元素为主对角线的对角矩阵，$\lambda_{\max}(\mathbf A)$ 为 $\mathbf A$ 的最大特征值；$\mathbf 0$ 与 $\mathbf 1$ 分别为全零与全一向量，$\mathbf I$ 为单位阵；$\|\cdot\|_1$、$\|\cdot\|_2$、$\|\cdot\|_\infty$ 与 $\|\cdot\|_F$ 分别表示 $\ell_1$、$\ell_2$、无穷与 Frobenius 范数；$\mathbb E[\cdot]$ 为期望算子，$\odot$ 与 $\oslash$ 分别为逐元素向量乘与除；$\mathbb R$ 与 $\mathbb C$ 分别表示实数与复数集合；$\mathcal N(\mathbf x;\boldsymbol\mu,\boldsymbol\Sigma)$ 表示随机向量 $\mathbf x$ 均值 $\boldsymbol\mu$、协方差 $\boldsymbol\Sigma$ 的高斯分布。

## II. 问题建模与预备知识

### A. 系统模型

我们考虑上行多用户 MIMO 系统：配备 $N_r$ 根天线的基站（BS）服务 $N_t$ 个单天线用户设备（UE）。该 MIMO 传输的等效实值模型可表示为

$$
\mathbf y=\mathbf H\mathbf x+\mathbf n, \tag{1}
$$

其中 $\mathbf y\in\mathbb R^{M\times1}$ 为 BS 接收信号，$M=2N_r$；$\mathbf x\in\mathbb R^{N\times1}$ 为发射符号向量，$N=2N_t$；$\mathbf H\in\mathbb R^{M\times N}$ 为信道矩阵；$\mathbf n\in\mathbb R^{M\times1}$ 为均值零、协方差 $\sigma^2\mathbf I$ 的加性白高斯噪声（AWGN）向量。每个发射符号取自正交幅度调制（QAM）星座 $\mathcal S=\{a_1,a_2,\dots,a_S\}$，基数 $|\mathcal S|=S$，平均能量恒为 $E_s=1/2$。传输信噪比（SNR）定义为 ${\rm SNR}=\mathbb E[\|\mathbf H\mathbf x\|_2^2]/\mathbb E[\|\mathbf n\|_2^2]$。

MIMO 检测的目标是在给定 $\mathbf y$ 与 $\mathbf H$ 知识下恢复发射符号向量 $\mathbf x$。假定均匀先验，最优最大似然（ML）检测准则为

$$
\hat{\mathbf x}_{\rm ML}=\arg\min_{\mathbf x\in\mathcal S^{N\times1}}
\left\|\mathbf y-\mathbf H\mathbf x\right\|_2^2, \tag{2}
$$

当 $N$ 或 $S$ 较大时，该 NP 难问题的复杂度不可承受。这一计算瓶颈要求审慎的性能–复杂度折中，而实际部署还要求跨多样系统配置与信道条件的适应性，现有检测器往往难以满足。为弥补这一差距，本文构建高度可扩展的 GFM 作为 MIMO 检测的通用骨干。

为刻画 MIMO 干扰，我们把 (1) 表述在全连接图 $\mathcal G=(\mathcal V,\mathcal E)$ 上。这里 $\mathcal V=\{1,\dots,N\}$ 对应 $\mathbf x$ 中的 $N$ 个未知符号；边集 $\mathcal E$ 封装这些数据流之间的成对交互，主要由流间信道相关性 $\mathbf h_k^\top\mathbf h_j$ 决定，其中 $\mathbf h_k$ 为 $\mathbf H$ 的第 $k$ 列。通过把物理传输转化为这种拓扑视角，复杂的 MIMO 干扰被转译为图信号，使 GFM 能提取稳健表示。

### B. 下游系统区间

在实践中，式 (1) 的理想传输模型不可避免地受各种硬件损伤与环境非理想性扭曲，导致显著失配并可能严重降低性能。因此，预训练 GFM 应能通过少样本学习快速适配到包含此类模型失配的异构下游系统区间。这些区间的典型例子及其相应失配描述汇总于表 I。具体地，我们按式 (1) 中四个变量上的失配与损伤对这些例子分类，用以指导后续面向 MoE 路由器的物理特征设计，以及对所提 PEFT 模块在全部失真维度上的评估。具体失配详述如下。

**表 I：** 导致模型失配的典型下游系统区间。

| 变量 | 系统区间 | 失配描述 |
|---|---|---|
| $\mathbf y$ | 少比特 ADC [31] | $\bar{\mathbf y}=\mathcal Q(\mathbf y)$，其中 $\mathcal Q(\cdot)$ 为 ADC 量化函数。 |
| $\mathbf H$ | 振荡器相位噪声 [32] | $\bar{\mathbf H}=\boldsymbol\Theta_{\rm BS}\mathbf H\boldsymbol\Theta_{\rm UE}$，其中 $\boldsymbol\Theta$ 表示相位漂移诱导的旋转矩阵。 |
| $\mathbf x$ | 非线性 PA [33] | $\bar{\mathbf x}={\rm PA}(\tilde{\mathbf x})$，其中 $\tilde{\mathbf x}\in\mathbb C$ 为复发射符号。 |
| $\mathbf n$ | 小区间干扰 [34] | $\bar{\mathbf n}\sim\mathcal N(\mathbf 0,\rho\mathbf C\mathbf C^\top+\sigma^2\mathbf I)$，功率为 $\rho$，$\mathbf C$ 为非目标 UE 的信道。 |

**少比特 ADC（$\mathbf y$）：** 为降低大规模天线阵列的功耗与硬件成本，BS 日益采用低分辨率 ADC [31]，得到量化接收信号 $\bar{\mathbf y}=\mathcal Q(\mathbf y)$，其中非线性量化函数 $\mathcal Q(\cdot)$ 把连续信号映射到离散集。该区间要求检测器在低分辨率配置（如 3 比特量化）下从严重失真的观测中恢复信号。

**振荡器相位噪声（$\mathbf H$）：** 在大规模多用户 MIMO 系统中，维持全局同步载波并抑制相位漂移颇为困难。BS 与 UE 处的独立振荡器引入乘性相位噪声，把有效信道扰动为 $\bar{\mathbf H}=\boldsymbol\Theta_{\rm BS}\mathbf H\boldsymbol\Theta_{\rm UE}$ [32]。为与实值模型对齐，两个旋转矩阵取 $\boldsymbol\Theta=[\mathbf C_\theta,-\mathbf S_\theta;\mathbf S_\theta,\mathbf C_\theta]$，其中 $\mathbf C_\theta={\rm Diag}(\cos\boldsymbol\theta)$、$\mathbf S_\theta={\rm Diag}(\sin\boldsymbol\theta)$。两端相位漂移向量 $\boldsymbol\theta$ 由服从 $\mathcal N(\mathbf 0,\sigma_\theta^2)$ 的独立元素组成。依赖静态 $\mathbf H$ 会忽略这一未建模漂移，造成严重失配并损害常规检测 [35]。

**非线性 PA（$\mathbf x$）：** 为在上行传输中最大化功率效率，UE 的 PA 常工作于饱和区附近 [33]。对现代固态 PA，这主要体现为对发射符号 $\tilde{\mathbf x}\in\mathbb C$ 的非线性幅度失真而无显著相移，遵循 Rapp 模型 [36]。失真符号 $\bar{\mathbf x}={\rm PA}(\tilde{\mathbf x})=A(|\tilde{\mathbf x}|)e^{j\angle(\tilde{\mathbf x})}$ 保持原相位 $\angle(\tilde{\mathbf x})$，其幅度被压缩为

$$
A\left(|\tilde{\mathbf x}|\right)=\frac{|\tilde{\mathbf x}|}
{\left(1+\left(|\tilde{\mathbf x}|/A_{\rm sat}\right)^{2p}\right)^{\frac{1}{2p}}}, \tag{3}
$$

其中 $A_{\rm sat}$ 为饱和电平，$p$ 为平滑因子。因此检测器的判决边界应被有效校准以计入该失真。

**小区间干扰（$\mathbf n$）：** 在多小区密集部署中，目标信号常受非目标 UE 的小区间干扰污染。来自 $N_{\rm int}$ 个非目标 UE 的干扰加 AWGN 不再是白色而变为有色噪声：具体地，有色噪声服从高斯分布 $\mathcal N(\mathbf 0,\rho\mathbf C\mathbf C^\top+\sigma^2\mathbf I)$ [34]，其中 $\mathbf C\in\mathbb R^{M\times 2N_{\rm int}}$ 为 $N_{\rm int}$ 个非目标 UE 的信道矩阵，$\rho$ 表示其功率。因此检测器应能适应处理非平凡噪声协方差，增强在干扰受限场景中的鲁棒性。

### C. 基于期望传播的检测

按 Bayes 定理，发射信号 $\mathbf x$ 的精确后验分布为

$$
p(\mathbf x|\mathbf y)\propto\mathcal N\left(\mathbf y;\mathbf H\mathbf x,\sigma^2\mathbf I\right)
\prod_{i=1}^{N}p(x_i), \tag{4}
$$

其中 $p(x_i)$ 表示星座 $\mathcal S$ 上的离散先验。由于从该精确后验恢复 $\mathbf x$ 需要不可承受的穷举搜索，EP 算法 [30], [37] 通过把离散先验建模为独立高斯分布来迭代近似联合后验。

具体地，在第 $l$ 次迭代（$l=1,2,\dots,L$），近似后验被表述为高斯分布 $q_l(\mathbf x)=\mathcal N(\mathbf x;\boldsymbol\mu_l,\boldsymbol\Sigma_l)$，其协方差矩阵与均值向量由 LMMSE 估计步得到：

$$
\boldsymbol\Sigma_l=\left(\sigma^{-2}\mathbf H^\top\mathbf H+\boldsymbol\Lambda_{l-1}\right)^{-1}, \tag{5a}
$$
$$
\boldsymbol\mu_l=\boldsymbol\Sigma_l\left(\sigma^{-2}\mathbf H^\top\mathbf y+\boldsymbol\gamma_{l-1}\right), \tag{5b}
$$

其中 $\boldsymbol\gamma_{l-1}$ 与 $\boldsymbol\Lambda_{l-1}={\rm Diag}(\boldsymbol\lambda_{l-1})$ 分别表示由第 $(l-1)$ 次迭代提供的信息向量与精度矩阵（$\boldsymbol\gamma_0=\mathbf 0$，$\boldsymbol\lambda_0=\frac{1}{E_s}\mathbf 1$）。为逐步精炼这些参数，EP 为每个变量 $x_i$ 计算腔分布 $\mathcal N(x_i;x_{e,l,i},v_{e,l,i})$，从而有效隔离当前节点的自反馈信息以避免环路累积 [30], [38]。具体地，腔均值 $\mathbf x_{e,l}=[x_{e,l,1},\dots,x_{e,l,N}]^\top$ 与方差 $\mathbf v_{e,l}=[v_{e,l,1},\dots,v_{e,l,N}]^\top$ 可计算为

$$
\mathbf v_{e,l}={\rm diag}(\boldsymbol\Sigma_l)\oslash
\left(\mathbf 1-{\rm diag}(\boldsymbol\Sigma_l)\odot\boldsymbol\lambda_{l-1}\right), \tag{6a}
$$
$$
\mathbf x_{e,l}=\mathbf v_{e,l}\odot
\left(\boldsymbol\mu_l\oslash{\rm diag}(\boldsymbol\Sigma_l)-\boldsymbol\gamma_{l-1}\right). \tag{6b}
$$

随后通过纳入真实先验 $p(x_i)$ 计算 $x_i$ 的近似后验分布：$\hat p_l(x_i|\mathbf y)\propto\mathcal N(x_i;x_{e,l,i},v_{e,l,i})\cdot p(x_i)$，其均值 $\hat x_{l,i}$ 与方差 $\hat v_{l,i}$ 为

$$
\hat x_{l,i}=\sum_{a_s\in\mathcal S}a_s\cdot\hat p_l(x_i=a_s|\mathbf y), \tag{7a}
$$
$$
\hat v_{l,i}=\sum_{a_s\in\mathcal S}\left(a_s-\hat x_{l,i}\right)^2\cdot\hat p_l(x_i=a_s|\mathbf y). \tag{7b}
$$

这些后验均值与方差构成向量 $\hat{\mathbf x}_l=[\hat x_{l,1},\dots,\hat x_{l,N}]^\top$ 与 $\hat{\mathbf v}_l=[\hat v_{l,1},\dots,\hat v_{l,N}]^\top$。最后，通过让独立高斯分布的前两阶矩与近似后验分布相匹配来更新参数 $\boldsymbol\lambda_l$ 与 $\boldsymbol\gamma_l$：

$$
\boldsymbol\lambda_l=\beta\left(\mathbf 1\oslash\hat{\mathbf v}_l-\mathbf 1\oslash\mathbf v_{e,l}\right)
+(1-\beta)\boldsymbol\lambda_{l-1}, \tag{8a}
$$
$$
\boldsymbol\gamma_l=\beta\left(\hat{\mathbf x}_l\oslash\hat{\mathbf v}_l-\mathbf x_{e,l}\oslash\mathbf v_{e,l}\right)
+(1-\beta)\boldsymbol\gamma_{l-1}, \tag{8b}
$$

其中 $\beta\in[0,1]$ 为平滑更新的阻尼因子，且当 $1/\hat v_{l,i}-1/v_{e,l,i}<0$ 时置 $\lambda_{l,i}=\lambda_{l-1,i}$、$\gamma_{l,i}=\gamma_{l-1,i}$ 以保证 $\boldsymbol\lambda_l$ 非负。经过 $L$ 次迭代后，最终检测输出为 $\hat{\mathbf x}_L$，并对其施加硬判决。

虽然 EP 提供了严格的推断框架，其独立高斯近似无法捕获复杂干扰关系，尤其当多流干扰严重时 [12]。为在保留其领域洞见的同时克服这一瓶颈，我们所提方法把中间 EP 统计量显式嵌入为物理信息图边特征，从而在 GFM 内正则化数据驱动机制以实现稳健符号恢复。

## III. 所提方法

本节先给出面向 MIMO 检测的 GFM 详细模型架构，再阐述学习流程——包括建立通用检测模型的预训练过程，以及用于快速适配多样下游区间的 PEFT 策略；最后介绍用于降低推断计算代价的 MoE 方案。

### A. 模型架构

所提 GFM 的整体架构如图 1 所示。GFM 级联 $L$ 个处理层，每层整合一个继承自 EP 的 LMMSE 模块以显式计算物理统计量，以及数据驱动的 MPNN 与 GT 块以捕获干扰表示，随后由解码器头产生检测结果。为厘清结构，我们先给出逐层操作流程，再深入各组成模块的详细设计。

**1）总体操作流程：** 为把 MIMO 检测映射到图学习范式，GFM 建立于精心设计的节点特征、边表示与检测统计量之上。具体地，初始节点特征 $\mathbf F\in\mathbb R^{N\times2}$ 基于 $\mathbf x$ 的图卷积近似 [39, Eq. (23)] 构造为

$$
\mathbf F=\left[\eta\mathbf H^\top\mathbf y,\ \eta\sigma\mathbf H^\top\mathbf 1\right],\qquad
\eta\triangleq1/\lambda_{\max}\left(\mathbf H^\top\mathbf H\right), \tag{9}
$$

它表示节点初始知识，其中 $\sigma\mathbf H^\top\mathbf 1$ 是 $\mathbf H^\top\mathbf n$ 的近似，$\eta$ 为归一化因子。随后 $\mathbf F$ 被线性投影以生成 MPNN 与 GT 分支的初始嵌入：

$$
\mathbf U_0={\rm Linear}_U(\mathbf F)\in\mathbb R^{N\times d_U}, \tag{10}
$$
$$
\mathbf Z_0={\rm Linear}_Z(\mathbf F)\in\mathbb R^{N\times d_Z}, \tag{11}
$$

其中 $d_U$ 与 $d_Z$ 分别为潜在特征维数。此外，先验检测统计量初始化为 $\mathbf X_0\triangleq[\hat{\mathbf x}_0,\hat{\mathbf v}_0,\boldsymbol\gamma_0,\boldsymbol\lambda_0]\in\mathbb R^{N\times4}$，其中 $\boldsymbol\gamma_0=\hat{\mathbf x}_0=\mathbf 0$、$\hat{\mathbf v}_0=E_s\mathbf 1$、$\boldsymbol\lambda_0=\mathbf 1\oslash\hat{\mathbf v}_0$。它们共同构成 GFM 的初始状态元组 $\{\mathbf U_0,\mathbf Z_0,\mathbf X_0\}$。

在每层 $l=1,\dots,L$，GFM 的状态元组 $\{\mathbf U_{l-1},\mathbf Z_{l-1},\mathbf X_{l-1}\}$ 通过沿图边交换信息被迭代更新。遵循图模型成对势（pair potential）所刻画的关系 [40, Eq. (6)]，第 $l$ 层的物理信息边特征张量 $\mathbf E_l=\{\mathbf e_{l,jk}\}_{j,k=1}^{N}\in\mathbb R^{N\times N\times6}$ 构造为

$$
\mathbf e_{l,jk}=\left[\mathbf h_k^\top\mathbf h_j,\ \sigma^2,\ x_{e,l,j},\ x_{e,l,k},\ v_{e,l,j},\ v_{e,l,k}\right]. \tag{12}
$$

该特征同时封装静态流间相关性与由 EP 原理迭代推断的动态节点特定外信息统计量。具体地，LMMSE 模块先利用 $\mathbf X_{l-1}$ 中的先验统计量与全局状态 $\{\mathbf y,\mathbf H,\sigma^2\}$ 提取关键外信息 $\mathbf x_{e,l}$ 与 $\mathbf v_{e,l}$，从而组装 $\mathbf E_l$；该特征随后注入 MPNN 与 GT 块：引导 MPNN 更新局部表示 $\mathbf U_l$，同时充当 GT 的注意力偏置以精炼全局表示 $\mathbf Z_l$；最后，解码器头把拼接的潜在特征映射为更新后的检测统计量 $\mathbf X_l$。逐层更新过程可概括为

$$
\mathbf U_l,\mathbf Z_l,\mathbf X_l={\rm GFM}_l\left(\mathbf U_{l-1},\mathbf Z_{l-1},\mathbf X_{l-1}\right), \tag{13}
$$
$$
{\rm computed\ as}\quad
\mathbf E_l={\rm LMMSE}\left(\mathbf X_{l-1},\mathbf y,\mathbf H,\sigma^2\right), \tag{14}
$$
$$
\mathbf U_l={\rm MPNN}\left(\mathbf U_{l-1},\mathbf E_l\right), \tag{15}
$$
$$
\mathbf Z_l={\rm GT}_l\left(\mathbf Z_{l-1},\mathbf E_l\right), \tag{16}
$$
$$
\mathbf X_l={\rm Decoder}\left({\rm Concat}\left[\mathbf U_l,\mathbf Z_l\right]\right). \tag{17}
$$

为平衡训练稳定性与表示表现力，MPNN 与解码器头在所有层间共享，而 GT 块为层特定者以增强表达能力。在这一总体流程指导下，下面分别展开 LMMSE 模块、MPNN、GT 与解码器头的设计。

**2）LMMSE 模块：** 作为继承自 EP 的物理驱动核心，LMMSE 模块提取干扰的关键统计量。具体地，它利用 $\mathbf X_{l-1}$ 中的近似先验参数 $\boldsymbol\lambda_{l-1}$ 与 $\boldsymbol\gamma_{l-1}$ 计算 (5)，得到高斯近似的均值 $\boldsymbol\mu_l$ 与协方差 $\boldsymbol\Sigma_l$。我们不采用 (5a) 中的显式矩阵求逆，而是先计算 Cholesky 分解 [41], [42]：$\sigma^{-2}\mathbf H^\top\mathbf H+\boldsymbol\Lambda_{l-1}=\mathbf L_l\mathbf L_l^\top$，其中 $\mathbf L_l$ 为下三角矩阵；随后 $\boldsymbol\Sigma_l$ 可通过前向与后向代换求解 [43]。¹ 该方法虽仍为 $O(N^3)$ 复杂度，但这种硬件友好的途径保证数值稳定性并降低实际部署的实现开销。随后执行 (6) 中的 EP 腔计算以产生外信息 $\mathbf X_{e,l}=[\mathbf x_{e,l},\mathbf v_{e,l}]$，并聚合构造物理信息特征 $\mathbf E_l$ 以指导后续数据驱动模块。

¹ 该途径避免了计算 $(\mathbf L_l^\top)^{-1}\mathbf L_l^{-1}$ 所涉及的计算密集矩阵乘法。

**图 1：** 所提 GFM 用于 MIMO 检测的整体架构。MPNN 与解码器头在各层间共享参数，而 GT 块为层特定（图中示出层 1、层 $l$、层 $L$ 的状态流转与 LMMSE（Cholesky）模块）。

**3）谱卷积增强的 MPNN：** 为捕获 MIMO 图中的局部干扰图样，我们采用受 [39] 启发的 MPNN，如图 2(a) 所示。传统消息传递在大型 MIMO 场景的稠密连通性下常遇困难；相反，我们的方法在归一化 MIMO Laplacian $\mathbf L_{\rm MIMO}\triangleq\mathbf I-\eta\mathbf H^\top\mathbf H$ 上使用基于 Chebyshev 多项式的谱图滤波器，显式刻画空间相关性，并规避稠密图中 $N(N-1)$ 次消息计算的瓶颈。

为提升谱图滤波器在动态无线环境中的泛化性，我们使用实例自适应注意力机制，记为 ${\rm ATT}(\cdot)$。该机制基于初始节点特征 $\mathbf F$ 生成动态、信道感知的滤波器系数 $[{\rm ATT}(\mathbf F)]_c$，把阶数为 $c=1,2,\dots,C$ 的 Chebyshev 多项式 $T_c(\mathbf L_{\rm MIMO})$ 针对当前干扰几何进行调整。² 更新规则把该自适应谱滤波与门控循环单元（GRU）结合：

$$
\tilde{\mathbf U}_l=\sum_{c=1}^{C}[{\rm ATT}(\mathbf F)]_c\,
T_c\left(\mathbf L_{\rm MIMO}\right){\rm MLP}_M\left(\mathbf U_{l-1}\right), \tag{18}
$$
$$
\mathbf G_l={\rm GRU}\left({\rm Concat}\left[\tilde{\mathbf U}_l,\mathbf X_{e,l}\right],\mathbf G_{l-1}\right), \tag{19}
$$
$$
\mathbf U_l={\rm Linear}_G\left(\mathbf G_l\right). \tag{20}
$$

² Chebyshev 多项式由 $T_c(x)=2xT_{c-1}(x)-T_{c-2}(x)$ 给出，其中 $T_0(x)=1$、$T_1(x)=x$。

这里消息多层感知机 ${\rm MLP}_M(\cdot)$ 充当局部特征投影器，而 GRU 的隐藏状态 $\mathbf G_l$ 编码来自 LMMSE 模块的物理信息外统计量 $\mathbf X_{e,l}$。这种整合使 MPNN 能有效学习针对潜在干扰结构的、有表现力的局部表示。

**图 2：** GFM 内部组件细节：(a) 谱卷积增强的 MPNN；(b) 带偏置投影器的 GT；(c) 用于后验分布近似（后验更新与矩匹配）的解码器头。

**4）图 Transformer：** 作为对 MPNN 局部特征提取的补充，GT 提供全局建模能力以捕获长程依赖。原始多头注意力（MHA）[44] 重度依赖节点查询与键之间的潜在语义相似性，而我们把上述边特征 $\mathbf E_l$ 显式注入注意力机制 [26], [27]，以与 MIMO 干扰拓扑对齐，如图 2(b) 所示。具体地，(12) 中构造的每个特征向量 $\mathbf e_{l,jk}$ 被送入浅层投影器 $\phi_{B,l}(\cdot)$，得到 $H$ 维偏置向量，其中 $H$ 为并行注意力头数。对第 $l$ 层的第 $h$ 个头，Softmax 前的注意力分数为

$$
A^{(h)}_{l,jk}=\frac{\left(\mathbf z_{l-1,j}\mathbf W^{(h)}_Q\right)
\left(\mathbf z_{l-1,k}\mathbf W^{(h)}_K\right)^\top}{\sqrt d}
+\left[\phi_{B,l}\left(\mathbf e_{l,jk}\right)\right]_h, \tag{21}
$$

其中 $\mathbf z_{l-1,j}\in\mathbb R^{1\times d_Z}$ 为 $\mathbf Z_{l-1}$ 的第 $j$ 行，$\mathbf W^{(h)}_Q\in\mathbb R^{d_Z\times d}$ 与 $\mathbf W^{(h)}_K\in\mathbb R^{d_Z\times d}$ 为可学习的查询与键投影矩阵，$d=d_Z/H$ 为每头特征维数。通过整合头特定偏置项 $[\phi_{B,l}(\mathbf e_{l,jk})]_h$，某些头被引导聚焦于强干扰流，而其他头捕获全局相关性。

随后，来自全部 $H$ 个头的注意力加权表示被拼接，用值与输出投影矩阵（$\mathbf W^{(h)}_V\in\mathbb R^{d_Z\times d}$、$\mathbf W_O\in\mathbb R^{d_Z\times d_Z}$）线性变换，并经带残差连接的前馈网络（FFN）：

$$
\mathbf o_{l,j}={\rm Concat}_{h=1}^{H}\left[\sum_{k=1}^{N}
{\rm Softmax}_k\left(A^{(h)}_{l,jk}\right)\times\left(\mathbf z_{l-1,k}\mathbf W^{(h)}_V\right)\right]\mathbf W_O, \tag{22}
$$
$$
\mathbf z_{l,j}={\rm FFN}\left(\mathbf o_{l,j}\right)+\mathbf z_{l-1,j}. \tag{23}
$$

该过程产生更新后的全局特征 $\mathbf Z_l=[\mathbf z_{l,1}^\top,\dots,\mathbf z_{l,N}^\top]^\top$，随后送入解码器头。

**5）解码器头：** 解码器头把拼接的局部与全局特征投影到符号空间，导出更新后的检测统计量 $\mathbf X_l$。考虑到不同调制方案的结构差异，我们采用一组调制特定的解码器头。具体地，针对目标调制的三层 MLP ${\rm MLP}_{D,S}(\cdot)$ 作用于统一表示，产生增强的后验概率估计 $\mathbf P_l\in\mathbb R^{N\times S}$：

$$
\mathbf P_l={\rm MLP}_{D,S}\left({\rm Concat}\left[\mathbf U_l,\mathbf Z_l\right]\right), \tag{24}
$$

其中 $\mathbf P_l$ 的第 $i$ 行表示 $x_i$ 在各星座点上的估计概率。该架构使 GFM 既能为高层干扰建模维持共享骨干，又能用专门头做精确符号级判决。这种增强后验估计优于第 II-C 节所述标准 EP 的独立高斯近似。给定 $\mathbf P_l$，后验均值 $\hat{\mathbf x}_l$ 与方差 $\hat{\mathbf v}_l$ 可按 (7) 计算；随后执行矩匹配（阻尼因子经验取 $\beta=0.2$ [38]）按 (8) 更新 $\boldsymbol\lambda_l$ 与 $\boldsymbol\gamma_l$，再与后验矩拼接组装 $\mathbf X_l$ 供下一层使用。

### B. 模型预训练

为赋予 GFM 跨不同系统配置的泛化性，我们采用涵盖广泛系统参数与信道条件的预训练策略。预训练数据集 $\mathcal D_{\rm pre}$ 可合成以覆盖这些配置的广泛谱系，可归为以下三个维度：

- **几何与阵列配置：** 为确保跨不同 BS 与 UE 规模的可扩展性，训练阶段包含各种天线数 $(N_r,N_t)$ 与阵列几何，如均匀线阵（ULA）与均匀平面阵（UPA）。这使 GFM 学到与具体阵列维数无关的通用空间相关图样。
- **信道环境与传播：** 预训练涵盖多样载频与信道场景，如 3GPP TR 38.901 城市宏小区（UMa）与城市微小区（UMi）[45]。此外，通过改变 BS–UE 距离与散射环境，模型捕获多样传播特性。
- **信号与调制多样性：** GFM 接触多样信号配置，包括不同调制方案（16-、64-、256-QAM）与 SNR 水平。预训练时对每个样本激活相应调制特定的解码器头，使模型能把共享表示映射为调制特定后验。

每个训练样本由元组 $\{\mathbf H,\mathbf x,\mathbf y,\sigma\}$ 表征。其中 $\mathbf H$ 从预训练信道数据集随机抽取并归一化为单位平均功率，即 $\|\mathbf H\|_F^2=N_rN_t$；发射符号向量 $\mathbf x$ 由从当前样本所分配星座集中随机选取符号生成；接收信号 $\mathbf y$ 按式 (1) 加 AWGN 计算；噪声方差 $\sigma^2$ 由跨样本变化的 SNR 水平决定。

为确保对实际损伤的鲁棒性，预训练中通过向信道矩阵引入估计误差来模拟不完美 CSI，建模为 $\hat{\mathbf H}=\mathbf H+\mathbf E$，其中 $\mathbf E$ 为零均值、方差 $\sigma_{\rm CSI}^2$ 的独立高斯元素随机误差矩阵。训练数据中纳入不同 CSI 误差水平，以确保 GFM 能应对实际部署中不同程度的信道不确定性。

为适应变化的实值流维数 $N$ 与星座集 $\mathcal S$，整体预训练损失表述为训练数据分布上经验交叉熵的期望：

$$
\mathcal L_{\rm pre}=\mathbb E_{\{\mathbf H,\mathbf x,\mathbf y,\sigma,N,S\}\sim\mathcal D_{\rm pre}}
\left[-\frac{1}{N}\sum_{i=1}^{N}\sum_{a_s\in\mathcal S}
\mathbb I_{x_i=a_s}\log P_{L,is}\right], \tag{25}
$$

其中 $\mathbb I(\cdot)$ 为表示真实符号标签的指示函数，$P_{L,is}$ 为激活的解码器头 ${\rm MLP}_{D,S}$ 所产生预测后验 $\mathbf P_L$ 的第 $(i,s)$ 个元素，表示 GFM 对 $x_i=a_s$ 的预测概率。

### C. 参数高效微调

为应对第 II-B 节所述下游系统区间中不可避免的模型失配，我们通过轻量微调适配预训练 GFM 以构造场景特定检测器。为确保最小开销下的快速适配，我们采用 PEFT 技术，保持模型大部分参数冻结。下面介绍针对 GFM 各组件定制的 PEFT 策略，如图 3 所示。

对 MPNN 与解码器头，我们在其各自的 MLP（即 ${\rm MLP}_M$ 与 ${\rm MLP}_{D,S}$）中插入 Adapter 块 [46]。³ 从信号处理角度看，这些适配器充当可学习的“局部补偿器”，校准消息传递核与判决边界以适应场景特定的干扰几何与非线性失真。具体地，对输入特征 $\mathbf R$，Adapter 计算为

$$
\mathbf R'=\mathbf R+{\rm ReLU}\left({\rm LN}(\mathbf R)\mathbf W^{(A)}_{\rm down}\mathbf W^{(A)}_{\rm up}\right), \tag{26}
$$

其中 ${\rm LN}(\cdot)$ 表示层归一化，$\mathbf W^{(A)}_{\rm down}$ 与 $\mathbf W^{(A)}_{\rm up}$ 为可训练的下、上投影矩阵，构成维数 $r_A$ 的瓶颈结构。

作为对局部调整的补充，我们对每个 GT 块采用低秩适配（LoRA）方法 [47] 以重新校准全局干扰建模。由于 MHA 机制依赖可学习查询与值投影矩阵捕获不同用户流间的依赖，LoRA 在这些预训练权重旁并行注入可训练低秩分解矩阵：

$$
\mathbf Z'=\mathbf Z\left(\mathbf W_*+\frac{\alpha}{r_L}\mathbf W^{(L)}_{\rm down}\mathbf W^{(L)}_{\rm up}\right),
\qquad \mathbf W_*\in\left\{\mathbf W_Q,\mathbf W_V\right\}, \tag{27}
$$

³ 与 MPNN、解码器头类似，插入的 Adapter 块同样在各层间共享。

其中 $\mathbf W_*$ 表示冻结的预训练投影矩阵，$\mathbf W^{(L)}_{\rm down}\in\mathbb R^{d\times r_L}$ 与 $\mathbf W^{(L)}_{\rm up}\in\mathbb R^{r_L\times d}$ 为可训练低秩矩阵（$r_L\ll d$），$\alpha\ge r_L$ 为控制适配强度的缩放因子。该途径使 GFM 能以极少微调样本把注意力焦点适配到特定干扰条件。

通过只更新这些轻量参数，GFM 有效学到潜表示所需的平移与缩放以应对下游失配，同时避免对通用检测先验的灾难性遗忘。微调阶段使用有限样本 $\mathcal D_{\rm FT}$ 使预训练 GFM 对齐下游区间，该阶段损失函数可表示为

$$
\mathcal L_{\rm FT}=\mathbb E\left[-\frac{1}{N_{\rm FT}}\sum_{i=1}^{N_{\rm FT}}
\sum_{a_s\in\mathcal S_{\rm FT}}\mathbb I_{x_i=a_s}\log P_{L,is}\left(\Theta_{\rm FT}|\Theta_{\rm Base}\right)\right], \tag{28}
$$

其中期望在 $\mathcal D_{\rm FT}$ 上取，$N_{\rm FT}$ 与 $\mathcal S_{\rm FT}$ 分别为目标下游区间的流维数与星座集，$\Theta_{\rm FT}$ 与 $\Theta_{\rm Base}$ 表示可训练适配参数与冻结的预训练骨干。与预训练阶段不同，此处梯度流仅限 PEFT 模块。该 PEFT 设计以最小计算与数据需求实现快速适配，便于在动态无线环境中部署。

**图 3：** GFM 内各组件的 PEFT 结构（Adapter 插入 MPNN 的消息 MLP 与解码器 MLP，LoRA 插入 GT 的自注意力 Q/K/V；图例区分冻结、可训练与非参数部分）。

**图 4：** GFM 每层中 MoE 结构的示意（路由器依据样本特征在 Expert 1/2 间做 Top-1 门控，未被选中的专家输出以零张量补齐后与选中者拼接）。

### D. 面向推断效率的专家混合学习

为平衡性能与效率，我们把 MoE 机制 [48] 集成进 GFM 架构。主要动机是缓解基础模型的推断开销——它们通常无论任务难度都激活全部参数集。由于每个 GFM 层由并行的 MPNN 与 GT 分支组成，这两个组件可视为具有互补感受野的专门专家。虽然同时使用两个专家能改善泛化，但激活特定专家往往已足以处理某些实例。因此我们在模型每层内集成带 top-1 门控的 MoE 结构，为每个输入动态选择最相关专家，在保持检测性能的同时降低推断计算开销与能耗。

如图 4 所示，该 MoE 机制在微调阶段启用。把它与 PEFT 技术结合，我们形成**适配混合（mixture-of-adaptations）**途径 [49], [50]，便于跨下游区间高效部署。为此，设计一个轻量路由器评估当前输入的物理特征 $\mathbf g=\psi(\mathbf y,\mathbf H,\sigma^2)$ 并输出二值选择信号。如表 II 所示，路由器由三层全连接层接 Softmax 激活组成，所得概率经 argmax 转为二值判决。基于该信号，MoE 对专家的整体计算进行门控，只允许被选分支（MPNN 或 GT）处理输入。为保留预训练的双分支模板以供后续解码器投影，在绕过专家的输出处以零张量补齐。

**表 II：** 路由器架构。

| 输入：物理特征 $\mathbf g=\psi(\mathbf y,\mathbf H,\sigma^2)$ | | |
|---|---|---|
| FC 层 | 输入维/输出维 | 激活 |
| 1 | $\dim(\mathbf g)$/32 | BN+ReLU |
| 2 | 32/16 | BN+ReLU |
| 3 | 16/2 | BN+Softmax |
| 输出：二值专家选择信号 | | |

注：FC 为全连接，BN 为批归一化。

这种动态路由策略适应变化的信道条件。在干扰轻微时，路由器倾向于优先简单的 MPNN 专家；反之，在严重非线性失真或稠密干扰环境中，它可把信号路由到更有表现力的 GT 专家。微调期间，路由器与 PEFT 参数联合学习，以针对不同输入特征建立合适的专家选择策略。推断期间，这种输入相关选择以最小性能退化降低平均计算复杂度。

为使路由器准确感知多样传输条件，我们经验性地选取一组能指示关键信道与干扰特性的特征构造向量 $\mathbf g$，具体定义为

$$
\mathbf g=\left[g_{\rm int},g_{\rm dis},g_{\rm peak},g_{\rm SNR}\right]^\top. \tag{29}
$$

这里 $g_{\rm int}=\frac{\|\mathbf H^\top\mathbf H\|_F^2-\|{\rm diag}(\mathbf H^\top\mathbf H)\|_2^2}{\|{\rm diag}(\mathbf H^\top\mathbf H)\|_2^2}$ 表示流间干扰比，量化信道矩阵的正交性；$g_{\rm dis}=\|\mathbf y\|_1/(\sqrt M\|\mathbf y\|_2)$ 捕获少比特 ADC 诱导的非线性失真；$g_{\rm peak}=\sqrt M\|\mathbf y\|_\infty/\|\mathbf y\|_2$ 度量归一化峰值幅度，反映 PA 饱和引起的幅度压缩；$g_{\rm SNR}=\|\mathbf y\|_2/(\sqrt M\sigma)$ 反映经验 SNR，并进一步与相位噪声漂移耦合。这些特征提供对每个检测实例特性的多方面洞见，使路由器能做出有依据的专家选择。

## IV. 数值结果

### A. 实验细节

**1）仿真设置：** 信道场景、基础数据集构造与下游系统区间的详细设置如下。

**信道场景与基础数据集：** 为模拟实际大规模 MIMO 上行传输，我们用符合 3GPP TR 38.901 标准 [45] 的 QuaDRiGa 工具箱 [51] 生成多样信道数据集。如第 III-B 节所述，其中包含多种系统配置与场景，以学习用于大规模 MIMO 检测的通用 GFM。具体地，我们仿真非视距（NLoS）环境：位于 25 m 高处的 BS 采用多种天线阵列几何，包括 ULA 与 3GPP-3D 平面配置；BS 服务高 1.5 m 的单天线 UE，UE 均匀分布在 50 m 至 300 m 距离内，散布于 120° 扇区或半径 100 m 的圆内。

预训练与通用测试信道数据集的详细配置汇总于表 III。预训练时，信道采样在中心频率 $f_c\in\{2.6,5.9\}$ GHz 执行；频域变换在 10 MHz 带宽内的 128 个有效子载波上进行。D1 至 D5 的每个预训练数据集包含六种代表性 MIMO 维数，即 $N_r\times N_t\in\{512\times128,256\times128,128\times64,128\times32,64\times32,64\times16\}$，由此每个数据集产生 38,400 个信道样本（6 种配置 × 50 次用户掉落 × 128 个子载波），并按 24:1 划分为训练与验证。测试时，GFM 的鲁棒性在三个具有不同配置、且用户掉落与预训练数据集空间不重叠的子集上检验，以防止数据泄漏。分布内（ID）集 D6 包含 $512\times128$ 与 $256\times128$ MIMO 配置下的 12,800 个样本，其系统参数组合相对预训练数据集是未见过的。零样本泛化通过两个各含 6,400 个样本的 OOD 集检验：D7 引入 $96\times32$ MIMO 配置下的农村宏小区（RMa）环境；D8 进一步偏移到上 6 GHz（U6G）频带，采用 $1024\times128$ XL-MIMO 配置。

**表 III：** 基础信道数据集概览。

| 集合类型 | 编号 | $f_c$ (GHz) | 天线阵 | 信道场景 | UE 分布 | 样本数 |
|---|---|---|---|---|---|---|
| 预训练集 | D1 | 2.6, 5.9 | 3GPP-3D | UMa | 扇区 | 38,400 |
| 预训练集 | D2 | 2.6, 5.9 | ULA | UMa | 扇区 | 38,400 |
| 预训练集 | D3 | 2.6, 5.9 | ULA | UMa | 圆 | 38,400 |
| 预训练集 | D4 | 2.6, 5.9 | 3GPP-3D | UMi | 扇区 | 38,400 |
| 预训练集 | D5 | 2.6, 5.9 | ULA | UMi | 扇区 | 38,400 |
| 通用测试集 | D6（ID） | 2.6, 5.9 | ULA | UMi | 圆 | 12,800 |
| 通用测试集 | D7（OOD） | 5.9 | 3GPP-3D | RMa | 扇区 | 6,400 |
| 通用测试集 | D8（OOD） | 6.8（U6G） | 3GPP-3D | RMa | 扇区 | 6,400 |

**信号与误差配置：** 为丰富训练数据生成中的信号多样性，我们随机施加 16-QAM 至 256-QAM 的调制方案，SNR 在 $[4,36]$ dB 内变化。为模拟实际信道获取的不完美，向 50% 的训练样本注入随机 CSI 估计误差；误差方差 $\sigma_{\rm CSI}^2$ 选为使 CSI 归一化均方误差（NMSE）处于 $[-27,-10]$ dB，促使 GFM 在信道不确定性下学习稳健检测映射。

**下游区间配置：** 在基础数据集之外，我们针对第 II-B 节讨论的代表性下游区间特化预训练 GFM，以进一步评估可适应性。具体地，对少比特 ADC 区间，采用标准 mid-rise 均匀量化器 [31] 与 3 比特分辨率以模拟显著量化误差。对振荡器相位噪声，UE 与 BS 天线的相位漂移标准差设为 $\sigma_{\theta,{\rm UE}}=\sigma_{\theta,{\rm BS}}=4^\circ$（≈0.07 rad）以反映典型损伤水平 [35]。对非线性 PA，按 [33] 用饱和电平 $A_{\rm sat}=1$、平滑因子 $p=2$ 的 Rapp 模型刻画 UE 侧失真，并配合 16-QAM 以触发幅度相关压缩。最后，对小区间干扰，干扰强度用干扰加噪声与热噪声之比量化，固定为 $10\log_{10}((\rho+\sigma^2)/\sigma^2)=10$ dB 以模拟实际场景 [34]。对每个区间，构建含 11,520 个样本的数据集（5,120 用于微调、6,400 用于测试），以支持微调样本量从 128 到 5,120 的少样本性能验证。

**2）模型超参数与训练细节：** 下面介绍预训练与微调阶段的 GFM 超参数与训练细节。

**实现与预训练设置：** 所有模型在 PyTorch 中实现，并在 NVIDIA H100 GPU 上训练。GFM 骨干级联 $L=5$ 层，每个 GT 块隐藏维数 $d_Z=256$、$H=16$ 个注意力头。在 MPNN 与解码器头内，三层 MLP 的隐藏维数为 $d_{h1}=128$、$d_{h2}=64$，消息尺寸 $d_U=16$。MPNN 的谱卷积阶数固定为 $C=3$。这些超参数选择产生含 2.19M 参数的紧凑模型，在模型表现力、内存开销与计算效率之间取得平衡。GFM 用 Adam 优化器预训练 200 轮，初始学习率 $7\times10^{-4}$，批大小 64。为保证稳定，若验证损失连续 10 轮停滞则学习率减半，最小学习率设为 $1\times10^{-6}$。

**微调细节：** 除另有说明，每个下游区间的微调阶段进行 50 轮。对 PEFT 结构，Adapter 瓶颈维数设为 $r_A=4$，LoRA 采用秩 $r_L=4$、缩放因子 $\alpha=8$。鉴于可训练参数数量有限，LoRA 与 Adapter 块的学习率分别提高至 $1\times10^{-3}$ 与 $5\times10^{-3}$。此外，施加耐心值 10 轮的早停以缓解过拟合。

**3）基线：** 我们把 GFM 与一系列代表性传统及基于学习的 MIMO 检测器对比。尽管 NN 基线参数量更小，它们代表了极具竞争力的最先进参照：

- **LMMSE [4]：** 标准线性估计器，通过第 III-A2 节所述基于 Cholesky 分解的低复杂度求逆实现，不含迭代精炼。
- **EP [30]：** 第 II-C 节详述的标准基于 EP 的 MIMO 检测器，$L=5$，同样采用基于 Cholesky 分解的求逆。
- **GEPNet [12]：** 一种最先进的基于学习的 MIMO 检测器，用全连接 MPNN 增强 EP。我们采用其公开实现⁴并在与 GFM 相同的设置下训练。
- **EP-GT：** 一个强注意力基线，以 EP 的估计为输入并用 GT [26] 精炼。为公平比较，该 GT 采用 $L=5$ 层，架构、超参数与训练策略均与所提 GFM 相同。

⁴ 见 https://github.com/GNN-based-MIMO-Detection/GNN-based-MIMO-Detection。

### B. 分布内性能

我们首先在 ID 测试数据集 D6 上评估 GFM。性能以不同 SNR 水平下的误比特率（BER）衡量，如图 5 所示。全部评估中，BER 累积至最多 $10^7$ 比特被传输。结果表明，GFM 在所有 SNR 水平下都取得改善的 BER 性能，优于传统方法与基于学习的检测器。具体地，如图 5(a) 所示，对 $256\times128$ MIMO 与 16-QAM 调制，GFM 在 BER 为 $10^{-4}$ 处相对最佳基线 EP-GT 取得约 0.5 dB 增益。在图 5(b) 所示的 $512\times128$ MIMO 与更具挑战性的 64-QAM 调制下，GFM 相对全部基线保持性能优势。这表明 GFM 在预训练中有效学到了稳健的检测映射。

**图 5：** ID 测试数据集 D6 上的 BER 性能：(a) $256\times128$ MIMO 与 16-QAM；(b) $512\times128$ MIMO 与 64-QAM（图例：LMMSE、EP、GEPNet、EP-GT、GFM）。

我们随后在图 6 中考察 GFM 在不完美 CSI 下的鲁棒性，其测试 NMSE 范围（向下至 $-29$ dB、向上至 $-9$ dB）设得宽于预训练区间 $[-27,-10]$ dB，以评估外推能力。具体地，图 6(a) 评估 $256\times128$ MIMO 与 16-QAM，图 6(b) 考虑 $512\times128$ MIMO 与 256-QAM。可以看到，GFM 在两种场景下都相对传统与基于学习基线保持明确优势：例如，对目标 BER $10^{-2}$，GFM 可容忍的 CSI NMSE 水平比基线所需高 0.5 dB 至 4 dB。图 6(a) 中 LMMSE 与 EP 的对比揭示了 CSI 误差受限的瓶颈（EP 性能随 CSI 不准确而退化），而图 6(b) 主要受噪声受限。尽管条件不同且均有挑战，GFM 在缓解信道不确定性影响与噪声污染两方面都持续表现出韧性。

**图 6：** 不完美 CSI 下的 BER 性能（ID 数据集 D6）：(a) $256\times128$ MIMO、16-QAM，SNR = 24 dB；(b) $512\times128$ MIMO、256-QAM，SNR = 28 dB。

### C. 分布外鲁棒性研究

本小节评估预训练 GFM 在两个 OOD 数据集 D7 与 D8 上的零样本性能，它们具有未见过的传播场景、频带与天线尺度配置。我们首先考虑数据集 D7，其运行于 RMa 传播环境、天线比 $N_t/N_r=1/3$，该比值被严格排除在预训练数据集之外。如图 7 所示，尽管农村环境具有典型的严苛信道条件，GFM 在完全不适配的情况下相对基线取得更显著的增益。这表明模型学到了对严重分布偏移稳健的可迁移干扰表示。

**图 7：** OOD 测试数据集 D7 上的 BER 性能（RMa 场景、$96\times32$ MIMO、64-QAM）。

我们进一步研究 GFM 在 U6G XL-MIMO 配置（即数据集 D8）下的可扩展性：它涉及向 6.8 GHz 频带、扩展的 $1024\times128$ 阵列以及 RMa 传播模型的偏移。鉴于其与预训练的显著偏离，这种联合域偏移挑战模型的韧性。如图 8 所示，GFM 适应更大的阵列配置与高频传播的变化，相对全部基线保持一致的性能优势。这些结果证实所提 GFM 在受测的传播场景、频带与阵列尺度偏移下具有泛化潜力。

**图 8：** OOD 测试数据集 D8 上的 BER 性能（U6G XL-MIMO RMa 系统、$1024\times128$ MIMO、64-QAM）。

### D. 跨下游区间的少样本性能

在评估预训练 GFM 及其零样本泛化之外，我们进一步研究 GFM 在第 II-B 节引入的代表性下游区间上的少样本适配性能。对比分析涉及不同少样本量（如 128 与 1280 个样本）下的四种适配方案，以评估预训练与微调策略的有效性：1）“GFM FullFT FromScratch”以随机权重初始化模型并通过全参数微调优化；2）“GFM FullFT Pre-trained”继承在基础数据集 D1–D5 上预训练的权重并做全参数微调；3）“GFM PEFT”同样使用预训练权重，但仅微调轻量适配模块而冻结骨干；4）“GFM MoE PEFT”把条件感知的专家路由机制与 PEFT 策略集成。该实验设置旨在量化预训练基础知识在少样本条件下加速迁移到不同区间的价值，并验证所提 PEFT 与 MoE 能否逼近全参数适配的性能。此外，为提供针对失配的基于模型基线，我们引入损伤感知 EP（记为“EP Revised”）：假定已知损伤参数，它通过 Bussgang 分解补偿幅度非线性，并通过预白化缓解乘性相位漂移与小区间干扰。

**图 9：** 相位噪声区间下的少样本适配 BER 性能：(a) SNR = 28 dB 时 BER 随微调样本量的变化；(b) BER 随 SNR 的变化（对比 GFM FullFT FromScratch、GFM FullFT Pre-trained、GFM PEFT、GFM MoE PEFT、EP、EP Revised、GEPNet Full-shot、EP-GT Full-shot）。

相位噪声区间下的少样本适配 BER 性能见图 9。具体地，图 9(a) 给出固定 SNR 为 28 dB 时 BER 随微调样本量的变化，表明所提 PEFT 途径仅用 128 个微调样本即快速收敛。该策略只更新 1.10% 的参数，却在约 12% 的差距内逼近全量微调精度，从而最小化适配开销。

> **原文疑点：** 原文两处（§IV-D 与 §IV-E）均称 PEFT 在“约 12% 以内”（within approximately 12%）逼近全量微调精度，但未说明该比例的度量口径（是 BER 相对差距、百分点差、还是其他指标）；按表 V 数据复核：相位噪声下全量微调 BER 为 6.52e-4、完整 PEFT 为 7.04e-4（相对差距约 8%），非线性 PA 下为 3.00e-4 对 3.36e-4（约 12%），故 12% 更接近后者。本译按原文照录并加注。

此外，“GFM FullFT FromScratch”与预训练 GFM 之间的性能差距说明了基础预训练的收益——从头训练的模型在这种数据稀缺条件下难以学到有意义的干扰表示。值得注意的是，经 PEFT 适配的 GFM 优于统计式“EP Revised”以及在全部 5,120 个微调样本上训练的全样本学习基线（GEPNet 与 EP-GT），证明了本文方法在处理相位漂移方面的优越性。基于 MoE 的方案也保持了基础 GFM 的快速收敛，仅相对全激活架构产生轻微性能差距。图 9(b) 进一步佐证了这些发现：使用有限微调样本时，“GFM PEFT”在所有 SNR 下取得最具竞争力的性能，而基于 MoE 的变体呈现可比的 BER。

图 10 中其他区间呈现类似趋势。无论对抗少比特 ADC、非线性 PA 失真还是有色小区间干扰，“GFM PEFT”都仅用 128 个训练样本（全数据集的 2.5%）一致优于经典与基于学习基线，表明其无需损伤参数先验即可适配多样失真。最后，MoE 路由动态激活专家以降低推断开销（详见第 IV-F 节），同时在给定 1280 个样本（全数据集的 25%）时保持高精度。

**图 10：** 不同下游系统区间下的少样本适配 BER 性能（16-QAM 调制）：(a) 少比特 ADC，$512\times128$ MIMO；(b) 非线性 PA，$256\times128$ MIMO；(c) 小区间干扰，$256\times128$ MIMO。

### E. 消融研究

为评估 GFM 各组件在预训练中的单独贡献，我们进行消融研究，把完整 GFM 与两个变体比较：1）GFM w/o MPNN，移除 MPNN 分支；2）GFM w/o GT，去掉 GT 块。这些变体在 CSI 不确定性变化的 ID 数据集 D6 以及 SNR 变化的 OOD 数据集 D7 上的 BER 汇总于表 IV。可以看到，完整 GFM 在所有场景下取得最低 BER，而移除任一组件都导致明显性能退化，证实整合局部与全局特征提取的必要性。

**表 IV：** ID（D6）与 OOD（D7）场景下 GFM 组件的消融研究（BER 性能）。

| 方法 | ID：D6，$512\times128$ MIMO，256-QAM，不完美 CSI，SNR = 28 dB（NMSE dB：−29 / −25 / −21） | OOD：D7，$96\times32$ MIMO，64-QAM，RMa-NLoS（SNR dB：28 / 32 / 36） |
|---|---|---|
| GFM（2.19M） | **2.04e-3** / **7.69e-3** / **2.86e-2** | **2.58e-2** / **2.82e-3** / **1.94e-4** |
| GFM w/o MPNN（2.03M） | 7.03e-3 / 1.44e-2 / 3.25e-2 | 7.51e-2 / 2.76e-2 / 8.58e-3 |
| GFM w/o GT（0.11M） | 5.76e-3 / 1.46e-2 / 3.16e-2 | 7.00e-2 / 2.78e-2 / 8.65e-3 |

注：(~) 表示参数量，粗体标最佳结果。参数量不线性相加（0.11 + 2.03 ≠ 2.19），因为移除 GT 或 MPNN 分支后解码器头的输入维数收缩（绕过拼接）。

为评估 GFM 内各组件 PEFT 策略（图 3）的影响，我们考察不同 PEFT 组合在代表性下游区间上的 BER 性能。相位噪声与非线性 PA 区间在 SNR = 28 dB 下的消融结果汇总于表 V。比较表明，全部模块组件的联合适配（即 GT LoRA、MPNN Adapter 与 Decoder Adapter）对取得最佳性能必不可少，移除任一组件都导致性能下降。

**表 V：** 下游区间 PEFT 组件的消融研究（SNR = 28 dB 时的 BER）。

| 场景 | Full FT (100%) | GT LoRA (0.96%) | MPNN Ada. (0.07%) | Dec. Ada. (0.07%) | GT LoRA + MPNN Ada. (1.03%) | GT LoRA + Dec. Ada. (1.03%) | MPNN Ada. + Dec. Ada. (0.14%) | GT LoRA + MPNN Ada. + Dec. Ada. (1.10%) |
|---|---|---|---|---|---|---|---|---|
| 相位噪声 | **6.52e-4** | 7.70e-4 | 4.60e-3 | 9.22e-4 | 8.14e-4 | 7.40e-4 | 8.51e-2 | *7.04e-4* |
| 非线性 PA | **3.00e-4** | 5.04e-4 | 7.22e-2 | 6.92e-4 | 3.45e-4 | 5.25e-4 | 5.79e-4 | *3.36e-4* |

注：(~%) 表示 GFM 内可训练参数占比；“Dec.”表示解码器头，“Ada.”表示 Adapter 模块。粗体标最佳结果，下划线标次佳；本表以斜体表示原文下划线标记的次佳结果。

> **原文疑点：** 表 V 相位噪声行中，“MPNN Ada. + Dec. Ada.”组合（可训练参数仅 0.14%）的 BER 为 8.51e-2，比单独使用 Dec. Ada.（0.07%，9.22e-4）差约 90 倍，也远差于其他组合，而原文未对该异常给出解释（例如训练不稳定性或该组合在此场景下的适配冲突）。本表按原文照录数值并加注。

这一“Full PEFT”配置（最后一列）优于所有其他 PEFT 组合，并在只更新总参数 1.10% 的情况下于约 12% 的差距内逼近全量微调性能，表明所提 PEFT 设计的高效性。

### F. 计算复杂度分析

本小节以每次符号向量检测所需的浮点运算数（FLOPs，在 200 次信道使用上平均）为指标，考察所提检测器相对基线的计算复杂度。该指标在两种具有不同 MIMO 规模的代表性区间下用 PyTorch profiler 记录，如表 VI 所示。虽然基础 GFM 相对 GEPNet 表现出更低复杂度，但为每个实例激活全部模型参数仍然计算密集。相反，集成动态 MoE 路由机制后，可依据感知到的任务难度只条件性激活最相关专家模块（MPNN 或 GT），从而解决该问题。如表 VI 所量化，带 MoE 的 GFM 相对其全激活对应物使 FLOPs 降低 80–83%。具体地，对 $256\times128$（$512\times128$）系统，单独 MPNN 与 GT 专家分别需要 0.388G（0.457G）与 2.452G（2.517G）FLOPs；路由器在 97.0%（95.5%）的实例中自适应激活轻量 MPNN 专家，其余路由到 GT 专家。尽管相对 EP 仍有差距（约 4× 至 6.5× FLOPs），MoE 机制有效弥合了效率鸿沟。这些结果与前述子节观察到的性能增益相结合，证实所提框架在检测精度与计算效率之间取得了理想折中。

**表 VI：** 每次符号向量检测的平均推断复杂度（FLOPs）。

| 方法 | 非线性 PA，$256\times128$ MIMO | 少比特 ADC，$512\times128$ MIMO |
|---|---|---|
| EP | 0.069G | 0.138G |
| GEPNet（0.11M） | 9.102G | 9.171G |
| EP-GT（2.03M） | 2.252G | 2.404G |
| GFM（2.19M） | 2.665G | 2.734G |
| GFM w MoE（2.19M） | 0.450G | 0.550G |

注：(~) 表示参数量。

## V. 结论

本文提出一种面向大规模 MIMO 检测的无线原生 GFM，采用统一局部消息传递与全局 Transformer 注意力的混合架构。通过迭代注入源自 EP 算法的物理干扰信息，该物理信息架构经大规模预训练实现通用干扰表示与精确符号检测。此外，设计了 PEFT 策略，以可适应性化解泛化瓶颈，从而以最小开销快速迁移到异构部署区间；嵌入的 MoE 机制则动态激活必要模块以降低推断成本。数值结果表明，所提 GFM 在多样零样本与少样本条件下一致优于经典与数据驱动基线。

## 参考文献（英文原条目，按原文顺序）

[1] Z. Wang et al., “A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 3, pp. 1560–1605, 3rd Quart. 2024.

[2] M. Shafi et al., “Industrial viewpoints on RAN technologies for 6G,” *arXiv preprint arXiv:2508.08225*, 2025.

[3] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, “Generative diffusion models for high dimensional channel estimation,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 7, pp. 5840–5854, Jul. 2025.

[4] S. Yang and L. Hanzo, “Fifty years of MIMO detection: The road to large-scale MIMOs,” *IEEE Commun. Surveys Tuts.*, vol. 17, no. 4, pp. 1941–1988, 4th Quart. 2015.

[5] E. Agrell, T. Eriksson, A. Vardy, and K. Zeger, “Closest point search in lattices,” *IEEE Trans. Inf. Theory*, vol. 48, no. 8, pp. 2201–2214, Aug. 2002.

[6] 3GPP TR 38.843, “Study on artificial intelligence (AI)/machine learning (ML) for NR air interface (Release 18),” Tech. Rep., Dec. 2023. [Online]. Available: https://www.3gpp.org/ftp/Specs/archive/38_series/38.843/38843-200.zip

[7] X. Lin, “Toward AI-native 6G air interface: A 3GPP perspective on protocol framework,” *arXiv preprint arXiv:2606.27466*, 2026.

[8] J. Hoydis, F. A. Aoudia, A. Valcarce, and H. Viswanathan, “Toward a 6G AI-native air interface,” *IEEE Commun. Mag.*, vol. 59, no. 5, pp. 76–81, 2021.

[9] N. Samuel, T. Diskin, and A. Wiesel, “Learning to detect,” *IEEE Trans. Signal Process.*, vol. 67, no. 10, pp. 2554–2564, May 2019.

[10] M. Khani, M. Alizadeh, J. Hoydis, and P. Fleming, “Adaptive neural signal detection for massive MIMO,” *IEEE Trans. Wireless Commun.*, vol. 19, no. 8, pp. 5635–5648, Aug. 2020.

[11] N. Shlezinger, J. Whang, Y. C. Eldar, and A. G. Dimakis, “Model-based deep learning,” *Proc. IEEE*, vol. 111, no. 5, pp. 465–499, 2023.

[12] A. Kosasih, V. Onasis, V. Miloslavskaya, W. Hardjawana, V. Andrean, and B. Vucetic, “Graph neural network aided MU-MIMO detectors,” *IEEE J. Sel. Areas Commun.*, vol. 40, no. 9, pp. 2540–2555, Sep. 2022.

[13] K. Pratik, B. D. Rao, and M. Welling, “RE-MIMO: Recurrent and permutation equivariant neural MIMO detection,” *IEEE Trans. Signal Process.*, vol. 69, pp. 459–473, 2021.

[14] R. Bommasani et al., “On the opportunities and risks of foundation models,” *arXiv preprint arXiv:2108.07258*, 2021.

[15] L. Liang et al., “Large language models for wireless communications: From adaptation to autonomy,” *IEEE Commun. Mag.*, vol. 64, no. 5, pp. 140–147, May 2026.

[16] B. Liu, X. Liu, S. Gao, X. Cheng, and L. Yang, “LLM4CP: Adapting large language models for channel prediction,” *J. Commun. Inf. Netw.*, vol. 9, no. 2, pp. 113–125, Jun. 2024.

[17] Y. Sheng, K. Huang, L. Liang, P. Liu, S. Jin, and G. Y. Li, “Beam prediction based on large language models,” *IEEE Wireless Commun. Lett.*, vol. 14, no. 5, pp. 1406–1410, May 2025.

[18] T. Zheng and L. Dai, “Large language model enabled multi-task physical layer network,” *IEEE Trans. Commun.*, vol. 74, pp. 307–321, 2026.

[19] S. Alikhani, G. Charan, and A. Alkhateeb, “Large wireless model (LWM): A foundation model for wireless channels,” *arXiv preprint arXiv:2411.08872*, 2024.

[20] B. Liu, S. Gao, X. Liu, X. Cheng, and L. Yang, “WiFo: Wireless foundation model for channel prediction,” *Sci. China Inf. Sci.*, vol. 68, no. 6, p. 162302, Jun. 2025.

[21] T. Yang et al., “WirelessGPT: A generative pre-trained multi-task learning framework for wireless communication,” *IEEE Network*, vol. 39, no. 5, pp. 58–65, Sep. 2025.

[22] Y. Sheng et al., “A wireless foundation model for multi-task prediction,” *arXiv preprint arXiv:2507.05938*, 2025.

[23] Z. Yang, S. Gao, X. Cai, X. Cheng, and L. Yang, “WiFo-MUD: Wireless foundation model for heterogeneous multi-user demodulator,” *arXiv preprint arXiv:2601.00612*, 2026.

[24] Y. Shen, J. Zhang, S. H. Song, and K. B. Letaief, “Graph neural networks for wireless communications: From theory to practice,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 5, pp. 3554–3569, May 2023.

[25] J. Liu et al., “Graph foundation models: Concepts, opportunities and challenges,” *IEEE Trans. Pattern Anal. Mach. Intell.*, vol. 47, no. 6, pp. 5023–5044, Jun. 2025.

[26] C. Ying et al., “Do transformers really perform badly for graph representation?” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2021, pp. 28 877–28 888.

[27] J. Jumper et al., “Highly accurate protein structure prediction with AlphaFold,” *Nature*, vol. 596, no. 7873, pp. 583–589, Aug. 2021.

[28] Y. Sheng, J. Wang, L. Liang, H. Ye, and S. Jin, “A graph foundation model for wireless resource allocation,” *arXiv preprint arXiv:2604.07390*, 2026.

[29] L. Rampášek, M. Galkin, V. P. Dwivedi, A. T. Luu, G. Wolf, and D. Beaini, “Recipe for a general, powerful, scalable graph transformer,” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2022, pp. 14 501–14 515.

[30] J. Céspedes, P. M. Olmos, M. Sánchez-Fernández, and F. Perez-Cruz, “Expectation propagation detection for high-order high-dimensional MIMO systems,” *IEEE Trans. Commun.*, vol. 62, no. 8, pp. 2840–2849, Aug. 2014.

[31] C.-K. Wen, C.-J. Wang, S. Jin, K.-K. Wong, and P. Ting, “Bayes-optimal joint channel-and-data estimation for massive MIMO with low-precision ADCs,” *IEEE Trans. Signal Process.*, vol. 64, no. 10, pp. 2541–2556, May 2016.

[32] E. Björnson, J. Hoydis, M. Kountouris, and M. Debbah, “Massive MIMO systems with non-ideal hardware: Energy efficiency, estimation, and capacity limits,” *IEEE Trans. Inf. Theory*, vol. 60, no. 11, pp. 7112–7139, Nov. 2014.

[33] J. Gonçalves, M. Teresa Nogueira, D. Dinis, J. Guerreiro, and R. Dinis, “On the optimum detection of MIMO-SVD signals with strong nonlinear distortion effects at the transmitter,” *IEEE Access*, vol. 13, pp. 3230–3241, 2025.

[34] X. Zhao, M. Li, B. Wang, E. Song, T.-H. Chang, and Q. Shi, “Efficient LMMSE equalization for massive MIMO systems under decentralized baseband processing architecture,” *IEEE J. Sel. Areas Commun.*, vol. 43, no. 3, pp. 736–751, Mar. 2025.

[35] A. Pitarokoilis, S. K. Mohammed, and E. G. Larsson, “Uplink performance of time-reversal MRC in massive MIMO systems subject to phase noise,” *IEEE Trans. Wireless Commun.*, vol. 14, no. 2, pp. 711–723, Feb. 2015.

[36] C. Rapp, “Effects of HPA-nonlinearity on a 4-DPSK/OFDM-signal for a digital sound broadcasting system,” in *Proc. ESA Eur. Conf. Satell. Commun. (ECSC)*, Oct. 1991, pp. 179–184.

[37] M. W. Seeger, “Expectation propagation for exponential families,” Univ. Calif., Berkeley, CA, USA, Tech. Rep., 2005. [Online]. Available: https://infoscience.epfl.ch/record/161464

[38] X. Zhou, J. Zhang, C.-K. Wen, S. Jin, and S. Han, “Graph neural network-enhanced expectation propagation algorithm for MIMO turbo receivers,” *IEEE Trans. Signal Process.*, vol. 71, pp. 3458–3473, 2023.

[39] Q. Lu, S. Luan, and X.-W. Chang, “GCEPNet: Graph convolution-enhanced expectation propagation for massive MIMO detection,” in *Proc. IEEE Global Commun. Conf. (GLOBECOM)*, 2024, pp. 444–449.

[40] A. Scotti, N. N. Moghadam, D. Liu, K. Gafvert, and J. Huang, “Graph neural networks for massive MIMO detection,” *arXiv preprint arXiv:2007.05703*, Jul. 2020.

[41] G. H. Golub and C. F. Van Loan, *Matrix Computations*, 4th ed. Baltimore, MD, USA: Johns Hopkins Univ. Press, 2013.

[42] M. Wu, B. Yin, G. Wang, C. Dick, J. R. Cavallaro, and C. Studer, “Large-scale MIMO detection for 3GPP LTE: Algorithms and FPGA implementations,” *IEEE J. Sel. Topics Signal Process.*, vol. 8, no. 5, pp. 916–929, Oct. 2014.

[43] C. Studer, S. Fateh, and D. Seethaler, “ASIC implementation of soft-input soft-output MIMO detection using MMSE parallel interference cancellation,” *IEEE J. Solid-State Circuits*, vol. 46, no. 7, pp. 1754–1765, Jul. 2011.

[44] A. Vaswani et al., “Attention is all you need,” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2017.

[45] 3GPP TR 38.901, “Study on channel model for frequencies from 0.5 to 100 GHz (Release 17),” Tech. Rep., Apr. 2022. [Online]. Available: https://www.etsi.org/deliver/etsi_tr/138900_138999/138901/17.00.00_60/tr_138901v170000p.pdf

[46] A. Gui, J. Ye, and H. Xiao, “G-adapter: Towards structure-aware parameter-efficient transfer learning for graph transformer networks,” in *Proc. AAAI*, vol. 38, no. 11, 2024, pp. 12 226–12 234.

[47] E. J. Hu et al., “LoRA: Low-rank adaptation of large language models,” *arXiv preprint arXiv:2106.09685*, 2021.

[48] W. Fedus, B. Zoph, and N. Shazeer, “Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity,” *J. Mach. Learn Res.*, vol. 23, no. 120, pp. 1–39, Apr. 2022.

[49] Y. Wang et al., “Adamix: Mixture-of-adaptations for parameter-efficient model tuning,” in *Proc. Empir. Methods Natural Lang. Process. (EMNLP)*, 2022, pp. 5744–5760.

[50] Q. Liu et al., “When MoE meets LLMs: Parameter efficient fine-tuning for multi-task medical applications,” in *Proc. ACM SIGIR Conf. Res. Develop. Inf. Retr.*, 2024, pp. 1104–1114.

[51] S. Jaeckel, L. Raschkowski, K. Börner, and L. Thiele, “QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials,” *IEEE Trans. Antennas Propag.*, vol. 62, no. 6, pp. 3242–3256, Jun. 2014.

**原文插图：** 原 PDF 中的图 1–10 未重传至本页，仅保留中文图注与图中关键标注（如架构各层、子模块结构、BER 曲线图例与子图编号）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.06361v1（cs.IT，13 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–V 节（含 II-A–C、III-A–D（III-A 下再分 1)–5) 小节）、IV-A–F 等全部小节）、结论、全部图注（图 1–10，含子图说明）、表 I–VI（逐格转录；表 IV/V 的粗体/下划线标记以译文粗体/斜体对应并在表注说明）、公式 (1)–(29)（含 (5a)–(8b) 子式）与 51 条参考文献英文原条目；原文无附录、无作者简介。**逐句终校未做**：表 I（四类失配）、表 II（路由器三层）、表 III（D1–D8 数据集）、表 IV（消融 BER）、表 V（PEFT 组合 BER，含粗体/下划线）、表 VI（FLOPs）均已用 PDF 页面渲染逐格核对；式 (9)–(12)、(21)–(24)、(29) 亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①§IV-D/§IV-E 的“约 12% 以内逼近全量微调”未说明度量口径，按表 V 复核相位噪声约 8%、非线性 PA 约 12%；②表 V 相位噪声行“MPNN Ada. + Dec. Ada.”组合 BER 8.51e-2 异常（比单独 Dec. Ada. 差约 90 倍），原文未解释。均按原文照录，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
