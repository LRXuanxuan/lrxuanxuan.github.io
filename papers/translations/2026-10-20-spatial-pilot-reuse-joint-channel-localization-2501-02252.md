---
layout: page
title: "散射环境感知的空间复用导频多用户联合信道估计与定位｜中文全文译文"
permalink: /papers/translations/2026-10-20-spatial-pilot-reuse-joint-channel-localization-2501-02252/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2501.02252)

# 利用空间复用导频的散射环境感知多用户联合信道估计与定位

**原题：** Scattering Environment Aware Joint Multi-user Channel Estimation and Localization with Spatially Reused Pilots  
**作者：** Kaiyuan Tian、Yani Chi、Yufan Zhou、An Liu  
**版本：** arXiv:2501.02252v1，2025 年 1 月 4 日，33 页。  
**状态：** 已译摘要、研究背景、系统建模、两时间尺度方案、长短时间尺度算法的主要内容及实验结论；稀疏先验的全部概率公式、消息传递更新、完整实验图表、附录与书目仍待逐式核对。**当前不是已经完整验收的全文译文。**

## 摘要

用户数量增加将导致导频开销增加，有限的导频资源使得为所有用户提供正交导频变得越来越困难。若能充分利用多用户（MU）环境固有的物理特征，就有可能降低导频成本并提高信道估计性能。事实上，位置相近的用户可能共享同一个散射体，而距离较远的用户通常具有近似正交的信道。

本文提出面向 MIMO-OFDM 系统上行多用户联合信道估计与定位的**双时间尺度方法**，充分利用多用户场景的空间特征。为了准确表示 MU 信道结构，将信道建模在三维位置域中。长时间尺度阶段，先利用时–空–时多重信号分类（time-space-time MUSIC，TST-MUSIC）算法粗估各用户对应的散射体位置，再借助基于密度的带噪应用空间聚类（DBSCAN）进行跨用户散射体关联并细化位置估计。随后，基站利用这些先验信息，以基于图着色的用户分组算法实现导频的空间分复用，减少导频开销。

短时间尺度阶段，提出低复杂度的**散射环境感知位置域 Turbo 信道估计**（SEA-LD-TurboCE）算法，整合多个用户共享的散射体信息，从而在空间复用导频条件下实现高精度的多用户联合信道估计与定位。仿真结果表明，所提方案相较基线方法具有更好的信道估计和定位性能。

**关键词：** MIMO-OFDM；多用户信道估计与定位；导频开销降低的空分复用；散射体关联。

## I. 引言

大规模多输入多输出（massive MIMO）技术利用空间复用与阵列增益满足高速数据传输需求，是 5G 和未来无线系统的关键技术之一。正交频分复用（OFDM）具有对抗频率选择性衰落的能力，因此 massive MIMO 与 OFDM 的组合已成为 5G NR 物理层的重要基础。

部署大规模 MIMO-OFDM 的关键挑战是在有限导频资源下准确获取基站（BS）处的信道状态信息（CSI）。时分双工（TDD）系统利用上行探测参考信号（SRS）估计信道，再借助信道互易性开展下行预编码，从而相较频分双工（FDD）减少了导频开销。

现有 5G 系统为避免多用户导频干扰，通常在码域、时域或频域分配正交上行导频。但随着用户数量增加，有限的正交导频难以支持全部用户。非正交导频允许服务更多用户，却需要控制用户间干扰。现有分配方法多从功率和干扰角度设计，例如以图着色为强干扰用户安排不同导频，或利用功率控制提高最差 SINR。其他研究采用非正交 Zadoff–Chu 序列、逐次干扰抵消和 Turbo 算法进行多用户信道估计。

已有研究指出，物理上相近的用户可能因为共享散射簇而具有共同的稀疏结构，可用来改善联合恢复。许多方法仅假定这些用户在角度域具有共同支撑，但这一假设过于简化。实际场景中，两个用户共享的是具体物理散射体，因此共同支撑更自然地体现在**三维位置域**，未必在角度域完全一致。

在散射体/用户定位与信道估计的联合研究中，已有方法利用散射体几何位置、动态位置网格或软先验来提高恢复效果，也有工作研究不同反射次数的几何建模、IRS 辅助场景下的联合定位。作者认为，现有多用户算法仍未充分利用两个事实：其一，多个用户的三维位置域信道可具有部分重叠结构；其二，对于空间上近似正交的用户，可以让其共用同一份上行导频以进一步减少开销。

本文因此提出 TDD massive MIMO-OFDM 的双时间尺度联合估计方案。长时间尺度使用 TST-MUSIC 和 DBSCAN 识别多用户共享散射体，并通过图着色优化空间导频复用。短时间尺度则把长尺度获得的散射体信息用于初始化动态位置域网格，在复用导频的条件下使用 SEA-LD-TurboCE 同时估计多用户信道和用户/散射体位置。

研究的三项主要贡献是：第一，形成长尺度先验建立与短尺度联合推断相结合的总体框架；第二，将用户分组表述为利用主要散射体位置距离建立干扰关系的图着色问题，并通过粒子群优化（PSO）分配导频；第三，构造利用位置域部分重叠支撑和非正交导频的低复杂度消息传递方法，在细化定位的同时减轻用户间干扰。

## II. 系统模型

### A. 信道模型

考虑一个 TDD massive MIMO-OFDM 系统，包含一个由 $N=N_xN_y$ 个均匀平面阵列（UPA）天线构成的基站，以及 $K$ 个单天线用户。基站位于三维坐标原点。用球坐标 $\mathbf p_{\mathrm{UE},k}=[\theta_{\mathrm{UE},k},\phi_{\mathrm{UE},k},r_{\mathrm{UE},k}]$ 表示用户 $k$ 的方位角、俯仰角和距离。

设三维区域 $\mathcal R$ 中共有 $L$ 个散射体，其位置为 $\mathbf p_l=[\theta_l,\phi_l,r_l]$。用户 $k$ 通过其中的 $L_k$ 个散射体形成非视距传播路径，对应的索引集合 $\mathcal L_k\subseteq\{1,\ldots,L\}$。基站已从 GPS 等方式获得用户位置的粗略先验。

第 $p$ 个子载波上，用户 $k$ 发送导频 $u_{k,p}$，基站接收信号为

$$
\mathbf y_{k,p}=\mathbf h_{k,p}u_{k,p}+\mathbf z_{k,p},\tag{1}
$$

其中 $\mathbf h_{k,p}\in\mathbb C^N$ 为信道向量，$\mathbf z_{k,p}$ 为加性复高斯白噪声。式（1）先假设用户导频正交、没有用户间干扰。长尺度散射体定位阶段使用这种正交导频，短尺度则使用空间复用的非正交导频，相关模型将在后文给出。

信道由视距（LOS）和非视距（NLOS）部分组成：

$$
\mathbf h_{k,p}=\mathbf h_{k,p}^{\mathrm{LOS}}+
\mathbf h_{k,p}^{\mathrm{NLOS}}.\tag{2}
$$

分别有

