---
layout: page
title: "近场太赫兹多用户系统 FTTD 混合波束赋形优化｜中文主体译稿（待补齐）"
permalink: /papers/translations/2026-10-24-fttd-near-field-thz-hybrid-beamforming/
math: true
toc: true
---

[← 返回论文库](/papers/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3733666)

# 面向采用固定真时延器的近场太赫兹多用户系统的混合波束赋形优化

**原题：** Hybrid Beamforming Optimization for Near-Field Terahertz Multi-User System With FTTDs  
**作者：** Wenqiang Chu、Qiuyan Liu、Yanxia Cao、Yafeng Wang  
**期刊：** *IEEE Transactions on Wireless Communications*, Vol. 25, 2026，pp. 23882–23898。DOI: 10.1109/TWC.2026.3733666。  
**译稿范围：** 摘要、引言、系统与信道模型、FC/SC 架构、PWMMSE 与算法 1–3 的主要更新公式已补齐；启发式波束设计与实验结果已译。**后续部分数值表格、长公式的逐式校核、参考文献仍未全部完成**，不是逐字完整的 17 页全文译本。

## 摘要

本文研究在近场区域服务多个用户的宽带太赫兹（THz）通信系统中的波束赋形问题。为降低空间宽带效应，提出一种采用固定真时延器（fixed true time delay，FTTD）和移相器（phase shifter，PS）的混合波束赋形架构，并同时考虑全连接（fully-connected，FC）和子连接（sub-connected，SC）架构。

为最大化频谱效率，提出基于惩罚的加权最小均方误差（penalty-based weighted minimum mean square error，PWMMSE）方法：将频谱效率最大化问题结合 WMMSE 等价变换与惩罚方法重新表述，再使用块坐标下降（block coordinate descent，BCD）求解。为降低复杂度并避免 PWMMSE 对完整信道状态信息（CSI）的要求，进一步提出低复杂度启发式波束赋形方案：首先根据视距（LoS）信道设计模拟波束赋形器，然后根据低维等效信道优化数字波束赋形器。

数值结果表明：（1）所提方法可有效缓解空间宽带效应；（2）所提架构比基于可调真时延（TTD）的架构具有更高能量效率；（3）当 FTTD 数量受限时，SC 架构具有更高能效，并且对于天线阵列规模扩大与带宽增加均表现出更好的鲁棒性。

**索引词：** 波束赋形、近场、空间宽带效应、固定真时延、太赫兹通信。

## I. 引言

第六代（6G）无线通信系统预期在数据速率、端到端时延以及可靠性方面，相比现有系统实现显著提升。以第五代移动网络技术为基础，6G 计划进一步增强智能连接、泛在接入与超高速通信。为满足这些要求，无线通信逐渐向太赫兹（THz）等更高频段发展。THz 频段拥有丰富的频谱资源，能够支持 Tbps 量级的数据传输。

同时，THz 频率下极短的波长使天线占用的物理面积减小，从而可以在有限空间内集成大量天线。然而，THz 传播存在严重衰减，会显著限制通信距离，因此必须依靠大规模天线阵列维持可靠链路。5G 已通过大规模 MIMO 缓解这类问题，预计 6G 会继续继承并发展超大规模 MIMO（XL-MIMO）。

大带宽和大阵列孔径相结合，使空间宽带效应显著增强。传统仅基于 PS 的模拟波束赋形不能有效缓解这一问题，因而会导致严重频谱效率损失。本文旨在解决宽带多用户 THz 系统中的这一基础问题。

### A. 既有研究

对于宽带系统中的 PS 波束赋形，已有大量研究。例如文献 [16] 基于 CSI，将各频率分量投影到中心频率，并在毫米波系统中构建公共模拟预编码器；文献 [17] 引入虚拟子阵列混合波束赋形架构，以缓解宽带 THz 大规模 MIMO 中的空间宽带效应。但由于 PS 的相移不依赖频率，此类方法与完全数字波束赋形相比仍有明显性能损失。

为克服这一局限，可使用真时延器（TTD）实现频率相关的波束赋形。已有工作利用近场空间宽带效应设计多频率、多位置波束训练；也可以直接用 TTD 取代整个 PS 网络，但在 THz 频率下，由于硬件成本和功耗过高，这不切实际。为降低成本，研究者提出多种 TTD 辅助混合架构。例如时延—相位预编码（DPP）在宽带 THz 大规模 MIMO 系统中获得接近完全数字架构的性能；还有研究联合优化 PS 与 TTD，并考虑实际时延约束。

除传统 TTD 外，固定真时延器 FTTD 也可用于缓解空间宽带效应。动态子阵列 FTTD 混合架构利用低成本固定延时器降低功耗和硬件复杂度，并通过低复杂度行分解算法，在不完美 CSI 下仍保持较稳健的频谱效率和能量效率。

传统可调 TTD 通常依赖多级级联延时调节模块，功耗较高。相比之下，FTTD 采用更简单的固定延时线配置，免去多级调节开销，从而降低硬件复杂度与总功耗。

### B. 研究动机与贡献

