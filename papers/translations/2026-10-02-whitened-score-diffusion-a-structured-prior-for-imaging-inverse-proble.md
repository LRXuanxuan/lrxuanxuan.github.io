---
layout: page
title: "白化分数扩散：成像逆问题的结构化先验｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-02-whitened-score-diffusion-a-structured-prior-for-imaging-inverse-proble/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/09661b8958d1b02a/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 白化分数扩散：成像逆问题的结构化先验

> **许可与使用范围说明：** 原文为 NeurIPS 2025 会议论文集版本，**再传播许可待核验**；本页仅为**学习用途**的中文译稿，**不计入本站「可公开全文」统计**，也不作为正式译文对外发布。如后续确认许可，再按站点流程更新。

**原题：** Whitened Score Diffusion: A Structured Prior for Imaging Inverse Problems  
**作者：** Jeffrey Alido¹、Tongyu Li¹、Yu Sun²、Lei Tian¹（¹ 波士顿大学电气与计算机工程系；² 约翰斯·霍普金斯大学电气与计算机工程系）  
**版本：** NeurIPS 2025（第 39 届神经信息处理系统大会）会议论文集版本，本地 PDF 28 页（含附录与 NeurIPS 论文检查表）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1—5 节、致谢、补充材料附录 A—E、NeurIPS 论文检查表、图 1—图 12 图注与参考文献（英文原条目 67 条）按原文结构录入；逐句逐式终校未做。

## 摘要

传统基于分数的扩散模型（DM）在处理**各向异性高斯扩散过程**时可能表现不佳，因为去噪分数匹配训练目标中需要对协方差矩阵求逆 [58]。本文提出**白化分数（Whitened Score, WS）扩散模型**——一个基于随机微分方程的新框架，学习**白化分数函数**而非标准分数函数。该方法**规避协方差求逆**，把基于分数的 DM 推广到可在**任意高斯前向加噪过程**上稳定训练。WS DM 对任意高斯噪声与**流匹配（FM）**等价，允许定制**谱归纳偏置**，并为具有结构化噪声的成像逆问题提供强 Bayes 先验。本文在 CIFAR、CelebA（$64\times64$）与 CelebA-HQ（$256\times256$）数据集上实验多种计算成像任务，证明在各向异性高斯加噪过程上训练的 WS 扩散先验**一致优于**基于各向同性高斯噪声的传统扩散先验。代码开源于 github.com/jeffreyalido/wsdiffusion。

## 1 引言

扩散模型（DM）是一类强生成模型，通过建模（Stein）分数函数隐式学习复杂数据分布 [48]、[49]、[18]、[13]、[26]、[25]。该分数函数随后被代入由常微分方程（ODE）或随机微分方程（SDE）描述的逆向去噪过程，从噪声生成新样本。通常，前向加噪过程定义为向干净数据样本加入不同水平的**各向同性**高斯噪声，这使去噪分数匹配（DSM）目标简单且可处理 [58]。然而，当前向扩散噪声协方差**病态或奇异**时，DSM 目标会出现不稳定，因为其计算需要**对协方差矩阵求逆**。

流匹配（FM）[33]、[35]、[1]、[65] 是另一类生成建模范式：它按流所构造的隐式概率路径，把任意已知噪声分布重塑为复杂数据分布。对各向同性高斯情形，[34]、[52] 证明了 FM 与 DM 在噪声参数重标定意义下**等价**。但对各向异性高斯噪声，基于分数的 DM 与 FM 之间存在**鸿沟**：由于条件分数 [58] 中必须对协方差矩阵求逆，基于分数的 DM 难以在任意高斯前向加噪过程上训练。

能够去除**结构化、相关噪声**的去噪 DM 在许多科学逆问题（尤其成像）中很有价值，因为它可作为强 Bayes 先验 [49]、[16]、[63]、[28]。透过雾、湍流与散射成像 [3]、[64]、[31]，宽场显微 [39]，衍射层析 [32]、[30]，光学相干层析（OCT）[21]，干涉测量 [56] 等许多成像模态，其图像形成过程都受到结构化、空间相关噪声的污染 [62]、[6]，而非普遍假设的加性各向同性（白）高斯噪声。传统 DM 在各向同性高斯噪声上训练，对相关噪声的现实场景可能**不足以**充当 Bayes 先验。


受 FM 建模任意概率路径的能力与扩散先验在逆问题中的表达力启发，本文提出 **Whitened Score Diffusion**——一个基于任意高斯加噪过程学习 DM 的框架。本文不学习（时变的）分数函数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$，而学习 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$，其中 $\mathbf G_t$ 为前向扩散过程的扩散矩阵（图 1）。据把分数向量场变换为各向同性场的**白化变换**，本文把该框架称为**白化分数（WS）DM**。它扩展了基于分数的 DM 的 SDE 框架：对任意各向异性高斯噪声，DSM 目标中都**不再需要计算协方差的逆**，从而可像 FM 一样任意选择高斯概率路径。本文说明该框架与 FM 的等价性，并把它与 [8] 的逆向时间扩散过程推导联系起来：$\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 正是逆向时间 SDE 中随机项的**可预测过程**。本工作把基于分数的 DM 推广到任意高斯前向过程，弥合了 DM 与 FM 之间的鸿沟；该框架使去噪生成先验的原理性构造成为可能，可纳入与相关测量噪声对齐的谱偏置，从而改善结构化噪声逆问题的性能。在 CIFAR-10、CelebA（$64\times64$）与 CelebA-HQ（$256\times256$）多种成像任务上的实验表明，相比在各向同性噪声上训练的传统模型，重建峰值信噪比（PSNR）**一致更高**。本文贡献为：(i) 一个支持任意高斯概率路径的 DM 训练框架；(ii) 与 FM 联系的理论洞见；(iii) 结构化噪声下成像逆问题有效先验的演示。

## 2 背景

### 2.1 基于分数的扩散模型

基于分数的 DM 通过逆转时变加噪过程来估计概率密度函数 $p(\mathbf x_0)$。在连续时间中，前向加噪过程由如下 Itô SDE 描述：

$$
\mathrm d\mathbf x_t=\mathbf F_t\mathbf x_t\,\mathrm dt+\mathbf G_t\,\mathrm d\mathbf w.\tag{1}
$$

其中 $\mathbf F_t\in\mathbb R^{m\times m}$ 为漂移系数，$\mathbf w\in\mathbb R^{m}$ 为标准 Wiener 过程（布朗运动），$\mathbf G_t\in\mathbb R^{m\times m}$ 为控制噪声结构的扩散矩阵。噪声水平由时间 $t\in[0,T]$ 索引，使 $\mathbf x_0\sim p(\mathbf x_0)$、$\mathbf x_T\sim\mathcal N(\mathbf 0,\mathbf I)$、$\mathbf x_t\sim p(\mathbf x_t\mid\mathbf x_0)$，后者为由 (1) 定义的概率转移高斯核。

(1) 对应的逆向时间 SDE 为

$$
\mathrm d\mathbf x_t=\left[\mathbf F_t\mathbf x_t-\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\right]\mathrm dt+\mathbf G_t\,\mathrm d\bar{\mathbf w},\tag{2a}
$$

具有相同时间边缘分布的确定性 ODE（又称**概率流**）为

$$
\mathrm d\mathbf x_t=\left[\mathbf F_t\mathbf x_t-\frac{1}{2}\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\right]\mathrm dt,\tag{2b}
$$

其中 $\bar{\mathbf w}$ 为逆向时间标准 Wiener 过程，$\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 为 Stein 分数函数。从 $p(\mathbf x_0)$ 采样需解 (2) 并已知分数函数。文献 [48]、[49] 用神经网络 $\mathbf s_{\boldsymbol\theta}(\mathbf x_t,t)$ 通过优化 DSM 目标 [58] 逼近分数函数：

$$
\widehat{\boldsymbol\theta}=\arg\min_{\boldsymbol\theta}\ \mathbb E_{t\sim\mathcal U(0,1],\,\mathbf x_t\sim p(\mathbf x_t\mid\mathbf x_0),\,\mathbf x_0\sim p(\mathbf x)}\left[\left\lVert\mathbf s_{\boldsymbol\theta}(\mathbf x_t,t)-\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)\right\rVert_2^{2}\right],\tag{3}
$$

