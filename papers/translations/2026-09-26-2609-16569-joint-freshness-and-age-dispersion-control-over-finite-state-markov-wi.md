---
layout: page
title: "有限状态信道上的联合新鲜度与年龄离散控制｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-16569-joint-freshness-and-age-dispersion-control-over-finite-state-markov-wi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6cb8208e4ef11739/) · [原文 arXiv](https://arxiv.org/abs/2609.16569) · [全部目录](/papers/catalog/)

# 有限状态信道上的联合新鲜度与年龄离散控制

**原题：** Joint Freshness and Age-Dispersion Control over Finite-State Markov Wireless Channels  
**作者：** Aresh Dadlani、Hina Tabassum、Muthukrishnan Senthil Kumar、Masoumeh Moradian。单位：A. Dadlani 为加拿大皇家山大学计算科学与数学学院（Calgary, Canada）；H. Tabassum 为加拿大约克大学电气工程与计算机科学系（Toronto, Canada）；M. Senthil Kumar 为印度 PSG 理工学院应用数学与计算科学系（Coimbatore, India）；M. Moradian 为伊朗 K. N. Toosi 技术大学计算机工程学院（Tehran, Iran）。邮箱：adadlani@mtroyal.ca、hinat@yorku.ca、msk.amcs@psgtech.ac.in、mmoradian@kntu.ac.ir。  
**版本：** arXiv:2609.16569v1（eess.SY），2026 年 9 月 15 日提交，原文 6 页（IEEE 双栏期刊投稿格式，含图 1–5、表 I、定理 1–3、公式 (1)–(17)、参考文献 17 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VI 节（含 IV-A–C 全部小节；§III 与 §V 原文无子节）、结论、全部图注（图 1–5，含子图与矩阵面板说明）、表 I（逐格转录）、定理 1–3、公式 (1)–(17)（含 (14a)–(14d) 子式）与 17 条参考文献英文原条目；原文无附录、无作者简介；逐句逐式终校未做。

## 摘要

信息年龄（AoI）已成为时效性监测的标准设计目标，因为它度量接收端最新更新的新鲜度。然而在决策依赖连续观测的目标导向应用中，仅用 AoI 并不充分。**年龄离散（age dispersion）**通过度量连续更新之间的生成时间分隔来补充 AoI。本文研究以有限状态马尔可夫无线信道建模的、可任意生成（generate-at-will）状态更新链路上的联合新鲜度与离散控制。目标是在平均传输速率约束下，最小化 AoI 或年龄离散超出规定阈值的长期概率。对信道相关的随机化传输策略，我们推导了 AoI 与离散的稳态联合分布的精确矩阵表达式。对可逆信道，平均离散由送达吞吐量的倒数下界，且二者之差是一个显式的非负方差项，我们确立了其精确等号条件。随后，我们把自适应联合阈值控制问题表述为约束马尔可夫决策过程，并证明它存在**精确有限状态表示**，其规模随信道状态数与阈值水平数线性增长。仿真结果表明，在相同传输预算下，该控制器相对自适应 AoI 单目标控制把联合阈值违例降低 37.3%，同时使平均 AoI 增加 8.3%。

**关键词：** 信息年龄、年龄离散、有限状态马尔可夫信道、约束马尔可夫决策过程、无线状态更新。

## I. 引言

机器类通信（MTC）的格局已从容忍时延的遥测，演变为大规模感知与实时应用，如工业自动化、联网交通、远程医疗与沉浸式业务 [1]。这些应用依赖感知设备生成带时间戳的状态更新，供接收端进行监测、推断与控制。这一转变要求性能度量不仅刻画分组送达可靠性与时延，还要刻画接收信息在决策时刻的有用性。这类以目的端为中心的度量之一是信息年龄（AoI），它度量最近一次收到更新自其生成以来所经历的时间 [2]。

尽管 AoI 度量信息新鲜度，它只描述最近一次收到的更新。某些实时应用还取决于连续观测之间的时间间隔。例如，车辆监测器可能由最近两次位置报告估计速度或方向；即使最新报告是新鲜的，紧邻的上一份较旧报告也可能无法反映近期的加速、制动或转向。AoI 无法区分这些情形，因为它不含关于前一次更新的信息。**年龄离散**通过度量最近两次收到更新的生成时间分隔来弥补这一局限 [3]。二者结合，AoI 与年龄离散可判断接收端是否既有新鲜观测、又有两个在生成时间上足够接近的观测。

已有大量工作研究更新生成、分组管理与传输调度，以降低无线链路上的 AoI [4]–[6]。在资源约束下，相关研究考虑了多状态时变信道上的机会调度与功率限制 [7]、带自动重传请求（ARQ）与混合 ARQ 的传输控制 [8]，以及依赖 AoI 的分组抢占 [9]。有限状态马尔可夫模型常用于刻画分组级信道质量的时序相关性 [10]；相关工作还考察了无当前信道状态信息（CSI）情形下的 AoI 调度 [11]、时间相关衰落下的能量受限策略 [12]，以及 Gilbert–Elliott 擦除信道上的信道记忆效应 [13]。然而这些工作关注的是最近一次收到的更新，而非连续收到更新之间的时间分隔。

