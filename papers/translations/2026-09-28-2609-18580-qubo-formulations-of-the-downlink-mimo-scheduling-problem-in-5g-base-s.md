---
layout: page
title: "下行 MIMO 调度的 QUBO 建模｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-18580-qubo-formulations-of-the-downlink-mimo-scheduling-problem-in-5g-base-s/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/113248064348a34c/) · [原文 arXiv](https://arxiv.org/abs/2609.18580) · [全部目录](/papers/catalog/)

# 下行 MIMO 调度的 QUBO 建模

**原题：** QUBO Formulations of the Downlink MIMO Scheduling Problem in 5G Base Stations  
**作者：** Olli Apilo、Jorma Kilpi（芬兰国家技术研究中心 VTT）  
**单位：** VTT Technical Research Centre of Finland。  
**版本：** arXiv:2609.18580v1（eess.SP），v1 日期 2026 年 9 月 16 日；原文 12 页（含附录 A）。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.18580v1 [eess.SP] 16 Sep 2026"，与库内登记编号 2609.18580 一致；原文无独立资助脚注（致谢在文末）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–V 节正文与编号小节、图 1–10 中文图注、表 I–V 逐格转写、§II-C 两个贪心算法伪代码、附录 A（嵌入 D-Wave 拓扑）、致谢，以及参考文献 28 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

量子计算机在把问题先转换为二次无约束二元优化（quadratic unconstrained binary optimization，QUBO）格式后，有可能非常高效地求解大规模组合问题。第五代（5G）基站的调度是一个实际组合问题，用经典计算无法实时最优求解。我们把 5G 基站的下行（downlink，DL）多输入多输出（MIMO）调度表述为 QUBO，并分析 QUBO 表述相对关键系统参数的可扩展性。单用户 MIMO（SU-MIMO）的 QUBO 表述看起来很有前景，因为 QUBO 变量数随用户数线性增长，而问题搜索空间指数增长。基于仿真结果，SU-MIMO 的次优贪心算法在用户数高、带宽低时表现良好。实践中，一种混合方法似乎合理：依据系统参数在量子求解器与次优低复杂度经典算法之间选择。本工作为蜂窝系统调度的未来量子与量子启发式实现铺平了道路。

**索引词：** 调度、5G、MIMO、二次无约束二元优化、量子计算。

## I. 引言

基于正交频分多址（orthogonal frequency division multiple access，OFDMA）的蜂窝通信系统中，调度器的任务是在给定时隙内选择哪些用户被同时服务，以及为每个用户选择哪一组子载波（即资源块，resource block，RB）。在 5G 中，每个用户在给定时隙内被限制使用相同的调制编码方案（modulation and coding scheme，MCS）与相同数量的空间复用数据流 [1]，这使链路自适应与 MIMO 模式选择都紧密耦合到调度中。

MIMO 技术可分为 SU-MIMO（独立数据流发送给单个用户）、多用户 MIMO（MU-MIMO，独立数据流通过相同无线资源发送给多个用户），以及多用户多输入单输出（MU-MISO，用户只有单天线，从而简化预编码设计）。当一组用户可在空间域分离时，MU-MIMO 能带来显著的系统和速率增益。然而，找到调度到同一资源的最优用户集是一个组合 NP 难问题。即使用穷举搜索，即便用户数很少，求解也会在计算上不可行 [2]。由于搜索空间极大，联合选择用户的最优 RB 分配、每用户 MCS 与每用户数据流数一直不可行。因此，已有若干次优低复杂度算法被提出用于 SU-MIMO [3]、MU-MISO [4] 与 MU-MIMO [5], [6]。

量子计算机由于能利用叠加与纠缠并行遍历潜在解，有可能非常高效地求解大规模组合问题 [7]。组合问题通常先转换为 QUBO 格式，这是量子计算中应用最广的优化模型 [8]。当优化问题以 QUBO 呈现时，只要有足够的物理量子比特及其间连通性，就可直接应用于量子退火器。QUBO 问题也可用基于门电路的量子计算机上的量子近似优化算法（QAOA）求解 [9]。然而，许多实际组合问题既无约束也非二阶。因此，实际的 QUBO 表述常涉及把线性约束变换为二次罚函数 [8]，并通过二次化（quadratization）降低问题阶数 [10]。

近来，QUBO 方法已成功应用于多种移动通信问题，如物理小区标识（PCI）规划 [11]、信道解码 [12], [13]、MIMO 检测 [14] 与预编码 [15]、非正交多址（NOMA）检测 [16] 以及可重构智能表面（RIS）优化 [17]。此外，NTT DOCOMO 已把量子退火应用于寻找使寻呼信号数量最小化的基站组 [18]。把蜂窝通信系统调度表述为 QUBO 问题此前尚未见于文献。文献 [19] 把简化的 DL MU-MISO 问题（每个用户只分配一个 RB，从而把 MCS 选择与调度解耦）表述为非线性整数规划，并确定一种变分量子算法（VQA）来求解。然而，已知 VQA 因测量散粒噪声开销而可扩展性困难 [20], [21]。一个相关问题——为联合传输选择最佳用户集，在分布式 MIMO 架构中等价于 MU-MIMO——已在 [22] 中考虑。[22] 通过求解最大化总信噪比（SNR）的 QUBO 从所有用户中选择联合传输的可能用户集，而最终用户选择及其功率缩放因子由暴力搜索完成。

本文把 5G 系统中的 MU-MISO 与 SU-MIMO 下行调度问题表述为 QUBO 问题，并从所需 QUBO 变量数的角度分析其复杂度；在应用于量子计算机时，该变量数通常直接对应逻辑量子比特数。此外，我们分析次优调度算法的复杂度–性能折中，这为"何时用量子计算机最优求解该问题才具有实际意义"提供洞见。我们相信本工作将为蜂窝通信系统调度的未来量子或量子启发式实现铺平道路。

## II. 5G 中的下行调度问题

5G 下行调度器的任务是在每个传输时间间隔（TTI）为所服务的 $K$ 个用户设备（UE）分配可用 RB。MIMO 为调度提供额外自由度：基站必须决定哪些 UE 以及每 UE 多少个数据流被复用到同一 RB。每个 RB 最多可发送 $N_T$ 个时间与空间并行数据流，其中 $N_T$ 是基站发射机数。图 1 给出 $N_T=4$ 时的示例调度决策，空间维度中总共有最多 4 个彩色框。对固定时隙与频率，彩色框构成一个 RB，而未画出的"不可见"框表示该 RB 中未使用的容量。并非每个 RB 都必须被完全分配，也可以完全不分配。

> **图 1（原文 Fig. 1）：** $N_T=N_R=K=4$ 时 MU-MIMO 调度示例。

UE 的天线数 $N_R$ 限制该 UE 在单个 RB 中可调度多少并行数据流。每 UE 的数据流数在给定时隙内必须固定，即同一 TTI 内不同 RB 上不可能接收不同数量的流。图 1 说明了这一点：给定 UE 与 TTI 的空间流数在所有被调度 RB 上相同。此外，调度器为每个被调度 UE 选择一个 MCS 索引，该索引在给定 TTI 内对该 UE 的所有被调度 RB 也必须相同。MCS 索引是接收信号与干扰加噪声比（SINR）的函数，实际上定义了每个 RB 可传输多少数据比特。UE 处的接收 SINR 随 RB 变化，也随哪些其他 UE 被复用到同一 RB 而变化。这使传统调度与 MCS 选择紧密耦合。

### A. 系统模型

我们考虑单个 5G 小区的下行调度，基站有 $N_T$ 个发射机，服务 $K$ 个各具 $N_R$ 天线的 UE。可用带宽划分为 $B$ 个 RB，每个 RB 由 12 个子载波组成。调度决策按每个 TTI 作出，一个 TTI 由 14 个正交频分复用（OFDM）符号组成。我们假设采用迫零（zero forcing，ZF）预编码，以消除复用 UE 的帧内与帧间干扰。为使发送流能简单地在空间上分离，每个 UE 估计其下行信道矩阵、计算奇异值分解（SVD），并把等效信道矩阵反馈给基站。第 $k$ 个 UE 的子载波 $c$、OFDM 符号 $m$ 处信道矩阵 $\mathbf H_{k,c,m}\in\mathbb C^{N_R\times N_T}$ 的 SVD 为

$$
\mathbf H_{k,c,m}=\mathbf U_{k,c,m}\boldsymbol\Sigma_{k,c,m}\mathbf V_{k,c,m}^H \tag{1}
$$

