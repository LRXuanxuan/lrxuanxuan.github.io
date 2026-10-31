---
layout: page
title: "散射环境感知的多用户联合信道估计与定位｜中文全文译文"
permalink: /papers/translations/2026-10-20-mu-scattering-aware-pilot-reuse-2501-02252/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2501.02252)

# 通过空间复用导频实现散射环境感知的多用户联合信道估计与定位

**原题：** Scattering Environment Aware Joint Multi-user Channel Estimation and Localization with Spatially Reused Pilots  
**作者：** Kaiyuan Tian、Yani Chi、Yufan Zhou、An Liu  
**版本：** arXiv:2501.02252v1，2025 年 1 月 4 日。  
**翻译进度：** 已译摘要、第 I—VII 节、附录 A 与参考文献 [1]—[31]；本轮补入第 IV 节 TST-MUSIC／DBSCAN／图着色算法（含算法 1）、第 V 节 SEA-LD-TurboCE 因子图与消息推导（含表 I、算法 2）、第 VI 节仿真、第 VII 节结论、附录 A 消息更新式（41）—（46）及英文原书目。**仍非经逐字符核对的终版全译。**

## 摘要

用户数量不断增加会导致导频开销上升，而有限的导频资源难以为所有用户都提供正交导频。充分利用多用户环境内在的物理特性，有望减少导频开销并改善信道估计性能。在实际环境中，空间上接近的用户可能共享同一散射体，而相距较远的用户，其信道往往趋于正交。

本文面向多输入多输出正交频分复用（MIMO-OFDM）系统，提出一种充分利用多用户空间特性的**双时间尺度联合上行信道估计与定位方案**。为准确刻画多用户信道结构，首先在三维位置域中建立信道模型。在长时间尺度阶段，采用时—空—时多信号分类（time-space-time multiple signal classification，TST-MUSIC）算法，对各用户相关散射体的位置进行粗估计；随后利用基于具有噪声的应用密度聚类（DBSCAN）的散射体关联算法进一步修正这些位置。基站以所得先验信息为基础，采用图着色用户分组算法实现导频的空间复用，从而降低导频开销。

在短时间尺度阶段，提出低复杂度的散射环境感知位置域 Turbo 信道估计算法（scattering environment aware location-domain turbo channel estimation，SEA-LD-TurboCE），融合多个用户共享散射体的信息，在空间复用导频条件下完成高精度的多用户联合信道估计与定位。仿真结果证实，相比基线方法，所提方案在信道估计和定位性能方面具有优势。

**关键词：** MIMO-OFDM；多用户信道估计与定位；基于空间复用的导频开销降低；散射体关联。

## I. 引言

大规模多输入多输出（massive MIMO）技术通过空间复用增益和阵列增益满足日益增长的高速数据传输需求，是 5G 及未来无线系统的重要基础 [1]、[2]。正交频分复用（OFDM）因能实现可靠的高速数据传输并抵抗频率选择性而被广泛采用 [3]。因此，massive MIMO 与 OFDM 的结合已成为 5G 新空口（NR）的关键物理层技术 [4]。

部署 massive MIMO-OFDM 系统的一大挑战，是在导频资源有限的情况下，使基站（BS）准确获取信道状态信息（CSI）。时分双工（TDD）相较频分双工（FDD）在降低基站 CSI 获取的导频开销方面具有明显优势 [6]。在 TDD 系统中，基站利用 5G NR 规定的探测参考信号（sounding reference signals，SRS）估计上行信道 [5]，再利用上下行互易性，将上行 CSI 用于下行预编码 [7]。

现有 5G 系统通常通过码分、时分、频分等方式为多用户分配正交上行导频，以避免导频之间的相互干扰 [8]。然而，随着移动用户数量增长，未来 5.5G 大规模天线系统所提供的有限正交导频难以满足全部用户的需求 [9]，这要求系统提高导频资源利用效率与信道估计效率。此外，导频中还包含用户和散射体的位置信息，因此，联合进行多用户信道估计与散射体、用户定位，对于未来兼具通信、感知及其他功能的无线系统具有重要意义。

**多用户导频设计与分配。** 多用户系统可在时间、频率或码域分配正交资源。正交传输限制了能够容纳的用户数；非正交导频可增加容量，但必须处理用户间干扰。现有非正交导频分配原则大多以功率为依据，例如利用图着色在同一时频资源上为强干扰用户分配不同导频序列 [10]；也有研究调整导频功率，以最大化蜂窝小区中的最小渐近信号与干扰加噪声比（SINR）[11]。文献 [12] 基于用户信道的差异化特征分配不同数量的导频；文献 [13] 利用非正交 Zadoff–Chu（ZC）序列，并结合多阶段串行干扰消除（MSIC）与 Turbo 框架执行多用户信道估计。

**多用户联合信道估计。** 已有 massive MIMO 研究发现，物理位置接近的用户可能因为共享局部散射簇而呈现公共稀疏结构 [14]、[15]，从而可增强稀疏恢复并改善下行信道估计。对于 TDD 系统，文献 [16] 通过隐马尔可夫先验模型，利用多个用户导频进行基站端联合角度域估计。对于 FDD 系统，文献 [17] 通过鲁棒闭环导频及 CSI 反馈资源自适应，利用角度域联合稀疏性提高估计性能。文献 [18] 的联合正交匹配追踪（OMP）利用用户间公共支持集，但要求用户共享大量信道支持；文献 [19] 则采用兼有公共稀疏和个体稀疏的模型。上述方法通常把临近用户共享同一角度域支持作为假设，但这是一种过度简化：近邻用户实际上可能共享散射体，因此共同支持更自然地存在于**三维位置域**。

**散射体和用户的联合定位与信道估计。** 文献 [20] 基于用户与散射体位置建立 massive MIMO-OFDM 信道模型，同时估计用户位置和信道系数。文献 [21] 采用动态网格改善定位与估计表现；[22] 不仅提供信道和位置的硬估计，还提供相应软信息；[23] 针对不同反射阶次提出两种几何模型，开展联合信道估计与散射体定位；[24] 则研究智能反射面（IRS）辅助毫米波系统中的联合位置感知与信道估计，利用部分重叠的结构化稀疏性改善总体性能。

不过，现有多用户方法仍未充分利用环境的空间信息，主要存在两点不足：第一，尚未利用多用户信道在三维位置域中的重叠信息；第二，尚未充分挖掘多用户导频的空分复用潜力。更进一步，在空间复用上行导频时，同时完成多用户信道估计和散射体／用户定位仍然具有挑战性。

因此，本文提出 TDD massive MIMO-OFDM 系统中的双时间尺度联合估计定位框架，通过多用户信道的空间重叠性或正交性提高导频利用率。

贡献分为三个方面：

1. **双时间尺度联合信道估计与定位：** 长时间尺度内先利用 TST-MUSIC 获得粗略散射体位置，再通过 DBSCAN 聚合多用户的共享散射体信息，以改善位置估计；随后利用图着色对用户分组，实现导频的空分复用。短时间尺度内采用 SEA-LD-TurboCE，在复用导频条件下进行低复杂度、高精度的联合估计。
2. **基于图着色的用户分组与空间导频复用：** 除码、时、频域复用外，引入位置域的导频复用，使多个用户能够在相同时频资源上发送同一导频。为降低组内干扰，以多用户散射体之间的最小距离刻画冲突关系，转化为图着色问题，并用粒子群优化（PSO）求解；分组后的用户在位置域近似正交，因而 SEA-LD-TurboCE 能够分离其信道并抑制干扰。
3. **空间复用导频下的 SEA-LD-TurboCE：** 利用长时间尺度得到的散射体先验初始化位置域动态网格，减少未知参数和计算开销。再采用消息传递算法，在非正交导频条件下同时估计多个用户的信道与位置。

论文第二节介绍系统模型；第三节提出双时间尺度联合估计与定位问题；第四节研究长时间尺度的散射体定位与导频分配；第五节给出短时间尺度 SEA-LD-TurboCE；第六节和第七节分别介绍仿真与结论。

## II. 系统模型

### A. 信道模型

考虑一个 TDD massive MIMO-OFDM 系统：基站配备由 $N=N_xN_y$ 个天线组成的均匀平面阵列（UPA），系统包含 $K$ 个单天线用户，索引集合为 $\mathcal K=\{1,\ldots,K\}$。球坐标系中，基站位于 $\mathbf p_{\mathrm{BS}}=[0,0,0]$，用户 $k$ 位于 $\mathbf p_{\mathrm{UE},k}=[\theta_{\mathrm{UE},k},\varphi_{\mathrm{UE},k},r_{\mathrm{UE},k}]$，其中三个分量分别表示方位角、仰角和距离。

假设三维区域 $\mathcal R$ 内共有 $L$ 个散射体，第 $l$ 个散射体位于 $\mathbf p_l=[\theta_l,\varphi_l,r_l]$。其中，对用户 $k$ 与基站之间的信道产生作用的散射体数为 $L_k$，索引为集合 $\mathcal L_k\subseteq\mathcal L$。假设基站可通过 GPS 等现有定位技术获得用户位置的部分先验知识。