$$
\mathbf h_{k,p}^{\mathrm{LOS}}=
x_{k0}e^{-j2\pi pf_0\tau_0(\mathbf p_{\mathrm{UE},k})}
\mathbf a(\theta_{\mathrm{UE},k},\phi_{\mathrm{UE},k}),\tag{3}
$$

$$
\mathbf h_{k,p}^{\mathrm{NLOS}}=
\sum_{l\in\mathcal L_k}
x_{kl}e^{-j2\pi pf_0\tau_l(\mathbf p_{\mathrm{UE},k})}
\mathbf a(\theta_l,\phi_l).\tag{4}
$$

$f_0$ 是子载波间隔，$\mathbf a$ 是 UPA 阵列响应，$x_{k0}$、$x_{kl}$ 分别为 LOS 和第 $l$ 条 NLOS 路径的复增益。LOS 时延为 $\tau_0=r_{\mathrm{UE},k}/c$。单次散射形成的 NLOS 路径从用户到散射体，再由散射体到基站，总时延为

$$
\tau_l(\mathbf p_{\mathrm{UE},k})=
\frac{\sqrt{r_{\mathrm{UE},k}^2+r_l^2-
2r_{\mathrm{UE},k}r_l[
\sin\theta_{\mathrm{UE},k}\sin\theta_l
\cos(\phi_{\mathrm{UE},k}-\phi_l)
+\cos\theta_{\mathrm{UE},k}\cos\theta_l]}}{c}
+\frac{r_l}{c}.\tag{5}
$$

其中 $c$ 是光速。

**图 1.** 多用户上行信道模型：用户 1、2 可能通过同一个散射体传播，其他散射体只参与个别用户的路径，从而产生共享和专属两类位置域支撑。

### B. 位置域稀疏表示

为同时利用不同用户位置域信道的重叠和正交结构，在区域 $\mathcal R$ 内定义具有 $Q$ 个网格点的三维动态位置域网格 $\boldsymbol\gamma=\{\gamma_1,\ldots,\gamma_Q\}$，其中 $\gamma_q=(\theta_q,\phi_q,r_q)$。

对应阵列响应矩阵为

$$
\mathbf A(\boldsymbol\theta,\boldsymbol\phi)=
[\mathbf a(\theta_1,\phi_1),\ldots,
\mathbf a(\theta_Q,\phi_Q)]\in\mathbb C^{N\times Q}.\tag{6}
$$

第 $p$ 个子载波上，位置域字典还需要乘上取决于各网格点传播时延的频率相位向量 $\mathbf b_{k,p}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})$：

$$
\mathbf b_{k,p}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})=
\left[
e^{-j2\pi pf_0\tau(\boldsymbol\gamma_1,\mathbf p_{\mathrm{UE},k})},
\ldots,
e^{-j2\pi pf_0\tau(\boldsymbol\gamma_Q,\mathbf p_{\mathrm{UE},k})}
\right]^T\in\mathbb C^{Q\times1}.\tag{7}
$$

。因此 NLOS 信道为

$$
\mathbf h_{k,p}^{\mathrm{NLOS}}=
\mathbf A(\boldsymbol\gamma)
\operatorname{Diag}(\mathbf b_{k,p}
(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k}))
\mathbf x_k.\tag{8}
$$

这里 $\mathbf x_k\in\mathbb C^{Q\times1}$ 是位置域稀疏信道向量，只有与用户 $k$ 相关的 $L_k$ 个散射体对应非零元素。各非零项在原文模型中服从零均值、单位方差的独立同分布复高斯分布。

### C. 多用户联合稀疏模型

位置接近的用户可能拥有相近的散射结构。为捕捉部分重叠散射体，作者给每个用户定义稀疏支撑 $\mathbf s_k=[s_{k1},\ldots,s_{kQ}]^T$，当 $\mathbf x_k$ 第 $q$ 项非零时 $s_{kq}=1$，否则为 0。再定义全局支撑 $\mathbf s=[s_1,\ldots,s_Q]^T$：只有当全部用户在第 $q$ 点均没有散射分量时，$s_q=0$，否则 $s_q=1$。不同用户的条件支撑概率 $p(s_{kq}\mid s_q)$ 用来表征其共享散射体的程度。重叠越多，用户支撑中的共同非零位置越多。

## III. 双时间尺度联合估计与定位的问题建模

### A. 总体框架

由于正交导频资源数限制可服务的用户数，作者提出利用位置域的空间分复用，使在空间传播结构上近似正交的用户能够同时在相同频率、相同时间发送同一导频。挑战是避免复用导频的用户产生过强空间干扰。

**图 2.** 双时间尺度框架：长尺度阶段先使用正交导频估计各用户散射体位置，经 DBSCAN 关联共享散射体，再以图着色分配导频；随后多次短尺度阶段使用非正交导频进行 SEA-LD-TurboCE 联合信道估计和位置更新，直到下一次长尺度更新。

完整三维空间网格通常很大，若直接在整个区域执行基于字典的估计，复杂度可能达到 $O(Q^3)$。因此用长尺度散射体位置先验缩小短尺度需要处理的网格范围和候选散射体数量。

### B. 长时间尺度问题

**粗散射体定位。** 为用户 $k$ 定义其传播路径的方位角、俯仰角和时延集合，将多个子载波信号写为

$$
\mathbf Y_k=\mathbf A(\boldsymbol\theta_k,\boldsymbol\phi_k)
\mathbf X_k\mathbf G(\boldsymbol\tau_k)^T.\tag{9}
$$

通过 TST-MUSIC 估计路径的角度和时延，再结合已有的用户位置，将其转换为三维散射体位置估计。

**散射体关联与位置细化。** 多个用户可能观测同一个散射体，因此可以把各用户粗估得到的位置进行聚类关联。用关联向量 $\boldsymbol\beta$ 指示每个候选散射体所属的簇，0 表示未归入任何共享簇。假定不同用户的粗定位误差独立且近似高斯，对同一簇内的位置估计进行融合，从而细化共享散射体位置。

**面向导频空间复用的用户分组。** 两个用户之间的距离不简单定义为用户本身的欧氏距离，而是其**主要散射体集合之间的最小距离**。主要散射体指携带大部分信道能量（例如 95%）的路径。设共有 $G$ 组正交资源，把 $K$ 个用户分到 $G$ 组，组内共享导频且希望空间干扰尽量小。作者使用图着色及粒子群优化完成分组，使组内用户的散射体之间具有尽可能大的间距：

$$
\max_{\boldsymbol\omega}\,
\min_{\substack{k_1,k_2\in\mathcal G_g\\k_1\ne k_2}}
d_{k_1,k_2},\tag{10}
$$

其中

$$
\widehat d_{k_1,k_2}=
\min_{\substack{l_1\in\mathcal L_{k_1}\\l_2\in\mathcal L_{k_2}}}
\|\widehat{\mathbf p}_{l_1}-\widehat{\mathbf p}_{l_2}\|.\tag{11}
$$

$\omega_k$ 指示用户所属资源组。

### 三层联合稀疏先验：公式（12）–（19）

对于用户 $k$ 在位置域网格 $q$ 的稀疏信道系数，采用 Bernoulli–Gaussian 条件先验：

