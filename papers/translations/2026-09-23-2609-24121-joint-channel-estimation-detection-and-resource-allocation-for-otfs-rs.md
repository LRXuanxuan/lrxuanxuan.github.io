---
layout: page
title: "OTFS-RSMA 的联合信道估计、检测与资源分配｜中文全文译文"
permalink: /papers/translations/2026-09-23-2609-24121-joint-channel-estimation-detection-and-resource-allocation-for-otfs-rs/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ced0378c092d0990/) · [原文 arXiv](https://arxiv.org/abs/2609.24121) · [全部目录](/papers/catalog/)

# OTFS-RSMA 的联合信道估计、检测与资源分配

**原题：** Joint Channel Estimation, Detection, and Resource Allocation for OTFS-RSMA  
**作者：** Chaedam Son、Si-Hyeon Lee（Senior Member, IEEE）  
**单位：** 韩国科学技术院（KAIST）电气工程学院（大田 34141，韩国）。邮箱：{scd5929, sihyeon}@kaist.ac.kr。（通讯作者：Si-Hyeon Lee。）  
**版本：** arXiv:2609.24121v1（eess.SP），2026-09-21，原文 13 页（含表 I、图 1—6、算法 1—2）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、式（1）—（46）（含 35a—d 等子式）、引理 1—4、定理 1—3、Remark 1—3、算法 1—2、表 I（逐格）、图 1—6 图注、参考文献 [1]—[24] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "2026-09-23"；本地 PDF 为 **arXiv:2609.24121v1 [eess.SP]，2026-09-21**，"2026-09-23" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

正交时频空间（OTFS）调制非常适合高移动性通信，但信道估计与高效多用户传输仍具挑战。本文提出一种 **OTFS 速率分割多址（RSMA）**框架，在不完美信道状态信息（CSI）下联合考虑导频传输、信道估计、消息检测与资源分配。针对公共消息与私有消息，我们考虑**保护带式**与**叠加式**两种传输结构，以权衡信道估计可靠性与谱效（SE）。我们推导线性最小均方误差（LMMSE）信道估计器、**误差感知消息传递检测器**，以及考虑信道估计误差的可处理替代速率表达式。基于这些表达式，构造联合资源分配问题，并提出基于连续凸近似（SCA）的二维搜索算法，以及利用资源分配解析结构的低复杂度替代算法。数值结果表明可靠的信道估计与 BER 性能，并显示：公共消息采用保护带式传输的配置可获得有利的和 SE 性能，而更优的私有消息结构取决于工作区间。低复杂度算法在显著降低计算时间的同时达到接近 SCA 的性能，且 OTFS-RSMA 仅需**一级 SIC** 即可与 OTFS-NOMA 保持竞争力。

**索引词**：OTFS；RSMA；导频传输；信道估计。

## I. 引言

随着第六代（6G）无线通信演进，自动驾驶、无人机（UAV）与低轨（LEO）卫星通信等高移动性应用日益重要。由此产生的严重多普勒效应形成双选择性信道，传统循环前缀（CP）辅助的正交频分复用（OFDM）在此受载波间干扰（ICI）影响。为应对该挑战，正交时频空间（OTFS）调制作为有前景的波形出现 [1], [2]：通过把信息符号映射到延迟—多普勒域，OTFS 利用稀疏信道结构提供近乎时不变的有效信道、降低导频开销并具备鲁棒性能。

然而在多用户 OTFS 系统中，正交资源分配减少了每个用户可用的延迟—多普勒资源，可能限制谱效 [4]。这促成了非正交资源共享，如采用叠加与串行干扰消除（SIC）的非正交多址（NOMA）[3]。NOMA 在实现高效资源共享的同时依赖 SIC 解码顺序，且可能需要多级 SIC。更近期，速率分割多址（RSMA）被引入 OTFS 系统 [5]–[8]：通过把用户消息分割为公共部分与私有部分，RSMA 灵活管理多用户干扰并减轻 SIC 负担。已有研究考察了 OTFS-RSMA 的和速率最大化 [5]、异构用户移动性 [6]、基于深度学习的检测 [7] 与 LEO 卫星通信 [8]。然而这些研究普遍假设所需 CSI 可得，未在 OTFS-RSMA 框架中显式处理信道估计。显式考虑信道估计在 OTFS-RSMA 中尤为重要，因为导频可能依公共/私有消息的传输结构而受到两者干扰，且估计误差会沿 SIC 传播。现有 OTFS 信道估计与导频设计研究 [9]–[14] 主要考虑保护带式与叠加式导频：保护带式通过保护带使导频免受数据干扰，代价是保护带开销，可获可靠估计 [9], [10]；叠加式允许导频与数据共享资源以提升谱效，但数据干扰会降低估计质量 [11]–[14]。因此二者存在信道估计可靠性与谱效之间的基本权衡。在 OTFS-RSMA 中，该权衡进一步与公共/私有消息的传输与解码相互作用，促使我们进行显式计入信道估计的联合系统设计。

本文提出一种 OTFS-RSMA 框架，在不完美 CSI 下联合考虑导频传输、信道估计、消息检测与资源分配。我们对公共与私有消息都考虑保护带式与叠加式传输，使它们对信道估计与数据传输的影响可纳入系统设计。我们发展信道估计与基于 SIC 的消息检测方法，并刻画由此产生的信道估计误差。基于该误差刻画，构造关于导频、公共数据与私有消息功率以及用户间公共速率份额的联合资源分配问题；该表述显式捕获资源分配与信道估计误差之间的耦合。我们进一步考察所得保护带式与叠加式配置并比较其和 SE 性能。据我们所知，此类对导频传输、信道估计、消息检测与资源分配的联合考虑在现有 OTFS-RSMA 研究中尚未出现。

主要贡献总结如下。

- **集成 OTFS-RSMA 框架**：提出在不完美 CSI 下联合考虑导频传输、信道估计、消息检测与资源分配的 OTFS-RSMA 框架。公共消息与私有消息均考虑保护带式与叠加式传输，使二者对信道估计与数据传输的影响可纳入整体系统设计。
- **信道估计与误差感知消息检测**：在存在数据干扰时推导闭式 LMMSE 信道估计及相应均方误差（MSE）表达式。基于所得信道误差刻画，为公共消息与私有消息发展消息传递检测器，显式计入信道估计误差与 SIC 残余干扰。
- **资源分配**：推导考虑信道估计误差的可处理替代速率表达式，并构造关于导频、公共数据与私有消息功率以及公共速率分配的联合资源分配问题。发展基于连续凸近似（SCA）的二维搜索算法，以及基于保守私有速率近似的低复杂度替代算法；对后者进一步刻画资源分配结构并导出公共速率与私有功率分配的闭式解。
- **数值评估**：数值结果展示所提框架的信道估计与误码率（BER）性能，并揭示所考虑保护带式/叠加式配置间的和 SE 权衡。特别地，公共消息采用保护带式传输的配置取得有利的和 SE 性能，而更优的私有消息结构取决于工作区间；低复杂度资源分配算法在显著降低计算时间的同时达到接近 SCA 的性能，且 OTFS-RSMA 仅需一级 SIC 即可与 OTFS-NOMA 保持竞争力。

**记号**：标量为常规斜体，向量与矩阵为粗体，其维数在首次定义时说明。矩阵 $\mathbf X$ 的第 $(i,j)$ 元素记为 $X(i,j)$，向量 $\mathbf x$ 的第 $i$ 个元素记为 $x(i)$；$\mathbf X^T$ 与 $\mathbf X^H$ 分别表示转置与 Hermitian 转置，$\operatorname{Tr}(\mathbf X)$ 表示迹。标量 $x$ 的绝对值记为 $|x|$，$\|\cdot\|$ 对向量表示欧氏范数、对矩阵表示 Frobenius 范数；$\operatorname{vec}(\mathbf X)$ 把矩阵各列堆叠为单向量。均值为 $\boldsymbol\mu$、协方差为 $\boldsymbol\Sigma$ 的循环对称复高斯分布记为 $\mathcal{CN}(\boldsymbol\mu,\boldsymbol\Sigma)$；期望与方差算子记为 $\mathbb E[\cdot]$ 与 $\operatorname{Var}[\cdot]$。

## II. 系统模型

我们考虑基于 OTFS 调制的下行多用户 RSMA 系统：单天线基站（BS）服务 $U$ 个单天线用户，用户索引集为 $\mathcal U\triangleq\{1,\ldots,U\}$。每帧 OTFS 的时长为 $T_f=NT$、带宽为 $B=M\Delta f$，其中 $N$ 与 $M$ 分别为时间与频率采样点数，$T$ 与 $\Delta f=1/T$ 分别为时间轴与频率轴采样间隔。假设 BS 与用户均具有**统计 CSI** [15]。BS 向各用户发送独立消息；按 RSMA 框架，每个用户的消息被分割为公共部分与私有部分：所有用户的公共部分合并为一条由所有用户解码的公共消息，而各私有部分编码为仅发给对应用户的私有消息。每个用户先解码公共消息并经 SIC 消除，再解码自身私有消息。

OTFS 系统中的导频传输方案可大致分为保护带式与叠加式。保护带式导频用保护符号消除导频与数据符号间干扰，从而以谱效为代价获得准确信道估计 [9]；叠加式导频通过去除保护符号提升资源利用率，但引入导频—数据干扰，通常需要 SIC 才能可靠检测 [12]–[14]。我们通过允许公共消息与私有消息各自独立采用保护带式（G）或叠加式（S）结构，来考虑 OTFS-RSMA 中可能的导频传输配置。由此得到四种配置，记为 **GG、GS、SG、SS**，其中第一、二个字母分别表示公共消息与私有消息的结构。例如 GS 采用保护带式公共消息与叠加式私有消息，SG 采用叠加式公共消息与保护带式私有消息，GG 与 SS 分别对两类消息采用相同的保护带式与叠加式结构。

下文聚焦非对称的 **GS 配置**（公共消息保护带式、私有消息叠加式），给出系统模型并发展相应的信道估计、检测与资源分配方法；其余三种配置的扩展稍后简述。GS 配置下，导频嵌在公共消息中并由保护带与公共数据隔开，而私有消息在无保护带的整个延迟—多普勒（DD）网格上传输，包括导频区域。每个用户先用导频估计信道、解码公共消息、经 SIC 消除，再解码自身私有消息。详细信道与信号模型见以下各小节。

### A. 信道模型

第 $u$ 个用户的延迟—多普勒信道为

$$
h_u(\tau,\nu)=\sum_{q=1}^{Q_u}h_{u,q}\delta\left(\tau-\tau_{u,q}\right)\delta\left(\nu-\nu_{u,q}\right),\tag{1}
$$

其中 $Q_u$ 为用户 $u$ 的传播路径数，$h_{u,q}$、$\tau_{u,q}$、$\nu_{u,q}$ 分别为用户 $u$ 第 $q$ 条路径的复信道增益、时延与多普勒频移。为便于解析处理，假设所有用户的路径数相同，即 $Q_1=Q_2=\cdots=Q_U=Q$。用户 $u$ 第 $q$ 条路径的时延与多普勒为 $\tau_{u,q}=\frac{l_{u,q}}{M\Delta f}$ 与 $\nu_{u,q}=\frac{k_{u,q}}{NT}$，其中 $l_{u,q}$ 与 $k_{u,q}$ 为（有界的）时延与多普勒索引。记所有用户与路径上的最大时延与多普勒索引为 $l_{\max}\triangleq\max_{u,q}l_{u,q}$ 与 $k_{\max}\triangleq\max_{u,q}|k_{u,q}|$。假设 $M$ 与 $N$ 足够大以致分数时延与分数多普勒可忽略，即 $l_{u,q}$ 与 $k_{u,q}$ 为整数 [11], [17]。进一步假设 DD 域信道增益 $h_{u,q}$ 在路径与用户间不相关且服从复高斯分布 [12]；用户 $u$ 的信道增益向量为 $\mathbf h_u=[h_{u,1},\ldots,h_{u,Q}]^T\sim\mathcal{CN}(\mathbf 0,\mathbf K_{\mathbf h_u,\mathbf h_u})$，协方差矩阵 $\mathbf K_{\mathbf h_u,\mathbf h_u}=\operatorname{diag}(\sigma_{u,1}^2,\ldots,\sigma_{u,Q}^2)$。记用户 $u$ 的有效信道增益为 $\sigma_u^2=\operatorname{Tr}\left(\mathbf K_{\mathbf h_u,\mathbf h_u}\right)=\sum_{q=1}^{Q}\sigma_{u,q}^2$。

### B. 信号模型

我们在延迟—多普勒域考虑一条公共消息与 $U$ 条私有消息。令 $x_c[l,k]$ 与 $x_{p,u}[l,k]$ 分别表示第 $(l,k)$ 个 DD 索引处的公共消息符号与用户 $u$ 的私有消息符号，其中 $l\in\{0,\ldots,M-1\}$、$k\in\{0,\ldots,N-1\}$。公共消息具有含导频、保护带与数据符号的非对称结构（遵循保护带式导频结构 [9]），而各私有消息只含数据符号。令 $\mathcal A_{\mathrm{pilot}}^{\mathrm{DD}}=\{(l_r,k_r)\}$、$\mathcal A_{\mathrm{guard}}^{\mathrm{DD}}=\{(l,k):l_r-l_{\max}\le l\le l_r+l_{\max},\ k_r-2k_{\max}\le k\le k_r+2k_{\max}\}\setminus\mathcal A_{\mathrm{pilot}}^{\mathrm{DD}}$、$\mathcal A_{\mathrm{data}}^{\mathrm{DD}}=\{(l,k):0\le l\le M-1,0\le k\le N-1\}\setminus(\mathcal A_{\mathrm{pilot}}^{\mathrm{DD}}\cup\mathcal A_{\mathrm{guard}}^{\mathrm{DD}})$ 分别表示公共消息的导频、保护带与数据位置集合，$(l_r,k_r)$ 为导频位置。公共消息符号构造为

$$
x_c[l,k]=\begin{cases}x_{c,r},&(l,k)\in\mathcal A_{\mathrm{pilot}}^{\mathrm{DD}},\\ 0,&(l,k)\in\mathcal A_{\mathrm{guard}}^{\mathrm{DD}},\\ x_{c,d}[l,k],&(l,k)\in\mathcal A_{\mathrm{data}}^{\mathrm{DD}},\end{cases}\tag{2}
$$

其中 $x_{c,r}$ 为导频（参考）符号 [9]，$x_{c,d}[l,k]$ 为公共数据符号。每个数据符号取自基数为 $S$ 的有限星座集 $\mathcal S$，即 $x_{c,d}[l,k]\in\mathcal S$、$x_{p,u}[l,k]\in\mathcal S$。令 $\mathcal S_{l,k}$ 表示 $x_c[l,k]$ 所取自的星座集，即当 $(l,k)\in\mathcal A_{\mathrm{pilot}}^{\mathrm{DD}}$ 时 $\mathcal S_{l,k}=\{x_{c,r}\}$，$(l,k)\in\mathcal A_{\mathrm{guard}}^{\mathrm{DD}}$ 时 $\{0\}$，$(l,k)\in\mathcal A_{\mathrm{data}}^{\mathrm{DD}}$ 时 $\mathcal S$。假设数据符号独立、零均值且在 DD 索引与用户间不相关。记 $P_{c,d}$、$P_{p,u}$ 与 $P_{c,r}$ 分别为公共数据符号、用户 $u$ 私有消息符号与导频符号的发射功率，即 $\mathbb E[|x_{c,d}[l,k]|^2]=P_{c,d}$、$\mathbb E[|x_{p,u}[l,k]|^2]=P_{p,u}$、$|x_{c,r}|^2=P_{c,r}$。进一步定义 $P_p=\sum_{u=1}^{U}P_{p,u}$ 为私有消息总功率，$N_g=(4k_{\max}+1)(2l_{\max}+1)-1$ 为保护符号数。

于是第 $(l,k)$ 个 DD 索引处的总发射符号为

$$
x[l,k]=x_c[l,k]+\sum_{u=1}^{U}x_{p,u}[l,k].\tag{3}
$$

令 $\mathbf X\in\mathbb C^{M\times N}$ 表示由 $\{x[l,k]\}$ 构成的矩阵，即 $X(l+1,k+1)=x[l,k]$；类似定义 $\mathbf X_c$ 与 $\mathbf X_{p,u}$。DD 符号经逆辛有限傅里叶变换（ISFFT）映射到时频域，并以矩形发射波形经无线信道发送。标准 OTFS 解调后，接收信号可在 DD 域表示为 [17]

$$
y_u[l,k]=\sum_{q=1}^{Q}h_{u,q}\alpha_{u,q}(l,k)x\left([l-l_{u,q}]_M,[k-k_{u,q}]_N\right)+n_u[l,k],\tag{4}
$$

其中 $n_u[l,k]\sim\mathcal{CN}(0,\sigma_n^2)$ 为加性白高斯噪声（AWGN），$\alpha_{u,q}(l,k)$ 为矩形波形引入的附加相移，由下式给出：

$$
\alpha_{u,q}(l,k)=\begin{cases}e^{j\frac{2\pi}{N}\left(\frac{l-l_{u,q}}{M}\right)k},&l\ge l_{u,q},\\[4pt]e^{j\frac{2\pi}{N}\left(\frac{l-l_{u,q}}{M}\right)k}e^{-j\frac{2\pi}{N}k},&l<l_{u,q}.\end{cases}\tag{5}
$$

为便于解析，把接收 DD 符号向量化为 $\mathbf y_u\in\mathbb C^{MN}$，输入输出关系为

$$
\mathbf y_u=\mathbf H_u\sum_{j=1}^{U}\mathbf x_{p,j}+\mathbf H_u\mathbf x_c+\mathbf n_u,\tag{6}
$$

其中 $\mathbf H_u\in\mathbb C^{MN\times MN}$ 为用户 $u$ 的等效 DD 域信道矩阵，$\mathbf H_u=\sum_{q=1}^{Q}h_{u,q}\left(\mathbf F_N\otimes\mathbf G_{\mathrm{rx}}\right)\boldsymbol\Pi^{l_{u,q}}\boldsymbol\Delta^{k_{u,q}}\left(\mathbf F_N^H\otimes\mathbf G_{\mathrm{tx}}\right)$；$\mathbf F_N$ 为 $N\times N$ 归一化离散傅里叶变换（DFT）矩阵，矩形收发射脉冲下 $\mathbf G_{\mathrm{tx}}=\mathbf G_{\mathrm{rx}}=\mathbf I_M$；$\boldsymbol\Pi$ 与 $\boldsymbol\Delta$ 分别为时延域循环移位矩阵与多普勒域相移矩阵 [12]。此外 $\mathbf x_c=\operatorname{vec}(\mathbf X_c)$、$\mathbf x_{p,j}=\operatorname{vec}(\mathbf X_{p,j})$ 为向量化的公共与私有消息，$\mathbf n_u\sim\mathcal{CN}(\mathbf 0_{MN},\sigma_n^2\mathbf I_{MN})$ 为噪声向量。我们采用列向量化，第 $(l,k)$ 个 DD 索引映射为向量索引 $\nu(l,k)=l+1+kM\in\{1,\ldots,MN\}$，故 $x_c(\nu(l,k))=x_c[l,k]$；相应导频、保护带与数据位置对应的向量索引集记为 $\mathcal A_\chi=\{\nu(l,k):(l,k)\in\mathcal A_\chi^{\mathrm{DD}}\}$。

## III. 所提框架

本节描述信道估计与数据检测流程。公共消息的结构非对称性（含导频、保护带与公共数据），以及信道估计期间来自私有消息的干扰，要求一种不同于传统 OTFS 系统的定制处理策略。我们先给出基于 LMMSE 估计器 [18] 的信道估计流程，再描述用消息传递算法 [9] 解码公共与私有消息的过程。

### A. 信道估计

接收后，每个用户利用嵌在公共消息中的导频符号估计信道。对信道估计，把 DD 域观测索引集定义为 $\mathcal A_{\mathrm{obs}}^{\mathrm{DD}}=\{(l,k):l_r\le l\le l_r+l_{\max},\ k_r-k_{\max}\le k\le k_r+k_{\max}\}$，其基数为 $N_{\mathrm{obs}}=(2k_{\max}+1)(l_{\max}+1)$；借助映射 $\nu(l,k)$ 得到相应向量索引集 $\mathcal A_{\mathrm{obs}}=\{\nu(l,k):(l,k)\in\mathcal A_{\mathrm{obs}}^{\mathrm{DD}}\}$。观测向量 $\bar{\mathbf y}_u\in\mathbb C^{N_{\mathrm{obs}}}$ 由 $\mathbf y_u$ 中索引属于 $\mathcal A_{\mathrm{obs}}$ 的条目构成，可表示为

$$
\bar{\mathbf y}_u=\bar{\mathbf h}_ux_{c,r}+\bar{\mathbf H}_u\mathbf x_p+\bar{\mathbf n}_u=\bar{\mathbf h}_ux_{c,r}+\tilde{\mathbf n}_u,\tag{7}
$$

其中 $\bar{\mathbf h}_u\in\mathbb C^{N_{\mathrm{obs}}}$ 为所选观测索引上的导频诱导信道向量：其对应实际 DD 抽头的 $Q$ 个条目由 $\mathbf h_u$ 的元素在已知确定性相移内确定，其余条目为零；$\bar{\mathbf H}_u\in\mathbb C^{N_{\mathrm{obs}}\times MN}$ 为与聚合私有消息 $\mathbf x_p=\sum_{j=1}^{U}\mathbf x_{p,j}$ 相关的信道矩阵；$\bar{\mathbf n}_u\sim\mathcal{CN}(\mathbf 0_{N_{\mathrm{obs}}},\sigma_n^2\mathbf I_{N_{\mathrm{obs}}})$ 为噪声向量；$\tilde{\mathbf n}_u=\bar{\mathbf H}_u\mathbf x_p+\bar{\mathbf n}_u$ 为有效噪声向量。给出信道估计流程之前，先刻画有效噪声的分布。

**引理 1**：有效噪声向量 $\tilde{\mathbf n}_u$ 可近似为

$$
\tilde{\mathbf n}_u\sim\mathcal{CN}\left(\mathbf 0_{N_{\mathrm{obs}}},\left(P_p\sigma_u^2+\sigma_n^2\right)\mathbf I_{N_{\mathrm{obs}}}\right).\tag{8}
$$

**证明**：由 $\tilde{\mathbf n}_u=\bar{\mathbf H}_u\mathbf x_p+\bar{\mathbf n}_u$，聚合私有消息干扰为零均值，并由中心极限定理 [19] 可近似为高斯分布。又因 $\mathbb E[\mathbf x_p\mathbf x_p^H]=P_p\mathbf I_{MN}$ 与 $\mathbb E[\bar{\mathbf H}_u\bar{\mathbf H}_u^H]=\sigma_u^2\mathbf I_{N_{\mathrm{obs}}}$，可得 $\mathbb E[\tilde{\mathbf n}_u\tilde{\mathbf n}_u^H]=(P_p\sigma_u^2+\sigma_n^2)\mathbf I_{N_{\mathrm{obs}}}$，证毕。

基于引理 1，有效噪声被刻画为各向同性，可建模为白高斯噪声。因此 [9] 中的阈值式信道抽头估计方法可用于从 $\bar{\mathbf y}_u$ 中辨识 DD 支撑（基于式（7）），从而得到相应时延与多普勒索引 [9], [10]。由于该流程在既有工作中已成熟，此处从略。受 [12] 在中等信噪比（SNR）下近乎完美的 DD 支撑检测结果启发，我们假设 $Q$ 个信道抽头的支撑被完美估计。在此假设下，从 $\bar{\mathbf y}_u$ 提取与估计 DD 支撑对应的 $Q$ 维子向量 $\tilde{\mathbf y}_u$，并按与 $\mathbf h_u$ 一致的方式索引。由于 OTFS 路径方差遵循依赖时延的功率剖面 [9], [12]，$\tilde{\mathbf y}_u(q)$ 与 $h_{u,q}$ 相关联、方差为 $\sigma_{u,q}^2$。随后用 LMMSE 估计器 [18] 估计信道增益；在构造 $\tilde{\mathbf y}_u$ 时补偿已知的路径相关相位，导频取 $x_{c,r}=\sqrt{P_{c,r}}$。

**定理 1**：基于 $\tilde{\mathbf y}_u$，$\mathbf h_u$ 第 $q$ 个元素的 LMMSE 估计为

$$
\hat h_{u,q}=\frac{\sigma_{u,q}^2\sqrt{P_{c,r}}}{P_{c,r}\sigma_{u,q}^2+P_p\sigma_u^2+\sigma_n^2}\,\tilde y_u(q).\tag{9}
$$

此外，信道估计误差协方差矩阵为如下对角阵：

$$
\mathbb E\left[\left(\mathbf h_u-\hat{\mathbf h}_u\right)\left(\mathbf h_u-\hat{\mathbf h}_u\right)^H\right]=\operatorname{diag}\left(\left(\sigma_{u,1}^{\mathrm{err}}\right)^2,\ldots,\left(\sigma_{u,Q}^{\mathrm{err}}\right)^2\right),\tag{10}
$$

其中 $\left(\sigma_{u,q}^{\mathrm{err}}\right)^2=\frac{\sigma_{u,q}^2\left(P_p\sigma_u^2+\sigma_n^2\right)}{P_{c,r}\sigma_{u,q}^2+P_p\sigma_u^2+\sigma_n^2}$，$\mathbf e_u=\mathbf h_u-\hat{\mathbf h}_u$ 为信道误差向量。

**证明**：输入输出关系可写为 $\tilde{\mathbf y}_u=\mathbf h_u x_{c,r}+\dot{\mathbf n}_u$，其中 $\dot{\mathbf n}_u\in\mathbb C^{Q}$ 为 $\tilde{\mathbf n}_u$ 的相应子向量。由引理 1，$\tilde{\mathbf n}_u$ 各向同性，故其子向量 $\dot{\mathbf n}_u\sim\mathcal{CN}(\mathbf 0,(P_p\sigma_u^2+\sigma_n^2)\mathbf I_Q)$ 且与 $\mathbf h_u$ 不相关。因此 LMMSE 估计器在各抽头间解耦，对每个抽头由标准 LMMSE 公式即得式（9）；相应误差协方差为 $\left(\sigma_{u,q}^{\mathrm{err}}\right)^2=\sigma_{u,q}^2-\frac{P_{c,r}\sigma_{u,q}^4}{P_{c,r}\sigma_{u,q}^2+P_p\sigma_u^2+\sigma_n^2}$，整理即得式（10），证毕。

在上述闭式 MSE 表达基础上，我们进一步计入由信道估计误差导致的不完美 SIC 残余干扰——这是本工作相对许多忽略信道不确定性与 SIC 误差的既有研究的关键区别。

### B. 基于消息传递的数据检测

基于式（6），可用信道矩阵 $\mathbf H_u$ 的逆做均衡以恢复发射符号；但有效 OTFS 信道矩阵规模为 $MN\times MN$，该做法复杂度为 $O((MN)^3)$，在大型系统中不实用。为此我们采用基于消息传递的解码方法 [12]，沿用传统 OTFS 系统中常用的低复杂度检测框架。消息传递算法构造因子图：发射数据符号为变量节点、接收向量条目为观测节点，数据检测通过相连节点间迭代交换消息直至收敛。

每个用户先解码公共数据，再解码其私有消息。从公共数据解码视角看，用户 $u$ 的接收向量可表示为

$$
\mathbf y_u=\hat{\mathbf H}_u\mathbf x_c+\underbrace{\mathbf H_u^{\mathrm{err}}\mathbf x_c+\mathbf H_u\mathbf x_p+\mathbf n_u}_{\tilde{\mathbf n}_{c,u}},\tag{11}
$$

其中 $\hat{\mathbf H}_u=\left(\mathbf F_N\otimes\mathbf G_{\mathrm{rx}}\right)\sum_{q=1}^{Q}\hat h_{u,q}\boldsymbol\Pi^{\hat l_{u,q}}\boldsymbol\Delta^{\hat k_{u,q}}\left(\mathbf F_N^H\otimes\mathbf G_{\mathrm{tx}}\right)$ 为用户 $u$ 的估计 DD 信道矩阵（$\hat l_{u,q}$、$\hat k_{u,q}$ 为第 $q$ 个抽头的估计时延与多普勒索引），$\mathbf H_u^{\mathrm{err}}=\left(\mathbf F_N\otimes\mathbf G_{\mathrm{rx}}\right)\sum_{q=1}^{Q}\left(h_{u,q}-\hat h_{u,q}\right)\boldsymbol\Pi^{\hat l_{u,q}}\boldsymbol\Delta^{\hat k_{u,q}}\left(\mathbf F_N^H\otimes\mathbf G_{\mathrm{tx}}\right)$ 为 DD 信道误差矩阵；$\tilde{\mathbf n}_{c,u}$ 为公共数据解码中的有效噪声向量。因此 $\mathbf y_u(a)$ 由经稀疏 OTFS 信道的 $\mathbf x_c$ 的 $Q$ 个元素与有效噪声项 $\tilde n_{c,u}(a)$ 决定。基于该向量化表示，把 $\mathbf y_u(a)$ 作为第 $a$ 个观测节点、$\mathbf x_c(b)$ 作为第 $b$ 个变量节点构造消息传递因子图，相应输入输出关系可写为

$$
\mathbf y_u(a)=\hat{\mathbf H}_u(a,b)\mathbf x_c(b)+\sum_{d\in\mathcal I_u(a)\setminus\{b\}}\hat{\mathbf H}_u(a,d)\mathbf x_c(d)+\tilde n_{c,u}(a),\tag{12}
$$

其中 $\mathcal I_u(a)$ 表示 $\hat{\mathbf H}_u$ 第 $a$ 行非零元对应的列索引集；类似地，$\mathcal J_u(b)$ 表示第 $b$ 列非零元对应的行索引集。

消息传递算法中，每个观测节点在每次迭代向相连变量节点发送残余干扰的均值与方差。设 $\mu_{a,b}^{(i)}$ 与 $\left(\sigma_{a,b}^{(i)}\right)^2$ 为第 $i$ 次迭代中观测节点 $a$ 处（排除变量节点 $b$）残余干扰的均值与方差。按 [12] 中的高斯消息传递近似，它们为

$$
\mu_{a,b}^{(i)}=\sum_{d\in\mathcal I_u(a)\setminus\{b\}}\sum_{\alpha_j\in\mathcal S_{l,k}}p_{d,a}^{(i-1)}(\alpha_j)\alpha_j\hat{\mathbf H}_u(a,d)+\mathbb E\left[\tilde n_{c,u}(a)\right],\tag{13}
$$

$$
\left(\sigma_{a,b}^{(i)}\right)^2=\sum_{d\in\mathcal I_u(a)\setminus\{b\}}\left[\sum_{\alpha_j\in\mathcal S_{l,k}}p_{d,a}^{(i-1)}(\alpha_j)\left|\alpha_j\hat{\mathbf H}_u(a,d)\right|^2-\left|\sum_{\alpha_j\in\mathcal S_{l,k}}p_{d,a}^{(i-1)}(\alpha_j)\alpha_j\hat{\mathbf H}_u(a,d)\right|^2\right]+\operatorname{Var}\left[\tilde n_{c,u}(a)\right],\tag{14}
$$

其中 $p_{d,a}^{(i-1)}(\alpha_j)$ 表示第 $(i-1)$ 次迭代从变量节点 $d$ 传给观测节点 $a$ 的符号 $\alpha_j$ 的概率质量函数（PMF）。为在消息传递框架中处理取零值的保护符号，把数据星座 $\mathcal S$ 增广零符号，即 $\alpha_j\in\{0\}\cup\mathcal S$。由于保护带的存在，公共数据检测时导频符号 $x_{c,r}$ 不对公共数据符号产生干扰；为记号方便，导频位置也以零符号表示。相应地，PMF 初始化为：对 $d\in\mathcal A_{\mathrm{data}}$ 且 $\alpha_j\in\mathcal S$ 取等概率，而对 $d\in\mathcal A_{\mathrm{pilot}}\cup\mathcal A_{\mathrm{guard}}$ 取零符号概率为 1，其余概率置零。由此出发先计算有效噪声 $\tilde n_{c,u}(a)$ 的均值与方差：由于所采用信道模型中各信道系数零均值，且公共数据与私有消息符号零均值、$\mathbf n_u$ 为零均值 AWGN，故 $\mathbb E[\tilde n_{c,u}(a)]=0,\ \forall a$，$\tilde n_{c,u}(a)$ 的方差等于其二阶矩：

$$
\operatorname{Var}\left[\tilde n_{c,u}(a)\right]=\sum_{b\in\mathcal I_u(a)}\left|H_u^{\mathrm{err}}(a,b)\right|^2P_c(b)+P_p\sigma_u^2+\sigma_n^2,\tag{15}
$$

其中 $\mathbb E[|H_u^{\mathrm{err}}(a,b)|^2]$ 为逐元素信道误差方差，$P_c(b)$ 为位置相关的公共符号功率：

$$
P_c(b)=\begin{cases}P_{c,r},&b\in\mathcal A_{\mathrm{pilot}},\\ 0,&b\in\mathcal A_{\mathrm{guard}},\\ P_{c,d},&b\in\mathcal A_{\mathrm{data}}.\end{cases}\tag{16}
$$

在第 $i$ 次迭代的每个变量节点，利用接收均值与方差 $\mu_{a,b}^{(i)}$、$\left(\sigma_{a,b}^{(i)}\right)^2$ 计算 PMF $p_{b,a}^{(i)}(\alpha_j)$：

$$
p_{b,a}^{(i)}(\alpha_j)\propto\prod_{a\in\mathcal J_u(b)\setminus\{a\}}\exp\left(-\frac{\left|\mathbf y_u(a)-\mu_{a,b}^{(i)}-\hat{\mathbf H}_u(a,b)\alpha_j\right|^2}{\left(\sigma_{a,b}^{(i)}\right)^2}\right),\tag{17}
$$

其中对 $b\in\mathcal A_{\mathrm{guard}}\cup\mathcal A_{\mathrm{pilot}}$ 取 $p_{b,a}^{(i)}(0)=1$、$\alpha_j\neq0$ 时为零。为提升稳定性与收敛性，采用阻尼方案 [20]：

$$
p_{b,a}^{(i)}(\alpha_j)\leftarrow\Delta p_{b,a}^{(i-1)}(\alpha_j)+(1-\Delta)p_{b,a}^{(i)}(\alpha_j),\tag{18}
$$

其中 $\Delta\in[0,1)$ 为阻尼因子。所得边消息 $p_{b,a}^{(i)}(\alpha_j)$ 再传给相连观测节点。用于收敛检查与符号判决，定义第 $i$ 次迭代变量节点 $b$ 处符号 $\alpha_j\in\mathcal S$ 的边缘 PMF 为

$$
p_b^{(i)}(\alpha_j)\propto\prod_{a\in\mathcal J_u(b)}p_{a,b}^{(i)}(\alpha_j),\qquad \alpha_j\in\mathcal S.\tag{19}
$$

这些均值—方差消息与 PMF 在观测与变量节点间迭代交换。收敛判据定义为

$$
\zeta^{(i)}=\frac{1}{N_c}\sum_{b\in\mathcal A_{\mathrm{data}}}\mathbb I\left(\arg\max_{\alpha_j\in\mathcal S}p_b^{(i)}(\alpha_j)=\arg\max_{\alpha_j\in\mathcal S}p_b^{(i-1)}(\alpha_j)\right),\tag{20}
$$

其中 $N_c=MN-N_g-1$ 为公共数据符号数，$\mathbb I(\cdot)$ 为示性函数。当 $\zeta^{(i)}\ge\zeta_{\mathrm{th}}$ 或 $i=i_{\max}$ 时算法终止（$\zeta_{\mathrm{th}}\in(0,1]$ 为预设阈值，$i_{\max}$ 为最大迭代次数）。收敛判据仅在公共数据位置上评估。收敛后，第 $b$ 个变量节点（$b\in\mathcal A_{\mathrm{data}}$）的检测公共数据符号取为

$$
\hat{\mathbf x}_c(b)=\arg\max_{\alpha_j\in\mathcal S}p_b^{(i)}(\alpha_j).\tag{21}
$$

上述用于公共数据检测的消息传递算法记为 **MP-C**，见算法 1。

**算法 1**　公共数据检测的消息传递（MP-C）

1: **输入**：$\mathcal S$、$\mathbf y_u$、$\hat{\mathbf H}_u$、$\mathbf K_{\mathbf h_u\mathbf h_u}$、$\boldsymbol\Sigma_u$、$P_{c,r}$、$P_{c,d}$、$P_{p,u}$、$P_p$、$\sigma_n^2$、$\Delta$、$\epsilon$、$\zeta_{\mathrm{th}}$、$i_{\max}$。
2: **初始化**：置 $i=1$；对 $b\in\mathcal A_{\mathrm{data}}$、$\alpha_j\in\mathcal S$ 初始化 $p_{b,a}^{(0)}$ 为等概率，对 $b\in\mathcal A_{\mathrm{pilot}}\cup\mathcal A_{\mathrm{guard}}$ 取 $p_{b,a}^{(0)}(0)=1$；未指定 PMF 条目置零。
3: **repeat**
4: 　用（13）（14）计算 $\mu_{a,b}^{(i)}$ 与 $\left(\sigma_{a,b}^{(i)}\right)^2$；
5: 　用（17）更新 $p_{b,a}^{(i)}$，并按（18）阻尼更新；
6: 　计算收敛判据 $\zeta^{(i)}$；
7: **until** $\zeta^{(i-1)}\ge\zeta_{\mathrm{th}}$ 或 $i=i_{\max}$；
8: 按（21）计算符号估计 $\hat{\mathbf x}_c$。

私有消息解码采用类似的消息传递流程。经 SIC 消除已解码公共消息后，所得检测模型与公共数据情形结构相同，仅有效噪声项不同。在公共数据完美解码假设下，从私有消息解码视角看用户 $u$ 的接收向量可写为

$$
\mathbf y_{p,u}=\mathbf y_u-\hat{\mathbf H}_u\hat{\mathbf x}_c=\hat{\mathbf H}_u\mathbf x_{p,u}+\tilde{\mathbf n}_{p,u},\tag{22}
$$

其中有效噪声 $\tilde{\mathbf n}_{p,u}=\mathbf H_u^{\mathrm{err}}\mathbf x_{p,u}+\mathbf H_u\sum_{j\neq u}\mathbf x_{p,j}+\mathbf H_u^{\mathrm{err}}\hat{\mathbf x}_c+\mathbf n_u$。按与公共数据解码相同的方式构造消息传递框架，第 $a$ 个观测节点 $\mathbf y_{p,u}(a)$ 与第 $b$ 个变量节点 $\mathbf x_{p,u}(b)$ 的输入输出关系为

$$
\mathbf y_{p,u}(a)=\hat{\mathbf H}_u(a,b)\mathbf x_{p,u}(b)+\sum_{d\in\mathcal I_u(a)\setminus\{b\}}\hat{\mathbf H}_u(a,d)\mathbf x_{p,u}(d)+\tilde n_{p,u}(a).\tag{23}
$$

与公共数据情形类似，私有消息解码的有效噪声方差为

$$
\operatorname{Var}\left[\tilde n_{p,u}(a)\right]=\sum_{b\in\mathcal I_u(a)}\mathbb E\left[\left|\hat H_u(a,b)\right|^2\right]\left(P_c(b)+P_{p,u}\right)+P_p\sigma_u^2+\sigma_n^2.\tag{24}
$$

其余步骤与公共数据解码相同：把（13）（14）中的 $\tilde n_{c,u}(a)$ 替换为 $\tilde n_{p,u}(a)$，迭代交换均值—方差消息与 PMF 直至收敛（此时（20）的判据以 $\{1,\ldots,MN\}$ 与 $MN$ 替换 $\mathcal A_{\mathrm{data}}$ 与 $N_c$），收敛后按（21）估计发射符号（以 $\hat{\mathbf x}_{p,u}(b)$ 替换 $\hat{\mathbf x}_c(b)$）。因此私有消息检测算法记为 **MP-P**，除少量修改外与算法 1 相同，为简洁从略。

### C. 整体算法与复杂度

所提 OTFS-RSMA 接收机的整体流程如下：首先每个用户利用嵌在公共消息中的导频符号估计其 DD 信道并构造估计信道矩阵；基于估计信道，用所提 MP-C 检测器解码公共消息并经 SIC 消除；最后每个用户解码自身私有消息。

我们分析所提信道估计与解码流程的计算复杂度。对每个用户，$Q$ 个 DD 信道抽头用标量 LMMSE 独立估计，复杂度为 $O(Q)$；消息传递图构造需 $O(MNQ)$ 次运算，因为每个 DD 节点连接到 $Q$ 个由路径诱导的相邻节点。主导复杂度来自消息传递检测器，其因子图含 $O(MNQ)$ 条边；由于（13）（14）中每次边更新涉及 $Q$ 个相邻节点与 $S$ 个星座点，单次迭代需 $O(MNQ^2S)$ 次运算。最终符号判决仅需 $O(MNS)$ 次，可忽略；基于稀疏乘 $\hat{\mathbf H}_u\hat{\mathbf x}_c$ 的 SIC 操作需 $O(MNQ)$ 次。由于公共数据与私有消息解码使用同一消息传递流程，每用户总复杂度为 $O(Q+MNQ+2IMNQ^2S+MNQ)=O(IMNQ^2S)$，其中 $I$ 表示消息传递迭代次数。

**Remark 1**：虽然所提信道估计与消息传递检测算法是针对 GS 配置发展的，但通过修改相应有效噪声与符号区域模型，可方便地扩展到其他三种配置。对信道估计，把私有消息结构从叠加式改为保护带式（即 GS→GG）会移除 $P_p\sigma_u^2$ 项，而把公共消息结构从保护带式改为叠加式（即 GS→SS）会引入 $P_{c,d}\sigma_u^2$ 干扰项；对 SG 两种修改同时生效。消息传递检测器可按同样方式扩展，只需调整配置相关的符号区域与有效噪声项，基本算法结构不变。
## IV. 资源分配

所提 OTFS-RSMA 系统的性能关键取决于在导频、公共数据与私有消息之间的发射功率分配，以及用户间公共速率的分配。特别地，这些分配应在有限发射功率预算下同时平衡信道估计精度与干扰管理，并满足用户速率需求。因此本节研究在总发射功率约束与逐用户最小速率约束下最大化总和速率的联合功率与速率分配。我们首先推导每个用户可达的公共与私有消息速率；由于直接优化这些速率表达式不可处理，引入可处理的替代速率函数并基于其构造联合分配问题；随后发展基于 SCA 的算法 [21] 求解；为进一步降低复杂度，再基于保守速率近似发展低复杂度算法。

### A. 问题表述

先推导公共与私有消息的速率表达式。由（11）与（22），接收向量为 $\mathbf y_u=\hat{\mathbf H}_u\mathbf x_c+\tilde{\mathbf n}_{c,u}$ 与 $\mathbf y_{p,u}=\hat{\mathbf H}_u\mathbf x_{p,u}+\tilde{\mathbf n}_{p,u}$。为可处理地分析速率，采用基于高斯信令的速率模型：发射数据符号建模为高斯，有效残余干扰加噪声项近似为高斯。于是公共与私有消息速率为 [22]

$$
R_{c,u}=\mathbb E_{\mathbf H}\left[\log_2\det\left(\mathbf I+\hat{\mathbf H}_u\mathbf K_{c,d}\hat{\mathbf H}_u^H\left(\mathbf K_{c,u}+\sigma_n^2\mathbf I\right)^{-1}\right)\right],\tag{25}
$$

$$
R_{p,u}=\mathbb E_{\mathbf H}\left[\log_2\det\left(\mathbf I+P_{p,u}\hat{\mathbf H}_u\hat{\mathbf H}_u^H\left(\mathbf K_{p,u}+\sigma_n^2\mathbf I\right)^{-1}\right)\right],\tag{26}
$$

其中 $\mathbf K_{c,d}=P_{c,d}\mathbf I_{MN}-P_{c,d}\sum_{i\in\mathcal A_{\mathrm{pilot}}\cup\mathcal A_{\mathrm{guard}}}\mathbf e_i\mathbf e_i^T$ 为公共数据向量协方差矩阵；$\mathbf K_{c,u}$ 与 $\mathbf K_{p,u}$（式（27）（28））分别为 $\tilde{\mathbf n}_{c,u}$ 与 $\tilde{\mathbf n}_{p,u}$ 的协方差矩阵；$\mathbf e_i\in\mathbb R^{MN}$ 为标准基向量，$r=\nu(l_r,k_r)$ 为导频向量索引。期望对随机信道实现及相应估计信道矩阵 $\hat{\mathbf H}_u$ 取。

然而（25）（26）中对随机信道的期望使直接优化不可处理。为此应用 Jensen 不等式 [21] 构造可处理替代速率函数：

$$
\tilde R_{c,u}=\log_2\det\left(\mathbf I+\mathbb E_{\mathbf H}\left[\hat{\mathbf H}_u\mathbf K_{c,d}\hat{\mathbf H}_u^H\right]\left(\mathbb E_{\mathbf H}\left[\mathbf K_{c,u}\right]+\sigma_n^2\mathbf I\right)^{-1}\right),\tag{29}
$$

$$
\tilde R_{p,u}=\log_2\det\left(\mathbf I+P_{p,u}\mathbb E_{\mathbf H}\left[\hat{\mathbf H}_u\hat{\mathbf H}_u^H\right]\left(\mathbb E_{\mathbf H}\left[\mathbf K_{p,u}\right]+\sigma_n^2\mathbf I\right)^{-1}\right).\tag{30}
$$

由于 $\mathbb E_{\mathbf H}[\hat{\mathbf H}_u\hat{\mathbf H}_u^H]=\sigma_u^2\mathbf I$、$\mathbf K_{c,d}$ 为对角阵，且 OTFS 路径矩阵为单项式、路径增益不相关，可得 $\mathbb E_{\mathbf H}[\hat{\mathbf H}_u\mathbf K_{c,d}\hat{\mathbf H}_u^H]$ 亦为对角阵。于是基于 Jensen 的替代公共速率为

$$
\tilde R_c=\min_u\tilde R_{c,u},\qquad \tilde R_{c,u}=\log_2\left(1+\frac{\sum_{a\in\mathcal A_{\mathrm{data}}}\rho_{u,a}P_{c,d}}{\sum_{a\in\mathcal A_{\mathrm{data}}}\eta_{u,a}}\right),\tag{31}
$$

其中 $\rho_{u,a}=\frac{P_{c,r}}{P_{c,r}+P_p\sigma_u^2+\sigma_n^2}\mathbb E_{\mathbf H}[|\hat H_u(a,d)|^2]$，$\eta_{u,a}=\sum_{b\in\mathcal I_u(a)}\mathbb E[|\hat H_u(a,b)|^2]P_c(b)+P_p\sigma_u^2+\sigma_n^2$。替代公共速率在所有用户间分配，满足

$$
0\le C_u\le\tilde R_c,\qquad \sum_{u=1}^{U}C_u=\tilde R_c,\tag{32}
$$

其中 $C_u$ 为分配给用户 $u$ 的公共速率份额。替代私有速率为

$$
\tilde R_{p,u}=\log_2\left(1+\frac{P_{p,u}\sum_{a\in\mathcal A_{\mathrm{data}}}\mathbb E\left[\left|\hat H_u(a,b)\right|^2\right]}{\eta_{u,a}^{\prime}}\right),\tag{33}
$$

其中 $\eta_{u,a}^{\prime}=\sum_{b\in\mathcal I_u(a)}\mathbb E[|\hat H_u(a,b)|^2]P_c(b)+P_{p,u}\operatorname{Tr}(\boldsymbol\Sigma_u)+(P_p-P_{p,u})\sigma_u^2+\sigma_n^2$。

**Remark 2**：（31）（33）中的替代速率仅为可处理的功率分配设计而引入，并非遍历速率的保守下界。因此替代速率表达式只用于功率分配优化，而第 V 节数值结果报告的是由原始速率表达式评估的实际速率。

基于替代速率表达式，构造联合功率与速率分配问题：通过优化导频功率、公共数据功率、私有消息功率与公共速率分配，在用户速率与功率约束下最大化总和替代速率：

$$
\max_{\{P_{c,r},P_{c,d},\mathbf P_p,\mathbf C\}}\ R_c+\sum_{u=1}^{U}\tilde R_{p,u}\left(P_{c,r},P_{c,d},\mathbf P_p\right)\tag{34a}
$$
$$
\text{s.t.}\quad C_u+\tilde R_{p,u}\left(P_{c,r},P_{c,d},\mathbf P_p\right)\ge R_{\mathrm{th}},\ \forall u,\tag{34b}
$$
$$
\quad\qquad P_{c,r}+N_cP_{c,d}+\sum_{u=1}^{U}P_{p,u}\le MNP_{\max},\tag{34c}
$$
$$
\quad\qquad C_u\ge0,\ P_{c,d}\ge0,\ P_{c,r}\ge0,\ P_{p,u}\ge0,\ \forall u,\tag{34d}
$$

其中 $\mathbf z=[P_{c,r},P_{c,d},\mathbf P_p^T,\mathbf C^T]^T$ 为优化变量向量，$\mathbf P_p=[P_{p,1},\ldots,P_{p,U}]^T$ 与 $\mathbf C=[C_1,\ldots,C_U]^T$ 分别汇集所有用户的私有消息功率与公共速率份额。约束（34b）保证速率需求，（34c）限制平均发射功率，（34d）保证变量非负。

问题（34）因变量非线性耦合且优化非凸而难以求解：变量非线性耦合、目标与约束均非凸。故下面先提出基于二维搜索的 SCA 算法，再发展基于二维搜索的低复杂度算法以缓解 SCA 的高计算负担。

### B. 基于 SCA 的二维网格搜索算法

本小节用基于 SCA 的二维网格搜索求解问题（34）。先对固定的导频与公共数据功率 $P_{c,r}$ 与 $P_{c,d}$，依据下述引理重构问题；所得问题由 SCA 求解，并在 $(P_{c,r},P_{c,d})$ 的二维网格上选取最佳解。

**引理 2**：在问题（34）的最优点处，约束（34c）取等号。

**证明**：可用反证法并沿用与 [23] 中命题 1 证明相似的论证，细节从略。

于是对固定可行候选对 $(P_{c,r},P_{c,d})$，问题（34）可重构为

$$
\max_{\{C_u,P_{p,u}\}}\ R_c+\sum_{u=1}^{U}\tilde R_{p,u}(P_{p,u})\tag{35a}
$$
$$
\text{s.t.}\quad C_u+\tilde R_{p,u}(P_{p,u})\ge R_{\mathrm{th}},\ \forall u,\tag{35b}
$$
$$
\quad\qquad \sum_{u=1}^{U}P_{p,u}=MNP_{\max}-P_{c,r}-N_cP_{c,d},\tag{35c}
$$
$$
\quad\qquad C_u\ge0,\ P_{p,u}\ge0,\ \forall u,\tag{35d}
$$

其中 $R_c=\min_u\tilde R_{c,u}$。对每个固定对 $(P_{c,r},P_{c,d})$，引理 2 通过（35c）确定私有消息总功率 $P_p$，故用户 $u$ 的替代私有速率仅取决于其分配的私有功率 $P_{p,u}$。重构后的（35）仍非凸，因为 $\tilde R_{p,u}(P_{p,u})$ 同时出现在目标与（35b）的速率约束中。为处理该非凸性，在参考点 $\tilde P_{p,u}$ 处线性化 $\tilde R_{p,u}$，得一阶近似：

$$
\tilde R_{p,u}^{\mathrm{lin}}(P_{p,u})=\tilde R_{p,u}(\tilde P_{p,u})+\frac{1}{\left(-\kappa_u\tilde P_{p,u}+\eta_{u,a}\right)\ln2}\left(P_{p,u}-\tilde P_{p,u}\right).\tag{36}
$$

把该一阶近似代入原问题，得到如下凸优化问题：

$$
\max_{\{C_u,P_{p,u}\}}\ R_c+\sum_{u=1}^{U}\tilde R_{p,u}^{\mathrm{lin}}(P_{p,u})\tag{37a}
$$
$$
\text{s.t.}\quad C_u+\tilde R_{p,u}^{\mathrm{lin}}(P_{p,u})\ge R_{\mathrm{th}},\ \forall u,\quad\text{（35c）（35d）}.\tag{37b}
$$

问题（37）为凸，可用 CVX [24] 等标准凸优化求解器高效求解。为优化导频与公共数据功率，在有限功率网格上分别对 $P_{c,r}$ 与 $P_{c,d}$ 做二维网格搜索；对每个可行对 $(P_{c,r},P_{c,d})$，以 $\tilde P_{p,u}=P_p/U$（$u\in\mathcal U$）初始化 SCA 流程，并迭代求解问题（37）、更新 $\tilde P_{p,u}\leftarrow P_{p,u}$ 直至收敛；在所有网格点中选取和速率最高者对应的解。所得算法记为 **SCA-2D**，见算法 2。

**算法 2**　基于 SCA 的二维网格搜索算法（SCA-2D）

1: **输入**：$M$、$N$、$N_c$、$N_g$、$P_{\max}$、$R_{\mathrm{th}}$、$\sigma_n^2$、$\epsilon$、$\mathbf K_{\mathbf h_u,\mathbf h_u}$、$P_{c,r}$ 与 $P_{c,d}$ 的网格。
2: **初始化**：$R_{\mathrm{best}}=P_{c,r}^\star=P_{c,d}^\star=0$，$\mathbf P_p^\star=\mathbf C^\star=\mathbf 0_U$。
3: **for** $P_{c,r}\in\mathcal P_{c,r}$ **do**
4: 　**for** $P_{c,d}\in\mathcal P_{c,d}$ **do**
5: 　　$P_p\leftarrow MNP_{\max}-P_{c,r}-N_cP_{c,d}$；置 $\tilde P_{p,u}=P_p/(MNU)$，$\forall u$。
6: 　　计算 $\boldsymbol\Sigma_u$、$\kappa_u$、$\eta_{u,a}$、$R_c$ 与 $\rho_{u,a}$（$\forall u,a$）。
7: 　　**repeat**
8: 　　　用 CVX 求解问题（37）；若不可行则跳到下一网格点；
9: 　　　计算 $R_{\mathrm{new}}$ 与 $\delta=|R_{\mathrm{new}}-R_{\mathrm{old}}|/R_{\mathrm{new}}$；
10: 　　　更新 $\tilde P_{p,u}\leftarrow P_{p,u}$、$R_{\mathrm{old}}\leftarrow R_{\mathrm{new}}$；
11: 　　**until** $\delta\le\epsilon$；
12: 　　若 $R_{\mathrm{new}}>R_{\mathrm{best}}$，更新 $R_{\mathrm{best}}$、$P_{c,r}^\star$、$P_{c,d}^\star$、$\mathbf P_p^\star$ 与 $\mathbf C^\star$。
13: **end for**

SCA-2D 的复杂度：每个二维网格点计算替代速率系数需 $O(UMNQ)$ 次运算；每次 SCA 迭代的 Taylor 线性化需 $O(UMN)$ 次，求解凸子问题需 $O((2U)^{3.5})$ 次。故总体复杂度为 $O\left(\frac{1}{\epsilon_r\epsilon_d}\left(UMNQ+I_{\mathrm{SCA}}\left(UMN+(2U)^{3.5}\right)\right)\right)$，其中 $\epsilon_r$、$\epsilon_d$ 分别为导频功率与公共数据功率网格分辨率，$I_{\mathrm{SCA}}$ 为 SCA 迭代次数。

### C. 低复杂度优化算法

为进一步降低 SCA-2D 的计算复杂度，我们受 [16] 启发提出记为 **L-2D** 的低复杂度方法。与 SCA-2D 一样，L-2D 在 $P_{c,r}$ 与 $P_{c,d}$ 上做二维搜索；但不在每个网格点做迭代凸优化，而是利用私有消息速率的**保守下界近似**解析确定私有功率与公共速率分配。

先考虑固定的可行对 $(P_{c,r},P_{c,d})$。对该固定对，引理 2 确定私有消息总功率 $P_p$，可分配的公共速率为 $R_c=\min_u\tilde R_{c,u}$。为得到替代私有速率的可处理下界，只保留公共数据位置并对其有效干扰取上界，可得

$$
\bar R_{p,u}^{\mathrm{LB}}(P_{p,u})=\log_2\left(1+\frac{P_{p,u}\sum_{a\in\mathcal A_{\mathrm{data}}}\mathbb E\left[\left|\hat H_u(a,b)\right|^2\right]}{\eta_u+\kappa_u^{\prime}P_{p,u}}\right),\qquad \eta_u=P_{c,d}\operatorname{Tr}(\boldsymbol\Sigma_u)+\sigma_n^2,\tag{38}
$$

其中丢弃 $\mathcal A_{\mathrm{data}}$ 之外的非负项；由于保护带把导频位置排除在 $\mathcal A_{\mathrm{data}}$ 的 $\mathcal I_u(a)$ 之外，故对 $b\in\mathcal I_u(a)$ 有 $P_c(b)\le P_{c,d}$，并利用 $\sum_{b\in\mathcal I_u(a)}\mathbb E[|\hat H_u(a,b)|^2]=\operatorname{Tr}(\boldsymbol\Sigma_u)$ 得 $\eta_{u,a}\le\eta_u$；由速率关于 $\eta$ 的单调递减性即得上界性。因此 $\bar R_{p,u}^{\mathrm{LB}}$ 是 $R_{p,u}$ 的可处理下界。将（35）中的 $\tilde R_{p,u}$ 替换为 $\bar R_{p,u}^{\mathrm{LB}}$，得到

$$
\max_{\{C_u,P_{p,u}\}}\ R_c+\sum_{u=1}^{U}\bar R_{p,u}^{\mathrm{LB}}(P_{p,u})\tag{39a}
$$
$$
\text{s.t.}\quad C_u+\bar R_{p,u}^{\mathrm{LB}}(P_{p,u})\ge R_{\mathrm{th}},\ \forall u,\quad\text{（35c）（35d）}.\tag{39b}
$$

为导出分配结构，先关注 $R_c<UR_{\mathrm{th}}$ 的情形，此时仅靠公共速率不足以满足所有用户速率需求。先给出：

**引理 3**：当 $R_c<UR_{\mathrm{th}}$ 时，问题（39）可在 $0\le C_u\le R_{\mathrm{th}}$（$\forall u\in\mathcal U$）范围内求解而不失最优性。

**证明**：考虑问题（39）的任一最优解。若其已满足所有 $u$ 的 $C_u\le R_{\mathrm{th}}$，结论成立；否则设某用户 $u$ 有 $C_u>R_{\mathrm{th}}$。由于 $\sum_{w\in\mathcal U}C_w=R_c<UR_{\mathrm{th}}$，存在用户 $v\neq u$ 使 $C_v<R_{\mathrm{th}}$。把公共速率从 $u$ 转移到 $v$ 直至 $C_u=R_{\mathrm{th}}$ 或 $C_v=R_{\mathrm{th}}$，可保持总公共速率、私有消息功率与目标值不变且不违反任何速率约束；重复该操作即得满足 $0\le C_u\le R_{\mathrm{th}}$（$\forall u$）的最优解，证毕。

对给定 $0\le C_u\le R_{\mathrm{th}}$，用户 $u$ 满足 $R_{\mathrm{th}}$ 所需最小私有功率为

$$
P_{p,u}^{\min}(C_u)=\frac{\lambda_u}{\phi_u(C_u)-\lambda_u},\qquad \lambda_u=\frac{\kappa_u^{\prime}}{\sum_{a\in\mathcal A_{\mathrm{data}}}\mathbb E\left[\left|\hat H_u(a,b)\right|^2\right]},\qquad \phi_u(C_u)=2^{-MN\left(R_{\mathrm{th}}-C_u\right)/N_c}.\tag{40}
$$

问题（39）的最优分配由下述定理刻画。

**定理 2**：对使问题（39）可行且 $0\le R_c<UR_{\mathrm{th}}$ 的固定候选对 $(P_{c,r},P_{c,d})$，令 $(\pi_1,\pi_2,\ldots,\pi_U)$ 为 $\mathcal U$ 的置换使 $\lambda_{\pi_1}\le\lambda_{\pi_2}\le\cdots\le\lambda_{\pi_U}$。则最优公共速率分配为

$$
C_{\pi_j}^\star=\left[R_{\mathrm{th}}-\frac{MN}{N_c}\log_2\left(\frac{\lambda_{\pi_{j+1}}}{\lambda_{\pi_j}}\right)\right]^+,\ \ j=1,\ldots,U-1,\qquad C_{\pi_U}^\star=R_c-\sum_{j=1}^{U-1}C_{\pi_j}^\star,\tag{41}
$$

其中 $[x]^+=\max\{x,0\}$；相应最优私有功率分配为

$$
P_{p,\pi_j}^\star=P_{p,\pi_j}^{\min}\left(C_{\pi_j}^\star\right),\ j=1,\ldots,U-1,\qquad P_{p,\pi_U}^\star=P_p-\sum_{j=1}^{U-1}P_{p,\pi_j}^\star.\tag{42}
$$

**证明（要点）**：先对固定可行公共速率分配 $\mathbf C$（$0\le C_u\le R_{\mathrm{th}}$）优化私有功率。定义 $\phi(C)=2^{-MN(R_{\mathrm{th}}-C)/N_c}$ 并简记 $\phi_u=\phi(C_u)$，私有功率约束变为 $P_{p,u}\ge P_{p,u}^{\min}(C_u)$ 且 $\sum_uP_{p,u}=P_p$。令 $P_{\mathrm{rem}}(\mathbf C)=P_p-\sum_uP_{p,u}^{\min}(C_u)\ge0$，由于总和私有速率在该可行多面体上为凸，最优解在极点处取得 [21]，即全部剩余私有功率分配给单一用户 $u'$，得 $P_{p,u}^\star=P_{p,u}^{\min}(C_u)$（$u\neq u'$）。由 $\phi_u$ 的定义与 $-(N_c/MN)\log_2\phi_u=R_{\mathrm{th}}-C_u$ 可得总和私有速率为 $UR_{\mathrm{th}}-R_c-\frac{N_c}{MN}\log_2\Psi(\mathbf C)$（其中 $\Psi$ 由 $\phi$ 与 $P_{\mathrm{rem}}$ 构成），从而最优选择 $u'=\arg\max_u\lambda_u/\phi_u$。对固定 $\mathbf C$，$P_{\mathrm{rem}}(\mathbf C)$ 非负且与 $u'$ 无关；由于 $-\log_2(1-x)$ 关于 $x$ 递增，一个最优选择为 $u'=\arg\max_u\lambda_u/\phi(C_u)$。记 $\Gamma(\mathbf C)=P_{\mathrm{rem}}(\mathbf C)\Psi(\mathbf C)$，由该选择规则知剩余公共速率优化等价于在可行分配上最大化 $\Gamma(\mathbf C)$。可证（41）式的 $\mathbf C^\star$ 同时最大化 $P_{\mathrm{rem}}(\mathbf C)$ 与 $\Psi(\mathbf C)$：其一，仅在 $\sum_uC_u=R_c$ 与 $0\le C_u\le R_{\mathrm{th}}$ 下最大化该表达，由于 $\phi$ 为凸，极值点至多一个分量严格位于 $0$ 与 $R_{\mathrm{th}}$ 之间，令 $L=\lfloor R_c/R_{\mathrm{th}}\rfloor$、$r=R_c-LR_{\mathrm{th}}$，则极值点分量（不计次序）为 $L$ 个 $R_{\mathrm{th}}$、一个 $r$ 与 $U-L-1$ 个 $0$；其二，若可行分配不满足所需次序（即存在 $i<j$ 使 $C_{\pi_i}<C_{\pi_j}$），交换这两项后 $P_{\mathrm{rem}}(\mathbf C')-P_{\mathrm{rem}}(\mathbf C)$ 非负，由 $\lambda_{\pi_i}\le\lambda_{\pi_j}$ 与 $\phi$ 的单调性可知交换保持可行性且不降低目标，重复交换即得有序分配且目标不降。结合极值结构与次序关系即得（41）。同理可证 $\mathbf C^\star$ 最大化 $\Psi(\mathbf C)$，从而为最优公共速率分配；且用户 $\pi_U$ 满足选择规则，取 $u'=\pi_U$ 代入即得（42），证毕。

