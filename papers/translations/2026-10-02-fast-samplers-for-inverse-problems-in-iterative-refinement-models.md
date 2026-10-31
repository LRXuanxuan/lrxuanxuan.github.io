---
layout: page
title: "迭代细化模型中逆问题的快速采样器｜中文译稿（许可待核）译文"
permalink: /papers/translations/2026-10-02-fast-samplers-for-inverse-problems-in-iterative-refinement-models/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/32ccc6fa84c6338f/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 迭代细化模型中逆问题的快速采样器

**原题：** Fast Samplers for Inverse Problems in Iterative Refinement Models  
**作者：** Kushagra Pandey（*）、Ruihan Yang（*）、Stephan Mandt  
**单位：** 美国加州大学尔湾分校（University of California Irvine）计算机科学系。邮箱：pandeyk1@uci.edu、ruihan.yang@uci.edu、mandt@uci.edu。（* 两人贡献相同。）  
**版本：** NeurIPS 2024 会议论文集版本（arXiv/OpenReview 无 arXiv 号），本地 PDF 43 页（含图 1—12、表 1—8、附录 A—E）。**再传播许可待核验：本页仅作学习用途，不计入可公开全文统计。**  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节、算法 1—2、附录 A—E（含主要公式与结论）、图 1—12 图注、表 1—8（逐格）、参考文献 [1]—[63] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** ①骨架记录"会议论文集版本、43 页"，与本地 PDF 一致（NeurIPS 2024，第 38 届）。②本地 PDF 无 arXiv 编号（NeurIPS proceedings 版本），故版本号按会议名称记录；③**再传播许可待核验**，本页仅用于学习与内部研究，不进入"可公开全文"统计，页内说明已在页首与状态段保留。

## 摘要

近期，为无条件扩散模型与流匹配模型构造快速采样器已受到广泛关注；然而，求解**逆问题**（如超分辨、修复、去模糊）的现有方法仍需数百至数千次迭代步骤才能获得高质量结果。我们提出一个**即插即用**框架，用于为逆问题构造高效采样器，且只需预训练的扩散或流匹配模型。我们提出**条件共轭积分器（Conditional Conjugate Integrators）**，它利用逆问题的特定形式，把相应的条件扩散/流动力学**投影**到更易于采样的空间中。我们的方法与流行的、使用扩散/流模型求解逆问题的后验近似方法互补。我们在多个数据集上、使用扩散与流匹配模型，评估所提方法在多种线性图像恢复任务上的性能。值得注意的是，在 ImageNet 数据集上具有挑战性的 4× 超分辨等逆问题中，我们的方法仅用 **5 个条件采样步**即可生成高质量样本，并优于需要 20—1000 步的竞争基线。我们的代码将公开于 https://github.com/mandt-lab/c-pigdm 。

## 1 引言

迭代细化模型，如扩散生成模型与流匹配方法 [1]–[5]，近月来日益流行，且已有大量工作致力于加速这些模型中的无条件采样 [6]–[13]。然而，尽管多数高效采样器是在无条件设定下设计的，当前求解逆问题（如去模糊、修复或超分辨）的方法仍需数百到数千次神经网络评估才能达到最高感知质量。此外，除评分函数评估外，一类使用预训练无条件迭代细化模型求解逆问题的现有方法常常涉及昂贵的 Jacobian-向量积 [14], [15]，使单次采样步骤相当昂贵，因而对多数实际应用而言慢得无法接受。

本文提出一个有原则的框架，用于在迭代细化模型中为引导式采样设计高效采样器，可将 ΠGDM 等现有采样器加速一个数量级。我们针对**退化算子已知、且可能被附加噪声污染**的逆问题给出框架。关键在于，我们的变换**无需任何重训练**，仅依赖待模拟方程的代数操作。

直观上，我们扩展了**共轭积分器**（Conjugate Integrators）[6] 的概念：把逆问题中的条件生成过程投影到另一个空间，该空间可能具有更好的条件数、从而支持更快采样（见图 1）。为此，我们把生成过程中的线性与非线性成分分离，并通过解析求解线性系数来参数化变换；采样过程结束时再映射回原采样空间，从而得到适用于扩散模型、流与插值模型等多种迭代细化模型的**条件共轭积分器**。

更具体地，我们的主要贡献如下。

- **条件共轭积分器**：我们把近期提出的共轭积分器框架 [6] 重新用于线性逆问题中迭代细化模型（扩散与流）的快速引导式采样，并称之为条件共轭积分器。随后我们设计了该框架的一个特定参数化，把线性逆问题的结构编码进采样器设计本身。
- **理论分析**：我们的参数化具有若干理论性质，有助于识别采样器设计的关键参数。更具体地，我们证明该参数化（按设计）能在采样早期恢复高频细节，从而在逆问题语境下实现快速引导式采样并保持良好样本质量。
- **实验结果**：实验上，我们证明所提采样器在超分辨、修复与高斯去模糊等挑战性基准上于采样效率方面显著优于基线。例如在 ImageNet 上具有挑战性的 4× 超分辨任务中，所提采样器在 5 步时的样本质量优于需要 20—1000 步的竞争基线。

此外，我们通过定性演示把该框架扩展到含噪与非线性逆问题。

**图 1**：逆问题快速采样中的条件共轭积分器示意（给定初始潜变量 $x_{t_s}$，用受退化算子 $H$ 与引导尺度 $w$ 条件的投影算子 $\Phi$ 把扩散/流动力学投影到更易采样的空间，采样后再经逆投影回到原空间）。

## 2 基于扩散/流的逆问题快速采样器

### 2.1 背景与问题陈述

扩散模型定义一个连续时间前向过程（通常为仿射漂移），把数据 $x_0\in\mathbb R^d$ 转为噪声；一个可学习反向过程被训练为从噪声生成数据。本文只考虑以 ODE 指定的确定性反向过程 [3]：

$$
\mathrm dx_t=\left[F_tx_t-\frac{1}{2}G_tG_t^\top\nabla_{x_t}\log p_t(x_t)\right]\mathrm dt.\tag{1}
$$

评分通常不可处理，用参数化估计器 $s_\theta(x_t,t)$ 近似，并以去噪评分匹配训练 [16]–[3]。类似地，单侧随机插值 [5] 定义插值 $\mathbf x_t=\alpha_tx_1+\gamma_tz$（$x_1\sim p_{\text{data}}$、$z\sim\mathcal N(0,I)$），从而定义生成先验（通常为各向同性高斯）与数据分布之间的传输映射；单侧插值诱导向量场 $b(x_t,t)=\mathbb E[\dot\alpha_tx_1+\dot\gamma_tz\mid x_t]$，该向量场通常由神经网络 $b_\theta(x_t,t)$ 学习，确定性插值过程为 $\mathrm dx_t=b_\theta(x_t,t)\mathrm dt$。以足够的采样预算数值求解这些确定性生成过程，即可从噪声生成合理样本。

**问题陈述**：给定作用于未观测数据点 $x_0$ 的含噪线性退化过程（退化算子 $H$）：

$$
y=Hx_0+\sigma_yz,\qquad z\sim\mathcal N(0,I),\qquad x_0\sim p_{\text{data}},\tag{2}
$$

目标是恢复原始信号 $x_0$。给定无条件预训练的扩散或流匹配模型，求解逆问题的一种方法是推断给定退化观测下数据的后验分布，即 $p(x_0\mid y)\propto p(y\mid x_0)p(x_0)$，通过模拟条件反向过程动力学：

$$
\text{扩散：}\ \mathrm dx_t=\left[F_tx_t-\frac{1}{2}G_tG_t^\top\nabla_{x_t}\log p(x_t\mid y)\right]\mathrm dt,\qquad\text{流：}\ \mathrm dx_t=b(x_t,y,t)\mathrm dt,\tag{3}
$$

其中 $\nabla_{x_t}\log p(x_t\mid y)$ 与 $b(x_t,y,t)$ 分别为条件评分与速度估计。一种做法是用条件迭代细化模型直接建模条件评分或速度 [18], [19]；但此类方法与问题相关，需要昂贵的训练流程以应对跨逆问题缺乏泛化的问题，且依赖成对 $(x_t,y)$ 测量，采集成本高。另一类**问题无关**方法利用预训练无条件迭代细化模型估计条件评分/速度场，无需额外训练即可泛化到不同逆问题；本文限定讨论后者。

**由预训练模型估计条件评分/速度**：对扩散模型，由贝叶斯公式可直接近似条件评分，即 $\nabla_{x_t}\log p(x_t\mid y)\approx s_\theta(x_t,t)+w_t\nabla_{x_t}\log p(y\mid x_t)$，其中 $w_t$ 为分布 $p(y\mid x_t)$ 的引导权重（温度）。对插值（流），Pokle 等 [20] 提出条件流动力学：

$$
b(x_t,y,t)\approx b_\theta(x_t,t)+\frac{w_t}{\gamma_t}\alpha_t\left[\gamma_t\dot\alpha_t-\dot\gamma_t\alpha_t\right]\nabla_{x_t}\log p(y\mid x_t),\tag{4}
$$

式（4）基于插值视角的正式证明见附录 A.1。

