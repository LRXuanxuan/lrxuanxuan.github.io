---
layout: page
title: "无线电地图估计问题的理论分析｜中文全文译文"
permalink: /papers/translations/2026-10-04-2310-15106-theoretical-analysis-of-the-radio-map-estimation-problem/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/dca1fee097b5038f/) · [原文 arXiv](https://arxiv.org/abs/2310.15106) · [全部目录](/papers/catalog/)

# 无线电地图估计问题的理论分析

**原题：** Theoretical Analysis of the Radio Map Estimation Problem  
**作者：** Daniel Romero、Tien Ngoc Ha、Raju Shrestha（挪威阿格德尔大学信息与通信技术系，Grimstad）；Massimo Franceschetti（美国加州大学圣地亚哥分校）  
**版本：** arXiv:2310.15106v4（cs.IT），v4 于 2024 年 3 月 23 日发布，原文 17 页；本工作部分由挪威研究理事会 IKTPLUSS 计划（资助号 311994）资助。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、参考文献（英文原条目）、附录 A–H、图注与表注按原文结构录入；逐句逐式终校未做。

## 摘要

无线电地图在地理区域的每个位置给出射频（RF）度量，例如接收信号强度。这类地图由在多处采集的测量集合估计得到，在无线通信中应用广泛，包括覆盖空洞预测、网络规划、资源分配以及移动机器人路径规划。尽管已经提出了大量估计器，但**无线电地图估计（RME）问题的理论认识尚未建立**。本文从两个方向填补这一空白。第一，通过对无线电地图函数空间变异性给出上下界来量化其复杂度；这为所需的测量空间分布以及可采用的估计器提供了有价值的洞见。第二，对自由空间中功率地图的重建误差给出上界，覆盖三种常规空间插值器；并提出**接近系数**（proximity coefficient）——它是发射机到被映射区域距离的递减函数——来量化 RME 问题的复杂度。数值实验评估了所得界的紧致性以及主要结论在复杂环境中的有效性。

**关键词：** 无线电地图估计；无线电环境地图；频谱制图；无线通信。

## I. 引言

无线电地图（又称无线电环境地图）给出某一地理区域内感兴趣的射频（RF）度量 [1]。例如，在作为无线电地图重要一类的**功率地图**中，感兴趣的度量是传感器置于每个位置时会测得的功率。图 1 给出一个由真实数据构造的功率地图示例。其他 RF 度量还包括接收功率谱密度（PSD）、中断概率与信道增益。

无线电地图在大量应用中都有价值，例如蜂窝通信、设备到设备通信、网络规划、频率规划、机器人路径规划、动态频谱接入、无人航空系统中的空中交通管理、指纹定位等；参见 [1]—[5] 及其参考文献。功率地图一个近期流行的应用，是确定如何通过部署新的地面或空中基站、中继来改善蜂窝或广播网络的覆盖 [6]—[8]。

在无线电地图估计（RME）中，无线电地图由在感兴趣区域内采集的测量构造。文献已提出许多估计器，大多基于某种形式的插值或回归。功率地图是迄今最受关注的无线电地图。最简单的一类估计器基于核学习（参见 [9] 及其参考文献），它克服了（更简单的）参数化估计器的局限 [1, 节 "Linear Parametric RME"]。其他常用估计器基于 Kriging [10]—[12]、基于稀疏性的推断 [13]—[15]、矩阵补全 [16]、[17]、字典学习 [18] 以及图模型 [19]。最新趋势则利用深度神经网络；参见 [20]—[23]。由于篇幅限制，上述文献列表并不完整；更全面的参考文献列表见 [1]。

尽管该领域研究量很大，但绝大多数工作遵循同一模式：提出一个估计器，并用统计传播模型生成的合成数据或射线追踪软件数据进行验证；仅有少数工作还使用了真实数据 [24]—[28]。然而，**尚未有工作对 RME 问题的基本方面以及估计算法的性能开展理论分析**。确实，该背景下最相关的工作可分两类。一方面，若感兴趣场遵循某一模型 [12]、[20]，则可推导某些方案的估计误差；但这些模型是一般性的，未必准确刻画无线电地图。另一方面，**信息波动理论**（wave theory of information，WTI）研究了利用同步传感器阵列在空间与时间上重建电磁场的问题 [29]；然而该问题与 RME 有本质不同：RME 中传感器通常不同步、感兴趣的度量涉及电磁场的时间平均、且目标空间分辨率低得多。

本文迈出一步：通过对 RME 问题作定量理论分析来填补该空白。具体地，先通过分析功率地图的空间变异性来评估 RME 问题的难度。本节的一个重要发现是：自由空间中功率地图的空间变化相对缓慢，其大部分能量集中在低空间频率，这为基于该性质的估计器提供了动机。

其次，本文以 $L_1$、$L_2$ 与 $L_\infty$ 误差度量给出零阶、一阶与 sinc 插值器估计性能的量化界。其中许多界最终正比于一个称为**接近系数**的量：它正比于发射功率，反比于发射机到被映射区域距离的立方。由此，分析揭示：当源更接近被映射区域时，需要更大的测量空间密度。sinc 插值器的误差分析给出比零阶、一阶插值器更快衰减的界，但在样本数有限的实践中，后两者被认为更可取。

最后，尽管上述结果假设自由空间传播，本文从理论上并通过一个数值实验简要讨论了它们向更复杂传播现象的推广。

本文余下部分安排如下：第 II 节给出 RME 问题表述与有用记号；第 III 节分析功率地图的空间变异性；第 IV 节推导所考虑插值器的误差界；第 V 节给出数值实验，第 VI 节总结全文。证明见附录。关于结果向非自由空间环境推广的说明见附录 H。

**记号：** 符号 $\triangleq$ 表示按定义相等。若 $A$ 是度量空间中的集合，$\bar A$ 表示其闭包。若 $A$ 是向量空间中的集合，$\operatorname{span}(A)$ 表示由 $A$ 中有限多个元素的全部线性组合构成的集合。$\mathbb N$ 为自然数集，$\mathbb Z$ 为整数集，$\mathbb R$ 为实数域。粗体小写（大写）字母表示列向量（矩阵）。竖直拼接用分号表示，例如 $[\mathbf a;\mathbf b]$。函数 $f$ 用字母表示，而在点 $x$ 处对该函数求值的结果记为 $f(x)$。

## II. 无线电地图的估计

本节引入功率地图并给出其估计问题的形式化表述，随后介绍自由空间中功率地图的有用记号。

令 $R\subset\mathbb R^3$ 包含感兴趣地理区域内所有点的笛卡尔坐标。区域 $V\subset\mathbb R^3$ 中的 $S$ 个源（也称发射机）集合在每一点 $\mathbf r\in R$ 产生合成电场 $\mathbf e(\mathbf r,t)\in\mathbb R^3$，其中 $t$ 表示时间；记号的带下划线形式 $\underline{\mathbf r}$ 将表示 $\mathbb R^3$ 中的完整位置向量，而记号 $\mathbf r$ 将在后文引入限制时使用。

为简单起见忽略极化效应，并把 $\mathbf e(\mathbf r,t)$ 对每个 $\mathbf r$ 建模为关于 $t$ 的遍历宽平稳随机过程；此时置于 $\mathbf r\in R$ 的各向同性天线传感器所接收信号的功率不依赖 $t$，因而可用函数 $\gamma:R\to\mathbb R_+$ 表示。函数 $\gamma$ 因此刻画功率在空间中如何分布，它是无线电地图的一个特例，称为**功率地图**，取决于发射信号、发射机位置与传播环境。

问题是：给定 $R$ 中的一组测量来估计功率地图。具体地，令 $\gamma_1,\ldots,\gamma_N$ 表示在位置集合 $\widetilde R\triangleq\{\mathbf r_1,\ldots,\mathbf r_N\}\subset R$ 上测得的功率。对后续分析而言，传感器是静止的（每个传感器在单一空间位置测量）还是移动的（可在多个空间位置测量）并不重要（脚注：由于 $\mathbf e(\mathbf r,t)$ 被建模为遍历宽平稳随机过程，功率为常数、不依赖时间，因此理论上对测量采集时刻之差没有最大允许值；实践中 $\mathbf e(\mathbf r,t)$ 非平稳，可把功率看作时间的函数，于是需要规定一个功率不发生显著变化的时间尺度，全部 $N$ 次测量必须在该时间尺度内完成）。

由于传感器在 $\mathbf r_n$ 处测量接收功率的观测时间有限，$\gamma_n$ 一般不等于 $\gamma(\mathbf r_n)$，而应预期存在一定的测量误差。这通常写作 $\gamma_n=\gamma(\mathbf r_n)+\zeta_n$，其中 $\zeta_n$ 为测量误差。

功率地图估计问题可表述为：给定 $\{(\mathbf r_n,\gamma_n)\}_{n=1}^{N}$，估计函数 $\gamma$，或等价地估计所有 $\mathbf r\in R$ 处的取值 $\gamma(\mathbf r)$。地图估计记为 $\widehat\gamma$。在该表述中，没有给出关于传播环境、源位置、发射功率、发射天线辐射方向图等信息；这正是文献中大多数估计器基于插值算法而非电磁传播模型的原因。此类估计器的详细分类及相关文献见 [1]。

### A. 自由空间中的功率地图

由于本文许多结果聚焦自由空间传播，本节引入该类地图的有用记号；一般传播效应的情形将在讨论若干一般性结果时涉及，并将在第 V-B 节、附录 H 与未来工作中重点研究。

回顾 Friis 传播定律：当传播发生在自由空间时，位于 $\mathbf r$ 的终端从位于 $\acute{\mathbf r}$ 的发射机接收到的功率为

$$
\gamma(\mathbf r)=P_{\mathrm{Tx}}G_{\mathrm{Tx}}G_{\mathrm{Rx}}\left[\frac{\lambda}{4\pi\lVert\mathbf r-\acute{\mathbf r}\rVert}\right]^{2},\tag{1}
$$

其中 $\lambda$ 为波长，$P_{\mathrm{Tx}}$ 为发射功率，$G_{\mathrm{Tx}}$ 为发射机天线增益，$G_{\mathrm{Rx}}$ 为接收机天线增益。为简单起见假设两端均使用各向同性天线，即 $G_{\mathrm{Tx}}=G_{\mathrm{Rx}}=1$；令 $\alpha\triangleq P_{\mathrm{Tx}}(\lambda/4\pi)^{2}$，则式 (1) 化为

$$
\gamma(\mathbf r)=\frac{\alpha}{\lVert\mathbf r-\acute{\mathbf r}\rVert^{2}}.\tag{2}
$$

注意由式 (2)，当 $\mathbf r\to\acute{\mathbf r}$ 时 $\gamma(\mathbf r)\to+\infty$，这在物理上不可能。式 (2) 与物理现实不一致的原因是：式 (2) 只是远场近似，即当 $\lVert\mathbf r-\acute{\mathbf r}\rVert$ 显著大于 $\lambda$ 时成立。因此在全文中要求 $\lVert\mathbf r-\acute{\mathbf r}\rVert\ge\eta_{\min}$，其中 $\eta_{\min}$ 是显著大于 $\lambda$ 的常数。

在存在多个发射互不相关信号（脚注：该假设排除了协调多点传输，或使用空时编码／波束成形的多天线发射机等设置；另见脚注 2）的源时，每个源对总接收功率的贡献相加，因此全部可能功率地图构成的集合为

$$
\mathcal G_{\mathrm{FS}}=\left\{\gamma:R\to\mathbb R_+\ \middle|\ \gamma(\mathbf r)=\sum_{s=1}^{S}\frac{\alpha_s}{\lVert\mathbf r-\acute{\mathbf r}_s\rVert^{2}},\ \acute{\mathbf r}_s\in V,\ \alpha_s\ge0,\ S\in\mathbb N\right\},\tag{3}
$$

其中 $S$ 表示源数，$\alpha_s$ 与 $\acute{\mathbf r}_s$ 分别为第 $s$ 个源的 $\alpha$ 系数与位置。由于前述最小距离假设，$V$ 必须满足

$$
d_{\min}(\mathbf r)\triangleq\inf\{\lVert\mathbf r-\acute{\mathbf r}\rVert\ |\ \acute{\mathbf r}\in V\}\ge\eta_{\min}\quad\forall\mathbf r\in R.\tag{4}
$$

### B. 一维与二维限制

式 (3) 中的地图是三个空间坐标的函数。然而文献中大多数工作考虑这些地图对二维或一维空间的限制：二维情形在用户位于地面时有用，一维情形则在需要沿道路或铁路构造地图时有用。三维情形在文献中仍不多见，但已成功用于部署空中基站与空中中继 [6]、[8]。

**二维限制。** 为考虑功率地图对二维空间的限制，不失一般性地（w.l.o.g.）聚焦 $\gamma$ 在水平面 $H\triangleq\{[r_x;r_y;r_z]\in\mathbb R^3\ |\ r_z=0\}$ 上的取值。为此，$\gamma$ 的定义域 $R$ 必须是 $H$ 的子集，即对某个 $R^{(2)}\subset\mathbb R^2$，$R=\{[r_x;r_y;r_z]\ |\ [r_x;r_y]\in R^{(2)},\ r_z=0\}$。由于 $R$ 中每个点都可由其 $x$、$y$ 坐标（收集于 $R^{(2)}$）标识，所求的 $\gamma$ 限制将定义在 $R^{(2)}$ 上。

在给出该限制的表达式之前先引入一些记号。令 $\mathbf r=[r_x;r_y;0]$、$\acute{\mathbf r}=[\acute r_x;\acute r_y;\acute r_z]$，式 (2) 变为

$$
\gamma(\mathbf r)=\frac{\alpha}{\lVert\underline{\mathbf r}-\underline{\acute{\mathbf r}}\rVert^{2}}=\frac{\alpha}{\lVert\mathbf r-\acute{\mathbf r}\rVert^{2}+\beta^{2}}\triangleq\gamma(\mathbf r),\tag{5}
$$

其中 $\mathbf r\triangleq[r_x;r_y]$、$\acute{\mathbf r}\triangleq[\acute r_x;\acute r_y]$ 分别包含求值点与源位置相对于 $H$ 的水平坐标，而 $\beta^{2}\triangleq\acute r_z^{2}$ 为源位置到 $H$ 的平方距离。于是，尽管求值点 $\gamma$ 位于 $H$ 上，源位置并不要求在 $H$ 上。

有了这些记号，把式 (3) 中的地图限制到 $H$ 即得

$$
\mathcal G_{\mathrm{FS}}^{(2)}=\left\{\gamma:R^{(2)}\to\mathbb R_+\ \middle|\ \gamma(\mathbf r)=\sum_{s=1}^{S}\frac{\alpha_s}{\lVert\mathbf r-\acute{\mathbf r}_s\rVert^{2}+\beta_s^{2}},\ \acute{\mathbf r}_s\in V^{(2)},\ \beta_s^{2}\in B(\acute{\mathbf r}_s),\ \alpha_s\ge0,\ S\in\mathbb N\right\},\tag{6}
$$

其中 $V^{(2)}$ 为源水平坐标允许所在处的集合（由 $V$ 投影到 $H$ 得到），$B(\acute{\mathbf r})$ 包含对每个源水平坐标向量 $\acute{\mathbf r}$ 而言 $\beta^{2}$ 的允许取值，即 $B(\acute{\mathbf r})\triangleq\{\beta^{2}\ |\ \exists\check{\mathbf r}=[\check r_x;\check r_y;\check r_z]\in V:\acute{\mathbf r}=[\check r_x;\check r_y]\ \text{且}\ \check r_z^{2}=\beta^{2}\}$。图 2 展示了二维限制中所用主要符号。

**一维限制。** 由于一维情形最具启发性，本文多数结果聚焦单一空间维度上的无线电地图，即式 (3) 中的函数限制到一条直线上；出于同样原因，WTI 也采用了该做法 [29, 第 8 章]。直线上的 RME 例如已在 [30] 中考虑。

不失一般性地考虑直线 $L\triangleq\{[r_x;r_y;r_z]\in\mathbb R^3\ |\ r_y,r_z=0\}$，并假设 $R$ 是 $L$ 的子集。于是对某个 $R^{(1)}\subset\mathbb R^1$ 可写 $R=\{[r_x;r_y;r_z]\ |\ [r_x]\in R^{(1)},\ r_y,r_z=0\}$，其中 $\mathbb R^1$ 表示所有含一个实分量的向量构成的集合。为简化后文某些结果的陈述，有时对标量也使用向量记号。

当 $\mathbf r=[r_x;0;0]$、$\acute{\mathbf r}=[\acute r_x;\acute r_y;\acute r_z]$ 时，式 (2) 变为

$$
\gamma(\mathbf r)=\frac{\alpha}{\lVert\underline{\mathbf r}-\underline{\acute{\mathbf r}}\rVert^{2}}=\frac{\alpha}{\lVert\mathbf r-\acute{\mathbf r}\rVert^{2}+\beta^{2}}\triangleq\gamma(\mathbf r),\tag{7}
$$

其中 $\mathbf r\triangleq[r_x]$、$\acute{\mathbf r}\triangleq[\acute r_x]$ 为求值点与源位置的纵向坐标，而 $\beta^{2}\triangleq\acute r_y^{2}+\acute r_z^{2}$ 为源位置到被映射直线的平方距离。于是把式 (3) 中的地图限制到 $L$ 得

$$
\mathcal G_{\mathrm{FS}}^{(1)}=\left\{\gamma:R^{(1)}\to\mathbb R_+\ \middle|\ \gamma(\mathbf r)=\sum_{s=1}^{S}\frac{\alpha_s}{\lVert\mathbf r-\acute{\mathbf r}_s\rVert^{2}+\beta_s^{2}},\ \acute{\mathbf r}_s\in V^{(1)},\ \beta_s^{2}\in B(\acute{\mathbf r}_s),\ \alpha_s\ge0,\ S\in\mathbb N\right\},\tag{8}
$$

其中与二维情形类似，$V^{(1)}$ 由 $V$ 正交投影到 $L$ 得到，$B(\acute{\mathbf r})$ 为源位置 $x$ 坐标为 $\acute r_x$ 时 $\beta^{2}$ 的允许取值集合，即 $B(\acute{\mathbf r})\triangleq\{\beta^{2}\ |\ \exists\check{\mathbf r}=[\check r_x;\check r_y;\check r_z]\in V:\acute{\mathbf r}=[\check r_x]\ \text{且}\ \check r_y^{2}+\check r_z^{2}=\beta^{2}\}$。图 3 展示了式 (8) 中主要符号的几何含义，图 4 给出 $\mathcal G_{\mathrm{FS}}^{(1)}$ 中功率地图的一个例子。

## III. 无线电地图的空间变异性

在形式化所研究的地图类别之后，本节余下部分分析 $\mathcal G_{\mathrm{FS}}^{(1)}$ 与 $\mathcal G_{\mathrm{FS}}^{(2)}$ 中函数的变异性。具体地，第 III-A 与 III-B 节分别给出高变异性与低变异性结果；随后第 IV 节基于这些结果为三种插值算法推导性能界。

### A. 高变异性结果

本节确立功率地图构成一个相当丰富的函数类。由此可知，在一般条件下，即使没有噪声，也不可能用有限次测量精确估计功率地图；换言之，必然存在一定误差。重要的是，这些结论并不局限于自由空间传播：在反射、折射与衍射等任意传播现象存在时同样成立。

这些结论来自下一个结果：任何连续函数都可以任意精度地表示为两个自由空间功率地图之差。

**定理 1**　设 $R^{(d)}$ 是 $\mathbb R^d$ 的紧子集，其中 $d$ 为 1 或 2。则存在 $V\subset\mathbb R^3$ 使下述条件成立：对每个连续函数 $\gamma:R^{(d)}\to\mathbb R$ 与每个 $\epsilon>0$，

$$
\exists\gamma^{+},\gamma^{-}\in\mathcal G_{\mathrm{FS}}^{(d)}:\quad\sup_{\mathbf r\in R^{(d)}}\left|\gamma(\mathbf r)-\left(\gamma^{+}(\mathbf r)-\gamma^{-}(\mathbf r)\right)\right|<\epsilon.\tag{9}
$$

集合 $V$ 可选为任意满足以下两条件的集合：(C1) $R^{(d)}\subset V^{(d)}$；(C2) 存在 $\beta^{2}>0$ 使 $\beta^{2}\in B(\acute{\mathbf r})$ 对所有 $\acute{\mathbf r}\in R^{(d)}$ 成立。

**证明：** 见附录 A。

有几点值得注意。第一，函数 $\gamma$ 不必是功率地图——它是任意连续函数，甚至可以取负值。第二，(C1) 与 (C2) 只要求有足够灵活性找到合适的源位置；一个简单例子是令 $V$ 使得源可位于某一最小正高度之上任一点。第三，定理 1 表明 $\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d)}$ 在定义于 $\mathbb R^d$ 任意给定紧子集上的连续函数空间中稠密。因此 $\mathcal G_{\mathrm{FS}}^{(d)}$ 显然是无限维的；于是不应期望用有限次测量精确重建功率地图，即使这些测量无噪。最后，令 $\mathcal G$ 表示物理上可能的功率地图集合，即与麦克斯韦方程相容的功率地图集合；在 Friis 传输方程的简化假设下，$\mathcal G_{\mathrm{FS}}\subset\mathcal G$。因此函数族 $\mathcal G$ 至少与 $\mathcal G_{\mathrm{FS}}$ 一样丰富，从而上述结论对任意功率地图（而不只是自由空间地图）都成立。

