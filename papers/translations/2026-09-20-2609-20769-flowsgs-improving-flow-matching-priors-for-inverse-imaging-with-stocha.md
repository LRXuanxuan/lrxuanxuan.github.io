---
layout: page
title: "FlowSGS：用随机插值改进逆成像流匹配先验｜中文全文译文"
permalink: /papers/translations/2026-09-20-2609-20769-flowsgs-improving-flow-matching-priors-for-inverse-imaging-with-stocha/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8cf9dc565c9d7241/) · [原文 arXiv](https://arxiv.org/abs/2609.20769) · [全部目录](/papers/catalog/)

# FlowSGS：用随机插值改进逆成像流匹配先验

**原题：** FlowSGS: Improving Flow Matching Priors for Inverse Imaging with Stochastic Interpolants  
**作者：** Tianao Li$^{1,3}$、Xinhui Qian$^{2}$、Emma Alexander$^{1,3}$  
**单位：** $^{1}$ 西北大学计算机科学系；$^{2}$ 西北大学统计与数据科学系；$^{3}$ NSF-Simons 天空人工智能研究所（SkAI）。邮箱：ealexander@u.northwestern.edu。  
**版本：** arXiv:2609.20769v1（cs.CV），2026 年 9 月 17 日；预印本（Preprint）；原文 32 页（正文 + 参考文献 + 附录 A—E + NeurIPS 论文检查表）。  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节（含 2.1—2.2、3.1—3.2、4.1—4.5）、致谢与资助声明、图 1—11 中文图注、表 1—9 逐格转录、参考文献 [1]—[68]（英文原条目，按原编号）、附录 A—E（含定理 1、推论 1—2 的证明与实验设置）、NeurIPS 论文检查表（逐项保留问答与理由，省略模板性 Guidelines 说明）均按原文结构录入；逐句逐式终校未做。

## 摘要

流匹配已成为最先进的生成模型，并被用作即插即用（plug-and-play, PnP）先验来求解计算成像中的逆问题。然而，现有基于流的逆问题求解器假设前向模型是线性的，和/或在后验采样中做了简化近似。为规避这些问题，我们提出 **FlowSGS**：一种基于流的后验采样方法，它用 **Split Gibbs 采样（SGS）** 把后验分解为似然步与先验步。具体而言，我们用 Langevin 动力学从似然步采样，并借助**随机插值（Stochastic Interpolants, SI）**框架把预训练流模型集成到先验步中。我们给出了使用 SI 反向时间 SDE 的先验步形式，并说明了其与既有 PnP 方法之间的联系。此外，借助流先验的直线概率路径与一种新的反向时间 SDE 时间步校正技术，FlowSGS 在先验步中所需的网络评估次数少于即插即用扩散采样器。实验表明，该方法在一系列逆问题上达到最先进性能。我们首次为基于流的逆问题求解器提供了非线性逆问题（Fourier 相位恢复）上的实验。

## 1 引言

计算成像系统旨在从不完整且含噪的测量 $y=A(x)+n\in\mathbb R^m$ 中重建被编码的图像 $x\in\mathbb R^n$，其中 $A(\cdot)$ 为前向模型、$n$ 表示噪声。由于信息损失，这些逆问题通常是不适定的，导致重建图像 $\hat x$ 存在不确定性。为充分探索解空间，通常希望从贝叶斯后验中采样：

$$
\hat x\sim p(x\mid y)\propto p(y\mid x)p(x),\tag{1}
$$

其中 $p(y\mid x)$ 为数据似然、$p(x)$ 为先验。这对科学与医学成像尤为重要，因为下游应用要基于此做出高风险决策。

深度生成模型通过隐式捕获复杂先验显著改进了后验采样方法。基于 score 的扩散模型 [50, 27, 52] 学习目标分布的 score 函数，并通过求解扩散过程的反向时间 SDE，把基分布（通常是标准正态分布）的样本变换为目标分布的样本。扩散模型能够学习图像与视频的复杂数据分布，已被广泛用于学习先验分布 $p(x)$ 作为即插即用（PnP）先验。多数扩散采样器通过在测量 $y$ 上做条件采样来抽取后验样本：或沿数据似然增大的方向取梯度步（如 DPS [14] 及许多其他工作 [29, 33, 26, 41]），或投影到测量空间（如 [51, 16, 15]）。PnP-DM [58] 与若干其他工作 [68, 59, 17, 13] 利用变量分裂把采样拆分为似然步与先验步，并把预训练扩散模型作为即插即用先验纳入。Inversebench [67] 提供了即插即用扩散采样器在多种真实世界逆问题上的综合基准，其中 PnP-DM [58] 与 DAPS [62] 是表现突出的最先进扩散采样器。

流匹配是一种新兴生成技术，它通过构造更直的的概率路径改进扩散模型，从而带来更高效的采样、更易的训练与更高质量的数据生成 [37, 38]。尽管已有若干基于流的逆问题求解器，但它们依赖数学近似 [47, 6, 64, 60, 42, 45, 34, 5] 或假设前向模型线性 [47, 64, 60, 42, 5]。具体而言，PnP-Flow [42] 在数据保真梯度步、插值步与使用流网络作为时变去噪器的去噪步之间迭代；FlowChef [45] 用无梯度的向量场操纵把概率流 ODE 轨迹推向测量一致的点；FlowDPS [34] 推导出 Tweedie 公式的流版本，并同时估计干净图像与噪声分量，以维持数据一致性与生成质量。其他工作 [18] 把流网络转化为有原则的先验，并通过变分推断学习后验。重要的是，这些模型都没有在非线性逆问题上得到验证。

随机插值（SI）是近期的统一框架，揭示了扩散采样与流匹配之间的深层联系 [2]。我们利用其 score 函数与速度场之间的对应关系，提出 **FlowSGS**——一种更有原则的、以流匹配为即插即用先验的后验采样器。具体地，我们的变量分裂技术避免了以往流匹配采样器的主要简化假设与近似。我们通过 split Gibbs 采样（SGS）把后验采样拆分为似然步与先验步，并用 Langevin 动力学与预训练流网络迭代求解这两步。与依赖似然梯度 [34]、无梯度轨迹操纵 [45] 或后验变分近似 [18] 的先验流方法不同，我们基于 SGS 的分裂提供了以真实贝叶斯后验为目标的有原则采样方法。借助新的时间步校正技术，我们的流先验集成在先验步中所需步数少于 PnP-DM [58]，这与"流先验中更直的概率路径带来更好采样"的理论一致。FlowSGS 的高层概览见图 1。

第 4 节的实验显示，相较扩散与流方法，FlowSGS 给出最先进的图像重建。我们在具有已知后验的玩具示例上展示了准确的后验采样，并在线性（运动去模糊、高斯去模糊、超分辨率、压缩感知 MRI）与非线性（Fourier 相位恢复）任务上展示了高质量图像。

## 2 预备知识

我们介绍为本文方法与理论提供基础的已有工作。

### 2.1 随机插值

随机插值（SI）[3, 2] 为扩散模型与流匹配提供了统一框架，二者都考虑对数据分布 $p(x^\ast)$ 与噪声（通常为标准正态分布 $\mathcal N(0,I)$）做插值以进行生成建模。这类插值过程具有如下形式

$$
x_t=\alpha_tx^\ast+\sigma_t\epsilon,\qquad\epsilon\sim\mathcal N(0,I),\tag{2}
$$

其中 $(\alpha_t,\sigma_t)$ 是定义在 $t\in[0,1]$ 上的一对光滑函数，满足：(i) 对所有 $t\in[0,1]$ 有 $\alpha_t^2+\sigma_t^2>0$；(ii) $\alpha_t$ 与 $\sigma_t$ 在 $[0,1]$ 上可微；(iii) $\alpha_0=\sigma_1=1$、$\alpha_1=\sigma_0=0$。在这些条件下，（2）中的随机过程在 $t=0$ 的干净数据 $p(x_0)$ 与 $t=1$ 的各向同性高斯噪声 $\mathcal N(0,I)$ 之间进行无偏插值。为利用插值过程从数据分布采样，可求解如下反向时间 SDE [4, 2]：

$$
dx_t=\left[v(x_t,t)-\frac{1}{2}w_ts(x_t,t)\right]dt+\sqrt{w_t}\,d\bar w_t,\tag{3}
$$

其中 $v(x,t)=\mathbb E[\dot x_t\mid x_t=x]$ 为速度场，$s(x,t)=\nabla_{x_t}\log p_t(x)$ 为 score 函数，$w_t\geq0$ 是采样时选定的扩散系数，$\bar w_t$ 为反向时间 Wiener 过程。扩散模型与流匹配中已使用不同的插值调度 $(\alpha_t,\sigma_t)$（例如基于 score 的扩散模型所用的 VP-SDE [27, 52]、Rectified Flow 所用的线性插值 [38]）。我们在 A.1 节汇总常见的插值调度 $(\alpha_t,\sigma_t)$ 与扩散系数 $w_t$ 选择。用（3）采样需要同时训练速度场 $v(x,t)$ 的流模型与 score 函数 $s(x,t)$ 的扩散模型，但已有工作 [2, 40] 表明速度与 score 可以相互转换：

$$
s(x_t,t)=\frac{\alpha_tv(x_t,t)-\dot\alpha_tx}{\sigma_t\gamma_t},\tag{4}
$$

其中 $\gamma_t\triangleq\dot\alpha_t\sigma_t-\alpha_t\dot\sigma_t<0$。（4）使得用单个预训练的 score 或速度模型即可按（3）的反向时间 SDE 采样。例如，把（3）中的 $s(\cdot,\cdot)$ 替换为 $v(\cdot,\cdot)$ 得

$$
dx_t=\left[\left(1-\frac{w_t\alpha_t}{2\sigma_t\gamma_t}\right)v(x_t,t)+\frac{w_t\dot\alpha_t}{2\sigma_t\gamma_t}x_t\right]dt+\sqrt{w_t}\,d\bar w_t.\tag{5}
$$

当扩散系数 $w_t=0$ 时，（5）退化为概率流 ODE：

$$
dx_t=v(x_t,t)\,dt,\tag{6}
$$

它已被广泛用于流匹配的采样过程。

### 2.2 Split Gibbs 采样

变量分裂在深度生成先验出现之前就已被广泛用于逆问题求解。Half-Quadratic Splitting（HQS）[11, 24] 与交替方向乘子法（ADMM）[9, 44] 等算法把正则化 MAP 优化拆分为似然步与去噪步，从而可插入预训练去噪器 [56, 10, 63, 30]。展开（unrolled）方法进一步把这类即插即用求解器变为神经网络，并允许对插入的去噪器做任务特定训练 [43]。然而，这些方法只产生点估计，而非从贝叶斯后验中抽取随机样本。

Split Gibbs 采样（SGS）[57] 为此提供了解决方案，并已被用于经典先验 [46]、预训练去噪器 [7, 20] 或扩散先验 [59, 58, 13] 的后验采样。SGS 把（1）中的贝叶斯后验采样分解为似然步与先验步，并在两步之间交替采样直至收敛。具体地，在第 $k$ 次迭代，SGS 的更新为

$$
z^{k+1}\sim\pi(z\mid x^k)\propto\exp\left[-f(z;y)-\frac{\|x^k-z\|_2^2}{2\rho_k^2}\right],\qquad\text{（似然步）}\tag{7}
$$

$$
x^{k+1}\sim\pi(x\mid z^{k+1})\propto\exp\left[-g(x)-\frac{\|x-z^{k+1}\|_2^2}{2\rho_k^2}\right],\qquad\text{（先验步）}\tag{8}
$$

其中 $f(z;y)=-\log p(y\mid z)$ 为负对数数据似然，$g(x)=-\log p(x)$ 为负对数先验，$\{\rho_k\}_{k=0}^{K-1}$ 为增广拉格朗日变量（可选配退火调度 [58]）。通过在采样过程中引入模块化结构，SGS 独立求解似然步与先验步，从而简化每个子问题的复杂度。

## 3 方法

FlowSGS 用 split Gibbs 采样（SGS）在由增广拉格朗日参数 $\{\rho_k\}$ 耦合的似然步与先验步之间交替。我们用 Langevin 动力学从似然步采样，因为它同时适用于线性与非线性前向模型；耦合参数采用指数衰减退火策略 $\rho_k=\max(\rho_0\alpha^k,\rho_{\min})$。在现有方法中，这与 PnP-DM [58] 最为相似：后者利用相同的问题分解，但在先验步中使用扩散模型。

**先验步。** 我们对先验步提出四项重要干预，即算法 1 的第 4—7 行，以适应用更高效、更准确的流匹配采样替代扩散模型。第 4 行计算第 $k$ 次迭代中先验步的正确起始时间步 $t_k$，它适配当前噪声水平 $\rho_k$ 与任意预训练流模型的插值调度（见定理 1）。第 5 行缩放似然步输出 $z^k$，使其噪声水平与插值在 $t_k$ 处的噪声 $\sigma_{t_k}$ 匹配。第 6 行用 Euler–Maruyama 方法 [35] 求解反向时间 SDE 以从先验步采样。第 7 行给出仅用速度场的 SI 反向时间 SDE——据我们所知，这是它首次被用于逆问题的后验采样。推论 1 说明在特定扩散系数选择下，我们的通用框架如何退化为 PnP-DM。更多实现细节见 C 节，收敛性分析见推论 2。第 4.3 节的基准实验表明我们的理论驱动改进在经验上有效；第 4.5 节的消融研究确认四项干预都是必要的。

**时间步校正。** 高层上看，这些干预带来的改进既体现在图像质量上，也体现在先验步 SDE 求解器所需离散化步数上。如预期，FlowSGS 的流先验可比 PnP-DM 的扩散先验使用更少采样步并产生更好结果（见第 4.5 节）。注意这使 SDE 离散化误差对流匹配比对扩散模型更显著。为缓解 SDE 的离散化误差，我们提出一种在算法 1 第 6 行求解 SDE 之前施加的时间步校正策略，如图 5a 所示。我们经验验证，当离散化步数少于 16 时，该时间步校正显著提升 FlowSGS 的重建质量。

**似然步。** 与现有基于流的后验采样器相比，似然步同样重要。我们是首个通过 SGS 纳入测量似然的基于流的方法。这一改变使逆成像中的关键应用成为可能：更准确的后验估计（第 4.2 节）以及具有双峰后验的非线性逆问题（第 4.4 节）。许多方法依赖简化近似：有的在测量空间与恢复空间之间使用线性投影 [47, 64, 60, 42, 5]，有的把似然梯度作为反向时间 SDE/ODE 的引导 [34]，或用无梯度向量场操纵来强制测量一致性 [45]。相反，我们的方法是一种直接以真实贝叶斯后验为目标的**采样**方法。由于避免了简化假设，我们的似然步需要更多计算（Langevin 采样而非单次梯度步），但以更有原则、更广泛适用的方式给出更准确的后验估计。关于引导与采样方法的更多讨论见 [58]。在纳入通用似然步的过程中，我们给出了首个使用流先验的基于 SGS 的采样方法。

**算法 1：使用 FlowSGS 的后验采样。** 输入：测量 $y$、前向模型 $A$、以插值调度 $(\alpha_t,\sigma_t)$ 预训练的速度网络 $v_\theta(\cdot,\cdot)$、扩散系数 $w_t$、迭代次数 $K$、耦合参数 $\{\rho_k\}_{k=0}^{K-1}$。

1. $x^0\sim\mathcal N(0,I)$（初始化）
2. 对 $k=0,1,\ldots,K-1$ 执行
3. $z^{k+1}\sim\pi(z\mid x^k)\propto\exp\left[-f(z;y)-\frac{\|x^k-z\|_2^2}{2\rho_k^2}\right]$（用 Langevin 动力学采样）
4. $t_k\leftarrow\left(\frac{\sigma_t}{\alpha_t}\right)^{-1}(\rho_k)$（计算与噪声水平 $\rho_k$ 对应的时间 $t_k$）
5. $x_{t_k}\leftarrow\alpha_{t_k}z^{k+1}$（把 $z^{k+1}$ 缩放到 $t_k$ 处的噪声水平）
6. $x^{k+1}\leftarrow\mathrm{Euler–Maruyama}(\mathrm{SDE},x_{t_k},t_k,0)$（带时间步校正地求解 SDE）
7. 其中 SDE 由 $dx_t=\left[\left(1-\frac{w_t\alpha_t}{2\sigma_t\gamma_t}\right)v(x_t,t)+\frac{w_t\dot\alpha_t}{2\sigma_t\gamma_t}x_t\right]dt+\sqrt{w_t}\,d\bar w_t$ 定义
8. 结束循环
9. 返回 $x^K$

### 3.1 使用流匹配的先验步

驱动 FlowSGS 先验步设计的关键观察是：从 SGS 先验步（8）采样，等价于在由耦合参数 $\rho_k$ 决定的特定起点处运行 SI 的反向时间 SDE（3）。我们在下面的定理 1 中总结这一点。

**定理 1（先验步与 SI 反向时间 SDE 的等价性）.** 设 $(\alpha_t,\sigma_t)$ 定义（2）中具有高斯概率路径的插值过程，$\alpha_{t^\ast}>0$，且 $t^\ast$ 满足 $\sigma_{t^\ast}/\alpha_{t^\ast}=\rho_k$。则从 $x_{t^\ast}=\alpha_{t^\ast}z^{k+1}$ 出发、把（3）的反向时间 SDE 运行到 $t=0$，所得样本服从（8）中 SGS 先验步 $\pi(x\mid z^{k+1})$ 的分布。

定理 1 的证明见 A.2 节。PnP-DM [58] 给出了其先验步与扩散反向时间 SDE 之间的类似等价性，而我们的定理 1 在 SI 框架下推广到由（2）定义的任意高斯概率路径。事实上，我们在第 3.2 节进一步表明 PnP-DM 的先验步是我们先验步的特例。由定理 1 得到的洞见直接导出算法 1 第 4—7 行的时间步换算、缩放与反向 SDE 求解，我们将在消融研究中展示其有效性。

### 3.2 与现有 PnP 方法的关系

本文假设流先验，但把（4）中的 score—速度转换用于（3）的反向时间 SDE 还有另一种方式：把速度场 $v(\cdot;\cdot)$ 替换为 score 函数 $s(\cdot;\cdot)$，得到使用扩散模型的 FlowSGS 先验步。下面的定理表明，在特定扩散系数 $w_t$ 选择下，FlowSGS 基于扩散的先验步即为 PnP-DM [58] 的先验步。换言之，FlowSGS 提供了一个通用框架，可以纳入扩散先验或流先验，并任意选择使用 score 还是速度模型、插值过程与扩散系数；而 PnP-DM 是 FlowSGS 在特定设计选择下的特例。

**推论 1（PnP-DM 是 FlowSGS 的特例）.** 定义 $\lambda_t\triangleq-\gamma_t/\alpha_t=(\alpha_t\dot\sigma_t-\dot\alpha_t\sigma_t)/\alpha_t$。在采样阶段，FlowSGS 的时间步换算与反向时间 SDE（3）在特定条件下退化为 PnP-DM（见 [58] 的（7））：EDM 扩散系数 $\alpha_t=s_E(t)$、$\sigma_t=s_E(t)\sigma_E(t)$，score—速度转换，以及 KL-最优扩散系数 $w_t=2\lambda_t\sigma_t$。

推论 1 的证明见 A.3 节。事实上，这种联系并不意外，因为随机插值框架的数学表述也包含扩散模型。我们的贡献在于指明这一关系的精确形式。

FlowSGS 与 PnP-DM 的结构相似性使我们能把后者的收敛保证扩展到 SI 参数化下的 FlowSGS，总结为如下推论。

**推论 2（收敛性分析）.** 设插值调度 $(\alpha_t,\sigma_t)$ 使 $\sigma_t/\alpha_t$ 在 $(0,1]$ 上严格递增，且扩散系数 $w_t$ 在先验步所用区间上远离零。则在预训练流网络的 $L_2$ 精度条件下，取常数耦合 $\rho_k\equiv\rho$ 的算法 1 享有与 PnP-DM [58, 定理 3.1] 相同的非渐近收敛保证：由速度网络驱动的非平稳过程与由真实速度场驱动的平稳过程之间的平均 Fisher 信息，在 SGS 迭代次数 $K$ 上以 $O(1/K)$ 的速率衰减，直至由速度网络近似误差决定的下限。

推论 2 的详细证明见 A.4 节。与 PnP-DM 相比，假设变得更灵活：PnP-DM 的扩散系数下限继承自 EDM 前向过程（对 iDDPM/EDM 而言可能在端点处消失，因而需要 [58, 附录 A.3] 的变通）；而在 FlowSGS 中，扩散系数 $w_t$ 是采样时的自由选择，因此下限条件是对用户选择的约束而非对模型的约束。$\sigma_t/\alpha_t$ 的单调性条件是 PnP-DM 假设 A.1 的 SI 类比，我们考虑的所有标准调度都满足它。注意 KL-最优系数在原点处不正则（表 3）：对线性插值 $w_t^{\mathrm{KL}}=2t/(1-t)$，对 GVP 为 $w_t^{\mathrm{KL}}=\pi\tan(\pi t/2)$，二者在 $t\to0$ 时都趋于零。遵循基于扩散的采样器的标准做法 [67]，我们通过在 $t\in[\epsilon,1-\epsilon]$（$\epsilon=1\times10^{-5}$）截断插值、并在 $t=\epsilon$（而非 $t=0$）终止反向 SDE 来避开该不正则性，返回 $x^{k+1}=x_\epsilon$。因此先验步在 $[\epsilon,t_k]$ 上运行（$t_k=(\sigma_t/\alpha_t)^{-1}(\rho_k)$），且对表 3 中每个随机调度有 $\inf_{[\epsilon,t_k]}w_t=w_\epsilon>0$，故推论 2 以 $\delta^2=w_\epsilon$ 适用。处理该不正则性的另一种方案是加正则化 [40]，我们留作未来工作。最后，推论 2 是针对常数耦合 $\rho_k\equiv\rho$ 陈述的，而 FlowSGS 采用退火 $\rho_k=\max(\rho_0\alpha^k,\rho_{\min})$（表 4）。因此该保证描述的是退火调度在 $\rho_k$ 饱和于 $\rho_{\min}$ 之后所趋近的固定 $\rho$ 链。早期大 $\rho$ 迭代充当初始化启发式，我们发现它在实践中加速收敛，但分析未覆盖该阶段。

## 4 实验

### 4.1 基线

我们把本方法与三种基于扩散的采样器比较：DPS [14]、PnP-DM [58]、DAPS [62]；以及三种基于流的采样器：PnP-Flow [42]、FlowChef [45]、FlowDPS [34]。为公平比较，我们用相同的 NCSN++ [52] 架构预训练扩散/流模型（细节见 C.1 节）。所有基于流的方法默认使用线性插值调度 [38]。对每个任务，我们为所有方法调优超参数以获得最佳性能。

### 4.2 玩具问题

为验证 FlowSGS 能准确从贝叶斯后验采样，我们构造一个高斯似然与高斯先验的玩具压缩感知问题，使后验为解析可得的高斯分布。问题设置见 B.1 节。我们抽取 128 个后验样本，计算高斯后验的均值与逐像素标准差，并计算均值图像相对真值图像的 PSNR 与 SSIM、以及高斯后验相对真实后验的 KL 散度，结果见图 2。我们表明 FlowSGS 与 PnP-DM（二者都是采样方法）无论按均值图像质量还是 KL 散度都产生最准确的后验。注意 PnP-Flow 虽未声称是后验采样器 [42]，也产生了准确的后验。相反，DPS、FlowChef 与 FlowDPS 显著高估了不确定性。

### 4.3 线性逆问题

我们在多种线性逆问题（运动/高斯去模糊、超分辨率、压缩感知 MRI）上基准测试基线与 FlowSGS（使用不同插值调度），数据集为 FFHQ [32] 与缩放到 $256\times256$ 的 fastMRI 膝部数据集 [61]。问题设置见 B.2 节。我们在这些数据集上预训练扩散/流模型（checkpoint 可用）。表 1 与表 5 报告在未参与训练的 100 个测试样本上平均的指标。我们为每种方法抽取 8 个样本并报告均值图像；视觉样本见图 3。结果表明 FlowSGS 在多种逆问题上优于基线。在插值调度中，线性调度给出最佳总体结果，而 VP-SDE 结果最差。这与下述事实一致：流匹配所用的线性与 GVP 调度比扩散模型所用的 VP-SDE 具有更直的概率路径，因而采样更准确。更多结果见 D.1 节。

**使用潜空间模型。** 我们注意到，除了非线性逆问题之外，该方法的通用性还允许使用潜空间流先验，这里简要考察。图 10 给出运动去模糊与超分辨率问题上相对 PnP-Flow [42]、FlowChef [45] 与 FlowDPS [34] 的示例比较，使用现成的 Stable Diffusion 3.5 [19] medium 模型。实验细节见 B.3 节。由于在 Langevin 步中需要反复穿过解码器求梯度（见 C.2 节），我们的方法较慢。这提示未来可采用像素/潜空间混合的 Langevin 采样方案（先期在像素空间运行、后期迭代转入潜空间），[62] 也曾提到这一可能。

### 4.4 非线性 Fourier 相位恢复

Fourier 相位恢复（FPR）[23, 22, 49] 是一种不适定逆问题，广泛存在于真实成像系统（如显微 [65, 66]、干涉测量黑洞成像 [8, 53, 58, 21, 1]）中，由于 Fourier 相位信息丢失，后验可能是双峰的。在基于流的采样器中，我们首次给出非线性 FPR 上的基准（见表 1 与图 4），同样使用 FFHQ 数据集与第 4.3 节的预训练像素空间模型。由于 FPR 极度不适定且依赖良好初始化，我们仿照先例 [14, 58]，通过报告所抽 8 个后验样本中的单个最佳样本来刻画图像重建质量（视觉示例见图 9）。为量化不确定性，我们从每种方法抽取 512 个样本，并用以对各自模式的 PSNR 把样本分类到模式（对两个模式 PSNR 均小于 15 dB 的样本视为丢弃）。用最好的 25% 样本，我们在图 4a 中展示每个模式的均值图像，在图 4b 中展示红通道某像素的直方图。虽然多数方法都能重建双峰后验，我们指出本方法对两个模式都重建出最佳均值图像（见指标）。FlowSGS、PnP-DM 与 DAPS 是产生以真实像素值为中心（直方图中的竖直虚线）的清晰双峰分布的采样方法，而 DPS、FlowChef 与 FlowDPS 依赖引导或轨迹操纵而非直接后验采样，恢复出被破坏的旋转模式。这展示了有原则的后验采样相对近似方法在捕获多峰后验上的显著优势。

### 4.5 消融研究

我们对基于流的先验步中的关键设计选择（算法 1 第 4—7 行）以及插值调度 $(\alpha_t,\sigma_t)$ 与扩散系数 $w_t$ 做消融研究。

**时间步换算、缩放与时间步校正。** 图 5a 展示了我们为减小先验步 SDE 求解器（算法 1 第 6 行）离散化误差而设计的鲁棒时间步校正策略。具体地，不同于 PnP-DM [58] 从最接近 $t_k$ 的离散时间步出发，我们在第一个 Euler 步使用自适应步长并从正确的时间 $t_k$ 出发。图 5b 与表 7 给出在算法 1 中逐一缺失各组件时 FlowSGS 在运动去模糊上的结果：正确的时间步换算（第 4 行）、缩放（第 5 行）、时间步校正（第 6 行），并验证它们共同构成本方法的贡献。在图 5c 中我们观察到，随着离散化步数减少，PnP-DM（蓝色）受离散化误差影响显著，而我们的时间步校正使 FlowSGS（紫色）保持更稳定的性能。这与"线性插值具有更直的概率路径、对离散化误差比扩散模型更鲁棒"的理论一致 [36, 38, 40]。视觉样本见图 11。因此我们在先验步中使用 32 步离散化（星号标记），而 PnP-DM 需要 100 步。

**插值调度与扩散系数。** 表 8 比较了使用三种调度（VP-SDE、线性、GVP）与四种扩散系数（汇总见 A.1 节）时 FlowSGS 在运动去模糊与 Fourier 相位恢复上的结果。我们发现线性插值结合 KL-最优扩散系数 $w^{\mathrm{KL}}$ 给出最佳结果。这与 $w^{\mathrm{KL}}$ 最小化真实与学习数据分布之间 KL 散度上界的事实一致 [40, 2]，因而采样更准确。尽管 $w^{\mathrm{KL}}$ 在经验上成功，值得说明的是它在 $t=0$ 与 $t=1$ 处不正则 [40]，因此实践中我们在 $[\epsilon,1-\epsilon]$（$\epsilon=1\times10^{-5}$）内求解 SDE。

## 5 结论

我们提出了对 SGS 的修改，使其适基于 SI 的生成模型，并包括潜在的未来方案。由此，我们通过更好地集成测量似然、以及比同类扩散方法更高效地采样先验步，改进了现有基于流的方法。我们从理论（推论 1 与 2 中把 FlowSGS 与 PnP-DM 比较）与经验结果两方面刻画了与先前方法的关系。尽管达到 SOTA 性能，我们注意到当前局限：相比其他流方法采样成本偏高，但可用一步流模型（如 Mean Flow [25] 与 Meta Flow Maps [48]）改进。我们目前只考虑非盲逆问题，可通过把基于流的先验步纳入 EM 框架（如 PRISM [28]）扩展到半盲或盲设定。最后，Langevin 动力学在潜空间模型上效率不高，这提示混合采样的潜力。

## 致谢与资助声明

我们感谢 NSF-Simons 天空人工智能研究所（SkAI）通过 grants NSF AST-2421845 与 Simons Foundation MPS-AI-00010513 的支持。本材料部分基于美国国家科学基金会 Award No. 2542022 支持的工作。作者感谢 Yu Sun、Deliang Wei、Rebecca Willett 与 Tjitske Starkenburg 的有益讨论。

## 图注与表注

### 表 1：在 100 个测试图像上平均的定量结果（原 PDF 第 8 页）

对每种方法抽取 8 个后验样本，线性逆问题报告均值图像；对相位恢复使用 8 个后验样本中的最佳者。误差与运行时间见表 5 与表 6。

| 方法 | 运动去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | 超分辨率(4×) PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|
| DPS [14] | 28.14 | 0.803 | 0.198 | 29.55 | 0.829 | 0.167 | 28.97 | 0.822 | 0.155 |
| PnP-DM [58] | 28.53 | 0.819 | 0.220 | 29.44 | 0.836 | 0.197 | 28.71 | 0.823 | 0.179 |
| DAPS [62] | 28.00 | 0.801 | 0.230 | 29.48 | 0.829 | 0.199 | 28.99 | 0.824 | 0.172 |
| PnP-Flow [42] | 27.15 | 0.787 | 0.254 | 29.42 | 0.832 | 0.208 | 26.35 | 0.776 | 0.221 |
| FlowChef [45] | 25.26 | 0.587 | 0.388 | 28.66 | 0.800 | 0.209 | 27.14 | 0.711 | 0.234 |
| FlowDPS [34] | 28.42 | 0.816 | 0.229 | 29.78 | 0.840 | 0.202 | 28.62 | 0.819 | 0.192 |
| FlowSGS (VP) | 27.69 | 0.709 | 0.209 | 28.65 | 0.723 | 0.190 | 27.35 | 0.708 | 0.206 |
| FlowSGS (GVP) | 29.16 | 0.825 | 0.162 | 29.97 | 0.837 | 0.147 | 29.02 | 0.824 | 0.160 |
| **FlowSGS (Linear)** | **29.22** | **0.836** | **0.154** | **30.09** | **0.847** | **0.141** | **29.49** | **0.844** | **0.149** |

| 方法 | CS-MRI(笛卡尔,8×) PSNR↑ | SSIM↑ | Data-fit↓ | CS-MRI(径向,8×) PSNR↑ | SSIM↑ | Data-fit↓ | Fourier 相位恢复 PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|
| DPS [14] | 31.93 | 0.819 | 48.189 | 34.57 | 0.858 | 50.347 | 18.17 | 0.513 | 0.413 |
| PnP-DM [58] | 32.27 | 0.824 | 56.407 | 33.36 | 0.837 | 58.001 | 35.48 | 0.931 | 0.084 |
| DAPS [62] | 31.49 | 0.815 | 54.992 | 33.28 | 0.838 | 55.169 | 35.77 | 0.926 | 0.054 |
| PnP-Flow [42] | 32.22 | 0.837 | 50.053 | 34.60 | 0.864 | 49.892 | 30.76 | 0.844 | 0.128 |
| FlowChef [45] | 30.76 | 0.766 | 47.317 | 33.32 | 0.817 | 48.894 | 20.80 | 0.501 | 0.380 |
| FlowDPS [34] | 30.73 | 0.811 | 56.048 | 34.05 | 0.854 | 54.165 | 27.99 | 0.818 | 0.187 |
| FlowSGS (VP) | 30.36 | 0.690 | 60.096 | 34.65 | 0.861 | 49.437 | 31.09 | 0.850 | 0.132 |
| FlowSGS (GVP) | 32.58 | 0.825 | 54.592 | **34.92** | **0.870** | 50.577 | **38.45** | **0.950** | 0.056 |
| **FlowSGS (Linear)** | **32.84** | **0.839** | 53.764 | 34.77 | 0.869 | 50.420 | 37.52 | 0.940 | 0.076 |

### 表 2：插值调度、score—速度转换（4）与时间反演的汇总（原 PDF 第 14 页）

| 性质 | VP-SDE | 线性（Linear） | GVP |
|---|---|---|---|
| 信号尺度 $\alpha_t$ | $e^{-\frac{1}{2}\int_0^t\beta_sds}$ | $1-t$ | $\cos\left(\frac{\pi}{2}t\right)$ |
| 噪声尺度 $\sigma_t$ | $\sqrt{1-\alpha_t^2}$ | $t$ | $\sin\left(\frac{\pi}{2}t\right)$ |
| 由速度求 score | $s=-\frac{2}{\beta_t}v-x_t$ | $s=-\frac{(1-t)v+x_t}{t}$ | $s=-\frac{2}{\pi}\cot\left(\frac{\pi t}{2}\right)v-x_t$ |
| 时间反演 | $t=B^{-1}\left(\log(1+\rho^2)\right)^{\ast}$ | $t=\frac{\rho}{1+\rho}$ | $t=\frac{2}{\pi}\arctan(\rho)$ |
| 代表模型 | DDPM [27]、Score-SDE [52] | Flow Matching [37]、Rectified Flow [38] | SiT [40] |

$^{\ast}$ 对 VP-SDE，$\beta_t>0$ 为保方差噪声率调度，$B(t)=\int_0^t\beta_sds$ 为其累积噪声水平，故 $B(t)=\log(1+\rho^2)$。

### 表 3：反向时间 SDE 的扩散系数 $w_t$（均在训练后选定，不影响 $v_\theta$；原 PDF 第 14 页）

"正则"指在端点处有限且非负。

| 性质 | ODE | Sigma | Sine | KL-最优 |
|---|---|---|---|---|
| 表达式 | $0$ | $\sigma_t$ | $\sin^2(\pi t)$ | $2\left(\dot\sigma_t\sigma_t-\dot\alpha_t\frac{\sigma_t^2}{\alpha_t}\right)$ |
| 在 $t=0$ 正则 | ✓ | ✓ | ✓ | ✕ |
| 在 $t=1$ 正则 | ✓ | ✓ | ✓ | ✕ |

### 表 4：不同任务的退火调度超参数（原 PDF 第 19 页）

| 逆问题 | 起始水平 $\rho_0$ | 最小水平 $\rho_{\min}$ | 衰减率 $\alpha$ |
|---|---|---|---|
| 玩具问题 | 10 | 0.1 | 0.9 |
| 运动去模糊 | 10 | 0.1 | 0.9 |
| 高斯去模糊 | 10 | 0.1 | 0.9 |
| 超分辨率（4×） | 10 | 0.1 | 0.9 |
| CS-MRI（笛卡尔，8×） | 10 | 0.1 | 0.9 |
| CS-MRI（径向，8×） | 10 | 0.02 | 0.9 |
| Fourier 相位恢复 | 10 | 0.01 | 0.9 |

### 表 5：带误差的定量结果（100 个测试图像平均；原 PDF 第 22 页）

对 100 个测试图像中的每一个，先对 8 个样本取均值再对均值重建打分；报告均值图像分数的均值 ± 标准差。对 Fourier 相位恢复，在每批 8 个样本的最佳者上计算。

| 方法 | 运动去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | 高斯去模糊 PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|
| DPS [14] | 28.14±0.31 | 0.803±0.007 | 0.198±0.005 | 29.55±0.23 | 0.829±0.005 | 0.167±0.004 |
| PnP-DM [58] | 28.53±0.30 | 0.819±0.007 | 0.220±0.006 | 29.44±0.22 | 0.836±0.005 | 0.197±0.004 |
| DAPS [62] | 28.00±0.31 | 0.801±0.007 | 0.230±0.006 | 29.48±0.23 | 0.829±0.005 | 0.199±0.004 |
| PnP-Flow [42] | 27.15±0.34 | 0.787±0.007 | 0.254±0.005 | 29.42±0.23 | 0.832±0.005 | 0.208±0.004 |
| FlowChef [45] | 25.26±0.16 | 0.587±0.005 | 0.388±0.004 | 28.66±0.21 | 0.800±0.005 | 0.209±0.003 |
| FlowDPS [34] | 28.42±0.32 | 0.816±0.007 | 0.229±0.006 | 29.78±0.22 | 0.840±0.005 | 0.202±0.004 |
| FlowSGS (VP) | 27.69±0.23 | 0.709±0.005 | 0.209±0.006 | 28.65±0.17 | 0.723±0.003 | 0.190±0.005 |
| FlowSGS (GVP) | 29.16±0.29 | 0.825±0.006 | 0.162±0.005 | 29.97±0.22 | 0.837±0.005 | 0.147±0.004 |
| **FlowSGS (Linear)** | **29.22±0.31** | **0.836±0.006** | **0.154±0.005** | **30.09±0.22** | **0.847±0.005** | **0.141±0.004** |

| 方法 | CS-MRI(笛卡尔,8×) PSNR↑ | SSIM↑ | Data-fit↓ | CS-MRI(径向,8×) PSNR↑ | SSIM↑ | Data-fit↓ |
|---|---|---|---|---|---|---|
| DPS [14] | 31.93±0.29 | 0.819±0.007 | 48.189±0.041 | 34.57±0.21 | 0.858±0.006 | 50.347±0.035 |
| PnP-DM [58] | 32.27±0.19 | 0.824±0.008 | 56.407±0.171 | 33.36±0.19 | 0.837±0.007 | 58.001±0.215 |
| DAPS [62] | 31.49±0.18 | 0.815±0.007 | 54.992±0.134 | 33.28±0.19 | 0.838±0.007 | 55.169±0.142 |
| PnP-Flow [42] | 32.22±0.19 | 0.837±0.006 | 50.053±0.047 | 34.60±0.21 | 0.864±0.006 | 49.892±0.038 |
| FlowChef [45] | 30.76±0.17 | 0.766±0.005 | 47.317±0.019 | 33.32±0.19 | 0.817±0.006 | 48.894±0.018 |
| FlowDPS [34] | 30.73±0.22 | 0.811±0.007 | 56.048±0.220 | 34.05±0.20 | 0.854±0.007 | 54.165±0.073 |
| FlowSGS (VP) | 30.36±0.13 | 0.690±0.006 | 60.096±0.152 | 34.65±0.21 | 0.861±0.006 | 49.437±0.022 |
| FlowSGS (GVP) | 32.58±0.19 | 0.825±0.007 | 54.592±0.102 | **34.92±0.22** | **0.870±0.007** | 50.577±0.028 |
| **FlowSGS (Linear)** | **32.84±0.20** | **0.839±0.007** | 53.764±0.063 | 34.77±0.22 | 0.869±0.007 | 50.420±0.030 |

| 方法 | 超分辨率(4×) PSNR↑ | SSIM↑ | LPIPS↓ | Fourier 相位恢复 PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|
| DPS [14] | 28.97±0.21 | 0.822±0.005 | 0.155±0.004 | 18.17±0.79 | 0.513±0.023 | 0.413±0.022 |
| PnP-DM [58] | 28.71±0.19 | 0.823±0.005 | 0.179±0.004 | 35.48±0.92 | 0.931±0.010 | 0.084±0.014 |
| DAPS [62] | 28.99±0.19 | 0.824±0.005 | 0.172±0.004 | 35.77±0.16 | 0.926±0.001 | 0.054±0.003 |
| PnP-Flow [42] | 26.35±0.19 | 0.776±0.007 | 0.221±0.005 | 30.76±0.71 | 0.844±0.017 | 0.128±0.012 |
| FlowChef [45] | 27.14±0.13 | 0.711±0.003 | 0.234±0.005 | 20.80±0.47 | 0.501±0.018 | 0.380±0.013 |
| FlowDPS [34] | 28.62±0.19 | 0.819±0.005 | 0.192±0.004 | 27.99±0.63 | 0.818±0.013 | 0.187±0.012 |
| FlowSGS (VP) | 27.35±0.13 | 0.708±0.004 | 0.206±0.005 | 31.09±0.83 | 0.850±0.014 | 0.132±0.015 |
| FlowSGS (GVP) | 29.02±0.18 | 0.824±0.005 | 0.160±0.004 | **38.45±0.91** | **0.950±0.011** | 0.056±0.012 |
| **FlowSGS (Linear)** | **29.49±0.19** | **0.844±0.004** | **0.149±0.004** | 37.52±1.05 | 0.940±0.012 | 0.076±0.014 |

### 表 6：并行抽取 8 个后验样本的平均采样运行时间（原 PDF 第 22 页）

全部计时在单块 NVIDIA H100 GPU 上完成。

| 方法 | 运行时间 (s) |
|---|---|
| DPS [14] | 103.1±0.001 |
| PnP-DM [58] | 139.5±0.006 |
| DAPS [62] | 63.9±0.011 |
| PnP-Flow [42] | 5.5±0.001 |
| FlowChef [45] | 5.5±0.001 |
| FlowDPS [34] | 5.5±0.000 |
| FlowSGS (Linear) | 52.9±0.003 |
| FlowSGS (GVP) | 49.5±0.001 |
| FlowSGS (VP-SDE) | 31.2±0.000 |

### 表 7：FlowSGS 先验步关键组件的消融（运动去模糊；线性插值调度、先验步 SDE 16 个离散化步；原 PDF 第 23 页）

| 方法 | 运动去模糊 PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|
| FlowSGS（错误换算） | 23.69±0.28 | 0.491±0.014 | 0.311±0.022 |
| FlowSGS（无缩放） | 7.04±0.18 | 0.129±0.017 | 0.694±0.018 |
| FlowSGS（无时间步校正） | 24.57±0.84 | 0.741±0.023 | 0.219±0.026 |
| **FlowSGS（完整）** | **27.13±0.64** | **0.771±0.016** | **0.190±0.018** |

### 表 8：插值调度 $(\alpha_t,\sigma_t)$ 与扩散系数 $w_t$ 的消融结果（100 个测试图像平均，带误差；原 PDF 第 24 页）

对运动去模糊取 8 个样本的均值重建打分；对 Fourier 相位恢复在每批 8 个样本的最佳者上计算。

| 插值调度 | 扩散系数 | 运动去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | Fourier 相位恢复 PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|
| VP-SDE | $w_t=0$（ODE） | 23.27±0.39 | 0.692±0.012 | 0.305±0.015 | 13.57±0.21 | 0.474±0.017 | 0.655±0.008 |
| VP-SDE | $w_t=\sigma_t$ | 28.71±0.30 | 0.824±0.006 | 0.161±0.005 | 17.17±0.59 | 0.640±0.016 | 0.508±0.018 |
| VP-SDE | $w_t=\sin^2(\pi t)$ | 28.35±0.30 | 0.819±0.006 | 0.168±0.007 | 16.55±0.66 | 0.621±0.017 | 0.554±0.016 |
| VP-SDE | $w_t=w_t^{\mathrm{KL}}$ | 27.69±0.23 | 0.709±0.005 | 0.209±0.006 | 31.09±0.83 | 0.850±0.014 | 0.132±0.015 |
| 线性 | $w_t=0$（ODE） | 25.89±0.20 | 0.719±0.006 | 0.250±0.006 | 14.47±0.22 | 0.416±0.014 | 0.653±0.007 |
| 线性 | $w_t=\sigma_t$ | 28.28±0.27 | 0.822±0.006 | 0.163±0.005 | 16.88±0.60 | 0.650±0.020 | 0.501±0.017 |
| 线性 | $w_t=\sin^2(\pi t)$ | 28.73±0.29 | 0.830±0.006 | 0.158±0.005 | 15.63±0.40 | 0.614±0.020 | 0.560±0.011 |
| **线性** | $w_t=w_t^{\mathrm{KL}}$ | **29.22±0.31** | **0.836±0.006** | **0.154±0.005** | **37.52±1.05** | **0.940±0.012** | **0.076±0.014** |
| GVP | $w_t=0$（ODE） | 25.43±0.31 | 0.714±0.008 | 0.273±0.009 | 14.30±0.21 | 0.437±0.014 | 0.655±0.007 |
| GVP | $w_t=\sigma_t$ | 28.16±0.31 | 0.819±0.006 | 0.180±0.007 | 15.45±0.28 | 0.603±0.018 | 0.559±0.011 |
| GVP | $w_t=\sin^2(\pi t)$ | 27.81±0.29 | 0.811±0.006 | 0.195±0.008 | 14.75±0.25 | 0.567±0.017 | 0.601±0.009 |
| GVP | $w_t=w_t^{\mathrm{KL}}$ | 29.16±0.29 | 0.825±0.006 | 0.162±0.005 | 38.45±0.91 | 0.950±0.011 | 0.056±0.012 |

### 表 9：运动去模糊上的超参数敏感性（20 个测试图像平均；原 PDF 第 25 页）

† 标记主实验所用默认值。对先验步离散化步数的敏感性见图 5c。

| 参数 | 取值与 LPIPS↓ |
|---|---|
| 最小水平 $\rho_{\min}$ | 0.02: 0.219；0.05: 0.206；**0.1†: 0.188**；0.2: 0.193；0.5: 0.232；1.0: 0.259 |
| 起始水平 $\rho_0$ | 2.0: 0.186；5.0: 0.188；**10.0†: 0.188**；20.0: 0.190；50.0: 0.193 |
| 衰减率 $\alpha$ | 0.80: 0.192；0.85: 0.192；**0.90†: 0.188**；0.93: 0.190；0.95: 0.193 |
| 噪声水平 $\tau$ | 0.01: 0.573；0.02: 0.357；**0.05†: 0.188**；0.1: 0.248；0.2: 0.335 |
| Langevin 步长 $\eta$ | 1e-4: 0.237；2e-4: 0.209；**5e-4†: 0.188**；1e-3: 0.175；2e-3: 0.169；5e-3: 0.158 |

### 图注

**图 1（原 PDF 第 2 页）：** FlowSGS 的高层概览——一个以流匹配为即插即用先验的有原则后验采样器。该方法在似然步与先验步之间迭代：前者使用 Langevin 动力学，后者用预训练流先验求解反向时间 SDE（左）。右图展示 FlowSGS 在运动去模糊上的采样轨迹。

**图 2（原 PDF 第 6 页）：** 具有解析高斯后验的玩具压缩感知问题结果。第 1 行为均值图像，第 2 行为逐像素标准差。相比真实后验，本方法估计出准确后验，同时具有最佳均值图像质量与最低 KL 散度。

**图 3（原 PDF 第 7 页）：** 线性逆问题上的视觉结果。对每种方法抽取 8 个后验样本并报告均值图像。

**图 4（原 PDF 第 8 页）：** 非线性 Fourier 相位恢复的双峰后验。对每种方法抽取 512 个样本并分类到两个模式，用每个模式的前 25% 图像计算均值图像，并展示红通道某像素（红点标记）的直方图。

**图 5（原 PDF 第 9 页）：** 先验步中的时间步换算。(a) FlowSGS 用于减小离散化误差的鲁棒时间步校正示意；(b) 运动去模糊上 FlowSGS 消融的视觉样本；(c) 运动去模糊上不同离散化步数下 FlowSGS（含/不含时间步校正）与 PnP-DM 的比较。

**图 6（原 PDF 第 17 页）：** 玩具压缩感知问题的设置。

**图 7（原 PDF 第 20 页）：** 运动去模糊、高斯去模糊与 4× 超分辨率上的额外视觉样本。对每种方法抽取 8 个后验样本并展示均值图像。

**图 8（原 PDF 第 21 页）：** 压缩感知 MRI 上的额外视觉样本。对每种方法抽取 8 个后验样本并展示均值图像。

**图 9（原 PDF 第 21 页）：** Fourier 相位恢复上的额外视觉样本。对每种方法抽取 8 个后验样本并报告其中最佳者。

**图 10（原 PDF 第 23 页）：** 使用潜空间流模型（Stable Diffusion 3.5）的视觉结果。展示各方法在运动去模糊与 8× 超分辨率上各生成的一个样本。

**图 11（原 PDF 第 24 页）：** 运动去模糊上 SDE 离散化步数消融的视觉样本。对每种方法抽取 8 个后验样本并展示均值图像。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] Kazunori Akiyama, Antxon Alberdi, Walter Alef, Keiichi Asada, Rebecca Azulay, Anne-Kathrin Baczko, David Ball, Mislav Baloković, John Barrett, Dan Bintley, et al. First m87 event horizon telescope results. iv. imaging the central supermassive black hole. The Astrophysical Journal Letters, 875(1):L4, 2019.

