---
layout: page
title: "DyRadio：动态无线电地图重建的时空扩散模型｜中文全文译文"
permalink: /papers/translations/2026-11-06-2611-01603-dyradio-spatiotemporal-diffusion-dynamic-radio-map/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2b04fba07f1a444c/) · [原文 arXiv](https://arxiv.org/abs/2611.01603/) · [全部目录](/papers/catalog/)

# DyRadio：动态无线电地图重建的时空扩散模型

**原题：** DyRadio: Spatiotemporal Diffusion for Dynamic Radio Map Reconstruction  
**作者：** Zhijie Fan、Zhifeng Zhao、Rongpeng Li。单位（按 PDF 首页脚注原文转写）：Z. Fan 与 R. Li 为浙江大学信息与电子工程学院（College of Information Science and Electronic Engineering, Zhejiang University，杭州 310027，中国；邮箱 {fanzhijie, lirongpeng}@zju.edu.cn）；Z. Zhao 为之江实验室（Zhejiang Lab，杭州 310012，中国），并同时隶属浙江大学信息与电子工程学院（杭州 310027，中国；邮箱 zhaozf@zhejianglab.org）。  
**版本：** arXiv:2611.01603v1（2026-11-01，cs.LG）；13 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要与关键词、正文第 I–V 节全部正文与小节（§I-A–I-C、§II-A–II-B、§III-A–III-C、§IV-A–IV-B 的 1)–6) 小节、§V 结论）、附录（评估指标 MSE/NMSE/PSNR/SSIM/平均噪声/MAE/相对偏差的定义）、式 (1)–(36) 编号（另含附录中未编号的指标公式）、算法 1–2（逐行）、表 I–VIII 逐格（Table I 的能力对比、Table II 记号、Table III 配置、Table IV 重建对比、Table V 噪声估计、Table VI 噪声输入影响、Table VII 消融、Table VIII 推理效率）、图 1–7 图注、参考文献 [1]–[35] 英文原条目；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

准确的无线电地图（radio map, RM）重建对环境感知无线网络至关重要。基于采样的方法从稀疏测量推断无线电条件，因不需要发射机配置的显式知识而被广泛采用。然而在动态环境中，时变的传播条件使 RM 不断演化，这使得从时间上分布的稀疏观测重建 RM 变得更加复杂。尽管跨帧观测提供了互补的空间信息，直接聚合它们会引入**时序状态失配（temporal state mismatch）**。此外，未知的测量噪声进一步增加重建难度。为应对这些挑战，我们提出 **DyRadio**——一个把时空 RM 重建与未知噪声估计整合于一体的框架。具体而言，一个**传播先验引导、噪声条件化的时空扩散模型（diffusion model, DM）**通过捕捉跨帧依赖关系联合重建连续多帧 RM，同时适应测量噪声水平。为估计噪声水平，一种**迭代预测似然（iterative predictive likelihood）**方法在基于 DM 的盲区预测与噪声水平更新之间交替；估计出的噪声水平随后为整段 RM 序列的重建提供条件。实验结果表明，该方法具有更优的重建精度与对测量噪声的稳健性，在所有评估设置下相较表现最好的基线，峰值信噪比（PSNR）提升 1.18–5.75 dB。

**关键词（Index Terms）：** 扩散模型（diffusion model）、测量噪声估计（measurement noise estimation）、无线电地图（radio map）、时空重建（spatiotemporal reconstruction）。

## I. 引言

下一代（xG）无线网络被期望把通信与智能、感知能力融合起来 [1], [2]，从而更好地理解周围物理环境及其对无线电传播的影响。数字孪生与环境感知无线智能的近期进展进一步凸显了准确刻画跨物理空间无线电条件的重要性 [3]–[5]。无线电地图（RM）刻画无线电量（例如接收信号强度）在目标区域内的空间分布，可服务于频谱管理 [6]、干扰感知的预测式通信 [7]，以及基于预期信号质量的主动切换 [8]。然而，多数已有文献聚焦于单帧 RM 重建 [9], [10]；随着车载、机器人与智能体应用 [7], [11], [12] 不断增多，人们对**动态 RM 重建**方法产生了强烈需求。

### A. 相关工作

传统 RM 重建通常依赖对实测数据的空间插值或基于物理的仿真 [13]。然而，径向基函数、样条 [14] 与 Kriging [15] 等空间插值技术在测量稀疏或传播条件复杂时重建精度会下降。同时，包括射线追踪 [16] 在内的基于物理的仿真方法往往带来可观的计算开销，在复杂且时变的环境中尤为明显。

这些局限促成了基于学习的 RM 重建方法。其中，**无采样（sampling-free）**方法依赖发射机的显式信息——包括已知的发射机（TX）位置与配置——以及环境信息来构建 RM。早期基于学习的方法，如 RadioUNet [17] 与 RadioNet [18]，采用卷积网络与 Transformer 架构，学习从发射机信息与环境布局到空间无线电场的确定性映射。更近期，生成式方法被引入以刻画确定性预测之外的复杂传播特性。RadioDiff [9] 通过使用扩散模型（DM）[19]，以无采样的方式生成高保真 RM；RadioDiff-\(k^2\) [10] 进一步引入电磁传播特性以改进多径建模。然而，所需信息（如发射机位置与传输配置）在实际部署中可能因隐私限制或非合作发射机而不可得。

另一方面，**基于采样（sampling-based）**的方法利用稀疏无线电测量，可减少对发射机显式信息的依赖。最初，基于学习的方法使用深度补全自编码器 [20] 或对抗学习 [21] 从稀疏观测估计 RM。DM 的近期进展进一步提升了在有限测量下恢复传播模式的能力。特别地，WiFi-Diffusion [22] 使用 DM 生成多个候选 RM，并通过传播引导的评估机制选出最终重建结果，从而在极低采样率下实现准确的 RM 重建。物理信息重建方法，如 PhyRMDM [23]，进一步引入电磁约束以提升重建 RM 与传播特性的一致性。RadioDiff-Inverse [24] 把从含噪稀疏测量重建 RM 表述为贝叶斯逆问题，利用基于 DM 的先验在不完整环境信息下恢复 RM。尽管这些方法在稀疏 RM 重建上取得了实质进展，它们主要考虑**单帧** RM 重建，并未显式利用连续演化环境中时间分布观测之间的依赖关系。

在动态无线环境中，随着传播条件演化，RM 随时间变化；因此先前构建的 RM 可能过时，这促使人们研究动态 RM 重建方法。RadioMapMotion [25] 采用 ConvLSTM 从历史**完整** RM 预测未来的 RM 序列。然而，在每个时刻获取稠密测量会带来可观开销，实际只剩下稀疏观测。RadioProphet [26] 进一步研究如何通过边缘侧单帧重建与云侧预测模型的协同，从历史稀疏观测预测未来 RM。用稀疏观测更新变化中的 RM 对于反映动态无线电条件至关重要。然而，现有预测方法主要融合历史 RM 特征进行预测，仍遗留一个挑战：如何在保持各帧不同传播状态的同时，利用跨帧的互补观测。

**图 1（原文 Fig. 1）：** 动态 RM 重建中的时序状态失配示意。（图中左侧为三帧稀疏观测与对应的参考 RM 序列；把这些观测直接做「时序池化（temporal pooling）」合并成混合观测后送入 RM 重建模型（PhyRMDM 基线），目标为第 3 帧；由于不同帧的传播条件不同，混池后的观测与第 3 帧的参考 RM 不匹配，重建结果在移动车辆附近出现传播图样畸变，即「失配效应（Mismatch Effect）」。）

这里，我们展示在城市交通场景中从时间上分布的稀疏观测联合重建一段动态 RM 序列。具体而言，移动车辆改变了信号的遮挡、反射与多径传播，导致 RM 取值随时间变化。图 1 展示了 PhyRMDM [23] 中通过直接时序池化得到的 RM 重建结果，其中只使用了建筑布局与时变车辆配置，未考虑发射机的显式信息。可以看到，直接把不同帧的观测合并起来忽略了传播条件的变化，由此产生的时序状态失配会在移动车辆附近造成传播图样畸变，我们称之为**时序状态失配**。

除时序状态失配外，观测噪声对时空 RM 重建构成额外挑战。在动态环境中，观测噪声与传播条件的变化都会引起观测 RM 的变化；当每个时刻只有稀疏观测时，区分这两种效应变得困难。已有的概率方法（如 RadioDiff-Inverse [24]）用由假定已知噪声方差参数化的似然模型来处理测量噪声，但实际噪声水平往往未知。重建误差也会造成观测与预测 RM 之间的差异，使噪声水平估计复杂化。因此，在考虑预测不确定性的同时估计未知噪声水平，对后续的噪声条件化时空 RM 重建十分重要。

### B. 贡献

为应对这些挑战，我们提出 DyRadio，一个带未知测量噪声估计的动态 RM 重建框架。在来自 U-Net [27] 的传播先验特征引导下，我们开发了一个基于扩散 Transformer（Diffusion Transformer, DiT）架构 [28] 的时空 DM。通过三维块嵌入（3D patch embedding）与时空自注意力，DiT 捕捉空间结构与跨帧依赖关系以联合重建 RM，同时缓解时序失配。受已有研究 [29], [30] 启发，我们引入一个**噪声水平调制的交叉注意力模块**，把稀疏 RM 观测整合进生成过程；通过注入测量噪声水平，所提 DM 能适应不同的噪声条件。此外，由于测量噪声水平在实践中通常未知，我们提出一种基于**盲区预测似然**的迭代方法，在「用所提 DM 重建部分 RM」与「估计并更新噪声水平」之间交替。这使得无需完整 RM 即可从稀疏观测估计噪声水平，而估计出的噪声水平随后用于条件化所提 DM 以重建完整 RM 序列。表 I 归纳了关键差异，本文的主要贡献总结如下：

- 我们把从稀疏观测出发的动态 RM 重建表述为一个时空重建问题。为在利用跨帧互补信息的同时处理时序状态失配，我们提出传播引导且噪声条件化的时空 DM；此外采用噪声调制的交叉注意力模块，以增强不同噪声条件下的重建稳健性。
- 我们开发了一种迭代预测似然方法，从稀疏观测估计未知的测量噪声水平。利用所提 DM 学到的 RM 先验，该方法交替地细化盲区 RM 预测与更新噪声估计，无需完整 RM，也不需要额外的估计网络。所得估计给出了观测不确定性的度量，使 RM 重建能在不同噪声条件下自适应地进行。
- 为验证所提框架，我们使用 CARLA [31] 与 Sionna RT [16] 构建了一个动态城市交通 RM 数据集，可实现真实的车辆运动与时变无线电传播。跨不同采样率与噪声水平的大量实验表明，DyRadio 优于现有 RM 重建方法 [9], [17], [23], [25]，相较最强基线取得 1.18–5.75 dB 的 PSNR 提升。

**表 I：与无线电地图建模代表性研究的对比。**

| 代表性研究 | 基于学习 | 基于扩散 | 无需 TX 推理 | 时序建模 | 动态 RM 重建 | 噪声自适应重建 | 简要描述 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| [14]–[16] | ○ | ○ | ◐ | ○ | ○ | ○ | 稀疏采样下精度有限；仿真开销高 |
| [17], [18], [20], [21] | ● | ○ | ◐ | ○ | ○ | ○ | 无扩散式生成，重建保真度有限 |
| [9], [10] | ● | ● | ○ | ○ | ○ | ○ | 需要发射机的显式信息 |
| [22]–[24] | ● | ● | ◐ | ○ | ○ | ◐ | 无法建模时序动态 |
| [25], [26] | ● | ○ | ● | ● | ○ | ○ | 侧重历史驱动的预测，而非稀疏观测重建 |
| 本文 | ● | ● | ● | ● | ● | ● | 从稀疏观测联合重建动态 RM 序列，同时处理时序失配并估计未知测量噪声水平 |