其中条件分数函数有闭式：

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)=\boldsymbol\Sigma_t^{-1}\left(\boldsymbol\mu_t-\mathbf x_t\right),\tag{4}
$$

$\boldsymbol\mu_t$ 与 $\boldsymbol\Sigma_t$ 为高斯转移核 $p(\mathbf x_t\mid\mathbf x_0)$ 的均值与协方差，二者是由漂移系数与扩散矩阵决定、通过求解 [54] 中 (5.50)、(5.51) 两 ODE 得到的函数，并呈线性比例关系 $\boldsymbol\mu_t\propto\mathbf x_0$、$\boldsymbol\Sigma_t\propto\mathbf G_t\mathbf G_t^{\top}$。这使 (2b) 中的变换后分数项 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ **始终各向同性**——因为协方差会与其逆相乘，与扩散系数 $\mathbf G_t$ 无关。

### 2.2 扩散模型中的结构化前向过程

传统基于分数的 DM 通常采用不相关白高斯噪声，对应**对角**扩散矩阵 $\mathbf G_t$ [49]。但这一表述把学习到的分数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$ 限制在各向同性噪声设定；推广到非对角 $\mathbf G_t$ 会带来数值挑战，因为 (4) 中的协方差求逆在病态或奇异情形下可能不稳定。

近期研究表明，控制前向噪声的空间频率成分可影响模型的**谱归纳偏置**并增强生成灵活性 [23]；但仍缺少在任意加噪过程下训练扩散模型的统一框架。本文从 SDE 表述下的基于分数 DM 视角填补这一空白，为频率可控与结构化前向过程建立原理性基础。已有若干引入结构化前向过程的方案：CLD [15] 与 PSLD [40] 通过引入速度变量扩展状态空间、在相空间注入噪声以简化分数估计，代价是辅助动态；MDM [45] 与 Blurring Diffusion [19] 采用各向异性或空间相关噪声，但需对**稠密协方差矩阵**求逆；Flexible Diffusion [17] 参数化前向 SDE 以实现自适应噪声调度，却增加了模型复杂度与训练成本。这些进展共同说明超越各向同性高斯噪声的重要性，也暴露了稳定性与计算开销方面的实际限制。本文的 WS 模型因此在不求协方差逆的前提下支持任意高斯前向过程，为结构化生成建模提供简单、稳定且通用的机制。

### 2.3 流匹配

流匹配（FM）[33]、[35]、[1] 是另一类生成建模范式，用 ODE

$$
\frac{\mathrm d\boldsymbol\phi_t(\mathbf x_t)}{\mathrm dt}=\mathbf u_t(\boldsymbol\phi_t(\mathbf x_t))\tag{5}
$$

连接噪声分布与数据分布，其中 $\mathbf u_t(\mathbf x_t)$ 为 FM 向量场，初值 $\boldsymbol\phi_0(\mathbf x_0)=\mathbf x_0$。噪声样本沿时间经神经网络建模的条件 FM 向量场变换为数据分布样本：

$$
\mathbf u_t(\mathbf x_t\mid\mathbf x_0)=\boldsymbol\Sigma_t'({\mathbf x_0})\boldsymbol\Sigma_t^{-1}(\mathbf x_0)\left(\mathbf x_t-\boldsymbol\mu_t(\mathbf x_0)\right)+\boldsymbol\mu_t'(\mathbf x_0),\tag{6}
$$

其中 $\boldsymbol\mu_t(\mathbf x_0)$ 与 $\boldsymbol\Sigma_t(\mathbf x_0)$ 为概率路径 $p_t$ 的均值与协方差，$f'$ 表示 $f$ 的时间导数。由于 $\boldsymbol\Sigma_t'$ 与 $\boldsymbol\Sigma_t$ 至多相差一个标量系数，与逆相乘给出单位阵 [54]，$\mathbf u_t(\mathbf x_t\mid\mathbf x_0)$ 的函数形式使 FM 能在任意高斯概率路径上**简单、稳定地训练**；而基于分数的模型因 (4) 必须对协方差矩阵求逆，缺此对角化乘法。

WS 与 FM 一致之处在于两者都旨在支持任意概率路径，第 3.2 节给出形式联系。不过，FM 求解逆问题时可能需要新方法来纳入测量似然 [65]，而 WS 框架可直接与现有强制测量一致性的技术结合（见第 2.4 节综述）。

### 2.4 基于扩散模型先验的成像逆问题

由测量 $\mathbf y\in\mathbb R^{n}$ 与已知前向模型 $\mathbf y\sim\mathcal N(\mathbf A\mathbf x_0,\boldsymbol\Sigma_y)$ 重建未知信号 $\mathbf x_0\in\mathbb R^{m}$（$\boldsymbol\Sigma_y\in\mathbb R^{n\times n}$ 为加性高斯噪声协方差，$\mathbf A\in\mathbb R^{m\times n}$ 为测量前向模型）是计算成像与科学问题的核心挑战。近期进展把 DM 作为灵活先验 [14]，采用即插即用方案 [66]、[67]、[60]，基于后验分数近似的似然引导采样 [22]、[49]、[9]、[11]、[47]、[27]，Markov 链 Monte Carlo（MCMC）技术 [38]、[7]、[61]、[63]、[53]、[55]，变分方法 [16]、[37] 以及隐扩散框架 [43]、[12]、[46]。

本文采用**近似后验**的方法。由 Bayes 法则，后验分数可分解为先验分数与似然分数，从而把 (2) 改写为随机反向扩散

$$
\mathrm d\mathbf x_t=\left[\mathbf F_t\mathbf x_t-\mathbf G_t\mathbf G_t^{\top}\left(\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t)\right)\right]\mathrm dt+\mathbf G_t\,\mathrm d\bar{\mathbf w},\tag{7a}
$$

与确定性反向扩散

$$
\mathrm d\mathbf x_t=\left[\mathbf F_t\mathbf x_t-\frac{1}{2}\mathbf G_t\mathbf G_t^{\top}\left(\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t)\right)\right]\mathrm dt.\tag{7b}
$$

先验分数由去噪 DM 近似；但由于时间依赖性，测量似然分数**不可解**。文献 [11]、[5]、[47]、[50] 对先验分布做简化假设，而 [22]、[10]、[28]、[43] 把似然分数近似视为以测量作为引导信号的经验设计更新。所有这些似然分数近似都可代入 (7) 求解逆问题。

当前成像逆问题研究的一大空白是**加性结构化噪声**。多数 DM 先验工作聚焦各向同性高斯噪声并使用相应的各向同性高斯去噪 DM。[20] 近期用随机复原先验探索结构化先验，在同时涉及相关与不相关噪声时优于各向同性高斯加噪过程训练的传统去噪 DM；但扩散框架中对结构化噪声的**形式化处理**仍然缺失——这正是本文要解决的。

## 3 白化分数扩散

本文用非对角扩散矩阵定义前向 SDE

$$
\mathrm d\mathbf x_t=\underbrace{-\frac{1}{2}\beta_t}_{:=\mathbf F_t}\mathbf x_t\,\mathrm dt+\underbrace{\sqrt{\beta_t}\mathbf K}_{:=\mathbf G_t}\mathrm d\mathbf w,\tag{8}
$$

沿用方差保持（VP）SDE [49]。实验中把 $\mathbf K$ 限制为可用快速 Fourier 变换（FFT）实现的**循环卷积矩阵**类；但方法可推广到任意半正定 $\mathbf K$；$\mathbf K=\mathbf I$ 时精确退化为 VP-SDE。(8) 对应的概率转移核为[^1]

$$
p(\mathbf x_t\mid\mathbf x_0)=\mathcal N\left(\mathbf x_t\mid\alpha_t\mathbf x_0,(1-\alpha_t^{2})\mathbf K\mathbf K^{\top}\right),\tag{9}
$$

[^1]: 转移核的均值与协方差由 [54] 中 (5.50)、(5.51) 两式解出。

其中 $\alpha_t=e^{-\frac{1}{2}\int_0^{t}\beta_s\mathrm ds}$。一般地 $\alpha_t$ 定义为漂移系数从 0 到 $t$ 的积分 $\alpha_t=\int_0^{t}\mathbf F_s\mathrm ds$。利用高斯分布的**重参数化技巧**，可把 (9) 改写为如下连续时间系统：

