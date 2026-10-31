---
layout: page
title: "该合成数据集适合训练吗？最小代价的检验方法｜中文全文译文"
permalink: /papers/translations/2026-09-27-2608-27996-should-i-use-this-synthetic-dataset-for-training-how-to-test-with-mini/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/27133f41db1533c8/) · [原文 arXiv](https://arxiv.org/abs/2608.27996) · [全部目录](/papers/catalog/)

# 该合成数据集适合训练吗？最小代价的检验方法

**原题：** Should I Use This Synthetic Dataset for Training? How to Test with Minimal Real Data  
**作者：** Zhenyu Tao（Graduate Student Member, IEEE）、Wei Xu（Fellow, IEEE）、Xiaohu You（Fellow, IEEE）、Petar Popovski（Fellow, IEEE）、Osvaldo Simeone（Fellow, IEEE）  
**单位：** 陶振宇、许威、尤肖虎：东南大学移动通信国家重点实验室（南京 210096）与紫金山实验室普适通信研究中心（南京 211111）；Petar Popovski：丹麦奥尔堡大学电子系统系（9220）；Osvaldo Simeone：伦敦东北大学智能网络系统研究所（E1 8PH）及奥尔堡大学电子系统系连接性研究组（9220）。  
**版本：** arXiv:2608.27996v1（cs.AI），v1 日期 2026 年 8 月 28 日；原文 19 页（含附录 A–B）。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2608.27996v1 [cs.AI] 28 Aug 2026"，与库内登记编号 2608.27996 一致；首页资助与作者单位脚注已译于"原文首页资助与作者说明"段。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–16 中文图注、表 I–III 逐格转写、算法 1、附录 A（定理 1 证明）与附录 B（实验配置），以及参考文献 43 条英文原条目（按原编号）。逐句逐式终校未做。

> **原文首页资助与作者说明：** O. Simeone 的工作获得 EPSRC 开放基金（EP/W024101/1）、EPSRC 基金（EP/X011852/1）与 ERC 基金（No. 101198347）支持；P. Popovski 的工作部分获得丹麦 Velux 基金会通过 Villum Investigator Grant WATER（nr. 37793）的支持。作者单位与邮箱：陶振宇、许威、尤肖虎为东南大学移动通信国家重点实验室与紫金山实验室普适通信研究中心（{zhenyu tao, wxu, xhyu}@seu.edu.cn）；P. Popovski 为奥尔堡大学电子系统系（petarp@es.aau.dk）；O. Simeone 为伦敦东北大学智能网络系统研究所与奥尔堡大学电子系统系连接性研究组（o.simeone@northeastern.edu）。

## 摘要

数字孪生（digital twin，DT）与学习型世界模型越来越多地被用于生成合成数据，以扩充工程系统中训练人工智能（AI）模型所需的稀缺真实数据集。然而，由于不可避免的仿真到现实（sim-to-real）差距，数据增强可能无法提升训练模型在真实数据分布上的性能。本文研究由此产生的决策问题：给定一个真实数据集、一个候选合成数据集与一个固定的学习算法，判断在增强数据集上训练能否提升真实总体（population）层面的性能，同时尽可能少地消耗真实测试数据点。本文考虑两种表述：对两个训练模型之间平均损失差的直接检验；以及基于对称性的成对损失差检验，后者以更强的零假设换取更快的证据积累。对后者，我们提出自适应 e-过程符号翻转检验（adaptive e-process sign-flip test，aeSFT），一种双重自适应过程：它同时自适应 Monte Carlo 符号翻转轮数（因而自适应计算代价）与真实测试数据的消耗量。aeSFT 提供随时有效的（anytime-valid）第一类错误控制，无需预先指定测试集大小。在合成数据分类任务、DT 辅助的无线分组调度任务与无线电地图预测任务上的实验表明，aeSFT 用显著少于基于均值的序贯检验的真实测试样本识别出有用的合成数据，达到与固定样本符号翻转检验和配对 $t$ 检验相当的功效，同时把假阳性率控制在目标水平以下。

**索引词：** 合成数据、数字孪生、AI 训练、假设检验、e-过程、Monte Carlo 检验。

## I. 引言

### A. 动机与背景

在工程系统中部署人工智能（AI）的主导约束很少是模型容量，而是能否获得反映待控制具体系统的数据。例如，无线网络性能取决于特定部署的传播环境、拓扑与业务模式。因此，学习到的控制策略的好坏取决于它所观察到的运行条件。然而，采集这类部署特定的测量既慢又贵，有时还会干扰在线系统 [1]。

对这一约束的常见应对是"制造数据"。在工程领域，数字孪生（DT）——即真实系统的高保真、站点特定仿真器或模拟器——可以生成几乎无限的、针对所关注部署定制的合成数据 [2]。例子包括用于无线传播环境的可微射线追踪引擎 [3], [4]、基于软件定义无线电的网络模拟器 [5]，以及 DT 驱动的网络控制强化学习（RL）[6]。与此同时，**世界模型**——即作为现实的可微、可查询代理的环境动力学学习型生成模型 [7], [8], [9]——正成为智能系统的关键组件。利用 DT 或世界模型，策略有可能主要或完全用合成数据训练 [10]。

然而，这类模型只是其所复现系统的简化。例如，在射线追踪器中，几何被近似、材料参数被估计 [11]。由此产生的仿真到现实差距意味着合成分布不同于真实分布，因此在真实与合成数据并集上训练通常优化的是目标总体损失的有偏估计 [1], [12]。

一般而言，由给定 DT 或世界模型产生的特定合成数据集是否有助于给定任务上的特定学习算法，不能仅凭仿真器输出确定，而需要用真实数据评估。事实上，由于所关注的量是真实数据分布下的总体损失，唯一可靠的裁决者是从该分布抽取的测试数据集，但此类测试数据很昂贵——它对应物理机器人上的回合 [13]、由人工标注者回答的查询 [14]，或高保真模拟器/在线网络的运行 [5]。因此实践中，关键是把在统计保证下确立合成数据有用性所需的真实评估次数降到最低。

### B. 相关工作

**来自 DT 与世界模型的合成数据。** 第一条工作线试图从源头减小 sim-to-real 差距，通过用真实测量校准仿真器，例如可微射线追踪 [3] 或场景几何的相位误差感知校准 [15]。第二条工作线接受残余差距并使训练对其鲁棒：或是用贝叶斯方式对环境不确定性建模 [16]，或是通过预测驱动的推断（prediction-powered inference，PPI）[17] 及其交叉验证 [18]、上下文感知 [19] 变体，用少量真实数据校正训练目标本身；综述见 [1]。这些方法与本文互补：它们旨在使合成数据更有用，而我们问的是给定合成数据集究竟是否有用，并为其答案提供统计凭证。特别地，它们都没有以受控的错误概率（相对于用于检验合成数据质量的数据分布）给出关于合成数据有用性的判定。

**数据估值与选择。** 评估训练数据对模型性能的贡献是一个庞大的文献主题，包括影响函数 [20] 与 Shapley 值数据估值 [21]。这些技术本质上是计算与归因性的：它们估计贡献，通常在被视为精确的留出数据上进行，而不控制所得判定的错误。本文处理的问题互补且明确是统计性的：它关注在真实分布下有效的判定需要多少次真实评估。

**通过下注的序贯检验。** 我们的工具来自近期关于 e-值与博弈论统计的文献。在"通过下注检验"（testing-by-betting）框架中 [22], [23]，反对零假设的证据被表示为在零假设下公平博弈中赌徒的财富。这类方法支持最优的延续与停止，同时保持第一类错误意义上的统计有效性。有界随机变量均值的下注策略在 [24] 中建立，并被适配到自适应"先学后测"（adaptive learn-then-test）[25] 中的序贯超参数与风险控制问题，其基础是固定样本的"先学后测"框架 [26]。该方法论可应用于检验"用真实加合成数据训练的模型"与"仅用真实数据训练的模型"之间总体损失之差。这一途径产生自适应均值检验（adaptive mean test，aMT），它是随时有效的，但当配对损失差重尾时可能较慢。

**随机化与 Monte Carlo 检验。** 文献 [27] 近期提出不检验平均损失差，而是检验一个更专门的假设：无用的合成数据意味着损失差的对称分布。该假设容许随机化检验 [28]，但需要预先固定随机评估次数。这一限制在 [29] 中被移除，[29] 把随机化检验本身重新表述为下注博弈，从而让随机评估次数自适应实例难度。然而重要的是，那里的自适应针对的是计算而非数据：测试集是预先固定的，这在我们的场景中并没有触及最主要的瓶颈。

### C. 主要贡献

本文研究如何用尽可能少的真实测试数据点，判定在真实训练集上添加给定合成数据集能否提升真实世界性能。主要贡献如下。

- **问题表述。** 我们把合成数据有用性形式化为两种备择零假设下的序贯二元检验问题：**直接零假设**，即仅用真实数据训练的模型与用真实加合成数据训练的模型之间的平均损失差非正；以及**基于对称性的零假设**，即成对样本级损失差关于零对称分布。我们明确每种表述适用所需的假设，以及拒绝各自能提供何种不同的保证。
- **自适应 e-过程符号翻转检验。** 我们提出自适应 e-过程符号翻转检验（aeSFT），它沿数据与复杂度两个轴自适应。真实测试数据按独立批次处理：批内 e-过程在自适应的符号翻转轮数上积累证据，并可在批次看起来无望时提前结束该批；批间 e-过程复合从先前批次继承的财富，一旦收集到足够证据即停止。在下注解释中（如图 2 所示），赌徒被允许依次进入一系列赌场，每个赌场有一批新的真实测试数据，并把累积财富从一处带到下一处。
- **理论保证。** 我们证明：在基于对称性的零假设下，批间 e-过程是非负检验鞅（test martingale），且符号翻转轮数是关于批内历史的停时。因此由 Ville 不等式，在批间 e-过程首次达到 $1/\alpha$ 时拒绝零假设，可在整个时间上把第一类错误控制在水平 $\alpha$。
- **实验。** 在带合成训练数据的二分类任务、DT 辅助的无线分组调度任务（其离线深度 Q 网络在真实与 DT 生成的轨迹上训练 [30]）以及无线电地图预测任务 [31] 上，aeSFT 在较小的真实数据消耗下取得显著高于 aMT [22] 的真阳性率，达到固定样本过程的功效而无需预先指定样本量，并把假阳性率保持在目标水平 $\alpha$ 以下。

本文其余部分组织如下：第 II 节给出两种检验的表述与误差控制要求；第 III 节与第 IV 节回顾通过下注的序贯均值检验与符号翻转检验；第 V 节给出 aeSFT 及其保证；第 VI 节报告实验；第 VII 节总结。

> **图 1（原文 Fig. 1）：** 问题设置示意：给定真实数据集 $\mathcal D$ 与合成数据集 $\mathcal D^{\mathrm{syn}}$，我们希望判定在增强数据集 $\mathcal D\cup\mathcal D^{\mathrm{syn}}$ 上训练能否降低训练模型的总体损失。

## II. 问题定义

令 $\mathcal A(\cdot)$ 表示把训练数据集映射为训练模型 $f$ 的固定学习算法。给定从真实数据分布 $P$ 抽取的 $n$ 个数据点组成的真实训练数据集 $\mathcal D$，以及从一般不同的分布 $P^{\mathrm{syn}}$ 抽取的 $n^{\mathrm{syn}}$ 个数据点组成的合成数据集 $\mathcal D^{\mathrm{syn}}$，我们回答：在真实数据集 $\mathcal D$ 上添加合成数据集 $\mathcal D^{\mathrm{syn}}$ 能否提升训练模型在测试时的性能？

我们用应当被最小化的标量总体损失 $\mathbb L(f)$ 表述该问题。该损失可以是期望预测损失、取负的期望奖励、期望任务完成时间或其他依赖任务的性能准则。令 $Z\sim P$ 表示测试样本，$\mathbb L(f;Z)$ 表示样本级目标函数。样本 $Z$ 可以是输入–标签对、交互回合或其他依赖任务的评估单元。总体目标为平均损失

$$
\mathbb L(f)=\mathbb E_{Z\sim P}\left[\mathbb L(f;Z)\right]. \tag{1}
$$

例如在预测情形，样本 $Z=(X,Y)$，样本级目标为

$$
\mathbb L(f;Z)=\ell\left(f(X),Y\right), \tag{2}
$$

其中给定结果 $y$ 与预测 $\hat y$ 之间的非负损失函数 $\ell(\hat y,y)\ge0$。

为解决上述问题，我们假设可获得独立同分布（i.i.d.）测试数据

$$
Z_1,Z_2,\dots,Z_m\overset{\mathrm{iid}}{\sim}P, \tag{3}
$$

从真实数据分布 $P$ 抽取。获取测试数据可能需要在物理系统上进行真实世界测量 [13]、查询人工标注者 [14] 或运行高保真模拟器 [5]。因此，使用尽可能少的测试数据点 $m$ 很重要。为实现这一目标，我们将聚焦可在获得足够证据时自适应停止的序贯检验。

### A. 直接合成数据检验

最直接的表述比较仅用真实数据训练的模型

$$
f=\mathcal A(\mathcal D), \tag{4}
$$

与在真实与合成数据并集上训练的模型

$$
f^{\mathrm{syn}}=\mathcal A(\mathcal D\cup\mathcal D^{\mathrm{syn}}). \tag{5}
$$

由于 $\mathbb L(\cdot)$ 越小越好，当模型 (5) 的损失小于原模型 (4) 时，合成数据增强有用。定义总体损失差 $\Delta=\mathbb L(f)-\mathbb L(f^{\mathrm{syn}})$，则合成数据有用对应 $\Delta>0$。据此可把问题表述为对零假设

$$
H_0:\ \Delta\le0 \tag{6}
$$

（即合成数据无用）的二元检验，备择假设为

$$
H_1:\ \Delta>0. \tag{7}
$$

按定义，拒绝零假设 $H_0$ 即结论为有足够证据表明合成数据对训练有用。

### B. 基于对称性的合成数据检验

直接假设检验 (6)–(7) 依赖损失函数均值的比较。当可用测试数据有限且样本级目标差在备择 $H_1$ 下呈重尾分布时，该做法可能样本效率低，导致反对零假设 $H_0$ 的证据积累缓慢 [27]。为可能改善该情形下的检验效率，我们还研究基于更严格零假设的二元检验的替代表述。该表述可能提高检验功效，支持用更少测试数据点 $m$ 检测真正有用的合成数据集；然而相对于原直接检验 (6)–(7)，它也可能产生更多假阳性。

对任意测试样本 $Z\sim P$，定义成对样本级差

$$
\delta=\mathbb L(f;Z)-\mathbb L(f^{\mathrm{syn}};Z), \tag{8}
$$

其期望为总体损失差

$$
\mathbb E[\delta]=\Delta. \tag{9}
$$

与第 II-A 节不同，我们对差 (8) 的分布作两个额外假设：

**假设 1（合成数据不会损害性能）。** 不用合成数据训练的基线模型 $f$ 平均而言不能优于模型 $f^{\mathrm{syn}}$，即 $\Delta\ge0$，因此"合成数据无用"的条件化为等式 $\Delta=0$。实践中，若合成数据与真实数据分布足够接近，该假设近似成立。

**假设 2（零假设下的对称分布）。** 表示无用合成数据的条件 $\Delta=0$ 被进一步专门化为假设成对差 $\delta$ 的分布关于零对称。当合成数据平均无用时而其帮助与伤害的可能性相同时，该假设是合理的。在此假设下，零假设可写为

$$
H_0^{\mathrm{syn}}:\ \delta\overset{d}{=}-\delta, \tag{10}
$$

其中 $\overset{d}{=}$ 表示依分布相等。相应备择假设为补集

$$
H_1^{\mathrm{syn}}:\ \delta\overset{d}{\neq}-\delta. \tag{11}
$$

因此，拒绝专门化零假设 $H_0^{\mathrm{syn}}$ 支持合成数据增强优于仅用真实数据训练的结论。

总之，用假设 (10)–(11) 表述的问题建立在比原直接检验 (6)–(7) 更强的假设之上：当合成数据无帮助时，式 (8) 中的成对损失差 $\delta$ 关于其零均值对称。拒绝 (10)–(11) 中的零假设 $H_0^{\mathrm{syn}}$ 并不蕴含拒绝原零假设 $H_0$（式 (6)–(7)），但当该假设近似有效时，它为合成数据的有用性提供了强信号。

### C. 误差控制

我们聚焦逐个处理测试数据 $Z_1,Z_2,\dots$ 的序贯检验过程，把可用数据 $Z^i=(Z_1,\dots,Z_i)$ 映射为判定

$$
D(Z^i)\in\{\text{拒绝 }H_0,\ \text{继续}\}, \tag{12}
$$

并记作出最终判定的停时为

$$
m_{\mathrm{stop}}=\min\left\{\min\{i: D(Z^i)=\text{拒绝 }H_0\},\ M\right\}, \tag{13}
$$

其中 $M$ 是可收集的最大数据量（例如受时间限制）。若 $D(Z^{m_{\mathrm{stop}}})=\text{继续}$，则检验结论为无法拒绝零假设。对直接检验 (6)–(7) 与基于对称性的检验 (10)–(11)，我们希望检验的第一类错误概率不超过用户给定的可靠性水平 $\alpha\in(0,1)$，即

$$
\Pr_{H_0}\left[D(Z^{m_{\mathrm{stop}}})=\text{拒绝 }H_0\right]\le\alpha, \tag{14}
$$

其中 $\Pr_{H_0}[\cdot]$ 表示假设 $H_0$ 覆盖的所有分布中的最坏（最大）概率；对基于对称性的检验，$H_0$ 替换为 $H_0^{\mathrm{syn}}$。由于约束 (14)，该设计可确保错误宣布合成数据有用的概率保持在水平 $\alpha$ 以下，其中概率是相对于用于检验的数据而言。

在约束 (14) 下，我们希望最小化当合成数据确实有助于提升模型性能（即在备择 $H_1$ 或 $H_1^{\mathrm{syn}}$ 下）时拒绝零假设所需的测试数据点数 $m_{\mathrm{stop}}$，从而最大化检验过程的样本效率。

> **表 I（原文 Table I）：** 全文使用的记号。

| 记号 | 含义 |
|---|---|
| $P,P^{\mathrm{syn}}$ | 真实与合成数据分布 |
| $\mathcal D,\mathcal D^{\mathrm{syn}}$ | 真实与合成训练数据集 |
| $f,f^{\mathrm{syn}}$ | 在 $\mathcal D$ 与 $\mathcal D\cup\mathcal D^{\mathrm{syn}}$ 上训练的模型 |
| $\mathbb L(f;Z)$ | 样本级损失 |
| $\mathbb L(f)$ | 总体损失 |
| $\delta,\Delta$ | 成对样本级损失差及其总体均值 |
| $H_0,H_1$ | 基于 $\Delta$ 的直接均值假设 |
| $H_0^{\mathrm{syn}},H_1^{\mathrm{syn}}$ | 基于 $\delta$ 的对称性假设 |
| $M,m_k$ | 最大测试数据预算与自适应第 $k$ 批的规模 |
| $B,B_k$ | 固定与自适应的符号翻转轮数 |
| $W_k^b,\widetilde W_k^b$ | 批内与批间财富 |
| $\alpha$ | 目标第一类错误水平 |
| $m_{\mathrm{init}},\beta$ | 初始批次规模与批次增长因子 |
| $\omega,\epsilon$ | 提前停止阈值与变化容差 |

## III. 自适应直接合成数据检验

本节通过回顾基于通过下注检验 [22], [24] 的先进序贯检验策略来处理直接二元检验 (6)–(7)。对任意测试样本 $Z\sim P$，如式 (8) 定义损失差 $\delta$，则零假设 (6) 可等价写为 $H_0:\mathbb E[\delta]\le0$。假设样本级损失有界：$0\le\mathbb L(f';Z)\le L_{\max}$，对某已知常数 $L_{\max}>0$ 与任意模型 $f'$。于是 $\delta\in[-L_{\max},L_{\max}]$，损失差可归一化为

$$
\tilde\delta=\frac{\delta}{2L_{\max}}+\frac12\in[0,1], \tag{15}
$$

零假设可等价写为 $H_0:\mathbb E[\tilde\delta]\le0.5$。

该过程可解释为一个赌徒的财富：他投入当前财富的一部分来押注反对零假设 $H_0$ [22], [24]，如图 2 所示；当前财富越大，反对零假设的证据越多。在 aMT [24], [25] 中，每观测一个测试样本 $Z_i\sim P$ 后，财富统计量 $E_i$ 更新为

$$
E_i=E_{i-1}\cdot\left(1+\mu_i(\tilde\delta_i-0.5)\right), \tag{16}
$$

从 $E_0=1$ 开始，其中 $\mu_i$ 可解释为投入反对零假设 $H_0:\mathbb E[\tilde\delta]\le0.5$ 的财富 $E_{i-1}$ 的比例。由 (16)，当 $\mathbb E[\tilde\delta]\le0.5$ 时财富期望下降，反之上升。比例 $\mu_i\in(0,1/(1-\alpha))$ 可用过去数据 $Z^{i-1}=(Z_1,\dots,Z_{i-1})$ 选择。一旦统计量越过阈值 $\gamma$ 即拒绝零假设 $H_0$，即

$$
E_i\ge\gamma\ \Longrightarrow\ \text{拒绝 }H_0, \tag{17}
$$

否则继续检验。若到时间 $M$（含）为止未发生拒绝，则无法拒绝假设 $H_0$。

文献 [24] 表明统计量 (16) 构成 e-过程，即序贯似然比的推广 [32]。e-过程的关键性质是：在零假设下，其给定过去的条件期望不超过当前值。由 Markov 不等式的一个扩展（称为 Ville 不等式），这意味着在 (17) 中选择阈值 $\gamma=1/\alpha$ 可确保满足第一类错误要求 (14)。然而如第 II-B 节所讨论，该检验可能效率低下：在备择 $H_1$ 下拒绝零假设 $H_0$ 可能需要大量数据点 $m_{\mathrm{stop}}$。这正是成对损失差 $\delta$ 在备择下呈重尾分布、反对零假设的证据积累缓慢的情形。

> **图 2（原文 Fig. 2）：** SFT [27]、eSFT [29] 与 aeSFT（本文）的下注解释。

## IV. 固定样本的基于对称性合成数据检验

本节在固定样本（即非序贯）设置下处理基于对称性的检验 (10)–(11)，其中测试样本数 $M$ 固定。我们首先回顾 [27] 使用的基本符号翻转检验（sign-flip test，SFT），然后把 [29] 中更高效的计算途径适配到当前任务。

### A. 符号翻转检验

由于测试样本 $Z_1,\dots,Z_M$ 如 (3) 所规定为 i.i.d.，在 (10) 的零假设 $H_0^{\mathrm{syn}}$ 下，成对差具有"符号翻转不变"的联合分布，即

$$
(\delta_1,\dots,\delta_M)\overset{d}{=}(s_1\delta_1,\dots,s_M\delta_M), \tag{18}
$$

其中 $\delta_i=\mathbb L(f;Z_i)-\mathbb L(f^{\mathrm{syn}};Z_i)$，对任意固定二元序列 $(s_1,\dots,s_M)\in\{-1,+1\}^M$。

由于乘以二元序列的集合构成群，可直接应用随机化检验 [28]。为此定义经验平均

$$
\hat\Delta=\frac1M\sum_{i=1}^M\delta_i. \tag{19}
$$

如图 3 所示，使用检验的 Monte Carlo 版本，抽取 $B$ 条独立二元序列

$$
\mathbf s^b=(s_1^b,\dots,s_M^b),\quad b=1,\dots,B, \tag{20}
$$

其中 $s_i^b\sim\mathrm{Unif}\{-1,+1\}$ 独立，并计算相应的符号翻转统计量

$$
\hat\Delta^b=\frac1M\sum_{i=1}^M s_i^b\delta_i. \tag{21}
$$

随后计算量

$$
p=\frac{1+\sum_{b=1}^B\mathbb 1\{\hat\Delta^b\ge\hat\Delta\}}{B+1} \tag{22}
$$

$p$ 值 (22) 很小意味着很少有符号翻转统计量产生与观测值 $\hat\Delta$ 一样大的改进，即提供了合成数据有用的强证据。量 (22) 是零假设 (10) 的单侧 $p$ 值，因此检验

$$
p\le\alpha\ \Longrightarrow\ \text{拒绝 }H_0^{\mathrm{syn}} \tag{23}
$$

在零假设 $H_0^{\mathrm{syn}}$ 下对任意固定的随机符号翻转次数 $B$ 满足第一类错误概率要求 $\Pr_{H_0^{\mathrm{syn}}}(\text{拒绝 }H_0^{\mathrm{syn}})\le\alpha$，其中概率也取在随机二元序列上。

> **图 3（原文 Fig. 3）：** SFT [27] 示意：测试集规模 $M$ 与符号翻转序列数 $B$ 均预先固定。

### B. e-过程符号翻转检验（eSFT）

SFT (20)–(23) 的一个限制是符号翻转预算 $B$ 必须预先选择。$B$ 过小会降低功效，而 $B$ 过大会增加计算复杂度。此外，在查看 $p$ 值 (22) 之后增加符号翻转序列数 $B$ 以期望提高功效会造成 $p$ 值篡改（$p$-hacking），破坏第一类错误保证 (14) [23]。

为解决该问题，文献 [29] 提出按轮 $b=1,2,\dots$ 运行，每轮抽取新的符号向量 $\mathbf s^b$（式 (20)）并计算相应的符号翻转统计量 $\hat\Delta^b$。对第 $b$ 轮，把 $p$ 值 (22) 中的指示项定义为

$$
I^b=\mathbb 1\{\hat\Delta^b\ge\hat\Delta\}. \tag{24}
$$

这里 $I^b=1$ 表示符号翻转统计量胜过观测统计量，因而是反对零假设的下注的失败轮；$I^b=0$ 相应地是获胜轮。到第 $b$ 轮为止 (22) 中的和因此写为

$$
L^b=\sum_{j=1}^b I^j. \tag{25}
$$

文献 [29] 不依赖 $p$ 值 (22)，而是用和 (25) 构造 e-过程。

形式上，在每步 $b$，在观测指示 $I^b$（式 (24)）之前，固定一个非负下注函数 $G^b:\{0,1\}\to\mathbb R_{\ge0}$，它关于 $\sigma(I^1,\dots,I^{b-1})$ 可测，并满足约束

$$
G^b(0)\frac{b-L^{b-1}}{b+1}+G^b(1)\frac{L^{b-1}+1}{b+1}=1. \tag{26}
$$

下注函数 $G^b$ 是赌徒的策略，指定施加于当前财富的乘性收益 $G^b(I^b)$，而约束 (26) 强制零假设 $H_0^{\mathrm{syn}}$（式 (10)）下的公平博弈，$\mathbb E_{H_0^{\mathrm{syn}}}[G^b(I^b)\mid I^1,\dots,I^{b-1}]=1$，因此财富在期望上不增长。观测到当前指示 $I^b$ 后，e-过程（即赌徒的财富增长过程）更新为

$$
W^b=W^{b-1}G^b(I^b). \tag{27}
$$

由于博弈在 $H_0^{\mathrm{syn}}$ 下公平，零假设成立时大财富不太可能出现，因此 $W^b$ 的大值构成反对 $H_0^{\mathrm{syn}}$ 的强证据。

eSFT 在 e-过程 $W^b$ 越过阈值 $1/\alpha$ 时立即拒绝零假设 (10)，即

$$
W^b\ge\frac1\alpha\ \Longrightarrow\ \text{拒绝 }H_0^{\mathrm{syn}}. \tag{28}
$$

在 $H_0^{\mathrm{syn}}$ 下，该拒绝规则满足第一类错误要求 (14) [29]。在下注解释中，赌徒持续下注直到财富增至目标 $1/\alpha$，此时过程停止并拒绝零假设。该过程如图 4 所示。文献 [29] 还提供了优化下注函数 $G^b$ 以最大化检验功效的机制，即选择在备择 $H_1^{\mathrm{syn}}$ 成立时使财富增长最快的赌徒策略。令

$$
\eta=\Pr_P\left(I^b=1\mid I^1,\dots,I^{b-1}\right) \tag{29}
$$

表示给定过去指示时当前符号翻转产生 $\hat\Delta^b\ge\hat\Delta$ 的概率。在备择 $H_1^{\mathrm{syn}}$ 下最大化 e-过程 (27) 平均对数增长的最优下注函数 $G_\star^b$ 为

$$
G_\star^b(0)=(1-\eta)\frac{b+1}{b-L^{b-1}},\qquad G_\star^b(1)=\eta\frac{b+1}{L^{b-1}+1}. \tag{30}
$$

该最优下注函数按构造满足预算约束 (26)。

由于概率 $\eta$ 在实践中未知，文献 [29] 提出用确定性常数替代：

$$
\hat\eta=\frac{1}{\left\lfloor\sqrt{2\pi e^{1/6}}/\alpha\right\rfloor}. \tag{31}
$$

该选择下可证明：若采用式 (30) 且 $\eta=\hat\eta$，则每当用固定轮数 $B$ 由 (22) 计算的 $p$ 值满足 $p\le\hat\eta$ 时，存在某轮 $\tilde B\le B$ 使 $W^{\tilde B}\ge1/\alpha$。这使设置 (31) 成为参数 $\hat\eta$ 的有理论依据的选择。

> **图 4（原文 Fig. 4）：** eSFT [29] 示意：过程在 e-过程首次满足 $W^b\ge1/\alpha$ 的步 $b$ 处停止并拒绝零假设；测试数据集规模 $M$ 预先固定。

## V. 自适应基于对称性的合成数据检验

直接 aMT 表述只需要均值零假设 $\mathbb E[\delta]\le0$，但它还需要样本级损失的已知有限界 $L_{\max}$。相比之下，SFT、eSFT 与 aeSFT 不需要这样的界，因此可应用于无界损失或回报；它们的有效性改为要求 i.i.d. 成对差在 $H_0^{\mathrm{syn}}$ 下对称。把拒绝解释为合成数据增强有用的证据，还依赖第 II-B 节所述的"合成数据不会增大总体损失"假设。因此，基于对称性的路线用有界性假设换取了更强的分布与解释假设，而非严格支配直接检验。

SFT (20)–(23) 与 eSFT (26)–(28) 可直接应用于在对称性假设下检验合成数据是否有用。SFT 固定测试样本量 $M$ 与符号翻转序列数 $B$。eSFT 让符号翻转序列数 $B$（因而计算复杂度）自适应当前输入，但仍要求固定的测试数据集规模 $M$。

实践中，检验的主要瓶颈是所需测试数据量，因为测试数据集 $\mathcal D_{\mathrm{test}}$ 按假设必须服从真实分布 $P$，而 eSFT 无法解决这一问题。具体地，通过下注类比，eSFT 可视为一个数据池规模固定为 $M$ 的单一赌场，赌徒必须持续下注直到财富达到 $1/\alpha$。在该类比中，赌场是一批测试数据，赌注是当前财富，一次下注是一轮符号翻转。由于数据预算预先固定，eSFT 既不能为困难检验抽取更多数据以收集额外证据，也不能在更少样本已够用时通过自适应设计节省数据。

为解决这一局限，我们提出 aeSFT，它同时自适应符号翻转序列数（因而计算复杂度）与测试数据消耗量。再次采用下注类比，基本思想是让赌徒依次进入一系列赌场，每个赌场有独立的测试数据批：当前批次看起来无望时，赌徒提前停止并把累积财富带到有新鲜 i.i.d. 数据的新赌场，一旦跨赌场累积的总财富达到 $1/\alpha$ 即拒绝零假设 $H_0^{\mathrm{syn}}$。该检验通过两个 e-过程形式化：捕获每个赌场内财富增长的**批内 e-过程**，以及聚合跨赌场财富增长的**批间 e-过程**。

### A. 批内 e-过程

为支持测试数据的自适应使用，我们按规模为 $m_k$、$k=1,2,\dots$ 的顺序批次处理测试数据。在第 $k$ 批中，抽取全新不重叠的批次

$$
\mathcal D_k^{\mathrm{test}}=\{Z_{k,i}\}_{i=1}^{m_k}\overset{\mathrm{iid}}{\sim}P, \tag{32}
$$

以 i.i.d. 方式从真实分布 $P$ 抽取，且独立于先前批次。批 $k$ 内样本 $i$ 的成对目标差为

$$
\delta_{k,i}=\mathbb L(f;Z_{k,i})-\mathbb L(f^{\mathrm{syn}};Z_{k,i}), \tag{33}
$$

批 $k$ 对应的观测批统计量为

$$
\hat\Delta_k=\frac{1}{m_k}\sum_{i=1}^{m_k}\delta_{k,i}. \tag{34}
$$

与 eSFT 类似，在每个内层步 $b$ 评估符号翻转统计量

$$
\hat\Delta_k^b=\frac{1}{m_k}\sum_{i=1}^{m_k}s_{k,i}^b\delta_{k,i}, \tag{35}
$$

其中新的符号翻转序列 $\mathbf s_k^b$ 由独立生成的符号 $\{s_{k,i}^b\}_{i=1}^{m_k}\overset{\mathrm{iid}}{\sim}\mathrm{Unif}\{-1,+1\}$ 组成。如在 eSFT 中，定义指示 $I_k^b=\mathbb 1\{\hat\Delta_k^b\ge\hat\Delta_k\}$ 与累计计数 $L_k^b=\sum_{j=1}^b I_k^j$。与 (27) 类似，这些量用于更新批内 e-过程

$$
W_k^b=W_k^{b-1}G_k^b(I_k^b). \tag{36}
$$

依照 (30)，下注函数 $G_k^b(\cdot)$ 选为

$$
G_k^b(0)=(1-\hat\eta)\frac{b+1}{b-L_k^{b-1}},\qquad G_k^b(1)=\hat\eta\frac{b+1}{L_k^{b-1}+1}, \tag{37}
$$

其中 $\hat\eta$ 由 (31) 给出。从单位赌注 $W_k^0=1$ 开始，批内 e-过程 $W_k^b$ 记录赌徒的财富在赌场 $k$ 的前 $b$ 次下注中被乘上的因子。

在每个批 $k$ 内，符号翻转轮数 $B_k$ 自适应选择。由于 aeSFT 允许赌徒转移到新赌场，过程可在批内提前停止而不拒绝零假设（若当前批变得无望）。具体地，在观测到第 $b$ 轮为止的结果后，是否结束当前批可遵循任何仅依赖迄今已收集信息 $\{I_k^1,\dots,I_k^b\}$ 的准则，以保持 e-过程性质。例如，过程可在 $W_k^b\ge1/\alpha$ 或 $W_k^b\le\alpha$ 时停止。下一批规模 $m_{k+1}$ 在抽取下一测试批之前选定。aeSFT 采用的具体批内停止规则与批规模调度详见第 V-C 节。

> **图 5（原文 Fig. 5）：** aeSFT 示意。在每个批 $k$ 内，检验使用规模为 $m_k$ 的新测试集 $\mathcal D_k^{\mathrm{test}}$ 与自适应轮数 $B_k$ 的符号翻转。

### B. 批间 e-过程

令 $W_k^{B_k}$ 表示批 $k$ 的批内 e-过程最终值。在每个批内 $b=1,\dots,B_k$，且对 $(k,b)$ 按字典序排列。批间 e-过程定义为所有已检验批内 e-过程值的乘积（如图 5 所示），其中批 $k$ 第 $b$ 轮符号翻转后的 e-值为

$$
\widetilde W_k^b=W_k^b\times\prod_{j=1}^{k-1}W_j^{B_j}, \tag{38}
$$

从 $\widetilde W_1^0=1$ 开始。在下注图景中，$\widetilde W_k^b$ 是赌徒的总财富。因子 $\prod_{j=1}^{k-1}W_j^{B_j}$ 是从先前访问过的赌场继承的财富，作为赌场 $k$ 的起始赌注；它再乘以当前批内财富增长 $W_k^b$，使证据跨批累积。该乘积在此处是自然的，因为它表示财富跨新批的序贯再投资，并在可预测自适应下保持随时有效的延续性 [23]。如下一定理所确立，该检验在 $H_0^{\mathrm{syn}}$ 下是 e-过程，并在符号翻转序列数 $\sum_kB_k$ 与测试数据集规模 $\sum_km_k$ 两方面保持自适应的同时满足 (14) 的第一类错误要求。

**定理 1.** 在 (10) 的零假设 $H_0^{\mathrm{syn}}$ 下，假设每个测试批独立于先前批次，$m_k$ 在抽取批 $k$ 之前选定，且 $B_k$ 是关于批内符号翻转历史的停时。则财富增长过程 $\widetilde W_k^b$ 是 e-过程。在首个满足 $\widetilde W_k^b\ge1/\alpha$ 的 $(k,b)$ 处拒绝零假设 $H_0^{\mathrm{syn}}$，可在水平 $\alpha$ 控制第一类错误，即

$$
\Pr_{H_0^{\mathrm{syn}}}\left(\exists(k,b):\widetilde W_k^b\ge1/\alpha\right)\le\alpha. \tag{39}
$$

**证明.** 证明见附录 A。

### C. 自适应预算调度

第 V-B 节的批间 e-过程使符号翻转总轮数 $\sum_kB_k$ 与测试数据集总规模 $\sum_km_k$ 都自适应。在此基础上，我们如下具体指定第 V-A 节引入的批内停止机制与相应批规模调度。

**a) 符号翻转轮数预算。** 在 eSFT [29] 中测试集固定，因此赌徒面对单一赌场，必须持续下注直到财富达到 $1/\alpha$。由于 aeSFT 中总有更多批可用，第 V-A 节的批内停止机制可改为结束当前批而不拒绝零假设，并用新鲜数据继续检验。

在提前停止一侧，坚持一个无望的批会浪费符号翻转轮并压低 $W_k^{B_k}$，使此后需要更多数据才能让 $\widetilde W_k^b$ 恢复。由于赌徒可转移到新赌场，我们在阈值 $\omega>\alpha$ 处宣布**批内提前停止**，以便在批次把财富削减到低至 $\alpha$ 倍之前止损。我们还要求 $\omega<1$，使提前停止只在批内财富跌破其单位起始值后触发。

在拒绝一侧，硬上限 $W_k^b\ge1/\alpha$ 适合于单赌场设置，因为它一旦可以拒绝零假设就停止。然而在 aeSFT 中，赌徒进入赌场 $k$ 时继承的财富可能低于 1，因此当该批仍能贡献新的拒绝证据时，一旦 $W_k^b\ge1/\alpha$ 就停止并不样本高效。因此我们把硬上限替换为受容差 $\epsilon>0$ 控制的**基于变化**的准则：只有当连续获胜轮不再使财富显著增加（表明该数据批中的证据已基本耗尽）时，才结束该批以进行**批内拒绝**。

形式上，批 $k$ 在满足下列条件之一的最小轮 $b$ 处停止：

$$
\begin{cases}
b\ge2,\ I_k^b=I_k^{b-1}=0,\ W_k^b-W_k^{b-1}\le\epsilon, & \text{批内拒绝},\\
W_k^b\le\omega, & \text{批内提前停止},
\end{cases} \tag{40}
$$

其中 $I_k^b=0$ 标记获胜轮。由于 $B_k$ 仍是关于 $\{I_k^1,\dots,I_k^{B_k}\}$ 的停时，该规则保持 e-过程性质。

**b) 测试数据集预算。** 虽然批间 e-过程已使总体数据消耗 $\sum_km_k$ 自适应，进一步自适应每个批的规模 $m_k$ 还能提高功效。为节省测试数据，人们希望以较小的初始批规模 $m_1=m_{\mathrm{init}}$ 开始检验。然而小批可能不足以代表真实分布 $P$，使抽样随机性掩盖真实但中等的改进，导致相应批次以批内提前停止结束。为在不牺牲小初始规模的前提下解决该问题，我们一旦当前批以批内提前停止结束就立即扩大下一批。下一规模 $m_{k+1}$ 在抽取批 $k+1$ **之前**、仅利用批 $1,\dots,k$ 的信息选定。因此 $m_{k+1}$ 关于直到批 $k$ 结束的历史可测，这正是定理 1 使用的可预测性条件：