鉴于定理 1，人们可能认为当测量位置集合有限甚至可数时，功率地图已无望被满意估计。幸运的是，细看定理 1 会发现 $\mathcal G_{\mathrm{FS}}^{(d)}$ 中函数的变异性或许没有看上去那么大。

首先也最重要的是，定理 1 用差值 $\gamma^{+}-\gamma^{-}$ 而不是单个地图来逼近 $\gamma$，这是由式 (3) 中 $\alpha_s$ 的非负性要求所致。换言之，若 $\mathcal G_{\mathrm{FS}}^{(d)}$ 是线性子空间而非仅为凸锥，则由定理 1 可推出：对任意离散测量位置集合 $\widetilde R$，可以找到两个功率地图，它们 (i) 在 $\widetilde R$ 处取值相同，(ii) 在 $R^{(d)}-\widetilde R$ 的任意给定点处相差任意大。这将意味着任何依赖 $\widetilde R$ 处测量的重建算法（即使无噪）误差都无界。不过幸运的是并非如此，下一节将对此详细讨论。

其次，定理 1 并未约束 $\gamma^{+}$ 与 $\gamma^{-}$ 中的发射功率或源数目。这意味着当 $\epsilon\to0$ 时其中某些量可能任意增大。因此，若对发射功率或源数目施加约束，功率地图的变异性可能远比初看定理 1 时以为的要有限。

### B. 低变异性结果

本节给出功率地图变异性的上界。为便于直观理解将要研究的根本现象，聚焦 $d=1$ 情形，此时任意 $\gamma\in\mathcal G_{\mathrm{FS}}^{(d)}$ 可写为

$$
\gamma(\mathbf r)=\gamma(r_x)=\sum_{s=1}^{S}\frac{\alpha_s}{(r_x-\acute r_{x,s})^{2}+\beta_s^{2}},\tag{10}
$$

其中 $\acute r_{x,s}$ 与 $\beta_s$ 满足 $\acute{\mathbf r}_s=[\acute r_{x,s};\acute r_{y,s};\acute r_{z,s}]\in V$ 且 $\beta_s=\sqrt{\acute r_{y,s}^{2}+\acute r_{z,s}^{2}}$。

**1）功率地图的空间变化率。** 第一个结果给出功率地图一阶导数的上界。

**引理 1**　设 $R^{(1)}$ 为开集，$\gamma\in\mathcal G_{\mathrm{FS}}^{(1)}$，则

$$
|\gamma'(r_x)|\le\frac{3^{3/2}}{8}\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s^{3}}.\tag{11}
$$

**证明：** 见附录 B。

引理 1 的界是紧的：可以验证，当所有源位于与 $L$ 垂直的平面上某一特定排布时取等号。

为便于解释式 (11)，回顾 $\alpha_s\triangleq P_{\mathrm{Tx}}^{(s)}(\lambda/4\pi)^{2}$，其中 $P_{\mathrm{Tx}}^{(s)}$ 为第 $s$ 个源的发射功率。于是式 (11) 可写为

$$
|\gamma'(r_x)|\le\frac{3^{3/2}}{128\pi^{2}}\lambda^{2}\sum_{s=1}^{S}\frac{P_{\mathrm{Tx}}^{(s)}}{\beta_s^{3}}.\tag{12}
$$

可以看到，该变化率随源到 $L$ 的距离 $\beta_s$ 呈三次方下降，而随发射功率线性增长。因此，距离的影响要显著得多：把 $\beta_s$ 缩小为原来的 1/2，与把 $P_{\mathrm{Tx}}^{(s)}$ 增大到 8 倍效果相同。此外，式 (10) 中 $\gamma$ 的导数当 $r_x$ 离 $\acute r_{x,s}$ 任意远时趋于零，这意味着最大的变异性出现在源的邻域；由上述考虑，该变异性在靠近 $L$ 的源附近最大。这表明：无线电地图估计器通常受益于在 $L$ 上靠近源的区段采集更多测量。有趣的是，这与 WTI 完全一致——WTI 预测在源的附近需要更大的传感器空间密度 [29, 第 8.5.2 与 8.6 节]。

把式 (12) 以 $\lambda$ 作归一化也很有意义。特别地，考虑归一化距离 $\check r_x\triangleq r_x/\lambda$ 与 $\check\beta_s\triangleq\beta_s/\lambda$；以 $\check r_x$ 表述的无线电地图变为 $\check\gamma(\check r_x)\triangleq\gamma(\lambda\check r_x)$，其导数满足 $\check\gamma'(\check r_x)=\frac{\mathrm d\check\gamma(\check r_x)}{\mathrm d\check r_x}=\frac{\mathrm d\gamma(\lambda\check r_x)}{\mathrm d r_x}\frac{\mathrm d r_x}{\mathrm d\check r_x}=\lambda\gamma'(\lambda\check r_x)$。于是由式 (12) 得

$$
|\check\gamma'(\check r_x)|\le\frac{3^{3/2}}{128\pi^{2}}\sum_{s=1}^{S}\frac{P_{\mathrm{Tx}}^{(s)}}{\check\beta_s^{3}}.\tag{13}
$$

正如电磁理论所预期，该式不再依赖 $\lambda$。因此，以波长为尺度衡量的功率地图变异性，只依赖源到 $L$ 的距离（以 $\lambda$ 为单位）。RME 问题在同时按同一因子缩放 $\lambda$ 与所有距离时不变。这意味着：若减小 $\lambda$ 并希望达到相同估计性能，测量间距必须按相同比例减小；反之，对给定测量位置集合，$\lambda$ 越短估计性能越差。

下一个结果给出 $\mathcal G_{\mathrm{FS}}^{(1)}$ 中无线电地图变异性的另一种视角。与依赖各源参数的引理 1 不同，下一个结果给出：已知地图在某点的取值时，它在另一点可取值的界。

**定理 2**　设 $\gamma\in\mathcal G_{\mathrm{FS}}^{(1)}$。若 $[r_x],[r_x+\Delta r]\in R^{(1)}$，则

$$
\gamma(r_x)\,\frac{c(\Delta r)-1}{c(\Delta r)+1}\le\gamma(r_x+\Delta r)\le\gamma(r_x)\,\frac{c(\Delta r)+1}{c(\Delta r)-1},\tag{14}
$$

其中

$$
c(\Delta r)\triangleq\sqrt{1+4\left[\frac{\eta_{\min}}{\Delta r}\right]^{2}}.\tag{15}
$$

**证明：** 见附录 C。

图 5 在 $r_x=0$ 时用功率地图示例说明了式 (14) 的界；上界之上与下界之下的区域为禁区。当把式 (14) 视为固定 $\gamma(r_x)$ 下关于 $\Delta r$ 的函数时，唯一支配该界的参数是 $\eta_{\min}$。因此，就相对变化 $\gamma(r_x+\Delta r)/\gamma(r_x)$ 而言，决定 $\gamma$ 最大变异性的主要因素是源与被映射区域之间的最小距离；又因下界随 $\eta_{\min}$ 增大而上界随 $\eta_{\min}$ 减小，故 $\gamma$ 的最大变异性在 $\eta_{\min}$ 最小时最大。回顾定理 1 曾确立功率地图之差集在连续函数空间中稠密；前面提到，若该结论也适用于功率地图自身，将非常棘手。幸运的是，由定理 2 可得：

