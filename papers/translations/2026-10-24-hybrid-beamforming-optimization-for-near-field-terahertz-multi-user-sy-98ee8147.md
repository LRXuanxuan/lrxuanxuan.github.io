---
layout: page
title: "近场太赫兹多用户 FTTD 系统的混合波束赋形优化｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-24-hybrid-beamforming-optimization-for-near-field-terahertz-multi-user-sy-98ee8147/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/98ee8147d0091bcb/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

# 近场太赫兹多用户 FTTD 系统的混合波束赋形优化

**原题：** Hybrid Beamforming Optimization for Near-Field Terahertz Multi-User System With FTTDs  
**作者：** Wenqiang Chu、Qiuyan Liu、Yanxia Cao、Yafeng Wang（Senior Member, IEEE）  
**单位：** Wenqiang Chu 与 Yafeng Wang 为北京邮电大学泛网无线通信教育部重点实验室（北京 100876，中国；通讯作者：Yafeng Wang，wangyf@bupt.edu.cn）；Qiuyan Liu 与 Yanxia Cao 为中国联通研究院（北京 100048，中国）。  
**资助：** 北京邮电大学—中国联通联合创新中心（2025-STHZ-BJYDDX-005）。  
**版本：** 期刊正式版，IEEE Transactions on Wireless Communications, vol. 25, 2026（DOI: 10.1109/TWC.2026.3733666；2026-01-31 收稿、2026-06-05 修回、2026-09-08 录用、2026-09-14 在线发表），本地 PDF 17 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、式（1）—（58）、表 I—II（逐格）、图 1—15 图注、参考文献 [1]—[40] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写"期刊/会议正式版（2026-10-24），本地 PDF 17 页"；实际 PDF 为 **IEEE TWC vol. 25, 2026 期刊正式版**（DOI 10.1109/TWC.2026.3733666），页眉页码 23882—23898，"2026-10-24" 应为站点推荐/下载日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

本文研究在**近场区域**为多用户服务的**宽带太赫兹（THz）**通信系统的波束赋形。为减轻**空间宽带效应**，引入采用**固定真时延（fixed true time delays，FTTDs）与移相器（PSs）**的混合波束赋形架构，并同时考虑**全连接（FC）**与**子连接（SC）**两种架构。为最大化谱效，我们提出一种**基于惩罚的加权最小均方误差（PWMMSE）**方法：把谱效最大化问题通过加权最小均方误差（WMMSE）与惩罚方法重构，再以**块坐标下降（BCD）**方式求解。为降低计算复杂度并避免 PWMMSE 对完整信道状态信息（CSI）的需求，进一步提出一种**低复杂度启发式波束赋形**方法：先基于视距（LoS）信道设计模拟波束赋形器，再基于所得低维等效信道优化数字波束赋形器。数值结果表明：1）所提方法能有效缓解空间宽带效应；2）所提架构相比基于真时延（TTD）的架构取得更高能效；3）在有限 FTTD 预算下，SC 架构取得更高能效，并对天线阵列扩展与带宽扩展表现出更优鲁棒性。

**索引词**：波束赋形；近场；空间宽带效应；固定真时延；太赫兹通信。

## I. 引言

第六代（6G）无线通信系统预计相比现有系统实现显著更高的数据速率、更低的端到端时延与更高的可靠性 [1]–[3]。在 5G 网络技术基础上，6G 旨在进一步增强智能连接、实现泛在接入并支持超高速通信 [4], [5]。为满足这些高要求，6G 正走向更高频段，如**太赫兹（THz）**频段——它提供丰富频谱资源、可支持 Tbps 级传输速率 [6]；此外，THz 频率下极短波长使天线孔径可缩小，从而可在有限物理空间内集成大量天线 [7]。然而 THz 频段严重的传播衰减显著限制通信距离 [8]，必须使用大规模天线阵列维持可靠链路。5G 通过大规模多输入多输出（mMIMO）应对该挑战 [9], [10]，而 6G 被广泛预期继承 mMIMO 概念并进一步演进为**超大规模 MIMO（XL-MIMO）**[11]–[15]。**宽带宽与大天线孔径的结合导致显著的空间宽带效应** [7]，传统基于移相器（PS）的模拟波束赋形方案无法有效缓解，从而造成谱效显著下降。本文旨在解决宽带多用户 THz 通信系统中的这一基础挑战。

### A. 先前工作

基于 PS 架构的宽带系统波束赋形已被广泛研究。例如 [16] 提出利用 CSI 把所有频率投影到中心频点的混合发射预编码（TPC）方案，在毫米波系统中构造公共模拟预编码器；[17] 提出虚拟子阵混合波束赋形架构以缓解宽带 THz mMIMO 中的空间宽带效应。但由于 PS 的频率无关性，这些方法相比全数字波束赋形仍有明显性能损失。

为克服该限制，可用**真时延（TTD）**实现频率相关波束赋形 [18]。例如 [19] 利用 XL-MIMO 中的近场空间宽带效应，采用 TTD 波束赋形实现高效的多频多位置波束训练。一种直接方案是用 TTD 完全替代 PS 网络 [20]，但受 THz 频段高硬件成本与功耗限制而不实用。为缓解这些缺点，已提出若干基于 TTD 的混合波束赋形架构：例如 [21] 为宽带 THz mMIMO 引入延迟—相位预编码（DPP），性能接近全数字系统；[22] 提出 TTD 辅助的干扰与空间宽带感知统计波束赋形器，提升了谱效；[23]–[25] 在实际时延约束下联合优化 PS 与 TTD；[26] 研究了仅 PS 与 TTD 辅助架构的量化混合波束赋形。

在传统 TTD 之外，**固定真时延（FTTD）**也被证明能对抗空间宽带效应。[27]、[28] 的动态子阵 FTTD（DS-FTTD）混合架构利用低成本 FTTD 降低功耗与硬件复杂度，并采用低复杂度的行分解（RD）算法在非完美 CSI 下取得稳健的谱效与能效。传统 TTD 通常依赖多级级联延迟调谐模块、功耗较高，而 FTTD 采用单条无源固定延迟线的简化架构 [28]，避免了多级调谐开销，从而显著降低硬件复杂度与总体功耗。

### B. 动机与贡献

现有混合波束赋形工作大多聚焦单用户场景，宽带多用户混合波束赋形受到的关注相对有限。[29] 为宽带多用户 THz 系统提出基于 TTD 的 SC 混合波束赋形架构，但 TTD 器件功耗高，限制其实际部署。由于 FTTD 已被证明能在单用户场景以更低硬件成本有效缓解空间宽带效应 [27], [28]，本文采用 FTTD 求解宽带多用户 THz 系统的波束赋形设计问题，以实现低功耗、硬件高效的架构。相比基于 TTD 的架构，所提架构把 FTTD 与**二元开关网络**结合，在保持系统性能与硬件成本良好权衡的同时大幅降低硬件复杂度与功耗。主要贡献总结如下。

- **架构**：为以可承受成本缓解空间宽带效应，我们为宽带 THz 系统设计基于 FTTD 的 FC 与 SC 混合波束赋形架构。与现有仅用 FTTD 的架构 [27], [28]（延迟单元数有限导致不可避免的延迟失配与性能下降）不同，所提架构引入 PS 阵列实现**两级补偿机制**：FTTD 进行粗延迟对齐以缓解空间宽带效应，PS 阵列进一步补偿由不完美延迟匹配引起的残余相位误差。因此所提架构显著提升谱效；相比传统 TTD 架构，在性能与硬件成本间取得良好权衡的同时大幅降低功耗。
- **算法**：为 FC 与 SC 架构下的混合波束赋形提出 PWMMSE 方法：通过 WMMSE 与惩罚方法重构谱效最大化问题，再以 BCD 方式更新所有变量，且每个子问题均有闭式解。
- **低复杂度方法**：为进一步降低复杂度与对完整 CSI 的要求，提出启发式混合波束赋形方法：先为每个用户最大化 LoS 天线增益来设计模拟波束赋形器，再基于所得低维等效信道优化数字波束赋形器。
- **数值结果**：1）FTTD 能有效缓解空间宽带效应；2）启发式方法在多数场景性能与 PWMMSE 相当；3）所提 FTTD 架构能效高于 TTD 架构；4）SC 架构相比 FC 架构对天线阵列扩展与带宽扩展更鲁棒。

### C. 组织结构与记号

本文组织如下：第 II 节给出信号模型并表述谱效最大化问题；第 III 节描述所提 PWMMSE 方法；第 IV 节详述启发式方法；第 V 节给出数值结果；第 VI 节总结全文。

小写粗体表示向量、大写粗体表示矩阵。矩阵 $\mathbf A$ 的共轭、转置与共轭转置分别记为 $\mathbf A^*$、$\mathbf A^T$、$\mathbf A^H$；$\mathbf A(i,:)$ 与 $\mathbf A(:,j)$ 分别表示第 $i$ 行与第 $j$ 列，$\mathbf A(i,j)$ 表示第 $(i,j)$ 个元素。$\operatorname{diag}(\mathbf a)$ 表示以向量 $\mathbf a$ 为对角元的对角阵；分块对角矩阵 $\operatorname{blkdiag}(\mathbf A,\mathbf B)$ 的对角块为 $\mathbf A$ 与 $\mathbf B$；$\operatorname{Tr}\{\mathbf A\}$ 表示迹。$\operatorname{Re}\{\mathbf A\}$、$\operatorname{Re}\{\mathbf a\}$、$\operatorname{Re}\{a\}$ 分别表示实部；$\|\mathbf a\|_\ell$ 表示向量的 $\ell$ 范数，$\|\mathbf a\|$ 为欧氏范数，$\|\mathbf A\|_F$ 为 Frobenius 范数。$\mathcal{CN}(\mu,\sigma^2)$ 表示均值为 $\mu$、方差为 $\sigma^2$ 的循环对称复高斯分布；$\mathbf I_N$ 表示 $N$ 阶单位阵；$\angle$ 表示复数的相位。

## II. 系统模型

考虑下行宽带 THz 多用户系统：基站（BS）配备 $N_t$ 阵元的均匀线阵（ULA），服务 $K$ 个单天线用户。记系统带宽为 $B$、子载波数为 $M$、光速为 $c$、中心频率为 $f_c$、中心频率波长为 $\lambda_c=c/f_c$；第 $m$ 个子载波频率为 $f_m=f_c+\frac{B(2m-1-M)}{2M}$（$\forall m=1,\ldots,M$）。BS 天线间距 $d=\lambda_c/2$。

### A. 信道模型

