---
layout: page
title: "基于扩散模型的大规模 MIMO 联合信道估计与数据检测｜中文全文译文"
permalink: /papers/translations/2026-10-03-2311-10311-joint-channel-estimation-and-data-detection-in-massive-mimo-systems-ba/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a6fc510f0b68458b/) · [原文 arXiv](https://arxiv.org/abs/2311.10311) · [全部目录](/papers/catalog/)

# 基于扩散模型的大规模 MIMO 联合信道估计与数据检测

**原题：** Joint Channel Estimation and Data Detection in Massive MIMO Systems Based on Diffusion Models  
**作者：** Nicolas Zilberstein、Ananthram Swami、Santiago Segarra  
**单位：** Nicolas Zilberstein 与 Santiago Segarra 就职于 Rice University（美国）；Ananthram Swami 就职于 DEVCOM 陆军研究实验室（DEVCOM Army Research Laboratory，美国）。  
**版本：** arXiv:2311.10311v1（eess.SP），2023 年 11 月 17 日，原文 5 页（会议论文格式，末页为参考文献）。  
**资助说明：** 本研究由美国陆军研究办公室（Army Research Office）资助，合作项目编号 W911NF-19-2-0269。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1–5 节及全部小节、问题 1 与算法 1、式 (1)–(14)、图 1 图注、参考文献 [1]–[31]（英文原条目）均按原文结构录入；原文无表格、无附录、无致谢段（资助信息以页首脚注形式给出）。逐句逐式终校未做。

## 摘要

本文提出一种面向大规模多输入多输出（massive multiple-input multiple-output，MIMO）系统的、基于扩散模型的联合信道估计与数据检测算法。所提方法通过从符号与信道的联合后验分布中采样并计算近似最大后验（maximum a posteriori，MAP）估计，来求解该盲逆问题。为此，我们构造一个对"给定含噪观测时信道与符号的联合分布"建模的扩散过程，再运行逆过程生成样本。该算法的一项独特贡献是：同时纳入符号的离散先验分布与信道的**学习先验**——这一点至关重要，因为它能够更高效地探索联合搜索空间，从而改善采样过程。数值实验表明，相比对比方法，本方法取得更低的归一化均方误差（normalized mean squared error，NMSE），并降低了导频开销。

**关键词：** 联合信道估计与数据检测、基于分数的生成模型、Langevin 扩散、盲逆问题。

## 1. 引言

大规模多输入多输出（MIMO）系统对推动无线通信发展至关重要 [1]。这类系统在基站配备大量天线，可同时服务多个用户。尽管其对演进到 6G 蜂窝网络十分关键 [2]，MIMO 系统仍面临实现低复杂度检测与精确信道估计等挑战。本文聚焦这些物理层问题。

精确 MIMO 检测是 NP 难问题 [3]。当系统含 \(N_u\) 个用户、采用 \(\kappa\) 阶调制时，最大似然估计器的译码复杂度为指数级 \(\mathcal O(\kappa^{N_u})\)，对规模可观的系统不可行。此外，它依赖完美信道状态信息（channel state information，CSI），而后者通常不可得。因此，高效的信道估计方法至关重要；但在大规模 MIMO 中，由于系统维度高且导频数量受限 [4]，这颇具挑战。 Consequently，需要一种**联合优化**方法（同样 NP 难）同时估计数据与信道，以应对高维系统中的这些问题 [5, 6]。针对单输入多输出系统，已有多种基于梯度下降的近似解被提出 [7]。近来，针对大规模 MIMO 也出现了新方法：[8] 提出一种算法，迭代求解最大后验联合信道估计与数据检测（MAP-JED）问题的松弛版本，并利用信道的稀疏性；[9] 提出基于深度神经网络、更具体地说是算法展开（algorithmic unfolding）的解法。本文则引入一种基于扩散模型（也称基于分数的生成建模）的新方法。

扩散模型以其通用性著称，在多种应用中表现优异 [10]。这类模型把训练数据变换为白高斯噪声（前向过程），再运行逆变换（生成过程）生成新数据。凭借从未知概率分布生成高维数据的能力，扩散模型在图像处理中的去噪、修补等领域已达到领先水平 [11, 12]。在无线技术中，扩散模型已被用于推导基于 Langevin 扩散的大规模 MIMO 检测器 [13, 14] 以及信道估计 [15]，二者都取得了显著效果。然而，这些方法是为**已知前向算子**的问题量身定制的，可能不适用于算子未知的盲逆问题。近期图像处理领域的进展旨在应对这一挑战 [16, 17]，以提供更全面的解法。

受上述结果启发，本文提出一个基于分数生成建模的框架，用于求解大规模 MIMO 联合信道估计与数据检测问题。为此，我们构造对"给定含噪观测时信道与符号的联合分布"建模的扩散过程，然后运行逆扩散过程对其采样。所提方法允许我们纳入各变量的先验信息，以增强采样过程。

**贡献。** 本文贡献有二：1) 提出一种基于扩散模型的联合大规模 MIMO 检测与信道估计问题求解算法，可同时纳入符号的离散先验与信道的学习先验；2) 通过数值实验分析本方法在不同超参数设置下的行为，并证明联合求解相比"先信道估计、再数据检测"的分离方案有性能增益。

## 2. 系统模型与问题表述