在第 $p$ 个子载波上，用户 $k$ 发送导频 $u_{k,p}$，对应的基站接收信号为

$$
\mathbf y_{k,p}=\mathbf h_{k,p}u_{k,p}+\mathbf z_{k,p}. \tag{1}
$$

其中 $\mathbf h_{k,p}\in\mathbb C^N$ 为信道向量，$\mathbf z_{k,p}$ 为复高斯白噪声，噪声协方差为 $\sigma_k^2\mathbf I$。式（1）假定用户导频相互正交，因而不存在多用户干扰。双时间尺度框架在长时间尺度使用正交导频定位各用户散射体，在短时间尺度使用空间复用的非正交导频以支持更多用户。

每个子载波的信道由视距（LOS）与非视距（NLOS）分量组成：

$$
\mathbf h_{k,p}
=\mathbf h_{k,p}^{\mathrm{LOS}}+\mathbf h_{k,p}^{\mathrm{NLOS}}. \tag{2}
$$

其中

$$
\mathbf h_{k,p}^{\mathrm{LOS}}
=x_{k0}e^{-j2\pi pf_0\tau_0(\mathbf p_{\mathrm{UE},k})}
\mathbf a(\theta_{\mathrm{UE},k},\varphi_{\mathrm{UE},k}), \tag{3}
$$

$$
\mathbf h_{k,p}^{\mathrm{NLOS}}
=\sum_{l\in\mathcal L_k}
x_{kl}e^{-j2\pi pf_0\tau_l(\mathbf p_{\mathrm{UE},k})}
\mathbf a(\theta_l,\varphi_l). \tag{4}
$$

$f_0$ 是子载波间隔，$c$ 是光速，$\mathbf a(\cdot)$ 为 UPA 的阵列响应向量，$x_{k0}$ 和 $x_{kl}$ 分别为 LOS 和第 $l$ 条 NLOS 路径的复增益。LOS 时延为 $\tau_0(\mathbf p_{\mathrm{UE},k})=r_{\mathrm{UE},k}/c$；NLOS 时延由用户—散射体与散射体—基站两段传播距离之和除以光速得到，原文式（5）给出了球坐标下的显式距离公式。

**图 1：** 多用户上行信道模型。图中展示了三个用户各自的非共享散射体以及相互共享的散射体；同一建筑物可能是不同用户的公共散射体，而不同用户还各有独立路径。

### B. 位置域稀疏表示

为充分利用不同用户信道在空间中的重叠与正交特性，在位置域同时引入用户与散射体位置。定义动态三维位置网格

$$
\boldsymbol\gamma=\{\boldsymbol\gamma_1,\ldots,\boldsymbol\gamma_Q\}
\subset\mathcal R,
$$

其中 $\boldsymbol\gamma_q=(\theta_q,\varphi_q,r_q)$。基于该网格建立稀疏基矩阵：

$$
\mathbf A(\boldsymbol\theta,\boldsymbol\varphi)
=[\mathbf a(\theta_1,\varphi_1),\ldots,\mathbf a(\theta_Q,\varphi_Q)]
\in\mathbb C^{N\times Q}. \tag{6}
$$

定义用户 $k$ 在第 $p$ 个子载波的传播时延相位向量

$$
\mathbf b_{k,p}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})
=[e^{-j2\pi pf_0\tau(\boldsymbol\gamma_1,\mathbf p_{\mathrm{UE},k})},
\ldots,
e^{-j2\pi pf_0\tau(\boldsymbol\gamma_Q,\mathbf p_{\mathrm{UE},k})}]^T. \tag{7}
$$

NLOS 信道在该动态网格上的稀疏表示为

$$
\mathbf h_{k,p}^{\mathrm{NLOS}}
=\mathbf A(\boldsymbol\gamma)
\operatorname{Diag}(\mathbf b_{k,p}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k}))
\mathbf x_k. \tag{8}
$$

其中 $\mathbf x_k\in\mathbb C^{Q\times1}$ 是位置域稀疏信道向量，仅有 $L_k$ 个非零元素，分别对应用户 $k$ 的有效散射体。非零元素被建模为独立同分布的零均值单位方差复高斯变量。

### C. 多用户联合稀疏模型

某些用户（特别是空间位置接近的用户）面对相似的散射结构 [25]。为利用用户间部分重叠的散射体，假设多用户信道具有联合稀疏性。对于用户 $k$ 定义支持向量 $\mathbf s_k=[s_{k1},\ldots,s_{kQ}]^T$，当 $x_{kq}\neq0$ 时 $s_{kq}=1$，否则为 0。进一步定义全体用户的联合支持向量 $\mathbf s=[s_1,\ldots,s_Q]^T$：只有当所有用户的 $s_{kq}$ 均为 0 时，$s_q=0$；否则 $s_q=1$。

多用户联合稀疏结构可利用条件概率 $p(s_{kq}\mid s_q)$ 描述。例如，当两个用户共享许多散射体时，二者的支持向量与联合支持之间便有更多重叠的非零位置。

## III. 双时间尺度多用户联合信道估计与定位的问题形式化

### A. 整体框架

多用户上行正交导频通常在码、时、频域复用。它能够消除用户间的导频干扰，却受到正交序列总数的限制。为了突破这一瓶颈，本文提出在位置域对导频进行复用，以支持更多用户。关键在于：使用同一导频的用户必须尽可能降低空间干扰。因此，提出如**图 2** 所示的双时间尺度框架。

长时间尺度阶段先对各用户进行 TST-MUSIC 粗定位，再利用 DBSCAN 将多个用户共享的散射体关联起来，接着基站使用图着色策略对用户分组，使组内用户能够复用导频。由于在整个三维区域 $\mathcal R$ 建立网格会得到极大的 $Q$，计算复杂度可达 $\mathcal O(Q^3)$，因此利用前一阶段获得的散射体位置信息缩小后续动态网格的搜索范围。

短时间尺度阶段根据长时间尺度结果初始化 $\boldsymbol\gamma$，在非正交空间复用导频条件下采用 SEA-LD-TurboCE 联合估计用户信道及位置。

### B. 长时间尺度问题形式化

**1）散射体粗定位。** 将用户 $k$ 的散射体角度集合与传播时延集合分别记为 $\boldsymbol\theta_k,\boldsymbol\varphi_k,\boldsymbol\tau_k$。把多个子载波的接收信号拼接为矩阵：

$$
\mathbf Y_k=[\mathbf y_{k,1},\ldots,\mathbf y_{k,P}]
=\mathbf A(\boldsymbol\theta_k,\boldsymbol\varphi_k)
\mathbf X_k\mathbf G(\boldsymbol\tau_k)^T. \tag{9}
$$

其中 $\mathbf A$ 包括 LOS 方向和各 NLOS 散射体方向对应的阵列响应，$\mathbf X_k$ 为路径增益对角矩阵，$\mathbf G$ 汇集各路径沿子载波的导频及时延相位。给定 $\mathbf Y_k$ 和已知用户位置 $\mathbf p_{\mathrm{UE},k}$，目标是估计三维散射体位置集合 $\boldsymbol\xi_k$。

**2）散射体关联与位置修正。** 不同用户可能共享同一散射体，因此可关联各用户的初始估计，再融合对同一物理散射体的多次观测，提高位置精度。定义关联向量 $\boldsymbol\beta$，每个元素记录散射体所属的簇编号；编号 0 表示不属于任何簇。第 $m$ 个簇的索引集合为 $\mathcal C_m=\{l:\beta_l=m\}$。原文假设 TST-MUSIC 的散射体位置误差服从高斯分布，且不同用户的观测相互独立；据此求解散射体关联，并对粗估计位置进行修正。

**3）空间导频复用的用户分组。** 相距较远的用户通常经历不同传播路径，其位置域信道可具有更强正交性，因此可以使用相同导频。论文以两位用户主要散射体之间的**最小距离**刻画二者的距离；主要散射体指承载总能量中绝大部分（例如超过 95%）的路径相关散射体。

设可用的正交资源块为 $G$ 个，$K$ 个用户被分为 $\mathcal G_1,\ldots,\mathcal G_G$。定义分组向量 $\boldsymbol\omega=[\omega_1,\ldots,\omega_K]$，其中 $\omega_k\in\{1,\ldots,G\}$ 表示用户 $k$ 被分到的组。优化目标是使同组不同用户之间的最小距离尽可能大（原文式（10））。距离的估计为

$$
\widehat d_{k_1,k_2}
=\min_{l_1\in\mathcal L_{k_1},\,l_2\in\mathcal L_{k_2}}
\|\widehat{\mathbf p}_{l_1}-\widehat{\mathbf p}_{l_2}\|. \tag{11}
$$

其中两项为用户 $k_1,k_2$ 对应散射体位置的估计。

### C. 短时间尺度问题形式化

为刻画多用户联合稀疏结构，短时间尺度引入三层先验模型。第一层为每个用户的复高斯信道增益与伯努利支持变量；第二层通过条件概率 $p(s_{kq}\mid s_q)$ 刻画个体支持与全局支持的重叠；第三层为全局联合支持向量 $\mathbf s$ 的先验。

