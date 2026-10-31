---
layout: page
title: "频域信道外推的泛化学习｜中文全文译文"
permalink: /papers/translations/2026-09-28-2505-13867-generalizable-learning-for-frequency-domain-channel-extrapolation-unde/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/91124ea5f492b97f/) · [原文 arXiv](https://arxiv.org/abs/2505.13867) · [全部目录](/papers/catalog/)

# 频域信道外推的泛化学习

**原题：** Generalizable Learning for Frequency-Domain Channel Extrapolation under Distribution Shift  
**作者：** Haoyu Wang（王浩宇）、Zhi Sun（孙智，Senior Member, IEEE）、Shuangfeng Han（韩双锋，Senior Member, IEEE）、Xiaoyun Wang（王晓云）、Zhaocheng Wang（王昭诚，Fellow, IEEE）  
**单位：** 清华大学电子工程系（北京 100084）；中国移动研究院（北京 100053）。通讯作者：Zhi Sun。  
**版本：** arXiv:2505.13867v1（eess.SP），v1 日期 2025 年 5 月 20 日；原文 16 页（含附录 A–C）。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2505.13867v1 [eess.SP] 20 May 2025"，与库内登记编号 2505.13867 一致；首页脚注给出国家重点项目资助（2022YFB2902004）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–16 中文图注、表 I–II 逐格转写、附录 A–C（含 (33)–(44) 的推导与证明），以及参考文献 39 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

频域信道外推可有效降低大规模多输入多输出（MIMO）系统的导频开销。近来，基于深度学习（DL）的信道外推器已成为对复杂频域依赖关系建模的有力候选。然而，现有 DL 外推器在分布偏移下无法在未见环境中工作，这给大规模部署带来挑战。本文从物理视角实现分布对齐，从而实现信道外推的环境泛化学习。首先，严格分析无线信道的分布偏移，它由多径结构的分布偏移与单径响应的分布偏移组成。其次，提出基于物理的渐进式分布对齐策略以应对分布偏移，包括相继的路径导向设计与路径对齐。路径导向 DL 外推器把多径信道外推分解为对提取路径的并行外推，可缓解多径结构的分布偏移。路径对齐用于应对路径导向 DL 外推器中单径响应的分布偏移，最终实现信道外推的泛化学习。仿真中用精确射线追踪工具生成不同无线环境。大量评估表明，与现有最先进方法相比，所提带路径对齐的路径导向 DL 外推器可在未见环境中将外推误差降低 6 dB 以上。

**索引词：** 信道外推、大规模 MIMO、深度学习、域泛化、分布对齐。

## I. 引言

超高谱效（spectral efficiency，SE）是 B5G 与 6G 无线通信的关键指标，对支撑沉浸式多感官媒体 [1] 与自动驾驶 [2] 等众多先进应用至关重要。大规模多输入多输出（MIMO）利用大规模天线阵列，是极具竞争力的超高谱效方案 [3]。尽管具备大空间分集与复用增益，信道状态信息（CSI）获取的导频开销也随天线数增加而上升，从而限制大规模 MIMO 系统的有效吞吐 [4]。因此，低开销 CSI 获取是未来大规模 MIMO 系统以超高谱效提供优质服务的关键。

频域信道外推是降低大规模 MIMO 系统导频开销的有效途径 [5]–[7]。由于角度与延迟互易性 [8]，不同频段的 CSI 在物理信道上共享相同传播路径，因而呈现强依赖关系。因此，频域信道外推旨在根据另一频段上测得的 CSI 推断目标频段的 CSI。例如，在频分双工（FDD）大规模 MIMO 系统中，可由上行 CSI 测量外推下行 CSI [5]–[7]，相比现有的信道估计与反馈方案可消除下行导频开销。

传统信道外推方法是基于模型的，即根据估计的路径参数计算目标 CSI [5], [6]。典型路径参数估计算法包括内点法 [5] 与空间交替广义期望最大化（SAGE）算法 [6]。然而，现有路径参数估计算法因对超参数设置敏感、算法初始化不当以及目标函数非凸，无法精确恢复每条物理路径的参数 [5]。此外，噪声与不可分辨多径分量之间的干扰会增大路径参数估计误差。因此，直接用估计路径参数计算目标 CSI 无法保证精确的信道外推。

与传统基于模型的方法相比，深度学习（DL）是精确信道外推的有效途径。得益于深度神经网络（DNN）的通用逼近能力 [9]，DL 外推器在拟合不同频段 CSI 的非线性依赖方面具有优势 [7], [10]–[12]。近来，多种 DNN 被用于信道外推，包括多层感知机（MLP）[7], [10]、长短期记忆（LSTM）网络 [11], [13] 与变分自编码器（VAE）[12]。尽管 DNN 结构不同，现有 DL 外推器大多以端到端方式工作，可归类为**信道导向**方法，即 DNN 的输入与输出都是包含多条路径的 CSI。

尽管在精确信道外推方面潜力巨大，DL 外推器在分布偏移下面临环境泛化性挑战。现有 DL 外推工作假设训练与测试数据集服从同一分布。在监督学习框架下，DL 外推器可对同分布 CSI 样本精确拟合频域依赖关系；然而，当用分布外（out-of-distribution，OOD）信道样本测试时，其外推无法得到保证 [14]–[16]。实践中，DL 外推器的训练数据集在某一特定无线环境（如一个街区）内采集，训练 CSI 样本的分布由影响多径传播的因素（如用户位置与建筑布局）决定。由于不同环境中用户位置与建筑布局多样，CSI 样本分布也明显偏移。因此，在新环境中运行 DL 外推器时不可避免出现 OOD 样本，从而带来环境泛化性挑战。

为提升 DNN 在目标环境中的性能，已有若干学习范式被设计出来，包括域自适应 [17]、迁移学习 [7], [18] 与元学习 [7], [18]。虽然上述学习范式带来了环境泛化性，但其训练阶段仍需要目标环境的样本。具体地，这些学习范式训练阶段的 DNN 先用源环境数据集预训练，再用目标环境样本微调。然而，无线信道的时变特性会在应用上述学习范式时带来巨大的数据采集负担。同时，微调阶段涉及复杂反向传播与优化，耗时且不适合实时部署 [15]。因此，上述学习范式无法实现跨环境的信道外推泛化学习。

无需目标环境训练样本的环境泛化性可大幅降低 DL 外推器大规模部署的成本，具有重要实际意义。当前增强环境泛化性的最先进方法包括数据增强 [14], [15] 与分层神经网络结构设计 [19]。数据增强是增强基于 DL 的 CSI 获取（尤其是信道反馈）环境泛化性的常用方法 [20]–[22]。数据增强可增加训练数据集中 CSI 样本的多样性，有助于 DNN 的 OOD 拟合能力。典型数据增强方法包括角度–延迟域随机循环移位 [20]、翻转 [21] 与随机相位旋转 [22]。尽管经验上带来了泛化增益，数据增强仍无法解决环境泛化的根本困难。具体地，决定 CSI 样本分布的多径传播因素多样而复杂，因此数据增强方案无法生成未知目标环境下多径传播条件下的 CSI 数据集。结果是传统数据增强无法缓解分布偏移，甚至引入新的分布偏置 [23]。近来提出的分层 HORCRUX 外推器 [19] 由两级级联的神经网络信道划分器与小型神经网络距离估计器组成。由于分层设计，HORCRUX 外推器可为后续路径长度优化生成细粒度初始猜测，经验上增强了跨环境泛化性。然而，神经网络信道划分器以观测信道为输入，且 HORCRUX 外推器不同层神经网络中的分布偏移并未被处理。因此在无线信道分布偏移下，HORCRUX 外推器会出现易错的信道划分与初始猜测，进而恶化路径长度优化并导致较大外推误差。

本文提出基于物理的分布对齐策略，以实现分布偏移下信道外推的泛化学习。首先，严格建模跨不同环境的无线信道分布偏移，它由多径结构的分布偏移与单径响应的分布偏移组成。其次，提出基于物理的分布对齐策略，逐步处理无线信道的分布偏移，包含路径导向设计与路径对齐两个相继步骤。受我们前期工作 [24] 启发，路径导向 DL 外推器可把多径信道外推分解为对每条提取路径的外推，从而直观地处理多径结构的分布偏移。得益于路径导向设计，单径响应的分布偏移可由路径对齐有效处理。第三，设计模型训练与评估流程以适配路径导向 DL 外推器与路径对齐，包括训练中的标签协同变换与测试阶段的输出协同补偿。第四，推导带路径对齐的路径导向结构的泛化误差上界，从理论上说明分布对齐策略对环境泛化性的增强作用。为评估所提路径导向 DL 外推器的性能，我们在精确射线追踪工具 Wireless Insite [25] 中生成不同环境。与当前最先进方法相比，带路径对齐的路径导向 DL 外推器可在未见环境中把外推误差降低 6 dB 以上。同时，带路径对齐的路径导向 DL 外推器的环境泛化性与其分布对齐度量一致，这为我们的设计提供了具有理论解释的可信度。

本文主要贡献总结如下。

- 严格分析跨不同环境的无线信道分布偏移，它由多径结构的分布偏移与单径响应的分布偏移组成。
- 提出带路径对齐的路径导向 DL 外推器，从物理视角渐进实现分布对齐目标。
- 设计模型训练与评估流程以适配带路径对齐的路径导向 DL 外推器；同时，从理论上说明基于物理的分布对齐对环境泛化性的有效性。

**记号：** 大写粗体字母表示矩阵（如 $\mathbf X$），小写粗体字母表示向量（如 $\mathbf x$）。$\mathbb C^{m\times n}$ 表示维度为 $m\times n$ 的复空间，$\mathrm j=\sqrt{-1}$。$(\cdot)^T$、$(\cdot)^H$ 分别表示转置与共轭转置。$\mathrm{conj}(\cdot)$ 表示逐元素共轭。$\otimes$ 与 $\odot$ 分别表示 Kronecker 积与 Hadamard 积。$\mathbf 1_n$ 表示 $n$ 维全 1 列向量。$\mathbf F_n$ 表示 $n\times n$ 的归一化离散傅里叶变换（DFT）矩阵。$\mathbb E\{\cdot\}$ 表示统计期望。$\mathcal U(a,b)$ 表示 $a$ 与 $b$ 之间的均匀分布。$\delta(x)$ 表示 Dirac 函数。$[\mathbf x]_n$ 表示向量 $\mathbf x$ 的第 $n$ 个元素。$|x|$ 表示标量 $x$ 的绝对值。$\|\mathbf x\|$ 表示向量 $\mathbf x$ 的欧氏范数。$\|\mathbf X\|_F$ 表示矩阵 $\mathbf X$ 的 Frobenius 范数。$\mathrm{supp}(P)$ 表示分布 $P$ 的支撑。$\sup$ 与 $\inf$ 分别表示上确界与下确界。$f\circ g$ 表示函数 $f$ 与 $g$ 的复合。

## II. 无线信道的分布偏移

本节先在 §II-A 给出宽带信道模型与频域信道外推，再在 §II-B 分析无线信道的分布偏移，它导致 DL 外推器的环境泛化挑战。

### A. 信道模型与信道外推

本文考虑宽带大规模 MIMO 系统：配备 $N_T$ 天线均匀平面阵列（UPA）的基站（BS）服务单天线用户。基于几何 Saleh–Valenzuela 信道模型 [26]，BS 与用户之间频率 $f$ 处的多径信道 $\mathbf h(f)\in\mathbb C^{N_T\times1}$ 可建模为

$$
\mathbf h(f)=\sum_{l=1}^{L}\alpha_le^{-\mathrm j2\pi f\tau_l}\mathbf a(\varphi_l,\theta_l), \tag{1}
$$

其中 $L$ 表示路径数。对第 $l$ 条路径，$\alpha_l$ 表示复增益，$\tau_l$ 表示延迟，$\varphi_l$ 与 $\theta_l$ 表示到达角（AoA）的方位角与俯仰角，$\mathbf a(\cdot,\cdot)$ 表示阵列响应。假设 UPA 水平与垂直方向各有 $N_h$ 与 $N_v$ 根天线，则阵列响应 $\mathbf a(\varphi,\theta)$ 可计算为 $\mathbf a(\varphi,\theta)=\mathbf a^{(h)}(\varphi,\theta)\otimes\mathbf a^{(v)}(\theta)$，其中

$$
\mathbf a^{(h)}(\varphi,\theta)=\frac{1}{\sqrt{N_h}}\left[1,e^{\mathrm j2\pi\delta_h},\dots,e^{\mathrm j2\pi(N_h-1)\delta_h}\right]^T,\qquad
\mathbf a^{(v)}(\theta)=\frac{1}{\sqrt{N_v}}\left[1,e^{\mathrm j2\pi\delta_v},\dots,e^{\mathrm j2\pi(N_v-1)\delta_v}\right]^T, \tag{2}
$$

其中 $\delta_h=\frac{d}{\lambda}\sin(\varphi)\sin(\theta)$、$\delta_v=\frac{d}{\lambda}\cos(\theta)$，$d$ 表示天线间距，$\lambda$ 表示波长。不失一般性，采用 $d=\lambda/2$ 的半波长间距。

如图 1 所示，信道外推旨在根据测量频段的信道推断目标频段的未知信道，可大幅减轻大规模 MIMO 系统的信道估计开销。记测量频段与目标频段的子载波集合分别为 $\mathcal B_m=\{f_i^{(m)}\}_{i=1}^{K_m}$ 与 $\mathcal B_e=\{f_i^{(e)}\}_{i=1}^{K_e}$，其中 $K_m$ 与 $K_e$ 分别表示测量与目标子载波数。为简化，假设 $\mathcal B_m$ 与 $\mathcal B_e$ 中子载波频率具有相同间隔 $\Delta f$。在适度的频率外推范围内，由于传播环境中物理路径相同，测量与目标频段之间的空间互易性成立 [8]。基于式 (1)，测量信道 $\mathbf H^{(m)}\in\mathbb C^{N_T\times K_m}$ 与目标信道 $\mathbf H^{(e)}\in\mathbb C^{N_T\times K_e}$ 可写为

$$
\mathbf H^{(x)}=\sum_{l=1}^{L}\alpha_le^{-\mathrm j2\pi f_1^{(x)}\tau_l}\mathbf a(\varphi_l,\theta_l)\mathbf b_x^H(\tau_l) \tag{3}
$$

其中

$$
\mathbf b_x(\tau)=\left[1,e^{\mathrm j2\pi\Delta f\tau},\dots,e^{\mathrm j2\pi(K_x-1)\Delta f\tau}\right]^T, \tag{4}
$$

$x\in\{m,e\}$ 是测量或目标频段的指示符。于是目标信道外推可表述为如下映射

$$
\psi:\mathbb C^{N_T\times K_m}\to\mathbb C^{N_T\times K_e},\qquad \mathbf H^{(m)}\mapsto\mathbf H^{(e)}=\psi\left(\mathbf H^{(m)}\right). \tag{5}
$$

得益于强大的逼近能力，DL 外推器常用于拟合目标映射 $\psi$。现有 DL 外推器大多是信道导向的，即以 $\mathbf H^{(m)}$ 为输入，试图拟合期望输出 $\mathbf H^{(e)}$ [7], [10], [12]。在监督学习框架下，带输入与标签的训练（源）数据集 $\mathcal D^{(c)}$ 可表示为

$$
\mathcal D^{(c)}=\left\{\left(\mathbf H_i^{(m)},\mathbf H_i^{(e)}\right)\mid i=1,\dots,M\right\}, \tag{6}
$$

其中 $M$ 表示训练样本数，$(\mathbf H_i^{(m)},\mathbf H_i^{(e)})$ 表示 $\mathcal D^{(c)}$ 中第 $i$ 个输入–标签对。DL 外推器采用均方误差（MSE）作为损失函数，定义为

$$
\mathcal L_{\mathcal G}(\xi)=\mathbb E_{(\mathbf H^{(m)},\mathbf H^{(e)})\sim\mathcal G}\left\{\left\|\mathbf H^{(e)}-\xi\left(\mathbf H^{(m)}\right)\right\|_F^2\right\} \tag{7}
$$

其中 $\mathcal G$ 为样本分布，$\xi$ 为 DL 外推器。于是训练好的信道导向 DL 外推器 $\xi^\star$ 由最小化训练损失得到，即 $\xi^\star=\arg\min_{\xi\in\mathcal F}\mathcal L_{\mathcal D^{(c)}}(\xi)$。这里 $\mathcal F$ 表示 DL 外推器的假设空间，由所采用的神经网络类型及其结构配置决定。

### B. 分布偏移分析

理解分布偏移对增强 DL 外推器的环境泛化性至关重要。假设训练数据集 $\mathcal D^{(c)}$ 抽取自联合分布 $(\mathbf H^{(m)},\mathbf H^{(e)})\sim P^{(c)}$。由贝叶斯公式，联合分布 $P^{(c)}$ 可分解为

$$
P^{(c)}=P^{(c)}_{\mathbf H^{(e)}|\mathbf H^{(m)}}\times P^{(c)}_{\mathbf H^{(m)}}. \tag{8}
$$

这里分布偏移包含两部分，即条件分布 $P^{(c)}_{\mathbf H^{(e)}|\mathbf H^{(m)}}$ 的偏移与边缘分布 $P^{(c)}_{\mathbf H^{(m)}}$ 的偏移。基于底层映射 $\psi$ 的存在性，条件分布 $P^{(c)}_{\mathbf H^{(e)}|\mathbf H^{(m)}}$ 可写为 $P^{(c)}_{\mathbf H^{(e)}|\mathbf H^{(m)}}=\delta(\mathbf H^{(e)}-\psi(\mathbf H^{(m)}))$。因此 $P^{(c)}_{\mathbf H^{(e)}|\mathbf H^{(m)}}$ 的偏移等价于底层映射 $\psi$ 的偏移，如下所述。

**命题 1：** 对具有稀疏信道的宽带大规模 MIMO 系统，可假设不同无线环境之间存在不变映射 $\psi$。

**证明：** 对宽带大规模 MIMO 系统在角度与延迟域的高分辨率，稀疏无线信道存在由 $\mathbf H^{(m)}$ 到路径参数 $\{\alpha_l,\tau_l,\varphi_l,\theta_l\}_{l=1}^L$ 的底层映射 $\psi_1$。由于系统参数配置固定（即 $\{N_h,N_v,K_m,\Delta f\}$ 固定）且式 (1) 的通用信道模型成立，可假设不同环境之间存在相同 $\psi_1$。一旦获得路径参数 $\{\alpha_l,\tau_l,\varphi_l,\theta_l\}_{l=1}^L$，目标信道 $\mathbf H^{(e)}$ 便由式 (3) 得到，该过程可记为映射 $\psi_2$。类似地，在 $\{N_h,N_v,K_e,\Delta f\}$ 系统设置固定时，不同环境之间也可得到不变 $\psi_2$。由于 $\psi=\psi_2\circ\psi_1$ 成立，因此不同环境之间存在共同 $\psi$。

边缘分布 $P^{(c)}_{\mathbf H^{(m)}}$ 的偏移是联合分布 $P^{(c)}$ 偏移的主要原因。由于多径效应，$\mathbf H^{(m)}$ 是多条路径响应之和，这使 $P^{(c)}_{\mathbf H^{(m)}}$ 变得复杂。这里定义第 $l$ 条物理路径在测量频段的响应为

$$
\mathbf A_l=\alpha_le^{-\mathrm j2\pi f_1^{(m)}\tau_l}\mathbf a(\varphi_l,\theta_l)\mathbf b_m^H(\tau_l), \tag{9}
$$

测量信道可重写为 $\mathbf H^{(m)}=\sum_{l=1}^{L}\mathbf A_l$。由全概率公式，$\mathbf H^{(m)}$ 的概率密度可分解为

$$
p\left(\mathbf H^{(m)}\right)=\mathbb E_L\left\{p\left(\mathbf H^{(m)}\mid L\right)\right\}=\sum_{k}\underbrace{P(L=k)}_{\text{因子 (i)}}\int_{\Omega_L}\underbrace{p\left(\mathbf A_1,\dots,\mathbf A_L\mid L=k\right)}_{\text{因子 (ii) 与 (iii)}}\prod_{l=1}^{L}\mathrm d\mathbf A_l, \tag{10}
$$

其中 $P(L=k)$ 表示路径数等于 $k$ 的概率，$p(\mathbf A_1,\dots,\mathbf A_L\mid L=k)$ 表示 $(\mathbf A_1,\dots,\mathbf A_L)$ 的联合分布，$\Omega_L=\{(\mathbf A_1,\dots,\mathbf A_L)|\sum_{l=1}^{L}\mathbf A_l=\mathbf H^{(m)}\}$。如式 (10) 下括号所示，边缘分布 $p(\mathbf H^{(m)})$ 受 3 个不同因子影响：(i) 路径数的分布；(ii) 多径依赖性；(iii) 单径响应的边缘分布。为表达简洁，因子 (i) 与 (ii) 可合并为多径结构的分布。

下面用两个示例环境说明无线信道的分布偏移，如图 2 所示。由于反射体数量与部署方式不同，示例环境 1 中有两条路径，而示例环境 2 中有三条路径。此外，两环境中的路径在几何与电磁特性上表现出不同的相对关系，导致多径依赖性的偏移。路径数与多径依赖性的变化都导致多径结构的分布偏移。而且，考虑无线传播条件与用户位置分布的不同，单径响应的边缘分布也明显变化，如图 2 底部所示。因此，传播条件与用户位置的不同导致无线信道跨环境的分布偏移。

> **图 1（原文 Fig. 1）：** 左侧示出频域信道外推，右侧示出物理路径的响应。叉形标记表示测量与目标子载波。

> **图 2（原文 Fig. 2）：** 两个示例环境之间分布偏移的示意。上方为两环境的二维几何布局，用户分布在蓝色框内；下方为两环境中路径响应相应的边缘分布。

训练与测试环境之间无线信道的分布偏移导致监督学习框架下的环境泛化问题。通过最小化训练损失 $\mathcal L_{\mathcal D^{(c)}}(\xi)$，训练好的 DL 外推器 $\xi^\star$ 可对来自源环境分布 $P^{(c)}_{\mathbf H^{(m)}}$ 的样本 $\mathbf H^{(m)}$ 达到较高逼近精度。然而，对 $P^{(c)}_{\mathbf H^{(m)}}$ 之外的样本，训练好的 DL 外推器 $\xi^\star$ 的拟合精度无法保证。考虑上述 $P^{(c)}_{\mathbf H^{(m)}}$ 的分布偏移，训练好的外推器在具有不同传播条件的新环境中性能将明显退化，这给 DL 外推器的部署带来挑战。

**注 1：** 无线信道的分布偏移由多径结构的分布偏移与单径响应的分布偏移组成，二者由跨环境多样的传播相关因素（如建筑布局与用户位置）导致。因此，未见测试环境中可能出现大量 OOD 信道样本，使训练好的 DL 外推器性能急剧退化。

## III. 以带路径对齐的路径导向 DL 外推器降低分布偏移

§III-A 提出基于物理的渐进式分布对齐策略以处理无线信道的分布偏移，它包含路径导向 DL 外推器设计与路径对齐；随后 §III-B 与 §III-C 分别详述。

### A. 基于物理的渐进式分布对齐

输入分布对齐可从根本上增强 DL 外推器的环境泛化性。在监督学习框架下，神经网络在训练数据集输入分布下可逼近目标函数 $\psi$。基于命题 1 中目标函数的环境不变性，当测试环境的输入分布与训练环境对齐时，训练好的神经网络的泛化性可得到保证。为此，基于 §II-B 的分布偏移分析，提出基于物理的分布对齐，讨论如下。

路径导向 DL 外推器可有效缓解多径结构的分布偏移，如图 3 左侧所示。从物理角度看，多径信道的外推可按路径分解。具体地，多径信道的外推可分解为对每条路径的外推，即

$$
\mathbf H^{(e)}=\psi\left(\mathbf H^{(m)}\right)=\sum_{l=1}^{L}\psi\left(\mathbf A_l\right). \tag{11}
$$

同时，宽带大规模 MIMO 系统中的无线信道在角度–延迟域呈现稀疏性，这便于从测量多径信道中提取路径响应。基于上述可分解性与稀疏性，我们提出路径导向 DL 外推器设计：先提取路径响应，再对每条提取路径并行做 DL 外推。对训练好的路径导向 DL 外推器，神经网络只捕捉每条提取路径响应的频域相关性，从而解耦提取路径的数量与依赖性。因此，多径结构的偏移可被有效缓解。

> **图 3（原文 Fig. 3）：** 基于物理的分布对齐策略示意，可渐进降低无线信道跨环境的分布偏移。

路径对齐可降低单径响应的分布偏移，如图 3 右侧所示。与多径信道的分布相比，提取路径响应的分布自由度（DoF）相对较低，这便于设计路径对齐方法。

**注 2：** 无线信道的分布对齐以逻辑渐进方式实现。首先，路径导向设计消除多径结构的分布偏移；随后，路径对齐可进一步降低提取路径的分布偏移，最终实现分布对齐。

**注 3：** 基于物理的设计对分布对齐是必要的。具体地，路径提取与路径对齐都基于信道模型知识设计，不依赖任何训练数据。相反，虽然分层 HORCRUX 外推器提出了分治设计以增强环境泛化性，其子信道划分同样是数据驱动的 [19]；同时各子信道中的边缘分布偏移也未被处理。因此，训练与未知测试信道样本之间的严重分布偏移会降低 HORCRUX 外推器的环境泛化性。

### B. 步骤 1：路径导向 DL 外推器设计

路径导向 DL 外推器是分布对齐的第一步，用于缓解多径结构的分布偏移，其概览如图 4 所示。具体地，先从 $\mathbf H^{(m)}$ 中提取路径响应 $\{\hat{\mathbf A}_l\}_{l=1}^{\hat L}$，其中 $\hat L$ 表示提取路径数。记角度–延迟域表示为 $\mathbf H^{(m,ad)}=\mathbf T\mathbf H^{(m)}\mathbf F_{K_m}^H$ 与 $\hat{\mathbf A}_l^{(ad)}=\mathbf T\hat{\mathbf A}_l^{(m)}\mathbf F_{K_m}^H$，其中 $\mathbf T=\mathbf F_{N_h}\otimes\mathbf F_{N_v}$。如图 4 所示，提取路径响应的功率集中在角度–延迟域。为此，我们采用 SAGE [27] 与聚类算法提取路径响应。每条提取响应旨在逼近单条物理路径的响应，或角度与延迟参数相近的多条物理路径的聚合响应。首先，对 $\mathbf H^{(m)}$ 应用 SAGE 算法，输出估计参数 $\hat\Theta^{(m)}=\{\hat\alpha_k^{(m)},\hat\varphi_k^{(m)},\hat\theta_k^{(m)},\hat\tau_k^{(m)}\}_{k=1}^{\hat L^{(m)}}$。由于 SAGE 算法的交替特性与有限精度，$\hat\Theta^{(m)}$ 中的估计参数并非物理路径的真值参数 $\{\alpha_l,\varphi_l,\theta_l,\tau_l\}_{l=1}^{L}$。实践中 $\hat\Theta^{(m)}$ 中的估计参数通常表现为围绕真值路径参数的多个子路径，这在真实信道测量中可观察到 [28]。因此我们采用 DBSCAN 算法 [29] 聚类，它能自动选择最优簇数。为便于 DBSCAN 聚类，估计路径之间的距离 $D(\hat\omega_k,\hat\omega_l)$ 定义为

$$
D\left(\hat{\boldsymbol\omega}_k,\hat{\boldsymbol\omega}_l\right)=\sqrt{\sum_{i=1}^{3}\left|e^{\mathrm j[\hat{\boldsymbol\omega}_k]_i}-e^{\mathrm j[\hat{\boldsymbol\omega}_l]_i}\right|^2}, \tag{12}
$$

其中 $\hat{\boldsymbol\omega}_k=\left[\pi\sin(\hat\varphi_k^{(m)})\sin(\hat\theta_k^{(m)}),\ \pi\cos(\hat\theta_k^{(m)}),\ 2\pi\Delta f\hat\tau_k^{(m)}\right]^T$。利用聚类后的参数，第 $l$ 条提取路径的响应 $\hat{\mathbf A}_l$ 可由第 $l$ 簇内各子路径响应求和得到，即

$$
\hat{\mathbf A}_l=\sum_{k\in\mathcal I_l^{(m)}}\hat\alpha_k^{(m)}e^{-\mathrm j2\pi f_1^{(m)}\hat\tau_k^{(m)}}\mathbf a\left(\hat\varphi_k^{(m)},\hat\theta_k^{(m)}\right)\mathbf b_m^H\left(\hat\tau_k^{(m)}\right), \tag{13}
$$

其中 $\mathcal I_l^{(m)}$ 表示第 $l$ 簇的索引子集。随后，我们可对提取路径响应 $\hat{\mathbf A}_l$ 并行做 DL 外推。

与基于模型的信道外推器不同，所提路径导向 DL 外推器直接依赖提取响应 $\{\hat{\mathbf A}_l\}$ 的精度，对参数估计误差更鲁棒。一方面，考虑 SAGE 算法的单调性 [27]，可获得较低的逼近误差 $\|\mathbf H^{(m)}-\sum_{l=1}^{\hat L}\hat{\mathbf A}_l\|_F^2$。另一方面，借助 DBSCAN 聚类，$\hat{\mathbf A}_l$ 可逼近单条物理路径或角度与延迟参数相近的多条物理路径的响应，从而实现鲁棒路径提取。此外，由于从 $\hat{\mathbf A}_l$ 仍无法获得物理路径的精确参数（尤其在存在不可分辨物理路径与噪声时），仍需 DL 实现精确且鲁棒的信道外推。

> **图 4（原文 Fig. 4）：** 路径导向 DL 外推器设计示意。多径信道与测量频段的提取路径响应在角度–延迟域中示出，颜色越深表示功率越强。

### C. 步骤 2：路径对齐

在路径导向设计基础上，提出路径对齐以降低提取路径响应的分布偏移，其概览如图 5 所示。通过在训练与测试阶段都应用路径对齐，提取路径响应的不同分布可以低得多的方差对齐。于是，当路径导向 DL 外推器用对齐后的路径响应训练时，在未见测试环境中输入对齐路径响应仍可保证性能。

理解提取路径响应的分布偏移对路径对齐至关重要。由于 $\hat{\mathbf A}_l$ 与其角度–延迟域表示 $\hat{\mathbf A}_l^{(ad)}$ 之间存在双射，分析 $\hat{\mathbf A}_l^{(ad)}$ 的分布偏移是等价的。原始 $\hat{\mathbf A}_l^{(ad)}$ 如图 6 左上所示。可见 $\hat{\mathbf A}_l^{(ad)}$ 在角度–延迟域稀疏，且存在主导该提取路径响应功率的显著峰。因此，$\hat{\mathbf A}_l^{(ad)}$ 中峰值元素位置与取值的分布偏移对 $\hat{\mathbf A}_l^{(ad)}$ 的分布偏移起关键作用。峰值的取值偏移可通过归一化缓解。相反，峰值位置与提取的几何参数相关，包含多样的环境传播因素。例如，图 6 顶部两个峰值位置直方图来自两个环境，表现出明显分布偏移。因此，角度–延迟域峰值位置的分布偏移主导提取路径响应的分布。

为有效降低环境之间的峰值位置分布偏移，设计如下路径对齐方法。基于 DFT 性质，在 $\hat{\mathbf A}_l^{(ad)}$ 的行与列上循环移位等价于移动估计几何参数 $\{\hat\tau_k^{(m)},\hat\varphi_k^{(m)},\hat\theta_k^{(m)}\}_{k\in\mathcal I_l^{(m)}}$。因此，可对 $\hat{\mathbf A}_l^{(ad)}$ 循环移位，把其峰值元素移到固定位置，如图 6 中 spectrum-2 所示。峰值位置对齐后，训练与测试环境之间提取路径响应的分布偏移可被有效降低。然而，由于天线数与测量子载波数有限，角度–延迟域会出现功率泄漏，且无法通过循环移位消除，如图 6 中 spectrum-2 的蓝框所示。由于功率泄漏效应，峰值附近元素的功率占比增加。结果，功率泄漏会限制直接循环移位的分布对齐性能。

> **图 5（原文 Fig. 5）：** 路径对齐用于对齐训练环境与未见测试环境之间提取路径响应分布的示意。

为缓解功率泄漏效应，可用过采样因子扫描峰值位置以进行细粒度路径对齐。基于角度–延迟表示的正交性与 Parseval 定理，通过过采样可搜索到功率更高的峰值元素，同时非峰值元素功率被压低，从而缓解功率泄漏效应。记水平与垂直过采样因子为 $O_h$ 与 $O_v$，水平扫描向量 $\mathbf w_{n_1}^{(h)}$（$n_1=0,\dots,O_hN_h-1$）与垂直扫描向量 $\mathbf w_{n_2}^{(v)}$（$n_2=0,\dots,O_vN_v-1$）可表示为

$$
\mathbf w_{n_1}^{(h)}=\left[1,e^{\mathrm j2\pi\frac{n_1}{O_hN_h}},\dots,e^{\mathrm j2\pi\frac{n_1(N_h-1)}{O_hN_h}}\right]^T,\qquad
\mathbf w_{n_2}^{(v)}=\left[1,e^{\mathrm j2\pi\frac{n_2}{O_vN_v}},\dots,e^{\mathrm j2\pi\frac{n_2(N_v-1)}{O_vN_v}}\right]^T. \tag{14}
$$

记延迟域过采样因子为 $O_d$，测量频段的延迟域扫描向量 $\mathbf w_{n_3}^{(m)}$（$n_3=0,\dots,O_dK_m-1$）可表示为

$$
\mathbf w_{n_3}^{(m)}=\left[1,e^{\mathrm j2\pi\frac{n_3}{O_dK_m}},\dots,e^{\mathrm j2\pi\frac{n_3(K_m-1)}{O_dK_m}}\right]^T. \tag{15}
$$

以 $\mathbf w_{n_1,n_2}^{(h,v)}=\mathbf w_{n_1}^{(h)}\otimes\mathbf w_{n_2}^{(v)}$ 扫描，角度域峰值位置 $(\tilde n_{1,l},\tilde n_{2,l})$ 可计算为

$$
\left(\tilde n_{1,l},\tilde n_{2,l}\right)=\arg\max_{(n_1,n_2)}\left\{\left\|\left(\mathbf w_{n_1,n_2}^{(h,v)}\right)^H\hat{\mathbf A}_l\right\|_2^2\right\}. \tag{16}
$$

类似地，延迟域峰值位置 $\tilde n_{3,l}$ 可计算为

$$
\tilde n_{3,l}=\arg\max_{n_3}\left\{\left\|\hat{\mathbf A}_l\mathbf w_{n_3}^{(m)}\right\|_2^2\right\}. \tag{17}
$$

接下来，可通过调整 $\hat{\mathbf A}_l$ 中各元素的相位来等价地对齐角度–延迟域峰值位置。具体地，峰值位置为 $(n_1,n_2)$ 的角度域相位调整矩阵 $\mathbf S_a^{(m)}(n_1,n_2)\in\mathbb C^{N_T\times K_m}$ 与峰值位置为 $n_3$ 的延迟域相位调整矩阵 $\mathbf S_d^{(m)}(n_3)\in\mathbb C^{N_T\times K_m}$ 可定义为

$$
\mathbf S_a^{(m)}(n_1,n_2)=\mathrm{conj}\left(\mathbf w_{n_1,n_2}^{(h,v)}\right)\otimes\mathbf 1_{K_m}^T,\qquad
\mathbf S_d^{(m)}(n_3)=\mathbf 1_{N_T}\otimes\left(\mathbf w_{n_3}^{(m)}\right)^T. \tag{18}
$$

利用扫描得到的峰值位置 $(\tilde n_{1,l},\tilde n_{2,l},\tilde n_{3,l})$，对齐路径响应 $\tilde{\mathbf A}_l$ 可计算为

$$
\tilde{\mathbf A}_l=\left(\mathbf S_a^{(m)}(\tilde n_{1,l},\tilde n_{2,l})\odot\mathbf S_d^{(m)}(\tilde n_{3,l})\right)\odot\hat{\mathbf A}_l\triangleq\mathbf U_l\odot\hat{\mathbf A}_l. \tag{19}
$$

$\tilde{\mathbf A}_l$ 的角度–延迟域表示如图 6 中 spectrum-3 所示。可见 spectrum-3 的峰值位置已被对齐；同时与 spectrum-2 相比功率泄漏被有效抑制，从而进一步降低分布偏移。

> **图 6（原文 Fig. 6）：** 上方为提取路径响应在角度–延迟域峰值位置的分布偏移；下方为路径对齐细节。

**注 4：** 所提路径对齐与常规数据增强 [20]–[22] 不同。路径对齐旨在降低无线信道的分布偏移，在训练与测试阶段都确定性地处理提取路径响应。

**注 5：** 借助并行计算设备，路径对齐操作可并行执行。因此，路径对齐操作的实际运行时间在典型信道矩阵维度与过采样因子下大致保持恒定。

## IV. 带路径对齐的路径导向 DL 外推器的训练与评估

§IV-A 详述便于路径导向 DL 外推器与路径对齐的模型训练；模型训练之后，§IV-B 讨论测试阶段的模型评估并给出外推信道。

> **原文疑点：** 原文 §IV 引言中两次引用 §IV-B（"模型训练"与"测试阶段模型评估"），但按后文小节结构，测试阶段评估应为 §IV-C（Online Model Inference）；此处按原文照录并加注。

### A. 训练数据集准备

训练数据集应重新构造以适配带路径对齐的路径导向 DL 外推器，如图 7 左侧所示。为支持路径导向设计，需要提取路径响应 $\hat{\mathbf A}_l$ 及其在目标频段的标签 $\hat{\mathbf B}_l$。$\hat{\mathbf A}_l$ 的生成已在 §III-B 详述。为获得标签 $\hat{\mathbf B}_l$，首先对 $\mathbf H^{(e)}$ 应用 SAGE 算法，输出估计参数 $\hat\Theta^{(e)}=\{\hat\alpha_k^{(e)},\hat\varphi_k^{(e)},\hat\theta_k^{(e)},\hat\tau_k^{(e)}\}_{k=1}^{\hat L^{(e)}}$。由于不同频段之间的空间互易性，可同时对 $\hat\Theta^{(e)}$ 与 $\hat\Theta^{(m)}$ 中的估计参数聚类。标签 $\hat{\mathbf B}_l$ 于是由下式给出

$$
\hat{\mathbf B}_l=\sum_{k\in\mathcal I_l^{(e)}}\hat\alpha_k^{(e)}e^{-\mathrm j2\pi f_1^{(e)}\hat\tau_k^{(e)}}\mathbf a\left(\hat\varphi_k^{(e)},\hat\theta_k^{(e)}\right)\mathbf b_e^H\left(\hat\tau_k^{(e)}\right), \tag{20}
$$

其中 $\mathcal I_l^{(e)}$ 表示第 $l$ 簇的索引子集。与基于模型的信道外推 [6] 不同，标签 $\hat{\mathbf B}_l$ 直接从信道 $\mathbf H^{(e)}$ 提取，其精度可由 SAGE 算法的单调性与 DBSCAN 聚类保证。因此原训练数据集 $\mathcal D^{(c)}$ 可重构为

$$
\mathcal D^{(p)}=\left\{\left(\hat{\mathbf A}_{l,i},\hat{\mathbf B}_{l,i}\right)\mid l=1,\dots,\hat L_i,\ i=1,\dots,M\right\}, \tag{21}
$$

其中 $\hat L_i$ 表示 $\mathbf H_i^{(m)}$ 的提取路径数。

为保证下游 DL 外推器的学习，提取路径响应 $(\hat{\mathbf A}_l,\hat{\mathbf B}_l)$ 有两个主要要求：一方面未检测物理路径的功率占比应很小；另一方面提取路径响应应准确对应单条物理路径或多条物理路径的响应。因此需要两个新指标分别评估路径提取在漏检与物理关联保真度方面的性能。首先，归一化漏检误差（normalized missed-detection error，NMDE）定义为

$$
\mathrm{NMDE}=\frac12\left(\frac{\left\|\mathbf H^{(m)}-\sum_{l=1}^{\hat L}\hat{\mathbf A}_l\right\|_F^2}{\left\|\mathbf H^{(m)}\right\|_F^2}+\frac{\left\|\mathbf H^{(e)}-\sum_{l=1}^{\hat L}\hat{\mathbf B}_l\right\|_F^2}{\left\|\mathbf H^{(e)}\right\|_F^2}\right). \tag{22}
$$

当 NMDE 趋近于零时，未检测物理路径的影响变得可忽略。其次，物理关联误差的上界（upper bound of NPAE，UB-NPAE）定义为

$$
\mathrm{UB\text{-}NPAE}=\frac12\left(\frac{\sum_{l=1}^{\hat L}\left\|\hat{\mathbf A}_l-\sum_{k\in\mathcal K_l^\star}\mathbf A_k\right\|_F^2}{\left\|\mathbf H^{(m)}\right\|_F^2}+\frac{\sum_{l=1}^{\hat L}\left\|\hat{\mathbf B}_l-\sum_{k\in\mathcal K_l^\star}\mathbf B_k\right\|_F^2}{\left\|\mathbf H^{(e)}\right\|_F^2}\right), \tag{23}
$$

其中 $\mathbf B_k=\alpha_ke^{-\mathrm j2\pi f_1^{(e)}\tau_k}\mathbf a(\varphi_k,\theta_k)\mathbf b_e^H(\tau_k)$ 表示第 $k$ 条物理路径在目标频段的响应，$\{\mathcal K_1^\star,\mathcal K_2^\star,\dots,\mathcal K_{\hat L}^\star\}$ 表示集合 $\{1,2,\dots,L\}$ 的一个弱划分，即 $\mathcal K_{l_1}^\star\cap\mathcal K_{l_2}^\star=\varnothing$、$\bigcup_{l=1}^{\hat L}\mathcal K_l^\star=\{1,2,\dots,L\}$，且 $\mathcal K_l^\star$ 可为空。UB-NPAE 的推导见附录 A。当 UB-NPAE 趋近于零时，表明提取响应 $(\hat{\mathbf A}_l,\hat{\mathbf B}_l)$ 可准确反映物理多径分量。

此外，训练数据集 $\mathcal D^{(p)}$ 中的标签还需进一步协同变换以适配路径对齐。为保持输入与输出之间的底层函数关系，目标频段的协同变换路径响应 $\tilde{\mathbf B}_l$ 应与对齐响应 $\tilde{\mathbf A}_l$ 保持式 (5) 中相同的映射关系。基于宽带大规模 MIMO 信道模型知识，协同变换路径响应 $\tilde{\mathbf B}_l$ 如下给出。

**命题 2：** 给定式 (19) 中测量频段的对齐路径响应 $\tilde{\mathbf A}_l$，用于训练的协同变换标签 $\tilde{\mathbf B}_l$ 可表示为

$$
\tilde{\mathbf B}_l=\underbrace{e^{\mathrm j\beta(\tilde n_{3,l})}}_{\text{相位旋转}}\underbrace{\left(\mathbf S_a^{(e)}(\tilde n_{1,l},\tilde n_{2,l})\odot\mathbf S_d^{(e)}(\tilde n_{3,l})\right)}_{\text{角度–延迟域峰值位置对齐}}\odot\hat{\mathbf B}_l\triangleq\mathbf V_l\odot\hat{\mathbf B}_l, \tag{24}
$$

其中 $\mathbf S_a^{(e)}(\tilde n_{1,l},\tilde n_{2,l})=\mathrm{conj}\left(\mathbf w_{\tilde n_{1,l},\tilde n_{2,l}}^{(h,v)}\right)\otimes\mathbf 1_{K_e}^T$、$\mathbf S_d^{(e)}(\tilde n_{3,l})=\mathbf 1_{N_T}\otimes\left(\mathbf w_{\tilde n_{3,l}}^{(e)}\right)^T$，

$$
\mathbf w_{\tilde n_{3,l}}^{(e)}=\left[1,e^{\mathrm j2\pi\frac{\tilde n_{3,l}}{O_dK_m}},\dots,e^{\mathrm j2\pi\frac{\tilde n_{3,l}(K_e-1)}{O_dK_m}}\right]^T, \tag{25}
$$

且

$$
\beta\left(\tilde n_{3,l}\right)=2\pi\left(f_1^{(e)}-f_1^{(m)}\right)\frac{\tilde n_{3,l}}{O_dK_m\Delta f}. \tag{26}
$$

**证明：** 见附录 B。

基于式 (24)，标签的协同变换包含两部分。第一部分是角度–延迟域峰值位置对齐，由大规模 MIMO 信道不同频段的空间互易性导出。第二部分是相位旋转项，由信道与路径延迟相关的频域依赖性导出，完全由延迟域峰值位置 $\tilde n_{3,l}$ 决定。于是，带路径对齐的路径导向 DL 外推器的训练数据集应进一步由 $\mathcal D^{(p)}$ 重构为

$$
\mathcal D^{(pa)}=\left\{\left(\tilde{\mathbf A}_{l,i},\tilde{\mathbf B}_{l,i}\right)\mid l=1,\dots,\hat L_i,\ i=1,\dots,M\right\}, \tag{27}
$$

其中 $(\tilde{\mathbf A}_{l,i},\tilde{\mathbf B}_{l,i})$ 表示 $\mathcal D^{(p)}$ 中 $(\hat{\mathbf A}_{l,i},\hat{\mathbf B}_{l,i})$ 分别按 (19) 与 (24) 得到的对齐响应。

### B. 离线模型训练

准备好训练数据集 $\mathcal D^{(pa)}$ 后，通过最小化 $\mathcal D^{(pa)}$ 上的 MSE 损失训练神经网络 $\eta$，如图 7 右侧所示。训练时从 $\mathcal D^{(pa)}$ 中加载一批训练样本 $\{\{(\tilde{\mathbf A}_{l,i},\tilde{\mathbf B}_{l,i})\}_{l=1}^{\hat L_i}\}_{i\in\mathcal V}$，该批 $\mathcal V$ 上的 MSE 损失由 $\frac{1}{\sum_{i\in\mathcal V}\hat L_i}\sum_{i\in\mathcal V}\sum_{l=1}^{\hat L_i}\|\tilde{\mathbf B}_{l,i}-\eta(\tilde{\mathbf A}_{l,i})\|_F^2$ 计算。随后通过反向传播逐步优化神经网络 $\eta$，收敛后得到训练好的模型 $\eta^\star$。得益于式 (11) 的可分解性与式 (24) 的函数保持性，神经网络 $\eta$ 可采用与信道导向 DL 外推器相同的结构。

### C. 在线模型推理

带路径对齐的路径导向 DL 外推器在测试阶段的流程如图 8 所示。与模型训练阶段不同，我们需要输出包含多条路径的外推信道以用于评估。首先，基于 §III-B 的路径参数估计与聚类从 $\mathbf H^{(m)}$ 中提取路径响应 $\{\hat{\mathbf A}_l\}_{l=1}^{\hat L}$。随后，对提取路径响应 $\{\hat{\mathbf A}_l\}_{l=1}^{\hat L}$ 并行应用路径对齐，得到对齐路径响应 $\{\tilde{\mathbf A}_l\}_{l=1}^{\hat L}$ 及其峰值位置 $\{(\tilde n_{1,l},\tilde n_{2,l},\tilde n_{3,l})\}_{l=1}^{\hat L}$。然后，对齐路径响应被并行输入训练好的 DL 外推器 $\eta^\star$。为获得外推信道，应用路径对齐的峰值位置 $\{(\tilde n_{1,l},\tilde n_{2,l},\tilde n_{3,l})\}_{l=1}^{\hat L}$ 对 DL 外推器输出做协同补偿，如图 8 中捷径所示。具体地，输出 $\eta^\star(\tilde{\mathbf A}_l)$ 应施加与 $\mathbf V_l$ 相反的相位调整，以重定位其在角度–延迟域的峰值位置并补偿相位旋转项。于是，外推信道 $\hat{\mathbf H}^{(e)}$ 由协同补偿后的路径响应求和得到：

$$
\hat{\mathbf H}^{(e)}=\sum_{l=1}^{\hat L}\mathrm{conj}\left(\mathbf V_l\right)\odot\eta^\star\left(\tilde{\mathbf A}_l\right). \tag{28}
$$

> **图 7（原文 Fig. 7）：** 带路径对齐的路径导向 DL 外推器离线训练过程的端到端示意，包含训练数据集准备（左）与模型训练（右）。

> **图 8（原文 Fig. 8）：** 带路径对齐的路径导向 DL 外推器在测试阶段的流程（在线推理），其中捷径表示基于峰值位置的协同补偿。

## V. 带路径对齐的路径导向 DL 外推器的理论分析

本节从理论上说明分布对齐对带路径对齐的路径导向 DL 外推器环境泛化性的贡献。部署到测试环境后，带路径对齐的路径导向 DL 外推器的外推误差可计算为

$$
\mathcal J(\eta^\star)=\mathbb E_{\mathcal Q^{(pc)}}\left\{\left\|\hat{\mathbf H}^{(e)}-\mathbf H^{(e)}\right\|_F^2\right\}, \tag{29}
$$

其中 $(\{\hat{\mathbf A}_l\}_{l=1}^{\hat L},\mathbf H^{(e)})\sim\mathcal Q^{(pc)}$ 表示测试环境中的联合分布。随后分析 $\mathcal J(\eta^\star)$ 的上界。记 $P_{\tilde{\mathbf A}}^{(pa)}$ 与 $Q_{\tilde{\mathbf A}}^{(pa)}$ 分别为训练与测试环境中路径对齐后测量频段提取路径响应的边缘分布。首先给出三条假设。

**假设 1：** 分布 $P_{\tilde{\mathbf A}}^{(pa)}$ 与 $Q_{\tilde{\mathbf A}}^{(pa)}$ 的支撑均由半径 $R_1>0$ 的球界定。

**假设 2：** 目标映射 $\psi$ 与假设空间 $\mathcal F$ 中的 DL 外推器均 $R_2$-Lipschitz 连续。

**假设 3：** 条件期望 $\mathbb E\{\|\tilde{\mathbf B}_l-\eta^\star(\tilde{\mathbf A}_l)\|_F^2\mid\hat L\}$ 对 $\hat L$ 不敏感，可近似为 $\mathbb E\{\|\tilde{\mathbf B}_l-\eta^\star(\tilde{\mathbf A}_l)\|_F^2\mid\hat L\}\approx\mathbb E\{\|\tilde{\mathbf B}_l-\eta^\star(\tilde{\mathbf A}_l)\|_F^2\}$。

其次，两个分布之间的 Wasserstein-1 距离定义如下。

**定义 1：** 两个分布 $\mu$ 与 $\nu$ 的 Wasserstein-1 距离 $W_1(\mu,\nu)$ 定义为 [30, Definition 6.1]

$$
W_1(\mu,\nu)\triangleq\inf_{\gamma\sim\Gamma(\mu,\nu)}\left(\mathbb E_{(\tilde{\mathbf A}_1,\tilde{\mathbf A}_2)\sim\gamma}\left\{\left\|\tilde{\mathbf A}_1-\tilde{\mathbf A}_2\right\|_F\right\}\right), \tag{30}
$$

其中 $\Gamma(\mu,\nu)$ 表示分布 $\mu$、$\nu$ 的所有可能耦合，$\gamma$ 表示 $(\tilde{\mathbf A}_1,\tilde{\mathbf A}_2)$ 的联合分布，其边缘分别为 $\mu$ 与 $\nu$。

于是 $\mathcal J(\eta^\star)$ 的上界如下给出。

**定理 1：** 假设 $\mathcal D^{(pa)}$ 由分布 $P^{(pa)}$ 生成，则 $\mathcal J(\eta^\star)$ 的上界为

$$
\mathcal J(\eta^\star)\le\left(\mathcal L_{\mathcal D^{(pa)}}(\eta^\star)+\underbrace{\sup_{\eta\in\mathcal F}\left|\mathcal L_{\mathcal D^{(pa)}}(\eta)-\mathcal L_{P^{(pa)}}(\eta)\right|}_{\text{环境内泛化间隙}}+\underbrace{CW_1\left(P_{\tilde{\mathbf A}}^{(pa)},Q_{\tilde{\mathbf A}}^{(pa)}\right)}_{\text{环境间泛化间隙}}\right)\times\mathbb E_{\mathcal Q_{\hat L}}\left\{\hat L^2\right\}, \tag{31}
$$

其中 $\mathcal Q_{\hat L}$ 表示测试环境中提取路径数的分布，常数 $C=8R_1R_2^2$。

**证明：** 见附录 C。

**注 6：** 在合适路径提取算法与标签补偿下，仍可假设底层映射 $\tilde{\mathbf B}_l=\psi(\tilde{\mathbf A}_l)$。因此，凭借 DNN 的强大拟合能力与训练中的充分优化，最小训练损失 $\mathcal L_{\mathcal D^{(pa)}}(\eta^\star)$ 可足够小。此外，环境内泛化间隙可通过增大数据集规模渐近趋于 0 [31, Theorem 2]。与上述两部分相比，环境间泛化间隙是限制环境泛化性的内在障碍。

**注 7：** 对所提带路径对齐的路径导向 DL 外推器，环境间泛化间隙由分布距离 $W_1(P_{\hat{\mathbf A}}^{(pa)},Q_{\hat{\mathbf A}}^{(pa)})$ 控制。得益于路径导向设计与路径对齐的渐进分布对齐，与信道导向 DL 外推器相比可实现小得多的环境间泛化间隙，从而保证未见测试环境中的外推性能。

**注 8：** 在设计与理论分析中，我们未限定 DL 外推器的具体 DNN 结构。因此，带路径对齐的路径导向 DL 外推器的环境泛化性可由多种 DNN 结构实现，如 MLP [7] 与 LSTM [13]。

> **原文脚注 1：** 经数据集归一化，常数 $R_1$ 可由 $R_1=\sqrt{N_TK_m}=64$ 给出。然而 DNN 中 Lipschitz 常数 $R_2$ 的精确计算是 NP 难的，只能得到宽松上界 [33]。尽管 (31) 中的泛化上界在数值上较松，它仍可作为通过降低 Wasserstein-1 距离增强泛化性的理论指导。

## VI. 仿真研究与 sim-to-real 讨论

先给出 §VI-A 的仿真设置；随后 §VI-B 提供大量仿真结果验证带路径对齐的路径导向 DL 外推器的有效性；最后 §VI-C 讨论弥合 sim-to-real 差距的可能方案。

### A. 仿真设置

仿真中采用精确射线追踪工具 Wireless Insite [25] 生成不同环境的 CSI 样本。所考虑城市场景如图 9 左所示，它基于真实城市构建，包含三个不同环境，即 env-1、env-2 与 env-3。可见三环境的目标密度不同：env-1 目标密度最低，env-3 目标密度最高。如图 9 右所示，三种环境下主导路径数的分布不同；同时由于目标布局与用户位置不同，多径依赖性与路径响应的边缘分布也发生偏移，这验证了注 1。

系统配置详述如下。测量与目标频段的起始频率分别设为 $f_1^{(m)}=3.4$ GHz 与 $f_1^{(e)}=3.5$ GHz。测量与目标频段的子载波数设为 $K_m=K_e=32$，带宽均为 80 MHz。BS 天线数设为 $N_T=128$，其中水平与垂直方向分别为 16 与 8。BS-1/2/3 的高度分别为 25/15/20 m，用户高度为 2 m。仿真中地面反射是产生不可分辨物理路径的常见原因之一。基于几何关系，地面反射路径与其对应视距路径的最大延迟差为 $\frac{2\times2\ \mathrm m}{3\times10^8\ \mathrm{m/s}}=13.3$ ns，接近系统分辨率 $\frac{1}{80\ \mathrm{MHz}}=12.5$ ns。考虑用户与 BS 的实际水平距离，不可分辨的地面反射路径是普遍存在的。

默认学习参数设置如下：不同域采用相同过采样因子 $O_h=O_v=O_d=O=2$。每个环境的训练数据集含 10000 个信道样本，测试数据集含 2000 个信道样本，均匀采集。考虑到环境内信道功率的动态范围较大，数据集中信道样本按 $\sqrt{N_TK_x}\mathbf H^{(x)}/\|\mathbf H^{(x)}\|_F$（$x\in\{m,e\}$）归一化。训练采用 Adam 优化器 [32]，共 200 个 epoch，批大小与初始学习率分别设为 64 与 $10^{-4}$。对信道导向 DL 外推器（CO-DLE）与所提带路径对齐的路径导向 DL 外推器（PO-DLE+PA），均采用隐藏维 4096 的 5 层 MLP 作为 DNN 结构。为评估信道外推性能，采用归一化均方误差（NMSE）作为指标，定义为

$$
\mathrm{NMSE}=\mathbb E\left\{\frac{\left\|\hat{\mathbf H}^{(e)}-\mathbf H^{(e)}\right\|_F^2}{\left\|\mathbf H^{(e)}\right\|_F^2}\right\}. \tag{32}
$$

训练阶段从训练数据集中划分 10% 样本用于验证；随后采用训练过程中验证 NMSE 最小的 DNN 进行测试。

> **图 9（原文 Fig. 9）：** 左侧为 Wireless Insite 中采用的城市场景，env-$i$ 中的用户分布在由红色立方体 BS-$i$ 服务的透明矩形区域内（$i=1,2,3$）；右侧为主导路径数的直方图，主导路径数定义为占信道功率 99.9% 的最少路径数。

### B. 仿真结果

**1) 路径提取评估：** 首先在图 10 中给出训练数据集中提取路径响应的 NMDE 与 UB-NPAE。env-1、env-2、env-3 的 NMDE 均值分别为 −40.9、−31.6、−28.7 dB，相应的第 95 百分位分别为 −37.0、−26.1、−22.8 dB。结果证实未检测物理路径仅占总信道功率的很小部分。关于 UB-NPAE，在 env-1、env-2、env-3 中的均值分别为 −25.8、−20.6、−19.3 dB，第 95 百分位分别为 −24.1、−14.1、−14.1 dB，验证了物理路径关联的准确性。因此，基于 SAGE 算法与 DBSCAN 聚类的提取路径可反映真实多径分量，不会显著降低下游 DL 外推性能。