现有混合波束赋形研究大多聚焦于单用户场景，而宽带多用户混合波束赋形得到的关注较少。已有文献提出基于 TTD 的 SC 混合架构，但可调 TTD 器件通常功耗较高，限制了实际部署。鉴于 FTTD 在单用户系统中已证明能够以较低成本缓解空间宽带效应，本文将 FTTD 用于宽带多用户 THz 系统，以实现低功耗、硬件高效的波束赋形。

与传统 TTD 架构相比，所提方法将 FTTD 与二值交换网络组合，以较低硬件复杂度和功耗实现较好的性能—成本折中。本文贡献如下。

第一，设计兼顾 FC 与 SC 两种连接形式的 FTTD+PS 混合波束赋形架构。相比仅有 FTTD 的方法，额外引入 PS 阵列形成两级补偿：FTTD 首先进行粗时延对齐，以缓解空间宽带效应；PS 再补偿不完全时延匹配带来的残余相位误差，提高频谱效率。

第二，为两种架构设计 PWMMSE 方法。通过 WMMSE 等价变换与惩罚法，将频谱效率最大化问题改写为便于处理的形式，利用 BCD 迭代优化各变量，并推导各子问题的闭式更新。

第三，提出避免完整 CSI 和高复杂度联合优化的启发式波束赋形。模拟波束赋形器首先以最大化各用户 LoS 天线增益为目标构造；数字波束赋形器再根据低维等效信道优化。

第四，仿真表明 FTTD 有效缓解空间宽带效应；启发式方法在大多数场景中接近 PWMMSE 性能；FTTD 架构在能量效率上优于 TTD 架构；与 FC 相比，SC 在扩大阵列规模或增加带宽时具有更好的鲁棒性。

### C. 结构与记号

第 II 节给出信号模型和频谱效率最大化问题，第 III 节讨论 PWMMSE，第 IV 节提出启发式方法，第 V 节展示数值结果，第 VI 节给出结论。

文中使用粗体小写表示向量、粗体大写表示矩阵；$A^*$、$A^T$ 和 $A^H$ 分别表示共轭、转置和共轭转置；$\operatorname{diag}(a)$ 表示对角矩阵，$\operatorname{blkdiag}(A,B)$ 表示分块对角矩阵，$\operatorname{Tr}\{A\}$ 为矩阵迹，$\operatorname{Re}\{\cdot\}$ 为实部，$\mathcal{CN}(\mu,\sigma^2)$ 为圆对称复高斯分布。

## II. 系统模型

考虑一个宽带 THz 多用户下行系统。基站配备含 $N_t$ 根天线的均匀线阵（ULA），服务 $K$ 个单天线用户。系统带宽为 $B$，子载波数为 $M$，光速为 $c$，中心频率为 $f_c$，中心波长 $\lambda_c=c/f_c$。第 $m$ 个子载波频率为

$$
f_m=f_c+\frac{B(2m-1-M)}{2M},\qquad m=1,\ldots,M.
$$

基站天线间距 $d=\lambda_c/2$。

### A. 信道模型

采用 Saleh–Valenzuela（SV）THz 信道模型，包含一条占主导的 LoS 路径及多条非视距（NLoS）路径。NLoS 路径功率远低于 LoS。令 $\mathbf h_{m,k}\in\mathbb C^{1\times N_t}$ 表示第 $m$ 个子载波上从基站到用户 $k$ 的信道，$L_k$ 为路径总数。第 $l$ 条路径的传播距离和离开角（AoD）分别为 $r_{k,l}$ 和 $\vartheta_{k,l}$。信道写为

$$
\mathbf h_{m,k}
=\sum_{l=1}^{L_k}
\alpha_{m,k,l}
\mathbf a(f_m,\vartheta_{k,l},r_{k,l})^T
e^{-j2\pi f_m r_{k,l}/c}. \tag{1}
$$

$\mathbf a(f_m,\vartheta,r)$ 是基站的近场导向向量：

$$
\mathbf a(f_m,\vartheta,r)
=\big[e^{j2\pi f_m t(1,\vartheta,r)},\ldots,
e^{j2\pi f_m t(N_t,\vartheta,r)}\big]^T. \tag{2}
$$

其中第 $n$ 根天线的相对时延为

$$
t(n,\vartheta,r)=
\frac{(n-1)d\sin\vartheta-
\frac{(n-1)^2d^2(1-\sin^2\vartheta)}{2r}}{c}. \tag{3}
$$

$\alpha_{m,k,l}$ 表示路径损耗，包含传播距离损耗与 THz 分子吸收效应。LoS 路径按照载频、距离、路径损耗指数和吸收系数 $\kappa(f_m)$ 建模；NLoS 复路径增益可写为

$$
\alpha_{m,k,l}^{\rm NLoS}
=|\alpha_{m,k,l}^{\rm NLoS}|e^{j\phi_{m,k,l}},
\qquad l=2,\ldots,L_k. \tag{5}
$$

相位 $\phi_{m,k,l}$ 服从 $[0,2\pi)$ 上的均匀分布，仿真中 NLoS 路径增益设置为比 LoS 低 10 dB。

### B. 天线架构

