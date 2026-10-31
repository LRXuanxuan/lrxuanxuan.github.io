---
layout: page
title: "基于增量条件扩散的 MIMO-OFDM AI 接收机｜中文全文译文"
permalink: /papers/translations/2026-09-23-2609-25923-mimo-ofdm-ai-receiver-based-on-incrementally-conditioned-diffusion-wit/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/afb5b3e241095390/) · [原文 arXiv](https://arxiv.org/abs/2609.25923) · [全部目录](/papers/catalog/)

# 基于增量条件扩散的 MIMO-OFDM AI 接收机

**原题：** MIMO-OFDM AI Receiver Based on Incrementally Conditioned Diffusion with Soft Decision  
**作者：** Weijie Zhou、Zhaoyang Zhang（通讯作者）、Zhixian Kong、Zhaohui Yang（浙江大学信息与电子工程学院，杭州 310027；浙江省多模态通信网络与智能信息处理重点实验室，杭州 310027）  
**版本：** arXiv:2609.25923v1（eess.SP），2026 年 9 月 22 日提交，原文 14 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VII 节、算法 1—3、表 I—表 V、图 1—图 8 图注与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

传统迭代接收机通常先利用稀疏导频观测做信道估计，再基于信道估计进行数据检测，然后用判决反馈更新信道估计，如此往复。在人工智能（AI）接收机设计中，如何利用这种**逐步丰富的数据观测**来增强生成式信道估计同样至关重要。然而数据判决的统计特性与可靠性总是随信道估计过程而演化，这给整体学习框架与算法设计带来巨大挑战。本文提出 **Diff-Rx**——一种面向多输入多输出正交频分复用（MIMO-OFDM）系统的、**数据检测与信道估计协同设计**的增量条件扩散接收机。具体地，本文提出一种**条件自适应后训练**方法，使生成式信道估计器能够适应由软数据判决逐步丰富的条件输入，并隐式对齐导频诱导与数据诱导的信道特征空间，以缓解潜在估计误差。**无阈值软判决**提供平滑的条件更新，无需针对具体条件进行可靠性调参。本文进一步提出一种**条件扩散 Transformer（CDiT）**，能够在含噪观测与多种导频图样下执行稳健信道估计，并把传统多步扩散生成简化为单步。在统计信道与站点特定射线追踪信道上的仿真表明，Diff-Rx 在不同噪声水平、导频密度与调制方式下均表现出一致增益，在导频密度低至 1/32 时仍工作良好，并在信道估计与数据检测性能上取得显著改善。

**关键词：** AI 接收机、条件扩散模型、MIMO-OFDM、单步生成、软判决。

## I. 引言

随着第六代无线系统向通信、计算、感知与人工智能（AI）的深度融合演进，基于 AI 的多输入多输出正交频分复用（MIMO-OFDM）接收机正成为物理层智能化的重要组成部分。在实际接收机中，信道估计与数据检测本质上是耦合的：准确的信道状态信息（CSI）改善均衡与符号检测，而被检测出的数据可反馈回来为后续信道精化提供额外观测。因此**判决反馈**是提升接收机性能的重要机制。AI 接收机设计的核心挑战在于：在有限导频开销下联合利用导频观测、接收信号与不确定的数据符号信息，同时保持低推理时延、对各种工作条件的鲁棒性，以及可解释的接收机处理链。

可靠的信道估计是此类联合接收机处理的基础。传统基于导频的方法从有限且含噪的导频观测中恢复信道。最小二乘（LS）估计在稀疏导频或低信噪比（SNR）下退化，而线性最小均方误差（LMMSE）估计需要信道协方差信息与矩阵求逆。压缩感知类方法利用信道稀疏性，用 LASSO、正交匹配追踪与消息传递（MP）等算法做信道估计 [1]、[2]、[3]，但依赖预设稀疏性假设与解析信道模型。基于神经网络（NN）的估计器也为接收机设计提供了新方案：卷积 [4]、全连接 [5]、Transformer [6] 与生成式架构 [7] 可直接从数据中学习信道结构；历史信道样本等辅助信息也可纳入以改善估计性能与鲁棒性 [8]。

扩散模型（DM）近期在通过渐进去噪学习复杂数据分布方面表现出强大能力 [9]。对无线数据而言，信道矩阵呈现结构化相关性，而接收观测对生成的信道施加约束 [10]。因此信道估计可被表述为**条件生成问题**：接收机重建一个同时符合所学信道先验与可用观测的完整信道。该表述自然允许把导频信息、噪声水平、接收信号与来自数据观测的边信息纳入统一生成框架。多数基于 DM 的信道估计器遵循扩散后验采样（DPS）[11]，在推理时把所学信道先验与接收观测结合 [12]、[13]；直接纳入导频位置、用户位置或其他边信息的条件 DM 进一步改善了对各种观测条件的适应性 [14]、[15]、[16]。这些方法展示了 DM 作为 AI 接收机信道估计模块的潜力，但它们主要聚焦于**以导频为条件**的信道估计。

为缓解导频开销与接收机性能之间的权衡，经典迭代接收机在联合信道估计与数据检测过程中引入判决反馈。基于期望最大化（EM）、MP 与迭代检测译码的方法用当前信道估计推断发送数据，再把硬判决、后验概率或其他信息作为附加观测反馈用于信道重估 [17]、[18]、[19]。通过在信道估计与数据检测之间交替，这些接收机逐步精化两项任务。传统方法通常依赖显式的反馈选择策略，例如最大似然判决、可靠性阈值或基于均方误差的准则，只把被认为足够可靠的符号用作**虚拟导频** [18]、[19]。然而当初始信道估计不准确或噪声水平较高时，错误符号仍可能被选中并传播到后续迭代，造成误差累积。此外这些选择机制通常是局部的、由规则驱动，难以充分利用接收信号、信道结构、导频观测与反馈信息之间的全局相关性。

联合处理与判决反馈的原理也推动了 AI 接收机设计。其中一个代表性方向是**模型驱动迭代接收机**，另一个是**端到端神经接收机**。模型驱动方法把可训练组件嵌入传统迭代流程，学习字典、滤波器或消息更新规则 [20]、[21]；[22] 进一步把 NN 与置信传播结合。这些方法保留接收机模块之间的显式交互并可提供可解释性，但仍受解析模型与更新规则约束。端到端神经接收机则联合执行信道估计、均衡与检测，直接输出对数似然比 [23]、[24]。此类接收机虽可联合优化多个处理模块，但其黑箱特性使中间接收机状态难以解释，且可能需要参数更多、计算复杂度更高的大模型。因此设计一种高效、自适应且可解释、并把信道估计与数据检测紧密耦合的 AI 接收机仍是一个开放问题。

在此类迭代 AI 接收机中应用 DM 还带来进一步挑战。多数基于 DM 的信道估计器在推理时依赖多次去噪步骤与额外的观测一致性校正。当信道生成在判决反馈回路内被反复调用时，该代价对实际接收机难以承受。此外，平衡所学先验与观测约束往往需要人工选择的缩放系数 [11]、[13]，而这些系数对 SNR 与导频密度敏感。一些基于 DM 的接收机进一步执行联合信道估计与数据检测 [25]、[26]、[27]，其中检测出的数据可复用为虚拟导频；但反馈生成常与信道估计网络分离，未针对所得数据观测显式优化。因此不规则反馈可能偏离训练时的观测分布，其不确定性及与原观测的关系也无法被充分学习，削弱了信道估计与数据检测之间的相互增强，并可能导致误差传播 [27]。

因此，有效的基于 DM 的迭代 AI 接收机必须同时解决**反馈利用**与**反复扩散生成所累积的时延**两个问题。

为应对这些挑战，本文提出 **Diff-Rx**——一种面向 MIMO-OFDM 系统的、基于增量条件 DM 的 AI 接收机。Diff-Rx 把数据后验推断、条件更新与信道估计集成到一个统一的迭代流程中。初始条件只含导频观测；在给定信道估计后，Diff-Rx 在星座集上评估每个数据符号的后验分布，并用软判决构造**伪信道观测**。这些观测与导频结合以更新条件，而条件随着其数据派生分量随中间估计的演化而逐步丰富。为有效利用这种增量反馈条件，本文进一步在迭代接收机环内对信道估计器做**后训练**。估计器由此学会处理不断演化的数据辅助观测及其与原导频的全局相关性；通过在环内条件上学习，后训练后的估计器隐式弥合导频观测与数据观测之间的分布差距，同时缓解信道与符号估计误差所诱导的干扰。该框架还兼容不同的发送数据检测更新方式（包括硬判决），体现其鲁棒性与通用性。通过采用软判决，所提方法避免了在不同条件下为选择可靠数据符号而进行复杂的阈值调整。

采用 DM 生成信道，是因为其强大的条件生成能力与噪声鲁棒性。与 DPS 等经典逆问题 DM 不同，所提方法在推理时不依赖观测一致性校正，而是训练模型直接学习以特定观测为条件的信道分布。此外，所提出的 DM 框架在训练时直接学习目标信道，因为对高维数据而言，在网络容量有限时目标预测比噪声预测更稳定 [28]。所提出的 DM 网络可在**单步生成**中恢复信道，显著降低基于 DM 的接收机的推理时延，更适用于低时延 AI 原生 MIMO-OFDM 接收机部署。本文主要贡献概括如下：

- 本文提出 Diff-Rx——一种面向 MIMO-OFDM 系统的增量条件 DM 接收机。它在信道估计与数据后验推断之间交替，通过无阈值软判决从仅含导频的条件逐步过渡到数据辅助条件。
- 本文提出一种**条件自适应后训练**策略，使信道估计器适应不同迭代中变化的数据派生观测。估计器学会利用数据派生观测的演化不确定性及其与导频观测的相关性。
- 本文提出**条件扩散 Transformer（CDiT）**作为 Diff-Rx 的信道估计模块，以支持不同导频图样与噪声水平。通过直接预测以接收观测为条件的目标信道，CDiT 避免迭代式观测一致性校正并支持单步条件生成。
- 本文开展大量仿真评估信道估计与数据检测性能，结果表明 Diff-Rx 在不同设置下具有一致优势。

## II. 预备知识

本节简要介绍去噪扩散概率模型（DDPM）[29] 的基本原理。DM 是最强大的生成模型之一：它学习训练集的数据分布，并在推理时通过对随机样本逐步去噪生成高质量输出 [29]。在前向过程中，DM 按方差调度 $\beta_1,\ldots,\beta_T$ 在 $T$ 个时间步内向数据 $\mathbf H_0\sim q(\mathbf H_0)$ 逐步加入高斯噪声，最终把 $\mathbf H_0$ 变换为白高斯噪声。前向过程每一步为

$$
q(\mathbf H_t\mid\mathbf H_{t-1})=\mathcal N\left(\mathbf H_t;\sqrt{1-\beta_t}\mathbf H_{t-1},\beta_t\mathbf I\right),\tag{1}
$$

其中样本 $\mathbf H_t$ 表示时间步 $t$ 的隐变量，$0<\beta_1<\cdots<\beta_T<1$。前向过程容许以闭式在任意时间步 $t$ 采样 $\mathbf H_t$：

$$
q(\mathbf H_t\mid\mathbf H_0)=\mathcal N\left(\mathbf H_t;\sqrt{\bar\alpha_t}\mathbf H_0,(1-\bar\alpha_t)\mathbf I\right).\tag{2}
$$

在逆向过程中，DM 旨在从 $p(\mathbf H_T)=\mathcal N(\mathbf H_T;\mathbf 0,\mathbf I)$ 开始生成输出。然而由于 $q(\mathbf H_0)$ 分布未知，条件分布 $q(\mathbf H_{t-1}\mid\mathbf H_t)$ 通常难以处理。因此 DM 通过变分方法把逆向过程建模为带可学习高斯转移的马尔可夫链：

$$
p_\theta(\mathbf H_{t-1}\mid\mathbf H_t)=\mathcal N\left(\mathbf H_{t-1};\boldsymbol\mu_\theta(\mathbf H_t,t),\boldsymbol\Sigma_\theta(\mathbf H_t,t)\right),\tag{3}
$$

其中 $\boldsymbol\mu_\theta(\mathbf H_t,t)$ 与 $\boldsymbol\Sigma_\theta(\mathbf H_t,t)$ 由 $\theta$ 参数化。训练通过优化负对数似然的常规变分上界完成：

$$
\mathbb E\left[-\log p_\theta(\mathbf H_0)\right]\le\mathbb E_q\left[-\log\frac{p_\theta(\mathbf H_{0:T})}{q(\mathbf H_{1:T}\mid\mathbf H_0)}\right]
=\mathbb E_q\left[\underbrace{D_{\mathrm{KL}}\left(q(\mathbf H_T\mid\mathbf H_0)\,\Vert\,p(\mathbf H_T)\right)}_{L_T}-\underbrace{\log p_\theta(\mathbf H_0\mid\mathbf H_1)}_{L_0}+\sum_{t>1}\underbrace{D_{\mathrm{KL}}\left(q(\mathbf H_{t-1}\mid\mathbf H_t,\mathbf H_0)\,\Vert\,p_\theta(\mathbf H_{t-1}\mid\mathbf H_t)\right)}_{L_{t-1}}\right].\tag{4}
$$

其中 $L_{t-1}$ 项训练 (3) 中参数以执行一步逆向扩散；当以 $\mathbf H_0$ 为条件时该项可处理，因为 $q(\mathbf H_{t-1}\mid\mathbf H_t,\mathbf H_0)$ 也是高斯的：

$$
q(\mathbf H_{t-1}\mid\mathbf H_t,\mathbf H_0)=\mathcal N\left(\mathbf H_{t-1};\tilde{\boldsymbol\mu}_t,\tilde\beta_t\mathbf I\right),\quad
\tilde{\boldsymbol\mu}_t=\frac{1}{\sqrt{\alpha_t}}\left(\mathbf H_t-\frac{1-\alpha_t}{\sqrt{1-\bar\alpha_t}}\boldsymbol\epsilon_t\right),\quad
\tilde\beta_t=\frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t,\tag{5}
$$

其中 $\boldsymbol\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I)$ 为时间步 $t$ 的高斯噪声，$\alpha_t\triangleq1-\beta_t$，$\bar\alpha_t\triangleq\prod_{i=1}^{t}\alpha_i$。