具体而言，信道增益 $x_{kq}$ 在 $s_{kq}=0$ 时为零，在 $s_{kq}=1$ 时遵从复高斯分布（原文式（12））。定义重叠概率 $\rho_k=L_k/L$，使用式（13）、（14）表示用户支持的联合分布。全局支持采用独立同分布先验：

$$
p(\mathbf s)=\prod_{q\in\mathcal Q}p(s_q),\qquad
p(s_q=1)=\lambda, \tag{15}
$$

其中 $\lambda$ 控制全局支持的稀疏程度。由此可因子分解获得多个用户的支持和增益联合先验（式（16））。

由于 LOS 增益 $x_{k0}$ 与 NLOS 增益分布不同，论文单独为其引入支持变量 $s_{k0}$ 和伯努利—高斯先验：

$$
p(s_{k0})=\rho_{k0}\delta(s_{k0}-1)
+(1-\rho_{k0})\delta(s_{k0}), \tag{17}
$$

$$
p(x_{k0}\mid s_{k0})
=\delta(s_{k0})\delta(x_{k0})
+\delta(s_{k0}-1)\mathcal{CN}(x_{k0};0,\sigma_{0k}^2). \tag{18}
$$

其中 $\rho_{k0}$ 表示用户 $k$ 的通信链路具有 LOS 分量的概率。综合 NLOS 和 LOS 部分便得到原文式（19）的联合先验。为方便后续消息传递，论文在式（20）、（21）构造 NLOS 与 LOS 的位置域稀疏基矩阵。

由于同组用户在同一时频域发送信号，第 $g$ 组的接收信号为

$$
\mathbf y_g=\sum_{k\in\mathcal G_g}\left(\boldsymbol\Phi_k(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})\mathbf x_k+\mathbf z_k\right),\tag{22}
$$

其中 $\mathbf x_k=[x_{k0},x_{k1},\ldots,x_{kQ}]^T$，$\mathbf z_k=[(\mathbf z_{k,1})^T,\ldots,(\mathbf z_{k,P})^T]^T$，$\boldsymbol\Phi_k(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})=[\boldsymbol\Phi_{0,k},\boldsymbol\Phi_{Q,k}]$ 由式（20）（21）给出。不同组用户占用正交信道，因此全体用户的接收信号可写成未知参数在观测矩阵中的线性观测模型：

$$
\mathbf y=[\mathbf y_1;\ldots;\mathbf y_G]=\boldsymbol\Phi\mathbf x+\mathbf z\in\mathbb C^{GNP\times1},\tag{23}
$$

其中 $\boldsymbol\Phi=\mathrm{BlockDiag}(\bar{\boldsymbol\Phi}_1,\ldots,\bar{\boldsymbol\Phi}_G)\in\mathbb C^{GNP\times K(Q+1)}$，$\bar{\boldsymbol\Phi}_g=[\boldsymbol\Phi_k(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},1}),\ldots,\boldsymbol\Phi_k(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})]_{k\in\mathcal G_g}\in\mathbb C^{NP\times|\mathcal G_g|(Q+1)}$，$\mathbf x=[\mathbf x_1;\ldots;\mathbf x_K]\in\mathbb C^{K(Q+1)\times1}$，$\mathbf z=[\mathbf z_1;\ldots;\mathbf z_G]\in\mathbb C^{GNP\times1}$。