现考虑互补情形 $R_c\ge UR_{\mathrm{th}}$，此时仅公共速率即可满足所有用户速率需求：

**定理 3**：对满足 $R_c\ge UR_{\mathrm{th}}$ 的固定可行候选对 $(P_{c,r},P_{c,d})$，令 $\pi_U$ 为 $\lambda_u$ 最大的用户。则问题（39）的一个最优解为

$$
C_u^\star=\frac{R_c}{U},\ \forall u\in\mathcal U,\qquad P_{p,\pi_U}^\star=P_p,\qquad P_{p,u}^\star=0,\ \forall u\neq\pi_U.\tag{43}
$$

**证明**：因 $C_u=R_c/U\ge R_{\mathrm{th}}$，所有用户仅靠公共速率即满足速率门限，故私有功率分配化为在单纯形 $\sum_uP_{p,u}=P_p$、$P_{p,u}\ge0$ 上最大化总和私有速率。由于该目标在单纯形上为凸，极点解最优，即全部私有功率分配给单一用户 $u$；总和私有速率随之化为 $\frac{N_c}{MN}\log_2\left(1-\lambda_uP_p\right)$，关于 $\lambda_u$ 非减，故取 $\lambda_u$ 最大的用户 $\pi_U$ 即得一个最优解，证毕。