$$
m_{k+1}=\begin{cases}
\lceil\beta m_k\rceil, & \text{若批 }k\text{ 以提前停止结束},\\
m_k, & \text{否则},
\end{cases} \tag{41}
$$

其中增长因子 $\beta>1$。该过程在首次 $\widetilde W_k^b\ge1/\alpha$ 时宣布**拒绝** $H_0^{\mathrm{syn}}$，否则在测试数据仍可用时持续抽取批次。若最大预算 $M$ 耗尽仍无拒绝，过程结论为无法拒绝 $H_0^{\mathrm{syn}}$。算法 1 总结 aeSFT。

> **算法 1　自适应 e-过程符号翻转检验（aeSFT）**
> **Require：** 已训练模型 $f^{\mathrm{syn}}$、$f$；水平 $\alpha\in(0,1)$；最大测试数据预算 $M$；初始批规模 $m_{\mathrm{init}}\in(0,M]$；增长因子 $\beta>1$；批内提前停止阈值 $\omega\in(\alpha,1)$；拒绝容差 $\epsilon>0$；下注参数 $\hat\eta$（式 (31)）
> 1: $k\leftarrow0$，$m_1\leftarrow m_{\mathrm{init}}$，$\widetilde W_1^0\leftarrow1$
> 2: **loop**
> 3: 　$k\leftarrow k+1$
> 4: 　抽取全新不重叠批 $\mathcal D_k^{\mathrm{test}}=\{Z_{k,i}\}_{i=1}^{m_k}$　▷ 新鲜真实测试数据
> 5: 　计算 $\delta_{k,i}$ 与 $\hat\Delta_k=(m_k)^{-1}\sum_i\delta_{k,i}$；置 $W_k^0\leftarrow1$，$b\leftarrow0$　▷ 初始化批次
> 6: 　**loop**　▷ 批内符号翻转检验
> 7: 　　$b\leftarrow b+1$
> 8: 　　抽取符号 $(s_{k,i}^b)$，计算 $\hat\Delta_k^b$ 与 $I_k^b$
> 9: 　　更新 $W_k^b\leftarrow W_k^{b-1}G_k^b(I_k^b)$
> 10: 　　$\widetilde W_k^b\leftarrow W_k^b\times\prod_{j=1}^{k-1}W_j^{B_j}$
> 11: 　　**if** $\widetilde W_k^b\ge1/\alpha$ **then return** 拒绝 $H_0^{\mathrm{syn}}$　▷ 批间拒绝
> 12: 　　**end if**
> 13: 　　**if** $b\ge2$ 且 $I_k^b=I_k^{b-1}=0$ 且 $W_k^b-W_k^{b-1}\le\epsilon$ **then** $B_k=b$，**break**　▷ 批内拒绝
> 14: 　　**end if**
> 15: 　　**if** $W_k^b\le\omega$ **then** $B_k=b$，**break**　▷ 批内提前停止
> 16: 　　**end if**
> 17: 　**end loop**
> 18: 　**if** $W_k^{B_k}\le\omega$ **then**　▷ 批内提前停止：扩大下一批
> 19: 　　$m_{k+1}\leftarrow\lceil\beta m_k\rceil$
> 20: 　**else**　▷ 批内拒绝：保持批规模
> 21: 　　$m_{k+1}\leftarrow m_k$
> 22: 　**end if**
> 23: 　**if** $\sum_{j=1}^{k+1}m_j>M$ **then return** 无法拒绝 $H_0^{\mathrm{syn}}$
> 24: 　**end if**
> 25: **end loop**