**噪声条件评分 $\nabla_{x_t}\log p(y\mid x_t)$ 的估计**：噪声条件分布可写为 $p(y\mid x_t)=\int p(y\mid x_0)p(x_0\mid x_t)\mathrm dx_0$。对问题无关模型，常用单峰高斯分布近似后验 $p(x_0\mid x_t)$ [14], [15]。本文限定讨论 ΠGDM [14] 及其流变体（本文称为 ΠGFM）[20] 中的后验近似 $p(x_0\mid x_t)\approx\mathcal N(\hat x_0,r_t^2I_d)$，由此得到条件评分的如下估计：

$$
\nabla_{x_t}\log p(y\mid x_t)=\frac{\partial\hat x_0}{\partial x_t}^\top H^\top\left(r_t^2HH^\top+\sigma_y^2I_d\right)^{-1}\left(y-H\hat x_0\right),\tag{5}
$$

其中 $\hat x_0$ 为一阶 Tweedie 矩估计 [21]。选择 ΠGDM 近似的动机在于其相比 DPS 或 MCG 等方法更具表达力的后验近似，使其成为低预算采样的优良起点。

### 2.2 条件共轭积分器

**共轭积分器**：共轭积分器 [6] 的核心思想是把式（1）中的扩散动力学投影到另一个空间，使采样可能更高效；投影后的扩散动力学可用任意数值 ODE 求解器求解，完成后可投影回原空间以从数据分布生成样本。为此 Pandey 等 [6] 引入可逆的时变仿射变换 $\bar x_t=A_tx_t$。有趣的是，共轭采样器与无条件扩散模型快速采样的先前工作存在理论联系 [13], [11], [12]；细节见 [6]。

#### 2.2.1 逆问题的共轭积分器

接下来我们为线性逆问题设计共轭积分器。为简化，先讨论无噪逆问题（$\sigma_y=0$），含噪逆问题留待 2.4 节；受篇幅限制，我们给出扩散模型的分析，流的讨论见附录 B。最后，不失一般性，假设使用标准评分网络参数化 $s_\theta(x_t,t)=C_{\text{out}}(t)\epsilon_\theta(x_t,t)$，其中 $C_{\text{out}}(t)$ 为 Karras 等 [9] 的评分预条件记号。

定义条件共轭积分器的一种直接做法是把评分估计 $\nabla_{x_t}\log p(y\mid x_t)$ 视为黑箱，即忽略逆问题的结构。此情形下，我们形式化给出如下共轭积分器表述。

**命题 1（扩展 ΠGDM）**：对式（3）定义的条件扩散动力学，引入微分同胚 $\bar x_t=A_tx_t$，其中

$$
A_t=\exp\left(\int_0^tB_s-F_s\,\mathrm ds\right),\qquad \Phi_t=-\int_0^t\frac{1}{2}A_sG_sG_s^\top C_{\text{out}}(s)\,\mathrm ds,\tag{6}
$$

则诱导出如下投影扩散动力学：

$$
\mathrm d\hat x_t=A_tB_tA_t^{-1}\hat x_t\,\mathrm dt+\mathrm d\Phi_t\epsilon_\theta(x_t,t)-\frac{w_tr_t^{-2}}{2}A_tG_tG_t^\top\frac{\partial\hat x_0}{\partial x_t}^\top\left(H^\dagger y-P\hat x_0\right)\mathrm dt,\tag{7}
$$

其中 $H^\dagger=H^\top(HH^\top)^{-1}$ 与 $P=H^\top(HH^\top)^{-1}H$ 分别为退化算子 $H$ 的伪逆与正交投影算子。（证明见附录 A.2。）

与 Pandey 等 [6] 类似，矩阵 $B_t$ 是一种设计选择。我们把式（7）的表述称为扩展 ΠGDM，因为当 $B_t=0$ 时，式（7）的 ODE 等价于 Song 等 [14] 提出的 ΠGDM 表述——这是因为当 $B_t=0$ 时共轭积分器等价于 DDIM [13]（证明见 [6]）。因此式（7）的投影扩散动力学已给出比 ΠGDM 更通用的逆问题采样器设计框架。本文只探索 $B_t=0$ 时的式（7）参数化，故简称为 ΠGDM（流的对应形式为 ΠGFM，见附录 B）。

式（7）表述的一个特点是条件评分的黑箱性。然而条件评分中固有的线性性可用于设计**条件数更好**的共轭积分器，我们以下述结果形式化说明。

**命题 2（共轭 ΠGDM）**：给定无噪线性逆问题（$\sigma_y=0$）、设计矩阵 $B:[0,1]\to\mathbb R^{d\times d}$，且条件评分用式（5）近似，引入变换 $\bar x_t=A_tx_t$，其中

$$
A_t=\exp\left[\int_0^tB_s-\left(F_s+\frac{w_sr_s^{-2}}{2}\mu_s^2G_sG_s^\top P\right)\mathrm ds\right],\tag{8}
$$

则诱导出如下投影扩散动力学：

$$
\mathrm d\bar x_t=A_tB_tA_t^{-1}\bar x_t\,\mathrm dt+\mathrm d\Phi_yy+\mathrm d\Phi_s\epsilon_\theta(x_t,t)+\mathrm d\Phi_j\left[\partial_{x_t}\epsilon_\theta(x_t,t)\left(H^\dagger y-P\hat x_0\right)\right],\tag{9}
$$

其中 $\exp(\cdot)$ 表示矩阵指数，$H^\dagger$ 与 $P$ 为前述伪逆与投影算子。（证明见附录 A.3。）

此情形下系数 $\Phi_y$、$\Phi_j$ 与 $\Phi_s$ 依赖时间 $t$ 与退化算子 $H$（完整定义见附录 A.3）。直观上，通过在式（8）的变换 $A_t$ 中纳入退化算子 $H$ 与引导尺度的信息，我们把逆问题的特定结构纳入采样器设计，这带来若干优势（见 2.3 节）。此外矩阵 $B_t$ 是本参数化的设计选择（具体选择见 2.2.2 节）。我们称该参数化为 **C-ΠGDM**（流的对应形式为 C-ΠGFM，见附录 B）；本文后续限定讨论该参数化，并在下文讨论其实践与理论方面。

#### 2.2.2 实践设计选择

**扩散与流的选择**：尽管所提积分器适用于一般扩散过程 [22], [23] 与流 [24]，我们后续限定讨论 VP-SDE [3] 扩散（$F_t=-\frac{1}{2}\beta_tI_d$、$G_t=\sqrt{\beta_t}I_d$）与 OT-流 [25], [4]（$\alpha_t=t$、$\gamma_t=1-t$）。对评分网络参数化，取 $C_{\text{out}}(t)=-1/\sigma_t$，对应扩散模型中标准的 $\epsilon$-预测参数化 [2], [3]。

**$B_t$ 的选择**：与 Pandey 等 [6] 类似，取 $B_t=\lambda I_d$，其中 $\lambda$ 为推理时为最优样本质量调优的时不变标量超参数。

**$w_t$ 的选择**：与先前工作 [14], [20] 类似，采用自适应引导权重调度。对扩散模型，取 $w_t=w\mu_t^2r_t^2$，其中 $r_t^2=\frac{\sigma_t^2}{\mu_t^2+\sigma_t^2}$；类似地对流取 $w_t=w\alpha_t^2r_t^2$，其中 $r_t^2=\frac{\gamma_t^2}{\alpha_t^2+\gamma_t^2}$。额外的乘性因子 $\mu_t^2$（VP-SDE）或 $\alpha_t^2$（流）可在采样前稳定式（9）中系数的数值计算。我们把静态引导权重 $w$ 在推理时调优至最优样本质量。

**起始时间的选择**：给定退化输出 $y$，通常分别在 $\tau<T$ 或 $\tau>0$ 处开始扩散或流采样 [26], [14], [20]。因此把扩散采样初始化为 $x_\tau=\mu_\tau H^\dagger y+\sigma_\tau z$；类似地，对流在 $x_\tau=\alpha_\tau H^\dagger y+\gamma_\tau z$ 处初始化。

**ODE 求解器的选择**：除另有说明，C-ΠG(D/F)M 采样器使用 Euler 离散化。我们在算法 1 中给出通用的 C-ΠGDM 采样流程，其他实现细节见附录 D。

**算法 1**　共轭 ΠGDM 采样

1: **输入**：受损观测 $y$、退化算子 $H$、去噪器 $\epsilon_\theta(\cdot,\cdot)$、$B_t$ 的选择、NFE 预算 $N$、时间步离散 $\{t_i\}_{i=0}^{N}$、扩散核 $p(x_t\mid x_0)=\mathcal N(\mu_tx_0,\sigma_t^2I_d)$、起始时间 $\tau$。
2: **输出**：干净样本 $\hat x_0$。
3: 预计算 $\{A_{t_i}\}_{i=0}^{N}$（式（8））。
4: 预计算 $\{\Phi_y^i,\Phi_s^i,\Phi_j^i\}_{i=0}^{N}$（见附录 A.3）。
5: 从生成先验采样 $z\sim p(x_T)$。
6: 用伪逆初始化 $x=\mu_\tau H^\dagger y+\sigma_\tau z$。
7: 初始投影 $\bar x=A_\tau x$。
8: **for** $n=0$ 到 $N-1$ **do**
9: 　时间步差分 $h=t_{n+1}-t_n$；
10: 　$x=A_{t_n}^{-1}\bar x$；
11: 　Tweedie 估计 $\hat x_0=\frac{1}{\mu_{t_n}}\left[x-\sigma_{t_n}\epsilon_\theta(x,t_n)\right]$；
12: 　线性漂移 $v_l=hA_{t_n}B_{t_n}A_{t_n}^{-1}\bar x+\left(\Phi_y^{n+1}-\Phi_y^n\right)y$；
13: 　非线性漂移 $v_{nl}=\left(\Phi_s^{n+1}-\Phi_s^n\right)\epsilon_\theta(x,t_n)+\left(\Phi_j^{n+1}-\Phi_j^n\right)\left[\partial_x\epsilon_\theta(x,t_n)\left(H^\dagger y-P\hat x_0\right)\right]$；
14: 　Euler 更新 $\bar x=\bar x+v_l+v_{nl}$；
15: **end for**
### 2.3 理论方面

