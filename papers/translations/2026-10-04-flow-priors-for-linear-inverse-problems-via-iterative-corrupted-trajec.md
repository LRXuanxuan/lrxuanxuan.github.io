---
layout: page
title: "通过迭代受损轨迹匹配的线性逆问题流先验｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-04-flow-priors-for-linear-inverse-problems-via-iterative-corrupted-trajec/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/685f885dafcb782a/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 通过迭代受损轨迹匹配的线性逆问题流先验

**原题：** Flow Priors for Linear Inverse Problems via Iterative Corrupted Trajectory Matching  
**作者：** Yasi Zhang（UCLA）、Peiyu Yu（UCLA）、Yaxuan Zhu（UCLA）、Yingshan Chang（CMU）、Feng Gao（*，Amazon）、Ying Nian Wu（UCLA）、Oscar Leong（UCLA）  
**单位：** 加州大学洛杉矶分校（UCLA）统计学与计算机科学相关院系；卡内基梅隆大学（CMU）；Amazon（Feng Gao 在 Amazon 的职位与本工作无关）。邮箱：yasminzhang@ucla.edu、yupeiyu98@g.ucla.edu、yaxuanzhu@g.ucla.edu、yingshac@andrew.cmu.edu、fenggo@amazon.com、ywu@stat.ucla.edu、oleong@stat.ucla.edu。  
**版本：** 会议论文集版本（NeurIPS-2024-flow-priors-for-linear-inverse-problems-via-iterative-corrupted-trajectory-matching-Paper-Conference.pdf），本地 PDF 29 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、图表说明与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 本地 PDF 为 **NeurIPS 2024 会议论文集版本（第 38 届）**，共 29 页（正文 10 页 + 参考文献 + 附录 A—E + 后置图页）；无 arXiv 版本号。骨架所记"会议论文集版本 / 29 页 / 许可待核验"与 PDF 一致，本页保留该许可说明。

## 摘要

基于**流匹配**的生成模型因其简洁性与在高分辨率图像合成上的优越性能而备受关注。利用**瞬时变元公式（instantaneous change-of-variables formula）**，可直接从学习到的流计算图像似然，这使此类模型成为逆问题等下游任务先验的诱人候选。特别地，一种自然的做法是把这种图像概率纳入**最大后验（MAP）**估计问题。然而一个主要障碍在于对数似然的计算缓慢：它需要穿越 ODE 求解器做反向传播，对高维问题可能慢到无法接受。本文提出一种迭代算法以高效近似 MAP 估计，从而求解多种线性逆问题。我们的算法有数学依据：MAP 目标可近似为 $N$ 个"局部 MAP"目标之和，其中 $N$ 为函数评估次数。借助 Tweedie 公式，我们证明可执行梯度步以顺序优化这些目标。我们在超分辨、去模糊、修复与压缩感知等多种线性逆问题上验证了该方法，并证明其优于其他基于流匹配的方法。代码见 https://github.com/YasminZhang/ICTM 。

## 1 引言

线性逆问题广泛存在于众多成像领域，遍及天文学 [41], [23]、医学成像 [38], [49] 与地震学 [35], [39]。此类问题的目标是：由观测测量 $y\in\mathbb R^m$ 重建未知图像 $x^\ast\in\mathbb R^n$，形式为

$$
y=\mathcal A(x^\ast)+\text{noise},\tag{1}
$$

其中 $\mathcal A:\mathbb R^n\to\mathbb R^m$（$m\le n$）是使干净图像 $x^\ast$ 退化的线性算子，加性噪声取自已知分布。本文假设噪声服从 $\mathcal N(0,\sigma_y^2\mathbf I)$。由于此类问题欠约束、通常病态，即存在无穷多符合观测的 undesirable 图像。因此需要关于底层图像的进一步结构信息，这构成我们的先验。

随着大规模生成模型的出现 [27], [17], [48], [40], [8], [59], [58]，利用生成模型作为先验求解逆问题引发了大量兴趣。给定一个可从某分布采样、或可访问图像概率的预训练生成器，就能以与任务/前向模型无关的方式求解多种逆问题，且无需大规模监督 [36]。这已在多种模型上成功实现，包括 GAN 与 VAE 等隐式生成器 [4], [34]、归一化流等可逆生成器 [1], [54]，以及更近期的扩散模型 [10], [43], [60]。

生成建模的一个近期范式 [48], [55], [25], [57] 基于**流匹配**概念 [29], [28]，在把基于 ODE 的生成器扩展到高分辨率图像方面取得重大进展。流匹配模型通过定义表示分布间变换的流场，把简单基分布（如高斯）映射到复杂高维数据分布。此类生成模型已展现高维可扩展性，成为若干最先进生成模型的骨干 [30], [13], [56]。此外，相比扩散模型，流匹配模型沿更直、更直接的**概率路径**，可实现更高效快速的采样 [28], [29], [13]。并且由于其可逆性，流匹配模型可通过瞬时变元公式 [9], [18] 直接访问图像似然。鉴于这些优势以及此类模型相对近期才被用于逆问题 [37], [2]，本文研究其作为图像先验的用途。

利用关于退化过程 $p(y\mid x)$ 的知识与自然图像先验 $p(x)$，贝叶斯方法建议分析图像重建后验 $p(x\mid y)\propto p(y\mid x)p(x)$ 以求解逆问题。基于该思路的一种已被证明有效的方法是**最大后验（MAP）估计** [6], [19]，它最大化后验以找出最可能与观测测量匹配的图像：

$$
\arg\min_{x\in\mathbb R^n}-\log p(x\mid y)=\arg\min_{x\in\mathbb R^n}-\log p(y\mid x)-\log p(x).\tag{2}
$$

MAP 估计给出后验分布的单一最可能点估计，简单且可解释。这种确定性方法保证一致性与可复现性，这对需要可靠结果的应用至关重要，尤其是计算机断层扫描（CT）[7] 与磁共振成像（MRI）[52] 等压缩感知任务。虽然后验采样方法可提供多样重建以量化不确定性，但在高维情形下可能慢到无法接受 [5]。因此本文提出以 MAP 估计结合流先验来求解线性逆问题。

使用流先验做 MAP 估计的一个重大挑战是图像概率计算缓慢，因为需穿越 ODE 求解器反向传播 [47], [16], [15]。本文展示如何通过**迭代受损轨迹匹配（Iterative Corrupted Trajectory Matching，ICTM）**——一种以计算高效方式近似 MAP 解的新算法——应对该挑战。具体地，我们展示如何通过顺序优化一个新的、更简单的**辅助目标**来近似求得 MAP 解，该辅助目标在函数评估次数趋于无穷时逼近真实 MAP 目标；在有限评估次数下，我们以跨多种线性逆问题的强经验性能证明该近似足以优化。贡献总结如下。

1. 提出 **ICTM**：一种使用流先验近似多种线性逆问题 MAP 解的算法。该算法优化一个辅助目标，把流模型的轨迹划分为 $N$ 个"局部 MAP"目标（$N$ 为函数评估次数 NFE）。借助 Tweedie 公式，我们证明可执行梯度步以顺序优化这些目标。
2. 理论上证明：当 NFE 趋于无穷时，辅助目标收敛到真实 MAP 目标；我们在去噪问题上验证算法求解 MAP 解的正确性。
3. 在自然与科学图像数据集的多种线性逆问题（去噪、修复、超分辨、去模糊与压缩感知）上展示 ICTM 的效用。大量结果表明 ICTM 计算高效且获得高质量重建，优于其他基于流先验的重建算法。

## 2 背景

**记号**：沿用基于流的模型约定：高斯噪声在时间步 0 采样，干净图像对应时间步 1（与扩散模型相反）。对 $t\in[0,1]$，记 $x_t(x_0)$ 为初始条件为 $x_0$ 的时刻 $t$ 的点。本文互换使用 $x$ 与 $x_1$，即 $x_1(x_0)=x(x_0)$。

### 2.1 基于流的模型

考虑用常微分方程（ODE）把噪声分布 $p(x_0)$（如高斯）的样本 $x_0$ 映射到数据分布 $p(x_1)$ 的样本 $x_1$ 的生成模型：

$$
\mathrm dx_t=v_\theta(x_t,t)\,\mathrm dt,\tag{3}
$$

其中速度场 $v$ 是 $\theta$ 参数化的神经网络，例如采用 UNet [28], [29], [42] 或 Transformer [13], [51] 架构。基于流匹配的生成模型 [28], [29] 可看作学习速度场的**无需模拟**方法：它通过指定插值曲线 $x_t$ 预先确定 ODE 应遵循的路径，而不依赖 MLE 算法隐式发现路径 [9]。为构造该路径（不必是马尔可夫的），可定义 $x_0$ 与 $x_1$ 间的可微非线性插值：

