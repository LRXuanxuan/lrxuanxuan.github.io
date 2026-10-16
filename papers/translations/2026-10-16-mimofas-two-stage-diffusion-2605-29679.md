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

$$
\frac{d\psi_t(\mathbf z)}{dt}
=\mathbf v_t(\psi_t(\mathbf z)),\qquad
\psi_1(\mathbf z)=\mathbf z.\tag{17}
$$

$\mathbf v_t$ 是随时间变化的速度场。一个初始噪声样本 $\mathbf z_1\sim\mathcal N(0,\mathbf I)$ 被沿连续轨迹 $\mathbf z_t=\psi_t(\mathbf z_1)$ 传输；从 $t=1$ 积分至 $t=0$ 得到符合目标分布的信道样本 $\mathbf h=\mathbf z_0$。

给定具有边缘速度场 $\mathbf v_t$ 的概率路径，通常可以将其用参数化网络 $\mathbf v_t^\vartheta$ 逼近，流匹配（Flow Matching，FM）目标为：

$$
\mathcal L_{\rm FM}(\vartheta)=
\mathbb E_{t,\mathbf z_t\sim p_t}
\left[\|\mathbf v_t(\mathbf z_t)
-\mathbf v_t^\vartheta(\mathbf z_t)\|_2^2\right].\tag{18}
$$

但真实边缘速度场一般无法计算。采用更简单的条件概率路径 $p_t(\mathbf z_t\mid\mathbf h)$，可将边缘分布与速度场写成：

$$
p_t(\mathbf z_t)
=\int p_t(\mathbf z_t\mid\mathbf h)q(\mathbf h)d\mathbf h,\tag{19}
$$

$$
\mathbf v_t(\mathbf z_t)
=\mathbb E_{\mathbf h\sim p_t(\cdot\mid\mathbf z_t)}
[\mathbf v_t(\mathbf z_t\mid\mathbf h)]
=\int\mathbf v_t(\mathbf z_t\mid\mathbf h)
\frac{p_t(\mathbf z_t\mid\mathbf h)q(\mathbf h)}
{p_t(\mathbf z_t)}d\mathbf h.\tag{20}
$$

由于未知数据分布 $q$，式 (20) 的积分仍难计算。条件流匹配（Conditional Flow Matching，CFM）改为直接拟合条件速度场：

$$
\mathcal L_{\rm CFM}(\vartheta)=
\mathbb E_{t,\mathbf h\sim q,\mathbf z_t\sim p_t(\cdot\mid\mathbf h)}
\left[\|\mathbf v_t(\mathbf z_t\mid\mathbf h)
-\mathbf v_t^\vartheta(\mathbf z_t)\|_2^2\right].\tag{21}
$$

原文指出，CFM 与 FM 对网络参数的梯度相同，因而具有等价的优化目标。训练完成后，从高斯分布采样，再通过 Euler 等方法从 $t=1$ 积分到 $t=0$：

$$
\mathbf z_{t-\Delta t}
=\mathbf z_t-\mathbf v_t^\vartheta(\mathbf z_t)\Delta t.\tag{22}
$$

由此通过调整网络函数评价次数（number of function evaluations，NFE），在生成质量与推断速度间权衡。

### B. 离线训练：学习基于流的信道先验

**1）仿射条件流与最优传输。** 为具体实现式 (21)，作者选取仿射条件流，在信道样本 $\mathbf h\sim q$ 和噪声 $\mathbf z_1\sim\mathcal N(0,\mathbf I)$ 之间插值：

$$
\mathbf z_t=\psi_t(\mathbf z_1\mid\mathbf h)
=a_t\mathbf h+b_t\mathbf z_1.\tag{23}
$$

边界条件要求 $a_0=1,b_0=0$，$a_1=0,b_1=1$。作者取线性最优传输形式 $a_t=1-t,b_t=t$：

$$
\mathbf z_t=(1-t)\mathbf h+t\mathbf z_1,\tag{24}
$$

其对应的条件速度场为：

$$
\mathbf v_t(\mathbf z_t\mid\mathbf h)
=\frac{da_t}{dt}\mathbf h+
\frac{db_t}{dt}\mathbf z_1
=\mathbf z_1-\mathbf h.\tag{25}
$$

这里的“最优传输（OT）路径”指所采用的线性条件路径，原文认为其较直的轨迹有利于减少大步长数值求解的离散化误差；并非表示使用了求解数据—噪声总体最优耦合的单独训练算法。利用重参数化技巧，最终实际优化目标成为：

