---
layout: page
title: "解耦噪声退火改进扩散逆问题求解｜中文译稿（许可待核）译文"
permalink: /papers/translations/2026-10-02-improving-diffusion-inverse-problem-solving-with-decoupled-noise-annea/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1c41d4564d50ff2f/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 解耦噪声退火改进扩散逆问题求解

**原题：** Improving Diffusion Inverse Problem Solving with Decoupled Noise Annealing  
**作者：** Bingliang Zhang\*、Wenda Chu\*、Julius Berner、Chenlin Meng、Anima Anandkumar、Yang Song（\* 共同第一作者；单位：加州理工学院、NVIDIA、斯坦福大学、OpenAI）  
**版本：** 会议论文集版本（CVPR 2025，`Zhang_Improving_Diffusion_Inverse_Problem_Solving_with_Decoupled_Noise_Annealing_CVPR_2025_paper.pdf`，https://openaccess.thecvf.com/cont ），本地 PDF 11 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节（含 2.1/2.2、3.1–3.4、4.1–4.4 全部小节）、结论与致谢、表 1–3 逐格、图 1–7 图注、参考文献 [1]–[59]（英文原条目）按原文结构录入；原文无附录（本 CVPR 版 PDF 为 11 页正文+参考文献）。逐句逐式终校未做。

> **许可与使用说明：** 本页为 CVPR 2025 会议论文集版本的**中文学习译稿**。原文版权归属会议/作者，本页不主张任何转载授权；**再传播许可待核验**，因此本页**仅作个人学习用途，不计入可公开全文的统计口径**。原文版权声明（CVPR 版式）："This CVPR paper is the Open Access version, provided by the Computer Vision Foundation. Except for this watermark, it is identical to the accepted version; the final published version of the proceedings is available on IEEE Xplore."

## 摘要

扩散模型近年来借助学习到的数据先验，在求解贝叶斯逆问题上取得了成功。现有方法建立在扩散采样过程之上：每个去噪步只对上一步的样本做小幅修改。然而该过程难以纠正早期采样步产生的误差，在复杂非线性逆问题（如相位恢复）中性能较差。为应对这一挑战，我们提出一种新方法——**解耦退火后验采样**（Decoupled Annealing Posterior Sampling，DAPS），它基于一种新的噪声退火过程。具体而言，我们把扩散采样轨迹中的相邻步骤**解耦**，使它们可以彼此有较大差异，同时保证当噪声水平降低时，它们的时间边缘分布退火到真实后验。该方法使求解空间得以更大范围探索，从而提高准确重建的成功率。我们证明 DAPS 在多种图像恢复任务上显著改善样本质量与稳定性，尤其在复杂的非线性逆问题上。

## 1 引言

逆问题在科学与工程中无处不在，应用涵盖图像恢复 [13, 30, 34, 44, 49, 59]、医学成像 [10, 11, 17, 22, 23, 50] 与天文摄影 [1, 19, 51, 52]。求解逆问题即从其部分、含噪的测量 $y$ 中寻找潜在信号 $x_0$。由于测量过程通常含噪且多对一，逆问题往往没有唯一解，而是可能存在多个与观测测量一致的解。在贝叶斯逆问题框架中，解空间由后验分布

$$
p(x_0\mid y)\propto p(y\mid x_0)p(x_0)
$$

刻画，其中 $p(y\mid x_0)$ 表示含噪测量过程，$p(x_0)$ 为先验分布。本文旨在求解测量过程 $p(y\mid x_0)$ 已知、先验分布 $p(x_0)$ 由在相应数据集上训练的深度生成模型刻画的贝叶斯逆问题。

随着基于分数的扩散模型 [21, 26, 27, 47–49] 在图像、音频、视频等高维数据分布建模中占据主导地位，它们已成为贝叶斯逆问题中估计先验分布 $p(x_0)$ 的主流方法。扩散模型通过求解随机微分方程（stochastic differential equation，SDE），从不含结构的初始噪声样本 $x_T$ 中平滑去除噪声来生成样本 $x_0$。特别地，采样过程的每一步把含噪样本 $x_{t+\Delta t}$（其中 $\Delta t>0$ 为步长）递归地转换为噪声略低的样本 $x_t$，直至 $\Delta t\to0$。这种迭代结构可用于促进贝叶斯逆问题求解：事实上，先前研究 [5, 13, 46] 表明，给定测量 $y$ 与扩散模型先验 $p(x_0)$，可通过在 SDE 求解器的每一步用测量过程的近似梯度 $\nabla_{x_t}\log p(y\mid x_t)$ 扰动反向时间 SDE，来从后验分布 $p(x_0\mid y)$ 中采样。

尽管这些方法在求解诸多真实逆问题（如图像上色 [30, 32, 49]、图像超分辨 [13, 30, 46, 49]、计算机断层成像 [45, 50]、磁共振成像 [23, 50]）上取得显著成功，它们在具有非线性测量过程的更复杂逆问题（如相位恢复与非线性运动去模糊）上面临重大挑战。部分原因在于：先前方法的每个去噪步只是近似地从分布 $p(x_t\mid x_{t+\Delta t},y)$ 中采样。由于在离散化反向时间 SDE 时使用小步长 $\Delta t$，这使 $x_t$ 与 $x_{t+\Delta t}$ 彼此接近。结果，$x_t$ 至多能纠正 $x_{t+\Delta t}$ 中的局部误差，难以纠正需要对先验样本作显著修改的全局误差。当把方法应用于复杂非线性逆问题（如相位恢复）时，该问题被进一步放大：这类方法常收敛到与测量一致、但位于先验分布低概率区域的非期望样本。

为应对该挑战，我们提出一种求解一般逆问题的新框架，称为**解耦退火后验采样**（DAPS）。该方法采用一种受扩散采样过程启发的新噪声退火过程：我们解耦采样轨迹中的相邻样本 $x_{t+\Delta t}$ 与 $x_t$，使采样器能够纠正早期步骤造成的大范围全局误差。先前方法反复从 $p(x_t\mid x_{t+\Delta t},y)$ 采样，这限制了相邻样本 $x_{t+\Delta t}$ 与 $x_t$ 之间的距离；DAPS 则递归地从边缘分布 $p(x_t\mid y)$ 中采样。如图 2 所示，我们把时间边缘 $p(x_t\mid y)$ 分解为三个条件分布，并依次通过求解反向扩散过程、模拟 Langevin 动力学、以及按前向扩散过程加噪来采样。我们证明这会产生相应边缘分布的近似样本。随着噪声逐渐退火到零，时间边缘 $p(x_t\mid y)$ 平滑收敛到后验分布 $p(x_0\mid y)$，从而提供近似求解贝叶斯逆问题的样本。

在实验上，与现有方法相比，我们的方法在从图像恢复到压缩感知 MRI 的多种逆问题上表现出显著改善的性能。该方法可与像素空间与学习潜空间中的扩散模型结合，分别称为 **DAPS** 与 **LatentDAPS**。如图 1 所示，两种方法在广泛非线性逆问题上都给出重建更优、视觉感知质量更好的结果。我们的方法在具有挑战性的非线性逆问题上表现出显著稳定性与采样质量：在 FFHQ 256 数据集上，相位恢复与高动态范围任务的 PSNR 分别达到 30.72 dB 与 27.12 dB，相比此前最优结果分别提升 1.98 dB 与 4.39 dB。我们把 DAPS 应用于大规模文本条件潜扩散模型，展示其在高分辨率图像恢复任务上的可扩展性。在图像恢复之外，DAPS 取得 31.49 dB 的 PSNR，相比此前基于扩散的方法提升 2.70 dB。我们还演示了如何用预训练离散扩散模型把 DAPS 应用于类别数据上的逆问题。此外，DAPS 在少量神经网络评估（约 100 次）下表现良好，在效率与样本质量之间取得更好平衡。