其中 $\mathbf U_{k,c,m}\in\mathbb C^{N_R\times N_R}$ 与 $\mathbf V_{k,c,m}\in\mathbb C^{N_T\times N_T}$ 是酉矩阵，$\boldsymbol\Sigma_{k,c,m}\in\mathbb R^{N_R\times N_T}$ 是奇异值对角矩阵。我们假设每个 UE 用合并矩阵 $\mathbf U_{k,c,m}^H$ 乘其接收信号。合并后的等效信道矩阵为

$$
\widetilde{\mathbf H}_{k,c,m}=\mathbf U_{k,c,m}^H\mathbf H_{k,c,m}=\boldsymbol\Sigma_{k,c,m}\mathbf V_{k,c,m}^H. \tag{2}
$$

当 $\mathbf H_{k,c,m}$ 满秩时，$\boldsymbol\Sigma_{k,c,m}$ 有 $N_R$ 个非零项，每个 UE 最多可接收 $N_R$ 个并行数据流。

每个 UE 信道矩阵的 SVD 实际上把 MU-MIMO 系统转换为具有 $KN_R$ 个虚拟单天线用户的 MU-MISO 系统 [23]。本文其余部分使用虚拟用户索引，把第 $k$ 个 UE 的第 $n$ 个数据流映射为虚拟用户 $v=v_{k,n}$：

$$
v_{k,n}=(k-1)N_R+n, \tag{3}
$$

其中 $1\le k\le K$、$1\le n\le N_R$。图 1 中的一个框表示一个虚拟用户。对 UE $k$ 的第 $n$ 个流的第 $v$ 个虚拟用户，接收信号为

$$
\tilde y_v=\tilde{\mathbf h}_v\mathbf x+\tilde n_v=\sigma_{k,n}\mathbf v_{k,n}^H\mathbf x+\tilde n_v \tag{4}
$$

其中 $\tilde{\mathbf h}_v\in\mathbb C^{1\times N_T}$ 是虚拟用户 $v$ 的等效信道向量，$\mathbf x\in\mathbb C^{N_T\times1}$ 是已预编码发送符号向量，$\tilde n_v\sim\mathcal{CN}(0,N_0)$ 是有效加性噪声项，$\sigma_{k,n}$ 是 UE $k$ 信道矩阵的第 $n$ 个奇异值，$\mathbf v_{k,n}$ 是 UE $k$ 的第 $n$ 个右奇异向量。为简洁省略了子载波与 OFDM 符号索引。

假设调度器已选择虚拟用户集 $\mathcal V$，满足

$$
2\le|\mathcal V|\le\min\left(N_T,KN_R\right), \tag{5}
$$

以复用到 RB $b$。在图 1 中，固定 RB 内同色的框可解释为属于同一 UE 的虚拟用户；同一 UE 最多只有 $N_R$ 个虚拟用户可被包含在 $\mathcal V$ 中的约束仍然成立。

> **原文疑点：** 式 (5) 给出 $|\mathcal V|\ge2$ 的下界，但单个虚拟用户（单流）同样是一种可行的调度选择（MU-MISO 尤其如此），原文未解释为何排除 $|\mathcal V|=1$ 的情形；此处按原文照录并加注。

与 [5] 类似，我们假设 RB 内衰落恒定。对所选集合 $\mathcal V=\{v_1,\dots,v_{|\mathcal V|}\}$ 中这些虚拟用户的合并等效信道矩阵为

$$
\widetilde{\mathbf H}_{\mathcal V,b}=\left[\tilde{\mathbf h}_{v_1,b}^T\cdots\tilde{\mathbf h}_{v_{|\mathcal V|},b}^T\right]^T\in\mathbb C^{|\mathcal V|\times N_T}. \tag{6}
$$

发送符号向量为

$$
\mathbf x=\mathbf F_{\mathcal V,b}\mathbf s_{\mathcal V,b} \tag{7}
$$

其中 $\mathbf F_{\mathcal V,b}\in\mathbb C^{N_T\times|\mathcal V|}$ 是预编码矩阵，满足发射功率约束 $\|\mathbf F_{\mathcal V,b}\|_F^2\le P_T$；$\mathbf s_{\mathcal V,b}\in\mathbb C^{|\mathcal V|\times1}$ 是数据符号向量，$\mathbb E\{|s_v|^2\}=1$。对等效信道矩阵采用等功率分配的 ZF 预编码，会使用同一 RB 的所有 UE 获得相等的合并后 SNR [23]。$\mathcal V$ 中每个虚拟用户在 RB $b$ 上的合并后 SNR 为

$$
\gamma_b(\mathcal V)=\frac{P_T}{N_0}\left\|\widetilde{\mathbf H}_{\mathcal V,b}^H\left(\widetilde{\mathbf H}_{\mathcal V,b}\widetilde{\mathbf H}_{\mathcal V,b}^H\right)^{-1}\right\|_F^2. \tag{8}
$$

调度器还基于 UE 被调度 RB 处的 SNR，为该 UE 从 $M$ 个可能索引中选择一个 MCS 索引。每个 MCS 索引对应每 RB 一定数量的数据比特 $r_m$ [24]。给定 UE $k$ 的 MCS 索引 $m_k$，虚拟用户 $v=(k-1)N_R+n$（$v\in\mathcal V$）在 RB $b$ 上的数据比特数为

$$
r_{v,b,m_k}(\mathcal V)=\begin{cases}r_{m_k}, & \gamma_b(\mathcal V)\ge\theta_{m_k},\\ 0, & \text{否则},\end{cases} \tag{9}
$$

其中 $\theta_{m_k}$ 是 UE 仍能成功解码 MCS 索引 $m_k$ 数据比特所需的最小 SNR。为简化分析，本研究不考虑重传。

### B. 问题定义

通过引入二元决策变量 $\mathbf X$ 与 $\mathbf Z$，调度问题可表述为二元优化。$\mathbf X$ 是 $KN_R\times B$ 二元矩阵，当虚拟用户 $v$ 在 RB $b$ 被调度时 $x_{v,b}=1$。类似地，$\mathbf Z$ 是 $M\times K$ 二元矩阵，当 UE $k$ 选择 MCS 索引 $m$ 时 $z_{m,k}=1$。MU-MIMO 调度问题可表述为

$$
\max_{\mathbf X,\mathbf Z}\ \sum_{b=1}^{B}\sum_{v=1}^{KN_R}\sum_{m=1}^{M}x_{v,b}z_{m,\lceil v/N_R\rceil}\frac{r_{v,b,m}(\mathbf x_b)}{\tilde R_{\lceil v/N_R\rceil}} \tag{10a}
$$

$$
\text{s.t.}\quad\sum_{v=1}^{KN_R}x_{v,b}\le N_T,\qquad\forall b=1,\dots,B \tag{10b}
$$

$$
\sum_{m=1}^{M}z_{m,k}\le1,\qquad\forall k=1,\dots,K \tag{10c}
$$

$$
\sum_{v=(k-1)N_R+1}^{kN_R}x_{v,b}=\sum_{v=(k-1)N_R+1}^{kN_R}x_{v,c},\quad b\neq c \tag{10d}
$$

$$
\text{或}\qquad\sum_{v=(k-1)N_R+1}^{kN_R}x_{v,b}=0, \tag{10e}
$$

$$
\forall k=1,\dots,K,\ \forall b,c=1,\dots,B
$$

其中 $\tilde R_{\lceil v/N_R\rceil}$ 是用于公平性的每 UE 缩放项。约束 (10b) 确保总流数不超过基站发射机数。约束 (10c) 保证一个 UE 只使用一个 MCS 索引。约束 (10d) 或 (10e) 必须满足，确保当一个 UE 被调度多个 RB 时其数据流数相同。注意与约束 (10b) 不同，约束 (10c) 与 (10d) 并非基于物理无线电传播限制，而是 5G 系统设计选择，用于保持下行控制信令开销与 UE 接收机复杂度较低。例如，若移除约束 (10c)，控制信令开销会随 RB 数线性增长。此外，UE 处理复杂度会因解码多个传输块以及每个时隙可能处理多个并行重传而增加。

**1) MU-MISO：** 在 MU-MISO 调度情形，UE 只有单天线，虚拟用户与 UE 之间一一对应。这简化了调度问题：$\mathbf X$ 变为 $K\times B$ 二元矩阵，约束 (10d) 与 (10e) 可移除。

**2) SU-MIMO：** 在 SU-MIMO 情形，UE $k$ 的合并后 SNR 只取决于分配给该 UE 的流数 $n\le N_R$。若假设 $\boldsymbol\Sigma_k$ 中奇异值降序排列，UE $k$ 在 RB $b$ 的 SU-MIMO 合并后 SNR 为

$$
\gamma_{k,b}(n)=\frac{P_T\sigma_{n,n}^2}{N_0}. \tag{11}
$$

每 UE 的数据比特数现在随数据流数线性缩放：

