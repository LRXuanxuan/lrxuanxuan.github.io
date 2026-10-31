---
layout: page
title: "Rényi 正则化流式变分推断用于贝叶斯标定｜中文全文译文"
permalink: /papers/translations/2026-10-30-renyi-regularized-flow-2610-37169/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2610.37169) · [全部目录](/papers/catalog/)

# 用于贝叶斯标定的 Rényi 正则化流式变分推断

**原题：** Rényi-Regularized Flow-Based Variational Inference for Bayesian Calibration  
**作者：** Exaucé Luweh Adjim Ngarti、Elise Arnaud、Léo Nicoletti、Victor Trappler、Arthur Vidard。**单位：** Univ. Grenoble Alpes / Inria / CNRS / LJK；Bull CEPP；Mines Saint-Étienne / LIMOS。**通讯作者：** Exaucé Luweh Adjim Ngarti（exaucengarti@gmail.com）。  
**来源：** arXiv:2610.37169v1，2026 年 10 月 27 日，10 页。  
**译校说明：** 下文按原文 1—5 节和附录 A—D 的顺序翻译，保留主要公式编号、实验参数与表格。参考书目保留完整英文出版信息并附中文题名。本轮已补录图 1—4 的完整图注并核对表 1—4 与 20 条书目；PDF 逐自然段和全部数学符号的字符级终校仍未完成，不标记为已验收全文。

## 摘要

采用归一化流（normalizing flows）的变分推断能够为贝叶斯模型标定提供灵活的后验近似，但当后验具有若干被低概率质量区域隔开的模态时，近似往往面临困难。本文在一个双参数孪生实验中研究该现象，并对变分目标进行正则化。在高斯观测误差及高斯先验下，相应的最小化目标可写为 Tikhonov 标定目标的期望减去近似分布的微分熵。然而，Tikhonov 期望项倾向于使分布集中在某一模态附近，而熵最大化并不保证多模态性。

作者引入基于 Rényi 散度的正则化项，鼓励近似后验覆盖先验支持区域。在连通的双峰后验场景中，流模型能够表征两个模态；但在模态间隔明显的场景中，流模型和高斯混合模型经常遗漏其中一个模态。引入的正则化将近乎塌缩的实验比例由 50% 降至 25%。尽管正则化改善了该实验中的模态覆盖，但它改变了贝叶斯变分目标，在近似精度方面带来权衡，也不能作为解决模态塌缩的通用办法。

**关键词：** 贝叶斯标定；变分推断；归一化流；Rényi 散度；模态塌缩。

## 1. 引言

贝叶斯标定通过后验分布刻画数值模型参数的不确定性。包括 Metropolis–Hastings、Gibbs 采样和哈密顿蒙特卡洛（Hamiltonian Monte Carlo，HMC）在内的马尔可夫链蒙特卡洛（MCMC）方法，能够从后验分布中抽取样本。然而，当每次似然函数求值都很昂贵——数值模拟器中经常如此——其计算成本可能高得难以承受。变分推断（variational inference，VI）采用优化方法近似后验；归一化流则提供既能高效采样、又能计算对数密度的灵活分布族。

可替代的变分目标包括 χ 散度、α 散度、稳健和尾部自适应的 f 散度，以及 Tsallis 散度。本文考虑由反向 Kullback–Leibler（KL）散度导出的标准证据下界（evidence lower bound，ELBO）。但当后验包含多个被低概率质量区域隔开的模态时，基于 ELBO 的 VI 很容易遇到困难。

作者在负 ELBO 中加入从先验到变分近似的 Rényi 散度，促使近似后验覆盖先验支持区域。研究使用一个双参数标定问题作为受控基准，并考虑两种情形：一种是弯曲的、两个模态之间不存在近乎零概率分隔带的双峰分布；另一种是两个模态之间被近乎零概率质量的区域明显隔开。基于流的 VI 在前者中取得较好的近似，在后者中则难以稳定覆盖两个模态。所采用的正则化将近乎塌缩比例从 50% 降至 25%。

本文首先回顾贝叶斯标定框架，建立 ELBO 与经典 Tikhonov 正则化之间的联系，并说明为什么这一联系有助于解释多模态后验的模态塌缩。随后介绍 Rényi 正则化，并在受控基准上进行数值实验。