## 2 背景

### 2.1 扩散模型

扩散模型 [21, 26, 47–49] 通过反转预定义的加噪过程来生成数据。设数据分布为 $p(x_0)$。向数据加入标准差为 $\sigma$ 的高斯噪声，可定义一系列含噪数据分布 $p(x;\sigma)$，它们构成随机微分方程（SDE）[26] 的时间边缘分布：

$$
dx_t=\sqrt{2\dot\sigma_t}\,dw_t,
$$

其中 $\sigma_t$ 为预定义噪声调度，满足 $\sigma_0=0$、$\sigma_T=\sigma_{\max}$，$\dot\sigma_t$ 为 $\sigma_t$ 的时间导数，$w_t$ 为标准 Wiener 过程。本文中 $x_t$ 与 $x_{\sigma_t}$ 互换使用。对足够大的 $\sigma_{\max}$，分布 $p(x;\sigma_{\max})$ 收敛到纯高斯噪声 $\mathcal N(0,\sigma_{\max}^2I)$。

为从数据分布 $p(x_0)$ 采样，我们先从 $\mathcal N(0,\sigma_{\max}^2I)$ 抽取初始样本，再求解反向 SDE：

$$
dx_t=-2\dot\sigma_t^2\nabla_{x_t}\log p(x_t;\sigma_t)\,dt+\sqrt{2\dot\sigma_t^2}\,dw_t,
$$

其中 $\nabla_{x_t}\log p(x_t;\sigma_t)$ 为时间相关分数函数 [47, 49]。该分数函数未知，但可通过训练扩散模型 $s_\theta(x_t,t)$ 近似，使 $s_\theta(x_t,t)\approx\nabla_{x_t}\log p(x_t;\sigma_t)$。

### 2.2 基于扩散模型的贝叶斯逆问题

逆问题旨在从部分、可能含噪的测量中恢复数据。形式上，求解逆问题即求描述测量过程的前向模型的逆。一般地，前向模型取 $y=A(x_0)+n$，其中 $A$ 为测量函数，$x_0$ 为原始数据，$y$ 为观测测量，$n$ 为测量噪声，常建模为 $n\sim\mathcal N(0,\sigma_y^2I)$。

在贝叶斯框架下，$x_0$ 来自后验分布 $p(x_0\mid y)\propto p(x_0)p(y\mid x_0)$，其中 $p(x_0)$ 为可由给定数据集估计的先验分布，$p(y\mid x_0)=\mathcal N(A(x_0),\sigma_y^2I)$ 刻画含噪测量过程。

当先验 $p(x_0)$ 由预训练扩散模型建模时，可按 Bayes 法则修改反向 SDE，以近似从后验分布采样：

$$
dx_t=-2\dot\sigma_t^2\nabla_{x_t}\log p(x_t;\sigma_t)\,dt-2\dot\sigma_t^2\nabla_{x_t}\log p(y\mid x_t)\,dt+\sqrt{2\dot\sigma_t^2}\,dw_t. \tag{1}
$$

这里含噪似然 $\nabla_{x_t}\log p(y\mid x_t)$ 一般不可处理。已有多种方法估计该含噪似然 [5, 8, 12, 36, 41, 46, 50, 54, 59]。

一种主流方法是 DPS 算法 [13]，它用 $p(y\mid x_t)\approx p(y\mid x_0=\mathbb E[x_0\mid x_t])$ 估计似然。另一类工作 [7, 18, 29, 30, 54] 通过在谱域经奇异值分解（SVD）运行反向扩散来求解线性逆问题。其他方法绕开该似然的直接计算，把优化步 [2, 9, 24, 31, 45, 56, 59] 或投影步 [10, 23, 30, 54] 与常规扩散采样步交错进行。

尽管经验上取得可观成功，我们发现这类方法在前向模型高度非线性、求解更困难逆问题时面临挑战。准确求解式 (1) 的反向 SDE 要求求解器采用非常小的步长 $\Delta t>0$，使 $x_t$ 与 $x_{t+\Delta t}$ 非常接近。因此 $x_t$ 只能纠正 $x_{t+\Delta t}$ 中的微小误差，常常无法处理需要对 $x_{t+\Delta t}$ 做实质改变的大范围全局误差。图 4 给出一个此类失败案例。

## 3 方法

### 3.1 解耦退火后验采样

我们不求解式 (1) 的反向时间 SDE，而提出一种新噪声退火过程，以降低相邻时间步样本之间的依赖，如图 2、图 3a 与图 3b 所示。与先前方法不同，我们保证给定 $x_0$ 时 $x_t$ 与 $x_{t+\Delta t}$ 条件独立。为从 $x_{t+\Delta t}$ 生成样本 $x_t$，我们按两步过程进行：（1）采样 $x_{0\mid y}\sim p(x_0\mid x_{t+\Delta t},y)$；（2）采样 $x_t\sim\mathcal N(x_{0\mid y},\sigma_{t}^2I)$。重复该过程、逐渐降低噪声直至采样出 $x_0$。我们称该过程为**解耦噪声退火**，其合理性由下述命题保证。

**命题 1。** 假设 $x_{t_1}$ 采样自时间边缘 $p(x_{t_1}\mid y)$，则

$$
x_{t_2}\sim\mathbb E_{x_0\sim p(x_0\mid x_{t_1},y)}\left[\mathcal N\left(x_0,\sigma_{t_2}^2I\right)\right] \tag{2}
$$

满足时间边缘 $p(x_{t_2}\mid y)$。

**注。** 命题 1 的关键思想是：给定另一噪声水平 $t_1$ 处的任意样本 $x_{t_1}$，可对任意噪声水平 $t_2$ 从 $p(x_{t_2}\mid y)$ 采样。对足够大的 $T$，可假设 $p(x_T\mid y)\approx p(x_T;\sigma_T)\approx\mathcal N(0,\sigma_T^2I)$。从 $x_T$ 出发，随着 $t$ 从 $T$ 退火到 0，可迭代地从 $p(x_t\mid y)$ 采样。

解耦噪声退火的第一步要求采样 $x_{0\mid y}\sim p(x_0\mid x_t,y)$，其中 $x_t$ 与 $y$ 已知。由于给定 $x_0$ 时 $y$ 与 $x_t$ 条件独立，由 Bayes 法则可推出

$$
p(x_0\mid x_t,y)=\frac{p(x_0\mid x_t)p(y\mid x_0,x_t)}{p(y\mid x_t)}\propto p(x_0\mid x_t)p(y\mid x_0). \tag{3}
$$

为从该未归一化分布采样 $x_{0\mid y}$，可采用 MCMC 方法，如 Langevin 动力学 [55] 与 Hamiltonian Monte Carlo [4]（详见原文附录 A.1）。Langevin 动力学的更新规则 [55] 为

$$
x_0^{(j+1)}=x_0^{(j)}+\eta\nabla_{x_0^{(j)}}\log p\left(x_0^{(j)}\mid x_t\right)+\eta\nabla_{x_0^{(j)}}\log p\left(y\mid x_0^{(j)}\right)+\sqrt{2\eta}\,\epsilon_j, \tag{4}
$$