本文采用 Saleh–Valenzuela（SV）THz 信道模型，由一个主导 LoS 路径与多个非视距（NLoS）路径组成，NLoS 路径功率显著弱于 LoS 路径。具体地，每条信道含 1 条 LoS 与 $N_{\mathrm{clu}}$ 条 NLoS 路径 [30]。记 $\mathbf h_{m,k}\in\mathbb C^{1\times N_t}$ 为第 $m$ 个子载波上 BS 到第 $k$ 个用户的信道，$L_k$ 为 $\mathbf h_{m,k}$ 中 LoS 与 NLoS 路径总数；$r_{k,l}$ 与 $\vartheta_{k,l}$ 为第 $l$ 条路径的传播距离与离开角（AoD）。该模型下，第 $m$ 个子载波上 BS 与第 $k$ 个用户之间的信道为

$$
\mathbf h_{m,k}=\sum_{l=1}^{L_k}\alpha_{m,k,l}\mathbf a\left(f_m,\vartheta_{k,l},r_{k,l}\right)^Te^{-j2\pi f_m\frac{r_{k,l}}{c}},\tag{1}
$$

其中 $\mathbf a$ 为 BS 的近场导向矢量：

$$
\mathbf a\left(f_m,\vartheta,r\right)=\left[e^{j2\pi f_mt(1,\vartheta,r)},\ldots,e^{j2\pi f_mt(N_t,\vartheta,r)}\right]^T.\tag{2}
$$

$t(n,\vartheta,r)$ 为第 $n$ 个天线的相对时延：

$$
t(n,\vartheta,r)=\frac{(n-1)d\sin\vartheta-\frac{(n-1)^2d^2\left(1-\sin^2\vartheta\right)}{2r}}{c},\tag{3}
$$

而 $\alpha_{m,k,l}$ 为第 $m$ 个子载波上第 $l$ 条路径的路径损耗：

$$
\alpha_{m,k,l}=\begin{cases}\left(\frac{c}{4\pi f_mr_{k,1}}\right)^{\frac{\xi}{2}}e^{-\frac12\kappa(f_m)r_{k,1}},&l=1,\\[4pt]\alpha_{m,k,l}^{\mathrm{NLoS}},&l=2\ldots L_k,\end{cases}\tag{4}
$$

其中 $\xi$ 为路径损耗指数，$\kappa(f_m)$ 为分子吸收系数，$\alpha_{m,k,l}^{\mathrm{NLoS}}$ 为 NLoS 路径增益：

$$
\alpha_{m,k,l}^{\mathrm{NLoS}}=\left|\alpha_{m,k,l}^{\mathrm{NLoS}}\right|e^{j\varphi_{m,k,l}},\qquad l=2\ldots L_k,\tag{5}
$$

### B. 天线架构

发射机结构如图 1 所示，含 $N_{\mathrm{RF}}$ 条射频（RF）链。每条 RF 链配备 $P$ 个 FTTD，经**开关网络**与 PS 连接到发射天线。记 $\boldsymbol\tau=[\tau_1,\ldots,\tau_P]^T$ 为 FTTD 的时延向量。与可调时延的 TTD 不同，本文 FTTD 采用从预定义延迟集 $\boldsymbol\tau$ 中选取的**固定时延**，因此需要开关网络在各天线间灵活分配这些固定时延——这对在 FTTD 架构下保持波束赋形灵活性至关重要。第 $m$ 个子载波上第 $k$ 个用户的接收信号为

$$
\mathbf y_{m,k}=\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\mathbf s_m+\mathbf n_{m,k},\tag{6}
$$

**图 1**：基于 FTTD 的混合波束赋形架构（(a) 全连接；(b) 子连接）。

其中 $\boldsymbol\Theta\in\mathbb C^{N_t\times PN_{\mathrm{RF}}}$ 为 PS 实现的模拟波束赋形矩阵，$\mathbf S\in\mathbb C^{PN_{\mathrm{RF}}\times PN_{\mathrm{RF}}}$ 为二元开关网络，$\mathbf F_m\in\mathbb C^{PN_{\mathrm{RF}}\times N_{\mathrm{RF}}}$ 是由 $N_{\mathrm{RF}}$ 个向量 $\mathbf f_m=\left[e^{-j2\pi f_m\tau_1},\ldots,e^{-j2\pi f_m\tau_P}\right]^T$ 组成的分块对角阵：

$$
\mathbf F_m=\operatorname{blkdiag}\left\{\mathbf f_m,\ldots,\mathbf f_m\right\}.\tag{7}
$$

$\mathbf D_m\in\mathbb C^{N_{\mathrm{RF}}\times K}$ 为数字预编码矩阵，$\mathbf s_m$ 为发射数据且满足 $\mathbb E\{\mathbf s_m\mathbf s_m^H\}=\mathbf I$，加性高斯白噪声建模为 $\mathbf n_{m,k}\sim\mathcal{CN}(0,\sigma_{m,k}^2)$。

PS 模拟波束赋形器 $\boldsymbol\Theta$ 与开关网络 $\mathbf S$ 在 FC 与 SC 架构下结构不同，分述如下。

**1）全连接架构**：FC 架构如图 1(a) 所示，天线阵被划分为 $P$ 个子阵，每条 RF 链经开关网络连接到全部子阵。二元开关网络矩阵 $\mathbf S$ 为

$$
\mathbf S=\operatorname{blkdiag}\left(\mathbf S_1,\ldots,\mathbf S_{N_{\mathrm{RF}}}\right),\tag{8}
$$

其中 $\mathbf S_n\in\{0,1\}^{P\times P}$ 且满足 $\left\|\mathbf S_n(p,:)\right\|_0=1$（$\forall n=1,\ldots,N_{\mathrm{RF}}$、$p=1,\ldots,P$）。PS 网络表示为

$$
\boldsymbol\Theta=\left[\boldsymbol\Theta_1,\ldots,\boldsymbol\Theta_{N_{\mathrm{RF}}}\right],\tag{9}
$$

$$
\boldsymbol\Theta_n=\operatorname{blkdiag}\left(\boldsymbol\theta_{n,1},\ldots,\boldsymbol\theta_{n,P}\right),\tag{10}
$$

其中 $\boldsymbol\theta_{n,p}\in\mathbb C^{\frac{N_t}{P}\times1}$ 且满足恒模约束 $\left|\boldsymbol\theta_{n,p}(i)\right|=1$（$\forall n,p$，$i=1,\ldots,\frac{N_t}{P}$）。

**2）子连接架构**：SC 架构如图 1(b) 所示，天线阵被划分为 $N_{\mathrm{RF}}P$ 个子阵，每条 RF 链经开关网络连接 $P$ 个子阵。SC 架构中开关网络矩阵 $\mathbf S$ 的物理含义不同，但结构与 FC 相同。PS 网络表示为

$$
\boldsymbol\Theta=\operatorname{blkdiag}\left(\boldsymbol\Theta_1,\ldots,\boldsymbol\Theta_{N_{\mathrm{RF}}}\right),\tag{11}
$$

$$
\boldsymbol\Theta_n=\operatorname{blkdiag}\left(\boldsymbol\theta_{n,1},\ldots,\boldsymbol\theta_{n,P}\right),\tag{12}
$$

其中 $\boldsymbol\theta_{n,p}\in\mathbb C^{\frac{N_t}{N_{\mathrm{RF}}P}\times1}$ 且满足恒模约束（$i=1,\ldots,\frac{N_t}{N_{\mathrm{RF}}P}$）。

### C. 问题表述

目标是通过联合优化数字与模拟波束赋形最大化系统谱效。由（6），第 $k$ 个用户在第 $m$ 个子载波上的信干噪比（SINR）为

$$
\beta_{m,k}=\frac{\left|\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf d_{m,k}\right|^2}{\sum_{i=1,i\neq k}^{K}\left|\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf d_{m,i}\right|^2+\sigma_{m,k}^2},\tag{13}
$$

其中 $\mathbf d_{m,k}\in\mathbb C^{N_{\mathrm{RF}}\times1}$ 为 $\mathbf D_m$ 的第 $k$ 列。于是系统谱效为

$$
R=\frac1M\sum_{m=1}^{M}\sum_{k=1}^{K}\log\left(1+\beta_{m,k}\right).\tag{14}
$$

谱效最大化问题可表述为

$$
\max_{\boldsymbol\Theta,\mathbf S,\mathbf D_m}\ \sum_{m=1}^{M}\sum_{k=1}^{K}\log\left(1+\beta_{m,k}\right)\tag{15a}
$$
$$
\text{s.t.}\quad\left|\boldsymbol\Theta(i,j)\right|=1,\ \forall(i,j)\in\mathcal Q,\tag{15b}
$$
$$
\quad\qquad\left\|\mathbf S_n(i,:)\right\|_0=1,\ \forall n,i,\tag{15c}
$$
$$
\quad\qquad\left\|\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2\le P_t,\ \forall m,\tag{15d}
$$

其中集合 $\mathcal Q$ 汇集 $\boldsymbol\Theta$ 中非零元素的索引，$P_t$ 为每个子载波上每个用户的最大发射功率。两种架构下问题表述相同，仅约束不同。用户与子载波间的紧密耦合引入严重的变量耦合，使问题（15）本身难以求解；此外，与基于 TTD 的传统架构 [29]（时延为连续变量）不同，FTTD 架构施加严格的**二元选择约束**：开关网络矩阵 $\mathbf S$ 由 $\{0,1\}$ 二元元素组成，把波束赋形设计变为**混合整数非线性规划**问题，这种组合特性使标准梯度类方法失效并显著增加优化难度。因此下文引入 PWMMSE 方法求解；该方法性能高但计算复杂度与信道估计开销较大，故我们随后提出启发式方法以降低复杂度。

## III. 基于惩罚的加权最小均方误差方法

本节受 [29] 中全数字近似框架启发，发展 PWMMSE 方法求解问题（15）。其核心思想是引入辅助全数字波束赋形器，并通过惩罚项强制混合结构；但与 [29] 假设连续时延不同，我们的方法处理由开关网络与 FTTD 施加的严格离散约束。

### A. 问题重构

由于问题（15）中变量耦合，直接求解不可处理。为此为每个子载波引入辅助全数字波束赋形矩阵 $\mathbf W_m=\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m$，得到如下等价问题：

$$
\max_{\boldsymbol\Theta,\mathbf S,\mathbf D_m,\mathbf W_m}\ \sum_{m=1}^{M}\sum_{k=1}^{K}\log\left(1+\frac{\left|\mathbf h_{m,k}\mathbf w_{m,k}\right|^2}{\sum_{i=1,i\neq k}^{K}\left|\mathbf h_{m,k}\mathbf w_{m,i}\right|^2+\sigma_{m,k}^2}\right)\tag{16a}
$$
$$
\text{s.t.}\quad\mathbf W_m=\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m,\ \forall m,\tag{16b}
$$
$$
\quad\qquad(15b)-(15d),\tag{16c}
$$

其中 $\mathbf w_{m,k}\in\mathbb C^{N_t\times1}$ 为 $\mathbf W_m$ 的第 $k$ 列。由 WMMSE 理论 [32] 可证