定理 2 与 3 的最优分配需要按 $\lambda_u$ 对用户排序。由于 $\lambda_u$ 依赖 $P_{c,r}$ 与 $P_{c,d}$，该次序可能随网格点变化。为避免网格相关的重排序，基于长期信道统计引入下述引理。

**引理 4**：令 $(\tilde\pi_1,\ldots,\tilde\pi_U)$ 表示按长期信道功率 $\{\sigma_u^2\}$ 排序的用户序列，满足 $\sigma_{\tilde\pi_1}^2\le\cdots\le\sigma_{\tilde\pi_U}^2$。在高导频 SNR 条件 $\frac{1}{P_{c,r}}\ll\sigma_{u,q}^2$（$\forall u,q$）下，$\lambda_u$ 近似随 $\sigma_u^2$ 递增，故由 $\{\lambda_u\}$ 诱导的次序可由长期信道功率次序 $(\tilde\pi_1,\ldots,\tilde\pi_U)$ 近似，特别地 $\tilde\pi_U$ 近似对应 $\lambda_u$ 最大的用户。

**证明（要点）**：在高导频 SNR 下 $\left(\sigma_{u,q}^{\mathrm{err}}\right)^2\approx\frac{P_p\sigma_u^2+\sigma_n^2}{P_{c,r}}$，从而 $\operatorname{Tr}(\boldsymbol\Sigma_u)$ 与 $\lambda_u$ 均可近似为关于 $\sigma_u^2$ 的显式表达式；对其求导可验证该近似关于 $\sigma_u^2$ 严格递增，故 $\lambda_u$ 的次序与 $\sigma_u^2$ 的次序一致，证毕。

