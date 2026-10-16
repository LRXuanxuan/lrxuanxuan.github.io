---
layout: page
title: "多用户 MIMO-FAS 信道估计与端口选择的统一两阶段生成式扩散框架｜中文译稿（逐段校对中）"
permalink: /papers/translations/2026-10-16-mimofas-two-stage-diffusion-2605-29679/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4764027833b18444/) · [arXiv](https://arxiv.org/abs/2605.29679) · [原文 v2 PDF](https://arxiv.org/pdf/2605.29679v2)

# 面向多用户 MIMO-FAS 信道估计与端口选择的统一两阶段生成式扩散框架

**原题：** A Unified Two-Stage Generative Diffusion Framework for Channel Estimation and Port Selection in Multiuser MIMO-FAS  
**作者：** Erqiang Tang、Wei Guo、Hengtao He、Shenghui Song、Jun Zhang、Khaled B. Letaief  
**原文：** arXiv:2605.29679v2，2026 年 10 月 15 日版本（PDF 16 页）。本页以用户上传的 v2 为准，注意不同版本的算法和理论表述可能不同。  
**译稿状态：** 分章节翻译、公式与图表逐项核对中；尚未通过全文验收。

## 摘要

流体天线系统（fluid antenna system，FAS）已经成为下一代无线系统的一项潜在关键技术。但是，在实际的多用户 MIMO-FAS 中存在两个本质上相互耦合的挑战：利用有限的射频链获取准确的高维信道状态信息（CSI），以及求解组合性的端口选择问题，而后者的有效性高度依赖前者的结果。

本文提出统一的两阶段扩散框架，将联合任务表述为一个最大后验（maximum-a-posteriori，MAP）推断问题。该问题等价于最大化端口选择的后验期望效用，并通过两个连续阶段近似求解。阶段 I 使用连续流驱动的扩散模型，作为二维 FAS 信道的隐式先验；通过并行引导生成近似采样信道后验，即使在极低空间采样率下也能恢复多用户信道。阶段 II 训练离散扩散模型，以穷举搜索得到的最优标签为监督，生成一组有前景的端口候选。最终在候选集合中最大化经验后验期望效用，并进行轻量级局部改进。

大量仿真表明，该方法同时实现准确的信道估计，并能取得基于估计信道进行高成本穷举搜索所得实际通信速率的 90% 以上；相对于实用级联方案，最小可达速率亦有明显提高。

**关键词：** 信道估计；扩散模型；流体天线系统；多址接入。

## I. 引言

面向第六代（6G）无线网络的高数据率、低时延与高可靠性要求，大规模 MIMO 被视为关键技术。然而，常规 MIMO 继续增加天线规模会遭遇两个根本困难：一是每根天线连接独立射频链造成硬件费用及功耗显著增加；二是固定位置天线（fixed-position antennas，FPA）的空间布置限制了对信道细粒度空间起伏的利用。

FAS 可以通过物理移动天线，或在固定候选位置间动态切换，重构有效天线位置。其可选位置通常称为**端口**（port），这种空间自由度有助于利用预定区域内的空间分集。与早期只激活单端口的 SISO-FAS 不同，MIMO-FAS 将大量密集端口连接到远少于端口数的射频链，在同一时刻激活多个端口。适当的端口重配置可以使信道矩阵具有更有利的性质，在不增加射频链数量的前提下，改善多用户空间复用性能，使系统避开深衰落和相互干扰。

### A. 现有工作

多用户 MIMO-FAS 的性能同时依赖信道估计与端口选择，但大量已有研究将二者独立设计：信道估计器只优化估计精度，下游端口优化则假设拥有完美 CSI。因此，实际部署中，估计误差可能使后续端口选择偏离最优。

FAS 信道估计必须从少量端口观测恢复大维度信道。若在多个位置重复扫描，又会产生不可忽视的切换代价。传统方法利用压缩感知所依赖的稀疏性，或密集端口之间的空间相关性 [16]–[21]；但在高分辨率角度字典下，测量矩阵可能接近奇异，影响恢复精度。多用户情形还会使观测成本随用户数增长。已有的 L3SCR 方案 [23] 则要求基站完整阵列观测。

近年来，生成式模型被作为信道先验引入 MIMO 估计，例如得分先验与变分推断、Transformer 单次前向传播、flow matching 即插即用近端梯度以及轨迹校正固定点求解器。然而，这些方法通常以恢复 CSI 本身为最终目的。在多用户 MIMO-FAS 中，信道估计却只是中间环节：后续端口选择需要评估大量未被观测的位置，因此估计器应将**完整信道后验的不确定性**传递给决策模块。最终评价标准应当是端口选择质量，而不仅是信道重建误差。

已有端口选择研究还关注发射功率、和速率与 max-min 公平性等目标，多采用交替优化、多方向下降、粒子群等方法 [14]、[24]–[29]。由于问题的离散组合性和非凸性，这些方法可能陷入局部最优；即使存在穷举意义下的最优联合方案，其计算成本也不适于大维度 FAS 在线部署。

### B. 本文贡献

提出由连续信道后验采样与离散端口候选生成构成的两阶段框架。与只把单个估计信道接入端口优化器的传统级联设计不同，这两个阶段源于同一个最大后验决策准则，即最大化端口选择的后验期望效用。该目标对未知信道进行积分平均，计算难度很高，故采用后验样本集合近似期望，再用离散扩散模型缩小组合候选搜索范围。

阶段 I：在二维离散 FAS 上使用流匹配（flow matching）训练流驱动的扩散先验，并利用受 FlowDPS 启发的测量引导生成，从稀疏导频观测中近似采样信道后验。论文报告该估计器在约 20 个推断步骤下保持较高精度和低采样率鲁棒性。

阶段 II：以穷举搜索计算的最优端口标签进行监督，训练条件离散扩散模型生成候选池；随后针对阶段 I 的全部后验样本，按经验期望效用评估每个候选，并执行局部精化。数值结果表明，得到的通信速率达到相应穷举基准的 90% 以上。

## II. 系统模型与问题构建

### A. 信道模型

上行系统由一个采用二维 FAS 的基站和 $K$ 名单 FPA 用户组成。FAS 位于大小为 $W_x\lambda\times W_y\lambda$ 的矩形表面上，均匀离散成 $N=N_xN_y$ 个候选端口。基站只有 $M$ 条射频链，其中 $N\gg M\ge K$；每条射频链连接一根可在候选端口间切换的流体天线。

第 $k$ 名用户到所有基站候选端口的完整上行 CSI 用 $\mathbf H_k\in\mathbb C^{N_x\times N_y}$ 表示。采用 $N_p$ 条主导路径的有限散射信道模型：

$$
\mathbf H_k=\frac1{\sqrt{N_p}}\sum_{i=1}^{N_p}
g_{k,i}\mathbf a_x(\theta_{k,i},\phi_{k,i})
\mathbf a_y^{T}(\theta_{k,i},\phi_{k,i}).\tag{1}
$$

其中 $g_{k,i}$ 为第 $i$ 条路径的复基带增益，$\theta_{k,i}$ 和 $\phi_{k,i}$ 分别是俯仰与方位到达角。原文式 (2) 给出沿两个阵列维度的指数形式导向向量。

### B. 信号模型

上行通信分为导频观测与数据传输两个相邻阶段；假设在这两个阶段内，信道保持准静态，与文中低移动性室内场景一致。$K$ 名用户同步发送相互正交的导频，满足 $\mathbf P\mathbf P^H=\mathbf I_K$。由于只有 $M$ 条射频链，系统每次只能观察 $M$ 个端口。重复发送 $L=\lceil N_O/M\rceil$ 个导频周期后，总共采样 $N_O$ 个端口，空间采样率为 $\delta=N_O/N$，导频开销为 $LK$ 个符号。

用选通矩阵 $\boldsymbol\Omega_{\mathcal O}\in\{0,1\}^{N_O\times N}$ 描述已观测端口的采样，则：

$$
\mathbf Y_p=\boldsymbol\Omega_{\mathcal O}
\widetilde{\mathbf H}\mathbf P+\mathbf N,\tag{3}
$$

其中 $\widetilde{\mathbf H}\in\mathbb C^{N\times K}$ 堆叠了各用户向量化后的完整信道，$\mathbf N$ 为复高斯噪声。为适配神经网络，将每名用户信道的实部和虚部分开堆叠为实向量（式 (4)），并通过逆映射恢复复值信道（式 (5)、(6)）。

数据传输时，基站从 $N$ 个候选端口中激活恰好 $M$ 个。使用二元选择向量 $\mathbf x\in\{0,1\}^{N}$ 且 $\|\mathbf x\|_1=M$，构造对应的选通矩阵 $\boldsymbol\Omega_{\mathbf x}$。有效多用户信道及接收模型为：

$$
\overline{\mathbf H}=
\boldsymbol\Omega_{\mathbf x}\widetilde{\mathbf H}
\in\mathbb C^{M\times K},\tag{7}
$$

$$
\mathbf y_d=\overline{\mathbf H}\mathbf s+\mathbf n_d.\tag{8}
$$

### C. 问题表述

采用 MMSE 线性接收合并，按原文式 (9)、(10) 计算每名用户的接收 SINR $\gamma_k(\mathbf x,\widetilde{\mathbf H})$，相应可达速率定义为：

$$
R_k(\mathbf x,\widetilde{\mathbf H})
=\log_2(1+\gamma_k(\mathbf x,\widetilde{\mathbf H})).\tag{11}
$$

目标是在端口数约束下最大化最差用户速率：

$$
\max_{\mathbf x}\ \min_{k=1,\ldots,K}
R_k(\mathbf x,\widetilde{\mathbf H}),\quad
\mathbf x\in\{0,1\}^{N},\
\|\mathbf x\|_1=M.\tag{12}
$$

实际困难有二：基站只能通过稀疏导频访问信道，无法知道完整 $\widetilde{\mathbf H}$；即使信道已知，也有 $\binom{N}{M}$ 个端口组合，在线穷举代价巨大。

论文因此采用贝叶斯决策观点，令未知信道服从由导频决定的后验 $p(\widetilde{\mathbf H}\mid\mathbf Y_p)$，将目标改为后验期望效用：

$$
\overline U(\mathbf x;\mathbf Y_p)
=\mathbb E_{\widetilde{\mathbf H}\sim p(\widetilde{\mathbf H}\mid\mathbf Y_p)}
[U(\mathbf x,\widetilde{\mathbf H})],\quad
U(\mathbf x,\widetilde{\mathbf H})
=\min_kR_k(\mathbf x,\widetilde{\mathbf H}).\tag{13}
$$

通过 Gibbs 分布 $p_\kappa(\mathbf x\mid\mathbf Y_p)\propto
\exp(\kappa\overline U(\mathbf x;\mathbf Y_p))$，原文式 (14) 将最大后验选择与最大期望效用建立等价关系。利用阶段 I 产生的 $S$ 个近似后验信道样本，将期望替换成经验平均：

$$
\widehat{\overline U}_S(\mathbf x)
=\frac1S\sum_{s=1}^{S}
U(\mathbf x,\widehat{\mathbf H}^{(s)}).\tag{15}
$$

阶段 II 通过离散扩散生成候选集合 $\{\mathbf x^{(c)}\}_{c=1}^{C}$，最终求：

$$
\widehat{\mathbf x}=
\arg\max_{\mathbf x\in\{\mathbf x^{(c)}\}_{c=1}^{C}}
\widehat{\overline U}_S(\mathbf x).\tag{16}
$$

随后进行轻量局部改进。**当 $S=1$ 时**，原文将此解释为用单个估计信道替代完整信道后验的 plug-in 近似，即常见的级联估计—决策管线；$S>1$ 时则尝试利用后验不确定性改善端口决策。

## III. 基于流的扩散信道估计框架

按照第 II-C 节的分析，阶段 I 需要从信道后验 $p(\widetilde{\mathbf H}\mid\mathbf Y_p)$ 中进行近似采样。人工设计的稀疏先验不足以描述 FAS 信道复杂的空间相关性，因此本文采用基于流的扩散模型学习数据驱动的信道先验，并通过观测引导实现近似后验采样。本节依次介绍流模型、离线训练和多用户在线信道估计。

### A. 基于流的扩散模型预备知识

生成模型旨在通过训练数据 $\mathcal D_{\rm train}=\{\mathbf h^{(i)}\}_{i=1}^{N_{\rm train}}$，学习近似真实数据分布 $q(\mathbf h)$ 的模型 $p_\vartheta(\mathbf h)$。基于流的扩散模型把标准高斯源分布 $\mathcal N(0,\mathbf I)$ 通过连续时间概率路径 $\{p_t\}_{t\in[0,1]}$ 传输至目标信道分布，采用与常见从数据到噪声的叙述相反的生成时间方向：$p_1=\mathcal N(0,\mathbf I)$，$p_0=q$。

定义时间相关的双射映射 $\psi_t$，其常微分方程为：

$
\frac{d\psi_t(\mathbf z)}{dt}
=\mathbf v_t(\psi_t(\mathbf z)),\qquad
\psi_1(\mathbf z)=\mathbf z.\tag{17}
$

$\mathbf v_t$ 是随时间变化的速度场。一个初始噪声样本 $\mathbf z_1\sim\mathcal N(0,\mathbf I)$ 被沿连续轨迹 $\mathbf z_t=\psi_t(\mathbf z_1)$ 传输；从 $t=1$ 积分至 $t=0$ 得到符合目标分布的信道样本 $\mathbf h=\mathbf z_0$。

给定具有边缘速度场 $\mathbf v_t$ 的概率路径，通常可以将其用参数化网络 $\mathbf v_t^\vartheta$ 逼近，流匹配（Flow Matching，FM）目标为：

$
\mathcal L_{\rm FM}(\vartheta)=
\mathbb E_{t,\mathbf z_t\sim p_t}
\left[\|\mathbf v_t(\mathbf z_t)
-\mathbf v_t^\vartheta(\mathbf z_t)\|_2^2\right].\tag{18}
$

但真实边缘速度场一般无法计算。采用更简单的条件概率路径 $p_t(\mathbf z_t\mid\mathbf h)$，可将边缘分布与速度场写成：

$
p_t(\mathbf z_t)
=\int p_t(\mathbf z_t\mid\mathbf h)q(\mathbf h)d\mathbf h,\tag{19}
$

$
\mathbf v_t(\mathbf z_t)
=\mathbb E_{\mathbf h\sim p_t(\cdot\mid\mathbf z_t)}
[\mathbf v_t(\mathbf z_t\mid\mathbf h)]
=\int\mathbf v_t(\mathbf z_t\mid\mathbf h)
\frac{p_t(\mathbf z_t\mid\mathbf h)q(\mathbf h)}
{p_t(\mathbf z_t)}d\mathbf h.\tag{20}
$

由于未知数据分布 $q$，式 (20) 的积分仍难计算。条件流匹配（Conditional Flow Matching，CFM）改为直接拟合条件速度场：

$
\mathcal L_{\rm CFM}(\vartheta)=
\mathbb E_{t,\mathbf h\sim q,\mathbf z_t\sim p_t(\cdot\mid\mathbf h)}
\left[\|\mathbf v_t(\mathbf z_t\mid\mathbf h)
-\mathbf v_t^\vartheta(\mathbf z_t)\|_2^2\right].\tag{21}
$

原文指出，CFM 与 FM 对网络参数的梯度相同，因而具有等价的优化目标。训练完成后，从高斯分布采样，再通过 Euler 等方法从 $t=1$ 积分到 $t=0$：

$
\mathbf z_{t-\Delta t}
=\mathbf z_t-\mathbf v_t^\vartheta(\mathbf z_t)\Delta t.\tag{22}
$

由此通过调整网络函数评价次数（number of function evaluations，NFE），在生成质量与推断速度间权衡。

### B. 离线训练：学习基于流的信道先验

**1）仿射条件流与最优传输。** 为具体实现式 (21)，作者选取仿射条件流，在信道样本 $\mathbf h\sim q$ 和噪声 $\mathbf z_1\sim\mathcal N(0,\mathbf I)$ 之间插值：

$
\mathbf z_t=\psi_t(\mathbf z_1\mid\mathbf h)
=a_t\mathbf h+b_t\mathbf z_1.\tag{23}
$

边界条件要求 $a_0=1,b_0=0$，$a_1=0,b_1=1$。作者取线性最优传输形式 $a_t=1-t,b_t=t$：

$
\mathbf z_t=(1-t)\mathbf h+t\mathbf z_1,\tag{24}
$

其对应的条件速度场为：

$
\mathbf v_t(\mathbf z_t\mid\mathbf h)
=\frac{da_t}{dt}\mathbf h+
\frac{db_t}{dt}\mathbf z_1
=\mathbf z_1-\mathbf h.\tag{25}
$

这里的“最优传输（OT）路径”指所采用的线性条件路径，原文认为其较直的轨迹有利于减少大步长数值求解的离散化误差；并非表示使用了求解数据—噪声总体最优耦合的单独训练算法。利用重参数化技巧，最终实际优化目标成为：

$
\mathcal L_{\rm CFM}(\vartheta)=
\mathbb E_{t,\mathbf h\sim q,\mathbf z_1\sim p}
\left[\left\|
\mathbf v_t^\vartheta(\mathbf z_t)
-(\mathbf z_1-\mathbf h)\right\|_2^2\right].\tag{26}
$

该目标仅需样本、高斯噪声、随机时间与向量回归，不需要在每次训练时积分 ODE。

**2）网络与离线训练。** 速度网络采用轻量 U-Net：对称的三层分辨率编码器—解码器结构、用于特征提取的 ResNet 块，以及保留空间细节的跳跃连接。实值信道向量 $\mathbf z_t\in\mathbb R^{2N}$ 被重新排列为 $2\times N_x\times N_y$ 的张量，两个通道对应复信道实部和虚部；连续时间 $t$ 经过正弦位置编码，并注入各 ResNet 模块。

在每个小批量中，从离线信道数据集抽取 $B$ 个样本，对每个样本独立抽取 $t^{(i)}\sim U[0,1]$ 与 $\mathbf z_1^{(i)}\sim\mathcal N(0,\mathbf I)$，按照式 (24) 构造 $\mathbf z_{t^{(i)}}^{(i)}$。经验训练损失为：

$
\widehat{\mathcal L}_{\rm CFM}(\vartheta)
=\frac1B\sum_{i=1}^{B}
\left\|\mathbf v_{t^{(i)}}^\vartheta
(\mathbf z_{t^{(i)}}^{(i)})
-(\mathbf z_1^{(i)}-\mathbf h^{(i)})\right\|_2^2.\tag{27}
$

**算法 1：离线基于流的扩散模型训练。** 输入训练集、小批量大小 $B$ 与学习率 $\zeta$；循环执行样本抽取、均匀时间采样、高斯噪声采样及插值状态构造；计算式 (27)；用 SGD/Adam 更新 $\vartheta\leftarrow\vartheta-\zeta\nabla_\vartheta\widehat{\mathcal L}_{\rm CFM}$，直至收敛。

### C. 在线推断：以测量一致性流引导实现多用户信道估计

直接从 $K$ 个独立高斯源变量积分流 ODE，只会产生忽略导频的无条件信道样本。为了在推断期间满足导频观测，作者受到 FlowDPS [42] 启发，设计了对所有用户进行并行引导生成的统一测量一致性机制。

**1）流分解。** 先省略用户下标。沿最优传输路径，式 (20) 中的瞬时边缘速度可以表示为给定中间状态的条件速度期望：

$
\mathbf v_t(\mathbf z_t)
=\mathbb E[\mathbf z_1-\mathbf h\mid\mathbf z_t]
=\widehat{\mathbf z}_{1\mid t}
-\widehat{\mathbf h}_{0\mid t},\tag{28}
$

其中 $\widehat{\mathbf h}_{0\mid t}=\mathbb E[\mathbf h\mid\mathbf z_t]$，$\widehat{\mathbf z}_{1\mid t}=\mathbb E[\mathbf z_1\mid\mathbf z_t]$。再由条件均值的线性性得：

$
\mathbf z_t=(1-t)\widehat{\mathbf h}_{0\mid t}
+t\widehat{\mathbf z}_{1\mid t}.\tag{29}
$

联立并以学习网络近似真实速度场，得到最优传输路径下的 Tweedie 形式：

$
\widehat{\mathbf h}_{0\mid t}
=\mathbf z_t-t\mathbf v_t^\vartheta(\mathbf z_t),\tag{30}
$

$
\widehat{\mathbf z}_{1\mid t}
=\mathbf z_t+(1-t)\mathbf v_t^\vartheta(\mathbf z_t).\tag{31}
$

据此，从任何中间状态都可以近似提取“干净信道预测”及“噪声源预测”。将其代回 Euler 更新，得到：

$
\begin{aligned}
\mathbf z_{t-\Delta t}
&=\mathbf z_t-\mathbf v_t^\vartheta(\mathbf z_t)\Delta t\\
&=[1-(t-\Delta t)]\widehat{\mathbf h}_{0\mid t}
+(t-\Delta t)\widehat{\mathbf z}_{1\mid t}.
\end{aligned}\tag{32}
$

这一分解的工程作用是：无需直接改写整个生成轨迹，只需在每个时间步对“干净信道预测”施加导频一致性约束，再按原有权重重组成下一中间状态。

**2）对干净信道预测施加统一引导。** 恢复用户下标后，各用户的复信道预测通过实值逆映射拼接为：

$
\widehat{\mathbf H}_{0\mid t}
=[f^{-1}(\widehat{\mathbf h}_{1,0\mid t}),
\ldots,f^{-1}(\widehat{\mathbf h}_{K,0\mid t})].\tag{33}
$

测量一致性损失定义为：

$
\mathcal L_{\rm MC}
=\frac12\left\|
\mathbf Y_p-\boldsymbol\Omega_{\mathcal O}
\widehat{\mathbf H}_{0\mid t}\mathbf P
\right\|_F^2.\tag{34}
$

采用负梯度更新干净信道估计：

$
\widehat{\mathbf H}_{0\mid t}(\mathbf Y_p)
=\widehat{\mathbf H}_{0\mid t}
-\alpha_t\nabla_{\widehat{\mathbf H}_{0\mid t}}
\mathcal L_{\rm MC},\tag{35}
$

$
\nabla_{\widehat{\mathbf H}_{0\mid t}}\mathcal L_{\rm MC}
=-\boldsymbol\Omega_{\mathcal O}^{H}
\left(\mathbf Y_p-
\boldsymbol\Omega_{\mathcal O}\widehat{\mathbf H}_{0\mid t}
\mathbf P\right)\mathbf P^{H}.\tag{36}
$

再取更新矩阵第 $k$ 列，并经实值映射 $f$ 得到各用户在该步的引导结果（原文式 (37)）。

**3）稳健引导的三项实用技术。**

第一，**梯度归一化**。生成初始阶段 $t\to1$ 时，预测信道不确定性大，梯度模长波动明显。于是作者将引导梯度除以 Frobenius 范数，令更新幅度主要受 $\alpha_t$ 控制：

$
\widehat{\mathbf H}_{0\mid t}(\mathbf Y_p)
=\widehat{\mathbf H}_{0\mid t}
-\alpha_t\frac{\nabla\mathcal L_{\rm MC}}
{\|\nabla\mathcal L_{\rm MC}\|_F}.\tag{38}
$

第二，**多步内优化与插值**。单个流积分步内只修正一次通常不能充分满足测量约束。因此参考 DDS [45]，每个外部积分步执行 $N_{\rm iter}$ 次连续梯度更新（例如 3 次），再将导频引导结果与原先验预测插值：

$
\widehat{\mathbf H}_{0\mid t}^{\rm guided}
=(1-\gamma_t)\widehat{\mathbf H}_{0\mid t}
+\gamma_t\widehat{\mathbf H}_{0\mid t}(\mathbf Y_p).\tag{39}
$

设 $\gamma_t=t$：在高噪声早期加强测量一致性，接近 $t=0$ 时更多保留学习先验的结构。

第三，**噪声随机性注入**。由于导频包含 AWGN，仅最小化测量残差可能过拟合噪声。作者在 Euler 步前修改源噪声预测：

$
\widehat{\mathbf z}_{k,1\mid t}^{\rm stoch}
=\sqrt{1-\eta_t}\widehat{\mathbf z}_{k,1\mid t}
+\sqrt{\eta_t}\boldsymbol\epsilon,\quad
\boldsymbol\epsilon\sim\mathcal N(0,\mathbf I).\tag{40}
$

采用 $\eta_t=1-(t-\Delta t)$，使随机性随 $t\to0$ 增强；不过 Euler 分解中噪声分量的权重是 $t-\Delta t$，会在末端消失，因此作者认为这种处理能够抑制导频噪声过拟合而不明显损害最终估计。

**算法 2：在线流模型信道估计。** （1）对 $K$ 个用户分别初始化高斯状态 $\mathbf z_{k,1}$；（2）从 $t=1$ 递减至 $0$，并行计算式 (30)、(31)；（3）将各用户干净信道预测组装成 $\widehat{\mathbf H}_{0\mid t}$；（4）计算式 (36)，执行 $N_{\rm iter}$ 次归一化测量梯度更新；（5）按式 (39) 将引导结果和先验预测插值；（6）根据式 (40) 注入源噪声，再以式 (32) 更新每名用户状态；（7）输出各用户最终估计信道。

**备注 2：贝叶斯解释。** 作者将这一生成过程视作学习先验 $p_\vartheta(\widetilde{\mathbf H})=\prod_k p_\vartheta(\mathbf h_k)$ 和导频似然共同定义的后验的近似采样：不可直接计算的含噪似然梯度，用“在去噪预测点上评价似然梯度”来近似，并以局部线性干净数据流形假设作解释。插值时间表和随机性安排参考 [42]。但梯度归一化改变了精确梯度的幅值，因此它是近似引导而不是已证明的精确后验采样；更严格的论证需参见 [42]。

为构成第 II-C 节所需的后验样本集合，阶段 I 将算法 2 用独立初值及独立随机性运行 $S$ 次，得到 $\{\widehat{\mathbf H}^{(s)}\}_{s=1}^{S}$。与只输出一个点估计不同，后续端口选择将利用这些样本反映未知信道的不确定性。

{% endraw %}
