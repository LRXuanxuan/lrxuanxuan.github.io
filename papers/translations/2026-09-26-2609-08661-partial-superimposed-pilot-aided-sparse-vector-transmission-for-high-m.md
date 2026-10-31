---
layout: page
title: "部分叠加导频辅助的稀疏向量传输｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-08661-partial-superimposed-pilot-aided-sparse-vector-transmission-for-high-m/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/636923cdb596f349/) · [原文 arXiv](https://arxiv.org/abs/2609.08661) · [全部目录](/papers/catalog/)

# 部分叠加导频辅助的稀疏向量传输

**原题：** Partial Superimposed Pilot-Aided Sparse Vector Transmission for High-Mobility URLLC  
**作者：** Yanfeng Zhang（Member, IEEE）、Jinkai Zheng（Member, IEEE）、Hui Liang、Wen Wu（Senior Member, IEEE）、Tom H. Luan（Fellow, IEEE）、Di Zhang（Senior Member, IEEE）、Xu Zhu（Senior Member, IEEE）  
**单位：** Yanfeng Zhang、Jinkai Zheng、Hui Liang 就职于东莞理工学院电气工程与智能化学院（中国东莞；邮箱：yfzhang@ieee.org、jkzheng@ieee.org、huiliang@ieee.org）；Wen Wu 就职于鹏城实验室战略与前沿交叉研究部（中国深圳，518000；邮箱：wuw02@pcl.ac.cn）；Tom H. Luan 就职于西安交通大学网络空间安全学院（中国西安；邮箱：tom.luan@xjtu.edu.cn）；Di Zhang 就职于中山大学智能系统工程与工程学院（中国深圳，518107；邮箱：dr.di.zhang@ieee.org）；Xu Zhu 就职于哈尔滨工业大学（深圳）信息科学与技术学院（中国深圳，518055；邮箱：xuzhu@ieee.org）。通讯作者：Yanfeng Zhang。  
**版本：** arXiv:2609.08661v1（eess.SP），2026 年 9 月 8 日；原文 6 页（含图 1—7、参考文献 [1]—[16]，无表格）。  
**范围与状态：** 全文中文译稿：摘要、索引词、资助说明、第 I—V 节（含 II 编码过程、III-A/III-B、IV 仿真结果）、图 1—7 中文图注、参考文献 [1]—[16]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(21) 按原文保留。原文无表格，故无表格渲染核对项。逐句逐式终校未做。

## 摘要

本文面向高移动场景下的短包超可靠低时延通信（URLLC），提出一种**部分叠加导频辅助的稀疏向量传输（partial superimposed pilot-aided sparse vector transmission, PSP-SVT）**方案。与传统全叠加导频辅助 SVT 方案不同，所提 PSP-SVT 只在**部分子载波**上部署少量导频。这种稀疏导频结构既足以支撑基于基扩展模型（BEM）的信道跟踪，又能有效降低导频—数据干扰。基于 PSP 图样，我们设计了一种迭代接收机，联合执行信道估计与数据译码。PSP-SVT 中降低的导频干扰带来更准确的初始信道估计与数据检测，从而改进后续迭代精化并缓解其误差传播。此外，我们研究了 PSP 数量与功率分配比对误块率（BLER）性能的影响，以揭示近最优导频配置。仿真结果表明，所提 PSP-SVT 方案在 BLER 与收敛速度上均优于现有全叠加导频辅助 SVT 方案。

**索引词：** 稀疏向量传输、短包传输、高移动通信、叠加导频。

## I. 引言

超可靠低时延通信（URLLC）是未来无线通信系统的关键业务类别，支撑自动驾驶、工业控制等时延敏感应用 [1]、[2]。在这些场景中，传输数据包通常非常短，留给导频开销与译码时延的余地有限。高移动环境进一步加剧了该问题：包持续时间内的快速信道变化给可靠传输带来额外挑战。

近期，稀疏向量传输（sparse vector transmission, SVT）[3] 已成为短包通信的一种有前景技术。在 SVT 中，信息比特被嵌入稀疏向量非零元素的**索引**中，再由随机码本扩展，从而在有限块长区制下通过稀疏信号恢复实现可靠译码。为提升传输性能，已有若干基于 SVT 的增强设计。[4] 的增强 SVT 方案在非零元素中引入调制符号以提高频谱效率；[5] 提出的稀疏叠加编码（SSC）方案通过增大不同非零元素之间的最小欧氏距离进一步提升可靠性；[6] 提出的块正交稀疏叠加码利用码本的块正交性提升数据译码鲁棒性。此外还引入了额外索引维度以提高编码效率，如 [7] 的多模索引辅助 SVT 方案与 [8] 的索引重定义 SSC 方案。进一步地，[9] 的块 SVT 方案把信息比特映射到非零**块**索引而非单个非零位置，从而降低所需码字长度，使短包传输更可靠。近期，SVT 也被扩展到多种通信场景，包括多输入多输出（MIMO）系统 [10]、免授权接入系统 [11] 与存储受限物联网系统 [12]。

