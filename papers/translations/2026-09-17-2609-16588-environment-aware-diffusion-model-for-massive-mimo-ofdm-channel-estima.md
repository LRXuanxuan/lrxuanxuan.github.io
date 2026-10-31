---
layout: page
title: "面向大规模 MIMO-OFDM 信道估计的环境感知扩散模型｜中文全文译文"
permalink: /papers/translations/2026-09-17-2609-16588-environment-aware-diffusion-model-for-massive-mimo-ofdm-channel-estima/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/09a99087c61f409b/) · [原文 arXiv](https://arxiv.org/abs/2609.16588) · [全部目录](/papers/catalog/)

# 面向大规模 MIMO-OFDM 信道估计的环境感知扩散模型

**原题：** Environment-Aware Diffusion Model for Massive MIMO-OFDM Channel Estimation  
**作者：** Wanchen Hu\*、Jie Yang\*、Yi Song†、Jun Xia‡、Shuangyang Li†、Yu Zhu\*、Giuseppe Caire†。单位：\* 复旦大学（上海，中国），邮箱 {huwc23@m., yangjie23@m., zhuyu@}fudan.edu.cn；† 柏林工业大学（Technische Universität Berlin，德国），邮箱 {yi.song, shuangyang.li, caire}@tu-berlin.de；‡ 香港科技大学（广州），邮箱 junxia@hkust-gz.edu.cn。原文标注 **（Invited paper，邀稿论文）**；作者单位原词拼写为 "Technische Universitat"，按原文照录。  
**版本：** arXiv:2609.16588v1（eess.SP），v1 日期 2026 年 9 月 15 日；原文 6 页（IEEE 会议论文格式）。本页对应论文库 2026-09-17 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—V 节、图 1—4 图注、算法 1、式（1）—（16）、参考文献 [1]—[18]（英文原条目）、基金资助脚注。原文全文无编号表格（仅图 1—4），故本页无表格可转录；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与记号）：** 原文缩写在本页首次出现时保留英文：CSI（channel state information，信道状态信息）、MIMO（多输入多输出）、OFDM（正交频分复用）、DM/EA-DM（diffusion model / environment-aware diffusion model，扩散模型/环境感知扩散模型）、CKM（channel knowledge map，信道知识地图）、DiT（Diffusion Transformer）、MAP（maximum a posteriori，最大后验）、NMSE（normalized mean squared error，归一化均方误差）、LS/LMMSE（最小二乘/线性最小均方误差）、UPA（uniform plane array，均匀平面阵列）。记号：粗体大写（小写）字母表示矩阵（列向量），$\mathbb C^{M\times N}$、$\mathbb R^{M\times N}$ 表示复/实矩阵集合，$(\cdot)^T$、$(\cdot)^H$ 分别为转置与共轭转置，$I_N$ 为 $N\times N$ 单位阵，$\otimes$ 为 Kronecker 积，$\|\cdot\|_2$ 为 2 范数，$\mathcal N(x;a,\Sigma)$ 表示均值 $a$、协方差 $\Sigma$ 的高斯密度。原文脚注 1 说明：本文虽采用二维坐标 $(x,y)$，框架可容易扩展到三维坐标 $(x,y,z)$，只改变条件变量的维数，不影响所提算法或网络架构。

## 摘要

本文提出一种用于大规模多输入多输出正交频分复用（MIMO-OFDM）系统的、基于环境感知扩散的信道估计方法。大规模 MIMO 信道的高维性与有限的导频资源使精确估计充满挑战。为解决该问题，我们利用无线信道的空间变异性，训练一个扩散模型来学习以位置为条件的信道状态信息分布，从而为信道估计提供环境感知先验。基于该学习到的先验，我们提出一种后验推断算法，把导频观测融入反向扩散过程，通过将接收信号似然与学习到的信道先验相结合，实现贝叶斯信道估计。通过联合利用位置信息与测量数据，所提方法在有限导频资源下提升了估计精度。基于射线追踪信道数据集的仿真结果表明，所提方法在各种信噪比与导频配置下都持续优于传统估计器与现有基于学习的方法。

**关键词：** MIMO；环境感知信道估计；深度学习；扩散模型。

## I. 引言

第六代（6G）无线网络的出现对准确的信道状态信息（CSI）提出了巨大需求，而 CSI 是实现超高数据速率、海量连接与超可靠通信的基础 [1]。然而随着无线系统向大规模天线阵列与更复杂传播环境演进，获取准确 CSI 变得越来越困难 [2]。具体地，信道估计所需的导频开销随天线数迅速增长，使导频资源在大规模 MIMO 系统中日益不足。另一方面，真实环境中复杂的传播条件使得用传统解析模型准确刻画无线信道的统计特性变得困难 [3]。在采用正交频分复用（OFDM）的大规模 MIMO 系统中，宽带信道在多个子载波上被观测，并在空间与频率两个域上表现出结构化相关 [4]。这些相关源于同一组在角度与延迟上具有有限支撑的底层多径分量。由于实际环境中多径参数未知且随机，所得信道分布成为统计特性复杂的高维非高斯随机变量，使准确的先验建模充满挑战。

在实际传播环境中，无线信道与周围物理环境（包括建筑几何、散射体）强耦合，因而随用户位置变化。已有研究表明，纳入先验环境信息可以在降低训练开销的同时有效提升系统性能 [5]、[6]。例如，信道知识地图（CKM）把用户位置映射到信道知识，已被应用于码本设计 [7] 与资源分配 [8] 等许多场景。CKM 提供了有用的表示框架，但如何有效利用这类依赖位置的信道信息实现高精度信道估计仍然充满挑战，尤其因为无线信道的分布复杂。

为应对该挑战，需要能够学习复杂信道分布的强大数据驱动模型。近年来，生成模型已成为建模高维数据分布的有效工具 [9]。其中，扩散模型（DM）由于强大的分布建模能力以及相比生成对抗网络（GAN）与变分自编码器（VAE）更稳定的训练行为而受到广泛关注 [10]。通过用高斯噪声逐步腐蚀数据并学习相应的反向去噪过程，扩散模型能有效捕捉复杂数据分布。最近，扩散模型已被作为生成先验应用于无线信道估计 [11]、[12]，展示了可观的潜力。然而现有研究通常假设与环境无关的全局先验分布，忽略了随空间变化的信道统计。

本文利用无线信道的空间变异性，提出一种用于 MIMO-OFDM 信道估计的**环境感知扩散模型（EA-DM）**。我们首先分析固定环境下信道统计的空间变异性，并表明信道特征在不同用户位置之间变化显著。为有效捕捉这种复杂信道分布，我们构建一个基于 Diffusion Transformer（DiT）架构的扩散式信道估计框架。所提模型学习依赖位置的信道先验，并把它们融入反向扩散过程，以引导从有限导频观测中重建信道。数值结果表明，与依赖位置无关信道先验的传统方法相比，所提方法取得更高的估计精度，凸显了把环境感知信道先验纳入信道估计的益处。

**记号：** 粗体大写（小写）字母表示矩阵，如 $\mathbf A$（列向量，如 $\mathbf a$），斜体字母表示标量，如 $a$。$\mathbb C^{M\times N}$（$\mathbb C^M$）与 $\mathbb R^{M\times N}$（$\mathbb R^M$）分别表示 $M\times N$（$M\times1$）复矩阵（向量）与实矩阵（向量）的集合。$(\cdot)^T$ 与 $(\cdot)^H$ 分别表示转置与共轭转置。$I_N$ 表示 $N\times N$ 单位阵。$\otimes$ 表示 Kronecker 积。$\|\cdot\|_2$ 表示 2 范数。$\mathcal N(\mathbf x;\mathbf a,\Sigma)$ 表示 $\mathbf x$ 的均值 $\mathbf a$、协方差 $\Sigma$ 的高斯密度。

> **基金资助（原文脚注）：** 本工作部分由国家自然科学基金（Grant No. 62471145）与上海市自然科学基金（Grant No. 23ZR1407300）资助。Jun Xia 的工作由国家自然科学基金项目（No. 623B2086）、CCF-GHFund（No. OF 2026005）、CIPS-SMP-智谱大模型基金、蚂蚁集团与中国电信 TeleAI 资助。Shuangyang Li 的工作部分由欧洲研究理事会（ERC）ERC Starting Grant「Foundations of Delay Doppler Communications and Sensing (FUN-DOCS)」（Grant 101220383）资助。Giuseppe Caire 的工作由德国科学基金会（DFG）Gottfried Wilhelm Leibniz-Preis 2021 资助。

## II. 系统模型与扩散预备知识

### A. 系统模型与问题表述

我们考虑具有 $N_f$ 个子载波的上行大规模 MIMO-OFDM 系统。基站（BS）配备 $M_r$ 个天线单元，用户配备 $M_t$ 个天线单元。在第 $k$ 个子载波上，BS 处的接收信号为

$$
\mathbf Y_k=\mathbf H_k\mathbf X_k+\mathbf Z_k,\qquad k=1,\dots,N_f,\tag{1}
$$

其中 $\mathbf X_k\in\mathbb C^{M_t\times P}$ 是长度为 $P$ 的发射导频符号，$\mathbf z_k\sim\mathcal{CN}\left(\mathbf 0,\sigma_z^2\mathbf I_{M_r}\right)$ 是循环对称复高斯噪声。记 $M_t$ 点与 $M_r$ 点 DFT 矩阵分别为 $\mathbf F_t\in\mathbb C^{M_t\times M_t}$ 与 $\mathbf F_r\in\mathbb C^{M_r\times M_r}$。$\mathbf H_k$ 的角度域表示为

$$
\mathbf H_k=\mathbf F_r\mathbf H_k^a\mathbf F_t^T,\tag{2}
$$

其中 $\mathbf H_k^a$ 为角度域信道。于是（1）的向量化形式为

$$
\mathbf y_k=\mathbf M_k\mathbf h_k+\mathbf z_k,\qquad k=1,\dots,N_f,\tag{3}
$$

其中 $\mathbf M_k=\left(\mathbf X_k^T\mathbf F_t\otimes\mathbf F_r\right)\in\mathbb C^{M_rP\times M_rM_t}$，$\mathbf y_k=\mathrm{vec}(\mathbf Y_k)$，$\mathbf h_k=\mathrm{vec}(\mathbf H_k^a)$，$\mathbf z_k=\mathrm{vec}(\mathbf Z_k)$。不同子载波上的信道矩阵源于同一组物理传播路径，因此角度域信道呈现具有公共角度支撑的稀疏结构。在下文推导中我们聚焦一个一般子载波，并省略子载波索引以简化记号。

基于系统模型（3），可以从贝叶斯角度表述信道估计问题：

$$
\hat{\mathbf h}=\arg\max_{\mathbf h}p(\mathbf h|\mathbf y)=\arg\max_{\mathbf h}p(\mathbf y|\mathbf h)p(\mathbf h).\tag{4}
$$

实践中，最大后验（MAP）估计器的性能关键取决于先验分布 $p(\mathbf h)$ 的准确性，尤其在低信噪比（SNR）或导频有限、似然项不足以可靠恢复信道的场景中更是如此。在这类情形下，先验在正则化解中起主导作用。因此，准确刻画信道先验对实现可靠信道估计至关重要。

### B. 条件扩散模型预备知识

扩散模型通过用高斯噪声逐步扰动数据并学习逆转该腐蚀过程来构造生成过程。令 $\mathbf h_0$ 表示代表信道实现的干净数据样本。在条件扩散模型中，生成过程由与 $\mathbf h_0$ 统计相关的辅助变量 $\mathbf c$ 引导。本文中条件变量对应用户位置信息，记为 $\mathbf c=\mathrm{Loc}$，它提供关于信道分布的先验信息。导频观测 $\mathbf y$ 将在之后的后验推断阶段被纳入，以进一步精化信道重建。

给定 $t=1,\dots,T$ 个扩散步上单调的噪声调度 $\beta_t\in(0,1)$，累积噪声参数定义为 $\alpha_t=1-\beta_t$、$\bar\alpha_t=\prod_{i=1}^{t}\alpha_i$。前向扩散过程通过逐步加入高斯噪声，生成潜变量序列 $\{\mathbf h_t\}_{t=1}^T$：

$$
q(\mathbf h_t|\mathbf h_{t-1})=\mathcal N\left(\mathbf h_t;\sqrt{\alpha_t}\mathbf h_{t-1},(1-\alpha_t)\mathbf I\right).\tag{5}
$$

随 $t$ 增大，信号分量逐渐减弱，$\mathbf h_T$ 逼近各向同性高斯分布。由于前向过程的 Markov 结构，$\mathbf h_t$ 可直接用原始样本 $\mathbf h_0$ 表示：

$$
\mathbf h_t=\sqrt{\bar\alpha_t}\mathbf h_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon_t,\tag{6}
$$

其中 $\boldsymbol\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I)$。