$$
x_t=\alpha_tx_1+\beta_tx_0,\qquad x_0\sim\mathcal N(0,\mathbf I),\tag{4}
$$

其中 $\alpha_t$ 与 $\beta_t$ 为关于 $t$ 的可微函数，满足 $\alpha_0=0$、$\beta_0=1$、$\alpha_1=1$、$\beta_1=0$。这确保 $x_t$ 在时间 0 到 1 间从标准高斯分布被输运到自然图像流形。相比之下，扩散过程 [48], [45], [20] 因 SDE 表述中的扩散项而诱导不可微轨迹。

流匹配背后的思想是利用深度神经网络的能力高效预测各时刻速度场：通过最小化采样速度与网络预测速度之间的 $L_2$ 损失来训练：

$$
\mathcal L(\theta)=\mathbb E_{t,p(x_1),p(x_0)}\left\|v_\theta(x_t,t)-\left(\dot\alpha_tx_1+\dot\beta_tx_0\right)\right\|^2.\tag{5}
$$

记 $\arg\min_\theta\mathcal L(\theta)$ 的最优（不必唯一）解为 $\hat\theta$。最优速度场 $v_{\hat\theta}$ 有闭式表达，即状态 $x_t$ 处的期望速度：

$$
v_{\hat\theta}(x_t,t)=\mathbb E_{p(x_1),p(x_0)}\left[\dot\alpha_tx_1+\dot\beta_tx_0\mid x_t\right].\tag{6}
$$

为方便起见，下文用 $v_\theta$ 指代最优的 $v_{\hat\theta}$。后文假设流 $v_\theta$ 及其参数已在数据集上预训练且固定；我们关注利用其作为先验求解逆问题。

### 2.2 流先验的概率计算

记式（3）中 $x_t$ 的（依赖时间的）概率为 $p(x_t)$。假设 $v_\theta$ 关于 $x_t$ 一致 Lipschitz 连续、关于 $t$ 连续，则对数概率的变化也遵循一个微分方程 [9], [18]：

$$
\frac{\partial\log p(x_t)}{\partial t}=-\operatorname{tr}\left(\frac{\partial}{\partial x}v_\theta(x_t,t)\right).\tag{7}
$$

沿时间积分式（7）还可得到轨迹的似然：
$$
\log p(x_t)=\log p(x_\tau)-\int_\tau^t\operatorname{tr}\left(\frac{\partial}{\partial x}v_\theta(x_s,s)\right)\mathrm ds,\qquad0\le\tau<t\le1.\tag{8}
$$


## 3 方法

本文旨在求解式（2）中的 MAP 估计问题，其中 $p(x)$ 由预训练流先验给出。我们首先在 3.1 节讨论 MAP 问题原则上可如何通过**潜空间优化问题**求解；可以看到，该问题因需穿越 ODE 求解器反向传播而在计算上具有挑战。为克服这一点，3.2 节展示理想 MAP 问题可近似为若干"局部 MAP"优化问题的加权和——通过把流的轨迹划分为若干片段、重建一个解来实现；随后引入 ICTM 算法顺序优化该辅助目标。最后，3.3 节在全局最优 MAP 解已知的简化设定下，以实验验证算法找到的解忠实于 MAP 估计。

### 3.1 基于流的 MAP

给定预训练流先验，可由式（8）计算由初始噪声样本 $x_0$ 生成的 $x$ 的对数似然。因此，求 MAP 估计等价于优化轨迹起点 $x_0$ 并返回 $x_1(x_0)$，其中 $x_0$ 由下式求得：

$$
\min_{x_0\in\mathbb R^n}\ \underbrace{\frac{1}{2\sigma_y^2}\left\|y-\mathcal A(x_1(x_0))\right\|^2}_{\text{数据似然}}+\underbrace{\frac{1}{2}\|x_0\|^2+\int_0^1\operatorname{tr}\left(\frac{\partial}{\partial x}v_\theta(x_t,t)\right)\mathrm dt}_{\text{先验}},\tag{9}
$$

其中 $x_t:=x_t(x_0)$ 表示由 $x_0$ 生成的中间状态。直观上，该损失鼓励找到一个初始点 $x_0$，使重建 $x_1:=x_1(x_0)$ 既拟合观测测量，又很可能是由该流生成的。

实践中，$x_1$ 与先验项可由 ODE 求解器近似。轨迹 $x_t=x_0+\int_0^tv_\theta(x_t,t)\mathrm dt$ 可由 ODE 采样器近似，即 $\mathrm{ODESolve}(x_0,0,t,v_\theta)$，其中 $x_0$ 为初始点，第二、三个参数分别表示起始与结束时间。例如用 Euler 采样器时，迭代 $x_{t+\Delta t}=x_t+v_\theta(x_t,t)\Delta t$，其中 $\Delta t=1/N$、$N$ 为预定的 NFE。优化式（9）得到最优 $\hat x_0$ 后，再用 $\mathrm{ODESolve}(\hat x_0,0,1,v_\theta)$ 得到 MAP 解 $x_1$。

### 3.2 基于流的 MAP 近似

全局流式 MAP 目标式（9）对低维问题可处理；对高维问题的挑战在于优化式（9）是**基于模拟**的，故每次更新迭代都需穿越 ODE 求解器做完整前向与反向传播，导致内存与时间问题，难以优化 [9], [15], [16], [47]。为应对这一点，我们在定理 1 证明：MAP 目标可近似为 $N$ 个**局部后验目标**的加权和。所谓"局部"，是指它们主要依赖中间轨迹 $x_t$ 与 $x_t+v_\theta(x_t,t)\Delta t$（$t=0,\Delta t,\ldots,N\Delta t$，$\Delta t:=1/N$）的似然与概率。给定初始噪声输入 $x_0$，每个局部后验目标依赖一条**非马尔可夫辅助路径** $y_t=\alpha_ty+\beta_t\mathcal A(x_0)$——连接 $y$ 与 $\mathcal Ax_0$ 之间的点。为简化，我们仅对直线路径 $\alpha_t=t$、$\beta_t=1-t$ 证明，其他插值路径亦可使用；证明见附录 A.2。

**定理 1**：对 $N\ge1$，置 $\gamma_i:=(\frac12)^{N-i+1}$、$\Delta t=1/N$。假设 $y=\mathcal A(x^\ast)+\epsilon$，其中 $x^\ast=x_1(x_0)$、$x_0$ 为式（9）的解，$\epsilon\sim\mathcal N(0,\sigma_y^2\mathbf I)$，且 $x_t$ 对任意 $t\in[0,1]$ 精确遵循直线路径 $x_t=tx+(1-t)x_0$。假设速度场 $v_\theta:\mathbb R^n\times\mathbb R\to\mathbb R^n$ 满足 $\sup_{z\in\mathbb R^n,s\in[0,1]}\left|\operatorname{tr}\frac{\partial}{\partial x}v_\theta(z,s)\right|\le C_1$（某通用常数 $C_1$）。则存在不依赖 $x_0$ 的常数 $c(N)$²，使

$$
\lim_{N\to\infty}\left|\log p(x(x_0)\mid y)-\sum_{i=1}^{N}\gamma_i\hat J_i-c(N)\right|=0,
$$

其中 $\hat J_i=\log p(x_{(i-1)\Delta t})-\operatorname{tr}\left(\frac{\partial v_\theta(x_{(i-1)\Delta t},(i-1)\Delta t)}{\partial x}\right)\Delta t+\log p(y_{i\Delta t}\mid x_{i\Delta t})$。

该结果表明：在最优解处评估的真实 MAP 目标，可由若干仅依赖轨迹 $\{x_t:t\in[0,1]\}$ 在某一时刻局部信息的目标准则加权和近似。$\hat J_i$ 的直观来自 $\hat J_i\approx J_i$，其中 $J_i$ 为局部后验分布 $J_i=\log p(y_{i\Delta t}\mid x_{i\Delta t}(x_{(i-1)\Delta t}))+\log p(x_{i\Delta t})$。

> ² 即 $c(N):=\sum_{i=1}^{N}\gamma_ic_i-\log p(y)$；见附录 A.2 定理 1 的证明。

顺序优化这些局部后验分布，体现了我们希望轨迹中每个中间点 $x_{i\Delta t}$ 都既可能又拟合测量，从而理想地使最终重建 $x_1$ 也满足该性质。$\hat J_i$ 的益处（后文将展示）在于其优化高效。

