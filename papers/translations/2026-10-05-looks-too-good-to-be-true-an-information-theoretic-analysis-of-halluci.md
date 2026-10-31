---
layout: page
title: "看起来好得不像真的：生成式恢复模型幻觉的信息论分析｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-05-looks-too-good-to-be-true-an-information-theoretic-analysis-of-halluci/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/56dea3a0c21f4696/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 看起来好得不像真的：生成式恢复模型幻觉的信息论分析

**原题：** Looks Too Good To Be True: An Information-Theoretic Analysis of Hallucinations in Generative Restoration Models  
**作者：** Regev Cohen、Idan Kligvasser、Ehud Rivlin、Daniel Freedman  
**单位：** Verily AI（Google Life Sciences），以色列；邮箱：regevcohen@google.com。  
**版本：** 会议论文集版本（NeurIPS-2024-looks-too-good-to-be-true-an-information-theoretic-analysis-of-hallucinations-in-generative-restoration-models-Paper-Conference.pdf，第 38 届神经信息处理系统大会（NeurIPS 2024）），本地 PDF 28 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 中文译稿：摘要、第 1—8 节（引言、相关工作、问题表述、不确定性—感知折中、实验、结论、局限、更广泛影响）、图 1—6 中文图注、表 1 逐格转录、附录 A—H 结构化译文（含信息论预备、表 1 全部闭式公式、各定理证明要点）、参考文献 [1]—[88]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(10) 按原文保留。**口径说明：** 正文（第 1—8 节）为完整翻译；附录 A—H 约 14 页以逐式推导为主，采用结构化译文（保留定义、引理与证明要点），未逐式全译。原文为 NeurIPS 2024 会议论文，版权与再传播许可待核验，本页不作可公开全文登记。逐句逐式终校未做。

## 摘要

对高感知质量的追求推动了图像恢复领域革命性的生成模型发展，这些模型能够产生常常在视觉上无法与真实数据区分的结果。然而，随着其感知质量持续提升，这些模型也表现出日益增长的**幻觉（hallucination）**倾向——即生成看起来真实、但在真值图像中并不存在的细节。生成模型中的幻觉使人们对其可靠性产生疑虑，引发对其实际应用的重大关切。本文从**信息论**视角研究该现象，揭示**不确定性（uncertainty）与感知（perception）之间的根本折中**。我们严格分析二者的关系，证明生成模型的**全局最小不确定性随感知提升而同步增长**。特别地，我们定义了恢复问题的**固有不确定性（inherent uncertainty）**，并证明达到完美感知质量至少需要两倍于该不确定性的不确定性。此外，我们建立了失真、不确定性与感知之间的关系，并据此证明上述不确定性—感知折中**蕴含**了著名的感知—失真折中（perception-distortion tradeoff）。我们用超分辨与图像修复（inpainting）算法实验验证了理论发现。本工作揭示了生成模型在图像恢复中同时实现高感知质量与可靠预测的根本局限，旨在提高从业者对这一固有折中的认识，使其能够作出知情决策，并可能把安全性置于感知性能之上。

（图 1 见"图注"一节。）

## 1 引言

恢复任务与逆问题影响众多科学与工程学科以及医疗、教育、通信与艺术领域。生成式人工智能 [80, 38, 10] 因其前所未有的推断缺失信息与恢复受损数据的能力，改变了逆问题领域。在图像恢复中，对高感知质量的追求催生了新一代生成模型，它们能产生极为逼真、几乎无法与真实图像区分的输出。

这些模型虽然强大，但越来越多的经验证据表明其易产生幻觉 [30]：生成看似真实、却偏离原始输入数据的内容，妨碍对忠实性至关重要的应用。幻觉的根源在于恢复问题的**不适定性（ill-posedness）**：多种可能解都能解释观测测量，导致估计过程中的不确定性。

围绕幻觉的担忧推动了**不确定性量化（uncertainty quantification）**方法的发展，用以评估生成输出的可靠性。这些方法提供关于模型预测置信度的关键洞见，使用户能够评估潜在偏离并作出知情决策。尽管有这些进展，**实现高感知质量与不确定性程度之间的关系仍研究不足**。

本文建立不确定性与感知之间的理论关系，通过严格分析证明生成模型的全局最小不确定性随目标感知质量水平而增加（见图 1）。借助信息论，我们用**恢复误差的熵**量化不确定性 [19]，用真实图像与恢复图像分布之间的**条件散度**度量感知质量 [58]。主要贡献如下。

1. 我们给出逆问题**固有不确定性 $U_{\text{Inherent}}$** 的定义，并构造**不确定性—感知（uncertainty-perception, UP）函数**——给定感知指标下可达到的最小不确定性。我们证明 UP 函数全局下界为 $U_{\text{Inherent}}$（定理 1）。
2. 我们证明：在任何底层数据分布、恢复问题或模型下，不确定性与感知之间存在**根本折中**（定理 1）。具体地，恢复误差的**熵功率**有一个与真实图像和恢复图像分布之间 Rényi 散度成反比的下界（定理 3），表明完美感知质量至少需要两倍于固有不确定性 $U_{\text{Inherent}}$ 的不确定性。
3. 我们建立不确定性与**均方误差（MSE）失真**之间的关系，证明不确定性—感知折中蕴含著名的**失真—感知折中** [14]（定理 4）。
4. 我们通过图像超分辨与图像修复实验（第 5 节）对全部理论发现进行实证验证，覆盖广泛的恢复算法、评价指标与数据分布；图像修复的实验结果见图 2。

我们旨在让从业者更深入理解不确定性与感知质量之间的折中，使其能够策略性地把握平衡，在真实、敏感应用中部署生成模型时优先考虑安全性。

## 2 相关工作

近期图像恢复研究在**感知质量评估**与**不确定性量化**两方面都取得了显著进展，但二者大体相互独立。下文概述这两类研究的主要趋势，为我们的框架奠定基础。

**感知量化。** 恢复任务中的感知质量涵盖人对输出结果的感知，包括视觉保真度、与原始图像的相似性以及无伪影程度。PSNR、SSIM [82] 等传统指标捕捉基本相似性，但忽略更精细的细节与更高层结构；LPIPS [87]、VGG-loss [72]、DISTS [22] 等学习型指标有所改进，但仍在像素或图像块层面操作，可能忽略整体特性。近期研究者利用 DINO [17]、CLIP [62] 等大型视觉模型的图像级嵌入来捕捉高层相似性；HyperIQA [74] 利用自适应超网络在野外条件下盲评估图像质量，LIQE [88] 与 QAlign [84] 则利用大语言模型捕捉恢复图像与原始图像之间的高层语义相似性与对齐。这里我们沿用先前工作 [58, 14, 31]，采用**概率密度间散度**这一数学意义上的感知质量定义。

**不确定性量化。** 不确定性量化技术大致可分为两派：贝叶斯估计与频率派方法。贝叶斯范式通过假设模型参数和/或激活函数上的分布来定义不确定性 [1]，最常用的贝叶斯神经网络 [52, 78, 34] 是用贝叶斯推断训练的随机模型。为提升效率，已发展出蒙特卡洛 dropout [24, 25]、随机梯度 Markov 链 Monte Carlo [67, 18]、Laplace 近似 [63] 与变分推断 [16, 51, 60] 等近似方法；其他贝叶斯技术包括深度高斯过程 [20]、深度集成 [7, 33] 与深度贝叶斯主动学习 [26]。与贝叶斯方法相反，频率派方法假设模型参数固定、不存在底层分布，其无分布技术包括模型集成 [44, 59]、bootstrap [36, 2]、区间回归 [59, 37, 83] 与分位数回归 [27, 64]。近年新兴的是**保形预测（conformal prediction）** [3, 70]，它利用带标签的校准数据集把点估计转为预测区域；保形方法无需重训练、计算高效，并在有限样本下提供覆盖率保证 [49]，相关研究包括保形分位数回归 [64, 69, 6]、保形风险控制 [5, 8, 4] 以及生成对抗网络的语义不确定性区间 [68]。文献 [42] 提出保形预测掩码的概念——带严格统计保证的可解释图像掩码，突出恢复图像中高不确定性区域；无分布保形预测方法的综述见 [75]。近期方法 [11] 提出考虑图像内空间关系的主成分不确定性量化，给出以用户指定置信概率包含真实未见图象的不确定性区间。尽管上述研究提供了多种不确定性量化途径，图像恢复背景下不确定性与感知关系的严格分析仍研究不足。

