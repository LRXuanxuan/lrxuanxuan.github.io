---
layout: page
title: "散射环境感知的空间复用导频多用户联合信道估计与定位｜中文译稿（校对中）"
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

第 $p$ 个子载波上，位置域字典还需要乘上取决于各网格点传播时延的频率相位向量 $\mathbf b_{k,p}(\boldsymbol\gamma,\mathbf p_{\mathrm{UE},k})$（原文式（7））。因此 NLOS 信道为

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

### C 节补录：图着色的距离、速度及适应度（式 28–32）

建立 $K\times K$ 无向图邻接矩阵 $\mathbf E$，其主对角线为零，非对角元素满足

$
\mathbf E=\begin{bmatrix}
0&E_{12}&\cdots&E_{1K}\\
E_{21}&0&\cdots&E_{2K}\\
\vdots&\vdots&\ddots&\vdots\\
E_{K1}&E_{K2}&\cdots&0
\end{bmatrix},\tag{28}
$

$
E_{ij}=\begin{cases}
1,&d_{i,j}<d_{\mathrm{adj}},\\
0,&d_{i,j}\ge d_{\mathrm{adj}},
\end{cases}\quad i\ne j.\tag{29}
$

其中 $d_{i,j}$ 是两个用户主要散射体集合之间的最小距离，$d_{\mathrm{adj}}$ 是判断是否构成邻接关系的距离阈值。较近的用户需要使用不同导频颜色，以降低复用时的干扰。

在离散粒子群优化（PSO）中，第 $a$ 个粒子第 $k$ 个元素的整数位置与速度更新为

$
V_{a,k}^{(t+1)}=\operatorname{int}\!\left(V_{a,k}^{(t)}\right)+Z_1+Z_2,\tag{30}
$

$
X_{a,k}^{(t+1)}=X_{a,k}^{(t)}+V_{a,k}^{(t+1)}.\tag{31}
$

这里 $Z_1,Z_2$ 是分别在 $[0,c_1(pbest_{a,k}-X_{a,k}^{(t)})]$ 和
$[0,c_2(gbest_{a,k}-X_{a,k}^{(t)})]$ 之间均匀抽取的整数随机量，$\operatorname{int}$ 为舍入运算。对所有顶点，定义当 $X_{a,i}=X_{a,j}$ 时 $S_{ij}=1$，否则为零。适应度函数为

$
f_{\mathrm{fitness}}=
\sum_{i=1}^{K}\sum_{j=1}^{K}E_{ij}S_{ij}
+\max(g-G,0),\tag{32}
$

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
\mathbf x_B^{\mathrm{pri}}=\mathbf x+\mathbf z,\tag{35}
$$

再利用联合稀疏支撑的因子图进行消息传递。通过位置域共同支撑与个别用户支撑之间的概率联系，可以把不同用户的散射体信息结合起来，提升单用户信道系数和位置估计的可靠性。然后模块 B 把新的外信息返回模块 A，反复迭代以改善后验近似。

**图 3.** SEA-LD-TurboCE E 步中两个模块及其消息交换过程。  
**图 4.** 多用户共享散射体先验及 LOS/NLOS 系数的因子图。  
**算法 2.** SEA-LD-TurboCE 算法，包含初始化、E 步的模块交替和 M 步的几何更新。

与传统 Turbo 稀疏估计不同，所提方法不仅使用位置域而非单纯角度域支撑，而且把共享散射体导致的多用户联合稀疏先验嵌入因子图，允许用户发送空间复用的非正交导频，从而在信道估计过程中同时利用多用户关联结构和导频复用条件。

### 补录：Turbo 模块 A/B 与 EM 步的矩阵更新（式 33–40）

**模块 A：LMMSE 与外信息。** 输入来自模块 B 的先验 $\mathbf x_A^{\rm pri},\mathbf V_A^{\rm pri}$ 及接收向量 $\mathbf y$，按原文式（33）求后验均值和协方差：

$
\begin{aligned}
\mathbf x_A^{\rm post}
&=\mathbf V_A^{\rm post}\left[
(\mathbf V_A^{\rm pri})^{-1}\mathbf x_A^{\rm pri}
+\frac{\boldsymbol\Phi^H\mathbf y}{\sigma_z^2}\right],\\
\mathbf V_A^{\rm post}
&=\left[\frac{\boldsymbol\Phi^H\boldsymbol\Phi}{\sigma_z^2}
+(\mathbf V_A^{\rm pri})^{-1}\right]^{-1}.
\end{aligned}\tag{33}
$

其中 $\boldsymbol\Phi$ 是由字典和导频构成的测量矩阵，$\sigma_z^2$ 为观测噪声方差。后验信息扣除先验信息后，得到传递给模块 B 的外信息：

$
\begin{aligned}
\mathbf x_{A\to B}^{\rm ext}
&=\mathbf V_{A\to B}^{\rm ext}\left[
(\mathbf V_A^{\rm post})^{-1}\mathbf x_A^{\rm post}
-(\mathbf V_A^{\rm pri})^{-1}\mathbf x_A^{\rm pri}\right],\\
\mathbf V_{A\to B}^{\rm ext}
&=\left[(\mathbf V_A^{\rm post})^{-1}
-(\mathbf V_A^{\rm pri})^{-1}\right]^{-1}.
\end{aligned}\tag{34}
$

**模块 B：联合支撑消息传递。** 把来自模块 A 的外信息等效为虚拟复 AWGN 测量：

$
\mathbf x_B^{\rm pri}=\mathbf x+\mathbf z,\tag{35}
$