上述 SVT 方案主要面向准静态信道设计，即信道在一个数据包内近似不变。然而在高移动场景中，信道在包持续时间内快速变化，使准确信道获取更困难，并成为可靠译码的关键瓶颈。为解决该问题，我们在前期工作 [13] 中提出了稀疏叠加向量传输（SSVT）方案：用基扩展模型（BEM）建模快速时变信道，并在**全部子载波**上叠加全导频（full superimposed pilots, SP）以支持迭代信道估计与数据译码。SSVT 改善了信道估计性能，但也在整个带宽上引入强导频—数据干扰，降低数据译码精度。近期，[14] 提出的联合导频—数据 SVT（JPD-SVT）方案通过选择性地复用一部分可靠译码数据符号作为伪导频，进一步改进迭代接收机，从而精化信道估计并改善误块率（BLER）性能。然而，SSVT 与 JPD-SVT 仍依赖全 SP，由此产生的强导频—数据干扰从根本上限制了初始信道估计与数据译码质量，进而约束后续迭代译码性能。

受上述问题驱动，本文面向时变信道上的短包 URLLC 提出**部分叠加导频辅助 SVT（PSP-SVT）**方案。与在所有子载波上使用全 SP 的 SSVT [13] 和 JPD-SVT [14] 相比，所提 PSP-SVT 利用 BEM 的低维表示，仅需有限数量的 PSP 即可完成信道估计。这种部分部署降低了导频—数据干扰，为后续迭代信道估计与数据译码提供更可靠的初始化。本文贡献概括如下。

- **面向高移动短包传输的新 PSP 图样。** 与 [13]、[14] 的全 SP 辅助 SVT 方案不同，所提 PSP 图样把少量导频叠加在部分子载波上。这种 SP 部署方式与基于 BEM 的低维信道表示高度契合——只需估计少量信道系数。它有效缓解导频—数据干扰、降低信道估计复杂度，并为后续迭代译码提供可靠初始化。
- **利用 PSP 部署特性设计的迭代接收机。** 降低的导频—数据干扰使初始 BEM 系数估计更准确，从而缓解后续迭代信道估计与数据译码之间的误差传播。此外，我们研究了 PSP 数量与功率分配比对 BLER 性能的影响，以揭示近最优导频配置。仿真结果表明，所提 PSP-SVT 方案相对现有 SVT 方案取得更优 BLER 性能。

全文结构如下：第 II 节介绍所提 PSP-SVT 方案的编码过程；第 III 节描述 PSP-SVT 的迭代联合信道估计与数据译码算法；第 IV 节给出大量仿真结果与讨论；第 V 节总结。

## II. PSP-SVT 方案的编码过程

考虑一个正交频分复用（OFDM）系统，每个传输块由 $N_f$ 个子载波构成。如图 1 所示，共 $b=b_I+b_S$ 个信息比特被映射为 $K$-稀疏数据向量 $\mathbf s_d\in\mathbb C^N$，其中 $N_f$ 与 $N$ 分别表示子载波数与稀疏向量长度。令 $\mathcal D$ 表示 $K$ 个非零项的支持集。$b_I$ 个索引比特由激活支持图样承载，满足 $b_I\leq\left\lfloor\log_2\binom{N}{K}\right\rfloor$；其余 $b_S=K\log_2(M)$ 个比特由 $K$ 个调制符号承载，调制阶数为 $M$。所得稀疏数据向量由码本 $\mathbf G\in\mathbb R^{N_f\times N}$ 扩展，其中 $\mathbf G=[\mathbf g_1,\ldots,\mathbf g_N]$，每个码字由等概率生成的 $1$ 与 $-1$ 元素构成。相应地，编码数据信号为 $\mathbf x_d=\mathbf G\mathbf s_d\in\mathbb C^{N_f}$。

为跟踪时变信道，$N_P$ 个导频符号被叠加在编码数据向量 $\mathbf x_d$ 之上。与 [13]、[14] 中现有全 SP SVT 方案不同，所提 PSP-SVT 只在部分子载波上部署导频。具体地，$N_P$ 个 PSP 均匀分布在 $N_f$ 个子载波上，以提供均匀分布的信道观测并避免局部导频感应区过度重叠；非均匀或成簇放置可能导致信道观测不均并增加导频—数据干扰。令 $\mathcal P=\{P_1,P_2,\ldots,P_{N_P}\}$ 表示 PSP 的索引集，相邻非零导频位置之间的间隔为 $N_f/N_P$。PSP 向量 $\mathbf x_p\in\mathbb C^{N_f}$ 仅在索引集 $\mathcal P$ 处含 $N_P$ 个非零导频符号，其余元素全为零。