与噪声预测参数化不同，本文采用 **$x$-预测**方法。具体地，神经网络不预测高斯噪声 $\boldsymbol\epsilon_t$，而是直接从其含噪版本 $\mathbf H_t$ 估计信道 $\mathbf H_0$，其中

$$
\mathbf H_t=\sqrt{\bar\alpha_t}\mathbf H_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon,\qquad\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I).\tag{6}
$$

根据 (5) 中的闭式后验，后验均值可等价写为

$$
\tilde{\boldsymbol\mu}_t=\frac{\sqrt{\bar\alpha_{t-1}}\beta_t}{1-\bar\alpha_t}\mathbf H_0+\frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}\mathbf H_t.\tag{7}
$$

因此，在 $x$-预测参数化下，所学逆向均值通过把未知的 $\mathbf H_0$ 替换为网络预测 $G_\theta(\mathbf H_t,t)$ 得到：

$$
\boldsymbol\mu_\theta(\mathbf H_t,t)=\frac{\sqrt{\bar\alpha_{t-1}}\beta_t}{1-\bar\alpha_t}G_\theta(\mathbf H_t,t)+\frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}\mathbf H_t.\tag{8}
$$

相应的训练目标直接在**干净信道空间**中定义：

$$
L_{\mathrm{DM}}(\theta)=\mathbb E_{\mathbf H_0,\boldsymbol\epsilon,t}\left[\left\lVert\mathbf H_0-G_\theta\left(\sqrt{\bar\alpha_t}\mathbf H_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon,t\right)\right\rVert_2^{2}\right].\tag{9}
$$

推理时，逆向采样步骤按 $t=T$ 到 $t=1$ 迭代执行：

$$
\mathbf H_{t-1}=\boldsymbol\mu_\theta(\mathbf H_t,t)+\sqrt{\tilde\beta_t}\boldsymbol\epsilon.\tag{10}
$$

## III. 系统模型

本文考虑含 $N_f$ 个子载波的 OFDM 上行系统。基站（BS）配备 $N_r\gg1$ 根天线，服务多个单天线用户设备（UE）。记信道频率响应（CFR）为 $\mathbf H\in\mathbb C^{N_r\times N_f}$。发送符号向量记为 $\mathbf x\in\mathbb C^{N_f}$，承载在 $N_f$ 个子载波上：部分子载波被选作导频符号，其余为数据符号。记导频与数据符号对应索引集合分别为 $\mathcal P$ 与 $\mathcal D$。导频符号 $x_i$（$i\in\mathcal P$）对接收机已知；数据符号 $x_i$（$i\in\mathcal D$）取自特定星座。数据与导频符号取自不同星座。假设星座点具有均匀先验分布。于是对特定符号 $x_i$（$i\in\mathcal P\cup\mathcal D$），接收信号记为 $\mathbf Y\in\mathbb C^{N_r\times N_f}$，可表示为

$$
\mathbf y_i=x_i\mathbf h_i+\mathbf n_i,\tag{11}
$$

其中 $\mathbf y_i$ 表示 $\mathbf Y$ 中对应第 $i$ 个子载波的列，$\mathbf h_i$ 表示 $\mathbf H$ 的第 $i$ 列，$\mathbf n_i\sim\mathcal{CN}(\mathbf 0,\sigma_n^{2}\mathbf I)$ 为高斯噪声，$\sigma_n^{2}$ 为噪声方差。式 (11) 可写为

$$
\mathbf Y=\mathbf H\mathbf X+\mathbf N,\qquad\mathbf X=\operatorname{diag}\{\mathbf x\},\tag{12}
$$

其中 $\mathbf N$ 为高斯噪声。基于已知导频符号，导频位置处的初始信道响应 $\tilde{\mathbf h}_i$（$i\in\mathcal P$）可计算为 $\tilde{\mathbf h}_i=\mathbf y_i/x_i=\mathbf h_i+\tilde{\mathbf n}_i$，其中 $\tilde{\mathbf n}_i=\mathbf n_i/x_i\sim\mathcal{CN}(\mathbf 0,\sigma_n^{2}/|x_i|^{2}\mathbf I)$。

因此，本文的目标是基于部分子载波上观测到的含噪信道（即导频位置处的原始估计 $\tilde{\mathbf h}_i$）以及接收信号 $\mathbf Y$ 来恢复 $\mathbf H$ 与数据符号。该问题可建模为

$$
g_0:\left[\tilde{\mathbf h}_i\right]_{i\in\mathcal P}\in\mathbb C^{N_r\times|\mathcal P|},\ \mathbf Y\to\mathbf H\in\mathbb C^{N_r\times N_f},\ \mathbf x,\tag{13}
$$

其中 $|\mathcal P|$ 表示 $\mathcal P$ 的元素个数。