其中 $\eta>0$ 为步长，$\epsilon_j\sim\mathcal N(0,I)$。当 $\eta\to0$、$j\to\infty$ 时，样本 $x_0^{(j)}$ 近似服从 $p(x_0\mid x_t,y)$。

### 3.2 DAPS 的实用设计选择

按式 (4)，我们讨论因不可处理而近似条件分布 $p(x_0\mid x_t)$ 的不同方式。一类先前的扩散后验采样工作 [5, 13, 46] 用高斯分布近似 $p(x_0\mid x_t)$：

$$
p(x_0\mid x_t)\approx\mathcal N\left(x_0;\hat x_0(x_t),\tilde\sigma_t^2I\right), \tag{5}
$$

其中 $\hat x_0(x_t)$ 为给定 $x_t$ 时 $x_0$ 的估计器，通常取 $\mathbb E[x_0\mid x_t]$；方差 $\tilde\sigma_t^2$ 用启发式方法确定。

另一种估计 $p(x_0\mid x_t)$ 的方式是用 Bayes 法则分解，并把不可处理的 $p(x_0)$ 替换为带小高斯噪声的分布 $p(x_0;\sigma_{t_{\min}})$ 以保证数值稳定，即

$$
\nabla_{x_0}\log p(x_0\mid x_t)=\nabla_{x_0}\log p(x_t\mid x_0)+\nabla_{x_0}\log p(x_0)\approx\nabla_{x_0}\log p(x_t\mid x_0)+s_\theta\left(x_0,t_{\min}\right). \tag{6}
$$

尽管式 (6) 的扩散分数估计更准确，但当应用于式 (4) 时，它比高斯近似昂贵得多，因为需要多次调用分数函数。第 4.4 节的实证研究表明，使用高斯近似可获得与扩散分数估计相当的结果，且时间效率显著更高。实践中我们采用高斯近似，并通过从 $x_t$ 出发求解（无条件）概率流 ODE 来计算 $\hat x_0(x_t)$（细节见原文附录 F.2）。

当测量噪声为各向同性高斯噪声（即 $n\sim\mathcal N(0,\sigma_y^2I)$）时，更新规则简化为

$$
x_0^{(j+1)}=x_0^{(j)}-\eta\frac{\nabla_{x_0^{(j)}}\left\|x_0^{(j)}-\hat x_0(x_t)\right\|_2^2}{2\tilde\sigma_t^2}-\eta\frac{\nabla_{x_0^{(j)}}\left\|A\left(x_0^{(j)}\right)-y\right\|_2^2}{2\sigma_y^2}+\sqrt{2\eta}\,\epsilon_j. \tag{7}
$$

把式 (7) 与命题 1 结合，即得**解耦退火后验采样（DAPS）**（原文算法 1，见其附录 A）。具体地，给定噪声调度 $\sigma_t$ 与时间离散化 $\{t_i,i=0,\ldots,N_A\}$，我们对 $i=N_A,N_A-1,\ldots,0$，按命题 1 的式 (2) 迭代地从测量条件时间边缘 $p(x_{t_i}\mid y)$ 采样 $x_{t_i}$。该算法给出后验分布 $p(x_0\mid y)$ 的近似样本 $x_0$。

Langevin 动力学的计算代价主要来自评估测量函数 $A$。在大多数图像恢复任务中，该操作远比评估扩散模型高效；如原文附录 E.1 所示，MCMC 采样只给采样过程引入很小的额外开销。

### 3.3 结合潜扩散模型（LDM）的 DAPS

给定预训练编码器 $E$ 与解码器 $D$，潜扩散模型（latent diffusion model，LDM）[40] 被训练用于拟合潜分布 $p(z_0)$，其中 $z_0=E(x_0)$，并由解码器恢复 $x_0=D(z_0)$。我们发现所提方法可通过分解潜扩散过程对应的概率图模型（如图 3b 所示）适配到预训练潜扩散模型的采样，下文称为 **LatentDAPS**。

据此可由式 (4) 推出如下 Langevin 动力学更新规则：

$$
z_0^{(j+1)}=z_0^{(j)}+\eta\nabla_{z_0^{(j)}}\log p\left(z_0^{(j)}\mid z_t\right)+\eta\nabla_{z_0^{(j)}}\log p\left(y\mid D\left(z_0^{(j)}\right)\right)+\sqrt{2\eta}\,\epsilon_j. \tag{8}
$$

与近期潜扩散逆问题求解器 [42, 43, 45] 相比，LatentDAPS 是 DAPS 直接而自然的扩展，却在表 1 与表 4（原文附录表）中的多个任务上表现出相当甚至更优的性能。更详细的推导与证明见原文附录 B。

### 3.4 与现有方法的讨论

**与其他后验采样方法的比较。** 与多数先前算法不同，我们的采样方法不求解特定 SDE/ODE，而是随噪声退火到零，递归地从时间边缘 $p(x_t\mid y)$ 采样。因此我们在采样过程中解耦了 $x_t$ 与 $x_{t+\Delta t}$ 的依赖。我们认为解耦通过允许非局部转移，有助于纠正早期扩散采样步累积的误差；当测量函数非线性时，这一点尤为重要。作为具体例子，图 4 比较了以高斯混合为先验求解二维非线性逆问题时 DAPS 与 DPS：我们可视化两种方法从时间 $T$ 到 0 的 $x_t$ 轨迹，DAPS 轨迹上的点相比 DPS 变化显著更大；结果 DPS 收敛到错误解，而 DAPS 能够逼近真实后验分布。更多讨论见原文附录 G。

**与基于优化的方法的比较。** 尽管我们的方法不直接包含内层优化，但我们指出它与现有基于优化的逆问题求解器存在联系。例如，ReSample [45]、DiffPIR [59] 与 DCDP [31] 在去噪、优化与重采样之间交替以求解逆问题。然而这些方法求解 MAP 估计问题，而 DAPS 从后验分布中抽取样本。特别地，若在式 (18) 中令标准差 $\sigma_y\to0$ 并假设 $\eta^2\sigma_y^2$ 为常数，则用 Langevin 动力学与高斯近似实例化的 DAPS 与 [45] 类似。

## 4 实验

### 4.1 实验设置

我们使用像素空间与潜扩散模型评估所提方法。对基于像素的扩散实验，我们采用 [13] 在 FFHQ 数据集上训练的预训练扩散模型，以及 [16] 在 ImageNet 数据集上的预训练模型。对潜扩散模型，我们使用与 [45] 相同的预训练模型：[40] 在 FFHQ 与 ImageNet 上训练的无条件 LDM-VQ4。自编码器下采样因子为 4。我们使用与 EDM [26] 相同的时间步离散化与噪声调度。

如第 3 节所述，我们用少步 Euler ODE 求解器计算 $\hat x_0(x_t)$，同时在不同噪声水平下保持相同的神经网络函数评估次数（NFE）。实验中线性任务全部使用 DAPS-1K，非线性任务全部使用 DAPS-4K：DAPS-1K 使用 4 次 ODE 求解器 NFE 与 250 个退火调度步，DAPS-4K 使用 10 次 NFE 与 400 步。我们在第 4.4 节讨论这些配置选择的影响。对应的潜版本 LatentDAPS 采用相同设置，但在 VAE 潜空间中进行采样。DAPS 与 LatentDAPS 的每次去噪迭代分别使用 100 与 50 步 Langevin 动力学，学习率按任务单独调优。模型配置、采样器与其他超参数的更多细节见原文附录 F，采样效率的更多讨论见第 4.2 节与原文附录 E.1。