我们关注大规模 MIMO 通信系统的上行链路，考虑 \(N_u\) 个单天线发射机（用户设备，UE）向配备 \(N_r\) 根天线的接收基站发送导频与数据，处于相干时间为 \(K=P+D\) 个时隙的块衰落场景：其中 \(P\) 个时隙用于导频，\(D\) 个时隙用于载荷数据。该场景下 MIMO 系统的前向模型定义为

$$
\mathbf Y=\mathbf H\mathbf X+\mathbf Z,\tag{1}
$$

其中 \(\mathbf H\in\mathbb C^{N_r\times N_u}\) 为信道矩阵，各列 \(\{[\mathbf Z]_{:j}\}_{j=1}^{K}\sim\mathcal{CN}(\mathbf 0,\sigma_0^2\mathbf I_{N_r})\) 为复循环高斯噪声向量，\(\mathbf X=[\mathbf X_P,\mathbf X_D]\in\mathcal X^{N_u\times K}\) 为发射数据矩阵，其中 \(\mathbf X_P\in\mathcal X^{N_u\times P}\) 对应导频、\(\mathbf X_D\in\mathcal X^{N_u\times D}\) 为数据，\(\mathcal X\) 为有限星座点集合，\(\mathbf Y\in\mathbb C^{N_r\times K}\) 为接收矩阵。全文考虑正交幅度调制（QAM），符号归一化为单位平均功率；所有用户采用相同调制，每个符号被 \(N_u\) 个用户中任一个选取的概率相同。此外，假设 \(\mathbf H\) 未知，而 \(\sigma_0^2\) 在接收端已知。在此配置下，联合信道估计与数据检测问题可表述如下。

**问题 1** 给定服从式 (1) 的观测 \(\mathbf Y\) 与导频 \(\mathbf X_P\)，求 \(\mathbf X_D\) 与 \(\mathbf H\) 的 MAP 估计。

由于式 (1) 中的 \(\mathbf Z\) 是随机变量，求解问题 1 的自然方式是寻找使给定含噪观测 \(\mathbf Y\) 与导频 \(\mathbf X_P\) 时后验概率最大的 \(\{\mathbf H,\mathbf X_D\}\)。于是 Bayes 最优判决规则可写为

$$
\begin{aligned}
\{\widehat{\mathbf H}_{\rm MAP},\widehat{\mathbf X}_{D{\rm MAP}}\}&=\arg\max_{\substack{\mathbf X_D\in\mathcal X^{N_u\times D},\\\mathbf H\in\mathbb C^{N_r\times N_u}}}p(\mathbf X_D,\mathbf H|\mathbf Y,\mathbf X_P)\\
&=\arg\max_{\substack{\mathbf X_D\in\mathcal X^{N_u\times D},\\\mathbf H\in\mathbb C^{N_r\times N_u}}}p_{\mathbf Z}(\mathbf Y-\mathbf H\mathbf X)p(\mathbf X)p(\mathbf H).
\end{aligned}\tag{2}
$$

式 (2) 中的问题即 MAP-JED。由于假设符号先验在星座点之间均匀、且测量噪声 \(\mathbf Z\) 为高斯，MAP-JED 表述可归结为如下优化问题：

$$
\{\widehat{\mathbf H}_{\rm MAP},\widehat{\mathbf X}_{D{\rm MAP}}\}=\arg\min_{\substack{\mathbf X_D\in\mathcal X^{N_u\times D},\\\mathbf H\in\mathbb C^{N_r\times N_u}}}\|\mathbf Y-\mathbf H\mathbf X\|_2^2-\log p(\mathbf H),\tag{3}
$$

该问题因有限星座约束 \(\mathbf X_D\in\mathcal X^{N_u}\) 的离散性以及判决变量之间乘积的非凸性而 NP 难。因此，过去几十年提出了多种方案以给出问题 1 的高效近似解（如第 1 节所述）。本文提出利用**退火 Langevin 动力学**从式 (2) 的后验分布中（近似）采样来求解问题 1。

## 3. 基于 Langevin 动力学的联合信道估计与数据检测

第 3.1 节简要介绍 Langevin 扩散与基于分数的生成建模；第 3.2 节描述基于 Langevin 动力学的联合后验采样算法，并详述扩散过程中涉及的分数函数表达式。

### 3.1 Langevin 扩散与后验采样

一般地，扩散过程是变量 \(\mathbf X\in\mathbb R^d\) 上的连续时间 Markov 过程，满足 Itô 方程

$$
{\rm d}\mathbf X_t=\mathbf f(\mathbf X_t,t)\,{\rm d}t+g(t)\,{\rm d}\mathbf W_t,\tag{4}
$$

其中 \(\mathbf W\) 为标准 \(d\) 维 Brown 运动，\(\mathbf f(\mathbf X_t,t)\) 与 \(g(t)\) 分别为漂移项与扩散项，假设对所有 \(t\) 均 Lipschitz 连续。Langevin 扩散是扩散过程的一种特例，当 \(\mathbf f(\mathbf X_t,t)=\nabla_{\mathbf X_t}\log p(\mathbf X_t)\)、\(g(t)=\sqrt{2\tau}\) 时得到 [18]。在温和条件下可以证明，该连续时间过程的不变分布为 \(\pi(\mathbf X)\propto p(\mathbf X)^{1/\tau}\) [18]；特别地，若 \(\tau=1\)，则 \(\pi(\mathbf X)\propto p(\mathbf X)\)。