$$
p(x_q^k\mid s_q^k)=
\delta(s_q^k+1)\delta(x_q^k)
+\delta(s_q^k-1)\mathcal{CN}(x_q^k;0,(\sigma_q^k)^2),
\qquad q\in\mathcal Q.\tag{12}
$$

把全局支撑 $\mathbf s$ 与全部用户的个别支撑 $\mathbf s_1,\ldots,\mathbf s_K$ 结合，可得

$$
p(\mathbf s,\mathbf s_1,\ldots,\mathbf s_K)
=p(\mathbf s)\prod_{k\in\mathcal K}p(\mathbf s_k\mid\mathbf s)
=p(\mathbf s)\prod_{k\in\mathcal K}\prod_{q\in\mathcal Q}
p(s_q^k\mid s_q).\tag{13}
$$

原论文式（14）给出的二元支撑条件分布为

$$
\begin{aligned}
p(s_q^k\mid s_q)
={}&\delta(s_q+1)\delta(s_q^k+1)\\
&+\delta(s_q-1)
\left[\delta(s_q^k-1)\rho_k+
\delta(s_q^k+1)(1-\rho_k)\right].
\end{aligned}\tag{14}
$$

**原文疑点：** 式（12）和式（14）印出的多处 $\delta(s+1)$ 与其前文 $s\in\{0,1\}$ 的二值编码不相容；原文表 I 的相应概率因子改用 $\delta(s)$。因此这里保留原式排印，实际编程时应核对原作者所采用的支撑编码，不能直接照抄上式实现。

全局支撑向量采用独立先验，其中 $p(s_q=1)=\lambda$：

$$
p(\mathbf s)=\prod_{q\in\mathcal Q}p(s_q).\tag{15}
$$

于是 NLOS 的联合先验为

$$
\begin{aligned}
&p(\mathbf s,\mathbf s_1,\ldots,\mathbf s_K,
\mathbf x_1,\ldots,\mathbf x_K)\\
={}&p(\mathbf s)
\prod_{k\in\mathcal K}\prod_{q\in\mathcal Q}
p(s_q^k\mid s_q)
\prod_{k\in\mathcal K}\prod_{q\in\mathcal Q}
p(x_q^k\mid s_q^k).
\end{aligned}\tag{16}
$$

LOS 系数使用独立 Bernoulli–Gaussian 先验，$s_0^k$ 是 LOS 是否存在的二值变量，$\rho_0^k$ 是 LOS 存在概率：

$$
p(s_0^k)=\delta(s_0^k-1)\rho_0^k+
\delta(s_0^k)(1-\rho_0^k),\tag{17}
$$

$$
p(x_0^k\mid s_0^k)
=\delta(s_0^k)\delta(x_0^k)+
\delta(s_0^k-1)\mathcal{CN}(x_0^k;0,(\sigma_0^k)^2).\tag{18}
$$

合并 LOS 与 NLOS 系数后的完整先验为

$$
\begin{aligned}
&p(\mathbf s,\mathbf s_1,\ldots,\mathbf s_K,
\mathbf x_1,\ldots,\mathbf x_K,
s_0^1,\ldots,s_0^K,x_0^1,\ldots,x_0^K)\\
={}&p(\mathbf s,\mathbf s_1,\ldots,\mathbf s_K,
\mathbf x_1,\ldots,\mathbf x_K)
\prod_{k\in\mathcal K}p(s_0^k)
\prod_{k\in\mathcal K}p(x_0^k\mid s_0^k).
\end{aligned}\tag{19}
$$

### 多用户导频复用的观测矩阵：公式（20）–（23）

为表示所有子载波，分别构造用户 $k$ 的 NLOS 与 LOS 字典块：

$$
\boldsymbol\Phi_{Q,k}=
\begin{bmatrix}
u_1\mathbf A(\boldsymbol\gamma)
\operatorname{Diag}(\mathbf b_{k,1}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k}))\\
\vdots\\
u_P\mathbf A(\boldsymbol\gamma)
\operatorname{Diag}(\mathbf b_{k,P}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k}))
\end{bmatrix},\tag{20}
$$

$$
\boldsymbol\Phi_{0,k}=
\begin{bmatrix}
u_1e^{-j2\pi f_0\tau_0(\mathbf p_{\mathrm{UE},k})}
\mathbf a(\theta_{\mathrm{UE},k},\phi_{\mathrm{UE},k})\\
\vdots\\
u_Pe^{-j2\pi Pf_0\tau_0(\mathbf p_{\mathrm{UE},k})}
\mathbf a(\theta_{\mathrm{UE},k},\phi_{\mathrm{UE},k})
\end{bmatrix}.\tag{21}
$$

当第 $g$ 组用户共享同一组导频时，组接收向量为

$$
\mathbf y_g=\sum_{k\in\mathcal G_g}
\left[\boldsymbol\Phi_k(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})
\mathbf x_k+\mathbf z_k\right],\tag{22}
$$

其中 $\mathbf x_k=[x_0^k,x_1^k,\ldots,x_Q^k]^T$，$\boldsymbol\Phi_k=[\boldsymbol\Phi_{0,k},\boldsymbol\Phi_{Q,k}]$。不同组采用正交资源，可将全部组堆叠：

$$
\mathbf y=[\mathbf y_1;\ldots;\mathbf y_G]
=\boldsymbol\Phi\mathbf x+\mathbf z\in\mathbb C^{GNP\times1}.\tag{23}
$$

其中 $\boldsymbol\Phi=\operatorname{BlockDiag}(\overline{\boldsymbol\Phi}_1,\ldots,\overline{\boldsymbol\Phi}_G)$，
$\overline{\boldsymbol\Phi}_g=[\boldsymbol\Phi_k]_{k\in\mathcal G_g}$，
$\mathbf x=[\mathbf x_1;\ldots;\mathbf x_K]$。由于测量矩阵还取决于未知位置，联合信道估计与定位对应含未知字典参数的逆问题。

### C. 短时间尺度问题

短尺度模型使用三层联合稀疏先验：第一层是全局散射体支撑 $\mathbf s$，第二层是各用户支撑 $\mathbf s_k$，第三层是依支撑状态决定是否为零的信道系数 $\mathbf x_k$。当 $s_{kq}=0$ 时对应通道系数固定为零；当 $s_{kq}=1$ 时服从复高斯分布。重叠参数 $\rho_k$ 描述给定全局存在散射体的条件下，用户 $k$ 也具有该散射体的概率（原文式（12）–（16））。LOS 路径则另用 Bernoulli–Gaussian 分布建模（式（17）–（19））。

根据位置网格、用户位置和导频建立 NLOS、LOS 字典矩阵（式（20）、（21））。把同一资源组共享导频的用户信道相加，构成多用户整体观测模型（式（22）、（23））。目标是联合估计所有用户的稀疏信道系数、散射体动态网格和用户位置。给定位置等不确定参数 $\boldsymbol\zeta=\{\boldsymbol\gamma,\mathbf P_{\mathrm{UE}}\}$，需要计算联合后验边缘；反过来还需要估计位置参数：

$$
\widehat{\boldsymbol\zeta}=
\arg\max_{\boldsymbol\zeta}\log p(\boldsymbol\zeta\mid\mathbf y).\tag{24}
$$