年龄离散带来不同的分析与控制问题。[3] 的作者首次在带概率抢占的 M/G/1/1 队列中研究该度量，并将其与高阶 AoI 相联系。在该模型的重生假设下，平均年龄离散退化为送达更新吞吐量的倒数。然而当信道记忆使连续送达间隔之间产生相关性时，该关系一般不再成立：具有相同平均送达吞吐量的无线信道可能产生不同的年龄离散与联合新鲜度–离散性能。其他研究考察了联合 AoI 分布 [14]、送达间隔均值与方差之间的折中 [15]，以及用于维持多信息流新鲜度与同步性的无线调度策略 [16]。然而，这些研究均未在预算受限、信道感知的传输控制下联合处理 AoI 与年龄离散。

本文研究可任意生成链路上、有限状态马尔可夫无线信道上的联合 AoI 与年龄离散控制。对信道感知传输策略，我们推导 AoI 与年龄离散稳态联合分布的精确矩阵表达式；展示信道记忆如何影响平均离散与联合阈值违例；对可逆信道证明平均离散至少为送达吞吐量的倒数，并给出等号成立条件。随后我们把联合控制问题表述为约束马尔可夫决策过程（CMDP），推导精确有限状态马尔可夫链（FSMC）模型，并在平均传输速率限制下通过线性规划（LP）获得最优平稳策略。仿真结果验证了分析，并展示了在不同信道记忆水平与传输预算下 AoI 与年龄离散之间的折中。

## II. 系统模型与目标

我们考虑图 1 所示的实时监测系统：单个传感器观测一个物理过程，并通过建模为 FSMC 的无线链路向接收端发送带时间戳的状态更新。时间被划分为单位长度时隙 $[t,t+1)$。信道状态信息（CSI）记为 $C_t\in\mathcal C$，按不可约、非周期马尔可夫链演化，状态数 $n=|\mathcal C|$，转移概率 $P_{cc'}=\Pr\{C_{t+1}=c'\mid C_t=c\}$，平稳行向量 $\boldsymbol\mu$ 满足 $\boldsymbol\mu\mathbf P=\boldsymbol\mu$。这些动态刻画了分组级信道质量的时序相关性。

在每个时隙 $t$ 开始，传感器观测 $C_t$ 并选择 $U_t\in\{0,1\}$，其中 $U_t=1$ 表示一次传输尝试。在这种可任意生成（generate-at-will）机制下，每次尝试都携带一个生成时间戳为 $t$ 的新鲜更新。信道状态 $c$ 下的一次传输以概率 $p_c\in(0,1)$ 成功送达，若成功则在 $t+1$ 被接收。失败更新被丢弃，不排队也不重传。信道演化与传输决策无关；给定信道状态序列时，各时隙的译码尝试相互独立。下一次决策前可获可靠的 ACK/NACK 反馈，因而传感器可重建接收端保留的时间戳。每次尝试消耗一单位传输代价，不含信道感知与反馈开销。设 $t_i$ 与 $t'_i=t_i+1$ 分别为第 $i$ 个成功送达更新的生成时间与接收时间，并令 $N(t)\triangleq\max\{i\mid t'_i\le t\}$。在已有两次送达更新后，时隙 $t$ 的 AoI（$\Delta_t$）与年龄离散（$D_t$）为

$$
\Delta_t=t-t_{N(t)},\qquad D_t=t_{N(t)}-t_{N(t)-1}. \tag{1}
$$

**图 1：** 有限状态马尔可夫信道上带 CSI 与 ACK/NACK 反馈的时隙化状态更新系统。

因此，$\Delta_t+D_t$ 是第二新更新的年龄。由于每次成功传输占用一个时隙，送达间隔 $Y_i=t'_i-t'_{i-1}=t_i-t_{i-1}$。于是在每个时隙边界，年龄动态为

$$
\left(\Delta_{t+1},D_{t+1}\right)=
\begin{cases}
(1,\Delta_t), & \text{时隙 } t \text{ 有传输},\\
(\Delta_t+1,D_t), & \text{否则}.
\end{cases} \tag{2}
$$

在送达 $i$ 之后的 $Y_{i+1}$ 个时隙边界期间，离散保持为 $Y_i$，而 AoI 依次取 $\{1,\dots,Y_{i+1}\}$。图 2 说明了为何一次成功送达虽恢复了新鲜度，却仍可能在连续时间戳之间留下大间隔。

**图 2：** AoI 与年龄离散的样本路径。时隙 $\{0,3,5,12,13,17\}$ 中的成功传输分别在边界 $\{1,4,6,13,14,18\}$ 被接收，初始保留时间戳为 −2。虚线表示 $(a_0,d_0)=(5,3)$，阴影标出违反任一阈值的边界。

接收端要求 $\Delta_t\le a_0$ 且 $D_t\le d_0$，其中 $a_0,d_0\ge1$ 为规定整数阈值。据此定义违例代价 $g(a,d)\triangleq\mathbf 1\{a>a_0\ \text{或}\ d>d_0\}$，其中 $\mathbf 1\{\cdot\}$ 为指示函数。因果传输策略 $\pi$ 可使用传感器处可获得的全部信息。其长期违例代价与平均传输速率为