## VI. 实验

本节通过带合成训练数据的二分类任务、带合成环境的无线分组调度任务与带低保真射线追踪数据的无线电地图预测任务，对 aeSFT 进行实验评估。基线包括第 III 节描述的 aMT [25]、第 IV-B 节介绍的 eSFT [29] 与固定样本 $t$ 检验 [33]。$t$ 检验基于在预定样本量下由成对差 $\delta$ 的均值与方差计算的 $p$ 值，并要求这些差服从高斯分布的额外假设。

除非另有说明，我们设目标水平 $\alpha=0.1$，所有方法的最大测试数据预算 $M=2{,}000$，初始批规模 $m_{\mathrm{init}}=200$，批内提前停止阈值 $\omega=0.5$，批增长因子 $\beta=1.2$，aeSFT 的变化容差 $\epsilon=0.1$，并使用对特定备择自适应的近似增长率（aGRAPA）下注策略 [25] 确定 aMT 中式 (16) 的参数 $\mu_i$。

### A. 二分类

**设置。** 我们考虑五维输入的二分类任务，使用 $L_2$ 正则化逻辑分类模型以二元交叉熵损失训练 [34]。为构造该任务，我们对 i.i.d. 标准高斯元组成的 $5\times5$ 矩阵作 QR 分解得到随机正交矩阵 $U$，并设 $\Sigma=U\Lambda U^\top$，其中 $\Lambda=\mathrm{diag}(1,\rho,\rho^2,\rho^3,\rho^4)$，$\rho=0.65$。每次运行中，权重向量 $w$ 与噪声向量 $\xi$ 的元素分别独立地从 $[-1,1]$ 与 $[-0.25,0.25]$ 上的均匀分布抽取。真实与测试输入服从分布 $P_X=\mathcal N(0,\Sigma)$，其标签生成为 $y\mid x\sim\mathrm{Bernoulli}(\sigma(x^\top w))$。合成输入服从不同分布 $P_X^{\mathrm{syn}}=\mathcal N(0,\Sigma_r)$，其中 $\Sigma_r$ 是 $\Sigma$ 从其特征分解得到的秩 $r$ 前导近似，其标签同样用扰动参数 $w^{\mathrm{syn}}=w+\xi$ 生成。因此合成数据通过协方差矩阵近似与标签映射噪声两方面不同于真实数据。数据集规模分别设为真实数据集 $n=100$、合成数据集 $n^{\mathrm{syn}}=50$。