由于图模型包含环路，直接精确计算后验边缘概率很困难。作者采用 Turbo 框架结合线性最小均方误差（LMMSE）和消息传递近似求解，再用期望最大化（EM）更新位置参数。

## IV. 长时间尺度算法

### A. TST-MUSIC 粗散射体定位

首先使用 TST-MUSIC 同时估计第 $k$ 个用户多径分量的角度与时延。该算法结合时域滤波和空间波束成形，在原文中直接引用现有方法 [26]，不重复推导其内部公式。然后将估计角度、时延及用户位置代入式（5）的几何关系，求解散射体距离：

$$
\min_{r_l}
\left\|
\frac{\sqrt{r_{\mathrm{UE},k}^2+r_l^2-
2r_{\mathrm{UE},k}r_l\widehat\alpha_k}}{c}
+\frac{r_l}{c}-\tau_l(\mathbf p_{\mathrm{UE},k})
\right\|^2,\quad l\in\mathcal L_k,\tag{25}
$$

其中 $\widehat\alpha_k$ 由估计的角度和已知用户角度计算。该非线性问题可由 Newton–Raphson 等方法求解。

### B. 基于 DBSCAN 的散射体关联

DBSCAN 能根据样本的局部密度形成簇，同时剔除孤立噪声点。关键参数是邻域半径 $\epsilon$ 和构成密度簇所需的最少点数 MinPts。邻域采用三维散射体位置之间的欧氏距离。

关联流程为：选择一个未访问散射体，如果其 $\epsilon$ 邻域具有足够多点，就建立一个簇；遍历簇内的密度可达点，并继续扩展包含足够多邻居的样本；直到本簇所有密度连通点被访问，再从其他未访问点开始创建新簇。未归入任何簇的点被视为个别用户的专属散射体，不进入共享簇。这样既能识别跨用户共享的散射体，也能保留个别用户特有的传播分量。

对第 $m$ 个共享簇的散射体位置，采用簇中所有粗估位置的平均值细化：

$$
\overline{\boldsymbol\xi}_m=
\frac1{|\mathcal C_m|}
\sum_{i\in\mathcal C_m}\widehat{\boldsymbol\Xi}[i].\tag{26}
$$

若原位置样本属于共享簇，就用该簇中心替换原估计，否则保留原样本（式（27））。为了避免漏检导致的性能损失，动态网格仍应覆盖可能的散射体位置，因此初始化网格为关联细化后的全局散射体位置集合。

### C. 图着色用户分组

根据两个用户主要散射体的最小距离判断潜在互扰关系，以用户为顶点、近邻干扰为边建立用户图。若两用户共享导频会有较强空间干扰，则应尽量将其分配到不同组；如果其主要散射体空间上相距足够远，就允许共用导频。用户分组可转化为图着色或受约束分组优化问题。

作者使用粒子群优化（PSO）寻找合适分组，并在算法 1 中给出粒子位置、速度、适应度、个体最优与全局最优的迭代更新步骤。最终目标是以有限数量的正交资源服务更多用户，同时将同组空间干扰限制在可分离范围内。由于用户环境的共享散射体位置在长时间尺度上相对稳定，不需要在每个短时信道估计时重新执行整套定位和分组。

补充长时间尺度的散射体关联位置更新（原文式 27）：

$$
\widehat{\boldsymbol\Xi}'[i]=
\begin{cases}
\overline{\boldsymbol\xi}_m,&i\in\mathcal C_m,\\
\widehat{\boldsymbol\Xi}[i],&\text{其他}.
\end{cases}\tag{27}
$$

其中 $\overline{\boldsymbol\xi}_m$ 为第 $m$ 个共享散射体簇的均值，未归类的候选散射体位置保持不变。

### C 节补录：图着色的距离、速度及适应度（式 28–32）

建立 $K\times K$ 无向图邻接矩阵 $\mathbf E$，其主对角线为零，非对角元素满足

$$
\mathbf E=\begin{bmatrix}
0&E_{12}&\cdots&E_{1K}\\
E_{21}&0&\cdots&E_{2K}\\
\vdots&\vdots&\ddots&\vdots\\
E_{K1}&E_{K2}&\cdots&0
\end{bmatrix},\tag{28}
$$

$$
E_{ij}=\begin{cases}
1,&d_{i,j}<d_{\mathrm{adj}},\\
0,&d_{i,j}\ge d_{\mathrm{adj}},
\end{cases}\quad i\ne j.\tag{29}
$$

其中 $d_{i,j}$ 是两个用户主要散射体集合之间的最小距离，$d_{\mathrm{adj}}$ 是判断是否构成邻接关系的距离阈值。较近的用户需要使用不同导频颜色，以降低复用时的干扰。

在离散粒子群优化（PSO）中，第 $a$ 个粒子第 $k$ 个元素的整数位置与速度更新为

$$
V_{a,k}^{(t+1)}=\operatorname{int}\!\left(V_{a,k}^{(t)}\right)+Z_1+Z_2,\tag{30}
$$

$$
X_{a,k}^{(t+1)}=X_{a,k}^{(t)}+V_{a,k}^{(t+1)}.\tag{31}
$$

这里 $Z_1,Z_2$ 是分别在 $[0,c_1(pbest_{a,k}-X_{a,k}^{(t)})]$ 和
$[0,c_2(gbest_{a,k}-X_{a,k}^{(t)})]$ 之间均匀抽取的整数随机量，$\operatorname{int}$ 为舍入运算。对所有顶点，定义当 $X_{a,i}=X_{a,j}$ 时 $S_{ij}=1$，否则为零。适应度函数为

$$
f_{\mathrm{fitness}}=
\sum_{i=1}^{K}\sum_{j=1}^{K}E_{ij}S_{ij}
+\max(g-G,0),\tag{32}
$$

其中 $g$ 为实际使用颜色数，$G$ 为目标用户组数。第一项惩罚邻接用户同色，第二项惩罚使用过多颜色。PSO 每次迭代的运算复杂度为 $O(K^2)$。

**算法 1：基于 PSO 的图着色用户分组（原文逐行译文）**

1. 输入全部用户散射体集合 $\widehat{\boldsymbol\xi}_k$、组数 $G$、阈值调整步长 $\Delta d_{\mathrm{adj}}$ 与收敛阈值 $\epsilon$。
2. 依据式（28）以初始 $d_{\mathrm{adj}}^{(0)}$ 构造邻接矩阵 $\mathbf E$；初始化所有粒子的 $X_{a,k}^{(0)}=k$、$V_{a,k}^{(0)}$、个体最好位置 $pbest_{a,k}^{(0)}$、全局最好位置 $gbest_k^{(0)}$，置 $t=0$。
3. 当实际颜色数 $g>G$ 时重复步骤 4–10。
4. 当 $\|\mathbf {gbest}^{(t+1)}-\mathbf {gbest}^{(t)}\|\ge\epsilon$ 时，重复步骤 5–9。
5. 使用式（30）更新每个粒子的速度。
6. 使用式（31）更新每个粒子的位置。
7. 用式（32）计算粒子的适应度。
8. 如果新适应度优于上次结果，则更新 $pbest_{a,k}^{(t+1)}$ 和 $gbest_k^{(t+1)}$。
9. 设置 $t\leftarrow t+1$ 并结束内层迭代。
10. 将邻接距离改为 $d_{\mathrm{adj}}^{(t+1)}=d_{\mathrm{adj}}^{(t)}-\Delta d_{\mathrm{adj}}$，再依式（28）更新邻接矩阵；结束外层迭代。
11. 输出导频分组 $\boldsymbol\omega=\mathbf{gbest}$。