注：○ 未包含；● 完全支持；◐ 部分支持。

### C. 论文结构

本文其余部分组织如下：第 II 节先介绍扩散模型预备知识，并对动态 RM 重建问题进行建模；第 III 节给出所提时空 DM 与迭代噪声估计方法；第 IV 节给出大量实验结果，以展示 DyRadio 的重建优势并评估噪声估计的精度；最后第 V 节总结全文。

## II. 预备知识与问题建模

本节先介绍扩散建模的预备知识，然后在未知测量噪声下对动态 RM 重建问题进行建模。

### A. 扩散模型预备知识

扩散模型通过一系列前向加噪与反向去噪过程学习生成数据 [19]。前向过程逐步向干净样本加入高斯噪声，而学到的反向过程从高斯噪声出发恢复数据。对条件生成而言，反向过程还利用可用信息 \(c\) 从 \(p_\theta(z_0\mid c)\) 生成样本，其中 \(z_0\) 表示干净数据样本 [32]。该条件在训练与采样阶段都被提供给去噪网络。

从 \(z_0\) 出发，前向过程通过马尔可夫链逐步加入高斯噪声，得到含噪样本 \(z_\tau\)：

$$
q(z_\tau\mid z_{\tau-1})=\mathcal N\bigl(\sqrt{\alpha_\tau}z_{\tau-1},\ \beta_\tau\mathbf I\bigr),\tag{1}
$$

其中 \(\tau\in\{1,\dots,T\}\)，\(\beta_\tau\) 是预设的噪声方差，且 \(\alpha_\tau=1-\beta_\tau\)。定义 \(\bar\alpha_\tau=\prod_{j=1}^{\tau}\alpha_j\) 与 \(\bar\alpha_0=1\)，则任意步的含噪样本可直接由 \(z_0\) 得到：

$$
z_\tau=\sqrt{\bar\alpha_\tau}\,z_0+\sqrt{1-\bar\alpha_\tau}\,\epsilon,\qquad \epsilon\sim\mathcal N(0,\mathbf I).\tag{2}
$$

当 \(\bar\alpha_\tau\) 充分接近零时，终端分布近似为标准高斯。

生成需要反向转移 \(q(z_{\tau-1}\mid z_\tau,c)\)，它依赖未知的条件数据分布。然而训练时可获得干净样本 \(z_0\)，额外以该样本为条件即可得到可处理的高斯后验。由于给定 \(z_0\) 时前向过程与 \(c\) 无关，对 \(\tau\ge 2\) 有

$$
q(z_{\tau-1}\mid z_\tau,z_0)=\frac{q(z_\tau\mid z_{\tau-1})\,q(z_{\tau-1}\mid z_0)}{q(z_\tau\mid z_0)}=\mathcal N\bigl(z_{\tau-1};\tilde\mu_\tau,\tilde\beta_\tau\mathbf I\bigr),\tag{3}
$$

其中 \(\tilde\mu_\tau\) 是后验均值，\(\tilde\beta_\tau=\beta_\tau(1-\bar\alpha_{\tau-1})/(1-\bar\alpha_\tau)\)。

遵循去噪扩散概率模型（denoising diffusion probabilistic model, DDPM）的表述，学到的反向转移被建模为均值为 \(\mu_\theta(z_\tau,\tau,c)\)、协方差为固定调度 \(\Sigma_\tau\) 的高斯。利用式 (2) 并把所加噪声 \(\epsilon\) 替换为神经网络预测 \(\epsilon_\theta(z_\tau,\tau,c)\)，反向过程均值 \(\mu_\theta\) 可写为

$$
\mu_\theta(z_\tau,\tau,c)=\frac{1}{\sqrt{\alpha_\tau}}\left(z_\tau-\frac{\beta_\tau}{\sqrt{1-\bar\alpha_\tau}}\epsilon_\theta(z_\tau,\tau,c)\right).\tag{4}
$$

在该参数化下，变分训练目标的中间项化为加权噪声预测误差。常用的简化目标省略了步相关的权重：

$$
\mathcal L_{\mathrm{diff}}=\mathbb E_{(z_0,c),\tau,\epsilon}\Bigl[\bigl\|\epsilon-\epsilon_\theta(z_\tau,\tau,c)\bigr\|_2^2\Bigr],\tag{5}
$$

其中 \((z_0,c)\) 抽自训练数据，\(\tau\) 由 \(\{1,\dots,T\}\) 均匀采样。因此网络学习在不同扩散步上、同时利用含噪样本与条件信息来估计所加入的噪声。

标准 DDPM 采样需要遍历全部扩散步，计算开销可观。去噪扩散隐式模型（denoising diffusion implicit model, DDIM）[33] 通过在选定的扩散步子序列上去噪来实现加速采样。在确定性 DDIM 采样中，预测噪声先通过重整式 (2) 给出对干净样本的估计：

$$
\hat z_0^{(\tau_1)}=\frac{z_{\tau_1}-\sqrt{1-\bar\alpha_{\tau_1}}\,\epsilon_\theta(z_{\tau_1},\tau_1,c)}{\sqrt{\bar\alpha_{\tau_1}}}.\tag{6}
$$

随后按下一个选定步的噪声水平把干净样本估计与预测噪声组合起来，其中 \(\tau_2<\tau_1\) 表示下一个选定步：

$$
z_{\tau_2}=\sqrt{\bar\alpha_{\tau_2}}\,\hat z_0^{(\tau_1)}+\sqrt{1-\bar\alpha_{\tau_2}}\,\epsilon_\theta(z_{\tau_1},\tau_1,c).\tag{7}
$$

与随机 DDPM 采样不同，确定性 DDIM 在反向更新中不引入额外随机噪声。因此采样轨迹完全由初始高斯样本与条件 \(c\) 决定。

**表 II：关键记号汇总。**

| 符号 | 定义 |
|---|---|
| \(\mathbf x_t,\ \mathbf X\) | 时刻 \(t\) 的 RM 与完整 RM 序列。 |
| \(T,\ L\) | 完整序列长度与每个被重建子序列的长度。 |
| \(\mathbf X_{1:L},\ \mathbf X^{(\tau)}_{1:L}\) | 干净 RM 子序列及其在第 \(\tau\) 步的含噪扩散状态。 |
| \(\mathbf A_t,\ \mathbf A\) | 时刻 \(t\) 的采样矩阵与采样矩阵的集合。 |
| \(\mathbf y_t,\ \mathcal Y\) | 时刻 \(t\) 的稀疏测量及其沿序列的集合。 |
| \(\mathbf B,\ \mathbf V_t,\ \mathcal C\) | 建筑布局、时刻 \(t\) 的车辆配置与场景信息。 |
| \(p\) | 每个时刻的 RM 采样率。 |
| \(\sigma_{\mathrm{obs}},\ \hat\sigma_{\mathrm{obs}}\) | 测量噪声标准差及其最终估计。 |
| \(\tau,\ \epsilon\) | 扩散步与高斯扩散噪声。 |
| \(\alpha_\tau,\ \beta_\tau\) | 第 \(\tau\) 步的扩散系数与噪声方差。 |
| \(U_\phi,\ D_\theta\) | 第一阶段 U-Net 与第二阶段噪声条件化 DiT。 |
| \(\widetilde{\mathbf X}_{1:L},\ \mathcal F\) | 第一阶段给出的辅助 RM 预测与传播特征。 |
| \(e_\tau,\ e_\sigma\) | 扩散步与测量噪声水平的嵌入。 |
| \(\Omega_{\mathrm{sam}},\ \Omega^{(k)}_{\mathrm{sam}}\) | 已观测位置，以及其中被划归第 \(k\) 个盲区的位置。 |
| \(\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}}\) | 排除第 \(k\) 个盲区后的观测。 |
| \(K,\ S\) | 盲区个数与每个盲区的蒙特卡洛样本数。 |
| \(r,\ \omega\) | 噪声估计迭代序号与时空位置索引。 |
| \(\hat\mu^{(r,k)}_\omega,\ \hat v^{(r,k)}_\omega\) | 预测均值与方差的蒙特卡洛估计。 |
| \(\sigma^{(r)}_{\mathrm{obs}},\ \widetilde\sigma^{(r+1)}_{\mathrm{obs}}\) | 当前噪声估计，以及由似然优化得到的候选估计。 |
| \(\eta\) | 迭代噪声估计的松弛参数。 |
| \(\delta,\ R_{\max}\) | 收敛容差与噪声估计的最大迭代次数。 |

### B. 问题建模

考虑一个动态无线传播环境，其空间区域被离散为 \(H\times W\) 个格点。令 \(\mathbf x_t\in\mathbb R^{HW}\) 表示时刻 \(t\) 的向量化 RM，代表无线电传播量的空间分布。\(T\) 个连续时刻上的完整 RM 序列记为 \(\mathbf X=\{\mathbf x_1,\mathbf x_2,\dots,\mathbf x_T\}\)。随着传播环境演化，相邻无线电地图呈现出既彼此不同、又在时间上相关的传播状态。

在无线系统中，每个时刻只能在有限数量的空间位置上获得无线电测量。令 \(\mathbf A_t\in\{0,1\}^{m_t\times HW}\) 表示在采样率 \(p\) 下从 \(\mathbf x_t\) 中选出 \(m_t\) 个观测位置的采样矩阵。获得的测量建模为

$$
\mathbf y_t=\mathbf A_t\mathbf x_t+\mathbf n_t,\qquad \mathbf n_t\sim\mathcal N\bigl(0,\sigma_{\mathrm{obs}}^2\mathbf I_{m_t}\bigr),\tag{8}
$$

其中 \(\mathbf y_t\in\mathbb R^{m_t}\) 包含观测值，\(\sigma_{\mathrm{obs}}\) 表示测量噪声的标准差。

我们的目标是从时间上分布的稀疏测量与环境信息重建完整 RM 序列 \(\mathbf X\)。在给定测量噪声水平 \(\sigma_{\mathrm{obs}}\) 时，重建目标表述为

$$
\max_{\mathbf X}\ p(\mathbf X\mid\mathcal Y,\mathbf A,\mathcal C,\sigma_{\mathrm{obs}}),\tag{9}
$$

其中 \(\mathcal Y=\{\mathbf y_t\}_{t=1}^{T}\)、\(\mathbf A=\{\mathbf A_t\}_{t=1}^{T}\) 分别表示测量与采样算子。环境信息 \(\mathcal C=\{\mathbf B,\mathbf V_1,\dots,\mathbf V_T\}\) 由静态建筑布局 \(\mathbf B\) 与车辆配置 \(\mathbf V_t\) 组成。联合重建在考虑演化传播状态的同时利用跨时间的互补测量。

然而，测量噪声水平 \(\sigma_{\mathrm{obs}}\) 在实践中通常未知，尽管它对逆问题中的重建十分重要 [30], [34]。我们把噪声水平估计表述为最大化其后验概率：

$$
\max_{\sigma_{\mathrm{obs}}\ge 0}\ p(\sigma_{\mathrm{obs}}\mid\mathcal Y,\mathbf A,\mathcal C).\tag{10}
$$

由于 \(\mathbf X\) 的 RM 重建与噪声水平 \(\sigma_{\mathrm{obs}}\) 的估计都是未知的，二者的推断通过联合后验耦合在一起：

$$
p(\mathbf X,\sigma_{\mathrm{obs}}\mid\mathcal Y,\mathbf A,\mathcal C)=p(\mathbf X\mid\mathcal Y,\mathbf A,\mathcal C,\sigma_{\mathrm{obs}})\,p(\sigma_{\mathrm{obs}}\mid\mathcal Y,\mathbf A,\mathcal C).\tag{11}
$$