任务是在给定 $\mathbf y$ 与散射体位置先验 $\widehat{\mathbf\Xi}'$ 的条件下，估计信道向量 $\mathbf x$、动态网格 $\boldsymbol\gamma$ 与用户位置 $\mathbf P_{\mathrm{UE}}$。一方面，在给定动态网格 $\boldsymbol\gamma$ 与用户位置 $\mathbf P_{\mathrm{UE}}$ 时计算条件边缘后验 $p(x_{kq}\mid\mathbf y,\boldsymbol\zeta,\widehat{\mathbf\Xi}')$、$p(s_{kq}\mid\mathbf y,\boldsymbol\zeta,\widehat{\mathbf\Xi}')$，$\forall q\in\mathcal Q_k,\forall k\in\mathcal K$；另一方面，动态网格与用户位置可通过最大后验（MAP）估计获得：

$$
\widehat{\boldsymbol\zeta}=\arg\max_{\boldsymbol\zeta}\ln p(\boldsymbol\zeta\mid\mathbf y),\tag{24}
$$

其中 $\boldsymbol\zeta=\{\boldsymbol\gamma,\mathbf P_{\mathrm{UE}}\}$ 为不确定参数。然而，底层概率模型因子图中存在环结构，精确计算上述条件边缘后验十分困难。为此，下一节提出 SEA-LD-TurboCE 算法：通过结合线性最小均方误差（LMMSE）估计与消息传递的 Turbo 框架近似计算条件边缘后验，并采用期望最大化（EM）方法求式（24）的近似解。

## IV. 长时间尺度算法

### A. 用于粗散射体定位的 TST-MUSIC 算法

本文将问题分解为角度/时延估计与基于散射体时延和用户位置的距离估计两部分。对第 $k$ 个用户，$\theta_k$、$\varphi_k$、$\tau_k$ 可用已有算法（例如 TST-MUSIC [26]）估计；该算法结合时间滤波技术与空间波束形成技术联合估计多径的角度与时延，细节从略。随后利用第 $k$ 用户的 $[\widehat\theta_k,\widehat\varphi_k,\widehat\tau_k]$ 与 $\mathbf p_{\mathrm{UE},k}$ 估计散射体位置 $\widehat{\boldsymbol\xi}_k=\{[\widehat\theta_l,\widehat\varphi_l,\widehat r_l]\mid l\in\mathcal L_k\}$，其中 $\widehat r_l$ 为散射体 $l$ 距离的估计。于是散射体距离估计问题可重写为最小化下式：

$$
\min_{r_l}\left\|\frac{\sqrt{r_{\mathrm{UE},k}^2+r_l^2-2r_{\mathrm{UE},k}r_l\widehat\alpha_k}}{c}+\frac{r_l}{c}-\tau_l(\mathbf p_{\mathrm{UE},k})\right\|^2,\quad l\in\mathcal L_k,\tag{25}
$$

其中 $\widehat\alpha_k=\sin(\theta_{\mathrm{UE},k})\sin(\widehat\theta_l)\cos(\varphi_{\mathrm{UE},k}-\widehat\varphi_l)+\cos(\theta_{\mathrm{UE},k})\cos(\widehat\theta_l)$。该问题可用牛顿—拉夫森法 [27] 等已有方法求解，为简洁起见此处从略。

### B. 基于 DBSCAN 的散射体关联与精细定位

如多用户联合稀疏模型所述，每个用户的散射体集合是全球散射体集合的子集。因此，利用多用户观测到的散射体子集重建散射环境是可行的，这需要识别并关联多用户的共享散射体。为此，本文提出基于 DBSCAN 的算法，以实现散射环境感知与多用户联合信道估计和定位。

DBSCAN 以擅长去除噪声、善于处理良好分离的观测而著称，适合用于散射体关联 [30]。它依赖两个关键初始参数：邻域半径 $\varepsilon$ 与最小点数 $\mathrm{MinPts}$。$\varepsilon$ 定义某点邻域的半径，用于判定散射体密度，其中邻域指两个散射体之间的欧氏距离；$\mathrm{MinPts}$ 为某区域被判定为簇所需的最小散射体数。随机选取的点若在 $\varepsilon$ 内至少包含 $\mathrm{MinPts}$ 个点，则视为核心点；落在该核心点邻域半径内并满足该条件的点被统一标记，从而构成一个簇。

基于 DBSCAN 的散射体关联流程如下：1）选取散射体 $\widehat{\mathbf\Xi}[i]$（即 $\widehat{\mathbf\Xi}$ 的第 $i$ 行）作为样本；若其 $\varepsilon$ 邻域内包含多于 $\mathrm{MinPts}$ 个点，则初始化一个新簇 $C$，并将该散射体样本标记为已访问。2）遍历簇 $C$ 内的所有散射体：若某散射体的 $\varepsilon$ 邻域包含多于 $\mathrm{MinPts}$ 个散射体，则把全部散射体加入簇 $C$ 并标记为已访问。3）重复步骤 1、2，直到为簇 $C$ 找出全部密度相连的散射体。4）检查新的未访问散射体，重复步骤 1—3 识别其他簇。5）最后把所有未访问散射体标记为噪声样本并输出 $\boldsymbol\beta$。注意，孤立散射体被视为噪声，因为它们只属于单一观测、不属于任何簇 $C_m$；而共享散射体为多个观测所共有，因而能被有效识别。依据粗散射体定位误差假设，簇 $m$ 中共享散射体的位置修正为

$$
\bar{\boldsymbol\xi}_m=\frac{1}{|C_m|}\sum_{i\in C_m}\widehat{\mathbf\Xi}[i],\tag{26}
$$

其中 $|C_m|$ 表示集合 $C_m$ 的元素个数。于是全部共享散射体为 $\mathbf\Xi_{\rm shared}=[\bar{\boldsymbol\xi}_1,\ldots,\bar{\boldsymbol\xi}_M]\in\mathbb C^{M\times3}$，共享散射体的修正位置表示为

$$
\widehat{\mathbf\Xi}'[i]=\begin{cases}\bar{\boldsymbol\xi}_m,&i\in C_m,\\\widehat{\mathbf\Xi}[i],&\text{其他}.\end{cases}\tag{27}
$$

按上述流程可得到更新后的全局散射体位置以及多用户散射体之间的关联。为避免漏检造成严重性能退化，网格 $\boldsymbol\gamma_k$ 应覆盖第 $k$ 个用户的全部可能散射体位置，因此动态网格初始化为 $\boldsymbol\gamma_0=\widehat{\mathbf\Xi}'$。

### C. 基于图着色的用户分组

式（10）的优化问题是 NP-hard 混合整数规划问题，不存在可在多项式时间内求得最优解的算法。因此本文把用户分组问题转化为图着色问题，并用 PSO 算法求次优解。具体地，用邻接矩阵 $\mathbf E\in\mathbb C^{K\times K}$ 定义无向无权图：

$$
\mathbf E=\begin{bmatrix}0&E_{12}&\ldots&E_{1K}\\E_{21}&0&\ldots&E_{2K}\\\vdots&\vdots&\ddots&\vdots\\E_{K1}&E_{K2}&\ldots&0\end{bmatrix}.\tag{28}
$$

其中每个元素 $E_{ij}$（$i\neq j$）定义为

$$
E_{ij}=\begin{cases}1,&d_{i,j}<d_{\rm adj},\\0,&d_{i,j}\ge d_{\rm adj},\end{cases}\tag{29}
$$

$d_{i,j}$ 为式（11）定义的顶点 $i$ 与顶点 $j$ 之间的距离，$d_{\rm adj}$ 为邻接距离，可调整以保证同组用户在位置域内准正交。该式表示：若顶点 $i$ 与顶点 $j$ 的距离小于 $d_{\rm adj}$，则两用户之间存在一条边；此外对角元素 $E_{ii}$ 恒为 0，因为顶点不与自身相连。

接下来介绍如何基于 PSO 方法 [28] 获得用户分组向量 $\boldsymbol\omega$。该启发式方法把每个实体视为在多维搜索空间中按一定速度运动的粒子；具体地，$\boldsymbol\omega$ 的第 $k$ 个元素被定义为第 $t$ 次迭代中粒子的位置，记为 $X_{a,k}^{(t)}$，其中 $k\in\mathcal K$、$a\in\{1,2,\ldots,A_p\}$，$A_p$ 为粒子数；类似地，$V_{a,k}^{(t)}$ 表示粒子的速度。粒子的速度与位置按粒子群算法的演化规则迭代，从而形成整张图 $G$ 的着色方案。具体地，第 $t$ 次迭代中每个粒子的速度与位置在整数搜索空间内按以下两式更新：

$$
V_{a,k}^{(t+1)}=\mathrm{int}(V_{a,k}^{(t)})+Z_1+Z_2,\tag{30}
$$

$$
X_{a,k}^{(t+1)}=X_{a,k}^{(t)}+V_{a,k}^{(t+1)},\tag{31}
$$

其中 $X_{a,k}^{(t)}$、$V_{a,k}^{(t)}$ 分别为第 $a$ 个粒子第 $k$ 个元素的位置与速度，$\mathrm{int}(\cdot)$ 表示取整；$Z_1$、$Z_2$ 分别为在区间 $[0,c_1(\mathrm{pbest}_{a,k}-X_{a,k}^{(t)})]$、$[0,c_2(\mathrm{gbest}_k-X_{a,k}^{(t)})]$ 内均匀分布的随机整数，$\mathrm{gbest}^{(t)}=\{\mathrm{gbest}_k^{(t)}\}_{k=1}^K$ 表示整个群体的最优位置，$\mathrm{pbest}_{a,k}^{(t)}$ 为 $X_{a,k}^{(t)}$ 的历史最优值，$c_1$、$c_2$ 为加速系数。为满足以下两个约束：1）图中相邻顶点必须着不同颜色；2）所用颜色数应尽可能少，适应度函数定义为

$$
f_{\rm fitness}=\sum_{i=1}^K\sum_{j=1}^K E_{ij}S_{ij}+\max(g-G,0),\tag{32}
$$

其中 $S_{ij}$ 指示顶点 $i$ 与顶点 $j$ 是否同色（若 $X_{a,i}=X_{a,j}$ 则 $S_{ij}=1$，否则 $S_{ij}=0$），$g$ 表示着色实际使用的颜色数。每次迭代中，若 $f_{\rm fitness}$ 变小，则需更新 $\mathrm{pbest}_{a,k}^{(t+1)}$ 与 $\mathrm{gbest}_k^{(t+1)}$（$\forall a,k$）；用户分组算法迭代运行，每次迭代的计算复杂度为 $\mathcal O(K^2)$，直至颜色数 $g$ 等于用户分组数 $G$。算法见算法 1。为选取合适的初始距离 $d_{\rm adj}^{(0)}$，需在组内干扰与收敛速度之间折中。一种合理做法是把 $d_{\rm adj}^{(0)}$ 设为用户距离累积分布函数（CDF）的第 $e$ 百分位；$e$ 应随分组数 $G$ 调整：$G$ 较小（每组用户较多）时取较小的 $e$，$G$ 较大（每组用户较少）时取较大的 $e$。因此取 $e=G/K$，使 $d_{\rm adj}^{(0)}$ 适应不同组规模。最后，利用最优导频分配 $\boldsymbol\omega$，在后续短时间尺度阶段为同组所有用户分配相同导频，即形成非正交导频的使用。

**算法 1**　基于 PSO 的图着色用户分组算法

1. 输入：所有用户的散射体 $\widehat{\boldsymbol\xi}_k,\forall k\in\mathcal K$，分组数 $G$，邻接距离更新步长 $\Delta d_{\rm adj}$，阈值 $\epsilon$。
2. 按式（28）以 $d_{\rm adj}^{(0)}$ 初始化邻接矩阵 $\mathbf E$；置 $X_{a,k}^{(0)}=k$、$V_{a,k}^{(0)}$、$\mathrm{gbest}_k^{(0)}$、$\mathrm{pbest}_{a,k}^{(0)}$（$\forall a,k$），并置 $t=0$。
3. **while** $g>G$ **do**
4. 　**while** $\|\mathrm{gbest}^{(t+1)}-\mathrm{gbest}^{(t)}\|\ge\epsilon$ **do**
5. 　　按式（30）更新粒子速度（$\forall k\in\mathcal K$）。
6. 　　按式（31）更新粒子位置（$\forall k\in\mathcal K$）。
7. 　　按式（32）的目标计算粒子适应度（$\forall k\in\mathcal K$）。
8. 　　若 $f_{\rm fitness}^{(t+1)}<f_{\rm fitness}^{(t)}$，更新 $\mathrm{pbest}_{a,k}^{(t+1)}$ 与 $\mathrm{gbest}_k^{(t+1)}$（$\forall a,k$）。
9. 　　$t=t+1$。
10. 　**end while**
11. 　按式（28）以 $d_{\rm adj}^{(t+1)}=d_{\rm adj}^{(t)}-\Delta d_{\rm adj}$ 更新邻接矩阵 $\mathbf E$。
12. **end while**
13. 输出：导频分配 $\boldsymbol\omega=\mathrm{gbest}$。

## V. 短时间尺度算法

基于精细散射体位置得到的多用户先验信息，目标是在当前时刻接收导频与长时间尺度估计先验的基础上，实现多用户高精度的联合信道估计与定位。受 EM 方法 [29] 启发，SEA-LD-TurboCE 算法在以下两步之间迭代直至收敛。

- **E 步**：给定第 $t$ 次迭代的不确定参数 $\boldsymbol\zeta^t$，通过 Turbo 框架下的消息传递方法计算近似后验 $p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^t)$。
- **M 步**：利用 E 步（SEA-LD-TurboCE-E）得到的近似后验构造 $\ln p(\mathbf y\mid\boldsymbol\zeta)$ 的替代函数，再用梯度上升法对 $\boldsymbol\zeta$ 最大化该替代函数，更新下一次迭代 $\boldsymbol\zeta^{t+1}$。

E 步包含两个模块（图 3）：模块 A 为基于观测 $\mathbf y$ 与模块 B 外信息的 LMMSE 估计器；模块 B 执行结合独立同分布先验与模块 A 外信息的 MMSE 估计。两模块迭代执行直至收敛。

### A. 模块 A 中的 LMMSE

**1）** 假设 $\mathbf x$ 的先验分布为 $\mathcal{CN}(\mathbf x;\mathbf x_A^{\rm pri},\mathbf V_A^{\rm pri})$，其中 $\mathbf x_A^{\rm pri}$、$\mathbf V_A^{\rm pri}$ 分别为来自模块 B 的外信息均值与协方差矩阵。LMMSE 估计的后验均值与协方差矩阵分别为

$$
\mathbf x_A^{\rm post}=\mathbf V_A^{\rm post}\left((\mathbf V_A^{\rm pri})^{-1}\mathbf x_A^{\rm pri}+\frac{\boldsymbol\Phi^H\mathbf y}{\sigma_z^2}\right),\tag{33}
$$

