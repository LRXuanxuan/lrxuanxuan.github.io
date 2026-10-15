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


## 附录 A. 证明与补充说明

### A.1 $L_{\mathrm{iMF}}$ 与 $R_{\mathrm{iMF}}$ 的等价性

将 $L_{\mathrm{iMF}}(\theta)=\mathbb E\|A_\theta-V\|_2^2$ 写为如下形式，其中预测项为

$$
\begin{aligned}
A_\theta:=u_\theta(W_T,R,T)+(T-R)\big[
\partial_tu_\theta(W_T,R,T)\\
+(\partial_wu_\theta)(W_T,R,T)v_\theta(W_T,T)\big].
\end{aligned}
$$

$A_\theta$ 关于 $(W_T,R,T)$ 可测。由于 $(R,T)$ 与 $(X,Z)$ 独立，因此

$$
\mathbb E[V\mid W_T,R,T]=v(W_T,T).
$$

从而有

$$
\mathbb E\langle A_\theta-v(W_T,T),\,
V-v(W_T,T)\rangle=0.
$$

展开平方范数便得到

$$
L_{\mathrm{iMF}}(\theta)=R_{\mathrm{iMF}}(\theta)
+\underbrace{\mathbb E\|V-v(W_T,T)\|_2^2}_{C},
$$

其中 $C$ 独立于参数 $\theta$。

### A.2 式（14）的证明

由于 $R(\theta)=L(\theta)+C$，故 $\inf R=\inf L+C$。因此

$$
R(\theta)=L(\theta)-\inf L+\inf R,
$$

即式（14）。

### A.3 注释 3.4 的详细论证

记

$$
\begin{aligned}
A&:=\sup_{0\leq r\leq t\leq1}
\|\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)},\\
B&:=\sup_{0\leq r\leq t\leq1}
\|\partial_r\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)}.
\end{aligned}
$$

依照假设，$A,B<\infty$。对于 $0\leq r<s\leq t\leq1$，由微积分基本定理和 Minkowski 不等式，

$$
\begin{aligned}
\|\bar q_\theta(\cdot,r,t)-\bar q_\theta(\cdot,s,t)\|_{L^2(p_t)}
&\leq\int_r^s\|\partial_r\bar q_\theta(\cdot,a,t)\|_{L^2(p_t)}\,da\\
&\leq B(s-r).
\end{aligned}
$$

进而得到

$$
\left|
\|\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)}^2
-\|\bar q_\theta(\cdot,s,t)\|_{L^2(p_t)}^2
\right|\leq2AB(s-r).
$$

拆分 $G_\theta(r)$ 与 $G_\theta(s)$ 的积分，有

$$
\begin{aligned}
|G_\theta(r)-G_\theta(s)|
&\leq\int_r^s\|\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)}^2\,dt\\
&\quad+\int_s^1\left|
\|\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)}^2-
\|\bar q_\theta(\cdot,s,t)\|_{L^2(p_t)}^2
\right|dt\\
&\leq A^2(s-r)+2AB(1-s)(s-r)\\
&\leq(A^2+2AB)|s-r|.
\end{aligned}
$$

现在假设 $u_\theta$ 和 $v_\theta$ 都是由仿射映射和逐坐标 SiLU 激活函数有限次复合得到的网络，并直接输入空间和时间变量。SiLU 激活 $\rho(a)=a/(1+e^{-a})$ 光滑，且一阶和二阶导数有界。根据链式法则，这些网络的一阶、二阶输入导数有界，网络输出至多线性增长。因为时间输入处于 $[0,1]$，存在有限常数 $C_\theta$，使得

$$
\|u_\theta(w,r,t)\|+\|v_\theta(w,t)\|
\leq C_\theta(1+\|w\|),
$$

而 $u_\theta$ 的一阶、二阶输入导数一致有界。

由于 $v$ 和 $v_\theta$ 都不依赖于 $r$，有

$$
\begin{aligned}
\partial_r\bar q_\theta
&=\partial_ru_\theta-\partial_tu_\theta
-(\partial_wu_\theta)v_\theta\\
&\quad+(t-r)\left[
\partial_{rt}u_\theta+(\partial_{rw}u_\theta)v_\theta
\right].
\end{aligned}
$$

上述网络界意味着，在必要时增大 $C_\theta$ 后，对于 $0\leq r\leq t\leq1$ 一致成立

$$
\begin{aligned}
\|\bar q_\theta(w,r,t)\|
&\leq C_\theta(1+\|w\|)+\|v(w,t)\|,\\
\|\partial_r\bar q_\theta(w,r,t)\|
&\leq C_\theta(1+\|w\|).
\end{aligned}
$$

令 $M_2:=\mathbb E\|X\|^2<\infty$，其中 $X\sim\pi_0$（假设 3.1）。利用 $X$ 和 $Z\sim\mathcal N(0,I_d)$ 的独立性，得到

$$
\mathbb E\|W_t\|^2=(1-t)^2M_2+t^2d\leq M_2+d.
$$

此外，由于 $v(W_t,t)=\mathbb E[Z-X\mid W_t]$，条件 Jensen 不等式给出

$$
\|v(\cdot,t)\|_{L^2(p_t)}^2
\leq\mathbb E\|Z-X\|^2=M_2+d.
$$

这些估计建立了 $A,B<\infty$，从而证明了对于所述网络结构的论断。所得常数可能依赖网络参数。

### A.4 注释 3.6 的详细论证

记 $e_\theta(w,t):=v(w,t)-v_\theta(w,t)$。对于 $r<t$，算子范数界意味着

$$
(t-r)\|\partial_wu_\theta(w,r,t)e_\theta(w,t)\|
\leq B_u\|e_\theta(w,t)\|.
$$

两边平方、对 $p_t$ 积分，并对时间表中的各区间求和，得到

$$
\begin{aligned}
&\sum_{k=1}^K\int_{t_{k-1}}^{t_k}(t-t_{k-1})^2
\|\partial_wu_\theta(\cdot,t_{k-1},t)e_\theta(\cdot,t)\|_{L^2(p_t)}^2\,dt\\
&\quad\leq B_u^2\sum_{k=1}^K\int_{t_{k-1}}^{t_k}
\|e_\theta(\cdot,t)\|_{L^2(p_t)}^2\,dt
=B_u^2R_{\mathrm{FM}}(\theta).
\end{aligned}
$$

最后一步利用 $T\sim\operatorname{Unif}[0,1]$，以及这些区间恰好划分 $[0,1]$ 的事实。

如果 $u_\theta$ 关于 $w$ 一致满足 $L_u$-Lipschitz 条件，则
$\|\partial_wu_\theta(w,r,t)\|_{\rm op}\leq L_u$。考虑到 $t-r\leq1$，取 $B_u=L_u$ 即满足充分条件。

最后要强调，式（15）仅在空间与时间平均的意义下约束 Jacobian 对 $e_\theta$ 的作用，并不要求一致的算子范数界。例如，当 $v_\theta=v$ 时，该式左端为零。

对于将空间与时间直接作为输入的有限仿射–SiLU 网络，其空间 Jacobian 一致有界，论证与附录 A.3 类似：

$$
L_u:=\sup_{w\in\mathbb R^d,\,(r,t)\in[0,1]^2}
\|\partial_wu_\theta(w,r,t)\|_{\rm op}<\infty.
$$


### A.5 定理 3.7 的证明