发射机包含 $N_{\rm RF}$ 条 RF 链。每条 RF 链连接 $P$ 个 FTTD，FTTD 再经开关网络与 PS 连接到发射天线。固定时延向量为 $\boldsymbol\tau=[\tau_1,\ldots,\tau_P]^T$。与可连续调整时延值的 TTD 不同，FTTD 的时延从预定义集合中选择，因此需要开关网络灵活分配不同的固定时延，以保持波束赋形灵活性。

在第 $m$ 个子载波上，用户 $k$ 的接收信号为

$$
y_{m,k}
=\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m
\mathbf D_m\mathbf s_m+n_{m,k}. \tag{6}
$$

其中 $\boldsymbol\Theta$ 是由 PS 实现的模拟波束赋形矩阵，$\mathbf S$ 是二值开关网络，$\mathbf F_m$ 为由 RF 链的 FTTD 频率响应组成的块对角矩阵：

$$
\mathbf F_m=\operatorname{blkdiag}\{\mathbf f_m,\ldots,\mathbf f_m\},
\quad \mathbf f_m=
[e^{-j2\pi f_m\tau_1},\ldots,e^{-j2\pi f_m\tau_P}]^T. \tag{7}
$$

$\mathbf D_m$ 是数字预编码矩阵，$\mathbf s_m$ 为发送数据且满足 $\mathbb E[\mathbf s_m\mathbf s_m^H]=I$；接收噪声服从 $\mathcal{CN}(0,\sigma_{m,k}^2)$。

**1）全连接架构（FC）。** 天线阵列划分为 $P$ 个子阵列。每条 RF 链经开关网络与全部子阵列相连。二值开关矩阵满足

$$
\mathbf S=\operatorname{blkdiag}(\mathbf S_1,\ldots,\mathbf S_{N_{\rm RF}}), \tag{8}
$$

其中 $\mathbf S_n\in\{0,1\}^{P\times P}$，每行恰有一个非零元素。PS 网络表示为

$$
\boldsymbol\Theta=[\boldsymbol\Theta_1,\ldots,
\boldsymbol\Theta_{N_{\rm RF}}], \tag{9}
$$

$$
\boldsymbol\Theta_n=\operatorname{blkdiag}
(\boldsymbol\theta_{n,1},\ldots,\boldsymbol\theta_{n,P}), \tag{10}
$$

并对 PS 元素施加单位模约束。

**2）子连接架构（SC）。** 天线阵列划分为 $N_{\rm RF}P$ 个子阵列，每条 RF 链通过开关网络连接自己的 $P$ 个子阵列。SC 的开关矩阵结构与 FC 相同，但物理连接意义不同，PS 网络改为整体块对角：

$$
\boldsymbol\Theta=\operatorname{blkdiag}
(\boldsymbol\Theta_1,\ldots,\boldsymbol\Theta_{N_{\rm RF}}), \tag{11}
$$

$$
\boldsymbol\Theta_n=\operatorname{blkdiag}
(\boldsymbol\theta_{n,1},\ldots,\boldsymbol\theta_{n,P}), \tag{12}
$$

其中每个子阵列上的 PS 元素仍满足单位模约束。

**图 1：** 基于 FTTD 的混合波束赋形架构。（a）全连接 FC 架构；（b）子连接 SC 架构。

### C. 问题表述

目标是联合优化模拟及数字波束赋形，最大化系统频谱效率。根据式（6），第 $m$ 个子载波上用户 $k$ 的信干噪比（SINR）为

$$
\beta_{m,k}
=\frac{|\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf d_{m,k}|^2}{
\sum_{i\ne k}|\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf d_{m,i}|^2
+\sigma_{m,k}^2}. \tag{13}
$$

其中 $\mathbf d_{m,k}$ 是 $\mathbf D_m$ 的第 $k$ 列。系统频谱效率定义为

$$
R=\frac1M\sum_{m=1}^{M}\sum_{k=1}^{K}
\log(1+\beta_{m,k}). \tag{14}
$$

因此，求解在 PS 单位模、开关每行唯一连接、各子载波功率约束下的频谱效率最大化：

$$
\max_{\boldsymbol\Theta,\mathbf S,\{\mathbf D_m\}}
\sum_{m=1}^{M}\sum_{k=1}^{K}\log(1+\beta_{m,k}), \tag{15a}
$$

$$
|\boldsymbol\Theta(i,j)|=1,\ (i,j)\in\mathcal Q;\quad
\|\mathbf S_n(i,:)\|_0=1;\quad
\|\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\|_F^2\le P_t. \tag{15b–d}
$$

这里 $\mathcal Q$ 为 $\boldsymbol\Theta$ 非零位置索引集合，$P_t$ 为子载波上的发射功率限制。FC 与 SC 的优化形式相同，区别在结构约束。由于多用户与多子载波之间的变量紧密耦合，加上 $\mathbf S$ 的 0-1 选择约束，问题属于混合整数非线性规划，难以直接用常规梯度优化求解。

## III. 基于惩罚的加权最小均方误差方法

受完全数字波束赋形近似框架启发，使用辅助完全数字波束赋形器和惩罚项处理混合结构约束。但不同于连续可调时延的情况，这里需要进一步应对 FTTD 和开关网络严格离散的硬件约束。

### A. 问题重构

为降低变量耦合，给每个子载波引入辅助完全数字波束赋形矩阵