$$
r_{k,b,m_k}(n)=\begin{cases}n\,r_{m_k}, & \gamma_{k,b}(y_k)\ge\theta_{m_k},\\ 0, & \text{否则}.\end{cases} \tag{12}
$$

令 $\mathbf Y$ 为 $N_R\times K$ 矩阵，当为 UE $k$ 调度 $n$ 个数据流时 $y_{n,k}=1$。SU-MIMO 调度问题于是可写为

$$
\max_{\mathbf X,\mathbf Y,\mathbf Z}\ \sum_{b=1}^{B}\sum_{k=1}^{K}\sum_{n=1}^{N_R}\sum_{m=1}^{M}x_{k,b}y_{n,k}z_{m,k}\frac{r_{k,b,m}(n)}{\tilde R_k} \tag{13a}
$$

$$
\text{s.t.}\quad\sum_{k=1}^{K}x_{k,b}\le1,\qquad\forall b=1,\dots,B \tag{13b}
$$

$$
\sum_{m=1}^{M}z_{m,k}\le1,\qquad\forall k=1,\dots,K \tag{13c}
$$

$$
\sum_{n=1}^{N_R}y_{n,k}\le1,\qquad\forall k=1,\dots,K \tag{13d}
$$

其中约束 (13d) 保证同一 UE 在其所有被调度 RB 上选择相同的数据流数。

### C. 算法

本节讨论最优暴力搜索算法与若干次优变体。所有算法的 SNR 计算基本相同，其复杂度不计入分析。

**1) MU-MIMO：** 用穷举搜索求解 MU-MIMO 调度问题极其复杂。搜索需遍历每个 RB 的 MCS 与数据流分配的所有组合。文献 [5] 给出搜索空间大小为 $(MN_R)^{KB}\left(\sum_{k=1}^{\min(K,N_T)}\binom{K}{k}\right)!$。然而，若用户 $k$ 被调度的数据流数为 $n$，则为该用户选择被调度的虚拟 UE 有 $\binom{N_R}{n}$ 种方式，且最优选择取决于同一 RB 上还调度了哪些其他用户。因此实际搜索空间比 [5] 所述更大。实践中，一旦外层循环固定 $\mathbf Y$，调度器就必须遍历所有满足约束 (10d) 或 (10e) 的可能集合 $\mathcal V_b$。若当 $y_{n,k}=1$ 且 $y_{l,k}=0$（$\forall l\neq n$）时只考虑用户 $k$ 的前 $n$ 个虚拟 UE 参与调度，则搜索空间大小恰为 $(MN_R)^{KB}\left(\sum_{k=1}^{\min(K,N_T)}\binom{K}{k}\right)!$。该次优算法在 $K\gg N_R$ 时预计表现良好。复杂度可通过在调度决策作出之后才为用户选择 MCS 索引来降低。在该次优算法中，先为每个 RB 搜索最佳 $\mathcal V_b$；再为每个 UE 选择使其所有被调度 RB 上数据速率非零的最大 MCS 索引。此时搜索空间大小降为 $N_R^{KB}\left(\sum_{k=1}^{\min(K,N_T)}\binom{K}{k}\right)!$。

MU-MIMO 调度问题的复杂度可进一步由贪心算法降低：该算法把 RB 调度给该 RB 上速率最高的虚拟 UE 集合。这固定了被调度虚拟 UE 集合中用户的数据流数。任何后续调度决策必须满足约束 (10d) 与 (10e) 给出的数据流要求。令 $\mathcal W$ 为所有可能集合 $\mathcal V$ 的集合，即 RB 内所有可能的虚拟 UE 分配。可能的虚拟 UE 分配数为

$$
|\mathcal W|=\sum_{v=1}^{\min(KN_R,N_T)}\binom{KN_R}{v}-K\sum_{n=1}^{N_R}\binom{N_R}{n}+KN_R \tag{14}
$$

其中最后两项确保只包含 SNR 最高的 SU-MIMO 分配。对给定用户 $k$ 与给定数据流数 $n=0,1,\dots,N_R$ 的允许虚拟 UE 分配记为 $\mathcal W_{k,n}\subset\mathcal W$，且 $\mathcal W_{k,0}\cup\mathcal W_{k,1}\cup\cdots\cup\mathcal W_{k,N_R}=\mathcal W$。贪心 MU-MIMO 调度算法如下：

> **算法 A（MU-MIMO 贪心调度）**
> 1: 由 $\theta_{\hat m_{\mathcal V,b}}\le\gamma_b(\mathcal V)<\theta_{\hat m_{\mathcal V,b}+1}$ 解出 $\hat m_{\mathcal V,b}$，$\forall b=1,\dots,B$，$\forall\mathcal V\in\mathcal W$
> 2: $\mathbf X\leftarrow\mathbf 0_{KN_R\times B}$，$\mathbf Z\leftarrow\mathbf 0_{M\times K}$，$\mathbf n\leftarrow\mathbf 0_{K\times1}$
> 3: $N_{RB}\leftarrow0$
> 4: $\tilde m_k\leftarrow29$，$\forall k=1,\dots,K$
> 5: $\mathcal B\leftarrow\{1,\dots,B\}$
> 6: **while** $N_{RB}<B$ **do**
> 7: 　$R_{\max}\leftarrow0$
> 8: 　**for each** $b\in\mathcal B$ **do**
> 9: 　　**for each** $\mathcal V\in\mathcal W$ **do**
> 10: 　　　$\hat R\leftarrow0$
> 11: 　　　**for each** $v\in\mathcal V$ **do**
> 12: 　　　　$\hat R\leftarrow\hat R+r_{b,\hat m_{\mathcal V,b}}(\mathcal V)/\tilde R_{\lceil v/N_R\rceil}$
> 13: 　　　**end for**
> 14: 　　　**if** $\hat R>R_{\max}$ **then**
> 15: 　　　　$\hat b\leftarrow b$，$\hat{\mathcal V}\leftarrow\mathcal V$
> 16: 　　　　$R_{\max}\leftarrow\hat R$
> 17: 　　　**end if**
> 18: 　　**end for**
> 19: 　**end for**
> 20: 　$\mathcal B\leftarrow\mathcal B-\hat b$
> 21: 　$N_{RB}\leftarrow N_{RB}+1$
> 22: 　**for each** $v\in\hat{\mathcal V}$ **do**
> 23: 　　$x_{v,\hat b}\leftarrow1$
> 24: 　　$k\leftarrow\lceil v/N_R\rceil$
> 25: 　　**if** $n_k=0$ **then**
> 26: 　　　$n_k\leftarrow n_k+1$
> 27: 　　**end if**
> 28: 　　**if** $\hat m_{\hat{\mathcal V},\hat b}<\tilde m_k$ **then**
> 29: 　　　$\tilde m_k\leftarrow\hat m_{\hat{\mathcal V},\hat b}$
> 30: 　　**end if**
> 31: 　**end for**
> 32: 　**for** $k=1,\dots,K$ **do**
> 33: 　　**if** $n_k>0$ **then**
> 34: 　　　$\mathcal W\leftarrow\mathcal W-\mathcal W_{k,i}$，$i>0$ 且 $i\neq n_k$
> 35: 　　**end if**
> 36: 　**end for**
> 37: **end while**
> 38: **for** $k=1,\dots,K$ **do**
> 39: 　$z_{\tilde m_k,k}=1$
> 40: **end for**
> 41: **return** $\mathbf X,\mathbf Z$

算法第 34 行在调度新用户时有效减小搜索空间，并保证给定用户的数据流约束得到满足。最坏情况下，所有 RB 都调度给同一用户，且每次迭代都必须考虑其他 $K-1$ 个用户的所有虚拟 UE 分配组合，导致最坏搜索空间大小为 $B|\mathcal W|+\left(|\mathcal W|-\sum_{n=1}^{N_R}\binom{N_R}{n}\right)\frac{B(B-1)}{2}$。

**2) MU-MISO：** MU-MISO 调度问题可通过遍历 MCS 分配的所有组合，再找出给定 RB 被调度时达到最高数据速率的集合 $\mathcal V_b$ 来求解。该暴力方法的复杂度随 $K$ 指数增长，搜索空间大小为 $M^{KB}\left(\sum_{k=1}^{\min(K,N_T)}\binom{K}{k}\right)!$。由于 5G 中 $M$ 可高达 29 [24]，降低复杂度的一种直接方法是在调度决策完成后再选择每 UE 的 MCS 索引。在该次优算法中，先为每个 RB 搜索最佳 $\mathcal V_b$；再为每个 UE 选择使其所有被调度 RB 上数据速率非零的最大 MCS 索引。搜索空间大小降为 $B\left(\sum_{k=1}^{\min(K,N_T)}\binom{K}{k}\right)!$。