对式 (4) 做 Euler–Maruyama 离散化即得到非调整 Langevin 算法（unadjusted Langevin algorithm，ULA），它是一种 MCMC 算法 [19]，由如下离散递推描述：

$$
\mathbf X_{k+1}=\mathbf X_k+\epsilon\nabla_{\mathbf X_k}\log p(\mathbf X_k)+\sqrt{2\epsilon\tau}\,\mathbf Z_k,\tag{5}
$$

其中 \(\mathbf Z_k\sim\mathcal N(\mathbf 0,\mathbf I)\)。本质上，ULA 通过沿目标密度对数梯度（称为分数函数）方向迭代移动、并加入噪声以避免陷入局部极大，从而从目标分布 \(p(\mathbf X)\) 生成样本。在一定正则条件下，当 \(\epsilon\to0\)、\(k\to\infty\) 时 \(\mathbf X_k\) 的分布收敛到 \(p(\mathbf X)\)；尽管该结果是渐近的，在目标分布的某些条件下也已得到非渐近收敛结果 [20]。

**基于分数的生成建模。** 需要注意，用该过程从 \(p(\mathbf X)\) 采样的唯一要求是已知分数函数，而它一般是未知的。因此我们采用去噪分数匹配（denoising score matching）[21]，通过训练一个参数化分数的神经网络（称为分数网络）来估计分数。简而言之，方法如下：给定从分布 \(p(\mathbf X)\) 抽取的训练数据集 \(\{\mathbf X_i\}_{i=1}^{n}\)，先用方差为 \(\{\sigma_l\}_{l=1}^{L}\) 的高斯核在不同尺度 \(l\) 上扰动数据；该扰动定义分布 \(q_{\sigma_l}(\widetilde{\mathbf X})\)，其中 \(\widetilde{\mathbf X}\) 为扰动后数据。最后，[22] 的作者提出通过分数匹配估计联合分数网络 \(\mathbf s_\theta(\mathbf X,\sigma)\)，即最小化如下损失：

$$
\mathcal L(\theta)=\frac1{2L}\sum_{l=1}^{L}\lambda(\sigma_l)\mathbb E_{p(\mathbf X)q_{\sigma_l}(\widetilde{\mathbf X}|\mathbf X)}\left[\left\|\mathbf s_\theta(\widetilde{\mathbf X},\sigma_l)+\frac{\widetilde{\mathbf X}-\mathbf X}{\sigma_l^2}\right\|_2^2\right],\tag{6}
$$

其中 \(\lambda(\sigma_l)\) 为依赖 \(\sigma_l\) 的预定义权重。训练完成后，即可用 \(\mathbf s_\theta(\mathbf X,\sigma)\) 替换式 (5) 中的 \(\nabla_{\mathbf X_k}\log p(\mathbf X_k)\)，从目标分布 \(p(\mathbf X)\) 生成样本。第 3.2 节将利用这一点，对信道分布使用预训练分数网络。

### 3.2 联合扩散后验采样

回顾目标：通过 ULA（式 (5)）从联合后验（式 (2)）采样来求解问题 1。因此我们必须对 3.1 节框架作若干调整。首先，我们感兴趣的是从联合后验 \(p(\mathbf X_D,\mathbf H|\mathbf Y,\mathbf X_P)\) 采样，而非仅从 \(p(\mathbf X)\) 采样。这需要计算联合后验的分数，具体为关于 \(\mathbf X_D\) 与 \(\mathbf H\) 的梯度：

$$
\begin{aligned}
\nabla_{\mathbf X_D}\log p(\mathbf X_D,\mathbf H|\mathbf Y,\mathbf X_P)&=\nabla_{\mathbf X_D}\log p(\mathbf Y|\mathbf H,\mathbf X)+\nabla_{\mathbf X_D}\log p(\mathbf X_D),\\
\nabla_{\mathbf H}\log p(\mathbf X_D,\mathbf H|\mathbf Y,\mathbf X_P)&=\nabla_{\mathbf H}\log p(\mathbf Y|\mathbf H,\mathbf X)+\nabla_{\mathbf H}\log p(\mathbf H),
\end{aligned}\tag{7}
$$

其中 \(\nabla_{\mathbf X_D}\log p(\mathbf Y,\mathbf X_P|\mathbf H,\mathbf X_D)\) 与 \(\nabla_{\mathbf X_D}\log p(\mathbf X_D)\) 分别是似然与先验关于 \(\mathbf X_D\) 的分数函数，\(\nabla_{\mathbf H}\log p(\mathbf Y,\mathbf X_P|\mathbf H,\mathbf X_D)\) 与 \(\nabla_{\mathbf H}\log p(\mathbf H)\) 则是关于 \(\mathbf H\) 的分数。其次，由于 \(\mathbf X_D\) 的离散性，计算其先验梯度颇具挑战。为此我们提出一种**退火过程**，构造 \(\mathbf X_D\) 的连续近似：定义噪声水平序列 \(\{\sigma_{l,X}\}_{l=1}^{L}\) 取值递减、使 \(\sigma_{L,X}\approx0\)；于是在每一水平上引入真符号 \(\mathbf X_D\) 的扰动版本

$$
\widetilde{\mathbf X}_{D,l}=\mathbf X_D+\mathbf N_{X,l},\tag{8}
$$

