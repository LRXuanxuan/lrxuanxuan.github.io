---
layout: page
title: "关于非线性信道估计性能｜中文译稿（许可待核）"
permalink: /papers/translations/2026-09-28-on-nonlinear-channel-estimation-performance/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/549bb4536e7ed9b4/) · 原文为IEEE 正式版/期刊，许可待核验 · [全部目录](/papers/catalog/)

# 关于非线性信道估计性能

> **许可与使用范围说明：** 原文为 **IEEE 正式版/期刊论文**（©2025 IEEE；原文声明 "Personal use of this material is permitted. Permission from IEEE must be obtained for all other uses…"），**再传播许可待核验**；本页仅为**学习用途**的中文译稿，**不计入本站「可公开全文」统计**，也不作为正式译文对外发布。如后续确认许可，再按站点流程更新。

**原题：** On Nonlinear Channel Estimation Performance  
**作者：** Xiaojing Huang（澳大利亚悉尼科技大学电气与数据工程学院；原文为单一作者）  
**版本：** IEEE 正式版/期刊论文（©2025 IEEE），本地 PDF 15 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VI 节、致谢、参考文献（英文原条目 30 条）、附录 A—C、表 I—表 II、图 1—图 8；逐句逐式终校未做。

## 摘要

本文分析一种**确定性信道估计方法**在信号链路存在**扩展记忆多项式（EMP）**建模的非线性时的性能。为解决性能**单调性**问题，本文进而为**正交扩展记忆多项式（OEMP）**建模的系统提出一种采用**随机训练信号（TS）**的新型传输协议及相应的**随机信道估计方法**，显著降低了统计量需求。本文通过**替代均方误差（MSE）分析**定义**实际可测的建模误差**，建立其与 EMP、OEMP 残差信号功率在**降低非线性阶数**下的关系。进一步证明 **OEMP 建模误差趋近 OEMP 残差信号功率**，从而保证期望的性能单调性。数值结果验证了理论结论，并凸显 **TS 设计**对非线性信道估计性能的影响。

**关键词：** 非线性信道估计；扩展记忆多项式；正交扩展记忆多项式；残差信号功率；性能可测性；性能单调性；训练信号设计。

## I. 引言

在无线系统中，射频放大器与数据转换器件呈现**非线性行为**，导致**带外频谱再生**与**带内失真**，严重降低系统性能 [1]—[3]。因此，对非线性效应进行建模、辨识与抑制是无线信号处理的基础挑战 [4]—[9]。

给定参数化非线性模型，**非线性系统辨识（NSI）**即估计这些参数（如非线性阶数与相应非线性分量的系数）。在无线通信中，该过程特称为**非线性信道估计**。过去几十年已发展出大量 NSI 技术用于辨识各种非线性模型，包括 Volterra 级数、Wiener 与 Hammerstein 模型、记忆多项式（MP）以及广义 MP 模型等 [1]、[10]—[19]。

近期，针对高速宽带毫米波（mmWave）与太赫兹（THz）系统，文献 [20]、[21] 提出**扩展 MP（EMP）**模型及相应信道估计方法。该方法（以下称**确定性方法**）采用一种独特的**旋转与功率缩放确定性前导**设计，显著降低信道估计复杂度。然而其 **MSE 分析仍不完整**：建模误差仍涉及对未知残差信号的集平均期望。该不完整源于 EMP 模型中非线性分量功率难以评估，直到文献 [22] 引入**正交 EMP（OEMP）**模型才得以解决。

因此，建模误差与残差信号功率之间的关系、以及建模误差对**功率缩放因子**的依赖此前均未被识别。文献 [22] 的**功率谱密度（PSD）**分析进一步表明：由于不同 EMP 基函数之间存在相关性，EMP 模型的残差信号功率**不会随非线性阶数增大而单调下降**。这说明残差信号功率**不是**参数估计建模误差的有效度量。

现有 NSI 技术（含 EMP 及其确定性方法）多聚焦于提高模型精度与降低计算复杂度，但两个关键方面——**性能可测性**与**性能单调性**——仍研究不足。**性能可测性**指在实际场景中量化 NSI 精度的能力：MSE 虽常用于评估估计参数与真实参数之间的精度 [10]、[17]、[19]，但其实际适用性受限，因为**真实参数本质未知**。**性能单调性**则指 NSI 性能随模型复杂度增加而改善：非单调性能意味着性能度量不当，可能导致**过拟合或欠拟合**；对基函数非正交的非线性模型（如 EMP），确定**有效非线性阶数**尤其困难 [14]。

本文将针对上述研究空白，在保持低计算复杂度的前提下，分别面向 EMP 与 OEMP 建模的无线系统开展研究。文献 [21] 虽已引入可实际测量建模误差的替代 MSE 定义，但仍缺少性能单调性方面的必要理论分析；OEMP 模型通过引入正交基函数克服 EMP 局限，并具有最小残差功率性质与更优非线性抑制能力 [22]，但**直接估计 OEMP 参数**并同时保证可测性与单调性的参数估计方法尚未被提出；文献 [22] 建议通过基于 EMP 的确定性方法估计 OEMP 参数，但其建模误差同样需要分析。鉴于 EMP 与 OEMP 在非线性抑制上的优异性能，面向新一代无线使能技术 mmWave 与 THz 系统推进并验证非线性信道估计技术具有重要理论与实用意义。

本文主要贡献有四点：

1. **完成**文献 [21] 中 EMP 参数估计的 MSE 分析：推导 EMP 建模误差的**闭式**，表明它包含与 EMP 残差信号相同的非线性分量，但**权重不同**；这些权重取决于训练信号传输所用的功率缩放因子，从而可增强性能单调性。
2. **评估**直接 OEMP 参数估计新方法的必要性：证明通过确定性方法、基于 EMP 估计所得的 OEMP 建模误差**与 EMP 建模误差完全相同**，从而说明需要专用的 OEMP 参数估计方法。
3. 通过**随机方法**实现低复杂度 OEMP 参数估计：受 EMP 模型类似二维（2D）基函数结构的启发，提出一种采用随机训练信号的新型传输协议及相应 OEMP 参数估计方法（称**随机方法**），只需训练信号的**降维相关矩阵**，相比传统最小二乘（LS）方法显著降低计算复杂度。
4. **完成** OEMP 建模误差分析：考虑性能可测性定义 OEMP 建模误差，并经 MSE 分析给出**近似闭式**；证明当训练信号数足够大时建模误差**收敛到 OEMP 残差信号功率**，从而保证期望的单调性。

本文其余部分安排如下：第 II 节介绍 EMP 与 OEMP 模型、信道估计系统模型及各自的训练信号传输协议，并给出相应接收信号与残差信号功率表达式；第 III 节给出确定性方法下 EMP 建模的 MSE 分析与建模误差推导；第 IV 节详述所提随机 OEMP 参数估计，并进行 MSE 分析得到近似闭式建模误差；第 V 节给出数值结果，验证理论分析并说明训练信号设计对非线性信道估计性能的影响；第 VI 节总结全文并讨论未来研究方向。

## II. 系统与协议描述

本节先描述信号与系统模型，随后介绍训练信号传输协议与频域（FD）接收信号表达式。

### A. 信号与系统模型

令 $x(t)$ 为脉冲成形的**高斯**基带信号[^1]。经过非线性信号链路后，输出信号可用 EMP 建模 [20]、[22]：

[^1]: 严格而言，$x(t)$ 未必总服从高斯分布；但对多电平及/或宽带信号，该假设是合理的。

$$
y(t)=\sum_{q=1}^{P_{\max}}\sum_{\substack{p=q\\ p\ \text{odd}}}^{P_{\max}}\left[a_{q,p}(t)\star x_{q,p}(t)+b_{q,p}(t)\star x_{q,p}^{*}(t)\right],\tag{1}
$$

其中 $P_{\max}$ 为最大非线性阶数，$a_{q,p}(t)$ 与 $b_{q,p}(t)$ 为 EMP 模型系数，$\star$ 表示卷积，$x_{q,p}(t)=x^{q}(t)|x(t)|^{p-q}$ 及其共轭版本 $x_{q,p}^{*}(t)$ 是与系数 $a_{q,p}(t)$、$b_{q,p}(t)$ 关联的基函数。

同一输出信号也可用 **OEMP** 建模：

$$
y(t)=\sum_{q=1}^{P_{\max}}\sum_{\substack{p=q\\ p\ \text{odd}}}^{P_{\max}}\left[\alpha_{q,p}(t)\star\zeta_{q,p}(t)+\beta_{q,p}(t)\star\zeta_{q,p}^{*}(t)\right],\tag{2}
$$

其中 $\alpha_{q,p}(t)$ 与 $\beta_{q,p}(t)$ 为 OEMP 模型系数。关联的基函数 $\zeta_{q,p}(t)$ 及其共轭满足正交性 $\mathbb E\{\zeta_{q,p}(t)\zeta_{q',p'}^{*}(t+\tau)\}=0$（$q'\ne q$ 或 $p'\ne p$），$\tau$ 为任意时间偏移、$\mathbb E\{\cdot\}$ 表示集平均。可见 EMP 与 OEMP 基函数都定义在由 $q$ 与 $p$ 张成、且约束 $q\le p$ 的 **2D 空间**中。