**推论 1**　$\mathcal G_{\mathrm{FS}}^{(1)}$ 在定义于 $R^{(1)}$ 上、取均匀度量的正连续函数空间中不稠密。

**证明：** 显然。

换言之，存在一些连续函数，找不到与之任意接近的功率地图。对地图定义在圆上的情形，可用不同的证明技巧建立类似结果。

**推论 2**　设 $R^{(2)}=\{[r_x,r_y]\ |\ r_x^{2}+r_y^{2}=R\}$，其中 $R>0$。则 $\mathcal G_{\mathrm{FS}}^{(2)}$ 在定义于 $R^{(2)}$ 上的正连续函数空间中不稠密。

**证明：** 不失一般性设 $R=1$。由式 (4) 可知，[31, 式 (0.8)] 中的级数只含有限项，因而所得级数不可能发散。于是由 [31, 定理 2] 得 $\mathcal G_{\mathrm{FS}}^{(2)}$ 在定义于 $R^{(2)}$ 上的正连续函数空间中不稠密。$\square$

**2）功率地图的空间带宽。** 本节余下部分确立：自由空间中的无线电地图在空间频率意义上近似低通。这不仅具有纯理论意义，也为基于该性质的估计器提供动机；此类估计器将沿 [29, 第 8 章] 关于电磁场自身空间带宽的讨论思路展开。

考虑 $\gamma$ 的傅里叶变换：

$$
\Gamma(k_x)\triangleq\int_{-\infty}^{\infty}\gamma(r_x)e^{-jk_xr_x}\,\mathrm dr_x,\tag{16}
$$

其中 $k_x$ 为空间频率。下一个结果刻画 $\gamma$ 的频率内容。

**定理 3**　令 $\beta_{\min}\triangleq\min_s\beta_s$、$\beta_{\max}\triangleq\max_s\beta_s$、$B>0$，则

$$
|\Gamma(k_x)|\le\left[\frac{\pi}{\beta_{\min}}\sum_{s=1}^{S}\alpha_s\right]e^{-\beta_{\min}|k_x|}\tag{17a}
$$

$$
\int_{B}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\le\frac{\pi^{2}S\sum_{s=1}^{S}\alpha_s^{2}}{2\beta_{\min}^{3}}e^{-2\beta_{\min}B}\tag{17b}
$$

$$
\int_{0}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\ge\frac{\pi^{2}}{2}\sum_{s=1}^{S}\frac{\alpha_s^{2}}{\beta_s^{3}}\ge\frac{\pi^{2}\sum_{s=1}^{S}\alpha_s^{2}}{2\beta_{\max}^{3}}.\tag{17c}
$$

**证明：** 见附录 D。

式 (17a) 表明 $\Gamma$ 不可能是高通的。更准确地说，结合 (17b) 与 (17c) 可量化 $\Gamma$ 在高频处的能量占比：

$$
\frac{\int_{B}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x}{\int_{0}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x}\le S\left[\frac{\beta_{\max}}{\beta_{\min}}\right]^{3}e^{-2\beta_{\min}B}.\tag{18a}
$$

这表明 $\Gamma$ 的能量集中在低频；且随 $B$ 增大，该集中呈指数式加强。此外，增大 $\beta_{\min}$ 会使 $\Gamma$ 的能量在低频的集中迅速增强。最后值得指出，WTI 也利用其中 $\beta_{\min}$ 与 $\beta_{\max}$ 对应量之间的关系，通过空间带宽概念量化场的复杂度 [29, 式 (8.75)]。

## IV. 重建误差界

本节分析三种简单无线电地图估计器的重建性能；更复杂算法的分析留待未来工作。所得界汇总于表 I。

**表 I：重建误差的上界。**

| | 零阶插值 | 一阶插值 | Sinc 插值 |
|---|---|---|---|
| 插值器 | $\widehat\gamma(r_x)\triangleq\gamma_n$，其中 $n=\arg\min_{n'}\lvert r_x-r_{n'}\rvert$ | $\widehat\gamma(r_x)\triangleq\frac{\Delta\gamma_n}{\Delta r_n}(r_x-r_n)+\gamma_n$ | $\widehat\gamma^{(\nu)}(r_x)\triangleq\sum_{n=-\infty}^{\infty}\gamma\left(r_n^{(\nu)}\right)\operatorname{sinc}\left(\frac{r_x-r_n^{(\nu)}}{\Delta r}\right)$ |
| $L^{1}$ | $\frac{3\sqrt{3}}{32}\rho\sum_{n=1}^{N-1}\Delta r_n^{2}$ | $\frac{27\sqrt{3}}{256}\rho\sum_{n=1}^{N-1}\Delta r_n^{2}$ | — |
| $L^{2}$ | $\frac{3}{16}\rho\sqrt{\sum_{n=1}^{N-1}\Delta r_n^{3}}$ | $\sqrt{\frac{144\sqrt{2}-117}{2048}}\rho\sqrt{\sum_{n=1}^{N-1}\Delta r_n^{3}}$ | $\frac{\pi S\sum_{s=1}^{S}\alpha_s^{2}}{\beta_{\min}^{3}}e^{-2\pi\beta_{\min}/\Delta r}$ |
| $L^{\infty}$ | $\frac{3^{3/2}}{16}\rho\max_n\Delta r_n$ | $\frac{3^{3/2}}{16}\rho\max_n\Delta r_n$ | — |

重建误差有多个分量：一部分源于无线电地图本身的变异性（第 III 节已量化），另一部分源于任何插值问题中都存在的测量噪声。为聚焦第一类分量，假设对所有 $n$ 有 $\zeta_n=0$。

回顾第 II 节的 RME 问题表述为：给定 $\{(\mathbf r_n,\gamma_n)\}_{n=1}^{N}$ 估计 $\gamma$，其中 $\mathbf r_n\in R$。聚焦第 II-B 节引入的一维限制，可把该表述改写为：给定 $\{(r_n,\gamma_n)\}_{n=1}^{N}$ 估计 $\gamma$，其中 $r_n\in R^{(1)}$ 为第 $n$ 个测量位置的 $x$ 坐标。然而为简化某些表达式，亦方便允许可数测量集合；于是问题重述为：给定 $\{(r_n,\gamma_n)\}_{n\in\mathcal N}$ 估计 $\gamma$，其中 $r_n\in R^{(1)}$ 且 $\mathcal N\subset\mathbb Z$ 是（可能无穷的）可数指标集。显然取 $\mathcal N=\{1,\ldots,N\}$ 即回到原表述；此外不失一般性假设对所有 $n$ 有 $r_n<r_{n+1}$。

所研究的性能度量为 Lebesgue 空间中常用的 $L_1$、$L_2$ 范数，以及连续有界函数空间中使用的 $L_\infty$ 范数：

$$
\lVert\gamma-\widehat\gamma\rVert_1\triangleq\int_{R^{(1)}}|\gamma(r_x)-\widehat\gamma(r_x)|\,\mathrm dr_x\tag{19a}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_2^{2}\triangleq\int_{R^{(1)}}|\gamma(r_x)-\widehat\gamma(r_x)|^{2}\,\mathrm dr_x\tag{19b}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_\infty\triangleq\sup_{r_x\in R^{(1)}}|\gamma(r_x)-\widehat\gamma(r_x)|.\tag{19c}
$$

许多界将是下述量的增函数，该量称为**接近系数**：

$$
\rho\triangleq\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s^{3}}=\left(\frac{\lambda}{4\pi}\right)^{2}\sum_{s=1}^{S}\frac{P_{\mathrm{Tx}}^{(s)}}{\beta_s^{3}}.\tag{20}
$$

鉴于这是 $1/\beta_s^{3}$ 各项的加权和，可得出结论：若相对强的源靠近被映射区域，则应预期较差的估计性能；这与第 III 节的发现一致。

### A. 零阶插值

设 $\mathcal N=\{1,\ldots,N\}$ 且 $R^{(1)}=[r_1,r_N)$（脚注：严格来说 $R^{(1)}$ 不含 $r_N$，这违反第 II 节的假设；但这显然无影响，只是为了简化表述）。此处考虑的零阶插值器是最近邻估计器：对每个 $r_x$，该估计器产生

$$
\widehat\gamma(r_x)\triangleq\gamma_n,\qquad\text{其中 } n=\arg\min_{n'}|r_x-r_{n'}|.\tag{21}
$$

**定理 4**　设 $\widehat\gamma$ 由式 (21) 给出，并令 $\Delta r_n\triangleq r_{n+1}-r_n$，则

$$
\lVert\gamma-\widehat\gamma\rVert_1\le\frac{3\sqrt{3}}{32}\rho\sum_{n=1}^{N-1}\Delta r_n^{2}\tag{22a}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_2\le\frac{3}{16}\rho\sqrt{\sum_{n=1}^{N-1}\Delta r_n^{3}}\tag{22b}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_\infty\le\frac{3^{3/2}}{16}\rho\max_n\Delta r_n.\tag{22c}
$$

**证明：** 见附录 E。

首先注意：若对所有 $n$ 有 $\Delta r_n\to0$，则误差趋于 0，这符合 $\gamma$ 连续性的预期。其次，所有这些度量的界只通过接近系数 $\rho$ 依赖定义地图的量（波长、发射功率、源位置），因而 $\rho$ 有效地浓缩了这些量的影响。

对式 (17c) 应用 Parseval 定理得

$$
\lVert\gamma\rVert_2^{2}\triangleq\int_{-\infty}^{\infty}|\gamma(r_x)|^{2}\,\mathrm dr_x=\frac{1}{\pi}\int_{0}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\ge\frac{\pi}{2}\sum_{s=1}^{S}\frac{\alpha_s^{2}}{\beta_s^{3}}.\tag{23a}
$$

于是相对误差可上界为

$$
\frac{\lVert\gamma-\widehat\gamma\rVert_2^{2}}{\lVert\gamma\rVert_2^{2}}\le\frac{9}{128\pi}\frac{\left[\sum_{s=1}^{S}\alpha_s/\beta_s^{3}\right]^{2}}{\sum_{s=1}^{S}\alpha_s^{2}/\beta_s^{3}}\sum_{n=1}^{N-1}\Delta r_n^{3}.\tag{24}
$$

有趣的是，若 $\alpha_s=\alpha$ 对所有 $s$ 成立且 $\beta_s=\beta$ 对所有 $s$ 成立，则相对误差界变为

$$
\frac{\lVert\gamma-\widehat\gamma\rVert_2^{2}}{\lVert\gamma\rVert_2^{2}}\le S\frac{9}{128\pi}\sum_{n=1}^{N-1}\left[\frac{\Delta r_n}{\beta}\right]^{3}.\tag{25}
$$

这再次表明：源越接近 $L$，为达到目标相对误差所需的样本间距 $\Delta r_n$ 越小。同样值得注意的是，在该简单场景中式 (25) 不依赖发射功率。事实上，$\alpha_s$（等价地 $P_{\mathrm{Tx}}^{(s)}$）可看作式 (24) 中对每个 $\beta_s$ 影响误差进行加权的因子。

### B. 一阶插值

与第 IV-A 节相同，设 $\mathcal N=\{1,\ldots,N\}$、$R^{(1)}=[r_1,r_N)$。此处考虑的一阶插值器是线性插值器，它返回 $R^{(1)}$ 上的函数，取值为

$$
\widehat\gamma(r_x)\triangleq\frac{\Delta\gamma_n}{\Delta r_n}(r_x-r_n)+\gamma_n,\tag{26}
$$

其中 $\Delta\gamma_n\triangleq\gamma(r_{n+1})-\gamma(r_n)$、$\Delta r_n\triangleq r_{n+1}-r_n$，而 $n$ 是使 $r_x\in[r_n,r_{n+1})$ 的唯一整数。

**定理 5**　由式 (26) 定义的估计器 $\widehat\gamma$ 满足

$$
\lVert\gamma-\widehat\gamma\rVert_1\le\frac{27\sqrt{3}}{256}\rho\sum_{n=1}^{N-1}\Delta r_n^{2}\tag{27a}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_2\le\sqrt{\frac{144\sqrt{2}-117}{2048}}\rho\sqrt{\sum_{n=1}^{N-1}\Delta r_n^{3}}\tag{27b}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_\infty\le\frac{3^{3/2}}{16}\rho\max_n\Delta r_n.\tag{27c}
$$

**证明：** 见附录 F。

可以看到，除乘性因子外，定理 5 的界与定理 4 相同；因此第 IV-A 节的类似观察在此同样适用。然而与预期相反，定理 5 中的常数实际上**大于**定理 4 中的常数：这是因为后者比前者更紧，定理 5 证明中隐含考虑的最坏情形更极端。尽管如此，预计更繁琐的推导（脚注：思路是在每个区间 $[r_n,r_{n+1}]$ 中点处同时施加连续性与导数界，然后对 $\gamma$ 在该点的取值最大化最坏情形误差；但需考虑的情形数量众多，使推导变得繁琐）会给出低于零阶插值的一阶插值上界。

### C. Sinc 插值

sinc 插值器在给定满足 Nyquist 准则的均匀间隔样本时，可精确重建带限信号。用这种 sinc 插值器重建 $\gamma$ 的动机来自定理 3：它确立 $\gamma$ 近似带限。该插值器在 WTI 中也起核心作用 [29]。

假设在均匀间隔位置集合 $\widetilde R_\nu\triangleq\{r_n^{(\nu)},\ n\in\mathbb Z\}$ 上观测 $\gamma$，其中 $r_n^{(\nu)}\triangleq n\Delta r+\nu$ 为对应偏移 $\nu\in\mathbb R$ 的采样时刻，$\Delta r>0$ 为空间采样间隔。于是 $\mathcal N=\mathbb Z$，并令 $R^{(1)}=\mathbb R$。实践中，$\widetilde R_\nu$ 可对应车辆沿 $L$ 行驶并以规则间隔采集测量的场景。

sinc 插值器定义为

