---
layout: page
title: "XL-MIMO 半无网格变分贝叶斯信道估计：近场建模与推断｜中文全文译文"
permalink: /papers/translations/2026-10-08-2602-21449-semi-gridless-variational-bayes-channel-estimation-in-xl-mimo-near-fie/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6e625af6ef2508e0/) · [原文 arXiv](https://arxiv.org/abs/2602.21449) · [全部目录](/papers/catalog/)

# XL-MIMO 半无网格变分贝叶斯信道估计：近场建模与推断

**原题：** Semi-Gridless Variational Bayes Channel Estimation in XL-MIMO: Near-Field Modeling and Inference  
**作者：** Van-Chung Luu、Toan-Van Nguyen、Nuria González-Prelcic、Duy H. N. Nguyen  
**版本：** arXiv:2602.21449v1，2026-02-25，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–V 节、结论、附录 A（von Mises 分布结果）、图 1–11 图注、表 I–III 逐格、算法 1–2、参考文献 [1]–[46]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

极大天线阵列与高频段工作是推动第六代（6G）通信实现更高速率、更低时延与更广覆盖的两项关键技术。然而，这些技术的采用从根本上改变了波前特性，迫使通信系统工作在近场区域。从平面远场通信向球面近场传播的转变，需要新的信道估计算法，以充分利用球面波前的独特特性来支撑先进收发机设计。为此，我们提出一种基于变分贝叶斯（variational Bayesian，VB）推断框架的新型半无网格（semi-gridless）信道估计方法。具体而言，我们针对均匀线阵（uniform linear array，ULA）与均匀平面阵（uniform planar array，UPA），将近场信道模型重写为相互分离的到达方向（direction-of-arrival，DoA）分量与距离分量。基于这些新表示，我们对 DoA 采用基于 von Mises 分布的无网格估计，对距离采用由粗到细的网格搜索。随后，我们提出具有高效更新规则的半无网格变分贝叶斯（semi-gridless variational Bayesian，SG-VB）算法，实现准确的信道重建。仿真结果验证了所提 SG-VB 算法的有效性，在近场信道重建精度以及近场信道中 DoA 与距离分量的估计性能方面均表现出优越性。

**索引词：** 信道估计、极大规模天线阵列、近场通信、变分贝叶斯。

## I. 引言

第六代（6G）通信预期支持极高数据速率（可能达到 Tb/s 量级），并兼具低时延与增强的服务能力 [2]。这些性能需求推动了对极大天线阵列（extremely large antenna array，ELAA）的研究兴趣，因其可提供更多空间自由度与更高频谱效率 [3]、[4]。此外，为利用高速传输所需的宽阔带宽，业界正日益转向毫米波与太赫兹频段 [5]。ELAA 与高频段工作提升了无线网络的频谱效率与空间分辨率 [6]，但也要求更准确的电磁传播模型，以刻画波前曲率与近场效应 [7]。具体而言，电磁辐射场可大致分为近场与远场两个区域 [7]、[8]，其边界由瑞利距离（Rayleigh distance）确定 [9]。瑞利距离与阵列孔径的平方成正比、与波长成反比。随着天线孔径与载频增大，瑞利距离增大，可达数百米，使近–远场边界发生移动，许多通信链路因此工作在基站（BS）的近场区域。

与传统远场系统（平面波前主要由到达角（angle of arrival，AoA）刻画）不同，近场超大规模多输入多输出（XL-MIMO）需要建模球面波前，其相位随用户到各天线单元的传播距离而变化 [7]、[10]。这一方面为通信与感知网络带来新的机会与服务 [7]，例如更大的复用增益与更高分辨率的用户位置估计；另一方面也要求新的信道估计（channel estimation，CE）算法，因为基于角度域的传统远场 CE 方法已不再适用。

为在近场信道中获得高估计精度，多重信号分类（Multiple Signal Classification，MUSIC）[11] 等传统子空间方法已被广泛研究。例如，[12] 考察了远场与近场混合场景下的二维（2D）MUSIC DoA 估计，其在近场 XL-MIMO 系统信道估计中的应用 [13]–[15] 也证明了子空间方法的有效性。此外，[16] 提出一种序贯角度—距离信道估计方法，性能与 MUSIC 相当但复杂度更低。尽管这些方法具有高分辨估计能力，但它们受制于穷举搜索的高复杂度以及克服秩亏所需的大量样本 [14]，因而难以应用于 ELAA-MIMO 系统。

为克服子空间方法的局限，近期研究日益关注基于码本的技术。其核心思想是利用信道在极域中的稀疏性，由采样角度与距离构造码本 [17]–[20]，并在此基础上用压缩感知技术高效恢复信道。[17] 提出了极域同时正交匹配追踪（polar-domain simultaneous orthogonal matching pursuit，P-SOMP）与极域同时迭代无网格加权（polar-domain simultaneous iterative gridless weighted，P-SIGW）方法。然而，基于压缩感知的方法并未显式利用信道的稀疏结构。为此，[21]–[24] 等工作采用稀疏贝叶斯学习框架 [25]，纳入极域信道的稀疏结构以进一步提高信道估计精度。基于码本的方法已表现出很强的性能，但其效果高度依赖码本设计，而码本设计仍是开放问题 [20]、[26]；此外，使用码本会引入存储开销并增加系统时延。

近来，基于深度学习（deep learning，DL）的方法因其从数据中学习的能力而受到关注，从而减少了对信道结构精确知识的依赖。用于信道估计的 DL 方法可分为无模型与基于模型两类。无模型 DL 方法依赖数据驱动框架，直接将观测映射到无线信道。[27]–[29] 提出残差密集网络，用于细化最小二乘（least-squares，LS）等传统方法得到的粗略信道估计。[30]、[31] 将生成式扩散模型引入 CE 任务：[30] 提出两阶段方法，先用 SOMP 获得粗信道估计，再用扩散模型去除粗估计中的高斯噪声。基于模型的 DL 方法则把迭代算法展开为固定层数，从而获得更好的精度与可解释性。例如，[32]、[33] 提出基于迭代收缩阈值算法的 DL 架构，[26]、[34] 提出基于近似消息传递的架构。尽管 DL 方法已被证明对近场信道估计有效，但它们需要大量训练数据；此外，当部署场景与训练环境不同时，DL 模型的性能容易退化。

尽管上述方法有效，其高昂的计算与存储复杂度限制了它们在时延要求严格的通信系统中的实用性。此外，多数现有方法面向均匀线阵（ULA）设计，将其推广到均匀平面阵（UPA）并非易事。这些挑战凸显出对低复杂度、可扩展且能处理更一般阵列几何的解决方案的需求。

本文针对上述局限，提出一种基于变分贝叶斯（VB）框架的高效信道估计方法。VB 是一种强大的统计学习技术，利用参数化、可处理的分布近似难以处理的后验分布。VB 框架近来在多种 MIMO 系统的信道估计与数据检测中展现出强劲性能。例如，[35] 报道 VB 在低位 ADC MIMO 系统中实现了高精度的联合信道估计与数据检测；[36]、[37] 分别展示了其在无小区大规模 MIMO 与时变通信系统中的潜力。针对 ELAA-MIMO 信道估计，[38] 提出一种需要子阵特定稀疏性与共享稀疏性先验知识的 VB 方法：它考虑基站配备多个天线子阵、每个子阵连接一个局部处理单元（local processing unit，LPU），每个 LPU 估计其对应子阵的信道并与其他 LPU 交换信息，从而实现利用信道稀疏性的集中式信道估计。然而，该方法可能存在较高计算开销，且仍依赖子阵特定与共享稀疏性的先验知识；此外，它无法估计散射体位置，限制了其在先进收发机设计中的潜力 [39]。在上述工作的基础上，本文方法消除了对此类先验信息的需求，同时保持高效性与可扩展性，并进一步支持散射体位置估计。

综上，本文的主要贡献如下：

- 我们提出一种用于近场信道估计的新型**半无网格变分贝叶斯（SG-VB）**方法。通过将近场信道表示为频率分量与距离分量相互分离的潜变量，SG-VB 对 ULA 与 UPA 均具灵活性，并且不受阵列几何限制地实现高估计精度。
- 我们利用 von Mises 分布的混合来近似频率分量，并提出用于散射体距离估计的由粗到细网格搜索。
- 我们推导了全部潜变量的闭式变分分布。这些闭式表达式带来两点主要好处：（i）它们使 SG-VB 算法内部更新高效；（ii）它们便于估计散射体位置，从而可用于先进收发机设计。
- 我们通过将所提 SG-VB 与 MUSIC、P-SOMP、P-SIGW、SBL、LS 及 Oracle LS 对比来评估性能，指标包括信道重建与距离估计的归一化均方误差（NMSE），以及 DoA 估计的均方误差（MSE）。大量仿真结果验证了所提方法在各项指标上的有效性。

全文其余部分组织如下：第 II 节介绍系统模型，并给出基于 ULA 与 UPA 的近场信道模型的新表示；第 III 节回顾 VB 框架，并给出 ULA 与 UPA 两种情形下 SG-VB 算法的详细推导；第 IV 节给出仿真结果；第 V 节总结全文。

**记号说明。** 粗体小写字母表示向量，粗体大写字母表示矩阵。符号 $\mathbb C$ 与 $\mathbb R$ 分别表示复数集与实数集。符号 $\propto$ 表示"正比于"。记号 $\operatorname{diag}\{\mathbf a\}$ 表示由向量 $\mathbf a$ 构造的对角矩阵。$L_2$ 范数与绝对值分别记作 $\|\cdot\|$ 与 $|\cdot|$。复数的实部与虚部分别用 $\Re\{\cdot\}$ 与 $\Im\{\cdot\}$ 表示，其中 $j=\sqrt{-1}$。均值为 $\boldsymbol\eta$、协方差矩阵为 $\mathbf Z$ 的循环对称复高斯（circularly symmetric complex Gaussian，CSCG）分布记作 $\mathcal{CN}(\boldsymbol\eta,\mathbf Z)$。转置、复共轭与 Hermitian（共轭转置）运算分别记作 $(\cdot)^T$、$(\cdot)^*$ 与 $(\cdot)^H$。

## II. 系统模型与信道建模

本节首先介绍信道估计框架的系统模型，随后给出 ULA 与 UPA 近场信道建模的新表示。这些新表示是 SG-VB 算法的基础，下一节将对其作深入讨论。

### A. 系统模型

我们考虑近场 MIMO 系统的上行链路，基站配备总天线数为 $N$ 的 ULA 或 UPA。图 1 给出 ULA 的系统模型示意。基站接收来自多个散射体的 $L$ 条信号路径，以及来自用户的一条视距路径。本文考虑全数字系统，如 [23]、[27]、[29]、[31]、[40] 所研究：

$$
\mathbf y=\mathbf h+\mathbf n, \tag{1}
$$

其中 $\mathbf y\in\mathbb C^{N\times1}$ 为接收信号，$\mathbf h\in\mathbb C^{N\times1}$ 为近场信道，$\mathbf n\sim\mathcal{CN}(\mathbf 0,N_0\mathbf I_N)$ 表示独立同分布复高斯噪声。

本文的主要目标是从含噪观测 $\mathbf y$ 中以最小 NMSE 估计近场信道 $\mathbf h$，即 $\mathrm{NMSE}=10\log(\|\mathbf h-\hat{\mathbf h}\|^2/\|\mathbf h\|^2)$，其中 $\hat{\mathbf h}$ 为估计信道。

### B. ULA 近场信道建模

假设第 $\ell$ 个散射体与第 $n$ 根天线的坐标分别为 $(r_\ell\cos\theta_\ell,r_\ell\sin\theta_\ell)$ 与 $(0,\delta_n)$，其中 $\delta_n=(2n-N+1)d/2$，$n=0,\ldots,N-1$，$d$ 为天线间距。此时，第 $\ell$ 个散射体与基站之间的近场信道可建模为

$$
\mathbf h_\ell=\alpha_\ell\mathbf b(\theta_\ell,r_\ell)\in\mathbb C^{N\times1}. \tag{2}
$$

这里 $\alpha_\ell$ 表示复路径增益，第 $\ell$ 条射线对应的导向矢量为 [17]

$$
\mathbf b(r_\ell,\theta_\ell)
=\left[e^{jk\left(r_\ell-d_\ell^{(0)}\right)},\ldots,e^{jk\left(r_\ell-d_\ell^{(N-1)}\right)}\right]^{T}, \tag{3}
$$

其中 $d_\ell^{(n)}$ 为第 $\ell$ 个散射体到第 $(n+1)$ 根天线的距离，$k=2\pi/\lambda$ 为与载频相关的波数。

假设天线阵列部署在 $x$ 轴上，则传播距离计算为 $d_\ell^n=\sqrt{r_\ell^2+\delta_n^2-2\delta_nr_\ell\sin\theta_\ell}$，并用 Fresnel 近似 [41] 进一步近似为

$$
d_\ell^n\approx r_\ell\left(1+\frac{\delta_n^2}{2r_\ell^2}-\frac{\delta_n\sin\theta_\ell}{r_\ell}\right)
=r_\ell+\frac{\delta_n^2}{2r_\ell}-\delta_n\sin\theta_\ell. \tag{4}
$$

于是 $\mathbf b(r_\ell,\theta_\ell)$ 的第 $n$ 个元素可写为

$$
\begin{aligned}
\left[\mathbf b(r_\ell,\theta_\ell)\right]_n
&=e^{jk\left(\delta_n\sin\theta_\ell-\frac{\delta_n^2}{2r_\ell}\right)}\\
&=e^{-j\frac{N-1}{2}kd\left(\sin\theta_\ell+\frac{(N-1)d}{4r_\ell}\right)}
e^{jnkd\sin\theta_\ell}
e^{j\left((N-1)n-n^2\right)\frac{kd^2}{2r_\ell}}.
\end{aligned}\tag{5}
$$

定义 $\nu_\ell=\alpha_\ell e^{-j\frac{N-1}{2}kd\left(\sin\theta_\ell+\frac{(N-1)d}{4r_\ell}\right)}$、$\omega_\ell=kd\sin\theta_\ell$、$s_\ell=\frac{kd^2}{2r_\ell}$，则第 $n$ 根天线的接收信号可表示为

$$
y_n=\sum_{\ell=1}^{L}\nu_\ell e^{jn\omega_\ell}e^{jn(N-1-n)s_\ell}+z_n, \tag{6}
$$

而阵列上的信号用向量形式可表示为

$$
\mathbf y=\sum_{\ell=1}^{L}\nu_\ell\,\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)+\mathbf n, \tag{7}
$$

