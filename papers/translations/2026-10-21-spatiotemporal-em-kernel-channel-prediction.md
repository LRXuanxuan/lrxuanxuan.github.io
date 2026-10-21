---
layout: page
title: "用于信道预测的时空电磁核学习｜中文全篇译稿（待终校）"
permalink: /papers/translations/2026-10-21-spatiotemporal-em-kernel-channel-prediction/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/43ba737242163164/) · [IEEE DOI](https://doi.org/10.1109/TWC.2025.3635412)

# 用于信道预测的时空电磁核学习

**原题：** Spatio-Temporal Electromagnetic Kernel Learning for Channel Prediction  
**作者：** Jinke Li、Jieao Zhu、Linglong Dai  
**机构：** 清华大学电子工程系、空间网络与通信全国重点实验室。  
**来源：** IEEE Transactions on Wireless Communications，2026，Vol. 25；DOI: 10.1109/TWC.2025.3635412。  
**译文范围：** 已译摘要、引言与现有工作、系统模型、问题表述、第 IV 节时空电磁相关核构造及高斯过程回归起始部分。正文 I–VI、附录 A–B、公式（1）–（41）、算法 1–3、复杂度表 I、图 1–13 的说明、59 条参考文献及作者简介均已录入，仍待独立逐式终校。

## 摘要

准确的信道预测对解决用户移动引起的信道老化至关重要。然而，在高移动性场景中，真实信道随时间的变化高度复杂，使现有预测器难以准确获取未来信道。信道预测精度较低又会使可靠通信难以实现。

为克服这一挑战，提出一种基于时空电磁核学习（spatio-temporal electromagnetic kernel learning，STEM-KL）的信道预测器。具体而言，受到电磁信息论（electromagnetic information theory，EIT）近期发展的启发，推导时空电磁（STEM）核函数。设计速度参数和集中度参数来刻画无线信号传播的时变特性，并通过核学习确定这些参数。随后，以 STEM 核作为先验，计算贝叶斯后验分布，实现未来信道预测。

为进一步提升稳定性和模型表达能力，提出基于网格的电磁混合核学习（grid-based electromagnetic mixed kernel learning，GEM-KL）方案。将混合核设计为多个子核的凸组合，每个子核对应于预选参数集合中的一个网格点。这样，原本非凸的 STEM 核学习问题被转换为能够通过优化权重方便求解的凸网格问题。

仿真结果表明，所提 STEM-KL 和 GEM-KL 能够实现更准确的信道预测，说明电磁信息论可有效提升无线系统性能。

**关键词：** 信道预测；电磁信息论（EIT）；时空电磁核学习（STEM-KL）；网格化电磁混合核学习（GEM-KL）；MIMO。

## I. 引言

近年来，随着数字孪生、虚拟现实等新应用的发展，频谱效率需求预计会迅速增长 [1]。作为当前无线通信的关键技术，大规模多输入多输出（massive MIMO）能够显著改善频谱效率和系统容量 [2]–[4]。

大规模 MIMO 系统的有效通信高度依赖准确、及时的信道状态信息（CSI）[5]。然而，由用户移动等因素导致的动态环境，使 CSI 获取更加困难 [6]、[7]。根据当前 5G 标准 [8]，在时分双工（TDD）模式下，CSI 获取或信道估计按周期执行。在用户移动性较高时，单个估计周期内可能发生显著信道变化，使 CSI 过时 [9]。这一现象称为信道老化（channel aging）[10]。例如，当用户速度为 60 km/h 时，信道老化可能造成约 30% 的可达总速率损失 [11]。

为获得更高频谱效率，天线数远超大规模 MIMO 的超大规模 MIMO（XL-MIMO）被视为 6G 关键技术 [12]。未来 6G 场景中，随着 MIMO 天线数量显著增加，信道估计所需的导频数也将随之增加。虽然能够通过提高导频密度来满足需求，但当天线数成倍增加时，导频密度难以承担这种激增。因此，延长信道估计周期将难以避免，信道老化也将更加严重。解决信道老化遂成为 XL-MIMO 通信的紧迫问题。

### A. 相关研究

为解决信道老化，研究者提出多种利用历史 CSI 与未来 CSI 时间相关性的预测技术。既有信道预测方法大致分为**基于模型的方法**和**基于深度学习（DL）的方法**。其中，基于模型的方法还可以分为稀疏性方法和自回归（AR）方法。

基于稀疏性的方法通常利用信道响应在多普勒域的稀疏结构预测未来信道。例如，基于正弦信号之和的预测器 [13] 将信道响应表示为多个正弦波的组合，先识别主导正弦分量，再通过谐波检索方法 [14] 获取各分量，用于信道预测。为适配向量元素更多的大规模 MIMO 信道，文献 [15] 提出 Prony 向量（PVEC）方法，对观测信道响应拟合线性预测模型。PVEC 适用于预测由衰减正弦分量构成的均匀采样信号，将未来信道表示为过去信道的线性组合，组合权重通过接收导频确定。文献 [16] 认为时变信道在多普勒频率域具有稀疏性，因此可以使用正交匹配追踪（OMP）[17] 等压缩感知算法提取主导多普勒频率，进而预测未来信道。

基于 AR 的方法利用自回归原理处理信道时间序列 [18]。传统 AR 预测器将未来信道建模为历史值的加权和，AR 参数由不同时刻信道之间的自相关函数确定 [19]–[21]。维纳信道预测器和卡尔曼信道预测器是 AR 方法的扩展 [22]–[25]。维纳预测器使用维纳线性滤波器预测自回归多变量随机过程 [26]。文献 [27]、[28] 在时间相关的信道老化模型中研究卡尔曼预测，将信道建模为具有状态方程和观测方程的线性动态系统：首先利用当前估计和状态转移模型预测下一状态，再用新的 CSI 修正估计并降低不确定性。

基于深度学习的方法利用神经网络结构，从历史信道数据学习复杂模式进行预测 [28]–[31]。例如，全连接神经网络（FCN）将信道预测建模为历史观测到未来状态的非线性映射，通过互联层捕获潜在相关性 [28]；但输入包含前几帧的高维信道，训练可能较为困难。循环神经网络（RNN）通过反馈回路处理序列数据，并在隐藏状态中保留时间信息 [32]。长短期记忆（LSTM）模型利用输入门、遗忘门和输出门等门控结构缓解梯度消失，在高移动性场景的信道预测中有效 [33]。近期，基于 Transformer 的预测器利用自注意力捕获跨序列的全局时间交互，相较传统 RNN 具有并行化及关注重要依赖关系的优势 [11]、[34]。

上述 DL 方法已用于大规模 MIMO 和车联网等无线系统。在数据充足的情况下，通过在大型仿真或实测数据集上训练，通常能够获得比传统方法更好的性能。然而，DL 方法需要大量历史数据集，实际无线部署中可能难以获得。此外，DL 模型往往作为黑箱 [35]，缺乏明确的物理可解释性，无法充分结合底层电磁原理；训练开销也通常较高。对于已有模型驱动方法，将时变信道简单建模为正弦信号或高斯随机过程，未必能准确反映真实信道。模型不准确会直接限制未来信道预测质量。因此，有必要研究具有明确物理可解释性的高精度信道预测器。

### B. 主要贡献

为设计面向 XL-MIMO 的高精度、具有物理可解释性的信道预测器，提出基于电磁核学习的信道预测方案。从电磁信息论（EIT）角度同时利用信道的时空电磁相关特性 [36]、[37]，主要贡献如下：

1. 不同于未充分利用信道电磁特性的既有方案，使用基于 EIT 的信道模型。受电磁物理原理下空间相关函数 [38] 启发，考虑信道时变特性，推导时空电磁相关函数（STEM-CF），亦即 STEM 核。通过引入速度参数描述用户移动，所得相关核源于电磁传播物理，因此在建模实际无线环境时比纯经验核函数具有更强的物理依据。
2. 利用 STEM 核的时间相关性构造时域信道预测器。通过最大似然（ML）优化问题，从带噪信道观测中学习核参数。速度和集中度参数共同反映传播变化。确定参数后，将 STEM 核作为先验，计算未来信道的贝叶斯后验，实现具有物理可解释性的预测。
3. 为处理最大似然优化问题的非凸性，引入额外的网格权重参数，将问题转换为凸优化。以新的网格化电磁混合核（GEM）近似 STEM 核，其中每个子核的参数固定于预先选定的网格点，仅优化组合权重。这样就把原来的连续参数优化转化为具有良好凸性和可靠性的离散权重优化。
4. 通过性能分析和数值实验，验证 GEM-KL 预测器优于 PVEC 和 AR 基线，说明 EIT 有助于改善无线通信性能。

后续文章第 II 节描述信道模型与信号模型，第 III 节表述预测问题，第 IV 节推导时空电磁相关函数并引入高斯过程回归、核学习和 GEM-KL，第 V 节给出仿真，第 VI 节总结。

**符号：** $\mathbb C,\mathbb R$ 分别表示复数集与实数集；$(\cdot)^*,(\cdot)^\top,(\cdot)^H$ 分别表示共轭、转置和共轭转置；$\operatorname{diag}(\cdot)$ 表示对角矩阵，$\mathbf I_N$ 为 $N$ 维单位矩阵，$j_m(\xi)$ 表示 $m$ 阶第一类球贝塞尔函数。原文区分复向量的伪范数 $|\mathbf x|=\sqrt{\mathbf x^\top\mathbf x}$ 与通常的二范数 $\|\mathbf x\|=\sqrt{\mathbf x^H\mathbf x}$，后续公式中应保留这一区别。

## II. 系统模型

### A. 信道模型

传统信道模型将信道矩阵表示为阵列导向矢量的加权高斯混合，实际上可看作高斯随机场的一个离散特例。为了捕捉无线信道连续变化的性质，使用复对称高斯随机场（complex symmetric Gaussian random field，CSGRF）进行信道建模 [39]、[40]。

令 $h(\boldsymbol\rho):\mathbb R^4\to\mathbb C$ 为圆对称复高斯随机场，$\boldsymbol\rho=(\mathbf x,t)$，其中 $\mathbf x=(x,y,z)$ 是空间位置、$t$ 是时间。对任意 $Q$ 个时空点，若其函数值 $(h(\boldsymbol\rho_1),\ldots,h(\boldsymbol\rho_Q))$ 联合服从多元高斯分布，则称 $h(\boldsymbol\rho)$ 是高斯随机场，记为：

$$
h(\boldsymbol\rho)\sim\operatorname{GRF}(0,k(\boldsymbol\rho,\boldsymbol\rho')).
$$

其概率测度由自相关函数决定：

$$
k(\boldsymbol\rho,\boldsymbol\rho')=
\mathbb E[h(\boldsymbol\rho)h^*(\boldsymbol\rho')]. \tag{1}
$$

自相关函数通常称为核（kernel）。高斯随机场的核必须满足半正定条件。为使 CSGRF 能够表示无线信道，核函数还必须遵守电磁传播约束。

进一步使用 $h(\boldsymbol\rho)$ 建模电场分布 $\mathbf E(\boldsymbol\rho):\mathbb R^4\to\mathbb C^3$。电场相关函数定义为 $\mathbf K_E(\boldsymbol\rho,\boldsymbol\rho')=\mathbb E[\mathbf E(\boldsymbol\rho)\mathbf E(\boldsymbol\rho')^H]\in\mathbb C^{3\times3}$ [41]。对于具有 $N_{\rm BS}$ 个分量的信道向量，也可以在每个天线对应的时空点上构造相关函数，使用 CSGRF 进行建模。

### B. 信号模型

考虑 XL-MIMO 上行窄带通信系统：一个配备 $N_{\rm BS}$ 根天线的基站服务一个单天线用户。假设基站使用全数字预编码，每根天线均连接独立的射频链。上行信号模型为：

$$
\mathbf y_t=\sqrt p\,\mathbf h_t+\mathbf n_t. \tag{2}
$$

其中，$\mathbf y_t\in\mathbb C^{N_{\rm BS}\times1}$ 是基站在时刻 $t$ 接收的导频，$\mathbf h_t\in\mathbb C^{N_{\rm BS}\times1}$ 是归一化信道向量，满足 $\mathbb E[\|\mathbf h_t\|^2]=N_{\rm BS}$；$p$ 为导频发射功率，$\mathbf n_t$ 为零均值、协方差为 $\sigma_n^2\mathbf I_{N_{\rm BS}}$ 的复加性白高斯噪声（AWGN）。

可以使用最小二乘（LS）及最小均方误差（MMSE）估计方法 [42] 得到信道估计。分别记为 $\widehat{\mathbf h}^{\rm LS}_t$ 和 $\widehat{\mathbf h}^{\rm MMSE}_t$，则：

$$
\widehat{\mathbf h}^{\rm LS}_t=\frac1{\sqrt p}\mathbf y_t. \tag{3}
$$

$$
\widehat{\mathbf h}^{\rm MMSE}_t=
\mathbb E[\mathbf h_t\mid\mathbf y_t]
=\boldsymbol\Sigma_{\mathbf h_t}
\left(\boldsymbol\Sigma_{\mathbf h_t}
+\frac{1}{\mathrm{SNR}}\mathbf I_{N_{\rm BS}}\right)^{-1}
\mathbf y_t. \tag{4}
$$

其中，$\boldsymbol\Sigma_{\mathbf h_t}=\mathbb E[\mathbf h_t\mathbf h_t^H]$ 为信道先验协方差，$\mathrm{SNR}=p/\sigma_n^2$ 为基站接收信噪比。为了简化后续分析，文中取 $p=1$。

## III. 问题表述

考虑信道老化并建立预测问题，以减轻移动导致的 CSI 过时现象。

如图 1 所示，XL-MIMO 系统中用户以速度 $\mathbf v$ 移动，多普勒频移使不同时刻的信道出现明显差异。将信道估计周期称为一帧，每帧包含 $N_s$ 个时隙，仅在第一个时隙执行信道估计。在移动场景中，由于多普勒效应，后续时隙的实际信道可能与第一个时隙估得的信道明显不同，降低 CSI 精度并损害通信质量。

**图 1：** 基站周围球形表面分布有散射体，用户以速度 $\mathbf v$ 移动。图 2 用某个信道向量分量的实部展示实际时间变化及不确定性区域：未来时刻的阴影不确定性区域逐渐增大。

根据文献 [43]，信道相干时间 $T_c$ 是信道可以较好地视为不变的时间，近似与载频 $f$ 和用户速度 $v$ 成反比：

$$
T_c\approx\frac{c}{2fv}=\frac{\lambda}{2v}. \tag{5}
$$

其中，$\lambda$ 为载波波长。径向速度 $v_r\le v$ 引起的多普勒频移为：

$$
f_d=\frac{v_r}{\lambda}. \tag{6}
$$

多普勒越大，相干时间越短，信道老化越严重。若相干时间短于信道估计周期，直接把帧首估计结果用于后续时隙就会造成性能损失。图 2 中实线为信道分量的实部，阴影为不确定性范围，随着预测时间延长，不确定性明显增加。

为解决信道老化，已有多种利用历史信道预测未来信道的方法。传统方法通常采用序列式预测，即利用前 $T$ 帧信道预测第 $T+1$ 帧，再把预测的第 $T+1$ 帧作为已知信息，与历史帧共同预测第 $T+2$ 帧。由于上一帧的预测误差会被带入后续预测，这一过程产生误差传播。

为了避免误差传播，与既有的逐帧预测方式不同，文章采用**并行预测**：使用历史 $L$ 帧信道的估计结果，联合预测后续 $F$ 帧信道，即同时预测未来全部 $F$ 帧。由于使用高斯随机场信道模型，准确预测取决于合适的自相关核，随后通过核函数推断未来信道。

令 $\boldsymbol\omega\in\Omega$ 为核参数，$\Omega$ 是其可行集合。过去 $L$ 帧的接收导频序列按列堆叠为 $\mathbf y\in\mathbb C^{N_{\rm BS}L\times1}$；过去与未来的信道向量分别记为 $\mathbf h_{\mathcal L}\in\mathbb C^{N_{\rm BS}L\times1}$ 与 $\mathbf h_{\mathcal F}\in\mathbb C^{N_{\rm BS}F\times1}$。采用最大似然准则估计核参数，再利用 MMSE 准则预测未来信道，可表述为：

$$
\begin{cases}
\widehat{\boldsymbol\omega}(\mathbf y)
=\arg\max_{\boldsymbol\omega\in\Omega}
\ln\displaystyle\int p(\mathbf y\mid\mathbf h_{\mathcal L})
p(\mathbf h_{\mathcal L}\mid\boldsymbol\omega)\,
d\mathbf h_{\mathcal L},\\[4pt]
\widehat{\mathbf h}_{\mathcal F}(\mathbf y)
=\arg\max_{\mathbf h_{\mathcal F}}
\{\ln p(\mathbf y\mid\mathbf h_{\mathcal F})
+\ln p(\mathbf h_{\mathcal F}\mid
\widehat{\boldsymbol\omega}(\mathbf y))\}.
\end{cases} \tag{7}
$$

其中，$\widehat{\boldsymbol\omega}$ 是核参数的 ML 估计，$\widehat{\mathbf h}_{\mathcal F}$ 表示未来信道的估计。对于高斯随机场模型，文中指出 MMSE 估计与最大后验（MAP）估计相对应。

## IV. 基于时空电磁核学习的信道预测

提出同时使用信道时间与空间电磁相关性的并行预测方案。第 IV-A 节构造时空电磁相关核；IV-B 节使用高斯过程回归（GPR）预测未来信道；IV-C 节引入核学习确定参数；IV-D 节设计基于网格的电磁混合核；IV-E 节给出 GEM-KL 算法。

### A. STEM 相关函数的构造

要充分利用电磁物理特性，需要考虑通信过程背后的基本物理原理 [44]，包括电磁学和信息论 [45]、[46]。两者结合所形成的电磁信息论（EIT），提供了从电磁波传播角度理解无线通信问题的研究路径 [47]、[48]。

基于 II-A 节介绍的高斯随机场信道模型，研究电磁信道的相关性。通过在图 1 所示散射球面 $\mathbb S^2$ 上积分电场相关性，构造：

$$
\mathbf K(\mathbf x,t;\mathbf x',t')
\propto\int_{\widehat{\boldsymbol\kappa}\in\mathbb S^2}
(\mathbf I-\widehat{\boldsymbol\kappa}\widehat{\boldsymbol\kappa}^{\top})
e^{jk_0\widehat{\boldsymbol\kappa}\cdot
((\mathbf x-\mathbf x')+\mathbf v(t-t'))}
\nu(\widehat{\boldsymbol\kappa})\,dS. \tag{8}
$$

积分在三维单位球面上进行；$k_0=2\pi/\lambda_0$ 为波数，$\widehat{\boldsymbol\kappa}$ 是单位径向矢量，$\nu:\mathbb S^2\to\mathbb R_+$ 是入射波的角功率谱密度，其单位为每球面度、每极化方向的瓦特。该函数称为电磁相关函数（electromagnetic correlation function，EMCF）[49]。

对于时变信道，通过引入速度向量 $\mathbf v$ 将多普勒效应写入电磁相关核，因此该 EMCF 可称为 STEM-CF。为了刻画电磁波的入射方向，采用 von Mises–Fisher（vMF）分布：

$$
\nu(\widehat{\boldsymbol\kappa})=
\frac{\zeta^2}{8\pi}\exp(\widehat{\boldsymbol\kappa}\cdot\boldsymbol\delta).
$$

其中，$\boldsymbol\delta$ 为集中度参数，其方向表示电磁波传播能量的主要集中方向；若电磁波入射为各向同性，则 $\nu$ 为常数 $\zeta^2/(8\pi)$。集中度越强，信道越稀疏。原文备注指出，vMF 分布可用于描述单位球面上的方向性集中程度，在无线信道建模中应用广泛 [50]。

依据文献 [49]，STEM-CF 具有闭式表达：

$$
\mathbf K_{\rm STEM}(\boldsymbol\rho,\boldsymbol\rho')
=\mathbb E[\mathbf E(\boldsymbol\rho)\mathbf E(\boldsymbol\rho')^H]
=\frac{\zeta^2}{S(\|\boldsymbol\delta\|)}\boldsymbol\Sigma(\boldsymbol\xi). \tag{9}
$$

其中，$\boldsymbol\xi=k_0\mathbf w
=k_0(\mathbf x-\mathbf x'+\mathbf v(t-t'))-j\boldsymbol\delta\in\mathbb C^3$，$S(\delta)=\sinh(\delta)/\delta$ 是归一化因子，$\delta=\|\boldsymbol\delta\|$，而 $\mathbf K_{\rm STEM}$ 是 $3\times3$ 的复矩阵。用三维场景中的球贝塞尔函数 $j_n(\xi)$ 表示相关函数：

$$
\boldsymbol\Sigma(\boldsymbol\xi)=
\frac16\big(4j_0(\xi)-j_2(\xi)\big)\mathbf I_3+
\frac12\big(j_2(\xi)-2j_0(\xi)\big)
\widehat{\boldsymbol\xi}\widehat{\boldsymbol\xi}^{\top}. \tag{10}
$$

这里 $\xi=\sqrt{\boldsymbol\xi^\top\boldsymbol\xi}$、$\widehat{\boldsymbol\xi}=\boldsymbol\xi/\xi$，并使用：

$$
j_n(\xi)=(-\xi)^n
\left(\frac1\xi\frac{d}{d\xi}\right)^n
\frac{\sin\xi}{\xi}. \tag{11}
$$

需要注意，$\mathbf w=\mathbf x-\mathbf x'+\mathbf v(t-t')-j\boldsymbol\delta/k_0$ 同时包含空间和时间变量，因此所用核能够在满足电磁物理约束的前提下描述时空相关性。STEM-CF 可在随后讨论的高斯过程回归中作为先验。原文备注进一步强调：集中度 $\boldsymbol\delta$ 描述电磁波方向性，用户速度 $\mathbf v$ 控制多普勒引起的时间相关性，这些量使核函数具有明确的物理解释。

### B. 高斯过程回归（已译部分）

高斯过程回归（Gaussian process regression，GPR）[51] 可根据高斯随机场的先验信息和观测数据进行预测。具体来说，对 $\operatorname{GRF}(\mu(\mathbf x),k(\mathbf x,\mathbf x'))$，根据含噪观测 $y_i=f(\mathbf x_i)+n_i$，$n_i\sim\mathcal{CN}(0,\sigma_n^2)$，预测后续 $F$ 个点上的函数值。对信道预测问题，历史观测数量为 $L_N=N_{\rm BS}L$，未来预测数量为 $F_N=N_{\rm BS}F$。

将历史观测与未来信道合并成联合向量，利用协方差核构造联合复高斯分布：

$$
\mathbf g\sim\mathcal{CN}\left(
\begin{bmatrix}\boldsymbol\mu_{\mathcal L}\\
\boldsymbol\mu_{\mathcal F}\end{bmatrix},
\begin{bmatrix}
\mathbf K_{\mathcal LL}+\sigma_n^2\mathbf I_{L_N}&\mathbf K_{\mathcal LF}\\
\mathbf K_{\mathcal FL}&\mathbf K_{\mathcal FF}
\end{bmatrix}\right). \tag{12}
$$

这里 $\boldsymbol\mu_{\mathcal L}$ 和 $\boldsymbol\mu_{\mathcal F}$ 是历史观测和未来信道位置上的均值；$\mathbf K_{\mathcal LL}$、$\mathbf K_{\mathcal LF}$、$\mathbf K_{\mathcal FL}$、$\mathbf K_{\mathcal FF}$ 分别表示历史—历史、历史—未来、未来—历史和未来—未来之间的核协方差矩阵，且 $\mathbf K_{\mathcal FL}=\mathbf K_{\mathcal LF}^H$。通过高斯后验公式即可构建预测的条件均值与协方差。

首先，原文针对时隙内的实际使用还作出约定：可由相邻帧信道 $\mathbf h_t$ 和 $\mathbf h_{t+1}$ 决定第 $n$ 个时隙所使用的信道。例如在第 $t$ 帧，当 $0<n\le N_s/2$ 时，使用 $\mathbf h_t$；否则使用 $\mathbf h_{t+1}$。因此，第 IV 节需要准确求解式（7）。

高斯过程回归中，$\mathbf K_{\mathcal LL}$ 的第 $(m,n)$ 个元素为 $k(\mathbf x_m,\mathbf x_n)$，其中 $m,n\in\{1,\ldots,L_N\}$；$\mathbf K_{\mathcal LF}\in\mathbb C^{L_N\times F_N}$ 表示历史与未来位置之间的核矩阵；$\mathbf K_{\mathcal FL}=\mathbf K_{\mathcal LF}^{H}\in\mathbb C^{F_N\times L_N}$；$\mathbf K_{\mathcal FF}\in\mathbb C^{F_N\times F_N}$ 表示未来位置之间的核矩阵。令 $\mathbf K_y=\mathbf K_{\mathcal LL}+\sigma_n^2\mathbf I_{L_N}$。根据复高斯后验公式 [52]，得到：

$
\begin{aligned}
\boldsymbol\mu_{\mathcal F|\mathcal L}
&=\boldsymbol\mu_{\mathcal F}
+\mathbf K_{\mathcal LF}^{H}\mathbf K_y^{-1}\mathbf y,\\
\mathbf K_{\mathcal F|\mathcal L}
&=\mathbf K_{\mathcal FF}
-\mathbf K_{\mathcal LF}^{H}\mathbf K_y^{-1}\mathbf K_{\mathcal LF}.
\end{aligned}\tag{13}
$

贝叶斯回归结果由 $\boldsymbol\mu_{\mathcal F|\mathcal L}$ 和 $\mathbf K_{\mathcal F|\mathcal L}$ 给出。

**图 3：** 基于高斯过程回归的时域信道预测。GPR 预测器利用过去帧间信道的协方差矩阵（图中蓝色区域）以及过去帧与未来帧之间的协方差矩阵（红色区域），一次并行预测多个未来帧。

因为先验为复高斯分布，GPR 预测器与最大后验（MAP）预测器相一致。由于贝叶斯最优性以及核函数参数可以灵活调整，GPR 广泛适用于各类估计和预测问题。核函数的可调性进一步扩展了 GPR 的应用范围；下一节介绍具体的核调节方法。

*原文记号说明：式（13）的条件均值按论文原式保留。在非零均值 GPR 的通用写法中，通常出现观测中心化项 $\mathbf y-\boldsymbol\mu_{\mathcal L}$；论文公式未显式写出此项，此处不擅自改写。*

### C. 核学习

核函数 $k(\mathbf x,\mathbf x')$ 隐式编码高斯随机场 $f(\mathbf x)$ 的先验信息。通过允许更多参数设置，能够提升模型的可调性。选择合适的核参数，是构造有效回归模型的关键环节，并直接影响核函数重建高斯过程的准确程度。需要调整的参数通常称为**超参数**（hyperparameters）。设可调核函数 $k(\mathbf x,\mathbf x'\mid\boldsymbol\omega)$ 的超参数为 $\boldsymbol\omega\in\Omega\subset\mathbb R^{N_\omega}$，寻找 STEM 核最优超参数的过程称为核学习。

需要为评价超参数是否合适指定准则。常用方法是最大似然（ML）：

$
\widehat{\boldsymbol\omega}_{\rm ML}
=\arg\max_{\boldsymbol\omega\in\Omega}
\ln p(\mathbf y\mid\boldsymbol\omega). \tag{14}
$

在给定超参数 $\boldsymbol\omega$ 时，导频观测 $\mathbf y$ 的概率密度函数为：

$
p(\mathbf y\mid\boldsymbol\omega)=
\frac{1}{\pi^{L_N}\det\mathbf K_y}
\exp(-\mathbf y^H\mathbf K_y^{-1}\mathbf y). \tag{15}
$

其中核矩阵 $\mathbf K_y(\boldsymbol\omega)$ 随超参数变化。对数似然函数可写为
$\ell(\boldsymbol\omega\mid\mathbf y)
=-\ln\det\mathbf K_y-\text{const}
-\mathbf y^H\mathbf K_y^{-1}\mathbf y$。求解超参数的 ML 估计可以采用梯度下降、共轭梯度法或牛顿迭代，这些方法均需要对数似然对 $\boldsymbol\omega$ 的导数。

记 $\mathbf g=\mathbf K_y^{-1}\mathbf y$，可得：

$
\frac{\partial\ell(\boldsymbol\omega\mid\mathbf y)}
{\partial\omega_i}
=\operatorname{tr}\left[
(\mathbf g\mathbf g^H-\mathbf K_y^{-1})
\frac{\partial\mathbf K_y}{\partial\omega_i}
\right]. \tag{16}
$

其中 $\omega_i$ 是 $\boldsymbol\omega$ 的第 $i$ 个分量。对于复数超参数，需考虑 Wirtinger 导数
$\frac12(\partial/\partial\omega_{i,\rm Re}-j\partial/\partial\omega_{i,\rm Im})$。原文说明式（16）仍可沿用。

为了预测四维时空信道，专门设计 STEM 核的超参数。根据 IV-A 节，集中度参数 $\boldsymbol\delta$ 反映电磁波的传播方向与集中程度；再引入速度参数 $\mathbf v$，刻画用户移动造成的信道时变性；信道能量记为 $\zeta_h^2$。STEM 核关于 $\delta^{(m)}$、$v^{(m)}$ 和 $\zeta_h^2$ 的 Wirtinger 导数分别为：

$
\begin{aligned}
\frac{\partial\mathbf K_{\rm STEM}}{\partial\delta^{(m)}}&=
-\frac{\zeta_h^2}{S(\delta)}
\left[
\frac{S'(\delta)\delta^{(m)}}{S(\delta)\delta}
\boldsymbol\Sigma(\boldsymbol\xi)
+j\frac{\partial\boldsymbol\Sigma(\boldsymbol\xi)}
{\partial\xi^{(m)}}\right],\\
\frac{\partial\mathbf K_{\rm STEM}}{\partial v^{(m)}}&=
\frac{\zeta_h^2 k_0(t_p-t_q)}{S(\delta)}
\frac{\partial\boldsymbol\Sigma(\boldsymbol\xi)}
{\partial\xi^{(m)}},\\
\frac{\partial\mathbf K_{\rm STEM}}{\partial(\zeta_h^2)}
&=\frac{\boldsymbol\Sigma(\boldsymbol\xi)}{S(\delta)}.
\end{aligned}\tag{17}
$

其中 $\delta=\|\boldsymbol\delta\|$，$\boldsymbol\xi=k_0\mathbf w$，
$\mathbf w=\mathbf x_p-\mathbf x_q+\mathbf v(t_p-t_q)-j\boldsymbol\delta/k_0$。

不同阶数的球贝塞尔函数满足导数关系：

$
\left(\frac1\xi\frac{d}{d\xi}\right)^a
\left(\xi^{-b}j_b(\xi)\right)
=(-1)^a\xi^{-b-a}j_{b+a}(\xi). \tag{18}
$

结合式（10）的相关函数，得到：

$
\begin{aligned}
\frac{\partial\boldsymbol\Sigma(\boldsymbol\xi)}
{\partial\xi^{(m)}}={}&
\frac16[-4j_1(\xi)-2\xi^{-1}j_2(\xi)+j_3(\xi)]
\widehat\xi^{(m)}\mathbf I_3\\
&+\frac12[2j_1(\xi)+2\xi^{-1}j_2(\xi)-j_3(\xi)]
\widehat\xi^{(m)}\widehat{\boldsymbol\xi}
\widehat{\boldsymbol\xi}^{\top}\\
&+\frac12[-2j_0(\xi)+j_2(\xi)]
\left(\partial_m\widehat{\boldsymbol\xi}
\widehat{\boldsymbol\xi}^{\top}
+\widehat{\boldsymbol\xi}\,
\partial_m\widehat{\boldsymbol\xi}^{\top}\right).
\end{aligned}\tag{19}
$

这里 $\partial_m=\partial/\partial\xi^{(m)}$，
$\partial_m\widehat{\boldsymbol\xi}=\xi^{-1}(
\widehat{\mathbf e}_m-\widehat\xi^{(m)}
\widehat{\boldsymbol\xi})$，$\widehat{\mathbf e}_m$ 是仅第 $m$ 个分量为 1 的单位向量。联合式（16）与式（17），可得关于实变量的梯度：

$
\frac{\partial\ell}{\partial\delta^{(m)}}=
2c\,\Re\left\{\operatorname{tr}
\left[\frac{\partial\mathbf K_{\mathcal LL}}
{\partial\delta^{(m)}}
(\mathbf g\mathbf g^H-\mathbf K_y^{-1})\right]\right\},\tag{20}
$

以及：

$
\frac{\partial\ell}{\partial v^{(m)}}=
2c\,\Re\left\{\operatorname{tr}
\left[\frac{\partial\mathbf K_{\mathcal LL}}
{\partial v^{(m)}}
(\mathbf g\mathbf g^H-\mathbf K_y^{-1})\right]\right\}. \tag{21}
$

$\mathbf K_{\mathcal LL}$ 为 STEM 方法构造的信道相关矩阵。利用梯度上升等梯度优化算法，可以据此根据 ML 准则获得更优的核参数 $\boldsymbol\omega$。

**备注 3：** 核方法为捕捉无线信道的时空相关性提供了有力框架 [49]。提出的 STEM 核将电磁信息论的物理认识编码进信道相关函数，实现较精确的信道响应建模。核学习进一步调节参数以优化核函数，从而提高 GPR 信道预测的准确性。

### D. 提出的网格化电磁混合核

采用梯度优化核超参数，可能陷入局部最优。本节提出网格化电磁混合核（GEM），以获得更加全局化的学习结果。

首先分析目标函数 $\ell(\boldsymbol\omega\mid\mathbf y)$，它也可看成核矩阵 $\mathbf K_y$ 的函数。不过，$\ell(\boldsymbol\omega\mid\mathbf y)$ 关于 $\mathbf K_y$ 既非凸也非凹，因此梯度优化难以找到全局最大值。再者，核矩阵依赖于超参数 $\boldsymbol\omega$，而其中的集中度 $\boldsymbol\delta$ 与速度 $\mathbf v$ 和 $\mathbf K_y$ 之间又没有线性关系，使目标函数与超参数之间的关系难以直接刻画。

为避免这种非凸／非凹函数的不便，可使用基于网格的方法 [53] 学习 STEM 核参数。定义 GEM 核 $\mathbf K_{\rm GEM}$ 为多个子核的组合，每个子核对应超参数空间中的一个网格点；在网格上预先选择若干固定的 $\boldsymbol\delta$ 和 $\mathbf v$，再用加权混合的方式组合多个 STEM 子核。假设共有 $N_k$ 个相关性子核，各自权重为 $c_n\in\mathbb R_+$，则：

$
\begin{aligned}
&k_{\rm GEM}(\mathbf x_p,t_p;\mathbf x_q,t_q\mid\boldsymbol\omega)\\
&\quad=
\mathbf u_p^{\top}
\left(\sum_{n=1}^{N_k}c_n
\mathbf K_{\rm STEM}(\mathbf x_p,t_p;\mathbf x_q,t_q
\mid\boldsymbol\omega_n)\right)\mathbf u_q.
\end{aligned}\tag{22}
$

其中各子核对应网格点 $(\boldsymbol\delta_n,\mathbf v_n)$。预选的参数满足
$\boldsymbol\delta_n\in\Delta\subset\mathbb R^3$、
$\mathbf v_n\in\mathcal V\subset\mathbb R^3$，
$\boldsymbol\omega_n=\{\boldsymbol\delta_n,\mathbf v_n,c_n\}$；
$\mathbf u\in\mathbb R^{3\times1}$ 为天线极化方向的单位矢量。混合核相关矩阵的元素为：

$
(\mathbf K_{\mathcal LL,\rm Mix})_{p,q}
=k_{\rm GEM}(\mathbf x_p,t_p;\mathbf x_q,t_q\mid\boldsymbol\omega). \tag{23}
$

权重 $c_n$ 与相应子核呈线性关系，因此只需要优化不同网格点对应的权重 $\{c_n\}_{n=1}^{N_k}$，就可以在网格上获得近似最优的超参数组合。将权重组成向量 $\mathbf c=(c_1,\ldots,c_{N_k})$，并定义可行集
$\mathcal C=\{\mathbf c\in\mathbb R_+^{N_k}\mid\sum_nc_n=1\}$。
包含观测噪声的混合协方差矩阵可写为：

$
\mathbf K_{y,\rm Mix}
=\mathbf K_{\mathcal LL,\rm Mix}+\sigma_h^2\mathbf I_{L_N}
=\sum_{n=1}^{N_k}c_n\mathbf K_{\mathcal LL,n}
+\sigma_h^2\mathbf I_{L_N}. \tag{24}
$

采用混合的网格化核能够提高 STEM 定义的高斯随机场对观测信道的拟合能力。从理论上看，由有限个子相关函数构成的混合核，可以表示任意入射电磁场的角功率谱。于是最大似然问题简化为：

$
\widehat{\mathbf c}_{\rm ML}
=\arg\max_{\mathbf c\in\mathcal C}\ln p(\mathbf y\mid\mathbf c). \tag{25}
$

其对数似然函数为：

$
\ell(\{c_n\}_{n=1}^{N_k},\zeta^2\mid\mathbf y)
=-\ln\det\mathbf K_{y,\rm Mix}
-\mathbf y^H\mathbf K_{y,\rm Mix}^{-1}\mathbf y+\text{const}. \tag{26}
$

第一项表示模型复杂度，第二项表示数据拟合。为了去掉负号，定义
$\ell_r(\mathbf c)=\ln\det\mathbf K_{y,\rm Mix}
+\mathbf y^H\mathbf K_{y,\rm Mix}^{-1}\mathbf y$，
将最大化问题改写为：

$
\widehat{\mathbf c}_{\rm ML}
=\arg\min_{\mathbf c\in\mathcal C}
\left(\ln\det\mathbf K_{y,\rm Mix}
+\mathbf y^H\mathbf K_{y,\rm Mix}^{-1}\mathbf y\right). \tag{27}
$

其中，二次型 $\mathbf y^H\mathbf K_{y,\rm Mix}^{-1}\mathbf y$ 关于 $\mathbf K_{y,\rm Mix}$ 为凸函数；而 $\ln\det\mathbf K_{y,\rm Mix}$ 为凹函数。可以使用主化—最小化（majorization–minimization，MM）算法 [54]，以逐步最小化替代函数的迭代方式求解这种非凸非凹优化。

主化步骤采用一阶泰勒展开，为凹函数设计上界替代函数。在当前迭代点 $\mathbf K_{y,\rm Mix}=\mathbf K_{y,\rm Mix}^{(m)}$（即 $\mathbf c=\mathbf c^{(m)}$）处线性化对数行列式函数，得到：

$
\begin{aligned}
\ell_r(\mathbf K_{y,\rm Mix})\le{}&
\mathbf y^H\mathbf K_{y,\rm Mix}^{-1}\mathbf y
+\ell_{\rm CCV}(\mathbf K_{y,\rm Mix}^{(m)})\\
&+\operatorname{tr}\!\left[
\nabla\ell_{\rm CCV}(\mathbf K_{y,\rm Mix}^{(m)})^\top
(\mathbf K_{y,\rm Mix}-\mathbf K_{y,\rm Mix}^{(m)})
\right].
\end{aligned}\tag{28}
$

其中 $\ell_{\rm CCV}(\mathbf K)=\ln\det\mathbf K$。其对核矩阵的 Wirtinger 导数为：

$
\frac{\partial\ell_{\rm CCV}}{\partial\mathbf K_{y,\rm Mix}}
=(\mathbf K_{y,\rm Mix}^{-1})^*. \tag{29}
$

对权重 $c_n$ 的实变量导数为：

$
\frac{\partial\ell_{\rm CCV}}{\partial c_n}
=2\Re\!\left[
\operatorname{tr}\big(
\mathbf K_{\mathcal LL,n}(\boldsymbol\omega_n)
\mathbf K_{y,\rm Mix}^{-1}\big)\right]. \tag{30}
$

因此，MM 替代函数为：

$
\begin{aligned}
\ell_s(\mathbf c\mid\mathbf c^{(m)})
={}&\mathbf y^H\mathbf K_{y,\rm Mix}^{-1}\mathbf y
+\ln\det\mathbf K_{y,\rm Mix}^{(m)}\\
&+2\Re\!\left\{\operatorname{tr}\left[
(\mathbf K_{y,\rm Mix}^{(m)})^{-1}
(\mathbf K_{y,\rm Mix}-\mathbf K_{y,\rm Mix}^{(m)})
\right]\right\}.
\end{aligned}\tag{31}
$

原文在附录 B 给出式（31）的推导证明。为降低矩阵求逆与行列式计算的复杂度，可以分别对当前与下一次混合核矩阵进行 Cholesky 分解，利用所得下三角矩阵高效求解。

最小化步骤通过优化权重更新：

$
\widehat{\mathbf c}^{(m+1)}
=\arg\min_{\mathbf c\in\mathcal C}
\ell_s(\mathbf c\mid\mathbf c^{(m)}). \tag{32}
$

由于替代函数是凸的，求解可以利用其对权重的实变量导数：

$
\frac{\partial\ell_s}{\partial c_n}
=2\Re\!\left[
\operatorname{tr}\left(
\mathbf K_{\mathcal LL,n}(\boldsymbol\omega_n)
\big((\mathbf K_{y,\rm Mix}^{(m)})^{-1}
-\mathbf g\mathbf g^H\big)
\right)\right], \tag{33}
$

其中 $\mathbf g=\mathbf K_{y,\rm Mix}^{-1}\mathbf y$。MM 迭代的目标函数具有非增性：

$
\ell_r(\mathbf c^{(m+1)})
\le\ell_s(\mathbf c^{(m+1)}\mid\mathbf c^{(m)})
\le\ell_s(\mathbf c^{(m)}\mid\mathbf c^{(m)})
=\ell_r(\mathbf c^{(m)}). \tag{34}
$

交替执行主化与最小化，可使目标函数单调改进，并将原非凸优化转换为每轮的凸权重学习子问题，在保留电磁物理约束的同时提高稳定性。这与用基函数字典近似复杂信号类似：每个子核都是时空相关性的一个“基”，GEM-KL 学习这些子核的最优混合，因此在作者的实验中能够优于直接 STEM-KL。

**算法 1：GEM 核参数学习算法**

输入子核数量 $N_k$；网格参数 $\{\boldsymbol\delta_n\}$、$\{\mathbf v_n\}$；历史导频 $\{y_\ell\}_{\ell=1}^{L_N}$；噪声方差 $\sigma_h^2$；最大迭代次数 $M_{\rm iter}$。输出各子核参数 $\{\boldsymbol\delta_n,\mathbf v_n,\widehat c_n\}_{n=1}^{N_k}$ 和能量估计 $\widehat{\zeta}^2$。

1. 初始化各个权重 $c_n^{(0)}$ 与 Armijo–Goldstein 优化器的学习率，设置迭代索引 $m=0$。
2. 将全部历史导频组成 $\mathbf y\in\mathbb C^{L_N\times1}$。
3. 对 $m=1,\ldots,M_{\rm iter}$，根据式（22）–（24）构造 GEM 核矩阵 $\mathbf K_{y,\rm Mix}$。
4. 计算 $\mathbf g=\mathbf K_{y,\rm Mix}^{-1}\mathbf y$。
5. 遍历每个子核 $n=1,\ldots,N_k$：根据式（31）构造替代函数，根据式（33）求梯度，利用 Armijo–Goldstein 优化器更新 $c_n^{(m)}$，并据此更新核矩阵。
6. 在全部迭代结束后，按原文算法中的能量更新规则计算 $\widehat{\zeta}^2$，返回网格参数及已学习的权重。

对任意定义于 $m$ 维单位超球面 $\mathbb S^m$ 上的连续概率密度函数，已有研究 [55] 证明可以用有限个 $m$ 维 von Mises–Fisher 分布的混合，在 $L^\infty$ 意义下达到任意指定的正精度 $\varepsilon$。因此，入射电磁角功率密度可由有限个 STEM 相关函数混合进行任意精度近似。这正对应所提出的混合核方法。

**备注 4：** GEM 核学习将超参数的获取转化为权重优化。每个网格点 $\boldsymbol\omega_n=(\mathbf v_n,\boldsymbol\delta_n)$ 具有物理解释，编码了用户移动和电磁波集中方向等传播特征。权重 $c_n$ 衡量第 $n$ 个子核与实际观测的关联程度，相当于对应网格点接近真实参数的相对重要性；混合核按这种关联程度汇聚全部子核。

### E. GEM-KL 信道预测算法

设基站有 $N_{\rm BS}$ 根天线，空间位置为 $\{\mathbf x_n\}_{n=1}^{N_{\rm BS}}\subset\mathbb R^3$。考虑时刻 $t_i$ 天线 $a$ 的第 $m$ 个极化分量，与时刻 $t_j$ 天线 $b$ 的第 $n$ 个极化分量之间的时空相关性，令 $p=(a,m,i)$、$q=(b,n,j)$，则：

$
K_{p,q}=\mathbf u_p^\top
\left[\mathbf K_{\rm GEM}(\mathbf x_p,t_p;\mathbf x_q,t_q)\right]
\mathbf u_q. \tag{35}
$

其中 $\mathbf u_p$ 为极化方向的单位向量。利用式（35）可构造不同时空位置的信道相关矩阵。

**算法 2：信道相关矩阵构造**

输入 GEM 超参数 $\boldsymbol\omega=\{\boldsymbol\delta_n,\mathbf v_n,\widehat c_n\}_{n=1}^{N_k}$，信道索引集合 $\mathcal P,\mathcal Q$ 及索引上下界。输出两组信道之间的相关矩阵 $\mathbf K_{\mathcal PQ}$。

1. 初始化 $\mathbf K_{\mathcal PQ}\in\mathbb C^{|\mathcal P|\times|\mathcal Q|}$。
2. 遍历 $p=p_{\min},\ldots,p_{\max}$ 及 $q=q_{\min},\ldots,q_{\max}$。
3. 按式（9）、（22）计算相关核，再按天线极化方向得到矩阵元素 $K_{p,q}$。
4. 返回 $\mathbf K_{\mathcal PQ}$。

提出的基于 EIT 的 GPR 预测过程汇总于算法 3。基站接收历史时空坐标的带噪观测，并预测未来时刻的信道。未来及过去未观测到的信道均建模为高斯随机场。首先利用 GEM-KL 训练 STEM-CF，构造历史信道的自相关矩阵 $\mathbf K_y=\mathbf K_{\mathcal LL}+\sigma_n^2\mathbf I_L$，再计算历史和未来信道之间的相关矩阵，最后使用式（37）形式的预测器获得未来信道。完整流程见图 4。

**算法 3：EIT-GEM 信道预测器**

输入：历史索引 $\ell\in\mathcal L$、未来索引 $f\in\mathcal F$、接收导频 $\mathbf y_\ell$、GEM 超参数 $\boldsymbol\omega$、噪声方差 $\sigma_n^2$。输出预测信道 $\widehat{\mathbf h}_{\mathcal F}$。

1. 按算法 1 学习 $\{\boldsymbol\delta_n,\mathbf v_n,\widehat c_n\}_{n=1}^{N_k}$。
2. 按算法 2 计算历史信道相关矩阵 $\mathbf K_{\mathcal LL}$ 和历史—未来相关矩阵 $\mathbf K_{\mathcal FL}$。
3. 设置 $\mathbf K_{y,\rm Mix}=\mathbf K_{\mathcal LL,\rm Mix}+\sigma_n^2\mathbf I_{L_N}$。
4. 计算 $\mathbf g=\mathbf K_{y,\rm Mix}^{-1}\mathbf y$。
5. 预测 $\widehat{\mathbf h}_{\mathcal F}=\mathbf K_{\mathcal FL}\mathbf g$，返回向量化的未来信道。

该方法虽然针对单用户、单天线 UE 推导，但可直接扩展到多天线和多用户系统。多天线 UE 的信道矩阵可以向量化，在不改变基本电磁原理的条件下使用相同的时空电磁核 GPR 框架。多用户系统若采用正交导频，可以分别预测每个用户的信道；若非正交接入带来显著干扰，则可以根据共享环境因素（如位置、速度）联合建模跨用户信道相关性。

对于用户速度变化的情况，可以周期性发送新的导频进行更新。STEM-KL 和 GEM-KL 都可以采用时间窗式预测，在每个时间窗内假设速度近似恒定——因为车联网等典型场景下速度的突然剧烈变化并不常见。每个预测窗口结束时，发射端发送新导频，使接收端能够更新 STEM-KL 中的速度参数 $\mathbf v$，或调整 GEM-KL 中的子核权重 $\mathbf c$。这种周期性导频更新机制在预测精度与导频开销之间取得折中；结合稀疏导频插入，可在速度变化的动态环境中保持性能与效率。

**图 4：** GEM-KL 信道预测方案流程图，包括导频观测、核参数学习、相关矩阵构造与 GPR 预测。

**备注 5：** 所提方案适用于多种 MIMO 配置，但特别适合 XL-MIMO。大量天线带来更大的空间域和更快的移动信道变化，增加预测困难；STEM 和 GEM 核学习使用由速度与集中度参数化的时空相关性，提供具有物理知识的预测方法。

### F. 计算复杂度分析

分析 STEM-KL、GEM-KL 和基于 GPR 的信道预测的计算复杂度。原文表 I 列出各算法复杂度，其中 $N_{\rm BS}$ 为基站天线数，$M_{\rm Siter}$ 和 $M_{\rm Giter}$ 分别为 STEM-KL、GEM-KL 的迭代次数，$N_k$ 为子核或基函数数目，$L$ 是用于训练的历史时隙数，$F$ 是预测时隙数；公式的进一步推导见附录 B。由于两种核学习都只需要较少迭代即可收敛，$M_{\rm Siter}$ 和 $M_{\rm Giter}$ 不必很大；所提方法也只需要少量历史信道，因此 $L$ 对复杂度的影响较小。

为进一步降低核学习式信道预测的复杂度，特别是其矩阵求逆运算，可以采用：

- **Cholesky 分解：** 信道相关矩阵半正定，可表示为 $\mathbf K=\mathbf L\mathbf L^H$，其中 $\mathbf L$ 为下三角矩阵，从而高效求解线性方程组、计算行列式。
- **并行矩阵运算：** 可通过分治算法 [56]、分块算法以及 GPU 的大规模并行性 [57] 加速求逆与乘法。
- **迭代近似逆：** 可采用 Neumann 级数和 Newton 迭代，避免直接三次复杂度求逆。对角带状 Newton 迭代（DBNI）[58] 利用 $\mathbf K_{y,\rm Mix}$ 的对角占优性，可将复杂度从立方降至平方。

**备注 6：** 核学习虽然包含立方复杂度运算，但不需要每次执行信道预测时都重新学习核参数，因此平均时间意义下，所提方法的复杂度可以降低。

**表 I：计算复杂度**

| 方法 | 复杂度 |
|---|---|
| STEM-KL 核学习 | $\mathcal O(M_{\rm Siter}N_{\rm BS}^3L^3)$ |
| GEM-KL 核学习 | $\mathcal O(M_{\rm Giter}N_kN_{\rm BS}^3L^3)$ |
| GPR 未来信道预测 | $\mathcal O(N_{\rm BS}^2LF)$ |

## V. 仿真结果

本节展示 STEM-KL 与 GEM-KL 信道预测器的数值结果，并通过和传统方法对比，评价 GEM 协方差预测器的统计学习性能。

### A. 仿真设置

为了保证信道模型具有一定现实性，分别采用标准 3GPP TR 38.901 CDL 模型和射线追踪信道模型 [59]，评价不同预测算法。在 CDL 模型中采用标准 CDL-A 时延轮廓。

系统设置如下：考虑 256 阵元天线阵列，中心位于 $(0,0,0)$，阵列沿 $x$ 轴排列；用户在 $xoz$ 平面移动。载波频率设为 $f_c=3.5$ GHz，天线间距为半波长。导频发送周期为 0.625 ms；天线极化方向单位向量 $\mathbf u=(0,1,0)^\top$。

所有信道预测算法均使用归一化均方误差（NMSE）评价：

$
\mathrm{NMSE}=\mathbb E\left[
\frac{\|\widehat{\mathbf h}_t-\mathbf h_t\|^2}
{\|\mathbf h_t\|^2}\right]. \tag{36}
$

同时比较所提方法及基线算法的可达总速率：

$
R=\log_2\left(
1+\frac{|\widehat{\mathbf w}^{H}\mathbf h|^2}
{\sigma_h^2\|\widehat{\mathbf w}\|^2}
\right), \tag{37}
$

其中 $\widehat{\mathbf w}=\widehat{\mathbf h}/\|\widehat{\mathbf h}\|$ 是合并向量。

**STEM-KL 初始化：** 集中度参数 $\boldsymbol\delta$ 初始化为 $(0,0,0)$，代表无方向偏好的各向同性角功率谱，避免预先对散射几何作假设。速度 $\mathbf v$ 也初始化为 $(0,0,0)$。虽然形式简单，但这种初始化使算法能够从信道时间序列的多普勒变化中学习速度。

**GEM-KL 初始化：** 使用 15 个子核构成网格，每个子核预先设定一组传播超参数。集中度网格 $\boldsymbol\delta_n$ 采用相对 $z$ 轴（用户运动平面）在 $-\pi/3$ 到 $\pi/3$ 范围均匀取样的五个方向，均取 $\|\boldsymbol\delta_n\|=10$，覆盖典型散射环境的方向性。速度方向候选为 $+x,-x,+z,-z$，通过似然函数选择合适的方向；速度幅值网格选择 54、27、0 km/h，共三个速度点。不同速度参数的子核加权组合，可以产生具有合适速度信息的协方差函数。为公平比较，各子核的初始权重相同，即 $c_n=1/15$。

**基线算法：** “无预测”基线通过直接比较当前信道与未来信道计算 NMSE；AR 预测器依据文献 [21] 的自回归模型构造；PVEC 复现文献 [15] 的 Prony 向量预测方法。此外，图 7 还将提出的信道预测器与基于 LSTM [32]、Transformer [11] 的深度学习预测器比较。后两者使用 3GPP CDL 信道生成训练和验证数据。为提高泛化能力，用户速度在 72–108 km/h 之间随机选择，共生成 30,000 个训练样本，训练 SNR 在 0–10 dB 之间随机选择。

### B. 多径 CDL 信道仿真

本小节利用 Matlab 5G Toolbox 生成的 CDL-A 信道，比较传统信道预测方案与基于 STEM、GEM 的预测方案。

首先使用过去两帧预测下一帧，即 $L=2,F=1$。图 5 和图 6 分别给出各方案 NMSE 与 SNR 的关系。最大多普勒对应的用户速度分别设为 36 km/h 和 72 km/h（多普勒约为 117 Hz、233 Hz）。仿真表明，在 $-10$ 到 15 dB 的 SNR 区间，所提核学习预测器显著优于传统方法，低 SNR 条件下优势尤其明显。GEM-KL 实现最低 NMSE。例如在 SNR 为 2.5 dB 时，GEM-KL 相比 AR 方法，在 36 km/h 与 72 km/h 两种速度下，分别取得约 5 dB 和 4.5 dB 的 NMSE 改善，其中速度标量 $v=\|\mathbf v\|$。

就基线而言，PVEC 在计算复杂度上没有优势，预测准确率也较低：SNR=2.5 dB、速度为 36 km/h 时，NMSE 约为 $-5.2$ dB，因此所提方法在预测精度与计算量两方面均优于 PVEC。AR 的复杂度相对较低，因为它没有建模信道的空间相关性，但预测精度也很低，基本接近无预测方法。对于无线系统，这种准确程度往往不可接受。因此，在准确性—复杂度折中方面，所提方法比这些基线更适合信道预测。

**图 5：** CDL 信道下，最大多普勒对应速度为 36 km/h 时，各种电磁核学习及传统预测方案的 NMSE—SNR 比较。**图 6：** 相同场景，最大速度改为 72 km/h 的 NMSE—SNR 比较。

电磁核方案优于传统算法的主要原因在于，STEM-CF 协方差模型嵌入了电磁传播先验，使先验相关性更准确，从而提升预测性能。加入核学习后，模型可以从观测中确定更合适的超参数，更好地拟合实际相关函数。GEM-KL 又通过把集中度 $\boldsymbol\delta$ 与用户速度 $\mathbf v$ 的联合优化转换为已知网格核的权重优化，减轻直接学习的局部最优问题。多个子核的组合能够适配多径信道，从历史接收导频中学习更合适的电磁相关性模式，因此获得更稳定、准确的预测。

为了评价随时间变化的预测性能，改用过去两帧并行预测未来五帧，即 $L=2,F=5$。图 7 给出 SNR=5 dB、速度为 72 km/h 时不同未来帧的 NMSE。与 AR、PVEC 相比，电磁核预测器明显更准确。虽然 Transformer 在该实验中超过了 STEM-KL，但 GEM-KL 仍表现最佳。以第二个未来帧为例，GEM-KL 相比 AR 改善约 3.4 dB NMSE，并优于 Transformer 约 0.74 dB。

**图 7：** CDL 信道中，最大速度为 72 km/h 时，不同未来帧的 NMSE 随时间变化。

还仿真预测器可达总速率随时间的变化，用于评价信道预测的通信收益。图中的理论上界“Perfect CSI”是假设已准确知道真实 CSI。图 8 在 SNR=5 dB、最大速度 72 km/h 时显示，STEM-KL 与 GEM-KL 在各未来时刻的可达总速率均高于其他预测算法，验证了所提方法的有效性。

**图 8：** CDL 信道中，最大速度为 72 km/h 时的可达总速率随时间变化。

此外，在不同用户速度下评价预测性能。速度从 20 m/s（72 km/h）增加至 100 m/s（360 km/h）。取 SNR=5 dB，使用过去两帧预测下一帧。图 9 显示，STEM-KL 和 GEM-KL 均明显优于基线，GEM-KL 在所有速度下都取得最低 NMSE。以速度为 216 km/h 的场景为例，GEM-KL 相比 AR 改善约 2.1 dB NMSE。

**图 9：** CDL 信道中 NMSE 随用户移动速度变化。

特别值得注意的是，当预测多个未来帧时，随着预测时间增长，基于 STEM 核的方法的 NMSE 上升更慢，表明性能更稳定。这是因为其能够并行预测多个时刻的信道，避免将前一帧预测误差传递到下一帧。综合图 5–9 可见，GEM-KL 能够更准确地预测未来信道，减轻用户移动对无线通信的不利影响。

### C. 射线追踪信道仿真

为了在更接近现实的场景中检验性能，选择文献 [59] 的射线追踪信道。基站与用户均位于香港，基站与用户之间的传播路径通过射线追踪获得。

图 10 绘制不同方案 NMSE 随 SNR 的变化，设置 $L=2,F=1$。最大速度为 72 km/h（约 233 Hz 多普勒频移），可见在射线追踪场景中，几种基于 STEM 的预测方法均优于无预测、AR 与 PVEC，其中 GEM-KL 表现最好。例如 SNR=2.5 dB 时，GEM-KL 相比 AR 改善约 4.4 dB NMSE。

**图 10：** 射线追踪信道中最大速度 72 km/h 时的 NMSE—SNR 比较。

图 11 展示不同方法的 NMSE 随预测时间变化。当 SNR=5 dB、每帧时长为 0.75 ms 时，用过去两帧预测未来五帧。基于 GEM 核的并行预测在未来帧中同样表现最好。以第二个未来帧为例，GEM-KL 相比 AR 预测器改善约 4.2 dB NMSE。

**图 11：** 射线追踪信道中，速度为 72 km/h 时的 NMSE 随时间变化。

图 12 比较预测器的可达总速率。取 SNR=5 dB、帧时长 0.75 ms、最大速度 72 km/h，可见对于未来五帧，STEM-KL 和 GEM-KL 的可达总速率均高于传统预测算法，进一步说明方案有效。

**图 12：** 射线追踪信道中，最大速度为 72 km/h 时的可达总速率随时间变化。

最后，比较不同速度下的性能。用户速度在 72–360 km/h 之间变化，SNR=5 dB，用过去两帧预测下一帧。图 13 表明两种 STEM 核学习方案都优于基线，GEM-KL 在全部速度场景中获得最低 NMSE。以 60 m/s（216 km/h）为例，GEM-KL 相比 AR 改善约 2.7 dB NMSE。

**图 13：** 射线追踪信道中 NMSE 随用户速度变化。

射线追踪结果表明，STEM-KL 方法优于传统预测器有两个原因。一方面，电磁核比其他相关性表示更准确地描述信道时空相关性；另一方面，STEM-KL 能并行预测多个未来时刻，避免逐帧预测的误差累积。核学习可以找到更好的集中度 $\boldsymbol\delta$ 和移动速度 $\mathbf v$，使 STEM 核更准确地反映真实相关性。不过，梯度下降式学习依赖初始化，初始化不佳时会落入局部最优。GEM-KL 通过对不同网格点的核按学习权重组合，缓解超参数局部最优问题，因而性能更加稳定。在本文比较的方案中，GEM-KL 的 GPR 预测器整体表现最好。

## VI. 结论

本文针对 XL-MIMO 场景，通过时空电磁（STEM）核学习设计了高精度信道预测器。STEM 相关函数能够刻画无线信道的基本传播特性，适合作为包含物理先验信息的核函数。为拟合时变信道，设计了包括用户速度与电磁波集中度在内的超参数，并通过核学习估计这些参数。随后利用 GPR 预测未来信道。

为进一步提高预测稳定性，提出 GEM-KL 预测器，将 STEM 核近似为多个 STEM 子核组成的网格化电磁混合核。多核方案也更加适合多径信道预测。最后，使用 CDL 与射线追踪信道开展数值测试，证明 STEM-KL 优于传统基线，其中 GEM-KL 的预测效果在比较方案中最好。未来将把 GEM-KL 用于更复杂的信道预测问题，例如频域宽带信道预测。

## 附录 A. MM 算法替代函数证明

利用 $\ln\det\mathbf K_{y,\rm Mix}(\mathbf c)$ 的凹性，可得其上界：

$
\begin{aligned}
\ln\det\mathbf K_{y,\rm Mix}(\mathbf c)
\le{}&\ln\det\mathbf K_{y,\rm Mix}^{(m)}\\
&+\sum_{n=1}^{N_k}(c_n-c_n^{(m)})
\left.\frac{\partial\ln\det\mathbf K_{y,\rm Mix}}
{\partial c_n}\right|_{\mathbf c^{(m)}}.
\end{aligned}\tag{38}
$

代入式（30）的梯度，上式可写成：

$
\begin{aligned}
\ln\det\mathbf K_{y,\rm Mix}(\mathbf c)
\le{}&\ln\det\mathbf K_{y,\rm Mix}^{(m)}\\
&+2\Re\left[
\sum_{n=1}^{N_k}(c_n-c_n^{(m)})
\operatorname{tr}\big(\mathbf K_{\mathcal LL,n}
(\mathbf K_{y,\rm Mix}^{(m)})^{-1}\big)\right].
\end{aligned}\tag{39}
$

由于
$\sum_{n=1}^{N_k}(c_n-c_n^{(m)})\mathbf K_{\mathcal LL,n}
=\mathbf K_{y,\rm Mix}-\mathbf K_{y,\rm Mix}^{(m)}$，
所以可化简为：

$
\begin{aligned}
\ln\det\mathbf K_{y,\rm Mix}(\mathbf c)
\le{}&\ln\det\mathbf K_{y,\rm Mix}^{(m)}\\
&+2\Re\operatorname{tr}\left[
(\mathbf K_{y,\rm Mix}^{(m)})^{-1}
(\mathbf K_{y,\rm Mix}-\mathbf K_{y,\rm Mix}^{(m)})
\right].
\end{aligned}\tag{40}
$

将该上界代入 $\ell_r$，便得到式（31）的 MM 替代函数。证明完毕。

## 附录 B. 计算复杂度公式说明

STEM-KL 需要对速度参数 $\mathbf v$ 和集中度 $\boldsymbol\delta$ 迭代执行梯度优化。对 $N_{\rm BS}$ 根天线和 $L$ 个历史帧，其似然函数为：

$
\ell(\mathbf v,\boldsymbol\delta\mid\mathbf y)
=\ln p(\mathbf y\mid\mathbf v,\boldsymbol\delta)
=-\ln\det\mathbf K_y
-\mathbf y^H\mathbf K_y^{-1}\mathbf y+\text{const}. \tag{41}
$

其中 $\mathbf K_y\in\mathbb C^{N_{\rm BS}L\times N_{\rm BS}L}$。每次迭代都需计算似然并执行矩阵求逆，其他计算的复杂度不高于求逆。若总迭代次数为 $M_{\rm Siter}$，则 STEM-KL 总复杂度为 $\mathcal O(M_{\rm Siter}N_{\rm BS}^3L^3)$。

GEM-KL 无需交替优化速度与集中度参数，但需迭代优化 $N_k$ 个子核权重。每轮要计算 $N_k$ 次式（31）的替代函数，主要成本仍来自核矩阵求逆的立方复杂度。因此，GEM-KL 总计算复杂度为 $\mathcal O(M_{\rm Giter}N_kN_{\rm BS}^3L^3)$。

核学习获得信道相关矩阵后，使用高斯后验预测
$\widehat{\mathbf h}_{\mathcal F}=\mathbf K_{\mathcal FL}\mathbf K_y^{-1}\mathbf y$。
在核学习过程中已计算 $\mathbf g=\mathbf K_y^{-1}\mathbf y$；
由于 $\mathbf K_{\mathcal FL}\in\mathbb C^{N_{\rm BS}F\times N_{\rm BS}L}$ 且
$\mathbf g\in\mathbb C^{N_{\rm BS}L\times1}$，
GPR 预测阶段主要计算矩阵—向量乘积 $\mathbf K_{\mathcal FL}\mathbf g$，
其复杂度为 $\mathcal O(N_{\rm BS}^2LF)$。


## 参考文献（[1]–[59]，保留英文正式书目信息）

[1] Z. Wang et al., “A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications,” IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1560–1605, Jan. 2024.

[2] F. Rusek et al., “Scaling up MIMO: Opportunities and challenges with very large arrays,” IEEE Signal Process. Mag., vol. 30, no. 1, pp. 40–60, Jan. 2013.

[3] H. Q. Ngo, E. G. Larsson, and T. L. Marzetta, “Energy and spectral efficiency of very large multiuser MIMO systems,” IEEE Trans. Commun., vol. 61, no. 4, pp. 1436–1449, Apr. 2013.

[4] L. Lu, G. Y. Li, A. L. Swindlehurst, A. Ashikhmin, and R. Zhang, “An overview of massive MIMO: Benefits and challenges,” IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 742–758, Oct. 2014.

[5] Z. Xiao, Z. Zhang, Z. Chen, Z. Yang, C. Huang, and X. Chen, “From data-driven learning to physics-inspired inferring: A novel mobile MIMO channel prediction scheme based on neural ODE,” IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7186–7199,Jul. 2024.

[6] Y. Zhang, J. Zhang, and L. Yu, “Cluster-based fast time-varying MIMO channel fading prediction in the high-speed scenario,” IEEE Access, vol. 7, pp. 148692–148705, 2019.

[7] Z. Zhang, Y. Zhang, J. Zhang, and F. Gao, “Adversarial trainingaided time-varying channel prediction for TDD/FDD systems,” China Commun., vol. 20, no. 6, pp. 100–115, Jun. 2023.

[8] Radio Resource Control (RCC) Protocol Specification, document 3GPP TS 38.331, Jun. 2019.

[9] L. Yuan, F. Zhou, Q. Wu, and D. W. K. Ng, “Channel predictionenhanced intelligent resource allocation for dynamic spectrumsharing networks,” in Proc. IEEE Int. Conf. Commun., Jun. 2024, pp. 2767–2772.

[10] J. Zheng, J. Zhang, E. Björnson, and B. Ai, “Impact of channel aging on cell-free massive MIMO over spatially correlated channels,” IEEE Trans. Wireless Commun., vol. 20, no. 10, pp. 6451–6466,Oct. 2021.

[11] H. Jiang, M. Cui, D. W. K. Ng, and L. Dai, “Accurate channel prediction based on transformer: Making mobility negligible,” IEEE J. Sel. Areas Commun., vol. 40, no. 9, pp. 2717–2732, Sep. 2022.

[12] H. Lu et al., “A tutorial on near-field XL-MIMO communications toward 6G,” IEEE Commun. Surveys Tuts., vol. 26, no. 4, pp. 2213–2257,Apr. 2024.

[13] F. Pena-Campos, R. Carrasco-Alvarez, O. Longoria-Gandara, and R. Parra-Michel, “Estimation of fast time-varying channels in OFDM systems using two-dimensional prolate,” IEEE Trans. Wireless Commun., vol. 12, no. 2, pp. 898–907, Feb. 2013.

[14] I. C. Wong and B. L. Evans, “Sinusoidal modeling and adaptive channel prediction in mobile OFDM systems,” IEEE Trans. Signal Process., vol. 56, no. 4, pp. 1601–1615, Apr. 2008.

[15] H. Yin, H. Wang, Y. Liu, and D. Gesbert, “Addressing the curse of mobility in massive MIMO with prony-based angular-delay domain channel predictions,” IEEE J. Sel. Areas Commun., vol. 38, no. 12, pp. 2903–2917, Dec. 2020.

[16] Y. Shi, Z. Jiang, Y. Liu, Y. Wang, and S. Xu, “A compressive sensing based channel prediction scheme with uneven pilot design in mobile massive MIMO systems,” in Proc. 13th Int. Conf. Wireless Commun. Signal Process. (WCSP), Oct. 2021, pp. 1–6.

[17] J. Lee, G.-T. Gil, and Y. H. Lee, “Channel estimation via orthogonal matching pursuit for hybrid MIMO systems in millimeter wave communications,” IEEE Trans. Commun., vol. 64, no. 6, pp. 2370–2386, Jun. 2016.

[18] K. E. Baddour and N. C. Beaulieu, “Autoregressive modeling for fading channel simulation,” IEEE Trans. Wireless Commun., vol. 4, no. 4, pp. 1650–1662, Jul. 2005.

[19] J. Yuan, H. Q. Ngo, and M. Matthaiou, “Machine learningbased channel prediction in massive MIMO with channel aging,” IEEE Trans. Wireless Commun., vol. 19, no. 5, pp. 2960–2973, May 2020.

[20] L. Chen, M. Loschonsky, and L. M. Reindl, “Autoregressive modeling of mobile radio propagation channel in building ruins,” IEEE Trans. Microw. Theory Techn., vol. 60, no. 5, pp. 1478–1489, May 2012.

[21] M. Yusuf et al., “Autoregressive modeling approach for non-stationary vehicular channel simulation,” IEEE Trans. Veh. Technol., vol. 71, no. 2, pp. 1124–1131, Feb. 2022.

[22] D. Löschenbrand, M. Hofer, and T. Zemen, “Spectral efficiency of timevariant massive MIMO using Wiener prediction,” IEEE Commun. Lett., vol. 27, no. 4, pp. 1225–1229, Apr. 2023.

[23] A. K. Papazafeiropoulos and T. Ratnarajah, “Deterministic equivalent performance analysis of time-varying massive MIMO systems,” IEEE Trans. Wireless Commun., vol. 14, no. 10, pp. 5795–5809, Oct. 2015.

[24] L. Lindbom, M. Sternad, and A. Ahlen, “Tracking of timevarying mobile radio channels.1. the Wiener LMS algorithm,” IEEE      Trans.     Commun.,     vol. 49,    no. 12,    pp. 2207–2217, Aug. 2001.

[25] Z. Qin, H. Yin, and W. Li, “Low-complexity eigenvector predictionbased precoding matrix prediction in massive MIMO with mobility,” 2023, arXiv:2308.12619.

[26] K. T. Truong and R. W. Heath, “Effects of channel aging in massive MIMO systems,” J. Commun. Netw., vol. 15, no. 4, pp. 338–351, Aug. 2013.

[27] S. Kashyap, C. Mollén, E. Björnson, and E. G. Larsson, “Performance analysis of (TDD) massive MIMO with Kalman channel prediction,” in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), Mar. 2017, pp. 3554–3558.

[28] H. Kim, S. Kim, H. Lee, C. Jang, Y. Choi, and J. Choi, “Massive MIMO channel prediction: Kalman filtering vs. machine learning,” IEEE Trans. Commun., vol. 69, no. 1, pp. 518–528, Jan. 2021.

[29] W. Jiang and H. D. Schotten, “Neural network-based fading channel prediction: A comprehensive overview,” IEEE Access, vol. 7, pp. 118112–118124, 2019.

[30] J. M. J. Huttunen, D. Korpi, and M. Honkala, “DeepTx: Deep learning beamforming with channel prediction,” IEEE Trans. Wireless Commun., vol. 22, no. 3, pp. 1855–1867, Mar. 2023.

[31] Y. Zhang, Y. Wu, A. Liu, X. Xia, T. Pan, and X. Liu, “Deep learning-based channel prediction for LEO satellite   massive     MIMO       communication      system,”     IEEE Wireless     Commun.       Lett.,  vol. 10,    no. 8,    pp. 1835–1839, Aug. 2021.

[32] W. Jiang and H. D. Schotten, “Deep learning for fading channel prediction,” IEEE Open J. Commun. Soc., vol. 1, pp. 320–332, 2020.

[33] I. Helmy, P. Tarafder, and W. Choi, “LSTM-GRU model-based channel prediction for one-bit massive MIMO system,” IEEE Trans. Veh. Technol., vol. 72, no. 8, pp. 11053–11057, Aug. 2023.

[34] T. Zhou et al., “Transformer network based channel prediction for CSI feedback enhancement in AI-native air interface,” IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 11154–11167, Sep. 2024.

[35] M. Bodini, M. W. Rivolta, and R. Sassi, “Opening the black box: Interpretability of machine learning algorithms in electrocardiography,” Phil. Trans. Roy. Soc. A, Math., Phys. Eng. Sci., vol. 379, no. 2212, Oct. 2021, Art. no. 20200253.

[36] M. D. Migliore, “Horse (electromagnetics) is more important than horseman (information) for wireless transmission,” IEEE Trans.     Antennas     Propag.,    vol. 67,   no. 4,    pp. 2046–2055, Apr. 2019.

[37] R. Li et al., “An electromagnetic information theory based model for efficient characterization of MIMO systems in complex space,” IEEE Trans. Antennas Propag., vol. 71, no. 4, pp. 3497–3508, Apr. 2023.

[38] J. Zhu, X. Su, Z. Wan, L. Dai, and T. J. Cui, “The benefits of electromagnetic information theory for channel estimation,” in Proc. ICC - IEEE Int. Conf. Commun., Jun. 2024, pp. 4869–4874.

[39] A. Pizzo, T. L. Marzetta, and L. Sanguinetti, “Spatiallystationary model for holographic MIMO small-scale fading,” IEEE J. Sel. Areas Commun., vol. 38, no. 9, pp. 1964–1979, Sep. 2020.

[40] A. Pizzo, L. Sanguinetti, and T. L. Marzetta, “Fourier planewave series expansion for holographic MIMO communications,” IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 6890–6905, Sep. 2022.

[41] J. Zhu, Z. Wan, L. Dai, M. Debbah, and H. V. Poor, “Electromagnetic information theory: Fundamentals, modeling, applications, and open problems,” IEEE Wireless Commun., vol. 31, no. 3, pp. 156–162, Jun. 2024.

[42] S. Mumtaz, J. Rodriguez, and L. Dai, mmWave Massive MIMO: A Paradigm for 5G. New York, NY, USA: Academic, 2016.

[43] L. Cheng, B. Henty, F. Bai, and D. D. Stancil, “Doppler spread and coherence time of rural and highway vehicle-to-vehicle channels at 5.9 GHz,” in Proc. IEEE Global Telecommun. Conf., Sep. 2008, pp. 1–6.

[44] T. Gong, C. Huang, J. He, M. Di Renzo, M. Debbah, and C. Yuen, “A transmit-receive parameter separable electromagnetic channel model for LoS holographic MIMO,” in Proc. IEEE Global Commun. Conf.,Dec. 2023, pp. 5701–5706.

[45] L. Wei et al., “Electromagnetic information theory for holographic MIMO communications,” 2024, arXiv:2405.10496.

[46] Z. Wan, J. Zhu, and L. Dai, “Near-field channel modeling for electromagnetic information theory,” IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 18004–18018, Dec. 2024.

[47] M. Chafii, L. Bariah, S. Muhaidat, and M. Debbah, “Twelve scientific challenges for 6G: Rethinking the foundations of communications theory,” IEEE Commun. Surveys Tuts., vol. 25, no. 2, pp. 868–904,Feb. 2023.

[48] Z. Wan, J. Zhu, and L. Dai, “Electromagnetic information theory motivated near-field channel model,” in Proc. IEEE Int. Symp. Inf. Theory (ISIT), Jul. 2024, pp. 1800–1805.

[49] J. Zhu, Z. Wan, L. Dai, and T. Jun Cui, “Electromagnetic information theory-based statistical channel model for improved channel estimation,” IEEE Trans. Inf. Theory, vol. 71, no. 3, pp. 1777–1793,Mar. 2025.

[50] K. V. Mardia and S. A. M. El-Atoum, “Bayesian inference for the von mises-Fisher distribution,” Biometrika, vol. 63, no. 1, pp. 203–206,Apr. 1976.

[51] E. Schulz, M. Speekenbrink, and A. Krause, “A tutorial on Gaussian process regression: Modelling, exploring, and exploiting functions,” J. Math. Psychol., vol. 85, pp. 1–16, Aug. 2018.

[52] M. Wytock and J. Z. Kolter, “Sparse Gaussian conditional random fields: Algorithms, theory, and application to energy forecasting,” in Proc. Int. Conf. Mach. Learning., vol. 28, Mar. 2007, pp. 1265–1273.

[53] F. Yin, L. Pan, T. Chen, S. Theodoridis, Z.-Q.-T. Luo, and A. M. Zoubir, “Linear multiple low-rank kernel based stationary Gaussian processes regression for time series,” IEEE Trans. Signal Process., vol. 68, pp. 5260–5275, 2020.

[54] Y. Sun, P. Babu, and D. P. Palomar, “Majorization-minimization algorithms in signal processing, communications, and machine learning,” IEEE Trans. Signal Process., vol. 65, no. 3, pp. 794–816,Feb. 2017.

[55] T. L. J. Ng and K.-K. Kwong, “Universal approximation on the hypersphere,” Commun. Statist. Theory Methods, vol. 51, no. 24, pp. 8694–8704, Dec. 2022.

[56] C. Hsieh, A. Banerjee, I. S. Dhillon, and P. Ravikumar, “A divide-andconquer method for sparse inverse covariance estimation,” in Proc. Adv. Neural Inf. Process. Syst. (NIPS), vol. 25, Jan. 2012, pp. 2330–2338.

[57] E. Abdul Fattah, H. Ltaief, H. Rue, and D. Keyes, “GPU-accelerated parallel selected inversion for structured matrices using sTiles,” 2025, arXiv:2504.19171.

[58] C. Tang, C. Liu, L. Yuan, and Z. Xing, “High precision low complexity matrix inversion based on Newton iteration for data detection in the massive MIMO,” IEEE Commun. Lett., vol. 20, no. 3, pp. 490–493, Mar. 2016.

[59] K. R. Schaubach, N. J. Davis, and T. S. Rappaport, “A ray tracing method for predicting path loss and delay spread in microcellular environments,” in Proc. 42nd VTS Conf. Frontiers Technol., Jun. 1992, pp. 932–935.

## 作者简介

**Jinke Li（李金科）：** 2023 年获得吉林大学通信工程学士学位，目前在清华大学电子工程系攻读硕士学位。研究兴趣包括超大规模 MIMO（XL-MIMO）、CSI 获取、电磁信息论（EIT）和近场通信。

**Jieao Zhu（朱杰傲）：** 2021 年获得清华大学电子工程学士和应用数学理学学士学位，目前在清华大学电子工程系攻读博士学位。研究兴趣包括 EIT、可重构智能表面（RIS）和里德伯原子接收机。曾于 2018 年、2020 年获得本科生国家奖学金，2025 年获得博士研究生国家奖学金；2021 年获评北京市优秀毕业生。

**Linglong Dai（戴凌龙）：** 2003 年获浙江大学学士学位，2006 年获中国电信科学技术研究院硕士学位（优秀），2011 年获清华大学博士学位（优秀）。2011—2013 年在清华大学电子工程系从事博士后研究；2013—2016 年任助理教授，2016—2022 年任副教授，自 2022 年起任教授。合著 *MmWave Massive MIMO: A Paradigm for 5G*（Academic Press，2016），发表 90 余篇 IEEE 期刊论文和 50 余篇 IEEE 会议论文，持有 20 余项授权专利。研究方向包括大规模 MIMO、RIS、毫米波与太赫兹通信、无线通信机器学习、近场通信及量子信息技术。曾获 IEEE ICC 2013、2014、2017、2018 和 IEEE VTC 2017-Fall 最佳论文奖，及清华大学 2011 年优秀博士毕业生奖、北京市 2012 年优秀博士学位论文奖、2013 年全国优秀博士学位论文提名、2014 年 URSI 青年科学家奖、2015 年 IEEE Transactions on Broadcasting 最佳论文奖、2016 年 Electronics Letters 最佳论文奖、2017 年国家优秀青年科学基金、IEEE ComSoc 亚太地区杰出青年研究者奖、2018 年 IEEE ComSoc 亚太地区杰出论文奖、2019 年 China Communications 最佳论文奖、2020 年 IEEE Access 最佳多媒体奖、IEEE 通信学会 Leonard G. Abraham 奖、2022 年 IEEE ICC 杰出演示奖、2023 年国家杰出青年科学基金，以及 2025 年 IEEE ComSoc Stephen O. Rice 奖。2020—2025 年被科睿唯安列为高被引学者，2022 年晋升 IEEE Fellow。

**全文 QA 状态：** 主要章节、公式和书目已覆盖；仍需根据排版 PDF 对每条长公式、图表与术语完成独立逐项核对。

{% endraw %}
