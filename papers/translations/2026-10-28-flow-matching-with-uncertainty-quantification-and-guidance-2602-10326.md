---
layout: page
title: "带不确定性量化与引导的流匹配｜中文全文译文"
permalink: /papers/translations/2026-10-28-flow-matching-with-uncertainty-quantification-and-guidance-2602-10326/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/bb2ec5a42b895e00/) · [原文 arXiv](https://arxiv.org/abs/2602.10326) · [全部目录](/papers/catalog/)

# 带不确定性量化与引导的流匹配

**原题：** Flow Matching with Uncertainty Quantification and Guidance  
**作者：** Juyeop Han、Lukas Lao Beyer、Sertac Karaman。单位：麻省理工学院（MIT）。邮箱：juyeop@mit.edu、llb@mit.edu、sertac@mit.edu。  
**版本：** arXiv:2602.10326v3（cs.CV），v3 日期 2026 年 10 月 14 日；原文 46 页（NeurIPS 论文格式：正文 p1—15、参考文献 p16—19、附录 p20—46）；2026-10-28 推荐。  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节、更广泛影响声明、致谢、参考文献（英文原条目）、附录 A—J（推导、方差传播、λ* 闭式解、实现细节、附加结果、补充分析、消融、非图像域实验、样本与不确定性）、图 1—23 图注、表 1—15、式（1）—（77）（其中正文 (1)—(15)，附录 (16)—(77) 按原文编号引用）。表 1—15 已用 PDF 渲染核对（表 1、2、3、4、5、6、7、10、11、13、14、15 逐格核对；表 8、9、12 按文本抽取转录）；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写保留英文：UA-Flow（uncertainty-aware flow matching）、UG（uncertainty-aware guidance）、UCFG（uncertainty-aware classifier-free guidance）、APG（adaptive projection guidance）、CFG/CG（classifier-free / classifier guidance）、NLL（negative log-likelihood）、CVaR（conditional value-at-risk）、JVP（Jacobian–vector product）、Heun2（Heun 二阶离散化）、Hutchinson 估计、ADM（abstraction diffusion model）、DiT（diffusion transformer）、NFE（函数评估次数）、TFLOPS、FID、LLLA（last-layer Laplace approximation）、ECE（expected calibration error）、PIT（probability integral transform）、Push-T。**原文疑点/说明（按原文照录并加注）：** ①原文式（2）中偏差修正项写作 $U_t(\mathbf x_t,\mathbf x_1):=\hat u_t(\mathbf x_t)^2-u_t(\mathbf x_t|\mathbf x_1)^2$，该量在 $B\to\infty$ 时趋于真实修正，但 $\hat u_t^2$ 并非 $u_t^2$ 的无偏估计（原文附录 A 有专门讨论）；②原文 §3.2 的方差传播采用 Euler 离散，而正式采样使用 Heun 二阶求解器，二者不一致由附录 C/H.1 讨论；③原文 §4.6.2 提到与 Bertrand 等（2026）的结论一致，即高维空间中经验边缘速度随时间趋于条件速度；④原文附录 G.1 指出 BayesDiff 的不确定性图在高噪声步呈噪声样、并可能主导其传播；⑤原文表 3 的 CIFAR-10 部分与表 4 的 ImageNet 部分为按数据集拆分的小表，本页合并转录时保留原文分栏；⑥原文附录存在少量编号重复（如 Figure 19 在 p40 与 p41 各出现一次），按原文照录。

## 摘要

尽管流匹配等基于采样的生成模型取得了显著成功，它们仍可能产生质量不一致或退化的样本。为评估样本可靠性并提升样本保真度，我们提出**不确定性感知流匹配（uncertainty-aware flow matching, UA-Flow）**——流匹配的一种轻量扩展，它在预测速度场的同时预测**异方差不确定性**。UA-Flow 通过把速度不确定性在流动力学中传播，估计**空间局部化**的样本不确定性。所得估计可作为反映每个生成样本或区域受数据流形支持程度的可靠性信号。我们进一步用这些信号通过**不确定性感知引导（UG）**与**不确定性感知无分类器引导（UCFG）**来操纵生成。在 ImageNet 与 CIFAR-10 上的实验表明，UA-Flow 的不确定性比逐元素基线更一致地追踪样本保真度，且这些信号还携带关于数据流形支持的信息。在 ImageNet 上，UG 以牺牲召回率为代价提升精确率并改善 FID，而 UCFG 在大引导尺度下保持比 CFG 更低的 FID。

## 1 引言

近年来，扩散模型 (Sohl-Dickstein et al., 2015; Ho et al., 2020; Song et al., 2021) 与流匹配 (Lipman et al., 2023; Liu et al., 2023; Albergo & Vanden-Eijnden, 2023) 等基于采样的生成模型在广泛领域取得显著成功，尤其在图像与视频生成 (Dhariwal & Nichol, 2021; Ho et al., 2022) 以及序列决策 (Janner et al., 2022; Chi et al., 2025; Black et al., 2024) 中。尽管有这些进展，这些模型仍常产生质量不一致的样本，因此在下游应用中可靠地使用生成样本仍然困难。

为解决该问题，与每个生成样本相关的不确定性可被解释为**生成过程可靠性的度量**。若干工作通过把面向神经网络的现有不确定性量化技术 (Lakshminarayanan et al., 2017; Kendall & Gal, 2017; Ritter et al., 2018) 适配到基于扩散的生成模型，探索了不确定性估计。在基于采样的生成建模中，不确定性有两个核心作用：(i) 提供评估单个生成样本质量或可靠性的信号；(ii) 可引导生成过程以提升样本质量 (De Vita & Belagiannis, 2025)。然而多数先前工作 (Kou et al., 2023; Jazbec et al., 2025) 主要关注第一个作用，以**事后**方式把不确定性用于样本过滤或选择；此外现有方法常是领域特定的 (Sun et al., 2023; Franchi et al., 2025)，并在条件输入上量化不确定性 (Berry et al., 2024)。

我们提出 **UA-Flow**——流匹配的轻量扩展，对速度场中的异方差不确定性建模。学习速度场与真实速度场之间的差异被概率化地建模为**速度不确定性**；通过把该不确定性在流动力学中传播，UA-Flow 以极小额外开销给出有原则的样本级不确定性估计。由于不确定性是在一般流匹配的**速度层面逐元素**建模的，我们的方法能在每个生成样本内部提供**空间局部化**的不确定性。与依赖领域特定适配（如 (Jazbec et al., 2025) 使用的 CLIP 编码器）的方法不同，该表述原则上不局限于特定数据域。此外，我们可以把学到的速度不确定性用于不确定性感知的引导采样，从而提升生成质量——这一点在密切相关的先前工作 (Kou et al., 2023; Jazbec et al., 2025) 中未被显式考虑。确定性采样使我们能把不确定性定位到学习到的速度场并在动力学中传播，这与随机采样形成对比。

我们在 CIFAR-10、ImageNet-128 与 ImageNet-256 上、在两种设定中实证验证所提方法的不确定性估计。第一，我们给出证据表明 UA-Flow 的不确定性**与样本保真度及训练数据支持程度相关**：不确定性越高，保真度越低、数据支持越弱。特别地，过滤掉高不确定性样本后，其保真度导向指标优于面向基于采样生成模型的先前不确定性量化基线 (Kou et al., 2023; De Vita & Belagiannis, 2025)。此外，生成样本或区域中的高不确定性**与离数据流形更远、数据更稀有相关**。第二，我们用预测的速度不确定性通过 UG 与 UCFG 引导采样。实验表明，UG 以召回率为代价提升精确率并降低 ImageNet 上的 FID；UCFG 在固定 CFG 之上改善最佳 ImageNet FID，并限制大引导尺度下的退化。

## 2 背景

**基于采样的生成模型与引导。** 基于采样的生成模型通过迭代地把样本从简单基分布变换为数据分布来合成数据。扩散模型通过渐进去噪过程实现该变换 (Sohl-Dickstein et al., 2015; Ho et al., 2020; Song et al., 2021)。流匹配则学习一个确定性常微分方程（ODE），其速度场沿规定概率路径输运样本 (Lipman et al., 2023; Liu et al., 2023; Albergo & Vanden-Eijnden, 2023)。在这两类模型中，引导通过修改采样动力学使样本更好地满足条件。分类器引导（CG）把来自外部分类器或约束函数的梯度注入采样更新 (Dhariwal & Nichol, 2021; Dao et al., 2023)；无分类器引导（CFG）在没有独立分类器的情况下外推条件与无条件预测 (Ho & Salimans, 2022; Zheng et al., 2023)。一个实际挑战是强引导可能降低多样性或在大尺度下引入伪影，这促使人们调节有效引导信号或在采样中自适应其强度 (Saharia et al., 2022; Sadat et al., 2024)。

**神经网络的不确定性量化。** 建模偶然（aleatoric）不确定性的常见方法是异方差回归：网络在高斯负对数似然下联合预测均值与输入相关方差 (Nix & Weigend, 1994; Kendall & Gal, 2017)。认知（epistemic）不确定性通常通过贝叶斯启发的技术近似 (Gal & Ghahramani, 2016; Lakshminarayanan et al., 2017; Ritter et al., 2018)。尽管这在分类与回归中是标准做法，将其应用于基于采样的生成模型需要明确**哪些**中间量是不确定的（如分数/速度或条件输入）以及不确定性**如何**在采样动力学中传播。

**基于采样生成模型的不确定性量化。** 现有面向基于采样生成模型的不确定性量化（UQ）方法大多以扩散为中心，可按**不确定性建模位置**大致分组。一些工作在条件扩散的条件输入上量化不确定性 (Berry et al., 2024)；另一些为领域特定的生成与决策开发扩散模型不确定性，包括轨迹规划与多智能体预测 (Sun et al., 2023; Capellera et al., 2025) 以及文本到图像的不确定性分析 (Franchi et al., 2025)；第三类针对**生成样本本身**的不确定性：BayesDiff (Kou et al., 2023) 使用贝叶斯/Laplace 估计器 (Daxberger et al., 2021) 并在扩散动力学中传播不确定性；其他方法依赖基于 CLIP 编码器的特征空间似然 (Radford et al., 2021; Jazbec et al., 2025)，或逐像素偶然不确定性用于可靠性打分与不确定性引导采样 (De Vita & Belagiannis, 2025)。尽管有这些进展，**流匹配特有的 UQ 仍研究不足**——尽管其确定性 ODE 结构恰使对学习速度场建模不确定性并在动力学中传播成为可能。

## 3 不确定性感知流匹配

流匹配学习一个时变速度场，把样本沿规定概率路径从基分布 $\mathbf x_0\sim p_0$ 输运到数据 $\mathbf x_1\sim p_1$。我们采用常见仿射路径 $\mathbf x_t=\alpha_t\mathbf x_1+\beta_t\mathbf x_0$（$t\in[0,1]$），它诱导条件分布 $p_t(\mathbf x_t|\mathbf x_1)$ 及相应闭式条件目标速度 $u_t(\mathbf x_t|\mathbf x_1)$ (Lipman et al., 2024)。

这里我们把**速度不确定性**解释为学习到的均值速度与真实边缘速度之间随时间和状态变化的差异。若学习到的均值精确恢复边缘速度，该差异与建模的不确定性将消失；但实践中有限训练数据、有限模型容量与优化误差等因素造成局部速度误差，这些误差沿 ODE 轨迹累积后可能使生成样本偏离数据分布支持的区域。UA-Flow 对这些局部差异概率化建模，并使其在流动力学中传播以量化样本级不确定性。

### 3.1 概率速度场建模

UA-Flow 旨在以目标速度 $u_t(\mathbf x_t)$ 为监督，学习速度场的均值 $\bar u_t^\theta(\mathbf x_t)\in\mathbb R^n$ 与对角方差 $(\sigma_t^\theta(\mathbf x_t))^2\in\mathbb R^n$。我们用**速度不确定性**指代该预测的逐元素方差。这些预测定义高斯速度模型 $u_t^\theta(\mathbf x_t)=\bar u_t^\theta(\mathbf x_t)+\sigma_t^\theta(\mathbf x_t)\odot\boldsymbol\epsilon$，其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$、$\odot$ 为逐元素乘。

为计算效率与表示简洁，我们**逐元素**估计方差——这是神经网络不确定性量化中的常见做法 (Kendall & Gal, 2017)。我们以目标速度的高斯负对数似然（NLL）损失形式提出不确定性感知流匹配损失 $\mathcal L_{\mathrm{UFM}}(\theta)$：

$$
\mathcal L_{\mathrm{UFM}}(\theta)=\mathbb E_{t,p_t(\mathbf x_t)}\left[\frac{\left(\bar u_t^\theta(\mathbf x_t)-u_t(\mathbf x_t)\right)^2}{2\left(\sigma_t^\theta(\mathbf x_t)\right)^2}+\log\left(\sigma_t^\theta(\mathbf x_t)\right)\right].\tag{1}
$$

$\mathcal L_{\mathrm{UFM}}$ 中所有运算均逐元素进行，该约定贯穿全文。与标准流匹配一样，目标速度 $u_t(\mathbf x_t)$ 不能直接获得，训练改为在 $p_t(\mathbf x_t|\mathbf x_1)$ 下把模型回归到条件速度 $u_t(\mathbf x_t|\mathbf x_1)$。遵循相同原则，UA-Flow 最小化条件不确定性感知流匹配损失 $\mathcal L_{\mathrm{CUFM}}$——它用条件速度重写 $\mathcal L_{\mathrm{UFM}}$：

$$
\mathcal L_{\mathrm{CUFM}}(\theta)=\mathbb E_{t,p_1(\mathbf x_1),p_t(\mathbf x_t|\mathbf x_1)}\left[\frac{U_t(\mathbf x_t,\mathbf x_1)}{2\left(\sigma_t^\theta(\mathbf x_t)\right)^2}+\frac{\left(\bar u_t^\theta(\mathbf x_t)-u_t(\mathbf x_t|\mathbf x_1)\right)^2}{2\left(\sigma_t^\theta(\mathbf x_t)\right)^2}+\log\left(\sigma_t^\theta(\mathbf x_t)\right)\right],\tag{2}
$$

其中 $U_t(\mathbf x_t,\mathbf x_1):=\hat u_t(\mathbf x_t)^2-u_t(\mathbf x_t|\mathbf x_1)^2$ 近似精确的逐元素修正 $U_t^\star(\mathbf x_t,\mathbf x_1):=u_t(\mathbf x_t)^2-u_t(\mathbf x_t|\mathbf x_1)^2$。在标准流匹配使用的均方误差目标 (Lipman et al., 2023) 中，类似修正与参数 $\theta$ 无关因而可省略而不改变优化器；但在我们的高斯 NLL 目标中，该修正被 $1/[2(\sigma_t^\theta(\mathbf x_t))^2]$ 加权，因而依赖参数 $\theta$。

由于**边缘速度 $u_t(\mathbf x_t)$ 不可处理**，我们用如下重加权小批量估计器近似：

$$
\hat u_t(\mathbf x_t)=\frac{\sum_{b=1}^{B}u_t(\mathbf x_t|\mathbf x_{1,b})p_t(\mathbf x_t|\mathbf x_{1,b})}{\sum_{b=1}^{B}p_t(\mathbf x_t|\mathbf x_{1,b})}.\tag{3}
$$

附录 A 详细推导 $\mathcal L_{\mathrm{CUFM}}(\theta)$ 作为 $\mathcal L_{\mathrm{UFM}}(\theta)$ 近似的由来，并说明保留 $U_t(\mathbf x_t,\mathbf x_1)$ 比置零给出更接近的替代目标——尽管 $\hat u_t(\mathbf x_t)^2$ 并非 $u_t(\mathbf x_t)^2$ 的无偏估计。我们实证观察到该修正在采样早期最大，而更大迷你批提升其在 ImageNet-256 上的估计精度（§4.6.2）。

**注：** UA-Flow 可在预训练流匹配模型上微调；我们发现这能在模型学习不确定性的同时保持生成质量。为得到更好的均值估计，我们对每个逐元素 NLL 项使用带因子 $\mathrm{sg}[({\sigma_t^\theta(\mathbf x_t)})^2{}^\beta]$ 的 $\beta$-NLL 损失 (Seitzer et al., 2022)，其中 $\mathrm{sg}$ 表示停止梯度，$\beta\in[0,1]$。

### 3.2 不确定性经流动力学的传播

我们旨在由沿流累积的速度不确定性估计生成样本的不确定性。网络预测 $u_t^\theta(\mathbf x_t)$ 的均值 $\bar u_t^\theta(\mathbf x_t)$ 与方差 $(\sigma_t^\theta(\mathbf x_t))^2$。首先从基分布 $p_0$ 抽取初态 $\mathbf x_0$；对每个样本固定该初态并设 $\bar{\mathbf x}_0=\mathbf x_0$、$\mathrm{Var}[\mathbf x_0]=\mathbf 0$。随后传播状态均值 $\bar{\mathbf x}_t$ 与方差 $\mathrm{Var}[\mathbf x_t]$；该方差描述固定初态下由高斯速度模型带来的不确定性。

我们把端点均值 $\bar{\mathbf x}_1$ 视为生成的样本，把传播得到的逐元素方差 $\mathrm{Var}[\mathbf x_1]$ 视为其**样本不确定性图**。该图保留每个坐标的不确定性；**样本级不确定性分数**是由该图或由预测端点分布的样本导出的标量，§4 指明每个实验所用的分数。

均值与协方差近似都使用围绕 $\bar{\mathbf x}_t=\mathbb E[\mathbf x_t]$ 的同一一阶 Taylor 展开：

$$
\bar u_t^\theta(\mathbf x_t)=\bar u_t^\theta(\bar{\mathbf x}_t)+\mathbf J_t^\theta(\bar{\mathbf x}_t)(\mathbf x_t-\bar{\mathbf x}_t)+O\!\left(\|\mathbf x_t-\bar{\mathbf x}_t\|^2\right).\tag{4}
$$

这里 $\mathbf J_t^\theta(\bar{\mathbf x}_t)\in\mathbb R^{n\times n}$ 表示均值速度对状态在 $\bar{\mathbf x}_t$ 处的 Jacobian。线性项在期望中消失，忽略高阶项得到均值动力学

$$
\frac{\mathrm d\bar{\mathbf x}_t}{\mathrm dt}=\bar u_t^\theta(\bar{\mathbf x}_t).\tag{5}
$$

对方差传播我们使用 Euler 离散 $\mathbf x_{t+\Delta t}=\mathbf x_t+u_t^\theta(\mathbf x_t)\Delta t$，因为更高阶求解器会增加解析复杂度与计算成本。与 BayesDiff (Kou et al., 2023) 一样，我们把逐元素方差从 $\mathbf x_t$ 到 $\mathbf x_{t+\Delta t}$ 的演化近似为

$$
\mathrm{Var}[\mathbf x_{t+\Delta t}]\approx\mathrm{Var}[\mathbf x_t]+\left(\sigma_t^\theta(\bar{\mathbf x}_t)\Delta t\right)^2+2\Delta t\,\mathrm{Cov}\left(\mathbf x_t,u_t^\theta(\mathbf x_t)\right),\tag{6}
$$

其中 $(\sigma_t^\theta(\bar{\mathbf x}_t))^2$ 是在均值状态处评估的预测速度方差，$\mathrm{Cov}(\mathbf x_t,u_t^\theta(\mathbf x_t))\in\mathbb R^n$ 表示状态与其速度之间的逐元素协方差。出于高维空间中的计算与空间可处理性，我们把所有协方差视为逐元素协方差。速度方差量化注入的速度噪声，而状态–速度协方差刻画状态不确定性如何与速度场的局部灵敏度耦合。

把式（4）的线性项代入逐元素 $\mathrm{Cov}(\mathbf x_t,u_t^\theta(\mathbf x_t))$，把它近似为

$$
\mathrm{Cov}\left(\mathbf x_t,u_t^\theta(\mathbf x_t)\right)\approx\mathrm{diag}\left(\mathbf J_t^\theta(\bar{\mathbf x}_t)\right)\odot\mathrm{Var}[\mathbf x_t],\tag{7}
$$

其中 $\mathbf J_t^\theta(\bar{\mathbf x}_t)=\frac{\partial\bar u_t^\theta}{\partial\mathbf x_t}\big|_{\bar{\mathbf x}_t}\in\mathbb R^{n\times n}$ 为均值速度对状态在 $\bar{\mathbf x}_t$ 处的 Jacobian，$\odot$ 为逐元素乘。由于显式构造 $\mathrm{diag}(\mathbf J_t^\theta(\bar{\mathbf x}_t))$ 在高维中不可行，我们用 Hutchinson 对角估计器 (Bekas et al., 2007; Dharangutte & Musco, 2023) 近似 $\mathrm{diag}(\mathbf J_t^\theta(\bar{\mathbf x}_t))\odot\mathrm{Var}[\mathbf x_t]$。因此协方差 $\mathrm{Cov}(\mathbf x_t,u_t^\theta)$ 可估计为

$$
\mathrm{Cov}\left(\mathbf x_t,u_t^\theta(\mathbf x_t)\right)\approx\frac1S\sum_{i=1}^{S}\left(\sigma_{\mathbf x_t}\odot\mathbf r_i\right)\odot\left(\mathbf J_t^\theta(\bar{\mathbf x}_t)\left(\sigma_{\mathbf x_t}\odot\mathbf r_i\right)\right)\tag{8}
$$

其中 $\sigma_{\mathbf x_t}=\sqrt{\mathrm{Var}[\mathbf x_t]}$，每个 $\mathbf r_i\in\mathbb R^n$ 为各分量独立均匀取自 $\{-1,+1\}$ 的 Rademacher 向量，$S$ 为 Monte Carlo 探针数。利用 Jacobian–向量乘积（JVP）(Baydin et al., 2018)，$\mathbf J_t^\theta(\bar{\mathbf x}_t)(\sigma_{\mathbf x_t}\odot\mathbf r_i)$ 可通过自动微分高效计算而无需显式构造 $\mathbf J_t^\theta$。算法 1 汇总式（8）对应的 Monte Carlo 估计器。

式（5）—（8）的完整推导以及其他协方差近似见附录 B。为完整性，附录 C 还推导 Heun 二阶（Heun2）离散下的方差传播规则；§H.1 对两种方法做实证比较。

```text
Algorithm 1 估计 diag(J_t^θ(x̄_t)) ⊙ Var[x_t]
输入：ū_t^θ(·)：速度均值；x̄_t：状态均值；Var[x_t]：状态方差；S：探针数
1: σ_t^x ← √Var[x_t]，g ← 0
2: for k = 1, ..., S do
3:     采样 r^(k) ∈ {±1}^n
4:     v^(k) ← σ_t^x ⊙ r^(k)
5:     Jv^(k) ← JVP(ū_t^θ, x̄_t, v^(k))
6:     g ← g + v^(k) ⊙ Jv^(k)
7: end for
8: return g/S
```

### 3.3 面向流匹配的不确定性感知引导

我们把预测的速度不确定性纳入引导采样，通过修改式（5）的均值动力学实现。我们给出两种机制：(i) 基于不确定性的伪似然，其梯度用作引导项；(ii) 自适应选择 CFG 尺度以降低外推速度的预测方差。

**不确定性感知引导（UG）。** 标准引导通过把 $b_tw\nabla_{\mathbf x_t}\log p_t(\mathbf y|\mathbf x_t)$ 加到速度场 $u_t^\theta(\mathbf x_t)$ 上，把生成引向条件 $\mathbf y$，其中 $w\ge0$ 为引导尺度，$b_t=-\frac{\dot\beta_t\beta_t\alpha_t-\dot\alpha_t\beta_t^2}{\alpha_t}$ 为仿射路径 $\mathbf x_t=\alpha_t\mathbf x_1+\beta_t\mathbf x_0$ 的路径相关系数 (Dhariwal & Nichol, 2021; Lipman et al., 2024)。

为把采样偏向低不确定性区域，我们定义给定状态下预测方差的伪似然：

$$
\tilde p_t\left((\sigma_t^\theta)^2\mid\mathbf x_t\right)\propto\exp\left(f\left((\sigma_t^\theta(\mathbf x_t))^2\right)\right),\tag{9}
$$

其中标量函数 $f$ 在预测速度方差较小时取较大值，因此 $\tilde p_t$ 偏好低预测不确定性的状态。把 $\nabla_{\mathbf x_t}\log\tilde p_t((\sigma_t^\theta)^2\mid\mathbf x_t)=\nabla_{\mathbf x_t}f((\sigma_t^\theta(\mathbf x_t))^2)$ 代入分类器引导模板，得到 UG 均值速度：

$$
\bar u_{t,\mathrm{UG}}^\theta(\bar{\mathbf x}_t)=\bar u_t^\theta(\bar{\mathbf x}_t)+b_tw\nabla_{\bar{\mathbf x}_t}f\left((\sigma_t^\theta(\bar{\mathbf x}_t))^2\right),\tag{10}
$$

它把轨迹引向低不确定性区域。实验中我们取逐元素预测方差的负平方均值，$f(\boldsymbol\sigma^2)=-\left(\frac1n\sum_{i=1}^n\sigma_i^2\right)^2$；§H.2 表明 UG 对 $f$ 的选择稳健。

**不确定性感知无分类器引导（UCFG）。** 当 UA-Flow 以无分类器条件化训练时，CFG 外推的均值速度为

$$
\bar u_{t,\mathrm{CFG}}^\theta(\bar{\mathbf x}_t|\mathbf y)=(1+\lambda)\bar u_t^\theta(\bar{\mathbf x}_t|\mathbf y)-\lambda\bar u_t^\theta(\bar{\mathbf x}_t|\varnothing),\tag{11}
$$

其中 $\lambda\ge0$ 为 CFG 尺度，$\varnothing$ 表示空条件。在 CFG 讨论中，**条件与无条件**分别指以类别条件 $\mathbf y$ 与空条件 $\varnothing$ 预测；§3.1 中的条件目标速度以数据端点 $\mathbf x_1$ 为条件。

记 $\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)$ 与 $\sigma_{t,\varnothing}^\theta(\bar{\mathbf x}_t)$ 分别为条件与无条件速度的逐元素预测标准差。对坐标 $i$，CFG 速度的方差为