$$
\mathcal L_{\rm CFM}(\vartheta)=
\mathbb E_{t,\mathbf h\sim q,\mathbf z_1\sim p}
\left[\left\|
\mathbf v_t^\vartheta(\mathbf z_t)
-(\mathbf z_1-\mathbf h)\right\|_2^2\right].\tag{26}
$$

该目标仅需样本、高斯噪声、随机时间与向量回归，不需要在每次训练时积分 ODE。

**2）网络与离线训练。** 速度网络采用轻量 U-Net：对称的三层分辨率编码器—解码器结构、用于特征提取的 ResNet 块，以及保留空间细节的跳跃连接。实值信道向量 $\mathbf z_t\in\mathbb R^{2N}$ 被重新排列为 $2\times N_x\times N_y$ 的张量，两个通道对应复信道实部和虚部；连续时间 $t$ 经过正弦位置编码，并注入各 ResNet 模块。

在每个小批量中，从离线信道数据集抽取 $B$ 个样本，对每个样本独立抽取 $t^{(i)}\sim U[0,1]$ 与 $\mathbf z_1^{(i)}\sim\mathcal N(0,\mathbf I)$，按照式 (24) 构造 $\mathbf z_{t^{(i)}}^{(i)}$。经验训练损失为：

$$
\widehat{\mathcal L}_{\rm CFM}(\vartheta)
=\frac1B\sum_{i=1}^{B}
\left\|\mathbf v_{t^{(i)}}^\vartheta
(\mathbf z_{t^{(i)}}^{(i)})
-(\mathbf z_1^{(i)}-\mathbf h^{(i)})\right\|_2^2.\tag{27}
$$

**算法 1：离线基于流的扩散模型训练。** 输入训练集、小批量大小 $B$ 与学习率 $\zeta$；循环执行样本抽取、均匀时间采样、高斯噪声采样及插值状态构造；计算式 (27)；用 SGD/Adam 更新 $\vartheta\leftarrow\vartheta-\zeta\nabla_\vartheta\widehat{\mathcal L}_{\rm CFM}$，直至收敛。

### C. 在线推断：以测量一致性流引导实现多用户信道估计

直接从 $K$ 个独立高斯源变量积分流 ODE，只会产生忽略导频的无条件信道样本。为了在推断期间满足导频观测，作者受到 FlowDPS [42] 启发，设计了对所有用户进行并行引导生成的统一测量一致性机制。

**1）流分解。** 先省略用户下标。沿最优传输路径，式 (20) 中的瞬时边缘速度可以表示为给定中间状态的条件速度期望：

$$
\mathbf v_t(\mathbf z_t)
=\mathbb E[\mathbf z_1-\mathbf h\mid\mathbf z_t]
=\widehat{\mathbf z}_{1\mid t}
-\widehat{\mathbf h}_{0\mid t},\tag{28}
$$

其中 $\widehat{\mathbf h}_{0\mid t}=\mathbb E[\mathbf h\mid\mathbf z_t]$，$\widehat{\mathbf z}_{1\mid t}=\mathbb E[\mathbf z_1\mid\mathbf z_t]$。再由条件均值的线性性得：

$$
\mathbf z_t=(1-t)\widehat{\mathbf h}_{0\mid t}
+t\widehat{\mathbf z}_{1\mid t}.\tag{29}
$$

联立并以学习网络近似真实速度场，得到最优传输路径下的 Tweedie 形式：

$$
\widehat{\mathbf h}_{0\mid t}
=\mathbf z_t-t\mathbf v_t^\vartheta(\mathbf z_t),\tag{30}
$$

$$
\widehat{\mathbf z}_{1\mid t}
=\mathbf z_t+(1-t)\mathbf v_t^\vartheta(\mathbf z_t).\tag{31}
$$

据此，从任何中间状态都可以近似提取“干净信道预测”及“噪声源预测”。将其代回 Euler 更新，得到：

$$
\begin{aligned}
\mathbf z_{t-\Delta t}
&=\mathbf z_t-\mathbf v_t^\vartheta(\mathbf z_t)\Delta t\\
&=[1-(t-\Delta t)]\widehat{\mathbf h}_{0\mid t}
+(t-\Delta t)\widehat{\mathbf z}_{1\mid t}.
\end{aligned}\tag{32}
$$

这一分解的工程作用是：无需直接改写整个生成轨迹，只需在每个时间步对“干净信道预测”施加导频一致性约束，再按原有权重重组成下一中间状态。