$$
\mathbf x_t=\alpha_t\mathbf x_0+\sqrt{1-\alpha_t^{2}}\,\mathbf K\mathbf z,\qquad\mathbf z\sim\mathcal N(\mathbf 0,\mathbf I).\tag{10}
$$

也可采用其他漂移与扩散矩阵（如方差爆炸（VE）SDE）：由初值 $\boldsymbol\mu_0=\mathbf x_0$、$\boldsymbol\Sigma_0=\mathbf 0$ 可得均值为 $\mathbf x_0$ 的标量倍数、协方差为 $\mathbf G_t\mathbf G_t^{\top}$ 的标量倍数。针对 (8) 的 SDE，本文定义信噪比（SNR）为 $\alpha_t/\sqrt{1-\alpha_t^{2}}$。

### 3.1 白化分数匹配目标

由 (9)，用于 (3) 的条件分数为

$$
\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)=\left((1-\alpha_t^{2})\mathbf K\mathbf K^{\top}\right)^{-1}\left(\alpha_t\mathbf x_0-\mathbf x_t\right),\tag{11}
$$

其中矩阵求逆常导致分数计算不稳定。例如，高斯卷积矩阵的条件数随卷积核 $\mathbf K$ 变宽而增大，放大高空间频率特征，使 (3) 的 DSM 目标训练效果变差。

为缓解训练中分数计算的数值不稳定，本文对分数施加**白化变换**——自然地把其乘以 $\mathbf G_t\mathbf G_t^{\top}$，而 $\mathbf G_t\mathbf G_t^{\top}\propto\boldsymbol\Sigma_t$ 即前向扩散过程协方差。与 DSM 类似，对 (8) 的 SDE，本文用 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)$ 逼近 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$，后者在 $\boldsymbol\Sigma_t$ 与 $\mathbf G_t\mathbf G_t^{\top}$ 相消后有如下闭式：

$$
\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)=\beta_t\frac{\alpha_t\mathbf x_0-\mathbf x_t}{1-\alpha_t^{2}}.\tag{12}
$$

本文用如下去噪白化分数匹配损失训练模型 $\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)$：

$$
\mathcal L=\mathbb E_{t\sim\mathcal U(0,1],\,\mathbf x_t\sim p(\mathbf x_t\mid\mathbf x_0),\,\mathbf x_0\sim p(\mathbf x)}\left[\left\lVert\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)-\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)\right\rVert_2^{2}\right],\tag{13}
$$

证明见附录 A。该目标计入噪声中不同水平的空间相关性，使模型能去除任意高斯噪声。它在扩散模型损失的更广图景中定义了**新的学习目标**：可视为**噪声预测** [18] 在相关高斯噪声情形下的推广，其中预条件项 $\mathbf G_t\mathbf G_t^{\top}$ 刻画噪声结构。与传统噪声预测假设各向同性噪声不同，本表述可在任意高斯前向过程下稳定训练。

紧接着的式 (15) 表明：条件 FM 向量场 $\mathbf u_t$ 是本文条件 WS 函数与漂移项的**线性组合**（见附录 B），说明 WS 与 FM 都通过对分数函数以 $\mathbf G_t\mathbf G_t^{\top}$ 预条件来避免协方差求逆。这一共有性质使灵活高斯概率路径的原理性建模成为可能。


### 3.2 对 WS 的解释

与 [4] 同时期，[8] 通过把逆向时间 SDE 的扩散项唯一分解为零均值鞅与可预测过程 $\mathbf n_t$ 之和，得到与 (2a) 相同的结果：

$$
\mathbf n_t=\frac{\sum_{i=1}^{m}\frac{\partial}{\partial x_t^{i}}\sum_{k=1}^{m}\mathbf G_t^{ik}(\mathbf x_t,t)\mathbf G_t^{\cdot k}(\mathbf x_t,t)p_t(\mathbf x_t)}{p_t(\mathbf x_t)}.\tag{14}
$$

当 $\mathbf G_t$ 与状态 $\mathbf x_t$ 无关时，$\mathbf n_t$ 简化为 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$。该过程关于逆向时间流的**过滤**是条件确定的，这为"建模完整可预测过程而非孤立分数函数"提供了动机。

此外，把分数乘以 $\mathbf G_t\mathbf G_t^{\top}$ 会**白化**其向量场（图 3），带来两重效应。第一，原分数向量场数值不稳定：其取值对残差的微小误差高度敏感（由条件数 $\kappa(\boldsymbol\Sigma)$ 刻画），训练中常有被条件数放大的噪声，导致训练不稳定；乘以 $\mathbf G\mathbf G^{\top}$（转移核协方差的一个标量倍）即对场做预条件。第二，分数场会旋转向包含噪声转移核 $p(\mathbf x_t\mid\mathbf x_0)$ 大部分密度的**主轴**方向。对各向异性高斯转移核，分数并**不**指向数据分布，而指向前向 SDE 的（相关）噪声主轴；(2) 自然地使场重新朝向数据均值，这为建模完整可预测过程而非仅建模分数提供了动机。进一步，通过学习可预测过程，本文给出更一般的 SDE 型 DM 方案：模型总产生**各向同性**的反向时间样本路径，采样时无需再指定扩散矩阵。

**与 FM 的联系。** 为把 WS DM 与 FM 联系起来并解释为何能在任意高斯概率路径上训练，本文用 SDE 框架重新表述 FM，并用 (8) 的 VP-SDE 变量重写条件 FM 向量场：

$$
\mathbf u_t(\mathbf x_t\mid\mathbf x_0)=\mathbf F_t\left(2\mathbf x_t-\alpha_t\mathbf x_0\right)+\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0).\tag{15}
$$

(15) 表明条件 FM 向量 $\mathbf u_t$ 是本文条件 WS 函数与漂移项的线性组合（推导见附录 B）。FM 与 WS 共有的关键性质正是通过对分数以 $\mathbf G_t\mathbf G_t^{\top}$ 预条件来**避免协方差求逆**，从而支持灵活建模任意高斯概率路径。

### 3.3 成像逆问题的 WS 扩散先验

本文用 (7)、以 WS 扩散先验并配合测量似然分数的近似来求解成像逆问题。回顾第 2.4 节：已有大量方法近似测量似然分数，它们都遵循模板

$$
\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_t)\approx\boldsymbol\Sigma_y^{-1}\nabla_{\mathbf x_t}r(\mathbf x_t),\tag{16}
$$

其中 $\nabla_{\mathbf x_t}r(\mathbf x_t)$ 为残差函数的梯度，引导更新 $\mathbf x_t$ 朝观测 $\mathbf y$ 更可能出现的区域。逆向时间 SDE 框架对相关噪声逆问题尤其有益：当把 $\mathbf G_t\mathbf G_t^{\top}$ 设计为与协方差矩阵成比例时，扩散矩阵 $\mathbf G_t\mathbf G_t^{\top}$ 会对似然分数中的**逆测量协方差做预条件**：

$$
\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_t)\approx\underbrace{\mathbf G_t\mathbf G_t^{\top}\boldsymbol\Sigma_y^{-1}}_{\propto\mathbf I}\nabla_{\mathbf x_t}r(\mathbf x_t).\tag{17}
$$

设计扩散过程时取 $\mathbf G_t\mathbf G_t^{\top}=\beta_t\mathbf K\mathbf K^{\top}+\gamma^{2}\mathbf I$，其中 $\mathbf K\mathbf K^{\top}$ 涵盖一大类测量噪声协方差，$\gamma^{2}$ 在 0 与 1 间均匀抽取，以促使模型学习位于高空间频率子空间中的更精细细节。实践中正则项 $\lambda_t$ 对平衡生成先验与数据似然很重要。作为概念验证，本文采用 [22] 的似然引导采样，因其函数形式简单：$\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_t)\approx\boldsymbol\Sigma_y^{-1}\mathbf A^{H}(\mathbf y-\mathbf A\mathbf x_t)$，并使用 (7b) 的确定性采样器。所得算法见算法 1。

**算法 1　成像逆问题的 WS 扩散先验**