**3) SU-MIMO：** 与 MU-MISO 类似，SU-MIMO 调度问题可通过遍历每 UE 数据流分配与 MCS 分配的所有组合，再找出给定 RB 被调度时达到最高数据速率的 UE 来求解。暴力方法的复杂度同样随 $K$ 指数增长，搜索空间大小为 $(N_RM)^{KB}K$。实践中搜索空间可有所减小，因为对给定数据流数的 UE $k$，只应考虑 $\{m_{\min,k},\dots,m_{\max,k}\}$ 范围内的 MCS 索引。对具有 $n$ 个数据流的 UE $k$，相关的最小与最大 MCS 索引分别满足

$$
\theta_{m_{\min,k}}\le\min\{\gamma_{k,1}(n),\dots,\gamma_{k,B}(n)\}<\theta_{m_{\min,k}+1} \tag{15}
$$

与

$$
\theta_{m_{\max,k}}\le\max\{\gamma_{k,1}(n),\dots,\gamma_{k,B}(n)\}<\theta_{m_{\max,k}+1}. \tag{16}
$$

与 MU-MISO 情形一样，MCS 索引也可在调度决策之后再决定。该次优方法的搜索空间大小为 $N_R^KB^K$。SU-MIMO 调度的复杂度可进一步由贪心方法降低：把 RB 调度给该 RB 上速率最高的 UE。为某 UE 调度的第一个 RB 决定该 UE 的数据流数并固定 $\mathbf y_k$ 的取值。贪心 SU-MIMO 调度算法如下：

> **算法 B（SU-MIMO 贪心调度）**
> 1: 由 $\theta_{\hat m_{k,b,n}}\le\gamma_{k,b}(n)<\theta_{\hat m_{k,b,n}+1}$ 解出 $\hat m_{k,b,n}$，$\forall k,b,n$
> 2: $\hat R_{k,b,n}\leftarrow r_{k,b,\hat m_{k,b,n}}/\tilde R_k$，$\forall k,b,n$
> 3: $\mathbf X\leftarrow\mathbf 0_{K\times B}$，$\mathbf Y\leftarrow\mathbf 0_{N_R\times K}$，$\mathbf Z\leftarrow\mathbf 0_{M\times K}$
> 4: $N_{RB}\leftarrow0$
> 5: $\tilde m_k\leftarrow29$，$\forall k=1,\dots,K$
> 6: **while** $N_{RB}<B$ **do**
> 7: 　$R_{\max}\leftarrow0$
> 8: 　**for** $b=1,\dots,B$ **do**
> 9: 　　**for** $k=1,\dots,K$ **do**
> 10: 　　　**for** $n=1,\dots,N_R$ **do**
> 11: 　　　　**if** $\hat R_{k,b,n}>R_{\max}$ **then**
> 12: 　　　　　$\hat b\leftarrow b$，$\hat k\leftarrow k$，$\hat n\leftarrow n$
> 13: 　　　　　$R_{\max}\leftarrow\hat R_{k,b,n}$
> 14: 　　　　**end if**
> 15: 　　　**end for**
> 16: 　　**end for**
> 17: 　**end for**
> 18: 　$x_{\hat k,\hat b}\leftarrow1$，$y_{\hat n,\hat k}\leftarrow1$
> 19: 　**if** $\hat m_{\hat k,\hat b,\hat n}<\tilde m_k$ **then**
> 20: 　　$\tilde m_k\leftarrow\hat m_{\hat k,\hat b,\hat n}$
> 21: 　**end if**
> 22: 　$\hat R_{k,\hat b,n}=0$，$\forall k,n$
> 23: 　$\hat R_{\hat k,b,l}=0$，$\forall l\neq\hat n$，$\forall b$
> 24: 　$N_{RB}\leftarrow N_{RB}+1$
> 25: **end while**
> 26: **for** $k=1,\dots,K$ **do**
> 27: 　$z_{\tilde m_k,k}=1$
> 28: **end for**
> 29: **return** $\mathbf X,\mathbf Y,\mathbf Z$

算法第 22 行确保同一 RB 只调度给一个 UE。第 23 行确保被调度 UE 在所有 RB 上分配相同数量的数据流。当只对 $\hat R_{k,b,n}$ 的非零元素搜索时，搜索空间在 while 循环的每次迭代中减小。贪心 SU-MIMO 调度算法的最坏搜索空间大小为 $N_RKB+\left(N_R(K-1)+1\right)\frac{B(B-1)}{2}$。最坏情形是前 $B-1$ 个 RB 全调度给同一 UE。

> **原文疑点：** 表 I 与数值结果设 MCS 数 $M=28$，而 §II-C（MU-MISO 部分）称 5G 中 $M$ 可高达 29 [24]；原文未说明二者差异（例如是否排除索引 0），此处按原文照录并加注。

## III. 问题的 QUBO 建模

在以 QUBO 表述的资源分配或调度问题中，我们有二元决策变量 $\xi_i$（$i=1,\dots,|I|$），每个资源单元决策对应一个变量。我们沿用记号 $I=\{1,2,3,\dots,|I|\}$ 表示基数为 $|I|$ 的索引集。考虑如下形式的数学表达式

$$
\boldsymbol\xi^T\mathbf Q\boldsymbol\xi=\sum_{i=1}^{|I|}\sum_{j=1}^{|I|}q_{ij}\xi_i\xi_j, \tag{17}
$$

并希望找到使式 (17) 最小的向量 $\boldsymbol\xi=(\xi_1,\dots,\xi_{|I|})$。矩阵 $\mathbf Q=(q_{ij})$ 的元素是依赖问题的系数。

优化问题通常带约束。若约束可改写为二元变量的二次罚项，则约束被嵌入 QUBO，我们就处于"无约束"情形。约束可能缩小解集，或使解更难找到。

### A. MU-MIMO

首先简要考虑一般 MU-MIMO 问题的 QUBO 途径。回顾 $N_T$、$N_R$、$B$、$M$ 是参数，只有 $K$（UE 数）是变量。虚拟流数为 $N_RK$。若 $N_RK\le B$，则每个虚拟流可有自己的 $b$；若 $N_RK>N_TB$，则所有虚拟流不能在同一时隙 TTI 内分配。

式 (10a) 中的项 $r_{v,b,m}(\mathbf x_b)$ 需要谨慎处理，因为 RB $b$ 中的速率取决于分配到该 $b$ 的所有用户（虚拟流），即集合 $\mathcal V_b$，它是 $N_RK\times B$ 矩阵 $\mathbf X$ 第 $b$ 列的子集。这意味着对固定资源块 $b$，应研究形如

$$
\prod_{u=1}^{\min\{N_T,N_RK,|\mathcal V_b|\}}x_{u,b} \tag{18}
$$

的二元变量乘积；若 $|\mathcal V_b|>2$，则导致高于二次的问题。MU-MIMO 调度问题的阶数可高达 $N_T+1$，额外维度来自 MCS 索引决策变量 $z_{m,k}$。尽管有系统化方法把高阶问题转换为二次问题 [10]，但当 $N_T>2$ 时额外辅助变量数很快变得非常大。

若约束 (10c)、(10d)、(10e) 可放松，MU-MIMO 调度问题将相对容易表述为 QUBO。这些约束是跨所有 RB 的每 UE 约束，而我们在 MU-MIMO 情形的方法先把系统转换为带虚拟用户的 MU-MISO 系统，这使把约束正确表述为二次罚项变得困难。由于这些挑战与二元优化问题的高阶性，本文聚焦更简单的 MU-MISO 与 SU-MIMO 情形。

### B. MU-MISO

把 MU-MISO 调度问题表述为二次二元优化的一种直接方式是引入二元 $|\mathcal W|\times B$ 矩阵 $\mathbf A$，指示 $\mathcal W$ 中哪个 UE 集合被调度到给定 RB。MU-MISO 情形不同 UE 集合数为

$$
|\mathcal W|=\sum_{v=1}^{\min(K,N_T)}\binom{K}{v}. \tag{19}
$$

二元决策变量 $\boldsymbol\xi$ 到 $\mathbf A$ 与 $\mathbf Z$ 的映射为

$$
\boldsymbol\xi^T=\left[\mathbf a_1^T\cdots\mathbf a_B^T\ \mathbf z_1^T\cdots\mathbf z_K^T\right]^T. \tag{20}
$$

QUBO 矩阵元素可借助式 (9) 表示为

$$
q_{ij}=\begin{cases}
-\dfrac{r_{k,b,m}(\mathcal V_w)}{\tilde R_k}, & \begin{array}{l}i=1,\dots,B|\mathcal W|,\\ j=B|\mathcal W|+1,\dots,B|\mathcal W|+KM,\\ k\in\mathcal V_w,\end{array}\\[10pt]
0, & \text{否则},\end{cases} \tag{21}
$$

