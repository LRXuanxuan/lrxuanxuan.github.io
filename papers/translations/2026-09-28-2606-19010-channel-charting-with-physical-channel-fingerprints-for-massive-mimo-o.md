---
layout: page
title: "基于物理信道指纹的信道图谱｜中文全文译文"
permalink: /papers/translations/2026-09-28-2606-19010-channel-charting-with-physical-channel-fingerprints-for-massive-mimo-o/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ef838835a9f80220/) · [原文 arXiv](https://arxiv.org/abs/2606.19010) · [全部目录](/papers/catalog/)

# 基于物理信道指纹的信道图谱

**原题：** Channel Charting With Physical Channel Fingerprints for Massive MIMO-OFDM Channel Acquisition  
**作者：** Jinke Tang（Graduate Student Member, IEEE）、Xiqi Gao（Fellow, IEEE）、Li You（Senior Member, IEEE）、Xiang-Gen Xia（Fellow, IEEE）、Cheng-Xiang Wang（Fellow, IEEE）。单位：J. Tang、X. Gao、L. You、C.-X. Wang 为东南大学移动通信国家重点实验室（南京 210096）及紫金山实验室（南京 211111）；X.-G. Xia 为美国特拉华大学电气与计算机工程系（Newark, DE 19716, USA）。  
**版本：** arXiv:2606.19010v1（eess.SP），2026 年 6 月 17 日提交，原文 15 页（IEEE 双栏期刊投稿格式，含图 1–9、表 I–III、公式 (1)–(56)、算法 1、附录 A–B、参考文献 47 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VI 节（含 II-A–B、III-A–B、IV-A–C、V-A–B 等全部小节）、结论、全部图注（图 1–9）、表 I–III（逐格转录）、定理 1–2、算法 1、公式 (1)–(56)（含 (22a)–(22b)、(43a)–(43c)、(47a)–(47c)、(48a)–(48c) 子式）、附录 A–B（两个定理的证明）、致谢与 47 条参考文献英文原条目；原文无作者简介；逐句逐式终校未做。

## 摘要

6G 移动通信与定位技术的进步放大了位置感知工具的重要性：以位置为索引的信道指纹（CF）与信道图谱（channel charting）正成为大规模 MIMO-OFDM 系统的关键使能技术。本文提出一种基于物理信道指纹（PCF）的新型信道图谱，并验证其在信道状态信息（CSI）获取中的有效性。首先，我们基于簇化几何随机信道模型（GBSM）定义 PCF，从而用一组紧凑参数全面表示物理信道特性。随后，我们提出大规模 MIMO-OFDM 系统中 PCF 的获取方法：利用 PCF 与空–频–时（SFT）域信道之间的关系，所提方法从多位置信道测量中提取 PCF，并构建以位置为索引、由 PCF 构成的结构化信道图谱。进一步，我们提出一种低复杂度算法，利用信道图谱中的 PCF 获取波束域统计 CSI（sCSI）；所得 sCSI 可直接作为先验信息用于信道估计。仿真结果表明，所提方法取得的 sCSI 性能与传统在线探测技术相当，且生成的 sCSI 可作为可靠先验知识显著提升信道估计精度。这些结果验证了所提 PCF 是面向下一代移动通信信道获取与系统设计的强大而通用的工具。

**关键词：** 大规模 MIMO-OFDM、信道指纹、sCSI、簇化 GBSM、波束域。

## I. 引言

第六代（6G）移动通信技术研究正快速推进，并已引起全球广泛关注 [1]。相比 5G 系统，6G 有望满足更严苛的性能要求，包括显著更高的用户终端（UT）连接密度、更高的数据速率、更低的时延 [1]–[3] 以及更高的定位精度 [4]。鉴于其在 5G 网络中已被证明的有效性，大规模多输入多输出正交频分复用（MIMO-OFDM）预计仍将是 6G 的关键技术。大规模 MIMO 阵列的采用及其向超大规模 MIMO 的演进，将在满足 6G 严苛性能需求方面发挥关键作用 [1]。

然而，6G 网络中 UT 密度的上升与大规模天线阵列的部署给系统设计带来显著挑战，尤其体现在信道状态信息（CSI）获取上 [5]。CSI 通常分为瞬时 CSI 与统计 CSI（sCSI）。与瞬时 CSI 不同，sCSI 随时间演化相对缓慢，可作为有价值的先验知识辅助瞬时 CSI 的估计 [5]–[7]。在 UT 数量庞大的场景中，sCSI 对指导导频调度尤为关键，从而有效缓解 UT 间的导频干扰 [5]；此外，sCSI 还在预编码、UT 分组与功率控制等关键任务中扮演重要角色 [8]–[10]。现有研究大多通过基于导频信号的在线探测获取 sCSI，并已提出多种方案 [8]–[12]。然而，随着 UT 数量与天线阵列维度持续增大，这些基于探测的方法可能因过高的开销与计算复杂度而不再实用。

与此同时，移动通信系统的演进也为 sCSI 获取带来新机遇。大规模 MIMO-OFDM 系统便于采集高分辩率信道参数，包括路径增益、角度与时延 [13]；此外，未来系统中 UT 节点的密集部署可实现更精细的空间采样粒度 [1]。通过把基站（BS）与 UT 视为分布式传感器，可构建高精度信道参数数据库 [14], [15]，并据此构造信道图谱 [16]–[20] 或信道知识地图（CKM）[15]，以捕获整个小区内环境特定的传播特性。具体而言，给定某 UT 的位置，即可从数据库推断其对应 sCSI，无需在线探测，实现免训练的信道获取 [15]。

本文将这种结构化、以位置为索引的表示称为**基于信道指纹（CF）的信道图谱**。这里“CF”指位置相关的信道参数，而“图谱（charting）”强调其空间组织结构。现有信道图谱技术 [16]–[20] 通常依赖无监督学习（UL）把高维信道测量嵌入潜空间。尽管这些数据驱动嵌入保留了空间邻近性，却未显式捕获底层物理信道特性，因而并不直接适用于 sCSI 重建或需要物理可解释参数的任务。相反，我们所提途径直接从底层物理信道模型提取 CF，确保每个 CF 具有清晰物理含义，并忠实反映无线信道内在的、随位置与环境变化的特性。由于这些 CF 是物理驱动而非数据驱动的潜嵌入，它们给出空间信道变化的直观而准确的几何表示；其具有物理意义的结构还自然形成可靠的位置索引数据库，可直接用于 sCSI 获取等下游任务。

用信道图谱中的 CF 替代在线探测来获取 sCSI，引出一个根本问题：**哪些 CF 适合该用途？** 该应用场景提出特定要求：理想 CF 应通用、存储高效且能适应变化的需求。然而现有 CF 往往面向不同目标设计：面向波束对齐的角度型或波束索引 CF [21], [22]、或面向预编码的空间协方差矩阵 [23]，都是应用特定的，只捕获部分信道特性，限制了其在通用 sCSI 重建中的适用性；另一些如空–频（SF）波束域信道功率分布矩阵（一种面向信道估计 [6] 与预编码 [10] 的综合 sCSI），信息虽丰富，但在大规模部署中可能带来可观存储开销 [24], [25]；此外这些 CF 通常绑定固定的波束域配置，当需要不同 sCSI 类型或波束域维数时适用性下降。为应对这些挑战，本文提出基于物理信道指纹（PCF）的新型信道图谱，以统一、物理驱动的方式扩展现有信道图谱与 CKM 表示。具体地，所提 PCF 具有以下关键性质：

- **通用性与完备性：** 通过编码信道特性的完备集合，某位置的 PCF 可变换为特定类型的 sCSI，以满足多种应用需求。
- **存储高效性：** PCF 把信道特性压缩为紧凑参数集，在保持重建能力的同时大幅降低存储开销。
- **物理驱动：** PCF 由传播环境导出，不绑定任何预定义 sCSI 类型或波束域定义，使单个已存 PCF 可自适应投影到所需 sCSI 格式。

为区分所提 PCF 与既有信道图谱（或 CKM）方法，我们在表 I 中给出对比总结。PCF 的关键创新在于：不同于先前的 CF 或潜坐标，它用可解析变换为任意域 sCSI 的物理驱动参数集表示每个位置。这种统一设计同时实现物理可解释性、功能通用性与存储可扩展性，使 PCF 成为适合且可泛化的 sCSI 获取工具。

**表 I：** 各类信道图谱方法的特性与适用性对比。

| 方面 | 基于 UL 的信道图谱 | 使用传统 CF 的信道图谱 | 使用 PCF 的信道图谱（本文） |
|---|---|---|---|
| 建模基础 | 数据驱动（学习到的潜空间） | 物理驱动（部分由局部物理特性导出 [21], [22]） | **物理驱动（考虑完整物理特性）** |
| 输出形式 | 低维潜嵌入 | 任务特定信道特征 | **紧凑参数集** |
| 物理解释 | 不能直接获得 | 可在目标任务或系统设计内解释 | **直接（概括物理特性的完备集合）** |
| 主要应用 | 基于相似性的任务（如 UT 分组 [16, 17]、PSOP 复用 [19, 20]） | 专门功能（如波束对齐 [21, 22]、固定 sCSI 预编码 [23–25]） | **通用任务（sCSI 获取、信道估计、预编码）** |
| 存储开销 | 低（紧凑嵌入） | 视情况而定（完整 sCSI 存储时可能很高 [24]） | **低（紧凑参数表示）** |
| 对新任务/配置的适应性 | 有限（需要重训练） | 有限（特征绑定原始设计） | **高（参数可投影到新波束域/sCSI 类型）** |

由于其物理驱动性质，大规模 MIMO 通信中 PCF 的生成依赖恰当的信道建模技术。常用模型包括基于几何的随机模型（GBSM）[26]–[29] 与基于波束的信道模型（BBCM）[5]–[7], [30], [31]。其中 GBSM 显式刻画传播环境中多径分量（MPC）的特性，因而非常适合分析无线信道的物理性质；因此我们在 GBSM 框架内定义 PCF。相反，BBCM 作为一类统计信道模型，把连续的角度与时延域量化到离散波束，从而降低信道处理复杂度，这使其在信道获取与传输设计中被广泛采用 [5]–[7], [31]。为桥接两类模型，我们用 GBSM 与 BBCM 对同一传播环境建模：基于 GBSM 定义 PCF，并利用 GBSM 与 BBCM 的内在关系，进一步提出把 PCF 变换为波束域 sCSI 的方法以供后续应用。

综上，本文聚焦基于 PCF 的信道图谱，系统处理其形式化定义、获取方法以及在 sCSI 获取中的应用。贡献概括如下。

- 我们引入基于簇化 GBSM 的 PCF 定义：依据 GBSM 中 MPC 的簇结构，PCF 被定义为用紧凑参数集全面捕获信道物理特性。
- 我们提出大规模 MIMO-OFDM 系统中 PCF 的获取方法：包括建立 SFT 域信道模型及其与物理信道参数的联系、估计 SFT 域信道，以及采用基于空间交替广义期望最大化（SAGE）的算法从估计信道中提取 PCF。通过聚合这些位置特定 PCF，可构建基于 PCF 的信道图谱，给出物理信道环境的位置索引表示。
- 我们提出利用信道图谱中存储的 PCF 高效获取 sCSI 的方法：先建立簇化 GBSM 与三重 BBCM 的关系；据此导出波束域 sCSI 的表达式，并开发由 PCF 生成它的低复杂度算法。所得 sCSI 可直接作为先验信息用于高效信道估计。

本文余下部分安排如下：第 II 节介绍基于 GBSM 的 PCF 定义；第 III 节提出 PCF 获取方法并构建基于 PCF 的信道图谱；第 IV 节提出利用 PCF 获取 sCSI 的方法；第 V 节给出仿真结果；第 VI 节总结全文。

**记号：** 文中粗体小写（大写、花体）字母分别表示列向量（矩阵、张量）。$\mathbf 0$ 表示全零向量、矩阵或张量；$\mathbf I_N$ 为 $N\times N$ 单位阵；上标 $(\cdot)^T$、$(\cdot)^H$、$(\cdot)^*$、$(\cdot)^{-1}$ 分别表示转置、共轭转置、共轭与逆运算。我们用 $[\mathbf a]_i$、$[\mathbf A]_{i,j}$、$[\mathcal A]_{i,j,k}$ 分别表示向量 $\mathbf a$ 的第 $i$ 个元素、矩阵 $\mathbf A$ 的第 $(i,j)$ 个元素与张量 $\mathcal A$ 的第 $(i,j,k)$ 个元素；文中所有索引均从 1 开始。$\otimes$ 与 $\odot$ 分别表示 Kronecker 积与 Hadamard 积；算子 ${\rm Diag}\{\cdot\}$ 表示以向量元素为主对角线的对角矩阵，${\rm diag}\{\cdot\}$ 表示提取对角元素为向量；${\rm tr}\{\cdot\}$ 为矩阵迹算子，${\rm vec}\{\cdot\}$ 为向量化算子；$\mathbb C^{M\times N}$ 与 $\mathbb R^{M\times N}$ 分别表示 $M\times N$ 维复与实向量空间；$\mathbb E\{\cdot\}$ 为期望算子；$\mathcal A_1\times\mathcal A_2$ 表示集合 $\mathcal A_1$ 与 $\mathcal A_2$ 的笛卡尔积；$\delta(\cdot)$ 为 Dirac delta 函数；集合 $\{a_p\}_{p=1}^{P}$ 表示 $\{a_1,a_2,\dots,a_P\}$；$\mathbf F_N$ 为 $N\times N$ 离散傅里叶变换（DFT）矩阵。$\boldsymbol\Gamma_{M,m}$ 定义为

$$
\boldsymbol\Gamma_{M,m}\triangleq
\begin{bmatrix}
\mathbf 0 & \mathbf I_{M-\langle m\rangle_M}\\
\mathbf I_{\langle m\rangle_M} & \mathbf 0
\end{bmatrix}. \tag{1}
$$

给定张量 $\mathcal X\in\mathbb C^{I_1\times I_2\times\cdots\times I_m\times\cdots\times I_M}$ 与矩阵 $\mathbf X\in\mathbb C^{J\times I_m}$，二者的 $m$-mode 积记为 $\mathcal X\times_m\mathbf X\in\mathbb C^{I_1\times\cdots\times I_{m-1}\times J\times I_{m+1}\times\cdots\times I_M}$，逐元素有

$$
\left[\mathcal X\times_m\mathbf X\right]_{i_1,\cdots,j,\cdots,i_M}
=\sum_{i_m=1}^{I_m}[\mathbf X]_{j,i_m}[\mathcal X]_{i_1,\cdots,i_m,\cdots,i_M}. \tag{2}
$$

对 $\mathcal A\in\mathbb C^{I_1\times I_2\times\cdots\times I_M\times J_1\times J_2\times\cdots\times J_K}$ 与 $\mathcal B\in\mathbb C^{J_1\times J_2\times\cdots\times J_K\times P_1\times P_2\times\cdots\times P_N}$，其 Einstein 积记为 $\mathcal A*_K\mathcal B\in\mathbb C^{I_1\times\cdots\times I_M\times P_1\times\cdots\times P_N}$，逐元素有

$$
\left[\mathcal A*_K\mathcal B\right]_{i_1,\cdots,i_M,p_1,\cdots,p_N}
=\sum_{j_1=1}^{J_1}\cdots\sum_{j_K=1}^{J_K}
[\mathcal A]_{i_1,\cdots,i_M,j_1,\cdots,j_K}
[\mathcal B]_{j_1,\cdots,j_K,p_1,\cdots,p_N}. \tag{3}
$$

## II. 物理信道指纹

本节基于簇化 GBSM 引入 PCF 的定义，用一组参数紧凑而全面地捕获无线信道的物理特性。

**图 1：** BS 与若干移动 UT 之间的传播环境。

### A. 簇化 GBSM

我们考虑图 1 所示的传播环境：BS 与地面上的若干 UT 通信。以图 1 中的 UT 1 为例，介绍 BS 与 UT 之间的信道建模方法。为便于解析处理，假定 BS 与 UT 均采用均匀线阵（ULA），从而实现有效的二维（2D）传播刻画。此外，如图 2 所示，场景被离散为多个网格（grid），假定每个网格内的传播环境近似不变。为记号清晰，定义 $s_{\rm BS}$ 为 BS 所在网格坐标，$\mathcal S$ 为覆盖区域内全部潜在 UT 网格位置集合。

我们分析给定时段内 UT 与 BS 之间的信道冲激响应（CIR）。该时段内 UT 的移动始终局限于特定网格 $s$，以速度 $v_{\rm move}$、沿方向 $\alpha_{\rm move}$ 移动。因此 UT 与 BS 之间的传播环境可近似视为静态。于是 BS 第 $a$ 个天线元与 UT 第 $b$ 个天线元之间的 CIR 可表示为 [26], [27]

$$
\tilde h_{a,b}(t,\tau)=\sum_{l=1}^{L(s)}
\kappa_{s,l}e^{-j2\pi f_c\tau_{s,a,b,l}(t)}
\delta\left(\tau-\tau_{s,a,b,l}(t)\right), \tag{4}
$$

其中 $L(s)$ 为 BS 与 $s$ 之间 MPC 总数，$\kappa_{s,l}$ 与 $\tau_{s,a,b,l}(t)$ 分别为第 $l$ 条 MPC 的复增益与时延，$f_c$ 为载频。

对上行链路，第 $l$ 条 MPC 的离开角（AoD）与到达角（AoA）分别记为 $\beta_{s,l}$ 与 $\theta_{s,l}$。则在远场假设下，时延可近似为 [6]

$$
\tau_{s,a,b,l}(t)\approx\tau_{s,l}
+\frac{(a-1)d_{\rm BS}\cos(\theta_{s,l})}{c}
+\frac{(b-1)d_{\rm UT}\cos(\beta_{s,l})}{c}
-\frac{v_{\rm move}t\cos(\alpha_{\rm move}-\beta_{s,l})}{c}, \tag{5}
$$

其中 $d_{\rm BS}$ 与 $d_{\rm UT}$ 分别为 BS 与 UT 侧天线间距，$\tau_{s,l}$ 由第 $l$ 条 MPC 在坐标 $s_{\rm BS}$ 与 $s$ 之间的传播距离决定，$c$ 为光速。

把 (5) 代入 (4)，CIR 可写为

$$
\begin{aligned}
\tilde h_{a,b}(t,\tau)=\sum_{l=1}^{L(s)}
&\underbrace{\kappa_{s,l}e^{-j2\pi f_c\tau_{s,l}}}_{\alpha_{s,l}}
e^{j2\pi\nu_{s,l}t}
e^{-j2\pi f_c\left(\frac{(a-1)d_{\rm BS}\cos(\theta_{s,l})}{c}
+\frac{(b-1)d_{\rm UT}\cos(\beta_{s,l})}{c}\right)}
\delta\left(\tau-\tau_{s,a,b,l}(t)\right),
\end{aligned} \tag{6}
$$

其中 $\nu_{s,l}=v_{\rm move}\cos(\alpha_{\rm move}-\beta_{s,l})/\lambda_c$ 为 $s_{\rm BS}$ 与 $s$ 之间第 $l$ 条 MPC 的多普勒频移，$\lambda_c$ 为波长。

根据 [28], [32], [33]，传播特性相近的 MPC 通常可归为一个簇（cluster），如图 2 所示。因此 (6) 中的 CIR 可进一步写为

$$
\begin{aligned}
\tilde h_{a,b}(t,\tau)=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
&\alpha_{s,l_{p,q}}e^{j2\pi\nu_{s,l_{p,q}}t}
e^{-j2\pi f_c\left(\frac{(a-1)d_{\rm BS}\cos\left(\theta_{s,l_{p,q}}\right)}{c}
+\frac{(b-1)d_{\rm UT}\cos\left(\beta_{s,l_{p,q}}\right)}{c}\right)}\\
&\times\delta\left(\tau-\tau_{s,a,b,l_{p,q}}(t)\right),
\end{aligned} \tag{7}
$$

其中 $\alpha_{s,l_{p,q}}$、$\theta_{s,l_{p,q}}$、$\beta_{s,l_{p,q}}$、$\tau_{s,a,b,l_{p,q}}(t)$ 与 $\nu_{s,l_{p,q}}$ 分别表示 $s$ 与 $s_{\rm BS}$ 之间第 $p$ 个簇中第 $q$ 条 MPC 的复增益、AoA、AoD、时延与多普勒频移；$l_{p,q}$ 表示该 MPC 在全部 MPC 中的索引；$P(s)$ 为 $s$ 与 $s_{\rm BS}$ 之间的簇数，$L_p(s)$ 为第 $p$ 个簇中的 MPC 数，满足 $L(s)=\sum_{p=1}^{P(s)}L_p(s)$。同一簇内不同 MPC 的角度与时延分布通常可用特定概率密度函数（PDF）很好近似 [26]–[28], [32]–[34]；此外，由于簇内 MPC 在空间上通常彼此接近（如图 2），对 $q\ne q'$ 有 $\mathbb E\{|\alpha_{s,l_{p,q}}|^2\}\approx\mathbb E\{|\alpha_{s,l_{p,q'}}|^2\}$ [26], [27]。与 (6) 相比，(7) 的模型反映了环境中 MPC 的簇结构，通常称为簇化 GBSM。