$$
\left[\mathrm{Var}\left(u_{t,\mathrm{CFG}}^\theta(\mathbf x_t|\mathbf y)\right)\right]_i=(1+\lambda)^2(\sigma_{t,\mathbf y,i}^\theta(\bar{\mathbf x}_t))^2+\lambda^2(\sigma_{t,\varnothing,i}^\theta(\bar{\mathbf x}_t))^2-2\lambda(1+\lambda)r_i\sigma_{t,\mathbf y,i}^\theta(\bar{\mathbf x}_t)\sigma_{t,\varnothing,i}^\theta(\bar{\mathbf x}_t),\tag{12}
$$

其中 $r_i$ 为条件与无条件速度分量之间的相关系数。两个速度预测来自同一网络、同一状态，仅条件不同，这启发强相关近似 $r_i\approx1$。在该近似下 CFG 速度方差为

$$
\mathrm{Var}\left[u_{t,\mathrm{CFG}}^\theta(\mathbf x_t|\mathbf y)\right]\approx\left((1+\lambda)\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)-\lambda\sigma_{t,\varnothing}^\theta(\bar{\mathbf x}_t)\right)^2.\tag{13}
$$

经验上，ImageNet-256 上预测的条件与无条件均值速度具有 Pearson 相关 $r=0.993$（由跨所有采样步的逐元素值汇总计算；每个单独步的相关均超过 0.98，见 §G.4）。

对每个样本，我们选择一个标量 $\lambda$ 以最小化外推速度的总预测方差，并把该尺度上限设为 $\lambda_{\max}$ 以防止外推速度发散：

$$
\lambda^*=\min(\lambda_{\mathrm{opt}},\lambda_{\max}),\tag{14}
$$

其中

$$
\lambda_{\mathrm{opt}}=\arg\min_{\lambda\ge0}\sum_{i=1}^{n}\left((1+\lambda)\sigma_{t,\mathbf y,i}^\theta(\bar{\mathbf x}_t)-\lambda\sigma_{t,\varnothing,i}^\theta(\bar{\mathbf x}_t)\right)^2.\tag{15}
$$

这里求和遍历一个样本的坐标；$\lambda_{\mathrm{opt}}$ 的闭式解见附录 D。UCFG 在每个采样步对每个样本重算 $\lambda_{\mathrm{opt}}$ 与 $\lambda^*$，并受 $\lambda_{\max}$ 截断。UCFG 与 UG 可在每个采样步顺序应用：UCFG 先由式（11）、（13）、（14）返回引导后的均值与方差，UG 再由该局部引导方差计算梯度并在式（10）中加入修正。

## 4 实验

我们设计实验以评估 UA-Flow 估计的不确定性是否 (i) 可作为生成样本的**样本级可靠性信号**；(ii) 表示每个生成样本受数据集流形支持的**弱程度**；(iii) 可作为**控制信号**通过引导采样改善生成。为评估 (i)，我们过滤掉高不确定性生成图像，并把所得 FID 与精确率/召回率同基线不确定性估计方法比较（§4.2）；为评估 (ii)，我们度量估计不确定性与两个基于流形的量——到数据流形的距离与稀有度——的相关性，并再次与基线比较（§4.3）；为评估 (iii)，我们在匹配采样设置下对 UG（§4.4）与 UCFG（§4.5）做受控消融。

### 4.1 实验设置

我们在 CIFAR-10 (Krizhevsky et al., 2010) 与 ImageNet (Deng et al., 2009) 的 $128\times128$（ImageNet-128）与 $256\times256$（ImageNet-256）分辨率上评估方法。我们报告生成质量指标 Fréchet Inception Distance（FID）(Heusel et al., 2017) 与精确率/召回率 (Kynkäänniemi et al., 2019)，以及样本级流形指标：到数据流形的距离与稀有度 (Han et al., 2023)。FID 衡量生成与真实图像的整体分布相似性，精确率与召回率分别刻画样本保真度与分布覆盖；到数据流形的距离是生成样本到其 $k$ 近邻真实样本的特征空间距离（此处 $k=3$），稀有度量化生成样本相对真实数据的非典型程度。本节未详述的细节见附录 E。