> **图 10（原文 Fig. 10）：** 路径提取的定量评估：(a) NMDE 的 CDF；(b) UB-NPAE 的 CDF。

**2) 环境内性能研究：** 在增强环境泛化性之前，所提 PO-DLE+PA 应保证环境内外推性能。为此以 CO-DLE 作为基线，图 11(a) 给出训练阶段验证样本的 NMSE。可见与 CO-DLE 相比，PO-DLE+PA 的验证 NMSE 可在低得多的水平收敛。

随后在同一环境中测试训练好的外推器以验证环境内性能。此外采用基于模型的外推器 [6] 作为另一基线，它根据路径提取步骤中 SAGE 算法的估计参数直接计算目标 CSI。三个环境的环境内外推 NMSE 如图 11(b) 所示。可见 PO-DLE 的性能明显超过基于模型的方法，说明 DL 模型对精确信道外推的必要性。同时，所提 PO-DLE 相比其 CO-DLE 对应方法平均可再降低 2.6 dB NMSE；借助路径对齐，PO-DLE+PA 的环境内外推 NMSE 又可平均再降低 2.6 dB。

随后把 env-1 中的训练数据集规模从 500 变化到 10000，图 11(c) 给出不同 DL 外推器的测试 NMSE。可见所有 DL 外推器的测试 NMSE 都随训练数据集规模增大而下降，原因在于更大的训练数据集可实现 (31) 中更小的环境内泛化间隙。此外，当训练数据集较小时，PO-DLE+PA 借助路径对齐可获得明显的环境内性能增益。例如训练数据集规模为 2000 时，PO-DLE+PA 相比 CO-DLE 可获得 6.48 dB 的外推性能增益。因此 PO-DLE+PA 只需小得多的训练数据集即可保证环境内性能。