$$
\sum_{m=1}^{M}\sum_{k=1}^{K}\log\left(1+\frac{\left|\mathbf h_{m,k}\mathbf w_{m,k}\right|^2}{\sum_{i\neq k}\left|\mathbf h_{m,k}\mathbf w_{m,i}\right|^2+\sigma_{m,k}^2}\right)=\max_{\mu_m,\omega_m}\sum_{m=1}^{M}\sum_{k=1}^{K}\left(\log\omega_{m,k}-\omega_{m,k}e_{m,k}+1\right),\tag{17}
$$

其中

$$
e_{m,k}=\left|\mu_{m,k}\right|^2\left\|\mathbf h_{m,k}\mathbf W_m\right\|^2-2\operatorname{Re}\left\{\mu_{m,k}^*\mathbf h_{m,k}\mathbf w_{m,k}\right\}+\left|\mu_{m,k}\right|^2\sigma_{m,k}^2+1\tag{18}
$$

表示第 $k$ 个用户在第 $m$ 个子载波上的**均方误差（MSE）**；$\boldsymbol\mu_m=[\mu_{m,1},\ldots,\mu_{m,K}]^T$ 与 $\boldsymbol\omega_m=[\omega_{m,1},\ldots,\omega_{m,K}]^T$ 为辅助变量。于是利用 WMMSE 等价性，问题（16）可等价变换为

$$
\max_{\boldsymbol\Omega}\ \sum_{m=1}^{M}\sum_{k=1}^{K}\left(\log\omega_{m,k}-\omega_{m,k}e_{m,k}\right)\tag{19a}
$$
$$
\text{s.t.}\quad\omega_{m,k}>0,\ \forall m,k,\tag{19b}
$$
$$
\quad\qquad(15b)-(15d),\ (16b),\tag{19c}
$$

其中 $\boldsymbol\Omega=\{\mu_m,\omega_m,\boldsymbol\Theta,\mathbf S,\mathbf D_m,\mathbf W_m\}$ 为全部变量集合。但等式约束（16b）仍妨碍优化。为此把（16b）作为惩罚项移入目标，得到

$$
\max_{\boldsymbol\Omega}\ \sum_{m=1}^{M}\sum_{k=1}^{K}\left(\log\omega_{m,k}-\omega_{m,k}e_{m,k}\right)-\frac{\lambda}{2}\sum_{m=1}^{M}\left\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2\triangleq\mathcal L\left(\mu_m,\omega_m,\boldsymbol\Theta,\mathbf S,\mathbf D_m,\mathbf W_m\right)\tag{20a}
$$
$$
\text{s.t.}\quad(15b)-(15d),\tag{20b}
$$

其中 $\lambda>0$ 为惩罚因子。取适当的 $\lambda>0$ 可在系统性能与约束满足之间取得平衡。下面分别给出 FC 与 SC 架构的求解。

### B. 全连接架构的求解

问题（20）因目标高度非凸且硬件约束耦合而无闭式解。为使优化计算可处理，我们采用广泛用于非凸多变量优化的 BCD 方法：其核心动机是把原联合优化问题分解为若干可处理子问题，从而显著降低大规模阵列系统每轮迭代的计算复杂度；具体地，每个块变量在其他变量固定时迭代优化。

**1）关于 $\mu_m$ 与 $\omega_m$ 的子问题**：固定其他变量时问题（20）关于 $\mu_{m,k}$ 为凹问题，故最优 $\mu_{m,k}$ 为 [32]

$$
\mu_{m,k}=\frac{\mathbf h_{m,k}\mathbf w_{m,k}}{\left\|\mathbf h_{m,k}\mathbf W_m\right\|^2+\sigma_{m,k}^2}.\tag{21}
$$

得到最优 $\mu_{m,k}$ 后，最优 $\omega_{m,k}$ 为

$$
\omega_{m,k}=1+\frac{\left|\mathbf h_{m,k}\mathbf w_{m,k}\right|^2}{\sum_{i=1,i\neq k}^{K}\left|\mathbf h_{m,k}\mathbf w_{m,i}\right|^2+\sigma_{m,k}^2}.\tag{22}
$$

**2）关于 $\mathbf W_m$ 的子问题**：固定其他变量时问题（20）变为无约束凹问题

$$
\max_{\mathbf W_m}\ \mathcal L\left(\mu_m,\omega_m,\boldsymbol\Theta,\mathbf S,\mathbf D_m,\mathbf W_m\right).\tag{23}
$$

令 $\frac{\partial\mathcal L}{\partial\mathbf W_m^*}=\mathbf 0$，得最优解

$$
\mathbf W_m=\left(\sum_{k=1}^{K}\omega_{m,k}\left|\mu_{m,k}\right|^2\mathbf h_{m,k}^H\mathbf h_{m,k}+\frac{\lambda}{2}\mathbf I_{N_t}\right)^{-1}\left(\sum_{k=1}^{K}\omega_{m,k}\mu_{m,k}\mathbf h_{m,k}^H\mathbf e_k^T+\frac{\lambda}{2}\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right),\tag{24}
$$

其中 $\mathbf e_k\in\mathbb R^{K\times1}$ 为第 $k$ 个元素为 1、其余为 0 的向量。

**3）关于 $\boldsymbol\Theta$ 与 $\mathbf S$ 的子问题**：这两个变量只出现在目标的惩罚项中，故有

$$
\min_{\boldsymbol\Theta,\mathbf S}\ \sum_{m=1}^{M}\left\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2\tag{25a}
$$
$$
\text{s.t.}\quad(15b),\ (15c).\tag{25b}
$$

此处忽略功率约束（15d），原因是 $\boldsymbol\Theta$ 与 $\mathbf S$ 受紧约束且频率无关，一般无法在所有子载波上同时满足功率约束；因此功率约束只在 $\mathbf D_m$ 的优化中考虑。FC 架构中不同 RF 链的信号经 PS 矩阵 $\boldsymbol\Theta$ 与二元开关矩阵 $\mathbf S$ 耦合，直接求解（25）困难。为解耦这些变量并处理 FTTD 选择的组合特性，引入辅助变量 $\mathbf A=\boldsymbol\Theta\mathbf S$，把非凸等式约束作为惩罚项移入目标：

$$
\min_{\boldsymbol\Theta,\mathbf A,\mathbf S}\ \sum_{m=1}^{M}\left\|\mathbf W_m-\mathbf A\mathbf F_m\mathbf D_m\right\|_F^2+\frac{\rho}{2}\left\|\mathbf A-\boldsymbol\Theta\mathbf S\right\|_F^2\tag{26a}
$$
$$
\text{s.t.}\quad(15b),\ (15c),\tag{26b}
$$

其中 $\rho>0$ 为等式 $\mathbf A=\boldsymbol\Theta\mathbf S$ 的惩罚因子。逐步增大 $\rho$ 至足够大，可迫使 $\mathbf A$ 严格满足 $\mathbf A=\boldsymbol\Theta\mathbf S$，保证解可行。为解耦优化，再对该问题应用 BCD。

给定 $\boldsymbol\Theta$ 与 $\mathbf S$，问题（26）变为

$$
\min_{\mathbf A}\ \sum_{m=1}^{M}\left\|\mathbf W_m-\mathbf A\mathbf F_m\mathbf D_m\right\|_F^2+\frac{\rho}{2}\left\|\mathbf A-\boldsymbol\Theta\mathbf S\right\|_F^2,\tag{27}
$$

其为关于 $\mathbf A$ 的无约束凸问题，最优解为

$$
\mathbf A=\left(\sum_{m=1}^{M}\mathbf W_m\left(\mathbf F_m\mathbf D_m\right)^H+\frac{\rho}{2}\boldsymbol\Theta\mathbf S\right)\left(\sum_{m=1}^{M}\mathbf F_m\mathbf D_m\left(\mathbf F_m\mathbf D_m\right)^H+\frac{\rho}{2}\mathbf I_{PN_{\mathrm{RF}}}\right)^{-1}.\tag{28}
$$

给定 $\mathbf A$，问题（26）变为

$$
\min_{\boldsymbol\Theta,\mathbf S}\ \left\|\mathbf A-\boldsymbol\Theta\mathbf S\right\|_F^2\tag{29a}
$$
$$
\text{s.t.}\quad(15b),\ (15c).\tag{29b}
$$

由（8）—（10）可把目标等价写为

$$
(29a)=\sum_{n=1}^{N_{\mathrm{RF}}}\left\|\mathbf A_n-\boldsymbol\Theta_n\mathbf S_n\right\|_F^2=\sum_{n=1}^{N_{\mathrm{RF}}}\operatorname{Tr}\left\{\mathbf A_n\mathbf A_n^H+\boldsymbol\Theta_n\mathbf S_n\left(\boldsymbol\Theta_n\mathbf S_n\right)^H\right\}-2\sum_{n=1}^{N_{\mathrm{RF}}}\operatorname{Re}\left\{\operatorname{Tr}\left\{\boldsymbol\Theta_n\mathbf S_n\mathbf A_n^H\right\}\right\},\tag{30}
$$

其中 $\mathbf A=[\mathbf A_1,\ldots,\mathbf A_{N_{\mathrm{RF}}}]$。可观察到 $\operatorname{Tr}\{\mathbf A_n\mathbf A_n^H\}$ 与 $\boldsymbol\Theta$ 无关，且 $\operatorname{Tr}\{\boldsymbol\Theta_n\mathbf S_n(\boldsymbol\Theta_n\mathbf S_n)^H\}=N_t$（$\forall n$），故得到等价问题

$$
\max_{\boldsymbol\Theta,\mathbf S}\ \sum_{n=1}^{N_{\mathrm{RF}}}\operatorname{Re}\left\{\operatorname{Tr}\left\{\boldsymbol\Theta_n\mathbf S_n\mathbf A_n^H\right\}\right\}\tag{31a}
$$
$$
\text{s.t.}\quad(15b),\ (15c).\tag{31b}
$$

注意 $\mathbf A_n$ 为分块对角阵、$\mathbf S_n$ 为每行仅一个非零元的二元选择矩阵。该离散结构允许把（31a）中的迹分解为各开关贡献之和：

$$
(31a)=\sum_{n=1}^{N_{\mathrm{RF}}}\sum_{p=1}^{P}\operatorname{Re}\left\{\mathbf S_n(p,:)\mathbf A_{n,p}^H\boldsymbol\theta_{n,p}\right\},\tag{32}
$$

其中 $\mathbf A_n=\left[\mathbf A_{n,1}^T,\ldots,\mathbf A_{n,P}^T\right]^T$。由于目标是各子阵贡献之和，且各子阵的开关在 $P$ 个可用 FTTD 间独立，每个子阵的最优 FTTD 索引 $q$ 是使 $\boldsymbol\theta_{n,p}$ 在辅助空间上投影最大者，故最优 $\mathbf S$ 由下式确定：

