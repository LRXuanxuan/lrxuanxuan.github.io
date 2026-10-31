---
layout: page
title: "预训练模型下成像逆问题的后验动力学框架｜中文全文译文"
permalink: /papers/translations/2026-09-18-2608-15144-a-posterior-dynamics-framework-for-imaging-inverse-problems-with-pretr/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a0b27791ab412699/) · [原文 arXiv](https://arxiv.org/abs/2608.15144) · [全部目录](/papers/catalog/)

# 预训练模型下成像逆问题的后验动力学框架

**原题：** A Posterior-Dynamics Framework for Imaging Inverse Problems with Pretrained Diffusion Priors  
**作者：** Zhaoqiang Liu\*、Tongyao Pang†（通讯作者）、Ruibing Wang\*、Yang Zheng\*  
**单位：** \* 电子科技大学计算机科学与工程学院（成都 611731）；† 清华大学丘成桐数学科学中心（北京 100084）。  
**版本：** arXiv:2608.15144v2（stat.ML），v2 日期 2026 年 9 月 3 日；原文 26 页（含附录 A–E）。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2608.15144v2 [stat.ML] 3 Sep 2026"，与库内登记编号 2608.15144 一致；首页给出作者单位与邮箱脚注，文末为致谢与声明（含 AI 使用说明）。  
**范围与状态：** 全文中文译稿：摘要、关键词、MSC 分类号、第 1–5 节正文与编号小节、图 1–5 中文图注、表 1–3 逐格转写、算法 3.1、附录 A–E（证明与方程）、致谢与声明，以及参考文献 49 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

预训练的扩散模型通过一族逐步平滑的分布连续统来表示图像分布。这种多尺度结构把生成过程从全局结构组织到精细细节，并支撑高质量、多样化的采样。我们把同一多尺度扩散先验用于线性成像逆问题。我们不是仅把预训练模型用作外层迭代中的去噪器，而是定义一个替代似然，其中心与干净图像坐标对齐、其协方差计入残余扩散不确定性。该构造定义了一条显式的替代后验路径，我们由此导出连续的后验动力学。一个可调的 Langevin 分量支持目标跟踪，并允许按应用调整后验探索量。我们证明端点一致性、有限时域跟踪界，以及在精确得分设定下的一阶弱精度。计算方面，我们导出后验动力学隐–显式采样器（PD-IMEX），一种在每个扩散尺度只做一次得分评估、并使用隐式数据一致性更新的稳定方法。在去模糊、超分辨率与修复上的实验表明，在 100 次得分评估下重建质量强、粗网格稳定，且保真–多样性行为可控。

**关键词：** 扩散生成先验；成像逆问题；后验动力学；似然延拓；后验采样；隐–显式方法  
**MSC 分类号：** 65J22, 65C30, 62C10, 68T07, 94A08

## 1. 引言

许多成像任务，包括去模糊、超分辨率、断层成像与加速磁共振成像，都可建模为线性逆问题。我们考虑如下形式的测量

$$
\mathbf y=\mathbf A\mathbf x+\mathbf n,\qquad \mathbf A\in\mathbb R^{m\times d},\quad \mathbf n\sim\mathcal N(\mathbf 0,\sigma_d^2\mathbf I), \tag{1.1}
$$

其中 $\mathbf x\in\mathbb R^d$ 是未知干净图像。由于 $\mathbf A$ 通常是病态的或秩亏的，重建严重依赖先验信息。经典模型通过显式正则项编码平滑性、稀疏性、低秩结构或非局部自相似性 [35, 40, 9, 6, 12, 19, 17]。任务特定的复原网络从成对、含噪或自监督数据中学习更强的规律 [46, 28, 45, 25, 3, 24]。然而其重建规则通常与训练退化、数据协议或任务绑定，当传感算子变化时可能需要重训练或适配。

深度生成模型提供了分布层面的替代方案。它们从干净数据学习合理图像的统计特性，并可在推理时与不同传感算子复用。这把学到的图像先验与显式物理测量模型分离，避免为每种退化训练新的重建网络。

扩散模型与密切相关的连续时间生成模型在高分辨率图像合成中取得显著成功，产生具有连贯全局结构、精细空间细节与广泛语义多样性的真实图像。Stable Diffusion [34] 与流匹配模型 FLUX.1 Kontext [4] 提供了有力证据：这些模型能表示丰富的高维图像分布。在扩散模型中，生成是通过一族逐步高斯平滑的图像分布连续统而非仅通过干净图像分布来组织的 [37, 18, 38]。我们把这种按噪声层级索引的多层族称为**多尺度扩散先验**：每个扩散尺度是不同高斯平滑程度下的密度。在粗扩散尺度，模型组织全局结构与备选模态；在细扩散尺度，它逐步解析纹理与局部细节。这种由粗到细的组织正是扩散生成高保真与多样性的基础。

对逆问题而言，这种结构提示我们去条件化整个多尺度扩散先验，而不是只把预训练网络用作端点去噪器。粗扩散尺度可在测量仍不确定时组织全局图像结构，更细的尺度则可纳入越来越精细的数据一致性。在每个扩散尺度保留一个分布，还允许欠定问题中存在多个数据一致模态 [41, 44]。我们的目标是利用这种多尺度表示，在不牺牲生成先验所提供多样性的前提下，获得高效的后验求解器。

据此，我们把重建表述为贝叶斯后验推断，并追问端点后验如何能沿同一组扩散尺度扩展：

$$
p(\mathbf x\mid\mathbf y)\propto p_0(\mathbf x)\exp\left(-\frac{\|\mathbf A\mathbf x-\mathbf y\|^2}{2\sigma_d^2}\right), \tag{1.2}
$$

其中 $p_0$ 由扩散模型隐式表示。扩散先验学习逐步平滑的数据分布的得分 [37, 38, 18]。对前向过程

$$
\mathrm d\mathbf X_t=f(\mathbf X_t,t)\,\mathrm dt+g(t)\,\mathrm d\mathbf W_t, \tag{1.3}
$$

反向时间先验动力学为

$$
\mathrm d\mathbf X_t=\left[f(\mathbf X_t,t)-g(t)^2\nabla\log p_t(\mathbf X_t)\right]\mathrm dt+g(t)\,\mathrm d\bar{\mathbf W}_t,\qquad t:T\to0, \tag{1.4}
$$

其中得分由经去噪得分匹配训练的神经网络近似 [1, 38]。

一种有原则的修改反向先验动力学、使其端点律匹配后验的方法，是用端点似然倾斜参考路径律。令 $P_{\mathrm{pr}}$ 表示由 (1.4) 诱导的路径律。所得似然倾斜路径律具有相对熵正则化的变分刻画 [16]：

$$
Q^\star_{\mathbf y}=\arg\min_{Q\ll P_{\mathrm{pr}}}\left\{\mathrm{KL}(Q\|P_{\mathrm{pr}})-\mathbb E_Q[\log p(\mathbf y\mid\mathbf X_0)]\right\},\qquad \frac{\mathrm dQ^\star_{\mathbf y}}{\mathrm dP_{\mathrm{pr}}}=\frac{p(\mathbf y\mid\mathbf X_0)}{p(\mathbf y)}. \tag{1.5}
$$

由贝叶斯公式，$Q^\star_{\mathbf y}$ 下的端点边缘为 $p_0(\cdot\mid\mathbf y)$。这种路径律修改可通过带势函数 $h_t(\mathbf x)=\mathbb E_{P_{\mathrm{pr}}}[p(\mathbf y\mid\mathbf X_0)\mid\mathbf X_t=\mathbf x]=p_t(\mathbf y\mid\mathbf x)$ 的 Doob 变换 [14] 动态实现。在 (1.4) 的降时约定下，Doob 变换贡献漂移 $-g(t)^2\nabla\log h_t$。因此精确后验动力学为

$$
\mathrm d\mathbf X_t=\left[f(\mathbf X_t,t)-g(t)^2\nabla\log p_t(\mathbf X_t\mid\mathbf y)\right]\mathrm dt+g(t)\,\mathrm d\bar{\mathbf W}_t,\qquad t:T\to0. \tag{1.6}
$$

贝叶斯公式接着把该受控漂移中的后验得分分离为

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf y)=\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t). \tag{1.7}
$$

预训练模型提供每个扩散尺度上的先验得分，但中间似然得分一般不可得，因为