**训练与模型架构。** CIFAR-10 上我们使用基于 ADM (Dhariwal & Nichol, 2021) 的像素空间无条件流匹配模型；ImageNet 上采用基于 DiT 的条件潜空间流匹配模型 (Dao et al., 2023)，在缩放至 $128\times128$ 与 $256\times256$ 的图像上训练。具体地，我们以 DiT-B/2 (Peebles & Xie, 2023) 为主干，并使用 Stable Diffusion (Rombach et al., 2022) 的预训练自编码器把 RGB 图像映射为下采样比 8、4 通道的潜张量。CIFAR-10 与 ImageNet-128 上，我们首先训练普通流匹配模型，再通过增加方差预测头进行微调；ImageNet-256 上，我们微调先前工作 (Dao et al., 2023) 发布的预训练潜空间流匹配模型。

**采样过程。** 所有图像生成实验使用二阶 Heun 求解器、50 个采样步。UA-Flow 按 §3.2 所述使用 Euler 更新传播不确定性。CIFAR-10 采用 EDM 采样调度 (Karras et al., 2022)，ImageNet 采用均匀时间步。UG 每两个采样步应用一次，而 CFG 与 UCFG 每步应用。

**基线。** 我们与 BayesDiff (Kou et al., 2023)、偶然不确定性（AU）(De Vita & Belagiannis, 2025) 与生成式不确定性（GenUnc）(Jazbec et al., 2025) 比较。由于这些方法原本面向扩散模型，我们通过在速度场上定义不确定性并在流动力学中传播，把它们适配到流匹配；实现细节见 §E.2。

**UA-Flow + CLIP。** 我们额外引入一个在 CLIP 嵌入空间对不确定性打分的变体：具体从预测分布 $\mathcal N(\bar{\mathbf x}_1,\mathrm{Var}[\mathbf x_1])$ 抽取多个样本 $\mathbf x_{1,i}$，以其 CLIP 嵌入的方差作为样本级不确定性分数，与 GenUnc 类似。

**图 1：** ImageNet-256（类别 *guinea pig*）上的 UG 与 UCFG 扫描。左：生成样本；右：预测的潜像素级不确定性（越亮不确定性越高）。行扫描 UG 尺度 $w\in\{0,10,30,50\}$，列扫描最大 UCFG 尺度 $\lambda_{\max}\in\{0,1,2,5,10,20\}$；更强引导产生类别更一致、预测不确定性更低的样本。（来源：原文第 2 页。）

### 4.2 过滤高不确定性图像

我们通过逐步过滤高不确定性生成样本并跟踪 FID 与精确率/召回率的变化，评估预测不确定性是否提供样本级可靠性信号。

**用于过滤的不确定性聚合。** 过滤需要每样本一个标量不确定性分数。GenUnc 与 UA-Flow + CLIP 直接输出 CLIP (Radford et al., 2021) 嵌入空间中的标量，而 UA-Flow、BayesDiff 与 AU 产生逐元素不确定性图。对这些逐元素方法，我们以不确定性图中**最高 10%** 元素（top-10%）的均值作为样本分数，以抑制大面积低不确定性背景的影响。该 top-10% 均值即水平 $\alpha=0.1$ 的经验条件风险价值（CVaR），$\mathrm{CVaR}_{0.1}(u)=\mathbb E[u|u\ge Q_{0.9}(u)]$，是标准的尾部风险目标 (Rockafellar et al., 2000)。对 UA-Flow 与 BayesDiff，不确定性图为传播得到的端点方差 $\mathrm{Var}[\mathbf x_1]$；AU 则在采样后期步上聚合速度方差（§E.2）。遵循 BayesDiff 的协议，UA-Flow 与 BayesDiff 每四个采样步更新一次不确定性，且式（8）协方差估计器使用单次 Monte Carlo 探针（$S=1$）；§H.1 表明更多探针并不会明显改善过滤。

**过滤流程。** 在无引导下，我们为每个数据集生成 100k 张图像（ImageNet 用类别条件不确定性、CIFAR-10 用无条件），按样本级不确定性分数排序，并逐步移除最高 10%，直至 50%。在每个比例下，指标在 50k 张随机抽取图像上相对 50k 张参考图计算。

**结果。** UA-Flow 过滤诱导精确率—召回率折中（图 2、9a、9b）：过滤比例提高会提升精确率、降低召回率。在 ImageNet 上，过滤后 FID 改善；在 CIFAR-10 上，由于未过滤时 FID 已很低，FID 随过滤比例上升。与逐元素基线（AU、BayesDiff）相比，UA-Flow 在 ImageNet-128/256 上过滤后取得更低 FID 与更高精确率。AU 的召回率持续下降，而精确率或下降或不显著提升；BayesDiff 在 CIFAR-10 上表现出轻微精确率—召回率折中，但该效应未延续到 ImageNet。这些过滤结果共同表明，在流匹配下，AU 与 BayesDiff 均未在所测数据集上提供一致的样本保真度信号。定性上，图 3 表明 UA-Flow 的不确定性图定位了高不确定性区域，而 AU 产生大体反相的模式、BayesDiff 产生无法定位的噪声图；更多潜空间比较与 BayesDiff 噪声图的分析见 §F.1 与 §G.1。AU 计算成本最低，但 UA-Flow 在 CIFAR-10 上仅比它高 10%、在 ImageNet-128/256 上不到 1%，同时比 BayesDiff 便宜 1.7—1.8 倍（表 1）。

**表 1：采样与不确定性量化每张图像的计算成本（TFLOPS）。** Vanilla 只报告采样成本。（来源：原文第 9 页。）

| 方法 | CIFAR-10 | ImageNet-128 | ImageNet-256 |
|---|---|---|---|
| Vanilla | 4.044 | 1.112 | 4.601 |
| AU | 5.014 | 1.379 | 5.706 |
| BayesDiff | 9.201 | 2.479 | 10.26 |
| GenUnc | 24.32 | 7.655 | 31.39 |
| UA-Flow | 5.506 | 1.380 | 5.761 |
| UA-Flow + CLIP | 5.550 | 2.200 | 8.916 |

GenUnc 在其默认聚合下取得比 UA-Flow 更低的 FID；但把 UA-Flow 的不确定性在相同 CLIP 嵌入空间中聚合（UA-Flow + CLIP）可恢复可比的精确率—召回率折中，在 ImageNet-128/256 上 FID 优于 GenUnc、在 CIFAR-10 上 FID 略差，而计算量少 3.5—4.4 倍（表 1）。

**图 2：** ImageNet-256 上生成质量指标随过滤比例的变化。每个过滤水平移除高不确定性样本，并从其余样本抽取 50k 张评估。相比逐元素基线 AU (De Vita & Belagiannis, 2025) 与 BayesDiff (Kou et al., 2023)，UA-Flow 过滤后取得更低 FID 与更高精确率；UA-Flow + CLIP 进一步匹配基于 CLIP 的标量参考 GenUnc (Jazbec et al., 2025)。（来源：原文第 8 页。）

**图 3：** UA-Flow、AU 与 BayesDiff 在生成样本上的不确定性图（越亮不确定性越高；每图归一化）。(a) CIFAR-10（像素空间）；(b) ImageNet-128（潜空间）；(c) ImageNet-256（潜空间）。UA-Flow 定位高不确定性区域，AU 常产生反相模式，BayesDiff 产生噪声图。（来源：原文第 8 页。）

### 4.3 不确定性与流形支持的相关性

过滤表明不确定性可区分可靠与不可靠样本，但未说明原因。我们因此检验更高预测不确定性是否与更弱的数据流形支持相关：用**到数据流形的距离**与**稀有度分数**量化流形支持，并度量预测不确定性与二者的相关强度（计算稀有度分数时排除被判定为已存在于数据流形之外的生成样本与 patch）。

在无引导下，我们为每个数据集生成 5,000 张图像并相对 5,000 张参考图评估。与 §4.2 一样，不确定性每四个采样步更新一次，且式（8）协方差估计器使用单次探针（$S=1$）。我们报告不确定性分数与每个流形指标的 Spearman 秩相关 $\rho$，在两个层面度量：**样本级**（每张图像一个分数）与**patch 级**（每个图像 patch 一个分数）。

**样本级相关。** 两个指标对每张生成图像整体计算，并与每张图像一个标量不确定性做相关。该比较使用 CLIP 空间分数 UA-Flow + CLIP 与 GenUnc，因为 §4.2 表明 CLIP 嵌入的方差比在像素或潜空间聚合的不确定性更紧密追踪样本级可靠性。

**patch 级相关。** 样本级分数把一张图压缩为标量，而 UA-Flow 在生成样本内**空间地**解析不确定性。为检验该空间结构是否与局部流形支持相关，我们局部计算同样两个指标：把生成与参考样本划分为不重叠 patch——ImageNet-128/256 用 $2\times2$ 潜空间 patch，CIFAR-10 用 $4\times4$ 像素空间 patch。一个 patch 的不确定性分数为其逐元素不确定性图在该 patch 元素上的求和，因此 UA-Flow、AU 与 BayesDiff 均在该粒度比较。

**结果。** 在样本级设定中，UA-Flow + CLIP 在 ImageNet-128/256 上同时与到数据流形距离和稀有度分数相关性更强，而 GenUnc 在 CIFAR-10 上领先。为定位该差距来源，我们在 CIFAR-10 上丢弃 §3.2 的方差传播，改为在每个采样步从学习的均值与方差中抽取一个速度，并直接以所得样本的方差作为 GenUnc 那样使用：此时与到数据流形距离和稀有度的相关分别升至 0.3524 与 0.3282，高于 GenUnc 的 0.3462 与 0.3184。该比较说明 UA-Flow 学到的速度不确定性携带关于流形支持的信息，而其中一部分在方差传播近似中损失。在直接采样下，UA-Flow 更高的端点相关也表明其优于 GenUnc 所用的末层 Laplace 近似（LLLA）(Daxberger et al., 2021) 得到的速度不确定性。

**表 2：预测不确定性与流形支持之间的 Spearman 秩相关 $\rho$。** 样本级方法每图产生单个 CLIP 空间标量，patch 级方法产生逐元素不确定性图并在 patch 级相关。样本级上 UA-Flow + CLIP 在 ImageNet-128 与 ImageNet-256 最强、GenUnc 在 CIFAR-10 领先；patch 级上 UA-Flow 在每个数据集上对到数据流形距离（Dist. to manifold）与稀有度分数都取得最强相关。（来源：原文第 10 页。）

| 数据集 | 指标 | 样本级 GenUnc | 样本级 UA-Flow+CLIP | 样本级 AU | 样本级 BayesDiff | patch 级 UA-Flow |
|---|---|---|---|---|---|---|
| CIFAR-10 | 到流形距离 | 0.3462 | 0.2421 | −0.5654 | 0.5064 | 0.6114 |
| CIFAR-10 | 稀有度 | 0.3184 | 0.2183 | −0.5603 | 0.4803 | 0.6066 |
| ImageNet-128 | 到流形距离 | 0.3579 | 0.3672 | −0.3187 | 0.1340 | 0.4609 |
| ImageNet-128 | 稀有度 | 0.3501 | 0.3901 | −0.2925 | 0.1078 | 0.4037 |
| ImageNet-256 | 到流形距离 | 0.4190 | 0.4426 | −0.4719 | 0.1820 | 0.5404 |
| ImageNet-256 | 稀有度 | 0.3995 | 0.4165 | −0.4154 | 0.1422 | 0.4771 |

除该情形外，基于 UA-Flow 的方法都比所有基线相关更高。正相关表明更高不确定性**与离数据流形更远、稀有度更高相关**，支持"UA-Flow 的不确定性携带关于每个生成样本受数据流形支持弱程度的信息"这一假设；此外更高的 patch 级相关表明 UA-Flow 在空间上捕捉了该信息。

### 4.4 不确定性感知引导

我们在固定 CFG 尺度 $\lambda\in\{0,0.25,0.5\}$ 下扫描 UG 尺度 $w\in[0,50]$ 评估 UG（当 $w=0$ 与 $\lambda=0$ 时 UG 与 CFG 分别失效）。"CFG + UG" 先用式（11）、（13）构造标准 CFG 均值及其固定 $\lambda$ 方差，再应用式（10）的不确定性感知修正；它不使用自适应 UCFG。因此表 3 固定 $\lambda\in\{0,0.25,0.5\}$ 并扫描 $w$，以在匹配 CFG 强度下单独考察 UG。

**结果。** 增大 $w$ 诱导精确率—召回率折中：精确率总体上升、召回率下降（图 4 的 ImageNet-256）。在非零 CFG 尺度下，FID 随 UG 强度先降至最优、随后上升。在 CIFAR-10 上，由于基线 FID 已很低，该折中可能表现为 FID 轻微上升，与 §4.2 观察到的过滤行为一致。表 3 汇总匹配 CFG 尺度下加与不加 UG 的生成质量，报告每个 CFG 设置下 FID 最低的 UG 配置；我们还纳入基于 AU 的不确定性感知引导作为参考基线。AU 在流匹配下只引起生成指标的边际变化，与 §4.2 中其不确定性估计与样本级保真度相关性弱的结论一致。

**图 4：** 固定 CFG 尺度 $\lambda\in\{0,0.25,0.5\}$ 下，ImageNet-256 的 FID、精确率与召回率随 UG 尺度 $w$ 的变化。增大 $w$ 总体提升精确率并降低召回率；在非零 CFG 尺度下，FID 在中等 UG 强度处达到最小后上升。（来源：原文第 10 页。）

**表 3：各数据集上不确定性感知引导（UG）下的 FID、精确率与召回率。** 对每个 CFG 尺度 $\lambda$，报告表现最佳（FID 最低）的 UG 设置；AU 表示使用偶然不确定性的不确定性感知引导 (De Vita & Belagiannis, 2025)，作为参考基线。匹配 CFG 设置下 UG 相比 vanilla 一致提升精确率，并在 ImageNet-128 与 ImageNet-256 上取得更好 FID。（来源：原文第 11 页。）

（原文表 3 按数据集拆为三个子表：(a) CIFAR-10、(b) ImageNet-128、(c) ImageNet-256。）

**表 3(a) CIFAR-10：**

| 设置 | $w$ | FID↓ | Prec.↑ | Rec.↑ |
|---|---|---|---|---|
| AU | – | 2.18 | 0.6549 | 0.6328 |
| Vanilla | – | 2.13 | 0.6570 | 0.6289 |
| 仅 UG | 10 | 2.43 | 0.6585 | 0.6245 |

**表 3(b) ImageNet-128：**

| 设置 | $\lambda$ | $w$ | FID↓ | Prec.↑ | Rec.↑ |
|---|---|---|---|---|---|
| AU | – | – | 27.21 | 0.4500 | 0.6618 |
| Vanilla | 0.0 | 0 | 27.23 | 0.4525 | 0.6697 |
| 仅 UG | – | 30 | 19.00 | 0.4925 | 0.6412 |
| 仅 CFG | 0.25 | 0 | 14.76 | 0.5442 | 0.6297 |
| CFG + UG | 0.25 | 20 | 10.71 | 0.5798 | 0.6120 |
| 仅 CFG | 0.5 | 0 | 8.29 | 0.6251 | 0.5858 |
| CFG + UG | 0.5 | 20 | 6.95 | 0.6452 | 0.5633 |

**表 3(c) ImageNet-256：**