反向扩散过程旨在逐步去除注入的噪声，并在条件 $\mathbf c$ 下恢复原始数据分布。反向转移建模为

$$
p_\theta(\mathbf h_{t-1}|\mathbf h_t,\mathbf c)=\mathcal N\left(\mathbf h_{t-1};\boldsymbol\mu_\theta(\mathbf h_t,t,\mathbf c),\sigma_t^2\mathbf I\right),\tag{7}
$$

其中 $\sigma_t^2=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t$。均值 $\boldsymbol\mu_\theta(\mathbf h_t,t,\mathbf c)$ 可推导为

$$
\boldsymbol\mu_\theta(\mathbf h_t,t,\mathbf c)=\frac{1}{\sqrt{\alpha_t}}\left(\mathbf h_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\boldsymbol\epsilon_\theta(\mathbf h_t,t,\mathbf c)\right),\tag{8}
$$

其中 $\boldsymbol\epsilon_\theta$ 是估计反向过程中噪声的可训练去噪函数。遵循扩散模型的标准推导，训练目标可简化为噪声预测损失：

$$
\mathcal L=\mathbb E_{\mathbf h_0,t,\boldsymbol\epsilon_t}\left\|\boldsymbol\epsilon_\theta(\mathbf h_t,t,\mathbf c)-\boldsymbol\epsilon_t\right\|_2^2.\tag{9}
$$