其中 $b=\lceil i/|\mathcal W|\rceil$，$w=i-(b-1)|\mathcal W|$，$k=\lceil(j-B|\mathcal W|)/M\rceil$，$m=j-B|\mathcal W|-(k-1)M$。

MU-MISO 调度问题受"一个 RB 只能调度一个 UE 集合"以及式 (10c) 的约束。用 QUBO 变量重写得

$$
\sum_{i=(b-1)|\mathcal W|+1}^{b|\mathcal W|}\xi_i\le1,\qquad\forall b=1,\dots,B \tag{22}
$$

与

$$
\sum_{j=B|\mathcal W|+(k-1)M+1}^{B|\mathcal W|+kM}\xi_j\le1,\qquad\forall k=1,\dots,K. \tag{23}
$$

约束 (22) 与 (23) 可用 [8] 的简单变换转换为二次罚项。所得 QUBO 问题为

$$
\min_{\boldsymbol\xi}\ \boldsymbol\xi^T\widetilde{\mathbf Q}\boldsymbol\xi=\boldsymbol\xi^T\mathbf Q\boldsymbol\xi+\sum_{i=(b-1)|\mathcal W|+1}^{b|\mathcal W|-1}\sum_{j=i+1}^{b|\mathcal W|}\lambda_1\xi_i\xi_j+\sum_{l=B|\mathcal W|+(k-1)M+1}^{B|\mathcal W|+kM-1}\sum_{o=l+1}^{B|\mathcal W|+kM}\lambda_2\xi_l\xi_o, \tag{24}
$$

其中 $\widetilde{\mathbf Q}$ 是包含罚项的最终 QUBO 矩阵，且对所有 $b=1,\dots,B$、$k=1,\dots,K$ 成立。QUBO 变量数为 $|\mathcal W|B+MK$。

### C. SU-MIMO

SU-MIMO 调度问题 (13a) 有三个二元决策变量矩阵 $\mathbf X$、$\mathbf Y$、$\mathbf Z$，可映射为高阶无约束二元优化（higher-order unconstrained binary optimization，HUBO）变量：

$$
\boldsymbol\xi^T=\left[\mathbf x_1^T\cdots\mathbf x_B^T\ \mathbf y_1^T\cdots\mathbf y_K^T\ \mathbf z_1^T\cdots\mathbf z_K^T\right]^T. \tag{25}
$$

SU-MIMO 调度问题是三阶的，HUBO 系数由式 (12) 给出：

$$
q_{ijl}=\begin{cases}
-r_{k,b,m}(n)/\tilde R_k, & \begin{array}{l}i=1,\dots,BK,\ j=BK+1,\dots,BK+KN_R,\\ l=K(B+N_R)+1,\dots,K(B+N_R+M),\\ i-(\lceil i/K\rceil-1)K=\lceil(j-BK)/N_R\rceil\\ \qquad=\lceil(l-BK-N_RK)/M\rceil,\end{array}\\[12pt]
0, & \text{否则},\end{cases} \tag{26}
$$

其中 $b=\lceil i/K\rceil$，$k=i-(b-1)K$，$n=j-BK-(k-1)N_R$，$m=l-BK-KN_R-(k-1)M$。

由于多数求解器只能直接处理 QUBO 问题，我们先把 HUBO 问题转换为带约束的二次二元优化问题。该转换可用 Rosenberg 程序的二次化完成 [10]。令 $f(\xi_1,\dots,\xi_{K(B+N_R+M)})$ 为待最小化、含三阶单项式的函数。二次化可迭代进行：

1) 选择两个变量 $\xi_i$ 与 $\xi_j$，使其乘积在 $f$ 中度数至少 3 的单项式中出现最频繁。
2) 令 $h_{ij}$ 为把 $f$ 中每次出现的 $\xi_i\xi_j$ 替换为新变量 $\rho_{ij}$ 后所得函数。
3) 令 $g_{ij}=h_{ij}+P(\xi_i\xi_j-2\xi_i\rho_{ij}-2\xi_j\rho_{ij}+3\rho_{ij})$，其中 $P$ 是足够大的正数。
4) 令 $f=g_{ij}$。若 $f$ 的阶数高于 2，转步骤 2。

在 SU-MIMO 情形，为简化约束映射，我们限制 Rosenberg 程序只选择 $i=1,\dots,BK$ 与 $j=BK+1,\dots,BK+KN_R$ 的 $\xi_i$ 与 $\xi_j$ 作为变量对。这可解释为：辅助变量 $\rho_{ij}$ 对应把 RB $b=\lceil i/K\rceil$ 调度给 UE $k=i-(b-1)K$ 并带 $n=j-BK-(k-1)N_R$ 个数据流。二次化完成后辅助变量数为 $BKN_R$，总变量数为 $K(B+N_R+M+BN_R)$。实践中 SNR 分布常常使得即使单流也无法用最高 MCS 索引传输数据。利用式 (16)，我们定义 UE $k$ 在 $n=1$ 时的最高可行 MCS 索引为 $M_k=m_{\max,k}$。为减少 QUBO 变量数，UE $k$ 只考虑 MCS 索引 $\{1,\dots,M_k\}$。此时 QUBO 变量数为 $K(B+N_R+BN_R)+\sum_{k=1}^{K}M_k$。

二次化后的 QUBO 变量向量为

$$
\begin{aligned}
\hat{\boldsymbol\xi}^T=[&\boldsymbol\xi^T\ \rho_{1,BK+1}\cdots\rho_{1,BK+N_R}\ \cdots\ \rho_{K,BK+(K-1)N_R+1}\cdots\rho_{K,BK+KN_R}\\
&\rho_{K+1,BK+1}\cdots\rho_{K+1,BK+N_R}\ \cdots\ \rho_{2K,BK+(K-1)N_R+1}\cdots\rho_{2K,BK+KN_R}\ \cdots\\
&\rho_{(B-1)K+1,BK+1}\cdots\rho_{(B-1)K+1,BK+N_R}\ \cdots\ \rho_{BK,BK+(K-1)N_R+1}\cdots\rho_{BK,BK+KN_R}]^T
\end{aligned} \tag{27}
$$

其中辅助变量按 RB 组织，即 $\boldsymbol\xi$ 之后的前 $KN_R$ 个元素对应 RB 1，$\hat{\boldsymbol\xi}$ 中最后 $KN_R$ 个元素对应 RB $B$。二次化后单项式系数被收集到矩阵 $\hat{\mathbf Q}$。

SU-MIMO 二元优化问题的线性约束见 (13b)、(13c)、(13d)。此外还有一个关于辅助变量的附加约束，确保每个 RB 只选择一个"用户–流数"对：

$$
\sum_{i=J+(b-1)KN_R+1}^{J+bKN_R}\hat\xi_i\le1,\qquad\forall b=1,\dots,B \tag{28}
$$

其中 $J=K(B+N_R+M)$。采用与 §III-B 相同的线性约束到二次罚项变换，QUBO 问题变为

$$
\begin{aligned}
\min_{\boldsymbol\xi}\ \hat{\boldsymbol\xi}^T\widetilde{\mathbf Q}\hat{\boldsymbol\xi}={}&\hat{\boldsymbol\xi}^T\hat{\mathbf Q}\hat{\boldsymbol\xi}
+\sum_{i=(b-1)K+1}^{bK-1}\sum_{j=i+1}^{bK}\lambda_1\hat\xi_i\hat\xi_j
+\sum_{l=BK+(k-1)N_R+1}^{BK+kN_R-1}\sum_{o=l+1}^{BK+kN_R}\lambda_2\hat\xi_l\hat\xi_o\\
&+\sum_{p=K(B+N_R)+(k-1)M+1}^{K(B+N_R)+kM-1}\sum_{q=p+1}^{K(B+N_R)+kM}\lambda_3\hat\xi_p\hat\xi_q
+\sum_{s=J+(b-1)KN_R+1}^{J+bKN_R-1}\sum_{t=s+1}^{J+bKN_R}\lambda_4\hat\xi_s\hat\xi_t.
\end{aligned} \tag{29}
$$

## IV. 数值结果

为验证 §III 的 QUBO 表述正确性并比较 §II-C 调度算法的复杂度–性能折中，我们按表 I 的假设仿真系统。如 §II-A 所述，假设 RB 内衰落恒定。记用户 $k$ 在 RB $b$、TTI $t$ 的信道矩阵为 $\mathbf H_{k,b}(t)$。

> **表 I（原文 Table I）：** 仿真中的假设与参数取值。

