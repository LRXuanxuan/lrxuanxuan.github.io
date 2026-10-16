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


## III. 完美统计知识下的半盲信道估计

本节提出两种利用载荷数据提供额外信息的 LMMSE 估计变体。暂时假设接收机知道完美的信道统计。通常只依据导频观测 $\mathbf y_p$ 估计信道，MSE 最优的条件均值估计器为

$$
\widehat{\mathbf h}_{\rm CME}=\mathbb E[\mathbf h\mid\mathbf y_p].
\tag{8}
$$

若信道服从 $\mathbf h\sim\mathcal N_{\mathbb C}(\mathbf0,\mathbf C)$，即

$$
\mathbf h\sim\mathcal N_{\mathbb C}(\mathbf0,\mathbf C),\tag{9}
$$

且协方差 $\mathbf C$ 已知，则最优条件均值可写为 [27]

$$
\widehat{\mathbf h}_{\rm CME}
=\mathbf C(\mathbf C+\mathbf C_n)^{-1}\mathbf y_p.\tag{10}
$$

对应均方误差为

$$
\mathrm{MSE}_{\rm plain}
=\operatorname{tr}\bigl[\mathbf C-\mathbf C
(\mathbf C+\mathbf C_n)^{-1}\mathbf C\bigr].\tag{11}
$$

当 $\mathbf C_n=\sigma^2\mathbf I_M$ 时，利用 Woodbury 恒等式得

$$
\mathrm{MSE}_{\rm plain}
=\sum_{i=1}^{M}\frac{\rho_i\sigma^2}{\rho_i+\sigma^2},
\tag{12}
$$

其中 $\rho_i$ 是 $\mathbf C$ 的特征值。ML 估计与 MMSE 不同，不使用信道先验分布，因此通常不是 MSE 最优。

对于半盲估计，假定已知信道子空间
$\operatorname{range}(\mathbf H)=\operatorname{range}(\mathbf V)$；$\mathbf V$ 由 $\mathbf H$ 的左奇异向量组成，其列张成 $\mathbf H$ 的列空间。依据式 (2)，ML 估计一般可以表述为 [15]

$$
\min_{\mathbf H,\mathbf X}
\sum_{n=1}^J\|\mathbf y(n)-\mathbf h_n\|^2
+\sum_{n=J+1}^{N}
\|\mathbf y(n)-\mathbf H\mathbf x(n)\|^2.
\tag{13}
$$

第一项是导频误差，第二项是载荷观测误差。式 (13) 的闭式解一般难以求得 [37]。[15] 使用 EM 求 ML，[11] 则利用信道子空间发展半盲方法。给定 $\mathbf V$ 后，令 $\mathbf H=\mathbf V\mathbf S$，
$\mathbf S=[\mathbf s_1,\ldots,\mathbf s_J]\in\mathbb C^{J\times J}$，将问题改写为 [11]

$$
\min_{\mathbf S,\mathbf X}
\sum_{n=1}^J\|\mathbf y(n)-\mathbf V\mathbf s_n\|^2
+\sum_{n=J+1}^N
\|\mathbf y(n)-\mathbf V\mathbf S\mathbf x(n)\|^2.
\tag{14}
$$

第二项可正交分解为

$$
\begin{aligned}
\sum_{n=J+1}^{N}\|
\mathbf y(n)-\mathbf V\mathbf S\mathbf x(n)
\|^2
={}&\sum_{n=J+1}^N
\|(\mathbf I_M-\mathbf V\mathbf V^{\rm H})\mathbf y(n)\|^2\\
&+\sum_{n=J+1}^{N}
\|\mathbf V^{\rm H}\mathbf y(n)-\mathbf S\mathbf x(n)\|^2.
\end{aligned}\tag{15}
$$

因为两项正交，等式成立。给定 $\mathbf V$ 时第一项为常数。连续星座的情况下，优化 $\mathbf X$ 能使第二项为零；对离散对称星座，由于相位歧义，无法唯一联合求解 $\mathbf S$ 和 $\mathbf X$。因此目标用户的 ML 估计只依赖导频：

$$
\min_{\mathbf s}\|\mathbf y_p-\mathbf V\mathbf s\|^2,\tag{16}
$$