**关于假设的讨论**：我们假设轨迹 $\{x_t\}_t$ 精确遵循预定义插值路径 $\{\alpha_tx+\beta_tx_0\}_t$。附录 B 分析该假设，并通过**路径符合度（path compliance）**度量界定学习路径相对预定义插值路径的偏差。此外我们对速度场 $v_\theta$ 施加正则性假设，实质要求 $v_\theta$ 的 Jacobian 谱有一致上界，这可由使用 Lipschitz 连续且可微激活函数的神经网络轻易满足。如定理 1 所示，真实 MAP 目标可由如下形式局部目标之和近似：

$$
\hat J_i:=\underbrace{\log p(y_{i\Delta t}\mid x_{i\Delta t})}_{\text{局部数据似然}}+\underbrace{\log p(x_{(i-1)\Delta t})-\operatorname{tr}\left(\frac{\partial v_\theta(x_{(i-1)\Delta t},(i-1)\Delta t)}{\partial x}\right)\Delta t}_{\text{局部先验}}.\tag{10}
$$

初看之下 $\hat J_i$ 仍似难以优化，但可进一步利用洞见进行计算。下面分别讨论 $\hat J_i$ 中的每一项。

**局部数据似然**：ICTM 的直觉是：我们希望使受损轨迹 $\{u_t\}_t$ 与辅助路径 $\{y_t\}_t$ 匹配，后者由测量 $y$ 与 $\mathcal A(x_0)$ 在每个时刻 $t$ 的插值指定，即 $y_t:=\alpha_ty+\beta_t\mathcal A(x_0)$。受损轨迹 $u_t:=\mathcal A(x_t)$ 遵循**受损流 ODE** $\mathrm du_t=\mathcal A(v_\theta(x_t,t))\mathrm dt$。为优化上述"局部 MAP"目标，必须理解 $p(y_t\mid x_t)$ 的分布；一般来说该分布不可处理。但若假设流生成轨迹与预定义插值路径精确符合（如定理 1 所作），可证明 $y_t\mid x_t\sim\mathcal N(u_t,\alpha_t^2\sigma_y^2)$（附录中引理 3）。虽然精确符合对学习到的流匹配模型可能不成立，我们以实验表明该假设在实践中带来强性能；附录 B 进一步分析符合度概念。

**局部先验**：式（10）的近似解决了 MAP 的主要顾虑之一——以更简单的黎曼和规避密集积分计算。该近似对小时间增量 $\Delta t$ 成立：$\int_t^{t+\Delta t}\operatorname{tr}\left(\frac{\partial}{\partial x}v_\theta(x_s,s)\right)\mathrm ds\approx\operatorname{tr}\left(\frac{\partial}{\partial x}v_\theta(x_t,t)\right)\Delta t$。注意还可采用 Hutchinson–Skilling 估计 [44], [21] 来估计 Jacobian 的迹以进一步提升该效率。然而初看之下，我们似乎只是把问题转移到了时刻 $(i-1)\Delta t$ 的先验计算；幸运的是，利用 Tweedie 公式 [12] 可推导所有时刻 $t\in[0,1]$ 的 $\log p(x_t)$ 梯度，从而使我们能以基于梯度的优化器优化每个目标 $\hat J_i$。下述结果给出 $\nabla_{x_t}\log p(x_t)$ 的精确刻画（证明见附录 A.1）。

**命题 1**：令 $\lambda_t=\alpha_t/\beta_t$ 表示信噪比。分数函数 $\nabla_{x_t}\log p(x_t)$ 与速度场 $v_\theta(x_t,t)$ 的关系为

$$
\nabla_{x_t}\log p(x_t)=\frac{1}{\beta_t^2}\left[\left(\frac{\mathrm d\log\lambda_t}{\mathrm dt}\right)^{-1}\left(v_\theta(x_t,t)-\frac{\mathrm d\log\beta_t}{\mathrm dt}x_t\right)-x_t\right].\tag{11}
$$

综上，我们导出了 MAP 目标的高效近似。算法中，我们对 $t=0,\Delta t,\ldots,N\Delta t$ 依次优化每一项 $\hat J_t$，把当前迭代 $x_t$ 拟合以诱导增量 $x_{t+\Delta t}$，使 $\mathcal A(x_{t+\Delta t})$ 拟合辅助受损路径 $y_{t+\Delta t}$，同时在局部先验下保持可能。我们把该方法称为**迭代受损轨迹匹配（ICTM）**，算法见算法 1。在算法第 7、12 行，我们不直接优化局部数据似然，而引入 $\lambda$ 作为新超参数调节；实践中发现常数 $\lambda$ 效果良好。

**算法 1**　基于 Euler 采样器的迭代受损轨迹匹配（ICTM）

**输入**：测量 $y$、矩阵 $\mathbf A$、预训练流模型 $\theta$、NFE $N$、插值系数 $\{\alpha_t\}_t$ 与 $\{\beta_t\}_t$、步长 $\eta$、引导权重 $\lambda$、迭代次数 $K$。
**输出**：恢复的干净图像 $x_1$。
1: 初始化 $\epsilon\sim\mathcal N(0,\mathbf I)$，$x_0\leftarrow\epsilon$，$t\leftarrow0$，$\Delta t\leftarrow1/N$；
2: 对 $s\in(0,1)$ 生成辅助路径 $y_s=\alpha_sy+\beta_s(\mathbf Ax_0)$；
3: **while** $t<1$ **do**
4: 　$x_{t+\Delta t}\leftarrow x_t+v_\theta(x_t,t)\Delta t$；
5: 　**if** $t=0$ **then**
6: 　　**for** $k=1,\cdots,K$ **do**
7: 　　　$x_t\leftarrow x_t-\eta\nabla_{x_t}\left[\lambda\left\|\mathcal A(x_{t+\Delta t}(x_t))-y_{t+\Delta t}\right\|^2+\frac12\|x_t\|^2+\operatorname{tr}\left(\frac{\partial v_\theta(x_t,t)}{\partial x}\right)\Delta t\right]$；
8: 　　**end for**
9: 　**else**
10: 　　**for** $k=1,\cdots,K$ **do**
11: 　　　# 用式（11）获得 $\log p(x_t)$ 的梯度
12: 　　　$x_t\leftarrow x_t-\eta\nabla_{x_t}\left[\lambda\left\|\mathcal A(x_{t+\Delta t}(x_t))-y_{t+\Delta t}\right\|^2-\log p(x_t)+\operatorname{tr}\left(\frac{\partial v_\theta(x_t,t)}{\partial x}\right)\Delta t\right]$；
13: 　　**end for**
14: 　**end if**
15: 　$x_{t+\Delta t}\leftarrow x_t+v_\theta(x_t,t)\Delta t$；
16: 　$t\leftarrow t+\Delta t$；
17: **end while**
18: 返回 $x_1$。

**图 1**：ICTM 思想示意（受损轨迹 $u_t:=\mathcal A(x_t)$ 遵循受损流 ODE $\mathrm du_t=\mathcal A(v_\theta(x_t,t))\mathrm dt$；辅助路径在测量 $y$ 与 $\mathcal A(x_0)$ 之间插值）。

### 3.3 玩具示例验证

我们以实验验证 ICTM 找到的重建接近最优 MAP 解——在一个 MAP 解可闭式求得的简化去噪问题中。具体地，用 FFHQ 数据集的 1,000 个样本拟合高斯分布 $\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)$。考虑去噪问题 $y=x+\epsilon$，其中 $x\sim\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)$、$\epsilon\sim\mathcal N(0,\sigma_y^2\mathbf I)$。此时 MAP 估计问题（式（2））的解析解为 $x^\ast=(\boldsymbol\Sigma^{-1}+\sigma_y^{-2}\mathbf I)^{-1}(\boldsymbol\Sigma^{-1}\boldsymbol\mu+\sigma_y^{-2}y)$。取 $\sigma_y=0.1$，在来自真实高斯分布的 10,000 个样本上训练基于流的模型，并在图 2 中展示 ICTM 找到的重建与闭式 MAP 解 $x^\ast$ 的偏差。可以看到，ICTM 在许多样本上都能获得对 MAP 解的忠实估计。

**图 2**：把 1,000 张 FFHQ 人脸建模为高斯分布的玩具示例结果。(a) 本文方法的定性结果；(b) 本文结果与真实 MAP 之差的直方图；(c) MSE 随 NFE 的变化。

## 4 实验