其中 $\mathbf a(\omega_\ell)\triangleq[1,e^{j\omega_\ell},\ldots,e^{j(N-1)\omega_\ell}]^{T}\in\mathbb C^N$，$\mathbf c(s_\ell)\triangleq[e^{jn(N-1-n)s_\ell}]_{n=0}^{N-1}\in\mathbb C^N$（即第 $n$ 个元素为 $e^{jn(N-1-n)s_\ell}$），$\odot$ 表示两向量的逐元素乘积。

**注 1。** 在远场传输中 $r_\ell\to\infty$，$s_\ell$ 实际上消失，即 $s_\ell\to0$，阵列响应向量 $\mathbf c(s_\ell)$ 趋于全 1 向量。于是式 (7) 的系统模型退化为远场传输中广为人知的模型。

### C. UPA 近场信道建模

令 $N_H$ 与 $N_V$ 分别表示 UPA 每行与每列的天线数，总天线数 $N=N_HN_V$。我们考虑垂直与水平方向上相邻天线的间距相同且均匀，均为 $\Delta$。天线按行顺序编号，索引参数 $i\in\{1,\ldots,N\}$。假设天线阵列部署在 $yz$ 平面上，第 $i$ 根天线相对原点的位置由向量

$$
\mathbf u_i=[0,\ m_i\Delta,\ n_i\Delta]^{T}
$$

给出，其中 $m_i=\operatorname{mod}(i-1,N_H)$，$n_i=\left\lfloor\frac{i-1}{N_H}\right\rfloor$ 分别表示水平与垂直索引。这里 $\operatorname{mod}(\cdot,\cdot)$ 为取模运算，$\lfloor\cdot\rfloor$ 为截断（下取整）运算。第 $\ell$ 个散射体与基站之间的近场信道可建模为

$$
\mathbf h_\ell=\alpha_\ell\,\mathbf b(r_\ell,\theta_\ell,\varphi_\ell)\in\mathbb C^{N\times1}, \tag{8}
$$

其中

$$
\mathbf b(r_\ell,\theta_\ell,\varphi_\ell)
=\left[e^{jk\left(r_\ell-d_\ell^{(1)}\right)},\ldots,e^{jk\left(r_\ell-d_\ell^{(N)}\right)}\right]^{T}, \tag{9}
$$

而基站第 $i$ 根天线到散射体的距离 $d_\ell^i$ 为

$$
\begin{aligned}
d_\ell^i&=\Big[\left(r_\ell\cos\theta\cos\varphi\right)^2
+\left(r_\ell\cos\theta\sin\varphi-m_i\Delta\right)^2
+\left(r_\ell\sin\theta-n_i\Delta\right)^2\Big]^{\frac12}\\
&=r_\ell\left[1-\frac{2\Delta}{r_\ell}\left(m_i\cos\theta\sin\varphi+n_i\sin\theta\right)
+\frac{\Delta^2}{r_\ell^2}\left(m_i^2+n_i^2\right)\right]^{\frac12}.
\end{aligned}\tag{10}
$$

距离 $d_\ell^i$ 可进一步近似 [41] 为

$$
d_\ell^i\approx r_\ell-\Delta\left(m_i\cos\theta\sin\varphi+n_i\sin\theta\right)
+\Delta^2\left(\frac{m_i^2+n_i^2}{2r_\ell}\right). \tag{11}
$$

因此，导向矢量 $\mathbf b(r_\ell,\theta_\ell,\varphi_\ell)$ 的第 $i$ 个元素为

$$
\begin{aligned}
b_i(r_\ell,\theta_\ell,\varphi_\ell)
&=\exp\left(j\frac{2\pi}{\lambda}\Delta m_i\cos\theta\sin\varphi\right)\\
&\quad\times\exp\left(j\frac{2\pi}{\lambda}\Delta n_i\sin\theta\right)\\
&\quad\times\exp\left(-j\frac{2\pi}{\lambda}\cdot\frac{\Delta^2}{2r_\ell}\left(m_i^2+n_i^2\right)\right).
\end{aligned}\tag{12}
$$

于是，UPA 阵列响应向量可表示为

$$
\mathbf b(r_\ell,\theta_\ell,\varphi_\ell)
=\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell), \tag{13}
$$

其中 $\mathbf a(\omega_\ell)\triangleq\left[e^{j\omega m_1},\ldots,e^{j\omega m_N}\right]^{T}\in\mathbb C^N$，$\mathbf c(\psi_\ell)\triangleq\left[e^{j\psi m_1},\ldots,e^{j\psi m_N}\right]^{T}\in\mathbb C^N$，$\mathbf d(s_\ell)\triangleq\left[e^{-js\left(m_1^2+n_1^2\right)},\ldots,e^{-js\left(m_M^2+n_M^2\right)}\right]^{T}\in\mathbb C^N$，且

$$
\omega=\frac{2\pi}{\lambda}\Delta\cos\theta\sin\varphi,\qquad
\psi=\frac{2\pi}{\lambda}\Delta\sin\theta,\qquad
s=\frac{2\pi\Delta^2}{\lambda\cdot2r_\ell}.
$$

最后，接收信号可表示为

$$
\mathbf y=\sum_{\ell=1}^{L}\alpha_\ell\,\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)+\mathbf n. \tag{14}
$$

## III. 近场参数的变分推断

在上一节给出的近场信道新表示基础上，我们为近场 CE 发展 SG-VB 算法。具体而言，先回顾 VB 方法的背景，再分别推导 ULA 与 UPA 情形下 DoA 分量与距离分量的闭式更新。

### A. 变分贝叶斯推断背景

记 $\mathbf y$ 为全部观测变量的集合，$\mathbf h$ 为 $m$ 个潜变量与参数的集合。概率模型给出联合分布 $p(\mathbf y,\mathbf h)$。估计问题旨在求后验 $p(\mathbf h\mid\mathbf y)$，而它通常计算上不可处理。为克服该问题，变分推断旨在密度族 $\mathcal Q$ 参数化范围内寻找分布 $q(\mathbf h)$，通过最小化 Kullback-Leibler（KL）散度 [42]、[43] 来逼近真实后验：