单次观测中的导频位置对应一个特定导频图样，接收机已知该图样。本文用掩膜 $\mathbf M\in\{0,1\}^{N_r\times N_f}$ 表示导频图样：1 表示导频符号位置，0 表示数据符号位置。$\mathbf M$ 是一个条带矩阵，其第 $i$ 列（$i\in\mathcal P$）全为 1、其余位置为 0。(13) 中的信道估计问题可转化为如下数学模型：

$$
g:\tilde{\mathbf H}\in\mathbb C^{N_r\times N_f},\ \mathbf Y\to\mathbf H\in\mathbb C^{N_r\times N_f},\ x_i,\ i\in\mathcal D,\qquad
\tilde{\mathbf H}=(\mathbf H+\tilde{\mathbf N})\otimes\mathbf M,\tag{14}
$$

其中 $\otimes$ 表示逐元素相乘，$\tilde{\mathbf N}$ 为 $\tilde{\mathbf n}_i$ 的拼接。由于在把 CFR 矩阵乘以 $\mathbf M$ 之后，非导频位置处（$i\in\mathcal D$）的噪声方差 $\tilde{\mathbf n}_i$ 不影响本文的解，为简单起见 $\tilde{\mathbf N}$ 是噪声的统一表示。

## IV. 所提方法

### A. 框架设计的动机

判决反馈可通过在数据位置引入额外观测来改善信道估计。然而如正文图 1 所示，把仅在导频观测上训练的估计器直接应用于此类数据辅助输入可能造成显著的**分布失配**。这类估计器只观测由完全已知导频符号得到的含噪信道估计；相反，数据位置处的观测由使用（估计）信道推断出的符号构造，同时受接收机噪声与估计误差影响，其可靠性还随 SNR 与调制阶数变化。估计器可能把导频派生观测与数据派生观测视为同等可靠，使错误反馈偏置后续信道估计与数据检测。此外，数据派生观测在初始估计阶段不可用，且随接收机更新其符号估计而变化。因此，有效的迭代接收机应在计入新增观测**独特且演化中的不确定性**的同时，逐步纳入新推断出的数据信息。

所提架构的另一动机是避免在单一神经网络内直接学习信道估计与数据检测。发送数据位于高维离散空间，直接神经建模困难；相反，无线信道呈现结构化相关性，常可由低维流形表示。因此本文用经典数据检测方法高效地把数据域信息变换到信道域，再用神经网络学习与精化结构化的信道表示。本节将详细介绍所提框架。

### B. 所提出的 Diff-Rx 框架

本文提出 Diff-Rx 框架，把后验符号推断集成到基于 CDiT 的扩散信道估计器中，框架示意见正文图 2。

**1）Diff-Rx 中的迭代信道估计：** Diff-Rx 是受传统类 EM 接收机交替估计原理启发的可训练迭代 AI 接收机。在每次接收机迭代中，Diff-Rx 先以导频观测与当前可用的数据符号信息为条件估计信道；所得信道估计随后用于更新数据符号的后验分布，并为下一次迭代重建条件。**扩散所用的同一噪声样本在所有接收机迭代间共享**。因此，相邻两次信道估计的差异主要来自更新后的条件信息，而非扩散噪声的不同实现。该设计使 Diff-Rx 能够通过可控且一致的迭代过程逐步精化信道估计。

Diff-Rx 最多执行 $K$ 次信道估计迭代。具体地，第一次迭代本质上对应使用仅在导频观测上训练的估计器做信道估计：此阶段的条件由 $\mathbf H_{\mathrm{LS}}$ 与取反的导频掩膜 $\mathbf 1-\mathbf M$ 拼接构造，用于引导 CDiT 生成初始信道估计。在第 $k$ 次迭代，CDiT 使用上一次迭代提供的条件 $\mathbf C^{(k)}$ 估计信道 $\widehat{\mathbf H}_0^{(k)}$。与第一次迭代不同，$\mathbf C^{(k)}$ 不仅含 $\mathbf H_{\mathrm{LS}}$ 与掩膜信息，还含由第 $(k-1)$ 次迭代数据符号推断的**伪信道估计**。因此，信道生成网络可自适应利用来自数据符号的伪信道估计，为精化当前信道估计提供额外边信息。经过 $K$ 次迭代，Diff-Rx 给出最终信道估计 $\widehat{\mathbf H}_0$。此外，考虑到无线通信系统严格的时延要求，所提架构天然支持**提前终止**——中间信道估计可直接作为输出。

**2）条件更新：** 条件更新在每次迭代执行。在第 $k$ 次迭代，Diff-Rx 使用当前信道估计 $\widehat{\mathbf H}_0^{(k)}$、接收信号 $\mathbf Y$ 与导频掩膜 $\mathbf M$ 重建下一条件 $\mathbf C^{(k+1)}$。Diff-Rx 不显式保留第 $(k-1)$ 次迭代的数据符号选择结果，而是基于 $\widehat{\mathbf H}_0^{(k)}$ **重新计算**后验分布与软判决；这避免了直接复用早期判决，并缓解其在接收机迭代间的传播。

为简单起见，考虑单流情形。给定 $\widehat{\mathbf H}_0^{(k)}$、$\mathbf Y$ 与 $\mathbf M$，使用当前信道估计近似每个数据符号在星座集上的后验概率：

$$
p\left(x_i=s\mid\mathbf y_i,\widehat{\mathbf h}_i^{(k)}\right)=\frac{\exp\left(-\left\lVert\mathbf y_i-\widehat{\mathbf h}_i^{(k)}s\right\rVert^{2}/\sigma_n^{2}\right)}{\sum_{s'\in\mathcal S}\exp\left(-\left\lVert\mathbf y_i-\widehat{\mathbf h}_i^{(k)}s'\right\rVert^{2}/\sigma_n^{2}\right)},\tag{15}
$$

其中 $\widehat{\mathbf h}_i^{(k)}$ 为 $\widehat{\mathbf H}_0^{(k)}$ 的第 $i$ 列，$\mathcal S$ 表示生成数据符号的星座，$s\in\mathcal S$，$i\in\mathcal D$。在获得各数据符号在星座点上的后验概率后，通过最小化如下重构误差得到**软伪信道**：

$$
\widehat{\mathbf h}_{\mathrm{soft},i}^{(k)}=\arg\min_{\bar{\mathbf h}_i}\mathbb E\left[\left\lVert\mathbf y_i-x_i\bar{\mathbf h}_i\right\rVert^{2}\mid\mathbf y_i,\widehat{\mathbf h}_i^{(k)}\right]=\mathbf y_i\left(\widehat x_{\mathrm{soft},i}^{(k)}\right)^{*}/\xi_i^{(k)},\tag{16}
$$

其中

$$
\widehat x_{\mathrm{soft},i}^{(k)}=\mathbb E\left[x_i\mid\mathbf y_i,\widehat{\mathbf h}_i^{(k)}\right]=\sum_{s'\in\mathcal S}p\left(x_i=s'\mid\mathbf y_i,\widehat{\mathbf h}_i^{(k)}\right)s'\tag{17}
$$

且

$$
\xi_i^{(k)}\triangleq\mathbb E\left[\left|x_i\right|^{2}\mid\mathbf y_i,\widehat{\mathbf h}_i^{(k)}\right].\tag{18}
$$

此类软判决避免过早地对不确定的数据符号做离散化。在低 SNR 或高阶调制场景中，错误的硬判决会被直接传播到后续伪信道更新，导致跨迭代的误差累积；相反，软判决保留后验分布所包含的不确定性信息，使数据符号以更平滑的方式参与条件更新。

为刻画伪信道观测中所含的不确定性，分别定义信道与软符号估计误差 $\Delta\mathbf h_i^{(k)}\triangleq\mathbf h_i-\widehat{\mathbf h}_i^{(k)}$ 与 $\Delta x_i^{(k)}\triangleq x_i-\widehat x_{\mathrm{soft},i}^{(k)}$。进一步定义 $\nu_i^{(k)}\triangleq\xi_i^{(k)}-\left|\widehat x_{\mathrm{soft},i}^{(k)}\right|^{2}$。于是伪信道观测也可表示为

$$
\widehat{\mathbf h}_{\mathrm{soft},i}^{(k)}=\mathbf h_i+\boldsymbol\eta_i^{(k)},\tag{19}
$$

其中

$$
\boldsymbol\eta_i^{(k)}=\frac{\left(\widehat x_{\mathrm{soft},i}^{(k)}\right)^{*}}{\xi_i^{(k)}}\left(\widehat{\mathbf h}_i^{(k)}\Delta x_i^{(k)}+\Delta\mathbf h_i^{(k)}x_i+\mathbf n_i\right)-\frac{\nu_i^{(k)}}{\xi_i^{(k)}}\widehat{\mathbf h}_i^{(k)}-\Delta\mathbf h_i^{(k)}.\tag{20}
$$

因此，数据派生伪信道由真实信道与一个由**信道估计误差、符号估计误差与接收机噪声共同诱导的等效残差**组成。仅在导频派生观测上训练的估计器并未针对该耦合残差优化。通过用迭代接收机内部生成的伪信道条件对估计器做后训练，Diff-Rx 学会隐式补偿 (20) 中的残差，而无需显式估计或抵消其各分量。随着信道与符号估计逐步精化，该残差可逐步减小，为后续迭代提供更可靠的条件。

完整伪信道矩阵 $\widehat{\mathbf H}_{\mathrm{soft}}^{(k)}$ 由 $\widehat{\mathbf h}_{\mathrm{soft},i}^{(k)}$ 在数据子载波上堆叠得到。条件更新时，该伪信道按如下方式注入下一迭代条件：