$$
\mathbf W_m=\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m. \tag{16b}
$$

根据 WMMSE 理论，可以将求和对数速率形式改写为

$$
\sum_{m=1}^{M}\sum_{k=1}^{K}
\log\left(1+\frac{|\mathbf h_{m,k}\mathbf w_{m,k}|^2}{
\sum_{i\ne k}|\mathbf h_{m,k}\mathbf w_{m,i}|^2+\sigma_{m,k}^2}\right)
=\max_{\{\mu_{m,k},\omega_{m,k}\}}
\sum_{m=1}^{M}\sum_{k=1}^{K}
(\log\omega_{m,k}-\omega_{m,k}e_{m,k}+1). \tag{17}
$$

对应用户 MSE 为

$$
e_{m,k}
=|\mu_{m,k}|^2\|\mathbf h_{m,k}\mathbf W_m\|^2
-2\operatorname{Re}\{\mu_{m,k}^*\mathbf h_{m,k}\mathbf w_{m,k}\}
+|\mu_{m,k}|^2\sigma_{m,k}^2+1. \tag{18}
$$

这样，原始求和速率最大化转换为基于用户接收系数 $\mu_{m,k}$、正权重 $\omega_{m,k}$ 以及模拟/数字波束赋形变量的 WMMSE 优化。然而，式（16b）的严格等式仍妨碍求解。因此把它移入目标函数，构造惩罚项：

$$
\mathcal L=
\sum_{m=1}^{M}\sum_{k=1}^{K}
(\log\omega_{m,k}-\omega_{m,k}e_{m,k})
-\frac{\lambda}{2}
\sum_{m=1}^{M}
\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\|_F^2. \tag{20}
$$

其中 $\lambda>0$ 为惩罚系数，平衡系统性能与硬件结构一致性。

### B. FC 架构的求解

优化问题高度非凸且硬件约束耦合，难以获得整体闭式解。作者采用 BCD，每轮固定其余变量，仅更新一个变量块，以把高维联合优化拆成更容易处理的子问题。

对于接收器系数和 MSE 权重，在其他变量固定时可分别得到

$$
\mu_{m,k}
=\frac{\mathbf h_{m,k}\mathbf w_{m,k}}{
\|\mathbf h_{m,k}\mathbf W_m\|^2+\sigma_{m,k}^2}, \tag{21}
$$

$$
\omega_{m,k}
=1+\frac{|\mathbf h_{m,k}\mathbf w_{m,k}|^2}{
\sum_{i\ne k}|\mathbf h_{m,k}\mathbf w_{m,i}|^2+\sigma_{m,k}^2}. \tag{22}
$$

对于辅助完全数字变量 $\mathbf W_m$，最优更新来自对 $\mathcal L$ 的 Wirtinger 导数求零：

$$
\begin{aligned}
\mathbf W_m={}&
\left(\sum_{k=1}^K \omega_{m,k}|\mu_{m,k}|^2
\mathbf h_{m,k}^H\mathbf h_{m,k}
+\frac{\lambda}{2}I_{N_t}\right)^{-1}\\
&\times\left(\sum_{k=1}^K
\omega_{m,k}\mu_{m,k}\mathbf h_{m,k}^H\mathbf e_k^T
+\frac{\lambda}{2}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m
\right).
\end{aligned}\tag{24}
$$

为了进一步处理模拟 PS 与离散开关网络的组合优化，引入辅助变量 $\mathbf A=\boldsymbol\Theta\mathbf S$，通过惩罚项将这一等式纳入目标，使原问题变为交替更新 $\mathbf A,\boldsymbol\Theta,\mathbf S$。$\mathbf A$ 的子问题是无约束凸优化，可以得到闭式更新；$\boldsymbol\Theta$ 与 $\mathbf S$ 的子问题利用结构化分解和离散选择规则求解。

**算法 1–3：** 文中进一步给出 FC/SC 内层和外层的具体迭代，以及数字预编码矩阵的更新。当前译稿尚未逐行誊录全部闭式子式与伪代码，不能用此页取代原论文进行严格复现。

### C. SC 架构的求解

SC 架构由于不同 RF 链只连接自身负责的天线子集，模拟网络具有更强的块对角结构。PWMMSE 仍通过类似的辅助完全数字变量、惩罚项和 BCD 方法进行优化，但可以利用连接结构显著降低求解维度，减少迭代计算量。该结构在有限 FTTD 数量的情况下，对能量效率和阵列扩展具有重要优势。

### D. PWMMSE 的完整分块更新及三种算法（补齐原文式（25）–（44））

**模拟 PS 与开关网络的子问题。** 固定其他变量时，模拟部分只在惩罚项中出现：

$
\min_{\boldsymbol\Theta,\mathbf S}\sum_{m=1}^{M}
\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\|_F^2,
\quad\mathrm{s.t.}\ (15b),(15c). \tag{25}
$

该子问题暂不施加功率约束（15d），因为 $\boldsymbol\Theta$ 和 $\mathbf S$ 同时受到严格结构约束并且不依赖频率，不一定能够同时满足所有子载波的功率限制。作者把功率约束只放到 $\mathbf D_m$ 的更新中。