我们通过开发一个噪声条件化时空 DM 来处理这种耦合：其预测分布同时被用于估计未知的测量噪声水平，所得估计随后为式 (9) 中整段 \(T\) 帧 RM 序列的重建提供条件。

## III. 所提方法

### A. 框架概览

DyRadio 从场景信息与稀疏含噪观测重建完整的 \(T\) 帧 RM 序列。为限制同时处理全部 \(T\) 帧的计算开销，它以每次一个 \(L\) 帧子序列的方式逐步重建整个序列。图 2 展示了整体框架，它由噪声估计与 RM 重建两部分组成。

**图 2（原文 Fig. 2）：** 所提噪声估计与时空 RM 重建框架总览。（图中：输入为场景布局 \(\mathbf B,\mathbf V_{1:L}\) 与稀疏 RM 序列 \(\mathcal Y_{1:L}\)；01 迭代噪声估计：由 RM 估计与噪声更新交替进行，初始噪声估计 \(\sigma^{(0)}_{\mathrm{obs}}\) 经若干次交替更新得到 \(\hat\sigma^{(r+1)}_{\mathrm{obs}}\)，再作为噪声水平 \(\hat\sigma_{\mathrm{obs}}\) 输出；02 两阶段 RM 重建：第一阶段「传播先验提取」给出先验特征 \(\mathcal F\)，第二阶段「时空扩散」以 \(\mathbf X^{(\tau)}_{t:t+L-1}\) 为输入，输出完整 RM 序列 \(\mathbf X_{1:L},\mathbf X_{L+1:2L},\dots\)。）

遵循先验引导的 DM 设计 [22], [23]，我们采用两阶段架构，用传播先验引导扩散重建——这里先假定测量噪声 \(\sigma_{\mathrm{obs}}\) 已知。第一阶段用 U-Net 预测粗略 RM，并从最后的解码器层提取与传播相关的特征；第二阶段采用噪声条件化时空 DiT，利用这些特征、三维块嵌入与时空自注意力联合重建每个子序列。该设计在利用跨帧互补观测的同时处理时序状态失配。此外，测量噪声水平调制观测交叉注意力，以调节稀疏观测的贡献。

为估计测量噪声 \(\sigma_{\mathrm{obs}}\)，我们进一步采用迭代的盲区预测似然方法。该方法在「用预训练 DM 做盲区 RM 预测」与「用预测似然更新噪声估计」之间交替，并考虑预测不确定性。假定整段 \(T\) 帧序列共享同一噪声水平，最终估计 \(\hat\sigma_{\mathrm{obs}}\) 为后续所有 \(L\) 帧子序列的重建提供条件。

### B. 噪声条件化时空 DM

图 3 展示了所提两阶段 DM 的架构。我们先描述第一阶段的传播引导特征提取，再给出第二阶段的噪声条件化时空重建。

**图 3（原文 Fig. 3）：** 用于动态 RM 重建的噪声条件化时空 DM 架构。（图中：输入条件包括建筑布局 \(\mathbf B\)、车辆布局 \(\mathbf V_{1:L}\)、稀疏 RM \(\mathcal Y_{1:L}\)、含噪帧 \(\mathbf X^{(\tau)}_{1:L}\)、噪声水平 \(\sigma_{\mathrm{obs}}\) 与扩散步 \(\tau\)；第一阶段「传播引导特征提取」由编码器、中间层与解码器组成，输出辅助 RM 预测 \(\widetilde{\mathbf X}_{1:L}\) 并抽取特征 \(\mathcal F\)；第二阶段「时空扩散重建」把 \(\mathbf X^{(\tau)}_{1:L},\mathbf B,\mathbf V_{1:L}\) 经生成嵌入得到生成 token \(\mathbf H_g\)，把 \(\mathcal Y_{1:L}\) 经观测嵌入得到观测 token \(\mathbf H_{\mathrm{obs}}\)，把 \(\sigma_{\mathrm{obs}},\tau\) 经噪声与步嵌入得到 \(e_\sigma,e_\tau\)，送入 DiT 输出 \(\mathbf X^{(\tau-1)}_{1:L}\)；DiT 细节包括 token 融合（\(\mathcal F\to g\to\) Sigmoid 作用于 \(\mathbf H_g\) 得 \(\mathbf H_g^+\)，\(\mathbf H_{\mathrm{obs}}\) 提供 K/V，交叉注意力由 \(g_\sigma\) 门控）、\(N\) 个 DiT 块（自适应归一化 + 自注意力 + 自适应归一化 + FFN，由 \(e_\tau\) 调制）以及跨 token 交互（对 Frame 1…Frame L 的输入 token 做时空注意力得到更新后的 token）。）

**1) 第一阶段：传播引导特征提取。** 第一阶段通过辅助 RM 预测学习传播先验特征。基于 U-Net 的模型 \(U_\phi\) 以场景信息与稀疏 RM 观测为输入，产生辅助 RM 预测 \(\widetilde{\mathbf X}_{1:L}\) 与传播先验特征 \(\mathcal F\)：

$$
(\widetilde{\mathbf X}_{1:L},\mathcal F)=U_\phi\bigl(\mathcal C_{1:L},\mathcal Y_{1:L}\bigr).\tag{12}
$$

这里 \(\mathcal F\) 收集从 \(U_\phi\) 倒数第二与倒数第三个解码器层提取的特征图，分辨率分别为 \(64\times 64\) 与 \(32\times 32\)。这些特征随后被送入第二阶段，用于引导时空 RM 重建。

辅助 RM 预测由覆盖所有空间位置与帧的均方误差（mean squared error, MSE）损失监督：

$$
\mathcal L_{\mathrm{MSE}}=\frac{1}{LHW}\sum_{l=1}^{L}\sum_{i=1}^{HW}\bigl(\tilde x_{l,i}-x_{l,i}\bigr)^2,\tag{13}
$$

其中 \(\tilde x_{l,i}\) 与 \(x_{l,i}\) 分别表示第 \(l\) 帧中位置 \(i\) 处的预测与真值 RM 取值。

障碍物位置指示传播遮挡，而发射机位置为学习源相关的空间图样提供监督。我们通过位置特定的损失把这些传播先验纳入辅助 RM 预测，同时不要求把发射机位置作为推理输入：

$$
\mathcal L_{\mathrm{occ}}=\frac{1}{N_{\mathrm{occ}}}\sum_{l=1}^{L}\sum_{i\in\Omega_{\mathrm{occ},l}}\bigl(\tilde x_{l,i}-u_{\mathrm{occ}}\bigr)^2,\tag{14}
$$

$$
\mathcal L_{\mathrm{src}}=\frac{1}{N_{\mathrm{src}}}\sum_{l=1}^{L}\sum_{i\in\Omega_{\mathrm{src},l}}\bigl(\tilde x_{l,i}-u_{\mathrm{src}}\bigr)^2,\tag{15}
$$

其中 \(\Omega_{\mathrm{occ},l}\) 与 \(\Omega_{\mathrm{src},l}\) 分别表示第 \(l\) 帧中的障碍物位置与发射机位置，\(N_{\mathrm{occ}}\) 与 \(N_{\mathrm{src}}\) 是 \(L\) 帧上对应的位置总数，\(u_{\mathrm{occ}}\) 与 \(u_{\mathrm{src}}\) 表示对障碍物与发射机位置预设的固定 RM 目标值。发射机位置只在训练时用于计算 \(\mathcal L_{\mathrm{src}}\)。

障碍物损失与源损失通过引入场景相关的传播先验，补充了全局 MSE 监督。整体辅助目标为

$$
\mathcal L_{\mathrm{aux}}=\lambda_{\mathrm{MSE}}\mathcal L_{\mathrm{MSE}}+\lambda_{\mathrm{occ}}\mathcal L_{\mathrm{occ}}+\lambda_{\mathrm{src}}\mathcal L_{\mathrm{src}},\tag{16}
$$

其中 \(\lambda_{\mathrm{MSE}}\)、\(\lambda_{\mathrm{occ}}\)、\(\lambda_{\mathrm{src}}\) 是相应的损失权重。

**2) 第二阶段：时空扩散重建。** 遵循第 II-A 节引入的噪声预测表述，第二阶段采用噪声条件化 DiT \(D_\theta\)，从含噪的 \(L\) 帧 RM 子序列及其条件信息预测扩散噪声：

$$
\hat\epsilon=D_\theta\bigl(\mathbf X^{(\tau)}_{1:L},\tau,\mathcal C_{1:L},\mathcal Y_{1:L},\sigma_{\mathrm{obs}},\mathcal F\bigr).\tag{17}
$$

这里第 II-A 节引入的条件信息 \(c\) 由场景信息 \(\mathcal C_{1:L}\)、稀疏 RM 观测 \(\mathcal Y_{1:L}\)、测量噪声水平 \(\sigma_{\mathrm{obs}}\) 与传播先验特征 \(\mathcal F\) 组成。推理时，反向 DDIM 采样从高斯噪声出发，利用每一步预测的扩散噪声恢复干净 RM 子序列。

在所提模型 \(D_\theta\) 中，含噪扩散状态 \(\mathbf X^{(\tau)}_{1:L}\) 与场景信息 \(\mathcal C_{1:L}\) 被编码为生成 token \(\mathbf H_g\)；同时，稀疏 RM 观测 \(\mathcal Y_{1:L}\) 通过三维块嵌入被编码为观测 token \(\mathbf H_{\mathrm{obs}}\)。为用传播先验引导生成，我们通过乘性特征引导把第一阶段提取的特征 \(\mathcal F\) 融合进生成特征：

$$
\mathbf H_g^{+}=\mathbf H_g\odot\mathrm{Sigmoid}\bigl(g(\mathcal F)\bigr),\tag{18}
$$

其中 \(\mathbf H_g^{+}\) 表示融合后的生成特征，\(g(\cdot)\) 通过把 \(\mathcal F\) 上采样到 \(\mathbf H_g^{+}\) 的 \(128\times 128\) 空间分辨率来匹配二者的通道维数。

为把测量噪声信息纳入 DiT，我们为测量噪声水平 \(\sigma_{\mathrm{obs}}\) 设置专门的调节路径。其嵌入计算为

$$
e_\sigma=\mathrm{MLP}_\sigma\left(\frac{\sigma_{\mathrm{obs}}}{\sigma_{\mathrm{ref}}}\right),\tag{19}
$$

其中 \(\sigma_{\mathrm{ref}}\) 是固定归一化常数，\(\mathrm{MLP}_\sigma\) 是可学习的嵌入网络。

测量噪声水平嵌入 \(e_\sigma\) 通过把观测交叉注意力模块的层归一化替换为噪声条件化自适应层归一化，注入该模块：

$$
\begin{aligned}
\widehat{\mathbf H}_g^{+}&=\mathrm{AdaLN}\bigl(\mathbf H_g^{+},e_\sigma\bigr)\\
&=\bigl(1+\gamma(e_\sigma)\bigr)\odot\mathrm{LN}\bigl(\mathbf H_g^{+}\bigr)+\beta(e_\sigma),
\end{aligned}\tag{20}
$$

其中 \(\mathrm{LN}(\cdot)\) 表示层归一化，\(\widehat{\mathbf H}_g^{+}\) 表示用于观测交叉注意力算子 \(\mathrm{CrossAttn}\) 的生成特征，\(\gamma\) 与 \(\beta\) 是用于逐特征缩放与平移的可学习投影。噪声水平嵌入还进一步控制注入生成 token 的观测残差的门控：