$$
\mathbf V^{(k+1)}=\mathbf H_{\mathrm{LS}}\otimes\mathbf M+\widehat{\mathbf H}_{\mathrm{soft}}^{(k)}\otimes(\mathbf 1-\mathbf M).\tag{21}
$$

由此，数据派生伪信道可为信道估计提供额外的伪导频信息。最后，下一迭代条件更新为

$$
\mathbf C^{(k+1)}=\operatorname{cat}\left(\mathbf V^{(k+1)},\mathbf 1-\mathbf M\right).\tag{22}
$$

**3）数据检测：** 完成 $K$ 次接收机迭代后，Diff-Rx 得到最终信道估计 $\widehat{\mathbf H}_0=\widehat{\mathbf H}_0^{(K-1)}$，并按 (15) 重新计算每个数据符号在星座集上的后验概率。对每个数据子载波 $i\in\mathcal D$，选取后验概率最大的星座点作为最终检测结果：

$$
\widehat x_i=\arg\max_{s\in\mathcal S}\ p\left(x_i=s\mid\mathbf y_i,\widehat{\mathbf h}_i\right),\qquad i\in\mathcal D,\tag{23}
$$

其中 $\widehat{\mathbf h}_i$ 为 $\widehat{\mathbf H}_0$ 的第 $i$ 列。

### C. 所提出的 CDiT 信道估计框架

实际系统中接收机应处理各种 SNR 与导频图样，这促使本文采用 DM 在多样观测下进行稳健的条件信道生成。所提信道估计模型见正文图 3。鉴于 CFR 为复值，本文把其实部与虚部分离并沿新维度堆叠。因此 (6) 中时间步 $t$ 的含噪信道矩阵 $\mathbf H_t$ 与原始估计 $\tilde{\mathbf H}$ 的形状均为 $2\times N_r\times N_f$。训练阶段 $\mathbf H_t$ 表示被时间步 $t$ 噪声污染的真值信道 $\mathbf H_0$；推理阶段 $\mathbf H_t$ 表示去噪过程中得到的中间含噪信道。二者都表示被噪声污染的信道，故统一用 $\mathbf H_t$ 描述该变量。

**1）Patchify：** 本文用二维卷积实现 patchify [30]，以学习子载波与天线之间的块内特征。假设卷积核与步长均为 $p_r\times p_f$、token 嵌入维数为 $D$，则可把维数为 $C_h\times N_r\times N_f$ 的输入张量变换为 $L\times D$，其中序列长度 $L=(N_r/p_r)\times(N_f/p_f)$，$C_h$ 为通道数。由于输入维数不同，输入 token 与条件 token 的生成采用不同的 patchify 模块，示意图见正文图 3 右侧。

**2）条件嵌入：** 对标题条件信息，本文把扩散时间步 $t$ 嵌入模型。标量经正弦嵌入后再经 MLP 编码，输出相加形成全局条件向量。全局条件向量通过**自适应层归一化（AdaLN）** [30] 注入每个 CDiT 块：具体地，一个调制 MLP 把条件嵌入映射为移位、缩放与门控参数，用于调制归一化后的特征。

**3）CDiT 块：** 在 DM 中，去噪网络的设计对最终恢复性能也起关键作用。本文采用基于 DiT 的去噪网络 [30]，以增强全局相关性的建模并改善稀疏导频条件下的信道恢复性能。具体地，含噪信道 token 与条件 token 被送入一系列 CDiT 块，记 CDiT 块数为 $K_{\mathrm{layer}}$。遵循 DiT 模型设计，每个 Transformer 块包含多头自注意力（MHSA）模块与逐点前馈（FFN）模块。与在输入端直接拼接条件信息 [31]、[32] 不同，本文应用**交叉注意力**模块纳入条件输入 token：条件输入 token 作为 query，前一个自注意力的输出同时作为 key 与 value。该设计出于深度条件感知融合的需要：交叉注意力机制显式建模条件与含噪信道潜在特征之间的相关性，使网络能够根据当前上下文自适应关注最相关的条件信息。此外，本文对交叉注意力模块也应用 AdaLN，并采用旋转位置编码（RoPE）[33] 编码 token 的相对位置。

## V. 训练与推理方法

### A. 训练方法

**1）CDiT 训练的数据预处理：** CFR 数据的幅度变化显著，而 DM 通常要求输入归一化到 $[-1,1]$ 范围以获得更好性能。因此本文把每个样本 $\mathbf H_0$ 除以一个功率因子以归一化数据，该因子可写为 $\sqrt{\lVert\mathbf H_0\rVert_2^{2}/(N_rN_f)}$。这确保输入幅度大致保持在 1 的量级，使样本分布更均匀，并有效降低网络的学习难度。

**2）CDiT 的训练：** 经上述预处理后，可得到一组精确的信道样本 $\mathbf H_0$。训练时本文用不同方差噪声与不同导频图样进行**混合训练**：把样本送入网络之前，随机生成噪声与导频图样；把条件信息 $\{\tilde{\mathbf H},\mathbf M\}$（记为 $\mathbf C$）纳入训练后，采用直接的 $x$-预测目标。CDiT 被训练用于估计 $\mathbf H_0$ 本身，而非注入的扩散噪声。CDiT 的训练目标表示为

$$
L_{\mathrm{CDM}}(\theta)=\mathbb E_{\mathbf H_0,\boldsymbol\epsilon,t}\left[\left\lVert\mathbf H_0-G_\theta\left(\mathbf H_t,t,\mathbf C\right)\right\rVert_2^{2}\right].\tag{24}
$$

在所提条件 DM 框架中，最终目标是获得准确的信道估计，而非恢复人工扩散噪声。该选择受 [28] 关于结构化高维数据的**流形视角**启发：信道 $\mathbf H_0$ 在频域与天线域呈现物理相关性，可视为位于嵌入高维观测空间的低维结构化流形上；相反，注入的高斯噪声 $\boldsymbol\epsilon$ 无结构且占据整个高维空间。在此类设置下直接预测干净数据更为合适，因为网络只需恢复结构化数据分量，而不必建模全维随机噪声。这使训练损失与下游信道估计指标更一致，也避免了在噪声预测后通过额外重参数化步骤间接恢复信道。

为使 CDiT 能处理任意导频图样输入，本文在训练中引入**随机掩膜策略**。具体地，设导频间隔为 $P$，从 $[0,P-1]$ 中随机选择起始导频位置 $P_{\mathrm{start}}$，子载波域上均匀间隔的导频索引为 $P_{\mathrm{start}}+wP$（$w=0,1,\ldots,\lfloor N_f/P\rfloor-1$）。基于该索引集构造基础梳状导频掩膜，随后随机激活额外频域位置（把其掩膜值置为 1），从而生成非均匀随机导频图样。采用该训练策略，CDiT 不仅在均匀间隔导频图样下保持估计性能，还提升了对随机导频图样与动态伪导频输入的适应性。

相应训练流程见算法 1。

**算法 1　CDiT 的训练算法**

```text
Require: SNR 范围 [r_min, r_max]
1: repeat
2:     采样 H_0 ~ q(H_0)
3:     采样功率 P_signal = ||H_0||_F^2 / (N_r N_f)
4:     H_0 = H_0 / sqrt(P_signal)
5:     采样 t ~ Uniform({1,...,T})
6:     采样 ε ~ N(0, I)
7:     采样随机掩膜 M
8:     采样 r ∈ [r_min, r_max], σ_n² = 1/r, 采样 N ~ CN(0, σ_n² I)
9:     H̃ = (H_0 + N) ⊗ M
10:    C ← {H̃, M}
11:    对下式取梯度下降步:
        ∇_θ ||H_0 − G_θ(sqrt(ᾱ_t) H_0 + sqrt(1−ᾱ_t) ε, t, C)||²
12: until 收敛
```

**3）幅度对齐归一化：** 由于 CDiT 的输入与输出信道在训练中均被归一化，在 Diff-Rx 的训练与推理流程中对齐幅度尺度很重要。推理时真实信道幅度未知，因此本文从 LS 估计中估计信道归一化因子。先计算 (14) 中 $\tilde{\mathbf H}$ 的功率：

$$
P_{\mathrm{LS}}=\frac{1}{N_r|\mathcal P|}\sum_{i\in\mathcal P}\left\lVert\tilde{\mathbf h}_i\right\rVert_2^{2}.\tag{25}
$$

由于 LS 估计满足 $\tilde{\mathbf h}_i=\mathbf h_i+\mathbf n_i/x_i$，噪声功率被已知导频符号幅度缩放。因此给定线性 SNR $r$，归一化幅度估计为

$$
\widehat a=\sqrt{\frac{P_{\mathrm{LS}}}{1+P_x\eta_p/r}},\qquad
\eta_p=\frac{1}{|\mathcal P|}\sum_{i\in\mathcal P}\frac{1}{|x_i|^{2}},\tag{26}
$$

其中 $P_x=\mathbb E[\lVert\mathbf x\rVert^{2}]$ 为平均符号功率。由于星座已归一化，本文近似 $P_x=1$。初始 LS 条件、CDiT 输出与伪信道都用同一幅度因子 $\widehat a$ 对齐。

**4）Diff-Rx 的训练：** 与标准单遍 CDiT 训练不同，Diff-Rx 在 $K$ 次接收机迭代中精化信道估计。训练时**同一含噪样本 $\mathbf H_t$ 被所有迭代共享**。共享权重的 CDiT 估计器在第 $k$ 次迭代预测目标信道为