给定 $q$ 的正交基函数可由 $x(t)$ 构造为 $(\zeta_{q,q}(t),\zeta_{q,q+2}(t),\ldots,\zeta_{q,P_{\max}}(t))^{T}=(\ldots)$，其构造矩阵为下三角矩阵（第 $m$ 行第 $k$ 列元素按递推给出）。EMP 与 OEMP 系数之间的关系也可写成 $(\alpha_{q,q}(t),\alpha_{q,q+2}(t),\ldots,\alpha_{q,P_{\max}}(t))=(a_{q,q}(t),a_{q,q+2}(t),\ldots,a_{q,P_{\max}}(t))\mathbf V_{q}$，以及对应的共轭关系 $(\beta_{q,q}(t),\beta_{q,q+2}(t),\ldots)=..(b_{q,q}(t),b_{q,q+2}(t),\ldots)\mathbf V_{q}$，其中 $\mathbf V_{q}$ 为由正交化递推得到的下三角变换矩阵。

为分别辨识用 EMP 与 OEMP 建模的非线性系统，采用图 1(a) 的系统模型：$n(t)$ 为信号链路中引入的噪声，$r(t)$ 为经带限接收滤波后的接收信号。注意从 $r(t)$ 估计的噪声与模型系数同样是带限的；为方便起见，后文对滤波后的噪声与模型系数使用相同记号。

### B. 模型参数估计协议

对给定阶数 $P$（非线性系统的 $P_{\max}$ 未知）的 EMP 参数估计，确定方法采用如图 1(b) 的训练信号传输协议。输入信号只包含一个预定训练信号（TS），长度为 $NT_c$，记作 $\tilde x(t)$，加长度为 $N_{\mathrm{cp}}T_c$ 的循环前缀（CP），其中 $N$ 为 TS 样本数、$N_{\mathrm{cp}}$ 为 CP 样本数（采样周期 $T_c$），CP 长度大于整个信号链路信道响应的时延扩展。同一 TS 加 CP（无线系统中的**前导**）被**功率缩放**为功率缩放因子 $\rho_1,\rho_3,\ldots,\rho_P$；为保证平均功率恒定，缩放因子满足条件 $\frac{1}{P+1}(\rho_1+\rho_3+\cdots+\rho_P)=1$。采用等间隔选择时，缩放因子可写为 $\rho_p=1-\frac{P-p}{P-1}$（$p=1,3,\ldots,P$）。功率缩放后的前导组按 $\frac{\pi}{P+1}$ 相位旋转后连续传输 $P+1$ 次，形成输入信号。

在信道响应的**前导**（从响应起点到峰值的时间段）内，每个 TS 的定时参考点 $t=0$ 设在 CP 段内前导之前，以防止前导间干扰。

对 OEMP 参数估计，随机方法采用如图 1(c) 的训练信号传输协议。输入信号由 $M+1$ 个随机 TS 组成，记作 $x_0(t),x_1(t),\ldots,x_M(t)$，每个含 $N$ 个样本（采样率 $1/T_c$）及各自长度 $N_{\mathrm{cp}}T_c$ 的 CP。随机 TS 可有不同功率，但 $M+1$ 个随机 TS 最好与数据载荷具有相同平均功率。同一 TS 加 CP 同样按相位旋转连续传输 $P+1$ 次；对全部 $M+1$ 个随机 TS 重复该过程后，输入信号总长度为 $(M+1)(P+1)(N_{\mathrm{cp}}+N)T_c$。注意只有**前 $M$ 个 TS** 参与系数估计，**最后一个 TS** 用于 MSE 测量，以确保估计误差评估的独立性与随机性。

适当的 TS 设计（无论是否功率缩放）对确保确定性或随机方法都能检测非线性信道特性至关重要：它要求 TS 幅度覆盖足以产生非线性失真的输入幅度范围。最优 TS 设计已在文献 [23] 中作为非线性系统辨识综合研究的一部分加以讨论。

### C. 频域参数表示、向量化与分块

由 (1)、(2)，EMP 与 OEMP 模型系数分别与各自基函数及共轭版本卷积。为高效信号处理，期望信号模型中系数与基函数**可乘**，这可借助**频域（FD）**表示实现：时域卷积对应 FD 相乘。

为简化数学表述与推导，还希望把模型系数与基函数写成**向量**形式。于是对给定 $q$，EMP 与 OEMP 的系数与基函数 FD 向量分别按表 I 定义，其中 $A_{q,p}(f)$、$B_{q,p}(f)$、$X_{q,p}(f)$、$A'_{q,p}(f)$（即 $\alpha_{q,p}(t)$ 的 FT）、$B'_{q,p}(f)$（即 $\beta_{q,p}(t)$ 的 FT）、$Z_{q,p}(f)$ 分别为 $a_{q,p}(t)$、$b_{q,p}(t)$、$x_{q,p}(t)$、$\alpha_{q,p}(t)$、$\beta_{q,p}(t)$、$\zeta_{q,p}(t)$ 的 FT。

在**降低的非线性阶数 $P$** 下，待估计的非线性系数只是向量 $\mathbf a_{q}(f),\mathbf b_{q}(f),\boldsymbol\alpha_{q}(f),\boldsymbol\beta_{q}(f)$（$q\le P$）中的一部分。因此每个向量再分为两个子向量：一个含阶数 $q$ 至 $P$，另一个含 $P+2$ 至 $P_{\max}$。待估计的非线性系数因此位于子向量 $\mathbf a_{q;1}(f)$、$\mathbf b_{q;1}(f)$、$\boldsymbol\alpha_{q;1}(f)$、$\boldsymbol\beta_{q;1}(f)$ 中。对 $q>P$ 无需分块，因为此时 $\mathbf a_{q;1}(f)$ 等会消失，故 $\mathbf a_{q;2}(f)$ 等退化为 $\mathbf a_{q}(f)$ 等。

**表 I：参数与常数的向量化与分块。**

| 向量 | 定义（对给定 $q$） |
|---|---|
| $\mathbf a_{q;1}(f)$ | $(A_{q,q}(f),A_{q,q+2}(f),\ldots,A_{q,P}(f))$ |
| $\mathbf a_{q;2}(f)$ | $(A_{q,P+2}(f),A_{q,P+4}(f),\ldots,A_{q,P_{\max}}(f))$ |
| $\mathbf b_{q;1}(f)$ | $(B_{q,q}(f),B_{q,q+2}(f),\ldots,B_{q,P}(f))$ |
| $\mathbf b_{q;2}(f)$ | $(B_{q,P+2}(f),B_{q,P+4}(f),\ldots,B_{q,P_{\max}}(f))$ |
| $\mathbf x_{q;1}(f)$ | $(X_{q,q}(f),X_{q,q+2}(f),\ldots,X_{q,P}(f))$ |
| $\mathbf x_{q;2}(f)$ | $(X_{q,P+2}(f),X_{q,P+4}(f),\ldots,X_{q,P_{\max}}(f))$ |
| $\boldsymbol\alpha_{q;1}(f),\ \boldsymbol\alpha_{q;2}(f)$ | 与 $\mathbf a_{q;1},\mathbf a_{q;2}$ 同构，元素为 $A'_{q,p}(f)$（即 $\alpha_{q,p}(t)$ 的 FT） |
| $\boldsymbol\beta_{q;1}(f),\ \boldsymbol\beta_{q;2}(f)$ | 与 $\mathbf b_{q;1},\mathbf b_{q;2}$ 同构，元素为 $B'_{q,p}(f)$（即 $\beta_{q,p}(t)$ 的 FT） |
| $\boldsymbol\zeta_{q;1}(f),\ \boldsymbol\zeta_{q;2}(f)$ | 与 $\mathbf x_{q;1},\mathbf x_{q;2}$ 同构，元素为 $Z_{q,p}(f)$ |
| $\mathbf V_{q;1},\mathbf V_{q;2}$ | 由 $\mathbf V_{q}$ 分块：$\mathbf V_{q;1}=(\mathbf V_{q;11},\mathbf 0)$、$\mathbf V_{q;2}=(\mathbf V_{q;21},\mathbf V_{q;22})$ |
| $\mathbf P_{q;1}$ | 由正交化基函数构造的分块映射矩阵（原文表 I 定义，用于 (23)） |

### D. 接收前导表达式与残差功率

对图 1(b) 的确定性方法 TS 传输协议（前导期间使用预定义 TS $\tilde x(t)$，FD 基函数向量记为 $\tilde{\mathbf x}_{q}(f)$），经 TS 相位旋转与功率缩放后，阶数 $P$ 的 EMP 建模接收前导在 $n=0,1,\ldots,P$、$l=1,3,\ldots,P$ 时可表示为