| 项目 | 取值 |
|---|---|
| MCS 表 | Table 5.1.3.1-2 [24]，$M=28$ |
| SNR 阈值 | $\theta_m=2^{\eta_m}-1$，其中 $\eta_m$ 是 [24] 中 MCS $m$ 的频谱效率 |
| 发射 SNR | $P_T/N_0=10$ |
| 衰落假设 | $\mathbf H_{k,b}(t)=(\sqrt{2L_k})^{-1}\hat{\mathbf H}_{k,b}(t)$，其中 $L_k\sim\mathcal U(1,3.981)$，$\hat H_{i,j,k,b}(t)\sim\mathcal{CN}(0,1)$，$\hat{\mathbf H}_{k,b}(t)\perp\!\!\!\perp\hat{\mathbf H}_{k+1,b}(t)$，$\hat{\mathbf H}_{k,b}(t)\perp\!\!\!\perp\hat{\mathbf H}_{k,b+1}(t)$，$\hat{\mathbf H}_{k,b}(t)\perp\!\!\!\perp\hat{\mathbf H}_{k,b}(t+1)$，空间衰落不相关 |
| TTI 数 | $T_c=100$ |
| 比例公平 | TTI $t$ 的缩放 $\tilde R_k=\tilde R_k(t-1)=\frac{T_c-1}{T_c}\tilde R_k(t-2)+\frac{1}{T_c}R_k(t-1)$，其中 $R_k(t-1)$ 是用户 $k$ 在前一 TTI 的已调度数据比特数 |
| 业务假设 | 每用户下行缓冲永不为空；所有业务同优先级 |

### A. QUBO 表述正确性的经验评估

验证 §III QUBO 表述正确性的直接方式是将其解与 §II-C 相应最优暴力算法的结果比较。但该做法实践上不可行：QUBO 变量数增长超出任何最优 QUBO 求解器的能力；且当 $K>4$ 时，暴力算法执行时间过长，很快无法获得最优解。对 $K\le4$ 的情形，可用两个测试评估 QUBO 矩阵正确性：1) 把暴力搜索解转换为二元向量 $\hat{\boldsymbol\xi}$ 并与 QUBO 矩阵相乘 $\hat{\boldsymbol\xi}^T\widetilde{\mathbf Q}\hat{\boldsymbol\xi}$ 时，应恰好得到与暴力搜索目标函数值相同的结果；2) 次优 QUBO 求解器绝不应得到优于暴力搜索的结果。

遍历所有参数对 $B=\{10,\dots,273\}$ 与 $K=\{2,3,4\}$ 时，第一个测试中该乘法对所有情形都得到与最优目标函数值相同的值。对第二个测试，用 D-Wave Ocean SDK [25] 的模拟退火与模拟量子退火算法求解所表述的 QUBO。求解参数见表 II。测试不同参数值，直到找到对模拟退火算法表现相当好的一组。二次化罚项 $P$ 设为略大于单数据流下一个 RB 最大数据比特数。约束罚项 $\lambda_i$ 按 [8] 建议随 $B$ 缩放，与最优解一致。模拟退火算法对约束罚项的选择不太敏感，只要罚项足够大。图 2 说明了这一点：SU-MIMO、$N_T=N_R=4$、$B=20$ 时每 TTI 调度数据比特数随 $\lambda_i$（所有约束用同一 $\lambda_i$）的变化。可见当罚项太小时约束被违反，表现为解超过最优值。图 3 给出作为热图的示例 QUBO 矩阵。深橙色元素对应来自约束的罚项，其他元素来自二次化程序。

> **表 II（原文 Table II）：** QUBO 求解器参数。

| 项目 | 取值 |
|---|---|
| 约束罚项 | $\lambda_i=1000B$（MU-MISO）；$\lambda_i=1500B$（SU-MIMO），$\forall i$ |
| 二次化罚项（SU-MIMO） | $P=1200$ |
| 温度范围与计划 | 默认，由 Ocean SDK 设定 |
| 读取次数 | 500 |
| 扫描次数 | 20,000 |
| 每次温度的扫描次数 | $2\times10^4$ |

> **图 2（原文 Fig. 2）：** 每 TTI 调度数据比特数随 $\lambda_i$ 的变化，SU-MIMO，$B=20$，$N_T=N_R=4$。

> **图 3（原文 Fig. 3）：** 示例上三角 QUBO 矩阵热图，SU-MIMO，$B=10$，$K=2$，$N_R=4$。

QUBO 表述评估结果见图 4 与图 5，分别给出 MU-MISO 与 SU-MIMO 单 TTI 的解。两种情形基站发射机数固定为 $N_T=4$，SU-MIMO 情形接收天线数固定为 $N_R=4$。可见模拟退火能达到接近最优的解。此外，模拟退火的解绝不应超过暴力搜索的解，图 4 与图 5 正是如此。这与第一个测试的结果一起，使我们确信 (24) 与 (29) 中的 QUBO 矩阵表述正确。QUBO 变量数随 RB 数的变化也以红线示出。这说明 MU-MISO 与 SU-MIMO 的 QUBO 变量数都随带宽（RB 数）增加而线性增长。

> **图 4（原文 Fig. 4）：** 每 TTI 调度数据比特数与 QUBO 变量数随 RB 数的变化，MU-MISO，$N_T=4$。

> **图 5（原文 Fig. 5）：** 每 TTI 调度数据比特数与 QUBO 变量数随 RB 数的变化，SU-MIMO，$N_T=N_R=4$。

$B=20$ 时问题搜索空间大小与 QUBO 变量数随用户数的缩放见图 6。这表明 MU-MISO 与 SU-MIMO 情形的问题复杂度都随 $K$ 指数增长。MU-MISO 调度问题的 QUBO 表述只对少量用户实用，因为所需 QUBO 变量数随 $K^{N_T}$ 多项式增长。另一方面，SU-MIMO QUBO 表述的 QUBO 变量数只随 $K$ 线性增长。

尽管 SU-MIMO QUBO 表述在 QUBO 变量数方面看起来有前景，但变量之间的耦合对量子实现可能是个问题。为深入研究，我们把 SU-MIMO QUBO 矩阵表述为逻辑图，并尝试把它们嵌入当前最先进 D-Wave 量子退火器的拓扑。结果表明，虽然当 UE 数与 RB 数都低时嵌入可行，但部分逻辑 QUBO 变量必须由很长的物理量子比特链表示。这使 SU-MIMO 调度在当前最先进量子退火器上的实际实现不可行，详见附录 A。然而，量子比特连通性随每一代新拓扑不断改善。若该趋势持续，嵌入未来量子退火器应更容易、链长更短。

> **图 6（原文 Fig. 6）：** 搜索空间大小与 QUBO 变量数随用户数的变化，$B=20$。

### B. 调度算法的复杂度与性能

基于可扩展性分析，SU-MIMO QUBO 表述看起来值得进一步研究，因为 QUBO 变量数只线性增长，而问题搜索空间指数增长。然而，即便我们有能以高概率最优求解 SU-MIMO 问题的量子求解器，一个相关问题是：最优求解 SU-MIMO 问题是否值得？换言之，用低复杂度次优算法能接近最优多少？

为更好理解该问题，我们从复杂度与性能角度分析 §II-C3 的次优算法。所考虑算法为穷举暴力搜索、放松约束 (13c) 并在调度后决定 MCS 索引的暴力搜索，以及贪心搜索。这些算法在本节图中分别标为"Brute force"、"No MCS"与"Greedy"。

算法复杂度以搜索空间大小表示，假设所有 $M$ 个 MCS 索引都包含在所有 UE 的搜索中。搜索空间大小随 RB 数与 UE 数的变化分别见图 7 的 (7a) 与 (7b)。如 §II-C3 所述，贪心算法的搜索空间大小是随机的，因此贪心算法的每个点表示 100 个时隙的平均；对数尺度上看不到该平均的波动。贪心算法的搜索空间只随 $K$ 线性增长，这使其成为每个时隙实时调度的一个潜在选项。

> **图 7（原文 Fig. 7）：** (a) SU-MIMO 算法搜索空间大小随 $B$ 的变化，$K=4$，$N_R=4$。(b) SU-MIMO 算法搜索空间大小随 $K$ 的变化，$B=20$，$N_R=4$。

SU-MIMO 算法以 100 个时隙和速率表示的性能随 RB 数的变化见图 8。如预期，暴力算法表现最好，贪心算法和速率最低。和速率曲线并非单调上升，因为信道矩阵中的路损项 $L_k$（见表 I）对每个 $B$ 值都从均匀分布随机抽取，导致 UE 位置"优劣"变化很大。

> **图 8（原文 Fig. 8）：** SU-MIMO 算法的和速率随 $B$ 的变化，$K=N_R=N_T=4$。

为更容易解释使用最优暴力算法的增益，图 9 给出相对贪心算法的和速率增益。当 $K=N_R=N_T=4$ 时，使用最优暴力算法相比贪心算法的性能增益为 10–40%，且随 RB 数呈上升趋势。