**总体风险的控制。** 根据式（14）以及联合边缘风险的定义，

$$
R_{\mathrm{iMF}}(\theta)+\lambda R_{\mathrm{FM}}(\theta)
=R(\theta)=\delta.
$$

因此 $R_{\mathrm{iMF}}(\theta)\leq\delta$，并且 $R_{\mathrm{FM}}(\theta)\leq\delta/\lambda$。

**恢复固定时间切片。** 在 $[0,1]^2$ 上独立均匀采样时间意味着

$$
\begin{aligned}
\int_0^1G_\theta(r)\,dr
&=\int_0^1\int_r^1\|\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)}^2\,dt\,dr\\
&\leq\int_0^1\int_0^1\|\bar q_\theta(\cdot,r,t)\|_{L^2(p_t)}^2\,dt\,dr\\
&=R_{\mathrm{iMF}}(\theta).
\end{aligned}
$$

固定 $r\in[0,1]$ 和 $h\in(0,1]$，选取区间 $I=[a,b]\subset[0,1]$，使 $a\leq r\leq b$、$b-a=h$。由假设 3.3，对于 $s\in I$，有 $G_\theta(r)\leq G_\theta(s)+L_G|s-r|$。在 $I$ 上取平均，

$$
G_\theta(r)\leq\frac1h\int_I G_\theta(s)\,ds
+\frac{L_G}{h}\int_I|s-r|\,ds.
$$

第一项不超过 $\delta/h$，因为 $G_\theta\geq0$ 且 $\int_0^1G_\theta(s)\,ds\leq\delta$。对于第二项，注意

$$
\int_a^b|s-r|\,ds
=\frac{(r-a)^2+(b-r)^2}{2}\leq\frac{h^2}{2}.
$$

于是

$$
G_\theta(r)\leq\frac{\delta}{h}+\frac{L_Gh}{2}. \tag{22}
$$

若 $0<\delta\leq L_G/2$，取 $h=\sqrt{2\delta/L_G}\in(0,1]$，将式（22）的上界最小化，得到

$$
G_\theta(r)\leq(2L_G\delta)^{1/2},
\qquad\forall r\in[0,1].\tag{23}
$$

当 $\delta=0$ 时，在式（22）中令 $h\downarrow0$，仍得到同样结论。

**局部传输误差。** 定义

$$
\begin{aligned}
q_\theta(w,r,t)
&:=u_\theta(w,r,t)-v(w,t)\\
&\quad+(t-r)\big[\partial_tu_\theta(w,r,t)
+\partial_wu_\theta(w,r,t)v(w,t)\big]\\
&=\bar q_\theta(w,r,t)
+(t-r)\partial_wu_\theta(w,r,t)
\big(v(w,t)-v_\theta(w,t)\big).
\end{aligned}
$$

固定 $0\leq r<t\leq1$，对于 $p_t$-几乎处处的 $w$，令

$$
w_s:=\varphi_{s,t}(w),\qquad
D_s:=(s-r)u_\theta(w_s,r,s)-w_s,\quad s\in[r,t].
$$

根据假设 3.1 与 3.2，$D_s$ 绝对连续。由链式法则，对几乎所有 $s$，$\frac{dD_s}{ds}=q_\theta(w_s,r,s)$。因为 $D_r=-\varphi_{r,t}(w)$，$D_t=(t-r)u_\theta(w,r,t)-w$，积分可得

$$
(t-r)u_\theta(w,r,t)-w+\varphi_{r,t}(w)
=\int_r^t q_\theta(\varphi_{s,t}(w),r,s)\,ds.\tag{24}
$$

对于固定的生成时间表，令 $F_k:=\varphi_{t_{k-1},t_k}$ 为精确的单步映射，并定义

$$
\begin{aligned}
Q_k&:=\int_{t_{k-1}}^{t_k}
\|\bar q_\theta(\cdot,t_{k-1},t)\|_{L^2(p_t)}^2\,dt,\\
J_{v,k}&:=\int_{t_{k-1}}^{t_k}(t-t_{k-1})^2
\|\partial_wu_\theta(\cdot,t_{k-1},t)
(v-v_\theta)(\cdot,t)\|_{L^2(p_t)}^2\,dt.
\end{aligned}
$$

根据式（24），

$$
F_{k,\theta}(w)-F_k(w)
=-\int_{t_{k-1}}^{t_k}
q_\theta(\varphi_{s,t_k}(w),t_{k-1},s)\,ds.
$$

利用 $(\varphi_{s,t_k})_\#p_{t_k}=p_s$、Minkowski 不等式以及时间上的 Cauchy–Schwarz 不等式，

$$
\begin{aligned}
&\|F_{k,\theta}-F_k\|_{L^2(p_{t_k})}\\
&\leq\int_{t_{k-1}}^{t_k}
\|q_\theta(\varphi_{s,t_k}(\cdot),t_{k-1},s)\|_{L^2(p_{t_k})}\,ds\\
&=\int_{t_{k-1}}^{t_k}
\|q_\theta(\cdot,t_{k-1},s)\|_{L^2(p_s)}\,ds\\
&\leq\int_{t_{k-1}}^{t_k}
\|\bar q_\theta(\cdot,t_{k-1},s)\|_{L^2(p_s)}\,ds\\
&\quad+\int_{t_{k-1}}^{t_k}(s-t_{k-1})
\|\partial_wu_\theta(\cdot,t_{k-1},s)
(v-v_\theta)(\cdot,s)\|_{L^2(p_s)}\,ds\\
&\leq\sqrt{h_k}\left(\sqrt{Q_k}+\sqrt{J_{v,k}}\right).
\end{aligned}\tag{25}
$$

**组合各单步映射。** 利用流的复合性质，$S=F_1\circ\cdots\circ F_K=\varphi_{0,1}$。定义中间映射

$$
H_k:=F_{1,\theta}\circ\cdots\circ F_{k,\theta}
\circ F_{k+1}\circ\cdots\circ F_K,\qquad k=0,\ldots,K,
$$

其中空复合视为恒等映射。因此，$H_0=S$、$H_K=S_\theta$，并且

$$
S_\theta(z)-S(z)=\sum_{k=1}^K[H_k(z)-H_{k-1}(z)].
$$

$H_k$ 与 $H_{k-1}$ 仅在第 $k$ 个单步映射上不同。它们共同的内部复合是精确流 $F_{k+1}\circ\cdots\circ F_K=\varphi_{t_k,1}$，共同的外部复合 $F_{1,\theta}\circ\cdots\circ F_{k-1,\theta}$ 的 Lipschitz 常数不超过 $\Lambda_k=\prod_{j<k}L_j$。因而

$$
\|H_k(z)-H_{k-1}(z)\|
\leq\Lambda_k
\|F_{k,\theta}(\varphi_{t_k,1}(z))
-F_k(\varphi_{t_k,1}(z))\|.
$$

由于 $(\varphi_{t_k,1})_\#\gamma=p_{t_k}$，取 $L^2(\gamma)$ 范数并应用三角不等式得

