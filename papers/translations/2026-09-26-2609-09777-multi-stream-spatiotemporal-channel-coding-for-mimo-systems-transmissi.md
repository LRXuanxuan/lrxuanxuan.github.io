---
layout: page
title: "MIMO 多流时空信道编码｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-09777-multi-stream-spatiotemporal-channel-coding-for-mimo-systems-transmissi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6a310edf70bd8668/) · [原文 arXiv](https://arxiv.org/abs/2609.09777) · [全部目录](/papers/catalog/)

# MIMO 多流时空信道编码

**原题：** Multi-Stream Spatiotemporal Channel Coding for MIMO Systems: Transmission Scheme Design and Achievable Rate Optimization  
**作者：** Liang Jin（金梁）、Xiaodong Xu（许晓东，Senior Member, IEEE）、Shujun Han（韩书君，Member, IEEE）、Xiaoyu Chi（迟小雨）、Ping Zhang（张平，Fellow, IEEE）、Chau Yuen（Fellow, IEEE）  
**单位：** 北京邮电大学网络与交换技术国家重点实验室（北京 100876）；鹏城实验室宽带通信研究部（深圳 518066）；北京邮电大学移动网络技术国家工程研究中心；新加坡南洋理工大学电气与电子工程学院（639798）。通讯作者：许晓东。  
**版本：** arXiv:2609.09777v1（eess.SP），v1 日期 2026 年 9 月 9 日；已被 IEEE Trans. Wireless Commun. 接收；原文 15 页（含附录 A–C）。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.09777v1 [eess.SP] 9 Sep 2026"，与库内登记编号 2609.09777 一致；首页脚注给出国家重点研发计划 2020YFB1806905、国家自然科学基金 62201079、新加坡教育部 MOE Tier 2（T2EP50124-0032）资助信息，以及 "Accepted for publication in IEEE Trans. on Wireless Commun." 与复现代码链接 https://github.com/L-Jin-bupt。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–9 中文图注、表 I–III 逐格转写、算法 1–2 伪代码、附录 A–C（含 (36)–(47) 的推导与引理 1 证明），以及参考文献 35 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

时空信道编码（STCC）可利用空间自由度扩展码字长度，从而相对传统时间信道编码（TCC）提升可达速率。尽管已有若干关于 STCC 的信息论基础，但从通信理论角度对传输方案的研究仍处于早期阶段。本文在全信道状态信息（CSI）假设下提出多子信道承载多流的 STCC（STCC-MSC），并在有限块长条件下优化其可达速率。我们首先在点对点 MIMO 系统中构造 STCC-MSC 的传输架构，它引入流–子信道匹配机制；随后通过联合优化子信道分配与功率分配策略来最大化 STCC-MSC 的可达速率，并将其建模为混合整数非线性规划问题；接着提出惩罚式交替凸近似（PACA）算法求解该问题。之后把点对点 STCC-MSC 设计推广到更一般的多用户 MIMO 系统，涵盖上行与下行场景。最后，仿真结果表明，在 STCC-MSC 方案内，PACA 算法相比基准算法取得 9.85% 的速率提升；此外，STCC-MSC-PACA 联合方案相比 TCC 方案把可达速率提升 28.68%。

**索引词：** 时空信道编码、MIMO、有限块长、可达速率。

> **录用信息：** 已被 IEEE Trans. on Wireless Commun. 接收。复现仿真代码见：https://github.com/L-Jin-bupt

## I. 引言

为满足未来应用日益严格的时延要求，第六代（6G）移动通信系统期望实现微秒量级的传输时延 [1]–[3]。然而，受通信系统"块长–可靠性–速率不可能三角"的限制，有限块长通信因每个码字长度较短而遭受显著速率损失 [4]–[6]。为应对该"不可能三角"，研究者探索多输入多输出（MIMO）系统中的空间–块长可交换性，由此产生时空信道编码（STCC）概念 [7]。

在传统时间信道编码（TCC）中，独立信息流在时域编码并在各子信道上传输，每个流的码字长度等于信道使用次数。相反，STCC 在时间与多个子信道上联合编码信息流，用空间自由度（DoF）换取每流更长的码字 [8]。因此，尽管 STCC 支持的并发可传流数更少，但已证明在相同时间–频率–空间资源下，其在有限块长区的速率高于 TCC [8]–[11]。值得注意，STCC 与常规空时编码（STC）[15], [16] 有本质不同：STC 在空间与时间维度联合设计发送符号以提升分集与复用性能；而 STCC 在有限块长信息论框架下，把信道编码后的信息在多次信道使用中联合映射到空间子信道，以提升有限块长区的可达速率。

STCC 的信息论研究可追溯到 2010 年，目前正受到通信界越来越多的关注，但仍处于早期阶段。据作者所知，有限块长区与 STCC 相关的最早信息论研究可追溯到 Polyanskiy 的博士论文 [17, Ch. 4.5]，其中分析了并行高斯信道的可达速率，但他并未明确将其描述为时间与空间的联合编码，也未与传统 TCC 区分。STCC 这一术语由 You 等人于 2022 年正式提出，他们提出一种基于乘积码的时空极化编码方案，并展示其在块错误率上优于 TCC [18]。近来，更多关于时空极化编码的工作得到发展 [12]–[14]。此外，[18] 的结论已在一个无蜂窝毫米波通信系统的实验中得到验证 [1]。尽管 [18] 与 [1] 展示了 STCC 的良好前景，其背后的信息论原理尚未被充分挖掘。

在 Polyanskiy 有限块长区开创性非渐近工作 [17, Ch. 4.5] 的基础上，若干在不同信道状态信息（CSI）假设下、针对点对点（P2P）MIMO 的 STCC 信息论研究相继出现。[19] 研究了不同 CSI 条件下 STCC 的可达界与逆界，但未给出闭式表达式。基于 [19] 的结果，[8] 在仅接收端已知 CSI（CSI-R）的假设下导出瑞利衰落信道上的平均速率，而 [9] 在同一 CSI 假设下研究给定信道实现的可达速率。当收发两端均已知 CSI（即全 CSI）时，发送端可进行功率分配以更好地适配信道，从而获得更高速率。为此，经典注水方法 [17, Ch. 4.5] 及其改进版本 [20] 被采用¹。此外，我们从电磁信息论角度为 [10] 中的 STCC 设计提供了物理解释。上述全部工作 [8]–[10], [17], [19], [20] 都只考虑单发送流的 STCC，即所有子信道只参与一个流的编码。受此启发，我们前期工作 [11] 在 CSI-R 假设下把 STCC 框架推广到多流场景，并聚焦线性接收机下的可达速率分析。上述文献的更清晰汇总见表 I。

与 [11] 中的 CSI-R 设置不同，本文在全 CSI 假设下提出多子信道承载多流的 STCC（STCC-MSC）传输方案，同时考虑发送端设计与相应接收处理，并建立相应的可达速率优化框架。主要贡献总结如下：

1) 我们在 P2P MIMO 系统中构造 STCC-MSC 的传输架构。与传统 TCC 方案相比，所提 STCC-MSC 架构引入流–子信道匹配机制，使每个流可在多个子信道上传输并以更长码字编码。
2) 由于 STCC-MSC 需要对流–子信道匹配与 AWGN 信道编码进行联合设计，我们通过联合优化子信道分配与功率分配策略来最大化可达速率。为高效求解该混合整数非线性规划（MINLP）问题，我们提出惩罚式交替凸近似（PACA）算法。
3) 我们把 P2P STCC-MSC 设计推广到更一般的多用户场景。具体地，通过应用块对角化（BD）技术消除用户间干扰，下行和速率最大化问题被重构为 P2P 情形的 $K$ 重高维扩展；相反，上行和速率最大化问题分解为 $K$ 个并行独立子问题，每个等价于 P2P 场景的速率最大化问题。上下行和速率最大化问题都可用所提 PACA 算法高效求解。
4) 仿真结果表明，在 STCC-MSC 方案内，PACA 算法相比基准算法取得 9.85% 的速率提升；此外，STCC-MSC-PACA 联合方案相比 TCC 方案把速率提升 28.68%。

本文其余部分组织如下：第 II 节介绍预备知识，包括 MIMO 中的干扰管理以及 STCC 的动机与设计原则；第 III 节介绍 STCC-MSC 的传输架构并建立速率最大化问题；第 IV 节介绍 PACA 算法；第 V 节把设计推广到多用户 MIMO 场景；第 VI 节给出仿真结果；第 VII 节给出结论与讨论。本文用粗体大写字母表示矩阵、粗体小写字母表示向量；所用记号见表 II。

> **表 I（原文 Table I）：** STCC 可达速率的现有工作。

| 参考文献 | 闭式速率表达式 | CSI-R | CSI-T | 多流 | 多用户 |
|---|---|---|---|---|---|
| [19] | ✗ | ✓ | ✓ | ✗ | ✗ |
| [8], [9] | ✓ | ✓ | ✗ | ✗ | ✗ |
| [10], [17], [20] | ✓ | ✓ | ✓ | ✗ | ✗ |
| [11] | ✓ | ✓ | ✗ | ✓ | ✗ |
| 本文 | ✓ | ✓ | ✓ | ✓ | ✓ |

> **表 II（原文 Table II）：** 本文所用记号。