**数据集与指标。** 沿用先前惯例，我们在 FFHQ 256×256 [25] 与 ImageNet 256×256 [15] 两个图像数据集上测试。为评估方法，我们分别从 FFHQ 与 ImageNet 的验证集中取 100 张图像。主要评价指标包括峰值信噪比（PSNR）、结构相似度（SSIM）、学习感知图像块相似度（LPIPS）[58] 与 Fréchet 初始距离（FID）[20]。对方法与基线，我们均使用 `piq` [28] 中的实现，所有图像归一化到 $[0,1]$ 区间；LPIPS 评估时启用 replace-pooling 选项。

**逆问题。** 我们用一系列线性与非线性任务评估所提方法。对线性逆问题，考虑：(1) 超分辨；(2) 高斯去模糊；(3) 运动去模糊；(4) 矩形框掩码的图像修复（inpainting）；(5) 70% 随机掩码的图像修复。对高斯与运动去模糊，分别使用尺寸 61×61、标准差 3.0 与 0.5 的核。超分辨任务用双三次插值将图像下采样 4 倍。矩形框修复任务用随机 128×128 的框遮挡原图；随机掩码修复按 [45] 设置生成随机掩码，每个像素有 70% 概率被遮挡。

我们考虑三种非线性逆问题：(1) 相位恢复；(2) 高动态范围（HDR）重建；(3) 非线性去模糊。由于相位恢复本身不稳定，我们采用 DPS [13] 的策略，使用 2.0 的过采样率并报告四次独立采样中的最佳结果。HDR 重建的目标是从低动态范围图像恢复更高动态范围（2 倍）的图像。非线性去模糊采用 [53] 的默认设置。所有线性与非线性测量都叠加标准差 $\sigma_y=0.05$ 的白高斯噪声；各任务前向测量函数及其超参数的更多细节见原文附录 F。

**基线。** 对基于像素扩散模型的实验，我们与以下基线比较：DDRM [30]、DPS [13]、DDNM [54]、DCDP [31]、FPS-SMC [18]、DiffPIR [59]。对方法的潜扩散版本，我们与同样在潜空间运行的 PSLD [42] 与 ReSample [45] 比较。注意 DDRM、DDNM、FPS-SMC 与 PSLD 无法处理非线性逆问题；非线性实验中我们额外与 RED-diff [35] 比较，相位恢复中额外与传统方法 HIO [14] 比较。

### 4.2 主要结果

表 1 给出 FFHQ 与 ImageNet 数据集上的定量结果，图 1 给出定性比较。如表 1 所示，我们的方法在全部所选线性逆问题上取得相当甚至更优的性能；而且在处理非线性逆问题时格外稳定。例如，尽管 DPS 等现有方法能从相位恢复测量中恢复高质量图像，但失败率极高，导致 PSNR 相对较低、LPIPS 较高；相比之下 DAPS 在不同样本间表现出更优稳定性，成功率显著更高，因而在 PSNR 与 LPIPS 上都有大幅改善（见表 1）。此外，与现有基线相比，DAPS 能捕获并恢复测量中精细得多的细节。更多样本与比较见原文附录 I。

为理解噪声退火过程的演化，我们评估方法中两条关键轨迹：1）$p(x_0\mid x_t)$ 的估计均值，记作 $\hat x_0(x_t)$；2）通过 Langevin 动力学从 $p(x_0\mid x_t,y)$ 得到的样本，记作 $x_{0\mid y}$。我们评估这两条轨迹上的图像质量与测量误差，如图 7 所示：$x_{0\mid y}\sim p(x_0\mid x_t,y)$ 的测量误差在整个过程中始终很低，而 $\hat x_0(x_t)$ 的测量误差持续下降；因此 PSNR 与 LPIPS 等指标随噪声水平退火而稳定改善。

此外，当测量信息较少时，我们的方法可生成多样化样本。为说明这一点，我们选取后验分布可能多模态的两个任务：（1）16 倍超分辨；（2）192×192 框的图像修复。图 5 给出 DAPS 的部分样本，展示了 DAPS 在保留测量信息的同时产生多样样本的能力；更多样本见原文附录 I。

**结合大规模文本条件潜扩散的 DAPS。** 由于 DAPS 的灵活性，给定文本提示 $c$ 时，预训练大规模文本条件潜扩散模型（LDM）[38–40] 也可作为先验模型 $p(x_0\mid c)$。为展示 DAPS 的潜力，我们用 Stable Diffusion v2.1 [40] 在三个任务上给出 768×768 分辨率的 LatentDAPS 结果（如图 1 所示）；使用的文本提示与详细讨论、定量评估见原文附录 B.1。

**结合离散扩散的 DAPS。** DAPS 可自然扩展为用离散扩散模型 [3, 6, 33] 建模类别先验分布时的后验采样：不再用连续空间中的 Langevin MC 或 Hamiltonian MC 采样 $x_0$，而用 Metropolis–Hastings 算法替代式 (4)。我们在量化 MNIST 数据集上验证了离散扩散版本的 DAPS，细节见原文附录 C。

### 4.3 MRI 上的进一步结果

我们进一步在压缩感知多线圈 MRI 上验证 DAPS 的有效性；该医学成像技术通过欠采样帮助缩短 MRI 扫描时间。我们使用 fastMRI 膝关节数据集 [57] 按 [26] 的流水线训练扩散模型。表 2 表明 DAPS 优于现有基于扩散的基线；更多定性结果见原文附录 H。

**表 1　FFHQ 与 ImageNet 上 5 个线性与 3 个非线性任务的定量评估**（左：FFHQ；右：ImageNet；线性任务报告 100 张验证图像的均值，非线性任务同时报告均值与标准差；FID 用同一批 100 张验证图像评估；每类任务内最优与次优分别以粗体与下划线标出；所有任务使用噪声水平 $\sigma_y=0.05$ 的含噪测量）