发射频域信号由编码稀疏数据向量与 PSP 向量叠加得到：$\mathbf x=\sqrt{\alpha_d}\mathbf x_d+\sqrt{\alpha_p}\mathbf x_p$，其中 $\alpha_d$ 与 $\alpha_p$ 分别为数据与导频的功率分配比，满足 $\alpha_d+\alpha_p=1$。代入 $\mathbf x_d=\mathbf G\mathbf s_d$，发射信号可等价表示为

$$
\mathbf x=\sqrt{\alpha_d}\sum_{k=1}^{K}s_k\mathbf g_k+\sqrt{\alpha_p}\mathbf x_p,\tag{1}
$$

其中 $k\in\mathcal D$ 表示第 $k$ 个非零索引。

经逆离散 Fourier 变换（IDFT）后，发射时域信号为 $\mathbf x_T=\mathbf F^H\mathbf x$，其中 $\mathbf F\in\mathbb C^{N_f\times N_f}$ 为归一化 DFT 矩阵。插入循环前缀（CP）后，信号 $\mathbf x_T$ 通过时变信道传输。去 CP 并做 DFT 后，接收频域信号可写为

$$
\mathbf y=\mathbf F\mathbf H_T\mathbf F^H\mathbf x+\mathbf z=\mathbf H_F\mathbf x+\mathbf z,\tag{2}
$$

其中 $\mathbf H_T=\sum_{l=0}^{L-1}\boldsymbol\Pi^l\operatorname{diag}(\mathbf h_l)$ 为含 $L$ 个抽头的时域信道矩阵，$\mathbf h_l$ 为第 $l$ 个抽头的信道冲激响应（CIR），$\boldsymbol\Pi=\operatorname{circ}\{[0,1,0,\cdots,0]^T_{N_f\times1}\}$ 为置换矩阵，$\mathbf H_F=\mathbf F\mathbf H_T\mathbf F^H\in\mathbb C^{N_f\times N_f}$ 为频域信道矩阵，$\mathbf z\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N_f})$ 为方差 $\sigma^2$ 的加性白高斯噪声（AWGN）向量，$\mathbf I_{N_f}$ 为 $N_f\times N_f$ 单位矩阵。

注意时变信道系数数目 $N_fL$ 远大于观测维度 $N_f$，使信道估计困难。为减少未知信道系数量，每条路径的 CIR 用 Slepian BEM [15] 建模。该选择源于其对带限多普勒过程的最优能量集中特性，与常规 BEM 相比具有更快的特征值衰减与更紧致的表示 [15]。相应地，CIR 可表示为

$$
\mathbf h_l=\sum_{q=0}^{Q-1}c_{q,l}\mathbf b_q+\mathbf w_l,\tag{3}
$$

其中 $Q$（$Q\ll N_f$）为 BEM 阶数，$c_{q,l}$ 为第 $l$ 条路径的第 $q$ 个 Slepian 系数，$\mathbf b_q$ 为第 $q$ 个 Slepian 基函数，$\mathbf w_l$ 表示建模误差。Slepian 基 $\mathbf b_q$ 由如下特征值问题获得：

$$
\sum_{n=0}^{N_f-1}\frac{\sin\left(2\pi f_{\max}(n-m)\right)}{\pi(n-m)}b_q[n]=\lambda_qb_q[m],\tag{4}
$$

其中 $f_{\max}$ 为最大多普勒频率，$\lambda_q$ 为 $\mathbf b_q$ 对应的特征值。

基于 Slepian-BEM 建模，（2）中的时域信道矩阵 $\mathbf H_T$ 可进一步表示为

$$
\mathbf H_T=\sum_{q=0}^{Q-1}\operatorname{diag}(\mathbf b_q)\mathbf F^H\operatorname{diag}(\mathbf F_L\mathbf c_q)\mathbf F+\mathbf W,\tag{5}
$$

其中 $\mathbf F_L$ 为由 $\mathbf F$ 前 $L$ 列构成的子矩阵，$\mathbf c_q=[c_{q,0},\ldots,c_{q,L-1}]^T$，$\mathbf W$ 为建模误差矩阵。把（5）代入（2），接收信号可改写为

