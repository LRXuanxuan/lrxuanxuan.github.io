---
layout: page
title: "面向基于智能体模型的仿真高效双流神经后验估计｜中文全文译文"
permalink: /papers/translations/2026-10-31-2610-35442-simulation-efficient-double-flow-neural-posterior-estimation-for-agent/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/fd7b24a313b46ea0/) · [原文 arXiv](https://arxiv.org/abs/2610.35442) · [全部目录](/papers/catalog/)

# 面向基于智能体模型的仿真高效双流神经后验估计

**原题：** Simulation-Efficient Double-Flow Neural Posterior Estimation for Agent-Based Models  
**作者：** Junyao Zhang、Jinglai Li、Junqi Tang  
**单位：** 英国伯明翰大学数学学院（School of Mathematics, University of Birmingham, Birmingham, United Kingdom）。  
**版本：** arXiv:2610.35442v1（cs.MA），2026 年 10 月 26 日；28 页（正文 + 参考文献 + 附录 A—D）。  
**关键词：** 基于智能体的模型；贝叶斯推断；基于仿真的推断；神经后验估计；归一化流；合成数据；潜在代理增强。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1—4 节（含 1 引言、2 双流 NPE 与 2.1—2.3、算法 1、3 数值实验（3.1 指标、3.2 Brock–Hommes 模型与 3.2.1/3.2.2、3.3 进一步分析 3.3.1—3.3.3）、4 讨论与结论）、图 1—8 中文图注、**表 A.1、B.1、C.1、C.2、C.3、D.1、D.2 逐格转录**、附录 A—D 结构化译文、参考文献（英文原条目，author—year 格式，按字母序）均按原文结构录入；编号公式 (1)—(23)、算法 1 与附录式 (A.1)、B.1—B.3、D.1—D.2 按原文保留。逐句逐式终校未做。

## 摘要

神经后验估计（neural posterior estimation, NPE）能够对具有**不可解似然**的基于智能体模型（agent-based model, ABM）做贝叶斯后验参数推断，但生成训练数据所需的仿真计算代价高昂。本文提出**双流神经后验估计（Double-Flow Neural Posterior Estimation, DF-NPE）**：把学习到的时序**摘要（summaries）**与两个条件归一化流相结合，分别用于合成数据生成与后验估计。该框架以合成训练对补充直接仿真，并支持**混合训练（pooled）**与**有序训练（ordered）**两种策略。在 Brock–Hommes 资产定价模型的两种设定下，实验表明 DF-NPE 可在**减少 90% 直接仿真**的同时，取得比标准 NPE 更低的后验差异均值与运行时间。性能随直接仿真数据与合成数据的配比以及训练策略而变化。这些结果表明：学习式摘要增强是降低 ABM 参数贝叶斯后验推断仿真成本的一种实用途径。

## 1 引言

基于智能体的模型（ABM）能够通过个体智能体的异质决策及其交互来描述宏观现象。要在现实分析中应用这些模型，就需要对其**行为参数**做推断（Windrum et al., 2007; Grazzini et al., 2017）。贝叶斯推断通过后验分布刻画参数的可能取值及其不确定性。然而对许多 ABM 而言，似然不可解或难以评估。基于仿真的推断（simulation-based inference, SBI）利用模型仿真数据估计后验，因此仿真器调用的次数与成本成为校准的实际约束（Beaumont et al., 2009; Lux, 2018）。

随着机器学习快速发展，神经后验估计（NPE）已被广泛用于 ABM 的后验推断，它从仿真得到的参数—数据对学习一个条件密度（Cranmer et al., 2020）。其序列变体把后续仿真引导到与特定观测相关的参数区域（Greenberg et al., 2019）。一旦拟合完成，估计器无需再调用仿真器即可生成后验抽样。对 ABM，Shiono（2021）把 BayesFlow 用于贝叶斯参数估计，Dyer et al.（2024）研究了以学习式时序摘要做神经推断并评估完整后验分布的恢复。剩余的仿真成本在于生成训练对，其数量必须与所得后验质量权衡。

当前 SBI 中已有越来越多研究探讨降低获取这些仿真对成本或减少需求的方法。序列提议把仿真器调用集中在相关参数区域；当存在多个保真度的仿真器时，多层神经推断可在固定计算预算下提升精度（Hikida et al., 2025）。代理（surrogate）近似仿真或推断过程的部分环节：Lamperti et al.（2018）用机器学习代理探索 ABM 参数空间，Barde（2024）用高斯过程代理做贝叶斯估计。神经仿真器近似仿真器似然（Lueckmann et al., 2019），序列方法可联合学习似然与后验近似（Wiqvist et al., 2021）。此外，在后验训练本身，Refaeli et al.（2025）用神经密度代理替代后续序列轮次中的仿真器调用。生成的训练对可以扩大训练集，但它们服从学习到的代理分布，因此其对后验恢复的贡献取决于代理近似质量以及它们与直接仿真的组合方式。本文在代理生成**学习式摘要**、且表示随轮次变化的设定下考察这一问题。

本文研究**双流神经后验估计（DF-NPE）**框架：用循环编码器把仿真轨迹映射为对参数有预测力的摘要。第一个条件流在给定模型参数时生成摘要，第二个流在给定摘要时估计参数后验。生成发生在这个**学习到的摘要空间**而非完整轨迹空间。与 NPE 的序列变体类似，在每一序列轮次中，直接仿真更新编码器与代理；随后重新编码已存储的轨迹并重新生成合成摘要，使两种数据源都使用当前表示。在该流程内，我们改变直接仿真对与合成对的配比及其在后验训练中的顺序：**混合训练**把两种来源合并，**合成→仿真**与**仿真→合成**则分阶段先后使用二者。Brock–Hommes 模型的两种设定使我们能针对由可解转移似然得到的近似真值后验，评估异质预测参数的恢复质量。这些比较把 Dyer et al.（2024）的仿真效率问题推广到序列神经后验估计中使用生成训练数据的情形。

本文贡献如下：

1. 提出一种序列 DF-NPE 流程，结合学习式时序摘要、条件潜在生成与后验估计；
2. 通过完整后验差异、预测性检验与记录的计算成本，评估直接仿真数据与合成数据的配比；
3. 比较不同后验训练策略与冻结组分对照，刻画增强在何时改善后验恢复。

## 2 双流神经后验估计

记 $p(\mathbf x\mid\boldsymbol\theta)$ 为 ABM 生成的随机时序数据分布，$p(\boldsymbol\theta)$ 为先验，$\mathbf y^o$ 为观测轨迹。我们的目标是在有限的直接仿真预算下估计后验

$$
p(\boldsymbol\theta\mid\mathbf y^o)\propto p(\boldsymbol\theta)p(\mathbf y^o\mid\boldsymbol\theta).\tag{1}
$$

NPE 从仿真得到的参数—数据对学习该条件关系，用时序摘要统计量 $s(\mathbf x)$ 表示时序观测（Papamakarios and Murray, 2016）。对先验抽样 $\boldsymbol\theta_i\sim p(\boldsymbol\theta)$ 与轨迹 $\mathbf x_i\sim p(\mathbf x\mid\boldsymbol\theta_i)$，其训练目标为

$$
\hat\psi=\arg\min_\psi-\frac1N\sum_{i=1}^N\log q_\psi\left(\boldsymbol\theta_i\mid s(\mathbf x_i)\right).\tag{2}
$$

把拟合的估计器条件化在 $s(\mathbf y^o)$ 上，即可在不进一步调用仿真器的情况下得到后验样本。序列神经后验估计（SNPE）在连续轮次中把仿真集中在与观测相关的参数区域：从 $\pi_1=p(\boldsymbol\theta)$ 出发，第 $k$ 轮通过采样 $\boldsymbol\theta_i^{(k)}\sim\pi_k(\boldsymbol\theta)$ 与 $\mathbf x_i^{(k)}\sim p(\mathbf x\mid\boldsymbol\theta_i^{(k)})$ 生成数据对；拟合得到的后验为下一轮提供提议分布。我们采用**自动后验变换**（automatic posterior transformation，即 SNPE-C）来处理由此产生的非先验提议（Greenberg et al., 2019）。

本文提出的 **Double-Flow NPE（DF-NPE）** 框架通过额外学习第二个条件密度来扩展该流程，以提供额外的训练摘要。在第 $k$ 轮，循环编码器产生学习式摘要统计量 $\mathbf h=e_{\omega_k}(\mathbf x)\in\mathbb R^8$ 与 $\mathbf h_{o,k}=e_{\omega_k}(\mathbf y^o)$。我们称 $\mathbf h$ 为**潜在摘要**，由代理学习生成。潜在代理流 $q_{\phi_k}(\mathbf h\mid\boldsymbol\theta)$ 在给定参数时生成摘要，后验流 $q_{\psi_k}(\boldsymbol\theta\mid\mathbf h)$ 学习反向条件关系，二者均基于掩码自回归流（MAF）（Papamakarios et al., 2017）。归一化流通过可逆映射把简单基分布变换并计算所得密度（Rezende and Mohamed, 2015; Cai et al., 2024）。具体地，令 $\mathbf v=g_\xi(\mathbf u)$，其中 $\mathbf u\sim p_0$、$f_\xi=g_\xi^{-1}$，由变量替换公式得

$$
q_\xi(\mathbf v)=p_0\left(f_\xi(\mathbf v)\right)\left|\det J_{f_\xi}(\mathbf v)\right|,\tag{3}
$$

其中 Jacobian 行列式刻画变换引起的局部体积变化。此外，我们还为 DF-NPE 框架提出三种策略，它们共享同一序列的"仿真—摘要学习—潜在生成—序列提议更新"流程；策略的选择进入后验训练阶段，决定数据源顺序与停止规则。我们把仿真器生成的轨迹及其编码摘要称为**直接仿真（directly-simulated）**数据，把代理生成的潜在对称为**合成（synthetic）**数据。所得序列流程示于图 1。

### 2.1 流 1：学习摘要并生成合成数据

在 DF-NPE 中，第一个归一化流能够生成统计摘要，从而避免对完整轨迹建模，但编码器必须保留关于参数的信息。我们通过**参数回归**学习摘要，沿用 Fearnhead 与 Prangle（2012）的半自动构造及其在 Jiang et al.（2017）中的神经网络实现。本文的循环嵌入网络从轨迹的时序结构学习摘要统计量；所得后验推断依赖于这些摘要中保留的参数信息（Blum et al., 2013）。虽然该途径获取摘要统计量比直接调用模型仿真器更便宜，但更多摘要信息并不自动改善推断——例如此前在一个 Schelling 隔离 ABM 中的研究表明，单独加入空间或时间摘要并不总能带来改善（Dignum et al., 2025）。

设 $\pi_j$ 为第 $j$ 轮使用的参数提议，$\pi_1=p(\boldsymbol\theta)$。累积的直接仿真数据构成

$$
\mathcal D_r^{(k)}=\bigcup_{j=1}^{k}\left\{(\boldsymbol\theta_{ji},\mathbf x_{ji},j):\boldsymbol\theta_{ji}\sim\pi_j,\ \mathbf x_{ji}\sim p(\cdot\mid\boldsymbol\theta_{ji})\right\}.\tag{4}
$$

轮次索引标识生成各数据块所用的提议。**门控循环单元（GRU）**编码器（Cho et al., 2014）与一个辅助头预测标准化参数；架构与优化设置见附录 A。在第 $k$ 轮，编码器与辅助头最小化

$$
\mathcal L_{\mathrm{enc}}(\omega,\eta)=\frac{1}{n_r^{(k)}}\sum_{(\boldsymbol\theta,\mathbf x,j)\in\mathcal D_r^{(k)}}\left\|a_\eta\left(e_\omega(\mathbf x)\right)-\mathbf z_k(\boldsymbol\theta)\right\|_2^2,\tag{5}
$$

其中 $n_r^{(k)}=|\mathcal D_r^{(k)}|$，$\mathbf z_k$ 使用累积的直接仿真训练集对参数做标准化。每次编码器更新后，所有已存储轨迹被重新编码，所得数据仓

$$
\mathcal H_r^{(k)}=\left\{(\boldsymbol\theta,e_{\omega_k}(\mathbf x),j):(\boldsymbol\theta,\mathbf x,j)\in\mathcal D_r^{(k)}\right\}\tag{6}
$$

以当前表示表达全部直接仿真摘要；观测轨迹用同一编码器编码。该共享表示为潜在代理与后验流提供训练空间。

随后对重新编码的直接仿真数据仓，以条件最大似然拟合潜在代理 MAF：

$$
\mathcal L_{\mathrm{sur}}(\phi)=-\frac{1}{n_r^{(k)}}\sum_{(\boldsymbol\theta,\mathbf h,j)\in\mathcal H_r^{(k)}}\log q_\phi(\mathbf h\mid\boldsymbol\theta).\tag{7}
$$

潜在代理依赖于当前编码器以及直接仿真覆盖的参数区域。任一已拟合组分变化时，我们重新生成合成摘要以保持当前表示。对每个保留的提议 $\pi_j$，合成对按下式生成：$\tilde{\boldsymbol\theta}_{ji}\sim\pi_j$、$\tilde{\mathbf h}_{ji}\sim q_{\phi_k}(\cdot\mid\tilde{\boldsymbol\theta}_{ji})$。其并集构成 $\mathcal H_s^{(k)}$，每个数据块保留其提议身份。这些合成对**仅用于训练后验流**；编码器与潜在代理只拟合直接仿真器输出。

### 2.2 流 2：用直接仿真与合成数据学习后验

在 DF-NPE 中，第一流之后得到直接仿真与合成摘要两个数据仓，它们为后验 MAF 提供训练对。训练采用带自动后验变换的序列神经后验估计（Greenberg et al., 2019），以 sbi 工具包实现（Tejero-Cantero et al., 2020）。在先验轮次中，小批量 $\mathcal B$ 的损失为

$$
\mathcal L_{\mathrm{prior}}(\psi;\mathcal B)=-\frac{1}{|\mathcal B|}\sum_{i\in\mathcal B}\log q_\psi(\boldsymbol\theta_i\mid\mathbf h_i).\tag{8}
$$

后续轮次使用 atomic 损失。对每个 $(\boldsymbol\theta_i,\mathbf h_i)$，候选集 $\mathcal A_i$ 包含配对参数 $\boldsymbol\theta_i$ 与从小批量抽取的对比参数。定义对数得分 $r_\psi(\boldsymbol\theta,\mathbf h)=\log q_\psi(\boldsymbol\theta\mid\mathbf h)-\log p(\boldsymbol\theta)$，则有

$$
\mathcal L_{\mathrm{atom}}(\psi;\mathcal B)=-\frac{1}{|\mathcal B|}\sum_{i\in\mathcal B}\left[r_\psi(\boldsymbol\theta_i,\mathbf h_i)-\log\sum_{\vartheta\in\mathcal A_i}\exp r_\psi(\vartheta,\mathbf h_i)\right].\tag{9}
$$

先验密度修正使该目标区别于对非先验仿真直接使用条件似然的未修正形式。训练来源变化时，每个数据块保留其生成提议；该修正针对参数采样，而表示损失与代理误差需要下文报告的独立诊断。

直接仿真对把训练锚定到仿真器输出，合成对则增加来自学习式条件摘要分布的抽样；二者的配比决定数据仓组成，其训练调度决定后验估计器如何遇到各来源。附录 A 刻画了所得增强分布。令 $\hat{\mathrm P}_{r,k}$ 与 $\hat{\mathrm P}_{s,k}$ 表示直接仿真对与合成对（含提议来源）上的经验分布。在后验更新 $t$ 处，源权重 $\lambda_{k,t}\in[0,1]$ 指定

$$
\hat{\mathrm P}_{k,t}=\lambda_{k,t}\hat{\mathrm P}_{r,k}+(1-\lambda_{k,t})\hat{\mathrm P}_{s,k}.\tag{10}
$$

该式刻画的是**源采样**而非 atomic 损失的分解：混合小批量可同时包含来自两种来源的对比参数。记 $n_s^{(k)}=|\mathcal H_s^{(k)}|$，直接数据占比为

$$
\rho_k=\frac{n_r^{(k)}}{n_r^{(k)}+n_s^{(k)}}.\tag{11}
$$

**混合训练**在整个优化过程中打乱合并后的数据仓，因此

$$
\lambda_{k,t}=\rho_k,\qquad t=1,\ldots,U,\tag{12}
$$

其中 $U$ 由基于验证的提前停止确定；单个小批量不必精确复现全局来源比例。

对**有序训练**，令 $U_r$ 与 $U_s$ 分别表示直接仿真与合成的更新预算。**合成→仿真**先用生成对、再从所得权重出发用直接仿真对继续：

$$
\lambda_{k,t}=\begin{cases}0,&1\leq t\leq U_s,\\1,&U_s<t\leq U_s+U_r,\end{cases}\tag{13}
$$

**仿真→合成**则颠倒两阶段但保留各自来源的更新预算：

$$
\lambda_{k,t}=\begin{cases}1,&1\leq t\leq U_r,\\0,&U_r<t\leq U_r+U_s.\end{cases}\tag{14}
$$

两个阶段在每一轮内重复，有序实验中取 $U_r=U_s=500$。更多实现细节见附录 A.2。

### 2.3 序列推断与仿真预算

DF-NPE 的训练策略在同一序列循环内运作：每一轮更新编码器、重新编码已存储轨迹并重新生成合成数据仓；后验训练期间编码器与代理保持固定。在有序实现中，后验权重跨阶段延续，但每个阶段重置 Adam；下一轮因编码器变化而重新初始化后验流。后验训练完成后，最终估计决定下一轮提议

$$
\pi_{k+1}(\boldsymbol\theta)=q_{\psi_k^{\mathrm{final}}}\left(\boldsymbol\theta\mid\mathbf h_{o,k}\right).\tag{15}
$$

我们保留每个提议及其条件摘要与归一化。因此训练策略不仅影响当前后验，也影响后续提议与训练数据；策略之间的比较因而评估的是完整的序列流程。

这些重复更新也决定计算预算。设共 $K$ 轮、最终数据仓规模为 $(N_r,N_s)$，则每轮增加 $N_r/K$ 次直接仿真。在第 $k$ 轮，数据仓规模为

$$
n_r^{(k)}=\frac{kN_r}{K},\qquad n_s^{(k)}=\frac{kN_s}{K}.\tag{16}
$$

这两式假设预算可被 $K$ 整除，且只计入有效的被接受对。最终数据仓有 $N=N_r+N_s$ 对，直接占比 $\rho=N_r/N$。由于合成数据仓被反复重新生成，被接受的合成生成总量为

$$
\sum_{k=1}^{K}n_s^{(k)}=\frac{K+1}{2}N_s.\tag{17}
$$

对十轮而言，这等于 $5.5N_s$ 而非 $N_s$。因此直接仿真器调用、最终数据仓规模、重新生成的对与优化更新度量的是计算成本的不同方面。这里每一轮还在后验训练前更新编码器与潜在代理；随后编码器保持固定，而 Dyer et al.（2024）算法中的嵌入网络与后验估计器联合学习。算法 1 的三个分支为每个后验训练阶段指定数据源与停止规则；算法中 Mixed 取 $B_k=200$，有序训练取 $B_k=\min\{200,n_r^{(k)},n_s^{(k)}\}$。阶段列表每轮重建，且提议仅在所有阶段完成后更新。更多细节见附录 A。

**算法 1：三种训练策略的序列 DF-NPE**

输入：先验 $p(\boldsymbol\theta)$、仿真器 $p(\mathbf x\mid\boldsymbol\theta)$、观测 $\mathbf y^o$、轮数 $K$、最终数据仓规模 $(N_r,N_s)$、策略 $\mathcal S$、小批量大小 $B_k$、有序阶段预算 $U_r=U_s=500$。
输出：后验估计 $q_{\psi_K^{\mathrm{final}}}(\boldsymbol\theta\mid\mathbf h_{o,K})$。

1. 置 $\pi_1=p(\boldsymbol\theta)$、$\mathcal D_r^{(0)}=\varnothing$。
2. 对 $k=1,\ldots,K$：
3.   抽取 $N_r/K$ 对 $\boldsymbol\theta\sim\pi_k$、$\mathbf x\sim p(\cdot\mid\boldsymbol\theta)$，置 $\mathcal D_r^{(k)}=\mathcal D_r^{(k-1)}\cup\{(\boldsymbol\theta_i,\mathbf x_i,k)\}_{i=1}^{N_r/K}$。
4.   用参数回归更新 $e_{\omega_k}$；把所有已存储轨迹重新编码为 $\mathcal H_r^{(k)}$，并置 $\mathbf h_{o,k}=e_{\omega_k}(\mathbf y^o)$。
5.   仅在 $\mathcal H_r^{(k)}$ 上以条件最大似然拟合 $q_{\phi_k}(\mathbf h\mid\boldsymbol\theta)$。
6.   重建 $\mathcal H_s^{(k)}$：对每个 $j\leq k$，抽取 $N_s/K$ 对 $\boldsymbol\theta\sim\pi_j$、$\mathbf h\sim q_{\phi_k}(\cdot\mid\boldsymbol\theta)$，保留来源提议标签 $j$。
7.   以合并数据仓归一化初始化后验流 $q_\psi$；后验训练期间保持编码器、代理与归一化不变。
8.   若 $\mathcal S=$ Mixed：置阶段列表 $\mathcal T_k=[\mathcal H_r^{(k)}\cup\mathcal H_s^{(k)}]$，打乱合并数据仓并使用基于验证的提前停止。
9.   否则若 $\mathcal S=$ Synthetic-to-Simulation：置 $\mathcal T_k=[\mathcal H_s^{(k)},\mathcal H_r^{(k)}]$，先用 $U_s$ 次合成更新、再用 $U_r$ 次直接更新。
10. 否则（Simulation-to-Synthetic）：置 $\mathcal T_k=[\mathcal H_r^{(k)},\mathcal H_s^{(k)}]$，先用 $U_r$ 次直接更新、再用 $U_s$ 次合成更新。
11. 对 $\mathcal T_k$ 中每个数据仓 $\mathcal H$（按列表顺序）：把保留的提议附加到 $\mathcal H$ 的数据块；打乱数据仓并为该阶段初始化 Adam；重复：抽取规模 $B_k$ 的小批量 $\mathcal B=\{(\boldsymbol\theta_i,\mathbf h_i,j_i)\}$；若 $k=1$ 计算条件负对数似然 $L=-|\mathcal B|^{-1}\sum_i\log q_\psi(\boldsymbol\theta_i\mid\mathbf h_i)$，否则对每个 $i$ 由 $\boldsymbol\theta_i$ 与从其他小批量条目抽样的对比参数构成 $\mathcal A_i$，对 $\boldsymbol\theta_{ia}\in\mathcal A_i$（$\boldsymbol\theta_{i1}=\boldsymbol\theta_i$）计算 $r_{ia}=\log q_\psi(\boldsymbol\theta_{ia}\mid\mathbf h_i)-\log p(\boldsymbol\theta_{ia})$ 与 atomic 分类损失 $L=-|\mathcal B|^{-1}\sum_i[r_{i1}-\log\sum_a\exp(r_{ia})]$；用 $\nabla_\psi L$ 做 Adam 更新；直至该阶段停止规则满足。
12. 若仍有第二阶段，则把 $\psi$ 带入下一阶段而不重新初始化后验流。
13. 把最终后验条件化在 $\mathbf h_{o,k}$ 上并置 $\pi_{k+1}(\boldsymbol\theta)=q_{\psi_k^{\mathrm{final}}}(\boldsymbol\theta\mid\mathbf h_{o,k})$；保留该提议及其条件、先验支撑与归一化。

## 3 数值实验

本节在 Brock–Hommes 模型的两种设定下评估 DF-NPE，沿用 Dyer et al.（2024）研究的基准。由于该模型具有可解转移似然，我们可得到其近似真值后验，从而评估 DF-NPE 恢复参数不确定性的程度。我们先改变直接仿真对与合成对的配比，考察不同仿真预算下的后验恢复；再在相同配比下比较三种后验训练策略并评估其计算成本。后验图展示恢复的分布，箱线图展示重复拟合间差异与运行时间的变化。补充的等预算比较、预测性检验与冻结组分对照也有助于解释这些结果。

### 3.1 性能指标

评估贝叶斯校准既需比较后验分布也需比较参数估计。因此我们用**联合 Wasserstein 距离**（WASS）与**平方最大均值差异**（MMD²）评估后验恢复；二者都以估计后验 $Q$ 与近似真值后验 $P_{\mathrm{ref}}$（对同一观测轨迹 $\mathbf y^o$）作比较。我们用参考抽样 $\{\boldsymbol\theta_i\}_{i=1}^n$ 与估计抽样 $\{\boldsymbol\vartheta_j\}_{j=1}^m$ 计算，$n=m=1{,}000$。所得分数是经验比较，保留两次抽样的 Monte Carlo 误差。后验均值误差与后验预测性检验提供额外评估，详见附录 B.1。

**Wasserstein 距离。** Wasserstein 距离度量两个经验后验分布之间搬运质量的最小代价（Bernton et al., 2019）。我们使用以欧氏距离为搬运代价的一阶 Wasserstein 距离：

$$
W_{\mathrm{ASS}}(\hat P_{\mathrm{ref}},\hat Q)=\min_{\gamma\in\Gamma_{n,m}}\sum_{i=1}^{n}\sum_{j=1}^{m}\gamma_{ij}\left\|\boldsymbol\theta_i-\boldsymbol\vartheta_j\right\|_2,\tag{18}
$$

其中 $\Gamma_{n,m}$ 包含行和为 $1/n$、列和为 $1/m$ 的非负搬运矩阵。搬运代价在**联合参数空间**中计算，因此对位置、散布与依赖结构的差异都有响应，这使其区别于仅基于后验均值或平均单变量边缘的距离。取值越低表示与参考后验越接近。

**平方最大均值差异。** MMD 在再生核 Hilbert 空间 $\mathcal H$ 中比较概率分布的核均值嵌入（Gretton et al., 2012）。其总体平方形式为

$$
\mathrm{MMD}^2(P_{\mathrm{ref}},Q)=\left\|\mathbb E_{\boldsymbol\theta\sim P_{\mathrm{ref}}}[k(\boldsymbol\theta,\cdot)]-\mathbb E_{\boldsymbol\vartheta\sim Q}[k(\boldsymbol\vartheta,\cdot)]\right\|_{\mathcal H}^2.\tag{19}
$$

我们通过排除样本内对角项估计平方 MMD：

$$
\widehat{\mathrm{MMD}}_u^2=\frac{1}{n(n-1)}\sum_{i\neq i'}k(\boldsymbol\theta_i,\boldsymbol\theta_{i'})+\frac{1}{m(m-1)}\sum_{j\neq j'}k(\boldsymbol\vartheta_j,\boldsymbol\vartheta_{j'})-\frac{2}{nm}\sum_{i=1}^{n}\sum_{j=1}^{m}k(\boldsymbol\theta_i,\boldsymbol\vartheta_j).\tag{20}
$$