| 任务 | 类型 | 方法 | FFHQ PSNR↑ | FFHQ SSIM↑ | FFHQ LPIPS↓ | FFHQ FID↓ | ImageNet PSNR↑ | ImageNet SSIM↑ | ImageNet LPIPS↓ | ImageNet FID↓ |
|---|---|---|---|---|---|---|---|---|---|---|
| 超分辨 4× | 像素 | DAPS（本文） | **29.07** | 0.818 | **0.177** | 51.44 | **25.89** | 0.694 | **0.276** | 83.57 |
| 超分辨 4× | 像素 | DPS | 25.86 | 0.753 | 0.269 | 81.07 | 21.13 | 0.489 | 0.361 | 106.32 |
| 超分辨 4× | 像素 | DDRM | 26.58 | 0.782 | 0.282 | 79.25 | 22.62 | 0.521 | 0.324 | 103.85 |
| 超分辨 4× | 像素 | DDNM | 28.03 | 0.795 | 0.197 | 64.62 | 23.96 | 0.604 | 0.475 | 98.62 |
| 超分辨 4× | 像素 | DCDP | 28.66 | 0.807 | 0.178 | 53.81 | – | – | – | – |
| 超分辨 4× | 像素 | FPS-SMC | 28.42 | 0.813 | 0.204 | 49.25 | 24.82 | 0.703 | 0.313 | 97.51 |
| 超分辨 4× | 像素 | DiffPIR | 26.64 | – | 0.260 | 65.77 | 23.18 | – | 0.371 | 106.32 |
| 超分辨 4× | 潜空间 | LatentDAPS（本文） | 27.48 | 0.801 | 0.182 | 59.62 | 25.06 | 0.673 | 0.276 | 84.37 |
| 超分辨 4× | 潜空间 | PSLD | 24.35 | 0.649 | 0.287 | 74.36 | **25.42** | 0.694 | 0.360 | 97.45 |
| 超分辨 4× | 潜空间 | ReSample | 23.29 | 0.594 | 0.392 | 93.18 | 22.61 | 0.576 | 0.370 | 113.42 |
| 图像修复（框） | 像素 | DAPS（本文） | 24.07 | 0.814 | **0.133** | 43.10 | 21.43 | 0.725 | **0.214** | 109.85 |
| 图像修复（框） | 像素 | DPS | 22.51 | 0.792 | 0.209 | 61.27 | 18.94 | 0.722 | 0.257 | 126.52 |
| 图像修复（框） | 像素 | DDRM | 22.26 | 0.801 | 0.207 | 78.62 | 18.63 | 0.733 | 0.254 | 116.37 |
| 图像修复（框） | 像素 | DDNM | **24.47** | 0.837 | 0.235 | 46.59 | **21.64** | 0.748 | 0.319 | 103.97 |
| 图像修复（框） | 像素 | DCDP | 23.89 | 0.760 | 0.163 | 45.23 | – | – | – | – |
| 图像修复（框） | 像素 | FPS-SMC | 24.86 | 0.823 | 0.146 | 48.34 | 22.16 | 0.726 | 0.208 | 111.58 |
| 图像修复（框） | 潜空间 | LatentDAPS（本文） | 23.99 | 0.802 | 0.194 | 46.52 | 17.19 | 0.624 | 0.340 | 145.63 |
| 图像修复（框） | 潜空间 | PSLD | 24.22 | 0.813 | 0.158 | 43.02 | 20.10 | 0.694 | 0.465 | 146.53 |
| 图像修复（框） | 潜空间 | ReSample | 20.06 | 0.749 | 0.184 | 53.21 | 18.29 | 0.631 | 0.262 | 127.84 |
| 图像修复（随机） | 像素 | DAPS（本文） | **31.12** | **0.844** | **0.098** | 32.17 | 28.44 | 0.775 | **0.135** | 54.25 |
| 图像修复（随机） | 像素 | DPS | 25.46 | 0.823 | 0.203 | 69.20 | 23.52 | 0.745 | 0.297 | 87.53 |
| 图像修复（随机） | 像素 | DDNM | 29.91 | 0.817 | 0.121 | 44.37 | **31.16** | 0.841 | 0.191 | 63.84 |
| 图像修复（随机） | 像素 | DCDP | 30.69 | 0.842 | 0.142 | 52.51 | – | – | – | – |
| 图像修复（随机） | 像素 | FPS-SMC | 28.21 | 0.823 | 0.261 | 61.23 | 24.52 | 0.701 | 0.316 | 79.12 |
| 图像修复（随机） | 潜空间 | LatentDAPS（本文） | 30.71 | 0.813 | 0.141 | 36.41 | 27.59 | 0.772 | 0.164 | 61.62 |
| 图像修复（随机） | 潜空间 | PSLD | 30.31 | 0.809 | 0.221 | 47.21 | 31.30 | 0.783 | 0.337 | 83.21 |
| 图像修复（随机） | 潜空间 | ReSample | 29.61 | 0.746 | 0.140 | 39.85 | 27.50 | 0.756 | 0.143 | 59.87 |
| 高斯去模糊 | 像素 | DAPS（本文） | **29.19** | 0.817 | **0.165** | 53.33 | 26.15 | 0.684 | 0.253 | 75.68 |
| 高斯去模糊 | 像素 | DPS | 25.87 | 0.764 | 0.219 | 79.75 | 20.31 | 0.598 | 0.397 | 116.42 |
| 高斯去模糊 | 像素 | DDRM | 24.93 | 0.732 | 0.239 | 92.43 | 21.26 | 0.564 | 0.443 | 146.89 |
| 高斯去模糊 | 像素 | DDNM | 28.20 | 0.804 | 0.216 | 57.83 | **28.06** | 0.703 | 0.278 | 81.43 |
| 高斯去模糊 | 像素 | DCDP | 27.50 | 0.699 | 0.304 | 86.43 | – | – | – | – |
| 高斯去模糊 | 像素 | FPS-SMC | 26.54 | 0.773 | 0.253 | 67.45 | 23.91 | 0.601 | 0.387 | 91.72 |
| 高斯去模糊 | 像素 | DiffPIR | 27.36 | – | 0.236 | 59.65 | 22.80 | – | 0.355 | 93.36 |
| 高斯去模糊 | 潜空间 | LatentDAPS（本文） | 27.93 | 0.764 | 0.234 | 64.52 | 25.05 | 0.668 | 0.345 | 78.51 |
| 高斯去模糊 | 潜空间 | PSLD | 23.27 | 0.631 | 0.316 | 89.51 | 25.86 | 0.688 | 0.390 | 91.39 |
| 高斯去模糊 | 潜空间 | ReSample | 26.39 | 0.714 | 0.255 | 71.69 | **25.97** | 0.703 | **0.254** | **65.35** |
| 运动去模糊 | 像素 | DAPS（本文） | **29.66** | **0.847** | **0.157** | 39.49 | **27.86** | **0.766** | **0.196** | 61.83 |
| 运动去模糊 | 像素 | DPS | 24.52 | 0.801 | 0.246 | 65.23 | 18.96 | 0.629 | 0.423 | 137.81 |
| 运动去模糊 | 像素 | DCDP | 25.08 | 0.512 | 0.364 | 125.13 | – | – | – | – |
| 运动去模糊 | 像素 | FPS-SMC | 27.39 | 0.826 | 0.227 | 48.32 | 24.52 | 0.647 | 0.326 | 87.43 |
| 运动去模糊 | 像素 | DiffPIR | 26.57 | – | 0.255 | 65.78 | 24.01 | – | 0.366 | 94.63 |
| 运动去模糊 | 潜空间 | LatentDAPS（本文） | 27.00 | 0.814 | 0.283 | 46.84 | 26.83 | 0.745 | 0.296 | 73.62 |
| 运动去模糊 | 潜空间 | PSLD | 22.31 | 0.678 | 0.336 | 96.15 | 20.85 | 0.594 | 0.511 | 124.67 |
| 运动去模糊 | 潜空间 | ReSample | 27.41 | 0.823 | 0.198 | 44.72 | 26.94 | 0.738 | 0.227 | 66.89 |
| 相位恢复 | 像素 | DAPS（本文） | **30.63±3.13** | **0.851±0.072** | **0.139±0.060** | 42.71 | **25.78±6.92** | **0.743±0.084** | **0.254±0.125** | 82.67 |
| 相位恢复 | 像素 | DPS | 17.64±2.97 | 0.441±0.129 | 0.410±0.090 | 104.52 | 16.81±3.61 | 0.427±0.143 | 0.447±0.099 | 197.54 |
| 相位恢复 | 像素 | RED-diff | 15.60±4.48 | 0.398±0.195 | 0.596±0.092 | 167.43 | 14.98±3.75 | 0.386±0.057 | 0.536±0.129 | 212.24 |
| 相位恢复 | 像素 | DCDP | 28.65±8.09 | 0.781±0.217 | 0.203±0.196 | 68.13 | – | – | – | – |
| 相位恢复 | 潜空间 | LatentDAPS（本文） | 29.16±3.55 | 0.796±0.089 | 0.199±0.078 | 54.26 | 20.54±6.41 | 0.612±0.114 | 0.361±0.150 | 129.54 |
| 相位恢复 | 潜空间 | ReSample | 21.60±8.10 | 0.648±0.154 | 0.406±0.224 | 84.32 | 19.24±4.21 | 0.618±0.146 | 0.403±0.174 | 130.47 |
| 相位恢复 | 传统 | HIO | 13.53±2.50 | 0.359±0.093 | 0.726±0.068 | 268.09 | – | – | – | – |
| 非线性去模糊 | 像素 | DAPS（本文） | 28.29±1.77 | 0.783±0.036 | **0.155±0.032** | 49.38 | 27.73±3.23 | 0.724±0.048 | **0.169±0.056** | 59.87 |
| 非线性去模糊 | 像素 | DPS | 23.39±2.01 | 0.623±0.082 | 0.278±0.060 | 91.31 | 22.49±3.20 | 0.591±0.101 | 0.306±0.081 | 101.41 |
| 非线性去模糊 | 像素 | RED-diff | **30.86±0.51** | **0.795±0.028** | 0.160±0.034 | 43.84 | **30.07±1.41** | **0.754±0.023** | 0.211±0.083 | **51.22** |
| 非线性去模糊 | 像素 | DCDP | 27.92±2.64 | 0.779±0.067 | 0.183±0.051 | 51.96 | – | – | – | – |
| 非线性去模糊 | 潜空间 | LatentDAPS（本文） | 28.11±1.75 | 0.713±0.041 | 0.235±0.049 | 53.63 | 25.34±3.44 | 0.615±0.057 | 0.314±0.080 | 76.73 |
| 非线性去模糊 | 潜空间 | ReSample | 28.24±1.69 | 0.742±0.039 | 0.185±0.039 | 51.62 | 26.20±3.71 | 0.653±0.064 | 0.206±0.057 | 61.16 |
| 高动态范围 | 像素 | DAPS（本文） | 27.12±3.53 | 0.752±0.041 | **0.162±0.072** | 42.97 | 26.30±4.10 | 0.717±0.067 | 0.175±0.107 | 64.19 |
| 高动态范围 | 像素 | DPS | 22.73±6.07 | 0.591±0.141 | 0.264±0.156 | 112.82 | 19.23±2.52 | 0.582±0.082 | 0.503±0.106 | 146.23 |
| 高动态范围 | 像素 | RED-diff | 22.16±3.41 | 0.512±0.083 | 0.258±0.089 | 108.32 | 22.03±5.90 | 0.601±0.094 | 0.274±0.198 | 113.48 |
| 高动态范围 | 潜空间 | LatentDAPS（本文） | 25.94±2.87 | 0.751±0.056 | 0.223±0.080 | 74.83 | 23.64±4.10 | 0.609±0.053 | 0.269±0.099 | 93.51 |
| 高动态范围 | 潜空间 | ReSample | 25.65±3.57 | 0.732±0.059 | 0.182±0.085 | 67.22 | 25.11±4.21 | 0.633±0.049 | 0.198±0.089 | 87.66 |

