---
layout: page
title: "相依误差下非线性逆问题的后验一致性及其在时间演化方程中的应用｜中文全文译文"
permalink: /papers/translations/2026-11-01-2610-07240-posterior-consistency-dependent-errors-nonlinear-inverse/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/543be3b86f217d5c/) · [原文 arXiv](https://arxiv.org/abs/2610.07240/) · [全部目录](/papers/catalog/)

# 相依误差下非线性逆问题的后验一致性及其在时间演化方程中的应用

**原题：** Posterior Consistency under dependent errors in non-linear inverse problems with applications to time evolution equations  
**作者：** Aditya Jambhale（剑桥大学纯数学与数理统计系）  
**版本：** arXiv:2610.07240v1，2026-10-05；60 页；预印本/状态未确认（PDF 自标 Submitted to Bernoulli）。  
**范围与状态：** 全文中文译稿：摘要/关键词、第 1 节（含 §1.1 记号、§1.2 主要结果 Conditions 1.3–1.10 与 Theorems 1.12/1.14、§1.3 贡献总结）、第 2 节（含 §2.1–2.2 及 §2.2.1–2.2.3）、第 3 节（含 §3.1–3.2 应用）、附录 A–E 全部小节、命题/引理/定理/条件编号与陈述、参考文献英文原条目；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

设 \(\theta\mapsto G(\theta)\) 是把参数映到某个模拟动力系统的非线性偏微分方程之解的一个映射。我们给出若干条件，用以在带有相依噪声的 \(G(\theta)\) 观测下证明 \(\theta\) 的后验一致性；该噪声模型刻画了测量中所用传感器可能存在的时间相关性。我们给出两个例子：黏度与初值均未知的纳维–斯托克斯方程，以及扩散系数在空间上变化（异质）的反应扩散型方程；后者需要对带时间累积的 Darcy 传输算子建立新的稳定性估计。

**关键词：** 逆问题；非线性；贝叶斯；后验一致性

## 目录

（按原文顺序的中文简目）

- 1 引言
  - 1.1 记号
  - 1.2 主要结果
  - 1.3 贡献总结
- 2 收缩速率结果
  - 2.1 验证条件 1.4 与 1.5
  - 2.2 检验的构造（2.2.1 各向异性小波；2.2.2 估计量的构造；2.2.3 定理 1.12 的证明）
- 3 偏微分方程中的应用
  - 3.1 异质反应扩散方程
  - 3.2 未知黏度的二维纳维–斯托克斯方程
- 附录 A 技术结果（A.1 后验收缩速率定理；A.2 小球定理）
- 附录 B 含散度型算子的抛物型偏微分方程的稳定性
- 附录 C 证明（C.1 第 1 节的证明；C.2 第 2 节的证明；C.3 第 3 节的证明；C.4 定理 A.1 的证明；C.5 附录 B 的证明）
- 附录 D 抛物型 Sobolev 空间的小波刻画（D.1 小波的基本事实；D.2 抛物型 Sobolev 空间的小波刻画）
- 附录 E 偏微分方程正则性（E.1 异质反应扩散方程；E.2 二维纳维–斯托克斯方程）
- 致谢、资助、参考文献

## 1 引言

**非线性动力系统中的贝叶斯推断。** 在范围很广的科学应用中（例如化学、大气科学与地球物理），人们对一个动力系统 \((u(t,\cdot):t\ge 0)\) 进行测量；该系统在 \(L^2(\Omega,V)\) 中演化，即在某个 \(d\) 维区域 \(\Omega\)（或包含于 \(\mathbb{R}^d\)，或是 \(d\) 维环面 \(\mathbb{T}^d\)）上的平方可积函数空间，并取值于某个有限维向量空间 \(V=\mathbb{R}^{d_V}\)（配以欧氏内积）。然而，所关心的参数 \(\theta\)（它们决定动力学）一般不能由解直接观测到。记 \(\Theta\) 为可能参数的集合，则可用一个非线性映射把这一点形式化：

$$
G:\Theta\to L^2([0,S]\times\Omega,V),\tag{1}
$$

其中 \(S>0\) 是某个固定的时间尺度（为记号方便我们取 \(S=1\)）。给定某个 \(\theta\in\Theta\)，一个常用的观测模型是

$$
Y_i=G(\theta)(t_i,X_i)+\epsilon_i,\qquad\text{对 }i=1,\ldots,N,\tag{2}
$$

其中 \((t_i,X_i)\ \text{i.i.d.}\sim\mathrm{Unif}([0,S]\times\Omega)\) 是设计点，\(\epsilon=(\epsilon_i)_{i=1}^N\) 是若干观测误差。

用贝叶斯方法恢复 \(\theta\) 的做法是：在 \(\Theta\) 上放置一个先验概率测度 \(\Pi\)（一般依赖于 \(N\)），然后用观测数据 \(\mathcal{D}_N\equiv(Y_i,t_i,X_i)_{i=1}^N\) 按 Bayes 法则更新，得到后验 \(\Pi(\cdot|\mathcal{D}_N)\)。若假定 \(\epsilon\) 的分布关于 \(V^N\) 上的 Lebesgue 测度有密度，则 \(\mathcal{D}_N\) 在 \((V\times[0,S]\times\Omega)^N\) 上的分布 \(Q^N_\theta\) 也关于 Lebesgue 测度有密度 \(q^N_\theta\)。此时后验由如下公式给出的概率测度：

$$
d\Pi(\theta|\mathcal{D}_N)\propto q^N_\theta(\mathcal{D}_N)\,d\Pi(\theta).
$$

由于存在计算上可行的后验抽样方法（例如 pCN 或 Metropolis–Hastings 这类 MCMC 方法），在 A. Stuart 的开创性论文 Stuart (2010) 之后这些方法被广泛应用，其理论基础此后在 Nickl (2020)、Monard 等 (2021a)、Monard 等 (2021b) 中逐步建立，特别可参见 Nickl (2023)。更新的工作则专门关注时间演化情形下的问题，尤其是抛物型偏微分方程（PDE），见 Nickl 与 Titi (2024)、Konen 与 Nickl (2025)、Konen 与 Nickl (2026)、Nickl 等 (2025)、Castre 与 Nickl (2026)、Nickl (2024)、Kekkonen (2022) 或 Magra 等 (2026)。我们关心后验分布的渐近行为，并假定数据由某个真值 \(\theta_0\in\Theta\) 生成。朝向这一目标的首个结果是**后验一致性**，即对某个速率 \(\delta_N\to0\) 与常数 \(C\)，

$$
\Pi(\theta:d(\theta,\theta_0)\le C\delta_N\,|\,\mathcal{D}_N)\to1\quad\text{依 }Q^N_{\theta_0}\text{ 概率，当 }N\to\infty,\tag{3}
$$

其中 \(d\) 是 \(\Theta\) 上的某个度量；也就是说，随着数据增多，后验会收敛到真值。

**两个逆问题。** 为说明该理论，我们关注两个定义在 \(d\) 维环面 \(\Omega=\mathbb{T}^d\) 上的抛物型非线性 PDE。两个逆问题的一个共同特征是：关于参数的信息会随**时间累积**，从而使得证明 \(G\) 的反向稳定性（即逆映射 \(G^{-1}\) 的局部 Hölder 连续性估计，见命题 3.9 与 (10)）时所需的假设，相较于椭圆型 PDE 情形可以被减弱。

首先，我们考虑满足反应扩散型方程的 \(u:[0,1]\times\Omega\to\mathbb{R}\)（即对后 \(d\) 个自变量周期）：

$$
\begin{cases}
\dfrac{\partial u}{\partial t}-\nabla\cdot(D\nabla u)=f(u) & \text{在 }(0,1]\times\Omega,\\[2mm]
u(0,\cdot)=\varphi & \text{在 }\Omega,
\end{cases}\tag{4}
$$

其中 \(\nabla\) 与 \(\nabla\cdot\) 分别是梯度与散度算子，\(f:\mathbb{R}\to\mathbb{R}\) 是不依赖时间、光滑且紧支撑的“反应”函数，并记 \(f(u)\) 为函数 \(f(u)(x)=f(u(x))\)；此外，\(D:\Omega\to[D_{\min},\infty)\) 称为“扩散系数”（对某常数 \(D_{\min}>0\)），\(\varphi:\Omega\to\mathbb{R}\) 是初值。我们假定 \(f\)、\(\varphi\) 与 \(D_{\min}\) 已知，而 \(D\) 未知。当 \(d\le3\) 时，(4) 有唯一解（见命题 3.1），记为 \(u_D\)，由此得到正向映射

$$
G(D)=u_D.\tag{5}
$$

物理上，\(u\) 表示某种物质在介质中迁移时的量，该物质由某种反应生成或被其消耗：在 \(f(u)\) 为正处生成，在 \(f(u)\) 为负处被消耗。项 \(-\nabla\cdot(D\nabla u)\) 控制 \(u\) 在介质中扩散的多少。当介质均匀（即 \(D\) 为常数）时，我们就得到通常的反应扩散方程。因此我们把 (4) 称为**异质**反应扩散方程（heterogeneous reaction diffusion equation，简称 HRDE）；在某些生物过程 Roussel 与 Roussel (2004) 以及波前分析 Watt 与 Weber (1996) 中，它被视为经典反应扩散方程更贴近实际的替代。

为在数学上处理该问题，我们证明一个 Darcy 型传输算子（见 Bonito 等 (2017)、Alberti 等 (2025)、Nickl (2024)、Nickl 等 (2020) 以及 Nickl 与 Seizilles (2026)）在“抛物型”情形下的稳定性估计。假定解的各临界点随时间移动，即对某个扩散系数 \(D_1\) 存在常数 \(\delta>0\) 使得

$$
\inf_{x\in\Omega}\int_0^1|\nabla u_{D_1}(t,x)|^2\,dt\ge\delta,\tag{6}
$$

则对所有扩散系数 \(D_1,D_2\)，我们得到如下形式的估计：

$$
\|D_1-D_2\|_{L^2}\lesssim\big\|\nabla\cdot\big([D_1-D_2]\nabla u_{D_1}\big)\big\|^\eta_{L^2([0,1]\times\Omega)},\tag{7}
$$

其中 \(\eta\) 依赖于 \(D_1\) 与 \(D_2\) 的光滑性。细节见引理 3.8。使 (6) 对某个 \(\delta\) 成立的初值 \(\varphi\) 的集合，将在适当拓扑下被证明是通有的（generic），见命题 B.5。此外，若实验者可以选择初值，则存在仅依赖于已知量的 \(\varphi\) 使 (6) 成立，见命题 B.3。

其次，我们关注周期二维纳维–斯托克斯方程的解，即对后 2 个自变量周期的 \(u:[0,1]\times\Omega\to\mathbb{R}^2\) 满足

$$
\begin{cases}
\dfrac{du}{dt}+\nu Au+B(u,u)=f & \text{在 }[0,1]\times\Omega,\\[2mm]
\nabla\cdot u=0 & \text{在 }[0,1]\times\Omega,\\[2mm]
u(0,\cdot)=\varphi & \text{在 }\Omega,
\end{cases}\tag{8}
$$

其中 \(A=-P\Delta\)，\(B=P[(u\cdot\nabla)u]\)，\(\Omega=\mathbb{T}^2\)，\(\varphi:\Omega\to\mathbb{R}^2\) 是某初始向量场，\(f:\Omega\to\mathbb{R}^2\) 是某个不依赖时间的驱动力函数，\(\nu\ge\nu_{\min}\)（对某常数 \(\nu_{\min}>0\)），且对 \(i=1,2\)，

$$
((u\cdot\nabla)u)_i=\sum_{j=1}^2u_j\frac{\partial u_i}{\partial x_j},
$$

\(\Delta\) 是 Laplacian，\(P\) 是到 Hilbert 空间 \(H\subseteq L^2\)（由无散度、周期、均值为零的向量场组成，稍后定义）上的投影。这里我们假定 \(f\) 与 \(\nu_{\min}\) 已知，而 \(\nu\) 与 \(\varphi\) 未知。(8) 的解存在且唯一（见 Robinson (2001) §9），我们记为 \(u_{\nu,\varphi}\)。于是得到正向映射

$$
G(\nu,\varphi)=u_{\nu,\varphi}.\tag{9}
$$

证明后验一致性需要如下形式的稳定性估计：

$$
|\nu_1-\nu_2|+\|\varphi_1-\varphi_2\|_{L^2(\Omega)}\lesssim\|G(\nu_1,\varphi_1)-G(\nu_2,\varphi_2)\|^\eta_{L^2([0,1]\times\Omega)},\tag{10}
$$

其中 \(\eta\) 依赖于 \(\varphi_1\) 与 \(\varphi_2\) 的光滑性，见命题 3.13。

**相依结构。** 关于 (2) 的统计方面，大多数工作假定误差是 i.i.d. 的，而对其他可能更贴近实际应用的观测模型研究较少，见 Nickl 与 Seizilles (2026) 以及 Seizilles 与 Siebel (2026)。在分析 (4) 与 (8) 这类时间演化方程时，一个自然的设定是：若在不同时刻使用同一套传感设备，则给定传感器的观测误差可能在时间上相关。这就是我们对 \(\epsilon_i\) 施加的结构性假定。具体地，我们考虑一种“空间无关”（或称“时间相依”）的方案。设 \(G\) 与 \(V=\mathbb{R}^{d_V}\) 如 (1)，并设

$$
Y_{ij}=G(\theta)(t_i,X_{ij})+\epsilon_{ij},\qquad\text{对 }i=1,\ldots,T,\ j=1,\ldots,n,\tag{11}
$$

其中 \(t_i=(2i-1)/2T\) 是确定性的，\(X_{ij}\ \text{i.i.d.}\sim\mathrm{Unif}(\Omega)\)，\(\epsilon_{ij}\) 是与 \(X_{ij}\) 独立的联合高斯随机变量，观测总数为 \(N=Tn\)，且

$$
\epsilon_{ij}\perp\epsilon_{i'j'}\ \text{对一切 }j\ne j'\text{ 与 }i,i'=1,\ldots,T,
$$
$$
\mathbb{E}[\epsilon_{ij}\epsilon^T_{i'j}]=M^j_{ii'}\ \text{对一切 }i\ne i'\text{ 与 }j=1,\ldots,n,\quad\text{以及}
$$
$$
\mathbb{E}[(\epsilon^k_{ij})^2]=(\sigma^k_j)^2\ \text{对一切 }k=1,\ldots,d_V,
$$

其中 \(M^j_{ii'}\) 是 \(d_V\times d_V\) 矩阵，\(\epsilon_{ij}=(\epsilon^1_{ij},\ldots,\epsilon^{d_V}_{ij})\in\mathbb{R}^{d_V}\)，而 \(\sigma_j=(\sigma^k_j)\in\mathbb{R}^{d_V}\) 的各分量全为正。

直观上，我们假定不同传感器的误差相互独立，但同一传感器在不同时刻的观测可以相依。我们有时把 (11) 重新编号为

$$
Y_\ell=G(\theta)(t_\ell,X_\ell)+\epsilon_\ell\ \text{对 }\ell=1,\ldots,N,\qquad \epsilon=(\epsilon_1,\ldots,\epsilon_N)\sim N(0,\Gamma_N),\tag{12}
$$

其中 \(\Gamma_N\) 是某个 \(d_VN\times d_VN\) 的可逆协方差矩阵，\(t_i\equiv t^N_i\in[0,1]\) 是确定性的，\(X_i\ \text{i.i.d.}\sim\mathrm{Unif}(\Omega)\)。记 \(P^N_\theta\) 为数据 \(\mathcal{D}_N=(Y_i,X_i)_{i=1}^N\) 在 \((V\times\Omega)^N\) 上的分布，\(p^N_\theta\) 为该分布关于 Lebesgue 测度的密度。

**注 1.1。** 虽然表面上混合设计模型看起来有些人为，我们这样做是为了在保持合理相依结构的同时简化证明中的计算。事实上，由于我们希望刻画时间相关性，我们希望 \(\epsilon_\ell\) 与 \(\epsilon_k\) 的相关性依赖于 \(|t_\ell-t_k|\)；为避免出现随机协方差矩阵，我们于是在设计中固定 \(t_\ell\)。不过，为避免在证明中累积不必要的逼近误差，我们对空间变量假定随机设计。

只要 (11) 之外的方案所诱导的经验范数能适当地在 \(L^2([0,1]\times\Omega)\) 范数附近集中，也可以考虑这些方案，见注 2.15。

我们的主要统计贡献是：给出关于正向映射 \(G\) 与协方差矩阵 \(\Gamma_N\) 的一般性条件，使得后验在 (3) 的意义下是一致的。随后我们给出可以验证这些条件的具体例子，即 (5) 与 (9) 所描述的正向映射；不过这些结果的陈述要等到我们建立更多记号之后再给出。

**注 1.2。** 在证明后验一致性的过程中，我们得到的速率比 i.i.d. 情形差。然而，一旦能计算出以足够快速率收敛的估计量，就可以证明后验以与 i.i.d. 情形相同的速率收敛。特别地，我们所证明的后验收缩蕴含此类估计量（例如后验均值）的存在性。

为证明与 i.i.d. 情形相同的速率，可在估计量处对正向映射线性化，并在 \(\theta\in\Theta\) 上构造罚最小二乘估计量。由于我们对正向映射作了线性化，损失函数是凸的。随后可以按 i.i.d. 情形下的速率构造插件（plug-in）检验，从而也证明该速率下的后验收缩。

在证明这些结果的过程中，我们在 (8) 且正向映射如 (9) 的设定下证明了多项式时间初始化器的存在性。在该设定下，计入计算成本的浮点运算是指那些涉及矩阵–向量乘积与线性系统求解的运算。注意这与 MCMC 文献中使用的计算成本概念不同；细节见 Wang (2026) 的注 2.3。

**命题（原文未编号）。** 考虑 (8) 的设定，真值为 \((\nu_0,\varphi_0)\)，且 \(\varphi_0\in H^\alpha(\Omega)\)，其中 \(\alpha>d/2+1\)。此外假定 \(\nu,\|\varphi_0\|_{H^\alpha}\le R\)，对某个 \(R>0\)。则存在常数 \(c,C_1,C_2\)（依赖于 \(\Omega,R,\nu_{\min}\)）与指数 \(\kappa=\kappa(d,\alpha)<2\)，使得对一切 \(N\ge1\)，存在估计量 \(\hat\varphi_N\) 满足收敛速率

$$
\mathbb{P}^N_{\nu_0,\varphi_0}\Big(\|\varphi_0-\hat\varphi_N\|_\infty\le C_1N^{-\beta/2}\Big)\gtrsim1-\exp\Big(-cN^{\frac{d+2}{2(\alpha+1)+d+2}}\Big)
$$

其中 \(\beta=\dfrac{2(\alpha+1)-d-2}{2(\alpha+1)+d+2}\)，而 \(\hat\varphi_N\) 可在 \(C_2N^\kappa\) 次浮点运算内计算得到。

该估计量正是 \(\hat\varphi_N=\hat u_N(0,\cdot)\)，其中 \(\hat u_N\) 如 (23)；我们指出该命题在 i.i.d. 误差情形下同样成立。其证明可逐字（mutatis mutandis）照搬 Wang (2026) 的椭圆型设定到抛物型设定，见该文 (21) 与定理 2.4。我们记录这一结果，是因为选择比 Wang (2026) 的朴素推广更适合抛物型 PDE 设定的罚项时可以获得更好的速率。这验证了 Nickl 与 Wang (2024) 中证明贝叶斯后验计算的多项式时间保证所需的条件；并且我们指出，若没有这样的初始化器，通过 MCMC 方法计算后验可能需要指数级运行时间，见 Bandeira 等 (2023)。

### 1.1 记号

我们始终假定 \(\Omega\) 是 \(d\) 维环面，即 \(\mathbb{T}^d\)，其中 \(\mathbb{T}=\mathbb{R}/\mathbb{Z}\)。与 PDE 文献保持一致，这样做是为了记号简洁；通过适当修改边界条件，所有结果都可适配到 \(\Omega\subseteq\mathbb{R}^d\) 为有界区域的情形。我们假定 \(\Theta\) 是满足

$$
\Theta\subseteq L^2(\mathcal{Z},W),\tag{13}
$$

的线性空间，其中 \(\mathcal{Z}\) 是 \(\ell\) 维区域（我们采用约定：\(\ell\) 维区域是 \(\mathbb{R}^\ell\) 中具有光滑边界的有界开子集，或 \(\mathbb{T}^\ell\)），而 \(W\) 是有限维向量空间。

我们将经常把时间柱 \([0,1]\times\Omega=:Q\) 记作 \(Q\)。对 \(N\in\mathbb{N}\)，记 \([N]\) 为集合 \(\{1,\ldots,N\}\)。对某个 \(k\) 与向量 \(v\in\mathbb{R}^k\)，我们用 \(v_i\)（\(i=1,\ldots,k\)）表示其坐标，即 \(v=(v_1,\ldots,v_k)\)。

对任意赋范空间 \(X\)，记 \(\|\cdot\|_X\) 为 \(X\) 上的范数，\(X^*\) 为 \(X\) 的拓扑对偶。又对任意 \(r\ge0\)，\(B_X(r)\) 表示 \(X\) 中以原点为心、半径为 \(r\) 的闭球。对 \(\mathbb{R}^d\) 中任意区域 \(\mathcal{O}\)，记 \(L^p(\mathcal{O})\) 为 \(\mathcal{O}\) 上 \(p\) 次可积实值函数空间。在 \(L^p\) 范数的特殊情形，当区域由上下文明确时我们写 \(\|\cdot\|_p\)。我们还按通常含义定义空间 \(C^k(\mathcal{O})\) 与 \(H^k(\mathcal{O})\)，即分别由 \(k\) 次可微（相应地，弱可微）函数组成、其导数定义一致连续函数（相应地，\(L^2(\mathcal{O})\) 函数）的函数空间。\(H^k(\mathcal{O})\) 的定义可延拓到实数 \(k\)，见 Gilbarg 与 Trudinger (2001)。\(C^\infty_c(\mathcal{O})\) 表示在 \(\mathcal{O}\) 内紧支撑的无穷次可微函数空间，\(H^k_c(\mathcal{O})\) 是 \(C^\infty_c(\mathcal{O})\) 关于 \(H^k(\mathcal{O})\) 范数的闭包。

对某个有限维向量空间 \(W\)，我们记 \(C^k(\mathcal{O},W)\) 与 \(H^k(\mathcal{O},W)\) 为从 \(\mathcal{O}\) 映到 \(W\)、且其每个坐标（关于任一基）分别属于 \(C^k(\mathcal{O})\) 或 \(H^k(\mathcal{O})\) 的函数空间。当 \(W=\mathbb{R}^m\) 时，我们也常把该空间写作 \(C^k(\mathcal{O})^m\) 或 \(H^k(\mathcal{O})^m\)。对任意 Banach 空间 \(X\subseteq L^1\)，定义 \(\dot X=\{f\in X:\int f=0\}\)。

我们还需要定义若干涉及时间的函数空间。对可分 Banach 空间 \(X\) 与 \(p\in[1,\infty]\)，定义 \(L^p([0,S],X)\) 为可测函数 \(f:[0,S]\to X\) 的空间，使得

$$
\|f\|^p_{L^p([0,S],X)}=\int_0^S\|f(t)\|^p_X\,dt<\infty,
$$

细节见 Evans (1998) §5.9.2。此外，对 \(m\ge0\)，定义时间方向 Sobolev 空间

$$
H^m([0,S],X)=\Big\{f\in L^2([0,S],X):\partial^i_tf\in L^2([0,S],X),\ \text{对 }0\le i\le m\Big\},
$$

配以范数 \(\|f\|^2_{H^m([0,S],X)}=\sum_{j=0}^m\|\partial^j_tf\|^2_{L^2([0,S],X)}\)。在 \(X=H^k(\mathcal{O})\) 的特殊情形，我们常缩写为

$$
H^m([0,1],H^k(\mathcal{O}))=H^m_tH^k_x.
$$

类似地，对空间 \(L^p([0,1],L^q(\mathcal{O}))\) 我们写 \(L^p_tL^q_x\)。最后，我们定义处理抛物型方程解所产生光滑性的空间，参见 Lions 与 Magenes (1972) §2.1。对 \(s\in[0,\infty)\)，定义**抛物型**（或称**各向异性**）Sobolev 空间 \(H^{s,s/2}(Q)\) 为满足如下范数有限的 \(f\in L^2(Q)\)：

$$
\|f\|^2_{H^{s,s/2}(Q)}=\int_0^1\|f(t,\cdot)\|^2_{H^s(\Omega)}\,dt+\int_\Omega\|f(\cdot,x)\|^2_{H^{s/2}([0,1])}\,dx.
$$

我们在记号中不再写出 \(Q\)，因为这是这些空间唯一被使用的区域。

对某指标集 \(A\) 与 \(p\in[1,\infty]\)，定义 \(\ell^p(A)\) 为以 \(A\) 为指标、满足

$$
\|(a_i)_{i\in A}\|^p_{\ell^p(A)}=\sum_{i\in A}|a_i|^p<\infty
$$

的序列集合。当 \(A\) 有限且 \(n=|A|\) 时，我们常把该空间写作 \(\ell^p(\mathbb{R}^n)\)，并在不致混淆时省略 \(A\)。接下来，对 \(n\times n\) 矩阵空间（记为 \(\mathcal{L}(\mathbb{R}^n,\mathbb{R}^n)\)），定义范数 \(\|\cdot\|_{p\to p}\) 为 \(\mathbb{R}^n\) 上配以 \(\ell^p\) 度量的算子范数。当 \(p=2\) 时，这就是通常的矩阵算子范数，我们简记为 \(\|\cdot\|_{2\to2}=\|\cdot\|\)。全文中我们用 \(C\) 与 \(c\) 表示不依赖于问题变量的通用常数；除非另有说明，它们可以逐行改变。

在处理二维纳维–斯托克斯方程时，我们沿用 Konen 与 Nickl (2025) §3 的记号。特别地，定义均值为零、无散度向量场的 Sobolev 空间

$$
\dot H^\alpha_\diamond(\Omega)=\Big\{u\in H^\alpha(\Omega)^2:\nabla\cdot u=0,\ \int_\Omega u=0\Big\},\qquad H=\dot H^0_\diamond.
$$

最后，设 \(p,q\) 是两个概率密度，且当 \(q=0\) 时 \(p=0\)。回忆 \(p,q\) 的 Kullback–Leibler 散度与变差分别为

$$
\mathrm{KL}(p,q)=\mathbb{E}_p\Big[\log\frac{p}{q}\Big],\qquad V_{2,0}(p,q)=\mathbb{E}_p\Big[\Big(\log\frac{p}{q}-\mathrm{KL}(p,q)\Big)^2\Big].\tag{14}
$$

为刻画相依结构，我们需要向量自回归（VAR）过程的概念。对 \(T,k\in\mathbb{N}\)，设 \(\epsilon_1,\ldots,\epsilon_T\) 是取值于 \(\mathbb{R}^k\) 的随机变量。若

$$
\epsilon_t=A_1\epsilon_{t-1}+A_2\epsilon_{t-2}+\cdots+A_p\epsilon_{t-p}+\eta_t\qquad\text{对 }t\ge p,\tag{15}
$$

其中 \(A_1,\ldots,A_p\) 是 \(k\times k\) 矩阵，且 \(\eta_t\ \text{i.i.d.}\sim N(0,\Sigma)\)（对某个 \(k\times k\) 协方差矩阵 \(\Sigma\)），则称 \((\epsilon_i)_{i=1}^T\) 是以 \(A_1,\ldots,A_p,\Sigma\) 为参数的 \(VAR(p)\) 过程。

### 1.2 主要结果

首先，我们列出 (11) 中协方差矩阵上足以导出后验收缩的假定。我们的做法是把 Kullback–Leibler 散度与变差控制住，以满足定理 A.1 的小球条件 (30)。首先要求“最坏方差方向”有界：

**条件 1.3。** 设 \(\Gamma_N\) 为 (12) 中的协方差。假定存在不依赖于 \(N\) 的常数 \(C_1\) 使得

$$
\|\Gamma_N\|\le C_1,
$$

其中 \(\|\cdot\|\) 表示矩阵算子范数。

其次，我们需要关于精度矩阵 \(\Gamma_N^{-1}\) 的更强假定：

**条件 1.4。** 对 (12) 中的设定，且正向映射取值于 (1) 中的 \(V=\mathbb{R}^{d_V}\)，假定

$$
\max_{i=1,\ldots,Nd_V}\sum_{j=1}^{Nd_V}|(\Gamma_N^{-1})_{ij}|\le C_2,
$$

其中常数不依赖于 \(N\)。

注意，由 \(\max_i\sum_j|A_{ij}|\) 给出的方阵范数正是 \(\|A\|_{\infty\to\infty}\)，见 Horn 与 Johnson (1985) §5.6.5。

若所关注的动力系统在所有解之间具有相同的平均值，则我们可以对 \(\Gamma_N\) 要求一个更弱的假定。例如在纳维–斯托克斯方程中，条件 1.5.a 成立，因为对一切 \(t\) 与初值 \(\varphi\) 都有 \(\int u(t,x)\,dx=0\)。从概念上说，这是因为若 \(\epsilon_i\) 高度相关，观测本质上就是解的一个常数平移；而若解的平均值已知，这一平移可以被校正。这种相依数据的现象此前已被观察到，见 Yang (2001)。

**条件 1.5。** 对 (12) 中的设定，且正向映射 \(G\) 与向量空间 \(V=\mathbb{R}^{d_V}\) 如 (1)，假定：

(a) 存在不依赖于任何 \(\theta\in\Theta\) 的已知函数 \(A:[0,1]\to V\)，使得

$$
\int_\Omega G(\theta)(t,x)\,dx=A(t).
$$

(b) 对不依赖于 \(N\) 的常数 \(C_2\)，\(\mathrm{tr}(\Gamma_N^{-2})\le C_2N\)。

由注 2.1，条件 1.5.b 确实是比条件 1.4 更弱的假定。此外，条件 1.4 可在许多协方差结构假定下成立，例如向量值自回归过程，即 \(VAR(p)\) 过程。

**命题 1.6。** 设 \((\epsilon_{ij})\) 如 (11)，并假定对每个 \(j\)，\((\epsilon_{ij})_{i=1}^T\) 是以 \(A_1,\ldots,A_{p_j}\) 与 \(\Sigma_j\) 为参数、如 (15) 的平稳高斯 \(VAR(p_j)\) 过程（\(p_j\in\mathbb{N}\)）。若进一步假定 \(p_j\) 与 \(A_1,\ldots,A_{p_j}\) 逐元素地（entry-wise）关于 \(j\) 一致有上界，且 \(\Sigma_j\) 的最小特征值关于 \(j\) 一致地远离 \(0\)，则条件 1.4 成立。

该命题的证明见 §2.1，那里还给出另一种验证条件 1.4 的途径，涵盖某些具有长程相依性的时间序列。有了这些条件，我们就能控制 KL 散度与变差：

**命题 1.7。** 设 \(\theta,\vartheta\in\Theta\)，正向映射 \(G\) 如 (1)，且 \(U>0\) 使得 \(\|G(\theta)\|_\infty,\|G(\vartheta)\|_\infty\le U\)。设 \(p^N_\theta\) 与 \(p^N_\vartheta\) 为 (12) 之后引入的密度。进一步假定条件 1.4 或 1.5 对某常数 \(C_2\) 成立。则对某常数 \(C=C(C_2,U)\)，由 (14) 定义的 KL 散度与变差满足

$$
\mathrm{KL}(p^N_\theta,p^N_\vartheta)\le CN\|G(\theta)-G(\vartheta)\|^2_{L^\infty_tL^2_x},
$$

以及

$$
V_{2,0}(p^N_\theta,p^N_\vartheta)\le CN\|G(\theta)-G(\vartheta)\|^2_{L^\infty_tL^2_x}.
$$

接下来，我们讨论使后验一致性成立的那类先验。我们使用生活在线性空间中的高斯过程先验。若参数空间 \(\Theta\) 本身不是线性的（例如 (4) 中的扩散系数或 (8) 中的黏度），则需要使用**连接函数**（link function），见定理 3.10 之前的讨论与其证明。沿用 Nickl (2023)，我们引入关于先验的 RKHS 的一个条件：

**条件 1.8。** 设 \(\Pi'\) 是线性空间 \(\Theta\)（具有 (13) 中的 \(\ell\) 维区域 \(\mathcal{Z}\)）上以 \(\mathcal{H}\) 为 RKHS 的中心化高斯 Borel 概率测度。进一步假定对某个可分赋范线性子空间 \((\mathcal{R},\|\cdot\|_\mathcal{R})\) 有 \(\Pi'(\mathcal{R})=1\)。又假定 \(\mathcal{H}\) 满足连续嵌入

$$
\mathcal{H}\subseteq H^\alpha_c(\mathcal{Z})\ \text{若 }\kappa\ge1/2,\qquad\text{或}\qquad \mathcal{H}\subseteq H^\alpha(\mathcal{Z})\ \text{若 }\kappa<1/2,
$$

其中 \(\alpha>0\) 是某个正则性参数。

我们把先验 \(\Pi=\Pi_N\) 定义为重标度

$$
\theta=N^{-\ell/(4(\alpha+\kappa)+2\ell)}\theta',\qquad\theta'\sim\Pi'\tag{16}
$$

之后 \(\theta\) 的分布 \(\mathcal{L}(\theta)\)。我们还指出，给定数据 \(\mathcal{D}_N\) 之后，**后验**由下式给出：

$$
d\Pi(\theta|\mathcal{D}_N)\propto p^N_\theta(\mathcal{D}_N)\,d\Pi(\theta),\tag{17}
$$

其中 \(p^N_\theta\) 在 (12) 之后定义。

后验收缩速率是通过速率指数级的频率派检验的存在性来证明的。常用的有 Ghosal 与 van der Vaart (2017)、Nickl (2023) 中的 Hellinger 检验理论；然而在相依误差情形下该理论失效。因此，我们借助 \(G(\theta)\) 的光滑性，利用小波估计量的集中不等式来构造检验，这一想法取自 Giné 与 Nickl (2011)。

**条件 1.9（正向正则性）。** 设 \(G,V\) 如 (1)，\(\mathcal{Z},W\) 如 (13)。假定 \(G\) 可测，并设 \(\kappa\ge0\)。假定对 \(L^2(\mathcal{Z},W)\) 的某个赋范线性子空间 \((\mathcal{R},\|\cdot\|_\mathcal{R})\) 与一切 \(M>0\)，存在有限常数 \(U\ge1\) 与 \(L>0\)（可以依赖于 \(M\)），使得

$$
\sup_{\theta\in\Theta\cap B_\mathcal{R}(M)}\ \sup_{(t,x)\in Q}|G(\theta)(t,x)|_V\le U
$$

且

$$
\|G(\theta_1)-G(\theta_2)\|_{L^\infty_tL^2_x}\le L\|\theta_1-\theta_2\|_{(H^\kappa(\mathcal{Z},W))^*}\quad\text{对一切 }\theta_1,\theta_2\in\Theta\cap B_\mathcal{R}(M).
$$

我们称 \(\mathcal{R}\) 为**正则化空间**。

**条件 1.10（正向映射）。** 设 \(\mathcal{R},\mathcal{H}\) 如条件 1.9 与 1.8 中所定义。假定存在 \(a\ge0\) 使得

$$
G(\mathcal{H})\subseteq H^{a,a/2}.
$$

进一步假定对任意 \(M\)，存在依赖于 \(M\) 的 \(U\) 使得

$$
G(B_\mathcal{R}(M))\subseteq B_{H^{6,3}}(U),\qquad\text{以及}\qquad G(B_\mathcal{H}(M))\subseteq B_{H^{a,a/2}}(U).
$$

**注 1.11。** 这些抛物型 Sobolev 空间的定义见 §1.1。选择各向异性空间反映的是对抛物型 PDE 的解所能证明的最佳正则性。当处理其他方程（例如双曲型 PDE）时，则要把该条件改为涉及各向同性空间的条件。该条件中 \(a\) 取得越大，最终得到的收缩速率越快。

**定理 1.12（检验的存在性）。** 设 \(G\) 如 (1)，并假定条件 1.8 对某正则化空间 \(\mathcal{R}\)、RKHS \(\mathcal{H}\)、\(\ell\) 维区域 \(\mathcal{Z}\) 与正则性参数 \(\alpha\) 成立。假定条件 1.9 与 1.10 对这些选择成立，且对某个正则性参数 \(a\ge(d+1)\vee6\) 成立。则令

$$
\delta_N=N^{-\frac{a}{2a+d+2}}\qquad\text{与}\qquad \varepsilon_N=N^{-\frac{\alpha+\kappa}{2\alpha+2\kappa+\ell}},\tag{18}
$$

并假定 \(\varepsilon_N\lesssim\delta_N\)。此外，取 (11) 与 (12) 设定中的 \(n,T\) 与 \(N=nT\)，令

$$
N^{\frac{2d+3}{2a+d+2}}\lesssim n\lesssim N\delta_N\qquad\text{与}\qquad \delta_N^{-1}\lesssim T\lesssim N^{\frac{2a-d-1}{2a+d+2}},\tag{19}
$$

并对某个 \(M>0\) 令 \(\Theta_N\) 为正则化集合

$$
\Theta_N=\{\theta\in\mathcal{R}:\theta=\theta_1+\theta_2,\ \|\theta_1\|_{(H^\kappa(\mathcal{Z}))^*}\le M\varepsilon_N,\ \|\theta_2\|_\mathcal{H}\le M,\ \|\theta\|_\mathcal{R}\le M\},
$$

并假定 \(\theta_0\in\Theta_N\)。若条件 1.3 成立，则存在检验（指示函数）\(\phi_N\)，使得对任意 \(K\in\mathbb{N}\) 与 \(M>0\)，存在足够大的 \(C=C(M,K)\) 使

$$
\mathbb{E}^N_{\theta_0}[\phi_N]\to0,\qquad\text{且}\qquad \sup_{\substack{\theta\in\Theta_N\\ C\delta_N<\|G(\theta)-G(\theta_0)\|_{L^2}}}\mathbb{E}^N_\theta[1-\phi_N]\le e^{-KN\varepsilon^2_N}
$$

只要 \(N\) 足够大。

注意我们是在度量 \(\|G(\theta)-G(\vartheta)\|_{L^2}\) 下构造检验的，而 (11) 的混合设计自然地给出的是

$$
\frac1T\sum_{i=1}^T\|G(\theta)(t_i,\cdot)-G(\vartheta)(t_i,\cdot)\|^2_{L^2(\Omega)}
$$

（伪）度量下的检验。我们通过证明设计的逼近误差很小来绕开这一困难，见命题 2.14。为直接在 \(\Theta\) 上得到收缩，我们沿用 Nickl (2023) 施加一个条件，其实质是要求 \(G\) 的“逆”在有界集上满足 Hölder 连续条件。

**条件 1.13（反向稳定性）。** 设 \(G\) 如 (1)，\(\mathcal{R}\) 如条件 1.8 与 1.9，真值 \(\theta_0\in\mathcal{R}\cap\Theta\)。对某个 \(\eta>0\) 与一切 \(M>0\)，假定存在常数 \(L'=L'(G,M)\)，使得对一切足够小的 \(\delta>0\)，

$$
\sup\big\{\|\theta-\theta_0\|_{L^2}:\theta\in\Theta\cap B_\mathcal{R}(M),\ \|G(\theta)-G(\theta_0)\|_{L^2(Q)}\le\delta\big\}\le L'\delta^\eta.
$$

这引向我们的主要贡献，即带相依误差的回归型非线性逆问题中的后验收缩。

**定理 1.14。** 设 \(G\) 如 (1)，并假定条件 1.8 对某先验 \(\Pi'\)、正则化空间 \(\mathcal{R}\)、RKHS \(\mathcal{H}\)、\(\ell\) 维区域 \(\mathcal{Z}\) 与正则性参数 \(\alpha\) 成立。假定条件 1.9 与 1.10 对这些选择以及某个正则性参数 \(a\ge(d+1)\vee6\) 成立，且真值 \(\theta_0\in\mathcal{R}\cap\mathcal{H}\)。在 (11) 与 (12) 的设定下，给定观测 \(\mathcal{D}_N\)，令 \(\delta_N,\varepsilon_N,n,T\) 分别如 (18) 与 (19)，且 \(\varepsilon_N\lesssim\delta_N\)。

设 \(\Pi_N\) 为 (16) 中的重标度先验。此外假定条件 1.3 成立，且条件 1.4 或 1.5 之一成立。若 \(\Pi_N(\cdot|\mathcal{D}_N)\) 是后验分布，则对一切 \(b>0\)，我们可以取 \(m\) 足够大，使得当 \(N\to\infty\) 时

$$
P^N_{\theta_0}\Big(\Pi_N(\theta\in\Theta,\ \|G(\theta)-G(\theta_0)\|_{L^2(Q)}\le m\delta_N\,|\,\mathcal{D}_N)\le1-e^{-bN\varepsilon^2_N}\Big)\to0.
$$

此外，假定对当前 \(\mathcal{R}\) 的选择与某个 \(\eta,L'>0\)，条件 1.13 成立，则可推得

$$
P^N_{\theta_0}\Big(\Pi_N(\theta\in\Theta,\ \|\theta-\theta_0\|_{L^2}\le L'(m\delta_N)^\eta\,|\,\mathcal{D}_N)\le1-e^{-bN\varepsilon^2_N}\Big)\to0.
$$

其证明是定理 A.1、定理 A.3 与定理 1.12 的组合。最后，我们说明该定理可以应用于感兴趣的具体 PDE 例子，例如由 (4) 与 (8) 产生的那些；细节见定理 3.10 与 3.15。

### 1.3 贡献总结

我们在 Hellinger 检验不能直接适用的相依数据设定下，证明了非线性逆问题的后验收缩速率，见定理 1.14、3.10 与 3.15。为此，我们通过基于小波的估计量构造“插件”检验，见定理 1.12 与 §2；这又需要能刻画抛物型 PDE 解中所观测到光滑性的小波，见 §2.2.1 与 §D。

在 §2.2.2 中构造的同一基于小波的估计量，为二维纳维–斯托克斯等抛物型 PDE 初值问题中的 MCMC 技术提供了一个初始化器（或“热启动”），见 Nickl 与 Titi (2024)。特别地，此类初始化器保证后验可以在多项式时间内计算；而在“冷启动”情形下这可能要花费指数时间，见 Bandeira 等 (2023)。

我们还贡献了时间演化设定下 Darcy 算子的稳定性估计，并证明时间演化结构可被用来得到比椭圆型 Darcy 问题更强的结果，见 §3.1 与 §B。我们还证明了二维纳维–斯托克斯方程情形下关于黏度与初值的联合稳定性，见 §3.2。

## 2 收缩速率结果

本节的证明见 §C.2。

### 2.1 验证条件 1.4 与 1.5

我们将证明：在 (11) 的设定下，条件 1.4 对很广一类协方差成立。

**注 2.1。** 注意条件 1.5.b 比条件 1.4 更弱。事实上，若条件 1.4 成立，则

$$
\mathrm{tr}(\Gamma_N^{-2})=\sum_{i,j=1}^{Nd_V}[(\Gamma_N^{-1})_{ij}]^2\le Nd_V\max_i\sum_j[(\Gamma_N^{-1})_{ij}]^2\le Nd_V\max_i\Big(\sum_j|(\Gamma_N^{-1})_{ij}|\Big)^2\le Nd_VC_2^2,
$$

故条件 1.5.b 成立。

**注 2.2。** 在 (11) 的设定下，设 \(M_{ij}\) 与 \(\sigma^k_j\) 如该式之后的展示中所定义。定义 \(M^j\equiv M(N)^j\) 为元素为下式的 \(d_VT\times d_VT\) 分块矩阵：

$$
M^j=
\begin{pmatrix}
M^j_{11}-D_j & M^j_{12} & \cdots & M^j_{1T}\\
M^j_{21} & M^j_{22}-D_j & \cdots & 0\\
\vdots & \vdots & \ddots & \vdots\\
M^j_{T1} & 0 & \cdots & M^j_{TT}-D_j
\end{pmatrix},
$$

其中 \(D_j=\mathrm{diag}((\sigma^1_j)^2,\ldots,(\sigma^{d_V}_j)^2)\)。然后令

$$
\Gamma^{(j)}=I_T\otimes D_j+M^j\qquad\text{对 }j=1,\ldots,n,
$$

其中 \(\otimes\) 是矩阵的 Kronecker 积。最后回忆 (12) 中的 \(d_VN\times d_VN\) 矩阵以分块对角形式给出：

$$
\Gamma_N=\mathrm{diag}\big(\Gamma^{(1)},\Gamma^{(2)},\ldots,\Gamma^{(n)}\big).
$$

由于 \(\Gamma_N\) 的分块结构，我们有

$$
\Gamma_N^{-1}=\mathrm{diag}\Big((\Gamma^{(1)})^{-1},(\Gamma^{(2)})^{-1},\ldots,(\Gamma^{(n)})^{-1}\Big).
$$

因此，要证明条件 1.4 成立，只需证明它对所有矩阵 \(\Gamma^{(j)}\) 成立。

下述结果在命题 1.6 之外给出另一个使条件 1.4 成立的充分条件，其中涵盖某些时间序列。

**命题 2.3。** 设 \(M^j\) 与 \(\sigma^k_j\) 如注 2.2。假定存在正常数 \(c_1\) 使得对一切 \(j,k\) 有 \(c_1<(\sigma^k_j)^2\)。又假定对某个 \(c<c_1\)，当 \(T\) 足够大时 \(M^j\) 满足 \(\max_j\|M^j\|_{\infty\to\infty}\le c\)。则条件 1.4 成立。

特别地，若当 \(T\) 足够大时 \(\max_j\|M^j\|_\infty\le c(d_VT)^{-1}\) 或 \(\max_j\|M^j\|\le c(d_VT)^{-1/2}\)，则条件 1.4 成立。

### 2.2 检验的构造

#### 2.2.1 各向异性小波

我们将针对区域 \(Q=[0,1]\times\Omega\) 构造小波，并证明它们能够刻画 §1.1 中的抛物型 Sobolev 空间。据我们所知，这一刻画此前对 \(Q\) 尚未被证明。它在 \(\mathbb{R}^{d+1}\) 上已有结果，细节见 Triebel (2006) §5.2；类似的小波也曾在时间柱的情形中被考虑过，见 Schwab 与 Stevenson (2009)。

设 \(\phi^{bc}_{lk}\)（相应地，\(\psi^{bc}_{lk}\)）是边界修正的、\(S\)-光滑 Daubechies 尺度函数（相应地，小波），其基础分辨率 \(L_0=L_0(S)\) 取自 Cohen 等 (1993)。注意在每个层级 \(l\ge L_0\) 处，有 \(2^l\) 个尺度函数与 \(2^l\) 个小波。其次，设 \(\Phi_{lk}\)（相应地，\(\Psi_{lk}\)）是周期化的 \(d\) 维 Meyer 尺度函数（相应地，小波）。注意在层级 \(l\) 处，有 \(2^{dl}\) 个尺度函数与 \(2^{(d+1)l}-2^{dl}\) 个小波。我们在附录 D 的 §D.1 中回顾了一些事实，一般性参考见 Giné 与 Nickl (2016) §4.3。

现在，我们在 \((t,x)\in[0,1]\times\Omega\) 上定义

$$
\Phi^{an}_{lk}(t,x)=\phi^{bc}_{l_tk_t}(t)\Phi_{l_xk_x}(x),
$$

其中 \(l=(l_t,l_x)\in\mathbb{N}^2\) 满足 \(l_t,l_x\ge L_0\)，而 \(k=(k_t,k_x)\in[2^{l_t}]\times[2^{dl_x}]\)。为引入各向异性，我们定义空间

$$
V^{an}_l=\mathrm{span}\big(\Phi^{an}_{jk}:j_t=2(l+1),\ j_x=l+1,\ k\in[2^{j_t}]\times[2^{dj_x}]\big),
$$
$$
W^{an}_l=V^{an}_l\cap(V^{an}_{l-1})^\perp.
$$

接下来，我们构造张量基

$$
\Psi^{an}_{lk}(t,x)=\psi^{bc}_{l_tk_t}(t)\Psi_{l_xk_x}(x),
$$

其中 \(l=(l_t,l_x)\in\mathbb{N}^2\) 满足 \(l_t,l_x\ge L_0-1\)；当 \(l_t=L_0-1\) 时我们置 \(\psi^{bc}_{l_tk_t}=\phi^{bc}_{L_0k_t}\)，当 \(l_x=L_0-1\) 时置 \(\Psi_{l_xk_x}=\Phi_{L_0k_x}\)；此外

$$
k=(k_t,k_x)\in\mathcal{K}(l)\equiv[2^{l_t}]\times[2^{d(l_x+1)}-2^{dl_x}].
$$

我们还定义：若 \(l_t=L_0-1\) 且 \(l_x\ge L_0\)，则

$$
\mathcal{K}(l)=[2^{L_0}]\times[2^{d(l_x+1)}-2^{dl_x}],
$$

而若 \(l_t\ge L_0\) 且 \(l_x=L_0-1\)，则

$$
\mathcal{K}(l)=[2^{l_t}]\times[2^{dL_0}].
$$

我们把这种小波的“层级”定义为

$$
\lfloor(l_t/2)\vee l_x\rfloor\equiv\mathbb{L}(l).\tag{20}
$$

**注 2.4。** 我们指出

$$
\{\Psi^{an}_{lk}:l_x,l_t\ge L_0-1,\ \text{且 }k\in\mathcal{K}(l)\}
$$

构成 \(L^2([0,1]\times\Omega)\) 的一组正交规范基。正交规范性是显然的；并且我们知道该基在形如 \(\sum f_i(t)g_i(x)\)（其中 \(f_i\in C([0,1])\)、\(g_i\in C(\Omega)\)）的函数集合中关于上确界范数稠密，而由 Stone–Weierstrass 定理这些函数又在 \(C([0,1]\times\Omega)\) 中稠密，后者又在 \(L^2([0,1]\times\Omega)\) 中稠密。此外，我们还有

$$
V^{an}_l=\mathrm{span}\big(\Psi^{an}_{jk}:\mathbb{L}(j)\le l,\ k\in\mathcal{K}(j)\big),
$$
$$
W^{an}_l=\mathrm{span}\big(\Psi^{an}_{jk}:\mathbb{L}(j)=l,\ k\in\mathcal{K}(j)\big).
$$

**定义 2.5。** 对 \(s>0\)，固定光滑度 \(S\) 使得 \(\phi^{bc}_{lk},\psi^{bc}_{lk}\in C^r\)，其中自然数 \(r>s\)。我们定义各向异性 Sobolev 空间为

$$
H^{s,an}=\{f\in L^2(Q):\|f\|_{H^{s,an}}<\infty\},
$$

其中

$$
\|f\|_{H^{s,an}}=\Bigg(\sum_{\substack{l\in\mathbb{N}^2\\ l_t,l_x\ge L_0-1}}\ \sum_{k\in\mathcal{K}(l)}2^{2s\lfloor\max(l_t/2,l_x)\rfloor}|\langle f,\Psi^{an}_{lk}\rangle|^2\Bigg)^{1/2}.
$$

**注 2.6。** 这些 Sobolev 空间的定义可以延拓到 Besov 空间 \(B^{s,an}_{pq}\)，见附录 §D 中的定义 D.1；附录 D 的证明中会需要其中若干空间。我们还简要指出，\(H^{s,an}\) 的定义只依赖于空间 \(V^{an}_{L_0-1}\) 与 \(W^{an}_j\)（\(j\ge L_0\)）。事实上，设 \(f\in L^2(Q)\)。若令 \(f_{L_0-1}\) 为 \(f\) 在 \(V^{an}_{L_0-1}\) 上的正交投影，\(f_j\) 为 \(f\) 在 \(W^{an}_j\) 上的正交投影，则如下范数与 \(\|\cdot\|_{H^{s,an}}\) 等价：

$$
\|f\|^2=\sum_{j\ge L_0-1}2^{2sj}\|f_j\|^2_{L^2(Q)}.\tag{21}
$$

这些小波范数刻画了注 1.11 中提到的各向异性 Sobolev 空间 \(H^{s,s/2}\)。

**命题 2.7。** 设 \(m\in\mathbb{N}\)，则

$$
\bigcap_{k=0}^mH^k([0,1],H^{2m-2k}(\Omega))=H^{2m,an},
$$
$$
\bigcap_{k=0}^{m+1}H^k([0,1],H^{2m+1-2k}(\Omega))\subseteq H^{2m+1,an},
$$

其中 \(\subseteq\) 表示连续嵌入，等式则表示范数等价。作为推论，对一切 \(s\ge0\) 有 \(H^{s,an}=H^{s,s/2}\)。

**注 2.8。** 该命题的证明见附录 D。此后（除附录 D 之外），我们将用通常记号 \(H^{s,s/2}\) 来表示 \(H^{s,an}\)。

我们还想要证明 \(H^{s,s/2}\) 的一个 \(L^\infty\) 嵌入结果，这由下一个命题给出。

**命题 2.9。** 对 \(s>(d+2)/2\)，有

$$
H^{s,s/2}\hookrightarrow C(Q).
$$

此外，Besov 空间之间通常的嵌入关系成立，见命题 D.3。我们将用下面这个推论来控制命题 2.13 中把 \(V^{an}_j\) 作为逼近空间时的偏差项；其证明可由 \(L^2\) 范数的小波刻画得到。

**推论 2.10。** 设 \(\alpha\ge0\)，\(u\in H^{\alpha,\alpha/2}\)，并设 \(u_L\) 为 \(u\) 在 \(V^{an}_L\) 上的投影。则存在常数 \(c=c(\alpha)\) 使得

$$
\|u-u_L\|_{L^2}\le c\|u\|_{H^{\alpha,\alpha/2}}2^{-\alpha(L+1)}.
$$

为命题 2.13，我们还需要知道 \(H^{s,s/2}\) 中球的度量复杂度，这里一并记录。它是 Triebel (2006) §5.3 中“转移方法”（transference method）的推论。

**推论 2.11。** 设 \(B(R)=B_{H^{s,s/2}}(R)\) 为 \(H^{s,s/2}\) 中半径为 \(R\) 的球，且 \(s>(d+2)/2\)。则

$$
\log N(B(R),\|\cdot\|_{L^\infty},\epsilon)\lesssim\Big(\frac{R}{\epsilon}\Big)^{\frac{d+2}{s}}.
$$

#### 2.2.2 估计量的构造

现在我们用各向异性小波为回归问题构造一个估计量。

**注 2.12。** 本节中我们假定 (12) 的设定里 \(V\) 是 1 维的。在纳维–斯托克斯方程等例子中，\(V\) 确实不是 1 维的；但在向量值情形，我们可以逐坐标地估计 \(u_\theta\)，并得到与实值情形相同的结论。

本节中我们假定正向映射 \(G\) 满足条件 1.9 与 1.10，正则性水平 \(a>(d+2)/2\)，且 \(\theta\in\mathcal{R}\)。为简洁起见我们记 \(G(\theta)=u_\theta\)。回忆 (20) 中的 \(\mathbb{L}\) 给出小波的“层级”。考虑极小化罚最小二乘损失

$$
L_N(\beta)=\frac1N\sum_{i=1}^T\sum_{j=1}^n\Big(Y_{ij}-\sum_{\mathbb{L}(l)\le L}\sum_{k\in\mathcal{K}(l)}\beta_{lk}\Psi^{an}_{lk}(t_i,X_{ij})\Big)^2+\delta_N^2\|\beta\|^2_{h^a},
$$

其中 \(\beta=(\beta_{lk})_{\mathbb{L}(l)=L_0-1,\ k\in\mathcal{K}(l)}\) 是实值元组（当 \(\mathbb{L}(l)>L\) 时约定取零），而椭球型 Sobolev \(h^\alpha\) 范数为

$$
\|\beta\|^2_{h^\alpha}=\sum_{L_0-1\le\mathbb{L}(l)}\ \sum_{k\in\mathcal{K}(l)}2^{2\mathbb{L}(l)\alpha}(\beta_{lk})^2,
$$

其中增长率取为：\(\delta_N\asymp N^{-a/(2a+d+2)}\) 与

$$
2^{-L}\asymp N^{-\frac{1}{2a+d+2}},\qquad\text{即}\qquad 2^{L(d+2)}\asymp N\delta_N^2.\tag{22}
$$

由于罚项的存在，损失函数是强凸的，因此可以定义 \(\hat\beta\) 为 \(L_N(\beta)\) 的唯一极小元。然后定义 \(\hat u=\hat u_L\) 为

$$
\hat u_L(t,x)=\sum_{L_0-1\le\mathbb{L}(l)\le L,\ k}\hat\beta_{lk}\Psi^{an}_{lk}(t,x),\qquad\text{对 }t\in[0,1],\ x\in\Omega.\tag{23}
$$

真实回归函数 \(u_\theta\) 在逼近空间 \(V^{an}_L\) 上的投影定义为 \(u_{\theta,L}\)，即

$$
u_{\theta,L}=\sum_{L_0-1\le\mathbb{L}(l)\le L,\ k}\beta_{lk}\Psi^{an}_{lk},\qquad\text{其中 }\beta_{lk}=\langle u,\Psi^{an}_{lk}\rangle.\tag{24}
$$

接下来，对分别以系数 \(\beta^1\) 与 \(\beta^2\) 表示的 \(v,v'\in V^{an}_L\)，我们定义“经验”范数

$$
\|v-v'\|^2_{(N)}=\frac1N\sum_{i=1}^T\sum_{j=1}^n\Big(\sum_{L_0-1\le\mathbb{L}(l)\le L,\ k}(\beta^1_{lk}-\beta^2_{lk})\Psi^{an}_{lk}(t_i,X_{ij})\Big)^2.
$$

还要注意，由推论 2.10，若 \(\theta\in\mathcal{H}\)，则 \(u_\theta\in H^{a,a/2}\) 且

$$
\|u_\theta-u_{\theta,L}\|^2\lesssim2^{-aL}\asymp\delta_N.\tag{25}
$$

现在我们从 \(M\)-估计推出一个结果：

**命题 2.13。** 在 (11) 的设定下，假定条件 1.9 与 1.10 成立且 \(a>(d+2)/2\)，并假定条件 1.3 对某常数 \(C_1\) 成立。设 \(\Theta_N\) 为定理 A.3 中关于某个 \(B\) 与序列 \(\varepsilon_N\) 的正则化集合，\(\delta_N,\hat u\) 分别如 (22) 与 (23)。又假定 \(n\lesssim N\delta_N\)、\(T\gtrsim\delta_N^{-1}\) 且 \(\varepsilon_N\lesssim\delta_N\)。

则对任意 \(K>0\)，存在常数 \(c\)，使得对一切 \(\theta\in\Theta_N\) 有

$$
P^N_\theta\Big(\|\hat u-u_\theta\|^2_{(N)}+\delta_N^2\|\hat\beta\|^2_{h^a}>c\delta_N^2\Big)\le e^{-KN\delta_N^2},
$$

其中常数 \(c\) 只依赖于 \(B,C_1,K\) 与 \(d\)。

#### 2.2.3 定理 1.12 的证明

我们的目标是借助命题 2.13，说明在 \(\Theta\) 上度量 \(\|G(\theta)-G(\vartheta)\|_{L^2}\) 意义下检验的存在性。为此，我们需要证明观测方案下的经验范数在 \(L^2(Q)\) 范数附近集中。我们不能像命题 2.13 的证明中对 \(\hat u\) 那样使用引理 C.2，因为它依赖于 \(X_i\)，从而 Bernstein 不等式不能直接适用。

**命题 2.14。** 设 \(K\in\mathbb{N}\) 为某个固定的正常数。假定命题 2.13 的设定与条件成立且 \(a\ge6\)，

$$
n\gtrsim N^{\frac{2d+3}{2a+d+2}}\qquad\text{且}\qquad T\lesssim N^{\frac{2a-d-1}{2a+d+2}},
$$

以及 \(\theta\in\Theta_N\) 与 \(\varepsilon_N\lesssim\delta_N\)。则存在某个阈值 \(N_0\in\mathbb{N}\)，使得对 \(N\ge N_0\)，

$$
P^N_\theta\Big(\|\hat u-u_{\theta,L}\|^2_{L^2([0,1]\times\Omega)}\le2\|\hat u-u_{\theta,L}\|^2_{(N)}+\frac{c}{T^2}\Big)\ge1-e^{-KN\delta_N^2},
$$

其中 \(N_0=N_0(K,a,d,B)\)，而 \(c\) 只依赖于 \(B,C_1,K\) 与 \(d\)。

**注 2.15。** 引理 C.2 与命题 2.14 正是我们专门采用 (11) 情形的原因；只要能够建立类似的事实，(12) 中任何其他具体的设计选择也都可以奏效。证明见附录 §C.2.4。有了这一点，我们现在就可以构造检验。

**定理 1.12 的证明。**（证明概述）我们所考虑的检验是

$$
\phi_N=\mathbf{1}\Big\{\|\hat u-u_{\theta_0}\|^2_{L^2(Q)}>E\delta_N^2\ \text{或}\ \|\hat\beta\|^2_{h^a}>c\Big\},
$$

其中 \(c\) 与 \(E\) 适当地选取且足够大。对第一类与第二类错误，我们可以使用命题 2.13，然后使用命题 2.14（注意 \(\varepsilon_N\lesssim\delta_N\)）与 (25)。

## 3 偏微分方程中的应用

本节的证明见 §C.3。

### 3.1 异质反应扩散方程

本节始终处于 (4) 的设定，且 \(d\le3\)。此时我们有

**命题 3.1。** 假定 \(D\in C^1(\Omega)\)。对 \(\varphi\in H^1(\Omega)\)、\(D\in H^s(\Omega)\)、\(f\in C^\infty_c(\mathbb{R})\) 与 \(d\le3\)，(4) 存在唯一解 \(u\)。此外，假定对 \(0\le\gamma\le s\) 有 \(\|\varphi\|_{H^\gamma},\|D\|_{H^\gamma}\le B\)，则 \(u\in H^{\gamma+1,(\gamma+1)/2}\)，且

$$
\|u\|_{H^{\gamma+1,(\gamma+1)/2}}\le C,
$$

其中 \(C=C(B,f,\gamma,d,D_{\min},\|D\|_{C^1},S)\)。

见附录 E 的定理 E.3。该命题为按 (5) 定义正向映射 \(G\) 提供了依据，其中参数空间取为

$$
\Theta=\Big\{D\in C^1(\Omega):\inf_{x\in\Omega}D(x)\ge D_{\min}\Big\},\tag{26}
$$

其中 \(D_{\min}\) 如 (4)，而我们将考虑正则化空间 \(\mathcal{R}=H^\beta(\Omega)\)（\(\beta\) 足够大）。

**正向映射的微分。** 与 Castre 与 Nickl (2026) 一样，为证明正向与反向稳定性，我们将在适当空间中计算正向映射的导数。为此，首先定义辅助映射

$$
\begin{aligned}
\mathcal{G}:C^1(\Omega)\times F&\to L^2(Q)\times H^1(\Omega)\\
(D,u)&\mapsto\Big(\frac{\partial u}{\partial t}-\nabla\cdot(D\nabla u)-f(u),\ u(0)-\varphi\Big),
\end{aligned}\tag{27}
$$

其中 \(F=L^2([0,1],H^2(\Omega))\cap H^1([0,1],L^2(\Omega))\)，配以通常的范数。由 Evans (1998) §5.9 的定理 4，我们还有 \(F\hookrightarrow C([0,1],H^1(\Omega))\)，因此 (27) 的第二个分量是合法的。

**引理 3.2。** (27) 中的映射 \(\mathcal{G}\) 在 Fréchet 意义下可微，其导数为

$$
D\mathcal{G}(D,u)[h,v]=\Big(\frac{\partial v}{\partial t}-\nabla\cdot(D\nabla v)-\nabla\cdot(h\nabla u)-f'(u)v,\ v(0)\Big).
$$

证明见 §C.3.1。注意子集

$$
\mathcal{U}=\Big\{D\in C^1:\inf_{x\in\Omega}D(x)>D_{\min}/2\Big\}\tag{28}
$$

是 \(C^1\) 的开子集。又由定理 E.3，在该子集上 \(\mathcal{G}\) 是使 \(\mathcal{G}(D,G(D))=0\) 的唯一函数。

最后我们知道，映射

$$
D_2\mathcal{G}(D,G(D))[v]=\mathcal{G}(D,G(D))[0,v]=\Big(\frac{\partial v}{\partial t}-\nabla\cdot(D\nabla v)-f'(u)v,\ v(0)\Big)
$$

由命题 E.2 是从 \(F\) 到 \(L^2(Q)\times H^1(\Omega)\) 的线性同构。于是由 Castre 与 Nickl (2026) 的定理 B.1，我们有

**命题 3.3。** 设 \(d\le3\)。对 (28) 中的 \(\mathcal{U}\) 与 (27) 中的 \(F\)，由 (5) 定义的映射 \(G:\mathcal{U}\to F\) 在 Fréchet 意义下是 \(C^1\) 的。此外，对任意 \(D\in\mathcal{U}\)，其在 \(D\) 处的 Fréchet 导数由下式给出：

$$
\begin{aligned}
DG(D):C^1(\Omega)&\to F\\
h&\mapsto\iota_h
\end{aligned}
$$

其中 \(\iota_h\in F\) 是如下线性抛物型 PDE 的唯一强解：

$$
\begin{cases}
\partial_t\iota_h-\nabla\cdot(D\nabla\iota_h)-f'(u_D)\iota_h=-\nabla\cdot(h\nabla u_D) & \text{在 }[0,1]\times\Omega,\\
\iota_h(0)=0 & \text{在 }\Omega.
\end{cases}
$$

现在我们可以导出正向与反向稳定性估计。

**正向正则性。** 回忆 \(Q=[0,1]\times\Omega\)。由命题 3.1 我们知道，对 \(\beta>d/2+1\) 与 \(M>0\)，存在某个 \(U\) 使得

$$
\sup_{D\in\Theta\cap B_{H^\beta(\Omega)}(M)}\|G(D)\|_{L^\infty(Q)}\le U,
$$

只要正则化空间控制了 \(H^\beta(\Omega)\) 范数，这就验证了条件 1.9 的第一部分。（注意我们还用了命题 2.9。）只要 \(\beta\ge5\)，条件 1.10 也由命题 3.1 成立。

**命题 3.4（HRDE 的正向正则性）。** 假定 \(\beta>d/2+1\) 且 \(\mathcal{R}=H^\beta(\Omega)\)。则对一切 \(M>0\)，存在只依赖于 \(M,D_{\min},f,\varphi\) 与 \(d\) 的常数 \(U\) 与 \(L\)，使得

$$
\sup_{D\in\Theta\cap B_{H^\beta(\Omega)}(M)}\|G(D)\|_{L^\infty(Q)}\le U,
$$

且

$$
\|G(D_1)-G(D_2)\|_{L^\infty_tL^2_x}\le L\|D_1-D_2\|_{L^2}\qquad\text{对一切 }D_1,D_2\in\Theta\cap B_\mathcal{R}(M).
$$

**反向稳定性。** 我们再次利用由 \(\mathcal{G}\) 的可微性得到的技巧。不过，我们首先收集关于传输算子 \(\nabla\cdot(h\nabla u)\) 稳定性的一些事实。

**条件 3.5。** 设 \(u\) 为 (4) 对应扩散系数 \(D\) 的解。假定

$$
\inf_{x\in\Omega}\int_0^1|\nabla u(t,x)|^2\,dt\ge c_0
$$

对某正常数 \(c_0\) 成立。

**条件 3.6。** 设 \(u\) 为 (4) 对应扩散系数 \(D\) 的解，并假定 \(\Omega'\subseteq\Omega\) 是某个开集，使得

- 在 \(\Omega\setminus\Omega'\) 上 \(D\equiv D_{\min}+1\)，且
- 对某正常数 \(\mu,c_0>0\) 与时刻 \(t\in[0,1]\)，

$$
\inf_{x\in\Omega'}\Big(\frac12\Delta u(t,x)+\mu|\nabla u(t,x)|^2\Big)\ge c_0.
$$

**注 3.7。** 条件 3.5 与 3.6 是不可比较的两个条件；我们将证明，通过特定选择初值 \(\varphi\)（其只通过 \(D_{\min}\) 与 \(\|D\|_{C^1}\) 依赖 \(D_0\)），两者都可被满足，见命题 B.3 与 B.7。在假定条件 3.5 时，我们得到整个区域 \(\Omega\) 上的稳定性[^1]；然而我们证明的是 \(L^1\) 范数下的稳定性，这导致 \(L^2\) 中较差的速率。在假定条件 3.6 时，我们必须对 \(D_0\) 假定更多已知信息，但能得到更好的速率。

[^1]: 事实上，对一般的有界区域 \(\Omega\subseteq\mathbb{R}^d\)，我们只需假定 \(D_0\) 在 \(\partial\Omega\) 上已知。

在条件 3.6 的情形下，不可能取任何满足 \(\Omega'=\Omega\) 的 \(\Omega'\)。在 \(u(t,\cdot)\) 的任一局部极大点 \(x^*\in\Omega\) 处，我们有 \(\nabla u(t,x^*)=0\) 且 \(\Delta u(t,x^*)\le0\)。[^2] 不过我们将在附录 §B 中证明，对特定的 \(\varphi\) 选择，条件 3.6 可对任意 \(\Omega'\subsetneq\Omega\) 满足。

[^2]: 然后取某个 \(x_n\in\Omega'\) 使得 \(x_n\to x^*\)。

Darcy 传输算子稳定性的困难在于：在 \(u\) 的临界点处，试图从 \(\nabla\cdot(h\nabla u)\) 中恢复关于 \(h\) 的信息。条件 3.5 转述为“\(u(t,\cdot)\) 的临界点随时间改变”这一条件。我们在命题 B.5 中证明该条件是通有的。

**引理 3.8（传输算子的稳定性）。** 设 \(D_1\) 满足 \(\|D_1\|_{H^\beta}\le M\)，其中 \(\beta>d/2+1\)。则

(a) 若条件 3.5 对 \(u_{D_1}\) 与某常数 \(c_0\) 成立，则对一切 \(h\in H^1(\Omega)\)，

$$
\|h\|_{L^1(\Omega)}\le C(M,d,c_0,\beta,D_{\min},f)\int_0^1\|\nabla\cdot(h\nabla u_{D_1})(t,\cdot)\|_{L^2(\Omega)}\,dt\le C\|\nabla\cdot(h\nabla u_{D_1})\|_{L^2(Q)}.
$$

(b) 若条件 3.6 对 \(u_{D_1}\) 与某开集 \(\Omega'\subsetneq\Omega\) 成立，则对一切 \(h\in H^1_c(\Omega')\)，

$$
\|h\|_{L^2(\Omega)}\le C(M,d,c_0,\mu,\beta,D_{\min},f)\|\nabla\cdot(h\nabla u_{D_1})\|_{L^2(Q)}.
$$

**命题 3.9（反向稳定性）。** 假定条件 3.5（相应地 3.6）对 \(u_{D_1}\) 成立，其中 \(D_1\in\Theta\) 是真参数；在条件 3.6 的情形还假定某个区域 \(\Omega'\)。则对正则化空间 \(\mathcal{R}=H^\beta(\Omega)\)（相应地 \(H^\beta_c(\Omega')\)）的选择，其中 \(\beta>d/2+4\)，并令

$$
\eta=
\begin{cases}
\dfrac{\beta-1}{\beta+1}\cdot\dfrac{\beta}{\beta+d/2+1} & \text{若条件 3.5 成立},\\[3mm]
\dfrac{\beta-1}{\beta+1} & \text{若条件 3.6 成立},
\end{cases}
$$

我们有：对一切 \(M>0\)，存在依赖于 \(M,d,c_0,D_{\min},\beta\)（在条件 3.6 情形还包括 \(\mu\)）的常数 \(L'\)，使得

$$
\|D_1-D_2\|_{L^2(\Omega)}\le L'\|G(D_1)-G(D_2)\|^\eta_{L^2(Q)}\qquad\text{对一切 }D_1,D_2\in B_\mathcal{R}(M)\cap\Theta.
$$

现在我们已经建立了验证定理 1.14 全部条件所需的关于正向映射的性质。唯一的问题是：由于扩散系数必须处处为正，参数空间不是线性的。为解决这一点，我们需要引入连接函数

$$
g(\theta)=D_{\min}+\exp(\theta).
$$

注意由 Taylor (2024) 的命题 3.9，\(g\) 把 \(L^\infty\cap H^k\) 映入 \(H^k\)，并把有界集映为有界集。

**定理 3.10。** 假定条件 3.5 或 3.6 对真值 \(D_0\equiv g(\theta_0)\) 成立。假定高斯过程先验 \(\Pi'\) 验证条件 1.8，其中相应地 \(\mathcal{R}=H^\beta(\Omega)\) 或 \(H^\beta_c(\Omega')\)，且 \(\beta>4+d/2\)，而 RKHS \(\mathcal{H}\subseteq H^\alpha(\Omega)\)，其中 \(\alpha>\beta+d/2\)。设先验 \(\Pi_N\) 为 (16) 中的概率测度在 \(g\) 下的像测度，其中取 \(\kappa=0\)。考虑 (5) 中定义的正向映射 \(G:\Theta\to L^2(Q)\)，并假定 \(\theta_0\in H^\alpha\cap\mathcal{H}\) 或相应地 \(\theta_0\in H^\alpha_c(\Omega')\cap\mathcal{H}\)。

设 \(\Pi(\cdot|(Y_{ij},X_{ij}))\) 为由模型 (11) 的观测所产生的后验分布，其中条件 1.3 成立，并假定条件 1.4 或 1.5 之一成立。令 \(\delta_N=N^{-(\alpha+1)/(2(\alpha+1)+d+2)}\)，\(\varepsilon_N=N^{-\alpha/(2\alpha+d)}\)。则对一切 \(b>0\)，我们可以取 \(m\) 足够大，使得当 \(N\to\infty\) 时

$$
P^N_{D_0}\Big(\Pi_N(D\in\Theta:\|G(D)-G(D_0)\|_{L^2(Q)}\le m\delta_N\,|\,\mathcal{D}_N)\le1-e^{-bN\varepsilon^2_N}\Big)\to0.
$$

此外，取 \(\eta\) 如命题 3.9，并取常数 \(M\) 足够大，我们还有

$$
P^N_{D_0}\Big(\Pi_N(D\in\Theta:\|D-D_0\|_{L^2(\Omega)}\le M\delta_N^\eta\,|\,\mathcal{D}_N)\le1-e^{-bN\varepsilon^2_N}\Big)=o(1).
$$

**证明。**（证明概述）证明使用定理 1.14，其中参数空间为 \(\Theta'=\mathcal{R}\)，正向映射为 \(G'=G\circ g\)。为满足条件 1.9 与 1.13，我们使用命题 3.4 与 3.9，并结合 \(g\) 在有界集上是双 Lipschitz 这一事实，参见 Nickl (2023) §2.1.1.3 与命题 2.1.5 中的想法。随后利用 Bayes 更新与取像测度可交换这一事实，通过映射 \(g\) 把先验推前，即得结论。

### 3.2 未知黏度的二维纳维–斯托克斯方程

本节始终处于二维情形，并处于 (8) 的设定，其正向映射 \(G\) 由 (9) 给出。我们取参数空间为 \(\Theta=[\nu_{\min},\infty)\times L^2(\Omega)^2\subseteq L^2(\Omega,\mathbb{R}^3)\)。与 HRDE 的情形类似，参数空间不是线性空间；我们将通过考虑适当的连接函数来解决这一问题。我们所考虑的正则化空间尺度为

$$
\mathcal{R}_\beta=\mathbb{R}\times\dot H^\beta_\diamond,\tag{29}
$$

它嵌入到 \(H^\beta(\Omega)^3\) 中。

我们假定黏度为常数，以便利用二维纳维–斯托克斯方程已有的正则性理论；按 §3.1 的框架也可以考虑“变黏度”项。

**命题 3.11。** 固定整数 \(a\ge1\)。对 \(\varphi\in\dot H^a_\diamond(\Omega)\)、\(\nu\in[\nu_{\min},\infty)\) 与某驱动力函数 \(f\in\dot H^{a-1}_\diamond\)，设 \(u\) 是 (8) 的强解。假定 \(\nu,\|\varphi\|_{H^a}\le B\)。则

$$
u\in H^{a+1,(a+1)/2},\qquad\text{且}\qquad\|u\|_{H^{a+1,(a+1)/2}}\le C,
$$

其中 \(C=C(B,f,a,d,\nu_{\min},S)\)。

(8) 的解存在且唯一，细节见附录 E 的 §E.2。

**命题 3.12（二维 N–S 的正向正则性）。** 设 \(\beta>d/2+1\)，\(\mathcal{R}=\mathcal{R}_\beta\) 取自 (29)。则对一切 \(M>0\)，存在只依赖于 \(\nu_{\min},M,d,f\) 的常数 \(U,L\)，使得

$$
\sup_{(\nu,\varphi)\in\Theta\cap B_\mathcal{R}(M)}\|G(\nu,\varphi)\|_{L^\infty(Q)}\le U,
$$

且

$$
\|G(\nu_1,\varphi_1)-G(\nu_2,\varphi_2)\|_{L^\infty_tL^2_x}\le L\big(\|\varphi_1-\varphi_2\|_{L^2}+|\nu_1-\nu_2|\big),
$$

对一切 \((\nu_i,\varphi_i)\in\Theta\cap B_\mathcal{R}(M)\)，其中 \(i=1,2\)。

其证明使用 PDE 分析中的标准技巧，例如 Grönwall 不等式，见附录 E 的 §E.2.1。

**命题 3.13（二维 N–S 的反向稳定性）。** 假定对 \(i=1,2\) 有 \(\theta_i=(\nu_i,\varphi_i)\in\Theta\)，且驱动力 \(f\ne0\) 满足 \(f\in\dot H^\beta_\diamond\)。则对正则化空间 \(\mathcal{R}=\mathcal{R}_\beta\)（取自 (29)）的任意选择，只要 \(\beta>4+d/2\)，并取 \(\eta=(\beta-1)/(\beta+1)\)，我们有：对一切 \(M>0\)，存在依赖于 \(M,d,\nu_{\min},f\) 的常数 \(L'\)，使得

$$
\|\varphi_1-\varphi_2\|_{L^2}+|\nu_1-\nu_2|\le L'\|u_{\nu_1,\varphi_1}-u_{\nu_2,\varphi_2}\|^\eta_{L^2}\qquad\text{对一切 }\theta_1,\theta_2\in B_\mathcal{R}(M).
$$

**引理 3.14。** 假定驱动力函数 \(f\in\dot H^1_\diamond\) 非零，并设 \(\theta\in H^1(\Omega)\)。设 \(u_{\nu,\theta}\) 为 (8) 对应的解，其中 \(\nu\le M\)。则存在常数 \(c_0\) 使得

$$
\int_0^1\|Au_\theta\|^2_{L^2}\,dt\ge c_0>0,
$$

其中 \(c_0=c_0(f,M,d)\)。

证明见附录 C.3 的 §C.3.6。同样，由于 \(\Theta\) 不完全是线性空间，我们需要形如下的连接函数（对 \(\theta\in L^2(\Omega,\mathbb{R}^3)\)）：

$$
g(\theta)=(\nu_{\min}+\exp(\theta_3),\theta_1,\theta_2),
$$

并再次注意，对 \(\beta>d/2\)，\(g\) 把 \(\mathcal{R}_\beta\) 空间映入 \(\mathcal{R}_\beta\cap\Theta\)。

**定理 3.15。** 假定高斯过程先验 \(\Pi'\) 验证条件 1.8，其中 \(\mathcal{R}=\mathcal{R}_\beta\)（如 (29)，对某 \(\beta>4+d/2\)），而 RKHS \(\mathcal{H}\subseteq H^\alpha(\Omega)\)（对某 \(\alpha>\beta+d/2\)）。设先验 \(\Pi_N\) 为 (16) 中的概率测度在 \(g\) 下的像测度，其中取 \(\kappa=0\)。考虑由 (8) 导出的正向映射 \(G:\Theta\to L^2(Q)\)，并假定 \(\theta_0\in\mathcal{H}\)，且 \(f\in\dot H^\alpha_\diamond\) 非零、\((\nu_0,\varphi_0)=g(\theta_0)\)。

设 \(\Pi(\cdot|(Y_{ij},X_{ij}))\) 为由模型 (11) 的观测所产生的后验分布，其中条件 1.3 成立，且条件 1.4 或 1.5 之一成立。令 \(\delta_N=N^{-(\alpha+1)/(2(\alpha+1)+d+2)}\)，\(\varepsilon_N=N^{-\alpha/(2\alpha+d)}\)。则对一切 \(b>0\)，可以取 \(m\) 足够大，使得当 \(N\to\infty\) 时

$$
P^N_{\nu_0,\varphi_0}\Big(\Pi_N\big((\varphi,\nu)\in\Theta,\|G(\nu,\varphi)-G(\nu_0,\varphi_0)\|_{L^2(Q)}\le m\delta_N\,|\,\mathcal{D}_N\big)\le1-e^{-bN\varepsilon^2_N}\Big)\to0.
$$

此外，取 \(\eta=(\beta-1)/(\beta+1)\) 并取常数 \(M\) 足够大，我们还有

$$
P^N_{\nu_0,\varphi_0}\Big(\Pi_N\big((\nu,\varphi)\in\Theta:\|\varphi-\varphi_0\|_{L^2(\Omega)}+|\nu-\nu_0|\le M\delta_N^\eta\,|\,\mathcal{D}_N\big)\le1-e^{-bN\varepsilon^2_N}\Big)=o(1).
$$

## 附录 A：技术结果

### A.1 后验收缩速率定理

我们的后验收缩速率定理的证明基于如下一般性后验收缩速率结果，它基于 Ghosal 与 van der Vaart (2017) 的定理 8.22。其证明是标准的，可在附录 C.4 中找到。

**定理 A.1（后验收缩速率）。** 对每个 \(\theta\in\Theta\)，设 \((P^N_\theta)_{N\ge1}\) 是可测空间 \((X_N,\mathcal{F}_N)\) 上的一列概率测度，并假定它们都关于 \(X_N\) 上的某个概率测度 \(\mu_N\) 有密度 \(p^N_\theta\)。我们假定对某个真值 \(\theta_0\in\Theta\) 有 \(\mathrm{Law}(\mathcal{D}_N)=P^N_{\theta_0}\)。

设 \(\Pi_N\) 是 \(\Theta\) 上一列先验 Borel 概率测度，\(\Pi_N(\cdot|\mathcal{D}_N)\) 是给定 \(\mathcal{D}_N\) 后 \(\Theta\) 上的后验概率分布，由

$$
d\Pi_N(\theta|\mathcal{D}_N)\propto p^N_\theta(\mathcal{D}_N)\,d\Pi_N(\theta)
$$

给出。设 \(G\) 如 (1)，并假定 \(\|G(\theta_0)\|_\infty\le U\)。假定存在序列 \(\varepsilon_N\to0\) 使得 \(N\varepsilon_N^2\to\infty\) 且 \(N\varepsilon_N^2\ge1\)，并且集合

$$
\mathrm{B}_N=\{\theta\in\Theta:\mathrm{KL}(p^N_{\theta_0},p^N_\theta)\le N\varepsilon_N^2,\ V_{2,0}(p^N_{\theta_0},p^N_\theta)\le N\varepsilon_N^2\}
$$

对一切足够大的 \(N\) 满足

$$
\Pi_N(\mathrm{B}_N)\ge e^{-AN\varepsilon_N^2}\tag{30}
$$

对某个 \(A>0\) 成立。进一步假定存在一列 Borel 子集 \(\Theta_N\subseteq\Theta\)，使得

1. 对某个 \(B>A+2\)，

$$
\Pi_N(\Theta_N^c)\le e^{-BN\varepsilon_N^2},\qquad\text{且}\tag{31}
$$

2. 存在检验（指示函数）\(\phi_N\) 与序列 \(\delta_N\to0\)，使得对某个 \(C\) 与 \(K\ge B\)，

$$
\mathbb{E}^N_{\theta_0}[\phi_N]\to0,\qquad\text{且}\qquad\sup_{\substack{\theta\in\Theta_N\\ C\delta_N<\|G(\theta)-G(\theta_0)\|_{L^2}}}\mathbb{E}^N_\theta[1-\phi_N]\le e^{-KN\varepsilon_N^2}.\tag{32}
$$

则对任意 \(0<b<B-A-2\)，当 \(N\to\infty\) 时

$$
P^N_{\theta_0}\Big(\Pi_N(\theta\in\Theta_N:\|G(\theta)-G(\theta_0)\|_{L^2}\le C\delta_N\,|\,\mathcal{D}_N)\le1-e^{-bN\varepsilon_N^2}\Big)\to0.
$$

**注 A.2。** 作为推论我们得到：事实上

$$
P^N_{\theta_0}\Big(\Pi_N(\theta\in\Theta:\|G(\theta)-G(\theta_0)\|_{L^2}\le C\delta_N\,|\,\mathcal{D}_N)\le1-e^{-bN\varepsilon_N^2}\Big)\to0.
$$

### A.2 小球定理

现在我们给出一个定理，说明某种后验、速率与正则化集的选择可以满足定理 A.1 的假定。回忆 \(\Theta\subseteq L^2(\mathcal{Z},W)\)，而 \(W\) 是某个有限维向量空间。对 \(\ell\) 维区域 \(\mathcal{Z}\)，取值于 \(W\) 的向量场的 Sobolev 空间按通常方式定义，见 §1.1。

**定理 A.3。** 假定条件 1.9 与 1.8 对正向映射 \(G\)、正则性 \(\alpha>0\)、某个 \(\kappa\ge0\)、\(U<\infty\)、正则化空间 \(\mathcal{R}\) 与具有光滑边界的有界区域 \(\mathcal{Z}\subseteq\mathbb{R}^\ell\)（或 \(\mathcal{Z}=\mathbb{T}^\ell\)）成立。记 \(\Pi_N\) 为 (16) 中重标度先验的分布。最后，假定条件 1.4 或条件 1.5 之一以常数 \(C_2\) 成立。若 \(\theta_0\in\mathcal{H}\cap\mathcal{R}\)，则对序列

$$
\varepsilon_N=N^{-(\alpha+\kappa)/(2\alpha+2\kappa+\ell)}
$$

以及任意 \(B\)，只要正则化集取为

$$
\Theta_N=\{\theta\in\mathcal{R}:\theta=\theta_1+\theta_2,\ \|\theta_1\|_{(H^\kappa(\mathcal{Z}))^*}\le M\varepsilon_N,\ \|\theta_2\|_\mathcal{H}\le M,\ \|\theta\|_\mathcal{R}\le M\},\tag{33}
$$

其中 \(M=M(B)\) 足够大，定理 A.1 中的假设 (30) 与 (31) 对某个 \(A>0\) 成立。

**证明。**（证明概述）该证明与 Nickl (2023) 定理 2.2.2 的第 1 至第 3 步相同，只是由命题 1.7 我们有

$$
\mathrm{B}_N\supseteq\{\theta:\|G(\theta)-G(\theta_0)\|_{L^\infty_tL^2_x}\le c(U,C_2)\varepsilon_N,\ \|G(\theta)\|_\infty\le U\}.
$$

## 附录 B：含散度型算子的抛物型偏微分方程的稳定性

在本节中，我们将说明可以选取初值使得条件 3.5 与 3.6 成立。这给出对算子为椭圆型算子 \(-\nabla\cdot(D\nabla u)\)、其中 \(D\) 未知的抛物型 PDE 而言映射 \(D\mapsto u_D\) 的稳定性。我们把各命题的证明推迟到附录 §C.5。

### 验证条件 3.5

**注 B.1。** 我们用 \(\nabla^2\varphi\) 表示 Hessian。方程 (34) 转述为关于 \(\varphi\) 每个临界点的某种非退化条件。引理 B.2 证明的想法是：(34) 迫使解的临界点移动，细节见附录 C.5 的 §C.5.1。

引理 B.2 给出了一个比条件 3.5 更易操作的替代条件，因为它在理论上更容易验证：可以找到 \(\varphi\) 的任意小扰动使得 (34) 对某个 \(\delta\) 成立。细节见命题 B.3。

**引理 B.2。** 设 \(D\) 是 (4) 中的扩散系数、\(\varphi\) 是其初值，且 \(\|D\|_{H^\alpha}\le M\)，其中 \(\alpha>d/2+5\)。假定

- \(\varphi\) 具有孤立的临界点，且
- 存在某常数 \(\delta\)，使得对一切 \(x^*\in\Omega\)，

$$
\nabla\varphi(x^*)=0\ \Longrightarrow\ |D\nabla(\Delta\varphi)+\Delta\varphi\nabla D+\nabla^2\varphi\nabla D|\ge\delta\quad\text{在 }x^*\text{ 处}.\tag{34}
$$

则 \(u=u_D\) 对某常数 \(c_0=c_0(\delta,M,\alpha,D_{\min},d,f)\) 满足条件 3.5。

**命题 B.3。** 假定 \(D:\Omega\to[D_{\min},\infty)\) 且 \(\|D\|_{C^1(\Omega)}\le M\)。则存在只依赖于 \(d,M,D_{\min}\) 的函数 \(\varphi\)，使得 \(\varphi\) 具有孤立临界点且 (34) 成立。

**注 B.4。** 细节见附录 C.5 的 §C.5.2。我们利用单个函数的存在性来证明：事实上，满足条件 3.5 在初值中是通有的，这正是命题 B.5 的主题。

**命题 B.5。** 设 \(D\) 是 (4) 中的扩散系数，且 \(D\in H^\alpha\)，其中 \(\alpha>d/2+5\)。使条件 3.5 对某常数 \(c_0\) 成立的初值集合，关于 \(C^k\) 范数（\(k\ge3\)）是第二纲的（特别地，它包含一个开稠密集）。

**注 B.6。** 在讨论了条件 3.5 何时成立之后，值得指出一些它明显不成立的情形。事实上，当 (4) 存在稳态（即不随时间变化）解 \(u\) 时，\(u\) 的驻点显然不移动。

另一个值得注意的情形是纯本征模态：若考虑 \(f\equiv c\)（\(c\) 为某常数），且 \(e_\lambda\in L^2(\Omega)\) 是 \(-\nabla\cdot(D\nabla)\) 的、本征值为 \(\lambda>0\) 的本征函数，则取 \(\varphi=e_\lambda\)，我们看到

$$
u(t,x)=e^{(-\lambda+c)t}e_\lambda(x),
$$

显然 \(u\) 没有移动的临界点。这正如此前所料，提示当动力学退化时我们无法推断 \(D\)。

### 验证条件 3.6

本节始终固定 \(\Omega'\) 为 \(\Omega\) 的开子集且 \(\Omega'\subsetneq\Omega\)。于是我们有

**命题 B.7。** 假定 \(D:\Omega\to[D_{\min},\infty)\) 且 \(\|D\|_{C^1}\le M\)。则存在只依赖于 \(d,M,D_{\min},\Omega'\) 的函数 \(\varphi\)，使得条件 3.6 对 \(\Omega'\) 以及某组 \(c_0,\mu\) 与 \(t=0\) 成立。

**证明。**（证明概述）取任意非零函数 \(f\) 使得 \(f:\Omega\to[0,1]\)、\(f\in C^\infty_c({\Omega'}^c)\)。则存在某常数 \(c(d,V)>0\) 使得

$$
\int(1-cf)\,dx=0,
$$

并令 \(g=1-cf\)。于是 \(g\in\dot C^\infty(\Omega)\)，故由命题 E.1 存在解 \(\varphi\in C^\infty(\Omega)\) 使

$$
g=\nabla\cdot(D\nabla\varphi).
$$

现在我们可以使用 Nickl 等 (2020) 引理 24 中的一个想法，注意对 \(x\in\Omega'\)，

$$
1=g(x)=D(x)\Delta\varphi(x)+\nabla D(x)\cdot\nabla\varphi(x),
$$

因此或者 \(\Delta\varphi(x)\ge1/(2\|D\|_\infty)\)，或者 \(|\nabla\varphi(x)|^2\ge1/(2\|D\|_{C^1})^2\)。于是我们可以选取 \(\mu=\mu(M,d,V)\) 使得

$$
\inf_{x\in\Omega'}\Big[\frac12\Delta\varphi(x)+\mu|\nabla\varphi(x)|^2\Big]\ge c_0,
$$

其中 \(c_0\) 依赖于 \(M,d,\Omega',D_{\min}\)。取该 \(\varphi\) 为 \(u_D\) 的初值即给出条件 3.6。\(\square\)

## 附录 C：证明

### C.1 第 1 节的证明

#### C.1.1 命题 1.6 的证明

**证明。**（证明概述）由注 2.2，只需对一个一般的 \(VAR(p)\) 过程证明条件 1.4 成立，且其中的常数只依赖其参数的上界、\(p\) 与 \(d_V\)。现在，若 \(X=(X_1,\ldots,X_T)\sim N(0,\Sigma)\) 是一个 \(VAR(p)\) 过程，则令 \(Q=\Sigma^{-1}\)，并令 \(Q_{ij}\) 为 \(Q\) 的 \(d_V\times d_V\) 子块，\(i,j=1,\ldots,T\)。但由 Lütkepohl (2005) 我们知道，平稳 \(VAR(p)\) 过程的精度矩阵是 \(p\)-带状分块矩阵，并且在远离两端处是 Toeplitz 的：即当 \(|i-j|>p\) 时 \(Q_{ij}=0\)，且当 \(i-j=i'-j'\) 与 \(p<i,i',j,j'<T-p+1\) 时 \(Q_{ij}=Q_{i'j'}\)。上界可由 Lütkepohl (2005) 中式 (3.4.4) 导出的该矩阵显式形式得到。\(\square\)

#### C.1.2 命题 1.7 的证明

本节的目的是证明命题 1.7，以说明定理 A.1 的小球条件 (30) 成立。这在定理 A.3 的证明中是必需的。

**证明。**（证明概述）为记号方便，令 \(u=G(\theta)\)、\(v=G(\vartheta)\)。我们另外把 \(p^N_\theta\) 写作 \(p_\theta\)。注意

$$
p_\theta(y,x)\propto\exp\Big(-\frac12\sum_{ij}(y_i-u(t_i,x_i))^T(\Gamma_N^{-1})_{ij}(y_j-u(t_j,x_j))\Big),
$$

其中对 \(i,j=1,\ldots,N\)，我们把 \((\Gamma_N^{-1})_{ij}\) 记为 \(\Gamma_N^{-1}\) 的 \(d_V\times d_V\) 子块。注意 \((\Gamma_N^{-1})^T_{ij}=(\Gamma_N^{-1})_{ji}\)。于是经过一些代数运算，在 \(p_\theta\) 的分布下对数似然比为

$$
\begin{aligned}
\log\Big(\frac{p_\vartheta}{p_\theta}\Big)=&-\sum_{ij}\epsilon_i^T(\Gamma_N^{-1})_{ij}(u(t_j,X_j)-v(t_j,X_j))\\
&-\frac12\sum_{ij}(u(t_i,X_i)-v(t_i,X_i))^T(\Gamma_N^{-1})_{ij}(u(t_j,X_j)-v(t_j,X_j)),
\end{aligned}\tag{35}
$$

现在记 \(u(t_i,X_i)-v(t_i,X_i)\equiv u_i-v_i\)。于是由迹技巧与 \(\mathbb{E}_\theta[\epsilon_i]=0\)，我们观察到 KL 散度满足

$$
-\mathbb{E}_{p_\theta}\Big[\log\frac{p_\vartheta}{p_\theta}\Big]=\frac12\sum_{ij}\mathrm{tr}\Big[(\Gamma_N^{-1})_{ij}\mathbb{E}[(u_j-v_j)(u_i-v_i)^T]\Big].\tag{36}
$$

在条件 1.4 的情形，为简洁起见再假定 \(d_V=1\)。然后用 Cauchy–Schwarz 得

$$
|\mathrm{KL}(p_\theta,p_\vartheta)|\le\frac12\sum_{ij}|(\Gamma_N^{-1})_{ij}|\,\|u(t_i,\cdot)-v(t_i,\cdot)\|_{L^2(\Omega)}\|u(t_j,\cdot)-v(t_j,\cdot)\|_{L^2(\Omega)}.
$$

然后应用条件 1.4 得到

$$
\mathrm{KL}(p_\theta,p_\vartheta)\lesssim N\|u-v\|^2_{L^\infty_tL^2_x}.\tag{37}
$$

下面转向（仍然假定 \(d_V=1\)）对 KL 变差 \(V_{2,0}\) 的更复杂的界。由于

$$
V_{2,0}(p_\theta,p_\vartheta)=\mathbb{E}_{p_\theta}\Big[\log\frac{p_\vartheta}{p_\theta}\Big]^2-\mathrm{KL}(p_\theta,p_\vartheta)^2,
$$

若把 (35) 平方并展开，注意 \(\mathbb{E}_{p_\theta}[\epsilon_i\epsilon_{i'}]=(\Gamma_N)_{ii'}\) 与 \(\mathbb{E}_{p_\theta}[\epsilon_i]=0\)，我们得到

$$
\begin{aligned}
=&\sum_{jj'}(\Gamma_N^{-1})_{jj'}\mathbb{E}_{p_\theta}[(u-v)(t_j,X_j)(u-v)(t_{j'},X_{j'})]\\
&+\frac14\sum_{ii'jj'}(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{i'j'}\mathbb{E}_{p_\theta}\big[(u-v)(t_{i'},X_{i'})(u-v)(t_{j'},X_{j'})(u-v)(t_i,X_i)(u-v)(t_j,X_j)\big]\\
&-\frac14\sum_{ii'jj'}(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{i'j'}\mathbb{E}_{p_\theta}[(u-v)(t_{i'},X_{i'})(u-v)(t_{j'},X_{j'})]\mathbb{E}_{p_\theta}[(u-v)(t_i,X_i)(u-v)(t_j,X_j)].
\end{aligned}\tag{38}
$$

第一项可以像 KL 散度情形那样处理。当 \(X_{i'},X_{j'}\) 与 \(X_i,X_j\) 独立，即当 \(\{i,j\}\cap\{i',j'\}=\varnothing\) 时，后两项相互抵消；当不是这种情况时，下列至少一条成立：\(i=i'\)、\(i=j'\)、\(j=i'\) 或 \(j=j'\)。因此（用 Hölder 不等式）可把上述和界定为

$$
\begin{aligned}
\le&\frac12\sum_{ijj'}(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{ij'}\|(u-v)(t_i,\cdot)\|^2_{L^4_x}\|(u-v)(t_j,\cdot)\|_{L^4_x}\|(u-v)(t_{j'},\cdot)\|_{L^4_x}\\
&+\frac12\sum_{ii'j}(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{i'i}\|(u-v)(t_i,\cdot)\|^2_{L^4_x}\|(u-v)(t_{i'},\cdot)\|_{L^4_x}\|(u-v)(t_j,\cdot)\|_{L^4_x}\\
&+\frac12\sum_{ijj'}(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{jj'}\|(u-v)(t_i,\cdot)\|_{L^4_x}\|(u-v)(t_j,\cdot)\|^2_{L^4_x}\|(u-v)(t_{j'},\cdot)\|_{L^4_x}\\
&+\frac12\sum_{ii'j}(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{i'j}\|(u-v)(t_i,\cdot)\|_{L^4_x}\|(u-v)(t_{i'},\cdot)\|_{L^4_x}\|(u-v)(t_j,\cdot)\|^2_{L^4_x}.
\end{aligned}
$$

现在使用条件 1.4，我们最终观察到

$$
V_{2,0}(p_\theta,p_\vartheta)\lesssim N\big(\|u-v\|^2_{L^\infty_tL^4_x}+\|u-v\|^4_{L^\infty_tL^4_x}\big).\tag{39}
$$

接着考虑条件 1.5 的 (a) 情形（并且不再假定 \(d_V=1\)）。回到 (36)，我们看到

$$
\mathrm{KL}(p_\theta,p_\vartheta)=\frac12\sum_{ij}\mathrm{tr}\Big[(\Gamma_N^{-1})_{ij}\mathbb{E}[(u_j-v_j)(u_i-v_i)^T]\Big].
$$

但由条件 1.5.a，我们知道对 \(i\ne j\)，

$$
\mathbb{E}[(u_i-v_i)(u_j-v_j)^T]=\mathbb{E}[(u-v)(t_i,X_i)]\,\mathbb{E}[(u-v)(t_j,X_j)^T]=0.
$$

于是把它代入 (36) 得

$$
\mathrm{KL}(p_\theta,p_\vartheta)=\frac12\sum_i\mathrm{tr}\big[(\Gamma_N^{-1})_{ii}\mathbb{E}[(u_i-v_i)(u_i-v_i)^T]\big]\le\frac12\sum_i\mathrm{tr}\big[(\Gamma_N^{-1})_{ii}\big]\|u-v\|^2_{L^\infty_tL^2_x}\le\frac12\mathrm{tr}(\Gamma_N^{-1})\|u-v\|^2_{L^\infty_tL^2_x},\tag{40}
$$

其中第一个不等式使用了如下事实：1) 对两个非负对称矩阵 \(M\) 与 \(L\)，\(\mathrm{tr}(ML)\le\mathrm{tr}(M)\|L\|\)；2) 对 \(w\in V\)，若置 \(L=ww^T\)，则 \(L\) 是非负对称矩阵且 \(\|L\|=|w|^2_V\)。对 KL 变差，我们推导出与 (38) 类似、但对一般 \(d_V\) 成立的表达式：

$$
\begin{aligned}
V_{2,0}(p_\theta,p_\vartheta)=&\sum_{jj'}\mathrm{tr}\big[(\Gamma_N^{-1})_{jj'}\mathbb{E}[(u_{j'}-v_{j'})(u_j-v_j)^T]\big]\\
&+\frac14\mathbb{E}\Big[\sum_{ii'jj'}(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)(u_{i'}-v_{i'})^T(\Gamma_N^{-1})_{i'j'}(u_{j'}-v_{j'})\Big]\\
&-\frac14\sum_{ii'jj'}\mathbb{E}[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)]\,\mathbb{E}[(u_{i'}-v_{i'})^T(\Gamma_N^{-1})_{i'j'}(u_{j'}-v_{j'})],
\end{aligned}
$$

但这一次我们注意到后两项在以下情形相互抵消：a) \(\{i,j\}\cap\{i',j'\}=\varnothing\)，或 b) 有一个指标与其他三个都不同。于是得到

$$
\begin{aligned}
V_{2,0}(p_\theta,p_\vartheta)=&\sum_j\mathrm{tr}\big[(\Gamma_N^{-1})_{jj}\mathbb{E}[(u_j-v_j)(u_j-v_j)^T]\big]\\
&+\frac14\sum_{ij}\Big(\mathbb{E}\big[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)\big]\\
&\qquad\qquad-\mathbb{E}\big[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)\big]^2\Big)\\
&+\frac14\sum_{ij,\ i\ne j}\Big(\mathbb{E}\big[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)(u_j-v_j)^T(\Gamma_N^{-1})_{ji}(u_i-v_i)\big]\\
&\qquad\qquad-\mathbb{E}\big[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)\big]^2\Big).
\end{aligned}
$$

第一项按 KL 散度情形同样处理。对其余两项，对 \(i,j=1,\ldots,N\) 考虑界

$$
\begin{aligned}
&\mathbb{E}\big[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)\big]-\mathbb{E}\big[(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)\big]^2\\
&\le\mathbb{E}\Big[\mathrm{tr}\big[(\Gamma_N^{-1})_{ji}(u_i-v_i)(u_i-v_i)^T(\Gamma_N^{-1})_{ij}(u_j-v_j)(u_j-v_j)^T\big]\Big]\\
&\le\mathbb{E}\Big[\mathrm{tr}\big[(\Gamma_N^{-1})_{ji}(u_i-v_i)(u_i-v_i)^T(\Gamma_N^{-1})_{ij}\big]|u_i-v_i|^2_V\Big]\\
&\le\mathrm{tr}\big[(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{ji}\big]\mathbb{E}\big[|u_i-v_i|^2_V|u_j-v_j|^2_V\big]\\
&\lesssim\mathrm{tr}\big[(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{ji}\big]\|u-v\|^4_{L^\infty_tL^4_x},
\end{aligned}
$$

其中我们再次使用了 (40) 之后注明的那些事实。现在，通过分块矩阵代数我们观察到

$$
\sum_{ij}\mathrm{tr}\big[(\Gamma_N^{-1})_{ij}(\Gamma_N^{-1})_{ji}\big]=\mathrm{tr}(\Gamma_N^{-2}).
$$

把这些放在一起，我们得到

$$
V_{2,0}(p_\theta,p_\vartheta)\lesssim\mathrm{tr}(\Gamma_N^{-2})\|G(\theta)-G(\vartheta)\|^4_{L^\infty_tL^4_x}+\mathrm{tr}(\Gamma_N^{-1})\|G(\theta)-G(\vartheta)\|^2_{L^\infty_t,L^2_x}.
$$

最后，注意由 Cauchy–Schwarz 不等式 \(\mathrm{tr}(\Gamma_N^{-1})\le\mathrm{tr}(\Gamma_N^{-2})^{1/2}N^{1/2}\)，于是由条件 1.5 中的条件 (b) 以及 \(\|G(\theta)\|_\infty,\|G(\vartheta)\|_\infty\le U\) 即得结论。\(\square\)

### C.2 第 2 节的证明

#### C.2.1 命题 2.3 的证明

**证明。**（证明概述）为简洁起见，我们专门考虑 \(d_V=1\) 的情形。若对足够大的 \(T\) 有 \(\max_j\|M^j\|_{\infty\to\infty}\le c\)，则由于 \(\|D_j^{-1}M^j\|_{\infty\to\infty}<1\)，有

$$
(\Gamma^{(j)})^{-1}=(D_jI+M)^{-1}=(I-D_j^{-1}M+(D_j^{-1}M)^2-\cdots)D_j^{-1}.
$$

于是对两边取范数，得到

$$
\|(\Gamma^{(j)})^{-1}\|_{\infty\to\infty}\le c_1^{-1}\frac{1}{1-c_1^{-1}\|M\|_{\infty\to\infty}}\le\frac{1}{c_1-c},
$$

而如条件 1.4 之后的讨论所述，即得结论。“特别地”部分由如下不等式推出（见 Horn 与 Johnson (1985) 定理 5.6.26）：

$$
\|A\|_{\infty\to\infty}\le\sqrt{T}\|A\|\qquad\text{与}\qquad\|A\|_{\infty\to\infty}\le T\|A\|_\infty.
$$

#### C.2.2 一个 \(M\)-估计结果

我们处于 van de Geer (2001) 的设定，但误差是相依的：考虑回归模型

$$
Y_i=g_0(z_i)+\epsilon_i,\qquad\text{对 }i=1,\ldots,N,
$$

其中 \(Y_1,\ldots,Y_N\) 是实值观测，\(z_1,\ldots,z_N\) 是解释变量、取值于某空间 \(\mathcal{Z}\)，测量误差 \(\epsilon_i\) 是中心化高斯随机变量，具有可逆协方差矩阵 \(\Gamma=\Gamma_N\)。我们假定 \(g_0\) 属于定义在 \(\mathcal{Z}\) 上的某类回归函数，记为 \(\mathbb{G}\)。此外假定对某常数 \(M\) 有 \(\|\Gamma_N\|\le M\)。

与 van de Geer (2001) 一样，设 \(\mathrm{pen}:\mathbb{G}\to[0,\infty)\)、\(g^*\in\mathbb{G}\)，并定义

$$
\|g-h\|^2_{(N)}=\frac1N\sum_i|g(z_i)-h(z_i)|^2,\qquad \tau^2(g|\tilde g)=\|g-\tilde g\|^2_{(N)}+\mathrm{pen}^2(g),
$$
$$
\mathbb{G}^*(\delta)=\{g\in\mathbb{G}:\tau^2(g|g^*)\le\delta^2\},\qquad J^*(\delta)=\int_0^\delta\big[\log N(u,\mathbb{G}^*(\delta))\big]^{1/2}\,du,
$$

其中 \(N(u,\mathbb{G}^*(\delta))\) 是用半径 \(u\) 的球覆盖 \(\mathbb{G}^*(\delta)\)（在 \(\|\cdot\|_{(N)}\) 度量下）所需的最少球数。最后，设 \(\hat g_N\) 为任意罚最小二乘极小元。

**定理 C.1。** 设 \(\Lambda^*(\delta)\ge J^*(\delta)\vee\delta\) 为某个上界。假定 \(\Lambda^*(\delta)/\delta^2\) 随 \(\delta\) 增大而递减。则存在只依赖于 \(M\) 的常数 \(c\)，使得当

$$
\sqrt N\delta_N^2\ge c\Lambda^*(\delta_N)
$$

时，对一切 \(\delta\ge\delta_N\) 有

$$
P\big(\tau^2(\hat g_N|g_0)\ge2(\tau^2(g^*|g_0)+\delta^2)\,|\,z_1,\ldots,z_N\big)\le c\exp\Big[-\frac{N\delta^2}{c^2}\Big].
$$

**证明。**（证明概述）证明与 van de Geer (2001) 中的定理 2.1 相同，只是我们用同一文献中的引理 3.2 代替 van de Geer (2000) 的推论 8.4。为满足引理 3.2 的假设，注意 \(\epsilon=(\epsilon_i)_i\) 是 \(N(0,\Gamma)\) 随机变量，因此对 \(\gamma\in\mathbb{R}^N\)，\(\gamma^T\epsilon\sim N(0,\gamma^T\Gamma\gamma)\)，故由高斯分布的标准尾界，

$$
P\Big(\sum_{i=1}^N\epsilon_i\gamma_i\ge a\Big)\le\exp\Big(-\frac{a^2}{2\gamma^T\Gamma\gamma}\Big)\le\exp\Big(-\frac{a^2}{2\|\Gamma\||\gamma|^2}\Big).
$$

然后证明的其余部分照常进行。\(\square\)

#### C.2.3 命题 2.13 的证明

**证明。**（证明概述）该证明与 Nickl 与 Wang (2024) 中命题 B.7 的证明类似。我们使用 van de Geer (2001) 定理 2.1 的一个稍加修改的版本，细节见 §C.2.2。注意经验范数 \(\|\cdot\|_{(N)}\) 被 \(\|\cdot\|_\infty\) 控制，进而又被 \(H^{a,a/2}\) 中半径 \(m\) 的球的度量熵控制；由推论 2.11，对每个 \(m>0\) 其度量熵为 \(H(\tau)\lesssim(m/\tau)^{(d+2)/a}\) 阶。为控制偏差项，我们首先观察到对 \(\theta\in\Theta_N\) 有 \(\theta=\theta_1+\theta_2\)，其中 \(\|\theta_1\|_{(H^\kappa(\mathcal{Z}))^*}\le M\varepsilon_N\)、\(\|\theta_2\|_\mathcal{H}\le M\)、\(\|\theta\|_\mathcal{R}\le M\)（对某个 \(M=M(B)\)）。由条件 1.10，存在某个 \(U=U(B)\) 使得 \(\|u_\theta\|_{H^{6,3}}\le U\)、\(\|u_{\theta_2}\|_{H^{6,3}}\le U\) 且 \(\|u_{\theta_2}\|_{H^{a,a/2}}\le U\)。偏差项于是为

$$
\|u_\theta-u_{\theta_2,L}\|_{(N)}\le\|u_\theta-u_{\theta_2}\|_{(N)}+\|u_{\theta_2}-u_{\theta_2,L}\|_{(N)}.
$$

接下来我们对 \(v=u_\theta-u_{\theta_2}\) 与 \(u_{\theta_2}-u_{\theta_2,L}\) 使用引理 C.2，化归到事件

$$
A_N=\Big\{|\,\|v\|^2_{(N)}-\|v\|^2_{L^2}|\le\lambda\delta_N^2\ \text{对 }v=u_\theta-u_{\theta_2},\ u_{\theta_2}-u_{\theta_2,L}\Big\},
$$

当 \(\lambda\) 足够大时该事件满足 \(P^N_\theta(A_N)\ge1-\exp(-KN\delta_N^2)\)。（注意事件 \(A_N\) 只依赖于设计 \((t_i,X_{ij})_{ij}\)。）然后在 \(A_N\) 上使用 (25) 得

$$
\|u_\theta-u_{\theta_2,L}\|_{(N)}\le\|u_\theta-u_{\theta_2}\|_{L^2}+C\delta_N,
$$

但现在我们用条件 1.9 与 \(\|\theta_1\|_{(H^\kappa(\mathcal{Z}))^*}\le M\varepsilon_N\) 得到

$$
\|u_\theta-u_{\theta_2,L}\|_{(N)}\le C(\varepsilon_N+\delta_N).
$$

最后，对所有属于 \(A_N\) 的设计 \((t_i,X_{ij})_{ij}\) 应用定理 C.1，即完成证明。\(\square\)

**引理 C.2。** 在 (11) 与 (12) 的设定下，假定 \(v=v_N\in H^{6,3}\cap L^\infty\) 是（确定性的）序列，且对一切 \(N\) 有 \(\|v_N\|_{H^{6,3}}\le U\)、\(\|v_N\|_\infty\le U\)，并假定

$$
n\lesssim N\delta_N\qquad\text{与}\qquad T\gtrsim\delta_N^{-1},
$$

以及 \(\|v_N\|_{L^\infty_tL^2_x}\lesssim\delta_N\)。则对任意 \(K>0\)，存在 \(\lambda(U)>0\) 使得

$$
P^N_\theta\big(|\,\|v\|^2_{(N)}-\|v\|^2_{L^2}\,|\le\lambda\delta_N^2\big)\ge1-e^{-KN\delta_N^2}.
$$

**证明。**（证明概述）首先考虑独立、均值为零的随机变量集合

$$
|v(t_i,X_{ij})|^2-\|v(t_i,\cdot)\|^2_{L^2(\Omega)}\qquad\text{对 }i=1,\ldots,T,\ j=1,\ldots,n.
$$

由于 \(\|v\|_\infty\le U\)，这是一族独立、一致有界且均值为零的随机变量。此外我们有

$$
\mathrm{Var}(|v(t_i,X_{ij})|^2)\le\mathbb{E}^N(|v(t_i,X_{ij})|^4)\le U^2\mathbb{E}^N(|v(t_i,X_{ij})|^2)\le U^2\delta_N^2.
$$

于是应用 Bernstein 不等式得到

$$
\begin{aligned}
P^N_\theta\Bigg(\Bigg|\frac1N\sum_{i,j}|v(t_i,X_{ij})|^2-\frac1T\sum_{i=1}^T\|v(t_i,\cdot)\|^2_{L^2(\Omega)}\Bigg|\ge\lambda\delta_N^2\Bigg)
&\le2\exp\Bigg(\frac{-N^2\delta_N^4\lambda^2}{2(NU^2\delta_N^2+\frac13U^2N\delta_N^2\lambda)}\Bigg)\\
&\le2\exp\Big(-\frac{\lambda^2}{2U^2(1+\lambda/3)}N\delta_N^2\Big).
\end{aligned}
$$

因此取 \(\lambda\ge0\) 足够大，我们得到

$$
P^N_\theta\Bigg(\Bigg|\,\|v\|^2_{(N)}-\frac1T\sum_{i=1}^T\|v(t_i,\cdot)\|^2_{L^2(\Omega)}\Bigg|\le\lambda\delta_N^2\Bigg)\ge1-\exp\Big(-KN\delta_N^2\Big).
$$

现在我们知道 \(\|v\|_{H^{6,3}}\le U\)。又由命题 2.7，\(v\in H^3([0,1],L^2(\Omega))\)。于是由 Evans (1998) §5.9.2 的定理 3，这意味着函数

$$
t\mapsto\|v(t,\cdot)\|^2_{L^2(\Omega)}
$$

是 \(C^2([0,1])\) 的，其范数只依赖于 \(U\)。现在考虑引理 C.3。我们利用 \(T\gtrsim\delta_N^{-1}\) 这一事实来完成证明。\(\square\)

**引理 C.3。** 对 \(g\in C^2([0,1])\)，以及 \(t_i=(2i-1)/2T\)，\(i=1,\ldots,T\)，我们有

$$
\Bigg|\frac1T\sum_{i=1}^Tg(t_i)-\int_0^1g(t)\,dt\Bigg|\le\frac{\|g\|_{C^2}}{24T^2}.
$$

见 Meyers 与 Suli (2003) 第 286 页。（原文中该引理直接嵌于引理 C.2 的证明内陈述。）

#### C.2.4 命题 2.14 的证明

首先，我们将证明：对固定的 \(i\)，关于 \(\{X_{ij}:j=1,\ldots,n\}\) 的经验范数在 \(L^2(\Omega)\) 范数附近集中。

**引理 C.4。** 在命题 2.13 的设定下，假定 \(a>(d+1)/2\)，并假定

$$
n\gtrsim N^{\frac{2d+3}{2a+d+2}}\qquad\text{与}\qquad T\lesssim N^{\frac{2a-d-1}{2a+d+2}}.
$$

则存在序列 \(\gamma_N\) 使得 \(N\delta_N^2=o(\gamma_N)\)，且对每个 \(i=1,\ldots,T\)，

$$
P^N_\theta\Bigg(\Bigg|\frac{\frac1n\sum_{j=1}^n|(\hat u-u_{\theta,L})(t_i,X_{ij})|^2}{\|(\hat u-u_{\theta,L})(t_i,\cdot)\|^2_{L^2(\Omega)}}-1\Bigg|\le\frac12\Bigg)\ge1-c'e^{-\gamma_N},
$$

其中 \(u_{\theta,L}\) 如 (24)，\(c'\) 是某个正常数。

**证明。**（证明概述）我们知道 \(\hat u(t_i,\cdot)\) 与 \(u_{\theta,L}(t_i,\cdot)\) 都属于 \(V_{L+1}\)（因为该和中每个空间小波在固定 \(t\) 处的层级都 \(\le L\)）[^3]。于是可以对 \(\Gamma=I\)、\(\hat\Gamma\) 取为

$$
\hat\Gamma_{kk'}=\frac1n\sum_{j=1}^n\Phi_{Lk}(X_{ij})\Phi_{Lk'}(X_{ij})
$$

的情形，套用 Nickl 与 Wang (2024) 命题 B.7 中第 IV 步的论证，其中 \(\Phi^\iota_{Lk}\) 是张量化 Meyer 尺度函数，并注意 \(\hat\Gamma\) 是 \(2^{(L+1)d}\times2^{(L+1)d}\) 矩阵。然后令 \(M_L\) 为 \(\mathbb{R}^{2^{(L+1)d}}\) 中半径 \(\kappa\)（对某固定的 \(\kappa^2+2\kappa<1/4\)）的球的覆盖数，\(\{v_1,\ldots,v_{M_L}\}\) 为覆盖向量，并定义 \(U\equiv cN^{d/(2a+d+2)}\)。于是按 Nickl 与 Wang (2024) 的论证，我们推出

$$
M_J\lesssim e^{c_02^{Ld}}\le e^{c_1N^{d/(2a+d+2)}},
$$

其中常数都是绝对的。最后，在应用 Bernstein 不等式时我们得到

$$
P\big(n|v_m^T(\hat\Gamma-I)v_m|>n/4\big)\le2\exp\Big(-\frac{n^2/16}{2nU+(2/12)nU}\Big)\le2e^{-c_0n/U}.
$$

现在我们知道 \(n/U\gtrsim N^{(d+3)/(2a+d+2)}\)，因此可以界定

$$
\begin{aligned}
P\Big(\max_{m=1,\ldots,M_J}|v_m^T(\hat\Gamma-I)v_m|\ge1/4\Big)
&\le M_J\max_mP\big(|v_m^T(\hat\Gamma-I)v_m|>1/4\big)\\
&\le2e^{c_1N^{d/(2a+d+2)}-c_0N^{(d+3)/(2a+d+2)}}\\
&\le c'e^{-c''N^{(d+2.5)/(2a+d+2)}}=c'e^{-\gamma_N}.
\end{aligned}
$$

该概率界给出所论概率的补集，故得证。\(\square\)

[^3]: 细节见 §D.1。

**命题 2.14 的证明。**（证明概述）由引理 C.4 与联合界我们观察到

$$
P^N_\theta\Bigg(\Bigg|\frac{\frac1n\sum_{j=1}^n|(\hat u-u_{\theta,L})(t_i,X_{ij})|^2}{\|(\hat u-u_{\theta,L})(t_i,\cdot)\|^2_{L^2(\Omega)}}-1\Bigg|\le\frac12\ \text{对 }i=1,\ldots,T\Bigg)\ge1-Tc'e^{-\gamma_N}.
$$

但由于 \(T\) 关于 \(N\) 代数增长，且 \(N\delta_N^2=o(\gamma_N)\)，对足够大的 \(N\ge N_0\)，在对 \(t_i\) 取平均之后我们有

$$
P^N_\theta\Bigg(\frac1T\sum_{i=1}^T\|(\hat u-u_{\theta,L})(t_i,\cdot)\|^2_{L^2(\Omega)}\le\frac{2}{Tn}\sum_{i=1}^T\sum_{j=1}^n|(\hat u-u_{\theta,L})(t_i,X_{ij})|^2\Bigg)\ge1-\frac12e^{-KN\delta_N^2}.\tag{41}
$$

其次，由命题 2.13，取 \(c\) 足够大，我们有

$$
P^N_\theta\big(\|\hat\beta\|^2_{h^a}\le c\,|\,((t_i,X_{ij}))_{ij}\big)\ge1-\frac12e^{-KN\delta_N^2}.
$$

但我们定义 \(h^a\) 使得 \(\|\hat\beta\|_{h^a}\asymp\|\hat u\|_{H^{a,a/2}}\)，且由于 \(a\ge6\) 有 \(\|\hat u\|_{H^{6,3}}\le\|\hat u\|_{H^{a,a/2}}\)。我们又知道 \(u_{\theta,L}\in H^{6,3}\) 且 \(\|u_{\theta,L}\|_{H^{6,3}}\le U=U(B)\)，因此我们知道

$$
P^N_\theta\big(\|\hat u-u_{\theta,L}\|^2_{H^{6,3}}\le2c+2U^2\big)\ge1-\frac12e^{-KN\delta_N^2}.\tag{42}
$$

在该事件上，由 \(H^{6,3}\) 的 Sobolev 刻画，我们得到 \(\hat u-u_{\theta,L}\in H^3([0,1],L^2(\Omega))\)，且 \(\|\hat u-u_{\theta,L}\|_{H^3_tL^2_x}\le c_0\)，其中 \(c_0\) 只通过 \(U\) 依赖于 \(u_\theta\)。然后由 Evans §5.9.2 的定理 3，这意味着函数

$$
t\mapsto\|\hat u-u_{\theta,L}(t,\cdot)\|^2_{L^2(\Omega)}
$$

是 \(C^2([0,1])\) 的，其范数只依赖于 \(c\) 与 \(U\)。现在考虑引理 C.3，但取 \(g=\hat u-u_{\theta,L}\)。于是合并 (41) 与 (42)，我们得到

$$
P^N_\theta\Big(\|\hat u-u_{\theta,L}\|^2_{L^2([0,1]\times\Omega)}\le2\|\hat u-u_{\theta,L}\|^2_{(N)}+\frac{c}{T^2}\Big)\ge1-e^{-KN\delta_N^2},
$$

即所需结论。\(\square\)

### C.3 第 3 节的证明

#### C.3.1 引理 3.2 的证明

**证明。**（证明概述）我们所定义的映射 \(D\mathcal{G}\) 对任意 \((D,u)\in C^1(\Omega)\times F\) 都是连续且线性的。我们可以写出

$$
\mathcal{G}(D+h,u+v)-\mathcal{G}(D,u)-D\mathcal{G}(D,u)[h,v]=\big(-\nabla\cdot(h\nabla v)-(f(u+v)-f(u)-f'(u)v),0\big),
$$

于是只需证明右端为 \(o(\|h\|_{C^1}+\|v\|_F)\)。现在我们有

$$
\|\nabla\cdot(h\nabla v)\|_{L^2(Q)}\le\|\nabla h\cdot\nabla v\|_{L^2}+\|h\Delta v\|_{L^2}\le d\|h\|_{C^1}\|v\|_{L^2_tH^1_x}+d\|h\|_\infty\|v\|_{L^2_tH^2_x}\le2d\|h\|_{C^1}\|v\|_F\le d(\|h\|_{C^1}+\|v\|_F)^2,
$$

这就界定了和式中的第一项。其次，注意对 \(f\) 应用 Taylor 定理，对每个 \((t,x)\in Q\) 存在某个值 \(\xi(u,v)=\xi(u(t,x),v(t,x))\) 使得

$$
f(u+v)=f(u)+f'(u)v+\frac12f''(\xi(u,v))v^2.
$$

因此（同时使用 \(d\le4\) 时 \(H^1(\Omega)\hookrightarrow L^4(\Omega)\) 这一事实）有

$$
\|f(u+v)-f(u)-f'(u)v\|^2_{L^2(Q)}=\int_Q\frac14f''(\xi)^2v^4\,dtdx\le\frac14\|f''\|^2_\infty\int_0^1\|v\|^4_{L^4}\,dt\le C\int_0^1\|v\|^4_{H^1}\,dt\le C\|v\|^4_{C([0,1],H^1(\Omega))}.
$$

于是，由于 \(F\hookrightarrow C([0,1],H^1(\Omega))\)，我们有

$$
\|f(u+v)-f(u)-f'(u)v\|_{L^2(Q)}\le C\|v\|^2_F=o(\|h\|_{C^1}+\|v\|_F).
$$

\(\square\)

#### C.3.2 命题 3.4 的证明

**证明。**（证明概述）第一部分由命题 3.4 之前的注记得出。其次，由 Banach 空间中 Fréchet 导数的微积分基本定理（例如见 Liu 与 Röckner (2015) 命题 A.2.3），对 \(D_1,D_2\in\mathcal{U}\) 与 \(D_w=(1-w)D_1+wD_2\) 可以写出

$$
u_{D_2}-u_{D_1}=\int_0^1D\mathcal{G}(D_w)[D_2-D_1]\,dw,
$$

其中积分在 \(F\) 中收敛，从而也在 \(L^\infty_tL^2_x\) 中收敛。于是由三角不等式，

$$
\|u_{D_2}-u_{D_1}\|_{L^\infty_tL^2_x}\le\int_0^1\|D\mathcal{G}(D_w)[D_2-D_1]\|_{L^\infty_tL^2_x}.
$$

但现在由命题 E.2 与 \(L^2_tH^1_x\cap H^1_tH^{-1}_x\hookrightarrow C([0,1],L^2(\Omega))\)（Evans (1998) §5.9 定理 3），可以估计

$$
\|D\mathcal{G}(D_w)[D_2-D_1]\|_{L^\infty_tL^2_x}\lesssim\|\nabla\cdot([D_2-D_1]\nabla u_{D_w})\|_{L^2_tH^{-1}_x}\le\|\nabla u_{D_w}\|_{L^\infty(Q)}\|D_2-D_1\|_{L^2(Q)}.
$$

但现在我们应用命题 3.1；由于 \(\beta>d/2+1\) 且 \(\nabla u\in H^{\beta,\beta/2}\)，由命题 2.9 得 \(\nabla u\in L^\infty(Q)\)。注意该上界关于 \(w\) 是一致的，因为 \(\|D_w\|_{C^1}\le U\) 且 \(D_1,D_2\) 与 \(D_w\) 的 \(D_{\min}\) 相同。因此

$$
\|u_{D_2}-u_{D_1}\|_{L^\infty_tL^2_x}\lesssim\|D_2-D_1\|_{L^2(Q)}.
$$

\(\square\)

#### C.3.3 引理 3.8 的证明

**证明。**（证明概述）(b) 的证明与 Nickl (2023) §2.1.2.1 中相同，只需注意我们可以把 \(h\) 用 \(0\) 延拓为 \(H^1(\Omega)\) 函数，并使用周期散度定理。(a) 的证明使用 Alberti 等 (2025) 引理 3.7 的一个变体。首先注意第二个不等式是 Hölder 不等式的应用。又记 \(u\) 为 \(u_{D_1}\)。对任意 \(t\in[0,1]\)，由 Alberti 等 (2025) 引理 3.6 有

$$
\|\nabla\cdot(h\nabla u(t,\cdot))\|_{L^2(\Omega)}\ge\|\nabla\cdot(|h|\nabla u(t,\cdot))\|_{L^2(\Omega)}.
$$

由命题 3.1 我们有 \(\|u\|_{H^{\beta+1,(\beta+1)/2}}\le C(M,D_{\min},\beta,d,f)\)。现在使用 \(L^2\) 范数的对偶刻画：

$$
C\|\nabla\cdot(|h|\nabla u(t,\cdot))\|_{L^2(\Omega)}\ge\sup_{\|v\|_{L^2(\Omega)}\le C}\int_\Omega v\nabla\cdot(|h|\nabla u(t,\cdot))\,dx.
$$

于是取 \(v=-u\) 并使用散度定理得

$$
\sup_{\|v\|_{L^2(\Omega)}\le C}\int_\Omega v\nabla\cdot(|h|\nabla u(t,\cdot))\,dx\ge\int_\Omega|h|\,|\nabla u(t,\cdot)|^2\,dx.
$$

把这一串不等式合在一起，并对时间积分（注意 \(h\) 不依赖于时间）即得结论。\(\square\)

#### C.3.4 命题 3.9 的证明

**证明。**（证明概述）我们对 (27) 中定义的 \(\mathcal{G}\) 采用 Castre 与 Nickl (2026) §2.2.2 的想法，得到

$$
\int_0^1\big(-\nabla\cdot([D_1-D_2]\nabla u_{D_1}),0\big)\,dw=-\int_0^1\Big(\frac{\partial}{\partial t}[u_1-u_2]-\nabla\cdot(D_2\nabla(u_1-u_2))-f'(\mathcal{G}_w)(u_1-u_2),0\Big)\,dw,
$$

其中 \(u_i=G(D_i)\)，\(\mathcal{G}_w=(1-w)u_1+wu_2\)。于是对两边取 \(L^2(Q)\) 范数，并利用右端 \(\lesssim\|u_1-u_2\|_{H^{2,1}}\)，我们得到

$$
\|\nabla\cdot([D_1-D_2]\nabla u_{D_1})\|_{L^2(Q)}\lesssim\|u_1-u_2\|_{H^{2,1}}.
$$

现在，若条件 3.5 成立，则由引理 3.8（取 \(h=D_1-D_2\)）有

$$
\|D_1-D_2\|_{L^1(\Omega)}\lesssim\|\nabla\cdot([D_1-D_2]\nabla u_{D_1})\|_{L^2(Q)}.
$$

为完成证明，我们使用如下插值不等式[^4]：

$$
\|u_1-u_2\|_{H^{2,1}}\le\|u_1-u_2\|^{\frac{\beta-1}{\beta+1}}_{L^2}\|u_1-u_2\|^{\frac{2}{\beta+1}}_{H^{\beta+1,(\beta+1)/2}},
$$
$$
\|D_1-D_2\|_{L^2}\lesssim\|D_1-D_2\|^{\frac{\beta}{\beta+d/2+1}}_{H^{-d/2-1}}\|D_1-D_2\|^{\frac{d/2+1}{\beta+d/2+1}}_{H^\beta}\lesssim\|D_1-D_2\|^{\frac{\beta}{\beta+d/2+1}}_{L^1}.
$$

[^4]: 对 \(H^{\beta,\beta/2}\) 空间之间的插值，这可由序列空间的 Hölder 不等式得到；对 Sobolev 空间见 Lion 与 Magenes (1972) 第 44 页。

若条件 3.6 成立，我们同样可由引理 3.8 与插值完成证明。\(\square\)

#### C.3.5 命题 3.13 的证明

**证明。**（证明概述）设 \(u_i=u_{\theta_i}\)，\(w=u_1-u_2\)。由两方程相减可知 \(w\) 满足

$$
(\nu_1-\nu_2)Au_2=-B(w,u_1)-B(u_2,w)-\nu_1Aw-\frac{dw}{dt},\qquad w(0)=\varphi_1-\varphi_2.
$$

对两边取 \(L^2(Q)\) 范数，由双线性项的标准估计（见 Konen 与 Nickl (2025) 命题 3.1.iii）可知右端被 \(\|w\|_{H^{2,1}}\) 的常数倍控制。在左端我们应用引理 3.14，最终得到

$$
|\nu_1-\nu_2|\le C(M,d,\nu_{\min},f)\|w\|_{H^{2,1}}.
$$

由 Evans (1998) §5.9.2 定理 3，我们有

$$
\|\varphi_1-\varphi_2\|_{L^2(\Omega)}\le\sup_{t\in[0,1]}\|w(t)\|_{L^2(\Omega)}\lesssim\|w\|_{H^{2,1}}.
$$

现在插值即得结论。\(\square\)

#### C.3.6 引理 3.14 的证明

**证明。**（证明概述）其想法是：若 \(Au\) 一开始有下界，则积分就有下界；而当 \(Au\) 足够小时，方程动力学迫使 \(u\) 沿 \(f\) 的方向增长。

我们首先用驱动力函数 \(f\) 检验 (8)，得到

$$
\frac{d}{dt}\big[\langle u_\theta,f\rangle\big]=\|f\|^2-\nu\langle Au,f\rangle-\langle B(u,u),f\rangle.
$$

重排此式，并应用 Cauchy–Schwarz 与关于双线性形式的常用界，得到

$$
\|f\|^2_{L^2}\le\frac{d}{dt}\big[\langle u_\theta,f\rangle\big]+C\big(\|u_\theta\|_{H^1}+\|u_\theta\|^2_{H^1}\big)\|f\|_{H^1}\qquad\text{在 }[0,1]\text{ 上}.
$$

把该式从 \(s\) 积分到 \(t\)（\(0\le s\le t\le1\)）得到

$$
(t-s)\|f\|^2_{L^2}\le\langle u_\theta(t),f\rangle_{L^2}-\langle u_\theta(s),f\rangle_{L^2}+C\|f\|_{H^1}\int_s^t\Big(\|u_\theta\|_{H^1}+\|u_\theta\|^2_{H^1}\Big)\le\|f\|_{L^2}\|u_\theta(t)\|_{L^2}+\|f\|_{L^2}\|u_\theta(s)\|_{L^2}+C\|f\|_{H^1}\int_s^t\Big(\|u_\theta\|_{H^1}+\|u_\theta\|^2_{H^1}\Big).
$$

现在把 \(s\) 从 \(0\) 积分到 \(t\)，得到

$$
\frac{t^2}{2}\|f\|^2_{L^2}\le t\|f\|_{L^2}\|u_\theta(t)\|_{L^2}+\|f\|_{L^2}\int_0^t\|u_\theta(s)\|_{L^2}\,ds\tag{43}
$$
$$
+C\|f\|_{H^1}\int_0^t ds\int_s^t\Big(\|u_\theta(\tau)\|_{H^1}+\|u_\theta(\tau)\|^2_{H^1}\Big)d\tau.\tag{44}
$$

若考察 (44) 的积分区域，可见它是对一切满足 \(0\le s\le\tau\le t\) 的 \(\tau\) 与 \(s\) 积分。于是我们可以把它改写为积分

$$
\int_0^tds\int_s^t\Big(\|u_\theta(\tau)\|_{H^1}+\|u_\theta(\tau)\|^2_{H^1}\Big)d\tau=\int_0^td\tau\int_0^\tau ds\Big(\|u_\theta(\tau)\|_{H^1}+\|u_\theta(\tau)\|^2_{H^1}\Big)=\int_0^t\tau\Big(\|u_\theta(\tau)\|_{H^1}+\|u_\theta(\tau)\|^2_{H^1}\Big)d\tau\le t\int_0^t\Big(\|u_\theta(\tau)\|_{H^1}+\|u_\theta(\tau)\|^2_{H^1}\Big)d\tau.
$$

回到 (43)，使用 \(\|f\|_{L^2}\lesssim\|f\|_{H^1}\) 与 \(t\in[0,1]\)，得到

$$
\frac{t^2}{2}\frac{\|f\|^2_{L^2}}{\|f\|_{H^1}}\le C\Big(t\|u_\theta(t)\|_{H^1}+t\int_0^1\|u_\theta(s)\|^2_{H^1}\,ds+(1+t)\int_0^1\|u_\theta\|_{H^1}\,ds\Big),
$$

然后把它再从 \(0\) 到 \(1\) 积分，并使用 Cauchy–Schwarz 与 Poincaré 不等式即得结论。\(\square\)

### C.4 定理 A.1 的证明

**证明。**（证明概述）由 Ghosal 与 van der Vaart (2017) 引理 8.21 我们知道

$$
P^N_{\theta_0}\Big(\int_\Theta\frac{p^N_\theta}{p^N_{\theta_0}}\,d\Pi_N(\theta)\le\Pi_N(\mathrm{B}_N)e^{-2N\varepsilon_N^2}\Big)\le\frac{1}{N\varepsilon_N^2}.
$$

因此若考虑事件

$$
A_N=\Big\{\int_\Theta\frac{p^N_\theta}{p^N_{\theta_0}}\,d\Pi_N(\theta)\ge e^{-(A+2)N\varepsilon_N^2}\Big\},
$$

则我们看到 \(P^N_{\theta_0}(A_N)\to1\)，当 \(N\to\infty\)。现在考虑

$$
\bar\Theta_N=\Theta_N\cap\{C\delta_N\ge\|G(\theta)-G(\theta_0)\|_{L^2}\}.
$$

则由后验的定义与 (32)，我们有

$$
\begin{aligned}
P^N_{\theta_0}\big(\Pi(\bar\Theta_N^c|\mathcal{D}_N)\ge e^{-bN\varepsilon_N^2}\big)
&=P^N_{\theta_0}\Bigg(\frac{\int_{\bar\Theta_N^c}p^N_\theta/p^N_{\theta_0}\,d\Pi(\theta)}{\int_\Theta p^N_\theta/p^N_{\theta_0}\,d\Pi(\theta)}\ge e^{-bN\varepsilon_N^2},\ \phi_N=0,\ A_N\Bigg)+o(1)\\
&\le P^N_{\theta_0}\Big(\int_{\bar\Theta_N^c}p^N_\theta/p^N_{\theta_0}\,d\Pi(\theta)\,(1-\phi_N)\ge e^{-(b+A+2)N\varepsilon_N^2}\Big)+o(1).
\end{aligned}\tag{45}
$$

由 Markov 不等式与 Fubini 定理，我们可以把 (45) 界定为

$$
e^{(b+A+2)N\varepsilon_N^2}\int_{\bar\Theta_N^c}\mathbb{E}^N_{\theta_0}\Big[\frac{p^N_\theta}{p^N_{\theta_0}}(1-\phi_N)\Big]d\Pi(\theta)\le e^{(b+A+2)N\varepsilon_N^2}\int_{\bar\Theta_N^c}\mathbb{E}^N_\theta\big[(1-\phi_N)\big]\,d\Pi(\theta).
$$

现在，利用 \(\bar\Theta_N^c=\Theta_N^c\cup\{\|G(\theta)-G(\theta_0)\|_{L^2}>C\delta_N\}\) 与第二类错误的界 (32)，得到

$$
(45)\le e^{(b+A+2)N\varepsilon_N^2}\Big(2\Pi(\Theta_N^c)+\int_{\Theta_N\cap\{C\delta_N<\|G(\theta)-G(\theta_0)\|_{L^2}\}}\mathbb{E}^N_\theta[1-\phi_N]\,d\Pi(\theta)\Big)\lesssim e^{(b+A+2-B)N\varepsilon_N^2}+e^{(b+A+2-K)N\varepsilon_N^2}\to0,
$$

当 \(N\to\infty\)。\(\square\)

### C.5 附录 B 的证明

#### C.5.1 引理 B.2 的证明

**证明。**（证明概述）首先我们证明所有临界点都必须以某个速率离开其原始位置。对 \(\alpha>d/2+5\)，以下计算是合法的。对 (4) 取梯度，我们得到

$$
\nabla u_t=\nabla(\nabla\cdot(D\nabla u))+f'(u)\nabla u=\nabla D\Delta u+D\nabla\Delta u+\nabla^2u\nabla D+\nabla^2D\nabla u+f'(u)\nabla u,
$$

但若在 \(\varphi\) 的临界点 \(x^*\in\Omega\) 处取值 \((0,x^*)\)，则 \(\nabla\varphi(x^*)=0\)，故最后两项相消，于是

$$
\nabla u_t(0,x^*)=\nabla D\Delta\varphi+D\nabla\Delta\varphi+\nabla^2\varphi\nabla D.
$$

因此由 (34) 得 \(|(d/dt)\nabla u(0,x^*)|\ge\delta\)，特别地存在某个 \(i=1,\ldots,d\) 使 \(|\partial_t\partial_iu(0,x^*)|\ge\delta/d\)。现在使用命题 3.1，我们看到

$$
\|\nabla u(\cdot,x^*)\|_{C^2([0,1])}\le C\|u\|_{H^{\alpha+1,an}}\le C(M,d,\alpha,D_{\min},f).
$$

现在由中值定理，存在某个 \(0<\tilde t<t\) 使得

$$
t\partial_t\partial_iu(\tilde t,x^*)=\partial_iu(t,x^*)-\partial_iu(0,x^*)=\partial_iu(t,x^*).
$$

于是 \(|\partial_t\partial_iu(\tilde t,x^*)-\partial_t\partial_iu(0,x^*)|\le t\|\nabla u(\cdot,x^*)\|_{C^2}\le tC(M)\)，从而对 \(t<C(M)^{-1}\delta/(2d)\) 有

$$
|\nabla u(t,x^*)|\ge|\partial_iu(t,x^*)|=t|\partial_t\partial_iu(\tilde t,x^*)|\ge t\frac{\delta}{2d},
$$

所以若固定某个 \(C(M)^{-1}\delta/(2d)>t^*>0\)（只依赖于 \(\delta,M,d\)），则对一切 \(t^*<t<C(M)^{-1}\delta/(2d)\) 有

$$
|\nabla u(t,x^*)|>c(\delta,d,M).
$$

现在，利用 \(\nabla u\) 的 Lipschitz 常数被某个依赖于 \(M,d,D_{\min},\alpha,f\) 的常数控制这一事实，我们看到存在某个 \(\eta=\eta(\delta,d,M,D_{\min},\alpha,f)\)，使得对一切 \(t^*<t<C(M)^{-1}\delta/(2d)\) 与 \(|x-x^*|<\eta\) 有

$$
|\nabla u(t,x)|>c(\delta,d,M)/2.
$$

然后我们在时间上积分，得到

$$
\int_0^1|\nabla u(t,x)|^2\,dt\ge c_1>0\tag{46}
$$

对任何与某临界点 \(x^*\) 距离在 \(\eta\) 以内的 \(x\) 成立。现在，若令

$$
R=\{x\in\Omega:\text{对一切临界点 }x^*,\ |x-x^*|\ge\eta/2\},
$$

则我们知道 \(|\nabla\varphi|>0\) 在 \(R\) 上成立，且 \(R\) 是紧集，故 \(|\nabla\varphi|\) 在 \(R\) 上有一致下界。于是，利用 \(\nabla u\) 的 Lipschitz 常数，我们得到存在常数 \(c_2=c_2(M,d,D_{\min},\alpha,f)\) 使得

$$
\int_0^1|\nabla u(t,x)|^2\,dt\ge c_2>0\qquad\text{对一切 }x\in R.\tag{47}
$$

而把 (46) 与 (47) 合并即验证了条件 3.5，其中 \(c_0=\min(c_1,c_2)\)。\(\square\)

#### C.5.2 命题 B.3 的证明

**证明。**（证明概述）注意由三角不等式、\(D\ge D_{\min}\) 与 \(\|\nabla D\|\le M\)，我们有

$$
|D\nabla(\Delta\varphi)+\Delta\varphi\nabla D+\nabla^2\varphi\nabla D|\ge|D||\nabla(\Delta\varphi)|-|\Delta\varphi||\nabla D|-\|\nabla^2\varphi\||\nabla D|\ge D_{\min}|\nabla(\Delta\varphi)|-M(|\Delta\varphi|+\|\nabla^2\varphi\|),\tag{48}
$$

其中 \(\|\nabla^2\varphi\|\) 是算子范数。其想法是构造一个二阶导数温和、但三阶导数很大的函数。我们寻找形如

$$
\varphi(x)=\sum_{i=1}^dg(x_i)
$$

的函数。于是我们算出

$$
\nabla\varphi(x)=(g'(x_1),\ldots,g'(x_d)),\quad \nabla^2\varphi(x)=\mathrm{diag}(g''(x_1),\ldots,g''(x_d)),\quad \Delta\varphi(x)=\sum_{i=1}^dg''(x_i),\quad \nabla\Delta\varphi(x)=(g'''(x_1),\ldots,g'''(x_d)).\tag{49}
$$

于是我们得到界

$$
(48)\ge D_{\min}|\nabla\Delta\varphi|-2dM\|g''\|_\infty,\tag{50}
$$

它需要在 \(\varphi\) 的每个临界点处大于某个 \(\delta\)。现在考虑函数

$$
g_n:\mathbb{T}\to\mathbb{R},\qquad g_n(x)=-\frac{1}{2\pi n^2}\cos(2\pi nx)+\frac{1}{4\pi n^2}\sin(4\pi nx).
$$

于是

$$
g'_n(x)=\frac1n\sin(2\pi nx)+\frac1n\cos(4\pi nx).
$$

然后使用倍角公式，我们看到 \(g'_n(x_c)=0\) 当且仅当

$$
0=\sin(2\pi nx_c)+1-2\sin^2(2\pi nx_c)=(1+2\sin(2\pi nx_c))(1-\sin(2\pi nx_c)),
$$

因此令 \(C_n\) 为 \(\mathbb{T}\) 上使 \(\sin(2\pi nx_c)=-1/2\) 或 \(1\) 的点集。其次注意

$$
|g''_n(x)|=|2\pi\cos(2\pi nx)-4\pi\sin(4\pi nx)|\le6\pi,
$$

故 \(\|g''\|_\infty\le6\pi\)。最后我们有

$$
g'''_n(x)=-4\pi^2n\sin(2\pi nx)-16\pi^2n\cos(4\pi nx).
$$

现在，在任意临界点处有 \(\sin(2\pi nx_c)=1/2\) 或 \(-1\)。但

$$
\sin(2\pi nx_c)=-\frac12\ \Longrightarrow\ \cos(4\pi nx_c)=\frac12,\qquad \sin(2\pi nx_c)=1\ \Longrightarrow\ \cos(4\pi nx_c)=-1.
$$

因此 \(g'''_n(x_c)=-6\pi^2n\) 或 \(12\pi^2n\)。现在固定足够大的 \(n\) 使

$$
6\pi^2nD_{\min}\sqrt d-12dM\pi>1,
$$

注意 \(n\) 只依赖于 \(M,D_{\min}\) 与 \(d\)。于是由 (49) 可见，取 \(g=g_n\) 时 \(\varphi\) 的临界点为 \((C_n)^d\subseteq\Omega\)，因此对 \(x_c\in(C_n)^d\) 有

$$
|\nabla\Delta\varphi(x_c)|\ge6\pi^2n\sqrt d,
$$

故由 (50) 即得结论。\(\square\)

#### C.5.3 命题 B.5 的证明

**证明。**（证明概述）我们将利用引理 B.2 证明：使条件 3.5 对某个 \(c_0\) 成立的 \(\varphi\) 的集合包含一个开稠密集。首先，置 \(L_D(\varphi)=D\nabla(\Delta\varphi)+\Delta\varphi\nabla D+\nabla^2\varphi\nabla D\)。然后令 \(G\) 为集合

$$
G=\{\varphi\in C^k(\Omega):\nexists\,x^*\in\Omega\ \text{使在 }x^*\text{ 处}\ \nabla\varphi=0\ \text{且}\ L_D(\varphi)=0\}.
$$

首先我们证明 \(G^c\) 是闭集。假定 \(\varphi_n\in G^c\) 且 \(\varphi_n\to\varphi\) 于 \(C^k\)。则 \(\varphi_n\to\varphi\) 于 \(C^3\)。同时存在 \(x_n\in\Omega\) 使得

$$
\nabla\varphi_n(x_n)=0\qquad\text{且}\qquad L_D(\varphi_n)(x_n)=0.
$$

但由于 \(\Omega\) 紧，存在子列 \(n_k\) 使得 \(x_{n_k}\to x\)（对某个 \(x\in\Omega\)）。又由于 \(\varphi_n\to\varphi\) 且 \(L_D(\varphi_n)\to L_D(\varphi)\) 当 \(n\to\infty\) 时一致收敛，我们有

$$
\nabla\varphi(x)=0\qquad\text{且}\qquad L_D(\varphi)(x)=0,
$$

故 \(\varphi\in G^c\)，从而 \(G\) 是开集。下面证明 \(G\) 稠密。首先设 \(\varphi\in C^k\)、\(\epsilon>0\)。则由 Hirsch (1976) 定理 6.1.2，存在某个 \(\tilde\varphi\in C^k\) 使得 \(\|\varphi-\tilde\varphi\|_{C^k}<\epsilon/2\) 且 \(\tilde\varphi\) 是 Morse 函数，即具有孤立临界点，且所有临界点都非退化。由于 \(\Omega\) 紧，这样的临界点只能有有限个。

设 \(x_1,\ldots,x_m\) 为使

$$
\nabla\tilde\varphi(x_i)=0\qquad\text{且}\qquad L_D(\tilde\varphi)(x_i)=0
$$

的点集。现在，由平移与命题 B.3，我们知道存在 \(g_i\in C^\infty\) 使得

$$
\nabla g_i(x_i)=0\qquad\text{且}\qquad L_D(g_i)(x_i)\ne0.\tag{51}
$$

通过乘以在 \(x_i\) 的某邻域上 \(\equiv1\)、在其余所有临界点附近 \(\equiv0\) 的截断函数，我们还可以假定每个 \(g_i\) 的支撑只包含 \(\tilde\varphi\) 的单个临界点（即 \(x_i\)）。然后考虑函数

$$
\hat\varphi=\tilde\varphi+\eta\sum_{i=1}^mg_i
$$

其中 \(\eta\) 足够小。已知 Morse 函数的足够小扰动不会改变其临界点的个数[^5]，但我们选取的 \(g_i\) 使得 \(\tilde\varphi\) 的任何临界点也是 \(\hat\varphi\) 的临界点，因此当 \(\eta\) 足够小时 \(\hat\varphi\) 的临界点与 \(\tilde\varphi\) 的相同。于是 (51) 保证 \(\hat\varphi\in G\)。\(\square\)

[^5]: 该事实是记录叠层定理（Stack of records theorem，Guillemin 与 Pollack (1974) 习题 1.4.7）应用于 \(F:\Omega\times S^1\to\mathbb{R}^d\times S^1\)（由 \(F(x,t)=(\nabla(\tilde\varphi+\sin(2\pi t)g)(x),t)\) 给出）的推论。

## 附录 D：抛物型 Sobolev 空间的小波刻画

### D.1 小波的基本事实

我们将回顾若干必要的小波事实以建立记号。该材料的参考见 Giné 与 Nickl (2016) §4.1 至 §4.3。首先回忆**边界修正小波**，它由 Cohen 等 (1993) 首次引入，用于度量 \([0,1]\) 上函数的正则性。

固定 \(S\in\mathbb{N}\)，取任意足够大的 \(L=L(S)\) 使得 \(2^{-L}(2S-1)\le1\)，这里 \(L\) 称为该基的**基础分辨率**。则（在某层级 \(l\ge L\) 处的）**边界修正尺度函数**是集合

$$
\{\phi^{bc}_{lk}:k=1,\ldots,2^l\},
$$

其中当 \(k=S+1,S+2,\ldots,2^l-S\) 时，\(\phi^{bc}_{lk}(x)=2^{l/2}\phi(2^lx-k)\)，其中 \(\phi\) 是 \(S\)-正则 Daubechies 尺度函数。对其他的 \(k\) 值则引入边界修正，细节见 Cohen 等 (1993)。我们记录如下性质：

1. 集合 \(\{\phi^{bc}_{lk}:k=1,\ldots,2^l\}\) 正交规范；
2. 这 \(2^l\) 个函数 \(\{\phi^{bc}_{lk}\}\) 的线性张成（记作 \(V^{bc}_l\)）包含所有次数 \(\le S-1\) 的多项式；
3. 对一切 \(l\ge L\) 有 \(V^{bc}_l\subset V^{bc}_{l+1}\)，且 \(\bigcup_{l\ge L}V^{bc}_l\) 在 \(L^2([0,1])\) 中稠密（原文此处印作 \(V^{an}_l\)，按上下文应为 \(V^{bc}_l\)），
4. 对 \(k=1,\ldots,S\)，\(\mathrm{supp}\,\phi^{bc}_{lk}\subseteq[0,2^{-l}(S+k)]\)，且
5. 对 \(k=2^l-S+1,\ldots,2^l\)，\(\mathrm{supp}\,\phi^{bc}_{lk}\subseteq[2^{-l}(k-S+1),1]\)。

并且可以构造进一步的**边界修正小波**

$$
\{\psi^{bc}_{lk}:k=1,\ldots,2^l\},
$$

其中当 \(k=S+1,\ldots,2^l-S\) 时，\(\psi^{bc}_{lk}(x)=2^{l/2}\psi(2^lx-k)\)，\(\psi\) 是 \(S\)-正则 Daubechies 小波，且下列性质成立：

1. 令 \(W^{bc}_l\) 为 \(V^{bc}_l\) 在 \(V^{bc}_{l+1}\) 中的正交补，其维数为 \(2^l\)。则 \(\{\psi^{bc}:k=0,\ldots,2^l-1\}\) 是 \(W^{bc}_l\) 的一组正交规范基。
2. 如下标度性质成立：

$$
\psi^{bc}_{lk}(x)=2^{(l-L)/2}\psi_{Lk}(2^{l-L}x)\qquad\text{对 }k=1,\ldots,S,
$$
$$
\psi^{bc}_{lk}(x)=2^{(l-L)/2}\psi_{L,k+2^L-2^l}\big(2^{l-L}(x-1)+1\big)\qquad\text{对 }k=2^l-S+1,\ldots,2^l,
$$

3. 对 \(k=1,\ldots,S\)，\(\mathrm{supp}\,\psi^{bc}_{lk}\subseteq[0,2^{-l}(S+k)]\)，
4. 对 \(k=2^l-S+1,\ldots,2^l\)，\(\mathrm{supp}\,\psi^{bc}_{lk}\subseteq[2^{-l}(k-S+1),1]\)，
5. 对一切 \(j=0,\ldots,S-1\)，

$$
\int_0^1\psi^{bc}_{lk}(x)x^j\,dx=0.\tag{52}
$$

由此照例我们有

$$
\{\phi^{bc}_{Lk}:k=1,\ldots,2^L\}\cup\bigcup_{l\ge L}\{\psi^{bc}_{lk}:k=1,\ldots,2^l\}
$$

是 \(L^2([0,1])\) 的一组正交规范基。接下来，我们为 \(\Omega=\mathbb{T}^d\) 上的小波建立记号。对 \(l\in\mathbb{N}\) 与 \(k\in[2^{dl}]\)，我们把 \(\mathbb{R}^d\) 上的周期 Meyer 尺度函数写作 \(\Phi_{lk}\)，并令

$$
\mathcal{V}_l=\mathrm{span}(\Phi_{lk}:k\in[2^{dl}]).
$$

照例我们还有相应的周期 Meyer 小波，写作 \(\Psi_{lk}\)（\(k\in[2^{d(l+1)}-2^{dl}]\)），以及

$$
\mathcal{W}_j=\mathcal{V}_{j+1}\cap\mathcal{V}_j^\perp,
$$

其中 \(\{\Psi_{lk}:k\in[2^{d(l+1)}-2^{dl}]\}\) 构成 \(\mathcal{W}_l\) 的一组正交规范基。

### D.2 抛物型 Sobolev 空间的小波刻画

**定义 D.1。** 对 \(s>0\)，固定光滑度 \(S\) 使 \(\phi^{bc}_{lk},\psi^{bc}_{lk}\in C^r\)，其中自然数 \(r>s\)。我们定义 Besov 空间

$$
B^{s,an}_{pq}=\{f\in L^p([0,1]\times\Omega):\|f\|_{B^{s,an}_{pq}}<\infty\},
$$

其中

$$
\|f\|_{B^{s,an}_{pq}}=\Bigg(\sum_{j=L_0-1}^\infty2^{qj\big(s+\frac{d+2}{2}-\frac{d+2}{p}\big)}\Big(\sum_{\substack{\mathbb{L}(l)=j\\ k\in\mathcal{K}(l)}}|\langle f,\Psi^{an}_{lk}\rangle|^p\Big)^{q/p}\Bigg)^{1/q},
$$

并当 \(p\) 或 \(q=\infty\) 时作通常的调整。在 \(p=q=2\) 的特殊情形，我们注意

$$
B^{s,an}_{22}=H^{s,an}.
$$

该定义对 \(s=0\)、\(p=\infty\) 与 \(q=1\) 也有效。

我们引入一些在处理这些空间时有帮助的术语：

**定义 D.2。** 设 \(p\in[1,\infty]\)。若除有限多个指标 \(l,k\) 之外，\(\langle f,\Psi^{an}_{lk}\rangle=0\)，则称 \(f\in L^p(Q)\) 具有**有限小波支撑**。

**命题 D.3。** Besov 空间之间通常的嵌入关系成立，其中有效维数为 \(d+2\)。例如，若 \(s>(d+2)(1/p-1/r)\)，且 \(1\le p,r\le\infty\)，则

$$
B^{s,an}_{pq}\hookrightarrow L^r([0,1]\times\Omega).
$$

**证明。**（证明概述）我们只用到 \(p=q=2\)、\(s>(d+2)/2\) 以及 \(p=\infty\)、\(q=1\)、\(s=0\) 的情形，故这里只证明这些情形。各向异性在 \(\mathbb{R}^n\) 空间上的情形见 Triebel (2006) §5.3.2。假定 \(u\in H^{s,s/2}\)（\(s>(d+2)/2\)）具有有限小波支撑。则可以把 \(u\) 写成

$$
u(t,x)=\sum_{j\ge L_0}\sum_{(\iota,l),k}\langle u,\Psi^{\iota,an}_{lk}\rangle\Psi^{\iota,an}_{lk}(t,x),
$$

并记 \(u_j\) 为 \(u\) 在 \(W_{j-1}\) 上的投影（\(j>L_0\)），而当 \(j=L_0\) 时为在 \(V_{L_0}\) 上的投影。用 Cauchy–Schwarz 得到

$$
|u(t,x)|\le\sum_{j\ge L_0}\sum_{(\iota,l),k}|\langle u,\Psi^{\iota,an}_{lk}\rangle||\Psi^{\iota,an}_{lk}(t,x)|\le\sum_{j\ge L_0}\|u_j\|_{L^2}\Big(\sum_{(\iota,l),k}|\Psi^{\iota,an}_{lk}(t,x)|^2\Big)^{1/2}.
$$

现在，由标准小波理论可以证明

$$
\sum_{(\iota,l),k}|\Psi^{\iota,an}_{lk}(t,x)|^2=O(2^{(d+2)j}),
$$

于是再次由 Cauchy–Schwarz 有

$$
|u(t,x)|\le\sum_{j\ge L_0}2^{(d+2)j/2}\|u_j\|_{L^2}\le\Big(\sum_{j\ge L_0}2^{(d+2-2s)j}\Big)^{1/2}\Big(\sum_{j\ge L_0}2^{2js}\|u_j\|^2_{L^2}\Big)^{1/2}=C\|u\|_{H^{s,s/2}},
$$

再用通常的延拓论证即得结论。对 \(s=0\)、\(p=\infty\)、\(q=1\) 的情形证明类似。\(\square\)

**注 D.4。** 由 (21) 可见，的确对 \(W^{an}_j\) 与 \(V^{an}_{L_0-1}\) 的任意基选择都会得到等价的定义。由此我们可以推出：另一种张量基的选择会给出等价的函数空间。事实上，在证明中我们有时需要考虑周期 Meyer 小波的更精细性质。这与 Triebel (2006) 的记号更为接近。本节中我们始终用 \(\phi^{bc}\) 与 \(\psi^{bc}\) 表示边界修正的尺度函数与小波，用 \(\phi\) 与 \(\psi\) 表示周期化 Meyer 尺度函数与小波。

设 \(\mathcal{I}\) 为所有由 \(0\) 与 \(1\) 组成且不全为 \(0\) 的 \(d+1\) 元组构成的集合。接下来定义 \(\mathcal{I}^{an}_j\subseteq\mathcal{I}\times\mathbb{N}^2\)，其中 \(\mathcal{I}_{L_0,an}=\{(0,(2L_0,L_0))\}\)，而对 \(j>L_0\)，我们定义 \((\iota,l)\in\mathcal{I}^{an}_j\) 当且仅当

$$
l_0=2(j-1)\ \text{若 }\iota_0=0;\qquad l_0=2(j-1)\text{ 或 }2j-1\ \text{若 }\iota_0=1;\qquad l_1=j-1.
$$

然后我们通过下式定义另一组基：

$$
\Psi^{\iota,alt}_{lk}(t,x)=\psi^{\iota_t,bc}_{l_tk_t}(t)\Psi^{\iota_x}_{l_xk_x}(x),
$$

其中 \(\psi^{0,bc}=\phi^{bc}\)、\(\psi^{1,bc}=\psi^{bc}\)，\(\Psi^\iota\) 是按 Giné 与 Nickl (2016) §4.3.6 定义的张量化周期小波，\(\iota=(\iota_t,\iota_x)\)，\(k=(k_t,k_x)\in[2^{l_0}]\times[2^{l_1}]^d\equiv\mathcal{K}'(l)\)。于是我们有

$$
W^{an}_j=\mathrm{span}(\Psi^{\iota,alt}_{lk}:(\iota,l)\in\mathcal{I}_{j+1},\ k\in\mathcal{K}'(l)).
$$

因此，利用 (21) 我们看出 \(H^{s,an}\) 的一个等价范数为

$$
\|u\|^2_{H^{s,an}}=\sum_{j=L_0}^\infty2^{2js}\sum_{(\iota,l)\in\mathcal{I}^{an}_j}\sum_{k\in\mathcal{K}'(l)}|\langle u,\Psi^{\iota,alt}_{lk}\rangle|^2,\tag{53}
$$

而本节主要使用这一刻画。

为证明命题 2.7，我们首先需要下面的辅助引理。回忆 \(u_j\) 是由 (21) 给出的到 \(V^{an}_{L_0-1}\) 或 \(W^{an}_j\) 的正交投影。

**引理 D.5。** 设 \(u\in L^2(Q)\) 具有有限小波支撑，\(j\ge L_0\)。则

(a) 对任意 \(i=1,\ldots,d\)，存在不依赖于 \(j\) 与 \(u\) 的常数使得

$$
\Big\|\Big(\frac{\partial u}{\partial x_i}\Big)_j\Big\|^2_{L^2(Q)}\le C2^{2j}\big(\|u_{j-1}\|^2_{L^2(Q)}+\|u_j\|^2_{L^2(Q)}+\|u_{j+1}\|^2_{L^2(Q)}\big),
$$

且

(b) 对任意 \(\alpha\ge2\)，存在不依赖于 \(j,j'\) 与 \(u\) 的常数使得

$$
\Big\|\frac{du}{dt}\Big\|^2_{H^{\alpha-2,an}}\le C\|u\|^2_{H^{\alpha,an}},
$$

其中我们取 \(S=S(\alpha)\) 使边界修正 Daubechies 小波的光滑度足够大。

特别地，若 \(v\in H^{\alpha,an}\)，则

(i) 若 \(\alpha\ge1\)，\(\partial v/\partial x_i\in H^{\alpha-1,an}\)，且

(ii) 若 \(\alpha\ge2\)，\(dv/dt\in H^{\alpha-2,an}\)。

**证明。**（证明概述）我们先证“特别地”部分。对 (i)，注意对满足 \(\partial u/\partial x_i\) 存在的 \(u\in H^{\alpha,an}\)，可以用 (a) 计算

$$
\Big\|\frac{\partial u}{\partial x_i}\Big\|^2_{H^{\alpha-1,an}}=\sum_{j\ge L_0}2^{2j(\alpha-1)}\Big\|\frac{\partial u}{\partial x_i}\Big\|^2_{L^2}\le3C\sum_{j\ge L_0}2^{2j\alpha}\|u_j\|^2_{L^2}=3C\|u\|^2_{H^{\alpha,an}},
$$

而由于此类 \(u\) 在 \(H^{\alpha,an}\) 中稠密，可用通常论证延拓。对 (ii)，同样先取使 \(du/dt\) 存在的 \(u\in H^{\alpha,an}\)，用 (b)，再用通常论证延拓。

首先我们断言

$$
\Big(\frac{\partial u}{\partial x_i}\Big)_j=\Big(\frac{\partial u_{j-1}}{\partial x_i}\Big)_j+\Big(\frac{\partial u_j}{\partial x_i}\Big)_j+\Big(\frac{\partial u_{j+1}}{\partial x_i}\Big)_j.
$$

这是因为

$$
\frac{\partial u}{\partial x_i}=\sum_{j'\ge L_0}\sum_{(\iota,l),k}\langle u,\Psi^{\iota,alt}_{lk}\rangle\frac{\partial\Psi^{\iota,alt}_{lk}}{\partial x_i},
$$

并且我们注意到，对另一些 \((\iota',l')\in\mathcal{I}^{an}_j\) 与 \(k\in\mathcal{K}(l)\)，

$$
\Big\langle\frac{\partial\Psi^{\iota,alt}_{lk}}{\partial x_i},\Psi^{\iota',alt}_{l'k'}\Big\rangle=\langle\psi^{\iota_t,bc}_{l_tk_t},\psi^{\iota'_t,bc}_{l'_tk'_t}\rangle\Big\langle\frac{d\psi^{\iota_i}_{j'-1,k_i}}{dx},\psi^{\iota'_i}_{j-1,k'_i}\Big\rangle\prod_{\substack{m=1\\ m\ne i}}^d\langle\psi^{\iota_m}_{j'-1,k_m},\psi^{\iota'_m}_{j-1,k'_m}\rangle,
$$

于是当 \(|j'-j|>1\) 时该内积为 \(0\)，因为此时 Meyer 小波具有互不相交的 Fourier 支撑，而且乘积中至少有一项取到较高层级的 Meyer 小波。见 Giné 与 Nickl (2016) 定理 4.2.9。因此，为在 \(L^2\) 中界定 \((\partial_iu)_j\)，可界定

$$
\|(\partial_iu)_j\|_{L^2}\le\|(\partial_iu_{j-1})_j\|_{L^2}+\|(\partial_iu_j)_j\|_{L^2}+\|(\partial_iu_{j+1})_j\|_{L^2}\le\|\partial_iu_{j-1}\|_{L^2}+\|\partial_iu_j\|_{L^2}+\|\partial_iu_{j+1}\|_{L^2}.
$$

于是为推出 (a)，只需证明对某个不依赖于 \(j\) 的常数有

$$
\|\partial_iu_j\|^2_{L^2}\le C2^{2j}\|u_j\|^2_{L^2}.
$$

现在考虑如下事实：

$$
\|\partial_iu_j\|^2_{L^2}=\sum_{(\iota,l),(\iota',l')\in\mathcal{I}^{an}_j}\sum_{k,k'}\langle u,\Psi^{\iota,alt}_{lk}\rangle\langle u,\Psi^{\iota',alt}_{l'k'}\rangle\langle\partial_i\Psi^{\iota,alt}_{lk},\partial_i\Psi^{\iota',alt}_{l'k'}\rangle.
$$

于是对 \((\iota,l),(\iota',l')\in\mathcal{I}^{an}_j\) 与 \(k\in\mathcal{K}'(l)\)、\(k'\in\mathcal{K}'(l')\) 考虑

$$
\langle\partial_i\Psi^{\iota,alt}_{lk},\partial_i\Psi^{\iota',alt}_{l'k'}\rangle=\langle\psi^{\iota_t,bc}_{l_tk_t},\psi^{\iota'_t,bc}_{l'_tk'_t}\rangle\Big\langle\frac{d\psi^{\iota_i}_{j-1,k_i}}{dx},\frac{d\psi^{\iota'_i}_{j-1,k'_i}}{dx}\Big\rangle\prod_{\substack{m=1\\ m\ne i}}^d\langle\psi^{\iota_m}_{j-1,k_m},\psi^{\iota'_m}_{j-1,k'_m}\rangle.
$$

它非零只可能在 \((\iota,l)=(\iota',l')\) 且 \(k=k'\)（除第 \(i\) 个指标之外）时成立，故只需考虑这种情形。现在，由标准小波理论（利用 Meyer 小波与尺度函数是 Schwartz 函数这一事实）我们有界

$$
\Big|\Big\langle\frac{d\psi^{\iota_i}_{j-1,k_i}}{dx},\frac{d\psi^{\iota'_i}_{j-1,k'_i}}{dx}\Big\rangle\Big|\le C2^{2j}\sum_{m\in\mathbb{Z}}\frac{1}{(1+|k_i-k'_i+m2^{j-1}|)^2}.
$$

于是我们看到

$$
\|\partial_iu_j\|^2_{L^2}\le C2^{2j}\sum_{(\iota,l)\in\mathcal{I}^{alt}_j}\sum_{\iota'_i}\sum_{\substack{k\in\mathcal{K}'(l)\\ k'_i\in[2^{j-1}-1]}}|\langle u,\Psi^{\iota,alt}_{lk}\rangle||\langle u,\Psi^{\iota',alt}_{l'k'}\rangle|\sum_{m\in\mathbb{Z}}\frac{1}{(1+|k_i-k'_i+m2^{j-1}|)^2}\le C2^{2j}\|u_j\|^2_{L^2},
$$

其中最后一步我们使用了 Young 不等式以及如下事实：

$$
\sum_{k'_i\in[2^{j-1}-1]}\sum_{m\in\mathbb{Z}}\frac{1}{(1+|k_i-k'_i+m2^{j-1}|)^2}\le\frac{\pi^2}{3}.
$$

于是我们已建立 (a)。我们用类似的思路证明 (ii)。不过在这一部分我们需要原来的基。如前，可以写出

$$
\frac{du}{dt}=\sum_{j,j'\ge L_0-1}\sum_{k_t,k_x}\langle u,\Psi^{an}_{jj'k_tk_x}\rangle\frac{d\Psi^{an}_{jj'k_tk_x}}{dt}.
$$

于是若把它重新展开到另一组基中，我们看到

$$
\frac{du}{dt}=\sum_{ii'jj'}\sum_{k_tk'_tk_xk'_x}\langle u,\Psi^{an}_{jj'k_tk_x}\rangle\Big\langle\frac{d\Psi^{an}_{jj'k_tk_x}}{dt},\Psi^{an}_{ii'k'_tk'_x}\Big\rangle\Psi^{an}_{ii'k'_tk'_x}.
$$

现在，若考察内积

$$
\Big\langle\frac{d\Psi^{an}_{jj'k_tk_x}}{dt},\Psi^{an}_{ii'k'_tk'_x}\Big\rangle=\Big\langle\frac{d\psi^{bc}_{jk_t}}{dt},\psi^{bc}_{ik'_t}\Big\rangle\langle\Psi_{j'k_x},\Psi_{i'k'_x}\rangle,
$$

我们看到它为零，除非 \(j'=i'\) 且 \(k_x=k'_x\)（此时它为 \(1\)）。这意味着时间导数的作用与空间解耦。因此，若要证明

$$
\Big\|\frac{du}{dt}\Big\|^2_{H^{\alpha-2,an}}\le C\|u\|^2_{H^{\alpha,an}},
$$

就等价于证明由下式给出的 \(\ell^2\to\ell^2\) 矩阵

$$
M^{j'}_{(j,k_t),(i,k'_t)}=2^{-\alpha\max(j/2,j')}2^{(\alpha-2)\max(i/2,j')}\langle\partial_t\psi^{bc}_{jk_t},\psi^{bc}_{ik'_t}\rangle
$$

关于 \(j'\) 一致有界。为此，我们将使用 Schur 检验的离散版本，见 Halmos 与 Sunder (1978) 定理 5.2。首先注意当 \(j\le i\) 时，可以用 (52)（其中 \(S\) 为边界修正 Daubechies 小波的光滑度）与 Taylor 定理得到：存在只依赖于 \(S\) 的常数使得

$$
|\langle\partial_t\psi^{bc}_{jk_t},\psi^{bc}_{ik'_t}\rangle|\le C2^j2^{-(S-1)(i-j)}=C2^j2^{-(S-1)|i-j|}.
$$

于是我们看到，当 \(2j'\le j\le i\) 时，

$$
|M^{j'}_{(j,k_t),(i,k'_t)}|\le C2^{-\alpha\max(j/2,j')}2^{(\alpha-2)\max(i/2,j')}2^j2^{-(S-1)|i-j|}\le C2^{(-S+\alpha/2)|i-j|}.\tag{54}
$$

现在，由于我们着眼于点使用 Schur 检验，对固定的 \((j,k_t)\) 我们希望

$$
\sum_{(i,k'_t)}|M^{j'}_{(j,k_t),(i,k'_t)}|\le C,
$$

其中 \(C\) 不依赖于 \(j',j\) 或 \(k_t\)。我们注意到，由于边界修正小波具有紧支撑，对固定的 \(i\)，只有 \(2^{|i-j|}\) 个 \(k'_t\) 使 \(\psi^{bc}_{jk_t}\) 与 \(\psi^{bc}_{ik'_t}\) 的支撑相交。因此由 (54) 得

$$
\sum_{\substack{(i,k'_t)\\ i\ge j}}|M^{j'}_{(j,k_t),(i,k'_t)}|\le C\sum_{i\ge j}2^{(-S+\alpha/2+1)|i-j|}.\tag{55}
$$

由此我们知道，只要固定 \(S\) 足够大使得 \(S>\alpha/2+1\)。这是论证的核心；理想情况下我们希望把同样的估计用于 \(i\le j\) 的情形，但这样做需要分部积分。当 \(\psi^{bc}_{jk_t}\) 或 \(\psi^{bc}_{ik'_t}\) 之一是内部小波时，分部积分是合法的，于是得到通常的估计

$$
|M^{j'}_{(j,k_t),(i,k'_t)}|\le C2^{-\alpha\max(j/2,j')}2^{(\alpha-2)\max(i/2,j')}2^i2^{-(S-1)|i-j|}.
$$

于是，若取固定的内部指标 \((j,k_t)\) 且 \(2j'\le j\)，我们看到

$$
\sum_{\substack{(i,k'_t)\\ i\le j}}|M^{j'}_{(j,k_t),(i,k'_t)}|\le C\sum_{i\le j}2^{|i-j|}2^{-\alpha j/2}2^{(\alpha-2)\max(i/2,j')}2^i2^{-(S-1)|i-j|}\le C\sum_{i\le j}2^{-(S-2)|i-j|}\le C.\tag{56}
$$

把 (55) 与 (56) 合并即得所需界。在 \(\psi^{bc}_{jk_t}\) 与 \(\psi^{bc}_{ik'_t}\) 都是边界小波的情形（注意对每个 \(i,j\)，这样的配对只有 \(2S^2=O(1)\) 个），该边界项不可避免；但在这种情形我们利用 \(M\) 中的权重因子作估计。现在考虑 \((j,k_t)\) 固定为边界指标（为简洁起见设为左边界）且 \(i\le j\)、\((i,k'_t)\) 也是边界指标的情形。此时我们仍作分部积分并得到

$$
|\langle\partial_t\psi^{bc}_{jk_t},\psi^{bc}_{ik'_t}\rangle|\le|\psi^{bc}_{jk_t}(0)\psi^{bc}_{ik'_t}(0)|+|\langle\psi^{bc}_{jk_t},\partial_t\psi^{bc}_{ik'_t}\rangle|\le C\big(2^{(i+j)/2}+2^i2^{-(S-1)|i-j|}\big).
$$

现在第二项已如我们所见是良态的，于是剩下要界定

$$
\sum_{i\le j}2^{-\alpha j/2}2^{(\alpha-2)\max(i/2,j')}2^{(i+j)/2}=2^{-(\alpha-1)j/2}\sum_{i\le j}2^{(\alpha-2)\max(i/2,j')}2^{i/2}\le2^{-(\alpha-1)j/2}\Big(\sum_{i\le2j'}2^{(\alpha-2)j'}2^{i/2}+\sum_{2j'<i\le j}2^{(\alpha-1)i/2}\Big)\le C,
$$

正如所需。以上说明在 \(2j'\le j\) 时最大行和有界。其余情形，即

- \((j,k_t)\) 满足 \(j\le2j'\) 时的最大行和有界，
- \((i,k'_t)\) 满足 \(2j'\le i\) 时的最大列和有界，以及
- \((i,k'_t)\) 满足 \(2j'\ge i\) 时的最大列和有界，

都可用同样的技巧得到，这里不再赘述。注意我们需要 \(\alpha\ge2\)，因为在 \((i,k'_t)\) 固定、\(2j'\le i\le j\) 的情形，需要和（来自边界小波）

$$
\sum_{i\le j}2^{-\alpha j/2}2^{(\alpha-2)i/2}2^{(i+j)/2}=\sum_{i\le j}2^{-(\alpha-1)(j-i)/2}
$$

收敛（故实际上任何 \(\alpha>1\) 都可以）。\(\square\)

现在证明主命题 2.7。

**命题 2.7 的证明。**（证明概述）首先令 \(X=\bigcap H^k([0,1],H^{2m-2k}(\Omega))\)，并令 \(Q=[0,1]\times\Omega\)。我们将先证明 \(H^{2m,an}\subseteq X\)，再证明 \(X\subseteq H^{2m,an}\)。

设 \(f\in H^{2m,an}\)。为证 \(f\in X\)，只需证明 \(D^b_tD^\beta_xf\in L^2(Q)\)，其中 \(2b+|\beta|\le2m\)。在我们的设定中，这意指对任意函数 \(\chi\in C_c((0,1)\times\Omega)\) 有

$$
\int_QD^b_tD^\beta_xf(t,x)\chi(t,x)\,dtdx=(-1)^{b+|\beta|}\int_Qf(t,x)D^b_tD^\beta_x\chi(t,x)\,dtdx.
$$

然后我们用引理 D.5 看出确实 \(f\in X\)。

接下来设 \(f\in X\)。我们想证明 \(f\in H^{2m,an}\)，即

$$
\sum_{j>L_0}2^{2j(2m)}\sum_{(\iota,l),k}|\langle f,\Psi^{\iota,alt}_{lk}\rangle|^2<\infty.\tag{57}
$$

现在，由于 \(f\in L^2([0,1],H^{2m}(\Omega))\)，我们知道对几乎每个 \(t\) 有 \(f(t,\cdot)\in H^{2m}(\Omega)\)。于是由 \(H^{2m}(\Omega)\) 的小波刻画（见 Giné 与 Nickl (2016) §4.3.6）得到如下结论（\(H^m([0,1])\) 的相应小波刻画见 Triebel (2008) 定理 2.55）：

$$
\langle f(t,\cdot),\Psi^{\iota_x}_{jk_x}\rangle=2^{-j(2m)}a^{\iota_x}_{jk_x}(t),
$$

其中 \(a^{\iota_x}_{jk_x}\) 是某列函数，使得对几乎每个 \(t\) 有

$$
\sum_{j=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^j-1]^d}}|a^{\iota_x}_{jk_x}(t)|^2<\infty.
$$

但我们再次由小波刻画观察到

$$
C\|f\|^2_{L^2([0,1],H^{2m}(\Omega))}\ge\int_{[0,1]}C\|f(t,\cdot)\|^2_{H^{2m}(\Omega)}\,dt\ge\int_{[0,1]}\sum_{j=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^j-1]^d}}|a^{\iota_x}_{jk_x}(t)|^2\,dt\ge\sum_{j=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^j-1]^d}}\int_{[0,1]}|a^{\iota_x}_{jk_x}(t)|^2\,dt.
$$

于是，若现在考虑

$$
\sum_{j>L_0}\sum_{\substack{(\iota,l)\in\mathcal{I}^{an}_j\\ k\in\mathcal{K}(l)\\ \iota_x\ne0}}2^{2j(2m)}|\langle f,\Psi^{\iota,alt}_{lk}\rangle|^2=\sum_{j>L_0}\sum_{\substack{(\iota,l)\in\mathcal{I}^{an}_j\\ k\in\mathcal{K}(l)\\ \iota_x\ne0}}|\langle a^{\iota_x}_{l_1k_x},\psi^{\iota_t}_{l_0k_t}\rangle|^2.
$$

但对固定的 \((\iota_t,l_0)\)，集合 \((\psi^{\iota_t,bc}_{l_0k_t})\)（\(k_t\in[2^{l_0}-1]\)）是正交规范的，而 \((\iota_t,l_0)\) 只有三种可能，即 \((0,2(j-1))\)、\((1,2(j-1))\) 或 \((1,2j-1)\)，因此

$$
\sum_{j>L_0}\sum_{\substack{(\iota,l)\in\mathcal{I}^{an}_j\\ k\in\mathcal{K}(l)\\ \iota_x\ne0}}2^{2j(2m)}|\langle f,\Psi^{\iota,alt}_{lk}\rangle|^2\le3\sum_{j>L_0}\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^{j-1}-1]^d}}\|a^{\iota_x}_{j-1,k_x}\|^2_{L^2([0,1])}\le3C\|f\|^2_{L^2([0,1],H^{2m}(\Omega))}.
$$

这已几乎是完整的 Besov 空间范数；不过我们还缺少满足 \(\iota_x=0\) 的那些 \((\iota,l)\in\mathcal{I}^{an}_j\) 项。注意在这种情形下 \(\iota_t=1\)。为处理这些项，我们将使用区间上 Sobolev 空间的小波刻画，见 Triebel (2008) 定理 2.55。我们知道 \(f\in H^m([0,1],L^2(\Omega))\)，再次由 Fubini 定理以及小波是 \(L^\infty\) 函数这一事实，可推出

$$
\langle f,\Psi^{\iota_x}_{jk_x}\rangle_\Omega\in H^m([0,1])\quad\text{且}\quad D^b_t\langle f,\Psi^{\iota_x}_{jk_x}\rangle_\Omega=\langle D^b_tf,\Psi^{\iota_x}_{jk_x}\rangle_\Omega.
$$

现在，若定义函数

$$
a^{\iota_x}_{jk_x}(t)=\langle f,\Psi^{\iota_x}_{jk_x}\rangle,
$$

则如前所述 \(a^{\iota_x}_{jk_x}\in H^m([0,1])\)，并且对 \(b\le m\) 有

$$
\sum_{j=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^j-1]^d}}\|D^b_ta^{\iota_x}_{jk_x}\|^2_{L^2([0,1])}=\sum_{j=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^j-1]^d}}\int_0^1|\langle D^b_tf,\Psi^{\iota_x}_{jk_x}\rangle_\Omega|^2\,dt=\int_0^1\|D^b_tf\|^2_{L^2(\Omega)}\,dt.
$$

因此我们推出

$$
\sum_{j=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^j-1]^d}}\|a^{\iota_x}_{jk_x}\|^2_{H^m([0,1])}=\|f\|^2_{H^m([0,1],L^2(\Omega))}<\infty.
$$

接下来注意，我们要证明的是 Besov 范数中 \(\iota=(1,0)\) 的那些项有限，即

$$
\begin{aligned}
&\sum_{j>L_0}\sum_{k_x\in[2^{j-1}-1]^d}2^{2j(2m)}\Bigg(\sum_{k_t\in[2^{2(j-1)}-1]}|\langle f,\Psi^{(1,0),alt}_{(2(j-1),j-1),(k_t,k_x)}\rangle|^2+\sum_{k_t\in[2^{2j-1}-1]}|\langle f,\Psi^{(0,1),alt}_{(2j-1,j-1),(k_t,k_x)}\rangle|^2\Bigg)\\
&=\sum_{j>L_0}\sum_{k_x\in[2^{j-1}-1]^d}2^{2j(2m)}\Bigg(\sum_{k_t\in[2^{2(j-1)}-1]}|\langle\langle f,\psi^{bc}_{2(j-1),k_t}\rangle,\Psi^0_{j-1,k_x}\rangle|^2+\sum_{k_t\in[2^{2j-1}-1]}|\langle\langle f,\psi^{bc}_{2j-1,k_t}\rangle,\Psi^0_{j-1,k_x}\rangle|^2\Bigg).
\end{aligned}
$$

但这里我们注意到，对 \(k_x\in[2^{j-1}-1]^d\)，集合 \((\Psi^0_{j-1,k_x})\) 是 \(\mathcal{V}_{j-1}\) 的一组正交规范基（由 §D.1），故上式等于

$$
\begin{aligned}
&=\sum_{j>L_0}\sum_{l\le j-1}\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^l-1]^d}}2^{2j(2m)}\Bigg(\sum_{k_t\in[2^{2(j-1)}-1]}|\langle a^{\iota_x}_{lk_x},\psi^{bc}_{2(j-1),k_t}\rangle|^2+\sum_{k_t\in[2^{2j-1}-1]}|\langle a^{\iota_x}_{lk_x},\psi^{bc}_{2j-1,k_t}\rangle|^2\Bigg)\\
&\le\sum_{l=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^l-1]^d}}\sum_{j>L_0}2^{2j(2m)}\Bigg(\sum_{k_t\in[2^{2(j-1)}-1]}|\langle a^{\iota_x}_{lk_x},\psi^{bc}_{2(j-1),k_t}\rangle|^2+\sum_{k_t\in[2^{2j-1}-1]}|\langle a^{\iota_x}_{lk_x},\psi^{bc}_{2j-1,k_t}\rangle|^2\Bigg)\\
&\le C\sum_{l=0}^\infty\sum_{\substack{\iota_x\in\mathcal{I}\\ k_x\in[2^l-1]^d}}\|a^{\iota_x}_{lk_x}\|^2_{H^m([0,1])}=C\|f\|^2_{H^m([0,1],L^2(\Omega))},
\end{aligned}
$$

其中最后一个不等式来自空间 \(H^m([0,1])\) 的小波刻画。于是我们已证明 \(f\in H^{2m,an}\)（且 \(\|\cdot\|_{H^{2m,an}}\lesssim\|\cdot\|_X\)），故得证。\(2m+1\) 情形的论证相同。“特别地”部分由插值论证得到。对任意 \(s\ge0\)，取 \(m\in\mathbb{N}\) 使 \(2m>s\)。则由 Lions 与 Magenes (1972) 命题 2.1，对 \(2m(1-\theta)=s\) 有

$$
[H^{2m,m},L^2]_\theta=H^{s,s/2}.
$$

但我们也有

$$
[H^{2m,an},L^2]_\theta=H^{s,an},
$$

所以这两个空间必定一致。为看出小波空间的插值结果，考虑 Lion 与 Magenes (1972) 定义 2.1 中给出的插值定义：\(\Lambda\) 算子由

$$
\Lambda(u)=\sum_{j\ge L_0}\sum_{(\iota,l),k}2^{2mj}\langle u,\Psi^{\iota,alt}_{lk}\rangle\Psi^{\iota,alt}_{lk}
$$

给出。它关于各向异性基是对角的，因此

$$
\Lambda^{1-\theta}(u)=\sum_{j\ge L_0}\sum_{(\iota,l),k}2^{2m(1-\theta)j}\langle u,\Psi^{\iota,alt}_{lk}\rangle\Psi^{\iota,alt}_{lk}.
$$

\(\square\)

**注 D.6。** 我们指出，只要一个包含关系是连续的，而作为集合两空间相等，则由标准泛函分析可知范数必然等价。见 Giné 与 Nickl (2016) 注 4.3.1。

## 附录 E：偏微分方程正则性

### E.1 异质反应扩散方程

考虑方程

$$
\begin{cases}
\dfrac{\partial u}{\partial t}-\nabla\cdot(D\nabla u)=f(u) & \text{在 }(0,1]\times\Omega,\\[2mm]
u(0,\cdot)=\theta & \text{在 }\Omega,
\end{cases}\tag{58}
$$

的解 \(u:Q\to\mathbb{R}\)，其中 \(f:\mathbb{R}\to\mathbb{R}\) 属于 \(C^\infty_c(\mathbb{R})\)，\(\theta\in H^1(\Omega)\) 是初值。此外我们有 \(D:\Omega\to[D_{\min},\infty)\)，\(D_{\min}>0\)，且 \(\|D\|_\infty<\infty\)。(58) 的**弱解**是一个映射 \(u\in L^2([0,1],H^1(\Omega))\cap C([0,1],L^2(\Omega))\)，使得 \(u'\in L^2([0,1],H^{-1}(\Omega))\) 且满足

$$
\langle u',v\rangle+\langle D\nabla u,\nabla v\rangle=\langle f(u),v\rangle,\qquad\forall v\in H^1(\Omega)\ \text{与几乎每个 }t\in[0,1].\tag{59}
$$

(58) 的**强解**是满足下列附加条件的弱解 \(u\)：

$$
u\in L^2([0,1],H^2(\Omega))\cap C([0,1],H^1(\Omega)),\qquad u'\in L^2([0,1],L^2(\Omega)),
$$

此时 \(u\) 在 \(L^2([0,1],L^2(\Omega))\) 中解 (58)。

#### E.1.1 传输算子 \(\nabla\cdot(D\nabla\cdot)\)

在证明涉及可变扩散系数项的结论时，我们首先需要记录关于算子 \(\nabla\cdot(D\nabla\cdot)\) 的一些事实。全节假定 \(D\in C^1(\Omega)\)，\(D:\Omega\to[D_{\min},\infty)\) 且 \(D_{\min}>0\)。回忆对任意函数空间 \(X\subseteq L^1(\Omega)\)，我们定义

$$
\dot X=\Big\{f\in X:\int_\Omega f(x)\,dx=0\Big\}.
$$

此外，对 Sobolev 空间我们定义 \(H^{-s}(\Omega)=(\dot H^s(\Omega))^*\)。

然后，沿用与 Nickl (2024) §3.1.2 类似的论证，我们得到 \(L^2(\Omega)\) 的一组正交规范基，由本征函数 \(e_{0,D}=1\) 与 \(e_{1,D},\ldots,e_{j,D},\ldots\in H^2(\Omega)\) 组成，对应本征值 \(\lambda_0=0<\lambda_{1,D}\le\lambda_{2,D}\le\cdots\uparrow\infty\)，使得

$$
-T_De_{j,D}=\nabla\cdot(D\nabla e_{j,D})=-\lambda_{j,D}e_{j,D}\qquad\text{对 }j\in\mathbb{N}.
$$

我们可以对 \(k\in\mathbb{N}\) 定义空间

$$
\bar H^k_D(\Omega)=\Bigg\{\phi\in\dot L^2(\Omega):\sum_{j\ge1}\lambda^k_{j,D}\langle\phi,e_{j,D}\rangle^2_{L^2}\equiv\|\phi\|^2_{\bar H^k}<\infty\Bigg\}.
$$

它们满足下一个定理中所述的性质：

**命题 E.1。** 假定对某个 \(s>d\) 有 \(\|D\|_{H^s(\Omega)}\le U\)。则对 \(k\le s+1\)，\(\bar H^k_D(\Omega)=\dot H^k(\Omega)\)，且 \(\|\phi\|_{H^k}\simeq\|\phi\|_{\bar H^k_D}\)。

我们在此不证明该命题，但指出：之所以谱定义的空间与 Sobolev 空间相等（而非严格包含），是因为我们处理的是周期边界条件，而不是 Neumann 或 Dirichlet 边界条件。这与周期情形下 Laplacian 的定义域与 Sobolev 空间重合的做法本质相同，见 Robinson (2001) §6.3。

这使我们能够通过

$$
T^{1/2}_D(u)=\sum_{j\ge1}\lambda^{1/2}_{j,D}\langle u,e_{j,D}\rangle e_{j,D}
$$

定义算子 \(T^{1/2}_D\)，它对一切 \(k\le s+1\) 是 \(H^k(\Omega)\to H^{k-1}(\Omega)\) 的算子。最后我们指出，对 \(\phi\in H^k\)，

$$
\|T^{k/2}_D\phi\|^2_{L^2(\Omega)}+\|\varphi\|^2_{L^2(\Omega)}\simeq\|\varphi\|^2_{H^k(\Omega)}.
$$

现在考虑线性抛物型方程

$$
\begin{cases}
\dfrac{\partial u}{\partial t}+T_Du+au=h & \text{在 }[0,S]\times\Omega,\\[2mm]
u(0)=\theta & \text{在 }\Omega,
\end{cases}\tag{60}
$$

其中 \(h\in L^2([0,S],L^2(\Omega))\)，\(a\in L^\infty(Q)\)。沿用 Evans (1998) §6.3 与 §7.2 中相同的证明，但跟踪系数上所需的确切假定，我们得到如下定理：

**命题 E.2。** 假定 \(\theta\in H^1(\Omega)\)、\(h\in L^2([0,S],L^2(\Omega))\)、\(a\in L^\infty(Q)\)，且 \(D:\Omega\to[D_{\min},\infty)\)、\(D_{\min}>0\)、\(D\in C^1(\Omega)\)。则 (60) 存在唯一强解 \(u\)，满足

$$
u\in L^2([0,S],H^2(\Omega))\cap C([0,S],H^1(\Omega)),\qquad u'\in L^2([0,S),L^2(\Omega)),
$$

并且我们有估计

$$
\|u\|_{L^2([0,S],H^2(\Omega))}+\|u'\|_{L^2([0,S],L^2(\Omega))}\le C\big(\|h\|_{L^2([0,S],L^2(\Omega))}+\|\theta\|_{H^1(\Omega)}\big)
$$

以及

$$
\|u\|_{L^2([0,S],H^1(\Omega))}+\|u'\|_{L^2([0,S],H^{-1}(\Omega))}\le C\big(\|h\|_{L^2([0,S],H^{-1}(\Omega))}+\|\theta\|_{L^2(\Omega)}\big),
$$

其中 \(C\) 只依赖于 \(D\) 的 \(C^1\) 范数的一个上界、\(D_{\min}\)、\(d\)、\(\|a\|_\infty\) 与 \(S\)。

#### E.1.2 HRDE 的正则性理论

**定理 E.3。** 对 \(f\in C^\infty_c(\mathbb{R})\)、\(D\in C^1(\Omega)\)、\(\theta\in H^1(\Omega)\)、\(d\in\mathbb{N}\)，异质反应扩散方程 (58) 存在强解 \(u=u_{\theta,D}\)，且在 \(C([0,1],L^2(\Omega))\) 中唯一。

**证明。**（证明概述）存在性证明改编自 Nickl (2024) §3.1.1 与 Evans (1998) 第 537 页起。定义 Banach 空间 \(X\equiv C([0,S],L^2(\Omega))\)（对某个待取的 \(S>0\)），并赋以范数

$$
\|u\|_X=\sup_{0<t<S}\|u(t)\|_{L^2(\Omega)}.
$$

对任意 \(u\in X\) 定义新函数 \(h(t,\cdot)=f(u(t,\cdot))\in L^\infty([0,S],L^\infty(\Omega))\)。线性抛物型 PDE

$$
\begin{cases}
\dfrac{\partial w}{\partial t}+T_Dw=h & \text{在 }(0,S]\times\Omega,\\[2mm]
w(0,\cdot)=\theta & \text{在 }\Omega,
\end{cases}
$$

由命题 E.2 有唯一强解 \(w\in L^2([0,S],H^2(\Omega))\cap C([0,S],H^1(\Omega))\)，且 \(w'\in L^2([0,S],L^2(\Omega))\)。对 \(u_i\in X\)、\(h_i=f(u_i)\)（\(i=1,2\)），考虑 (60) 的解 \(w_i\equiv A(u_i)\in X\)，并定义常数

$$
i_{1,2}=\int_\Omega(w_1-w_2)=\langle w_1-w_2,1\rangle_{L^2(\Omega)}.
$$

我们可以用 \(1\) 检验方程 (60)，得到

$$
\frac{d}{dt}\langle w_1-w_2,1\rangle+\langle T_D(w_1-w_2),1\rangle=\langle f(u_1)-f(u_2),1\rangle.
$$

现在可用散度定理说明中间项为零。若从 \(0\) 积分到 \(t\)，我们看到

$$
|i_{1,2}(t)|=|i_{1,2}(t)-i_{1,2}(0)|=\Big|\int_0^t\int_\Omega(f(u_1(s,x))-f(u_2(s,x)))\,dxds\Big|\le S\sup_{0<t<S}\|f(u_1)-f(u_2)\|_{L^2(\Omega)}\le S\|f\|_{lip}\|u_1-u_2\|_X.
$$

用 \(w_1-w_2\) 检验 \(w_1\) 与 \(w_2\) 的 (60) 并相减，我们得到

$$
\begin{aligned}
&\frac{d}{dt}\|w_1-w_2\|^2_{L^2(\Omega)}+2D_{\min}\|\nabla(w_1-w_2-i_{1,2})\|^2_{L^2}\\
&\le\frac{d}{dt}\|w_1-w_2\|^2_{L^2(\Omega)}+2\|\sqrt D\nabla(w_1-w_2-i_{1,2})\|^2_{L^2}\\
&=2\langle w_1-w_2,h_1-h_2\rangle_{L^2(\Omega)}\\
&\le(\epsilon/2)\|w_1-w_2-i_{1,2}+i_{1,2}\|^2_{L^2(\Omega)}+\frac{2}{\epsilon}\|f(u_1)-f(u_2)\|^2_{L^2(\Omega)}\\
&\le\epsilon\|\nabla(w_1-w_2-i_{1,2})\|^2_{L^2(\Omega)}+\Big(S^2+\frac{2}{\epsilon}\Big)\|f\|^2_{lip}\|u_1-u_2\|^2_X.
\end{aligned}
$$

于是取 \(\epsilon\) 足够小并相减，得到

$$
\frac{d}{dt}\|w_1-w_2\|^2_{L^2(\Omega)}\le c(S^2+1)\|u_1-u_2\|^2_X,
$$

其中 \(c=c(\|f\|_{lip},D_{\min},d)\)。从 \(0\) 积分到 \(t\)，并利用 \((w_1-w_2)(0)=0\)，我们得到

$$
\|A(u_1)-A(u_2)\|^2_X=\sup_{0<t<S}\|w_1(t)-w_2(t)\|^2_{L^2(\Omega)}\le c(S^2+1)S\|u_1-u_2\|^2_X.
$$

于是对某个固定的足够小的 \(S_0\)，我们推出 \(A\) 是 \(X\) 上的压缩映射，故由压缩映射定理，在区间 \([0,S_0]\) 上存在唯一的 \(u\) 满足 \(u=A(u)\)。由于 \(u\) 是 (58) 的强解当且仅当 \(u=A(u)\)，即得所需结论。\(\square\)

首先我们证明解的空间正则性：

**命题 E.4。** 假定 \(D\in C^1(\Omega)\)。对 \(\theta\in H^1(\Omega)\)、\(D\in H^s(\Omega)\) 与 \(f\in C^\infty_c(\mathbb{R})\)，设 \(u\) 为 (58) 的解。假定对 \(0\le\gamma\le s\) 有 \(\|\theta\|_{H^\gamma(\Omega)},\|D\|_{H^\gamma(\Omega)}\le B\)，并假定 \(d\le3\)。则

$$
\int_0^S\|u_{\theta,D}(t)\|^2_{H^{\gamma+1}(\Omega)}\,dt+\sup_{0\le t\le S}\|u_{\theta,D}\|_{H^\gamma(\Omega)}\le C,
$$

对某个 \(C=C(B,f,\gamma,d,D_{\min},\|D\|_{C^1},S)\) 成立；并且记 \(u'=(\partial u/\partial t)\)，我们还有

$$
\int_0^S\|u'_{\theta,D}(t)\|^2_{H^{\gamma-1}}\,dt+\mathrm{ess\,sup}_{0\le t\le S}\|u'_{\theta,D}(t)\|_{H^{\gamma-2}}\le C'.
$$

特别地，\(u_{\theta,D}\in C([0,S],H^\gamma)\)。

**证明。**（证明概述）我们按通常论证进行：先假定解足够正则，建立先验估计；一般情形则回到 Galerkin 逼近并利用强解的唯一性，这是标准做法。

**第 1 步：预备恒等式与估计。** 从方程 (58) 出发，用 \(T^\gamma_Du\) 检验它，得到

$$
\frac12\frac{d}{dt}\langle u,T^\gamma_Du\rangle+\langle T_Du,T^\gamma_Du\rangle=\langle f(u),T^\gamma_Du\rangle.
$$

利用 \(T_D\) 的对称性，我们观察到

$$
\frac12\frac{d}{dt}\|T^{\gamma/2}_Du\|^2_{L^2}+\|T^{(\gamma+1)/2}_Du\|^2_{L^2}=\langle T^{(\gamma-1)/2}_Df(u),T^{(\gamma+1)/2}_Du\rangle.\tag{61}
$$

对 \(\gamma=0\) 的情形，我们得到

$$
\frac12\frac{d}{dt}\|u(t)\|^2_{L^2(\Omega)}+\|\sqrt D\nabla u\|^2_{L^2(\Omega)}=\langle f(u),u\rangle.\tag{62}
$$

由于 \(f(u)\) 一致有界且紧支撑，我们知道

$$
\langle f(u),u\rangle_{L^2}=\int_\Omega f(u)u\,\mathbf 1_{|u|\le K}\le c_f<\infty,\qquad\text{对某 }K>0.
$$

于是回到 (62)，得到

$$
\frac{d}{dt}\|u(t)\|^2_{L^2}+2\|\sqrt D\nabla u\|^2_{L^2}\le2c_f,
$$

积分后得到 \(\sup_{0\le t\le S}\|u(t)\|^2_{L^2}\le2Sc_f+\|\theta\|^2_{L^2}<\infty\)，以及

$$
\int_0^S\|\nabla u\|^2_{L^2}\,dt\le\frac{Sc_f}{D_{\min}}+\frac{1}{D_{\min}}\|u(0)\|^2_{L^2}\le C(B,f,S,D_{\min}).
$$

由于 \(\|u\|^2_{H^1}\simeq\|u\|^2_{L^2}+\|\nabla u\|^2_{L^2}\)，这就证明了 \(\gamma=0\) 情形下的命题。

其次，注意由 Cauchy–Schwarz 不等式、命题 E.1 与 Young 不等式，

$$
\langle T^{\gamma-1/2}_Du,T^{\gamma+1/2}_Du\rangle\lesssim\|f(u)\|_{H^{\gamma-1}}\|T^{\gamma+1/2}_Du\|_{L^2}\le2\|f(u)\|^2_{H^{\gamma-1}}+\frac14\|T^{\gamma+1/2}_Du\|^2_{L^2}.
$$

于是回到 (61)，我们看到

$$
\frac{d}{dt}\|T^{\gamma/2}_Du\|^2_{L^2}+\|T^{(\gamma+1)/2}_Du\|^2_{L^2}\lesssim\|f(u)\|^2_{H^{\gamma-1}}.\tag{63}
$$

**第 2 步：先验估计的证明。** 现在我们要对 \(\gamma\ge1\) 证明命题中的估计。我们用归纳法。假定

$$
\int_0^S\|u_{\theta,D}(t)\|^2_{H^\gamma(\Omega)}\,dt+\sup_{0\le t\le S}\|u_{\theta,D}\|_{H^{\gamma-1}(\Omega)}\le C,
$$

此时有 \(\|u(t)\|_{H^{\gamma-1}}\le C\)，其中常数 \(C=C(S,B,D_{\min},\|D\|_{C^1},d)\)。我们证明作为推论，(63) 的右端被某个固定常数控制。对 \(\gamma=1\)，这由 \(f\in L^\infty\) 推出。对 \(\gamma=2\)，我们知道

$$
\|f(u)\|_{H^1}\lesssim\|f(u)\|_{L^2}+\max_{|\alpha|=1}\|f'(u)D^\alpha u\|_{L^2}\le\|f\|_\infty+\|f'\|_\infty\|u\|_{H^1}\le C.
$$

对 \(\gamma=3\)，我们同样有 \(\|f(u)\|_{H^2}\lesssim\|f\|_\infty+\max_{|\alpha|=2}\|D^\alpha(f(u))\|_{L^2}\)，并需要估计最后一项。我们知道

$$
D^\alpha(f(u))=f''(u)D^{\alpha_1}uD^{\alpha_2}u+f'(u)D^\alpha u.
$$

第二项容易由 \(\|f'\|_\infty\|u\|_{H^2}\) 界定，第一项由

$$
\|f''\|_\infty\Big(\int_\Omega(D^{\alpha_1}uD^{\alpha_2}u)^2\,dx\Big)^{1/2}\lesssim\|D^{\alpha_1}u\|_{L^4}\|D^{\alpha_2}u\|_{L^4}
$$

界定，而我们注意到当 \(d\le4\) 时 \(H^1(\Omega)\hookrightarrow L^4(\Omega)\)，故上述量被 \(\|u\|^2_{H^2}\) 控制。

其次，需要 \(d\le3\) 这一限制。我们有 Sobolev 范数的乘子不等式

$$
\|fg\|_{H^a}\lesssim\|f\|_{H^a}\|g\|_{H^a}
$$

（对 \(a>d/2\)）。因此当 \(d\le3\) 时我们可以在 \(H^2\) 范数的情形应用它。现在对 \(\gamma=4\)，我们有

$$
\|f(u)\|_{H^3}\lesssim c+\max_{|\alpha|=1}\|f'(u)D^\alpha u\|_{H^2}\lesssim c+\|f'(u)\|_{H^2}\max_{|\alpha|=1}\|D^\alpha u\|_{H^2}\lesssim c+\|u\|^3_{H^3},
$$

其中使用了前一情形同样的界，只是把 \(f''\) 换成 \(f'''\)。对进一步的 \(\gamma\ge5\)，我们做与上面相同的论证，利用 \(H^{\gamma-2}\) 范数的乘子不等式。

这样我们完成了归纳，并证明了：对一切 \(\gamma\)，存在常数 \(c_0\)（依赖于通常的那些常数）使得

$$
\frac{d}{dt}\|T^\gamma_Du\|^2_{L^2}+\|T^{\gamma+1/2}_Du\|^2_{L^2}\le c_0.
$$

为证明先验估计，我们现在只需做通常的积分论证，得到

$$
\|T^\gamma_Du(t)\|^2_{L^2}+\int_0^S\|T^{\gamma+1/2}_Du\|^2_{L^2}\,dt\le c_1(B,f,\gamma,S,d,D_{\min},\|D\|_{C^1}).
$$

现在把它与 \(\|u(t)\|_{L^2}\) 的界结合，并使用命题 E.1 即得所需的先验界。导数的先验界由

$$
\Big\|\frac{du}{dt}\Big\|^2_{H^{\gamma-1}}=\|T_Du+f(u)\|^2_{H^{\gamma-1}}\le2\|u\|^2_{H^{\gamma+1}}+2\|f(u)\|^2_{H^{\gamma-1}}
$$

推出。

在推出先验估计之后，我们按基 \(\{e_{j,D}\}_{j\ge0}\) 使用通常的 Galerkin 论证。注意该基是必需的，因为我们需要 \(T_D\) 保持 \(E_J=\mathrm{span}\{e_{j,D}\}_{j=0}^J\) 不变。

现在我们推出 \(u\) 的时间正则性。我们再次使用 Galerkin 论证。

**命题 3.1 的证明。**（证明概述）我们通过对 \(k\) 的归纳证明：对 \(\gamma+1-2k\ge-1\)，

$$
\frac{d^ju}{dt^j}\in L^2([0,S],H^{\gamma+1-2j}(\Omega))\quad\text{对 }j=0,\ldots,k,\qquad \|u^{(j)}\|_{L^2([0,S],H^{\gamma+1-2j}(\Omega))}\le C,
$$

其中 \(C=C(B,f,\gamma,d,D_{\min},\|D\|_{C^1},S,k)\)。由命题 E.4 已证 \(k=1\) 的基始情形。现在，用标准的 Galerkin 论证，只需建立 \(u^{(k+1)}\) 的先验界。我们知道 \(u\) 满足

$$
\frac{du}{dt}=\nabla\cdot(D\nabla u)+f(u),
$$

于是把该恒等式关于时间求导 \(k\) 次，得到

$$
\frac{d^{k+1}u}{dt^{k+1}}=\nabla\cdot\Big(D\nabla\frac{d^ku}{dt^k}\Big)+\frac{d^{k+1}}{dt^{k+1}}\big(f(u)\big).
$$

现在可以界定

$$
\Big\|\nabla\cdot(D\nabla u^{(k)})\Big\|_{L^2([0,S],H^{\gamma-1-2k})}\lesssim\|u^{(k)}\|_{L^2([0,S],H^{\gamma+1-2k})},
$$

而后者又由归纳假设被某个常数控制。现在我们界定第二项。使用 Faà di Bruno 公式，我们看到

$$
\frac{d^{k+1}}{dt^{k+1}}\big[f(u)\big]=\sum\frac{k!}{m_1!\cdots m_k!}f^{(m_1+\cdots+m_k)}(u)\prod_{j=1}^k\Big(\frac{u^{(j)}}{j!}\Big)^{m_j},
$$

其中 \(m_1+2m_2+\cdots+km_k=k\)。于是只需在 \(L^2([0,S],H^{\gamma-1-2k})\) 中界定和中每一项。其次，由归纳假设我们有

$$
u^{(j)}\in C([0,S],H^{\gamma-2k}(\Omega))\quad\text{对 }j=0,\ldots,k-1,\tag{64}
$$

其范数被 \(u^{(j)}\) 与 \(u^{(j+1)}\) 的范数的某个常数倍控制（见 Evans (1998) §5.9.2 定理 4）。

现在假定 \(\gamma-1-2k\ge2\)。则我们知道 \(H^{\gamma-1-2k}\) 对 \(d\le3\) 满足乘子不等式，于是对某些非负整数 \(m_1,\ldots,m_k\)（满足 \(m_1+2m_2+\cdots+km_k=k\)）有

$$
\int_0^S\Big\|f^{(m_1+\cdots+m_k)}(u)\prod_{j=1}^k(u^{(j)})^{m_j}\Big\|^2_{H^{\gamma-1-2k}}\,dt\lesssim\int_0^S\|f^{(m_1+\cdots+m_k)}(u)\|^2_{H^{\gamma-1-2k}}\prod_{j=1}^k\|u^{(j)}\|^{2m_j}_{H^{\gamma-1-2k}}\,dt.\tag{65}
$$

现在，在上一命题的证明中我们已经证明：若 \(\sup_{0\le t\le S}\|u\|_{H^a}\le C\)，则 \(\sup_{0\le t\le S}\|f(u)\|_{H^a}\le c'\)，对任意 \(a\) 的选择成立，只要 \(d\le3\)。但由 (64) 我们知道 \(\sup_{0\le t\le S}\|u\|_{H^\gamma}\le c\)，故

$$
\sup_{0\le t\le S}\|f^{(m_1+\cdots+m_k)}(u)\|_{H^{\gamma-1-2k}}\le C.\tag{66}
$$

类似地，对每个 \(j=1,\ldots,k-1\) 我们也有

$$
\sup_{0\le t\le S}\|u^{(j)}\|_{H^{\gamma-1-2k}}\lesssim\sup_{0\le t\le S}\|u^{(j)}\|_{H^{\gamma-2j}}\le C.
$$

于是我们已证明 (65) 的右端在除 \(m_k\ne0\) 之外的所有情形都被常数控制。在后一情形 \(m_1=\cdots=m_{k-1}=0\)，\(m_k=1\)，于是（再次使用 (66)）

$$
(65)\lesssim\int_0^S\|u^{(k)}\|^2_{H^{\gamma-1-2k}}\,dt\le\|u^{(k)}\|_{L^2([0,S],H^{\gamma+1-2k})}\le C,
$$

故当 \(\gamma-1-2k\ge2\) 时已建立先验界。

其次假定 \(\gamma-1-2k=0\)（\(\gamma-1-2k=1,-1\) 的情形用同样思路）。此时我们要证明对 \(m_1+2m_2+\cdots+km_k=1\)（原文如此；下文推导使用 \(=k\)，疑为原文笔误），

$$
\int_0^S\Big\|f(u)\prod_{j=1}^k(u^{(j)})^{m_j}\Big\|^2_{L^2(\Omega)}\,dt\le C.
$$

由于 \(f\) 有界，我们知道

$$
\int_0^S\Big\|f(u)\prod_{j=1}^k(u^{(j)})^{m_j}\Big\|^2_{L^2(\Omega)}\,dt\le C\int_0^S\int_\Omega\prod_{j=1}^k u^{(j)}(t,x)^{2m_j}\,dxdt.\tag{67}
$$

现在，由于 \(m_1+2m_2+\cdots+km_k=k\)，我们知道

$$
\frac{1}{k/m_1}+\frac{1}{k/2m_2}+\cdots\frac{1}{m_k}=1.
$$

于是由广义 Hölder 不等式，我们得到

$$
(67)\le C\int_0^S\prod_{j=1}^k\|u^{(j)}\|^{2m_j}_{L^{2k/j}(\Omega)}\,dt.
$$

因此利用 (64)，只要 \(H^{\gamma-2j}\) 嵌入到 \(L^{2k/j}\)，我们就知道 \(\|u^{(j)}\|_{L^{2k/j}(\Omega)}\) 关于时间一致地被某个常数控制。此时 \(\gamma=1+2k\)，故对 \(j\le k-1\) 有 \(\gamma-2j\ge3\)。因此我们知道 \(H^{\gamma-2j}\) 确实嵌入到 \(L^\infty\)。\(m_k\ne0\) 的情形同样类似，故当 \(\gamma=1+2k\) 时得证。最后，为结束该证明，使用命题 2.7。\(\square\)

### E.2 二维纳维–斯托克斯方程

在二维纳维–斯托克斯方程的设定下，我们有

$$
\begin{cases}
\dfrac{du}{dt}-\nu\Delta u+B(u,u)=f & \text{在 }[0,S]\times\Omega,\\[2mm]
u(0,\cdot)=\varphi,
\end{cases}\tag{68}
$$

其中 \(f:\Omega\to\mathbb{R}^2\) 是不依赖时间的驱动力函数，\(\varphi\in\dot H^1_\diamond\)，\(\nu\in(\nu_{\min},\infty)\)。(68) 的**强解**是某个 \(u:[0,S]\to\dot H^1_\diamond(\Omega)\)，使得

$$
u\in L^2([0,S],\dot H^2_\diamond)\cap C([0,S],\dot H^1_\diamond),\qquad u'\in L^2([0,S],\dot H_\diamond),
$$

并且 \(u\) 在 \(L^2([0,S],\dot H_\diamond)\) 中解 (68)。由 Nickl 与 Titi (2024) 命题 1 我们知道，二维情形强解存在且唯一。

**命题 3.11 的证明。**（证明概述）证明与 §E.1 类似，只是我们利用 Konen 与 Nickl (2025) 命题 3.6，然后按命题 3.1 中那样对时间求导。此时计算更容易，因为无需对非线性项 \(f(u)\) 应用 Faà di Bruno 公式，而只需对 \((u\cdot\nabla)u\) 项使用乘积法则。\(\square\)

#### E.2.1 命题 3.12 的证明

**证明。**（证明概述）第一部分由命题 3.11 结合命题 2.9 得到。其次，设 \(M\ge0\)，并假定 \((\varphi_1,\nu_1),(\varphi_2,\nu_2)\in\Theta\)，其中对 \(i=1,2\) 有 \(\|\varphi_i\|,\nu_i\le M\)。又设 \(u_i\) 是 (8) 对应参数 \((\varphi_i,\nu_i)\) 的解。我们要证明如下形式的正向正则性估计：

$$
\sup_{0\le t\le1}\|u_1-u_2\|_{L^2}\le K\big(\|\varphi_1-\varphi_2\|+|\nu_1-\nu_2|\big).
$$

置 \(w=u_1-u_2\)。则把两方程相减、并仿照 Robinson (2001) 第 250 页重写双线性项之后，我们看到 \(w\) 满足

$$
\frac{dw}{dt}+\nu_1Aw=-B(w,u_1)-B(u_2,w)-(\nu_1-\nu_2)Au_2,\qquad w(0)=\varphi_1-\varphi_2.
$$

用 \(w\) 取内积，并注意 \(\langle B(u_2,w),w\rangle=0\)（Robinson (2001) 命题 9.1），我们看到

$$
\frac12\frac{d}{dt}\big[\|w\|^2_{L^2}\big]+\nu_1\|A^{1/2}w\|_{L^2}=-\langle B(w,u_1),w\rangle-(\nu_1-\nu_2)\langle Au_2,w\rangle.
$$

然后我们使用 Robinson (2001) 中的 (9.26)，以及 Young 不等式与散度定理，得到

$$
\frac12\frac{d}{dt}\big[\|w\|^2_{L^2}\big]+\nu_1\|A^{1/2}w\|^2_{L^2}\le\frac{\nu_1}{2}\|A^{1/2}w\|^2_{L^2}+\frac{k^2}{\nu_1}\|w\|^2_{L^2}\|u_1\|^2_{L^2}+|\nu_1-\nu_2|^2\frac{\|A^{1/2}u_2\|^2_{L^2}}{\nu_1}.
$$

然后应用 Grönwall 不等式得到

$$
\|w(t)\|^2\le\exp\Big(\int_0^t\frac{2k^2}{\nu_1}\|u_1(s)\|^2_{L^2}\,ds\Big)\Big(\|w(0)\|^2_{L^2}+|\nu_1-\nu_2|^2\int_0^t\frac{1}{\nu_1}\|u_2(s)\|^2_{L^2}\,ds\Big),
$$

但我们由命题 3.11 知道对 \(i=1,2\) 有 \(\|u_i\|_{L^2(Q)}\le C(M)\)，故

$$
\sup_{t\in[0,1]}\|w(t)\|^2_{L^2}\le C(M,d,\nu_{\min})\big(\|w(0)\|^2_{L^2}+|\nu_1-\nu_2|^2\big).
$$

开平方即得第二个结论。\(\square\)

## 致谢

作者感谢 R. Nickl 建议了本课题并进行了许多有益的讨论，感谢 A. Castre 的有益讨论，以及感谢 D. Konen 在通信中为引理 3.14 提供了一个更简单的论证。

## 资助

作者受 ERC Advanced Grant（UKRI G116786）资助。

## 参考文献

[1] ALBERTI, G.S., D. BARNES, A. JAMBHALE, and NICKL, R. (2025) On low frequency for diffusions without the hotspots conjecture. Mathematical Statistics and Learning. 8, 305-322.

[2] BANDEIRA, A.S., MAILLARD, A., NICKL, R., and WANG, S. (2023) On free energy barriers in Gaussian priors and failure of cold start MCMC for high-dimensional unimodal distributions. Philosophical Transactions of the Royal Society A. 381.

[3] BONITO, A., COHEN, A., DEVORE, R., PETROVA, G., and WELPER, G. (2017) Diffusion coefficients estimation for elliptic partial differential equations. SIAM J. Math. Anal. 49, 1570-1592.

[4] COHEN, A., DAUBECHIES, I., and VIAL, P. (1993), Wavelets on the interval and fat wavelet transforms. Appl. Comput. Harmon. Anal. 1, 54-84.

[5] CASTRE, A. and NICKL, R. (2026) On gradient stability in nonlinear PDE models and inference in interacting particle systems. arXiv preprint arXiv:2601:10326.

[6] EVANS, L. (1998), Partial Differential Equations, Vol. 19, Amer. Math. Soc.

[7] GHOSAL, S. and VAN DER VAART, A. (2017), Fundamentals of Nonparametric Bayesian Inference. Cambridge University Press.

[8] GINÉ, E. and NICKL, R. (2011) Rates of Contraction for posterior Distributions in \(L^r\)-metrics, \(1\le r\le\infty\). Annals of Statistics. 39, 2883-2911.

[9] GINÉ, E. and NICKL, R. (2016) Mathematical foundations of infinite-dimensional statistical models. Cambridge University Press, New York.

[10] GUILLEMIN, V. and POLLACK, A. (1974) Differential Topology. Prentice Hall.

[11] GILBARG, D. and TRUDINGER, N.S. (2001) Elliptic partial differential equations of second order. Class. Math. 224 Springer, Berlin.

[12] HIRSCH, M.W. (1976) Differential Topology. Springer New York, NY.

[13] HORN, R.A. and JOHNSON, C.R. (1985) MATRIX ANALYSIS. Cambridge University Press.

[14] HALMOS, P.R. and Sunder, V.S. (1978) Bounded Integral Operators on L2 Spaces. Springer Berlin, Heidelberg.

[15] KEKKONEN, H. (2022) Consistency of Bayesian inference with Gaussian process priors for a parabolic inverse problem. Inverse Problems 38.

[16] KONEN, D. and NICKL, R. (2025) Data assimilation with the 2D Navier-Stokes equations: Optimal Gaussian asymptotics for the posterior measure. Annals of Statistics.

[17] KONEN, D. and NICKL, R. (2026) On statistical inference for non-linear dynamical systems evolving in their global attractor. ArXiv pre-print.

[18] LÜTKEPOHL, H. (2005) New Introduction to Multiple Time Series Analysis. Springer Berlin/Heidelberg.

[19] LIONS, J.L. and Magenes, E. (1972) Non-homogeneous boundary value problems and applications. Vol. I. Springer-Verlag, New York-Heidelberg.

[20] LIONS, J.L. and Magenes, E. (1972) Non-homogeneous boundary value problems and applications. Vol. II. Springer-Verlag, New York-Heidelberg.

[21] LIU, W. and RÖCKNER, M. (2015) Stochastic Partial Differential Equations: An Introduction. Universitext. Springer, Cham.

[22] MARGA, A., VAN DER MUELEN, F., and VAN DER VAART, A. (2026) Semi-Parametric Bernstein-von Mises Theorem in a Parabolic PDE Problem. ArXiv pre-print.

[23] MEYERS, D.F. and SULI, E. (2003), An introduction to numerical analysis. Cambridge University Press.

[24] MONARD, F., NICKL, R., and PATERNAIN, G.P. (2021), Consistent inversion of noisy non-Abelian X-ray transforms. Comm. on Pure and Appl. Math. 74, 1045-1099.

[25] MONARD, F., NICKL, R., and PATERNAIN, G.P. (2021), Statistical Guarantees for Bayesian uncertainty quantification in non-linear inverse problems with Gaussian Process Priors. Annals of Statistics. 49, 3255-3298.

[26] NICKL, R. (2020), Bernstein-von Mises theorems for statistical inverse problems I: Schrödinger equation. J. of the European Mathematical Society (JEMS) 22, 2697-2750.

[27] NICKL, R. (2023) Bayesian Non-linear Statistical Inverse Problems. European Mathematical Society (EMS) Press.

[28] NICKL, R. (2024), Consistent inference for diffusions from low frequency measurements. Annals of Statistics. 52, 519-549.

[29] NICKL, R. (2024), Bernstein-von Mises theorems for time evolution equations. ArXiv pre-print.

[30] NICKL, R., PAVLIOTIS, G.A., and RAY, K. (2025) Bayesian nonparametric inference in McKean-Vlasov models. Annals of Statistics. 53, 170-193.

[31] NICKL, R. and SEIZILLES, F. (2026) Inferring diffusivity from killed diffusion. Annals of Statistics, to appear.

[32] NICKL, R., VAN DE GEER, S., and WANG, S. (2020) Convergence rates for penalised least squares estimators in PDE-constrained regression problems. SIAM/ASA J. of Uncertainty Quantification. 8, 372-413.

[33] NICKL, R. and WANG, S. (2024) On polynomial-time computation of high-dimensional posterior measures and stability properties in non-linear inverse problems. J. of the European Mathematical Society (JEMS) 26, 1031-1112.

[34] NICKL, R. and TITI, E. (2024) On posterior consistency of data assimilation with Gaussian process prior: the 2D Navier-Stokes equations. Annals of Statistics. 52, 1825-1844.

[35] ROBINSON, J.C. (2001), Infinite-dimensional dynamical systems. Cambridge Texts in Applied Mathematics, Cambridge University Press.

[36] ROUSSEL C.J. and ROUSSEL M.R. (2004) Reaction-diffusion models of development with state-dependent chemical diffusion coefficients. Progress in Biophysics and Molecular Biology. 86, 113-160.

[37] STUART, A.M. (2010) Inverse problems: a Bayesian perspective. Acta Numerica 19, 451-559.

[38] SCHWAB, C. and STEVENSON, R. (2009) Space-time adaptive wavelet methods for parabolic evolution problems. Mathematics of Computation. 78, 1293-1318.

[39] SEIZILLES, F. and SIEBEL, M. (2026) Posterior contraction under misspecification and heteroscedasticity in non-linear inverse problems. ArXiv pre-print.

[40] TAYLOR, M.E. (2024) Partial DIfferential Equations III. Springer Cham.

[41] TRIEBEL, H. (2006) Theory of Function Spaces III. Birkhäuser, Basel.

[42] TRIEBEL, H. (2008) Function Spaces and Wavelets on Domains. EMS Tracts in Math. 7, Eur. Math. Soc., Zürich.

[43] VAN DE GEER, S. (2001), Least squares estimation with complexity penalties. Mathematical Methods of statistics 10, 355-374.

[44] VAN DE GEER, S. (2000), Empirical Processes in M-Estimation. Cambridge University Press.

[45] WANG, S. (2026) Global polynomial-time estimation in statistical non-linear inverse problems via generalized stability. ArXiv pre-print.

[46] WATT, S.D. and WEBER, R.O. (1996) Reaction waves and non-constant diffusivities. J. of the Australian Math. Soc. Series B Appl. Math. 37, 458-473.

[47] YANG, Y. (2001), Nonparametric regression with dependent errors. Bernoulli 7, 633-655.

**本页范围与校对状态：** 本页覆盖原文全部 60 页：摘要/关键词、目录、第 1 节（§1.1–1.3）、第 2 节（§2.1–2.2 及其三个子小节）、第 3 节（§3.1–3.2）、附录 A（A.1–A.2）、附录 B（含条件 3.5/3.6 的验证）、附录 C（C.1–C.5）、附录 D（D.1–D.2）、附录 E（E.1–E.2）、致谢、资助与参考文献 [1]–[47]（保留英文原条目）。已知缺陷与说明：（1）原文数学符号由 pypdf 抽取，存在空格/断字（如 `𝜃↦→ G(𝜃)`、上下标被拆开），本译本已对照 PDF 渲染页 p.5、p.9、p.10、p.12、p.13、p.15、p.19、p.30、p.56 核对关键定理、条件与公式（特别是条件 1.8–1.13、定理 1.12/1.14、命题 3.9 的 \(\eta\) 分段公式、引理 C.3 的位置与陈述、文末 Faà di Bruno 段的 `=1` 记号、式 (22)–(25)）；（2）附录中的证明按“证明概述”精炼转述，保留全部关键估计、编号公式与结论，未逐行重证代数细节；（3）原文第 40 页“\(\bigcup_{l\ge L}V^{an}_l\)”与第 56 页“\(m_1+2m_2+\cdots+km_k=1\)”按原样译出并加了译注，疑为原文笔误；（4）附录 E 已按原文完整补入（任务说明初稿只点名 A–D，但原文第 50–57 页确为附录 E）；（5）脚注 1–5 以 Markdown 脚注形式保留。逐句逐式终校未做。

**登记（2026-11-01）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。
{% endraw %}