> **图 11（原文 Fig. 11）：** 带路径对齐的路径导向 DL 外推器的环境内性能验证：(a) CO-DLE 与 PO-DLE+PA 的训练收敛；(b) 不同信道外推器的环境内外推性能比较；(c) env-1 中训练的不同训练数据集规模下 DL 外推器的 NMSE 比较。

**3) 环境泛化性研究：** 首先验证 PO-DLE+PA 的环境泛化性。以 HORCRUX 外推器 [19] 与采用不同数据增强方案的 CO-DLE 作为基线。HORCRUX 外推器采用 8 个并行的神经网络信道划分器与小型神经网络距离估计器，所有神经网络均按 [19] 的设置训练。具体地，每对神经网络信道划分器与小型神经网络距离估计器都在含 100000 个样本、路径参数随机生成的地面多径信道数据集上训练。数据增强方案包括随机角度–延迟循环移位（ADS）[20]、翻转 [21] 与随机相位旋转（RPS）[22]。由于这些数据增强基线原为信道反馈设计（输入与标签相同），下面修改它们以保持信道外推中增强输入与标签之间的依赖关系。

- **ADS：** 移位量 $(\tilde n_{1,l},\tilde n_{2,l},\tilde n_{3,l})$ 从 $[0,O_hN_h-1]\times[0,O_vN_v-1]\times[0,O_dN_d-1]$ 中均匀选取，然后对输入乘式 (19) 中的 $\mathbf U_l$、对标签乘式 (24) 中的 $\mathbf V_l$ 得到增强的输入与标签。
- **翻转：** 沿第一维（天线维）同时翻转输入与标签矩阵。
- **RPS：** 对输入与标签同时乘以随机相位项 $e^{\mathrm j\phi}$，其中 $\phi\sim\mathcal U(0,2\pi)$。

