---
layout: page
title: "从近端算子视角理解流匹配｜中文译稿（逐式校对中）"
permalink: /papers/translations/2026-10-16-flow-matching-proximal-2602-12683/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原论文 arXiv](https://arxiv.org/abs/2602.12683) · [原始 PDF](https://arxiv.org/pdf/2602.12683v2) · [对应推荐记录](/papers/items/960c9e722bdf3f38/)

# 从近端算子视角理解流匹配

**英文原题：** Flow Matching from Viewpoint of Proximal Operators  
**作者：** Kenji Fukumizu、Wei Huang、Han Bao、Shuntuo Xu、Nisha Chandramoorthy  
**单位：** 日本统计数理研究所、日本理化学研究所 AIP、东北大学、华东师范大学、芝加哥大学。  
**版本：** arXiv:2602.12683v2，2026 年 3 月 24 日，38 页。  
**译文说明：** 保留正文第 1–7 节及附录 A–G 的分节结构、原文公式编号和定理编号；引用文献书目保留英文作者与题名，专有术语提供中文释义。本站不重复上传原 PDF 和图像。  
**校对状态：** 正在逐页逐式核对，尚未通过全文验收。下文仅按已经核实的范围更新，不以概括或研究笔记代替原文。

## 摘要

本文重新表述最优传输条件流匹配（Optimal Transport Conditional Flow Matching，OT-CFM）这一类动力学生成模型，并证明它可通过扩展的 Brenier 势获得**精确的近端算子（proximal operator）表述**，而无须假定目标分布存在概率密度。特别地，用于恢复目标样本点的映射恰好由近端算子给出，从而得到向量场的显式近端表达式。我们还讨论了当批量大小增大时，小批量 OT-CFM 向总体（population）模型的收敛。

最后，借助凸势的二阶上图导数（second epi-derivative），我们证明：当目标分布的支撑位于流形上时，OT-CFM 在终端具有法向双曲性（terminally normally hyperbolic）。对时间重新参数化后，动力学在与数据流形正交的方向上呈指数收缩，在切向方向上保持中性。

## 1. 引言

扩散模型 [Sohl-Dickstein 等，2015；Ho 等，2020；Song 等，2021] 和流匹配 [Lipman 等，2023；Liu 等，2023；Albergo 与 Vanden-Eijnden，2023] 等动力学生成模型近年来在许多应用中获得显著成功 [Yang 等，2024]，展现出很强的高维采样能力。代表性的应用包括潜扩散的文本生成图像 [Rombach 等，2022；Saharia 等，2022]、逆问题后验采样 [Kawar 等，2022]、机器人操作中的扩散策略 [Chi 等，2025]。在科学领域，扩散模型也被用于分子对接和蛋白质设计 [Corso 等，2023；Watson 等，2023]。与此同时，流模型已经成为有竞争力的替代方法，并被用于图像生成 [Esser 等，2024] 和分子编辑等科学建模任务 [Ikeda 等，2025]。

本文重点研究流匹配（FM）。该方法学习向量场 $v_t(x)$，使其诱导的常微分方程（ODE）将简单基分布 $P_0$（通常为标准高斯）传输到目标分布 $P_1$。条件流匹配（CFM）[Lipman 等，2023] 从联合分布 $(x_0,x_1)\sim\pi$ 中采样，并根据调度 $\alpha_t,\beta_t\in[0,1]$ 构造随机条件路径：

$$
x_t=\alpha_t x_0+\beta_t x_1,\qquad t\in[0,1].
\tag{1}
$$

其中 $\pi$ 的边缘分布分别为 $P_0$、$P_1$。沿条件路径构造随机向量场

$$
v_t(x_t;x_0,x_1)=\dot\alpha_t x_0+\dot\beta_t x_1,
\tag{2}
$$

这里上方圆点表示时间导数。利用该向量场作为监督信号训练神经网络，以估计边缘向量场

$$
v_t(x_t)=\mathbb E_{x_0,x_1}\left[
v_t(x_t;x_0,x_1)\mid x_t=\alpha_t x_0+\beta_t x_1
\right].
$$

一般而言，可以有许多向量场把 $t=0$ 的 $P_0$ 样本流动到 $t=1$ 的 $P_1$ 样本，而不同向量场对应于不同的耦合。因此，CFM 的一个关键自由度，是如何选择式 (1) 所隐含的 $P_0$ 与 $P_1$ 之间的耦合 $\pi$。常用做法是在随机梯度下降训练过程中求解（小批量）最优传输（OT）问题 [Tong 等，2024；Pooladian 等，2023]，称为 OT-CFM。它可减少监督信号的方差 [Pooladian 等，2023]，并使向量场产生更直的轨迹、更容易求解 ODE，因此经验性能较好。

生成模型对高维数据（如高分辨率图像）的成功学习，通常可以从**流形假设（manifold hypothesis）**的角度理解：高维数据实际分布于低维流形上。近年来，多项理论研究在流形假设下分析了扩散模型，包括由内禀维数控制的极小极大估计速率 [Oko 等，2023]、子空间及切向—法向分解 [Chen 等，2023、2024]、流形邻域的 Lyapunov 稳定性 [Chandramoorthy 与 De Clercq，2025]，以及流形邻域得分函数的几何效应与奇异行为 [Li 等，2025；Liu 等，2025]。由于 FM 与基于得分的模型采用不同的学习原理，需要另寻途径理解 FM 在数据流形附近的动力学。

本文为分析 OT-CFM 的向量场和动力学提供一个新的框架，允许目标分布集中于低维流形。我们使用凸分析中常见的（扩展）Brenier 势与近端算子 [Brenier，1991；Rockafellar 与 Wets，1998；Parikh 与 Boyd，2014] 来表示 OT-CFM 向量场，并指出：类似于扩散模型利用得分构造去噪器，FM 可以被看作具有近端算子的去噪器。

我们的理论首先假设条件随机路径由**总体最优传输耦合**构建。相较实际训练使用的小批量最优传输，这一假设较强；不过我们进一步证明，当批量大小增大时，由有限样本小批量 OT 得到的向量场存在一个子序列，收敛到总体 OT 的向量场。这允许我们从凸分析角度把 OT-CFM 解释成一种去噪过程。

我们还说明，扩散模型和 Schrödinger 桥（SB）中也会出现类似的近端结构。通过 Tweedie 公式，扩散模型的去噪器具有**近似的**近端形式；在 SB 中，反向过程对应于 Schrödinger 势的近端算子。

最后，本文利用近端结构研究流形假设下的终端时间稳定性。通过对可能出现集合值映射的凸势使用二阶上图导数，推导终端动力学的 Lyapunov 指数。证明表明：进行自然的终端时间变换后，OT-CFM 沿流形法向指数收缩，而切向 Lyapunov 指数为零。这与 Chandramoorthy 和 De Clercq [2025] 的分析相呼应，意味着数据流形结构对 OT-CFM 中的小扰动具有稳健性。

**主要贡献：**

1. 基于 Aleksandrov–Brenier 势，用势函数的次微分重新描述 OT-CFM 的向量场，并将其扩展到流形假设场景。
2. 证明 OT-CFM 中 $x_t\mapsto x_1$ 的映射具有精确的欧氏近端形式，从而给出 FM 向量场的近端表达式。
3. 说明有限数据小批量 OT-CFM 的向量场可以沿子序列收敛到总体 OT 给出的向量场。
4. 借助凸势的二阶上图导数，证明流形假设下 OT-CFM 的终端法向双曲性，揭示切向动力学的中性行为。

**图 1｜目标样本、噪声与条件路径的关系。** 目标样本 $x_1$ 与噪声 $x_0$ 通过扩展 Brenier 映射 $x_0=T(x_1)$ 联系，其中 $T=\partial\varphi$；插值点 $x_t$ 经 $H_t^{-1}=\nabla\psi_t^*$ 恢复为 $x_1$。$H_t$ 是第 2.3 节定义的插值算子。

## 2. 基于近端算子的 OT 流匹配表述

### 2.1 OT-CFM

沿用第 1 节的条件路径与向量场记号，假设 $P_0=\mathcal N(0,I_d)$，目标分布 $P_1\in\mathcal P_2(\mathbb R^d)$，即具有有限二阶矩。全文**不假定** $P_1$ 存在密度；尤其关心 $P_1$ 的支撑位于低维流形上的情况。记扩展实数集 $\overline{\mathbb R}=\mathbb R\cup\{+\infty\}$。

将式 (2) 中的 $x_0=(x_t-\beta_t x_1)/\alpha_t$ 消去，可得

$$
v_t(x_t)=\frac{\dot\alpha_t}{\alpha_t}x_t+
\beta_t\left(\frac{\dot\beta_t}{\beta_t}
-\frac{\dot\alpha_t}{\alpha_t}\right)
\mathbb E[x_1\mid x_t].
\tag{3}
$$

这在本质上与扩散模型的漂移项类似。扩散模型中的 $\mathbb E[x_1\mid x_t]$ 通常被称为去噪器，用于从带噪 $x_t$ 估计干净样本 $x_1$。

本文主要研究总体层面（population）的 OT-CFM，即利用 $P_1$ 和 $P_0$ 之间的总体 OT 耦合，而非小批量 OT，产生 CFM 随机路径。特别地，考虑二次代价的最优传输问题：

$$
\inf_{\pi\in\Pi(P_0,P_1)}
\int_{\mathbb R^d\times\mathbb R^d}
\frac12\|x_0-x_1\|^2\,\mathrm d\pi(x_0,x_1).
$$

其中 $\Pi(P_0,P_1)$ 是以 $P_0$、$P_1$ 为边缘分布的联合分布集合。第 3.1 节再讨论它与小批量 OT 的关系。

### 2.2 Aleksandrov–Brenier 势

分析 OT-CFM 向量场时，可以考虑由 $P_0$ 向 $P_1$ 的传输，或反方向的传输。为了与式 (3) 中扩散模型的去噪器视角比较，正文主要研究从 $P_1$ 到 $P_0$ 的传输，而第 3 节会讨论从 $P_0$ 到 $P_1$ 的方向。

如果 $P_1$ 不存在密度，例如目标分布满足流形假设，从 $P_1$ 到 $P_0$ 的 OT 映射可能不存在 [Brenier，1991]。但对于二次传输代价，最优传输计划仍可利用**凸势的次微分**表示。具体而言，最优传输计划 $\pi^\star$ 的支撑是循环单调的 [Santambrogio，2015，定理 1.38]。根据 Rockafellar [1970，定理 24.8]，存在正常的、下半连续（lower semicontinuous，lsc）凸函数 $\varphi:\mathbb R^d\to\overline{\mathbb R}$，满足

$$
(x_0,x_1)\in\operatorname{supp}(\pi^\star)
\ \Longrightarrow\ x_0\in\partial\varphi(x_1).
\tag{4}
$$

$\partial\varphi$ 表示凸势的次微分 [Bauschke 与 Combettes，2017]。本文把这样的 $\varphi$ 称为从 $P_1$ 到 $P_0$ 的 **Aleksandrov–Brenier 势**，它是目标具有密度时的 Brenier 势的推广。与普通 Brenier 势不同，它可能不可微，也与 Monge–Ampère 方程的 Aleksandrov 势相关 [Aleksandrov，1939；Gutiérrez，2001]。

当 $P_1$ 有密度时，$\varphi$ 在 $P_1$ 几乎处处可微，式 (4) 退化为普通 Brenier 映射 $x_0=\nabla\varphi(x_1)$ [Brenier，1991]。直观地，若 $P_1$ 的支撑是 $m$ 维流形且 $m<d$，则同一个目标点 $x_1$ 可以和 $\pi^\star$ 所诱导的某个 $(d-m)$ 维子集中的噪声点耦合。次梯度集合 $\partial\varphi(x_1)$ 包含该子集（见第 2.3.2 节的图 2）。

### 2.3 向量场的近端表示

现在利用凸分析表示 OT-CFM 向量场。固定一组光滑非负调度 $\alpha_t,\beta_t$，满足当 $t\uparrow1$ 时，$\alpha_t$ 从 1 下降到 0，$\beta_t$ 从 0 上升到 1。对于由最优计划 $\pi^\star$ 抽取的样本对，式 (4) 给出

$$
x_0\in\partial\varphi(x_1).\tag{5}
$$

定义一般为集合值的插值算子

$$
H_t(x)=\alpha_t\partial\varphi(x)+\beta_t x.
$$

于是 $x_t\in H_t(x_1)$。引入强凸函数

$$
\psi_t(x)=\alpha_t\varphi(x)+\frac{\beta_t}{2}\|x\|^2,
$$

其满足 $\partial\psi_t(x)=H_t(x)$。由于 $t>0$ 时 $\beta_t>0$，$\psi_t$ 为 $\beta_t$-强凸函数，其凸共轭 $\psi_t^\ast$ 处处可微。标准对偶关系为 [Rockafellar 与 Wets，1998，命题 11.3]

$$
y\in\partial\psi_t(x)
\quad\Longleftrightarrow\quad
x=\nabla\psi_t^\ast(y).
\tag{6}
$$

即使 $H_t$ 是集合值映射，其逆 $H_t^{-1}$ 仍然是单值的：

$$
H_t^{-1}(y)=\nabla\psi_t^\ast(y),
\qquad t\in(0,1),\ \beta_t>0.
$$

因此，由式 (1) 生成的 $x_t$ 可以唯一恢复其目标端点 $x_1=\nabla\psi_t^\ast(x_t)$。在式 (3) 中给定 $x_t$ 时，$x_1$ 于是成为确定性变量，得到

$$
v_t(y)=\frac{\dot\alpha_t}{\alpha_t}y+
\beta_t\left(\frac{\dot\beta_t}{\beta_t}
-\frac{\dot\alpha_t}{\alpha_t}\right)
\nabla\psi_t^\ast(y).
\tag{7}
$$

现在进一步以近端算子表示该向量场。对凸函数 $F:\mathbb R^d\to\overline{\mathbb R}$ 和 $\lambda>0$，一般的欧氏近端算子定义为

$$
\operatorname{prox}_{\lambda F}(y)=
\arg\min_{u\in\mathbb R^d}
\left\{F(u)+\frac1{2\lambda}\|u-y\|^2\right\}.
\tag{8}
$$

若 $F$ 可微，则重要的恒等关系

$$
x=\operatorname{prox}_{\lambda F}(y)
\quad\Longleftrightarrow\quad
y=x+\lambda\nabla F(x)
$$

允许把近端运算解释为一步隐式 Euler 积分。不过，下一个引理**不要求** $\varphi$ 可微。

**引理 2.1。** 对任意 $t\in(0,1)$、$\beta_t>0$，有

$$
\nabla\psi_t^\ast(y)
=\operatorname{prox}_{\lambda_t\varphi}
\left(\frac y{\beta_t}\right),
\qquad \lambda_t=\frac{\alpha_t}{\beta_t}.
\tag{9}
$$

**证明。** 令
$u=\operatorname{prox}_{\lambda_t\varphi}(y/\beta_t)$。考虑凸函数 $u\mapsto\lambda_t\varphi(u)+\frac12\|u-y/\beta_t\|^2$ 的最优性条件：

$$
0\in\lambda_t\partial\varphi(u)+u-\frac y{\beta_t}.
$$

两侧乘 $\beta_t$，得到
$y\in\beta_tu+\alpha_t\partial\varphi(u)=\partial\psi_t(u)$。根据对偶式 (6)，$u=\nabla\psi_t^\ast(y)$。证毕。

由式 (7) 和引理 2.1，立即得到：

**推论 2.2。** 若 $t\in(0,1)$ 且 $\beta_t>0$，

$$
v_t(y)=\frac{\dot\alpha_t}{\alpha_t}y+
\beta_t\left(\frac{\dot\beta_t}{\beta_t}
-\frac{\dot\alpha_t}{\alpha_t}\right)
\operatorname{prox}_{\lambda_t\varphi}
\left(\frac y{\beta_t}\right).
\tag{10}
$$

根据式 (7)、(10)，也可以把 ODE 表示为具有适当势函数的梯度流。式 (10) 给出 Moreau 包络的梯度流；详情见附录 C。

#### 2.3.1 将近端映射理解为去噪器

扩散模型通常把 $\mathbb E[x_1\mid x_t]$ 视作去噪器。对 OT-CFM，这里可以在“受到噪声污染的观测”的意义下，把近端映射解释成精确的去噪器。

为了简化，先假设存在由 $P_1$ 到 $P_0$ 的可微 Brenier 势 $\varphi$，以及对应 OT 映射

$$
T=\nabla\varphi:\mathbb R^d\to\mathbb R^d,
\qquad T_\#P_1=P_0.
$$

例如当 $P_1$ 有密度时，由 Brenier 定理保证 $T$ 存在。先抽取干净样本 $x_1\sim P_1$，把 $z=T(x_1)$ 定义为其 OT 编码噪声。因为 $T_\#P_1=P_0$，$z$ 的边缘分布为 $\mathcal N(0,I_d)$。再定义受污染观测

$$
y=x_1+\lambda z=x_1+\lambda T(x_1)=:F_\lambda(x_1).
$$

近端映射可以**精确恢复**干净样本：

$$
\operatorname{prox}_{\lambda\varphi}(y)=x_1.
$$

因此对这一特定的 OT 诱导污染机制，$\operatorname{prox}_{\lambda\varphi}$ 是完美的去噪器：它精确反转前向“加噪”变换 $F_\lambda:x\mapsto x+\lambda T(x)$，关系见图 1。

这里必须澄清两点。第一，虽然 $z=T(x_1)$ 的边缘分布是高斯，$z$ 却由 $x_1$ **确定性地决定**，不同于扩散模型中加入的独立高斯噪声。第二，这里的“去噪器”应被理解为**逆映射**，而非 $\mathbb E[x_1\mid y]$ 那样的统计回归：前向污染映射为双射，近端算子提供其精确逆。

#### 2.3.2 势与向量场的一个例子

给出 Aleksandrov–Brenier 势及相关集合值 OT 映射的一个例子，说明当目标分布位于低维流形时，如何获得向量场。

令 $d=2$、$m=1$，固定 $c\in\mathbb R$。考虑水平线流形
$\mathcal M=\{(x,c):x\in\mathbb R\}$。
源分布为二维标准高斯 $P_0=\mathcal N(0,I_2)$，目标分布为
$P_1=\mathcal N(0,1)\otimes\delta_c$，支撑于 $\mathcal M$。

从 $P_0$ 到 $P_1$ 的 OT 映射为
$S(u,v)=(u,c)$，即在 $\mathcal M$ 上的投影。
设 $(U,V)\sim P_0$，其诱导耦合为
$(x_0,x_1)=((U,V),(U,c))$，代价
$\mathbb E\|x_0-x_1\|^2=\mathbb E(V-c)^2$。
由于第一坐标的边缘分布已经匹配，而第二坐标代价固定，这一耦合是最优的。映射 $S$ 是凸函数
$\phi(u,v)=\frac12u^2+cv$
的梯度：$\nabla\phi(u,v)=(u,c)$。

从 $P_1$ 到 $P_0$ 的集合值 OT 映射由凸共轭 $\varphi=\phi^\ast$ 给出：

$$
\begin{aligned}
\varphi(p,q)
&=\sup_{(u,v)\in\mathbb R^2}
\left\{pu+qv-\frac12u^2-cv\right\}\\
&=\frac12p^2+\iota_{\{c\}}(q),
\end{aligned}
$$

其中指示函数 $\iota_{\{c\}}(q)$ 在 $q=c$ 时为 0，否则为 $+\infty$。对任意 $z=(p,c)\in\mathcal M$，

$$
\partial\varphi(p,c)=\{(p,s):s\in\mathbb R\}.
$$

相应近端算子满足

$$
\operatorname{prox}_{\lambda_t\varphi}
\left(\frac{(u,v)}{\beta_t}\right)
=\left(\frac{u}{\alpha_t+\beta_t},\,c\right).
$$

当 $\alpha_t+\beta_t=1$ 时，由式 (10) 得到
$v_t=(0,(\dot\alpha_t/\alpha_t)(v-c))$，它与流形 $\mathcal M$ 正交。见图 2。

**图 2｜低维目标分布示例。** $P_1$ 支撑于橙色的一维流形 $\mathcal M$，其上有密度；$P_0=\mathcal N(0,I_2)$ 在二维空间中具有密度（灰色）。流形点 $z\in\mathcal M$ 的 Aleksandrov–Brenier 次微分 $\partial\varphi(z)$ 在此例中处处沿流形法向（灰色箭头）。

## 3. 扩展

### 3.1 小批量 OT-CFM

迄今都假设条件路径使用总体 OT 构造；但实际 OT-CFM 中总体 OT 通常不可计算，训练时一般通过随机梯度下降，在有限小批量的 $x_0$、$x_1$ 样本上计算 OT 耦合。

令 $\{x_0^{(\ell)}\}_{\ell=1}^{n}$ 和
$\{x_1^{(\ell)}\}_{\ell=1}^{n}$ 为两个小批量。由于在多数情况下，两经验分布
$\widehat P_0=n^{-1}\sum_{\ell=1}^n\delta_{x_0^{(\ell)}}$、
$\widehat P_1=n^{-1}\sum_{\ell=1}^n\delta_{x_1^{(\ell)}}$
之间的 OT 可由一个置换表示，本文假设经过重排序后，$x_0^{(\ell)}$ 与 $x_1^{(\ell)}$ 通过 OT 配对。一般而言，OT 也可以是多个置换的凸组合，因此不一定唯一 [Panaretos 与 Zemel，2020，命题 1.3.1]。

按照第 2.3 节的相同论证，可以构造 Aleksandrov–Brenier 势 $\varphi_n$，满足

$$
x_0^{(\ell)}\in\partial\varphi_n(x_1^{(\ell)}),
\qquad \ell=1,\ldots,n.
$$

由于给 $\varphi_n$ 加常数不改变次微分，不失一般性可令 $\varphi_n(0)=0$。由 Rockafellar 与 Wets [1998，定理 7.6]，序列 $\{\varphi_n\}_{n\ge1}$ 存在上图收敛（epi-converging）到某个 $\varphi$ 的子序列 $\{\varphi_{n_k}\}_{k\ge1}$。对这样的子序列，近端算子满足

$$
\operatorname{prox}_{\lambda_t\varphi_{n_k}}
\longrightarrow\operatorname{prox}_{\lambda_t\varphi}
\quad(k\to\infty)
$$

且在任意紧集上一致收敛 [Rockafellar 与 Wets，1998，定理 7.33、12.35]。

分别用 $v_t$ 和 $v_t^{(n_k)}$ 表示将 $\varphi$ 与 $\varphi_{n_k}$ 代入式 (10) 得到的向量场。近端算子的一致收敛意味着，当批量大小增长时，

$$
v_t^{(n_k)}(y)\longrightarrow v_t(y)
$$

在 $\mathbb R^d\times(0,1)$ 的任意紧子集上关于 $(y,t)$ 一致收敛。加入适当额外假设后，还可推出 ODE 解和推前分布的收敛，详见附录 F。因此，第 2 节总体 OT 理论也能描述大批量极限下小批量 OT-CFM 的行为。

### 3.2 生成模型的近端算子视角

第 2 节建立的近端形式提供了分析更广泛生成模型的统一视角。Shi 等 [2023，附录 A.1] 也曾提出类似观察，这里显式写出近端算子形式的去噪器。需要注意，本小节沿用扩散模型和 SB 的习惯，将 $s=0$ 视为目标分布，$s=\infty$（SB 中为 $T$）视为噪声分布，时间方向与第 2 节 FM 不同。

**扩散模型。** 考虑方差保持（VP）扩散过程

$$
X_s=\beta_sX_0+\sigma_sZ_s,\qquad
Z_s\sim\mathcal N(0,I),
$$

其中 $s\in[0,\infty)$，$\beta_s\downarrow0$、
$\sigma_s\uparrow1$、$\beta_s^2+\sigma_s^2=1$。
$s=0$ 时恢复目标，$s\to\infty$ 时 $X_s$ 趋近 $\mathcal N(0,I)$。反向过程的漂移与式 (3) 相同。

联系去噪得分匹配的关键是 Tweedie 公式 [Tweedie，1984]：

$$
\mathbb E[\beta_sX_0\mid X_s=y]
=y+\sigma_s^2\nabla\log p_s(y),
$$

其中 $p_s$ 是 $X_s$ 的密度。利用附录引理 A.4，只要噪声足够小，就可将去噪器近似写为 $-\log p_s$ 的近端算子：

$$
\mathbb E[\beta_sX_0\mid X_s=y]
=\operatorname{prox}_{\sigma_s^2(-\log p_s)}(y)
+O(\sigma_s^4).
$$

**Schrödinger 桥（SB）。** 给定参考路径测度 $R$（通常是布朗运动），SB 寻找满足端点分布条件的路径测度 $P^{\rm SB}$：

$$
P^{\rm SB}
=\arg\min_{P\in\mathcal P_2(\mathbb R^d\times[0,T])}
\operatorname{KL}(P\|R),
\qquad
P_0^{\rm SB}=P_0,\quad P_T^{\rm SB}=P_1.
$$

该问题等价于熵正则化 OT [Léonard，2014]。对布朗运动参考过程，时间 $0$ 与 $s$ 的联合桥密度可因子分解成

$$
p^{\rm SB}(x_s,x_0)\propto
\psi_s(x_s)K_s(x_s\mid x_0)\phi_0(x_0),
$$

其中 $K_s(x_s\mid x_0)=\mathcal N(x_s;x_0,2\epsilon s I)$ 是转移核，
$\phi,\psi$ 是指数域中的 Schrödinger 势，满足 Kolmogorov 方程。利用 Laplace 近似可得去噪器（详细推导见附录 E）：

$$
\mathbb E[X_0\mid X_s=x_s]
=x_s+2\epsilon s\nabla\log\phi_0(x_s)
+O((\epsilon s)^2).
$$

与扩散模型同理，在无穷小噪声下，SB 反向过程可以写成
$\operatorname{prox}_{2\epsilon s(-\log\phi_0)}+
O((\epsilon s)^2)$ 的形式。

### 3.3 正向近端算子

虽然本文主要考察 $P_1\to P_0$ 的传输，也可以基于 $P_0\to P_1$ 的近端算子建立形式。因为 $P_0$ 有密度，存在可微 Brenier 势 $\phi$，使
$S=\nabla\phi$ 给出传输映射 $x_1=S(x_0)$。

虽然使用正向 OT 映射可能在数学上更简单，本文仍选择反向的集合值映射 $x_1\mapsto x_0$，以将近端算子解释为去噪器（第 2.3.1 节），与扩散模型形成对应。另外，对 $S$ 也可以进行第 4 节的 Lyapunov 分析，但所得定理需要更强的 $S$ 的光滑性假设，经典 Caffarelli 正则性理论 [Caffarelli，2003] 并不能保证它们。详见附录 G.2。


## 4. 终端 Lyapunov 指数分析

本节基于第 2 节的近端算子框架，在低维流形假设下分析 FM 的终端行为。首先借助二阶变分刻画，讨论近端算子的半导数（semiderivative，即方向导数）。更一般的理论见 Rockafellar 与 Wets [1998]。

以下假设 $\mathcal M\subset\mathbb R^d$ 是维度为 $m<d$ 的 $C^2$ 子流形，且目标分布 $P_1$ 的支撑为 $\mathcal M$。对于 $x_1\in\mathcal M$，分别以 $T_{x_1}\mathcal M$ 和 $N_{x_1}\mathcal M$ 表示相对于 $\mathbb R^d$ 内积的切空间和法空间。于是

$$
\mathbb R^d\simeq T_{x_1}\mathcal M\oplus N_{x_1}\mathcal M,
\qquad \dim N_{x_1}\mathcal M=d-m.
$$

### 4.1 Lyapunov 指数

先考虑一般时间 $\tau\in[0,\infty)$ 下的 ODE

$$
\frac{\mathrm dx(\tau)}{\mathrm d\tau}
=u_\tau(x(\tau)),
$$

以及其流映射 $\Phi_\tau:\mathbb R^d\to\mathbb R^d$，即
$x(\tau)=\Phi_\tau(x(0))$。
对于初始状态 $x(0)=x_0$ 和任意非零向量 $v\in\mathbb R^d$，方向 $v$ 的 Lyapunov 指数定义为（若极限存在）

$$
\lambda(x_0,v)
:=\lim_{\tau\to+\infty}
\frac1\tau\log\left\|D_x\Phi_\tau(x_0)v\right\|.
\tag{11}
$$

其中 $D_x\Phi_\tau$ 是流映射相对于初始状态的雅可比矩阵，$\|\cdot\|$ 可以取 $\mathbb R^d$ 上任意范数。由于有限维空间所有范数等价，$\lambda$ 不依赖范数选择。Lyapunov 指数为负（正）意味着附近轨迹在 $\tau$ 时间下沿相应方向指数收缩（扩张）。

### 4.2 二阶导数与切向/法向分解

为了在数据流形附近沿不同方向定义 FM ODE 的 Lyapunov 指数，需要回顾凸分析中的二阶上图导数。对 $g:\mathbb R^d\to\overline{\mathbb R}$，令

$$
\operatorname{dom}g=\{z\in\mathbb R^d:g(z)<+\infty\}.
$$

取正常、下半连续凸函数 $f$，固定 $x\in\operatorname{dom}f$ 与
$v\in\partial f(x)$。**相对于 $v$，$f$ 在 $x$ 的二阶上图导数**定义为

$$
d^2f(x\mid v)(w)=
\liminf_{\substack{t\downarrow0\\w'\to w}}
\frac{f(x+tw')-f(x)-t\langle v,w'\rangle}{t^2/2}.
\tag{12}
$$

其取值允许为 $+\infty$，有效定义域为

$$
\operatorname{dom}d^2f(x\mid v)
=\{w:d^2f(x\mid v)(w)<+\infty\}.
$$

根据次梯度定义，若 $v\in\partial f(x)$，则对所有 $w$ 有
$d^2f(x\mid v)(w)\ge0$。

本文通过二阶上图导数识别切方向。如第 2 节所述，令 $\varphi$ 为 $P_1\to P_0$ 的 Aleksandrov–Brenier 势，固定 OT 样本对 $(x_1,x_0)$，满足 $x_0\in\partial\varphi(x_1)$。定义平移后的凸势

$$
f(\cdot):=\varphi(\cdot)-\langle x_0,\cdot\rangle.
\tag{13}
$$

于是 $0\in\partial f(x_1)$，即 $x_1$ 是 $f$ 的一个全局极小点。

理论分析对 $f$ 在 $x_1$ 处作出三个假设。记 $f|_\mathcal M$ 为 $f$ 在流形上的限制，$\operatorname{aff}(S)$ 为集合 $S$ 的仿射包。

**(A1)** $f|_\mathcal M$ 在 $x_1\in\mathcal M$ 的某邻域内为 $C^2$。

**(A2)** $\dim\operatorname{aff}(\partial f(x_1))=d-m$。

**(A3)** $0\in\operatorname{ri}(\partial f(x_1))$，其中 $\operatorname{ri}$ 表示在 $\operatorname{aff}(\partial f(x_1))$ 中取相对内部。

这些假设将凸势沿流形方向的光滑性（A1）与法向方向的尖锐变化相结合。A2 意味着次梯度的变化跨越整个法空间，编码了法向几何；A3 排除极点落在次梯度集合的边界/退化面上的情形。在 A1–A3 下，下一命题通过二阶上图导数的有效域确定切空间（证明见附录 B.5）。

**命题 4.1。** 在假设 A1、A2、A3 下，

$$
\operatorname{dom}d^2f(x_1\mid0)=T_{x_1}\mathcal M.
$$

即

$$
d^2f(x_1\mid0)(w)<+\infty
\quad\Longleftrightarrow\quad
w\in T_{x_1}\mathcal M.
$$

为简化记号，定义

$$
P_\lambda:=\operatorname{prox}_{\lambda f},
\qquad\lambda>0.
$$

下一个引理刻画近端算子的半导数（证明见附录 B.3）。

**引理 4.2。** 设 $f$ 正常、下半连续且凸，并有 $0\in\partial f(x_1)$。固定 $\lambda>0$ 和 $h\in\mathbb R^d$。若 $f$ 在 $x_1$ 相对于零向量二阶上图可微，则下列半导数存在：

$$
DP_\lambda(x_1;h):=
\lim_{\substack{\varepsilon\downarrow0\\h'\to h}}
\frac{P_\lambda(x_1+\varepsilon h')-P_\lambda(x_1)}
{\varepsilon}.
$$

它是以下强凸优化问题的唯一极小点：

$$
DP_\lambda(x_1;h)\in
\arg\min_{w\in\mathbb R^d}
\left\{
d^2f(x_1\mid0)(w)+
\frac1\lambda\|w-h\|^2
\right\}.
\tag{14}
$$

运用引理 4.2，可证明（见附录 B.6）：

**引理 4.3。** 记 $h_T$ 为 $h$ 在 $T_{x_1}\mathcal M$ 上的正交投影。在上述记号下：

(i) 任意 $h\in\mathbb R^d$ 都满足
$DP_\lambda(x_1;h)
=DP_\lambda(x_1;h_T)\in T_{x_1}\mathcal M$。

(ii) 若 $h\in N_{x_1}\mathcal M$，则
$DP_\lambda(x_1;h)=0$。

(iii) 若 $h\in T_{x_1}\mathcal M$，则
$DP_\lambda(x_1;h)=h+O(\sqrt\lambda)\|h\|$。

若 $\varphi$ 可微，这意味着 $P_\lambda$ 的雅可比在切空间上的作用为 $I_m+o(1)$，在法空间上为零。引理 4.2 把这一雅可比性质扩展到不可微的势函数，对流形学习至关重要：近端算子在保留沿流形方向光滑性的同时，有效滤除势函数曲率的奇异性。

### 4.3 终端 Lyapunov 指数

关于终端时间调度，作如下假设。

**(SC)** $\alpha_t$ 和 $\beta_t$ 为 $C^1$ 曲线，存在 $\gamma>0$，使

$$
(1-t)\frac{\dot\alpha_t}{\alpha_t}\to-\gamma
\quad(t\to1),
$$

且 $t\to1$ 时 $\dot\beta_t$ 有界。

例如标准调度 $\alpha_t=C_\alpha(1-t)^\gamma$、
$\beta_t=C_\beta t^\eta$，$\gamma,\eta>0$，满足 (SC)。

为了研究终端行为，对时间变量做对数变换

$$
\tau:=-\log(1-t),\qquad
t=t(\tau)=1-e^{-\tau},\qquad
\frac{\mathrm dt}{\mathrm d\tau}=1-t.
$$

当 $t\to1$ 时，$\tau\to\infty$。定义
$u_\tau(x(\tau))=(1-t)v_{t(\tau)}(x(\tau))$，
则 OT-CFM 的重参数化动力学为

$$
x'(\tau)=u_\tau(x(\tau)),
$$

上方撇号代表对 $\tau$ 求导。

固定 OT 样本对 $(x_1,x_0)$，考虑轨迹
$x_t=\alpha_tx_0+\beta_tx_1$。记
$\lambda_t=\alpha_t/\beta_t$ 并定义

$$
Q_t(x_t):=
\operatorname{prox}_{\lambda_t\varphi}(x_t/\beta_t)
=\operatorname{prox}_{\lambda_t\varphi}(x_1+\lambda_t x_0).
$$

由于 $f$ 是 $\varphi$ 按式 (13) 平移得到的势，存在恒等关系

$$
\operatorname{prox}_{\lambda f}(x_1)
=\operatorname{prox}_{\lambda\varphi}(x_1+\lambda x_0),
$$

因此有

$$
DQ_t(x_t;\xi)=DP_{\lambda_t}(x_1;\xi/\beta_t).
\tag{15}
$$

下列定理是全文关于 Lyapunov 指数的主要结果。

**定理 4.4（Lyapunov 指数）。** 假设时间调度满足 (SC)。固定 OT 样本对 $(x_1,x_0)$，并假设以 Aleksandrov–Brenier 势 $\varphi$ 构造的平移势
$f=\varphi-\langle x_0,\cdot\rangle$
在 $x_1$ 满足 (A1)、(A2)、(A3)，并在 $(x_1\mid0)$ 二阶上图可微。令 $\Phi_\tau$ 为重参数化动力学
$x'(\tau)=u_\tau(x(\tau))$ 的流映射。对收敛到 $x_1$ 的轨迹，其终端 Lyapunov 指数满足

$$
\lambda(v)=-\gamma,\qquad
v\in N_{x_1}\mathcal M\setminus\{0\};
$$

$$
\lambda(v)=0,\qquad
v\in T_{x_1}\mathcal M\setminus\{0\},
$$

其中
$\lambda(v)=\lim_{\tau\to\infty}\tau^{-1}
\log\|D\Phi_\tau(x_0)v\|$。
因此 $\mathcal M$ 是法向收缩率为 $\gamma$ 的**法向双曲吸引子**。

**证明。** 令 $\xi(\tau)=D\Phi_\tau(x_0)v$。由半导数定义可知 $\xi$ 满足方向变分方程

$$
\xi'(\tau)=Du_\tau(x(\tau);\xi(\tau)),
\qquad \xi(0)=v.
\tag{16}
$$

对式 (10) 沿 $\xi$ 求半导数，得

$$
\begin{aligned}
Du_\tau(x(\tau);\xi)
=(1-t)\Bigg\{&
\frac{\dot\alpha_t}{\alpha_t}\xi\\
&+\beta_t\left(
\frac{\dot\beta_t}{\beta_t}
-\frac{\dot\alpha_t}{\alpha_t}\right)
DQ_t(x(\tau);\xi)
\Bigg\}.
\end{aligned}\tag{17}
$$

**情况 1：$v\in N_{x_1}\mathcal M\setminus\{0\}$。**
因为初始扰动 $\xi(0)=v$ 为法向向量，由引理 4.3(ii) 与式 (15)，
$DQ_t(x(\tau);\xi(0))=0$。于是 ODE (16) 的解始终留在法空间中。将式 (16)、(17) 投影到法空间，并利用引理 4.3(i) 给出的 $DQ_t\in T_{x_1}\mathcal M$，得到

$$
\xi'(\tau)=a(t)\xi(\tau),\qquad
a(t):=(1-t)\frac{\dot\alpha_t}{\alpha_t}.
$$

因此

$$
\|\xi(\tau)\|
=\exp\left(\int_0^\tau a(t(s))\,\mathrm ds\right)\|v\|,
$$

$$
\frac1\tau\log\|\xi(\tau)\|
=\frac1\tau\log\|v\|
+\frac1\tau\int_0^\tau a(t(s))\,\mathrm ds.
$$

由 (SC)，$a(t)$ 有界且 $a(t(\tau))\to-\gamma$，其 Cesàro 平均同样收敛到 $-\gamma$，从而

$$
\lambda(v)=\lim_{\tau\to\infty}
\frac1\tau\log\|\xi(\tau)\|=-\gamma.
$$

**情况 2：$v\in T_{x_1}\mathcal M\setminus\{0\}$。**
此时解保持在切空间内。由引理 4.3(iii) 和式 (15)，有
$DQ_t(x(\tau);\xi)=\xi/\beta_t+o(\|\xi\|)$。
因此

$$
\xi'(\tau)=c(\tau)\xi(\tau)+\delta(\xi),
$$

其中

$$
c(\tau)
=(1-t)\frac{\dot\alpha_t}{\alpha_t}(1-\beta_t)
+(1-t)\dot\beta_t=o(1),
$$

以及 $\delta(\xi)=o(\|\xi\|)$。
因此存在 $r(\tau)=o(1)$，使当 $\tau\to\infty$ 时，

$$
\|\xi'(\tau)\|
\le|c(\tau)|\|\xi\|+\|\delta(\xi)\|
\le r(\tau)\|\xi\|.
$$

利用

$$
\left|\frac{\mathrm d}{\mathrm d\tau}
\log\|\xi(\tau)\|\right|
=\frac{|\langle\xi(\tau),\xi'(\tau)\rangle|}
{\|\xi(\tau)\|^2}
\le r(\tau),
$$

再对其采用与情况 1 相同的 Cesàro 平均论证，即得

$$
\lim_{\tau\to\infty}
\frac1\tau\log\|\xi(\tau)\|=0.
$$

证毕。

定理 4.4 说明：切向扰动的 Lyapunov 指数为零，既不指数扩张也不指数收缩；法向扰动的 Lyapunov 指数为负，以 $O(e^{-\gamma\tau})$ 的速率收缩。这意味着 OT-CFM 动力学受到扰动时，数据流形的结构仍可保持。

这一结果与 Chandramoorthy 和 De Clercq [2025] 对扩散模型的稳定性分析一致。该研究指出，如果切向 Lyapunov 指数占主导地位，动力学中的流形结构便具有稳定性，并在实验中验证扩散模型具有该性质。Li 等 [2025]、Liu 等 [2025] 分别研究得分函数在切向与法向的展开，推得流形切向指数为零、法向指数为负。本文结果与这些观察相符，说明两类生成动力学在低维数据流形附近具有相似的稳定行为。


## 5. 相关工作

**扩散模型与流形假设。** 一些近期研究讨论了流形假设下扩散模型的行为。Pidstrigach [2022] 推导了基于得分的扩散模型能够采样低维数据流形的充分条件。Oko 等 [2023] 证明，在训练样本数较大的渐近情形下，学习目标分布的收敛速率由流形的内禀维数、而非环境空间的维数决定。除了第 4 节末尾讨论的研究，低维子空间上的扩散动力学也获得了理论分析。Chen 等 [2023] 讨论相应情形，将扩散动力学分解成子空间分量及其正交补分量。Wang 等 [2025] 证明，扩散模型会通过对得分估计聚类，隐式但可证明地恢复底层子空间结构。相比这些面向扩散模型的成果，FM 在流形假设下的类似分析仍然有限。

**流匹配与近端视角。** FM 经常采用更好的耦合，特别是小批量 OT，以降低方差并拉直轨迹 [Pooladian 等，2023；Tong 等，2024]。本文通过 OT-CFM 的凸分析刻画补充了这一研究路线，使得针对流形支撑目标的动力学稳定性分析成为可能。所提出框架不能直接应用于 Rectified Flow [Liu 等，2023]，这一问题留待未来研究。

注意本文使用近端算子的方式，区别于通常的有限步近端迭代。后者包括把 Schrödinger 桥/熵正则 OT 看作 KL 近端迭代 [Léonard，2014；Cuturi，2013]，以及经典近端算法 [Parikh 与 Boyd，2014]。

与本文最接近的是最优流匹配（Optimal Flow Matching，OFM）[Kornilov 等，2024]。该方法利用凸势提出单步学习直线轨迹（$P_0\to P_1$）的途径。尽管 OFM 的流反演在数学上等价于近端算子，该工作并未明确采用近端或去噪器视角。与之相比，本文为反向映射（$P_1\to P_0$）提供理论基础，建立 OT-CFM 的显式近端去噪器解释。更重要的是，这一结构被用于通过 Lyapunov 指数证明低维流形上的终端稳定性，而 Kornilov 等 [2024] 并未进行这一几何分析。

## 6. 实验

### 玩具数据示例

本文在 Circle（圆环，图 3）和 Two Moons（双月，图 4）两个数据集上训练标准小批量 OT-CFM。圆环的目标分布 $P_1$ 在 $S^1$ 上均匀分布；双月的目标分布则位于对应的两条曲线上。

左侧图像展示由多层感知机（MLP）学习的向量场，训练批量大小为 512。作者使用匈牙利算法（Hungarian algorithm）将来自 $\mathcal N(0,I_2)$ 的源样本与目标均匀样本作最优配对。两个实验都表明，训练后的向量场在目标流形附近近似沿法向，指向流形。

右侧图像统计了 100 个不同初始点沿流轨迹得到的 $D_xv_t(x_t)$ 两个特征值，在不同 $t$ 下的均值与标准差。当 $t\to1$ 时，两类值明显分离，分别趋向
$\lambda_1=0$ 与 $\lambda_2=-\gamma=-1$，与定理 4.4 一致。

需要注意，Two Moons 是**带边界的流形**；第 4 节理论对其边界不一定适用。因此图 4 在这部分只是经验观察，不属于定理适用性的直接证明。

**图 3｜圆环数据。** 左：神经网络在 $t=0.9$ 学到的 OT-CFM 向量场，呈现指向流形的吸引作用。右：在多条流轨迹上统计 $(1-t)D_xv_t$ 的特征值均值及其随时间的变化。第二个特征值方差较小，因此终端 Lyapunov 指数也接近理论预测的 −1。

**图 4｜双月数据。** 左：向量场；右：雅可比特征值。设置与图 3 类似。

### MNIST 实验

本文使用小批量大小为 256 的 OT-CFM 在 MNIST 图像上训练。图 5 给出所得流映射 $\Phi_{\tau(t)}$ 的导数的特征分解。图的中排展示从第 1、20、40、80 到第 160 个特征向量方向；下排展示沿相应方向扰动生成图像后的结果。作者观察到，前约 80 个特征方向的扰动仍产生接近原数据流形的图像，而沿第 160 个特征方向扰动会产生明显噪声。

图 6 则展示两张 MNIST 数字图像对应于 $t=0.98$ 的 $(1-t)D_xv_t(x_t)$ 雅可比特征值。排序后的特征谱存在明显间隙：约 100 个特征值显著大于其余特征值。图中的 P1 与 P100 表示按特征值降序取第 1 与第 100 个特征向量，把它们分别加到生成的 $x_1$ 以形成扰动图像。实验结果提示，接近零特征值的特征子空间对应构成 MNIST 图像流形的切向方向。

**图 5｜OT-CFM 图像生成及雅可比特征方向。** 上排：OT-CFM 生成结果；中排：向量场 $v_t(x)$ 雅可比的第 1、20、40、80、160 个特征值所对应的特征向量（按特征值降序）；下排：沿中排方向扰动后的图像。

**图 6｜MNIST 数字“4”和“7”的雅可比特征值。** 上排：标准高斯噪声 $x_0$、由 $x_0$ 生成的 $x_1$、沿 P1/P100 特征向量扰动的图像。下排：$t=0.98$ 时，$(1-t)D_xv(x_t)$ 降序排列的特征值。

## 7. 结论

本文为基于 OT 的条件流匹配建立了近端算子框架。通过使用 Aleksandrov–Brenier 势表述二次代价 OT，即使目标分布不具有密度，也可以得到插值映射的逆及 FM 向量场的**精确欧氏近端表达式**。

这一框架还为扩散模型和 Schrödinger 桥等其他生成模型提供了（近似的）近端视角。进一步利用二阶上图导数，在流形假设下建立终端 Lyapunov 理论：证明法向指数收缩、切向动力学呈中性。

虽然主要分析采用总体 OT，本文还讨论了小批量 OT 如何产生有限样本势函数，以及这些势函数的收敛如何蕴含相关近端去噪器的收敛，从而将理论与实际 OT-CFM 训练联系起来。

### 致谢

Kenji Fukumizu 的研究部分获得 JST CREST JPMJCR2015 和 JSPS 学术变革领域研究（A）22H05106 支持；Wei Huang 获得 JSPS KAKENHI 24K20848 和 JST BOOST JPMJBY24G6 支持；Han Bao 获得 JST PRESTO JPMJPR24K6 支持。