在 2.2.2 节的简化下，式（8）中的变换 $A_t$ 简化为

$$
A_t=\exp\left[\int_0^t\left(\lambda+\frac{1}{2}\beta_s\right)\mathrm ds\right]I_d-\frac{w}{2}\left(\int_0^t\beta_s\mathrm ds\right)P,\tag{10}
$$

其中 $P=H^\top(HH^\top)^{-1}H$ 为正交投影算子。

**计算 $A_t$**：式（10）中的矩阵指数看似不易计算，但具有若干性质使其可处理。更具体地，式（10）的矩阵指数可化简为（证明见附录 A.4）

$$
A_t=\exp\left(\kappa_1(t)\right)\left[I_d+\left(\exp\left(\kappa_2(t)\right)-1\right)P\right],\qquad \kappa_1(t)=\int_0^t\left(\lambda+\frac{1}{2}\beta_s\right)\mathrm ds,\qquad \kappa_2(t)=-\frac{w}{2}\int_0^t\beta_s\mathrm ds,\tag{11}
$$

其中式（11）的 $\exp(\cdot)$ 为标量指数。此外，式（11）中的积分可解析或数值简单计算，使 $A_t$ 更易计算。并且 $A_t^{-1}$ 也可紧凑表示为

$$
A_t^{-1}=\exp\left(-\kappa_1(t)\right)\left[I_d+\left(\exp\left(-\kappa_2(t)\right)-1\right)P\right],\tag{12}
$$

同样可处理。由于 $A_t$ 与 $A_t^{-1}$ 可处理，C-ΠGDM 中的投影扩散动力学可直接数值模拟。

**$A_t$ 的直观解释**：我们进一步分析式（11）中变换矩阵的若干理论性质。首先，

$$
\bar x_t=A_tx_t=\exp\left(\kappa_1(t)\right)\left[x_t-\left(1-\exp\left(\kappa_2(t)\right)\right)Px_t\right].\tag{13}
$$

由于 $P=H^\top(HH^\top)^{-1}H$ 为正交投影，$I_d-P$ 也是正交投影，可把任意向量 $v$ 投影到 $P$ 的零空间。因此可把状态 $x_t$ 分解为两个正交分量 $x_t=Px_t+(I_d-P)x_t$，代入式（13）得

$$
\bar x_t=\exp\left(\kappa_1(t)\right)\left[(I_d-P)x_t+\exp\left(\kappa_2(t)\right)Px_t\right].\tag{14}
$$

直观上，在 $t=T$ 附近（即反向扩散采样起点），对较大的静态引导权重 $w$ 有 $\exp(\kappa_2(t))\to0$；该极限下由式（14）得 $\bar x_t\approx(I_d-P)x_t$。这意味着对较大引导权重 $w$，扩散动力学被投影到投影算子 $P$ 的零空间。对超分辨这类逆问题，直观上这意味着在扩散过程起点附近，投影后的扩散动力学对应于对 $Px_t$ 中缺失的高频细节进行去噪——因为投影操作 $Px_t=H^\dagger Hx_t$ 可解释为含噪退化状态 $x_t$ 的伪逆，因此 $(I_d-P)x_t$ 表示 $Px_t$ 中信号分量所缺失的高频细节。

此外，在 $t=0$ 附近（即反向扩散采样终点附近），假设引导权重 $w$ 不过大，则系数 $\exp(\kappa_1(t))$ 与 $\exp(\kappa_2(t))$ 均趋近 $1$，意味着 $\bar x_t\approx x_t$。这表明在 $t=0$ 附近扩散在原始空间进行，可防止采样末期出现过锐化伪影。因此我们推测较大的 $w$ 也可能在采样末期导致过锐化结果、在生成样本中产生伪影；由此，在式（10）中引入投影 $A_t$ 会在 $w$ 的选择上引入权衡，以控制样本质量。最后，由于参数 $\lambda$ 控制 $\bar x_t$ 的幅度，它呈现类似的权衡。我们将在 3.3 节以实验展示这些权衡。虽然讨论限于扩散模型，类似的理论直觉对流同样成立（证明见附录 B）。

### 2.4 扩展到含噪与非线性逆问题

尽管讨论主要围绕无噪线性逆问题，条件共轭积分器框架也可扩展用于构建含噪线性与非线性逆问题的采样器，详见附录 C。

## 3 实验

接下来我们以实验证明所提采样器 C-ΠGDM/GFM 在线性图像恢复任务上的采样速度—质量权衡优于近期基线；随后给出突出采样器关键参数的消融实验；最后给出使用所提框架求解含噪与非线性逆问题的设计选择。

**模型与数据集**：对扩散模型，使用 OpenAI 在 256×256 分辨率上的无条件预训练 ImageNet [27] 检查点 [28]；在 FFHQ 数据集 [29] 上的评估使用 Choi 等 [30] 的预训练检查点（同为 256×256）。对流模型比较，使用 Liu 等 [25] 公开的三个模型检查点，分别在 AFHQ-Cat [31]、LSUN-Bedroom [32] 与 CelebA-HQ [33] 数据集上训练，像素分辨率均为 256×256。对扩散模型，在评估集的 1k 子集上评估；对流，在整个验证集上评估。

**任务与指标**：我们在无噪设定下对三个挑战性线性逆问题做定性与定量评估。第一，图像超分辨：把双三次下采样的 64×64 图像增强到 256×256。第二，图像修复：在具有固定自由形式中心掩膜的图像上评估。第三，高斯去模糊：在 61×61 窗口上施加 $\sigma=3.0$ 的高斯核。每项任务用三种感知指标评估：FID [34]、KID [35] 与 LPIPS [36]。

**方法与基线**：我们以 5、10、20 个采样步（记为函数评估次数 NFE）评估所提 C-ΠGDM 与 C-ΠGFM 采样器的样本质量，并通过广泛搜索优化参数 $w$、$\lambda$ 与 $\tau$，以样本质量为准选出最佳配置。扩散基线包括 DDRM [37]、DPS [15] 与 ΠGDM [14]；按 DPS 的建议，所有任务使用 NFE=1000；对 DDRM 遵循原始实现，在 NFE=20 下取 $\eta_b=1.0$、$\eta=0.85$。我们测试自己实现的 ΠGDM（见 2.2 节），NFE 取 5、10、20，并在所有任务上使用推荐引导调度 $w_t=r_t^2$。对流模型，考虑近期提出的、受 ΠGDM 启发、运行于 OT-ODE 路径的方法 [20]（本文称为 ΠGFM，见附录 B），同样取 NFE=5、10、20。我们通过对 $w$ 与 $\tau$ 的广泛网格搜索优化所有基线，以获得最佳（样本质量）性能。

### 3.1 定量结果

表 1 给出所提方法在逆问题上的结果，其中流模型使用 CelebA-HQ 数据集、扩散模型使用 ImageNet 数据集；跨不同数据集的更全面结果见附录 E。对修复任务，我们的方法在所有采样预算（NFE）下一致超过其他方法。类似地，基于流的采样器 C-ΠGFM 在 NFE 为 5 和 10 时对图像超分辨展现更优感知质量，ΠGFM 仅在更高 NFE 下才达到可比性能。值得注意的是，基于扩散的采样器 C-ΠGDM 在整个 NFE 范围内优于所有基线：在具有挑战性的 ImageNet 数据集上，C-ΠGDM 仅用 5 个采样步即优于需要 20—1000 个 NFE 的竞争基线，显示出采样速度的显著加快且保持样本质量。图像去模糊任务呈现类似模式：ΠGDM/ΠGFM 的性能只在 NFE 增至 20 步时才接近我们的方法。

有趣的是，对超分辨与去模糊任务，我们的方法在 NFE=20 时出现性能提升的平台期。这表明：尽管我们的方法在确定性路径上以 Euler 求解器高效利用了迭代模型，但要在更高 NFE 下进一步提升性能，可能需要引入随机采样技术或更先进的求解器。这一潜在后续步骤有望在复杂图像处理任务中释放本方法的更多收益。

### 3.2 定性结果

图 2 给出所提方法与 ΠG(D/F)M 基线的定性比较。第一列的修复结果显示，ΠGFM 倾向于在修复区域引入灰色伪影；该问题可能源于参数 $\tau$ 的初始化——在我们的参数调优阶段（并得到 Pokle 等 [20] 印证）发现 $\tau\ge0.2$ 时性能最佳。因此，NFE 不足时 ΠGFM 无法在我们的实验中有效消除与修复掩膜相关的伪影。对图像超分辨，我们的方法在恢复细节方面表现优异，在人发、麦穗等高频图像成分上尤为明显。类似地，对去模糊任务，我们的方法在定性上优于基线，尤其在缓解过度平滑伪影方面（图 2 最后一列）。更多示例见附录 E.4。

### 3.3 消融实验