离线数据增强后，训练数据集规模相比原训练数据集翻倍。

首先在 env-3 中训练 DL 外推器，并在 env-1 与 env-2 中考察外推性能，结果如图 12(a) 所示。对 PO-DLE+PA，在未见 env-1 与 env-2 中分别可获得 −15.54 dB 与 −11.72 dB 的外推 NMSE，比 HORCRUX 的性能好 3.3～5.8 dB。因此 PO-DLE+PA 可实现环境泛化性。相反，CO-DLE 的性能在 env-2 与 env-3 中退化到 −2 dB，这是由无线信道的分布偏移造成的。此外，在 CO-DLE 上应用数据增强方案带来的外推性能增益小于 1.1 dB，原因在于无线环境多样，数据增强方案无法有效降低无线信道的分布偏移。进一步考察图 12(a) 中不同方法的泛化鲁棒性：可见对随机分布在 env-1 与 env-2 的用户，PO-DLE+PA 的标准差（误差条）约为 4.3 dB。此外，所提 PO-DLE+PA 在 env-1 与 env-2 中测试时的第 95 百分位 NMSE 分别为 −10.98 dB 与 −6.76 dB。相反，HORCRUX 基线在未见 env-1 与 env-2 中表现出较大的 NMSE 标准差（$>10$ dB），对用户位置更敏感。因此 PO-DLE+PA 在随机用户位置下的泛化鲁棒性得到验证。