**失真—感知折中。** 与本文最相关的是失真—不确定性折中 [14] 及其后续 [23, 15, 13]。[14] 的关键发现是图像恢复中感知质量与失真之间存在凸折中，且适用于任意失真度量与分布；此外，完美感知质量至多以 PSNR 下降不超过 3dB 为代价。[23] 把该结果推广，给出以 MSE 失真与 Wasserstein-2 距离分别作为失真与感知度量时的闭式折中表达式。[58] 表明任何确定性估计器的 Lipschitz 常数在接近完美感知时趋于无穷。

本文独特地强调图像恢复中的**不确定性**，并将其与失真区分：失真度量恢复图像与原图的接近程度，不确定性量化对恢复本身的置信度。这一区分对决策至关重要——高不确定性会妨碍知情选择——并与现有感知质量与鲁棒性研究互补。

## 3 问题表述

我们采用贝叶斯视角处理逆问题：从观测（另一随机向量 $Y=M(X)\in\mathbb R^{d'}$）中恢复随机向量 $X\in\mathbb R^d$，其中 $M:\mathbb R^d\to\mathbb R^{d'}$ 为**不可逆**退化函数，意味着 $X$ 无法由 $Y$ 完美恢复。形式上：

**定义 1.** 若对 $Y$ 的分布 $p_Y$ 支撑中的几乎每个 $y$，条件概率 $p_{X\mid Y}(\cdot|y)$ 为 Dirac delta 函数，则称退化函数 $M$ 为**可逆的**。

恢复过程构造估计器 $\hat X\in\mathbb R^d$ 以从 $Y$ 估计 $X$，诱导条件概率 $p_{\hat X\mid Y}$。估计过程构成 Markov 链 $X\to Y\to\hat X$，意味着给定 $Y$ 时 $X$ 与 $\hat X$ 统计独立。

本文从**感知**与**不确定性**两项性能准则分析估计器 $\hat X$。为评估感知质量，我们沿用 [85, 14] 的理论思路，用 $X$ 与 $\hat X$ 之间的条件散度度量感知：

$$
D_v\left(X,\hat X\;\middle|\;Y\right)\triangleq\mathbb E_{y\sim p_Y}\left[D_v\left(p_{X\mid Y=y},p_{\hat X\mid Y=y}\right)\right],\tag{1}
$$

其中 $D_v$ 表示一般散度函数。当估计器在上述指标上取值较低时，称其具有高感知质量。不确定性方面，已有多种实用量化方法 [28, 1]；但本文旨在把握不确定性的**根本**含义，因此采用信息论中的**熵功率**概念，它评估随机变量的统计散布程度（熵功率定义与相关背景见附录 B）。利用熵功率，我们形式化定义恢复问题内在固有的不确定性如下。

**定义 2.** 从 $Y$ 估计 $X$ 的**固有不确定性**定义为

$$
U_{\text{Inherent}}\triangleq\mathcal N(X\mid Y)=\frac{1}{2\pi e}e^{\frac{2}{d}h(X\mid Y)},
$$

其中 $h(X\mid Y)$ 表示给定 $Y$ 时 $X$ 的熵。固有不确定性量化观测过程中不可挽回地损失的信息，构成从 $Y$ 恢复 $X$ 的根本极限，与估计方法无关。值得注意的是，当退化过程可逆时，该固有不确定性为零 $U_{\text{Inherent}}=0$，反映以完全置信度完美恢复 $X$ 的可能性。

下面转向本文的主要研究对象——**不确定性—感知（UP）函数**：

$$
U(P)\triangleq\min_{p_{\hat X\mid Y}}\left\{\mathcal N(\hat X-X\mid Y):D_v\left(X,\hat X\;\middle|\;Y\right)\leq P\right\}.\tag{2}
$$

本质上，$U(P)$ 表示在观测 $Y$ 所含边信息下、感知质量至少为 $P$ 的估计器所能达到的最小不确定性。与感知—失真函数 [14] 不同，上述目标优先关注误差信号的**信息含量**而非其能量，其最小化促使误差集中，从而带来稳健可靠的预测。下例给出该函数典型行为的直观理解。

**例 1.** 考虑 $Y=X+W$，$X\sim\mathcal N(0,1)$ 与 $W\sim\mathcal N(0,\sigma^2)$ 相互独立。设感知度量为对称 Kullback–Leibler（KL）散度 $D_{\text{SKL}}$，并假设随机估计器形如 $\hat X=\mathbb E[X\mid Y]+Z$，其中 $Z\sim\mathcal N(0,\sigma_z^2)$ 与 $Y$ 独立。如附录 C 所推导，此时 UP 函数有闭式表达

$$
U(P)=\mathcal N(X\mid Y)\left[1+\left(P+1-\sqrt{(P+1)^2-1}\right)^2\right],\qquad \mathcal N(X\mid Y)=\frac{\sigma^2}{1+\sigma^2}.
$$

该结果（附录 C 图示）表明最小可达到的不确定性随感知质量提升而增加；并且提示 UP 函数 $U(P)$ 的结构根本上依赖于固有不确定性 $\mathcal N(X\mid Y)$。值得注意的是，下一节将表明这种依赖关系可推广到本例之外，其具体形式由底层分布与所用感知度量共同决定。

**注.** 也可考虑如下替代表述：

$$
\tilde U(P)\triangleq\min_{p_{\hat X\mid Y}}\left\{\mathcal N(\hat X-X):D_v\left(X,\hat X\;\middle|\;Y\right)\leq P\right\}.\tag{3}
$$

该替代目标把不确定性量化为误差的熵功率，与边信息 $Y$ 无关。它虽有启发性，但可能高估不确定性，因为 $\mathcal N(\hat X-X\mid Y)\leq\mathcal N(\hat X-X)$，等号成立当且仅当误差 $E=\hat X-X$ 与 $Y$ 独立。虽然值得进一步研究，我们猜测（3）的行为与 UP 函数（2）相近，下一节将详细考察。

## 4 不确定性—感知折中

至此我们已表述 UP 函数并阐明其基本理由。接下来推导其关键性质，包括以 Rényi 散度作为感知度量时的详细分析；随后建立 UP 函数与著名失真—感知折中之间的直接联系；最后通过图像超分辨实验演示理论发现。

### 4.1 不确定性—感知平面

下述定理给出 UP 函数 $U(P)$ 的一般性质，与具体分布和散度选择无关。

**定理 1.** UP 函数 $U(P)$ 具有以下性质：

1. **拟线性（单调不增且连续）：** 对任意 $\lambda\in[0,1]$，
$$
\min\left\{U(P_1),U(P_2)\right\}\leq U\left(\lambda P_1+(1-\lambda)P_2\right)\leq\max\left\{U(P_1),U(P_2)\right\}.
$$
2. **有界性：** $\mathcal N(X\mid Y)\leq U(P)\leq 2\mathcal N(X_G\mid Y)$，其中 $X_G$ 为与 $X$ 协方差相同的零均值高斯随机变量。固有不确定性上界为 $\mathcal N(X_G\mid Y)$，取决于 $X$ 偏离高斯性的程度。

该定理确立了图像恢复中感知质量与不确定性之间的根本折中，与具体散度、数据分布或恢复模型无关。该折中根本上与观测过程信息损失造成的固有不确定性 $\mathcal N(X\mid Y)$ 相联系。值得注意的是，上界可写为

$$
\mathcal N(X_G\mid Y)=\mathcal N(X\mid Y)e^{\frac{2}{d}D_{\mathrm{KL}}(X,X_G\mid Y)}.\tag{4}
$$