实验设置中采用最优传输插值系数，即 $\alpha_t=t$、$\beta_t=1-t$。我们在自然图像与医学图像数据集上测试算法。对自然图像，使用官方 Rectified Flow 仓库³ 的预训练检查点，并在 CelebA-HQ 数据集 [31], [24] 上评估。我们处理四个常见线性逆问题：超分辨、随机掩膜修复、高斯去模糊与盒式掩膜修复。医学应用方面，我们在 Human Connectome Project（HCP）数据集 [50] 上从头训练基于流的模型，并专门测试不同压缩率下的压缩感知。由于算法关注生成图像的重建忠实度，采用 PSNR 与 SSIM [53] 作为评价指标。

**基线**：与五个基线比较。1）**OT-ODE** [37]：据我们所知，这是唯一把基于流的模型用于逆问题的基线；它在每个采样步基于条件最优传输（OT）路径加入先验梯度校正。为公平比较，我们遵循其对算法 1 的实现，并在附录 E.3 给出初始化时间 $t'$ 的详细消融。2）**DPS-ODE**：受 DPS [10] 启发，把速度场替换为条件速度场，即 $v(x_t\mid y)=v(x_t)+\zeta_t\nabla_{x_t}\log p(y\mid\hat x_1(x_t))$，其中 $\zeta_t$ 为待调超参数；按 DPS 的超参数指导，我们在附录 E.3 给出 $\zeta_t$ 的详细消融。3）**Ours without local prior**：为检验局部先验项在优化算法中的有效性，去掉式（10）所定义的局部先验项。在自然图像实验中，除基于流的基线外，还纳入两个有代表性的基于扩散的基线：4）**RED-Diff** [33]，一种基于变分贝叶斯的方法；5）**ΠGDM** [46]，一种先进的基于 MCMC 的方法。我们还注意到一项并行工作 **D-Flow** [2]：它在其式 9 中把 MAP 表述为约束优化问题；如其第 3.4 节所记载，恢复每张图像需 5—10 分钟，因为其每个优化步都需穿越 ODE 求解器反向传播以计算完整对数似然。相比之下，本文方法因有原则的局部 MAP 近似而显著更快（每张图像约 1.6 分钟），详见附录 D。

### 4.1 自然图像

**实验设置**：使用 CelebA-HQ 验证集的 100 张 256×256 图像评估算法，并把所有图像归一化到 $[0,1]$ 区间以做定量分析。所有实验加入高斯测量噪声，$\sigma_y=0.01$。处理的线性逆问题为：(1) 4× 双三次下采样超分辨；(2) 覆盖 70% 缺失值的随机掩膜修复；(3) 61×61 核、标准差 3.0 的高斯去模糊；(4) 居中 128×128 掩膜的盒式修复。

我们在表 1 与图 3 中分别给出所有方法的定量与定性结果。表 1 中，本文方法在所有任务上均优于其他基线；对高斯去模糊与盒式修复等更具挑战的任务，本文方法在 SSIM 上显著优于其他方法。基于 MAP 框架，如图 3 所示，本文方法偏好更忠实、无伪影的重建，而其他方法则以感知质量作权衡。需指出感知质量与恢复忠实度之间存在不可避免的权衡 [3]；总体而言，本文方法呈现更高的精细度。本文方法与"ours (w/o prior)"的对比表明，局部先验项通过同时提升 PSNR 与 SSIM 有效提高了重建精度。

### 4.2 医学应用

**HCP T2w 数据集**：使用公开可得的 Human Connectome Project（HCP）[50] T2 加权（T2w）图像数据集做压缩感知任务，该数据集含 47 位患者的脑部图像，HCP 数据集包含在不同层面与角度拍摄的脑部横截面图像。

**压缩感知**：在 10,000 张随机采样图像上从头训练基于流的模型，采用 ncsnpp 架构 [48] 并针对灰度图像做少量改动。采用压缩率 $\nu\in\{1/2,1/4,1/10\}$，即 $m=\nu n$。测量算子为子采样傅里叶矩阵，其符号图样随机选取。我们在 200 张随机采样的测试图像上评估重建算法。

我们在表 2 与图 4 中分别给出压缩感知的定量与定性结果。除基于流的方法外，还纳入两种经典恢复算法——Wavelet [11], [32] 与 TV [22] 先验的结果。如表 2 所示，本文方法在不同压缩率 $\nu$ 下均优于经典恢复算法与其他基于流的基线，证明本方法处理挑战性场景的能力以及把现代生成模型用作先验的优势。图 4 中，本文方法的重建更忠实于原图、伪影更少，从而精度更高、细节更清晰。

### 4.3 消融研究

我们使用 Adam 优化器 [26] 做优化步，因其在神经网络计算中有效；所有任务使用 $N=100$ 步。

**步长 $\eta$ 与引导权重 $\lambda$**：Adam 优化器的使用使超参数选择（尤其步长 $\eta$ 与引导权重 $\lambda$）在多种任务间保持相对一致，如图 5 所示。具体地，从 SSIM 看，$\eta=10^{-2}$ 对修复（随机）、修复（盒式）与超分辨最优；从 PSNR 看，高斯去模糊在 $\eta=10^{-2}$ 时也达到最优。因此所有任务采用 $\eta=10^{-2}$。基于图 5 右侧两幅子图的结果，我们为高斯去模糊选 $\lambda=10^3$、为其他任务选 $\lambda=10^4$。该一致性也延伸到压缩感知实验：医学图像相关实验均取 $\lambda=10^3$、$\eta=10^{-2}$。

**迭代次数 $K$**：图 6 给出不同任务上迭代次数 $K$ 的消融结果。我们关注超分辨与压缩感知中 $K$ 的行为，因为 $K$ 在其他三个任务中的表现与超分辨类似。在超分辨的最优 $\eta$ 与 $\lambda$（即 $\eta=10^{-2}$、$\lambda=10^3$）下，$K=1$ 在 CelebA-HQ 上即取得优越性能；减小步长（如 $\eta=10^{-3}$）可随 $K$ 增大而改善性能，但无法超过 $K=1$ 时最优参数所达到的性能。然而对压缩感知，必须增大 $K$ 才能取得最佳性能，故所有压缩感知实验取 $K=10$。我们推测压缩感知算子的复杂度直接决定取得最优性能所需的迭代次数。

## 5 结论

本文提出一种新颖的迭代算法，以流先验求解线性逆问题。针对流匹配模型固有的对数似然计算缓慢这一计算挑战，我们的方法利用 MAP 目标到多个"局部 MAP"目标的分解；该分解结合 Tweedie 公式，使得通过梯度步进行有效的顺序优化成为可能。方法在自然与科学图像上的多种线性逆问题（超分辨、去模糊、修复与压缩感知）中得到严格验证；经验结果表明，本算法一致优于基于流匹配的现有技术，凸显其作为高分辨率图像合成及相关下游任务强有力工具的潜力。

## 6 局限性与未来工作

尽管算法已展现有前景的结果，仍存在若干局限，提示未来研究方向。第一，我们的理论框架建立在最优传输插值路径之上，目前有局限，无法应用于高斯分布与数据分布之间的一般插值。其次，为拓宽流先验在逆问题中的适用性，将方法推广到处理非线性前向模型很重要。此外，算法目前缺乏量化生成图像不确定性的能力，而这一方面对许多科学应用至关重要；考虑对解做后处理以理解重建固有不确定性将是有趣的方向。这些局限凸显了增强方法鲁棒性与适用性的重要未来工作方向。

**致谢**：本工作部分受 NSF DMS-2015577、NSF DMS-2415226 与 Amazon 的捐赠基金支持。我们感谢匿名审稿人的反馈与建议，它们帮助提升了论文质量。

**图 3**：CelebA-HQ 数据集上的定性比较结果（(a) 超分辨、(b) 随机修复、(c) 高斯去模糊、(d) 盒式修复；本文方法的重建更忠实地贴合真值并呈现更高的精细度）。
**图 4**：压缩感知的定性比较结果（本文方法产生更忠实、伪影更少的重建，细节的精度与清晰度更高）。
**图 5**：步长 $\eta$ 与引导权重 $\lambda$ 的消融结果（CelebA-HQ 上所有实验取 $\eta=10^{-2}$；高斯去模糊取 $\lambda=10^3$，其他任务取 $\lambda=10^4$）。
## 附录

### A 证明

证明之前先给出三个引理。

**引理 1**：考虑向量值函数 $f:[0,1]\to\mathbb R^n$。则对任意 $t\in[0,1]$，有

$$
\left\|\int_0^tf(s)\mathrm ds\right\|^2\le\int_0^t\|f(s)\|^2\mathrm ds.
$$