$$
\mathbf V_A^{\rm post}=\left(\frac{\boldsymbol\Phi^H\boldsymbol\Phi}{\sigma_z^2}+(\mathbf V_A^{\rm pri})^{-1}\right)^{-1}.
$$

由后验信息减去先验信息，得到模块 A 的外信息：

$$
\mathbf x_{A\to B}^{\rm ext}=\mathbf V_{A\to B}^{\rm ext}\left((\mathbf V_A^{\rm post})^{-1}\mathbf x_A^{\rm post}-(\mathbf V_A^{\rm pri})^{-1}\mathbf x_A^{\rm pri}\right),\tag{34}
$$

$$
\mathbf V_{A\to B}^{\rm ext}=\left((\mathbf V_A^{\rm post})^{-1}-(\mathbf V_A^{\rm pri})^{-1}\right)^{-1}.
$$

**2）模块 B 中的消息传递。** 模块 B 采用 HMM-MMSE 估计器的消息传递方案，基于独立同分布信道先验与来自模块 A 的外信息 $\mathbf x_{A\to B}^{\rm ext}$、$\mathbf V_{A\to B}^{\rm ext}$ 计算 $\mathbf x$ 与 $\mathbf s$ 的后验。具体地，外信息被等效建模为虚拟 AWGN 观测模型：

$$
\mathbf x_B^{\rm pri}=\mathbf x+\mathbf z,\tag{35}
$$

其中 $\mathbf x_B^{\rm pri}=\mathbf x_{A\to B}^{\rm ext}=[(\mathbf x_B^{1,\rm pri})^T,\ldots,(\mathbf x_B^{K,\rm pri})^T]^T$ 视为经零均值噪声向量 $\mathbf z_1,\ldots,\mathbf z_K$ 的虚拟 AWGN 信道获得的观测，外信息协方差 $\mathbf V_{A\to B}^{\rm ext}=\mathrm{BlockDiag}(\mathbf V_B^{1,\rm pri},\ldots,\mathbf V_B^{K,\rm pri})$ 视为噪声协方差，即 $\mathbf z_k\sim\mathcal{CN}(\mathbf 0;\mathbf V_B^{k,\rm pri})$。该虚拟 AWGN 观测模型对应的联合分布因子图 $G_B$ 如图 4 所示，各因子节点的函数表达式列于表 I，其中 $x_{B,m}^{k,\rm pri}$ 为 $\mathbf x_B^{k,\rm pri}$ 的第 $m$ 个元素，$v_{B,m}^{k,\rm pri}$ 为 $\mathbf V_B^{k,\rm pri}$ 的第 $m$ 个对角元素。

**表 I 因子节点与分布**（逐格转录；第三列为原文 functional form）

| 因子（Factor） | 分布（Distribution） | 函数形式（Functional form） |
| --- | --- | --- |
| $g_0^k(x_{B,0}^{k,\rm pri},x_0^k)$ | $p(x_0^k\mid x_{B,0}^{k,\rm pri})$ | $\mathcal{CN}(x_0^k;x_{B,0}^{k,\rm pri},v_{B,0}^{k,\rm pri})$ |
| $g_q^k(x_{B,q}^{k,\rm pri},x_q^k)$ | $p(x_q^k\mid x_{B,q}^{k,\rm pri})$ | $\mathcal{CN}(x_q^k;x_{B,q}^{k,\rm pri},v_{B,q}^{k,\rm pri})$ |
| $f_0^k(x_0^k,s_0^k)$ | $p(x_0^k\mid s_0^k)$ | $\mathcal{CN}(x_q^k;x_{B,q}^{k,\rm pri},v_{B,q}^{k,\rm pri})$（原文如此，见下方注） |
| $f_q^k(x_q^k,s_q^k)$ | $p(x_q^k\mid s_q^k)$ | $\delta(s_q^k)\delta(x_q^k)+\delta(s_q^k-1)\mathcal N(x_q^k;0,(\sigma_q^k)^2)$ |
| $\eta_q^k(s_q^k,s_q)$ | $p(s_q^k\mid s_q)$ | $\delta(s_q)\delta(s_q^k)+\delta(s_q-1)\left(\delta(s_q^k-1)\rho_k+\delta(s_q^k)(1-\rho_k)\right)$ |
| $h_0^k(s_0^k)$ | $p(s_0^k)$ | $\delta(s_0^k-1)\rho_0^k+\delta(s_0^k)(1-\rho_0^k)$ |
| $h_q(s_q)$ | $p(s_q)$ | $\delta(s_q-1)\lambda+\delta(s_q)(1-\lambda)$ |

注：原表 $f_0^k$ 行的函数形式与 $g_q^k$ 行相同（$\mathcal{CN}(x_q^k;x_{B,q}^{k,\rm pri},v_{B,q}^{k,\rm pri})$），与式（18）给出的 LOS 先验不符，疑为原文表格排版错误；此处按原表转录并加注，未擅自替换。

下面概述因子图 $G_B$ 上的消息传递方案，细节见附录 A。按和积规则，先沿路径 $x_q^k\to f_q^k\to s_q^k\to\eta_q^k\to s_q$ 推断消息，再独立计算路径 $x_0^k\to f_0^k\to s_0^k\to h_0^k$ 上的消息；随后执行 $s_q\to h_q$ 与 $h_q\to s_q$ 的双向消息传递；最后沿 $s_q\to\eta_q^k\to s_q^k\to f_q^k\to x_q^k$ 与 $h_0^k\to s_0^k\to f_0^k\to x_0^k$ 反馈消息。在计算出更新后的消息 $\{v_{f_q^k\to x_q^k}\}$ 后，近似后验分布为

$$
\widehat p(x_q^k\mid\mathbf y)\propto v_{f_q^k\to x_q^k}\times v_{x_q^k\to f_q^k},\tag{36}
$$

$$
\widehat p(s_q^k\mid\mathbf y)=\frac{\pi_{s_k,q}^{\rm in}\pi_{s_k,q}^{\rm out}}{\pi_{s_k,q}^{\rm in}\pi_{s_k,q}^{\rm out}+(1-\pi_{s_k,q}^{\rm in})(1-\pi_{s_k,q}^{\rm out})},\quad\forall q\in\mathcal Q_k,\ \forall k\in\mathcal K,\tag{37}
$$

其中 $v_{f_q^k\to x_q^k}$、$v_{x_q^k\to f_q^k}$、$\pi_{s_k,q}^{\rm in}$、$\pi_{s_k,q}^{\rm out}$ 由附录 A 给出。随后 $\mathbf x^k$ 的后验均值 $\mathbf x_B^{k,\rm post}=[x_{B,1}^{k,\rm post},\ldots,x_{B,Q}^{k,\rm post}]^T$ 与方差 $\mathbf V_B^{k,\rm post}=\mathrm{Diag}([v_{B,1}^{\rm post},\ldots,v_{B,Q}^{\rm post}])$ 分别为

$$
x_{B,q}^{k,\rm post}=\int x_q^k\,\widehat p(x_q^k\mid\mathbf y),\qquad v_{B,q}^{\rm post}=\int\left|x_q-x_{B,q}^{k,\rm post}\right|^2\widehat p(x_q^k\mid\mathbf y),\quad\forall q\in\mathcal Q_k,\ \forall k\in\mathcal K.\tag{38}
$$

于是传给模块 A 的外信息为

$$
\mathbf V_{B\to A}^{\rm ext}=\left((\mathbf V_B^{\rm post})^{-1}-(\mathbf V_B^{\rm pri})^{-1}\right)^{-1},\tag{39}
$$

$$
\mathbf x_{B\to A}^{\rm ext}=\mathbf V_{B\to A}^{\rm ext}\left((\mathbf V_B^{\rm post})^{-1}\mathbf x_B^{\rm post}-(\mathbf V_B^{\rm pri})^{-1}\mathbf x_B^{\rm pri}\right),
$$

其中 $\mathbf x_B^{\rm pri}=[(\mathbf x_B^{1,\rm pri})^T,\ldots,(\mathbf x_B^{K,\rm pri})^T]^T$，$\mathbf x_B^{\rm post}=[(\mathbf x_B^{1,\rm post})^T,\ldots,(\mathbf x_B^{K,\rm post})^T]^T$，$\mathbf V_B^{\rm pri}\triangleq\mathrm{BlockDiag}(\mathbf V_B^{1,\rm pri},\ldots,\mathbf V_B^{K,\rm pri})$，$\mathbf V_B^{\rm post}\triangleq\mathrm{BlockDiag}(\mathbf V_B^{1,\rm post},\ldots,\mathbf V_B^{K,\rm post})$。

### B. M 步

M 步中，由于难以得到 $\ln p(\mathbf y,\boldsymbol\zeta)$ 的闭式表达，直接求解对数后验函数的最大化十分困难。常用做法是构造 $\ln p(\mathbf y,\boldsymbol\zeta)$ 的替代函数，转而对该替代函数关于 $\boldsymbol\zeta$ 最大化。具体地，第 $t$ 次迭代中 EM 方法构造的替代函数为