## 2. 背景

### 2.1 贝叶斯模型标定

记数值模型为 $G:\Theta\times U\to Y$，其中 $\theta\in\Theta$ 为需要标定的模型参数，$u\in U$ 为每次运行模型时指定的上下文变量。标定使用观测及其相应的上下文 $(y_{1:n},u_{1:n})$。假定条件独立的高斯观测误差，以及与上下文无关的高斯参数先验：

$$
Y_i\mid\theta,u_i\sim\mathcal N(G(\theta,u_i),R),
\qquad
\Theta\sim\mathcal N(\theta_b,B). \tag{2.1}
$$

这里，$\theta_b\in\Theta$ 是先验均值；$B$ 和 $R$ 为正定协方差矩阵。后验密度为

$$
\pi(\theta;y_{1:n},u_{1:n})
:=p_{\Theta\mid Y_{1:n},U_{1:n}}(\theta\mid y_{1:n},u_{1:n})
\propto p_\Theta(\theta)\prod_{i=1}^n
p_{Y_i\mid\Theta,U_i}(y_i\mid\theta,u_i). \tag{2.2}
$$

### 2.2 基于归一化流的变分推断

变分推断以参数化分布 $q_\phi$ 近似式（2.2）的后验，其做法是最小化 KL 散度，等价于最小化负 ELBO：

$$
\mathcal L_{\mathrm{ELBO}}(\phi;y_{1:n},u_{1:n})
=\mathbb E_{q_\phi}\!\left[
\log q_\phi(\Theta)-\log p_\Theta(\Theta)
-\sum_{i=1}^{n}\log p_{Y_i\mid\Theta,U_i}(y_i\mid\Theta,u_i)
\right].\tag{2.3}
$$

本文用归一化流建模 $q_\phi=(T_\phi)_\sharp q_Z$。其中 $T_\phi$ 是将基础分布 $q_Z$ 映射为表达能力更强的分布的可微可逆变换，$\sharp$ 表示分布的推前（push-forward）。

### 2.3 与 Tikhonov 正则化的联系

对正定矩阵 $B$，定义加权二次型 $\|v\|_{B^{-1}}^2=v^\top B^{-1}v$。在高斯标定假设下，得到 Tikhonov 损失

$$
J(\theta)=\frac12\sum_{i=1}^n
\|y_i-G(\theta,u_i)\|_{R^{-1}}^2+
\frac12\|\theta-\theta_b\|_{B^{-1}}^2.\tag{2.4}
$$

令 $H(q_\phi)=-\mathbb E_{q_\phi}[\log q_\phi(\Theta)]$ 为流分布的微分熵。将高斯似然与高斯先验代入式（2.3），可得

$$
\mathcal L_{\mathrm{ELBO}}(\phi;y_{1:n},u_{1:n})
\overset c=\mathbb E_{q_\phi}[J(\Theta)]-H(q_\phi),\tag{2.5}
$$

其中 $\overset c=$ 表示两边仅相差与 $\phi$ 无关的常数。由此可见，变分标定最小化的是 Tikhonov 泛函的期望减去熵。前一项鼓励近似分布集中在 $J$ 较小的区域，而熵项鼓励分布扩散。尽管在所有分布上最小化负 ELBO 的解是精确后验，受限制的变分分布族及其实际优化过程，仍可能使近似分布集中于单一模态，特别是在不同模态被低概率质量区域隔开时。

## 3. 变分推断的先验 Rényi 正则化

### 3.1 正则化目标

正则化的目的是避免变分分布在先验仍具有显著概率质量的区域分配过小的概率。本文采用 Rényi 散度：

$$
D_{\mathrm{Renyi}}^\rho(p\|q)
=\frac1{\rho-1}\log\int p(\xi)^\rho q(\xi)^{1-\rho}\,d\xi,
\qquad \rho>0,\ \rho\ne1.\tag{3.1}
$$

相应的正则化目标定义为