```text
Require: T, A, y, {β_t}_{t=0}^{T}, n_θ
1: 初始化 x_T ~ N(0, I)
2: for t = T to 0 do
3:     x'_t ← (2 − √(1 − β_t Δt)) x_t + n_θ(x_t, t) Δt / 2
4:     x_{t−1} ← x'_t − λ_t β_t A^H (y − A x_t) / 2
5: end for
6: return x_0
```

## 4 实验

### 4.1 训练细节

对每个数据集，本文按 [18] 的架构训练两个 attention U-Net 模型，每个下采样层含三个残差块：一个对应传统的各向同性高斯 SDE，另一个对应本文的各向异性高斯 SDE。学习率为 $3\times10^{-5}$ 并采用线性衰减调度。CIFAR10（$32\times32$）批大小为 128，CelebA（$64\times64$）为 16，CelebA-HQ（$256\times256$）为 4。模型在单块 48GB 的 NVIDIA L40S GPU 上训练两天。模型在 CIFAR-10 [29]、CelebA（$64\times64$）[36] 与 CelebA-HQ（$256\times256$）[24] 的训练集上训练，其中 $\mathbf K$ 为以标准差为特征参数的二维高斯卷积矩阵：CIFAR 的 $\mathbf K$ 标准差在 0.1 与 3 间均匀分布，CelebA（$64\times64$）为 0.1 与 5 之间，CelebA-HQ（$256\times256$）为 0.1 与 20 之间（标准差 $\le0.5$ 等价于二维 delta 函数）。噪声还以 0.5 概率随机为灰度或彩色。

### 4.2 相关噪声下的成像逆问题

自然图像谱呈指数衰减 [57] 是公认事实，说明低频分量在表示图像时占主导。当加性测量噪声占据相同的谱子空间（尤其低频）时，计算成像任务本质上更具挑战。本文用多种已知受结构化噪声影响的计算成像模态做实验，表明该框架作为生成先验对此类结构化噪声逆问题有益。

实验中的测量受加性灰度结构化噪声污染，用以模拟计算摄影（雾、霾、大气湍流）与计算显微（荧光背景、激光散斑、探测器噪声）中常见的真实条件。算法 1 取 $T=1000$、$\beta_{\min}=0.01$、$\beta_{\max}=20$，使 SNR 在 $t=T$ 衰减到 0。WS 先验结果中 $\mathbf x_T$ 分别从 $\mathcal N(\mathbf 0,\mathbf K\mathbf K^{\top})$ 抽取（CIFAR 与 CelebA 的高斯核标准差分别为 3 与 6，灰度彩色时各颜色通道取同值）；传统 DM 先验结果中 $\mathbf x_T$ 从 $\mathcal N(\mathbf 0,\mathbf I)$ 抽取。全部评估在均匀随机抽取的未见验证集样本上进行。正则参数 $\lambda$ 按 [22] 的做法使似然步幅与先验步幅成比例；用线搜索寻找使重建 PSNR 最高的最优 $\lambda$。PSNR 定义为 $\mathrm{PSNR}=20\log_{10}(1/\mathrm{MSE})$，MSE 为重建与真值的均方误差。

本文在透过雾成像、运动去模糊、镜头去模糊、线性逆散射与微分离焦等多种计算成像任务上展示结果，细节见附录 C。

**相关噪声去噪。** 为展示模型作为受相关噪声污染测量的生成先验的能力，本文研究去噪问题，并与仅在各向同性高斯前向扩散上训练的传统基于分数扩散先验比较。图 2 给出 CIFAR 与 CelebA（$64\times64$）测试样本在一系列 SNR 下的结果：颜色从类雾退化中被忠实恢复，且由于生成先验的作用，结果与数据集的相似性得以保持。

**泛化到不同噪声结构。** 模型可泛化到具有不同高斯噪声分布的测量噪声协方差矩阵。图 4 表明，受不同空间相关高斯噪声分布污染的测量被恢复后的 PSNR 高于传统 DM 先验；传统基于分数先验会改变测量的高阶语义特征，因为模型无法依据 Fourier 支撑区分噪声特征与目标图像特征——所加相关噪声的低频支撑与数据中视觉特征的低频支撑重叠（图 6），这使重建任务更难。

**谱归纳偏置。** 相比在各向同性高斯噪声上训练的传统扩散先验，WS 扩散先验更有效地把结构化噪声与目标特征区分开。如图 6 所示，标准 DM 倾向于压制测量中的高频分量，假设它们来自噪声——只有当噪声 Fourier 支撑超出数据支撑时该假设才成立。对 CIFAR（平均信号谱超出噪声支撑），这种误分类会导致图像特征被不期望地衰减；相反，对 CelebA（$64\times64$，平均图像谱位于噪声支撑之内），传统模型能更好地保留图像特征。在**高斯轨迹集合**上训练的 WS DM 学到超越简单谱启发式的结构化噪声识别能力，从而即使低频噪声与信号内容在谱上重叠也能选择性去除低频噪声，在相关噪声下取得更好的去噪性能。

**计算成像。** 用 WS 扩散先验求解非恒等前向算子的逆问题时，PSNR 优于传统基于分数的扩散先验。值得注意的是，在恢复受灰度类雾噪声污染的测量时，本文扩散先验能保持对颜色分布的保真，而传统基于分数的扩散先验无法去除噪声（图 5 与图 8 的去模糊逆问题）。CIFAR 上其他成像逆问题以及 CelebA（$64\times64$）与 CelebA-HQ（$256\times256$）数据集上的更多结果见附录 C 与图 7、图 8、图 9、图 10、图 11。

## 5 结论

本文提出 WS 扩散——基于分数方法的推广，学习**白化分数** $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$。它避免噪声协方差求逆，支持任意各向异性高斯前向过程，并与 FM 建立联系。本文展示了 WS 扩散作为涉及相关噪声（计算成像中常见）的逆问题的**稳健生成先验**。实验一致表明，其 PSNR 与视觉重建优于在各向同性噪声上训练的传统扩散先验，尤其在准确处理结构化噪声、同时保留图像特征方面。WS 扩散为针对结构化噪声开发有效生成模型提供了原理性途径，提升了其在计算成像应用中的效用。

**局限与未来工作。** 一个主要局限是**采样计算成本**：当前逆向时间 SDE 的时间离散需要约 1000 步去噪，对某些实际应用可能难以承受，通过模型蒸馏减少去噪步数是未来方向 [44]、[51]。另一局限是缺少**估计测量噪声协方差**的显式机制，而它直接影响扩散矩阵 $\mathbf G_t$ 的设定；一个自然的扩展是把 $\mathbf G_t$ 与模型参数**联合参数化并学习**，使扩散过程能自适应地刻画数据相关或任务特定的噪声结构，从而增强模型灵活性与表示能力——这条线索与近期向量值与多元扩散模型的进展相关。最后，虽然模型作为去噪先验表现良好，WS DM 要在无条件或有条件生成任务上取得有竞争力的结果仍需更多研究，有前景的方向包括隐扩散表述及相关技术 [12]、[42]、[41]。

**致谢。** 感谢 5022 - Chan Zuckerberg Initiative DAF（Silicon Valley Community Foundation 的受建议基金）的资助；感谢波士顿大学共享计算集群的计算资源。J.A. 感谢美国国家科学基金会研究生研究奖学金计划（GRFP）第 2234657 号资助。

## 参考文献（英文原书目）

以下按原文编号逐条转录（共 67 条）。为控制篇幅，条目保留作者、标题、出处与年份，原文中的 URL/DOI 从略（可在原文核对）。

[1] M. S. Albergo and E. Vanden-Eijnden, "Building normalizing flows with stochastic interpolants," 2023.

[2] E. Alexander, Q. Guo, S. Koppal, S. Gortler, and T. Zickler, "Focal Flow: Measuring Distance and Velocity with Defocus and Differential Motion," ECCV 2016, pp. 667–682.

[3] J. Alido et al., "Robust single-shot 3d fluorescence imaging in scattering media with a simulator-trained neural network," Opt. Express, vol. 32, no. 4, pp. 6241–6257, 2024.

[4] B. D. O. Anderson, "Reverse-time diffusion equation models," Stochastic Processes and their Applications, vol. 12, no. 3, pp. 313–326, 1982.

[5] B. Boys et al., "Tweedie moment projected diffusions for inverse problems," 2024.

[6] C. Broaddus et al., "Removing Structured Noise with Self-Supervised Blind-Spot Networks," ISBI 2020, pp. 159–163.