[2] Michael Albergo, Nicholas M Boffi, and Eric Vanden-Eijnden. Stochastic interpolants: A unifying framework for flows and diffusions. Journal of Machine Learning Research, 26(209):1–80, 2025.

[3] Michael Samuel Albergo and Eric Vanden-Eijnden. Building normalizing flows with stochastic interpolants. In The Eleventh International Conference on Learning Representations, 2023.

[4] Brian DO Anderson. Reverse-time diffusion equation models. Stochastic Processes and their Applications, 12(3):313–326, 1982.

[5] Hossein Askari, Yadan Luo, Hongfu Sun, and Fred Roosta. Latent refinement via flow matching for training-free linear inverse problem solving. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[6] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-flow: Differentiating through flows for controlled generation. In International Conference on Machine Learning, pages 3462–3483. PMLR, 2024.

[7] Charles A Bouman and Gregery T Buzzard. Generative plug and play: Posterior sampling for inverse problems. In 2023 59th annual Allerton conference on communication, control, and computing (Allerton), pages 1–7. IEEE, 2023.

[8] Katherine L Bouman, Michael D Johnson, Daniel Zoran, Vincent L Fish, Sheperd S Doeleman, and William T Freeman. Computational imaging for vlbi image reconstruction. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, pages 913–922, 2016.