其中 \(\mathbf N_{X,l}\sim\mathcal{CN}(\mathbf 0,\sigma_{l,X}^2\mathbf I)\)。因此我们用扰动符号集 \(\widetilde{\mathbf X}_D\) 替代真实变量 \(\mathbf X_D\)，从而可定义连续的先验分数。随着噪声水平下降，\(\widetilde{\mathbf X}_D\) 逐步收敛到 \(\mathbf X_D\)。尽管这与 3.1 节的思想相似，最终目标却不同：我们意在构造离散变量 \(\widetilde{\mathbf X}_D\) 的连续近似。此外，由于 \(\mathbf H\) 的分数没有闭式表达，我们采用分数网络参数化并通过去噪分数匹配训练，如 3.1 节所述。

概括而言，算法步骤如下：随机初始化 \(\widetilde{\mathbf X}_{D,0}\) 与 \(\widetilde{\mathbf H}_0\)；随后沿扰动变量联合后验密度的分数函数运行，从较大的 \(\sigma_{1,X}\) 与 \(\sigma_{1,H}\) 出发逐步降至 \(\sigma_{L,X}\approx\sigma_{L,H}\approx0\)。在较早的噪声水平，似然项引导动力学走向主要由测量驱动的估计；在较晚的噪声水平，先验对估计进行精修（详见 [13]）。退火有三方面好处：可用分数匹配训练分数网络、增强动力学混合、以及实现离散变量到连续变量的近似。因此我们对 \(\mathbf H\) 与 \(\mathbf X_D\) 都施加退火：前者利用前两项好处，后者利用后两项好处。在此基础上，下面详述式 (7) 中的各项并给出逐步算法描述。

**分数函数。** 分数函数是相对于扰动变量计算的。因此，我们用于运行式 (5) 中动力学的模型由如下联合后验分布描述：

$$
p(\widetilde{\mathbf X}_{D,l},\widetilde{\mathbf H}_l|\mathbf Y,\mathbf X_P)\propto p(\mathbf Y,\mathbf X_P|\widetilde{\mathbf X}_{D,l},\widetilde{\mathbf H}_l)p(\widetilde{\mathbf X}_{D,l})p(\widetilde{\mathbf H}_l).\tag{9}
$$

于是需计算式 (7) 中的四个分数函数：两个对应似然项的分数，两个对应先验的分数。

**i) \(\widetilde{\mathbf X}_{D,l}\) 似然项的分数。** 在新模型（式 (9)）下，\(\widetilde{\mathbf X}_{D,l}\) 的似然项分数由 \(p(\mathbf Y|\widetilde{\mathbf X}_l,\widetilde{\mathbf H}_l,\mathbf X_P)=p(\mathbf Z-\widetilde{\mathbf H}_l\mathbf N_{X,l}|\widetilde{\mathbf X}_{D,l})\) 给出，而它并非高斯：虽然 \(p(\mathbf N_{X,l})\) 是高斯分布，但在给定扰动变量后，条件分布 \(p(\mathbf N_{X,l}|\widetilde{\mathbf X}_{D,l})\) 不再高斯。为回避该困难，我们采用如下近似。首先注意，当 \(\sigma_{l,X}\) 较小时，

$$
\nabla_{\widetilde{\mathbf X}_D}\log p(\mathbf Y|\widetilde{\mathbf X}_{D,l},\widetilde{\mathbf H}_l,\mathbf X_P)\approx\nabla_{\mathbf X_D}\log p(\mathbf Y_D|\mathbf X_D,\widetilde{\mathbf H}_l)=\frac{\widetilde{\mathbf H}_l^H(\mathbf Y_D-\widetilde{\mathbf H}_l\mathbf X_D)}{\sigma_0^2},
$$

其中 \(\widetilde{\mathbf H}_l^H\) 表示 \(\mathbf H\) 的共轭转置；该近似只在 \(\sigma_{l,X}\to0\) 时成立（注意 \(\sigma_{l,X}=0\) 时梯度无定义）。其次，由于该近似在 \(\sigma_{l,X}\) 较大时不成立，我们加入修正项如下：

$$
\nabla_{\widetilde{\mathbf X}_D}\log p(\mathbf Y|\widetilde{\mathbf X}_{D,l},\widetilde{\mathbf H}_l,\mathbf X_P)\approx\widetilde{\mathbf H}_l^H\left(\sigma_0^2\mathbf I+\sigma_{l,X}^2\widetilde{\mathbf H}_l^H\widetilde{\mathbf H}_l\right)^{-1}\left(\mathbf Y_D-\widetilde{\mathbf H}_l\widetilde{\mathbf X}_{D,l}\right).\tag{10}
$$

直观上，式 (10) 的近似假设退火噪声与测量噪声相互独立。尽管该近似带来的符号错误率（symbol error rate，SER）比 [13] 中引入的更差，但它是一个良好近似，可降低算法的计算负担。

**ii) \(\widetilde{\mathbf H}_l\) 似然项的分数。** 与式 (10) 的近似类似，我们把 \(\widetilde{\mathbf H}_l\) 的似然分数近似为

$$
\nabla_{\widetilde{\mathbf H}_l}\log p(\mathbf Y|\widetilde{\mathbf X}_{D,l},\widetilde{\mathbf H}_l,\mathbf X_P)\approx\frac{\left(\mathbf Y-\widetilde{\mathbf H}_l[\widetilde{\mathbf X}_{D,l},\mathbf X_P]\right)[\widetilde{\mathbf X}_{D,l},\mathbf X_P]^H}{\sigma_0^2+\sigma_{l,H}^2}.\tag{11}
$$