[7] G. Cardoso et al., "Monte carlo guided denoising diffusion models for bayesian linear inverse problems," ICLR 2024.

[8] D. Castanon, "Reverse-time diffusion processes (Corresp.)," IEEE Trans. Inf. Theory, vol. 28, no. 6, pp. 953–956, 1982.

[9] J. Choi et al., "ILVR: Conditioning method for denoising diffusion probabilistic models," 2021.

[10] J. Choi et al., "ILVR: Conditioning Method for Denoising Diffusion Probabilistic Models," ICCV 2021, pp. 14347–14356.

[11] H. Chung et al., "Diffusion Posterior Sampling for General Noisy Inverse Problems," 2024.

[12] H. Chung, J. C. Ye, P. Milanfar, and M. Delbracio, "Prompt-tuning latent diffusion models for inverse problems," 2024.

[13] G. Daras et al., "Soft Diffusion: Score Matching for General Corruptions," 2022.

[14] G. Daras et al., "A Survey on Diffusion Models for Inverse Problems," 2024.

[15] T. Dockhorn, A. Vahdat, and K. Kreis, "Score-based generative modeling with critically-damped langevin diffusion," arXiv:2112.07068, 2021.

[16] B. T. Feng et al., "Score-based diffusion models as principled priors for inverse imaging," ICCV 2023, pp. 10520–10531.

[17] W. Harvey et al., "Flexible diffusion modeling of long videos," NeurIPS, vol. 35, pp. 27953–27965, 2022.

[18] J. Ho, A. Jain, and P. Abbeel, "Denoising Diffusion Probabilistic Models," 2020.

[19] E. Hoogeboom and T. Salimans, "Blurring diffusion models," arXiv:2209.05557, 2022.

[20] Y. Hu et al., "Stochastic deep restoration priors for imaging inverse problems," 2025.

[21] D. Huang et al., "Optical Coherence Tomography," Science, vol. 254, no. 5035, pp. 1178–1181, 1991.

[22] A. Jalal et al., "Robust Compressed Sensing MRI with Deep Generative Priors," 2021.

[23] T. Jiralerspong et al., "Shaping inductive bias in diffusion models through frequency-based noise control," 2025.

[24] T. Karras, T. Aila, S. Laine, and J. Lehtinen, "Progressive growing of gans for improved quality, stability, and variation," arXiv:1710.10196, 2017.

[25] T. Karras, M. Aittala, T. Aila, and S. Laine, "Elucidating the Design Space of Diffusion-Based Generative Models," NeurIPS, vol. 35, pp. 26565–26577, 2022.

[26] T. Karras et al., "Analyzing and Improving the Training Dynamics of Diffusion Models," 2024.

[27] B. Kawar, G. Vaksman, and M. Elad, "SNIPS: Solving Noisy Inverse Problems Stochastically," 2021.

[28] B. Kawar, M. Elad, S. Ermon, and J. Song, "Denoising diffusion restoration models," 2022.

[29] A. Krizhevsky, "Learning Multiple Layers of Features from Tiny Images."

[30] T. Li, J. Zhu, Y. Shen, and L. Tian, "Reflection-mode diffraction tomography of multiple-scattering samples on a reflective substrate from intensity images," Optica, vol. 12, no. 3, pp. 406–417, 2025.

[31] H. Lin and C. Luo, "Demonstration of computational ghost imaging through fog," Optics & Laser Technology, vol. 182, p. 112075, 2025.

[32] R. Ling et al., "High-throughput intensity diffraction tomography with a computational microscope," Biomed. Opt. Express, vol. 9, no. 5, pp. 2130–2141, 2018.

[33] Y. Lipman et al., "Flow Matching for Generative Modeling," 2023.

[34] Y. Lipman et al., "Flow matching guide and code," 2024.

[35] X. Liu, C. Gong, and Q. Liu, "Flow straight and fast: Learning to generate and transfer data with rectified flow," 2022.

[36] Z. Liu, P. Luo, X. Wang, and X. Tang, "Deep learning face attributes in the wild," ICCV 2015.

[37] M. Mardani, J. Song, J. Kautz, and A. Vahdat, "A variational perspective on solving inverse problems with diffusion models," ICLR 2024.

[38] N. Murata et al., "Gibbsddrm: A partially collapsed gibbs sampler for solving blind inverse problems with denoising diffusion restoration," 2023.

[39] L. Möckl, A. R. Roy, P. N. Petrov, and W. E. Moerner, "Accurate and rapid background estimation in single-molecule localization microscopy using the deep neural network BGnet," PNAS, vol. 117, no. 1, pp. 60–67, 2020.

[40] K. Pandey, M. Rudolph, and S. Mandt, "Efficient integrators for diffusion generative models," arXiv:2310.07894, 2023.

[41] R. Rombach et al., "High-Resolution Image Synthesis with Latent Diffusion Models," 2022.

[42] L. Rout et al., "Beyond First-Order Tweedie: Solving Inverse Problems using Latent Diffusion," 2023.

[43] L. Rout et al., "Solving linear inverse problems provably via posterior sampling with latent diffusion models," NeurIPS 2023.

[44] T. Salimans and J. Ho, "Progressive Distillation for Fast Sampling of Diffusion Models," 2022.

[45] R. Singhal, M. Goldstein, and R. Ranganath, "Where to diffuse, how to diffuse, and how to get back: Automated learning for multivariate diffusions," arXiv:2302.07261, 2023.

[46] B. Song et al., "Solving inverse problems with latent diffusion models via hard data consistency," ICLR 2024.

[47] J. Song, A. Vahdat, M. Mardani, and J. Kautz, "Pseudoinverse-guided diffusion models for inverse problems," ICLR 2023.

[48] Y. Song and S. Ermon, "Generative Modeling by Estimating Gradients of the Data Distribution," 2020.

[49] Y. Song et al., "Score-Based Generative Modeling through Stochastic Differential Equations," 2021.

[50] Y. Song, L. Shen, L. Xing, and S. Ermon, "Solving inverse problems in medical imaging with score-based generative models," ICLR 2022.

[51] Y. Song, P. Dhariwal, M. Chen, and I. Sutskever, "Consistency Models," 2023.

[52] P. Sun, Y. Jiang, and T. Lin, "Unified continuous generative models," 2025.

[53] Y. Sun et al., "Provable Probabilistic Imaging Using Score-Based Generative Priors," IEEE Trans. Comput. Imag., vol. 10, pp. 1290–1305, 2024.

[54] S. Särkkä and A. Solin, Applied Stochastic Differential Equations. Cambridge University Press, 2019.

[55] B. L. Trippe et al., "Diffusion probabilistic modeling of protein backbones in 3d for the motif-scaffolding problem," ICLR 2023.

[56] T. Tsukui et al., "Estimating the statistical uncertainty due to spatially correlated noise in interferometric images," J. Astron. Telesc. Instrum. Syst., vol. 9, no. 1, p. 018001, 2023.

[57] A. van der Schaaf and J. H. van Hateren, "Modelling the power spectra of natural images: Statistics and information," Vision Research, vol. 36, no. 17, pp. 2759–2770, 1996.

[58] P. Vincent, "A Connection Between Score Matching and Denoising Autoencoders," Neural Computation, vol. 23, no. 7, pp. 1661–1674, 2011.

[59] L. Waller, L. Tian, and G. Barbastathis, "Transport of Intensity phase-amplitude imaging with higher order intensity derivatives," Optics Express, vol. 18, no. 12, pp. 12552–12561, 2010.

[60] H. Wang et al., "DMPlug: A plug-in method for solving inverse problems with diffusion models," 2024.

[61] Z. Wu et al., "Principled probabilistic imaging using diffusion models as plug-and-play priors," 2024.

[62] A. Zafari and S. Jalali, "Bayesian Despeckling of Structured Sources," 2025.

[63] B. Zhang et al., "Improving Diffusion Inverse Problem Solving with Decoupled Noise Annealing," 2024.

[64] X. Zhang, Z. Mao, N. Chimitt, and S. H. Chan, "Imaging Through the Atmosphere Using Turbulence Mitigation Transformer," IEEE Trans. Comput. Imag., vol. 10, pp. 115–128, 2024.

[65] Y. Zhang et al., "Flow Priors for Linear Inverse Problems via Iterative Corrupted Trajectory Matching," 2025.