这表明当 $X$ 趋近高斯性时，$\mathcal N(X\mid Y)$ 趋近 $\mathcal N(X_G\mid Y)$；但同时它一般意味着 $\mathcal N(X\mid Y)$ 取值更高（见附录 B 引理 1）。由此得到令人惊讶的洞见：**对多元高斯分布，完美感知质量恰好以两倍于问题的固有不确定性为代价**。

接下来表明：对固定感知指标 $P$，最优算法位于约束集边界上。这有利于优化，因为把搜索空间限制到边界点。

**定理 2.** 假设 $D_v(X,\hat X\mid Y)$ 对其第二个参数是凸的。则对任意 $P\geq0$，最小值在 $D_v(X,\hat X\mid Y)=P$ 的边界上取得。

注意 $D_v$ 对第二参数为凸这一假设并不严格：多数常用散度、尤其是所有 $f$-散度（如 KL 散度、全变差距离、Hellinger 距离与卡方散度）都具备该性质。

上述定理描述 UP 函数的重要特性，但更深入的洞见需要额外假设。因此我们聚焦 **Rényi 散度**作为感知度量。Rényi 散度是由阶数 $0\leq r$ 参数化的一族散度函数，包含 KL 散度作为 $r=1$ 的特例；它在贝叶斯估计器分析与众多信息论计算中起关键作用 [79]，并与其他概率统计距离（如 Wasserstein 与 Hellinger 距离）密切相关。取 $r=1/2$ 的情形：

$$
U(P)=\min_{p_{\hat X\mid Y}}\left\{\mathcal N(\hat X-X\mid Y):D_{1/2}\left(X,\hat X\;\middle|\;Y\right)\leq P\right\}.\tag{5}
$$

虽然为便于推导取 $r=1/2$，但需注意所有阶 $r\in(0,1)$ 都是**等价**的（见附录 B）。因此，鉴于该等价性以及 Rényi 散度与其他度量的密切关系，分析（5）这一具体表述可为广泛散度族提供有价值的洞见。下述定理给出 UP 函数的上下界。

**定理 3.** UP 函数被限制在如下区域内：

$$
\eta(P)\cdot\mathcal N(X\mid Y)\leq U(P)\leq\eta(P)\cdot\mathcal N(X_G\mid Y),
$$

其中 $1\leq\eta(P)\leq2$ 是关于感知指标的凸函数，由下式给出：

$$
\eta(P)=\left(2e^{\frac{2P}{d}}-\sqrt{\left(2e^{\frac{2P}{d}}-1\right)^2-1}\right).
$$

值得注意的是，定理 3 无论 $X$ 与 $Y$ 的底层分布如何都成立，从而用感知给出了 UP 函数的**普适**刻画。此外，如图 3 所示，定理 3 导出**不确定性—感知平面**，把空间划分为三个区域：(1) **不可能区域**，任何估计器都无法到达；(2) **最优区域**，包含所有按（5）最优的估计器；(3) **次优区域**，包含不确定性过高的估计器。不可能区域的存在突出了不确定性—感知折中，证明没有任何估计器能同时实现高感知与低不确定性。这一发现强调从业者认识该折中的重要性，使其在感知质量与不确定性之间取舍时能作出知情决策；不确定性—感知平面可作为评估估计器性能的有价值框架——尽管并非完备指标，它可提示可改进之处，引导从业者找到感知与不确定性之间更理想平衡的估计器。对位于次优区域的某些估计器，可能在不牺牲感知质量的前提下实现更低不确定性。因此我们认为，所提不确定性—感知平面可作为进一步研究与实际应用的有价值起点，最终推动更安全可靠的图像恢复算法。

接下来分析数据维数如何影响不确定性—感知折中。为此把 $\eta(P)$ 扩展为含维数参数的形式 $\eta(P;d)$。如图 4 所示，$\eta(P;d)$ 随感知提升快速上升，且在高维下取值更高。这表明在高维设定中不确定性—感知折中更严重，即算法感知的任何边际改善都伴随不确定性的剧烈增加。

最后我们**猜测**：定理 3 中不等式给出的一般折中形式对不同散度度量都成立，$\eta(P)$ 的具体形式刻画各度量之细微差别。例如以 Hellinger 距离为感知度量，可得到与定理 3 相同的不等式，但 $\eta(P)$ 对 $0\leq P\leq1$ 定义为

$$
\eta_{\text{Hellinger}}(P)=\frac{2}{(1-P)^{4/d}}-\sqrt{\left(\frac{2}{(1-P)^{4/d}}-1\right)^2-1}.\tag{6}
$$

（$P=1$ 情形由极限 $\lim_{P\to1}\eta(P)=1$ 得到。）

### 4.2 重访失真—感知折中

在建立不确定性—感知折中及其特性后，我们扩展分析到估计失真，尤其是均方误差。估计理论中一个著名结果：对任意随机变量 $X$ 与基于边信息 $Y$ 的任意估计器 $\hat X$，有 [19]

$$
\mathbb E\left[\|\hat X-X\|^2\right]\geq\frac{1}{2\pi e}e^{2h(X\mid Y)}.\tag{7}
$$

该不等式与不确定性原理相关，是任何估计器可达最小 MSE 的根本极限；但它未考虑 $\hat X$ 的估计不确定性，因为右端与 $\hat X$ 无关。因此我们在下述定理中推广之。

**定理 4.** 对任意随机变量 $X$、观测 $Y$ 与无偏估计器 $\hat X$，有

$$
\frac1d\mathbb E\left[\|\hat X-X\|^2\right]\geq\mathcal N\left(\hat X-X\;\middle|\;Y\right).
$$

注意对任意估计器 $\hat X$ 有 $\mathcal N(\hat X-X\mid Y)\geq\mathcal N(X\mid Y)$，故

$$
\frac1d\mathbb E\left[\|\hat X-X\|^2\right]\geq\mathcal N(X\mid Y)=\frac{1}{2\pi e}e^{\frac{2}{d}h(X\mid Y)}.\tag{8}
$$

该结果与（7）一致，表明定理 4 是（7）的推广，同时纳入估计的不确定性。进一步把估计器 $\hat X$ 视为感知指标 $P$ 的函数，可得如下推论。

**推论 1.** 定义如下失真—感知函数

$$
D(P)\triangleq\min_{p_{\hat X\mid Y}}\left\{\frac1d\mathbb E\left[\|\hat X-X\|^2\right]:D_v\left(X,\hat X\;\middle|\;Y\right)\leq P\right\}.
$$

则对任意感知指标 $P$ 有 $D(P)\geq U(P)$。

由于不确定性随感知改善而增加，该推论意味着失真也增加。因此，当以 MSE 为失真度量时，不确定性—感知折中**诱导**出失真—感知折中 [14]，为这一著名现象提供了新解释。

## 5 实验

**设置。** 我们的理论框架以实证观察为基础，因此在常见基准任务——图像超分辨与图像修复——上验证发现。我们从不确定性视角分析性能，同时使用既有感知质量与失真度量。感知质量采用 HyperIQA [74]、LIQE [88] 与 Q-ALIGN [84] 等最先进指标；失真采用 MSE、峰值信噪比（PSNR）与结构相似性指标（SSIM）[82]。在高维空间准确估计熵存在显著挑战 [46]，因此我们使用不确定性的上界 $\mathcal N(\hat X_G-X_G\mid Y)$（详见附录 F）；这一实用替代把计算简化为计算误差协方差奇异值的几何平均。

对超分辨，我们使用 BSD100 基准数据集 [55]，目标是从 4× 双三次下采样所得低分辨图像预测高分辨图像。评估覆盖多种恢复算法，包括 EDSR [50]、ESRGAN [81]、SinGAN [71]、SANGAN [39]、DIP [77]、SRResNet/SRGAN 变体 [47]、EnhanceNet [66] 以及参数 $\beta\in[0,1]$ 的潜扩散模型（LDM）[65]（$\beta=0$ 对应 DDIM [32]，$\beta=1$ 对应 DDPM [73]）。图像修复使用 SeeTrue 数据集 [86]——一个以真实与合成图文对多样性著称的图文对齐基准；这里我们聚焦扩散模型，因其性能最先进且在领域内日益流行。