[9] Stephen Boyd and Lieven Vandenberghe. Convex optimization. Cambridge university press, 2004.

[10] Stanley H Chan, Xiran Wang, and Omar A Elgendy. Plug-and-play admm for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging, 3(1):84–98, 2016.

[11] Pierre Charbonnier, Laure Blanc-Feraud, Gilles Aubert, and Michel Barlaud. Two deterministic half-quadratic regularization algorithms for computed imaging. In Proceedings of 1st international conference on image processing, volume 2, pages 168–172. IEEE, 1994.

[12] Yunjey Choi, Youngjung Uh, Jaejun Yoo, and Jung-Woo Ha. Stargan v2: Diverse image synthesis for multiple domains. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 8188–8197, 2020.

[13] Wenda Chu, Zihui Wu, Yifan Chen, Yang Song, and Yisong Yue. Split gibbs discrete diffusion posterior sampling. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[14] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.

[15] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. Advances in Neural Information Processing Systems, 35:25683–25696, 2022.

[16] Hyungjin Chung and Jong Chul Ye. Score-based diffusion models for accelerated mri. Medical image analysis, 80:102479, 2022.

[17] Florentin Coeurdoux, Nicolas Dobigeon, and Pierre Chainais. Plug-and-play split gibbs sampler: embedding deep generative priors in bayesian inference. IEEE Transactions on Image Processing, 33:3496–3507, 2024.