$$
J_\pi=\limsup_{T\to\infty}\frac{1}{T}\sum_{t=0}^{T-1}\mathbb E_\pi\left[g\left(\Delta_t,D_t\right)\right],\qquad
U_\pi=\limsup_{T\to\infty}\frac{1}{T}\sum_{t=0}^{T-1}\mathbb E_\pi\left[U_t\right]. \tag{3}
$$

对平均传输速率限制 $R\in(0,1]$，控制目标表述为

$$
J^*(R)=\inf_{\pi\,\mid\,U_\pi\le R}J_\pi. \tag{4}
$$

在平稳遍历策略下，$J_\pi=\Pr_\pi\{\Delta>a_0\ \text{或}\ D>d_0\}$。因此该目标是在平均传输速率约束下，最小化违反新鲜度或离散要求的时隙边界占比。

## III. 信道记忆下的联合分布

我们首先分析平稳的信道相关随机化传输策略。当 $C_t=c$ 时，传感器以概率 $u_c\in[0,1]$ 尝试传输，且与既往传输决策及译码结果独立，因此策略只依赖当前 CSI。令 $h_c=u_cp_c$ 表示状态 $c$ 下的成功送达概率，并定义 $\mathbf h\triangleq(h_c)_{c\in\mathcal C}$。假定 $\mathbf h\ne\mathbf 0$，引入

$$
\mathbf Q=\mathbf P\,{\rm diag}(\mathbf 1-\mathbf h),\qquad
\mathbf W=\mathbf P\,{\rm diag}(\mathbf h),\qquad
\mathbf Z=(\mathbf I-\mathbf Q)^{-1}. \tag{5}
$$

$\mathbf Q$ 的第 $(c,c')$ 个元素是信道状态由 $c$ 转到 $c'$ 且下一时隙无送达的概率，而 $\mathbf W$ 的相应元素给出成功送达的概率。由于 $\mathbf P$ 不可约且 $\mathbf h$ 至少有一个正分量，送达最终以概率 1 发生，因此 $\mathbf Q$ 的谱半径满足 $\varrho(\mathbf Q)<1$。

给定在状态 $c$ 成功传输，下一次送达恰好发生在 $y\ge1$ 个时隙之后、且落在状态 $c'$ 的概率是 $\mathbf K_y=\mathbf Q^{y-1}\mathbf W$ 的 $(c,c')$ 元。于是连续送达时隙所观测到的信道状态构成嵌入马尔可夫链，其转移矩阵为 $\mathbf G=\sum_{y\ge1}\mathbf K_y=\mathbf Z\mathbf W$。现在令 $r=\boldsymbol\mu\mathbf h$、$\boldsymbol\nu=\boldsymbol\mu\,{\rm diag}(\mathbf h)/r$、$\mathbf m=\mathbf Z\mathbf 1$、$\bar y=\boldsymbol\nu\mathbf m=1/r$。这里 $r$ 为送达吞吐量，$\boldsymbol\nu$ 为送达时隙处的平稳信道分布，$m_c$ 为在状态 $c$ 发生当前送达时、距下一次送达的期望时间，$\bar y$ 为平均送达间隔。对整数 $a,d\ge1$，定义 $\mathbf K_{\le d}\triangleq\sum_{y=1}^{d}\mathbf K_y=(\mathbf I-\mathbf Q^d)\mathbf Z\mathbf W$ 与 $\mathbf m_a\triangleq\sum_{k=0}^{a-1}\mathbf Q^k\mathbf 1=(\mathbf I-\mathbf Q^a)\mathbf Z\mathbf 1$。可以证明，向量 $\mathbf m_a$ 本质上给出在上一送达信道状态条件下 $\min\{Y,a\}$ 的期望值。

**定理 1（稳态联合分布）.** 在平稳信道相关随机化传输策略下，任意平稳时隙边界处 AoI 与年龄离散的联合累积分布函数为

$$
\Pr\left\{\Delta\le a,\ D\le d\right\}
=\frac{\boldsymbol\nu\mathbf K_{\le d}\mathbf m_a}{\bar y}. \tag{6}
$$

相应的联合概率质量函数为

$$
\Pr\left\{\Delta=a,\ D=d\right\}
=\frac{\boldsymbol\nu\mathbf Q^{d-1}\mathbf W\mathbf Q^{a-1}\mathbf 1}{\bar y},
\qquad a,d\ge1. \tag{7}
$$

**证明：** 利用 $\boldsymbol\mu\mathbf P=\boldsymbol\mu$ 可得 $\boldsymbol\mu(\mathbf I-\mathbf Q)=\boldsymbol\mu\,{\rm diag}(\mathbf h)$，由此 $\boldsymbol\nu\mathbf G=\boldsymbol\nu$ 且 $\boldsymbol\nu\mathbf m=\frac{\boldsymbol\mu(\mathbf I-\mathbf Q)\mathbf Z\mathbf 1}{r}=\frac1r$。因此 $\boldsymbol\nu$ 是送达时刻链的平稳分布，平均送达间隔为 $\bar y=1/r$。