$$
\begin{aligned}
\|S_\theta-S\|_{L^2(\gamma)}
&\leq\sum_{k=1}^K\Lambda_k
\|F_{k,\theta}-F_k\|_{L^2(p_{t_k})}\\
&\leq\sum_{k=1}^K\Lambda_k\sqrt{h_k}
\left(\sqrt{Q_k}+\sqrt{J_{v,k}}\right)\\
&\leq A_K(2L_G\delta)^{1/4}
+B_K\left(\sum_{k=1}^KJ_{v,k}\right)^{1/2}\\
&\leq A_K(2L_G\delta)^{1/4}
+\frac{B_uB_K}{\sqrt{\lambda}}\delta^{1/2}.
\end{aligned}
$$

第三行对 $J_{v,k}$ 应用求和形式的 Cauchy–Schwarz 不等式。两边平方即证明式（16）。当 $K=1$ 时，$h_1=\Lambda_1=A_1=B_1=1$，同样的论证给出单步传输界。此时复合估计中没有外层学习映射，因此不要求 $F_{1,\theta}$ 满足 Lipschitz 条件。

最后，如果 $u_\theta$ 在空间上统一满足 $L_u$-Lipschitz 条件，则

$$
L_k\leq1+h_kL_u,\qquad
\Lambda_k\leq\exp\left(L_u\sum_{j<k}h_j\right)\leq e^{L_u}.
$$

由于 $\sum_kh_k=1$，由 Cauchy–Schwarz 得到 $A_K\leq e^{L_u}\sqrt K$ 和 $B_K\leq e^{L_u}$。此外 $L_{S_\theta}\leq\prod_kL_k\leq e^{L_u}$，这也用于数据空间后验界。所有估计均针对固定的生成时间表成立。

### A.6 定理 3.9 的证明

令 $e:=\mathcal E^{1/2}$，$a(z):=\ell_y(S_\theta(z))$，$b(z):=\ell_y(S(z))$。权重假设给出

$$
|Z_{\theta,y}-Z_y|
\leq\int|a-b|\,d\gamma\leq L_ye.
$$

因而 $L_ye\leq Z_y/2$ 确保 $Z_{\theta,y}\geq Z_y/2>0$。定义 $U_2(z)=1+\|z\|^2$，并使用如下加权变差的约定：

$$
\|\mu-\nu\|_{U_2}:=
\sup_{|f|\leq U_2}\left|\int f\,d\mu-\int f\,d\nu\right|.
$$

对于每一个这样的 $f$，将归一化密度之差分解为

$$
\int f\,d(\nu_\theta^y-\nu^y)
=\frac1{Z_{\theta,y}}\int f(a-b)\,d\gamma
+\frac{Z_y-Z_{\theta,y}}{Z_yZ_{\theta,y}}\int fb\,d\gamma.
$$

由于 $\mathbb E_\gamma U_2=1+d$、$\mathbb E_\gamma U_2^2=d^2+4d+1$，Cauchy–Schwarz 不等式给出

$$
\begin{aligned}
\|\nu_\theta^y-\nu^y\|_{U_2}
&\leq\frac{L_ye}{Z_{\theta,y}}
\left[\sqrt{d^2+4d+1}+\frac{M_y(1+d)}{Z_y}\right]\\
&\leq\frac{C_y(d)}2e.
\end{aligned}
$$

为完整起见，可以令两个测度的共同部分进行恒等耦合，并将余下的正测度部分任意耦合。利用 $\|z-z'\|^2\leq2\|z\|^2+2\|z'\|^2$，得到

$$
W_2^2(\mu,\nu)
\leq2\int\|z\|^2\,d|\mu-\nu|(z)
\leq2\|\mu-\nu\|_{U_2}.
$$

这证明了式（18）。由于归一化权重相对于 $\gamma$ 有界，所有源空间后验的二阶矩均有限。

对于数据空间的结论，先注意 $S_\#\gamma=\pi_0$ 与推前的定义共同意味着 $S_\#\nu^y=\pi^y$。插入中间测度 $(S_\theta)_\#\nu^y$，由 Lipschitz 传输与三角不等式可得