$$
\mathbf H_{\mathrm{out}}=\mathbf H_g^{+}+g_\sigma(e_\sigma)\odot\mathrm{CrossAttn}\Bigl(\mathbf Q(\widehat{\mathbf H}_g^{+}),\ \mathbf K(\mathbf H_{\mathrm{obs}}),\ \mathbf V(\mathbf H_{\mathrm{obs}})\Bigr),\tag{21}
$$

其中 \(g_\sigma(\cdot)\) 表示可学习的门控函数，\(\mathbf Q(\cdot)\)、\(\mathbf K(\cdot)\)、\(\mathbf V(\cdot)\) 分别表示查询、键与值投影。噪声条件化的生成特征 \(\widehat{\mathbf H}_g^{+}\) 提供查询，观测特征 \(\mathbf H_{\mathrm{obs}}\) 提供键与值，使生成 token 能够检索与当前生成状态相关的观测信息；同时，噪声水平嵌入 \(e_\sigma\) 调制查询特征，\(g_\sigma(e_\sigma)\) 在融合前对所得观测残差进行门控。

融合后的生成特征 \(\mathbf H_{\mathrm{out}}\) 随后由 \(N\) 个 DiT 块组成的堆栈处理，通过时空自注意力与前馈网络（feed-forward network, FFN）产生最终的预测扩散噪声 \(\hat\epsilon\)。为适应不同扩散步，每个 DiT 块把扩散时间步 \(\tau\) 编码为嵌入 \(e_\tau\)：

$$
e_\tau=\mathrm{MLP}_\tau\bigl(\mathrm{PE}(\tau)\bigr),\tag{22}
$$

其中 \(\mathrm{PE}(\cdot)\) 表示扩散步编码。采用与式 (20) 中噪声条件化 AdaLN 相同的机制，\(e_\tau\) 按当前去噪步调制每个 DiT 块中的自适应层归一化。

遵循式 (5) 的噪声预测目标，我们使用相同的损失，并以因子 \(\frac{1}{LHW}\) 对所有空间位置与帧上的预测误差做归一化：

$$
\mathcal L_{\mathrm{diff}}=\mathbb E_{\tau,\epsilon}\left[\frac{1}{LHW}\bigl\|\epsilon-\hat\epsilon\bigr\|_2^2\right].\tag{23}
$$

为提高采样位置处的重建精度，我们对预测出的干净 RM 序列引入**观测对齐损失**。根据式 (6)，扩散步 \(\tau\) 处的干净 RM 估计为

$$
\hat{\mathbf X}^{(0)}_{1:L}=\frac{\mathbf X^{(\tau)}_{1:L}-\sqrt{1-\bar\alpha_\tau}\,\hat\epsilon}{\sqrt{\bar\alpha_\tau}}.\tag{24}
$$

于是观测对齐损失定义为

$$
\mathcal L_{\mathrm{align}}=\mathbb E_{\tau,\epsilon}\left[\frac{1}{N_{\mathrm{sam}}}\sum_{l=1}^{L}\sum_{i\in\Omega_{\mathrm{sam},l}}\bigl(\hat x^{(0)}_{l,i}-x_{l,i}\bigr)^2\right],\tag{25}
$$

其中 \(\Omega_{\mathrm{sam},l}\) 表示第 \(l\) 帧中被采样位置的集合，\(N_{\mathrm{sam}}=\sum_{l=1}^{L}|\Omega_{\mathrm{sam},l}|\) 是采样位置总数。该对齐损失以干净的真值 RM 取值作为监督，以避免直接拟合测量噪声。

两个阶段使用如下训练目标联合优化：

$$
\mathcal L_{\mathrm{total}}=\lambda_{\mathrm{aux}}\mathcal L_{\mathrm{aux}}+\lambda_{\mathrm{diff}}\mathcal L_{\mathrm{diff}}+\lambda_{\mathrm{align}}\mathcal L_{\mathrm{align}},\tag{26}
$$

其中 \(\lambda_{\mathrm{aux}}\)、\(\lambda_{\mathrm{diff}}\)、\(\lambda_{\mathrm{align}}\) 是损失权重。完整训练流程见算法 1。

**算法 1：DyRadio 中噪声条件化时空 DM 的训练。**

**输入（Require）：** 干净 RM 序列 \(\mathbf X_{1:L}\)、场景信息 \(\mathcal C_{1:L}\)、稀疏 RM 观测 \(\mathcal Y_{1:L}\)、测量噪声水平 \(\sigma_{\mathrm{obs}}\)  
**输出（Ensure）：** 训练好的 U-Net \(U_\phi\) 与 DiT \(D_\theta\)

1: 初始化参数 \(\phi\) 与 \(\theta\)  
2: **while** 未收敛 **do**  
3: 　选取一个小批次的输入序列  
4: 　**第一阶段：传播引导特征提取**  
5: 　\((\widetilde{\mathbf X}_{1:L},\mathcal F)\leftarrow U_\phi(\mathcal C_{1:L},\mathcal Y_{1:L})\)  
6: 　按式 (13) 计算 \(\mathcal L_{\mathrm{MSE}}\)  
7: 　按式 (14) 与 (15) 计算 \(\mathcal L_{\mathrm{occ}}\) 与 \(\mathcal L_{\mathrm{src}}\)  
8: 　按式 (16) 计算 \(\mathcal L_{\mathrm{aux}}\)  
9: 　**第二阶段：噪声条件化扩散**  
10: 　采样一个扩散步 \(\tau\)  
11: 　\(\epsilon\sim\mathcal N(0,\mathbf I)\)  
12: 　\(\mathbf X^{(\tau)}_{1:L}\leftarrow\sqrt{\bar\alpha_\tau}\mathbf X_{1:L}+\sqrt{1-\bar\alpha_\tau}\,\epsilon\)  
13: 　\(\hat\epsilon\leftarrow D_\theta(\mathbf X^{(\tau)}_{1:L},\tau,\mathcal C_{1:L},\mathcal Y_{1:L},\sigma_{\mathrm{obs}},\mathcal F)\)  
14: 　按式 (23) 与 (25) 计算 \(\mathcal L_{\mathrm{diff}}\) 与 \(\mathcal L_{\mathrm{align}}\)  
15: 　按式 (26) 计算 \(\mathcal L_{\mathrm{total}}\)  
16: 　用 \(\nabla_{\phi,\theta}\mathcal L_{\mathrm{total}}\) 更新 \(\phi\) 与 \(\theta\)  
17: **end while**  
18: **return** \(U_\phi\)、\(D_\theta\)

### C. 通过盲区预测似然的迭代噪声估计

**1) 用学到的 RM 先验做盲区预测。** 与式 (8) 一致，测量噪声与干净 RM 相互独立，且在已观测位置上彼此独立，整段序列共享同一标准差 \(\sigma_{\mathrm{obs}}\)。因此，我们采用**盲区预测**，把用于条件化每次预测的观测与用于评估其残差的测量分离开来。具体而言，我们把已观测位置集合 \(\Omega_{\mathrm{sam}}\) 划分为 \(K\) 个互不相交的盲区：

$$
\Omega_{\mathrm{sam}}=\bigcup_{k=1}^{K}\Omega^{(k)}_{\mathrm{sam}},\qquad \Omega^{(i)}_{\mathrm{sam}}\cap\Omega^{(j)}_{\mathrm{sam}}=\varnothing,\ \ i\neq j.\tag{27}
$$

对每个时空位置 \(\omega\in\Omega_{\mathrm{sam}}\)，令 \(x_\omega\) 与 \(y_\omega\) 分别表示干净 RM 序列 \(\mathcal X\) 与含噪观测集合 \(\mathcal Y\) 中位置 \(\omega\) 处的标量取值。排除第 \(k\) 个盲区后保留下来的观测记为

$$
\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}}=\bigl\{y_\omega:\ \omega\in\Omega_{\mathrm{sam}}\setminus\Omega^{(k)}_{\mathrm{sam}}\bigr\}.\tag{28}
$$

预测分布依赖于提供给 DM 的当前噪声估计，而噪声估计本身又由盲区测量的预测似然得到。这种耦合促使我们采用一个迭代过程：在当前噪声估计下生成盲区预测，再通过似然优化更新噪声水平；更新后的估计随后用于为下一轮迭代中的预测提供条件。

在第 \(r\) 次迭代，预训练 DM 以场景信息 \(\mathcal C\)、观测 \(\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}}\) 与当前噪声估计 \(\sigma^{(r)}_{\mathrm{obs}}\) 为输入，得到预测分布

$$
p_{\phi,\theta}\bigl(\mathbf X_{1:L}\mid\mathcal C,\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}},\sigma^{(r)}_{\mathrm{obs}}\bigr).\tag{29}
$$

随后，我们为每个盲区生成 \(S\) 条独立的 RM 序列：

$$
\widehat{\mathbf X}^{(r,k,s)}_{1:L}\sim p_{\phi,\theta}\bigl(\widehat{\mathbf X}_{1:L}\mid\mathcal C,\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}},\sigma^{(r)}_{\mathrm{obs}}\bigr),\qquad s=1,\dots,S.\tag{30}
$$

对每个 \(\omega\in\Omega^{(k)}_{\mathrm{sam}}\)，令 \(\hat x^{(r,k,s)}_{\omega}\) 表示第 \(s\) 条生成序列 \(\widehat{\mathbf X}^{(r,k,s)}_{1:L}\) 中位置 \(\omega\) 处的 RM 取值。对每个 \(\omega\in\Omega^{(k)}_{\mathrm{sam}}\)，我们用高斯近似干净 RM 取值的边缘分布：

$$
p_{\phi,\theta}\bigl(x_\omega\mid\mathcal C,\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}},\sigma^{(r)}_{\mathrm{obs}}\bigr)\approx\mathcal N\bigl(x_\omega;\hat\mu^{(r,k)}_\omega,\hat v^{(r,k)}_\omega\bigr),\tag{31}
$$

其中预测均值与方差可用蒙特卡洛采样估计：

$$
\hat\mu^{(r,k)}_\omega=\frac{1}{S}\sum_{s=1}^{S}\hat x^{(r,k,s)}_\omega,\qquad \hat v^{(r,k)}_\omega=\frac{1}{S-1}\sum_{s=1}^{S}\bigl(\hat x^{(r,k,s)}_\omega-\hat\mu^{(r,k)}_\omega\bigr)^2.\tag{32}
$$

**2) 通过预测似然的噪声估计。** 我们对干净 RM 取值做边缘化，得到盲区测量的预测密度：

$$
\begin{aligned}
p^{(r,k)}_\omega(y_\omega;\sigma_{\mathrm{obs}})&=\int p(y_\omega\mid x_\omega,\sigma_{\mathrm{obs}})\,p_{\phi,\theta}\bigl(x_\omega\mid\mathcal C,\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}},\sigma^{(r)}_{\mathrm{obs}}\bigr)\,dx_\omega\\
&\approx\int\mathcal N\bigl(y_\omega;x_\omega,\sigma^2_{\mathrm{obs}}\bigr)\,\mathcal N\bigl(x_\omega;\hat\mu^{(r,k)}_\omega,\hat v^{(r,k)}_\omega\bigr)\,dx_\omega\\
&=\mathcal N\bigl(y_\omega;\hat\mu^{(r,k)}_\omega,\hat v^{(r,k)}_\omega+\sigma^2_{\mathrm{obs}}\bigr).
\end{aligned}\tag{33}
$$

这里 \(\sigma_{\mathrm{obs}}\) 是待估计的噪声标准差。预测方差等于干净 RM 预测方差 \(\hat v^{(r,k)}_\omega\) 与测量噪声方差 \(\sigma^2_{\mathrm{obs}}\) 之和。因此，该预测似然能够在考虑干净 RM 预测不确定性的同时，从盲区测量中估计噪声。