**证明**：对每个 $s\in[0,1]$，令 $f_i(s)\in\mathbb R$ 为 $f(s)$ 的第 $i$ 个分量。由 Jensen 不等式（对任意凸函数 $g:\mathbb R\to\mathbb R$ 与可积函数 $h:[0,1]\to\mathbb R$，有 $g\left(\int_a^bh(t)\mathrm dt\right)\le\int_a^bg(h(t))\mathrm dt$），利用 $t\mapsto t^2$ 的凸性可得

$$
\left\|\int_0^tf(s)\mathrm ds\right\|^2=\sum_{i=1}^{n}\left(\int_0^tf_i(s)\mathrm ds\right)^2\le\sum_{i=1}^{n}\int_0^tf_i(s)^2\mathrm ds=\int_0^t\sum_{i=1}^{n}f_i(s)^2\mathrm ds=\int_0^t\|f(s)\|^2\mathrm ds.
$$

**引理 2（Tweedie 公式 [12]）**：若 $\mu\sim g(\cdot)$、$z\mid\mu\sim\mathcal N(\alpha\mu,\sigma^2\mathbf I)$，从而 $z\sim f(\cdot)$，则

$$
\mathbb E[\mu\mid z]=\frac{1}{\alpha}\left[z+\sigma^2\nabla_z\log f(z)\right].\tag{12}
$$

**引理 3**：假设 $y=\mathcal A(x^\ast)+\epsilon$，其中 $x^\ast=x_1(x_0)$、$x_0$ 为式（9）的解，$\mathcal A:\mathbb R^n\to\mathbb R^m$ 线性，$\epsilon\sim\mathcal N(0,\sigma_y^2\mathbf I)$，且 $x_t$ 对任意 $t\in[0,1]$ 精确遵循路径 $x_t=\alpha_tx+\beta_tx_0$。则

$$
p(y_t\mid x_t)=\mathcal N\left(\mathcal Ax_t,\alpha_t^2\sigma_y^2\mathbf I\right),\tag{13}
$$

从而

$$
\log p(y\mid x(x_0))=\log p(y_t\mid x_t)+\frac{m}{2}\log\left(\alpha_t^2\right),\qquad\forall t.\tag{14}
$$

**证明**：由辅助路径 $y_t=\alpha_ty+\beta_t\mathcal Ax_0$ 与假设 $\mathcal A(x_t)=\mathcal A(\alpha_tx+\beta_tx_0)=\alpha_t\mathcal A(x(x_0))+\beta_t\mathcal Ax_0$，两式相减得 $y_t-\mathcal A(x_t)=\alpha_t(y-\mathcal A(x(x_0)))$。因 $y\mid x(x_0)\sim\mathcal N(\mathcal Ax,\sigma_y^2\mathbf I)$，有 $y_t\mid x_t\sim\mathcal N(\mathcal Ax_t,\alpha_t^2\sigma_y^2\mathbf I)$，式（13）得证。再考察对数概率：

$$
\log p(y_t\mid x_t)=-\frac{\|y_t-\mathcal Ax_t\|^2}{2\alpha_t^2\sigma_y^2}-\frac{m}{2}\log\left(2\pi\alpha_t^2\sigma_y^2\right)\tag{15}
$$
$$
=-\frac{\left\|\alpha_t(y-\mathcal A(x(x_0)))\right\|^2}{2\alpha_t^2\sigma_y^2}-\frac{m}{2}\log\left(2\pi\alpha_t^2\sigma_y^2\right)\tag{16}
$$
$$
=-\frac{\|y-\mathcal A(x(x_0))\|^2}{2\sigma_y^2}-\frac{m}{2}\log\left(2\pi\sigma_y^2\right)-\frac{m}{2}\log\left(\alpha_t^2\right):=\log p(y\mid x(x_0))-\frac{m}{2}\log\left(\alpha_t^2\right),\tag{17}
$$

即式（14），证毕。

#### A.1 命题 1 的证明

由式（5）训练得到的最优速度场为

$$
v_\theta(x_t,t)=\mathbb E\left(\dot\alpha_tx_1+\dot\beta_tx_0\mid x_t\right)\tag{20}
$$
$$
=\mathbb E\left(\dot\alpha_tx_1+\dot\beta_t\frac{x_t-\alpha_tx}{\beta_t}\mid x_t\right)\qquad\left(\text{给定 }x_t,\ x_0=\frac{x_t-\alpha_tx}{\beta_t}\right)\tag{21}
$$
$$
=\left(\dot\alpha_t-\dot\beta_t\frac{\alpha_t}{\beta_t}\right)\mathbb E(x_1\mid x_t)+\frac{\dot\beta_t}{\beta_t}x_t\tag{22}
$$
$$
=\left(\dot\alpha_t-\dot\beta_t\frac{\alpha_t}{\beta_t}\right)\left[\frac{1}{\alpha_t}\left(x_t+\beta_t^2\nabla_{x_t}\log p(x_t)\right)\right]+\frac{\dot\beta_t}{\beta_t}x_t\qquad\text{（引理 2，Tweedie 公式）}\tag{23}
$$

定义信噪比 $\lambda_t=\alpha_t/\beta_t$ 并重新整理上式，即得式（11）。当 $\alpha_t=t$、$\beta_t=1-t$ 时，上式变为

$$
\nabla_{x_t}\log p(x_t)=\frac{1}{1-t}\left(-x_t+tv_\theta(x_t,t)\right).\tag{25}
$$

#### A.2 定理 1 的证明

证明前先指出 $\lim_{\Delta t\to0}\sum_{i=1}^{N}\gamma_i=1$。定义时间步 $t=(i-1)\Delta t$；反之 $i=1+t/\Delta t$ 是 $t$ 的函数。在此意义下，定义积分 $-\int_0^1\operatorname{tr}\left(\frac{\partial v_\theta(x_t,t)}{\partial x}\right)\mathrm dt$ 的第 $i$ 步黎曼离散为 $\Delta p_i=-\operatorname{tr}\left(\frac{\partial v_\theta(x_t,t)}{\partial x}\right)\Delta t$。首先把全局 MAP 目标分解为 $\log p(x(x_0)\mid y)=\log p(x_0)-\int_0^1\operatorname{tr}\left(\frac{\partial v_\theta}{\partial x}\right)\mathrm dt+\log p(y\mid x(x_0))$（由式（8）与贝叶斯公式），再对积分项与数据项分别做上述离散化，并按 $\gamma_i$ 加权求和；利用引理 1 控制的离散误差、引理 3 的局部似然表达式与速度场 Jacobian 迹的一致有界性（常数 $C_1$），证明当 $\Delta t\to0$（$N\to\infty$）时该加权和与真实目标之差趋于零，从而得到定理 1 的极限等式（完整代数推导见原文）。

### B 轨迹的符合度

本节分析定理 1 中"轨迹精确遵循预定义插值路径"的假设。我们引入**符合度度量**

$$
S_{\alpha,\beta}(\{z_t\})=\int_0^1\mathbb E_{p(z_0),p(z_1)}\left\|v_\theta(z_s,s)-\left(\dot\alpha_sz_1+\dot\beta_sz_0\right)\right\|^2\mathrm ds,\tag{45}
$$

并注意 $S_{\alpha,\beta}(\{z_t\})=0$ 等价于 $v_\theta(z_t,t)=c$（常数）几乎处处成立，这保证 $z_1=z_0+c$；此时以 $x_0$ 为起点、经 ODE 求解器生成轨迹到端点 $x_t$ 时，对一切 $t$ 有 $x_t=\alpha_tx+\beta_tx_0$。当 $S_{\alpha,\beta}(\{z_t\})\ne0$ 时，我们在命题 2 中证明可用该符合度度量界定轨迹相对插值路径的偏差；特别地，对 Rectified Flow 可得到额外界：使用 $L$-Rectified Flow 时，学习轨迹与直线轨迹的偏差被 $O(1/L)$ 界定。

**命题 2**：考虑由 $\alpha:=\{\alpha_t\}$ 与 $\beta:=\{\beta_t\}$ 指定的可微插值路径。则学习轨迹 $z_t=z_0+\int_0^tv_\theta(z_s,s)\mathrm ds$ 与预定义轨迹 $\hat z_t=z_0+\int_0^t\left(\dot\alpha_sz_1+\dot\beta_sz_0\right)\mathrm ds$ 之间的期望距离可界定为

$$
\mathbb E_{p(z_0),p(z_1)}\left[\|\hat z_t-z_t\|^2\right]\le S_{\alpha,\beta}(\{z_t\}).\tag{46}
$$

若可微过程 $\{z_t\}$ 由 $L$-Rectified Flow 指定，且对一切 $t\in[0,1]$ 有 $\alpha_t=t$、$\beta_t=1-t$，则另有