解为 $\widehat{\mathbf h}_{\rm ML}
=\mathbf V\mathbf V^{\rm H}\mathbf y_p$，其 MSE 为

$$
\mathrm{MSE}_{\rm ML}
=\mathbb E\|\mathbf h-\mathbf V\mathbf V^{\rm H}\mathbf y_p\|^2
=J\sigma^2.\tag{17}
$$

下面结合协方差 $\mathbf C$ 和子空间 $\operatorname{range}(\mathbf V)$ 提出两种策略。

### A. 子空间估计器

首先按照 [26]，直接在 $J$ 维子空间估计。将式 (4) 投影为

$$
\mathbf y'=\mathbf V^{\rm H}\mathbf y_p
=\mathbf V^{\rm H}\mathbf h+\mathbf V^{\rm H}\mathbf n
=\mathbf h'+\mathbf n'.\tag{18}
$$

如果把 $\mathbf V$ 当作独立于 $\mathbf h$ 选取的变量，可假定
$\mathbf h'\sim\mathcal N_{\mathbb C}
(\mathbf0,\mathbf V^{\rm H}\mathbf C\mathbf V)$，进而给出 [26]

$$
\widehat{\mathbf h}'
=\mathbf V^{\rm H}\mathbf C\mathbf V
(\mathbf V^{\rm H}\mathbf C\mathbf V+\sigma^2\mathbf I_J)^{-1}
\mathbf V^{\rm H}\mathbf y_p.\tag{19}
$$

实际上按定义 $\mathbf V$ 依赖于 $\mathbf h$，因而式 (19) 是次优但可实施的估计。最后映射回原信道空间：

$$
\widehat{\mathbf h}_{\rm sub}=\mathbf V\widehat{\mathbf h}'.
\tag{20}
$$

### B. 投影信道估计器

作为替代方案，本文把正交子空间投影
$\mathbf P_H=\mathbf V\mathbf V^{\rm H}$ 作为预处理滤波器。因为 $\mathbf P_H\mathbf h=\mathbf h$，投影后导频观测为

$$
\widetilde{\mathbf y}
=\mathbf P_H\mathbf y_p=\mathbf h+
\mathbf P_H\mathbf n
=\mathbf h+\widetilde{\mathbf n}.\tag{21}
$$

为了计算 $\mathbb E[\mathbf h\mid\widetilde{\mathbf y}]$，先计算投影观测协方差：

$$
\mathbb E[\widetilde{\mathbf y}\widetilde{\mathbf y}^{\rm H}]
=\mathbf C+\mathbb E[\sigma^2\mathbf P_H],\tag{22}
$$

其中交叉项由于信道和噪声独立而消失。对于各方向均匀分布的空间不相关信道，$\mathbf C$ 是比例单位阵 [38]，样本协方差的特征向量矩阵服从 Haar 测度 [39]。于是

$$
\mathbf C_{\widetilde n}
=\sigma^2\frac JM\mathbf I_M.\tag{23}
$$

本节其余推导假定该关系成立。相应的投影 LMMSE 估计器为

$$
\widehat{\mathbf h}_{\rm proj}
=\mathbf C(\mathbf C+\mathbf C_{\widetilde n})^{-1}
\widetilde{\mathbf y}.\tag{24}
$$

### C. 完美子空间信息下的性能分析

当式 (23) 成立时，投影 LMMSE 的 MSE 为

$$
\mathrm{MSE}_{\rm proj}
=\operatorname{tr}\left[
\mathbf C-\mathbf C
\left(\mathbf C+\sigma^2\frac JM\mathbf I_M\right)^{-1}
\mathbf C\right],\tag{25}
$$

$$
=\sum_{i=1}^M
\frac{\rho_i\sigma^2}{(M/J)\rho_i+\sigma^2}.\tag{26}
$$

与普通 LMMSE 的式 (12) 相比，对每个 $i$ 都有

$$
\frac{\rho_i\sigma^2}{(M/J)\rho_i+\sigma^2}
\le\frac{\rho_i\sigma^2}{\rho_i+\sigma^2},\tag{27}
$$

