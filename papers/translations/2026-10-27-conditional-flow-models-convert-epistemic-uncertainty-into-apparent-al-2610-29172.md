---
layout: page
title: "条件流模型将认知不确定性转化为表观偶然不确定性｜中文全文译文"
permalink: /papers/translations/2026-10-27-conditional-flow-models-convert-epistemic-uncertainty-into-apparent-al-2610-29172/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3f655527a43a9d52/) · [原文 arXiv](https://arxiv.org/abs/2610.29172) · [全部目录](/papers/catalog/)

# 条件流模型将认知不确定性转化为表观偶然不确定性

**原题：** Conditional Flow Models Convert Epistemic Uncertainty into Apparent Aleatoric Variance  
**作者：** Navodita Sharma（麻省理工学院，通讯作者）、Abhishek Shetty（佐治亚理工学院）、Max Simchowitz（卡内基梅隆大学）、Pulkit Agrawal（麻省理工学院；与 Simchowitz 共同指导）  
**版本：** arXiv:2610.29172v1（cs.LG），2026-10-21；原文 30 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–7 节（含 4.1–4.2、5、6 全部小节）、结论与局限、附录 A–C（含 A.1–A.4、B.1–B.4、B.3.1–B.3.3、C）、图 1–18 图注、表 1 逐格、参考文献 44 条（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

条件流模型（conditional flow model，CFM）正日益在机器学习中被用来替代确定性预测器，包括那些经典上被表述为回归的任务。鉴于其在这些任务上的成功，我们提出一个问题：**CFM 产生的条件分布，相对点预测器而言携带了哪些有用信息？**

我们识别出一个系统性现象：在许多自然情形中，CFM 样本的方差**系统性地大于真实条件分布**的方差——即使在被视为几乎确定性的回归问题中也是如此。该效应在模型尚未解出对条件变量的依赖时最为显著，因此额外的方差可被理解为：把拟合真实条件分布过程中的**认知不确定性**（epistemic uncertainty）转化为生成样本中的**表观偶然方差**（apparent aleatoric variance）。通过受控合成实验与真实数据实验、以及与显式平滑估计器的比较，我们表明所诱导的方差**追踪模型对复杂或难以拟合目标的欠拟合程度**，并随额外训练或数据而减小。我们在一个简化设定中给出该现象的理论解释，并展示条件流匹配的一个随之而来的实际用途：设计能覆盖真实回归目标的**高覆盖预测集**。

## 1 引言

生成模型在机器学习中的作用迅速扩展。它们不再只返回单点预测，而是产生输出上的条件分布。或许令人意外的是，它们甚至在"只需预测单个值"的设定中也获得了广泛采用。我们称这些设定为**点预测问题**，涵盖机器人中预测高性能动作（Chi 等，2023）、强化学习中策略价值函数的准确估计（Agrawalla 等，2025），以及大量其他科学估计与时间序列问题（Klein 等，2025）。

本工作聚焦于条件流匹配模型（conditional flow-matching model，CFM）：它通过把学到的速度场从基础噪声积分到输出空间来产生样本。我们提出，这类模型带来一项互补收益：即使在观测几乎无噪的点预测问题中，它们也**能自然表达估计不确定性**。

理想情形下，最优流 $v^\star$ 把基础分布输运到真实条件律（Lipman 等，2023；Albergo & Vanden-Eijnden，2023）。然而实践中，流场由神经网络 $v_\theta$ 参数化且学习并不完美，原因包括训练数据有限、网络容量不足与优化不充分（如机器人学习界常用的早停）。因此学到的条件分布不仅由目标分布塑造，也由用神经网络拟合真实向量场学习所引入的归纳偏置塑造。特别是，神经网络在学习中倾向于**过度平滑高频特征**（Rahaman 等，2019；Xu 等，2020；Tancik 等，2020），使学到的向量场 $v_\theta$ 欠拟合真实 $v^\star$。

我们跨领域、并在自然的理论设定中证明：在这种常见的欠拟合行为下，条件流模型会把**认知不确定性转化为表观偶然方差**——即，关于生成变量对条件变量依赖的近似误差或不确定性，表现为学到的条件分布中更大的散布。

除科学意义外，这有可操作的后果：可以训练条件流匹配模型去拟合**可能确定性的目标函数**，只要模型不过拟合，就能用其样本的散布来定义**包含真值函数的置信集**，而无需保形（conformal）修正。

在我们研究的所有应用领域中——包括 RL 策略评估、细胞扰动预测与机器人策略学习——这样构建的预测集在**欠拟合区间**中经验上近似校准；这一性质正是方差膨胀现象所带来的。实践者可在点预测之外**免费**获得不确定性估计。

**图 1：** 欠拟合期间流模型与回归的对比：(a) 真实数据函数 $f^\star(c)$（$n=128$ 数据点）；(b) 早停下的神经网络回归（预测均值过平滑）；(c) 早停下的流模型（样本在均值附近有很宽的 95% 带）；(d) 学到的条件密度 $\hat p(x\mid c)$ 热图（在 $f^\star$ 于平滑邻域内高频振荡处呈现宽而近双峰的分布）。

更具体地，我们做出以下贡献：

- 我们识别出**条件流场中的学习误差与所生成样本之间一个出乎意料普遍的关系**：每当学到的 CFM 作为条件变量的函数欠拟合真实速度场时，在对条件变量取期望的意义下，其生成样本的条件方差**严格大于**真实分布的条件方差。这与确定性回归形成鲜明对照——在后者中欠拟合只表现为预测均值的过平滑。
- 我们把该方差膨胀追溯到**单一机制：向量场学习中的平滑偏置**。任何沿条件变量平滑所学条件向量场的归纳偏置——无论是早停还是显式正则化——都产生相同效应。我们在合成回归问题、受控平滑估计器与高维离线 RL 基准上经验地证明了这一点。
- 我们提出一个**正则化平滑的理想化设定**，以理论研究方差膨胀现象：在正则化向量场学习的等价核（equivalent-kernel）近似下，学到的条件分布是查询点附近真实条件分布的**局部混合**。这给出干净的偏差—方差关系：平均而言，学到的条件方差至少为真实条件方差加上所学条件均值的平方偏置。该简化设定作为理解神经 CFM 中经验观察到的方差膨胀的有用解释模型；我们还讨论该近似对神经 CFM 的有效性以及失效区间。
- 受理论研究启发，我们识别出方差膨胀的另一个经验后果：**CFM 学到的分布在欠拟合区间近似校准**。我们给出利用方差膨胀做预测覆盖的**实用方法**：在三个应用领域（策略评估、细胞扰动预测、机器人行为克隆）中，直接由 CFM 样本构建的预测集在欠拟合区间近似校准，且与保形预测基线相比具有竞争力或更紧。

## 2 相关工作

**流匹配与条件输运。** 流匹配及相关的随机插值（stochastic interpolant）、修正流（rectified flow）方法，通过在基础噪声与数据之间的路径上回归时变向量场来学习连续时间输运（Lipman 等，2023；Liu 等，2022；Albergo 等，2025）。条件流匹配以副信息（side information）索引该输运，得到给定条件变量时输出的条件律模型。CFM 已被广泛应用于机器人（Chisari 等，2024；Rouxel 等，2024；Zhang 等，2024）与科学建模（Klein 等，2025；Miller 等，2024）。

**扩散/流模型的归纳偏置与泛化。** 若干近期工作研究扩散或基于分数的模型为何泛化而非简单记忆训练数据，并把该行为归因于多种偏置来源：去噪分数匹配目标的方差（Vastola，2025）、架构偏置（Kamb & Ganguli，2025）与所学分数的选择性欠拟合（Song 等，2025）。这些论文在精神上与我们最接近，但它们聚焦**无条件生成**；我们研究条件生成，并追问"对条件变量的欠拟合如何改变条件律"。

**隐式正则化、谱偏置与平滑。** 我们的解释基于学到的条件向量场中的平滑偏置。神经网络已知会在训练早期优先拟合低频或更平滑的结构，这一现象常称为**谱偏置**（Rahaman 等，2019；Xu 等，2020）。在宽网络区间，训练动力学可近似为核梯度流，从而把早停与有限时间训练联系到函数空间中的经典正则化（Jacot 等，2018）。相关思想贯穿非参数回归、平滑样条、核岭回归与逆问题——其中正则化估计器可用等价核或线性平滑算子描述。我们基于这一视角，但研究的是另一个对象：**不是点估计器的偏置，而是对平滑后的条件向量场积分后所得的分布**。

## 3 预备知识

我们研究条件生成建模。给定联合分布 $p^\star$ 的样本 $(X,C)\in\mathbb R^{d_x}\times\mathbb R^{d_c}$，其中 $X$ 为被生成变量、$C$ 为条件变量，条件生成模型学习从 $X$ 在 $C=c$ 下的条件分布 $p^\star(\cdot\mid c)$ 生成新样本。流模型把这种分布表示为**连续归一化流**（continuous normalizing flow，CNF）与 ODE——把简单初始分布输运到近似 $p^\star$ 的终分布。这里我们考虑其条件变体。

**定义 3.1（连续归一化流）。**（Chen 等，2018）给定 $(X,C)$ 上的联合分布 $p_1$、$(X,C)$ 上的初始分布 $p_0$，以及条件向量场 $v:[0,1]\times\mathbb R^{d_x}\times\mathbb R^{d_x}\to\mathbb R^{d_c}$，$(t,x,c)\mapsto v_t(x\mid c)$，称 $(v,p_0)$ 为 $p_1$ 的**条件连续归一化流**（conditional continuous normalization flow，CCNF），若对每个 $c\in\mathbb R^{d_c}$，由

$$
X_0\sim p_0(\cdot\mid C=c),\qquad\frac{\mathrm d}{\mathrm dt}X_t=v_t(X_t,c) \tag{3.1}
$$

定义的随机过程 $(X_t)_{t\in[0,1]}$ 满足 $X_1\sim p(\cdot\mid c)$。记 $\Phi^v_t(X_0\mid c)$ 为式 (3.1) 中把 $X_0$ 映到 $X_t$ 的确定性函数（称为**流映射**）。给定 $(p_0,v)$，记 $p^v_t(\cdot\mid c,p_0)$ 为在式 (3.1) 下 $X_t\mid c$ 在 $X_0\sim p_0(\cdot\mid c)$ 上的边缘分布。注意由定义，$(v,p_0)$ 是 $p^v_1(\cdot\mid\cdot,p_0)$ 的 CCNF；上下文清晰时省略对 $p_0$ 的依赖。

**流匹配**（Lipman 等，2023；Albergo & Vanden-Eijnden，2023；Liu 等，2022）提供了从数据学习 (C)CNF 的通用配方。给定 $p_0$ 与满足 $\alpha_0=\beta_1=1$、$\beta_0=\alpha_1=0$ 的可微系数 $\alpha_t,\beta_t:[0,1]\to\mathbb R$，诱导的（线性）**随机插值**为随机变量 $X_t=\alpha_tX_0+\beta_tX_1$，其中 $X_0\sim p_0(\cdot\mid c)$、$X_1\sim p^\star(\cdot\mid c)$。流匹配基于如下观察：

**命题 3.1**（Albergo 等，2025）。定义向量场 $v^\star$ 为 $v_t^\star(\cdot\mid c)=\mathbb E[\dot X_t\mid X_t,c]$，其中 $\dot X_t=\dot\alpha_tX_0+\dot\beta_tX_1$。则 $(v^\star,p_0)$ 是 $p^\star$ 的 CNF；此外 $v^\star\in\arg\min_v\mathcal L_{\mathrm{FM}}(v)$，其中流匹配损失为

$$
\mathcal L_{\mathrm{FM}}(v):=\mathbb E_{(X,C)\sim p^\star}\mathbb E_{t\sim\mathrm{Unif}([0,1]),\ X_0\sim p_0(\cdot\mid c)}\mathbb E\left[\left\|v_t(X_t,C)-\dot X_t\right\|^2\right]. \tag{3.2}
$$

受命题 3.1 启发，流匹配通过（近似）最小化 $\mathcal L_{\mathrm{FM}}$ 的经验近似来训练速度场 $v_\theta=(v_{\theta;t}(x,c))$。

## 4 欠拟合条件流中的方差膨胀

本节揭示欠拟合条件流模型的两个出乎意料的现象：第一，所生成样本的条件方差**大于**真实分布（在对条件变量取期望的意义下），即使在被视为几乎确定性的回归问题中；第二，该方差膨胀是所学向量场中**平滑偏置**的后果：任何沿条件变量平滑条件向量场的机制都产生相同效应。我们在合成一维问题（图 1）上演示该现象、确认其由平滑驱动（图 2），并验证它可迁移到离线 RL 中使用的高维基准（图 3）。

**图 2：** 向量场学习中的任何平滑偏置都会诱导方差膨胀。三种情形下，平均学到的条件方差（各面板标题中给出）随平滑减弱而单调下降：(a) NN 向量场参数化（训练步 50/250/500/15,000，$\mathbb E_C[\mathrm{Var}(X\mid c)]$ 从 1.155 降到 0.224）；(b) 带显式正则项 $\lambda(\partial_cv)^2$ 的 NN 向量场参数化（$\lambda=1.0/0.005/0.0005/0$，从 1.042 降到 0.217）；(c) 用核岭回归（惩罚 $\lambda$）学习向量场（ridge $=5/1/0.05/0.01$，从 0.857 降到 0.370）。

图 1 给出一个一维合成回归问题（引言中），其目标函数同时包含低频与高频结构。用早停训练的神经网络回归器时，欠拟合导致预测均值过平滑：学到的函数捕获粗趋势，却无法恢复更细的振荡。

对同一制度下训练的条件流模型，学到的条件均值同样过平滑；但与确定性回归器不同，流还学到**相当大的额外方差**，表现为均值周围很宽的 95% 带。即使在几乎确定性的问题中，条件向量场的欠拟合也不仅表现为所学均值的偏置，还表现为所生成条件分布中的额外方差。面板 (d) 给出完整的学到条件密度 $\hat p(x\mid c)$：在 $f^\star$（条件均值）于一个平滑邻域内高频振荡的区域，该密度宽而近似双峰；流的条件分布实际上在局部振荡上做了平均。该发现并非此例特有，附录 C 表明类似现象在一系列合成目标函数上都会出现。

**为什么称该不确定性为认知的？** 超额方差源于目标对条件变量的依赖**未被解出**：学到的模型把真实条件均值能分辨的相邻条件之间的差异平滑掉了。因此该不确定性是可约的、依赖模型的，而非数据生成过程中不可约的随机性。当模型解出更多此类结构（例如用更多数据或训练）时，平滑偏置与超额方差都会减小。然而在 CFM 中，这种未解出的变化表现为学到条件分布**内部的散布**，因而表现为表观的偶然方差。仅从学到的分布看，这种模型诱导的散布与真实偶然变化**不可区分**。

### 4.1 方差膨胀追踪平滑偏置

图 2 表明图 1 的现象并不依赖单一估计器或训练配方。我们比较三种在学习到的条件向量场中诱导平滑的机制：神经网络早停（偏置训练走向目标的低频成分，Yao 等，2007；Rahaman 等，2019；Tancik 等，2020）、在条件变量上施加**显式粗糙度惩罚** $\lambda(\partial_cv)^2$（经典非参数回归所用，Wahba，1990；Green & Silverman，1994）、以及带 RKHS 范数正则罚 $\lambda$ 的核岭回归（Caponnetto & De Vito，2007）。这些方法都会诱导条件均值函数的平滑，从不同正则强度下画出的学到均值可观察到（图 2）。三种情形中，该平滑都伴随另一一致效应：**学到的条件方差随学到均值变平滑而增大**；平均学到的条件方差随平滑减弱单调下降。

我们的关键发现（并由附录 C 的更多函数印证）是：关键对象是**向量场学习中的平滑偏置**，而非流匹配本身。流匹配只是提供了一个把该平滑偏置表达为条件散布的机制。另注意图 2 中诱导方差往往恰在学到均值偏置最大时最大。

**图 3：** 策略评估：学到的（紫色）与真实（绿色）条件分布，投影到状态—动作条件的前两个主成分上；(a) Cube-Single；(b) Antmaze——早期步（200 步）学到的条件分布明显比经验目标更弥散但仍"覆盖"目标样本；较晚检查点（5,000/2,000 步）样本收缩并与目标散点更接近。

### 4.2 超越一维合成回归：蒙特卡洛策略评估

我们接着检验当条件变量为高维时方差膨胀现象是否仍然存在。为此使用**策略评估**任务：训练 CFM 以状态—动作对 $c=(s,a)$ 为条件、用蒙特卡洛目标预测 Q 值。我们在两个 OGBench（Park 等，2025）环境 Cube-Single 与 Antmaze-large 上评估，其中条件变量是高维的而目标仍是标量。

图 3 把学到分布与经验分布投影到条件变量的前两个主成分上。训练早期，学到的条件分布明显比经验目标更弥散，但仍"覆盖"目标分布样本；较晚检查点处，学到的样本收缩并更贴合目标散点。这与合成实验一致：条件向量场的欠拟合导致超额散布，而它随训练推进而减小。

## 5 方差膨胀的理想化模型

由于有限数据、网络容量约束与优化选择（如早停），$v_\theta$ 是 $v^\star$ 的不完美近似。由于对神经函数近似器难以刻画该近似的精确形式，我们研究如下理想化的**总体层面正则化流匹配问题**：

$$
v_\lambda\in\arg\min_{v\in\mathcal V}\left\{\mathbb E\left[\left\|v_T(C,X_T)-\dot X_T\right\|^2\right]+\lambda\mathbb E\left[\left\|(L_cv_T)(C,X_T)\right\|^2\right]\right\}. \tag{5.1}
$$

其中算子 $L_c$ 是**在条件变量上**诱导平滑的线性算子：对每个固定的 $(t,x)$，$L_c$ 作用于函数 $c\mapsto v_t(c,x)$ 而把 $t,x$ 视为固定。这恰对应所关心的区间：学到的向量场可以灵活依赖流状态 $x$ 与时间 $t$，但其对条件变量 $c$ 的依赖被平滑。具体例子包括一阶导数惩罚 $L_c=\nabla_c$、高阶光滑惩罚 $L_c=\nabla_c^k$、以及对 $c\mapsto v_t(c,x)$ 的 RKHS 型惩罚（Wahba，1990）。众所周知，此类正则化回归问题具有等价核表示（Schölkopf 等，2001）。该目标作为神经网络平滑偏置的理想化模型；相关正则化模型也已在条件扩散模型中被研究（Pfrommer 等，2025）。附录 A 给出更多动机，附录 A.4 在合成任务上对神经 CFM 数值评估我们的等价核近似（式 (5.3) 与 (5.4)）。

由于 $L_c$ 只在条件变量 $c$ 上诱导平滑、把 $t,x$ 视为固定，对任意固定 $(t,x)$，在相差一个与 $g$ 无关的乘性常数意义下，关于切片 $g(c):=v_t(c,x)$ 的正则化最小二乘问题为

$$
\hat g_{t,x}\in\arg\min_g\left\{\int_{\mathcal C}\left(\left\|g(c)-v^\star_t(c,x)\right\|^2+\lambda\left\|(L_cg)(c)\right\|^2\right)p^\star_t(x\mid c)P_C(\mathrm dc)\right\}. \tag{5.2}
$$

对 Tikhonov 型惩罚，其解是回归目标的线性平滑器，具有某个依赖 $(t,x)$ 的等价核 $K_{\lambda,t,x}$（Silverman，1984）：

$$
v_{\lambda,t}(c,x)=\hat g_{t,x}(c)=\int K_{\lambda,t,x}\left(c,c'\right)v^\star_t\left(c',x\right)p^\star_t\left(x\mid c'\right)P_C\left(\mathrm dc'\right). \tag{5.3}
$$

对这里考虑的保常平滑器，等价核归一化为 $\int K_{\lambda,t,x}(c,c')p^\star_t(x\mid c')P_C(\mathrm dc')=1$。因子 $p^\star_t(x\mid c')$ 是切片问题的设计密度，而非单独的建模选择。我们分析的起点是关于核 $K_{\lambda,t,x}$ 的结构性假设。

**假设 5.1（核的因子化）。** 精确核 $K_{\lambda,t,x}$ 通过设计密度 $\rho_{t,x}(c):=p^\star_t(x\mid c)p_C(c)$ 依赖 $(t,x)$。我们采用标准的等价核近似，即假设核的空间形状对 $(t,x)$ 的依赖较弱：

$$
K_{\lambda,t,x}\left(c,c'\right)=a_{t,x}(c)K'_\lambda\left(c,c'\right), \tag{5.4}
$$

其中 $a_{t,x}(c)$ 为归一化因子，$K'_\lambda$ 只依赖 $\lambda$ 而不依赖 $(t,x)$。附录 A 为该假设提供动机并详细讨论其有效区间（小 $t$、大路径方差、或条件均值局部缓变）。在假设 5.1 与温和矩/正则性条件（附录 A 的假设 A.1、A.2、A.3）下，$v_\lambda$ 生成的条件分布满足如下偏差—方差关系。

**定理 1（超额方差与协方差）。** 设假设 5.1 与假设 A.1、A.2、A.3 成立。令 $\hat X_1$ 为在条件 $C$ 下积分 $v_\lambda$ 所得的端点样本，$X_1$ 为真实目标。则

$$
\mathbb E_C\left[\mathrm{Cov}\left(\hat X_1\mid C\right)\right]\succeq\mathbb E_C\left[\mathrm{Cov}\left(X_1\mid C\right)\right]+\mathbb E_C\left[\left(\mathbb E\left[\hat X_1\mid C\right]-\mathbb E\left[X_1\mid C\right]\right)^{\otimes2}\right]. \tag{5.5}
$$

证明思路：先说明假设 5.1 把正则化流匹配解归约为真实速度场的**密度加权局部平均**，进而表明所学速度场生成的端点分布是真实条件分布的**局部混合**；对该混合取矩并用平滑核的标准假设（A.2、A.3）即得定理 1。完整证明见附录 A。

上述比较是 Loewner 序意义下的。等价地，在每个方向 $u$ 上，$u^\top\hat X_1$ 的平均学到条件方差至少为相应真实条件方差加上所学条件均值的平均平方方向偏置。标量情形下，定理 1 说明：在条件变量上取平均，学到的条件方差至少为真实条件方差加上所学条件均值的平方偏置。因此，拟合条件均值时 incurred 的任何平滑偏置都会反映为所生成样本中的额外散布。图 5 对在多个一维合成分布上用不同平滑估计器训练的向量场，画出平方偏置与超额方差，反映式 (5.5) 所预测的关系。

## 6 条件流模型的覆盖性质

我们现在评估条件流模型诱导的方差是否在真实任务上产生有意义的预测覆盖。图 1 面板 (d) 的热图提示：欠拟合 CFM 的超额方差**有结构**——它把更多质量分配给真实分布下密度更高的区域。受此启发，我们检验方差膨胀现象的一个实用后果：即使在条件均值可能有偏的区间，学到的条件分布是否给真实结果分配了适当质量。我们考虑三个应用领域：蒙特卡洛策略评估、细胞扰动预测与行为克隆，聚焦**欠拟合区间**——即神经网络平滑偏置成立的区间。

**图 5：** 超额方差追踪平方偏置。颜色标识合成目标分布的均值函数 $f^\star$，标记形状标识向量场估计器；对神经网络在不同训练检查点作图，对粗糙度惩罚网络与核岭回归改变正则强度；连线连接同一"目标—估计器"对的结果；平方偏置与超额条件方差均对 $C$ 取平均。对应条件分布见图 2（蓝）与图 16–18（绿、红、紫）。

**覆盖与区间定义。** 对 CFM $\hat p_\theta(x\mid c)$ 与名义水平 $\alpha\in(0,1)$，令 $\mathcal C_{\theta,\alpha}(c)$ 表示包含约 $\alpha$ 概率质量的预测集。我们在 $\mathcal D=\{(x_i,c_i)\}_{i=1}^{|\mathcal D|}$ 上度量经验覆盖 $\widehat{\mathrm{Cov}}_\alpha(\mathcal D)=\frac{1}{|\mathcal D|}\sum_{i=1}^{|\mathcal D|}\mathbf 1\{x_i\in\mathcal C_{\theta,\alpha}(c_i)\}$，并报告 $\alpha\in\{0.75,0.90,0.95\}$ 处的覆盖。对标量输出（策略评估），我们把 $\mathcal C_{\theta,\alpha}(c)$ 构造为学到条件分布的中心 $\alpha$-质量区间；对高维输出（细胞扰动、行为克隆），使用基于样本的 KNN 预测集（Wang 等，2022）。完整构造见附录 B。

通过这些实验研究的问题是：**如上由 CFM 构造的预测集是否提供有意义的覆盖？** 我们在以下任务上实验：

**i) 蒙特卡洛策略评估。** 使用三个 OGBench 环境（Park 等，2025）。CFM 建模以状态—动作对 $c=(s,a)$ 为条件的标量蒙特卡洛回报 $x$ 的分布。图 6 给出 Antmaze-large 的结果；Cube-Single 与 Humanoidmaze-medium 见附录 B.4。

**ii) 单细胞扰动预测。** 在 scPerturb（Peidli 等，2024）的 Norman、PBMC cytokines 与 SciPlex3 数据上评估，使用 CellFlow 架构（Klein 等，2025）。CFM 建模扰动细胞状态 $x$ 的分布，以对照细胞为源分布、以预训练扰动嵌入为条件 $c$。图 7 给出 Norman 结果；PBMC 与 SciPlex3 见附录 B.4。

**iii) 行为克隆。** 在 PushT（Chi 等，2023）上评估流匹配策略。CFM 建模以机器人观测历史 $c$ 为条件的短动作块 $x$ 的分布。图 6–8 与图 12–15 给出结果：我们画出 CFM 训练/验证损失、经验覆盖、预测集大小与效用指标。损失曲线用于识别训练模型何时开始过拟合；具体地，它们指示我们预期覆盖仍可靠的训练区间——从训练开始直到训练与验证损失曲线分离（或验证改善饱和），该区间在图中以阴影标出。实践中模型一般不会被训练到远入过拟合区间；早停、正则化与大数据训练会被用来防止这一点。此处我们故意训练更久，以展示覆盖在欠拟合区间保持可靠、此后发生变化。对标量输出任务，我们还画出逐点预测方差与平方预测误差的关系。集大小对标量输出报告为区间宽度、对高维输出报告为 KNN 半径，同时跟踪验证对数似然（或行为克隆的任务成功率），以确保高覆盖并非来自退化的预测分布。