$$
p_t(\mathbf y\mid\mathbf x_t)=\int p(\mathbf y\mid\mathbf x_0)\,p(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0. \tag{1.8}
$$

因此核心计算困难在于条件化多尺度扩散先验，而不在于再学习一个干净图像先验。路径空间控制表述确定了精确参考动力学；剩余任务是为其不可得的似然项构造可处理的替代。

现有方法通过离散引导修正、算子感知投影、展开或即插即用重建方案，以及更昂贵的粒子或内层 Monte Carlo 过程来处理不可得的中间似然 [10, 11, 39, 23, 49, 44, 7, 43, 48]。近期可证明方法通过奇异方向 DDIM 更新，或通过外层概率传输配合内层 Langevin 后验得分估计，获得后验正确性 [20, 8]。这些方法有不同的算法结构。我们的目标是把多尺度扩散先验保留为中心建模对象，并由同一构造导出显式后验路径、连续动力学与数值求解器。

我们在干净图像坐标中工作，尺度对齐与似然延拓在此定义沿扩散先验高斯平滑路径的归一化替代后验。其输运缺陷促使我们引入可调 Langevin 分量用于跟踪与探索。由同一连续模型，我们导出后验动力学隐–显式采样器（PD-IMEX），它每个尺度只做一次得分评估并使用隐式线性数据一致性。

我们的主要贡献是一个多尺度后验动力学框架，把固定的预训练扩散模型变为线性成像逆问题的高效、可调求解器。具体地：

- **多尺度替代后验构造。** 我们使用完整的多尺度扩散先验，而不是只把预训练网络当作外层重建过程中的去噪模块。确定性尺度对齐把替代似然中心置于干净图像坐标，似然延拓则计入残余扩散不确定性的主导投影协方差。二者共同在每个扩散尺度定义归一化替代后验，并在端点恢复期望的贝叶斯后验。
- **带保证与可调探索的后验动力学。** 我们导出由基础多尺度输运与自由选择的 Langevin 分量组成的连续动力学。对移动的替代后验，Langevin 强度支持目标跟踪，并使同一框架可从近乎确定性重建一直覆盖到更强的后验探索。我们刻画路径失配，并建立端点一致性与有限时域跟踪界。
- **高效稳定的数值实现。** 我们导出 PD-IMEX，一种每尺度一次得分评估的离散化：把线性似然动力学隐式处理，并在数据一致性求解之后加入 Langevin 新息。对精确先验得分，我们建立一阶弱精度。实验表明在 100 次得分评估下重建质量强、粗网格稳定，且可控制保真–多样性折中。

## 2. 相关工作与定位

**似然引导与算子感知求解器。** 免训练扩散逆问题求解器通常在每个扩散尺度上，用不可得中间似然得分的近似来修改无条件反向过程。DPS 在 Tweedie 去噪估计处评估测量残差。基于流形约束或伪逆的方法纳入局部几何或近似条件协方差信息 [10, 11, 39]。TMPD 通过使用高阶 Tweedie 矩构造条件分布的统计动机近似，超越点近似 [5]。对结构化线性问题，SNIPS 与 DDRM 利用奇异向量分解分离测量知情方向与先验主导方向，DDNM 分解值域与零空间分量，DiffPIR 交替进行扩散去噪与显式数据一致性 [22, 23, 42, 49]。

**面向后验与退火的推断。** 第二条工作线更强调后验推断，通常付出额外计算代价。RED-Diff 等变分方法优化由扩散先验诱导的可处理目标，MGPS 则在变分后验采样构造内使用中间状态引导 [29, 30]。滤波与序贯 Monte Carlo 方法（含辅助变量法）通过粒子或内层 Monte Carlo 过程而非单次反向引导更新来近似条件分布 [15, 7, 43]。PnP-DM 把预训练扩散模型视为即插即用先验，把贝叶斯反演归约为高斯去噪后验的迭代采样 [44]。DAPS 则构造解耦噪声退火过程并在每个扩散尺度内层采样，允许更大步长、相对常规反向轨迹改善探索 [48]。这些方法通过额外推断迭代提高后验保真度或探索，而我们关注每个离散扩散尺度只需一次得分评估的单环路动力学。

**可证明的扩散后验采样。** 近期工作开始为扩散逆问题求解器建立严格的后验保证。对含噪线性逆问题，一种可证明的 DDIM 型采样器分别处理测量算子的奇异方向：当测量信噪比低时各分量沿扩散先验演化，一旦观测信息足够丰富就切换到校准的测量预测器，从而给出轻量的逐坐标更新与后验一致性 [20]。对更一般的贝叶斯逆问题，外层概率传输通过带热启动的内层 Langevin Monte Carlo 过程估计时变后验得分；其非渐近分析控制该嵌套过程中的初始化与采样误差，包括问题条件数的影响 [8]。这些结果表明，严格后验采样既可通过利用观测模型的精细结构、也可通过为后验得分估计投入额外计算来获得。

**本文定位。** 我们的区别在于把多尺度扩散先验作为中心对象，后验建模与计算都由它导出。许多实用方法通过离散引导、展开重建或即插即用迭代引入数据一致性，而近期可证明方法依赖算子特定的坐标更新或内层 Monte Carlo 得分估计。我们的构造是互补的：我们在每个扩散尺度定义归一化替代后验，量化其与基础多尺度输运的失配，并由同一后验路径导出连续输运–Langevin 动力学及相应 PD-IMEX 离散化。这给出单环路、每尺度一次得分的求解器，同时保留可调 Langevin 强度用于后验跟踪与探索。

## 3. 由多尺度扩散先验导出的后验动力学

第 1 节引入的多尺度扩散先验在干净图像坐标中变为一条高斯平滑路径。我们首先对其端点作精确条件化，以确定参考后验路径与一族输运–Langevin 动力学；然后在同一组扩散尺度上构造可处理的替代后验路径，分析其跟踪误差，并导出 PD-IMEX 离散化。

### 3.1 精确后验路径与输运–Langevin 族

我们从后验得分可得的理想设定开始。把未知信号与扩散端点 $\mathbf X_0\in\mathbb R^d$ 等同，并在全变差分析中始终假设 $\sigma_d>0$。方差保持（VP）前向随机微分方程（SDE）为

$$
\mathrm d\mathbf X_t=-\frac12\beta(t)\mathbf X_t\,\mathrm dt+\sqrt{\beta(t)}\,\mathrm d\mathbf W_t,\qquad \mathbf X_0\sim p_0, \tag{3.1}
$$

其中 $\beta(t)>0$。其边缘表示为

$$
\mathbf X_t=\sqrt{\alpha_t}\mathbf X_0+\sigma_t\boldsymbol\varepsilon,\qquad \alpha_t=\exp\left(-\int_0^t\beta(s)\,\mathrm ds\right),\quad \sigma_t^2=1-\alpha_t. \tag{3.2}
$$

扩散状态同时包含确定性衰减与加性高斯噪声。对精确后验路径，方便的做法是只去掉已知衰减，并把剩余噪声–信号比用作时间。因此我们引入干净状态与对数信噪比时间

$$
\mathbf Z_\lambda:=\frac{\mathbf X_t}{\sqrt{\alpha_t}}=\mathbf X_0+\tau_\lambda\boldsymbol\varepsilon,\qquad \tau_\lambda=e^{-\lambda},\quad q_\lambda:=\tau_\lambda^2=e^{-2\lambda},\quad \lambda=\frac12\log\frac{\alpha_t}{1-\alpha_t}. \tag{3.3}
$$

这是精确的变量替换，尚非似然近似。在该坐标中，每个边缘都是同一干净变量的加性高斯扰动，不确定性为 $q_\lambda$。对数信噪比时钟使反向方向单调，并给出 $\partial_\lambda q_\lambda=-2q_\lambda$。因此增大 $\lambda$ 沿反向生成方向从粗扩散尺度走向细扩散尺度。令 $P_q$ 表示与 $\mathcal N(0,q\mathbf I)$ 的卷积。无条件干净坐标密度为

$$
\pi_\lambda=P_{q_\lambda}p_0. \tag{3.4}
$$

族 $\{\pi_\lambda\}_\lambda$ 即多尺度扩散先验的干净坐标表示。对初始律关于 $\mathbf y$ 条件化，得到精确后验路径

$$
\pi_\lambda^{\mathbf y}=P_{q_\lambda}p_0(\cdot\mid\mathbf y). \tag{3.5}
$$

相应地，$\{\pi_\lambda^{\mathbf y}\}_\lambda$ 是跨越同一组扩散尺度的精确后验路径。对每个有限 $\lambda$，高斯平滑使 $\pi_\lambda^{\mathbf y}$ 严格正且光滑，即使端点后验只是 Borel 概率测度。

在 (3.3) 的变量替换下，精确后验动力学 (1.6) 变为

$$
\mathrm d\mathbf Z_\lambda=2q_\lambda\nabla\log\pi_\lambda^{\mathbf y}(\mathbf Z_\lambda)\,\mathrm d\lambda+\sqrt{2q_\lambda}\,\mathrm d\mathbf W_\lambda.
$$

然而边缘路径 (3.5) 并不唯一确定路径级动力学。令 $a_\lambda\ge0$ 表示 Langevin 强度，它控制匹配 Langevin 得分漂移与布朗扩散的强度。下述命题给出具有相同边缘的所得族；当 $a_\lambda=q_\lambda$ 时恢复上述动力学。

**命题 3.1（任意 Langevin 强度的精确后验族）。** 设 $a_\lambda\ge0$ 局部有界，并假设 SDE 及其 Fokker–Planck 方程在每个紧区间 $[\lambda_0,\Lambda]$ 上适定。考虑

$$
\mathrm d\mathbf Z_\lambda=(q_\lambda+a_\lambda)\nabla\log\pi_\lambda^{\mathbf y}(\mathbf Z_\lambda)\,\mathrm d\lambda+\sqrt{2a_\lambda}\,\mathrm d\mathbf W_\lambda,\qquad \mathbf Z_{\lambda_0}\sim\pi_{\lambda_0}^{\mathbf y}. \tag{3.6}
$$

则对一切 $\lambda\ge\lambda_0$ 有 $\mathbf Z_\lambda\sim\pi_\lambda^{\mathbf y}$。此外，当 $\lambda\to\infty$ 时 $\pi_\lambda^{\mathbf y}\Rightarrow p_0(\cdot\mid\mathbf y)$。

证明见 A 节。关键恒等式为

$$
\partial_\lambda\pi_\lambda^{\mathbf y}=-q_\lambda\Delta\pi_\lambda^{\mathbf y}. \tag{3.7}
$$

当把 (3.6) 的 Fokker–Planck 方程中的候选密度设为 $\pi_\lambda^{\mathbf y}$ 时，依赖 $a_\lambda$ 的漂移与扩散项精确抵消，只剩 (3.7)。

**注 3.2（相对 Langevin 强度）。** 取 $a_\lambda=\zeta q_\lambda$（$\zeta\ge0$），可相对多尺度输运系数 $q_\lambda$ 参数化 Langevin 分量，得到

$$
\mathrm d\mathbf Z_\lambda=(1+\zeta)q_\lambda\nabla\log\pi_\lambda^{\mathbf y}(\mathbf Z_\lambda)\,\mathrm d\lambda+\sqrt{2\zeta q_\lambda}\,\mathrm d\mathbf W_\lambda.
$$

因此 $\zeta=0$ 是概率流输运，$\zeta=1$ 是干净坐标中的常义反向 SDE。$\zeta>1$ 也可接受，且一般 $a_\lambda$ 允许时变 Langevin 强度计划。在理想模型中，改变 $\zeta$ 只改变路径级探索而不改变给定的后验边缘。对下文引入的移动替代后验，同一 Langevin 分量追加提供熵耗散，因而充当跟踪机制。

### 3.2 跨扩散尺度的替代后验路径

**尺度一致的似然中心。** 精确族不能直接实现，因为无条件扩散模型提供先验得分但不提供 (1.8) 中的中间似然。把干净似然（不计归一化常数）写为

$$
\ell(\mathbf x_0):=\exp\left[-\frac{\|\mathbf A\mathbf x_0-\mathbf y\|^2}{2\sigma_d^2}\right].
$$

精确量是条件平均

$$
p_t(\mathbf y\mid\mathbf x_t)\propto\mathbb E\left[\ell(\mathbf X_0)\mid\mathbf X_t=\mathbf x_t\right],\qquad \mathbf X_0=\frac{\mathbf x_t}{\sqrt{\alpha_t}}-\frac{\sigma_t}{\sqrt{\alpha_t}}\boldsymbol\varepsilon.
$$

该分解把扩散尺度对中间似然的两类影响分开：确定性衰减决定应在何处评估干净图像的前向模型，加性项表示关于干净图像的残余不确定性。精确评估后者需要加性修正项的条件律，包括其状态相关均值、协方差与更高阶矩。我们改为分阶段近似这两类影响。第一，只保留扩散通道的确定性缩放而去掉加性修正：

$$
\mathbf X_0\approx\frac{\mathbf x_t}{\sqrt{\alpha_t}},\qquad p_t(\mathbf y\mid\mathbf x_t)\approx\ell\left(\frac{\mathbf x_t}{\sqrt{\alpha_t}}\right).
$$

这里"尺度一致"特指似然中心：在应用干净图像前向模型之前去掉已知衰减。该零阶近似尚未计入被丢弃加性项的不确定性。它给出

$$
L_t^{\mathrm{sc}}(\mathbf x_t):=\exp\left[-\frac{1}{2\sigma_d^2}\left\|\mathbf A\frac{\mathbf x_t}{\sqrt{\alpha_t}}-\mathbf y\right\|^2\right]. \tag{3.8}
$$

由链式法则，

$$
\nabla_{\mathbf x_t}\log L_t^{\mathrm{sc}}(\mathbf x_t)=-\frac{1}{\sqrt{\alpha_t}\sigma_d^2}\mathbf A^\top\left(\mathbf A\frac{\mathbf x_t}{\sqrt{\alpha_t}}-\mathbf y\right). \tag{3.9}
$$

该近似在数据端点处成为干净似然，但在有限扩散尺度它仍只是条件平均的替代。

在 $\mathbf z$ 坐标中，基线替代后验为

$$
\bar\pi_\lambda^{\mathrm{sc}}(\mathbf z\mid\mathbf y)\propto\pi_\lambda(\mathbf z)\exp\left[-\frac{\|\mathbf A\mathbf z-\mathbf y\|^2}{2\sigma_d^2}\right]. \tag{3.10}
$$

式 (3.10) 揭示干净坐标表述的简单先验平滑结构：物理似然与数据端点处相同，所有扩散尺度依赖性都局限在 $\pi_\lambda=P_{q_\lambda}p_0$，即高斯平滑后的先验密度。相关的先验侧平滑思想出现在近端优化与近端 MCMC 中：那里可能非光滑的先验能量通过其 Moreau–Yosida 包络与相应近端算子被正则化 [32, 33]。这种类比是结构性的而非精确的：近端方法对先验能量作 Moreau 平滑，而扩散对先验密度作高斯平滑。$\mathbf z$ 坐标通过去掉扩散状态的确定性衰减，把基线替代写成固定的物理似然乘以多尺度、高斯平滑的先验，从而使这种分离显式。

**针对残余不确定性的似然延拓。** 因此 (3.10) 中的基线替代已包含先验侧平滑路径。下面引入的似然延拓服务于不同目的：它计入在当前扩散状态条件下干净图像的残余不确定性。远离端点时，$\mathbf Z_\lambda=\mathbf X_0+\tau_\lambda\boldsymbol\varepsilon$ 在 $\mathbf X_0$ 附近仍不确定，因此在 $\mathbf Z_\lambda$ 处直接评估端点似然可能过度自信。因此我们保留被丢弃扩散扰动的主协方差近似。这促使如下有效协方差

$$
\boldsymbol\Gamma_\lambda:=\sigma_d^2\mathbf I+\eta_\lambda\mathbf A\mathbf A^\top,\qquad \eta_\lambda\ge0,\quad \eta_\lambda\to0\ (\lambda\to\infty). \tag{3.11}
$$

我们称 $\eta_\lambda$ 为**似然延拓计划**。名义选择 $\eta_\lambda=q_\lambda$ 匹配投影各向同性扰动的协方差。该协方差修正仍是受控替代，而非精确的状态相关条件似然。更一般地，似然延拓计入 $\mathbf Z_\lambda$ 中残留的扩散尺度不确定性，并随先验从粗扩散尺度移向细尺度而逐步引入测量信息。当 $\eta_\lambda\to0$ 时恢复原似然。定义

$$
L_\lambda(\mathbf z):=\exp\left[-\frac12(\mathbf A\mathbf z-\mathbf y)^\top\boldsymbol\Gamma_\lambda^{-1}(\mathbf A\mathbf z-\mathbf y)\right] \tag{3.12}
$$

与扩散尺度 $\lambda$ 处的归一化替代后验

$$
\bar\pi_\lambda(\mathbf z\mid\mathbf y):=\frac{1}{Z_\lambda}\pi_\lambda(\mathbf z)L_\lambda(\mathbf z),\qquad Z_\lambda:=\int\pi_\lambda(\mathbf z)L_\lambda(\mathbf z)\,\mathrm d\mathbf z. \tag{3.13}
$$

其得分为

$$
\bar{\mathbf s}_\lambda(\mathbf z;\mathbf y)=\mathbf s_\lambda^{\mathrm{pr}}(\mathbf z)+\mathbf s_\lambda^{\mathrm{lik}}(\mathbf z)=\nabla\log\pi_\lambda(\mathbf z)-\mathbf H_\lambda\mathbf z+\mathbf b_\lambda, \tag{3.14}
$$

其中

$$
\mathbf H_\lambda:=\mathbf A^\top\boldsymbol\Gamma_\lambda^{-1}\mathbf A,\qquad \mathbf b_\lambda:=\mathbf A^\top\boldsymbol\Gamma_\lambda^{-1}\mathbf y. \tag{3.15}
$$

令 $t=t(\lambda)$ 表示逆对数信噪比参数化，并记 $\alpha_\lambda:=\alpha_{t(\lambda)}$。我们用 $\hat{\boldsymbol\varepsilon}_\theta(\cdot,\lambda)$ 作为在相应扩散时间标签 $t(\lambda)$ 处评估的预训练网络的简写。实践中

$$
\mathbf s_{\theta,\lambda}^{\mathrm{pr}}(\mathbf z):=-e_\lambda\hat{\boldsymbol\varepsilon}_\theta\left(\sqrt{\alpha_\lambda}\mathbf z,\lambda\right) \tag{3.16}
$$

近似 $\nabla\log\pi_\lambda(\mathbf z)$。

似然延拓只有在扩散噪声消失时回到期望的贝叶斯模型才有用。下一命题分别对密度与得分验证该端点性质。这一区分很重要：密度收敛确定极限律，而仅得分收敛不足以保证归一化概率测度收敛。

**命题 3.3（端点与得分一致性）。** 假设 $p_0$ 绝对连续且具有 $L^1(\mathbb R^d)$ 概率密度，$\sigma_d>0$。若 $\eta_\lambda\to0$，则

$$
\left\|\bar\pi_\lambda(\cdot\mid\mathbf y)-p(\cdot\mid\mathbf y)\right\|_{\mathrm{TV}}\to0. \tag{3.17}
$$

若进一步 $p_0$ 严格正且 $C^1$，且 $\nabla\log(P_{q_\lambda}p_0)\to\nabla\log p_0$ 局部一致，则 $\bar{\mathbf s}_\lambda(\cdot;\mathbf y)$ 局部一致收敛到干净后验得分 $\nabla\log p_0(\mathbf z)-\sigma_d^{-2}\mathbf A^\top(\mathbf A\mathbf z-\mathbf y)$。

$L^1$ 密度假设对全变差收敛是本质的。若端点先验奇异，高斯软化仍弱收敛但未必全变差收敛。命题 3.3 的证明见 B 节。因此替代后验路径有正确端点，但这一陈述本身并未说明某个动力学能否跟踪它。

**输运缺陷与后验动力学。** 剩余问题来自替代的构造方式。(3.5) 的精确后验路径是联合端点密度的高斯平滑，因而满足反向热方程；相反，(3.13) 把平滑先验与单独延拓的似然相乘。该乘积端点正确，但未必遵循同一输运方程。因此把 $\bar{\mathbf s}_\lambda$ 直接代入概率流漂移一般不会产生边缘 $\bar\pi_\lambda$。在决定需要多少修正之前，我们先量化这一连续时间失配。

**定义 3.4（输运缺陷）。** 对正的光滑替代后验路径 $\{\bar\pi_\lambda\}$，定义

$$
r_\lambda(\mathbf z):=\frac{\partial_\lambda\bar\pi_\lambda(\mathbf z)+q_\lambda\Delta\bar\pi_\lambda(\mathbf z)}{\bar\pi_\lambda(\mathbf z)}=\partial_\lambda\log\bar\pi_\lambda(\mathbf z)+q_\lambda\left(\Delta\log\bar\pi_\lambda(\mathbf z)+\|\bar{\mathbf s}_\lambda(\mathbf z)\|^2\right). \tag{3.18}
$$

输运缺陷度量替代后验路径与继承自扩散先验的基础多尺度输运之间的失配。事实上基础输运速度为 $\mathbf v_\lambda(\mathbf z)=q_\lambda\nabla\log\bar\pi_\lambda(\mathbf z)$，而 (3.18) 等价于

$$
r_\lambda\bar\pi_\lambda=\partial_\lambda\bar\pi_\lambda+\nabla\cdot(\bar\pi_\lambda\mathbf v_\lambda). \tag{3.19}
$$

因此 $r_\lambda$ 是归一化 Fokker–Planck 或连续性方程残差。它是带符号的局部源项，而非非负范数。在足够衰减下

$$
\int r_\lambda\,\mathrm d\bar\pi_\lambda=0. \tag{3.20}
$$

正负值分别描述给定替代后验在哪里比基础多尺度输运所能提供更快地获得或失去质量。

对可观测 $F$，用 $\mathcal C_{\bar\pi_\lambda}[F]:=F-\mathbb E_{\bar\pi_\lambda}[F]$ 定义其中心化版本。下列恒等式直接适用于名义与实际延拓计划。

**命题 3.5（可微似然延拓下的输运缺陷）。** 假设 $\eta_\lambda$ 可微，且所需微分与分部积分运算合理。则

$$
r_\lambda=2q_\lambda\,\mathcal C_{\bar\pi_\lambda}\left[\mathbf s_\lambda^{\mathrm{pr}}\cdot\mathbf s_\lambda^{\mathrm{lik}}\right]+\left(q_\lambda+\frac12\dot\eta_\lambda\right)\mathcal C_{\bar\pi_\lambda}\left[\left\|\mathbf s_\lambda^{\mathrm{lik}}\right\|^2\right]. \tag{3.21}
$$

特别地，$\eta_\lambda=q_\lambda$ 蕴含 $\dot\eta_\lambda=-2q_\lambda$，故第二项消失。

证明见 C 节。第一项是热流不保持乘积而产生的先验–似然交互项。第二项记录似然延拓时钟与名义方差 $q_\lambda$ 之间的失配。对实际计划 $\eta_\lambda=q_\lambda^2/(q_\lambda+\tau_c^2)$，

$$
q_\lambda+\frac12\dot\eta_\lambda=\frac{q_\lambda\tau_c^4}{(q_\lambda+\tau_c^2)^2}, \tag{3.22}
$$

因此延拓在名义先验–似然缺陷之上显式增加了似然自交互项。

输运缺陷解释了为何仅用基础多尺度输运对替代后验路径可能脆弱。因此我们保留该输运，并在每个 $\lambda$ 处加入 Langevin 分量。扩散尺度冻结时该分量保持 $\bar\pi_\lambda$；后验路径移动时，它提供跟踪估计中的耗散机制，并允许探索后验模糊性。这种耗散是否主导输运缺陷取决于下文泛函不等式与缺陷控制条件。令 $a_\lambda\ge0$ 表示 Langevin 强度。连续替代模型为

$$
\mathrm d\mathbf Z_\lambda=(q_\lambda+a_\lambda)\bar{\mathbf s}_\lambda(\mathbf Z_\lambda;\mathbf y)\,\mathrm d\lambda+\sqrt{2a_\lambda}\,\mathrm d\mathbf W_\lambda. \tag{3.23}
$$

它可代数分解为

$$
\mathrm d\mathbf Z_\lambda=\underbrace{q_\lambda\bar{\mathbf s}_\lambda(\mathbf Z_\lambda;\mathbf y)\,\mathrm d\lambda}_{\text{基础多尺度输运}}+\underbrace{\left[a_\lambda\bar{\mathbf s}_\lambda(\mathbf Z_\lambda;\mathbf y)\,\mathrm d\lambda+\sqrt{2a_\lambda}\,\mathrm d\mathbf W_\lambda\right]}_{\text{Langevin 分量}}. \tag{3.24}
$$

当 $\lambda$ 冻结时第二括号以 $\bar\pi_\lambda$ 为不变律。因此基础多尺度输运推进扩散尺度，而 Langevin 分量支持跟踪与探索。增大 $a_\lambda$ 同时增强两种效应，而替代目标 $\bar\pi_\lambda$ 的定义本身保持不变。

连续模型现已完全指定。其收敛需要两个不同事实。第一，替代后验必须趋近干净后验，这已由命题 3.3 建立。第二，采样器律必须在存在缺陷 $r_\lambda$ 的情况下跟踪移动替代后验。为处理后者，令 $\mu_\lambda$ 表示 (3.23) 的律，并定义

$$
\mathrm H(\lambda):=\mathrm{KL}(\mu_\lambda\|\bar\pi_\lambda),\qquad \mathrm I(\mu_\lambda\|\bar\pi_\lambda):=\int\left\|\nabla\log(\mu_\lambda/\bar\pi_\lambda)\right\|^2\mathrm d\mu_\lambda. \tag{3.25}
$$

下一定理表明 Langevin 分量产生相对 Fisher 信息耗散，而输运缺陷是替代后验路径运动产生的强迫项。把该跟踪估计与端点一致性结合，在所述条件下得到后验收敛。

**定理 3.6（熵恒等式与有限时域后验跟踪）。** 假设系数、替代后验路径与采样器密度对 SDE、Fokker–Planck 方程、积分号下微分以及下文分部积分足够正则。则

$$
\mathrm H'(\lambda)=-a_\lambda\mathrm I(\mu_\lambda\|\bar\pi_\lambda)-\int r_\lambda\,\mathrm d\mu_\lambda. \tag{3.26}
$$

进一步假设对每个 $\lambda$，$\bar\pi_\lambda$ 满足对数 Sobolev 不等式

$$
\mathrm{Ent}_{\bar\pi_\lambda}(f^2)\le\frac{2}{\rho_\lambda}\int\|\nabla f\|^2\,\mathrm d\bar\pi_\lambda,\qquad \rho_\lambda>0, \tag{3.27}
$$

且对演化中遇到的每个相对熵有限的律 $\nu$，

$$
-\int r_\lambda\,\mathrm d\nu\le c_\lambda\,\mathrm{KL}(\nu\|\bar\pi_\lambda)+\varepsilon_\lambda,\qquad c_\lambda,\varepsilon_\lambda\ge0. \tag{3.28}
$$

在固定区间 $[\lambda_0,\Lambda]$ 上，令

$$
k_\lambda:=2a_\lambda\rho_\lambda-c_\lambda. \tag{3.29}
$$

若 $\mathrm H(\lambda_0)<\infty$，则对每个 $\lambda\le\Lambda$，

$$
\mathrm H(\lambda)\le e^{-\int_{\lambda_0}^\lambda k_u\,\mathrm du}\mathrm H(\lambda_0)+\int_{\lambda_0}^\lambda e^{-\int_s^\lambda k_u\,\mathrm du}\varepsilon_s\,\mathrm ds. \tag{3.30}
$$

证明见 D 节。(3.30) 的第一项传播实际高噪声初始化与初始替代后验之间的失配；第二项累积 Langevin 耗散后的输运缺陷强迫。对数 Sobolev 与熵变分工具是标准的 [2, 16]。特别地，当对某 $\theta_\lambda>0$ 有

$$
c_\lambda=\theta_\lambda^{-1},\qquad \varepsilon_\lambda=\theta_\lambda^{-1}\log\int e^{-\theta_\lambda r_\lambda}\,\mathrm d\bar\pi_\lambda<\infty \tag{3.31}
$$

时，熵变分不等式验证 (3.28)。与命题 3.3 结合，只要 $\int_{\lambda_0}^\infty k_u\,\mathrm du=\infty$ 且 (3.30) 中加权缺陷项消失，有限时域估计就给出 $\|\mu_\lambda-p(\cdot\mid\mathbf y)\|_{\mathrm{TV}}\to0$。

### 3.3 PD-IMEX 离散化

PD-IMEX 在扩散尺度网格上离散替代后验动力学。在每个扩散尺度，非线性先验预测评估一次，线性似然漂移隐式处理，Langevin 新息在数据一致性求解之后加入。利用得分分解 (3.14)，连续动力学 (3.23) 可写为

$$
\mathrm d\mathbf Z_\lambda=(q_\lambda+a_\lambda)\left[\mathbf s_\lambda^{\mathrm{pr}}(\mathbf Z_\lambda)-\mathbf H_\lambda\mathbf Z_\lambda+\mathbf b_\lambda\right]\mathrm d\lambda+\sqrt{2a_\lambda}\,\mathrm d\mathbf W_\lambda. \tag{3.32}
$$

先验得分非线性且由网络提供，而似然漂移是线性的，其系数 $\mathbf H_\lambda,\mathbf b_\lambda$ 由似然延拓协方差 $\boldsymbol\Gamma_\lambda$ 决定。全隐式处理需要重复网络评估，而显式似然步在 $\mathbf H_\lambda$ 刚性时可能不稳定。这种结构促使采用隐–显式（IMEX）步：评估网络一次，隐式处理线性似然。

令

$$
\lambda_0<\lambda_1<\cdots<\lambda_K,\qquad h_k:=\lambda_{k+1}-\lambda_k, \tag{3.33}
$$

并记 $q_k:=q_{\lambda_k}$、$\tau_k:=\tau_{\lambda_k}$。由 Tweedie 恒等式，$\mathbb E[\mathbf X_0\mid\mathbf Z_\lambda=\mathbf z]=\mathbf z+q_\lambda\mathbf s_\lambda^{\mathrm{pr}}(\mathbf z)$。因此噪声预测网络也给出干净预测

$$
\hat{\boldsymbol\varepsilon}_k:=\hat{\boldsymbol\varepsilon}_\theta\left(\sqrt{\alpha_{\lambda_k}}\mathbf z_k,\lambda_k\right),\qquad \hat{\mathbf x}_{0,k}:=\mathbf z_k-\tau_k\hat{\boldsymbol\varepsilon}_k. \tag{3.34}
$$

尽管在 $\lambda_k$ 处得分、噪声与干净预测代数等价，其冻结方案的数值行为不同。直接干净数据预测在高维像素空间中仍有效，而含噪量预测会退化 [27]。此外，近期误差分析表明后验均值冻结允许由度量熵维数控制的离散化界，而得分冻结保留环境维数依赖 [31]。因此我们冻结干净预测，保留已知高斯状态依赖不冻结：

$$
\mathbf s_\lambda^{\mathrm{pr}}(\mathbf z)\approx\frac{\hat{\mathbf x}_{0,k}-\mathbf z}{q_\lambda}. \tag{3.35}
$$

令 $\chi_\lambda:=q_\lambda+a_\lambda$、$\kappa_\lambda:=\chi_\lambda/q_\lambda$。在 $[\lambda_k,\lambda_{k+1}]$ 上把 (3.35) 代入动力学 (3.32) 得

$$
\mathrm d\mathbf Z_\lambda=\left[\kappa_\lambda(\hat{\mathbf x}_{0,k}-\mathbf Z_\lambda)-\chi_\lambda\mathbf H_\lambda\mathbf Z_\lambda+\chi_\lambda\mathbf b_\lambda\right]\mathrm d\lambda+\sqrt{2a_\lambda}\,\mathrm d\mathbf W_\lambda. \tag{3.36}
$$

式 (3.36) 通过 (3.11)–(3.15) 保留 $\mathbf H_\lambda,\mathbf b_\lambda$ 的延拓依赖。

我们精确积分 (3.36) 的均值回复先验部分，在右端点冻结似然系数，并只对该线性似然项应用后向 Euler。所需步系数为

$$
\varrho_k:=\exp\left(-\int_{\lambda_k}^{\lambda_{k+1}}\kappa_s\,\mathrm ds\right), \tag{3.37}
$$

$$
\Omega_k:=\int_{\lambda_k}^{\lambda_{k+1}}\chi_s\,\mathrm ds,\qquad V_k:=2\int_{\lambda_k}^{\lambda_{k+1}}a_s\exp\left(-2\int_s^{\lambda_{k+1}}\kappa_u\,\mathrm du\right)\mathrm ds. \tag{3.38}
$$

这里 $\varrho_k$ 是冻结均值回复分量的精确均值收缩，$\Omega_k$ 是累积似然权重，$V_k$ 是 Langevin 扩散产生的条件方差。记 $\mathbf H_{k+1}:=\mathbf H_{\lambda_{k+1}}$、$\mathbf b_{k+1}:=\mathbf b_{\lambda_{k+1}}$，PD-IMEX 步为

$$
\left(\mathbf I+\Omega_k\mathbf H_{k+1}\right)\mathbf z_{k+1}^{\mathrm{det}}=\hat{\mathbf x}_{0,k}+\varrho_k(\mathbf z_k-\hat{\mathbf x}_{0,k})+\Omega_k\mathbf b_{k+1}, \tag{3.39a}
$$

$$
\mathbf z_{k+1}=\mathbf z_{k+1}^{\mathrm{det}}+\sqrt{V_k}\,\boldsymbol\xi_k,\qquad \boldsymbol\xi_k\sim\mathcal N(\mathbf 0,\mathbf I). \tag{3.39b}
$$

> **算法 3.1　PD-IMEX 后验采样器**
> **Require：** 测量 $\mathbf y$、算子 $\mathbf A$、测量噪声水平 $\sigma_d$、得分网络 $\hat{\boldsymbol\varepsilon}_\theta$、网格 $\{\lambda_k\}_{k=0}^K$、似然延拓计划 $\eta_\lambda$、Langevin 强度计划 $a_\lambda$
> **Ensure：** 近似后验样本 $\mathbf z_K$
> 1: 抽取 $\mathbf x_{\lambda_0}\sim\mathcal N(\mathbf 0,\mathbf I)$ 并转换到干净坐标：$\mathbf z_0\leftarrow\mathbf x_{\lambda_0}/\sqrt{\alpha_{\lambda_0}}$
> 2: **for** $k=0,\dots,K-1$ **do**
> 3: 　由 (3.11) 与 (3.15) 构造 $\boldsymbol\Gamma_{\lambda_{k+1}}$、$\mathbf H_{k+1}$、$\mathbf b_{k+1}$
> 4: 　由 (3.34) 评估 $\hat{\boldsymbol\varepsilon}_k$ 与 $\hat{\mathbf x}_{0,k}$
> 5: 　由 (3.37)–(3.38) 计算 $\varrho_k$、$\Omega_k$、$V_k$
> 6: 　求解 (3.39) 中的确定性 IMEX 方程得 $\mathbf z_{k+1}^{\mathrm{det}}$
> 7: 　抽取 $\boldsymbol\xi_k\sim\mathcal N(\mathbf 0,\mathbf I)$ 并置 $\mathbf z_{k+1}\leftarrow\mathbf z_{k+1}^{\mathrm{det}}+\sqrt{V_k}\boldsymbol\xi_k$
> 8: **end for**
> 9: Return $\mathbf z_K$

(3.39) 中的隐式求解稳定确定性似然漂移。高斯项 $\sqrt{V_k}\boldsymbol\xi_k$ 是经冻结先验均值回复子流积分后的 Langevin 新息。在似然求解之后加入它，可避免被似然预解式额外滤波。刚性随机积分器的经典分析指出：当欠分辨的松弛被 $L$ 稳定隐式更新处理时，会出现同样的涨落损失 [26]。若把新息放入后向 Euler 求解内部，曲率为 $\nu$ 的似然本征模态将只保留其新息方差的 $(1+\Omega_k\nu)^{-2}$。这种求解后排序保留了更新所规定的新息协方差，而下一命题建立与连续后验动力学的一阶一致性；它并不声称精确积分完整的刚性冻结协方差。

**命题 3.7（求解后 Langevin 新息与局部一致性）。** 假设 $\mathbf H_{k+1}$ 对称半正定，令 $\mathbf R_k=(\mathbf I+\Omega_k\mathbf H_{k+1})^{-1}$。条件于 $\mathbf z_k$，求解后更新 (3.39) 具有协方差 $V_k\mathbf I$。若把同一 Langevin 新息放入隐式似然求解内部，其协方差为 $V_k\mathbf R_k^2$；因此求解后放置避免了似然预解式的人为阻尼。

若 $a_\lambda$、$q_\lambda$ 与系数在固定有限区间上 $C^1$，则当 $h_k\to0$ 时

$$
\varrho_k=1-\kappa_{\lambda_k}h_k+O(h_k^2),\quad\Omega_k=\chi_{\lambda_k}h_k+O(h_k^2),\quad V_k=2a_{\lambda_k}h_k+O(h_k^2). \tag{3.40}
$$

因此当 $\hat{\mathbf x}_{0,k}=\mathbf z_k+q_k\mathbf s_{\lambda_k}^{\mathrm{pr}}(\mathbf z_k)$ 时，(3.39) 的条件均值与协方差一阶匹配 (3.23) 的对应量。

证明见 E 节。该陈述针对所选更新分解的新息协方差，并不声称精确积分完整的刚性冻结协方差。一阶展开固定有限区间及其系数，因此在 $\Omega_k\|\mathbf H_{k+1}\|$ 于细化下保持一阶的刚性极限下并非一致。

在确立求解后 Langevin 新息的保留与局部一致性之后，我们接下来在精确得分设定下量化相对连续采样器的全局弱误差。令 $Q_k$ 表示 (3.23) 从 $\lambda_k$ 到 $\lambda_{k+1}$ 的精确转移，$\hat Q_k$ 表示 (3.39) 使用 (3.14) 替代后验得分的一步核。

**定理 3.8（PD-IMEX 的一阶弱误差）。** 固定 $\Lambda>\lambda_0$，令 $\lambda_K=\Lambda$。假设 PD-IMEX 使用精确先验得分，即 $\hat{\mathbf x}_{0,k}=\mathbf z_k+q_k\mathbf s_{\lambda_k}^{\mathrm{pr}}(\mathbf z_k)$，并记 $\mathbf B_\lambda(\mathbf z)=(q_\lambda+a_\lambda)\bar{\mathbf s}_\lambda(\mathbf z;\mathbf y)$。假设在 $[\lambda_0,\Lambda]$ 上 $\mathbf B_\lambda$、$a_\lambda$、$\mathbf H_\lambda$、$\mathbf b_\lambda$ 关于 $\lambda$ 为 $C^1$，且 $\mathbf B_\lambda$ 到四阶的空间导数具有关于 $\lambda$ 一致的多项式增长。还假设精确过程与数值链不爆炸并满足下文使用的多项式矩界，且在有限区间与足够细网格上一致。对测试函数 $\phi\in C_b^4(\mathbb R^d)$，假设相应后向 Kolmogorov 解到四阶的空间导数在 $[\lambda_0,\Lambda]$ 上具有一致多项式增长界。两个过程从同一律初始化，令

$$
h:=\max_{0\le k<K}h_k.
$$

则存在与网格无关的常数 $C_{\phi,\Lambda}$，使

$$
\left|\mathbb E\phi(\mathbf z_K^{\mathrm{alg}})-\int\phi\,\mathrm d\mu_\Lambda\right|\le C_{\phi,\Lambda}h. \tag{3.41}
$$

这些是有限时域弱近似假设。显式陈述所需后向正则性，避免对端点先验施加比论证所需更强的全局条件。

E 节证明建立局部展开

$$
\hat Q_kf(\mathbf z)=f(\mathbf z)+h_k\mathcal L_{\lambda_k}f(\mathbf z)+O\left((1+\|\mathbf z\|^m)h_k^2\right), \tag{3.42}
$$

其中

$$
\mathcal L_\lambda f=(q_\lambda+a_\lambda)\bar{\mathbf s}_\lambda(\cdot;\mathbf y)\cdot\nabla f+a_\lambda\Delta f. \tag{3.43}
$$

精确转移具有相同一阶展开。随后以后向 Kolmogorov 正则性作望远镜求和即得全局结果。

把有限时域弱误差与连续跟踪、端点一致性结合，得到 oracle 得分链的如下分解。

**推论 3.9（oracle 得分 PD-IMEX 的有限时域弱误差分解）。** 在定理 3.6 与 3.8 的假设下，对每个 $\phi\in C_b^4(\mathbb R^d)$，

$$
\left|\mathbb E\phi(\mathbf z_K^{\mathrm{alg}})-\int\phi\,\mathrm dp(\cdot\mid\mathbf y)\right|\le C_{\phi,\lambda_K}h+2\|\phi\|_\infty\sqrt{\frac12\mathrm H(\lambda_K)}+2\|\phi\|_\infty\left\|\bar\pi_{\lambda_K}-p(\cdot\mid\mathbf y)\right\|_{\mathrm{TV}}. \tag{3.44}
$$

(3.44) 中三项分别为时间离散化误差、采样器到替代后验的跟踪误差、替代端点误差。

## 4. 实验

实验评估框架的三个层面：由多尺度扩散先验构造替代后验路径、Langevin 强度在跟踪与探索中的作用，以及动力学的数值实现。

### 4.1 实验协议

我们在 Flickr-Faces-HQ（FFHQ）$256\times256$ 的 100 张图像 [21] 与 ImageNet $256\times256$ 的 100 张图像 [36] 上评估。对 FFHQ 使用 DPS [10] 的预训练先验；对 ImageNet 使用 Dhariwal 与 Nichol [13] 的无条件先验。考虑双三次 $\times4$ 超分辨率、标准差 3.0 的 $61\times61$ 核高斯去模糊，以及强度 0.5 的 $61\times61$ 核运动去模糊。每个主任务加入 $\sigma_d=0.05$ 的独立高斯测量噪声。我们报告峰值信噪比（PSNR）、结构相似性指数（SSIM）与学习感知图像块相似度（LPIPS）[47]。

我们把每次得分网络调用计为一次网络函数评估（NFE）。所报告的 100-NFE 输出使用 99 次 PD-IMEX 转移，随后一次终端去噪评估作为有限噪声重建读出。端点为最粗与最细训练扩散尺度，$\lambda_0=-5.05884$、$\lambda_K=4.60512$，网格在对数信噪比上均匀，四舍五入到最近的不同训练索引。我们把 Langevin 强度参数化为 $a_\lambda=\zeta q_\lambda$，其中 $\zeta$ 是相对 Langevin 强度。似然协方差为

$$
\boldsymbol\Gamma(\tau)=\sigma_d^2\mathbf I+\eta(\tau)\mathbf A\mathbf A^\top,\qquad \eta(\tau)=\frac{\tau^4}{\tau^2+\tau_c^2},\quad \tau_c=6. \tag{4.1}
$$

该选择遵循 (3.11) 的不确定性解释。由于 $\mathbf z=\mathbf X_0+\tau\boldsymbol\varepsilon$，经 $\mathbf A$ 观测到的扰动协方差为 $\tau^2\mathbf A\mathbf A^\top$，给出名义似然协方差 $\sigma_d^2\mathbf I+\tau^2\mathbf A\mathbf A^\top$。我们用平滑门 $\eta(\tau)/\tau^2=\tau^2/(\tau^2+\tau_c^2)$ 对它调温。因此 $\eta(\tau)\sim\tau^2$ 在粗扩散尺度（应保留投影扩散不确定性），而 $\eta(\tau)\sim\tau^4/\tau_c^2$ 在端点附近（延拓更快移除以暴露原似然）。交叉点满足 $\eta(\tau_c)=\tau_c^2/2$。所有主任务固定 $\tau_c=6$；所得计划为正、光滑且端点一致。FFHQ 用 $\zeta=0.1$，ImageNet 用 $\zeta=0.01$。MGPS 与 DAPS 在每个外层水平内使用多次得分调用，因此同时报告层数与实际 NFE。

每次似然求解都是非迭代的。去模糊用二维 FFT 对角化，双三次超分辨率使用可分离退化的显式奇异向量基，修复使用对角闭式。受控消融共享相同图像、测量噪声实现、算子种子与后验采样种子。

> **表 1（原文 Table 1）：** $\sigma_d=0.05$、每个数据集 100 张图像平均的重建结果。计算代价报告为外层水平数/实际得分网络评估数。PSNR 与 SSIM 越高、LPIPS 越低越好。

| 方法 | 水平/NFE | 高斯去模糊 PSNR | SSIM | LPIPS | 运动去模糊 PSNR | SSIM | LPIPS | 超分辨率（×4）PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|
| **FFHQ** | | | | | | | | | | |
| DPS [10] | 1000/1000 | 25.41 | .708 | .144 | 23.69 | .658 | .178 | 24.21 | .673 | .194 |
| DiffPIR [49] | 100/100 | 28.24 | .774 | .184 | 27.09 | .704 | .194 | 27.67 | .772 | .118 |
| DDRM [23] | 100/100 | 29.12 | .837 | **.132** | 29.23 | .846 | **.089** | 29.30 | .843 | .141 |
| RED-Diff [29] | 100/100 | 28.46 | .705 | .242 | 26.62 | .768 | .235 | 27.72 | .715 | .361 |
| MGPS [30] | 100/814 | 27.88 | .792 | .149 | 26.82 | .769 | .147 | 27.55 | .783 | **.115** |
| DAPS [48] | 100/500 | 28.71 | .792 | .155 | 28.39 | .795 | .142 | 28.66 | .764 | .142 |
| 本文（PD-IMEX） | 100/100 | **29.52** | **.847** | .208 | **30.57** | **.869** | .139 | **29.49** | **.847** | .201 |
| **ImageNet** | | | | | | | | | | |
| DPS [10] | 1000/1000 | 21.81 | .526 | .314 | 21.15 | .503 | .352 | 21.58 | .507 | .404 |
| DiffPIR [49] | 100/100 | 24.18 | .597 | .493 | 23.16 | .514 | .422 | 23.71 | .577 | .338 |
| DDRM [23] | 100/100 | 25.59 | .714 | .336 | **26.61** | .761 | .189 | 25.64 | .720 | .321 |
| RED-Diff [29] | 100/100 | 24.52 | .661 | .491 | 23.76 | .635 | .429 | 24.46 | .609 | .537 |
| MGPS [30] | 100/674 | 24.68 | .657 | .397 | 24.14 | .642 | .352 | 24.77 | .667 | **.305** |
| DAPS [48] | 100/500 | 24.98 | .661 | .349 | 25.33 | .685 | .303 | 25.08 | .669 | .319 |
| 本文（PD-IMEX） | 100/100 | **25.62** | **.716** | .399 | **27.59** | **.779** | **.197** | **25.35** | **.712** | .390 |

> **图 1（原文 Fig. 1）：** 表 1 中各方法的代表性 FFHQ 重建。每行各列共享同一测量。

在 100 次得分网络评估下，PD-IMEX 在比较中给出最强的总体失真性能，并在感知质量上保持竞争力，在若干任务上呈现预期的保真–感知折中。它在十二项 PSNR 与 SSIM 比较中十项排名第一、其余两项第二，包括与使用五到十倍得分评估的方法相比。DDRM 与 MGPS 在若干任务上保持更低 LPIPS，而 PD-IMEX 在两个数据集的运动去模糊 LPIPS 上均列第二。

### 4.2 多尺度后验构造的消融

我们首先检验测量模型如何与多尺度扩散先验耦合。朴素基线施加时间无关的似然引导，第二配置通过尺度一致修正似然中心，完整配置进一步延拓其协方差。其他所有随机与数值设置固定。朴素乘子对每个任务单独调优，FFHQ 上 $\gamma^\star=1$，ImageNet 上 $\gamma^\star=0.3$。

> **表 2（原文 Table 2）：** 固定 100-NFE 预算下、100 张图像上的多尺度后验构造消融。朴素基线使用其最佳时间无关标量乘子。第二配置把似然中心与干净图像坐标对齐，第三配置进一步延拓其协方差以计入残余扩散不确定性。所有 Langevin 与数值设置固定。

| 配置 | FFHQ 高斯去模糊 PSNR | SSIM | LPIPS | ImageNet 运动去模糊 PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|
| 朴素引导（最佳标量） | 19.228 | .67088 | .33503 | 23.799 | .70211 | .34586 |
| 尺度一致似然 | 29.502 | .84730 | .20597 | 24.729 | .56936 | .20600 |
| 尺度一致 + 延拓 | 29.523 | .84723 | .20753 | 27.585 | .77864 | .19684 |

表 2 把替代似然的两个分量分开。尺度一致通过去掉扩散状态的确定性衰减来修正其中心。标量引导权重可在某些任务上补偿部分中心失配，但不能一致地替代这种尺度相关的对齐。似然延拓随后改变有效协方差，计入粗尺度上的残余扩散不确定性。其效果在 FFHQ 高斯去模糊上较小，但在 ImageNet 运动去模糊上显著。

### 4.3 Langevin 强度：跟踪与探索

> **图 2（原文 Fig. 2）：** 相对 Langevin 强度 $\zeta$ 对两个含噪去模糊任务重建保真度与感知质量的影响。每个面板左轴为 PSNR、右轴为 LPIPS（100 张图像）。只改变 $\zeta$；延拓、数值网格、得分网络、测量与随机种子固定。竖直虚线标出表 1 中所用取值。

图 2 表明相对 Langevin 强度的实际效果非单调且依赖任务。在 FFHQ 高斯去模糊上，中等取值改善失真精度，而更大取值可以以 PSNR 为代价改善 LPIPS。ImageNet 运动去模糊偏好更小取值，过大会同时降低两项指标。因此 $\zeta$ 控制的是有限步跟踪–探索折中，而非普遍有益的 Langevin 强度选择。

> **图 3（原文 Fig. 3）：** 相对 Langevin 强度对中心框修复样本多样性的影响。两行分别用 $\zeta=0$ 与 $\zeta=24$，五个中间列使用独立采样种子，测量与算子固定。

图 3 用多模态修复示例补充聚合指标。在 $\zeta=0$ 时，有限步确定性实现把不同初始化收缩到相似、相对平滑的补全。相反，所选较大取值产生连贯但明显不同的面部补全，说明相对 Langevin 强度如何控制欠定问题中的样本变异性。

### 4.4 数值实现：粗网格稳定性与新息放置

**粗网格稳定性。** 我们接下来通过细化对数信噪比网格检验 PD-IMEX 的两个数值选择。显式与隐式变体具有相同替代后验路径与 Langevin 强度计划，只在处理线性似然漂移上不同。

显式更新在 100-NFE 网格上不可用：它在所有 FFHQ 图像上数值失败，在 ImageNet 上仅达 5.43 dB PSNR、.1344 SSIM 与 .9360 LPIPS。细化恢复了与隐式更新相同的极限行为，但速率依算子而异。在 FFHQ 上显式方法在 200 NFE 时仍不够准确，到 500 NFE 时在全部三项指标上与隐式方法一致；在 ImageNet 上它在 200 NFE 时仍未分辨，到 500 NFE 才恢复。同一细化中，最大稳定性指标 $\max_k\Omega_k\lambda_{\max}(\mathbf H_{k+1})$ 在 FFHQ 上从 7.30 降到 500 NFE 的 1.06、再降到 1000 NFE 的 .50；ImageNet 上对应值为 6.70、.97 与 .46。隐式更新全程稳定。因此隐式处理使同一后验动力学在显著更粗的网格上跟随，从而需要更少得分评估。

> **表 3（原文 Table 3）：** 显式与隐式似然更新的 NFE 细化。条目为 100 张图像上的平均 PSNR、SSIM 与 LPIPS。每个 NFE 内两种更新中较优者加粗；fail 表示全部 100 张图像上数值失败。所有配置使用相同替代后验路径、Langevin 强度计划、得分网络、图像、测量与随机种子；只有对数信噪比网格与线性似然漂移的处理不同。

| 任务 | NFE | 显式 PSNR | SSIM | LPIPS | 隐式 PSNR | SSIM | LPIPS |
|---|---|---|---|---|---|---|---|
| FFHQ 高斯去模糊 | 100 | fail | | | **29.523** | **.8472** | **.2075** |
| FFHQ 高斯去模糊 | 200 | 28.698 | .7891 | .2311 | **29.505** | **.8470** | **.2066** |
| FFHQ 高斯去模糊 | 500 | **29.499** | **.8472** | **.2058** | 29.489 | .8469 | .2064 |
| FFHQ 高斯去模糊 | 1000 | **29.494** | **.8470** | **.2063** | 29.486 | .8468 | .2066 |
| ImageNet 运动去模糊 | 100 | 5.434 | .1344 | .9360 | **27.585** | **.7786** | **.1968** |
| ImageNet 运动去模糊 | 200 | 18.342 | .2843 | .5728 | **27.643** | **.7841** | **.2217** |
| ImageNet 运动去模糊 | 500 | **27.661** | **.7847** | **.2284** | 27.638 | .7838 | .2357 |
| ImageNet 运动去模糊 | 1000 | **27.637** | **.7838** | **.2375** | 27.627 | .7833 | .2403 |

**新息放置。** 无噪声中心框修复被单独作为定性压力测试。去掉 $128\times128$ 方块留下大零空间，因此许多语义不同的脸都能与观测像素精确一致。针对某一隐藏真值的逐像素 PSNR 与 SSIM 会仅因合理后验样本选择了不同的眼睛形状、表情或面部细节而惩罚它们。因此我们只用该任务检查视觉连贯性与样本变异性。所有方法使用相同 FFHQ 先验、中心掩码与无噪声观测像素。对 PD-IMEX，我们使用二次网格，从适当加噪的测量初始化观测区域，且不施加硬投影。100-NFE 配置使用 $\tau_c=24$ 与 $\zeta=24$。

该任务也使得 Langevin 新息的位置格外相关。为显式显示区别，写

$$
\mathbf d_k:=\hat{\mathbf x}_{0,k}+\varrho_k(\mathbf z_k-\hat{\mathbf x}_{0,k})+\Omega_k\mathbf b_{k+1},\qquad \mathbf R_k:=(\mathbf I+\Omega_k\mathbf H_{k+1})^{-1}.
$$

使用同一高斯抽样 $\boldsymbol\xi_k$，两种变体为

$$
\mathbf z_{k+1}^{\mathrm{inside}}=\mathbf R_k\left(\mathbf d_k+\sqrt{V_k}\boldsymbol\xi_k\right),\qquad \mathbf z_{k+1}^{\mathrm{post}}=\mathbf R_k\mathbf d_k+\sqrt{V_k}\boldsymbol\xi_k,\qquad \boldsymbol\xi_k\sim\mathcal N(\mathbf 0,\mathbf I). \tag{4.2}
$$

因此，求解内放置把新息经似然预解式过滤，而求解后放置只把预解式作用于确定性更新。沿曲率为 $\nu$ 的似然本征模态，局部松弛时间约为 $(\kappa_\lambda+\chi_\lambda\nu)^{-1}$。在端点附近，乘积 $\Omega_k\nu$ 可保持一阶或更大，因此该快尺度未被网格分辨。求解内变体随后只保留新息方差的 $(1+\Omega_k\nu)^{-2}$ 比例。相反，(4.2) 的求解后变体在不过滤 Langevin 新息的情况下稳定确定性似然漂移。

为在有限 NFE 下隔离该放置效应，残余刷新量也必须保持可比。每步 $k$ 的新鲜新息比例为 $1-\exp(-2\zeta\Delta\lambda_k)$。因此在固定 $\zeta$ 下细化网格会削弱每步刷新，并把新息放置与不同的实际随机机制混淆。我们在 100、200、500、1000 NFE 处分别使用 $\zeta=24,48,120,240$，近似保持 100-NFE 配置的典型每步刷新强度。在每个 NFE 内，求解内与求解后变体共享初始化与每次高斯抽样；只有新息位置改变。图 4 表明求解后新息在测试的整个 NFE 范围内给出连贯补全，而把同一新息经求解内预解式过滤会使缺失区域未解析。因此该实验在有限步刷新强度匹配时支持求解后放置。

> **图 4（原文 Fig. 4）：** 无噪声中心框修复的 Langevin 新息放置研究。从 100 到 1000 NFE，我们分别使用 $\zeta=24,48,120,240$，以保持典型每步残余刷新可比。每列内，求解内与求解后变体共享初始化、确定性隐式更新与高斯抽样；只有新息放置改变。

图 5 把该受控研究置于更广泛的逆问题比较中。由于许多图像与同一掩码观测兼容，我们不按与单一隐藏图像的逐像素接近度对方法排名。相反，图比较观测区域的保持与缺失区域中连贯、语义合理内容的生成。

> **图 5（原文 Fig. 5）：** 无噪声中心框修复的定性比较。自上而下各行展示图像 38、15、80。所有方法使用相同 FFHQ 模型、中心掩码与无噪声观测像素。PD-IMEX 使用 $\zeta=24$、求解后 Langevin 新息与 100 NFE。由于条件问题高度非唯一，真值作为一张兼容的潜在图像展示，而非唯一期望补全。

## 5. 结论

我们发展了使用完整多尺度扩散先验处理线性成像逆问题的后验动力学。关键思想是在扩散尺度间条件化扩散先验，而不是只把预训练网络当作外层重建过程中的去噪模块。把似然中心与干净图像坐标对齐、并为残余扩散不确定性延拓其协方差，定义了一条显式替代后验路径。所得动力学把基础多尺度输运与可调 Langevin 分量结合，为后验跟踪与任务相关探索提供共同机制。端点一致性与有限时域跟踪估计为这一构造提供分析支持。

PD-IMEX 提供动力学的有效稳定实现。它每个扩散尺度只做一次得分评估，隐式处理线性似然漂移，并在数据一致性求解之后放置 Langevin 新息。实验表明在 100 次得分评估下重建质量强，证明隐式积分保持粗网格效率，并显示相对 Langevin 强度如何使保真–多样性行为适应不同逆问题。这些结果共同提供了从预训练多尺度扩散先验到有理论支撑且灵活的后验求解器的直接路径。

## 致谢与声明

作者使用 OpenAI Codex 协助语言润色、LaTeX 排版、代码开发与实验流程组织。作者对所有内容负责。

## 附录 A. 精确后验族的证明

**命题 3.1 的证明。** 令 $q_\lambda=e^{-2\lambda}$。由于 $\pi_\lambda^{\mathbf y}=P_{q_\lambda}p_0(\cdot\mid\mathbf y)$ 且高斯热半群满足

$$
\partial_qP_q\nu=\frac12\Delta P_q\nu,
$$

有 $q'_\lambda=-2q_\lambda$，因此

$$
\partial_\lambda\pi_\lambda^{\mathbf y}=-q_\lambda\Delta\pi_\lambda^{\mathbf y}. \tag{A.1}
$$

令 $m_\lambda$ 为 (3.6) 的密度。其 Fokker–Planck 方程为

$$
\partial_\lambda m_\lambda=-\nabla\cdot\left((q_\lambda+a_\lambda)m_\lambda\nabla\log\pi_\lambda^{\mathbf y}\right)+a_\lambda\Delta m_\lambda. \tag{A.2}
$$

代入 $m_\lambda=\pi_\lambda^{\mathbf y}$ 并利用 $\pi_\lambda^{\mathbf y}\nabla\log\pi_\lambda^{\mathbf y}=\nabla\pi_\lambda^{\mathbf y}$，得

$$
-\nabla\cdot\left((q_\lambda+a_\lambda)\nabla\pi_\lambda^{\mathbf y}\right)+a_\lambda\Delta\pi_\lambda^{\mathbf y}=-q_\lambda\Delta\pi_\lambda^{\mathbf y}=\partial_\lambda\pi_\lambda^{\mathbf y}.
$$

因此 $\pi_\lambda^{\mathbf y}$ 解 (A.2)。由于初始律为 $\pi_{\lambda_0}^{\mathbf y}$，Fokker–Planck 解的唯一性蕴含在每个紧区间上 $m_\lambda=\pi_\lambda^{\mathbf y}$。最后 $q_\lambda\to0$，且高斯半群在零处的连续性给出 $P_{q_\lambda}p_0(\cdot\mid\mathbf y)\Rightarrow p_0(\cdot\mid\mathbf y)$。

## 附录 B. 端点与得分一致性

**命题 3.3 的证明。** 由于 $p_0\in L^1(\mathbb R^d)$ 且高斯核构成近似单位，有

$$
\|\pi_\lambda-p_0\|_{L^1}\to0. \tag{B.1}
$$

令

$$
L_\infty(\mathbf z)=\exp\left[-\frac{\|\mathbf A\mathbf z-\mathbf y\|^2}{2\sigma_d^2}\right].
$$

由于 $\boldsymbol\Gamma_\lambda^{-1}\to\sigma_d^{-2}\mathbf I$，有 $L_\lambda(\mathbf z)\to L_\infty(\mathbf z)$ 逐点成立，且 $0<L_\lambda,L_\infty\le1$。记 $f_\lambda=\pi_\lambda L_\lambda$、$f_\infty=p_0L_\infty$。则

$$
\|f_\lambda-f_\infty\|_{L^1}\le\|\pi_\lambda-p_0\|_{L^1}+\int\pi_\lambda|L_\lambda-L_\infty|\,\mathrm d\mathbf z\le2\|\pi_\lambda-p_0\|_{L^1}+\int p_0|L_\lambda-L_\infty|\,\mathrm d\mathbf z\to0, \tag{B.2}
$$

其中最后一项积分由控制收敛收敛。因此 $Z_\lambda=\int f_\lambda\,\mathrm d\mathbf z\to Z_\infty:=\int f_\infty\,\mathrm d\mathbf z>0$。对足够大的 $\lambda$，$Z_\lambda\ge Z_\infty/2$，且

$$
\left\|\frac{f_\lambda}{Z_\lambda}-\frac{f_\infty}{Z_\infty}\right\|_{L^1}\le\frac{1}{Z_\lambda}\|f_\lambda-f_\infty\|_{L^1}+\left|\frac{1}{Z_\lambda}-\frac{1}{Z_\infty}\right|\|f_\infty\|_{L^1}\to0.
$$

由于全变差是两个密度之间 $L^1$ 距离的一半，这证明了 (3.17)。

对得分陈述，贝叶斯公式给出

$$
\nabla\log p(\mathbf z\mid\mathbf y)=\nabla\log p_0(\mathbf z)-\sigma_d^{-2}\mathbf A^\top(\mathbf A\mathbf z-\mathbf y).
$$

把该恒等式从 (3.14) 中减去得

$$
\bar{\mathbf s}_\lambda(\mathbf z;\mathbf y)-\nabla\log p(\mathbf z\mid\mathbf y)=\nabla\log\pi_\lambda(\mathbf z)-\nabla\log p_0(\mathbf z)-\mathbf A^\top\left(\boldsymbol\Gamma_\lambda^{-1}-\sigma_d^{-2}\mathbf I\right)(\mathbf A\mathbf z-\mathbf y). \tag{B.3}
$$

第一项按假设局部一致收敛。在每个紧集上，第二项一致收敛，因为 $\boldsymbol\Gamma_\lambda^{-1}\to\sigma_d^{-2}\mathbf I$ 且 $\mathbf A\mathbf z-\mathbf y$ 在该紧集上有界。

## 附录 C. 延拓似然的输运缺陷

**命题 3.5 的证明。** 记 $f_\lambda=\pi_\lambda$、$u_\lambda=f_\lambda L_\lambda$，使 $\bar\pi_\lambda=u_\lambda/\int u_\lambda$。由于 $\partial_\lambda f_\lambda=-q_\lambda\Delta f_\lambda$，中心化去掉归一化因子的导数并给出

$$
r_\lambda=\mathcal C_{\bar\pi_\lambda}\left[\frac{\partial_\lambda u_\lambda+q_\lambda\Delta u_\lambda}{u_\lambda}\right]. \tag{C.1}
$$

乘积法则贡献 $2q_\lambda\mathbf s_\lambda^{\mathrm{pr}}\cdot\mathbf s_\lambda^{\mathrm{lik}}$。此外，对 (3.12) 直接求导给出

$$
\partial_\lambda\log L_\lambda=\frac12\dot\eta_\lambda\left\|\mathbf s_\lambda^{\mathrm{lik}}\right\|^2,\qquad\Delta\log L_\lambda=-\mathrm{tr}(\mathbf H_\lambda).
$$

因此

$$
\frac{\partial_\lambda L_\lambda+q_\lambda\Delta L_\lambda}{L_\lambda}=-q_\lambda\mathrm{tr}(\mathbf H_\lambda)+\left(q_\lambda+\frac12\dot\eta_\lambda\right)\left\|\mathbf s_\lambda^{\mathrm{lik}}\right\|^2.
$$

代入 (C.1) 即证 (3.21)，因为空间常数的迹项在中心化下消失。

## 附录 D. 熵恒等式与有限时域跟踪

**定理 3.6 的证明。** 为记号简洁，写 $q=q_\lambda$、$a=a_\lambda$、$\pi=\bar\pi_\lambda$、$\mu=\mu_\lambda$、$g=\mu/\pi$。(3.23) 的 Fokker–Planck 方程为

$$
\partial_\lambda\mu=-\nabla\cdot\left((q+a)\mu\nabla\log\pi\right)+a\Delta\mu=-q\nabla\cdot(\mu\nabla\log\pi)+a\nabla\cdot(\mu\nabla\log g). \tag{D.1}
$$

第二个等式由 $\nabla\cdot(\mu\nabla\log g)=\Delta\mu-\nabla\cdot(\mu\nabla\log\pi)$ 得出。由缺陷定义，

$$
\partial_\lambda\pi=-q\Delta\pi+r_\lambda\pi. \tag{D.2}
$$

对 $\mathrm H(\lambda)=\int\mu\log g\,\mathrm d\mathbf z$ 求导。由于 $\int\partial_\lambda\mu\,\mathrm d\mathbf z=0$，

$$
\mathrm H'(\lambda)=\int\partial_\lambda\mu\log g\,\mathrm d\mathbf z-\int\mu\partial_\lambda\log\pi\,\mathrm d\mathbf z. \tag{D.3}
$$

(D.1) 中的 Langevin 贡献为

$$
a\int\nabla\cdot(\mu\nabla\log g)\log g\,\mathrm d\mathbf z=-a\int\|\nabla\log g\|^2\,\mathrm d\mu. \tag{D.4}
$$

基础输运贡献为

$$
q\int\mu\nabla\log\pi\cdot\nabla\log g\,\mathrm d\mathbf z=q\int\nabla\pi\cdot\nabla g\,\mathrm d\mathbf z=-q\int g\Delta\pi\,\mathrm d\mathbf z=-q\int\frac{\Delta\pi}{\pi}\,\mathrm d\mu. \tag{D.5}
$$

同时 (D.2) 给出

$$
-\int\mu\partial_\lambda\log\pi\,\mathrm d\mathbf z=q\int\frac{\Delta\pi}{\pi}\,\mathrm d\mu-\int r_\lambda\,\mathrm d\mu. \tag{D.6}
$$

(D.5) 与 (D.6) 的第一项相消，得到精确恒等式 (3.26)。

把对数 Sobolev 不等式 (3.27) 应用于 $f=\sqrt g$。由于 $\int g\,\mathrm d\pi=1$，

$$
\mathrm H(\lambda)=\mathrm{Ent}_\pi(g),\qquad\int\|\nabla\sqrt g\|^2\,\mathrm d\pi=\frac14\mathrm I(\mu\|\pi),
$$

因此

$$
\mathrm I(\mu\|\pi)\ge2\rho_\lambda\mathrm H(\lambda). \tag{D.7}
$$

结合 (3.26)、(3.28) 与 (D.7)，

$$
\mathrm H'(\lambda)\le-\left(2a_\lambda\rho_\lambda-c_\lambda\right)\mathrm H(\lambda)+\varepsilon_\lambda=-k_\lambda\mathrm H(\lambda)+\varepsilon_\lambda.
$$

Gronwall 不等式的积分因子形式给出 (3.30)。若累积收缩发散且其加权缺陷强迫消失，则 $\mathrm H(\lambda)\to0$。Pinsker 不等式、三角不等式与命题 3.3 随后给出全变差意义下向后验的收敛。

为完整起见，熵变分不等式

$$
\int F\,\mathrm d\nu\le\mathrm{KL}(\nu\|\pi)+\log\int e^F\,\mathrm d\pi
$$

取 $F=-\theta_\lambda r_\lambda$ 即逐点给出 (3.31)。

## 附录 E. 求解后 Langevin 新息与弱误差

**命题 3.7 的证明。** 写 $\mathbf R_k=(\mathbf I+\Omega_k\mathbf H_{k+1})^{-1}$、$\tilde{\mathbf z}_{k+1}=\hat{\mathbf x}_{0,k}+\varrho_k(\mathbf z_k-\hat{\mathbf x}_{0,k})+\Omega_k\mathbf b_{k+1}$。则 $\mathbf z_{k+1}=\mathbf R_k\tilde{\mathbf z}_{k+1}+\sqrt{V_k}\boldsymbol\xi_k$，故其条件协方差恰为 $V_k\mathbf I$。若把新息放入隐式求解内部，更新变为 $\mathbf R_k(\tilde{\mathbf z}_{k+1}+\sqrt{V_k}\boldsymbol\xi_k)$，其条件协方差为 $V_k\mathbf R_k^2$（因 $\mathbf R_k$ 对称）。这证明了协方差比较。

在固定有限区间上，对 (3.37)–(3.38) 中标量积分作 Taylor 展开，关于 $k$ 一致地给出

$$
\varrho_k=1-\kappa_kh_k+O(h_k^2),\qquad\Omega_k=\chi_kh_k+O(h_k^2),\qquad V_k=2a_kh_k+O(h_k^2), \tag{E.1}
$$

因为定义 $V_k$ 的指数因子在整个步上一致为 $1+O(h_k)$。这证明了 (3.40)。

Tweedie 恒等式给出 $\hat{\mathbf x}_{0,k}-\mathbf z=q_k\mathbf s_k^{\mathrm{pr}}(\mathbf z)$。关于 $\lambda$ 的平滑性与 (E.1) 给出

$$
\tilde{\mathbf z}_{k+1}=\mathbf z+\chi_kh_k\left(\mathbf s_k^{\mathrm{pr}}(\mathbf z)+\mathbf b_k\right)+O\left((1+\|\mathbf z\|)h_k^2\right),\qquad\mathbf R_k=\mathbf I-\chi_kh_k\mathbf H_k+O(h_k^2).
$$

因此

$$
\mathbb E[\mathbf z_{k+1}-\mathbf z\mid\mathbf z_k=\mathbf z]=(q_k+a_k)\bar{\mathbf s}_{\lambda_k}(\mathbf z;\mathbf y)h_k+O\left((1+\|\mathbf z\|)h_k^2\right), \tag{E.2}
$$

$$
\mathrm{Cov}(\mathbf z_{k+1}\mid\mathbf z_k=\mathbf z)=2a_kh_k\mathbf I+O(h_k^2), \tag{E.3}
$$

其中第一行用到 $\bar{\mathbf s}_{\lambda_k}(\mathbf z;\mathbf y)=\mathbf s_k^{\mathrm{pr}}(\mathbf z)-\mathbf H_k\mathbf z+\mathbf b_k$。这些是 (3.23) 到一阶的条件矩。

**定理 3.8 的证明。** 令

$$
\mathbf B_\lambda(\mathbf z)=(q_\lambda+a_\lambda)\bar{\mathbf s}_\lambda(\mathbf z;\mathbf y),\qquad\mathcal L_\lambda f=\mathbf B_\lambda\cdot\nabla f+a_\lambda\Delta f.
$$

固定 $k$ 并以 $\mathbf z_k^{\mathrm{alg}}=\mathbf z$ 为条件。仿射高斯更新可写为

$$
\Delta_k:=\mathbf z_{k+1}^{\mathrm{alg}}-\mathbf z=\mathbf m_k(\mathbf z)+\sqrt{V_k}\boldsymbol\xi_k,\qquad\boldsymbol\xi_k\sim\mathcal N(\mathbf 0,\mathbf I),
$$

其中 (E.2)–(E.3) 给出

$$
\mathbf m_k(\mathbf z)=\mathbf B_{\lambda_k}(\mathbf z)h_k+O\left((1+\|\mathbf z\|)h_k^2\right),\qquad V_k=2a_{\lambda_k}h_k+O(h_k^2). \tag{E.4}
$$

下文需要原始二阶矩而不只是协方差。由于 $\mathbb E[\Delta_k\Delta_k^\top]=V_k\mathbf I+\mathbf m_k\mathbf m_k^\top$，

$$
\mathbb E[\Delta_k\Delta_k^\top]=2a_{\lambda_k}h_k\mathbf I+O\left((1+\|\mathbf z\|^2)h_k^2\right). \tag{E.5}
$$

中心化高斯三阶矩为零。围绕 $\mathbf m_k$ 展开并利用 (E.4)，因此对某个与网格无关的整数 $m$，

$$
\left\|\mathbb E[\Delta_k^{\otimes3}]\right\|\le C(1+\|\mathbf z\|^m)h_k^2,\qquad\mathbb E\|\Delta_k\|^4\le C(1+\|\mathbf z\|^m)h_k^2. \tag{E.6}
$$

第一估计是带符号张量矩界，第二估计是 Taylor 余项所需的绝对四阶矩界。

对空间导数到四阶满足所述多项式增长界的函数 $f$，带四阶余项的三阶 Taylor 展开给出

$$
f(\mathbf z+\Delta_k)=f(\mathbf z)+Df(\mathbf z)[\Delta_k]+\frac12D^2f(\mathbf z)[\Delta_k,\Delta_k]+\frac16D^3f(\mathbf z)[\Delta_k,\Delta_k,\Delta_k]+R_4(\mathbf z,\Delta_k).
$$

余项满足

$$
|R_4(\mathbf z,\Delta_k)|\le C(1+\|\mathbf z\|^m+\|\Delta_k\|^m)\|\Delta_k\|^4.
$$

高斯矩估计与 (E.4) 因此把其条件期望界为 $C(1+\|\mathbf z\|^{m'})h_k^2$（某 $m'$）。在 Taylor 展开中取条件期望并应用 (E.4)–(E.6) 得

$$
\hat Q_kf(\mathbf z)=f(\mathbf z)+h_k\mathcal L_{\lambda_k}f(\mathbf z)+O\left((1+\|\mathbf z\|^m)h_k^2\right). \tag{E.7}
$$

接下来推导精确转移的相应展开。令 $s=\lambda_k$、$t=\lambda_{k+1}$，并写 $\mathbb E_{s,\mathbf z}$ 表示条件于 $\mathbf Z_s=\mathbf z$ 的期望。Dynkin 公式给出

$$
Q_kf(\mathbf z)=f(\mathbf z)+\int_s^t\mathbb E_{s,\mathbf z}\left[\mathcal L_rf(\mathbf Z_r)\right]\mathrm dr.
$$

把时变 Dynkin 公式应用于 $g(r,\mathbf x)=\mathcal L_rf(\mathbf x)$ 得

$$
\mathbb E_{s,\mathbf z}[\mathcal L_rf(\mathbf Z_r)]=\mathcal L_sf(\mathbf z)+\int_s^r\mathbb E_{s,\mathbf z}\left[(\partial_u+\mathcal L_u)\mathcal L_uf(\mathbf Z_u)\right]\mathrm du.
$$

代入前一恒等式得

$$
Q_kf(\mathbf z)=f(\mathbf z)+h_k\mathcal L_sf(\mathbf z)+\int_s^t\int_s^r\mathbb E_{s,\mathbf z}\left[(\partial_u+\mathcal L_u)\mathcal L_uf(\mathbf Z_u)\right]\mathrm du\,\mathrm dr.
$$

系数正则性蕴含 $(\partial_u+\mathcal L_u)\mathcal L_uf(\mathbf x)$ 具有多项式增长。精确矩界与积分区域面积 $h_k^2/2$ 随后给出

$$
Q_kf(\mathbf z)=f(\mathbf z)+h_k\mathcal L_{\lambda_k}f(\mathbf z)+O\left((1+\|\mathbf z\|^m)h_k^2\right). \tag{E.8}
$$

比较 (E.7) 与 (E.8) 得

$$
\left|(\hat Q_k-Q_k)f(\mathbf z)\right|\le C_f(1+\|\mathbf z\|^m)h_k^2. \tag{E.9}
$$

最后定义后向函数

$$
u_k(\mathbf z):=\mathbb E\left[\phi(\mathbf Z_\Lambda)\mid\mathbf Z_{\lambda_k}=\mathbf z\right].
$$

它们满足 $u_k=Q_ku_{k+1}$，且按假设其到四阶的空间导数具有关于 $k$ 一致的多项式增长界。由于精确过程与数值过程具有相同初始律，望远镜求和给出

$$
\mathbb E\phi(\mathbf z_K^{\mathrm{alg}})-\mathbb E\phi(\mathbf Z_\Lambda)=\sum_{k=0}^{K-1}\mathbb E\left[(\hat Q_k-Q_k)u_{k+1}(\mathbf z_k^{\mathrm{alg}})\right].
$$

应用 (E.9)、数值矩界以及

$$
\sum_{k=0}^{K-1}h_k^2\le h\sum_{k=0}^{K-1}h_k=h(\Lambda-\lambda_0)
$$

即证 (3.41)。

## 参考文献（英文原书目）

- [1] B. D. Anderson, Reverse-time diffusion equation models, Stochastic Process. Appl., 12 (1982), pp. 313–326.
- [2] D. Bakry, I. Gentil, and M. Ledoux, Analysis and Geometry of Markov Diffusion Operators, Grundlehren der Mathematischen Wissenschaften 348, Springer, Cham, 2014.
- [3] J. Batson and L. Royer, Noise2Self: Blind denoising by self-supervision, in Proceedings of ICML, 2019, pp. 524–533.
- [4] Black Forest Labs, S. Batifol, A. Blattmann, et al., FLUX.1 Kontext: Flow matching for in-context image generation and editing in latent space, arXiv:2506.15742, 2025.
- [5] B. Boys, J. Pidstrigach, M. Girolami, S. Reich, A. Mosca, and O. D. Akyildiz, Tweedie moment projected diffusions for inverse problems, Trans. Mach. Learn. Res., 2024.
- [6] A. Buades, B. Coll, and J.-M. Morel, A non-local algorithm for image denoising, in Proceedings of CVPR, 2005, pp. 60–65.
- [7] G. Cardoso, Y. Janati El Idrissi, S. Le Corff, and E. Moulines, Monte Carlo guided denoising diffusion models for Bayesian linear inverse problems, in International Conference on Learning Representations, 2024.
- [8] J. Chang, C. Duan, Y. Jiao, R. Li, J. Z. Yang, and C. Yuan, Provable diffusion posterior sampling for Bayesian inversion, arXiv:2512.08022, 2025.
- [9] T. Chan, A. Marquina, and P. Mulet, High-order total variation-based image restoration, SIAM J. Sci. Comput., 22 (2000), pp. 503–516.
- [10] H. Chung, J. Kim, M. T. McCann, M. L. Klasky, and J. C. Ye, Diffusion posterior sampling for general noisy inverse problems, in International Conference on Learning Representations, 2023.
- [11] H. Chung, B. Sim, D. Ryu, and J. C. Ye, Improving diffusion models for inverse problems using manifold constraints, in Advances in Neural Information Processing Systems, 35 (2022), pp. 25683–25696.
- [12] K. Dabov, A. Foi, V. Katkovnik, and K. Egiazarian, Image denoising by sparse 3-D transform-domain collaborative filtering, IEEE Trans. Image Process., 16 (2007), pp. 2080–2095.
- [13] P. Dhariwal and A. Nichol, Diffusion models beat GANs on image synthesis, in Advances in Neural Information Processing Systems, 34 (2021), pp. 8780–8794.
- [14] J. L. Doob, Classical Potential Theory and Its Probabilistic Counterpart, Grundlehren der Mathematischen Wissenschaften 262, Springer, New York, 1984.
- [15] Z. Dou and Y. Song, Diffusion posterior sampling for linear inverse problem solving: A filtering perspective, in International Conference on Learning Representations, 2024.
- [16] P. Dupuis and R. S. Ellis, A Weak Convergence Approach to the Theory of Large Deviations, Wiley Series in Probability and Statistics, John Wiley & Sons, New York, 1997.
- [17] S. Gu, L. Zhang, W. Zuo, and X. Feng, Weighted nuclear norm minimization with application to image denoising, in Proceedings of CVPR, 2014, pp. 2862–2869.
- [18] J. Ho, A. Jain, and P. Abbeel, Denoising diffusion probabilistic models, in Advances in Neural Information Processing Systems, 33 (2020), pp. 6840–6851.
- [19] H. Ji, C. Liu, Z. Shen, and Y. Xu, Robust video denoising using low-rank matrix completion, in Proceedings of CVPR, 2010, pp. 1791–1798.
- [20] Y. Jiao, N. Li, C. Cai, Y. Chen, and G. Li, Provable diffusion-based posterior sampling for linear inverse problems via DDIM, arXiv:2607.19333, 2026.
- [21] T. Karras, S. Laine, and T. Aila, A style-based generator architecture for generative adversarial networks, in Proceedings of CVPR, 2019, pp. 4401–4410.
- [22] B. Kawar, G. Vaksman, and M. Elad, SNIPS: Solving noisy inverse problems stochastically, in Advances in Neural Information Processing Systems, 34 (2021), pp. 21757–21769.
- [23] B. Kawar, M. Elad, S. Ermon, and J. Song, Denoising diffusion restoration models, in Advances in Neural Information Processing Systems, 35 (2022).
- [24] S. Laine, T. Karras, J. Lehtinen, and T. Aila, High-quality self-supervised deep image denoising, in Advances in Neural Information Processing Systems, 32 (2019).
- [25] J. Lehtinen, J. Munkberg, J. Hasselgren, S. Laine, T. Karras, M. Aittala, and T. Aila, Noise2Noise: Learning image restoration without clean data, in Proceedings of ICML, 2018, pp. 2971–2980.
- [26] T. Li, A. Abdulle, and W. E, Effectiveness of implicit methods for stiff stochastic differential equations, Commun. Comput. Phys., 3 (2008), pp. 295–307.
- [27] T. Li and K. He, Back to basics: Let denoising generative models denoise, in Proceedings of CVPR, 2026, pp. 36115–36125.
- [28] J. Liang, J. Cao, G. Sun, K. Zhang, L. Van Gool, and R. Timofte, SwinIR: Image restoration using Swin Transformer, in Proceedings of ICCV, 2021, pp. 1833–1844.
- [29] M. Mardani, J. Song, J. Kautz, and A. Vahdat, A variational perspective on solving inverse problems with diffusion models, in International Conference on Learning Representations, 2024.
- [30] B. Moufad, Y. Janati El Idrissi, L. Bedin, A. O. Durmus, R. Douc, E. Moulines, and J. Olsson, Variational diffusion posterior sampling with midpoint guidance, in International Conference on Learning Representations, 2025.
- [31] T. Pang, Z. Shen, and R. Zhang, Forward-evolution error analysis and adaptive design for matrix-valued diffusion models, arXiv:2608.15103, 2026.
- [32] N. Parikh and S. Boyd, Proximal algorithms, Found. Trends Optim., 1 (2014), pp. 127–239.
- [33] M. Pereyra, Proximal Markov chain Monte Carlo algorithms, Stat. Comput., 26 (2016), pp. 745–760.
- [34] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, High-resolution image synthesis with latent diffusion models, in Proceedings of CVPR, 2022, pp. 10684–10695.
- [35] L. I. Rudin, S. Osher, and E. Fatemi, Nonlinear total variation based noise removal algorithms, Phys. D, 60 (1992), pp. 259–268.
- [36] O. Russakovsky, J. Deng, H. Su, J. Krause, S. Satheesh, S. Ma, Z. Huang, A. Karpathy, A. Khosla, M. Bernstein, et al., ImageNet large scale visual recognition challenge, Int. J. Comput. Vis., 115 (2015), pp. 211–252.
- [37] Y. Song and S. Ermon, Generative modeling by estimating gradients of the data distribution, in Advances in Neural Information Processing Systems, 32 (2019).
- [38] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, Score-based generative modeling through stochastic differential equations, in International Conference on Learning Representations, 2021.
- [39] J. Song, A. Vahdat, M. Mardani, and J. Kautz, Pseudoinverse-guided diffusion models for inverse problems, in International Conference on Learning Representations, 2023.
- [40] D. Strong and T. Chan, Edge-preserving and scale-dependent properties of total variation regularization, Inverse Problems, 19 (2003), pp. S165–S187.
- [41] Y. Sun, Z. Wu, Y. Chen, B. T. Feng, and K. L. Bouman, Provable probabilistic imaging using score-based generative priors, IEEE Trans. Comput. Imaging, 10 (2024), pp. 1290–1305.
- [42] Y. Wang, J. Yu, and J. Zhang, Zero-shot image restoration using denoising diffusion null-space model, in International Conference on Learning Representations, 2023.
- [43] L. Wu, B. Trippe, C. Naesseth, D. Blei, and J. P. Cunningham, Practical and asymptotically exact conditional sampling in diffusion models, in Advances in Neural Information Processing Systems, 36 (2023), pp. 31372–31403.
- [44] Z. Wu, Y. Sun, Y. Chen, B. Zhang, Y. Yue, and K. Bouman, Principled probabilistic imaging using diffusion models as plug-and-play priors, in Advances in Neural Information Processing Systems, 37 (2024), pp. 118389–118427.
- [45] S. W. Zamir, A. Arora, S. Khan, M. Hayat, F. S. Khan, and M.-H. Yang, Restormer: Efficient transformer for high-resolution image restoration, in Proceedings of CVPR, 2022, pp. 5728–5739.
- [46] K. Zhang, W. Zuo, Y. Chen, D. Meng, and L. Zhang, Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising, IEEE Trans. Image Process., 26 (2017), pp. 3142–3155.
- [47] R. Zhang, P. Isola, A. A. Efros, E. Shechtman, and O. Wang, The unreasonable effectiveness of deep features as a perceptual metric, in Proceedings of CVPR, 2018, pp. 586–595.
- [48] B. Zhang, W. Chu, J. Berner, C. Meng, A. Anandkumar, and Y. Song, Improving diffusion inverse problem solving with decoupled noise annealing, in Proceedings of CVPR, 2025, pp. 20895–20905.
- [49] Y. Zhu, K. Zhang, J. Liang, J. Cao, B. Wen, R. Timofte, and L. Van Gool, Denoising diffusion models for plug-and-play image restoration, in Proceedings of the CVPR Workshops, 2023, pp. 1219–1229.

## 图注与表注索引

本页图 1–5 的中文图注与表 1–3 的表注均按原文出现位置内联在正文中（图 1 与表 1 见第 4.1 节，表 2 见第 4.2 节，图 2–3 见第 4.3 节，表 3 与图 4–5 见第 4.4 节），此处不重复罗列。原文为 SIAM 风格单栏排版，图以浮动方式穿插于正文，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2608.15144v2 全文（26 页）的中文译稿：摘要、关键词、MSC 分类号、第 1–5 节正文与编号小节、算法 3.1、图 1–5 的中文图注、表 1–3 的逐格转写、附录 A–E（含 (A.1)–(A.2)、(B.1)–(B.3)、(C.1)、(D.1)–(D.7)、(E.1)–(E.9) 的证明与推导）、致谢与声明，以及参考文献 49 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：正文与附录共 74 条编号式逐式核对（重点 (3.6)–(3.7)、(3.11)–(3.22)、(3.23)–(3.31)、(3.32)–(3.44) 与 (E.1)–(E.9)），表 1 用第 15 页、表 2 用第 16 页、表 3 用第 17 页渲染图逐格核对（并与 pymupdf 表格抽取交叉验证）。原文疑点：表 1 中 DDRM 在 FFHQ 去模糊/运动去模糊的 SSIM 与 LPIPS 优于本文方法，而 MGPS 在超分辨率 LPIPS 上最优，正文已如实说明"在感知质量上保持竞争力"及"若干任务上 DDRM 与 MGPS 保持更低 LPIPS"，故未加注单独疑点；本页对原文未发现明显数值矛盾。本页不上传原文图片，图内像素级重建与曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