因此 $\mathrm{MSE}_{\rm proj}\le\mathrm{MSE}_{\rm plain}$，当 $J=M$ 时等号成立。与 ML 估计相比，式 (26) 可改写为

$$
\mathrm{MSE}_{\rm proj}
=\frac JM\sigma^2\sum_{i=1}^M
\frac{\rho_i}{\rho_i+(J/M)\sigma^2}
\le J\sigma^2=\mathrm{MSE}_{\rm ML}.\tag{28}
$$

在空间不相关的瑞利衰落下 $\mathbf C=\mathbf I_M$，投影法的 MSE 为

$$
\mathrm{MSE}_{{\rm proj},\mathrm{iid}}
=\frac{JM\sigma^2}{M+J\sigma^2}.\tag{29}
$$

而子空间 LMMSE 简化为

$$
\widehat{\mathbf h}_{\rm sub}
=\frac1{1+\sigma^2}\mathbf V\mathbf V^{\rm H}\mathbf y_p,
\tag{30}
$$

MSE 为

$$
\mathrm{MSE}_{{\rm sub},\mathrm{iid}}
=\frac{\sigma^2(M\sigma^2+J)}{(1+\sigma^2)^2}
\ge\mathrm{MSE}_{{\rm proj},\mathrm{iid}}.\tag{31}
$$

图 1(a) 给出完美子空间知识、空间不相关瑞利衰落下的性能：投影估计器在所考察 SNR 范围内始终优于其他估计器；子空间 LMMSE 则从上方逼近 ML 估计。

本文进一步与 [15] 的无偏 CRB 比较，并研究天线数 $M$ 和快照数 $N$ 同时增长的渐近区间。

**定理 1。** 在 $N\to\infty$ 且 $M/N\to\alpha>0$，同时导频数量与用户数 $J$ 保持同数量级的条件下，对于空间不相关瑞利衰落，若精确知道 $\mathbf H$ 左奇异向量张成的子空间，则投影 LMMSE 在 MSE 上不差于任何无偏估计器。

**证明。** 由式 (26)：

$$
\lim_{\substack{N\to\infty\\M/N\to\alpha}}
\mathrm{MSE}_{\rm proj}
=\lim_{\substack{N\to\infty\\M/N\to\alpha}}
\frac JM\sigma^2
\sum_{i=1}^M\frac{\rho_i}{\rho_i+(J/M)\sigma^2},
\tag{32}
$$

$$
=J\sigma^2\le(1+\alpha)J\sigma^2
=\mathrm{CRB}_{\rm iid,d}.\tag{33}
$$

其中 $\mathrm{CRB}_{\rm iid,d}$ 为该信道模型的确定性 CRB 渐近界，最后一个等式来自 [40, Theorem 4]。文献 [40] 还说明，同一渐近区间中的确定性 CRB 低于随机 CRB。证毕。

这表明：当子空间准确可知时，有偏的投影 MMSE 估计器可以低于无偏估计的 CRB 下界，并不与无偏 CRB 的适用条件矛盾。相比之下，普通 LMMSE 和子空间变体在此极限中趋于无穷。仅令 $M\to\infty$，投影 LMMSE 也趋于 $J\sigma^2$，表现不再依赖天线数量。

### D. 最大似然子空间估计

前面假设子空间 $\operatorname{range}(\mathbf V)$ 已知。实际上，载荷符号通过与导频相同的信道传输，可以用于估计包含全部用户信道的子空间。

重访式 (13) 的联合 ML 问题，但不直接优化它，而将其作为子空间估计的中间步骤。忽略式 (15) 中由于相位歧义无法确定的第二项，得到 [11]

$$
\max_{\mathbf H}
\operatorname{tr}\bigl(
\mathbf P_H\widehat{\mathbf C}_{y\mid H}^{(d)}
\bigr),\tag{34}
$$

其中
$\mathbf P_H=\mathbf H(\mathbf H^{\rm H}\mathbf H)^{-1}
\mathbf H^{\rm H}=\mathbf V\mathbf V^{\rm H}$，
$\widehat{\mathbf C}_{y\mid H}^{(d)}
=(N-J)^{-1}\mathbf Y_d\mathbf Y_d^{\rm H}$。
最大化式 (34) 得到由载荷样本协方差前 $J$ 个主特征向量组成的 $\widehat{\mathbf V}_d$，满足
$\mathbf P_H=\widehat{\mathbf V}_d\widehat{\mathbf V}_d^{\rm H}$。