[66] H. Zheng et al., "Inversebench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences," 2025.

[67] Y. Zhu et al., "Denoising diffusion models for plug-and-play image restoration," 2023.

## 附录 A：去噪白化分数匹配

**引理 A.1（非对角协方差的广义 Tweedie 公式）。** 设

$$
\mathbf x_t=\alpha_t\mathbf x_0+\mathbf z,\tag{18}
$$

其中 $\mathbf x_0\sim p(\mathbf x)$、$\mathbf z\sim\mathcal N(\mathbf 0,\boldsymbol\Sigma)$，则

$$
\alpha_t\mathbb E[\mathbf x_0\mid\mathbf x_t]=\mathbf x_t+\boldsymbol\Sigma\nabla_{\mathbf x_t}\log p_t(\mathbf x_t).\tag{19}
$$

**证明。** 从分数定义出发

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)=\frac{\nabla_{\mathbf x_t}p_t(\mathbf x_t)}{p_t(\mathbf x_t)}=\frac{1}{p_t(\mathbf x_t)}\nabla_{\mathbf x_t}\int p_t(\mathbf x_t,\mathbf x_0)\,\mathrm d\mathbf x_0,
$$

其中把联合分布去边缘化；再用 Bayes 法则把联合分布分解为 $p_t(\mathbf x_t\mid\mathbf x_0)p_0(\mathbf x_0)$，把梯度移入积分，并利用恒等式 $\nabla f=f\nabla\log f$：

$$
=\frac{1}{p_t(\mathbf x_t)}\int p_t(\mathbf x_t\mid\mathbf x_0)\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)p_0(\mathbf x_0)\,\mathrm d\mathbf x_0.
$$

代入高斯条件分数 $\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)=\boldsymbol\Sigma^{-1}(\alpha_t\mathbf x_0-\mathbf x_t)$，并在后验下取期望，即得 (19)。$\square$

代入高斯条件分数 $\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)=\boldsymbol\Sigma^{-1}(\alpha_t\mathbf x_0-\mathbf x_t)$，并在后验下取期望，即得 (19)。$\square$

**定理 A.2（去噪白化分数匹配）。** 本文的白化分数匹配损失（即 (13)），在此重述为

$$
\mathcal L=\mathbb E_{t\sim\mathcal U(0,1],\,\mathbf x_t\sim p(\mathbf x_t\mid\mathbf x_0),\,\mathbf x_0\sim p(\mathbf x)}\left[\left\lVert\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)-\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)\right\rVert_2^{2}\right]\tag{20}
$$

是使用条件概率估计 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 的去噪目标；下面证明该损失给出 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 的估计器。

**证明。** 令 $p(\mathbf x_t\mid\mathbf x_0)$ 为 (8) 前向 SDE 对应的高斯概率转移核。对 $\mathbf x_t$ 的线性 SDE，转移核协方差 $\boldsymbol\Sigma_t$ 是扩散矩阵 $\mathbf G_t\mathbf G_t^{\top}$ 的**两倍标量倍** [54]（在 $p(\mathbf x_t\mid\mathbf x_0)$ 的初值 $\boldsymbol\mu(0)=\mathbf x_0$、$\boldsymbol\Sigma(0)=\mathbf 0$ 下）：

$$
\boldsymbol\Sigma_t=c\,\mathbf G_t\mathbf G_t^{\top}.\tag{21}
$$

最小均方误差（MMSE）估计 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$ 通过优化如下最小二乘目标得到：

$$
\min_{\boldsymbol\theta}\ \mathbb E_{\mathbf x_t\sim p_t(\mathbf x_t\mid\mathbf x_0),\,\mathbf x_0\sim p(\mathbf x)}\left[\left\lVert\mathbf h_{\boldsymbol\theta}(\mathbf x_t)-\mathbf x_0\right\rVert_2^{2}\right],\tag{22}
$$

使最优网络参数 $\boldsymbol\theta^{*}$ 满足 $\mathbf h_{\boldsymbol\theta^{*}}(\mathbf x_t)=\mathbb E[\mathbf x_0\mid\mathbf x_t]$。由引理 A.1 的 Tweedie 公式，

$$
\alpha_t\mathbf h_{\boldsymbol\theta^{*}}(\mathbf x_t)=\mathbf x_t+\boldsymbol\Sigma\nabla_{\mathbf x_t}\log p_t(\mathbf x_t).\tag{23}
$$

把 $\mathbf h_{\boldsymbol\theta}(\mathbf x_t)$ 参数化为

$$
\mathbf h_{\boldsymbol\theta}(\mathbf x_t)=\frac{\mathbf x_t+c\,\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)}{\alpha_t},\tag{24}
$$

其中 $c,\alpha_t\in\mathbb R$ 为标量、$\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)$ 为本文对 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 的模型，则 (22) 的 MMSE 目标变为

$$
\min_{\boldsymbol\theta}\ \mathbb E_{\mathbf x_t\sim p_t(\mathbf x_t\mid\mathbf x_0),\,\mathbf x_0\sim p(\mathbf x)}\left[\left\lVert\mathbf x_t+c\,\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)-\alpha_t\mathbf x_0\right\rVert_2^{2}\right],\tag{25}
$$

经由 (12) 中 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf x_0)$ 的闭式，它等价于 (20)（即 (13)）。最优 $\boldsymbol\theta^{*}$ 满足

$$
\mathbf h_{\boldsymbol\theta^{*}}(\mathbf x_t)=\mathbb E[\mathbf x_0\mid\mathbf x_t]=\frac{\mathbf x_t+c\,\mathbf n_{\boldsymbol\theta^{*}}(\mathbf x_t,t)}{\alpha_t}=\frac{\mathbf x_t+\boldsymbol\Sigma\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)}{\alpha_t},\tag{26}
$$

这证明了模型 $\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)$ 通过目标 (20) 学到 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$。$\square$

## 附录 B：SDE 框架下的流匹配

考虑概率路径

$$
p_t=\mathcal N\left(\mathbf x_t\mid\boldsymbol\mu_t(\mathbf x_0),\boldsymbol\Sigma_t(\mathbf x_0)\right),\tag{27}
$$

及其对应的连续归一化流

$$
\boldsymbol\phi_t(\mathbf x_0)=\boldsymbol\mu_t(\mathbf x_0)+\boldsymbol\Sigma_t^{\frac{1}{2}}(\mathbf x_0),\tag{28}
$$

其中定义 $\boldsymbol\Sigma_t^{\frac{1}{2}}(\mathbf x_0)$ 使 $\operatorname{Cov}[\boldsymbol\phi_t(\mathbf x_0)]=\boldsymbol\Sigma_t(\mathbf x_0)=\boldsymbol\Sigma_t^{\frac{1}{2}}(\mathbf x_0)(\boldsymbol\Sigma_t^{\frac{1}{2}}(\mathbf x_0))^{\top}$，初值 $\boldsymbol\mu_0(\mathbf x_0)=\mathbf x_0$。该概率路径等价于由 (8) 的线性 SDE（漂移系数 $\mathbf F_t$、扩散矩阵 $\mathbf G_t$）定义的概率转移核 (9)。因此可用 Fokker–Planck 方程（见 [54] 式 (6.2)）得到均值与协方差函数的时间导数：

$$
\boldsymbol\Sigma_t'(\mathbf x_0)=2\mathbf F_t\boldsymbol\Sigma_t(\mathbf x_0)+\mathbf G_t\mathbf G_t^{\top},\tag{29}
$$
$$
\boldsymbol\mu_t'(\mathbf x_0)=\mathbf F_t\boldsymbol\mu_t(\mathbf x_0).\tag{30}
$$

高斯概率路径的 FM 条件向量场为

$$
\mathbf u_t(\mathbf x_t\mid\mathbf x_0)=\boldsymbol\Sigma_t'(\mathbf x_0)\boldsymbol\Sigma_t^{-1}(\mathbf x_0)\left(\mathbf x_t-\boldsymbol\mu_t(\mathbf x_0)\right)+\boldsymbol\mu_t'(\mathbf x_0),\tag{31}
$$

把 (29)、(30) 代入 (31) 得