| 设置 | $\lambda$ | $w$ | FID↓ | Prec.↑ | Rec.↑ |
|---|---|---|---|---|---|
| AU | – | – | 23.01 | 0.4983 | 0.6722 |
| Vanilla | 0.0 | 0 | 23.14 | 0.4997 | 0.6619 |
| 仅 UG | – | 50 | 18.79 | 0.5290 | 0.6358 |
| 仅 CFG | 0.25 | 0 | 10.31 | 0.6207 | 0.6078 |
| CFG + UG | 0.25 | 40 | 8.65 | 0.6463 | 0.5828 |
| 仅 CFG | 0.5 | 0 | 5.34 | 0.7132 | 0.5495 |
| CFG + UG | 0.5 | 20 | 5.00 | 0.7281 | 0.5393 |

**图 5：** 固定 CFG 尺度 $\lambda=0.5$ 下、不同 UG 尺度 $w$ 的 ImageNet-256 样本。每个面板使用固定类别标签与随机种子；各列从左到右扫描 $w\in\{0,10,30,50\}$。UG 随引导强度增大以多样性换取保真度。（来源：原文第 11 页。）

图 5 表明，随 UG 尺度增大，样本类别一致性更高、背景更简单；这些定性变化与"引向低不确定性区域"时测得的保真度—多样性折中一致。总体而言，基于预测速度不确定性导出的伪似然的引导在所测设置中提升了样本保真度。

### 4.5 不确定性感知无分类器引导

为观察 UCFG 效果，我们把标准 CFG (Ho & Salimans, 2022; Zheng et al., 2023) 与 APG (Sadat et al., 2024) 同其不确定性感知对应版本 UCFG 与 APG+UCFG 比较。我们对 CFG/APG 扫描固定引导尺度 $\lambda$，对 UCFG/APG+UCFG 扫描上限 $\lambda_{\max}$；扫描覆盖 ImageNet-128 与 ImageNet-256 上的 $\{0,0.25,\ldots,2.0,3,4,5,10,15,20\}$。这里 $\lambda_{\max}$ 界定由预测不确定性选出的自适应尺度 $\lambda^*$。

为减少过饱和与伪影，APG 沿与条件速度正交的 CFG 更新分量施加引导；APG+UCFG 用与 UCFG 相同的机制自适应 APG 的引导尺度以最小化预测不确定性。APG 与 APG+UCFG 的实现细节见 §E.3。

**结果。** 图 6 比较随引导参数 $\lambda$ 与 $\lambda_{\max}$ 增大的 ImageNet-256 指标，表 4 报告两个 ImageNet 分辨率下的最佳设置。随固定引导尺度 $\lambda$ 增大，CFG 与 APG 的召回率急剧退化，CFG 的精确率在大 $\lambda$ 下也下降，导致 FID 陡升；相反，UCFG 与 APG+UCFG 的召回率随 $\lambda_{\max}$ 增大下降更平缓，因而在大 $\lambda_{\max}$ 下仅有轻微 FID 退化。

图 7 给出从 1,000 个生成样本中每五步收集的 $\lambda^*$ 小提琴图：UCFG 与 APG+UCFG 的 $\lambda^*$ 在早期采样步通常较小、在后期变大。该模式表明自适应缩放限制了样本仍较粗糙时的过度引导，这或可解释大 $\lambda_{\max}$ 下召回率的较小损失。定性上，CFG 与 APG 的大 $\lambda$ 会产生过饱和样本或模式坍缩，而 UCFG 与 APG+UCFG 在大 $\lambda_{\max}$ 下保持全局结构且饱和更少（图 8）。最后，表 4 报告各方法表现最佳（FID 最低）的配置：UCFG 与 APG+UCFG 的 FID 分别低于其对应版本 CFG 与 APG；APG+UCFG 在两个 ImageNet 分辨率上都取得最低 FID，而 UCFG 与 APG 在其最优尺度上以更高召回率优于 CFG。

**图 6：** ImageNet-256 上 FID、精确率与召回率随固定 CFG 尺度 $\lambda$ 或最大 UCFG 尺度 $\lambda_{\max}$ 的变化。CFG 在大 $\lambda$ 下急剧退化，而 UCFG 随 $\lambda_{\max}$ 增大更稳定。（来源：原文第 12 页。）

**表 4：ImageNet 上 CFG 变体的 FID、精确率与召回率。** 每方法表现最佳（FID 最低）的尺度，3 个随机种子平均。（来源：原文第 12 页。）

**表 4(a) ImageNet-128：**

| 方法 | $\lambda/\lambda_{\max}$ | FID↓ | Precision↑ | Recall↑ |
|---|---|---|---|---|
| CFG | 1.0 | 5.26 ± .03 | 0.7287 ± .0019 | 0.5005 ± .0033 |
| UCFG | 1.75 | 4.82 ± .04 | 0.7092 ± .0005 | 0.5307 ± .0014 |
| APG | 2.0 | 5.06 ± .02 | 0.7269 ± .0012 | 0.5033 ± .0018 |
| APG+UCFG | 2.25 | 4.78 ± .01 | 0.6976 ± .0036 | 0.5422 ± .0040 |

**表 4(b) ImageNet-256：**

| 方法 | $\lambda/\lambda_{\max}$ | FID↓ | Precision↑ | Recall↑ |
|---|---|---|---|---|
| CFG | 0.75 | 4.48 ± .01 | 0.7809 ± .0019 | 0.4984 ± .0022 |
| UCFG | 1.5 | 4.30 ± .01 | 0.7660 ± .0013 | 0.5176 ± .0025 |
| APG | 1.75 | 4.18 ± .01 | 0.7592 ± .0052 | 0.5246 ± .0048 |
| APG+UCFG | 2.75 | 3.98 ± .07 | 0.7740 ± .0029 | 0.5117 ± .0050 |

**图 7：** ImageNet-256 上自适应引导尺度 $\lambda^*$ 随采样步的分布（由 1,000 个样本计算的小提琴图）：(a) UCFG；(b) APG+UCFG。两种情形下 $\lambda^*$ 在早期步偏小、后期步偏大。（来源：原文第 13 页。）

**图 8：** 增大无分类器引导尺度下的 ImageNet-256 样本。行自上而下为 CFG、APG、UCFG、APG+UCFG；列从左到右在 $\{1,2,5,10,20\}$ 上扫描固定尺度 $\lambda$ 或自适应尺度上限 $\lambda_{\max}$。相比大固定尺度 $\lambda$ 的 CFG 与 APG，UCFG 与 APG+UCFG 在大 $\lambda_{\max}$ 下更稳健地保持结构。（来源：原文第 13 页。）

### 4.6 附加分析

#### 4.6.1 设计选择的消融

我们验证主配置背后的设计选择（§H）：在测试的 Hutchinson 探针数 $S$、协方差近似、方差传播阶数、不确定性更新间隔与 top-$k$% 聚合比例下，过滤质量变化很小；这些结果支持那些降低计算或简化近似的默认设置。UG 在测试的 $f(\boldsymbol\sigma^2)$ 函数形式与引导间隔下变化也很小，支持每两个采样步应用一次。去掉式（2）中的偏差修正项 $U_t$ 后，过滤与 UG 保留大部分增益，但 **UCFG 不再优于固定 CFG**；该消融表明在所测设置中 $U_t$ 是 UCFG 超过固定 CFG 所必需的。

#### 4.6.2 修正估计器的偏差与批大小敏感性

式（2）的修正项 $U_t$ 由式（3）的重加权小批量估计 $\hat u_t(\mathbf x_t)$ 构成。对该估计平方会引入偏差，因为即便 $\hat u_t$ 是 $u_t$ 的一致代理，$\hat u_t^2$ 对 $u_t^2$ 仍有偏。因此该偏差由小批量估计器方差支配，并随批大小 $B$ 增大而减小（附录 A）。

**流程。** 我们在 ImageNet-256 潜特征上、跨多个批大小 $B$ 对 $U_t$ 取平均来量化这一点；作为参考，把迷你批估计替换为 65,536 个候选构成的估计，在 1,024 个查询上评估，每个测试批大小对每个查询平均 16 个独立采样的候选池。

**结果。** 修正集中在正向生成的前 10%。其参考幅度在 $t\in[0,0.1]$ 上为 0.579，在 $t\in[0.1,0.2]$ 上降至 0.0146，此后至多为 $3.60\times10^{-7}$。在 $t\in[0.1,0.2]$ 上它仅为预测速度不确定性的 2.32%，而 $B=1{,}024$ 时的误差为同一量的 2.16%，故一旦 $t>0.1$ 批大小的绝对影响很小。该观察与 Bertrand 等 (2026) 的发现一致：高维空间中经验边缘速度随时间趋于条件速度。表 5 表明修正在 $t\in[0,0.1]$ 上是实质性的，且其估计随候选批大小单调改善——$B=2$ 时恢复参考值的 17.2%，$B=1{,}024$ 时恢复 78.3%。该区间上平均预测速度不确定性有修正时为 0.310、无修正时为 0.652；方差修正还把最佳 UCFG 配置的 FID 从 4.67 改善到 4.30，优于固定 CFG 的 4.48（§H.3）。因此更大批大小恰好在修正量大的位置锐化估计，而批大小对轨迹其余部分基本无影响。

**表 5：ImageNet-256 潜变量上修正估计器的批大小敏感性。** 在修正最大的 $t\in[0,0.1]$ 上平均的偏差修正 $U_t$，以及其恢复参考值的比例；参考值把迷你批估计替换为 65,536 候选估计。（来源：原文第 14 页。）

| 批大小 $B$ | 平均偏差修正 $U_t$ | 恢复比例 |
|---|---|---|
| 参考 | −0.579 | — |
| 2 | −0.100 | 17.21% |
| 16 | −0.273 | 47.21% |
| 64 | −0.349 | 60.35% |
| 256 | −0.407 | 70.21% |
| 1,024 | −0.454 | 78.32% |

#### 4.6.3 校准分析

生成模型学习的是概率分布而非预测目标，因此没有固定真值可用于校准 UA-Flow 的预测方差。我们因此采用 ImageNet-256 验证潜变量上的**间接协议**（§G.3）：把真实潜变量加噪到时刻 $t$ 并由 ODE 恢复，以干净潜变量作为真值，评估预测端点分布的期望校准误差（ECE）与 Brier 分数。校准前两个指标都随 $t$ 单调改善（表 6）；事后校准在每个测试噪声水平上进一步降低两个指标，表明等渗校准可在该间接重建协议下改善 UA-Flow 的预测端点方差。

**表 6：UA-Flow 在 ImageNet-256 验证图像上的校准。** 三个噪声水平 $t$ 下事后等渗校准前后的分数；细节与基线见 §G.3。（来源：原文第 14 页。）

| $t$ | 校准前 ECE↓ | 校准前 Brier↓ | 校准后 ECE↓ | 校准后 Brier↓ |
|---|---|---|---|---|
| 0.5 | 0.1328 | 0.4771 | 0.0066 | 0.0515 |
| 0.7 | 0.0992 | 0.3281 | 0.0038 | 0.0492 |
| 0.9 | 0.0277 | 0.1009 | 0.0008 | 0.0481 |

#### 4.6.4 超越图像生成

**表 7：Push-T 早停。** 其 chunk 不确定性超过 $\tau$ 的 rollout 被排除；Excl.% 为 1,000 个 rollout 中被排除的比例，Success %（最大奖励 > 1.0）与 Mean MaxR 在保留的 rollout 上度量。完整表见 Table 15。（来源：原文第 15 页。）

| 阈值 $\tau$ | Excl. % | Success %↑ | Mean MaxR↑ |
|---|---|---|---|
| 不删除 | 0.0% | 62.7% | 0.9514 |
| 0.0010 | 87.8% | 91.0% | 0.9702 |
| 0.0025 | 62.9% | 77.6% | 0.9597 |
| 0.0050 | 29.2% | 66.8% | 0.9536 |
| 0.0075 | 14.6% | 63.6% | 0.9536 |
| 0.0100 | 7.9% | 63.3% | 0.9521 |

作为 UA-Flow 可扩展到图像之外的初步证据，我们在三个非图像域评估它：二维棋盘密度（§I.1）、条件时间序列预测任务（§I.2）与 Push-T 机器人策略基准（§I.3）。三者中不确定性分数分别通过覆盖率、预测误差或 rollout 成功率区分保留的样本：在时间序列任务上，丢弃最不确定的 top 10% 预测可把 MSE 降低 3.8 倍（表 14）；在 Push-T 上，当 chunk 级不确定性超过阈值 $\tau=0.001$ 时中止 rollout，可排除 87.8% 的 rollout 并把保留成功率从 62.7% 提升到 91.0%、平均最大奖励从 0.9514 提升到 0.9702（表 7）。这些结果表明 UA-Flow 可在图像生成之外提供可靠性信号；我们视其为初步证据，把深入的领域特定研究留待未来工作。

## 5 结论

我们提出 **UA-Flow**，它预测逐元素异方差速度不确定性并在确定性流动力学中传播，从而给出用于过滤的每样本、空间局部化不确定性，并支持不确定性感知引导（UG）与逐步自适应无分类器引导（UCFG）。在 CIFAR-10 与 ImageNet 上，UA-Flow 的不确定性分数比逐元素基线更紧密地与样本保真度相关；UA-Flow + CLIP 以更低计算成本与基于 CLIP 标量的基线相当（表 1）。此外，结果表明 UA-Flow 的不确定性反映每个生成样本受数据流形支持的程度。UG 通过把轨迹引向低不确定性来诱导精确率—召回率折中，而 UCFG 通过自适应缩放缓解大固定引导的失效并在强引导下保持稳健。我们表述的一个关键局限是其依赖为可处理性与效率所作的简化假设，尤其是偏差修正项、对角方差与一阶 Taylor 方差传播；放松这些假设留待未来工作。

## 更广泛影响声明

本工作通过显式建模并传播流匹配动力学中的不确定性，推进基于采样生成模型的不确定性量化。通过提供每样本、空间局部化的不确定性估计，所提方法可帮助实践者评估生成输出的可靠性，并在部署生成模型时作出更明智的决策。潜在正面影响包括提升依赖生成模型的下游应用的稳健性与安全性；特别地，不确定性感知引导可减少由过度自信或过度引导的生成造成的失效情形。与此同时，与其他生成建模进展一样，生成质量与可控性的提升可能放大与合成数据相关的既有社会风险，包括滥用、错误信息或对自动生成内容的过度依赖。我们强调，不确定性估计应被用作**补充的可靠性信号**，而非正确性的保证。

**致谢。** 本工作由现代汽车公司（Hyundai Motor Company）资助。

## 参考文献（英文原书目）