结合引理 4，定理 2 与 3 揭示了基于长期信道增益次序的简单分配结构：当 $R_c<UR_{\mathrm{th}}$ 时，公共速率按从弱到强的用户顺序依次分配，至每用户 $R_{\mathrm{th}}$ 为止；随后为每个用户分配满足 $R_{\mathrm{th}}$ 所需的最小私有功率，剩余私有功率分配给最强用户。当 $R_c\ge UR_{\mathrm{th}}$ 时，公共速率在用户间均分，全部私有功率分配给最强用户。

基于该分配结构，L-2D 先按长期信道增益对用户排序，并在整个二维搜索中使用该次序。对每个候选对 $(P_{c,r},P_{c,d})$ 计算 $R_c$，并依 $R_c<UR_{\mathrm{th}}$ 或 $R_c\ge UR_{\mathrm{th}}$ 确定公共速率与私有功率分配；再选取使（39a）目标最大的候选对。由于 L-2D 沿用与 SCA-2D 相同的二维搜索流程、仅将迭代 SCA 步骤替换为闭式分配规则，其伪代码从略。

L-2D 的复杂度：每个网格点的主导代价是计算位置相关的替代速率系数，复杂度 $O(UMNQ)$；故总体复杂度为 $O\left(\frac{UMNQ}{\epsilon_r\epsilon_d}\right)$，因无需在每个网格点做迭代 SCA 优化，整体计算复杂度显著降低。