本节进一步探讨在调优阶段识别出、并与 2.3 节理论洞见相关的超参数 $w$、$\lambda$ 与 $\tau$ 的影响。我们注意到 $\tau$ 尤其与任务相关且相对容易调整：例如修复类任务需要较小的 $\tau$ 以避免掩膜伪影，而超分辨或去模糊则受益于较大的 $\tau$ 以确保有效初始化。因此讨论主要聚焦 $w$ 与 $\lambda$ 的影响。图 3 展示在 CelebA-HQ 与 ImageNet 上的图像超分辨任务中改变 $w$ 与 $\lambda$ 对样本质量的影响。

由图 3 可得以下观察。第一，对 C-ΠGDM 与 C-ΠGFM 两种采样器，$\lambda$ 的最优值都可能不同于 $\lambda=0$，这体现了在采样器设计中参数化 $B_t$ 的有用性；相反，ΠGDM 或 ΠGFM 采样器没有这种灵活性，因而在不同采样预算下只能得到次优样本质量。第二，偏离最优 $\lambda$ 会导致样本质量下降：更具体地，偏离我们调优的 $\lambda$ 值会导致过锐化伪影或模糊样本（见图 7、图 11）。这符合直觉，因为 $\lambda$ 控制变换 $\bar x_t=A_tx_t$ 的尺度（见式（14）），从而在投影扩散动力学的条件化中起重要作用。改变静态引导权重 $w$ 呈现类似权衡：$w$ 幅值过大会导致过锐化伪影，而引导权重过小会导致模糊样本（见图 6、图 10）。这些经验观察与 2.3 节的理论分析一致，印证了我们对采样器参数 $w$ 与 $\lambda$ 作用的理论直觉。

**图 2**：C-ΠG(D/F)M 与 ΠG(D/F)M 基线在五个数据集上的定性比较：(a,b,c) 分别为 C-ΠGFM 的修复、去模糊与 4× 超分辨；(d,e) 分别为 C-ΠGDM 的 4× 图像超分辨与去模糊（$\sigma_y=0$、NFE=5）。
**图 3**：$\lambda$ 与 $w$ 对采样质量的影响（红色曲线与标签为 LPIPS 分数，蓝色曲线与标签为 FID 分数）；(a)(b) 流模型的 $\lambda$ 与 $w$；(c)(d) 扩散模型的 $\lambda$ 与 $w$。

## 4 相关工作

**无条件快速采样**：近期研究显著提升了无条件扩散/流模型采样过程的效率 [3], [4], [38]。一类研究致力于通过设计高效扩散模型来改善采样 [9], [22], [23], [39]。由于我们对条件共轭积分器的处理相当通用，所提方法与扩散模型设计中的多数进展可直接兼容。另一类研究聚焦从教师模型蒸馏学生模型，从而实现甚至单步采样 [10], [40], [8]；但此类方法需要昂贵的重训练，因此面向预训练扩散/流模型的快速采样器研究受到广泛关注 [41], [6], [7], [11], [12], [13], [42]。本文属于后一类，即发展可应用于预训练扩散模型的快速**条件**采样器。

**条件迭代细化模型**已成为需要可控生成任务的主流方法：此类模型常涉及训练专门的的条件扩散模型 [19], [43]–[52]，并可能结合无分类器引导 [53] 或分类器引导 [28], [3] 做条件采样。这些方法也推动了求解各类图像退化变换（如修复与超分辨）逆问题的研究 [37], [15], [14], [54], [20]。尽管这些方法展现出有前景的结果，它们通常受制于昂贵的采样过程，凸显出为高效求解逆问题而设计快速采样器的必要性。近期工作 [55] 采用一致性模型 [39] 增强后验近似，但引入额外模型可能偏离我们"仅用单一预训练模型"的主张。DPM-Solver++ [56] 同样处理扩散模型中加速引导采样的问题；但与 [56] 不同，我们把逆问题的结构纳入采样器设计。

## 5 讨论与结论

我们提出一个用于为迭代细化模型中的引导采样加速设计采样器的通用框架。本文探索了该框架的一个特定参数化，把逆问题的结构纳入采样器设计。我们给出设计选择背后的理论直觉，并以实验证明其在求解线性逆问题上的有效性——仅需 5 个采样步，而竞争基线需 20—1000 个 NFE。尽管本方法可作为设计快速引导式采样器的重要一步，仍有若干重要未来方向：第一，可通过在采样阶段直接学习 $A_t$ 使我们的变换参数化更具表达力；第二，本文考虑退化算子已知的逆问题，把框架扩展到求解盲逆问题可能是重要研究方向；第三，把我们的求解器与潜扩散模型中求解逆问题的技术 [57] 相结合以进一步提升采样效率，也将是有趣的方向。

**更广泛影响**：虽然本工作有潜力使合成数据生成更易获得，本文提出的技术应被负责任地使用。此外，尽管在有限采样预算下样本质量良好，恢复有时会在生成样本中产生伪影，这在医学图像分析等领域可能是不可取的。

**致谢与资助披露**：作者感谢 Justus Will 对稿件的宝贵反馈。KP 感谢加州大学尔湾分校 HPI 机器学习与数据科学研究中心的支持；SM 感谢美国国家科学基金会（NSF）CAREER 奖 IIS-2047418 与 IIS-2007719、NSF LEAP 中心、能源部 DE-SC0022331 资助、IARPA WRIVA 计划、UCI Hasso Plattner 研究中心，以及 Qualcomm 与 Disney 的捐赠支持。

{% endraw %}
## 附录

### A 证明

**A.1 条件流动力学的证明**：从插值视角证明式（4）。插值定义 $\mathbf x_t=\alpha_tx_1+\gamma_tz$，其速度场为 $b(x_t,t)=\mathbb E[\dot\alpha_tx_1+\dot\gamma_tz\mid x_t]$。由贝叶斯公式，条件速度可写为 $b(x_t,y,t)=b(x_t,t)+\mathbb E[\dot\alpha_tx_1+\dot\gamma_tz\mid x_t,y]-b(x_t,t)$；对后验 $p(x_0\mid x_t)$ 做高斯近似并把观测似然 $p(y\mid x_t)$ 的梯度展开，即得式（4）中与 $\nabla_{x_t}\log p(y\mid x_t)$ 成正比的修正项，系数为 $\frac{w_t}{\gamma_t}\alpha_t\left[\gamma_t\dot\alpha_t-\dot\gamma_t\alpha_t\right]$，证毕。

**A.2 命题 1 的证明**：对 $\bar x_t=A_tx_t$ 关于时间求导，并代入式（3）的条件扩散动力学，可得 $\mathrm d\bar x_t=\left[\dot A_tx_t+A_t\dot x_t\right]$；把 $\dot x_t$ 中的无条件项与引导项分离：无条件部分经 $A_t$ 变换后被抵消/整理为（7）中的前两项（含 $A_tB_tA_t^{-1}\bar x_t\mathrm dt$ 与 $\mathrm d\Phi_t\epsilon_\theta$），而引导项经伪逆与投影算子 $H^\dagger$、$P$ 化简为（7）的第三项；整理即得式（7）。（证明为代数推导，原文给出逐步化简。）

**A.3 命题 2 的证明**：与 A.2 类似，但当条件评分取式（5）的高斯后验近似时，评分中的 $\frac{\partial\hat x_0}{\partial x_t}^\top H^\top(r_t^2HH^\top)^{-1}(y-H\hat x_0)$ 项可分解为与 $y$ 成正比、与 $\epsilon_\theta$ 成正比以及与 $\partial_{x_t}\epsilon_\theta$ 成正比的三部分；把它们分别吸收进指数积分，即得式（8）中 $A_t$ 的 $-\frac{w_sr_s^{-2}}{2}\mu_s^2G_sG_s^\top P$ 修正项与式（9）中的 $\Phi_y$、$\Phi_s$、$\Phi_j$ 三个系数（完整定义见原附录 A.3）。

**A.4 式（11）的化简**：式（10）的矩阵为 $cI_d+dP$ 形式的线性组合，且 $P$ 为投影算子（$P^2=P$），故其特征值只能为 $0$ 或 $1$。对 $dP$ 部分按 $P$ 的特征子空间分解后取矩阵指数，得 $\exp(cI_d+dP)=\exp(c)\left[I_d+\left(\exp(d)-1\right)P\right]$，即式（11）；其逆由 $\exp(-c)\left[I_d+\left(\exp(-d)-1\right)P\right]$ 给出，即式（12）。

**A.5 含噪逆问题命题的证明**：对含噪逆问题（79），把式（8）的积分中被积函数按 $\sigma_y^2$ 展开：含噪情形下 $r_t^2=\frac{\sigma_t^2}{\mu_t^2+\sigma_t^2}$ 与 $H^\dagger y$ 的噪声项带来 $O(\sigma_y^2)$ 修正，一阶展开后指数内的附加项为 $\kappa_3(t)H^\dagger(H^\dagger)^\top$，即式（80）（81）；对逆变换做一阶扰动分析得式（82）。由于实际中 $\sigma_y$ 通常很小，可安全忽略 $O(\sigma_y^4)$ 项，使该近似保持精度。

**命题（含噪逆问题）**：对含噪逆问题 $y=Hx_0+\sigma_yz$（$z\sim\mathcal N(0,I_d)$），给定无噪情形的变换 $A_t$（式（11）），相应的含噪变换可近似为