[18] Julius Erbach, Dominik Narnhofer, Andreas Robert Dombos, Bernt Schiele, Jan Eric Lenssen, and Konrad Schindler. Solving inverse problems with FLAIR. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[19] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, et al. Scaling rectified flow transformers for high-resolution image synthesis. In Forty-first international conference on machine learning, 2024.

[20] Elhadji C Faye, Mame Diarra Fall, and Nicolas Dobigeon. Regularization by denoising: Bayesian model and langevin-within-split gibbs sampling. IEEE Transactions on Image Processing, 34:221–234, 2024.

[21] Berthy T Feng, Katherine L Bouman, and William T Freeman. Event-horizon-scale imaging of m87* under different assumptions via deep generative image priors. The Astrophysical Journal, 975(2):201, 2024.

[22] James Fienup. Understanding the twin-image problem in phase retrieval. Journal of the Optical Society of America A, 2012.

[23] James R Fienup and CC Wackerman. Phase-retrieval stagnation problems and solutions. Journal of the Optical Society of America A, 3(11):1897–1907, 1986.

[24] Donald Geman and Chengda Yang. Nonlinear image recovery with half-quadratic regularization. IEEE transactions on Image Processing, 4(7):932–946, 1995.

[25] Zhengyang Geng, Mingyang Deng, Xingjian Bai, J Zico Kolter, and Kaiming He. Mean flows for one-step generative modeling. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[26] Alexandros Graikos, Nikolay Malkin, Nebojsa Jojic, and Dimitris Samaras. Diffusion models as plug-and-play priors. Advances in Neural Information Processing Systems, 35:14715–14728, 2022.