$$
\widehat\gamma^{(\nu)}(r_x)\triangleq\sum_{n=-\infty}^{\infty}\gamma\left(r_n^{(\nu)}\right)\operatorname{sinc}\left(\frac{r_x-r_n^{(\nu)}}{\Delta r}\right),\tag{28}
$$

其中 $\gamma(r_n^{(\nu)})$ 为测量值。考虑下述结果。

**定理 6**　设 $\gamma$ 的傅里叶变换为 $\Gamma$。若令

$$
E^{(\nu)}\triangleq\lVert\gamma-\widehat\gamma^{(\nu)}\rVert_2\triangleq\int_{-\infty}^{\infty}\left|\gamma(r_x)-\widehat\gamma^{(\nu)}(r_x)\right|^{2}\,\mathrm dr_x,\tag{29}
$$

则

$$
\bar E\triangleq\frac{1}{\Delta r}\int_{0}^{\Delta r}E^{(\nu)}\,\mathrm d\nu=\frac{2}{\pi}\int_{\pi/\Delta r}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x.\tag{30}
$$

**证明：** 见附录 G。

该定理表明：对所有偏移 $\nu$ 的平均误差正比于 $\gamma$ 在 $[-\pi/\Delta r,\pi/\Delta r]$ 之外的能量。因此这是一种**混叠误差**：在采集测量之前无法对 $\gamma$ 作物理上的空间低通滤波（在时域中这相当于模数转换器（ADC）所做的工作）。它也可解释为偏移在 $[0,\Delta r)$ 上均匀分布时的期望误差，这体现了测量位置一般既不依赖坐标系也不依赖 $\gamma$ 本身。

还需注意，式 (30) 是等式而非上界，且适用于任意功率地图（不一定是自由空间）。在式 (30) 中代入 $B=\pi/\Delta r$ 的式 (17b)，得到界

$$
\bar E\le\frac{\pi S\sum_{s=1}^{S}\alpha_s^{2}}{\beta_{\min}^{3}}e^{-2\pi\beta_{\min}/\Delta r}.\tag{31}
$$

当令 $\Delta r_n=\Delta r$ 对所有 $n$ 成立时，该界随 $\beta_{\min}\to\infty$ 或 $\Delta r\to0$ 的下降速度远快于定理 4 与定理 5 的界。此外，式 (31) 中的误差是 $\mathbb R$ 上的总误差，而定理 4、5 的界只适用于有界区间 $[r_1,r_N)$；事实上，后者的界随支撑变长而发散（只需令 $N\to\infty$ 而 $\Delta r$ 不变）。因此，sinc 插值器的性能保证要强得多。第 V 节将给出这些界之间更详细的比较。

**注记 1**　单发射机情形是第 II 节所建立一般问题（源数任意）的一个相关特例；本文部分结果可通过令 $S=1$ 直接特化到该情形，例如引理 1 与第 IV 节的界；定理 2 在 $S=1$ 时也保持不变。相反，其他结果（如定理 1、推论 1、推论 2）本质上需要任意数目的发射机，因而不能用于 $S=1$ 情形。关于 $S=1$ 的进一步讨论见 [1]。

## V. 数值实验

本节给出实验，以实证方式印证论文的理论发现。

### A. 重建误差界的紧致性

本节验证并评估第 IV 节界的紧致性。为此，通过把 3 个发射机置于距 $L$ 为 $\beta$ 处生成 $\gamma\in\mathcal G_{\mathrm{FS}}^{(1)}$。令 $\lambda=1$ 以便用波长表示所有长度，并取

$$
\left\{(\acute r_{x,s},\beta_s,\alpha_s)\right\}_{s=1}^{S}=\left\{(1000,\beta,(4\pi)^{2}),\ (5000,\beta,(4\pi)^{2}),\ (8000,\beta,(4\pi)^{2})\right\}.
$$

$N=11$ 个测量位置为 $r_n=(n-1)\Delta r$、$n=1,\ldots,N$，其中 $\Delta r=1000$。用这些测量，各算法返回插值函数 $\widehat\gamma$，并在区间 $[r_1,r_N]$ 内 1000 个均匀间隔点上求值，以近似式 (19) 的误差度量。这些参数取值用于捕捉蜂窝通信中的典型情形。

图 6 与图 7 分别给出零阶与一阶插值的这些度量及其在式 (22)、式 (27) 中的上界。可以看到：第一，界的衰减率与相应误差度量的衰减率准确吻合。第二，误差下降比指数式更慢（指数式下降会表现为直线）。此外，这些界相当紧：例如可以看到，$L_2$ 误差的上界低于 $L_1$ 误差。如先前预料，零阶插值的界比一阶插值更紧，但后者的误差低于前者，因此在性能意义上**一阶插值更可取**。

第三个实验研究 sinc 插值的误差。由于式 (31) 的上界针对 $L_2$ 误差关于采样偏移 $\nu$ 的平均（参见式 (30)），实验中在 $[0,\Delta r)$ 内均匀取 20 个不同偏移，分别近似误差后取平均。图 8 表明：对足够小的 $\beta$，误差度量与界以相同速率下降，且该速率呈指数式。因此 sinc 插值的下降速度远快于零阶与一阶插值。然而有一个重要告诫：如第 IV-C 节所述，式 (31) 的界在采样栅格覆盖整个实直线时适用（简记为 $N=\infty$）；但在实践与仿真中，采样位置数 $N$ 有限，因而被限制在有限长区间内。为使上界成立，必须让有限 $N$ 的插值误差足够接近 $N=\infty$ 时的理论插值误差；这要求 $\gamma$ 的能量充分集中在被观测区间上，否则式 (28) 中被省略的项（即对应未观测值 $\gamma(r_n^{(\nu)})$ 的项）会对误差度量被近似的区间产生显著影响。图 8 显示随 $\beta$ 增大两类情形之间的急剧转变；对足够小的 $\beta$，函数 $\gamma$ 集中在观测区间内。值得注意的是，该转变发生在相当小的 $\beta$ 值处：只需比较 $\acute r_{x,s}$ 的尺度与发生转变处的 $\beta$ 尺度即可。因此，尽管 sinc 插值器在理论上很有前景，采样区间的有限长度可能使其在实践中不可行。

### B. 射线追踪数据实验

本节给出用射线追踪软件生成功率地图的实验，目的是在具有真实信道模型的二维场景中验证"发射机越接近 $R$、功率地图越难估计"这一论断。

为此，针对不同发射机高度生成一组功率地图。地图取值由渥太华市中心的 3D 模型在水平区域（尺寸 $47\times56$ 米、高度 2 米）上以 1 米间距构造的矩形网格计算。所有地图中部署 5 个发射机；这些发射机的 $x$、$y$ 坐标在各地图间相同，$z$ 坐标在同一地图内相同、在不同地图间不同。发射机使用各向同性天线，工作在 2.4 GHz，功率 $P_{\mathrm{Tx}}^{(s)}=P_{\mathrm{Tx}}=10$ dBm（对所有 $s$）。

在每次蒙特卡洛迭代中，从所考虑高度的大地图中均匀随机抽取 $32\times32$ 米的子区域，生成较小地图；随后从位于子区域内、建筑物之外的网格点中均匀随机抽取 $N=100$ 个测量位置（接收机使用各向同性天线）。采用三种简单估计器：(i) $K$ 近邻估计器，$K=5$ [1]；(ii) 简单 Kriging，$\sigma_s=3$、$\delta_s=50$ 米 [24]；(iii) 核岭回归（KRR），高斯核宽度 10 米、正则化参数 0.001 [32]。

性能度量为归一化均方误差（NMSE）：

$$
\mathrm{NMSE}\triangleq\frac{\mathbb E\{\lVert\gamma-\widehat\gamma\rVert_2^{2}\}}{\mathbb E\{\lVert\gamma\rVert_2^{2}\}},\tag{32}
$$

其中 $\gamma$ 与 $\widehat\gamma$ 分别为真实与估计功率地图在建筑物之外网格点处取值构成的向量；期望（如式中所标）关于子区域与测量位置的选择取。

图 9 给出上述三种估计器的 NMSE 随发射机高度的变化。如预期，随发射机远离被映射区域，所有估计器的 NMSE 都下降，这为该论断提供了证据。

尽管已在自由空间中解析地证明该现象总是发生，且图 9 中经验上也观察到其成立，但必须指出：该现象并非在一切情形下都成立。例如在 $S=1$ 的设置下，若发射机置于某栋具有水平金属屋顶的建筑正上方，则当发射机恰在屋顶上时发射信号无法到达地面，地图恒为 0，因而所考虑估计器的估计误差为 0；而若发射机高出建筑一定距离，屋顶便不会处处遮挡信号，此时误差严格为正，从而违背该论断。结论是：该论断可作为指导性经验，但未必在所有情形下都准确。

## VI. 结论

本文研究了由一组非相干源产生的功率地图的重建问题。通过上下界刻画了这些地图的变异性；值得注意的是，功率地图在空间上是低通的。针对基于零阶、一阶与 sinc 插值的估计器，对三种函数重建误差度量给出了上界。一个简单数值实验表明这些界是紧的，并准确预测了其随源到被映射区域距离的下降速率。这也为引入接近系数提供了依据：它与大多数重建界成比例，表明 RME 问题的难度随发射功率增大而增大、随源到被映射区域距离增大而减小。分析表明，sinc 插值器的重建误差远小于零阶与一阶插值器；然而实践中采样区间的有限长度意味着，除非源非常接近被映射区域，sinc 插值器的误差将相当大。基于射线追踪数据的实验揭示：在非自由空间传播环境中，RME 问题的难度也倾向于随源接近而增大。

作为该背景下首个理论分析，本工作存在若干局限。因此未来工作可研究更高维度的无线电地图估计，并计入噪声、发射机之间的相关性，以及反射、折射、吸收与衍射等传播效应；对更复杂估计器的界也值得关注。作者希望本文能开启这一背景下一个富有成果的研究方向。

## 图注与表注

**图 1：功率地图示例。** 该地图由无人机采集的空间稠密测量集合构造 [24]。

**图 2：二维空间功率地图估计设置示意。** 这是文献中最常见的设置。

**图 3：一维空间功率地图估计设置示意。** 当需要沿道路估计地图时该设置很有用。

**图 4：$\mathcal G_{\mathrm{FS}}^{(1)}$ 中功率地图示例（黑色曲线）。** 参数为 $S=3$、$[\acute r_{x,1},\acute r_{x,2},\acute r_{x,3}]=[1,5,8]$、$[\beta_1,\beta_2,\beta_3]=[1,3,2]$、$[\alpha_1,\alpha_2,\alpha_3]=[1,3,3]$。蓝色曲线对应各源的贡献，各曲线最大值位于相应的 $\acute r_{x,s}$ 处。虽然源 $s=1$ 的功率最低，但它比其他源更接近 $L$，从而对 $\gamma$ 及其导数 $\gamma'$ 的贡献最大。

**图 5：定理 2 给出的无线电地图变异性界的示意。** 已知 $\gamma$ 在某点 $r_x$（图中取 $r_x=0$）的取值时，$\gamma$ 在任意其他点可取的取值受式 (14) 限制；因此上界之上与下界之下的区域为禁区。此外，若 $V^{(1)}=\mathbb R^1$ 且 $\eta_{\min}^{2}\in B([\acute r_x])$ 对所有 $\acute r_x$ 成立，则式 (14) 的界是紧的，即给定 $r_x$、$\Delta r$ 与 $\gamma(r_x)$，存在 $\gamma\in\mathcal G_{\mathrm{FS}}^{(1)}$ 使式 (14) 的任一边界取等号。

**图 6：零阶插值估计器 (21) 的误差度量及其上界 (22a)—(22c)。** 横轴为表征源距离的扫描参数，纵轴为对数误差；图例包括 $L_1$、$L_2$、$L_\infty$ 误差及其上界。

**图 7：一阶插值估计器 (26) 的误差度量及其上界 (27a)—(27c)。** 图例同图 6。

**图 8：sinc 插值的误差度量及其 $L_2$ 误差上界 (31)。** 横轴为 $\beta$ 的取值（1—7），纵轴为对数误差；图例区分有限 $N$ 下的 $L_1$/$L_2$/$L_\infty$ 误差与 $N=\infty$ 的 $L_2$ 上界。

**图 9：归一化均方误差（NMSE）随发射机高度的变化。** 三条曲线分别对应 K-NN、Kriging 与 KRR 估计器；随发射机升高（远离被映射区域），三种估计器的 NMSE 均下降。

**表注：** 表 I 即原文唯一表格（重建误差上界汇总，见第 IV 节）；其余为图。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 36 条，源文 pp. 10–11）。

[1] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, 2022.

[2] H. Abou-zeid, H. S. Hassanein, and S. Valentin, "Optimal predictive resource allocation: Exploiting mobility patterns and radio maps," in Global Commun. Conf., 2013, pp. 4877–4882.

[3] S. Subramani, J. Riihijärvi, B. Sayrac, L. Gavrilovska, M. Sooriyabandara, T. Farnham, and P. Mähönen, "Towards practical REM-based radio resource management," in Future Network & Mobile Summit, 2011, pp. 1–8.

[4] T. Cai, J. van de Beek, B. Sayrac, S. Grimoud, J. Nasreddine, J. Riihijärvi, and P. Mähönen, "Design of layered radio environment maps for RAN optimization in heterogeneous LTE systems," in Int. Symp. Personal, Indoor Mobile Radio Commun., 2011, pp. 172–176.

[5] A. Zalonis, N. Dimitriou, A. Polydoros, J. Nasreddine, and P. Mähönen, "Femtocell downlink power control based on radio environment maps," in Wireless Commun. Networking Conf., 2012, pp. 1224–1228.

[6] D. Romero, P. Q. Viet, and G. Leus, "Aerial base station placement leveraging radio tomographic maps," in IEEE Int. Conf. Acoustics Speech Signal Process., Singapore, 2022, IEEE, pp. 5358–5362.

[7] P. Q. Viet and D. Romero, "Aerial base station placement: A tutorial introduction," IEEE Commun. Mag., vol. 60, no. 5, pp. 44–49, 2022.

[8] P. Q. Viet and D. Romero, "Probabilistic roadmaps for aerial relay path planning," in IEEE Glob. Commun. Conf., 2023.