**评估。** 合成数据集 $\mathcal D^{\mathrm{syn}}$ 的真实有用性由模型 $f$ 与 $f^{\mathrm{syn}}$ 之间的真实总体损失差 $\Delta=\mathbb L(f)-\mathbb L(f^{\mathrm{syn}})$ 评估，并在独立的 10,000 样本留出集上估计。

**结果。** 首先考察合成数据有用的设置，即零假设 (6) 为假、$\Delta>0$。图 6 可视化不同方法随消耗测试数据积累反对零假设证据的过程。eSFT 使用固定的测试批规模 $M=2{,}000$，因此其 e-值在处理完全部 2,000 个数据样本前保持为 1，然后在判定点跳变。类似地，$t$ 检验在消耗全部 2,000 个测试样本后拒绝零假设，其证据值绘为 $p$ 值的倒数。

相反，aeSFT 以自适应批次处理测试数据，产生步进式轨迹，在消耗 680 个数据样本后达到拒绝阈值。aMT 基线也在每个单独测试观测后更新 e-值，并在消耗约 1,410 个数据样本后达到拒绝阈值。因此在该实例中，aeSFT 用比全部三个基线更少的测试样本来积累足够的拒绝证据。

> **图 6（原文 Fig. 6）：** 在合成数据有用的测试实例（$\Delta>0$）中，证据积累随消耗测试数据的变化。$t$ 检验 $p$ 值的倒数仅作为视觉评分展示；纵轴为对数刻度。