[27] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[28] Yuanyun Hu, Evan Bell, Guijin Wang, and Yu Sun. Prism: Probabilistic and robust inverse solver with measurement-conditioned diffusion prior for blind inverse problems. In ICASSP 2026-2026 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 11432–11436. IEEE, 2026.

[29] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G Dimakis, and Jon Tamir. Robust compressed sensing mri with deep generative priors. Advances in Neural Information Processing Systems, 34:14938–14954, 2021.

[30] Ulugbek S Kamilov, Charles A Bouman, Gregery T Buzzard, and Brendt Wohlberg. Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications. IEEE Signal Processing Magazine, 40(1):85–97, 2023.

[31] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. Advances in neural information processing systems, 35:26565–26577, 2022.

[32] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 4401–4410, 2019.

[33] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.

[34] Jeongsol Kim, Bryan Sangwoo Kim, and Jong Chul Ye. Flowdps: Flow-driven posterior sampling for inverse problems. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 12328–12337, 2025.

[35] Peter E Kloeden and RA Pearson. The numerical solution of stochastic differential equations. The ANZIAM Journal, 20(1):8–12, 1977.

[36] Sangyun Lee, Beomsu Kim, and Jong Chul Ye. Minimizing trajectory curvature of ode-based generative models. In International Conference on Machine Learning, pages 18957–18973. PMLR, 2023.

[37] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations, 2023.

[38] Xingchao Liu, Chengyue Gong, and qiang liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In The Eleventh International Conference on Learning Representations, 2023.

[39] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In Proceedings of International Conference on Computer Vision (ICCV), December 2015.

[40] Nanye Ma, Mark Goldstein, Michael S Albergo, Nicholas M Boffi, Eric Vanden-Eijnden, and Saining Xie. Sit: Exploring flow and diffusion-based generative models with scalable interpolant transformers. In European Conference on Computer Vision, pages 23–40. Springer, 2024.

[41] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In The Twelfth International Conference on Learning Representations, 2024.

[42] Ségolène Tiffany Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. Pnp-flow: Plug-and-play image restoration with flow matching. In The Thirteenth International Conference on Learning Representations, 2025.

[43] Vishal Monga, Yuelong Li, and Yonina C Eldar. Algorithm unrolling: Interpretable, efficient deep learning for signal and image processing. IEEE Signal Processing Magazine, 38(2):18–44, 2021.

[44] Parikh Neal, Chu Eric, Peleato Borja, and Eckstein Jonathan. Distributed optimization and statistical learning via the alternating direction method of multipliers. Foundations and Trends® in Machine learning, 3(1):1–122, 2011.

[45] Maitreya Patel, Song Wen, Dimitris N Metaxas, and Yezhou Yang. Flowchef: Steering of rectified flow models for controlled generations. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 15308–15318, 2025.