| 记号 | 含义 |
|---|---|
| $N_t$、$N_r$ | P2P MIMO 中的天线数 |
| $d$、$i$、$k$ | 流/子信道/用户索引 |
| $N_S$、$N_{S,k}$ | 空间自由度（DoF） |
| $D$ | 最大流数 |
| $n$ | 信道使用次数 |
| $K$ | 用户数 |
| $N_B$、$N_k$ | 多用户 MIMO 中的天线数 |
| $\mathbf X$、$\mathbf X$、$\mathbf x_d$、$\mathbf x_k$ | 发送码字 |
| $\mathbf Y$、$\mathbf Y$、$\mathbf y_d$、$\mathbf y_k$ | 接收码字 |
| $\mathbf H$、$\mathbf H$、$\mathbf H_k$、$\underline{\mathbf H}_k$ | 信道矩阵 |
| $\mathbf W$、$\mathbf W$、$\mathbf w_k$ | AWGN 矩阵/向量 |
| $\mathbf U$ | SVD 中的左奇异向量 |
| $\mathbf V$ | SVD 中的右奇异向量 |
| $\boldsymbol\Lambda$ | 奇异值矩阵 |
| $\lambda_i$ | 第 $i$ 个子信道的奇异值 |
| $\xi_i$ | 第 $i$ 个子信道的 SNR |
| $\boldsymbol\xi_d$ | 第 $d$ 个流各子信道的 SNR |
| $(\cdot)^H$、$(\cdot)^T$ | Hermitian 转置/转置 |
| $\mathbf M(i,:)$ | 矩阵 $\mathbf M$ 的第 $i$ 行 |
| $\mathbf M(:,d)$ | 矩阵 $\mathbf M$ 的第 $d$ 列 |
| $\mathbf M(i,d)$ | $\mathbf M$ 中第 $i$ 行第 $d$ 列的元素 |
| $\mathbf m(b:c)$ | 向量 $\mathbf m$ 从第 $b$ 到第 $c$ 个元素的子向量 |
| $\varepsilon$ | 块错误概率 |
| $\tilde i(\mathbf x;\mathbf y)$ | 信息密度 |
| $\mathbf P$、$\mathbf p$、$\mathbf p_k$ | 发送功率矩阵/向量 |
| $\sigma^2$、$\sigma_k^2$ | 噪声功率 |
| $\log$ | 二进制对数 |
| $\mathcal{CN}$ | 复正态分布 |
| $\mathbf S$、$\mathbf S_k$ | 子信道分配矩阵 |
| $V$、$V_i$ | 信道散度 |
| $R_T$、$R_{ST}$、$R_d$、$R_k$ | 可达速率 |
| $\mathcal N_S$、$\mathcal D$、$\mathcal K$ | 子信道/流/用户集合 |
| $\mathcal N_{S,k}$、$\mathcal D_k$ | 用户 $k$ 的子信道/流集合 |
| $Q^{-1}$ | 逆 $Q$ 函数 |
| $\mathbb R^{r\times c}$、$\mathbb C^{r\times c}$ | 维度为 $r\times c$ 的实/复矩阵 |
| $\mathbf G$、$\mathbf Q$ | 辅助变量 |
| $\mathbf I_r$ | $r\times r$ 单位矩阵 |
| $\mathbf 0_{r\times1}$ | $r\times1$ 零向量 |
| $\epsilon$、$\epsilon_O$ | 精度阈值 |
| $P$、$P_D$、$P_k$ | 最大发送功率 |
| $\lVert\cdot\rVert_2$、$\lVert\cdot\rVert_0$ | 欧氏范数/$\ell_0$ 范数 |
| $\odot$ | Hadamard 积 |
| $\{0,1\}^{N_S\times D}$ | $N_S\times D$ 维二元矩阵集合 |

> **原文脚注 1：** 从信息论角度看，并行高斯信道有效建模了全 CSI 下的 MIMO 系统，因为奇异值分解可将衰落信道分解为 $N_S$ 个独立高斯子信道，其中 $N_S$ 为空间自由度 [24, Ch. 7]。

## II. 预备知识

本节给出 STCC 的动机与设计原则，并说明其与 TCC 的区别。我们先简要回顾奇异值分解（SVD）在缓解 P2P MIMO 系统中空间复用干扰方面的应用，再介绍传统 TCC 的设计原则以及 STCC 的动机与设计原则。

### A. 用 SVD 把衰落信道转化为并行高斯信道

考虑 P2P MIMO 系统，发送端与接收端分别配备 $N_t$ 与 $N_r$ 根天线。由于码字需在较短块长内传输，考虑准静态平坦衰落 MIMO 信道是合理的，即信道矩阵 $\mathbf H\in\mathbb C^{N_r\times N_t}$ 在每个码字持续期间保持不变 [9]。$\mathbf X\in\mathbb C^{N_t\times n}$ 与 $\mathbf Y\in\mathbb C^{N_r\times n}$ 分别表示天线上的发送码字与接收码字，其中 $n$ 是信道使用次数即块长。在通信系统中，天线数刻画空间维度，$n$ 则度量时间维度。记 $\mathbf M(:,m)$ 为矩阵 $\mathbf M$ 的第 $m$ 列，第 $m$ 次信道使用时的发送与接收符号向量分别为 $\mathbf X(:,m)\in\mathbb C^{N_t\times1}$ 与 $\mathbf Y(:,m)\in\mathbb C^{N_r\times1}$，满足

$$
\mathbf Y(:,m)=\mathbf H\mathbf X(:,m)+\mathbf W(:,m), \tag{1}
$$

其中 $\mathbf W(:,m)\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N_r})$ 表示加性白高斯噪声（AWGN）向量，噪声矩阵 $\mathbf W$ 的所有元素为独立同分布复高斯随机变量。

令 $N_S=\mathrm{rank}(\mathbf H)$ 表示信道的空间自由度。左奇异矩阵 $\mathbf U\in\mathbb C^{N_r\times N_S}$ 与右奇异矩阵 $\mathbf V\in\mathbb C^{N_t\times N_S}$ 由 $\mathbf H$ 的 SVD 所得奇异矩阵的前 $N_S$ 列组成。$\boldsymbol\Lambda\in\mathbb R^{N_S\times N_S}$ 是对角矩阵，当 $N_r\ge N_t$ 时对角元素 $\lambda_1\ge\lambda_2\ge\cdots\ge\lambda_{N_S}$ 为 $\mathbf H\mathbf H^H$ 的有序非零奇异值，否则为 $\mathbf H^H\mathbf H$ 的有序非零奇异值。令 $\mathbf p=[p_1,p_2,\dots,p_{N_S}]^T$，其中 $p_i$ 是分配给第 $i$ 个子信道的功率，$\mathbf P=\mathrm{diag}(\mathbf p)\in\mathbb R^{N_S\times N_S}$。令

$$
\begin{aligned}
\overline{\mathbf X}(:,m)&=\mathbf P\mathbf V^H\mathbf X(:,m),\\
\overline{\mathbf Y}(:,m)&=\mathbf U^H\mathbf Y(:,m),\\
\overline{\mathbf W}(:,m)&=\mathbf U^H\mathbf W(:,m),
\end{aligned} \tag{2}
$$

则衰落信道 (1) 被转化为如下并行高斯信道：

$$
\overline{\mathbf Y}(:,m)=\mathbf P\boldsymbol\Lambda\overline{\mathbf X}(:,m)+\overline{\mathbf W}(:,m), \tag{3}
$$

其中由于 $\mathbf U$ 是酉矩阵，$\overline{\mathbf W}(:,m)\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N_S})$ 与 $\mathbf W(:,m)$ 具有相同分布。该变换使信息论结果可用于计算 MIMO 系统速率，在过去数十年指导了通信理论的发展，详见 [24, Ch. 7]。

### B. TCC 与 STCC 的设计原则

TCC 与 STCC 工作在 (3) 中的同一信道模型上，但编码模式不同，如图 1 所示。图 1 右侧给出 TCC 的编码模式：独立信息流在时域编码并在各子信道上传输。因此 TCC 方案最多支持 $N_S$ 个独立流的并发传输，每个码字的块长为 $n$。基于 Polyanskiy 等人建立的有限块长正态近似 [5]，TCC 方案的闭式可达速率表达式为 [9]

$$
R_T=\sum_{i=1}^{N_S}\left(\log\left(1+\frac{p_i\lambda_i}{\sigma^2}\right)-\frac{\sqrt{V_i}Q^{-1}(\varepsilon)}{\sqrt n}\log e\right), \tag{4}
$$

其中 $\varepsilon$ 是块错误概率，$Q^{-1}(\cdot)$ 表示逆高斯 $Q$ 函数，$p_i$ 是分配给第 $i$ 个子信道的发送功率，且

$$
V_i=1-\frac{1}{\left(1+\frac{p_i\lambda_i}{\sigma^2}\right)^2}, \tag{5}
$$

为信道散度。严格来说，有限块长可达速率的精确正态近似包含一个 $\mathcal O(\log n/n)$ 余项 [5]。由于该余项只以其渐近阶刻画、一般没有闭式表达，在解析推导与优化中通常被省略 [21]–[23]。此外，由于我们优化问题中块长 $n$ 固定，即便常用修正项 $\log n/(2n)$ 也只会给可达速率引入一个常数偏移，不会影响优化框架或所得资源分配。因此，沿用 [21]–[23] 的常见做法，我们在推导与优化中忽略该余项，以获得简洁、可处理的可达速率表达式。

如从 (4) 所见的，TCC 方案常因有限块长而遭受显著速率损失。因此研究者提出 STCC，试图通过用空间自由度换取每个流更长的码字来提升 MIMO 系统速率 [7], [18]。如图 1 左侧所示，STCC 方案用多个子信道协同传输一个流。于是 STCC 用空间自由度换取每个码字更长的码字长度，这又降低了最大可允许流数 $D$，满足 $D\le N_S$。需注意，图 1 中打乱了子信道顺序，以说明 STCC 的流可占用非相邻子信道，而不限于相邻子信道。根据 [17, Ch. 4.5] 的有限块长正态近似，$D=1$ 时 STCC 的可达速率为

$$
R_{ST}|_{D=1}=\sum_{i=1}^{N_S}\log\left(1+\frac{p_i\lambda_i}{\sigma^2}\right)-\sqrt{\sum_{i=1}^{N_S}V_i}\,\frac{Q^{-1}(\varepsilon)}{\sqrt n}\log e, \tag{6}
$$

其中 $V_i$ 由 (5) 给出，$\mathbf p=[p_1,p_2,\dots,p_{N_S}]^T$ 应由功率分配策略确定。如式 (4) 之后所述，式 (6) 中也省略余项，以获得简洁、可处理的可达速率表达式并聚焦于优化。已有证明：在 CSI-R 下等功率分配时 $R_{ST}|_{D=1}>R_T$ [8], [9]。然而据我们所知，全 CSI 可用时 STCC 多流情形尚无结果报道。在这种情况下，需要设计传输架构并确定信号处理方法（最终体现为子信道分配与功率分配的形式）。本文旨在解决上述问题并探索 STCC 相对 TCC 的潜在优越性。

> **图 1（原文 Fig. 1）：** 多流 MIMO 下 STCC 与 TCC 的编码模式。

## III. 传输架构与速率最大化问题建模

本节先构造 P2P MIMO 系统中 STCC-MSC 的传输架构，再建立相应的速率最大化问题。第 IV 节给出求解该问题的有效算法，第 V 节研究多用户场景。

### A. STCC-MSC 的传输架构

我们仍采用第 II 节的系统模型，发送端与接收端分别配备 $N_t$ 与 $N_r$ 根天线。与 [24, Ch. 7] 一样，为简洁我们分析等效基带信道并省略本文中的射频部分。等效基带衰落信道为 $\mathbf H$，$\mathrm{rank}(\mathbf H)=N_S$；可允许流数为 $D$，满足 $D\le N_S$；信道使用次数为 $n$。由于信道矩阵 $\mathbf H$ 在传输期间保持不变，预编码与合并策略可在全部 $n$ 次信道使用中复用。不失一般性，我们聚焦第 $m$ 次信道使用进行分析与说明。