$$
\begin{aligned}
W_2((S_\theta)_\#\nu_\theta^y,\pi^y)
&\leq L_{S_\theta}W_2(\nu_\theta^y,\nu^y)\\
&\quad+W_2((S_\theta)_\#\nu^y,S_\#\nu^y).
\end{aligned}
$$

使用同一输入变量进行耦合，可对第二项建立上界：

$$
\begin{aligned}
W_2^2((S_\theta)_\#\nu^y,S_\#\nu^y)
&\leq\mathbb E_{\nu^y}\|S_\theta-S\|^2\\
&\leq\frac{M_y}{Z_y}\mathcal E.
\end{aligned}
$$

这便证明了数据空间后验稳定性。代入式（17）即可得到式（19）–（20）。

### A.7 源空间采样器的几何收敛性

固定 $\theta$ 和 $y$，定义

$$
\begin{gathered}
\omega(z):=\ell_y(S_\theta(z)),\qquad
\mu_j(dz):=Z_j^{-1}\omega(z)^{\beta_j}\gamma(dz),\\
Z_j:=\int\omega^{\beta_j}\,d\gamma,\qquad
\Pi:=\bigotimes_{j=0}^J\mu_j.
\end{gathered}
$$

因此 $\mu_0=\gamma$、$\mu_J=\nu_\theta^y$。令 $\eta_n$ 为 $n$ 次正式采样扫描后的联合分布，$\nu_n$ 为其最冷副本边缘分布。使用

$$
\chi^2(\eta\|\Pi):=
\int\left(\frac{d\eta}{d\Pi}-1\right)^2\,d\Pi.
$$

**假设 A.1（源空间权重与正式采样器）。** 源空间权重可测，并且对每个 $z\in\mathbb R^d$，满足 $0<m\leq\omega(z)\leq M<\infty$，其中 $m<M$。逆温度序列 $0=\beta_0<\cdots<\beta_J=1$（$J\geq1$）以及全部局部核参数在正式采样期间保持固定。每次扫描对所有副本独立应用局部转移核，之后按指定顺序各尝试一次相邻 Metropolis 交换；交换顺序可以随扫描编号改变。每个 pCN 角度满足 $h_{\beta_j}\in(0,\pi/2]$。

对于混合采样器，$\Psi_\theta=-\log\omega$ 连续可微，最冷副本使用第 3.3 节带 Metropolis 校正的分裂 HMC，每次更新使用独立刷新后的高斯动量。初始联合分布满足 $D_0:=\chi^2(\eta_0\|\Pi)<\infty$。

严格为正的权重下界是该收敛结论的一项**额外条件**。例如，对于有界奖励取指数的权重，这一条件成立。Wang 等（2026a）已证明 SPT+pCN 的几何收敛性。以下结论对两种局部核给出显式误差界，并将保证扩展至混合采样器。

**定理 A.2（SPT+pCN 与 SPT+hybrid 的几何收敛）。** 在假设 A.1 下，令 $\kappa:=M/m$。对于 iMF+SPT+pCN，定义

$$
g_{\mathrm{pCN}}:=
\min_{0\leq j\leq J}\kappa^{-\beta_j}(1-\cos h_{\beta_j}),
\qquad q_{\mathrm{pCN}}:=1-g_{\mathrm{pCN}}\in(0,1).
$$

那么，对每个非负整数 $n$，

$$
\chi^2(\eta_n\|\Pi)\leq D_0q_{\mathrm{pCN}}^{2n},
\qquad
W_2(\nu_n,\nu_\theta^y)
\leq\sqrt{2\kappa D_0}\,q_{\mathrm{pCN}}^n.\tag{26}
$$

对于 iMF+SPT+hybrid，定义

$$
\begin{gathered}
g_{\mathrm{hot}}:=
\min_{0\leq j<J}\kappa^{-\beta_j}(1-\cos h_{\beta_j}),\\
a:=\kappa^{-(1-\beta_{J-1})},\qquad
q_{\mathrm{hyb}}:=1-g_{\mathrm{hot}}^2a\in(0,1).
\end{gathered}
$$

则有

$$
\begin{aligned}
\chi^2(\eta_n\|\Pi)
&\leq D_0q_{\mathrm{hyb}}^{2\lfloor n/2\rfloor},\\
W_2(\nu_n,\nu_\theta^y)
&\leq\sqrt{2\kappa D_0}\,
q_{\mathrm{hyb}}^{\lfloor n/2\rfloor}.
\end{aligned}\tag{27}
$$

若将最冷副本更新替换为任意固定且以 $\mu_J$ 为不变分布的 Markov 核，上述混合采样界仍成立。特别地，不要求分裂 HMC 单独满足谱隙假设。若初始分布 $\eta_0=\gamma^{\otimes(J+1)}$，则 $D_0\leq\kappa^{\sum_{j=0}^J\beta_j}-1$。

**证明。** 除非另有说明，以下算子的范数都定义在中心化空间 $L_0^2(\Pi):=\{f\in L^2(\Pi):\int f\,d\Pi=0\}$ 上。每个局部核和每次 Metropolis 交换都保持 $\Pi$ 不变，因而都是 $L^2(\Pi)$ 压缩算子。它们的复合也保持联合目标分布，其最冷副本边缘分布就是 $\nu_\theta^y$。

**pCN 更新的压缩性。** 令 $\mathsf Q_j$ 表示高斯 pCN 提案核，$\mathsf A_j$ 表示相对于 $\mu_j$ 的 Metropolis 校正核。高斯核在 $L^2(\gamma)$ 上自伴且为正，中心化范数为 $\cos h_{\beta_j}$。记 $a_j=d\mu_j/d\gamma$，被接受的转移测度为

$$
\min\{a_j(z),a_j(z')\}\,\gamma(dz)\mathsf Q_j(z,dz').
$$

比较 Dirichlet 型和方差得到

$$
\begin{aligned}
\langle f,(I-\mathsf A_j)f\rangle_{\mu_j}
&\geq(\inf a_j)\langle f,(I-\mathsf Q_j)f\rangle_\gamma\\
&\geq\frac{\inf a_j}{\sup a_j}
(1-\cos h_{\beta_j})\operatorname{Var}_{\mu_j}(f)\\
&\geq\kappa^{-\beta_j}
(1-\cos h_{\beta_j})\operatorname{Var}_{\mu_j}(f).
\end{aligned}
$$

校正后的核也为正，因为

$$
\min\{a_j(z),a_j(z')\}
=\int_0^\infty
\mathbf 1_{\{a_j(z)\geq s\}}
\mathbf 1_{\{a_j(z')\geq s\}}\,ds
$$

将接受部分的二次型表示为 $\mathsf Q_j$ 的非负二次型积分，而拒绝部分也非负。因此，可逆性与正性蕴含

$$
\|\mathsf A_j\|_{L_0^2(\mu_j)\to L_0^2(\mu_j)}
\leq1-\kappa^{-\beta_j}(1-\cos h_{\beta_j}).\tag{28}
$$

**所有副本均使用 pCN 的扫描。** 对式（28）进行张量化可知，联合局部更新的中心化范数不超过 $q_{\mathrm{pCN}}$。随后执行的交换扫描是压缩算子，因而在 $n$ 次扫描后，该范数不超过 $q_{\mathrm{pCN}}^n$。把伴随算子作用于初始密度差 $d\eta_0/d\Pi-1$，即可证明式（26）的第一个界。

**混合扫描。** 令 $\mathsf H$ 为最冷副本的不变核，并写出局部更新

$$
\mathsf L=
\left(\bigotimes_{j<J}\mathsf A_j\right)\otimes\mathsf H.
$$

令 $\mathsf E$ 为向最冷坐标函数空间的正交投影：它对所有较热坐标按照 $\bigotimes_{j<J}\mu_j$ 积分。$\mathsf L$ 与 $\mathsf E$ 可交换，并且式（28）给出

$$
\|\mathsf L\mathsf E\|\leq1,\qquad
\|\mathsf L(I-\mathsf E)\|\leq r,\qquad
r:=1-g_{\mathrm{hot}}\in[0,1).
$$

对于完整的交换扫描 $\mathsf S$，所有只涉及较热副本的交换满足 $\mathsf E\mathsf S_j=\mathsf S_j\mathsf E=\mathsf E$。因为边 $(J-1,J)$ 只尝试一次交换，所以 $\mathsf E\mathsf S\mathsf E=\mathsf E\mathsf S_{J-1}\mathsf E$。当作用于最冷坐标的函数时，该核是一个独立 Metropolis 核，其目标为 $\mu_J$，提案为 $\mu_{J-1}$。此外，

$$
\frac{d\mu_J}{d\mu_{J-1}}(z)
=\frac{Z_{J-1}}{Z_J}\omega(z)^{1-\beta_{J-1}}
\leq\kappa^{1-\beta_{J-1}}=a^{-1}.
$$

其转移核因此以 $a\mu_J$ 为下界，得到在 $L_0^2(\Pi)$ 上 $\|\mathsf E\mathsf S\mathsf E\|\leq1-a$。

设置 $\mathsf D:=\mathsf E+r(I-\mathsf E)$。对于 $r>0$，算子 $\mathsf T:=\mathsf L\mathsf E+r^{-1}\mathsf L(I-\mathsf E)$ 是压缩算子，并满足 $\mathsf L=\mathsf T\mathsf D=\mathsf D\mathsf T$。当 $r=0$ 时，取 $\mathsf T=\mathsf L$，仍有相同分解。因此，

$$
\begin{aligned}
\|\mathsf L\mathsf S\mathsf L\|
&\leq\|\mathsf D\mathsf S\mathsf D\|\\
&\leq r^2+2r(1-r)+(1-r)^2(1-a)\\
&=1-g_{\mathrm{hot}}^2a=q_{\mathrm{hyb}}.
\end{aligned}
$$

这里，将 $\mathsf D=rI+(1-r)\mathsf E$ 展开，并利用 $\mathsf S$、$\mathsf E\mathsf S$ 和 $\mathsf S\mathsf E$ 均为压缩算子。每次正式采样扫描在函数上的作用为 $\mathsf L\mathsf S_n$，所以不论指定交换顺序如何，每连续两次扫描都会使中心化范数至少按因子 $q_{\mathrm{hyb}}$ 压缩。将相应伴随算子作用于初始密度差，即可证明式（27）的 $\chi^2$ 界。该论证仅用到 $\mathsf H$ 的不变性，因此也证明了任意最冷不变核的推广结论。

**最冷边缘的 Wasserstein 界。** $\mu_J$ 相对于 $\gamma$ 的密度的最大值与最小值之比不超过 $\kappa$。利用高斯对数 Sobolev 不等式、有界扰动定理及对数 Sobolev 不等式所蕴含的传输不等式（Otto & Villani，2000），

$$
W_2^2(\nu,\mu_J)\leq
2\kappa\operatorname{KL}(\nu\|\mu_J)
\leq2\kappa\chi^2(\nu\|\mu_J).
$$

另见 Wang 等（2026a，引理 A.10）。条件 Jensen 不等式给出 $\chi^2(\nu_n\|\mu_J)\leq\chi^2(\eta_n\|\Pi)$。将其与联合分布界结合，就证明了式（26）和式（27）；其中后者可写成 $C\rho^n$，取 $\rho=\sqrt{q_{\mathrm{hyb}}}$，$C=\sqrt{2\kappa D_0/q_{\mathrm{hyb}}}$。

最后，在独立高斯初始化下，

$$
D_0+1=
\prod_{j=0}^J
\left[
\left(\int\omega^{\beta_j}\,d\gamma\right)
\left(\int\omega^{-\beta_j}\,d\gamma\right)
\right]
\leq\kappa^{\sum_{j=0}^J\beta_j}.
$$

证明完毕。

**推论 A.3（端到端收敛）。** 假定定理 3.7、定理 3.9 和定理 A.2 的假设均成立。此外，假定 $S_\theta$ 满足 $L_{S_\theta}$-Lipschitz 条件、$0\leq\delta\leq L_G/2$，以及 $L_yb_K(\delta)\leq Z_y/2$。定义

$$
s_n:=\sqrt{2\kappa D_0}
\begin{cases}
q_{\mathrm{pCN}}^n,&\text{iMF+SPT+pCN},\\
q_{\mathrm{hyb}}^{\lfloor n/2\rfloor},&\text{iMF+SPT+hybrid}.
\end{cases}
$$

那么，数据空间输出分布满足

$$
\begin{aligned}
W_2((S_\theta)_\#\nu_n,\pi^y)
&\leq L_{S_\theta}s_n
+L_{S_\theta}C_y(d)^{1/2}b_K(\delta)^{1/2}\\
&\quad+\sqrt{\frac{M_y}{Z_y}}\,b_K(\delta).
\end{aligned}\tag{29}
$$


## 附录 B. 补充实验

### B.1 训练损失与映射误差之间的经验关系

我们使用二维 Banana 先验检验定理 3.7 所建立的边缘联合风险与传输映射误差之间的关系：

$$
X=\bigl(U,\,0.62(U^2-1)+0.30V\bigr),\qquad
U,V\overset{\rm iid}{\sim}\mathcal N(0,1).
$$

对于相互独立的 $X\sim\pi_0$ 与 $Z\sim\mathcal N(0,I_2)$，采用插值 $W_t=(1-t)X+tZ$ 和边缘速度 $v(w,t)=\mathbb E[Z-X\mid W_t=w]$。参考映射 $S=\varphi_{0,1}$ 是**由这一边缘速度诱导的传输**，而不是用于生成 Banana 样本的显式三角映射。

**数值参考。** 在给定 $W_t$ 第一个坐标的条件下，$U$ 的条件分布为高斯分布。将 $V$ 解析积分消去后，$v(w,t)$ 的计算化为一维高斯求积，其权重由 $W_t$ 的第二个坐标确定。作者采用 128 点 Gauss–Hermite 求积，并使用 DOP853 在双精度下从 $t=1$ 到 $t=0$ 对边缘 ODE 积分，相对和绝对容差分别为 $10^{-8}$ 和 $10^{-10}$。

将求积阶数加倍后，在风险评估输入上参考速度的 RMS 变化为 $6.9\times10^{-11}$。在 128 个源样本上，分别将求积阶数加倍、将两种 ODE 容差同时收紧十倍，参考映射的 RMS 变化为 $8.3\times10^{-15}$ 和 $8.7\times10^{-9}$。这些灵敏度检查表明，在观察到的映射误差尺度上，参考值的数值计算误差可以忽略。

**训练与评估。** iMF 模型采用 3 个宽度为 128 的 SiLU 隐藏层，平均速度与辅助速度使用不同的输出头；训练集包含 20,000 个固定先验样本。优化器为 Adam，学习率 $10^{-3}$，权重衰减 $10^{-5}$，批量大小 512，共执行 16,000 次更新。采用独立的数据–噪声耦合、独立且未经排序的均匀时间变量 $(r,t)\in[0,1]^2$，辅助损失权重 $\lambda=1$。原文图 3 对应随机种子为 0 的一次训练。

在初始化时以及之后每 500 次更新，使用 8,192 个保留的插值样本和数值参考速度，从边缘残差直接估计

$$
\delta=R_{\mathrm{iMF}}+\lambda R_{\mathrm{FM}}.
$$

因此，$\widehat\delta$ 估计的是定理 3.7 中的**边缘风险**，而非包含不可约回归噪声的原始训练损失。同时，估计平方映射误差

$$
\widehat E_K=\frac1{2048}\sum_{i=1}^{2048}
\|S_{\theta,K}(z_i)-S(z_i)\|_2^2,
\qquad z_i\sim\mathcal N(0,I_2),
$$

其中均匀间隔的生成步数 $K\in\{1,6\}$。评估样本独立于训练数据集，并在所有训练检查点之间固定。

**结果。** 图 3 表明，对于两种生成时间表，边缘风险降低通常伴随着映射误差降低。训练期间，$\widehat\delta$ 从 2.743 降至 0.0653；单步生成的平方映射误差从 0.554 降至 0.0198，六步生成则从 0.554 降至 0.00732。各训练检查点上的关系并非严格单调。上述结果从经验角度支持了定理 3.7 的损失—映射误差联系，但并未证明其渐近速率，也未建立对可能随训练变化的正则性常数的统一控制。

**图 3：** 二维 Banana 先验上边缘联合风险与平方传输映射误差的关系，分别对应一步与六步 iMF 生成。散点为按训练顺序连接的各检查点，星号表示最后的检查点；误差线表示给定已拟合模型与数值参考条件下的一个蒙特卡洛标准误差，而非训练重复实验之间的变化。[参见原文图 3](https://arxiv.org/html/2610.01034v1#S5.F3)。

### B.2 合成实验

**先验训练。** 对于每个场景，所有模型均使用相同的 20,000 个固定先验样本训练，网络由 4 个宽度为 512 的 SiLU 隐藏层构成，以学习率 $10^{-3}$ 完成 16,000 次优化更新。iMF 模型使用原始时间输入 $(r,t)$ 和独立的平均速度、辅助速度输出头；FM 与扩散模型使用 4 个 Fourier 时间谐波。iMF 和 FM 都采用独立数据–噪声耦合。

对 iMF，$r,t$ 分别独立采样于 $\operatorname{Unif}[0,1]$，辅助损失权重为 $\lambda=1$。iMF 使用带 $10^{-5}$ 权重衰减的 Adam；FM 与扩散模型使用无权重衰减的 AdamW，两者均取 $(\beta_1,\beta_2)=(0.9,0.999)$。范数为 5 的梯度裁剪仅用于 FM 与扩散模型。图 4 显示，三类模型都学到了 Banana 和 Sine 先验的主要几何结构。

**图 4：** （a）Banana 先验，（b）Sine 先验；比较 iMF、FM 和扩散模型对先验分布的学习结果。[查看原文图 4](https://arxiv.org/html/2610.01034v1#S5.F4)。

**后验采样。** 两种 iMF 采样器共用均匀时间间隔的六步传输映射，FM+SPT+pCN 则使用 100 步 RK4（每次传输计算 400 次网络前向）。所有 SPT 方法均采用十个并行温度梯队，每个梯队有 24 个逆温度 $\beta_\ell=(\ell/23)^2$，$\ell=0,\ldots,23$，并从 $\mathcal N(0,I_{32})$ 初始化。pCN 变体在所有副本上采用 pCN；混合方法在最冷副本使用六个积分步、初始步长为 0.05 的分裂 HMC。

在 500 次自适应扫描中，提案参数由不同温度独立更新，在十个梯队中共享；更新使用十个梯队观测到的平均接受率。对 pCN 噪声尺度的 logit 和 HMC 步长的对数分别执行加性更新，增益随扫描次数 $s=0,\ldots,499$ 按 $0.10/\sqrt{1+s/30}$ 和 $0.055/\sqrt{1+s/30}$ 衰减，并与观测接受率相对于目标接受率的差成正比。pCN 和分裂 HMC 的目标接受率分别为 0.30 与 0.75。

这些选择与 Chen 等（2016）提出的 pCN 调整范围 0.3–0.5，以及 Betancourt 等（2014）讨论的通用（leapfrog）HMC 接受率范围 0.6–0.9 相一致。最热副本的 pCN 噪声尺度保持为 0.999。每次扫描包含奇数边与偶数边的相邻交换，二者顺序在不同扫描之间交替。

自适应结束后固定全部提案参数，再丢弃额外 500 次预热扫描，然后在每个梯队中连续保留 600 个未经抽稀的最冷状态，从而对每种方法和随机种子得到 6,000 个样本。DPS 同样生成 6,000 个样本，使用 1,000 个 DDPM 步，噪声调度从 $10^{-4}$ 到 $2\times10^{-2}$ 线性变化。

作者发现，把 DPS 引导按 $\sigma_y^{-2}$ 缩放会在实验中造成数值不稳定。因此，他们遵照 Chung 等（2023，附录 D.1）及其官方实现中的残差依赖步长方案，使用

$$
-0.3\nabla_{x_t}\|G(\widehat x_0(x_t))-y\|_2
$$

作为引导项，而不显式乘以噪声方差的倒数。用随机种子 0、1、2、3 分别重复采样；完整实现设置将随公开代码提供。图 5 和 6 将后验样本直方图与数值参考后验比较。iMF 与 FM 的 SPT 方法都能够较好地恢复主要后验结构，而 DPS 存在相对于参考分布的系统性偏差。

**评价指标。** 设数据维度为 $d$，梯队数量为 $C$，每梯队保留 $N$ 个样本；记 $\rho_{j,c}(\ell)$ 为梯队 $c$ 的坐标 $j$ 在滞后 $\ell$ 上的自相关，则平均坐标有效样本量为

$$
\mathrm{Coord.\ ESS}
=\frac1d\sum_{j=1}^d\sum_{c=1}^C
\frac{N}{1+2\sum_{\ell=1}^{\infty}\rho_{j,c}(\ell)},
\qquad
\mathrm{Coord.\ ESS/s}
=\frac{\mathrm{Coord.\ ESS}}{T_{\mathrm{sampling}}}.
$$

对于 $\mathbb R^d$ 上的两个分布 $\mu,\nu$，切片 Wasserstein 距离为

$$
\mathrm{SW}_2(\mu,\nu)
=\left(\int_{\mathbb S^{d-1}}
W_2^2((P_\omega)_\#\mu,(P_\omega)_\#\nu)
\,d\sigma(\omega)\right)^{1/2},
\qquad P_\omega(x)=\omega^\top x,
$$

其中 $\sigma$ 为单位球面上的均匀概率测度。对于 $J$ 个二维块，以及各块第一坐标边缘分布的共同划分 $\{B_{j,b}\}_{b=1}^{B}$，定义 $p_{j,b}=\mu\{x:x_{j,1}\in B_{j,b}\}$ 和 $q_{j,b}=\nu\{x:x_{j,1}\in B_{j,b}\}$，则

$$
\mathrm{Bin\ TV}(\mu,\nu)
=\frac1J\sum_{j=1}^J\frac12\sum_{b=1}^{B}|p_{j,b}-q_{j,b}|.
$$

**图 5：** Banana 先验下的后验样本直方图；[查看原图](https://arxiv.org/html/2610.01034v1#S5.F5)。

**图 6：** Sine 先验下的后验样本直方图；[查看原图](https://arxiv.org/html/2610.01034v1#S5.F6)。

### B.3 CLIP 引导的 ImageNet 实验

#### B.3.1 实验细节

作者采用预训练的一步传输 iMF-XL/2（[基础模型来源](https://github.com/Lyy-iiis/imeanflow/tree/torch)），设置 $\omega=8$、引导区间 $[0.4,0.65]$；并采用冻结的 SiT-XL/2（[预训练权重](https://huggingface.co/sairights/sit-xl-2-256x256-sde-cfg/resolve/5a15dcc/pretrained_models/SiT-XL-2-256x256.safetensors)），配合 125 个 Heun 步（250 次速度评估）及值为 4 的无分类器引导尺度。

对于每一组类别–提示词，使用 8 个独立温度梯队，各含 8 个副本，逆温度线性安排为 $\beta_k=k/7$，初始化为 $\mathcal N(0,I)$。iMF 方法运行 250 次自适应扫描、250 次预热扫描，以及每梯队 1,000 次保留样本扫描，总计得到 8,000 个最冷状态。每次自适应扫描对全部八个梯队的局部提案接受率取平均。

随后逐步减小 pCN 提案尺度的更新幅度，目标接受率为 0.30；对于 iMF+SPT+hybrid，还调整最冷副本的分裂 HMC 步长，使目标接受率为 0.75。正式预热之前固定所得提案参数。iMF+SPT+hybrid 在最冷副本采用六步分裂 HMC，其余全部副本采用 pCN。

SiT+SPT+pCN 在两种 iMF 方法之后运行，并采用特定于提示词的时间预算：其采样预算等于实际测得的 iMF+SPT+hybrid 采样耗时，另有一小时用于加载、预检查、评分与导出。可用采样时间分别按 $1/6$、$1/6$ 与 $2/3$ 分配给自适应、预热以及保留样本采样，并且只执行完整的扫描。

#### B.3.2 完整结果

原文表 3 报告全部实验结果，图 7–18 展示每种方法中前两个梯队的样本。

**表 3：保留样本的 CLIP 奖励与采样成本。**

| 类别、提示词 | 方法 | 平均 CLIP 奖励 ↑ | 采样耗时（小时） | 平均扫描耗时（秒） |
|---|---|---:|---:|---:|
| 金毛寻回犬：在落下的秋叶中奔跑的照片 | Best-of-K | 0.2864 | 2.49 | — |
| 同上 | SiT+SPT+pCN | 0.3122 | 10.51 | 370.89 |
| 同上 | iMF+SPT+pCN | 0.3809 | 2.40 | 5.75 |
| 同上 | iMF+SPT+hybrid | 0.3824 | 10.95 | 26.28 |
| 金毛寻回犬：阳光明媚的草地上的专业照片，焦点锐利、色彩自然 | Best-of-K | 0.3073 | 2.48 | — |
| 同上 | SiT+SPT+pCN | 0.3368 | 10.79 | 373.28 |
| 同上 | iMF+SPT+pCN | 0.3741 | 2.43 | 5.83 |
| 同上 | iMF+SPT+hybrid | 0.3754 | 11.26 | 27.02 |
| 金毛寻回犬：站在飘雪中的彩色画作 | Best-of-K | 0.2885 | 2.45 | — |
| 同上 | SiT+SPT+pCN | 0.3355 | 10.96 | 372.17 |
| 同上 | iMF+SPT+pCN | 0.3945 | 2.50 | 6.01 |
| 同上 | iMF+SPT+hybrid | 0.4011 | 11.50 | 27.58 |
| 金毛寻回犬：在清澈蓝色湖水中游泳的照片 | Best-of-K | 0.3064 | 2.45 | — |
| 同上 | SiT+SPT+pCN | 0.3675 | 10.69 | 369.97 |
| 同上 | iMF+SPT+pCN | 0.3847 | 2.45 | 5.88 |
| 同上 | iMF+SPT+hybrid | 0.3845 | 11.16 | 26.69 |
| 白头海雕：栖在树枝上、周围有红黄秋叶的照片 | Best-of-K | 0.3086 | 2.50 | — |
| 同上 | SiT+SPT+pCN | 0.3156 | 10.73 | 371.46 |
| 同上 | iMF+SPT+pCN | 0.3743 | 2.46 | 5.90 |
| 同上 | iMF+SPT+hybrid | 0.3781 | 11.20 | 26.87 |
| 白头海雕：从湖中捕鱼、水花飞溅的照片 | Best-of-K | 0.3247 | 2.59 | — |
| 同上 | SiT+SPT+pCN | 0.3407 | 10.78 | 376.60 |
| 同上 | iMF+SPT+pCN | 0.3625 | 2.46 | 5.90 |
| 同上 | iMF+SPT+hybrid | 0.3596 | 11.17 | 26.81 |
| 白头海雕：展开双翼飞越雪山的照片 | Best-of-K | 0.3278 | 2.49 | — |
| 同上 | SiT+SPT+pCN | 0.3481 | 10.70 | 370.27 |
| 同上 | iMF+SPT+pCN | 0.3936 | 2.44 | 5.85 |
| 同上 | iMF+SPT+hybrid | 0.3914 | 11.15 | 26.76 |
| 白头海雕：栖在飘雪松枝上的彩色画作 | Best-of-K | 0.2984 | 2.58 | — |
| 同上 | SiT+SPT+pCN | 0.3139 | 10.74 | 371.58 |
| 同上 | iMF+SPT+pCN | 0.3727 | 2.41 | 5.77 |
| 同上 | iMF+SPT+hybrid | 0.3713 | 11.16 | 26.78 |
| 水貂：站在苔藓环绕的清澈林间小溪边的照片 | Best-of-K | 0.3629 | 2.75 | — |
| 同上 | SiT+SPT+pCN | 0.3946 | 10.72 | 371.04 |
| 同上 | iMF+SPT+pCN | 0.4190 | 2.45 | 5.89 |
| 同上 | iMF+SPT+hybrid | 0.4112 | 11.12 | 26.70 |
| 水貂：站在飘雪中的彩色画作 | Best-of-K | 0.3160 | 2.49 | — |
| 同上 | SiT+SPT+pCN | 0.3487 | 10.47 | 369.64 |
| 同上 | iMF+SPT+pCN | 0.4186 | 2.36 | 5.66 |
| 同上 | iMF+SPT+hybrid | 0.4162 | 10.99 | 26.37 |
| 城堡：覆盖积雪的中世纪城堡彩色画作 | Best-of-K | 0.2489 | 2.48 | — |
| 同上 | SiT+SPT+pCN | 0.2797 | 10.53 | 371.82 |
| 同上 | iMF+SPT+pCN | 0.3618 | 2.42 | 5.79 |
| 同上 | iMF+SPT+hybrid | 0.3569 | 10.92 | 26.21 |
| 城堡：日出时分绿色乡间山丘上的中世纪城堡照片 | Best-of-K | 0.3023 | 2.46 | — |
| 同上 | SiT+SPT+pCN | 0.3476 | 10.96 | 372.13 |
| 同上 | iMF+SPT+pCN | 0.3820 | 2.52 | 6.05 |
| 同上 | iMF+SPT+hybrid | 0.3849 | 11.40 | 27.35 |
| 航空母舰：在日落时分航行于大海上的照片 | Best-of-K | 0.2879 | 2.49 | — |
| 同上 | SiT+SPT+pCN | 0.3286 | 10.38 | 373.72 |
| 同上 | iMF+SPT+pCN | 0.3667 | 2.42 | 5.80 |
| 同上 | iMF+SPT+hybrid | 0.3659 | 10.90 | 26.16 |
| 航空母舰：平静蓝色海面上的航空母舰水彩画 | Best-of-K | 0.2956 | 2.52 | — |
| 同上 | SiT+SPT+pCN | 0.3055 | 10.63 | 367.95 |
| 同上 | iMF+SPT+pCN | 0.3736 | 2.49 | 5.97 |
| 同上 | iMF+SPT+hybrid | 0.3774 | 11.07 | 26.55 |

**图 7–18：** 这些补充图分别对应上述 12 组类别–提示词组合，每幅图均包含 best-of-K、SiT+SPT+pCN、iMF+SPT+pCN、iMF+SPT+hybrid 四种方法的样本示例。各图从原文中按如下顺序排列：

- **图 7：** 金毛寻回犬，阳光草地的专业照片。
- **图 8：** 白头海雕，栖于红黄秋叶环绕的枝头。
- **图 9：** 金毛寻回犬，飘雪中的彩色画作。
- **图 10：** 白头海雕，栖在雪中的松枝上。
- **图 11：** 金毛寻回犬，在清澈的蓝色湖水中游泳。
- **图 12：** 白头海雕，从湖中捕鱼、溅起水花。
- **图 13：** 水貂，苔藓环绕的林间小溪。
- **图 14：** 水貂，飘雪中的彩色画作。
- **图 15：** 城堡，日出时绿色乡间山丘上的中世纪城堡。
- **图 16：** 城堡，覆盖积雪的中世纪城堡画作。
- **图 17：** 航空母舰，日落时在大海上航行。
- **图 18：** 航空母舰，平静蓝色海面上的水彩画。

为维持博客轻量化原则，图像保留在[作者原文中的图 7–18](https://arxiv.org/html/2610.01034v1#S5)；本站提供中文图注与对应实验数据，不重复上传原图文件。


## 参考文献

以下按原论文参考文献列表保留作者、英文篇名、出版来源、年份与可核验编号；书目标题不另作意译，以便检索和复核。

1. Ben-Hamu, H., Puny, O., Gat, I., Karrer, B., Singer, U., & Lipman, Y. *D-flow: Differentiating through flows for controlled generation*. arXiv:2402.14017, 2024.
2. Beskos, A., Roberts, G., Stuart, A., & Voss, J. *MCMC methods for diffusion bridges*. Stochastics and Dynamics, 8(03), 319–350, 2008.
3. Beskos, A., Pinski, F. J., Sanz-Serna, J. M., & Stuart, A. M. *Hybrid Monte Carlo on Hilbert spaces*. Stochastic Processes and their Applications, 121(10), 2201–2230, 2011.
4. Betancourt, M., Byrne, S., & Girolami, M. *Optimizing the integrator step size for Hamiltonian Monte Carlo*. arXiv:1411.6669, 2014.
5. Bissiri, P. G., Holmes, C. C., & Walker, S. G. *A general framework for updating belief distributions*. Journal of the Royal Statistical Society Series B: Statistical Methodology, 78(5), 1103–1130, 2016.
6. Boffi, N. M., Albergo, M. S., & Vanden-Eijnden, E. *Flow map matching with stochastic interpolants: A mathematical framework for consistency models*. arXiv:2406.07507, 2024.
7. Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. K. *Neural ordinary differential equations*. Advances in Neural Information Processing Systems, 31, 2018.
8. Chen, Y., Keyes, D., Law, K. J. H., & Ltaief, H. *Accelerated dimension-independent adaptive metropolis*. SIAM Journal on Scientific Computing, 38(5), S539–S565, 2016.
9. Cheng, Z., Wang, L.-L., & Wang, Z. *Preconditioned one-step generative modeling for Bayesian inverse problems in function spaces*. arXiv:2603.14798, 2026.
10. Chung, H., Kim, J., Mccann, M. T., Klasky, M. L., & Ye, J. C. *Diffusion posterior sampling for general noisy inverse problems*. International Conference on Learning Representations (ICLR), 2023.
11. Cotter, S. L., Roberts, G. O., Stuart, A. M., & White, D. *MCMC methods for functions: modifying old algorithms to make them faster*. Statistical Science, 424–446, 2013.
12. Earl, D. J., & Deem, M. W. *Parallel tempering: Theory, applications, and new perspectives*. Physical Chemistry Chemical Physics, 7(23), 3910–3916, 2005.
13. Geng, Z., Deng, M., Bai, X., Kolter, Z., & He, K. *Mean flows for one-step generative modeling*. Advances in Neural Information Processing Systems, 38, 75460–75482, 2026a.
14. Geng, Z., Lu, Y., Wu, Z., Shechtman, E., Kolter, J. Z., & He, K. *Improved mean flows: On the challenges of fastforward generative models*. Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 30467–30476, 2026b.
15. Geyer, C. J. *Markov chain Monte Carlo maximum likelihood*. 1991.
16. Greenberg, D., Nonnenmacher, M., & Macke, J. *Automatic posterior transformation for likelihood-free inference*. International Conference on Machine Learning (ICML), 2404–2414, PMLR, 2019.
17. Hairer, E., Wanner, G., & Nørsett, S. P. *Solving ordinary differential equations I: Nonstiff problems*. Springer, 1993.
18. Hoffman, M., Sountsov, P., Dillon, J. V., Langmore, I., Tran, D., & Vasudevan, S. *Neutra-lizing bad geometry in Hamiltonian Monte Carlo using neural transport*. arXiv:1903.03704, 2019.
19. Hoffman, M. D., Gelman, A., et al. *The No-U-Turn sampler: adaptively setting path lengths in Hamiltonian Monte Carlo*. Journal of Machine Learning Research, 15(1), 1593–1623, 2014.
20. Karthik, S., Roth, K., Mancini, M., & Akata, Z. *If at first you don't succeed, try, try again: Faithful diffusion-based text-to-image generation by selection*. arXiv:2305.13308, 2023.
21. Korbak, T., Perez, E., & Buckley, C. *RL with KL penalties is better viewed as Bayesian inference*. Findings of the Association for Computational Linguistics: EMNLP, 1083–1091, 2022.
22. Lipman, Y., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., & Le, M. *Flow matching for generative modeling*. International Conference on Learning Representations (ICLR), 2023.
23. Lu, J., & Wang, Z. *On variance reduction in learning mean flows*. arXiv:2605.09235, 2026.
24. Lunz, S., Öktem, O., & Schönlieb, C.-B. *Adversarial regularizers in inverse problems*. Advances in Neural Information Processing Systems, 31, 2018.
25. Ma, N., Goldstein, M., Albergo, M. S., Boffi, N. M., Vanden-Eijnden, E., & Xie, S. *SiT: Exploring flow and diffusion-based generative models with scalable interpolant transformers*. European Conference on Computer Vision (ECCV), 23–40, Springer, 2024.
26. Otto, F., & Villani, C. *Generalization of an inequality by Talagrand and links with the logarithmic Sobolev inequality*. Journal of Functional Analysis, 173(2), 361–400, 2000.
27. Papamakarios, G., Nalisnick, E., Rezende, D. J., Mohamed, S., & Lakshminarayanan, B. *Normalizing flows for probabilistic modeling and inference*. Journal of Machine Learning Research, 22(57), 1–64, 2021.
28. Parno, M. D., & Marzouk, Y. M. *Transport map accelerated Markov chain Monte Carlo*. SIAM/ASA Journal on Uncertainty Quantification, 6(2), 645–682, 2018.
29. Patel, D., & Oberai, A. A. *Bayesian inference with generative adversarial network priors*. arXiv:1907.09987, 2019.
30. Patel, D. V., Ray, D., & Oberai, A. A. *Solution of physics-based Bayesian inverse problems with deep generative priors*. Computer Methods in Applied Mechanics and Engineering, 400, 115428, 2022.
31. Purohit, V., Repasky, M., Lu, J., Qiu, Q., Xie, Y., & Cheng, X. *Consistency posterior sampling for diverse image synthesis*. Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 28327–28336, June 2025.
32. Radev, S. T., Schmitt, M., Schumacher, L., Elsemüller, L., Pratz, V., Schälte, Y., Köthe, U., & Bürkner, P.-C. *BayesFlow: Amortized Bayesian workflows with neural networks*. arXiv:2306.16015, 2023.
33. Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., et al. *Learning transferable visual models from natural language supervision*. International Conference on Machine Learning, 8748–8763, PMLR, 2021.
34. Ramzi, Z., Remy, B., Lanusse, F., Starck, J.-L., & Ciuciu, P. *Denoising score-matching for uncertainty quantification in inverse problems*. arXiv:2011.08698, 2020.
35. Stuart, A. M. *Inverse problems: A Bayesian perspective*. Acta Numerica, 19, 451–559, 2010.
36. Tong, A., Fatras, K., Malkin, N., Huguet, G., Zhang, Y., Rector-Brooks, J., Wolf, G., & Bengio, Y. *Improving and generalizing flow-based generative models with minibatch optimal transport*. Transactions on Machine Learning Research, 2024.
37. Villani, C., et al. *Optimal transport: old and new*. Vol. 338, Springer, 2009.
38. Vincent, P. *A connection between score matching and denoising autoencoders*. Neural Computation, 23(7), 1661–1674, 2011.
39. Wang, S.-H., Keller, J., Transue, T., Brown, D. B., Strohmer, T., & Wang, B. *Test-time guidance for flow-based generative models via parallel tempering on source distributions*. International Conference on Machine Learning (ICML), 2026a.
40. Wang, Z., Harting, A., Barreau, M., Zavlanos, M., & Johansson, K. H. *Source-guided flow matching*. International Conference on Learning Representations (ICLR), 2026b.
41. Zhang, B. J., Marzouk, Y. M., & Spiliopoulos, K. *Transport map unadjusted Langevin algorithms: Learning and discretizing perturbed samplers*. Foundations of Data Science, 7(3), 705–736, 2025.


---

**译文状态：** 摘要、正文、证明和补充实验附录 A–B、参考文献及所有图 1–18 的中文图注已整理，原图链接指向作者版本；仍需最终公式、数据与网页渲染 QA，尚不计入已验收全文。

{% endraw %}