现在考虑从第 $i$ 次更新开始的送达周期。该周期内 $D=Y_i$，而 AoI 依次取 $\{1,\dots,Y_i+1\}$。因此同时满足 $\Delta\le a$ 与 $D\le d$ 的时隙边界数为 $\mathbf 1\{Y_i\le d\}\min\{Y_i+1,a\}$。从第 $i-1$ 次送达时的信道状态出发，矩阵 $\mathbf K_{\le d}$ 计入 $Y_i\le d$ 以及第 $i$ 次送达时的信道状态，而 $\mathbf m_a$ 给出下一周期中的期望合格边界数；于是期望回报为 $\boldsymbol\nu\mathbf K_{\le d}\mathbf m_a$。用平均周期长度 $\bar y$ 一除即得 (6)。对 $a$ 与 $d$ 取有限差分即得 (7)。$\square$

边缘分布可由 (6) 令另一阈值趋于无穷得到。长度为 $Y$ 的送达间隔内累积的 AoI 为 $Y(Y+1)/2$；利用 $\sum_{k\ge0}(k+1)\mathbf Q^k=\mathbf Z^2$ 可得

$$
\bar\Delta=\frac{\boldsymbol\nu\mathbf Z^2\mathbf 1}{\bar y}. \tag{8}
$$

年龄离散在随后长度为 $Y_i+1$ 的区间内始终保持为 $Y_i$，故其周期回报为 $Y_iY_{i+1}$。由于 $\sum_{y\ge1}y\mathbf K_y=\mathbf Z^2\mathbf W$，得到

$$
\bar D=\frac{\boldsymbol\nu\mathbf Z^2\mathbf W\mathbf m}{\bar y}
=\bar y+\frac{{\rm Cov}\left(Y_i,Y_{i+1}\right)}{\bar y}. \tag{9}
$$

注意 (9) 的第一式来自更新–回报论证，第二式则因两个送达间隔的均值均为 $\bar y$ 而成立。

当 $\mathbf P=\mathbf 1\boldsymbol\mu$ 时，信道状态逐时隙独立，成功送达构成概率为 $r$ 的 Bernoulli 过程。此时 $\Delta$ 与 $D$ 是 $\{1,2,\dots\}$ 上相互独立的几何随机变量，且

$$
\Pr\left\{\Delta\le a,\ D\le d\right\}
=\left[1-(1-r)^a\right]\left[1-(1-r)^d\right]. \tag{10}
$$

当存在信道记忆时，该乘积形式未必成立，因为连续送达间隔之间可能变得相关。

**定理 2（可逆信道的离散下界）.** 设马尔可夫信道可逆，即对任意状态对都有 $\mu_iP_{ij}=\mu_jP_{ji}$。则任意满足 $r>0$ 的信道相关随机化策略都满足

$$
\bar D=\frac1r+\frac{{\rm Var}_{\boldsymbol\nu}\left(m_C\right)}{\bar y}\ge\frac1r, \tag{11}
$$

其中 $C$ 服从分布 $\boldsymbol\nu$。等号成立当且仅当 $m_c$ 在所有满足 $\nu_c>0$ 的状态上为常数。

**证明：** 设 $C$ 表示分隔 $Y_i$ 与 $Y_{i+1}$ 的成功送达时隙处的信道状态。给定 $C$，该时隙前后的信道路径相互独立。马尔可夫信道的可逆性以及条件独立的送达结果意味着带标记的信道过程也是可逆的；因此向后与向前的送达间隔具有相同的条件均值 $m_C$。于是 $\mathbb E[Y_iY_{i+1}]=\mathbb E_{\boldsymbol\nu}[m_C^2]$，且 ${\rm Cov}(Y_i,Y_{i+1})={\rm Var}_{\boldsymbol\nu}(m_C)$。把它们代入 (9) 即证得 (11)。$\square$

定理 2 表明，送达吞吐量一般并不能唯一决定平均离散：$\bar D$ 与 $1/r$ 之差取决于“距下一次送达的期望时间”在送达时隙所观测到的各信道状态之间的差异程度。即便信道存在记忆，等号仍可能成立，例如 $h_c$ 在各状态上为常数，或仅在一个状态下可能送达。对不可逆信道，连续送达间隔可能具有负协方差，此时 (11) 的界未必成立。联合分布分析也可推广到最新更新与第 $k$ 个先前更新之间的生成时间分隔：定义 $D^{(k)}_t\triangleq t_{N(t)}-t_{N(t)-k}$，可得

$$
\Pr\left\{\Delta\le a,\ D^{(k)}\le d\right\}
=\frac{\boldsymbol\nu\sum\limits_{\substack{y_1+\cdots+y_k\le d\\ y_j\ge1}}
\mathbf K_{y_1}\cdots\mathbf K_{y_k}\mathbf m_a}{\bar y}. \tag{12}
$$

下文的控制问题聚焦 $k=1$。

## IV. 精确有限状态传输控制

### A. 精确状态缩减