$$
A_t^{\sigma_y}=A_t+\kappa_3(t)H^\dagger\left(H^\dagger\right)^\top+O\left(\sigma_y^4\right),\tag{80}
$$
$$
\kappa_3(t)=\frac{w\sigma_y^2}{2}\left(\int_0^t\frac{\beta_s}{r_s^2}\mathrm ds\right)\left[\exp\left(\kappa_1(t)+\kappa_2(t)\right)-1\right],\tag{81}
$$

相应地，含噪变换的逆可近似为

$$
\left(A_t^{\sigma_y}\right)^{-1}\approx A_t^{-1}-\kappa_3(t)A_t^{-1}H^\dagger\left(H^\dagger\right)^\top A_t^{-1}+O\left(\sigma_y^4\right).\tag{82}
$$

### B 条件共轭积分器：流

**B.1 背景**：对单侧插值/流，生成过程为 $\mathrm dx_t=b_\theta(x_t,t)\mathrm dt$，其条件形式由式（4）给出；与扩散情形类似，可定义时变仿射变换 $\bar x_t=A_tx_t$ 把流动力学投影到更适合采样的空间。

**B.2 流的条件共轭积分器**：把命题 1、2 的推导按流的条件速度（式（4））重做，即可得到流版本的扩展 ΠGFM 与 C-ΠGFM；在 $B_t=0$ 时流版扩展 ΠGFM 退化为 Pokle 等 [20] 为 OT-流提出的 ΠGDM 形式。

**B.2.1 共轭 ΠGFM（C-ΠGFM）**：对流，取 OT-流参数化 $\alpha_t=t$、$\gamma_t=1-t$，相应变换与系数由与式（8）（9）对应的表达式给出，采样流程总结于原文算法 2（与算法 1 结构相同，仅把扩散系数替换为流系数，并使用 $w_t=w\alpha_t^2r_t^2$）。附录 B 同时给出流情形 $A_t$ 的闭式化简与逆变换表达式，形式与式（11）（12）一致。

### C 扩展到含噪与非线性逆问题

**含噪线性逆问题**：对形如式（105）的含噪线性逆问题，在 VP-SDE 扩散下，含噪变换 $A_t^{\sigma_y}$ 可由无噪（$\sigma_y=0$）情形的 $A_t$ 近似得到（证明见附录 A.5）：

$$
y=Hx_0+\sigma_yz,\tag{105}
$$
$$
A_t^{\sigma_y}=A_t+\kappa_3(t)H^\dagger\left(H^\dagger\right)^\top+O\left(\sigma_y^4\right)\approx A_t+\kappa_3(t)H^\dagger\left(H^\dagger\right)^\top,\tag{106}
$$
$$
\kappa_3(t)=\frac{w\sigma_y^2}{2}\left(\int_0^t\frac{\beta_s}{r_s^2}\mathrm ds\right)\left[\exp\left(\kappa_1(t)+\kappa_2(t)\right)-1\right].\tag{107}
$$

于是逆投影可通过扰动分析由 $A_t^{\sigma_y}$ 近似：

$$
\left(A_t^{\sigma_y}\right)^{-1}\approx A_t^{-1}-\kappa_3(t)A_t^{-1}H^\dagger\left(H^\dagger\right)^\top A_t^{-1}+O\left(\sigma_y^4\right).\tag{108}
$$

因此含噪情形的变换矩阵及其逆（见附录 A.5）同样可处理地计算。由于大多数实际情形中 $\sigma_y$ 相当小，可安全忽略 $\sigma_y^4$ 的高阶项，使近似保持精度。我们在图 8 中给出 ImageNet 数据集上 $\sigma_y=0.05$ 的 4× 超分辨定性示例。

**非线性逆问题**：对形如式（109）的非线性逆问题，与 Song 等 [14] 类似，我们启发式地把线性操作 $H^\dagger x_t$、$Hx_t$ 与 $Px_t$ 重新定义为相应的非线性等价 $h^\dagger(x_t)$、$h(x_t)$ 与 $h^\dagger(h(x_t))$；于是类似于式（11），无噪非线性逆问题的投影算子可定义为

$$
y=h(x_0)+\sigma_yz,\qquad z\sim\mathcal N(0,I_d),\tag{109}
$$
$$
A_t=\exp\left(\kappa_1(t)\right)\left[I_d+\left(\exp\left(\kappa_2(t)\right)-1\right)P\right],\qquad \kappa_1(t)=\int_0^t\left(\lambda+\frac{1}{2}\beta_s\right)\mathrm ds,\qquad \kappa_2(t)=-\frac{w}{2}\int_0^t\beta_s\mathrm ds,\tag{110}
$$

其中 $P=h^\dagger(h(\cdot))$ 为非线性"投影"算子。例如在压缩伪影去除等非线性逆问题中，$h(x_t)$ 与 $h^\dagger(x_t)$ 可由编码器与解码器实现（定性示例见图 12）。需指出这只是纯启发式近似，在本框架内为非线性逆问题建立更具原则性的框架仍是有趣的后续方向。

### D 实现细节

**D.1 C-ΠGDM 的实践方面**：D.1.1 给出 VP-SDE 的具体系数：漂移 $F_t=-\frac{1}{2}\beta_t$、扩散 $G_t=\sqrt{\beta_t}$，扰动核为 $p(x_t\mid x_0)=\mathcal N(\mu_tx_0,\sigma_t^2I_d)$，其中 $\mu_t=\exp\left(-\frac{1}{2}\int_0^t\beta_s\mathrm ds\right)$、$\sigma_t^2=1-\exp\left(-\int_0^t\beta_s\mathrm ds\right)$，反向动力学为 $\mathrm dx_t=\frac{1}{2}\left[x_t+s_\theta(x_t,t)\right]\mathrm dt$ 对应的形式；D.1.2 给出 C-ΠGDM 中 $A_t$、$A_t^{-1}$ 与 $\Phi_y$、$\Phi_s$、$\Phi_j$ 的简化闭式表达式（含 $\exp(\kappa_1(s))$、$\exp(\kappa_1(s)+\kappa_2(s))$ 等项），使系数可解析预计算。

**D.2 C-ΠGFM 的实践方面**：D.2.1 给出 OT-流设置（$\alpha_t=t$、$\gamma_t=1-t$，插值为 $x_t=(1-t)x_0+tz$ 的等价形式），D.2.2 给出 C-ΠGFM 的对应简化表达式。

**D.3 系数计算**：说明 $A_t$ 与各 $\Phi$ 系数可通过对时间的一维积分解析或数值预计算，并给出离散化方式；由于系数与采样步长无关，可在采样前一次性计算并复用，额外开销可忽略。

**D.4 数值求解器**：除另有说明使用 Euler 离散；附录讨论 torchdiffeq [59] 中的高阶求解器（如 Dormand–Prince [60]）可作为替代，用于更高精度需求。

**D.5 采样时的时间步选择**：说明时间步离散采用与基线一致的均匀或非均匀方案，并给出起始时间 $\tau$ 的选取建议。

**D.6 末步去噪**：说明在最后一步可对样本做一次额外去噪（Tweedie 估计）以提升视觉质量。

**D.7 评估指标**：FID [34]、KID [35]、LPIPS [36] 以及恢复类指标 PSNR/SSIM 的定义与计算方式（FID/KID 使用 torch-fidelity 实现 [62]）。

**D.8 基线超参数**：列出 DPS、ΠGDM、ΠGFM、DDRM 等基线在本文实验中使用的超参数与网格搜索范围。

### E 附加结果

**E.1 附加基线比较**：我们在 AFHQ-Cat（表 2）、LSUN-Bedroom（表 3）与 FFHQ（表 4）数据集上给出所提采样器与竞争基线的附加比较。关于 ImageNet 修复评估的说明：我们发现对扩散模型评估时，ΠGDM 的连续采样器在修复任务上会出现噪声伪影，因此 Conjugate ΠGDM 也有类似伪影；故我们不在 ImageNet 数据集上报告该任务结果。

**E.2 感知指标与恢复指标比较**：我们强调 C-ΠGDM 在逆问题语境下在感知与恢复两类指标上的鲁棒性。为完整起见，表 5 与表 6 分别在 ImageNet-256 与 FFHQ-256 数据集的 4× 超分辨任务上给出 DPS、ΠGDM 与 C-ΠGDM 在 PSNR、SSIM、FID 与 LPIPS 上的比较。值得注意的是，所有方法的 PSNR 与 SSIM 得分与其在正文中呈现的最佳 FID/LPIPS 得分相对应。即使采样预算极小，我们的方法也取得了具竞争力的 PSNR 与 SSIM，并具有优于 DPS/Π-GDM 等竞争基线的感知质量：例如在 FFHQ 数据集上，我们的方法取得 28.97 的 PSNR（DPS 为 28.49），同时具有更好的感知样本质量（LPIPS：本文 0.095 vs DPS 0.107），而所需采样预算约少 200 倍（本文 NFE=5，DPS 为 1000）。因此我们认为本方法的感知质量—恢复权衡优于竞争基线。