[1] Michael Samuel Albergo and Eric Vanden-Eijnden. Building normalizing flows with stochastic interpolants. 2023. URL https://arxiv.org/abs/2209.15571.
[2] Atilim Gunes Baydin, Barak A Pearlmutter, Alexey Andreyevich Radul, and Jeffrey Mark Siskind. Automatic differentiation in machine learning: a survey. Journal of machine learning research, 18(153):1–43, 2018.
[3] Costas Bekas, Effrosyni Kokiopoulou, and Yousef Saad. An estimator for the diagonal of a matrix. Applied numerical mathematics, 57(11-12):1214–1229, 2007.
[4] Lucas Berry, Axel Brando, and David Meger. Shedding light on large generative networks: Estimating epistemic uncertainty in diffusion models. In The 40th Conference on Uncertainty in Artificial Intelligence, 2024.
[5] Quentin Bertrand, Anne Gagneux, Mathurin Massias, and Rémi Emonet. On the closed-form of flow matching: Generalization does not arise from target stochasticity. Advances in neural information processing systems, 38:8522–8549, 2026.
[6] Kevin Black, Noah Brown, Danny Driess, Adnan Esmail, Michael Equi, Chelsea Finn, Niccolo Fusai, Lachy Groom, Karol Hausman, Brian Ichter, et al. π0: A vision language-action flow model for general robot control, 2024a. URL https://arxiv.org/abs/2410.24164, 2024.
[7] Guillem Capellera, Antonio Rubio, Luis Ferraz, and Antonio Agudo. Unified uncertainty-aware diffusion for multi-agent trajectory modeling. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 22476–22486, June 2025.
[8] Cheng Chi, Zhenjia Xu, Siyuan Feng, Eric Cousineau, Yilun Du, Benjamin Burchfiel, Russ Tedrake, and Shuran Song. Diffusion policy: Visuomotor policy learning via action diffusion. The International Journal of Robotics Research, 44(10-11):1684–1704, 2025.
[9] Quan Dao, Hao Phung, Binh Nguyen, and Anh Tran. Flow matching in latent space. arXiv preprint arXiv:2307.08698, 2023.
[10] Erik Daxberger, Agustinus Kristiadi, Alexander Immer, Runa Eschenhagen, Matthias Bauer, and Philipp Hennig. Laplace redux–effortless Bayesian deep learning. In NeurIPS, 2021.
[11] Michele De Vita and Vasileios Belagiannis. Diffusion model guided sampling with pixel-wise aleatoric uncertainty estimation. In 2025 IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pp. 3844–3854, 2025. doi: 10.1109/WACV61041.2025.00378.
[12] Jia Deng, Wei Dong, Richard Socher, Li-Jia Li, Kai Li, and Li Fei-Fei. Imagenet: A large-scale hierarchical image database. In 2009 IEEE Conference on Computer Vision and Pattern Recognition, pp. 248–255, 2009. doi: 10.1109/CVPR.2009.5206848.
[13] Prathamesh Dharangutte and Christopher Musco. A tight analysis of hutchinson's diagonal estimator. In Symposium on Simplicity in Algorithms (SOSA), pp. 353–364. SIAM, 2023.
[14] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat GANs on image synthesis. Advances in neural information processing systems, 34:8780–8794, 2021.
[15] Gianni Franchi, Nacim Belkhir, Dat Nguyen Trong, Guoxuan Xia, and Andrea Pilzer. Towards understanding and quantifying uncertainty for text-to-image generation. In Proceedings of the Computer Vision and Pattern Recognition Conference, pp. 8062–8072, 2025.
[16] Yarin Gal and Zoubin Ghahramani. Dropout as a bayesian approximation: Representing model uncertainty in deep learning. In international conference on machine learning, pp. 1050–1059. PMLR, 2016.
[17] Jiyeon Han, Hwanil Choi, Yunjey Choi, Junho Kim, Jung-Woo Ha, and Jaesik Choi. Rarity score: A new metric to evaluate the uncommonness of synthesized images. In International Conference on Learning Representations, 2023. URL https://openreview.net/forum?id=JTGimap_-F.
[18] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. Gans trained by a two time-scale update rule converge to a local nash equilibrium. Advances in neural information processing systems, 30, 2017.
[19] Jonathan Ho and Tim Salimans. Classifier-free diffusion guidance. arXiv preprint arXiv:2207.12598, 2022.
[20] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.
[21] Jonathan Ho, Tim Salimans, Alexey Gritsenko, William Chan, Mohammad Norouzi, and David J Fleet. Video diffusion models. Advances in neural information processing systems, 35:8633–8646, 2022.
[22] Michael Janner, Yilun Du, Joshua Tenenbaum, and Sergey Levine. Planning with diffusion for flexible behavior synthesis. In International Conference on Machine Learning, 2022.
[23] Metod Jazbec, Eliot Wong-Toi, Guoxuan Xia, Dan Zhang, Eric Nalisnick, and Stephan Mandt. Generative uncertainty in diffusion models. In Proceedings of the Forty-first Conference on Uncertainty in Artificial Intelligence, 2025.
[24] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. Advances in neural information processing systems, 35:26565–26577, 2022.
[25] Alex Kendall and Yarin Gal. What uncertainties do we need in Bayesian deep learning for computer vision? Advances in neural information processing systems, 30, 2017.
[26] Siqi Kou, Lei Gan, Dequan Wang, Chongxuan Li, and Zhijie Deng. Bayesdiff: Estimating pixel-wise uncertainty in diffusion via bayesian inference. In The Twelfth International Conference on Learning Representations, 2023.
[27] Alex Krizhevsky, Vinod Nair, and Geoffrey Hinton. CIFAR-10 (Canadian institute for advanced research). URL http://www.cs.toronto.edu/kriz/cifar.html, 5(4):1, 2010.
[28] Volodymyr Kuleshov, Nathan Fenner, and Stefano Ermon. Accurate uncertainties for deep learning using calibrated regression. In International conference on machine learning, pp. 2796–2804. PMLR, 2018.
[29] Tuomas Kynkäänniemi, Tero Karras, Samuli Laine, Jaakko Lehtinen, and Timo Aila. Improved precision and recall metric for assessing generative models. Advances in neural information processing systems, 32, 2019.
[30] Balaji Lakshminarayanan, Alexander Pritzel, and Charles Blundell. Simple and scalable predictive uncertainty estimation using deep ensembles. Advances in neural information processing systems, 30, 2017.
[31] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Thang Le. Flow matching for generative modeling. In International Conference on Learning Representations, 2023.
[32] Yaron Lipman, Marton Havasi, Peter Holderrieth, Neta Shaul, Matt Le, Brian Karrer, Ricky TQ Chen, David Lopez-Paz, Heli Ben-Hamu, and Itai Gat. Flow matching guide and code. arXiv preprint arXiv:2412.06264, 2024.
[33] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. 2023. URL https://openreview.net/forum?id=XVjTT1nw5z.
[34] David A Nix and Andreas S Weigend. Estimating the mean and variance of the target probability distribution. In Proceedings of 1994 ieee international conference on neural networks (ICNN'94), volume 1, pp. 55–60. IEEE, 1994.
[35] William Peebles and Saining Xie. Scalable diffusion models with transformers. In Proceedings of the IEEE/CVF international conference on computer vision, pp. 4195–4205, 2023.
[36] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, and Ilya Sutskever. Learning transferable visual models from natural language supervision. In Marina Meila and Tong Zhang (eds.), Proceedings of the 38th International Conference on Machine Learning, volume 139 of Proceedings of Machine Learning Research, pp. 8748–8763. PMLR, 18–24 Jul 2021. URL https://proceedings.mlr.press/v139/radford21a.html.
[37] Hippolyt Ritter, Aleksandar Botev, and David Barber. A scalable laplace approximation for neural networks. In 6th international conference on learning representations, ICLR 2018-conference track proceedings, volume 6. International Conference on Representation Learning, 2018.
[38] R Tyrrell Rockafellar, Stanislav Uryasev, et al. Optimization of conditional value-at-risk. Journal of risk, 2:21–42, 2000.
[39] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 10684–10695, 2022.
[40] Seyedmorteza Sadat, Otmar Hilliges, and Romann M Weber. Eliminating oversaturation and artifacts of high guidance scales in diffusion models. In The Thirteenth International Conference on Learning Representations, 2024.
[41] Chitwan Saharia, William Chan, Saurabh Saxena, Lala Li, Jay Whang, Emily L Denton, Kamyar Ghasemipour, Raphael Gontijo Lopes, Burcu Karagol Ayan, Tim Salimans, et al. Photorealistic text-to-image diffusion models with deep language understanding. Advances in neural information processing systems, 35:36479–36494, 2022.
[42] Maximilian Seitzer, Arash Tavakoli, Dimitrije Antic, and Georg Martius. On the pitfalls of heteroscedastic uncertainty estimation with probabilistic neural networks. In International Conference on Learning Representations, April 2022.
[43] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International conference on machine learning, pp. 2256–2265. pmlr, 2015.
[44] Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.
[45] Jiankai Sun, Yiqi Jiang, Jianing Qiu, Parth Nobel, Mykel J Kochenderfer, and Mac Schwager. Conformal prediction for uncertainty-aware planning with diffusion dynamics model. Advances in Neural Information Processing Systems, 36:80324–80337, 2023.
[46] Fan Zhang and Michael Gienger. Affordance-based robot manipulation with flow matching. arXiv preprint arXiv:2409.01083, 2024.
[47] Qinqing Zheng, Matt Le, Neta Shaul, Yaron Lipman, Aditya Grover, and Ricky TQ Chen. Guided flows for generative modeling and decision making. arXiv preprint arXiv:2311.13443, 2023.

## 附录 A 不确定性感知流匹配损失的推导

本附录把无条件高斯 NLL 损失 $\mathcal L_{\mathrm{UFM}}$ 用条件流匹配重写为 $\mathcal L_{\mathrm{CUFM}}$，给出详细推导。关键想法是用条件分布 $p_t(\mathbf x|\mathbf x_1)$ 表达边缘分布 $p_t(\mathbf x)$ 下的期望，从而在边缘速度不可获得时仍可处理地训练。为记号简洁，时间均匀采样 $t\sim\mathcal U([0,1])$（也可用其他时间采样分布）。

首先把 $\mathcal L_{\mathrm{UFM}}$ 展开为四项期望（式 (16)）：(A) $(\bar u_t^\theta)^2$ 项、(B) 交叉项 $-\bar u_t^\theta u_t$ 项、(C) $u_t^2$ 项、(D) $\log\sigma_t^\theta$ 项。随后逐项改写：

- **项 (A)**（式 (17)）：把 $p_t(\mathbf x_t)$ 写成 $\int p_t(\mathbf x_t|\mathbf x_1)p_1(\mathbf x_1)\,\mathrm d\mathbf x_1$，直接得到条件期望形式。
- **项 (B)**（式 (18)）：利用全期望定律，把 $u_t(\mathbf x_t)=\int u_t(\mathbf x_t|\mathbf x_1)\frac{p_t(\mathbf x_t|\mathbf x_1)p_1(\mathbf x_1)}{p_t(\mathbf x_t)}\,\mathrm d\mathbf x_1$ 代入，使 $p_t(\mathbf x_t)$ 相消，得到 $\mathbb E[\bar u_t^\theta(\mathbf x_t)u_t(\mathbf x_t|\mathbf x_1)/(2(\sigma_t^\theta)^2)]$。
- **项 (C)、(D)**（式 (19)、(20)）：同样测度变换后改写为条件期望。

于是 $\mathcal L_{\mathrm{UFM}}$ 可重写为（式 (21)）

$$
\mathcal L_{\mathrm{UFM}}(\theta)=\mathbb E_{t,p_1,p_t(\mathbf x_t|\mathbf x_1)}\left[\frac{\left(\bar u_t^\theta(\mathbf x_t)-u_t(\mathbf x_t|\mathbf x_1)\right)^2+(u_t(\mathbf x_t))^2-(u_t(\mathbf x_t|\mathbf x_1))^2}{2(\sigma_t^\theta(\mathbf x_t))^2}+\log\left(\sigma_t^\theta(\mathbf x_t)\right)\right].
$$

由于真实边缘速度 $u_t(\mathbf x_t)$ 无闭式，我们用恒等式（式 (22)）把它写为 $p_1$ 下期望之比：$u_t(\mathbf x_t)=\mathbb E_{p_1}[u_t(\mathbf x_t|\mathbf x_1)p_t(\mathbf x_t|\mathbf x_1)]/\mathbb E_{p_1}[p_t(\mathbf x_t|\mathbf x_1)]$。这提示基于迷你批 $\{\mathbf x_{1,b}\}_{b=1}^{B}\sim p_1$ 的自归一化重要性采样估计器（式 (23)，即正文式 (3)）。以 $\hat u_t(\mathbf x_t)^2$ 近似 $(u_t(\mathbf x_t))^2$ 即得修正项 $U_t(\mathbf x_t,\mathbf x_1)=\hat u_t(\mathbf x_t)^2-u_t(\mathbf x_t|\mathbf x_1)^2$ 与条件目标 $\mathcal L_{\mathrm{CUFM}}$（正文式 (2)）。

**关于近似 $(u_t(\mathbf x_t))^2$ 中的 Jensen 偏差以及为何仍保留 $U_t$：** 即便 $\hat u_t(\mathbf x_t)$ 是 $u_t(\mathbf x_t)$ 的一致代理，$\hat u_t(\mathbf x_t)^2$ 对 $u_t(\mathbf x_t)^2$ 仍非无偏——由恒等式 $\mathbb E[\hat u^2]-(\mathbb E[\hat u])^2=\mathrm{Var}(\hat u)$，平方引入与估计器方差成正比的 Jensen 间隙，故偏差由（迷你批）估计器方差控制，通常随批大小 $B$ 增大而减小。尽管有该局限，保留修正项 $U_t$ 仍比省略它给出更接近原始无条件目标的替代：令 $p_{t|1}(\mathbf x_1|\mathbf x_t)=\frac{p_t(\mathbf x_t|\mathbf x_1)p_1(\mathbf x_1)}{p_t(\mathbf x_t)}$ 为式 (22) 诱导的后验，则 $u_t(\mathbf x_t)=\mathbb E_{p_{1|t}(\mathbf x_1|\mathbf x_t)}[u_t(\mathbf x_t|\mathbf x_1)]$，从而

$$
\mathbb E_{p_{1|t}(\mathbf x_1|\mathbf x_t)}\left[u_t(\mathbf x_t)^2-u_t(\mathbf x_t|\mathbf x_1)^2\right]=-\mathrm{Var}_{p_{1|t}(\mathbf x_1|\mathbf x_t)}\left(u_t(\mathbf x_t|\mathbf x_1)\right)\le0.
$$

因此丢掉 $U_t$ 等于把该负项置零，引入一个不随 $B$ 消失的系统性偏差；相反我们的代理保留了该与方差相关的修正（除 $\hat u_t^2$ 的残余偏差外），而该残余偏差随迷你批估计器方差减小（如 $B$ 增大）而降低。

## 附录 B 方差传播与协方差近似细节

本附录给出方差演化方程的详细推导与状态—速度协方差的可处理近似。

### B.1 均值与方差传播规则的推导

**均值传播（式 (5)）。** 由高斯速度模型 $u_t^\theta(\mathbf x)=\bar u_t^\theta(\mathbf x_t)+\sigma_t^\theta(\mathbf x_t)\odot\boldsymbol\epsilon$（$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$），有 $\mathbb E[u_t^\theta(\mathbf x_t)]=\mathbb E[\bar u_t^\theta(\mathbf x_t)]$。对 $\bar u_t^\theta(\mathbf x_t)$ 在 $\bar{\mathbf x}_t:=\mathbb E[\mathbf x_t]$ 处做一阶 Taylor 展开，得（式 (24)）

$$
\frac{\mathrm d\bar{\mathbf x}_t}{\mathrm dt}=\mathbb E\left[u_t^\theta(\mathbf x_t)\right]=\mathbb E\left[\bar u_t^\theta(\mathbf x_t)\right]\approx\mathbb E\left[\bar u_t^\theta(\bar{\mathbf x}_t)+\mathbf J_t^\theta(\bar{\mathbf x}_t)(\mathbf x_t-\bar{\mathbf x}_t)\right]=\bar u_t^\theta(\bar{\mathbf x}_t).
$$

**方差传播（式 (6)）。** 在时刻 $t$ 与 $t+\Delta t$ 之间的 Euler 积分下，流动力学为（式 (25)）$\mathbf x_{t+\Delta t}=\mathbf x_t+u_t^\theta(\mathbf x_t)\Delta t$。对式 (25) 应用逐元素方差恒等式 $\mathrm{Var}(X+aY)=\mathrm{Var}(X)+a^2\mathrm{Var}(Y)+2a\mathrm{Cov}(X,Y)$（取 $Y=u_t^\theta(\mathbf x_t)$）即得式 (6)。

接着说明正文所用近似 $\mathrm{Var}(u_t^\theta(\mathbf x_t))\approx(\sigma_t^\theta(\bar{\mathbf x}_t))^2$ 的依据。由全方差定律与 $u_t^\theta(\mathbf x_t)=\bar u_t^\theta(\mathbf x_t)+\sigma_t^\theta(\mathbf x_t)\odot\boldsymbol\epsilon$：

$$
\mathrm{Var}(u_t^\theta(\mathbf x_t))=\mathbb E\left[\mathrm{Var}(u_t^\theta(\mathbf x_t)|\mathbf x_t)\right]+\mathrm{Var}\left(\mathbb E[u_t^\theta(\mathbf x_t)|\mathbf x_t]\right)=\mathbb E_{\mathbf x_t}\left[(\sigma_t^\theta(\mathbf x_t))^2\right]+\mathrm{Var}(\bar u_t^\theta(\mathbf x_t))\tag{26}
$$

$$
\approx\mathbb E_{\mathbf x_t}\left[(\sigma_t^\theta(\bar{\mathbf x}_t))^2+\frac{\partial(\sigma_t^\theta)^2}{\partial\mathbf x}\bigg|_{\bar{\mathbf x}_t}(\mathbf x_t-\bar{\mathbf x}_t)\right]+\mathrm{Var}(\bar u_t^\theta(\mathbf x_t))=(\sigma_t^\theta(\bar{\mathbf x}_t))^2+\mathrm{Var}(\bar u_t^\theta(\mathbf x_t)),
$$

最后一步由忽略高阶项与 $\mathbb E[\mathbf x_t-\bar{\mathbf x}_t]=0$ 得到。剩余项 $\mathrm{Var}(\bar u_t^\theta(\mathbf x_t))$ 刻画由 $\mathbf x_t$ 分散引起的方差，原则上可通过 Monte Carlo 估计（抽取 $\mathbf x_{t,i}\sim\mathcal N(\bar{\mathbf x}_t,\mathrm{Var}[\mathbf x_t])$ 并计算 $\bar u_t^\theta(\mathbf x_{t,i})$ 的经验方差）。正文聚焦预测的异方差不确定性并避免该额外 Monte Carlo 开销，因此忽略 $\mathrm{Var}(\bar u_t^\theta(\mathbf x_t))$，采用 $\mathrm{Var}(u_t^\theta(\mathbf x_t))\approx(\sigma_t^\theta(\bar{\mathbf x}_t))^2$。

### B.2 $\mathrm{Cov}(\mathbf x_t,u_t^\theta(\mathbf x_t))$ 的近似

B.2 讨论状态—速度协方差的若干可处理近似：除正文式（7）—（8）的"Hutchinson + JVP"路线外，附录还给出基于对角近似的替代方案并比较其计算与精度权衡，最终选择正文的单探针 Hutchinson 估计器（$S=1$），因为更多探针并未明显改善过滤/引导质量（§H.1）。

## 附录 C Heun 二阶采样下的方差传播

为完整性，本附录推导 Heun2 离散下的方差传播规则。Heun2 每步先做 Euler 预测，再在预测终点评估速度并做梯形平均：

$$
\mathbf x_{t+\Delta t}=\mathbf x_t+\frac{\Delta t}{2}\left(k_1+k_2\right),\qquad k_1=u_t^\theta(\mathbf x_t),\quad k_2=u_{t+\Delta t}^\theta\left(\mathbf x_t+\Delta t\,k_1\right).
$$

记 $\mathbf J_1=\mathbf J_t^\theta(\bar{\mathbf x}_t)$、$\mathbf J_2=\mathbf J_{t+\Delta t}^\theta(\bar{\mathbf x}_{t+\Delta t})$。把 $k_1,k_2$ 在均值轨迹附近线性化后，状态均值仍按 $\bar{\mathbf x}_{t+\Delta t}=\bar{\mathbf x}_t+\frac{\Delta t}{2}(\bar u_t^\theta+\bar u_{t+\Delta t}^\theta)$ 传播。逐元素方差传播需三个协方差项：$\mathrm{Cov}(\mathbf x_t,k_1)$、$\mathrm{Cov}(\mathbf x_t,k_2)$ 与 $\mathrm{Cov}(k_1,k_2)$。附录分别给出其线性化形式（式 (37)—(45)），例如状态驱动的 $k_2$ 协方差（式 (44)—(45)）

$$
\left[\mathrm{Cov}(\mathbf x_t,k_2)\right]_i\approx\left[\mathbf J_2(\mathbf I+\mathbf J_1\Delta t)\,\mathrm{diag}(\mathrm{Var}[\mathbf x_t])\right]_i+\Delta t(\mathbf J_2)_{ii}(\sigma_1)_i^2,
$$

即由"状态驱动"与"噪声驱动"两部分组成；矩阵形式为 $\mathrm{Cov}(k_1,k_2)\approx\mathrm{diag}\left(\mathbf J_1\mathrm{diag}(\mathrm{Var}[\mathbf x_t])(\mathbf J_2(\mathbf I+\mathbf J_1\Delta t))^\top\right)+\Delta t\,\mathrm{diag}(\mathbf J_2)\odot\boldsymbol\sigma_1^2$。注意与式 (41) 不同，式 (44) 的状态驱动部分**不是**单矩阵的 $\mathrm{diag}(M)\odot\mathrm{Var}[\mathbf x_t]$ 形式，因为两个速度阶段被不同 Jacobian 线性映射。

**Hutchinson–JVP 估计器。** 直接构造 $\mathbf J_1,\mathbf J_2$ 在高维中不可行，故按与式（8）相同的 Rademacher 探针 + JVP 策略估计式 (39)、(41)、(45) 中的对角 Jacobian 乘积。设 $\sigma_{\mathbf x_t}=\sqrt{\mathrm{Var}[\mathbf x_t]}$，抽取两个独立 Rademacher 向量 $\mathbf r,\mathbf r'$（分量独立同分布均匀于 $\{-1,+1\}$，故 $\mathbb E[r_ir_j]=\mathbb E[r_i'r_j']=\delta_{ij}$、$\mathbb E[r_ir_j']=0$，式 (46)），定义缩放探针 $\mathbf v:=\sigma_{\mathbf x_t}\odot\mathbf r$、$\mathbf w:=\boldsymbol\sigma_1\odot\mathbf r'$（式 (47)），满足 $\mathbb E[v_iv_j]=\mathrm{Var}[\mathbf x_t]_i\delta_{ij}$、$\mathbb E[w_iw_j]=(\sigma_1)_i^2\delta_{ij}$。