**结果。** 图 5 给出超分辨分析：如顶行所示，在各种感知度量下，右下角都存在不可达的空白区域，表明没有模型能同时实现低不确定性与高感知质量；此外该区域附近出现反相关——感知质量的适度提升带来不确定性的剧烈增加，提示不确定性与感知之间存在折中。底行展示不确定性与失真在各种度量下的强关系，表明不确定性任何增加都会导致失真显著上升。图 6 在图像修复上呈现类似趋势，与超分辨分析一致，强化了发现跨恢复任务与数据分布的有效性。图 2 进一步以感知质量排序展示若干算法的输出，清晰表明随感知质量提升，幻觉（不确定性）与失真同时增加。最后，附录 H 给出通过高维统计量直接估计得到的额外结果，进一步支持理论分析。

## 6 结论

本文建立了生成式恢复中的**不确定性—感知折中**，表明高感知质量导致幻觉（不确定性）增加，在高维下尤为明显。我们刻画了该折中及其与问题固有不确定性的根本联系，引入不确定性—感知平面以指导从业者理解估计器性能；通过把分析扩展到 MSE 失真，我们证明失真—感知折中是**不确定性—感知折中的直接推论**。实验结果证实了理论发现，凸显该折中在图像恢复中的重要性。

## 7 局限

我们的分析以**熵**作为不确定性度量的理论框架为基础。信息论为量化数据中的不确定性与依赖关系、处理多变量与异构数据类型、捕捉复杂模式提供了强大框架；但其更广泛采用受限于高维信息论量的估计难题——维数灾难使精确密度估计不可行 [12, 48]，许多人因此依赖更简单的二阶统计量。

高维数据统计量估计的实用工具仍是活跃研究方向 [76]。早期方法假设指数族分布（如高斯）以便解析计算 [57]，但对长尾分布性能退化；KDE 与 kNN 估计器等分箱策略类的非参数方法 [61, 40, 29] 更灵活，但依赖数据且对参数选择敏感；其他途径包括集成估计 [43] 或 von Mises 展开 [35]（分布类比于 Taylor 展开）。基于旋转的迭代高斯化 [46] 通过把数据变换到多元高斯域来简化密度估计，是有前景的方向，但受计算挑战（基于主成分/独立成分分析学习旋转）限制，其在图像上的应用仅限于小图像块；近期扩展利用卷积旋转实现整图高效处理 [45]。虽然准确估计高维熵仍是活跃研究领域，第 5 节使用了一个可处理的上界；这一替代方案值得进一步研究其在不确定性量化与算法性能分析中的潜力。此外，把该界纳入新算法设计可实现对不确定性—感知折中的显式控制，可能带来更可靠的解。

最后，我们的实证验证聚焦图像超分辨与图像修复这两大基准问题；但分析适用于任何具有不可逆退化的恢复任务，因此把实验扩展到其他图像到图像任务以及音频、视频、文本等域可能揭示更广泛的意义与应用。

## 8 更广泛影响

本工作揭示的图像恢复中不确定性与感知的根本折中具有重要社会影响。医疗与自主系统等领域的开发者常把前沿模型集成到应用中，优先追求最先进性能与感知质量；本工作旨在突出常被忽视的关键因素——不确定性与感知之间的固有折中。通过提高对该折中的认识，我们使开发者能作出知情决策，把安全与可靠性置于纯粹的感知提升之上。例如在医疗中，潜在恢复算法可通过在不确定性—感知平面上绘图来评估，便于识别对特定临床需求达到最优平衡的方法。此外，理解这一固有折中后，从业者可考虑以性能换取更好的安全性与对潜在误用、误解的韧性。

虽然本工作主要是理论性的，我们的分析给出了实用的不确定性（熵）度量，并在实验中用于直观与定量说明发现。该可处理的不确定性度量（或任何可微替代）可纳入 GAN 等生成模型训练时的损失函数，或作为引导扩散模型反向过程的优化目标，从而发展显式优化不确定性与感知折中的算法。

## 图注与表注

### 表 1：多元高斯分布的闭式公式（原 PDF 第 16 页）

| 分布 | 量 | 闭式表达式 |
|---|---|---|
| $X\sim\mathcal N(\mu_x,\Sigma_x)$ | $h(X)$ | $\frac12\ln\left\{(2\pi e)^d|\Sigma_x|\right\}$ |
| $X\sim\mathcal N(\mu_x,\Sigma_x)$ | $\mathcal N(X)$ | $|\Sigma_x|^{1/n}$ |
| $X\sim\mathcal N(\mu_x,\Sigma_x)$ | $h_{\frac12}(X)$ | $\frac12\ln\left\{(8\pi)^d|\Sigma_x|\right\}$ |
| $X\sim\mathcal N(\mu_x,\Sigma_x)$，$Y\sim\mathcal N(\mu_y,\Sigma_y)$ | $D_{1/2}(X,Y)$ | $\frac14(\mu_x-\mu_y)^T\left(\frac{\Sigma_x+\Sigma_y}{2}\right)^{-1}(\mu_x-\mu_y)+\ln\left(\frac{\left|\frac{\Sigma_x+\Sigma_y}{2}\right|}{\sqrt{|\Sigma_x||\Sigma_y|}}\right)$ |

> **表 1 原文疑点：** 第 2 行熵功率写作 $|\Sigma_x|^{1/n}$（原 PDF 渲染图确认为 $1/n$），按信息论中熵功率的定义应为 $|\Sigma_x|^{1/d}$（$d$ 为维数）。本页照原 PDF 转录，未擅自改动，已在页尾状态段标注。

### 图注

**图 1（原 PDF 第 1 页）：** 定理 3 的图示。在恢复任务中，最小可达不确定性由一个函数下界，该函数从问题的固有不确定性 $U_{\text{Inherent}}$（定义 2）出发，随恢复接近完美感知质量而逐渐增至该值的两倍（纵轴：不确定性下界；横轴：感知；标注"更优"的两个方向与"不可能区域"）。

**图 2（原 PDF 第 2 页）：** 图像修复结果。算法按感知从低到高排序（从左到右），可见相应的幻觉与失真同时增加（详见第 5 节）。

**图 3（原 PDF 第 7 页）：** 不确定性—感知平面（定理 3）。不可能区域展示了感知与不确定性之间的固有折中；其他区域可引导从业者找到更好平衡二者的估计器，并提示潜在改进空间（横轴 $D_{1/2}(X,\hat X|Y)$，纵轴不确定性；标注 $\mathcal N(X|Y)$、$2\mathcal N(X|Y)$、$2\mathcal N(X_G|Y)$ 以及次优/最优/不可能区域）。

**图 4（原 PDF 第 7 页）：** 维数的影响（如定理 3 所示）：不确定性—感知折中在高维下加剧，意味着算法感知质量的微小改善也可能以不确定性显著增加为代价（曲线对应 $d=64,128,256,512,1024,2048$，横轴为感知指标 $P$，纵轴为 $\eta(P;d)$）。

**图 5（原 PDF 第 9 页）：** 超分辨算法的评估。上排：不同感知度量（LIQE、QALIGN、HYPERIQA）下的不确定性—感知平面，展示感知质量与不确定性（纵轴）之间的折中；下排：不确定性—失真平面，展示不确定性与各种失真度量（PSNR、SSIM、MSE）之间的关系。上下两排坐标轴位置不同，以突出不确定性所扮演的不同角色（图例包含 Bicubic、DDIM、DIP、EDSR、ESRGAN、EnhanceNet、DDPM、LDM0.2/0.5/0.7、SANGAN、SRGAN-VGG22/54、SRResNet-MSE/VGG22、SinGAN）。

**图 6（原 PDF 第 10 页）：** 潜扩散模型（LDM）在图像修复上的评估，突出不确定性与感知质量之间的折中（上排）以及不确定性与失真的关系（下排）。没有模型能同时实现低不确定性与高感知质量，不确定性越高通常失真越大；不同坐标轴安排强调不确定性的不同角色（图例为 DDIM、LDM0.1—0.9、DDPM）。