在 FC 架构中，不同 RF 链通过 $\boldsymbol\Theta$ 和 $\mathbf S$ 相互耦合。为分离组合约束，引入辅助矩阵 $\mathbf A=\boldsymbol\Theta\mathbf S$，将等式约束以惩罚项形式处理：

$
\begin{aligned}
\min_{\boldsymbol\Theta,\mathbf A,\mathbf S}\quad&
\sum_{m=1}^M\|\mathbf W_m-\mathbf A\mathbf F_m\mathbf D_m\|_F^2+
\frac{\rho}{2}\|\mathbf A-\boldsymbol\Theta\mathbf S\|_F^2\\
\mathrm{s.t.}\quad&(15b),(15c).
\end{aligned}\tag{26}
$

$\rho>0$ 是强制 $\mathbf A=\boldsymbol\Theta\mathbf S$ 的惩罚系数。将 $\rho$ 逐步增大，可使求解结果逐渐符合等式约束。

固定 $\boldsymbol\Theta$ 和 $\mathbf S$，优化 $\mathbf A$ 的无约束凸子问题为

$
\min_{\mathbf A}\sum_{m=1}^M
\|\mathbf W_m-\mathbf A\mathbf F_m\mathbf D_m\|_F^2+
\frac{\rho}{2}\|\mathbf A-\boldsymbol\Theta\mathbf S\|_F^2. \tag{27}
$

该问题的闭式解为

$
\begin{aligned}
\mathbf A={}&
\left[\sum_{m=1}^M\mathbf W_m(\mathbf F_m\mathbf D_m)^H+
\frac{\rho}{2}\boldsymbol\Theta\mathbf S\right]\\
&\times\left[
\sum_{m=1}^M\mathbf F_m\mathbf D_m(\mathbf F_m\mathbf D_m)^H+
\frac{\rho}{2}\mathbf I_{PN_{\rm RF}}
\right]^{-1}.
\end{aligned}\tag{28}
$

固定 $\mathbf A$，则优化 $\boldsymbol\Theta,\mathbf S$：

$
\min_{\boldsymbol\Theta,\mathbf S}
\|\mathbf A-\boldsymbol\Theta\mathbf S\|_F^2,
\quad\mathrm{s.t.}\ (15b),(15c). \tag{29}
$

根据 FC 结构，上述目标可写为

$
\begin{aligned}
&\sum_{n=1}^{N_{\rm RF}}
\|\mathbf A_n-\boldsymbol\Theta_n\mathbf S_n\|_F^2\\
&=\sum_{n=1}^{N_{\rm RF}}\operatorname{Tr}
\{\mathbf A_n\mathbf A_n^H+
\boldsymbol\Theta_n\mathbf S_n(\boldsymbol\Theta_n\mathbf S_n)^H\}\\
&\quad-2\sum_{n=1}^{N_{\rm RF}}
\operatorname{Re}\{\operatorname{Tr}(\boldsymbol\Theta_n\mathbf S_n\mathbf A_n^H)\}.
\end{aligned}\tag{30}
$

由于 $\operatorname{Tr}(\boldsymbol\Theta_n\mathbf S_n(\boldsymbol\Theta_n\mathbf S_n)^H)=N_t$ 与待优化变量无关，等价问题为

$
\max_{\boldsymbol\Theta,\mathbf S}
\sum_{n=1}^{N_{\rm RF}}
\operatorname{Re}\{\operatorname{Tr}(
\boldsymbol\Theta_n\mathbf S_n\mathbf A_n^H)\},
\quad\mathrm{s.t.}\ (15b),(15c). \tag{31}
$

令 $\mathbf A_n=[\mathbf A_{n,1}^T,\ldots,\mathbf A_{n,P}^T]^T$，利用每个子阵列对应一行开关选择，可将目标展开为

$
\sum_{n=1}^{N_{\rm RF}}\sum_{p=1}^{P}
\operatorname{Re}\{\mathbf S_n(p,:)\mathbf A_{n,p}^H
\boldsymbol\theta_{n,p}\}. \tag{32}
$

各子阵列的选择相互独立，可以逐一选取使投影幅值最大的固定时延：

$
\mathbf S_n(p,q)=
\begin{cases}
1,&q=\displaystyle\arg\max_i\|\mathbf A_{n,p}(:,i)\|_1,\\
0,&\text{其他}.
\end{cases}\tag{33}
$

对应的 PS 闭式相位对准为

$
\boldsymbol\theta_{n,p}
=\exp\!\left(j\angle[
\mathbf A_{n,p}\mathbf S_n(p,:)^T]\right). \tag{34}
$

因此 FC 架构能通过有限候选集合上的准确离散搜索和闭式相位补偿，同时更新开关与 PS，而无需放松二值变量、再进行取整。相对于 FTTD 数量 $P$，这种子问题优化具有线性复杂度。对固定 $\rho$，更新 $\mathbf A,\mathbf S,\boldsymbol\Theta$ 均不会使子问题目标增大；逐步提高 $\rho$ 进一步压低约束不满足程度。