**2）对干净信道预测施加统一引导。** 恢复用户下标后，各用户的复信道预测通过实值逆映射拼接为：

$$
\widehat{\mathbf H}_{0\mid t}
=[f^{-1}(\widehat{\mathbf h}_{1,0\mid t}),
\ldots,f^{-1}(\widehat{\mathbf h}_{K,0\mid t})].\tag{33}
$$

测量一致性损失定义为：

$$
\mathcal L_{\rm MC}
=\frac12\left\|
\mathbf Y_p-\boldsymbol\Omega_{\mathcal O}
\widehat{\mathbf H}_{0\mid t}\mathbf P
\right\|_F^2.\tag{34}
$$

采用负梯度更新干净信道估计：

$$
\widehat{\mathbf H}_{0\mid t}(\mathbf Y_p)
=\widehat{\mathbf H}_{0\mid t}
-\alpha_t\nabla_{\widehat{\mathbf H}_{0\mid t}}
\mathcal L_{\rm MC},\tag{35}
$$

$$
\nabla_{\widehat{\mathbf H}_{0\mid t}}\mathcal L_{\rm MC}
=-\boldsymbol\Omega_{\mathcal O}^{H}
\left(\mathbf Y_p-
\boldsymbol\Omega_{\mathcal O}\widehat{\mathbf H}_{0\mid t}
\mathbf P\right)\mathbf P^{H}.\tag{36}
$$

再取更新矩阵第 $k$ 列，并经实值映射 $f$ 得到各用户在该步的引导结果（原文式 (37)）。

**3）稳健引导的三项实用技术。**

第一，**梯度归一化**。生成初始阶段 $t\to1$ 时，预测信道不确定性大，梯度模长波动明显。于是作者将引导梯度除以 Frobenius 范数，令更新幅度主要受 $\alpha_t$ 控制：

$$
\widehat{\mathbf H}_{0\mid t}(\mathbf Y_p)
=\widehat{\mathbf H}_{0\mid t}
-\alpha_t\frac{\nabla\mathcal L_{\rm MC}}
{\|\nabla\mathcal L_{\rm MC}\|_F}.\tag{38}
$$

第二，**多步内优化与插值**。单个流积分步内只修正一次通常不能充分满足测量约束。因此参考 DDS [45]，每个外部积分步执行 $N_{\rm iter}$ 次连续梯度更新（例如 3 次），再将导频引导结果与原先验预测插值：

$$
\widehat{\mathbf H}_{0\mid t}^{\rm guided}
=(1-\gamma_t)\widehat{\mathbf H}_{0\mid t}
+\gamma_t\widehat{\mathbf H}_{0\mid t}(\mathbf Y_p).\tag{39}
$$

设 $\gamma_t=t$：在高噪声早期加强测量一致性，接近 $t=0$ 时更多保留学习先验的结构。

第三，**噪声随机性注入**。由于导频包含 AWGN，仅最小化测量残差可能过拟合噪声。作者在 Euler 步前修改源噪声预测：

$$
\widehat{\mathbf z}_{k,1\mid t}^{\rm stoch}
=\sqrt{1-\eta_t}\widehat{\mathbf z}_{k,1\mid t}
+\sqrt{\eta_t}\boldsymbol\epsilon,\quad
\boldsymbol\epsilon\sim\mathcal N(0,\mathbf I).\tag{40}
$$

采用 $\eta_t=1-(t-\Delta t)$，使随机性随 $t\to0$ 增强；不过 Euler 分解中噪声分量的权重是 $t-\Delta t$，会在末端消失，因此作者认为这种处理能够抑制导频噪声过拟合而不明显损害最终估计。

**算法 2：在线流模型信道估计。** （1）对 $K$ 个用户分别初始化高斯状态 $\mathbf z_{k,1}$；（2）从 $t=1$ 递减至 $0$，并行计算式 (30)、(31)；（3）将各用户干净信道预测组装成 $\widehat{\mathbf H}_{0\mid t}$；（4）计算式 (36)，执行 $N_{\rm iter}$ 次归一化测量梯度更新；（5）按式 (39) 将引导结果和先验预测插值；（6）根据式 (40) 注入源噪声，再以式 (32) 更新每名用户状态；（7）输出各用户最终估计信道。