在自适应传输下，状态 $(\Delta_t,D_t,C_t)$ 具有可数无限状态空间。然而 (4) 的目标只取决于 AoI 与年龄离散是否超出各自阈值。我们定义 $H=\max\{a_0,d_0\}+1$、$z_t=\min\{\Delta_t,H\}$、$b_t=\mathbf 1\{D_t>d_0\}$，以及 $S_t=(z_t,b_t,C_t)$。这里 $z_t$ 是截断 AoI，$b_t$ 指示离散阈值是否被违反；所得状态空间至多含 $2nH$ 个状态。

对 $s=(z,b,c)$，令 $f_0(s,c')\triangleq(\min\{z+1,H\},b,c')$ 与 $f_1(s,c')\triangleq(1,\mathbf 1\{z>d_0\},c')$ 分别表示无送达与成功送达后的下一状态。在动作 $u\in\{0,1\}$ 下的转移概率为

$$
T_u(s,s')=\sum_{c'\in\mathcal C}P_{cc'}
\left[(1-up_c)\mathbf 1\{s'=f_0(s,c')\}
+up_c\mathbf 1\{s'=f_1(s,c')\}\right]. \tag{13}
$$

若未发生送达，AoI 增加为 $\min\{z+1,H\}$，$b$ 保持不变；若发生送达，(2) 给出 $\Delta_{t+1}=1$ 且 $D_{t+1}=\Delta_t$。由于 $H>a_0$ 且 $H>d_0$，截断值 $z_t$ 同时保留两个阈值比较，而新的离散指示恰为 $\mathbf 1\{z_t>d_0\}$。因此违例代价可写为 $g(s)=\mathbf 1\{z>a_0\ \text{或}\ b=1\}$，而传输代价仍为 $u$。

于是，由同一 $(z,b,c)$ 表示的全部原始状态在两种动作下都具有相同的转移概率与代价。该缩减对阈值目标是**精确**的，并未近似 (4)；未截断的年龄变量仅用于评估平均 AoI 与平均年龄离散。

### B. 最优约束策略

令 $x(s,u)$ 表示平稳系统处于状态 $s$ 并选择动作 $u$ 的时隙占比。这些状态–动作占位测度由如下线性规划 [17] 给出：

$$
\min_{x\ge0}\ \sum_{s,u}x(s,u)g(s) \tag{14a}
$$
$$
\text{s.t.}\quad
\sum_{u}x(s',u)=\sum_{s,u}x(s,u)T_u(s,s'),\quad\forall s', \tag{14b}
$$
$$
\sum_{s,u}x(s,u)=1, \tag{14c}
$$
$$
\sum_{s}x(s,1)\le R, \tag{14d}
$$

其中约束 (14b) 强制平稳流平衡，约束 (14d) 限制平均传输速率。导致 (14) 的精确有限状态表示源于本模型联合阈值结构。

**定理 3（可达最优控制器）.** 假定对任意 $c,c'$ 有 $P_{cc'}>0$、$p_c\in(0,1)$ 且 $R>0$，则 (14) 中的 LP 可达 $J^*(R)$。对最优解 $x^*$，最优平稳策略为

$$
\pi^*\left(1\mid s\right)=\frac{x^*(s,1)}{x^*(s,0)+x^*(s,1)} \tag{15}
$$

（对每个被占用的状态），而在未被占用的状态上该策略进行传输。此外，可选取一个最优基本解，使至多有一个常返状态在两种动作之间随机化。