**算法 1：求解式（26）。** 输入 $\mathbf A,\boldsymbol\Theta,\mathbf S,\rho>0,c>1$。执行外循环：先内循环依次根据式（28）、（33）、（34）更新 $\mathbf A,\mathbf S,\boldsymbol\Theta$，直到式（26）目标的相对下降低于阈值；然后令 $\rho\leftarrow c\rho$；直到惩罚残差低于阈值。输出 $\mathbf A,\boldsymbol\Theta,\mathbf S$。

**数字预编码子问题。** 在功率约束下最小化辅助全数字矩阵与混合矩阵的距离：

$
\min_{\mathbf D_m}
\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\|_F^2,
\quad\mathrm{s.t.}\ (15d). \tag{35}
$

无约束解为

$
\widetilde{\mathbf D}_m=
[(\boldsymbol\Theta\mathbf S\mathbf F_m)^H
\boldsymbol\Theta\mathbf S\mathbf F_m]^{-1}
(\boldsymbol\Theta\mathbf S\mathbf F_m)^H\mathbf W_m. \tag{36}
$

原文给出的功率归一化更新为

$
\mathbf D_m=
\frac{\sqrt{P_t}\,\widetilde{\mathbf D}_m}
{\|\boldsymbol\Theta\mathbf S\mathbf F_m\widetilde{\mathbf D}_m\|_F}.
\tag{37}
$

**算法 2：FC 架构的 PWMMSE。** 输入全部信道、固定时延和系统参数以及 $\lambda,\rho,c$；初始化 $\boldsymbol\mu_m,\boldsymbol\omega_m,\mathbf W_m,\mathbf A,\boldsymbol\Theta,\mathbf S,\mathbf D_m$；在外循环中依次以式（21）更新 $\boldsymbol\mu_m$、式（22）更新 $\boldsymbol\omega_m$、式（24）更新 $\mathbf W_m$、算法 1 更新 $\boldsymbol\Theta,\mathbf S$，再以式（37）更新 $\mathbf D_m$。当式（20）目标的相对增加小于阈值时退出，输出 $\boldsymbol\Theta,\mathbf S,\mathbf D_m$。由于各变量块均通过对应子问题的准确最优解更新，且发射功率约束使目标有上界，因此算法的目标值收敛并达到块坐标意义下的最优点。

**SC 架构。** SC 网络的模拟矩阵具有块对角形式，使模拟子问题能够直接分解，无须引入 FC 方案中的 $\mathbf A$。固定其他变量，仍优化

$
\min_{\boldsymbol\Theta,\mathbf S}
\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\|_F^2,
\quad\mathrm{s.t.}\ (15b),(15c). \tag{38}
$

对于 SC，功率约束左侧等于 $(N_t/N_{\rm RF})\|\mathbf D_m\|_F^2$，与 $\boldsymbol\Theta,\mathbf S$ 无关。目标展开为

$
\begin{aligned}
&\sum_{m=1}^M\operatorname{Tr}
\{\mathbf W_m\mathbf W_m^H+
\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m
(\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m)^H\}\\
&\quad-2\sum_{m=1}^M\operatorname{Re}\{\operatorname{Tr}(
\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\mathbf W_m^H)\}.
\end{aligned}\tag{39}
$

利用 $\operatorname{Tr}[
\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m
(\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m)^H]
=(N_t/N_{\rm RF})\operatorname{Tr}(\mathbf D_m\mathbf D_m^H)$，上述问题等价于

$
\max_{\boldsymbol\Theta,\mathbf S}
\sum_{m=1}^M\operatorname{Re}\{\operatorname{Tr}(
\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\mathbf W_m^H)\},
\quad\mathrm{s.t.}\ (15b). \tag{40}
$

将 $\mathbf W_m=[\mathbf W_{m,1}^T,\ldots,
\mathbf W_{m,N_{\rm RF}}^T]^T$，并分块 $\mathbf D_m$，则式（40）目标可写成

$
\sum_{n=1}^{N_{\rm RF}}\sum_{p=1}^P
\operatorname{Re}\{\mathbf S_n(p,:)\mathbf B_{n,p}^H
\boldsymbol\theta_{n,p}\}. \tag{41}
$

其中

$
\mathbf B_n=
\left[\sum_{m=1}^M
\mathbf f_m\widetilde{\mathbf d}_{m,n}\mathbf W_{m,n}^H
\right]^H
=[\mathbf B_{n,1}^T,\ldots,\mathbf B_{n,P}^T]^T . \tag{42}
$

式（41）与 FC 的式（32）同形，区别仅在 $\mathbf A_{n,p}$ 被 $\mathbf B_{n,p}$ 替代，故有

$
\mathbf S_n(p,q)=
\begin{cases}
1,&q=\displaystyle\arg\max_i\|\mathbf B_{n,p}(:,i)\|_1,\\
0,&\text{其他},
\end{cases}\tag{43}
$

$
\boldsymbol\theta_{n,p}=
\exp\!\left(j\angle[
\mathbf B_{n,p}\mathbf S_n(p,:)^T]\right). \tag{44}
$