$$
q^\star(\mathbf h)=\arg\min_{q(\mathbf h)\in\mathcal Q}\mathrm{KL}\left(q(\mathbf h)\,\|\,p(\mathbf h\mid\mathbf y)\right). \tag{15}
$$

这等价于最大化如下定义的信度下界（evidence lower bound，ELBO）：

$$
\mathrm{ELBO}(q)=\mathbb E_{q(\mathbf h)}\left[\ln p(\mathbf h,\mathbf y)\right]-\mathbb E_{q(\mathbf h)}\left[\ln q(\mathbf h)\right]. \tag{16}
$$

$\mathrm{ELBO}(q)$ 的最大值在 $q(\mathbf h)=p(\mathbf h\mid\mathbf y)$ 时取得。此外，VB 依赖平均场变分族 [42]

$$
q(\mathbf h)=\prod_{i=1}^{m}q_i(h_i), \tag{17}
$$

其中各潜变量被假定相互独立，每个变量对应变分分布中的一个独立因子。变分密度 $q_i(h_i)$ 的最优解为 [42]

$$
q_i^\star(h_i)\propto\exp\left\{\left\langle\ln p(\mathbf y\mid\mathbf h)+\ln p(\mathbf h)\right\rangle_{-h_i}\right\}. \tag{18}
$$

这里 $\langle\cdot\rangle_{-h_i}$ 表示在其余全部潜变量上、以当前固定的变分密度 $q_{-i}(\mathbf h_{-i})=\prod_{j\ne i}q_j(h_j)$ 取得的期望。通过对所有 $j$ 依次更新 $q_i^\star(h_i)$，目标函数 $\mathrm{ELBO}(q)$ 单调增大。该迭代方案构成坐标上升变分推断（coordinate ascent variational inference，CAVI）算法的基础，可保证收敛到 $\mathrm{ELBO}(q)$ 的至少一个局部最优 [42]、[43]。

### B. 面向 ULA 信道估计的 SG-VB

定义 $\gamma\triangleq1/N_0$ 为精度，将其视为待由 VB 框架估计的未知随机变量。目标是给定观测 $\mathbf y$，借助辅助变量 $\boldsymbol\omega=[\omega_1,\ldots,\omega_L]^T$ 与 $\mathbf s=[s_1,\ldots,s_L]^T$，分别推断 DoA $\boldsymbol\theta=[\theta_1,\ldots,\theta_L]^T$ 与距离 $\mathbf r=[r_1,\ldots,r_L]^T$ 的分布。为此采用平均场变分分布 $q(\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\gamma)$，满足

$$
\begin{aligned}
p(\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\boldsymbol\beta,\gamma\mid\mathbf y)
&\approx q(\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\boldsymbol\beta,\gamma)\\
&=q(\boldsymbol\nu)q(\boldsymbol\omega)q(\mathbf s)q(\boldsymbol\beta)q(\gamma)\\
&=q(\gamma)\left[\prod_{\ell=1}^{L}q(\nu_\ell)q(\omega_\ell)q(s_\ell)q(\beta_\ell)\right].
\end{aligned}\tag{19}
$$

基于 VB 框架，为得到变分密度的最优解，需要观测变量 $\mathbf y$ 与潜变量 $\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\boldsymbol\beta,\gamma$ 的联合分布 $p(\mathbf y,\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\boldsymbol\beta,\gamma)$，其可分解为

$$
p(\mathbf y,\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\boldsymbol\beta,\gamma)
=p(\mathbf y\mid\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\gamma)
p(\boldsymbol\nu\mid\boldsymbol\beta)p(\boldsymbol\omega)p(\mathbf s)p(\boldsymbol\beta)p(\gamma). \tag{20}
$$

由于近场信道本质上是稀疏的，对路径增益采用 Gamma–Gaussian 先验以强制估计路径的稀疏性，从而支持闭式贝叶斯推断。因此假设 $\nu_\ell$ 服从零均值高斯分布，即 $p(\nu_\ell\mid\beta_\ell)=\mathcal{CN}\left(\nu_\ell;0,\beta_\ell^{-1}\right)$，其中方差 $\beta_\ell$ 服从 Gamma 分布 $p(\beta_\ell)=\Gamma(a_\beta,b_\beta)$。

**1）更新 $\omega_\ell$。** 对条件分布关于除 $\omega_\ell$ 之外的全部潜变量取期望，可得变分分布 $q(\omega_\ell)$：

$$
\begin{aligned}
q(\omega_\ell)&\propto p(\omega_\ell)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\gamma)\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\omega_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{\ell=1}^{L}\nu_\ell\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)\right\|^{2}\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\omega_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{k\ne\ell}\nu_k\mathbf a(\omega_k)\odot\mathbf c(s_k)-\nu_\ell\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)\right\|^{2}\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\omega_\ell)\exp\left\{\Re\left\{\boldsymbol\eta_\ell^{H}\mathbf a(\omega_\ell)\right\}\right\},
\end{aligned}\tag{21}
$$

其中

$$
\begin{aligned}
\boldsymbol\eta_\ell
&=2\hat\gamma\hat\nu_\ell^{*}\left\langle\mathbf c^{*}(s_\ell)\right\rangle\odot\left(\mathbf y-\sum_{k\ne\ell}\hat\nu_k\left\langle\mathbf a(\omega_k)\right\rangle\odot\left\langle\mathbf c(s_k)\right\rangle\right)\\
&=2\hat\gamma\hat\nu_\ell^{*}\hat{\mathbf c}_\ell^{*}\odot\left(\boldsymbol\varepsilon+\nu_\ell\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right).
\end{aligned}\tag{22}
$$

这里为记号方便，记 $\hat{\mathbf c}_\ell=\left\langle\mathbf c(s_\ell)\right\rangle$、$\hat{\mathbf a}_\ell=\left\langle\mathbf a(\omega_\ell)\right\rangle$ 为 $\mathbf a(\omega_\ell)$ 的当前变分均值，$\boldsymbol\varepsilon=\mathbf y-\sum_{\ell=1}^{L}\hat\nu_\ell\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell$ 为使用 $\nu_\ell,\omega_\ell,s_\ell$（$\forall\ell=1,\ldots,L$）当前估计的残差项。与变分线谱估计的原理一致 [44]，$q(\omega_\ell)$ 由启发式算法 2 近似为 von Mises 分布，均值为 $\hat\omega_\ell$、集中参数为 $\kappa_{\omega_\ell}$，由此得到期望导向矢量 $\hat{\mathbf a}(\omega_\ell)=\mathbf A(\kappa_{\omega_\ell})\mathbf a(\hat\omega_\ell)$，其中

$$
\mathbf A(\kappa_{\omega_\ell})=\operatorname{diag}\left(1,\frac{I_1(\kappa_{\omega_\ell})}{I_0(\kappa_{\omega_\ell})},\ldots,\frac{I_{N-1}(\kappa_{\omega_\ell})}{I_0(\kappa_{\omega_\ell})}\right). \tag{23}
$$

von Mises 参数化允许闭式变分更新，同时消除基于网格的压缩感知方法中出现的谱离散化伪影。von Mises 分布的补充细节见附录 A。

**2）更新 $s_\ell$。** 对条件分布关于除 $s_\ell$ 之外的全部潜变量取期望，可推导变分分布 $q(s_\ell)$：

$$
\begin{aligned}
q(s_\ell)&\propto p(s_\ell)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\gamma)\right\rangle_{-s_\ell}\right\}\\
&\propto p(s_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{k\ne\ell}\nu_k\mathbf a(\omega_k)\odot\mathbf c(s_k)-\nu_\ell\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)\right\|^{2}\right\rangle_{-s_\ell}\right\}\\
&\propto p(s_\ell)\exp\left\{\Re\left\{\boldsymbol\zeta_\ell^{H}\mathbf c(s_\ell)\right\}\right\},
\end{aligned}\tag{24}
$$

其中

$$
\begin{aligned}
\boldsymbol\zeta_\ell
&=2\hat\gamma\hat\nu_\ell^{*}\left\langle\mathbf a^{*}(\omega_\ell)\right\rangle\odot\left(\mathbf y-\sum_{k\ne\ell}\hat\nu_k\left\langle\mathbf a(\omega_k)\right\rangle\odot\left\langle\mathbf c(s_k)\right\rangle\right)\\
&=2\hat\gamma\hat\nu_\ell^{*}\hat{\mathbf a}_\ell^{*}\odot\left(\boldsymbol\varepsilon+\nu_\ell\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right).
\end{aligned}\tag{25}
$$

注意 $s_\ell$ 必须为正；因此若变分均值 $\langle s_\ell\rangle$ 为负，则按注 1 所述将估计 $\hat s_\ell$ 置为 0，这对应于第 $\ell$ 个用户处于远场。为求最优 $s_\ell$，在给定残差相关性的条件下最大化 $s_\ell$ 的对数似然：

$$
\left[\mathcal L_\ell\right]_k=\Re\left\{\boldsymbol\zeta_\ell^{H}\mathbf c(s_k)\right\}, \tag{26}
$$

其中 $s_k\in\mathcal S_{\mathrm{grid}}$，$k=1,\ldots,K$，$K$ 表示集合 $\mathcal S_{\mathrm{grid}}$ 中粗网格点的数目。

为此，我们提出如下由粗到细的网格搜索策略。首先，在粗网格上按最大似然准则估计 $s_\ell$：

$$
\hat s_\ell=\arg\max_{k}\mathcal L_\ell, \tag{27}
$$

其中 $s_\ell\in\{s_k\}_{k=1}^{K}$。接着，$[\mathcal L_\ell]_k$ 关于 $s_\ell$ 的一阶与二阶导数为

$$
\Delta\left[\mathcal L_\ell\right]_k=-\Im\left\{\boldsymbol\zeta_\ell^{H}\left(\mathbf m\odot\mathbf c(s_k)\right)\right\}, \tag{28}
$$

$$
\Delta^2\left[\mathcal L_\ell\right]_k=-\Re\left\{\boldsymbol\zeta_\ell^{H}\left(\mathbf m^2\odot\mathbf c(s_k)\right)\right\}, \tag{29}
$$

其中索引向量定义为 $\mathbf m\triangleq[0,\ldots,n(N-1-n),\ldots,0]^{T}\in\mathbb C^N$。随后用这些导数通过 Newton–Raphson 更新迭代细化 $s_\ell$ 的估计：