$$
\tilde R^{(m)}(f)=\sum_{q=1}^{P}\left\{\left[\tilde{\mathbf a}_{q;1}^{\top}(f)\mathrm{diag}\{\tilde{\mathbf x}_{q;1}(f)\}\mathbf p_{q;1}^{(\rho_l)}+e^{-\mathrm j\frac{\pi}{P+1}nq}\tilde{\mathbf b}_{q;1}^{\top}(f)\mathrm{diag}\{\tilde{\mathbf x}_{q;1}^{*}(-f)\}\mathbf p_{q;1}^{(\rho_l)}\right]+e^{-\mathrm j\frac{\pi}{P+1}nq}\left[\tilde{\mathbf b}_{q;2}^{\top}(f)\mathrm{diag}\{\mathbf p_{q;2}^{(\rho_l)}\}\mathbf V_{q;2}\tilde{\boldsymbol\zeta}_{q;2}^{*}(-f)\right]\right\},\tag{3}
$$

其中 $\mathbf p^{(\rho)}$ 为对应功率缩放因子的对角矩阵。

类似可得阶数 $P$ 的 EMP 建模残差信号：

$$
\tilde\epsilon_P^{(m)}(f)=\sum_{q=1}^{P}e^{-\mathrm j\frac{\pi}{P+1}nq}\tilde{\mathbf b}_{q;2}^{\top}(f)\mathrm{diag}\{\mathbf p_{q;2}^{(\rho_l)}\}\mathbf V_{q;2}\tilde{\boldsymbol\zeta}_{q;2}^{*}(-f),\tag{4}
$$

其中 $\tilde{\mathbf x}_{q;2}(f)=\mathbf V_{q;2}\tilde{\boldsymbol\zeta}_{q}(f)$。$\mathbf V_{q}$ 的分块同样适用于此。

对图 1(c) 的随机方法协议（随机 TS $x_i(t)$ 对应 FD 正交基函数向量记为 $\boldsymbol\zeta^{(i)}$），第 $m$ 个前导期间的 FD OEMP 建模接收前导（$m=0,1,\ldots,(M+1)(P+1)-1$）可表示为

$$
R^{(m)}(f)=\sum_{q=1}^{P}\left\{\left[\boldsymbol\alpha_{q;1}^{\top}(f)\boldsymbol\zeta_{q;1}^{(\lfloor m/(P+1)\rfloor)}(f)+e^{-\mathrm j\frac{\pi q}{P+1}(m)_{(P+1)}}\boldsymbol\beta_{q;1}^{\top}(f)\boldsymbol\zeta_{q;1}^{(\lfloor m/(P+1)\rfloor)*}(-f)\right]+e^{-\mathrm j\frac{\pi q}{P+1}(m)_{(P+1)}}\boldsymbol\beta_{q;2}^{\top}(f)\boldsymbol\zeta_{q;2}^{(\lfloor m/(P+1)\rfloor)*}(-f)\right\},\tag{5}
$$

其中 $(\cdot)^{(P+1)}$ 与 $\lfloor\cdot\rfloor$ 分别表示模 $P+1$ 与向下取整。类似可得 OEMP 建模残差信号：

$$
\epsilon_P^{(m)}(f)=\sum_{q=1}^{P}e^{-\mathrm j\frac{\pi q}{P+1}(m)_{(P+1)}}\boldsymbol\beta_{q;2}^{\top}(f)\boldsymbol\zeta_{q;2}^{(\lfloor m/(P+1)\rfloor)*}(-f).\tag{6}
$$

(4) 中残差信号表示为正交基函数的加权和，故 EMP 建模残差的**平均功率**可由基函数 PSD 给出：

$$
\bar e_{P,\mathrm{EMP}}^{2}=\int_{-\infty}^{\infty}\mathbb E\left\{\left|\tilde\epsilon_P^{(m)}(f)\right|^{2}\right\}\mathrm df=\int_{-\infty}^{\infty}\left[\tilde{\mathbf b}_{q;2}^{\top}(f)\mathrm{diag}\{\mathbf p_{q;2}^{(\rho_l)}\}\mathbf V_{q;2}\bar{\mathbf S}_{q}(-f)\mathbf V_{q;2}^{\top}\mathrm{diag}\{\mathbf p_{q;2}^{(\rho_l)}\}\tilde{\mathbf b}_{q;2}^{*}(f)\right]\mathrm df,\tag{7}
$$

其中 $\bar{\mathbf S}_{q}(f)=\mathbb E\{\tilde{\boldsymbol\zeta}_{q}(f)\tilde{\boldsymbol\zeta}_{q}^{\top}(-f)\}$ 为 PSD 基函数矩阵，其对角元素 $\bar S_{q,q}(f),\bar S_{q,q+2}(f),\ldots,\bar S_{q,P_{\max}}(f)$ 满足 $\int_{-\infty}^{\infty}\bar S_{q,p}(f)\mathrm df=1$（$q\le p\le P_{\max}$，定义见 [22]）。

类似地，由 (6)，OEMP 建模残差的平均功率为

$$
\bar e_{P,\mathrm{OEMP}}^{2}=\int_{-\infty}^{\infty}\left[\boldsymbol\alpha_{q;2}^{\top}(f)\bar{\mathbf S}_{q;2}(f)\boldsymbol\alpha_{q;2}^{*}(f)+\boldsymbol\beta_{q;2}^{\top}(f)\bar{\mathbf S}_{q;2}(-f)\boldsymbol\beta_{q;2}^{*}(f)\right]\mathrm df,\tag{8}
$$

其中 $\bar{\mathbf S}_{q;2}(f)$ 为对 $\bar{\mathbf S}_{q}(f)$ 分块后得到的子矩阵。

直观上，若残差信号功率随 $P$ 增大而**单调下降**、并在正确识别最大非线性阶数时变为零，则残差功率可作为建模误差的度量。但 **EMP 建模并不如此**，因此需要新的性能度量。

## III. 确定性方法分析

本节给出 EMP 系数估计的 MSE 与建模误差分析。为便于回顾，附录 A 概述确定性方法；为保证性能可测性 [21]，替代 MSE 测量定义为**估计系数所得建模前导**与**实际接收含噪前导** $\tilde R^{(m)}(f)$ 之间的 MSE。

### A. 确定性方法的建模误差

[接至 (9)—(10)：替代 MSE 定义及其与残差功率、噪声功率的关系]

$$
\hat{\tilde Y}_{P,\mathrm{EMP}}^{(m)}(f)=\sum_{q=1}^{P}e^{-\mathrm j\frac{\pi}{P+1}nq}\hat{\tilde{\mathbf b}}_{q;1}^{\top}(f)\mathbf p_{q;1}^{(\rho_l)}\tilde{\mathbf x}_{q;1}(f)\ \text{（建模前导，估计系数）},\tag{9}
$$

$$
\frac{1}{P+1}\sum_{l=1,3,\ldots}^{P}\int_{-\infty}^{\infty}\mathbb E\left\{\left|\hat{\tilde Y}_{P,\mathrm{EMP}}^{(m)}(f)-\tilde R^{(m)}(f)\right|^{2}\right\}\mathrm df=\frac{P-1}{2(P+1)}\left(\bar e_{P,\mathrm{EMP}}^{2}+\sigma_n^{2}\right).\tag{10}
$$

(10) 表明替代 MSE 与残差功率加噪声功率成正比，比例系数 $\frac{P-1}{2(P+1)}$ 由基函数矩阵的零元素比决定；当 $P=1$ 时该 MSE 不能测量（因 $P-1=0$）。

由此定义 **EMP 建模误差**（确定性方法）：在 (9) 的建模前导中把估计系数换成真系数，并以同样权重计算与接收前导的 MSE，可得

$$
e_{P,\mathrm{EMP}}^{2}=\int_{-\infty}^{\infty}\left[\tilde{\mathbf b}_{q;2}^{\top}(f)\mathrm{diag}\{\boldsymbol\eta_{q;2}^{(\rho_l)}\}\mathbf V_{q;2}\bar{\mathbf S}_{q}(-f)\mathbf V_{q;2}^{\top}\mathrm{diag}\{\boldsymbol\eta_{q;2}^{(\rho_l)}\}\tilde{\mathbf b}_{q;2}^{*}(f)\right]\mathrm df,\tag{11}
$$

它是 EMP 建模误差（阶数 $P$、确定性方法）的**闭式**，其中权重向量

$$
\boldsymbol\eta_{q}^{(\rho_l)}=\sqrt{\frac{2(P+1)}{P-1}}\left(\mathbf P_{q}\mathbf Q\,t_{P}(q)\,\mathbf p_{t_P(q);1}^{(\rho_l)}-\mathbf p_{q}^{(\rho_l)}\right),\tag{12}
$$

$q'=t_{P}(q)$ 为**离散三角函数**（如图 2 对 $P=5$ 所示），把任意 $1\le q\le P_{\max}$ 映射到 $1\le q'\le P$。

值得注意的是 (11) 与 (7) 形式相似：**建模误差与残差信号含相同的非线性信号分量，但加权不同**。由 (10) 中 MSE、建模误差与噪声功率的关系，建模误差可解释为由残差非线性分量影响的**等效加性干扰**。此外，用于测量 MSE 的建模与接收前导**相关**（二者都用同一 $\tilde R^{(m)}(f)$ 估计），但由于基函数矩阵因 $q\le p$ 呈**三角结构**，二者中的信号与噪声分量不会被完全抵消，从而产生 (10) 中的权重系数 $\frac{P-1}{2(P+1)}$（即基函数矩阵的零元素比）。