[9] D. Romero, S.-J. Kim, R. López-Valcarce, and G. B. Giannakis, "Spectrum cartography using quantized observations," in Proc. IEEE Int. Conf. Acoust., Speech, Signal Process., Brisbane, Australia, Apr. 2015, pp. 3252–3256.

[10] A. Alaya-Feki, S. B. Jemaa, B. Sayrac, P. Houze, and E. Moulines, "Informed spectrum usage in cognitive radio networks: Interference cartography," in Proc. IEEE Int. Symp. Personal, Indoor Mobile Radio Commun., Cannes, France, Sep. 2008, pp. 1–5.

[11] A. Agarwal and R. Gangopadhyay, "Predictive spectrum occupancy probability-based spatio-temporal dynamic channel allocation map for future cognitive wireless networks," Trans. Emerging Telecommun. Technol., vol. 29, no. 8, pp. e3442, 2018.

[12] R. Shrestha, D. Romero, and S. P. Chepuri, "Spectrum surveying: Active radio map estimation with autonomous UAVs," IEEE Trans. Wireless Commun., vol. 22, no. 1, pp. 627–641, 2022.

[13] J.-A. Bazerque and G. B. Giannakis, "Distributed spectrum sensing for cognitive radio networks by exploiting sparsity," IEEE Trans. Signal Process., vol. 58, no. 3, pp. 1847–1862, Mar. 2010.

[14] J.-A. Bazerque, G. Mateos, and G. B. Giannakis, "Group-lasso on splines for spectrum cartography," IEEE Trans. Signal Process., vol. 59, no. 10, pp. 4648–4663, Oct. 2011.

[15] B. A. Jayawickrama, E. Dutkiewicz, I. Oppermann, G. Fang, and J. Ding, "Improved performance of spectrum cartography based on compressive sensing in cognitive radio networks," in Proc. IEEE Int. Commun. Conf., Budapest, Hungary, Jun. 2013, pp. 5657–5661.

[16] B. Khalfi, B. Hamdaoui, and M. Guizani, "AirMAP: Scalable spectrum occupancy recovery using local low-rank matrix approximation," in IEEE Glob. Commun. Conf., Abu Dhabi, UAE, Dec. 2018.

[17] D. Schäufele, R. L. G. Cavalcante, and S. Stanczak, "Tensor completion for radio map reconstruction using low rank and smoothness," in IEEE Int. Workshop Signal Process. Advances Wireless Commun., Cannes, France, Jul. 2019.

[18] S.-J. Kim and G. B. Giannakis, "Cognitive radio spectrum prediction using dictionary learning," in Proc. IEEE Global Commun. Conf., Atlanta, GA, Dec. 2013, pp. 3206–3211.

[19] T. N. Ha, D. Romero, and R. López-Valcarce, "Radio maps for beam alignment in mmwave communications with location uncertainty," in IEEE Vehicular Tech. Conf. Workshop, Spring, Singapore, 2024.

[20] E. Krijestorac, S. Hanna, and D. Cabric, "Spatial signal strength prediction using 3D maps and deep learning," in Proc. IEEE Int Conf. Commun., 2021, pp. 1–6.

[21] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[22] X. Han, L. Xue, F. Shao, and Y. Xu, "A power spectrum maps estimation algorithm based on generative adversarial networks for underlay cognitive radio networks," Sensors, vol. 20, no. 1, pp. 311, Jan. 2020.

[23] Y. Teganya and D. Romero, "Deep completion autoencoders for radio map estimation," IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1710–1724, 2021.

[24] R. Shrestha, T. N. Ha, P. Q. Viet, and D. Romero, "Radio map estimation in the real-world: Empirical validation and analysis," in 2023 IEEE Conf. on Antenna Measurements and Appl. (CAMA), Genoa, Italy, 2023, pp. 169–174.

[25] Z. Xiang, H. Zhang, J. Huang, S. Song, and K. C. Almeroth, "A hidden environment model for constructing indoor radio maps," in IEEE Int. Symp. World Wireless Mobile Multimedia Net., 2005, pp. 395–400.

[26] Y. Hu, W. Zhou, Z. Wen, Y. Sun, and B. Yin, "Efficient radio map construction based on low-rank approximation for indoor positioning," Math. Probl. Eng., vol. 2013, 2013.

[27] B. Yang, S. He, and S.-H. G. Chan, "Updating wireless signal map with Bayesian compressive sensing," in Proc. ACM Int. Conf. Mod., Anal. and Simu. Wireless and Mobile Sys., New York, NY, USA, 2016, MSWiM '16, pp. 310–317, Association for Computing Machinery.

[28] Q. Niu, Y. Nie, S. He, N. Liu, and X. Luo, "RecNet: A convolutional network for efficient radiomap reconstruction," in IEEE Int. Conf. Commun., 2018, pp. 1–7.

[29] M. Franceschetti, Wave Theory of Information, Cambridge University Press, 2018.

[30] D. Romero, S.-J. Kim, and G. B. Giannakis, "Stochastic semiparametric regression for spectrum cartography," in Proc. IEEE Int. Workshop Comput. Advan. Multi-Sensor Adapt. Process., Cancun, Mexico, Dec. 2015, pp. 513–516.

[31] W. K. Hayman and T. J. Lyons, "Bases for positive continuous functions," J. London Math. Society, vol. 2, no. 2, pp. 292–308, 1990.

[32] D. Romero, S.-J. Kim, G. B. Giannakis, and R. López-Valcarce, "Learning power spectrum maps from quantized power measurements," IEEE Trans. Signal Process., vol. 65, no. 10, pp. 2547–2560, May 2017.

[33] I. J. Schoenberg, "Metric spaces and completely monotone functions," Annals Mathematics, pp. 811–841, 1938.

[34] C. A. Micchelli, Y. Xu, and H. Zhang, "Universal kernels," J. Mach. Learn. Res., vol. 7, pp. 2651–2667, Dec. 2006.

[35] S. U. Pillai, T. Suel, and S. Cha, "The Perron-Frobenius theorem: some of its applications," IEEE Signal Processing Mag., vol. 22, no. 2, pp. 62–75, 2005.

[36] W. Rudin, Principles of mathematical analysis, 1953.

## 附录 A：定理 1 的证明

若条件 (C1) 与 (C2) 成立，则显然 $\mathcal G_{\mathrm{FS}}^{(d)}$ 包含集合

$$
\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}\triangleq\left\{\gamma\ \middle|\ \gamma(\mathbf r)=\sum_{s=1}^{S}\frac{\alpha_s}{\lVert\mathbf r-\acute{\mathbf r}_s\rVert^{2}+\beta^{2}},\ \acute{\mathbf r}_s\in R^{(d)},\ \alpha_s\ge0,\ S\in\mathbb N\right\}.\tag{33}
$$

**引理 2**　对任意 $\beta^{2}>0$，$\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}$ 是核为

$$
\kappa(\mathbf r,\mathbf r')\triangleq\frac{1}{\lVert\mathbf r-\mathbf r'\rVert^{2}+\beta^{2}}\tag{34}
$$

的再生核 Hilbert 空间（RKHS）；此外 $\kappa$ 是通用的（universal）。

**证明：** 文献 [33] 已证明：若 $g$ 可写为

$$
g(t)=\int_{\mathbb R_{+}}e^{-t\sigma}\,\mathrm d\mu(\sigma)\tag{35}
$$

（其中 $\mu$ 为某有限 Borel 测度），则形如 $\kappa(\mathbf r,\mathbf r')=g(\lVert\mathbf r-\mathbf r'\rVert^{2})$ 的函数是正定核。注意式 (34) 中 $g(t)=1/(t+\beta^{2})$，选取 $\mu$ 使对所有 Borel 集 $B\subset\mathbb R_{+}$

$$
\mu(B)=\int_{B}e^{-\beta^{2}\sigma}\,\mathrm d\sigma,\tag{36}
$$

易见式 (34) 中的 $\kappa$ 满足式 (35)，因此是正定核。注意到

$$
\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}=\left\{\gamma\ \middle|\ \gamma(\mathbf r)=\sum_{s=1}^{S}\frac{\alpha_s}{\lVert\mathbf r-\acute{\mathbf r}_s\rVert^{2}+\beta^{2}},\ \acute{\mathbf r}_s\in R^{(d)},\ \alpha_s\in\mathbb C,\ S\in\mathbb N\right\},\tag{37}
$$

可见 $\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}$ 是以 $\kappa$ 为核的 RKHS。

最后注意，式 (34) 中 $\kappa$ 对应的 Borel 测度并不集中在零点（参见式 (36)）；于是由 [34, 定理 17] 得 $\kappa$ 是通用的。

由 $\kappa$ 的通用性，对任意 $\epsilon>0$ 与连续 $\gamma$，存在 $\bar\gamma\in\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}$ 使 $\sup_{\mathbf r\in R^{(d)}}|\gamma(\mathbf r)-\bar\gamma(\mathbf r)|<\epsilon/2$。由于 $\bar\gamma\in\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}$，存在 $\check\gamma\in\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}$ 使 $\sup_{\mathbf r\in R^{(d)}}|\bar\gamma(\mathbf r)-\check\gamma(\mathbf r)|<\epsilon/2$。此外，由于 $\gamma$ 取实值，

$$
\sup_{\mathbf r\in R^{(d)}}\left|\gamma(\mathbf r)-\operatorname{Re}\{\check\gamma(\mathbf r)\}\right|\le\sup_{\mathbf r\in R^{(d)}}|\gamma(\mathbf r)-\check\gamma(\mathbf r)|\tag{38a}
$$

$$
\le\sup_{\mathbf r\in R^{(d)}}|\gamma(\mathbf r)-\bar\gamma(\mathbf r)|+\sup_{\mathbf r\in R^{(d)}}|\bar\gamma(\mathbf r)-\check\gamma(\mathbf r)|\tag{38b}
$$

$$
\le\frac{\epsilon}{2}+\frac{\epsilon}{2}=\epsilon,\tag{38c}
$$

其中第二个不等式由三角不等式与 sup 的性质得到。

因此，只需把 $\operatorname{Re}\{\check\gamma\}$ 写成 $\mathcal G_{\mathrm{FS}}^{(d)}$ 中两个函数之差。为此注意，由于 $\check\gamma\in\operatorname{span}\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}$，由式 (37) 可知存在 $\acute{\mathbf r}_s\in R^{(d)}$、$\alpha_s\in\mathbb C$ 与 $S\in\mathbb N$ 使 $\check\gamma(\mathbf r)=\sum_{s=1}^{S}\alpha_s\kappa(\mathbf r,\acute{\mathbf r}_s)$。若 $\gamma^{+}$ 与 $\gamma^{-}$ 满足

$$
\gamma^{+}(\mathbf r)=\sum_{s=1}^{S}\max(0,\operatorname{Re}\{\alpha_s\})\kappa(\mathbf r,\acute{\mathbf r}_s)\tag{39a}
$$

$$
\gamma^{-}(\mathbf r)=\sum_{s=1}^{S}\max(0,-\operatorname{Re}\{\alpha_s\})\kappa(\mathbf r,\acute{\mathbf r}_s),\tag{39b}
$$

则易验证 $\gamma^{+},\gamma^{-}\in\mathcal G_{\mathrm{FS}}^{(d,\beta^{2})}\subset\mathcal G_{\mathrm{FS}}^{(d)}$ 且 $\gamma^{+}-\gamma^{-}=\operatorname{Re}\{\check\gamma\}$。把该表达式代入式 (38a) 即得式 (9)，证明完毕。$\square$

## 附录 B：引理 1 的证明

$$
|\gamma'(r_x)|=2\sum_{s=1}^{S}\frac{\alpha_s|\acute r_{x,s}-r_x|}{\left[(r_x-\acute r_{x,s})^{2}+\beta_s^{2}\right]^{2}}\tag{40a}
$$

$$
\le2\sum_{s=1}^{S}\sup_{\acute r_{x,s},r_x}\frac{\alpha_s|\acute r_{x,s}-r_x|}{\left[(r_x-\acute r_{x,s})^{2}+\beta_s^{2}\right]^{2}}\tag{40b}
$$

$$
=2\sum_{s=1}^{S}\sup_{x}\frac{\alpha_sx}{\left[x^{2}+\beta_s^{2}\right]^{2}}=\frac{3^{3/2}}{8}\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s^{3}}.\tag{40c}\ \square
$$

## 附录 C：定理 2 的证明

不失一般性假设 $r_x=0$、$\Delta r\ge0$。证明式 (14) 的上界，等价于：已知功率地图在 0 处取任意给定值 $g\in\mathbb R_{+}$ 时，求它在 $\Delta r$ 处可取值的上界。形式上即求

$$
\sup\left\{\gamma(\Delta r)\ \middle|\ \gamma\in\mathcal G_{\mathrm{FS}}^{(1)},\ \gamma(0)=g\right\}\tag{41}
$$

的上界。显然该上确界被

$$
\sup\left\{\gamma(\Delta r)\ \middle|\ \gamma\in\check{\mathcal G}_{\mathrm{FS}}^{(1)},\ \gamma(0)=g\right\}\tag{42}
$$

上界，其中 $\check{\mathcal G}_{\mathrm{FS}}^{(1)}$ 是任意满足 $\mathcal G_{\mathrm{FS}}^{(1)}\subset\check{\mathcal G}_{\mathrm{FS}}^{(1)}$ 的集合。由式 (4) 可知，若把 $\mathcal G_{\mathrm{FS}}^{(1)}$ 扩大为 $V^{(1)}=\mathbb R^{1}$ 且 $\eta_{\min}^{2}\in B([\acute r_x])$ 对所有 $\acute r_x$ 成立，则该条件满足。

由式 (10)，式 (42) 中的上确界可表述为如下问题的解：

$$
\underset{S,\{(\acute r_{x,s},\beta_s^{2},\alpha_s)\}_{s=1}^{S}}{\text{maximize}}\ \sum_{s=1}^{S}\frac{\alpha_s}{(\Delta r-\acute r_{x,s})^{2}+\beta_s^{2}}\tag{43a}
$$

$$
\text{s.t.}\quad\sum_{s=1}^{S}\frac{\alpha_s}{\acute r_{x,s}^{2}+\beta_s^{2}}=g,\qquad\beta_s\ge\eta_{\min}\ \forall s.\tag{43b}
$$

现在引入辅助变量 $g_1,g_2,\ldots,g_S$，把问题改写为