接下来考虑源环境不同训练数据集规模下 DL 外推器的环境泛化性。在 env-1 或 env-2 中训练 DL 外推器，再在未见 env-3 中测试。由于 env-3 相比 env-1 与 env-2 具有更丰富的多径条件，泛化到 env-3 更具挑战性。我们把 env-1 与 env-2 中的训练数据集规模从 500 变化到 10000，图 12(b) 与图 12(c) 给出外推 NMSE。对 PO-DLE+PA，在未见 env-3 中可实现约 −10 dB 的外推 NMSE，相比基线降低 6 dB。因此 PO-DLE+PA 也能准确泛化到多径条件更丰富的未见环境。同时，由于 PO-DLE+PA 的环境间泛化间隙大幅减小，源环境中仅用 2000 个训练样本即可达到 −9 dB 的泛化 NMSE。因此所提 PO-DLE+PA 还能以较小训练数据集实现强环境泛化性。比较 CO-DLE、PO-DLE 与 PO-DLE+PA，它们在未见 env-3 中的外推 NMSE 逐步降低，验证了注 2。此外，HORCRUX 外推器的 NMSE 因 env-3 中训练与测试数据的严重分布偏移而退化到 −3 dB，验证了注 3。同时，当训练数据集规模超过 6000 后，基线的 NMSE 几乎不变且无法低于 −4.1 dB。该结果表明环境间分布差距是环境泛化性的根本限制，无法通过增大训练数据集规模缓解，验证了注 6。