$$
\mathbf y=\sum_{q=0}^{Q-1}\bar{\mathbf B}_q\operatorname{diag}\left(\sqrt{\alpha_d}\mathbf x_d+\sqrt{\alpha_p}\mathbf x_p\right)\mathbf F_L\mathbf c_q+\mathbf u,\tag{6}
$$

其中 $\bar{\mathbf B}_q=\mathbf F\operatorname{diag}(\mathbf b_q)\mathbf F^H$，$\mathbf u$ 同时包含 BEM 建模误差与 AWGN。

借助基于 Slepian-BEM 的信道建模，未知信道参数数目由 $N_fL$ 降为 $QL$。在有限散射环境中，$QL$ 通常远小于 $N_f$。因此仅需 $N_P\geq QL$ 个导频即可估计全部 BEM 系数。基于（6）的信号模型，我们设计迭代联合信道估计与数据译码算法，以实现 PSP-SVT 的可靠译码。

## III. 迭代联合信道估计与数据译码

本节为 PSP-SVT 提出迭代联合信道估计与数据译码接收机。接收机分两阶段工作：初始阶段利用接收到的 PSP 信号获得粗信道估计，并基于估计信道做初始数据译码；迭代阶段把已译码数据符号用作伪导频，进一步精化信道估计并改善后续数据译码。

### A. 初始信道估计与数据译码

在接收端，第 $m$ 个接收 PSP 信号可表示为

$$
y_p(m)=\sqrt{\alpha_p}x_p(n)\sum_{q=0}^{Q-1}\bar h_{q,n}\beta_q\left(\operatorname{mod}(m-n,N_f)\right),\tag{7}
$$

其中 $\operatorname{mod}(a,b)$ 返回 $a$ 除以 $b$ 的余数，$\beta_q(\operatorname{mod}(m-n,N_f))$ 表示等效 BEM 扩展矩阵 $\bar{\mathbf B}_q$ 的第 $(m,n)$ 个元素（它依赖循环索引差 $\operatorname{mod}(m-n,N_f)$），$\bar h_{q,n}$ 表示第 $q$ 个 Slepian-BEM 基对应、与输入 PSP 位置 $P_n$ 相关的等效频域信道系数，即

$$
\bar h_{q,n}=\sum_{l=0}^{L-1}c_{q,l}e^{-\mathrm j\frac{2\pi P_nl}{N_f}}.\tag{8}
$$

发射的 PSP 符号与扩展数据信号共同经 Slepian-BEM 建模的信道矩阵畸变，如图 2 所示。由于 Slepian-BEM 的能量集中特性，等效频域信道矩阵近似为带状，其有效带宽由 BEM 阶数 $Q$ 决定。相应地，每个 PSP 的主导能量集中在其对准输出位置周围 $Q$ 个相邻子载波内；在其余子载波上，PSP 引起的分量几乎为零。因此，PSP 符号对接收数据信号造成的干扰在这些局部区域之外非常弱。这些区域被称为**低干扰区域**，如图 2 所示。低干扰区域使初始 BEM 系数估计更准确、数据译码更可靠，进而为后续迭代译码提供可靠起点，并有效缓解信道估计与数据译码之间的误差传播。

据此，接收机收集与每个 PSP 位置相关的 $Q$ 个相邻接收信号，构造初始信道估计模型。具体地，令 $\mathcal S$ 表示所有 PSP 位置对应局部接收区域的并集，即

$$
\mathcal S=\bigcup_{n=1}^{N_P}\left\{\operatorname{mod}(P_n+q,N_f)\ \middle|\ q=-\left\lfloor\frac{Q-1}{2}\right\rfloor,\ldots,\left\lfloor\frac{Q}{2}\right\rfloor\right\}.\tag{9}
$$

提取由 $\mathcal S$ 索引的接收信号后，初始信道估计模型表述为

$$
\bar{\mathbf y}_p=\mathbf A^{(0)}\mathbf c+\bar{\mathbf y}_d+\mathbf u,\tag{10}
$$

其中 $\bar{\mathbf y}_p=\mathbf P_{\mathcal S}\mathbf y_p$、$\bar{\mathbf y}_d=\mathbf P_{\mathcal S}\mathbf y_d$ 为接收数据信号，$\mathbf P_{\mathcal S}\in\mathbb R^{|\mathcal S|\times N_f}$ 为由索引集 $\mathcal S$ 决定的行选择矩阵，$\mathbf c=[\mathbf c_0^H,\cdots,\mathbf c_{Q-1}^H]^H\in\mathbb C^{QL}$，$\mathbf A^{(0)}=[\mathbf A_0^{(0)},\mathbf A_1^{(0)},\cdots,\mathbf A_{Q-1}^{(0)}]\in\mathbb C^{|\mathcal S|\times QL}$ 为测量矩阵，其第 $q$ 个子矩阵为