**基线。** 我们与六个基线比较。对标量输出：**det + SC** 把分裂保形预测应用于与 CFM 共享条件骨干的确定性回归器；**det + CQR** 用保形分位数回归获得局部自适应区间；**Conf CFM** 对原始 CFM 预测集做保形化；**CFM mean + SC** 对 CFM 条件均值做分裂保形预测。此外，对标量输出与 Deep Evidential Regression（DER）（Amini 等，2020）比较，对高维输出使用对角高斯模型的 Heteroscedastic Gaussian Regression（HGR）；DER 与 HGR 报告完全训练模型的结果。完整实验细节见附录 B。要点如下：

**图 6：** 策略评估：Antmaze-Large。面板 (a) 损失与验证对数似然；(b)–(d) 75%/90%/95% 覆盖；(e) 平方误差 vs 方差；(f)–(h) 75%/90%/95% 区间宽度；(右轴) CFM 验证对数似然；阴影为欠拟合区间，虚线为名义水平。

**图 7：** 细胞扰动数据集：Norman。面板 (a) 损失；(b)–(d) 75%/90%/95% 覆盖；(e) 验证对数似然；(f)–(h) 75%/90%/95% KNN 半径。

**图 8：** 行为克隆。面板 (a) 损失；(b)–(d) 75%/90%/95% 覆盖；(e) 环境成功率；(f)–(h) 75%/90%/95% KNN 半径。