在第 $m$ 次信道使用，左乘 $\mathbf P$ 与 $\mathbf V$ 进行预编码、左乘 $\mathbf U^H$ 进行接收合并后，得到 (3) 中的并行高斯信道。如第 II-A 节所述，$\mathbf V$ 与 $\mathbf U$ 由 $\mathbf H$ 决定，而 $\mathbf P$ 需要设计。令 $\mathcal D=\{1,2,\dots,D\}$ 与 $\mathcal N_S=\{1,2,\dots,N_S\}$ 分别表示流集合与子信道集合。$\boldsymbol\xi=[\xi_1,\xi_2,\dots,\xi_{N_S}]^T$ 表示各子信道的 SNR，其中 $\xi_i=\frac{p_i\lambda_i}{\sigma^2}$，$\forall i\in\mathcal N_S$。

与传统 TCC 架构仅涉及 AWGN 信道编码 [24, Fig. 7.2] 相比，所提 STCC-MSC 架构引入 AWGN 编码与流–子信道匹配的联合设计，使每个流可在多个子信道上传输，如图 2 所示。流–子信道匹配由分配矩阵 $\mathbf S\in\{0,1\}^{N_S\times D}$ 决定，其中 $\{0,1\}^{N_S\times D}$ 表示 $N_S\times D$ 维二元矩阵集合。记 $\mathbf S(i,d)$ 为 $\mathbf S$ 中第 $i$ 行第 $d$ 列的元素。$\mathbf S(i,d)=1$ 表示第 $i$ 个子信道分配给第 $d$ 个流，否则 $\mathbf S(i,d)=0$。该匹配在逻辑上分为两个阶段，分别在 AWGN 信道编码之前与之后执行。

首先，STCC-MSC 根据 $\mathbf S$ 把 $N_S$ 个子信道分配给 $D$ 个流，得到集合 $\{\boldsymbol\xi_d\}_{d=1}^{D}$ 与 $\{l_d\}_{d=1}^{D}$。这里 $l_d$ 表示 $\mathbf S$ 第 $d$ 列中非零元素的个数，即分配给第 $d$ 个流的子信道数。因此 STCC 中每个流都在相同的 $n$ 次信道使用上传输，而第 $d$ 个流的码字长度为 $l_dn$ 个发送符号。向量 $\boldsymbol\xi_d\in\mathbb R^{l_d\times1}$ 包含分配给第 $d$ 个流的各子信道 SNR，由下式给出

$$
\boldsymbol\xi_d=\left(\mathbf S(:,d)\odot\boldsymbol\xi\right)^+, \qquad\forall d\in\mathcal D, \tag{7}
$$

其中 $\mathbf S(:,d)$ 表示 $\mathbf S$ 的第 $d$ 列，$\odot$ 表示 Hadamard（逐元素）积，$(\mathbf m)^+$ 表示从向量 $\mathbf m$ 中移除零元素的操作。

其次，基于所得 $l_d$ 与 $\boldsymbol\xi_d$，第 $d$ 个流经 AWGN 信道编码后的码字记为 $\mathbf x_d\in\mathbb C^{1\times l_dn}$。最后，根据基于 $\mathbf S$ 的流–子信道重排构造整体时空码字 $\mathbf X\in\mathbb C^{N_S\times n}$。记 $\mathbf M(i,:)$ 为矩阵 $\mathbf M$ 的第 $i$ 行，$\mathbf m(b:c)$ 为向量 $\mathbf m$ 从第 $b$ 到第 $c$ 个元素的子向量。详细匹配过程见算法 1，STCC 的一个示例见图 3，其中 3 个流映射到 6 个子信道。按给定分配矩阵 $\mathbf S$，$l_1$、$l_2$、$l_3$ 的值分别为 1、2、3。图 3 只展示一种示例性的流–子信道分配；一般情况下 $\mathbf S$ 满足 $\sum_{d=1}^{D}\mathbf S(i,d)\le1$（$\forall i\in\mathcal N_S$），因此某子信道未必分配给任何流。此外，$\mathbf x_1,\mathbf x_2,\mathbf x_3$ 的顺序不影响可达速率，速率由流–子信道分配决定。

> **算法 1　STCC-MSC 中的流–子信道重排**
> **输入：** $\{\mathbf x_d\}_{d=1}^{D}$、$\mathbf S$。**输出：** $\mathbf X$
> 1: 初始化 $\mathbf X=\mathbf 0_{N_S\times n}$，$d=1$，$i=1$，$k=0$
> 2: **repeat**
> 3: 　**repeat**
> 4: 　　**if** $\mathbf S(i,d)=1$ **then**
> 5: 　　　$\mathbf X(i,:)=\mathbf x_d(kn+1:(k+1)n)$
> 6: 　　　更新 $k=k+1$
> 7: 　　　更新 $i=i+1$
> 8: 　　**until** $i=N_S$
> 9: 　重置 $k=0$ 并更新 $d=d+1$
> 10: **until** $d=D$
> 11: **return** $\mathbf X$

在接收端，接收信号矩阵 $\mathbf Y$ 通过子信道–流重排被转换为各流专属的观测集合 $\{\mathbf y_d\}_{d=1}^{D}$，该过程本质上是算法 1 的逆过程。由于重排过程无信息损失，且每个流都作为包含 $l_d$ 个子信道的独立系统运行，发送与接收信号之间的总信息密度等于各流信息密度之和，即 $\tilde i(\mathbf X;\mathbf Y)=\sum_{d=1}^{D}\tilde i(\mathbf x_d;\mathbf y_d)$。应用 (6)，第 $d$ 个流的可达速率为

$$
R_d=\sum_{i=1}^{N_S}\mathbf S(i,d)\log\left(1+\frac{p_i\lambda_i}{\sigma^2}\right)-a_{n,\varepsilon}\sqrt{\sum_{i=1}^{N_S}\mathbf S(i,d)V_i}, \tag{8}
$$

其中 $a_{n,\varepsilon}=Q^{-1}(\varepsilon)\sqrt n\log e$，$V_i$ 由 (5) 给出。使用 STCC-MSC 的 P2P MIMO 系统速率为各流速率之和：

$$
R_{ST}=\sum_{d=1}^{D}R_d. \tag{9}
$$

> **图 2（原文 Fig. 2）：** STCC-MSC 的等效基带传输架构。

> **图 3（原文 Fig. 3）：** STCC-MSC 的一个示例。

### B. 速率最大化问题建模

令 $\gamma_i=\frac{\lambda_i}{\sigma^2}$，$\forall i\in\mathcal N_S$。参照 (8) 与 (9)，STCC 的速率最大化问题可等价地通过最小化 $-R_{ST}$ 表述为

$$
\min_{\mathbf p,\mathbf S}\ \sum_{d=1}^{D}\left(a_{n,\varepsilon}\sqrt{\sum_{i=1}^{N_S}\mathbf S(i,d)V_i(p_i)}-\sum_{i=1}^{N_S}\mathbf S(i,d)\log(1+p_i\gamma_i)\right) \tag{10a}
$$

$$
\text{s.t.}\quad\sum_{i=1}^{N_S}p_i\le P, \tag{10b}
$$

$$
p_i\ge0,\quad\forall i\in\mathcal N_S, \tag{10c}
$$

$$
\mathbf S(i,d)=\{0,1\},\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D, \tag{10d}
$$

$$
\sum_{d=1}^{D}\mathbf S(i,d)\le1,\quad\forall i\in\mathcal N_S. \tag{10e}
$$

约束 (10b) 把发送功率限制在 $P$，约束 (10c) 要求每个子信道的发送功率非负；(10d) 是子信道分配矩阵 $\mathbf S$ 各元素的二元约束；(10e) 表示每个子信道最多分配给一个流。由于目标函数 (10a) 中优化变量的耦合与二元约束 (10d)，问题 (10) 是非凸 MINLP 问题。在多项式时间内求得问题 (10) 的全局最优解是棘手的。尽管穷举搜索、分支定界等搜索方法理论上可找到全局最优，但其过高复杂度限制了实际适用性 [25]。因此有必要以合理计算复杂度寻找局部最优解。

[26] 研究了与 (10) 类似的问题：在多用户下行正交频分多址（OFDMA）系统中，用多个子载波向每个单天线用户传输一个流。作者用大 M 技术解耦变量，随后提出逐次凸近似（SCA）算法处理目标函数中的非凸性与二元约束。然而，凸近似破坏了 big-M 重构的结构，产生违反原约束的解，从而降低算法性能。另一种常用的变量解耦技术是交替优化，即每次迭代优化部分变量而固定其余变量。然而用交替优化迭代优化 $\mathbf S$ 与 $\mathbf p$ 不适用于求解问题 (10)，因为如附录 A 所讨论，固定 $\mathbf p$ 时优化 $\mathbf S$ 是一个虚假（spurious）优化问题。因此，下一节我们提出惩罚式交替凸近似算法以高效获得问题 (10) 的局部最优解。第 VI 节的数值结果表明其优于 [26] 提出的大 M 凸近似（BMCA）算法。

## IV. 所提惩罚式交替凸近似算法

定义矩阵 $\mathbf Q\in\mathbb R^{N_S\times D}$，其第 $d$ 列为 $\mathbf Q(:,d)=\mathbf S(:,d)\odot\mathbf p$，$\forall d\in\mathcal D$，其中 $\mathbf M(:,d)$ 表示矩阵 $\mathbf M$ 的第 $d$ 列向量。原问题 (10) 可等价改写为

$$
\mathrm{P1}:\ \min_{\mathbf Q}\ V(\mathbf Q)-C(\mathbf Q) \tag{11a}
$$

$$
\text{s.t.}\quad\sum_{d=1}^{D}\sum_{i=1}^{N_S}\mathbf Q(i,d)\le P, \tag{11b}
$$

$$
\|\mathbf Q(i,:)\|_0\le1,\quad\forall i\in\mathcal N_S, \tag{11c}
$$

$$
\mathbf Q(i,d)\ge0,\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D, \tag{11d}
$$

其中

$$
V(\mathbf Q)=a_{n,\varepsilon}\sum_{d=1}^{D}\sqrt{\sum_{i=1}^{N_S}\left(1-\frac{1}{\left(1+\mathbf Q(i,d)\gamma_i\right)^2}\right)}, \tag{12}
$$

$$
C(\mathbf Q)=\sum_{d=1}^{D}\sum_{i=1}^{N_S}\log\left(1+\mathbf Q(i,d)\gamma_i\right), \tag{13}
$$

$\mathbf Q(i,:)$ 表示矩阵 $\mathbf Q$ 的第 $i$ 行，$\|\mathbf m\|_0$ 是向量 $\mathbf m$ 的 $\ell_0$ 范数，即向量 $\mathbf m$ 中非零元素的个数。

问题 (P1) 仍因凹的目标函数 (11a) 与稀疏约束 (11c) 而非凸。我们首先应用惩罚分解法处理约束 (11c)。通过引入辅助变量 $\mathbf G\in\mathbb R^{N_S\times D}$ 与惩罚项，把问题 (P1) 改写为 [27]