我们把式 (33) 的高斯预测密度在所有盲区上组合起来，构成**复合预测似然（composite predictive likelihood）**：

$$
\mathcal P^{(r)}(\sigma_{\mathrm{obs}})\triangleq\prod_{k=1}^{K}\prod_{\omega\in\Omega^{(k)}_{\mathrm{sam}}}\mathcal N\bigl(y_\omega;\hat\mu^{(r,k)}_\omega,\hat v^{(r,k)}_\omega+\sigma^2_{\mathrm{obs}}\bigr).\tag{34}
$$

采用最大复合似然估计，通过最大化 \(\mathcal P^{(r)}(\sigma_{\mathrm{obs}})\) 来估计共享的噪声标准差，即

$$
\begin{aligned}
\widetilde\sigma^{(r+1)}_{\mathrm{obs}}&=\arg\max_{\sigma_{\mathrm{obs}}\ge 0}\mathcal P^{(r)}(\sigma_{\mathrm{obs}})=\arg\min_{\sigma_{\mathrm{obs}}\ge 0}\bigl[-\log\mathcal P^{(r)}(\sigma_{\mathrm{obs}})\bigr]\\
&=\arg\min_{\sigma_{\mathrm{obs}}\ge 0}\sum_{k=1}^{K}\sum_{\omega\in\Omega^{(k)}_{\mathrm{sam}}}\left[\log\bigl(\hat v^{(r,k)}_\omega+\sigma^2_{\mathrm{obs}}\bigr)+\frac{(y_\omega-\hat\mu^{(r,k)}_\omega)^2}{\hat v^{(r,k)}_\omega+\sigma^2_{\mathrm{obs}}}\right].
\end{aligned}\tag{35}
$$

对数项 \(\log\bigl(\hat v^{(r,k)}_\omega+\sigma^2_{\mathrm{obs}}\bigr)\) 惩罚过大的预测方差，而归一化残差项 \(\frac{(y_\omega-\hat\mu^{(r,k)}_\omega)^2}{\hat v^{(r,k)}_\omega+\sigma^2_{\mathrm{obs}}}\) 惩罚过小、无法解释实测值的方差。两项合起来在考虑位置相关预测不确定性的同时估计共享的噪声水平。

我们数值求解该优化问题，并施加松弛以更新噪声估计：

$$
\sigma^{(r+1)}_{\mathrm{obs}}=(1-\eta)\sigma^{(r)}_{\mathrm{obs}}+\eta\,\widetilde\sigma^{(r+1)}_{\mathrm{obs}},\tag{36}
$$

其中 \(\eta\in(0,1]\) 是松弛参数。从初始估计 \(\sigma^{(0)}_{\mathrm{obs}}\) 出发，我们重复式 (30) 的预测步与式 (36) 的更新步，直到 \(\bigl|\sigma^{(r+1)}_{\mathrm{obs}}-\sigma^{(r)}_{\mathrm{obs}}\bigr|<\delta\) 或达到最大迭代次数 \(R_{\max}\)，得到最终估计 \(\hat\sigma_{\mathrm{obs}}\)。

根据式 (17)，最终估计 \(\hat\sigma_{\mathrm{obs}}\) 与场景信息 \(\mathcal C\) 及全部可用测量 \(\mathcal Y_{1:T}\) 一起，为预训练时空 DM 提供条件以重建完整 RM 序列。算法 2 总结了 DyRadio 的估计与重建流程。

**算法 2：DyRadio——迭代噪声估计与动态 RM 重建。**

**输入（Require）：** 预训练的 \(U_\phi\) 与 \(D_\theta\)、场景信息 \(\mathcal C\)、稀疏观测 \(\mathcal Y_{1:T}\)、初始噪声估计 \(\sigma^{(0)}_{\mathrm{obs}}\)  
**输出（Ensure）：** 噪声估计 \(\hat\sigma_{\mathrm{obs}}\) 与重建的 RM 序列 \(\widehat{\mathbf X}_{1:T}\)

**噪声估计**

1: 选取用于噪声估计的初始观测子集，其采样位置为 \(\Omega_{\mathrm{sam}}\)  
2: 把 \(\Omega_{\mathrm{sam}}\) 划分为 \(K\) 个互不相交的盲区 \(\{\Omega^{(k)}_{\mathrm{sam}}\}_{k=1}^{K}\)  
3: \(r\leftarrow 0\)  
4: **repeat**  
5: 　**for** \(k=1,\dots,K\) **do**  
6: 　　按式 (28) 构造 \(\mathcal Y_{-\Omega^{(k)}_{\mathrm{sam}}}\)  
7: 　　按式 (30) 抽取 \(S\) 条独立 RM 序列  
8: 　　按式 (32) 估计 \(\{\hat\mu^{(r,k)}_\omega,\hat v^{(r,k)}_\omega\}_{\omega\in\Omega^{(k)}_{\mathrm{sam}}}\)  
9: 　**end for**  
10: 　通过求解式 (35) 计算 \(\widetilde\sigma^{(r+1)}_{\mathrm{obs}}\)  
11: 　按式 (36) 更新 \(\sigma^{(r+1)}_{\mathrm{obs}}\leftarrow(1-\eta)\sigma^{(r)}_{\mathrm{obs}}+\eta\widetilde\sigma^{(r+1)}_{\mathrm{obs}}\)  
12: 　\(\Delta\leftarrow\bigl|\sigma^{(r+1)}_{\mathrm{obs}}-\sigma^{(r)}_{\mathrm{obs}}\bigr|\)  
13: 　\(r\leftarrow r+1\)  
14: **until** \(\Delta<\delta\) 或 \(r\ge R_{\max}\)  
15: \(\hat\sigma_{\mathrm{obs}}\leftarrow\sigma^{(r)}_{\mathrm{obs}}\)

**RM 重建**

16: 以相应场景信息 \(\mathcal C\)、稀疏观测与 \(\hat\sigma_{\mathrm{obs}}\) 为条件，用式 (12) 与式 (17) 通过 \(U_\phi\) 与 \(D_\theta\) 重建所有 \(L\) 帧子序列  
17: **return** \(\hat\sigma_{\mathrm{obs}}\)、\(\widehat{\mathbf X}_{1:T}\)

## IV. 实验设置与结果

本节评估 DyRadio 在动态无线电地图重建上的性能，并把 DyRadio 与多种基线方法比较，包括 RadioDiff [9]、PhyRMDM [23]、RadioUNet [17] 与 RadioMapMotion [25]。

### A. 实验设置

**1) 数据集。** 我们把 CARLA 仿真器 [31] 与 Sionna RT [16] 集成，构建了一个动态 RM 数据集。具体而言，CARLA 用于构建三维环境并模拟真实的车辆运动，生成多样的交通轨迹；场景几何与动态车辆配置随后被导入 Sionna RT，执行基于射线追踪的无线电传播仿真。Sionna RT 仿真通过表面反射与来自建筑、道路、车辆的朗伯漫散射来刻画多径传播。载频设为 5.89 GHz，带宽 10 MHz，发射功率 23 dBm。发射机与接收机高度分别设为 1.5 m 与 1.0 m。

该数据集由 16 个不同场景组成，每个场景包含 150 个具有不同车辆轨迹的回合（episode）。对每个场景，随机部署 40 个候选发射机位置，每个回合从中选出 5 个以生成 5 条 RM 序列，总计 12 000 条 RM 序列。每条 RM 表示接收信号强度（RSS）在覆盖 \(96\times 96\ \mathrm{m}^2\) 区域的 \(128\times 128\) 网格上的空间分布，并归一化到 \([0,1]\)。每条序列以 10 Hz 生成，共 96 帧。图 4 展示了所生成数据集的多样性，它能够很好地捕捉移动车辆引起的无线传播时间变化，包括信号遮挡与多径传播的变化。该数据集进一步划分为 12 个训练场景、1 个验证场景与 3 个测试场景，场景之间互不重叠。为使计算开销可控，我们分别随机选取 1 800、120 与 300 条序列用于训练、验证与测试，并把每条训练序列划分为 6 个互不重叠的 \(L=16\) 帧子序列。评估时，我们重建完整的 96 帧序列，以评估 DyRadio 在动态环境中的性能。

**图 4（原文 Fig. 4）：** 所生成数据集中场景多样性、车辆动态与发射机多样性的可视化。（图中三行分别展示：(a) 场景多样性（不同建筑布局）；(b) 车辆动态（同一场景中车辆随时间的位置变化）；(c) 发射机多样性（红/蓝星标区分有源发射机与候选发射机）；右列为对应的 RSS 地图，色标为 RSS（dBm），范围约 −124 至 −24 dBm，图例为 Building、Vehicle、Active Tx、Candidate Tx。）

**2) 实现细节。** 为平衡重建性能与计算开销，DiT 块被分为三组：前部、中部与后部，并为每组分配不同的特征维数与注意力头数。第一阶段与第二阶段使用 AdamW 从零开始联合训练，训练序列具有不同的采样率与观测噪声水平，具体配置见表 III。噪声估计中，每个盲区使用 10 步 DDIM 采样评估，而 RM 重建使用 50 步 DDIM 采样。所有模型在四块 NVIDIA RTX PRO 6000 GPU 上训练，关键模型配置与训练设置汇总于表 III。

**表 III：DyRadio 的关键模型配置与训练设置。**

| 参数 | 配置 |
|---|---|
| 三维块大小（3D patch size） | (2, 4, 4) |
| Token 网格大小（token grid size） | (8, 32, 32) |
| U-Net 基础通道数 | 32 |
| U-Net 下采样/上采样级数 | 5/5 |
| DiT 块数 \(N\) | 2/11/2（前部/中部/后部） |
| 特征维数 | 384/768/384（前部/中部/后部） |
| 注意力头数 | 6/12/6（前部/中部/后部） |
| 训练采样率 \(p\) 范围 | 1%–10% |
| 训练 \(\sigma_{\mathrm{obs}}\) 范围 | 0.01–0.09 |
| 学习率 | \(5\times10^{-5}\) |
| 权重衰减 | 0.01 |
| 批大小 | 24 |
| 学习率调度 | 余弦衰减，1 000 步预热 |
| 噪声估计所用帧 | 每条序列的前 4 帧 |
| 初始噪声估计 \(\sigma^{(0)}_{\mathrm{obs}}\) | \(\sigma^{(0)}_{\mathrm{obs}}=0.03\) |
| 松弛参数 \(\eta\) | \(\eta=0.8\) |
| 最大迭代次数 \(R_{\max}\) | \(R_{\max}=3\) |
| 盲区个数 \(K\) | \(K=4\) |
| 蒙特卡洛样本数 \(S\) | \(S=4\) |
| 收敛容差 \(\delta\) | \(\delta=0.001+0.02\sigma^{(r)}_{\mathrm{obs}}\) |

**3) 对比方法。** 我们把 DyRadio 与四种具有代表性的 RM 重建方法比较，它们覆盖单帧与多帧设置，以及基于扩散与有监督两类方法。

- **RadioDiff [9]：** 一种无采样的单帧扩散式 RM 重建方法。它采用潜空间扩散，配合基于注意力的 U-Net 与自适应傅里叶变换模块来捕捉传播特征，并使用解耦扩散过程实现高效生成。
- **PhyRMDM [23]：** 一种单帧、物理信息的扩散模型，用于稀疏 RM 重建。它采用双 U-Net 架构，通过表示对齐机制把亥姆霍兹方程约束纳入扩散式生成。
- **RadioUNet [17]：** 一种有监督的单帧 CNN 方法，直接预测 RM。其 U-Net 学习从环境信息到空间无线电场的确定性映射，并支持稀疏测量辅助的重建。
- **RadioMapMotion [25]：** 一种有监督的多帧直接预测模型，使用 ConvLSTM 融合沿序列输入的特征。我们把它改造用于稀疏观测的 RM 重建，同时保留原始架构并重新训练该模型。