类似地，导频项通过 $\mathbf h_n=\mathbf y(n)$ 最小化，得到与 $\widehat{\mathbf C}_{y\mid H}^{(p)}
=J^{-1}\mathbf Y_p\mathbf Y_p^{\rm H}$ 前 $J$ 个特征向量相同的子空间，但没有利用导频提供的额外相位信息。结合所有观测，整体子空间估计为下式样本协方差前 $J$ 个主特征向量：

$$
\widehat{\mathbf C}_{y\mid H}
=\frac1N\mathbf Y\mathbf Y^{\rm H}.\tag{35}
$$

相似结果见 [26]。为降低计算量，还可通过 [41]、[42] 的高效子空间跟踪算法利用前一相干区间信息，避免每次重算协方差和特征向量。

### E. 子空间估计误差的分析

图 1(b) 比较 $N=200$ 个快照估计子空间时的结果，同时显示 [15] 的无偏 CRB 和本节推导的贝叶斯 CRB（BCRB）。SNR 增加时，半盲估计方法逐渐接近相应误差界；较低 SNR 时，允许有偏的 MMSE 半盲估计器可以优于无偏 CRB。这些界对 [15] 中的 EM 等无偏估计适用。

为量化估计子空间引入的额外误差，考虑第三节 B 的投影 LMMSE 与第三节 D 的子空间估计结合。假设数据符号为高斯分布，得到如下定理。

**定理 2。** 根据 $N$ 个观测估计信道矩阵 $\mathbf H$ 左奇异向量张成的子空间。分别用 $\widehat{\mathbf V}$、$\mathbf V$ 代表估计及真实子空间，则对应两种投影 LMMSE 的差的期望平方范数小于阈值 $\varepsilon$ 的概率满足

$$
\begin{aligned}
&\mathbb P\Bigl(
\mathbb E_{\mathbf X,\mathbf N}
\|\widehat{\mathbf h}_{\rm proj}(\widehat{\mathbf V})
-\widehat{\mathbf h}_{\rm proj}(\mathbf V)\|_2^2
\le\varepsilon\Bigr)\\
&\quad\ge
1-\frac{4k^2(M-J)\lambda_{\max}(
\mathbf W_{\rm proj}^{\rm H}\mathbf W_{\rm proj})}
{J^2N\varepsilon}\,
(|s_{\max}|^2+2\sigma^2)
\sum_{j\le J}\frac1{\lambda_j^2},
\end{aligned}\tag{36}
$$

其中 $\lambda_j$ 是 $\mathbf H\mathbf H^{\rm H}$ 第 $j$ 个特征值，
$\mathbf h=\mathbf V\mathbf s$，
$s_{\max}=\max_{j\le J}|s_j|$，且

$$
k^2=\sigma^2\bigl(\sigma^2+\operatorname{tr}(\mathbf C_{y\mid H})\bigr).
\tag{37}
$$

证明见附录 D。作者指出该界较松，因为推导中的不等式不够紧；不过它仍能说明，当观测量较多时，以估计子空间执行投影 LMMSE，往往能够优于其他所比较的方法。

**表 I｜$N=10^4$、SNR=0 dB 时投影 LMMSE 优于其他估计器的概率下界**

| 对比关系 | $J=8$ | $J=16$ | $J=32$ |
|---|---:|---:|---:|
| 投影优于子空间 LMMSE | ≥0.9873 | ≥0.9791 | ≥0.9642 |
| 投影优于 ML | ≥0.8453 | ≥0.9539 | ≥0.9907 |
| 投影优于普通 LMMSE | ≥0.9946 | ≥0.9923 | ≥0.9907 |

**图 1｜空间不相关瑞利衰落下各估计器 MSE 随 SNR 的变化。** 采用 $J=8$、$M=64$ 和高斯数据符号：(a) 具有完美子空间知识；(b) 以 $N=200$ 个快照估计子空间。比较随机与确定性 CRB、BCRB、ML、普通 LMMSE、子空间 LMMSE 和投影 LMMSE。