**图 2：** GBSM 与 PCF 之间的关系。

我们现在考虑单小区 TDD MIMO-OFDM 系统，其中 $N_c$ 表示子载波数，$N_g$ 为循环前缀（CP）长度。给定采样间隔 $T_s$，子载波间隔定义为 $\Delta f=\frac{1}{N_cT_s}$，每个 OFDM 符号的持续时间为 $T_{\rm sym}=(N_c+N_g)T_s$。假定信道在每个 OFDM 符号内准静态、但因多普勒效应在符号间变化。在此假设下，(7) 的 CIR 可变换到 SFT 域，第 $n$ 个 OFDM 符号中第 $k$ 个子载波对应的 SFT 信道传递函数（CTF）为

$$
\begin{aligned}
h_{a,b}\left(nT_{\rm sym},k\Delta f\right)=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
&\alpha_{s,l_{p,q}}e^{j2\pi\nu_{s,l_{p,q}}nT_{\rm sym}}
e^{-j2\pi f_c\left(\frac{(a-1)d_{\rm BS}\cos\left(\theta_{s,l_{p,q}}\right)}{c}
+\frac{(b-1)d_{\rm UT}\cos\left(\beta_{s,l_{p,q}}\right)}{c}\right)}\\
&\times e^{-j2\pi k\Delta f\tau_{s,a,b,l_{p,q}}(nT_{\rm sym})}.
\end{aligned} \tag{8}
$$

对满足 $v_{\rm move}nT_{\rm sym}/c\ll T_s$ 的 $n$，(8) 可进一步写为 [35]

$$
\begin{aligned}
h_{a,b}\left(nT_{\rm sym},k\Delta f\right)=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
&\alpha_{s,l_{p,q}}e^{j2\pi\nu_{s,l_{p,q}}nT_{\rm sym}}
e^{-j2\pi k\Delta f\tau_{s,l_{p,q}}}\\
&\times e^{-j2\pi(f_c+k\Delta f)\left(\frac{(a-1)d_{\rm BS}\cos\left(\theta_{s,l_{p,q}}\right)}{c}
+\frac{(b-1)d_{\rm UT}\cos\left(\beta_{s,l_{p,q}}\right)}{c}\right)}.
\end{aligned} \tag{9}
$$

对任意 $s\in\mathcal S$，给定每条 MPC 的参数 $[\alpha_{s,l_{p,q}},\beta_{s,l_{p,q}},\theta_{s,l_{p,q}},\tau_{s,l_{p,q}},\nu_{s,l_{p,q}}]^T$，即可按 (9) 重建对应位置处的 SFT 域信道。此外，若已知 UT 移动性，多普勒频移 $\nu_{s,l_{p,q}}$ 可由 $\beta_{s,l_{p,q}}$ 计算得到。把信道增益定义为 $\Theta_\alpha=[\beta,\theta,\tau]^T$ 的函数

$$
g_s(\Theta_\alpha)=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
\alpha_{s,l_{p,q}}\delta\left(\theta-\theta_{s,l_{p,q}}\right)
\delta\left(\beta-\beta_{s,l_{p,q}}\right)
\delta\left(\tau-\tau_{s,l_{p,q}}\right), \tag{10}
$$

则 (9) 中的 CTF 表达式可改写为

$$
\begin{aligned}
h_{a,b}\left(nT_{\rm sym},k\Delta f\right)=\iiint
&g_s(\Theta_\alpha)e^{j2\pi\nu nT_{\rm sym}}e^{-j2\pi k\Delta f\tau}\\
&\times e^{-j2\pi(f_c+k\Delta f)\frac{(a-1)d_{\rm BS}\cos(\theta)+(b-1)d_{\rm UT}\cos(\beta)}{c}}
\,d\theta d\beta d\tau,
\end{aligned} \tag{11}
$$

其中多普勒频移为 $\nu=v_{\rm move}\cos(\alpha_{\rm move}-\beta)/\lambda_c$。函数 $g_s(\Theta_\alpha)$ 刻画给定时延 UT 位置 $s$ 处 AoD–AoA–时延（AAD）域的信道行为；(9) 中的 CTF 完全由 $g_s(\Theta_\alpha)$ 决定，而后者仅由 $s_{\rm BS}$ 与 $s$ 之间的传播环境支配。为捕获每个位置处信道的统计特性，我们对所有 $s\in\mathcal S$ 定义函数 $S_s(\Theta_\alpha)=\mathbb E\{|g_s(\Theta_\alpha)|^2\}$，它描述 $s_{\rm BS}$ 与 $s$ 之间信道在 AAD 域的功率分布。下一小节研究 $S_s(\Theta_\alpha)$ 与各簇统计参数之间的关系，并据此引入 PCF 概念。

### B. 物理信道指纹

函数 $S_s(\Theta_\alpha)$ 统计性地刻画 BS 与 $s$ 之间的传播环境；其多域统一表示具有变换为不同形式 sCSI 以适应各类应用的潜力，这自然促使我们构造一个以位置为索引的图谱，其中每个条目对应作为 $s$ 处 PCF 的 $S_s(\Theta_\alpha)$。

然而，作为多维函数，直接为不同 $s\in\mathcal S$ 存储 $S_s(\Theta_\alpha)$ 以构成基于 PCF 的信道图谱在实践中不可行。反之，我们可以充分利用簇内物理参数的统计特性来重构 $S_s(\Theta_\alpha)$：采用适当函数表示，同一簇内 MPC 的时延 PDF 与角度 PDF 可被有效建模 [26]–[28], [34], [36]。于是 $S_s(\Theta_\alpha)$ 可近似为

$$
S_s(\Theta_\alpha)\approx\sum_{p=1}^{P(s)}
\gamma_{s,p}f^\beta_{s,p}(\beta)f^\theta_{s,p}(\theta)f^\tau_{s,p}(\tau), \tag{12}
$$

其中 $\gamma_{s,p}=\mathbb E\{\sum_{q=1}^{L_p(s)}|\alpha_{s,l_{p,q}}|^2\}$ 表示第 $p$ 个簇的平均功率，$f^\beta_{s,p}(\beta)$、$f^\theta_{s,p}(\theta)$ 与 $f^\tau_{s,p}(\tau)$ 分别表示第 $p$ 个簇中 MPC 的 AoD、AoA 与时延 PDF。(12) 中涉及的 PDF 通常可用单峰对称函数近似，如高斯分布 [26], [27]、Laplacian 分布 [28] 或 von Mises 分布 [36] 的 PDF。

采用 (12) 刻画 AAD 域功率分布后，基于 PCF 的信道图谱只需存储底层 PDF 的关键参数而非 $S_s(\Theta_\alpha)$ 的完整表示，即可高效压缩。我们可采用高斯分布 PDF 拟合不同簇的 $f^\beta_{s,p}(\beta)$、$f^\theta_{s,p}(\theta)$ 与 $f^\tau_{s,p}(\tau)$。例如 AoD 的 PDF $f^\beta_{s,p}(\beta)$ 可近似为