- **$\mathrm{Cov}(\mathbf x_t,k_2)$ 估计器（式 (48)—(51)）。** 令 $M:=\mathbf J_2(\mathbf I+\mathbf J_1\Delta t)$。坐标 $i$ 上 $\mathbb E[v_i(M\mathbf v)_i]=\sum_jM_{ij}\mathbb E[v_iv_j]=M_{ii}\mathrm{Var}[\mathbf x_t]_i$；堆叠得 $\mathbb E[\mathbf v\odot(M\mathbf v)]=\mathrm{diag}(M)\odot\mathrm{Var}[\mathbf x_t]$，与式 (41) 一致。乘积 $M\mathbf v=\mathbf J_2(\mathbf v+\mathbf J_1\mathbf v\Delta t)$ 由两次 JVP 计算，避免显式构造 $\mathbf J_1,\mathbf J_2,M$。以 $S$ 个独立探针得无偏 Monte Carlo 估计器（式 (50)）。取 $\mathbf J_2=\mathbf I$、$\Delta t=0$ 即恢复 Euler 情形的式（8）（式 (51)）。
- **$\mathrm{Cov}(k_1,k_2)$ 估计器（式 (52)—(56)）。** 把式 (44) 的状态驱动与噪声驱动分开。状态驱动部分：令 $A:=\mathbf J_1$、$B:=\mathbf J_2(\mathbf I+\mathbf J_1\Delta t)$，由式 (46) 得 $\mathbb E[(A\mathbf v)_i(B\mathbf v)_i]=\sum_jA_{ij}B_{ij}\mathrm{Var}[\mathbf x_t]_j$，与式 (44) 的状态驱动部分逐坐标一致（式 (53)）。噪声驱动部分：由 $\mathbb E[w_iw_j]=(\sigma_1)_i^2\delta_{ij}$ 得 $\mathbb E[w_i(J_2w)_i]=(J_2)_{ii}(\sigma_1)_i^2$，堆叠得 $\mathrm{diag}(\mathbf J_2)\odot\boldsymbol\sigma_1^2$（式 (55)）。合并二者得无偏估计器（式 (56)）。

**计算成本与探针共享。** 三个估计器（式 (50)、(51)、(56)）可共享探针 $\{\mathbf r_i\}$ 并缓存中间乘积 $\{\mathbf J_1\mathbf v_i,\mathbf v_i,\mathbf v_i+\Delta t\mathbf J_1\mathbf v_i\}$。每个采样步的总开销为：与 $\mathbf J_1$ 的一次 JVP（求 $\mathbf J_1\mathbf v_i$）、与 $\mathbf J_2$ 的两次 JVP（求 $\mathbf J_2(\mathbf v_i+\Delta t\mathbf J_1\mathbf v_i)$ 与 $\mathbf J_2\mathbf w_i$）。

**最终 Heun2 方差传播规则（式 (57)）。** 把式 (37)、(38)、(50)、(51)、(56) 代入式 (36)，直接得到 Hutchinson/JVP 形式的 Heun2 方差更新：

$$
\mathrm{Var}[\mathbf x_{t+\Delta t}]\approx\mathrm{Var}[\mathbf x_t]+\frac{(\Delta t)^2}{4}\left(\boldsymbol\sigma_1^2+\boldsymbol\sigma_2^2\right)+\frac{\Delta t}{S}\sum_{i=1}^{S}\mathbf v_i\odot(\mathbf J_1\mathbf v_i)+\frac{\Delta t}{S}\sum_{i=1}^{S}\mathbf v_i\odot\left(\mathbf J_2(\mathbf v_i+\Delta t\mathbf J_1\mathbf v_i)\right)+\frac{(\Delta t)^2}{2S}\sum_{i=1}^{S}(\mathbf J_1\mathbf v_i)\odot\left(\mathbf J_2(\mathbf v_i+\Delta t\mathbf J_1\mathbf v_i)\right)+\frac{(\Delta t)^3}{2S}\sum_{i=1}^{S}\mathbf w_i\odot(\mathbf J_2\mathbf w_i).
$$

第一行为梯形注入噪声项，其余三项的探针平均分别估计 $\Delta t\,\mathrm{Cov}(\mathbf x_t,k_1)$、$\Delta t\,\mathrm{Cov}(\mathbf x_t,k_2)$ 与 $\frac{(\Delta t)^2}{2}\mathrm{Cov}(k_1,k_2)$。展开紧凑 JVP 乘积即恢复式 (41) 与 (45) 的矩阵形式，包含 $O(\Delta t)$、$O(\Delta t^2)$、$O(\Delta t^3)$ 各项。

## 附录 D λ* 的推导

UCFG 通过最小化外推速度的总预测方差选择标量 CFG 尺度 $\lambda\ge0$。沿用 §3.3 记号，$\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)\in\mathbb R^n$ 与 $\sigma_{t,\varnothing}^\theta(\bar{\mathbf x}_t)\in\mathbb R^n$ 分别为条件与无条件速度的逐元素标准差。由式（13），外推速度的逐元素标准差为

$$
\tilde{\boldsymbol\sigma}(\lambda)=(1+\lambda)\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)-\lambda\sigma_{t,\varnothing}^\theta(\bar{\mathbf x}_t)=\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)+\lambda\mathbf d,\qquad\mathbf d:=\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)-\sigma_{t,\varnothing}^\theta(\bar{\mathbf x}_t).\tag{58}
$$

因此式（15）可写为最小二乘问题（式 (59)）$\lambda_{\mathrm{opt}}=\arg\min_{\lambda\ge0}\|\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)+\lambda\mathbf d\|_2^2$。展开得关于 $\lambda$ 的凸二次目标（式 (60)）：

$$
J(\lambda)=\|\sigma_{t,\mathbf y}^\theta(\bar{\mathbf x}_t)+\lambda\mathbf d\|_2^2=\sigma_{t,\mathbf y}^{\theta\top}\sigma_{t,\mathbf y}^\theta+2\lambda\mathbf d^\top\sigma_{t,\mathbf y}^\theta+\lambda^2\mathbf d^\top\mathbf d.
$$

当 $\mathbf d^\top\mathbf d>0$ 时，由 $\frac{\mathrm dJ}{\mathrm d\lambda}=2\mathbf d^\top\sigma_{t,\mathbf y}^\theta+2\lambda\mathbf d^\top\mathbf d=0$ 得无约束极小点为（式 (61)）

$$
\lambda^\star=-\frac{\mathbf d^\top\sigma_{t,\mathbf y}^\theta}{\mathbf d^\top\mathbf d}=\frac{(\sigma_{t,\varnothing}^\theta)^\top\sigma_{t,\mathbf y}^\theta-\|\sigma_{t,\mathbf y}^\theta\|_2^2}{\|\sigma_{t,\mathbf y}^\theta-\sigma_{t,\varnothing}^\theta\|_2^2}.
$$

施加约束 $\lambda\ge0$ 得闭式解（式 (62)）$\lambda_{\mathrm{opt}}=\max(0,\lambda^\star)$；若 $\mathbf d^\top\mathbf d=0$（即 $\sigma_{\mathbf y}=\sigma_\varnothing$），目标 $J(\lambda)$ 关于 $\lambda$ 为常数，取 $\lambda_{\mathrm{opt}}=0$。最后应用式（14）的截断 $\lambda^*=\min(\lambda_{\mathrm{opt}},\lambda_{\max})$。

## 附录 E 实现细节

### E.1 模型与训练

**表 8：超参数。** 当两个学习率写作 $(\eta_{\mathrm{head}},\eta_{\mathrm{backbone}})$ 时，分别表示头与主干的学习率。（来源：原文第 27 页。）

| 项目 | CIFAR-10 预训练 | CIFAR-10 微调 | ImageNet-128 预训练 | ImageNet-128 微调 | ImageNet-256 微调 |
|---|---|---|---|---|---|
| 学习率 | 1e-4 | (1e-5, 1e-6) | 2e-4 | (2e-5, 2e-5) | (1e-5, 1e-5) |
| AdamW $(\beta_1,\beta_2)$ | (0.9, 0.95) | (0.9, 0.999) | (0.9, 0.999) | (0.9, 0.999) | (0.9, 0.999) |
| 梯度预热步 | – | 10000 | – | 1000 | 1000 |
| 梯度裁剪 | – | 1.0 | – | 1.0 | 1.0 |
| EMA 衰减 | 0.999 | 0.999 | 0.9999 | 0.9999 | 0.9999 |
| 批大小 | 128 | 128 | 1024 | 1024 | 512 |
| Epoch 数 | 1000 | 100 | 900 | 100 | 90 |
| GPU 数 | 2 | 2 | 4 | 4 | 4 |