图 7 绘制备择假设 $H_1$（合成数据有用）下各方法停时 $m_{\mathrm{stop}}$ 的经验累积分布函数（CDF）。该分布通过选取 $\Delta>0$ 的运行（即合成数据有用的运行）得到。aMT 与 aeSFT 都能在较容易的测试实例上于最大预算之前停止，而 eSFT 与 $t$ 检验总是在预先指定的固定样本量 $M=2{,}000$ 处作出判定。特别地，aeSFT 把显著更多的概率放在较小停时上，表明其在证据很强时提前终止的能力。

> **图 7（原文 Fig. 7）：** 二分类任务中 aMT、eSFT、$t$ 检验与 aeSFT 在备择假设 $H_1$（合成数据有用）下停时 $m_{\mathrm{stop}}$ 的经验 CDF。

为进一步评估 aeSFT 与 aMT 的平均样本效率，我们报告真阳性率（TPR）与假阳性率（FPR）随测试轮 $i$（即使用 $i$ 个数据点）的变化。TPR 由

$$
\mathrm{TPR}(i)=\mathbb E_{H_1}\left[\mathbb 1\{D(Z^i)=\text{拒绝 }H_0\}\right] \tag{42}
$$

给出，FPR 由

$$
\mathrm{FPR}(i)=\mathbb E_{H_0}\left[\mathbb 1\{D(Z^i)=\text{拒绝 }H_0\}\right] \tag{43}
$$

给出，其中 $D(Z^i)=D(Z^{m_{\mathrm{stop}}})$ 对 $i\ge m_{\mathrm{stop}}$。相应平均停时用 $\mathbb E_{H_j}[m_{\mathrm{stop}}(i)]$ 评估，其中 $j\in\{0,1\}$，$m_{\mathrm{stop}}(i)=m_{\mathrm{stop}}$ 对 $i\ge m_{\mathrm{stop}}$、$m_{\mathrm{stop}}(i)=i$ 对 $i<m_{\mathrm{stop}}$。

所绘 FPR 对每种方法都使用相同的直接零假设 $\Delta\le0$。该经验比较不同于形式保证：aMT 在直接均值零假设 $H_0$ 下控制第一类错误，而 SFT、eSFT 与 aeSFT 在对称性零假设 $H_0^{\mathrm{syn}}$ 下控制它。在 1,000 个独立测试实例中，573 个满足 $H_1$、427 个满足 $H_0$。图 8 绘制 aMT、eSFT、$t$ 检验与 aeSFT 的 TPR 与 FPR 随平均消耗数据的变化。

作为参照，eSFT 与 $t$ 检验的每个点对应一个单独预先指定的固定数据集规模。例如，若在检验前选定 $M=200$，就不能在查看结果后把 $M$ 增大以继续同一检验，否则会造成 $p$ 值篡改并可能破坏第一类错误保证。相反，aMT 与 aeSFT 允许统计上有效的延续，从而在初始批不足时提供更大灵活性以提高功效。在自适应方案中，如图 8 所示，aeSFT 的 TPR 显著高于 aMT，尤其在平均消耗测试数据集规模较小时，表明其样本效率更高。由于 aeSFT 以 $m_{\mathrm{init}}=200$ 点的初始批开始，其 TPR 曲线必然是步进的，在初始批消耗完之前不会上升。其在零假设 $H_0$ 下的经验 FPR 保持在目标水平 $\alpha=0.1$ 以下。

> **图 8（原文 Fig. 8）：** 在 1,000 个独立合成数据检验上、目标水平 $\alpha=0.1$ 下，aMT、eSFT、$t$ 检验与 aeSFT 的 TPR 与 FPR。

图 9 报告对 aeSFT 四个设计参数的重复一次一因子消融。当 TPR 与最大平均 TPR 之差在合并的 98% 标准误范围内时，我们认为 TPR 接近最优，然后选择使 $\mathbb E_{H_1}[m_{\mathrm{stop}}]$ 最小的参数设置。所得设置为 $\omega=0.5$、$\beta=1.2$、$\epsilon=0.1$、$m_{\mathrm{init}}=200$，此时平均 TPR 为 0.612±0.026、平均 FPR 为 0.027±0.007、$\mathbb E_{H_1}[m_{\mathrm{stop}}]=1{,}024$ 个样本。作为比较，$m_{\mathrm{init}}=300$ 会把平均 TPR 略升到 0.624，但也把 $\mathbb E_{H_1}[m_{\mathrm{stop}}]$ 升到 1,068 个样本。因此我们保留 $m_{\mathrm{init}}=200$ 作为更数据高效的选择。

> **图 9（原文 Fig. 9）：** 二分类实验中 aeSFT 的参数消融。实线显示 TPR 与 FPR，菱形显示 $\mathbb E_{H_1}[m_{\mathrm{stop}}]$，黑色虚线标出所选值，水平点线标出 $\alpha=0.1$。

### B. 无线网络分组调度

**设置。** 我们现在考虑无线网络中的分组调度任务 [35], [36]。如图 10 所示，数据包属于三类，类别相关到达率为 $\mu_k$（$k=1,2,3$）。使用 Pareto ON/OFF 调制的 Poisson 过程建模业务突发与时间变化 [37]。对每一类，包计数速率在 ON 状态（即突发期）为 $3\mu_k$，在 OFF 状态（即空闲期）为 $0.25\mu_k$。ON 与 OFF 时长分别服从形状参数 1.4 与 1.6、尺度参数 3 与 10.5 个时隙的 Pareto 分布。这些尺度给出约 0.25 的长期 ON 占比，从而保持平均到达率 $\mu_k$。类 $k$ 的分组在被服务时需要 $b_k$ 单位带宽，并各自产生网络奖励 $R_k$。未被立即服务的分组可在相应缓冲区停留至多 $\tau_k$ 个时隙。

令 $q_{k,j}^t\in[0,\tau_k]$ 表示时隙 $t$ 类 $k$ 缓冲区中第 $j$ 个分组的剩余等待时间。已占用位置按剩余时间递增排序，并在其后以零填充到缓冲容量 $N_{\max}$。状态为 $s^t=(q_{k,j}^t)_{k=1,\dots,3;j=1,\dots,N_{\max}}$。每个未服务分组的剩余时间在一个时隙后减 1，到达零时分组过期。基于该状态，分组调度器选择每个时隙服务各类多少分组。所得决策记为 $n^t=(n_1^t,n_2^t,n_3^t)$，受 $0\le n_k^t\le\sum_j\mathbb 1\{q_{k,j}^t>0\}$ 与共享带宽约束 $\sum_{k=1}^3b_kn_k^t\le C$ 限制。时隙 $t$ 的相应总奖励为 $r^t=\sum_{k=1}^3R_kn_k^t$。优化目标是学习使网络长期平均奖励最大化的策略，从而在即时分组奖励与拥塞和截止期过期之间权衡。

为生成该任务的合成训练数据，我们构造所考虑系统的 DT 环境。具体地，我们扰动每个分组类的真实到达率与截止期：

$$
\mu_k^{\mathrm{syn}}=\mu_k+\xi_k^\mu,\qquad \tau_k^{\mathrm{syn}}=\tau_k+\xi_k^\tau, \tag{44}
$$

其中扰动 $\xi_k^\mu$ 与 $\xi_k^\tau$ 在重复试验中分别从 $[-\mu_k/2,\mu_k/2]$ 与 $[-\tau_k/2,\tau_k/2]$ 上的均匀分布抽取。带宽需求、分组奖励、共享容量、状态定义与动作空间保持不变。