$$
\mathcal Q(\boldsymbol\zeta;\boldsymbol\zeta^t)=\int_{\mathbf x}p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^t)\frac{\ln p(\mathbf y,\mathbf x\mid\boldsymbol\zeta)}{p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^t)}=-\|\mathbf y-\boldsymbol\Phi\mathbf x^{\rm post}\|^2+\mathrm{tr}\left(\boldsymbol\Phi\mathbf V^{\rm post}\boldsymbol\Phi^H\right)+C,\tag{40}
$$

其中 $C$ 为常数，$\mathbf x^{\rm post}$ 与 $\mathbf V^{\rm post}$ 为 E 步得到的 $\mathbf x$ 的后验均值与协方差。在当前迭代 $\boldsymbol\zeta^t$ 下，替代函数 $\mathcal Q(\boldsymbol\zeta;\boldsymbol\zeta^t)$ 及其梯度满足：$\mathcal Q(\boldsymbol\zeta;\boldsymbol\zeta^t)\le\ln p(\mathbf y,\boldsymbol\zeta)$，$\forall\boldsymbol\zeta$；$\mathcal Q(\boldsymbol\zeta^t;\boldsymbol\zeta^t)=\ln p(\mathbf y,\boldsymbol\zeta^t)$；且 $\partial\mathcal Q(\boldsymbol\zeta^t;\boldsymbol\zeta^t)/\partial\boldsymbol\zeta=\partial\ln p(\mathbf y,\boldsymbol\zeta^t)/\partial\boldsymbol\zeta$。因此需要最大化 $\mathcal Q(\boldsymbol\zeta;\boldsymbol\zeta^t)$ 以更新 $\boldsymbol\zeta^{t+1}$。由于 $\mathcal Q(\boldsymbol\zeta;\boldsymbol\zeta^t)$ 非凸，难以求得全局最优解；此时通过梯度上升法可简便地得到下一次更新。

需说明 SEA-LD-TurboCE 与已有 Turbo 算法（如文献 [13]）的差异：1）不再以均匀网格初始化，而是用长时间尺度阶段得到的先验信息初始化网格，从而以更少的网格点获得更精确的初始网格，既提高估计精度，又降低 Turbo 算法的复杂度（包括单次迭代复杂度与所需总迭代次数）；2）算法在位置域建模下推导，区别于此前在角度域建模的方法；3）采用非正交导频而非正交导频，位置域建模与合理的导频分配使不同用户在非正交导频下仍可被区分。

**算法 2**　SEA-LD-TurboCE 算法

1. 输入：$\mathbf y$、$\widehat{\mathbf\Xi}$、$\mathbf P_{\rm UE}^0$，最大内／外迭代次数 $I_{\rm in}$、$I_{\rm out}$，阈值 $\epsilon$。
2. 初始化：
3. 用精细散射体位置按 $\boldsymbol\gamma_0=\widehat{\mathbf\Xi}'$ 初始化动态网格。
4. **for** $t=1,\ldots,I_{\rm out}$ **do**
5. 　**E 步**：
6. 　初始化 $i_{\rm in}=1$、$\mathbf x_A^{\rm pri}=\mathbf 0$ 与 $\mathbf V_A^{\rm pri}$。
7. 　**while** $i_{\rm in}\le I_{\rm in}$ **do**
8. 　　$i_{\rm in}=i_{\rm in}+1$。
9. 　　按式（33）（34）更新 $\mathbf x_B^{\rm pri}=\mathbf x_{A\to B}^{\rm ext}$ 与 $\mathbf V_B^{\rm pri}=\mathbf V_{A\to B}^{\rm ext}$。
10. 　　在因子图 $G_B$ 上按式（41）—（46）执行消息传递。
11. 　　按式（36）（37）计算 $\widehat p(x_q^k\mid\mathbf y,\boldsymbol\zeta^t)$、$\widehat p(s_q^k\mid\mathbf y,\boldsymbol\zeta^t)$，$\forall q,k$。
12. 　　按式（38）（39）更新 $\mathbf x_A^{\rm pri}=\mathbf x_{B\to A}^{\rm ext}$ 与 $\mathbf V_A^{\rm pri}=\mathbf V_{B\to A}^{\rm ext}$。
13. 　**end while**
14. 　**M 步**：
15. 　用 E 步的 $\mathbf x_B^{\rm post}$ 与 $\mathbf V_B^{\rm post}$ 计算梯度 $\partial\mathcal Q(\boldsymbol\zeta^t;\boldsymbol\zeta^t)/\partial\boldsymbol\zeta$。
16. 　用梯度上升获得 $\boldsymbol\zeta^{t+1}$。
17. 　**if** $\|\boldsymbol\zeta^{t+1}-\boldsymbol\zeta^t\|\le\epsilon$ **then**
18. 　　**break**
19. 　**end if**
20. **end for**
21. 输出：$\widehat{\boldsymbol\zeta}$、$\widehat{\mathbf x}=\mathbf x_B^{\rm post}$ 与 $\widehat p(s_q^k\mid\mathbf y,\widehat{\boldsymbol\zeta})$，$\forall k$。

## VI. 数值结果

本节给出数值结果，以评估所提方案的信道估计性能。MIMO-OFDM 系统载频为 3.5 GHz，OFDM 子载波数 $P=192$，子载波间隔 $f_0=30$ kHz；每 12 个子载波聚合为一个资源块（RB），共 16 个 RB。基站配置 $N=64$（$N_x=N_y=8$）根天线，位于坐标 $[-50,0,25]$ m。用户数 $K=200$，每个用户在 $x\in[50,250]$ m、$y\in[-100,100]$ m 的方形区域内均匀分布，高度 $Z=1.5$ m。假设用户位置先验信息存在误差，且误差服从高斯分布，可表示为 $\epsilon\sim\mathcal N(\mu,\sigma_{\rm UE}^2)$；如无特别说明取 $\sigma_{\rm UE}=5$ m。信道按 3GPP R16 规范 [31] 在 Quadriga 平台中的 UMA 模型生成，$L=6$，性能结果为 100 次实现的平均。采用归一化均方误差（NMSE）作为性能指标评估各算法的外推性能，定义为 $\mathrm{NMSE}=\|\widehat{\mathbf H}-\mathbf H\|^2/\|\mathbf H\|^2$。作为对比，考虑以下基准方案：

- **MUSIC+LS**：用 TST-MUSIC 算法估计散射体位置，用 LS 算法估计复增益。
- **所提方案（多用户＋非正交导频，MU-NP）**：用所提 SEA-LD-TurboCE 算法联合进行多用户信道估计与定位，网格由 TST-MUSIC 与基于 DBSCAN 的散射体关联合初始化；并通过基于图着色的用户分组实现导频空间复用。
- **所提方案（多用户＋正交导频，MU-OP）**：与 MU-NP 方案相同，只是不同用户使用正交导频，因而没有组内干扰。
- **所提方案（单用户＋正交导频，SU-OP）**：不同用户各自用所提 SEA-LD-TurboCE 算法进行信道估计与定位（即假设各用户稀疏信道先验独立）；不同用户使用正交导频，网格由 TST-MUSIC 算法初始化。
- **Genie-aided LMMSE**：利用信道的完美统计知识在时域与空域对接收信号滤波，可视为信道估计性能的上界。

### A. 多用户散射体关联性能

图 5 展示了基于 DBSCAN 的多用户散射体关联算法的有效性。图中不同颜色的簇表示关联到的共享散射体，被 DBSCAN 判为噪声的点显示为灰色。可以看到，粗估计的散射体位置在真值附近形成簇；在 SNR=0 dB 时，经关联与更新得到的精细估计位置更接近真值。此外，该散射体关联算法通过融合多用户散射体的估计结果识别环境中的全局散射体，从而降低漏检概率（如图 9 所示）。

**图 5**：基于 DBSCAN 的散射体关联算法性能（SNR=0 dB）。原文图注标注：噪声／个体散射体位置、真实共享散射体位置、估计共享散射体位置、漏检，以及“不同颜色代表不同簇”。

### B. 用户分组性能

图 6 给出组内最小距离的累计分布函数（CDF），其中组内最小距离定义为同一组内两位用户按式（11）计算的最小距离 $\min_{k_1,k_2\in\mathcal G_g}d_{k_1,k_2}$。图 6 展示了基于图着色的用户分组算法在真实散射体位置与估计散射体位置下的有效性。可以看到，该分组算法保证组内散射体真实位置之间的最小距离，以降低组内干扰；而对于估计的散射体位置，约 10% 的同组用户彼此间距小于 50 m，可能带来组内干扰。这主要由散射体位置估计不准造成，无法通过用户分组算法避免。