**表 2　压缩感知 MRI 的定量结果**（考虑 ×4 与 ×8 欠采样比；Meas err 表示 $\ell_2$ 数据一致性误差）

| 方法 | ×4 PSNR↑ | ×4 SSIM↑ | ×4 Meas err↓ | ×8 PSNR↑ | ×8 SSIM↑ | ×8 Meas err↓ |
|---|---|---|---|---|---|---|
| DAPS | **31.48** | **0.762** | 1.57 | **29.01** | **0.681** | 1.28 |
| DPS | 26.13 | 0.620 | 9.90 | 20.82 | 0.536 | 6.74 |
| DiffPIR | 28.31 | 0.632 | 10.55 | 26.78 | 0.588 | 7.79 |
| ScoreMRI [10] | 25.97 | 0.468 | 10.83 | 25.01 | 0.405 | 8.36 |
| CSGM [23] | 28.78 | 0.710 | **1.52** | 26.15 | 0.625 | **1.14** |

**表 3　$p(x_0\mid x_t)$ 不同近似方式的比较**（FFHQ 上 10 张图像、DAPS-1K、三个任务；高斯近似在略牺牲性能的情况下取得巨大加速）

| 方法 | 高斯去模糊 PSNR↑ | 高斯去模糊 LPIPS↓ | 高斯去模糊 运行时间/s | HDR PSNR↑ | HDR LPIPS↓ | HDR 运行时间/s |
|---|---|---|---|---|---|---|
| 高斯近似 | 29.40 | 0.170 | 64.7 | 24.85 | 0.181 | 61.4 |
| 扩散分数估计 | 29.57 | 0.160 | 462.3 | 25.33 | 0.193 | 540.0 |
| 相对改善 | −0.575% | −6.25% | 614.53% | −1.89% | −6.22% | 779.48% |

### 4.4 消融研究

**DAPS 的时间效率。** 我们用多种配置运行 DAPS，测试其在不同计算预算下的性能：具体地，扩散模型的函数评估次数（NFE）从 50 到 4K，配置见原文附录 E.1。图 6 给出以 LPIPS 度量的 DAPS 样本质量与其时间代价的关系，表明 DAPS 能在合理时间代价下生成高质量样本。

**DAPS 不同设计选择的有效性。** 我们做消融研究，比较高斯近似与更 principled、但更昂贵的扩散分数估计的有效性。表 3 表明高斯近似比扩散分数估计快 6–7 倍，代价是性能略降，从而有效实现了性能与效率的折中。

**更多消融研究。** 更多 DAPS 消融研究见原文附录 I.1，包括函数评估次数、ODE 步数、退火噪声调度与不同测量噪声水平。

## 5 结论

总之，我们提出解耦退火后验采样（DAPS）用于求解逆问题，特别是含复杂非线性测量过程（如相位恢复）的逆问题。我们的方法解耦扩散采样轨迹中的相邻样本点，使它们可以差异很大，从而使 DAPS 能够探索更大的解空间。在实验中我们证明，与现有方法相比，DAPS 在求解广泛挑战性逆问题时生成的样本具有更好的视觉质量与稳定性。

## 致谢

感谢 Pika 为本研究提供关键计算资源。我们还要感谢 Kortschak Scholars Fellowship 对 B.Z. 与 W.C. 在加州理工学院期间的支持。J.B. 感谢 Wally Baer and Jeri Weiss Postdoctoral Fellowship 的支持。A.A. 部分获得 Bren endowed chair 与 Schmidt Sciences 的 AI2050 senior fellow 计划支持。

## 图注与表注

**图 1：** 解耦退火后验采样（DAPS）概览。该方法通过解耦后验采样过程，为逆问题提供灵活有效的求解框架。（a）（b）为 DAPS 在 FFHQ 与 ImageNet 上 256 分辨率的可视化结果；（c）为 768 分辨率自然图像上的结果；（d）为压缩感知多线圈 MRI（CS-MRI）上的 DAPS 结果。DAPS 能有效处理非线性逆问题与 MRI 医学成像挑战，并可通过大规模潜扩散模型（LDM）[40] 增强（如（c）所示）。