$$
f^\beta_{s,p}(\beta)=\frac{1}{\sqrt{2\pi}\sigma^\beta_{s,p}}
\exp\left(-\frac{\left(\beta-\bar\beta_{s,p}\right)^2}{2\left(\sigma^\beta_{s,p}\right)^2}\right), \tag{13}
$$

其中 $\bar\beta_{s,p}$ 与 $\sigma^\beta_{s,p}$ 分别为均值 AoD 与高斯分布的标准差。类似地，$f^\theta_{s,p}(\theta)$ 与 $f^\tau_{s,p}(\tau)$ 可分别用参数 $\{\bar\theta_{s,p},\sigma^\theta_{s,p}\}$ 与 $\{\bar\tau_{s,p},\sigma^\tau_{s,p}\}$ 表征。需要指出，由于时延固有的非负性，时延 PDF 更准确地应建模为区间 $[0,+\infty)$ 上的截断高斯分布 [28]。

给定 $p=1,2,\dots,P(s)$ 的参数 $\{\bar\beta_{s,p},\sigma^\beta_{s,p}\}$、$\{\bar\theta_{s,p},\sigma^\theta_{s,p}\}$、$\{\bar\tau_{s,p},\sigma^\tau_{s,p}\}$ 以及 $\gamma_{s,p}$，即可重建位置 $s$ 对应的 AAD 域功率分布。此时我们定义向量

$$
\mathbf m_{s,p}=\left[\bar\beta_{s,p},\sigma^\beta_{s,p},\bar\theta_{s,p},\sigma^\theta_{s,p},\bar\tau_{s,p},\sigma^\tau_{s,p},\gamma_{s,p}\right]^T, \tag{14}
$$

以及集合 $\mathcal M_s=\{\mathbf m_{s,p}\}_{p=1}^{P(s)}$。于是 $\mathcal M_s$ 可完整刻画 $s_{\rm BS}$ 与 $s$ 之间信道的物理性质；此外，在给定 UT 移动性与位置时，$\mathcal M_s$ 还可用于分析多普勒域的信道行为。用 $\mathcal M_s$ 替代 $S_s(\Theta_\alpha)$ 作为位置 $s$ 的 PCF，可显著减轻基于 PCF 的信道图谱的存储负担。因此 $\mathcal M_s$ 同时满足第 I 节所述物理驱动性质与存储高效性，本文全程采用其作为 PCF；其实际收益与应用将在后续各节讨论。

上述 PCF 是专门针对图 1 所示场景定义的，但其物理驱动性质为扩展到更贴近实际的 6G 传播场景提供了自然基础。具体地，所提 PCF 本质上兼容不同形式的信道非平稳性，包括空间、频率相关以及更长期的环境变化（如季节变化）；信道图谱亦可从静态的位置索引表示进一步扩展到纳入动态无线环境。在所有这些场景中，核心原理保持不变：PCF 用可扩展、物理可解释的参数集紧凑捕获传播环境的本质物理特性。

## III. 大规模 MIMO-OFDM 系统中的 PCF 获取

本节提出大规模 MIMO-OFDM 系统中 PCF 的获取方法：先建立 SFT 域信道模型及其与物理信道参数的关系；随后构造上行接收信号模型以进行 SFT 域信道估计；再由估计信道中用基于 SAGE 的算法提取不同 UT 位置处的 PCF。聚合这些位置特定 PCF，即可构建结构化的基于 PCF 的信道图谱，给出物理信道环境的位置索引表示。

### A. SFT 域信道模型

我们考虑图 1 所示场景，其中 BS 与 UT 侧分别配置 $A\times1$ 与 $B\times1$ 维 ULA。沿 OFDM 系统的子载波维，我们选取 $K$ 个有效子载波发送导频信号，记这些有效子载波的索引集合为 $\mathcal K=\{k_0,k_0+1,\dots,k_0+K-1\}$。沿时间维，假定 UT 在分析时段内于单个网格 $s$ 内移动；该时段被划分为多个帧，每帧含 $N_s$ 个 OFDM 符号。作为示例，图 3 给出 $B=1$ 特例下单帧内 SFT 域信道的结构：每帧进一步划分为 $N_p$ 个时隙（slot），每个时隙含 $N_b$ 个 OFDM 符号，即 $N_s=N_pN_b$；每个时隙中的首个 OFDM 符号（浅蓝色标出）分配给上行导频传输以支持信道估计，其余符号（浅红色标出）用于上下行数据传输。在该结构下，每帧有 $N_p$ 个导频段，两次导频传输之间的间隔等于一个时隙的时长。

**图 3：** $B=1$ 特例下 SFT 域信道张量的结构（单帧内时隙/OOFDM 符号划分，导频符号与数据符号的分配）。

为在给定 MIMO-OFDM 配置下生成某位置 $s$ 的 PCF，我们首先建立 BS 与 $s$ 之间的 SFT 域信道模型，并厘清 SFT 域信道与 PCF 的关系。分析按帧进行。设 $\tilde n$ 表示当前时隙索引，OFDM 符号索引沿时间维从 0 开始计数。由图 3 的帧结构，第 $\tilde n$ 个时隙连同其之前 $(N_p-1)$ 个时隙构成当前帧。记 $t_{\tilde n,n}\triangleq\tilde n-N_p+n$，则当前帧导频段中全部 OFDM 符号的索引集合为 $\mathcal T_{\tilde n}=\{t_{\tilde n,1}N_b,t_{\tilde n,2}N_b,\dots,t_{\tilde n,N_p}N_b\}$。我们进一步定义 $A\times K\times N_p\times B$ 张量 $\mathcal H^{\rm SFT}_{s,\tilde n}$，其中

$$
\left[\mathcal H^{\rm SFT}_{s,\tilde n}\right]_{a,k,n,b}
=h_{a,b}\left(t_{\tilde n,n}N_bT_{\rm sym},k\Delta f\right), \tag{15}
$$

用于表示当前帧导频段内全部有效子载波上 BS 与 UT 之间的 SFT 域信道，$h_{a,b}(\cdot)$ 的定义见 (9)。设 $\mathbf h^{\rm SFT}_{s,\tilde n}\triangleq{\rm vec}\{\mathcal H^{\rm SFT}_{s,\tilde n}\}$ 表示 $\mathcal H^{\rm SFT}_{s,\tilde n}$ 的向量化。由 (9)，$\mathbf h^{\rm SFT}_{s,\tilde n}$ 也可计算为

$$
\mathbf h^{\rm SFT}_{s,\tilde n}=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
\alpha_{s,l_{p,q}}\mathbf v^{\rm sft}_{\tilde n}\left(\beta_{s,l_{p,q}},\theta_{s,l_{p,q}},\tau_{s,l_{p,q}}\right), \tag{16}
$$

其中向量 $\mathbf v^{\rm sft}_{\tilde n}(\beta_{s,l_{p,q}},\theta_{s,l_{p,q}},\tau_{s,l_{p,q}})$ 满足

$$
\begin{aligned}
\left[\mathbf v^{\rm sft}_{\tilde n}(\beta,\theta,\tau)\right]_{bAKN_p+nAK+kA+a}
=\exp\Big\{j2\pi\Big[&-k\Delta f\tau
+\frac{v_{\rm move}\cos(\alpha_{\rm move}-\beta)t_{\tilde n,n}N_bT_{\rm sym}}{\lambda_c}\\
&-\frac{(f_c+k\Delta f)\left((a-1)d_{\rm BS}\cos(\theta)+(b-1)d_{\rm UT}\cos(\beta)\right)}{c}\Big]\Big\}.
\end{aligned} \tag{17}
$$

需要指出，(17) 中的多普勒频移已用 $\nu=v_{\rm move}\cos(\alpha_{\rm move}-\beta)/\lambda_c$ 替代。

定义如下向量：$\mathbf v^s_\theta(\theta)\in\mathbb C^{A\times1}$，其中 $[\mathbf v^s_\theta(\theta)]_a=e^{-j2\pi(a-1)f_c\frac{d_{\rm BS}}{c}\cos\theta}$；$\mathbf v_f(\tau)\in\mathbb C^{K\times1}$，其中 $[\mathbf v_f(\tau)]_k=e^{-j2\pi(k_0+k-1)\Delta f\tau}$；$\mathbf v^s_\beta(\beta)\in\mathbb C^{B\times1}$，其中 $[\mathbf v^s_\beta(\beta)]_b=e^{-j2\pi(b-1)f_c\frac{d_{\rm UT}}{c}\cos\beta}$；$\mathbf v^t_{\beta,\tilde n}(\beta)\in\mathbb C^{N_p\times1}$，其中 $[\mathbf v^t_{\beta,\tilde n}(\beta)]_n=e^{j2\pi t_{\tilde n,n}N_bT_{\rm sym}\frac{v_{\rm move}}{\lambda_c}\cos(\beta-\alpha_{\rm move})}$。具体地，当信道的空间宽带效应可忽略时，$\mathbf v^{\rm sft}_{\tilde n}(\beta,\theta,\tau)$ 可表示为 [37]

$$
\mathbf v^{\rm sft}_{\tilde n}(\beta,\theta,\tau)
=\mathbf v^s_\theta(\theta)\otimes\mathbf v_f(\tau)\otimes\mathbf v^{\rm st}_{\beta,\tilde n}(\beta), \tag{18}
$$

而 (16) 中的 SFT 域信道模型简化为

$$
\mathbf h^{\rm SFT}_{s,\tilde n}=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
\alpha_{s,l_{p,q}}\mathbf v^s_\theta\left(\theta_{s,l_{p,q}}\right)
\otimes\mathbf v_f\left(\tau_{s,l_{p,q}}\right)
\otimes\mathbf v^{\rm st}_{\beta,\tilde n}\left(\beta_{s,l_{p,q}}\right), \tag{19}
$$

其中 $\mathbf v^{\rm st}_{\beta,\tilde n}(\beta)=\mathbf v^t_{\beta,\tilde n}(\beta)\otimes\mathbf v^s_\beta(\beta)$。

式 (16) 与 (19) 建立了 SFT 域信道与各 MPC 物理参数 $\{\alpha_{s,l_{p,q}},\beta_{s,l_{p,q}},\theta_{s,l_{p,q}},\tau_{s,l_{p,q}}\}$ 之间的关系。由于 PCF 刻画这些参数的统计特性，估计单条 MPC 的物理参数是 PCF 获取的前提。

鉴于信道簇结构在估计 MPC 参数之前未知，我们重写 (16)，把 $\mathbf h^{\rm SFT}_{s,\tilde n}$ 表示为

$$
\mathbf h^{\rm SFT}_{s,\tilde n}=\sum_{l=1}^{L(s)}
\alpha_{s,l}\mathbf v^{\rm sft}_{\tilde n}\left(\beta_{s,l},\theta_{s,l},\tau_{s,l}\right), \tag{20}
$$

其中 $\{\alpha_{s,l},\beta_{s,l},\theta_{s,l},\tau_{s,l}\}$ 为待估计的第 $l$ 条 MPC 的参数。

在实际操作中，张量 $\mathcal H^{\rm SFT}_{s,\tilde n}$（或其向量化形式 $\mathbf h^{\rm SFT}_{s,\tilde n}$）通过上行测量获得 [38]。具体地，UT 在 $s$ 附近以恒定速度 $v_{\rm move}$、沿固定方向 $\alpha_{\rm move}$ 移动，其全部天线同时向 BS 发送上行导频信号，BS 再由接收信号估计 $\mathcal H^{\rm SFT}_{s,\tilde n}$。按帧进行联合多符号信道估计时，当前帧 BS 的接收信号可表示为

$$
\mathbf Y=\sum_{b=1}^{B}
\mathbf X^t_{b,\tilde n}\times_3\left(
\mathbf X^f_b\times_2\left[\mathcal H^{\rm SFT}_{s,\tilde n}\right]_{:,:,:,b}
\right)+\mathbf Z, \tag{21}
$$

其中 $\mathbf Y\in\mathbb C^{A\times K\times N_p}$，$[\mathbf Y]_{a,k,n}$ 为 BS 第 $a$ 个天线元在第 $n$ 个导频段第 $k$ 个 OFDM 信号上的接收信号；$\mathbf X^t_{b,\tilde n}\in\mathbb C^{N_p\times N_p}$ 与 $\mathbf X^f_b\in\mathbb C^{K\times K}$ 均为对角矩阵，分别为 $\mathbf X^f_b={\rm Diag}\{x^f_{b,k_0},x^f_{b,k_0+1},\dots,x^f_{b,k_0+K-1}\}$ 与 $\mathbf X^t_{b,\tilde n}={\rm Diag}\{x^t_{b,t_{\tilde n,1}},x^t_{b,t_{\tilde n,2}},\dots,x^t_{b,t_{\tilde n,N_p}}\}$；而 $x^t_{b,n}x^f_{b,k}$ 是 UT 第 $b$ 个天线元在第 $n$ 个 OFDM 符号第 $k$ 个子载波上发送的导频信号。

鉴于其在 SFT 域信道估计中的优越性质，我们采用二维时频相移导频（TFPSP）作为导频信号 [5], [8], [39]。TFPSP 通常由 Zadoff–Chu（ZC）序列经相移序列调制构造，一般格式为

$$
x^f_{b,k}=e^{-j2\pi k\varphi_b/K}\cdot e^{j2\pi\gamma_f\frac{k\left(k+\langle K\rangle_2\right)}{K}},
\quad k\in\mathcal K, \tag{22a}
$$
$$
x^t_{b,n}=e^{-j2\pi n\phi_b/N_p}\cdot e^{j2\pi\gamma_t\frac{n\left(n+\langle N_p\rangle_2\right)}{N_p}},
\quad n\in\mathbb N^+, \tag{22b}
$$