$$
\underset{S,\{g_s\}_{s=1}^{S},\{(\acute r_{x,s},\beta_s^{2},\alpha_s)\}_{s=1}^{S}}{\text{maximize}}\ \sum_{s=1}^{S}\frac{\alpha_s}{(\Delta r-\acute r_{x,s})^{2}+\beta_s^{2}}\tag{44a}
$$

$$
\text{s.t.}\quad\sum_{s=1}^{S}g_s=g,\qquad g_s=\frac{\alpha_s}{\acute r_{x,s}^{2}+\beta_s^{2}},\qquad\beta_s\ge\eta_{\min}\ \forall s.\tag{44b}
$$

先对 $\{(\acute r_{x,s},\beta_s^{2},\alpha_s)\}_{s=1}^{S}$ 优化，易见式 (44) 等价于

$$
\underset{S,\{g_s\}_{s=1}^{S}}{\text{maximize}}\ \sum_{s=1}^{S}g^{*}(g_s)\tag{45a}
$$

$$
\text{s.t.}\quad\sum_{s=1}^{S}g_s=g,\tag{45b}
$$

其中 $g^{*}(g_s)$ 是下述问题的最优值：

$$
\underset{\acute r_{x,s},\beta_s^{2},\alpha_s}{\text{maximize}}\ \frac{\alpha_s}{(\Delta r-\acute r_{x,s})^{2}+\beta_s^{2}}\tag{46a}
$$

$$
\text{s.t.}\quad g_s=\frac{\alpha_s}{\acute r_{x,s}^{2}+\beta_s^{2}},\qquad\beta_s\ge\eta_{\min}\ \forall s.\tag{46b}
$$

为求解式 (46)，先对 $\alpha_s$ 优化，得

$$
\underset{\acute r_{x,s},\beta_s^{2}}{\text{maximize}}\ \frac{g_s(\acute r_{x,s}^{2}+\beta_s^{2})}{(\Delta r-\acute r_{x,s})^{2}+\beta_s^{2}}\tag{47a}
$$

$$
\text{s.t.}\quad\beta_s\ge\eta_{\min}.\tag{47b}
$$

令目标关于 $\acute r_{x,s}$ 的导数为零，得

$$
\acute r_{x,s}=\frac{\Delta r\pm\sqrt{\Delta r^{2}+4\beta_s^{2}}}{2}.\tag{48}
$$

取 $+$ 的解为最大值，取 $-$ 的解为最小值。把前者代入式 (47) 得

$$
g^{*}(g_s)=g_s\sup_{\beta_s\ge\eta_{\min}}\frac{\left(\Delta r+\sqrt{\Delta r^{2}+4\beta_s^{2}}\right)^{2}+4\beta_s^{2}}{\left(\Delta r-\sqrt{\Delta r^{2}+4\beta_s^{2}}\right)^{2}+4\beta_s^{2}}.\tag{49a}
$$

令 $b=\sqrt{\Delta r^{2}+4\beta_s^{2}}/\Delta r$，得

$$
g^{*}(g_s)=g_s\sup_{b\ge c(\Delta r)}\frac{(\Delta r+b\Delta r)^{2}+\Delta r^{2}(b^{2}-1)}{(\Delta r-b\Delta r)^{2}+\Delta r^{2}(b^{2}-1)}\tag{50a}
$$

$$
=g_s\sup_{b\ge c(\Delta r)}\frac{b+1}{b-1}=g_s\frac{c(\Delta r)+1}{c(\Delta r)-1}.\tag{50b}
$$

把式 (50b) 代入式 (45) 并利用式 (45b)，得到的问题不依赖 $S$ 与 $\{g_s\}_{s=1}^{S}$，其最优值即式 (14) 中所需的上界。式 (14) 的下界可通过类似推理得到。要说明界是紧的，只需注意当 $\mathcal G_{\mathrm{FS}}^{(1)}=\check{\mathcal G}_{\mathrm{FS}}^{(1)}$ 时式 (41) 等于式 (42)。$\square$

## 附录 D：定理 3 的证明

先考虑下述结果，它给出 $\gamma$ 的傅里叶变换的显式形式。

**引理 3**　成立

$$
\Gamma(k_x)=\pi\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s}e^{-jk_x\acute r_{x,s}}e^{-\beta_s|k_x|}.\tag{51}
$$

**证明：** 易证对任意 $a>0$，

$$
\mathcal F\left\{\frac{2a}{r_x^{2}+a^{2}}\right\}=2\pi e^{-a|k_x|},\tag{52}
$$

其中 $\mathcal F$ 表示傅里叶变换。因此

$$
\Gamma(k_x)\triangleq\mathcal F\{\gamma(r_x)\}\tag{53a}
$$

$$
=\mathcal F\left\{\sum_{s=1}^{S}\frac{\alpha_s}{(r_x-\acute r_{x,s})^{2}+\beta_s^{2}}\right\}\tag{53b}
$$

$$
=\sum_{s=1}^{S}e^{-jk_x\acute r_{x,s}}\mathcal F\left\{\frac{\alpha_s}{r_x^{2}+\beta_s^{2}}\right\}\tag{53c}
$$

$$
=\pi\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s}e^{-jk_x\acute r_{x,s}}e^{-\beta_s|k_x|}.\tag{53d}
$$

由引理 3 得

$$
|\Gamma(k_x)|=\left|\pi\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s}e^{-jk_x\acute r_{x,s}}e^{-\beta_s|k_x|}\right|\tag{54a}
$$

$$
\le\pi\sum_{s=1}^{S}\left|\frac{\alpha_s}{\beta_s}e^{-jk_x\acute r_{x,s}}e^{-\beta_s|k_x|}\right|\tag{54b}
$$

$$
=\pi\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s}e^{-\beta_s|k_x|}\le\left[\frac{\pi}{\beta_{\min}}\sum_{s=1}^{S}\alpha_s\right]e^{-\beta_{\min}|k_x|},\tag{54c}
$$

即式 (17a)。$\gamma$ 的高频能量可上界为

$$
\int_{B}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x=\int_{B}^{\infty}\left|\pi\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s}e^{-jk_x\acute r_{x,s}}e^{-\beta_s|k_x|}\right|^{2}\,\mathrm dk_x\tag{55a}
$$

$$
\le\pi^{2}\int_{B}^{\infty}\left[\sum_{s=1}^{S}\left|\frac{\alpha_s}{\beta_s}e^{-jk_x\acute r_{x,s}}e^{-\beta_s|k_x|}\right|\right]^{2}\mathrm dk_x\tag{55b}
$$

$$
=\pi^{2}\int_{B}^{\infty}\left[\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s}e^{-\beta_sk_x}\right]^{2}\mathrm dk_x\tag{55c}
$$

$$
=\pi^{2}\sum_{s=1}^{S}\sum_{s'=1}^{S}\frac{\alpha_s}{\beta_s}\frac{\alpha_{s'}}{\beta_{s'}}\int_{B}^{\infty}e^{-(\beta_s+\beta_{s'})k_x}\,\mathrm dk_x\tag{55d}
$$