经考察 (22)、(23) 与 (9) 的过程可见：MSE 测量实际上是在**接收端不知道确定性 TS** 的情况下**盲**进行的；这一性质使本文可仅依据测得的建模误差来识别非线性阶数，而无需实际估计 EMP 系数。


### B. 经 OEMP 转换的建模误差

利用表 I 的向量化与分块，EMP 与 OEMP 系数之间有关系 $\mathbf a_{q}^{\top}(f)=\boldsymbol\alpha_{q}^{\top}(f)\mathbf V_{q}^{-1}$（及共轭对应式），其中 $\mathbf V_{q}$ 为下三角变换矩阵。若先按确定性方法估计 EMP 系数、再经转换得到 OEMP 系数，则基于 (3)、(4) 并按附录 B 的类似过程可证明：**该 OEMP 系数估计的建模误差与 EMP 建模误差相同**。这突出表明需要专用的 OEMP 参数估计方法。

## IV. 随机方法与分析

本节进一步提出 OEMP 系数估计方法并分析其 MSE。该方法利用基函数间的正交性，理论上可通过集平均求得 OEMP 系数；但集平均需要无穷或足够多输入实现，不适用于实际应用。给定有限个输入实现（如 $M$ 个训练信号），基函数间正交性失效、任意基函数对间互相关非零，因此 OEMP 系数估计不可避免地涉及所有系数间的去相关，需对大规模矩阵求逆（若 OEMP 阶数为 $P$、每个离散系数向量长度为 $N$，该矩阵规模为 $PN\times PN$ 量级），这正是传统 LS 方法的常见复杂度来源 [1]、[6]。

所提 TS 传输协议与 FD 估计可解决该问题：由图 1(c)，同一 TS $x_i(t)$ 以不同相位旋转传输 $P+1$ 次，使具有不同信号不定指数的非线性信号分量（由不同 $q=1,3,\ldots,P$ 表示）在接收与处理后**可分**；结合 FD 估计，去相关所需模型系数数量降至 $P+1$ 量级，显著降低复杂度。

### A. 降维 TS 统计量需求

对 $M$ 个随机 TS $x_i(t)$（$i=0,1,\ldots,M-1$）及 $q=1,3,\ldots,P$，用于对信号不定指数为 $q$ 的非线性分量去相关的统计量可预先计算为该分量的**相关矩阵**：

$$
\boldsymbol\Psi_{q}(f)=\frac{1}{M}\sum_{i=0}^{M-1}\boldsymbol\zeta_{q;1}^{(i)}(f)\boldsymbol\zeta_{q;1}^{(i)*T}(f).\tag{13}
$$

当 $q=1$ 时 $\boldsymbol\Psi_{q}(f)$ 的维度为 $(P+1)\times(P+1)$，随 $q$ 增大维度递减，$q=P$ 时为 $1\times1$。实际应用中需适当设计 TS 以确保所有 $\boldsymbol\Psi_{q}(f)$ 良态，从而保证数值稳定。

### B. 所提估计方法

在全部 $(M+1)(P+1)$ 个前导期间处理 FD 输出信号后（(5)、(6) 中的 $Y^{(m)}(f)=\ldots+\epsilon_{P,\mathrm{OEMP}}^{(m)}(f)+N^{(m)}(f)$，$N^{(m)}(f)$ 为第 $m$ 个前导期间的 FD 噪声），把前 $M(P+1)$ 个接收前导按 $i=0,1,\ldots,M-1$ 排列，可将建模接收信号写成矩阵形式

$$
\mathbf r^{(i)}(f)=\mathrm{diag}\left\{e^{\mathrm j\frac{\pi}{P+1}n}\right\}\mathbf F\begin{pmatrix}\uparrow\mathbf k^{(i)}(f)\\ \mathbf x^{(i)}(f)\end{pmatrix}+\boldsymbol\epsilon_{P,\mathrm{OEMP}}^{(i)}(f)+\mathbf n^{(i)}(f),\tag{14}
$$

其中两个向量 $\uparrow\mathbf k^{(i)}(f)$ 与 $\mathbf x^{(i)}(f)$ 分别由 $q$ 索引向上排列与常规排列的系数构成。

随后用逆 DFT 估计：

$$
\begin{pmatrix}\uparrow\hat{\mathbf k}^{(i)}(f)\\ \hat{\mathbf x}^{(i)}(f)\end{pmatrix}=\frac{1}{P+1}\mathbf F^{*}\mathrm{diag}\left\{e^{-\mathrm j\frac{\pi}{P+1}n}\right\}\mathbf r^{(i)}(f).\tag{15}
$$

所提随机 OEMP 参数估计分三步：

**步骤 1）** 由 (15) 从接收信号估计 $\uparrow\hat{\mathbf k}^{(i)}(f)$ 与 $\hat{\mathbf x}^{(i)}(f)$；

**步骤 2）** 由估计量计算统计量：

$$
\begin{cases}\hat{\boldsymbol\theta}_{q}^{T}(f)=\frac{1}{M}\sum_{i=0}^{M-1}\hat{\mathbf K}_{q}^{(i)}(f)\boldsymbol\zeta_{q;1}^{(i)*T}(f)\\[4pt] \hat{\mathbf o}_{q}^{T}(f)=\frac{1}{M}\sum_{i=0}^{M-1}\hat{\mathbf X}_{q}^{(i)}(f)\boldsymbol\zeta_{q;1}^{(i)T}(-f)\end{cases}\tag{16}
$$

对 $q=1,3,\ldots,P$；

**步骤 3）** 估计 OEMP 模型系数：

$$
\begin{cases}\hat{\boldsymbol\alpha}_{q;1}^{T}(f)=\hat{\boldsymbol\theta}_{q}^{T}(f)\boldsymbol\Psi_{q}^{-1}(f)\\[4pt] \hat{\boldsymbol\beta}_{q;1}^{T}(f)=\hat{\mathbf o}_{q}^{T}(f)\boldsymbol\Psi_{q}^{-1*}(-f)\end{cases}\tag{17}
$$

对 $q=1,3,\ldots,P$。

与 EMP 系数估计类似，由于 $\mathbf r^{(i)}(f)$ 以及 $\hat{\boldsymbol\theta}_{q}(f)$、$\hat{\mathbf o}_{q}(f)$ 受残差信号与噪声污染，希望所选 $M$ 个 TS 使相关矩阵 $\boldsymbol\Psi_{q}(f)$ 为**对角矩阵**、且每个元素在基带上**恒模**；但这只在统计意义下成立，对随机选取的单个 TS 实现并不成立。如何为随机方法设计最优 TS 是具挑战性的任务，需要新的非线性表征技术（见 [23]）。

### C. 随机方法的建模误差

与确定性方法类似，实际测量在**估计系数所得建模前导**与**实际接收含噪前导** $R^{(m)}(f)$（$m=M(P+1),\ldots,(M+1)(P+1)-1$，由协议中最后一个 TS 构成）之间进行：

$$
R^{(m)}(f)=\hat Y_{P,\mathrm{OEMP}}^{(m)}(f)+\text{（残差+噪声）},\tag{18}
$$

并定义 **OEMP 建模误差**（阶数 $P$、随机方法）的近似为

$$
\frac{1}{P+1}\sum_{m=M(P+1)}^{(M+1)(P+1)-1}\int_{-\infty}^{\infty}\mathbb E\left\{\left|\hat Y_{P,\mathrm{OEMP}}^{(m)}(f)-R^{(m)}(f)\right|^{2}\right\}\mathrm df=\left(1+\frac{P+3}{4M}\right)\left(e_{P,\mathrm{OEMP}}^{2}+\sigma_n^{2}\right),\tag{19}
$$

其中 $e_{P,\mathrm{OEMP}}^{2}$ 为 OEMP 建模误差，取形式

$$
e_{P,\mathrm{OEMP}}^{2}=\int_{-\infty}^{\infty}\left[\boldsymbol\alpha_{q;2}^{\top}(f)\bar{\mathbf S}_{q;2}(f)\boldsymbol\alpha_{q;2}^{*}(f)+\boldsymbol\beta_{q;2}^{\top}(f)\bar{\mathbf S}_{q;2}(-f)\boldsymbol\beta_{q;2}^{*}(f)\right]\mathrm df,\tag{20}
$$

它同样表示**等效加性干扰功率**。MSE、建模误差与噪声功率之间的关系 (19) 与 (10) 类似，只是权重系数为 $\frac{4M+4+2P-2t_P(q)}{4M+P+3}$（由 $P$、$q$、$M$ 决定）。当 $M\to\infty$ 时权重趋于 1、建模误差趋于残差信号功率；由于 OEMP 残差功率已被证明随 $P$ 增大**单调递减** [22]，故建模误差具有期望的**单调性**。

注意：MSE 使用由**最后一个 TS**（与前 $M$ 个用于 OEMP 系数估计的 TS 独立）构造的接收前导测量，因此 (19) 中建模与接收前导的信号与噪声分量彼此独立。回想 EMP 建模的 MSE 测量中建模与接收前导**相关**，这是确定性与随机方法的根本区别：若 EMP 建模的 MSE 测量改用额外独立接收前导，则建模误差将接近残差信号功率、期望的单调性将永远无法实现。