1. **欠拟合区间的覆盖近似校准。** 两个要点：i) 在 CFM 训练与验证损失曲线分离之前（欠拟合区间），CFM 在验证数据上的覆盖保持约 $\ge$ 名义水平（$\widehat{\mathrm{Cov}}_\alpha(\mathcal D)\gtrsim\alpha$），此后下降；ii) 有趣的是，CFM 在**训练数据**上的覆盖在整个训练过程中保持 $\ge$ 名义水平——因为训练数据对模型始终"分布内"；一旦模型开始过拟合，训练数据相对模型学到的分布仍分布内，而验证数据不再如此。
2. **方差追踪逐点预测误差。** 流方差更大的样本，其流均值的平方预测误差也往往更大；在三个一维输出环境上斯皮尔曼相关均为正（图 6、12、13 的面板 (e)）。方差恰在模型均值较不准确处更大，与"欠拟合表现为条件样本方差"的解释一致。
3. **基于 CFM 的覆盖集很紧。** 在所关心区间（过拟合出现之前）内：i) CFM 覆盖宽度 / KNN 半径比分裂保形更紧——因为分裂保形非局部自适应，这也说明 CFM 覆盖集是局部自适应的；ii) CFM 覆盖集大小与 CQR 及其他接近名义覆盖的基线有竞争力；iii) CFM 与保形化 CFM 的集大小非常接近，说明额外保形化对集的改变很小。