$$
\mathbb E_{p(z_0),p(z_1)}\left[\|\hat z_t-z_t\|^2\right]\le O\left(\frac{1}{L}\right).\tag{47}
$$

**证明**：在时刻 $t$，关注真实轨迹 $z_t$ 与偏好轨迹 $\hat z_t$ 的距离。由引理 1，距离可界定为

$$
\|\hat z_t-z_t\|^2=\left\|\int_0^t\left[v_\theta(z_s,s)-\left(\dot\alpha_sz_1-\dot\beta_sz_0\right)\right]\mathrm ds\right\|^2\tag{48}
$$
$$
\le\int_0^t\left\|v_\theta(z_s,s)-\left(\dot\alpha_sz_1-\dot\beta_sz_0\right)\right\|^2\mathrm ds.\tag{49}
$$

于是

$$
\mathbb E_{p(z_0),p(z_1)}\|\hat z_t-z_t\|^2\le\mathbb E_{p(z_0),p(z_1)}\left[\int_0^t\left\|v_\theta(z_s,s)-\left(\dot\alpha_sz_1-\dot\beta_sz_0\right)\right\|^2\mathrm ds\right]\tag{50}
$$
$$
=\int_0^t\mathbb E_{p(z_0),p(z_1)}\left\|v_\theta(z_s,s)-\left(\dot\alpha_sz_1-\dot\beta_sz_0\right)\right\|^2\mathrm ds\tag{51}
$$
$$
\le\int_0^1\mathbb E_{p(z_0),p(z_1)}\left\|v_\theta(z_s,s)-\left(\dot\alpha_sz_1-\dot\beta_sz_0\right)\right\|^2\mathrm ds:=S_{\alpha,\beta}(\{z\}).\tag{52}
$$

若 $\{z_t,t\in[0,1]\}$ 是学习到的 $L$-rectified flow（本情形 $\alpha_t=t$、$\beta_t=1-t$），则由 [29] 的定理 3.7 有 $S_{\alpha,\beta}(\{z\})=O(1/L)$，故

$$
\mathbb E_{p(z_0),p(z_1)}\|\hat z_t-z_t\|^2=O(1/L).\tag{54}
$$

经验上，[30], [29] 发现 $L=2$ 即可为高质量单步生成产生近乎直的轨迹；因此尽管该结果给出的是简单上界，实践中轨迹对预定义插值路径的符合度可能比该结果所暗示的更高。

### C 附加结果

**C.1 附加消融**——**迭代步数 $K$**：图 7 给出 $K$ 在 SSIM 上的附加消融结果。**NFE $N$**：先参见图 2(c) 在玩具示例上对 $N$ 的初步消融；随后给出超分辨任务中不同 $N$ 的 PSNR 与 SSIM，发现 $N=100$ 是时间与性能之间的最佳折中，结果见图 8。

### D 计算效率

表 3 给出计算效率比较结果。注意 OT-ODE 最慢，因为它在每次更新时都需对矩阵 $r_t^2\mathbf A\mathbf A^T+\sigma_y^2\mathbf I$ 求逆；本文方法需对 Jacobian 矩阵的估计迹求梯度，这使计算变慢。

### E 实现细节

实验在基于 Linux、CUDA 12.2 的系统中进行，配备 4 块 Nvidia R9000 GPU（每块 48GB 显存）。**算子**：CelebA-HQ 上的所有实验使用 [10] 的算子；压缩感知的所有实验使用 [14] 官方仓库中定义的 `CompressedSensingOperator`。**评价指标**由不同 Python 包实现：PSNR 用基本 PyTorch 运算计算，SSIM 用 `pytorch_msssim` 包计算。

**E.1 玩具示例**：流程从 1,000 张 1024×1024 分辨率的 FFHQ 图像开始，用双三次缩放降至 16×16；对降采样图像拟合高斯混合模型，得到均值与协方差参数；把均值从 $[0,1]$ 变换到 $[-1,1]$；随后从该分布生成 10,000 个样本，用于训练一个类似 CIFAR10 DDPM++ 架构的基于分数的模型。训练过程 10,000 次迭代、批大小 64，使用 Adam 优化器 [26]，学习率 $2\times10^{-4}$、预热 100 步；值得注意的是约 200 步即收敛。最后，批大小 128 时估计对数似然计算约需 4 分 30 秒。图 9 给出训练模型生成的未整理样本。

**E.2 医学应用**：该设置中 $\sigma_y=0.001$。使用 ncsnpp 架构，在 10k 图像上从头训练 100k 次迭代、批大小 50，学习率 $1\times10^{-2}$；训练过程中出现突然收敛。我们使用 2000 步预热；未整理的生成图像见图 10。

**E.3 基线实现**——**OT-ODE**：由于 OT-ODE [37] 未发布代码与预训练检查点，我们用与 [29] 相同的架构复现其方法。我们遵循其设置，并发现初始化时间 $t'$ 对性能影响很大；采用其论文中的 $y$ 初始化方法，即起点为