**表 9：CIFAR-10 的 ADM 配置。**（来源：原文第 28 页。）

| 项目 | CIFAR-10 |
|---|---|
| 每尺度 ResNet 块数 | 4 |
| 基础通道数 | 128 |
| 每尺度通道倍数 | (2, 2, 2) |
| 注意力分辨率 | 2 |
| Dropout | 0.3 |

**架构。** CIFAR-10 上使用基于 ADM 的无条件流匹配模型，架构配置遵循标准 ADM 设计（表 9）。ImageNet-128 与 ImageNet-256 上采用基于 DiT 的条件潜空间流匹配模型（如 §4 所述），以 DiT-B/2 为主干、预训练自编码器把 RGB 图像映射到潜空间。

**训练流程。** 各数据集训练超参数汇总于表 8；所有模型（按每个 GPU 定义的）批大小在训练中跨设备聚合。

**硬件。** 所有训练、微调与基于 TFLOPS 的计算测量在 NVIDIA RTX 6000 Ada GPU（48 GB 显存）上运行；表 8 报告的 GPU 数即指该硬件。部分推断运行（不参与 TFLOPS 测量的采样与评估）另在 NVIDIA RTX PRO 6000 Blackwell GPU 上执行。

**不确定性建模。** 不确定性感知训练中，我们在预训练流匹配主干上增加方差预测头；方差头预测 $\log\sigma$ 以提升训练数值稳定性。所有实验使用 $\beta=1.0$ 的 $\beta$-NLL (Seitzer et al., 2022) 目标。ImageNet-128 与 ImageNet-256 上，训练时以概率 0.1 施加标签 dropout 实现无分类器条件化。

### E.2 基线的流匹配版本

面向基于采样生成模型的现有 UQ 方法主要为扩散模型开发。为与 UA-Flow 公平比较，我们把基线的扩散表述转换为流匹配对应版本。

**偶然不确定性（AU）(De Vita & Belagiannis, 2025)。** 原表述中 AU 用扩散模型的分数函数估计样本不确定性：每个采样步 $t$ 先由预测分数 $\epsilon_t^\theta(\mathbf x_t)$ 估计干净数据 $\hat{\mathbf x}_1$，再对估计数据重加噪得到多个扰动状态 $\hat{\mathbf x}_t^i$，并以分数预测 $\epsilon_t^\theta(\hat{\mathbf x}_t^i)$ 的方差作为样本不确定性度量。为适配流匹配，我们用学习的速度场 $u_t^\theta(\mathbf x_t)$ 替换分数函数；假设仿射概率路径，可由当前状态 $\mathbf x_t$ 与预测速度恢复干净数据估计 $\hat{\mathbf x}_1=\frac{1}{\dot\alpha_t\beta_t-\dot\beta_t\alpha_t}\left[\cdot\right]$（式 (63) 起，附录给出完整换算），随后按原方法重加噪并聚合速度预测方差。

**BayesDiff (Kou et al., 2023) 与 GenUnc (Jazbec et al., 2025)。** BayesDiff 的 Laplace 后验估计与不确定传播被转换为在速度场上定义、并以相同 Euler 传播规则（式 (6)）在流动力学中传播；GenUnc 的特征空间似然被替换为在流匹配模型中定义的速度/潜变量方差，并在 CLIP 嵌入空间聚合为标量。三者均在相同采样设置（Heun、50 步）下评估。

### E.3 流匹配的 APG 与 APG+UCFG

APG (Sadat et al., 2024) 沿与条件速度正交的 CFG 更新分量施加引导以减少过饱和与伪影。记 $\mathbf u_t^{\mathrm{cond}}$ 与 $\mathbf u_t^{\mathrm{uncond}}$ 为条件与无条件速度，APG 的更新方向为 $\mathbf d_t^u=c_t\mathbf u_t^{\mathrm{cond}}-q_t\mathbf u_t^{\mathrm{uncond}}$（式 (70) 起，$c_t,q_t$ 为与 CFG 尺度相关的裁剪/投影系数）。将相同裁剪与投影系数施加于条件与无条件速度的标准差，得到不确定性引导方向

$$
\mathbf d_t^\sigma=(c_t-q_t)\sigma_{t,\mathbf y}^\theta-c_t\sigma_{t,\varnothing}^\theta.\tag{72}
$$

于是尺度 $\lambda$ 下的预测标准差为 $\tilde{\boldsymbol\sigma}_{t,\mathrm{APG}}(\lambda)=\sigma_{t,\mathbf y}^\theta+\lambda\mathbf d_t^\sigma$（式 (73)）。APG+UCFG 随后用与 UCFG 相同的方差最小化与截断流程（§D）选择样本级尺度 $\lambda^*$，只是以 $\mathbf d_t^\sigma$ 替代标准 CFG 不确定性方向、以 $\lambda_{\max}$ 为上界；最终返回引导均值 $\bar u_{t,\mathbf y}^\theta+\lambda^*\mathbf d_t^u$ 与标准差代理 $\sigma_{t,\mathbf y}^\theta+\lambda^*\mathbf d_t^\sigma$。

## 附录 F 主实验的附加结果

本附录收集正文引用的附加图，以补充主实验。

### F.1 基于不确定性的过滤

我们通过逐步过滤高不确定性生成样本并跟踪 FID 与精确率/召回率，评估不确定性是否提供有用的可靠性信号。图 9 汇总 CIFAR-10 与 ImageNet-128 上的结果。跨数据集，UA-Flow 在过滤下表现出一致的精确率—召回率折中：移除最不确定样本提升精确率、降低召回率。

**图 9：** 跨数据集过滤高不确定性样本：生成质量指标随过滤比例的变化。CIFAR-10 上基于不确定性的过滤主要诱导精确率—召回率折中，尽管总体样本质量高仍可能对 FID 产生负面影响；ImageNet-128 上趋势与 ImageNet-256 一致——相比 AU 与 BayesDiff，UA-Flow 过滤后 FID 更低、精确率更高；GenUnc 作为参考基线纳入。（来源：原文第 30 页。）

**CIFAR-10。** CIFAR-10 上未过滤样本质量已很高，故过滤带来的精确率增益大部分被召回率损失抵消，FID 随过滤比例上升。我们强调该 FID 趋势并不表示我们的不确定性估计降低了生成质量：过滤实验意在验证不确定性作为**每样本**可靠性信号，而非衡量生成集合整体质量；过滤下精确率（即保真度）的持续提升确认 UA-Flow 标为高不确定性的样本确实更不可靠。

**ImageNet-128。** ImageNet-128 上过滤更可靠地提升保真度：相比 AU 与 BayesDiff，UA-Flow 过滤后 FID 更低、精确率更高（召回率如预期下降）。GenUnc 作为参考基线纳入，其使用 CLIP 嵌入空间中估计的领域特定标量不确定性，与 UA-Flow 预测的逐元素不确定性性质不同。

**表 10：ImageNet-256 上 UG 的多随机种子评估（$\lambda=0.5$）。** 3 个随机种子的均值 ± 标准差，对应表 3(c) 中 $\lambda=0.5$ 的行；此处报告多种子统计量是因为该工作点 FID 差距较小、需确认改进在统计上一致。（来源：原文第 31 页。）

| 设置 | FID↓ | Prec.↑ | Rec.↑ |
|---|---|---|---|
| 仅 CFG（$w=0$） | 5.337 ± .042 | 0.7132 ± .0019 | 0.5495 ± .0024 |
| CFG + UG（$w=20$） | 4.999 ± .047 | 0.7281 ± .0005 | 0.5393 ± .0012 |

### F.2 不确定性感知引导

F.2.1 给出 UG 在 CIFAR-10 与 ImageNet-128 上的 FID/精确率/召回率曲线（图 11 与 F.2.2）；整体趋势与 ImageNet-256（图 4）一致：增大 $w$ 提升精确率、降低召回率；非零 CFG 尺度下 FID 先降后升。

**图 11：** FID、精确率与召回率随固定 CFG 尺度 $\lambda$ 或最大 UCFG 尺度 $\lambda_{\max}$ 的变化（含 CIFAR-10 与 ImageNet-128）。（来源：原文第 32 页。）

**图 12：** ImageNet-128 上自适应引导尺度 $\lambda^*$ 随采样步的分布。（来源：原文第 32 页。）

## 附录 G 补充分析

### G.1 BayesDiff 与 UA-Flow 中的不确定性演化

图 13 与图 14 比较 BayesDiff 与 UA-Flow 在采样轨迹上的不确定性图演化（ImageNet-256）。BayesDiff 的不确定性在早期高噪声步呈现大幅度、噪声样模式，并在被传播后主导轨迹；UA-Flow 的不确定性则更局部化并随采样推进收缩到语义相关区域。图 15 量化二者不确定性尺度随采样步的变化。

**图 13：** BayesDiff 的定性不确定性演化（ImageNet-256 采样）。（来源：原文第 33 页。）

**图 14：** UA-Flow 的定性不确定性演化（ImageNet-256 采样）。（来源：原文第 34 页。）

**图 15：** BayesDiff 的不确定性尺度随采样步的变化。（来源：原文第 35 页。）

### G.2 基于不确定性过滤的定性验证

图 16 与图 17 分别给出类别 *teddy bear* 与 *hen*（ImageNet-256，CFG $\lambda=0.5$）中不确定性最低与最高样本的对比。低不确定性样本在语义一致性与图像质量上明显优于高不确定性样本，二者形成清晰的定性分离。

**图 16：** *teddy bear*：不确定性最低与最高样本对比。（来源：原文第 35 页。）

**图 17：** *hen*：不确定性最低与最高样本对比。（来源：原文第 35 页。）

### G.3 验证图像上经重建的校准分析

校准协议：ImageNet-256 验证图像经 Stable Diffusion 自编码器映射为潜变量（$C=4$ 通道），对每个 $t\in\{0.5,0.7,0.9\}$ 采样噪声 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$ 并构造含噪状态 $\mathbf z_t=\alpha_t\mathbf z_1+\beta_t\boldsymbol\epsilon$，再从 $\mathbf z_t$ 运行 ODE 到时刻 1 的预测端点 $\hat{\mathbf z}_1$；对每个方法还计算端点状态不确定性 $\mathrm{Var}[\mathbf z_1|\mathbf z_t]$，以真实潜变量 $\mathbf z_1$ 作为校准真值。

校准用两个标准指标在全部 $M=N\times C\times H\times W$ 个标量元素上计算：

- **ECE（期望校准误差）：** 对每个元素 $i$ 计算 CDF 值 $p_i=\Phi\left((z_{1,i}-\hat z_{1,i})/\sqrt{\mathrm{Var}[z_{1,i}]}\right)$，其中 $\Phi$ 为标准正态 CDF。对校准良好的预测分布，PIT 值应在 $[0,1]$ 上均匀；我们在 $B+1$ 个等间距分位水平 $q_b=b/B$（$b=0,\ldots,B$）上评估其经验 CDF，报告 $\mathrm{ECE}=\frac{1}{B+1}\sum_{b=0}^{B}|\hat F(q_b)-q_b|$，其中 $\hat F(q)=\frac1M\sum_i\mathbf 1[p_i\le q]$。
- **95% 覆盖事件的 Brier 分数：** 对每个元素在 $q=0.95$ 处构造中心高斯预测区间 $I_q$，计算 $\frac1M\sum_i(q-\mathbf 1[z_{1,i}\in I_q])^2$，事件即干净潜变量值是否落入该区间。

事后校准通过在独立校准集（500 张图像）上拟合标量并重缩放预测方差实现，方差校准使用等渗回归 (Kuleshov et al., 2018)。我们把 UA-Flow 与 BayesDiff、AU 比较；GenUnc 因每样本仅产生标量不确定性而被排除，而 UA-Flow、BayesDiff、AU 均产生逐分量不确定性、可直接比较。UA-Flow 与 BayesDiff 在所有 $t$ 上比较；AU 仅在 $t=0.9$ 报告，因为其不确定性只在采样后期步定义。

**表 11：ImageNet-256 验证图像上的校准结果。** UA-Flow 在三个噪声水平 $t$ 上、校准前后均取得比 BayesDiff 更低的 ECE 与 Brier 分数；AU 仅在 $t=0.9$ 报告。（来源：原文第 37 页。）

**表 11(a) 事后校准前：**

| $t$ | UA-Flow ECE↓ | UA-Flow Brier↓ | BayesDiff ECE↓ | BayesDiff Brier↓ | AU ECE↓ | AU Brier↓ |
|---|---|---|---|---|---|---|
| 0.5 | 0.1328 | 0.4771 | 0.2381 | 0.9025 | — | — |
| 0.7 | 0.0992 | 0.3281 | 0.2381 | 0.9025 | — | — |
| 0.9 | 0.0277 | 0.1009 | 0.2386 | 0.9025 | 0.0485 | 0.1782 |

**表 11(b) 事后校准后：**

| $t$ | UA-Flow ECE↓ | UA-Flow Brier↓ | BayesDiff ECE↓ | BayesDiff Brier↓ | AU ECE↓ | AU Brier↓ |
|---|---|---|---|---|---|---|
| 0.5 | 0.0066 | 0.0515 | 0.0105 | 0.0558 | — | — |
| 0.7 | 0.0038 | 0.0492 | 0.0073 | 0.0546 | — | — |
| 0.9 | 0.0008 | 0.0481 | 0.0038 | 0.0505 | 0.0012 | 0.0496 |

**结果。** 校准前 UA-Flow 在所有噪声水平上一致优于 BayesDiff，且差距随 $t$ 增大收窄：$t=0.9$ 时 UA-Flow 的 ECE/Brier 为 0.0277/0.1009，BayesDiff 为 0.2386/0.9025，AU 为 0.0485/0.1782。高 $t$ 下含噪状态保留大部分原始信号，ODE 实际在重建原始图像，校准应较强；低 $t$ 下信号严重损坏、轨迹类似条件生成，校准本身更难——这提供了一个自然的合理性检查：校准质量应随 $t$ 单调改善。如预期，UA-Flow 的校准随 $t$ 单调改善；相反 BayesDiff 在所测 $t$ 上呈现近乎恒定且更高的 ECE 与 Brier。经等渗回归事后校准后，所有方法的 ECE 与 Brier 均下降，UA-Flow 保持优势，在 $t=0.9$ 达到 ECE 0.0008、Brier 0.0481（BayesDiff 0.0038/0.0505，AU 0.0012/0.0496）。这些结果证明 UA-Flow 的不确定性估计有实质校准，除过滤实用性外还可作为样本质量的可靠度量。

### G.4 UCFG 的条件–无条件速度相关性的实证验证

UCFG 组合条件与无条件预测，其方差近似（式（13））依赖相关近似 $r_i\approx1$。图 18（左）给出无条件与条件速度的散点图，显示二者近乎线性关系；ImageNet-256 上跨所有采样步汇总的 Pearson 相关为 $r=0.993$，每个单独步的相关均超过 0.98，支持该近似。

**图 18：** 无条件与条件速度的相关性。左：散点图；右：各采样步的相关。（来源：原文第 37 页。）