$$
\mathbf A_q^{(0)}=\mathbf P_{\mathcal S}\mathbf F\operatorname{diag}(\mathbf b_q)\mathbf F^H\operatorname{diag}\left(\sqrt{\alpha_p}\mathbf x_p\right)\mathbf F_L,\tag{11}
$$

$q=0,1,\cdots,Q-1$。基于（10）的信号模型，第 0 次迭代的初始 BEM 系数估计为

$$
\hat{\mathbf c}^{(0)}=\left(\left(\mathbf A^{(0)}\right)^H\mathbf A^{(0)}\right)^{-1}\left(\mathbf A^{(0)}\right)^H\bar{\mathbf y}_p.\tag{12}
$$

得到 $\hat{\mathbf c}^{(0)}$ 后，初始频域信道矩阵可重建为

$$
\hat{\mathbf H}_F^{(0)}=\sum_{q=0}^{Q-1}\bar{\mathbf B}_q\operatorname{diag}\left(\mathbf F_L\hat{\mathbf c}_q^{(0)}\right),\tag{13}
$$

其中 $\hat{\mathbf c}_q^{(0)}$ 为 $\hat{\mathbf c}^{(0)}$ 的第 $q$ 个子向量。随后从 $\mathbf y$ 中去除接收导频信号，得到接收数据信号：

$$
\hat{\mathbf y}_d^{(0)}=\mathbf y-\sqrt{\alpha_p}\hat{\mathbf H}_F^{(0)}\mathbf x_p.\tag{14}
$$

基于重建的信道矩阵 $\hat{\mathbf H}_F^{(0)}$ 执行初始数据译码。具体地，通过求解如下问题恢复数据稀疏向量：

$$
\left\{\hat{\mathbf s}_d^{(0)},\hat{\mathcal D}^{(0)}\right\}=\arg\min_{\left\|\mathbf s_d^{(0)}\right\|_0=K}\left\|\hat{\mathbf y}_d^{(0)}-\sqrt{\alpha_d}\hat{\mathbf H}_F^{(0)}\mathbf G\mathbf s_d^{(0)}\right\|_2^2.\tag{15}
$$

本文采用多径匹配追踪（MMP）算法 [4] 求解（15）。基于检测到的支持集 $\hat{\mathcal D}^{(0)}$，相应的第 $k$ 个 QAM 符号解调为

$$
\tilde s_{d,k}^{(0)}=\arg\min_{a\in\mathcal A}\left|\hat s_{d,k}^{(0)}-a\right|^2,\qquad k=1,2,\ldots,K,\tag{16}
$$

其中 $\mathcal A$ 表示 $M$ 阶 QAM 星座字母表。

### B. 迭代增强数据译码

对第 $j$ 次迭代（$j>0$），把上一次迭代得到的已译码稀疏数据向量进一步用作伪导频来精化信道估计。具体地，由第 $(j-1)$ 次迭代重建的扩展数据信号为

$$
\hat{\mathbf x}_d^{(j-1)}=\mathbf G\hat{\mathbf s}_d^{(j-1)}.\tag{17}
$$

把原始 PSP 与重建的扩展数据信号组合，形成新的导频信号：

$$
\mathbf x_{ep}^{(j)}=\sqrt{\alpha_p}\mathbf x_p+\sqrt{\alpha_d}\hat{\mathbf x}_d^{(j-1)}.\tag{18}
$$

基于新导频信号 $\mathbf x_{ep}^{(j)}$，第 $j$ 次信道估计的接收信号模型表述为

$$
\mathbf y=\mathbf A^{(j)}\mathbf c+\mathbf u,\tag{19}
$$

其中新测量矩阵写为 $\mathbf A^{(j)}=[\mathbf A_0^{(j)},\mathbf A_1^{(j)},\ldots,\mathbf A_{Q-1}^{(j)}]$，其第 $q$ 个子矩阵为

$$
\mathbf A_q^{(j)}=\mathbf F\operatorname{diag}(\mathbf b_q)\mathbf F^H\operatorname{diag}\left(\mathbf x_{ep}^{(j)}\right)\mathbf F_L,\tag{20}
$$

$q=0,1,\ldots,Q-1$。相应地，BEM 系数向量更新为 $\hat{\mathbf c}^{(j)}=\left((\mathbf A^{(j)})^H\mathbf A^{(j)}\right)^{-1}(\mathbf A^{(j)})^H\mathbf y$。利用 $\hat{\mathbf c}^{(j)}$ 可重建信道矩阵 $\hat{\mathbf H}_F^{(j)}$。