原文算法的 $t$ 下标及控制变量 $g$ 在内外循环中的关系需结合代码落实；此处按原算法顺序译出，不自行修改终止条件。

## V. 短时间尺度算法

提出的 SEA-LD-TurboCE 交替计算信道后验与更新几何参数。作者借助 EM 方法，把估计分为 E 步和 M 步。E 步通过 Turbo 消息传递计算给定当前动态网格和用户位置时的近似后验；M 步使用这一后验更新网格点位置及用户位置，迭代直至收敛。

E 步分为模块 A 和模块 B。模块 A 根据整体线性观测模型采用 LMMSE 方法计算信道系数的后验均值与协方差，并从后验中扣除输入先验以构造外信息。模块 B 将模块 A 输出的外信息解释为虚拟 AWGN 观测：

$$
\mathbf x_B^{\mathrm{pri}}=\mathbf x+\mathbf z,
$$

再利用联合稀疏支撑的因子图进行消息传递。通过位置域共同支撑与个别用户支撑之间的概率联系，可以把不同用户的散射体信息结合起来，提升单用户信道系数和位置估计的可靠性。然后模块 B 把新的外信息返回模块 A，反复迭代以改善后验近似。

**图 3.** SEA-LD-TurboCE E 步中两个模块及其消息交换过程。  
**图 4.** 多用户共享散射体先验及 LOS/NLOS 系数的因子图。  
**算法 2.** SEA-LD-TurboCE 算法，包含初始化、E 步的模块交替和 M 步的几何更新。

与传统 Turbo 稀疏估计不同，所提方法不仅使用位置域而非单纯角度域支撑，而且把共享散射体导致的多用户联合稀疏先验嵌入因子图，允许用户发送空间复用的非正交导频，从而在信道估计过程中同时利用多用户关联结构和导频复用条件。

### 补录：Turbo 模块 A/B 与 EM 步的矩阵更新（式 33–40）

**模块 A：LMMSE 与外信息。** 输入来自模块 B 的先验 $\mathbf x_A^{\rm pri},\mathbf V_A^{\rm pri}$ 及接收向量 $\mathbf y$，按原文式（33）求后验均值和协方差：

$$
\begin{aligned}
\mathbf x_A^{\rm post}
&=\mathbf V_A^{\rm post}\left[
(\mathbf V_A^{\rm pri})^{-1}\mathbf x_A^{\rm pri}
+\frac{\boldsymbol\Phi^H\mathbf y}{\sigma_z^2}\right],\\
\mathbf V_A^{\rm post}
&=\left[\frac{\boldsymbol\Phi^H\boldsymbol\Phi}{\sigma_z^2}
+(\mathbf V_A^{\rm pri})^{-1}\right]^{-1}.
\end{aligned}\tag{33}
$$

其中 $\boldsymbol\Phi$ 是由字典和导频构成的测量矩阵，$\sigma_z^2$ 为观测噪声方差。后验信息扣除先验信息后，得到传递给模块 B 的外信息：

$$
\begin{aligned}
\mathbf x_{A\to B}^{\rm ext}
&=\mathbf V_{A\to B}^{\rm ext}\left[
(\mathbf V_A^{\rm post})^{-1}\mathbf x_A^{\rm post}
-(\mathbf V_A^{\rm pri})^{-1}\mathbf x_A^{\rm pri}\right],\\
\mathbf V_{A\to B}^{\rm ext}
&=\left[(\mathbf V_A^{\rm post})^{-1}
-(\mathbf V_A^{\rm pri})^{-1}\right]^{-1}.
\end{aligned}\tag{34}
$$

**模块 B：联合支撑消息传递。** 把来自模块 A 的外信息等效为虚拟复 AWGN 测量：

$$
\mathbf x_B^{\rm pri}=\mathbf x+\mathbf z,\tag{35}
$$

其虚拟噪声协方差取 $\mathbf V_B^{\rm pri}=\mathbf V_{A\to B}^{\rm ext}$。因子图通过 $\mathbf x_{kq}\to f_q^k\to s_{kq}\to\eta_q^k\to s_q$ 等方向交换消息，得到各位置域系数及其支撑状态的近似边缘后验：

$$
\widehat p(x_q^k\mid\mathbf y)\propto
v_{f_q^k\to x_q^k}\,v_{x_q^k\to f_q^k},\tag{36}
$$

$$
\widehat p(s_q^k=1\mid\mathbf y)=
\frac{\pi_{s_k,q}^{\rm in}\pi_{s_k,q}^{\rm out}}
{\pi_{s_k,q}^{\rm in}\pi_{s_k,q}^{\rm out}
+(1-\pi_{s_k,q}^{\rm in})(1-\pi_{s_k,q}^{\rm out})}.\tag{37}
$$

其后验均值和方差逐元素为

$$
\begin{aligned}
x_{B,q}^{k,\rm post}
&=\int x_q^k\,\widehat p(x_q^k\mid\mathbf y)\,\mathrm d x_q^k,\\
v_{B,q}^{k,\rm post}
&=\int |x_q^k-x_{B,q}^{k,\rm post}|^2
\,\widehat p(x_q^k\mid\mathbf y)\,\mathrm d x_q^k.
\end{aligned}\tag{38}
$$

由此形成 $\mathbf x_B^{\rm post}$ 和块对角协方差 $\mathbf V_B^{\rm post}$，再减去输入先验，得到发回模块 A 的外信息：

$$
\begin{aligned}
\mathbf V_{B\to A}^{\rm ext}
&=\left[(\mathbf V_B^{\rm post})^{-1}
-(\mathbf V_B^{\rm pri})^{-1}\right]^{-1},\\
\mathbf x_{B\to A}^{\rm ext}
&=\mathbf V_{B\to A}^{\rm ext}\left[
(\mathbf V_B^{\rm post})^{-1}\mathbf x_B^{\rm post}
-(\mathbf V_B^{\rm pri})^{-1}\mathbf x_B^{\rm pri}\right].
\end{aligned}\tag{39}
$$

**M 步：位置参数更新。** 用 E 步得到的后验构造 EM 代理函数，原文式（40）记为

$$
\begin{aligned}
Q(\boldsymbol\zeta;\boldsymbol\zeta^{(t)})
&=\int p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^{(t)})
\log\frac{p(\mathbf y,\mathbf x\mid\boldsymbol\zeta)}
{p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^{(t)})}\,\mathrm d\mathbf x\\
&=-\|\mathbf y-\boldsymbol\Phi\mathbf x^{\rm post}\|_2^2
+\operatorname{tr}(\boldsymbol\Phi\mathbf V^{\rm post}\boldsymbol\Phi^H)+C.
\end{aligned}\tag{40}
$$