我们采集由真实环境中生成的轨迹组成的固定真实数据集 $\mathcal D$，以及由 DT 环境中生成的轨迹组成的合成数据集 $\mathcal D^{\mathrm{syn}}$。一条轨迹是一次决策回合中生成的状态、动作、奖励与状态转移序列。我们使用深度 Q 学习作为学习算法 $\mathcal A(\cdot)$。训练为离线：Q 网络仅从这些数据集中存储的轨迹学习，不再与环境交互 [38]。两个模型 $f$ 与 $f^{\mathrm{syn}}$ 都实现为相同架构的深度 Q 网络（DQN）[39]，并分别在 $\mathcal D$ 与 $\mathcal D\cup\mathcal D^{\mathrm{syn}}$ 上训练。完整配置汇总于附录 B。

**评估。** 对真实环境交互回合 $Z$（$T=60$ 个时隙），所用评估损失为平均归一化回合回报的补：

$$
\mathbb L(f;Z)=1-\frac{1}{\bar rT}\sum_{t=1}^Tr_t\in[0,1], \tag{45}
$$

其中 $r_t$ 是模型 $f$ 获得的未归一化时隙奖励，$\bar r$ 是有效的每时隙奖励上界。因此成对损失差 $\delta=\mathbb L(f;Z)-\mathbb L(f^{\mathrm{syn}};Z)$ 等于模型 $f$ 与 $f^{\mathrm{syn}}$ 的归一化回报之差。损失有界，$L_{\max}=1$，因此 aMT 适用。

训练两个模型后，我们判定来自 DT 的合成数据在真实部署中是否确实有用。如第 VI-A 节的二分类任务，我们通过在 200 个留出真实环境交互回合上评估 $f$ 与 $f^{\mathrm{syn}}$ 之间的直接总体差 $\Delta$ 来定义真实有用性。在 200 个测试实例中，99 个满足 $H_1$、101 个满足 $H_0$。

> **图 10（原文 Fig. 10）：** 三类分组调度任务 [35]。调度策略为分组分配共享带宽池，以最大化期望网络奖励。

**结果。** 图 11 绘制分组调度任务中各方法在备择假设 $H_1$（合成数据有用）下停时 $m_{\mathrm{stop}}$ 的经验 CDF。图中表明两种自适应方案都能在较容易的测试实例上于耗尽全部回合前终止。aeSFT 允许比 aMT 小得多的停时，而 eSFT 与 $t$ 检验只在预先指定的固定样本量处作出判定。

> **图 11（原文 Fig. 11）：** 无线分组调度任务中 aMT、eSFT、$t$ 检验与 aeSFT 在备择假设 $H_1$（合成数据有用）下停时 $m_{\mathrm{stop}}$ 的经验 CDF。

如图 8，图 12 绘制 aMT、eSFT、$t$ 检验与 aeSFT 的 TPR 与 FPR 随所消耗测试回合的变化。图中表明 aeSFT 明显早于 aMT 检测出有用的合成轨迹。在消耗初始批 $m_{\mathrm{init}}=16$ 个真实测试回合后，aeSFT 达到 TPR 0.657，而 aMT 仍接近零。aeSFT 的 TPR 在 31.8 个回合处达到 0.717，在最终平均消耗 88.0 个回合时达到 0.778。相反，aMT 在 15 个回合内保持为零，只有在平均消耗 68.9 与 143.6 个回合后才分别达到 TPR 0.505 与 0.717。作为参照，eSFT 与 $t$ 检验达到约 0.7 到 0.85 的 TPR 水平，但代价是必须为每次检验预先指定固定样本量。

> **图 12（原文 Fig. 12）：** 分组调度任务中 aMT、eSFT、$t$ 检验与 aeSFT 的 TPR 与 FPR 随平均消耗真实网络测试回合数的变化，目标水平 $\alpha=0.1$。

> **原文疑点：** 第 VI 节开头称"除非另有说明"所有方法的最大测试数据预算 $M=2{,}000$、初始批规模 $m_{\mathrm{init}}=200$；但第 VI-B 节随后直接使用"初始批 $m_{\mathrm{init}}=16$ 个真实测试回合"，并在 200 个测试实例上评估，文中未在该处显式声明对 $M$ 与 $m_{\mathrm{init}}$ 的覆盖。此处按原文照录并加注。

下方面板表明所有方法都远低于目标 FPR $\alpha=0.1$。因此在该网络控制任务中，aeSFT 提供了有利折中：它保持低 FPR、用显著更少的真实网络评估回合识别出有用的合成环境，并保留用新鲜数据继续检验的灵活性。

### C. 无线电地图预测

**设置。** 无线电地图描述基站信号强度在地理区域上的分布，是无线网络规划的重要输入。基于物理的射线追踪（如 NVIDIA Sionna RT [11]）可从三维（3D）场景生成精确无线电地图，但当最大反射深度与每发射机（Tx）射线数增加时其代价迅速增长。例如，高精度设置可能使用反射深度（即无线电波射线可被物体反射的最大次数）20 与 $1\times10^9$ 射线/Tx [40]。这促使 PMNet [31] 与 AIRMap [40] 等基于神经网络的预测器，它们学习直接从几何地图预测完整无线电地图，而无需在推理时运行射线追踪。

具体地，采用与 [40] 和 [31] 类似的设置，我们考虑 $512\ \mathrm{m}\times512\ \mathrm{m}$ 区域离散为 $128\times128$ 网格。无线电地图预测的输入由建筑高度图与基站位置和高度组成，输出是每个网格单元的接收信号强度（RSS）。真实世界几何场景从 OpenStreetMap [41] 导入。图 13 说明给定场景下射线追踪保真度的影响，黑色区域表示建筑，给定基站位置用星标标记。较小的射线下注预算产生稀疏地图与大片未覆盖区域，而增加射线数与反射深度可解析更多非视距路径，产生更稠密的无线电地图；然而这些改进以计算复杂度增加为代价。

> **图 13（原文 Fig. 13）：** 对固定的 $512\ \mathrm{m}\times512\ \mathrm{m}$ 场景（从 OpenStreetMap [41] 导入）与给定基站位置（星标），Sionna RT [11] 在不同反射深度（最大反射次数）与 rays/Tx 设置下的无线电地图。

我们把深度 20、$10^9$ 射线/Tx 生成的地图视为高保真真实数据 $\mathcal D$，而在 $14\times14$ 网格上生成低保真合成地图 $\mathcal D^{\mathrm{syn}}$，其深度范围为 1 到 14、射线/Tx 范围为 $10^4$ 到 $10^5$ 对数间隔。这产生 196 个不同射线追踪保真度的低保真合成数据集 $\mathcal D^{\mathrm{syn}}$。3D 场景、Tx 布局与射线种子在全部 196 个设置间共享，以隔离合成数据保真度的影响。

我们为每个射线追踪保真度训练一个基于数据集 $\mathcal D$ 的基线模型 $f$ 与一个合成数据增强模型 $f^{\mathrm{syn}}$。真实数据集包含 64 个高保真样本，每个合成数据集包含 192 张低保真地图。损失为把 RSS 归一化到 $[0,1]$ 后的带掩码逐地图均方误差（MSE）[31]。所有模型用相同架构与超参数训练，完整配置见附录 B。我们使用最多 400 张高保真测试地图的预算、初始批规模 $m_{\mathrm{init}}=50$ 与批增长因子 $\beta=1.6$。

**评估。** 对每个合成模型，在留出高保真地图 $Z$ 上的成对改进由 $\delta=\mathbb L(f;Z)-\mathbb L(f^{\mathrm{syn}};Z)$ 给出。我们用 1,000 张独立高保真地图上的平均改进确定其真实有用性。这产生 $H_1$ 下 123 个有用设置与 $H_0$ 下 73 个无用设置。所有统计检验随后在另一组 400 张高保真地图上运行。对 aMT，我们把 $L_{\max}$ 设为所有模型所有测试样本上的最大损失。

**结果。** 图 14 报告有用合成数据集（即备择 $H_1$ 下）停时的经验 CDF。在该实验中，aMT 在前 350 张地图内没有拒绝，在完整 400 张地图预算内只识别出 123 个有用合成数据集中的 4 个。相反，aeSFT 在消耗 50 张地图的初始批后识别出 123 个有用合成数据集中的 57 个。eSFT 与 $t$ 检验只在各自预先指定的固定样本量处作出判定。

> **图 14（原文 Fig. 14）：** 无线电地图预测任务中 aMT、eSFT、$t$ 检验与 aeSFT 在备择假设 $H_1$（合成数据有用）下停时 $m_{\mathrm{stop}}$ 的经验 CDF。

如前面实验，图 15 比较 TPR 与 FPR 随平均消耗高保真测试地图数的变化。在初始批 $m_{\mathrm{init}}=50$ 张地图后，aeSFT 已达到 TPR 0.463，而 aMT 仍为零。通过自适应延续，aeSFT 在备择 $H_1$ 下把 TPR 在平均消耗 135.9 张地图时提高到 0.480，在 227.4 张时提高到 0.512。其经验 FPR 在初始批后为 0.014，在 $H_0$ 下平均消耗 207.8 张地图时升至 0.096，仍低于 $\alpha=0.1$。相反，aMT 在所显示的消耗范围内没有拒绝。

> **图 15（原文 Fig. 15）：** 196 个设置上 aMT、eSFT、$t$ 检验与 aeSFT 的 TPR 与 FPR 随平均消耗高保真无线电地图数的变化，目标水平 $\alpha=0.1$。

图 15 中 aeSFT 的早期检测增益是在保持受控的经验误报行为下获得的。具体地，aeSFT 的 FPR 在第一批后为 0.014，在 $H_0$ 下直到平均消耗约 200 张地图仍保持 0.014，并在进一步延续后升至 0.096，仍低于目标水平 $\alpha=0.1$。作为参照，eSFT 与 $t$ 检验在某些固定样本量下达到更高 TPR，但每个点都要求单独预先指定的测试规模，且不允许同一检验的延续。

虽然 MSE 被广泛用于评估无线电地图预测精度，用户调度 [42] 与基站覆盖优化 [43] 等下游无线通信应用往往更关心可提供足够强信号的空间范围。为捕捉该信息，我们把无线电地图的**有希望区域**定义为 RSS 至少为 $-80$ dBm 的像素集合，并用预测与真实有希望区域之间的交并比（IoU）评估其预测。相应地，逐地图损失定义为 $L_{\mathrm{IoU}}=1-\mathrm{IoU}\in[0,1]$，因为 IoU 越大表示预测越好。该损失具有确定性界 $L_{\max}=1$，直接满足 aMT 的有界损失要求。我们用同样的 1,000 张留出地图上的平均 IoU 改进重新计算每个合成数据集的真实有用性，得到 $H_1$ 下 93 个设置、$H_0$ 下 103 个设置。

> **图 16（原文 Fig. 16）：** 196 个无线电地图设置上 IoU 指标对应的 aMT、eSFT、$t$ 检验与 aeSFT 的 TPR 与 FPR 随平均消耗高保真无线电地图数的变化，目标水平 $\alpha=0.1$。