**证明：** 任一可行策略的期望经验占位测度的任一极限点都满足 (14b)–(14d)，故 LP 给出 (4) 的下界。以概率 $R$ 独立尝试的策略是可行的，且给出 $J_\pi<1$；因此最优常返类包含一个不违例的状态。由于 $P_{cc'}>0$ 且每次传输尝试都可能失败，连续的无送达时隙把该常返类连接到每一个 $(H,0,c)$；常返性、随后的一次送达、以及进一步失败又把它连接到每一个 $(H,1,c)$。每个闭类都含有这些形式之一的饱和状态，故重构的策略具有唯一常返类并实现 $x^*$。

若 $k$ 个状态具有正占位，则其平衡方程秩为 $k-1$；约束 (14c) 与 (14d) 允许基本最优解至多有 $k+1$ 个正变量。由于每个被占用状态都需要一个正的动作变量，至多一个状态可使用两种动作。$\square$

### C. 未截断均值评估与自适应基准

对固定策略 $\pi(s)$，令 $\mathbf F$ 与 $\mathbf L$ 分别包含 (13) 中的无送达项与送达项，并令 $\boldsymbol\eta$ 为 $\mathbf F+\mathbf L$ 的平稳行向量。若 $\varrho(\mathbf F)<1$，定义 $\mathbf v\triangleq\boldsymbol\eta(\mathbf I-\mathbf F)^{-1}$、$\mathbf w=\mathbf v\mathbf L(\mathbf I-\mathbf F)^{-1}$。由平稳递推 $\mathbf v=\mathbf v\mathbf F+\boldsymbol\eta$ 与 $\mathbf w=\mathbf w\mathbf F+\mathbf v\mathbf L$，未截断的平均 AoI、平均年龄离散与送达吞吐量分别导出为

$$
\bar\Delta=\mathbf v\mathbf 1,\qquad
\bar D=\mathbf w\mathbf 1,\qquad
r_\pi=\boldsymbol\eta\mathbf L\mathbf 1. \tag{16}
$$

AoI 单目标控制器在相同传输预算、CSI 与反馈下，使用状态 $(\min\{\Delta,a_0+1\},C)$ 最小化 $\Pr\{\Delta>a_0\}$；其目标是 AoI 违例概率而非平均 AoI。由于可能有多个策略达到同一最小值 $v^*_A$，它们的离散性能可能不同。因此我们另设一个 **AoI-first 基准**：在 (14) 的基础上附加等式

$$
\sum_{s,u}x(s,u)\mathbf 1\{z_s>a_0\}=v^*_A \tag{17}
$$

再做最小化。该基准仅用离散指示在 AoI 最优策略之间做选择，给出与最小 AoI 违例概率相容的最低联合违例概率，从而避免比较结果依赖于 LP 的任一任意解。**吞吐量单目标策略**则在相同平均传输速率约束下最大化长期成功送达率，而不显式考虑 AoI 或年龄离散。

## V. 仿真结果

我们考虑对称两状态马尔可夫信道：$\mathbf P_\rho=\rho\mathbf I+(1-\rho)\mathbf 1\boldsymbol\mu$，其中 $\boldsymbol\mu=(1/2,1/2)$，$\rho$ 为信道状态指示量的滞后一阶相关（$0\le\rho<1$），故 $P_{GG}=P_{BB}=(1+\rho)/2$。除非另有说明，取 $\rho=0.9$、$(p_G,p_B)=(0.95,0.20)$、$(a_0,d_0)=(10,6)$，以及 $B=0.4$——其中 G 与 B 表示好、坏信道状态，$p_G$ 与 $p_B$ 为各自传输成功概率，$R$ 为每个时隙的平均传输速率。全部策略观测相同的当前 CSI 并满足相同的传输速率约束。Monte Carlo（MC）结果在 12 次独立运行上取平均，每次在 $5\times10^4$ 个预热时隙后测量 $10^6$ 个时隙。所有图中，线条与标记分别表示解析结果与带 95% 置信区间的 MC 结果。

> **原文疑点：** 此处原文写作 “and $B=0.4$”，但同句随后解释的是 “$R$ is the average transmission rate per slot”，且表 I 标题与图 4 横轴均使用 $R=0.4$（平均传输预算）。因此原文的 $B=0.4$ 疑为 $R=0.4$ 的笔误；本译按原文照录并加注，未改动数值。

图 3 通过让传感器在每个时隙都传输，隔离出信道记忆在两状态 Gilbert–Elliott 信道上的影响，分别取 $(p_G,p_B)=(0.9,0.1)$ 与 $(0.7,0.3)$。两种情形的吞吐均为 $r=0.5$、$\bar y=2$，但好–坏状态可靠性差分别为 0.8 与 0.4。在 $\rho=0$ 时，二者都给出 $\bar\Delta=\bar D=2$ 与 $J_\pi=0.15$；在 $\rho=0.9$ 时，相应的 $(\bar\Delta,\bar D)$ 变为 $(4.20,3.36)$ 与 $(2.30,2.24)$。因此，更大的可靠性差会在坏信道持续期间造成更长的送达间隙，从而使定理 2 中的记忆项 $\bar D-1/r$ 从 0.24 增至 1.36。同时满足两个阈值的概率也分别从 84.8% 降至 61.6% 与 77.8%。此外，边缘乘积近似把 $J_\pi$ 分别高估了 11.5% 与 3.1%，说明吞吐量与边缘分布无法刻画信道记忆下的联合性能。

**图 3：** 固定吞吐 $r=0.5$ 时信道记忆的影响。下方面板使用 $(a_0,d_0)=(5,3)$（图中给出平均 AoI $\bar\Delta$ 与平均离散 $\bar D$ 随信道记忆 $\rho$ 的变化，以及联合违例概率 $J_\pi$ 的联合分布与边缘乘积近似对比）。

表 I 在相同平均传输速率下比较了全部策略。

**表 I：** $R=0.4$ 与 $(a_0,d_0)=(10,6)$ 下的策略比较。

| 策略 | $J_\pi$ | $\Pr\{\Delta>a_0\}$ | $\bar\Delta$ | $\bar D$ |
|---|---|---|---|---|
| 均匀随机 | 0.365 | 0.175 | 6.096 | 5.298 |
| 吞吐量单目标 | 0.363 | 0.328 | 11.632 | 2.637 |
| AoI 单目标 | 0.282 | 0.05 | 4.218 | 6.321 |
| AoI-first | 0.276 | 0.05 | 4.218 | 6.288 |
| 联合控制器 | 0.177 | 0.079 | 4.57 | 5.285 |

如表 I 所示，联合控制器取得 $J_\pi=0.177$，即在 82.3% 的时隙同时满足两项要求，而 AoI 单目标与 AoI-first 控制分别只有 71.8% 与 72.4%；相对二者，$J_\pi$ 分别降低 37.3% 与约 36%。更重要的是，“仅离散违例”概率 $J_\pi-\Pr\{\Delta>a_0\}$ 从 AoI 单目标控制下的 0.232 降至 0.098，降幅 57.8%。AoI-first 仅带来很小改善，因为离散仅用于打破 AoI 最优策略之间的并列。联合控制器以平均 AoI 增加 8.3% 为代价换取两个目标的平衡。相反，吞吐量单目标调度给出最小的平均离散，却产生 $\bar\Delta=11.632$ 与 $J_\pi=0.363$，印证了任何单一指标都无法刻画联合要求。

图 4 表明传输约束在新鲜度与连续采样间隔之间造成明显折中。当 $R\le0.275$ 时，AoI 单目标与 AoI-first 控制以概率 1 违反离散阈值，尽管其平均 AoI 更低。在 $R=0.2$ 时，联合控制器把平均离散从 11.57 降至 5.12 个时隙、把 $J_\pi$ 从 1 降至 0.319，同时把平均 AoI 从 7.06 增至 11.30 个时隙；这是因为维持小离散需要在当前 AoI 变大之前进行后续传输，从而留给之后新鲜度恢复的尝试更少。在 $R=0.4$ 时，联合控制器相对 AoI 单目标控制把 $J_\pi$ 降低 37.3%、把平均离散降低 16.4%，而平均 AoI 增加 8.3%。

**图 4：** $\rho=0.9$、$(p_G,p_B)=(0.95,0.2)$ 下联合违例概率与未截断平均 AoI 随传输预算的变化（含联合、AoI 单目标与 AoI-first 控制的 $J_\pi$ 与平均 AoI/平均离散曲线）。

图 5(a) 给出 $R=0.3$ 与 $R=0.5$ 时联合控制器与 AoI-first 控制的 $J_\pi$ 随 $\rho$ 的变化。对 $R=0.3$，$\rho$ 从 0 增至 0.96 使联合控制下的 $J_\pi$ 从 0.026 升至 0.287，却使 AoI-first 控制下的 $J_\pi$ 从 0.055 升至 0.940，在 $\rho=0.96$ 处形成 69.5% 的降幅。尽管此时 AoI-first 的 AoI 违例更少，其离散违例概率为 0.929，而联合控制下为 0.220。把预算提高到 $R=0.5$ 时，相应联合违例分别降至 0.168 与 0.204。

图 5(b) 解释了这一增益。当 $b=1$ 时，控制器总是传输，以获得恢复离散所需的紧密间隔送达；当 $b=0$ 时，它在好状态下从 $z=5$ 起传输，而在坏状态下于 $z=5,6$ 传输、在 $z=7,8,9$ 暂停、并在 $z\ge10$ 恢复传输。在 $z=7,8,9$ 期间的一次成功会把新的离散置为 $z>d_0$，而 AoI 仍可接受；这种非单调的信道相关行为正是通过优化联合目标产生的。

> **原文疑点：** 图 5(b) 的概率矩阵显示：$b=0$、坏信道时 $z=4$ 处的传输概率为 0.50（即该状态在两种动作间随机化），这与定理 3“至多一个常返状态随机化”一致；但正文只描述了“在坏状态下于 $z=5,6$ 传输、在 $z=7,8,9$ 暂停、并在 $z\ge10$ 恢复传输”，未提及 $z=4$ 处的这一随机化状态。本译按原文照录并补充说明，未改动矩阵数值。

**图 5：** (a) $R\in\{0.3,0.5\}$、$(p_G,p_B)=(0.95,0.2)$、$(a_0,d_0)=(10,6)$ 下联合违例概率随信道记忆 $\rho$ 的变化（对比联合控制器与 AoI-first 控制）。(b) $\rho=0.9$、$R=0.4$ 时最优联合控制器的传输概率矩阵：行对应 $(b,c)$ 组合（$b$ 为离散违例指示、$c$ 为信道状态），列对应当前 AoI 水平 $z=\min\{\Delta,11\}=1,2,\dots,10,\ge11$，单元格为传输概率（以颜色深浅表示概率高低）。

## VI. 结论

本文推导了 FSMC 无线信道上、信道相关随机化传输下 AoI 与年龄离散的稳态联合分布。在该策略类内，我们证明可逆信道对送达吞吐量的倒数给出非负的方差修正，并确定了该修正消失的条件。我们还建立了一种精确有限状态控制器，在平均传输速率约束下最小化联合阈值违例。在相同传输预算下，该控制器相对自适应 AoI 单目标控制把联合违例降低 37.3%，同时使平均 AoI 增加 8.3%。这一折中凸显了在 AoI 之外同时考虑连续采样间隔的重要性。本模型假定单时隙的新鲜传输、当前 CSI 与可靠反馈；未来工作将通过扩展状态表示来处理延迟 CSI 与重传。

## 参考文献（英文原条目，按原文顺序）

[1] L. Chettri and R. Bera, “A comprehensive survey on Internet of Things (IoT) toward 5G wireless systems,” *IEEE Internet Things J.*, vol. 7, no. 1, pp. 16–32, Jan. 2020.

[2] R. D. Yates, Y. Sun, D. R. Brown, S. K. Kaul, E. Modiano, and S. Ulukus, “Age of information: An introduction and survey,” *IEEE J. Sel. Areas Commun.*, vol. 39, no. 5, pp. 1183–1210, May 2021.

[3] M. Moltafet, R. D. Yates, M. Codreanu, and H. R. Sadjadpour, “Age dispersion and higher-order AoI in status update systems,” 2026. [Online]. Available: 10.48550/arXiv.2608.01006

[4] Y. Sun, E. Uysal-Biyikoglu, R. Yates, C. E. Koksal, and N. B. Shroff, “Update or wait: How to keep your data fresh,” in *Proc. IEEE Int. Conf. Comp. Commun. (INFOCOM)*, Apr. 2016, pp. 1–9.

[5] Y.-P. Hsu, E. Modiano, and L. Duan, “Age of information: Design and analysis of optimal scheduling algorithms,” in *Proc. IEEE Int. Symp. Inform. Theory (ISIT)*, Jun. 2017, pp. 561–565.

[6] I. Kadota, A. Sinha, E. Uysal-Biyikoglu, R. Singh, and E. Modiano, “Scheduling policies for minimizing age of information in broadcast wireless networks,” *IEEE/ACM Trans. Networking*, vol. 26, no. 6, pp. 2637–2650, Dec. 2018.

[7] H. Tang, J. Wang, L. Song, and J. Song, “Minimizing age of information with power constraints: Multi-user opportunistic scheduling in multi-state time-varying channels,” *IEEE J. Sel. Areas Commun.*, vol. 38, no. 5, pp. 854–868, May 2020.

[8] E. T. Ceran, D. Gündüz, and A. György, “Average age of information with hybrid ARQ under a resource constraint,” in *Proc. IEEE Wireless Commun. Netw. Conf. (WCNC)*, Apr. 2018, pp. 1–6.

[9] S. Banerjee and S. Ulukus, “When to preempt in a status update system?” in *Proc. IEEE Int. Symp. Inform. Theory (ISIT)*, Jul. 2024, pp. 1379–1384.

[10] P. Sadeghi, R. Kennedy, P. Rapajic, and R. Shams, “Finite-state Markov modeling of fading channels - A survey of principles and applications,” *IEEE Signal Process. Mag.*, vol. 25, no. 5, pp. 57–80, Sep. 2008.

[11] R. Talak, I. Kadota, S. Karaman, and E. Modiano, “Scheduling policies for age minimization in wireless networks with unknown channel state,” in *Proc. IEEE Int. Symp. Inform. Theory (ISIT)*, Jun. 2018, pp. 2564–2568.

[12] G. Yao, A. M. Bedewy, and N. B. Shroff, “Age-optimal low-power status update over time-correlated fading channel,” *IEEE Trans. Mob. Comput.*, vol. 22, no. 8, pp. 4500–4514, Aug. 2023.

[13] Q. Guan and X. Xu, “Impact of channel memory on the data freshness,” *IEEE Commun. Lett.*, vol. 27, no. 1, pp. 80–84, Jan. 2023.

[14] M. A. Abd-Elmagid and H. S. Dhillon, “Joint distribution of ages of information in networks,” *IEEE Trans. Inf. Theory*, vol. 69, no. 9, pp. 5701–5722, Sep. 2023.

[15] R. Singh, X. Guo, and P. Kumar, “Index policies for optimal mean-variance trade-off of inter-delivery times in real-time sensor networks,” in *Proc. IEEE Conf. Comput. Commun. (INFOCOM)*, Apr. 2015, pp. 505–512.

[16] C. Joo and A. Eryilmaz, “Wireless scheduling for information freshness and synchrony: Drift-based design and heavy-traffic analysis,” *IEEE/ACM Trans. Networking*, vol. 26, no. 6, pp. 2556–2568, Dec. 2018.

[17] E. Altman, *Constrained Markov Decision Processes: Stochastic Modeling*. Routledge, Dec. 2021.

**原文插图：** 原 PDF 中的图 1–5 未重传至本页，仅保留中文图注与图中关键标注（如系统示意、样本路径与阈值虚线、联合分布曲线、策略概率矩阵与颜色标度）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.16569v1（eess.SY，6 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VI 节（含 III-A–C、IV-A–C、V-A–B 等领域全部小节）、结论、全部图注（图 1–5，含图 5(b) 概率矩阵面板说明）、表 I（逐格转录）、定理 1–3、公式 (1)–(17)（含 (14a)–(14d) 子式）与 17 条参考文献英文原条目；原文无附录、无作者简介。**逐句终校未做**：表 I 与图 5(b) 的传输概率矩阵均已用 PDF 页面渲染逐格核对；式 (5)–(9)、(11)、(13)–(17) 亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①第 V 节把平均传输预算写作 $B=0.4$，但同句及表 I、图 4 均以 $R$ 表示该量，疑为笔误；②图 5(b) 在 $b=0$、坏信道、$z=4$ 处存在 0.50 的随机化传输概率（与定理 3 一致），而正文描述遗漏该状态。均按原文照录并说明，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