$$
\mathcal L_{\mathrm{ELBO},r}(\phi;y_{1:n},u_{1:n})
:=\mathcal L_{\mathrm{ELBO}}(\phi;y_{1:n},u_{1:n})+\lambda\mathcal R_\phi,
\qquad
\mathcal R_\phi:=D^\rho_{\mathrm{Renyi}}(p_\Theta\|q_\phi).
\tag{3.2}
$$

之所以选择由先验 $p_\Theta$ 指向近似分布 $q_\phi$ 的散度方向，是为了抑制变分分布在先验概率质量显著的区域出现过低的密度。当 $\rho>1$ 时，若某集合在先验下具有正概率、但变分密度为零，则散度为无穷大。正则项的估计方法见附录 C。

### 3.2 自适应权重

作者采用由文献 [3] 启发的梯度归一化策略，使两个目标项的梯度量级相匹配。训练步 $t$ 时，令

$$
g_t^{(E)}=\|\nabla_\phi\mathcal L_{\mathrm{ELBO}}\|_2,\qquad
g_t^{(R)}=\|\nabla_\phi\mathcal R_\phi\|_2.
$$

它们的指数平滑值与权重更新满足

$$
\bar g_t^{(a)}
=\beta\bar g_{t-1}^{(a)}+(1-\beta)g_t^{(a)},\quad
a\in\{E,R\},\qquad
\lambda_{t+1}=r\,\frac{\bar g_t^{(E)}}{\bar g_t^{(R)}+\epsilon}.
\tag{3.3}
$$

这里 $\beta\in[0,1)$ 是平滑系数，$r>0$ 是目标梯度比，$\epsilon>0$ 是数值稳定常数。更新后的权重用于下一次训练步；在计算正则目标相对于 $\phi$ 的梯度时，将该权重视为常数。

## 4. 数值实验

### 4.1 合成基准

数值模型的参数为 $\theta=(\theta_0,\theta_1)\in\Theta\subset\mathbb R^2$，上下文为 $u=(u_0,u_1)\in U\subset\mathbb R^2$，观测空间为 $Y\subset\mathbb R^{10}$。前向模型 $G:\Theta\times U\to Y$ 将 $(\theta,u)$ 映射至 10 维输出：

$$
G:(\theta,u)\longmapsto
((G(\theta,u))_1,\ldots,(G(\theta,u))_{d_y}),\qquad d_y=10.
\tag{4.1}
$$

对于 $1\le i\le10$，各分量分别定义为

$$
(G(\theta,u))_i
:=u_1\left(1+\frac12\sin\frac i2\right)\theta_0^2
-\left(1+\frac12\cos\frac i2\right)\theta_1+u_0.
\tag{4.2}
$$

合成实验只在一个上下文 $u_s$ 下生成观测：$y_s=G(\theta^{\mathrm{Truth}},u_s)+\varepsilon$，其中高斯噪声协方差为 $5\times10^{-2}I_{10}$。通过选择 $u_s$ 与真实参数，构造两类标定问题：情形 A 产生弯曲的 V 形双峰后验，其模态之间存在明显的连通区域；情形 B 则具有被极低概率密度区域隔开的模态。

**表 1：孪生实验配置。** 两种情形的先验均值均为零，观测噪声协方差均为 $5\times10^{-2}I_{10}$；先验协方差记作 $B$。

| 情形 | 真实参数 $\theta^{\mathrm{Truth}}$ | 上下文 $u_s$ |
|---|---|---|
| A | $(0.075,1)$ | $(1,1)$ |
| B | $(0.4,1)$ | $(1,0.5)$ |

### 4.2 参考后验及近似诊断

通过在笛卡尔网格上计算未归一化后验密度，再利用梯形求积归一化，构造参考后验。HMC 给出另一个采样参照，其密度使用高斯核密度估计。网格归一化方法见附录 A。

对参考后验 $\pi$ 与近似分布 $q_\phi$，作者计算正向 KL、反向 KL 和总变差距离：

$$
D_{\mathrm{KL}}(\pi\|q_\phi)=\int\pi\log\frac{\pi}{q_\phi},
\qquad
D_{\mathrm{KL}}(q_\phi\|\pi)=\int q_\phi\log\frac{q_\phi}{\pi},
$$

$$
D_{\mathrm{TV}}(\pi\|q_\phi)=\frac12\int|\pi-q_\phi|.
\tag{4.3}
$$