这里第二行依照原 PDF 排印保留了矩阵迹项的正号；由于与常见复高斯线性模型的 EM 期望残差展开符号可能不一致，**不得在未经原作者确认时将该符号自动“纠正”**。$\boldsymbol\zeta$ 包括动态位置网格和用户位置，M 步以梯度上升更新这些参数。

**算法 2：SEA-LD-TurboCE（原文逐行译文）**

1. 输入 $\mathbf y,\widehat{\boldsymbol\Xi},\mathbf P_{\rm UE}^{0}$，内外迭代上限 $I_{\rm in},I_{\rm out}$ 与阈值 $\epsilon$。
2. 用细化散射体位置初始化动态网格 $\boldsymbol\gamma^0=\widehat{\boldsymbol\Xi}'$。
3. 对 $t=1,\ldots,I_{\rm out}$：
4. E 步：设置 $i_{\rm in}=1$、$\mathbf x_A^{\rm pri}=\mathbf0$ 并初始化 $\mathbf V_A^{\rm pri}$。
5. 当 $i_{\rm in}\le I_{\rm in}$ 时：
6. 设置 $i_{\rm in}\leftarrow i_{\rm in}+1$。
7. 用式（33）、（34）更新 $\mathbf x_B^{\rm pri}=\mathbf x_{A\to B}^{\rm ext}$ 和 $\mathbf V_B^{\rm pri}=\mathbf V_{A\to B}^{\rm ext}$。
8. 在因子图 $\mathcal G_B$ 上使用式（41）–（46）执行消息传递。
9. 用式（36）、（37）求 $\widehat p(x_q^k\mid\mathbf y,\boldsymbol\zeta^{(t)})$ 和 $\widehat p(s_q^k\mid\mathbf y,\boldsymbol\zeta^{(t)})$。
10. 通过式（38）、（39）更新 $\mathbf x_A^{\rm pri}=\mathbf x_{B\to A}^{\rm ext}$、$\mathbf V_A^{\rm pri}=\mathbf V_{B\to A}^{\rm ext}$；结束内循环。
11. M 步：利用 E 步给出的 $\mathbf x_B^{\rm post}$、$\mathbf V_B^{\rm post}$ 计算 $Q$ 关于 $\boldsymbol\zeta$ 的梯度，并执行梯度上升更新 $\boldsymbol\zeta^{(t+1)}$。
12. 若 $\|\boldsymbol\zeta^{(t+1)}-\boldsymbol\zeta^{(t)}\|\le\epsilon$，则退出外循环。
13. 输出估计的 $\widehat{\boldsymbol\zeta}$、$\widehat{\mathbf x}=\mathbf x_B^{\rm post}$，以及全部用户、网格点的支撑后验 $\widehat p(s_q^k\mid\mathbf y,\widehat{\boldsymbol\zeta})$。

### 表 I：因子图中各节点的概率分布与函数形式

按原文第 20 页表 I 转录，$\mathcal{CN}(x;\mu,v)$ 为均值 $\mu$、方差 $v$ 的圆对称复高斯密度，$\delta$ 是点质量函数。为避免含嵌套长公式的宽表在窄屏溢出，将各行写成相同顺序的逐条定义。

| 因子 | 所对应的分布 | 函数形式 |
|---|---|---|
| $g_0^k(x_{B,0}^{k,\mathrm{pri}},x_0^k)$ | $p(x_0^k\mid x_{B,0}^{k,\mathrm{pri}})$ | $\mathcal{CN}(x_0^k;x_{B,0}^{k,\mathrm{pri}},v_{B,0}^{k,\mathrm{pri}})$ |
| $g_q^k(x_{B,q}^{k,\mathrm{pri}},x_q^k)$ | $p(x_q^k\mid x_{B,q}^{k,\mathrm{pri}})$ | $\mathcal{CN}(x_q^k;x_{B,q}^{k,\mathrm{pri}},v_{B,q}^{k,\mathrm{pri}})$ |
| $f_0^k(x_0^k,s_0^k)$ | $p(x_0^k\mid s_0^k)$ | 原文此格排作 $\mathcal{CN}(x_q^k;x_{B,q}^{k,\mathrm{pri}},v_{B,q}^{k,\mathrm{pri}})$ |
| $f_q^k(x_q^k,s_q^k)$ | $p(x_q^k\mid s_q^k)$ | $\delta(s_q^k)\delta(x_q^k)+\delta(s_q^k-1)\mathcal{CN}(x_q^k;0,(\sigma_q^k)^2)$ |
| $\eta_q^k(s_q^k,s_q)$ | $p(s_q^k\mid s_q)$ | $\delta(s_q)\delta(s_q^k)+\delta(s_q-1)[\delta(s_q^k-1)\rho_k+\delta(s_q^k)(1-\rho_k)]$ |
| $h_0^k(s_0^k)$ | $p(s_0^k)$ | $\delta(s_0^k-1)\rho_0^k+\delta(s_0^k)(1-\rho_0^k)$ |
| $h_q(s_q)$ | $p(s_q)$ | $\delta(s_q-1)\lambda+\delta(s_q)(1-\lambda)$ |

**原文表格异常：** $f_0^k$ 的“分布”列表示 $p(x_0^k\mid s_0^k)$，但相应“函数形式”列却印有与观测似然类似的 $\mathcal{CN}(\cdot;x_{B,q}^{k,\mathrm{pri}},v_{B,q}^{k,\mathrm{pri}})$，并未给出预期的含 $s_0^k$ 的 Bernoulli–Gaussian 因子。此处严格注明表中原有形式，不将推测的修正暗中写为原文。

## VI. 数值结果

**仿真设置。** MIMO-OFDM 系统载频 3.5 GHz，OFDM 子载波数 $P=192$，子载波间隔 $f_0=30$ kHz；每 12 个子载波聚合为一个资源块（RB），共 16 个 RB。基站配备 $N=64$ 根天线（$N_x=N_y=8$），位于坐标 $[-50,0,25]$ m；用户数 $K=200$，每个用户在 $x\in[50,250]$ m、$y\in[-100,100]$ m 的方形区域内均匀分布，高度 $Z=1.5$ m。用户位置先验误差服从高斯分布，记为 $\epsilon\sim\mathcal N(\mu,\sigma_{\mathrm{UE}}^2)$，如无特别说明取 $\sigma_{\mathrm{UE}}=5$ m。信道按 3GPP R16 规范 [31] 在 Quadriga 平台的 UMA 模型中生成，$L=6$；性能结果为 100 次实现的平均。评价指标为归一化均方误差 $\mathrm{NMSE}=\|\widehat{\mathbf H}-\mathbf H\|^2/\|\mathbf H\|^2$，用于衡量各算法的外推性能。

**对比方案。** ①MUSIC+LS：用 TST-MUSIC 估计散射体位置、用 LS 估计复增益；②MU-NP（所提方案，多用户＋非正交导频）：用 SEA-LD-TurboCE 联合估计与定位，网格由 TST-MUSIC 与 DBSCAN 关联结果初始化，并用图着色分组实现导频空间复用；③MU-OP（多用户＋正交导频）：与 MU-NP 相同，只是不同用户使用正交导频、无组内干扰，用于分离“导频复用”与“算法”的贡献；④SU-OP（单用户＋正交导频）：各用户独立运行 SEA-LD-TurboCE（用户间稀疏先验相互独立）且使用正交导频，网格仅由 TST-MUSIC 初始化；⑤Genie-aided LMMSE：利用信道具完美统计知识在时域与空域滤波接收信号，作为信道估计性能上界。