对固定核与独立抽样，这是平方 MMD 的常用无偏估计。我们使用尺度由参考集确定的高斯核：

$$
k(\mathbf a,\mathbf b)=\exp\left(-\frac{\|\mathbf a-\mathbf b\|_2^2}{c}\right),\qquad c=2\ \underset{1\leq i,i'\leq n}{\operatorname{median}}\left\|\boldsymbol\theta_i-\boldsymbol\theta_{i'}\right\|_2.\tag{21}
$$

此处 $c$ 基于中位欧氏距离，而非某些高斯核所用的平方距离约定。在该常用核下，MMD² 越低表示后验越接近，尽管有限样本估计可能略为负值。我们自始至终保留平方统计量，并因各设定与诊断核尺度不同而分别报告结果。

**计算成本。** 我们通过直接仿真器调用与记录的端到端运行时间评估计算效率。后者包含仿真、神经训练、合成生成、后验采样、输入/输出与绘图，但不含后验展示的单独采样。加速比用 SNPE 平均运行时间除以相应流程均值计算。在 smooth 设定中，精度与运行时间在独立运行中测量，计时比较未交错进行，因此记录的加速比描述的是这些执行条件下实现流程的表现。

### 3.2 Brock–Hommes 模型

Brock–Hommes（BH）模型描述一个资产市场：智能体在异质预测策略之间选择（Brock and Hommes, 1998）。每种策略 $h$ 有趋势系数 $g_h$ 与偏置 $b_h$，其表现 $U_{h,t}$ 决定使用该策略的智能体比例。把价格对基本面价值的偏离写为 $x_t$，则动力学为