**Remark 3**：虽然所提功率分配算法是针对 GS 配置发展的，但通过更新配置相关的信道估计误差项与速率表达式，可扩展到 GG、SG 与 SS。这些修改只影响相应系数而保持优化结构，故定理 2 与 3 的闭式分配结构仍然有效。类似地，当各配置满足高导频 SNR 条件时，引理 4 允许用户次序由相同的长期信道功率次序近似。因此所得结构与物理解释在所考虑的 OTFS-RSMA 各配置间具有广泛适用性。
## V. 数值结果

我们给出数值结果以评估所提框架。除另有说明，考虑 $U=3$ 个用户、每个用户 $Q=4$ 条传播路径 [11]；用户 2 与用户 3 的总信道功率分别设为相对用户 1 的 $-3$ dB 与 $-9$ dB。对每个用户，最小时延路径的方差归一化为 $0$ dB，其余路径方差依据其相对时延按 [9], [12] 确定。OTFS 帧含 $M=64$ 个时延格与 $N=32$ 个多普勒格，载频 $f_c=3.5$ GHz、子载波间隔 $\Delta f=15$ kHz；最大时延与多普勒索引为 $l_{\max}=10$（$\tau_{\max}=10\ \mu$s）与 $k_{\max}=3$（$v_{\max}=434$ km/h）[3]。噪声方差设为 $\sigma_n^2$（例如 SNR $=20$ dB 时 $\sigma_n^2=10^{-2}$）。网格分辨率为 $\epsilon_d=0.1$、$\epsilon_r=5$，BER 与信道估计评估采用 $N_f=10^3$ 次蒙特卡洛实现。由于优化所用的替代速率可能与实际速率不同，我们对最小速率需求施加 20% 余量，即在优化中用 $1.2R_{\mathrm{th}}$ 替代 $R_{\mathrm{th}}$；文中所报 $R_{\mathrm{th}}$ 为不含该余量的目标速率，图例中为简洁省略其单位（bps/Hz）。