$$
\mathbf u_t(\mathbf x_t\mid\mathbf x_0)=\boldsymbol\Sigma_t'(\mathbf x_0)\boldsymbol\Sigma_t^{-1}(\mathbf x_0)\left(\mathbf x_t-\boldsymbol\mu_t(\mathbf x_0)\right)+\boldsymbol\mu_t'(\mathbf x_0)\tag{32}
$$
$$
=\left(2\mathbf F_t+\mathbf G_t\mathbf G_t^{\top}\boldsymbol\Sigma_t^{-1}(\mathbf x_0)\left(\mathbf x_t-\alpha_t\mathbf x_0\right)\right)+\mathbf F_t\boldsymbol\mu_t(\mathbf x_0)\tag{33}
$$
$$
=2\mathbf F_t\mathbf x_t-\mathbf F_t\alpha_t\mathbf x_0+\mathbf G_t\mathbf G_t^{\top}\boldsymbol\Sigma_t^{-1}(\mathbf x_0)\left(\mathbf x_t-\alpha_t\mathbf x_0\right)\tag{34}
$$
$$
=\mathbf F_t\left(2\mathbf x_t-\alpha_t\mathbf x_0\right)-\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0).\tag{35}
$$

## 附录 C：成像逆问题

**透过雾/湍流成像。** 本文把透过雾/湍流成像简化为相关噪声去噪问题，即设成像系统 $\mathbf A=\mathbf I$；具体地，展示对由二维高斯核（以标准差为参数）滤波的灰度低通白高斯噪声的去噪。所提模型经训练可去除相关噪声，并能区分目标图像特征与各向异性高斯噪声特征，即便二者共享相似的空间频率支撑。相反，仅训练去噪各向同性高斯噪声的传统 DM 在 $\lambda$ 足够小时会去除图像特征，因为它把相关加性噪声误认为目标特征。如图 6 所示，CIFAR 的加性噪声支撑之外平均有更多图像特征，而 CelebA 的图像特征支撑与噪声支撑重叠更紧密。CelebA-HQ（$256\times256$）数据集上的额外结果见图 7。

**运动去模糊。** 运动模糊是计算摄影中常见的图像退化。本文对 CIFAR 使用 5 像素、CelebA 使用 7 像素的空间不变水平运动模糊核；加性相关噪声为高斯滤波的灰度白高斯噪声（WGN），CIFAR 用标准差 2.5 像素的圆形核、CelebA 用 5 像素，二者 SNR 均为 0.493。结果见图 5 与图 8。

**镜头去模糊。** 镜头模糊是指由于有限孔径使光线聚焦不完美，导致点源光线在像面扩散到一片区域而非汇聚到单点，从而损失高空间频率信息。它可有效建模为圆形高斯核与干净图像的卷积。图 5 与图 8 展示本文 WS 扩散先验在镜头去模糊上的结果：CIFAR 与 CelebA 的高斯模糊核标准差分别为 0.8 与 1.0；加性相关噪声为高斯滤波灰度 WGN，CIFAR 用标准差 2.5 像素、CelebA 用 5 像素的圆形核，二者 SNR 均为 0.810。

**线性逆散射。** 逆散射是光学成像中的常见方向，目标是从斜照明下的测量恢复介电常数场。强度衍射层析（IDT）是一种强计算显微技术，可由一组二维测量恢复三维折射率分布。用第一 Born 近似可把模型线性化 [32]：

$$
u(\mathbf r)=u_i(\mathbf r)+\int u_i(\mathbf r')V(\mathbf r')G(\mathbf r-\mathbf r')\,\mathrm d\mathbf r',\tag{36}
$$

其中 $u(\mathbf r)$ 为测量平面处场、$u_i(\mathbf r)$ 为入射场，散射势 $V(\mathbf r)=\frac{1}{4\pi}k_0^{2}\Delta\epsilon(\mathbf r)$、介电常数对比 $\Delta\epsilon(\mathbf r)=\epsilon(\mathbf r)-\epsilon_0$（样本 $\epsilon(\mathbf r)$ 与周围介质 $\epsilon$ 之间），波数 $k_0=2\pi/\lambda$（$\lambda$ 为照明波长），Green 函数 $G(\mathbf r)=\exp(\mathrm ik|\mathbf r|)/r$ 且 $k=\sqrt{\epsilon_0}k_0$。当照明为透射式（称为透射强度衍射层析，tIDT，光穿过样本）时，线性算子 $\mathbf A$ 产生类似圆环截面的掩膜、衰减 Fourier 系数（图 9、图 10），导致著名的**缺失锥**问题。在反射式 IDT（rIDT）中，把样本置于镜面基底上使光反射向相机，可采集额外轴向频率分量并部分填补缺失锥（图 9、图 10）。本文对 tIDT 与 rIDT 实验，测量受低通滤波灰度 WGN 污染以模拟显微中常见的背景噪声：灰度噪声同样经高斯滤波，CIFAR 与 CelebA 的标准差分别为 2.5 与 5，SNR 为 0.632。

**微分离焦。** 微分离焦是一种从一系列离焦测量恢复深度图的计算成像技术 [2]。其线性算子可用二维 Laplacian 核实现，对中频分量带通；在计算显微中这又称**强度传输（TIE）成像** [59]，用于恢复物体的相位与幅度。图 11 展示本文框架在微分离焦问题上的结果：噪声仍为高斯核滤波灰度 WGN，CIFAR 与 CelebA 标准差分别为 2.5 与 5，SNR 为 12.91；本文还与 Tikhonov 正则化（对物体的 $L_2$ 范数先验，用于约束重建能量）比较。

## 附录 D：生成建模

本文另训练 6 个模型，令高斯模糊核 $\mathbf K$ 的最大标准差从 delta 函数（各向同性高斯噪声）变化到 $\mathrm{std}_{\max}=5$ 像素；训练中 $\mathbf K$ 在标准差 0.1 到 $\mathrm{std}_{\max}$ 间均匀变化。新样本通过求解概率流 ODE 产生，即用优化后的模型 $\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)$ 替换 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$，采用 Euler–Maruyama 离散，$T=1000$、$\beta_{\min}=0.01$、$\beta_{\max}=20$，初始噪声 $\mathbf x_T\sim\mathcal N(\mathbf 0,\mathbf K_{\mathrm{std}_{\max}}\mathbf K_{\mathrm{std}_{\max}}^{\top})$。如图 12 所示，**FID 分数随空间相关范围增大而下降**。虽然 WS DM 作为逆问题的生成去噪先验表现良好，其生成能力的进一步研究留待未来工作。

## 附录 E：前向一致性损失

模型 $\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)$ 被训练来逼近前向 SDE 中把 $\mathbf x_0$ 扰动为 $\mathbf x_t$ 的缩放噪声分量，因此 (12) 中的分数函数 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)$ 可用模型预测替代。为强制与前向扩散过程一致，本文引入辅助损失项

$$
\mathcal L_2=\mathbb E_{t\sim\mathcal U(0,1],\,\mathbf x_0\sim p(\mathbf x),\,\mathbf x_t\sim p(\mathbf x_t\mid\mathbf x_0)}\left[\left\lVert\frac{\mathbf x_0-\beta_t\mathbf x_t+(1-\alpha_t^{2})\mathbf n_{\boldsymbol\theta}(\mathbf x_t,t)}{\beta_t\alpha_t}\right\rVert_2^{2}\right].\tag{37}
$$

期望内的项表示基于含噪样本 $\mathbf x_t$ 与模型预测 $\mathbf n_{\boldsymbol\theta}$ 对 $\mathbf x_0$ 的重建。最小化 $\mathcal L_2$ 促使模型忠实于前向 SDE 定义的生成过程。经验上，把 $\mathcal L_2$ 作为辅助目标（与主损失 $\mathcal L$ 等权）可提升训练稳定性并加快收敛。

## NeurIPS 论文检查表（摘译）

原文附录后附 16 项 NeurIPS 论文检查表，各项答案与要点如下（问题文字为原文问题的中文概括，答案为原文所填）：