其中 $\varphi_b$ 与 $\phi_b$ 分别表示频域与时域的相移因子；$\gamma_f$ 与 $\gamma_t$ 分别表示频域与时域 ZC 序列的根，取为分别与 $K$、$N_p$ 互素的正整数。令 $\nu_{\max}=2v_{\rm move}/\lambda_c$、$N_f=\lceil KN_g/N_c\rceil$、$N_d=\lceil\nu_{\max}T_{\rm sym}N_s\rceil$。根据 [5] 中 TFPSP 的性质，当不同发射天线的相移因子充分分离时，其导频序列彼此不产生干扰。具体地，对任意两个不同天线元 $b$ 与 $b'$，若相移因子满足

$$
\left|\varphi_b-\varphi_{b'}\right|\ge N_f, \tag{23}
$$

或

$$
\left|\phi_b-\phi_{b'}\right|\ge N_d, \tag{24}
$$

则天线元之间的导频干扰可被消除。

在 (23) 与 (24) 条件下，令 $K_f=\lfloor K/N_f\rfloor$、$K_t=\lfloor N_p/N_d\rfloor$。当 $B\le K_fK_t$ 时，对 UT 第 $b$ 个天线，相移因子可设为

$$
\varphi_b=\left\langle b-1\right\rangle_{K_f}N_f,\qquad
\phi_b=\left\lfloor\frac{b-1}{K_f}\right\rfloor N_d, \tag{25}
$$

即可满足 (23) 或 (24) 之一。当 $B>K_fK_t$ 时，可通过生成不同的 $\gamma_f$ 与 $\gamma_t$ 取值来扩展导频容量 [8]。采用上述导频设置后，即可发送 TFPSP 并用 [40] 中的方法由接收信号 $\mathbf Y$ 估计 $\mathcal H^{\rm SFT}_{s,\tilde n}$。

### B. 由估计的 SFT 域信道生成 PCF

通过上一小节的导频设计与信道估计流程，我们得到 $\mathcal H^{\rm SFT}_{s,\tilde n}$ 的估计，记为 $\hat{\mathcal H}^{\rm SFT}_{s,\tilde n}$。随后可采用基于 SAGE 的方法以更高精度估计 MPC 参数。

设 $\hat{\mathbf h}^{\rm SFT}_{s,\tilde n}={\rm vec}\{\hat{\mathcal H}^{\rm SFT}_{s,\tilde n}\}$。从 $\hat{\mathbf h}^{\rm SFT}_{s,\tilde n}$ 提取 MPC 参数之前，MPC 数目通常未知，因此我们预先设定 $\hat L(s)$ 作为该场景中 MPC 数的期望值。对 MPC 参数 $\Theta=[\alpha,\beta,\theta,\tau]^T$，定义函数

$$
\mathbf h_{\tilde n}(\Theta)=\alpha\mathbf v^{\rm sft}_{\tilde n}(\beta,\theta,\tau). \tag{26}
$$

在最大似然（ML）准则 [41] 下，MPC 参数估计问题可理解为寻找 MPC 参数 $\hat\Phi_s=[\hat\Theta_{s,1},\hat\Theta_{s,2},\dots,\hat\Theta_{s,\hat L(s)}]$，使得

$$
\hat\Phi_s=\arg\min_{\left[\Theta_{s,1},\Theta_{s,2},\dots,\Theta_{s,\hat L(s)}\right]}
\left\|\hat{\mathbf h}^{\rm SFT}_{s,\tilde n}
-\sum_{l=1}^{\hat L(s)}\mathbf h_{\tilde n}(\Theta_{s,l})\right\|_F^2. \tag{27}
$$

在大规模 MIMO-OFDM 系统中，非相关散射假设近似成立 [42]，且 $l\ne l'$ 时 $\mathbf h_{\tilde n}(\Theta_{s,l})$ 与 $\mathbf h_{\tilde n}(\Theta_{s,l'})$ 可近似视为正交。这使 SAGE 算法可直接应用——SAGE 是期望最大化（EM）算法的一种变体，采用串行干扰消除（SIC）[13], [37], [43]。采用 SAGE 的显著优势在于：它执行完整的 MPC 参数估计，不受阵列几何或快照需求约束，并提供适合大维系统的计算高效、可扩展方案。据此，SAGE 算法把 (27) 中计算密集的 $\hat\Phi_s$ 全局搜索转化为 $\hat\Theta_{s,1},\hat\Theta_{s,2},\dots,\hat\Theta_{s,\hat L(s)}$ 的序贯估计。在对第 $l$ 条 MPC 的参数估计中，定义

$$
\hat{\mathbf h}^{\rm SFT}_{s,\tilde n,l}=
\begin{cases}
\hat{\mathbf h}^{\rm SFT}_{s,\tilde n}, & l=1,\\[2pt]
\hat{\mathbf h}^{\rm SFT}_{s,\tilde n}-\sum_{l'=1}^{l-1}\mathbf h_{\tilde n}\left(\hat\Theta_{s,l'}\right), & l=2,3,\dots,\hat L(s),
\end{cases} \tag{28}
$$

而所提基于 SAGE 方法的目的是寻找满足

$$
\hat\Theta_{s,l}=\arg\min_{\Theta_{s,l}}
\left\|\hat{\mathbf h}^{\rm SFT}_{s,\tilde n,l}-\mathbf h_{\tilde n}(\Theta_{s,l})\right\|_F^2 \tag{29}
$$

的参数组 $\hat\Theta_{s,l}$，直至估计出 $\hat L(s)$ 个 MPC 参数向量。

在非相关散射假设下，把原问题 (27) 重述为等价问题 (29) 后，后者可用 [37] 提出的宽带信道参数估计算法高效求解。具体地，当 SFT 信道表示为 (19) 形式时，可证明参数 $\alpha_{s,l},\beta_{s,l},\theta_{s,l},\tau_{s,l}$ 构成互许数据（mutually admissible data）[13], [43]；该性质使得可以利用 [13] 的估计框架高效求解 (29)。

利用估计出的 MPC 参数，把 $\hat L(s)$ 组 MPC 参数划分为 $P$ 个组，每组对应一个不同的簇。以 $\gamma_{s,l}=|\alpha_{s,l}|^2$ 作为第 $l$ 条 MPC 的功率，可采用基于核功率密度（KPD）的算法 [44], [45] 按相似性对 MPC 聚类；$P$ 的取值可通过最小化 Davies–Bouldin（DB）指数 [44] 确定。具体地，利用各簇中的 MPC 样本，应用 (12)–(13) 定义的函数，即可为每簇获得平滑且具有物理意义的 PCF。该统计平均与基于模型的拟合过程有效滤除不相关噪声，确保提取的 PCF 捕获稳定的大尺度散射特性而非瞬时起伏。通过让 UT 穿越不同网格并收集相应 PCF，即可构建基于 PCF 的信道图谱，刻画整个小区覆盖范围内 BS 与 UT 之间信道的物理性质。当新的移动 UT 进入覆盖区时，BS 可依据 UT 位置从小区特定信道图谱中检索相关 PCF，并结合该 UT 的天线配置与移动状态生成所需 sCSI。由于 PCF 到 sCSI 的变换作用于平滑后的 PCF，所得 sCSI 本质上对测量不完美具有鲁棒性；这使环境感知通信无需在线信道探测即可实现。下一节给出把 PCF 变换为 UT 特定 sCSI 的详细流程。