图 16 表明 aeSFT 在保持自适应数据消耗优势的同时达到与固定样本基线相当的检测性能。具体地，aeSFT 在 $H_1$ 下平均消耗 40 张地图后达到 TPR 0.925，而 eSFT 与 $t$ 检验在相同的预先指定样本量 40 下分别达到 TPR 0.957 与 0.968。我们还观察到 aMT 在平均消耗 40 张地图后达到 TPR 0.957，较其在基于 MSE 的实验中的表现有实质提升。该观察与前面关于直接检验的讨论一致：IoU 损失自然有界，且损失差中重尾行为不明显，这为基于均值的序贯检验提供了更有利的条件。全部四种方法都保持零经验 FPR。

## VII. 结论

DT 与学习型世界模型可缓解真实训练数据的稀缺，但 sim-to-real 差距意味着合成数据增强并不能可靠地提升真实世界性能。本工作研究了：给定真实训练数据集、候选合成数据集与固定学习算法，如何判定增强是否提升总体层面性能，同时使用尽可能少的真实测试数据点。具体地，我们提出 aeSFT，同时自适应 Monte Carlo 符号翻转轮数与所消耗真实测试数据量。其批内 e-过程度量当前批内证据，批间 e-过程跨独立批复合证据。在对称性零假设下，当累积证据首次超过 $1/\alpha$ 时停止，可在不需要预先指定测试集大小或已知有限损失界的情况下把第一类错误控制在水平 $\alpha$。

在二分类、无线分组调度与无线电地图预测中，aeSFT 一致地比 aMT 更早检测出有用合成数据。在二分类任务中，aeSFT 在消耗 500 个测试样本后达到 0.5 以上的 TPR，而 aMT 平均需要超过 1,000 个样本才能达到相同 TPR。在分组调度中，aeSFT 在初始 16 个真实测试回合后达到 TPR 0.657，aMT 接近零；其在 $H_1$ 下的平均停时为 88.0 个回合，而 aMT 为 143.6。在无线电地图预测中，aeSFT 在 50 张高保真地图后达到 TPR 0.463，而 aMT 仍为零；自适应延续把其 TPR 提高到 0.512，同时保持经验 FPR 低于 $\alpha=0.1$。固定样本的 eSFT 与配对 $t$ 检验在某些预先指定样本量下达到相当功效，但不允许同一检验用额外数据继续。总体上，aeSFT 在保持 FPR 低于目标水平的同时提供早期检测与随时有效的延续。

一般而言，aeSFT 适用于任何可在真实测试数据上评估成对损失差的设置，尤其当可信的真实评估代价高昂时。在无线通信中，它可用有限的现场测量或高保真仿真评估由网络 DT 生成的合成信道状态、无线电地图或网络控制轨迹。对大语言模型，它可用有限专家标注提示或人类偏好评估来评估合成指令、推理或偏好数据集。在机器人与自动驾驶中，它可用真实世界 rollout 验证世界模型生成的感知数据与控制轨迹。通过只对仍未解决的候选合成数据集分配额外真实评估，aeSFT 在合成数据生成与其下游使用之间提供了一个统计受控且高效的验证层。

## 附录 A. 定理 1 的证明

我们证明：在 (10) 的零假设 $H_0^{\mathrm{syn}}$ 与定理 1 所述条件下，式 (38) 定义的批间财富增长过程 $\widetilde W_k^b$ 是 e-过程，从而拒绝规则 $\widetilde W_k^b\ge1/\alpha$ 把第一类错误控制在水平 $\alpha$。

**a) 批内 e-过程。** 我们首先确立每个批中的批内财富增长过程是 e-过程。固定批 $k$，令 $\mathcal F_k^b$ 表示批内检验历史，定义为到第 $b$ 步为止观测到的符号翻转指示生成的 $\sigma$-代数，即

$$
\mathcal F_k^b=\sigma\left(I_k^1,\dots,I_k^b\right). \tag{46}
$$

由预算约束 (26)，在 $H_0^{\mathrm{syn}}$ 下下注函数满足 $\mathbb E_{H_0^{\mathrm{syn}}}[G_k^b(I_k^b)\mid\mathcal F_k^{b-1}]=1$，因此从 $W_k^0=1$ 开始的批内过程 $(W_k^b)_{b\ge0}$ 是非负检验鞅 [29]，即

$$
\mathbb E_{H_0^{\mathrm{syn}}}\left[W_k^b\mid\mathcal F_k^{b-1}\right]=W_k^{b-1}. \tag{47}
$$

这是赌场 $k$ 内的公平博弈性质：在零假设下，单次下注不能期望增加赌徒财富。轮数 $B_k$ 是关于 $(\mathcal F_k^b)_{b\ge0}$ 的停时，即是否在第 $b$ 步停止的决策只使用批数据与到第 $b$ 步为止观测到的指示。由非负检验鞅的可选停时定理 [23]，停止后的财富因此满足

$$
\mathbb E_{H_0^{\mathrm{syn}}}\left[W_k^{B_k}\right]\le1, \tag{48}
$$

这确立了每个停止后的批内财富都是 $H_0^{\mathrm{syn}}$ 下的有效 e-值。

**b) 批间 e-过程。** 我们接着证明批间乘积是 e-过程。整个过程的停时取决于累积财富，而累积财富又取决于跨批 $1,\dots,k$ 观测到的所有符号翻转指示与测试批的历史，因此我们考虑所有批的联合历史。

我们用按字典序排列的对 $(k,b)$ 索引整个过程，其中步 $(k,b)$ 是批 $k$ 的第 $b$ 轮符号翻转；令 $\mathcal H_k^b$ 表示批间检验历史，定义为到步 $(k,b)$ 为止观测到的符号翻转指示生成的 $\sigma$-代数，即

$$
\mathcal H_k^b=\sigma\left(\{I_k^1,\dots,I_k^b\}\cup\bigcup_{j=1}^{k-1}\{I_j^1,\dots,I_j^{B_j}\}\right). \tag{49}
$$

在批 $k$ 内，继承财富 $\prod_{j=1}^{k-1}W_j^{B_j}$ 是 $\mathcal H_k^{b-1}$-可测的。批规模 $m_k$ 在抽取批 $k$ 之前由过去选定，且该批中的新鲜观测是 i.i.d. 且独立于所有先前批次。因此以跨批历史为条件不改变当前批的条件分布，(47) 在以 $\mathcal H_k^{b-1}$ 为条件后仍成立。于是由 (38)，批间过程是非负检验鞅：

$$
\begin{aligned}
\mathbb E_{H_0^{\mathrm{syn}}}\left[\widetilde W_k^b\mid\mathcal H_k^{b-1}\right]&=\left(\prod_{j=1}^{k-1}W_j^{B_j}\right)\mathbb E_{H_0^{\mathrm{syn}}}\left[W_k^b\mid\mathcal H_k^{b-1}\right]\\
&=\left(\prod_{j=1}^{k-1}W_j^{B_j}\right)\mathbb E_{H_0^{\mathrm{syn}}}\left[W_k^b\mid\mathcal F_k^{b-1}\right]\\
&=\left(\prod_{j=1}^{k-1}W_j^{B_j}\right)W_k^{b-1}=\widetilde W_k^{b-1}. \tag{50}
\end{aligned}
$$

由非负检验鞅的可选停时定理 [23]，对整个过程关于 $\mathcal H_k^b$ 的任意停时 $(K,B_K)$，停止后的财富满足

$$
\mathbb E_{H_0^{\mathrm{syn}}}\left[\widetilde W_K^{B_K}\right]\le1, \tag{51}
$$

这确立了 $(\widetilde W_k^b)$ 是 e-过程。由 Ville 不等式，这进而给出

$$
\Pr_{H_0^{\mathrm{syn}}}\left(\exists(k,b):\widetilde W_k^b\ge1/\alpha\right)\le\alpha, \tag{52}
$$

这确立了 aeSFT 在水平 $\alpha$ 的第一类错误控制。□

## 附录 B. 实验配置

无线分组调度与无线电地图预测实验的配置分别汇总于表 II 与表 III。

> **表 II（原文 Table II）：** 无线分组调度实验配置。

| 组件 | 设置 |
|---|---|
| 环境 | 到达率 $\mu=(4.0,1.8,0.8)$；截止期 $\tau=(6,3,1)$；带宽 $b=(1,2,4)$；奖励 $R=(1,4,10)$；共享容量 $C=10$。 |
| 状态与动作 | 三个截止期桶缓冲区，$D_{\max}=8$，每桶容量上限 $N_{\max}=30$，给出 24 维归一化状态；66 个满足 $\sum_ku_k=C$ 的整数带宽分配。 |
| 回合与数据集 | $T=60$ 个时隙；$\lvert\mathcal D\rvert=10$ 条真实轨迹（600 个转移）；$\lvert\mathcal D^{\mathrm{syn}}\rvert=30$ 条合成轨迹（1,800 个转移）。 |
| 行为数据策略 | 以概率 0.55 采取贪心即时奖励动作，以概率 0.45 采取均匀选出的可行动作。 |
| DQN 架构 | 输入为状态与三个归一化动作计数；两个宽度 64 的全连接 ReLU 隐层；标量 Q 值输出。 |
| DQN 训练 | Adam，学习率 $10^{-3}$，Smooth-$L_1$ 损失，折扣 0.97，小批量 128，每 25 个梯度步更新目标网络，梯度范数裁剪 5。仅真实模型使用 120 次更新，池化数据模型使用 480 次更新，以保持数据遍历次数不变。 |

> **表 III（原文 Table III）：** 无线电地图预测实验配置。

| 组件 | 设置 |
|---|---|
| 空间网格 | $512\ \mathrm{m}\times512\ \mathrm{m}$ 窗口、4 m 单元，给出双通道 $128\times128$ 输入与单通道 $128\times128$ RSS 预测。 |
| 输入编码 | 通道 1 是表示为建筑高度网格并归一化到 $[0,1]$ 的 3D 几何；通道 2 除包含基站的正值单元（基站高度归一化到 $[0,1]$）外处处为零。 |
| 发射机设置 | 载波频率 3.5 GHz；发射功率 40 dBm；$1\times1$ 平面发射阵列，pattern=iso，垂直极化。 |
| 无线传播 | 无线电地图朝向 $(0,0,0)$；启用视距、镜面反射与衍射；所有建筑使用 itu_concrete，地面使用 itu_very_dry_ground；材料参数在所有数据集间固定。 |
| 预测器 | PMNet 编码器–解码器的紧凑版本 [31]。编码器使用 16 通道 stem 与四个瓶颈残差阶段（块数 (1,1,3,1)，输出宽度 (64,128,128,256)）；空洞空间金字塔池化（ASPP）组合五个并行 64 通道分支并投影到 128 通道；六个跳连解码块（宽度 (128,128,64,64,64,32)）重建 $128\times128$ 地图；最终头宽度 (34,16,16,1)，sigmoid 输出。 |
| 训练 | AdamW，学习率 $3\times10^{-4}$，权重衰减 $10^{-5}$，批大小 16，30 个 epoch；采用 ReduceLROnPlateau 调度器，因子 0.25、耐心 3。所有模型共享相同初始化与训练种子。 |

## 参考文献（英文原书目）