随后以与（14）—（16）类似的方式、基于更新后的信道矩阵 $\hat{\mathbf H}_F^{(j)}$ 执行数据译码。上述信道估计与数据译码迭代执行，直至达到最大迭代次数 $N_{\mathrm{iter}}$，或满足收敛判据

$$
\frac{\left\|\hat{\mathbf c}^{(j+1)}-\hat{\mathbf c}^{(j)}\right\|_2^2}{\left\|\hat{\mathbf c}^{(j)}\right\|_2^2}\leq\epsilon,\tag{21}
$$

其中 $\epsilon$ 为预设阈值（例如 $\epsilon=10^{-4}$）。

> **注：** 所提 PSP 图样把主导导频能量集中在每个 PSP 周围 $Q$ 个相邻子载波内，为初始信道估计与数据译码创造了低干扰区域。这使已译码数据符号能在后续迭代中作为有效伪导频，从而抑制信道估计与数据译码之间的误差传播。因此，与现有全 SP SVT 方案相比，所提 PSP-SVT 方案取得更快的收敛速度与更好的鲁棒性，第 IV 节仿真结果予以验证。

## IV. 仿真结果

本节通过蒙特卡洛仿真评估所提 PSP-SVT 方案的性能，包括 BLER、收敛行为以及最优 PSP 数量与功率分配比。选用现有无导频 SSC 方案 [5]、SSVT [13] 与 JPD-SVT [14] 作为基线方案。仿真参数设置如下：载波频率 4.9 GHz，子载波间隔 15 kHz。稀疏向量长度固定为 $N=132$，用户速度设为 $v=300$ km/h，BEM 阶数设为 $Q=2$，$K$ 个非零元素采用 QPSK 调制。仿真在 5G TDL-B 信道 [16] 上进行，该信道含 $L=6$ 条路径并遵循 Jakes 多普勒谱。

图 3 在相同稀疏度 $K=2$ 下比较所提 PSP-SVT 方案与 SSVT [13]、JPD-SVT [14]：基线方案使用 84 个 SP，而 PSP-SVT 方案使用 14 个 PSP。尽管导频数远少，PSP-SVT 在不同 SNR 下仍取得更好的 BLER 性能。可以看到 BLER 随 $\alpha_d$ 先降后升：$\alpha_d$ 过小导致有效数据 SNR 偏低，而 $\alpha_d$ 过大会降低导频功率、损害信道估计精度。PSP-SVT 的最优数据功率分配比高于 SSVT，约 0.7 对 0.63。这表明所提 PSP-SVT 方案可在保持可靠信道估计的同时把更多功率分配给数据传输。后续仿真中 PSP-SVT 采用 $\alpha_d=0.7$。

图 4 给出 PSP 数量 $N_P$ 对 BLER 性能的影响。当 $N_P<6$ 时 BLER 性能急剧退化，因为导频观测数不足以准确估计 BEM 系数（即 $N_P<QL$）；一旦有足够导频观测用于 BEM 系数估计，继续增大 $N_P$ 带来的增益有限，反而增加导频—数据干扰并缩小低干扰区域，从而使 BLER 性能退化。这些结果表明 PSP-SVT 系统中 PSP 数量与功率分配比应联合优化。据此，后续仿真采用 $N_P=14$，因为它在不同 SNR 下提供了有利的 BLER 折中。

图 5 比较各方案的 BLER 性能。无导频 SSC 方案 [5] 表现较差，因为它不涉及信道估计，在快速时变信道上失效；相反，所有导频辅助方案都能通过跟踪信道变化维持可靠译码。与 SSVT [13]、JPD-SVT [14] 相比，所提 PSP-SVT 在不同 SNR 下取得最佳 BLER 性能。该增益主要来自 PSP 图样：它通过部署少量 SP 降低导频—数据干扰，使迭代接收机从更准确的信道估计出发，从而有效抑制信道估计与数据译码之间的误差传播。这表明 SP 数量对平衡信道估计精度与译码可靠性至关重要。

图 6 比较不同子载波数下的 BLER 性能。所提 PSP-SVT 在所有测试的 $N_f$ 值上都优于 JPD-SVT，且随 $N_f$ 增大性能增益愈发显著。这是因为在固定导频数下，$N_f$ 越大 PSP-SVT 的导频部署越稀疏，从而扩大导频与数据之间的低干扰区域。于是信道估计与数据译码的初始化质量进一步改善，使所提 PSP 设计的优势在大子载波数下更加明显。