**备注 2：贝叶斯解释。** 作者将这一生成过程视作学习先验 $p_\vartheta(\widetilde{\mathbf H})=\prod_k p_\vartheta(\mathbf h_k)$ 和导频似然共同定义的后验的近似采样：不可直接计算的含噪似然梯度，用“在去噪预测点上评价似然梯度”来近似，并以局部线性干净数据流形假设作解释。插值时间表和随机性安排参考 [42]。但梯度归一化改变了精确梯度的幅值，因此它是近似引导而不是已证明的精确后验采样；更严格的论证需参见 [42]。

为构成第 II-C 节所需的后验样本集合，阶段 I 将算法 2 用独立初值及独立随机性运行 $S$ 次，得到 $\{\widehat{\mathbf H}^{(s)}\}_{s=1}^{S}$。与只输出一个点估计不同，后续端口选择将利用这些样本反映未知信道的不确定性。

作者同时报告由后验样本集合得到的均值估计 $\widehat{\mathbf H}_{\rm mean}=S^{-1}\sum_s\widehat{\mathbf H}^{(s)}$。这一均值既用作阶段 II 条件离散扩散的输入，也用作第 V 节的 CSI 精度评估；但真正的决策目标式 (15) 仍利用完整样本集合。

### D. 计算复杂度

在线信道估计的主要开销来自 U-Net 前向运行与观测一致性梯度计算。对于有 $N$ 个空间像素、每层特征通道数至多 $D_{\max}$ 的固定深度 U-Net，卷积核大小固定时，一次前向传播约需 $O(ND_{\max}^2)$ 运算。每个积分步包含 $K$ 名用户的网络前向与 $N_{\rm iter}$ 次测量梯度计算。由于选通矩阵是二元矩阵，式 (36) 的梯度运算主要消耗于与正交导频矩阵相乘，复杂度为 $O(N_OK^2)$。

令 NFE $=1/\Delta t$、$N_O=\delta N$，则算法 2 一次运行的复杂度为：

$$
O\!\left(\mathrm{NFE}\cdot N
(KD_{\max}^2+N_{\rm iter}\delta K^2)\right).
$$

运行 $S$ 次获取后验样本集合，总成本为：

$$
O\!\left(S\cdot\mathrm{NFE}\cdot N
(KD_{\max}^2+N_{\rm iter}\delta K^2)\right).
$$

$S$ 次采样及同一次采样内各用户的前向计算均相互独立，可以批处理并行执行。

## IV. 基于离散扩散的端口选择

阶段 II 需要在离散可行集 $\mathcal X$ 上优化式 (15)，直接穷举仍然不可行。因此先训练一个条件采样器，输出较少但质量较高的端口配置，再在这些候选上用统一决策准则评分与局部优化。该过程只有在候选集合中包含接近最优的端口配置时，才能逼近完整组合搜索的结果。

当信道已完全已知时，第 II-C 节中的 Gibbs 分布退化为：

$$
p_\kappa(\mathbf x\mid\widetilde{\mathbf H})
=\frac1Z\exp\big(\kappa U(\mathbf x,\widetilde{\mathbf H})\big).
\tag{41}
$$

$\kappa>0$ 越大，高效用端口组合的概率权重越高；当 $\kappa\to\infty$ 时，分布集中在最大效用解 $\mathbf x^*(\widetilde{\mathbf H})$ 上。作者把这一极限用作训练目标，学习条件分布 $p_\phi(\mathbf x\mid\widetilde{\mathbf H})$，允许在线阶段对同一信道多次采样获得候选池，而不是只输出单个解。需要注意，实际训练**并不需要显式选择温度 $\kappa$**；这一 Gibbs 形式主要为训练目标提供概率解释。

### A. 离散扩散模型基础

端口配置是长度为 $N$ 的二元向量，故本文改用离散扩散过程。令 $q(\mathbf x)$ 为目标离散分布，反向生成是一条 $T$ 步马尔可夫链：

$$
p_\phi(\mathbf x_{0:T})
=p(\mathbf x_T)\prod_{t=1}^{T}
p_\phi(\mathbf x_{t-1}\mid\mathbf x_t).\tag{42}
$$

以独热编码 $\widetilde{\mathbf x}=[\mathbf 1-\mathbf x,\mathbf x]\in\{0,1\}^{N\times2}$ 表示二值状态，正向扩散每步通过类别分布（Cat）随机翻转元素：

$$
q(\mathbf x_t\mid\mathbf x_{t-1})
=\mathrm{Cat}(\mathbf x_t;\,
p=\widetilde{\mathbf x}_{t-1}\mathbf Q_t),\tag{43}
$$