**算法 3：SC 架构的 PWMMSE。** 初始化全部辅助变量和波束赋形器；每轮先按式（21）、（22）、（24）更新 $\boldsymbol\mu_m,\boldsymbol\omega_m,\mathbf W_m$，接着由式（43）、（44）更新 $\mathbf S,\boldsymbol\Theta$，然后由式（37）更新 $\mathbf D_m$。若式（20）目标的相对增加低于阈值，则停止并输出模拟/数字波束赋形器。SC 直接利用块结构分离子阵列优化，因而避免辅助变量及其惩罚迭代。

在复杂度方面，SC 中更新 $\boldsymbol\Theta,\mathbf S$ 的复杂度均为 $O(MPKN_t)$；其余接收辅助量、全数字矩阵和数字矩阵的复杂度与 FC 相同。FC 中，$\boldsymbol\Theta,\mathbf S$ 更新规模为 $O(PN_{\rm RF}N_t)$；$\mathbf A$ 更新还涉及 $(PN_{\rm RF})$ 维矩阵求逆与其他矩阵乘积。

## IV. 低复杂度启发式波束赋形方法

PWMMSE 虽能获得较高频谱效率，但需要完整 CSI，并在大规模变量上执行反复迭代和矩阵运算。因此进一步提出启发式方案。其核心思想是将高维模拟设计与低维数字优化分开：模拟端只利用用户几何信息及 LoS 路径最大化阵列增益；数字端使用小维度等效 CSI 来处理多用户干扰。

### A. 模拟波束赋形设计

对于指定用户位置 $(\vartheta,r)$，希望模拟波束赋形器 $\boldsymbol\Theta_n\mathbf S_n\mathbf f_m$ 的相位能在所有子载波上尽可能与近场导向向量 $\mathbf a(f_m,\vartheta,r)$ 匹配，即第 $i$ 个天线上的相位对应 $e^{-j2\pi f_m t(i,\vartheta,r)}$。但受 FTTD 离散固定时延的约束，通常无法在所有频率和天线上完全匹配。所提方法先通过开关网络选择适当固定时延，再由 PS 补偿残余相位差。

用归一化阵列增益评价模拟波束质量，可以估计为达到一定宽带补偿效果所需的最小 FTTD 数量。作者在一定近似下，将阵列增益表示为两个 Dirichlet sinc 形式因子的乘积，用 $\Xi_N(\cdot)$ 表示。给定小于 1 的阈值 $\eta$，寻找满足各子载波上 $G(f_m)\ge\eta$ 的最小 $P$，形成原文式（54）。

例如，对 $N_t=512$、$B=10$ GHz、$f_c=100$ GHz 的系统，用户位于 $\vartheta=45^\circ$、$r=20$ m 时，如果要求 $\eta=0.8$，分析得出至少需要 35 个 FTTD。不过，从平均性能角度出发，所需 FTTD 数量可以显著减少，数值实验也验证了这一点。

当固定时延恰好按目标位置的几何信息设置时，模拟波束赋形设计有闭式解；即便用户几何位置与设计点不一致，所提方法也具有一定稳健性。实际部署中，可沿时延差较大的位置安排 FTTD 配置，以扩大有效服务区域。

### B. 数字波束赋形设计

模拟波束确定后，等效信道维度显著降低。接收信号改写为

$$
y_{m,k}=\widetilde{\mathbf h}_{m,k}\mathbf D_m\mathbf s_m+n_{m,k},
\qquad
\widetilde{\mathbf h}_{m,k}
=\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m. \tag{55}
$$

等效信道仅有 $N_{\rm RF}$ 维，可以高效估计。随后只优化数字矩阵 $\mathbf D_m$，最大化等效信道下的总频谱效率：

$$
\max_{\{\mathbf D_m\}}
\sum_{m=1}^{M}\sum_{k=1}^{K}\log(1+\widetilde\beta_{m,k}),
\quad
\text{s.t.}\quad
\|\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\|_F^2\le P_t. \tag{56}
$$

其中 $\widetilde\beta_{m,k}$ 是使用低维等效信道计算的 SINR。该问题退化为低维总速率最大化，可以使用前述 PWMMSE 的相关更新方式高效求解，但只需更新数字波束赋形变量。

**算法 4：低复杂度启发式波束赋形。**

1. 输入固定时延配置 $\boldsymbol\tau$、用户几何信息 $\{(\vartheta_k,r_k)\}$ 以及发射功率 $P_t$。
2. 对各条 RF 链确定其服务用户和波束赋形目标位置 $(\widehat\vartheta_n,\widehat r_n)$。
3. 根据原文式（51）、（52）构造该链的开关矩阵 $\mathbf S_n$ 和 PS 网络 $\boldsymbol\Theta_n$。
4. 估计各子载波及各用户的低维等效信道 $\widetilde{\mathbf h}_{m,k}$。
5. 根据式（56）优化数字波束赋形矩阵 $\mathbf D_m$。
6. 输出 $\boldsymbol\Theta,\mathbf S,\{\mathbf D_m\}$。

与 PWMMSE 相比，该方案避免大维度变量的反复矩阵求逆，也不要求完整 CSI，其复杂度随天线数量的增长更有利于大规模近场系统，并能够接近 PWMMSE 的性能。

## V. 数值结果