> **图 12（原文 Fig. 12）：** 带路径对齐的路径导向 DL 外推器的环境间泛化性验证：(a) 在 env-3 中训练、在 env-1/2 中测试；(b) 在 env-1 中训练、在 env-3 中测试；(c) 在 env-2 中训练、在 env-3 中测试。

**4) 理论一致性：** 下面考察定理 1 中环境间泛化间隙与 PO-DLE+PA 环境泛化性之间的一致性。根据 §III-C，路径对齐旨在降低提取路径响应的分布偏移，它由 3 个分量组成：(1) 延迟域峰值位置对齐（PADD）；(2) 角度域峰值位置对齐（PAAD）；(3) 用于压缩功率泄漏的过采样。为定量说明分布偏移的降低，我们在图 13 中给出上述三分量不同组合下提取路径响应的 Wasserstein-1 距离。可见 PADD、PAAD 及其组合（路径对齐，PA）都能降低提取路径响应的分布偏移；同时，当过采样因子从 1 增大到 2 时，功率泄漏得到抑制，Wasserstein-1 距离可进一步降低约 20%。因此路径对齐方法可显式降低提取路径响应的分布偏移，验证了注 4。进一步，表 I 列出不同对齐方案下 PO-DLE 的环境泛化性能。随着分布对齐使路径响应分布的 Wasserstein-1 距离下降，所提 PO-DLE 的环境泛化性持续增强，这印证了注 7¹。

> **图 13（原文 Fig. 13）：** 不同环境之间提取路径响应的 Wasserstein-1 距离，可量化分布偏移。

> **表 I（原文 Table I）：** 不同对齐方案下路径导向 DL 外推器泛化到未见环境的外推 NMSE（dB），最优泛化性能加粗。

| 训练环境 | 测试环境 | 无对齐 | PADD（$O=1$） | PAAD（$O=1$） | PA（$O=1$） | PA（$O=2$） |
|---|---|---|---|---|---|---|
| env-1 | env-2 | −4.03 | −4.85 | −5.04 | −7.24 | **−9.84** |
| env-1 | env-3 | −3.61 | −3.74 | −6.43 | −9.11 | **−9.73** |
| env-2 | env-1 | −3.15 | −7.60 | −9.26 | −11.97 | **−13.35** |
| env-2 | env-3 | −2.61 | −3.34 | −5.74 | −9.19 | **−9.80** |
| env-3 | env-1 | −3.1 | −3.42 | −10.40 | −13.95 | **−15.54** |
| env-3 | env-2 | −2.14 | −1.52 | −7.63 | −9.74 | **−11.72** |

**5) 灵活性与鲁棒性研究：** 所提 PO-DLE+PA 是增强环境泛化性的通用、灵活框架，可由多种 DNN 结构实现。下面考察 DNN 结构对环境内性能与环境间泛化性的影响。我们在 CO-DLE、PO-DLE 与 PO-DLE+PA 中采用序列 LSTM [11], [13] 作为 DNN 结构。这里采用三个卷积层做特征提取，输入/输出通道分别为 (2,512)、(512,1024)、(1024,1024)；LSTM 隐藏层数设为 2，隐藏维设为 1024。图 14 给出在不同环境中训练的 DL 外推器在 env-1 中的测试 NMSE。在 env-1 中训练时，PO-DLE 的性能超过基线 3.7～7.74 dB；同时 PO-DLE+PA 的环境内性能仍可保证。在 env-2 与 env-3 中训练时，PO-DLE+PA 仍可泛化到未见 env-1；相反，CO-DLE 在未见 env-1 中测试时出现严重性能退化，且数据增强方法也无法有效增强环境泛化性。因此，PO-DLE+PA 的环境内性能与环境间泛化性在不同 DNN 结构下依然成立，验证了注 8。

> **图 14（原文 Fig. 14）：** 在不同环境中训练的 DL 外推器在 env-1 中的外推 NMSE，其中 CO-DLE、PO-DLE 与 PO-DLE+PA 采用序列 LSTM 作为 DNN 结构。

加性噪声鲁棒性对信道外推的实际运行至关重要。下面考察含噪信道样本下 DL 外推器的环境泛化性，即在训练与测试数据集中加入零均值复高斯噪声。这里固定信噪比（SNR）为 5 dB，以信道外推精度 $\frac{\|\mathbf H^{(e)}\|_F^2}{\|\hat{\mathbf H}^{(e)}-\mathbf H^{(e)}\|_F^2}$ 作为噪声下的性能指标。图 15 给出不同 DL 外推器在未见 env-1 中测试时信道外推精度的累积分布函数（CDF）。在 SNR = 5 dB 的低信噪比条件下，所提 PO-DLE+PA 仍能达到最高信道外推精度，在不同百分位上都可获得稳定且明显的泛化增益（$>8$ dB）。与无噪声条件相比，PO-DLE+PA 在未见 env-1 中的外推 NMSE 平均退化小于 3.4 dB。因此所提 PO-DLE+PA 的抗噪声鲁棒性得到验证。相反，HORCRUX 外推器的外推 NMSE 相比无噪声条件退化超过 8.5 dB，对加性噪声更敏感。

> **图 15（原文 Fig. 15）：** SNR = 5 dB 时信道外推精度的 CDF，DL 外推器在 env-1 中测试，训练环境见图中图例。

**6) 多域预训练：** 进一步考察 DL 外推器在多样训练数据集下的泛化性。为此采用 DeepMIMO 数据集 [34] 的 "City Scenario Series" 生成多样训练数据集。具体地，"City Scenario Series" 数据集包含 20 个真实城市场景的射线追踪结果，每个场景含三个位于不同位置的 BS，因此最多可生成 60 个域用于预训练。预训练数据集中 BS 的配置与 §VI-A 对齐。图 16 给出 PO-DLE+PA 与 CO-DLE 在不同训练域数下的泛化 NMSE。可见所提 PO-DLE+PA 的泛化性可随预训练域数增加而逐步增强，在 env-1 中外推 NMSE 可降到 −15 dB 以下，在 env-2 与 env-3 中可降到 −10 dB 以下。因此所提 PO-DLE+PA 也能受益于多环境训练数据集以增强泛化性。相反，CO-DLE 的泛化性在预训练域数超过 15 后几乎饱和，无法通过进一步增大训练数据集多样性有效增强。因此，仅仅增大训练域多样性无法有效解决 CO-DLE 在未见环境中的泛化性挑战。基于上述比较，即便有多样的预训练数据集，仍需要 PO-DLE+PA 来增强泛化性。

> **图 16（原文 Fig. 16）：** 不同预训练域数下的泛化比较，测试环境见图中图例。

**7) 运行时间分析：** 表 II 给出不同过采样因子下峰值位置搜索的运行时间，在 Nvidia GeForce RTX 3090 GPU 上测试。可见峰值搜索运行时间随过采样因子 $O$ 几乎保持不变。因此基于过采样的峰值位置搜索能以可承受的运行时间增强环境泛化性。进一步考虑不同天线规模与子载波数下路径对齐的运行时间：对 128 天线 32 子载波系统与 256 天线 64 子载波系统，路径对齐的运行时间都保持 0.26 ms，验证了注 5。

> **表 II（原文 Table II）：** 基于过采样的峰值搜索运行时间。

| 过采样因子 $O$ | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 峰值搜索运行时间（ms） | 0.192 | 0.188 | 0.192 | 0.194 |

### C. 讨论：弥合 sim-to-real 差距

**1) 高保真的多样预训练数据集。** 如图 16 所示，多样预训练可增强 PO-DLE+PA 的泛化性。此外，可把现实因素建模进射线追踪工具与信号生成模型，以缩小 "sim-to-real" 差距。首先，可生成多样场景以增强大尺度信道参数的多样性。其次，射线追踪工具中可采用包含绕射的更完整信号传播机制；此外可用射线追踪–统计混合建模 [35] 生成漫反射路径。第三，可在接收信号中对天线方向图与频率响应等硬件效应建模 [36]。最后，也可用生成模型在仅有少量真实测量的条件下生成合成信号 [37]，从而建模实际场景中的非理想因素。

**2) 现实世界中的可靠路径提取。** 路径提取之前，应在原始信道测量中补偿真实射频系统的响应 [38]。随后，在仿真的多样数据集上预训练并部署到真实场景时，需要改进的 SAGE 算法 [38], [39]，以提升实际硬件效应与不同传播条件（如近场球面波传播）下的路径提取性能。

**3) 频域信号校准。** 为使目标函数在实际场景中保持不变性，需要进行频域信号校准。具体地，路径导向 DL 外推器的输入与标签应通过除以天线频率响应来校准，这样训练好的神经网络不会拟合训练数据集中特定天线的响应。

## VII. 结论

在无线信道跨环境分布偏移下，环境泛化性对降低 DL 外推器的大规模部署成本至关重要。本文实现了信道外推的泛化学习。首先分析无线信道的分布偏移，它由多径结构的分布偏移与单径响应的分布偏移组成。其次提出基于物理的分布对齐，逐步化解无线信道的分布偏移，包含路径导向设计与路径对齐两步。受信道外推在物理上可按路径分解的启发，提出路径导向 DL 外推器，用 DL 并行外推提取路径，从而处理多径结构的分布偏移；随后提出路径对齐，以缓解路径导向 DL 外推器中提取路径响应的分布偏移。第三，设计训练中的标签协同变换与测试中的输出协同补偿，以适配带路径对齐的路径导向 DL 外推器。大量仿真结果表明，所提带路径对齐的路径导向 DL 外推器在保证环境内性能的同时可实现强环境泛化性。此外，带路径对齐的路径导向 DL 外推器的环境泛化性与其分布对齐度量一致，具有较强的理论可解释性。更细致、全面地缩小 "sim-to-real" 差距的实现留作未来工作。