图 7 比较各方案的收敛速度。可以看到，在 $K=2$ 与 $K=3$ 两种情况下，所提 PSP-SVT 在第 0 次迭代的初始 BLER 都低于 SSVT 方案。这证实 PSP 图样通过降低接收信号中的导频—数据干扰，提供了更准确的初始信道估计与数据译码。注意两种方案收敛都很快，通常两次迭代内达到稳定性能，而所提 PSP-SVT 收敛到更低的 BLER 水平。值得注意的是，接收机负担主要来自每次迭代中的 BEM 信道估计与稀疏数据译码；由于 PSP-SVT 通常在两次迭代内收敛，其迭代处理负担仍然有限。对其他移动性条件，相同接收机结构仍然适用，只需按信道变化速率调整 BEM 阶数与 PSP 数量。

## V. 结论

本文面向高移动信道上的短包 URLLC 提出 PSP-SVT 方案。通过在部分子载波上稀疏部署少量导频，所提 PSP 图样有效降低了导频—数据干扰，并为接收机初始化创造了低干扰区域。基于该结构，我们在 Slepian-BEM 信道建模下设计了迭代联合信道估计与数据译码接收机，其中已译码数据符号被进一步复用为伪导频进行迭代精化。仿真结果表明，所提 PSP-SVT 方案在 BLER 性能与收敛速度上均优于现有全 SP 辅助 SVT 方案。

## 图注

**图 1（原 PDF 第 2 页）：** PSP-SVT 方案编码过程示意：$b_I$ 索引比特与 $b_S$ 调制比特经稀疏映射与 QAM 调制得到稀疏数据向量 $\mathbf s$，经码本 $\mathbf G$ 扩展为 $\mathbf x_d$，再与 PSP $\sqrt{\alpha_p}\mathbf x_p$ 叠加得到发射信号 $\mathbf x=\sqrt{\alpha_d}\mathbf x_d+\sqrt{\alpha_p}\mathbf x_p$。

**图 2（原 PDF 第 3 页）：** PSP 与扩展数据信号传输过程示意：接收导频信号 $y_p(\cdot)$ 与接收数据信号 $y_d(\cdot)$ 共同经 BEM 建模的等效信道；每个 PSP 周围 $Q$ 个相邻子载波构成低干扰区域。

**图 3（原 PDF 第 5 页）：** $N_P=14$ 时 BLER 随 $\alpha_d$ 的变化（SNR 为 4 dB 与 8 dB；基线为 SSVT [13]、JPD-SVT [14] 与所提 PSP-SVT）。

**图 4（原 PDF 第 5 页）：** $\alpha_d=0.7$ 时 BLER 随 PSP 数量 $N_P$ 的变化（SNR 为 4、6、8 dB）。

**图 5（原 PDF 第 5 页）：** $K=2$、$N_P=14$、$N_f=84$、$b=17$ 时 BLER 随 SNR 的变化（含无导频 SSC [5]、SSVT [13]、JPD-SVT [14]、所提 PSP-SVT 与完美 CSI 下的 PSP-SVT）。

**图 6（原 PDF 第 5 页）：** $K=2$、$b=17$ 时不同 $N_f$ 下 BLER 随 SNR 的变化。

**图 7（原 PDF 第 6 页）：** 不同 $K$ 下各方案的收敛速度（BLER 随迭代次数的变化）。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] C. Yue, V. Miloslavskaya, M. Shirvanimoghaddam, B. Vucetic, and Y. Li, "Efficient decoders for short block length codes in 6G URLLC," IEEE Commun. Mag., vol. 61, no. 4, pp. 84–90, Apr. 2023.

[2] D. Nguyen, M. Ding, P. Pathirana, A. Seneviratne, J. Li, D. Niyato, O. Dobre, and H. Poor, "6G internet of things: A comprehensive survey," IEEE Internet Things J., vol. 9, no. 1, pp. 359–383, Jan. 2022.

[3] W. Kim, H. Ji, H. Lee, Y. Kim, J. Lee, and B. Shim, "Sparse vector transmission: An idea whose time has come," IEEE Veh. Technol. Mag., vol. 15, no. 3, pp. 32–39, Sep. 2020.

[4] W. Kim, S. Bandari, and B. Shim, "Enhanced sparse vector coding for ultra-reliable and low latency communications," IEEE Trans. Veh. Technol., vol. 69, no. 5, pp. 5698–5702, May 2020.

[5] X. Zhang, D. Zhang, B. Shim, G. Han, D. Zhang, and T. Sato, "Sparse superimposed coding for short-packet URLLC," IEEE Internet Things J., vol. 9, no. 7, pp. 5275–5289, Apr. 2022.