基站设有 $N_t=512$ 根天线、$N_{\rm RF}=4$ 条 RF 链，每条 RF 链配置 $P=16$ 个 FTTD。固定时延按照参考位置 $\vartheta=45^\circ,r=20$ m 设计。这个位置只是为固定时延提供均衡、适中的设计参考，并不表示架构只能为该位置附近的用户服务。系统中心频率为 100 GHz，带宽 10 GHz，子载波数 $M=16$。$K=4$ 个用户随机分布在距基站 10–30 m 范围内，AoD 在 $[-60^\circ,60^\circ]$ 上均匀分布。

每个用户信道包含 $L_k=3$ 条路径，路径损耗指数 $\xi=2$，分子吸收系数 $\kappa(f)=5.157\times10^{-4}$ dB/m，噪声 PSD 为 $-174$ dBm/Hz。PWMMSE 的收敛阈值为 $10^{-3}$，惩罚系数 $\lambda=10$；作者指出在 $1$–$100$ 范围内性能对该系数不敏感。算法 1 的惩罚系数初值 $\rho=10^{-3}$，放大因子 $c=2$。PWMMSE 的初始变量由启发式方法提供，以改善结果。数值结果对 100 次独立信道实现取平均。

对比方法包括完全数字波束赋形（上界）、基于 TTD 的波束赋形、传统 PS-only 模拟波束赋形，以及动态子阵列 DS-FTTD。对模拟波束赋形还比较 TTD-PNF、均值信道矩阵（MCM）、中心频率波束赋形（CF）和 DS-FTTD。

### A. 收敛与复杂度

图 2 展示所提迭代算法的收敛行为。作者同时比较理论复杂度与 CPU 耗时，测试平台使用 Intel Core i7 处理器、16 GB 内存。复杂度分析仅保留主导阶次。对于 TTD-PNF、启发式方案和 PS 基线，模拟波束赋形在迭代前离线确定，不会产生每次迭代的模拟端更新开销，因此只计入数字优化复杂度。

表 I 表明，启发式方法避免联合优化，计算复杂度明显更低。由于模拟端具有结构化连接方式，SC 的优化变量维度较低，CPU 耗时也小于 FC。

### B. 启发式模拟波束赋形的性能评价

首先考虑一个位于 $\vartheta=45^\circ,r=20$ m 的单用户，FTTD 固定延时按照该位置精确配置。图 3(a) 展示不同频率下归一化阵列增益。传统 PS-only 架构因空间宽带效应而出现严重增益损失，而 FTTD 辅助方案能够维持稳定增益。

虽然 TTD-PNF 利用连续可调时延在每个子载波上实现精确匹配，但即便采用离散固定延时，所提 FTTD+PS 方案仍可实现接近的补偿效果。这说明缓解空间宽带效应不一定需要高分辨率的连续可调时延器。相比之下，只采用 FTTD 和开关网络的 DS-FTTD 表现更差，因为它无法像额外使用 PS 的方案一样补偿不可避免的残余时延误差。

### C. 频谱效率随发射功率变化

图 4 比较在不同发射功率下，各种混合架构及优化方案的频谱效率。总体上，所提 FTTD 架构能够在较低时延硬件成本下获得接近基于 TTD 方法的频谱效率，启发式优化在不少场景下接近 PWMMSE。随着发射功率变化，多用户干扰管理和模拟波束的宽带对准共同影响总速率。

### 其他数值结果

论文还讨论 FTTD 数量、阵列尺寸、带宽扩展、能量效率和几何失配等因素。结合原文的总体结论，在硬件资源受限时，SC 架构相比 FC 更能够维持能量效率，并对更大天线数量与更宽带宽表现出更好的鲁棒性。FTTD+PS 通过粗时延补偿和残余相位补偿的组合，为频谱效率和硬件功耗提供了一种折中。

**图 2：** 所提优化算法的收敛行为。  
**图 3：** 不同频率下启发式模拟波束赋形的归一化阵列增益。  
**图 4：** 频谱效率与发射功率的关系。  
**表 I：** 不同方法的理论复杂度和 CPU 时间比较。  
**表 II：** 不同架构的功耗参数比较。

## VI. 结论（据原文主要结论整理）

本文面向近场宽带 THz 多用户系统，研究采用 FTTD 与 PS 的 FC/SC 混合波束赋形。通过结合 WMMSE 等价变换和惩罚法，提出联合优化模拟与数字波束赋形的 PWMMSE 方案；进一步开发只需 LoS 几何信息和低维等效 CSI 的低复杂度启发式方案。数值分析表明，采用 FTTD 的架构可以有效缓解空间宽带效应，并在能量效率上优于传统基于 TTD 的设计。对于有限 FTTD 资源，SC 架构对扩大阵列规模及带宽具有更好的鲁棒性。

## 未完成内容清单

这份 17 页 TWC 论文包含较长的分块优化推导、多个算法、复杂度表达式和多组实验图表。本译稿仍缺少**原文公式（30）–（54）的完整逐式翻译、部分基于惩罚方法的子问题推导、算法 1–3、后续所有实验图表的完整数值、原文 VI 节逐段译文以及参考文献**，不能计为全文完成。阅读和复现时应当与[原文 DOI](https://doi.org/10.1109/TWC.2026.3733666)对应 PDF 逐项核对。