## 附录 A—H：结构化译文

以下按原文附录顺序给出各附录的定义、引理与证明要点。原文附录 A—H 约 14 页、以逐式推导为主，本页对附录采用**结构化译文**（保留定义、引理与证明脉络，未逐式全文翻译），此为与"全文"口径的已知差异，见页尾状态段。

### 附录 A：条件散度与人类感知

在我们的设定中，感知被定义为人类观察者成功区分"自然图像与退化图像对"（从 $p_{X,Y}$ 抽取）和"恢复图像与退化图像对"（从 $p_{\hat X,Y}$ 抽取）的概率 $p_{\text{success}}$。从贝叶斯视角，最大化 $p_{\text{success}}$ 的最优判决规则给出 [56, 第 2 节]：

$$
p_{\text{success}}=\frac12+\frac12D_{\text{TV}}\left(p_{X,Y},p_{\hat X,Y}\right),
$$

其中 $D_{\text{TV}}$ 为全变差（total variation）距离。当 $D(p_{X,Y},p_{\hat X,Y})=0$ 时，两对分布不可区分（$p_{\text{success}}=0.5$），意味着完美感知质量。我们把该关系从全变差距离推广到任意条件散度，并指出"哪种散度最贴近人类感知"仍为开放问题。

### 附录 B：信息论预备

为使论文自足，这里简要回顾信息论的基本定义与结果。设 $X$、$Y$、$Z$ 为连续随机变量，概率密度分别为 $p_X(x)$、$p_Y(y)$、$p_Z(z)$；概率密度函数的空间记为 $\Omega$。假设下述含积分的量良定义且有限。

**定义 3（熵）.** 支撑集为 $S_X$ 的 $X$ 的微分熵定义为 $h(X)\triangleq-\int_{S_X}p_X(x)\log p_X(x)dx$。

**定义 4（Rényi 熵）.** $X$ 的 $r$ 阶（$r\geq0$）Rényi 熵定义为 $h_r(X)\triangleq\frac{1}{1-r}\log\int p_X^r(x)dx$。它推广了 Hartley 熵、碰撞熵与 min-熵等概念；特别地 $r=1$ 时 $h_1(X)\triangleq\lim_{r\to1}h_r(X)=h(X)$。

**定义 5（熵功率）.** 设 $h(X)$ 为 $X\in\mathbb R^d$ 的微分熵，则 $X$ 的熵功率为 $\mathcal N(X)\triangleq\frac{1}{2\pi e}e^{\frac{2}{d}h(X)}$。

**定义 6（散度）.** 统计散度是任意函数 $D_v:\Omega\times\Omega\to\mathbb R^+$，对所有 $p,q\in\Omega$ 满足：(1) $D_v(p,q)\geq0$；(2) $D_v(p,q)=0$ 当且仅当 $p=q$ 几乎处处。

**定义 7（Rényi 散度）.** $p_X$ 与 $p_Y$ 之间的 $r$ 阶（$r\geq0$）Rényi 散度为 $D_r(X,Y)\triangleq\frac{1}{r-1}\log\int p_X^r(x)p_Y^{1-r}(x)dx$。它给出散度度量的一个谱系，把 KL 散度作为特例 $D_1(X,Y)=D_{\text{KL}}(X,Y)$；且所有阶 $r\in(0,1)$ **等价** [79]，因为

$$
\frac{r}{t}\frac{1-t}{1-r}D_t(\cdot,\cdot)\leq D_r(\cdot,\cdot)\leq D_t(\cdot,\cdot),\qquad\forall\,0<r\leq t<1.\tag{9}
$$

**定义 8（条件化）.** 考虑联合分布 $p_{XY}$ 与条件分布 $p_{X\mid Y}$、$p_{Z\mid Y}$。给定 $Y$ 时 $X\in\mathbb R^d$ 的条件微分熵定义为 $h(X\mid Y)\triangleq-\int_{S_{XY}}p_{XY}(x,y)\log p_{X\mid Y}(x\mid y)dxdy=\mathbb E_{y\sim p_Y}[h(X\mid Y=y)]$，其中 $S_{XY}$ 为 $p_{XY}$ 的支撑集；给定 $Y$ 时 $X$ 的条件熵功率为 $\mathcal N(X\mid Y)=\frac{1}{2\pi e}e^{\frac{2}{d}h(X\mid Y)}$。类似地，给定 $Y$ 时 $X$ 与 $Z$ 的条件散度定义为 $D_v(X,Z\mid Y)\triangleq\mathbb E_{y\sim p_Y}\left[D_v(X\mid Y=y,Z\mid Y=y)\right]$；例如条件 Rényi 散度为

$$
D_r(X,Z\mid Y)\triangleq\int\left(\frac{1}{r-1}\log\int p_{X\mid Y}^r(x\mid y)p_{Z\mid Y}^{1-r}(x\mid y)dx\right)p_Ydy.
$$

表 1 汇总了多元高斯分布若干相关量的闭式表达式。下面是构成我们分析基础的两个基本结果。

**引理 1（最大熵原理 [19]）.** 设 $X\in\mathbb R^d$ 为零均值、协方差 $\Sigma_x$ 的连续随机变量，令 $X_G\sim\mathcal N(0,\Sigma_x)$ 为与 $X$ 独立、协方差相同的高斯随机变量，则 $h(X)\leq h(X_G)$、$\mathcal N(X)\leq\mathcal N(X_G)=|\Sigma_x|^{1/d}$。

**引理 2（熵功率不等式 [53]）.** 设 $X$、$Y$ 为相互独立的连续随机变量，则 $\mathcal N(X)+\mathcal N(Y)\leq\mathcal N(X+Y)$，等号成立当且仅当 $X$ 与 $Y$ 为协方差成比例的多元高斯随机变量。等价地，令 $X_g$、$Y_g$ 为独立各向同性多元高斯变量且满足 $h(X_g)=h(X)$、$h(Y_g)=h(Y)$，则 $h(X)+h(Y)=h(X_g)+h(Y_g)=h(X_g+Y_g)\leq h(X+Y)$。

### 附录 C：例 1 的推导

由 $\hat X=\mathbb E[X\mid Y]+Z$ 得 $\hat X\mid Y\sim\mathcal N(\mathbb E[X\mid Y],\sigma_z^2)$；又 $X\mid Y\sim\mathcal N(\mathbb E[X\mid Y],\sigma_q^2)$，其中 $\sigma_q^2=\frac{\sigma^2}{1+\sigma^2}$。因此条件误差熵为 $\mathcal N(\hat X-X\mid Y)=\sigma_q^2+\sigma_z^2$，对称 KL 散度为 $D_{\text{SKL}}(X,\hat X\mid Y)=\frac{\sigma_q^2+\sigma_z^2}{2\sigma_z\sigma_q}-1$，从而得到优化问题

$$
U(P)=\min_{\sigma_z}\left\{\sigma_q^2+\sigma_z^2:\ \frac{\sigma_q^2+\sigma_z^2}{2\sigma_z\sigma_q}-1\leq P\right\}.\tag{10}
$$

求解（10）即得正文例 1 的闭式表达式，其曲线示于附录 C 的图中（随感知指标 $P$ 增大，最小不确定性从 $\mathcal N(X\mid Y)$ 上升并趋近 $2\mathcal N(X\mid Y)$）。

### 附录 D：定理 1 的证明

证明分两部分：(1) **拟线性**——$U(P)$ 的定义域为感知指标 $P$，其可行集随 $P$ 增大而扩张，且目标函数关于估计器条件分布的选取是 $P$ 的单调不增、下半连续函数；对 $P_1,P_2$ 的凸组合，利用约束集的凸性与目标函数的拟凸性即得 $\min\{U(P_1),U(P_2)\}\leq U(\lambda P_1+(1-\lambda)P_2)\leq\max\{U(P_1),U(P_2)\}$。(2) **有界性**——下界由固有不确定性给出：对任意估计器，误差 $\hat X-X$ 在给定 $Y$ 时的条件熵不小于 $h(X\mid Y)$（因 $\hat X$ 为 $Y$ 的函数、条件化不增加熵），故 $\mathcal N(\hat X-X\mid Y)\geq\mathcal N(X\mid Y)$；上界由高斯化论证给出：把 $X$ 替换为同协方差高斯 $X_G$ 并用引理 1（最大熵原理）得 $U(P)\leq2\mathcal N(X_G\mid Y)$。