**E.3 遍历恢复与感知的权衡**：除引导权重 $w$ 外，本方法还允许调节另一个超参数 $\lambda$，它控制投影算子的动力学（直观解释见 2.3 与 3.2 节）。因此调节 $w$ 与 $\lambda$ 可在固定 NFE 预算下遍历感知质量与失真之间的权衡曲线：表 7（固定 $\lambda$、改变 $w$）与表 8（固定 $w$、改变 $\lambda$）在 ImageNet-256 数据集的 SR(x4) 任务上以 PSNR、LPIPS 与 FID 指标说明这一点。因此，对给定应用，本方法在保持相同采样步数的同时，为把采样过程调向更好的感知质量或更好的恢复提供了更大灵活性；相反，DPS 或 Π-GDM 等方法不具备这种灵活性，且由于 DPS 的高采样预算需求（约 1000 NFE），调节其引导权重可能非常昂贵。

**E.4 定性结果**：扩散模型部分给出 Π-GDM 与所提 C-ΠGDM 的更多定性比较（图 4—图 8），流模型部分给出 ΠGFM 与 C-ΠGFM 的比较（图 9—图 12），包括在压缩逆问题（预训练均值—尺度超先验神经编解码器 [63] 的潜变量解码、JPEG 图像恢复）上的应用。

## 表格

**表 1　共轭 ΠG(D/F)M 与其他基线在无噪线性逆问题上的比较**（按原表逐格转录；上：流模型 CelebA-HQ；下：扩散模型 ImageNet；加粗为给定采样预算下最佳）

| 任务 | NFE | LPIPS↓（C-ΠGFM） | LPIPS↓（ΠGFM） | KID×10⁻³↓（C-ΠGFM） | KID×10⁻³↓（ΠGFM） | FID↓（C-ΠGFM） | FID↓（ΠGFM） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 修复 | 5 | 0.125 | 0.240 | 17.6 | 167.0 | 26.95 | 161.49 |
| 修复 | 10 | 0.074 | 0.188 | 8.0 | 86.6 | 14.64 | 94.91 |
| 修复 | 20 | 0.065 | 0.144 | 4.6 | 54.4 | 10.93 | 65.39 |
| 超分辨 | 5 | 0.063 | 0.091 | 5.5 | 17.5 | 13.08 | 21.84 |
| 超分辨 | 10 | 0.058 | 0.076 | 3.6 | 12.2 | 10.65 | 16.73 |
| 超分辨 | 20 | 0.064 | 0.069 | 3.9 | 3.5 | 11.07 | 10.23 |
| 去模糊 | 5 | 0.083 | 0.114 | 3.7 | 10.9 | 12.86 | 18.97 |
| 去模糊 | 10 | 0.077 | 0.088 | 5.0 | 7.0 | 14.41 | 15.09 |
| 去模糊 | 20 | 0.080 | 0.073 | 7.9 | 3.1 | 17.10 | 11.35 |

| 任务 | NFE | LPIPS↓（C-ΠGDM） | LPIPS↓（ΠGDM） | KID×10⁻³↓（C-ΠGDM） | KID×10⁻³↓（ΠGDM） | FID↓（C-ΠGDM） | FID↓（ΠGDM） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 超分辨 | 5 | 0.220 | 0.306 | 2.7 | 6.3 | 37.31 | 49.06 |
| 超分辨 | 10 | 0.206 | 0.252 | 1.6 | 4.8 | 34.22 | 44.30 |
| 超分辨 | 20 | 0.207 | 0.222 | 1.7 | 2.5 | 34.28 | 37.36 |
| 去模糊 | 5 | 0.272 | 0.349 | 3.89 | 14.1 | 44.42 | 63.94 |
| 去模糊 | 10 | 0.272 | 0.294 | 3.6 | 5.3 | 43.37 | 47.80 |
| 去模糊 | 20 | 0.268 | 0.259 | 3.5 | 4.2 | 43.70 | 44.20 |

> **注**：原表中 DPS（NFE=1000）与 DDRM（NFE=20）另列数值（超分辨 5 步：DPS LPIPS 0.252/KID 5.8/FID 38.18，DDRM 0.318/14.1/51.64；去模糊 5 步：DPS 0.619/59.5/139.58，DDRM 0.336/12.3/62.53）；为保持 Markdown 表格可读，此处仅列出 C-ΠGDM 与 ΠGDM 两列，DPS/DDRM 数值按上述顺序给出，未改动原值。

**表 2　AFHQ-Cat 数据集上 4× 超分辨、修复与高斯去模糊的定量评估**（按原表逐格转录）

| 任务 | NFE | LPIPS↓（C-ΠGFM） | LPIPS↓（ΠGFM） | KID×10⁻³↓（C-ΠGFM） | KID×10⁻³↓（ΠGFM） | FID↓（C-ΠGFM） | FID↓（ΠGFM） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 修复 | 5 | 0.151 | 0.177 | 6.5 | 15.6 | 21.76 | 30.82 |
| 修复 | 10 | 0.122 | 0.136 | 8.5 | 9.4 | 22.50 | 24.87 |
| 修复 | 20 | 0.115 | 0.117 | 6.4 | 10.4 | 20.39 | 24.42 |
| 超分辨 | 5 | 0.129 | 0.133 | 4.1 | 5.7 | 18.43 | 19.55 |
| 超分辨 | 10 | 0.132 | 0.121 | 4.0 | 4.6 | 18.32 | 17.65 |
| 超分辨 | 20 | 0.134 | 0.119 | 4.5 | 4.0 | 18.75 | 16.97 |
| 去模糊 | 5 | 0.176 | 0.177 | 6.6 | 6.9 | 23.28 | 23.66 |
| 去模糊 | 10 | 0.182 | 0.164 | 9.4 | 7.1 | 28.12 | 23.62 |
| 去模糊 | 20 | 0.191 | 0.170 | 12.4 | 7.2 | 31.76 | 23.65 |

**表 3　LSUN-Bedroom 数据集上的定量评估**（按原表逐格转录；“–”表示原文未报告，因 ΠGFM 即使最大 NFE=20 也无法在掩膜区域生成合理纹理）

| 任务 | NFE | LPIPS↓（C-ΠGFM） | LPIPS↓（ΠGFM） | KID×10⁻³↓（C-ΠGFM） | KID×10⁻³↓（ΠGFM） | FID↓（C-ΠGFM） | FID↓（ΠGFM） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 修复 | 5 | 0.208 | – | 7.0 | – | 45.66 | – |
| 修复 | 10 | 0.176 | – | 4.4 | – | 40.69 | – |
| 修复 | 20 | 0.167 | – | 4.2 | – | 40.35 | – |
| 超分辨 | 5 | 0.174 | 0.219 | 3.1 | 7.7 | 37.54 | 46.03 |
| 超分辨 | 10 | 0.150 | 0.193 | 1.1 | 4.6 | 32.41 | 37.34 |
| 超分辨 | 20 | 0.148 | 0.175 | 0.9 | 2.5 | 32.26 | 32.15 |
| 去模糊 | 5 | 0.209 | 0.220 | 5.0 | 9.0 | 44.78 | 49.27 |
| 去模糊 | 10 | 0.204 | 0.193 | 10.7 | 4.7 | 53.53 | 44.21 |
| 去模糊 | 20 | 0.224 | 0.175 | 18.0 | 3.5 | 62.87 | 39.95 |

**表 4　FFHQ 数据集上 4× 超分辨与高斯去模糊的定量评估**（按原表逐格转录；DPS 以 NFE=1000 评估但在去模糊任务上表现不佳，DDRM 以 NFE=20 评估）

| 任务 | NFE | LPIPS↓（C-ΠGDM） | LPIPS↓（ΠGDM） | KID×10⁻³↓（C-ΠGDM） | KID×10⁻³↓（ΠGDM） | FID↓（C-ΠGDM） | FID↓（ΠGDM） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 超分辨 | 5 | 0.095 | 0.133 | 10.9 | 17.4 | 32.01 | 41.39 |
| 超分辨 | 10 | 0.086 | 0.106 | 8.8 | 10.2 | 29.07 | 32.79 |
| 超分辨 | 20 | 0.083 | 0.087 | 5.8 | 4.6 | 26.37 | 26.17 |
| 去模糊 | 5 | 0.127 | 0.147 | 7.3 | 14.6 | 31.18 | 39.63 |
| 去模糊 | 10 | 0.111 | 0.123 | 6.3 | 7.7 | 29.08 | 31.49 |
| 去模糊 | 20 | 0.112 | 0.103 | 4.4 | 3.1 | 27.68 | 26.30 |

**表 5　ImageNet-256 上 SR(x4) 的恢复（失真）与感知权衡比较**（按原表逐格转录）

| 方法 | PSNR ↑ | SSIM ↑ | FID ↓ | LPIPS ↓ |
| --- | --- | --- | --- | --- |
| DPS（NFE=1000） | 23.81 | 0.708 | 38.18 | 0.252 |
| ΠGDM（NFE=20） | 21.92 | 0.646 | 37.36 | 0.222 |
| C-ΠGDM（NFE=5） | 22.32 | 0.641 | 37.31 | 0.220 |
| C-ΠGDM（NFE=10） | 23.00 | 0.651 | 34.22 | 0.206 |
| C-ΠGDM（NFE=20） | 23.16 | 0.654 | 34.28 | 0.207 |

**表 6　FFHQ-256 数据集上 SR(x4) 的恢复与感知权衡比较**（按原表逐格转录）

| 方法 | PSNR ↑ | SSIM ↑ | FID ↓ | LPIPS ↓ |
| --- | --- | --- | --- | --- |
| DPS（NFE=1000） | 28.49 | – | – | 0.107 |
| C-ΠGDM（NFE=5） | 28.97 | – | – | 0.095 |

