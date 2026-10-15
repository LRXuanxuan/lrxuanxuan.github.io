---
layout: page
title: "基于先验少步传输映射的源空间 MCMC 后验采样｜中文阶段性译稿"
permalink: /papers/translations/2026-10-15-source-space-mcmc-imf-2610-01034/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2610.01034) · [原始 PDF](https://arxiv.org/pdf/2610.01034v1) · [对应推荐记录](/papers/items/b953516010d4360b/)

# 基于先验少步传输映射的源空间 MCMC 后验采样

**原题：** Posterior sampling by source-space MCMC via prior-based few-step transport maps  
**作者：** Hoang Phuc Hau Luu、Marcelo Hartmann、Zhongjian Wang  
**原文：** arXiv:2610.01034v1，2026 年 10 月 1 日，共 34 页。  
**许可与署名：** 原文按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布；本页为中文翻译，已对语言作转换，保留原作者署名与原文链接；译文未经原作者认可。  
**译文范围（必须阅读）：** 已翻译**摘要、正文第 1–5 节、原文两张主表及 AI 使用声明和致谢**，涵盖原文公式 (1)–(21)。**附录 A–B、参考文献完整转录与部分图表细节尚未翻译/核对，因此不是全文译文，尚未通过全文 QA。** 公式编号与原文一致；图表请对照原文 PDF。

## 摘要

贝叶斯推断越来越多地使用具有丰富信息、却只能通过样本表征的隐式先验，例如历史样本集合、仿真器输出以及预训练生成模型。同样的计算问题也存在于测试时引导（广义贝叶斯）任务中：一个显式给定的正权重函数（例如对奖励函数取指数）会使隐式先验发生倾斜。

本文提出一个源空间广义贝叶斯推断框架，将计算成本较低的少步先验传输与后验稳定性保证相结合。具体而言，我们采用单步或少步的改进 MeanFlow（improved MeanFlow，iMF）映射表征先验，并在该映射的高斯源空间中进行后验采样。我们以 iMF 与辅助速度场的联合总体损失为基础，推导精确后验与学习后验之间的 Wasserstein 误差界，并将误差分解为训练次优性和模型类逼近误差。

在 iMF 源空间内，我们采用结合预条件 Crank–Nicolson（pCN）更新的并行回火算法，并引入融合分裂式 Hamiltonian Monte Carlo（HMC）的混合变体，以提高采样效率。合成实验表明，该框架能够准确、高效地近似后验分布；CLIP 引导的 ImageNet 实验则说明，它可以按照文本指定的偏好引导预训练 iMF 图像先验。

## 1. 引言

贝叶斯推断将先验知识与观测相结合，以刻画未知量的不确定性（Stuart，2010）。然而，在许多应用中，先验信息不是以显式概率密度的形式给出，而是通过样本获得，例如历史样本集合、仿真器输出或预训练生成模型（Patel & Oberai，2019；Chung 等，2023；Lunz 等，2018）。这些先验样本能够表征难以用解析式编码的复杂结构，但其概率密度和得分函数无法直接用于后验马尔可夫链蒙特卡洛（MCMC）采样。

形式上，令 $x\in\mathbb R^{d_x}$ 为未知变量，其先验 $\pi_0$ 只能通过独立同分布样本访问，$y$ 表示观测或任务描述。我们通过如下广义后验统一贝叶斯推断与广义贝叶斯推断：

$$
\pi^y(dx)=Z_y^{-1}\ell_y(x)\pi_0(dx),\qquad
Z_y=\int \ell_y(x)\pi_0(dx). \tag{1}
$$

其中，$\ell_y$ 是解析给定的非负权重，并假设 $0<Z_y<\infty$。标准贝叶斯推断取 $\ell_y(x)=p(y\mid x)$；广义贝叶斯推断（Bissiri 等，2016）可令 $\ell_y(x)=\exp(-\tau L_y(x))$，其中 $L_y$ 是任务损失函数，$\tau>0$。奖励引导（Korbak 等，2022）同样符合该形式，只需取 $\ell_y(x)=\exp(\tau R_y(x))$，从而偏向奖励 $R_y$ 更高的样本。例如，$y$ 可表示文本提示，$R_y(x)=\operatorname{CLIP}(x,y)$ 则衡量图像 $x$ 与提示 $y$ 的 CLIP 嵌入之间的余弦相似度（Radford 等，2021）。下文统一用 $\ell_y$ 表示似然或一般权重，并将 $\pi^y$ 简称为后验。

一种途径是通过去噪得分匹配（DSM；Vincent，2011）学习数据空间中的先验得分，再与解析对数似然或奖励的梯度结合，构造 Langevin 或 Hamiltonian 动力学。由于仅有学习得到的得分无法提供 Metropolis 校正所需的密度比，这些采样器通常不执行校正。此外，在复杂数据流形附近，得分可能剧烈变化，使动力学呈现刚性并要求较小的积分步长。

另一种途径是先学习确定性生成器 $S_\theta:\mathbb R^{d_z}\to\mathbb R^{d_x}$，使得 $(S_\theta)_\#\gamma\approx\pi_0$。这里 $\gamma=\mathcal N(0,I)$ 为源分布，$\mathbb R^{d_z}$ 称为**源空间**，$\#$ 表示测度的推前。在学习模型 $S_\theta$ 下，复杂的数据空间先验可由简单的高斯参考测度 $\gamma$ 表示。对应的学习源空间后验为

$$
\nu_\theta^y(dz)\propto\ell_y(S_\theta(z))\gamma(dz). \tag{2}
$$

我们使用 MCMC 从 $\nu_\theta^y$ 采样，再经 $S_\theta$ 将样本映射到数据空间。与常规数据空间方法不同，$\nu_\theta^y$ 的密度可计算至归一化常数，因此能够进行 Metropolis 校正，并构造以 $\nu_\theta^y$ 为不变分布的 MCMC 转移核。此外，源空间后验有望具备更有利于 MCMC 的几何性质：其先验为高斯分布，而 $S_\theta$ 已吸收了 $\pi_0$ 的大部分曲率与各向异性。不过，复合似然或权重 $\ell_y\circ S_\theta$ 可能重新引入曲率、刚性、各向异性或多模态性；当观测模型信息量大或具有非线性时，这一点尤其明显。

Patel 等（2022）的早期工作使用 Wasserstein GAN 构造 $S_\theta$，并以结合 No-U-Turn Sampler 的 HMC 采样所得低维潜变量后验。但 WGAN 训练需要求解对抗性极大极小优化问题，可能难以稳定训练。基于流的方法（Chen 等，2018）提供了一个颇具吸引力的替代方案：流匹配（flow matching）通过标准回归目标学习时变向量场（Lipman 等，2023；Tong 等，2024），因而能够以可扩展方式为复杂、多模态先验学习富有表达力的传输映射。在速度场满足适当正则条件时，所产生的常微分方程（ODE）流还在源空间与数据空间之间定义微分同胚（Papamakarios 等，2021）。

人们已经从优化与采样两个角度探索了流匹配模型的源空间引导。D-Flow（Ben-Hamu 等，2024）优化源变量；Source-Guided Flow Matching（SGFM；Wang 等，2026b）则从式（2）的源空间后验采样。Source Parallel Tempering（SPT；Wang 等，2026a）将局部 pCN 更新与不同温度的副本交换相结合，以缓解多模态问题。这些源空间方法均属于测试时引导：在推断阶段纳入用户指定的似然或权重。

对于通过学习传输来表示先验的方法，一个核心理论问题是：先验学习误差如何控制学习后验 $(S_\theta)_\#\nu_\theta^y$ 与式（1）真实后验 $\pi^y$ 的偏差？我们将其称为**后验稳定性**。已有工作尝试回答这一问题，但仍存在缺口。Wang 等（2026b）假设速度场满足一致逼近误差界 $\|v_\theta(x,t)-v(x,t)\|_\infty\leq\epsilon$，而流匹配的训练目标实际控制的是平均平方误差，并非一致误差。Wang 等（2026a）改为根据 $L^2$ 传输映射误差 $\mathbb E_{z\sim\gamma}\|S(z)-S_\theta(z)\|^2\leq\epsilon^2$ 建立后验稳定性，其中 $S$ 是真实速度场诱导的精确传输映射；他们利用 Grönwall 不等式，将学习误差与**精确积分的学习流**联系起来。

但实际应用需要数值 ODE 求解器，因此还会产生离散化误差。在标准正则性与稳定性假设下，$k$ 阶 ODE 求解器的全局误差为 $O(h^k)$（Hairer 等，1993），仅凭训练目标并不能控制这一误差。减小 $h$ 意味着增加积分步数，从而提高每次源空间 MCMC 操作的成本。小批量最优传输耦合（Tong 等，2024）能够鼓励轨迹变直并便于少步积分，却不能单独提供数值误差界；相应理论依然针对精确积分的学习流。类似地，Purohit 等（2025）采用少步一致性模型，但没有证明一致性蒸馏目标如何控制所得后验误差。

本文追求两个相互补充的目标：一方面利用少步传输降低源空间推断的计算成本，另一方面通过真实的总体训练目标，为**实际实现的映射**建立后验稳定性保证。为此，我们采用 improved MeanFlow（iMF；Geng 等，2026b），直接学习时间区间上的平均速度，不依赖蒸馏，并天然支持无需数值 ODE 积分的单步或少步生成。我们还解释为何原始 MeanFlow 目标（Geng 等，2026a）不能直接获得相同保证，以说明仅实现少步生成并不意味着建立了稳定性结论。从实践角度看，iMF 映射还使可用的源空间梯度计算成本降低，允许 MCMC 转移核在需要时利用梯度改善混合效率。

**本文贡献。** 我们使用 iMF 传输映射，在广义贝叶斯推断中表示只能通过样本访问的复杂先验。在给定正则性假设下，我们把 iMF 与辅助速度联合目标的总体训练次优性、模型类逼近误差，与单步或少步实际映射的后验稳定性联系起来。在该传输基础上，采用结合 pCN 更新的 SPT，使采样既能跨越不同模态，也能利用高维源空间的高斯参考结构。当似然或奖励梯度可用时，我们还在 SPT 的最冷副本中加入高斯参考分裂 HMC，利用局部后验几何信息改善混合，而较热的副本仍采用 pCN 以限制计算成本。两类局部转移核的参考动力学均保持高斯测度不变，因此适用于高维高斯参考分布。合成后验采样和 CLIP 引导 ImageNet 生成实验分别验证了合成任务中的后验近似精度与效率，以及将预训练图像先验引向文本指定偏好的能力。

### 其他相关工作

**传输 MCMC。** 传输映射通过变换后验的坐标结构，使困难的目标分布更易采样，相关方法已有较长历史（Parno & Marzouk，2018；Zhang 等，2025）。NeuTra HMC 学习针对后验几何结构的变分传输，其摊销化扩展可适应特定概率模型内不同的观测（Hoffman 等，2019）。

**基于得分的扩散逆问题求解器。** 扩散逆问题方法通常把似然信息注入反向生成过程，以结合仅能采样的学习先验与观测。扩散后验采样（DPS；Chung 等，2023）是典型方法，但其近似引导一般不能确保期望后验为不变分布，因此除先验学习和数值离散误差外，还可能引入系统性偏差。Denoising-score MCMC（Ramzi 等，2020）则从样本学习先验得分，并与解析似然得分结合，直接在数据空间执行 MCMC。

**训练时后验学习。** 与测试时引导互补的是摊销化后验学习：训练一个以观测为条件的生成器，直接近似后验。神经后验估计等方法通过模拟得到的参数—观测对进行学习，使新观测对应的推断可以快速完成（Greenberg 等，2019；Radev 等，2023；Cheng 等，2026）。这种训练成本可由后续推断任务共同分摊，但当观测模型发生训练范围之外的变化时，可能仍需重新训练或适应。

## 2. 背景知识

### 2.1 流匹配

流匹配（FM；Lipman 等，2023）学习近似边缘 ODE $\dot w_t=v(w_t,t)$ 的速度场，把简单的源分布 $p_{\rm src}$（通常为高斯）传输至通过样本访问的目标分布 $p_{\rm tgt}$。令独立的 $X\sim p_{\rm tgt}$ 和 $Z\sim p_{\rm src}$ 分别为目标和源样本，定义

$$
W_t=(1-t)X+tZ,\qquad V=Z-X.
$$

流匹配采用学习速度场 $v_\theta$ 来近似边缘瞬时速度 $v(w,t)=\mathbb E[V\mid W_t=w]$。逼近误差通过边缘流匹配风险度量：

$$
R_{\rm FM}(\theta)
=\mathbb E\|v_\theta(W_T,T)-v(W_T,T)\|_2^2. \tag{3}
$$

其中 $T\sim\operatorname{Unif}[0,1]$，与 $X,Z$ 独立；期望对 $T,X,Z$ 取值。由于 $v$ 不可直接计算，将其替换为样本速度 $V$ 得到总体训练损失：

$$
L_{\rm FM}(\theta)=\mathbb E\|v_\theta(W_T,T)-V\|_2^2. \tag{4}
$$

最小化 $L_{\rm FM}$ 等价于最小化 $R_{\rm FM}$，因为 $L_{\rm FM}(\theta)=R_{\rm FM}(\theta)+C$，而 $C=\mathbb E\|V-v(W_T,T)\|_2^2$ 与 $\theta$ 无关（Lipman 等，2023）。训练后，通过数值 ODE 求解器，从 $t=1$ 到 $t=0$ 积分 $\dot w_t=v_\theta(w_t,t)$ 完成生成。

### 2.2 MeanFlow 与 improved MeanFlow

MeanFlow（Geng 等，2026a）不直接参数化瞬时速度，而是参数化平均速度：

$$
u(w_t,r,t)=\frac1{t-r}\int_r^t v(w_\tau,\tau)\,d\tau.
$$

根据微积分基本定理，可以得到所谓的 MeanFlow 恒等式：

$$
u(w_t,r,t)=v(w_t,t)-(t-r)
\bigl[\partial_tu+(\partial_wu)v(w_t,t)\bigr]. \tag{5}
$$

原始 MeanFlow 目标将平均速度 $u_\theta$ 回归到式（5）右端。由于 $\partial_tu$ 与 $\partial_wu$ 未知，改用 $\partial_tu_\theta$ 和 $\partial_wu_\theta$，得到

$$
R_{\rm MF}(\theta)
=\mathbb E\left\|u_\theta(W_T,R,T)-
\left[v(W_T,T)-(T-R)(\partial_tu_\theta+
(\partial_wu_\theta)v(W_T,T))\right]\right\|_2^2. \tag{6}
$$

这里期望对 $R,T,Z,X$ 取值。定义总体风险时略去 stop-gradient（停止梯度）算子，因为它不改变目标函数的数值。将 $v$ 替换为 $V$，得到可计算的训练损失：

$$
L_{\rm MF}(\theta)=
\mathbb E\left\|u_\theta(W_T,R,T)-
\left[V-(T-R)(\partial_tu_\theta+
(\partial_wu_\theta)V)\right]\right\|_2^2. \tag{7}
$$

与流匹配不同，$L_{\rm MF}(\theta)-R_{\rm MF}(\theta)$ 通常依赖于 $\theta$，因此这两个标量目标并不等价。此外，式（7）的有效训练目标也依赖网络本身，所以它不是标准回归目标。

为解决这个问题，improved MeanFlow（iMF；Geng 等，2026b）将 $L_{\rm MF}$ 中 $(\partial_wu_\theta)V$ 的插值速度 $V$ 替换为学习得到的边缘速度 $v_\theta$：

$$
L_{\rm iMF}(\theta)=\mathbb E
\left\|u_\theta(W_T,R,T)+(T-R)
\left[\partial_tu_\theta+(\partial_wu_\theta)v_\theta(W_T,T)\right]-V\right\|_2^2. \tag{8}
$$

相应的边缘 iMF 风险为

$$
R_{\rm iMF}(\theta)=\mathbb E
\left\|u_\theta(W_T,R,T)+(T-R)
\left[\partial_tu_\theta+(\partial_wu_\theta)v_\theta(W_T,T)\right]-v(W_T,T)\right\|_2^2. \tag{9}
$$

关键性质是：$L_{\rm iMF}(\theta)-R_{\rm iMF}(\theta)$ 与 $\theta$ 无关（附录 A.1），从而恢复了这两个目标之间的等价性。$v_\theta(w_t,t)$ 可以用边界值 $u_\theta(w_t,t,t)$ 表示，也可以使用独立的辅助速度输出头。本文选择后者，并用式（4）的流匹配损失显式监督辅助头，形成联合训练损失：

$$
L(\theta)=L_{\rm iMF}(\theta)+\lambda L_{\rm FM}(\theta),
\qquad\lambda>0. \tag{10}
$$

联合边缘风险记为

$$
R(\theta)=R_{\rm iMF}(\theta)+\lambda R_{\rm FM}(\theta). \tag{11}
$$

辅助速度场 $v_\theta$ 仅在训练期间使用，生成只依赖 $u_\theta$。单步映射为

$$
S_\theta(z)=z-u_\theta(z,0,1),
\qquad z\sim p_{\rm src}. \tag{12}
$$

更一般地，固定时间表 $1=t_K>t_{K-1}>\cdots>t_0=0$ 定义少步映射：令 $w_K=z$，对 $k=K,\ldots,1$ 更新

$$
w_{k-1}=w_k-(t_k-t_{k-1})u_\theta(w_k,t_{k-1},t_k),
\qquad S_\theta(z)=w_0. \tag{13}
$$

## 3. 通过 improved MeanFlow 进行源空间采样

### 3.1 通过学习先验传输实现贝叶斯推断

设先验 $\pi_0$ 只能通过样本访问，$\ell_y$ 为与观测或任务 $y$ 关联的非负似然或权重。我们的目标是从 $\pi^y(dx)\propto\ell_y(x)\pi_0(dx)$ 采样。

源空间采样（Purohit 等，2025；Wang 等，2026b）的基本思路是学习满足 $(S_\theta)_\#\gamma\approx\pi_0$ 的传输映射，其中 $\gamma=\mathcal N(0,I)$；随后在 $\gamma$ 的源空间中执行后验采样，以拉回的后验 $\nu_\theta^y(dz)\propto\ell_y(S_\theta(z))\gamma(dz)$ 为目标，再通过 $S_\theta$ 把源空间样本映射至数据空间。

如果传输映射精确，即 $(S_\theta)_\#\gamma=\pi_0$，那么精确源空间后验样本 $z\sim\nu_\theta^y$ 经 $S_\theta(z)$ 映射后，就会成为来自 $\pi^y$ 的精确样本（Wang 等，2026b，定理 1）。因此，学习准确的先验传输 $S_\theta$，并在它的源空间内高效采样，具有关键意义。

当 $S_\theta$ 不精确时，我们希望量化由此引入的后验误差。令 $S$ 为生成构造所对应的精确传输，即 $S_\#\gamma=\pi_0$；在适当正则性假设下，认为该映射存在。定义理想的源空间后验 $\nu^y(dz)\propto\ell_y(S(z))\gamma(dz)$。我们的目标是用学习 $S_\theta$ 时的训练误差控制源空间偏差 $W_2(\nu_\theta^y,\nu^y)$，以及数据空间偏差 $W_2((S_\theta)_\#\nu_\theta^y,\pi^y)$。这里 $W_2$ 表示 Wasserstein 距离（Villani 等，2009）；对于 iMF，其训练误差与 $R(\theta)$ 有关，下一节将对此展开讨论。


### 3.2 improved MeanFlow 源与后验稳定性

我们通过式（12）和（13）的 improved MeanFlow 参数化 $S_\theta$，并使用式（10）的联合训练损失 $L(\theta)=L_{\mathrm{iMF}}(\theta)+\lambda L_{\mathrm{FM}}(\theta)$ 进行训练。iMF 支持少步生成，并确保 $L$ 与式（11）的边缘风险 $R$ 只相差一个独立于 $\theta$ 的加性常数。因此，对于固定模型类 $\Theta$，

$$
\begin{aligned}
R(\theta)&=
\underbrace{L(\theta)-\inf_{\vartheta\in\Theta}L(\vartheta)}
_{\epsilon_{\mathrm{opt}}\colon\text{总体训练次优性}}\\
&\quad+\underbrace{\inf_{\vartheta\in\Theta}R(\vartheta)}
_{\epsilon_{\mathrm{app}}\colon\text{模型类逼近误差}}
=:\delta.
\end{aligned}\tag{14}
$$

证明见附录 A.2。分解式（14）表明，边缘风险 $R(\theta)$ 由实际所用训练目标 $L$ 的总体次优性和模型类逼近误差共同控制。根据 MeanFlow 恒等式（5），精确瞬时速度与区间平均速度场能够联合取得零边缘风险（Geng 等，2026b），因此理论上表达能力足够强的模型类可使 $\epsilon_{\mathrm{app}}$ 很小。我们的目标是用 $R(\theta)$ 控制后验误差。

对于原始 MeanFlow（Geng 等，2026a），$L_{\mathrm{MF}}(\theta)-R_{\mathrm{MF}}(\theta)$ 对参数的依赖阻止了分解式（14）在一般情况下成立。因此，训练次优性和逼近误差都很小，不一定意味着边缘风险也很小。

为建立后验稳定性，我们首先控制**实际实现的 iMF 传输映射**的误差，并借鉴 Boffi 等（2024）对流映射误差的分析。理论中采用独立耦合 $X\sim\pi_0$、$Z\sim\gamma$，时间变量 $R,T\overset{\rm iid}{\sim}\mathrm{Unif}[0,1]$。令 $V=Z-X$、$W_t=(1-t)X+tZ$、$v(w,t)=\mathbb E[V\mid W_t=w]$，并记 $p_t=\operatorname{Law}(W_t)$，于是 $p_0=\pi_0$、$p_1=\gamma$。脚注 2 指出，也可采用更一般的时间安排；本文选择简单的情形以便表述。

**假设 3.1（先验与边缘流）。** 先验 $\pi_0\in\mathcal P_2(\mathbb R^d)$。对于任意 $t\in[0,1]$ 及 $p_t$-几乎处处的 $w$，ODE
$\frac{d}{ds}\xi_s^{t,w}=v(\xi_s^{t,w},s)$、$\xi_t^{t,w}=w$ 在 $[0,t]$ 上有绝对连续的解，其解映射 $\varphi_{s,t}(w):=\xi_s^{t,w}$ 构成可测流，并满足

$$
(\varphi_{s,t})_\#p_t=p_s,\qquad 0\leq s\leq t\leq1.
$$

在假设 3.1 下，$S:=\varphi_{0,1}$ 是精确的先验传输映射，即 $S_\#\gamma=\pi_0$。

**假设 3.2（学习平均速度的正则性）。** $u_\theta$ 在 $\mathbb R^d\times(0,1)^2$ 上连续可微，并且 $u_\theta$ 及其全部一阶导数可连续延拓至 $\mathbb R^d\times[0,1]^2$。

对于 $r,t\in[0,1]$，定义边缘 iMF 回归残差及其积分：

$$
\begin{aligned}
\bar q_\theta(w,r,t)
&:=u_\theta(w,r,t)-v(w,t)\\
&\quad+(t-r)\left[\partial_tu_\theta(w,r,t)
+\partial_wu_\theta(w,r,t)v_\theta(w,t)\right],\\
G_\theta(r)&:=\int_r^1
\|\bar q_\theta(\cdot,r,t)\|^2_{L^2(p_t)}\,dt.
\end{aligned}
$$

因此，式（9）的 iMF 风险可以重写为 $R_{\mathrm{iMF}}(\theta)=\mathbb E\|\bar q_\theta(W_T,R,T)\|^2$。我们再作如下假设。

**假设 3.3（跨起始时间的正则性）。** $G_\theta:[0,1]\to[0,\infty)$ 满足 $L_G$-Lipschitz 条件：

$$
|G_\theta(r)-G_\theta(r')|\leq L_G|r-r'|,
\qquad \forall r,r'\in[0,1].
$$

**注释 3.4。** 如果 $\bar q_\theta$ 关于 $r$ 连续可微，并且当 $0\leq r\leq t\leq1$ 时，$\bar q_\theta$ 及其导数 $\partial_r\bar q_\theta$ 在 $L^2(p_t)$ 中一致有界，那么假设 3.3 成立。在上述有限二阶矩假设下，对于直接输入空间与时间变量的有限层仿射–SiLU 网络，这些条件成立；所得到的常数可以依赖网络参数。详情和证明见附录 A.3。

固定生成时间表 $1=t_K>t_{K-1}>\cdots>t_0=0$，并设 $h_k=t_k-t_{k-1}$。

**假设 3.5。**

$$
\begin{aligned}
\sum_{k=1}^K\int_{t_{k-1}}^{t_k}(t-t_{k-1})^2
\big\|(\partial_wu_\theta)(\cdot,t_{k-1},t)
(v-v_\theta)(\cdot,t)\big\|_{L^2(p_t)}^2dt\\
\leq B_u^2 R_{\mathrm{FM}}(\theta).
\end{aligned}\tag{15}
$$

这里，$R_{\mathrm{FM}}$ 是辅助速度头的边缘流匹配风险（3）。

**注释 3.6。** 式（15）的一个充分条件为

$$
\sup_{w,\;0\leq r<t\leq1}(t-r)
\|\partial_wu_\theta(w,r,t)\|_{\rm op}\leq B_u.
$$

特别地，如果 $u_\theta$ 对 $w$ 在所有 $(r,t)$ 上一致满足 $L_u$-Lipschitz 条件（例如仿射–SiLU 网络），则由于 $t-r\leq1$，可令 $B_u=L_u$。不过，假设 3.5 的加权界更弱：它仅在 $L^2(p_t)$ 意义下约束 Jacobian 对 $v-v_\theta$ 的作用。详情见附录 A.4。

**定理 3.7。** 设 $F_{k,\theta}(w)=w-h_ku_\theta(w,t_{k-1},t_k)$ 满足 $L_k$-Lipschitz 条件，$S_\theta=F_{1,\theta}\circ\cdots\circ F_{K,\theta}$ 是式（13）的少步 iMF 映射。定义

$$
\begin{gathered}
\Lambda_k:=\prod_{j<k}L_j,\qquad \Lambda_1=1,\\
A_K:=\sum_{k=1}^K\Lambda_k\sqrt{h_k},\qquad
B_K:=\left(\sum_{k=1}^K\Lambda_k^2h_k\right)^{1/2}.
\end{gathered}
$$

在假设 3.1、3.2、3.3 和 3.5 下，若 $\delta\leq L_G/2$，则

$$
\mathbb E_\gamma\|S_\theta(Z)-S(Z)\|^2
\leq\left[
A_K(2L_G\delta)^{1/4}
+\frac{B_uB_K}{\sqrt{\lambda}}\delta^{1/2}
\right]^2.\tag{16}
$$

如果 $u_\theta$ 在空间变量上一致满足 $L_u$-Lipschitz 条件，则 $\Lambda_k\leq e^{L_u}$、$A_K\leq e^{L_u}\sqrt K$、$B_K\leq e^{L_u}$。定理 3.7 的证明见附录 A.5。

式（16）通过式（14）的 $\delta$，把传输误差与总体训练次优性和模型类逼近误差联系起来。当 $\delta=0$ 时，该界收敛至零，并**不要求步长 $h_k$ 趋近于零**。这正是少步结果的意义。特别地，当 $K=1$ 时，$A_1=B_1=1$，于是式（16）为式（12）的单步映射提供了误差保证，而且无需假定 $S_\theta$ 本身满足 Lipschitz 条件。附录 B.1 的实验进一步显示，对于单步和六步生成，随着 $\delta$ 减小，传输映射误差 $\mathbb E_\gamma\|S_\theta(Z)-S(Z)\|^2$ 也随之减小。定义

$$
\begin{aligned}
\mathcal E&:=\mathbb E_{Z\sim\gamma}\|S_\theta(Z)-S(Z)\|^2,\\
b_K(\delta)&:=A_K(2L_G\delta)^{1/4}
+\frac{B_uB_K}{\sqrt\lambda}\delta^{1/2}.
\end{aligned}\tag{17}
$$

下面建立后验误差与传输误差的联系。固定观测 $y$，给出如下假设。

**假设 3.8（权重的正则性）。** 存在有限常数 $M_y>0$ 和 $L_y\geq0$，对所有 $x,x'\in\mathbb R^d$ 满足

$$
0\leq\ell_y(x)\leq M_y,\qquad
|\ell_y(x)-\ell_y(x')|\leq L_y\|x-x'\|.
$$

并且 $Z_y:=\int\ell_y(x)\pi_0(dx)>0$。

根据第 3.1 节的符号，归一化后的源空间后验为

$$
\begin{gathered}
\nu^y(dz)=\frac{\ell_y(S(z))}{Z_y}\gamma(dz),\\
\nu_\theta^y(dz)=\frac{\ell_y(S_\theta(z))}{Z_{\theta,y}}\gamma(dz),\\
Z_{\theta,y}:=\int\ell_y(S_\theta(z))\gamma(dz).
\end{gathered}
$$

只有当 $Z_{\theta,y}>0$ 时，$\nu_\theta^y$ 才有定义；且 $S_\#\nu^y=\pi^y$。当 $\ell_y>0$ 时记 $\Phi_y=-\log\ell_y$。

**定理 3.9。** 在假设 3.8 下，如果 $L_y\mathcal E^{1/2}\leq Z_y/2$，那么 $Z_{\theta,y}\geq Z_y/2>0$，且

$$
\begin{gathered}
W_2(\nu_\theta^y,\nu^y)\leq C_y(d)^{1/2}\mathcal E^{1/4},\\
C_y(d):=\frac{4L_y}{Z_y}
\left[\sqrt{d^2+4d+1}+\frac{M_y(1+d)}{Z_y}\right].
\end{gathered}\tag{18}
$$

如果另外假设 $S_\theta$ 满足 $L_{S_\theta}$-Lipschitz 条件，则有

$$
W_2((S_\theta)_\#\nu_\theta^y,\pi^y)
\leq L_{S_\theta}C_y(d)^{1/2}\mathcal E^{1/4}
+\sqrt{\frac{M_y}{Z_y}}\mathcal E^{1/2}.
$$

证明见附录 A.6。合并上述结果，得到：

**推论 3.10。** 假定定理 3.7 与假设 3.8 的条件成立，$L_{S_\theta}$ 为 $S_\theta$ 的 Lipschitz 常数，$C_y(d)$ 按定理 3.9 定义。若 $\delta\leq L_G/2$ 且 $L_yb_K(\delta)\leq Z_y/2$，则 $Z_{\theta,y}\geq Z_y/2>0$，并且

$$
W_2(\nu_\theta^y,\nu^y)
\leq C_y(d)^{1/2}b_K(\delta)^{1/2},\tag{19}
$$

$$
W_2((S_\theta)_\#\nu_\theta^y,\pi^y)
\leq L_{S_\theta}C_y(d)^{1/2}b_K(\delta)^{1/2}
+\sqrt{\frac{M_y}{Z_y}}b_K(\delta).\tag{20}
$$

### 3.3 结合 improved MeanFlow 的源空间并行回火

给定学习好的 iMF，我们希望从 $\nu_\theta^y$ 中采样。尽管源空间参考分布是高斯分布，拉回的似然仍可能导致多模态，而且源空间保留了数据的维度。为改善不同模态之间的混合，我们使用源空间并行回火（SPT；Wang 等，2026a），并结合 pCN 与高斯参考分裂 HMC 等局部转移核，以应对高维性。这两类局部方法均可直接在无限维 Hilbert 空间上表述，因此也适用于高维高斯参考目标（Beskos 等，2008；Cotter 等，2013；Beskos 等，2011）。

并行回火（Geyer，1991）使用逆温度 $0=\beta_0<\cdots<\beta_J=1$ 的多个副本，每个副本分别以

$$
\nu_{\theta,\beta}^y(dz)\propto
\ell_y(S_\theta(z))^\beta\gamma(dz)
$$

为目标分布。局部 MCMC 转移核分别探索各自的目标，而相邻副本之间的 Metropolis 交换促进跨模态转移。每个采样扫描（sweep）先对每个副本执行一次局部更新，再针对每一对相邻温度副本各尝试一次 Metropolis 交换。最冷副本（$\beta=1$）的目标就是 $\nu_\theta^y$。以下两个变体的区别在于局部 MCMC 核。

**iMF+SPT+pCN。** 与 Wang 等（2026a）相同，所有副本都采用 pCN。令 $\Phi_y=-\log\ell_y$、$\Psi_\theta=\Phi_y\circ S_\theta$，提案为

$$
z'=\cos(h_\beta)z+\sin(h_\beta)\xi,\qquad
\xi\sim\gamma,\quad h_\beta\in(0,\pi/2],
$$

接受概率为

$$
1\wedge\exp\{-\beta[\Psi_\theta(z')-\Psi_\theta(z)]\}.
$$

当 $\beta=0$ 时，每个提案都被接受；若取 $h_0=\pi/2$，则可独立抽取新的高斯样本 $z'=\xi\sim\gamma$。

**iMF+SPT+hybrid。** 当 $\Psi_\theta$ 可微时，为利用局部后验几何结构，我们以分裂 HMC（Beskos 等，2011）代替最冷副本（$\beta=1$）的 pCN 更新，同时在其他较热副本中仍使用 pCN 以控制成本。重新采样动量 $p\sim\gamma$，定义 Hamiltonian：

$$
H(z,p)=\tfrac12\|z\|^2+\tfrac12\|p\|^2+\Psi_\theta(z).
$$

从 $(z_0,p_0)=(z,p)$ 出发，执行 $L$ 步 Strang 分裂：

$$
\begin{aligned}
p_{\ell+1/2}
&=p_\ell-\frac h2\nabla\Psi_\theta(z_\ell)
&&\text{（半步动量更新）},\\
\begin{pmatrix}z_{\ell+1}\\\widetilde p_{\ell+1}\end{pmatrix}
&=\begin{pmatrix}\cos(h)I&\sin(h)I\\-\sin(h)I&\cos(h)I\end{pmatrix}
\begin{pmatrix}z_\ell\\p_{\ell+1/2}\end{pmatrix}
&&\text{（精确谐振旋转）},\\
p_{\ell+1}
&=\widetilde p_{\ell+1}-\frac h2\nabla\Psi_\theta(z_{\ell+1})
&&\text{（半步动量更新）}.
\end{aligned}\tag{21}
$$

最终以概率 $1\wedge\exp\{H(z,p)-H(z',p')\}$ 接受提案 $(z',p')=(z_L,-p_L)$；否则保留原状态 $z$。

**采样器的几何收敛。** Wang 等（2026a）已证明，全部副本使用 pCN 的 SPT 在 $W_2$ 距离下几何收敛至学习后验。本文把这一保证扩展至 SPT+hybrid。令 $\nu_n=\operatorname{Law}(z_n)$，其中 $z_n$ 为执行 $n$ 个采样扫描后最冷副本的状态。在附录 A.7 的条件下，包括源空间权重有正的下界且有有限上界，两种采样器的最冷副本边缘分布均满足

$$
W_2(\nu_n,\nu_\theta^y)\leq C\rho^n
$$

其中 $C<\infty$、$\rho\in(0,1)$。结合后验稳定性（定理 3.9、推论 3.10），可获得端到端误差界：其采样项以几何速率衰减，而传输误差项在 $\delta\to0$ 时消失；详见推论 A.3。



## 4. 实验

我们在合成推断问题和 CLIP 引导的 ImageNet 生成任务上评估所提出的采样器。实验使用 [LUMI 超级计算机](https://lumi-supercomputer.eu/)；每次运行通过 Slurm 分配一块 AMD Instinct MI250X GPU、8 个 CPU 核心以及 64 GB 主机内存。作者表示相关代码将在之后公开。

### 4.1 合成实验

**问题设置。** 考虑 $x\in\mathbb R^{32}$ 上的两种先验，每一种都由 16 个相互独立的二维变量块构成。设 $u_j,v_j\overset{\rm iid}{\sim}\mathcal N(0,1)$，定义

$$
x_{2j-1}=u_j,\qquad
x_{2j}=
\begin{cases}
0.62(u_j^2-1)+0.30v_j,&\text{Banana},\\
1.05\sin(1.65u_j)+0.15v_j,&\text{Sine},
\end{cases}
\quad j=1,\ldots,16.
$$

两个问题均使用具有独立高斯噪声的线性观测，似然为

$$
p(y\mid x)=
\prod_{j=1}^{16}\mathcal N
\bigl(y_j;\,x_{2j}+0.35x_{2j-1},\,0.2^2\bigr).
$$

固定观测取 $y_1=y_2=2$，对于 $j=3,\ldots,16$ 则令 $y_j=-1$。

**先验学习与采样。** 本文将 iMF+SPT+pCN 和 iMF+SPT+hybrid 与两种基线比较，即 FM+SPT+pCN 以及扩散后验采样（DPS；Chung 等，2023）。两种 iMF 方法共用六步传输映射；FM 基线采用 100 步 RK4 传输。对于每个问题，iMF、FM 和扩散先验模型均在同一固定数据集上训练，该数据集包含 20,000 个先验样本。每种方法返回 6,000 个样本。原文图 4 将学习得到的先验样本与真实 Banana、Sine 先验样本比较；更多细节见附录 B.2。

**实验结果。** 由于问题具有分块结构，可以计算足够精确的数值后验参考分布，以评估近似质量。原文表 1 汇总结果；图 5 和图 6 将各方法的后验样本直方图与对应真实后验的数值参考作比较。

对于同一个 iMF 传输映射，与 iMF+SPT+pCN 相比，混合采样器在 Banana 和 Sine 上分别将平均坐标有效样本量（ESS）提高到 3.24 倍和 4.44 倍，将单位时间有效样本量（ESS/s）提高到 2.25 倍和 3.13 倍。混合采样器同时获得最低的平均切片 Wasserstein 距离和分箱总变差误差；不过，与随机种子间的波动相比，切片 Wasserstein 差异较小。

在当前设置的 100 步 RK4 传输下，FM+SPT+pCN 在 Banana 与 Sine 上的采样时间分别为 iMF 混合方法的 33.7 倍与 34.5 倍。DPS 的分布偏差明显更大，后验直方图中存在相对于参考分布的系统性差异。

**表 1：合成任务后验采样结果。** $\mathrm{SW}_2$ 为切片 Wasserstein 距离，Bin TV 为分箱总变差，Coord. ESS 为平均坐标有效样本量；“—”表示原文未报告。数值为原文统计结果（均值±误差量）。详细设置见附录 B.2。

| 任务 | 方法 | $\mathrm{SW}_2\downarrow$ | Bin TV ↓ | Coord. ESS ↑ | ESS/s ↑ | 时间/s ↓ |
|---|---|---:|---:|---:|---:|---:|
| Banana | DPS | 0.462±0.071 | 0.311±0.002 | — | — | **38.4±1.0** |
| Banana | FM+SPT+pCN | 0.219±0.081 | 0.106±0.008 | 372±16 | 0.052±0.002 | 7087±45 |
| Banana | iMF+SPT+pCN | 0.154±0.012 | 0.109±0.006 | 346±4 | 2.37±0.12 | 146.1±6.0 |
| Banana | iMF+SPT+hybrid | **0.142±0.031** | **0.085±0.005** | **1122±48** | **5.33±0.08** | 210.4±5.8 |
| Sine | DPS | 0.931±0.025 | 0.286±0.001 | — | — | **38.9±0.2** |
| Sine | FM+SPT+pCN | 0.104±0.021 | 0.129±0.014 | 395±16 | 0.0526±0.0023 | 7505±78 |
| Sine | iMF+SPT+pCN | 0.093±0.016 | 0.131±0.010 | 378±35 | 2.47±0.32 | 153.3±5.8 |
| Sine | iMF+SPT+hybrid | **0.088±0.011** | **0.127±0.004** | **1679±47** | **7.73±0.31** | 217.3±5.4 |

**图 4（原文）：** 真实 Banana / Sine 先验与各种学习先验样本的散点分布对比。[查看原图及原文上下文](https://arxiv.org/pdf/2610.01034v1#page=10)。

**图 5–6（原文）：** 各方法的后验样本直方图与精确数值参考分布对照。[查看原文实验部分](https://arxiv.org/html/2610.01034v1#S4)。

### 4.2 CLIP 引导的 ImageNet 生成

本文评估 CLIP 引导的 $256\times256$ 类条件 ImageNet 生成：固定某个 ImageNet 类别（例如白头海雕）和文本提示，目标是采样出既属于该类别、又具有较高图文对齐度的图像。引导奖励使用冻结的预训练 CLIP 模型（Radford 等，2021）的余弦相似度。

设 $z\sim\mathcal N(0,I)$，$G_c(z)$ 表示由高斯源分布到类别 $c$ 对应图像的、已预训练且冻结的传输映射。对于文本提示 $p$，学习到的源空间后验为

$$
\nu_\theta^p(z)\propto
\exp\left[-\frac12\|z\|^2
+\tau\operatorname{CLIP}(G_c(z),p)\right],
\qquad \tau=200.
$$

**方法比较。** 作者使用已经为类条件 ImageNet 生成预训练的 iMF（Geng 等，2026b），将 iMF+SPT+pCN 与 iMF+SPT+hybrid 和多步对应方法 SiT+SPT+pCN 比较。这里，SiT（Ma 等，2024）是预训练的类条件流匹配先验，通过 125 步 Heun 积分使用。这些方法均采用 8 个温度副本和 8 条独立回火链。

对于 iMF 方法，执行 250 次自适应扫描、250 次预热（burn-in）扫描，并且每条链在预热后保留 1,000 个样本，每种方法总共保留 8,000 个样本。SiT+SPT+pCN 在这一实验中极为缓慢，因而使用与混合采样器实际采样时间相匹配的每提示时间预算（超过 10 小时），另加 1 小时用于初始化、评分和图像导出。

作者还引入 best-of-$K$（Karthik 等，2023）作为基于奖励筛选的基线，取 $K=12$：从 $K$ 个学习先验独立样本中保留 CLIP 奖励最高的图像，共生成 8,000 张 best-of-$K$ 图像。

**结果。** 表 2 报告两组类别–提示词的 CLIP 奖励与采样成本。原文图 1 和图 2 展示了每种方法中两条采样链的可视化样本，图中的 $R$ 表示奖励。用于展示的 JPEG 压缩不影响报告的奖励数值。两种 iMF 方法的奖励相近，均优于 SiT+SPT+pCN。

在金毛寻回犬提示词中，iMF 方法生成的图像更准确地展现了落满秋叶的环境中奔跑的金毛寻回犬；SiT+SPT+pCN 在 10–11 小时的预算内经常未能表现出秋季背景。在白头海雕提示词中，三种方法都能绘制展开双翼的海雕，但 iMF 方法更稳定地包含雪山背景，而 SiT+SPT+pCN 往往呈现纯蓝色天空。

在这些例子中，混合采样器相对于 iMF+SPT+pCN 的奖励或图像质量没有清晰优势。最后，best-of-$K$ 的奖励最低，这表明显式引导比仅从先验中独立采样再筛选更有效。完整结果见附录 B.3.2。

**表 2：CLIP 奖励与实际采样成本。**

| 提示词 / 类别 | 方法 | 平均 CLIP 奖励 ↑ | 采样时间/小时 | 平均每扫描时间/秒 |
|---|---|---:|---:|---:|
| 金毛寻回犬，提示：一张金毛寻回犬在落下的秋叶中奔跑的照片 | Best-of-$K$ | 0.2864 | 2.49 | — |
| 同上 | SiT+SPT+pCN | 0.3122 | 10.51 | 370.89 |
| 同上 | iMF+SPT+pCN | 0.3809 | 2.40 | 5.75 |
| 同上 | iMF+SPT+hybrid | **0.3824** | 10.95 | 26.28 |
| 白头海雕，提示：一张白头海雕展开双翼飞越雪山的照片 | Best-of-$K$ | 0.3278 | 2.49 | — |
| 同上 | SiT+SPT+pCN | 0.3481 | 10.70 | 370.27 |
| 同上 | iMF+SPT+pCN | **0.3936** | 2.44 | 5.85 |
| 同上 | iMF+SPT+hybrid | 0.3914 | 11.15 | 26.76 |

**图 1（原文）：** 金毛寻回犬的图像生成示例，比较 SiT+SPT+pCN、iMF+SPT+pCN 与 iMF+SPT+hybrid；[查看原文](https://arxiv.org/html/2610.01034v1#S4)。

**图 2（原文）：** 白头海雕图像生成示例，展示三种采样策略的视觉结果；[查看原文](https://arxiv.org/html/2610.01034v1#S4)。

## 5. 结论

本文提出基于少步 iMF 的源空间推断，并在给定假设下将总体训练次优性及逼近误差与后验稳定性、端到端误差界联系起来。混合式 SPT 在合成基准上提高了效率，而单步 iMF 在 CLIP 引导的 ImageNet 采样中相较多步 SiT 降低了成本。如何在控制正则性常数的同时，定量刻画模型类逼近误差 $\epsilon_{\rm app}$ 随模型容量增加而下降的规律，仍是一个开放问题。

### 生成式人工智能使用声明

作者使用生成式人工智能工具（GPT6-Astra、Claude Opus 5、Codex、Copilot Pro+）辅助语言编辑、文献检索和论文摘要整理、算法实现、对照实验与代码测试、初步（无法直接使用的）草稿与模板、数学论证的开发和核查，以及手稿审阅。作者没有利用生成式人工智能生成合成数据集。作者审查了 AI 辅助形成的材料，包括文字、代码及数学论证，并对最终论文、其主张和包括 AI 辅助产物在内的所有随附材料承担全部责任。

### 致谢

本研究得到 NTU-SUG、新加坡教育部（MOE）AcRF Tier 1 RG17/24 和芬兰研究委员会项目 369502 资助。作者感谢 LUMI 超级计算机提供计算资源。LUMI 由 EuroHPC 联合事业组织拥有，并由芬兰 CSC 和 LUMI 联盟运营。


---

**后续未完成部分：** 附录 A–B、参考文献的完整逐条保留及图表数据交叉校对尚未完成；不计为全文翻译完成。

{% endraw %}