### 附录 E：定理 2 的证明

在 $D_v$ 对第二个参数凸的假设下，固定 $P$，考虑约束 $D_v(X,\hat X\mid Y)\leq P$ 下的最小化问题。若最优解处约束不紧（$D_v<P$），则可通过向更小不确定性方向连续调整估计器条件分布，在不违反约束的前提下降低目标，与最优性矛盾；因此最小值必在边界 $D_v(X,\hat X\mid Y)=P$ 上取得。证明中用到 $f$-散度（KL、全变差、Hellinger、卡方等）的凸性。

### 附录 F：定理 3 的证明

核心是借助熵功率不等式（引理 2）与最大熵原理（引理 1）把 UP 函数夹在固有不确定性 $\mathcal N(X\mid Y)$ 与高斯版本 $\mathcal N(X_G\mid Y)$ 之间。对 $R_{1/2}$ 散度约束，引入辅助高斯变量并其误差熵功率下界化，得到形如

$$
\eta(P)\,\mathcal N(X\mid Y)\leq U(P)\leq\eta(P)\,\mathcal N(X_G\mid Y),
$$

的界；其中 $\eta(P)$ 由（5）的约束通过求解一维优化得到，恰为正文给出的凸函数 $\eta(P)=2e^{2P/d}-\sqrt{(2e^{2P/d}-1)^2-1}$，且 $1\leq\eta(P)\leq2$。证明还说明 $\eta(P)$ 关于 $P$ 凸，并讨论 $P\to0$（$\eta\to1$，退化为固有不确定性）与 $P\to\infty$（$\eta\to2$）两端行为。

### 附录 G：定理 4 的证明

对任意估计器 $\hat X$，把均方误差与误差的条件熵功率联系：由 $h(\hat X-X\mid Y)\leq\frac{d}{2}\log\left(\frac{2\pi e}{d}\mathbb E[\|\hat X-X\|^2\mid Y]\right)$（给定 $Y$ 时的最大熵界）取期望并整理即得 $\frac1d\mathbb E[\|\hat X-X\|^2]\geq\mathcal N(\hat X-X\mid Y)$；再由 $\mathcal N(\hat X-X\mid Y)\geq\mathcal N(X\mid Y)$ 得（8）。无偏性假设用于确保误差与 $X$ 的条件相关性不破坏该界。

### 附录 H：通过直接估计得到的结果

附录 H 给出不依赖熵功率上界的另一组实验：在高维中直接估计统计量（如误差协方差的谱、条件熵的经验估计），以检验主文理论预测（不确定性随感知提升而增加、失真随不确定性增加）的稳健性；结果与第 5 节的结论一致。具体实验设置与曲线见原文附录 H。

### 论文检查表

原文附 NeurIPS 2024 论文检查表（Paper Checklist），逐项回答关于理论假设、证明完整性、实验可复现性、计算资源、伦理与更广泛影响等问题；本页不逐项转录，仅记其存在。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

[1] Abdar, M., Pourpanah, F., Hussain, S., Rezazadegan, D., Liu, L., Ghavamzadeh, M., Fieguth, P., Cao, X., Khosravi, A., Acharya, U.R., et al.: A review of uncertainty quantification in deep learning: Techniques, applications and challenges. Information fusion 76, 243–297 (2021)

[2] Alaa, A., Van Der Schaar, M.: Frequentist uncertainty in recurrent neural networks via blockwise influence functions. In: International Conference on Machine Learning. pp. 175–190. PMLR (2020)

[3] Angelopoulos, A.N., Bates, S.: A gentle introduction to conformal prediction and distribution-free uncertainty quantification. arXiv preprint arXiv:2107.07511 (2021)

[4] Angelopoulos, A.N., Bates, S., Candès, E.J., Jordan, M.I., Lei, L.: Learn then test: Calibrating predictive algorithms to achieve risk control. arXiv preprint arXiv:2110.01052 (2021)

[5] Angelopoulos, A.N., Bates, S., Fisch, A., Lei, L., Schuster, T.: Conformal risk control. arXiv preprint arXiv:2208.02814 (2022)

[6] Angelopoulos, A.N., Kohli, A.P., Bates, S., Jordan, M.I., Malik, J., Alshaabi, T., Upadhyayula, S., Romano, Y.: Image-to-image regression with distribution-free uncertainty quantification and applications in imaging. arXiv preprint arXiv:2202.05265 (2022)

[7] Ashukha, A., Lyzhov, A., Molchanov, D., Vetrov, D.: Pitfalls of in-domain uncertainty estimation and ensembling in deep learning. arXiv preprint arXiv:2002.06470 (2020)

[8] Bates, S., Angelopoulos, A., Lei, L., Malik, J., Jordan, M.: Distribution-free, risk-controlling prediction sets. Journal of the ACM (JACM) 68(6), 1–34 (2021)

[9] Beirlant, J., Dudewicz, E.J., Györfi, L., Van der Meulen, E.C., et al.: Nonparametric entropy estimation: An overview. International Journal of Mathematical and Statistical Sciences 6(1), 17–39 (1997)

[10] Belhasin, O., Kligvasser, I., Leifman, G., Cohen, R., Rainaldi, E., Cheng, L.F., Verma, N., Varghese, P., Rivlin, E., Elad, M.: Uncertainty-aware ppg-2-ecg for enhanced cardiovascular diagnosis using diffusion models. arXiv preprint arXiv:2405.11566 (2024)

[11] Belhasin, O., Romano, Y., Freedman, D., Rivlin, E., Elad, M.: Principal uncertainty quantification with spatial correlation for image restoration problems. arXiv preprint arXiv:2305.10124 (2023)

[12] Bellman, R.: A mathematical formulation of variational processes of adaptive type. In: Proceedings of the Berkeley Symposium on Mathematical Statistics and Probability. p. 37. University of California Press (1961)

[13] Blau, Y., Mechrez, R., Timofte, R., Michaeli, T., Zelnik-Manor, L.: The 2018 pirm challenge on perceptual image super-resolution. In: Proceedings of the European Conference on Computer Vision (ECCV) Workshops. pp. 0–0 (2018)

[14] Blau, Y., Michaeli, T.: The perception-distortion tradeoff. In: Proceedings of the IEEE conference on computer vision and pattern recognition. pp. 6228–6237 (2018)

[15] Blau, Y., Michaeli, T.: Rethinking lossy compression: The rate-distortion-perception tradeoff. In: International Conference on Machine Learning. pp. 675–685. PMLR (2019)

[16] Blundell, C., Cornebise, J., Kavukcuoglu, K., Wierstra, D.: Weight uncertainty in neural network. In: International conference on machine learning. pp. 1613–1622. PMLR (2015)

[17] Caron, M., Touvron, H., Misra, I., Jégou, H., Mairal, J., Bojanowski, P., Joulin, A.: Emerging properties in self-supervised vision transformers. In: Proceedings of the IEEE/CVF international conference on computer vision. pp. 9650–9660 (2021)

[18] Chen, T., Fox, E., Guestrin, C.: Stochastic gradient hamiltonian monte carlo. In: International conference on machine learning. pp. 1683–1691. PMLR (2014)

[19] Cover, T.M.: Elements of information theory. John Wiley & Sons (1999)

[20] Damianou, A., Lawrence, N.D.: Deep gaussian processes. In: Artificial intelligence and statistics. pp. 207–215. PMLR (2013)

[21] Delattre, S., Fournier, N.: On the kozachenko–leonenko entropy estimator. Journal of Statistical Planning and Inference 185, 69–93 (2017)