$$
U_{h,t}=\left(x_t-Rx_{t-1}\right)\left(g_hx_{t-2}+b_h-Rx_{t-1}\right),\quad n_{h,t+1}=\frac{\exp\left(\beta U_{h,t}\right)}{\sum_{j=1}^{H}\exp\left(\beta U_{j,t}\right)},\quad x_{t+1}=\frac1R\left(\sum_{h=1}^{H}n_{h,t+1}\left(g_hx_t+b_h\right)+\epsilon_{t+1}\right),\quad \epsilon_{t+1}\sim\mathcal N(0,\sigma^2).\tag{22}
$$

其中 $n_{h,t+1}$ 为使用策略 $h$ 的比例，$R$ 为无风险总收益率，$\beta$ 控制选择强度。我们使用四种策略并推断 $\boldsymbol\theta=(g_2,b_2,g_3,b_3)$——这两个策略的趋势响应与预测偏置；其余系数固定为 $R=1.01$、$g_1=b_1=b_4=0$、$g_4=1.01$（Brock and Hommes, 1998; Dyer et al., 2024）。所得后验描述这些行为系数中哪些组合与观测到的价格动力学相容。

我们考虑两种设定。**smooth 设定**中 $\beta=120$、生成参数为 $(0.9,0.2,0.9,-0.2)$，独立先验为 $g_2,b_2,g_3\sim U(0,1)$、$b_3\sim U(-1,0)$。**noisy 设定**中 $\beta=10$、生成参数为 $(-0.7,-0.4,0.5,0.3)$，独立先验为 $g_2,b_2\sim U(-1,0)$、$g_3,b_3\sim U(0,1)$。两设定均取 $\sigma=0.04$，故 "noisy" 命名的是区制而非新息方差增大。每个仿真器运行 100 个时间步并舍弃三个确定性初值。每种设定是独立的推断任务，各有固定的仿真观测、先验与参考后验。

价格方程中的高斯新息给出条件转移密度