## III. 所提方法

### A. 环境感知信道估计表述

在多数传统方法中，先验分布 $p(\mathbf h)$ 被假定为与位置无关，并由全局信道统计刻画。然而无线信道与传播环境强耦合，导致显著的空间变异性。为说明这一点，我们考虑以 BS 为中心的正方形区域，并为随机分布在该区域内的用户生成射线追踪无线信道，如图 1a 所示。传播环境基于真实地图构建，并为大量采样用户位置获得信道实现；详细的射线追踪仿真设置见第 IV 节。对每个位置，我们计算相应信道矩阵的条件数，作为信道特性的一般指标 [13]、[14]。图 1b 可视化了信道条件数的空间分布，可以看到条件数在不同空间区域之间变化显著。

基于这些观察，用全局、与位置无关的分布建模信道先验是不充分的；相反，反映信道统计空间变异性的位置信息可为信道估计提供更准确的先验。考虑环境引起的无线信道空间变异性，用户位置提供了关于信道分布的有信息先验知识。令 $\mathrm{Loc}$ 表示用户位置；本文用二维坐标 $(x,y)$ 表示 $\mathrm{Loc}$，它指定用户在所考虑区域内的水平位置¹。环境感知信道估计可表述为

$$
\hat{\mathbf h}=\arg\max_{\mathbf h}p(\mathbf h|\mathbf y,\mathrm{Loc}).\tag{10}
$$