$$
\mathrm{P2}:\ \min_{\mathbf Q,\mathbf G}\ V(\mathbf Q)-C(\mathbf Q)+\sum_{i=1}^{N_S}\rho\|\mathbf G(i,:)-\mathbf Q(i,:)\|_2^2 \tag{14a}
$$

$$
\text{s.t.}\quad\sum_{d=1}^{D}\sum_{i=1}^{N_S}\mathbf Q(i,d)\le P, \tag{14b}
$$

$$
\mathbf Q(i,d)\ge0,\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D, \tag{14c}
$$

$$
\|\mathbf G(i,:)\|_0\le1,\quad\forall i\in\mathcal N_S, \tag{14d}
$$

其中 $\rho$ 是惩罚因子，$\|\mathbf m\|_2$ 是向量 $\mathbf m$ 的 $\ell_2$ 范数。当 $\rho$ 逐渐增大并足够大时，问题 (P2) 的最优解满足 $\mathbf G=\mathbf Q$，故问题 (P2) 与问题 (P1) 等价。虽然问题 (P2) 仍非凸，但可应用交替优化把它解耦为两个子问题：(1) 固定 $\mathbf G$ 优化 $\mathbf Q$；(2) 固定 $\mathbf Q$ 优化 $\mathbf G$。迭代求解这两个子问题即可获得问题 (P2) 的局部最优解。

**(1) 固定 $\mathbf G$ 优化 $\mathbf Q$：** (P2) 的该子问题为

$$
\mathrm{P2.1}:\ \min_{\mathbf Q}\ V(\mathbf Q)-C(\mathbf Q)+\sum_{i=1}^{N_S}\rho\|\mathbf G(i,:)-\mathbf Q(i,:)\|_2^2 \tag{15a}
$$

$$
\text{s.t.}\quad\sum_{d=1}^{D}\sum_{i=1}^{N_S}\mathbf Q(i,d)\le P, \tag{15b}
$$

$$
\mathbf Q(i,d)\ge0,\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D. \tag{15c}
$$

问题 (P2.1) 仍因目标函数 (15a) 中的凹函数 $V(\mathbf Q)$ 而非凸。因此我们应用 SCA 方法处理该凹项。由于 $V(\mathbf Q)$ 中同一列 $d$ 内的元素耦合，我们应用链式法则推导偏导数。丢开不影响优化变量的常数项 $V(\mathbf Q^{(\iota)})$，第 $\iota$ 次迭代所用的线性项表述为

$$
a_{n,\varepsilon}\sum_{d=1}^{D}\sum_{i=1}^{N_S}V_i'\left(\mathbf Q^{(\iota)}(i,d)\right)\left(\mathbf Q(i,d)-\mathbf Q^{(\iota)}(i,d)\right), \tag{16}
$$

其中 $\mathbf Q^{(\iota)}(i,d)$ 表示矩阵 $\mathbf Q^{(\iota)}$ 第 $i$ 行第 $d$ 列的元素，且对任意与 $\mathbf Q$ 维度匹配的矩阵 $\mathbf M$，函数 $V_i'(\mathbf M(i,d))$ 定义为

$$
V_i'\left(\mathbf M(i,d)\right)=\frac{\gamma_i}{\left(1+\mathbf M(i,d)\gamma_i\right)^3\sqrt{\sum_{k=1}^{N_S}\left(1-\frac{1}{\left(1+\mathbf M(k,d)\gamma_k\right)^2}\right)}}. \tag{17}
$$

去掉 (16) 中的常数部分，定义

$$
f^{(\iota)}(\mathbf Q)=a_{n,\varepsilon}\sum_{d=1}^{D}\sum_{i=1}^{N_S}V_i'\left(\mathbf Q^{(\iota)}(i,d)\right)\mathbf Q(i,d). \tag{18}
$$

于是问题 (P2.1) 在第 $\iota+1$ 次迭代被重构为如下近似凸优化问题：

$$
\mathrm{P2.1.1}:\ \min_{\mathbf Q}\ f^{(\iota)}(\mathbf Q)-C(\mathbf Q)+\sum_{i=1}^{N_S}\rho\|\mathbf G(i,:)-\mathbf Q(i,:)\|_2^2 \tag{19a}
$$

$$
\text{s.t.}\quad(15b),\ (15c). \tag{19b}
$$

问题 (P2.1.1) 可由 CVX [28] 等现有凸优化求解器最优求解，其最优解给出下一次迭代。SCA 收敛时的极限解也满足问题 (P2.1) 的 Karush–Kuhn–Tucker 条件。因此，迭代求解凸问题 (P2.1.1) 即可获得问题 (P2.1) 的局部最优解。

**(2) 固定 $\mathbf Q$ 优化 $\mathbf G$：** (P2) 的该子问题为

$$
\mathrm{P2.2}:\ \min_{\mathbf G}\ \sum_{i=1}^{N_S}\rho\|\mathbf G(i,:)-\mathbf Q(i,:)\|_2^2 \tag{20a}
$$

$$
\text{s.t.}\quad\|\mathbf G(i,:)\|_0\le1,\quad\forall i\in\mathcal N_S. \tag{20b}
$$

问题 (P2.2) 在第 $\varsigma$ 次迭代的最优解为 [27, prop. 3.1]

$$
\mathbf G^{(\varsigma)}(i,d)=\delta_{i,d}\mathbf Q(i,d)\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D, \tag{21}
$$

其中

$$
\delta_{i,d}=\begin{cases}1,&\text{若 }\mathbf Q(i,j)=\max_{1\le j\le D}\mathbf Q(i,j),\\0,&\text{否则}.\end{cases} \tag{22}
$$

这意味着对每个 $i\in\mathcal N_S$，行向量 $\mathbf G^{(\varsigma)}(i,:)$ 由保留 $\mathbf Q(i,:)$ 中的最大元素、并把该行其余元素置零得到。

所提算法详见算法 2，它包含三层迭代。令 $\tau$、$\varsigma$、$\iota$ 分别表示外层、中层与内层循环的迭代索引。目标函数记为 $f_o^{(\tau)}$、$f_m^{(\varsigma)}$、$f_i^{(\iota)}$，分别对应问题 (P1)、(P2)、(P2.1.1)，表达式见 (11a)、(14a)、(19a)。在外层迭代中，逐渐增大惩罚因子 $\rho$ 以强制问题 (P1) 与问题 (P2) 的等价性。在中层迭代中，交替求解子问题 (P2.1) 与 (P2.2) 以获得问题 (P2) 的局部最优解，其中 (P2.2) 是凸的，而 (P2.1) 非凸；因此在内层迭代中，通过迭代求解近似凸问题 (P2.1.1) 获得问题 (P2.1) 的局部最优解。

> **算法 2　惩罚式交替凸近似（PACA）算法**
> **输入：** $\boldsymbol\gamma$、$D$、$N_S$、$P$、$a_{n,\varepsilon}$、$\eta$、$\epsilon$、$\epsilon_O$
> **输出：** $\mathbf p^\star$、$\mathbf S^\star$
> 1: 初始化 $\tau=0$，$\varsigma=0$，$\iota=0$
> 2: 初始化 $\rho>0$，$\mathbf Q^{(0)}$
> 3: 置 $f_o^{(0)}=f_m^{(0)}=f_i^{(0)}=0$
> 4: **repeat**　▷ 外层循环：惩罚更新
> 5: 　**repeat**　▷ 中层循环：交替优化
> 6: 　　按 (21) 更新 $\mathbf G^{(\varsigma+1)}$
> 7: 　　**repeat**　▷ 内层循环：SCA
> 8: 　　　求解 (P2.1.1) 得 $\mathbf Q^{(\iota+1)}$
> 9: 　　　计算 $f_i^{(\iota+1)}$
> 10: 　　　$\iota\leftarrow\iota+1$
> 11: 　　**until** $|f_i^{(\iota)}-f_i^{(\iota-1)}|\le\epsilon$
> 12: 　　置 $\mathbf Q^{(\varsigma+1)}=\mathbf Q^{(\iota)}$
> 13: 　　计算 $f_m^{(\varsigma+1)}$
> 14: 　　$\varsigma\leftarrow\varsigma+1$
> 15: 　**until** $|f_m^{(\varsigma)}-f_m^{(\varsigma-1)}|\le\epsilon$
> 16: 　置 $\mathbf Q^{(\tau+1)}=\mathbf Q^{(\varsigma)}$，$\mathbf G^{(\tau+1)}=\mathbf G^{(\varsigma)}$
> 17: 　计算 $f_o^{(\tau+1)}$
> 18: 　$\rho\leftarrow\eta\rho$，$\tau\leftarrow\tau+1$
> 19: **until** $\|\mathbf Q^{(\tau)}-\mathbf G^{(\tau)}\|_2^2\le\epsilon_O$ 且 $|f_o^{(\tau)}-f_o^{(\tau-1)}|\le\epsilon$
> 20: 由 $\mathbf Q^{(\tau)}$ 恢复 $\mathbf p^\star$ 与 $\mathbf S^\star$
> 21: **return** $\mathbf p^\star,\mathbf S^\star$

外层迭代的停止条件允许把收敛解 $\mathbf Q^{(\tau)}$ 视为问题 (P1) 的近似可行解，因为 $\mathbf Q^{(\tau)}$ 的每一行至多含一个主导（即显著非零）元素，其余元素均小于某阈值 $\Gamma$，且 $\Gamma$ 可依停止准则中 $\epsilon_O$ 的取值任意小。基于 $\mathbf Q^{(\tau)}$，我们如下恢复向量 $\mathbf p^\star$ 与二元矩阵 $\mathbf S^\star$。对每个 $i\in\mathcal N_S$，

$$
p^\star(i)=\begin{cases}\mathbf Q^{(\tau)}(i,d),&\text{若存在 }d\text{ 使 }\mathbf Q^{(\tau)}(i,d)>\Gamma,\\0,&\text{否则}.\end{cases} \tag{23}
$$

类似地，子信道分配矩阵 $\mathbf S^\star$ 恢复为

$$
\mathbf S^\star(i,d)=\begin{cases}1,&\text{若 }\mathbf Q^{(\tau)}(i,d)>\Gamma,\\0,&\text{否则},\end{cases} \tag{24}
$$

对每个 $i\in\mathcal N_S$ 与 $d\in\mathcal D$。

所提 PACA 算法的收敛性来自其三层嵌套循环的收敛性。具体地，固定 $\mathbf G$ 时，内层 SCA 循环收敛到问题 (P2.1.1) 的稳定点。内层循环收敛后，$\mathbf Q$ 被更新，随后在中层循环中与 $\mathbf G$ 交替优化直至收敛。最后，外层循环按惩罚分解框架更新惩罚参数，其收敛到局部最优解由 [27] 的 Th. 4.3 保证。由于每个外层迭代都以其内层迭代的收敛解初始化，所提 PACA 算法的收敛性得到保证。