[46] Marcelo Pereyra, Luis A Vargas-Mieles, and Konstantinos C Zygalakis. The split gibbs sampler revisited: improvements to its algorithmic structure and augmented target distribution. SIAM Journal on Imaging Sciences, 16(4):2040–2071, 2023.

[47] Ashwini Pokle, Matthew J. Muckley, Ricky T. Q. Chen, and Brian Karrer. Training-free linear image inverses via flows. Transactions on Machine Learning Research, 2024.

[48] Peter Potaptchik, Adhi Saravanan, Abbas Mammadov, Alvaro Prat, Michael Samuel Albergo, and Yee Whye Teh. Meta flow maps enable scalable reward alignment. In Forty-third International Conference on Machine Learning, 2026.

[49] Yoav Shechtman, Yonina C Eldar, Oren Cohen, Henry Nicholas Chapman, Jianwei Miao, and Mordechai Segev. Phase retrieval with application to optical imaging: a contemporary overview. IEEE signal processing magazine, 32(3):87–109, 2015.

[50] Yang Song and Stefano Ermon. Generative modeling by estimating gradients of the data distribution. Advances in neural information processing systems, 32, 2019.

[51] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations, 2022.

[52] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[53] He Sun and Katherine L Bouman. Deep probabilistic imaging: Uncertainty quantification and multi-modal solution characterization for computational imaging. In Proceedings of the AAAI conference on artificial intelligence, volume 35, pages 2628–2637, 2021.

[54] George E Uhlenbeck and Leonard S Ornstein. On the theory of the brownian motion. Physical review, 36(5):823, 1930.

[55] Santosh Vempala and Andre Wibisono. Rapid convergence of the unadjusted langevin algorithm: Isoperimetry suffices. Advances in neural information processing systems, 32, 2019.

[56] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE global conference on signal and information processing, pages 945–948. IEEE, 2013.

[57] Maxime Vono, Nicolas Dobigeon, and Pierre Chainais. Split-and-augmented gibbs sampler—application to large-scale inference problems. IEEE Transactions on Signal Processing, 67(6):1648–1661, 2019.

[58] Zihui Wu, Yu Sun, Yifan Chen, Bingliang Zhang, Yisong Yue, and Katherine L Bouman. Principled probabilistic imaging using diffusion models as plug-and-play priors. Advances in Neural Information Processing Systems, 37:118389–118427, 2024.

[59] Xingyu Xu and Yuejie Chi. Provably robust score-based diffusion posterior sampling for plug-and-play image reconstruction. Advances in Neural Information Processing Systems, 37:36148–36184, 2024.

[60] Yici Yan, Yichi Zhang, Xiangming Meng, and Zhizhen Zhao. FIG: Flow with interpolant guidance for linear inverse problems. In The Thirteenth International Conference on Learning Representations, 2025.

[61] Jure Zbontar, Florian Knoll, Anuroop Sriram, Tullie Murrell, Zhengnan Huang, Matthew J Muckley, Aaron Defazio, Ruben Stern, Patricia Johnson, Mary Bruno, et al. fastmri: An open dataset and benchmarks for accelerated mri. arXiv preprint arXiv:1811.08839, 2018.

[62] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 20895–20905, 2025.

[63] Kai Zhang, Yawei Li, Wangmeng Zuo, Lei Zhang, Luc Van Gool, and Radu Timofte. Plug-and-play image restoration with deep denoiser prior. IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(10):6360–6376, 2021.

[64] Yasi Zhang, Peiyu Yu, Yaxuan Zhu, Yingshan Chang, Feng Gao, Ying N Wu, and Oscar Leong. Flow priors for linear inverse problems via iterative corrupted trajectory matching. Advances in Neural Information Processing Systems, 37:57389–57417, 2024.

[65] Guoan Zheng, Roarke Horstmeyer, and Changhuei Yang. Wide-field, high-resolution fourier ptychographic microscopy. Nature photonics, 7(9):739–745, 2013.

[66] Guoan Zheng, Cheng Shen, Shaowei Jiang, Pengming Song, and Changhuei Yang. Concept, implementations and applications of fourier ptychography. Nature Reviews Physics, 3(3):207–223, 2021.

[67] Hongkai Zheng, Wenda Chu, Bingliang Zhang, Zihui Wu, Austin Wang, Berthy Feng, Caifeng Zou, Yu Sun, Nikola Kovachki, Zachary Ross, et al. Inversebench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In International Conference on Learning Representations, volume 2025, pages 90912–90940, 2025.

[68] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 1219–1229, 2023.

## 附录 A：理论（原 PDF 第 14—17 页）

### A.1 插值调度与扩散系数

表 2 汇总了我们与 FlowSGS 一起实验的三种常见插值调度，及其 score—速度转换（4）函数与时间反演函数。表 3 汇总扩散系数 $w_t$ 的常见选择。注意对 Linear 与 GVP 插值，$w_t^{\mathrm{KL}}$ 在 $t=1$ 处不正则，因为 $\alpha_t\to0$；细节见 [40]。

### A.2 定理 1 的证明

SGS 先验步的目标为

$$
\pi(x_0\mid z)\propto\exp[-g(x_0)]\exp\left(-\frac{\|x_0-z\|^2}{2\rho_k^2}\right),\tag{9}
$$

它具有贝叶斯去噪后验的形式：先验 $p(x_0)\propto\exp[-g(x_0)]$、高斯似然 $\pi(z\mid x_0)=\mathcal N(z;x_0,\rho_k^2I)$。这意味着 $z\mid x_0\sim\mathcal N(z;x_0,\rho_k^2I)$。

设 $t^\ast$ 满足 $\sigma_{t^\ast}/\alpha_{t^\ast}=\rho_k$ 且 $\alpha_{t^\ast}>0$。从 $t^\ast$ 到 $0$ 求解（3）的反向时间 SDE 服从条件概率

$$
\begin{aligned}
\pi(x_0\mid x_{t^\ast})&\propto\pi(x_{t^\ast}\mid x_0)p(x_0)=\mathcal N(x_{t^\ast};\alpha_{t^\ast}x_0,\sigma_{t^\ast}^2I)p(x_0)\\
&\propto\exp\left(-\frac{\|x_{t^\ast}-\alpha_{t^\ast}x_0\|^2}{2\sigma_{t^\ast}^2}\right)\exp[-g(x_0)]\\
&=\exp\left(-\frac{\|x_{t^\ast}/\alpha_{t^\ast}-x_0\|^2}{2(\sigma_{t^\ast}/\alpha_{t^\ast})^2}\right)\exp[-g(x_0)]\\
&=\exp\left(-\frac{\|x_{t^\ast}/\alpha_{t^\ast}-x_0\|^2}{2\rho_k^2}\right)\exp[-g(x_0)],
\end{aligned}\tag{10}
$$

其中第一行用贝叶斯公式，第三行用（2）中高斯概率路径的定义。（10）表明当 $x_{t^\ast}=\alpha_{t^\ast}z$ 时，条件概率 $\pi(x_0\mid x_{t^\ast})$ 等于先验步 $\pi(x_0\mid z)$。因此，以 $t^\ast$ 为起点、$x_{t^\ast}=\alpha_{t^\ast}z$ 初始化运行 SI 的反向时间 SDE，在 $x_0$ 处得到的分布正是 SGS 先验步 $\pi(x_0\mid z)$ 的分布。这为算法 1 第 4—7 行的先验步提供了基础：时间换算（第 4 行）遵循

$$
t^\ast(\rho)=\left(\frac{\sigma_{t^\ast}}{\alpha_{t^\ast}}\right)^{-1}(\rho),\tag{11}
$$

对似然步输出 $z$ 的缩放（第 5 行）遵循

$$
x_{t^\ast}=\alpha_{t^\ast}z.\tag{12}
$$

这两步是为精确噪声水平匹配服务的必要准备步骤。注意在常见插值选择下，$\sigma_{t^\ast}/\alpha_{t^\ast}$ 单调，故对任意耦合参数 $\rho>0$ 总存在唯一解 $t^\ast\in[0,1]$。

### A.3 推论 1 的证明

PnP-DM [58] 使用 EDM 扩散 [31] 表述扩散过程：

$$
x_t=s_E(t)\left(x_0+\sigma_E(t)\epsilon\right).\tag{13}
$$

而在随机插值参数化下，我们有

$$
x_t=\alpha_tx_0+\sigma_t\epsilon.\tag{14}
$$

这两种参数化的关系为

$$
s_E(t)=\alpha_t,\qquad\sigma_E(t)=\frac{\sigma_t}{\alpha_t}.\tag{15}
$$

定义

$$
\gamma_t=\dot\alpha_t\sigma_t-\alpha_t\dot\sigma_t,\qquad\lambda_t=-\frac{\gamma_t}{\alpha_t}=\frac{\alpha_t\dot\sigma_t-\dot\alpha_t\sigma_t}{\alpha_t}.\tag{16}
$$

**引理 2.** 在（15）的参数对应下，有

$$
\dot\sigma_E(t)=\frac{\lambda_t}{\alpha_t}.\tag{17}
$$

**证明.** 由 $\sigma_E(t)=\sigma_t/\alpha_t$，

$$
\dot\sigma_E(t)=\frac{\dot\sigma_t\alpha_t-\sigma_t\dot\alpha_t}{\alpha_t^2}=\frac{-\dot\alpha_t\sigma_t-\alpha_t\dot\sigma_t}{\alpha_t^2}=-\frac{\gamma_t}{\alpha_t^2}=\frac{\lambda_t}{\alpha_t}.\tag{18}
$$

现在可以证明：EDM 参数化下 PnP-DM 的反向时间 SDE [58, 31]

$$
dx_t=\left[\frac{\dot s_E(t)}{s_E(t)}x_t-2s_E(t)^2\dot\sigma_E(t)\sigma_E(t)\nabla_{x_t}\log p\left(\frac{x_t}{s_E(t)};\sigma_E(t)\right)\right]dt+s_E(t)\sqrt{2\dot\sigma_E(t)\sigma_E(t)}\,dw_t\tag{19}
$$

是 FlowSGS 反向时间 SDE 的特例。

**推论 1 的证明.** 首先，用（15）替换 EDM 扩散系数得

$$
\frac{\dot s_E(t)}{s_E(t)}=\frac{\dot\alpha_t}{\alpha_t},\tag{20}
$$

$$
2s_E(t)^2\dot\sigma_E(t)\sigma_E(t)=2\alpha_t^2\left(\frac{\lambda_t}{\alpha_t}\right)\left(\frac{\sigma_t}{\alpha_t}\right)=2\lambda_t\sigma_t,\tag{21}
$$

$$
s_E(t)^2\,2\dot\sigma_E(t)\sigma_E(t)=\alpha_t^2\,2\left(\frac{\lambda_t}{\alpha_t}\right)\left(\frac{\sigma_t}{\alpha_t}\right)=2\lambda_t\sigma_t.\tag{22}
$$

这表明 PnP-DM 反向时间 SDE 的漂移系数为 $\dot\alpha_t/\alpha_t$、score 系数为 $2\lambda_t\sigma_t$、扩散系数平方为 $2\lambda_t\sigma_t$。

速度—score 关系可写为

$$
v(x_t,t)=\frac{\dot\alpha_t}{\alpha_t}x_t-\lambda_t\sigma_ts(x_t,t).\tag{23}
$$

把它代入（3）的 SI 反向时间 SDE 得