注意与式 (10) 中 \(\widetilde{\mathbf X}_D\) 的似然分数相比，该式同时考虑了导频与数据。

**iii) \(\widetilde{\mathbf X}_{D,l}\) 退火先验的分数。** 借助 Tweedie 恒等式 [23]，分数函数可与 MMSE 去噪器联系起来：

$$
\nabla_{\widetilde{\mathbf X}_{D,l}}\log p(\widetilde{\mathbf X}_{D,l})=\frac{\mathbb E_{\sigma_{l,X}}\left[\mathbf X_D|\widetilde{\mathbf X}_{D,l}\right]-\widetilde{\mathbf X}_{D,l}}{\sigma_{l,X}^2}.\tag{12}
$$

特别地，该条件期望可按元素计算为

$$
\mathbb E_{\sigma_{l,X}}\left[x_j|[\widetilde{\mathbf X}_{D,l}]_{j,p}\right]=\frac1Z\sum_{x_k\in\mathcal X}x_k\exp\left(-\frac{\left\|[\widetilde{\mathbf X}_{D,l}]_{j,p}-x_k\right\|^2}{2\sigma_{l,X}^2}\right),\tag{13}
$$

其中 \(Z=\sum_{x_k\in\mathcal X}\exp\left(-\frac{\left\|[\widetilde{\mathbf X}_{D,l}]_{j,p}-x_k\right\|^2}{2\sigma_{l,X}^2}\right)\)，且 \(j=1,\cdots,N_u\)。

**iv) \(\widetilde{\mathbf H}_l\) 退火先验的分数。** 最后，\(\widetilde{\mathbf H}_l\) 的先验分数由分数网络参数化，并用 3.1 节介绍的去噪分数匹配训练，即

$$
\nabla_{\widetilde{\mathbf H}_l}\log p(\widetilde{\mathbf H}_l)=\mathbf s_\theta(\widetilde{\mathbf H}_l,\sigma_{l,H}),\tag{14}
$$

其中网络 \(\mathbf s_\theta(\cdot)\) 通过最小化式 (6) 的损失函数训练。

**算法。** 通过从（近似）联合后验 \(p(\mathbf X_D,\mathbf H|\mathbf Y,\mathbf X_P)\) 采样生成估计 \(\widehat{\mathbf H}\) 与 \(\widehat{\mathbf X}_D\) 的算法见算法 1。从更新步骤可见，联合采样的主要优势在于把数据符号当作导频复用，这带来两点好处：其一，在保持给定系统性能的同时，可以用相同数据速率发送更多数据；其二，只要符号估计足够好，就能降低信道估计误差。因此，人们有望在较高 SNR 下观察到性能提升。最后，从实现角度看，超参数（噪声水平数与步长）的选取对算法稳定性至关重要。

**算法 1：用于 JED-MAP 的退火 Langevin 算法**

- 输入：\(T\)、\(L\)、\(\{\sigma_{l,X},\sigma_{l,H}\}_{l=1}^{L}\)、\(\epsilon_X\)、\(\epsilon_H\)、\(\sigma_0\)、\(\mathbf Y\)、\(\mathbf X_P\)、\(\tau_X\)、\(\tau_H\)。
- 随机初始化 \(\widetilde{\mathbf X}_{D_{t=0,l=1}}\) 与 \(\widetilde{\mathbf H}_{t=0,l=1}\)。
1. 对 \(l=1\) 到 \(L\) 执行
2. 计算 \(\epsilon_{l,X}=\epsilon_X\cdot\left(\frac{\sigma_{l,X}}{\sigma_{L,X}}\right)^2\)，\(\epsilon_{l,H}=\epsilon_H\cdot\left(\frac{\sigma_{l,H}}{\sigma_{L,H}}\right)^2\)。
3. 对 \(k=0\) 到 \(T-1\) 执行
4. 抽取 \(\mathbf Z_k\sim\mathcal N(\mathbf 0,\mathbf I)\)。
5. 按式 (10) 计算 \(\nabla_{\widetilde{\mathbf X}_{D_{k,l}}}\log p(\mathbf Y|\widetilde{\mathbf X}_{D_{k,l}},\widetilde{\mathbf H}_{k,l},\mathbf X_P)\)。
6. 按式 (12) 计算 \(\nabla_{\widetilde{\mathbf X}_{D_{k,l}}}\log p(\widetilde{\mathbf X}_{D_{k,l}})\)。
7. 按式 (7) 计算 \(\nabla_{\widetilde{\mathbf X}_{D_{k,l}}}\log p(\widetilde{\mathbf X}_{D_{k,l}},\widetilde{\mathbf H}_{k,l}|\mathbf Y,\mathbf X_P)\)。
8. \(\widetilde{\mathbf X}_{D_{k+1,l}}=\widetilde{\mathbf X}_{D_{k,l}}+\epsilon_{l,X}\nabla_{\widetilde{\mathbf X}_{D_{k,l}}}\log p(\widetilde{\mathbf X}_{D_{k,l}},\widetilde{\mathbf H}_{k,l}|\mathbf Y,\mathbf X_P)+\sqrt{2\epsilon_{l,X}\tau_X}\,\mathbf Z_k\)。
9. 按式 (11) 计算 \(\nabla_{\widetilde{\mathbf H}_{k,l}}\log p(\mathbf Y|\widetilde{\mathbf X}_{D_{k+1,l}},\widetilde{\mathbf H}_{k,l},\mathbf X_P)\)。
10. 按式 (14) 计算 \(\nabla_{\widetilde{\mathbf H}_l}\log p(\widetilde{\mathbf H}_l)\)。
11. 按式 (7) 计算 \(\nabla_{\widetilde{\mathbf H}_{k,l}}\log p(\widetilde{\mathbf X}_{D_{k+1,l}},\widetilde{\mathbf H}_{k,l}|\mathbf Y,\mathbf X_P)\)。
12. \(\widetilde{\mathbf H}_{k+1,l}=\widetilde{\mathbf H}_{k,l}+\epsilon_{l,H}\nabla_{\widetilde{\mathbf H}_{k,l}}\log p(\widetilde{\mathbf X}_{D_{k+1,l}},\widetilde{\mathbf H}_{k,l}|\mathbf Y,\mathbf X_P)+\sqrt{2\epsilon_{l,H}\tau_H}\,\mathbf Z_k\)。
13. 结束内层循环
14. 结束外层循环
15. 返回 \(\widehat{\mathbf X}_D=\widetilde{\mathbf X}_{D_{T,L}}\)，\(\widehat{\mathbf H}=\widetilde{\mathbf H}_{T,L}\)。