**图 2：** 在相位恢复任务上对本方法的说明。给定含噪样本 $x_t$，我们先求解反向扩散过程得到 $\hat x_0(x_t)$，据此构造 $p(x_0\mid x_t,y)$ 的近似；再用多步 Langevin 动力学采样 $x_{0\mid y}\sim p(x_0\mid x_t,y)$，然后按前向扩散过程加噪，得到噪声略低的样本；重复该过程直至噪声降为零。

**图 3：** （a）像素空间与（b）潜空间中解耦噪声退火过程的概率图模型。其中 $x_t\sim p(x_t;\sigma_t)$，$y$ 为观测测量；我们基于这些概率图分解 $p(x_t\mid y)$。

**图 4：** DAPS 与 DPS 在二维合成数据上的比较。DPS 的连续采样步彼此接近，而 DAPS 不是；此处 DAPS 比 DPS 更好地近似后验。

**图 5：** 样本多样性。给出 DAPS 在两个稀疏测量任务下生成的若干多样样本，其后验分布包含多个模态；DAPS 生成具有明显差异（表情、服饰、发型等）的多样样本。

**图 6：** 时间代价与样本质量评估。（a）高斯去模糊；（b）相位恢复。横轴为 A100-SXM4-80GB GPU 上单张图像的采样时间，纵轴为 LPIPS；评估使用 100 张 FFHQ 图像。

**图 7：** 采样过程中图像质量指标与测量误差的定量评估。$\hat x_0(x_t)$ 表示高斯近似分布的估计均值，$x_{0\mid y}\sim p(x_0\mid x_t,y)$ 表示从测量条件时间边缘得到的样本；测量误差归一化到 $[0,1]$ 以便可视化。

**表 1：** FFHQ 与 ImageNet 上 5 个线性与 3 个非线性任务的定量评估（逐行逐格见正文表 1）。

**表 2：** 压缩感知 MRI 的定量结果（×4 与 ×8 欠采样；逐格见正文表 2）。

**表 3：** $p(x_0\mid x_t)$ 近似方式的比较（FFHQ 10 张图像、DAPS-1K、三个任务；逐格见正文表 3）。

> **原文说明：** 本 CVPR 版 PDF 共 11 页（正文第 1–5 节 + 参考文献，页码 20895–20905），**正文中多次引用的附录 A–I（含算法 1、附录表 4、更多定性结果与消融）不在该 PDF 内**，故本页不包含附录翻译；如需附录内容请以 arXiv 完整版（2408.15202 系列之外的本文对应版本）为准。原文无独立"许可"章节，版权与再传播许可信息见页首引用说明。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 CVPR 版第 9–11 页转录；未逐条核对 DOI 与页码）。

[1] K. Akiyama, A. Alberdi, W. Alef, K. Asada, R. Azulay, A.-K. Baczko, D. Ball, M. Baloković, J. Barrett, D. Bintley, et al. First m87 event horizon telescope results. iv. imaging the central supermassive black hole. The Astrophysical Journal Letters, 875(1):L4, 2019.

[2] M. Arvinte, S. Vishwanath, A. H. Tewfik, and J. I. Tamir. Deep j-sense: Accelerated mri reconstruction via unrolled alternating optimization, 2021.

[3] J. Austin, D. D. Johnson, J. Ho, D. Tarlow, and R. Van Den Berg. Structured denoising diffusion models in discrete state-spaces. Advances in Neural Information Processing Systems, 34:17981–17993, 2021.

[4] M. Betancourt and M. Girolami. Hamiltonian monte carlo for hierarchical models. Current trends in Bayesian methodology with applications, 79(30):2–4, 2015.

[5] B. Boys, M. Girolami, J. Pidstrigach, S. Reich, A. Mosca, and O. D. Akyildiz. Tweedie moment projected diffusions for inverse problems, 2023.

[6] A. Campbell, J. Benton, V. De Bortoli, T. Rainforth, G. Deligiannidis, and A. Doucet. A continuous time framework for discrete denoising models. Advances in Neural Information Processing Systems, 35:28266–28279, 2022.

[7] G. Cardoso, Y. Janati El Idrissi, S. Le Corff, and E. Moulines. Monte carlo guided diffusion for bayesian linear inverse problems, 2023.

[8] G. V. Cardoso, Y. Janati, S. Le Corff, and É. Moulines. Monte carlo guided diffusion for bayesian linear inverse problems. ArXiv, abs/2308.07983, 2023.

[9] J. Chen and H. Liu. An alternating direction method of multipliers for inverse lithography problem, 2023.

[10] H. Chung and J. C. Ye. Score-based diffusion models for accelerated mri. Medical Image Analysis, page 102479, 2022.

[11] H. Chung, E. S. Lee, and J. C. Ye. Mr image denoising and super-resolution using regularized reverse diffusion. IEEE Transactions on Medical Imaging, 42(4):922–934, 2022.

[12] H. Chung, B. Sim, D. Ryu, and J. C. Ye. Improving diffusion models for inverse problems using manifold constraints. In Advances in Neural Information Processing Systems, 2022.

[13] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.

[14] J. Dainty and J. Fienup. Phase retrieval and image reconstruction for astronomy. Image Recovery: Theory Appl, 13, 1987.

[15] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and L. Fei-Fei. Imagenet: A large-scale hierarchical image database. In 2009 IEEE Conference on Computer Vision and Pattern Recognition, pages 248–255, 2009.

[16] P. Dhariwal and A. Q. Nichol. Diffusion models beat GANs on image synthesis. In Advances in Neural Information Processing Systems, 2021.

[17] Z. Dorjsembe, H.-K. Pao, S. Odonchimed, and F. Xiao. Conditional diffusion models for semantic 3d brain mri synthesis. IEEE Journal of Biomedical and Health Informatics, 2024.

[18] Z. Dou and Y. Song. Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In The Twelfth International Conference on Learning Representations, 2024.

[19] B. T. Feng, J. Smith, M. Rubinstein, H. Chang, K. L. Bouman, and W. T. Freeman. Score-based diffusion models as principled priors for inverse imaging. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 10520–10531, 2023.

[20] M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler, and S. Hochreiter. Gans trained by a two time-scale update rule converge to a local nash equilibrium, 2018.

[21] J. Ho, A. Jain, and P. Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, pages 6840–6851. Curran Associates, Inc., 2020.

[22] A. L. Y. Hung, K. Zhao, H. Zheng, R. Yan, S. S. Raman, D. Terzopoulos, and K. Sung. Med-cdiff: Conditional medical image generation with diffusion models. Bioengineering, 10(11):1258, 2023.

[23] A. Jalal, M. Arvinte, G. Daras, E. Price, A. G. Dimakis, and J. Tamir. Robust compressed sensing mri with deep generative priors. In Advances in Neural Information Processing Systems, pages 14938–14954. Curran Associates, Inc., 2021.

[24] U. Kamilov, C. Bouman, G. Buzzard, and B. Wohlberg. Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications. IEEE Signal Processing Magazine, 40:85–97, 2023.

[25] T. Karras, S. Laine, and T. Aila. A style-based generator architecture for generative adversarial networks. IEEE Transactions on Pattern Analysis & Machine Intelligence, 43(12):4217–4228, 2021.

[26] T. Karras, M. Aittala, T. Aila, and S. Laine. Elucidating the design space of diffusion-based generative models. In Advances in Neural Information Processing Systems, 2022.