[22] Ding, K., Ma, K., Wang, S., Simoncelli, E.P.: Image quality assessment: Unifying structure and texture similarity. IEEE transactions on pattern analysis and machine intelligence 44(5), 2567–2581 (2020)

[23] Freirich, D., Michaeli, T., Meir, R.: A theory of the distortion-perception tradeoff in wasserstein space. Advances in Neural Information Processing Systems 34, 25661–25672 (2021)

[24] Gal, Y., Ghahramani, Z.: Dropout as a bayesian approximation: Representing model uncertainty in deep learning. In: international conference on machine learning. pp. 1050–1059. PMLR (2016)

[25] Gal, Y., Hron, J., Kendall, A.: Concrete dropout. Advances in neural information processing systems 30 (2017)

[26] Gal, Y., Islam, R., Ghahramani, Z.: Deep bayesian active learning with image data. In: International Conference on Machine Learning. pp. 1183–1192. PMLR (2017)

[27] Gasthaus, J., Benidis, K., Wang, Y., Rangapuram, S.S., Salinas, D., Flunkert, V., Januschowski, T.: Probabilistic forecasting with spline quantile function rnns. In: The 22nd international conference on artificial intelligence and statistics. pp. 1901–1910. PMLR (2019)

[28] Gawlikowski, J., Tassi, C.R.N., Ali, M., Lee, J., Humt, M., Feng, J., Kruspe, A., Triebel, R., Jung, P., Roscher, R., et al.: A survey of uncertainty in deep neural networks. Artificial Intelligence Review pp. 1–77 (2023)

[29] Goria, M.N., Leonenko, N.N., Mergel, V.V., Novi Inverardi, P.L.: A new class of random vector entropy estimators and its applications in testing statistical hypotheses. Journal of Nonparametric Statistics 17(3), 277–297 (2005)

[30] Gottschling, N.M., Antun, V., Hansen, A.C., Adcock, B.: The troublesome kernel–on hallucinations, no free lunches and the accuracy-stability trade-off in inverse problems. arXiv preprint arXiv:2001.01258 (2020)

[31] Hepburn, A., Laparra, V., Santos-Rodriguez, R., Ballé, J., Malo, J.: On the relation between statistical learning and perceptual distances. In: International Conference on Learning Representations (2021)

[32] Ho, J., Jain, A., Abbeel, P.: Denoising diffusion probabilistic models. Advances in neural information processing systems 33, 6840–6851 (2020)

[33] Hu, R., Huang, Q., Chang, S., Wang, H., He, J.: The MBPEP: a deep ensemble pruning algorithm providing high quality uncertainty prediction. Applied Intelligence 49(8), 2942–2955 (2019)

[34] Izmailov, P., Maddox, W.J., Kirichenko, P., Garipov, T., Vetrov, D., Wilson, A.G.: Subspace inference for Bayesian deep learning. In: Uncertainty in Artificial Intelligence. pp. 1169–1179. PMLR (2020)

[35] Kandasamy, K., Krishnamurthy, A., Poczos, B., Wasserman, L., et al.: Nonparametric von mises estimators for entropies, divergences and mutual informations. Advances in Neural Information Processing Systems 28 (2015)

[36] Kim, B., Xu, C., Barber, R.: Predictive inference is free with the jackknife+-after-bootstrap. Advances in Neural Information Processing Systems 33, 4138–4149 (2020)

[37] Kivaranovic, D., Johnson, K.D., Leeb, H.: Adaptive, distribution-free prediction intervals for deep networks. In: International Conference on Artificial Intelligence and Statistics. pp. 4346–4356. PMLR (2020)

[38] Kligvasser, I., Cohen, R., Leifman, G., Rivlin, E., Elad, M.: Anchored diffusion for video face reenactment. arXiv preprint arXiv:2407.15153 (2024)

[39] Kligvasser, I., Michaeli, T.: Sparsity aware normalization for gans. In: Proceedings of the AAAI Conference on Artificial Intelligence. vol. 35, pp. 8181–8190 (2021)

[40] Kozachenko, L., Leonenko, N.: On statistical estimation of entropy of a random vector. problems inform. Transmission 23, 95101–16 (1987)

[41] Kozachenko, L.F., Leonenko, N.N.: Sample estimate of the entropy of a random vector. Problemy Peredachi Informatsii 23(2), 9–16 (1987)

[42] Kutiel, G., Cohen, R., Elad, M., Freedman, D., Rivlin, E.: Conformal prediction masks: Visualizing uncertainty in medical imaging. In: ICLR 2023 Workshop on Trustworthy Machine Learning for Healthcare (2023)

[43] Kybic, J.: High-dimensional mutual information estimation for image registration. In: 2004 International Conference on Image Processing, 2004. ICIP'04. vol. 3, pp. 1779–1782. IEEE (2004)

[44] Lakshminarayanan, B., Pritzel, A., Blundell, C.: Simple and scalable predictive uncertainty estimation using deep ensembles. Advances in neural information processing systems 30 (2017)

[45] Laparra, V., Hepburn, A., Johnson, J.E., Malo, J.: Orthonormal convolutions for the rotation based iterative gaussianization. In: 2022 IEEE International Conference on Image Processing (ICIP). pp. 4018–4022. IEEE (2022)

[46] Laparra, V., Johnson, J.E., Camps-Valls, G., Santos-Rodríguez, R., Malo, J.: Information theory measures via multidimensional gaussianization. arXiv preprint arXiv:2010.03807 (2020)

[47] Ledig, C., Theis, L., Huszár, F., Caballero, J., Cunningham, A., Acosta, A., Aitken, A., Tejani, A., Totz, J., Wang, Z., et al.: Photo-realistic single image super-resolution using a generative adversarial network. In: Proceedings of the IEEE conference on computer vision and pattern recognition. pp. 4681–4690 (2017)

[48] Lee, J.A., Verleysen, M., et al.: Nonlinear dimensionality reduction, vol. 1. Springer (2007)

[49] Lei, J., G'Sell, M., Rinaldo, A., Tibshirani, R.J., Wasserman, L.: Distribution-free predictive inference for regression. Journal of the American Statistical Association 113(523), 1094–1111 (2018)

[50] Lim, B., Son, S., Kim, H., Nah, S., Mu Lee, K.: Enhanced deep residual networks for single image super-resolution. In: Proceedings of the IEEE conference on computer vision and pattern recognition workshops. pp. 136–144 (2017)

[51] Louizos, C., Welling, M.: Multiplicative normalizing flows for variational bayesian neural networks. In: International Conference on Machine Learning. pp. 2218–2227. PMLR (2017)

[52] MacKay, D.J.: Bayesian interpolation. Neural computation 4(3), 415–447 (1992)

[53] Madiman, M., Melbourne, J., Xu, P.: Forward and reverse entropy power inequalities in convex geometry. In: Convexity and concentration, pp. 427–485. Springer (2017)

[54] Marin-Franch, I., Foster, D.H.: Estimating information from image colors: An application to digital cameras and natural scenes. IEEE Transactions on Pattern Analysis and Machine Intelligence 35(1), 78–91 (2012)

[55] Martin, D., Fowlkes, C., Tal, D., Malik, J.: A database of human segmented natural images and its application to evaluating segmentation algorithms and measuring ecological statistics. In: Proceedings Eighth IEEE International Conference on Computer Vision. ICCV 2001. vol. 2, pp. 416–423. IEEE (2001)

[56] Nielsen, F.: Hypothesis testing, information divergence and computational geometry. In: International Conference on Geometric Science of Information. pp. 241–248. Springer (2013)

[57] Nielsen, F., Nock, R.: A closed-form expression for the sharma–mittal entropy of exponential families. Journal of Physics A: Mathematical and Theoretical 45(3), 032003 (2011)

[58] Ohayon, G., Michaeli, T., Elad, M.: The perception-robustness tradeoff in deterministic image restoration. arXiv preprint arXiv:2311.09253 (2023)