$$
\mathbf Q_t=
\begin{bmatrix}
1-\beta_t & \beta_t\\
\beta_t & 1-\beta_t
\end{bmatrix}.\tag{44}
$$

噪声时间表 $\beta_t\in(0,1)$ 被设置为使最终分布接近二值均匀随机状态。由马尔可夫性，边缘正向分布 $q(\mathbf x_t\mid\mathbf x_0)$ 可通过累积转移矩阵 $\overline{\mathbf Q}_t=\prod_{i=1}^{t}\mathbf Q_i$ 精确计算。

反向去噪网络预测干净端口配置的分布 $p_\phi(\widehat{\mathbf x}_0\mid\mathbf x_t)$，由它对精确逆条件转移求和：

$$
p_\phi(\mathbf x_{t-1}\mid\mathbf x_t)
=\sum_{\widehat{\mathbf x}_0}
q(\mathbf x_{t-1}\mid\mathbf x_t,\widehat{\mathbf x}_0)
p_\phi(\widehat{\mathbf x}_0\mid\mathbf x_t).
\tag{45}
$$

贝叶斯公式给出 $q(\mathbf x_{t-1}\mid\mathbf x_t,\mathbf x_0)$ 的闭式表达（原文式 (46)），其中使用类别分布、累积转移矩阵及 Hadamard 乘积。为了学习上述逆过程，作者用负证据下界（ELBO）分解损失：各中间时间步的 KL 散度、一步重构的负对数似然以及末端先验匹配项（式 (47)）。由于最后一项对网络参数 $\phi$ 为常数，可忽略；二值变量的重构与中间 KL 项则对应预测干净二值状态的交叉熵，于是采用可计算的二元交叉熵代理损失：

$$
\mathcal L_{\rm BCE}(\phi,\mathbf x_0)
=\mathbb E_{t,\mathbf x_t}
\left[-\sum_{n=1}^{N}
\log p_\phi(\widehat x_{0,n}=x_{0,n}\mid\mathbf x_t)
\right].\tag{48}
$$

### B. 监督学习式端口选择求解器

阶段 II 的目标是使 $p_\phi(\mathbf x\mid\widetilde{\mathbf H})$ 接近条件最优选择所形成的点质量分布 $\delta_{\mathbf x^*(\widetilde{\mathbf H})}$。作者沿用第 III 节的轻量 U-Net，但把 $K$ 个用户复信道的实部/虚部与当前离散掩码拼接为 $(2K+1)\times N_x\times N_y$ 的输入张量。

参考 DIFUSCO [48]，条件训练目标表述为：

$$
\min_\phi\ \mathbb E_{\widetilde{\mathbf H}}
\big[D_{\rm KL}(\delta_{\mathbf x^*(\widetilde{\mathbf H})}
\parallel p_\phi(\mathbf x\mid\widetilde{\mathbf H}))\big].
\tag{49}
$$

由于目标分布是点质量，等价于最小化最优标签的负对数似然：

$$
\min_\phi\ \mathbb E_{\widetilde{\mathbf H}}
\left[-\log p_\phi(
\mathbf x^*(\widetilde{\mathbf H})\mid
\widetilde{\mathbf H})\right].\tag{50}
$$

由此可采用条件版本的 BCE 训练损失。

为了离线建立监督数据，随机从信道训练集抽取 $K$ 个用户信道并组装为多用户信道样本，然后穷举该信道的所有合法 $M$ 端口子集，计算每个子集的效用并选取最优者。论文用固定参考噪声方差 $\sigma_n^2=10^{-2}$ 生成标签，并说明在其评估区间内最优端口对该设置不敏感。重复 $N_{\rm sl}$ 次，得到有标签训练集 $\mathcal D_{\rm sl}=\{(\widetilde{\mathbf H}^{(i)},\mathbf x^{*(i)})\}_{i=1}^{N_{\rm sl}}$。

穷举搜索是一次性的**离线**计算成本。论文针对其端口数和 RF 链数，使用 GPU 并行评估闭式效用获得准确标签；作者指出，当 $N$ 和 $M$ 进一步增大，以至于离线穷举也不可行时，可用较强启发式搜索生成参考标签，但此时学习目标将从严格最优退化为启发式解，不能再称为最优标签。

**算法 3：条件离散扩散的监督训练。** 从 $\mathcal D_{\rm sl}$ 抽取一个多用户信道和其最优掩码，随机选择离散时间 $t$；按照 $\overline{\mathbf Q}_t$ 正向加噪，得到 $\mathbf x_t$；利用给定信道和 $\mathbf x_t$ 的网络输出计算式 (48) 的条件 BCE；用 SGD/Adam 更新参数直至收敛。