### A. 多用户散射体关联性能（图 5）

图 5 给出 SNR=0 dB 时基于 DBSCAN 的多用户散射体关联结果：不同颜色的簇表示关联得到的共享散射体，被 DBSCAN 判为噪声的点显示为灰色；图注同时标出真实共享散射体位置、估计共享散射体位置与漏检点。可以看到：TST-MUSIC 的粗估计点围绕真值形成簇；按式（26）（27）关联并修正后，精细估计位置比粗估计更接近真值；把各用户的散射体估计汇总后，可识别环境中更多的全局散射体，从而降低漏检概率（与图 9(b) 的漏检曲线相互印证）。

**图 5**：基于 DBSCAN 的散射体关联算法性能（SNR=0 dB）。

### B. 用户分组性能（图 6、图 7）

图 6 给出组内最小距离的累计分布函数（CDF），组内最小距离定义为同一组内两用户按式（11）计算的最小距离 $\min_{k_1,k_2\in\mathcal G_g}d_{k_1,k_2}$。图中比较了 MU-NP 在“真实散射体位置”“SNR=10 dB 估计位置”“SNR=−10 dB 估计位置”三种条件下的分组效果。结论是：以真实散射体位置分组时，算法能保证组内散射体间的最小距离，从而压低组内干扰；以估计位置分组时，约 10% 的同组用户间距小于 50 m，这部分干扰由散射体位置估计误差引起，无法靠分组算法本身消除。

为量化非正交导频的复用程度，定义导频缩减因子 $\kappa=K/G$（用户数与分组数之比）；$\kappa$ 越大表示空间复用倍数越高，$\kappa=1$ 即退化为正交导频方案。图 7 给出 MU-NP 与 SU-OP 在 SNR=−10、0、10 dB 下 NMSE 随 $\kappa$ 的变化：MU-NP 的 NMSE 随 $\kappa$ 增大而上升（复用同一导频的用户增多、组内干扰增大）；在 −10 dB 至 10 dB 区间内，MU-NP 相对 SU-OP 的导频复用倍数约提高 2.5—4 倍；随着 SNR 升高，MU-NP 相对 SU-OP 的增益减小，原因是在高 SNR 下组内干扰成为主要误差来源，用户间部分非正交的路径会明显恶化信道估计。

**图 6**：所提算法的用户分组性能（组内最小距离 CDF）。
**图 7**：NMSE 性能随导频缩减因子 $\kappa$ 的变化。

### C. 信道估计性能（图 8）

图 8 比较各方案的信道估计 NMSE 随 SNR（−10 dB 至 10 dB）的变化。①所有方案性能随 SNR 提高而改善，但 MUSIC+LS 逐渐趋于平缓，原因是该方法未能充分利用空域信道的稀疏信息；②MU-OP 相对 SU-OP 有显著增益并接近 Genie-aided LMMSE，说明 SEA-LD-TurboCE 有效利用了位置域信道的三维多用户联合稀疏性；③MU-NP（$\kappa=2$）相对 MU-OP 只有较小损失，却实现了导频资源的两倍复用，验证了图着色用户分组与空间复用导频的有效性。

**图 8**：信道估计 NMSE 随 SNR 的变化（对比 Genie-aided LMMSE、MU-OP、SU-OP、MU-NP（$\kappa=2$）、MUSIC+LS）。

### D. 定位性能（图 9）

图 9 比较散射体定位的 RMSE 与漏检概率随 SNR（−10 dB 至 10 dB）的变化，并分别考虑用户位置误差 $\sigma_{\mathrm{UE}}=0$ m 与 20 m 两种条件。结果表明：MU-NP 能利用多用户散射体的重叠特性，提高散射体位置估计精度并降低漏检概率；当用户位置存在 20 m 误差时，MU-NP 相对 MUSIC+LS 的 RMSE 损失更小，且虚警概率始终低于 MUSIC+LS。原因是 MU-NP 通过融合多个散射体的位置样本，削弱了用户位置误差的影响。

> **原文疑点：** 原文第 28 页写“In Fig. 9 and Fig. 10”，但全文仅有图 9（含 (a) RMSE、(b) 漏检两个子图），没有图 10 的图题与曲线。疑为原文笔误（应指图 9 的两个子图）；本页按图 9(a)(b) 处理，未虚构图 10。

**图 9**：散射体定位的 RMSE 与漏检性能随 SNR 的变化。(a) RMSE 性能；(b) 漏检性能。

**关于实验表格：** 原文第 VI 节为纯曲线结果（图 5—9），未给出实验数值表；因此本页除表 I（因子图节点表）外没有可逐格转录的实验表格。图 5—9 的图注、对照设置与文中明确给出的数值（如 2.5—4 倍复用、约 10% 用户间距小于 50 m 等）已在上文转写，其余曲线读数不建议据图片估读。

## VII. 结论

本文利用多用户环境的空间传播特征，提出双时间尺度的联合上行信道估计与定位方案。长时间尺度通过 TST-MUSIC 粗估散射体位置、DBSCAN 关联共享散射体、图着色与粒子群优化分配导频，以充分利用用户间信道空间近似正交的性质。短时间尺度则在经先验初始化的动态位置域网格上，使用 SEA-LD-TurboCE 的 Turbo 消息传递和 EM 更新，联合估计多个用户的信道与位置。通过对共享散射体结构的建模，所提方法旨在用更少的正交导频资源支持更多用户，并改善信道估计和定位精度。

## 附录 A 补译：模块 B 的消息更新方程（41）–（46）

模块 B 在原文图 4 所示的因子图上执行 sum-product（求和–乘积）消息传递。每个用户 $k$、位置网格 $q$ 的变量 $x_q^k$、局部支撑 $s_q^k$ 与全局支撑 $s_q$ 按所定义的概率因子连接；$\delta(\cdot)$ 为狄拉克冲激／离散质量符号。以下依照原文六个传播方向列出式（41）–（46），保留原始节点命名。

**1）路径 $x_q^k\to f_q^k\to s_q^k\to\eta_q^k\to s_q$。** 从因子节点 $\eta_q^k$ 向全局支撑变量 $s_q$ 发送的消息为

$$
\begin{aligned}
\nu_{\eta_q^k\to s_q}(s_q)
&=\sum_{s_q^k}\eta_q^k(s_q^k,s_q)\,
\nu_{s_q^k\to\eta_q^k}(s_q^k)\\
&=\pi_{s,q}^{k,\mathrm{in}}\delta(s_q-1)
+\left(1-\pi_{s,q}^{k,\mathrm{in}}\right)\delta(s_q),
\end{aligned}\tag{41}
$$

其中

$$
\pi_{s,q}^{k,\mathrm{in}}=
\left[1+\frac{1-\pi_{s_k,q}^{\mathrm{in}}}
{1+2\pi_{s_k,q}^{\mathrm{in}}-\pi_{s_k,q}^{\mathrm{in}}-\rho_k}
\right]^{-1},
$$