$$
\widehat{\mathbf H}_0^{(k)}=G_\theta\left(\mathbf H_t,t,\mathbf C^{(k)}\right),\qquad k=0,\ldots,K-1.\tag{27}
$$

为便于 Diff-Rx 训练，本文用预训练模型初始化 CDiT。预训练 CDiT 针对以导频为条件的信道估计训练，且**与调制方式无关**，提供强信道先验。该初始化带来可靠的早期信道估计，降低传播严重偏置的伪信道观测的风险，并稳定迭代训练过程。此外，经过 Diff-Rx 后训练后，网络已适应目标星座下的数据辅助更新过程。因此，从预训练 CDiT 出发可使所提框架仅需有限后训练即可适配不同星座，而不必为每种调制从零训练单独的估计器。

本文在条件更新处**停止梯度**。具体地，在第 $k$ 次迭代，CDiT 估计器先生成信道估计，随后用其**分离版本**计算下一条件：

$$
\mathbf C^{(k+1)}=\Phi\left(\mathbf Y,\operatorname{sg}\left(\widehat{\mathbf H}_0^{(k)}\right),\mathbf M\right),\tag{28}
$$

其中 $\operatorname{sg}(\cdot)$ 表示停止梯度操作，$\Phi(\cdot)$ 为条件更新模块。

该设计对 Diff-Rx 的稳定训练至关重要。若不停止梯度，条件更新会被纳入可微的循环计算图，迫使梯度穿过后验归一化与跨迭代的伪信道重建。这些操作构成一条长且数值敏感的梯度路径，可能导致无效的梯度传播与不稳定的优化。

停止梯度操作还使训练与**类 EM 的交替推理结构**相一致：后验推断扮演类似 E 步的角色，从当前信道估计生成依赖数据的软边信息，而 CDiT 在生成的条件执行信道估计。推断步骤产生的后验量在更新估计器时被视为固定值。因此，基于模型的条件更新仅用于为下一迭代生成固定的条件输入，而不作为可微神经层通过反向传播优化；同时每次迭代的 CDiT 估计器始终可训练，并受重建损失监督。

由于本文的扩散估计器采用 $x$-预测目标，每次迭代都由真值信道 $\mathbf H_0$ 直接监督。第 $k$ 次迭代的重建损失为

$$
L^{(k)}=\left\lVert\mathbf H_0-\widehat{\mathbf H}_0^{(k)}\right\rVert_2^{2}.\tag{29}
$$

反馈不能作为固定输入用于非迭代架构，因为它由每次接收机迭代的输出生成，并在整个精化过程中演化。因此估计器应在迭代环内训练，以便适应依赖迭代的反馈观测分布。于是 Diff-Rx 的总体训练目标定义为所有迭代上重建损失的平均：

$$
L_{\mathrm{Diff-Rx}}(\theta)=\mathbb E_{\mathbf H_0,\boldsymbol\epsilon,t}\left[\frac{1}{K}\sum_{k=0}^{K-1}\left\lVert\mathbf H_0-\widehat{\mathbf H}_0^{(k)}\right\rVert_2^{2}\right].\tag{30}
$$

相应地，损失在所有迭代上累积，并通过在下式上取梯度下降步更新网络参数：

$$
\nabla_\theta L_{\mathrm{Diff-Rx}}(\theta).\tag{31}
$$

该多阶段监督鼓励每次 CDiT 迭代都产生有效信道估计，而非只优化最终输出；由此网络可学到**渐进精化**行为。相应训练流程见算法 2。

**算法 2　Diff-Rx 的训练算法**

```text
Require: SNR 范围 [r_min, r_max], 预训练 CDiT G_θ, 最大迭代次数 K, 星座 S
1: repeat
2:     采样 H_0 ~ q(H_0), M ∈ {0,1}^{N_r×N_f}, X ∈ S^{N_f}, r ∈ [r_min, r_max]
3:     在 SNR = r 下生成接收信号 Y = H_0 X + N
4:     得到 LS 估计 H_LS = Y / X
5:     用 (25) 估计幅度因子 â 并归一化 H_LS ← H_LS / â
6:     采样 t ~ Uniform({1,...,T}) 与 ε ~ N(0, I)
7:     构造含噪样本 H_t = sqrt(ᾱ_t) H_0 + sqrt(1−ᾱ_t) ε
8:     初始化 C^(0) = concat(H_LS ⊗ M, 1 − M)
9:     置 L = 0
10:    for k = 0 to K−1 do
11:        估计信道 Ĥ_0^(k) = G_θ(H_t, t, C^(k))
12:        L ← L + ||Ĥ_0^(k) − H_0||²
13:        分离: Ĥ_0^(k) ← stopgrad(Ĥ_0^(k) × â)
14:        按 (15) 计算后验概率
15:        计算归一化伪信道 Ĥ_soft^(k) / â
16:        按 (21) 更新 V^(k+1)
17:        按 (22) 更新下一条件 C^(k+1)
18:    end for
19:    对 ∇_θ (1/K) L 取梯度下降步
20: until 收敛
```

### B. 推理方法

**1）CDiT 的推理：** 由于 CDiT 以 $x$-预测目标训练，其输出本身就是目标信道的估计，因此 CDiT 天然支持**单步生成**。具体地，推理阶段可从终端扩散步的高斯样本开始，把它与条件及时间步 $T$ 一起直接送入 CDiT，网络便在单次前向传播中给出信道估计。

若需要更长的去噪轨迹，该模型也可用于多步采样：此时从完整训练调度中选取扩散时间步的子序列；在每个选定时间步，CDiT 先预测信道，随后可由 (6) 中的前向扩散关系恢复相应噪声估计；该恢复的噪声估计由标准 DDPM 调度器用于更新中间含噪样本 [9]。因此所提 CDiT 模型同时支持单步低时延生成与传统多步扩散采样。本文采用单步生成以实现高效接收机推理。

**算法 3　Diff-Rx 的推理算法**

```text
Require: 接收信号 Y, 导频 LS 估计 H_LS, 导频掩膜 M, SNR r, 最大迭代次数 K, 星座 S
1: 采样 H_T ~ N(0, I)
2: 用 (25) 估计幅度因子 â 并得到 H_LS ← H_LS / â
3: 初始化 C^(0) = concat(H_LS ⊗ M, 1 − M)
4: for k = 0 to K−1 do
5:     Ĥ_0^(k) = G_θ(H_T, T, C^(k))
6:     if 满足提前退出准则 then
7:         return Ĥ_0^(k) × â
8:     end if
9:     Ĥ_0^(k) = Ĥ_0^(k) × â
10:    在 S 上计算后验概率
11:    计算归一化伪信道
12:    更新 C^(k+1)
13: end for
14: 按 (23) 得到 x̂
15: return Ĥ_0^(K−1) 与 x̂
```

**2）Diff-Rx 的推理：** 每次迭代中，CDiT 按 (27) 的预测形式在当前条件下执行单步信道生成；所得信道估计随后按 (15)—(22) 的条件更新方程更新数据符号后验、伪信道与下一条件。

尽管 Diff-Rx 以最大迭代次数 $K$ 训练，推理过程不必运行全部 $K$ 次迭代。由于每次迭代都直接输出有效信道估计，当有严格时延约束时，接收机可提前终止并把中间估计与检测结果作为最终输出。该**提前退出**特性在性能与推理速度之间提供灵活权衡。

## VI. 数值结果

本节从信道估计精度与数据检测精度两方面评估 CDiT 与 Diff-Rx 在不同噪声水平与导频图样下的性能，并评估所提方法的计算复杂度。

### A. 实验细节

**1）数据生成：** 实验使用 Sionna [34] 生成训练、验证与测试数据集。为在标准化统计信道与站点特定几何信道下评估所提方法，本文考虑两类信道数据集：从 3GPP 城市微小区（UMi）模型生成 24,000 个统计信道样本，以及从慕尼黑圣母教堂（Frauenkirche）场景生成 8,000 个站点特定射线追踪（RT）样本。两个数据集均采用 3.5 GHz 上行、8 单元双极化线阵（ULA）与 512 个子载波；UMi 信道子载波间隔为 60 kHz，RT 信道为 120 kHz。对 RT 数据集，UE 随机分布在 1 至 400 m 的距离范围内，速度分配为 0 至 10 m/s；每个信道样本在保留 48 条最强径后从 14 个 OFDM 符号中选取一个。因此两类信道形状均为 $16\times512$。数据集相关参数汇总于表 I。

**表 I：Sionna 数据集的参数设置。**

| 参数 | 取值 |
|---|---|
| 统计信道模型 | UMi |
| RT 场景 | Munich |
| 中心频率 | 3.5 GHz |
| 子载波间隔 | 60 kHz（UMi）；120 kHz（RT） |
| 天线阵列形式 | ULA |
| 天线极化 | 交叉极化 |
| $N_r$ | 8 |
| $N_f$ | 512 |
| 最大路径数 | 48 |
| 最大射线交互次数 | 5 |
| BS 位置 | $[-15,-165,95]$ m |
| UE 与 BS 距离 | 1 m～400 m |
| UE 速度 | 0～10 m/s |

**2）性能指标：** 本文使用估计信道与真实信道之间的归一化 MSE（NMSE）[35] 以及误比特率（BER）作为性能指标，定义如下：

$$
\mathrm{NMSE}=\mathbb E\left\{\left\lVert\mathbf H_0-\widehat{\mathbf H}_0\right\rVert_F^{2}/\left\lVert\mathbf H_0\right\rVert_F^{2}\right\}.\tag{32}
$$