$$
s_\ell^{t+1}=s_\ell^{t}-\epsilon\frac{\Delta\mathcal L\left(s_\ell^{t}\right)}{\Delta^2\mathcal L\left(s_\ell^{t}\right)}, \tag{30}
$$

其中步长 $\epsilon$ 通常取 0.01。所提 GridSearch 流程总结于算法 1。

**算法 1　用于估计 $s_\ell$ 的 GridSearch 算法**

1. **输入：** $\boldsymbol\zeta_\ell^{H}\mathbf c(s_k)$ 与 $\mathcal S_{\mathrm{grid}}$。
2. **输出：** $s_\ell$。
3. 计算全部 $\left[\mathcal L_\ell\right]_k\leftarrow\Re\left(\boldsymbol\zeta_\ell^{H}\mathbf c(s_k)\right)$，$\forall k\in\mathcal S_{\mathrm{grid}}$。
4. $\hat s_\ell=\arg\max_k\mathcal L_\ell$。
5. **while** $\xi>0$ **do**
6. 　$s_\ell^{t+1}\leftarrow s_\ell^{t}-\epsilon\dfrac{\Delta\mathcal L\left(s_\ell^{t}\right)}{\Delta^2\mathcal L\left(s_\ell^{t}\right)}$。
7. 　$\xi\leftarrow\left|\mathcal L_\ell\left(s_\ell^{t+1}\right)-\mathcal L_\ell\left(s_\ell^{t}\right)\right|$。
8. **end while**

**3）更新 $\nu_\ell$。** 变分分布 $q(\nu_\ell)$ 可推导为

$$
q(\nu_\ell)\propto\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\gamma)+\ln p(\nu_\ell\mid\beta_\ell)\right\rangle_{-\nu_\ell}\right\}. \tag{31}
$$

$$
\begin{aligned}
q(\nu_\ell)&\propto\mathcal{CN}\left\{-\hat\gamma\left(N|\nu_\ell|^2-2\Re\left\{\nu_\ell\left(\mathbf y-\sum_{k\ne\ell}\hat\nu_k\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right)^{H}\left(\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right)\right\}\right)-\left\langle\beta_\ell\right\rangle|\nu_\ell|^2\right\}\\
&\propto\mathcal{CN}\left(\nu_\ell;z_\ell,(N\hat\gamma)^{-1}\right)\mathcal{CN}\left(\nu_\ell;0,\hat\beta_\ell^{-1}\right)\\
&\propto\mathcal{CN}\left(\nu_\ell;\hat\nu_\ell,\tau_{\nu_\ell}\right),
\end{aligned}\tag{32}
$$

其中 $z_\ell\triangleq\left(\hat\nu_\ell\left\|\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right\|^{2}+\left(\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right)^{H}\boldsymbol\varepsilon\right)/N$，$\tau_{\nu_\ell}=(N\hat\gamma+\hat\beta_\ell)^{-1}$，$\hat\nu_\ell=z_\ell N\hat\gamma(N\hat\gamma+\hat\beta_\ell)^{-1}$。式 (32) 利用两个高斯密度乘积的性质得到（脚注 1）。

> 脚注 1（两个高斯密度乘积的性质）：
> $$\mathcal{CN}(\mathbf x;\mathbf a,\mathbf A)\mathcal{CN}(\mathbf x;\mathbf b,\mathbf B)=\mathcal{CN}(\mathbf 0;\mathbf a-\mathbf b,\mathbf A+\mathbf B)\times\mathcal{CN}\left(\mathbf x;(\mathbf A^{-1}+\mathbf B^{-1})^{-1}(\mathbf A^{-1}\mathbf a+\mathbf B^{-1}\mathbf b),(\mathbf A^{-1}+\mathbf B^{-1})^{-1}\right).$$

**4）更新 $\beta_\ell$。** 变分分布 $q(\beta_\ell)$ 可表示为

$$
q(\beta_\ell)\propto p(\beta_\ell)\exp\left\{\left\langle p(\nu_\ell\mid\beta_\ell)\right\rangle\right\}. \tag{33}
$$

因此 $q(\beta_\ell)$ 是均值为 $\hat\beta_\ell=\left(|\hat\nu_\ell|^2+\tau_{\nu_\ell}\right)^{-1}$ 的 Gamma 分布。

**5）更新 $\gamma$。** 变分分布 $q(\gamma)$ 可推导为

$$
q(\gamma)\propto p(\gamma)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\gamma)\right\rangle_{-\gamma}\right\}
\propto p(\gamma)\exp\left\{N\ln\gamma-\gamma\left\langle\left\|\mathbf y-\sum_{\ell=1}^{L}\nu_\ell\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)\right\|^{2}\right\rangle\right\}.
$$

因此 $q(\gamma)$ 是均值为

$$
\hat\gamma=\frac{a_\gamma+N}{b_\gamma+\left\langle\left\|\mathbf y-\sum_{\ell=1}^{L}\nu_\ell\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)\right\|^{2}\right\rangle}, \tag{34}
$$

其中

$$
\begin{aligned}
\left\langle\left\|\mathbf y-\sum_{\ell=1}^{L}\nu_\ell\mathbf a(\omega_\ell)\odot\mathbf c(s_\ell)\right\|^{2}\right\rangle
&=\|\boldsymbol\varepsilon\|^{2}+\sum_{\ell=1}^{L}\tau_{\nu_\ell}\left\|\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right\|^{2}\\
&\quad+\sum_{\ell=1}^{L}\left(|\hat\nu_\ell|^{2}+\tau_{\nu_\ell}\right)\left(N-\left\|\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\right\|^{2}\right).
\end{aligned}\tag{35}
$$

式 (35) 的展开来自 [45] 中的定理 1。通过迭代更新 $\omega_\ell$、$s_\ell$、$\nu_\ell$、$\gamma$，得到用于近场信道估计问题的 SG-VB 算法，总结于算法 2。

**算法 2　面向 ULA 近场信道估计的 SG-VB 算法**

1. **输入：** $\mathbf y$。
2. **输出：** $\hat{\boldsymbol\omega}$、$\hat{\boldsymbol\nu}$、$\hat{\mathbf s}$ 与 $\hat{\mathbf h}$。
3. 初始化 $\hat{\mathbf h}=\mathbf y$，$\boldsymbol\varepsilon^{1}=\mathbf y-\sum_{\ell=1}^{L}\hat\nu_\ell\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell$，且 $\hat{\boldsymbol\nu}^{1}=\mathbf 0$。
4. **for** $t=1,2,\ldots$ **do**
5. 　**for** $\ell=1,\ldots,L$ **do**
6. 　　$\boldsymbol\eta_\ell=2\hat\gamma^{t}\left(\hat\nu_\ell^{t}\right)^{*}\left(\hat{\mathbf c}_\ell^{t}\right)^{*}\odot\left(\boldsymbol\varepsilon+\nu_\ell^{t}\hat{\mathbf a}_\ell^{t}\odot\hat{\mathbf c}_\ell^{t}\right)$。
7. 　　$\left[\hat\omega_\ell^{t},\hat\kappa_{s\ell}^{t}\right]=\mathrm{Heuristic2}\left(\boldsymbol\eta_\ell\right)$。
8. 　　$\hat{\mathbf a}_\ell^{t+1}\leftarrow\mathbf A\left(\hat\kappa_{s\ell}^{t}\right)\mathbf a_\ell\left(\hat\omega_\ell^{t}\right)$。
9. 　　$\boldsymbol\varepsilon\leftarrow\boldsymbol\varepsilon+\hat\nu_\ell^{t}\left(\hat{\mathbf a}_\ell^{t}-\hat{\mathbf a}_\ell^{t+1}\right)\odot\hat{\mathbf c}_\ell^{t}$。
10. 　　$\boldsymbol\zeta_\ell\leftarrow2\hat\gamma^{t}\left(\hat\nu_\ell^{t}\right)^{*}\left(\hat{\mathbf a}_\ell^{t+1}\right)^{*}\odot\left(\boldsymbol\varepsilon+\nu_\ell^{t}\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t}\right)$。
11. 　　$\hat s_\ell^{t+1}=\mathrm{GridSearch}\left(\boldsymbol\zeta_\ell\right)$。
12. 　　$\hat{\mathbf c}_\ell^{t+1}\leftarrow\mathbf c_\ell\left(\hat s_\ell^{t+1}\right)$。
13. 　　$\boldsymbol\varepsilon\leftarrow\boldsymbol\varepsilon+\hat\nu_\ell^{t}\hat{\mathbf a}_\ell^{t+1}\odot\left(\hat{\mathbf c}_\ell^{t}-\hat{\mathbf c}_\ell^{t+1}\right)$。
14. 　　$z_\ell=\left[\left(\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t+1}\right)^{H}\boldsymbol\varepsilon+\hat\nu_\ell^{t}\left\|\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t+1}\right\|^{2}\right]/N$。
15. 　　$\tau_{\nu_\ell}^{t+1}\leftarrow\left(\hat\beta_\ell^{t}+N\hat\gamma^{t}\right)^{-1}$。
16. 　　$\hat\nu_\ell^{t+1}\leftarrow z_\ell N\hat\gamma^{t}\tau_{\nu_\ell}^{t+1}$。
17. 　　$\boldsymbol\varepsilon\leftarrow\boldsymbol\varepsilon+\left(\hat\nu_\ell^{t}-\hat\nu_\ell^{t+1}\right)\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t+1}$。
18. 　**end for**
19. 　$\beta^{t+1}\leftarrow(a_\beta+1)/\left(b_\beta+\left\|\hat{\boldsymbol\nu}^{t+1}\right\|^{2}+\tau_{\boldsymbol\nu}^{t+1}\right)$。
20. 　$\boldsymbol\varepsilon\leftarrow\mathbf y-\sum_{\ell=1}^{L}\hat\nu_\ell^{t+1}\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t+1}$。
21. 　$\gamma^{t+1}\leftarrow(a_\gamma+N)\Big/\Big(b_\gamma+\|\boldsymbol\varepsilon\|^{2}+\sum_{\ell=1}^{L}\Big[\left(|\hat\nu_\ell^{t+1}|^{2}+\tau_{\nu_\ell}^{t+1}\right)\left(N-\left\|\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t+1}\right\|^{2}\right)+\tau_{\nu_\ell}^{t+1}\left\|\hat{\mathbf a}_\ell^{t+1}\odot\hat{\mathbf c}_\ell^{t+1}\right\|^{2}\Big]\Big)$。
22. **end for**