### C. 在线端口选择

虽然模型训练时以干净信道为条件，在线运行时实际条件输入为阶段 I 的后验均值 $\widehat{\mathbf H}_{\rm mean}$。因此条件输入的估计误差可能影响候选质量；但最终仍使用完整后验样本集合定义的式 (15) 选择与精化候选。

为了减少离散扩散的生成开销，作者使用跳步采样：从 $T$ 个原始时间步中选一个更短的子序列 $\{\tau_i\}_{i=0}^{T'}$，$T'\ll T$，相应逆转移仍通过对预测干净掩码求和计算：

$$
p_\phi(\mathbf x_{\tau_{i-1}}\mid
\mathbf x_{\tau_i},\widehat{\mathbf H})
=\sum_{\widehat{\mathbf x}_0}
q(\mathbf x_{\tau_{i-1}}\mid
\mathbf x_{\tau_i},\widehat{\mathbf x}_0)
p_\phi(\widehat{\mathbf x}_0\mid
\mathbf x_{\tau_i},\widehat{\mathbf H}).
\tag{51}
$$

最后一个步骤不再随机抽样，而将网络预测概率最大的 $M$ 个端口确定性地置 1，其余置 0，从而保证最终掩码满足 $\|\mathbf x\|_1=M$。中间状态允许暂时不满足端口数限制，最终通过 top-$M$ 投影恢复可行性。

并行进行 $C$ 次采样得到候选集合，使用式 (15) 的经验后验期望效用选取最佳候选；然后枚举当前配置中一个已选端口与一个未选端口的所有交换，若某交换改善目标则接受，并重复至没有改进或达到 $N_r$ 次精化上限。评价端口效用采用闭式计算，不需额外神经网络前向传播。

**算法 4：在线离散扩散端口选择。** 输入 $\widehat{\mathbf H}_{\rm mean}$、$S$ 个后验样本、训练好的条件预测网络、跳步时间表、候选池大小 $C$ 和局部精化轮数 $N_r$；并行执行 $C$ 条离散逆扩散链，每条链最后用 top-$M$ 得到合法掩码；按式 (16) 对候选排序；对最优掩码执行最多 $N_r$ 轮单端口交换，直到无改进；输出最终端口选择。

### D. 计算复杂度

单次 U-Net 前向仍为 $O(ND_{\max}^2)$。生成 $C$ 个候选、各执行 $T'$ 次网络调用的成本为 $O(CT'ND_{\max}^2)$。评分及局部精化最多需评估 $C+N_rM(N-M)$ 个配置，每个配置利用 $S$ 个信道样本计算效用；一次效用计算的成本为 $O(M^3+M^2K)$。因而总复杂度为：

$$
O\!\left(CT'ND_{\max}^2+
S\bigl(C+N_rM(N-M)\bigr)(M^3+M^2K)\right).
$$

作者指出，所考虑的数值配置中，候选生成网络的前向传播占主要成本。

## V. 数值实验

### A. 仿真设置

系统载频 $f_c=3$ GHz。基站二维 FAS 面板大小 $3\lambda\times3\lambda$，离散为 $25\times25=625$ 个端口，端口间距为 $\lambda/8$；使用 $M=4$ 条激活 RF 链服务 $K=4$ 名单 FPA 用户。基站面板高 4.0 m，用户高度 1.5 m，距基站的径向距离在 10–50 m 内均匀采样。

用 QuaDRiGa 仿真器 [49] 及 3GPP_38.901_Indoor_NLOS 信道场景生成多径样本，每个实现具有 $N_p=20$ 条主要路径，平均方位、俯仰角扩展分别为 $72.9^\circ$、$39.8^\circ$，路径时延、增益及簇参数根据 3GPP 模型生成。

共生成 41,000 个独立信道样本，并将每个用户的空间端口信道按同一标量归一化为单位方差；这一操作保留同一用户各端口之间的相对空间起伏，但会影响跨用户的绝对大尺度衰落差异。作者因此在评价时假设所有用户具有相近的大尺度损耗及共同 SNR。40,000 个样本用于训练先验，1,000 个用于测试。另行生成 10,000 组信道—最优端口标签训练离散扩散模型。

离散扩散训练采用 $T=1000$ 步余弦噪声时间表。流先验训练 250 个 epoch，条件端口采样器训练 100 个 epoch，均采用 Adam 和学习率 $10^{-4}$。