**计算复杂度。** 算法 1 的复杂度是各动力学复杂度之和。关于变量 \(\mathbf X_D\) 的动力学，其主要瓶颈是式 (10) 中的矩阵求逆，因此计算引导项与先验分数的复杂度为 \(\mathcal O(N_u^3+KN_u)\)；该方法复杂度的更深入分析见 [13]。对 \(\mathbf H\) 而言，更重的计算由分数网络承担，其计算复杂度分析见 [15]。

## 4. 数值实验

本节评估所提方法的性能（代码见脚注 1）。我们先介绍信道模型与仿真设置；第一个实验以固定导频数、变化符号数 \(\mathbf X_D\) 的方式考察信道估计误差随信噪比（signal-to-noise ratio，SNR）的变化，并与不复用符号作导频的情形比较；第二个实验在与实验一相同的设置下评估 SER 随 SNR 的变化；最后，我们在信道估计任务上与基线方法对比。

> **原文脚注 1：** 用于复现实验的代码见 https://github.com/nzilberstein/Langevin-joint-channel。

**信道模型与仿真设置。** 我们考虑一个可代表 3GPP 3D MIMO 信道模型的信道模型 [24]，按 QuaDRiGa 信道仿真器 [25] 实现。考虑基站配备 \(8\times8\) 半波长间距（\(N_r=64\)）、单极化天线阵列，高度 20 m；假设基站覆盖半径 500 m 的扇区，\(N_u=32\) 个单极化全向天线用户在覆盖区域内随机撒布，且用户为 NLOS、室内场景。载频 3.5 GHz，每个子载波带宽 100 MHz，子载波间隔 30 kHz。分数网络采用 [26] 提出的参数化，并最小化式 (6) 的损失。训练集含 7000 个信道，验证集含 2500 个信道；以 50 个矩阵为一批评估性能。导频为 \(P\) 个 QPSK 符号。算法 1 的参数取 \(L=2311\)、\(T=3\)、\(\epsilon_H=1\times10^{-10}\)、\(\tau_H=1\times10^{-3}\)、\([\sigma_{1,H},\sigma_{L,H}]=[30,0.001]\)；对关于 \(\mathbf X_D\) 的动力学，依 SNR 取两组不同取值：低 SNR（5 dB–15 dB）时取 \(\epsilon_X=1\times10^{-4}\)、\(\tau_X=0.5\)、\([\sigma_{1,X},\sigma_{L,X}]=[0.6,0.01]\)，其他 SNR 时取 \(\epsilon_X=4\times10^{-5}\)、\(\tau_X=0.1\)、\([\sigma_{1,X},\sigma_{L,X}]=[0.8,0.01]\)。最后，噪声方差 \(\sigma_0^2\) 随 SNR 水平改变。若受计算资源限制，可考虑采用高阶 Langevin 动力学来减小 \(L\)；信道采样情形的分析见 [27]。

> **原文疑点：** 原文给出的超参数为 "\(L=2311\)"（噪声水平数），与 \(T=3\) 的取值相比显得异常大，且该数字恰好与本文 arXiv 编号 2311 相同，疑为排版/笔误（例如可能应为 \(L=23\) 或 \(L=211\)）。本页按原文照录，未作改动。

**不同符号数下的 NMSE 性能。** 在第一个实验中，我们分析所提算法在不同 \(D\)（即复用为导频的符号数）下、固定 \(P=30\) 时的信道估计性能。对比如图 1a 所示，其中把 \(D=0\) 时的信道采样（[15] 提出）命名为 "single Langevin"。正如预期，随着用于导频复用的数据符号数增加，性能改善。值得注意的是，当 \(D>30\) 时，本方法在 SNR 高于 20 dB 时表现突出；当 \(D>50\) 时，本方法在所有 SNR 上都优于 single Langevin。总体而言，SNR 高于 20 dB 时优势明显。