## 7 结论与局限

我们识别出条件流模型一个出乎意料的归纳偏置：向量场学习中的平滑偏置使对条件变量未解出的依赖表现为超额预测方差，从而把认知不确定性转化为表观偶然方差。我们在合成与真实任务中观察到该现象，并给出一个理想化模型加以研究。我们经验地发现该超额方差具有近似覆盖性质；在训练中过拟合之前的**任一点**，直接由 CFM 样本构建的预测集都能在无需显式校准训练的情况下达到近似名义覆盖。

**局限。** 我们的理论分析的是理想化的总体层面正则化平滑模型，并未对任意神经网络训练建立方差膨胀结果；尽管理论结果刻画了方差膨胀现象，它并不蕴含形式化的预测覆盖保证。本文研究的覆盖性质是经验性的，发展更强的理论覆盖保证留待未来工作。

## 参考文献（英文原条目，按原文顺序）

以下按原文顺序照录英文原书目（正文以上标“作者，年份”引用），条目文字不翻译，按原文顺序编号如下；未逐条核对 DOI。

[1] Agrawalla, Nauman, Agrawal & Kumar, FloQ: Training critics via flow-matching for scaling compute in value-based RL (arXiv:2509.06863, 2025)

[2] Aithal, Maini, Lipton & Kolter, Understanding hallucinations in diffusion models through mode interpolation (NeurIPS 37:134614–134644, 2024)