### B. 采样步数对信道估计精度的影响

除非另有说明，默认观测端口数 $N_O=121$、SNR $=20$ dB，每个点对 100 次 Monte Carlo 运行取平均，导频码本来自 Hadamard 矩阵。采用归一化均方误差：

$$
\mathrm{NMSE}=
\mathbb E\left[
\frac{\|\widehat{\mathbf H}
-\widetilde{\mathbf H}\|_F^2}
{\|\widetilde{\mathbf H}\|_F^2}
\right].\tag{52}
$$

生成信道已归一化，故 SNR $=1/\sigma_n^2$。测量一致性指导每步执行 $N_{\rm iter}=3$ 次梯度更新，引导步长 $\alpha_t$ 对各测试工作点调定后保持固定；默认信道估计使用 $S=4$ 个后验样本的均值。

**图 4：** 在 $N_O=121$、20 dB 条件下，随着 NFE 增大，NMSE 先快速改善，约 20 NFE 后趋于饱和。作者随后主要采用 NFE $=50$ 进行其余实验，以选取饱和区域内的推断步数。因此，图中的 20 NFE 并不是全部后续结果的默认配置，更不能忽略每个积分步内的三次梯度引导运算。

### C. 不同信噪比下的估计鲁棒性

为和主要面向 SISO-FAS 的基线比较，先使用导频伪逆 $\mathbf Y_p\mathbf P^\dagger$ 将多用户观测分解为各用户的单信道恢复问题。全阵列 $N_O=N$ 时用 LS 作为参考；欠采样时比较三种方法：（1）OMP：在方位角与俯仰角上均构建 50 网格分辨率的过完备字典；（2）SBL：使用与 OMP 相同字典，通过 EM 学习稀疏角度系数的高斯先验；（3）LMMSE：假设简化的复高斯信道先验，协方差由 40,000 个训练样本估计。

**图 5：** 在 $N_O=121$ 下比较 −10 至 30 dB 的 NMSE。完整观测 LS 在高 SNR 时具有良好精度，但需要采集全部 625 个端口。提出的方法从 0 dB 起优于欠采样基线；在特别低的 SNR 下，LMMSE 仍表现最好。这意味着文中方法的优势并非覆盖所有噪声强度。

### D. 空间欠采样率的影响

**图 6：** 在 20 dB、不同 $\delta=N_O/N$ 下比较欠采样估计。随着 $\delta$ 从 4% 增至 13%，所提方法 NMSE 快速下降，相对 OMP、SBL、LMMSE 的优势明显。作者认为，生成先验学习到复杂的 FAS 空间相关性，而低采样率下 OMP/SBL 的测量矩阵严重病态，LMMSE 的单高斯先验又过于简单。

对于 $3\lambda\times3\lambda$ 孔径，论文引用傅里叶平面波展开，指出在各向同性散射条件下，有效空间自由度至多约 $\lceil\pi W_xW_y\rceil=29$，尽管离散端口数为 625。图 6 中最小的两个观测预算 $N_O=25$ 与 $N_O=49$ 分列这一量级两侧。$N_O\ge49$ 时使用间距不大于 $0.5\lambda$ 的规则采样网格；仅有 $N_O=25$ 时，规则采样间距达到 $0.75\lambda$ 会引起混叠，因此采用随机端口采样。

**图 7：** 在 20 dB、采样率约 8% 时，展示真实信道、所提方法估计及 OMP 估计的幅度图。OMP 存在明显结构性重建错误；流模型能够更好重现空间变化。这些空间结构偏差除了影响 NMSE，还可能直接误导后续端口选择。

### E. 分布失配条件下的鲁棒性

作者以 NLOS 训练集学习的模型直接处理 LOS 场景的测试信道，不做重训练；另外在相同网络、训练预算和超参数下使用 LOS 数据重新训练匹配模型，用于区分分布失配影响。**图 8** 在 $N_O=121$ 下比较两种流模型及匹配/失配 LMMSE 和传统方法。

在中等 SNR 以上，NLOS 训练得到的失配流模型仍优于所有所比较基线；在很低 SNR 下，传统方法可以更好。值得注意的是，该失配流模型在中高 SNR 甚至优于 LOS 重训练版本。作者把此现象归因于 NLOS 数据包含更多样的多径空间结构，而 LOS 强主径导致训练中的结构变化较少。同时，匹配 LOS 协方差的 LMMSE 始终优于失配协方差 LMMSE，支持测试设置合理。这一经验结论只针对所选的两种场景，不能推广为“分布失配总是有利”。

