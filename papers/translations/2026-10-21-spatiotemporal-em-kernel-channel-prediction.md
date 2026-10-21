---
layout: page
title: "用于信道预测的时空电磁核学习｜中文译稿（翻译中）"
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
**译文范围：** 已译摘要、引言与现有工作、系统模型、问题表述、第 IV 节时空电磁相关核构造及高斯过程回归起始部分。后续核学习优化、GEM-KL 算法、全部实验、附录和参考文献仍待翻译校对，**不是已验收全文**。

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

## IV. 基于时空电磁核学习的信道预测（已译部分）

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

**待补：** IV-D 网格化混合核与凸优化、IV-E 预测算法、复杂度分析、V–VI 节及附录。

{% endraw %}