## 附录 A. UB-NPAE 的推导

为量化路径提取的物理关联保真度，NPAE 原定义为

$$
\mathrm{NPAE}=\min_{\{\mathcal K_1,\dots,\mathcal K_{\hat L}\}}\left(\frac{1}{2}\left(\frac{\sum_{l=1}^{\hat L}\left\|\hat{\mathbf A}_l-\sum_{k\in\mathcal K_l}\mathbf A_k\right\|_F^2}{\left\|\mathbf H^{(m)}\right\|_F^2}+\frac{\sum_{l=1}^{\hat L}\left\|\hat{\mathbf B}_l-\sum_{k\in\mathcal K_l}\mathbf B_k\right\|_F^2}{\left\|\mathbf H^{(e)}\right\|_F^2}\right)\right), \tag{33}
$$

其中 $\{\mathcal K_1,\dots,\mathcal K_{\hat L}\}$ 表示集合 $\{1,2,\dots,L\}$ 的一个弱划分。由组合数学，全部可能弱划分的数量为 $\hat L^L$，它随 $L$ 指数增长，从而增加精确 NPAE 计算的复杂度。为此，我们考虑计算复杂度低的 UB-NPAE。具体地，基于物理路径与提取路径响应之间的距离，启发式确定一个贪心弱划分 $\{\mathcal K_1^\star,\dots,\mathcal K_{\hat L}^\star\}$。考虑第 $k$ 条物理路径与第 $l$ 条提取路径响应之间的距离 $D(\boldsymbol\omega_k,\hat{\boldsymbol\omega}_l^{(p)})$，其中 $\boldsymbol\omega_k=\left[\pi\sin(\varphi_k)\sin(\theta_k),\ \pi\cos(\theta_k),\ 2\pi\Delta f\tau_k\right]^T$，$\hat{\boldsymbol\omega}_l^{(p)}=\left[\frac{2\pi\tilde n_{1,l}}{O_hN_h},\frac{2\pi\tilde n_{2,l}}{O_vN_v},\frac{2\pi\tilde n_{3,l}}{O_dK_m}\right]^T$。随后基于映射 $k\mapsto\arg\min_l\{D(\boldsymbol\omega_k,\hat{\boldsymbol\omega}_l^{(p)})\}$ 得到弱划分 $\{\mathcal K_1^\star,\dots,\mathcal K_{\hat L}^\star\}$，并据此计算 (23) 中的 UB-NPAE。由于 UB-NPAE $\ge$ NPAE 直观成立，当 UB-NPAE 趋近于零时它同样可指示准确的物理关联。

## 附录 B. 命题 2 的证明

基于式 (19)，对齐路径响应 $\tilde{\mathbf A}_l$ 可表示为

$$
\tilde{\mathbf A}_l=\sum_{k\in\mathcal I_l^{(m)}}\hat\alpha_k^{(m)}e^{-\mathrm j2\pi f_1^{(m)}\hat\tau_k^{(m)}}\mathbf a\left(\tilde\varphi_k^{(m)},\tilde\theta_k^{(m)}\right)\mathbf b_m\left(\tilde\tau_k^{(m)}\right), \tag{34}
$$

其中参数 $(\tilde\varphi_k^{(m)},\tilde\theta_k^{(m)},\tilde\tau_k^{(m)})$ 由 $(\hat\varphi_k^{(m)},\hat\theta_k^{(m)},\hat\tau_k^{(m)})$ 按下式平移得到：

$$
\sin\left(\tilde\varphi_k^{(m)}\right)\sin\left(\tilde\theta_k^{(m)}\right)=\sin\left(\hat\varphi_k^{(m)}\right)\sin\left(\hat\theta_k^{(m)}\right)-\frac{2\tilde n_{1,l}}{O_hN_h},
$$

$$
\cos\left(\tilde\theta_k^{(m)}\right)=\cos\left(\hat\theta_k^{(m)}\right)-\frac{2\tilde n_{2,l}}{O_vN_v},\qquad
\tilde\tau_k^{(m)}=\hat\tau_k^{(m)}-\frac{\tilde n_{3,l}}{O_dK_m\Delta f} \tag{35}
$$

对所有 $k\in\mathcal I_l^{(m)}$ 成立。基于测量与目标频段的空间互易性，$\hat{\mathbf B}_l$ 中 $k\in\mathcal I_l^{(e)}$ 的参数 $(\hat\varphi_k^{(e)},\hat\theta_k^{(e)},\hat\tau_k^{(e)})$ 应施加与 (35) 相同的平移。同时，由于延迟平移 $-\frac{\tilde n_{3,l}}{O_dK_m\Delta f}$，还应考虑式 (26) 中的相位旋转项 $\beta(\tilde n_{3,l})$，最终得到式 (24) 中的协同变换响应 $\tilde{\mathbf B}_l$。

## 附录 C. 定理 1 的证明

在合适的路径提取设计下，目标频段信道可近似分解为

$$
\mathbf H^{(e)}\approx\sum_{l=1}^{\hat L}\hat{\mathbf B}_l=\sum_{l=1}^{\hat L}\mathrm{conj}\left(\mathbf V_l\right)\odot\tilde{\mathbf B}_l. \tag{36}
$$

于是 $\mathcal J(\eta^\star)$ 可上界为

$$
\mathcal J(\eta^\star)\approx\mathbb E\left\{\sum_{l}\mathrm{conj}\left(\mathbf V_l\right)\odot\left(\tilde{\mathbf B}_l-\eta^\star\left(\tilde{\mathbf A}_l\right)\right)_F^2\right\}, \tag{37a}
$$

$$
\le\mathbb E\left\{\hat L\sum_{l}\left\|\mathrm{conj}\left(\mathbf V_l\right)\odot\left(\tilde{\mathbf B}_l-\eta^\star\left(\tilde{\mathbf A}_l\right)\right)\right\|_F^2\right\}, \tag{37b}
$$

$$
=\mathbb E\left\{\hat L\sum_{l}\left\|\tilde{\mathbf B}_l-\eta^\star\left(\tilde{\mathbf A}_l\right)\right\|_F^2\right\}, \tag{37c}
$$

$$
\approx\mathbb E_{\mathcal Q_{\hat L}}\left\{\hat L^2\right\}\mathbb E_{\mathcal Q^{(pa)}}\left\{\left\|\tilde{\mathbf B}_l-\eta^\star\left(\tilde{\mathbf A}_l\right)\right\|_F^2\right\}, \tag{37d}
$$

其中 (37b) 由不等式 $\left\|\sum_{i=1}^{n}\mathbf X_i\right\|_F^2\le n\sum_{i=1}^{n}\|\mathbf X_i\|_F^2$ 成立，(37c) 因 $\mathbf V_l$ 的所有元素模为 1 成立，(37d) 由假设 3 成立。

记 $\mathcal L_{\mathcal Q^{(pa)}}(\eta^\star)=\mathbb E_{\mathcal Q^{(pa)}}\{\|\tilde{\mathbf B}_l-\eta^\star(\tilde{\mathbf A}_l)\|_F^2\}$。下面推导 $\mathcal L_{\mathcal Q^{(pa)}}(\eta^\star)$ 的上界。对 DL 外推器 $\eta\in\mathcal F$，输入 $\tilde{\mathbf A}$ 上的 MSE 损失可表示为 $g_\eta(\tilde{\mathbf A})=\|\tilde{\mathbf B}-\eta(\tilde{\mathbf A})\|_F^2=\|\psi(\tilde{\mathbf A})-\eta(\tilde{\mathbf A})\|_F^2$。先证明 $g_\eta(\tilde{\mathbf A})$ 是 Lipschitz 连续的。对任意 $\tilde{\mathbf A}_1,\tilde{\mathbf A}_2\in\mathrm{supp}(P_{\tilde{\mathbf A}}^{(pa)})\cup\mathrm{supp}(Q_{\tilde{\mathbf A}}^{(pa)})$，有 $|g_\eta(\tilde{\mathbf A}_1)-g_\eta(\tilde{\mathbf A}_2)|=g_1\times g_2$，其中

$$
g_1=\left\|\psi(\tilde{\mathbf A}_1)-\eta(\tilde{\mathbf A}_1)\right\|_F+\left\|\psi(\tilde{\mathbf A}_2)-\eta(\tilde{\mathbf A}_2)\right\|_F,\qquad
g_2=\left|\left\|\psi(\tilde{\mathbf A}_1)-\eta(\tilde{\mathbf A}_1)\right\|_F-\left\|\psi(\tilde{\mathbf A}_2)-\eta(\tilde{\mathbf A}_2)\right\|_F\right|. \tag{38}
$$

基于三角不等式、假设 1 的有界支撑与假设 2 的 Lipschitz 连续性，$g_1$ 可上界为

$$
g_1\le\left\|\psi(\tilde{\mathbf A}_1)\right\|_F+\left\|\eta(\tilde{\mathbf A}_1)\right\|_F+\left\|\psi(\tilde{\mathbf A}_2)\right\|_F+\left\|\eta(\tilde{\mathbf A}_2)\right\|_F\le4R_1R_2. \tag{39}
$$

类似地，$g_2$ 可上界为

$$
g_2\le\left\|\psi(\tilde{\mathbf A}_1)-\eta(\tilde{\mathbf A}_1)-\psi(\tilde{\mathbf A}_2)+\eta(\tilde{\mathbf A}_2)\right\|_F\le\left\|\psi(\tilde{\mathbf A}_1)-\psi(\tilde{\mathbf A}_2)\right\|_F+\left\|\eta(\tilde{\mathbf A}_1)-\eta(\tilde{\mathbf A}_2)\right\|_F\le2R_2\left\|\tilde{\mathbf A}_1-\tilde{\mathbf A}_2\right\|_F. \tag{40}
$$

结合 (39) 与 (40) 可得

$$
\left|g_\eta\left(\tilde{\mathbf A}_1\right)-g_\eta\left(\tilde{\mathbf A}_2\right)\right|\le8R_1R_2^2\left\|\tilde{\mathbf A}_1-\tilde{\mathbf A}_2\right\|_F\triangleq C\left\|\tilde{\mathbf A}_1-\tilde{\mathbf A}_2\right\|_F. \tag{41}
$$

因此对任意可能的 DL 外推器 $\eta\in\mathcal F$，$g_\eta(\tilde{\mathbf A})$ 是 $C$-Lipschitz 连续的。

随后把 $\mathcal L_{\mathcal Q^{(pa)}}(\eta^\star)$ 分解为三个部分，即最小训练损失、环境内泛化间隙与环境间泛化间隙。为简化表达，下面推导中省略 $\mathcal Q^{(pa)}$、$\mathcal D^{(pa)}$、$P^{(pa)}$ 的上标。可得

$$
\mathcal L_{\mathcal Q}(\eta^\star)=\mathcal L_{\mathcal D}(\eta^\star)+\mathcal L_{\mathcal P}(\eta^\star)-\mathcal L_{\mathcal D}(\eta^\star)+\mathcal L_{\mathcal Q}(\eta^\star)-\mathcal L_{\mathcal P}(\eta^\star)
$$

$$
\le\mathcal L_{\mathcal D}(\eta^\star)+\sup_{\eta\in\mathcal F}\left|\mathcal L_{\mathcal D}(\eta)-\mathcal L_{\mathcal P}(\eta)\right|+\sup_{\eta\in\mathcal F}\left|\mathcal L_{\mathcal P}(\eta)-\mathcal L_{\mathcal Q}(\eta)\right|. \tag{42}
$$

基于 Kantorovich–Rubinstein 对偶 [30, Theorem 5.10]，边缘分布 $P_{\tilde{\mathbf A}}$ 与 $Q_{\tilde{\mathbf A}}$ 的 Wasserstein-1 距离 $W_1(P_{\tilde{\mathbf A}},Q_{\tilde{\mathbf A}})$ 可等价改写为