所有量均在同一网格区域上归一化计算。若无法在任意点直接求密度，就使用核密度估计。

为了量化情形 B 中近乎塌缩的实验比例，作者利用两个模态位于第一个参数坐标两侧的特点。对第 $i$ 次运行，利用后验样本估计第一个坐标正半轴上的概率质量 $\hat p_{i,+}$，以及负半轴上的质量 $\hat p_{i,-}=1-\hat p_{i,+}$。定义少数模态质量及近乎塌缩比例：

$$
\hat m_i=\min(\hat p_{i,+},\hat p_{i,-}),\qquad
\hat C_\epsilon=\frac1R\sum_{i=1}^R
\mathbf1\{\hat m_i<\epsilon\},\quad \epsilon=0.05.
\tag{4.4}
$$

另计算平方能量距离：

$$
\mathcal E^2(P_X,P_Y)=
2\mathbb E\|X-Y\|_2-\mathbb E\|X-X'\|_2-
\mathbb E\|Y-Y'\|_2,
\tag{4.5}
$$

其中 $X,X'$ 独立采自 $P_X$，$Y,Y'$ 独立采自 $P_Y$，四个随机变量彼此独立。

### 4.3 数值结果

图 1 表明：在情形 A 中，变分近似能够同时表示两个模态，其结果与网格后验及 MCMC 参考一致。图 1 的左图为联合密度等高线，中图和右图分别为 $\theta_0$ 与 $\theta_1$ 的边缘密度；绿色、红色和蓝色分别表示网格参考、MCMC 核密度估计和流近似。

在情形 B 中，同一流架构经常收敛到单个模态。图 2 上排为流近似，下排为高斯混合近似；左列为联合密度等高线，其余两列为边缘密度。使用八个随机种子时，高斯混合近似也收敛到一个模态。

**表 2：未正则化的后验近似。** 散度和距离以均值 ± 标准差给出，近乎塌缩比例使用阈值 $\epsilon=0.05$。

| 指标 | A：流 | B：流 | B：高斯混合 |
|---|---:|---:|---:|
| 正向 KL | 0.308 ± 0.105 | 11.197 ± 4.940 | 13.513 ± 0.957 |
| 反向 KL | 0.474 ± 0.079 | 1.070 ± 0.701 | 15.592 ± 0.277 |
| 总变差距离 | 0.273 ± 0.040 | 0.512 ± 0.010 | 0.868 ± 0.004 |
| 近乎塌缩比例 | — | 0.875 | 1.000 |

对于正则化近似，作者考察 Rényi 阶数 $\{0.1,0.4,0.8,1.2,1.6,2.0\}$ 与目标梯度比 $\{0.1,0.2,0.3\}$，设置 $\beta=0.8$。其中 $\rho=0.8$、$r=0.2$ 在近乎塌缩比例、少数模态概率质量及平方能量距离方面取得较有利的结果。所有参数组合的扩展结果见附录 D。

为保证公平，作者另外进行匹配流架构的对照：未正则化参考与正则化模型使用相同架构，这与最初的情形 B 未正则化流架构不同。设置 $\rho=0.8$、$r=0.2$ 后，近乎塌缩比例从 0.50 降至 0.250；正向 KL 从 4.912 降至 3.126；平方能量距离从 0.259 降至 0.227。与此同时，反向 KL 从 2.401 增至 3.358，总变差距离从 0.554 增至 0.617。

**表 3：情形 B 的匹配参照及 Rényi 正则化近似。** 除近乎塌缩比例外，数值均为均值 ± 标准差；所有指标均以越小越好为原则。

| 指标 | 匹配参考 | Rényi 正则化 |
|---|---:|---:|
| 正向 KL | 4.912 ± 4.867 | 3.126 ± 2.723 |
| 反向 KL | 2.401 ± 1.850 | 3.358 ± 1.970 |
| 总变差距离 | 0.554 ± 0.055 | 0.617 ± 0.075 |
| 平方能量距离 | 0.259 ± 0.174 | 0.227 ± 0.145 |
| 近乎塌缩比例（$\epsilon=5\%$） | 0.50 | 0.250 |