$$
\mathbf S_n(p,q)=\begin{cases}1,&q=\arg\max_i\left\|\mathbf A_{n,p}(:,i)\right\|_1,\\0,&\text{否则},\end{cases}\tag{33}
$$

相应的最优 $\boldsymbol\theta$ 为

$$
\boldsymbol\theta_{n,p}=e^{j\angle\left(\mathbf A_{n,p}\mathbf S_n(p,:)^T\right)}.\tag{34}
$$

该闭式更新是最优的，因为 PS 总能补偿任意相位旋转，从而把二元选择问题降为在 $P$ 个可用候选中做简单最大幅度搜索。

> **注 1**：求解子问题（29）的关键挑战是二元约束 $\mathbf S_n\in\{0,1\}$。与 [29] 需对每个连续时延做迭代一维搜索不同，我们的方法利用开关网络的离散结构得到闭式最优解：通过解耦开关与子阵，最优开关选择与 PS 对齐可通过一次简单最大幅度搜索同时完成。这不仅避免了松弛—取整二元变量的高昂计算代价，还保证子问题以全局最优性求解，且复杂度相对 FTTD 数 $P$ 为线性。

基于上述各变量更新，求解（26）的算法总结于算法 1。算法 1 的收敛行为来自**逐块精确优化**原理：固定惩罚因子 $\rho$ 时，（28）中 $\mathbf A$ 的更新给出其子问题的最优解；（33）（34）中 $\mathbf S$ 与 $\boldsymbol\Theta$ 的更新分别通过对有限离散 FTTD 候选集的精确搜索与闭式相位对齐得到。因此每次块更新都保证迭代过程中目标值不降；随着 $\rho$ 逐步增大，约束 $\mathbf A=\boldsymbol\Theta\mathbf S$ 被逐步强制满足。

**算法 1**　求解（26）的算法

1: **输入**：$\mathbf A$、$\boldsymbol\Theta$、$\mathbf S$、$\rho>0$ 与 $c>1$。
2: **repeat**
3: 　**repeat**
4: 　　按（28）更新 $\mathbf A$；
5: 　　按（33）更新 $\mathbf S$；
6: 　　按（34）更新 $\boldsymbol\Theta$；
7: 　**until** 问题（26）目标值的相对下降低于阈值；
8: 　$\rho=c\rho$；
9: **until** 惩罚值低于阈值；
10: **输出**：$\mathbf A$、$\boldsymbol\Theta$ 与 $\mathbf S$。

**算法 2**　FC 架构的 PWMMSE 方法

1: **输入**：$\mathbf h_{m,k}$、$\boldsymbol\tau$、$N_t$、$N_{\mathrm{RF}}$、$M$、$K$、$P$、$P_t$、$\lambda>0$、$\rho>0$、$c>0$。
2: 初始化 $\mu_m$、$\omega_m$、$\mathbf W_m$、$\mathbf A$、$\boldsymbol\Theta$、$\mathbf S$、$\mathbf D_m$。
3: **repeat**
4: 　按（21）更新 $\mu_m$；
5: 　按（22）更新 $\omega_m$；
6: 　按（24）更新 $\mathbf W_m$；
7: 　用算法 1 更新 $\boldsymbol\Theta$ 与 $\mathbf S$；
8: 　按（37）更新 $\mathbf D_m$；
9: **until** 问题（20）目标值的相对上升低于阈值；
10: **输出**：最优 $\boldsymbol\Theta$、$\mathbf S$ 与 $\mathbf D_m$。

**4）关于 $\mathbf D_m$ 的子问题**：$\mathbf D_m$ 的最优解可由在功率约束（15d）下最小化问题（20）的惩罚项得到：

$$
\min_{\mathbf D_m}\ \left\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2\tag{35a}
$$
$$
\text{s.t.}\quad(15d).\tag{35b}
$$

记 $\widetilde{\mathbf D}_m$ 为问题（35）的无约束最优解

$$
\widetilde{\mathbf D}_m=\arg\min_{\mathbf D_m}\left\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2=\left(\left(\boldsymbol\Theta\mathbf S\mathbf F_m\right)^H\boldsymbol\Theta\mathbf S\mathbf F_m\right)^{-1}\left(\boldsymbol\Theta\mathbf S\mathbf F_m\right)^H\mathbf W_m,\tag{36}
$$

则问题（35）的最优解为

$$
\mathbf D_m=\frac{\sqrt{P_t}\widetilde{\mathbf D}_m}{\left\|\boldsymbol\Theta\mathbf S\mathbf F_m\widetilde{\mathbf D}_m\right\|_F}.\tag{37}
$$

FC 架构下求解问题（15）的完整 PWMMSE 算法总结于算法 2。所有变量顺序更新，每次更新使用最新值。算法 1 中更新 $\mathbf A$、$\boldsymbol\Theta$、$\mathbf S$ 的复杂度依次为 $O\left(PN_{\mathrm{RF}}\left((PN_{\mathrm{RF}})^2+PN_{\mathrm{RF}}N_t+MK(N_{\mathrm{RF}}+N_t)\right)\right)$、$O(PN_{\mathrm{RF}}N_t)$ 与 $O(PN_{\mathrm{RF}}N_t)$；算法 2 中更新 $\mu_m$、$\omega_m$、$\mathbf W_m$、$\mathbf D_m$ 的复杂度依次为 $O(MKN_t)$、$O(MKN_t)$、$O\left(MN_t(N_t^2+KN_t+(PN_{\mathrm{RF}})^2+KN_{\mathrm{RF}})\right)$ 与 $O\left(MN_{\mathrm{RF}}\left(P^2N_{\mathrm{RF}}N_t+K(N_{\mathrm{RF}}+N_t)\right)\right)$。

尽管算法 2 通过固定 $\lambda$ 的算法 1 形成嵌套优化结构，它仍遵循 BCD 框架：每轮迭代中 $\mu_m$、$\omega_m$、$\mathbf W_m$、$\mathbf D_m$ 均用相应闭式最优解更新；在模拟波束赋形优化中，算法 1 保证子问题（25）优化过程中目标值不降——$\mathbf A$ 的更新有最优闭式解，而耦合变量 $\mathbf S$ 与 $\boldsymbol\Theta$ 通过精确离散搜索与相位对齐联合优化。因此每次块更新要么精确优化对应子问题、要么提升目标值。由于目标在发射功率约束下有上界，所提算法在目标值意义下收敛并达到**坐标最优解**：在其余变量固定时，没有变量块能进一步改进目标。

### C. 子连接架构的求解

对 SC 架构，PWMMSE 方法同样可求解问题（15）。可证明固定 $\boldsymbol\Theta$ 与 $\mathbf S$ 时，$\mu_m$、$\omega_m$、$\mathbf W_m$、$\mathbf D_m$ 可分别用（21）（22）（24）（37）更新；因此本小节聚焦关于 $\boldsymbol\Theta$ 与 $\mathbf S$ 的子问题：

$$
\min_{\boldsymbol\Theta,\mathbf S}\ \left\|\mathbf W_m-\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2\tag{38a}
$$
$$
\text{s.t.}\quad(15b),\ (15c).\tag{38b}
$$

此处仍忽略功率约束，因为 SC 架构下（15d）左端等于 $\frac{N_t}{N_{\mathrm{RF}}}\left\|\mathbf D_m\right\|_F^2$，与 $\boldsymbol\Theta$、$\mathbf S$ 无关。与 FC 架构不同，SC 架构中 $\boldsymbol\Theta$ 为分块对角阵，利用该结构可直接求解问题（38）而无需引入额外辅助变量。问题（38）的目标可重写为

$$
(38a)=\sum_{m=1}^{M}\operatorname{Tr}\left\{\mathbf W_m\mathbf W_m^H+\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\left(\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right)^H\right\}-2\sum_{m=1}^{M}\operatorname{Re}\left\{\operatorname{Tr}\left\{\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\mathbf W_m^H\right\}\right\}.\tag{39}
$$

基于 SC 架构中 $\boldsymbol\Theta$ 与 $\mathbf S$ 的结构，可证 $\operatorname{Tr}\{\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m(\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m)^H\}=\frac{N_t}{N_{\mathrm{RF}}}\operatorname{Tr}\{\mathbf D_m\mathbf D_m^H\}$，与 $\boldsymbol\Theta$、$\mathbf S$ 无关。于是得到等价问题

$$
\max_{\boldsymbol\Theta,\mathbf S}\ \sum_{m=1}^{M}\operatorname{Re}\left\{\operatorname{Tr}\left\{\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\mathbf W_m^H\right\}\right\}\tag{40a}
$$
$$
\text{s.t.}\quad(15b).\tag{40b}
$$

**算法 3**　SC 架构的 PWMMSE 方法

1: **输入**：$\mathbf h_{m,k}$、$\boldsymbol\tau$、$N_t$、$N_{\mathrm{RF}}$、$M$、$K$、$P$、$P_t$、$\lambda>0$。
2: 初始化 $\mu_m$、$\omega_m$、$\mathbf W_m$、$\boldsymbol\Theta$、$\mathbf S$、$\mathbf D_m$。
3: **repeat**
4: 　按（21）更新 $\mu_m$；
5: 　按（22）更新 $\omega_m$；
6: 　按（24）更新 $\mathbf W_m$；
7: 　按（43）更新 $\mathbf S$；
8: 　按（44）更新 $\boldsymbol\Theta$；
9: 　按（37）更新 $\mathbf D_m$；
10: **until** 问题（20）目标值的相对上升低于阈值；
11: **输出**：最优 $\boldsymbol\Theta$、$\mathbf S$ 与 $\mathbf D_m$。

令 $\mathbf W_m=\left[\mathbf W_{m,1}^T,\ldots,\mathbf W_{m,N_{\mathrm{RF}}}^T\right]^T$、$\mathbf D_m=\left[\tilde{\mathbf d}_{m,1}^T,\ldots,\tilde{\mathbf d}_{m,N_{\mathrm{RF}}}^T\right]^T$，经简单推导可得

$$
(40a)=\sum_{n=1}^{N_{\mathrm{RF}}}\sum_{p=1}^{P}\operatorname{Re}\left\{\mathbf S_n(p,:)\mathbf B_{n,p}^H\boldsymbol\theta_{n,p}\right\},\tag{41}
$$

其中

$$
\mathbf B_n=\left(\sum_{m=1}^{M}\mathbf f_m\tilde{\mathbf d}_{m,n}\mathbf W_{m,n}^H\right)^H=\left[\mathbf B_{n,1}^T,\ldots,\mathbf B_{n,P}^T\right]^T.\tag{42}
$$

可见（41）与（32）形式相同，唯一区别是矩阵 $\mathbf A_n$ 与 $\mathbf B_n$。因此最优 $\boldsymbol\Theta$ 的解为