[3] Albergo & Vanden-Eijnden, Building normalizing flows with stochastic interpolants (ICLR 2023)

[4] Albergo, Boffi & Vanden-Eijnden, Stochastic interpolants: A unifying framework for flows and diffusions (arXiv:2303.08797, 2025)

[5] Amini, Schwarting, Soleimany & Rus, Deep evidential regression (NeurIPS 33:14927–14937, 2020)

[6] Caponnetto & De Vito, Optimal rates for the regularized least-squares algorithm (Foundations of Computational Mathematics 7(3):331–368, 2007)

[7] Chen, Rubanova, Bettencourt & Duvenaud, Neural ordinary differential equations (NeurIPS 31, 2018)

[8] Chi, Feng, Du, Xu, Cousineau, Burchfiel & Song, Diffusion policy: Visuomotor policy learning via action diffusion (arXiv:2303.04137, 2023)

[9] Chisari, Heppert, Argus, Welschehold, Brox & Valada, Learning robotic manipulation policies from point clouds with conditional flow matching (arXiv:2409.07343, 2024)

[10] Cucker & Smale, On the mathematical foundations of learning (Bulletin of the AMS 39(1):1–49, 2002)

[11] Daniely, SGD learns the conjugate kernel class of the network (arXiv:1702.08503, 2017)