内点法的计算复杂度通常为 $\mathcal O(\alpha^3)$ 量级，其中 $\alpha$ 表示决策变量数。在问题 (P2.1.1) 中，优化变量 $\mathbf Q\in\mathbb R^{N_S\times D}$ 共含 $\alpha=N_SD$ 个变量。因此，对该问题应用内点法的最坏单次迭代复杂度为 $\mathcal O((N_SD)^3)$。于是所提算法的总体计算复杂度为 $l_1l_2l_3\mathcal O((N_SD)^3)$，其中 $l_1$、$l_2$、$l_3$ 分别表示外层、中层与内层循环的迭代次数。BMCA 算法基于 SCA 迭代运行，每次迭代求解一个含三个 $N_SD$ 维变量的子问题。该子问题用内点法求解的复杂度为 $\mathcal O((N_SD)^3)$，则 BMCA 收敛前的总体复杂度为 $l_B\mathcal O((N_SD)^3)$，其中 $l_B$ 是迭代次数。因此 PACA 与 BMCA 算法具有相同阶的计算复杂度，因为二者的缩放行为都由 $\mathcal O((N_SD)^3)$ 决定。

## V. 多用户 MIMO 系统中的 STCC-MSC

单小区多用户 MIMO 通信系统的可达速率关键取决于用户间干扰如何管理。对传统 TCC 方案，脏纸编码（DPC）是 MIMO 下行（广播）信道唯一已知的容量可达策略，而连续干扰消除（SIC）在 MIMO 上行（多址）信道中起同样作用 [29]。然而 DPC 与 SIC 都依赖多层非线性处理，使其难以实时实现。此外，在有限块长区通信本身存在非零错误概率，SIC 与 DPC 中的误差传播效应会被放大，变得不可忽略。作为一种低复杂度且广泛使用的替代方案，块对角化（BD）通过把每个用户的信号投影到其他用户信道的零空间来线性消除用户间干扰，从而有效把多用户 MIMO 信道转化为一组并行 P2P MIMO 信道 [30]。尽管 BD 在容量意义上次优，但它可在高 SNR 区渐近接近容量 [30]，且实现复杂度低，对实际系统有吸引力。

其他收发机设计，如连续迫零 DPC [31]、加权 MMSE [32] 及相关方法 [33]，在某些区间可实现更好的干扰抑制–噪声放大折中，但通常带来更高计算复杂度且仍留残余干扰。迄今 STCC 的信息论结果仅适用于并行高斯信道。因此本节采用 BD 消除用户间干扰，从而能够应用第 III、IV 节所提 STCC-MSC 架构与联合子信道/功率分配策略。

令 $K$ 表示用户数，第 $k$ 个用户配备 $N_k$ 根天线，用户集合记为 $\mathcal K=\{1,2,\dots,K\}$。基站（BS）配备 $N_B$ 根天线，满足 $\sum_{k=1}^{K}N_k\le N_B$。下面两个小节分别考虑下行与上行情形。为清晰，同一记号 $\mathbf H_k$ 用于表示 BS 与第 $k$ 个用户之间的信道矩阵：下行时 $\mathbf H_k\in\mathbb C^{N_k\times N_B}$，上行时 $\mathbf H_k\in\mathbb C^{N_B\times N_k}$。第 $k$ 个用户的可允许流数为 $D_k$，满足 $D_k\le N_{S,k}\le N_k$，其中 $N_{S,k}=\mathrm{rank}(\mathbf H_k)$ 是第 $k$ 个用户的空间自由度。第 $k$ 个用户的子信道集合与流集合分别记为 $\mathcal N_{S,k}=\{1,2,\dots,N_{S,k}\}$ 与 $\mathcal D_k=\{1,2,\dots,D_k\}$。

### A. 多用户下行 STCC-MSC

令 $\mathbf A_k\mathbf x_k\in\mathbb C^{N_B\times1}$ 表示 BS 在某一信道使用向用户 $k$ 发送的符号向量，其中 $\mathbf A_k$ 是对用户 $k$ 的用户间干扰消除矩阵。BS 的发送符号向量为 $\sum_{k=1}^{K}\mathbf A_k\mathbf x_k$。第 $k$ 个用户的接收信号为

$$
\mathbf y_k=\mathbf H_k\mathbf A_k\mathbf x_k+\sum_{j=1,j\neq k}^{K}\mathbf H_k\mathbf A_j\mathbf x_j+\mathbf w_k, \tag{25}
$$

其中 $\mathbf w_k\sim\mathcal{CN}(\mathbf 0,\sigma_k^2\mathbf I_{N_k\times N_k})$ 是 AWGN。在下行通信中，BD 方法把发往用户 $k$ 的信号投影到所有其他用户信道的零空间。定义

$$
\underline{\mathbf H}_k=\left[\mathbf H_1^T,\dots,\mathbf H_{k-1}^T,\mathbf H_{k+1}^T,\dots,\mathbf H_K^T\right]^T\in\mathbb C^{\underline N_k\times N_B}, \tag{26}
$$

它表示除用户 $k$ 外所有用户的组合信道矩阵，其中 $\underline N_k=\sum_{j=1,j\neq k}^{K}N_j$，由于 $\sum_{k=1}^{K}N_k\le N_B$，满足 $N_B-\underline N_k\ge N_k$。$\underline{\mathbf H}_k$ 的 SVD 为

$$
\underline{\mathbf H}_k=\underline{\mathbf U}_k\begin{bmatrix}\underline{\boldsymbol\Lambda}_k&\mathbf 0\\\mathbf 0&\mathbf 0\end{bmatrix}\left[\mathbf V_k^{(1)}\ \mathbf V_k^{(0)}\right]^H, \tag{27}
$$

其中 $\underline{\boldsymbol\Lambda}_k\in\mathbb R^{\underline N_k\times\underline N_k}$ 是对角线元素为奇异值的对角矩阵。$\mathbf V_k^{(1)}$ 与 $\mathbf V_k^{(0)}$ 都是具有 $N_B$ 行的矩阵，分别包含前 $\underline N_k$ 个与后 $(N_B-\underline N_k)$ 个右奇异向量。由于 $\mathbf V_k^{(0)}$ 的列构成 $\underline{\mathbf H}_k$ 零空间的正交基，我们取其前 $N_k$ 列构造用户 $k$ 的用户间干扰消除矩阵，记为 $\mathbf A_k\in\mathbb C^{N_B\times N_k}$。矩阵集合 $\{\mathbf A_k\}_{k=1}^{K}$ 满足 $\underline{\mathbf H}_k\mathbf A_j=\mathbf 0$，$\forall j\neq k$。因此信道 (25) 可重写为

$$
\mathbf y_k=\mathbf H_k\mathbf A_k\mathbf x_k+\mathbf w_k, \tag{28}
$$

其中 $\mathbf x_k\in\mathbb C^{N_k\times1}$。多用户 MIMO 下行系统现被解耦为 $K$ 个并行 P2P 子系统，每个子系统都能充分利用其空间自由度，因为 $N_k\ge N_{S,k}$。

由于 $\mathbf A_k$ 由一组正交基构成，把信号向量乘以 $\mathbf A_k$ 不改变发送功率，即 $\|\mathbf A_k\mathbf x_k\|_2^2=\|\mathbf x_k\|_2^2$。因此对每个用户，把 (28) 中的 $\mathbf H_k\mathbf A_k$ 等价视为 (1) 中的有效信道矩阵，即得到一个 P2P MIMO 通信子系统。据此可应用第 III、IV 节的设计得到下行多用户 STCC-MSC 的可达速率。每个子系统遵循图 2 所示传输架构，其中左奇异矩阵 $\mathbf U_k\in\mathbb C^{N_k\times N_{S,k}}$ 与右奇异矩阵 $\mathbf V_k\in\mathbb C^{N_B\times N_{S,k}}$ 由第 $k$ 个子系统的 $\mathbf H_k\mathbf A_k$ 的 SVD 所得奇异矩阵的前 $N_{S,k}$ 列组成。$\boldsymbol\lambda_k=[\lambda_{k,1},\lambda_{k,2},\dots,\lambda_{k,N_{S,k}}]^T$ 是 $\mathbf H_k\mathbf A_k(\mathbf H_k\mathbf A_k)^H$ 的有序非零奇异值。令 $\mathbf p_k=[p_{k,1},p_{k,2},\dots,p_{k,N_{S,k}}]^T$ 表示第 $k$ 个子系统的功率分配向量，$\gamma_{k,i}=p_{k,i}/\sigma_k^2$，$\forall k\in\mathcal K$，$\forall i\in\mathcal N_{S,k}$。BS 的最大发送功率为 $P_D$。回顾问题 (10)，子信道分配矩阵 $\{\mathbf S_k\in\mathbb R^{N_{S,k}\times D_k}\}_{k=1}^{K}$ 与功率分配向量 $\{\mathbf p_k\in\mathbb R^{N_{S,k}\times1}\}_{k=1}^{K}$ 由如下和速率最大化问题的解确定：

$$
\min_{\{\mathbf p_k\}_{k=1}^{K},\{\mathbf S_k\}_{k=1}^{K}}\ -\sum_{k=1}^{K}R_k \tag{29a}
$$

$$
\text{s.t.}\quad\sum_{k=1}^{K}\sum_{i=1}^{N_{S,k}}p_{k,i}\le P_D, \tag{29b}
$$

$$
p_{k,i}\ge0,\quad\forall k\in\mathcal K,\ \forall i\in\mathcal N_{S,k}, \tag{29c}
$$

$$
\mathbf S_k(i,d)=\{0,1\},\quad\forall k\in\mathcal K,\ \forall i\in\mathcal N_{S,k},\ \forall d\in\mathcal D_k, \tag{29d}
$$

$$
\sum_{d=1}^{D_k}\mathbf S_k(i,d)\le1,\quad\forall k\in\mathcal K,\ \forall i\in\{1,\dots,N_{S,k}\}, \tag{29e}
$$

其中

$$
-R_k=\sum_{d=1}^{D_k}\left(a_{n,\varepsilon}\sqrt{\sum_{i=1}^{N_{S,k}}\mathbf S_k(i,d)V_{k,i}(p_{k,i})}-\sum_{i=1}^{N_{S,k}}\mathbf S_k(i,d)\log(1+p_{k,i}\gamma_{k,i})\right) \tag{30}
$$

且

$$
V_{k,i}=1-\frac{1}{\left(1+p_{k,i}\gamma_{k,i}\right)^2}. \tag{31}
$$