$$
\mathbf S_n(p,q)=\begin{cases}1,&q=\arg\max_i\left\|\mathbf B_{n,p}(:,i)\right\|_1,\\0,&\text{否则},\end{cases}\tag{43}
$$

$$
\boldsymbol\theta_{n,p}=e^{j\angle\left(\mathbf B_{n,p}\mathbf S_n(p,:)^T\right)}.\tag{44}
$$

## IV. 低复杂度启发式波束赋形方法

本节为避免 PWMMSE 的高计算开销与对完整 CSI 的要求，提出一种针对所提 FTTD 混合架构定制的低复杂度启发式波束赋形策略。与常规连续优化不同，此处的核心挑战在于处理 FTTD 开关网络的离散约束。为此把问题解耦为两个顺序阶段：1）**基于几何的模拟波束赋形器设计**，显式选择 FTTD 以补偿空间宽带效应；2）基于所得低维等效信道的**数字波束赋形器优化**。该顺序框架沿用了 [29] 的启发式两阶段（HTS）概念，但由于 FC 与 SC 结构下 FTTD 架构施加的严格二元约束，本文的表述与 [29] 本质不同。

### A. 模拟波束赋形器设计

实际近场系统中，在超大规模阵列上获取完整 CSI 往往计算上难以承受；作为替代，粗粒度用户位置信息——具体为角度—距离对 $(\vartheta_{k,1},r_{k,1})$——可通过低开销的近场波束训练或跟踪协议高效获得 [33]–[35]。利用这些几何数据，模拟阶段的主要目标是**最大化与每个用户主导 LoS 路径对齐的阵列增益**，从而在基带处理前于模拟域补偿频率相关相移。特别地，每条 RF 链被分配服务特定用户，相应模拟波束赋形器在离散 FTTD 选择约束下被配置为使工作带宽内接收功率最大。我们假设由位置估计或波束训练得到的几何参数与实际用户位置完全匹配，以建立性能上界；以下推导聚焦 FC 架构，可直截了当地扩展到 SC 场景。

假设用户 $k$ 由第 $n$ 条 RF 链服务，则接收信号为

$$
\bar y_{m,k}=\mathbf h_{m,k}\boldsymbol\Theta_n\mathbf S_n\mathbf f_mx_m+\mathbf n_{m,k}=\alpha_{m,k}^{\mathrm{LoS}}e^{-j2\pi f_m\frac{r_{k,1}}{c}}\mathbf a\left(f_m,\vartheta_{k,1},r_{k,1}\right)^T\boldsymbol\Theta_n\mathbf S_n\mathbf f_mx_m+\mathbf n_{m,k},\tag{45}
$$

其中 $x_m$ 表示第 $n$ 条 RF 链上的信号；下文为记号简便省略 $\vartheta_{k,1}$ 与 $r_{k,1}$ 的下标。第 $m$ 个子载波上的归一化模拟波束赋形增益为

$$
G\left(f_m\right)=\frac{1}{N_t}\left|\mathbf a\left(f_m,\vartheta,r\right)^T\boldsymbol\Theta_n\mathbf S_n\mathbf f_m\right|.\tag{46}
$$

为最大化归一化波束赋形增益，理想情况下模拟波束赋形器 $\boldsymbol\Theta_n\mathbf S_n\mathbf f_m$ 应与导向矢量 $\mathbf a(f_m,\vartheta,r)$ 对齐，即 $\boldsymbol\Theta_n\mathbf S_n\mathbf f_m$ 第 $i$ 个元素的相位应在所有子载波上等于 $e^{-j2\pi f_mt(i,\vartheta,r)}$。然而受硬件限制，一般找不到在所有子载波上满足该等式的 $\boldsymbol\Theta_n$ 与 $\mathbf S_n$；下面设计二者以近似该等式。

记 $\tau_{\min}$ 与 $\tau_{\max}$ 为 LoS 路径由 $\vartheta$ 与 $r$ 确定的最小与最大相对时延（$\tau_{\min}$ 通常设为 0）。假设 FTTD 时延正是按这些值配置的，时延向量 $\boldsymbol\tau$ 配置为

$$
\tau_p=\left(p-\frac12\right)\Delta,\qquad\forall p=1,\ldots,P,\tag{47}
$$

其中 $\Delta=(\tau_{\max}-\tau_{\min})/P$ 为相邻 FTTD 的时延差。记 $t_p$ 为第 $p$ 个子阵中心的时延、$t_{p,i}$ 为第 $p$ 个子阵第 $i$ 个天线的时延：

$$
t_p=t\left(\left(p-\frac12\right)\frac{N_t}{P}+\frac12,\vartheta,r\right),\qquad\forall p=1,\ldots,P,\tag{48}
$$

$$
t_{p,i}=t\left(i+(p-1)\frac{N_t}{P},\vartheta,r\right),\qquad\forall p=1,\ldots,P,\ i=1,\ldots,\frac{N_t}{P}.\tag{49}
$$

记 $\tilde\tau_p$ 为第 $p$ 个子阵所选时延，按第 $p$ 个子阵中心时延与 FTTD 时延之间的最小欧氏距离选取：

$$
\tilde\tau_p=\arg\min_{\tau\in\{\tau_1,\ldots,\tau_P\}}\left|\tau-t_p\right|.\tag{50}
$$

$\mathbf S_n$ 的非零元由 $\tilde\tau_p$ 与 $\boldsymbol\tau$ 的取值确定：

$$
\mathbf S_n(p,q)=\begin{cases}1,&\tilde\tau_p=\tau_q,\\0,&\text{否则},\end{cases}\qquad\forall q=1,\ldots,P.\tag{51}
$$

$\mathbf S_n$ 确定后，子阵内不同天线之间仍存在时延差。由于移相器频率无关，PS 的对齐以中心频率为准：

$$
\theta_{n,p}(i)=e^{-j2\pi f_c\left(t_{p,i}-\tilde\tau_p\right)}.\tag{52}
$$

$\boldsymbol\Theta_n$ 与 $\mathbf S_n$ 均确定后，可得归一化增益：

$$
G\left(f_m\right)=\frac{1}{N_t}\left|\sum_{p=1}^{P}\sum_{i=1}^{\frac{N_t}{P}}e^{j2\pi\left(f_m-f_c\right)\left(t_{p,i}-\tilde\tau_p\right)}\right|\overset{(a)}{\approx}\frac{1}{N_t}\left|\sum_{p=1}^{P}e^{j2\pi\left(f_m-f_c\right)\left(t_p-\tilde\tau_p\right)}\sum_{i=1}^{\frac{N_t}{P}}e^{j2\pi\left(f_m-f_c\right)\left(t_{p,i}-t_p\right)}\right|\overset{(b)}{\approx}\frac{1}{P}\left|\sum_{p=1}^{P}e^{j2\pi\left(f_m-f_c\right)\left(-\frac{\Delta}{2}+(p-1)\frac{\Delta}{P}\right)}\Xi_{\frac{N_t}{P}}\left(\gamma_m\right)\right|=\Xi_P\left(2\left(f_m-f_c\right)\frac{\Delta}{P}\right)\Xi_{\frac{N_t}{P}}\left(\gamma_m\right),\tag{53}
$$

其中 $\gamma_m=\frac{f_m-f_c}{f_c}\sin\vartheta$，$\Xi_N(x)=\frac{\sin N\pi x/2}{N\sin\pi x/2}$ 为 Dirichlet sinc 函数。步骤 (a) 假设子阵内时延差为线性的，因为子阵孔径远小于整个阵列；由（49）（52）可见 $\left|t_p-\tilde\tau_p\right|\le\frac{\Delta}{2}$。步骤 (b) 假设所有 $t_p-\tilde\tau_p$ 均匀分布在区间 $\left[-\frac{\Delta}{2},\frac{\Delta}{2}\right)$ 上。

基于归一化阵列增益可确定有效缓解空间宽带效应所需的**最少 FTTD 数**。给定小于 1 的正阈值 $\eta$，保证 $G(f_m)\ge\eta$ 的最小 $P$ 可由下式求得：

$$
\min_P\ P\quad\text{s.t.}\quad\Xi_P\left(2\left(f_m-f_c\right)\frac{\Delta}{P}\right)\Xi_{\frac{N_t}{P}}\left(\gamma_m\right)\ge\eta.\tag{54}
$$

例如考虑 $N_t=512$ 阵元、带宽 $B=10$ GHz、中心频率 $f_c=100$ GHz、用户位于 $\vartheta=45^\circ$、$r=20$ m 的场景；取阈值 $\eta=0.8$ 时分析表明需 $P\ge35$ 个 FTTD。就平均性能而言，FTTD 数可大幅减少（见第 V 节数值结果）。

当 FTTD 按用户几何信息精确配置时，所提模拟波束赋形设计具有闭式解。对几何信息失配的用户，所提方法仍保持稳定性能，下节将详细分析。实践中可沿时延差异较大的位置适当配置 FTTD，以扩展有效覆盖范围。

### B. 数字波束赋形器设计

模拟波束赋形器确定后，等效信道维数显著降低。此时第 $k$ 个用户的接收信号可重写为

$$
\mathbf y_{m,k}=\tilde{\mathbf h}_{m,k}\mathbf D_m\mathbf s_m+\mathbf n_{m,k},\tag{55}
$$

其中 $\tilde{\mathbf h}_{m,k}=\mathbf h_{m,k}\boldsymbol\Theta\mathbf S\mathbf F_m$ 为等效信道，只有 $N_{\mathrm{RF}}$ 维，可通过信道估计高效获得。随后可优化数字波束赋形器以最大化等效信道的谱效：

$$
\max_{\mathbf D_m}\ \sum_{m=1}^{M}\sum_{k=1}^{K}\log\left(1+\tilde\beta_{m,k}\right)\tag{56a}
$$
$$
\text{s.t.}\quad\left\|\boldsymbol\Theta\mathbf S\mathbf F_m\mathbf D_m\right\|_F^2\le P_t,\ \forall m,\tag{56b}
$$

其中

$$
\tilde\beta_{m,k}=\frac{\left|\tilde{\mathbf h}_{m,k}\mathbf d_{m,k}\right|^2}{\sum_{i=1,i\neq k}^{K}\left|\tilde{\mathbf h}_{m,k}\mathbf d_{m,i}\right|^2+\sigma_{m,k}^2}.\tag{57}
$$

上述问题化为低维和速率最大化，可用所提 PWMMSE 方法高效求解（以 $\mathbf D_m$ 为唯一优化变量），相应推导直接来自第 III 节表述，故不再重复。整体启发式策略总结于算法 4。相比 PWMMSE，所提启发式方法避免了对大维变量反复求逆，并消除了对完整 CSI 的要求；因此其计算复杂度随天线数增长较有利，特别适合超大规模近场系统。此外，如第 V 节所示，该方案性能接近 PWMMSE。

**算法 4**　低复杂度启发式波束赋形方法