**3）基线与训练设置：** 训练过程中接收信号的 SNR 在 $-10$ 至 $30$ dB 范围内随机分布，导频间隔 $P$ 从集合 $\{1,2,4,8,16,32\}$ 中随机选取。本文在两个不同数据集上以相同训练参数训练。训练相关参数详见表 II。比较的基线方法如下：

- **LMMSE：** 该算法基于由全部训练样本计算的样本协方差，用线性估计器计算 OFDM 资源栅格每个元素的信道估计与相应误差方差，随后进行频域插值。
- **CMixer：** 该模型用两个复数域 MLP 模块分别学习空间与频率特征。本文把 CMixer 层数设为 4，以确保其 FLOPs 与 CDiT 相当；训练细节与其他参数遵循 [5]。
- **基于分数的生成模型（SGM）** [12]：SGM 估计器学习基于分数的生成先验，并使用退火 Langevin 动力学执行估计。
- **扩散模型后验采样（DMPS）** [13]：DMPS 估计器学习 MIMO 信道先验，并通过把 DM 先验分数与测量似然分数结合执行后验推断。我们发现该文所用 CNN 网络在本文的 OFDM 信道估计任务中未能取得理想性能，因此用 DiT 模型替代该 CNN 网络；此外针对不同导频密度调整缩放系数，使网络达到最佳估计性能。
- **CDiT：** 该基线不做后训练，直接基于导频观测执行信道估计。
- **DA-LMMSE（数据辅助 LMMSE）** [36]：该传统方法基于均衡后星座点与理想星座符号之间的欧氏距离评估符号可靠性，然后执行 LMMSE 信道估计。
- **EM-CDiT：** 该基线把 CDiT 嵌入传统 EM 式迭代流程：每次信道估计步骤后用最大后验（MAP）检测进行数据检测，并按后验概率阈值选择可靠数据符号作为虚拟导频。
- **Perfect CSI+ML：** 该基线具有完美 CSI，并使用最大似然（ML）检测。
- **DeepRx** [23]：一种全卷积深度学习接收机，联合执行信道估计、均衡与检测，并直接输出检测结果。

对 (12) 所考虑的信号模型，本文把观测向量化为 $\mathbf y=\mathbf A\mathbf h+\mathbf n$，其中 $\mathbf y=\operatorname{vec}(\mathbf Y)$、$\mathbf h=\operatorname{vec}(\mathbf H)$、$\mathbf A=\mathbf X^{T}\odot\mathbf I$，$\odot$ 表示 Kronecker 积。后验推断时，通过只保留 $\mathbf X$ 中已知导频元素、把数据符号的未知元素置零来构造有效测量矩阵，使后验更新只由可用导频观测引导。由此，基线方案 [12]、[13] 所考虑的 MIMO 信道估计问题与本文的 OFDM 信道估计设置相对齐。

**表 II：训练的参数设置。**

| 参数 | 取值 |
|---|---|
| 批大小 | 64 |
| 优化器 | AdamW |
| 基础学习率 | 3e-4 |
| 学习率调度 | 带线性预热的余弦退火 |
| 预训练轮数 | 2000 |
| 后训练轮数 | 900 |
| 时间步 $T$ | 1000 |
| 导频间隔 $P$ | $\{1,2,4,8,16,32\}$ |
| Patch 尺寸 $(p_f,p_r)$ | $(8,8)$ |
| SNR | $-10\sim30$ dB |
| CDiT 结构 | $K_{\mathrm{layer}}=3$，$d=192$ |
| Diff-Rx 迭代次数 | $K=5$ |
| 扩散参数 | $\beta_1=0.0001$，$\beta_T=0.02$ |

### B. 基于导频的信道估计性能

本文首先在 UMi 与 RT 两类信道上评估 CDiT 的性能，模型在两个数据集上分别训练与测试，结果见正文图 4。所提 CDiT 模型表现出强导频适应性与噪声鲁棒性：在不同 SNR 水平与导频密度下，CDiT 一致优于基线方法。与 UMi 数据集相比，RT 数据集子载波间隔更大、训练样本更少，且包含更多样的多径类型与更多传播路径，使训练与泛化更具挑战性；尽管如此，CDiT 在该更难数据集上仍优于基线方法。SGM 与 DMPS 在导频密度较高时可取得良好性能，但当导频密度低于 1/8 时性能显著退化，说明二者对导频观测的完整性高度敏感，难以在稀疏导频下维持可靠的信道重建性能。此外这两类基线的性能对超参数设置敏感：在不同 SNR 水平、导频密度与数据集下，缩放系数必须谨慎且不同地选择才能达到最优性能，即使该参数轻微不匹配也会导致明显性能退化。图 4a 与 4b 中 SGM、DMPS 的曲线在高 SNR 条件下呈上升趋势，原因是本文为每个导频密度选取了近最优缩放系数，同时在不同 SNR 水平间保持该系数不变、未针对不同 SNR 进一步调参。与此同时，CDiT 不引入任何额外系数，从而避免因参数选择不当造成的性能退化。CMixer 使用固定导频图样，对噪声变化的鲁棒性有限：图 4 中 CMixer（w/o）以无噪声掩膜信道 $\mathbf H\otimes\mathbf M$ 为输入，在低 SNR 时退化；默认 CMixer 则使用原始含噪估计 $\tilde{\mathbf H}$，以牺牲高 SNR 精度为代价改善低 SNR 鲁棒性。

### C. Diff-Rx 的性能

本文在 RT 信道上评估 Diff-Rx 的信道估计与数据检测性能，结果见正文图 5。与图 5a、5b 中基线相比，Diff-Rx 通过在统一可训练框架内联合学习数据符号利用与信道估计进一步提升性能，从而更有效地利用导频观测与数据观测。相反，把可靠符号选择与信道估计分离的方法可能无法充分利用来自数据观测的信道信息。对 DA-LMMSE 而言，稀疏导频观测下初始信道估计不准确；在高 SNR 时错误虚拟导频被赋予极小的观测噪声方差，因而被 LMMSE 更新过度信任，导致性能随 SNR 升高而退化。

为评估 Diff-Rx 在不同调制下的泛化性，本文对预训练 CDiT 使用 16-QAM 星座的导频符号，并在后训练中使用 4-QAM、16-QAM 与 64-QAM 数据符号，结果见正文图 5c，其余训练参数与表 II 相同。由于预训练 CDiT 仅依赖导频符号做信道估计，改变数据符号调制对其性能影响很小，曲线几乎重合；相反 Diff-Rx 的性能随调制不同而变化，但始终优于仅基于导频观测的 CDiT。其性能随调制阶数升高而下降，因为星座间距减小使符号检测与信道信息提取更困难；尽管如此，Diff-Rx 仍保持明显性能增益，证实其改善源于**联合使用导频与数据符号**进行信道估计。

正文图 5d—5f 比较不同调制与导频密度下的 BER 性能。Diff-Rx 在所有考虑设置下一致优于基线方法。与 DeepRx 不同，Diff-Rx 显式地在信道估计与符号后验推断之间交替，从而保留接收机结构并减轻学习整个接收机过程的负担。与 CDiT、EM-CDiT 相比，Diff-Rx 可获得更准确的 CSI，从而改善检测性能。随着导频密度降低，愈发稀疏的导频观测限制了信道估计精度，使 CSI 误差成为与理想完美 CSI 基准之间剩余性能差距的主要来源。

本文在正文图 6 中比较 CDiT 与 Diff-Rx 在不同 SNR 与导频密度下的信道估计性能。经后训练后，Diff-Rx 在 $P\le8$ 时取得几乎相同的 NMSE、接近全导频性能，且在更稀疏的导频配置下仍有可观增益。Diff-Rx 相对基于导频的信道估计的优势证实数据符号提供了有用的辅助信道信息。

正文图 7 评估后训练轮数对信道估计的影响（$K=5$）：导频密度较高时模型仅需少量后训练轮数即收敛；即使在低导频密度下，所需后训练轮数仍然有限，且远小于预训练所用轮数。因此 Diff-Rx 支持对不同星座的低成本适配。

正文图 8 评估 Diff-Rx 迭代次数对信道估计的影响。$K=1$ 对应仅使用导频位置做信道估计；当 $P\le8$ 时，Diff-Rx 仅两次迭代后即几乎达到最佳 NMSE 性能；在更稀疏导频设置下，性能也在三次迭代后接近收敛，表明 Diff-Rx 能以很小的迭代代价取得显著信道估计增益。图 8b 的 BER 结果与 NMSE 结果趋势一致：BER 在前几次迭代内迅速下降，随后逐渐收敛，进一步验证 Diff-Rx 能有效耦合信道估计与符号检测，以低迭代复杂度同时改善 NMSE 与 BER。

表 III 在 $P=16$ 下比较所提软判决与记为 Diff-Rx-hard 的硬判决策略。硬判决方法的阈值记为 $m$：仅当某星座点的后验概率超过 $m$ 时，数据符号才被判定为该星座点。因此 $m=0$ 选择全部数据符号，而 $m=1$ 不选任何数据符号、退化为基于导频的信道估计。最优硬判决阈值与 SNR 和导频密度有关，而所提软策略无需阈值调参且取得一致更优的性能：在硬判决可靠性较低的低 SNR 下增益更明显，在高 SNR 下随后验概率变准而增益减小。$m=1$ 的 Diff-Rx-hard 仍优于预训练 CDiT，该改善主要来自不同的训练配置而非数据符号选择——Diff-Rx-hard 使用均匀间隔导频（索引为 $P_{\mathrm{start}}+wP$），而预训练 CDiT 以额外随机插入导频的方式训练以适应任意导频图样，意味着预训练 CDiT 必须适配更多导频图样；此外 Diff-Rx-hard 在后训练中训练了额外轮数。