### A. 和 SE 性能

我们先用 SCA-2D 比较四种导频传输配置的和 SE，如图 1a 所示。在所考虑设置下，GG 与 GS 优于 SG 与 SS，表明公共消息采用保护带式结构可抑制信道估计期间的公共数据干扰而带来益处。但在 GG 与 GS 之间，二者并无一致优劣：GS 允许私有消息复用保护带资源，代价是信道估计期间额外的私有消息干扰；而 GG 通过对私有消息也加保护带消除该干扰，但牺牲相应传输资源。因此当资源利用收益超过干扰代价时 GS 更可取，而当私有消息干扰的影响更显著时 GG 更可取。图 1b 在不同 $P_{\max}$ 与 $R_{\mathrm{th}}$ 下比较采用 SCA-2D 的 OTFS-RSMA 与 OTFS-NOMA [3]、正交划分 [9] 基准的和 SE。对 OTFS-RSMA 考虑 GG 与 GS 配置，因为图 1a 显示它们在四种配置中取得最高的和 SE 性能（其相对优劣取决于工作条件）。OTFS-NOMA 中所有用户通过叠加共享整个 DD 网格，导频与保护符号嵌在最弱用户的消息中；而正交划分把 DD 网格在用户间划分。如图 1b 所示，RSMA 与 NOMA 均优于正交划分，凸显非正交资源共享的收益。对较小的 $R_{\mathrm{th}}$，RSMA 优于 NOMA——它通过公共消息服务较弱用户、同时把私有功率集中在最强用户；而对较大的 $R_{\mathrm{th}}$，NOMA 借助多级 SIC 取得相当或略高的和 SE。