$$
W_1\left(P_{\tilde{\mathbf A}},Q_{\tilde{\mathbf A}}\right)=\sup_{\|g\|_L\le1}\left|\mathbb E_{P_{\tilde{\mathbf A}}}\left\{g\left(\tilde{\mathbf A}\right)\right\}-\mathbb E_{Q_{\tilde{\mathbf A}}}\left\{g\left(\tilde{\mathbf A}\right)\right\}\right|, \tag{43}
$$

其中 $\|g\|_L=\sup_{\tilde{\mathbf A}_1,\tilde{\mathbf A}_2}\frac{|g(\tilde{\mathbf A}_1)-g(\tilde{\mathbf A}_2)|}{\|\tilde{\mathbf A}_1-\tilde{\mathbf A}_2\|_F}$ 表示 Lipschitz 半范数。基于 $g_\eta$ 的定义与 Lipschitz 连续性，环境间泛化间隙 $\Delta_{\mathrm{env}}=\sup_{\eta\in\mathcal F}|\mathcal L_{\mathcal P}(\eta)-\mathcal L_{\mathcal Q}(\eta)|$ 可界为

$$
\Delta_{\mathrm{env}}\le\sup_{\|g\|_L\le C}\left|\mathbb E_{P_{\tilde{\mathbf A}}}\left\{g\left(\tilde{\mathbf A}\right)\right\}-\mathbb E_{Q_{\tilde{\mathbf A}}}\left\{g\left(\tilde{\mathbf A}\right)\right\}\right|=CW_1\left(P_{\tilde{\mathbf A}},Q_{\tilde{\mathbf A}}\right). \tag{44}
$$

结合 (42)、(44) 与 (37d)，即证 (31) 中 $\mathcal J(\eta^\star)$ 的上界。证毕。

## 参考文献（英文原书目）

- [1] O. Chukhno, O. Galinina, S. Andreev, A. Molinaro, and A. Iera, "Interplay of user behavior, communication, and computing in immersive reality 6G applications," IEEE Commun. Mag., vol. 60, no. 12, pp. 28–34, Dec. 2022.
- [2] M. Noor-A-Rahim, Z. Liu, H. Lee, M. O. Khyam, J. He, D. Pesch, K. Moessner, W. Saad, and H. V. Poor, "6G for vehicle-to-everything (V2X) communications: Enabling technologies, challenges, and opportunities," Proc. IEEE, vol. 110, no. 6, pp. 712–734, Jun. 2022.
- [3] L. Lu, G. Y. Li, A. L. Swindlehurst, A. Ashikhmin, and R. Zhang, "An overview of massive MIMO: Benefits and challenges," IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 742–758, Oct. 2014.
- [4] D. Wu, Y. Zeng, S. Jin, and R. Zhang, "Environment-aware hybrid beamforming by leveraging channel knowledge map," IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 4990–5005, May 2024.
- [5] D. Vasisht, S. Kumar, H. Rahul, and D. Katabi, "Eliminating channel feedback in next-generation cellular networks," in Proc. ACM SIGCOMM, Aug. 2016, pp. 398–411.
- [6] F. Rottenberg, T. Choi, P. Luo, C. J. Zhang, and A. F. Molisch, "Performance analysis of channel extrapolation in FDD massive MIMO systems," IEEE Trans. Wireless Commun., vol. 19, no. 4, pp. 2728–2741, Apr. 2020.
- [7] Y. Yang, F. Gao, Z. Zhong, B. Ai, and A. Alkhateeb, "Deep transfer learning-based downlink channel prediction for FDD massive MIMO systems," IEEE Trans. Commun., vol. 68, no. 12, pp. 7485–7497, Aug. 2020.
- [8] Y. Han, Q. Liu, C.-K. Wen, M. Matthaiou, and X. Ma, "Tracking FDD massive MIMO downlink channels by exploiting delay and angular reciprocity," IEEE J. Sel. Topics Signal Process., vol. 13, no. 5, pp. 1062–1076, Sept. 2019.
- [9] K. Hornik, "Approximation capabilities of multilayer feedforward networks," Neural Netw., vol. 4, no. 2, pp. 251–257, 1991.
- [10] M. Alrabeiah and A. Alkhateeb, "Deep learning for TDD and FDD massive MIMO: Mapping channels in space and frequency," in Proc. 53rd Asilomar Conf. Signal Syst. Comput., Nov. 2019, pp. 1465–1470.
- [11] L. Yao, K. Ma, Y. Ming, and Z. Wang, "Loss function fusion for learning-based CSI extrapolation enhancement," IEEE Wireless Commun. Lett., vol. 13, no. 8, pp. 2210–2214, Aug. 2024.
- [12] Z. Liu, G. Singh, C. Xu, and D. Vasisht, "FIRE: Enabling reciprocity for FDD MIMO systems," in Proc. Annu. Int. Conf. Mobile Comput. Netw. (MobiCom), 2021, pp. 628–641.
- [13] W. Jiang and H. D. Schotten, "Deep learning for fading channel prediction," IEEE Open J. Commun. Soc., vol. 1, pp. 320–332, Mar. 2020.
- [14] J. Wang, C. Lan, C. Liu, Y. Ouyang, T. Qin, W. Lu, Y. Chen, W. Zeng, and P. S. Yu, "Generalizing to unseen domains: A survey on domain generalization," IEEE Trans. Knowl. Data Eng., vol. 35, no. 8, pp. 8052–8072, Aug. 2023.
- [15] M. Akrout, A. Feriani, F. Bellili, A. Mezghani, and E. Hossain, "Domain generalization in machine learning models for wireless communications: Concepts, state-of-the-art, and open issues," IEEE Commun. Surv. Tuts., vol. 25, no. 4, pp. 3014–3037, Oct. 2023.
- [16] S. Rajendran and Z. Sun, "RF impairment model-based IoT physical-layer identification for enhanced domain generalization," IEEE Trans. Inf. Forensics Security, vol. 17, pp. 1285–1299, Mar. 2022.
- [17] G. Yin, J. Zhang, G. Shen, and Y. Chen, "FewSense, towards a scalable and cross-domain Wi-Fi sensing system using few-shot learning," IEEE Trans. Mobile Comput., vol. 23, no. 1, pp. 453–468, Jan. 2024.
- [18] Y. Yuan, G. Zheng, K.-K. Wong, B. Ottersten, and Z.-Q. Luo, "Transfer learning and meta learning-based fast downlink beamforming adaptation," IEEE Trans. Wireless Commun., vol. 20, no. 3, pp. 1742–1755, Nov. 2021.
- [19] A. Banerjee, X. Zhao, V. Chhabra, K. Srinivasan, and S. Parthasarathy, "HORCRUX: Accurate cross band channel prediction," in Proc. Annu. Int. Conf. Mobile Comput. Netw. (MobiCom), 2024, pp. 1–15.
- [20] Z. Liu, L. Wang, L. Xu, and Z. Ding, "Deep learning for efficient CSI feedback in massive MIMO: Adapting to new environments and small datasets," IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 12 297–12 312, Sept. 2024.
- [21] H. Xiao, Z. Wang, D. Li, W. Tian, X. Liu, W. Liu, S. Jin, J. Shen, Z. Zhang, and N. Yang, "AI enlightens wireless communication: A transformer backbone for CSI feedback," China Commun., vol. 21, no. 12, pp. 243–256, Dec. 2024.
- [22] J. Guo, Y. Zuo, C.-K. Wen, and S. Jin, "User-centric online gossip training for autoencoder-based CSI feedback," IEEE J. Sel. Topics Signal Process., vol. 16, no. 3, pp. 559–572, Apr. 2022.
- [23] M. Bayer, M.-A. Kaufhold, and C. Reuter, "A survey on data augmentation for text classification," ACM Comput. Surv., vol. 55, no. 7, Dec. 2022.
- [24] H. Wang, Z. Sun, S. Han, X. Wang, S. Zhou, and Z. Wang, "Path evolution model for endogenous channel digital twin towards 6G wireless networks," Jan. 2025. [Online]. Available: https://arxiv.org/abs/2501.15116
- [25] Remcom, "Wireless Insite," 2021. [Online]. Available: http://www.remcom.com/wireless-insite
- [26] H. He, R. Wang, W. Jin, S. Jin, C.-K. Wen, and G. Y. Li, "Beamspace channel estimation for wideband millimeter-wave MIMO: A model-driven unsupervised learning approach," IEEE Trans. Wireless Commun., vol. 22, no. 3, pp. 1808–1822, 2023.
- [27] B. Fleury, M. Tschudin, R. Heddergott, D. Dahlhaus, and K. Ingeman Pedersen, "Channel parameter estimation in mobile radio environments using the SAGE algorithm," IEEE J. Sel. Areas Commun., vol. 17, no. 3, pp. 434–450, Mar. 1999.
- [28] C. Ling, X. Yin, H. Wang, and R. S. Thomä, "Experimental characterization and multipath cluster modeling for 13–17 GHz indoor propagation channels," IEEE Trans. Antennas Propag., vol. 65, no. 12, pp. 6549–6561, Dec. 2017.
- [29] E. Schubert, J. Sander, M. Ester, H. P. Kriegel, and X. Xu, "DBSCAN revisited, revisited: Why and how you should (still) use DBSCAN," ACM Trans. Database Syst., vol. 42, no. 3, Jul. 2017.
- [30] C. Villani et al., Optimal Transport: Old and New, Springer, 2009, vol. 338.
- [31] Q. Hu, F. Gao, H. Zhang, S. Jin, and G. Y. Li, "Deep learning for channel estimation: Interpretation, performance, and comparison," IEEE Trans. Wireless Commun., vol. 20, no. 4, pp. 2398–2412, Apr. 2021.
- [32] D. P. Kingma and J. Ba, "Adam: A method for stochastic optimization," in Proc. Int. Conf. Learn. Represent. (ICLR), May 2015.
- [33] K. S. Aladin Virmaux, "Lipschitz regularity of deep neural networks: Analysis and efficient estimation," in Proc. 32nd Int. Conf. Neural Inf. Process. Syst. (NeurIPS), Dec. 2018.
- [34] A. Alkhateeb, "DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications," in Proc. ITA, Feb. 2019.
- [35] Y. Chen, Y. Li, C. Han, Z. Yu, and G. Wang, "Channel measurement and ray-tracing-statistical hybrid modeling for low-Terahertz indoor communications," Trans. Wireless Commun., vol. 20, no. 12, pp. 8163–8176, Dec. 2021.
- [36] X. Chen and X. Zhang, "RF Genesis: Zero-shot generalization of mmWave sensing through simulation-based data synthesis and generative diffusion models," in Proc. 21st ACM Conf. Embedded Networked Sensor Systems, Nov. 2023, pp. 28–42.
- [37] G. Chi, Z. Yang, C. Wu, J. Xu, Y. Gao, Y. Liu, and T. X. Han, "RF-Diffusion: Radio signal generation via time-frequency diffusion," in Proc. 30th Annu. Int. Conf. Mobile Comput. Netw. (MobiCom), May 2024, pp. 77–92.
- [38] T. Choi, F. Rottenberg, J. Gómez-Ponce, A. Ramesh, P. Luo, C. J. Zhang, and A. F. Molisch, "Experimental investigation of frequency domain channel extrapolation in massive MIMO systems for zero-feedback FDD," IEEE Trans. Wireless Commun., vol. 20, no. 1, pp. 710–725, Jan. 2021.
- [39] X. Yin, S. Wang, N. Zhang, and B. Ai, "Scatterer localization using large-scale antenna arrays based on a spherical wave-front parametric model," IEEE Trans. Wireless Commun., vol. 16, no. 10, pp. 6543–6556, Oct. 2017.

## 图注与表注索引

本页图 1–16 的中文图注与表 I–II 的表注均按原文出现位置内联在正文中（图 1–2 见第 II 节，图 3–6 见第 III 节，图 7–8 见第 IV 节，图 9–16 见第 VI 节；表 I 与表 II 见第 VI-B 节），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2505.13867v1 全文（16 页）的中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–16 的中文图注、表 I–II 的逐格转写、附录 A–C（含 (33)–(44) 的推导与证明），以及参考文献 39 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(44) 逐式核对（重点 (3)–(5)、(8)–(10)、(12)–(19)、(22)–(31)、(33)–(44)）；表 I 用第 12 页渲染图逐格核对（六行五列 NMSE 数值全部一致），表 II 用第 14 页表格网格核对（0.192/0.188/0.192/0.194 ms）。已加注一处原文疑点：§IV 引言两次引用 §IV-B，但按小节结构测试阶段评估应为 §IV-C。本页不上传原文图片，图内曲线、散点与热图数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