[27] T. Karras, M. Aittala, J. Lehtinen, J. Hellsten, T. Aila, and S. Laine. Analyzing and improving the training dynamics of diffusion models, 2024.

[28] S. Kastryulin, J. Zakirov, D. Prokopenko, and D. V. Dylov. Pytorch image quality: Metrics for image quality assessment, 2022.

[29] B. Kawar, G. Vaksman, and M. Elad. SNIPS: Solving noisy inverse problems stochastically. Advances in Neural Information Processing Systems, 34:21757–21769, 2021.

[30] B. Kawar, M. Elad, S. Ermon, and J. Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems, 2022.

[31] X. Li, S. M. Kwon, I. R. Alkhouri, S. Ravishankar, and Q. Qu. Decoupled data consistency with diffusion purification for image restoration, 2024.

[32] H. Liu, J. Xing, M. Xie, C. Li, and T.-T. Wong. Improved diffusion-based image colorization via piggybacked models, 2023.

[33] A. Lou, C. Meng, and S. Ermon. Discrete diffusion language modeling by estimating the ratios of the data distribution. arXiv preprint arXiv:2310.16834, 2023.

[34] A. Lugmayr, M. Danelljan, A. Romero, F. Yu, R. Timofte, and L. Van Gool. Repaint: Inpainting using denoising diffusion probabilistic models, 2022.

[35] M. Mardani, J. Song, J. Kautz, and A. Vahdat. A variational perspective on solving inverse problems with diffusion models. arXiv preprint arXiv:2305.04391, 2023.

[36] X. Meng and Y. Kabashima. Diffusion model based posterior sampling for noisy linear inverse problems. arXiv preprint arXiv:2211.12343, 2022.

[37] N. Metropolis, A. W. Rosenbluth, M. N. Rosenbluth, A. H. Teller, and E. Teller. Equation of state calculations by fast computing machines. The journal of chemical physics, 21(6):1087–1092, 1953.

[38] D. Podell, Z. English, K. Lacey, A. Blattmann, T. Dockhorn, J. Müller, J. Penna, and R. Rombach. Sdxl: Improving latent diffusion models for high-resolution image synthesis, 2023.

[39] A. Ramesh, P. Dhariwal, A. Nichol, C. Chu, and M. Chen. Hierarchical text-conditional image generation with clip latents, 2022.

[40] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10684–10695, 2022.

[41] L. Rout, Y. Chen, A. Kumar, C. Caramanis, S. Shakkottai, and W.-S. Chu. Beyond first-order tweedie: Solving inverse problems using latent diffusion, 2023.

[42] L. Rout, N. Raoof, G. Daras, C. Caramanis, A. Dimakis, and S. Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.

[43] L. Rout, Y. Chen, A. Kumar, C. Caramanis, S. Shakkottai, and W.-S. Chu. Beyond first-order tweedie: Solving inverse problems using latent diffusion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9472–9481, 2024.

[44] C. Saharia, J. Ho, W. Chan, T. Salimans, D. J. Fleet, and M. Norouzi. Image super-resolution via iterative refinement. IEEE Transactions on Pattern Analysis and Machine Intelligence, 45(4):4713–4726, 2023.

[45] B. Song, S. M. Kwon, Z. Zhang, X. Hu, Q. Qu, and L. Shen. Solving inverse problems with latent diffusion models via hard data consistency. In The Twelfth International Conference on Learning Representations, 2024.

[46] J. Song, A. Vahdat, M. Mardani, and J. Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.

[47] Y. Song and S. Ermon. Generative modeling by estimating gradients of the data distribution. In Neural Information Processing Systems, 2019.

[48] Y. Song and S. Ermon. Improved techniques for training score-based generative models. Advances in neural information processing systems, 33:12438–12448, 2020.

[49] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[50] Y. Song, L. Shen, L. Xing, and S. Ermon. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations, 2022.

[51] H. Sun and K. L. Bouman. Deep probabilistic imaging: Uncertainty quantification and multi-modal solution characterization for computational imaging, 2020.

[52] Y. Sun, Z. Wu, Y. Chen, B. Feng, and K. L. Bouman. Provable probabilistic imaging using score-based generative priors. ArXiv, abs/2310.10835, 2023.

[53] P. Tran, A. Tran, Q. Phung, and M. Hoai. Explore image deblurring via encoded blur kernel space. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2021.

[54] Y. Wang, J. Yu, and J. Zhang. Zero-shot image restoration using denoising diffusion null-space model. The Eleventh International Conference on Learning Representations, 2023.

[55] M. Welling and Y. W. Teh. Bayesian learning via stochastic gradient langevin dynamics. In Proceedings of the 28th international conference on machine learning (ICML-11), pages 681–688. Citeseer, 2011.

[56] Z. Wu, Y. Sun, Y. Chen, B. Zhang, Y. Yue, and K. L. Bouman. Principled probabilistic imaging using diffusion models as plug-and-play priors. arXiv preprint arXiv:2405.18782, 2024.

[57] J. Zbontar, F. Knoll, A. Sriram, M. J. Muckley, M. Bruno, A. Defazio, M. Parente, K. J. Geras, J. Katsnelson, H. Chandarana, Z. Zhang, M. Drozdzal, A. Romero, M. G. Rabbat, P. Vincent, J. Pinkerton, D. Wang, N. Yakubova, E. Owens, C. L. Zitnick, M. P. Recht, D. K. Sodickson, and Y. W. Lui. fastmri: An open dataset and benchmarks for accelerated MRI. CoRR, abs/1811.08839, 2018.

[58] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang. The unreasonable effectiveness of deep features as a perceptual metric. In 2018 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 586–595, Los Alamitos, CA, USA, 2018. IEEE Computer Society.

[59] Y. Zhu, K. Zhang, J. Liang, J. Cao, B. Wen, R. Timofte, and L. Van Gool. Denoising diffusion models for plug-and-play image restoration. In IEEE Conference on Computer Vision and Pattern Recognition Workshops (NTIRE), 2023.

**本页范围与校对状态：** 本页为 CVPR 2025 会议论文集版（本地 PDF 11 页）的全文中文译稿：摘要、正文第 1–5 节（含 2.1/2.2、3.1–3.4、4.1–4.4 全部小节）、结论、致谢、图 1–7 图注、表 1–3 逐格、参考文献 [1]–[59]。公式编号沿用原文 (1)–(8)（其中式 (2) 为命题 1 的结论、式 (3) 为 Bayes 分解、式 (4) 为 Langevin 更新、式 (5) 为高斯近似、式 (6) 为扩散分数近似、式 (7) 为各向同性噪声下的简化更新、式 (8) 为潜空间 Langevin 更新）；若干原文未编号的展示式（前向/反向 SDE、后验分解）亦按原文形式给出。表 1 已用 PDF 第 7 页渲染图逐行逐格核对（8 个任务 × 像素/潜/传统三类方法 × FFHQ/ImageNet × 4 指标），表 2、表 3 已用第 8 页渲染图核对。**原文（CVPR 版）无附录、无表格之外的补充材料**；正文多次引用的附录 A–I 不在该 11 页 PDF 内，已在"原文说明"中注明。**页内许可说明（许可待核验、仅学习用途、不计入可公开全文）已保留于页首**。图内图像与曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行保留"会议论文集版本、许可待核验"表述，未改动其许可/统计口径；作者已补全为 Bingliang Zhang、Wenda Chu、Julius Berner、Chenlin Meng、Anima Anandkumar、Yang Song；title 未改。
{% endraw %}