[12] Engl, Hanke & Neubauer, Regularization of Inverse Problems (Kluwer, 1996)

[13] Green & Silverman, Nonparametric Regression and Generalized Linear Models: A Roughness Penalty Approach (Chapman and Hall, 1994)

[14] Heumos, Ji, May 等, Pertpy: an end-to-end framework for perturbation analysis (bioRxiv, 2024)

[15] Jacot, Gabriel & Hongler, Neural tangent kernel: Convergence and generalization in neural networks (NeurIPS 31, 2018)

[16] Kamb & Ganguli, An analytic theory of creativity in convolutional diffusion models (ICML 2025)

[17] Klein 等, CellFlow enables generative single-cell phenotype modeling with flow matching (bioRxiv, 2025)

[18] Kress, Linear Integral Equations (Springer, 3rd ed., 2014)

[19] Lee, Xiao, Schoenholz, Bahri, Novak, Sohl-Dickstein & Pennington, Wide neural networks of any depth evolve as linear models under gradient descent (NeurIPS 32, 2019)

[20] Lin 等, Evolutionary-scale prediction of atomic-level protein structure (Science 379(6637):1123–1130, 2023)

[21] Lipman, Chen, Ben-Hamu, Nickel & Le, Flow matching for generative modeling (arXiv:2210.02747, 2023)

[22] Liu, Gong & Liu, Flow straight and fast: Learning to generate and transfer data with rectified flow (arXiv:2209.03003, 2022)

[23] Miller, Chen, Sriram & Wood, FlowMM: Generating materials with Riemannian flow matching (ICML 2024)

[24] Norman, Horlbeck, Replogle 等, Exploring genetic interaction manifolds constructed from rich single-cell phenotypes (Science 365(6455):786–793, 2019)

[25] Park, Frans, Eysenbach & Levine, OGBench: Benchmarking offline goal-conditioned RL (arXiv:2410.20092, 2025)

[26] Parse Biosciences, 10 Million Human PBMCs in a Single Experiment (2024)

[27] Peidli 等, scPerturb: harmonized single-cell perturbation data (Nature Methods 21:531–540, 2024)

[28] Pfrommer, Dou, Scarvelis, Simchowitz & Jadbabaie, Is your conditional diffusion model actually denoising? (arXiv:2512.18736, 2025)

[29] Piran, Cohen, Hoshen & Nitzan, Disentanglement of single-cell data with biolord (Nature Biotechnology 42:1678–1683, 2024)

[30] Rahaman, Baratin, Arpit, Draxler, Lin, Hamprecht, Bengio & Courville, On the spectral bias of neural networks (ICML 2019, 5301–5310)

[31] Rouxel, Ferrari, Ivaldi & Mouret, Flow matching imitation learning for multi-support manipulation (arXiv:2407.12381, 2024)

[32] Scarvelis, Sáez de Ocáriz Borde & Solomon, Closed-form diffusion models (arXiv:2310.12395, 2023)

[33] Schölkopf, Herbrich & Smola, A generalized representer theorem (Computational Learning Theory, Springer, 416–426, 2001)

[34] Silverman, Spline smoothing: The equivalent variable kernel method (The Annals of Statistics 12(3):898–916, 1984)

[35] Song, Kim, Chen, Du, Kakade & Sitzmann, Selective underfitting in diffusion models (arXiv:2510.01378, 2025)

[36] Srivatsan 等, Massively multiplex chemical transcriptomics at single-cell resolution (Science 367(6473):45–51, 2020)

[37] Tancik, Srinivasan, Mildenhall, Fridovich-Keil, Raghavan, Singhal, Ramamoorthi, Barron & Ng, Fourier features let networks learn high frequency functions in low dimensional domains (NeurIPS 33:7537–7547, 2020)

[38] Vastola, Generalization through variance: How noise shapes inductive biases in diffusion models (ICLR 2025)