为公平比较，对原本不支持稀疏观测的基线，我们也把稀疏观测纳入其输入。所有基线都使用完全相同的数据集划分重新训练，并基于验证损失做早停。所用全部评估指标的定义见附录。

### B. 实验结果与分析

**1) 总体重建性能。** 表 IV 在不同采样率与噪声水平上把 DyRadio 与四个基线比较。DyRadio 在所有设置下都取得最低的 MSE 与 NMSE、最高的 PSNR 与 SSIM。单帧 RM 方法 [9], [17], [23] 缺乏显式的跨帧建模，限制了它们对互补观测的利用。如图 5 所示，这些方法由于对应区域观测不足而产生局部传播图样畸变。与使用 ConvLSTM 做时序融合的 RadioMapMotion [25] 相比，DyRadio 把 MSE 降低 25.1%–73.3%，凸显了基于 DiT 的时空建模在利用互补观测上的有效性。此外，图 5 显示 RadioMapMotion 基于直接监督的预测倾向于平滑局部变化，使阴影边界变模糊。这些增益在高噪声水平下尤为明显，说明噪声条件化的观测融合能按估计的噪声水平自适应地整合稀疏观测，从而提升稳健性。

**图 5（原文 Fig. 5）：** 不同时刻 RM 重建结果的定性比较（\(p=2\%\)，\(\sigma_{\mathrm{obs}}=0.05\)）。各列从左至右为 RadioUNet、RadioMapMotion、RadioDiff、PhyRMDM、DyRadio 与真值（Ground Truth）。

**表 IV：RM 重建方法的定量比较。**

| \(p\) | 方法 | \(\sigma_{\mathrm{obs}}=0.03\) MSE↓ | NMSE↓ | PSNR↑ | SSIM↑ | \(\sigma_{\mathrm{obs}}=0.05\) MSE↓ | NMSE↓ | PSNR↑ | SSIM↑ | \(\sigma_{\mathrm{obs}}=0.09\) MSE↓ | NMSE↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1% | RadioDiff | 1.6920 | 6.497 | 27.97 | 0.9444 | 1.9893 | 7.634 | 27.24 | 0.9375 | 3.0045 | 11.512 | 25.42 | 0.9180 |
| 1% | PhyRMDM | 1.7204 | 6.638 | 27.84 | 0.8205 | 1.9881 | 7.664 | 27.19 | 0.8149 | 3.0093 | 11.560 | 25.35 | 0.7964 |
| 1% | RadioUNet | 2.0286 | 7.783 | 27.10 | 0.9338 | 2.3068 | 8.833 | 26.51 | 0.9252 | 3.3170 | 12.646 | 24.88 | 0.8968 |
| 1% | RadioMapMotion | <u>0.7665</u> | <u>2.918</u> | <u>31.28</u> | <u>0.9613</u> | <u>1.0540</u> | <u>4.014</u> | <u>29.85</u> | <u>0.9421</u> | <u>2.8323</u> | <u>10.714</u> | <u>25.50</u> | <u>0.8486</u> |
| 1% | DyRadio | **0.5355** | **2.037** | **32.81** | **0.9777** | **0.5911** | **2.250** | **32.38** | **0.9757** | **0.7680** | **2.928** | **31.25** | **0.9696** |
| 2% | RadioDiff | 1.2193 | 4.670 | 29.35 | 0.9562 | 1.3623 | 5.217 | 28.85 | 0.9519 | 1.8196 | 6.968 | 27.57 | 0.9400 |
| 2% | PhyRMDM | 1.2433 | 4.783 | 29.20 | 0.8220 | 1.3905 | 5.350 | 28.71 | 0.8184 | 1.9385 | 7.454 | 27.24 | 0.8055 |
| 2% | RadioUNet | 1.3211 | 5.063 | 28.94 | 0.9502 | 1.4975 | 5.730 | 28.37 | 0.9431 | 2.1547 | 8.213 | 26.74 | 0.9177 |
| 2% | RadioMapMotion | <u>0.4776</u> | <u>1.819</u> | <u>33.36</u> | <u>0.9723</u> | <u>0.6531</u> | <u>2.488</u> | <u>31.94</u> | <u>0.9578</u> | <u>1.8543</u> | <u>7.030</u> | <u>27.34</u> | <u>0.8787</u> |
| 2% | DyRadio | **0.3478** | **1.323** | **34.67** | **0.9845** | **0.3838** | **1.462** | **34.24** | **0.9830** | **0.4952** | **1.890** | **33.14** | **0.9785** |
| 3% | RadioDiff | 1.0361 | 3.964 | 30.03 | 0.9615 | 1.1295 | 4.321 | 29.65 | 0.9584 | 1.4233 | 5.445 | 28.62 | 0.9495 |
| 3% | PhyRMDM | 1.1174 | 4.292 | 29.64 | 0.8143 | 1.2285 | 4.720 | 29.22 | 0.8116 | 1.6322 | 6.273 | 27.97 | 0.8011 |
| 3% | RadioUNet | 1.0360 | 3.967 | 29.99 | 0.9573 | 1.1704 | 4.477 | 29.44 | 0.9509 | 1.6771 | 6.394 | 27.83 | 0.9275 |
| 3% | RadioMapMotion | <u>0.3715</u> | <u>1.415</u> | <u>34.45</u> | <u>0.9766</u> | <u>0.4971</u> | <u>1.893</u> | <u>33.14</u> | <u>0.9648</u> | <u>1.3391</u> | <u>5.085</u> | <u>28.76</u> | <u>0.9002</u> |
| 3% | DyRadio | **0.2781** | **1.058** | **35.63** | **0.9871** | **0.3066** | **1.168** | **35.21** | **0.9858** | **0.3949** | **1.507** | **34.12** | **0.9819** |

注：MSE 与 NMSE 以 \(10^{-3}\) 为单位报告。最优与次优结果分别以**加粗**与<u>下划线</u>标出。

**2) 采样率与测量噪声对 RM 重建性能的影响。** 图 6 展示采样率与测量噪声对重建性能的影响。如图 6(a) 所示，所有方法的 PSNR 都随采样率 \(p\) 增大而上升，而 DyRadio 始终对基线保持显著优势；具体地，当采样率从 1% 升到 3% 时，其 PSNR 提升 2.83 dB。图 6(b) 表明增大测量噪声会使所有方法的重建精度下降。然而，当 \(\sigma_{\mathrm{obs}}\) 从 0.03 增到 0.09 时，DyRadio 的 PSNR 仅下降 1.53 dB，而 RadioMapMotion 的降幅要大得多，约为 6.0 dB，最终接近其他基线的性能。这种急剧退化说明多帧融合使 RadioMapMotion 更容易受噪声影响；相比之下，DyRadio 的噪声条件化设计在观测噪声不断增大时仍能有效保持重建质量。

**图 6（原文 Fig. 6）：** (a) 采样率（\(\sigma_{\mathrm{obs}}=0.05\)）与 (b) 测量噪声（\(p=2\%\)）对 RM 重建性能的影响。纵轴为 PSNR（dB）：(a) 横轴为采样率（%，1–3），(b) 横轴为测量噪声 \(\sigma_{\mathrm{obs}}\)（0.03–0.09）；图例为 RadioUNet、RadioMapMotion、RadioDiff、PhyRMDM、DyRadio。

**3) 时序建模的有效性。** 我们通过改变输入序列长度并比较三种方法来评估时序建模：DyRadio、直接把观测做池化的 DyRadio 变体，以及 RadioMapMotion [25]。灵活的 DiT 与 ConvLSTM 架构都支持用同一套预训练权重处理不同长度的序列。如图 7 所示，当 \(L\) 从 4 增到 16 时，DyRadio 的直接池化变体从 31.12 dB 退化到 27.63 dB，而 DyRadio 从 32.22 dB 提升到 34.24 dB，凸显了时序状态失配的不利影响。RadioMapMotion 对序列长度的依赖更强，其 PSNR 从 14.72 dB 升到 31.94 dB，而 DyRadio 在 \(L=4\) 时已达到 32.22 dB。这些结果说明 DyRadio 在利用时序观测方面有效，并能在输入序列很短时仍保持较高的重建质量。

**图 7（原文 Fig. 7）：** 不同序列长度下时序建模对 RM 重建的有效性（\(p=2\%\)，\(\sigma_{\mathrm{obs}}=0.05\)）。横轴为序列长度 \(L\)（4、8、12、16），纵轴为 PSNR（dB）；柱状图三组分别为 DyRadio、Pooling 与 RadioMapMotion，DyRadio 在 \(L=4,8,12,16\) 上分别为 32.22、33.63、34.06、34.24 dB，Pooling 为 31.12、29.78、28.51、27.63 dB，RadioMapMotion 为 14.72、18.42、27.05、31.94 dB。

**4) 噪声估计精度及其对重建的影响。** 表 V 汇总了不同采样率与真实噪声水平下的噪声估计精度。随着采样率提高，所有噪声水平下的 MAE 都持续下降，相对偏差总体趋近于零。例如在 \(\sigma_{\mathrm{obs}}=0.03\) 时，当 \(p\) 从 1% 增到 3%，MAE 从 \(2.755\times10^{-3}\) 降到 \(1.218\times10^{-3}\)，相对偏差的绝对值从 2.34% 降到 0.38%。这一改善说明即使采样稀疏，更多观测也能提升噪声估计的可靠性。

**表 V：不同采样率与真实噪声水平下的噪声估计精度。**

| \(p\) | 噪声水平 \(\sigma_{\mathrm{obs}}\) | 平均估计值（Avg. Estimate） | MAE（↓） | 相对偏差（%） |
|---|---|---|---|---|
| 1% | 0.00 | 0.0019 | 1.931 | – |
| 1% | 0.03 | 0.0293 | 2.755 | −2.34 |
| 1% | 0.05 | <u>0.0505</u> | 2.342 | <u>+1.00</u> |
| 1% | 0.07 | 0.0710 | 2.806 | +1.48 |
| 1% | 0.09 | 0.0890 | 1.003 | −1.11 |
| 2% | 0.00 | <u>0.0016</u> | <u>1.642</u> | – |
| 2% | 0.03 | <u>0.0304</u> | <u>1.365</u> | <u>+1.32</u> |
| 2% | 0.05 | 0.0506 | <u>1.464</u> | +1.17 |
| 2% | 0.07 | <u>0.0707</u> | <u>1.758</u> | <u>+0.99</u> |
| 2% | 0.09 | <u>0.0894</u> | <u>0.636</u> | <u>−0.71</u> |
| 3% | 0.00 | **0.0010** | **1.016** | – |
| 3% | 0.03 | **0.0299** | **1.218** | **−0.38** |
| 3% | 0.05 | **0.0502** | **1.167** | **+0.39** |
| 3% | 0.07 | **0.0703** | **1.352** | **+0.41** |
| 3% | 0.09 | **0.0894** | **0.633** | **−0.70** |

注：MAE 以 \(10^{-3}\) 为单位报告。当 \(\sigma_{\mathrm{obs}}=0\) 时相对偏差记为“–”。最优与次优结果分别以**加粗**与<u>下划线</u>标出。