> **图 9（原文 Fig. 9）：** 相对贪心算法的和速率增益随 $B$ 的变化，$K=N_R=N_T=4$。

当考虑调度的 UE 数增加时，贪心与暴力算法之间的性能差距减小。图 10 说明了这一点：$B=200$ 时相对贪心算法的和速率增益在若干 $K$ 值下给出。由于暴力算法运行时间随 $K$ 增长很快，我们不得不把 UE 数限制在 $K=5$。例如 $K=6$、$B=200$、$N_R=4$ 时搜索空间大小为 $2.4\times10^{15}$。即便在单时隙中大规模 $K$ 下最优暴力算法的增益很小，能够服务更多流量并保持用户体验服务质量高的累积效应在长期仍可能显著。

> **图 10（原文 Fig. 10）：** 相对贪心算法的和速率增益随 $K$ 的变化，$B=200$，$N_R=N_T=4$。

本节性能结果表明，最优求解 SU-MIMO 调度的增益在调度 UE 数少、RB 数多时最大。假设我们已有可用的 QUBO 量子求解器，那么合理做法是预先评估 $K$ 与 $B$ 这一对参数的边界，以决定何时用基于 QUBO 的最优求解器、何时用贪心搜索等次优低复杂度算法。

## V. 结论

我们把 5G 基站的下行 MU-MISO 与 SU-MIMO 调度问题表述为 QUBO，并从所需 QUBO 变量数角度分析其可扩展性。特别地，SU-MIMO QUBO 表述看起来值得进一步研究，因为 QUBO 变量数随用户数只线性增长，而问题搜索空间指数增长。这一点很重要，因为高峰时段网络中可能有数十个用户被考虑调度。

此外，我们分析次优调度算法的复杂度–性能折中，为"何时用量子计算机最优求解问题在实践中可能有用"提供洞见。结果表明，最优求解 SU-MIMO 下行调度问题的增益在资源块数多、用户数少时最大。实践中，可依据系统参数选择基于 QUBO 的最优求解器或次优低复杂度算法。

我们的初步嵌入研究表明，当资源块数为 70 或更大时，把 SU-MIMO QUBO 图嵌入当前最先进 D-Wave 量子退火器尚不可行。此外，嵌入后的链长非常长，从当前退火器获得接近最优解的可能性极低。然而，我们的结果可作为调度问题其他可能更实用的 QUBO 表述及量子实现的起点。未来工作可将 QUBO 方法仅应用于 MU-MIMO 子问题，如虚拟用户选择。

## 附录 A. 嵌入 D-Wave 拓扑

为评估所提 QUBO 表述在当前量子退火器上的实际可行性，我们研究 §III 导出的 QUBO 矩阵到 D-Wave 硬件拓扑的次嵌入（minor embedding）。嵌入把逻辑 QUBO 变量映射到给定量子处理单元拓扑的物理量子比特。由于实际量子比特拓扑并非全连接，部分逻辑变量必须表示为物理量子比特链。较长的链通常不可取，因为它们增加链断裂的可能性，降低量子退火器返回解的质量 [26]。

我们聚焦 SU-MIMO 情形，因为 QUBO 变量数线性缩放，它最具实际实现价值。此外，本节其余部分假设 $N_T=N_R=4$。(29) 中的 QUBO 矩阵 $\widetilde{\mathbf Q}$ 可表示为逻辑 QUBO 图 $G_Q=(V_Q,E_Q)$，每个二元变量对应一个顶点，当 $\tilde q_{ij}\neq0$（$i\neq j$）时在变量 $i$ 与 $j$ 之间加一条边。实际嵌入之前，可通过评估 QUBO 图的度与密度来估计其难度。QUBO 图分析结果汇总于表 III。表中数值是每个 $\{K,B\}$ 对 100 次独立信道实现的平均。之所以采用该做法，是因为如 §III-C 所讨论，可行 MCS 索引数的变化会导致逻辑 QUBO 变量数有一定变化。由表 III 可见，图密度随 $K$ 与 $B$ 增大而下降。此外，平均度随问题规模增大只略微增加。这表明 QUBO 图在问题扩展时保持相对稀疏，有利于量子退火硬件上的次嵌入。然而，图的最大度很高，这需要用长物理量子比特链才能适配实际量子退火器拓扑。

嵌入目标拓扑选为 Pegasus $P_{16}$ 与 Zephyr $Z_{12}$，分别对应 D-Wave Advantage 与 Advantage2 量子退火器 [27]。对每个 $\{K,B\}$ 对，从生成的 100 个图中随机选取一个逻辑 QUBO 图。使用 Ocean SDK 的 minorminer 库的 `find_embedding` 函数把逻辑 QUBO 图嵌入目标拓扑。`find_embedding` 是 [28] 所提图子式启发式算法的实现。由于次嵌入算法是启发式的，我们对每个 QUBO 图重复嵌入 10 次，并选择量子比特数最低的最佳嵌入。对每次成功嵌入，把所需物理量子比特数、链长中位数以及链长的 75 与 95 百分位收集到表 IV（Pegasus $P_{16}$）与表 V（Zephyr $Z_{12}$）。总体上，量子比特连通性更好的 Zephyr $Z_{12}$ 拓扑比 Pegasus $P_{16}$ 获得更短的链长。遗憾的是，对两种拓扑与所有尝试的 $\{K,B\}$ 对都存在许多长链。这要么需要高链强度，要么增加链断裂概率，二者都显著降低获得接近最优解的概率 [26]。当 $K$ 或 $B$ 增大时，由于没有足够物理量子比特，嵌入无法完成。例如 $K=2$ 且 $B\ge70$ 时即如此。

> **表 III（原文 Table III）：** QUBO 图属性。

| $K$ | $B$ | $\lvert V_Q\rvert$ | $\lvert E_Q\rvert$ | 图密度 | 平均度 | 最大度 |
|---|---|---|---|---|---|---|
| 2 | 20 | 246 | 3145 | 0.104 | 25.5 | 95.2 |
| 2 | 30 | 346 | 4474 | 0.0749 | 25.8 | 132 |
| 2 | 40 | 447 | 5991 | 0.0599 | 26.8 | 171 |
| 2 | 50 | 547 | 7435 | 0.0496 | 27.1 | 209 |
| 2 | 60 | 647 | 8665 | 0.0415 | 26.8 | 245 |
| 2 | 70 | 747 | 9969 | 0.0358 | 26.7 | 280 |
| 3 | 20 | 369 | 5226 | 0.0769 | 28.3 | 97.3 |
| 3 | 30 | 519 | 7505 | 0.0558 | 28.9 | 135 |
| 3 | 40 | 669 | 9866 | 0.0440 | 29.4 | 173 |
| 4 | 20 | 492 | 7661 | 0.0634 | 31.1 | 99.2 |
| 4 | 30 | 692 | 11079 | 0.0463 | 32.0 | 137 |
| 5 | 20 | 612 | 10186 | 0.0544 | 33.3 | 98.1 |

> **表 IV（原文 Table IV）：** Pegasus $P_{16}$ 拓扑的嵌入结果。

| $K$ | $B$ | $\lvert V_Q\rvert$ | $\lvert E_Q\rvert$ | 量子比特数 | 链长中位数 | 链长 P75 | 链长 P95 |
|---|---|---|---|---|---|---|---|
| 2 | 20 | 247 | 3224 | 1601 | 5 | 8 | 15 |
| 2 | 30 | 336 | 3417 | 2328 | 5 | 7 | 25 |
| 2 | 40 | 449 | 6367 | 3885 | 6 | 9 | 30 |
| 2 | 50 | 543 | 6495 | 4313 | 5 | 7 | 37 |
| 2 | 60 | 642 | 7622 | 4819 | 4 | 6 | 40 |
| 2 | 70 | 750 | 10536 | N/A | N/A | N/A | N/A |
| 3 | 20 | 367 | 5055 | 3745 | 9 | 14 | 22 |
| 3 | 30 | 506 | 6121 | 4668 | 5 | 8 | 42 |
| 3 | 40 | 667 | 9410 | N/A | N/A | N/A | N/A |
| 4 | 20 | 497 | 8027 | N/A | N/A | N/A | N/A |

> **表 V（原文 Table V）：** Zephyr $Z_{12}$ 拓扑的嵌入结果。