## 附录 H 不确定性估计与引导的消融

### H.1 不确定性估计流程的消融

图 19 对 ImageNet-256（UA-Flow，$\lambda=0$）系统消融不确定性估计流程的各个设计选择：

- **Hutchinson 探针数 $S$（图 19d）。** 用 $S\in\{1,2,4,8\}$ 个探针近似协方差，所得曲线几乎相同，故取单探针 $S=1$。
- **方差传播方法（图 19e）。** 比较默认一阶 Euler 更新与在当前与预测下一状态平均方差增量的 Heun2 更新：二者曲线高度吻合，Heun2 仅在高过滤比例下带来很小 FID 增益。我们采用 Euler，因为每步少一次不确定性评估。
- **稀疏不确定性更新（图 19f）。** 每 2、4 或 8 个采样步传播一次而非每步传播：所有设置趋势一致；我们采用每四步更新（与 BayesDiff 一致），在不影响过滤质量的前提下把传播评估次数减少 4 倍。
- **不确定性聚合比例（图 19g）。** 比较不确定性图 top-$k$% 聚合（CVaR$_\alpha$），$k\in\{1,5,10,25,50\}$%，默认 $k=10$%。$k\in[5\%,25\%]$ 时结果稳定，1% 以下则不稳定。

**图 19：** UA-Flow 不确定性估计流程的消融（ImageNet-256，UA-Flow）。（来源：原文第 39—40 页。）

### H.2 UG 的消融

图 19（续，p41）消融 UG 的函数形式 $f(\boldsymbol\sigma^2)$ 与引导间隔（每 1、2、4 个采样步）：UG 在测试形式下变化很小，支持每两个采样步应用一次的默认设置。

### H.3 偏差修正项 $U_t(\mathbf x_t,\mathbf x_1)$ 的作用

**表 12：偏差修正消融（ImageNet-256）。** 用 $U_t=0$ 训练的 UA-Flow 模型的指标；† 表示 3 个随机种子平均。（来源：原文第 41 页。）

| 任务 | FID↓ | Prec.↑ | Rec.↑ |
|---|---|---|---|
| — | 22.87 | 0.5063 | 0.6683 |
| 过滤（50%） | 20.66 | 0.5158 | 0.6462 |
| UG（$\lambda=0$，$w=50$） | 18.44 | 0.5296 | 0.6389 |
| 最佳 UCFG†（$\lambda_{\max}=1.25$） | 4.67 ± .05 | 0.7578 ± .0040 | 0.5063 ± .0029 |
| 最佳固定 CFG†（$\lambda=0.75$） | 4.53 ± .04 | 0.7821 ± .0066 | 0.4920 ± .0037 |

**UCFG。** 该修正对 UCFG 至关重要：无修正时最佳 UCFG（FID $4.67\pm0.05$，$\lambda_{\max}=1.25$）不能超过固定 CFG（FID $4.53\pm0.04$，$\lambda=0.75$）；有修正时 UCFG（FID $4.30\pm0.01$，$\lambda_{\max}=1.5$）优于固定 CFG（FID $4.48\pm0.01$，$\lambda=0.75$）。图 20 表明去掉修正会在早期高估不确定性，但在结构形成的中期阶段产生略弱的自适应 CFG，从而限制 UCFG 的收益。

**图 20：** 速度不确定性幅度（$\lambda=0$）与自适应 CFG 尺度（$\lambda_{\max}=20$）随采样步的变化，含与不含偏差修正项 $U_t$（ImageNet-256，1,000 张图像）。无修正时方差头在极早步高估不确定性，且自适应 CFG 尺度中位数在形成粗糙图像结构的中期阶段偏低；有修正时早期速度不确定性更低、中期自适应 CFG 尺度更高。（来源：原文第 42 页。）

## 附录 I 非图像域实验

为考察 UA-Flow 的不确定性估计能否泛化到图像生成之外，我们在流匹配已成功应用的非图像域评估它。

### I.1 二维棋盘

**设置。** 我们在二维棋盘分布上训练流匹配模型，以验证 UA-Flow 会给落在目标支撑之外的样本赋予高不确定性。速度网络为 3 层 MLP，以批大小 4,096、学习率 $10^{-3}$ 训练 100,000 次迭代，再以学习率 $10^{-5}$ 微调 100,000 次迭代。评估时用 Euler 方法、100 NFE 生成 $10^5$ 个样本，并把传播的逐元素状态方差归约为标量以计算样本级不确定性分数。**覆盖率**定义为保留样本中落入棋盘网格内的比例。

**结果。** 图 21 以 log 状态方差着色展示生成样本：高不确定性样本聚集在网格边界附近或之外，低不确定性样本则集中在棋盘单元内部。定量上，网格外样本的平均不确定性分数是网格内样本的 **8.0 倍**，支持用该分数识别该设定下的支撑外样本。表 13 给出过滤最不确定样本后的覆盖率：未过滤时覆盖率 95.7%，移除 top 5% 提升到 98.8%，移除 10% 达到 99.4%。这些结果为"UA-Flow 的不确定性分数能在简单二维分布上识别偏离目标支撑的样本"提供了证据。

**表 13：** 二维棋盘上基于不确定性过滤后的覆盖率。覆盖率为保留样本中落入棋盘网格内的比例；按 UA-Flow 不确定性过滤单调提升覆盖率。（来源：原文第 43 页。）

| 过滤比例 | Coverage↑ |
|---|---|
| 0%（不过滤） | 0.9572 |
| 1% | 0.9668 |
| 2.5% | 0.9793 |
| 5% | 0.9876 |
| 10% | 0.9936 |

**图 21：** 生成的二维棋盘样本与不确定性。左：以 log 状态方差着色的样本；中：叠加在真值棋盘网格上的生成样本；右：移除 top 5% 最高不确定性样本后的样本。高不确定性样本集中在网格边界附近或之外，移除后覆盖率明显改善。（来源：原文第 43 页。）

### I.2 时间序列

**设置。** 考虑合成正弦波数据上的条件时间序列预测任务：每条序列为带噪正弦波，频率从 $[0.5,2.0]$ 均匀采样、幅度从 $[0.5,1.5]$ 均匀采样，并加标准差 0.01 的加性高斯噪声；序列以 $\Delta t=0.01$ 离散，前 50 步作为条件输入、后 50 步作为预测目标。速度网络为 1D UNet，以批大小 4,096、学习率 $10^{-4}$ 训练 40,000 次迭代，再以学习率 $10^{-5}$ 微调 10,000 次迭代。评估时抽取 1,000 个随机条件输入，每个输入用 Euler 方法、100 NFE 生成 100 条预测；样本级不确定性分数为传播的逐元素状态方差在所有预测时间步上的求和。

**结果。** 表 14 报告过滤最不确定预测后预测轨迹与真值轨迹之间的 MSE：过滤单调降低 MSE——移除 top 10% 使误差降低 3.8 倍（从 $14.65\times10^{-4}$ 降到 $3.87\times10^{-4}$），移除 90% 进一步降到 $0.78\times10^{-4}$。图 22 定性展示了这一点：不过滤时部分轨迹偏离真值，而过滤后保留的预测紧密跟随真实延续。这些结果确认 UA-Flow 的不确定性可作为条件时间序列生成的可靠每样本质量信号，与图像及二维棋盘实验中观察到的过滤行为一致。

**表 14：** 正弦波时间序列任务上基于不确定性过滤后的 MSE。MSE 在每条预测轨迹与其真值延续之间计算、对保留样本平均；按 UA-Flow 不确定性过滤单调降低预测误差。（来源：原文第 44 页。）

| 过滤比例 | MSE（$\times10^{-4}$）↓ |
|---|---|
| 0%（不过滤） | 14.65 |
| 10% | 3.87 |
| 25% | 2.11 |
| 50% | 1.77 |
| 90% | 0.78 |

**图 22：** 条件时间序列预测与基于不确定性的过滤。每个面板给出给定观测输入（蓝）与真值曲线（橙虚线）下生成的预测（彩色曲线）。从左到右：不过滤、10% 过滤、25% 过滤；移除高不确定性预测可消除错误预测。（来源：原文第 44 页。）

### I.3 Push-T 环境中的机器人策略

**设置。** 该初步研究考察 chunk 级不确定性与闭环结果的关系：在 Push-T (Chi et al., 2025; Zhang & Gienger, 2024) 中，策略把 T 形块推到目标位姿。我们使用以 $76\times76$ 图像与 2D agent 位置为条件的 1D UNet（观测时域 2、预测时域 16、动作 chunk 大小 8），以批大小 256、学习率 $10^{-4}$ 训练 1,000 个 epoch。每个决策步对动作各维度求和传播的状态方差，得到一次生成动作 chunk 的不确定性分数；我们检验该分数能否作为在线中止信号。

**不确定性触发的早停。** 当当前 chunk 不确定性超过阈值 $\tau$ 时终止 rollout；表 15 报告 1,000 次试验中保留的 rollout。随 $\tau$ 收紧，排除率与保留成功率同时上升：$\tau=0.001$ 时排除 87.8% 的 rollout，把保留成功率从 62.7% 的基线提升到 91.0%。

**表 15：Push-T 机器人操作上的不确定性触发早停。** rollout 中若生成动作 chunk 的状态不确定性超过阈值 $\tau$，则终止该 rollout 并从评估中排除；否则执行该 chunk。结果在 1,000 个 rollout 中未早停完成的样本上平均；最大奖励超过 1.0 记为成功。（来源：原文第 45 页。）

| 阈值 $\tau$ | Included | Excluded | Excl. % | Success %↑ | Mean MaxR↑ | Std MaxR |
|---|---|---|---|---|---|---|
| 不删除 | 1000 | 0 | 0.0% | 62.7% | 0.9514 | 0.1506 |
| 0.0010 | 122 | 878 | 87.8% | 91.0% | 0.9702 | 0.1253 |
| 0.0025 | 371 | 629 | 62.9% | 77.6% | 0.9597 | 0.1424 |
| 0.0050 | 708 | 292 | 29.2% | 66.8% | 0.9536 | 0.1526 |
| 0.0075 | 854 | 146 | 14.6% | 63.6% | 0.9536 | 0.1504 |
| 0.0100 | 921 | 79 | 7.9% | 63.3% | 0.9521 | 0.1511 |

## 附录 J 样本与不确定性

图 23 给出不确定性感知引导扫描下若干 ImageNet-256 样本网格：行扫描 UG 尺度 $w\in\{0,10,30,50\}$，列扫描最大 UCFG 尺度 $\lambda_{\max}\in\{0,1,2,5,10,20\}$；左为生成样本，右为预测的潜像素级不确定性图。

**图 23：** 不确定性感知引导扫描下选定的 ImageNet-256 样本网格。（来源：原文第 46 页。）

## 图注与表注

**图注汇总：** 图 1（原文第 2 页）ImageNet-256 上 UG/UCFG 扫描的样本与潜像素级不确定性（类别 *guinea pig*）；图 2（第 8 页）ImageNet-256 生成质量随过滤比例的变化；图 3（第 8 页）UA-Flow/AU/BayesDiff 不确定性图对比（CIFAR-10、ImageNet-128/256）；图 4（第 10 页）ImageNet-256 的 FID/精确率/召回率随 UG 尺度 $w$ 的变化；图 5（第 11 页）$\lambda=0.5$ 下不同 UG 尺度的 ImageNet-256 样本；图 6（第 12 页）FID/精确率/召回率随 CFG 尺度 $\lambda$ 或 $\lambda_{\max}$ 的变化；图 7（第 13 页）UCFG 与 APG+UCFG 的 $\lambda^*$ 分布；图 8（第 13 页）大引导尺度下的样本对比；图 9（第 30 页）CIFAR-10 与 ImageNet-128 上过滤实验（F.1）；图 10（第 31 页）UG 在 CIFAR-10 与 ImageNet-128 上的曲线（F.2，推断）；图 11（第 32 页）CFG/UCFG 曲线（含 CIFAR-10 与 ImageNet-128）；图 12（第 32 页）ImageNet-128 的 $\lambda^*$ 分布；图 13—15（第 33—35 页）BayesDiff 与 UA-Flow 的不确定性演化对比及尺度随步变化；图 16—17（第 35 页）*teddy bear* 与 *hen* 的高低不确定性样本对比；图 18（第 37 页）条件与无条件速度相关性；图 19（第 39—41 页）不确定性估计流程与 UG 的消融；图 20（第 42 页）偏差修正对速度不确定性与自适应 CFG 尺度的影响；图 21（第 43 页）二维棋盘样本与不确定性；图 22（第 44 页）条件时间序列预测与过滤；图 23（第 46 页）UG/UCFG 扫描下的 ImageNet-256 样本网格。

**表注汇总：** 表 1（第 9 页）采样与不确定性量化的每图 TFLOPS；表 2（第 10 页）不确定性与流形支持的 Spearman 相关；表 3（第 11 页，按数据集拆为 (a) CIFAR-10、(b) ImageNet-128、(c) ImageNet-256）UG 下的 FID/精确率/召回率；表 4（第 12 页，拆为 (a) ImageNet-128、(b) ImageNet-256）CFG 变体的最佳尺度与指标（3 种子平均）；表 5（第 14 页）偏差修正估计器的批大小敏感性；表 6（第 14 页）ImageNet-256 验证图像上的校准；表 7（第 15 页）Push-T 早停（精简版）；表 8（第 27 页）训练超参数；表 9（第 28 页）CIFAR-10 的 ADM 配置；表 10（第 31 页）UG 在 ImageNet-256 上的多随机种子评估；表 11（第 37 页，拆为校准前/后）校准结果；表 12（第 41 页）偏差修正消融；表 13（第 43 页）二维棋盘过滤后覆盖率；表 14（第 44 页）时间序列过滤后 MSE；表 15（第 45 页）Push-T 早停完整表。**核对方式：** 表 1、2、3、4、5、6、7、10、11、13、14、15 已用 `render.py` 渲染 PDF 对应页并逐格核对；表 8、9、12 按原文文本抽取逐格转录（表 12 与表 15 的数值亦与正文交叉核对）。

**本页范围与校对状态：** 本页覆盖 arXiv:2602.10326v3（cs.CV，2026 年 10 月 14 日）全文 46 页：摘要、第 1—5 节、更广泛影响声明、致谢、参考文献 [1]—[47]（英文原条目）、附录 A（损失推导，式 (16)—(23)）、B（方差传播与协方差近似，式 (24)—(26) 及 B.2）、C（Heun2 方差传播，式 (27)—(57)）、D（λ* 闭式解，式 (58)—(62)）、E（实现细节：表 8—9、基线流匹配版本、APG 与 APG+UCFG 式 (72)—(73)）、F（附加结果：图 9、表 10、图 11—12）、G（补充分析：图 13—18、表 11）、H（消融：图 19—20、表 12）、I（非图像域：表 13—15、图 21—22）、J（图 23）、图 1—23 图注、表 1—15、式（1）—（77）。**说明：** 附录 A—J 按原文结构逐节译出并保留全部编号公式引用与关键公式；对超长推导链（如附录 B.2 的多组协方差近似比较、C 的完整 Heun2 逐项展开、E.2 各基线的逐步换算）以关键步骤 + 编号公式引用方式呈现，未将每个中间代数式逐行复制；表格与图注为完整逐格/逐条转录。原文未含 NeurIPS checklist 章节。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内图像未数字化转写。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2602.10326v3) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}