$$
x_{t'}=t'y+(1-t')\epsilon,\qquad\epsilon\sim\mathcal N(0,\mathbf I),\tag{55}
$$

其中 $t'$ 为初始化时间。注意超分辨任务中我们先用双三次上采样 $y$。我们遵循论文指导，并在图 11、图 12 中给出消融结果。**DPS-ODE**：每一步使用如下公式更新流：$v(x_t,y)=v(x_t)+\zeta_t\left(-\nabla_{x_t}\|y-\mathcal A\hat x_1\|^2\right)$，其中 $\zeta_t$ 为待调步长。我们参照 DPS 选取 $\zeta_t$ 的方法，置 $\zeta_t=\frac{\eta}{2\|y-\mathcal A\hat x_1(x_t)\|}$；该基线 $\eta$ 的消融见图 13、图 14。注意盒式修复任务的 PSNR 与 SSIM 有显著波动；我们观察到 $\eta\ge100$ 时易出现伪影，故选择 $\eta=75$ 以获得最佳折中。**RED-Diff 与 ΠGDM**：使用 Nvidia 的官方仓库⁵，配合 OpenAI guided diffusion 仓库⁶ 架构的 CelebA-HQ 预训练检查点复现 RED-Diff 与 ΠGDM。对 RED-Diff，优化目标为 $\min_{\boldsymbol\mu}\|y-\mathcal A(\boldsymbol\mu)\|^2+\lambda(\mathrm{sg}(\epsilon_\theta(x_t,t)-\epsilon))^T\boldsymbol\mu$；按原论文实现，所有任务使用 Adam 优化器 1000 步，超分辨、随机修复与盒式修复取学习率 $\mathrm{lr}=0.25$、$\lambda=0.25$，去模糊取 $\mathrm{lr}=0.5$、$\lambda=0.25$（依原论文推荐）。对 ΠGDM，遵循原论文使用 100 个扩散步，取 $\eta=1.0$（对应 VE-SDE）；若有指标提升则使用自适应权重 $r_t^2=\frac{\sigma_{1-t}^2}{1+\sigma_t^2}$。**Wavelet 与 TV 先验**：使用 PyTorch 包 DeepInverse⁷ 实现 Wavelet 与 TV 先验；两者均用默认的近端梯度下降（PGD）算法，并对正则权重 $\lambda\in\{100,10^{-1},10^{-2},10^{-3},10^{-4}\}$ 与梯度步长 $\eta\in\{10^1,10^0,10^{-1},10^{-2},10^{-3},10^{-4}\}$ 做网格搜索；最大迭代数在压缩率 $\nu=1/2$、$1/4$、$1/10$ 时分别为 3k、5k、10k；停止准则为残差范数 $\frac{\|x_{t-1}-x_t\|}{\|x_{t-1}\|}\le1\times10^{-5}$，算法初始化为反投影重建（即 $\mathbf A$ 对测量 $y$ 的伪逆）。对 TV 先验，目标为 $\min_x\frac12\|\mathbf Ax-y\|_2^2+\lambda\|x\|_{\mathrm{TV}}$，发现所有 $\nu$ 下最优超参数组合为 $\lambda=0.01$、$\eta=0.1$；对 Wavelet 先验，目标为 $\min_x\frac12\|\mathbf Ax-y\|_2^2+\lambda\|\Psi x\|_1$，使用默认小波变换层数与“db8”小波，最优组合为 $\lambda=0.1$、$\eta=0.1$。

## 表格

**表 1　CelebA-HQ 数据集上 PSNR 与 SSIM 的定量比较结果**（按原表逐格转录；本文算法在所有任务上优于其他基线；最佳值为蓝色高亮、次佳带下划线，Markdown 中以加粗表示最佳）

| 方法 | 超分辨 PSNR | 超分辨 SSIM | 随机修复 PSNR | 随机修复 SSIM | 高斯去模糊 PSNR | 高斯去模糊 SSIM | 盒式修复 PSNR | 盒式修复 SSIM |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OT-ODE | 27.46 | 0.775 | 28.57 | 0.838 | 26.28 | 0.727 | 19.80 | 0.795 |
| DPS-ODE | 27.85 | 0.791 | 29.57 | 0.872 | 25.97 | 0.704 | 23.59 | 0.758 |
| RED-Diff | 27.20 | 0.760 | 25.13 | 0.711 | 27.23 | 0.765 | 17.50 | 0.651 |
| ΠGDM | 28.33 | 0.803 | 29.98 | 0.858 | 24.30 | 0.583 | 24.10 | 0.853 |
| Ours（w/o prior） | 26.06 | 0.724 | 29.01 | 0.835 | 25.13 | 0.676 | 22.42 | 0.803 |
| **Ours** | 27.91 | **0.805** | **30.65** | **0.894** | 26.54 | **0.760** | **24.34** | **0.866** |

**表 2　HCP T2w 数据集上不同压缩率 $\nu$ 的压缩感知结果**（按原表逐格转录；压缩感知因前向算子更复杂而更具挑战，OT-ODE 表现差即为例证——它假设给定 $x_t$ 时测量 $y$ 服从高斯分布）

| 方法 | $\nu=1/2$ PSNR | $\nu=1/2$ SSIM | $\nu=1/4$ PSNR | $\nu=1/4$ SSIM | $\nu=1/10$ PSNR | $\nu=1/10$ SSIM |
| --- | --- | --- | --- | --- | --- | --- |
| Wavelet 先验 | 18.02 ± 1.38 | 0.495 ± 0.02 | 11.99 ± 1.34 | 0.230 ± 0.02 | 7.37 ± 1.85 | 0.090 ± 0.02 |
| TV 先验 | 25.36 ± 2.79 | 0.657 ± 0.04 | 18.70 ± 2.36 | 0.496 ± 0.03 | 14.38 ± 3.04 | 0.309 ± 0.04 |
| OT-ODE | 18.71 ± 1.02 | 0.422 ± 0.17 | 18.16 ± 1.06 | 0.271 ± 0.07 | 12.21 ± 1.43 | 0.096 ± 0.04 |
| DPS-ODE | 31.06 ± 3.91 | 0.765 ± 0.08 | 25.01 ± 1.87 | 0.608 ± 0.08 | 22.06 ± 1.66 | 0.479 ± 0.09 |
| **Ours** | **32.72 ± 1.53** | **0.878 ± 0.05** | **27.03 ± 1.77** | **0.733 ± 0.04** | **24.03 ± 1.23** | **0.503 ± 0.04** |

**表 3　计算时间比较**（按原表逐格转录；比较在单 GPU 上恢复 100 张图像所需时间，超分辨任务）

| 方法 | DPS-ODE | OT-ODE | Ours（w/o prior） | Ours |
| --- | --- | --- | --- | --- |
| 时间（小时） | 0.36 | 4.10 | 0.83 | 2.72 |

## 图注与表注

**图 1**：ICTM 思想示意（受损轨迹 $u_t=\mathcal A(x_t)$ 遵循受损流 ODE）。
**图 2**：1,000 张 FFHQ 人脸建模为高斯分布的玩具示例（(a) 定性结果；(b) 与真实 MAP 之差的直方图；(c) MSE 随 NFE 变化）。
**图 3**：CelebA-HQ 定性比较（(a) 超分辨、(b) 随机修复、(c) 高斯去模糊、(d) 盒式修复）。
**图 4**：压缩感知定性比较。
**图 5**：步长 $\eta$ 与引导权重 $\lambda$ 的消融。
**图 6**：不同任务上迭代次数 $K$ 的消融。
**图 7**：不同任务上 $K$ 在 SSIM 上的消融。
**图 8**：超分辨任务上 NFE $N$ 的消融。
**图 9**：在 10,000 个高斯样本上训练所得流的生成样本。
**图 10**：在 10,000 张 HCP T2w 图像上训练所得流的生成样本。
**图 11**：OT-ODE 在 CelebA-HQ 上的初始化时间 $t'$ 选择结果（超分辨、随机修复、高斯去模糊、盒式修复分别取 $t'=0.2,0.1,0.2,0.2$）。
**图 12**：OT-ODE 在 HCP T2w 数据集上的 $t'$ 选择结果（所有实验取 $t'=0.1$）。
**图 13**：DPS-ODE 的超参数 $\eta$ 选择结果（超分辨、随机修复、高斯去模糊、盒式修复分别取 $\eta=1000,750,200,75$）。
**图 14**：DPS-ODE 在 HCP T2w 数据集上的 $\eta$ 选择结果（所有实验取 $\eta=200$）。

**表注**：表 1—3 均按原表逐格转录；表 1 原始配色（蓝色最佳、下划线次佳）在 Markdown 中以加粗表示最佳值；表 3 为计算时间（小时）。

## 参考文献

> 以下按原文编号 [1]—[60] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的连字与断行伪影已按常规写法整理，书目内容未改动。

[1] Muhammad Asim, Max Daniels, Oscar Leong, Ali Ahmed, and Paul Hand. Invertible generative models for inverse problems: mitigating representation error and dataset bias. Proceedings of the 37th International Conference on Machine Learning, 2020.

[2] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-flow: Differentiating through flows for controlled generation. In Forty-first International Conference on Machine Learning, 2024.

[3] Yochai Blau and Tomer Michaeli. The perception-distortion tradeoff. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 6228–6237, 2018.

[4] Ashish Bora, Ajil Jalal, Eric Price, and Alexandros Dimakis. Compressed sensing using generative models. International Conference on Machine Learning, 2017.

[5] Steve Brooks, Andrew Gelman, Galin Jones, and Xiao-Li Meng. Handbook of markov chain monte carlo. CRC press, 2011.

[6] Martin Burger and Felix Lucka. Maximum a posteriori estimates in linear inverse problems with log-concave priors are proper bayes estimators. Inverse Problems, 30(11):114004, 2014.

[7] Thorsten M Buzug. Computed tomography. In Springer handbook of medical technology, pages 311–342. Springer, 2011.

[8] Yingshan Chang, Yasi Zhang, Zhiyuan Fang, Yingnian Wu, Yonatan Bisk, and Feng Gao. Skews in the phenomenon space hinder generalization in text-to-image generation. arXiv preprint arXiv:2403.16394, 2024.

[9] Ricky T. Q. Chen, Yulia Rubanova, Jesse Bettencourt, and David K Duvenaud. Neural ordinary differential equations. In S. Bengio, H. Wallach, H. Larochelle, K. Grauman, N. Cesa-Bianchi, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 31. Curran Associates, Inc., 2018.

[10] Hyungjin Chung, Jeongsol Kim, Michael T Mccann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, ICLR 2023, 2023.

[11] David L Donoho. Compressed sensing. IEEE Transactions on information theory, 52(4):1289–1306, 2006.

[12] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.

[13] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, et al. Scaling rectified flow transformers for high-resolution image synthesis. arXiv preprint arXiv:2403.03206, 2024.

[14] Zhenghan Fang, Sam Buchanan, and Jeremias Sulam. What's in a prior? learned proximal networks for inverse problems. In International Conference on Learning Representations, 2024.

[15] Berthy Feng and Katherine Bouman. Variational bayesian imaging with an efficient surrogate score-based prior. Transactions on Machine Learning Research, 2024.

[16] Berthy T Feng, Jamie Smith, Michael Rubinstein, Huiwen Chang, Katherine L Bouman, and William T Freeman. Score-based diffusion models as principled priors for inverse imaging. In International Conference on Computer Vision (ICCV). IEEE, 2023.

[17] Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, and Yoshua Bengio. Generative adversarial networks. Communications of the ACM, 63(11):139–144, 2020.

[18] Will Grathwohl, Ricky T. Q. Chen, Jesse Bettencourt, Ilya Sutskever, and David Duvenaud. Ffjord: Free-form continuous dynamics for scalable reversible generative models. In International Conference on Learning Representations, 2019.

[19] Tapio Helin and Martin Burger. Maximum a posteriori probability estimates in infinite-dimensional bayesian inverse problems. Inverse Problems, 31(8):085009, 2015.

[20] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[21] Michael F Hutchinson. A stochastic estimator of the trace of the influence matrix for laplacian smoothing splines. Communications in Statistics-Simulation and Computation, 18(3):1059–1076, 1989.

[22] Leonid I. Rudin, Stanley Osher, and Emad Fatemi. Nonlinear total variation based noise removal algorithms. Physica D: Nonlinear Phenomena, 60:259–268, 1992.

[23] Peter A Jansson. Deconvolution of images and spectra. Courier Corporation, 2014.

[24] Tero Karras, Timo Aila, Samuli Laine, and Jaakko Lehtinen. Progressive growing of gans for improved quality, stability, and variation. arXiv preprint arXiv:1710.10196, 2017.

[25] Diederik Kingma and Ruiqi Gao. Understanding diffusion objectives as the elbo with simple data augmentation. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems, volume 36, pages 65484–65516. Curran Associates, Inc., 2023.

[26] Diederik P Kingma and Jimmy Ba. Adam: A method for stochastic optimization. arXiv preprint arXiv:1412.6980, 2014.

[27] Diederik P Kingma and Max Welling. Auto-encoding variational bayes. arXiv preprint arXiv:1312.6114, 2013.

[28] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations, 2022.

[29] Xingchao Liu, Chengyue Gong, et al. Flow straight and fast: Learning to generate and transfer data with rectified flow. In The Eleventh International Conference on Learning Representations, 2022.

[30] Xingchao Liu, Xiwen Zhang, Jianzhu Ma, Jian Peng, and Qiang Liu. Instaflow: One step is enough for high-quality diffusion-based text-to-image generation. In International Conference on Learning Representations, 2024.

[31] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In Proceedings of the IEEE international conference on computer vision, pages 3730–3738, 2015.

[32] Michael Lustig, David L. Donoho, Juan M. Santos, and John M. Pauly. Compressed sensing mri. IEEE Signal Processing Magazine, 25(2):72–82, 2008.

[33] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In The Twelfth International Conference on Learning Representations, 2024.

[34] Sachit Menon, Alex Damian, McCourt Hu, Nikhil Ravi, and Cynthia Rudin. Pulse: Self-supervised photo upsampling via latent space exploration of generative models. In The IEEE Conference on Computer Vision and Pattern Recognition (CVPR), June 2020.

[35] Guust Nolet. A breviary of seismic tomography. A breviary of seismic tomography, 2008.

[36] Gregory Ongie, Ajil Jalal, Christopher A. Metzler, Richard G. Baraniuk, Alexandros G. Dimakis, and Rebecca Willett. Deep learning techniques for inverse problems in imaging. IEEE Journal on Selected Areas in Information Theory, 1(1):39–56, 2020.

[37] Ashwini Pokle, Matthew J Muckley, Ricky TQ Chen, and Brian Karrer. Training-free linear image inversion via flows. arXiv preprint arXiv:2310.04432, 2023.

[38] Saiprasad Ravishankar, Jong Chul Ye, and Jeffrey A Fessler. Image reconstruction: From sparsity to data-adaptive methods and machine learning. Proceedings of the IEEE, 108(1):86–109, 2019.

[39] Nicholas Rawlinson, Andreas Fichtner, Malcolm Sambridge, and Mallory K Young. Seismic tomography and the assessment of uncertainty. Advances in geophysics, 55:1–76, 2014.

[40] Danilo Rezende and Shakir Mohamed. Variational inference with normalizing flows. In International conference on machine learning, pages 1530–1538. PMLR, 2015.

[41] François Roddier. Interferometric imaging in optical astronomy. Physics Reports, 170(2):97–166, 1988.

[42] Olaf Ronneberger, Philipp Fischer, and Thomas Brox. U-net: Convolutional networks for biomedical image segmentation. In Medical image computing and computer-assisted intervention–MICCAI 2015, pages 234–241. Springer, 2015.

[43] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. Advances in Neural Information Processing Systems, 36, 2024.

[44] John Skilling. The eigenvalues of mega-dimensional matrices. Maximum Entropy and Bayesian Methods: Cambridge, England, 1988, pages 455–466, 1989.

[45] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International conference on machine learning, pages 2256–2265. PMLR, 2015.

[46] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.

[47] Yang Song, Conor Durkan, Iain Murray, and Stefano Ermon. Maximum likelihood training of score-based diffusion models. Advances in neural information processing systems, 34:1415–1428, 2021.

[48] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. arXiv preprint arXiv:2011.13456, 2020.

[49] Paul Suetens. Fundamentals of medical imaging. Cambridge university press, 2017.

[50] David C Van Essen, Stephen M Smith, Deanna M Barch, Timothy EJ Behrens, Essa Yacoub, Kamil Ugurbil, Wu-Minn HCP Consortium, et al. The wu-minn human connectome project: an overview. Neuroimage, 80:62–79, 2013.

[51] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

[52] Marinus T Vlaardingerbroek and Jacques A Boer. Magnetic resonance imaging: theory and practice. Springer Science & Business Media, 2013.

[53] Zhou Wang, A.C. Bovik, H.R. Sheikh, and E.P. Simoncelli. Image quality assessment: from error visibility to structural similarity. IEEE Transactions on Image Processing, 13(4):600–612, 2004.

[54] Jay Whang, Erik M. Lindgren, and Alexandros G. Dimakis. Composing normalizing flows for inverse problems. Proceedings of the 38th International Conference on Machine Learning, 2021.

[55] Jianwen Xie, Yang Lu, Song-Chun Zhu, and Yingnian Wu. A theory of generative convnet. In Maria Florina Balcan and Kilian Q. Weinberger, editors, Proceedings of The 33rd International Conference on Machine Learning, volume 48 of PMLR, pages 2635–2644, 2016.

[56] Hanshu Yan, Xingchao Liu, Jiachun Pan, Jun Hao Liew, Qiang Liu, and Jiashi Feng. Perflow: Piecewise rectified flow as universal plug-and-play accelerator. arXiv preprint arXiv:2405.07510, 2024.

[57] Peiyu Yu, Dinghuai Zhang, Hengzhi He, Xiaojian Ma, Ruiyao Miao, Yifan Lu, Yasi Zhang, Deqian Kong, Ruiqi Gao, Jianwen Xie, et al. Latent energy-based odyssey: Black-box optimization via expanded exploration in the energy-based latent space. arXiv preprint arXiv:2405.16730, 2024.

[58] Yasi Zhang, Peiyu Yu, and Ying Nian Wu. Object-conditioned energy-based model for attention map alignment in text-to-image diffusion models. In Synthetic Data for Computer Vision Workshop @ CVPR 2024, 2024.

[59] Yasi Zhang, Peiyu Yu, and Ying Nian Wu. Object-conditioned energy-based attention map alignment in text-to-image diffusion models. In Computer Vision – ECCV 2024, pages 55–71, Cham, 2025. Springer Nature Switzerland.

[60] Yaxuan Zhu, Zehao Dou, Haoxin Zheng, Yasi Zhang, Ying Nian Wu, and Ruiqi Gao. Think twice before you act: Improving inverse problem solving with mcmc. arXiv preprint arXiv:2409.08551, 2024.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 1 节引言（含三条贡献）；第 2 节背景（2.1 基于流的模型，式（3）—（6）；2.2 流先验的概率计算，式（7）—（8））；第 3 节方法（3.1 基于流的 MAP，式（9）；3.2 基于流的 MAP 近似，定理 1、式（10）、命题 1（式（11））、图 1、算法 1；3.3 玩具示例验证，图 2）；第 4 节实验（设置与基线、4.1 自然图像、4.2 医学应用、4.3 消融，表 1—2、图 3—6）；第 5 节结论；第 6 节局限性与未来工作；致谢；附录 A（引理 1—3、命题 1 与定理 1 的证明，式（12）—（25））、B（轨迹符合度，式（45）—（54），命题 2）、C（附加结果 C.1，图 7—8）、D（计算效率，表 3）、E（实现细节 E.1—E.3，式（55））；表 1—3（逐格）；图 1—14 图注；参考文献 [1]—[60] 英文原条目。未完成/未包含：①逐句逐式与 PDF 的终校未做（页尾标注 qa_complete=false）；②图 1—14 图像本体未复制（站点不上传图片），仅中文图注；③附录 A.2 定理 1 的证明按原文推导结构（目标分解、离散化、极限）翻译，完整代数步骤未逐行复现；④NeurIPS 论文检查清单（Paper Checklist）属元数据，未逐项录入；⑤**再传播许可待核验**，本页仅学习用途、不计入可公开全文统计（页首与状态段已保留说明）。**qa_complete=false。**

{% endraw %}