| $K$ | $B$ | $\lvert V_Q\rvert$ | $\lvert E_Q\rvert$ | 量子比特数 | 链长中位数 | 链长 P75 | 链长 P95 |
|---|---|---|---|---|---|---|---|
| 2 | 20 | 247 | 3224 | 1345 | 5 | 7 | 12 |
| 2 | 30 | 336 | 3417 | 1782 | 4 | 5 | 20 |
| 2 | 40 | 449 | 6367 | 3136 | 4 | 6 | 33 |
| 2 | 50 | 543 | 6495 | 3438 | 4 | 5 | 34 |
| 2 | 60 | 642 | 7622 | 3938 | 4 | 5 | 29 |
| 2 | 70 | 750 | 10536 | N/A | N/A | N/A | N/A |
| 3 | 20 | 367 | 5055 | 3236 | 7 | 11 | 24 |
| 3 | 30 | 506 | 6121 | 3792 | 5 | 7 | 34 |
| 3 | 40 | 667 | 9410 | N/A | N/A | N/A | N/A |
| 4 | 20 | 497 | 8027 | N/A | N/A | N/A | N/A |

## 致谢

作者感谢 Hannu Reittu 在 QUBO 表述方面的早期帮助、Kari Seppänen 的 CPLEX 测试、Animesh Yadav 教授在研究课题上的多次有益讨论，以及 Costantino Carugno 与 Andrea Marchesin 在量子退火问题上的帮助与反馈。

## 参考文献（英文原书目）

- [1] 3GPP TS38.212, "NR; Multiplexing and channel coding V17.11.0." 3GPP, Technical Specification, 2025.
- [2] E. Castañeda, A. Silva, A. Gameiro, and M. Kountouris, "An overview on resource allocation techniques for multi-user MIMO systems," IEEE Commun. Surveys Tuts., vol. 19, no. 1, pp. 239–284, 2017.
- [3] G. Femenias, F. Riera-Palou, X. Mestre, and J. J. Olmos, "Downlink scheduling and resource allocation for 5G MIMO-Multicarrier: OFDM vs FBMC/OQAM," IEEE Access, vol. 5, pp. 13 770–13 786, 2017.
- [4] J. De Luna Ducoing and K. Nikitopoulos, "Scalable MU-MIMO user scheduling for next-generation wireless networks," in Proc. IEEE CAMAD, Edinburgh, UK, Nov. 2023, pp. 19–24.
- [5] Y. Chen, Y. Wu, Y. T. Hou, and W. Lou, "mCore+: A real-time design achieving ∼500 µs scheduling for 5G MU-MIMO systems," IEEE Trans. Mobile Comput., vol. 22, no. 12, pp. 7249–7265, 2023.
- [6] Y. Wu, Y. Shi, Y. T. Hou, W. Lou, J. H. Reed, and L. A. DaSilva, "R³: A real-time robust MU-MIMO scheduler for O-RAN," IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 17 727–17 743, 2024.
- [7] F. Chicano, G. Luque, Z. A. Dahi, and R. Gil-Merino, "Combinatorial optimization with quantum computers," Engineering Optimization, vol. 57, no. 1, pp. 208–233, 2025.
- [8] F. Glover, G. Kochenberger, and Y. Du, "Quantum bridge analytics I: A tutorial on formulating and using QUBO models," 4OR, vol. 17, no. 4, pp. 335–371, 2019.
- [9] D. Volpe, G. Orlandi, and G. Turvani, "Improving the solving of optimization problems: A comprehensive review of quantum approaches," Quantum Reports, vol. 7, no. 1, 2025.
- [10] M. Anthony, E. Boros, Y. Crama, and A. Gruber, "Quadratic reformulations of nonlinear binary optimization problems," Mathematical Programming, vol. 162, pp. 115–144, 2017.
- [11] G. Barillaro, A. Boella, F. Gandino, M. G. Vakili, E. Giusto, G. Mondo, B. Montrucchio, A. Scarabosio, A. Scionti, O. Terzo, and G. Vitali, "Comparison of heuristic approaches to PCI planning for quantum computers," in Proc. IEEE ICCE, Las Vegas, NV, Jan. 2023, pp. 1–6.
- [12] S. Kasi and K. Jamieson, "Towards quantum belief propagation for LDPC decoding in wireless networks," in Proc. MobiCom, London, UK, Sep. 2020, pp. 663–676.
- [13] S. Kasi, J. Kaewell, and K. Jamieson, "A quantum annealer-enabled decoder and hardware topology for nextG wireless polar codes," IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 3780–3794, 2024.
- [14] B. Gülbahar, "Majority voting with recursive QAOA and cost-restricted uniform sampling for maximum-likelihood detection in massive MIMO," IEEE Trans. Wireless Commun., vol. 24, no. 3, pp. 2620–2631, 2025.
- [15] S. Winter, Y. Zhang, G. Zheng, and L. Hanzo, "A lattice-reduction aided vector perturbation precoder relying on quantum annealing," IEEE Wireless Commun. Lett., vol. 13, no. 5, pp. 1225–1229, 2024.
- [16] K. Yonaga, K. Takizawa, and M. Inaba, "Error rate analysis of quantum-annealing-aided multi-user detection in power-domain nonorthogonal multiple access," IEEE Access, vol. 13, pp. 56 671–56 681, 2025.
- [17] Q. J. Lim, C. Ross, A. Ghosh, F. W. Vook, G. Gradoni, and Z. Peng, "Quantum-assisted combinatorial optimization for reconfigurable intelligent surfaces in smart electromagnetic environments," IEEE Trans. Antennas Propag., vol. 72, no. 1, pp. 147–159, 2024.
- [18] "Developing quantum computing infrastructure for service optimization: Application to base stations to optimize communications services start in july," Press Release, NTT DOCOMO, Jun. 2024.
- [19] C.-H. Hsu and Z. Ding, "Variational quantum algorithm for user scheduling in broadband MU-MIMO systems," IEEE Trans. Wireless Commun., vol. 25, pp. 1196–1208, 2026.
- [20] G. Scriva, N. Astrakhantsev, S. Pilati, and G. Mazzola, "Challenges of variational quantum optimization with measurement shot noise," Phys. Rev. A, vol. 109, p. 032408, Mar. 2024.
- [21] A. Bärligea, B. Poggel, and J. M. Lorenz, "Scalability challenges in variational quantum optimization under stochastic noise," Phys. Rev. A, vol. 112, p. 032407, Sep. 2025.
- [22] D. Volpe, G. A. Cirillo, R. Fantini, A. Boella, G. Mondo, M. Graziano, and G. Turvani, "Quantum-compliant users scheduling optimization in joint transmission mobile access networks," Quantum Information Processing, vol. 23, no. 262, 2024.
- [23] A. Panajotović, F. Riera-Palou, and G. Femenias, "Adaptive uniform channel decomposition in MU-MIMO-OFDM: Application to IEEE 802.11ac," IEEE Trans. Wireless Commun., vol. 14, no. 5, pp. 2896–2910, 2015.
- [24] 3GPP TS38.214, "NR; Physical layer procedures for data V17.14.0," 3GPP, Technical Specification, 2025.
- [25] Ocean SDK. D-Wave. [Online]. Available: https://docs.dwavequantum.com/en/latest/ocean/index.html
- [26] Minor embedding: Best practices – D-Wave quantum computing products documentation. D-Wave. [Online]. Available: https://docs.dwavequantum.com/en/latest/quantum_research/embedding_intro.html
- [27] Per-QPU solver properties and schedules – D-Wave quantum computing products documentation. D-Wave. [Online]. Available: https://docs.dwavequantum.com/en/latest/quantum_research/solver_properties_specific.html
- [28] J. Cai, W. G. Macready, and A. Roy, "A practical heuristic for finding graph minors," ArXiv pre-print, Jun. 2014. [Online]. Available: https://arxiv.org/abs/1406.2741

## 图注与表注索引

本页图 1–10 的中文图注与表 I–V 的表注均按原文出现位置内联在正文中（图 1 见第 II 节，图 2–6 见第 IV-A 节，图 7–10 见第 IV-B 节；表 I 见第 IV-A 节开头，表 II 见第 IV-A 节，表 III–V 见附录 A），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.18580v1 全文（12 页）的中文译稿：摘要、索引词、第 I–V 节正文与编号小节、图 1–10 的中文图注、表 I–V 的逐格转写、§II-C 两个贪心算法伪代码、附录 A 与致谢，以及参考文献 28 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(29) 逐式核对（重点 (5)、(8)、(10a)–(13d)、(17)–(29)），表 II–V 用第 8 与第 11 页渲染图/表格网格逐格核对（表 I 用第 7 页渲染图核对行结构与调参值）。已加注两处原文疑点：(i) 式 (5) 给出 $|\mathcal V|\ge2$ 的下界，但单虚拟用户调度同样可行，原文未解释该限制；(ii) 表 I 与数值结果设 MCS 数 $M=28$，而 §II-C 称 5G 中 $M$ 可高达 29，原文未说明差异。本页不上传原文图片，图内曲线与散点数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