为方便描述非正交导频复用的程度，定义导频缩减因子 $\kappa=K/G$，即用户数与分组数之比。$\kappa$ 越大，导频空间复用的倍数越大；$\kappa=1$ 表示正交导频方案。图 7 中可以看到，不同 SNR 下 MU-NP 方案的性能随 $\kappa$ 增大而下降，原因是更多用户复用同一导频会加小组内用户间干扰，导致 NMSE 上升。此外，比较所提 MU-NP 方案与 SU-OP 方案可见：在 $-10$ dB 至 $10$ dB 范围内，导频复用次数相对 SU 方案提高约 2.5—4 倍；且随 SNR 升高，MU-NP 相对 SU-OP 的增益变小。原因是高 SNR 下系统更易受组内干扰影响，用户间部分非正交的路径会显著降低信道估计性能。

**图 6**：所提算法的用户分组性能（组内最小距离的 CDF；对比 MU-NP 在 SNR=10 dB、−10 dB 的估计位置与真实位置）。
**图 7**：NMSE 性能随导频缩减因子的变化（MU-NP 与 SU-OP 在 SNR=−10、0、10 dB 下）。

### C. 信道估计性能

图 8 比较各方案信道估计 NMSE 随 SNR 的变化。所有方案的性能都随 SNR 提高而改善，但 MUSIC+LS 方案的性能逐渐趋于平缓，原因是该方案无法充分利用空域信道的稀疏信息。此外，MU-OP 方案相对 SU-OP 方案取得显著性能增益，并接近 genie-aided 方案的性能，表明 SEA-LD-TurboCE 算法能够有效利用位置域信道的三维多用户联合稀疏性。另外，MU-NP 方案相对 MU-OP 方案只有较小的性能损失，却可通过空分实现导频资源的两倍复用，体现了用户分组算法的有效性。

**图 8**：信道估计 NMSE 随 SNR 的变化（对比 Genie-aided LMMSE、MU-OP、SU-OP、MU-NP（$\kappa=2$）、MUSIC+LS）。

### D. 定位性能

图 9 与图 10 比较散射体定位的 RMSE 与漏检性能随 SNR 的变化。可以看到，MU-NP 方案能够充分利用多用户散射体之间的重叠特性，从而提高散射体位置估计精度并降低漏检概率。此外，当用户位置存在 $\sigma_{\rm UE}=20$ m 的误差时，MU-NP 方案相对 MUSIC+LS 方案的 RMSE 损失更小，同时虚警概率始终低于 MUSIC+LS。这是因为 MU-NP 方案可利用多用户散射体之间的重叠信息，通过融合多个散射体的位置样本来降低用户位置误差的影响。

> **原文疑点：** 原文第 28 页写“In Fig. 9 and Fig. 10”，但全文只出现图 9（含 (a) RMSE 与 (b) 漏检两个子图），未见图 10 的图题。疑为原文笔误（应指图 9 的两个子图）；译稿按图 9(a)(b) 理解，未虚构图 10。

**图 9**：散射体定位的 RMSE 与漏检性能随 SNR 的变化。(a) RMSE 性能；(b) 漏检性能。对比 MUSIC+LS 与 MU-NP 在用户位置误差 $\sigma_{\rm UE}=0$ m、20 m 下的结果。

## VII. 结论

本文针对 MIMO-OFDM 系统中的多用户上行联合信道估计与定位，提出一种双时间尺度方法，充分利用多用户的空间特性。文中引入多用户信道的位置域稀疏表示，以充分利用不同用户信道的重叠与正交特性。在长时间尺度阶段，通过融合多用户的共享散射体位置获得精细的散射体位置；基于该信息提出基于图着色的用户分组算法，从而实现导频的空分复用。在短时间尺度阶段，提出低复杂度的 SEA-LD-TurboCE 算法，以在空间复用导频条件下实现高精度的多用户联合信道估计与定位。仿真结果验证了所提方案相对基线的优越信道估计与定位性能，并且所提多用户非正交导频方案相比单用户方案可获得两倍以上的导频扩展增益。

## 附录

### A. SEA-LD-TurboCE 模块 B 的消息更新方程

**1）沿路径 $x_q^k\to f_q^k\to s_q^k\to\eta_q^k\to s_q$ 的消息传递。** 从因子节点 $\eta_q^k$ 到变量节点 $s_q$ 的消息为

$$
\nu_{\eta_q^k\to s_q}(s_q)=\sum_{s_q^k}\eta_q^k(s_q^k,s_q)\times\nu_{s_q^k\to\eta_q^k}(s_q^k)=\pi_{s,q}^{k,\rm in}\delta(s_q-1)+\left(1-\pi_{s,q}^{k,\rm in}\right)\delta(s_q),\tag{41}
$$

其中

$$
\pi_{s^k,q}^{k,\rm in}=\left(1+\frac{1-\pi_{s^k,q}^{\rm in}}{1+2\pi_{s^k,q}^{\rm in}-\pi_{s^k,q}^{\rm in}-\rho_k}\right)^{-1},\qquad
\pi_{s^k,q}^{\rm in}=\left(1+\frac{\mathcal{CN}(0;x_{B,q}^{k,\rm pri},v_{B,q}^{k,\rm pri})}{\mathcal{CN}(0;x_{B,q}^{k,\rm pri},v_{B,q}^{k,\rm pri}+(\sigma_q^k)^2)}\right)^{-1}.
$$

**2）沿路径 $x_0^k\to f_0^k\to s_0^k\to h_0^k$ 的消息传递。** 从因子节点 $f_0^k$ 到变量节点 $s_0^k$、再到 $h_0^k$ 的消息为

$$
\mathcal V_{s_0^k\to h_0^k}(s_0^k)=\mathcal V_{f_0^k\to s_0^k}(s_0^k)\propto\int\mathcal V_{x_0^k\to f_0^k}(x_0^k)\times f_0^k(x_0^k,s_0^k)\,dx_0^k=\pi_{s_0^k}^{\rm in}\delta(s_0^k-1)+\left(1-\pi_{s_0^k}^{\rm in}\right)\delta(s_0^k),\tag{42}
$$

其中

$$
\pi_{s_0^k}^{\rm in}=\left(1+\frac{\mathcal{CN}(0;x_{B,0}^{r,\rm pri},v_{B,0}^{r,\rm pri})}{\mathcal{CN}(0;x_{B,0}^{r,\rm pri},v_{B,0}^{r,\rm pri}+(\sigma_0^k)^2)}\right)^{-1}.
$$

**3）沿路径 $s_q\to h_q$ 的消息传递。** 从因子节点 $h_q$ 到变量节点 $s_q$ 的消息为

$$
\mathcal V_{s_q\to h_q}(s_q)\propto\prod_{k\in\mathcal K_q}\mathcal V_{\eta_q^k\to s_q}(s_q)=\pi_q^{\rm in}\delta(s_q-1)+\left(1-\pi_q^{\rm in}\right)\delta(s_q),\tag{43}
$$

其中

$$
\pi_q^{\rm in}=\frac{\prod_{k\in\mathcal K_q}\pi_{s,q}^{k,\rm in}}{\prod_{k\in\mathcal K_q}\pi_{s,q}^{k,\rm in}+\prod_{k\in\mathcal K_q}\left(1-\pi_{s,q}^{k,\rm in}\right)},
$$

$\mathcal K_q$ 表示 $s_q$ 除 $h_q$ 之外的邻居因子节点集合。

**4）沿路径 $h_q\to s_q$ 的消息传递。** 从因子节点 $h_q$ 到变量节点 $s_q$ 的消息为

$$
\mathcal V_{h_q\to s_q}(s_q)\propto h_q(s_q)=\lambda\delta(s_q-1)+(1-\lambda)\delta(s_q).\tag{44}
$$

**5）沿路径 $s_q\to\eta_q^k\to s_q^k\to f_q^k\to x_q^k$ 的消息传递。** 从因子节点 $f_q^k$ 到变量节点 $x_q^k$ 的消息为

$$
\mathcal V_{f_q^k\to x_q^k}(x_q^k)\propto\sum_{s_q^k}\mathcal V_{s_q^k\to f_q^k}(s_q^k)\times f_q^k(x_q^k,s_q^k)=\pi_{s_k,q}^{\rm out}\mathcal{CN}\left(x_q^k;0,(\sigma_q^k)^2\right)+\left(1-\pi_{s_k,q}^{\rm out}\right)\delta(x_q^k),\tag{45}
$$

其中 $\pi_{s_k,q}^{\rm out}=\rho_k\pi_{s,q}^{k,\rm out}$，且

$$
\pi_{s,q}^{k,\rm out}=\frac{\lambda\prod_{l\in\mathcal K_q\backslash k}\pi_{s,q}^{l,\rm in}}{\lambda\prod_{l\in\mathcal K_q\backslash k}\pi_{s,q}^{l,\rm in}+(1-\lambda)\prod_{l\in\mathcal K_q\backslash k}\left(1-\pi_{s,q}^{l,\rm in}\right)}.
$$

**6）沿路径 $h_0^k\to s_0^k\to f_0^k\to x_0^k$ 的消息传递。** 从因子节点 $f_0^k$ 到变量节点 $x_0^k$ 的消息为

$$
\mathcal V_{f_0^k\to x_0^k}(x_0^k)\propto\sum_{s_0^k}\mathcal V_{s_0^k\to f_0^k}(s_0^k)\times f_0^k(x_0^k,s_0^k)=\rho_0^k\,\mathcal{CN}\left(x_0^k;0,(\sigma_0^k)^2\right)+\left(1-\rho_0^k\right)\delta(x_0^k).\tag{46}
$$