> **原文疑点：** 算法 2 第 19 行在原文中写作对单一标量 $\beta^{t+1}$ 的更新，而同节公式 (33) 给出的是逐路径的 $\hat\beta_\ell$；此处按 PDF 原文保留算法行形式，具体逐路径更新以式 (33) 为准。

### C. 面向 UPA 信道估计的 SG-VB

与 ULA 情形类似，令 $\gamma\triangleq1/N_0$ 表示精度，将其视为需由 VB 框架估计的未知随机变量。主要目标是给定观测 $\mathbf y$，借助变量 $\boldsymbol\omega=[\omega_1,\ldots,\omega_L]^T$、$\boldsymbol\psi=[\psi_1,\ldots,\psi_L]^T$ 与 $\mathbf s=[s_1,\ldots,s_L]^T$，分别推断 DoA $\boldsymbol\theta=[\theta_1,\ldots,\theta_L]^T$、$\boldsymbol\varphi=[\varphi_1,\ldots,\varphi_L]^T$ 与距离 $\mathbf r=[r_1,\ldots,r_L]^T$ 的分布。为此采用平均场变分分布 $q(\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)$，满足

$$
\begin{aligned}
p(\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\boldsymbol\beta,\gamma\mid\mathbf y)
&\approx q(\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\boldsymbol\beta,\gamma)\\
&=q(\boldsymbol\alpha)q(\boldsymbol\omega)q(\boldsymbol\psi)q(\mathbf s)q(\boldsymbol\beta)q(\gamma)\\
&=q(\gamma)\prod_{\ell=1}^{L}q(\alpha_\ell)q(\omega_\ell)q(\psi_\ell)q(s_\ell)q(\beta_\ell).
\end{aligned}\tag{36}
$$

观测变量 $\mathbf y$ 与潜变量 $\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\boldsymbol\beta,\gamma$ 的联合分布可分解为

$$
p(\mathbf y,\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\boldsymbol\beta,\gamma)
=p(\mathbf y\mid\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)p(\boldsymbol\alpha\mid\boldsymbol\beta)p(\boldsymbol\omega)p(\boldsymbol\psi)p(\mathbf s)p(\boldsymbol\beta)p(\gamma). \tag{37}
$$

这里假设 $\alpha_\ell$ 服从零均值高斯分布，即 $p(\alpha_\ell\mid\beta_\ell)=\mathcal{CN}\left(\alpha_\ell;0,\beta_\ell^{-1}\right)$，其中方差 $\beta_\ell$ 服从 Gamma 分布 $p(\beta_\ell)=\Gamma(a_\beta,b_\beta)$。

**2a）更新 $\omega_\ell$。** 对条件分布 (37) 关于除 $\omega_\ell$ 之外的全部潜变量取期望，可得变分分布 $q(\omega_\ell)$：

$$
\begin{aligned}
q(\omega_\ell)&\propto p(\omega_\ell)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\omega_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{\ell=1}^{L}\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\omega_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{i\ne\ell}\alpha_i\mathbf a(\omega_i)\odot\mathbf c(\psi_i)\odot\mathbf d(s_i)-\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\omega_\ell)\exp\left\{\Re\left\{\boldsymbol\eta_\ell^{H}\mathbf a(\omega_\ell)\right\}\right\},
\end{aligned}\tag{38}
$$

其中

$$
\boldsymbol\eta_\ell=2\hat\gamma_\ell\hat\alpha_\ell^{*}\odot\hat{\mathbf c}^{*}(\psi_\ell)\odot\hat{\mathbf d}^{*}(s_\ell)\odot\left(\mathbf y-\sum_{i\ne\ell}\alpha_i\hat{\mathbf a}(\omega_i)\odot\hat{\mathbf c}(\psi_i)\odot\hat{\mathbf d}(s_i)\right). \tag{39}
$$

**2b）更新 $\psi_\ell$。** 对条件分布 (37) 关于除 $\psi_\ell$ 之外的全部潜变量取期望，可得变分分布 $q(\psi_\ell)$：

$$
\begin{aligned}
q(\psi_\ell)&\propto p(\psi_\ell)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)\right\rangle_{-\omega_\ell}\right\}\\
&\propto p(\psi_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{\ell=1}^{L}\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle_{-\psi_\ell}\right\}\\
&\propto p(\psi_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{i\ne\ell}\alpha_i\mathbf a(\omega_i)\odot\mathbf c(\psi_i)\odot\mathbf d(s_i)-\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle_{-\psi_\ell}\right\}\\
&\propto p(\psi_\ell)\exp\left\{\Re\left\{\boldsymbol\lambda_\ell^{H}\mathbf c(\psi_\ell)\right\}\right\},
\end{aligned}\tag{40}
$$

其中

$$
\boldsymbol\lambda_\ell=2\hat\gamma_\ell\hat\alpha_\ell^{*}\odot\hat{\mathbf a}^{*}(\omega_\ell)\odot\hat{\mathbf d}^{*}(s_\ell)\odot\left(\mathbf y-\sum_{i\ne\ell}\alpha_i\hat{\mathbf a}(\omega_i)\odot\hat{\mathbf c}(\psi_i)\odot\hat{\mathbf d}(s_i)\right). \tag{41}
$$

**2c）更新 $s_\ell$。** 对条件分布 (37) 关于除 $s_\ell$ 之外的全部潜变量取期望，可得变分分布 $q(s_\ell)$：

$$
\begin{aligned}
q(s_\ell)&\propto p(s_\ell)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)\right\rangle_{-s_\ell}\right\}\\
&\propto p(s_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{\ell=1}^{L}\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle_{-s_\ell}\right\}\\
&\propto p(s_\ell)\exp\left\{-\left\langle\gamma\left\|\mathbf y-\sum_{i\ne\ell}\alpha_i\mathbf a(\omega_i)\odot\mathbf c(\psi_i)\odot\mathbf d(s_i)-\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle_{-\psi_k}\right\}\\
&\propto p(s_\ell)\exp\left\{\Re\left\{\boldsymbol\zeta_\ell^{H}\mathbf d(s_\ell)\right\}\right\},
\end{aligned}\tag{42}
$$

其中

$$
\boldsymbol\zeta_\ell=2\hat\gamma_\ell\hat\alpha_\ell^{*}\odot\hat{\mathbf a}^{*}(\omega_\ell)\odot\hat{\mathbf c}^{*}(\psi_\ell)\odot\left(\mathbf y-\sum_{i\ne\ell}\alpha_i\hat{\mathbf a}(\omega_i)\odot\hat{\mathbf c}(\psi_i)\odot\hat{\mathbf d}(s_i)\right). \tag{43}
$$

与 ULA 情形类似，为求最优 $s_\ell$，在给定残差相关性的条件下最大化 $s_\ell$ 的对数似然：

$$
\left[\mathcal L_\ell\right]_k=\Re\left\{\boldsymbol\zeta_\ell^{H}\mathbf d(s_k)\right\}, \tag{44}
$$

其中 $s_k\in\mathcal S_{\mathrm{grid}}$，$k=1,\ldots,K$，$K$ 表示集合 $\mathcal S_{\mathrm{grid}}$ 中粗网格点数目。$s_\ell$ 的估计通过 Newton–Raphson 更新迭代得到：

$$
s_\ell^{t+1}=s_\ell^{t}-\epsilon\frac{\Delta\mathcal L\left(s_\ell^{t}\right)}{\Delta^2\mathcal L\left(s_\ell^{t}\right)}, \tag{45}
$$

其中步长 $\epsilon$ 取 0.01，$[\mathcal L_\ell]_k$ 关于 $s_\ell$ 的一阶与二阶导数分别可推导为

$$
\Delta\left[\mathcal L_\ell\right]_k=-\Im\left\{\boldsymbol\zeta_\ell^{H}\left(\mathbf m\odot\mathbf c(s_k)\right)\right\}, \tag{46}
$$

$$
\Delta^2\left[\mathcal L_\ell\right]_k=\Re\left\{\boldsymbol\zeta_\ell^{H}\left(\mathbf m^2\odot\mathbf c(s_k)\right)\right\}, \tag{47}
$$

其中索引向量定义为 $\mathbf m\triangleq\left[e^{-js\left(m_1^2+n_1^2\right)},\ldots,e^{-js\left(m_M^2+n_M^2\right)}\right]^{T}\in\mathbb C^N$。

**2d）更新 $\alpha_\ell$。** 对条件分布 (37) 关于除 $\alpha_\ell$ 之外的全部潜变量取期望，可得变分分布 $q(\alpha_\ell)$：

$$
\begin{aligned}
q(\alpha_\ell)&\propto\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)+\ln p(\alpha_\ell\mid\beta_\ell)\right\rangle_{-\alpha_\ell}\right\}\\
&\propto\mathcal{CN}\left\{-\hat\gamma\left(\left\|\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\odot\hat{\mathbf d}_\ell\right\|^{2}|\alpha_\ell|^{2}-2\Re\left\{\alpha_\ell\left(\mathbf y-\sum_{i\ne\ell}\hat\alpha_i\hat{\mathbf a}_i\odot\hat{\mathbf c}_i\odot\hat{\mathbf d}_i\right)^{H}\left(\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\odot\hat{\mathbf d}_\ell\right)\right\}\right)-\left\langle\beta_\ell\right\rangle|\alpha_\ell|^{2}\right\}\\
&\propto\mathcal{CN}\left(\alpha_\ell;z_\ell,(M\hat\gamma)^{-1}\right)\mathcal{CN}\left(\alpha_\ell;0,\hat\beta_\ell^{-1}\right)\\
&\propto\mathcal{CN}\left(\alpha_\ell;\hat\alpha_\ell,\tau_{\alpha_\ell}\right),
\end{aligned}\tag{48}
$$

其中 $z_\ell\triangleq\left(\hat\alpha_\ell\left\|\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\odot\hat{\mathbf d}_\ell\right\|^{2}+\left(\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\odot\hat{\mathbf d}_\ell\right)^{H}\boldsymbol\varepsilon\right)/N$，$\tau_{\alpha_\ell}=(N\hat\gamma+\hat\beta_\ell)^{-1}$，$\hat\alpha_\ell=z_\ell N\hat\gamma(N\hat\gamma+\hat\beta_\ell)^{-1}$。