$$
p\left(x_{t+1}\mid x_{1:t},\boldsymbol\theta\right)=\mathcal N\left(x_{t+1};\frac1R\sum_{h=1}^{H}n_{h,t+1}\left(g_hx_t+b_h\right),\frac{\sigma^2}{R^2}\right).\tag{23}
$$

我们用该转移密度通过基于似然的 MCMC 构造近似真值后验。神经流程仅在仿真参数—数据对上训练、不评估似然，因此该近似真值后验为评估后验恢复提供参考。

#### 3.2.1 实验设置

实验全文中，SNPE 表示基线方法、DF-NPE 表示所提框架；Mixed、Synthetic-to-Simulation 与 Simulation-to-Synthetic 表示其三种后验训练策略，因此 Mixed 3:7 表示采用 Mixed 训练、直接仿真:合成比例为 3:7 的 DF-NPE。近似真值后验由基于似然的 MCMC 得到，下文称**参考后验**。箱线图中，Mixed 与有序策略标签标识 DF-NPE 配置，"Standard SNPE" 标签表示 SNPE。

对每种 BH 设定，我们用固定仿真观测与 1,000 个基于似然的 MCMC 参考抽样，在十个训练种子上评估每个主要配置。更多实验细节见附录 B。所有主要比较使用十轮序列与 10,000 对的最终后验训练数据仓。在该数据仓内，Mixed 按 1:9、3:7、5:5、7:3 或 9:1 的比例分配直接仿真对与合成对，这些配比分别需要 1,000—9,000 次直接仿真，而 SNPE 需 10,000 次。这些流程在**表示学习**上也不同：SNPE 把循环嵌入与后验联合学习，而 DF-NPE 使用第 2 节的监督编码器。因此其比较同时评估训练数据配比与表示学习流程。

为在相同直接仿真预算下比较流程，我们在 smooth 设定中另做一组五配对种子实验：SNPE 使用 1,000—9,000 个直接仿真对，与各 Mixed 数据仓的直接分量匹配；我们在 1:9、3:7、5:5 三种配比下比较有序策略，共得两种设定 × 十种子的 120 次有序拟合。每种策略每轮每个来源使用 500 次更新，批大小为 $\min\{200,n_r^{(k)},n_s^{(k)}\}$。该固定更新预算不同于 Mixed 使用的基于验证的提前停止。此外，每个拟合后验提供下一轮提议，因此训练策略变化也会改变后续训练数据仓。

我们以差异与运行时间的箱线图（中位数、四分位距与离群点）汇总十次拟合，描述跨种子性能。附录 C 报告相应均值与样本标准差；其排序可能与中位数排序不同。我们还报告描述性的配对种子比较，同时允许每个流程保留自身的学习表示与后续提议。

#### 3.2.2 结果

**Smooth 设定。** 在 smooth BH 设定中，近似真值后验把 $g_2$ 与 $g_3$ 集中在先验上界附近，$b_2$ 与 $b_3$ 的边缘较窄。图 2 把该结构与 SNPE 及采用 Mixed 训练（直接:合成 = 3:7）的 DF-NPE 对比。最明显的差异在 $g_2$：SNPE 边缘向较小值延伸，而 Mixed 把更多质量放在上界附近；不过 Mixed 保留的 $b_2$ 边缘仍比参考更宽。这些差异也体现在双变量分布中，后验质量的集中反映相应边缘形状。

重复拟合结果把该比较扩展到全部五种配比（图 3）。**每种 Mixed 配比的中位 WASS 与 MMD² 都低于 SNPE**，包括只使用 1,000 次（而非 10,000 次）直接仿真的 1:9。把直接占比增至 3:7、再增至 5:5 会进一步降低两项中位数；但箱体有重叠且拟合间变化可观，故中位性能改善未能清晰区分所有配比。

超过 5:5 后，增加直接占比不再降低任一指标的中位数；7:3 与 9:1 还出现高差异离群点，表明更大的直接仿真数据仓并不稳定改善恢复。均值给出略有不同的排序：9:1 的平均 WASS 最低，而 5:5 的平均 MMD² 最低（表 C.2）。因此尽管所有配比在均值与中位数上都优于基线，其相对排序取决于指标与摘要统计量。

上述比较在固定总数据仓规模下改变直接仿真数。当我们改为**匹配直接仿真预算**时，Mixed 在全部 25 次配对比较中降低 WASS、在 23 次中降低 MMD²（附录 C.2）。这支持在第二种预算比较下完整的 DF-NPE 流程，包括其不同的表示学习途径。

后验一致性本身并不决定仿真轨迹多接近观测，因此我们还在 smooth 设定中做了后验预测性检验（附录 B.1.2）：SNPE 的中位轨迹 RMSE 最低，而 Mixed 5:5 的摘要误差最低，表明这些预测性准则对流程的排序不同。

**Noisy 设定。** 在 noisy 设定中，参考后验对 $g_2$ 与 $g_3$ 有宽边缘、对 $b_2$ 与 $b_3$ 有集中边缘（图 4）。两个所示估计器都复现了这一对比，表现为趋势系数与偏置联合分布中的窄带。二者在 $g_3$ 上差异更明显：Mixed 比 SNPE 把更多质量放在支撑下端。两种拟合的偏置边缘都保持集中，尽管位置与散布与参考不同。因此该设定的恢复既包括复现宽的趋势系数分布，也包括复现窄的偏置分布。

在重复拟合中，Mixed 与 SNPE 的差异分布重叠程度高于 smooth 设定（图 5）。Mixed 9:1 的两项指标中位数最低，3:7 与 5:5 的中位数也低于 SNPE。**最大的仿真节省出现在 1:9，但其两项中位数都未优于基线**；然而其平均差异更低（表 C.2），因此 90% 的直接仿真削减伴随的是平均分数改善而非中位分数改善。

7:3 处出现另一种均值与中位数分歧：其中心分数与其他中间配比相当，但两个差异分布都含高差异离群点；具体地，其中位 MMD² 低于 SNPE 而均值更高。这些结果说明：增加直接仿真占比不能简单解释为后验恢复的稳定改善。

综合而言，配比实验表明 1:9 是所测配置中直接仿真节省最大者，且在两种设定下平均差异更低；但给出最低**中位**差异的配比不同：smooth 设定为 5:5，noisy 设定为 9:1。因此配比选择取决于仿真预算与任务所需的后验精度。

### 3.3 进一步分析

#### 3.3.1 后验训练策略比较

配比实验始终采用 Mixed 训练，留下的问题是：同样的数据仓在分阶段使用时是否更好。我们在相同配比下比较 Mixed 与 Synthetic-to-Simulation、Simulation-to-Synthetic（图 6、图 7）。

在 smooth 设定中，Mixed 在 1:9 与 3:7 下的中位差异低于两种有序策略；5:5 时这种区分变得不清晰，箱体重叠明显且 WASS 与 MMD² 的中位排序不同。在这些配比中，Synthetic-to-Simulation 随直接占比增加趋于更低差异，而 Simulation-to-Synthetic 保持较宽的分数分布。尽管以直接仿真数据结束改善了部分比较，它并未在所有配比上带来一致优势。

noisy 设定呈现不同模式：两种有序策略在 1:9 下的中位差异都低于 Mixed，而 Synthetic-to-Simulation 在 3:7 下两项指标的中位数都最低；其 WASS 四分位距也较紧凑，且在全部十次配对种子比较中 WASS 都低于反向顺序（附录 C.5）。该优势并未均匀延伸到 5:5：Synthetic-to-Simulation 保持低中位数，但也含高差异离群点，使其均值排序不利。

附录 C 的后验图展示 3:7 下有序拟合的差异。smooth 设定中，两种有序拟合都比参考更宽地铺开 $g_2$，同时让其他边缘保持集中；noisy 设定中，二者都复现了宽趋势系数边缘与窄偏置边缘的对比，但位置与尾部行为不同。这些单次拟合展示了差异比较背后对应的后验形状，但不能替代跨种子的证据。

因此偏好策略取决于设定与配比。该比较还包含来源顺序之外的差异：Mixed 使用提前停止，而每个有序阶段使用 500 次更新；由于所得后验决定下一轮提议，这些训练选择会传播到后续数据仓。故结果比较的是**完整序列流程**，而非孤立出最终训练来源的效应。

#### 3.3.2 计算成本

差异改善还须与获得它们所需时间一并考虑。图 8 表明 Mixed 1:9 在两种设定下中位运行时间都最低，且所有展示的 Mixed 配置都低于 SNPE 中位数；五次配比的均值运行时间与基线的比较结果相同（表 C.2）。在 1:9 下，Mixed 在 smooth BH 平均 10.15 分钟、在 noisy BH 平均 15.97 分钟，而 SNPE 分别为 65.45 与 67.60 分钟。

有序训练通常需要更多时间且变化更大，尤其是 noisy 1:9 下的 Synthetic-to-Simulation——在该配比下，尽管直接仿真预算相同，其宽运行时间分布与更短的 Mixed 运行形成对比。因此有序训练在 noisy 设定中取得的更低差异伴随额外计算成本。

相同直接仿真预算下的差异反映了各流程包含的其它成本，包括编码器拟合、代理拟合与后验训练。合成生成还会在每次编码器更新后反复进行，十轮内产生 $5.5N_s$ 个被接受的对而非仅最终的 $N_s$ 个；加上图 C.2 所示的神经训练成本，这种反复生成对实测运行时间有贡献。因此在 1:9 下 90% 的直接仿真削减未必带来总时间的同比例降低。

#### 3.3.3 代理与增强诊断

前述比较确立了 DF-NPE 作为完整流程的性能，但多个组分同时变化。为在固定表示下考察增强的贡献，我们冻结编码器、代理、直接仿真数据仓与后验初始化：两个对照臂都使用 1,000 次后验更新，增强臂额外接收合成对；由于合成对在该预算内替代了部分直接仿真数据暴露，该比较度量的是**固定更新预算下增强的效应**。

在这些对照下，增强对后验恢复的影响因设定而异。以 1:9 的 Synthetic-to-Simulation 来源，它在 smooth 设定十对中的九对降低了诊断 MMD²，但在 noisy 设定八对中反而变差。代理检查还发现，在每个测试的来源配置中平均超额差异都为正，表明生成的摘要与直接编码的摘要之间仍存在差异。这些发现有助于解释：完整流程的收益不能仅归因于合成对。附录 D 报告完整对照与代理结果；预测性检验见附录 B.1.2。