$$
\begin{aligned}
dx_t&=\left[\frac{\dot\alpha_t}{\alpha_t}x_t-\lambda_t\sigma_ts(x_t,t)-\frac{w_t}{2}s(x_t,t)\right]dt+\sqrt{w_t}\,d\bar w_t\\
&=\left[\frac{\dot\alpha_t}{\alpha_t}x_t-\left(\lambda_t\sigma_t+\frac{w_t}{2}\right)s(x_t,t)\right]dt+\sqrt{w_t}\,d\bar w_t.
\end{aligned}\tag{24}
$$

取 $w_t=2\lambda_t\sigma_t$ 得

$$
dx_t=\left[\frac{\dot\alpha_t}{\alpha_t}x_t-2\lambda_t\sigma_ts(x_t,t)\right]dt+\sqrt{2\lambda_t\sigma_t}\,d\bar w_t.\tag{25}
$$

这与 PnP-DM 的先验步反向时间 SDE 一致。FlowSGS 在 $t^\ast$ 处的初始化遵循 $x_{t^\ast}=\alpha_{t^\ast}z_k$，由于 $\alpha_{t^\ast}=s_E(t^\ast)$，它直接对应 PnP-DM 的初始化。总之，当 $w_t=2\lambda_t\sigma_t$ 时，PnP-DM 作为 FlowSGS 的特例被恢复，二者具有等价的反向时间 SDE 与初始化。

对 VP-SDE，$\lambda_t\sigma_t=\beta_t/2$，故该扩散系数与 VP-SDE 的反向过程一致并可恢复之：

$$
w_t^{\mathrm{KL}}=2\lambda_t\sigma_t=\beta_t.\tag{26}
$$

> **注 1：** EDM 把反向 SDE 的扩散系数固定为由前向扩散过程所隐含的值 $w_t=s_E(t)\sqrt{2\dot\sigma_E(t)\sigma_E(t)}$。相反，SI 框架允许在采样时任意取 $w_t\geq0$：$w_t=0$ 给出概率流 ODE，$w_t=2\lambda_t\sigma_t$ 恢复 PnP-DM，其他选择可无需重训练地调节。

### A.4 推论 2 的证明

我们不重述完整的 Fokker–Planck 计算，而是说明 FlowSGS 满足 PnP-DM [58] 定理 3.1 所用的全部结构条件，从而在参数替换后同一证明适用。我们强调三方面，然后描述替换。

**相同的 SGS 骨架。** FlowSGS 的似然步（算法 1 第 3 行）与 PnP-DM 相同：二者都通过 Langevin 动力学以同一条件分布 $\pi(z\mid x)\propto\exp[-f(z;y)-\|x-z\|^2/2\rho^2]$ 为目标。因此 PnP-DM 的布朗桥解释（[58, 命题 A.2]）与由此得到的 KL/Fisher 收缩（其引理 2，见 [55]）对 FlowSGS 也成立。

**先验步具有规范的漂移—扩散形式。** PnP-DM 的关键技术引理（[58, 引理 A.4]）是一个通用的 Fokker–Planck 论证，它界定任意两个共享相同扩散系数 $c(t)$、仅漂移不同的扩散过程之间 KL 散度的时间导数，且不对漂移的构造方式作任何假设。FlowSGS 的先验步 SDE（5）正是这样的过程：其漂移是速度 $v(x,t)$ 与状态 $x$ 的仿射组合，扩散系数为 $\sqrt{w_t}$。非平稳过程（由预训练 $v_\theta$ 驱动）与平稳过程（由真实 $v$ 驱动）共享相同的 $c(t)=\sqrt{w_t}$，这是该引理的唯一结构要求。因此 PnP-DM 的引理可原样用于 FlowSGS 的先验步，只需把漂移差的平方正比于 $\|v_\theta-v\|_2^2$ 而非 $\|s_\theta-s\|_2^2$。

**SI 等价的假设。** PnP-DM 的定理 3.1 依赖两个假设：

- （假设 A.1）$\sigma_E(t)$ 严格递增，故存在唯一的 $t^\star$ 使 $\sigma_E(t^\star)=\rho$。在 SI 参数对应 $\sigma_E(t)=\sigma_t/\alpha_t$（推论 1）下，这变成噪声—信号比 $\sigma_t/\alpha_t$ 严格递增的要求——恰是本文定理 1 的适定性条件，且表 2 中所有调度都满足。
- （扩散系数下限）PnP-DM 反向 SDE 扩散系数的下确界 $\delta:=\inf_{[0,t^\star]}s_E(t)\sqrt{2\dot\sigma_E\sigma_E}$ 严格为正。在同一对应下，该下确界变为 $\inf_{[0,t^\star]}\sqrt{w_t}$，其中 $w_t$ 是 FlowSGS 的采样时扩散系数。这正是假设变得更宽松之处：PnP-DM 的 $\delta$ 由 EDM 前向过程固定，且可能在端点处消失（如 VP/iDDPM），迫使 [58, 附录 A.3] 采取变通；FlowSGS 允许用户在采样时自由选择 $w_t$，因此下限条件是对用户选择的约束而非对模型的约束。

PnP-DM 的 score 精度假设转化为 $\pi_\tau$ 下关于速度场的 $L_2$ 精度条件；借助速度—score 关系（正文（4）），它与 score 条件在相差有界标量因子意义下等价。

**归约。** 综合上述三点，[58, 附录 A.2] 中定理 3.1 证明的每一步都成立：似然步收缩不变；先验步收缩由 [58, 引理 A.4] 应用于注 2 所述规范形式 SDE 得到，其中 PnP-DM 的 $v(t)$ 替换为 $\sqrt{w_t}$、score 误差项替换为相应的速度误差项；对 $K$ 次外迭代的 telescoping 完全相同。所得非渐近界与 PnP-DM 形状相同：由 $\min(\rho,\delta)^2$ 支配的、从初始化出发的 $O(1/K)$ 收缩，加上由 $\delta^2$ 支配的速度近似下限。（原文疑点：此处引用"注 2"，但原文 A.3 节只给出注 1；本页按原样保留该交叉引用并加此注。）

## 附录 B：逆问题设置（原 PDF 第 17—18 页）

### B.1 玩具问题

在玩具问题中，我们使用 CelebA 数据集 [39] 的图像（许可证未知）。所有图像在任何计算前都转为灰度、缩放到 $64\times64$、归一化到 $[-1,1]$。我们生成随机高斯矩阵 $A\in\mathbb R^{1024\times4096}$ 作为压缩感知矩阵。前向模型为 $y=Ax+\epsilon$，其中 $\epsilon\sim\mathcal N(0,\sigma_n^2I)$、$\sigma_n=0.01$。对先验，我们从 CelebA 抽取 50,000 幅男性人脸图像并拟合多元高斯分布 $\mathcal N(\mu_0,\Sigma_0)$。结合高斯似然，这给出高斯后验

$$
p(x\mid y)=\mathcal N(\mu,\Sigma),\qquad\mu=\Sigma\left(\Sigma_0^{-1}\mu_0+\frac{1}{\sigma_n^2}A^{\top}y\right),\qquad\Sigma=\left(\Sigma_0^{-1}+\frac{1}{\sigma_n^2}A^{\top}A\right)^{-1}.\tag{27}
$$

图 6 展示了玩具问题中所用的测量、先验与解析后验。

### B.2 像素空间模型实验

在像素空间模型实验（第 4.3 节）中，我们使用 FFHQ 数据集 [32]（Creative Commons BY-NC-SA 4.0 许可）与 fastMRI 单线圈膝部数据集 [61]。所有图像缩放到 $256\times256$ 并归一化到 $[0,1]$ 作为真值，再用于生成不同任务的退化测量。

**运动去模糊与高斯去模糊。** 前向模型 $y=Hx+\epsilon$，其中 $H$ 是带模糊核的卷积算子、$\epsilon\sim\mathcal N(0,\sigma_n^2I)$（$\sigma_n=0.05$）。对运动去模糊，我们用该代码（https://github.com/LeviBorodenko/motionblur，许可证未知）生成轨迹强度 0.5 的 $64\times64$ 运动模糊核，再填充到 $256\times256$。对高斯去模糊，我们直接生成标准差 $\sigma_k=3.0$ 像素的 $256\times256$ 模糊核。所有核都归一化为和为 1.0。

**超分辨率。** 退化过程建模为 $y=Sx+\epsilon$，其中 $S$ 是 $4\times$ 平均池化下采样算子、$\epsilon\sim\mathcal N(0,\sigma_n^2I)$（$\sigma_n=0.05$）。

**压缩感知 MRI。** 前向模型为 $y=\mathcal MF(x)+\epsilon$，其中 $\mathcal M$ 为掩码算子、$\mathcal F(\cdot)$ 为二维 Fourier 变换、$\epsilon\sim\mathcal N(0,\sigma_n^2I)$（$\sigma_n=0.02$）。我们生成加速率 8.0 的笛卡尔与径向采样掩码。笛卡尔掩码的中心 8% 分量全采样，其余线随机采样；径向掩码中的线均匀采样。

**Fourier 相位恢复。** 前向模型为 $y=|\mathcal F(Px)|+\epsilon$，其中 $P$ 为过采样率 8.0 的填充算子（把 $256\times256$ 图像填充到 $512\times512$）、$\mathcal F(\cdot)$ 为二维 Fourier 变换、$\epsilon\sim\mathcal N(0,\sigma_n^2I)$（$\sigma_n=0.01$）。过采样用于增加测量数量以降低问题的不适定性 [58]。

### B.3 潜空间模型实验

在潜空间模型实验（第 4.3 节）中，我们使用 AFHQ 数据集 [12]（Creative Commons BY-NC 4.0 许可）的猫图像，缩放到 $512\times512$ 并归一化到 $[0,1]$。问题设置与 B.2 节的运动去模糊和超分辨率相同，只是超分辨率的下采样因子为 8.0。

## 附录 C：实现细节（原 PDF 第 18—19 页）

### C.1 网络架构

在玩具问题与像素空间模型的基准实验（第 4.2 与 4.3 节）中，我们用由 Inversebench [67] 实现的 NCSN++ 架构 [52] 预训练自己的扩散与流模型。所有模型在每个数据集上用 Adam 优化器训练 500 个 epoch，并使用指数滑动平均（EMA）以获得更好性能。对扩散模型，我们使用 VP-SDE 作为扩散调度；对流模型，我们用 VP-SDE、线性与 GVP 调度训练（汇总见表 2），并在消融研究中比较（见表 1 与表 8）。在每个任务内，所有扩散/流模型都在同一训练集上训练，共享相同架构与优化参数，以保证公平比较。我们在 CelebA、FFHQ 与 fastMRI 膝部数据上训练的模型 checkpoint 可在项目主页获取。我们使用现成的 Stable Diffusion 3.5 Medium [19] 作为潜空间流先验。

### C.2 使用 Langevin 动力学的似然步

我们假设高斯噪声模型 $n\sim\mathcal N(0,\tau^2I)$，则（7）中的似然步具有如下形式：

$$
z\sim\pi(z\mid x^k,y)\propto\exp\left[-\frac{\|A(z)-y\|^2}{2\tau^2}-\frac{\|z-x^k\|^2}{2\rho_k^2}\right],\tag{28}
$$

其中 $\tau$ 表示噪声模型的标准差。注意当前向模型 $A$ 为线性时，[58] 存在解析解：

$$
z\sim\mathcal N(m(x^k),\Lambda^{-1}),\tag{29}
$$