> **原文疑点：** 式 (48) 中一处写作 $(M\hat\gamma)^{-1}$，而同一段中 $z_\ell$ 的定义分母为 $N$，$\tau_{\alpha_\ell}$ 与 $\hat\alpha_\ell$ 也使用 $N\hat\gamma$；按上下文疑为 $N$ 的笔误。译文保留原文写法，引用时建议对照 PDF 原文。

**2e）更新 $\beta_\ell$。** 变分分布 $q(\beta_\ell)$ 为

$$
q(\beta_\ell)\propto p(\beta_\ell)\exp\left\{\left\langle p(\alpha_\ell\mid\beta_\ell)\right\rangle\right\}, \tag{49}
$$

因此 $q(\beta_\ell)$ 是均值为 $\hat\beta_\ell=\left(|\hat\alpha_\ell|^{2}+\tau_{\alpha_\ell}\right)^{-1}$ 的 Gamma 分布。

**2f）更新 $\gamma$。** 变分分布 $q(\gamma)$ 可推导为

$$
q(\gamma)\propto p(\gamma)\exp\left\{\left\langle\ln p(\mathbf y\mid\boldsymbol\alpha,\boldsymbol\omega,\boldsymbol\psi,\mathbf s,\gamma)\right\rangle_{-\gamma}\right\}
\propto p(\gamma)\exp\left\{\ln\gamma-\gamma\left\langle\left\|\mathbf y-\sum_{\ell=1}^{L}\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle\right\}.
$$

因此 $q(\gamma)$ 是均值为

$$
\hat\gamma=\frac{a_\gamma+N}{b_\gamma+\left\langle\left\|\mathbf y-\sum_{\ell=1}^{L}\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle}, \tag{50}
$$

其中

$$
\begin{aligned}
\left\langle\left\|\mathbf y-\sum_{\ell=1}^{L}\alpha_\ell\mathbf a(\omega_\ell)\odot\mathbf c(\psi_\ell)\odot\mathbf d(s_\ell)\right\|^{2}\right\rangle
&=\|\boldsymbol\varepsilon\|^{2}+\sum_{\ell=1}^{L}\tau_{\alpha_\ell}N\\
&\quad+\sum_{\ell=1}^{L}\left(|\hat\alpha_\ell|^{2}+\tau_{\alpha_\ell}\right)\left(N-\left\|\hat{\mathbf a}_\ell\odot\hat{\mathbf c}_\ell\odot\hat{\mathbf d}_\ell\right\|^{2}\right).
\end{aligned}\tag{51}
$$

通过迭代更新 $\omega_\ell$、$\psi_\ell$、$s_\ell$、$\alpha_\ell$ 与 $\gamma$，得到用于 UPA 近场信道估计问题的 SG-VB 算法。UPA 的 SG-VB 实现与 ULA 高度类似，故省略单独的 UPA 实现总结。

### D. 计算复杂度分析

本节最后给出所提 SG-VB 与 MUSIC [11]、P-SOMP、P-SIGW [17]、SBL [25] 方法的计算复杂度，汇总于表 I。MUSIC 的复杂度为 $\mathcal O(N^3+K_aK_r)$，其中 $K_a$ 与 $K_r$ 分别表示角度与距离采样数。P-SOMP 与 P-SIGW 的计算复杂度为 $\mathcal O(LN^2S)$，$S$ 为距离环数。SBL 的计算复杂度为 $\mathcal O(N^3)$。对所提 SG-VB，算法 2 第 6、7、8、11 步的计算复杂度分别为 $\mathcal O(N)$、$\mathcal O(N^2)$、$\mathcal O(N^2)$ 与 $\mathcal O(NK)$。因此算法 2 的总计算复杂度为 $\mathcal O\left(L(N^2+KN)\right)$。虽然所提 SG-VB 方法的计算复杂度高于 P-SOMP，但其信道估计性能显著更好。

**表 I　各算法的计算复杂度**

| 算法 | 复杂度 |
|---|---|
| 所提 SG-VB | $\mathcal O\left(L(N^2+KN)\right)$ |
| MUSIC [11] | $\mathcal O\left(N^3+K_aK_r\right)$ |
| P-SOMP、P-SIGW [17] | $\mathcal O\left(LN^2S\right)$ |
| SBL [25] | $\mathcal O(N^3)$ |

## IV. 仿真结果

本节给出数值结果，以展示所提 SG-VB 方法在 ULA 与 UPA 两种近场信道估计中的性能。为便于性能比较，我们考虑以下基准方法：

- 最小二乘（LS）法。
- Oracle LS：假设精确已知散射体或用户的角度与距离，因而充任性能界。
- P-SOMP [17]：利用信道在极域中的稀疏性。
- SBL [25]：使用与 P-SOMP 相同的码本将信道变换到极域表示，再用稀疏贝叶斯学习恢复稀疏信道向量。

### A. ULA 信道估计

ULA 的仿真参数汇总于表 II。注意复增益 $\alpha_\ell$ 假设服从零均值、单位方差的高斯分布。除 LS 与 Oracle LS 外，我们将所提 SG-VB 与 MUSIC [12]、P-SIGW [17] 等现有方法比较。除信道估计外，我们还评估角度与距离恢复性能，定义如下：

- 角度估计的均方误差（MSE），定义为

$$
\mathrm{MSE}(\hat{\boldsymbol\theta})=10\log\left(\left\|\boldsymbol\theta-\hat{\boldsymbol\theta}\right\|^{2}\right),
$$

其中 $\hat{\boldsymbol\theta}=\arcsin(\hat{\boldsymbol\omega}/\pi)$ 为估计角度。

- 距离估计的 NMSE，定义为

$$
\mathrm{NMSE}(\hat{\mathbf r})=10\log\left(\frac{\left\|\mathbf r-\hat{\mathbf r}\right\|^{2}}{\left\|\mathbf r\right\|^{2}}\right),
$$

其中 $\hat{\mathbf r}=\pi\lambda/(4\hat{\mathbf s})$ 为估计距离向量。

**表 II　ULA 的仿真配置**

| 参数 | 取值 |
|---|---|
| 阵列天线数 $N$ | 256 |
| 载频 $f_c$ | 100 GHz |
| 最小允许距离 $r_{\min}$ | 3 米 |
| 最大允许距离 $r_{\max}$ | 90 米 |
| 信道路径数 $L$ | 6 |
| $\theta$ 的分布 | $\mathcal U\left(-60^\circ,60^\circ\right)$ |
| 信噪比 SNR | $L/N_0$ |
| SG-VB 最大迭代次数 | 150 |
| MUSIC、P-SOMP、P-SIGW 的角度—距离采样（字典规模） | $3N$ |

图 2 给出网格规模从 $1N$ 到 $4N$ 变化时的 NMSE 随 SNR 变化曲线。可以观察到，网格规模增大时性能改善；但当网格规模从 $3N$ 增至 $4N$ 时，性能增益有限。这可归因于过密网格导致字典原子间高度相关，从而性能提升有限 [46]。因此我们将字典规模取为 $3N$，以平衡性能与复杂度。

图 3 给出全部算法的 NMSE 随 SNR 变化曲线（$L=6$、$N=256$）。所提 SG-VB 在近场信道重建上始终优于 MUSIC、P-SOMP、P-SIGW、LS 与 SBL，尤其在高 SNR 时。在低 SNR 区域，P-SIGW 略优于所提 SG-VB，但其代价是过大的字典。基于 MUSIC 或 OMP 的方法出现的性能饱和可归因于其对固定网格的依赖，这限制了估计精度。SBL 算法性能与 LS 相当，但其有效性受组元素稀疏先验影响，而该先验并不总能得到保证。相比之下，所提 SG-VB 采用无网格方法估计连续 DoA，性能接近 Oracle LS 下界。

图 4 展示全部算法的 NMSE 随用户到阵列中心距离的变化（距离从 5 米到 135 米，步长 10 米；$L=6$、SNR=20 dB、$N=256$）。瑞利距离约为 98.3 米。每条路径独立建模为一个虚拟源，其到基站的距离从 $[r_{\min},r_{\max}]$ 中随机抽取；此外每条路径有各自随机生成的角度 $\theta_\ell$，因此各源并不被约束在同一直线上，模型也不强制其与固定用户—基站距离存在任何显式关系。尽管所提 SG-VB 算法在距离小于 15 米时的性能低于离格（off-grid）P-SIGW，但它在整个距离范围内通过缩小与下界 Oracle LS 的差距取得了出色性能。此外，P-SIGW 的高估计性能以高计算量为代价，因为 P-SOMP、P-SIGW 与 SBL 的码本使用 $3N$ 的角度分辨率，每个角度约 4.3 个非均匀采样距离，合计约 3302 个角度—距离点。

图 5 展示全部算法的角度估计性能随 SNR 的变化。显然，所提 SG-VB 在几乎整个 SNR 范围内优于全部基线，尤其在 SNR 高于 10 dB 时，这得益于其无网格 VB 方法。在 SNR 低于 10 dB 时，包括 P-SOMP、P-SIGW 在内的基于网格的方法略优于 SG-VB；但当真实 DoA 偏离离散角度网格时，它们会出现性能饱和，从而限制了其在高 SNR 下的估计精度。

图 6 给出全部算法的距离估计性能随 SNR 的变化。所提 SG-VB 在 SNR 低于 20 dB 时在基线中取得最佳性能，但在更高 SNR 下被 MUSIC 超越。有意思的是，P-SIGW 相对 P-SOMP 没有带来改进：这是因为 P-SIGW 以粗距离估计初始化，而 P-SOMP 的过完备角度—距离字典已把量化误差降到很低，留给 P-SIGW 做离格细化的空间很小。

### B. UPA 信道估计

对于 UPA 信道估计，除 LS、P-OMP、SBL 与 Oracle LS 外，我们还将 SG-VB 与 3D-MUSIC [14] 比较。该方法采用两阶段策略：先以固定距离估计 DoA，再基于估计的 DoA 估计距离。此外，P-OMP 与 SBL 的码本按与 [18] 相同的方式生成。

**表 III　UPA 的仿真配置**

| 参数 | 取值 |
|---|---|
| 每行天线数 $M_H$ | 16 |
| 每列天线数 $M_V$ | 16 |
| 载频 $f_c$ | 3 GHz |
| 最小允许距离 $r_{\min}$ | 5 米 |
| 最大允许距离 $r_{\max}$ | 25 米 |
| 路径数 $L$ | 3 |
| $\theta$ 的分布 | $\mathcal U\left(-60^\circ,60^\circ\right)$ |
| $\varphi$ 的分布 | $\mathcal U\left(-80^\circ,80^\circ\right)$ |
| 信噪比 SNR | $L/N_0$ |
| SG-VB 最大迭代次数 | 200 |