> **注**：原表 6 在本地 PDF 抽取文本中包含的方法/指标有限（仅见 PSNR 与 LPIPS 的对照值），其余数值未能从抽取文本完整恢复；正文引用的关键对照为"本文 PSNR 28.97、LPIPS 0.095 vs DPS 28.49、0.107"。

**表 7　固定 $\lambda=0.0$ 时 $w$ 的影响（NFE=5，ImageNet-256，SR(x4)）**（按原表逐格转录）

| $w$ | PSNR ↑ | LPIPS ↓ | FID ↓ |
| --- | --- | --- | --- |
| 2 | 22.91 | 0.339 | 48.48 |
| 4 | 23.37 | 0.306 | 45.03 |
| 6 | 23.49 | 0.274 | 42.68 |
| 8 | 23.44 | 0.266 | 40.96 |
| 10 | 23.28 | 0.254 | 40.27 |
| 12 | 22.89 | 0.246 | 40.13 |
| 14 | 22.74 | 0.239 | 40.16 |

**表 8　固定 $w=15.0$ 时 $\lambda$ 的影响（NFE=5，ImageNet-256，SR(x4)）**（按原表逐格转录）

| $\lambda$ | PSNR ↑ | LPIPS ↓ | FID ↓ |
| --- | --- | --- | --- |
| -1.0 | 20.96 | 0.291 | 42.56 |
| -0.8 | 21.33 | 0.265 | 40.97 |
| -0.6 | 21.69 | 0.240 | 39.38 |
| -0.4 | 22.04 | 0.223 | 37.83 |
| -0.2 | 22.32 | 0.220 | 37.31 |
| 0.2 | 22.73 | 0.257 | 45.27 |
| 0.4 | 22.90 | 0.275 | 48.98 |
| 0.6 | 23.03 | 0.283 | 47.47 |
| 0.8 | 23.11 | 0.285 | 46.2 |
| 1.0 | 23.15 | 0.285 | 46.41 |

## 图注与表注

**图 1**：逆问题快速采样中的条件共轭积分器示意（投影算子 $\Phi$、投影空间采样与逆投影）。
**图 2**：C-ΠG(D/F)M 与 ΠG(D/F)M 在五个数据集上的定性比较（(a,b,c) C-ΠGFM 的修复、去模糊、4× 超分辨；(d,e) C-ΠGDM 的 4× 超分辨与去模糊；$\sigma_y=0$、NFE=5）。
**图 3**：$\lambda$ 与 $w$ 对采样质量的影响（(a) 流 $\lambda$、(b) 流 $w$、(c) 扩散 $\lambda$、(d) 扩散 $w$；红/蓝曲线分别为 LPIPS/FID）。
**图 4**：ImageNet 4× 超分辨上 ΠGDM 与 C-ΠGDM 在 NFE=5 的定性比较（C-ΠGDM 在低计算预算下即可生成高频细节）。
**图 5**：ImageNet 4× 超分辨在不同采样预算（NFE=5/10/20）下的定性比较。
**图 6**：改变 C-ΠGDM 引导权重 $w$（$w=5/10/15$）对样本质量的影响（高引导权重对生成高质量样本至关重要）。
**图 7**：改变 C-ΠGDM 的 $\lambda$ 对样本质量的影响（高 $\lambda$ 导致模糊样本，极低 $\lambda$ 导致过锐化伪影）。
**图 8**：C-ΠGDM 对含噪逆问题的效果（4× 超分辨、NFE=5、$\sigma_y=0.05$；朴素伪逆无法去除噪声）。
**图 9**：ΠGFM 与 C-ΠGFM 在 3 个数据集、3 个任务上 NFE={5,10} 的定性比较。
**图 10**：改变 C-ΠGFM 引导权重 $w$ 对 ImageNet 4× 超分辨样本质量的影响。
**图 11**：改变 C-ΠGFM 的 $\lambda$ 对样本质量的影响。
**图 12**：C-ΠGFM 求解压缩逆问题（上：预训练均值—尺度超先验神经编解码器潜变量解码；下：JPEG 图像恢复）。

**表注**：表 1—8 已在本页「表格」一节逐格转录（表 1 覆盖正文主结果，表 2—4 为附录 E.1 的附加基线比较，表 5—6 为 E.2 的恢复/感知比较，表 7—8 为 E.3 的权衡遍历）；其中表 6 因本地 PDF 抽取文本不完整，仅能附上可恢复的数值并加注说明。

## 参考文献

> 以下按原文（NeurIPS 作者—年份制）顺序编号 [1]—[63] 转录英文原条目，条目文字不翻译；被截断信息以"（原文截断）"标注。

[1] J. Sohl-Dickstein, E. Weiss, N. Maheswaranathan, and S. Ganguli, “Deep unsupervised learning using nonequilibrium thermodynamics,” in International Conference on Machine Learning, pp. 2256–2265. PMLR, 2015.

[2] J. Ho, A. Jain, and P. Abbeel, “Denoising diffusion probabilistic models,” Advances in Neural Information Processing Systems, vol. 33, pp. 6840–6851, 2020.

[3] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, “Score-based generative modeling through stochastic differential equations,” in International Conference on Learning Representations, 2020.

[4] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, “Flow matching for generative modeling,” in International Conference on Learning Representations, 2023.

[5] M. Albergo and E. Vanden-Eijnden, “Building normalizing flows with stochastic interpolants,” in ICLR 2023 Conference, 2023.

[6] K. Pandey, M. Rudolph, and S. Mandt, “Efficient integrators for diffusion generative models,” in The Twelfth International Conference on Learning Representations, 2024.

[7] N. Shaul, J. Perez, R. T. Q. Chen, A. Thabet, A. Pumarola, and Y. Lipman, “Bespoke solvers for generative flow models,” in The Twelfth International Conference on Learning Representations, 2024.

[8] A. Sauer, F. Boesel, T. Dockhorn, A. Blattmann, P. Esser, and R. Rombach, “Fast high-resolution image synthesis with latent adversarial diffusion distillation,” arXiv preprint arXiv:2403.12015, 2024.

[9] T. Karras, M. Aittala, T. Aila, and S. Laine, “Elucidating the design space of diffusion-based generative models,” Advances in Neural Information Processing Systems, vol. 35, pp. 26565–26577, 2022.

[10] T. Salimans and J. Ho, “Progressive distillation for fast sampling of diffusion models,” in International Conference on Learning Representations, 2022.

[11] Q. Zhang and Y. Chen, “Fast sampling of diffusion models with exponential integrator,” in The Eleventh International Conference on Learning Representations, 2023.

[12] C. Lu, Y. Zhou, F. Bao, J. Chen, C. Li, and J. Zhu, “DPM-solver: A fast ODE solver for diffusion probabilistic model sampling in around 10 steps,” Advances in Neural Information Processing Systems, vol. 35, pp. 5775–5787, 2022.

[13] J. Song, C. Meng, and S. Ermon, “Denoising diffusion implicit models,” in International Conference on Learning Representations, 2021.

[14] J. Song, A. Vahdat, M. Mardani, and J. Kautz, “Pseudoinverse-guided diffusion models for inverse problems,” in International Conference on Learning Representations, 2022.

[15] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, “Diffusion posterior sampling for general noisy inverse problems,” in The Eleventh International Conference on Learning Representations, 2022a.

[16] P. Vincent, “A connection between score matching and denoising autoencoders,” Neural Computation, vol. 23, no. 7, pp. 1661–1674, 2011.

[17] Y. Song and S. Ermon, “Generative modeling by estimating gradients of the data distribution,” Advances in Neural Information Processing Systems, vol. 32, 2019.

[18] C. Saharia, J. Ho, W. Chan, T. Salimans, D. J. Fleet, and M. Norouzi, “Image super-resolution via iterative refinement,” IEEE Transactions on Pattern Analysis and Machine Intelligence, 2022a.

[19] C. Saharia, W. Chan, H. Chang, C. Lee, J. Ho, T. Salimans, D. Fleet, and M. Norouzi, “Palette: Image-to-image diffusion models,” in ACM SIGGRAPH 2022 conference proceedings, pp. 1–10, 2022b.

[20] A. Pokle, M. J. Muckley, R. T. Q. Chen, and B. Karrer, “Training-free linear image inverses via flows,” Transactions on Machine Learning Research, 2024.

[21] C. M. Stein, “Estimation of the mean of a multivariate normal distribution,” The Annals of Statistics, pp. 1135–1151, 1981.

[22] T. Dockhorn, A. Vahdat, and K. Kreis, “Score-based generative modeling with critically-damped Langevin diffusion,” in International Conference on Learning Representations, 2022.

[23] K. Pandey and S. Mandt, “A complete recipe for diffusion generative models,” in 2023 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 4238–4249, 2023.

[24] N. Ma, M. Goldstein, M. S. Albergo, N. M. Boffi, E. Vanden-Eijnden, and S. Xie, “Sit: Exploring flow and diffusion-based generative models with scalable interpolant transformers,” 2024.

[25] X. Liu, C. Gong, et al., “Flow straight and fast: Learning to generate and transfer data with rectified flow,” in The Eleventh International Conference on Learning Representations, 2023.（原文年份印作 20223，疑为排版错误）

[26] H. Chung, B. Sim, and J. C. Ye, “Come-closer-diffuse-faster: Accelerating conditional diffusion models for inverse problems through stochastic contraction,” in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 12413–12422, 2022b.