其虚拟噪声协方差取 $\mathbf V_B^{\rm pri}=\mathbf V_{A\to B}^{\rm ext}$。因子图通过 $\mathbf x_{kq}\to f_q^k\to s_{kq}\to\eta_q^k\to s_q$ 等方向交换消息，得到各位置域系数及其支撑状态的近似边缘后验：

$
\widehat p(x_q^k\mid\mathbf y)\propto
v_{f_q^k\to x_q^k}\,v_{x_q^k\to f_q^k},\tag{36}
$

$
\widehat p(s_q^k=1\mid\mathbf y)=
\frac{\pi_{s_k,q}^{\rm in}\pi_{s_k,q}^{\rm out}}
{\pi_{s_k,q}^{\rm in}\pi_{s_k,q}^{\rm out}
+(1-\pi_{s_k,q}^{\rm in})(1-\pi_{s_k,q}^{\rm out})}.\tag{37}
$

其后验均值和方差逐元素为

$
\begin{aligned}
x_{B,q}^{k,\rm post}
&=\int x_q^k\,\widehat p(x_q^k\mid\mathbf y)\,\mathrm d x_q^k,\\
v_{B,q}^{k,\rm post}
&=\int |x_q^k-x_{B,q}^{k,\rm post}|^2
\,\widehat p(x_q^k\mid\mathbf y)\,\mathrm d x_q^k.
\end{aligned}\tag{38}
$

由此形成 $\mathbf x_B^{\rm post}$ 和块对角协方差 $\mathbf V_B^{\rm post}$，再减去输入先验，得到发回模块 A 的外信息：

$
\begin{aligned}
\mathbf V_{B\to A}^{\rm ext}
&=\left[(\mathbf V_B^{\rm post})^{-1}
-(\mathbf V_B^{\rm pri})^{-1}\right]^{-1},\\
\mathbf x_{B\to A}^{\rm ext}
&=\mathbf V_{B\to A}^{\rm ext}\left[
(\mathbf V_B^{\rm post})^{-1}\mathbf x_B^{\rm post}
-(\mathbf V_B^{\rm pri})^{-1}\mathbf x_B^{\rm pri}\right].
\end{aligned}\tag{39}
$

**M 步：位置参数更新。** 用 E 步得到的后验构造 EM 代理函数，原文式（40）记为

$
\begin{aligned}
Q(\boldsymbol\zeta;\boldsymbol\zeta^{(t)})
&=\int p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^{(t)})
\log\frac{p(\mathbf y,\mathbf x\mid\boldsymbol\zeta)}
{p(\mathbf x\mid\mathbf y,\boldsymbol\zeta^{(t)})}\,\mathrm d\mathbf x\\
&=-\|\mathbf y-\boldsymbol\Phi\mathbf x^{\rm post}\|_2^2
+\operatorname{tr}(\boldsymbol\Phi\mathbf V^{\rm post}\boldsymbol\Phi^H)+C.
\end{aligned}\tag{40}
$

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

## VI. 数值结果

本节通过仿真考察散射体关联、用户分组、信道估计及定位性能，针对各阶段分别设置基线和消融对照。

### A. 多用户散射体关联性能

作者考察 TST-MUSIC 的粗估误差如何通过跨用户共享散射体关联得到改善。由于多个用户可能观测相同的物理散射体，DBSCAN 能聚合位置接近且符合密度条件的估计点，降低共享散射体位置的误差，并将独立散射体保留在全局环境模型中。

### B. 用户分组性能

评估图着色与 PSO 分组对空间导频复用和用户间干扰的影响。该阶段不只是减少正交导频数量，还需要确保共享导频的用户在位置域具有足够低的重叠，避免短时间尺度难以分离其信道。

### C. 信道估计性能

比较所提 SEA-LD-TurboCE 与传统方法，在不同导频配置、SNR 等条件下的信道估计精度。仿真结果用于说明，结合长时间尺度散射体先验与多用户联合支撑模型，可以在非正交导频条件下保持较好的估计质量。部分对照使用正交导频或不利用多用户共享散射体信息，以区分算法本身与导频分配策略的贡献。

### D. 定位性能

除信道 NMSE 外，还评价用户和散射体的位置估计误差。通过短时间尺度的 EM 位置更新，可以在动态位置域网格上同时修正几何参数与多用户信道系数，从而提高联合定位精度。

上述四组实验在原文图表中包含多个具体参数、性能曲线和比较数值。该部分**仍需对照 PDF 把每一幅图与表格完整转写，不能根据摘要的总体结论推断具体数值**。

## VII. 结论

本文利用多用户环境的空间传播特征，提出双时间尺度的联合上行信道估计与定位方案。长时间尺度通过 TST-MUSIC 粗估散射体位置、DBSCAN 关联共享散射体、图着色与粒子群优化分配导频，以充分利用用户间信道空间近似正交的性质。短时间尺度则在经先验初始化的动态位置域网格上，使用 SEA-LD-TurboCE 的 Turbo 消息传递和 EM 更新，联合估计多个用户的信道与位置。通过对共享散射体结构的建模，所提方法旨在用更少的正交导频资源支持更多用户，并改善信道估计和定位精度。

## 附录与未完成核验项

原文附录 A 包含 SEA-LD-TurboCE 的模块 B 消息更新方程；原文正文第 III、V 节还包括较长的三层联合支撑概率式和 EM/消息传递推导，图表中包含数值曲线；参考文献与算法 1、2 的全部伪代码也需逐项核对。这些部分尚未形成可逐式验收的译文。**本页面目前为逐节译稿，不能标为完整全文。**

{% endraw %}