图 7 给出近场信道估计的 NMSE 随 SNR 的变化。与 ULA 情形类似，所提 SG-VB 在整个 SNR 范围内优于 MUSIC、P-SOMP、SBL 与 LS。这些结果凸显了 SG-VB 无论阵列几何如何都能有效进行近场信道估计，这得益于其无网格 DoA 估计与由粗到细的距离估计。

在图 8 中，我们考察全部算法的近场信道估计 NMSE 性能。可以看到，所提 SG-VB 优于全部方法，并取得最接近 Oracle LS 性能界的性能；特别是，SG-VB 相对 LS 与 SBL 提供恒定的 14 dB NMSE 增益，同时比 3D-MUSIC 与 P-SOMP 高效得多。

> **原文疑点：** 原文在此处写道"In Fig. 8, we investigate the NMSE ... with respect to SNR"，但图 8 的图注为 "NMSE vs. Distance for UPA"（横轴为距离）。译文按原文语序保留该说法并在此加注，引用时请对照图 8 实际横轴（距离）。

图 9 与图 10 给出全部算法的角度估计性能随 SNR 的变化。可以看到，所提 SG-VB 在角度恢复上优于 3D-MUSIC、P-SOMP 与 SBL，尤其在高 SNR 时。在低于 0 dB 的低 SNR 下，P-SOMP 与 SBL 等基于码本的方法优于所提 SG-VB；但其性能随 SNR 升高很快饱和。这是由于过完备字典在高 SNR 下几乎不再留出改进空间。相比之下，SG-VB 的无网格角度估计在高 SNR 下取得约 20 dB 增益，证明了所提方法的优越性。

图 11 给出全部算法的 NMSE 距离估计性能随 SNR 的变化。显然，所提 SG-VB 在整个 SNR 范围内相比其他方法一致取得更优性能；特别是在高 SNR 下，其 NMSE 相对 P-SOMP、SBL 与 3D-MUSIC 分别取得 8 dB 与 8 dB 增益。与 ULA 情形不同，3D-MUSIC 的距离估计精度较差，因为它依赖估计的 DoA 做距离估计，容易受误差传播影响。

## V. 结论

本文为 XL-MIMO 系统中的近场信道估计发展了一种高效的 SG-VB 算法。通过引入新的表示，DoA 与距离在估计问题中被分离为不同的随机变量。基于这些表示，我们在 VB 框架下推导了每个随机变量的闭式变分分布，使方法同时适用于 ULA 与 UPA。为有效应对近场球面波前特性带来的挑战，我们进一步提出无网格 DoA 估计方法，并结合用于距离估计的细化网格搜索策略。大量仿真结果表明，所提 SG-VB 算法在近场信道估计中优于 MUSIC、P-OMP、P-SIGW、SBL 与 LS。SG-VB 在信道重建、距离估计与 DoA 估计上取得最低 NMSE，尤其在高 SNR 时。研究结果表明，SG-VB 可在推进下一代 XL-MIMO 系统信道估计方面发挥关键作用，为可靠、高性能的无线通信作出贡献。

## 致谢与说明

本文部分工作已发表于 2025 Asilomar Conference on Signals, Systems, and Computers（Pacific Grove, CA, USA, Oct. 2025）[1]。

## 附录 A. von Mises 分布的若干结果

给定 $\theta$ 服从均值为 $\mu$、集中参数为 $\kappa$ 的 von Mises 分布，则

$$
p(\theta)=\frac{e^{\kappa\cos(\theta-\mu)}}{2\pi I_0(\kappa)}
\propto\exp\left\{\Re\left\{\eta^{*}e^{j\theta}\right\}\right\}, \tag{52}
$$

其中 $\eta=\kappa e^{j\mu}$，$I_0(\kappa)$ 为第一类 Bessel 函数，定义为

$$
I_0(\kappa)=\frac{1}{2\pi}\int_{-\pi}^{\pi}e^{\kappa\cos x}\,dx.
$$

我们还有如下结果

$$
I_n(\kappa)=\frac{1}{\pi}\int_{0}^{\pi}e^{\kappa\cos x}\cos nx\,dx.
$$

其圆周矩为

$$
\mathbb E\left[e^{jn\theta}\right]=\frac{I_n(\kappa)}{I_0(\kappa)}e^{jn\mu}=d_n(\kappa)e^{jn\mu}, \tag{53}
$$

$$
\operatorname{var}\left[e^{jn\theta}\right]
=\mathbb E\left[\left|e^{jn\theta}\right|^{2}\right]
-\left|\mathbb E\left[e^{jn\theta}\right]\right|^{2}
=1-\left(\frac{I_n(\kappa)}{I_0(\kappa)}\right)^{2}. \tag{54}
$$

## 图注与表注

**图 1：** 所考虑的近场系统示意：基站以 ULA（或 UPA）配置接收来自多个散射体的 $L$ 条信号路径以及用户的视距路径，示意近场球面波前与各天线单元的到达方向。

**图 2：** 不同网格规模下的 NMSE 随 SNR 变化（SNR 横轴约 $-5$ 至 35 dB，NMSE 纵轴以 dB 计）。网格规模越大性能越好，但由 $3N$ 增至 $4N$ 时增益有限，故取字典规模 $3N$。

**图 3：** $L=6$、$N=256$ 时各算法的 NMSE 随 SNR 变化。所提 SG-VB 在全 SNR 范围优于 MUSIC、P-SOMP、P-SIGW、LS 与 SBL，并接近 Oracle LS 下界。

**图 4：** ULA 在 $L=6$、SNR=20 dB、$N=256$ 时 NMSE 随距离（5–135 米）的变化。瑞利距离约 98.3 米；所提 SG-VB 在整个距离范围内缩小了与 Oracle LS 的差距。

**图 5：** ULA 在 $L=6$、$N=256$ 时角度估计 MSE 随 SNR 的变化。所提 SG-VB 在几乎整个 SNR 范围优于基线，高 SNR 下优势明显。

**图 6：** ULA 在 $L=6$、$N=256$ 时距离估计 NMSE 随 SNR 的变化。SNR 低于 20 dB 时 SG-VB 在基线中最优，更高 SNR 下被 MUSIC 超越。

**图 7：** UPA 在 $L=3$、$N=256$ 时近场信道估计 NMSE 随 SNR 的变化。所提 SG-VB 在整个 SNR 范围优于 MUSIC、P-SOMP、SBL 与 LS。

**图 8：** UPA 在 $L=3$、SNR=20 dB、$N=256$ 时 NMSE 随距离（5–50 米附近）的变化。所提 SG-VB 最接近 Oracle LS 性能界，相对 LS 与 SBL 有约 14 dB NMSE 增益。

**图 9：** UPA 在 $L=3$、$N=256$ 时俯仰角估计 MSE 随 SNR 的变化。

**图 10：** UPA 在 $L=3$、$N=256$ 时方位角估计 MSE 随 SNR 的变化。

**图 11：** UPA 在 $L=3$、$N=256$ 时距离估计 NMSE 随 SNR 的变化。所提 SG-VB 在全 SNR 范围最优，高 SNR 下相对 P-SOMP、SBL 与 3D-MUSIC 约有 8 dB 增益。

**表 I：** 各算法计算复杂度：SG-VB 为 $\mathcal O(L(N^2+KN))$，MUSIC 为 $\mathcal O(N^3+K_aK_r)$，P-SOMP/P-SIGW 为 $\mathcal O(LN^2S)$，SBL 为 $\mathcal O(N^3)$。

**表 II：** ULA 仿真配置：$N=256$、$f_c=100$ GHz、$r_{\min}=3$ m、$r_{\max}=90$ m、$L=6$、$\theta\sim\mathcal U(-60^\circ,60^\circ)$、SNR$=L/N_0$、SG-VB 最大迭代 150 次、字典规模 $3N$。

**表 III：** UPA 仿真配置：$M_H=16$、$M_V=16$、$f_c=3$ GHz、$r_{\min}=5$ m、$r_{\max}=25$ m、$L=3$、$\theta\sim\mathcal U(-60^\circ,60^\circ)$、$\varphi\sim\mathcal U(-80^\circ,80^\circ)$、SNR$=L/N_0$、SG-VB 最大迭代 200 次。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 12–13 页转录；未逐条核对 DOI）。

[1] T.-V. Nguyen, V.-C. Luu, and D. H. N. Nguyen, “Semi-gridless channel estimation in XL-MIMO: Near-field vs. far-field,” in 2025 59th Proc. Asilomar Conf. Signals, Systems, and Comp., IEEE, 2025.

[2] C.-X. Wang, X. You, X. Gao, X. Zhu, Z. Li, C. Zhang, H. Wang, Y. Huang, Y. Chen, H. Haas et al., “On the road to 6G: Visions, requirements, key technologies, and testbeds,” IEEE Commun. Surv. Tutor., vol. 25, no. 2, pp. 905–974, 2023.

[3] E. Björnson, L. Sanguinetti, H. Wymeersch, J. Hoydis, and T. L. Marzetta, “Massive MIMO is a reality—what is next?: Five promising research directions for antenna arrays,” Digital Signal Processing, vol. 94, pp. 3–20, 2019.

[4] S. Ye, M. Xiao, M.-W. Kwan, Z. Ma, Y. Huang, G. Karagiannidis, and P. Fan, “Extremely large aperture array (ELAA) communications: Foundations, research advances and challenges,” IEEE Open J. Commun. Soc., 2024.

[5] S. Thomas, J. S. Virdi, A. Babakhani, and I. P. Roberts, “A survey on advancements in THz technology for 6G: Systems, circuits, antennas, and experiments,” IEEE Open J. Commun. Soc., 2025.

[6] J. An, C. Yuen, L. Dai, M. Di Renzo, M. Debbah, and L. Hanzo, “Near-field communications: Research advances, potential, and challenges,” IEEE Wireless Communications, vol. 31, no. 3, pp. 100–107, 2024.

[7] Y. Liu, Z. Wang, J. Xu, C. Ouyang, X. Mu, and R. Schober, “Near-field communications: A tutorial review,” IEEE Open J. Commun. Soc., vol. 4, pp. 1999–2049, 2023.