图 3 比较参考配置和两次 Rényi 正则化运行得到的后验。各行依次为参考配置、Rényi A 与 Rényi B；后两者使用不同随机种子。三列为联合后验以及两个边缘后验。Rényi A 能表示两个模态，但 Rényi B 仍几乎塌缩，说明正则化能够降低而不能杜绝模态塌缩。训练配置与流架构见附录 B。

## 图 1—4 图注补译与图表核对

上文的数值结果叙述已按原文顺序给出图 1—3 的内容，下面按原稿图注补录图 1—4 的完整图注（原文图注较短，逐句照译），并说明图面结构与坐标轴范围。

**图 1 图注：** 情形 A：具有连通模态的后验。绿色为网格参考；红色为 MCMC 样本的高斯核密度估计；蓝色为流近似。左图为联合密度等高线，中图与右图分别为 $\theta_0$ 与 $\theta_1$ 的边缘密度。图面横轴约为 $\theta_0\in[-0.4,0.4]$、纵轴约为 $\theta_1\in[0.95,1.15]$。

**图 2 图注：** 情形 B：模态明显分离的后验。上排为流近似，下排为高斯混合近似。绿色为网格参考；红色为 MCMC 样本的高斯核密度估计；蓝色为变分近似。左列为联合密度等高线，中列与右列为边缘密度。联合分布图的横轴约为 $\theta_0\in[-0.5,0.5]$、纵轴约为 $\theta_1\in[1,1.1]$。

**图 3 图注：** 情形 B：参考训练配置与两次 Rényi 正则化运行所得后验分布的对比。三行分别对应参考配置、Rényi A 与 Rényi B，后两者使用不同随机种子；三列分别为联合后验分布与两个边缘后验分布。

**图 4 图注：** 分离后验中评价指标随 Rényi 阶数 $\rho$ 与梯度比 $r$ 的变化。单元格标注报告相对参考配置的变化；绿色表示改善，红色表示恶化。三个面板依次为近乎塌缩比例、少数模态质量与平方能量距离；行对应 $\rho\in\{0.1,0.4,0.8,1.2,1.6,2.0\}$，列对应 $r\in\{0.1,0.2,0.3\}$，逐格数值已转录为附录 D 的三张表格。

**表图与书目核对结论：** 原文全文（10 页）只含表 1—4 与图 1—4，**不存在表 5 或图 5、图 6**；抽取文本第 4—9 页可逐页核对，页面所录表 1（孪生实验配置）、表 2（未正则化近似）、表 3（匹配参照与 Rényi 正则化）、表 4（超参数）与原文逐格一致。原文参考文献共 **20 条**，页面 [1]—[20] 的条数与编号一致，英文条目按原稿保留。

## 5. 讨论与结论

负 ELBO 由期望的数据失配项、先验偏离项及负熵项组成。在对称基准中，任意一个模态均能解释观测，而且先验对二者的偏好相同。因此，集中在某一模态附近的分布，仍可能具有较小的 Tikhonov 期望项。单纯最大化熵并不会强制得到多峰分布，因为在固定协方差下，高斯单峰分布使微分熵最大化。

这与实验观察一致：基于流的 VI 能够近似连通的双峰后验，但在情形 B 中经常漏掉两个明显分离的模态之一。流模型和高斯混合模型的结果符合反向 KL 散度的寻模态倾向，但也受到架构、初始化与优化配置的影响。加入以先验为参照的 Rényi 正则化，在匹配流对照中减少了近乎塌缩，却也改变了变分目标，并可能将概率质量扩散至数据并不支持的区域。在该比较中，正向 KL 与能量距离下降，而反向 KL 与总变差距离上升。

总体而言，Rényi 正则化能够改善模态覆盖，但必须综合评估改变贝叶斯目标引入的偏差以及优化过程的不稳定性。

## 附录 A：参考后验

令 $\tilde\pi_{jk}$ 为在笛卡尔网格点上计算的未归一化后验：

$$
\tilde\pi_{jk}
=p_\Theta(\theta_0^j,\theta_1^k)
\prod_{i=1}^n
p_{Y_i\mid\Theta,U_i}(y_i\mid(\theta_0^j,\theta_1^k),u_i).
\tag{A.1}
$$