**不同符号数下的 SER 性能。** 在与前相同的实验条件（\(P=30\)）下，我们考察 SER 随 SNR 的变化，并改变 \(D\)。结果如图 1b 所示。与信道估计误差中观察到的行为类似，SER 随 \(D\) 增大而改善。值得注意的是，当 \(D>30\) 时，所提算法在所有 SNR 上都优于 single Langevin 方法。这些结果表明：本算法 NMSE 性能的局限源于符号采样的性能——在高 SNR 场景下，\(\mathbf X_D\) 的精确估计带来精确的联合变量估计；而在较低 SNR 情形下，符号复用没有显著优势。

**与基线方法的性能比较。** 在第三个实验中，我们把所提算法与若干基线方法比较：LASSO [28]、fsAD [29]、L-MMSE [30]、L-DAMP [31] 以及仅使用导频的 Langevin 方法 [15]。所有基线算法取 \(P=30\)，本方法取 \(D=50\)。图 1c 的结果表明，本方法在所有 SNR 上都持续优于全部基线；尤其值得注意的是，当 SNR 高于 15 dB 时，本方法的性能比其他方法高出数个数量级。

## 5. 结论

我们提出一种基于扩散模型的、用于大规模 MIMO 联合信道估计与数据检测的算法。该方法利用逆过程生成样本以求解 MAP-JED 优化问题，并同时容纳离散与连续变量的先验。仿真表明，本方法在管理导频开销的同时优于基线方法。未来工作旨在探索精简的扩散模型、减少超参数并加速采样，同时提升低 SNR 场景下的性能。

## 6. 参考文献（英文原书目）

[1] Shaoshi Yang and Lajos Hanzo, “Fifty years of MIMO detection: The road to large-scale MIMOs,” IEEE Commun. Surveys Tut., vol. 17, no. 4, pp. 1941–1988, 2015.

[2] Khaled B. Letaief, Wei Chen, Yuanming Shi, Jun Zhang, and Ying-Jun Angela Zhang, “The roadmap to 6G: AI empowered wireless networks,” IEEE Commun. Mag., vol. 57, no. 8, pp. 84–90, 2019.

[3] Alberto Del Pia, Santanu S. Dey, and M. Molinaro, “Mixed-integer quadratic programming is in NP,” Mathematical Programming, vol. 162, pp. 225–240, 2017.

[4] Eren Balevi, Akash Doshi, Ajil Jalal, Alexandros Dimakis, and Jeffrey G Andrews, “High dimensional channel estimation using deep generative networks,” IEEE J. Sel. Areas Commun., vol. 39, no. 1, pp. 18–30, 2020.

[5] Haris Vikalo, Babak Hassibi, and Petre Stoica, “Efficient joint maximum-likelihood channel estimation and signal detection,” IEEE Trans. Wireless Commun., vol. 5, no. 7, pp. 1838–1845, 2006.

[6] Xuemei Yi and Caijun Zhong, “Deep learning for joint channel estimation and signal detection in OFDM systems,” IEEE Commun. Lett., vol. 24, no. 12, pp. 2780–2784, 2020.

[7] Oscar Castaneda, Tom Goldstein, and Christoph Studer, “VLSI designs for joint channel estimation and data detection in large SIMO wireless systems,” IEEE Trans. Circuits Syst. I Regul. Pap., vol. 65, no. 3, pp. 1120–1132, 2017.

[8] Haochuan Song, Tom Goldstein, Xiaohu You, Chuan Zhang, Olav Tirkkonen, and Christoph Studer, “Joint channel estimation and data detection in cell-free massive MU-MIMO systems,” IEEE Trans. Wireless Commun., vol. 21, no. 6, pp. 4068–4084, 2021.

[9] Haochuan Song, Xiaohu You, Chuan Zhang, and Christoph Studer, “Soft-output joint channel estimation and data detection using deep unfolding,” in IEEE Inf. Theory. Workshop. IEEE, 2021, pp. 1–5.

[10] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole, “Score-based generative modeling through stochastic differential equations,” in Intl. Conf. Learn. Repr. (ICLR), 2021.

[11] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song, “Denoising diffusion restoration models,” in Advances in Neural Inf. Process. Syst. (NeurIPS), 2022.

[12] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye, “Diffusion posterior sampling for general noisy inverse problems,” in Intl. Conf. Learn. Repr. (ICLR), 2023.

[13] Nicolas Zilberstein, Chris Dick, Rahman Doost-Mohammady, Ashutosh Sabharwal, and Santiago Segarra, “Annealed Langevin dynamics for massive MIMO detection,” IEEE Trans. Wireless Commun., vol. 22, no. 6, 2023 (Online Nov 2022).

[14] Nicolas Zilberstein, Chris Dick, Rahman Doost-Mohammady, Ashutosh Sabharwal, and Santiago Segarra, “Accelerated massive MIMO detector based on annealed underdamped Langevin dynamics,” in IEEE Intl. Conf. Acoust., Speech and Signal Process. (ICASSP), 2023.

[15] Marius Arvinte and Jonathan I. Tamir, “MIMO channel estimation using score-based generative models,” IEEE Trans. Wireless Commun., vol. 22, no. 6, 2023 (Online Nov 2022).

[16] Brett Levac, Ajil Jalal, and Jonathan I Tamir, “Accelerated motion correction for MRI using score-based generative models,” arXiv preprint arXiv:2211.00199, 2022.