[59] Pearce, T., Brintrup, A., Zaki, M., Neely, A.: High-quality prediction intervals for deep learning: A distribution-free, ensembled approach. In: International conference on machine learning. pp. 4075–4084. PMLR (2018)

[60] Posch, K., Steinbrener, J., Pilz, J.: Variational inference to measure model uncertainty in deep neural networks. arXiv preprint arXiv:1902.10189 (2019)

[61] Pothapakula, P.K., Primo, C., Ahrens, B.: Quantification of information exchange in idealized and climate system applications. Entropy 21(11), 1094 (2019)

[62] Radford, A., Kim, J.W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., et al.: Learning transferable visual models from natural language supervision. In: International conference on machine learning. pp. 8748–8763. PMLR (2021)

[63] Ritter, H., Botev, A., Barber, D.: A scalable Laplace approximation for neural networks. In: 6th International Conference on Learning Representations, ICLR 2018-Conference Track Proceedings. vol. 6. International Conference on Representation Learning (2018)

[64] Romano, Y., Patterson, E., Candes, E.: Conformalized quantile regression. Advances in neural information processing systems 32 (2019)

[65] Rombach, R., Blattmann, A., Lorenz, D., Esser, P., Ommer, B.: High-resolution image synthesis with latent diffusion models. In: Proceedings of the IEEE/CVF conference on computer vision and pattern recognition. pp. 10684–10695 (2022)

[66] Sajjadi, M.S., Scholkopf, B., Hirsch, M.: Enhancenet: Single image super-resolution through automated texture synthesis. In: Proceedings of the IEEE international conference on computer vision. pp. 4491–4500 (2017)

[67] Salimans, T., Kingma, D., Welling, M.: Markov chain monte carlo and variational inference: Bridging the gap. In: International conference on machine learning. pp. 1218–1226. PMLR (2015)

[68] Sankaranarayanan, S., Angelopoulos, A.N., Bates, S., Romano, Y., Isola, P.: Semantic uncertainty intervals for disentangled latent spaces. arXiv preprint arXiv:2207.10074 (2022)

[69] Sesia, M., Candès, E.J.: A comparison of some conformal quantile regression methods. Stat 9(1), e261 (2020)

[70] Shafer, G., Vovk, V.: A tutorial on conformal prediction. Journal of Machine Learning Research 9(3) (2008)

[71] Shaham, T.R., Dekel, T., Michaeli, T.: Singan: Learning a generative model from a single natural image. In: Proceedings of the IEEE/CVF international conference on computer vision. pp. 4570–4580 (2019)

[72] Simonyan, K., Zisserman, A.: Very deep convolutional networks for large-scale image recognition. arXiv preprint arXiv:1409.1556 (2014)

[73] Song, J., Meng, C., Ermon, S.: Denoising diffusion implicit models. arXiv preprint arXiv:2010.02502 (2020)

[74] Su, S., Yan, Q., Zhu, Y., Zhang, C., Ge, X., Sun, J., Zhang, Y.: Blindly assess image quality in the wild guided by a self-adaptive hyper network. In: Proceedings of the IEEE/CVF conference on computer vision and pattern recognition. pp. 3667–3676 (2020)

[75] Sun, S.: Conformal methods for quantifying uncertainty in spatiotemporal data: A survey. arXiv preprint arXiv:2209.03580 (2022)

[76] Szabó, Z.: Information theoretical estimators toolbox. The Journal of Machine Learning Research 15(1), 283–287 (2014)

[77] Ulyanov, D., Vedaldi, A., Lempitsky, V.: Deep image prior. In: Proceedings of the IEEE conference on computer vision and pattern recognition. pp. 9446–9454 (2018)

[78] Valentin Jospin, L., Buntine, W., Boussaid, F., Laga, H., Bennamoun, M.: Hands-on Bayesian neural networks–a tutorial for deep learning users. arXiv e-prints pp. arXiv–2007 (2020)

[79] Van Erven, T., Harremos, P.: Rényi divergence and kullback-leibler divergence. IEEE Transactions on Information Theory 60(7), 3797–3820 (2014)

[80] Varshavsky-Hassid, M., Hirsch, R., Cohen, R., Golany, T., Freedman, D., Rivlin, E.: On the semantic latent space of diffusion-based text-to-speech models. In: Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers). pp. 246–255 (2024)

[81] Wang, X., Yu, K., Wu, S., Gu, J., Liu, Y., Dong, C., Qiao, Y., Change Loy, C.: Esrgan: Enhanced super-resolution generative adversarial networks. In: Proceedings of the European conference on computer vision (ECCV) workshops. pp. 0–0 (2018)

[82] Wang, Z., Bovik, A.C., Sheikh, H.R., Simoncelli, E.P.: Image quality assessment: from error visibility to structural similarity. IEEE transactions on image processing 13(4), 600–612 (2004)

[83] Wu, D., Gao, L., Xiong, X., Chinazzi, M., Vespignani, A., Ma, Y.A., Yu, R.: Quantifying uncertainty in deep spatiotemporal forecasting. arXiv preprint arXiv:2105.11982 (2021)

[84] Wu, H., Zhang, Z., Zhang, W., Chen, C., Liao, L., Li, C., Gao, Y., Wang, A., Zhang, E., Sun, W., et al.: Q-align: Teaching lmms for visual scoring via discrete text-defined levels. arXiv preprint arXiv:2312.17090 (2023)

[85] Xu, T., Zhang, Q., Li, Y., He, D., Wang, Z., Wang, Y., Qin, H., Wang, Y., Liu, J., Zhang, Y.Q.: Conditional perceptual quality preserving image compression. arXiv preprint arXiv:2308.08154 (2023)

[86] Yarom, M., Bitton, Y., Changpinyo, S., Aharoni, R., Herzig, J., Lang, O., Ofek, E., Szpektor, I.: What you see is what you read? improving text-image alignment evaluation. Advances in Neural Information Processing Systems 36 (2024)

[87] Zhang, R., Isola, P., Efros, A.A., Shechtman, E., Wang, O.: The unreasonable effectiveness of deep features as a perceptual metric. In: Proceedings of the IEEE conference on computer vision and pattern recognition. pp. 586–595 (2018)

[88] Zhang, W., Zhai, G., Wei, Y., Yang, X., Ma, K.: Blind image quality assessment via vision-language correspondence: A multitask learning perspective. In: Proceedings of the IEEE/CVF conference on computer vision and pattern recognition. pp. 14071–14081 (2023)

**本页范围与校对状态：** 本页依据 NeurIPS 2024 会议论文集版本（本地 PDF 28 页）完成中文翻译：摘要、第 1—8 节（引言、相关工作、问题表述、不确定性—感知折中（含 4.1 平面与 4.2 重访失真—感知折中）、实验、结论、局限、更广泛影响）、图 1—6 中文图注、表 1 逐格转录、附录 A—H 结构化译文（含定义 3—8、引理 1—2、定理 1—4 的证明要点与式（9）（10））、参考文献 [1]—[88] 英文原条目（按原编号）均按原文结构录入；正文编号公式 (1)—(10) 按原文保留。**口径说明：** 正文为完整翻译；原文附录 A—H 约 14 页、以逐式推导为主，本页采用**结构化译文**（保留定义、引理、定理与证明脉络，未逐式全文翻译），此为与"全文"要求的已知差异，已在此明确披露。**逐句逐式终校未做**；图 1—6 的图像与散点未数字化，只转录图注与正文给出的关键结论；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①**表 1 第 2 行熵功率写作 $|\Sigma_x|^{1/n}$**（原 PDF 渲染图确认），按定义应为 $|\Sigma_x|^{1/d}$，本页照原文转录并在此标注；②图 1 原图注中 "graudally" 为原文笔误（gradually），本页按其语义译为"逐渐"；③原文附录 C 的 $U(P)$ 闭式解与正文例 1 一致，但附录图示坐标轴略去 $P$ 的标注，属原图排版；④NeurIPS 2024 会议论文版权与再传播许可待核验，**本页不登记为可公开全文**；原文附 NeurIPS 论文检查表，本页未逐项转录。

{% endraw %}