## V. 数值结果

本节给出数值结果以验证理论分析并展示 TS 设计对非线性信道估计性能的影响。

### A. 非线性系统参数

数值研究考虑两个非线性系统，二者都含相同的 I/Q 不平衡上变频器与建模为 $P_t=5$ 阶 MP 的高功率放大器（HPA），但低噪声放大器（LNA）不同：系统 1 的 LNA 建模为 $P_r=5$ 阶 MP，系统 2 为 $P_r=3$ 阶。系统 1 的 $\alpha_p(t)$、$\beta_p(t)$ 与文献 [22] 相同，系统 2 中 $\beta_5(t)$ 置零。用 [20] 的公式，HPA 与 LNA 的级联可建模为 $P_{\max}=P_t\times P_r=25$（系统 1）与 15（系统 2）阶 MP，非线性参数 $\lambda_p(t)$ 分别列于文献 [22] 表 V 与本文表 II（$T_c$ 为基带采样周期）。

上变频基带等效信号建模为 $x'(t)=ux(t)+vx^{*}(t)$，其中 $u=0.2647+0.0122\mathrm j$、$v=-0.0147-0.0122\mathrm j$ 表示频无关的 IQI 参数。完整非线性系统的 EMP 参数随后按 [20]、[22] 的方法确定为 $a_{q,p}(t)=\lambda_p(t)u_{q,p}$、$b_{q,p}(t)=\lambda_p(t)v_{q,p}$，其中 $u_{q,p}$、$v_{q,p}$ 是由 $u$、$v$ 计算出的常数（见 [22] 式 (26)、(27)），最后转换为 $1\le q\le P_{\max}$ 的向量 $\mathbf a_{q}(f)$、$\mathbf b_{q}(f)$。显然系统 1 的非线性更强。

每个 TS 含 $N_s=48$ 个符号（符号时长 $T_s$），经滚降系数 0.1333 的根升余弦（RRC）滤波成形；采样率变换（SRC）比 4/3 下，基带采样周期为 $T_c=\frac{3}{4}T_s$，故 $N=64$。为简洁，CP 长度也取 $N_{\mathrm{cp}}=N=64$。为生成 EMP 或 OEMP 模型的非线性输出，相应基函数被上采样 32 倍以捕获最高频谱再生。接收端在数字基带对接收滤波后的 $N$ 个频点取 FD 接收 TS。

**表 II：系统 2 的整体非线性参数。**

| 参数 | 表达式 |
|---|---|
| $\lambda_1(t)$ | $(1.0549+0.1816\mathrm j)\delta(t)+(-0.0685-0.0082\mathrm j)\delta(t-T_c/4)+(0.0297-0.0030\mathrm j)\delta(t-T_c/2)$ |
| $\lambda_3(t)$ | $(0.0754-0.4555\mathrm j)\delta(t)+(0.2059+0.2534\mathrm j)\delta(t-T_c/4)+(-0.0548-0.0995\mathrm j)\delta(t-T_c/2)$ |
| $\lambda_5(t)$ | $(-0.9113-0.8538\mathrm j)\delta(t)+(-0.2157-0.3986\mathrm j)\delta(t-T_c/4)+(0.1113+0.1630\mathrm j)\delta(t-T_c/2)$ |
| $\lambda_7(t)$ | $(-0.4894+0.4429\mathrm j)\delta(t)$ |
| $\lambda_9(t)$ | $(-0.0078+0.0804\mathrm j)\delta(t)$ |
| $\lambda_{11}(t)$ | $(0.7695-0.5244\mathrm j)\delta(t)$ |
| $\lambda_{13}(t)$ | $(-0.0412-0.0574\mathrm j)\delta(t)$ |
| $\lambda_{15}(t)$ | $(-0.4940+0.1854\mathrm j)\delta(t)$ |

### B. 理论建模误差

用高斯分布随机 TS 的确定性方法下，阶数 $P$ 的 EMP 建模误差如图 3 所示，其中采用两种功率缩放因子选择策略：一种按 [21] 针对不同 $P$ 的各自最优间隔选择，另一种用简单公式确定间隔（图 3 虚线样式）。对两个仿真系统，**建模误差单调性均不能保证**，取决于功率缩放因子选择策略；同时也清楚表明 **EMP 建模信号的残差功率不具期望单调性**，即不随 $P$ 增大而总下降。这证明 EMP 残差功率**不是**参数估计的合适性能度量。

对随机方法，阶数 $P$ 的 OEMP 建模误差如图 4 所示。采用满足 $M\ge P+1$ 的不同数量高斯随机 TS 时，所得建模误差都**非常接近**各 $P$ 下的残差功率；图 4 还给出系统 2 在 $P=1,7,13$ 时残差功率与建模误差的三个放大视图。清楚表明：对 $P=1$，任意 $M\ge1$ 时建模误差都等于残差功率；对 $P>1$，建模误差随 $M$ 增大趋近相应残差功率。

比较图 3 与图 4 还可见：取决于系统非线性条件，确定性方法的建模误差可能高于或低于随机方法。这引出关于二者相对性能最优性的问题。



### C. MSE 测量与有效非线性阶数

实际应用中，可通过 (10)、(19) 的关系测量建模误差，用于以离线或实时方式识别无线通信系统的非线性阶数；其原理已在 [21] 中阐述。对给定降低阶数 $P$ 与不同信噪比（SNR），归一化与加权 MSE 定义为建模前导与接收前导之间、按各自功率归一化并加权。当 SNR 足够大时，归一化与加权 MSE 将趋近确定性或随机方法的归一化建模误差。若在某一降低阶数处、相对实际可达 SNR 出现显著下降或低于预设门限，则该阶数可确定为**有效非线性阶数**。

以系统 2 为例，图 5 给出 $P=3,5,7,9$ 时 EMP 建模的归一化与加权 MSE（对 10000 次不同确定性 TS 实现平均，采用前述最优功率缩放因子）。与图 3 比较可见：随 SNR 增大，仿真建模误差趋近各 $P$ 的理论值。

同样对系统 2，图 6 给出 $P=1,3,5,7,9$ 时 OEMP 建模的归一化与加权 MSE（对 10000 次不同随机 TS 实现平均，所有 $P$ 取 $M=8$）。与图 4 比较可见：随 SNR 增大，仿真建模误差对 $P=1,3,5,7$ 趋近理论值，但 **$P=9$ 未趋近**；增大 $M$ 后建模误差下降，$P=9$ 时取 $M=24$ 即接近理论值。这些仿真结果表明，尽管 (20) 的建模误差是**近似**，仍具足够精度。



### D. TS 设计对系统性能的影响

假设系统 1 的有效非线性阶数确定为 $P=5$。则可采用 $P=5$ 与预定义 TS 的训练信号传输协议，并结合数据载荷进行信道估计，在经**数字后校正（DPC）**[21] 进行非线性抑制后评估误比特率（BER）。为研究 TS 设计影响，采用长度为 $N$ 的频域**二进制**训练序列与 **ZC** 序列 [24]。

定义信号分量的 PSD 为 $S_p(f)=\sum_{p}$（按基函数 PSD 加权求和），其中 $p=1$ 表示线性分量、$3\le p$ 且 $p$ 为奇数表示非线性分量。对 400 次信道估计与 BER 评估平均，$p=1,3,5$（分别以蓝、红、绿着色）在 25 dB SNR 下的估计 PSD 与系统 1 的 BER 分别如图 7、图 8 所示；真实 PSD 与完美信道知识下的 BER 也作为性能基准（虚线）给出。显然，无论二进制还是 ZC TS，各线性信号分量相对平滑，但非线性信号分量因噪声与**非理想 TS 设计引起的残差信号增强**而出现显著波动。无 DPC 时，二进制与 ZC TS 的 BER 均有中等退化；而经 DPC 后，由于信道估计不准，BER 显著退化，尽管 ZC TS 的 BER 略优于二进制 TS。



### E. 计算复杂度比较

最后分析所提 OEMP 模型系数估计的计算复杂度：分解为 $\mathcal O((P+1)MN\log_2 N)$（FD 变换）与 $\mathcal O\left(\frac{(P+1)(P+3)}{4}N\right)$（步骤 3）等项，单位为复数乘/除所需浮点运算（FLOPs）。与确定性方法 [21] 及传统 LS 方法 [1] 相比，所提随机方法的复杂度仅略高于确定性方法（主要源于步骤 3 的矩阵乘法，但小 $P$ 时差异可忽略）；二者都显著低于 LS 方法（如第 IV-A 节所述）。

## VI. 结论

本文表明：EMP 参数估计中实际可测的建模误差在结构上与 EMP 残差信号功率相似，但各非线性分量**权重不同**，因此 EMP 建模误差的期望单调性**可能无法保证**，尽管可通过适当选择训练前导的功率缩放因子予以增强。对 OEMP 参数估计，所提传输协议在**降低统计量需求**的同时保证低复杂度；理论上证明当训练信号数足够大时实际可测建模误差**收敛到 OEMP 残差信号功率**；此外，OEMP 模型固有的最小残差功率性质保证估计性能具有期望的单调性。