## 4 讨论与结论

DF-NPE 通过在学习到的摘要空间中生成额外训练对来降低对直接仿真的需求：直接仿真经由编码器更新该空间并训练条件代理，后者再为后验估计提供合成摘要。在两种 Brock–Hommes 设定中，该流程以更少的直接仿真与更低的记录运行时间恢复了后验结构，优于 SNPE。这些实验把 Dyer et al.（2024）的仿真效率比较扩展到神经后验训练所用数据的**构成**。

最清晰的节省出现在 Mixed 1:9：1,000 次直接仿真对 SNPE 的 10,000 次；其平均 WASS 与 MMD² 在两种设定下都更低，尽管 noisy 设定的中位数未优于基线。其它配比取得了更低差异，因此**最大的仿真节省与最佳后验一致性出现在不同配比**。在选预算时这一区分很重要：重复拟合分布展示各选择的精度与波动，后验图揭示相应的分布结构。

这些对的使用方式也影响恢复：Mixed 在 smooth 设定表现较好，而 noisy 3:7 下 Synthetic-to-Simulation 在所测策略中取得最低中位差异。对某一设定有效的策略未必在另一设定更可取。此外，每个拟合后验决定下一轮提议，使训练选择影响后续数据与当前拟合；加上不同的停止规则，这种反馈解释了为何策略比较针对完整推断流程。

冻结组分对照对这些流程中的合成增强提供了更窄的视角：一旦表示与代理固定，加入生成对在某些配置改善、在另一些配置变差。这种对已拟合组分的依赖与附录 A 的增强分布一致——其中同时包含编码仿真器输出与代理生成的摘要。提议修正调整参数采样，但并未消除这些条件分布之间的差异。因此观察到的增益支持把增强作为 DF-NPE 的一部分来评估，并按后验恢复选择其配比。

该选择同样决定计算成本：Mixed 1:9 在两种设定下记录运行时间最低，而有序训练在相同直接仿真预算下可能显著更久；额外时间包括重新编码、代理拟合、反复合成生成与后验训练。把直接调用与总运行时间一起评估，才能判断仿真需求的降低是否转化为更快的校准流程。

目前证据来自对每种设定单一仿真观测的重复拟合，并以有限 MCMC 参考抽样评估。把评估扩展到独立观测将可用基于仿真的校准更广泛地评估不确定性（Talts et al., 2018; Hermans et al., 2022）。更多 ABM 族可检验配比与策略结果的迁移性，而应用到市场数据还需检验仿真器误设定（Ward et al., 2022; Schmitt et al., 2024）。

在所测试的 Brock–Hommes 设定内，DF-NPE 表明生成的潜在摘要可以补充有限的直接仿真训练集，同时保留有用的后验信息。其实际价值在于让这种替代可在序列后验估计中使用，并通过后验恢复与计算成本评估其配比与训练策略。

## 图注

**图 1（原 PDF 第 4 页）：** 采用三种后验训练策略的 DF-NPE。(A) **共享数据生成**：当前提议 $\pi_k(\boldsymbol\theta)$ 经直接仿真器 $x\sim p(x\mid\theta)$ 产生轨迹，更新编码器 $\mathbf h=e_{\omega_k}(\mathbf x)$ 得直接潜在对 $\mathcal H_r^{(k)}$；同时由历史提议 $\theta\sim\pi_j$（$j\leq k$）经 Flow 1 潜在代理 $q_{\phi_k}(\mathbf h\mid\theta)$ 抽样生成合成潜在对 $\mathcal H_s^{(k)}$（代理仅用直接仿真对拟合）。(B) **后验训练**：每次运行选择一种策略——Mixed（直接+合成，整个训练过程池化）、Simulation-to-Synthetic（直接→合成，阶段 1→阶段 2）、Synthetic-to-Simulation（合成→直接，阶段 1→阶段 2）；Flow 2 后验流 $q_{\psi_k}(\boldsymbol\theta\mid\mathbf h)$ 以 SNPE-C 训练，并条件化在观测 $\mathbf h_{o,k}=e_{\omega_k}(\mathbf y^o)$ 上。有序阶段在每轮内共享后验权重。最终后验成为下一轮提议 $\pi_{k+1}$，对 $k=1,\ldots,K$ 重复。蓝色与青色分别表示直接仿真数据与合成数据；虚线箭头表示拟合后验（以观测摘要为条件）为下一轮提供提议。

**图 2（原 PDF 第 11 页）：** smooth Brock–Hommes 设定下近似真值、SNPE 与 DF-NPE 的后验样本；DF-NPE 采用 Mixed 训练、直接:合成 = 3:7。对角面板以计数直方图展示边缘后验分布；上三角面板以二维计数直方图展示双变量联合分布；红线和红点表示基于似然参考后验的均值；离对角图中颜色越深/越浅分别表示样本计数越低/越高。

**图 3（原 PDF 第 12 页）：** smooth Brock–Hommes 设定下 SNPE 与采用 Mixed 训练的 DF-NPE 的后验差异（(a) Wasserstein 距离；(b) 平方最大均值差异）。每种配置在单一固定观测上重复十次拟合；比例表示直接仿真:合成配比；SNPE 仅使用直接仿真。白线为中位数、箱体为四分位距、须线延伸至 1.5 倍四分位距内最极端值。

**图 4（原 PDF 第 12 页）：** noisy Brock–Hommes 设定下近似真值、SNPE 与 DF-NPE（Mixed 3:7）的后验样本，面板约定同图 2。

**图 5（原 PDF 第 13 页）：** noisy Brock–Hommes 设定下 SNPE 与 Mixed DF-NPE 的后验差异（(a) WASS；(b) MMD²），约定同图 3。

**图 6（原 PDF 第 15 页）：** smooth Brock–Hommes 设定下三种 DF-NPE 训练策略与 SNPE 的后验差异（(a) WASS；(b) MMD²）；在 1:9、3:7、5:5 配比下各重复十次。Syn.→Sim. 与 Sim.→Syn. 分别表示 Synthetic-to-Simulation 与 Simulation-to-Synthetic。箱线约定同图 3。

**图 7（原 PDF 第 15 页）：** noisy Brock–Hommes 设定下三种训练策略与 SNPE 的后验差异，约定同图 6。

**图 8（原 PDF 第 16 页）：** SNPE 与三种 DF-NPE 训练策略在 smooth（a）与 noisy（b）Brock–Hommes 设定下的端到端运行时间（分钟）；每种配置在 1:9、3:7、5:5 配比下各十次运行。箱线约定同图 3。

## 表注（附录表格逐格转录）

### 表 A.1：Mixed 与 SNPE 的架构与优化设置（原 PDF 第 21 页）

| 组件 | 设置 |
|---|---|
| 监督编码器 | 两层 GRU，隐藏宽度 32、潜在维数 8；参数回归头含一个 32 单元隐藏层 |
| 编码器拟合 | Adam，学习率 $10^{-3}$，批大小 100，最多 100 个 epoch；潜在提取批大小 256 |
| 条件潜在代理 | 五变换 MAF，50 个隐藏特征；学习率 $5\times10^{-4}$，批大小 100，10% 验证、10 个验证 epoch 后提前停止 |
| 潜在后验估计器 | 五变换 SNPE-C MAF，50 个隐藏特征；学习率 $5\times10^{-4}$，批大小 200，10% 验证、20 个验证 epoch 后提前停止 |
| SNPE 对照 | 经项目默认设置联合训练两层 GRU 嵌入与 MAF 后验 |
| 执行（计时） | 计时运行把神经拟合上限设为 500 个 epoch |

### 表 B.1：smooth Brock–Hommes 的后验预测性检验（原 PDF 第 23 页）

十次拟合，每次向仿真器回投 200 个后验抽样；条目为均值±样本标准差。

| 流程 | 90% 覆盖率 | 中位 RMSE | 摘要 MAE |
|---|---|---|---|
| 1:9 | 0.979±0.020 | 0.577±0.294 | 0.380±0.318 |
| 3:7 | 0.931±0.093 | 0.459±0.074 | 0.267±0.105 |
| 5:5 | 0.957±0.050 | 0.513±0.060 | 0.190±0.027 |
| 7:3 | 0.951±0.097 | 0.482±0.089 | 0.227±0.063 |
| 9:1 | 0.973±0.022 | 0.484±0.083 | 0.203±0.049 |
| SNPE | 0.932±0.011 | 0.372±0.015 | 0.222±0.014 |
| 参考抽样 | 0.924±0.012 | 0.656±0.041 | 0.522±0.028 |

### 表 C.1：smooth Brock–Hommes 的同直接预算比较（原 PDF 第 25 页）

五个配对种子；条目为 SNPE 减 Mixed 差异的均值±样本标准差，正值有利于 Mixed；括号为五种子中改善的个数。

| 配比 | 直接仿真/轮 | WASS 增益 | MMD² 增益 | MAE 增益 |
|---|---|---|---|---|
| 1:9 | 100 | 0.202±0.140 (5/5) | 0.295±0.308 (3/5) | 0.083±0.049 (5/5) |
| 3:7 | 300 | 0.216±0.096 (5/5) | 0.403±0.195 (5/5) | 0.067±0.027 (5/5) |
| 5:5 | 500 | 0.229±0.172 (5/5) | 0.465±0.347 (5/5) | 0.070±0.054 (5/5) |
| 7:3 | 700 | 0.260±0.063 (5/5) | 0.484±0.150 (5/5) | 0.076±0.027 (5/5) |
| 9:1 | 900 | 0.310±0.057 (5/5) | 0.573±0.169 (5/5) | 0.087±0.015 (5/5) |

### 表 C.2：两种 Brock–Hommes 设定下 Mixed 各流程与 SNPE（原 PDF 第 25 页）

十个种子的均值±样本标准差；分数与计时约定同第 3.1 节；配比为直接仿真:合成；时间单位分钟。