问题 (29) 可视为问题 (10) 的多用户推广——本质上是 $K$ 重高维扩展，其中总发送功率由 (29b) 全局约束。因此，第 IV 节为求解 (10) 所提的 PACA 算法可应用于求解 (29)。具体地，先引入辅助变量 $\{\mathbf Q_k\}_{k=1}^{K}$，其第 $i$ 行第 $d$ 列元素 $\mathbf Q_k(i,d)=\mathbf S_k(i,d)p_{k,i}$；再引入辅助变量 $\{\mathbf G_k\}_{k=1}^{K}$ 与相应惩罚因子 $\{\rho_k\}_{k=1}^{K}$，则问题 (29) 可重构为与 (14) 中问题 (P2) 结构类似的连续非凸问题，待求变量为 $\{\mathbf Q_k\}_{k=1}^{K}$ 与 $\{\mathbf G_k\}_{k=1}^{K}$。最后，把与 P2P STCC-MSC 相关的输入与变量替换为多用户设置对应项后，应用算法 2 所提 PACA 算法即可有效求解该重构问题。结果，求解 (29) 的总体计算复杂度随用户数 $K$ 线性缩放。

### B. 多用户上行 STCC-MSC

由于上下行对偶性，类似地用 BD 方法管理上行通信系统中的用户间干扰。略微滥用记号，用 $\mathbf x_k\in\mathbb C^{N_k\times1}$ 表示用户 $k$ 在某一信道使用的发送符号向量。BS 处的接收信号为

$$
\mathbf y=\sum_{k=1}^{K}\mathbf H_k\mathbf x_k+\mathbf w, \tag{32}
$$

其中 $\mathbf w\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N_B\times N_B})$ 是 BS 处 AWGN。左乘 $\mathbf B_k\in\mathbb C^{N_k\times N_B}$ 可恢复第 $k$ 个用户的信号：

$$
\mathbf B_k\mathbf y=\mathbf B_k\mathbf H_k\mathbf x_k+\mathbf B_k\sum_{j=1,j\neq k}^{K}\mathbf H_j\mathbf x_j+\mathbf B_k\mathbf w. \tag{33}
$$

沿用 (26) 与 (27) 的步骤，对 $\underline{\mathbf H}_k^H$ 应用 SVD（其中 $\underline{\mathbf H}_k$ 是除用户 $k$ 外所有用户的拼接信道矩阵），得到 $\underline{\mathbf H}_k^H$ 零空间的正交基。随后从该基中选取前 $N_k$ 列并取 Hermitian 转置，构造酉矩阵 $\mathbf B_k$。于是有 $\mathbf B_k\underline{\mathbf H}_k=\underline{\mathbf H}_k^H\mathbf B_k^H=\mathbf 0_{N_k\times N_k}$，(33) 重写为

$$
\overline{\mathbf y}_k=\mathbf B_k\mathbf H_k\mathbf x_k+\overline{\mathbf w}, \tag{34}
$$

其中 $\overline{\mathbf y}_k=\mathbf B_k\mathbf y$，$\overline{\mathbf w}=\mathbf B_k\mathbf w$。由于 $\mathbf B_k$ 是酉矩阵，有 $\|\overline{\mathbf y}_k\|_2^2=\|\mathbf y_k\|_2^2$ 且 $\overline{\mathbf w}\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N_k\times N_k})$。多用户 MIMO 上行系统现被解耦为 $K$ 个并行 P2P 子系统，以 $\mathbf B_k\mathbf H_k$ 为 (1) 中的等效信道矩阵。与下行类似，每个子系统遵循图 2 所示架构，其奇异矩阵由第 $k$ 个子系统的 $\mathbf B_k\mathbf H_k$ 的 SVD 得到。与下行在应用 BD 后需要在 BS 处联合功率分配不同，上行设置因不存在用户间干扰，允许每个用户独立最大化自身传输速率。因此，求解多用户上行 STCC-MSC 的和速率最大化问题等价于求解 $K$ 个并行的速率最大化问题。沿用第 V-A 节记号，第 $k$ 个问题为

$$
\min_{\mathbf p_k,\mathbf S_k}\ -\overline R_k \tag{35a}
$$

$$
\text{s.t.}\quad\sum_{i=1}^{N_{S,k}}p_{k,i}\le P_k, \tag{35b}
$$

$$
p_{k,i}\ge0,\quad\forall i\in\mathcal N_{S,k}, \tag{35c}
$$

$$
\mathbf S_k(i,d)=\{0,1\},\quad\forall i\in\mathcal N_{S,k},\ \forall d\in\mathcal D_k, \tag{35d}
$$

$$
\sum_{d=1}^{D_k}\mathbf S_k(i,d)\le1,\quad\forall i\in\mathcal N_{S,k}, \tag{35e}
$$

其中 $P_k$ 是用户 $k$ 的最大发送功率，$p_{k,i}$ 是用户 $k$ 分配给其第 $i$ 个子信道的功率。问题 (35) 可视为 P2P STCC-MSC 速率最大化问题，可直接应用第 IV 节所提 PACA 算法有效求解。

## VI. 数值结果

本节给出 P2P（图 4–8）与多用户（图 9）两种场景的数值结果²。沿用先前工作 [8], [9], [11]，无线信道建模为瑞利衰落，信道矩阵每个元素独立取自圆对称复高斯分布 $\mathcal{CN}(0,\beta)$，$\beta$ 表示大尺度路损。路损设为 $\beta=32.4+20\log_{10}(f_c)+30\log_{10}(d)$ [34]，其中 $f_c$ 是载频，$d$ 是收发距离。全部仿真结果在 5000 次独立信道实现上平均。由于精确的有限 $n$ 余项没有闭式，而常用近似 $\log n/(2n)$ 相对较小、对固定 $n$ 只引入常数偏移，全部数值结果均采用第 II、III 节引入的标准正态近似，以与优化框架保持一致。该省略不影响相对性能比较或由数值结果得出的结论。

在 P2P 通信中，发送端与接收端天线数分别设为 12 与 8，二者距离 $d=200$ 米。最大发送功率设为 24 dBm，符合局域 BS 允许的发送功率 [35]。多用户场景考虑 8 个用户，BS 配备 32 根天线，每个用户 4 根天线；每个用户的可允许流数设为 2。用户均匀分布在半径 50 米的圆形区域内，圆心距 BS 200 米。下行通信中 BS 最大发送功率设为 28 dBm，符合中等覆盖 BS 允许的发送功率 [35]；上行通信中所有用户合计最大发送功率为 28 dBm，并在用户间均分。其余仿真参数见表 III（除非特别说明）。

> **表 III（原文 Table III）：** 仿真参数。

| 参数 | 取值 |
|---|---|
| 载波频率 $f_c$ | 3.5 GHz |
| 传输带宽 $B$ | 60 MHz [35] |
| 噪声功率谱密度 | −174 dBm/Hz |
| 信道使用次数 $n$ | 30 |
| 块错误概率 $\varepsilon$ | $10^{-6}$ |
| 初始惩罚因子 $\rho$ | 1 |
| 惩罚更新因子 $\eta$ | 2 |

为在相同发送流数 $D$ 下与所提 STCC 架构公平比较，我们引入称为受限流时间信道编码（LS-TCC）的基准，即把传统 TCC 约束为最多使用 $D$ 个流。在该约束下，如附录 B 所述，只激活 $D$ 个最强特征信道并在其间分配发送功率。此外还纳入无该流约束的传统 TCC 作为基准，即利用全部可用空间子信道，$D=N_S$。

图中主要标签说明如下：(1)"STCC-PACA"表示采用本文所提 PACA 算法的 STCC-MSC 方案；(2)"STCC-BMCA"表示采用 [26] 所提 BMCA 算法的 STCC-MSC 方案；(3)"TCC-WF"表示采用注水（WF）功率分配的 TCC 方案，它在渐近区可达容量但在有限块长区不适用；(4)"TCC-SCA"表示功率分配采用逐次凸近似（SCA）方法的 TCC 方案，见附录 B；(5)"LS-TCC-WF"表示采用 WF 功率分配的 LS-TCC 基准；(6)"LS-TCC-SCA"表示采用 SCA 功率分配的 LS-TCC 基准。

图 4 展示所提 PACA 算法与基准 BMCA 算法求解 STCC 速率最大化问题 (10)（可允许流数为 5）的收敛过程。如图所示，PACA 算法收敛较慢，但最终达到比 BMCA 算法更高的可达速率。在 PACA 算法中，由于早期迭代惩罚因子 $\rho$ 较小，目标函数出现波动，这导致中间解违反问题 (P2) 中的 $\ell_0$ 范数约束 (11c)；随 $\rho$ 指数增大，目标变为单调，并在越过某阈值后快速增长，最终收敛。

> **图 4（原文 Fig. 4）：** 速率随迭代索引 $\tau$ 的变化。

图 5 给出速率随可允许流数 $D$ 的变化。结果表明，在 STCC 方案内，PACA 算法相比 BMCA 算法取得 9.85% 的速率提升；此外，STCC-PACA 组合相比 LS-TCC 方案把速率提升 28.68%。由于 TCC 是 LS-TCC 在 $D=N_S$ 时的特例，其可达速率不随 $D$ 变化。与 [11] 在 CSI-R 与线性接收机下观察到的单调下降趋势不同，所提 PACA 算法得到的可达速率并不随 $D$ 严格下降。该差异源于全 CSI 设置下发送功率与流分配被联合优化，导致不同 $D$ 对应不同的资源分配解。此外，由于问题 (10) 非凸，PACA 收敛到局部最优解，其目标值可能随 $D$ 出现非单调变化。相反，BMCA 算法的速率随 $D$ 增大单调下降，表明其优化行为不同。

> **图 5（原文 Fig. 5）：** 速率随可允许流数 $D$ 的变化。

图 6 给出可达速率随发送功率 $P$ 的变化（可允许流数 $D=5$）。由于 $D=5$ 时 WF 与 SCA 方法在 TCC 与 LS-TCC 下速率几乎相等，图 6 只绘出 TCC-SCA 与 LS-TCC-SCA。如预期，所有方案的速率随发送功率增大而提高。一个有趣的观察是，PACA 算法相对 BMCA 算法的性能优势随发送功率增大而逐渐减小。这主要是因为 PACA 的性能增益来源于其降低目标函数 (11a) 中涉及 $V_i$ 的速率损失项的能力；随着 SNR 提高，(5) 中定义的信道散度项 $V_i$ 趋于 1，使速率损失项变为常数。结果两种算法取得的速率逐渐趋于一致。此外，增大发送功率会放大 TCC 相对 LS-TCC 的速率优势，其根源在于 TCC 的完全子信道复用增益。

> **图 6（原文 Fig. 6）：** 速率随发送功率 $P$ 的变化。

> **图 7（原文 Fig. 7）：** 速率随信道使用次数 $n$ 的变化。

图 7 给出不同错误概率要求下速率随信道使用次数 $n$ 的变化（$D=5$）。如图 5 所示，该设置下 LS-TCC 与 TCC 的可达速率几乎相同，故为视觉清晰只绘出 LS-TCC 曲线。如式 (4) 与 (8) 所示，STCC 与 TCC 方案的速率都随 $n$ 增大而提高，并随错误概率要求变严而下降。此外，我们按附录 C 研究了 $n\to\infty$ 时的渐近容量，并证明了 STCC 与 TCC 具有相同的渐近容量。从图中可观察到，随 $n$ 增大，所有方案的可达速率逐渐接近其相应的渐近容量。此外，与 [9]–[11] 的发现一致，$n$ 越小，STCC 相对 LS-TCC 的速率优势越大，凸显其在短块长通信中的优越性。