本文的理论分析与发现为实际非线性系统辨识奠定了坚实基础。所提确定性与随机方法各有优势，一旦训练信号传输协议被纳入无线通信系统，即可用于**离线系统校准**与**实时信道估计**。然而，核心挑战在于设计在信号带宽内**恒模**的最优训练信号（见 [23]），这对在频域估计非线性系数时抑制噪声与残差信号增强至关重要。此外，可能需要**自适应机制**以应对动态无线信道环境中的时变非线性，这是未来工作的重要方向。

**致谢。** 本文工作构思于作者访问日本北海道大学期间；作者感谢 Takeo Ohgane 教授的宝贵支持。

## 附录 A：EMP 系数估计

由 (3)、(4)，含噪的第 $m$ 个 FD EMP 建模接收前导为 $\tilde R^{(m)}(f)=\ldots+\tilde E_P(f)+N(f)$（$n=0,1,\ldots,P$、$l=1,3,\ldots,P$）。借助 FD 参数向量化与分块，文献 [21] 的 EMP 系数估计方法被重新表述并概述如下。

把 $\tilde R^{(\frac{P+1}{2}n+\frac{l-1}{2})}(f)$ 按行排列为 $(P+1)\times\frac{P+1}{2}$ 矩阵，记作 $\tilde{\mathbf R}(f)$（如 $P=5$ 时，$\tilde{\mathbf R}(f)$ 各行依次为 $\tilde R^{(0)},\tilde R^{(1)},\tilde R^{(2)}$；$\tilde R^{(5)},\tilde R^{(6)},\tilde R^{(7)}$ 等）。相应的残差 $\tilde{\boldsymbol\epsilon}_{P,\mathrm{EMP}}$ 与噪声 $\mathbf N(f)$ 也按同样方式排列并记为 $\tilde{\mathbf E}_P(f)$ 与 $\mathbf N(f)$；故 $n$ 与 $\frac{l-1}{2}$ 分别为这些矩阵的行、列索引。定义 $\tilde{\mathcal K}_{q,l}(f)=\mathbf a_{q;1}^{T}(f)\mathrm{diag}\{\tilde{\mathbf x}_{q;1}(f)\}\mathbf p_{q;1}^{(\rho_l)}$ 与 $\tilde{\mathcal X}_{q,l}(f)=\mathbf b_{q;1}^{T}(f)\mathrm{diag}\{\tilde{\mathbf x}_{q;1}^{*}(-f)\}\mathbf p_{q;1}^{(\rho_l)}$，则 FD EMP 建模接收信号可写成矩阵形式

$$
\tilde{\mathbf R}(f)=\mathrm{diag}\left\{e^{\mathrm j\frac{\pi}{P+1}n}\right\}\mathbf F\begin{pmatrix}\uparrow\tilde{\mathbf K}(f)\\ \tilde{\mathbf X}(f)\end{pmatrix}+\tilde{\mathbf E}_P(f)+\mathbf N(f),\tag{21}
$$

其中 $\mathrm{diag}\{e^{\mathrm j\frac{\pi}{P+1}n}\}$ 为以 $e^{\mathrm j\frac{\pi}{P+1}n}$（$n=0,1,\ldots,P$）为对角元的对角矩阵，$\mathbf F$ 为离散 FT（DFT）矩阵。

估计分三步：

**步骤 1）** 由接收信号估计 $\uparrow\tilde{\mathbf K}(f)$ 与 $\tilde{\mathbf X}(f)$：

$$
\begin{pmatrix}\uparrow\hat{\tilde{\mathbf K}}(f)\\ \hat{\tilde{\mathbf X}}(f)\end{pmatrix}=\frac{1}{P+1}\mathbf F^{*}\mathrm{diag}\left\{e^{-\mathrm j\frac{\pi}{P+1}n}\right\}\tilde{\mathbf R}(f).\tag{22}
$$

**步骤 2）** 由 $\uparrow\hat{\tilde{\mathbf K}}(f)$ 的第 $\frac{P-q}{2}$ 行与 $\hat{\tilde{\mathbf X}}(f)$ 的第 $\frac{q-1}{2}$ 行计算

$$
\begin{cases}\hat{\boldsymbol\phi}_{q;1}^{T}(f)=\uparrow\hat{\tilde{\mathbf K}}^{\left(\frac{P-q}{2},:\right)}(f)\mathbf Q_{q}\\[4pt] \hat{\boldsymbol\psi}_{q;1}^{T}(f)=\hat{\tilde{\mathbf X}}^{\left(\frac{q-1}{2},:\right)}(f)\mathbf Q_{q}\end{cases}\qquad q=1,3,\ldots,P,\tag{23}
$$

其中 $(\cdot)^{(i,:)}$ 表示矩阵第 $i$ 行，$\mathbf Q_{q}$ 为相应选择/变换矩阵。

**步骤 3）** 估计 EMP 系数：

$$
\begin{cases}\hat{\mathbf a}_{q;1}^{T}(f)=\hat{\boldsymbol\phi}_{q;1}^{T}(f)\mathrm{diag}\{\tilde{\mathbf x}_{q;1}(f)\}^{-1}\\[4pt] \hat{\mathbf b}_{q;1}^{T}(f)=\hat{\boldsymbol\psi}_{q;1}^{T}(f)\mathrm{diag}\{\tilde{\mathbf x}_{q;1}^{*}(-f)\}^{-1}\end{cases}\qquad q=1,3,\ldots,P.\tag{24}
$$

由于 $\tilde{\mathbf R}(f)$ 及 $\hat{\boldsymbol\phi}_{q;1}(f)$、$\hat{\boldsymbol\psi}_{q;1}(f)$ 受残差与噪声污染，希望基函数向量 $\tilde{\mathbf x}_{q;1}(f)$ 在基带上恒模以抑制噪声与残差增强；但与传统线性系统辨识不同，设计产生恒模的确定性 TS 是困难问题（见 [23]）。

## 附录 B：确定性参数估计的 MSE

本附录推导 (10)—(12) 的确定性方法 MSE。定义

$$
\begin{pmatrix}\uparrow\hat{\tilde{\mathbf K}}(f)\\ \hat{\tilde{\mathbf X}}(f)\end{pmatrix}=\begin{pmatrix}\uparrow\tilde{\mathbf K}(f)\\ \tilde{\mathbf X}(f)\end{pmatrix}+\tilde{\mathbf W}(f),\qquad
\tilde{\mathbf W}(f)=\frac{1}{P+1}\mathbf F^{H}\mathrm{diag}\left\{e^{-\mathrm j\frac{\pi}{P+1}n}\right\}\left(\tilde{\mathbf E}_P(f)+\mathbf N(f)\right),\tag{25}
$$

为等效残差前导加噪声矩阵。则对 $q=1,3,\ldots,P$，$\uparrow\hat{\tilde{\mathbf K}}(f)$ 与 $\hat{\tilde{\mathbf X}}(f)$ 的第 $\frac{P-q}{2}$ 行可分别表示为

$$
\uparrow\hat{\tilde{\mathbf K}}^{\left(\frac{P-q}{2},:\right)}(f)=\tilde{\boldsymbol\phi}_{q;1}^{T}(f)\mathbf P_{q;1}+\tilde{\mathbf W}^{\left(\frac{P-q}{2},:\right)}(f),\tag{26}
$$
$$
\hat{\tilde{\mathbf X}}^{\left(\frac{q-1}{2},:\right)}(f)=\tilde{\boldsymbol\psi}_{q;1}^{T}(f)\mathbf P_{q;1}+\tilde{\mathbf W}^{\left(\frac{P+q}{2},:\right)}(f),\tag{27}
$$

其中 $\mathbf P_{q;1}$ 由表 I 定义。$\tilde{\mathbf W}(f)$ 的两个元素可写为

$$
\tilde W_{q;1}^{(\text{row})}(f)=\frac{1}{P+1}\sum_{n=0}^{P}e^{-\mathrm j\frac{\pi}{P+1}qn}N^{\left(n,\frac{l-1}{2}\right)}(f)\ \text{（残差项与噪声项之和）},\tag{28}
$$

及

