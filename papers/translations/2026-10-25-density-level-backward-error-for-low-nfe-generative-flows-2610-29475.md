---
layout: page
title: "低 NFE 生成流的密度级后向误差｜中文全文译文"
permalink: /papers/translations/2026-10-25-density-level-backward-error-for-low-nfe-generative-flows-2610-29475/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8bc3053c71b66352/) · [原文 arXiv](https://arxiv.org/abs/2610.29475) · [全部目录](/papers/catalog/)

# 低 NFE 生成流的密度级后向误差

**原题：** Density-Level Backward Error for Low-NFE Generative Flows  
**作者：** Ewsey Obzherin（1,2）、Valentin Khrulkov（1）  
**单位：** 1 FusionBrain Lab；2 MIRIAI。  
**版本：** arXiv:2610.29475v1（cs.LG），2026-10-21，原文 37 页（含表 1、表 A.1—E.8 与图 1、图 A.1—D.8）。  
**范围与状态：** 全文中文译稿：摘要、第 1—9 节、式（1）—（38）、表 1 与附录表 A.1—E.8（逐格）、图 1 与附录图 A.1—D.8 图注、附录 A—O、参考文献 [1]—[40] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2610.29475，2026-10-25 推荐"；本地 PDF 为 **arXiv:2610.29475v1 [cs.LG]，2026-10-21**，"2026-10-25" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

低 NFE 的生成式 ODE 采样不仅受**求解器阶数**约束，也受**固定网络评估预算如何沿流分配**的约束。我们提出一个**密度级后向误差**框架，用于识别求解器修正方程缺陷中**改变演化边缘分布**的分量，同时排除在 Wasserstein 切几何中不可见的螺线（solenoidal）轨迹畸变。所得残差诱导出一条**求解器阶数感知的计算分配规则**，并通过规范（gauge）自由度给出一个目标函数，用于为同一密度路径挑选数值上更有利的速度代表元。这使我们的方法区别于由轨迹或端点代理驱动的调度搜索，也区别于高阶求解器设计。精确高斯与混合模型确立了该机制，包括基于曲率的分配失效、以及连续最优传输并非离散最优的情形。在预训练 CIFAR-10 EDM 概率流 ODE 上，密度感知分配在低 NFE 区间一致改善固定更新步的 Euler 采样。匹配种子的收敛实验到密集 Euler 参考解，证实该方法加速了对同一高 NFE 流的逼近，而非改变渐近采样器。

## 1 引言

扩散与基于流的生成器通过对学习到的时间相关速度场做数值积分来采样。设 $v_t$ 为把给定密度路径 $p_t$ 输运的参考速度，满足

$$
\partial_tp_t+\nabla\cdot\left(p_tv_t\right)=0.\tag{1}
$$

当可用的网络评估次数很少时，生成质量不仅取决于学习到的场与求解器公式，还取决于这些评估沿路径**布置在何处**。因此时间步设计本身已成为一个优化问题：Align Your Steps 为给定求解器、模型与数据集优化调度；optimized-time-step 方法针对参考 ODE 解拟合节点；LD3 为预训练采样器学习离散化；Optimal Stepsize Distillation 在参考轨迹上做动态规划；可微求解器搜索联合调节时间步与求解器系数（Sabour et al., 2024; Xue et al., 2024; Tong et al., 2025; Pei et al., 2025; Wang et al., 2025）。这些方法表明评估点的布置很重要，但它们**没有分离**局部数值缺陷中哪一部分会改变演化中的边缘分布，也没有利用"多个速度场可生成同一密度路径"这一事实。

因此应当分离三个设计变量：**求解器设计**选择更新公式；**调度设计**选择该公式在何处评估场；**代表元设计**选择当多个场生成相同连续边缘分布时对哪个速度场做离散化。本文通过密度级后向误差把后两者联系起来。

为使这种非唯一性显式化，定义 $\mathcal U_p=\{u:\nabla\cdot(p_tu_t)=0\ \text{对几乎所有}\ t\}$。若 $u\in\mathcal U_p$，则 $w=v+u$ 生成与 $v$ 相同的连续密度曲线，尽管有限数值映射未必保持该等价性。因此轨迹层面的缺陷可能包含大量对边缘分布不可见的粒子运动。真正的问题不只是"ODE 在哪里难"，而是"**求解器缺陷的哪一部分在移动概率质量**"。

这也把连续最优性与有限步最优性分开。概率流端点映射在重要的高斯与对称设定下与二次 Monge 映射一致（Khrulkov et al., 2023），但并非普遍成立（Lavenant & Santambrogio, 2022）。此处密度曲线 $p_t$ 固定，我们问：哪个连续等价的代表元速度场、哪种时间步网格，使**离散**输运映射在 $W_2$ 意义下最准确。即便对同性高斯，最小作用量的梯度代表元对 Euler 而言也可能不如一个非梯度的保边缘代表元准确。

设 $\Psi_h^w$ 为对代表元 $w$ 的一步数值映射，并假定价 $r$ 方法允许局部修正场

$$
w_h=w+h^rE_r[w]+O\left(h^{r+1}\right).\tag{2}
$$

记 $\mathcal P_{\nabla,p_t}$ 为到梯度场空间的 $L^2(p_t)$-正交投影。该投影保留改变边缘分布的 Wasserstein 切分量，并去掉对边缘不可见的螺线运动。我们的核心局部结果为

$$
\left(\Psi_h^w\right)_\#p_t-p_{t+h}=-h^{r+1}\nabla\cdot\left(p_tE_r[w]\right)+o\left(h^{r+1}\right),\tag{3}
$$

$$
W_2\left(\left(\Psi_h^w\right)_\#p_t,p_{t+h}\right)=h^{r+1}\left\|\mathcal P_{\nabla,p_t}E_r[w]\right\|_{L^2(p_t)}+o\left(h^{r+1}\right).\tag{4}
$$

对 Euler，$E_1[w]=-\frac12a_w$，其中 $a_w=\partial_tw+\nabla_w w$。因此决定首阶边缘误差的是**投影后的修正方程缺陷**，而非完整轨迹缺陷。这既把连续输运最优性与两个有限求解器问题（评估点放哪里、离散化哪个连续等价场）分开。

**贡献**：

1. **密度级后向误差**：我们把首个非零的修正方程微分投影到加权 Wasserstein 切空间。式（3）—（4）把其范数等同于首阶局部边缘 $W_2$ 缺陷，并丢弃对密度不可见的螺线运动。
2. **有限预算计算分配**：令 $R_r(t)=\left\|\mathcal P_{\nabla,p_t}E_r[w]\right\|_{L^2(p_t)}$，令 $K(1,t)$ 表示在时刻 $t$ 引入、传播至终端时刻的密度扰动的放大率。则
$$
n^\star(t)\propto\left[K(1,t)R_r(t)\right]^{1/(r+1)}.
$$
求解器阶数固定了指数；相应的分位网格**精确最小化**第 6 节定义的有限-$N$ 局部代理，并用一个 Rényi 恒等式量化残余的模型错配。
3. **求解器感知的代表元选择**：在 $u\in\mathcal U_p$ 的场 $w=v+u$ 中，我们定义一个连续求解器目标。对 Euler，重整化的离散局部 $W_2$ 目标一致收敛（从而 $\Gamma$-收敛）到该泛函。高斯路径给出显式控制，并把连续最小作用量与有限步求解器精度分开。
4. **机制对齐的验证**：解析高斯与混合实验检验投影缺陷、传播与代表元选择的预测。在预训练 CIFAR-10 EDM 上，我们保持 Euler 更新固定、只改变时间步网格；密集参考研究表明这加速了对同一高 NFE Euler 极限的收敛，而非改变目标采样器。

**两个优化问题**：代表元选择最小化

$$
\min_{u\in\mathcal U_p}\mathcal B(v+u),\qquad \mathcal B(w)=\frac12\int_0^1\left\|\mathcal P_{\nabla,p_t}a[w]\right\|_{L^2(p_t)}^2\mathrm dt.
$$

对 $r$ 阶求解器，令 $W_r(t)=K(1,t)R_r(t)$，时间步分配求解

$$
\min_{n>0}\int_0^1W_r(t)n(t)^{-r}\mathrm dt\quad\text{s.t.}\ \int_0^1n(t)\mathrm dt=N.
$$

第一个问题为固定求解器选择连续等价的速度场；第二个把该求解器的评估预算沿路径分配。经验比较保持这种分离显式：Euler 调度使用相同网络、更新规则、NFE 与采样代价；DPM++ 与原始 EDM Heun 采样器仅作为**更强求解器的语境**展示——它们改变积分公式，而我们的方法改变固定一阶求解器在何处花评估。离线的分配剖面可跨生成样本与 NFE 选择复用。

## 2 相关工作与定位

**生成流与最优传输**：连续归一化流与神经 ODE 把生成表述为对学习速度场的数值积分（Chen et al., 2018）。扩散与基于分数的模型允许概率流 ODE 描述（Ho et al., 2020; Song et al., 2021），而流匹配直接为给定概率路径回归向量场（Lipman et al., 2023; Albergo et al., 2023）。Rectified flow 与多样本流匹配通过更直的轨迹或更好耦合简化输运（Liu et al., 2023; Pooladian et al., 2023）。概率流端点映射在重要结构化情形与二次最优传输一致（Khrulkov et al., 2023），但并非普遍成立（Lavenant & Santambrogio, 2022）。这些工作关注连续路径或端点映射；我们固定边缘曲线，优化其规范等价提升的数值实现。这也不同于优化曲线本身的 Wasserstein 样条与二阶输运模型（Benamou et al., 2019）。

**求解器与调度优化**：后向误差分析与 B 级数修正方程在几何数值积分中是经典方法（Hairer et al., 2006），并已被应用于扩散采样（Gao et al., 2023）；概率流 ODE 也允许非渐近收敛分析（Chen et al., 2023）。求解器设计从 EDM Heun 构造到 DPM-Solver 以及经验统计修正（Karras et al., 2022; Lu et al., 2022; Zheng et al., 2023）。另一条互补路线优化离散化本身：Align Your Steps 使用针对求解器、模型与数据分布特化的随机微积分目标（Sabour et al., 2024）；Xue 等（2024）通过比较数值解与参考 ODE 解来优化时间节点；LD3 为预训练采样器学习轻量离散化（Tong et al., 2025）；Optimal Stepsize Distillation 对参考轨迹做动态规划（Pei et al., 2025）；可微求解器搜索联合搜索时间步与求解器系数（Wang et al., 2025）。自适应步长控制、Wasserstein 有界调度、连续时间时钟控制与实例感知网格进一步扩大了调度类（Chen et al., 2024; Jo & Choi, 2026; Huang et al., 2026; Yuan et al., 2026）。我们的贡献与该类如何被搜索正交：我们通过连续性方程投影首个修正方程微分，推导出应被分配的局部量，从而得到一个边缘残差、一个求解器阶数指数，以及一个额外的优化变量——保边缘速度代表元。

**规范自由度与边缘可观测性**：实现固定密度路径的速度场非唯一性在扩散与流建模中日益可见。Horvat & Pfister（2024）分析规范自由度与保守性；近期工作按边缘可观测性分离梯度与螺线分量（Khelifa et al., 2026）。EDDY 利用无散自由度实现保边缘的粒子多样性（Vinograd et al., 2026），而 Gauge Flow Models、Flux Matching 与 Wasserstein 流重解释把场本身视为设计变量（Strunk & Assam, 2025; Pao-Huang et al., 2026; Vuong et al., 2025）。曲率最小化与应变/涡量分解则诊断轨迹级积分难度（Lee et al., 2023; Tao & Choi, 2026）。我们把加权 Hodge 投影应用于**求解器的修正方程缺陷**：只有其梯度分量贡献首阶边缘 $W_2$ 误差，而剩余的规范自由度可针对数值可积性优化。

## 3 保边缘规范

**解析设定**：全文在平坦环面 $\mathbb T^d$、光滑紧无边流形，或 $\mathbb R^d$（具有足够衰减使下文分部积分无边界项）上工作。假设 $p_t>0$、$\int p_t=1$，且 $p_t$ 与向量场足够光滑以支撑所给恒等式；一个方便的充分条件是 $p\in C_{t,x}^2$、$v,u\in C_t^1C_x^2$ 且在紧时间区间上有界导数。在 $\mathbb R^d$ 上除非施加更强衰减，测试函数取紧支集；所有散度约束可在弱意义下等价理解。在紧无边域上取 $\mathcal T=C^\infty(\mathcal M)/\mathbb R$，在欧氏情形取 $\mathcal T=C_c^\infty(\mathbb R^d)$。

**定义 1（螺线规范类）**：对固定密度 $p_t$，定义

$$
\mathcal U_{p_t}=\left\{u\in L^2(p_t):\int p_t\langle u,\nabla\phi\rangle\mathrm dx=0\ \ \forall\phi\in\mathcal T\right\}.\tag{5}
$$

对光滑场，这等价于在分布意义下 $\nabla\cdot(p_tu_t)=0$。随时间写出 $\mathcal U_p=\{u_t\in\mathcal U_{p_t}\ \text{对几乎处处的}\ t\}$，代表元纤维为 $\mathcal G(v,p)=v+\mathcal U_p$。

**命题 1（规范不变性）**：若 $v_t$ 满足方程（1）、$u_t\in\mathcal U_p$，则 $w_t=v_t+u_t$ 满足

$$
\partial_tp_t+\nabla\cdot\left(p_tw_t\right)=0.\tag{6}
$$

**证明**：由线性性，$\partial_tp_t+\nabla\cdot(p_t(v_t+u_t))=\partial_tp_t+\nabla\cdot(p_tv_t)+\nabla\cdot(p_tu_t)=0$，证毕。该命题虽初等，但定义了优化问题的可行集。在一维、标准衰减假设下该可行集是平凡的：$\partial_x(p_tu_t)=0$ 蕴含 $p_tu_t=c(t)$，衰减给出 $c(t)=0$。因此非平凡的规范优化本质上是多维的。

## 4 求解器感知的密度缺陷

设 $\Psi_h^w$ 表示对非自治 ODE $\dot x_t=w_t(x_t)$ 应用某数值方法的一步。在调用修正方程展开时使用扩展系统 $(x,\tau)'=(w_\tau(x),1)$。

**定义 2（首阶修正方程微分）**：称 $r$ 阶方法在类 $\mathcal A$ 上容许首个修正微分 $E_r[w]$，若其局部修正场满足

$$
w_h=w+h^rE_r[w]+h^{r+1}\rho_h[w],\qquad\sup_{w\in\mathcal A,\ h<h_0}\left\|\rho_h[w]\right\|_{C_x^1}<\infty.\tag{7}
$$

**定理 1（求解器感知的密度级后向误差）**：假设 $w_t$ 输运 $p_t$ 且式（7）成立，则

$$
\partial_tp_t+\nabla\cdot\left(p_tw_h\right)=h^r\nabla\cdot\left(p_tE_r[w]\right)+O\left(h^{r+1}\right)\tag{8}
$$

在分布意义下、并在由所述余项控制的任意负 Sobolev 范数中成立。一步之内，

$$
\left(\Psi_h^w\right)_\#p_t-p_{t+h}=-h^{r+1}\nabla\cdot\left(p_tE_r[w]\right)+o\left(h^{r+1}\right).\tag{9}
$$

第一个恒等式在减去连续性方程后立即得到；第二个把 $h^r$ 速度扰动对时间 $h$ 积分。附录 H 给出弱形式证明并记录后续所需的均匀性。

**Euler 特化**：精确解为 $x(t+h)=x+hw_t(x)+\frac{h^2}{2}a_w(x,t)+O(h^3)$，其中 $a_w=\partial_tw+\nabla w\,w$。故显式 Euler 有

$$
E_1[w]=-\frac12a_w,\qquad w_h=w-\frac h2a_w+O\left(h^2\right),\tag{10}
$$

且式（8）变为

$$
\partial_tp_t+\nabla\cdot\left(p_tw_h\right)=-\frac h2\nabla\cdot\left(p_ta_w\right)+O\left(h^2\right).\tag{11}
$$

因此常见的 Euler 加速度只是一般对象的一个实例：首个修正方程微分经加权散度观测所得。对中点法或 Heun，首个非零对象是 $E_2[w]$，在修正场中以 $h^2$ 阶进入。

## 5 密度活跃的 Wasserstein 几何

给 $L^2(p_t)$ 配以 $\langle r,s\rangle_{p_t}=\int p_t\langle r,s\rangle\mathrm dx$，并定义梯度空间 $\mathcal G_{p_t}=\overline{\{\nabla\phi:\phi\in\mathcal T\}}^{L^2(p_t)}$，其中 $\mathcal T$ 为第 3 节固定的测试函数空间。规范定义给出正交分解

$$
L^2(p_t)=\mathcal G_{p_t}\oplus\mathcal U_{p_t}.\tag{12}
$$

记 $\mathcal P_{\nabla,p_t}$ 为梯度投影。弱意义下 $\mathcal P_{\nabla,p_t}z=\nabla\phi$ 由

$$
\int p_t\langle\nabla\phi,\nabla\psi\rangle\mathrm dx=\int p_t\langle z,\nabla\psi\rangle\mathrm dx\tag{13}
$$
\nabla\cdot\left(p_t\nabla\phi\right)=\nabla\cdot\left(p_tz\right).\tag{14}
$$

$$

刻画，或强形式 $\nabla\cdot(p_t\nabla\phi)=\nabla\cdot(p_tz)$。

**定义 3（加权负范数）**：对零均值分布 $f$，令

$$
\|f\|_{\dot H^{-1}(p_t)}=\sup_{\|\nabla\psi\|_{L^2(p_t)}\le1}\langle f,\psi\rangle.\tag{15}
$$

**命题 2（密度活跃投影）**：对每个足够正则的场 $z$，

$$
\nabla\cdot\left(p_tz\right)=\nabla\cdot\left(p_t\mathcal P_{\nabla,p_t}z\right),\qquad\left\|\nabla\cdot\left(p_tz\right)\right\|_{\dot H^{-1}(p_t)}=\left\|\mathcal P_{\nabla,p_t}z\right\|_{L^2(p_t)}.\tag{16}
$$

**证明**：螺线分量与每个测试梯度正交，故在加权散度与对偶范数中均消失；剩余上确界正是梯度投影的 Hilbert 范数。

把该命题应用于 $z=E_r[w]$，定义求解器感知的局部残差

$$
R_r[w](t):=\left\|\mathcal P_{\nabla,p_t}E_r[w]\right\|_{L^2(p_t)}=\left\|\nabla\cdot\left(p_tE_r[w]\right)\right\|_{\dot H^{-1}(p_t)}.\tag{17}
$$

**定理 2（$r$ 阶方法的局部 Wasserstein 缺陷）**：在附录 H 的正则 Wasserstein 图与均匀性假设下，

$$
W_2\left(\left(\Psi_h^w\right)_\#p_t,p_{t+h}\right)=h^{r+1}R_r[w](t)+o\left(h^{r+1}\right).\tag{18}
$$

对 Euler 即

$$
W_2\left(\left(\mathrm{Id}+hw_t\right)_\#p_t,p_{t+h}\right)=\frac{h^2}{2}\left\|\mathcal P_{\nabla,p_t}a_w\right\|_{L^2(p_t)}+o\left(h^2\right).\tag{19}
$$

该定理把修正方程残差转为 Wasserstein 切范数，而非启发式指标；它也定义了依赖求解器的规范目标

$$
\mathcal B_r(w)=\frac12\int_0^1R_r[w](t)^2\mathrm dt.\tag{20}
$$

对 Euler，$\mathcal B_1=\mathcal B/4$，其中

$$
\mathcal B(w)=\frac12\int_0^1\left\|\mathcal P_{\nabla,p_t}a_w\right\|_{L^2(p_t)}^2\mathrm dt;\tag{21}
$$

常数不影响代表元选择。

**求解器感知的输运链**：$E_r[w]\xrightarrow{\mathcal P_{\nabla,p_t}}R_r(t)\xrightarrow{K(1,t)}K(1,t)R_r(t)\xrightarrow{\int n=N}n^\star(t)$。只有水平分量贡献首阶边缘缺陷；大的 $p_t$-螺线修正微分可以弯折粒子轨迹却不产生首阶密度误差。

## 6 求解器阶数的时间步分配

设 $R_r(t)$ 为式（17）的几何残差。局部缺陷在终端时刻之前可能被放大。对输运演化 $U_w(1,t)$，假设

$$
\left\|U_w(1,t)f\right\|_X\le K(1,t)\|f\|_Y.\tag{22}
$$

**定理 3（传播后的 $r$ 阶密度缺陷）**：在附录 L 与 H 的可微性与修正方程假设下，光滑局部步长剖面 $h(t)$ 满足

$$
\left\|p_1^{\mathrm{num}}-p_1\right\|_X\le\int_0^1K(1,t)h(t)^r\left\|\nabla\cdot\left(p_tE_r[w]\right)\right\|_Y\mathrm dt+O\left(\|h\|_\infty^{r+1}\right).\tag{23}
$$

对典型源范数 $Y=\dot H^{-1}(p_t)$，命题 2 把被积函数等同于 $R_r(t)$。因此终端加权残差为 $W_r(t)=K(1,t)R_r(t)$。若在 $\mathrm dt$ 内放置 $n(t)\mathrm dt$ 步，则 $h(t)\simeq n(t)^{-1}$，累积的首阶缺陷为

$$
J_r[n]=\int_0^1W_r(t)n(t)^{-r}\mathrm dt,\qquad\int_0^1n(t)\mathrm dt=N.\tag{24}
$$

对一般指数 $q>0$ 记 $J_q^W[n]=\int_0^1W(t)n(t)^{-q}\mathrm dt$。

**定理 4（求解器阶数分配与有限-$N$ 代理）**：设 $W>0$、$q>0$、$\alpha=(q+1)^{-1}$。在 $\int n=N$ 下 $\int Wn^{-q}$ 的唯一连续极小点为

$$
n^\star(t)=N\frac{W(t)^\alpha}{Z},\qquad Z=\int_0^1W(s)^\alpha\mathrm ds.\tag{25}
$$

对任意划分 $\pi=\{0=t_0<\cdots<t_N=1\}$，定义

$$
S_q(\pi)=\sum_{k=0}^{N-1}\left(\int_{t_k}^{t_{k+1}}W(t)^\alpha\mathrm dt\right)^{q+1}.\tag{26}
$$

则

$$
S_q(\pi)\ge\frac{Z^{q+1}}{N^q},\tag{27}
$$

等号成立当且仅当

$$
\int_0^{t_k}W(t)^\alpha\mathrm dt=\frac kN Z.\tag{28}
$$

连续律由 KKT 方程 $-qWn^{-q-1}+\lambda=0$ 得到；对有限-$N$ 代理 $S_q$，对区间质量 $a_k=\int_{t_k}^{t_{k+1}}W^\alpha$ 施加严格凸性给出精确的分位最小化。这是**精确的有限-$N$ 代理最优性**，并不声称同一网格精确最小化完整的非线性终端误差。对 $r$ 阶求解器 $q=r$，故

$$
n^\star(t)\propto\left[K(1,t)R_r(t)\right]^{1/(r+1)}.\tag{29}
$$

因此 Euler、二阶与三阶方法分别使用 $1/2$、$1/3$、$1/4$ 次幂。式（28）的分位规则直接把连续最优解变成可实现的网格；其局部步长渐近与 $O(N^{-2})$ 端点逼近见附录 H。

### 6.1 分配鲁棒性与传播

假设用 $\widetilde W$ 而非 $W$ 构造调度。令

$$
\rho=\frac{W^\alpha}{Z},\qquad\widehat\rho=\frac{\widetilde W^\alpha}{\widehat Z}.\tag{30}
$$

**定理 5（精确的调度退化）**：对 $\widehat n=N\widehat\rho$，

$$
\frac{J_q^W[\widehat n]}{J_q^W[n^\star]}=\int_0^1\rho^{q+1}\widehat\rho^{-q}\mathrm dt=\exp\left(qD_{q+1}\left(\rho\|\widehat\rho\right)\right).\tag{31}
$$

对 Euler，

$$
\frac{J_1^W[\widehat n]}{J_1^W[n^\star]}=1+\chi^2\left(\rho\|\widehat\rho\right).\tag{32}
$$

若 $\left|\log(\widetilde W/W)\right|\le\varepsilon$，则该比值至多为 $\exp\left(2q\varepsilon/(q+1)\right)$。因此调度质量取决于归一化分配密度，而非残差的绝对尺度。正则化 $W_\varepsilon=\varepsilon+R$ 保证正性并控制零附近的敏感性。传播加权具有结构性影响：即便局部残差为常数，附录 H 也构造出光滑标量流，使"仅残差目标"的比值相对传播感知最优增长到 $\sqrt{M}/4\to\infty$。定理 4、5 的证明与网格渐近、传播分离构造均见附录 H。

**实用残差估计**：理论使用 $R_r(t)=\left\|\mathcal P_{\nabla,p_t}E_r[w]\right\|_{L^2(p_t)}$。受控 Euler 实验还使用分数—散度代理

$$
\widehat R_{\mathrm{dens}}(t)=\left\|p_t^{-1}\nabla\cdot\left(p_ta_w\right)\right\|_{L^2(p_t)},\tag{33}
$$

它在加权 Poincaré 不等式下上界控制——但不等于——几何范数。CIFAR-10 改用 Galerkin 投影与经验传播；附录 D 用粒子估计器对照精确受控残差进行验证。

## 7 规范优化及其离散极限

对 Euler，代表元选择问题为

$$
\min_{u\in\mathcal U_p}\mathcal B(v+u),\qquad \mathcal B(w)=\frac12\int_0^1\left\|\mathcal P_{\nabla,p_t}a[w]\right\|_{L^2(p_t)}^2\mathrm dt.\tag{34}
$$

一阶变分、投影下降、KKT 系统与加权 Poisson 投影见附录 I。可行方向是环境梯度的螺线投影，故优化保持在实现同一密度路径的场的纤维内。

**目标为有限步求解器时为何优化连续泛函？** 对划分 $\pi$，定义离散局部 $W_2$ 目标

$$
\mathcal B_\pi(w)=\sum_{k=0}^{N-1}\frac{2}{h_k^3}W_2^2\left(\left(\mathrm{Id}+h_kw_{t_k}\right)_\#p_{t_k},p_{t_{k+1}}\right),\qquad h_k=t_{k+1}-t_k.\tag{35}
$$

**定理 6（离散 Euler 规范优化的 $\Gamma$-极限）**：设 $\mathcal A\subset v+\mathcal U_p$ 在拓扑 $\tau$ 下紧。假设 Euler 局部 $W_2$ 展开在 $\mathcal A$ 上均匀、其 $O(h^3)$ 余项一致有界、且 $t\mapsto\left\|\mathcal P_{\nabla,p_t}a[w]\right\|^2$ 在 $w\in\mathcal A$ 上一致 Lipschitz。则

$$
\sup_{w\in\mathcal A}\left|\mathcal B_\pi(w)-\mathcal B(w)\right|\le C|\pi|\to0.\tag{36}
$$

从而在 $\tau$ 下 $\mathcal B_\pi\xrightarrow{\Gamma}\mathcal B$；每个收敛的离散极小点序列都有连续极小极限。在非紧可行集上，只要加入正则项使命题等度强制（equicoercive），同一结论成立。因此连续代表元选择问题是离散求解器目标的变分极限，而不只是后向误差暗示的类比。证明与正则化等度强制形式见附录 H。

经典最优传输通过最小化连续动能选择水平提升；此处给定边缘曲线固定，而所选数值方法诱导第二个水平准则：最小化其离散映射的局部输运缺陷。这补充了高斯设定中概率流 ODE 的端点映射解释（Khrulkov et al., 2023）与经典 Otto–Benamou–Brenier 几何（Benamou & Brenier, 2000; Otto, 2001）。

**高斯精确控制**：对 $p_t=\mathcal N(0,\Sigma_t)$ 与 $w_t(x)=B_tx$，连续输运与零首阶 Euler 偏差归结为

$$
B_t\Sigma_t+\Sigma_tB_t^\top=\dot\Sigma_t,\qquad2B_t\Sigma_tB_t^\top=\ddot\Sigma_t.\tag{37}
$$

对 $\Sigma_t=s(t)^2\mathbf I$，可行提升为 $B_t=(\dot s/s)\mathbf I+A_t$（$A_t^\top=-A_t$），且抵消条件要求

$$
A_t^2=-\frac{\ddot s(t)}{s(t)}\mathbf I.\tag{38}
$$

当 $\ddot s/s>0$ 时，偶数维存在精确斜规范，而奇数维总剩一个标量方向不可消除；完整分类见附录 J。

**连续 OT 最优性不是有限步求解器最优性**：径向高斯提升 $v_t=(\dot s/s)x$ 是梯度场、即最小动能代表元，然而

$$
W_2\left(\left(\mathrm{Id}+hv_t\right)_\#p_t,p_{t+h}\right)=\frac{\sqrt d}{2}\left|\ddot s(t)\right|h^2+O\left(h^3\right).
$$

在偶数维，可行的非梯度提升 $\left[(\dot s/s)\mathbf I+\sqrt{\ddot s/s}\,J\right]x$（$J^\top=-J$、$J^2=-\mathbf I$）能抵消首阶协方差缺陷并达到 $O(h^3)$。因此同一连续密度路径既有 Brenier 偏好的提升，也有 Euler 偏好的不同提升；规范纤维是真正的有限求解器控制空间。

## 8 受控与预训练验证

**受控检验**：代表元选择在精确与受控模型中检验；下述预训练实验隔离时间步分配。精确高斯路径恢复预测的局部 $W_2$ 阶数与偶/奇规范阻碍；解析混合路径验证有限-$N$ 分位代理、传播加权与平方根分配的鲁棒性。统一的 hard-GMM 协议把密度活跃调度与嵌入的 Euler–Heun 细化、Jo–Choi 速度变化重采样、仅粒子对偶残差、传播感知加权、轨迹耦合 oracle 与公平 NFE 的 Heun 进行比较。这些比较支持"具有竞争力"而非"一致占优"；同一附录用精确受控剖面验证仅粒子残差。完整协议与定量检验见附录 B、C、D、E。

**预训练 EDM CIFAR-10**：我们在噪声变量 $\sigma$ 中积分预训练 CIFAR-10 EDM 网络（Karras et al., 2022）的确定性概率流 ODE：

$$
\frac{\mathrm dx}{\mathrm d\sigma}=f_\sigma(x)=\frac{x-D_\theta(x,\sigma)}{\sigma}.
$$

单个离线剖面估计 Euler 修正方程残差 $E_1=(\partial_\sigma f_\sigma+J_{f_\sigma}f_\sigma)/2$，把它投影到随机特征 Wasserstein 水平空间，并按经验终端放大率加权。Euler 时间步取实际求解变量中 $\left[K_{\mathrm{emp}}(\sigma)R_{\mathrm{gal}}(\sigma)\right]^{1/2}$ 的分位数。从表 1 可见：在 Euler 内部，所提网格在 8、16、20 NFE 下相对 $\log$-$\sigma$ 降低 FID，并在每个展示的预算下优于 EDM-$\rho$；到 35 NFE 时增益几乎消失，因一阶网格已足够密集。这些行是对论文的直接检验：网络、更新规则、NFE、种子与运行时间均匹配，唯一设计变量是时间步布置。DPM++ 与 EDM Heun 针对不同轴：它们通过多步或二阶信息改进更新公式，其更低 FID 度量的是求解器设计而非 Euler 网格质量。我们的方法则优化固定无状态一阶求解器在何处花评估，并产生可跨种子与预算复用的离线剖面。附录 A 的匹配种子密集网格研究发现，我们的网格在 8 到 512 NFE 的每个测试预算下都最接近 1000 步 Euler 参考；而在 1000 NFE 时三种 Euler 调度变得不可区分。因此增益是更快收敛到同一 Euler 极限，与更高阶求解器工程互补。

**表 1　预训练 CIFAR-10 EDM：FID-50k / 生成时间**（第一块保持 Euler 更新固定、只改变时间步布置；第二块改变求解器类别；FID 评估时间不计入）

| 方法 | 8 NFE | 16 NFE | 20 NFE | 35 NFE |
| --- | --- | --- | --- | --- |
| **固定 Euler 更新：调度比较** | | | | |
| Euler/Ours | 16.4420 / 441.8 s | 6.9354 / 867.7 s | 5.5274 / 1084.0 s | 3.5285 / 1884.6 s |
| Euler/log-σ | 21.6984 / 442.2 s | 7.6153 / 867.4 s | 5.8316 / 1084.3 s | 3.5154 / 1884.7 s |
| Euler/EDM-ρ | 22.2181 / 441.8 s | 8.1022 / 867.2 s | 6.2264 / 1082.5 s | 3.7318 / 1885.4 s |
| **更强求解器语境** | | | | |
| DPM++ | 8.0429 / 456.8 s | 2.6684 / 895.6 s | 2.3117 / 1114.4 s | 2.0205 / 1939.6 s |
| 原始 EDM Heun | – | – | – | 1.8486 / 1901.2 s |

**图 1**：8 NFE 下三种 Euler 网格的匹配种子 CIFAR-10 样本。每一行使用相同网络与更新规则，仅时间步布置不同；该视觉比较与表 1 第一块所检验的固定求解器主张一致。

## 9 结论

## 附录

### A 预训练 EDM CIFAR-10 细节

本附录展开第 8 节的图像模型验证。所有方法使用同一类别条件预训练 EDM 网络、种子 0—49999、批大小 32 与 CIFAR-10 FID 参考。表 1 中的 Euler 行仅在时间步布置上不同；DPM++ 使用二阶 EDM 多步更新，而原始 EDM 配置使用 Heun 式校正、18 步（即 35 次网络评估）。

**两种不同比较**：对本文方法的直接检验是固定 NFE 下 Euler 对 Euler：学习场与数值更新不变，只有网格节点移动。DPM++ 与 EDM Heun 则修改积分公式，它们标定更强求解器的精度，但不检验时间步分配主张。密度活跃剖面也可作为诊断或与其他求解器结合；本文用 Euler 隔离它，使分配效应可识别。

**离线剖面**（图 A.1）：剖面由 Galerkin 估计的密度活跃残差与经验终端放大率构成，并在实际求解变量中转为分位数网格（图 A.1 给出该剖面的形态）。**密集网格收敛**（图 A.2）：匹配种子研究比较各调度相对 1000 步 Euler 参考的收敛；在 8—512 NFE 的每个测试预算下所提网格最接近参考，而在 1000 NFE 时三种 Euler 调度几乎不可区分（差异小于 0.002，生成时间相差数个百分点）。**FID—时间权衡**（图 A.3）：Euler 调度位于几乎相同的墙钟时间处，说明低 NFE 改善不是生成时间的重新分配。**16 NFE 匹配样本**（图 A.4）：与图 1 相同的固定求解器比较，在 16 NFE 下展示所提网格的视觉改进。

**表 A.1　5000 张 CIFAR-10 样本上的高 NFE Euler 检查**（每行均用 1000 次 Euler 评估；FID 计算时间不计入）

| 调度 | FID-5k | 生成时间（s） |
| --- | --- | --- |
| Euler/Ours | 6.64496 | 5187.9 |
| Euler/log-σ | 6.64442 | 5112.5 |
| Euler/EDM-ρ | 6.64618 | 5289.6 |

**图 A.1**：Euler 分配所用的离线剖面（密度活跃残差的 Galerkin 估计及其终端加权）。
**图 A.2**：到 1000 步 Euler 参考的匹配种子收敛。
**图 A.3**：FID-50k 对墙钟生成时间。
**图 A.4**：16 NFE 下三种 Euler 调度的匹配种子 CIFAR-10 样本。

### B 精确机制检验

下列解析例子验证驱动分配规则的机制。它们被刻意设计得很小：相关边缘分布、速度与密度活跃缺陷都有闭式表达，故数值观察可直接与定理比较，而非与学习代理比较。

**B.1 高斯抵消与奇偶性**：对 $p_t=\mathcal N(0,s(t)^2\mathbf I)$，构造斜规范使首阶密度误差被抵消（图 B.5 左：密度活跃修正方程偏差在预测的 $\alpha=\pm1$ 处为零；右：同一连续密度路径的有限步 Euler 协方差误差，抵消用的斜规范在每个展示的步数下都降低误差）。表 B.2 给出 $s(t)=1+t^2$ 的高斯路径在 Euler 积分下的相对协方差误差：随 $N$ 增大，$\alpha=1$ 的精确规范误差以更快阶数下降。同构造还给出奇偶阻碍：正交复结构可在偶数维抵消同性残差，而奇数维总剩一个标量方向；直接最小化线性残差在 2、4 维达到数值精度零、在 3、5 维严格为正，与定理 12 一致。

**表 B.2　$s(t)=1+t^2$ 的高斯路径在 Euler 积分下的相对协方差误差**（按原表逐格转录）

| $N$ | $\alpha=0$ | $\alpha=0.5$ | $\alpha=1$ |
| --- | --- | --- | --- |
| 4 | 3.0856e-01 | 2.4783e-01 | 4.2401e-02 |
| 8 | 1.7267e-01 | 1.3500e-01 | 1.2940e-02 |
| 16 | 9.1856e-02 | 7.0496e-02 | 3.5626e-03 |
| 32 | 4.7453e-02 | 3.6023e-02 | 9.3324e-04 |
| 64 | 2.4128e-02 | 1.8209e-02 | 2.3871e-04 |
| 128 | 1.2167e-02 | 9.1540e-03 | 6.0355e-05 |

**图 B.5**：精确高斯规范检验（左：归一化密度活跃修正方程偏差；右：有限步 Euler 协方差误差）。

**B.2 为什么完整材料加速度不是分配信号**：时变斜规范可以快速旋转而保持首阶边缘协方差缺陷为零。在受控四维构造中，最大密度活跃残差约为 $5\times10^{-15}$，而完整材料加速度代理达到约 136。基于完整加速度的调度会把节点集中在虽大却对边缘不可见的尖峰附近。该例是"轨迹曲率越大总意味着边缘误差越大"这一规则的精确反例；没有性能主张依赖特定刻度图的视觉外观。机制检验总结：高斯例子确立两点——保边缘规范可抵消有限求解器首阶密度误差，且大的轨迹级加速度可对边缘不可见；随后的 hard-GMM 与 CIFAR-10 研究评估这些机制的实用后果。

### C Hard-GMM 分配研究

本附录在受控的八模态高斯混合路径（权重不等、中心旋转并分离、分量方差递减）上检验调度的后果。与精确高斯检验不同，此处的代理**相关而非人为分离**；实验问的是理论关联的密度活跃调度在固定低 NFE 预算下是否仍有竞争力。

**C.1 主协议**（表 C.3）：剖面在 31 个时刻、每时刻 1536 个粒子上评估；调度由密度活跃残差、完整材料加速度范数或速度范数构造；分配指数或固定为理论 Euler 值 $\gamma=1/2$，或在不相交验证种子上选择；最终指标使用独立测试种子。

**表 C.3　主 hard-GMM 评估协议**（按原表逐格转录）

| 项目 | 取值 |
| --- | --- |
| 剖面网格 | $[0,1]$ 上 31 个点，每时刻 1536 个粒子 |
| 采样预算 | 每个评估种子 2048 个粒子 |
| 验证/测试划分 | 验证集选择 $\gamma$；测试种子不相交 |
| MMD | RBF MMD，确定性截断到 512 个点 |
| Sliced Wasserstein | 128 个随机方向 |
| 调度族 | 均匀或代理分位数，$\gamma\in\{0.25,0.5,0.75,1\}$ |
| 公平 NFE 约定 | 一个 Euler 区间计一次场评估；一个 Heun 区间计两次 |

**C.2 理论关联的固定指数比较**：三个剖面为 $R_{\mathrm{dens}}(t)=\mathbb E_{p_t}\left[(\nabla\cdot a_v+\langle\nabla\log p_t,a_v\rangle)^2\right]^{1/2}$、$R_{\mathrm{acc}}(t)=\mathbb E_{p_t}\left[\|a_v\|^2\right]^{1/2}$、$R_{\mathrm{speed}}(t)=\mathbb E_{p_t}\left[\|v_t\|^2\right]^{1/2}$。旧文件名把 $R_{\mathrm{acc}}$ 称为"曲率"，但所测的是完整材料加速度范数。该路径上三个代理都在困难的后期区域增大，故其调度预期相似；附录 B 的精确高斯例子才是它们分离的选择性反例。

**表 C.4　固定 Euler 指数 $\gamma=1/2$ 的理论关联 hard-GMM 比较**（按原表逐格转录）

| NFE | 代理 | $\gamma$ | MMD↓ | SW↓ | Wt. err.↓ | Leak.↓ |
| --- | --- | --- | --- | --- | --- | --- |
| 8 | Uniform | 0.00 | 0.01235 | 0.7819 | 0.1196 | 1.0000 |
| 8 | Density | 0.50 | 0.008942 | 0.5546 | 0.2264 | 0.8704 |
| 8 | Mat. acc. | 0.50 | 0.006744 | 0.5673 | 0.1221 | 0.9993 |
| 8 | Speed | 0.50 | 0.006880 | 0.5749 | 0.1517 | 0.9966 |
| 16 | Uniform | 0.00 | 0.007978 | 0.4685 | 0.0857 | 0.9764 |
| 16 | Density | 0.50 | 0.005379 | 0.3247 | 0.1178 | 0.2305 |
| 16 | Mat. acc. | 0.50 | 0.005172 | 0.3463 | 0.0891 | 0.5260 |
| 16 | Speed | 0.50 | 0.004475 | 0.3376 | 0.0929 | 0.4727 |

**C.3 验证选择与混合阶基线**：附录 D 报告与嵌入 Euler–Heun 细化、Jo–Choi 速度变化调度、仅粒子对偶残差、方向传播加权、轨迹 oracle 与公平 NFE Heun 的不相交验证/测试比较。另一个混合实验只在由代理选出的区间上花 Heun 校正；因此密度活跃信号既可用于移动 Euler 节点，也可用于分配混合阶预算。

**表 C.5　固定 NFE 预算下的混合 Euler/Heun 分配**（按原表逐格转录；在该相关基准上三种非均匀选择器选择几乎相同的后期区间，且都优于均匀选择）

| NFE | 选择器 | $K$ | $q$ | MMD↓ | SW↓ |
| --- | --- | --- | --- | --- | --- |
| 8 | Uniform | 5 | 3 | 0.01636 | 0.6496 |
| 8 | Density | 5 | 3 | 0.003201 | 0.3333 |
| 8 | Mat. acc. | 5 | 3 | 0.003201 | 0.3333 |
| 8 | Speed | 5 | 3 | 0.003201 | 0.3333 |
| 16 | Uniform | 10 | 6 | 0.001887 | 0.2866 |
| 16 | Density | 10 | 6 | 0.001766 | 0.1459 |
| 16 | Mat. acc. | 10 | 6 | 0.001766 | 0.1459 |
| 16 | Speed | 10 | 6 | 0.001766 | 0.1459 |
| 32 | Uniform | 21 | 11 | 0.000455 | 0.2053 |
| 32 | Density | 21 | 11 | 0.000386 | 0.1311 |
| 32 | Mat. acc. | 21 | 11 | 0.000386 | 0.1311 |
| 32 | Speed | 21 | 11 | 0.000386 | 0.1311 |

**图 C.6**：固定 $\gamma=1/2$ 时的终端 MMD（每个非均匀调度都优于均匀 Euler；三个代理的接近值反映它们在该基准上共同的后期集中，而非底层误差信号等价）。

**Hard-GMM 结论**：密度活跃调度在理论预测指数下优于均匀 Euler，且当代理高度相关时与更简单的几何代理相比仍有竞争力。精确干扰例的作用是说明为何密度投影是有原则的信号；该混合研究则检验所得调度在困难非高斯路径上仍有用。

### D 统一附加基线与估计器验证

下文每个方法都在同一 hard-GMM 路径、同一指标实现与独立验证/测试种子上评估。Jo–Choi 基线在同一解析路径与评估协议上实现 Jo & Choi（2026）的固定预算速度变化重采样原理。

**D.1 协议**：解析八模态路径与评估指标不变；残差剖面用 31 个时间点、每点 1536 个粒子；四个验证种子从 $\{0.15,0.25,0.35,0.5,0.75,1\}$ 中选择 $\gamma$，选出的调度再在八个不相交测试种子上评估；每个测试种子使用 1536 个生成样本与目标样本、由 384 个点计算的 RBF MMD、64 个 sliced-Wasserstein 方向；表报八个测试种子上的均值±标准误。

**比较的调度**：1）**Density / Acceleration / Speed（验证选择）**：指数只在验证种子上选择，测试前冻结；2）**嵌入 Euler–Heun AMR**：从 $[0,1]$ 出发，二分"先导 RMS Euler–Heun 差异"最大的区间直到达到所需 Euler 区间数；3）**Jo–Choi 速度变化**：在 128 区间先导轨迹上估计 $\eta_i=\mathbb E\left[\|v_{t_{i+1}}(X_{t_{i+1}})-v_{t_i}(X_{t_i})\|^2\right]^{1/2}$，固定 NFE 网格在累计长度 $\sum_i\eta_i^{1/2}$ 上均匀，匹配 Jo & Choi（2026）官方 $N$ 步重采样构造所用的平方根重采样幂；4）**仅粒子对偶**：在由 64 个高斯 RBF 与低阶多项式特征构成的有限 critic 空间中优化残差恒等式（104）；该估计器使用粒子与材料加速度，但不使用分数、也不显式使用散度；5）**Directional-$K$ 密度**：沿 $a_v$ 扰动粒子并用细 RK4 传播两份副本到 $t=1$ 估计方向切向放大代理；因原始放大率在责任边界附近重尾，取三个先导种子的中位数、在对数尺度上做宽度 3 的中值滤波、仅裁剪到经验 5—95% 区间；这显式是 $K(1,t)$ 的稳健代理，而非算子范数估计；6）**耦合 oracle**：一个可微网格在单独训练粒子上最小化相对 256 步 RK4 参考的逐样本平方偏差；它属轨迹耦合 oracle，不必最小化 MMD；7）**公平 NFE Heun**：均匀 Heun 求解器在 $N$ 次评估预算下使用 $N/2$ 个区间。

**D.2 统一结果**：验证选择的密度调度在 NFE 8 时把 MMD 从 $0.02013\pm0.00232$ 降到 $0.00939\pm0.00138$，在 NFE 16 时从 $0.00646\pm0.00184$ 降到 $0.00462\pm0.00161$。Euler–Heun AMR 与 Jo–Choi 调度可比：NFE 8 时其 MMD 分别为 $0.01052\pm0.00179$ 与表 D.6 所示值。

**表 D.6　仅验证集选择超参数后的统一 hard-GMM 测试结果**（按原表逐格转录；耦合 oracle 针对轨迹 MSE 优化，而非针对所展示的任一分布指标）

| NFE | 方法 | MMD↓ | SW↓ |
| --- | --- | --- | --- |
| 8 | Uniform Euler | 0.0201±0.002 | 0.7987±0.017 |
| 8 | Density（val.） | 0.0094±0.001 | 0.5528±0.016 |
| 8 | Acceleration（val.） | 0.0096±0.001 | 0.5883±0.015 |
| 8 | Speed（val.） | 0.0095±0.001 | 0.5867±0.015 |
| 8 | Euler–Heun AMR | 0.0105±0.002 | 0.5469±0.019 |
| 8 | SDM variation | 0.0096±0.001 | 0.5811±0.022 |
| 8 | Particle dual | 0.0099±0.002 | 0.5589±0.020 |
| 8 | Directional-$K$ | 0.0092±0.001 | 0.5225±0.024 |
| 8 | Coupling oracle | 0.0096±0.001 | 0.5523±0.022 |
| 8 | Uniform Heun | 0.0257±0.002 | 0.8937±0.015 |
| 16 | Uniform Euler | 0.0065±0.002 | 0.4305±0.012 |
| 16 | Density（val.） | 0.0046±0.002 | 0.3509±0.011 |
| 16 | Acceleration（val.） | 0.0036±0.0009 | 0.3015±0.017 |
| 16 | Speed（val.） | 0.0037±0.0010 | 0.3155±0.015 |
| 16 | Euler–Heun AMR | 0.0038±0.001 | 0.3079±0.016 |
| 16 | SDM variation | 0.0038±0.001 | 0.3130±0.013 |
| 16 | Particle dual | 0.0040±0.001 | 0.3145±0.014 |
| 16 | Directional-$K$ | 0.0035±0.001 | 0.2865±0.015 |
| 16 | Coupling oracle | 0.0041±0.002 | 0.3119±0.012 |
| 16 | Uniform Heun | 0.0022±0.0008 | 0.1651±0.012 |

**图 D.7**：统一协议下的 MMD（密度活跃调度与更简单几何代理相比保持竞争力）。
**图 D.8**：精确分数—散度、仅粒子对偶、稳健 Directional-$K$ 加权与 Jo–Choi 轨迹的比较。

### E 附加定理关联的定量检验

本附录收集紧凑的数值检验：其量或已知解析、或可对照独立优化的 oracle 评估。它们支撑局部阶数、传播与鲁棒性陈述，但并非主要经验基准；预训练 CIFAR-10 结果仍是图像模型的主要验证。

**E.1 解析混合路径与目标特异性**：二维路径含八个不等权高斯分量，其中心旋转并分离、共同方差收缩。责任度给出满足连续性方程的解析全局速度；归一化有限差分连续性残差的 RMS 低于 $10^{-8}$。在 $N=8$ 时，四个独立构造的网格在留出粒子上比较（表 E.7）。密度分位网格精确最小化局部代理，而终端与轨迹 oracle 优化不同目标。

**表 E.7　$N=8$ 的解析 GMM 网格比较**（按原表逐格转录；MMD 为三个评估种子的均值±标准误；密度分位网格精确最小化局部代理，而终端与轨迹 oracle 优化不同目标）

| 网格 | 测试 MMD | 局部代理 | $d(\pi,\pi_{\mathrm{marg}})$ |
| --- | --- | --- | --- |
| Uniform | 0.0400±0.0094 | 1.184 | 0.0858 |
| Density quantile | 0.0363±0.0175 | 1.000 | 0.1412 |
| Trajectory oracle | 0.0357±0.0153 | 1.040 | 0.1272 |
| Marginal RFF oracle | 0.0381±0.0107 | 2.377 | 0 |

终端边缘 oracle 在单独优化粒子上最小化固定随机特征 MMD，故其局部代理值预期非最优；反之，密度网格比终端特征 oracle 更接近轨迹 oracle。该结果使本文的区分可操作：局部边缘误差、配对轨迹误差与终端特征指标可诱导不同的时间步几何。

**E.2 阶数、传播与剖面鲁棒性**：表 E.8 以紧凑数值形式总结定理关联检验；直接报告数值量可避免把有限点集过度解释为性能曲线。

**表 E.8　紧凑的定理关联检验**（按原表逐格转录；传播行报告 $N=16$ 的终端 $W_2$；鲁棒性行比较最粗与最细网格）

| 主张 | 预测 | 观测检验 |
| --- | --- | --- |
| 局部边缘阶数 | 径向阶数 2；被抵消的偶数维斜规范阶数 3；奇数维阻碍阶数 2 | 拟合尾斜率分别为 2.000、2.998—3.002、2.000—2.00004 |
| 传播加权 $K(1,t)R(t)$ | 逼近终端网格 oracle | $N=16$ 时：均匀 0.18544、仅残差 0.19615、$K$ 加权 0.18514、oracle 0.18509 |
| 剖面鲁棒性 | 随分位网格细化，连续 $\chi^2$ 恒等式被恢复 | 相关性从 $N=\cdots$ 时的 0.891 增大（原文该处截断） |

### F 应用与优化相关性

该框架有三个面向优化的应用。**自适应低 NFE 调度**：最稳健的应用是时间步优化——密度活跃残差 $R(t)$ 来自边缘后向误差恒等式而非纯轨迹级局部误差；定理 3 表明终端相关的剖面是 $K(1,t)R_{\mathrm{loc}}(t)$，定理 4 给出相应约束分配。**代表元设计**：规范自由度给出一个新的设计变量，用于为固定求解器选择数值上有利的连续等价速度场（第 7 节与附录 I、J）。**分析与剖析**：投影残差可作为诊断量，指出求解器缺陷中哪些部分真正改变密度，从而区分"轨迹难"与"边缘难"。

### G 局部最优传输解释

本附录证明定理 2 的 Euler 特化与第 7 节的同性高斯分离；一般 $r$ 阶论证见附录 H。工作在紧无边域或具有足够衰减与有限二阶矩的 $\mathbb R^d$ 上；假设 $p_t$ 光滑且严格正、$w_t$ 具备下述 Taylor 展开所需导数、涉及的密度扰动位于 $p_t$ 附近的正则 Wasserstein 图内。

**G.1 局部缺陷公式的证明**：利用标准切向结构，把一步映射的边缘误差展开到 $h^2$ 阶，并把速度扰动分解为梯度与螺线分量；螺线分量经加权散度与对偶范数作用为零，梯度分量给出 $W_2$ 切范数，从而得到式（3）（4）（19）。

**G.2 同性高斯分离**：对 $p_t=\mathcal N(0,s(t)^2\mathbf I)$，显式计算一步 Euler 的边缘协方差误差，得到径向梯度提升的 $W_2$ 误差为 $\frac{\sqrt d}{2}|\ddot s|h^2+O(h^3)$；而斜规范提升（偶数维）可抵消首阶项达 $O(h^3)$，由此把连续最小作用量与有限步精度分离。

### H 求解器感知扩展与变分极限

**变分要点**：本附录收集把局部修正方程、传播分配、对残余错配的鲁棒性与 Euler $\Gamma$-极限联系起来的证明细节；假设在所有可行代表元上一致陈述，使所得目标可用于优化而非仅逐点误差展开。

**H.1 $r$ 阶密度与 Wasserstein 缺陷**：在正则 Wasserstein 图与均匀性假设下证明定理 2 的 $r$ 阶形式（式（18）），并给出在不同范数下控制余项的条件。

**H.2 传播与求解器阶数**：证明定理 3 的传播界（式（23）），说明局部缺陷经输运演化 $U_w(1,t)$ 放大为终端误差，并给出 $h(t)\simeq n(t)^{-1}$ 下累积缺陷的表达式。

**H.3 精确连续与离散分配**：证明定理 4（KKT 与分位最优性，式（25）—（28））与定理 5（调度退化恒等式，式（31）（32）），并给出网格局部步长渐近与 $O(N^{-2})$ 端点逼近。

**H.4 稳健性与剖面分离**：构造光滑标量流，使"仅残差目标"相对传播感知最优的比值增长到 $\sqrt M/4\to\infty$，从而说明传播加权的结构性作用。

**H.5 传播分离**：在同一构造下验证 $K(1,t)R(t)$ 与 $R(t)$ 两类目标的最优调度确有可分离差异。

### I 投影规范优化

推导螺线约束代表元选择问题

$$
\min_{u\in\mathcal U_p}\mathcal B(v+u)+\lambda\,\mathcal R(u)
$$

的投影优化步：先取 $\mathcal B$ 的一阶变分，再把它投影到 $\mathcal U_p$（即取环境梯度减去其在 $\mathcal G_{p_t}$ 上的分量），得到保持纤维内可行性的下降方向；相应 KKT 系统与加权 Poisson 投影（式（13）（14））一并给出。由于可行方向是环境梯度的螺线投影，优化过程始终停留在实现同一密度路径的场纤维内。

### J 精确与受阻高斯规范

**精确高斯要点**：本附录给出主要高斯命题背后的显式有限维模型。Lyapunov 方程固定连续密度路径，而 Riccati 型方程判定线性规范何时抵消首阶 Euler 协方差缺陷；同性情形随后归结为斜对称控制的奇偶阻碍。

**J.1 同性分类与奇偶阻碍**：设 $p_t=\mathcal N(0,\Sigma_t)$、$w_t(x)=B_tx$。连续输运要求 $B_t\Sigma_t+\Sigma_tB_t^\top=\dot\Sigma_t$；零首阶 Euler 偏差另要求 $2B_t\Sigma_tB_t^\top=\ddot\Sigma_t$。对 $\Sigma_t=s(t)^2\mathbf I$，写 $B_t=(\dot s/s)\mathbf I+A_t$（$A_t^\top=-A_t$），抵消条件化为 $A_t^2=-\frac{\ddot s}{s}\mathbf I$。当 $\ddot s/s>0$ 时，偶数维存在满足该式的斜对称复结构（$J^2=-\mathbf I$），而奇数维因斜对称矩阵必有零特征值而剩一个标量方向不可消除；完整分类与定理 12 的表述在原文给出。

### K 附加投影细节

为完整起见回顾投影论证：向量场 $u\in\mathcal U_p$ 当且仅当 $\nabla\cdot(pu)=0$。对任意光滑位势 $\phi$，由分部积分 $\int p\langle u,\nabla\phi\rangle\mathrm dx=-\int\phi\,\nabla\cdot(pu)\mathrm dx=0$，故 $\mathcal U_p$ 是梯度空间在 $L^2(p)$ 中的正交补；加权 Poisson 方程 $\nabla\cdot(p\nabla\phi)=\nabla\cdot(pz)$ 的解存在且唯一（在适当的零均值与正则条件下），从而梯度投影 $\mathcal P_{\nabla,p}$ 良定义。

### L 密度缺陷的传播与代价核算

**L.1 定理 3 的证明**：令 $\mathcal F(p,w)=\partial_tp+\nabla\cdot(pw)$。由假设，解映射 $w\mapsto p[w]$ 在 $v$ 的邻域内可微、取值于具有终端范数 $X$ 的轨迹空间；对 $\mathcal F=0$ 微分得到 $p$ 关于 $w$ 的线性化方程，代入 $w_h=w+h^rE_r[w]+O(h^{r+1})$ 并对时间积分，即得式（23）的界。

**L.2 离线剖面代价与摊销**：离线剖面只需在少量时间点估计残差与放大率，可一次计算并跨生成样本与 NFE 预算复用；因此其代价相对于采样可忽略，且不随种子或预算重新计算。

**L.3 仅粒子对偶残差估计器**：给出不使用分数、仅依赖粒子与材料加速度的对偶残差估计（式（104）），并在受控实验中验证其与精确密度活跃残差的一致性。

### M 混合与实用参数化

高斯例子显示精确可解性；对多模态密度，精确抵消更难，但螺线可行方向仍可显式构造。设 $p_t(x)=\sum_{m=1}^{M}\pi_m(t)\,\mathcal N\left(x;\mu_m(t),\Sigma_m(t)\right)$，则连续性方程允许把每个分量速度写成"分量内输运 + 分量间质量交换"的形式，后者对应规范自由度；据此可构造保持混合权重的可行方向，并给出实际参数化（分量速度、责任度重分配）的实现方式。

### N 附加显式例子

本附录记录用于检验与压力测试理论的显式例子，目标是把五种现象分开：规范自由度的消失、精确抵消、非高斯抵消、多模态可行性与有害纯规范。**N.1 一维阻碍**：在 $\mathbb R$ 上 $p_t(x)>0$ 且 $p_t(x)u_t(x)\to0$（$|x|\to\infty$）时，螺线约束蕴含 $u_t\equiv0$，即一维不存在非平凡规范。**N.2 共形各向异性高斯路径**：给出可使首阶协方差缺陷部分抵消的共形规范。**N.3 径向密度与离心补偿**：径向密度下给出离心型规范及其补偿效果。**N.4 混合叠加**：多模态下规范可行方向可叠加。**N.5 环面上的有害纯规范**：构造纯规范场使轨迹显著改变而边缘不变，说明轨迹级指标为何可能误导。**N.6 曲率干扰高斯规范**：构造轨迹曲率大但密度活跃残差近零的高斯规范，作为"曲率启发式"的反例。

### O 联络视角

尽管正文以约束优化表述，同一构造有几何解释。令微分同胚群 $\mathrm{Diff}(\mathcal M)$ 通过推前作用在密度上，定义投影 $\pi:\mathrm{Diff}(\mathcal M)\to\mathcal P(\mathcal M)$、$\pi(\varphi)=\varphi_\#p_0$。$p$ 上的纤维由所有生成同一密度的粒子映射组成；$p$ 处的**垂直**切空间正是螺线方向，而**水平**空间是梯度方向。于是代表元选择是在该纤维丛的水平分布上选择一个截面，使某类求解器误差最小；Euler 的 $B$ 泛函可视为该水平分布上诱导的度量（或联络）能量的截断，而定理 6 说明离散目标在网格细化下收敛到该连续联络目标。

## 图注与表注

**图 1**：8 NFE 下三种 Euler 网格的匹配种子 CIFAR-10 样本（仅时间步布置不同）。
**图 A.1**：Euler 分配所用的离线剖面。
**图 A.2**：到 1000 步 Euler 参考的匹配种子收敛。
**图 A.3**：FID-50k 对墙钟生成时间。
**图 A.4**：16 NFE 下三种 Euler 调度的匹配种子 CIFAR-10 样本。
**图 B.5**：精确高斯规范检验。
**图 C.6**：固定 $\gamma=1/2$ 的终端 MMD。
**图 D.7**：统一协议下的 MMD。
**图 D.8**：精确分数—散度、仅粒子对偶、稳健 Directional-$K$ 加权与 Jo–Choi 轨迹的比较。

**表注**：表 1（正文 §8）、表 A.1、表 B.2、表 C.3、表 C.4、表 C.5、表 D.6、表 E.7、表 E.8 均已按原表逐格转录；其中表 C.4/C.5 的数值包含原文中的有效数字位数，未做四舍五入；表 E.8 第三行"观测检验"在 PDF 抽取文本中于 $N$ 处截断，已按抽取结果保留并加注。

## 参考文献

> 以下按原文参考文献表（作者—字母序）编号 [1]—[40] 转录英文原条目，条目文字不翻译；正文引用沿用原文的"作者（年份）"格式，与本表按首作者姓氏对应。

[1] Michael S. Albergo, Nicholas M. Boffi, and Eric Vanden-Eijnden. Stochastic interpolants: A unifying framework for flows and diffusions, 2023. arXiv preprint arXiv:2303.08797.

[2] Luigi Ambrosio, Nicola Gigli, and Giuseppe Savaré. Gradient Flows in Metric Spaces and in the Space of Probability Measures. Birkhäuser, 2008.

[3] Jean-David Benamou and Yann Brenier. A computational fluid mechanics solution to the Monge–Kantorovich mass transfer problem. Numerische Mathematik, 84(3):375–393, 2000.

[4] Jean-David Benamou, Thomas O. Gallouët, and François-Xavier Vialard. Second-order models for optimal transport and cubic splines on the Wasserstein space. Foundations of Computational Mathematics, 19(5):1113–1143, 2019.

[5] Ricky T. Q. Chen, Yulia Rubanova, Jesse Bettencourt, and David K. Duvenaud. Neural ordinary differential equations. In Advances in Neural Information Processing Systems, 2018.

[6] Sitan Chen, Sinho Chewi, Holden Lee, Yuanzhi Li, Jianfeng Lu, and Adil Salim. The probability flow ODE is provably fast. In Advances in Neural Information Processing Systems, volume 36, pp. 68552–68575, 2023.

[7] Yuzhu Chen, Fengxiang He, Shi Fu, Xinmei Tian, and Dacheng Tao. Adaptive time-stepping schedules for diffusion models. In Proceedings of the Fortieth Conference on Uncertainty in Artificial Intelligence, volume 244 of PMLR, pp. 685–697, 2024.

[8] Yansong Gao, Zhihong Pan, Xin Zhou, Le Kang, and Pratik Chaudhari. Fast diffusion probabilistic model sampling through the lens of backward error analysis, 2023. arXiv preprint arXiv:2304.11446.

[9] Ernst Hairer, Christian Lubich, and Gerhard Wanner. Geometric Numerical Integration: Structure-Preserving Algorithms for Ordinary Differential Equations. Springer, 2006.

[10] Michael Hinze, Rene Pinnau, Michael Ulbrich, and Stefan Ulbrich. Optimization with PDE Constraints. Springer, 2009.

[11] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, 2020.

[12] Christian Horvat and Jean-Pascal Pfister. On gauge freedom, conservativity and intrinsic dimensionality estimation in diffusion models. In International Conference on Learning Representations, 2024.

[13] Yilie Huang, Wenpin Tang, and Xun Yu Zhou. ART for diffusion sampling: Continuous-time control and actor–critic learning, 2026. arXiv preprint arXiv:2607.02137.

[14] Sangwoo Jo and Sungjoon Choi. Formalizing the sampling design space of diffusion-based generative models via adaptive solvers and Wasserstein-bounded timesteps, 2026. arXiv preprint arXiv:2602.12624.

[15] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In Advances in Neural Information Processing Systems, volume 35, pp. 26565–26577, 2022.

[16] Naïl B. Khelifa, Richard E. Turner, and Ramji Venkataramanan. Diffusion models observe only gradients: A geometric perspective on score matching errors, 2026. arXiv preprint arXiv:2606.06179.

[17] Valentin Khrulkov, Gleb Ryzhakov, Andrei Chertkov, and Ivan Oseledets. Understanding DDPM latent codes through optimal transport. In International Conference on Learning Representations, 2023.

[18] Hugo Lavenant and Filippo Santambrogio. The flow map of the Fokker–Planck equation does not provide optimal transport. Applied Mathematics Letters, 133:108225, 2022.

[19] Sangyun Lee, Beomsu Kim, and Jong Chul Ye. Minimizing trajectory curvature of ODE-based generative models. In International Conference on Machine Learning, 2023.

[20] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. Flow matching for generative modeling. In International Conference on Learning Representations, 2023.

[21] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In International Conference on Learning Representations, 2023.

[22] Cheng Lu, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. DPM-Solver: A fast ODE solver for diffusion probabilistic model sampling in around 10 steps. In Advances in Neural Information Processing Systems, 2022.

[23] Felix Otto. The geometry of dissipative evolution equations: The porous medium equation. Communications in Partial Differential Equations, 26(1–2):101–174, 2001.

[24] Peter Pao-Huang, Xiaojie Qiu, and Stefano Ermon. Generative modeling with flux matching, 2026. arXiv preprint arXiv:2605.07319.

[25] Jianning Pei, Han Hu, and Shuyang Gu. Optimal stepsize for diffusion sampling, 2025. arXiv preprint arXiv:2503.21774.

[26] Emile Pierret and Bruno Galerne. Diffusion models for Gaussian distributions: Exact solutions and Wasserstein errors, 2025.

[27] Aram-Alexandre Pooladian, Heli Ben-Hamu, Carles Domingo-Enrich, Brandon Amos, and Yaron Lipman. Multisample flow matching: Straightening flows with minibatch couplings. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of PMLR, pp. 28100–28127, 2023.

[28] Amirmojtaba Sabour, Sanja Fidler, and Karsten Kreis. Align your steps: Optimizing sampling schedules in diffusion models. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of PMLR, pp. 42947–42975, 2024.

[29] Filippo Santambrogio. Optimal Transport for Applied Mathematicians. Birkhäuser, 2015.

[30] Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[31] Alexander Strunk and Roland Assam. Gauge flow models, 2025. arXiv preprint arXiv:2507.13414.

[32] Chenxi Tao and Seung-Kyum Choi. On the role of strain and vorticity in numerical integration error for flow matching, 2026. arXiv preprint arXiv:2605.06680.

[33] Vinh Tong, Dung Trung Hoang, Anji Liu, Guy Van den Broeck, and Mathias Niepert. Learning to discretize denoising diffusion ODEs. In The Thirteenth International Conference on Learning Representations, 2025.

[34] Cédric Villani. Optimal transport: Old and new, 2009.

[35] Gal Vinograd, Idan Achituve, and Ethan Fetaya. Diverse sampling in diffusion models with marginal preserving particle guidance, 2026. arXiv preprint arXiv:2605.06553.

[36] An B. Vuong, Michael T. McCann, Javier E. Santos, and Yen Ting Lin. Are we really learning the score function? Reinterpreting diffusion models through Wasserstein gradient flow matching, 2025. arXiv preprint arXiv:2509.00336.

[37] Shuai Wang, Zexian Li, Qipeng Zhang, Tianhui Song, Xubin Li, Tiezheng Ge, Bo Zheng, and Limin Wang. Differentiable solver search for fast diffusion sampling. In Proceedings of the 42nd International Conference on Machine Learning, volume 267 of PMLR, pp. 63549–63568, 2025.

[38] Shuchen Xue, Zhaoqiang Liu, Fei Chen, Shifeng Zhang, Tianyang Hu, Enze Xie, and Zhenguo Li. Accelerating diffusion sampling with optimized time steps. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 8292–8301, 2024.

[39] Liangyu Yuan, Ruoyu Wang, Tong Zhao, Dingwen Fu, Mingkun Lei, Beier Zhu, and Chi Zhang. Few-step diffusion sampling through instance-aware discretizations, 2026. arXiv preprint arXiv:2603.17671.

[40] Kaiwen Zheng, Cheng Lu, Jianfei Chen, and Jun Zhu. DPM-Solver-v3: Improved diffusion ODE solver with empirical model statistics. In Advances in Neural Information Processing Systems, volume 36, pp. 55502–55542, 2023.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 1 节引言（含四条贡献与两个优化问题）；第 2 节相关工作与定位；第 3 节保边缘规范（式（5）（6）、命题 1）；第 4 节求解器感知密度缺陷（定义 2、式（7）—（11）、定理 1 与 Euler 特化）；第 5 节密度活跃 Wasserstein 几何（式（12）—（21）、命题 2、定理 2）；第 6 节求解器阶数时间步分配（式（22）—（29）、定理 3—4；6.1 分配鲁棒性与传播，式（30）—（33）、定理 5）；第 7 节规范优化与离散极限（式（34）—（38）、定理 6、高斯精确控制）；第 8 节受控与预训练验证（表 1、图 1）；第 9 节结论；附录 A—O（A：预训练 EDM 细节与表 A.1、图 A.1—A.4；B：精确机制检验与表 B.2、图 B.5；C：hard-GMM 研究、表 C.3—C.5、图 C.6；D：统一基线与表 D.6、图 D.7—D.8；E：定理关联检验、表 E.7—E.8；F：应用与优化相关性；G：局部 OT 解释与证明；H：求解器感知扩展与变分极限；I：投影规范优化；J：精确与受阻高斯规范；K：附加投影细节；L：传播与代价核算；M：混合与实用参数化；N：附加显式例子；O：联络视角）；表 1、A.1、B.2、C.3、C.4、C.5、D.6、E.7、E.8（逐格）；图 1、A.1—A.4、B.5、C.6、D.7、D.8 图注；参考文献 [1]—[40] 英文原条目。未完成/未包含：①逐句逐式与 PDF 的终校未做（页尾标注 qa_complete=false）；②图 1 与附录图 A.1—D.8 的图像本体未复制（站点不上传图片），仅中文图注；③附录 G—O 的证明按原文推导结构与关键公式翻译，未逐行复现所有中间代数；④表 E.8 第三行在 PDF 抽取文本中被截断（$N$ 处），已按抽取结果保留并加注；⑤原文引用为"作者（年份）"格式，参考文献表为便于站点校验加了 [1]—[40] 数字前缀，二者按首作者姓氏对应；⑥骨架版本 "2026-10-25 推荐" 与 PDF v1 2026-10-21 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}