在采样率 \(p=2\%\) 时，表 VI 通过比较真值、估计值与固定（\(\sigma=0.05\)）噪声水平输入，评估噪声估计对 RM 重建的影响。估计噪声水平的性能与真值输入几乎相同，PSNR 最大差异仅 0.002 dB。与固定输入相比，估计噪声设置在 \(\sigma_{\mathrm{obs}}=0.03\)、0.07 与 0.09 时分别把 PSNR 提升 0.546、0.149 与 0.296 dB。这些结果表明，所提噪声估计方法使 DyRadio 能够估计未知的测量噪声水平，并相较固定噪声水平输入改善重建性能。

**表 VI：噪声估计对 RM 重建的影响（\(p=2\%\)）。**

| \(\sigma_{\mathrm{obs}}\) | 输入 \(\sigma\) | MSE | NMSE | PSNR | SSIM |
|---|---|---|---|---|---|
| 0.03 | 真值（Ground-Truth） | 0.3476 | 1.3226 | 34.674 | 0.98454 |
| 0.03 | 估计值（Estimated） | 0.3478 | 1.3234 | 34.672 | 0.98453 |
| 0.03 | 固定（\(\sigma=0.05\)） | 0.3950 | 1.5030 | 34.126 | 0.98284 |
| 0.05 | 真值 | 0.3836 | 1.4609 | 34.246 | 0.98302 |
| 0.05 | 估计值 | 0.3838 | 1.4619 | 34.244 | 0.98302 |
| 0.05 | 固定（\(\sigma=0.05\)） | — | — | — | — |
| 0.07 | 真值 | 0.4331 | 1.6512 | 33.722 | 0.98099 |
| 0.07 | 估计值 | 0.4333 | 1.6519 | 33.720 | 0.98099 |
| 0.07 | 固定（\(\sigma=0.05\)） | 0.4488 | 1.7097 | 33.571 | 0.98063 |
| 0.09 | 真值 | 0.4953 | 1.8901 | 33.144 | 0.97854 |
| 0.09 | 估计值 | 0.4952 | 1.8899 | 33.144 | 0.97853 |
| 0.09 | 固定（\(\sigma=0.05\)） | 0.5316 | 2.0388 | 32.848 | 0.97514 |

注：MSE 与 NMSE 以 \(10^{-3}\) 为单位报告。固定（\(\sigma=0.05\)）在 \(\sigma_{\mathrm{obs}}=0.05\) 时的结果被省略，因为它与真值一致。

**5) 消融实验。** 为评估 DyRadio 中关键组件的贡献，我们分别移除第一阶段、时序注意力与噪声条件化观测融合来做消融实验。如表 VII 所示，完整模型在所有评估设置下都取得最佳性能。移除第一阶段导致最显著的退化，PSNR 下降 7.07–8.28 dB，凸显了传播引导特征对 RM 重建的重要性。移除时序注意力也使 PSNR 下降 5.43–7.33 dB，证实了跨帧信息交换对动态 RM 重建的贡献。此外，完整模型与「不含噪声条件化观测融合」变体之间的性能差距在测量噪声更高时扩大：在 \(p=2\%\)、\(\sigma_{\mathrm{obs}}=0.09\) 时 PSNR 下降 3.01 dB，SSIM 从 0.9785 降到 0.9429。这些结果说明噪声条件化观测融合在含噪观测下能有效提升重建稳健性。

**表 VII：不同采样率与噪声水平下 DyRadio 的消融研究。**

| 模型变体 | \(p=1\%,\sigma_{\mathrm{obs}}=0.05\) MSE↓ | NMSE↓ | PSNR↑ | SSIM↑ | \(p=2\%,\sigma_{\mathrm{obs}}=0.05\) MSE↓ | NMSE↓ | PSNR↑ | SSIM↑ | \(p=2\%,\sigma_{\mathrm{obs}}=0.09\) MSE↓ | NMSE↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 完整模型（Full Model） | **0.591** | **2.250** | **32.38** | **0.9757** | **0.384** | **1.462** | **34.24** | **0.9830** | **0.495** | **1.890** | **33.14** | **0.9785** |
| 去掉 Stage I（w/o Stage I） | 3.932 | 14.974 | 24.10 | 0.8705 | 1.941 | 7.400 | 27.17 | 0.9266 | 2.759 | 10.507 | 25.63 | 0.9007 |
| 去掉噪声条件化融合 | 0.763 | 2.902 | 31.23 | 0.9604 | 0.478 | 1.826 | 33.27 | 0.9712 | 0.983 | 3.754 | 30.13 | 0.9429 |
| 去掉时序注意力 | 3.244 | 12.426 | 25.05 | 0.9131 | 1.343 | 5.127 | 28.81 | 0.9494 | 2.042 | 7.816 | 27.02 | 0.9312 |

注：MSE 与 NMSE 以 \(10^{-3}\) 为单位报告。

**6) 推理效率。** 我们在单块 NVIDIA RTX PRO 6000 GPU 上评估不同方法的推理效率。DyRadio 与 RadioMapMotion 每次推理生成 16 帧，而 RadioUNet、RadioDiff 与 PhyRMDM 以批大小 16 做逐帧推理。如表 VIII 所示，DyRadio 在保持与基于扩散的 RadioDiff、PhyRMDM 相当的推理时间的同时，取得了更优的重建性能。RadioDiff 在对比方法中参数量最大，部分原因是其报告的参数量包含 VAE 模块。

噪声估计耗时 1.842 s（占总推理时间的 11.9%），引入的开销有限，同时使方法能够适应未知测量噪声。

**表 VIII：不同 RM 重建方法的推理效率。**

| 方法 / 阶段 | 参数量（M） | 推理时间（s） | 峰值 GPU 显存（GiB） |
|---|---|---|---|
| RadioUNet | 13.28 | 0.072 | 0.370 |
| RadioMapMotion | 2.70 | 0.138 | 0.200 |
| RadioDiff | 279.10 | 11.625 | 2.140 |
| PhyRMDM | 66.47 | 18.445 | 2.460 |
| DyRadio——噪声估计 | – | 1.842 | 2.949 |
| DyRadio——RM 重建 | – | 13.600 | 2.943 |
| DyRadio——完整流程 | **186.63** | **15.442** | **2.949** |

注：所有推理时间均针对 96 帧序列测量。

## V. 结论

本文提出了 DyRadio，一个把噪声条件化时空 DM 与迭代噪声水平估计方法整合起来、用于从稀疏观测重建动态 RM 的框架。在 DyRadio 中，DM 通过把传播先验特征与时空注意力结合，联合重建连续多帧 RM；而噪声估计方法利用 DM 学到的 RM 先验，迭代地预测盲区 RM 并更新噪声估计。随后，噪声调制的交叉注意力在不同噪声水平下自适应地融合稀疏观测，从而实现稳健的重建。实验结果表明，与已有方法相比，DyRadio 取得了更优的重建精度与对测量噪声的稳健性；此外，所提噪声估计方法能准确估计未知噪声水平，并支撑有效的噪声条件化重建。未来工作将把 DyRadio 扩展到城市交通之外的多样化动态环境，并探索如何把重建的 RM 应用于无线感知感知的具身任务。

## 附录：评估指标

我们用 MSE、NMSE、PSNR 与 SSIM 评估 RM 重建，并用平均估计噪声、MAE 与相对偏差评估噪声估计。重建指标在每条完整的 \(T\) 帧 RM 序列上计算，并在测试序列间等权平均。令 \(X_t(h,w)\) 与 \(\widehat X_t(h,w)\) 分别表示第 \(t\) 帧中位置 \((h,w)\) 处的真值与重建 RM 取值，其中 \(H\) 与 \(W\) 为空间维数。

**1) MSE：** 平均平方重建误差为
$$
\mathrm{MSE}=\frac{1}{THW}\sum_{t,h,w}\bigl(\widehat X_t(h,w)-X_t(h,w)\bigr)^2.
$$

**2) NMSE：** 由真值 RM 能量归一化的平方重建误差为
$$
\mathrm{NMSE}=\frac{\sum_{t,h,w}\bigl(\widehat X_t(h,w)-X_t(h,w)\bigr)^2}{\sum_{t,h,w}X_t(h,w)^2}.
$$

**3) PSNR：** PSNR 基于最大信号功率与 MSE 之比评估重建保真度：
$$
\mathrm{PSNR}=10\log_{10}\bigl(\mathrm{MAX}^2/\mathrm{MSE}\bigr).
$$

**4) SSIM：** SSIM 评估重建 RM 与真值 RM 之间的局部亮度、对比度与结构相似性 [35]：
$$
\mathrm{SSIM}(a,b)=\frac{(2\mu_a\mu_b+C_1)(2\sigma_{ab}+C_2)}{\bigl(\mu_a^2+\mu_b^2+C_1\bigr)\bigl(\sigma_a^2+\sigma_b^2+C_2\bigr)},
$$
其中 \(a\) 与 \(b\) 是对应的局部图像块，\(\mu_a\) 与 \(\mu_b\) 是其均值，\(\sigma_a^2\) 与 \(\sigma_b^2\) 是其方差，\(\sigma_{ab}\) 是其协方差，\(C_1\) 与 \(C_2\) 是稳定化常数。MSE 与 NMSE 越低、PSNR 与 SSIM 越高，表示重建质量越好。

**5) 平均估计噪声：** 令 \(\hat\sigma^{(i)}_{\mathrm{obs}}\) 表示第 \(i\) 条测试序列的噪声估计，则平均估计噪声水平为
$$
\bar{\hat\sigma}_{\mathrm{obs}}=\frac{1}{N}\sum_{i=1}^{N}\hat\sigma^{(i)}_{\mathrm{obs}}.
$$

**6) MAE：** 噪声估计的平均绝对误差为
$$
\mathrm{MAE}=\frac{1}{N}\sum_{i=1}^{N}\bigl|\hat\sigma^{(i)}_{\mathrm{obs}}-\sigma_{\mathrm{obs}}\bigr|.
$$

**7) 相对偏差（Relative Bias）：** 相对偏差度量平均估计噪声水平相对真值的百分比偏离：
$$
\text{Relative Bias}=100\%\,\frac{\bar{\hat\sigma}_{\mathrm{obs}}-\sigma_{\mathrm{obs}}}{\sigma_{\mathrm{obs}}}.
$$

## 参考文献

[1] S. Dang, O. Amin, B. Shihada, and M.-S. Alouini, "What should 6G be?" Nat. Electron., vol. 3, no. 1, pp. 20–29, 2020.

[2] K. B. Letaief, W. Chen, Y. Shi, J. Zhang, and Y.-J. A. Zhang, "The roadmap to 6G: AI empowered wireless networks," IEEE Commun. Mag., vol. 57, no. 8, pp. 84–90, 2019.

[3] Z. Chen, Y. Ren, Y. Huang, Q. Sun, N. Li, Y. Huang, Y. Li, and L. Xia, "A wireless world model for AI-native 6G networks," 2026, arXiv:2603.25216.

[4] F. H. Kumbhar, K. Dev, S. A. Khowaja, A.-A. A. Boulogeorgos, M. Bennis, and Y. Liu, "Physical-AI: From channel awareness to environmental intelligence in 6G wireless networks," 2026, arXiv:2606.20583.

[5] H. Wang, J. Zhang, G. Nie, L. Yu, Z. Yuan, T. Li, J. Wang, and G. Liu, "Digital twin channel for 6G: Concepts, architectures and potential applications," IEEE Commun. Mag., vol. 63, no. 3, pp. 24–30, 2025.

[6] S. Bi, J. Lyu, Z. Ding, and R. Zhang, "Engineering radio maps for wireless resource management," IEEE Wireless Commun., vol. 26, no. 2, pp. 133–141, 2019.

[7] B. Li and J. Chen, "Radio map-assisted approach for interference-aware predictive UAV communications," IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 16 725–16 741, 2024.