然而，准确建模以位置为条件的信道先验，并对高维后验分布进行推断，仍因复杂传播环境而充满挑战。本文利用扩散模型学习环境感知的信道分布并据此进行信道估计来解决该问题。

> **脚注 1（原文）：** 本文虽采用二维坐标 $(x,y)$，所提框架可容易扩展到三维坐标 $(x,y,z)$；这只改变条件变量的维数，不影响所提算法或网络架构。

**图 1：** 无线信道空间变异的示意。(a) 仿真环境。(b) 信道条件数的空间分布（横轴 $x$、纵轴 $y$，色标为条件数 70—82 dB）。（来源：原文第 3 页。）

### B. 后验推断算法

遵循基于分数的后验采样框架，信道估计问题（10）可通过如下迭代后验采样过程求解 [15]：

$$
\mathbf h_{t-1}=\frac{1}{\sqrt{\alpha_t}}\left(\mathbf h_t+(1-\alpha_t)\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathbf y,\mathrm{Loc})\right),\tag{11}
$$

其中梯度项 $\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathbf y,\mathrm{Loc})$ 是后验分数。由于接收信号依赖信道实现而不直接依赖位置，一旦给定 $\mathbf h$，观测 $\mathbf y$ 在给定 $\mathbf h$ 时与 $\mathrm{Loc}$ 条件独立。因此由 Bayes 公式，后验可表示为