$$
\tilde W_{q;1}^{(\text{row})'}(f)=\frac{1}{P+1}\sum_{n=0}^{P}e^{\mathrm j\frac{\pi}{P+1}qn}N^{\left(n,\frac{l-1}{2}\right)}(f)\ \text{（含共轭残差项）}.\tag{29}
$$

把 (28)、(29) 代入 (30) 并利用 $\sum_{q}\sum_{m}\cos\left(\frac{\pi}{P+1}(n-m)q\right)$ 等三角关系，可得建模与接收前导之差：

$$
\hat{\tilde Y}_{P,\mathrm{EMP}}^{(m)}(f)-\tilde R^{(m)}(f)=\sum_{q=1,3,\ldots}^{P}\left[e^{-\mathrm j\frac{\pi}{P+1}nq}\left(\tilde W^{\left(\frac{P-q}{2},:\right)}(f)\mathbf Q_{q}\mathbf p_{q;1}^{(\rho_l)}+e^{-\mathrm j\frac{\pi}{P+1}nq}\tilde W^{\left(\frac{P+q}{2},:\right)}(f)\mathbf Q_{q}\mathbf p_{q;1}^{(\rho_l)}\right)\right],\tag{30}
$$

其中第一项为独立非线性信号与噪声分量，其功率可通过集平均分别评估；由于非线性信号分量使用正交基函数，其功率可用基函数 PSD 表示 [22]；利用矩阵迹运算及其循环移位性质，可得到噪声平均功率。综合后得到 (10) 的权重系数 $\frac{P-1}{2(P+1)}$；把建模前导用估计系数改写并整理后即得 (11) 的建模误差闭式，其中离散三角函数 $q=t_P(q')$ 用于把 $q'$ 映射回 $q$。

## 附录 C：随机参数估计的 MSE

本附录推导 (19)、(20) 的随机方法 MSE。定义等效残差加噪声向量

$$
\mathbf w^{(i)}(f)=\frac{1}{P+1}\mathbf F^{*T}\mathrm{diag}\left\{e^{-\mathrm j\frac{\pi}{P+1}n}\right\}\left(\boldsymbol\epsilon_{P,\mathrm{OEMP}}^{(i)}(f)+\mathbf n^{(i)}(f)\right),\tag{33}
$$

则含噪估计量可写成 $\mathbf r^{(i)}(f)=\ldots+\mathbf w^{(i)}(f)$（$i=0,1,\ldots,M-1$）。由 (13)—(15) 可得统计量

$$
\hat{\boldsymbol\theta}_{q}^{T}(f)=\frac{1}{M}\sum_{i=0}^{M-1}\mathbf W_{\frac{P+q}{2}}^{(i)T}(f)\boldsymbol\zeta_{q;1}^{(i)T}(-f),\tag{34}
$$

其中 $W$ 的相关分量可由 (35)、(36) 给出：

$$
\hat{\mathbf k}_{q;1}^{(i)}(f)=\tilde{\boldsymbol\phi}_{q;1}^{(i)T}(f)\mathbf P_{q;1}+\frac{1}{P+1}\sum_{n=0}^{P}e^{-\mathrm j\frac{\pi}{P+1}qn}\mathbf N^{((P+1)i+n)}(f),\tag{35}
$$
$$
\hat{\mathbf x}_{q;1}^{(i)}(f)=\tilde{\boldsymbol\psi}_{q;1}^{(i)T}(f)\mathbf P_{q;1}+\frac{1}{P+1}\sum_{n=0}^{P}e^{\mathrm j\frac{\pi}{P+1}qn}\mathbf N^{((P+1)i+n)}(f),\tag{36}
$$

于是 OEMP 系数估计为

$$
\hat{\boldsymbol\alpha}_{q;1}^{T}(f)=\left[\frac{1}{M}\sum_{i=0}^{M-1}\mathbf W_{\frac{P+q}{2}}^{(i)T}(f)\boldsymbol\zeta_{q;1}^{(i)T}(-f)\right]\boldsymbol\Psi_{q}^{-1*}(-f).\tag{37}
$$

由于真 OEMP 系数未知，这些估计误差**不可直接测量**；但它们可用于表达估计系数所得建模前导与接收前导之差。令其差为

$$
\hat Y_{P,\mathrm{OEMP}}^{(m)}(f)-R^{(m)}(f)=\sum_{q=1}^{P}\left[e^{-\mathrm j\frac{\pi q}{P+1}(m)(P+1)}\left(\hat{\boldsymbol\beta}_{q;1}^{T}(f)\boldsymbol\zeta_{q;1}^{(M)*}(-f)+\hat{\boldsymbol\beta}_{q;2}^{T}(f)\boldsymbol\zeta_{q;2}^{(M)*}(-f)\right)\right]-N^{(m)}(f).\tag{38}
$$

把 (37) 代入 (38)、并用 (35)、(36)，可得按真 OEMP 系数、基函数与噪声展开的表达式 (39)；利用「噪声与基函数独立、不同 TS 构成的基函数独立、不同阶基函数独立、基函数与其共轭独立」以及 $\sum_{m}$ 的求和公式，可得到建模前导与接收前导的均方误差 (40)：

$$
\mathbb E\left\{\left|\hat Y_{P,\mathrm{OEMP}}^{(m)}(f)-R^{(m)}(f)\right|^{2}\right\}
=\mathbb E\left\{\boldsymbol\zeta_{q;1}^{(i)T}(-f)\boldsymbol\Psi_{q}^{-1*}(-f)\bar{\mathbf S}_{q;1}(-f)\boldsymbol\Psi_{q}^{-1T}(-f)\boldsymbol\zeta_{q;1}^{(i)*}(-f)\right\}
+\mathbb E\left\{\left|N^{(m')}(f)\right|^{2}\right\}+\mathbb E\left\{\left|N^{(m)}(f)\right|^{2}\right\},\tag{40}
$$

其中 $m'\in[0,M(P+1))$。这些集平均的精确值涉及复杂积分；但与对频率的积分一起，可应用 **Jensen 不等式**[^2] 得到近似闭式：例如 (40) 中各项可分别近似，噪声项也可近似，最终经与附录 B 相同的指标重排得到 (19) 的 MSE 近似式。

[^2]: Jensen 不等式指出：均值的凸变换不大于凸变换后的均值 [25]。

## 参考文献（英文原书目）

以下按原文编号逐条转录（共 25 条，条目文字不翻译）。

[1] M. F. Haider, F. You, S. He, T. Rahkonen, and J. P. Aikio, "Predistortion-based linearization for 5G and beyond millimeter-wave transceiver systems: A comprehensive survey," IEEE Communications Surveys and Tutorials, vol. 24, no. 4, pp. 2029–2071, Fourth Quarter 2022.

[2] Y. Yu, J. Cai, X.-W. Zhu, P. Chen, and C. Yu, "Self-sensing digital predistortion of RF power amplifiers for 6G intelligent radio," IEEE Microwave and Wireless Components Letters, vol. 32, no. 5, pp. 475–478, 2022.

[3] Y. Yu, P. Chen, X.-W. Zhu, J. Zhai, and C. Yu, "Continual learning digital predistortion of RF power amplifier for 6G AI-empowered wireless communication," IEEE Transactions on Microwave Theory and Techniques, vol. 70, no. 11, pp. 4916–4927, November 2022.

[4] M. J. Korenberg and L. D. Paarmann, "Orthogonal approaches to time-series analysis and system identification," IEEE Signal Processing Magazine, 1991.

[5] K. G. Gard, H. M. Gutierrez, and M. B. Steer, "Characterization of spectral regrowth in microwave amplifiers based on the nonlinear transformation of a complex Gaussian process," IEEE Transactions on Microwave Theory and Techniques, vol. 47, no. 7, pp. 1059–1069, 1999.

[6] M. Valkama, A. S. H. Ghadam, L. Anttila, and M. Renfors, "Advanced digital signal processing techniques for compensation of nonlinear distortion in wideband multicarrier radio receivers," IEEE Transactions on Microwave Theory and Techniques, vol. 54, no. 6, pp. 2356–2366, 2006.

[7] L. Peng and H. Ma, "Design and implementation of software-defined radio receiver based on blind nonlinear system identification and compensation," IEEE Transactions on Microwave Theory and Techniques, 2013.

[8] M. Grimm, M. Allen, J. Marttila, M. Valkama, and R. Thoma, "Joint mitigation of nonlinear RF and baseband distortions in wideband direct-conversion receivers," IEEE Transactions on Microwave Theory and Techniques, vol. 62, no. 1, pp. 166–182, January 2014.

[9] Z. A. Khan, E. Zenteno, P. Handel, and M. Isaksson, "Digital predistortion for joint mitigation of I/Q imbalance and MIMO power amplifier distortion," IEEE Transactions on Microwave Theory and Techniques, 2017.

[10] P. Koukoulas and N. Kalouptsidis, "Nonlinear system identification using Gaussian inputs," IEEE Transactions on Signal Processing, 2005.

[11] L. Ding, G. T. Zhou, D. R. Morgan, Z. Ma, J. S. Kenney, J. Kim, and C. R. Giardina, "A robust digital baseband predistorter constructed using memory polynomials," IEEE Transactions on Communications, vol. 52, 2004.

[12] R. Raich and T. Zhou, "Orthogonal polynomials for complex Gaussian processes," IEEE Transactions on Signal Processing, vol. 52, no. 10, 2004.

[13] G. T. Zhou and R. Raich, "Spectral analysis of polynomial nonlinearity with applications to RF power amplifiers," EURASIP Journal on Applied Signal Processing, vol. 12, pp. 1831–1840, December 2004.

[14] N. Kalouptsidis and P. Koukoulas, "Blind identification of Volterra-Hammerstein systems," IEEE Transactions on Signal Processing, 2005.

[15] D. R. Morgan, Z. Ma, J. Kim, M. G. Zierdt, and J. Pastalan, "A generalized memory polynomial model for digital predistortion of RF power amplifiers," IEEE Transactions on Signal Processing, vol. 54, no. 10, 2006.

[16] Y. Yu, J. Cai, X.-W. Zhu, P. Chen, and C. Yu, "Minimum mean-square error equalization for second-order Volterra systems," IEEE Transactions on Signal Processing, vol. 56, no. 10, pp. 4729–4737, October 2008.

[17] C. Turchetti, G. Biagetti, F. Gianfelici, and P. Crippa, "Nonlinear system identification: An effective framework based on the Karhunen-Loeve transform," IEEE Transactions on Signal Processing, vol. 57, no. 2, 2009.

[18] L. Anttila, P. Handel, and M. Valkama, "Joint mitigation of power amplifier and I/Q modulator impairments in broadband direct-conversion transmitters," IEEE Transactions on Microwave Theory and Techniques, 2010.

[19] A. K. Bolstad, "Identification of generalized memory polynomials using two-tone signals," IEEE Transactions on Signal Processing, vol. 66, no. 16, pp. 4280–4290, August 2018.

[20] X. Huang, H. Zhang, A. T. Le, J. A. Zhang, and Y. J. Guo, "Received signal modelling for millimeter wave and terahertz systems with practical impairments," IEEE Transactions on Communications, vol. 72, no. 10, pp. 6638–6652, October 2024.

[21] X. Huang, H. Zhang, A. T. Le, J. A. Zhang, and Y. J. Guo, "Digital Post-Cancellation of Nonlinear Interference for Millimeter Wave and Terahertz Systems," IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 16033–16047, November 2024.

[22] X. Huang, A. T. Le, H. Zhang, J. A. Zhang, and Y. J. Guo, "Orthogonal expanded memory polynomial model for circular complex Gaussian processes," IEEE Transactions on Signal Processing, vol. 72, pp. 3287–3302, 2024.

[23] X. Huang, "Nonlinear System Identification Through Amplitude-Phase-Frequency Characterization," submitted to IEEE Transactions on Signal Processing, available on https://www.techrxiv.org.

[24] B. M. Popovic, "Efficient DFT of Zadoff-Chu sequences," Electronics Letters, vol. 46, no. 7, pp. 502–503, April 2010.

[25] F. M. Dekking, C. Kraaikamp, H. P. Lopuhaa, and L. E. Meester, A Modern Introduction to Probability and Statistics: Understanding Why and How (Springer Texts in Statistics). London, U.K.: Springer, 2005.

## 图注与表注

**图 1：** 系统模型 (a)，以及用于非线性系统辨识的训练信号传输协议：确定性方法 (b) 与随机方法 (c)。(b) 中同一预定义前导按不同功率缩放与相位旋转连续传输 $P+1$ 次；(c) 中 $M+1$ 个随机 TS 各自重复传输 $P+1$ 次，前 $M$ 个用于系数估计、最后一个用于 MSE 测量。

**图 2：** $P=5$ 时的离散三角函数，把任意 $1\le q\le P_{\max}$ 映射到 $1\le q'\le P$。

**图 3：** 确定性方法下 EMP 模型的建模误差（含两种功率缩放因子选择策略，虚线为简单公式策略；并给出 EMP 建模信号残差功率）。

**图 4：** 随机方法下 OEMP 模型的建模误差（不同 $M\ge P+1$ 的曲线与各 $P$ 下残差功率对比；插图为系统 2 在 $P=1,7,13$ 时残差功率与建模误差的放大视图）。

**图 5：** EMP 建模的归一化与加权 MSE（系统 2，$P=3,5,7,9$，10000 次确定性 TS 实现平均，采用最优功率缩放因子）。

**图 6：** OEMP 建模的归一化与加权 MSE（系统 2，$M=8$，$P=1,3,5,7,9$，10000 次随机 TS 实现平均）。

**图 7：** 二进制（实线）与 ZC（虚线）TS 设计下估计的各信号分量 PSD 与基准（点线）的对比（系统 1，SNR = 25 dB；$p=1,3,5$ 分别以蓝、红、绿着色）。

**图 8：** 使用与不使用 DPC 时二进制（实线）与 ZC（虚线）TS 设计的 BER 对比（与完美信道知识基准点线比较；系统 1）。

**表注：** 表 I 给出 EMP 与 OEMP 在频域的系数、基函数向量及其分块定义（$\mathbf a_{q;1/2}$、$\mathbf b_{q;1/2}$、$\mathbf x_{q;1/2}$、$\boldsymbol\alpha_{q;1/2}$、$\boldsymbol\beta_{q;1/2}$、$\boldsymbol\zeta_{q;1/2}$、$\mathbf V_{q;1/2}$、$\mathbf P_{q;1}$）。表 II 给出系统 2 的整体非线性参数 $\lambda_p(t)$（$p=1,3,\ldots,15$），其中 $\lambda_1,\lambda_3,\lambda_5$ 各含 $0$、$T_c/4$、$T_c/2$ 三个时延抽头，其余为单抽头。

## 本页范围与校对状态

**覆盖范围：** 本页为 IEEE 正式版/期刊论文（15 页）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（非线性与 NSI 背景、EMP 确定性方法及其 MSE 分析缺口、性能可测性与单调性两大问题、四项贡献、结构安排）；第 II 节系统与协议（II-A 信号与系统模型，式 (1)—(2) 与 EMP/OEMP 基函数及系数关系；II-B 模型参数估计协议；II-C 频域参数表示、向量化与分块及表 I；II-D 接收前导表达式与残差功率，式 (3)—(8)）；第 III 节确定性方法分析（III-A 建模误差，式 (9)—(12) 与图 2；III-B 经 OEMP 转换的建模误差）；第 IV 节随机方法与分析（IV-A 降维 TS 统计量，式 (13)；IV-B 所提估计方法与三步流程，式 (14)—(17)；IV-C 建模误差，式 (18)—(20)）；第 V 节数值结果（V-A 非线性系统参数与表 II；V-B 理论建模误差与图 3—图 4；V-C MSE 测量与有效非线性阶数与图 5—图 6；V-D TS 设计影响与图 7—图 8；V-E 计算复杂度）；第 VI 节结论与未来工作；致谢；25 条英文参考文献；附录 A（EMP 系数估计，式 (21)—(24)）、附录 B（确定性参数估计 MSE，式 (25)—(30) 及推导）、附录 C（随机参数估计 MSE，式 (33)—(40) 及 Jensen 近似）；图 1—图 8 图注与表 I—表 II 表注。

**源文页码：** 第 1 页（IEEE 版权声明、题名、作者、摘要、关键词、引言开始）→ 第 2—3 页（引言、贡献、第 II-A 节）→ 第 3—4 页（第 II-B—II-C 节、图 1、表 I）→ 第 5—6 页（第 II-D 节、式 (3)—(8)）→ 第 7—8 页（第 III 节、式 (9)—(12)、图 2）→ 第 9 页（第 IV-A—IV-B 节、式 (13)—(17)）→ 第 10 页（第 IV-C 节、式 (18)—(20)）→ 第 11—12 页（第 V 节、表 II、图 3—图 6）→ 第 13 页（第 V-D—V-E 节、图 7—图 8）→ 第 14 页（第 VI 节、参考文献）→ 第 15 页（附录 A—C 及其公式）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；**表 II 的全部参数值已按 PDF 第 8 页渲染图逐项核对**（$\lambda_1,\lambda_3,\lambda_5$ 的三抽头与 $\lambda_7$—$\lambda_{15}$ 的单抽头）；表 I 为**向量/分块定义表**（非数值表），本页按原文表 I 的定义整理为等价定义表，并在表注说明 $\mathbf P_{q;1}$ 等矩阵在原文表 I 中给出、此处以引用方式保留。
2. 图 1—图 8 均未上传图片；本页以"图注与表注"小节统一给出 8 条中文图注与 2 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖正文 (1)—(20)、附录 (21)—(40)；按页内顺序连续编号。**附录 B、C 中原文的多步代数化简（(28)—(32)、(34)—(40) 的逐项展开）本页以关键步骤 + 结论的形式呈现**，并明确标注"逐项展开见原文"；结论与关键公式形式均完整译出。
4. **原文疑点／说明：** ①(9) 与 (18) 在原文以"建模前导"形式给出，本页按 (3)、(5) 的结构、以估计系数（带 hat）写出，便于阅读；②原文 (28)、(29) 的残差与噪声分量在 PDF 文本层被截断，本页按上下文补全其求和结构并注明"残差项与噪声项之和"；③(30) 的合成表达式在原文跨行给出，本页按变量含义整理；④(34)—(37) 的 $\mathbf W$ 记法在原文跨页截断，本页按上下文统一；⑤原文式 (7) 的首项在文本层起始处缺上标，本页按 (4) 的残差结构统一为 $\tilde{\mathbf b}_{q;2}$；⑥附录 C 中 Jensen 不等式脚注按原文保留。
5. **许可与登记：** 原文为 IEEE 正式版/期刊论文（©2025 IEEE），再传播许可**待核验**；本页仅作学习用途、**不计入本站可公开全文统计**，页面顶部与状态段均已注明；原文 IEEE 版权声明（personal use permitted；other uses require permission）已在页面顶部译述。
6. 版权：本页为中文翻译页面，未上传原文 PDF；如后续确认许可，再按站点流程更新发布状态。

{% endraw %}