令 $w_{jk}$ 为梯形求积权重。参考后验与近似密度在同一网格上归一化：

$$
\pi_{jk}=\frac{\tilde\pi_{jk}}{\sum_{j,k}w_{jk}\tilde\pi_{jk}},
\qquad
q_{jk}=\frac{q_\phi(\theta_0^j,\theta_1^k)}
{\sum_{j,k}w_{jk}q_\phi(\theta_0^j,\theta_1^k)}.
\tag{A.2}
$$

式（4.3）中的积分均以相应加权求和近似。对于无法在任意点计算密度的情况，使用高斯核密度估计。

## 附录 B：实验设置

**表 4：归一化流及高斯混合近似的超参数。**

| 配置 | 组成 | 取值 |
|---|---|---|
| 通用流 | 随机种子数 | 8 |
| 通用流 | 学习率 | $1\times10^{-3}$ |
| 通用流 | 训练步数 | 5000 |
| 通用流 | 粒子数 | 10 |
| 通用流 | 隐藏层宽度 | (8, 8) |
| 通用流 | 样条区间数 | 8 |
| 通用流 | 样条边界 | 5.0 |
| 通用流 | 每个变换块的重复次数 | 3 |
| 情形 A（连通模态） | 架构 | 样条耦合 → 样条自回归 → 神经自回归 |
| 情形 A | 神经自回归宽度 | 8 |
| 情形 B（分离模态） | 未正则化架构 | 同情形 A |
| 情形 B 匹配流 | 参考架构 | 仿射耦合 → 样条耦合 → 仿射耦合 → 样条自回归 → 仿射耦合 |
| 情形 B 匹配流 | 正则化分布族 | 与参考相同 |
| 情形 B 匹配流 | Rényi 阶数 $\rho$ | $\{0.1,0.4,0.8,1.2,1.6,2.0\}$ |
| 情形 B 匹配流 | 梯度比 $r$ | $\{0.1,0.2,0.3\}$ |
| 情形 B 匹配流 | EMA 系数 $\beta$ | 0.8 |
| 高斯混合 | 初始均值 | $((-2,-2),(2,4))$ |
| 高斯混合 | 初始尺度 | 0.5 |
| 高斯混合 | 学习率 | $1\times10^{-2}$ |

通用流配置适用于相应流实验；在情形 B 的匹配流比较中，未正则化和正则化模型采用相同架构。

## 附录 C：Rényi 散度的蒙特卡洛估计

对来自先验的独立样本 $\xi_i\sim p_\Theta$，定义 $s_i=(\rho-1)[\log p_\Theta(\xi_i)-\log q_\phi(\xi_i)]$。利用先验下的期望，可得散度及其 log-sum-exp 估计式：

$$
D_{\mathrm{Renyi}}^\rho(p_\Theta\|q_\phi)
=\frac1{\rho-1}\log\mathbb E_{p_\Theta}
\left[\left(\frac{p_\Theta}{q_\phi}\right)^{\rho-1}\right],
$$

$$
\widehat D_{\mathrm{Renyi}}^\rho
=\frac{\operatorname{logsumexp}_{i=1}^N(s_i)-\log N}{\rho-1}.
\tag{C.1}
$$

由于存在对数运算，估计器一般有偏；但当所涉及的期望有限时，该估计是一致的。由于先验样本不依赖 $\phi$，求导得到

$$
\nabla_\phi\widehat D_{\mathrm{Renyi}}^\rho
=-\sum_{i=1}^N\frac{\exp(s_i)}{\sum_j\exp(s_j)}
\nabla_\phi\log q_\phi(\xi_i).
\tag{C.2}
$$

## 附录 D：正则化参数研究

图 4 给出在分离后验中，针对 Rényi 阶数 $\rho$ 和梯度比 $r$ 改变三项评价指标的结果。单元格报告相对匹配参考配置的变化；图中绿色表示改善，红色表示恶化。

**图 4 数值（按行 $\rho=0.1,0.4,0.8,1.2,1.6,2.0$，按列 $r=0.1,0.2,0.3$）：**

近乎塌缩比例的变化：