$$
p(\mathbf h|\mathbf y,\mathrm{Loc})\propto p(\mathbf y|\mathbf h)p(\mathbf h|\mathrm{Loc}).\tag{12}
$$

相应地，（11）中的后验分数可表示为条件分数与似然分数之和：

$$
\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathbf y,\mathrm{Loc})=\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathrm{Loc})+\nabla_{\mathbf h_t}\log p_t(\mathbf y|\mathbf h_t).\tag{13}
$$

实践中我们采用修正后的后验分数 [16]：

$$
\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathbf y,\mathrm{Loc})=\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathrm{Loc})+w\nabla_{\mathbf h_t}\log p_t(\mathbf y|\mathbf h_t),\tag{14}
$$

其中 $w$ 是平衡先验项与似然项的超参数，用以改善去噪性能。

似然分数 $\nabla_{\mathbf h_t}\log p_t(\mathbf y|\mathbf h_t)$ 可按 [12] 的推导近似为

$$
\nabla_{\mathbf h_t}\log p_t(\mathbf y|\mathbf h_t)=\frac{1}{\sqrt{\bar\alpha_t}}\mathbf M^H\left(\frac{1-\bar\alpha_t}{\bar\alpha_t}\mathbf M\mathbf M^H+\sigma_z^2\mathbf I\right)^{-1}\left(\mathbf y-\frac{1}{\sqrt{\bar\alpha_t}}\mathbf M\mathbf h_t\right).\tag{15}
$$

条件分数可用去噪神经网络近似计算 [17]：

$$
\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathrm{Loc})\approx-\frac{1}{\sqrt{1-\bar\alpha_t}}\boldsymbol\epsilon_\theta(\mathbf h_t,t,\mathbf c).\tag{16}
$$

### C. 网络结构

我们采用受 Diffusion Transformer（DiT）架构启发的轻量 Transformer 扩散网络。网络以含噪信道 $\mathbf h_t$ 为输入，预测相应的噪声分量 $\boldsymbol\epsilon_\theta(\mathbf h_t,t,\mathrm{Loc})$。模型由输入嵌入层、堆叠的 DiT 块与输出投影层组成。

复值信道 $\mathbf h_t$ 首先通过分离实部与虚部转换为实值特征，再经线性嵌入层投影为隐表示。加入正弦位置编码以保留信道序列的结构信息。去噪过程以扩散时间步 $t$ 与用户位置 $\mathrm{Loc}=(x,y)$ 为条件；两个变量都用小型多层感知机（MLP）嵌入到同一潜维数。所得嵌入组合成统一的条件向量，用以调制 Transformer 块。

主干网络由 $N$ 个堆叠的 DiT 块组成，每块包含一个多头自注意力模块与随后的前馈网络。条件信息通过自适应层归一化注入，使条件向量能调制中间特征统计。最后，线性投影把隐表示映射回信道维数，产生预测噪声。