> **说明：** 附录与正文中式（37）的 $\pi_{s_k,q}^{\rm in}$、$\pi_{s_k,q}^{\rm out}$ 均为原文所用记号；原文式（41）的 $\pi_{s^k,q}^{k,\rm in}$ 与 $\pi_{s^k,q}^{\rm in}$ 分母中“$1+2\pi^{\rm in}-\pi^{\rm in}-\rho_k$”按 PDF 渲染原样转录（可化简为 $1+\pi^{\rm in}-\rho_k$），如与作者原意不符以原 PDF 为准。

## 参考文献

> 以下按原文编号 [1]—[31] 转录英文原书目，条目文字不翻译；抽取文本中的 “Y .” 等空格为 PDF 提取伪影，已按常规写法整理。原文 [21] 后另有一行 “vol. 19, no. 5, pp. 3185–3198, 2020.” 在 PDF 中即排在该条目内，疑为原排版残留，照原样转录。

[1] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, “Massive MIMO for next generation wireless systems,” IEEE Communications Magazine, vol. 52, no. 2, pp. 186–195, 2014.

[2] F. Rusek et al., “Scaling up MIMO: Opportunities and challenges with very large arrays,” IEEE Signal Processing Magazine, vol. 30, no. 1, pp. 40–60, 2012.

[3] L. Cimini, “Analysis and simulation of a digital mobile channel using orthogonal frequency division multiplexing,” IEEE Transactions on Communications, vol. 33, no. 7, pp. 665–675, 1985.

[4] L. Lu, G. Y. Li, A. L. Swindlehurst, A. Ashikhmin, and R. Zhang, “An overview of massive MIMO: Benefits and challenges,” IEEE Journal of Selected Topics in Signal Processing, vol. 8, no. 5, pp. 742–758, 2014.

[5] 3GPP, “TS 38.211 V16.7.0, Technical Specification Group Radio Access Network; NR; Physical channels and modulation,” Sep. 2021.

[6] X. Xia, H. Zhao, and C. Zhang, “Improved SRS design and channel estimation for LTE-Advanced uplink,” in Proc. IEEE 5th Int. Symp. MAPE EMC Technol. Wireless Commun., IEEE, 2013, pp. 84–90.

[7] T. Van Chien and E. Björnson, “Massive MIMO communications,” 5G Mobile Communications, Springer, 2017, pp. 77–116.

[8] Yubo Wan, An Liu, Tony Q. S. Quek, “Multi-User Pilot Pattern Optimization for Channel Extrapolation in 5G NR Systems,” [Online]. Available: https://arxiv.org/abs/2407.10532.

[9] K. Lu, Z. Wu and X. Shao, “A Survey of Non-Orthogonal Multiple Access for 5G,” 2017 IEEE 86th Vehicular Technology Conference (VTC-Fall), Toronto, ON, Canada, 2017, pp. 1–5.

[10] Zhu X, Dai L, Wang Z. Graph coloring based pilot allocation to mitigate pilot contamination for multi-cell massive MIMO systems, IEEE Communications Letters, 2015, 19(10): 1842–1845.

[11] Liu P, Jin S, Jiang T, et al. Pilot power allocation through user grouping in multi-cell massive MIMO systems, IEEE Transactions on Communications, 2016, 65(4): 1561–1574.

[12] M. Alkhaled, E. Alsusa, and K. A. Hamdi, “Adaptive Pilot Allocation Algorithm for Pilot Contamination Mitigation in TDD Massive MIMO Systems,” 2017 IEEE Wireless Communications and Networking Conference (WCNC), 2017, pp. 1–6.

[13] Y. Wan, G. Liu, A. Liu, and M.-J. Zhao, “Robust Multi-user Channel Tracking Scheme for 5G New Radio,” IEEE Transactions on Wireless Communications, vol. 23, no. 6, pp. 5878–5894, June 2024.

[14] J. Hoydis, C. Hoek, T. Wild, and S. ten Brink, “Channel measurements for large antenna arrays,” Proc. Int. Symp. Wireless Commun. Syst., 2012, pp. 811–815.

[15] X. Gao, O. Edfors, F. Rusek, and F. Tufvesson, “Linear pre-coding performance in measured very-large MIMO channels,” in Proc. Veh. Technol. Conf., 2011, pp. 1–5.

[16] A. Liu, L. Lian, V. K. N. Lau, and X. Yuan, “Downlink channel estimation in multiuser massive MIMO with hidden Markovian sparsity,” IEEE Transactions on Signal Processing, vol. 66, no. 18, pp. 4796–4810, Sep. 2018.

[17] A. Liu, F. Zhu and V. K. N. Lau, “Closed-Loop Autonomous Pilot and Compressive CSIT Feedback Resource Adaptation in Multi-User FDD Massive MIMO Systems,” IEEE Transactions on Signal Processing, vol. 65, no. 1, pp. 173–183, 1 Jan. 2017.

[18] X. Rao and V. K. Lau, “Distributed compressive CSIT estimation and feedback for FDD multi-user massive MIMO systems,” IEEE Transactions on Signal Processing, vol. 62, no. 12, pp. 3261–3271, Jun. 2014.

[19] J. Dai, A. Liu and V. K. N. Lau, “Joint Channel Estimation and User Grouping for Massive MIMO Systems,” IEEE Transactions on Signal Processing, vol. 67, no. 3, pp. 622–637, 1 Feb. 2019.

[20] B. Zhou, R. Wichman, L. Zhang, and Z. Luo, “Simultaneous localization and channel estimation for 5G mmWave MIMO communications,” Proc. IEEE 32nd Annu. Int. Symp. Pers. Indoor Mobile Radio Commun., 2021, pp. 1208–1214.

[21] X. Zheng, A. Liu, and V. Lau, “Joint channel and location estimation of massive MIMO system with phase noise,” IEEE Transactions on Signal Processing, vol. 68, pp. 2598–2612, 2020. vol. 19, no. 5, pp. 3185–3198, 2020.

[22] X. Yang, C.-K. Wen, Y. Han, S. Jin, and A. L. Swindlehurst, “Soft channel estimation and localization for millimeter wave systems with multiple receivers,” IEEE Transactions on Signal Processing, pp. 1–15, 2022.

[23] J. Hong, J. Rodríguez-Piñeiro, X. Yin and Z. Yu, “Joint Channel Parameter Estimation and Scatterers Localization,” IEEE Transactions on Wireless Communications, vol. 22, no. 5, pp. 3324–3340, May 2023.

[24] Z. Chen, M.-M. Zhao, M. Li, F. Xu, Q. Wu and M.-J. Zhao, “Joint Location Sensing and Channel Estimation for IRS-Aided mmWave ISAC Systems,” IEEE Transactions on Wireless Communications, vol. 23, no. 9, pp. 11985–12002, Sept. 2024.

[25] J. Hoydis, C. Hoek, T. Wild, and S. ten Brink, “Channel measurements for large antenna arrays” 2012 International Symposium on Wireless Communication Systems (ISWCS), Paris, France, 2012, pp. 811–815.

[26] Y.-Y. Wang, J.-T. Chen, and W.-H. Fang, “TST-MUSIC for joint DOA delay estimation,” IEEE Transactions on Signal Processing, vol. 49, no. 4, pp. 721–729, Apr. 2001.

[27] Ypma, Tjalling J. “Historical development of the Newton–Raphson method.” SIAM review 37.4 (1995): 531–551.

[28] R. V. Kulkarni and G. K. Venayagamoorthy, “Particle swarm optimization in wireless sensor networks: A brief survey,” IEEE Transactions on Systems, Man, and Cybernetics C, vol. 41, no. 2, pp. 262–267, Mar. 2011.

[29] W. Xu, A. Liu, B. Zhou, and M.-j. Zhao, “Successive linear approximation VBI for joint sparse signal recovery and dynamic grid parameters estimation,” [Online]. Available: https://arxiv.org/pdf/2307.09149.

[30] J. Luo et al., “An Entropy-Based Adaptive DBSCAN Clustering Algorithm and Its Application in THz Wireless Channels,” IEEE Transactions on Antennas and Propagation, vol. 71, no. 12, pp. 9830–9837, Dec. 2023.

[31] 3GPP, “Study on channel model for frequencies from 0.5 to 100 GHz (3GPP TR 38.901 version 16.1.0 release 16),” Dec. 2019.

**范围与校对状态：** 本页已补入第 III.C 节末尾（式（22）—（24））、第 IV—VII 节全文、附录 A 消息更新方程（式（41）—（46））、表 I 逐格转录、算法 1 与算法 2 的逐行伪代码，以及参考文献 [1]—[31] 的英文原书目。图 1—9 均未复制图片，只保留中文图注；原文的图 4（因子图）为图形，本页以文字说明其因子节点与消息路径。仍未完成：①逐句逐式与 PDF 的终校；②原文若另有图 10（正文提及但无图题），图中数据（若有）未转录；③第 VI 节为纯图结果，文中未给出实验表格数值，故无法逐格转录实验表格。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