[6] D. Han, J. Park, Y. Lee, H. Poor, and N. Lee, "Block orthogonal sparse superposition codes for ultra-reliable low-latency communications," IEEE Trans. Commun., vol. 71, no. 12, pp. 6884–6897, Dec. 2023.

[7] L. Yang and P. Fan, "Multiple-mode sparse superposed code with low block error rate for short packet URLLC," IEEE Commun. Lett., vol. 28, no. 2, pp. 248–252, Feb. 2024.

[8] X. Zhang, C. Yue, J. Guo, M. Shirvanimoghaddam, and Y. Li, "Generalized index redefinition-based sparse mapping for sparse vector transmission," IEEE Trans. Commun., vol. 73, no. 8, pp. 5920–5934, Aug. 2025.

[9] Y. Zhang, X. Zhu, Y. Liu, X. Fan, Y. Guan, M. L. Wong, and V. K. N. Lau, "Block sparse vector codes for ultra-reliable and low-latency short-packet transmission," IEEE Trans. Commun., vol. 73, no. 10, pp. 9750–9766, Oct. 2025.

[10] R. Zhang, B. Shim, Y. Lou, S. Jia, and W. Wu, "Sparse vector coding aided ultra-reliable and low-latency communications in multi-user massive MIMO systems," IEEE Trans. Veh. Technol., vol. 70, no. 1, pp. 1019–1024, Jan. 2021.

[11] Y. Luo, X. Zhu, Y. Zhang, and Z. Guo, "Sparse vector coding based massive grant-free access for short-packet communication in IIoT," in IEEE International Conference on Communications (ICC), Denver, CO, USA, 2024, pp. 5395–5400.

[12] Y. Zhang, X. Fan, H. Liang, W. Yang, J. Zheng, and T. H. Luan, "Semi-tensor sparse vector coding for short-packet urllc with low storage overhead," in 2025 IEEE Wireless Communications and Networking Conference (WCNC), Milan, Italy, 2025, pp. 1–6.

[13] Y. Zhang, X. Zhu, Y. Liu, Y. Jiang, Y. Guan, D. González G., and V. K. N. Lau, "Sparse superimposed vector transmission for short-packet high-mobility communication," IEEE Wireless Commun. Lett., vol. 12, no. 11, pp. 1961–1965, Nov. 2023.

[14] X. Zhang and K. Wang, "A joint pilot-data sparse vector transmission framework for short-packet urllc," IEEE Commun. Lett., vol. 30, pp. 1265–1269, Mar. 2026.

[15] Y. Zhang, X. Zhu, Y. Liu, Y. Guan, G. David, and V. K. N. Lau, "Basis expansion extrapolation based long-term channel prediction for massive MIMO OTFS systems," IEEE Trans. Wireless Commun., vol. 25, pp. 2280–2296, Feb. 2026.

[16] "Study on Channel Model for Frequencies From 0.5 to 100 GHz," Standard 3GPP TR 38.901, 2017.

## 资助声明

本工作部分受以下项目资助：国家自然科学基金（Grant 62601166）；广东省基础与应用基础研究基金（Grant 2024A1515110033 与 2024A1515110036）；东莞战略科学家团队项目（Grant 20231900700022）；国家自然科学基金重点项目（Grant W2611084）；广东省国际科技合作计划（Grant 2025A0505020024）；广东省重点领域研发计划（Grant 2026B0909060001）；广东省空天网络与智能感知重点实验室（grant 2024KSYS023）。

**本页范围与校对状态：** 本页依据 arXiv:2609.08661v1（eess.SP，2026-09-08，6 页）完成全文中文翻译：摘要、索引词、资助说明、第 I—V 节（含 II 编码过程、III-A 初始信道估计与数据译码、III-B 迭代增强译码及注、IV 仿真结果、V 结论）、图 1—7 中文图注、参考文献 [1]—[16] 英文原条目（按原编号）均按原文结构录入。编号公式 (1)—(21) 按原文保留。**原文无表格**，故无表格渲染核对项；图 1—7 的图注按原文第 2、3、5、6 页内容转录。**逐句逐式终校未做**；图内 BLER 曲线未作数字化读取，只转录图注与正文给出的关键结论（如 PSP-SVT 最优 $\alpha_d\approx0.7$ 对 SSVT 0.63、$N_P=14$、$K=2$、$v=300$ km/h、TDL-B 6 径等）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①原文摘要与正文中出现 "suﬀicient/eﬀiciency" 等连字抽取产物，属 PDF 抽取层问题，已按语义正常转录；②式（7）在抽取中排版紧凑，已按上下文语义复原索引关系（$P_n$ 与 $y_p(m)$ 的对应）；③原文为快报式短文，无附录与作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