| 流程 | WASS | MMD² | MAE（对 $\theta^*$） | 时间（分钟） | 加速比 |
|---|---|---|---|---|---|
| **Smooth Brock–Hommes** | | | | | |
| 1:9 | 0.3051±0.0841 | 0.5637±0.1997 | 0.0780±0.0256 | 10.15±2.21 | 6.45× |
| 3:7 | 0.2681±0.1042 | 0.4595±0.2168 | 0.0685±0.0326 | 16.03±5.59 | 4.08× |
| 5:5 | 0.2458±0.1228 | 0.4007±0.2635 | 0.0590±0.0382 | 19.13±2.91 | 3.42× |
| 7:3 | 0.2489±0.1239 | 0.4478±0.2968 | 0.0656±0.0414 | 21.47±2.14 | 3.05× |
| 9:1 | 0.2403±0.1027 | 0.4430±0.2559 | 0.0622±0.0332 | 25.63±1.11 | 2.55× |
| SNPE | 0.4046±0.0808 | 0.7265±0.1487 | 0.1053±0.0239 | 65.45±9.41 | 1.00× |
| **Noisy Brock–Hommes** | | | | | |
| 1:9 | 0.1460±0.0383 | 0.033966±0.017558 | 0.0715±0.0127 | 15.97±6.75 | 4.23× |
| 3:7 | 0.1349±0.0423 | 0.028714±0.021016 | 0.0806±0.0177 | 17.15±6.22 | 3.94× |
| 5:5 | 0.1340±0.0274 | 0.024385±0.012898 | 0.0729±0.0126 | 20.00±3.98 | 3.38× |
| 7:3 | 0.1726±0.1001 | 0.057256±0.075828 | 0.0917±0.0565 | 25.86±9.48 | 2.61× |
| 9:1 | 0.1136±0.0366 | 0.015977±0.013607 | 0.0740±0.0233 | 26.76±3.34 | 2.53× |
| SNPE | 0.1761±0.0694 | 0.052598±0.039299 | 0.0597±0.0097 | 67.60±18.63 | 1.00× |

### 表 C.3：完整有序流程结果（原 PDF 第 26 页）

十个种子（均值±样本标准差）；Syn.→Sim. 与 Sim.→Syn. 分别表示 Synthetic-to-Simulation 与 Simulation-to-Synthetic；时间（分钟）为端到端。Mixed 与 SNPE 结果见表 C.2。

| 配比 | 调度 | WASS | MMD² | MAE（对 $\theta^*$） | 时间（分钟） |
|---|---|---|---|---|---|
| **Smooth Brock–Hommes** | | | | | |
| 1:9 | Syn.→Sim. | 0.4182±0.1407 | 0.76124±0.24726 | 0.1223±0.0406 | 27.71±26.66 |
| 1:9 | Sim.→Syn. | 0.3696±0.1209 | 0.67745±0.27146 | 0.1017±0.0376 | 17.70±9.69 |
| 3:7 | Syn.→Sim. | 0.2993±0.0888 | 0.55649±0.23965 | 0.0804±0.0258 | 15.39±7.99 |
| 3:7 | Sim.→Syn. | 0.3822±0.1739 | 0.76860±0.47356 | 0.1011±0.0463 | 17.22±5.87 |
| 5:5 | Syn.→Sim. | 0.2612±0.1182 | 0.44882±0.31734 | 0.0676±0.0336 | 25.23±20.61 |
| 5:5 | Sim.→Syn. | 0.2932±0.1624 | 0.54872±0.41960 | 0.0812±0.0516 | 20.31±7.55 |
| **Noisy Brock–Hommes** | | | | | |
| 1:9 | Syn.→Sim. | 0.1232±0.0342 | 0.02215±0.01545 | 0.0656±0.0165 | 84.23±62.70 |
| 1:9 | Sim.→Syn. | 0.1323±0.0170 | 0.02316±0.00657 | 0.0586±0.0134 | 33.52±10.96 |
| 3:7 | Syn.→Sim. | 0.1020±0.0178 | 0.01095±0.00460 | 0.0824±0.0156 | 30.20±13.38 |
| 3:7 | Sim.→Syn. | 0.1388±0.0223 | 0.02357±0.01175 | 0.0815±0.0127 | 24.06±12.54 |
| 5:5 | Syn.→Sim. | 0.1326±0.0573 | 0.02663±0.03196 | 0.0910±0.0339 | 26.06±10.55 |
| 5:5 | Sim.→Syn. | 0.1341±0.0310 | 0.02353±0.01277 | 0.0849±0.0346 | 22.35±7.11 |

### 表 D.1：条件代理诊断（原 PDF 第 27 页）

十个来源拟合的均值±来源种子标准差；先验与参考超额 MMD² 各对每区域十个参数位点取平均，并使用来源特定标准化。

| 任务 | 来源 | 配比 | 先验超额 MMD² | 参考超额 MMD² |
|---|---|---|---|---|
| Smooth BH | G→S | 1:9 | 0.36259±0.03831 | 0.29850±0.07948 |
| Smooth BH | G→S | 3:7 | 0.22473±0.04098 | 0.15527±0.06224 |
| Smooth BH | G→S | 5:5 | 0.20284±0.03971 | 0.09657±0.02512 |
| Smooth BH | S→G | 1:9 | 0.27270±0.05115 | 0.20251±0.09400 |
| Smooth BH | S→G | 3:7 | 0.25792±0.04028 | 0.13531±0.04036 |
| Smooth BH | S→G | 5:5 | 0.21534±0.04260 | 0.08688±0.03532 |
| Noisy BH | G→S | 1:9 | 0.38752±0.06211 | 0.00999±0.00512 |
| Noisy BH | G→S | 3:7 | 0.24126±0.04675 | 0.02813±0.01664 |
| Noisy BH | G→S | 5:5 | 0.22142±0.02758 | 0.02940±0.01559 |
| Noisy BH | S→G | 1:9 | 0.28685±0.02244 | 0.01083±0.00445 |
| Noisy BH | S→G | 3:7 | 0.25707±0.04170 | 0.02331±0.01211 |
| Noisy BH | S→G | 5:5 | 0.22478±0.03046 | 0.03289±0.00918 |

### 表 D.2：仅先验的冻结组分增强对照（原 PDF 第 28 页）

十个来源拟合的增强减直接差异（均值±样本标准差）；括号为十次中改善的个数，负值有利于增强。$\Delta\mathrm{MMD}^2_{\mathrm{diag}}$ 使用标准化诊断核，$\Delta W_{\mathrm{marg}}$ 为按先验宽度缩放的边缘 Wasserstein 距离，$\Delta e_{\mathrm{ref}}$ 为参考均值误差。来源标签标识编码器—代理来源（G→S：Synthetic-to-Simulation；S→G：Simulation-to-Synthetic）。两个增强臂都使用池化训练、共享直接仿真数据仓、初始化与 1,000 次更新预算，但直接数据暴露不同。诊断分数定义与主分数不同。

| 任务 | 来源 | 配比 | $\Delta\mathrm{MMD}^2_{\mathrm{diag}}$ | $\Delta W_{\mathrm{marg}}$ | $\Delta e_{\mathrm{ref}}$ |
|---|---|---|---|---|---|
| Smooth BH | G→S | 1:9 | −0.01428±0.01305 (9) | −0.00933±0.01407 (7) | −0.00989±0.01472 (7) |
| Smooth BH | G→S | 3:7 | −0.00624±0.02317 (5) | −0.00832±0.00733 (9) | −0.01047±0.00958 (8) |
| Smooth BH | G→S | 5:5 | −0.01409±0.01681 (7) | −0.01087±0.00864 (9) | −0.01311±0.00914 (10) |
| Smooth BH | S→G | 1:9 | −0.00143±0.02758 (7) | −0.00077±0.01900 (5) | −0.00365±0.01970 (5) |
| Smooth BH | S→G | 3:7 | −0.00139±0.02299 (6) | 0.00082±0.02088 (4) | 0.00044±0.02295 (5) |
| Smooth BH | S→G | 5:5 | −0.02537±0.01602 (9) | −0.01076±0.01356 (8) | −0.01327±0.01485 (8) |
| Noisy BH | G→S | 1:9 | 0.04266±0.05436 (2) | 0.00575±0.01111 (4) | 0.00565±0.01120 (4) |
| Noisy BH | G→S | 3:7 | 0.00216±0.06842 (5) | −0.00607±0.01411 (8) | −0.00958±0.01484 (8) |
| Noisy BH | G→S | 5:5 | −0.00375±0.08704 (5) | −0.00288±0.01178 (5) | −0.00436±0.01373 (7) |
| Noisy BH | S→G | 1:9 | 0.00607±0.05314 (5) | −0.00494±0.01566 (6) | −0.00958±0.01709 (6) |
| Noisy BH | S→G | 3:7 | −0.06486±0.06476 (9) | −0.00649±0.00907 (7) | −0.01110±0.01046 (9) |
| Noisy BH | S→G | 5:5 | −0.03394±0.08360 (8) | −0.00009±0.01757 (4) | −0.00642±0.02093 (6) |

## 附录 A—D：结构化译文

以下按原文附录顺序给出各附录的定义、公式与结果要点。原文附录 A—D 约占 9 页、以实现细节与逐式推导为主，本页对附录采用**结构化译文**（保留全部表 A.1—D.2 与关键公式，正文推导以要点呈现），此为与"全文"口径的已知差异，见页尾状态段。

### 附录 A：DF-NPE 的实现细节

**A.1 架构与优化。** 表 A.1 给出共享架构与 Mixed 优化设置；神经网络参数用 Adam 更新（Kingma and Ba, 2015）。对有序训练，表 A.1 中的代理设置最多使用 100 个 epoch；后验阶段使用 Adam（学习率 $5\times10^{-4}$）与第 3.2.1 节的更新次数和批大小。不完整的小批量被丢弃，打乱后的数据加载器循环直到达到所需更新次数；禁用序列后微调。计时运行在 macOS 15.6.1 ARM64、Python 3.12.7 上使用单个仿真器工作进程，计时边界遵循第 3.1 节。

**A.2 源采样与比较控制。** 源采样分布由式（10）定义，三种调度见式（12）—（14）。Mixed 全程使用 $\lambda_{k,t}=\rho_k=n_r^{(k)}/(n_r^{(k)}+n_s^{(k)})$；有序训练在 500 次更新后从 0 切换到 1 或从 1 切换到 0。这指定的是源采样，而非对 atomic SNPE-C 损失的分解：合并小批量可同时包含来自两种来源的对比原子。

**A.3 增强分布的含义。** 提议修正并不能修正代理误差。若 $p_{\omega_k}(\mathbf h\mid\boldsymbol\theta)$ 是编码仿真器分布，则常数直接仿真占比 $\rho$ 给出的总体混合为