[39] Wahba, Spline Models for Observational Data (SIAM, 1990)

[40] Wang, Gao, Yin, Zhou & Blei, Probabilistic conformal prediction using conditional random samples (arXiv:2206.06584, 2022)

[41] Xu, Zhang, Luo, Xiao & Ma, Frequency principle: Fourier analysis sheds light on deep neural networks (Communications in Computational Physics 28(5):1746–1767, 2020)

[42] Yao, Rosasco & Caponnetto, On early stopping in gradient descent learning (Constructive Approximation 26(2):289–315, 2007)

[43] Yoon, Choi, Kwon & Ryu, Diffusion probabilistic models generalize when they fail to memorize (ICML 2023 Workshop, 2023)

[44] Zhang, Liu, Fan, Liu, Zeng & Liu, FlowPolicy: Enabling fast and robust 3D flow-based policy via consistency flow matching for robot manipulation (arXiv:2412.04987, 2024)。


## 附录

### A 方差膨胀的理论模型

本附录给出理论模型与证明。核心思想：把正则化流匹配（式 (A.1)）

$$
v_\lambda\in\arg\min_{v\in\mathcal V}\left\{\mathbb E\left[\left\|v_T(C,X_T)-\dot X_T\right\|^2\right]+\lambda\mathbb E\left[\left\|(L_cv_T)(C,X_T)\right\|^2\right]\right\} \tag{A.1}
$$

作为所学条件流归纳偏置的代理；其中 $\mathcal V$ 为选定的向量场类、$\lambda\ge0$ 控制正则强度、$L_c$ 是只作用于条件变量的线性算子（对每个固定 $(t,x)$，作用于 $c\mapsto v_t(c,x)$）。

**A.1 假设：正则化流匹配的等价核模型与正则性条件。** 正则化目标 (A.1) 惩罚 $c\mapsto v_t(c,x)$ 的变化；对每个固定 $(t,x)$，这是以 $C\mid X_t=x$ 的条件律（正比于 $p^\star_t(x\mid c')P_C(\mathrm dc')$）为总体设计分布的监督回归问题。经典等价核计算表明 $c$ 处的拟合值是回归目标的局部平均（Silverman，1984），即式 (5.3)；随后把该表示化为分析所用形式（式 (5.4)）。假设 A.1–A.3 分别涉及 $L_2$ 回归良定义与二阶矩有限（对 $\xi$ 不作超出前两阶条件矩的参数假设）、核的矩条件与正则性。

**A.2 形式化主结果。** **命题 A.2（正则化诱导局部混合）：** 在假设 A.1、A.2 与 5.1 下，正则化流匹配解是真实速度场的密度加权局部平均，故所学速度场生成的端点分布是真实条件分布的局部混合。**命题 A.3（平均超额方差支配平方偏置）：** 设 $d_x=1$，在相应假设下平均超额方差至少为所学条件均值的平方偏置（标量情形即定理 1 的一维版本）。**命题 A.4（向量值超额协方差）：** 设 $X_1\in\mathbb R^{d_x}$，给出向量值版本的 Loewner 序结论。**备注 A.1：** 由引理 A.1 得到的所学向量场表示 (A.4) 强于…（原文给出比逐点近似更强的性质说明）。

**A.3 延迟证明。** 给出命题 A.2（对每个固定 $c'$，精确条件路径满足多元…）、命题 A.3（标量情形，比较同一平滑算子的两种效应）与命题 A.4（向量情形，把标量论证逐分量应用）的证明。

**A.4 等变核假设（假设 5.1）的有效性。** 附录 A 的引理 A.1 给出密度加权等价核：对每个正则化水平 $\lambda$ 存在…（把式 (5.4) 代入切片解并吸收归一化）；图 9–11 数值评估核近似误差、所学速度场的密度加权平滑可视化，以及核近似对端点分布的影响。

### B 实验细节

**B.1 覆盖集创建。** 给出标量输出（中心 $\alpha$-质量区间）与高维输出（基于样本的 KNN 预测集）的具体构造，以及覆盖集大小的计算方式。

**B.2 基线。** 给出 det + SC、det + CQR、Conf CFM、CFM mean + SC、DER 与 HGR 的完整配置与实现细节。

**B.3 数据集与训练设置。** **B.3.1 生物学数据集：** Norman（scPerturb 处理，187 个药物/基因扰动条件、约 136k 扰动细胞与约 3k DMSO 对照，80-20 划分；条件为 1024 维扰动嵌入，目标为 100 维 PCA 投影；$x_0$ 由在对照细胞池上加标准差 10.0 的高斯噪声构造；速度场架构与 Norman 实验相同，SiLU 激活，Adam 学习率 $10^{-3}$、批大小 1024、1,000 轮；评估采样 1000 步 Euler）。PBMC cytokines 与 SciPlex3（A549 细胞系，约 188 种小分子药物各四剂量、含 DMSO 对照；条件为 1025 维 Morgan-1024 指纹 + $\log_{10}$(剂量 nM)，目标为 100 维 PCA 投影）同法处理。**B.3.2 策略评估：** 在 OGBench 上构造三个策略评估数据集，取 Agrawalla 等（2025）训练的 FloQ 智能体策略 $\pi$，对每个 $(s,a)$ 对 $n_{\mathrm{MC}}$ 条独立 on-policy rollout 的折扣回报取平均得到随机目标 $\hat Q(s,a)$；条件 $c=[s,a]$、目标 $x=\hat Q(s,a)$。逐环境细节见表 1；三个 FloQ 运行均使用 1 维目标空间上的各向同性高斯先验 $x_0\sim\mathcal N(0,1)$；架构与训练：MLP 速度场（隐藏宽度 $[512,512,512,512]$、ReLU），输入 $[c,x_t,\mathrm{TimeEmb}(t)]$（32 维余弦几何时间嵌入），标量速度输出，Adam（学习率 $3\times10^{-4}$、无权重衰减）、批大小 1024。**B.3.3 行为克隆：** 在 PushT 的状态版上训练流匹配行为克隆策略（二维末端执行器把 T 形块推向固定目标位姿）；观测为 5 维状态 $[\mathrm{agent}_x,\mathrm{agent}_y,\mathrm{block}_x,\mathrm{block}_y,\mathrm{block}_\theta]$，动作为二维目标末端位置；按标准滚动时域 BC 设置，每个样本由 2 步观测历史预测 8 步动作块；观测与动作在训练集上 MinMax 归一化；80–20 训练/验证划分；条件 $c\in\mathbb R^{10}$ 为展平的观测历史，目标 $x\in\mathbb R^{16}$ 为展平的动作块，使用 128 维正弦时间嵌入；$x_0$ 为标准高斯。