[8] G. Rakkesh, S. P. Pirati, A. K. Yerrapragada, and R. K. Ganti, "Predictive handover optimization using hybrid radio propagation modeling for 5G and beyond," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Kuala Lumpur, Malaysia, Apr. 2026.

[9] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction," IEEE Trans. Cogn. Commun. Netw., vol. 11, no. 2, pp. 738–750, 2025.

[10] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, "RadioDiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction," IEEE J. Sel. Areas Commun., vol. 44, pp. 2318–2333, 2026.

[11] S. Roger, M. Brambilla, B. Camajori Tedeschini, C. Botella-Mascarell, M. Cobos, and M. Nicoli, "Deep-learning-based radio map reconstruction for V2X communications," IEEE Trans. Veh. Technol., vol. 73, no. 3, pp. 3863–3871, 2024.

[12] C. Wen, J. Tong, Z. Lin, C. Bian, and J. Zhang, "Bridging visual and wireless sensing via a unified radiation field for 3D radio map construction," npj Wirel. Technol., vol. 2, 2026, art. no. 59.

[13] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, 2022.

[14] G. Mateos, J. A. Bazerque, and G. B. Giannakis, "Spline-based spectrum cartography for cognitive radios," in Proc. 43rd Asilomar Conf. Signals, Syst. Comput., Pacific Grove, CA, USA, Nov. 2009, pp. 1025–1029.

[15] E. Dall'Anese, S.-J. Kim, and G. B. Giannakis, "Channel gain map tracking via distributed kriging," IEEE Trans. Veh. Technol., vol. 60, no. 3, pp. 1205–1211, 2011.

[16] J. Hoydis, F. Aït Aoudia, S. Cammerer, M. Nimier-David, N. Binder, G. Marcus, and A. Keller, "Sionna RT: Differentiable ray tracing for radio propagation modeling," in Proc. IEEE Globecom Workshops (GC Wkshps), Kuala Lumpur, Malaysia, Dec. 2023, pp. 317–321.

[17] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[18] Y. Tian, S. Yuan, W. Chen, and N. Liu, "Transformer based radio map prediction model for dense urban environments," in Proc. 13th Int. Symp. Antennas, Propag. EM Theory (ISAPE), Zhuhai, China, Dec. 2021.

[19] J. Ho, A. N. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Adv. Neural Inf. Process. Syst. (NeurIPS), vol. 33, Online, Dec. 2020, pp. 6840–6851.

[20] Y. Teganya and D. Romero, "Deep completion autoencoders for radio map estimation," IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1710–1724, 2022.

[21] S. Zhang, A. Wijesinghe, and Z. Ding, "RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet Things J., vol. 10, no. 20, pp. 18 016–18 027, 2023.

[22] Z. Liu, S. Zhang, Q. Liu, H. Zhang, and L. Song, "WiFi-Diffusion: Achieving fine-grained WiFi radio map estimation with ultra-low sampling rate by diffusion models," IEEE J. Sel. Areas Commun., vol. 43, no. 11, pp. 3796–3812, 2025.

[23] H. Jia, W. Chen, Z. Huang, L. Wang, H. Xiao, N. Jia, K. Wu, S. Lai, B. Tian, and Y. Yue, "Physics-informed representation alignment for sparse radio-map reconstruction," in Proc. 33rd ACM Int. Conf. Multimedia (ACM MM), Dublin, Ireland, Oct. 2025, pp. 12 352–12 360.

[24] X. Wang, Z. Fang, N. Cheng, R. Sun, H. Zhou, Z. Su, Z. Li, and X. Shen, "RadioDiff-Inverse: Diffusion enhanced bayesian inverse estimation for ISAC radio map construction," IEEE Trans. Wireless Commun., vol. 25, pp. 14 611–14 626, 2026.

[25] N. Cheng, H. Jia, X. Wang, H. Peng, R. Sun, and C. Zhou, "RadioMapMotion: A dataset and benchmark for proactive spatio-temporal radio environment prediction," IEEE Trans. Cogn. Commun. Netw., vol. 12, pp. 7701–7715, 2026.

[26] S. Shao, B. Fan, Q. Liu, S. Zhang, H. Zhang, and L. Song, "Temporally predicting fine-grained radio maps with ultra-low sampling rates by large-small model collaboration," IEEE Trans. Mobile Comput., 2026.

[27] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," in Proc. Int. Conf. Med. Image Comput. Comput.-Assist. Intervent. (MICCAI), Munich, Germany, Oct. 2015, pp. 234–241.

[28] W. Peebles and S. Xie, "Scalable diffusion models with transformers," in Proc. IEEE/CVF Int. Conf. Comput. Vis. (ICCV), Paris, France, Oct. 2023, pp. 4172–4182.

[29] J. Ho, C. Saharia, W. Chan, D. J. Fleet, M. Norouzi, and T. Salimans, "Cascaded diffusion models for high fidelity image generation," J. Mach. Learn. Res., vol. 23, no. 47, 2022.

[30] D. Heurtel-Depeiges, C. Margossian, R. Ohana, and R. Régaldo-Saint Blancard, "Listening to the noise: Blind denoising with Gibbs diffusion," in Proc. 41st Int. Conf. Mach. Learn. (ICML), ser. Proc. Mach. Learn. Res., vol. 235, Vienna, Austria, Jul. 2024, pp. 18 284–18 304.

[31] A. Dosovitskiy, G. Ros, F. Codevilla, A. Lopez, and V. Koltun, "CARLA: An open urban driving simulator," in Proc. 1st Annu. Conf. Robot Learn. (CoRL), ser. Proc. Mach. Learn. Res., vol. 78, Mountain View, CA, USA, Nov. 2017, pp. 1–16.

[32] C. Saharia, J. Ho, W. Chan, T. Salimans, D. J. Fleet, and M. Norouzi, "Image super-resolution via iterative refinement," IEEE Trans. Pattern Anal. Mach. Intell., vol. 45, no. 4, pp. 4713–4726, 2023.

[33] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proc. Int. Conf. Learn. Represent. (ICLR), Online, May 2021.

[34] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, "Diffusion posterior sampling for general noisy inverse problems," in Proc. Int. Conf. Learn. Represent. (ICLR), Kigali, Rwanda, May 2023.

[35] Z. Wang, A. C. Bovik, H. R. Sheikh, and E. P. Simoncelli, "Image quality assessment: From error visibility to structural similarity," IEEE Trans. Image Process., vol. 13, no. 4, pp. 600–612, 2004.

---

**本页范围与校对状态：** 本页覆盖 arXiv:2611.01603v1 全文（13 页）：摘要与关键词、正文第 I–V 节全部正文与小节（§I-A 相关工作、§I-B 贡献、§I-C 论文结构、§II-A 扩散模型预备知识、§II-B 问题建模、§III-A 框架概览、§III-B 噪声条件化时空 DM 的 1)–2)、§III-C 盲区预测似然的迭代噪声估计的 1)–2)、§IV-A 实验设置 1)–3)、§IV-B 结果与分析 1)–6)、§V 结论）、附录（评估指标 1)–7) 全部定义）、式 (1)–(36) 编号（另含附录中未编号的 MSE/NMSE/PSNR/SSIM/平均噪声/MAE/相对偏差公式）、算法 1–2（逐行，含 Require/Ensure 与分组标题）、表 I–VIII 逐格（Table I 能力对比含 ●/◐/○ 支持标记、Table II 记号、Table III 配置、Table IV 重建对比含加粗/下划线、Table V 噪声估计含加粗/下划线、Table VI 噪声输入影响、Table VII 消融、Table VIII 推理效率）、图 1–7 图注、参考文献 [1]–[35] 英文原条目。**已完成的 PDF 渲染核对：** p.1（题名/作者/单位/摘要/Index Terms/arXiv 编号）、p.3（表 I 全部支持标记、式 (1)–(4)）、p.4（式 (5)–(11)、表 II 全部行）、p.5（图 2 图注与面板文字、式 (12)–(17)）、p.6（图 3 架构图注与面板、式 (18)–(23)）、p.7（算法 1 逐行、式 (24)–(33)）、p.8（式 (34)–(36)、算法 2 逐行、表 III 全部配置）、p.9（图 4 图注、表 IV 全部 15 行 × 12 列数值与加粗/下划线）、p.11（图 6/7 图注与柱值、表 V 全部数值与标记、表 VI 全部数值）、p.12（表 VII、表 VIII、§V 结论与附录开头）。p.2（图 1 与 §I 尾段）与 p.10（图 5 图注、对比方法 3) 段、§IV-B 开头）与 p.13（附录指标公式、参考文献）按 pypdf 抽取文本翻译，并与渲染页内容交叉核对。

**已知缺陷与核对疑点：** ① **摘要与正文的 PSNR 提升区间口径不一致（重要）**：摘要与贡献段写「1.18–5.75 dB」，但按表 IV 逐格计算，最小提升为 1.18 dB（\(p=3\%,\sigma_{\mathrm{obs}}=0.03\)：35.63−34.45），最大提升为 **5.80 dB**（\(p=2\%,\sigma_{\mathrm{obs}}=0.09\)：33.14−27.34），而 5.75 dB 对应 \(p=1\%,\sigma_{\mathrm{obs}}=0.09\)（31.25−25.50）。本页按原文照译「1.18–5.75 dB」，并在表 IV 保留逐格数值，供后续 QA 判断是摘要笔误还是口径差异。② 表 I 在 pypdf 抽取中丢失了 ●/◐/○ 符号（只剩行文），本页按渲染页 p.3 逐格还原：如 [14]–[16] 行为 ○/○/◐/○/○/○，[22]–[24] 行为 ●/●/◐/○/○/◐，本文行为全 ●。③ 表 V 的加粗/下划线标记按渲染页 p.11 还原：其「最优/次优」是在同一真实噪声水平下跨采样率比较（3% 为最优、2% 或 1% 为次优），原文未明说比较方向，本页保留渲染页的标记位置。④ 表 IV 的最优/次优标记同样按渲染页逐格核对：DyRadio 在全部 12 列均为最优、RadioMapMotion 在全部 12 列均为次优（例如 \(p=1\%,\sigma_{\mathrm{obs}}=0.03\) 的 NMSE 次优为 2.918）。⑤ pypdf 抽取把部分公式打散（如式 (6)(13)(24)(35) 的分子分母与上下标），本页按渲染页逐式重排，式号与原文一致；\(\bar\alpha_\tau\)、\(\bar\alpha_{\tau-1}\) 等上划线记号以 \(\bar\alpha\) 表示。⑥ 图 2/3/4 为位图流程图/架构图/场景拼图，图注按原文翻译，并另以括注转写图中可见的分支、面板与示意数值，未推测不可读细节；图 1 为示意插图，括注仅转写图中可辨的框题与文字。⑦ 原文「1, 800」在渲染页为「1,800」（千分位逗号），本页写作 1 800 以符合中文排版；「12, 000」同理。⑧ 表 VIII 中 DyRadio 的「Noise Estimation/RM Reconstruction」两行参数量在原文中记为「–」（表示未单独给出），本页照录该标记。⑨ 附录指标公式在原文中为行内小公式，本页提升为展示式以便阅读，未改动内容。**建议后续 QA 重点：** 摘要 5.75 与表 IV 5.80 的差异、表 I 支持标记逐格复核、表 V 的加粗/下划线比较方向、算法 2 第 15 行 \(\hat\sigma_{\mathrm{obs}}\leftarrow\sigma^{(r)}_{\mathrm{obs}}\) 的下标（原文如此）、以及 §IV-A-1 中「1 800/120/300 条序列」与「16 场景 × 150 回合 × 5 发射机 = 12 000 条」的自洽性。逐句逐式终校未做。

---

**登记（2026-11-06）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