在 RSMA 内部，较小的 $R_{\mathrm{th}}$ 时 GG 更可取——此时较大的私有消息功率会在信道估计期间造成更强的私有消息干扰；较大的 $R_{\mathrm{th}}$ 时私有功率降低缓解了该干扰，使 GS 的谱效优势更明显。总体而言，RSMA 在仅需更少 SIC 级数的同时取得相对 NOMA 具竞争力的性能。

### B. 信道估计与 BER 性能

我们进一步比较 SCA-2D 与 L-2D，以评估 L-2D 的性能—复杂度权衡。由于此处聚焦两种算法的比较，给出 GS 配置下的结果（其他配置呈现类似趋势）。如表 I 所示，两种算法给出相近的功率分配模式：它们分配给导频的功率远多于私有消息，支持引理 4 中的高导频 SNR 假设。需注意 $P_{\max}$ 是每个 DD 资源元的平均功率预算，而 $P_{c,r}$ 是单个导频符号的功率，故 $P_{c,r}>P_{\max}$ 并不违反帧平均功率约束。两种算法也都把私有消息功率集中于最强用户（用户 1），与定理 2 与 3 所刻画的最优分配结构一致。如图 2 所示，L-2D 相对 SCA-2D 的实际和 SE 损失小于 4%，而在 $P_{\max}=1.5$ W 时把平均计算时间从 1382.5 s 降至 0.308 s（AMD Ryzen 9950X3D 处理器）。

在和 SE 性能有利的 GS 与 GG 配置中，我们聚焦 GS 做信道估计与 BER 评估，因为叠加式私有消息的干扰使其成为更具挑战性的设置。资源分配采用 L-2D，因为它大幅降低计算时间且和 SE 接近 SCA-2D；这些实验中最小速率需求设为 $R_{\mathrm{th}}=1$ bps/Hz。图 3 给出所提 LMMSE 估计器对所有用户的信道归一化 MSE（NMSE），其中 $\mathrm{NMSE}=\frac{\mathbb E[\|\mathbf h_u-\hat{\mathbf h}_u\|^2]}{\mathbb E[\|\mathbf h_u\|^2]}$。所有用户的 NMSE 均保持较低水平，理论与经验结果高度吻合，验证了定理 1。图 4 进一步考察信道估计误差对数据检测的影响：如图 4a，公共数据 BER 在完美与不完美 CSI 下几乎相同；对私有消息，图 4b 显示用户 1 在不完美 CSI 下约有 3 dB 损失。用户 2 与 3 未绘出，因为在优化功率分配下未向它们分配私有消息功率。总体而言，这些结果表明所提信道估计器限制了 CSI 误差对后续数据检测的影响。

图 5 比较 BPSK 与 QPSK 的 BER 性能：如图 5a 与 5b，QPSK 在公共与私有消息上的 BER 均高于 BPSK，这是因为在相同平均符号功率下 QPSK 的判决余量更小，从而对残余干扰与 SIC 误差更敏感。图 6 给出不同总功率预算下的 BER 性能：如图 6a，在 BPSK 与 QPSK 下公共数据 BER 随 $P_{\max}$ 对所有用户明显下降；相反，图 6b 显示用户 1 的私有消息 BER 仅有小幅改善。该行为源于优化功率分配：由于私有消息在解码公共消息时充当干扰，优化器限制其功率，并把额外功率主要用于改善公共消息传输。

## VI. 结论