1: **输入**：FTTD 配置 $\boldsymbol\tau$、用户几何信息 $\{\vartheta_k,r_k\}$（$\forall k$）、发射功率 $P_t$。
2: **for** $n=1,\ldots,N_{\mathrm{RF}}$ **do**
3: 　确定第 $n$ 条 RF 链所服务的用户与波束赋形位置 $(\hat\vartheta_n,\hat r_n)$；
4: 　按（51）（52）构造模拟波束赋形器 $\mathbf S_n$ 与 $\boldsymbol\Theta_n$；
5: **end for**
6: 估计等效信道 $\tilde{\mathbf h}_{m,k}$（$\forall m,k$）；
7: 通过求解（56）优化数字波束赋形器 $\mathbf D_m$（$\forall m$）；
8: **输出**：$\boldsymbol\Theta$、$\mathbf S$ 与 $\mathbf D_m$。

## V. 数值结果

本节给出仿真结果以验证所提 PWMMSE 与启发式方法的有效性。仿真参数配置如下：BS 配备 $N_t=512$ 阵元、$N_{\mathrm{RF}}=4$ 条 RF 链，每条 RF 链连接 $P=16$ 个 FTTD。FTTD 的时延按 $\vartheta=45^\circ$、$r=20$ m 的位置配置；注意该点仅作为 FTTD 的设计参考以保持均衡适中的时延范围，并非意味着该架构只能服务该特定位置的用户。系统中心频率 $f_c=100$ GHz、带宽 $B=10$ GHz、子载波数 $M=16$；$K=4$ 个用户随机分布在距 BS 10—30 m 范围内，AoD 在 $-60^\circ$ 到 $60^\circ$ 间均匀分布。BS 与每个用户之间的信道路径数 $L_k=3$，路径损耗指数 $\xi=2$，分子吸收系数 $\kappa(f)=5.157\times10^{-4}$ dB/m [30], [31]；噪声功率谱密度 $-174$ dBm/Hz。PWMMSE 的收敛阈值取 $10^{-3}$，惩罚因子 $\lambda=10$（性能在 1—100 范围内对 $\lambda$ 不敏感）；算法 1 的惩罚因子初值 $\rho=10^{-3}$、缩放因子 $c=2$。PWMMSE 的优化变量以启发式方法初始化以保证良好性能。以下结果对 100 次独立信道实现取平均。

比较考虑四个基准：1）**全数字波束赋形**：每根天线配备专用 RF 链，实现全维频率相关波束赋形，提供上界；全数字波束赋形器可用 [32], [36], [37] 的方法优化；2）**基于 TTD 的波束赋形**：用 TTD 设计波束赋形架构 [29]；3）**传统波束赋形**：用频率无关 PS 设计模拟波束赋形器；4）**DS-FTTD**：用 FTTD 与开关网络设计模拟波束赋形器 [28]。

### A. 收敛性与复杂度

图 2 展示所提迭代算法的收敛行为。为评估计算效率，我们报告理论计算复杂度与在 Intel Core i7 CPU、16 GB RAM 工作站上测得的 CPU 时间，结果汇总于表 I，其中 $I_{\mathrm{out}}$ 与 $I_{\mathrm{in}}$ 分别表示外迭代与内迭代次数；为简洁，复杂度表达式只保留主导阶项。对 TTD-PNF 方法、所提启发式方案与基于 PS 的基线，模拟波束赋形分量在迭代优化前经离线启发式设计获得，因此计算复杂度分析只包含数字域优化，因为模拟分量不涉及迭代更新、不贡献每轮迭代的计算代价。如表 I 所示，所提启发式方法通过避免联合优化取得显著更低的计算复杂度；此外 SC 架构因结构化模拟波束赋形设计降低了优化维数，其 CPU 时间低于 FC 架构。

### B. 所提启发式模拟波束赋形的评估

将所提方法与四种宽带模拟波束赋形方案比较：1）**TTD-PNF** [29]：用分段近场（PNF）近似以 TTD 设计模拟波束赋形器；2）**均值信道矩阵（MCM）** [16]：用 PS 基于所有子载波上的平均阵列响应设计模拟波束赋形器；3）**中心频率（CF）波束赋形**：用 PS 基于中心频率处的阵列响应设计；4）**DS-FTTD 波束赋形**：用 FTTD 与开关网络设计。考虑位于 $r=20$ m、$\vartheta=45^\circ$ 的单用户，FTTD 时延按（50）依 $r$ 与 $\vartheta$ 精确配置。

图 3(a) 展示所提启发式方法在不同频率下的归一化阵列增益。与因空间宽带效应出现严重增益损失的基于 PS 的架构不同，所提基于 FTTD 的方案保持稳定性能；值得注意的是，尽管 TTD-PNF 用连续时延在每个子载波上完美匹配相位，我们的 FTTD 方法虽只用离散时延，却取得几乎相同的缓解效果——这验证了高分辨率连续时延并非空间宽带补偿的严格必要条件。相反，仅依赖 FTTD 与开关网络做延迟补偿的 DS-FTTD 方案性能严重退化，原因是在缺少 PS 相位调整时，不可避免的残余时延误差无法被有效补偿。图 3(b) 进一步评估多用户场景下所提启发式方法在不同用户 AoD 下的归一化阵列增益：$K=4$ 个用户位于不同角度、与 BS 距离固定为 20 m（性能对距离相对不敏感）；结果表明，尽管 FTTD 时延按特定 $\vartheta$、$r$ 固定，所提方法仍保证每个用户取得可观的阵列增益。

### C. 谱效与发射功率

图 4 展示不同方案的可达谱效随发射功率 $P_t$ 的变化。可以看到，FC 架构下的 PWMMSE 方法仅用有限个 FTTD 即取得接近全数字方案的性能；依赖部分 CSI 设计模拟波束赋形器的启发式方法相比 PWMMSE 性能损失可忽略。此外，所提基于 FTTD 的架构虽只用有限个离散时延，在 FC 与 SC 两种情形下性能均接近基于 TTD 的架构，同时显著优于基于 PS 的架构。值得注意的是 DS-FTTD 方案性能劣于其他方案：离散延迟元件只能提供粗延迟补偿，缺少 PS 相位调整时残余延迟失配无法被有效缓解。

### D. 谱效与能效对 FTTD 数与天线数

图 5(a) 展示每条 RF 链的 FTTD 数 $P$ 对系统谱效的影响：FC 架构下性能随 FTTD 数增加逐渐逼近最优全数字方案，该改善归因于 FTTD 数增加增强了对空间宽带效应的缓解；SC 架构下该趋势较不明显，因为每条 RF 链只覆盖部分天线、空间宽带效应较弱。此外可观察到饱和现象：当 $P$ 超过 16 后谱效改善减小，因为子阵的延迟补偿误差变得可忽略。

图 5(b) 进一步说明 FTTD 数对**能效**（定义为谱效与功耗之比）的影响。采用的功耗模型为：$P_{\mathrm{BB}}=300$ mW、$P_{\mathrm{RF}}=200$ mW、$P_{\mathrm{PS}}=20$ mW、$P_{\mathrm{TTD}}=100$ mW [21]、$P_{\mathrm{FTTD}}=30$ mW、$P_{\mathrm{SW}}=10$ mW [28]，分别表示基带处理、一条 RF 链、一个 PS、一个 TTD、一个 FTTD 与一个开关的功耗。如图 5(b) 所示，FC 情形下当 $P\ge16$ 时基于 FTTD 的架构能效高于基于 TTD 与仅 PS 的架构，此时谱效已接近并保持靠近其上界。例如 $P=32$ 时，基于 FTTD 的 SC 架构相比基于 TTD 的架构能效提升 14%。SC 架构的能效比 FC 更早达到峰值，因为其子阵孔径较小、空间宽带效应较弱。此外，由于 FTTD 功耗更低，在 FC 与 SC 两种情形下达到峰值后，所提 FTTD 架构随延迟模块数增加时能效退化小于 TTD 架构。DS-FTTD 方案在 FC 架构下能效相对较高，主要归因于其通过消除大规模 PS 网络降低了功耗；相反在 SC 架构下，尽管模拟波束赋形网络规模减小使总功耗降低，DS-FTTD 的可达谱效显著低于其他方案，节电带来的能效提升被谱效损失抵消，导致总体能效更低。

图 6 展示天线数 $N_t$ 对谱效与能效的影响，其中每条 RF 链的 FTTD 数随之调整为 $P=N_t/32$。随天线数增加，基于 FTTD 架构的谱效持续提升并逐渐接近 TTD 方法，而基于 PS 的架构性能增益很小；此外所提 FTTD 架构在 FC 与 SC 两种架构下能效均优于 TTD 方法。图 7 进一步评估严格硬件预算（$P$ 固定为 16）下的可扩展性：当 $N_t$ 从 512 增至 1024 时，FC 架构出现性能分化，而 SC 架构谱效保持稳定上升趋势。SC 架构不仅提供更优能效，还表现出对硬件资源稀缺的显著鲁棒性。

### E. 消融与敏感性分析

图 8 评估惩罚因子 $\lambda$（从 1 到 100 变化）对系统性能的影响：可达谱效在较宽的 $\lambda$ 范围内保持相对稳定，表明所提算法对惩罚参数选择不敏感；同时惩罚项随 $\lambda$ 增大单调减小并趋于足够小的值，说明优化变量逐步满足所施加的硬件约束。这些观察表明，适中的 $\lambda$ 足以在实践中取得收敛行为与约束满足之间的良好平衡。

图 9 评估开关网络对谱效的影响。首先，尽管前述仿真假设理想开关，此处评估 1 dB 开关插入损耗（按当前 THz 技术 [38]，单个开关损耗通常小于 1 dB）：在 FC 与 SC 架构下，理想情形与损耗情形的性能差距极小（所有发射功率区间恶化小于 3%）。其次，为验证开关网络的必要性，我们评估无开关网络的情形（每个子阵静态连接到基于 FTTD 的延迟网络）：谱效相比所提方案明显下降。该性能损失归因于缺少动态切换能力，失去在不同子阵间动态选择与分配延迟元件的灵活性，形成固定的延迟分配结构；因此模拟波束赋形器无法有效补偿空间宽带效应，产生残余延迟失配并使波束赋形性能退化。这些结果说明开关网络的重要性——它提供灵活的延迟分配并显著增强波束赋形的有效性。

图 10 进一步评估最大时延的影响。记 $T_{\max}$ 为阵列的最大时延，FC 架构下 $T_{\max}=N_t/(2f_c)$、SC 架构下 $T_{\max}=N_t/(2f_cN_{\mathrm{RF}})$；FTTD 阵列的最大时延设为 $\tau_{\max}=\delta T_{\max}$。如图 10 所示，FC 与 SC 架构下谱效都随 $\delta$ 先增后减，原因在于延迟覆盖与量化分辨率之间的权衡：$\delta$ 过小导致延迟范围不足，$\delta$ 过大导致延迟间隔变粗。基于该观察，我们选择 $\theta=45^\circ$、$r=20$ m 的代表性用户位置，对应 $\delta\in[0.6,0.8]$，在硬件开销与系统性能间取得良好平衡。