| $\rho\backslash r$ | 0.1 | 0.2 | 0.3 |
|---|---:|---:|---:|
| 0.1 | +0.125 | +0.125 | +0.375 |
| 0.4 | 0.000 | 0.000 | 0.000 |
| 0.8 | 0.000 | −0.250 | −0.250 |
| 1.2 | 0.000 | +0.125 | +0.125 |
| 1.6 | 0.000 | +0.125 | +0.125 |
| 2.0 | 0.000 | +0.125 | 0.000 |

少数模态质量的变化：

| $\rho\backslash r$ | 0.1 | 0.2 | 0.3 |
|---|---:|---:|---:|
| 0.1 | −0.062 | −0.061 | −0.137 |
| 0.4 | −0.062 | −0.022 | −0.037 |
| 0.8 | −0.051 | +0.023 | +0.013 |
| 1.2 | −0.061 | −0.076 | −0.074 |
| 1.6 | −0.060 | −0.076 | −0.065 |
| 2.0 | −0.053 | −0.064 | −0.065 |

平方能量距离的变化：

| $\rho\backslash r$ | 0.1 | 0.2 | 0.3 |
|---|---:|---:|---:|
| 0.1 | +0.070 | +0.036 | +0.130 |
| 0.4 | +0.065 | +0.029 | +0.085 |
| 0.8 | +0.042 | −0.032 | −0.032 |
| 1.2 | +0.070 | +0.083 | +0.119 |
| 1.6 | +0.066 | +0.082 | +0.101 |
| 2.0 | +0.056 | +0.077 | +0.094 |

## 致谢与参考文献

本项目得到法国高等教育与研究部通过 CIFRE 工业研究培训计划的支持，由 ANRT 管理，协议编号 2022/1801，并与 Bull 合作开展。项目获得 GENCI 在 IDRIS 的 Jean Zay 超算中心 CSL、A100、H100 分区的 HPC/AI 计算和存储资源，资助编号 AD010117241。

**参考文献（原文 [1]—[20]，保留作者、卷页、年份与 DOI，并补充中文题名）：**

[1] D. M. Blei, A. Kucukelbir, and J. D. McAuliffe, “Variational inference: A review for statisticians”（《变分推断：面向统计学家的综述》）, *Journal of the American Statistical Association*, **112** (2017), pp. 859–877.

[2] S. Brooks, A. Gelman, G. Jones, and X.-L. Meng, *Handbook of Markov Chain Monte Carlo*（《马尔可夫链蒙特卡洛手册》）, CRC Press, 2011.

[3] Z. Chen, V. Badrinarayanan, C.-Y. Lee, and A. Rabinovich, “GradNorm: Gradient normalization for adaptive loss balancing in deep multitask networks”（《GradNorm：深度多任务网络中用于自适应损失均衡的梯度归一化》）, *International Conference on Machine Learning*, PMLR, 2018, pp. 794–803.