$$
=\pi^{2}\sum_{s=1}^{S}\sum_{s'=1}^{S}\frac{\alpha_s}{\beta_s}\frac{\alpha_{s'}}{\beta_{s'}}\frac{e^{-(\beta_s+\beta_{s'})B}}{\beta_s+\beta_{s'}}\tag{55e}
$$

$$
=\pi^{2}\mathbf v^{\top}\mathbf A\mathbf v,\tag{55f}
$$

其中 $\mathbf v\triangleq[\alpha_1/\beta_1;\ldots;\alpha_S/\beta_S]$，$S\times S$ 矩阵 $\mathbf A$ 的第 $(s,s')$ 元为 $A_{s,s'}\triangleq e^{-(\beta_s+\beta_{s'})B}/(\beta_s+\beta_{s'})$。由于 $\mathbf A$ 对称，其特征值为实数，特别地最大特征值 $\lambda_{\max}(\mathbf A)$ 为实数。由于 $\mathbf A$ 全部元素为正，必有 $\lambda_{\max}(\mathbf A)>0$ 且

$$
\int_{B}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\le\pi^{2}\lVert\mathbf v\rVert^{2}\lambda_{\max}(\mathbf A).\tag{56a}
$$

此外，由于 $\mathbf A$ 全部元素为正，$\lambda_{\max}(\mathbf A)$ 是 Perron–Frobenius 特征值，因此满足 [35, 式 (2)]：$\lambda_{\max}(\mathbf A)\le\max_s\sum_{s'}A_{s,s'}$。由此得

$$
\int_{B}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\le\frac{\pi^{2}S\sum_{s=1}^{S}\alpha_s^{2}}{2\beta_{\min}^{3}}e^{-2\beta_{\min}B},\tag{57a}
$$

即式 (17b)。

最后，为给总能量上界，注意

$$
\int_{0}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x=\frac{1}{2}\int_{-\infty}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\tag{58a}
$$

$$
=\pi\int_{-\infty}^{\infty}|\gamma(r_x)|^{2}\,\mathrm dr_x\tag{58b}
$$

$$
\ge\pi\int_{-\infty}^{\infty}\left|\sum_{s=1}^{S}\frac{\alpha_s}{(r_x-\acute r_{x,s})^{2}+\beta_s^{2}}\right|^{2}\mathrm dr_x\tag{58c}
$$

$$
=\pi\sum_{s=1}^{S}\int_{-\infty}^{\infty}\left[\frac{\alpha_s}{r_x^{2}+\beta_s^{2}}\right]^{2}\mathrm dr_x.\tag{58d}
$$

易验证对任意 $a\ne0$，

$$
\int\frac{1}{(r_x^{2}+a^{2})^{2}}\,\mathrm dr_x=\frac{1}{2a^{2}}\left[\frac{r_x}{r_x^{2}+a^{2}}+\frac{1}{a}\arctan\left(\frac{r_x}{a}\right)\right].\tag{59}
$$

因此

$$
\int_{0}^{\infty}|\Gamma(k_x)|^{2}\,\mathrm dk_x\ge\pi\sum_{s=1}^{S}\frac{\alpha_s^{2}}{2\beta_s^{2}}\left[\frac{r_x}{r_x^{2}+\beta_s^{2}}+\frac{1}{\beta_s}\arctan\left(\frac{r_x}{\beta_s}\right)\right]_{-\infty}^{\infty}\tag{60a}
$$

$$
=\pi\sum_{s=1}^{S}\frac{\alpha_s^{2}}{2\beta_s^{2}}\frac{\pi}{\beta_s}=\frac{\pi^{2}}{2}\sum_{s=1}^{S}\frac{\alpha_s^{2}}{\beta_s^{3}},\tag{60b}
$$

即式 (17c)。$\square$

## 附录 E：定理 4 的证明

令

$$
m\triangleq\frac{3^{3/2}}{8}\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s^{3}}\tag{61}
$$

为式 (11) 给出的 $\gamma$ 导数上界。为证明定理 4，先建立下述结果较方便。

**引理 4**　若 $r_x\in[r_n,r_{n+1}]$，则

$$
\max\left[-m(r_x-r_n),\ -m(r_{n+1}-r_x)+\Delta\gamma_n\right]\tag{62a}
$$

$$
\le\gamma(r_x)-\gamma_n\tag{62b}
$$

$$
\le\min\left[m(r_x-r_n),\ m(r_{n+1}-r_x)+\Delta\gamma_n\right],\tag{62c}
$$

其中 $\Delta\gamma_n\triangleq\gamma(r_{n+1})-\gamma(r_n)$。

**证明：** 由于 $\gamma$ 可微，由中值定理 [36, 定理 5.10] 可知，对任意 $\overleftarrow r_x<\overrightarrow r_x$，

$$
\exists r_x\in(\overleftarrow r_x,\overrightarrow r_x)\ \middle|\ \gamma'(r_x)=\frac{\gamma(\overrightarrow r_x)-\gamma(\overleftarrow r_x)}{\overrightarrow r_x-\overleftarrow r_x}.\tag{63}
$$

由 $|\gamma'(r_x)|\le m$ 得，对所有 $\overleftarrow r_x<\overrightarrow r_x$，

$$
\left|\frac{\gamma(\overrightarrow r_x)-\gamma(\overleftarrow r_x)}{\overrightarrow r_x-\overleftarrow r_x}\right|\le m.\tag{64}
$$

令 $\overleftarrow r_x=r_n$、$\overrightarrow r_x=r_x>r_n$，得 $|\gamma(r_x)-\gamma(r_n)|\le m(r_x-r_n)$，或等价地

$$
-m(r_x-r_n)\le\gamma(r_x)-\gamma(r_n)\le m(r_x-r_n).\tag{65}
$$

另一方面，令 $\overrightarrow r_x=r_{n+1}$、$\overleftarrow r_x=r_x<r_{n+1}$，得 $|\gamma(r_{n+1})-\gamma(r_x)|\le m(r_{n+1}-r_x)$，也可写为

$$
-m(r_{n+1}-r_x)+\Delta\gamma_n\le\gamma(r_x)-\gamma(r_n)\tag{66a}
$$

$$
\le m(r_{n+1}-r_x)+\Delta\gamma_n.\tag{66b}
$$

合并 (65) 与 (66a) 即得 $r_x\in(r_n,r_{n+1})$ 时的 (62)；$r_x=r_n$ 与 $r_x=r_{n+1}$ 的情形由连续性得到。$\square$

为证明定理 4，先建立下述结果同样较方便。

**引理 5**　设 $0\le a\le b$、$\Delta\in\mathbb R$，则

$$
\max\left[\min(a,b-\Delta),\ \min(a,b+\Delta)\right]=a.\tag{67}
$$

**证明：** 分以下情形：(C1) $\Delta\le-b+a$：此时显然 $b-\Delta\ge2b-a\ge a$，故 $\min(a,b-\Delta)=a$；另一方面 $b+\Delta\le a$，故 $\min(a,b+\Delta)=b+\Delta$。于是 (67) 左端为 $\max[a,b+\Delta]=a$。(C2) $-b+a\le\Delta\le b-a$：由 $b-\Delta\ge a$ 得 $\min(a,b-\Delta)=a$；又 $b+\Delta\ge a$，故 $\min(a,b+\Delta)=a$。于是 (67) 左端为 $\max[a,a]=a$。(C3) $\Delta\ge b-a$：由 $b-\Delta\le a$ 得 $\min(a,b-\Delta)=b-\Delta$；由 $b+\Delta\ge2b-a\ge a$ 得 $\min(a,b+\Delta)=a$。于是 (67) 左端为 $\max[b-\Delta,a]=a$。至此 (67) 对 $\Delta$ 的所有取值均已证明，证毕。$\square$

对 $r_x\in[r_n,r_{n+1}]$，最近邻插值器为

$$
\widehat\gamma(r_n)\triangleq\begin{cases}\gamma_n & \text{若 } r_x\le\tilde r_n\\ \gamma_{n+1} & \text{若 } r_x\ge\tilde r_n,\end{cases}\tag{68}
$$

其中 $\tilde r_n\triangleq(r_n+r_{n+1})/2$。由 (62) 以及 $a\le x\le b\Rightarrow|x|\le\max(-a,b)$ 可得，对 $r_x\in[r_n,\tilde r_n]$，

$$
|\gamma(r_x)-\gamma_n|\le\max\left[\min\left[m(r_x-r_n),m(r_{n+1}-r_x)-\Delta\gamma_n\right],\ \min\left[m(r_x-r_n),m(r_{n+1}-r_x)+\Delta\gamma_n\right]\right].\tag{69a}
$$

应用引理 5 即得

$$
|\gamma(r_x)-\gamma_n|\le m(r_x-r_n),\qquad\forall\Delta r_n.\tag{70}
$$

类似地，对 $r_x\in[\tilde r_n,r_{n+1}]$ 可得

$$
|\gamma(r_x)-\gamma_{n+1}|\le m(r_{n+1}-r_x),\qquad\forall\Delta r_n.\tag{71a}
$$

于是合并 (70) 与 (71a) 得

$$
|\gamma(r_x)-\widehat\gamma(r_x)|\le\begin{cases}m(r_x-r_n) & \text{若 } r_n\le r_x<\tilde r_n\\ m(r_{n+1}-r_x) & \text{若 } \tilde r_n\le r_x\le r_{n+1}.\end{cases}\tag{72a}
$$

下一步是给 $L_1$ 误差上界。利用上述表达式可得

$$
\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|\,\mathrm dr_x\le\int_{r_n}^{\tilde r_n}|m(r_x-r_n)|\,\mathrm dr_x+\int_{\tilde r_n}^{r_{n+1}}|m(r_{n+1}-r_x)|\,\mathrm dr_x\tag{73a}
$$

$$
=\frac{m}{2}\left[(\tilde r_n-r_n)^{2}+(r_{n+1}-\tilde r_n)^{2}\right]\tag{73b}
$$

$$
=\frac{m\Delta r_n^{2}}{4}.\tag{73c}
$$

把该界在 $N-1$ 个区间上求和得

$$
\lVert\gamma-\widehat\gamma\rVert_1\le\sum_{n=1}^{N-1}\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|\,\mathrm dr_x\le\frac{m}{4}\sum_{n=1}^{N-1}\Delta r_n^{2},\tag{74}
$$

再结合式 (61) 即得式 (22a)。

对 $L_2$ 误差可写

$$
\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|^{2}\,\mathrm dr_x\le\int_{r_n}^{\tilde r_n}m^{2}(r_x-r_n)^{2}\,\mathrm dr_x+\int_{\tilde r_n}^{r_{n+1}}m^{2}(r_{n+1}-r_x)^{2}\,\mathrm dr_x\tag{75a}
$$

$$
=\frac{m^{2}}{3}\left[(\tilde r_n-r_n)^{3}+(r_{n+1}-\tilde r_n)^{3}\right]\tag{75b}
$$

$$
=\frac{m^{2}\Delta r_n^{3}}{12}.\tag{75c}
$$

把该界在 $N-1$ 个区间上求和得

$$
\lVert\gamma-\widehat\gamma\rVert_2^{2}\le\int_{r_1}^{r_N}|\gamma(r_x)-\widehat\gamma(r_x)|^{2}\,\mathrm dr_x\le\frac{m^{2}}{12}\sum_{n=1}^{N-1}\Delta r_n^{3},\tag{76}
$$

代入式 (61) 即得式 (22b)。

最后对 $L_\infty$ 误差有

$$
\lVert\gamma-\widehat\gamma\rVert_\infty=\sup_{r_x\in[r_1,r_N)}|\gamma(r_x)-\widehat\gamma(r_x)|\tag{77a}
$$

$$
\le\max_n\left[\max\left(\sup_{r_x\in[r_n,\tilde r_n]}m(r_x-r_n),\ \sup_{r_x\in[\tilde r_n,r_{n+1}]}m(r_{n+1}-r_x)\right)\right]\tag{77b}
$$

$$
=\max_n\left[\max\left(m(\tilde r_n-r_n),\ m(r_{n+1}-\tilde r_n)\right)\right]\tag{77c}
$$

$$
=\frac{m}{2}\max_n\Delta r_n,\tag{77d}
$$

结合式 (61) 即得式 (22c)。$\square$

## 附录 F：定理 5 的证明

利用引理 4 可证明下述结果。

**引理 6**　由式 (26) 定义的估计器 $\widehat\gamma$ 满足

$$
\lVert\gamma-\widehat\gamma\rVert_1\le\frac{9}{32}m\sum_{n=1}^{N-1}\Delta r_n^{2}\tag{78a}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_2^{2}\le\frac{16\sqrt{2}-13}{96}m^{2}\sum_{n=1}^{N-1}\Delta r_n^{3}\tag{78b}
$$

$$
\lVert\gamma-\widehat\gamma\rVert_\infty\le\frac{m}{2}\max_n\Delta r_n.\tag{78c}
$$

**证明：** 由 (62) 可知，对 $r_x\in[r_n,r_{n+1}]$，

$$
f_n^{(l)}(r_x)\le\gamma(r_x)-\widehat\gamma(r_x)\le f_n^{(u)}(r_x),\tag{79}
$$

其中

$$
f_n^{(l)}(r_x)\triangleq-\min\left[m(r_x-r_n),m(r_{n+1}-r_x)-\Delta\gamma_n\right]-\frac{\Delta\gamma_n}{\Delta r_n}(r_x-r_n)\tag{80a}
$$

$$
f_n^{(u)}(r_x)\triangleq\min\left[m(r_x-r_n),m(r_{n+1}-r_x)+\Delta\gamma_n\right]-\frac{\Delta\gamma_n}{\Delta r_n}(r_x-r_n).\tag{80b}
$$

令 $\tilde r_n\triangleq(r_n+r_{n+1})/2$，则易验证 $f_n^{(u)}(r_x)=f_n(r_x;\Delta\gamma_n)$、$f_n^{(l)}(r_x)=-f_n(r_x;-\Delta\gamma_n)$，其中

$$
f_n(r_x;\Delta\gamma_n)\triangleq\begin{cases}\left(m-\frac{\Delta\gamma_n}{\Delta r_n}\right)(r_x-r_n) & \text{若 } r_n\le r_x<\tilde r_n+\Delta\gamma_n/2m\\[2pt] \left(m+\frac{\Delta\gamma_n}{\Delta r_n}\right)(r_{n+1}-r_x) & \text{若 } \tilde r_n+\Delta\gamma_n/2m\le r_x<r_{n+1}.\end{cases}\tag{81}
$$

易证式 (81) 中两个系数 $m-\Delta\gamma_n/\Delta r_n$ 与 $m+\Delta\gamma_n/\Delta r_n$ 均非负（只需在 (64) 中令 $\overleftarrow r_x=r_n$、$\overrightarrow r_x=r_{n+1}$，注意 $|\Delta\gamma_n|\le\Delta r_nm$）。

由于 $a\le x\le b$ 蕴含 $|x|\le\max(-a,b)$，由 (79) 得，对所有 $r_x\in[r_n,r_{n+1}]$，

$$
|\gamma(r_x)-\widehat\gamma(r_x)|\le\max\left[-f_n^{(l)}(r_x),f_n^{(u)}(r_x)\right]\tag{82a}
$$

$$
=\max\left[f_n(r_x;-\Delta\gamma_n),f_n(r_x;\Delta\gamma_n)\right]\tag{82b}
$$

$$
=\max\left[f_n(r_x;-|\Delta\gamma_n|),f_n(r_x;|\Delta\gamma_n|)\right]\triangleq\tilde f_n(r_x).\tag{82c}
$$

利用 (81) 也易验证 $f_n(r_x;\Delta\gamma_n)=f_n(2\tilde r_n-r_x;-\Delta\gamma_n)$；因此由 (82) 易见 $\tilde f_n(2\tilde r_n-r_x)=\tilde f_n(r_x)$。于是 (82) 可等价地写为

$$
|\gamma(r_x)-\widehat\gamma(r_x)|\le\begin{cases}\tilde f_n(r_x) & \text{若 } r_n\le r_x<\tilde r_n\\ \tilde f_n(2\tilde r_n-r_x) & \text{若 } \tilde r_n\le r_x<r_{n+1}.\end{cases}\tag{83a}
$$

注意 $r_x\in[\tilde r_n,r_{n+1}]$ 当且仅当 $2\tilde r_n-r_x\in[r_n,\tilde r_n]$，因此只需在 $r_x\in[r_n,\tilde r_n]$ 上考虑 $\tilde f_n(r_x)$；在该区间内易见 $\tilde f_n(r_x)=f_n(r_x;-|\Delta\gamma_n|)$。

下一步是给 $L_1$ 误差上界。利用上述表达式得

$$
\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|\,\mathrm dr_x\le\int_{r_n}^{\tilde r_n}\tilde f_n(r_x)\,\mathrm dr_x+\int_{\tilde r_n}^{r_{n+1}}\tilde f_n(2\tilde r_n-r_x)\,\mathrm dr_x\tag{84a}
$$

$$
=2\int_{r_n}^{\tilde r_n}\tilde f_n(r_x)\,\mathrm dr_x=2\int_{r_n}^{\tilde r_n}f_n(r_x;-|\Delta\gamma_n|)\,\mathrm dr_x\tag{84b}
$$

$$
=2\int_{r_n}^{\tilde r_n-|\Delta\gamma_n|/2m}f_n(r_x;-|\Delta\gamma_n|)\,\mathrm dr_x\tag{84c}
$$

$$
+2\int_{\tilde r_n-|\Delta\gamma_n|/2m}^{\tilde r_n}f_n(r_x;-|\Delta\gamma_n|)\,\mathrm dr_x\tag{84d}
$$

$$
=\frac{m^{2}\Delta r_n^{2}+m\Delta r_n|\Delta\gamma_n|-2|\Delta\gamma_n|^{2}}{4m}.\tag{84e}
$$

该式在 $|\Delta\gamma_n|=m\Delta r_n/4$ 时取最大，给出

$$
\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|\,\mathrm dr_x\le\frac{9}{32}m\Delta r_n^{2}.\tag{85}
$$

把该界在 $N-1$ 个区间上求和得

$$
\int_{r_1}^{r_N}|\gamma(r_x)-\widehat\gamma(r_x)|\,\mathrm dr_x\le\frac{9}{32}m\sum_{n=1}^{N-1}\Delta r_n^{2},\tag{86}
$$

即式 (78a)。

至于 $L_2$ 误差，可写

$$
\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|^{2}\,\mathrm dr_x\le\int_{r_n}^{\tilde r_n}\tilde f_n^{2}(r_x)\,\mathrm dr_x+\int_{\tilde r_n}^{r_{n+1}}\tilde f_n^{2}(2\tilde r_n-r_x)\,\mathrm dr_x\tag{87a}
$$

$$
=2\int_{r_n}^{\tilde r_n}\tilde f_n^{2}(r_x)\,\mathrm dr_x=2\int_{r_n}^{\tilde r_n}f_n^{2}(r_x;-|\Delta\gamma_n|)\,\mathrm dr_x\tag{87b}
$$

$$
=\frac{\Delta r_n^{3}m^{2}}{12}(1-\xi_n)^{2}(1+4\xi_n+2\xi_n^{2}),\tag{87c}
$$

其中 $\xi_n\triangleq|\Delta\gamma_n|/(m\Delta r_n)$。在 $\xi_n\in[0,1]$ 约束下，该式在 $\xi_n=\xi_n^{*}\triangleq(-1+\sqrt{2})/2$ 时取最大，给出

$$
\int_{r_n}^{r_{n+1}}|\gamma(r_x)-\widehat\gamma(r_x)|^{2}\,\mathrm dr_x\le\frac{16\sqrt{2}-13}{96}\Delta r_n^{3}m^{2}.\tag{88a}
$$

把该误差在 $N-1$ 个区间上求和即证 (78b)。

最后，对 $L_\infty$ 误差注意

$$
\sup_{r_x\in[r_n,r_{n+1})}|\gamma(r_x)-\widehat\gamma(r_x)|\tag{89a}
$$

$$
=\max\left[\sup_{r_x\in[r_n,\tilde r_n)}|\gamma(r_x)-\widehat\gamma(r_x)|,\ \sup_{r_x\in[\tilde r_n,r_{n+1})}|\gamma(r_x)-\widehat\gamma(r_x)|\right]\tag{89b}
$$

$$
\le\max\left[\sup_{r_x\in[r_n,\tilde r_n)}\tilde f_n(r_x),\ \sup_{r_x\in[\tilde r_n,r_{n+1})}\tilde f_n(2\tilde r_n-r_x)\right]\tag{89c}
$$

$$
=\frac{m^{2}\Delta r_n^{2}-|\Delta\gamma_n|^{2}}{2m\Delta r_n}\le\frac{m\Delta r_n}{2}.\tag{89d}
$$

把所有区间上的该界合并即证 (78c)。最后，把 (78) 与 (61) 合并即完成证明。$\square$

## 附录 G：定理 6 的证明

**引理 7**　令 $\gamma[n]\triangleq\gamma(n\Delta r)$ 且

$$
\widehat\gamma(r_x)\triangleq\sum_{n=-\infty}^{\infty}\gamma[n]\operatorname{sinc}\left(\frac{r_x-n\Delta r}{\Delta r}\right),\tag{90}
$$

则

$$
E\triangleq\int_{-\infty}^{\infty}|\gamma(r_x)-\widehat\gamma(r_x)|^{2}\,\mathrm dr_x\tag{91a}
$$

$$
=\frac{1}{2\pi}\sum_{m=-\infty,m\ne0}^{\infty}\int_{-\infty}^{\infty}|\Gamma_m(k_x)|^{2}\,\mathrm dk_x\tag{91b}
$$

$$
+\frac{1}{2\pi}\int_{-\infty}^{\infty}\left|\sum_{m=-\infty,m\ne0}^{\infty}\Gamma_m(k_x)\right|^{2}\mathrm dk_x,\tag{91c}
$$

其中

$$
\Gamma_m(k_x)\triangleq\begin{cases}\Gamma\left(k_x+m\dfrac{2\pi}{\Delta r}\right) & \text{若 } k_x\in\left[-\dfrac{\pi}{\Delta r},\dfrac{\pi}{\Delta r}\right)\\[2pt] 0 & \text{其他}.\end{cases}\tag{92}
$$

**证明：** 由 Parseval 关系

$$
E=\frac{1}{2\pi}\int_{-\infty}^{\infty}\left|\Gamma(k_x)-\widehat\Gamma(k_x)\right|^{2}\mathrm dk_x.\tag{93}
$$

注意

$$
\widehat\gamma(r_x)=\sum_{n=-\infty}^{\infty}\gamma(r_x)\delta(r_x-n\Delta r)*\operatorname{sinc}\left(\frac{r_x}{\Delta r}\right).\tag{94a}
$$

在频域中：

$$
\widehat\Gamma(k_x)=\frac{1}{2\pi}\left[\Gamma(k_x)*\frac{2\pi}{\Delta r}\sum_{m=-\infty}^{\infty}\delta\left(k_x-m\frac{2\pi}{\Delta r}\right)\right]\tag{95}
$$

$$
\cdot\,\Delta r\cdot\Pi_{-\pi/\Delta r}^{\pi/\Delta r}(k_x),\tag{96}
$$

其中

$$
\Pi_a^b(k_x)\triangleq\begin{cases}1 & \text{若 } k_x\in[a,b)\\ 0 & \text{其他}.\end{cases}\tag{97}
$$

因此

$$
\widehat\Gamma(k_x)=\left[\sum_{m=-\infty}^{\infty}\Gamma\left(k_x-m\frac{2\pi}{\Delta r}\right)\right]\cdot\Pi_{-\pi/\Delta r}^{\pi/\Delta r}(k_x)\tag{98a}
$$

$$
=\sum_{m=-\infty}^{\infty}\Gamma_m(k_x).\tag{98b}
$$

另一方面，易见

$$
\Gamma(k_x)=\sum_{m=-\infty}^{\infty}\Gamma_m\left(k_x-m\frac{2\pi}{\Delta r}\right).\tag{99}
$$

把 (98b) 与 (99) 代入 (93) 得

$$
E=\frac{1}{2\pi}\int_{-\infty}^{\infty}\left|\sum_{m=-\infty,m\ne0}^{\infty}\Gamma_m\left(k_x-m\frac{2\pi}{\Delta r}\right)\right|^{2}\mathrm dk_x+\frac{1}{2\pi}\int_{-\infty}^{\infty}\left|\sum_{m=-\infty,m\ne0}^{\infty}\Gamma_m(k_x)\right|^{2}\mathrm dk_x\tag{100a}
$$

$$
=\frac{1}{2\pi}\sum_{m=-\infty,m\ne0}^{\infty}\int_{-\infty}^{\infty}|\Gamma_m(k_x)|^{2}\,\mathrm dk_x\tag{100b}
$$

$$
+\frac{1}{2\pi}\int_{-\infty}^{\infty}\left|\sum_{m=-\infty,m\ne0}^{\infty}\Gamma_m(k_x)\right|^{2}\mathrm dk_x.\tag{100c}
$$

对下述结果，考虑移位信号 $\phi^{(\nu)}(r_x)\triangleq\gamma(r_x-\nu)$ 及其重建

$$
\widehat\phi^{(\nu)}(r_x)\triangleq\sum_{n=-\infty}^{\infty}\phi^{(\nu)}(n\Delta r)\operatorname{sinc}\left(\frac{r_x-n\Delta r}{\Delta r}\right).\tag{101}
$$

**引理 8**　令

$$
E'(\nu)\triangleq\int_{-\infty}^{\infty}\left|\phi^{(\nu)}(r_x)-\widehat\phi^{(\nu)}(r_x)\right|^{2}\mathrm dr_x.\tag{102}
$$

则

$$
\bar E'\triangleq\frac{1}{\Delta r}\int_{0}^{\Delta r}E'(\nu)\,\mathrm d\nu=\frac{1}{\pi}\int_{\mathcal B}|\Gamma(k_x)|^{2}\,\mathrm dk_x,\tag{103}
$$

其中 $\mathcal B\triangleq(-\infty,-\pi/\Delta r]\cup[\pi/\Delta r,\infty)$。

**证明：** 令

$$
\Phi_m^{(\nu)}(k_x)\triangleq\begin{cases}\Phi^{(\nu)}\left(k_x+m\dfrac{2\pi}{\Delta r}\right) & \text{若 } k_x\in\left[-\dfrac{\pi}{\Delta r},\dfrac{\pi}{\Delta r}\right)\\[2pt] 0 & \text{其他}.\end{cases}\tag{104}
$$

由引理 7 可知

$$
E'(\nu)=E_1'(\nu)+E_2'(\nu),\tag{105}
$$

其中

$$
E_1'(\nu)\triangleq\frac{1}{2\pi}\sum_{m=-\infty,m\ne0}^{\infty}\int_{-\infty}^{\infty}\left|\Phi_m^{(\nu)}(k_x)\right|^{2}\mathrm dk_x\tag{106a}
$$

$$
E_2'(\nu)\triangleq\frac{1}{2\pi}\int_{-\infty}^{\infty}\left|\sum_{m=-\infty,m\ne0}^{\infty}\Phi_m^{(\nu)}(k_x)\right|^{2}\mathrm dk_x.\tag{106b}
$$

令 $\bar E_i'\triangleq(1/\Delta r)\int_{0}^{\Delta r}E_i'(\nu)\,\mathrm d\nu$，则

$$
\bar E'=\bar E_1'+\bar E_2'.\tag{107}
$$

注意 $\Phi^{(\nu)}(k_x)=e^{-jk_x\nu}\Gamma(k_x)$，故

$$
\Phi_m^{(\nu)}(k_x)=e^{-j\left(k_x+m\frac{2\pi}{\Delta r}\right)\nu}\Gamma_m(k_x).\tag{108a}
$$

由 (106a) 易见

$$
E_1'(\nu)=\frac{1}{2\pi}\int_{\mathcal B}|\Gamma(k_x)|^{2}\,\mathrm dk_x=\bar E_1'.\tag{109}
$$

另一方面，由 (106b) 得

$$
\bar E_2'=\frac{1}{2\pi\Delta r}\int_{-\infty}^{\infty}\int_{0}^{\Delta r}\left|\sum_{m=-\infty,m\ne0}^{\infty}e^{-jm\frac{2\pi}{\Delta r}\nu}\Gamma_m(k_x)\right|^{2}\mathrm d\nu\,\mathrm dk_x\tag{110}
$$

$$
=\frac{1}{(2\pi)^{2}}\int_{-\infty}^{\infty}\int_{0}^{2\pi}|\Psi(\theta,k_x)|^{2}\,\mathrm d\theta\,\mathrm dk_x,\tag{111}
$$

其中 $\Psi(\theta,k_x)\triangleq\sum_{m=-\infty,m\ne0}^{\infty}e^{-jm\theta}\Gamma_m(k_x)$ 是

$$
\psi_m(k_x)\triangleq\begin{cases}\Gamma_m(k_x) & \text{若 } m\ne0\\ 0 & \text{其他}\end{cases}\tag{112}
$$

的离散时间傅里叶变换。对 (111) 应用 Parseval 恒等式得

$$
\bar E_2'=\frac{1}{2\pi}\int_{-\infty}^{\infty}\sum_{m=-\infty}^{\infty}|\psi_m(k_x)|^{2}\,\mathrm dk_x\tag{113a}
$$

$$
=\frac{1}{2\pi}\int_{-\infty}^{\infty}\sum_{m=-\infty,m\ne0}^{\infty}|\Gamma_m(k_x)|^{2}\,\mathrm dk_x\tag{113b}
$$

$$
=\frac{1}{2\pi}\int_{\mathcal B}|\Gamma(k_x)|^{2}\,\mathrm dk_x.\tag{113c}
$$

把 (109) 与 (113c) 代入 (107) 即完成证明。最后，注意到 $\widehat\phi^{(\nu)}(r_x)=\widehat\gamma^{(-\nu)}(r_x-\nu)$，可见 (102) 中的 $E'(\nu)$ 等于 (29) 中的 $E(-\nu)$。由于两函数均以 $\Delta r$ 为周期，故 (103) 中的 $\bar E'$ 等于 (30) 中的 $\bar E$，证明完毕。$\square$

## 附录 H：任意路径损耗指数

本文结果是在自由空间传播（信道增益服从式 (1)）下得到的。在更复杂场景中，障碍物引入反射、衍射等传播现象，信道增益不再仅通过距离依赖收、发位置；但人们仍可能希望由链路距离预测其信道增益。为此常用技巧是在式 (1) 中把平方替换为经经验调整的常数 $\upsilon$，称为路径损耗指数。尽管所得表达式在物理上不准确，仍可问：本文结果能否推广到任意 $\upsilon$？答案在多数情形下是肯定的。例如，式 (10) 与 (11) 经此推广后变为

$$
\gamma(\mathbf r)=\gamma(r_x)=\sum_{s=1}^{S}\frac{\alpha_s}{\left[(r_x-\acute r_{x,s})^{2}+\beta_s^{2}\right]^{\upsilon/2}},\tag{114a}
$$

$$
|\gamma'(r_x)|\le\frac{(2\upsilon-1)^{\upsilon-1/2}}{2^{\upsilon-1}\upsilon^{\upsilon}}\sum_{s=1}^{S}\frac{\alpha_s}{\beta_s^{2\upsilon-1}}.\tag{114b}
$$

令 $m$ 等于式 (114b) 的右端，并按附录 E 与 F 的相同步骤，即可把零阶与一阶插值的误差界直接推广。另一方面，定理 3 中的变异性界与第 IV-C 节的误差界不易推广到任意路径损耗指数，这是由其中所用证明技巧的不同性质所致。

总之，本文部分结果可以推广到任意路径损耗指数，但这并不完全有意义，因为 $\upsilon\ne2$ 的模型在物理上并不准确。准确刻画实际传播现象的分析将留待未来工作。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2310.15106v4 的全文中文译稿，按原文结构译出：摘要与关键词、第 I 节引言（含相关工作、WTI 对比、论文结构与记号）、第 II 节无线电地图估计（功率地图与估计问题、自由空间功率地图、一维／二维限制）、第 III 节空间变异性（高变异性：定理 1 及讨论；低变异性：引理 1、定理 2、推论 1—2、空间带宽定理 3）、第 IV 节重建误差界（表 I、范数与接近系数、零阶／一阶／sinc 插值定理 4—6、注记 1）、第 V 节数值实验（误差界紧致性、射线追踪数据实验）、第 VI 节结论、图 1—图 9 图注、36 条英文参考文献与附录 A—H（含引理 2—8 与式 (33)—(114)）。公式覆盖原文式 (1)—(114)。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言前半）→ 第 2 页（引言后半、记号、第 II 节、式 (1)—(4)）→ 第 3 页（第 II-A／II-B 节、式 (5)—(8)）→ 第 4 页（第 III 节、定理 1、式 (9)—(10)）→ 第 5 页（引理 1、定理 2、式 (11)—(15)）→ 第 6 页（图 5、推论 1—2、定理 3、式 (16)—(18)）→ 第 7 页（表 I、式 (19)—(25)）→ 第 8 页（定理 5、定理 6、式 (26)—(31)、注记 1）→ 第 9 页（第 V-A 节、图 6—图 8 讨论、第 V-B 节）→ 第 10 页（图 9、式 (32)、第 VI 节结论）→ 第 10—11 页（参考文献 [1]—[36]）→ 第 11—13 页（附录 A—D，式 (33)—(60)）→ 第 14—16 页（附录 E—F，式 (61)—(89)）→ 第 16—17 页（附录 G，式 (90)—(113)）→ 第 17 页（附录 H，式 (114)）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；公式已按 PDF 文本层与第 1、7、14 页渲染图交叉核对（表 I、引理 4/5 的中值定理记号、式 (11)—(15)、(17)—(25)、(61)—(74) 等关键处逐项对照）。
2. 表 I 为源 PDF 第 7 页排版表格，文本层抽取后行列错位；本页表格依据该页渲染图像逐格转录（含各阶插值器表达式与全部误差界常数），未改变任何数值。
3. 原文对部分推导链采用分行编号（如式 (53a)—(53d)、(55a)—(55f)、(58a)—(58d)、(84a)—(84e)、(100a)—(100c)、(113a)—(113c) 等）。译文把每条推导链放在一个 `$$` 块内并标注基础编号或末尾编号，行文/编号处保留原编号范围的可追溯性；公式内容未改动。此为排版简化，不是内容删减。
4. 图 1—图 9 均未上传图片，仅提供中文图注与正文关键数值；图 6—图 9 的曲线不作数字化估算。
5. 附录 E 的中值定理与区间记号原文使用带上/下箭头标注的 $\overleftarrow r_x$、$\overrightarrow r_x$（在渲染图中为带箭头的 $r_x$），译文按该记号照录；文本层抽取中该符号为乱码，已按第 14 页渲染图核对。
6. **原文疑点：** 附录 E 的式 (73a) 与 (75a) 中，被积表达式外的绝对值／平方顺序与积分区间的写法在原文排版上略显紧凑（如 $\big|\int\ldots\big|$ 与 $\int|\ldots|$ 的混排）；译文按数学含义照录，未改公式结构。另第 V-A 节"第三个实验"中原文用 20 个偏移取平均以实现式 (31) 的平均误差，属于原文实验设置，照录。
7. 日期说明：页面目录日期 2026-10-04 为站点归档日期，与 arXiv 版本日期不同（v4 于 2024-03-23 发布；v1 于 2023 年 10 月提交），页首"版本"采用 v4 信息。
8. 版权：本文为 arXiv 预印本（cs.IT），本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
