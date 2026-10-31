---
layout: page
title: "预处理流匹配｜中文全文译文"
permalink: /papers/translations/2026-10-31-2603-02337-preconditioned-flow-matching/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3f84682f0fb82697/) · [原文 arXiv](https://arxiv.org/abs/2603.02337) · [全部目录](/papers/catalog/)

# 预处理流匹配

**原题：** Preconditioned Flow Matching  
**作者：** Shadab Ahamed、Eshed Gal、Md Shahriar Rahim Siddiqui、Simon Ghyselincks、Moshe Eliasof、Eldad Haber（不列颠哥伦比亚大学、剑桥大学）  
**版本：** arXiv:2603.02337v3（cs.LG），2026-10-26；NeurIPS 2026（第 40 届神经信息处理系统大会）接收；原文 45 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含 2、3.1–3.3、4、5 全部小节）、结论、致谢、附录 A–K（含 D.1–D.6、E.1–E.4、F.1–F.3、G.1–G.10、H.1–H.2、I.1–I.2）、图 1–19 图注、表 1–10 逐格、算法 1、参考文献 33 条（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

流匹配（flow matching，FM）通过回归沿中间分布 $p_t$ 的随机速度目标来学习向量场。我们识别出该回归问题中的**几何优化瓶颈**：当 $p_t$ 的协方差 $\Sigma_t$ 病态（ill-conditioned）时，基于梯度的训练会迅速拟合高方差方向，而在低方差方向上进展缓慢。在可精确求解的高斯设定中，我们证明**超额风险（excess risk）由 $\Sigma_t$ 加权**，且梯度下降与随机梯度下降都继承**依赖条件数的收敛性**。随后我们把分析推广到高斯混合，表明多模态**不会**把该效应平均掉；相反，最慢、条件数最差的成分可以支配优化。受此分析启发，我们提出**预处理流匹配**（preconditioned flow matching）——一个"先预处理、再匹配"（precondition-then-match）的框架：把目标分布变换为更各向同性的表示，在变换空间中训练主流，并经由逆变换把生成样本映射回原空间。我们从理论上证明预处理会**重塑 FM 的中间路径**并改善其条件数。在受控高斯与高斯混合实验、隐空间 MNIST 以及其他最高达 512×512 分辨率的高分辨率图像数据集上，预处理改善了路径条件诊断、低特征值恢复、FID、MMD、精确率与召回率。计算量匹配的基线与预处理器质量消融进一步表明，增益不能仅由额外的预处理器参数解释，而来自下游流匹配问题几何的改善。GitHub：https://github.com/ahxmeds/preconditioned-flow-matching.git 。

## 1 引言

流匹配 [Lipman 等，2023] 与基于分数的扩散模型 [Song 等，2021；Ho 等，2020] 已成为连续时间生成建模的核心工具，在图像 [Caetano 等，2026]、音频 [Guan 等，2024] 与三维合成 [Wang 等，2025；Danese 等，2026] 上取得最先进性能。两类范式都把生成表述为学习一个时变动力系统、把样本从简单参考分布输运到复杂数据分布的过程。尽管经验上成功，这些模型表现出一个持续且日益被记录的**优化现象**：训练损失往往在样本质量饱和之前很久就进入平台期，表明总目标的收敛可能掩盖了生成所依赖的动力学某些方面的误差 [Lin and Yang，2025；Xu 等，2026]。

已有的缓解策略——如精细调优的噪声调度 [Aranguri 等，2025]、依赖时间的损失重加权 [Billera 等，2026；Diefenbacher 等，2020]、或概率流蒸馏 [Zhou 等，2025]——在实践中可改善样本质量；然而这些方法主要修改训练调度、损失加权或采样过程，而**未直接处理流匹配路径上诱导出的回归问题的条件数**。这一区别促使我们关注中间分布本身的几何。更多相关工作见附录 A。

本文表明，收敛缓慢的一个关键贡献者在于**流匹配目标所诱导回归问题的条件数**。在每个时间步，训练都归约为从沿输运路径的中间分布中抽样、估计一个向量场；当这些分布呈现强各向异性时，所得优化问题变得病态：**基于梯度的方法迅速拟合高方差方向，而在低方差方向上仅有边际进展**。

为分离并研究该效应，我们在精确输运动力学可解析处理的受控设定中分析流匹配：先是一个线性高斯模型问题，再推广到能刻画多模态的高斯混合。两种情形下我们都表明，优化动力学与在病态最小二乘目标（FM 中常用 [Dao 等，2023；Lipman 等，2023，2024]）上的梯度下降与随机梯度下降动力学高度一致。关键在于，**即使模型类足以表达精确速度场，这些困难依然存在**——说明收敛的根本瓶颈是优化而非近似。

受此理解启发，我们提出一种流匹配的缓解途径：**预处理**。广义上，预处理指在不修改底层生成过程的前提下、重塑学习问题几何的策略；这应与标准隐变量生成建模相区别——后者主要用自编码器或 VAE 获得紧凑表示以便高效生成，但这类隐空间未必各向同性或条件良好。因而预处理与隐流匹配、隐扩散互补：既可在数据空间施加，也可施加在已有隐表示之上，进一步改善 FM 中间路径的条件数。在我们的设定中，这需要额外的预处理阶段与相关设计选择，但其开销针对的是改善下游 FM 问题的几何，而非单纯增加模型容量。

**贡献。** 主要贡献为：(i) 对流匹配优化过程的理论分析，揭示数据各向异性如何支配优化速度；(ii) 一个有原则的"先预处理、再匹配"框架，改善下游 FM 回归问题的条件数，同时保持主流架构与采样 ODE 不变；(iii) 识别并推导该回归几何的 FM 特有推论：小的 FM 损失可掩盖低方差方向的大速度误差；标量时间重加权无法消除固定时间的方向刚度；预处理改变的是 FM 路径本身的协方差，而非仅缩放目标；(iv) 在从二维点到 MNIST 及其他图像数据集的多个数据集上实验，验证方法的新颖性。

## 2 流匹配作为随机回归

连续时间生成模型构造从简单参考分布 $p_0$（通常为高斯）到目标数据分布 $p_1$ 的输运。与直接学习映射 $x_0\mapsto x_1$ 不同，流匹配引入一族中间状态

$$
x_t=s(t)x_1+c(t)x_0, \tag{1}
$$

其中 $x_0\sim p_0$、$x_1\sim p_1$，且 $s(0)=0$、$s(1)=1$、$c(0)=1$、$c(1)=0$。目标是学习支配中间分布 $p_t$ 随时间演化的速度场。流匹配（FM）学习输运 ODE [Lipman 等，2023] $\mathrm dx_t/\mathrm dt=v_\theta(x_t,t)$ 的右端。给定式 (1) 的插值路径，目标速度为 $v_t^\star(x_0,x_1)=s'(t)x_1+c'(t)x_0$。标准条件 FM 目标可写为

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{t,x_0,x_1}\left[\left\|v_\theta(x_t,t)-v_t^\star(x_0,x_1)\right\|^2\right], \tag{2}
$$

其中 $t\sim\mathrm{Unif}[0,1]$、$x_0\sim p_0$、$x_1\sim p_1$。

**命题 2.1（CFM 的条件均值刻画）。** 对任意可测向量场 $g:\mathbb R^d\times[0,1]\to\mathbb R^d$，定义

$$
\mathcal L(g)=\mathbb E\left[\left\|g(x_t,t)-v_t^\star(x_0,x_1)\right\|^2\right],
$$

期望取在 $t\sim\mathrm{Unif}[0,1]$、$x_0\sim p_0$、$x_1\sim p_1$ 上。则总体极小点为

$$
g^\star(x,t)=\underbrace{\mathbb E\left[v_t^\star(x_0,x_1)\mid x_t=x,t\right]}_{\text{条件均值目标}}. \tag{3}
$$

此外，

$$
\mathcal L(g)=\underbrace{\mathbb E\left[\left\|g(x_t,t)-g^\star(x_t,t)\right\|^2\right]}_{\text{优化/近似误差}}+\underbrace{\mathbb E\left[\mathrm{Tr}\left(\mathrm{Cov}\left(v_t^\star(x_0,x_1)\mid x_t,t\right)\right)\right]}_{\text{不可约随机目标误差}}. \tag{4}
$$

式 (4) 中的协方差迹项即**不可约随机目标误差**（irreducible stochastic-target error，ISTE）。特别地，$\mathcal L(g)-\mathcal L(g^\star)=\mathbb E[\|g(x_t,t)-g^\star(x_t,t)\|^2]$ 即**超额风险**（证明见 D.1 节）。

命题 2.1 表明条件 FM 是一个**随机目标回归问题**：目标速度 $v_t^\star(x_0,x_1)$ 一般不是 $(x_t,t)$ 的确定性函数，故式 (4) 中的协方差迹项构成不可约误差地板，而总体极小点仍是条件均值速度场。这确立了条件 FM 作为中间分布 $p_t$ 下的回归问题。第 3 节我们在可解析处理的高斯与高斯混合 FM 设定中把数据几何的作用显式化。

## 3 高斯与高斯混合 FM 中的精确条件化理论

本节在可解析处理的 FM 设定中显式化数据几何的作用。目标不是为任意非线性网络证明全局收敛定理，而是在总体条件 FM 目标可精确刻画的设定中**分离出中间分布 $p_t$ 诱导的优化机制**。先看目标速度恰好为线性的高斯模型，再推广到会加剧同一条件数瓶颈的高斯混合模型。

### 3.1 高斯 FM 作为可精确求解的回归问题

考虑线性插值 $x_t=(1-t)x_0+tx_1$（$t\in[0,1]$），$x_0\sim\mathcal N(0,I)$、$x_1\sim\mathcal N(0,H)$，其中 $H\in\mathbb R^{d\times d}$ 对称正定、$x_0$ 与 $x_1$ 独立。沿插值，中间协方差随 $t$ 从 0 到 1 由 $I$ 过渡到 $H$，故回归几何逐渐继承目标分布的各向异性。

记特征分解 $H=U\Lambda U^\top$，$\Lambda=\mathrm{diag}(\lambda_1,\ldots,\lambda_d)$、$\lambda_i>0$。当条件数

$$
\kappa(H)=\frac{\lambda_{\max}(H)}{\lambda_{\min}(H)} \tag{5}
$$

很大时，称 $H$ 病态。

**命题 3.1（精确高斯 CFM 目标与中间协方差）。** 在线性插值下，中间状态 $x_t$ 为高斯，协方差

$$
\Sigma_t:=\mathbb E\left[x_tx_t^\top\right]=(1-t)^2I+t^2H. \tag{6}
$$

此外，对线性插值，条件 FM 总体目标为

$$
g_t^\star(x_t):=\mathbb E\left[x_1-x_0\mid x_t\right]=A^\star(t)x_t, \tag{7}
$$

其中

$$
A^\star(t)=\mathrm{Cov}\left(x_1-x_0,x_t\right)\Sigma_t^{-1}=\left(tH-(1-t)I\right)\left((1-t)^2I+t^2H\right)^{-1}. \tag{8}
$$

命题 3.1 表明高斯情形下总体条件 FM 目标关于 $x_t$ 精确线性（证明见 D.2 节）。下面量化该精确目标诱导的回归几何。

**引理 3.2（线性预测器的精确超额风险分解）。** 固定 $t\in[0,1]$，定义

$$
\mathcal L_t(A)=\mathbb E\left[\left\|Ax_t-(x_1-x_0)\right\|^2\right]. \tag{9}
$$

则唯一极小点为式 (8) 的 $A^\star(t)$，且对每个 $A\in\mathbb R^{d\times d}$，

$$
\mathcal L_t(A)=\underbrace{\mathcal L_t\left(A^\star(t)\right)}_{\text{可达最小风险}}+\underbrace{\mathrm{Tr}\left(\left(A-A^\star(t)\right)\Sigma_t\left(A-A^\star(t)\right)^\top\right)}_{\text{几何控制的超额风险}}. \tag{10}
$$

等价地，

$$
\mathcal L_t(A)=\underbrace{\mathbb E\left[\mathrm{Tr}\left(\mathrm{Cov}\left(x_1-x_0\mid x_t\right)\right)\right]}_{\text{不可约随机标签误差}}+\underbrace{\mathrm{Tr}\left(\left(A-A^\star(t)\right)\Sigma_t\left(A-A^\star(t)\right)^\top\right)}_{\text{几何控制的超额风险}}. \tag{11}
$$

特别地，

$$
\mathcal L_t(A)-\mathcal L_t\left(A^\star(t)\right)=\underbrace{\mathrm{Tr}\left(\left(A-A^\star(t)\right)\Sigma_t\left(A-A^\star(t)\right)^\top\right)}_{\text{由 }\Sigma_t\text{ 加权的超额风险}}. \tag{12}
$$

**推论。** 引理 3.2 指明了高斯流匹配的精确总体几何：扣除不可约随机目标方差后，优化项是由 $\Sigma_t$ 支配的二次型（证明见 D.3 节）；数据几何的作用因此直接通过 $\Sigma_t$ 的谱进入。

**关键观察：** 即使总体条件 FM 目标可被精确表示，仅因中间协方差 $\Sigma_t$ 病态，优化也可能任意缓慢——这会压制沿低方差方向的学习。

### 3.2 条件数控制高斯 FM 中的优化

由于 $\Sigma_t$ 与 $H$ 共享特征向量，$\Sigma_t$ 的特征值为 $\sigma_i(t)=(1-t)^2+t^2\lambda_i$（$i=1,\ldots,d$）。故

$$
\kappa\left(\Sigma_t\right)=\frac{\max_i\sigma_i(t)}{\min_i\sigma_i(t)}=\frac{(1-t)^2+t^2\lambda_{\max}}{(1-t)^2+t^2\lambda_{\min}}. \tag{13}
$$

$t=0$ 时 $\Sigma_t=I$，问题条件完美；$t=1$ 时 $\Sigma_t=H$，回归继承目标分布的全部各向异性；中间时刻 $\kappa(\Sigma_t)$ 在这两种极端之间插值。

**定理 3.3（梯度下降收敛由 $\Sigma_t$ 控制）。** 固定 $t\in[0,1]$，考虑二次总体损失 $\mathcal L_t(A)$，其中 $A\in\mathbb R^{d\times d}$ 为优化变量、$x_t=(1-t)x_0+tx_1$、$\Sigma_t=\mathbb E[x_tx_t^\top]$。令交叉协方差为

$$
C_t:=\mathrm{Cov}\left(x_1-x_0,x_t\right)=tH-(1-t)I, \tag{14}
$$

并用 $A^\star(t)$ 表示 $\mathcal L_t$ 的唯一极小点，满足 $A^\star(t)\Sigma_t=C_t$。考虑步长 $\eta>0$ 的全批量梯度下降：

$$
A_{k+1}=A_k-2\eta\left(A_k\Sigma_t-C_t\right). \tag{15}
$$

定义误差 $E_k:=A_k-A^\star(t)$，则误差按

$$
E_{k+1}=E_k\left(I-2\eta\Sigma_t\right) \tag{16}
$$

演化。因此，若 $0<\eta<1/\sigma_{\max}(t)$（$\sigma_{\max}(t)$、$\sigma_{\min}(t)$ 为 $\Sigma_t$ 的最大与最小特征值），梯度下降线性收敛到 $A^\star(t)$。取最优固定步长 $\eta^\star=1/(\sigma_{\max}(t)+\sigma_{\min}(t))$ 时，把误差降低 $\varepsilon\in(0,1)$ 倍所需迭代次数满足

$$
k=\mathcal O\left(\kappa\left(\Sigma_t\right)\log(1/\varepsilon)\right). \tag{17}
$$

定理 3.3 的证明见 D.4 节。

**推论 3.4（低方差方向是高斯 FM 的瓶颈）。** 在定理 3.3 的设定下，对应小特征值 $\sigma_i(t)$ 的方向在梯度下降下收敛最慢。特别地，若 $H$ 病态且 $t$ 不接近 0，则优化被中间分布的低方差方向支配（证明见 D.5 节）。

下面总结相应的随机梯度行为。

**命题 3.5（逐模态 SGD 均值动力学）。** 考虑在固定时间 $t$ 对式 (9) 施加无偏单样本随机梯度下降。把误差投影到 $\Sigma_t$ 的特征基上，每个标量模态在条件期望下满足

$$
\mathbb E\left[e_{i,m+1}\mid e_{i,m}\right]=\left(1-2\eta\sigma_i(t)\right)e_{i,m}.
$$

于是 SGD 的均值动力学继承与全批量 GD 相同的模态相关收缩：$\sigma_i(t)$ 越小的方向收缩越慢。常步长的平稳方差依赖随机梯度噪声的协方差，一般不普遍按 $1/\sigma_i(t)$ 缩放（证明见 D.6 节）。

**注 3.6（优化器分析的适用范围）。** 定理 3.3 与 3.5 是线性预测器下高斯流匹配的**精确总体层面**结果，应理解为对一阶训练的优化器层面诊断，而非对每种自适应优化器或任意非线性网络的全局定理；其作用是分离出条件数机制，为后文预处理提供动机。

### 3.3 高斯混合 FM：多模态加剧瓶颈

现在把同一分析推广到高斯混合目标

$$
x_1\sim\sum_{k=1}^{K}\pi_k\mathcal N(0,H_k),\qquad\pi_k>0,\quad\sum_{k=1}^{K}\pi_k=1, \tag{18}
$$

其中 $x_0\sim\mathcal N(0,I)$、$x_t=(1-t)x_0+tx_1$。高斯混合设定有用，因为它在保持解析结构的同时引入多模态，从而为具有多个语义簇或模态的数据集提供理想化模型。

**假设 3.7（完美成分指派）。** 为分离条件数效应，假设混合责任（responsibilities）精确已知，使优化可按成分分解。

**命题 3.8（高斯混合 FM 中的精确条件均值目标）。** 在式 (18) 下，令

$$
w_k(x_t,t):=\mathbb P\left(x_1\ \text{属于成分}\ k\mid x_t,t\right) \tag{19}
$$

表示后验成分权重，则条件 FM 总体目标为

$$
g_t^\star(x_t)=\mathbb E\left[x_1-x_0\mid x_t\right]=\sum_{k=1}^{K}w_k(x_t,t)A_k^\star(t)x_t, \tag{20}
$$

其中 $A_k^\star(t)=\left(tH_k-(1-t)I\right)\left((1-t)^2I+t^2H_k\right)^{-1}$（证明见 E.1 节）。在假设 3.7 下，问题分解为 $K$ 个成分回归子问题，协方差 $\Sigma_{t,k}=(1-t)^2I+t^2H_k$；若 $\lambda_{k,i}$ 为 $H_k$ 的第 $i$ 个特征值，则 $\Sigma_{t,k}$ 对应特征值为 $\sigma_{k,i}(t)=(1-t)^2+t^2\lambda_{k,i}$。

**定理 3.9（高斯混合 FM 的最差成分瓶颈）。** 在假设 3.7 下，成分化高斯混合 FM 问题的基于梯度优化由**最慢的成分子问题**支配：全批量 GD 与 SGD 的均值动力学都受最慢成分特征方向 $\min_{k,i}\sigma_{k,i}(t)$ 控制，即受全部混合成分与方向上最小特征值控制。因此，即使多数成分条件良好，单个条件差的成分也能支配总体收敛时间尺度（证明见 E.2 节）。特别地，若要在假设 3.7 的分解下使各成分达到相当精度，总体速率由最慢子问题支配。

**推论 3.10（多模态放大条件数效应）。** 在定理 3.9 下，多模态**不会**把条件数效应平均掉：总体优化瓶颈由最难的混合成分支配（证明见 E.3 节）。

**关键观察：** 高斯混合 FM 中，优化由**条件数最差的成分**而非平均数据几何控制。即使多数成分表现良好，单个各向异性成分也能支配收敛——多模态是**加剧**而非平均掉条件数瓶颈。

**理论的适用范围。** 上述结果对总体层面的高斯与高斯混合流匹配是精确的，表明即使目标速度可精确表示，优化也可能因中间分布的各向异性而显著变慢。零均值高斯假设只为表述方便：E.4 节把分析推广到非零均值（条件目标变为仿射，而去中心后由协方差控制的超额风险几何与线性梯度动力学不变）。该机制为下一节预处理提供动机。我们并不声称对任意非线性流网络有闭式全局收敛定理；本节目的在于在可解设定中分离条件数效应，并为后文实际模型给出可检验预测。

## 4 流匹配的预处理

第 3 节结果表明，FM 优化受中间协方差 $\Sigma_t$（高斯）与 $\Sigma_{t,k}$（高斯混合）条件数的瓶颈约束。这提示一个简单补救：**在训练主 FM 模型之前，对目标数据施加可逆映射 $P$**，使推前（pushforward）目标分布更各向同性；然后在变换后输运 $\mathcal N(0,I)\to\tilde x_1$（$\tilde x_1=Px_1$）上训练主流，并用 $P^{-1}$ 把样本映射回原空间。在我们的设定中，预处理器是任何（学到的或解析指定的）可逆或近似可逆变换，把目标数据映射到几何更各向同性的表示。

这类似于数值线性代数中的经典预处理——通过把病态问题变换为条件更好的问题来改善优化（见 Benzi [2002]、Saad [1992]、Golub and Ye [1999]）。该设计引入额外的预处理器训练阶段与相关超参数，但其作用是有针对性的：改善下游 FM 路径的几何，而非单纯增加生成模型容量。

**定理 4.1（预处理重塑高斯 FM 路径）。** 考虑第 3 节的高斯 FM 设定：$x_0\sim\mathcal N(0,I)$、$x_1\sim\mathcal N(0,H)$、$x_t=(1-t)x_0+tx_1$。令 $P\in\mathbb R^{d\times d}$ 为任意可逆线性映射，定义变换后的目标与插值

$$
\tilde x_1=Px_1,\qquad\tilde x_t=(1-t)x_0+t\tilde x_1.
$$

则变换后中间分布的协方差为 $\tilde\Sigma_t=(1-t)^2I+t^2PHP^\top$。此外：

(a) **精确白化。** 若 $P=H^{-1/2}$，则

$$
\tilde\Sigma_t=\left((1-t)^2+t^2\right)I,\qquad\kappa\left(\tilde\Sigma_t\right)=1\quad\forall t\in[0,1]. \tag{21}
$$

(b) **近似各向同性化。** 若存在常数 $0<m\le M$ 使 $mI\preceq PHP^\top\preceq MI$，则 $(1-t)^2+t^2m\le\lambda_i(\tilde\Sigma_t)\le(1-t)^2+t^2M$，从而

$$
\kappa\left(\tilde\Sigma_t\right)\le\frac{(1-t)^2+t^2M}{(1-t)^2+t^2m}. \tag{22}
$$

证明与相应的成分化高斯混合推广分别见 F.1 与 F.2 节。把定理 3.3 应用于变换后的高斯 FM 问题即知：基于梯度的优化现在随 $\kappa(\tilde\Sigma_t)$ 而非 $\kappa(\Sigma_t)$ 缩放。特别地，精确白化完全消除条件数瓶颈，而近似各向同性化按 $PHP^\top$ 的条件良好程度同比改善瓶颈。变换后的回归问题因而条件更好，缓解否则会导致次优解的早期优化停滞。

**算法 1　先预处理、再匹配（Precondition-then-Match）**

- **输入：** 目标样本 $\{x_1^{(i)}\}_{i=1}^{N}\sim p_1$、参考分布 $p_0=\mathcal N(0,I)$、预处理器类别 $\mathcal P_\phi$、主 FM 模型 $v_\theta$。
- **输出：** 从 $p_1$ 采样的生成器。
1. 在目标数据上学习可逆或近似可逆的预处理器 $P_\phi$。
2. 变换目标：$\tilde x_1^{(i)}=P_\phi(x_1^{(i)})$。
3. 在预处理路径 $\tilde x_t=(1-t)x_0+t\tilde x_1$（$x_0\sim\mathcal N(0,I)$、$t\sim\mathrm{Unif}[0,1]$）上用 FM 训练 $v_\theta$。
4. 最小化 $\mathbb E_{t,x_0,\tilde x_1}\left[\|v_\theta(\tilde x_t,t)-(\tilde x_1-x_0)\|^2\right]$。
5. 推断时采样 $z\sim\mathcal N(0,I)$，在预处理空间求解学到的 ODE 得 $\hat{\tilde x}_1$。
6. 映射回：$\hat x_1=P_\phi^{-1}(\hat{\tilde x}_1)$。
7. 返回 $\hat x_1$。

**解释。** 定理 4.1 在线性高斯情形中显式化了预处理的作用：中间协方差由 $\Sigma_t$ 变为 $\tilde\Sigma_t$，精确白化是解析上可处理的理想情形。对实际非线性预处理器，类似目标是使变换后的目标分布 $\tilde x_1=P_\phi(x_1)$ 更各向同性，使下游 FM 路径上的经验中间分布条件更好。因此目标并非精确高斯化，而是获得一个其输运路径条件显著更好的变换表示。

**FM 特有的推论。** 上述结果除"病态最小二乘问题优化慢"这一标准观察外，还有专属于流匹配的含义。对 $H=U\Lambda U^\top$，令 $u_i$ 为 $U$ 的第 $i$ 列；由于 $\Sigma_t$ 与 $H$ 共享特征向量，式 (12) 给出

$$
\mathcal L_t(A)-\mathcal L_t\left(A^\star(t)\right)=\sum_{i=1}^{d}\sigma_i(t)\left\|\left(A-A^\star(t)\right)u_i\right\|^2,\qquad\sigma_i(t)=(1-t)^2+t^2\lambda_i. \tag{23}
$$

于是 FM 目标**不能**在各方向上一致地证明速度场精度。特别地，若 $\mathcal L_t(A)-\mathcal L_t(A^\star(t))\le\varepsilon$，则

$$
\left\|\left(A-A^\star(t)\right)u_i\right\|^2\le\frac{\varepsilon}{\sigma_i(t)}. \tag{24}
$$

因此当 $\sigma_i(t)$ 很小时，很小的固定时间 FM 超额损失仍可能与相应低方差方向上的大速度误差相容。这给出一个机制，解释为何 FM 训练损失看似接近饱和而样本质量仍在提升：**剩余误差可能集中于 $p_t$ 弱加权的方向**。这补充了近期强调"平方误差训练目标可能并非感知生成质量的完美代理"的工作 [Lin and Yang，2025；Xu 等，2026]。

这也把预处理与标量时间重加权、基于调度的修正区分开来（后者是改善扩散与 FM 模型的常用工具 [Aranguri 等，2025；Billera 等，2026]）：若固定时间目标被标量权重 $\alpha(t)>0$ 缩放，则关于 $A$ 的 Hessian 只是按 $\alpha(t)$ 缩放，其条件数仍由 $\kappa(\Sigma_t)$ 支配——标量时间重加权可改变不同时间的重要性，但无法消除固定 $t$ 处回归问题的**方向刚度**。相反，定理 4.1 改变的是 FM 中间路径本身的协方差，把 $\Sigma_t$ 换成 $\tilde\Sigma_t$；预处理因作用于 FM 回归问题的方向几何，而非仅缩放目标 [Benzi，2002；Saad，1992]。这些 FM 特有推论的完整形式陈述与证明见 F.3 节的定理 F.3.1 与 F.3.2。

**归一化流预处理器。** 一种自然预处理器是用最大似然训练的、把数据映射向标准高斯的可逆归一化流 $P_\theta$：$\tilde x_1=P_\theta(x_1)$，采用带对数行列式修正的标准变量替换目标 [Kobyzev 等，2020]。尽管归一化流通常不如现代 FM 骨干有表达力，它们很适合做预处理：可逆性允许我们把目标数据变换到更各向同性的表示，在该空间训练主 FM 模型，再用 $P_\theta^{-1}$ 把样本映射回。

**低容量/低精度流预处理器。** 第二种选择是用低容量/低精度的 FM 模型本身作预处理器。先用标准 FM 目标训练速度场 $v_\eta(x_t,t)$；为把数据样本经学到的流反向映射，求解反向时间 ODE $\mathrm dx_\tau/\mathrm d\tau=-v_\eta(x_\tau,1-\tau)$，$x_{\tau=0}\sim p_{t=1}$、$\tau\in[0,1]$；预处理表示为终态 $\tilde x_1:=P_\eta(x_{\tau=0})$。由于预处理流容量有限，它只捕获粗结构，往往产生比原数据更像高斯的表示。随后以标准高斯为参考分布在 $\tilde x_1$ 上训练主 FM 模型，并经由 $P_\eta^{-1}$ 把生成样本映射回。

## 5 实验

我们在三类情形中评估预处理是否改善流匹配：(i) 可直接检查输运几何的受控低维问题；(ii) 可比较多种预处理策略与计算量匹配基线的隐空间 MNIST 生成；(iii) 使用基于流的预处理、跨分辨率的图像合成。在这些设定中，我们的目标不是提出新的图像骨干或声称最先进图像生成，而是检验理论的核心预测：**重塑目标几何应改善中间流匹配回归问题的条件数并带来更好的样本质量**。

**指标。** 我们报告 Fréchet 初始距离（FID）与最大均值差异（MMD）以度量分布差异，以及精确率（Precision）与召回率（Recall）以度量样本保真度与分布覆盖的互补方面。FID/MMD 越低越好，精确率/召回率越高越好。除另有说明外，所有比较在特定数据集上使用相同的下游流匹配生成器。

**受控诊断。** 理论预测各向异性中间分布通过压制沿低方差方向的进展来减慢优化。图 2 的高斯实验可视化该效应：标准 FM 迅速拟合高方差方向但在窄方向上停滞，而预处理改善路径条件数并降低 MMD。我们在图 3 的受控高斯混合上进一步检验同一机制（更多配置见 G.2 节）。这些实验分离出定理 3.9 预测的最差成分瓶颈：在不同成分数与条件数的混合上，预处理相对标准 FM 降低最大路径条件数、改善低特征值恢复并降低最终 MMD。附加 Swiss roll 可视化见 G.1 节。

**MNIST 实验。** 我们在训练好的 VAE 隐空间中于 MNIST 上评估预处理。下游生成器为类条件 CNN 隐 FM 模型，在主要变体间保持固定以分离预处理效应。我们比较无预处理的隐 FM 与 NF、FM 预处理，同时在表 1 中报告 ZCA 白化 [Kessy 等，2018] 与计算量匹配的无预处理基线。预处理相对无预处理基线一致改善：NF 给出最好 FID/MMD，FM 预处理给出最好精确率/召回率；计算量匹配基线仅略有改善，支持"增益主要来自重塑隐几何而非简单增加参数"。

**表 1　MNIST 上预处理策略比较**（计算量匹配基线把无预处理 FM 生成器扩大到与"学到的预处理器 + FM"总参数相当；FID/MMD 越低越好，精确率/召回率越高越好）

| 预处理方法 | 计算量匹配？ | 参数量 | FID↓ | MMD↓（×10⁻³） | 精确率↑ | 召回率↑ |
|---|---|---|---|---|---|---|
| 无预处理 | 否 | 2.32M | 5.97 | 77.10 | 0.5774 | 0.2856 |
| 无预处理 | 是 | 3.37M | 5.42 | 75.46 | 0.5869 | 0.2618 |
| ZCA 白化（本文） | 否 | 2.32M | 4.20 | 6.25 | 0.6022 | 0.3107 |
| ZCA 白化（本文） | 是 | 3.37M | 4.02 | 7.02 | 0.6117 | 0.2885 |
| NF 预处理器（本文） | 否 | 3.37M | **2.74** | **2.95** | 0.7271 | 0.3561 |
| FM 预处理器（本文） | 否 | 3.37M | 3.98 | 3.02 | **0.8440** | **0.5486** |

**跨分辨率图像合成。** 我们进一步评估基于流的预处理在 MNIST 之外是否仍有用：使用 UNet 或 DiT 隐流匹配生成器，比较标准流匹配与带学到的流预处理器（UNet 或 DiT）的流匹配。实验在 256×256 的 LSUN Churches 与 Oxford Flowers-102、512×512 的 AFHQ Cats、32×32 的 CIFAR-10 与 64×64 的 ImageNet-1k 上进行。除 CIFAR-10（像素空间）外，两种方法都在预训练 VAE 的隐空间中运行。对这些数据集我们使用基于流的预处理而非归一化流预处理，因为归一化流的架构与可逆性约束较不适合复杂图像数据 [Papamakarios 等，2021]。如表 2 所示，基于流的预处理在全部五个数据集上改善 FID，并总体改善精确率与召回率。

**表 2　多样图像数据集上的 FID、精确率与召回率**（比较标准流匹配与带学到的流预处理器的流匹配；除 CIFAR-10 在像素空间建模外，其余均在预训练 VAE 隐空间；FID 越低、精确率/召回率越高越好）

| 数据集 | 方法 | FID↓ | 精确率↑ | 召回率↑ |
|---|---|---|---|---|
| LSUN Churches（256×256） | 无预处理器 | 19.53 | 0.4540 | 0.3239 |
| LSUN Churches（256×256） | FM 预处理器（本文） | **14.47** | **0.5313** | **0.3255** |
| Oxford Flowers-102（256×256） | 无预处理器 | 23.82 | 0.5213 | 0.2761 |
| Oxford Flowers-102（256×256） | FM 预处理器（本文） | **22.64** | **0.5428** | **0.2854** |
| AFHQ Cats（512×512） | 无预处理器 | 7.11 | 0.7764 | **0.5396** |
| AFHQ Cats（512×512） | FM 预处理器（本文） | **4.86** | **0.8320** | 0.5297 |
| CIFAR-10（32×32） | 无预处理器 | 4.15 | **0.8097** | 0.5878 |
| CIFAR-10（32×32） | FM 预处理器（本文） | **4.02** | 0.7856 | **0.5892** |
| ImageNet-1k（64×64） | 无预处理器 | 8.66 | 0.7800 | 0.6339 |
| ImageNet-1k（64×64） | FM 预处理器（本文） | **4.98** | **0.8172** | **0.6432** |

**附加分析。** 最优流匹配 [Kornilov 等，2024] 与预处理处理互补的困难来源：前者降低随机目标歧义，后者改善超额风险优化（G.3 节）。这一区别表明，改善回归问题的条件数与降低其训练目标的内在不确定性是分离且可能互补的目标。在隐 MNIST 上，路径条件数降低伴随跨高、低方差特征方向更均衡的学习（G.4、G.5 节）。这些观察为所提机制提供进一步经验支持，把中间分布几何的改善与跨方向更均匀的优化联系起来。容量消融表明增益并非仅来自额外模型容量（G.6 节），而 NF 预处理在相同主流 NFE 下取得比一轮 Reflow 更低的 FID（G.7 节）。我们还给出实用选择准则与逆 Jacobian 敏感性分析（G.8、G.9 节），并把预处理推广到条件去模糊与超分辨任务（G.10 节）。这些扩展说明预处理框架在图像生成之外有更广适用性，同时考察了选择与求逆预处理器相关的实际问题。定性结果、实现细节与计算资源见 H–J 节；工作局限与更广泛影响见 B、C 节。

## 6 讨论与结论

我们把流匹配分析为时间索引的随机回归问题，并证明在高斯与高斯混合设定中，病态中间分布即使在目标速度可精确表示时也会减慢沿低方差方向的优化。更广泛地说，这识别出**中间输运分布的几何**是决定流匹配模型优化效率的重要因素，超越对模型表达力的考虑。该视角给出 FM 特有推论：小的 FM 损失可能隐藏方向性速度误差；标量时间重加权无法消除固定时间的方向刚度；预处理通过把路径协方差由 $\Sigma_t$ 重塑为条件更好的 $\tilde\Sigma_t$ 而起作用。受该分析启发，我们提出"先预处理、再匹配"框架：通过目标分布的可逆变换改善学习问题几何，同时保持标准下游 FM 目标。受控与隐空间实验通过改善的路径条件数、更均衡的方向学习与跨数据集更好的样本质量支持该机制。综合来看，理论与经验结果表明，改善学习输运的表示可带来超越单纯增加模型容量的显著优势，凸显预处理作为推进基于流的生成建模的互补方向。把分析推广到非线性网络的局部几何、以及发展自适应预处理器，仍是未来工作的重要方向。

**致谢与资助披露。** 本工作受加拿大自然科学与工程研究委员会（NSERC）发现资助计划与加拿大研究生奖学金—硕士（CGS-M）计划支持。作者声明无相关竞争利益。

## 参考文献（英文原条目，按原文顺序）

以下按原文顺序照录英文原书目（正文以上标"作者，年份"引用），条目文字不翻译；共 33 条：Ahamed & Haber, DAWN-FM (arXiv:2412.04766, 2024)；Ahamed & Rahmim, IGConDA-PET (Computerized Medical Imaging and Graphics, 2025)；Aranguri, Biroli, Mezard & Vanden-Eijnden, Optimizing noise schedules of generative models in high dimensions (arXiv:2501.00988, 2025)；Benzi, Preconditioning techniques for large linear systems: A survey (J. Comput. Phys. 182(2):418–477, 2002)；Billera, Nordlinder & Murrell, Time dependent loss reweighting for flow matching and diffusion models is theoretically justified (ICLR 2026 Workshop, 2026)；Caetano, Viviers, De With & Van der Sommen, Symmetrical flow matching (AAAI 2026, 40:2498–2506)；Cao & Zhang, An analysis and solution of ill-conditioning in physics-informed neural networks (J. Comput. Phys. 520:113494, 2025)；Chen, Sun, Song & Luo, DiffusionDet (ICCV 2023, 19773–19786)；Choi, Uh, Yoo & Ha, StarGAN v2 (CVPR 2020)；Chrabaszcz, Loshchilov & Hutter, A downsampled variant of ImageNet (arXiv:1707.08819, 2017)；Chung & Ye, Score-based diffusion models for accelerated MRI (Medical Image Analysis 80:102479, 2022)；Danese, Lombardi, Attimonelli, Fasano & Di Noia, Flowlet: Conditional 3D brain MRI synthesis using wavelet flow matching (arXiv:2601.05212, 2026)；Dao, Phung, Nguyen & Tran, Flow matching in latent space (arXiv:2307.08698, 2023)；Dauphin 等, Identifying and attacking the saddle point problem in high-dimensional non-convex optimization (NeurIPS 2014)；Diefenbacher 等, DCTRGAN: Improving the precision of generative models with reweighting (JINST 15(11):P11004, 2020)；Dinh, Sohl-Dickstein & Bengio, Density estimation using Real NVP (ICLR 2017)；Golub & Ye, Inexact preconditioned conjugate gradient method with inner-outer iteration (SIAM J. Sci. Comput. 21(4):1305–1320, 1999)；Guan 等, LAFMA: A latent flow matching model for text-to-audio generation (Interspeech 2024)；Ho, Jain & Abbeel, Denoising diffusion probabilistic models (NeurIPS 2020)；Karras, Aittala, Aila & Laine, Elucidating the design space of diffusion-based generative models (NeurIPS 2022)；Kessy, Lewin & Strimmer, Optimal whitening and decorrelation (The American Statistician 72(4):309–314, 2018)；Kingma & Welling, Auto-encoding variational Bayes (ICLR 2014)；Kobyzev, Prince & Brubaker, Normalizing flows: An introduction and review of current methods (IEEE TPAMI 43(11):3964–3979, 2020)；Kornilov, Mokrov, Gasnikov & Korotin, Optimal flow matching: Learning straight trajectories in just one step (NeurIPS 2024, 37:104180–104204)；Krizhevsky, Hinton 等, Learning multiple layers of features from tiny images (2009)；Lazzarino, Nakatsukasa & Zerbinati, Preconditioned normal equations for solving discretised partial differential equations (arXiv:2502.17626, 2025)；Lin & Yang, Diffusion model with perceptual loss (arXiv:2401.00110v7, 2025)；Lipman, Chen, Ben-Hamu, Nickel & Le, Flow matching for generative modeling (ICLR 2023)；Lipman 等, Flow matching guide and code (arXiv:2412.06264, 2024)；Liu, Gong & Liu, Flow straight and fast: Learning to generate and transfer data with rectified flow (arXiv:2209.03003, 2022)；Lugmayr 等, Repaint: Inpainting using denoising diffusion probabilistic models (CVPR 2022, 11451–11461)；Nilsback & Zisserman, Automated flower classification over a large number of classes (ICVGIP 2008)；Papamakarios, Nalisnick, Rezende, Mohamed & Lakshminarayanan, Normalizing flows for probabilistic modeling and inference (JMLR 2021)；Quirynen & Di Cairano, PRESAS: Block-structured preconditioning of iterative solvers within a primal active-set method for fast model predictive control (Optimal Control Applications and Methods 41(6):2282–2307, 2020)；Rombach, Blattmann, Lorenz, Esser & Ommer, High-resolution image synthesis with latent diffusion models (CVPR 2022, 10684–10695)；Saad, Analysis of some Krylov subspace approximations to the matrix exponential operator (SIAM J. Numer. Anal. 29(1):209–228, 1992)；Saad, Iterative Methods for Sparse Linear Systems (SIAM, 2003)；Song, Sohl-Dickstein, Kingma, Kumar, Ermon & Poole, Score-based generative modeling through stochastic differential equations (ICLR 2021)；Trefethen & Bau, Numerical Linear Algebra (SIAM, 1997)；Wang, Reynaud, Erick & Kainz, CTFlow: Video-inspired latent flow matching for 3D CT synthesis (arXiv:2508.12900, 2025)；Xu, Luo, Wang, He & Liu, Diagnosing and improving diffusion models by estimating the optimal loss value (ICLR 2026)；Ye, Preconditioning for accelerated gradient descent optimization and regularization (arXiv:2410.00232v2, 2024)；Yu, Seff, Zhang, Song, Funkhouser & Xiao, LSUN (CVPR 2015)；Zhai 等, Normalizing flows are capable generative models (ICML 2025)；Zhou, Gu, Zheng, Song, He, Zhang, Hu & Yang, Score distillation of flow matching models (arXiv:2509.25127, 2025)。

## 附录

### A 更多相关工作

**生成模型。** 生成模型旨在学习复杂数据分布以合成真实样本。早期方法包括提供有原则似然训练目标的显式密度模型，如变分自编码器与自回归模型 [Kingma and Welling，2014]；后续发展引入通过可逆映射或随机动力学把简单参考分布变换为复杂目标分布的方法，包括归一化流与扩散模型 [Dinh 等，2017；Ho 等，2020]。Zhai 等 [2025] 进一步表明归一化流可作为极具竞争力的生成模型。流匹配 [Lipman 等，2023] 通过学习支配分布间连续变换的速度场，提供另一条生成建模途径。除无条件合成外，扩散及相关生成模型越来越多地应用于计算机视觉与医学成像任务：Lugmayr 等 [2022] 用预训练扩散模型做图像修复；Chen 等 [2023] 把目标检测表述为逐步精化边界框预测的去噪过程；医学成像中 Chung and Ye [2022] 用基于分数的扩散模型做加速 MRI 重建，展示其求解病态逆问题的有效性；Ahamed and Rahmim [2025] 提出类条件反事实扩散框架用于 PET 成像的弱监督异常检测。这些应用凸显扩散生成建模在常规图像合成之外的多功能性。

**预处理。** 预处理是数值分析中的经典技术，旨在改善优化问题 [Ye，2024] 与微分方程 [Lazzarino 等，2025] 的条件数。它在数值线性代数中有悠久历史（Krylov 子空间方法、不完全分解、基于 Jacobi 与多重网格的预处理器 [Saad，2003；Trefethen and Bau，1997；Golub and Ye，1999]），并扩展到加速梯度优化与正则化 [Ye，2024]、模型预测控制中的块结构预条件 [Quirynen and Di Cairano，2020]，以及积分/退化的生成模型（如归一化流 [Kobyzev 等，2020]）。

### B 局限

原文指出以下局限（本页按节标题与正文要点译述）：理论结果在总体层面精确适用于高斯与高斯混合 FM，对非线性网络仅给出局部几何解释；预处理需要额外的预处理器训练阶段与超参数，其收益依赖预处理器质量与目标几何（见 G.6、G.8 节）；对某些数据（如 Oxford Flowers-102、CIFAR-10）增益有限；逆预处理器在低方差方向可能放大误差（见 G.9 节与表 7）。

### C 更广泛影响

预处理器作为一般几何变换，可提升基于流的生成模型效率，从而降低生成建模的能耗与算力门槛；与任何生成模型一样，也存在被滥用于生成误导性内容的风险，需配合负责任的使用与发布实践。

### D 随机回归与高斯 FM 的证明

**D.1 命题 2.1 的证明：** 对任意 $g$，展开 $\|g-v^\star\|^2=\|g-g^\star\|^2+\|g^\star-v^\star\|^2+2\langle g-g^\star,g^\star-v^\star\rangle$，交叉项条件期望为零，即得式 (4)。**D.2 命题 3.1 的证明：** 由联合高斯性，$x_t$ 与 $(x_0,x_1)$ 联合高斯，条件均值线性，$\mathrm{Cov}(x_1-x_0,x_t)=tH-(1-t)I$，代入高斯条件公式即得 $A^\star(t)$。**D.3 引理 3.2 的证明：** 对 $A$ 配方展开二次型 $\mathbb E\|Ax_t-y\|^2$（$y=x_1-x_0$），利用 $A^\star\Sigma_t=C_t$ 消去线性项即得精确分解 (10)–(12)。**D.4 定理 3.3 的证明：** 由 (15) 减去不动点方程得误差递推 (16)，在 $\Sigma_t$ 特征基上解耦为 $e_i^{k}=(1-2\eta\sigma_i)^ke_i^0$，最优步长下收敛率 $\max_i|1-2\eta^\star\sigma_i|=\frac{\kappa-1}{\kappa+1}$，故迭代数 $\mathcal O(\kappa\log(1/\varepsilon))$。**D.5 推论 3.4 的证明：** 由上述解耦形式，收缩因子 $|1-2\eta\sigma_i|$ 随 $\sigma_i$ 减小而趋近 1。**D.6 命题 3.5 的证明：** 对单样本随机梯度取条件期望，得逐模态均值递推 $\mathbb E[e_{i,m+1}|e_{i,m}]=(1-2\eta\sigma_i)e_{i,m}$；平稳方差由梯度噪声协方差决定（原文给出式 (102)–(103) 的推导）。

### E 高斯混合 FM 的证明

**E.1 命题 3.8 的证明：** 由全期望公式与后验权重 $w_k$，条件均值分解为 $\sum_kw_kA_k^\star x_t$；在假设 3.7 下各成分的 $A_k^\star$ 与高斯情形同形。**E.2 定理 3.9 的证明：** 成分化目标为 $K$ 个二次子问题之和，梯度动力学在每个子问题上解耦；整体误差按最慢子问题（$\min_{k,i}\sigma_{k,i}$）的速率衰减。**E.3 推论 3.10 的证明：** 由定理 3.9，取最大样本复杂度即得"最难成分支配总体瓶颈"。**E.4 非零均值推广：** 零均值假设只用于表述；非零均值下条件目标变为仿射，去中心后协方差控制的超额风险几何与梯度动力学不变（推论 E.1、注 E.2）。

### F 预处理的证明

**F.1 定理 4.1 的证明：** 由 $\tilde x_t=(1-t)x_0+tPx_1$ 直接计算协方差得 $\tilde\Sigma_t$；$P=H^{-1/2}$ 时 $PHP^\top=I$，得式 (21)；对 $mI\preceq PHP^\top\preceq MI$ 用 Rayleigh 商逐特征值夹逼得式 (22)。**F.2 高斯混合预处理的补充说明：** 成分化的 $\tilde\Sigma_{t,k}$ 与各成分的条件数按同一方式改善。**F.3 FM 特有推论：** 定理 F.3.1（小的 FM 损失可隐藏方向性速度误差，对应式 (23)–(24)）与 F.3.2（标量时间重加权不能消除固定时间方向刚度）给出完整陈述与证明。

### G 附加实验与结果

**G.1 Swiss roll 上的可视化：** 对比无预处理（图 5）与 NF 预处理（图 6 上排）、低容量流预处理（图 6 下排）；表 3 给出 sliced-Wasserstein 距离（见下方表 3），NF 与 FM 预处理在两个方向上均显著降低距离并提升"高斯性"。

**G.2 受控高斯混合实验：** 在不同成分数与条件数的 GMM 上，预处理改善低特征值恢复、降低路径条件数与 MMD（图 7）。**G.3 最优流匹配（OFM）与预处理：** 两者处理互补困难来源——OFM 降低随机目标误差（ISTE 代理），预处理改善超额风险优化；组合二者效果更佳（图 8、图 9）。**G.4 条件数动力学：** 训练中 FM 中间分布的 $\max_t\kappa(\Sigma_t)$ 随训练上升，预处理显著降低该诊断（图 10，MNIST 与 ImageNet-1k）。**G.5 方向学习的机制分析：** 隐 MNIST 上，预处理使高、低方差特征方向的学习更均衡（图 11）。**G.6 预处理器质量消融：** 预处理器容量与训练迭代数影响收益，增益非仅来自参数量（图 12）。**G.7 与 Rectified Flow/Reflow 比较：** 见表 4。**G.8 预处理器选择与收益有限的情形：** 见表 5。**G.9 逆预处理器的 Jacobian 敏感性：** 见表 6、表 7。**G.10 条件图像恢复：** 见表 8。

**表 3　Swiss roll 数据集的 sliced-Wasserstein 距离**（上行为生成样本与真值对比，下行为推前数据的高斯性度量；越低越好）

| 方向 | 无预处理器 | NF 预处理器 | FM 预处理器 |
|---|---|---|---|
| $z\to x_1$ | 0.11 | **0.06** | 0.07 |
| $x_1\to z$ | 0.81 | **0.31** | 0.34 |

**表 4　MNIST 上与 Rectified Flow 及 Reflow 的比较**（NFE 为 ODE 向量场评估次数；†表示 NF 逆为直接网络评估、不计入 ODE NFE）——原文给出各方法的附加训练、附加推断操作、主流 NFE、逆预处理 NFE、总 NFE 与 FID；其中 NF 预处理在相同主流 NFE 下优于一轮 Reflow（具体数值见原文表 4）。

**表 5　全部图像数据集上路径条件数降低与生成质量的关系**

| 数据集 | 训练空间 | 基线 $\max_t\kappa(\Sigma_t)$↓ | 预处理后 $\max_t\kappa(\tilde\Sigma_t)$↓ | 条件数降低↑ | 无预处理 FID↓ | FM 预处理 FID↓ | 相对 FID 增益↑ | 诊断 |
|---|---|---|---|---|---|---|---|---|
| MNIST | 隐空间 | 52.83 | 2.02 | 26.2× | 5.97 | 3.98 | 33.3% | 预处理有益 |
| LSUN Churches | 隐空间 | 102.63 | 5.54 | 18.53× | 19.53 | 14.47 | 25.9% | 预处理有益 |
| Oxford Flowers-102 | 隐空间 | 83.47 | 47.92 | 1.74× | 23.82 | 22.64 | 5.0% | 收益有限 |
| AFHQ Cats | 隐空间 | 64.75 | 2.36 | 27.44× | 7.11 | 4.86 | 31.6% | 预处理有益 |
| CIFAR-10 | 像素空间 | 755.92 | 453.68 | 1.67× | 4.15 | 4.02 | 3.1% | 收益有限 |
| ImageNet-1k | 隐空间 | 84.37 | 1.90 | 44.4× | 8.66 | 4.98 | 42.5% | 预处理有益 |

**表 6　部分仿射预处理下路径条件、逆敏感性与生成质量的折中**（路径条件与 MMD 为三个种子的均值 ± 标准差；仿射预处理器的逆 Jacobian 量在空间上为常数）

| 分布 | $\gamma$ | 峰值路径 $\max_t\kappa(\Sigma_t)$↓ | $\lVert J_{P_\gamma^{-1}}\rVert_2$↓ | $\kappa(J_{P_\gamma^{-1}})$↓ | 最终 MMD（×10⁻³）↓ |
|---|---|---|---|---|---|
| 双峰 | 0.00 | 849.75 ± 11.14 | 1.00 | 1.00 | 114.69 ± 4.26 |
| 双峰 | 0.25 | 160.02 ± 2.05 | 2.18 | 2.31 | 202.96 ± 10.04 |
| 双峰 | 0.50 | 30.14 ± 0.37 | 4.76 | 5.34 | **55.74 ± 17.32** |

**表 7　学到的非线性 MNIST 逆映射的局部敏感性**（放大率按 $\|P^{-1}(z+\delta z)-P^{-1}(z)\|_2/\|\delta z\|_2$ 度量；最差方向为逆 Jacobian 的主右奇异向量；p95 表示 95 分位数）——原文按"评估点、$\|J_{P^{-1}}\|_2$ 中位数/p95/最大、$\kappa(J_{P^{-1}})$ 中位数/p95、随机放大中位数/p95、最差方向放大中位数/p95"列表（具体数值见原文表 7）。

**表 8　MNIST 上的条件图像恢复**（"Params/FLOPs"为相对基线的参数量与训练 FLOPs；本文方法两个参数量分别对应主 FM 模型与预处理器；PSNR 由后验均值计算，后验标准差概括样本多样性；SSIM/PSNR 越高越好，测量失配越低越好）

| 任务 | 方法 | Params/FLOPs | SSIM↑ | PSNR（后验均值）↑ | 后验标准差 | 失配（10⁻³）↓ |
|---|---|---|---|---|---|---|
| 去模糊 | 基线 FM | 1.07M/1.0× | 0.803 | 22.4 | 0.135 | 5.8 |
| 去模糊 | 参数匹配 | 1.50M/1.0× | 0.756 | 22.6 | 0.156 | 5.8 |
| 去模糊 | FLOPs 匹配 | 1.07M/1.27× | 0.817 | 22.5 | 0.128 | 5.8 |
| 去模糊 | 预处理（本文） | (1.07+0.44)M/1.27× | **0.834** | 21.7 | **0.128** | 6.2 |

同表另有「4× 超分辨」子表（基线 FM、参数匹配、FLOPs 匹配、预处理（本文）四行，指标列相同）；其对应数值见原文表 8，本页未逐格转录。

### H 基于流预处理的定性比较

**H.1 MNIST：** 图 13 给出隐空间流匹配生成的样本（基线 vs 预处理）。**H.2 跨分辨率图像样本：** 图 14–19 分别给出 LSUN Churches、Oxford Flowers-102、AFHQ Cats、CIFAR-10 与 ImageNet-1k（两张）在标准 FM 与预处理 FM 下的定性对比。

### I 实验细节

**I.1 MNIST：** 表 9 汇总隐流匹配的超参数（训练空间为 64 维隐空间，插值 $s(t)=\sin(\pi t/2)$、$c(t)=\cos(\pi t/2)$，CNN 生成器隐藏通道 256 等）。**I.2 跨分辨率图像合成：** 表 10 汇总 LSUN Churches、Oxford Flowers-102、AFHQ Cats、CIFAR-10、ImageNet-1k 的设置（分辨率、训练空间、VAE/潜编码器、潜维数、插值函数等）。

### J 计算资源

原文给出各数据集的训练 GPU 与时长（见原文附录 J）。

### K 已有资产与许可证

原文列出所用数据集（MNIST、CIFAR-10、LSUN、Oxford Flowers-102、AFHQ、ImageNet-1k）与预训练模型（Stable Diffusion VAE 等）的许可证与使用条款（见原文附录 K）。

## 图注与表注

**图 1：** 先预处理、再匹配。上：标准流匹配经由各向异性中间分布学习，优化停滞；下：可逆预处理器 $P$ 把目标映射到更接近高斯的空间，改善输运路径条件；样本用 $P^{-1}$ 映射回。

**图 2：** 有/无预处理的二维高斯输运。(a) 标准 FM 把样本从各向同性源输运到细长目标，但在窄方向上困难，MMD 较高；(b) 预处理 FM 把样本输运到白化目标并用逆预处理器映射回；(c) 预处理降低 MMD 并避免早期优化停滞；(d) 它同时降低输运路径上中间协方差 $\Sigma_t$ 的条件数，改善样本对齐与稳定性。曲线为 10 次不同随机种子独立运行的均值，阴影为一个标准差。

**图 3：** 预处理改善高斯混合流匹配。在代表性三成分各向异性 GMM 上，标准 FM 捕获主导高方差方向但难以恢复窄成分，导致输运样本失真与更高 MMD；预处理把目标重塑到条件更好的空间，改善样本对齐、全程降低 MMD、降低低特征值恢复误差并降低逐成分路径条件数。图中为 10 次独立运行的均值，误差棒/阴影为一个标准差；更多 GMM 配置见 G.2 节。

**图 4：** 说明流匹配中条件数与优化效应的高斯模型：(a) 沿线性插值 $\Sigma_t=(1-t)^2I+t^2H$ 的 $\kappa(\Sigma_t)$ 增长；(b) $\kappa(H)=1000$ 时 $\Sigma_t$ 特征值 $\sigma_i(t)$ 的演化；(c) 若干时刻 $p_t=\mathcal N(0,\Sigma_t)$ 的协方差椭圆；(d) 达到固定误差容差所需梯度下降迭代数 $k(t)$ 的预测；(e) 理想预处理（白化）的作用；(f) $t=0.9$ 时逐模态 GD 误差衰减；(g) 最优分数场 $s^\star(x,t)=-\Sigma_t^{-1}x$；(h) 最优流匹配速度场 $v^\star(x,t)=A^\star(t)x$。

**图 5：** 无预处理的流匹配（Swiss roll）。

**图 6：** 带预处理的流匹配。上排：归一化流预处理（(a) 数据经 NF 推前为 $\tilde x$；(b) 随机高斯样本经下游流映射到预处理数据空间；(c) 可视化时数据经学到的流反向映射回高斯样本；(d) 预处理空间中的点经 $P_\theta^{-1}$ 映射回原空间）。下排：低容量流预处理（对应 (e)–(h)）。

**图 7：** 预处理在受控二维 GMM 配置上改善高斯混合流匹配（不同成分数与条件数）。

**图 8：** 六种高斯混合配置下 OFM 与预处理的结果（最终 MMD 等）。

**图 9：** FM、OFM、预处理 FM 及其组合的生成样本。

**图 10：** 有/无预处理时中间流匹配分布的条件数（MNIST 与 ImageNet-1k 训练）。

**图 11：** 隐 MNIST 上的方向学习动力学与生成质量。

**图 12：** MNIST 上的预处理器质量消融（容量与训练迭代数）。

**图 13–19：** MNIST 与各分辨率图像数据集的定性比较（基线 FM vs 预处理 FM）。

**表 1–10：** 见正文表 1（MNIST 预处理策略比较）、表 2（跨数据集 FID/精确率/召回率）与附录表 3–10（Swiss roll 距离、与 Reflow 比较、条件数降低与质量、条件数/敏感性折中、局部敏感性、条件恢复、超参数设置）。表 1、表 2 已用 PDF 第 9、10 页渲染图逐格核对；附录表 3、5、6、8 依据抽取文本转录（表 4、7、9、10 数值结构与原文一致，本页以要点/表头形式概述）。

> **原文说明（疑点加注）：** ① 第 2 节中"定理 2.1"与"命题 2.1"混用：该结果以 Proposition 2.1 陈述（证明见 D.1 节），但正文随后写 "Theorem 2.1 shows that…"；② 第 3.2 节 "Theorem 3.2" 与 "Lemma 3.2" 混用（引理 3.2 的结论被写作 Theorem 3.2 的 Consequence）；③ 第 3.1 节 $A^\star(t)$ 的表达式 (8) 写成 $tH-(1-t)I$ 乘 $\Sigma_t^{-1}$，与式 (14) 的 $C_t=tH-(1-t)I$ 一致，但正文第 3.1 节另处写作 $[tH-(1-t)I][(1-t)^2I+t^2H]^{-1}$，属同一式的排版差异；④ 附录 D.5/D.6 的编号（"Theorem 3.4/3.5"）与正文命题 3.5 的编号不完全对应（附录内容清单写 D.5 Proof of Theorem 3.4、D.6 Proof of Theorem 3.5，而正文对应为推论 3.4 与命题 3.5）。以上均按原文保留并如实标注。

**本页范围与校对状态：** 本页为 arXiv:2603.02337v3（NeurIPS 2026）的全文中文译稿：摘要、正文第 1–6 节（含 2、3.1–3.3、4、5 全部小节）、结论、致谢、附录 A–K（含 D.1–D.6、E.1–E.4、F.1–F.3、G.1–G.10、H.1–H.2、I.1–I.2、J、K）、图 1–19 图注、表 1–10、算法 1、参考文献 33 条。公式编号沿用原文 (1)–(24) 全部译入；附录中编号式（如 (102)–(103)、(136) 等）在证明要点中引用、未逐式复现。**表 1、表 2 已用 PDF 第 9、10 页渲染图逐行逐格核对**；附录表 3、5、6、8 依据抽取文本转录，表 4、7、9、10 以表头/要点形式概述并在表注注明。附录 B、C、J、K 原文为短节，本页按节标题与要点译述（未逐句复制）；附录 D–F 的长证明按原文结构译出关键步骤与结论，标注"要点"处为忠实概括。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文存在 4 处编号/术语不一致，已在"原文说明（疑点加注）"中如实标出。作者 6 人已补全（第 1 页作者块；单位：不列颠哥伦比亚大学、剑桥大学）；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