[4] T. M. Cover and J. A. Thomas, “Differential Entropy”（《微分熵》）, John Wiley & Sons, Ltd, 2nd ed., 2005, Chapter 8, pp. 243–259, DOI: [10.1002/047174882X.ch8](https://doi.org/10.1002/047174882X.ch8).

[5] K. Daudel, J. Benton, Y. Shi, and A. Doucet, “Alpha-divergence variational inference meets importance weighted auto-encoders: Methodology and asymptotics”（《α 散度变分推断与重要性加权自编码器的结合：方法与渐近性质》）, arXiv:2210.06226, 2023.

[6] A. B. Dieng, D. Tran, R. Ranganath, J. Paisley, and D. Blei, “Variational inference via χ upper bound minimization”（《通过最小化 χ 上界进行变分推断》）, *Advances in Neural Information Processing Systems*, **30** (2017).

[7] L. Dinh, J. Sohl-Dickstein, and S. Bengio, “Density estimation using Real NVP”（《使用 Real NVP 进行密度估计》）, arXiv:1605.08803, 2016.

[8] F. Futami, I. Sato, and M. Sugiyama, “Variational inference based on robust divergences”（《基于稳健散度的变分推断》）, arXiv:1710.06595, 2018.

[9] S. Geman and D. Geman, “Stochastic relaxation, Gibbs distributions, and the Bayesian restoration of images”（《随机松弛、Gibbs 分布与图像的贝叶斯恢复》）, *IEEE Transactions on Pattern Analysis and Machine Intelligence*, **PAMI-6** (1984), pp. 721–741, DOI: [10.1109/TPAMI.1984.4767596](https://doi.org/10.1109/TPAMI.1984.4767596).

[10] W. K. Hastings, “Monte Carlo sampling methods using Markov chains and their applications”（《使用马尔可夫链的蒙特卡洛采样方法及其应用》）, *Biometrika*, **57** (1970), pp. 97–109, DOI: [10.1093/biomet/57.1.97](https://doi.org/10.1093/biomet/57.1.97).

[11] J. Hernandez-Lobato, Y. Li, M. Rowland, T. Bui, D. Hernandez-Lobato, and R. Turner, “Black-box alpha divergence minimization”（《黑箱 α 散度最小化》）, *Proceedings of the 33rd International Conference on Machine Learning*, PMLR, 2016, pp. 1511–1520.

[12] M. D. Hoffman, D. M. Blei, C. Wang, and J. Paisley, “Stochastic variational inference”（《随机变分推断》）, *Journal of Machine Learning Research*, 2013.

[13] M. I. Jordan, Z. Ghahramani, T. S. Jaakkola, and L. K. Saul, “An introduction to variational methods for graphical models”（《图模型变分方法导论》）, *Machine Learning*, **37** (1999), pp. 183–233.

[14] Y. Li and R. E. Turner, “Rényi divergence variational inference”（《Rényi 散度变分推断》）, arXiv:1602.02311, 2016.

[15] R. M. Neal, “MCMC using Hamiltonian dynamics”（《基于哈密顿动力学的 MCMC》）, in *Handbook of Markov Chain Monte Carlo*, S. Brooks, A. Gelman, G. Jones, and X.-L. Meng, eds., Chapman and Hall/CRC, 2011, Chapter 5, pp. 113–162.

[16] D. Rezende and S. Mohamed, “Variational inference with normalizing flows”（《基于归一化流的变分推断》）, *International Conference on Machine Learning*, PMLR, 2015, pp. 1530–1538.

[17] G. J. Székely and M. L. Rizzo, “Energy statistics: A class of statistics based on distances”（《能量统计量：一类基于距离的统计量》）, *Journal of Statistical Planning and Inference*, **143** (2013), pp. 1249–1272.

[18] A. N. Tikhonov and V. B. Glasko, “Use of the regularization method in non-linear problems”（《正则化方法在非线性问题中的应用》）, *USSR Computational Mathematics and Mathematical Physics*, **5** (1965), pp. 93–107.

[19] D. Wang, H. Liu, and Q. Liu, “Variational inference with tail-adaptive f-divergence”（《基于尾部自适应 f 散度的变分推断》）, arXiv:1810.11943, 2019.

[20] Z. Wang, O. So, J. Gibson, B. Vlahov, M. S. Gandhi, G.-H. Liu, and E. A. Theodorou, “Variational inference MPC using Tsallis divergence”（《使用 Tsallis 散度的变分推断模型预测控制》）, arXiv:2104.00241, 2021.

**校对状态：** 正文与附录的主要论述、编号公式及数字表格已录入。参考文献已依据原文第 9—10 页补齐作者、题名、来源及原始出版信息，并附中文题名；数学公式、图中文字以及原文自然段的双向逐条签核仍待最终验收。因此本译稿不能作为已通过逐段逐式校对的全文。

**本轮校对状态（2026-10-30）：** 本页覆盖原文 10 页的摘要、1—5 节、附录 A—D、致谢与参考文献；公式编号 (2.1)—(2.5)、(3.1)—(3.3)、(4.1)—(4.5)、(A.1)—(A.2)、(C.1)—(C.2) 齐全，表 1—4 与附录 D 的 6×3 热图数值逐格转录。本轮补入图 1—4 的完整图注与图表/书目核对结论，并核实原文实际只有 4 张表与 4 幅图（无表 5、图 5—6）。仍未完成：正文引用编号（如 [3]、[14]、[17]）未逐一嵌入译文，数学符号的字符级终校未做，因此本页不视为已通过逐段逐式验收的全文。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