### F. 估计信道下的最小可达速率

**图 9** 比较实际部署的最差用户可达速率：各方法根据其**估计信道**选端口并计算 MMSE 合并器，再在**真实信道**上评价 SINR 和实际速率。因此，端口选择错误及合并器失配均会影响最终指标，而不仅仅是估计误差。

五组方案依次为：（1）所提阶段 I 估计 + 随机选 4 个端口；（2）OMP 估计 + AO 端口优化；（3）所提阶段 I 估计 + AO；（4）完整两阶段框架：$C=16$ 个候选、$T'=100$ 个离散逆采样步、$S=4$ 个后验样本、最多 $N_r=5$ 轮局部改进；（5）所提阶段 I 后验均值估计 + 穷举最大化**点估计效用**的端口选择，作为传统单点估计级联管线的理论参考。

完整两阶段方法在所测试 SNR 上优于其余实用方法。通过 OMP+AO 对比阶段 I+AO，可以隔离信道估计的作用；通过阶段 I+AO 对比完整两阶段方法，可以隔离端口选择的作用。高 SNR 时后者增益更明显，因为估计更可靠后，端口候选排序更可信，而 AO 局部搜索仍可能受局部最优限制。完整方案取得了基于后验均值估计穷举搜索的实际部署速率的 90% 以上。

论文注明：在 $N=625,M=4$ 时，需要比较的组合数约为 $6.3\times10^9$，即使数据中心 GPU 亦需约十秒量级，因此该穷举只能作为离线评价参考，不适于一般在线端口选择。

### G. 复杂度比较

**表 I：信道估计阶段计算复杂度。**

| 方法 | 复杂度 |
|---|---|
| OMP | $O(KI_{\rm OMP}\delta NG^2)$ |
| SBL | $O(KI_{\rm SBL}(\delta^2N^2G^2+\delta^3N^3))$ |
| LMMSE | $O(K(\delta^3N^3+\delta N^2))$ |
| 所提方法 | $O(S\,\mathrm{NFE}\,N(KD_{\max}^2+N_{\rm iter}\delta K^2))$ |

**表 II：端口选择阶段计算复杂度。**

| 方法 | 复杂度 |
|---|---|
| AO | $O(I_{\rm AO}M(N-M)(M^3+M^2K))$ |
| 所提方法 | $O(CT'ND_{\max}^2+S\bigl(C+N_rM(N-M)\bigr)(M^3+M^2K))$ |

其中 $I_{\rm OMP},I_{\rm SBL},I_{\rm AO}$ 为对应算法的迭代次数，$G$ 为角度字典每维网格数。提出的方法估计阶段对 $N$ 呈线性扩展，避免 SBL、LMMSE 等方法中部分大矩阵逆的立方开销；选择阶段也无需在线遍历 $\binom NM$ 个组合。文中所测试配置的主要耗时来自 $C T'$ 次离散扩散网络前向；理论 FLOPs 不等同于已测墙钟运行时间。

## VI. 结论

论文提出统一的两阶段扩散框架，以共同的最大后验期望效用准则联系多用户 MIMO-FAS 中的信道估计和端口选择。第一阶段使用流匹配信道先验与测量引导近似采样后验；第二阶段通过离散扩散生成端口候选集合，再使用所有后验信道样本的经验期望效用完成决策与局部改进。仿真表明，该方法在高度欠采样的导频下仍可获得较准确的 CSI，并以可行的在线计算成本获得相应穷举点估计基准 90% 以上的实际速率。

作者最后指出，所学习的先验依赖训练信道分布。首先，模型与训练时的端口间距绑定，部署到其他尤其更粗的端口间距时可能需要重训练；分辨率不变的估计器仍是未来工作。其次，训练信道只描述传播，没有纳入密集端口之间的互耦等硬件效应。理论上，这些效应在端口空间作用于信道的线性变换，可以通过在电磁仿真或测量数据上重新训练先验学习，但本文尚未提供相应验证。

## 参考文献、图表和校对说明

文末的原始参考文献见所附 arXiv v2 原文第 15–16 页。图 1–9、算法 1–4、表 I–II 的编号及所报告结果按 PDF 对应位置整理。文献条目、图内刻度、式 (46) 的完整矩阵概率表达以及网页公式最终排版尚需与原版逐条核查；**本译稿仍不应标注为已验收全文**。

{% endraw %}