1. **声明（Claims）：** 是——摘要与引言明确陈述核心创新（学习白化分数以处理各向异性高斯过程），声明与理论推导、实验验证一致。
2. **局限（Limitations）：** 是——文中讨论了其在生成任务上的次优表现。
3. **理论假设与证明：** 是——附录中给出明确假设与逐步证明。
4. **实验结果可复现性：** 是——训练与超参数选择细节均在实验节给出。
5. **数据与代码开放获取：** 是——提供仓库链接，数据集为公开数据集。
6. **实验设置/细节：** 是——全部训练与测试细节在实验节描述。
7. **实验统计显著性：** 不适用——实验为图像重建，无法给出误差棒。
8. **实验计算资源：** 是——计算资源细节在实验节给出。
9. **伦理准则：** 是——研究遵循 NeurIPS 伦理准则，为方法学贡献，不涉及人类受试者、敏感数据或可预见的社会危害。
10. **更广泛影响：** 不适用——本文为扩散建模的理论与算法贡献，无直接部署含义，未讨论社会影响。
11. **防护措施（Safeguards）：** 不适用——不发布有高误用风险的模型或数据。
12. **现有资产的许可：** 是——CIFAR-10 与 CelebA 数据集均已引用。
13. **新资产：** 不适用——未引入新资产。
14. **众包与人类受试者研究：** 不适用——未使用众包或人类受试者。
15. **IRB 批准：** 不适用——无人受试者。
16. **LLM 使用声明：** 不适用——未使用 LLM。

## 图注与表注

**图 1：** 本框架支持任意高斯扩散过程，使我们能在多样的结构化噪声上训练去噪 DM，并应用于多种受相关结构化噪声污染的成像逆问题（图中示意 $k_x$–$k_z$ 谱域下的噪声支撑与重建流程）。

**图 2：** CIFAR10 与 CelebA（$64\times64$）上的相关噪声去噪。将本文在**各向异性**高斯噪声上训练的 WS DM 与在**各向同性**高斯噪声上训练的传统 DM（conv）对比。左：固定 SNR 为 0.26 的结果；右：使用加性灰度噪声（CIFAR10 与 CelebA 分别由标准差 2.5 与 5 像素的高斯核滤波）使 SNR 从 1.4 降到 0.12 的测量 $\mathbf y$。PSNR 以白字标注。

**图 3：** 对条件数 $\kappa(\boldsymbol\Sigma)=1.0$、$2.6$、$19$ 的二维高斯转移核 $p(\mathbf x_t\mid\mathbf x_0)$，$\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)$ 向量场（白）与 $\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)$ 向量场（红）的对比。

**图 4：** 左下角给出不同协方差矩阵的测量噪声。白字为 CIFAR10 与 CelebA（$64\times64$）验证集样本图像的 PSNR。相比仅在**各向同性**高斯噪声上训练的 DM，WS 模型能更优地去噪相关噪声；对不相关噪声（第一行），性能与传统 DM 相近。

**图 5：** 含标准差 2.5 像素的加性空间相关灰度高斯噪声时，CIFAR10 上的运动去模糊与镜头去模糊。WS 扩散先验持续去除相关噪声，PSNR 高于仅在各向同性高斯噪声上训练的 DM。

**图 6：** 正则参数 $\lambda$ 对去噪的影响。上排为 CIFAR 与 CelebA 图像的平均功率谱密度，红色虚线圆表示加性相关噪声的频率支撑。改变 $\lambda$ 对 WS 扩散先验（上）与传统扩散先验（下）重建的影响；$\lambda=0$ 等价于从 $p(\mathbf x)$ 采样，$\lambda$ 增大时测量保真项压过生成建模效果，重建趋近测量 $\mathbf y$。

**图 7：** CelebA-HQ（$256\times256$）上的相关噪声去噪（WS DM vs. 传统 DM）；测量含标准差 5 像素的加性灰度高斯噪声。

**图 8：** CIFAR10 上含标准差 2.5 像素加性空间相关灰度高斯噪声时的运动去模糊与镜头去模糊（原文图注标注为 CIFAR10/ CelebA 结果，正文对应 CelebA 结果）。

**图 9：** CIFAR 上的线性逆散射（tIDT 与 rIDT 的 real/fourier 分量、ground truth、测量、传统方法与本文方法）。

**图 10：** CelebA（$64\times64$）上的线性逆散射（tIDT 与 rIDT）。

**图 11：** Laplace 成像 / 强度传输（TIE），含与 Tikhonov 正则化的比较（CIFAR10 与 CelebA）。

**图 12：** 在不同 $\mathrm{std}_{\max}$ 上训练的 WS DM 的 FID 分数（isotropic、std=1.0、2.0、3.0、4.0、5.0 时 FID 分别为约 107.2、88.3、40.0、18.5、148.3、164.2）。

**表注：** 原文无数值表格；主要定量结果以图像与图注中的 PSNR/FID 数值呈现（图 12 的 FID 数值见上）。

## 本页范围与校对状态

**覆盖范围：** 本页为 NeurIPS 2025 论文集版本（28 页）的全文中文译稿，按原文结构译出：摘要；第 1 节引言；第 2 节背景（2.1 基于分数的扩散模型、2.2 结构化前向过程、2.3 流匹配、2.4 基于扩散先验的成像逆问题）；第 3 节白化分数扩散（3.1 白化分数匹配目标、3.2 对 WS 的解释与 FM 联系、3.3 成像逆问题的 WS 扩散先验与算法 1）；第 4 节实验（4.1 训练细节、4.2 相关噪声下的成像逆问题）；第 5 节结论与局限；致谢；附录 A（去噪白化分数匹配：引理 A.1、定理 A.2 及证明）、附录 B（SDE 框架下的流匹配）、附录 C（成像逆问题：雾/湍流、运动与镜头去模糊、线性逆散射、微分离焦）、附录 D（生成建模与 FID）、附录 E（前向一致性损失）；NeurIPS 论文检查表 16 项（摘译）；67 条英文参考文献；图 1—图 12 图注。

**源文页码：** 第 1—2 页（题名、作者、摘要、引言、图 1）→ 第 2—4 页（第 2 节背景）→ 第 4—7 页（第 3 节、图 2—图 3、算法 1）→ 第 8—10 页（第 4 节实验、图 4—图 6）→ 第 10 页（第 5 节结论与局限）→ 第 11 页（致谢、参考文献起始）→ 第 11—15 页（参考文献 [1]—[67]）→ 第 16—17 页（附录 A、B）→ 第 17—21 页（附录 C 与图 7—图 11、附录 D—E、图 12）→ 第 22—28 页（NeurIPS 论文检查表）。

**校对状态与限制：**

1. 逐句逐式人工终校未做。原文**无数值表格**，主要定量结果为图与图注中的 PSNR/FID 数值（已在图注与正文中译出，未做图像级数字重构）；图 12 的 FID 数值按原文图注转录。
2. 图 1—图 12 均未上传图片；本页以"图注与表注"小节统一给出 12 条中文图注，正文按"图 N"引用。
3. 公式覆盖原文编号式 (1)—(37)，全部保留原编号；附录 A、B 的全部证明步骤按原文译出。
4. **参考文献处理：** 共 67 条，条目保留作者、标题、出处与年份，**原文中的 URL/DOI 从略**（页面以学习用途发布、许可待核，条目文字与原文可在原 PDF 核对）。
5. **原文疑点／说明：** ①原文第 4.2 节图 8 的图注文字写作 "Motion and lens deblurring on CIFAR10 dataset..."，而正文与图 5 对应 CIFAR、图 8 对应 CelebA，原文图注存在数据集标注不一致，本页按原文照录并在图注中提示；②原文 (21) 中 $\boldsymbol\Sigma_t=c\mathbf G_t\mathbf G_t^{\top}$ 的常数 $c$ 与 (24) 中的 $c$ 复用同一符号，本页照录；③原文附录 B 式 (28) 把连续归一化流写作 $\boldsymbol\phi_t(\mathbf x_0)=\boldsymbol\mu_t(\mathbf x_0)+\boldsymbol\Sigma_t^{1/2}(\mathbf x_0)$（缺噪声项），本页照录；④NeurIPS 检查表为原文组成部分，本页以摘译方式给出答案与要点，未逐字翻译全部指南说明。
6. **许可与登记：** 原文为 NeurIPS 2025 会议论文集版本，再传播许可**待核验**；本页仅作学习用途、**不计入本站可公开全文统计**，页面顶部与状态段均已注明。
7. 版权：本页为中文翻译页面，未上传原文 PDF；如后续确认许可，再按站点流程更新发布状态。

{% endraw %}