---
layout: page
title: "扩散语言模型之间的并行性、关键窗口与分离｜中文全文译文"
permalink: /papers/translations/2026-09-28-parallelism-critical-windows-and-separations-among-diffusion-language/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/5c26f8d42567cb74/) · [原文 arXiv](https://arxiv.org/abs/2609.20539) · [全部目录](/papers/catalog/)

# 扩散语言模型之间的并行性、关键窗口与分离

**原题：** Parallelism, critical windows, and separations among diffusion language models  
**作者：** Sitan Chen（陈思坦）$^{*}$、Liye Wang$^{\dagger}$  
**单位：** $^{*}$ 哈佛大学工程与应用科学学院（SEAS, Harvard University；邮箱：sitan@seas.harvard.edu）。本工作受 Harvard Dean's Competitive Fund for Promising Scholarship 资助，部分于西蒙斯计算理论研究所（Simons Institute for the Theory of Computing）访问期间完成。$^{\dagger}$ 清华大学（Tsinghua University；邮箱：ly-wang23@mails.tsinghua.edu.cn）。  
**版本：** arXiv:2609.20539v2（cs.LG），2026 年 9 月 18 日；文稿日期 2026 年 9 月 13 日；90 页（9 节 + 附录 A/B，4 张图，无表格）。  
**范围与状态：** 本页为**全结构性中文译稿**：摘要、第 1 节（含定理 1.1—1.4 的非正式陈述、评测框架、两条主要结果、关键窗口机制、并发工作与相关工作、全文组织）、第 2 节（定义 2.2/2.5/2.7/2.9、引理 2.1/2.3/2.4/2.6/2.8/2.10 等全部陈述）、第 3/4 节（定理 3.1/4.1 与证明架构）、第 5 节（定义 5.1、随机经验测度构造与关键时间定义）、第 6/7 节（定理 6.1/7.1 与关键窗口命题 6.4/7.4）、第 8 节（下界定理 8.1 与命题 8.6）、第 9 节展望（含致谢与 AI 使用声明全文）、附录 A（下界定理 A.1 与构造）、图 1—4 图注、参考文献 [ABBM26]—[ZCG25] 全表。**已知口径差异：** 原文第 3—8 节中各引理/命题的逐式证明与附录 B 的 deferred proofs 未逐式翻译，以结构化摘要呈现（详见页尾状态段）。编号公式 (1)—(2) 等按原文保留。

## 摘要

扩散大语言模型（diffusion large language models, dLLM）广受推崇的一个卖点是其**并行性**：能够比需要为每个 token 做一次前向传播的自回归模型高效得多地生成长文本序列。然而，在从掩码扩散（masked）到均匀扩散（uniform）再到高斯扩散（Gaussian）的众多竞争范式中，对这些方案在并行性上如何比较的原理性理解仍然有限。本文首次对这三种主流方法的并行能力进行**细粒度比较**，并证明如下结果。

- 均匀扩散与高斯扩散可以在与前向传播次数相关的复杂度上采样，该次数与底层分布的**对偶总相关（dual total correlation）**成正比；对偶总相关是一种内在复杂度度量，可以远小于上下文长度。此前只知道掩码扩散能够达到这一复杂度 [CCL26, LZ25]。
- 对某一类**随机经验测度**，我们证明用均匀扩散或高斯扩散采样，$\widetilde\Theta(\sqrt d)$ 次前向传播是充分且必要的；而存在近似 score 预言机，使掩码扩散需要 $\widetilde\Omega(d)$ 次前向传播。这建立了三种主流 dLLM 范式之间**首个可证明的并行性分离**。
- 与"掩码扩散因为在生成过程中必须对 token 值作出承诺而更难并行化"这一流行直觉相反，上述分离的实际来源是：掩码扩散采样中的**关键窗口（critical window）**渐近地比均匀扩散与高斯扩散采样中的关键窗口更窄。

**索引词：** 扩散语言模型、少步生成、对偶总相关、关键窗口、查询复杂度、逆数据处理不等式。

## 1 引言

扩散大语言模型（dLLM）近来已成为自回归大语言模型（LLM）在离散域生成建模上的有力替代 [AJH+21, LME23, SAS+24, NZY+25]。尽管名字里有"扩散"，扩散语言建模并不是单一框架，而是一组相互竞争的框架（图 1），它们都围绕同一个去噪原则构建：给定一个把数据转化为噪声的加噪过程，学习如何逆转它，从而把全新噪声转化为新样本。LLM 本身也是该范式的一个特例——其加噪过程是从右到左的擦除；而 dLLM 理论与实践的一个核心问题就是：是否存在更好的加噪过程选择。

超越从右到左擦除最被广泛宣传的卖点之一，是它释放了**少步生成**的能力：LLM 必须一次解码一个 token，而基于其他加噪过程的 dLLM 原则上可以在 $o(d)$ 次前向传播内生成长度为 $d$ 的序列。然而，其代价仍未被充分理解。众所周知，此类解码策略存在**某种统计代价**：它们本质上会产生**离散化误差**，来自仅用边缘分布近似某些后验分布。这一代价能在多大程度上被压到可忽略，很大程度上取决于推断阶段采样算法如何调参。

多项实证工作提示，该代价也严重依赖加噪过程本身的选择，并主张某些范式的少步生成比另一些更容易实现 [SDG+25, LYA+26, HQL+26]。例如，人们常说涉及独立擦除的加噪过程（即流行范式**掩码扩散模型**）不太利于少步生成。其非形式论证是：默认情况下掩码扩散模型必须在生成的离散步骤中**对 token 值作出承诺**，因此并行提交多个 token 所产生的错误无法在之后更正 [SSP+25, SDG+25, SLY+26]。其他流行的加噪过程选择，例如涉及 token 值随机重新指派（**均匀扩散模型** [LME23, SDG+25, Dif26]）或潜空间中的 Brownian 运动（**高斯扩散模型** [LTG+22, DSR+22, RDE+26, LYA+26, HQL+26, Die26]），据称不会受此困扰，因为它们可以在采样过程中逐步修正输出（图 1 给出这些不同 dLLM 范式的示意）。

然而这些直觉大体上仍属启发式，任何范式下少步生成的理论基础都尚在萌芽。近期一批理论工作 [LC26, CCL26, DHW26a, Wai26a, LZ25, ZC26] 表明，如果采用恰当的推断调度，掩码扩散模型可以实现少步生成，其步数随与数据分布相关的**内在复杂度度量**扩展。相比之下，均匀扩散与高斯扩散等其他框架此前**没有**此类结果。因此本文提问：

> 加噪过程的选择如何影响 dLLM 的少步生成能力？

**评测框架：score 预言机查询。** 比较不同 dLLM 框架时，一个基本优度指标是模型为生成准确样本所需的前向传播次数。更形式化地，模型的一次前向传播提供如下信息：给定干净样本 $X_0$，加噪过程将其劣化为含噪样本 $X_t$；单次前向传播同时对所有坐标 $i$、任意噪声水平 $t$ 与任意选择的条件 $z$，给出逐坐标后验边缘分布 $\mathrm{law}((X_0)_i\mid X_t=z)$ 的近似。由于这些边缘分布与数据分布的所谓**退火 score 函数（annealed score functions）**在仿射变换意义下等价，本文把模型的单次前向传播称为对**（近似）score 预言机**的一次查询。我们在第 2.1—2.3 节更形式化地定义这些预言机。证明少步生成的**正面结果**时，我们分析利用这些预言机的具体算法；证明**不可能结果**时，我们排除所有利用这些预言机的算法。

（图 1 见"图注"一节。）

### 1.1 结果 1：随内在复杂度扩展

首先我们证明均匀扩散与高斯扩散都能匹配先前工作为掩码扩散建立的扩展关系。更具体地，我们证明：给定乘积空间 $\Sigma^d$ 上序列 $X=(X_1,\ldots,X_d)$ 的分类分布 $q$，其对偶总相关 $\mathrm{DTC}(q)$ 大致上是分布中无法被局部熵 $H(X_i\mid X_{-i})$ 解释的总熵。先前工作表明，掩码扩散模型可以在对 $\mathrm{DTC}(q)$ 线性（至多对数因子）的 score 预言机查询次数内从 $q$ 采样，而 $\mathrm{DTC}(q)$ 一般可以远小于维数 $d$。我们从证明均匀扩散也能实现这一结果开始。

**定理 1.1（非正式，见定理 3.1）.** 设 $q$ 为 $\Sigma^d$ 上任意分布。存在一个算法，它对 $q$ 的**均匀扩散** score 的准确估计做 $\widetilde O(\mathrm{DTC}(q)/\varepsilon)$ 次查询（$\widetilde O(\cdot)$ 隐藏 $|\Sigma|$、$d$ 与 $\varepsilon$ 的对数因子），并输出分布 $\hat q$ 的样本，使 $\mathrm{KL}(q\|\hat q)\leqslant\varepsilon$。

通过类似机制（尽管论证更复杂），我们还证明：

**定理 1.2（非正式，见定理 4.1）.** 存在与定理 1.1 保证相同的采样器，它使用 $\widetilde O(\mathrm{DTC}(q)/\varepsilon)$ 次对 $q$ 的**高斯扩散** score 准确估计的查询。

这些结果的证明策略与 [CCL26] 中针对掩码扩散的策略有显著不同。那项工作的关键在于对掩码扩散采样的标准算法所产生的误差给出**精确**刻画；有了该刻画，只需把合适的步长调度代入表达式，即可得到 $\widetilde O(\mathrm{DTC}(q)/\varepsilon)$ 的速率。相反，对定理 1.1/1.2，我们不依赖精确刻画，而是证明：采样器单步中因忽略条件相关性而产生的误差，可以用**从某噪声水平过渡到更低噪声水平时对偶总相关的增量**来控制。这由某个**逆数据处理不等式（reverse DPI）**证明：它表明，若两个分布只被轻微加噪，它们的距离不会收缩得太快。有了该估计，我们就可以把 DTC 的增量一起 telescope（望远镜求和），从而得到与 $\mathrm{DTC}(q)$ 线性相关的查询复杂度。该论证示于图 2。

$$
\mathrm{KL}(q\|\hat q)\overset{\text{链式法则}}{\leqslant}\sum_j \mathrm{TC}(X_{t_j}\mid X_{t_{j+1}})\overset{\text{逆 DPI}}{\lesssim}a\sum_j\left[\mathrm{DTC}(q_{t_j})-\mathrm{DTC}(q_{t_{j+1}})\right]\overset{\text{telescoping}}{\leqslant}a\cdot\mathrm{DTC}(q)\overset{a\asymp\varepsilon/\mathrm{DTC}(q)}{=}\varepsilon
$$

（图 2 见"图注"一节。）

### 1.2 结果 2：把掩码扩散与其他范式分离

定理 1.1/1.2 表明，均匀扩散与高斯扩散至少能像掩码扩散一样适应数据内在复杂度的某种度量。但它们仍留下一个问题：这些范式之间是否**存在**真正的分离。在下一组结果中，我们通过构造一族简单的**随机经验测度**来展示这种分离：对其而言，用掩码扩散 score 预言机采样的查询复杂度严格高于均匀或高斯扩散预言机。更精确地，该族分布由从布尔超立方体上均匀随机抽取 $\mathrm{e}^{\kappa d}$ 个点给出，其中 $0<\kappa<\log2$ 为（未知的）绝对常数（形式定义见第 5 节）。近期 [XP26] 表明，对这类分布的近似高斯扩散 score 预言机，至少要 $\widetilde\Omega(\sqrt d)$ 次查询才能把 $\kappa$ 确定到足够精度，更不用说生成接近该分布的样本。在附录 A 中，我们用类似思路证明该下界同样适用于均匀扩散。

本文第二部分的主结果是证明：对这些随机经验测度，$\widetilde O(\sqrt d)$ 的查询复杂度对均匀扩散与高斯扩散**确实是紧的**。

**定理 1.3（非正式，见定理 6.1 与 7.1）.** 对支撑于布尔超立方体上 $2^{\Theta(d)}$ 个随机点的经验测度 $q$，存在一个算法：它在任意 score 误差为 $1/\mathrm{poly}(d)$ 的近似**均匀**扩散 score 预言机上使用 $\widetilde O(\sqrt d/\varepsilon^2)$ 次查询，并以对 $q$ 支撑随机性的高概率从 $q$ 采样，总变差误差为 $\varepsilon$。给定任意 score 误差为 $1/\mathrm{poly}(d)$ 的近似**高斯**扩散 score 预言机，同样的结果也成立。

值得注意的是，对该族分布，对偶总相关为 $\Theta(d)$，因此定理 1.3 达到的扩展**可证明地超越**了定理 1.1/1.2 所蕴含的对偶总相关扩展。相反，我们证明对同一问题实例，掩码扩散需要 $\widetilde\Omega(d)$ 次查询。

**定理 1.4（非正式，见定理 8.1）.** 设 $q$ 为支撑于布尔超立方体上 $2^{\Theta(d)}$ 个随机点的经验测度。存在一个近似**掩码**扩散预言机，使得任何对该预言机做 $o(d)$ 次查询的采样算法，其输出分布 $\hat q$ 以对 $q$ 随机性的高概率满足 $\mathrm{TV}(q,\hat q)\geqslant0.99$。

综上，这些结果建立了扩散语言建模三种主流范式之间**首个可证明的少步生成能力分离**。

我们强调，该分离所体现的机制与此前提到的"承诺（commitment）"问题**根本不同**。它来自掩码扩散与均匀/高斯扩散采样动力学中某个**相变锐度**的差异。为此我们指出，在均匀/高斯扩散的 $\widetilde\Omega(\sqrt d)$ 下界与掩码扩散的 $\widetilde\Omega(d)$ 下界中，关键思想都是：对随机经验测度，除非在正确的噪声水平附近查询 score 预言机，score 预言机的近似误差可以被设计为压制关于底层分布 $q$ 的任何有用信号。然而关键之处在于，**可接受噪声水平的范围**在掩码扩散中比在均匀/高斯扩散中窄得多：掩码扩散的信息区间只占整个噪声谱的 $O(\log(d)/d)$ 比例（命题 8.6），而均匀/高斯扩散的信息区间占宽得多的 $O(\sqrt{\log(d)/d})$ 比例（命题 6.4 与 7.4）。结果是，前者需要 $\widetilde\Omega(d)$ 次查询，而后者只需 $\widetilde O(\sqrt d)$ 次。图 4 用数值方式展示了这一差异。

这些**关键窗口**此前已在扩散采样中的**物种形成（speciation）相变**背景下被研究 [BBDBM24, LC24, LKC25, SFW25, RA23]，但据我们所知，这是首次用关键窗口来推导扩散采样查询复杂度的**新上界**。粗略地说，在用 $\widetilde O(\sqrt d)$ 次对均匀或高斯扩散 score 预言机的查询确定窗口位置之后，我们论证：在关键窗口以上的噪声水平，score 可被均匀分布的 score 良好近似；在关键窗口以下，关于干净样本的后验分布已如此集中，以至于可以轻易"舍入"到支撑中的正确点。因此只需设计一个能高效定位并"穿越"窗口的算法，细节见第 6.2 与 7.2 节。该论证的思路示于图 3。

**并发工作。** 近期，Dmitriev、Huang 与 Wei [DHW26b] 以及 Wainwright [Wai26b] 也独立建立了均匀扩散的 DTC 自适应界。他们的证明策略与本文定理 1.1 的证明有相似之处，特别是都用对偶总相关在相邻噪声水平之差的望远镜求和来界定采样误差。有趣的是，他们的工作用某一坐标与其余坐标之间互信息在其他时刻的变化，给出了**任意乘积型前向过程**离散化误差的刻画。与本文不同，Wainwright [Wai26b] 进一步利用该刻画给出适应**总相关（TC）**的速率，而 [DHW26b] 证明了**再掩码扩散（remasking diffusion）** [WSSK26] 的 DTC 自适应界。与这两项工作相比，本文证明了**高斯扩散**的 DTC 自适应界，并进一步研究各框架之间在 score 预言机查询复杂度意义上的分离。

### 1.3 相关工作

**离散扩散采样的理论。** Campbell 等 [CBDB+22] 用连续时间 Markov 链刻画了连续时间离散去噪。Chen 与 Ying [CY24] 用一致化（uniformization）实现与估计 score 相关联的反向链，并在超立方体上得到总变差与 KL 保证，特别是用 $O(d)$ 次均匀扩散 score 预言机查询实现了零离散化误差。Li 与 Cai [LC26] 开创了把掩码扩散的查询复杂度作为数据分布信息论性质之函数来研究的理论方向。Chen、Cong 与 Li [CCL26] 以及 Lavenant 与 Zanella [LZ25] 用数据分布的**信息曲线**给出了采样误差的精确刻画，并可用其得到与总相关、对偶总相关成正比的查询复杂度界。与本文掩码扩散下界密切相关的是，[CCL26] 还基于 MDS 码给出了另一个 $\Omega(d)$ 下界构造。Dmitriev 等 [DHW26a] 与 Zhao、Cai [ZC26] 证明了标准均匀与掩码 $\tau$-leaping 方案的尖锐收敛保证，并表明后者能适应分布的总相关与对偶总相关。

此外，Ren 等 [RCRY25] 为时间离散反向过程的 KL 分析发展了随机积分框架；在此基础上，Ren 等 [RCZ+25] 提出并分析了离散扩散的高阶求解器。更广泛地，还有大量正交工作分析基于 CTMC 的离散扩散采样器的收敛性，特别关注对字母表大小的依赖 [ZCG25, PSO+25, LHL+25, LLLS25, PCRD26, KLZ+26]。

此外还有大量关于**高斯扩散模型**的理论文献——参见 [Lu26] 的最新综述。与本文最相关的是 Xun 与 Price [XP26] 的下界，表明高斯扩散需要 $\widetilde\Omega(\sqrt d)$ 次查询。本文后半部分正基于该工作中研究的一个构造。此外，还有若干关于**算法化随机局部化（algorithmic stochastic localization）**的工作，用于从布尔超立方体上的分布采样 [EAMS22, MW23, EAMS23]：本质上把定义域视为欧氏空间的子集，执行高斯扩散并在最后舍入。

**关键窗口与物种形成。** 大量工作 [GVS+23, RA23, SFLW24, SFW25, BBDBM24, LC24, LKC25, ABBM26] 研究了真实扩散模型中一个有趣的性质：最终生成的关键方面会在反向过程的**很窄时间范围内**出现。这些工作把该行为刻画为相变，称为**关键窗口**或**物种形成相变**，并给出该现象出现的各种数据概率模型。该现象与 [XP26] 所研究的随机经验测度中出现的是同一现象，也是本文第二部分研究的对象；它与统计与信息论文献中的高维推断**全有或全无现象（all-or-nothing phenomenon）** [NWZ20] 以及信道分辨率与软覆盖 [HV93] 等概念密切相关。

**全文组织。** 均匀扩散与高斯扩散的 DTC 自适应界分别在第 3、4 节证明。随机经验测度在第 5 节引入。该族分布的均匀与高斯上界在第 6、7 节证明，掩码下界在第 8 节证明。均匀扩散的查询下界见附录 A；延后的证明见附录 B。

## 2 预备

### 2.1 均匀扩散

给定字母表大小 $S\geq2$，定义 $\Sigma=[S]$、$X=\Sigma^d$；设 $q$ 为 $X$ 上分布，$\Delta(\Sigma)$ 表示 $\Sigma$ 上的概率单纯形。

对所有 $t\geq0$ 定义 $\alpha_t=e^{-t}$、$\beta_t=\frac{1-\alpha_t}{S}$，并针对 $z\in\Sigma$ 定义单坐标转移核

$$
K_t^{U}(\cdot\mid z)=\alpha_t\mathbf 1[z=\cdot]+\beta_t.
$$

这些核 $(K_t^U)$ 构成半群。给定 $X_0\sim q$，令 $(X_t)_{t\geq0}$ 表示转移核为 $(K_t^U)^{\otimes d}$ 的 Markov 过程，并记 $q_t:=\mathrm{law}(X_t)$。

给定 $y\in X$、$i\in[d]$、$a\in\Sigma$，令 $y^{i\leftarrow a}$ 表示把 $y$ 的第 $i$ 个坐标替换为 $a$ 所得的点。时间 $t$ 的**（均匀扩散）score** 是函数 $s_t:X\to\mathbb R_{\geq0}^{[d]\times\Sigma}$，由似然比给出：

$$
s_t(y)[i,a]=\frac{q_t\left(y^{i\leftarrow a}\right)}{q_t(y)}.
$$

该 score 天然具有后验边缘与 Gibbs 采样边缘两种解释：

**引理 2.1.** 给定向量 $v\in\mathbb R_{>0}^S$、$h>0$ 与 $b\in\Sigma$，在 $\Sigma$ 上定义概率分布

$$
p_{h,b}^{\mathrm{post}}[v](a):=\alpha_h\mathbf 1[a=b]+\frac{\beta_h}{\alpha_h}\left(v_a-\beta_h\sum_{a'\in\Sigma}v_{a'}\right),\qquad p_h^{\mathrm{gibbs}}[v](a):=\frac{1}{\alpha_h}\left(\frac{v_a}{\sum_{a'\in\Sigma}v_{a'}}-\beta_h\right).
$$

令 $h=t-s$，则对给定 $y\in X$ 有

$$
\mathbb P\left[X_s^i=a\mid X_t=y\right]=p_{h,y_i}^{\mathrm{post}}\left[s_t(y)[i,\cdot]\right](a),\qquad \mathbb P\left[X_s^i=a\mid (X_t)_{-i}=y_{-i}\right]=p_h^{\mathrm{gibbs}}\left[s_t(y)[i,\cdot]\right](a),
$$

其中下标 $-i$ 表示删除第 $i$ 个坐标所得的向量。证明延至附录 B。

我们考虑估计 score $(\hat s_t)$ 并如下量化其误差。首先不失一般性假设估计 score 已**归一化**，即对所有 $t,y\in X$、$i\in[d]$ 有 $\hat s_t(y)[i,y_i]=1$。给定 $c,s>0$，定义（熵）Bregman 散度 $\psi(c,s):=s-c+c\log(c/s)$。

**定义 2.2（score 误差——均匀扩散）.** 给定 $t>0$ 处的归一化 score 估计 $\hat s_t$，其 score 误差为

$$
\varepsilon_{\mathrm{unif}}(t):=\mathbb E_{Y\sim q_t}\sum_{i=1}^d\sum_{a\in\Sigma}\psi\left(s_t(Y)[i,a],\hat s_t(Y)[i,a]\right).
$$

本文假设对所有 $t>0$ 有 $\varepsilon_{\mathrm{unif}}(t)<\infty$，从而 $\hat s_t(y)[i,a]>0$ 对所有 $i,a,t,y$ 成立。这等价于训练均匀扩散模型所用的标准 score 熵损失 [LME23]。第 3.2 节讨论引理 2.1 的稳健版本，用于把近似 score 转化为后验边缘的有效估计。

为下界论证方便，用预言机语言显式写出 score 估计与目标分布：**近似均匀扩散预言机** $\mathcal O$ 在查询 $(t,y)$ 处返回 score 估计 $\hat s_t^{\mathcal O}(y)$，相应 score 误差记为

$$
\varepsilon_{\mathrm{unif}}(\mathcal O;q,t):=\mathbb E_{Y\sim q_t}\sum_{i=1}^d\sum_{a\in\Sigma}\psi\left(s_t(Y)[i,a],\hat s_t^{\mathcal O}(Y)[i,a]\right).
$$

当 $q$、$\mathcal O$ 由上下文明确时，简记 $\varepsilon_{\mathrm{unif}}(\mathcal O;q,t)$ 为 $\varepsilon_{\mathrm{unif}}(t)$，并写 $\hat s_t$ 代指 $\hat s_t^{\mathcal O}$。

最后，对二元字母表 $\Sigma=\{-1,+1\}$ 情形，前向似然比有一个便于第 6 节使用的重叠形式。

**引理 2.3（二元似然比）.** 对每个 $x,z\in\{-1,+1\}^d$，

$$
2^d\left(K_t^U\right)^{\otimes d}(x\mid z)=\exp\left(\sum_{i=1}^d\log\left(1+e^{-t}x_iz_i\right)\right)=(1+e^{-t})^d\tanh(t/2)^{d_H(x,z)},
$$

其中 $d_H(x,z)$ 表示 $x$ 与 $z$ 的 Hamming 距离。**证明：** 逐坐标有 $2K_t^U(x_i\mid z_i)=1+e^{-t}x_iz_i$，相乘即得第一等式；匹配坐标贡献 $1+e^{-t}$，不匹配坐标贡献 $1-e^{-t}=(1+e^{-t})\tanh(t/2)$，即得第二等式。

### 2.2 高斯扩散

我们先对 $\mathbb R^d$ 上一般分布描述高斯扩散，再特殊化到离散分布的嵌入。设 $q$ 为 $\mathbb R^d$ 上分布，定义 Ornstein–Uhlenbeck 过程

$$
dX_t=-X_t\,dt+\sqrt2\,dB_t,\qquad X_0\sim q,
$$

其中 $(B_t)_{t\geq0}$ 为标准 Brownian 运动，记 $q_t:=\mathrm{law}(X_t)$。定义 $\sigma_t=\sqrt{1-e^{-2t}}$，则该过程的转移核为

$$
K_t^G(x\mid z)=\frac{1}{(2\pi\sigma_t^2)^{d/2}}\exp\left(-\frac{\|x-e^{-t}z\|^2}{2\sigma_t^2}\right),
$$

这些核 $(K_t^G)$ 构成半群。时间 $t$ 的**（高斯扩散）score** 为 $s_t:\mathbb R^d\to\mathbb R^d$，$s_t(x)=\nabla\log q_t(x)$，天然具有后验期望解释：

**引理 2.4（Tweedie 公式）.** 对任意 $x\in\mathbb R^d$ 与 $t>0$，

$$
\mathbb E\left[X_0\mid X_t=x\right]=e^tx+e^t\sigma_t^2s_t(x).
$$

我们考虑估计 score $(\hat s_t)$ 并如下量化其误差。

**定义 2.5（score 误差——高斯扩散）.** 给定 $t$ 处的 score 估计 $\hat s_t$，其 $L_2$ score 误差定义为

$$
\varepsilon_{\mathrm{gauss}}(t):=\sigma_t^2\left(\mathbb E_{X_t\sim q_t}\left\|s_t(X_t)-\hat s_t(X_t)\right\|_2^2\right)^{1/2}.
$$

由引理 2.4，$\sigma_t^2(s_t(x)-\hat s_t(x))=e^{-t}(\mathbb E[X_0\mid X_t=x]-\hat m_t(x))$，其中 $\hat m_t(x):=e^tx+e^t\sigma_t^2\hat s_t(x)$ 为与 $\hat s_t$ 关联的去噪器；于是 $\varepsilon_{\mathrm{gauss}}(t)^2=e^{-2t}\mathbb E_{X_t\sim q_t}\|\hat m_t(X_t)-\mathbb E[X_0\mid X_t]\|_2^2$，即（至多相差因子 $e^{-2t}$）$\hat m_t$ 在训练高斯扩散模型所用去噪目标 $\mathbb E\|\hat m_t(X_t)-X_0\|_2^2$ 上的超额风险 [SDWMG15, Vin11, SE19, HJA20, SSDK+21]，该目标的最小化子正是后验均值。

本文在高斯扩散框架下研究**离散分布**的采样。对一般有限字母表 $\Sigma$，设 $q^{\mathrm{pre}}$ 为 $X=\Sigma^d$ 上任意分布，考虑如下标准嵌入：给定来自 $[S]^d$ 上 $q^{\mathrm{pre}}$ 的样本 $A=(A_1,\ldots,A_d)$，做**one-hot 编码**得到 $X_0=(X_0^{(1)},\ldots,X_0^{(d)})\in\mathbb R^{Sd}$，其中 $X_0^{(i)}=e_{A_i}$、$e_a\in\mathbb R^S$ 为第 $a$ 个标准基向量。再令 $q$ 表示数据分布在该 one-hot 映射下的前推分布。我们还考虑二元字母表 $\Sigma=\{-1,1\}$ 的特例，此时直接把 $q^{\mathrm{pre}}$ 视为 $\mathbb R^d$ 上的分布（把 $X=\{-1,1\}^d$ 看作 $\mathbb R^d$ 的子集）。

### 2.3 掩码扩散

给定字母表大小 $S\geq2$，与前述小节不同，这里区分 $[S]$ 与 $\Sigma$：定义 $\Sigma=[S]\cup\{\star\}$，其中 $\star\notin[S]$ 为特殊掩码符号；令 $X=[S]^d$、$\mathcal X=\Sigma^d$，$q$ 为 $X$ 上分布。与均匀扩散情形相同，令 $\alpha_t=e^{-t}$。对 $z\in[S]$ 定义单坐标转移核

$$
K_t^M(\cdot\mid z)=\alpha_t\mathbf 1[z=\cdot]+(1-\alpha_t)\mathbf 1[\star=\cdot],
$$

这些核构成半群。给定 $X_0\sim q$，令 $(X_t)_{t\geq0}$ 表示转移核为 $(K_t^M)^{\otimes d}$ 的 Markov 过程，记 $q_t:=\mathrm{law}(X_t)$。

对 $y\in\mathcal X$，定义**已揭示坐标集** $\mathcal I(y):=\{i\in[d]:y_i\neq\star\}$，并把 $y$ 与其部分赋值 $(\mathcal I(y),y_{\mathcal I(y)})$ 等同；反之给定 $\mathcal I\subseteq[d]$ 与 $x\in X$，记 $x^{(\mathcal I)}\in\mathcal X$ 为把 $x$ 在 $\mathcal I$ 之外的坐标掩码后所得的串，于是 $X_t=X_0^{(\mathcal I(X_t))}$，观测 $X_t$ 等价于观测 $(\mathcal I(X_t),X_{0,\mathcal I(X_t)})$。若 $\mathbb P[X_{0,\mathcal I}=x_{\mathcal I}]>0$，称部分赋值 $(\mathcal I,x_{\mathcal I})$ 为**一致的（consistent）**。给定一致部分赋值与未揭示坐标 $i\notin\mathcal I$，定义后验边缘 $q_{i\mid\mathcal I}(a\mid x_{\mathcal I}):=\mathbb P[X_{0,i}=a\mid X_{0,\mathcal I}=x_{\mathcal I}]$（$a\in[S]$）。

给定 $y\in\mathcal X$、$i\notin\mathcal I(y)$、$a\in[S]$，令 $y^{i\leftarrow a}$ 表示把 $y$ 第 $i$ 个坐标替换为 $a$ 所得的点。时间 $t$ 的**（掩码扩散）score** 为函数 $s_t:\mathcal X\to\mathbb R_{\geq0}^{[d]\times[S]}$，

$$
s_t(y)[i,a]:=\frac{q_t\left(y^{i\leftarrow a}\right)}{q_t(y)},\qquad i\notin\mathcal I(y),\ a\in[S],
$$

而对 $i\in\mathcal I(y)$ 未定义。掩码扩散 score 可直接用后验边缘解释。

**引理 2.6.** 设 $y\in\mathcal X$ 一致、$\mathcal I=\mathcal I(y)\subsetneq[d]$，则对任意 $i\notin\mathcal I$ 与 $a\in[S]$，

$$
s_t(y)[i,a]=\frac{\alpha_t}{1-\alpha_t}q_{i\mid\mathcal I}\left(a\mid y_{\mathcal I}\right).
$$

**证明：** 注意 $q_{i\mid\mathcal I}(a\mid y_{\mathcal I})=\frac{\mathbb P[X_{0,i}=a,X_{0,\mathcal I}=y_{\mathcal I}]}{\mathbb P[X_{0,\mathcal I}=y_{\mathcal I}]}$，而 $q_t(y^{i\leftarrow a})=\alpha_t^{|\mathcal I|+1}(1-\alpha_t)^{d-|\mathcal I|-1}\mathbb P[X_{0,i}=a,X_{0,\mathcal I}=y_{\mathcal I}]$、$q_t(y)=\alpha_t^{|\mathcal I|}(1-\alpha_t)^{d-|\mathcal I|}\mathbb P[X_{0,\mathcal I}=y_{\mathcal I}]$，相除即得。

由引理 2.6，掩码扩散 score 与后验边缘在确定的随时间变化因子意义下等价。

我们考虑估计 score $(\hat s_t)$ 并如下量化其误差。首先假设估计 score **一致**，即对所有 $t,y\in\mathcal X$、$i\notin\mathcal I(y)$ 有 $\sum_{a\in[S]}\frac{1-\alpha_t}{\alpha_t}\hat s_t(y)[i,a]=1$；并定义**估计后验边缘** $\hat q_{i\mid\mathcal I}(a\mid y_{\mathcal I}):=\frac{1-\alpha_t}{\alpha_t}\hat s_t(y)[i,a]$，假设其不依赖 $t$（真实后验边缘即如此）。由引理 2.6，在 $(t,y)$ 处查询这样的 score 估计，等价于查询**近似掩码扩散预言机** $\mathcal O$：查询部分赋值 $(\mathcal I,x_{\mathcal I})=(\mathcal I(y),y_{\mathcal I(y)})$，并接收所有 $i\notin\mathcal I$ 上 $[S]$ 上的分布 $\hat q_{i\mid\mathcal I}^{\mathcal O}(\cdot\mid x_{\mathcal I})$；两种描述可互换使用。对不一致的部分赋值，后验边缘无定义，预言机可返回任意分布。

**定义 2.7（score 误差——掩码扩散）.** 给定 $t$ 处的一致 score 估计 $\hat s_t$，其 score 误差定义为

$$
\varepsilon_{\mathrm{mask}}(t):=\frac{1-\alpha_t}{\alpha_t}\mathbb E_{Y\sim q_t}\left[\frac{1}{d-|\mathcal I(Y)|}\sum_{i\in[d]\setminus\mathcal I(Y)}\sum_{a\in[S]}\psi\left(s_t(Y)[i,a],\hat s_t(Y)[i,a]\right)\right],
$$

约定当 $\mathcal I(Y)=[d]$ 时括号内为 0。对关联预言机 $\mathcal O$ 与 $0\leqslant m<d$，$\mathcal O$ 在**水平 $m$** 处的 score 误差定义为对 $|\mathcal I(Y)|=m$ 取条件的同一量（它不依赖 $t$，见下文）：

$$
\varepsilon_{\mathrm{mask}}(\mathcal O;q,m):=\frac{1-\alpha_t}{\alpha_t}\mathbb E_{\mathcal I\sim\mathrm{Unif}(\binom{[d]}m),\,X_0\sim q}\left[\frac{1}{d-m}\sum_{i\notin\mathcal I}\sum_{a\in[S]}\psi\left(s_t\left(X_0^{(\mathcal I)}\right)[i,a],\hat s_t\left(X_0^{(\mathcal I)}\right)[i,a]\right)\right].
$$

由于 $\mathcal I(X_t)$ 是大小 $|\mathcal I(X_t)|\sim\mathrm{Bin}(d,\alpha_t)$、与 $X_0$ 独立的均匀随机子集，有 $\varepsilon_{\mathrm{mask}}(t)=\mathbb E_{m\sim\mathrm{Bin}(d,\alpha_t)}[\varepsilon_{\mathrm{mask}}(\mathcal O;q,m)\mathbf 1[m<d]]$，且 $\varepsilon_{\mathrm{mask}}(\mathcal O;q,m)$ 不依赖 $t$（见引理 2.8）。水平 $m$ 是掩码扩散的自然噪声水平概念：与均匀/高斯扩散不同，它可从 $X_t$ 直接观测，也是采样器在实际中所控制的对象。

下述引理用估计后验边缘重新表述掩码扩散 score 误差。

**引理 2.8.** 设 $(\hat s_t)$ 一致、关联预言机为 $\mathcal O$，则对每个 $0\leqslant m<d$，

$$
\varepsilon_{\mathrm{mask}}(\mathcal O;q,m)=\mathbb E_{\mathcal I\sim\mathrm{Unif}\left(\binom{[d]}m\right),X_0\sim q}\left[\frac{1}{d-m}\sum_{i\notin\mathcal I}\mathrm{KL}\left(q_{i\mid\mathcal I}\left(\cdot\mid X_{0,\mathcal I}\right)\Big\|\hat q_{i\mid\mathcal I}^{\mathcal O}\left(\cdot\mid X_{0,\mathcal I}\right)\right)\right].\tag{1}
$$

特别地，$\varepsilon_{\mathrm{mask}}(\mathcal O;q,m)$ 只通过 $\mathcal O$ 在 $m$ 个已揭示坐标的一致部分赋值上返回的边缘依赖 $\mathcal O$。证明延至附录 B。式（1）右端在相差与 $\mathcal O$ 无关、且与水平 $m$ 加权方式无关的可加项意义下，正是掩码位置上的交叉熵损失 $\sum_{i\notin\mathcal I}-\log\hat q_{i\mid\mathcal I}(X_{0,i}\mid X_{0,\mathcal I})$，常用于训练掩码扩散模型 [SAS+24, SHW+24]。

### 2.4 信息论量

这里形式化定义我们用来量化数据分布内在复杂度的相关信息论量。

**定义 2.9.** 给定随机向量 $X=(X_1,\ldots,X_d)$，$X$ 的**总相关**为

$$
\mathrm{TC}(X)=\mathrm{KL}\left(\mathrm{law}(X)\Big\|\bigotimes_i\mathrm{law}(X_i)\right)=\sum_i I(X_i;X_{i+1:d}).
$$

$X$ 的**对偶总相关**为

$$
\mathrm{DTC}(X):=H(X)-\sum_iH(X_i\mid X_{-i}).
$$

更一般地，其条件版本为

$$
\mathrm{TC}(X\mid Y):=\sum_iH(X_i\mid Y)-H(X\mid Y)=\sum_iI(X_i;X_{i+1:d}\mid Y),
$$

$$
\mathrm{DTC}(X\mid Y):=H(X\mid Y)-\sum_iH(X_i\mid X_{-i},Y).
$$

下述引理用条件互信息之和界定逐坐标信道使对偶总相关减少的程度。

**引理 2.10.** 设 $A=(A_1,\ldots,A_d)$，$B=(B_1,\ldots,B_d)$ 由对 $A$ 施加独立逐坐标信道得到，则

$$
\mathrm{DTC}(A)-\mathrm{DTC}(B)=\mathrm{DTC}(A\mid B)+\sum_{i=1}^dI(B_i;A_{-i}\mid B_{-i}).
$$

特别地，

$$
\sum_{i=1}^dI(B_i;A_{-i}\mid B_{-i})\leqslant\mathrm{DTC}(A)-\mathrm{DTC}(B).\tag{2}
$$

**证明：** 由定义

$$
\mathrm{DTC}(A)-\mathrm{DTC}(B)-\mathrm{DTC}(A\mid B)=H(A)-H(B)-H(A\mid B)-\sum_i\left(H(A_i\mid A_{-i})-H(B_i\mid B_{-i})-H(A_i\mid A_{-i},B)\right).\tag{3}
$$

注意 $H(A)-H(B)-H(A\mid B)=-H(B\mid A)=-\sum_iH(B_i\mid A_i)$，其中第二等式成立是因为 $B$ 由施加于 $A$ 的乘积信道得到。同理 $H(A_i\mid A_{-i},B)=H(A_i\mid A_{-i},B_i)$，且

$$
H(A_i\mid A_{-i})-H(A_i\mid A_{-i},B_i)+H(B_i\mid A_i)=H(A_i\mid A_{-i})-H(A_i\mid A_{-i},B_i)+H(B_i\mid A_i,A_{-i})=H(B_i\mid A_{-i}).
$$

把这些代入式（3）得

$$
\mathrm{DTC}(A)-\mathrm{DTC}(B)-\mathrm{DTC}(A\mid B)=\sum_i\left(H(B_i\mid B_{-i})-H(B_i\mid A_{-i})\right).
$$

最后注意 $H(B_i\mid A_{-i})=H(B_i\mid A_{-i},B_{-i})$，故上式可写成 $\sum_iI(B_i;A_{-i}\mid B_{-i})$。

## 3 均匀扩散可按对偶总相关扩展

**定理 3.1.** 设 $q$ 为 $[S]^d$ 上任意分布，并设存在对所有 $t$ 满足 score 误差界 $\varepsilon_{\mathrm{unif}}(t)\leqslant\varepsilon_{\mathrm{unif}}$ 的 score 估计 $(\hat s_t)$，以及一个数 $\mathrm{DTC}\geqslant\mathrm{DTC}(q)$。则对每个 $0<\varepsilon<1$，存在采样器输出分布 $\hat q$ 满足

$$
\mathrm{KL}(q\|\hat q)\leqslant\varepsilon+O\left(\varepsilon_{\mathrm{unif}}\cdot\log(dS/\varepsilon)\right),
$$

且使用

$$
O\left(\left(1+\frac{\mathrm{DTC}}{\varepsilon}\right)\log\frac{edS}{\varepsilon}\right)
$$

次 score 预言机查询。

第 3.1 节证明关键估计：用 DTC 在从较低噪声水平过渡到较高噪声水平时的减少量来界定条件 TC，从而支持望远镜求和。第 3.2 节控制 score 误差的影响。第 3.3 节描述采样算法并完成定理 3.1 的证明。

### 3.1 条件 TC 与 DTC 递减

本节的主要结果是条件 TC $\mathrm{TC}(X_s\mid X_t)$ 的上界，用对偶总相关在从噪声水平 $s$ 过渡到更高噪声水平 $t$ 时的减少量表示：

**引理 3.2.** 对 $0<s<t$，令 $h=t-s$，则

$$
\mathrm{TC}(X_s\mid X_t)\leqslant\frac{e^{2h}-1}{1-e^{-s}}\left(\mathrm{DTC}(q_s)-\mathrm{DTC}(q_t)\right).
$$

证明首先对 Gibbs 采样边缘作一个简单但关键的观察（驱动整个证明），再结合反向 DPI。本节的其余支撑结果包括：**命题 3.3**（对 $0<s\leqslant t$、所有 $i\in[d]$、$a\in\Sigma$、$y\in X$ 的逐坐标后验比较）、**引理 3.4（均匀扩散的逆 DPI）**（对 $\Sigma$ 上满足最小概率下界的分布 $p,p'$，加噪后二者距离的收缩速率有上界）、以及**推论 3.5**（对 $0<s<t$、$h=t-s$，对每个 $i\in[d-1]$ 的坐标条件互信息界）。这三项结果共同给出引理 3.2 的证明。

### 3.2 score 误差与近似反向核

**命题 3.6** 表明：对每个 $t>0$、$y\in X$、$i\in[d]$，真实 score $(s_t(y)[i,a])_{a\in\Sigma}$ 属于与后验边缘相对应的可行集 $\mathcal S_{t,y}^i$，从而为在 score 有误差时构造**近似反向核**提供基础。**引理 3.7** 进一步给出在 $0<s<t$、$h=t-s$ 时近似反向核与理想反向核之间的误差界。由此得到的主要结论是：用引理 2.1 的 Gibbs 采样边缘构造的核在 score 误差 $\varepsilon_{\mathrm{unif}}$ 下仍保持可控偏差，并且该偏差可以按步长与 $\varepsilon_{\mathrm{unif}}$ 的适当组合累积；这正是第 3.3 节望远镜论证所需的输入。

### 3.3 采样器与望远镜求和

采样算法在几何网格 $t_j=(1+a)^j$ 的噪声水平上运行，每一步在 $X_{t_{j+1}}$ 的条件下用近似反向核生成 $X_{t_j}$，并在 $t_0$ 处输出样本。**引理 3.8** 给出输出分布 $\hat q$ 的 KL 误差界：

$$
\mathrm{KL}(q\|\hat q)\lesssim\sum_j\mathrm{TC}(X_{t_j}\mid X_{t_{j+1}})+\text{score 误差项}.
$$

**引理 3.9** 给出任意 $t>0$ 处的边界项估计；**引理 3.10** 给出 $\mathrm{KL}(q_T\|\mathrm{Unif}(X))\leqslant e^{-T}d\log S$；**引理 3.11** 给出 $0<t\leqslant1$ 时 $H(q_t)-H(q)\leqslant dt\log(eS/t)$。

**定理 3.1 的证明。** 关键在于选取步长使引理 3.8 中的求和 telescope（见图 2）：令 $t_{j+1}\approx(1+a)t_j$，由引理 3.2 把每一项 $\mathrm{TC}(X_{t_j}\mid X_{t_{j+1}})$ 界定为 $a$ 倍 DTC 递减量，相邻噪声水平的 DTC 递减求和即 telescope 为初始 DTC 与末端 DTC 之差，不超过 $\mathrm{DTC}(q)$；再结合引理 3.9—3.11 的边界项与 score 误差项，取 $a\asymp\varepsilon/\mathrm{DTC}(q)$，即得 KL 误差 $\leqslant\varepsilon$，查询次数为 $O((1+\mathrm{DTC}/\varepsilon)\log(edS/\varepsilon))$。证毕。

## 4 高斯扩散可按对偶总相关扩展

**定理 4.1.** 设 $q$ 为离散分布 $q^{\mathrm{pre}}$（定义在 $X$ 上）的任意 one-hot 编码，并设存在对所有 $t$ 满足 $\varepsilon_{\mathrm{gauss}}(t)\leqslant\varepsilon_{\mathrm{gauss}}$ 的 score 估计 $(\hat s_t)$，以及一个数 $\mathrm{DTC}\geqslant\mathrm{DTC}(q)$。则对每个 $0<\varepsilon<1$，存在采样器，其输出分布 $\hat q$（定义在 $[S]^d$ 上）满足

$$
\mathrm{KL}(q^{\mathrm{pre}}\|\hat q)\leqslant\varepsilon+O\left(\varepsilon_{\mathrm{gauss}}^2\cdot\log(dS/\varepsilon)\right),
$$

且使用

$$
O\left(\left(1+\frac{\mathrm{DTC}}{\varepsilon}\right)\log\frac{edS}{\varepsilon}\right)
$$

次 score 预言机查询。

论证的整体框架与第 3 节均匀扩散相同。一个重要区别是：**不存在**命题 3.3 的类比，因此用于把条件 TC 与 DTC 递减联系起来的逆 DPI 必须用另一条路径证明（见第 4.2 节）。

**变元替换。** 本节中，用加性噪声参数化比 OU 参数化更方便。作变元替换

$$
u=e^{2t}-1,\qquad t(u)=\frac12\log(1+u),\qquad Z_u:=e^{t(u)}X_{t(u)},
$$

于是

$$
Z_u=X_0+B_u\tag{14}
$$

其中 $(B_u)_{u\geq0}$ 为 $\mathbb R^{Sd}$ 中与 $X_0$ 独立的标准 Brownian 运动。此时用 $\pi_u$ 与 $g_u=\nabla\log\pi_u$ 分别表示 $Z_u$ 的密度与其 score。

第 4.1 节给出高斯扩散的条件 TC 与 DTC 递减关系（引理 4.2、推论 4.4）；第 4.2 节证明高斯扩散的逆 DPI（引理 4.3、4.5、4.6 等，其中关键是指数族与 Fisher 信息的凸性论证）；第 4.3 节处理 score 误差与近似反向核（引理 4.7、4.8）；第 4.4 节给出采样器与望远镜论证（引理 4.9—4.11 与定理 4.1 的证明）。与定理 3.1 相比，此处调度在参数 $u=e^t-1$ 上呈几何分布，而"势函数" $F_G$ 取代了 $\log u$ 的角色；边界项与 score 误差项均可类似控制，最终望远镜求和给出与 $\mathrm{DTC}(q)$ 线性的查询复杂度。

## 5 随机经验测度的构造

本节引入后文用于证明分离的随机经验测度族，并给出关键时间与关键窗口的基本记号。

**定义 5.1.** 给定子集 $\mathcal C\subseteq\{\pm1\}^d$，用 $q_{\mathcal C}:=\mathrm{Unif}(\mathcal C)$ 表示 $\mathcal C$ 上的均匀分布。我们考虑的**随机经验测度**为 $q_{\mathcal C}$，其中 $\mathcal C$ 是 $\{\pm1\}^d$ 的均匀随机 $M$ 元子集。我们常称 $\mathcal C$ 的元素为**码字（codewords）**。

后续所有界都假设采样器：

- 知道区间 $[\kappa_-,\kappa_+]$ 但**不知道** $\kappa$；
- 知道自己在定义 5.1 意义下具有对某个随机经验测度的近似 score 预言机访问，但**不知道** $\mathcal C$ 的具体实现。

后续小节的记号：记作 $c,C$ 的常数可依赖已知参数 $\kappa_-,\kappa_+$，但不依赖其他参数；对其他参数的依赖用下标表示。对均匀与高斯前向过程，我们将重载记号 $q_{\mathcal C}^t$ 表示在相应前向过程下、$X_0\sim q_{\mathcal C}$ 时 $X_t$ 的分布。

下文三项主要结果以及附录 A 中的均匀下界都使用定义 5.1。我们为均匀与高斯扩散证明的上界对任意 $\kappa\in[\kappa_-,\kappa_+]$ 成立；而掩码扩散与均匀扩散的下界即使额外假设 $\kappa$ 被限制在格点 $\{(k/d)\log2:k\in\mathbb Z\}$（此时 $M=e^{\kappa d}=2^k$）上也成立。

定义均匀与高斯信道的标量互信息

$$
I_{\mathrm{unif}}(t):=\frac{1+e^{-t}}{2}\log\left(1+e^{-t}\right)+\frac{1-e^{-t}}{2}\log\left(1-e^{-t}\right),
$$

$$
I_{\mathrm{gauss}}(t):=I\left(V;e^{-t}V+\sqrt{1-e^{-2t}}G\right),\qquad V\sim\mathrm{Unif}(\{\pm1\}),\ G\sim\mathcal N(0,1).
$$

此处及下文 $h_2(p):=-p\log p-(1-p)\log(1-p)$ 表示二元熵函数（单位 nats）；注意 $I_{\mathrm{unif}}(t)=\log2-h_2(\beta_t)$。定义**关键时间** $t_{\mathrm{unif}}^\star$ 与 $t_{\mathrm{gauss}}^\star$ 为

$$
dI_{\mathrm{unif}}\left(t_{\mathrm{unif}}^\star\right)=\log M,\qquad dI_{\mathrm{gauss}}\left(t_{\mathrm{gauss}}^\star\right)=\log M\tag{22}
$$

的唯一解。此外，令 $0<\tau_-<\tau_+$ 为（已知的）常数，使得对每个 $\kappa\in[\kappa_-,\kappa_+]$ 与所有充分大的 $d$ 有 $t_{\mathrm{unif}}^\star,t_{\mathrm{gauss}}^\star\in[\tau_-,\tau_+]$，并定义

$$
I_0=\left[\tau_-/2,\ \tau_++1\right].\tag{23}
$$

在上界证明中，我们的算法查询的所有时间都落在式（23）定义的 $I_0$ 内；但在下界证明中不加此限制。

## 6 均匀扩散的 $\widetilde O(\sqrt d)$ 上界

本节给出用 $\widetilde O(\sqrt d)$ 次查询从随机经验测度近似采样的算法。该查询复杂度是紧的：附录 A 证明匹配的下界。

**定理 6.1（带近似 score 的均匀扩散）.** 存在只依赖 $[\kappa_-,\kappa_+]$ 的常数 $B,C,c_0,d_0>0$，使下列结论成立。设 $d\geqslant d_0$、$\varepsilon,\delta\in(0,1/4)$，并令

$$
\Lambda=\log\frac{Cd}{\varepsilon\delta}.\tag{24}
$$

假设 $\Lambda\leqslant c_0d$。给定对 $q_{\mathcal C}$ 的任意近似均匀扩散 score 预言机 $(\hat s_t)$ 的查询访问，其 score 误差满足

$$
\sup_{t\in I_0}\varepsilon_{\mathrm{unif}}(t)\leqslant e^{-B\Lambda}=\left(\frac{\varepsilon\delta}{Cd}\right)^B,\tag{25}
$$

则存在使用至多 $O(\sqrt d\Lambda/\varepsilon^2)$ 次 score 预言机查询的算法，使得以至少 $1-\delta$ 的概率（对 $\mathcal C$ 从 $X$ 的全部 $M$ 元子集中均匀抽样的随机性），该算法的输出分布 $\hat q_{\mathcal C}$ 满足 $\mathrm{TV}(\hat q_{\mathcal C},q_{\mathcal C})\leqslant\varepsilon$。特别地，对常数 $\varepsilon$ 与任意多项式小的 $\delta=d^{-\Theta(1)}$，**多项式小的 score 精度**即已足够，算法使用 $\widetilde O(\sqrt d\log d)$ 次 score 查询。

本节余下部分中 $\Lambda$ 取式（24）的值；必要时可再减小 $c_0$、增大 $d_0$，使 $\log d\leqslant\Lambda\leqslant c_0d$。第 6.1 节量化关键窗口：窗口以上，$q_{\mathcal C}^t$ 接近均匀分布；窗口以下，可由含噪观测恢复原始样本。第 6.2 节说明如何用取自 $\mathrm{Unif}(X)$ 的点上的近似 score 预言机查询来定位该窗口。最后第 6.3 节描述如何模拟穿越窗口的反向过程并对码字解码，从而完成定理 6.1 的证明。

### 6.1 量化关键窗口

本节刻画噪声水平的关键窗口：对更高的噪声水平 $t$，含噪分布与均匀分布不可区分；对更低的噪声水平，后验已集中到原始样本附近的窄区域。

**命题 6.4（关键窗口）.** 对每个 $K>0$，存在 $A_K>0$ 具有如下性质。对每个 $A\geqslant A_K$，存在只依赖 $A$、$K$、$[\kappa_-,\kappa_+]$ 的 $c_{K,A},d_{K,A}>0$，使只要 $d\geqslant d_{K,A}$ 且 $\log d\leqslant\Lambda\leqslant c_{K,A}d$，令

$$
w=A\sqrt{\frac{\Lambda}{d}},\tag{26}
$$

则

$$
\mathbb E_{\mathcal C}\mathrm{TV}\left(q_{\mathcal C}^t,\mathrm{Unif}(X)\right)\leqslant e^{-K\Lambda},\qquad t\geqslant t_{\mathrm{unif}}^\star+w,
$$

$$
\mathbb E_{\mathcal C}\mathrm{err}_{\mathcal C}^{U}(t)\leqslant e^{-K\Lambda},\qquad 0\leqslant t\leqslant t_{\mathrm{unif}}^\star-w,
$$

其中 $\mathrm{err}_{\mathcal C}^U(t)$ 表示在噪声水平 $t$ 处由含噪样本恢复原始码字的误差度量。**证明思路：** 先观察到 $\mathrm{err}_{\mathcal C}^U(t)$ 关于 $t$ 单调不减，而由数据处理不等式 $\mathrm{TV}(q_{\mathcal C}^t,\mathrm{Unif}(X))$ 关于 $t$ 单调不增，因此只需考虑端点 $t=t_{\mathrm{unif}}^\star\pm w$，再对端点作精细的概率估计即得。

这一定理揭示了分离的来源：掩码扩散的关键窗口宽度为 $\widetilde\Theta(d^{-1})$，而均匀与高斯扩散的关键窗口宽度为 $\widetilde\Theta(d^{-1/2})$（图 3）。在 $\widetilde O(\sqrt d)$ 次查询下只能在宽度 $\widetilde\Theta(d^{-1/2})$ 的网格上搜索关键时间，对掩码扩散而言关键窗口太窄而无法定位，因此需要 $\widetilde\Omega(d)$ 次查询。

### 6.2 识别关键窗口

本节给出定位 $t_{\mathrm{unif}}^\star$ 的算法。核心思想是：在取自 $\mathrm{Unif}(X)$ 的点上用近似 score 预言机查询，通过比较不同噪声水平上 score 与均匀参考 score 的偏差，估计 $I_{\mathrm{unif}}(t)$ 相对于 $\log M$ 的位置。由于 $I_{\mathrm{unif}}(t)$ 单调，定位问题归约为在 $I_0$（式（23））上做二分搜索；每次查询的误差由 score 误差界（25）控制，故 $\widetilde O(\sqrt d)$ 次查询足以把 $t_{\mathrm{unif}}^\star$ 定位到宽度 $w$ 的窗口内。具体地，算法在几何或二分网格上选取 $O(\sqrt d\Lambda)$ 个候选时间点，并对每个点用少量随机样本估计 score 偏差；由集中不等式与命题 6.4 的窗口界，可得高概率的定位保证。

### 6.3 定位窗口后的采样

定位关键窗口后，采样分两段进行（图 3）：

- **窗口以上（$t\geqslant t_{\mathrm{unif}}^\star+w$）**：$q_{\mathcal C}^t$ 与 $\mathrm{Unif}(X)$ 的总变差距离以 $e^{-K\Lambda}$ 指数小，因此可直接从均匀分布起转，或仅用少量查询模拟这一区间的反向过程；该区间的离散化误差可忽略。
- **穿过窗口**：在宽度 $O(w)$ 的窗口内，用近似反向核逐步推进。为保证每一步的 score 估计可用于构造合法反向核，这里需要对估计的后验边缘作一次 **Bregman 投影**（把估计投影回可行集 $\mathcal S_{t,y}^i$，见命题 3.6 的可行性刻画），这正是均匀扩散情形相对高斯扩散额外需要的步骤。
- **窗口以下（$t\leqslant t_{\mathrm{unif}}^\star-w$）**：后验分布已高度集中，由命题 6.4，只需**一步解码**即可把样本舍入到正确的支撑点；无需继续模拟全反向过程。

综上，总查询次数为 $O(\sqrt d\Lambda/\varepsilon^2)$，总变差误差为 $\varepsilon$，从而完成定理 6.1 的证明。

## 7 高斯扩散的 $\widetilde O(\sqrt d)$ 上界

**定理 7.1（带近似 score 的高斯扩散）.** 存在只依赖 $[\kappa_-,\kappa_+]$ 的常数 $B,C,c_0,d_0>0$，使下列结论成立。设 $d\geqslant d_0$、$\varepsilon,\delta\in(0,1/4)$，并令

$$
\Lambda=\log\frac{Cd}{\varepsilon\delta}.\tag{54}
$$

假设 $\Lambda\leqslant c_0d$。给定对 $q_{\mathcal C}$ 的任意近似高斯扩散 score 预言机 $(\hat s_t)$ 的查询访问，其 score 误差满足

$$
\sup_{t\in I_0}\varepsilon_{\mathrm{gauss}}(t)\leqslant e^{-B\Lambda}=\left(\frac{\varepsilon\delta}{Cd}\right)^B,\tag{55}
$$

则存在使用至多 $O(\sqrt d\Lambda/\varepsilon^2)$ 次 score 预言机查询的算法，使得以至少 $1-\delta$ 的概率（对 $\mathcal C$ 从 $X$ 的全部 $M$ 元子集中均匀抽样的随机性），该算法的输出分布 $\hat q_{\mathcal C}$ 满足 $\mathrm{TV}(\hat q_{\mathcal C},q_{\mathcal C})\leqslant\varepsilon$。特别地，对常数 $\varepsilon$ 与任意多项式小的 $\delta=d^{-\Theta(1)}$，多项式小的 score 精度即已足够，算法使用 $\widetilde O(\sqrt d\log d)$ 次 score 查询。

本节余下部分中 $\Lambda$ 取式（54）的值。定义**参考分布**

$$
\nu_t:=\mathrm{law}\left(e^{-t}U+\sigma_tG\right),\qquad U\sim\mathrm{Unif}(X),\ G\sim\mathcal N(0,\mathbf I_d).\tag{56}
$$

因此 $\nu_t$ 是把同一前向过程作用于整个超立方体上的均匀分布所得。相应地，关键窗口用 $\nu_t$ 而非 $\mathrm{Unif}(X)$ 作为"窗口以上"的参考：

**命题 7.4（关键窗口）.** 对每个 $K>0$，存在 $A_K>0$ 具有如下性质。对每个 $A\geqslant A_K$，存在只依赖 $A$、$K$、$[\kappa_-,\kappa_+]$ 的 $c_{K,A},d_{K,A}>0$，使只要 $d\geqslant d_{K,A}$ 且 $\log d\leqslant\Lambda\leqslant c_{K,A}d$，令

$$
w=A\sqrt{\frac{\Lambda}{d}},\tag{63}
$$

则

$$
\mathbb E_{\mathcal C}\mathrm{TV}\left(q_{\mathcal C}^t,\nu_t\right)\leqslant e^{-K\Lambda},\qquad t\geqslant t_{\mathrm{gauss}}^\star+w,
$$

$$
\mathbb E_{\mathcal C}\mathrm{err}_{\mathcal C}^{G}(t)\leqslant e^{-K\Lambda},\qquad 0\leqslant t\leqslant t_{\mathrm{gauss}}^\star-w.
$$

**证明思路：** 必要时减小 $c_{K,A}$ 可假设 $w\leqslant\min\{\tau_-/2,1\}$，使 $t_{\mathrm{gauss}}^\star\pm w\in I_0$。固定 $\mathcal C$；对两个分布额外施加一步前向不会增大总变差距离，于是可把窗口以上的 $q_{\mathcal C}^t$ 与 $\nu_t$ 的差异归约到 $t=t_{\mathrm{gauss}}^\star+w$ 处，再用高斯信道与随机经验测度的集中性质估计该端点，即得所需指数界。

结合第 6.2—6.3 节的算法框架（把参考分布换成 $\nu_t$、把**均匀 score 的偏差**换成**高斯 score 与参考 score 的偏差**），同样的定位与穿越策略给出 $\widetilde O(\sqrt d)$ 次查询的采样器；其关键窗口宽度同为 $\widetilde\Theta(d^{-1/2})$，因此相对掩码扩散具有平方根级的查询复杂度优势。

## 8 掩码扩散的下界

本节证明：对定义 5.1 的随机经验测度，用掩码扩散 score 预言机采样需要 $\widetilde\Omega(d)$ 次查询——比均匀与高斯扩散的 $\widetilde O(\sqrt d)$ 严格更多。这建立了三种主流 dLLM 范式之间首个可证明的并行性分离。

**定理 8.1（掩码扩散下界）.** 固定 $\rho\in(0,1/4)$。存在只依赖 $[\kappa_-,\kappa_+]$ 与 $\rho$ 的常数 $c,C,d_0>0$，使下列结论对 $d\geqslant d_0$ 成立。给定 $\eta\in(0,1/10)$，令

$$
\ell=\left\lfloor\log_2\frac{Cd}{\eta\rho^2}\right\rfloor.\tag{96}
$$

存在一族预言机 $\{\mathcal O_{k,\mathcal C}\}_{k\in\mathcal K_d^M,|\mathcal C|=2^k}$ 满足

$$
\max_{0\leqslant m<d}\varepsilon_{\mathrm{mask}}\left(\mathcal O_{k,\mathcal C};q_{\mathcal C},m\right)\leqslant\eta,\qquad k\in\mathcal K_d^M,\ |\mathcal C|=2^k,\tag{97}
$$

使得任何至多做

$$
Q\leqslant c\rho^2\frac{d}{\ell}
$$

次查询、且不知道 $k$ 与 $\mathcal C$ 的自适应随机算法 $\mathcal A$，其输出分布 $\hat q_{\mathcal A}^{\mathcal O_{k,\mathcal C}}$ 满足

$$
\mathbb P_{\substack{k\sim\mathrm{Unif}\left(\mathcal K_d^M\right)\\ \mathcal C\sim\mathrm{Unif}\left(\binom{\{\pm1\}^d}{2^k}\right)}}\left[\mathrm{TV}\left(\hat q_{\mathcal A}^{\mathcal O_{k,\mathcal C}},q_{\mathcal C}\right)\geqslant1-\rho\right]\geqslant1-\rho.
$$

特别地，对常数 $\rho$ 与任意多项式小的 $\eta=d^{-\Theta(1)}$，对至少常数比例的码本实现，以至多常数误差采样需要 $\Omega(d/\log d)$ 次查询。

### 8.1 对抗性预言机构造

构造的核心是：对每个隐藏的整数 $k$（即隐藏的码本大小 $M=2^k$）构造一个对抗性预言机，使得在**远离**关键窗口的噪声水平上，它返回与"均匀分布参考 score"一致的答案；只在关键窗口内部，它才返回包含真实码本信息的答案。由于关键窗口在水平 $m$ 上（$m$ 为已揭示坐标数）只占很小比例，算法若不恰好查询窗口内的水平，就得不到任何关于 $\mathcal C=\mathcal C_k$ 的有用信息。

具体构造：对 $|C|=2^k$ 与水平 $m$，当 $m\leqslant k-\ell$ 时，预言机返回与均匀分布（参考预言机 $\mathcal O_0:\equiv\mathbf 1$，即 $\mathrm{Unif}(X)$ 的精确 score）一致或极接近的答案；当 $m\geqslant k+\ell$ 时，后验已集中，返回可由码字精确恢复的答案（从而任何算法都"能够"解码）；而在 $k-\ell<m<k+\ell$ 的窄窗口内，预言机返回的分布在一族构造下与参考分布不可区分。该构造的单点误差由（97）中的 $\eta$ 控制。

### 8.2 分布不可区分性：下界证明

设算法做 $Q$ 次查询。若 $Q\leqslant c\rho^2d/\ell$，则查询命中的水平至多覆盖 $Q$ 个不同的 $m$；而窗口 $k-\ell<m<k+\ell$ 的长度为 $2\ell$，且 $k$ 从 $\mathcal K_d^M$ 中均匀抽取。于是由计数与全变差距离的次可加性：以高概率，算法未命中任何"有信息"的窗口内水平，其全部观测服从与 $k,\mathcal C$ 无关的参考分布。此时算法输出分布与真实 $q_{\mathcal C}$ 的总变差距离以高概率不小于 $1-\rho$。得证。

## 9 结论与展望（原节标题：Outlook）

本文比较了扩散语言建模三种主流范式的并行采样能力。我们首先证明：均匀扩散与高斯扩散的查询复杂度可以适应由**对偶总相关**量化的数据内在复杂度，与先前对掩码扩散已知的结果相当 [CCL26, LZ25]。

在确立三种范式在这一方面"并驾齐驱"之后，我们进一步展示了一族简单分布：在该分布上，均匀与高斯扩散可证明地优于任何基于掩码扩散的采样算法。与"掩码扩散因为无法修正其承诺的 token 而不利于并行化"的既有启发式推理相反，我们表明该分离的来源是另一机制：掩码扩散的噪声水平关键窗口（后验从无信息过渡到尖锐集中在支撑的小子集上的区间）渐近地比均匀与高斯扩散的相应窗口**窄** $\widetilde\Theta(\sqrt d)$ 倍。据我们所知，这是关键窗口与扩散采样离散化误差之间的首次联系。

尽管如此，本文只触及扩散语言建模众多重要性能维度之一，不应被简化为"支持某一范式胜过另一范式"。掩码扩散确实还有各种其他优点，例如其任意顺序生成能力（any-order generation）——这在本理论上仍理解不足，但在实践中极为重要 [YGG+25, KSK+25]。在计算方面，Ghio 等 [GDKZ24] 与 Bhatt 等 [BGKM26] 在自旋玻璃类分布背景下比较了不同加噪过程下去噪的算法复杂度。最后，对高斯扩散，我们只考虑了最基本的嵌入形式，更丰富的编码映射仍有待探索。严格理解上述各方面、以及加噪过程—并行性—去噪复杂度—推断灵活性之间的相互作用，仍是重要的开放方向，我们留待未来工作。

**致谢。** 我们感谢 Fan Chen、Sinho Chewi、Kevin Cong、Khashayar Gatmiry、Holden Lee、Yiwen Kou、Jerry Li、Jianfeng Lu、Raghu Meka、Adil Salim 与 Yimeng Wang 多年来就离散与连续扩散模型的离散化问题进行的许多富有启发的讨论；也感谢 Martin Wainwright 与 Yuting Wei 就两家论文中并发工作的讨论进行协调。

**关于 AI 使用的声明。** 本文大多数关键思想源于作者今年春季与初夏的工作，其中少数关键部分借助了前沿模型。最值得注意的是，DTC 自适应速率的望远镜论证由 AI 提出；AI 生成的高斯扩散逆 DPI 原始证明极难验证，但进一步的人机交互最终形成了论证的最终形式。在早期版本中，我们还忽略了均匀扩散情形中额外 Bregman 投影步骤的必要性，这一步骤后来由 AI 指出。虽然我们对主要分离结果有完全由人类生成的论证，但 AI 帮助简化了部分论证：它提出了一个比我们最初考虑的统计量更简单的、用于定位关键窗口的检验统计量；我们此前有另一套论证，通过证明后验的松弛 Lipschitz 常数有界、再借助已有离散化分析来完成关键噪声水平以下的采样，我们认为这一步可以简化但未尝试优化（因其不影响最终结果），而 AI 给出了简单而有帮助的观察：**关键窗口以下，一步解码即可**。此外，一个编码智能体在仅有初始提示（以 [XP26] 的实验为种子）的情形下实现了图 4 的数值仿真。事实上，它还能让我们证明比本文出现的高斯扩散 $\widetilde O(\sqrt d)$ 上界 considerably 更一般的版本：从超立方体随机子集上的均匀分布推广到单位球上任何满足凸 Lipschitz 函数集中性质的背景测度的随机经验分布；我们选择不把该结果作为定理 1.3 呈现，因为定理 1.3 已抓住大部分直觉。前沿模型还被用于生成本文全部插图，并用于发现记号和参数设定中的小错误与笔误。除这些方面外，本文的一切内容均由人类撰写。

## 附录 A：均匀扩散的 $\widetilde\Omega(\sqrt d)$ 下界

第 6 节的上界需要搜索式（22）定义的关键时间 $t_{\mathrm{unif}}^\star$。本节证明在近似 score 下该搜索无法避免。困难分布族包含 $\widetilde\Omega(\sqrt d)$ 个可能的 $t_{\mathrm{unif}}^\star$ 取值，彼此间隔大于关键窗口宽度 $w=\widetilde\Theta(1/\sqrt d)$；且远离真实值的查询通常收到均匀分布的 score。

这是第 8 节掩码下界的连续时间对应物：那里隐藏的过渡发生在已揭示坐标数越过隐藏整数 $k$ 时；这里则发生在查询时间越过 $t_{\mathrm{unif}}^\star$ 时。$t_{\mathrm{unif}}^\star$ 以上，含噪随机经验测度接近均匀；$t_{\mathrm{unif}}^\star$ 以下，真实样本接近 $\mathcal C$ 中某点，但在不知道 $\mathcal C$ 时选取的固定查询不太可能接近 $\mathcal C$ 的任何点。

对每个满足 $\kappa_-\leqslant k\log2/d\leqslant\kappa_+$ 的整数 $k$，令 $t_{\mathrm{unif}}^\star(k)$ 为

$$
dI_{\mathrm{unif}}\left(t_{\mathrm{unif}}^\star(k)\right)=k\log2=\log M\tag{106}
$$

的唯一解。导数 $I_{\mathrm{unif}}'(t)=-\frac{e^{-t}}{2}\log\frac{1+e^{-t}}{1-e^{-t}}$ 在 $[\tau_-,\tau_+]$ 上绝对值有上下界。

给定 $A,C_\Lambda>0$、$\eta\in(0,1/10)$、$\rho\in(0,1/4)$，定义

$$
\Lambda=\log\frac{C_\Lambda d}{\eta\rho^2},\qquad w=A\sqrt{\frac{\Lambda}{d}}.\tag{107}
$$

固定充分大的常数 $D>0$，从最小的可行整数 $k$ 开始，每隔 $\lceil Ddw\rceil$ 个保留一个，记所得集合为

$$
\mathcal K_d^U:=\left\{\left\lfloor\frac{\kappa_-d}{\log2}\right\rfloor+j\lceil Ddw\rceil:\ j=0,1,\ldots,\left\lfloor\frac{\kappa_+d/\log2-\lfloor\kappa_-d/\log2\rfloor}{\lceil Ddw\rceil}\right\rfloor\right\}.
$$

若 $k<k'$ 为 $\mathcal K_d^U$ 的相邻元素，对式（106）用中值定理可得（对某 $\xi\in(t_{\mathrm{unif}}^\star(k'),t_{\mathrm{unif}}^\star(k))$）$t_{\mathrm{unif}}^\star(k)-t_{\mathrm{unif}}^\star(k')=\frac{(k'-k)\log2/d}{-I_{\mathrm{unif}}'(\xi)}$。于是 $D$ 取足够大后，对充分大的 $d$ 有

$$
t_{\mathrm{unif}}^\star(k)-t_{\mathrm{unif}}^\star(k')\geqslant10w,\qquad\left|\mathcal K_d^U\right|\geqslant\frac{cd}{\lceil Ddw\rceil}\geqslant\frac{c_U}{w},
$$

特别地

$$
\left|\mathcal K_d^U\right|\geqslant\frac{c_U}{A}\sqrt{\frac{d}{\Lambda}}.\tag{109}
$$

我们令 $k$ 从 $\mathcal K_d^U$ 中均匀选取，并在给定 $k$ 后令 $\mathcal C$ 从 $X$ 的全部 $2^k$ 元子集中均匀选取。记 $s_{\mathcal C}^t$ 为 $q_{\mathcal C}^t$ 的精确 score，即 $s_{\mathcal C}^t(x)[i,a]=q_{\mathcal C}^t(x^{i\leftarrow a})/q_{\mathcal C}^t(x)$；用定义 2.2 的 $\varepsilon_{\mathrm{unif}}(\mathcal O;q_{\mathcal C},t)$ 度量预言机 $\mathcal O$ 的精度。

**定理 A.1（均匀扩散下界）.** 固定 $\rho\in(0,1/4)$。存在只依赖 $[\kappa_-,\kappa_+]$ 与 $\rho$ 的常数 $A,C_\Lambda,c,c_0,d_0>0$，使下列结论对 $d\geqslant d_0$ 成立。给定 $\eta\in(0,1/10)$，取上面定义的 $\Lambda,w,\mathcal K_d^U$，并假设 $\Lambda\leqslant c_0d$。存在一族 score 预言机 $\{\mathcal O_{k,\mathcal C}\}_{k\in\mathcal K_d^U,|\mathcal C|=2^k}$，每个都返回元素严格为正的归一化 score 向量，满足

$$
\sup_{t>0}\varepsilon_{\mathrm{unif}}\left(\mathcal O_{k,\mathcal C};q_{\mathcal C},t\right)\leqslant\eta,\qquad k\in\mathcal K_d^U,\ |\mathcal C|=2^k,\tag{110}
$$

使得任何未被告知 $k$ 或 $\mathcal C$、且至多做

$$
Q\leqslant c\rho^2\sqrt{\frac{d}{\Lambda}}\tag{111}
$$

次 score 预言机查询的自适应随机算法 $\mathcal A$，其输出分布 $\hat q_{\mathcal A}^{\mathcal O_{k,\mathcal C}}$ 满足

$$
\mathbb P_{\substack{k\sim\mathrm{Unif}\left(\mathcal K_d^U\right)\\ \mathcal C\sim\mathrm{Unif}\left(\binom{X}{2^k}\right)}}\left[\mathrm{TV}\left(\hat q_{\mathcal A}^{\mathcal O_{k,\mathcal C}},q_{\mathcal C}\right)\geqslant1-\rho\right]\geqslant1-\rho.\tag{112}
$$

特别地，对常数 $\rho$ 与任意多项式小的 $\eta=d^{-\Theta(1)}$，对至少常数比例的实例以至多常数误差采样，需要 $\Omega(\sqrt{d/\log d})$ 次 score 预言机查询。

附录余下部分中 $\Lambda$ 与 $w$ 取式（107）的值。A.1 节构造预言机族并证明其精度；A.2 节证明查询下界。**A.1 对抗性预言机构造。** 令 $\mathbf 1\in\mathbb R^{[d]\times\{-1,1\}}$ 为所有元素为 1 的 score 向量，定义参考预言机 $\mathcal O_0(t,x):=\mathbf 1$（对任意查询 $(t,x)$），它正是 $\mathrm{Unif}(X)$ 的精确 score 预言机。命题 6.4 已表明 $t_{\mathrm{unif}}^\star$ 以上 $q_{\mathcal C}^t$ 接近 $\mathrm{Unif}(X)$；**引理 A.2** 进一步给出 score 误差层面的对应陈述：对每个 $K>0$，存在只依赖 $[\kappa_-,\kappa_+]$ 与 $K$ 的常数 $A_K,c_K,d_K>0$，使当 $A\geqslant A_K$、$d\geqslant d_K$、$\log d\leqslant\Lambda\leqslant c_Kd$、$t\geqslant t_{\mathrm{unif}}^\star(k)+4w$ 时，$\mathbb E_{\mathcal C}\mathrm{TV}(q_{\mathcal C}^t,\cdot)$ 与参考预言机输出的 score 误差均可被 $e^{-K\Lambda}$ 控制。**A.2 查询下界。** 由 A.1 的构造，任何最多 $Q\leqslant c\rho^2\sqrt{d/\Lambda}$ 次查询的算法以高概率落在窗口之外，从而无法区分真实分布与参考分布，输出与 $q_{\mathcal C}$ 的总变差距离以高概率不小于 $1-\rho$，即（112）。

## 附录 B：延后的证明

附录 B 汇集正文各节延后的技术证明，包括：引理 2.1（均匀扩散 score 的后验边缘/Gibbs 边缘解释）、引理 2.8（掩码 score 误差与后验边缘 KL 的等价，式（1））、第 3 节中命题 3.3、引理 3.4（均匀扩散逆 DPI）、推论 3.5、命题 3.6、引理 3.7—3.11，第 4 节中引理 4.2—4.11（含高斯扩散逆 DPI 与指数族凸性论证），以及第 6—8 节中支撑关键窗口与不可区分性的各类集中与矩估计。附录 B 内容以逐式推导为主，本页未逐式翻译，仅按上述结构列出其证明对象与在正文中的作用。

## 图注

**图 1（原 PDF 第 5 页）：** 本文考虑的三种 dLLM 范式。(a) 加噪过程：均匀扩散（每个 token 以概率 $1-e^{-t}$ 被重采样，$X_T$ 为 i.i.d. 均匀 token）、高斯扩散（one-hot 编码 $X_0=(e_{A_i})_i\in\mathbb R^{Sd}$，$X_T\approx\mathcal N(0,\mathbf I)$）、掩码扩散（每个 token 以概率 $1-e^{-t}$ 被掩码，$X_T$ 为全掩码）。(b) 一次推断步：均匀扩散的 score 预言机输出 $X_0$ 的后验边缘、每个 token 都被重采样；高斯扩散输出后验均值 $\mathbb E[X_0\mid X_t]$、每个坐标都被更新；掩码扩散输出被掩码 token 的边缘、未掩码 token 被承诺（不再改变）。

**图 2（原 PDF 第 6 页）：** 定理 1.1/1.2 背后望远镜论证的示意。采样器的 KL 误差是各采样步所丢弃依赖关系对应条件总相关之和（内嵌小图），即 $\mathrm{KL}(q\|\hat q)\leqslant\sum_j\mathrm{TC}(X_{t_j}\mid X_{t_{j+1}})$；关键步骤是逆数据处理不等式，它把每一项大致界定为步长乘以该步中 $\mathrm{DTC}(q_t)$ 的下降量，从而可用 $t_{j+1}\approx(1+a)t_j$ 的几何调度 telescope 为 $a\cdot\mathrm{DTC}(q)=\varepsilon$（$a\asymp\varepsilon/\mathrm{DTC}(q)$）。

**图 3（原 PDF 第 7 页）：** (a) 均匀与高斯扩散：噪声水平的关键窗口宽度为 $\widetilde\Theta(d^{-1/2})$，隐藏在 $\widetilde\Theta(\sqrt d)$ 个位置之中，需 $\widetilde O(\sqrt d)$ 次查询；(b) 掩码扩散：关键窗口宽度为 $\widetilde\Theta(d^{-1})$，隐藏在 $\Theta(d)$ 个位置之中，需 $\widetilde\Omega(d)$ 次查询。掩码扩散的关键窗口比均匀与高斯扩散更窄，因此需要更多查询才能在生成样本前定位它。

**图 4（原 PDF 第 8 页）：** 随机经验测度（$M=e^{\kappa d}$，$\kappa=0.2$）的数值仿真关键窗口，把 [XP26] 的仿真从高斯扩散扩展到掩码与均匀扩散。(a)—(c) 给定噪声水平下后验恢复植入码字的概率，对含噪样本的每坐标信息量 $I$ 作图（$I$ 为均匀随机比特与其受损版本间的互信息：掩码扩散 $m$ 个已揭示坐标时为 $(m/d)\log2$，均匀与高斯扩散分别为 $I_{\mathrm{unif}}(t)$、$I_{\mathrm{gauss}}(t)$；由式（22），各过程的临界水平都在 $I=\kappa$ 处，从而把三个相变放在统一尺度上）。(d) 相变宽度随维数 $d$ 的变化：掩码扩散按 $1/d$ 衰减，而均匀与高斯扩散只按 $1/\sqrt d$ 衰减。

## 参考文献（英文原书目）

以下按原 PDF 的字母序作者—年份编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

- [ABBM26] Beatrice Achilli, Marco Benedetti, Giulio Biroli, and Marc Mézard. Theory of speciation transitions in diffusion models with general class structure. Journal of Statistical Mechanics: Theory and Experiment, 2026(4):043304, 2026.

- [AJH+21] Jacob Austin, Daniel D Johnson, Jonathan Ho, Daniel Tarlow, and Rianne van den Berg. Structured denoising diffusion models in discrete state-spaces. In Advances in Neural Information Processing Systems, 2021.

- [BBDBM24] Giulio Biroli, Tony Bonnaire, Valentin De Bortoli, and Marc Mézard. Dynamical regimes of diffusion models. Nature Communications, 15(1):9957, 2024.

- [BGKM26] Alankrita Bhatt, Mukur Gupta, Germain Kolossov, and Andrea Montanari. Generating from discrete distributions using diffusions: Insights from random constraint satisfaction problems. arXiv preprint arXiv:2603.20589, 2026.

- [CBDB+22] Andrew Campbell, Joe Benton, Valentin De Bortoli, Thomas Rainforth, George Deligiannidis, and Arnaud Doucet. A continuous time framework for discrete denoising models. Advances in Neural Information Processing Systems, 35:28266–28279, 2022.

- [CCL26] Sitan Chen, Kevin Cong, and Jerry Li. Optimal inference schedules for masked diffusion models. In Steve Hanneke and Tor Lattimore, editors, Proceedings of Thirty Ninth Conference on Learning Theory, volume 336 of Proceedings of Machine Learning Research, pages 1279–1311. PMLR, 29 Jun–03 Jul 2026.

- [CY24] Hongrui Chen and Lexing Ying. Convergence analysis of discrete diffusion model: Exact implementation through uniformization. arXiv preprint arXiv:2402.08095, 2024.

- [DHW26a] Daniil Dmitriev, Zhihan Huang, and Yuting Wei. Efficient sampling with discrete diffusion models: Sharp and adaptive guarantees. arXiv preprint arXiv:2602.15008, 2026.

- [DHW26b] Daniil Dmitriev, Zhihan Huang, and Yuting Wei. Provably adaptive sampling with uniform and remasking discrete diffusion models. arXiv preprint arXiv:2608.23554, 2026.

- [Die26] Sander Dieleman. Continuous diffusion language models. Blog post, https://sander.ai/2026/08/24/continuous-dlms.html, 2026.

- [Dif26] DiffusionGemma Team. DiffusionGemma technical report. arXiv preprint arXiv:2608.00146, 2026.

- [DSR+22] Sander Dieleman, Laurent Sartran, Arman Roshannai, Nikolay Savinov, Yaroslav Ganin, Pierre H Richemond, Arnaud Doucet, Robin Strudel, Chris Dyer, Conor Durkan, Curtis Hawthorne, Rémi Leblond, Will Grathwohl, and Jonas Adler. Continuous diffusion for categorical data. arXiv preprint arXiv:2211.15089, 2022.

- [EAMS22] Ahmed El Alaoui, Andrea Montanari, and Mark Sellke. Sampling from the Sherrington–Kirkpatrick Gibbs measure via algorithmic stochastic localization. In IEEE Symposium on Foundations of Computer Science (FOCS), 2022.

- [EAMS23] Ahmed El Alaoui, Andrea Montanari, and Mark Sellke. Sampling from mean-field Gibbs measures via diffusion processes. arXiv preprint arXiv:2310.08912, 2023.

- [GDKZ24] Davide Ghio, Yatin Dandi, Florent Krzakala, and Lenka Zdeborová. Sampling with flows, diffusion, and autoregressive neural networks from a spin-glass perspective. Proceedings of the National Academy of Sciences, 121(27):e2311810121, 2024.

- [GVS+23] Kristian Georgiev, Joshua Vendrow, Hadi Salman, Sung Min Park, and Aleksander Madry. The journey, not the destination: How data guides diffusion models. arXiv preprint arXiv:2312.06205, 2023.

- [HJA20] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, 2020.

- [HQL+26] Keya Hu, Linlu Qiu, Yiyang Lu, Hanhong Zhao, Tianhong Li, Yoon Kim, Jacob Andreas, and Kaiming He. ELF: Embedded language flows. arXiv preprint arXiv:2605.10938, 2026.

- [HV93] Te Sun Han and Sergio Verdú. Approximation theory of output statistics. IEEE Transactions on Information Theory, 39(3):752–772, 1993.

- [KLZ+26] Kelvin Kan, Xingjian Li, Benjamin J Zhang, Tuhin Sahai, Stanley Osher, and Markos A Katsoulakis. Vocabulary-size-independent convergence of discrete diffusion models: Adjoint equations induce the right space. arXiv preprint arXiv:2605.17232, 2026.

- [KSK+25] Jaeyeon Kim, Kulin Shah, Vasilis Kontonis, Sham M. Kakade, and Sitan Chen. Train for the worst, plan for the best: Understanding token ordering in masked diffusions. In Aarti Singh, Maryam Fazel, Daniel Hsu, Simon Lacoste-Julien, Felix Berkenkamp, Tegan Maharaj, Kiri Wagstaff, and Jerry Zhu, editors, Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pages 30749–30768. PMLR, 13–19 Jul 2025.

- [LC24] Marvin Li and Sitan Chen. Critical windows: non-asymptotic theory for feature emergence in diffusion models. In Proceedings of the 41st International Conference on Machine Learning, ICML'24. JMLR.org, 2024.

- [LC26] Gen Li and Changxiao Cai. Breaking ar's sampling bottleneck: Provable acceleration via diffusion language models. Advances in Neural Information Processing Systems, 38:11700–11725, 2026.

- [LHL+25] Yuchen Liang, Renxiang Huang, Lifeng Lai, Ness Shroff, and Yingbin Liang. Absorb and converge: Provable convergence guarantee for absorbing discrete diffusion models. arXiv preprint arXiv:2506.02318, 2025.

- [LKC25] Marvin Li, Aayush Karan, and Sitan Chen. Blink of an eye: a simple theory for feature localization in generative models. In Aarti Singh, Maryam Fazel, Daniel Hsu, Simon Lacoste-Julien, Felix Berkenkamp, Tegan Maharaj, Kiri Wagstaff, and Jerry Zhu, editors, Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pages 35047–35080. PMLR, 13–19 Jul 2025.

- [LLLS25] Yuchen Liang, Yingbin Liang, Lifeng Lai, and Ness Shroff. Discrete diffusion models: Novel analysis and new sampler guarantees. In Advances in Neural Information Processing Systems, 2025.

- [LME23] Aaron Lou, Chenlin Meng, and Stefano Ermon. Discrete diffusion modeling by estimating the ratios of the data distribution. arXiv preprint arXiv:2310.16834, 2023.

- [LTG+22] Xiang Lisa Li, John Thickstun, Ishaan Gulrajani, Percy Liang, and Tatsunori B Hashimoto. Diffusion-LM improves controllable text generation. In Advances in Neural Information Processing Systems, 2022.

- [Lu26] Jianfeng Lu. A mathematical introduction to diffusion models. arXiv preprint arXiv:2607.01693, 2026.

- [LYA+26] Chanhyuk Lee, Jaehoon Yoo, Manan Agarwal, Sheel Shah, Jerry Huang, Aditi Raghunathan, Seunghoon Hong, Nicholas M Boffi, and Jinwoo Kim. Flow map language models: One-step language modeling via continuous denoising. arXiv preprint arXiv:2602.16813, 2026.

- [LZ25] Hugo Lavenant and Giacomo Zanella. Error bounds and optimal schedules for masked diffusions with factorized approximations. arXiv preprint arXiv:2510.25544, 2025.

- [MW23] Andrea Montanari and Yuchen Wu. Posterior sampling in high dimension via diffusion processes. arXiv preprint arXiv:2304.11449, 2023.

- [NWZ20] Jonathan Niles-Weed and Ilias Zadik. The all-or-nothing phenomenon in sparse tensor pca. Advances in Neural Information Processing Systems, 33:17674–17684, 2020.

- [NZY+25] Shen Nie, Fengqi Zhu, Zebin You, Xiaolu Zhang, Jingyang Ou, Jun Hu, Jun Zhou, Yankai Lin, Ji-Rong Wen, and Chongxuan Li. Large language diffusion models. arXiv preprint arXiv:2502.09992, 2025.

- [PCRD26] Le-Tuyet-Nhi Pham, Giovanni Conforti, Zhenjie Ren, and Alain Durmus. Discrete flow matching: Convergence guarantees under minimal assumptions. arXiv preprint arXiv:2605.08882, 2026.

- [PSO+25] Le-Tuyet-Nhi Pham, Dario Shariatian, Antonio Ocello, Giovanni Conforti, and Alain Durmus. Bit-level discrete diffusion with Markov probabilistic models: An improved framework with sharp convergence bounds under minimal assumptions. arXiv preprint arXiv:2502.07939, 2025.

- [RA23] Gabriel Raya and Luca Ambrogioni. Spontaneous symmetry breaking in generative diffusion models. Advances in Neural Information Processing Systems, 36:66377–66389, 2023.

- [RCRY25] Yinuo Ren, Haoxuan Chen, Grant Rotskoff, and Lexing Ying. How discrete and continuous diffusion meet: Comprehensive analysis of discrete diffusion models via a stochastic integral framework. In International Conference on Learning Representations, volume 2025, pages 42904–42941, 2025.

- [RCZ+25] Yinuo Ren, Haoxuan Chen, Yuchen Zhu, Wei Guo, Yongxin Chen, Grant M Rotskoff, Molei Tao, and Lexing Ying. Fast solvers for discrete diffusion models: Theory and applications of high-order algorithms. In Advances in Neural Information Processing Systems, 2025.

- [RDE+26] Daan Roos, Oscar Davis, Floor Eijkelboom, Michael Bronstein, Max Welling, Ismail Ilkan Ceylan, Luca Ambrogioni, and Jan-Willem van de Meent. Categorical flow maps. arXiv preprint arXiv:2602.12233, 2026.

- [SAS+24] Subham Sekhar Sahoo, Marianne Arriola, Yair Schiff, Aaron Gokaslan, Edgar Marroquin, Justin T Chiu, Alexander Rush, and Volodymyr Kuleshov. Simple and effective masked diffusion language models. In Advances in Neural Information Processing Systems, 2024.

- [SDG+25] Subham Sekhar Sahoo, Justin Deschenaux, Aaron Gokaslan, Guanghan Wang, Justin Chiu, and Volodymyr Kuleshov. The diffusion duality. In International Conference on Machine Learning, 2025.

- [SDWMG15] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International Conference on Machine Learning, 2015.

- [SE19] Yang Song and Stefano Ermon. Generative modeling by estimating gradients of the data distribution. In Advances in Neural Information Processing Systems, 2019.

- [SFLW24] Antonio Sclocchi, Alessandro Favero, Noam Itzhak Levi, and Matthieu Wyart. Probing the latent hierarchical structure of data via diffusion models. arXiv preprint arXiv:2410.13770, 2024.

- [SFW25] Antonio Sclocchi, Alessandro Favero, and Matthieu Wyart. A phase transition in diffusion models reveals the hierarchical nature of data. Proceedings of the National Academy of Sciences, 122(1):e2408799121, 2025.

- [SHW+24] Jiaxin Shi, Kehang Han, Zhe Wang, Arnaud Doucet, and Michalis K Titsias. Simplified and generalized masked diffusion for discrete data. In Advances in Neural Information Processing Systems, 2024.

- [SLY+26] Subham Sekhar Sahoo, Jean-Marie Lemercier, Zhihan Yang, Justin Deschenaux, Jingyu Liu, John Thickstun, and Ante Jukic. Scaling beyond masked diffusion language models. arXiv preprint arXiv:2602.15014, 2026.

- [SSDK+21] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

- [SSP+25] Yair Schiff, Subham Sekhar Sahoo, Hao Phung, Guanghan Wang, Sam Boshar, Hugo Dallatorre, Bernardo P de Almeida, Alexander Rush, Thomas Pierrot, and Volodymyr Kuleshov. Simple guidance mechanisms for discrete diffusion models. In International Conference on Learning Representations, 2025.

- [Vin11] Pascal Vincent. A connection between score matching and denoising autoencoders. Neural Computation, 23(7):1661–1674, 2011.

- [Wai26a] Martin J Wainwright. The data geometry of masking diffusion: Certified-optimal schedules via unmasking growth complexity. arXiv preprint arXiv:2608.13520, 2026.

- [Wai26b] Martin J Wainwright. The information geometry of product-reference discrete diffusion: Interaction growth complexity and optimal scheduling. arXiv preprint arXiv:2608.28949, 2026.

- [Wib25] Andre Wibisono. Mixing time of the proximal sampler in relative Fisher information via strong data processing inequality (extended abstract). In Nika Haghtalab and Ankur Moitra, editors, Proceedings of Thirty Eighth Conference on Learning Theory, volume 291 of Proceedings of Machine Learning Research, pages 5716–5717. PMLR, 30 Jun–04 Jul 2025.

- [WSSK26] Guanghan Wang, Yair Schiff, Subham Sahoo, and Volodymyr Kuleshov. Remasking discrete diffusion models with inference-time scaling. Advances in Neural Information Processing Systems, 38:147282–147339, 2026.

- [XP26] Zhiyang Xun and Eric Price. Query lower bounds for diffusion sampling. arXiv preprint arXiv:2604.10857, 2026.

- [YGG+25] Jiacheng Ye, Jiahui Gao, Shansan Gong, Lin Zheng, Xin Jiang, Zhenguo Li, and Lingpeng Kong. Beyond autoregression: Discrete diffusion for complex reasoning and planning. In International Conference on Learning Representations, volume 2025, pages 77875–77898, 2025.

- [ZC26] Yunxiao Zhao and Changxiao Cai. Adaptation to intrinsic dependence in diffusion language models. arXiv preprint arXiv:2602.20126, 2026.

- [ZCG25] Zikun Zhang, Zixiang Chen, and Quanquan Gu. Convergence of score-based discrete diffusion models: A discrete-time analysis. In International Conference on Learning Representations, 2025.

**本页范围与校对状态：** 本页为**全结构性译文**：全部定义/引理/定理陈述 + 主要公式 + 证明架构；逐式证明与附录 B 以结构化摘要呈现，未逐式全译。具体覆盖：摘要；第 1 节（引言、评测框架、结果 1/2、关键窗口机制、并发工作、相关工作、全文组织）；第 2 节（2.1 均匀扩散、2.2 高斯扩散、2.3 掩码扩散、2.4 信息论量，含定义 2.2/2.5/2.7/2.9 与引理 2.1/2.3/2.4/2.6/2.8/2.10 的完整陈述与式（1）（2））；第 3 节（定理 3.1、引理 3.2 及 3.1—3.3 证明架构）；第 4 节（定理 4.1、变元 u=e^{2t}-1 与式（14）、4.1—4.4 证明架构）；第 5 节（定义 5.1、$\kappa$ 区间与码本、I_unif/I_gauss、关键时间式（22）与 I_0 式（23））；第 6 节（定理 6.1、命题 6.4、6.2/6.3 定位与穿越策略）；第 7 节（定理 7.1、式（56）参考分布、命题 7.4）；第 8 节（定理 8.1、命题 8.6、8.1 对抗性预言机与 8.2 不可区分性证明要点）；第 9 节“Outlook”（本页标题作“结论与展望”）全文（含致谢与 AI 使用声明）；附录 A（定理 A.1、$\mathcal K_d^U$ 构造、式（106）（107）（109）—（112））；附录 B（延后证明的对象清单，未逐式）；主定理 1.1—1.4、3.1、4.1、6.1、7.1、8.1 与 A.1 的结论均按原文逐字改写、未作弱化；图 1—4 中文图注；参考文献 [ABBM26]—[ZCG25] 全表（按字母序，59 条）。**逐句逐式终校未做**；正文各引理/命题的完整证明（正文中约 40 余页的逐式推导）与附录 B 的 deferred proofs 未逐式翻译，仅保留证明架构与关键量；原文无表格（无表格渲染核对项）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①原文第 5 节记号 $\mathcal K_d^M$（掩码）与本页附录 A 的 $\mathcal K_d^U$（均匀）分属不同构造，已按原编号区分；②原文定理 6.1/7.1 的 $\Lambda$ 分别标为式（24）与式（54），两处形式相同，照原文分别保留。如后续需要逐式全译，建议另开子任务（§2—§4、§5—§7、§8—§9+A、附录 B 分别建页）。本页为全结构性译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