**图 2：** 所提网络结构。输入为含噪信道 $\mathbf h_t$ 与时间步 $t$（时间嵌入）、位置 $(x,y)$（位置嵌入）；条件嵌入 $\mathbf c$ 由 MLP 与 LayerNorm 生成，经 DiT 块（$\times N$，含 LayerNorm、逐点 MLP、LayerNorm、MLP、多头注意力）中的尺度—平移（Scale & Shift，含 $\gamma^{t}_{1},\beta^{t}_{1}$、$\gamma^{\mathrm{Loc}}_{1},\beta^{\mathrm{Loc}}_{1}$ 等）调制信道嵌入，输出预测噪声 $\boldsymbol\epsilon_t$。（来源：原文第 4 页。）

在获得训练好的网络后，所提 EA-DM 信道估计框架由算法 1 给出。

**算法 1：EA-DM 信道估计算法**

**输入：** $\mathbf M$、$\mathbf y$、$\mathrm{Loc}$、预训练网络 $\boldsymbol\epsilon_\theta$、噪声调度 $\{\beta_t\}_{t=1}^T$。  
**输出：** $\hat{\mathbf h}$。

1. 初始化 $\mathbf h_T\sim\mathcal{CN}(\mathbf 0,\mathbf I)$，并对所有 $t$ 计算 $\alpha_t=1-\beta_t$、$\bar\alpha_t=\prod_{i}^{t}\alpha_i$。
2. **for** $t=T:-1:1$ **do**
3. 　按（16）计算条件分数 $\nabla_{\mathbf h_t}\log p_t(\mathbf h_t|\mathrm{Loc})$。
4. 　按（15）计算似然分数 $\nabla_{\mathbf h_t}\log p_t(\mathbf y|\mathbf h_t)$。
5. 　按（14）计算后验分数。
6. 　按（11）更新 $\mathbf h_{t-1}$。
7. 　$\hat{\mathbf h}=\mathbf h_0$。
8. **end for**

## IV. 数值结果

仿真中，信道数据集用开源无线通信仿真器 Sionna [18] 的射线追踪模块生成。具体地，如图 1a 所示，采用慕尼黑（Munich）的预定义城市环境作为传播场景，它提供建筑与街道的详细几何信息。用户位置在以 BS 为中心的 $200\ \mathrm m\times200\ \mathrm m$ 区域内随机生成，每个用户终端高度固定为 1.5 m。BS 采用 $8\times8$ 均匀平面阵列（UPA），每个 UE 采用 $4\times4$ UPA，即 $M_r=64$、$M_t=16$。载波频率为 28 GHz。OFDM 系统使用 32 个子载波、子载波间隔 15 kHz。基于上述配置，最终数据集由为 $N_{\mathrm{train}}=13{,}800$ 个随机采样用户位置生成的信道实现组成。

我们用归一化均方误差（NMSE）评估信道估计性能，定义为 $\mathrm{NMSE}=\frac{\mathbb E[\|\hat{\mathbf h}-\mathbf h\|_2^2]}{\mathbb E[\|\mathbf h\|_2^2]}$。考虑三种基准方案，即正则化最小二乘（LS）、线性最小均方误差（LMMSE）以及 [12] 中的 CNN-DM。

- **正则化 LS：** 由于我们考虑欠定情形（即 $P<M_t$），采用正则化 LS 得到 $\hat{\mathbf h}=(\mathbf M^H\mathbf M+\sigma_z^2\mathbf I)^{-1}\mathbf M^H\mathbf y$。
- **LMMSE：** 样本协方差由全部训练数据计算，$\mathbf R_h=\frac{1}{N_{\mathrm{train}}}\sum_{i=1}^{N_{\mathrm{train}}}\mathbf h\mathbf h^H$。估计信道为 $\hat{\mathbf h}=\mathbf R_h\mathbf M^H(\mathbf M\mathbf R_h\mathbf M^H+\sigma_z^2\mathbf I)^{-1}\mathbf y$。
- **[12] 中的 CNN-DM：** 基于 CNN 的扩散模型执行 MAP 信道估计，不考虑环境先验。