其中 $\Lambda:=A^{\top}\Sigma^{-1}A+\frac{1}{\rho_k^2}I$、$m(x):=\Lambda^{-1}\left(A^{\top}\Sigma^{-1}y+\frac{1}{\rho_k^2}x\right)$。尽管有解析形式，我们仍对线性与非线性问题都用 Langevin 动力学 [54] 从（28）采样。该选择提供统一的采样框架，免去任务特定的推导，并确保在前向模型没有闭式逆时也有稳健性能。我们使用 Inversebench [67] 中 Langevin 动力学的实现。每个 Langevin 步计算梯度

$$
\nabla E(z)=\frac{1}{2\tau^2}\nabla_z\|A(z)-y\|^2+\frac{z-x^k}{\rho_k^2},\tag{30}
$$

并按

$$
z^{(\ell+1)}=z^{(\ell)}-\eta\nabla E\left(z^{(\ell)}\right)+\sqrt{2\eta}\,\epsilon,\qquad\epsilon\sim\mathcal N(0,I),\tag{31}
$$

更新 $z$，其中 $\eta$ 为 Langevin 步长。我们对每个任务调优 $\tau$ 与 $\eta$ 以获得最佳重建质量。我们观察到 PnP-DM [58] 与 FlowSGS 在 $\tau$ 取测量真实噪声水平时都达到最优性能。主实验中 Langevin 采样使用 100 步。

当使用带解码器 $D_\theta(\cdot)$ 的潜空间模型采样时，梯度形式为

$$
\nabla E(z)=\frac{1}{2\tau^2}\nabla_z\|A(D_\theta(z))-y\|^2+\frac{z-x^k}{\rho_k^2},\tag{32}
$$

它需要对解码器求导。注意这会显著增加似然步的计算成本，因此用潜空间模型采样时我们只用 32 步。

### C.3 退火调度

SGS 使用 100 次迭代，表 4 汇总 FlowSGS 在各任务中使用的退火超参数。我们发现采样质量对 $\rho_{\min}$ 最敏感，它决定似然步与先验步的稳态耦合，以及精化最终输出的最后一个先验步的起点。合理较大的起始水平 $\rho_0$ 与衰减率 $\alpha>0.9$ 会带来相近性能。

## 附录 D：额外结果（原 PDF 第 19—25 页）

### D.1 主实验

本节提供第 4.3 与 4.4 节使用像素空间模型的主实验的额外结果。表 5 给出表 1 中各指标均值对应的标准差，表 6 给出各方法并行抽取 8 个后验样本时的运行时间。所有计时在单块 NVIDIA H100 GPU 上对 100 次运行取平均。注意 FlowSGS 的运行时间随插值调度不同而不同，因为不同调度换算为不同的先验步 SDE 起始时间点，导致不同的 NFE（线性 881、GVP 828、VP-SDE 481）。在所有考虑的插值调度下，FlowSGS 都快于现有基于扩散的采样器。图 7—9 给出第 4.3 与 4.4 节主实验中 6 个逆问题的额外视觉样本。

### D.2 使用潜空间模型的实验

图 10 展示使用潜空间流先验（Stable Diffusion 3.5 Medium [19]）在运动去模糊与 8× 超分辨率上的结果。问题设置见 B.3 节。

### D.3 消融研究

**FlowSGS 的关键组件。** 表 7 通过逐一移除来检验 FlowSGS 关键组件的有效性。我们在运动去模糊上仅用 16 个 SDE 离散化步进行测试，表明时间步换算、缩放与时间步校正都能带来精度提升。

**插值调度与扩散系数。** 表 8 给出不同插值系数与扩散系数在运动去模糊与 Fourier 相位恢复上的定量比较。结果在全部 100 个测试图像上平均并给出误差（均值的标准差）。我们观察到线性调度与 KL-最优系数结合给出最佳结果。Fourier 相位恢复对插值调度尤其敏感，其中线性插值显著优于其他选择。

**SDE 离散化步数。** 图 11 展示图 5c 中运动去模糊 SDE 离散化步数消融的视觉样本。可见带时间步校正的 FlowSGS 在小离散化步设定下更鲁棒，而 PnP-DM 由于扩散模型的高离散化误差而显著失败。

### D.4 超参数敏感性

FlowSGS 暴露若干相互依赖的超参数：退火调度 $(\rho_0,\rho_{\min},\alpha)$ 与似然步参数（噪声模型 $\tau$、Langevin 步长 $\eta$）。我们在运动去模糊、20 幅留出测试图像上，围绕表 4 的默认配置做单因子扫描（每次只变一个参数、其余固定）。结果见表 9；默认设置以 † 标记，如预期在每一块中都给出 LPIPS $=0.188$。对先验步离散化步数 $N$ 的敏感性在图 5c 与 D.3 节另行报告。

只有两个超参数实质影响重建质量。其一是 $\rho_{\min}$，它决定似然步与先验步的稳态耦合，从而决定精化输出的最后先验步的起始时间 $t_k$；当 $\rho_{\min}$ 增至 1.0 时 LPIPS 从 0.188 退化到 0.259，因为过大的终端耦合使先验步从插值上过靠前的位置出发，无法收敛到与测量一致的解。其二是测量噪声水平的假定值 $\tau$，它与 DPS [14]、FlowChef [45]、FlowDPS [34] 与 PnP-Flow [42] 中的测量权重作用相同；当 $\tau$ 与测量真实噪声水平匹配时性能最佳，两侧都会退化。相反，FlowSGS 对起始水平 $\rho_0$ 与衰减率 $\alpha$ 鲁棒，二者在超过一个数量级的变化范围内使 LPIPS 变化小于 0.008。我们还注意到 Langevin 步长 $\eta$ 在测试范围内单调改善，说明我们的默认值偏保守而非调到了内点最优。关于参数数量的参照：PnP-DM [58] 与 DAPS [62] 等有原则的后验采样器携带数量相当的参数；我们的若干参数来自 Langevin 似然步，对线性前向模型本可用近端似然采样器 [58] 消除，但为兼顾线性与非线性算子的一般性，我们保留 Langevin 而未采用它。

## 附录 E：更广泛的影响（原 PDF 第 25 页）

我们证明了该方法在医学成像应用（加速单线圈 MRI）中有效，并相信它能在科学与医学成像中产生广泛正面影响。然而，逆成像能够重建在此类方法出现之前可能被视为私密的场景。虽然我们没有直接在此类应用上测试，但确实展示了人脸的重建，这提示该方法可能被用于在原本匿名的场景中识别个人。此外，我们使用 2 块 NVIDIA H100 GPU 做预训练、单块 H100 GPU 做采样。

## NeurIPS 论文检查表（原 PDF 第 26—32 页）

以下逐项保留原文的问答与作者理由（模板性的 Guidelines 说明从略）。

1. **主张**：摘要与引言中的主要主张是否准确反映论文贡献与范围？答：[是]。理由：摘要中的主张有理论支持（一个定理与两个推论，含证明）与经验验证。
2. **局限**：论文是否讨论作者工作的局限？答：[是]。理由：结论列出三项主要局限及未来可能的缓解方案。
3. **理论假设与证明**：每个理论结果是否给出完整假设与完整（且正确）的证明？答：[是]。理由：补遗给出定理与两个推论的详细证明及完整假设列表。
4. **实验结果可复现性**：论文是否充分披露复现主要结果所需信息？答：[是]。理由：附录提供详细的问题设置、数据集、训练细节与模型架构；若被接收，我们也将公开代码以利复现。
5. **数据与代码的开放获取**：论文是否提供数据与代码开放获取及充分说明？答：[否]。理由：若被接收，我们将提供数据与代码开放获取；目前尚无适当匿名化的代码库与数据集。
6. **实验设置/细节**：论文是否说明理解结果所需的全部训练与测试细节？答：[是]。理由：正文与补遗给出主要训练与采样细节；若被接收，我们将在代码库中提供更多配置文件。
7. **实验统计显著性**：论文是否恰当且正确地报告误差棒或其他显著性信息？答：[是]。理由：表 5 报告了我们与其他方法定量比较的标准差。
8. **实验计算资源**：论文是否提供复现实验所需的计算资源信息？答：[是]。理由：训练使用 2 块 NVIDIA H100 GPU、测试使用单块 H100 GPU（正文已说明）。
9. **伦理准则**：研究是否在所有方面符合 NeurIPS 伦理准则（https://neurips.cc/public/EthicsGuidelines）？答：[是]。理由：本工作提出面向贝叶斯逆问题的通用后验采样算法，并在标准公开图像数据集（FFHQ）与合成测量上评估，其中一个实验使用公开发布的 Stable Diffusion 3.5 潜先验。我们不采集新的受试者数据、不发布新数据集，也不把方法部署于任何高风险场景。我们已阅读 NeurIPS 伦理准则并确认研究在所有方面符合之。
10. **更广泛影响**：论文是否讨论潜在正面与负面社会影响？答：[是]。理由：我们在补遗（附录 E）中讨论更广泛影响。
11. **防护措施**：论文是否描述针对高风险误用数据/模型发布的防护措施？答：[不适用]。理由：本文利用预训练生成模型做逆成像，但本身不开发高风险组件。
12. **现有资产的许可**：所用资产（代码、数据、模型）的创建者/所有者是否被恰当署名，许可与使用条款是否明确提及并遵守？答：[是]。理由：我们恰当引用了所有数据集与软件包；无法确定所用的 motionblur 库的许可证，故仅提供链接。
13. **新资产**：论文引入的新资产是否有良好文档并与资产一同提供？答：[否]。理由：若被接收，我们将提供有良好文档的开放获取代码；目前没有适当匿名化的代码库可提交。
14. **众包与人类受试者研究**：论文是否包含给参与者的完整说明、截图与报酬细节？答：[不适用]。理由：本文不涉及众包或人类受试者研究。
15. **IRB 批准**：论文是否描述受试者潜在风险、风险披露与 IRB 批准？答：[不适用]。理由：本文不涉及众包或人类受试者研究。
16. **LLM 使用声明**：若 LLM 是核心方法的重要、原创或非标准组件，论文是否说明其使用？答：[不适用]。理由：本工作不涉及作为重要、原创或非标准组件的 LLM。

**本页范围与校对状态：** 本页依据 arXiv:2609.20769v1（cs.CV，2026-09-17，32 页预印本）完成全文中文翻译：摘要、第 1—5 节（含 2.1—2.2、3.1—3.2、4.1—4.5）、致谢与资助、图 1—11 中文图注、表 1—9 逐格转录、参考文献 [1]—[68] 英文原条目（按原编号）、附录 A—E（含定理 1、推论 1—2 的证明与全部实验设置）、NeurIPS 论文检查表 16 项问答与理由均按原文结构录入。编号公式 (1)—(32) 按原文保留。表 1 与表 5—6 已分别用 PDF 第 8、22 页渲染图逐格核对，表 2—4 与表 7—9 的数值与结构按抽取文本转录。**逐句逐式终校未做**；图内图像与曲线只转录图注与正文信息，未作数字化读取；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①A.4 节引用"注 2"，但原文 A.3 节只给出注 1（本页按原样保留该交叉引用并加注）；②论文原文页眉标注为 Preprint，且检查表第 5、13 项对代码与数据的开放获取答"否/待接收后提供"，与本页"全文译稿"的可用性说明无关，仅照录原文口径。原文为 NeurIPS 格式预印本，含 32 页（正文 9 页 + 参考文献 + 附录 + 检查表）。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