- [1] C. Ruah, H. Sifaou, O. Simeone, and B. M. Al-Hashimi, "How to bridge the sim-to-real gap in digital twin-aided telecommunication networks," IEEE Communications Magazine, 2026.
- [2] Z. Tao, W. Xu, Y. Huang, X. Wang, and X. You, "Wireless network digital twin for 6g: Generative AI as a key enabler," IEEE Wireless Communications, vol. 31, no. 4, pp. 24–31, 2024.
- [3] J. Hoydis, F. A. Aoudia, S. Cammerer, M. N.-D. Euch, L. Maggi, G. Marcus, and A. Keller, "Learning radio environments by differentiable ray tracing," IEEE Transactions on Machine Learning in Communications and Networking, vol. 2, 2024.
- [4] J. Hoydis, S. Cammerer, F. A. Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," arXiv preprint arXiv:2203.11854, 2022.
- [5] M. Polese, L. Bonati, S. D'Oro, P. Johari, D. Villa, S. Velumani, R. Gangula, M. Tsampazi, C. P. Robinson, G. Gemmi, A. Lacava, S. Maxenti, H. Cheng, and T. Melodia, "Colosseum: The open RAN digital twin," IEEE Open Journal of the Communications Society, vol. 5, pp. 5452–5466, 2024.
- [6] Z. Tao, W. Xu, and X. You, "Large vision model-enhanced digital twin with deep reinforcement learning for user association and load balancing in dynamic wireless networks," IEEE Journal on Selected Areas in Communications, vol. 44, pp. 2718–2732, 2026.
- [7] D. Ha and J. Schmidhuber, "World models," arXiv preprint arXiv:1803.10122, 2018.
- [8] D. Hafner, J. Pasukonis, J. Ba, and T. Lillicrap, "Mastering diverse domains through world models," arXiv preprint arXiv:2301.04104, 2023.
- [9] J. Bruce, M. D. Dennis, A. Edwards, J. Parker-Holder, Y. Shi, E. Hughes, M. Lai, A. Mavalankar, R. Steigerwald, C. Apps, Y. Aytar, S. Bechtle, F. Behbahani, S. Chan, N. Heess, L. Gonzalez, S. Osindero, S. Ozair, S. Reed, J. Zhang, K. Zolna, J. Clune, N. de Freitas, S. Singh, and T. Rocktäschel, "Genie: Generative interactive environments," in International Conference on Machine Learning (ICML), 2024.
- [10] J. B. Danijar Hafner, Jurgis Pasukonis and T. Lillicrap, "Mastering diverse control tasks through world models," Nature, vol. 640, pp. 647–653, 2025.
- [11] J. Hoydis, F. A. Aoudia, S. Cammerer, M. Nimier-David, N. Binder, G. Marcus, and A. Keller, "Sionna RT: Differentiable ray tracing for radio propagation modeling," arXiv preprint arXiv:2303.11103, 2023.
- [12] J. Tobin, R. Fong, A. Ray, J. Schneider, W. Zaremba, and P. Abbeel, "Domain randomization for transferring deep neural networks from simulation to the real world," in IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), 2017, pp. 23–30.
- [13] A. R. Mahmood, D. Korenkevych, G. Vasan, W. Ma, and J. Bergstra, "Benchmarking reinforcement learning algorithms on real-world robots," in Conference on Robot Learning (CoRL), vol. 87, 2018, pp. 561–591.
- [14] W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, B. Zhu, H. Zhang, M. Jordan, J. E. Gonzalez, and I. Stoica, "Chatbot Arena: An open platform for evaluating LLMs by human preference," in International Conference on Machine Learning (ICML), vol. 235, 2024, pp. 8359–8388.
- [15] C. Ruah, O. Simeone, J. Hoydis, and B. M. Al-Hashimi, "Calibrating wireless ray tracing for digital twinning using local phase error estimates," IEEE Transactions on Machine Learning in Communications and Networking, vol. 2, pp. 1193–1215, 2024.
- [16] C. Ruah, O. Simeone, and B. M. Al-Hashimi, "A Bayesian framework for digital twin-based control, monitoring, and data collection in wireless systems," IEEE Journal on Selected Areas in Communications, vol. 41, no. 10, pp. 3146–3160, 2023.
- [17] A. N. Angelopoulos, S. Bates, C. Fannjiang, M. I. Jordan, and T. Zrnic, "Prediction-powered inference," Science, vol. 382, no. 6671, pp. 669–674, 2023.
- [18] H. Sifaou and O. Simeone, "Semi-supervised learning via cross-prediction-powered inference for wireless systems," IEEE Transactions on Machine Learning in Communications and Networking, vol. 3, pp. 30–44, 2025.
- [19] C. Ruah, H. Sifaou, O. Simeone, and B. M. Al-Hashimi, "Context-aware doubly-robust semi-supervised learning," IEEE Signal Processing Letters, 2025.
- [20] P. W. Koh and P. Liang, "Understanding black-box predictions via influence functions," in International Conference on Machine Learning (ICML), 2017, pp. 1885–1894.
- [21] A. Ghorbani and J. Zou, "Data Shapley: Equitable valuation of data for machine learning," in International Conference on Machine Learning (ICML), 2019, pp. 2242–2251.
- [22] G. Shafer, "Testing by betting: A strategy for statistical and scientific communication," Journal of the Royal Statistical Society Series A: Statistics in Society, vol. 184, no. 2, pp. 407–431, 2021.
- [23] A. Ramdas and R. Wang, "Hypothesis testing with e-values," Foundations and Trends in Statistics, vol. 1, no. 1–2, pp. 1–390, 2025.
- [24] I. Waudby-Smith and A. Ramdas, "Estimating means of bounded random variables by betting," Journal of the Royal Statistical Society Series B: Statistical Methodology, vol. 86, no. 1, pp. 1–27, 2024.
- [25] M. Zecchin, S. Park, and O. Simeone, "Adaptive learn-then-test: Statistically valid and efficient hyperparameter selection," in International Conference on Machine Learning (ICML), 2025.
- [26] A. N. Angelopoulos, S. Bates, E. J. Candès, M. I. Jordan, and L. Lei, "Learn then test: Calibrating predictive algorithms to achieve risk control," The Annals of Applied Statistics, vol. 19, no. 2, pp. 1641–1662, 2025.
- [27] M. Sohm, C. Dezons, S. Sellami, O. Ninou, and A. Pincon, "Improving machine learning performance with synthetic augmentation," arXiv preprint arXiv:2604.14498, 2026.
- [28] D. M. Ritzwoller, J. P. Romano, and A. M. Shaikh, "Randomization inference: Theory and applications," arXiv preprint arXiv:2406.09521, 2025.
- [29] L. Fischer and A. Ramdas, "Sequential Monte Carlo testing by betting," Journal of the Royal Statistical Society Series B: Statistical Methodology, vol. 87, no. 4, pp. 1200–1220, 2025.
- [30] Z. Tao, W. Xu, and X. You, "Toward trustworthy digital twins in AI agent-based wireless network optimization: Challenges, solutions, and opportunities," IEEE Wireless Communications, pp. 1–7, 2026.
- [31] J.-H. Lee and A. F. Molisch, "A scalable and generalizable pathloss map prediction," IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 17 793–17 806, Sep. 2024.
- [32] A. Wald, Sequential Analysis. Mineola, NY: John Wiley & Sons, 1947.
- [33] J. Hemerik, "Multiple testing," arXiv preprint arXiv:2606.26781, 2026.
- [34] O. Simeone, Machine Learning for Engineers. Cambridge University Press, 2022.
- [35] N. Van Huynh, D. Thai Hoang, D. N. Nguyen, and E. Dutkiewicz, "Optimal and fast real-time resource slicing with deep dueling neural networks," IEEE Journal on Selected Areas in Communications, vol. 37, no. 6, pp. 1455–1470, 2019.
- [36] Z. Tao, W. Xu, and X. You, "Digital twin-accelerated online deep reinforcement learning for admission control in sliced communication networks," IEEE Transactions on Communications, vol. 73, no. 4, pp. 2490–2504, 2025.
- [37] M. Marvi, A. Aijaz, and M. Khurram, "On the use of ON/OFF traffic models for spatio-temporal analysis of wireless networks," IEEE Communications Letters, vol. 23, no. 7, pp. 1219–1222, 2019.
- [38] R. Figueiredo Prudencio, M. R. O. A. Maximo, and E. L. Colombini, "A survey on offline reinforcement learning: Taxonomy, review, and open problems," IEEE Transactions on Neural Networks and Learning Systems, vol. 35, no. 8, pp. 10 237–10 257, 2024.
- [39] V. Mnih, K. Kavukcuoglu, D. Silver, A. A. Rusu, J. Veness, M. G. Bellemare, A. Graves, M. A. Riedmiller, A. Fidjeland, G. Ostrovski, S. Petersen, C. Beattie, A. Sadik, I. Antonoglou, H. King, D. Kumaran, D. Wierstra, S. Legg, and D. Hassabis, "Human-level control through deep reinforcement learning," Nature, vol. 518, no. 7540, pp. 529–533, 2015.
- [40] A. Saeizadeh, M. Tehrani-Moayyed, D. Villa, J. G. Beattie, P. Johari, S. Basagni, and T. Melodia, "AIRMap: AI-generated radio maps for wireless digital twins," IEEE Transactions on Wireless Communications, vol. 25, pp. 18 871–18 884, June 2026.
- [41] M. Haklay and P. Weber, "OpenStreetMap: User-generated street maps," IEEE Pervasive Comput., vol. 7, no. 4, pp. 12–18, Oct. 2008.
- [42] B. Di, L. Song, and Y. Li, "Sub-channel assignment, power allocation, and user scheduling for non-orthogonal multiple access networks," IEEE Transactions on Wireless Communications, vol. 15, no. 11, pp. 7686–7698, 2016.
- [43] Z. Tao, Y. Li, W. Xu, Y. Huang, and X. You, "Intelligent base station deployment in urban wireless networks: A geographic data-informed digital twin approach," arXiv preprint arXiv:2608.14599, 2026.

## 图注与表注索引

本页图 1–16 的中文图注与表 I–III 的表注均按原文出现位置内联在正文中（图 1–2 见第 II–III 节，图 3–4 见第 IV 节，图 5 见第 V 节，图 6–9 见第 VI-A 节，图 10–12 见第 VI-B 节，图 13–16 见第 VI-C 节；表 I 见第 II 节末，表 II–III 见附录 B），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2608.27996v1 全文（19 页）的中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–16 的中文图注、表 I–III 的逐格转写、算法 1、附录 A（定理 1 完整证明，式 (46)–(52)）与附录 B（实验配置），以及参考文献 43 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(52) 逐式核对（重点式 (13)–(17)、(22)–(31)、(38)–(41)），表 I 用第 5 页、表 II–III 用第 18 页渲染图逐格核对，算法 1 按第 11 页渲染图核对。已加注两处原文疑点：(i) 第 VI 节"除非另有说明"默认 $m_{\mathrm{init}}=200$ 与第 VI-B 节实际使用 $m_{\mathrm{init}}=16$ 且未显式说明覆盖；(ii) 配对 $t$ 检验的引用 [33] 为 Hemerik 的"Multiple testing"综述，并非配对 $t$ 检验的经典文献，按原文照录。本页不上传原文图片，图内曲线与刻度数值不作额外数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

<!-- CURSOR -->

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