且局部系数与支撑的输入概率项来自两种虚拟观测似然的比值：

$$
\pi_{s_k,q}^{\mathrm{in}}=
\left[
1+
\frac{\mathcal{CN}(0;x_{B,q}^{k,\mathrm{pri}},v_{B,q}^{k,\mathrm{pri}})}
{\mathcal{CN}(0;x_{B,q}^{k,\mathrm{pri}},v_{B,q}^{k,\mathrm{pri}}+(\sigma_q^k)^2)}
\right]^{-1}.
$$

**原文排版校对提示：** 式（41）紧接其后的 $\pi_{s,q}^{k,\mathrm{in}}$ 分母在文本层的括号和 $\rho_k$ 位置不够清晰，可能存在排版或转录歧义。该中间式应以 PDF 原版为准，不能用它代替可执行代码中的归一化概率。

**2）路径 $x_0^k\to f_0^k\to s_0^k\to h_0^k$。** 从 LOS 支撑变量到先验因子的消息为

$$
\begin{aligned}
\nu_{s_0^k\to h_0^k}(s_0^k)
&=\nu_{f_0^k\to s_0^k}(s_0^k)\\
&\propto\int\nu_{x_0^k\to f_0^k}(x_0^k)
f_0^k(x_0^k,s_0^k)\,\mathrm d x_0^k\\
&=\pi_{s_0^k}^{\mathrm{in}}\delta(s_0^k-1)
+\left(1-\pi_{s_0^k}^{\mathrm{in}}\right)\delta(s_0^k).
\end{aligned}\tag{42}
$$

这里

$$
\pi_{s_0^k}^{\mathrm{in}}=
\left[
1+
\frac{\mathcal{CN}(0;x_{B,0}^{k,\mathrm{pri}},v_{B,0}^{k,\mathrm{pri}})}
{\mathcal{CN}(0;x_{B,0}^{k,\mathrm{pri}},v_{B,0}^{k,\mathrm{pri}}+(\sigma_0^k)^2)}
\right]^{-1}.
$$

**3）路径 $s_q\to h_q$。** 多个用户向共同散射体支撑提供的消息相乘，得到

$$
\begin{aligned}
\nu_{s_q\to h_q}(s_q)
&\propto\prod_{k\in\mathcal K_q}\nu_{\eta_q^k\to s_q}(s_q)\\
&=\pi_q^{\mathrm{in}}\delta(s_q-1)
+\left(1-\pi_q^{\mathrm{in}}\right)\delta(s_q),
\end{aligned}\tag{43}
$$

$$
\pi_q^{\mathrm{in}}=
\frac{\prod_{k\in\mathcal K_q}\pi_{s,q}^{k,\mathrm{in}}}
{\prod_{k\in\mathcal K_q}\pi_{s,q}^{k,\mathrm{in}}
+\prod_{k\in\mathcal K_q}(1-\pi_{s,q}^{k,\mathrm{in}})},
$$

其中 $\mathcal K_q$ 是与全局支撑节点 $s_q$ 相连的用户集合（不包含先验因子 $h_q$）。

**4）路径 $h_q\to s_q$。** 全局支撑的 Bernoulli 先验直接返回

$$
\nu_{h_q\to s_q}(s_q)\propto h_q(s_q)
=\lambda\delta(s_q-1)+(1-\lambda)\delta(s_q).\tag{44}
$$

**5）路径 $s_q\to\eta_q^k\to s_q^k\to f_q^k\to x_q^k$。** 从稀疏混合因子到信道系数的返回消息为

$$
\begin{aligned}
\nu_{f_q^k\to x_q^k}(x_q^k)
&\propto\sum_{s_q^k}
\nu_{s_q^k\to f_q^k}(s_q^k)f_q^k(x_q^k,s_q^k)\\
&=\pi_{s_k,q}^{\mathrm{out}}
\mathcal{CN}(x_q^k;0,(\sigma_q^k)^2)
+\left(1-\pi_{s_k,q}^{\mathrm{out}}\right)\delta(x_q^k).
\end{aligned}\tag{45}
$$

其中 $\pi_{s_k,q}^{\mathrm{out}}=\rho_k\pi_{s,q}^{k,\mathrm{out}}$，且

$$
\pi_{s,q}^{k,\mathrm{out}}=
\frac{\lambda\displaystyle\prod_{\ell\in\mathcal K_q\setminus\{k\}}
\pi_{s,q}^{\ell,\mathrm{in}}}
{\lambda\displaystyle\prod_{\ell\in\mathcal K_q\setminus\{k\}}
\pi_{s,q}^{\ell,\mathrm{in}}+
(1-\lambda)\displaystyle\prod_{\ell\in\mathcal K_q\setminus\{k\}}
(1-\pi_{s,q}^{\ell,\mathrm{in}})}.
$$

**6）路径 $h_0^k\to s_0^k\to f_0^k\to x_0^k$。** LOS 系数的返回消息为

$$
\begin{aligned}
\nu_{f_0^k\to x_0^k}(x_0^k)
&\propto\sum_{s_0^k}
\nu_{s_0^k\to f_0^k}(s_0^k)f_0^k(x_0^k,s_0^k)\\
&=\rho_0^k\mathcal{CN}(x_0^k;0,(\sigma_0^k)^2)
+(1-\rho_0^k)\delta(x_0^k).
\end{aligned}\tag{46}
$$

相应的近似后验 $\widehat p(x_q^k\mid\mathbf y)$ 再由式（36）中的输入与输出消息乘积归一化得到。该消息传递机制实现了两类信息交换：每个用户的局部稀疏支撑对全局公共散射体支撑提供证据，而全局支撑先验又通过式（45）反馈给单个用户的信道系数估计。

## 附录与未完成核验项

正文式（1）–（46）、算法 1–2、附录 A 的消息更新关系（41）–（46）、因子表 I 均已补入；本轮另外补齐第 VI 节四个小节的逐图说明（图 5—9 的图注、对照设置与文中明确数值）以及参考文献 [1]—[31] 的英文原书目。仍保留并标注的疑点：①表 I 中 $f_0^k$ 行的函数形式与式（18）不符，疑为原文排版错误（见第 VI 节前表 I 注）；②式（41）后 $\pi_{s,q}^{k,\mathrm{in}}$ 分母的括号与 $\rho_k$ 位置在 PDF 文本层不清晰，已按渲染图转录并提示以原版为准；③原文正文提及“图 9 与图 10”，但只有图 9，疑为笔误。尚未完成：算法伪代码与概率消息的逐式独立核验、全部曲线读数的数字化、以及逐字符的全文终校。**本页面仍为待验收译稿，不标记全文完成。**

## 参考文献

> 以下按原文编号 [1]—[31] 转录英文原书目，条目文字不翻译；抽取文本中的 “Y .”“V .” 等空格为 PDF 提取伪影，已按常规写法整理。原文 [21] 条目内另排有 “vol. 19, no. 5, pp. 3185–3198, 2020.” 一行，疑为原排版残留，照原样转录。

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


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