[27] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and L. Fei-Fei, “ImageNet: A large-scale hierarchical image database,” in 2009 IEEE conference on computer vision and pattern recognition, pp. 248–255, 2009.

[28] P. Dhariwal and A. Nichol, “Diffusion models beat GANs on image synthesis,” Advances in Neural Information Processing Systems, vol. 34, pp. 8780–8794, 2021.

[29] T. Karras, S. Laine, and T. Aila, “A style-based generator architecture for generative adversarial networks,” in Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 4401–4410, 2019.

[30] J. Choi, S. Kim, Y. Jeong, Y. Gwon, and S. Yoon, “ILVR: Conditioning method for denoising diffusion probabilistic models,” in 2021 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 14347–14356, 2021.

[31] Y. Choi, Y. Uh, J. Yoo, and J.-W. Ha, “StarGAN v2: Diverse image synthesis for multiple domains,” in Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 8188–8197, 2020.

[32] F. Yu, Y. Zhang, S. Song, A. Seff, and J. Xiao, “LSUN: Construction of a large-scale image dataset using deep learning with humans in the loop,” arXiv preprint arXiv:1506.03365, 2015.

[33] T. Karras, T. Aila, S. Laine, and J. Lehtinen, “Progressive growing of GANs for improved quality, stability, and variation,” in International Conference on Learning Representations, 2018.

[34] M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler, and S. Hochreiter, “GANs trained by a two time-scale update rule converge to a local Nash equilibrium,” Advances in Neural Information Processing Systems, vol. 30, 2017.

[35] M. Bińkowski, D. J. Sutherland, M. Arbel, and A. Gretton, “Demystifying MMD GANs,” in International Conference on Learning Representations, 2018.

[36] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang, “The unreasonable effectiveness of deep features as a perceptual metric,” in Proceedings of the IEEE conference on computer vision and pattern recognition, pp. 586–595, 2018.

[37] B. Kawar, M. Elad, S. Ermon, and J. Song, “Denoising diffusion restoration models,” Advances in Neural Information Processing Systems, vol. 35, pp. 23593–23606, 2022.

[38] L. Manduchi, K. Pandey, R. Bamler, R. Cotterell, S. Däubener, S. Fellenz, A. Fischer, T. Gärtner, M. Kirchler, M. Kloft, et al., “On the challenges and opportunities in generative AI,” arXiv preprint arXiv:2403.00025, 2024.

[39] Y. Song, P. Dhariwal, M. Chen, and I. Sutskever, “Consistency models,” in Proceedings of the 40th International Conference on Machine Learning, pp. 32211–32252, 2023.

[40] C. Meng, R. Rombach, R. Gao, D. Kingma, S. Ermon, J. Ho, and T. Salimans, “On distillation of guided diffusion models,” in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 14297–14306, 2023.

[41] L. Liu, Y. Ren, Z. Lin, and Z. Zhao, “Pseudo numerical methods for diffusion models on manifolds,” in International Conference on Learning Representations, 2022.

[42] M. Gonzalez, N. Fernandez Pinto, T. Tran, H. Hajri, N. Masmoudi, et al., “SEEDS: Exponential SDE solvers for fast high-quality sampling from diffusion models,” Advances in Neural Information Processing Systems, vol. 36, 2023.

[43] R. Yang and S. Mandt, “Lossy image compression with conditional diffusion models,” Advances in Neural Information Processing Systems, vol. 36, 2023.

[44] Z. Kong, W. Ping, J. Huang, K. Zhao, and B. Catanzaro, “DiffWave: A versatile diffusion model for audio synthesis,” in International Conference on Learning Representations, 2021.

[45] K. Pandey, A. Mukherjee, P. Rai, and A. Kumar, “DiffuseVAE: Efficient, controllable and high-fidelity generation from low-dimensional latents,” Transactions on Machine Learning Research, 2022.

[46] K. Preechakul, N. Chatthee, S. Wizadwongsa, and S. Suwajanakorn, “Diffusion autoencoders: Toward a meaningful and decodable representation,” in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 10619–10629, 2022.

[47] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, “High-resolution image synthesis with latent diffusion models,” in Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 10684–10695, 2022.

[48] D. Podell, Z. English, K. Lacey, A. Blattmann, T. Dockhorn, J. Müller, J. Penna, and R. Rombach, “SDXL: Improving latent diffusion models for high-resolution image synthesis,” in The Twelfth International Conference on Learning Representations.

[49] A. Ramesh, P. Dhariwal, A. Nichol, C. Chu, and M. Chen, “Hierarchical text-conditional image generation with CLIP latents,” 2022. arXiv:2204.06125.

[50] W. Peebles and S. Xie, “Scalable diffusion models with transformers,” in Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pp. 4195–4205, October 2023.

[51] P. Esser, S. Kulal, A. Blattmann, R. Entezari, J. Müller, H. Saini, Y. Levi, D. Lorenz, A. Sauer, F. Boesel, D. Podell, T. Dockhorn, Z. English, K. Lacey, A. Goodwin, Y. Marek, and R. Rombach, “Scaling rectified flow transformers for high-resolution image synthesis,” 2024.

[52] J. Chen, J. Yu, C. Ge, L. Yao, E. Xie, Z. Wang, J. Kwok, P. Luo, H. Lu, and Z. Li, “PixArt-$\alpha$: Fast training of diffusion transformer for photorealistic text-to-image synthesis,” in The Twelfth International Conference on Learning Representations, 2024.

[53] J. Ho and T. Salimans, “Classifier-free diffusion guidance,” in NeurIPS 2021 Workshop on Deep Generative Models and Downstream Applications, 2021.

[54] M. Mardani, J. Song, J. Kautz, and A. Vahdat, “A variational perspective on solving inverse problems with diffusion models,” in The Twelfth International Conference on Learning Representations, 2023.

[55] T. Xu, Z. Zhu, D. He, Y. Wang, M. Sun, N. Li, H. Qin, Y. Wang, J. Liu, and Y.-Q. Zhang, “Consistency models improve diffusion inverse solvers,” arXiv preprint arXiv:2403.12063, 2024.

[56] C. Lu, Y. Zhou, F. Bao, J. Chen, C. Li, and J. Zhu, “DPM-Solver++: Fast solver for guided sampling of diffusion probabilistic models,” 2023.

[57] L. Rout, N. Raoof, G. Daras, C. Caramanis, A. Dimakis, and S. Shakkottai, “Solving linear inverse problems provably via posterior sampling with latent diffusion models,” Advances in Neural Information Processing Systems, vol. 36, 2024.

[58] M. S. Albergo, N. M. Boffi, and E. Vanden-Eijnden, “Stochastic interpolants: A unifying framework for flows and diffusions,” arXiv preprint arXiv:2303.08797, 2023.

[59] R. T. Q. Chen, “torchdiffeq,” 2018. https://github.com/rtqichen/torchdiffeq.

[60] J. R. Dormand and P. J. Prince, “A family of embedded Runge-Kutta formulae,” Journal of Computational and Applied Mathematics, vol. 6, no. 1, pp. 19–26, 1980.

[61] A. Jolicoeur-Martineau, R. Piché-Taillefer, I. Mitliagkas, and R. Tachet des Combes, “Adversarial score matching and improved sampling for image generation,” in International Conference on Learning Representations, 2021.

[62] A. Obukhov, M. Seitzer, P.-W. Wu, S. Zhydenko, J. Kyl, and E. Y.-J. Lin, “High-fidelity performance metrics for generative models in pytorch,” 2020. https://github.com/toshas/torch-fidelity.

[63] D. Minnen, J. Ballé, and G. D. Toderici, “Joint autoregressive and hierarchical priors for learned image compression,” in Advances in Neural Information Processing Systems, vol. 31, 2018.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 1 节引言（含三条贡献，图 1）；第 2 节基于扩散/流的逆问题快速采样器（2.1 背景与问题陈述，式（1）—（5）；2.2 条件共轭积分器：式（6）—（9）与命题 1、2；2.2.2 实践设计选择，算法 1；2.3 理论方面，式（10）—（14）与 $A_t$ 的直观解释；2.4 扩展）；第 3 节实验（模型与数据集、任务与指标、方法与基线，§3.1 定量结果与表 1，§3.2 定性结果与图 2，§3.3 消融实验与图 3）；第 4 节相关工作；第 5 节讨论、更广泛影响与致谢；附录 A（A.1—A.5，含含噪逆问题命题式（80）—（82））、B（B.1—B.2.1）、C（式（105）—（110））、D（D.1—D.8）、E（E.1—E.4）；表 1—8（逐格）；图 1—12 图注；参考文献 [1]—[63] 英文原条目。未完成/未包含：①逐句逐式与 PDF 的终校未做（页尾标注 qa_complete=false）；②图 1—12 图像本体未复制（站点不上传图片），仅中文图注与正文说明；③附录 A 的证明按原文逐步代数推导的**结构与关键公式**翻译，未逐行复现每一步中间代数；④表 6 因 PDF 抽取文本不完整仅附可恢复数值（已加注），表 1 中 DPS/DDRM 两列以注记形式给出原值而非并入 Markdown 表；⑤NeurIPS 论文检查清单（Paper Checklist，原文第 37—43 页）属元数据/表格清单，未逐项录入，如需可另行补充；⑥**再传播许可待核验**，本页仅学习用途、不计入可公开全文统计（页首与状态段已保留说明）；⑦本地 PDF 为 NeurIPS 2024 论文集版本，无 arXiv 编号。**qa_complete=false。**
