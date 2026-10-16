---
layout: page
title: "利用生成先验的半盲 MMSE 信道估计策略｜中文译稿（校对中）"
permalink: /papers/translations/2026-10-16-semi-blind-generative-priors-2504-17573/
math: true
toc: true
---

[← 论文库](/papers/) · [原文](https://arxiv.org/abs/2504.17573) · [PDF](https://arxiv.org/pdf/2504.17573v2) · [推荐记录](/papers/items/75bb9a72af1f9eb2/)

# 利用生成先验的半盲 MMSE 信道估计策略

**原题：** Semi-Blind Strategies for MMSE Channel Estimation Utilizing Generative Priors  
**作者：** Franz Weißer、Nurettin Turan、Dominik Semmler、Fares Ben Jazia、Wolfgang Utschick  
**单位：** 慕尼黑工业大学（TUM）计算、信息与技术学院  
**来源：** arXiv:2504.17573v2，2025 年 10 月 21 日，15 页。作者注明已投稿 IEEE，部分早期结果曾见于 ICASSP 2024 [1]。  
**范围：** 逐节翻译原文与附录，保留公式编号、定理、算法、表格和图题。原 PDF 不重复上传。  
**状态：** 中文译稿尚未通过逐式终校，不能视作已验收全文。

## 摘要

本文研究大规模多输入多输出（MIMO）系统中的半盲信道估计。首先利用全部接收符号（包括导频和有效载荷）估计一个子空间，为后续信道估计提供额外信息，从而提高最小均方误差（MMSE）估计性能。

本文提出线性 MMSE（LMMSE）估计器的两种变体：第一种在估计子空间内求解，第二种将子空间投影作为预处理。理论分析表明，对于空间不相关的瑞利衰落，第二种方案的 MSE 更低；渐近分析还说明所提出的允许有偏的 MMSE 策略可以优于无偏估计的 Cramér–Rao 界（CRB）。

随后，利用两类条件高斯潜变量模型——高斯混合模型（GMM）与变分自编码器（VAE）——对半盲 LMMSE 估计器进行参数化。这两类模型通过训练数据学习传播环境的潜在信道分布，作为半盲信道估计的生成先验。基于真实测量数据与空间信道模型的大量仿真表明，所提方法在 MSE 上优于现有先进半盲估计器。

**关键词：** 半盲信道估计、高斯混合模型、变分自编码器、实测数据。

## I. 引言

准确的信道状态信息（CSI）是实现 MIMO 系统高数据速率的关键 [2]–[4]。CSI 描述具有时变与频率选择性、可能快速改变的收发链路，使估计任务变得复杂 [5]。准确的 CSI 对数据传输至关重要，因此成为长期研究重点 [6]、[7]。

传统无线通信通常占用部分无线资源块发送已知训练或导频符号 [8]，接收机据此估计 CSI。由于导频数量随用户数量增加，用户增多时可用于载荷数据的资源减少，频谱效率下降。为了在不增加导频数量的情况下改善 CSI 估计，人们探索了许多利用接收载荷符号中所含信道信息的方法 [9]–[25]。这些方法借助传输数据的结构与冗余得到更准确的 CSI。

文献 [9] 首先讨论了 SIMO 中盲、半盲和基于训练的信道估计 CRB。[10]、[11] 引入 ML 型半盲信道估计，并在 [10] 研究数据序列长度趋于无穷时的渐近性能；[12] 则分析天线数趋于无穷的行为，发现两种在大型阵列极限下仍无法消失的半盲干扰分量。[13] 通过半盲算法改善 LS 估计；[14] 在 massive MIMO 中利用半盲与盲估计增强 MAP 信道估计，但依赖大型基站阵列才能满足的有利传播条件。[15] 使用 EM 开发两种半盲估计器，并验证数据高斯假设以构造闭式 E 步。[16]、[17] 采用消息传递迭代优化似然；[18] 使用仿射预编码叠加导频，在 OTFS 系统中进行数据辅助迭代估计。这些方案通常需要昂贵的迭代更新。[19] 提出了 massive MIMO Turbo 接收机的低复杂度迭代 LS；[20] 把半盲估计用于时域同步 OFDM，利用保护间隔中的伪噪声序列和载荷 OFDM 数据。判决导向方法 [21]–[23] 把可靠解码数据作为额外导频，同样需要复杂迭代。[24] 选择 OFDM 峰值功率载波来避免识别可靠数据。近期扩散模型方案 [25] 则从带噪观测建模信道与符号的联合分布，进行联合信道估计和检测。

许多先进方案属于无偏估计器，但无偏不代表 MSE 最优。本文研究一般的、可能有偏的基于导频的估计器，利用信道分布先验最小化 MSE，并探索它们在半盲场景下的扩展。不同于主要利用解码数据作为附加导频的 [21]–[23]，本文主要改进估计器本身，尽管两种方向可以组合。[26] 曾利用 MMSE 的子空间形式减轻 massive MIMO 中的导频污染。

MMSE 估计器是条件均值估计器（CME）[27, Ch. 10]，但一般没有闭式解。机器学习能够通过训练阶段获取先验，形成可计算近似 [28]–[32]。给定基站小区的潜在用户信道概率密度本身是有价值的先验，但真实分布未知，因此通常假设基站可获得具有代表性的信道数据集，并从中学习其 PDF。[28] 最早在图像处理中用 GMM 构造估计器；[30]–[32] 则为基站场景建立条件高斯潜变量模型（conditionally Gaussian latent model，CGLM）。CGLM 可用于 MMSE 信道估计 [30]–[32]，也可以服务于有限反馈 [33]。本文以 CGLM 对半盲 CME 进行参数化。

主要贡献包括：第一，提出两种结合载荷数据子空间知识的 LMMSE：在子空间内求解，以及可预计算滤波器的投影预处理；第二，在已知完美子空间与空间不相关瑞利衰落时证明投影法更低的 MSE；第三，给出投影 LMMSE 优于无偏 CRB 的渐近条件，突出允许有偏的 MMSE 估计优势；第四，说明 GMM [30] 和 VAE [32] 如何为半盲 LMMSE 参数化；第五，基于真实测量与多用户 massive MIMO 空间模型广泛测试。

本文早期结果见 [1] 和 [34]；这里的扩展在第三节增加理论分析，把框架推广到 CGLM 类，并给出更全面的实验。本文使用粗体向量/矩阵，$\mathbf0$ 和 $\mathbf I_N$ 分别为零向量与单位阵，$\mathbb E$、$\operatorname{tr}$、$\operatorname{range}$ 分别为期望、迹及列空间，$(\cdot)^{\rm T}$、$(\cdot)^{\rm H}$、$(\cdot)^{-1}$、$(\cdot)^\dagger$ 分别为转置、共轭转置、逆和伪逆，$\|\cdot\|$ 为二范数，$\mathcal N_{\mathbb C}(\boldsymbol\mu,\mathbf C)$ 为圆对称复高斯分布。

## II. 系统与信道模型

考虑 $J$ 个单天线用户、基站 $M$ 根接收天线构成的多用户系统，以研究上行为主，方法可延伸至下行。第 $n$ 时刻接收向量为

$$
\mathbf y(n)=\mathbf H\mathbf x(n)+\mathbf n(n),
\qquad n=1,\ldots,N.\tag{1}
$$

其中 $\mathbf x(n)=[x_1(n),\ldots,x_J(n)]^{\rm T}\in\mathbb C^J$，$\mathbf n(n)\in\mathbb C^M$，$\mathbf H=[\mathbf h_1,\ldots,\mathbf h_J]$ 包含各用户信道 $\mathbf h_j\in\mathbb C^M$。多天线用户可把每个活动流看作独立用户，转换为式 (1)。下行场景也需要能够辨识有效信道的某个子空间，例如激活自由度少于接收天线数。

假设相干区间大于 $N$ 个快照长度，因此信道在观测期间不变。噪声满足 $\mathbf n(n)\sim\mathcal N_{\mathbb C}(\mathbf0,\sigma^2\mathbf I_M)$，发送符号满足 $\mathbb E[\mathbf x(n)\mathbf x(n)^{\rm H}]=\mathbf I_J/J$。

每用户的 $N_p$ 个上行导频对基站已知。把导频和有效载荷分别堆叠：

$$
\mathbf Y=[\mathbf Y_p',\mathbf Y_d]
=\mathbf H[\mathbf P,\mathbf D]+\mathbf N
=\mathbf H\mathbf X+\mathbf N.\tag{2}
$$

$\mathbf Y\in\mathbb C^{M\times N}$，$\mathbf Y_p'\in\mathbb C^{M\times N_p}$，$\mathbf Y_d\in\mathbb C^{M\times(N-N_p)}$，$\mathbf P\in\mathbb C^{J\times N_p}$ 是导频，$\mathbf D=[\mathbf d_1,\ldots,\mathbf d_J]^{\rm T}$ 是数据。第 $j$ 个用户的载荷符号来自星座集 $\mathcal S_j$，不同用户星座可以不同。导频数量至少为 $N_p\ge J$，采用正交导频，并令 $\mathbf P\mathbf P^{\rm H}=(N_p/J)\mathbf I_J$，用 $N_p$ 阶 DFT 子矩阵构建。

去相关后导频观测为

$$
\mathbf Y_p=\mathbf Y_p'\mathbf P^\dagger
=\mathbf H+\sqrt{\frac J{N_p}}\mathbf N_p.\tag{3}
$$

从而可逐用户研究信道估计并省去用户下标：

$$
\mathbf y_p=\mathbf h+\mathbf n,\tag{4}
$$

其中 $\mathbf n\sim\mathcal N_{\mathbb C}(\mathbf0,\sigma_{\rm eff}^2\mathbf I_M)$，$\sigma_{\rm eff}^2=\sigma^2J/N_p$。把信道归一化为 $\mathbb E\|\mathbf h\|^2=M$，定义 $\mathrm{SNR}=\sigma^{-2}$。导频数只对有效 SNR 形成缩放，下文取 $N_p=J$。

### A. 空间信道模型

根据 [35]，多径簇参数 $\boldsymbol\delta$ 给定时，信道条件高斯分布为 [29]

$$
\mathbf h\mid\boldsymbol\delta
\sim\mathcal N_{\mathbb C}(\mathbf0,\mathbf C_{\boldsymbol\delta}).\tag{5}
$$

$\boldsymbol\delta$ 描述传播簇方向与性质。簇中心角在 $[0,2\pi]$ 独立均匀抽取，路径增益独立且服从零均值高斯分布。空间协方差是

$$
\mathbf C_{\boldsymbol\delta}
=\int_{-\pi}^{\pi}g(\vartheta,\boldsymbol\delta)
\mathbf a(\vartheta)\mathbf a(\vartheta)^{\rm H}
\,\mathrm d\vartheta,\tag{6}
$$

$g$ 是多个 Laplace 密度的加权和，标准差 $\sigma_{\rm AS}$ 对应传播簇角扩展。基站采用 $M$ 元 ULA，阵元间隔半波长：

$$
\mathbf a(\vartheta)=\frac1{\sqrt M}
[1,e^{-j\pi\sin\vartheta},\ldots,
e^{-j\pi(M-1)\sin\vartheta}]^{\rm T}.\tag{7}
$$

每个样本重新抽取 $\boldsymbol\delta$，随后按 $\mathcal N_{\mathbb C}(\mathbf0,\mathbf C_{\boldsymbol\delta})$ 生成信道。

### B. 测量活动

合成信道不能完全覆盖真实 CSI 的特征，因此还使用 [36] 于 2017 年 10–11 月在德国斯图加特 Nokia 园区采集的实测数据。基站 URA 具有 $N_v=4$ 个竖直单极化贴片天线（阵元间距 $\lambda$）和 $N_h=16$ 个水平阵元（间距 $\lambda/2$），载波频率 2.18 GHz，天线安装于离地约 20 m 的楼顶，其他细节见 [36]。