[8] H. Lu, Y. Zeng, C. You, Y. Han, J. Zhang, Z. Wang, Z. Dong, S. Jin, C.-X. Wang, T. Jiang et al., “A tutorial on near-field XL-MIMO communications toward 6G,” IEEE Commun. Surv. Tutor., vol. 26, no. 4, pp. 2213–2257, 2024.

[9] C. A. Balanis, Antenna theory: analysis and design. John Wiley & Sons, 2016.

[10] Y. Liu, J. Xu, Z. Wang, X. Mu, and L. Hanzo, “Near-field communications: What will be different?” IEEE Wireless Communications, vol. 32, no. 2, pp. 262–270, 2025.

[11] P. Stoica and R. Moses, Spectral Analysis of Signals. Englewood Cliffs, NJ, USA: Prentice-Hall, 2005.

[12] J. He, M. Swamy, and M. O. Ahmad, “Efficient application of MUSIC algorithm under the coexistence of far-field and near-field sources,” IEEE Trans. Signal Process., vol. 60, no. 4, pp. 2066–2070, Apr. 2012.

[13] K. Qu, S. Guo, J. Ye, and H. Zhao, “Two-stage beamspace MUSIC-based near-field channel estimation for hybrid XL-MIMO,” IEEE Commun. Letters, vol. 28, no. 8, pp. 1949–1953, Aug. 2024.

[14] A. Kosasih, Ö. T. Demir, and E. Björnson, “Parametric near-field channel estimation for extremely large aperture arrays,” in 2023 57th Proc. Asilomar Conf. Signals, Systems, and Comp., IEEE, 2023, pp. 162–166.

[15] D. Gürgünoğlu, A. Kosasih, P. Ramezani, Ö. T. Demir, E. Björnson, and G. Fodor, “Performance analysis of a 2D-MUSIC algorithm for parametric near-field channel estimation,” IEEE Wirel. Commun. Lett., vol. 14, no. 5, pp. 1496–1500, 2025.

[16] C. Huang, J. Xu, W. Xu, X. You, C. Yuen, and Y. Chen, “Low-complexity channel estimation for extremely large-scale MIMO in near field,” IEEE Wirel. Commun. Lett., vol. 13, no. 3, pp. 671–675, 2023.

[17] M. Cui and L. Dai, “Channel estimation for extremely large-scale MIMO: Far-field or near-field?” IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, Apr. 2022.

[18] Z. Wu and L. Dai, “Multiple access for near-field communications: SDMA or LDMA?” IEEE J. Sel. Areas Commun., vol. 41, no. 6, pp. 1918–1935, 2023.

[19] X. Guo, Y. Chen, and Y. Wang, “Compressed channel estimation for near-field XL-MIMO using triple parametric decomposition,” IEEE Trans. Veh. Technol., vol. 72, no. 11, pp. 15 040–15 045, 2023.

[20] X. Zhang, H. Zhang, J. Zhang, C. Li, Y. Huang, and L. Yang, “Codebook design for extremely large-scale MIMO systems: Near-field and far-field,” IEEE Trans. Commun., vol. 72, no. 2, pp. 1191–1206, Feb. 2024.

[21] A. Rajoriya, J. N. Pisharody, Y. Mishra, and R. Budhiraja, “Bayesian off-grid near-field channel estimation,” IEEE Trans. Veh. Technol., pp. 1–6, 2025.

[22] Z. Zhu, R. Yang, C. Li, Y. Huang, and L. Yang, “Adaptive joint sparse Bayesian approaches for near-field channel estimation,” IEEE Trans. Wirel. Commun., vol. 24, no. 3, pp. 2590–2605, 2025.

[23] J. Cao, J. Du, M. Han, J. Liu, X. Li, and D. B. da Costa, “Efficient sparse Bayesian channel estimation for near-field ultra-scale massive MIMO systems,” IEEE Wirel. Commun. Lett., vol. 12, no. 12, pp. 2133–2137, 2023.

[24] X. Cheng, K. Xu, J. Sun, and S. Li, “Adaptive grouping sparse Bayesian learning for channel estimation in non-stationary uplink massive MIMO systems,” IEEE Trans. Wirel. Commun., vol. 18, no. 8, pp. 4184–4198, 2019.

[25] J. Fang, Y. Shen, H. Li, and P. Wang, “Pattern-coupled sparse Bayesian learning for recovery of block-sparse signals,” IEEE Trans. Signal Process., vol. 63, no. 2, pp. 360–372, 2014.

[26] W. Yu, Y. Shen, H. He, X. Yu, S. Song, J. Zhang, and K. B. Letaief, “An adaptive and robust deep learning framework for THz ultra-massive MIMO channel estimation,” IEEE J. Sel. Top. Signal Process., vol. 17, no. 4, pp. 761–776, 2023.

[27] S. Gao, P. Dong, Z. Pan, and X. You, “Lightweight deep learning based channel estimation for extremely large-scale massive MIMO systems,” IEEE Trans. Veh. Technol., vol. 73, no. 7, pp. 10 750–10 754, 2024.

[28] Y. Chen, L. Yan, and C. Han, “Hybrid spherical-and planar-wave modeling and DCNN-powered estimation of terahertz ultra-massive MIMO channels,” IEEE Trans. Commun., vol. 69, no. 10, pp. 7063–7076, 2021.

[29] H. Lei, J. Zhang, H. Xiao, X. Zhang, B. Ai, and D. W. K. Ng, “Channel estimation for XL-MIMO systems with polar-domain multi-scale residual dense network,” IEEE Trans. Veh. Technol., vol. 73, no. 1, pp. 1479–1484, 2023.

[30] Z. Jin, L. You, D. W. K. Ng, X.-G. Xia, and X. Gao, “Near-field channel estimation for XL-MIMO: A deep generative model guided by side information,” IEEE Trans. Cogn. Commun. Netw., 2025.

[31] M. Arvinte and J. I. Tamir, “MIMO channel estimation using score-based generative models,” IEEE Trans. Wirel. Commun., vol. 22, no. 6, pp. 3698–3713, 2022.

[32] X. Zhang, Z. Wang, H. Zhang, and L. Yang, “Near-field channel estimation for extremely large-scale array communications: A model-based deep learning approach,” IEEE Comm. Lett., vol. 27, no. 4, pp. 1155–1159, 2023.

[33] J. Yang, B. Ai, W. Chen, S. Yang, G. Shi, N. Wang, and C. Yuen, “Deep learning-based near-field wideband channel estimation: A joint LISTA-CP approach,” IEEE Trans. Veh. Technol., 2025.

[34] W. Jiang, D. Ma, Z. Wei, Z. Feng, P. Zhang, and J. Peng, “ISAC-NET: Model-driven deep learning for integrated passive sensing and communication,” IEEE Trans. Commun., vol. 72, no. 8, pp. 4692–4707, 2024.

[35] L. V. Nguyen, A. L. Swindlehurst, and D. H. Nguyen, “Variational Bayes for joint channel estimation and data detection in few-bit massive MIMO systems,” IEEE Trans. Signal Process., 2024.

[36] S. Nassirpour, T.-V. Nguyen, H. Q. Ngo, L.-N. Tran, T. Ratnarajah, and D. H. N. Nguyen, “Variational Bayesian channel estimation and data detection for cell-free massive MIMO with low-resolution quantized fronthaul links,” IEEE J. Sel. Top. Signal Process., pp. 1–15, 2025.

[37] S. Nassirpour, T.-V. Nguyen, and D. H. Nguyen, “Variational Bayesian inference for time-varying massive MIMO channels: Estimation and detection,” IEEE Trans. Wirel. Commun., 2025.

[38] J. N. Pisharody, A. Rajoriya, and R. Budhiraja, “Near-field channel estimation for XL-MIMO systems using variational Bayesian learning,” IEEE Trans. Wirel. Commun., vol. 23, no. 9, pp. 10 740–10 756, 2024.

[39] Y. Liu, C. Ouyang, Z. Wang, J. Xu, X. Mu, and A. L. Swindlehurst, “Near-field communications: A comprehensive survey,” IEEE Commun. Surv. Tutor., 2024.

[40] X. Zhang, H. Zhang, and Y. C. Eldar, “Near-field sparse channel representation and estimation in 6G wireless communications,” IEEE Trans. Commun., vol. 72, no. 1, pp. 450–464, Jan. 2024.

[41] K. T. Selvan and R. Janaswamy, “Fraunhofer and Fresnel distances: Unified derivation for aperture antennas,” IEEE Antennas Propag. Mag., vol. 59, no. 4, pp. 12–15, 2017.

[42] C. M. Bishop and N. M. Nasrabadi, Pattern Recognition and Machine Learning. Springer, 2006, vol. 4, no. 4.

[43] M. W. et al, “Graphical Models, Exponential Families, and Variational Inference,” Foundations and Trends® in Machine Learning, vol. 1, no. 1–2, pp. 1–305, 2008.（原抽取条目作者信息不全，待核对）

[44] M.-A. Badiu, T. L. Hansen, and B. H. Fleury, “Variational Bayesian inference of line spectral,” IEEE Trans. Signal Process., vol. 65, no. 9, pp. 2247–2261, 2017.

[45] D. H. Nguyen, I. Atzeni, A. Tölli, and A. L. Swindlehurst, “A variational Bayesian perspective on massive MIMO detection,” arXiv preprint arXiv:2205.11649, 2022.

[46] A. Hussain, A. Abdallah, and A. M. Eltawil, “Redefining polar boundaries for near-field channel estimation for ultra-massive MIMO antenna array,” IEEE Trans. Wirel. Commun., vol. 24, no. 10, pp. 8193–8207, 2025.

**本页范围与校对状态：** 本页为 arXiv:2602.21449v1 的全文中文译稿，覆盖摘要、正文第 I–V 节、结论、致谢说明、附录 A、图 1–11 图注、表 I–III 逐格、算法 1–2 的逐行描述与参考文献 [1]–[46]。公式编号沿用原文（1）–（54）。推导中 (46)(47) 的符号、$\mathbf m$ 的定义以及 (48) 中 $(M\hat\gamma)^{-1}$ 均按 PDF 原文照录；后者与同段 $N\hat\gamma$ 不一致，已加注为原文疑点。原文在 UPA 小节使用 P-OMP 名称（而 ULA 小节使用 P-SOMP），译文按原文名称照录，未作统一。参考文献 [43] 的抽取条目作者信息不全，已加注。**逐句逐式对照原 PDF 的终校未做**；如发现公式排版或个别数值与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