### F. 硬件损伤与非完美 CSI 的影响

图 11 评估不同 PS 量化位数（1—6 位）下所提方法的谱效：谱效随量化分辨率提高而增加并逐渐饱和，其中 3 位分辨率已足以达到接近上界的性能。这表明所提联合优化框架对相位量化误差鲁棒，说明在宽带 THz 系统中支持空间复用并不严格要求高分辨率移相器。

图 12 评估不同时延分辨率下所提方法的谱效，其中 0 ps 分辨率作为理想连续延迟基准。可以看到，当时延分辨率在 100 ps 以内时系统性能退化可忽略，只有分辨率变粗到 100—200 ps 范围时才出现明显性能下降。考虑到当前最先进 THz 延迟线的时延分辨率通常小于 20 ps [39], [40]，所提联合优化框架对时延量化误差具有较大容限。

由于实际系统难以获得完美 CSI，我们评估非完美 CSI 对所提架构谱效的影响，用误差因子 $\epsilon$ 建模 CSI 不确定性，估计信道为 [28]

$$
\hat{\mathbf h}_{m,k}=\sqrt{1-\epsilon^2}\mathbf h_{m,k}+\mathbf u_{m,k}\epsilon\mathbf e_{m,k},\tag{58}
$$

其中 $\mathbf e_{m,k}\sim\mathcal{CN}(0,1)$ 表示归一化估计误差。如图 13(a) 所示，谱效随 $\epsilon$ 增大而下降，原因是信道估计精度退化；但不同 CSI 精度下所提方案与全数字架构的性能差距保持相对稳定，说明所提设计的鲁棒性。我们进一步评估不精确用户位置信息对所提架构谱效的影响：实际通信中由于定位误差与环境不确定性，难以获得精确用户位置；为建模位置不确定性，设估计位置为真实位置叠加高斯噪声，即 $\mathbf p=[x,y]^T$ 为真实位置，估计位置 $\hat{\mathbf p}=\mathbf p+\mathbf e$，误差向量 $\mathbf e$ 服从零均值、协方差 $\sigma_p^2\mathbf I$ 的高斯分布。如图 13(b) 所示，谱效随位置误差方差增大而下降，因为不精确的用户位置导致波束失准并削弱近场传输的波束聚焦，能量泄漏降低可达阵列增益。有趣的是，在较大位置不确定性下，所提 FTTD 辅助混合架构可优于全数字基准：这归因于两种架构对估计误差的敏感度不同——全数字方案提供更高空间自由度，但其高度定向的波束图样对波束失准更敏感；相反，所提架构因离散且受约束的波束赋形结构而对估计误差敏感度较低。

### G. 谱效与带宽、用户数

图 14 展示系统带宽 $B$ 对谱效的影响。为保证公平比较，发射功率 $P_t$ 随带宽缩放以保持恒定信噪比。可以看到，当带宽从 5 GHz 扩展到 30 GHz 时 FC 架构性能急剧下降，而 SC 架构对带宽扩展表现出更优抵抗力。SC 架构对阵列扩展与带宽扩展的鲁棒性可用（53）中的阵列增益表达式解释：阵列增益受延迟步长 $\Delta$ 与频率偏移 $(f_m-f_c)$ 影响。FC 架构中每条 RF 链管理整个阵列孔径，随 $N_t$ 增大有效延迟分辨率不足；相反 SC 架构把阵列划分为 $N_{\mathrm{RF}}$ 个子阵，有效减小每条 RF 链的孔径并提高延迟补偿精度。此外，$\Delta$ 对相位误差的影响随频率偏移 $(f_m-f_c)$ 缩放；由于子阵孔径更小，SC 架构的相位误差随频率累积更慢，从而在更宽带宽上对空间宽带效应具有更强抵抗力。

图 15 评估不同用户数下系统性能（$K=2,4,8$）。为保证足够空间复用能力，RF 链数相应调整为 $N_{\mathrm{RF}}=K$，其他系统参数不变。如图 15 所示，随用户数增加系统谱效相应增加，因为同时服务更多用户能更有效利用可用空间复用增益；但所提方案与全数字方案的性能差距随用户数增加而变大，因为用户间干扰更严重。尽管如此，所提方案在多用户场景下仍保持优越性能。

## VI. 结论

本文研究了近场宽带 THz 多用户系统的混合波束赋形设计。为在性能与硬件成本间取得平衡，提出了基于 FTTD 的架构。针对由此产生的混合整数优化挑战，提出 PWMMSE 方法与低复杂度启发式方法。数值结果表明，所提 FTTD 方案仅用有限个 FTTD 即可有效缓解空间宽带效应；所提 FTTD 方案取得与 TTD 方案相当的谱效，同时提供更高能效；SC 架构更具能效，且对天线阵列扩展与带宽扩展更鲁棒。这些发现表明 TTD 可被 FTTD 有效替代，而 SC 架构可作为 THz 通信更可持续、更具成本效益的范式。

## 表格

**表 I　不同方案的复杂度与 CPU 时间比较**（按原表逐格转录；仅保留主导阶项；$I_{\mathrm{out}}$、$I_{\mathrm{in}}$ 分别为外、内迭代次数）

| 方案 | 复杂度 | CPU 时间（ms） |
| --- | --- | --- |
| 全数字 | $O\left(I_{\mathrm{out}}MN_t^3\right)$ | 241.5 |
| FC-PWMMSE | $O\left(I_{\mathrm{out}}\left(MN_t^3+I_{\mathrm{in}}\left(PN_{\mathrm{RF}}\right)^2N_t\right)\right)$ | 543.1 |
| SC-PWMMSE | $O\left(I_{\mathrm{out}}\left(MN_t^3+\left(PN_{\mathrm{RF}}\right)^2\right)\right)$ | 467.4 |
| DS-FTTD | $O\left(I_{\mathrm{out}}MKPN_{\mathrm{RF}}N_t\right)$ | 48.0 |
| FC-TTD | $O\left(I_{\mathrm{out}}\left(MN_{\mathrm{RF}}^3+KN_{\mathrm{RF}}^2\right)\right)$ | 3.2 |
| SC-TTD | $O\left(I_{\mathrm{out}}\left(MN_{\mathrm{RF}}^3+KN_{\mathrm{RF}}^2\right)\right)$ | 5.0 |
| FC-Heuristic | $O\left(I_{\mathrm{out}}\left(MN_{\mathrm{RF}}^3+KN_{\mathrm{RF}}^2\right)\right)$ | 3.7 |
| SC-Heuristic | $O\left(I_{\mathrm{out}}\left(MN_{\mathrm{RF}}^3+KN_{\mathrm{RF}}^2\right)\right)$ | 3.2 |
| FC-PS | $O\left(I_{\mathrm{out}}\left(MN_{\mathrm{RF}}^3+KN_{\mathrm{RF}}^2\right)\right)$ | 5.7 |
| SC-PS | $O\left(I_{\mathrm{out}}\left(MN_{\mathrm{RF}}^3+KN_{\mathrm{RF}}^2\right)\right)$ | 7.9 |

**表 II　各方案功耗**（按原表逐格转录）

| 方案 | 功耗 |
| --- | --- |
| 全数字 | $P_t+P_{\mathrm{BB}}+N_tP_{\mathrm{RF}}$ |
| FC-TTD | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+PN_{\mathrm{RF}}P_{\mathrm{TTD}}+N_tN_{\mathrm{RF}}P_{\mathrm{PS}}$ |
| FC-FTTD | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+PN_{\mathrm{RF}}P_{\mathrm{FTTD}}+PN_{\mathrm{RF}}P_{\mathrm{SW}}+N_tN_{\mathrm{RF}}P_{\mathrm{PS}}$ |
| FC-PS | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+N_tN_{\mathrm{RF}}P_{\mathrm{PS}}$ |
| SC-TTD | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+PN_{\mathrm{RF}}P_{\mathrm{TTD}}+N_tP_{\mathrm{PS}}$ |
| SC-FTTD | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+PN_{\mathrm{RF}}P_{\mathrm{FTTD}}+PN_{\mathrm{RF}}P_{\mathrm{SW}}+N_tP_{\mathrm{PS}}$ |
| SC-PS | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+N_tP_{\mathrm{PS}}$ |
| DS-FTTD | $P_t+P_{\mathrm{BB}}+N_{\mathrm{RF}}P_{\mathrm{RF}}+PN_{\mathrm{RF}}P_{\mathrm{FTTD}}+N_tP_{\mathrm{SW}}$ |

## 图注与表注

**图 1**：基于 FTTD 的混合波束赋形架构（(a) 全连接架构；(b) 子连接架构）。
**图 2**：所提算法的收敛行为（FC-PWMMSE 与 SC-PWMMSE 的目标值随迭代次数变化）。
**图 3**：跨频率的归一化阵列增益（(a) 不同频率下所提启发式方法；(b) 多用户不同 AoD 下的归一化阵列增益）。
**图 4**：谱效与发射功率的关系。
**图 5**：谱效与能效随每条 RF 链延迟模块数的变化。
**图 6**：谱效与能效随天线数的变化（自适应延迟模块数 $P=N_t/32$）。
**图 7**：谱效与能效随天线数的变化（固定延迟模块数 $P=16$）。
**图 8**：谱效与惩罚值随惩罚因子的变化。
**图 9**：开关网络对谱效的影响（谱效与发射功率的关系）。
**图 10**：谱效与最大时延 $\tau_{\max}=\delta T_{\max}$ 的关系。
**图 11**：谱效与量化位数的关系。
**图 12**：谱效与时延分辨率的关系。
**图 13**：非完美 CSI 与用户位置误差下的谱效。
**图 14**：谱效与带宽的关系。
**图 15**：谱效与用户数的关系。

**表注**：表 I、表 II 均已用 PyMuPDF 渲染原 PDF 第 10 页逐格核对；表 I 中复杂度表达式按原表保留主导阶项，CPU 时间为毫秒；表 II 功耗式中 $P_t$ 为发射功率项、其余为各硬件分量功耗。

## 参考文献

> 以下按原文编号 [1]—[40] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的连字与断行伪影已按常规写法整理，书目内容未改动。

[1] S. Sharma, P. K. Singya, K. Deka, C. Adjih, and M. Sharma, “Terahertz communication: State-of-the-art and future directions,” IEEE Open J. Commun. Soc., vol. 6, pp. 6281–6322, 2025.

[2] H. Zhang et al., “Terahertz sensing, communication, and networking: A survey,” IEEE Trans. Netw. Sci. Eng., vol. 13, pp. 501–521, 2026.