> **原文疑点：** 式 (28) 的残差更新中，求和指标为 $l'$（$l'=1,\dots,l-1$），但被加项在原文排版中写作 $\mathbf h_{\tilde n}(\hat\Theta_{s,l})$（索引仍为 $l$）；按 SAGE 的串行干扰消除含义，应为 $\mathbf h_{\tilde n}(\hat\Theta_{s,l'})$。本译按上下文写作 $\hat\Theta_{s,l'}$ 并在此说明原文排版问题。

## IV. 利用 PCF 获取统计 CSI

本节提出由 PCF 获取波束域 sCSI 的方法：先引入三重 BBCM 并建立其与 GBSM 的关系；随后导出波束域 sCSI 的表达式，并开发由 PCF 获取它的低复杂度算法。

**图 4：** 利用 PCF 获取 sCSI 的流程。

### A. BBCM

我们先介绍 BBCM 的概念。为简便，考虑 UT 配备单天线（即 $B=1$）、BS 配置 $A\times1$ ULA 且阵元间距为半波长（即 $d_{\rm BS}=0.5\lambda_c$）的情形；若 BS 与 UT 两侧考虑更复杂的天线配置，可用类似方法分析信道模型。

假定 UT 在一段时间内于网格 $s$ 内移动，速度 $v_{\rm move}$、方向 $\alpha_{\rm move}$。根据 (9)，UT 与 BS 第 $a$ 个天线元之间在第 $n$ 个符号第 $k$ 个子载波上的 CTF 可重写为

$$
\begin{aligned}
h_a\left(nT_{\rm sym},k\Delta f\right)=\sum_{p=1}^{P(s)}\sum_{q=1}^{L_p(s)}
&\alpha_{s,l_{p,q}}e^{j2\pi\nu_{s,l_{p,q}}nT_{\rm sym}}
e^{-j2\pi(f_c+k\Delta f)(a-1)\frac{d_{\rm BS}}{c}\vartheta_{s,l_{p,q}}}
e^{-j2\pi k\Delta f\tau_{s,l_{p,q}}},
\end{aligned} \tag{30}
$$

其中 UT 天线索引 $b$ 因单天线设置被省略，参数 $\vartheta_{s,l_{p,q}}=\cos\theta_{s,l_{p,q}}$ 表示角度余弦，多普勒频移为 $\nu_{s,l_{p,q}}=v_{\rm move}\cos(\alpha_{\rm move}-\beta_{s,l_{p,q}})/\lambda_c$。我们继续采用图 3 的帧结构。则对第 $\tilde n$ 个时隙，当前帧内 BS 与 UT 之间的 SFT 域信道可表示为 $A\times K\times N_p$ 维张量 $\mathcal H^{\rm SFT}_{s,\tilde n}$，其中 $[\mathcal H^{\rm SFT}_{s,\tilde n}]_{a,k,n}=h_a(t_{\tilde n,n}N_bT_{\rm sym},k\Delta f)$。

由角度余弦的定义有 $\vartheta_{s,l_{p,q}}\in\mathcal B_\vartheta$，其中 $\mathcal B_\vartheta=[-1,1)$。令 $\mathcal B_\tau=[0,1/\Delta f)$，时延满足 $\tau_{s,l_{p,q}}\le N_gT_s<1/\Delta f$，故 $\tau_{s,l_{p,q}}\in\mathcal B_\tau$。多普勒频移 $\nu_{s,l_{p,q}}$ 位于 $[-\nu_{\max}/2,\nu_{\max}/2]$，其中 $\nu_{\max}\triangleq2v_{\rm move}/\lambda_c$。对所述帧结构，当 $N_b<1/(T_{\rm sym}\nu_{\max})$ 时 $\nu_{\max}<1/(N_bT_{\rm sym})$，故 $\nu_{s,l_{p,q}}$ 的范围可进一步约束到 $\mathcal B_\nu$，其中 $\mathcal B_\nu=[-1/(2N_bT_{\rm sym}),1/(2N_bT_{\rm sym})]$。

为应对实际信道建模中处理连续域的困难，我们把 $\mathcal B_\vartheta$、$\mathcal B_\tau$ 与 $\mathcal B_\nu$ 离散为有限网格。设角度余弦、时延与多普勒域的量化点数分别为 $N_\vartheta$、$N_\tau$、$N_\nu$，量化点定义为：$\vartheta_n\triangleq\frac{n-1-N_\vartheta/2}{0.5N_\vartheta}$、$\tau_n\triangleq\frac{n-1}{N_\tau\Delta f}$、$\nu_n\triangleq\frac{(n-1-N_\nu/2)}{N_\nu N_bT_{\rm sym}}$。把这些量化点汇成集合 $\mathcal S_\vartheta\triangleq\{\vartheta_1,\vartheta_2,\dots,\vartheta_{N_\vartheta}\}$、$\mathcal S_\tau\triangleq\{\tau_1,\tau_2,\dots,\tau_{N_\tau}\}$、$\mathcal S_\nu\triangleq\{\nu_1,\nu_2,\dots,\nu_{N_\nu}\}$；当 $N_\vartheta$、$N_\tau$、$N_\nu$ 足够大时，它们可分别近似连续域 $\mathcal B_\vartheta$、$\mathcal B_\tau$、$\mathcal B_\nu$。$\mathcal S_\vartheta$、$\mathcal S_\tau$、$\mathcal S_\nu$ 中的每个点可解释为指向特定角度余弦、时延或多普勒频移的物理波束。如 [5] 所述，离散角度域 $\mathcal S_\vartheta$、离散时延域 $\mathcal S_\tau$ 与离散多普勒域 $\mathcal S_\nu$ 分别称为空间波束域、频率波束域与时间波束域；三者合称三重波束（TB）域。

为分析 TB 域的信道特性，我们把 $\mathcal B_\vartheta$、$\mathcal B_\tau$ 与 $\mathcal B_\nu$ 划分为 $\mathcal B_\vartheta=\bigcup_{n=1}^{N_\vartheta}\mathcal B^n_\vartheta$、$\mathcal B_\tau=\bigcup_{n=1}^{N_\tau}\mathcal B^n_\tau$ 与 $\mathcal B_\nu=\bigcup_{n=1}^{N_\nu}\mathcal B^n_\nu$，其中 $\mathcal B^n_\vartheta=\left[\frac{n-1-0.5N_\vartheta}{0.5N_\vartheta},\frac{n-0.5N_\vartheta}{0.5N_\vartheta}\right)$、$\mathcal B^n_\tau=\left[\frac{n-1}{N_\tau\Delta f},\frac{n}{N_\tau\Delta f}\right)$、$\mathcal B^n_\nu=\left[\frac{n-1-0.5N_\nu}{N_\nu N_bT_{\rm sym}},\frac{n-0.5N_\nu}{N_\nu N_bT_{\rm sym}}\right)$。当 $N_\vartheta$、$N_\tau$、$N_\nu$ 足够大时，子区间 $\mathcal B^n_\vartheta$、$\mathcal B^n_\tau$、$\mathcal B^n_\nu$ 也足够窄；此时任意 $\vartheta\in\mathcal B^n_\vartheta$、$\tau\in\mathcal B^n_\tau$、$\nu\in\mathcal B^n_\nu$ 可分别用 $\vartheta_n=\frac{n-1-0.5N_\vartheta}{0.5N_\vartheta}$、$\tau_n=\frac{n-1}{N_\tau\Delta f}$、$\nu_n=\frac{n-1-0.5N_\nu}{N_\nu N_bT_{\rm sym}}$ 近似。

令 $\mathcal B^{n_\vartheta,n_\tau,n_\nu}_{\rm TB}=\mathcal B^{n_\vartheta}_\vartheta\times\mathcal B^{n_\tau}_\tau\times\mathcal B^{n_\nu}_\nu$，并定义

$$
\alpha_{s,n_\vartheta,n_\tau,n_\nu}
=\sum_{\substack{(p,q):\left\{\vartheta_{s,l_{p,q}},\tau_{s,l_{p,q}},\nu_{s,l_{p,q}}\right\}
\in\mathcal B^{n_\vartheta,n_\tau,n_\nu}_{\rm TB}\\ 1\le p\le P(s),\ 1\le q\le L_p(s)}}
\alpha_{s,l_{p,q}}, \tag{31}
$$

表示位于 $\mathcal B^{n_\vartheta,n_\tau,n_\nu}_{\rm TB}$ 内全部 MPC 沿 TB 域的增益之和。于是 $\alpha_{s,n_\vartheta,n_\tau,n_\nu}$ 即 TB 域中第 $(n_\vartheta,n_\tau,n_\nu)$ 个波束对应的信道增益。据此，(30) 中的 CTF 可借助 $\alpha_{s,n_\vartheta,n_\tau,n_\nu}$ 表示为

$$
\begin{aligned}
h_a\left(nT_{\rm sym},k\Delta f\right)=\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
&\alpha_{s,n_\vartheta,n_\tau,n_\nu}\cdot e^{j2\pi\nu_{n_\nu}nT_{\rm sym}}\\
&\cdot e^{-j2\pi(f_c+k\Delta f)(a-1)\frac{d_{\rm BS}}{c}\vartheta_{n_\vartheta}}
\cdot e^{-j2\pi k\Delta f\tau_{n_\tau}}.
\end{aligned} \tag{32}
$$

根据系统配置与帧结构，我们可定义如下矩阵：$\mathbf V^f\in\mathbb C^{K\times N_\tau}$ 与 $\mathbf V^t_{\tilde n}\in\mathbb C^{N_p\times N_\nu}$，其中 $[\mathbf V^f]_{k,n_\tau}=e^{-j2\pi k\Delta f\tau_{n_\tau}}$、$[\mathbf V^t_{\tilde n}]_{n,n_\nu}=e^{j2\pi\nu_{n_\nu}t_{\tilde n,n}N_bT_{\rm sym}}$；以及张量 $\mathcal V^s\in\mathbb C^{A\times K\times N_\vartheta\times K}$，其中 $[\mathcal V^s]_{a,k,n_\vartheta,k}=e^{-j2\pi(f_c+k\Delta f)(a-1)\frac{d_{\rm BS}}{c}\vartheta_{n_\vartheta}}$。由 (32)，$\mathcal H^{\rm SFT}_{s,\tilde n}$ 可进一步用 $\mathcal V^s$、$\mathbf V^f$ 与 $\mathbf V^t_{\tilde n}$ 表示为

$$
\mathcal H^{\rm SFT}_{s,\tilde n}
=\mathcal V^s*_2\left(\mathbf V^f\times_2\left(
\mathbf V^t_{\tilde n}\times_3\mathcal H^{\rm TB}_s\right)\right), \tag{33}
$$

其中 $\mathcal H^{\rm TB}_s\in\mathbb C^{N_\vartheta\times N_\tau\times N_\nu}$ 表示位置 $s$ 处 TB 域信道张量，满足 $[\mathcal H^{\rm TB}_s]_{n_\vartheta,n_\tau,n_\nu}=\alpha_{s,n_\vartheta,n_\tau,n_\nu}$。需要指出，当空间宽带效应可忽略时，$\mathcal V^s$ 退化为 $\mathbf V^s\in\mathbb C^{A\times N_\vartheta}$，其中 $[\mathbf V^s]_{a,n_\vartheta}=e^{-j2\pi(a-1)d_{\rm BS}\vartheta_{n_\vartheta}/\lambda_c}$，且 (33) 简化为 [6]

$$
\mathcal H^{\rm SFT}_{s,\tilde n}
=\mathbf V^s\times_1\left(\mathbf V^f\times_2\left(
\mathbf V^t_{\tilde n}\times_3\mathcal H^{\rm TB}_s\right)\right). \tag{34}
$$

为便于后续推导，我们采用 (34) 的模型分析，类似方法亦适用于 (33)。由于 (33) 与 (34) 都建立 TB 域与 SFT 域信道之间的关系，我们将其统称为**三重 BBCM**。除所提三重 BBCM 外，分别对角度域或角度–时延域量化，还可得到一维 BBCM [12] 与二维 BBCM（也称双重 BBCM）[8]。与 GBSM 不同，BBCM 是用离散波束表示近似连续物理域的统计模型；这种建模方式在信道获取与传输设计中日益受到青睐 [46]。

### B. TB 域 sCSI

对大规模 MIMO-OFDM 系统，由于传播环境中簇数量有限，$\mathcal H^{\rm TB}_s$ 往往稀疏，且稀疏性存在于其三个维度上 [5]。与 SFT 域信道张量 $\mathcal H^{\rm SFT}_{s,\tilde n}$ 相比，$\mathcal H^{\rm TB}_s$ 中主导元素的数量显著减少。对 sCSI，假定不同波束间的信道系数服从零均值、方差互不相同的独立循环对称复高斯分布，则可定义如下张量 [31]：

$$
\mathcal W_s=\mathbb E\left\{\mathcal H^{\rm TB}_s\odot
\left(\mathcal H^{\rm TB}_s\right)^*\right\}. \tag{35}
$$

于是 $\mathcal W_s$ 即 TB 域功率分布张量，其第 $(n_\vartheta,n_\tau,n_\nu)$ 个元素对应 TB 域第 $(n_\vartheta,n_\tau,n_\nu)$ 个波束的功率。定义 SFT 域信道协方差矩阵 $\mathbf R^{\rm SFT}_{s,\tilde n}=\mathbb E\{{\rm vec}(\mathcal H^{\rm SFT}_{s,\tilde n})({\rm vec}(\mathcal H^{\rm SFT}_{s,\tilde n}))^H\}$。采用 (34) 的信道模型，$\mathbf R^{\rm SFT}_{s,\tilde n}$ 也可用 $\mathcal W_s$ 表示为 [5], [8]

$$
\mathbf R^{\rm SFT}_{s,\tilde n}=\mathbf V\,{\rm Diag}\left({\rm vec}(\mathcal W_s)\right)\mathbf V^H, \tag{36}
$$

其中 $\mathbf V\triangleq\mathbf V^t_{\tilde n}\otimes\mathbf V^f\otimes\mathbf V^s$。

鉴于其稀疏性与慢时变特性，$\mathcal W_s$ 可用于多种应用，包括导频设计 [5]、信道估计 [6] 与预编码 [23]。按定义，$\mathcal W_s$ 既与 BS 和 $s$ 之间的传播环境有关，也与 UT 的移动性有关；这使在给定 $s$ 处 PCF 与 UT 移动性时可用适当方法生成 $\mathcal W_s$，如图 4 所示。为此，我们旨在提出一种直接由 PCF 获取 $\mathcal W_s$ 的方法，从而消除传统 $\mathcal W_s$ 获取方法所带来的探测开销。

**注 1：** 现有文献中，空间波束域能量分布向量（一维波束域 sCSI）与空–频（SF）波束域能量分布矩阵（SF 波束域 sCSI）均可作为 CF [8], [21], [24], [25]。然而，$\mathcal W_s$ 不能直接充当 $s$ 的 CF，因为它在时间波束域（即离散多普勒域）上的分布不仅取决于位置，还取决于 UT 移动性。

### C. 由 PCF 获取 $\mathcal W_s$

对任意 $s\in\mathcal S$，一旦获得 PCF $\mathcal M_s$，即可用 (12) 重建 AAD 域功率分布 $S_s(\Theta_\alpha)$。由于 SFT 域信道 $\mathcal H^{\rm SFT}_{s,\tilde n}$ 深受 MPC 参数影响（见 (30)），相应协方差矩阵 $\mathbf R^{\rm SFT}_{s,\tilde n}$ 也与 MPC 参数的统计量 $S_s(\Theta_\alpha)$ 密切相关。根据 [42]，我们采用常见的非相关散射近似，即不同方向上的信道增益统计不相关。于是对参数向量 $\Theta_\alpha=[\beta,\theta,\tau]^T$ 与 $\bar\Theta_\alpha=[\bar\beta,\bar\theta,\bar\tau]^T$，有 $\mathbb E\{g_s(\Theta_\alpha)g_s^*(\bar\Theta_\alpha)\}=S_s(\Theta_\alpha)\delta(\beta-\bar\beta)\delta(\theta-\bar\theta)\delta(\tau-\bar\tau)$。因此协方差矩阵 $\mathbf R^{\rm SFT}_{s,\tilde n}$ 可完全由 $S_s(\Theta_\alpha)$ 刻画为

$$
\mathbf R^{\rm SFT}_{s,\tilde n}
=\iiint S_s(\Theta_\alpha)\mathbf v^{\rm sft}_{\tilde n}(\beta,\theta,\tau)
\left[\mathbf v^{\rm sft}_{\tilde n}(\beta,\theta,\tau)\right]^H
d\theta d\beta d\tau. \tag{37}
$$

式 (36) 与 (37) 分别建立了 $\mathbf R^{\rm SFT}_{s,\tilde n}$ 与波束域 sCSI、以及 $\mathbf R^{\rm SFT}_{s,\tilde n}$ 与 $S_s(\Theta_\alpha)$ 之间的关系。借助这些关系，由 PCF 生成 sCSI 的过程可按如下步骤进行：首先，基于 PCF $\mathcal M_s$ 构造 $S_s(\Theta_\alpha)$；随后，用 (37) 由 $S_s(\Theta_\alpha)$ 导出相应协方差矩阵 $\mathbf R^{\rm SFT}_{s,\tilde n}$；最后，把获取 $\mathcal W_s$ 的问题表述为优化任务，其目标是寻找非负实值张量 $\mathcal W$ 使得

$$
\mathbf R^{\rm SFT}_{s,\tilde n}=\mathbf V\,{\rm Diag}\left({\rm vec}(\mathcal W)\right)\mathbf V^H. \tag{38}
$$

该问题本质上是稀疏信号恢复问题。然而常用稀疏信号重建算法通常面向复值信号恢复 [8]，非负实值条件难以满足。为此，我们提出一种求解 $\mathcal W$ 的新方法。

由于其非负性，功率分布张量可写成两个实张量的逐元素积，即 $\mathcal W=\mathcal Q\odot\mathcal Q$，其中 $\mathcal Q\in\mathbb R^{N_\vartheta\times N_\tau\times N_\nu}$。于是由 PCF 获取 $\mathcal W$ 的问题转化为获取实张量 $\mathcal Q$，从而避免 $\mathcal W$ 的非负约束。另一方面，当 $\mathbf R^{\rm SFT}_{s,\tilde n}$ 由 PCF 生成时，将其变换到 TB 域的自然想法是计算 ${\rm diag}\{\mathbf V^H\mathbf R^{\rm SFT}_{s,\tilde n}\mathbf V\}$ [8]。因此，一旦 (38) 成立，$\mathcal Q$ 还应满足

$$
{\rm diag}\left\{\mathbf V^H\mathbf V\,{\rm Diag}\left({\rm vec}(\mathcal Q\odot\mathcal Q)\right)\mathbf V^H\mathbf V\right\}
={\rm diag}\left\{\mathbf V^H\mathbf R^{\rm SFT}_{s,\tilde n}\mathbf V\right\}, \tag{39}
$$

其中两侧均为尺寸 $N_\vartheta N_\tau N_\nu\times1$ 的实向量。为进一步简化 (39) 两侧计算，我们将其重塑为 $N_\vartheta\times N_\tau\times N_\nu$ 张量，分别记为 $\mathcal A(\mathcal Q)$ 与 $\bar{\mathcal A}$。为量化 $\mathcal A(\mathcal Q)$ 与 $\bar{\mathcal A}$ 的相似性，我们采用 Kullback–Leibler（KL）散度作为度量 [6]。按其定义，$\mathcal A(\mathcal Q)$ 与 $\bar{\mathcal A}$ 之间的 KL 散度为

$$
\begin{aligned}
\mathcal L(\mathcal Q)=\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
&[\bar{\mathcal A}]_{n_\vartheta,n_\tau,n_\nu}
\log\frac{[\bar{\mathcal A}]_{n_\vartheta,n_\tau,n_\nu}}{[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}\\
&+\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}
-\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
[\bar{\mathcal A}]_{n_\vartheta,n_\tau,n_\nu}.
\end{aligned} \tag{40}
$$

KL 散度越小表示匹配越好。据此，问题可表述为

$$
\mathcal Q^*=\arg\min_{\mathcal Q}\mathcal L(\mathcal Q). \tag{41}
$$

在实际算法执行中，$\mathcal A(\mathcal Q)$ 也可直接按如下方式计算：

$$
\mathcal A(\mathcal Q)=\mathcal T^s\times_1\left(
\mathcal T^f\times_2\left(\mathcal T^t\times_3(\mathcal Q\odot\mathcal Q)\right)\right), \tag{42}
$$

其中

$$
\mathcal T^s=\left((\mathbf V^s)^H\mathbf V^s\right)\odot\left((\mathbf V^s)^H\mathbf V^s\right)^*, \tag{43a}
$$
$$
\mathcal T^f=\left((\mathbf V^f)^H\mathbf V^f\right)\odot\left((\mathbf V^f)^H\mathbf V^f\right)^*, \tag{43b}
$$
$$
\mathcal T^t=\left((\mathbf V^t_{\tilde n})^H\mathbf V^t_{\tilde n}\right)\odot
\left((\mathbf V^t_{\tilde n})^H\mathbf V^t_{\tilde n}\right)^*. \tag{43c}
$$

通过执行 (42)–(43) 计算 $\mathcal A(\mathcal Q)$，可绕过对角化与重塑操作。

对 (41) 中的优化问题，我们先给出如下定理以支撑后续求解。

**定理 1：** $\mathcal L(\mathcal Q)$ 的梯度为

$$
\frac{\partial\mathcal L(\mathcal Q)}{\partial\mathcal Q}
=2\mathcal Q\odot\left(\mathcal T^s\times_1\left(
\mathcal T^f\times_2\left(\mathcal T^t\times_3\mathcal C\right)\right)\right), \tag{44}
$$

其中 $\mathcal C\in\mathbb R^{N_\vartheta\times N_\tau\times N_\nu}$ 满足

$$
[\mathcal C]_{n_\vartheta,n_\tau,n_\nu}
=1-\frac{[\bar{\mathcal A}]_{n_\vartheta,n_\tau,n_\nu}}
{[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}. \tag{45}
$$

**证明：** 见附录 A。

由 (44) 给出的梯度，我们可用梯度下降法在第 $d$ 次迭代中更新 $\mathcal Q$：

$$
\mathcal Q^{(d+1)}=\mathcal Q^{(d)}
-\delta^{(d)}\frac{\partial\mathcal L\left(\mathcal Q^{(d)}\right)}{\partial\mathcal Q^{(d)}}, \tag{46}
$$

其中 $\delta^{(d)}$ 为步长。详细的 sCSI 获取方法见算法 1。可以看出，所提算法 1 仅依赖张量积运算，从而避免了矩阵求逆等计算密集过程。

**算法 1　sCSI 获取**

输入：PCF $\mathcal M_s$、波束矩阵 $\mathbf V^s$、$\mathbf V^f$ 与 $\mathbf V^t_{\tilde n}$、UT 的移动性

输出：sCSI $\mathcal W_s$

1. 由 PCF 生成 $\mathbf R^{\rm SFT}_{s,\tilde n}$；
2. 选取最大迭代次数 $d_{\max}$、最小步长 $\delta_{\min}$ 以及调整步长的参数 $\rho\in(0,1]$；
3. 初始化：$d=0$，为 $\delta^{(0)}$ 选取合适值，$\left[\mathcal Q^{(0)}\right]_{n_\vartheta,n_\tau,n_\nu}=\sqrt{\left[\bar{\mathcal A}/(N_\vartheta N_\tau N_\nu)\right]_{n_\vartheta,n_\tau,n_\nu}}$（对 $\mathcal Q^{(0)}$ 中所有元素）；
4. **repeat**
5. 　按 (44) 计算 $\frac{\partial\mathcal L(\mathcal Q)}{\partial\mathcal Q}$；
6. 　按 (46) 更新 $\mathcal Q^{(d+1)}$；
7. 　**if** $\mathcal L(\mathcal Q^{(d+1)})>\mathcal L(\mathcal Q^{(d)})$ **then**
8. 　　$\delta^{(d)}=\rho\delta^{(d)}$，$\mathcal Q^{(d+1)}=\mathcal Q^{(d)}$；
9. 　**else**
10. 　　break；
11. 　**end if**
12. 　$d=d+1$；
13. **until** $d=d_{\max}$ 或 $\delta^{(d)}\le\delta_{\min}$
14. **return** $\mathcal W_s=\mathcal Q^{(d)}\odot\mathcal Q^{(d)}$。

由第 IV-A 节的定义，波束矩阵 $\mathbf V^s$、$\mathbf V^f$ 与 $\mathbf V^t_{\tilde n}$ 均可由 DFT 矩阵或其部分变体经初等变换得到。具体地，$\mathbf V^s=\left[\mathbf F_{N_\vartheta,N_\vartheta/2}\right]_{1:A,:}$、$\mathbf V^f=\left[\mathbf F_{N_\tau}\right]_{K,:}$、$\mathbf V^t_{\tilde n}=\left[\boldsymbol\Gamma_{N_\nu,t_{\tilde n,1}}\mathbf F^*_{N_\nu,N_\nu/2}\right]_{1:N_p,:}$。借助这些波束矩阵的结构化形式，算法 1 的实现可进一步简化。基于这一观察，我们给出定理 2。

**定理 2：** 矩阵 $\mathcal T^s$、$\mathcal T^f$ 与 $\mathcal T^t$ 均为循环矩阵，且

$$
\mathcal T^s=\mathbf F^H_{N_\vartheta}\,{\rm Diag}\{\mathbf t_s\}\mathbf F_{N_\vartheta}, \tag{47a}
$$
$$
\mathcal T^f=\mathbf F^H_{N_\tau}\,{\rm Diag}\{\mathbf t_f\}\mathbf F_{N_\tau}, \tag{47b}
$$
$$
\mathcal T^t=\mathbf F^H_{N_\nu}\,{\rm Diag}\{\mathbf t_t\}\mathbf F_{N_\nu}, \tag{47c}
$$

其中

$$
\mathbf t_s=\frac{1}{N_\vartheta}\mathbf F_{N_\vartheta}
\left[\left(\mathbf F^H_{N_\vartheta}\mathbf p_s\right)\odot
\left(\mathbf F^H_{N_\vartheta}\mathbf p_s\right)^*\right], \tag{48a}
$$
$$
\mathbf t_f=\frac{1}{N_\tau}\mathbf F_{N_\tau}
\left[\left(\mathbf F^H_{N_\tau}\mathbf p_f\right)\odot
\left(\mathbf F^H_{N_\tau}\mathbf p_f\right)^*\right], \tag{48b}
$$
$$
\mathbf t_t=\frac{1}{N_\nu}\mathbf F_{N_\nu}
\left[\left(\mathbf F^H_{N_\nu}\mathbf p_t\right)\odot
\left(\mathbf F^H_{N_\nu}\mathbf p_t\right)^*\right], \tag{48c}
$$

且 $\mathbf p_s=[\mathbf 1_{1\times A},\mathbf 0_{1\times(N_\vartheta-A)}]^T$、$\mathbf p_f=[\mathbf 0_{1\times(k_0-1)},\mathbf 1_{1\times K},\mathbf 0_{1\times(N_\tau-K-k_0+1)}]^T$、$\mathbf p_t=\boldsymbol\Gamma_{N_\nu,t_{\tilde n,1}}\left([1,\mathbf 0_{1\times(N_\nu-N_p)},\mathbf 1_{1\times(N_p-1)}]^T\right)$。

**证明：** 见附录 B。

根据定理 2，(42) 中的 $n$-mode 积运算可用 FFT 高效加速。用 (47a)–(47c) 的表达式替换 $\mathcal T^s$、$\mathcal T^f$、$\mathcal T^t$ 可把其计算复杂度降至 $O(N_\vartheta N_\tau N_\nu\log_2N_\vartheta+N_\vartheta N_\tau N_\nu\log_2N_\tau+N_\vartheta N_\tau N_\nu\log_2N_\nu)$。该结果刻画了所提算法 1 的核心在线开销。为进一步分析其复杂度与开销，我们与 [5] 中标准在线探测方法作理论比较（该方法也是下一节的仿真基线）。两种方法均依赖迭代更新；令 $d_{\max,{\rm probing}}$ 与 $d_{\max,{\rm PCF}}$ 分别表示二者收敛所需迭代数。为 $U$ 个 UT 生成 $N_\vartheta\times N_\tau\times N_\nu$ 维 TB 域 sCSI 的整体在线计算复杂度汇总于表 II。

**表 II：** 获取 sCSI 的计算复杂度与开销对比。

| 方法类别 | 导频开销 | SF 波束域 sCSI 的计算复杂度 | TB 域 sCSI 的计算复杂度 |
|---|---|---|---|
| 在线探测 | 有 | $O(AKN_\vartheta N_\tau d_{\max,{\rm probing}}U)$ | $O(AKN_pN_\vartheta N_\tau N_\nu d_{\max,{\rm probing}}U)$ |
| 所提 PCF 方法 | 无 | $O\left((N_\vartheta N_\tau\log_2N_\vartheta+N_\vartheta N_\tau\log_2N_\tau)d_{\max,{\rm PCF}}U\right)$ | $O\left((N_\vartheta N_\tau N_\nu\log_2N_\vartheta+N_\vartheta N_\tau N_\nu\log_2N_\tau+N_\vartheta N_\tau N_\nu\log_2N_\nu)d_{\max,{\rm PCF}}U\right)$ |

尽管上述推导使用 (34) 的三重 BBCM，同一框架可扩展到其他 BBCM。例如，对 [24], [25] 中的二维 BBCM，可应用与算法 1 类似的流程获取 SF 波束域 sCSI。对更复杂的场景（如近场传播），空间波束矩阵 $\mathbf V^s$ 可替换为近场条件下的极域波束矩阵 [47]；无论这些变化如何，算法的核心思想与总体流程保持不变。为完整比较，表 II 也列出两种方法生成 SF 波束域 sCSI 的计算复杂度。更重要的是，所提基于 PCF 的方法引入**零在线导频开销**，因为全部所需 PCF 均在离线阶段获得。

在表 II 的理论比较基础上，下一节将开展具体数值分析：用仿真场景的具体参数与算法执行中观察到的迭代次数评估实际计算代价。

## V. 仿真结果

本节给出仿真结果以验证所提方法的有效性。仿真使用 6G 普适信道模型（6GPCM）生成器 [26]，它提供各位置处的 AAD 域信道参数；这些参数随后被转换为相应的 CIR 与 CTF。然而，准确的波束域 sCSI 无法直接从该生成器获得。已有 sCSI 获取工作 [5], [6], [8], [10], [11] 已表明，长期在线探测是获取 sCSI 以支持多 UT 信道估计与预编码的准确且实际有效机制；尽管各研究的实现细节不同，[8] 的结果表明各方法得到的 sCSI 估计高度可比。遵循该洞见，并鉴于 [5] 专门验证了用探测所得 sCSI 辅助信道估计，我们采用其在线探测算法作为代表性基线。为与这些方法对比，我们分别用传统在线探测方法与所提基于 PCF 的算法 1 生成 sCSI；所得 sCSI 随后被纳入信道估计流程，在其中有双重作用：(i) 作为参考信息在不同 UT 间调度导频；(ii) 作为先验统计知识以逼近最小均方误差（MMSE）性能。当用 PCF 生成的 sCSI 所获估计性能与用在线探测生成的 sCSI 所达性能相符时，即可确认基于 PCF 的途径是获取信道估计所需 sCSI 的可靠替代，从而同时验证所提方法的精度与实用性。

我们首先用第 III 节的方法在各位置生成 PCF。为区分参与 PCF 获取的 UT 与后续信道估计应用中的 UT，把 PCF 获取阶段的 UT 称为**测试终端（TT）**。BS 与 TT 均配备多天线阵列以提升空间分辨率、实现准确角度估计 [37]。如表 III 所示，该阶段 TT 采用 $32\times1$ ULA。通过让 TT 穿越不同网格区域，在若干位置上采集信道数据并提取相应 PCF；每个 PCF 连同其位置索引被存储，形成小区特定的基于 PCF 的信道图谱。离线 PCF 获取完成后，我们进一步评估其在在线多 UT 信道估计场景中的有效性：在覆盖区域内引入一组单天线移动 UT，并在 BS 同时服务这些 UT 的场景中评估算法 1。

我们在两类传播场景中仿真，即“3GPP_38.901_UMa_NLOS”与“3GPP_38.901_RMa_NLOS”。传播环境被划分为 $1\,\text{m}\times1\,\text{m}$ 网格用于分析；详细参数配置见表 III。我们评估不同 UT 数（$U=48$ 与 $U=180$）及不同 UT 移动性水平下 sCSI 辅助信道估计的性能。UT 初始位置在覆盖区内随机选取，每个 UT 以速度 $v_{\rm move}$ 移动，移动方向 $\alpha_{\rm move}$ 在 $[0,2\pi)$ 内随机选取。

**表 III：** 参数设置。

| 参数 | 取值 |
|---|---|
| BS 天线数 $A$ | 128 |
| TT 天线数 | 32 |
| UT 天线数 | 1 |
| 载频 $f_c$ | 5.8 GHz |
| 子载波数 $N_c$ | 2048 |
| CP 长度 $N_g$ | 144 |
| 有效子载波数 $K$ | 360 |
| 子载波间隔 $\Delta f$ | 15 kHz |
| 每帧时隙数 $N_p$ | 8 |
| 每个时隙的符号数 $N_b$ | 14 |
| UT 速度 $v_{\rm move}$ | 3、15、25 km/h |
| UT 数 $U$ | 48 与 180 |

> **原文疑点：** 原文表 III 的表头在排版中把第二列标题写成 “textbfValue”，即在 “Value” 之前残留了未正确展开的 LaTeX 命令文本（应为粗体 “Value”）。本译按语义译为“取值”，并在此说明原文排版瑕疵。

我们把通过在线探测与算法 1 获得的 sCSI 均纳入多 UT 信道估计流程。信道估计采用 [5] 提出的方法，该方法在多 UT 大规模 MIMO-OFDM 系统中已表现出优越性能，且需要 SF 波束域或 TB 域 sCSI 作为先验信息。为评估性能，我们采用归一化均方误差（NMSE）。在分析时段内，第 $u$ 个 UT 的位置记为 $s_u$，其 SFT 域信道张量表示为 $\mathcal H^{\rm SFT}_{s_u,\tilde n}$。当前帧 SFT 域信道估计的 NMSE 计算如下：

$$
\varepsilon_{\rm NMSE}=\frac{1}{S_{\rm sam}U}\sum_{s=1}^{S_{\rm sam}}\sum_{u=1}^{U}
\frac{\left\|\mathcal H^{\rm SFT}_{s_u,\tilde n}(s)-\hat{\mathcal H}^{\rm SFT}_{s_u,\tilde n}(s)\right\|_2^2}
{\left\|\mathcal H^{\rm SFT}_{s_u,\tilde n}(s)\right\|_2^2}, \tag{49}
$$

其中 $S_{\rm sam}$ 为一帧内的信道样本数，$\mathcal H^{\rm SFT}_{s_u,\tilde n}(s)$ 为第 $s$ 个信道张量样本，$\hat{\mathcal H}^{\rm SFT}_{s_u,\tilde n}(s)$ 为其相应估计。

### A. 基于 PCF 与在线探测的 sCSI 辅助信道估计对比

图 5 给出 UMa 场景、$U=48$ 个 UT 在不同 UT 速度下由不同 sCSI 辅助的信道估计 NMSE 性能。波束域维数设为 $N_\vartheta=2A$、$N_\tau=2K$、$N_\nu=4N_p$，即 $N_\vartheta=256$、$N_\tau=720$、$N_\nu=32$。图 5 的图例包含以下 sCSI 类型：

- **SF Probing：** 由在线探测方法获得的 SF 波束域 sCSI；
- **SF Algorithm 1：** 由 PCF 经算法 1 获得的 SF 波束域 sCSI；
- **TB Probing：** 由在线探测方法获得的 TB 域 sCSI；
- **TB Algorithm 1：** 由 PCF 经算法 1 获得的 TB 域 sCSI。

仿真结果表明，无论使用 SF 波束域还是 TB 域 sCSI，算法 1 生成的 sCSI 都取得与上行探测相当的 NMSE 性能；此外在不同 UT 移动性水平下，两种 sCSI 获取方法始终给出相近的信道估计性能。值得注意的是，TB 域 sCSI 相较 SF 域对应方法表现出更强的多普勒域信道特性捕获能力：如图 5 所示，TB 域 sCSI 取得更优的 NMSE 性能，这归因于它在多个域上对信道特性的更全面表示。

**图 5：** UMa 场景、$U=48$、不同 UT 速度下由不同方法获取的 sCSI 辅助信道估计的 NMSE 随 SNR 变化。

随后，我们比较不同 $N_\vartheta$、$N_\tau$、$N_\nu$ 取值下各 TB 域 sCSI 辅助信道估计方法的 NMSE 性能。如图 6 所示，即使 TB 域波束数变化，算法 1 生成的 sCSI 辅助信道估计始终取得与在线探测相当的 NMSE 性能。

**图 6：** UMa 场景、$U=48$、$v_{\rm move}=15$ km/h 下，不同 $N_\vartheta$、$N_\tau$、$N_\nu$ 时由不同方法获取的 TB 域 sCSI 辅助信道估计的 NMSE 随 SNR 变化。

随着 UT 数增加，UT 间干扰加剧使信道估计更具挑战，从而更依赖准确 sCSI [5]。为考察该效应，我们把仿真场景从图 5 切换为 $U=180$、$v_{\rm move}=15$ km/h，各 sCSI 辅助信道估计方法的 NMSE 性能见图 7。沿 TB 域保持 $N_\vartheta=2A$、$N_\tau=2K$、$N_\nu=4N_p$。结果表明算法 1 仍能逼近在线探测方法的 NMSE 性能；此外，随着 UT 数增加，TB 域 sCSI 辅助方法相对 SF 域 sCSI 辅助方法的 NMSE 增益更加明显，改善幅度大于图 5。这是因为借助 TB 域 sCSI 沿多普勒域进行适当的 UT 导频调度，可进一步抑制 UT 间导频干扰，从而带来更好的估计性能 [5]。

**图 7：** UMa 场景、$U=180$、$v_{\rm move}=15$ km/h 下由不同方法获取的 sCSI 辅助信道估计的 NMSE 随 SNR 变化。

图 8 给出 RMa 环境中 $U=180$、$v_{\rm move}=15$ km/h 时不同 sCSI 辅助信道估计方法的 NMSE 性能。可以看到，在 RMa 场景中两种方法生成的 sCSI 仍给出相当的信道估计 NMSE。由于 RMa 信道稀疏性增强，可基于 sCSI 通过适当导频调度更有效地抑制 UT 间导频干扰；因此该场景中的 NMSE 性能始终优于相应 UMa 场景。

**图 8：** RMa 场景、$U=180$、$v_{\rm move}=15$ km/h 下由不同方法获取的 sCSI 辅助信道估计的 NMSE 随 SNR 变化。

在我们的仿真中，迭代过程分别以 $d_{\max,{\rm probing}}=240$（在线探测）与 $d_{\max,{\rm PCF}}=50$（所提方法）收敛。把这些取值与系统维数代入表 II 的复杂度阶可确认，我们方法的实际在线计算负载显著低于在线探测，与理论分析一致。这一效率收益与零在线导频开销相结合，凸显了实际优势。

基于 PCF 的信道图谱的存储效率是另一关键优势。现有工作 [8], [24] 直接存储 SF 波束域 sCSI 作为 CF，每位置需 $256\times720=184{,}320$ 个元素；而我们的 PCF 表示在最多 20 个簇时每位置仅存 140 个参数（按 (14) 定义），存储开销降低三个数量级以上（$184{,}320/140\approx1317$ 倍）。

仿真结果进一步体现了所提基于 PCF 方法的鲁棒性与灵活性。实践中，一组 PCF 一旦获得，即可用于生成不同格式、面向不同目标波束域的 sCSI（例如从 SF 波束域到 TB 域），无需重新探测或重训练。这与在线探测方法不同——后者性能耦合于发送导频的特定场景，条件变化时往往需要完整的重新估计过程。基于 PCF 的方法在这些变化下保持一致的 sCSI 重建质量，这是由实验验证的关键优势。

### B. 扩展：PCF 使能的 sCSI 辅助信道估计及与基于 UL 的信道图谱对比

最后，为进一步说明所提基于 PCF 的信道图谱在信道估计中的有效性，我们额外与第 I 节提到的代表性基于 UL 的信道图谱方法比较。与可重建显式 sCSI 并直接支持导频设计与 MMSE 类估计的基于 CF 的信道图谱不同，基于 UL 的信道图谱无法生成物理信道参数或 sCSI，其在信道估计中的作用仅限于 UT 分组与相移正交导频（PSOP）复用 [19], [20]。在 UMa 场景、$U=48$、$v_{\rm move}=15$ km/h 下，我们考虑以下基于 UL 的 CC 变体：

- **Angle UL-based CC：** 由角域 CSI 构建的基于 UL 的 CC，用于 UT 分组、PSOP 复用及后续信道估计；
- **Angle-delay UL-based CC：** 由角度–时延域 CSI 构建的基于 UL 的 CC，用于 UT 分组、PSOP 复用及后续信道估计。

这些基于 UL 的方法按 [18]–[20] 的流程实现。如图 9 所示，尽管角度–时延变体相较纯角度方法改进了导频复用，二者本质上仍受制于无法重建 sCSI。相反，基于 PCF 的图谱生成准确、具有物理意义的 sCSI，提供更丰富的先验信息并取得显著更低的 NMSE。这些结果表明，基于 PCF 的信道图谱不仅提供直观、物理驱动的信道表示，还为 sCSI 辅助信道估计提供了比基于 UL 的信道图谱更实用、更灵活的框架。

**图 9：** UMa 场景、$U=48$、$v_{\rm move}=15$ km/h 下不同方法的 NMSE 随 SNR 变化；波束域 sCSI 维数为 $N_\vartheta=2A$、$N_\tau=2K$、$N_\nu=4N_p$。

## VI. 结论

本文提出基于 PCF 的信道图谱并验证其在 sCSI 获取中的有效性。我们首先基于簇化 GBSM 引入 PCF 的定义，用一组参数紧凑捕获信道的物理特性；随后提出大规模 MIMO-OFDM 系统中 PCF 的获取方法，并聚合各位置获取的 PCF 构建结构化、位置索引的信道图谱；进一步提出由信道图谱中的 PCF 高效获取波束域 sCSI 的算法。仿真结果表明，PCF 导出的 sCSI 取得与传统在线探测方法相当的精度，同时降低开销并保证信道估计精度。总体上，所提基于 PCF 的信道图谱为无线通信系统提供了环境感知且可扩展的方案。未来工作将进一步研究由物理信道模型指导的最优图谱粒度，以平衡获取性能与图谱维护成本之间的折中；此外，所提 PCF 可自然集成到无线数字孪生方法中作为虚拟数字对象，以实现灵活的 sCSI 重建；与生成式数字孪生模型结合，还可进一步支持更细粒度、更准确的信道图谱。

## 附录 A　定理 1 的证明

按张量 $n$-mode 积的定义，$\mathcal A(\mathcal Q)$ 的元素可计算为

$$
\left[\mathcal A(\mathcal Q)\right]_{n_\vartheta,n_\tau,n_\nu}
=\sum_{n'_\vartheta=1}^{N_\vartheta}\sum_{n'_\tau=1}^{N_\tau}\sum_{n'_\nu=1}^{N_\nu}
[\mathcal T^s]_{n_\vartheta,n'_\vartheta}
[\mathcal T^f]_{n_\tau,n'_\tau}
[\mathcal T^t]_{n_\nu,n'_\nu}
\left[(\mathcal Q\odot\mathcal Q)\right]_{n'_\vartheta,n'_\tau,n'_\nu}. \tag{50}
$$

结合 (41) 的问题与 (40) 中 $\mathcal L(\mathcal Q)$ 的定义，可得

$$
\frac{\partial\mathcal L(\mathcal Q)}{\partial[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}}
=\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
\frac{\partial[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}{\partial[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}}
-\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
\frac{[\bar{\mathcal A}]_{n_\vartheta,n_\tau,n_\nu}}{[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}
\frac{\partial[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}{\partial[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}}. \tag{51}
$$

随后如下等式成立：

$$
\frac{\partial[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}{\partial[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}}
=2[\mathcal T^s]_{n_\vartheta,n_{\vartheta1}}[\mathcal T^f]_{n_\tau,n_{\tau1}}
[\mathcal T^t]_{n_\nu,n_{\nu1}}[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}. \tag{52}
$$

把 (51) 代入 (52) 可导出

$$
\frac{\partial\mathcal L(\mathcal Q)}{\partial[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}}
=2[\mathcal Q]_{n_{\vartheta1},n_{\tau1},n_{\nu1}}
\sum_{n_\vartheta=1}^{N_\vartheta}\sum_{n_\tau=1}^{N_\tau}\sum_{n_\nu=1}^{N_\nu}
[\mathcal T^s]_{n_\vartheta,n_{\vartheta1}}[\mathcal T^f]_{n_\tau,n_{\tau1}}[\mathcal T^t]_{n_\nu,n_{\nu1}}
\left(1-\frac{[\bar{\mathcal A}]_{n_\vartheta,n_\tau,n_\nu}}{[\mathcal A(\mathcal Q)]_{n_\vartheta,n_\tau,n_\nu}}\right). \tag{53}
$$

由于 $\mathcal T^s$、$\mathcal T^f$、$\mathcal T^t$ 为对称矩阵，并应用张量 $n$-mode 积的计算规则，(53) 可改写为 (44) 的形式。证毕。

## 附录 B　定理 2 的证明

我们以 $\mathcal T^s$ 为例证明 (47a) 的有效性；(47b) 与 (47c) 可类似导出。

根据 [8]，对任意循环矩阵 $\mathbf C\in\mathbb C^{N\times N}$，可分解为 $\mathbf C=\mathbf F^{-1}_N{\rm Diag}\left(\mathbf F_N[\mathbf C]_{:,1}\right)\mathbf F_N$。由于矩阵 $(\mathbf V^s)^H\mathbf V^s$ 是循环矩阵，可写为

$$
(\mathbf V^s)^H\mathbf V^s=\mathbf F^H_{N_\vartheta}{\rm Diag}(\mathbf p_s)\mathbf F_{N_\vartheta}
=N_\vartheta\mathbf F^{-1}_{N_\vartheta}{\rm Diag}(\mathbf p_s)\mathbf F_{N_\vartheta}, \tag{54}
$$

其中 $\mathbf F_{N_\vartheta}\left[(\mathbf V^s)^H\mathbf V^s\right]_{:,1}=N_\vartheta\mathbf p_s$ 成立。

经逐元素相乘后可见 $\mathcal T^s$ 亦为循环矩阵。利用上述循环矩阵性质，有

$$
\mathcal T^s=\mathbf F^{-1}_{N_\vartheta}{\rm Diag}\left\{\mathbf F_{N_\vartheta}[\mathcal T^s]_{:,1}\right\}\mathbf F_{N_\vartheta}. \tag{55}
$$

由 $[\mathcal T^s]_{:,1}=\left[(\mathbf V^s)^H\mathbf V^s\right]_{:,1}\odot\left[(\mathbf V^s)^H\mathbf V^s\right]^*_{:,1}$，(55) 可进一步表示为

$$
\begin{aligned}
\mathcal T^s&=\mathbf F^{-1}_{N_\vartheta}{\rm Diag}\left\{\mathbf F_{N_\vartheta}
\left(\mathbf F^H_{N_\vartheta}\mathbf p_s\odot\left(\mathbf F^H_{N_\vartheta}\mathbf p_s\right)^*\right)\right\}\mathbf F_{N_\vartheta}\\
&=\frac{1}{N_\vartheta}\mathbf F^H_{N_\vartheta}{\rm Diag}\left\{\mathbf F_{N_\vartheta}
\left(\mathbf F^H_{N_\vartheta}\mathbf p_s\odot\left(\mathbf F^H_{N_\vartheta}\mathbf p_s\right)^*\right)\right\}\mathbf F_{N_\vartheta}
=\mathbf F^H_{N_\vartheta}{\rm Diag}\{\mathbf t_s\}\mathbf F_{N_\vartheta}.
\end{aligned} \tag{56}
$$

至此 (47a) 证明完毕。证毕。

## 致谢

作者感谢编辑与匿名审稿人提出的建设性意见与建议。

## 参考文献（英文原条目，按原文顺序）

[1] X. H. You et al., “Towards 6G wireless communication networks: Vision, enabling technologies, and new paradigm shifts,” *Sci. China Inf. Sci.*, vol. 64, pp. 1–74, Jan. 2021.

[2] C.-X. Wang et al., “6G wireless channel measurements and models: Trends and challenges,” *IEEE Veh. Technol. Mag.*, vol. 15, no. 4, pp. 22–32, Dec. 2020.

[3] W. Chen et al., “5G-advanced toward 6G: Past, present, and future,” *IEEE J. Sel. Areas Commun.*, vol. 41, no. 6, pp. 1592–1619, Jun. 2023.

[4] L. Qiao et al., “Sensing user’s activity, channel, and location with near-field extra-large-scale MIMO,” *IEEE Trans. Commun.*, vol. 72, no. 2, pp. 890–906, Feb. 2024.

[5] J. Tang, X. Q. Gao, L. You, D. Shi, J. Yang, X.-G. Xia, X. Zhao, and P. Jiang, “Massive MIMO-OFDM channel acquisition with time-frequency phase-shifted pilots,” *IEEE Trans. Commun.*, vol. 73, no. 6, pp. 4520–4535, Jun. 2025.

[6] J. Yang, A.-A. Lu, Y. Chen, X. Q. Gao, X.-G. Xia, and D. T. M. Slock, “Channel estimation for massive MIMO: An information geometry approach,” *IEEE Trans. Signal Process.*, vol. 70, pp. 4820–4834, Oct. 2022.

[7] X. Liu, W. Wang, X. Gong, X. Fu, X. Q. Gao, and X.-G. Xia, “Structured hybrid message passing based channel estimation for massive MIMO-OFDM systems,” *IEEE Trans. Veh. Technol.*, vol. 72, no. 6, pp. 7491–7507, Jun. 2023.

[8] A.-A. Lu, Y. Chen, and X. Q. Gao, “2D beam domain statistical CSI estimation for massive MIMO uplink,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 1, pp. 749–761, Jan. 2024.

[9] S. Chen, Y.-C. Liang, S. Sun, S. Kang, W. Cheng, and M. Peng, “Vision, requirements, and technology trend of 6G: How to tackle the challenges of system coverage, capacity, user data-rate and movement speed,” *IEEE Wireless Commun.*, vol. 27, no. 2, pp. 218–228, Apr. 2020.

[10] C. Wang, A.-A. Lu, X. Q. Gao, and Z. Ding, “Robust precoding for 3D massive MIMO configuration with matrix manifold optimization,” *IEEE Trans. Wireless Commun.*, vol. 21, no. 5, pp. 3423–3437, May 2022.

[11] M. Al-Shoukairi, P. Schniter, and B. D. Rao, “A GAMP-based low complexity sparse Bayesian learning algorithm,” *IEEE Trans. Signal Process.*, vol. 66, no. 2, pp. 294–308, Jan. 2018.

[12] J. Tang, L. You, X. Gong, C. Xie, X. Q. Gao, X.-G. Xia, and X. Shi, “Statistical CSI acquisition for multi-frequency massive MIMO systems,” *IEEE Trans. Commun.*, vol. 73, no. 11, pp. 11 798–11 813, Nov. 2025.

[13] J. Hong, J. Rodríguez-Piñeiro, X. Yin, and Z. Yu, “Joint channel parameter estimation and scatterers localization,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 5, pp. 3324–3340, May 2023.

[14] W. Jiang, X. Yuan, B. Teng, H. Wang, and J. Qian, “Interference-cancellation-based channel knowledge map construction and its applications to channel estimation,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 7, pp. 6240–6256, Jul. 2025.

[15] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Q. Gao, D. Gesbert, S. Cui, and R. Zhang, “A tutorial on environment-aware communications via channel knowledge map for 6G,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 3, pp. 1478–1519, 3rd Quarter 2024.

[16] C. Studer, S. Medjkouh, E. Gonultaş, T. Goldstein, and O. Tirkkonen, “Channel charting: Locating users within the radio environment using channel state information,” *IEEE Access*, vol. 6, pp. 47 682–47 698, Aug. 2018.

[17] P. Stephan, F. Euchner, and S. t. Brink, “Angle-delay profile-based and timestamp-aided dissimilarity metrics for channel charting,” *IEEE Trans. Commun.*, vol. 72, no. 9, pp. 5611–5625, Sep. 2024.

[18] T. Xu, L. You, J. Wang, C. Xie, H. Che, C. Sun, and X. Q. Gao, “Efficient base station handover via multipoint channel charting-based SNR prediction,” vol. 30, pp. 6–10, 2026.

[19] L. Ribeiro, M. Leinonen, H. Al-Tous, O. Tirkkonen, and M. Juntti, “Channel charting aided pilot reuse for massive MIMO systems with spatially correlated channels,” *IEEE Open J. Commun. Soc.*, vol. 3, pp. 2390–2406, Dec. 2022.

[20] H. Che, L. You, J. Wang, Z. Jin, C. Xie, and X. Q. Gao, “Channel charting-assisted non-orthogonal pilot allocation for uplink XL-MIMO transmission,” *arXiv preprint arXiv:2412.20920*, 2024.

[21] D. Wu, Y. Zeng, S. Jin, and R. Zhang, “Environment-aware hybrid beamforming by leveraging channel knowledge map,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 5, pp. 4990–5005, May 2024.

[22] Z. Jin, L. You, J. Wang, X.-G. Xia, and X. Gao, “An I2I inpainting approach for efficient channel knowledge map construction,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 2, pp. 1415–1429, Feb. 2025.

[23] C. Xie, L. You, Z. Jin, J. Tang, X. Q. Gao, and X.-G. Xia, “CF-CGN: Channel fingerprints extrapolation for multi-band massive MIMO transmission based on cycle-consistent generative networks,” *IEEE J. Sel. Areas Commun.*, vol. 43, no. 11, pp. 3722–3736, Nov. 2025.

[24] X. Gong, X. Liu, A.-A. Lu, X. Q. Gao, X.-G. Xia, C.-X. Wang, and X. You, “Digital twin of channel: Diffusion model for sensing-assisted statistical channel state information generation,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 5, pp. 3805–3821, May 2025.

[25] X. Dong, X. Gong, A.-A. Lu, X. Q. Gao, X.-G. Xia, Y. Zeng, and C.-X. Wang, “Accelerated LDM-enabled digital twin of channel for massive MIMO statistical CSI generation,” *IEEE Trans. Wireless Commun.*, vol. 25, pp. 7148–7163, 2026.

[26] C.-X. Wang, Z. Lv, X. Q. Gao, X. You, Y. Hao, and H. Haas, “Pervasive wireless channel modeling theory and applications to 6G GBSMs for all frequency bands and all scenarios,” *IEEE Trans. Veh. Technol.*, vol. 71, no. 9, pp. 9159–9173, Sep. 2022.

[27] J. Bian, C.-X. Wang, X. Q. Gao, X. You, and M. Zhang, “A general 3D non-stationary wireless channel model for 5G and beyond,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 5, pp. 3211–3224, May 2021.

[28] C. Huang, R. Wang, P. Tang, R. He, B. Ai, Z. Zhong, C. Oestges, and A. F. Molisch, “Geometry-cluster-based stochastic MIMO model for vehicle-to-vehicle communications in street canyon scenarios,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 2, pp. 755–770, Feb. 2021.

[29] C.-X. Wang et al., “Modeling, capacity studies, antenna and system designs for 6G/B6G 3D continuous-space radio channels enabled by electromagnetic information theory,” *IEEE Commun. Surveys Tuts.*, vol. 28, pp. 1–63, 2026.

[30] C. Sun, X. Q. Gao, S. Jin, M. Matthaiou, Z. Ding, and C. Xiao, “Beam division multiple access transmission for massive MIMO communications,” *IEEE Trans. Commun.*, vol. 63, no. 6, pp. 2170–2184, Jun. 2015.

[31] L. You, X. Q. Gao, A. L. Swindlehurst, and W. Zhong, “Channel acquisition for massive MIMO-OFDM with adjustable phase shift pilots,” *IEEE Trans. Signal Process.*, vol. 64, no. 6, pp. 1461–1476, Mar. 2016.

[32] L. Bai, Z. Huang, Y. Li, and X. Cheng, “A 3D cluster-based channel model for 5G and beyond vehicle-to-vehicle massive MIMO channels,” *IEEE Trans. Veh. Technol.*, vol. 70, no. 9, pp. 8401–8414, Sep. 2021.

[33] M. Yang, B. Ai, R. He, L. Chen, X. Li, J. Li, B. Zhang, C. Huang, and Z. Zhong, “A cluster-based three-dimensional channel model for vehicle-to-vehicle communications,” *IEEE Trans. Veh. Technol.*, vol. 68, no. 6, pp. 5208–5220, Jun. 2019.

[34] C.-X. Wang, Z. Lv, Y. Chen, and H. Haas, “A complete study of space-time-frequency statistical properties of the 6G pervasive channel model,” *IEEE Trans. Wireless Commun.*, vol. 71, no. 12, pp. 7273–7287, Dec. 2023.

[35] Z. Gong, F. Jiang, C. Li, and X. Shen, “Simultaneous localization and communications with massive MIMO-OTFS,” *IEEE J. Sel. Areas Commun.*, vol. 41, no. 12, pp. 3908–3924, Dec. 2023.

[36] L. Zeng, X. Liao, Z. Ma, B. Xiong, H. Jiang, and Z. Chen, “Three-dimensional UAV-to-UAV channels: Modeling, simulation, and capacity analysis,” *IEEE Internet Things J.*, vol. 11, no. 6, pp. 10 054–10 068, Mar. 2024.

[37] Z. Zhou, C.-X. Wang, L. Zhang, J. Huang, L. Xin, E.-H. M. Aggoune, and Y. Miao, “A novel SAGE algorithm for estimating parameters of wideband spatial nonstationary wireless channels with antenna polarization,” *IEEE Trans. Antennas Propag.*, vol. 71, no. 9, pp. 7457–7472, Sep. 2023.

[38] J. Yang, Y. Chen, X. Q. Gao, D. T. M. Slock, and X.-G. Xia, “Signal detection for ultra-massive MIMO: An information geometry approach,” *IEEE Trans. Signal Process.*, vol. 72, pp. 824–838, Jan. 2024.

[39] H. Che, L. You, J. Wang, and X. Q. Gao, “Non-orthogonal pilot design exploiting spatial non-stationarity for TDD XL-MIMO transmission,” *IEEE Trans. Veh. Technol.*, vol. 74, no. 2, pp. 3424–3428, Feb. 2025.

[40] C. Cai, J. Yang, F. Yang, and X. Q. Gao, “Expectation-maximization based information geometry approach for massive MIMO-OFDM channel estimation,” *IEEE Trans. Commun.*, vol. 73, no. 8, pp. 6366–6378, Aug. 2025.

[41] Y. Li, C. Han, Y. Chen, Z. Yu, and X. Yin, “DSS-o-SAGE: Direction-scan sounding-oriented SAGE algorithm for channel parameter estimation in mmWave and THz bands,” *IEEE Trans. Antennas Propag.*, vol. 73, no. 4, pp. 1969–1983, Apr. 2025.

[42] L. You, X. Q. Gao, X.-G. Xia, N. Ma, and Y. Peng, “Pilot reuse for massive MIMO transmission over spatially correlated Rayleigh fading channels,” *IEEE Trans. Wireless Commun.*, vol. 14, no. 6, pp. 3352–3366, Jun. 2015.

[43] B. Fleury, M. Tschudin, R. Heddergott, D. Dahlhaus, and K. Ingeman Pedersen, “Channel parameter estimation in mobile radio environments using the SAGE algorithm,” *IEEE J. Sel. Areas Commun.*, vol. 17, no. 3, pp. 434–450, Mar. 1999.

[44] R. He, Q. Li, B. Ai, Y. L.-A. Geng, A. F. Molisch, V. Kristem, Z. Zhong, and J. Yu, “A kernel-power-density-based algorithm for channel multipath components clustering,” *IEEE Trans. Wireless Commun.*, vol. 16, no. 11, pp. 7138–7151, Nov. 2017.

[45] C. Huang, A. F. Molisch, Y.-A. Geng, R. He, B. Ai, and Z. Zhong, “Trajectory-joint clustering algorithm for time-varying channel modeling,” *IEEE Trans. Veh. Technol.*, vol. 69, no. 1, pp. 1041–1045, Jan. 2020.

[46] A.-A. Lu, X. Q. Gao, and C. Xiao, “Robust linear precoder design for 3D massive MIMO downlink with a posteriori channel model,” *IEEE Trans. Veh. Technol.*, vol. 71, no. 7, pp. 7274–7286, Jul. 2022.

[47] M. Cui and L. Dai, “Channel estimation for extremely large-scale MIMO: Far-field or near-field?” *IEEE Trans. Commun.*, vol. 70, no. 4, pp. 2663–2677, Apr. 2022.

**原文插图：** 原 PDF 中的图 1–9 未重传至本页，仅保留中文图注与图中关键标注（如场景示意、SFT 张量结构、PCF 获取与 sCSI 获取流程、各 NMSE 曲线图例）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2606.19010v1（eess.SP，15 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VI 节（含 II-A–B、III-A–B、IV-A–C、V-A–B 等全部小节）、结论、全部图注（图 1–9）、表 I–III（逐格转录）、定理 1–2、算法 1、公式 (1)–(56)（含 (22a)–(22b)、(43a)–(43c)、(47a)–(47c)、(48a)–(48c) 子式）、附录 A–B（两个定理的完整证明）、致谢与 47 条参考文献英文原条目；原文无作者简介。**逐句终校未做**：表 I（三方法六维对比）、表 II（复杂度与开销）、表 III（参数设置）均已用 PDF 页面渲染逐格核对；式 (5)–(14)、(18)–(19)、(28)–(29)、(36)–(48)、(54)–(56) 等关键式亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①式 (28) 残差更新中求和指标为 $l'$ 而被加项原文写作 $\hat\Theta_{s,l}$，按 SAGE 语义应为 $\hat\Theta_{s,l'}$；②表 III 表头把 “Value” 排成残留的 “textbfValue”（LaTeX 命令未展开）。均按原文照录并说明，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