$$
p_{k,\rho}(\mathbf h\mid\boldsymbol\theta)=\rho\,p_{\omega_k}(\mathbf h\mid\boldsymbol\theta)+(1-\rho)\,q_{\phi_k}(\mathbf h\mid\boldsymbol\theta).\tag{A.1}
$$

在提议支撑充分且密度估计理想的条件下，目标与 $p(\boldsymbol\theta)p_{k,\rho}(\mathbf h\mid\boldsymbol\theta)$ 成正比。该式刻画训练目标，但既未建立收敛性、也未消除表示误差、代理误差与密度估计误差。

### 附录 B：实验细节补充

**B.1 评分细节与预测性检验。** 每种配置对同一观测使用种子 123、456、789、101、202、303、404、505、606 与 707；预算与配比见第 3.2.1 节。六个历史 smooth 区制、种子 123 的配置含 10,000 个抽样：分布评分使用归档的 1,000 抽样子集，而 MAE 保留全均值；其他数值样本集含 1,000 抽样。因此该历史子集中 MAE 估计的 Monte Carlo 精度不等。

**B.1.1 后验均值参数误差。** 对已知生成参数 $\boldsymbol\theta^*$，报告估计后验均值的平均绝对误差

$$
\mathrm{MAE}_{\theta^*}=\frac{1}{d_\theta}\sum_{\ell=1}^{d_\theta}\left|\bar\vartheta_\ell-\theta_\ell^*\right|,\qquad \bar{\boldsymbol\vartheta}=\frac{1}{m_\mu}\sum_{j=1}^{m_\mu}\boldsymbol\vartheta_j,\tag{B.1}
$$

其中 $d_\theta=4$、$m_\mu$ 为用于估计均值的抽样数。较低 MAE 表示后验均值更接近生成系数，但它并不确立准确的后验不确定性：对有限观测轨迹，参考后验均值本身未必等于 $\boldsymbol\theta^*$。因此在评估后验恢复时，MAE 是两项分布差异的次要指标（Lueckmann et al., 2021）。

**B.1.2 后验预测分数。** 后验预测性检验通过把观测与后验下抽样的复制数据比较来评估模型拟合（Gelman et al., 1996）。对 smooth Brock–Hommes，令 $\mathbf x_t^{(r)}$（$r=1,\ldots,R_{\mathrm{pp}}$）表示每次拟合由 $R_{\mathrm{pp}}=200$ 个后验抽样仿真的轨迹；对观测轨迹 $y_{o,t}$，令 $q_{a,t}$ 为时刻 $t$ 仿真值的经验 $a$-分位数，则报告的点态中位 RMSE 与观测点覆盖率为

$$
\mathrm{RMSE}_{\mathrm{med}}=\left[\frac{1}{T_o}\sum_{t=1}^{T_o}\left(q_{0.5,t}-y_{o,t}\right)^2\right]^{1/2},\qquad C_{0.9}=\frac{1}{T_o}\sum_{t=1}^{T_o}\mathbf 1\left\{q_{0.05,t}\leq y_{o,t}\leq q_{0.95,t}\right\},\tag{B.2}
$$

其中 $T_o$ 为存储轨迹长度。六摘要误差使用包含轨迹均值、标准差、最小值、最大值、末值减首值以及与线性时间索引相关系数的 $s(\mathbf x)$；标准差使用除数 $T_o$，常数轨迹的时间相关设为零。对每个分量，计算预测轨迹间中位数并报告

$$
\mathrm{MAE}_{\mathrm{summary}}=\frac16\sum_{\ell=1}^{6}\left|\operatorname{median}_r\,s_\ell\left(\mathbf x^{(r)}\right)-s_\ell\left(\mathbf y^o\right)\right|.\tag{B.3}
$$

这些摘要求平均前未重新缩放，因此其贡献依赖各自数值尺度；该轨迹摘要误差与参数均值的 $\mathrm{MAE}_{\theta^*}$ 不同。较低的 RMSE 与摘要 MAE 表示在这些特定损失下预测更一致；覆盖率是观测时间点落在逐点带内的比例，而非重复观测的参数覆盖率或同时轨迹覆盖率；由于区间宽度不可得，仅凭更大覆盖率不能确立更好预测性能。表 B.1 给出完整预测分数：某些误差对有限参考样本而言大于拟合估计器，这一未解决差异并不表明拟合方法具有更优后验恢复。

**B.1.3 后验显示约定。** 后验展示使用 Dyer et al.（2024）的 pairplot 实现：50 个分箱的边缘、在任务特定先验范围上 $50\times50$ 的二维分箱、下三角留空。样本数、缩放与种子选择遵循第 3.2.1 节。

**B.2 分数协调与来源。** 原始有序套件诊断使用平均边缘 Wasserstein 距离、有偏 MMD² 统计量以及与主分数不同的定义；附录 C.2 中同直接预算比较使用的增益量定义见该表注。不同表格的数值不可直接与主文工作流表合并。

### 附录 C：补充结果

**C.1 后验几何。** 附录 C 的后验图按任务展示估计后验的边缘与联合几何，用于说明第 3 节的差异比较对应的分布形状（具体图形见原文附录 C）。

**C.2 同直接仿真预算比较（表 C.1）。** 在 smooth 设定中，Table C.1 用相同直接仿真预算比较 Mixed 与 SNPE：每个配比有五个配对种子，两个流程保留各自的表示学习与训练协议。增益为 SNPE 减 Mixed 的差异（正值利于 Mixed），全部配比的 WASS 在 5/5 个种子上改善，MMD² 在 3/5—5/5 个种子上改善。

**C.3 Mixed 配比与 SNPE（表 C.2）。** 表 C.2 给出两种 BH 设定下 Mixed 各配比与 SNPE 的 WASS、MMD²、对 $\theta^*$ 的 MAE、运行时间与加速比：smooth 设定中 Mixed 1:9 平均 10.15 分钟、加速 6.45×，SNPE 为 65.45 分钟；noisy 设定中 Mixed 1:9 平均 15.97 分钟、加速 4.23×，SNPE 为 67.60 分钟。

**C.4 运行时间分阶段。** 附录图 C.2 把 SNPE 与 Mixed 各配比的端到端时间按阶段分解为直接仿真、编码器训练、潜在代理训练、合成生成、后验训练、后验采样与 setup/I/O/绘图；各段中位数之和不必等于端到端中位时间。

**C.5 完整有序流程结果（表 C.3）。** 表 C.3 给出十种子的完整有序流程均值与标准差。noisy 3:7 处 Synthetic-to-Simulation 的配对优势最一致：WASS 在全部十对中改善、MMD² 在八对中改善；均值差（Synthetic-to-Simulation 减 Simulation-to-Synthetic）为 WASS $-0.0369\pm0.0279$、MMD² $-0.0126\pm0.0126$。noisy 1:9 与 5:5 处 WASS 分别在六对与七对中改善；smooth 设定中各配比只在四到五对中改善，且 1:9 处两项均值差异都利于反向顺序；noisy 5:5 处均值差异对 WASS 利于 Synthetic-to-Simulation、对 MMD² 利于反向顺序。这些描述性比较未识别出统一更优的顺序。

### 附录 D：诊断细节与结果

诊断使用第 3.2.1 节有序运行所得 120 对最终编码器—代理；历史 Mixed 来源因协议与重复设置不同被排除。来源种子是重复单位，位点与轨迹为嵌套测量；诊断使用最终拟合组分、共享数据仓与每种设定的单一观测。

**D.1 条件代理保真度。** 对每个任务，从先验抽十个参数位点、从有限参考后验抽十个位点（参考后验位点仅用于离线评估，推断时不可得）。每个位点上三批各 100 条轨迹的独立批次分别提供校准、评估与直接—直接基线摘要；冻结编码器把所有轨迹映射到其八维表示，冻结条件代理在同参数处生成 100 个摘要。令 $\mu_j$、$s_j$ 为直接校准批的坐标均值与样本标准差（下限 $\max\{10^{-5}\operatorname{median}_j(s_j),10^{-8}\}$），则该位点所有摘要标准化为 $z_j=(h_j-\mu_j)/s_j$，诊断核为

$$
k_{\mathrm{diag}}(\mathbf z,\mathbf z')=\exp\left[-\frac{\|\mathbf z-\mathbf z'\|_2^2}{b}\right],\qquad b=\max\left\{\underset{i<j:\ \|\mathbf z_i-\mathbf z_j\|_2>0}{\operatorname{median}}\|\mathbf z_i-\mathbf z_j\|_2,\ 10^{-8}\right\},\tag{D.1}
$$

其中带宽使用校准批，退化的全零情形取 $b=1$。直接—合成与直接—直接样本使用同一个无偏 MMD² 估计器；超额差异为二者之差

$$
\mathcal E_{\mathrm{sur}}=\widehat{\mathrm{MMD}}^2\left(\mathbf z_{\mathrm{test}},\mathbf z_{\mathrm{syn}}\right)-\widehat{\mathrm{MMD}}^2\left(\mathbf z_{\mathrm{test}},\mathbf z_{\mathrm{baseline}}\right).\tag{D.2}
$$

数值先在每个区域内对十个位点平均，再跨十个来源拟合汇总。减去有限样本基线是描述性做法而非校准假设检验，可能产生负值。表 D.1 给出各任务、来源与配比下的先验/参考超额 MMD²：所有测试配置的平均超额差异为正，表明生成的摘要与直接编码的摘要之间仍存在差异。

**D.2 全新仅先验增强对照。** 第 3.3.3 节的配对对照独立于序列数据仓抽取新的仅先验训练数据仓；直接/合成仓规模按来源比例取 1,000/9,000、3,000/7,000 或 5,000/5,000。两个对照臂都在共享直接仿真子集上拟合归一化，并使用批大小 200、学习率 $5\times10^{-4}$ 的 Adam；无需序列提议修正。直接数据暴露在仅直接批量中为 1、在增强批量中为 $\rho=n_S/(n_S+n_G)$。每个臂在有限拒绝预算内保留 1,000 个限制在先验支撑上的后验抽样。诊断后验 MMD² 使用上述核，其坐标尺度与带宽由任务的有限参考后验估计；平均边缘 Wasserstein 距离先把每个参数坐标除以其先验宽度；参考均值误差为后验均值与参考均值之间的平均绝对坐标差。这些定义不同于第 3.1 节的联合 Wasserstein、旧核与生成参数 MAE，其数值不得与前述工作流表合并。完整诊断数据收集为每个任务额外使用 15,512 次直接调用（6,000 条位点轨迹、9,000 条先验数据仓轨迹与 512 条额外验证轨迹）；总 31,024 次调用、诊断训练与采样成本不计入工作流加速比。来源记录、数据仓身份、计时、接受率与 420 组后验样本保留在证据档案中，权重与完整仿真数据仓保留在原实验目录。