[3] M. Parvini, M. Qurratulain Khan, P. Schulz, and G. Fettweis, “An optimized OFDM waveform design for 6G industrial networks,” IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 17324–17338, Nov. 2024.

[4] W. Jiang et al., “Terahertz communications and sensing for 6G and beyond: A comprehensive review,” IEEE Commun. Surveys Tuts., vol. 26, no. 4, pp. 2326–2381, 4th Quart., 2024.

[5] NGMN Alliance, ITU-R Framework for IMT-2030: Review and Future Direction, NGMN Alliance, Düsseldorf, Germany, 2024.

[6] S. Thomas, J. Singh Virdi, A. Babakhani, and I. P. Roberts, “A survey on advancements in THz technology for 6G: Systems, circuits, antennas, and experiments,” IEEE Open J. Commun. Soc., vol. 6, pp. 1998–2016, 2025.

[7] M. Parvini, B. Banerjee, M. Q. Khan, T. Mewes, A. Nimr, and G. Fettweis, “A tutorial on wideband XL-MIMO: Challenges, opportunities, and future trends,” IEEE Open J. Commun. Soc., vol. 6, pp. 5509–5534, 2025.

[8] I. F. Akyildiz, C. Han, and S. Nie, “Combating the distance problem in the millimeter wave and terahertz frequency bands,” IEEE Commun. Mag., vol. 56, no. 6, pp. 102–108, Jun. 2018.

[9] D. Zhang, Y. Wang, X. Li, and W. Xiang, “Hybridly connected structure for hybrid beamforming in mmWave massive MIMO systems,” IEEE Trans. Commun., vol. 66, no. 2, pp. 662–674, Feb. 2018.

[10] D. Zhang, Y. Wang, and W. Xiang, “Leakage-based hybrid beamforming design for downlink multiuser mmWave MIMO systems,” in Proc. IEEE 28th Annu. Int. Symp. Pers., Indoor, Mobile Radio Commun. (PIMRC), Oct. 2017, pp. 1–5.

[11] E. Björnson et al., “Towards 6G MIMO: Massive spatial multiplexing, dense arrays, and interplay between electromagnetics and processing,” 2024, arXiv:2401.02844.

[12] Z. Wang et al., “Extremely large-scale MIMO: Fundamentals, challenges, solutions, and future directions,” IEEE Wireless Commun., vol. 31, no. 3, pp. 117–124, Jun. 2024.

[13] Z. Wang et al., “A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications,” IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1560–1605, 3rd Quart., 2024.

[14] Y. Zhang, Z. Yang, S. Yue, L. Liu, and B. Di, “Hybrid near-field and far-field XL-MIMO: How many users can be supported?” IEEE Commun. Lett., vol. 28, no. 10, pp. 2402–2406, Oct. 2024.

[15] H. Lu et al., “A tutorial on near-field XL-MIMO communications toward 6G,” IEEE Commun. Surveys Tuts., vol. 26, no. 4, pp. 2213–2257, 2024.

[16] Y. Chen, Y. Xiong, D. Chen, T. Jiang, S. X. Ng, and L. Hanzo, “Hybrid precoding for wideband millimeter wave MIMO systems in the face of beam squint,” IEEE Trans. Wireless Commun., vol. 20, no. 3, pp. 1847–1860, Mar. 2021.

[17] F. Gao, B. Wang, C. Xing, J. An, and G. Y. Li, “Wideband beamforming for hybrid massive MIMO terahertz communications,” IEEE J. Sel. Areas Commun., vol. 39, no. 6, pp. 1725–1740, Jun. 2021.

[18] M. Longbrake, “True time-delay beamsteering for radar,” in Proc. IEEE Nat. Aerosp. Electron. Conf. (NAECON), Dayton, OH, USA, Jul. 2012, pp. 246–249.

[19] M. Cui, L. Dai, Z. Wang, S. Zhou, and N. Ge, “Near-field rainbow: Wideband beam training for XL-MIMO,” IEEE Trans. Wireless Commun., vol. 22, no. 6, pp. 3899–3912, Jun. 2023.

[20] M. Monemi, M. Amir Fallah, M. Rasti, O. Yazdani, O. L. A. Lopez, and M. Latva-aho, “Beam squint mitigation in wideband hybrid beamformers: Full-TTD, sparse-TTD, or non-TTD?” 2025, arXiv:2506.19381.

[21] L. Dai, J. Tan, Z. Chen, and H. V. Poor, “Delay-phase precoding for wideband THz massive MIMO,” IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7271–7286, Sep. 2022.

[22] H. Ozen and G. M. Guvensen, “Interference and beam squint aware TTD-aided beamforming for dual wideband massive MIMO,” IEEE Wireless Commun. Lett., vol. 13, no. 1, pp. 64–68, Jan. 2024.

[23] C. Zhang, X. Wang, R. Jiang, T. Liu, and Y. Xu, “Wideband beamforming in near-field uniform planar array systems under TTD constraints,” in Proc. 16th Int. Conf. Wireless Commun. Signal Process. (WCSP), Oct. 2024, pp. 637–642.

[24] D. Q. Nguyen and T. Kim, “Joint delay and phase precoding under true-time delay constraints for THz massive MIMO,” in Proc. ICC - IEEE Int. Conf. Commun., May 2022, pp. 3496–3501.

[25] D. Q. Nguyen and T. Kim, “Joint delay-phase precoding under true-time delay constraints in wideband sub-THz hybrid massive MIMO systems,” IEEE Trans. Commun., vol. 72, no. 10, pp. 6633–6646, Oct. 2024.

[26] P.-H. Chang and T.-D. Chiueh, “Hybrid beamforming for wideband terahertz massive MIMO communications with low-resolution phase shifters and true-time-delay,” IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 8000–8012, Jul. 2024.

[27] L. Yan, C. Han, T. Yang, and J. Yuan, “Dynamic-subarray with fixed-true-time-delay architecture for terahertz wideband hybrid beamforming,” in Proc. IEEE Global Commun. Conf. (GLOBECOM), Dec. 2021, pp. 1–6.

[28] L. Yan, C. Han, and J. Yuan, “Energy-efficient dynamic-subarray with fixed true-time-delay design for terahertz wideband hybrid beamforming,” IEEE J. Sel. Areas Commun., vol. 40, no. 10, pp. 2840–2854, Oct. 2022.

[29] Z. Wang, X. Mu, and Y. Liu, “Beamfocusing optimization for near-field wideband multi-user communications,” IEEE Trans. Commun., vol. 73, no. 1, pp. 555–572, Jan. 2025.

[30] S. Tarboush et al., “TeraMIMO: A channel simulator for wideband ultra-massive MIMO terahertz communications,” IEEE Trans. Veh. Technol., vol. 70, no. 12, pp. 12325–12341, Dec. 2021.

[31] C. Zhang, H. Zhou, and Y.-C. Liang, “Near-field wideband beamforming for RIS-assisted THz communications with FTTDs,” IEEE Trans. Wireless Commun., vol. 24, no. 11, pp. 8969–8984, Nov. 2025.

[32] Q. Shi, M. Razaviyayn, Z.-Q. Luo, and C. He, “An iteratively weighted MMSE approach to distributed sum-utility maximization for a MIMO interfering broadcast channel,” IEEE Trans. Signal Process., vol. 59, no. 9, pp. 4331–4340, Sep. 2011.

[33] C. Wei, Z. Yang, J. Dang, P. Li, H. Wang, and X. Yu, “Accurate wideband channel estimation for THz massive MIMO systems,” IEEE Commun. Lett., vol. 27, no. 1, pp. 293–297, Jan. 2023.

[34] Y. Zhang, X. Wu, and C. You, “Fast near-field beam training for extremely large-scale array,” IEEE Wireless Commun. Lett., vol. 11, no. 12, pp. 2625–2629, Dec. 2022.

[35] K. Chen, C. Qi, C.-X. Wang, and G. Y. Li, “Beam training and tracking for extremely large-scale MIMO communications,” IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 5048–5062, May 2024.

[36] K. Shen and W. Yu, “Fractional programming for communication systems—Part II: Uplink scheduling via matching,” IEEE Trans. Signal Process., vol. 66, no. 10, pp. 2631–2644, May 2018.

[37] Y. Sun, P. Babu, and D. P. Palomar, “Majorization-minimization algorithms in signal processing, communications, and machine learning,” IEEE Trans. Signal Process., vol. 65, no. 3, pp. 794–816, Feb. 2017.

[38] P. Li, W. Wu, Y. Shi, Y. Deng, P. Fay, and L. Liu, “Broadband THz switching with extremely low insertion loss and superior isolation,” in IEEE MTT-S Int. Microw. Symp. Dig., Jun. 2023, pp. 688–691.

[39] A. Karakuzulu, M. H. Eissa, D. Kissinger, and A. Malignaggi, “Broadband 110–170 GHz true time delay circuit in a 130-nm SiGe BiCMOS technology,” in IEEE MTT-S Int. Microw. Symp. Dig., Aug. 2020, pp. 775–778.

[40] L. Schmitz and O. Saalmann, “Ka-band true time delay in a 130-nm SiGe-BiCMOS technology for phased-array applications,” in Proc. 20th Eur. Microw. Integr. Circuits Conf. (EuMIC), Sep. 2025, pp. 359–362.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（A 先前工作、B 动机与贡献、C 组织结构与记号）；第 II 节系统模型（A 信道模型，式（1）—（5）；B 天线架构，式（6）—（12），图 1；C 问题表述，式（13）—（15））；第 III 节 PWMMSE 方法（A 问题重构，式（16）—（20）；B FC 架构求解，式（21）—（37）、注 1、算法 1—2 与复杂度；C SC 架构求解，式（38）—（44）、算法 3）；第 IV 节低复杂度启发式方法（A 模拟波束赋形器设计，式（45）—（54）；B 数字波束赋形器设计，式（55）—（57）、算法 4）；第 V 节数值结果（A 收敛性与复杂度、B 启发式模拟波束赋形评估、C 谱效与发射功率、D 谱效与能效对 FTTD 数与天线数、E 消融与敏感性、F 硬件损伤与非完美 CSI（式（58））、G 谱效与带宽及用户数，图 2—15）；第 VI 节结论；表 I—II（逐格，已渲染原 PDF 第 10 页核对）；图 1—15 图注；参考文献 [1]—[40] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做（页尾标注 qa_complete=false）；②图 1—15 图像本体未复制（站点不上传图片），仅中文图注与正文数值/趋势；③表 I、表 II 已用 PyMuPDF 渲染原 PDF 第 10 页逐格核对（表 I 复杂度按原表保留主导阶）；④作者简介（第 17 页）与版权/许可声明未收录；⑤**再传播许可待核验**，本页仅学习用途、不计入可公开全文统计（页首与状态段已保留说明）。**qa_complete=false。**

{% endraw %}