[17] Hyungjin Chung, Jeongsol Kim, Sehui Kim, and Jong Chul Ye, “Parallel diffusion models of operator and image for blind inverse problems,” in IEEE Conf. Comp. Vision Pattern Recognit. (CVPR), June 2023, pp. 6059–6069.

[18] Grigorios A. Pavliotis, Stochastic Processes and Applications: Diffusion Processes, the Fokker–Planck and Langevin Equations, Springer, 2014.

[19] Gareth O. Roberts and Richard L. Tweedie, “Exponential convergence of Langevin distributions and their discrete approximations,” Bernoulli, vol. 2, pp. 341–363, 1996.

[20] Arnak S. Dalalyan and Avetik Karagulyan, “User-friendly guarantees for the Langevin Monte Carlo with inaccurate gradient,” Stoch. Process. Their Appl., vol. 129, no. 12, pp. 5278–5311, 2019.

[21] Pascal Vincent, “A connection between score matching and denoising autoencoders,” Neural Comput., vol. 23, no. 7, pp. 1661–1674, 2011.

[22] Yang Song and Stefano Ermon, “Generative modeling by estimating gradients of the data distribution,” in Advances in Neural Inf. Process. Syst. (NeurIPS), 2019, p. 11918–11930.

[23] Bradley Efron, “Tweedie's formula and selection bias,” Journal of the American Stat. Association, vol. 106, no. 496, pp. 1602–1614, 2011.

[24] 3GPP, “Study on 3-D channel model for LTE,” Tech. Rep. 36.873, 2015.

[25] Stephan Jaeckel, Leszek Raschkowski, Kai Börner, and Lars Thiele, “QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials,” IEEE Trans. Antennas Propag., vol. 62, no. 6, pp. 3242–3256, 2014.

[26] Yang Song and Stefano Ermon, “Improved techniques for training score-based generative models,” arXiv preprint arXiv:2006.09011, 2020.

[27] Nicolas Zilberstein, Ashutosh Sabharwal, and Santiago Segarra, “Solving linear inverse problems using higher-order annealed Langevin diffusion,” arXiv preprint arXiv:2305.05014, 2023.

[28] Kiran Venugopal, Ahmed Alkhateeb, Nuria González Prelcic, and Robert W. Heath, “Channel estimation for hybrid architecture-based wideband millimeter wave systems,” IEEE J. Sel. Areas Commun., vol. 35, no. 9, pp. 1996–2009, 2017.

[29] Badri Narayan Bhaskar, Gongguo Tang, and Benjamin Recht, “Atomic norm denoising with applications to line spectral estimation,” IEEE Trans. Signal Process., vol. 61, no. 23, pp. 5987–5999, 2013.

[30] Elina Nayebi and Bhaskar D Rao, “Semi-blind channel estimation for multiuser massive MIMO systems,” IEEE Trans. Signal Process., vol. 66, no. 2, pp. 540–553, 2017.

[31] Chris Metzler, Ali Mousavi, and Richard Baraniuk, “Learned D-AMP: Principled neural network based compressive image recovery,” Advances in Neural Inf. Process. Syst. (NeurIPS), vol. 30, 2017.

## 图注与表注

**图 1（原文 Fig. 1）：** 在 3GPP 信道模型下，所提方法性能随 SNR 的变化。(a)、(b) 分别为固定导频符号数 \(P=30\)、不同数据符号数 \(D=\{10,20,30,40,50,70,100\}\) 下的 NMSE 与 SER；(c) 与不同基线方法的比较，取 \(P=30\)、\(D=50\)。（三幅子图均为 SNR（dB）为横轴的曲线：NMSE（dB）与 SER 随 SNR 增大而下降；基线包括 Single Langevin、Lasso、fsAD、L-DAMP、LMMSE。）

> **表注：** 原文没有表格。

> **原文疑点汇总：** ① 第 3.2 节 i) 中原文写作 "with \(\widetilde{\mathbf H}_l^H\) denoting the conjugate transpose of \(\mathbf H\)"，按上下文应为 "of \(\widetilde{\mathbf H}_l\)"（共轭转置对象笔误）；本页按上下文译为"\(\widetilde{\mathbf H}_l^H\) 表示 \(\mathbf H\) 的共轭转置"对应原文措辞，并在此说明。② 第 4 节超参数 "\(L=2311\)" 与 \(T=3\) 不相称、且与 arXiv 编号巧合，疑为笔误（见正文注）。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 1–5 节全部正文与子节（含 3.1、3.2）、问题 1、式 (1)–(14)、算法 1（15 步完整流程）、图 1 图注（(a)(b)(c) 三幅子图）、参考文献 [1]–[31]（英文原条目、按原编号），以及页首资助脚注（以"资助说明"录入）。原文没有表格与附录，也没有独立的致谢段（资助信息为首页脚注，已录入）；末尾无作者简介页。公式 (1)–(14) 与算法 1 均按 PDF 渲染页（p2、p3、p4）逐式核对后转写；两处原文疑点已加注（式 (13) 前的共轭转置对象表述、超参数 \(L=2311\)）。逐句逐式终校未做；供后续 QA 重点核对：算法 1 中 \(\epsilon_{l,X},\epsilon_{l,H}\) 的缩放公式与两处更新式的噪声系数。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