对 EA-DM 与 CNN-DM，扩散步数都设为 $T=100$。网络训练时两个模型都以批大小 128、Adam 优化器、学习率 $10^{-3}$ 训练 500 个 epoch。

图 3 给出不同信道估计方案的 NMSE 随 SNR 的变化，导频长度设为 $P=10$。正则化 LS 因导频维数不足而持续表现较差。LMMSE 通过利用全局二阶信道统计提供了强线性基线，但其基于高斯协方差的先验无法充分刻画信道分布。CNN-DM 学习数据驱动但与位置无关的先验 $p(\mathbf h)$，有效表示跨不同空间区域平均后的信道分布；然而在该场景中，CNN-DM 不如 LMMSE 稳定的基于协方差的收缩。相比之下，所提 EA-DM 利用环境感知信息捕捉信道分布的空间结构，获得更准确的先验，从而提升估计精度。

图 4 给出 NMSE 随导频长度的变化，SNR 固定为 20 dB。所有方法的性能都随导频长度增加而改善。当导频长度较短时，观测提供的似然信息有限，估计严重依赖先验正则化；该机制下 CNN-DM 受其全局、与位置无关的先验所限，而 LMMSE 因基于协方差的收缩仍相对稳健。随导频长度增大，观测信息变得更充分、对先验信息的依赖下降；因此 EA-DM 与 CNN-DM 的性能差距变小，因为二者都能从越来越准确的观测中受益。尽管如此，EA-DM 仍保持最佳总体性能，证明了纳入环境感知信息对信道估计的有效性。

**图 3：** 不同信道估计方案的 NMSE 随 SNR 的变化（横轴 SNR −10—20 dB，纵轴 NMSE $10^{-2}$—$10^0$）；图例：LMMSE、regularized LS、CNN DM、EA-DM。（来源：原文第 5 页。）

**图 4：** 不同信道估计方案的 NMSE 随导频长度的变化，SNR = 20 dB（横轴导频长度 6—18，纵轴 NMSE $10^{-3}$—$10^0$）；图例：EA-DM、CNN DM、LMMSE、regularized LS。（来源：原文第 5 页。）

## V. 结论

本文提出了用于大规模 MIMO-OFDM 系统信道估计的 EA-DM。通过利用无线信道的空间变异性，训练一个条件扩散模型来学习用户位置与信道状态信息之间的关系，从而为信道估计提供以位置为条件的信道先验。基于该学习到的先验，我们提出一种后验推断算法，把导频观测融入反向扩散过程，实现联合利用位置信息与测量数据的贝叶斯信道估计。基于射线追踪信道数据集的仿真结果表明，与传统的以及现有基于学习的方法相比，所提方法取得了更高的估计精度。

## 图注与表注

**图 1（原文第 3 页）：** 见正文 §III-A 图注（无线信道空间变异：(a) 仿真环境；(b) 信道条件数的空间分布）。

**图 2（原文第 4 页）：** 见正文 §III-C 图注（所提网络结构：DiT 块、条件嵌入与尺度—平移调制）。

**图 3（原文第 5 页）：** 见正文 §IV 图注（NMSE 随 SNR 变化）。

**图 4（原文第 5 页）：** 见正文 §IV 图注（NMSE 随导频长度变化，SNR = 20 dB）。

**表注：** 原文全文无编号表格（仅图 1—4），故本页无需转录表格。

## 参考文献（英文原书目）