图 8 说明不完美 CSI 的影响（$D=5$）。在不完美 CSI 下，按 [8] 的方法把信道估计误差的影响等价视为附加噪声。具体地，热噪声功率归一化为 1，估计误差方差 $\xi^2$ 设为 0.02 与 0.2。在该模型下，第 $i$ 个子信道的有效接收 SNR 为 $\frac{p_i/\sigma^2}{p_i\xi^2+1}$。如预期，信道估计误差降低有效接收 SNR，导致可达速率下降；且该性能退化在高发送 SNR 下更明显，与 [8] 报告的观察一致。

> **图 8（原文 Fig. 8）：** 不完美 CSI 下速率随发送功率的变化。

图 9 给出下行与上行通信中所有用户的和速率。在服务相同用户数时，下行和速率高于上行，且该优势随用户数增加而更显著。这归因于下行通信中 BS 处的集中式子信道与功率分配，而上行用户独立优化各自传输、缺乏协调。随用户数增加，和速率总体因空间自由度利用更充分而提高，从而带来更高的空间复用增益。然而，当用户天线总数接近 BS 天线数时，BD 方法下每个用户可用的零空间受到显著限制。该限制降低有效传输能力，导致上行和速率直接下降。相反，下行受益于 BS 的集中式资源分配，尽管速率增益递减，仍能保证和速率持续增长。此外，随用户数增加，分配给每个用户的发送功率下降，从而扩大 PACA 算法相对 BMCA 算法的速率优势，这与图 6 的发现一致。

> **图 9（原文 Fig. 9）：** 和速率随用户数 $K$ 的变化。

## VII. 结论与讨论

本文研究了有限块长区 CSI 可用时 MIMO 系统中 STCC 的可达速率。我们首先在 P2P MIMO 系统中构造 STCC-MSC 传输架构；随后通过联合优化子信道分配与功率分配策略最大化 STCC-MSC 的速率，并将其建模为 MINLP 问题；提出 PACA 算法高效求解并获得局部最优解。我们进一步把设计推广到更一般的多用户 MIMO 系统：通过应用 BD 方法消除用户间干扰，重构后的和速率最大化问题可由所提 PACA 算法有效求解。仿真结果表明，在 STCC-MSC 方案内，PACA 算法相比基准算法取得 9.85% 的速率提升；此外，STCC-MSC-PACA 联合方案相比传统 TCC 把速率提升 28.68%。

> **原文疑点：** 摘要与贡献 4) 称 STCC-MSC-PACA 相比 "TCC 方案" 提升 28.68%，而 §VI 图 5 的表述为相比 "LS-TCC 方案" 提升 28.68%。由于 LS-TCC（受限流 TCC）与无约束 TCC（$D=N_S$）速率不同，两处所指基准并不一致；此处按原文照录并加注。

本工作给出了 STCC 在 MIMO 通信系统中的应用。与传统 TCC 架构相比，所提 STCC-MSC 架构在整体结构上仅做适度修改便引入流–子信道匹配机制。此外，PACA 算法为进一步拓展未来工作提供了合适基础，例如这些拓展可能涉及不同优化目标（如最大化加权和速率或最小用户速率以增强公平性）、附加约束（如对特定用户或流的最小速率保证），以及 STCC 在新兴通信范式（包括无蜂窝系统与可重构智能表面辅助通信）中的应用。

## 附录 A. 固定 $q$ 时问题 (10) 中 $S$ 的虚假优化分析

用交替优化迭代优化 $\mathbf S$ 与 $\mathbf p$ 求解问题 (10) 时，固定 $q$ 求解 $\mathbf S$ 的子问题表述为

$$
\min_{\mathbf S}\ f_V(\mathbf S)-f_C(\mathbf S) \tag{36a}
$$

$$
\text{s.t.}\quad\mathbf S(i,d)=\{0,1\},\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D, \tag{36b}
$$

$$
\sum_{d=1}^{D}\mathbf S(i,d)\le1,\quad\forall i\in\mathcal N_S, \tag{36c}
$$

其中

$$
f_V(\mathbf S)=a_{n,\varepsilon}\sum_{d=1}^{D}\sqrt{\sum_{i=1}^{N_S}\mathbf S(i,d)V_i(p_i)} \tag{37}
$$

且

$$
f_C(\mathbf S)=\sum_{d=1}^{D}\sum_{i=1}^{N_S}\mathbf S(i,d)\log(1+p_i\gamma_i). \tag{38}
$$

约束 (36b) 与 (36c) 意味着问题 (36) 的最优解 $\mathbf S^\ast$ 应近似满足

$$
f_C(\mathbf S^\ast)\approx\sum_{i=1}^{N_S}\log(1+p_i\gamma_i), \tag{39}
$$

它是常数，表明所有子信道都被用于传输。一般来说，使用的子信道越多，目标函数 (36a) 越小。然而可能存在少数 SNR 极低的子信道，即 $p_i\gamma_i$ 很小，把它们纳入传输过程实际上可能增大 (36a) 的取值，因为这些子信道的速率可能小于 0 [21, Fig. 3]。不过由于其 SNR 很低，它们对 $f_C$ 的贡献可忽略，故 (39) 中的近似仍然有效。

因此问题 (36) 的目标函数变为最小化 $f_V(\mathbf S)$。由 Jensen 不等式，最优解 $\mathbf S^\ast$ 应满足

$$
\left|\left\{j\in\{1,2,\dots,D\}\mid\mathbf S^\ast(:,j)\neq\mathbf 0\right\}\right|=1, \tag{40}
$$

即 $\mathbf S^\ast$ 恰有一个非零列，其余列均为零向量。(40) 的物理含义是：问题 (36) 的最优解要求所有子信道服务同一个流。因此，若直接在 $\mathbf p$ 与 $\mathbf S$ 之间交替优化，优化子信道分配矩阵 $\mathbf S$ 的子问题会产生违反原问题本意的解。故我们称该子问题为虚假（spurious）优化问题。

## 附录 B. 最大化 TCC 速率的 SCA 方法

在 TCC 方案中，为最大化 MIMO 系统速率，当可允许流数 $D$ 小于空间自由度 $N_S$ 时，使用 SNR 最高的 $D$ 个子信道传输，并共享总发送功率 $P$。令 $\mathbf p=[p_1,p_2,\dots,p_D]^T$ 表示分配给各子信道/流的功率。回顾 (4)，以功率分配最大化 TCC 速率的问题建模为

$$
\min_{\mathbf p}\ \sum_{i=1}^{D}\left(a_{n,\varepsilon}\sqrt{V_i(p_i)}-\log(1+p_i\gamma_i)\right) \tag{41a}
$$

$$
\text{s.t.}\quad\sum_{i=1}^{D}p_i\le P, \tag{41b}
$$

$$
p_i\ge0,\quad\forall i\in\{1,2,\dots,D\}, \tag{41c}
$$

其中 $P$ 是最大发送功率，$a_{n,\varepsilon}=Q^{-1}(\varepsilon)\sqrt n\log e$，$V_i$ 由 (5) 给出。

当信道使用次数 $n\to\infty$ 时，注水（WF）方法给出问题 (41) 的最优解；但 $n$ 有限时 WF 方法不再最优。与 PACA 算法内层求解问题 (P2.1) 的方法类似，可用 SCA 方法、通过在第 $\zeta$ 次迭代求解如下问题获得问题 (41) 的局部最优解：