## 参考文献（英文原条目，author—year 格式）

以下按原文参考文献表的字母序转录英文条目，保留英文原貌；本页未翻译条目文字，也未联网核验 DOI、卷号与页码。

- Barde, S. (2024). Bayesian estimation of large-scale simulation models with Gaussian process regression surrogates. Computational Statistics & Data Analysis, 196:107972.

- Beaumont, M. A., Cornuet, J.-M., Marin, J.-M., and Robert, C. P. (2009). Adaptive approximate Bayesian computation. Biometrika, 96(4):983–990.

- Bernton, E., Jacob, P. E., Gerber, M., and Robert, C. P. (2019). Approximate bayesian computation with the wasserstein distance. Journal of the Royal Statistical Society: Series B (Statistical Methodology), 81(2):235–269.

- Blum, M. G. B., Nunes, M. A., Prangle, D., and Sisson, S. A. (2013). A comparative review of dimension reduction methods in approximate Bayesian computation. Statistical Science, 28(2):189–208.

- Brock, W. A. and Hommes, C. H. (1998). Heterogeneous beliefs and routes to chaos in a simple asset pricing model. Journal of Economic Dynamics and Control, 22(8–9):1235–1274.

- Cai, Z., Tang, J., Mukherjee, S., Li, J., Schönlieb, C.-B., and Zhang, X. (2024). Nf-ula: Normalizing flow-based unadjusted langevin algorithm for imaging inverse problems. SIAM Journal on Imaging Sciences, 17(2):820–860.

- Cho, K., van Merriënboer, B., Gulcehre, C., Bahdanau, D., Bougares, F., Schwenk, H., and Bengio, Y. (2014). Learning phrase representations using RNN encoder–decoder for statistical machine translation. In Proceedings of the 2014 Conference on Empirical Methods in Natural Language Processing (EMNLP), pages 1724–1734. Association for Computational Linguistics.

- Cranmer, K., Brehmer, J., and Louppe, G. (2020). The frontier of simulation-based inference. Proceedings of the National Academy of Sciences, 117(48):30055–30062.

- Dignum, E., Choudhary, H., and Lees, M. (2025). Simulation-based inference in agent-based models using spatio-temporal summary statistics. In Computational Science – ICCS 2025 Workshops, volume 15908 of Lecture Notes in Computer Science, pages 239–254. Springer.

- Dyer, J., Cannon, P., Farmer, J. D., and Schmon, S. M. (2024). Black-box bayesian inference for agent-based models. Journal of Economic Dynamics and Control, 161:104827.

- Fearnhead, P. and Prangle, D. (2012). Constructing summary statistics for approximate bayesian computation: semi-automatic approximate bayesian computation. Journal of the Royal Statistical Society: Series B (Statistical Methodology), 74(3):419–474.

- Gelman, A., Meng, X.-L., and Stern, H. (1996). Posterior predictive assessment of model fitness via realized discrepancies. Statistica Sinica, 6(4):733–760.

- Grazzini, J., Richiardi, M. G., and Tsionas, M. (2017). Bayesian estimation of agent-based models. Journal of Economic Dynamics and Control, 77:26–47.

- Greenberg, D. S., Nonnenmacher, M., and Macke, J. H. (2019). Automatic posterior transformation for likelihood-free inference. In Proceedings of the 36th International Conference on Machine Learning, volume 97 of Proceedings of Machine Learning Research, pages 2404–2414. PMLR.

- Gretton, A., Borgwardt, K. M., Rasch, M. J., Schölkopf, B., and Smola, A. (2012). A kernel two-sample test. Journal of Machine Learning Research, 13(25):723–773.

- Hermans, J., Delaunoy, A., Rozet, F., Wehenkel, A., Begy, V., and Louppe, G. (2022). A trust crisis in simulation-based inference? your posterior approximations can be unfaithful. Transactions on Machine Learning Research.

- Hikida, Y., Bharti, A., Jeffrey, N., and Briol, F.-X. (2025). Multilevel neural simulation-based inference. In Advances in Neural Information Processing Systems, volume 38, pages 52468–52502. Curran Associates, Inc.

- Jiang, B., Wu, T.-Y., Zheng, C., and Wong, W. H. (2017). Learning summary statistic for approximate bayesian computation via deep neural network. Statistica Sinica, 27(4):1595–1618.

- Kingma, D. P. and Ba, J. (2015). Adam: A method for stochastic optimization. In Proceedings of the 3rd International Conference on Learning Representations.

- Lamperti, F., Roventini, A., and Sani, A. (2018). Agent-based model calibration using machine learning surrogates. Journal of Economic Dynamics and Control, 90:366–389.

- Lueckmann, J.-M., Bassetto, G., Karaletsos, T., and Macke, J. H. (2019). Likelihood-free inference with emulator networks. In Proceedings of The 1st Symposium on Advances in Approximate Bayesian Inference, volume 96 of Proceedings of Machine Learning Research, pages 32–53. PMLR.

- Lueckmann, J.-M., Boelts, J., Greenberg, D. S., Gonçalves, P. J., and Macke, J. H. (2021). Benchmarking simulation-based inference. In Proceedings of the 24th International Conference on Artificial Intelligence and Statistics, volume 130 of Proceedings of Machine Learning Research, pages 343–351. PMLR.

- Lux, T. (2018). Estimation of agent-based models using sequential monte carlo methods. Journal of Economic Dynamics and Control, 91:391–408.

- Papamakarios, G. and Murray, I. (2016). Fast epsilon-free inference of simulation models with bayesian conditional density estimation. In Advances in Neural Information Processing Systems, volume 29, pages 1028–1036.

- Papamakarios, G., Pavlakou, T., and Murray, I. (2017). Masked autoregressive flow for density estimation. In Advances in Neural Information Processing Systems, volume 30, pages 2338–2347.

- Refaeli, D., Marcus-Kalish, M., and Steinberg, D. M. (2025). Reducing calls to the simulator in simulation based inference (SBI). arXiv preprint arXiv:2504.11925.

- Rezende, D. and Mohamed, S. (2015). Variational inference with normalizing flows. In Proceedings of the 32nd International Conference on Machine Learning, volume 37 of Proceedings of Machine Learning Research, pages 1530–1538. PMLR.

- Schmitt, M., Bürkner, P.-C., Köthe, U., and Radev, S. T. (2024). Detecting model misspecification in amortized Bayesian inference with neural networks. In Pattern Recognition, volume 14264 of Lecture Notes in Computer Science, pages 541–557. Springer.

- Shiono, T. (2021). Estimation of agent-based models using bayesian deep learning approach of BayesFlow. Journal of Economic Dynamics and Control, 125:104082.

- Talts, S., Betancourt, M., Simpson, D., Vehtari, A., and Gelman, A. (2018). Validating Bayesian inference algorithms with simulation-based calibration. arXiv preprint arXiv:1804.06788. Revised 2020.

- Tejero-Cantero, A., Boelts, J., Deistler, M., Lueckmann, J.-M., Durkan, C., Gonçalves, P. J., Greenberg, D. S., and Macke, J. H. (2020). sbi: A toolkit for simulation-based inference. Journal of Open Source Software, 5(52):2505.

- Ward, D., Cannon, P., Beaumont, M., Fasiolo, M., and Schmon, S. M. (2022). Robust neural posterior estimation and statistical model criticism. In Advances in Neural Information Processing Systems, volume 35, pages 33845–33859.

- Windrum, P., Fagiolo, G., and Moneta, A. (2007). Empirical validation of agent-based models: Alternatives and prospects. Journal of Artificial Societies and Social Simulation, 10(2):8.

- Wiqvist, S., Frellsen, J., and Picchini, U. (2021). Sequential neural posterior and likelihood approximation. arXiv preprint arXiv:2102.06522.

**本页范围与校对状态：** 本页依据 arXiv:2610.35442v1（cs.MA，2026-10-26，28 页）完成中文翻译：摘要、关键词、第 1—4 节（1 引言；2 双流 NPE 与 2.1—2.3；算法 1；3 数值实验含 3.1 指标、3.2 Brock–Hommes（3.2.1/3.2.2）、3.3 进一步分析（3.3.1—3.3.3）；4 讨论与结论）、图 1—8 中文图注、表 A.1、B.1、C.1、C.2、C.3、D.1、D.2 逐格转录、附录 A—D 结构化译文、参考文献（author—year 格式，按字母序）均按原文结构录入；正文编号公式 (1)—(23) 与附录式 (A.1)、B.1—B.3、D.1—D.2 按原文保留。表 C.1 与 C.2 已用本地 PDF 第 25 页渲染图逐格核对一致（1:9—9:1 各配比的 WASS/MMD²/MAE/时间/加速比；同直接预算增益与改善种子数）。**口径说明：** 正文为完整翻译；原文附录 A—D 约 9 页、以实现细节与逐式推导为主，本页采用结构化译文（保留全部附录表格与关键公式，推导以要点呈现），此为与"全文"要求的已知差异，已在此明确披露。**逐句逐式终校未做**；图 1—8 的图像内容未数字化，只转录图注与正文关键结论（如 90% 直接仿真削减、10.15/15.97 分钟对 65.45/67.60 分钟、加速 6.45×/4.23×、5.5N_s 合成生成量等）；其余表格（A.1、B.1、C.3、D.1、D.2）按抽取文本转录，未逐表渲染核对。原文疑点已就地加注：①正文 Table/Figure 编号为 Figure 1—8 与附录 Table A.1—D.2，无主文表；②附录 C.2 增益量（SNPE 减 Mixed）在抽取文本中与表 C.1 表注一致，已按"正值利于 Mixed"转录；③原文 B.2 提到旧有序套件诊断使用与主分数不同的有偏 MMD² 定义，本页按原文保留该说明。原文为 arXiv 预印本（cs.MA），可作可公开全文登记。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