[1] W. Kim, Y. Ahn, J. Kim, and B. Shim, "Towards deep learning-aided wireless channel estimation and channel state information feedback for 6G," J. Commun. Networks, vol. 25, no. 1, pp. 61–75, 2023.
[2] Y. Zeng and X. Xu, "Toward environment-aware 6G communications via channel knowledge map," IEEE Wireless Commun., vol. 28, pp. 84–91, June 2021.
[3] Y. Qiu, D. Wu, Y. Zeng, Y. Tang, N. Cheng, and C. Qi, "AI-based environment-aware XL-MIMO channel estimation with location-specific prior knowledge enabled by CKM," July 2025.
[4] W. Hu, F. Li, and Y. Jiang, "Phase rotations of SVD-based precoders in MIMO-OFDM for improved channel estimation," IEEE Wireless Commun. Lett., vol. 10, pp. 1805–1809, Aug. 2021.
[5] W. Hu, J. Yang, X. Liang, R. Ran, Y. Jiang, and Y. Zhu, "Parametric MIMO-OFDM channel estimation: A quasi neural network approach," IEEE Trans. Commun., vol. 73, pp. 14931–14944, Dec. 2025.
[6] S. Kim, S. Jeong, J. Wu, B. Shim, and M. Z. Win, "Large multimodal model-based environment-aware channel estimation," IEEE J. Sel. Areas Commun., Jan. 2026.
[7] T. Wei, K. Tang, B. Zheng, W. Feng, W. Che, and Q. Xue, "CKM-based environment-aware codebook design for RIS-assisted mmWave communications with hybrid beamforming," IEEE Trans. Wireless Commun., vol. 25, pp. 10305–10320, Jan. 2026.
[8] W. Yue, J. Li, C. Li, N. Cheng, and J. Wu, "A channel knowledge map-aided personalized resource allocation strategy in air-ground integrated mobility," IEEE Trans. Intell. Transp. Syst., vol. 25, pp. 18734–18747, Jun. 2024.
[9] J. Yang, W. Hu, S. Bai, S. Li, S. Li, K. Wan, and X. Wang, "Large language models for beam prediction under the mmWave massive MIMO hybrid-field channels," IEEE Commun. Lett., vol. 30, pp. 627–631, Dec. 2025.
[10] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," Advances in Neural Information Processing Systems, vol. 33, pp. 6840–6851, 2020.
[11] B. Fesl, M. Baur, F. Strasser, M. Joham, and W. Utschick, "Diffusion-based generative prior for low-complexity MIMO channel estimation," IEEE Wireless Commun. Lett., vol. 13, pp. 3493–3497, Dec. 2024.
[12] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Trans. Wireless Commun., vol. 24, pp. 5840–5854, July 2025.
[13] J. Yang, W. Hu, Y. Jiang, S. Li, X. Wang, D. W. K. Ng, and G. Caire, "Complexity-scalable near-optimal transceiver design for massive MIMO-BICM systems," IEEE J. Sel. Areas Commun., vol. 44, pp. 3557–3574, Feb. 2026.
[14] J. Yang, W. Hu, Y. Jiang, S. Li, and X. Wang, "Achievable Rate Maximization in MIMO-BICM Systems: A Unified Transceiver Design," IEEE Trans. Signal Process., vol. 73, pp. 3346–3361, Jul. 2025.
[15] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," arXiv preprint arXiv:2010.02502, 2020.
[16] P. Dhariwal and A. Nichol, "Diffusion models beat GANs on image synthesis," Advances in Neural Information Processing Systems, vol. 34, pp. 8780–8794, 2021.
[17] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, "Score-based generative modeling through stochastic differential equations," arXiv preprint arXiv:2011.13456, 2020.
[18] J. Hoydis, S. Cammerer, F. Ait Aoudia, M. Nimier-David, L. Maggi, G. Marcus, A. Vem, and A. Keller, "Sionna," 2022. https://nvlabs.github.io/sionna/.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.16588v1（eess.SP，2026 年 9 月 15 日）全文 6 页：摘要、第 I—V 节、图 1—4 图注、算法 1、式（1）—（16）、参考文献 [1]—[18]（英文原条目）、基金资助脚注。原文为 IEEE 会议论文格式（邀稿论文），全文无编号表格（仅图 1—4），故本页无表格可转录。已保留的原文细节/疑点：作者单位原词拼写为 "Technische Universitat"（通常应为 "Technische Universität"），本页页首按原文照录并加注；原文脚注 1（二维坐标可扩展为三维）已译出；原文脚注中的基金编号按原文照录。精度相关处理：用 `render.py` 渲染 PDF 第 1、5 页并按图核对标题/作者/单位、摘要版式与图 3/图 4 的坐标范围和图例。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.16588v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