$$
\min_{\mathbf p}\ \sum_{i=1}^{D}\left(V_i'\left(p_i^{(\zeta)}\right)p_i-\log_2(1+p_i\gamma_i)\right) \tag{42a}
$$

$$
\text{s.t.}\quad\sum_{i=1}^{D}p_i\le P, \tag{42b}
$$

$$
p_i\ge0,\quad\forall i\in\{1,2,\dots,D\}, \tag{42c}
$$

其中

$$
V_i'\left(p_i^{(\zeta)}\right)=\frac{a_{n,\varepsilon}\gamma_i}{\left(1+p_i^{(\zeta)}\gamma_i\right)^3\sqrt{1-\frac{1}{\left(1+p_i^{(\zeta)}\gamma_i\right)^2}}} \tag{43}
$$

且 $p_i^{(\zeta)}$ 是第 $(\zeta-1)$ 次迭代的解。问题 (42) 可由 CVX [28] 等现有凸优化求解器最优求解，其最优解给出下一次迭代。

## 附录 C. STCC-MSC 的渐近容量分析

当信道使用次数 $n\to\infty$ 时，有限块长速率损失消失，可达速率趋近渐近容量。[9] 已表明单流 STCC 与 TCC 具有相同渐近容量。下面我们证明 STCC-MSC 的渐近容量与可允许流数 $D$ 无关，因而与传统 TCC 一致。

当 $n\to\infty$ 时，(10) 中的速率最大化问题变为

$$
\max_{\mathbf p,\mathbf S}\ \sum_{d=1}^{D}\sum_{i=1}^{N_S}\mathbf S(i,d)\log(1+p_i\gamma_i) \tag{44a}
$$

$$
\text{s.t.}\quad\sum_{i=1}^{N_S}p_i\le P, \tag{44b}
$$

$$
p_i\ge0,\quad\forall i\in\mathcal N_S, \tag{44c}
$$

$$
\mathbf S(i,d)=\{0,1\},\quad\forall i\in\mathcal N_S,\ \forall d\in\mathcal D, \tag{44d}
$$

$$
\sum_{d=1}^{D}\mathbf S(i,d)\le1,\quad\forall i\in\mathcal N_S. \tag{44e}
$$

**引理 1：** 问题 (44) 总存在最优解 $(\mathbf p^\star,\mathbf S^\star)$ 满足

$$
\sum_{d=1}^{D}\mathbf S^\star(i,d)=1,\quad\forall i\in\mathcal N_S, \tag{45}
$$

即每个子信道都分配给一个流。

**证明：** 对问题 (44) 的最优解 $(\mathbf p^\star,\mathbf S^\star)$，假设至少存在一个子信道 $i_0$ 满足

$$
\sum_{d=1}^{D}\mathbf S^\star(i_0,d)=0. \tag{46}
$$

由于子信道 $i_0$ 未分配给任何流，无论分配多少发送功率，它对目标函数的贡献始终为零。因此，给该子信道分配正功率 $p_{i_0}^\star$ 绝不能改善目标值；而由于对数函数关于发送功率单调递增，把该功率重新分配给任何已分配子信道不会降低可达速率。因此，只要 (46) 成立，就可把 $p_{i_0}^\star$ 置零而不影响目标值。

于是，总可通过把子信道 $i_0$ 分配给任意流 $d_0\in\{1,\dots,D\}$（即置 $\tilde{\mathbf S}(i_0,d_0)=1$）、其余元素与 $\mathbf S^\star$ 相同，构造另一最优解 $(\mathbf p^\star,\tilde{\mathbf S})$。在新建分配下目标值不变，因为相应功率 $p_{i_0}^\star=0$。对所有未分配子信道重复该构造，即得满足 (45) 的最优解。证毕。

在引理 1 建立的最优性条件下，问题 (44) 目标中的双重求和化简为对子信道的单重求和。因此问题 (44) 可简化为

$$
\max_{\mathbf p}\ \sum_{i=1}^{N_S}\log(1+p_i\gamma_i) \tag{47a}
$$

$$
\text{s.t.}\quad\sum_{i=1}^{N_S}p_i\le P,\quad p_i\ge0,\quad\forall i\in\mathcal N_S, \tag{47b}
$$

它与传统 TCC 的渐近容量最大化问题相同。因此最优值与可允许流数 $D$ 无关，STCC-MSC 取得与传统 TCC 相同的渐近容量。最优功率分配由经典 WF 解给出。

> **原文脚注 2：** 论文录用后将提供复现本文结果的仿真代码：https://github.com/L-Jin-bupt

## 参考文献（英文原书目）

- [1] Z. Zhang, X. You, D. Wang, C. Zhang, P. Zhu, J. Li, Y. Cao, K. Bin, and Q. Jiang, "A 40 µs latency cell-free mmWave reliable transmission experimental system via spatiotemporal 2-D coding," Sci. China Inf. Sci., early access, May 2025.
- [2] R. Gupta, D. Reebadiya, and S. Tanwar, "6G-enabled edge intelligence for ultra-reliable low latency applications: Vision and mission," Comput. Stand. Interfaces, vol. 77, p. 102084, Feb. 2021.
- [3] Y. Liu, Y. Deng, A. Nallanathan, and J. Yuan, "Machine learning for 6G enhanced ultra-reliable and low-latency services," IEEE Wirel. Commun., vol. 30, no. 2, pp. 48–54, April 2023.
- [4] G. Durisi, T. Koch, and P. Popovski, "Toward massive, ultrareliable, and low-latency wireless communication with short packets," Proc. IEEE, vol. 104, no. 9, pp. 1711–1726, Sept. 2016.
- [5] Y. Polyanskiy, H. V. Poor, and S. Verdu, "Channel coding rate in the finite blocklength regime," IEEE Trans. Inf. Theory, vol. 56, no. 5, pp. 2307–2359, May 2010.
- [6] Y. Tian et al., "Turbo product code-aided spatiotemporal 2-D coded MIMO for URLLC," IEEE Commun. Mag., early access, June 2025.
- [7] X. You, "6G extreme connectivity via exploring spatiotemporal exchangeability," Sci. China Inf. Sci., vol. 66, no. 3, p. 130306, 2023.
- [8] X. You, B. Sheng, Y. Huang, W. Xu, C. Zhang, D. Wang, P. Zhu, and C. Ji, "Closed-form approximation for performance bound of finite blocklength massive MIMO transmission," IEEE Trans. Commun., vol. 71, no. 12, pp. 6939–6951, 2023.
- [9] F. Ye, X. You, J. Li, C. Ji, and C. Zhang, "Explicit performance bound of finite blocklength coded MIMO: Time-domain versus spatiotemporal channel coding," IEEE Trans. Commun., vol. 73, no. 12, pp. 12963–12978, Dec. 2025.
- [10] L. Jin, X. Xu, S. Han, X. Chi, P. Zhang, and C. Yuen, "Achievable rate of a space-time encoded holographic MIMO," IEEE Trans. Wireless Commun., vol. 25, pp. 133–147, June 2025.
- [11] L. Jin, X. Xu, S. Han, X. Chi, P. Zhang, and C. Yuen, "Achievable rate of multi-stream spatiotemporal channel coding with linear receivers," IEEE Wirel. Commun. Lett., vol. 15, pp. 845–849, 2026.
- [12] Y. Li, S. Zhang, X. You, and J. Li, "Spatiotemporal 2-D polar codes over non-uniform MIMO channels: A reliability-aware construction approach," IEEE Trans. Veh. Technol., early access, June 2026.
- [13] Y. Li, X. You, J. Li, C. Ji, and B. Sheng, "Performance analysis of spatiotemporal 2-D polar codes for massive MIMO with MMSE receivers," IEEE Trans. Commun., vol. 74, pp. 5284–5297, Feb. 2026.
- [14] X. Liu, H. Ran, S. Chen, H. Zhou, and C. Zhang, "Optimizing polar codes for spatiotemporal 2-D communications," in Proc. 6th Inf. Commun. Technol. Conf. (ICTC), Nanjing, China, 2025, pp. 18–22.
- [15] S. M. Alamouti, "A simple transmit diversity technique for wireless communications," IEEE J. Sel. Areas Commun., vol. 16, no. 8, pp. 1451–1458, Oct. 1998.
- [16] V. Tarokh, H. Jafarkhani, and A. R. Calderbank, "Space-time block codes from orthogonal designs," IEEE Trans. Inf. Theory, vol. 45, no. 5, pp. 1456–1467, July 1999.
- [17] Y. Polyanskiy, Channel Coding: Non-Asymptotic Fundamental Limits, Ph.D. dissertation, Princeton University, Sep. 2010.
- [18] X. You, C. Zhang, B. Sheng, Y. Huang, C. Ji, Y. Shen, W. Zhou, and J. Liu, "Spatiotemporal 2-D channel coding for very low latency reliable MIMO transmission," in Proc. 2022 IEEE GLOBECOM Workshops, pp. 473–479, 2022.
- [19] W. Yang, G. Durisi, T. Koch, and Y. Polyanskiy, "Quasi-static multiple-antenna fading channels at finite blocklength," IEEE Trans. Inf. Theory, vol. 60, no. 7, pp. 4232–4265, 2014.
- [20] J.-H. Park and D.-J. Park, "A new power allocation method for parallel AWGN channels in the finite block length regime," IEEE Communications Letters, vol. 16, no. 9, pp. 1392–1395, September 2012.
- [21] S. He, Z. An, J. Zhu, J. Zhang, Y. Huang, and Y. Zhang, "Beamforming design for multiuser uRLLC with finite blocklength transmission," IEEE Trans. Wireless Commun., vol. 20, no. 12, pp. 8096–8109, Dec. 2021.
- [22] M. Oh, J. Park, and J. Choi, "Joint optimization for secure and reliable communications in finite blocklength regime," IEEE Trans. Wireless Commun., vol. 22, no. 12, pp. 9457–9472, Dec. 2023.
- [23] B. Li, X. Yuan, Y. Hu, and A. Schmeink, "Transmission latency minimization in full-duplex relaying network operating with finite blocklength codes," IEEE J. Sel. Areas Commun., vol. 43, no. 4, pp. 1168–1182, Apr. 2025.
- [24] D. Tse and P. Viswanath, Fundamentals of Wireless Communication, Cambridge University Press, 2005.
- [25] B. Wu and B. Ghanem, "ℓp-box ADMM: A versatile framework for integer programming," IEEE Trans. Pattern Anal. Mach. Intell., vol. 41, no. 7, pp. 1695–1708, Jul. 1, 2019.
- [26] W. R. Ghanem, V. Jamali, Y. Sun, and R. Schober, "Resource allocation for multi-user downlink URLLC-OFDMA systems," in 2019 IEEE ICC Workshops, Shanghai, China, 2019, pp. 1–6.
- [27] Z. Lu and Y. Zhang, "Sparse approximation via penalty decomposition methods," SIAM J. Optim., vol. 23, no. 4, pp. 2448–2478, 2013.
- [28] M. Grant and S. Boyd, (2016). CVX: MATLAB Software for Disciplined Convex Programming. [Online]. Available: http://cvxr.com/cvx
- [29] A. Goldsmith, S. A. Jafar, N. Jindal, and S. Vishwanath, "Capacity limits of MIMO channels," IEEE J. Sel. Areas Commun., vol. 21, no. 5, pp. 684–702, June 2003.
- [30] Q. H. Spencer, A. L. Swindlehurst, and M. Haardt, "Zero-forcing methods for downlink spatial multiplexing in multiuser MIMO channels," IEEE Trans. Signal Process., vol. 52, no. 2, pp. 461–471, Feb. 2004.
- [31] A. D. Dabbagh and D. J. Love, "Precoding for multiple antenna Gaussian broadcast channels with successive zero-forcing," IEEE Trans. Signal Process., vol. 55, no. 7, pp. 3837–3850, July 2007.
- [32] Q. Shi, M. Razaviyayn, Z.-Q. Luo, and C. He, "An iteratively weighted MMSE approach to distributed sum-utility maximization for a MIMO interfering broadcast channel," IEEE Trans. Signal Process., vol. 59, no. 9, pp. 4331–4340, Sept. 2011.
- [33] M. Hong and Z.-Q. Luo, "Signal processing and optimal resource allocation for the interference channel," in Academic Press Library in Signal Processing, vol. 2, Elsevier, 2014, pp. 409–469.
- [34] 3GPP, "Study on channel model for frequencies from 0.5 to 100 GHz," 3rd Generation Partnership Project (3GPP), TR 38.901, V18.0.0, Mar. 2025.
- [35] 3GPP, "Base Station (BS) radio transmission and reception," 3rd Generation Partnership Project (3GPP), TS 38.104, V18.9.0, Mar. 2025.

## 图注与表注索引

本页图 1–9 的中文图注与表 I–III 的表注均按原文出现位置内联在正文中（图 1 见第 II-B 节，图 2–3 见第 III-A 节，图 4–9 见第 VI 节；表 I 与表 II 见第 I 节末，表 III 见第 VI 节），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.09777v1 全文（15 页）的中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–9 的中文图注、表 I–III 的逐格转写、算法 1–2 伪代码、附录 A–C（含 (36)–(47) 的推导与引理 1 证明），以及参考文献 35 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(47) 逐式核对（重点 (4)–(9)、(10a)–(24)、(25)–(35)、(36)–(47)）；表 I 用第 2 页渲染图逐格核对（五行的勾/叉标记全部一致），表 II 用第 2 页渲染图核对记号与含义对应，表 III 按第 10 页表格核对仿真参数（3.5 GHz、60 MHz、−174 dBm/Hz、$n=30$、$\varepsilon=10^{-6}$、$\rho=1$、$\eta=2$）。已加注一处原文疑点：摘要与贡献 4) 称 28.68% 提升相对"TCC 方案"，而 §VI 图 5 处称相对"LS-TCC 方案"，两处基准不一致。本页不上传原文图片，图 1–9 曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