尽管所提模型假设 SNR 已知，但实际系统中该值可能偏离真实值。因此本文考虑 $\pm3$ dB 内的 SNR 失配，结果见表 IV。表中左列表示接收机假设并使用的 SNR 值，"实际 SNR 失配"表示假设 SNR 相对实际 SNR 的偏差。此类失配同时影响 (26) 中的归一化幅度与后验概率计算：前者使归一化信道偏离训练分布，后者为软判决与伪信道估计引入误差。尽管如此，结果表明 Diff-Rx 在这些失配下保持稳定性能，对 SNR 失配表现出强鲁棒性。

**表 III：数据符号选择策略对 NMSE 性能的影响。**

| SNR (dB) | Diff-Rx（所提） | Diff-Rx-hard（$m=0$） | Diff-Rx-hard（$m=0.5$） | Diff-Rx-hard（$m=1$） | CDiT |
|---|---|---|---|---|---|
| −10 | **−8.31** | **−7.96** | −7.16 | −5.57 | −4.86 |
| −5 | **−12.56** | −11.88 | −11.93 | −8.49 | −7.89 |
| 0 | **−15.93** | −15.57 | −15.59 | −10.83 | −10.17 |
| 10 | −21.94 | −21.93 | **−21.95** | −14.45 | −13.46 |
| 20 | **−24.76** | −24.43 | −24.18 | −15.87 | −14.44 |

**表 IV：SNR 失配对 NMSE 性能的影响。**

| 假设 SNR (dB) | 失配 −3 dB | 失配 −2 dB | 失配 −1 dB | 失配 0 dB | 失配 +1 dB | 失配 +2 dB | 失配 +3 dB |
|---|---|---|---|---|---|---|---|
| −10 | −6.65 | −7.49 | −8.16 | −8.31 | −8.17 | −7.14 | −5.59 |
| 0 | −11.27 | −13.28 | −15.20 | −15.93 | −15.10 | −13.05 | −10.95 |
| 10 | −19.59 | −21.37 | −22.02 | −21.94 | −21.64 | −20.95 | −20.94 |
| 20 | −24.62 | −25.10 | −24.67 | −24.76 | −25.14 | −24.01 | −24.16 |

### D. 各方法的复杂度

不同方法的模型规模与 FLOPs 见表 V。与基线方法相比，所提 CDiT 网络在参数数量与计算代价两方面都保持可控的模型复杂度，同时取得更优性能。此外，通过采用**单步生成**策略，所提 CDiT 网络相比依赖大量迭代推理步骤的 SGM 与 DMPS 显著提升推理效率并大幅降低推理时延。

**表 V：不同方法的性能与复杂度比较。**

| 模型 | 参数数量 | 每次迭代 FLOPs | 推理步数 |
|---|---|---|---|
| CDiT | 3.02 M | 478.40 M | 1 |
| Diff-Rx | 3.02 M | 478.40 M | 5 |
| DMPS | 3.89 M | 635.10 M | 100 |
| SGM | 3.31 M | 7.41 G | 2311 |
| CMixer | 17.93 M | 591.46 M | 1 |
| DeepRx | 0.66 M | 10.90 G | 1 |

## VII. 结论

本文提出 Diff-Rx——一种面向 MIMO-OFDM 系统的、基于增量条件扩散的 AI 接收机。其核心思想是让接收机对**在迭代中不断演化的条件状态**做出响应。通过在迭代环内对仅基于导频训练的信道估计器做后训练，Diff-Rx 适应可靠性随迭代演化的数据派生观测，并有效利用其与导频观测的相关性。结合无阈值软判决反馈与面向低时延推理的单步生成，所提框架为联合信道估计与数据检测提供了一种高效且可解释的方法。

未来工作将进一步探索提升所提框架场景泛化性与适应性的方法，例如纳入邻域信息 [8]、数字孪生模型，以及使网络与无线环境之间能够交互与反馈的强化学习架构。尽管 Diff-Rx 可扩展到多流系统，但由此产生的流间干扰可能使发送符号的后验推断与数据辅助条件更新更具挑战性。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 36 条，源文 pp. 13–14）。

[1] S. Qaisar, R. M. Bilal, W. Iqbal, M. Naureen, and S. Lee, "Compressive sensing: From theory to applications, a survey," J. Commun. Netw., vol. 15, no. 5, pp. 443–456, 2013.

[2] P. Schniter and A. Sayeed, "Channel estimation and precoder design for millimeter-wave communications: The sparse way," in Proc. Asilomar Conf. Signals, Syst. Comput., 2014, pp. 273–277.

[3] J. Lee, G.-T. Gil, and Y. H. Lee, "Channel estimation via orthogonal matching pursuit for hybrid MIMO systems in millimeter wave communications," IEEE Trans. Commun., vol. 64, no. 6, pp. 2370–2386, 2016.

[4] L. Li, H. Chen, H.-H. Chang, and L. Liu, "Deep residual learning meets OFDM channel estimation," IEEE Wireless Commun. Lett., vol. 9, no. 5, pp. 615–618, 2019.

[5] Z. Chen, Z. Zhang, Z. Yang, and L. Liu, "Channel mapping based on interleaved learning with complex-domain MLP-mixer," IEEE Wireless Commun. Lett., vol. 13, no. 5, pp. 1369–1373, 2024.

[6] J. Gao, M. Hu, C. Zhong, G. Y. Li, and Z. Zhang, "An attention-aided deep learning framework for massive MIMO channel estimation," IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1823–1835, 2021.

[7] E. Balevi, A. Doshi, A. Jalal, A. Dimakis, and J. G. Andrews, "High dimensional channel estimation using deep generative networks," IEEE J. Sel. Areas Commun., vol. 39, no. 1, pp. 18–30, 2020.

[8] Z. Chen, Z. Zhang, Z. Yang, C. Huang, and M. Debbah, "Channel deduction: A new learning framework to acquire channel from outdated samples and coarse estimate," IEEE J. Sel. Areas Commun., 2025.

[9] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," arXiv preprint arXiv:2010.02502, 2020.

[10] X. Meng and Y. Kabashima, "Diffusion model based posterior sampling for noisy linear inverse problems," arXiv preprint arXiv:2211.12343, 2022.

[11] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, and J. C. Ye, "Diffusion posterior sampling for general noisy inverse problems," arXiv preprint arXiv:2209.14687, 2022.

[12] M. Arvinte and J. I. Tamir, "MIMO channel estimation using score-based generative models," IEEE Trans. Wireless Commun., vol. 22, no. 6, pp. 3698–3713, 2022.

[13] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Trans. Wireless Commun., 2025.

[14] M. A. Mohsin, A. Bilal, M. Umer, A. Aali, M. A. Jamshed, D. F. Hougen, and J. M. Cioffi, "Conditional prior-based non-stationary channel estimation using accelerated diffusion models," arXiv preprint arXiv:2509.15182, 2025.

[15] Y. Yang, S. Yan, W. Zhou, B. Mefgouda, R. Li, Z. Zhang, and M. Debbah, "Diffusion models for wireless transceivers: From pilot-efficient channel estimation to AI-native 6G receivers," arXiv preprint arXiv:2510.24495, 2025.

[16] T. Lee, J. Park, H. Kim, and J. G. Andrews, "Generating high dimensional user-specific wireless channels using diffusion models," IEEE Trans. Wireless Commun., 2025.

[17] M. Zhao, Z. Shi, and M. C. Reed, "Iterative turbo channel estimation for OFDM system over rapid dispersive fading channel," IEEE Trans. Wireless Commun., vol. 7, no. 8, pp. 3174–3184, 2008.

[18] S. Park, B. Shim, and J. W. Choi, "Iterative channel estimation using virtual pilot signals for MIMO-OFDM systems," IEEE Trans. Signal Process., vol. 63, no. 12, pp. 3032–3045, 2015.

[19] S. Park, J. W. Choi, J.-Y. Seol, and B. Shim, "Expectation-maximization-based channel estimation for multiuser MIMO systems," IEEE Trans. Commun., vol. 65, no. 6, pp. 2397–2410, 2017.

[20] S. Deka, K. Deka, N. T. Nguyen, S. Sharma, V. Bhatia, and N. Rajatheva, "Comprehensive review of deep unfolding techniques for next-generation wireless communication systems," IEEE Internet Things J., 2026.

[21] J. Yang, B. Ai, W. Chen, N. Wang, S. Yang, and C. Yuen, "Deep unfolding-based near-field channel estimation for 6G communications," IEEE Trans. Veh. Technol., 2025.

[22] Y. Yang, Z. Zhang, Z. Chen, Z. Yang, L. Liu, C. Huang, and M. Debbah, "A hybrid inference architecture incorporating neural network with belief propagation for AI receivers," IEEE Trans. Wireless Commun., 2025.

[23] M. Honkala, D. Korpi, and J. M. Huttunen, "DeepRx: Fully convolutional deep learning receiver," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 3925–3940, 2021.

[24] S. Cammerer, F. Aït Aoudia, J. Hoydis, A. Oeldemann, A. Roessler, T. Mayer, and A. Keller, "A neural receiver for 5G NR multi-user MIMO," in 2023 IEEE Globecom Workshops (GC Wkshps). IEEE, 2023, pp. 329–334.