**表 1　策略评估数据集的环境细节**（$n_{\mathrm{MC}}$ 为平均进 $\hat Q(s,a)$ 的独立 on-policy rollout 数，$H$ 为固定 rollout 时域，$\gamma$ 为折扣因子）

| 数据集 | $n_{\mathrm{MC}}$ | $H$ | $\gamma$ | $\dim s$ | $\dim a$ | $\dim c$ | $\lvert\mathcal D\rvert$ |
|---|---|---|---|---|---|---|---|
| Cube-single | 20 | 200 | 0.99 | 28 | 5 | 33 | 200,000 |
| AntMaze-large | 20 | 1000 | 0.998 | 29 | 8 | 37 | 200,000 |
| Humanoid-Maze-medium | 20 | 2000 | 0.999 | 69 | 21 | 90 | 200,000 |

**B.4 附加实验。** 给出 Cube-Single、Humanoidmaze-medium（图 12、13）与 PBMC、SciPlex3（图 14、15）的覆盖结果，布局与图 6、7 相同。

### C 更多合成目标函数

附录 C 在若干合成目标函数上重复图 1–2 与图 5 的实验，表明类似的方差膨胀现象在不限于一例的合成目标（如高频振荡、尖峰、阶跃与 $1/c$ 型函数）上普遍出现；图 16–18 给出对应的条件分布与偏差—超额方差关系。

## 图注与表注

**图 1：** 欠拟合期间流模型与回归的对比（见第 1 节）。

**图 2：** 任何平滑偏置都诱导方差膨胀；三种平滑机制（早停、显式粗糙度惩罚、核岭回归）下平均学到条件方差随平滑减弱单调下降（见第 4 节）。

**图 3：** 策略评估：学到的（紫色）与真实（绿色）条件分布投影到条件变量前两个主成分上；(a) Cube-Single；(b) Antmaze（见 4.2 节）。

**图 4：** 速度场欠拟合导致条件分布的**局部混合**，而不只是均值的平滑。四个步骤示意：(1) 目标 vs 分辨率（在噪声 $t=0$ 处，目标移动快于模型能分辨的速度）；(2) 速度场的密度加权平滑；(3) 邻近上下文的**目标池化**；(4) 由此产生的散布。图中同时画出真实（绿）与平滑后（红）的场。

**图 5：** 超额方差追踪平方偏置（见第 5 节末与第 6 节）。

**图 6：** 策略评估：Antmaze-Large（损失/覆盖/宽度/误差 vs 方差等 8 个面板）。

**图 7：** 细胞扰动数据集：Norman（损失/覆盖/验证对数似然/KNN 半径等 8 个面板）。

**图 8：** 行为克隆（损失/覆盖/成功率/KNN 半径等 8 个面板）。

**图 9–11：** 核近似误差与速度场可视化；学到速度场中密度加权平滑的图示与核近似；核近似对端点分布的影响（附录 A.4）。

**图 12–15：** Cube-Single、Humanoidmaze-medium、PBMC、SciPlex3 的覆盖结果（布局同图 6、7；附录 B.4）。

**图 16–18：** 更多合成目标函数（高频振荡、尖峰、阶跃与 $1/c$ 型等）下的条件分布与偏差—超额方差关系（附录 C）。

**表 1：** 策略评估数据集环境细节（见附录 B.3.2；已在正文表中逐格转录）。

> **原文说明（疑点加注）：** ① 摘要与第 1 节多次使用"epistemic/aleatoric uncertainty"术语，但论文未给出二者的形式化信息论定义，仅以"可约 vs 不可约"作操作性区分——读者需注意该用法与传统定义（如基于互信息的分解）不完全等同。② 定理 1 的证明依赖等价核近似（假设 5.1）与假设 A.1–A.3；定理陈述本身未显式列出这些假设的完整条件，仅以引用方式给出，属原文的表述习惯。③ 第 6 节称"在训练中过拟合之前的任一点"CFM 预测集近似校准，这是经验观察而非理论保证（论文的局限性一节也明确承认）。④ 图 4 的四个步骤标题中"(1) Target vs. resolution"与"(3) Pooling of targets"在原文图中以短标签形式出现，本页按图内文字译出。以上均按原文保留并标注。

**本页范围与校对状态：** 本页为 arXiv:2610.29172v1 的全文中文译稿：摘要、正文第 1–7 节（含 4.1–4.2、第 5、6 节全部内容）、结论与局限、附录 A–C、图 1–18 图注、表 1 逐格、参考文献 44 条（作者—年份制，按原文顺序汇总）。公式编号沿用原文：(3.1)、(3.2)、(5.1)–(5.5)、(A.1) 全部译入；附录中的其他编号式（如 (A.4) 等）在正文中以引用形式出现、未逐式转录。**表 1 已用 PDF 第 26 页渲染图逐行逐格核对**（三个环境 × $n_{\mathrm{MC}}$、$H$、$\gamma$、$\dim s$、$\dim a$、$\dim c$、$|\mathcal D|$）。附录 A 的证明按原文结构译出关键步骤与三个命题（A.2–A.4）的结论，纯代数推导细节作忠实概述；附录 B.3 的训练细节与附录 C 的合成函数实验按原文要点译述（原文图 16–18 的具体曲线未数字化）；附录 B.1、B.2、B.4 以节内要点概括呈现。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文存在 4 处术语/表述可商榷处，已在"原文说明（疑点加注）"中如实标出。作者 4 人已补全；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