本文提出一种 OTFS-RSMA 框架，在不完美 CSI 下联合考虑导频传输、信道估计、消息检测与资源分配。结果展示了导频与数据传输之间的相互作用：传输结构同时影响信道估计精度与资源利用率。特别地，公共消息采用保护带式传输在所考虑设置下取得有利和 SE 性能，而更优的私有消息结构取决于工作区间。这些结果表明，在设计 OTFS-RSMA 系统时应联合考虑信道估计与数据传输。我们还证明资源分配问题具有简单的分配结构，从而在显著降低计算复杂度的同时取得接近 SCA 的性能。未来工作可把所提框架扩展到分数多普勒、多天线传输，以及由公共消息错误解码引起的 SIC 误差传播。

## 表格

**表 I　不同 SNR 下 SCA-2D 与 L-2D 的优化功率分配**（$P_{\max}=1$ W、$R_{\mathrm{th}}=0.5$ bps/Hz；按原表逐格转录）

| SNR (dB) | SCA-2D $P_{c,d}$ (W) | SCA-2D $P_{c,r}$ (W) | SCA-2D $P_{p,1}$ (W) | SCA-2D $P_{p,2}$ (W) | SCA-2D $P_{p,3}$ (W) | L-2D $P_{c,d}$ (W) | L-2D $P_{c,r}$ (W) | L-2D $P_{p,1}$ (W) | L-2D $P_{p,2}$ (W) | L-2D $P_{p,3}$ (W) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | 0.6 | 395 | 0.2871 | 0 | 0 | 0.7 | 370 | 0.2126 | 0 | 0 |
| 22 | 0.6 | 475 | 0.2480 | 0 | 0 | 0.8 | 355 | 0.1333 | 0 | 0 |
| 24 | 0.7 | 475 | 0.1614 | 0 | 0 | 0.8 | 420 | 0.1016 | 0 | 0 |
| 26 | 0.8 | 435 | 0.0942 | 0 | 0 | 0.9 | 345 | 0.0515 | 0 | 0 |

> **注**：原表为双行表头（SCA-2D / L-2D 各含 $P_{c,d}$、$P_{c,r}$、$P_{p,1}$—$P_{p,3}$ 五列），Markdown 中并入单行表头并加前缀区分；数值与原表一致（已用 PyMuPDF 渲染原 PDF 第 12 页核对）。

## 图注与表注

**图 1**：和 SE 性能：(a) 不同导频传输配置随 SNR 的比较（$P_{\max}=1$ W、$R_{\mathrm{th}}=1$ bps/Hz）；(b) SNR $=20$ dB 时 OTFS-RSMA 与 OTFS-NOMA 及正交划分的比较。
**图 2**：GS 配置下 SCA-2D 与 L-2D 的和 SE 随 SNR 的变化（$R_{\mathrm{th}}=0.5$ bps/Hz）。
**图 3**：信道 NMSE 随 SNR 的变化（$P_{\max}=1$ W 与 $1.5$ W）。
**图 4**：完美与不完美 CSI 下的 BER：(a) 公共数据；(b) 私有消息（$P_{\max}=1$ W、BPSK）。
**图 5**：BPSK 与 QPSK 下的 BER：(a) 公共数据；(b) 私有消息（$P_{\max}=1.5$ W）。
**图 6**：BPSK 与 QPSK 下 BER 随 $P_{\max}$ 的变化：(a) 公共数据；(b) 私有消息（SNR $=24$ dB）。

**表注**：表 I 已在本页「表格」一节逐格转录，并用 PyMuPDF 渲染原 PDF 第 12 页核对；原文无其他表格。

## 参考文献

> 以下按原文编号 [1]—[24] 转录英文原书目，条目文字不翻译；PDF 抽取文本中被截断的卷/页信息以"（原文截断）"标注。

[1] Q. Deng, Y. Ge, and Z. Ding, “A unifying view of OTFS and its many variants,” IEEE Communications Surveys & Tutorials, vol. 27, no. 6, pp. 3561–3586, 2025.

[2] L. Xiao, S. Li, Y. Qian, D. Chen, and T. Jiang, “An overview of OTFS for Internet of Things: Concepts, benefits, and challenges,” IEEE Internet of Things Journal, vol. 9, no. 10, pp. 7596–7618, 2022.

[3] Z. Ding, R. Schober, P. Fan, and H. V. Poor, “OTFS-NOMA: An efficient approach for exploiting heterogenous user mobility profiles,” IEEE Transactions on Communications, vol. 67, no. 11, pp. 7950–7965, 2019.

[4] B. E. Ouakouak, S. E. Zegrar, and H. Arslan, “A novel coexistence scheme for OFDM and OTFS waveforms for uplink in 6G networks,” IEEE Transactions on Communications, vol. 73, no. 11, pp. 12 008–12 022, 2025.

[5] J. Liu, Y. L. Guan, Y. Ge, and B. Clerckx, “Power allocation for high mobility OTFS-RSMA system with path-selective one-tap receiver,” IEEE Wireless Communications Letters, vol. 14, no. 3, pp. 661–665, 2025.

[6] Q. Huai, W. Yuan, Y. Wu, and P. Fan, “Downlink OTFS-RSMA cross-domain transmission scheme and sum-rate maximization,” IEEE Communications Letters, vol. 29, no. 3, pp. 600–604, 2025.

[7] A. K. Kowshik, S. Gurugopinath, and S. Muhaidat, “Deep learning-based detection for RSMA with orthogonal time frequency space modulation,” IEEE Communications Letters, vol. 29, no. 4, pp. 669–673, 2025.

[8] Y. Xu, Y. Zhang, Y. Mao, B. Clerckx, Y. H. Kim, and Y. Li, “Robust design for multi-antenna LEO satellite communications with fractional delay and Doppler shifts: An RSMA-OTFS approach,” arXiv preprint, 2025.（原文截断）

[9] P. Raviteja, K. T. Phan, and Y. Hong, “Embedded pilot-aided channel estimation for OTFS in delay–Doppler channels,” IEEE Transactions on Vehicular Technology, vol. 68, no. 5, pp. 4906–4917, 2019.

[10] D. Shi, W. Wang, L. You, X. Song, Y. Hong, X. Gao, and G. Fettweis, “Deterministic pilot design and channel estimation for downlink massive MIMO-OTFS systems in presence of the fractional Doppler,” IEEE Transactions on Wireless Communications, vol. 20, no. 11, pp. 7151–7165, 2021.（原文截断）

[11] W. Yuan, S. Li, Z. Wei, J. Yuan, and D. W. K. Ng, “Data-aided channel estimation for OTFS systems with a superimposed pilot and data transmission scheme,” IEEE Wireless Communications Letters, vol. 10, no. 9, pp. 1954–1958, 2021.

[12] H. B. Mishra, P. Singh, A. K. Prasad, and R. Budhiraja, “OTFS channel estimation and data detection designs with superimposed pilots,” IEEE Transactions on Wireless Communications, vol. 21, no. 4, pp. 2258–2274, 2022.

[13] M. Zhou, F. Chen, H. Yu, and J. Lu, “Iterative channel estimation for OTFS systems based on low-PAPR hybrid superimposed pilots,” IEEE Communications Letters, vol. 28, no. 8, pp. 1939–1943, 2024.

[14] W. Yuan, Z. Wei, S. Li, J. Yuan, and D. W. K. Ng, “Integrated sensing and communication-assisted orthogonal time frequency space transmission for vehicular networks,” IEEE Journal of Selected Topics in Signal Processing, vol. 15, no. 6, pp. 1515–1528, 2021.

[15] H.-T. Sheng and W.-R. Wu, “Time-frequency domain channel estimation for OTFS systems,” IEEE Transactions on Wireless Communications, vol. 23, no. 2, pp. 937–948, 2024.

[16] Z. Yang, M. Chen, W. Saad, and M. Shikh-Bahaei, “Downlink sum-rate maximization for rate splitting multiple access (RSMA),” in ICC 2020 - 2020 IEEE International Conference on Communications (ICC), 2020.

[17] S. Wang, J. Guo, X. Wang, W. Yuan, and Z. Fei, “Pilot design and optimization for OTFS modulation,” IEEE Wireless Communications Letters, vol. 10, no. 8, pp. 1742–1746, 2021.

[18] S. M. Kay, Fundamentals of Statistical Signal Processing: Estimation Theory. Prentice-Hall, Inc., 1993.

[19] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, “Interference cancellation and iterative detection for orthogonal time frequency space modulation,” IEEE Transactions on Wireless Communications, vol. 17, no. 10, pp. 6501–6515, 2018.

[20] P. Som, T. Datta, N. Srinidhi, A. Chockalingam, and B. S. Rajan, “Low-complexity detection in large-dimension MIMO-ISI channels using graphical models,” IEEE Journal of Selected Topics in Signal Processing, vol. 5, no. 8, pp. 1497–1511, 2011.

[21] S. Boyd and L. Vandenberghe, Convex Optimization. Cambridge University Press, 2004.

[22] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge University Press, 2005.

[23] C. Son and S.-H. Lee, “Group-aware rate-splitting multiple access for energy-efficient XR data transmission,” IEEE Wireless Communications Letters, vol. 15, pp. 815–819, 2026.

[24] M. Grant and S. Boyd, “CVX: MATLAB software for disciplined convex programming, version 2.1,” [Online]. Available: https://cvxr.com/cvx, Mar. 2014, accessed: Jan. 15, 2026.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含四条贡献与记号定义）；第 II 节系统模型（A 信道模型，式（1）；B 信号模型，式（2）—（6），含四种导频配置 GG/GS/SG/SS 说明）；第 III 节所提框架（A 信道估计：式（7），引理 1（式（8）），定理 1（式（9）（10））；B 基于消息传递的数据检测：式（11）—（24），算法 1（MP-C），MP-P 说明；C 整体算法与复杂度，Remark 1）；第 IV 节资源分配（A 问题表述：式（25）—（34），Remark 2；B 基于 SCA 的二维网格搜索：引理 2、式（35a）—（37b）、算法 2（SCA-2D）与复杂度；C 低复杂度算法 L-2D：式（38）—（43），引理 3—4、定理 2—3，Remark 3）；第 V 节数值结果（A 和 SE 性能，图 1—2；B 信道估计与 BER 性能，图 3—6，表 I，L-2D 复杂度对比）；第 VI 节结论；表 I（逐格）；图 1—6 图注；参考文献 [1]—[24] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—6 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I 已逐格转录并用 PyMuPDF 渲染原 PDF 第 12 页核对；④作者简介、基金与版权声明不在正文范围，未收录；⑤**PDF 抽取文本中部分公式的编号与分式结构出现错位**（如原文问题编号为 (35) 而本页表述为（34）、部分协方差式（27）（28）与系数式未单列），译文按上下文语义复原并统一编号；文中保留"（35a）"等原编号引用处亦已与译文编号对应，建议以原 PDF 复核；⑥参考文献 [8][10] 在抽取文本中被截断，已标注"（原文截断）"；⑦骨架版本日期 "2026-09-23" 与 PDF 实际 v1 2026-09-21 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