[25] N. Zilberstein, A. Sabharwal, and S. Segarra, "Solving linear inverse problems using higher-order annealed langevin diffusion," IEEE Trans. Signal Process., vol. 72, pp. 492–505, 2024.

[26] C. Cai, W. Jiang, X. Yuan, and Y.-J. A. Zhang, "Joint activity detection and channel estimation for massive connectivity: Where message passing meets score-based generative priors," arXiv preprint arXiv:2506.00581, 2025.

[27] Y. Yang, O. Alhussein, A. Arani, Z. Zhang, and M. Debbah, "Generative diffusion receivers: Achieving pilot-efficient MIMO-OFDM communications," arXiv preprint arXiv:2506.18419, 2025.

[28] T. Li and K. He, "Back to basics: Let denoising generative models denoise," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2026, pp. 36 115–36 125.

[29] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," Adv. Neural Inf. Process. Syst. (NeurIPS), vol. 33, pp. 6840–6851, 2020.

[30] W. Peebles and S. Xie, "Scalable diffusion models with transformers," in Proc. IEEE/CVF Int. Conf. Comput. Vis. (ICCV), 2023, pp. 4195–4205.

[31] S. Yan, E. Goffinet, F. Gabellieri, R. Young, L. Gkoura, L. Jennings, F. Castiglione, and T. Launey, "DiffNMR3: Advancing NMR resolution beyond instrumental limits," arXiv preprint arXiv:2502.06845, 2025.

[32] C. Saharia, J. Ho, W. Chan, T. Salimans, D. J. Fleet, and M. Norouzi, "Image super-resolution via iterative refinement," IEEE Trans. Pattern Anal. Mach. Intell., vol. 45, no. 4, pp. 4713–4726, 2022.

[33] J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu, "RoFormer: Enhanced transformer with rotary position embedding," Neurocomputing, vol. 568, p. 127063, 2024.

[34] J. Hoydis, S. Cammerer, F. A. Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," arXiv preprint arXiv:2203.11854, 2022.

[35] C.-K. Wen, W.-T. Shih, and S. Jin, "Deep learning for massive MIMO CSI feedback," IEEE Wireless Commun. Lett., vol. 7, no. 5, pp. 748–751, 2018.

[36] I. Khan, M. Cheffena, and M. M. Hasan, "Data aided channel estimation for MIMO-OFDM wireless systems using reliable carriers," IEEE Access, vol. 11, pp. 47 836–47 847, 2023.

## 图注与表注

**表注：** 表 I 为 Sionna 数据集的参数设置（信道模型、场景、频率、阵列、$N_r$/$N_f$、路径数、BS 位置、UE 距离与速度）；表 II 为训练参数设置（批大小、优化器、学习率与调度、预训练/后训练轮数、时间步、导频间隔、patch 尺寸、SNR 范围、CDiT 结构、Diff-Rx 迭代次数、扩散参数）；表 III 为数据符号选择策略（软判决与三种硬判决阈值 $m=0,0.5,1$）对 NMSE 的影响，加粗表示该行最优值；表 IV 为 SNR 失配（$\pm3$ dB）对 NMSE 的影响；表 V 为各方法的参数数量、每次迭代 FLOPs 与推理步数比较。

**图 1：判决反馈利用方式的概念比较。** 直接复用仅在导频观测上训练的信道估计器，隐含假设检测出的数据符号正确并把它当作无误差虚拟导频。由于信道与符号估计误差未被建模、导频观测与数据观测未对齐，错误反馈可能导致有偏的信道估计。理想的估计器应缓解估计误差并对齐两个观测空间以精化信道。

**图 2：Diff-Rx 框架示意。** 预训练 CDiT 使用由伪信道信息更新的增量条件逐步精化信道估计；条件更新模块给出由式 (15)—(22) 描述的后验概率、软伪信道与新的条件 $\mathbf C^{(k+1)}$，迭代 $k$ 与 $k+1$ 之间共享同一噪声样本，条件更新路径施加停止梯度。

**图 3：所提出的 CDiT 架构。** 在时间步 $t$，给定导频位置处的信道估计与指示导频位置的掩膜 $\mathbf M$，网络对 $\mathbf H_t$ 去噪并估计原始无噪信道 $\mathbf H_0$。本文保留掩膜 $\mathbf M$ 以强调导频位置；输入张量经 patchify（二维卷积与重排）得到 $L=N_r/p_r\times N_f/p_f$ 个 $D$ 维 token，经 $K_{\mathrm{layer}}$ 个 CDiT 块（含带 RoPE 的 MHSA、带 RoPE 的交叉注意力与 FFN、AdaLN）输出 $\widehat{\mathbf H}_0$。

**图 4：仅基于导频观测的信道估计在 UMi 与 RT 信道上的比较（4-QAM）。** (a) UMi 信道，$P=16$；(b) RT 信道，$P=8$；(c) RT 信道在不同 $P$ 下，SNR $=10$ dB。图例：CDiT、LMMSE、DMPS、SGM、CMixer（w/o）、CMixer。

**图 5：Diff-Rx 在 RT 信道上的性能。** (a)—(c) 比较不同方法的信道估计性能；(d)—(f) 比较不同方法的检测性能。实验中 QAM 符号采用格雷映射。(a)、(b) 中数据符号取自 16-QAM；EM-CDiT 与 DA-LMMSE 的阈值为 0.5；(a)、(c) 中 $P=16$。(d) 16-QAM 且 $P=4$；(e) 16-QAM 且 $P=16$；(f) 64-QAM 且 $P=16$。图例含 Diff-Rx、CDiT、EM-CDiT、DeepRx、Perfect-CSI+ML。

**图 6：CDiT 与 Diff-Rx 的信道估计比较。** (a) CDiT 在不同 SNR 与 $P$ 下的性能；(b) Diff-Rx 在不同 SNR 与 $P$ 下的性能（图例 $P=1,2,4,8,16,32$）。

**图 7：不同后训练轮数下的信道估计性能（$K=5$）。**

**图 8：迭代次数对信道估计与检测性能的影响（SNR $=10$ dB）。** (a) 信道估计性能；(b) 检测性能（图例 $P=1,2,4,8,16,32$）。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.25923v1（eess.SP，2026-09-22）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言；第 II 节预备知识（DDPM、式 (1)—(10)）；第 III 节系统模型（式 (11)—(14)）；第 IV 节所提方法（A. 框架设计动机；B. Diff-Rx 框架：迭代信道估计、条件更新（式 15—22）、数据检测（式 23）；C. CDiT 信道估计框架：Patchify、条件嵌入、CDiT 块）；第 V 节训练与推理方法（A. 训练：数据预处理、CDiT 训练（式 24、随机掩膜、算法 1）、幅度对齐归一化（式 25—26）、Diff-Rx 训练（式 27—31、算法 2）；B. 推理：CDiT 推理、Diff-Rx 推理、算法 3）；第 VI 节数值结果（A. 实验细节与式 32、表 I—II、基线；B. 基于导频的信道估计性能；C. Diff-Rx 性能、表 III—IV；D. 复杂度、表 V）；第 VII 节结论；36 条英文参考文献；图 1—图 8 图注与表 I—表 V 表注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言开头）→ 第 2 页（引言续、贡献）→ 第 3 页（第 II 节、式 (1)—(8)、图 1）→ 第 4 页（式 (9)—(14)、第 III 节、图 2 说明）→ 第 5 页（第 IV 节、式 (15)—(22)）→ 第 6 页（图 2 与图 3、数据检测式 (23)、CDiT 框架）→ 第 7 页（第 V 节、式 (24)、算法 1、式 (25)—(28)）→ 第 8 页（算法 2、式 (29)—(31)、算法 3、推理方法）→ 第 9 页（表 I—II、V-B 实验细节与基线）→ 第 10 页（图 4、图 5 说明与基线续）→ 第 11 页（图 6、表 III—IV、V-B/V-C 分析）→ 第 12 页（图 7—8、表 V、V-C 续）→ 第 13 页（V-D、第 VII 节、参考文献 [1]—[25]）→ 第 14 页（参考文献 [26]—[36]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I—表 V 的全部条目/数值已按 PDF 第 9、11、12 页渲染图逐格核对（含表 III 加粗最优值、表 IV 失配矩阵、表 V 参数/FLOPs/步数），未改变任何数值。
2. 图 1—图 8 均未上传图片；本页在"图注与表注"小节统一给出 8 条中文图注与 5 条表注，正文按"正文图 N/表 N"引用。
3. 公式覆盖原文编号式 (1)—(32)，全部保留原编号；算法 1—3 按原文逐行/逐步译出（含 Require 与重复结构）。
4. **原文疑点／说明：** ①原文式 (16) 的软伪信道解与式 (17)、(18) 的 $\widehat x_{\mathrm{soft},i}^{(k)}$、$\xi_i^{(k)}$ 定义按原文顺序给出，量纲自洽；②原文式 (20) 的残差 $\boldsymbol\eta_i^{(k)}$ 含五项（信道误差、符号误差、噪声与两项修正），译文按原文结构逐项照录；③原文式 (26) 中 $P_x=\mathbb E[\lVert\mathbf x\rVert^{2}]$ 与文中"星座已归一化、近似 $P_x=1$"的说明照录；④原文表 III 的加粗最优值在提取文本中不可见，已按渲染图恢复加粗；⑤原文式 (31) 为独立编号的梯度表达式（非不等式），译文保留其编号形式。
5. 原文为 arXiv 预印本（eess.SP），未标注期刊信息；页面目录日期 2026-09-23 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-22）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
