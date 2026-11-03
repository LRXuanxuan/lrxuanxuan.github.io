---
layout: page
title: "BayesFP：基于 Feynman–Kac 采样的流策略后验估计｜中文全文译文"
permalink: /papers/translations/2026-11-02-2606-21014-bayesfp-feynman-kac-posterior-estimation-flow-policies/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c5cf757a8893191c/) · [原文 arXiv](https://arxiv.org/abs/2606.21014/) · [全部目录](/papers/catalog/)

# BayesFP：基于 Feynman–Kac 采样的流策略后验估计

**原题：** BayesFP: Posterior Estimation for Flow-Based Policies via Feynman-Kac Sampling  
**作者：** Sreevardhan Sirigiri、Weiming Zhi、Fabio Ramos（¹悉尼大学计算机学院 School of Computer Science, The University of Sydney；²悉尼大学澳大利亚机器人中心 Australian Centre for Robotics；³范德堡大学互联计算学院 College of Connected Computing, Vanderbilt University；⁴NVIDIA；按 PDF 首页单位标注：Sreevardhan Sirigiri¹、Weiming Zhi^{1,2,3}、Fabio Ramos^{1,4}；通讯：ssir4919@uni.sydney.edu.au）  
**版本：** arXiv:2606.21014v3，2026-10-13；43 页；已接受待刊（第 10 届机器人学习会议 CoRL 2026，Austin, Texas, USA；NVIDIA 作者页标注为会议论文，未核实会议录卷页）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1–7 节（含 §4、§6–§7）、附录 A–H（含 Appendix C/D/F）、式 (1)–(113) 编号、算法 1、表 1–3 逐格、图 1–5 图注、参考文献 [1]–[57] 英文原条目；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

机器人必须生成既忠实于已学习专家行为、又满足仅在推理时指定的安全约束与任务相关目标的轨迹。我们把面向预训练扩散策略与流匹配（flow-matching）策略的受约束轨迹生成表述为**贝叶斯后验采样**：以已学习的演示分布为先验，以推理时由代价导出的似然把先验倾斜向可行、最优的轨迹。为了在完全不重训基座策略的前提下从该后验采样，我们利用**费曼–卡茨校正器（Feynman–Kac Corrector, FKC）**框架——它最初是为扩散模型提出的——并把它扩展到确定性流匹配策略。得到的产物是一个统一的、推理时的、免重训采样器，同时适用于扩散策略与流策略。我们在预训练的 Diffusion Policy、GR00T-N1.6 与 π0.5 检查点上，跨仿真与真实世界操作任务验证该方法，包括在推理时引入的非凸障碍物周围规划，并展示了相对基座 π0.5 在零样本任务上的改进。我们已开源实现，见该 GitHub 仓库以提供参考。

**关键词：** 费曼–卡茨偏微分方程（Feynman-Kac PDEs）；受约束生成式策略（Constrained Generative Policies）；机器人轨迹生成（Robot Trajectory Generation）

## 1 引言

在真实世界中运行的机器人必须生成既足够有表现力、能够刻画多模态任务分布，又足够敏捷、可用于闭环控制的运动。生成式建模的近期进展使模仿学习成为合成这类运动的有力范式：基于扩散的策略 [1, 2] 与流匹配策略 [3, 4, 5] 在操作与运动任务上均表现出很强性能。通过学习把噪声去噪、或把噪声输运到专家演示，这些模型忠实地捕捉了人类或专家行为的丰富多模态结构。

然而，真实世界部署的要求不止于模仿保真度。机器人必须遵守安全约束、可行性限制以及任务相关目标——这些通常在训练时未知，且可能在多次部署之间发生变化。关节限位、避障、自碰撞、工作空间边界、能耗代价与到达目标代价通常都在推理时指定，而预训练策略必须被引导去满足它们，同时不牺牲从数据中学到的行为丰富性。视觉运动（visuomotor）策略之所以占主导，是因为直接以点云为条件往往会降低控制帧率；但深度相机在机器人系统中普遍可得，因此由深度感知得到的环境几何自然适合在推理时用来指定这类约束。于是我们关注的核心问题是：**给定一个预训练的扩散/流匹配策略，或具有基于流式头部的 VLA，我们如何采样出既遵守仅在推理时指定的受约束优化问题、又保持对已学习演示分布忠实的轨迹？**

针对该问题的既有方法大致可分为两类。**轨迹优化与事后滤波**方法用基于梯度的规划器或控制论安全滤波器修正无约束的 rollout [6, 7, 8]；它们在某些场景下有效，但把生成与修正解耦，容易产生分布外轨迹、陷入局部极小，并带来较高计算开销。**生成式引导**方法——包括基于分类器的引导 [9]、基于控制屏障函数的引导 [10]、投影 [11]、反射动力学 [12, 13]，以及与辅助模块的联合采样 [14]——直接修改采样过程。它们相对事后方法有所改进，但都有一个根本局限：它们是对采样动力学的启发式修改，没有一种方法是从一个与数据先验和约束都有原则性关系的、定义良好的后验分布中采样。

在这项工作中，我们采取不同的视角。我们把受约束轨迹生成表述为**后验采样**：给定一个预训练的扩散或流策略，其边缘分布 \(p_{\mathrm{data}}(x)\)¹ 表示演示分布（关于控制输入，例如动作增量或关节位置）；并给定一个编码推理时受约束优化问题的代价函数 \(\mathcal J(x)\)，我们的目标是采样自后验

$$
p(x\mid O=1)\propto p_{\mathrm{data}}(x)\exp\bigl(\beta\,\mathcal J(x)\bigr),\tag{1}
$$

其中 \(O\) 是二值最优性指示变量，\(\beta<0\) 控制由代价诱导的倾斜强度。这正是把预训练策略视为专家轨迹上的贝叶斯先验、把代价视为最优性似然时所得到的分布。从该后验采样会偏好已经落在已学习演示分布之下的轨迹，同时以指数方式更偏好那些更好满足受约束优化问题的轨迹。关键之处在于：这不是启发式引导——它是与“约束感知模仿”的贝叶斯解释唯一一致的分布。

¹ 记号滥用说明：\(p_{\mathrm{data}}(x)\) 代表 \(p_{\mathrm{data}}(x\mid o)\)，其中 \(o\) 是当前传感器观测（通常是 RGB 相机）。这一条件始终存在，后文为简洁起见一律省略。

本文的贡献如下：**(1)** 我们把由预训练生成式策略出发的受约束轨迹生成表述为贝叶斯推断——以演示分布为先验、以代价导出的似然编码推理时受约束优化问题，从而为启发式引导与事后投影提供一个有原则的替代方案。**(2)** 我们把该后验实例化为一个费曼–卡茨（Feynman-Kac, FK）加权的 SDE（它是 Skreta et al. [15] 的一个特例），其重加权项由目标的福克–普朗克偏微分方程导出，因此即使漂移修正不完美，加权粒子群仍是后验的渐近无偏估计。FK 权重不是启发式修正，而是由福克–普朗克 PDE 导出的有原则的项。我们进一步把这一构造（原本只针对随机扩散过程表述）扩展到确定性流匹配策略：利用 Singh 与 Fischer [16] 的保持边缘分布的 SDE，把流 ODE 重新表述为 SDE，并用学到的速度场以闭式给出得分，从而得到一个同时适用于两类模型的统一推理时采样器。**(3)** 我们给出一个理论保证：当惩罚权重与逆温度充分大时，所得后验集中在任意接近可行、任意接近最优的轨迹上，从而无需备用规划器；我们还为其实际蒙特卡洛近似建立了非渐近保证，表明在算法参数固定时，有限采样预算带来的额外误差随样本数增加而以反比下降。**(4)** 我们在一系列仿真与真实世界机器人操作任务上经验性地证明，我们的采样器能产生满足推理时约束的轨迹。

**论文组织：** 后续编号各节构成正文，聚焦于核心问题表述、方法与经验评估。其余内容放入附录，包含证明、实现细节、补充实验信息、相关工作和详细的记号指南/术语表。

**图 1（原文 Fig. 1）：** 带障碍约束的玩具 2D 环境。上排：扩散模型在避开蓝色圆形区域的演示上训练，而红色障碍约束仅在推理时引入。我们比较无引导、一个把学到的得分 \(\nabla\log p_t(x)\) 替换为 \(\nabla\log p_t(x)+\lambda_t\nabla\mathcal J(x)\) 的朴素线性组合基线，以及我们的 BayesFP（Bayes Flow-based Policies）。下排：模型被训练为避开一个小方块，但在推理时用非凸障碍物评估。BayesFP 通过相应的费曼–卡茨加权动力学从式 (1) 的代价倾斜后验采样来处理这些约束，而不是施加事后修正或无原则的“得分–代价梯度”线性组合。

## 2 背景与预备知识

### 2.1 扩散策略

在模仿学习中，扩散模型 [2] 可用来把策略表示为专家演示上的生成模型，其形式化描述为模拟对应于逆时过程的随机微分方程（SDE）。具体而言，在训练阶段，通过模拟如下加噪 SDE 逐渐污染来自专家演示分布 \(p_{\mathrm{data}}(x)\) 的样本：

$$
dx_\tau = f_\tau(x_\tau)\,d\tau + \sigma_\tau\,dW_\tau,\qquad x_{\tau=0}\sim p_{\mathrm{data}}(x),\quad \tau\in[0,1],\tag{2}
$$

其中 \(f_\tau(x_\tau)\) 通常取某种线性漂移函数 \(f_\tau(x_\tau)=\alpha_\tau x_\tau\)，\(\sigma_\tau\) 定义随时间注入的噪声尺度，\(dW_\tau\) 是标准维纳过程。漂移 \(f_\tau\) 与扩散系数 \(\sigma_\tau\) 的选择使得最终密度接近标准正态分布 \(p_{\tau=1}\approx\mathcal N(0,I_d)\)。在推理时，以当前观测为条件模拟学到的逆时过程，产生供机器人执行的轨迹。

于是轨迹生成过程可定义为相反时间方向（\(t=1-\tau\)）上的一族去噪 SDE：

$$
dx_t = \Bigl(-f_t(x_t) + \sigma_t^2\,\nabla\log p_t(x_t)\Bigr)dt + \sigma_t\,dW_t,\qquad t\in[0,1],\tag{3}
$$

其中 \(p_t=p_{1-\tau}\) 是由式 (2) 中加噪过程诱导的边缘分布密度；因此该过程从 \(x_0\sim\mathcal N(x\mid 0,I)\) 出发，沿时间正向模拟，产生以当前机器人观测为条件、去噪后的轨迹 \(x_{t=1}\)。通过训练得分函数 \(\nabla\log p_t(\cdot)\) 的模型，就可以利用式 (3) 从 \(p_{\mathrm{data}}(x)\) 生成新样本 [17]。

### 2.2（整流）流匹配策略

再次令 \(x\sim p_{\mathrm{data}}(x)\) 表示专家演示（例如末端执行器轨迹或关节空间路径），它们抽自我们希望学习并采样的分布。令 \(x\sim p_{\mathrm{src}}(x)\in\mathbb R^d\) 为一个可处理的源分布，通常取标准高斯。在模仿学习语境下，基于流的模型的关键思想是：学习一个确定性映射，以当前机器人观测为条件，迭代地把 \(p_{\mathrm{src}}\) 的样本变换为与 \(p_{\mathrm{data}}\) 一致的演示 [18]。

令 \(\nu(x_{\mathrm{data}},x_{\mathrm{src}})\) 为演示与源样本的耦合分布，满足 \(p_{\mathrm{data}}(x)=\int\nu(x_{\mathrm{data}},x_{\mathrm{src}})\,dx_{\mathrm{src}}\) 且 \(p_{\mathrm{src}}(x)=\int\nu(x_{\mathrm{data}},x_{\mathrm{src}})\,dx_{\mathrm{data}}\)。一个简单的选择是独立耦合 \(\nu(x_{\mathrm{data}},x_{\mathrm{src}})\equiv p_{\mathrm{data}}(x_{\mathrm{data}})\,p_{\mathrm{src}}(x_{\mathrm{src}})\)。

为构造整流流（rectified flow），首先定义两个端点之间时间可微的插值 \(x_t\equiv h(x_{\mathrm{data}},x_{\mathrm{src}},t)\)，\(t\in[0,1]\)。默认插值 [19] 为：

$$
x_t = (1-t)\,x_{\mathrm{data}} + t\,x_{\mathrm{src}},\qquad t\in[0,1],
$$

于是 \(x_{t=0}=x_{\mathrm{data}}\) 对应专家演示，而 \(x_{t=1}=x_{\mathrm{src}}\sim\mathcal N(0,I_d)\) 对应纯噪声。整流流随后通过最小化下式学习向量场 \(v_t(x_t)\)：

$$
v_t(x) = \arg\min_{v'}\ \mathbb E_{(x_{\mathrm{data}},x_{\mathrm{src}})\sim\nu}\left[\int_0^1 \left\|\frac{dx_t}{dt} - v'_t(x_t)\right\|^2 dt\right].\tag{4}
$$

其解为 \(v_t(x)\equiv\mathbb E[x_{\mathrm{src}}-x_{\mathrm{data}}\mid x,t]\)，称为 1-整流流（1-Rectified flow）。由于 \(v_t(x)\) 一般没有闭式表达，实际用参数 \(\theta\) 参数化 \(v\)，并对式 (4) 关于 \(\theta\) 优化；此后我们在记号中省略这一依赖，并假定已给定学到的模型 \(v_t(x)\)。

在推理时，通过抽取 \(x_{t=1}\sim\mathcal N(0,I_d)\) 并在 \(t\) 上**反向**（即从 \(t=1\) 到 \(t=0\)）模拟流 \(dx=v_t(x)\,dt\)，产生供机器人执行的演示轨迹。

### 2.3 费曼–卡茨校正器

式 (3) 描述的是按 \(p_{\mathrm{data}}(x)\) 生成轨迹的标准去噪过程，但实践中我们可能希望在推理时把生成过程引导向一个**被修改过的目标分布**——例如组合多个预训练策略，或把生成偏向轨迹空间中的高回报区域。费曼–卡茨校正器（Feynman-Kac Corrector, FKC）框架 [15] 为此提供了有原则的机制：在去噪 SDE 上附加由费曼–卡茨公式导出的重加权项。

关键洞察是：密度在 SDE 下的时间演化可以分解为三种不同机制，每种由相应的 PDE 支配——捕捉确定性输运的**连续性方程**、捕捉随机扩散的**扩散方程**，以及捕捉样本重要性重加权的**重加权方程**（见附录 B）。三者合起来给出**费曼–卡茨 PDE**：

$$
\frac{\partial p_t^{\mathrm{FK}}(x)}{\partial t} = -\bigl\langle\nabla,\,p_t^{\mathrm{FK}}(x)\,v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta p_t^{\mathrm{FK}}(x) + \bar g_t(x)\,p_t^{\mathrm{FK}}(x),
$$

它支配某个**加权密度** \(p_t^{\mathrm{FK}}(x)\)（在我们的情形中是一个被修改的目标分布）的演化。为了从 \(p_t^{\mathrm{FK}}\) 采样，模拟如下加权 SDE：

$$
dx_t = v_t(x_t)\,dt + \sigma_t\,dW_t,\qquad dw_t = \bar g_t(x_t)\,dt,\tag{5}
$$

其中 \(w_t\) 是每条模拟轨迹携带的对数权重，而 \(\bar g_t(x)=g_t(x)-\int g_t(x)p_t^{\mathrm{FK}}(x)dx\) 是一个中心化重加权函数，用来保证归一化得以保持；\(dx_t\) 的演化由通常的扩散 SDE 给出。重加权项 \(g_t(x)\) 编码了所模拟的 SDE 与目标分布 \(p_t^{\mathrm{FK}}\) 的真实动力学之间的差异；通过把这些修正累积进权重 \(w_t\)，加权粒子群就近似了所期望的目标。

实践中，式 (5) 得到的加权样本可用来通过**自归一重要性采样（Self-Normalized Importance Sampling, SNIS）**估计 \(p_t^{\mathrm{FK}}\) 下的期望。具体地，给定一批 \(K\) 条模拟轨迹 \(\{x_t^{(k)},w_t^{(k)}\}_{k=1}^K\)，任意测试函数 \(\phi\)（通常取 \(\phi(x)\equiv x\)）在目标分布下的期望可近似为

$$
\mathbb E_{p_t^{\mathrm{FK}}}[\phi(x_t)]\approx\sum_{k=1}^{K}\frac{\exp\bigl(w_T^{(k)}\bigr)}{\sum_j\exp\bigl(w_T^{(j)}\bigr)}\,\phi\bigl(x_T^{(k)}\bigr),\tag{6}
$$

它在 \(K\to\infty\) 时收敛到真实期望 [15, 20]（另见附录 F.1）。然而实践中，该估计器会因**权重退化**而具有高方差——在较长的模拟时程上，少数粒子往往累积了大部分权重，导致对目标分布的覆盖变差。为此，我们在附录 D 中介绍若干推荐的重采样方法。在 \(K\) 个粒子并行模拟、且重采样高效的前提下，FKC 带来的额外开销可忽略不计。

## 3 问题陈述

在推理时（即逆时流/扩散过程中），我们希望引导采样，使生成的样本满足如下受约束优化问题：

$$
\underset{x\in\mathcal X}{\text{minimize}}\ \ \mathcal L(x)\quad\text{subject to}\ \ h_1(x)=0,\ \ h_2(x)\le 0.\tag{7}
$$

我们可以引入二值指示变量 \(O:\mathcal X\to\{0,1\}\)，用它标记满足式 (7) 所定义最优性判据的样本。定义**惩罚增广代价**²

$$
\mathcal J(x) := \mathcal L(x) + \rho(x) + c_1\,h_1(x)^2 + c_2\,\mathrm{softmax}\{0,h_2(x)\},\tag{8}
$$

其中 \(\rho(x)\) 是任意其他附加惩罚项。给定轨迹 \(x\) 时观测到 \(O=1\) 的似然定义为
\(p(O=1\mid x)=\exp\bigl(\beta\,\mathcal J(x)\bigr)\)，其中 \(\beta<0\) 控制对低代价样本偏好强度。借助贝叶斯法则把该似然与轨迹先验 \(p(x)\) 结合，得到后验分布 \(p(x\mid O=1)\propto p(x)\,p(O=1\mid x)\)。上述表述是**控制即（变分）推断（control as (variational) inference）**的一个实例，它把受约束优化重述为后验推断。其关键优势在于：它自然地刻画解空间中的多模态性（通常由约束的非凸性导致），同时让样本保持在先验附近 [21, 22, 23]。

现在给定一个预训练的扩散或流策略，其边缘分布为 \(q_t(x)\)，我们的目标是采样自**时间 \(t\) 的后验边缘分布**（也常称为 **Gibbs 倾斜边缘分布**）：

$$
p_t(x\mid O=1) = Z_t^{-1}\cdot q_t(x)\exp\bigl(\beta\,\mathcal J(x)\bigr),\qquad Z_t:=\int q_t(\tilde x)\exp\bigl(\beta\,\mathcal J(\tilde x)\bigr)d\tilde x.\tag{9}
$$

² 这里 \(\mathrm{softmax}\{0,h_2(x)\}\) 指 \(\max\{0,h_2(x)\}\) 的任意 \(C^2\) 近似。为便于解析与数学处理，我们采用 softmax 松弛；经验上，直接使用 max 算子也没有问题。

## 4 方法

### 4.1 引导扩散策略满足优化问题

在模仿学习语境下，FKC 框架尤其有吸引力：给定一个从 \(p_{\mathrm{data}}(x)\) 生成轨迹的预训练扩散策略，FKC 允许在推理时从被修改的分布中采样而无需任何重训。因此我们可以用 FKC 框架，借助如下费曼–卡茨 PDE，从式 (9) 的边缘分布 \(p_t(x)\) 中采样。³

**定理 4.1（Gibbs 倾斜采样；证明见附录 F 中定理 F.3）。** 考虑如下 SDE

$$
dx_t = \bigl(-f_t(x_t) + \sigma_t^2\nabla\log q_t(x_t)\bigr)dt + \sigma_t\,dW_t,\tag{10}
$$

它从边缘分布 \(q_t(x)\) 采样。来自式 (9) 中 Gibbs 倾斜边缘分布 \(p_t(x\mid O=1)\propto q_t(x)\exp\bigl(\beta_t\mathcal J(x)\bigr)\) 的样本可按如下 SDE 模拟：

$$
dx_t = \Bigl(-f_t(x_t) + \sigma_t^2\nabla\log q_t(x_t) + \beta_t\frac{\sigma_t^2}{2}\nabla\mathcal J(x_t)\Bigr)dt + \sigma_t\,dW_t,\tag{11a}
$$

$$
dw_t = \left[\frac{\partial\beta_t}{\partial t}\mathcal J(x) + \left\langle\beta_t\nabla\mathcal J(x),\ \frac{\sigma_t^2}{2}\nabla\log q_t(x) - f_t(x)\right\rangle\right]dt.\tag{11b}
$$

³ 这些连续时间动力学/PDE 可以方便地用任意合适的数值积分格式（例如 Euler–Maruyama 离散化）离散化并模拟。

### 4.2 引导流匹配策略满足优化问题

读者可能注意到，只有式 (3) 中的（逆时）扩散 SDE 符合式 (10) 所定义的那类 SDE。若天真地把流 ODE \(dx=-v_{1-t}(x)\,dt\) 与式 (10) 等同，就相当于令 \(\sigma_t=0\)，此时定理 4.1 中的漂移引导会消失（而重加权仍然有效）：漂移中的 \(\nabla\mathcal J\) 修正与权重演化中的得分修正都会恒等地消失。

值得注意的是，按照 Singh 与 Fischer [16]，把这个确定性流重新表述为一个具有相同边缘密度的等价随机过程，即可绕过这一限制。具体而言，对任意标量函数 \(\tilde\sigma(t)\ge 0\)，流 ODE \(dx_t=-v(x_t,1-t)\,dt\) 与如下 SDE 族共享其时间边缘分布：

$$
dx_t = \left(-v(x_t,1-t) + \frac{\tilde\sigma^2(t)}{2}\nabla\log q_t(x_t)\right)dt + \tilde\sigma(t)\,dW_t,\tag{12}
$$

其中 \(\nabla\log q_t\) 是流边缘分布的得分；当 \(p_{\mathrm{src}}\) 为高斯时，该得分可由速度场本身以闭式得到（完整细节见附录 C）。式 (12) 现在与式 (10) 形式一致，只是扩散为 \(\tilde\sigma(t)\neq 0\)，因此我们可以直接应用定理 4.1 的 FKC 框架。

### 4.3 在受约束最优解上的集中性

一个自然的问题是：从式 (9) 的 Gibbs 倾斜后验采样，是否真的恢复了原受约束优化问题（式 (7)）的解？下述结果给出了肯定回答：当惩罚权重与逆温度 \(\beta\) 的幅度充分大时，后验会任意紧地集中在可行、接近最优的轨迹上。

**推论 4.2（在受约束最优解上的集中性；见附录 F 中命题 F.4）。** 对任意容差 \(\delta>0\)，存在常数 \(\varepsilon,C>0\)（依赖于惩罚权重 \(c\)），使得 Gibbs 倾斜后验满足

$$
\mathbb P_{p_{\beta,c}}\bigl(|h_1(x)|\le\delta,\ h_2(x)\le\delta,\ \mathcal L(x)\le\mathcal L^\star+\delta\bigr)\ \ge\ 1-Ce^{\beta\varepsilon/2}.\tag{13}
$$

也就是说，出现 \(\delta\)-不可行或 \(\delta\)-次优的概率随 \(\beta\to-\infty\) 指数衰减。

从本质上讲，\(\beta\) 调节的是我们相对于基座（数据）分布而言，对约束满足与代价最小化的加权强度。

### 4.4 有限粒子保证

推论 4.2 描述的是 Gibbs 后验的集中性。BayesFP 用一个有限的加权轨迹群来近似该后验。下述结果把粒子预算与“返回轨迹可行且接近最优”的概率联系起来。

**推论 4.3（有限粒子集中性；见附录 F 中定理 F.5）。** 考虑具有 \(K\) 个粒子的 BayesFP。固定 \(\delta>0\) 以及如推论 4.2 中的惩罚 \(c\)，再固定 \(\beta<0\)、\(N\) 步的数值网格，以及与 \(K\) 无关的确定性重采样时间表。令 \(X_{\mathrm{out}}^{K}\) 表示用最终归一化粒子权重选出的轨迹。则存在有限常数 \(B_N\ge 0\) 与 \(d_N\)（均与 \(K\) 无关），使得

$$
\mathbb P\bigl(|h_1(X_{\mathrm{out}}^{K})|\le\delta,\ h_2(X_{\mathrm{out}}^{K})\le\delta,\ \mathcal L(X_{\mathrm{out}}^{K})\le\mathcal L^\star+\delta\bigr)\ \ge\ 1-Ce^{\beta\varepsilon/2}-d_N-\frac{B_N}{K}.\tag{14}
$$

该概率包含全部粒子系统随机性以及最终轨迹选择。对于固定的温度、惩罚、网格与重采样时间表，有限粒子对界中贡献的那一项随 \(K^{-1}\) 下降。

## 5 实验与结果

本节对所提方法进行分析与验证。虽然我们的框架适用于任何可表达为式 (7) 或式 (1) 形式的问题，但在动机与经验验证上我们聚焦于若干实践上重要的情形：**(1)** 通过在推理时引入碰撞约束，我们的方法能否提升预训练视觉–语言–动作（Vision-Language-Action, VLA）模型（如 GR00T-N1.6 [24] 或 π0.5 [25]）的性能？此外，我们的方法能否绕开非凸障碍物进行规划？**(2)** 我们的方法与其他基线相比如何？

**基线。** 我们与覆盖推理时受约束生成三大类别的三个基线比较。**线性组合引导（Linear-Combination Guidance）：** 一个简单基线，把增广代价 \(\mathcal J(x)\) 的梯度加到无约束生成信号上：对扩散策略为 \(\nabla\log q_t(x)+\lambda_t\nabla\mathcal J(x)\)，对流策略为 \(v_t(x)+\lambda_t\nabla\mathcal J(x)\)。它简单，但对测度变化没有任何有原则的修正；不过它是基于流/扩散的生成式策略中极为有效的引导方法（例如 OmniGuide [26]、Inference-Time Policy Steering 中的 Guided Diffusion [27]）常用的选择。**CASF [28]：** 约束感知流模型（Constraint-Aware Streaming Flow）把每个约束表示为可微距离函数，并将其转化为黎曼度量，从而在约束边界附近局域地重塑学到的速度场。⁴ **JM2D [14]：** 联合的基于模型—无模型扩散（Joint Model-based Model-free Diffusion）把受约束规划表述为对 \((x,k)\) 的联合采样，其中 \(k\) 是辅助优化模块的输出，并通过交互势 \(V(x,k)\) 促进相容性。联合得分在每个逆步上通过对去噪样本做重要性采样来近似。⁵

我们还要指出，JM2D 在其原始评估中已直接与若干密切相关的受约束扩散规划器（包括 SafeDiffuser [10]、DPCC [11]、MPD [29] 等）做了基准比较。因此我们这里把 JM2D 作为强代表性基线，并请读者参阅 Jung et al. [14]（JM2D）以获得与这些方法更广泛的比较。

⁴ CASF 是流专用的，**不能**用于扩散策略；我们只在流设置中评估它。  
⁵ JM2D 最初是为扩散提出的；对流量策略，我们先把流转换为等价 SDE（附录 C），再把 JM2D 应用于所得 SDE。

### 5.1 仿真中的避碰

**表 1：跨仿真任务的碰撞率（↓）与成功率（↑，单位 %）；每个任务的最优值加粗。** 对 π0.5，碰撞率按每时间步而非每轨迹报告，因为零样本评估会产生很高的碰撞率。

| 策略 | 任务 | 碰撞率↓ 无引导 | 线性组合 | CASF | JM2D | **BayesFP（本文）** | 成功率↑ 无引导 | 线性组合 | CASF | JM2D | **BayesFP（本文）** |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Diffusion Policy | Can + 圆柱障碍 | 30% | 2% | n/a | 2% | **0%** | **96%** | **96%** | n/a | **96%** | **96%** |
| Diffusion Policy | Transport + 圆柱障碍 | 94% | **4%** | n/a | 6% | **4%** | 12% | **38%** | n/a | **46%** | **56%** |
| GR00T-N1.6 | LIBERO-Obj. + 圆柱障碍 | 100% | 2% | 4% | **0%** | **0%** | 58% | 72% | 76% | **84%** | **84%** |
| GR00T-N1.6 | LIBERO-Obj. + V 形障碍 | 48% | 43% | 44% | 25% | **14%** | 42% | 72% | 69% | **75%** | **75%** |
| π0.5 | FoodPacking2Cans | 4.7% | 2.3% | **0.9%** | 2.7% | 3.0% | 14% | 22% | 8% | 22% | **28%** |
| π0.5 | BBQSauceInBin | 20.2% | 19.1% | 18.0% | 19.0% | **17.9%** | 8% | 8% | 8% | 13% | **16%** |
| π0.5 | HammersInLeftBin | 4.1% | 3.9% | 3.4% | 3.2% | **2.8%** | 13% | 27% | 15% | 28% | **36%** |
| π0.5 | TakeMugsOffOfShelf | **1.1%** | 7.7% | 4.2% | 7.1% | 9.9% | 0% | 2% | 1% | 6% | **10%** |

本节所有实验中，我们都通过在机器人本体上采样点、并对那些采样本体点落入障碍区域的轨迹施加惩罚来实施碰撞约束。下面各实验的唯一区别在于该障碍区域如何指定。在前两个情形（Diffusion Policy、GR00T-N1.6）中，我们假定可以访问障碍物的真值位姿与尺寸，障碍区域直接由该几何定义。在 π0.5 的情形中，我们不假定任何此类访问；取而代之，我们在线构建环境的**有符号距离函数（signed distance function, SDF）**[30]，把每一个不是操作或抓取目标的对象视为可碰撞障碍，并把障碍区域定义为该 SDF 的零水平集。

**引导扩散策略。** 我们首先在原始扩散策略上做实验，展示本方法能在完全不重训的情况下对预训练模型施加碰撞约束。我们考虑两个复杂度递增的设置。第一，在图 1 中我们给出两个示例性实验，突出 Gibbs 倾斜后验采样器在碰撞约束下的定性行为，包括绕开非凸障碍物进行规划的情形。第二，我们向 RoboMimic [31] 的 **Can** 与 **Transport** 任务中再加入一个圆柱形障碍，同样使用 Chi et al. [2] 的预训练扩散策略检查点；结果汇总于表 1，场景可视化于图 2。本小节所有实验中，策略预测的是**世界坐标系下的末端执行器位置轨迹**（即绝对笛卡尔位姿）。

**引导 GR00T-N1.6。** 我们在 **LIBERO 物体任务** [32] 上微调 GR00T-N1.6 [24]，然后在两个不同的推理时设置下评估：一个引入半透明圆柱形障碍物；另一个引入由两条粗臂以一定角度连接而成的半透明非凸 V 形障碍物（在 XY 平面内为“V”形，沿 Z 轴延长）。该策略输出世界坐标系下的末端执行器动作增量。定量结果见表 1，场景可视化于图 2。

**图 2（原文 Fig. 2）：** RoboMimic 与 LIBERO 任务的场景可视化。(a) Robomimic Can 任务；(b) Robomimic Transport 任务；(c) LIBERO-Obj. + 圆柱障碍；(d) LIBERO-Obj. + V 形障碍。

**引导 π0.5。** 我们使用在 DROID 数据集 [33] 上微调过的预训练 π0.5 [25] 检查点，并在 π0.5 训练中从未见过的四个 RoboLab [34] 基准任务上评估它：FoodPacking2CansTask、BBQSauceInBinTask、HammersInLeftBinTask 与 TakeMugsOffOfShelfTask。这里策略输出关节位置指令，而非前面实验中的末端执行器位姿或增量。定量结果见表 1，场景可视化于图 3。

**图 3（原文 Fig. 3）：** RoboLab 任务的场景可视化。(a) FoodPacking2CansTask；(b) BBQSauceInBinTask；(c) HammersInLeftBinTask；(d) TakeMugsOffOfShelfTask。

### 5.2 真实世界实验

**图 4（原文 Fig. 4）：** 真实世界任务的场景可视化。(a) PickAndPlace；(b) BimodalMugSelection。

**表 2：真实世界结果。**

| 指标 | 无引导 | BayesFP |
|---|---:|---:|
| **PickAndPlace** | | |
| 碰撞率 ↓ | 98% | **6%** |
| 成功率 ↑ | 100% | **100%** |
| **BimodalMugSelection** | | |
| 正确杯子率 ↑ | 72% | **100%** |
| 成功率 ↑ | 64% | **92%** |

我们另在 SO101 机械臂 [35] 上做了两个真实世界实验，每个实验只用 20 条演示微调 π0.5：**(i)** 一个 **PickAndPlace** 任务，把物体放入碟子，推理时引入一个杯子作为障碍；(ii) 一个 **BimodalMugSelection** 任务，其训练数据把物体放入两个杯子（左、右）之一，但在推理时我们用语言条件指定右杯，并施加一个禁止左侧的推理时约束。所有任务的定量结果见表 2，场景可视化于图 4。

## 6 讨论与消融

**消融。** 我们消融采样器的两个旋钮（图 5）。增加 FK 粒子数 \(K\) 会随 SNIS 估计器变紧而提升成功率，但增益在 \(K\approx 4\) 时饱和。增大 \(|\beta|\) 会单调降低约束违反，与式 (13) 所预测的指数集中一致。

**图 5（原文 Fig. 5）：** 在 LIBERO-Object 上、带半径 0.04 m 圆柱障碍的消融实验。\(\bar P\) 是附录 G.2 定义的约束违反度量。(a) 粒子数 \(K\)：此处增益在 \(K=4\) 时饱和，但对非凸障碍与真实世界任务我们推荐 \(K\ge 8\)。(b) 引导强度 \(|\beta|\)：违反量按式 (13) 预测指数衰减。（左图纵轴：平均总穿透 \(\bar P\)（m）；横轴：粒子数 2–64。右图横轴：引导强度 \(\beta\)（\(10^0\)–\(10^5\)，对数刻度）；图例为不等式惩罚 \(c_2=1,10,100,1000,10000,100000\)。）

**重叠假设。** 我们的加权 SDE（式 (11)）把代价感知漂移（式 (11a)）与 FK 重加权项（式 (11b)）结合起来；仅代价感知漂移就等同于线性组合引导，而正是重加权使该过程成为一个有原则的后验采样器。这预设了 \(p_{\mathrm{data}}\) 与 \(\exp(\beta\mathcal J)\) 有重叠。当二者不重叠时，式 (11b) 携带的信号很少，动力学退化为式 (11a)，于是我们的方法优雅地退化为线性组合，并可能因此产生落在已学习数据分布之外的样本。在缺乏重叠时这一行为不可避免：不存在既在 \(p_{\mathrm{data}}\) 下有可观概率、又满足指定优化目标的轨迹。

**整轨迹采样 vs. 事后推挤。** 表 1 中 Transport 的增益并不纯粹是碰撞效应：圆柱被放在双臂交接点，而事后基于梯度的方法常常把两条臂推到障碍物的**相反两侧**，从而破坏交接。由于我们是从后验中对整条轨迹采样，双臂运动的联合可行性在群体层面得以强制。群体层面的重加权使我们的方法能统一处理凸与非凸障碍（图 1、表 1 中的 V 形）；JM2D 也能通过其辅助模块在一定程度上处理非凸几何，而纯梯度基线则很吃力。对 π0.5 而言，把场景编码为在线 SDF、把每个非目标物体与桌面都视为可碰撞，除了避碰之外还带来两个附带好处：更少的错误抓取与更少的撞桌。

## 7 局限与未来工作

**局限。** 相对于原始扩散或流采样，我们的方法有三个主要局限。第一，虽然 FK 粒子可在 GPU 上并行模拟、且重加权步骤的额外开销可忽略，但用于评估碰撞惩罚 \(\mathcal J\) 的 SDF 构建本质上是串行的，且必须在每个重规划步骤重做。实践中这相对基座策略带来 1.25–2× 的减速（例如 π0.5 约 30 Hz，我们约 15 Hz）；当策略输出关节位置、必须对正运动学求导才能把动作映射到笛卡尔空间时，减速增大到 1.5–2×。第二，FKC 加权 SDE 在概念上更重，实现也比朴素的线性组合引导方案更难。最后，增广代价函数 \(\mathcal J\) 必须（几乎）可微。

**未来工作。** 我们的实验聚焦于碰撞约束，而引导质量最终取决于约束表示的保真度；诸如 OmniGuide [26] 那样更丰富的 SDF 构造是自然的即插即用替代。更广泛地说，我们的框架并不专用于碰撞：它可以用任何可微代价来实例化，这为把近期一系列推理时引导目标——语义接地与人类演示吸引子 [26]，以及点、草图与物理修正输入 [27]——扩展到有原则的后验采样处理打开了大门。最后，把保持边缘分布的 SDE 构造应用于流式流策略（streaming flow policies）[5]，将把 FKC 式引导扩展到响应式闭环控制所需的低延迟区间。

## 参考文献

（条目保留英文原文与原文编号。）

[1] M. Janner, Y. Du, J. Tenenbaum, and S. Levine. Planning with diffusion for flexible behavior synthesis. In International Conference on Machine Learning (ICML), 2022.

[2] C. Chi, Z. Xu, S. Feng, E. Cousineau, Y. Du, B. Burchfiel, R. Tedrake, and S. Song. Diffusion policy: Visuomotor policy learning via action diffusion. The International Journal of Robotics Research, 2024.

[3] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le. Flow matching for generative modeling. In International Conference on Learning Representations (ICLR), 2023.

[4] S. Ye and M. C. Gombolay. Efficient trajectory forecasting and generation with conditional flow matching. In IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS). IEEE, 2024.

[5] S. Jiang, X. Fang, N. Roy, T. Lozano-Pérez, L. P. Kaelbling, and S. Ancha. Streaming flow policy: Simplifying diffusion / flow-matching policies by treating action trajectories as flow trajectories. In Conference on Robot Learning (CoRL), 2025.

[6] N. Ratliff, M. Zucker, J. A. Bagnell, and S. Srinivasa. Chomp: Gradient optimization techniques for efficient motion planning. In IEEE International Conference on Robotics and Automation (ICRA). IEEE, 2009.

[7] J. Schulman, J. Ho, A. X. Lee, I. Awwal, H. Bradlow, and P. Abbeel. Finding locally optimal, collision-free trajectories with sequential convex optimization. In Robotics: science and systems, 2013.

[8] A. D. Ames, S. Coogan, M. Egerstedt, G. Notomista, K. Sreenath, and P. Tabuada. Control barrier functions: Theory and applications. In 18th European Control Conference (ECC), 2019.

[9] P. Dhariwal and A. Nichol. Diffusion models beat gans on image synthesis. Advances in Neural Information Processing Systems (NeurIPS), 2021.

[10] W. Xiao, T.-H. Wang, C. Gan, R. Hasani, M. Lechner, and D. Rus. Safediffuser: Safe planning with diffusion probabilistic models. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=ig2wk7kK9J.

[11] R. Römer, A. v. Rohr, and A. Schoellig. Diffusion predictive control with constraints. In Proceedings of the 7th Annual Learning for Dynamics & Control Conference, Proceedings of Machine Learning Research, 2025.

[12] A. Lou and S. Ermon. Reflected diffusion models. In International Conference on Machine Learning (ICML). PMLR, 2023.

[13] G.-H. Liu, T. Chen, E. Theodorou, and M. Tao. Mirror diffusion models for constrained and watermarked generation. Advances in Neural Information Processing Systems (NeurIPS), 2023.

[14] W. Jung, U. A. Mishra, N. R. Arachchige, Y. Chen, D. Xu, and S. Kousik. Joint model-based model-free diffusion for planning with constraints. In 9th Annual Conference on Robot Learning, 2025. URL https://openreview.net/forum?id=E9t1ekt6W9.

[15] M. Skreta, T. Akhound-Sadegh, V. Ohanesian, R. Bondesan, A. Aspuru-Guzik, A. Doucet, R. Brekelmans, A. Tong, and K. Neklyudov. Feynman-kac correctors in diffusion: Annealing, guidance, and product of experts. In Forty-second International Conference on Machine Learning, 2025. URL https://openreview.net/forum?id=Vhc0KrcqWu.

[16] S. Singh and I. Fischer. Stochastic sampling from deterministic flow models, 2024. URL https://arxiv.org/abs/2410.02217.

[17] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[18] M. Braun, N. Jaquier, L. Rozo, and T. Asfour. Riemannian flow matching policy for robot motion learning, 2024. URL https://arxiv.org/abs/2403.10672.

[19] X. Liu, C. Gong, and Q. Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. arXiv preprint arXiv:2209.03003, 2022.

[20] C. A. Naesseth, F. Lindsten, and T. B. Schön. Elements of sequential monte carlo. Foundations and Trends in Machine Learning, 12(3):187–306, 11 2019. ISSN 1935-8237. doi:10.1561/2200000074. URL https://doi.org/10.1561/2200000074.

[21] A. Lambert, A. Fishman, D. Fox, B. Boots, and F. Ramos. Stein variational model predictive control, 2021. URL https://arxiv.org/abs/2011.07641.

[22] S. Levine. Reinforcement learning and control as probabilistic inference: Tutorial and review. CoRR, abs/1805.00909, 2018. URL http://arxiv.org/abs/1805.00909.

[23] K. Rawlik, M. Toussaint, and S. Vijayakumar. On stochastic optimal control and reinforcement learning by approximate inference. In Twenty-Third International Joint Conference on Artificial Intelligence, 2013.

[24] NVIDIA, :, J. Bjorck, F. Castañeda, N. Cherniadev, X. Da, R. Ding, L. J. Fan, Y. Fang, D. Fox, F. Hu, S. Huang, J. Jang, Z. Jiang, J. Kautz, K. Kundalia, L. Lao, Z. Li, Z. Lin, K. Lin, G. Liu, E. Llontop, L. Magne, A. Mandlekar, A. Narayan, S. Nasiriany, S. Reed, Y. L. Tan, G. Wang, Z. Wang, J. Wang, Q. Wang, J. Xiang, Y. Xie, Y. Xu, Z. Xu, S. Ye, Z. Yu, A. Zhang, H. Zhang, Y. Zhao, R. Zheng, and Y. Zhu. Gr00t n1: An open foundation model for generalist humanoid robots, 2025. URL https://arxiv.org/abs/2503.14734.

[25] P. Intelligence, K. Black, N. Brown, J. Darpinian, K. Dhabalia, D. Driess, A. Esmail, M. Equi, C. Finn, N. Fusai, M. Y. Galliker, D. Ghosh, L. Groom, K. Hausman, B. Ichter, S. Jakubczak, T. Jones, L. Ke, D. LeBlanc, S. Levine, A. Li-Bell, M. Mothukuri, S. Nair, K. Pertsch, A. Z. Ren, L. X. Shi, L. Smith, J. T. Springenberg, K. Stachowicz, J. Tanner, Q. Vuong, H. Walke, A. Walling, H. Wang, L. Yu, and U. Zhilinsky. π0.5: a vision-language-action model with open-world generalization, 2025. URL https://arxiv.org/abs/2504.16054.

[26] Y. Song, L. Le, Y.-H. Park, J. Wang, J. Shi, L. Liu, J. Gu, E. Eaton, D. Jayaraman, and K. Daniilidis. Omniguide: Universal guidance fields for enhancing generalist robot policies, 2026. URL https://arxiv.org/abs/2603.10052.

[27] Y. Wang, L. Wang, Y. Du, B. Sundaralingam, X. Yang, Y.-W. Chao, C. Perez-D'Arpino, D. Fox, and J. Shah. Inference-time policy steering through human interactions, 2025. URL https://arxiv.org/abs/2411.16627.

[28] J. Long, D. Liu, W. Cai, I. Manchester, and W. Zhi. Constraining streaming flow models for adapting learned robot trajectory distributions, 2026. URL https://arxiv.org/abs/2602.15567.

[29] J. Carvalho, A. Le, P. Kicki, D. Koert, and J. Peters. Motion planning diffusion: Learning and adapting robot motion planning with diffusion models. arXiv preprint arXiv:2412.19948, 2024.

[30] A. Millane, H. Oleynikova, E. Wirbel, R. Steiner, V. Ramasamy, D. Tingdahl, and R. Siegwart. nvblox: Gpu-accelerated incremental signed distance field mapping, 2024. URL https://arxiv.org/abs/2311.00626.

[31] A. Mandlekar, D. Xu, J. Wong, S. Nasiriany, C. Wang, R. Kulkarni, L. Fei-Fei, S. Savarese, Y. Zhu, and R. Martín-Martín. What matters in learning from offline human demonstrations for robot manipulation. In 5th Annual Conference on Robot Learning, 2021. URL https://openreview.net/forum?id=JrsfBJtDFdI.

[32] B. Liu, Y. Zhu, C. Gao, Y. Feng, Q. Liu, Y. Zhu, and P. Stone. Libero: Benchmarking knowledge transfer for lifelong robot learning, 2023. URL https://arxiv.org/abs/2306.03310.

[33] A. Khazatsky, K. Pertsch, S. Nair, A. Balakrishna, S. Dasari, S. Karamcheti, S. Nasiriany, M. K. Srirama, L. Y. Chen, K. Ellis, P. D. Fagan, J. Hejna, M. Itkina, M. Lepert, Y. J. Ma, P. T. Miller, J. Wu, S. Belkhale, S. Dass, H. Ha, A. Jain, A. Lee, Y. Lee, M. Memmel, S. Park, I. Radosavovic, K. Wang, A. Zhan, K. Black, C. Chi, K. B. Hatch, S. Lin, J. Lu, J. Mercat, A. Rehman, P. R. Sanketi, A. Sharma, C. Simpson, Q. Vuong, H. R. Walke, B. Wulfe, T. Xiao, J. H. Yang, A. Yavary, T. Z. Zhao, C. Agia, R. Baijal, M. G. Castro, D. Chen, Q. Chen, T. Chung, J. Drake, E. P. Foster, J. Gao, V. Guizilini, D. A. Herrera, M. Heo, K. Hsu, J. Hu, M. Z. Irshad, D. Jackson, C. Le, Y. Li, K. Lin, R. Lin, Z. Ma, A. Maddukuri, S. Mirchandani, D. Morton, T. Nguyen, A. O'Neill, R. Scalise, D. Seale, V. Son, S. Tian, E. Tran, A. E. Wang, Y. Wu, A. Xie, J. Yang, P. Yin, Y. Zhang, O. Bastani, G. Berseth, J. Bohg, K. Goldberg, A. Gupta, A. Gupta, D. Jayaraman, J. J. Lim, J. Malik, R. Martín-Martín, S. Ramamoorthy, D. Sadigh, S. Song, J. Wu, M. C. Yip, Y. Zhu, T. Kollar, S. Levine, and C. Finn. Droid: A large-scale in-the-wild robot manipulation dataset, 2025. URL https://arxiv.org/abs/2403.12945.

[34] X. Yang, R. Dagli, A. Zook, H. Hadfield, A. Goyal, S. Birchfield, F. Ramos, and J. Tremblay. Robolab: A high-fidelity simulation benchmark for analysis of task generalist policies, 2026. URL https://arxiv.org/abs/2604.09860.

[35] TheRobotStudio and H. Face. Standard Open SO-100 & SO-101 Arms. https://github.com/TheRobotStudio/SO-ARM100.

[36] S. H. Høeg, Y. Du, and O. Egeland. Fast policy synthesis with variable noise diffusion models. In IEEE International Conference on Robotics and Automation (ICRA). IEEE, 2025.

[37] R. Mishra and I. R. Manchester. Eb-mbd: Emerging-barrier model-based diffusion for safe trajectory optimization in highly constrained environments. In IEEE International Conference on Robotics and Automation (ICRA). IEEE, 2026.

[38] M. Uehara, Y. Zhao, T. Biancalani, and S. Levine. Understanding reinforcement learning-based fine-tuning of diffusion models: A tutorial and review. arXiv preprint arXiv:2407.13734, 2024.

[39] L. Wu, B. Trippe, C. Naesseth, D. Blei, and J. Cunningham. Practical and asymptotically exact conditional sampling in diffusion models. In A. Oh, T. Naumann, A. Globerman, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems, volume 36, pages 31372–31403. Curran Associates, Inc., 2023. doi:10.52202/075280-1363. URL https://proceedings.neurips.cc/paper_files/paper/2023/file/63e8bc7bbf1cfea36d1d1b6538aecce5-Paper-Conference.pdf.

[40] G. V. Cardoso, Y. J. El Idrissi, S. Le Corff, and E. Moulines. Monte Carlo guided diffusion for Bayesian linear inverse problems. In International Conference on Learning Representations, 2024.

[41] R. Singhal, Z. Horvitz, R. Teehan, M. Ren, Z. Yu, K. McKeown, and R. Ranganath. A general framework for inference-time scaling and steering of diffusion models, 2025. URL https://arxiv.org/abs/2501.06848.

[42] K. Mark, L. Galustian, M. P. P. Kovar, and E. Heid. Feynman-kac-flow: Inference steering of conditional flow matching to an energy-tilted posterior, 2025. URL https://arxiv.org/abs/2509.01543.

[43] R. Douc and O. Cappé. Comparison of resampling schemes for particle filtering. In ISPA 2005. Proceedings of the 4th International Symposium on Image and Signal Processing and Analysis, pages 64–69, 2005.

[44] S. N. Ethier and T. G. Kurtz. Markov Processes: Characterization and Convergence. John Wiley & Sons, 2009.

[45] P. Del Moral. Mean Field Simulation for Monte Carlo Integration. Chapman and Hall, CRC press, 2013.

[46] M. Rousset and G. Stoltz. Equilibrium sampling from nonequilibrium dynamics. Journal of Statistical Physics, 123:1251–1272, 2006.

[47] L. Angeli. Interacting particle approximations of Feynman-Kac measures for continuous-time jump processes. PhD thesis, University of Warwick, 2020.

[48] L. Angeli, S. Grosskinsky, A. M. Johansen, and A. Pizzoferrato. Rare event simulation for stochastic dynamics in continuous time. Journal of Statistical Physics, 176(5):1185–1210, 2019.

[49] A. V. Fiacco and G. P. McCormick. Nonlinear Programming. Society for Industrial and Applied Mathematics, 1990. doi:10.1137/1.9781611971316. URL https://epubs.siam.org/doi/abs/10.1137/1.9781611971316.

[50] D. Bertsekas. Nonlinear Programming. 01 2003.

[51] A. Dembo and O. Zeitouni. Large Deviations Techniques and Applications, volume 38 of Stochastic Modelling and Applied Probability. Springer, Berlin, Heidelberg, 2 edition, 2010. ISBN 978-3-642-03311-7. doi:10.1007/978-3-642-03311-7. URL https://doi.org/10.1007/978-3-642-03311-7.

[52] C.-R. Hwang. Laplace's Method Revisited: Weak Convergence of Probability Measures. The Annals of Probability, 8(6):1177–1182, 1980. doi:10.1214/aop/1176994579. URL https://doi.org/10.1214/aop/1176994579.

[53] P. Del Moral, A. Doucet, and G. W. Peters. Sharp propagation of chaos estimates for feynman–kac particle models. Theory of Probability & Its Applications, 51(3):459–485, 2007. doi:10.1137/S0040585X97982529. URL https://doi.org/10.1137/S0040585X97982529.

[54] M. Gerber, N. Chopin, and N. Whiteley. Negative association, ordering and convergence of resampling methods. The Annals of Statistics, 47(4):2236–2260, 2019. doi:10.1214/18-AOS1746. URL https://arxiv.org/abs/1707.01845.

[55] B. Sprungk. On the local Lipschitz stability of Bayesian inverse problems. Inverse Problems, 36(5):055015, 2020. doi:10.1088/1361-6420/ab6f43. URL https://arxiv.org/abs/1906.07120.

[56] F. Giraud and P. Del Moral. Nonasymptotic analysis of adaptive and annealed Feynman–Kac particle models. Bernoulli, 23(1):670–709, 2017. doi:10.3150/14-BEJ680. URL https://arxiv.org/abs/1209.5654.

[57] P. Del Moral, P. E. Jacob, A. Lee, L. M. Murray, and G. W. Peters. Feynman–Kac particle integration with geometric interacting jumps. Stochastic Analysis and Applications, 31(5):830–871, 2013. doi:10.1080/07362994.2013.817247. URL https://arxiv.org/abs/1211.7191.

## 附录目录（原文 Appendix Contents）

| 附录 | 标题 | 页 |
|---|---|---:|
| A | 相关工作（Related Work） | 14 |
| B | 补充背景（Additional Background） | 15 |
| C | 从确定性流到等价 SDE（From Deterministic Flow to Equivalent SDE） | 17 |
| D | 重采样方法（Resampling Methods） | 18 |
| E | BayesFP 算法（The BayesFP Algorithm） | 19 |
| F | 理论结果与证明（Theoretical Results and Proofs） | 21 |
| G | 实验细节（Experimental Details） | 34 |
| H | 记号（Notation） | 38 |

## 附录 A 相关工作

**生成式机器人策略。** 模仿学习已逐步从确定性行为克隆转向有表现力的生成模型。基于扩散的策略 [1, 2, 36] 通过表示多模态动作分布展示了很强性能；而更新的流匹配表述 [3, 4, 5] 在保持这种表现力的同时，通过确定性输运降低了推理延迟。我们的方法对以其中哪一种作为基座策略不作假定。

**推理时引导生成。** 越来越多的工作试图在推理时对预训练生成式策略施加约束。**事后**方法用轨迹优化 [6, 7] 或控制论安全滤波器 [8] 对生成的轨迹做投影或滤波，但把生成与修正解耦，常常产生分布外输出。**生成式引导**方法直接偏置采样过程，方式包括基于分类器的引导 [9]、基于控制屏障函数的引导 [10]、投影 [11]、反射动力学 [12, 13] 或渐进屏障（progressive barriers）[37]。与我们的工作最接近的是 JM2D [14]：它把受约束规划表述为对无模型扩散变量与辅助的基于模型变量的联合采样，并用交互势鼓励二者相容。虽然 JM2D 相对投影是更有原则的一步，但其目标分布定义在增广对 \((x,k)\) 上，且其实用采样器依赖对联合得分的蒙特卡洛近似，外加对不可行样本的最终基于模型的修复步骤。相比之下，我们把受约束生成直接表述为对预训练策略所学轨迹分布的后验采样，并有显式的费曼–卡茨密度演化与加权 SDE 采样器。这避免了引入辅助的基于模型的变量或事后投影算子，并且统一适用于扩散策略与流策略。

ITPS [27] 通过人类交互（点、草图、物理修正）引导扩散策略，并引入两个扩散专用采样器：Guided Diffusion（GD）——它恰好是线性组合更新，因而从策略分布与目标分布的**和**而非**积**中采样；以及 Stochastic Sampling（SS）——它通过退火无调整 Langevin（ULA）MCMC 瞄准该乘积，在**每一个**去噪噪声水平上运行 \(M\) 步内层 Langevin 步，这一过程把每个逆步的代价乘以 \(M\)，因而实践中昂贵。OmniGuide [26] 通过同样的线性组合更新 \(v(x)+\lambda\nabla E(x)\)，把碰撞、语义与人类演示线索聚合成面向 VLA 的吸引/排斥能量场（\(E\)），因而继承了 GD 的“分布之和”局限。相比之下，我们的费曼–卡茨加权 SDE 携带由代价倾斜后验的福克–普朗克 PDE 导出的显式重要性权重，每个逆步只需一次网络评估（\(K\) 个 FK 粒子在 GPU 上并行模拟），并通过附录 C 的保持边缘分布 SDE 重述，统一扩展到扩散策略与流匹配策略。

**面向扩散与流模型的费曼–卡茨方法。** 费曼–卡茨校正器 [15] 最近被提出作为扩散模型推理时控制的有原则框架，应用于退火、无分类器引导与专家乘积。序贯蒙特卡洛技术同样被用于扩散模型中的回报引导生成 [38]、条件生成 [39] 与逆问题 [40]。我们把这一机制带到机器人的受约束模仿学习，并通过 Singh 与 Fischer [16] 的保持边缘分布 SDE 构造把它扩展到流匹配策略。Singhal et al. [41] 同期提出费曼–卡茨引导（Feynman–Kac steering），这是一个相关但不同的框架：它使用离散时间的 FK 势，并结合 SMC 式粒子重采样，用于图像与文本扩散模型中的回报引导推断；相比之下，我们采用连续时间 FK PDE 表述，导出带有显式代价感知漂移修正的加权 SDE，其目标是跨越扩散与流匹配两类策略的受约束机器人轨迹生成。Feynman-Kac-Flow（Mark et al. [42]）把 Singhal et al. [41] 的离散时间 FK 引导应用于流匹配。它的漂移项未作修改，倾斜完全由 SMC 重采样承担，其势来自启发式的一次性端点估计。我们则使用连续时间 FK PDE，它把倾斜拆分为显式的代价感知漂移与由福克–普朗克 PDE 以闭式导出的权重更新，后者在每个 \(t\) 上都精确。

## 附录 B 补充背景

### B.1 输运方程（针对密度）

式 (3) 描述的是模拟单条轨迹的过程，但我们也可以用偏微分方程（PDE）刻画整个样本分布 \(p_t(x)\)⁶ 的时间演化。下面描述三个将成为我们推导核心的基本 PDE，各捕捉密度随时间演化的一种不同机制。

**（1）连续性方程。** 当样本按漂移为 \(v_t\) 的确定性流演化时，相应密度按连续性方程演化：

$$
dx_t = v_t(x_t)\,dt\ \Longrightarrow\ \frac{\partial p_t^{\mathrm{ode}}(x)}{\partial t} = -\bigl\langle\nabla,\ p_t^{\mathrm{ode}}(x)\,v_t(x)\bigr\rangle,\tag{15}
$$

其中 \(p_t^{\mathrm{ode}}\) 表示纯粹在确定性流下演化的密度。直观地说，该方程表明概率质量由漂移 \(v_t\) 输运，既无产生也无湮灭。

**（2）扩散方程。** 当样本经历扩散系数为 \(\sigma_t\) 的纯布朗运动时，密度按如下方程演化：

$$
dx_t = \sigma_t\,dW_t\ \Longrightarrow\ \frac{\partial p_t^{\mathrm{diff}}(x)}{\partial t} = \frac{\sigma_t^2}{2}\Delta p_t^{\mathrm{diff}}(x),\tag{16}
$$

其中 \(p_t^{\mathrm{diff}}\) 表示纯粹在随机扩散项下演化的密度。这不过是一个热方程，描述随机噪声如何逐步铺开概率质量。

由于式 (3) 中的去噪 SDE 同时包含确定性漂移与随机扩散两项，其密度的联合演化由**福克–普朗克方程（Fokker-Planck Equation）**支配，它是上述两种机制的叠加：

$$
\frac{\partial p_t^{\mathrm{sde}}(x)}{\partial t} = -\bigl\langle\nabla,\ p_t^{\mathrm{sde}}(x)\,v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta p_t^{\mathrm{sde}}(x).\tag{17}
$$

然而，仅有福克–普朗克方程不足以满足我们的需要：我们还需要一种**对样本重加权**的机制，这对模拟由正向加噪过程 \(p_{1-\tau}\) 所诱导之外的其他边缘分布序列至关重要（见附录 D）。这就引出第三类 PDE。

⁶ 本附录中，我们复用记号 \(p_t(\cdot)\) 指代任意一般边缘分布。它也可能表示正文中的边缘后验分布，但每当指后验时我们会显式说明。

**（3）重加权方程。** 当样本携带按样本位置 \(x_t\) 更新的时变对数权重 \(w_t\) 时，所得加权密度按如下方程演化：

$$
dw_t = \bar g_t(x_t)\,dt\ \Longrightarrow\ \frac{\partial p_t^{\mathrm{w}}(x)}{\partial t} = \bar g_t(x)\,p_t^{\mathrm{w}}(x),\qquad \bar g_t(x)=g_t(x)-\int g_t(x)\,p_t^{\mathrm{w}}(x)\,dx,\tag{18}
$$

其中 \(\bar g_t\) 中的中心化项保证归一化常数守恒，即 \(\int\bar g_t(x)p_t^{\mathrm{w}}(x)dx=0\)。

**费曼–卡茨公式。** 把三种机制——确定性漂移、随机扩散与样本重加权——合并，就得到**费曼–卡茨 PDE**，它支配加权密度 \(p_t^{\mathrm{FK}}\) 的演化：

$$
\frac{\partial p_t^{\mathrm{FK}}(x)}{\partial t} = -\bigl\langle\nabla,\ p_t^{\mathrm{FK}}(x)\,v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta p_t^{\mathrm{FK}}(x) + \bar g_t(x)\,p_t^{\mathrm{FK}}(x).\tag{19}
$$

为从 \(p_t^{\mathrm{FK}}\) 中抽取样本，模拟如下加权 SDE：

$$
dx_t = v_t(x_t)\,dt + \sigma_t\,dW_t,\qquad dw_t = \bar g_t(x_t)\,dt,\tag{20}
$$

然后用 \(w_t\) 对所得样本重加权。关键之处在于：\(p_t^{\mathrm{FK}}(x)\) 反映的是**加权**样本的密度，它一般不同于由式 (17) 的福克–普朗克 PDE 支配的未加权密度 \(p_t^{\mathrm{sde}}(x)\)——这一区别恰恰来自额外的重加权项 \(\bar g_t\)。

### B.2 输运、扩散与重加权之间的等价关系

上面引入的三种 PDE 机制——连续性、扩散与重加权——并不像它们各自表述所显示的那样彼此独立：只要能够访问（任何）精确的得分 \(\nabla\log p_t\)，每一种都可以用另外几种重新表达，从而得到共享相同边缘密度的不同模拟方案。我们在此记录三条相关恒等式，因为它们既支撑附录 C 中把流 ODE 重述为保持边缘分布的 SDE，也支撑定理 4.1（定理 F.3）证明中用到的得分插补步骤。

**扩散作为连续性。** 纯布朗扩散可以重新解释为得分驱动漂移下的确定性输运：

$$
\frac{\partial p_t(x)}{\partial t} = \frac{\sigma_t^2}{2}\Delta p_t(x) = -\left\langle\nabla,\ p_t(x)\left(-\frac{\sigma_t^2}{2}\nabla\log p_t(x)\right)\right\rangle\ \Longrightarrow\ dx_t = -\frac{\sigma_t^2}{2}\nabla\log p_t(x_t)\,dt.\tag{21}
$$

这恰好是与扩散方程相伴的概率流 ODE：对式 (21) 做确定性积分，所得边缘分布 \(p_t\) 与模拟 \(dx_t=\sigma_t\,dW_t\) 相同。

**连续性作为重加权。** 反过来，确定性输运可以完全吸收为对静止粒子的重加权，做法是把 \(p_t\) 从连续性方程中因子分解出来：

$$
\frac{\partial p_t(x)}{\partial t} = -\bigl\langle\nabla,\ p_t(x)v_t(x)\bigr\rangle = \left(-\frac{1}{p_t(x)}\bigl\langle\nabla,\ p_t(x)v_t(x)\bigr\rangle\right)p_t(x)
\ \Longrightarrow\ dw_t = -\Bigl(\bigl\langle\nabla,\ v_t(x_t)\bigr\rangle + \bigl\langle\nabla\log p_t(x_t),\ v_t(x_t)\bigr\rangle\Bigr)dt.\tag{22}
$$

在该方案下，粒子位置 \(x_t\) 保持不动，全部密度变化都由对数权重 \(w_t\) 承担。

**扩散作为重加权。** 同样的因子分解，结合恒等式 \(\Delta p_t=p_t\bigl(\Delta\log p_t+\|\nabla\log p_t\|^2\bigr)\)，表明扩散也可以直接折入权重：

$$
\frac{\partial p_t(x)}{\partial t} = \frac{\sigma_t^2}{2}\Delta p_t(x) = \frac{\sigma_t^2}{2}p_t(x)\bigl(\Delta\log p_t(x)+\|\nabla\log p_t(x)\|^2\bigr)
\ \Longrightarrow\ dw_t = \frac{\sigma_t^2}{2}\bigl(\Delta\log p_t(x_t)+\|\nabla\log p_t(x_t)\|^2\bigr)dt.\tag{23}
$$

把式 (22) 与式 (23) 合起来看，它们给出了一套构造性配方：在可访问得分 \(\nabla\log p_t\) 的前提下，把任意漂移 \(v_t\) 或扩散系数 \(\sigma_t\) 转换为等价的重加权项。正是这种可互换性，使费曼–卡茨校正器框架能够通过权重更新来补偿所模拟动力学与目标密度演化之间的任何不匹配，而不要求在漂移与扩散上精确一致。

## 附录 C 从确定性流到等价 SDE

本附录完整给出如何把一个确定性流匹配策略以随机方式模拟，同时保持其边缘密度序列。我们的推导遵循 Singh 与 Fischer [16]。

### C.1 一般设置

考虑如下形式的通用 Itô SDE

$$
dx = f_t(x)\,dt + G_t(x)\,dW_t,\tag{24}
$$

其中 \(f_t(x):\mathbb R^d\times[0,1]\to\mathbb R^d\) 是漂移，\(G_t(x):\mathbb R^d\times[0,1]\to\mathbb R^{d\times d}\) 是依赖于状态与时间的扩散系数，\(W_t\) 是标准维纳过程。式 (24) 解的边缘密度 \(p_t(x)\) 的时间演化由**福克–普朗克–柯尔莫哥洛夫（FPK）方程**描述：

$$
\frac{\partial p_t}{\partial t} = -\nabla\cdot[f_t\,p_t] + \frac{1}{2}\nabla\cdot\Bigl(\nabla\cdot[GG^{\top}p_t]\Bigr).\tag{25}
$$

注意确定性 ODE \(dx=v_t(x)dt\) 对应式 (24) 中 \(f\equiv v\)、\(G\equiv 0\) 的特例，此时式 (25) 退化为连续性方程 \(\partial_t p_t=-\nabla\cdot[v\,p_t]\)。

### C.2 共享同一边缘分布的一族 SDE

核心观察是：式 (25) 中的 FPK 方程并不唯一确定漂移与扩散。许多不同的漂移与扩散选择都能给出相同的边缘密度演化。下述定理把这一点明确化。

**定理 C.1（[16] 的定理 1）。** 设 \(p_t(x)\) 是式 (24) 中 SDE 的解的概率密度，并按式 (25) 演化。则对任意函数 \(\tilde G_t(x):\mathbb R^d\times[0,1]\to\mathbb R^{d\times d}\) 与 \(\gamma_t\ge 0\)，SDE

$$
dx = \bar f_t(x)\,dt + \bar G_t(x)\,dW_t\tag{26}
$$

容许相同的边缘密度 \(p_t(x)\)，其中

$$
\bar f = f - \frac{1}{2}\Bigl(\nabla\cdot[(1-\gamma_t)GG^{\top}-\tilde G\tilde G^{\top}] + [(1-\gamma_t)GG^{\top}-\tilde G\tilde G^{\top}]\nabla\log p_t\Bigr),\tag{27}
$$

$$
\bar G = \Bigl[\gamma_t GG^{\top} + \tilde G\tilde G^{\top}\Bigr]^{1/2},\tag{28}
$$

前提是所得 SDE 容许唯一解。

定理 C.1 给出了一套配方，用来构造与给定 SDE 或 ODE 共享相同边缘密度的整族 SDE。自由参数为：(i) 辅助扩散 \(\tilde G_t(x)\)，它注入原过程中不存在的额外随机性；(ii) 标量 \(\gamma_t\ge 0\)，它调节原扩散 \(G\) 的贡献。令 \(\gamma_t=1\)、\(\tilde G=0\) 即平凡地恢复原 SDE；而 \(\gamma_t=0\)、\(\tilde G=0\) 则给出相应的概率流 ODE（扩散被替换为得分驱动漂移）。

### C.3 特化到确定性流

我们关心的是确定性流 \(dx_t=-v_{1-t}(x_t)\,dt\)，它对应式 (24) 中取 \(f_t(x)=-v_{1-t}(x)\)、\(G\equiv 0\)。把这些代入定理 C.1，会消去所有依赖 \(G\) 的项，只留下辅助扩散 \(\tilde G\) 的自由度。取 \(\tilde G=\tilde\sigma(t)I\)（标量函数 \(\tilde\sigma_t\ge 0\)，即各向同性、与状态无关的噪声），得到如下特化。

**推论 C.2（[16] 的推论 1.2）。** 设 \(\{q_t(x)\}_{t\in[0,1]}\) 表示确定性流 \(dx_t=-v_{1-t}(x_t)dt\) 诱导的边缘密度。则对任意标量值函数 \(\tilde\sigma_t\ge 0\)，SDE

$$
dx_t = \left(-v_{1-t}(x_t) + \frac{\tilde\sigma_t^2}{2}\nabla\log q_t(x_t)\right)dt + \tilde\sigma_t\,dW_t\tag{29}
$$

容许相同的边缘密度 \(\{q_t(x)\}_{t\in[0,1]}\)。

式 (29) 中的扩散项 \(\tilde\sigma_t dW_t\) 通过布朗运动铺开概率质量，而漂移中额外的 \(\frac{\tilde\sigma_t^2}{2}\nabla\log q_t\) 项是一个基于得分的修正，恰好补偿这种铺开：它以保持边缘分布 \(q_t(x)\) 不变所需的速率把概率质量输运回高密度区域。两种效应精确平衡，因此尽管单条样本轨迹在 ODE 与 SDE 之间不同，它们在每个时刻 \(t\) 的分布仍完全相同。

函数 \(\tilde\sigma_t\) 是自由的设计选择。令 \(\tilde\sigma\equiv 0\) 恢复原确定性流，而更大的 \(\tilde\sigma\) 向模拟中注入更多随机性。Singh 与 Fischer [16] 给出的常见选择包括：

- **常数（Constant）：** \(\tilde\sigma_t=\alpha\)，其中 \(\alpha\ge 0\) 控制整体噪声尺度。
- **非奇异（Non-singular）：** \(\tilde\sigma_t=\alpha\sqrt{1-t}\)，避免在数据端点 \(t=1\) 处的奇异。
- **双端归零（Zero-ends）：** \(\tilde\sigma_t=\alpha\sqrt{t(1-t)}\)，在两个端点都消失。

### C.4 由速度场插补得分

式 (31)–(33)（编号按原文）使用的是模型时间；在生成时间中，\(\nabla\log q_t(x)=\nabla\log p_{1-t}(x)\)。

模拟式 (29) 需要评估流边缘分布的得分函数 \(\nabla\log q_t(x)\)。天真地看，这需要另外训练一个得分网络。然而，对于具有高斯源 \(p_{\mathrm{src}}=\mathcal N(0,I_d)\) 与线性插值 \(x_t=(1-t)x_{\mathrm{data}}+t\,x_{\mathrm{src}}\) 的标准整流流设置，该得分可以用学到的速度场本身以闭式表达。

**命题 C.3（由速度得到得分，[16]）。** 对于具有高斯源 \(p_{\mathrm{src}}=\mathcal N(0,I_d)\) 与线性插值的整流流设置，边缘分布的得分满足

$$
\nabla\log p_t(x) = -\frac{(1-t)v_t(x)+x}{t},\qquad t\in(0,1].\tag{30}
$$

推导从去噪得分匹配出发，它把边缘得分表达为条件得分在后验 \(p(x_{\mathrm{data}}\mid x_t)\) 下的期望：

$$
\nabla\log p_t(x_t) = \mathbb E_{p(x_{\mathrm{data}}\mid x_t)}\left[\frac{\partial\log p_t(x_t\mid x_{\mathrm{data}})}{\partial x_t}\right].\tag{31}
$$

对线性插值 \(x_t=(1-t)x_{\mathrm{data}}+t\,x_{\mathrm{src}}\)（\(x_{\mathrm{src}}\sim\mathcal N(0,I_d)\)），条件密度 \(p_t(x_t\mid x_{\mathrm{data}})\) 是均值为 \((1-t)x_{\mathrm{data}}\)、协方差为 \(t^2 I_d\) 的高斯。于是条件得分为

$$
\frac{\partial\log p_t(x_t\mid x_{\mathrm{data}})}{\partial x_t} = -\frac{x_t-(1-t)x_{\mathrm{data}}}{t^2}.\tag{32}
$$

利用期望的线性性，并结合由插值得到的关系 \(x_{\mathrm{data}}=x_t-t\,\mathbb E[x_{\mathrm{src}}-x_{\mathrm{data}}\mid x_t]=x_t-t\,v_t(x_t)\)，化简后即得式 (30)。

命题 C.3 的实用结论是：预训练流模型自身携带了模拟式 (29) 所需的全部信息——漂移与得分都可以通过 \(v_t(x)\) 的一次前向传播得到，无需任何辅助得分网络。

## 附录 D 重采样方法

本节描述利用 FKC 权重、以一批 \(K\) 条轨迹改进采样的若干选项。最简单的技术是在整个时间区间 \(t\in[0,1]\) 上为 \(K\) 条独立轨迹模拟定理 4.1 的加权 SDE，并用式 (6) 中的 SNIS 重加权；但实践中我们预期这些整轨迹权重会因沿路径的误差累积而具有高方差。因此，我们陈述 Skreta et al. [15] 为 FKC 框架推荐的重采样方法。

**序贯蒙特卡洛。** 由于我们的权重对每个中间分布都构成一个恰当（proper）的加权方案 [20]（附录 F.1），我们可以采用在模拟过程中对轨迹重加权的 SMC 方法。经验上，把重采样限制在一个“活跃区间” \(t\in[t_{\min},t_{\max}]\) 内有助于提升样本质量并保持多样性；在该区间之外我们把权重置零。在活跃区间内，按增量 \(w_t^{(k)}=g_t(x_t^{(k)})dt\) 在每一步执行重采样，并按 \(\exp\{w_t^{(k)}\}\) 成比例做系统采样（systematic sampling）[43]。在 \(dt\) 较小时，我们预期权重表现出相对较低的方差。由此看来，系统重采样是一种有吸引力的选择机制，因为当权重均匀时它会保留每条轨迹。话虽如此，即使多项重采样（multinomial resampling）也提供了一个有吸引力且更简单的替代方案。

**重加权的跳过程解释。** 把重加权方程重新表述为马尔可夫跳过程（Markov jump process）[44, 第 4.2 章]，可为费曼–卡茨 PDE 打开一系列额外的模拟算法 [45, 第 1.2.2、5 章]，[46, 47]。一个马尔可夫跳过程由速率函数 \(\lambda_t(x)\) 与马尔可夫转移核 \(J_t(y\mid x)\) 共同指定：前者控制跳发生的频率，后者给出每当跳发生时所抽取的下一状态。对跳过程而言，前向柯尔莫哥洛夫方程取如下形式

$$
\frac{\partial p_t^{\mathrm{jump}}(x)}{\partial t} = \left(\int\lambda_t(y)J_t(x\mid y)p_t(y)\,dy\right) - p_t(x)\lambda_t(x),\tag{33}
$$

其中两项可直观理解为跳所造成的概率流入与流出。

我们的目标是找出 \(\lambda_t(x)\) 与 \(J_t(y\mid x)\)，使得在给定 \(g_t\) 的选择下 \(p_t^{\mathrm{jump}}\) 重现式 (18) 中 \(p_t^{\mathrm{w}}\) 的演化。众多跳过程都满足这一要求 [45, 第 5 章]，[48]；这里我们遵循 Skreta et al. [15] 的具体构造。

**命题 D.1（[15]）。** 对式 (18) 中给定的 \(g_t\)，定义跳过程的速率与转移为

$$
\lambda_t(x) = \bigl(g_t(x)-\mathbb E_{p_t}[g_t]\bigr)^{-},\tag{34}
$$

$$
J_t(y\mid x) = \frac{\bigl(g_t(y)-\mathbb E_{p_t}[g_t]\bigr)^{+}\,p_t(y)}{\int\bigl(g_t(z)-\mathbb E_{p_t}[g_t]\bigr)^{+}\,p_t(z)\,dz},\tag{35}
$$

其中 \((u)^{-}:=\max(0,-u)\)，\((u)^{+}:=\max(0,u)\)。则有

$$
\frac{\partial p_t^{\mathrm{jump}}(x)}{\partial t} = \frac{\partial p_t^{\mathrm{w}}(x)}{\partial t} = p_t(x)\bigl(g_t(x)-\mathbb E_{p_t}[g_t]\bigr),\tag{36}
$$

与式 (18) 一致。

在连续时间与平均场极限下，这一重加权的跳过程视角等价于模拟

$$
x_{t+dt} =
\begin{cases}
x_t & \text{以概率 } 1-\lambda_t(x_t)dt+o(dt),\\
\sim J_t(y\mid x_t) & \text{以概率 } \lambda_t(x_t)dt+o(dt).
\end{cases}\tag{37}
$$

该过程应当能高效地改进样本群，因为跳只从满足 \(\bigl(g_t(x)-\mathbb E_{p_t}[g_t]\bigr)^{-}\ge 0\Rightarrow g_t(x)\le\mathbb E_{p_t}[g_t]\) 的状态被触发，而转移倾向于偏好超额权重较大的目的状态 \(\bigl(g_t(y)-\mathbb E_{p_t}[g_t]\bigr)^{+}>0\)。也就是说，低代价轨迹会取代低权重轨迹，从而把计算资源导向轨迹空间中更有希望的区域。

为在实践中估计跳速率 \(\lambda_t(x)\) 与转移 \(J_t(y\mid x)\)，我们依赖经验近似 \(p_t^{K}(z)=\frac{1}{K}\sum_{k=1}^{K}\delta_z(x^{(k)})\)。作为直接模拟式 (37) 的替代方案，也可以采用基于生灭“指数时钟”的实现 [45, 第 5.3–4 章]。

## 附录 E BayesFP 算法

我们在此以伪代码形式集中给出通用的 BayesFP 采样器（算法 1），它实现为一个序贯蒙特卡洛（SMC）过程，使用按 \(\exp\{w_t^{(k)}\}\) 成比例的概率做系统重采样，或使用多项重采样。除基座漂移与扩散不同外（式 (3) 逆时扩散 SDE 的 \((f_t,\sigma_t)\)，以及附录 C 中保持边缘分布 SDE 重述的速度 \(v_t\) 与辅助扩散率 \(\tilde\sigma_t\)），该过程对扩散策略与流匹配策略相同。

**算法 1　BayesFP：从式 (1) 的 Gibbs 倾斜后验做费曼–卡茨采样。**

**输入（Require）：** 预训练策略：扩散（\(f_t,\sigma_t,\nabla\log q_t\)）或流（\(v_t\)，带辅助扩散率 \(\tilde\sigma_t\)）；代价 \(\mathcal J\)；逆温度时间表 \(\beta_t<0\)；粒子数 \(K\)；步数 \(N\)；\(0=t_0<t_1<\cdots<t_N=1\)；活跃区间 \([t_{\min},t_{\max}]\)；重采样周期 \(R\)；重采样方案 \(\mathsf S\in\{\text{SYSTEMATIC},\text{MULTINOMIAL}\}\)。

1: 抽取 \(\{x^{(k)}\}_{k=1}^{K}\sim\mathcal N(0,I_d)\) 并置 \(w^{(k)}\leftarrow 0\)  
2: **for** \(n=0,\dots,N-1\) **do**  
3: 　\(t\leftarrow t_n\)，\(\Delta t\leftarrow t_{n+1}-t_n\)  
4: 　**for** \(k=1,\dots,K\) **并行 do**  
5: 　　评估 \(\nabla\mathcal J(x^{(k)})\)  
6: 　　**if** 扩散策略 **then**  
7: 　　　\(\mu^{(k)}\leftarrow -f_t(x^{(k)})+\sigma_t^2\nabla\log q_t(x^{(k)})+\frac{1}{2}\beta_t\sigma_t^2\nabla\mathcal J(x^{(k)})\)  
8: 　　　\(\Delta w^{(k)}\leftarrow\left[\frac{\partial\beta_t}{\partial t}\mathcal J(x^{(k)})+\left\langle\beta_t\nabla\mathcal J(x^{(k)}),\ \frac{\sigma_t^2}{2}\nabla\log q_t(x^{(k)})-f_t(x^{(k)})\right\rangle\right]\Delta t\)  
9: 　　　\(x^{(k)}\leftarrow x^{(k)}+\mu^{(k)}\Delta t+\sigma_t\sqrt{\Delta t}\,\xi^{(k)},\quad \xi^{(k)}\sim\mathcal N(0,I_d)\)  
10: 　　**else if** 流策略 **then**  
11: 　　　插补得分：\(\nabla\log q_t(x^{(k)})\leftarrow-\dfrac{x^{(k)}+t\,v_{1-t}(x^{(k)})}{1-t}\)　　▷ 命题 C.3  
12: 　　　\(\mu^{(k)}\leftarrow -v_{1-t}(x^{(k)})+\frac{\tilde\sigma_t^2}{2}\nabla\log q_t(x^{(k)})+\frac{1}{2}\beta_t\tilde\sigma_t^2\nabla\mathcal J(x^{(k)})\)  
13: 　　　\(\Delta w^{(k)}\leftarrow\left[\frac{\partial\beta_t}{\partial t}\mathcal J(x^{(k)})-\beta_t\bigl\langle\nabla\mathcal J(x^{(k)}),\ v_{1-t}(x^{(k)})\bigr\rangle\right]\Delta t\)  
14: 　　　\(x^{(k)}\leftarrow x^{(k)}+\mu^{(k)}\Delta t+\tilde\sigma_t\sqrt{\Delta t}\,\xi^{(k)},\quad \xi^{(k)}\sim\mathcal N(0,I_d)\)  
15: 　　**end if**  
16: 　**end for**  
17: 　**if** \(t\in[t_{\min},t_{\max}]\) **then**  
18: 　　\(\Delta w^{(k)}\leftarrow\Delta w^{(k)}-\frac{1}{K}\sum_j\Delta w^{(j)}\)　　▷ 在 \(K\) 个粒子上中心化  
19: 　　\(w^{(k)}\leftarrow w^{(k)}+\Delta w^{(k)}\)  
20: 　　**if** \(n\bmod R=0\) **then**  
21: 　　　\(\pi^{(k)}\leftarrow\exp(w^{(k)})/\sum_{j=1}^{K}\exp(w^{(j)})\)  
22: 　　　**if** \(\mathsf S=\text{SYSTEMATIC}\) **then**  
23: 　　　　按概率 \(\pi^{(1:K)}\) 从 \(\{x^{(k)}\}_{k=1}^{K}\) 系统重采样得到 \(\{\tilde x^{(k)}\}_{k=1}^{K}\)  
24: 　　　**else if** \(\mathsf S=\text{MULTINOMIAL}\) **then**  
25: 　　　　独立同分布地抽取 \(a^{(k)}\sim\mathrm{Categorical}\bigl(\pi^{(1:K)}\bigr)\)，\(k=1,\dots,K\)  
26: 　　　　\(\tilde x^{(k)}\leftarrow x^{(a^{(k)})}\)，\(k=1,\dots,K\)  
27: 　　　**end if**  
28: 　　　\(x^{(k)}\leftarrow\tilde x^{(k)}\) 并重置 \(w^{(k)}\leftarrow 0\)，\(k=1,\dots,K\)  
29: 　　**end if**  
30: 　**end if**  
31: **end for**  
32: 抽取 \(k^{\star}\sim\mathrm{Categorical}\bigl(\mathrm{softmax}(w^{(1:K)})\bigr)\)  
33: **return** \(x^{(k^{\star})}\)

我们的框架对实例化采样器所用的许多数值与算法组件保持不可知。特别地，实践者可以根据计算预算与应用需求，选择数值积分器、重采样方案与频率、逆温度时间表、活跃重采样区间以及相关离散化选择。这些选择不改变底层的费曼–卡茨后验采样表述，尽管它们可能影响计算复杂度、离散化与有限粒子误差、方差以及经验性能。相应地，某些理论保证或常数可能依赖于具体实现；例如，我们的有限粒子结果是针对固定数值网格与重采样时间表陈述的。因此，算法 1 应被视为通用框架的一种实用实例，而不是对数值组件的强制性选择；当替代组件具有更好的计算或经验性能时，可以替换使用。

## 附录 F 理论结果与证明

本附录给出支撑正文理论主张的技术细节。第一个结果回顾 Skreta et al. [15] 中费曼–卡茨期望表示，它构成了我们使用加权粒子的基础，说明目标分布下的期望如何用指数加权轨迹表达，并由此引出我们方法中使用的自归一重要性采样估计器。第二个结果导出用于从正文引入的代价倾斜边缘分布采样的费曼–卡茨加权动力学，从而确立所提出的引导过程并非对采样动力学的临时修改，而是对应于一个定义良好的密度演化，其加权粒子系统以所期望的 Gibbs 倾斜分布为目标。第三个结果论证该倾斜分布用于受约束优化的正当性：在惩罚权重与逆温度充分大时，其概率质量集中在可行且接近最优的轨迹上。最后，我们为实际的 BayesFP 近似建立有限粒子保证，表明有限粒子预算引入的额外误差随 \(K^{-1}\) 衰减，同时保持对可行、接近最优轨迹的集中性。

### F.1 费曼–卡茨 PDE 下的期望估计

我们回顾如下改编自 Skreta et al. [15] 的费曼–卡茨期望表示，它为用加权样本估计目标分布下的期望提供了理论基础。

**命题 F.1（费曼–卡茨动力学下的期望表示 [15]）。** 设 \(\phi:\mathcal X\to\mathbb R\) 是有界测试函数，并假设 \(p_t\) 按如下费曼–卡茨 PDE 演化

$$
\frac{\partial}{\partial t}p_t(x_t) = -\bigl\langle\nabla,\ p_t(x_t)v_t(x_t)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta p_t(x_t) + p_t(x_t)\left(g_t(x_t)-\int g_t(x_t)p_t(x_t)\,dx_t\right).\tag{38}
$$

则 \(\phi\) 在终端分布 \(p_T\) 下的期望具有加权表示

$$
\mathbb E_{p_T(x_T)}[\phi(x_T)] = \frac{1}{Z_T}\,\mathbb E\left[\exp\left(\int_0^T g_s(x_s)\,ds\right)\phi(x_T)\right],\tag{39}
$$

其中 \(dx_t=v_t(x_t)dt+\sigma_t dW_t\)，\(x_0\sim p_0\)，\(Z_T\) 表示不依赖于 \(x\) 的归一化常数。

因此，式 (39) 给出了式 (6) 中自归一重要性采样估计器背后的费曼–卡茨表示，该估计器在 \(K\to\infty\) 时收敛到所期望的期望。

#### F.1.1 BayesFP 下的后验期望

我们把命题 F.1 的费曼–卡茨期望表示特化到 BayesFP 所瞄准的 Gibbs 倾斜后验。我们保留 \(x_t\) 表示模拟轨迹、\(w_t\) 表示其对数权重、\(q_t\) 表示预训练策略的边缘分布。对策略进行条件化的观测是固定的，故省略。为允许一般的轨迹空间 \(\mathcal X\)，我们针对概率测度陈述结果，并以弱形式表达费曼–卡茨演化。

**命题 F.2（BayesFP 下的后验期望表示）。** 设 \(\mathcal X\) 是可测轨迹空间，\(q_t\) 是 \(\mathcal X\) 上的概率测度，\(\mathcal J:\mathcal X\to\mathbb R\) 是可测的惩罚增广代价。设 \(\beta_t\le 0\)（\(t\in[0,T]\)）是连续可微的逆温度时间表。定义未归一化与归一化的 Gibbs 倾斜测度为

$$
\tilde p_t(dx) := e^{\beta_t\mathcal J(x)}\,q_t(dx),\qquad Z_t := \int_{\mathcal X} e^{\beta_t\mathcal J(x)}\,q_t(dx),\tag{40}
$$

$$
p_t(dx\mid O=1) := Z_t^{-1}\,\tilde p_t(dx),\qquad 0<Z_t<\infty.\tag{41}
$$

设 \((x_t)_{t\in[0,T]}\) 是一个定义良好、非爆炸的马尔可夫提议过程，初值 \(x_0\sim q_0\)；令 \(A_t\) 表示其在有界可测测试函数的公共定义域 \(\mathcal D\) 上的生成元。假设 \(\mathcal D\) 决定有限测度、包含常函数 1，且 \(A_t 1=0\)。对每个 \(\psi\in\mathcal D\)，假设该提议过程容许半鞅分解

$$
\psi(x_t) = \psi(x_0) + \int_0^t (A_s\psi)(x_s)\,ds + M_t^{\psi},\qquad M_0^{\psi}=0,\tag{42}
$$

其中 \(M_t^{\psi}\) 是局部鞅。假设可测重加权函数 \(g_t\) 的选取使得 Gibbs 倾斜测度满足弱费曼–卡茨方程

$$
\int_{\mathcal X}\psi(x)\,\tilde p_t(dx) = \int_{\mathcal X}\psi(x)\,\tilde p_0(dx) + \int_0^t\int_{\mathcal X}\bigl[(A_s\psi)(x)+g_s(x)\psi(x)\bigr]\tilde p_s(dx)\,ds,\qquad \psi\in\mathcal D.\tag{43}
$$

假设该方程在包含 \(\tilde p_t\) 与下文加权提议测度的有限测度曲线类中唯一。给每个提议过程赋予未中心化的对数权重

$$
w_t = \beta_0\mathcal J(x_0) + \int_0^t g_s(x_s)\,ds.\tag{44}
$$

假设 \(\int_0^T|g_s(x_s)|ds<\infty\) 几乎必然成立，\(\mathbb E[e^{w_t}]<\infty\) 对每个 \(t\in[0,T]\) 成立，且对每个 \(\psi\in\mathcal D\) 有

$$
\int_0^T \mathbb E\Bigl[e^{w_s}\bigl(|(A_s\psi)(x_s)|+|g_s(x_s)\psi(x_s)|\bigr)\Bigr]ds<\infty,\tag{45}
$$

并且 \(\int_0^t e^{w_s}dM_s^{\psi}\) 是真正的鞅。则对每个有界可测测试函数 \(\phi:\mathcal X\to\mathbb R\) 与每个 \(t\in[0,T]\)，

$$
\mathbb E[e^{w_t}\phi(x_t)] = Z_t\,\mathbb E_{p_t(\cdot\mid O=1)}[\phi],\qquad \mathbb E[e^{w_t}] = Z_t.\tag{46}
$$

因此，对该加权提议过程的 \(K\) 个独立副本、每个固定 \(t\in[0,T]\) 与有界可测 \(\phi\)，自归一估计器满足

$$
\sum_{k=1}^{K}\frac{\exp\bigl(w_t^{(k)}\bigr)}{\sum_{j=1}^{K}\exp\bigl(w_t^{(j)}\bigr)}\,\phi\bigl(x_t^{(k)}\bigr)\ \xrightarrow[K\to\infty]{\text{a.s.}}\ \mathbb E_{p_t(\cdot\mid O=1)}[\phi].\tag{47}
$$

特别地，若 \(q_T=p_{\mathrm{data}}\) 且 \(\beta_T=\beta\)，则终端目标为 \(p_T(dx\mid O=1)\propto e^{\beta\mathcal J(x)}p_{\mathrm{data}}(dx)\)。

**证明概述。** 权重 \(e^{w_t}\) 是一个有限变差的随机连续过程，满足 \(d(e^{w_t})=e^{w_t}g_t(x_t)dt\)，它与半鞅 \(\psi(x_t)\) 的二次协变差为零。对式 (42) 应用乘积法则给出

$$
d\bigl(e^{w_t}\psi(x_t)\bigr) = e^{w_t}\bigl[(A_t\psi)(x_t)+g_t(x_t)\psi(x_t)\bigr]dt + e^{w_t}dM_t^{\psi}.\tag{48}
$$

取期望的合法性由所假设的可积性与鞅条件保证。于是有限测度 \(\mathbb E[e^{w_t}\delta_{x_t}(dx)]\)（其中 \(\delta_{x_t}\) 是 \(x_t\) 处的 Dirac 测度）满足式 (43)，其初始测度为

$$
\mathbb E[e^{w_0}\delta_{x_0}(dx)] = e^{\beta_0\mathcal J(x)}q_0(dx) = \tilde p_0(dx).\tag{49}
$$

由唯一性可得 \(\mathbb E[e^{w_t}\delta_{x_t}(dx)]=\tilde p_t(dx)\)。对有界可测 \(\phi\) 积分、再对 1 积分，即得式 (46)。最后，\(\mathbb E[e^{w_t}|\phi(x_t)|]\le\|\phi\|_{\infty}Z_t<\infty\)；对分子与分母分别应用强大数定律（并注意 \(Z_t>0\)）即证式 (47)。∎

**与扩散/流表述的关系。** 式 (43) 是提议过程、其重加权函数与所期望 Gibbs 倾斜边缘分布之间的相容性条件。在正文的光滑密度设置中，加权 SDE 给出如下选择。对逆时扩散策略，

$$
dx_t = \left[-f_t(x_t)+\sigma_t^2\nabla\log q_t(x_t)+\frac{\beta_t\sigma_t^2}{2}\nabla\mathcal J(x_t)\right]dt+\sigma_t\,dW_t,\tag{50}
$$

$$
g_t(x) = \frac{\partial\beta_t}{\partial t}\mathcal J(x) + \beta_t\left\langle\nabla\mathcal J(x),\ \frac{\sigma_t^2}{2}\nabla\log q_t(x)-f_t(x)\right\rangle.\tag{51}
$$

对流策略，在加权采样器所用的生成漂移约定 \(-v_t\) 下，

$$
dx_t = \left[-v_t(x_t)+\frac{\tilde\sigma_t^2}{2}\nabla\log q_t(x_t)+\frac{\beta_t\tilde\sigma_t^2}{2}\nabla\mathcal J(x_t)\right]dt+\tilde\sigma_t\,dW_t,\tag{52}
$$

$$
g_t(x) = \frac{\partial\beta_t}{\partial t}\mathcal J(x) - \beta_t\langle\nabla\mathcal J(x),\ v_t(x)\rangle.\tag{53}
$$

这里 \(W_t\) 表示正文所用的标准维纳过程；\(w_t\) 仍表示粒子对数权重。生成元 \(A_t\) 是对应提议 SDE 的生成元。例如在扩散情形中它作用为

$$
(A_t\psi)(x) = \left\langle -f_t(x)+\sigma_t^2\nabla\log q_t(x)+\frac{\beta_t\sigma_t^2}{2}\nabla\mathcal J(x),\ \nabla\psi(x)\right\rangle + \frac{\sigma_t^2}{2}\Delta\psi(x).\tag{54}
$$

对 Gibbs 倾斜动力学的密度计算在其正则性假设下确立了这些选择满足式 (43)。命题随后给出它们的后验期望表示与一致的自归一估计器。未归一化方程与权重使用 \(g_t\)；其中心化对应物 \(\bar g_t=g_t-\mathbb E_{p_t(\cdot\mid O=1)}[g_t]\) 出现在归一化费曼–卡茨演化中。

**状态空间与时间约定。** 该期望结果不需要坐标、参考 Lebesgue 测度或有限维状态空间。因此，只要提议过程、生成元、势函数与弱费曼–卡茨演化满足所述假设，它同样适用于无穷维轨迹空间。展示的得分、梯度、拉普拉斯与标量噪声公式是正文的光滑密度特化，不是这些对象在任意可测空间上的定义。无穷维 SDE 特化需要合适的维纳过程、定义良好的噪声算子与随机积分，以及满足同一相容性条件的相应生成元。

该命题采用递增的生成时间，从 0 起、到 \(T\) 止。在正文的流插值时钟中，源位于时间 1、数据位于时间 0。因此在使用递增生成时间 \(t\in[0,1]\) 时，每个以插值索引的量都必须在 \(1-t\) 处取值；特别地，当 \(v\) 保留其原始插值时间索引时，生成 ODE 的漂移是 \(-v_{1-t}\)。式 (52)–式 (53) 写的是经此时间重索引后的 \(v_t\)，同样的约定适用于 \(q_t\)、\(\beta_t\) 与 \(\tilde\sigma_t\)。特别地，\(\partial\beta_t/\partial t\) 是相对于递增生成时间取的，包括在非恒定插值时间表被重索引时的链式法则符号。

**初始化与归一化。** 从 \(q_0\) 出发需要 \(w_0=\beta_0\mathcal J(x_0)\)。允许 \(\beta_0=0\) 就允许 \(w_0=0\) 与 \(Z_0=1\)，而终端逆温度为负值 \(\beta_T=\beta<0\)。或者，若 \(x_0\sim p_0(\cdot\mid O=1)\) 且 \(w_0=0\)，则 \(w_t=\int_0^t g_s(x_s)ds\)，并且

$$
\mathbb E[e^{w_t}] = \frac{Z_t}{Z_0},\qquad \mathbb E_{p_t(\cdot\mid O=1)}[\phi] = \frac{Z_0}{Z_t}\,\mathbb E[e^{w_t}\phi(x_t)].\tag{55}
$$

**确定性流极限。** 对光滑流特化，令 \(\tilde\sigma_t\equiv 0\) 得 \(dx_t=-v_t(x_t)dt\)。链式法则给出

$$
\frac{d}{dt}\bigl[\beta_t\mathcal J(x_t)\bigr] = \frac{\partial\beta_t}{\partial t}\mathcal J(x_t) - \beta_t\langle\nabla\mathcal J(x_t),\ v_t(x_t)\rangle = g_t(x_t).\tag{56}
$$

取 \(x_0\sim q_0\)、\(w_0=\beta_0\mathcal J(x_0)\)，得到 \(w_t=\beta_t\mathcal J(x_t)\)：先验流样本的重要性加权在确定性极限下依然有效。

**保证的适用范围。** 自归一估计器对有限 \(K\) 一般是有偏的。其所述一致性针对独立的提议轨迹；中间重采样需要单独的粒子系统分析。对基于得分的特化，精确性要求正确的先验得分与完整的权重势。数值离散化、近似得分、以及遗漏的初始或中间权重，都可能造成有限粒子分析中已考虑的目标差异 \(d_N\)。对所有对数权重施加公共平移不改变归一化粒子估计，但所展示的 \(Z_t\) 恒等式使用的是重采样重置之前的未中心化权重。取 \(\phi=\mathbf 1_{G_\delta}\) 即可（在集中性结果各自施加的独立假设下）估计可行、接近最优事件的后验概率。

### F.2 用于 Gibbs 倾斜采样的费曼–卡茨 PDE

我们首先导出与 Gibbs 倾斜边缘分布相伴的加权 SDE。目标是从一个边缘分布为 \(q_t(x)\) 的基座过程出发，构造一个费曼–卡茨演化，使其加权密度正比于 \(q_t(x)\exp(\beta_t\mathcal J(x))\)。证明的思路是：对归一化倾斜密度求导，识别费曼–卡茨 PDE 所要求的额外重加权项，再把所得表达式特化到预训练生成式策略所用的逆时扩散动力学。以下结果是 Skreta et al. [15] 的一个特例，被改编用于从后验分布式 (1) 采样。

**定理 F.3（面向受约束轨迹生成的 Gibbs 倾斜后验采样）。** 设 \(q_t(x)\) 表示预训练扩散策略（或经附录 C 的保持边缘分布 SDE 重述后的预训练整流流策略）在时间 \(t\) 的边缘分布，它由基座 SDE

$$
dx_t = v_t(x_t)\,dt + \sigma_t\,dW_t\tag{57}
$$

生成，因此 \(q_t\) 按与该过程相伴的福克–普朗克方程演化。设 \(\mathcal J:\mathbb R^d\to\mathbb R\) 是式 (8) 的惩罚增广代价，它编码推理时受约束优化问题式 (7)；设 \(\beta_t<0\) 是控制代价诱导倾斜强度的逆温度时间表。则代价倾斜后验边缘分布

$$
p_t(x) := p_t(x\mid O=1) = \frac{q_t(x)\exp\bigl(\beta_t\mathcal J(x)\bigr)}{\int q_t(x)\exp\bigl(\beta_t\mathcal J(x)\bigr)dx}\tag{58}
$$

——即把已学习演示分布视为先验、把 \(\exp(\beta_t\mathcal J)\) 视为最优性似然的轨迹贝叶斯后验——可通过如下费曼–卡茨加权 SDE 采样：

$$
dx_t = \bigl(v_t(x_t)+a\nabla\mathcal J(x_t)\bigr)dt + \sigma_t\,dW_t,\tag{59}
$$

$$
\begin{aligned}
dw_t = \Bigg[\Big\langle\nabla\mathcal J(x_t),\ &\beta_t\bigl(v_t(x_t)-\sigma_t^2\nabla\log q_t(x_t)-\tfrac{\sigma_t^2}{2}\beta_t\nabla\mathcal J(x_t)\bigr)\\
&+a\bigl(\nabla\log q_t(x_t)+\beta_t\nabla\mathcal J(x_t)\bigr)\Big\rangle\\
&+\Bigl(a-\beta_t\tfrac{\sigma_t^2}{2}\Bigr)\Delta\mathcal J(x_t)+\frac{\partial\beta_t}{\partial t}\mathcal J(x_t)\Bigg]dt,
\end{aligned}\tag{60–61}
$$

其中 \(a\in\mathbb R\) 是自由设计参数，\(w_t\) 是每个 FK 粒子携带的对数重要性权重。

**特化到逆时生成 SDE。** 对预训练扩散策略（或经附录 C 保持边缘分布 SDE 重述后的流策略）所用的逆时 SDE，即 \(v_t(x_t)=-f_t(x_t)+\sigma_t^2\nabla\log q_t(x_t)\)，并取标准选择 \(a=\beta_t\sigma_t^2/2\)，加权 SDE 简化为

$$
dx_t = \Bigl(-f_t(x_t)+\sigma_t^2\nabla\log q_t(x_t)+\beta_t\frac{\sigma_t^2}{2}\nabla\mathcal J(x_t)\Bigr)dt+\sigma_t\,dW_t,\tag{62}
$$

$$
dw_t = \left[\frac{\partial\beta_t}{\partial t}\mathcal J(x_t)+\left\langle\beta_t\nabla\mathcal J(x_t),\ \frac{\sigma_t^2}{2}\nabla\log q_t(x_t)-f_t(x_t)\right\rangle\right]dt.\tag{63}
$$

**证明概述。** 从基座过程的动力学出发。设 \(q_t(x)\) 表示预训练生成式策略在时间 \(t\) 的边缘分布，它按福克–普朗克方程演化

$$
\frac{\partial q_t(x)}{\partial t} = -\bigl\langle\nabla,\ q_t(x)v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta q_t(x).\tag{64}
$$

我们的目标是刻画 Gibbs 倾斜密度

$$
p_t(x) = \frac{q_t(x)e^{\beta_t\mathcal J(x)}}{\int dx\,q_t(x)e^{\beta_t\mathcal J(x)}}\tag{65}
$$

的时间演化。对 \(\log p_t(x)\) 关于时间直接求导，并注意到分母中的归一化常数贡献一项，其值等于“对数分子的时间导数”在 \(p_t\) 下的期望，可得

$$
\frac{\partial}{\partial t}\log p_t(x) = \frac{\partial}{\partial t}\log q_t(x) + \frac{\partial\beta_t}{\partial t}\mathcal J(x) - \int dx\,p_t(x)\left[\frac{\partial}{\partial t}\log q_t(x)+\frac{\partial\beta_t}{\partial t}\mathcal J(x)\right].\tag{66}
$$

注意第一项 \(\frac{\partial}{\partial t}\log q_t(x)\) 可以借助 \(q_t\) 的福克–普朗克方程与标准对数恒等式展开；还可以利用由倾斜密度定义直接得到的 \(\nabla\log p_t(x)=\nabla\log q_t(x)+\beta_t\nabla\mathcal J(x)\)，把所得的得分 \(\nabla\log q_t\) 用 \(\nabla\log p_t\) 重新表达，得到

$$
\begin{aligned}
\frac{\partial}{\partial t}\log q_t(x) = &-\bigl\langle\nabla,\ v_t(x)\bigr\rangle - \bigl\langle\nabla\log q_t(x),\ v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta\log q_t(x) + \frac{\sigma_t^2}{2}\|\nabla\log q_t(x)\|^2\\
=&-\bigl\langle\nabla,\ v_t(x)\bigr\rangle - \bigl\langle\nabla\log p_t(x),\ v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta\log p_t(x) + \frac{\sigma_t^2}{2}\|\nabla\log p_t(x)\|^2\\
&+\left\langle\beta_t\nabla\mathcal J(x),\ v_t(x)-\sigma_t^2\nabla\log q_t(x)-\frac{\sigma_t^2}{2}\beta_t\nabla\mathcal J(x)\right\rangle - \beta_t\frac{\sigma_t^2}{2}\Delta\mathcal J(x).
\end{aligned}\tag{67–68}
$$

把该展开代回 \(\log p_t\) 的时间导数，并把各项重新整理为输运、扩散与重加权三部分，我们得到费曼–卡茨 PDE

$$
\frac{\partial p_t(x)}{\partial t} = -\bigl\langle\nabla,\ p_t(x)v_t(x)\bigr\rangle + \frac{\sigma_t^2}{2}\Delta p_t(x) + p_t(x)\bigl(g_t(x)-\mathbb E_{p_t(x)}g_t(x)\bigr)\tag{69}
$$

$$
g_t(x) = \left\langle\beta_t\nabla\mathcal J(x),\ v_t(x)-\sigma_t^2\nabla\log q_t(x)-\frac{\sigma_t^2}{2}\beta_t\nabla\mathcal J(x)\right\rangle - \beta_t\frac{\sigma_t^2}{2}\Delta\mathcal J(x) + \frac{\partial\beta_t}{\partial t}\mathcal J(x).\tag{70}
$$

此时整个代价诱导的倾斜都由重加权项 \(g_t\) 承担，但我们完全可以把其中一部分重新分配到代价感知的漂移修正中：利用输运/重加权等价性，我们可以把代价的梯度作为额外漂移项 \(a\nabla\mathcal J(x)\) 引入（\(a\in\mathbb R\) 是自由设计参数），它保持边缘分布 \(p_t\) 不变，但相应地修改 \(g_t\)，即

$$
\frac{\partial p_t(x)}{\partial t} = -\bigl\langle\nabla,\ p_t(x)(v_t(x)+a\nabla\mathcal J(x))\bigr\rangle + \frac{\sigma_t^2}{2}\Delta p_t(x) + p_t(x)\bigl(g_t(x)-\mathbb E_{p_t(x)}g_t(x)\bigr)\tag{71}
$$

$$
\begin{aligned}
g_t(x) = &a\Delta\mathcal J(x) + a\bigl\langle\nabla\log p_t(x),\nabla\mathcal J(x)\bigr\rangle - \beta_t\frac{\sigma_t^2}{2}\Delta\mathcal J(x) + \frac{\partial\beta_t}{\partial t}\mathcal J(x)\\
&+\left\langle\beta_t\nabla\mathcal J(x),\ v_t(x)-\sigma_t^2\nabla\log q_t(x)-\frac{\sigma_t^2}{2}\beta_t\nabla\mathcal J(x)\right\rangle.
\end{aligned}\tag{72}
$$

现在我们把这个一般表达式特化到预训练策略所用的逆时生成动力学，并选择自由参数以获得尽可能紧凑的权重更新：把基座漂移设为标准逆时形式 \(v_t(x):=-f_t(x)+\sigma_t^2\nabla\log q_t(x)\)，并把代价漂移系数取为规范值 \(a:=\beta_t\sigma_t^2/2\)（这样 \(g_t\) 中的拉普拉斯项 \(a\Delta\mathcal J\) 与 \(\beta_t\frac{\sigma_t^2}{2}\Delta\mathcal J\) 精确抵消，\(g_t\) 中出现的得分 \(\nabla\log p_t\) 也塌缩为更简单的 \(\nabla\log q_t\)），我们得到简化系统

$$
\frac{\partial p_t(x)}{\partial t} = -\left\langle\nabla,\ p_t(x)\Bigl(-f_t(x)+\sigma_t^2\nabla\log q_t(x)+\beta_t\frac{\sigma_t^2}{2}\nabla\mathcal J(x)\Bigr)\right\rangle + \frac{\sigma_t^2}{2}\Delta p_t(x) + p_t(x)\bigl(g_t(x)-\mathbb E_{p_t(x)}g_t(x)\bigr)\tag{73}
$$

$$
\begin{aligned}
g_t(x) = &\left\langle\beta_t\nabla\mathcal J(x),\ \frac{\sigma_t^2}{2}\nabla\log p_t(x)\right\rangle + \frac{\partial\beta_t}{\partial t}\mathcal J(x) + \left\langle\beta_t\nabla\mathcal J(x),\ -f_t(x)-\frac{\sigma_t^2}{2}\beta_t\nabla\mathcal J(x)\right\rangle\\
=& \frac{\partial\beta_t}{\partial t}\mathcal J(x) + \left\langle\beta_t\nabla\mathcal J(x),\ \frac{\sigma_t^2}{2}\nabla\log q_t(x)-f_t(x)\right\rangle.
\end{aligned}\tag{74–75}
$$

由于所得 PDE 具有标准的费曼–卡茨形式，它容许粒子化模拟：每条轨迹同时携带一个状态 \(x_t\)（由代价感知的 SDE 漂移与未改变的扩散演化）和一个对数权重 \(w_t\)（按未中心化重加权函数 \(g_t\) 累积）。具体地，可模拟为

$$
dx_t = \Bigl(-f_t(x_t)+\sigma_t^2\nabla\log q_t(x_t)+\beta_t\frac{\sigma_t^2}{2}\nabla\mathcal J(x_t)\Bigr)dt+\sigma_t\,dW_t,\tag{76}
$$

$$
dw_t = \left[\frac{\partial\beta_t}{\partial t}\mathcal J(x)+\left\langle\beta_t\nabla\mathcal J(x),\ \frac{\sigma_t^2}{2}\nabla\log q_t(x)-f_t(x)\right\rangle\right]dt.\tag{77}
$$

### F.3 在受约束最优解上的集中性

上一结果说明如何对固定的惩罚增广目标从 Gibbs 倾斜分布采样。现在我们说明该分布对原受约束优化问题是有意义的。特别地，随着约束惩罚与逆温度幅度增大，倾斜测度给不可行或次优轨迹分配的概率趋于零。这确立了：我们采样器所瞄准的后验集中在受约束问题的可行、接近最优解附近。

**命题 F.4（通过 Gibbs 倾斜在受约束最优解上的集中性）。** 设 \(\mathcal X\subset\mathbb R^d\) 是内部非空（或至少有正 Lebesgue 测度）的紧集，且 \(\mathcal L,\rho,h_1,h_2:\mathcal X\to\mathbb R\) 连续。定义可行集

$$
\mathcal F:=\{x\in\mathcal X:\ h_1(x)=0,\ h_2(x)\le 0\}\neq\varnothing,\qquad \mathcal L^\star:=\min_{x\in\mathcal F}\mathcal L(x),
$$

并对惩罚 \(c=(c_1,c_2)\)（\(c_1,c_2>0\)）定义惩罚目标

$$
\mathcal J_c(x) := \mathcal L(x)+\rho(x)+c_1h_1(x)^2+c_2\max\{0,h_2(x)\}.
$$

设 \(q_0:\mathcal X\to[0,\infty)\) 是连续密度（关于 Lebesgue 测度；在我们的情形中 \(q_0=p_{\mathrm{data}}\)），并对 \(\beta<0\) 定义 Gibbs 倾斜概率分布

$$
p_{(\beta,c)}(dx) := \frac{q_0(x)e^{\beta\mathcal J_c(x)}}{\int_{\mathcal X}q_0(u)e^{\beta\mathcal J_c(u)}du}\,dx.
$$

假设如下条件成立：

- **(A1)（紧性）** \(\mathcal X\) 紧。
- **(A2)（连续性）** 对每个固定的 \(c\)，\(\mathcal J_c\) 在 \(\mathcal X\) 上连续。
- **(A3)（受支撑极小点附近的正性）** 对每个固定的 \(c\)，令 \(S_c:=\arg\min_{\mathcal X}\mathcal J_c(x)\)。存在 \(x_c^\star\in S_c\) 与常数 \(r_c,m_c>0\)，使得对一切 \(x\in\mathcal X\cap B_{r_c}(x_c^\star)\) 有 \(q_0(x)\ge m_c\)，且对每个 \(0<r\le r_c\) 有 \(\mathrm{Leb}(\mathcal X\cap B_r(x_c^\star))>0\)。这里 \(B_r(x)\) 表示以 \(x\) 为中心、半径 \(r\) 的开欧氏球。
- **(A4)（全局极小点的惩罚正确性）** 对每个 \(\delta>0\)，存在 \(c=(c_1,c_2)\)，使得**每个**全局极小点 \(x_c\in\arg\min_{\mathcal X}\mathcal J_c\) 都满足 \(|h_1(x_c)|\le\delta/2\)、\(h_2(x_c)\le\delta/2\)、\(\mathcal L(x_c)\le\mathcal L^\star+\delta/2\)。这是非线性规划中标准的惩罚法相容性条件（对合适的函数类 \(\rho\)）；见 Fiacco 与 McCormick [49]、Bertsekas [50]。

则对每个 \(\delta>0\) 与 \(\eta\in(0,1)\)，存在（充分大的）惩罚 \(c=(c_1,c_2)\) 与（\(|\beta|\) 充分大的）\(\beta<0\)，使得对 \(X\sim p_{(\beta,c)}\)，

$$
\mathbb P\bigl(|h_1(X)|\le\delta,\ h_2(X)\le\delta,\ \mathcal L(X)\le\mathcal L^\star+\delta\bigr)\ \ge\ 1-\eta.
$$

**证明概述。** 固定任意 \(\delta>0\) 与 \(\eta\in(0,1)\)。定义“好”集

$$
G_\delta := \bigl\{x\in\mathcal X:\ |h_1(x)|\le\delta,\ h_2(x)\le\delta,\ \mathcal L(x)\le\mathcal L^\star+\delta\bigr\},\tag{78}
$$

及其补集（“坏”集）\(A_\delta:=\mathcal X\setminus G_\delta\)。

**选取惩罚使所有 \(\mathcal J_c\) 的极小点都是 \(\delta/2\)-好的。** 由假设 (A4)，存在惩罚选择 \(c=(c_1,c_2)\)，使每个全局极小点 \(x_c\in S_c:=\arg\min_{\mathcal X}\mathcal J_c\) 满足 \(|h_1(x_c)|\le\delta/2\)、\(h_2(x_c)\le\delta/2\)、\(\mathcal L(x_c)\le\mathcal L^\star+\delta/2\)。等价地，

$$
S_c\subseteq G_{\delta/2}\subseteq G_\delta.\tag{79}
$$

在证明的余下部分固定这样的 \(c\)，并简记 \(\mathcal J:=\mathcal J_c\)、\(S:=S_c\)。令 \(\mathcal J^\star:=\min_{x\in\mathcal X}\mathcal J(x)\)，则 \(S=\{x\in\mathcal X:\mathcal J(x)=\mathcal J^\star\}\)，且由紧性 (A1) 与连续性 (A2) 知 \(S\neq\varnothing\)。

**\(G_\delta\) 之外存在严格正的能量间隙。** 我们断言存在 \(\varepsilon>0\) 使

$$
A_\delta\subseteq\{x\in\mathcal X:\ \mathcal J(x)\ge\mathcal J^\star+\varepsilon\}.\tag{80}
$$

为证此，先注意 \(G_\delta\) 在 \(\mathcal X\) 中闭（因为它由有限多个连续函数的不等式定义），故 \(A_\delta=\mathcal X\setminus G_\delta\) 在 \(\mathcal X\) 中开。由于要用到紧性，我们改而考虑闭的超集

$$
\tilde A_\delta := \{x\in\mathcal X:\ |h_1(x)|\ge\delta\ \text{或}\ h_2(x)\ge\delta\ \text{或}\ \mathcal L(x)\ge\mathcal L^\star+\delta\}.
$$

由连续性，\(\{|h_1|\ge\delta\}\)、\(\{h_2\ge\delta\}\)、\(\{\mathcal L\ge\mathcal L^\star+\delta\}\) 各自在 \(\mathcal X\) 中闭，故 \(\tilde A_\delta\) 作为有限多个闭集之并也闭。又按定义有包含关系 \(A_\delta\subseteq\tilde A_\delta\)。由于 \(\mathcal X\) 紧，\(\tilde A_\delta\) 紧。

现定义连续非负函数 \(\Delta(x):=\mathcal J(x)-\mathcal J^\star\ge 0\)。由于 \(\tilde A_\delta\) 紧且 \(\Delta\) 连续，\(\Delta\) 在 \(\tilde A_\delta\) 上取得最小值：

$$
\varepsilon := \min_{x\in\tilde A_\delta}\Delta(x) = \min_{x\in\tilde A_\delta}\bigl(\mathcal J(x)-\mathcal J^\star\bigr).
$$

我们证明 \(\varepsilon>0\)。反设 \(\varepsilon=0\)，则存在 \(x_0\in\tilde A_\delta\) 使 \(\mathcal J(x_0)-\mathcal J^\star=0\)，即 \(\mathcal J(x_0)=\mathcal J^\star\)，故 \(x_0\in S\)。但由式 (79) 有 \(S\subseteq G_{\delta/2}\)，于是 \(|h_1(x_0)|\le\delta/2\)、\(h_2(x_0)\le\delta/2\)、\(\mathcal L(x_0)\le\mathcal L^\star+\delta/2\)，这意味着 \(x_0\notin\tilde A_\delta\)，矛盾。因此 \(\varepsilon>0\)，且由 \(\varepsilon\) 的定义有 \(\mathcal J(x)-\mathcal J^\star\ge\varepsilon\) 对所有 \(x\in\tilde A_\delta\) 成立。利用 \(A_\delta\subseteq\tilde A_\delta\)，即得 \(\mathcal J(x)-\mathcal J^\star\ge\varepsilon\) 对所有 \(x\in A_\delta\) 成立，这正是式 (80)。

于是，对每个 \(\beta<0\)，

$$
p_{(\beta,c)}(A_\delta)\le p_{(\beta,c)}\bigl(\{x:\mathcal J(x)\ge\mathcal J^\star+\varepsilon\}\bigr).\tag{81}
$$

**\(\beta\to-\infty\) 时能量尾部的指数界。** 定义“高能量”集 \(B:=\{x\in\mathcal X:\mathcal J(x)\ge\mathcal J^\star+\varepsilon\}\)。我们将证明 \(p_{(\beta,c)}(B)\to 0\)（当 \(\beta\to-\infty\)），并得到一个显式界。

由 (A3)，选取极小点 \(x^\star\in S\) 与常数 \(r_0,m>0\)，使 \(q_0\ge m\) 在 \(\mathcal X\cap B_{r_0}(x^\star)\) 上成立，且以 \(x^\star\) 为心的每个更小球与 \(\mathcal X\) 的交集都有正 Lebesgue 测度。由于 \(\mathcal J(x^\star)=\mathcal J^\star\)，由 \(\mathcal J\) 的连续性存在半径 \(0<r\le r_0\)，使得记 \(U':=\mathcal X\cap B_r(x^\star)\) 后，

$$
\mathcal J(x)\le\mathcal J^\star+\varepsilon/2\quad\text{对所有 } x\in U'.\tag{82}
$$

从而

$$
q_0(x)\ge m\ \text{对所有 }x\in U',\qquad \mathrm{Leb}(U')>0.\tag{83}
$$

又因 \(q_0\) 在紧集 \(\mathcal X\) 上连续，它有上界：

$$
\exists M<\infty\ \text{使}\ q_0(x)\le M\quad\forall x\in\mathcal X.\tag{84}
$$

现在对 \(\beta<0\) 计算

$$
p_{(\beta,c)}(B) = \frac{\int_B q_0(x)e^{\beta\mathcal J(x)}dx}{\int_{\mathcal X}q_0(x)e^{\beta\mathcal J(x)}dx}.\tag{85}
$$

**对分子取上界。** 对一切 \(x\in B\) 有 \(\mathcal J(x)\ge\mathcal J^\star+\varepsilon\)。由于 \(\beta<0\)，函数 \(t\mapsto e^{\beta t}\) 递减，故 \(e^{\beta\mathcal J(x)}\le e^{\beta(\mathcal J^\star+\varepsilon)}\) 对所有 \(x\in B\) 成立。利用式 (84)，

$$
\int_B q_0(x)e^{\beta\mathcal J(x)}dx\le\int_B M e^{\beta(\mathcal J^\star+\varepsilon)}dx = M\,\mathrm{Leb}(B)\,e^{\beta(\mathcal J^\star+\varepsilon)}\le M\,\mathrm{Leb}(\mathcal X)\,e^{\beta(\mathcal J^\star+\varepsilon)}.
$$

于是

$$
\int_B q_0(x)e^{\beta\mathcal J(x)}dx\le M\,\mathrm{Leb}(\mathcal X)\,e^{\beta(\mathcal J^\star+\varepsilon)}.\tag{86}
$$

**对分母取下界。** 把分母积分限制到集合 \(U'\)。对一切 \(x\in U'\)，由式 (82) 有 \(\mathcal J(x)\le\mathcal J^\star+\varepsilon/2\)，再次利用 \(\beta<0\) 得 \(e^{\beta\mathcal J(x)}\ge e^{\beta(\mathcal J^\star+\varepsilon/2)}\)。利用式 (83)，

$$
\int_{\mathcal X}q_0(x)e^{\beta\mathcal J(x)}dx\ge\int_{U'} q_0(x)e^{\beta\mathcal J(x)}dx\ge\int_{U'} m e^{\beta(\mathcal J^\star+\varepsilon/2)}dx = m\,\mathrm{Leb}(U')\,e^{\beta(\mathcal J^\star+\varepsilon/2)}.
$$

因此

$$
\int_{\mathcal X}q_0(x)e^{\beta\mathcal J(x)}dx\ge m\,\mathrm{Leb}(U')\,e^{\beta(\mathcal J^\star+\varepsilon/2)}.\tag{87}
$$

**合并上下界。** 把式 (86) 与式 (87) 代入式 (85) 得

$$
p_{(\beta,c)}(B)\le\frac{M\,\mathrm{Leb}(\mathcal X)\,e^{\beta(\mathcal J^\star+\varepsilon)}}{m\,\mathrm{Leb}(U')\,e^{\beta(\mathcal J^\star+\varepsilon/2)}} = \frac{M\,\mathrm{Leb}(\mathcal X)}{m\,\mathrm{Leb}(U')}\,e^{\beta\varepsilon/2}.
$$

因此对一切 \(\beta<0\)，

$$
p_{(\beta,c)}(B)\le C e^{\beta\varepsilon/2},\quad\text{其中}\ C:=\frac{M\,\mathrm{Leb}(\mathcal X)}{m\,\mathrm{Leb}(U')}\in(0,\infty).\tag{88}
$$

以下估计是紧空间上标准的 Gibbs 集中/Laplace 原理论证；见 Dembo 与 Zeitouni [51]、Hwang [52]。由于 \(\varepsilon>0\) 且 \(\beta\to-\infty\)，有 \(e^{\beta\varepsilon/2}\to 0\)，故 \(p_{(\beta,c)}(B)\to 0\)。特别地，取 \(\beta<0\) 足够负，使得

$$
C e^{\beta\varepsilon/2}\le\eta.\tag{89}
$$

例如，取任意满足 \(\beta\le\frac{2}{\varepsilon}\log\frac{\eta}{C}\) 的 \(\beta<0\) 即可。

**得出 \(G_\delta\) 上所需的高概率保证。** 由式 (81) 与式 (89)，

$$
p_{(\beta,c)}(A_\delta)\le p_{(\beta,c)}(B)\le\eta.
$$

因此 \(p_{(\beta,c)}(G_\delta)=1-p_{(\beta,c)}(A_\delta)\ge 1-\eta\)。按 \(G_\delta\) 的定义式 (78)，这正是

$$
\mathbb P\bigl(|h_1(X)|\le\delta,\ h_2(X)\le\delta,\ \mathcal L(X)\le\mathcal L^\star+\delta\bigr)\ge 1-\eta,\qquad X\sim p_{(\beta,c)}. \qquad\blacksquare
$$

### F.4 有限粒子保证

命题 F.4 关注的是 Gibbs 后验本身。下面我们把该保证转移到有限粒子采样器所返回的轨迹上。我们考虑算法 1 的多项重采样变体；其他所有数值选择都通过下文定义的离散费曼–卡茨目标进入。

**定理 F.5（带多项重采样的有限粒子 BayesFP）。** 沿用命题 F.4 的记号，包括 \(G_\delta\) 与 \(A_\delta\)。固定 \(\delta>0\) 与使命题 F.4 成立的惩罚 \(c\)，设 \(C,\varepsilon>0\) 为该命题的常数，于是

$$
p_{(\beta,c)}(A_\delta)\le C\exp(\beta\varepsilon/2),\qquad \beta<0.\tag{90}
$$

固定 \(\beta<0\)、算法 1 的按积分次序排列的数值网格 \((t_n)_{n=0}^{N}\)，以及一个与 \(K\) 无关的确定性重采样时间表。

设 \(N_{\mathrm{blk}}\ge 1\) 为把传播与权重累积划分成的加权块数，块索引 \(j\in\{1,\dots,N_{\mathrm{blk}}\}\)。每块终止于一个预定的中间重采样时刻，或终止于最终粒子选择。第一块包含任何初始重要性权重，最后一块包含直到终端选择之前的其余所有权重。空块的权重为一。令 \(E_j\) 为到第 \(j\) 块结束为止的数值提议历史的可测空间，\(Y_j\in E_j\) 表示这样一段历史。其标量未归一化增量势 \(G_j:E_j\to(0,\infty)\) 是第 \(j\) 块内**实际保留**的未中心化权重因子之积；它是一个块权重，区别于附录 C 中使用的扩散矩阵 \(G_t\)。

假设初始提议独立同分布（i.i.d.），传播在给定被选祖先的条件下使用独立随机性，且每个中间重采样步骤都是多项的。具体而言，多项重采样在给定当前加权群体的条件下独立地为每个后代选择祖先，其概率由归一化权重给出。还假设每块都有确定性界 \(\underline g_j\) 与 \(\overline g_j\)，满足

$$
0<\underline g_j\le G_j(y)\le\overline g_j<\infty,\qquad y\in E_j,\quad j=1,\dots,N_{\mathrm{blk}}.\tag{91}
$$

这里 \(y\) 表示一般块历史。势与变异核（即用于把被选历史延伸到下一块的条件概率律）都独立于 \(K\) 固定。

令 \(Q_N\) 为一条**不经重采样**模拟的数值提议路径 \((x_{t_0},\dots,x_{t_N})\) 的概率律。每个 \(Y_j\) 都是到第 \(j\) 块结束为止的相应历史。对 Borel 可测的轨迹事件 \(A\subseteq\mathbb R^d\)，令 \(\mathbf 1_A(x)\) 在 \(x\in A\) 时为一、否则为零。定义数值费曼–卡茨终端概率测度 \(\pi_N\) 为

$$
\pi_N(A) := \frac{\mathbb E_{Q_N}\bigl[\mathbf 1_A(x_{t_N})\prod_{j=1}^{N_{\mathrm{blk}}}G_j(Y_j)\bigr]}{\mathbb E_{Q_N}\bigl[\prod_{j=1}^{N_{\mathrm{blk}}}G_j(Y_j)\bigr]}.\tag{92}
$$

式 (91) 的界保证分母有限且严格正。

利用算法 1 的终端状态 \(x_{t_N}^{(k)}\) 与残差对数权重 \(w_{t_N}^{(k)}\)，定义归一化残差权重

$$
W_N^{(k)} := \frac{e^{w_{t_N}^{(k)}}}{\sum_{\ell=1}^{K}e^{w_{t_N}^{(\ell)}}},\qquad k=1,\dots,K,
$$

其中 \(\ell\) 是对粒子的求和索引。这些权重非负且和为 1。终端随机加权经验测度及其赋予事件 \(A\) 的概率为

$$
\hat\pi_N^K := \sum_{k=1}^{K}W_N^{(k)}\delta_{x_{t_N}^{(k)}},\qquad \hat\pi_N^K(A) = \sum_{k=1}^{K}W_N^{(k)}\mathbf 1_A(x_{t_N}^{(k)}).
$$

令 \(X_{\mathrm{out}}^{K}:=x_{t_N}^{(k^\star)}\) 表示此处考虑的算法 1 多项重采样变体所返回的轨迹。其最终选择规则为

$$
X_{\mathrm{out}}^{K}\mid\hat\pi_N^K\ \sim\ \hat\pi_N^K,
$$

即，在给定加权群体的条件下，它以概率 \(W_N^{(k)}\) 选择 \(x_{t_N}^{(k)}\)。对共同可测空间上的概率测度 \(\mu\) 与 \(\nu\)，定义

$$
\|\mu-\nu\|_{\mathrm{TV}} := \sup_{A\ \text{可测}}|\mu(A)-\nu(A)|,
$$

其中上确界取遍该空间的所有可测事件。对任意随机元 \(Z\)，记 \(\mathrm{Law}(Z)\) 为其概率分布：对其状态空间中每个可测事件 \(A\) 有 \(\mathrm{Law}(Z)(A):=\mathbb P(Z\in A)\)。对随机元组成的元组，\(\mathrm{Law}\) 表示它们的联合概率分布。在把 Gibbs 后验与 \(\mathbb R^d\) 上的数值测度比较时，把 \(p_{(\beta,c)}\) 视为在 \(\mathcal X\) 之外赋零质量。定义确定性目标差异

$$
d_N := \|\pi_N-p_{(\beta,c)}\|_{\mathrm{TV}}.
$$

则存在有限的非负常数 \(B_N\)（依赖于固定的费曼–卡茨模型但与 \(K\) 无关），使得对每个整数 \(K\ge 1\)，

$$
\mathbb P\bigl(X_{\mathrm{out}}^{K}\in G_\delta\bigr)\ \ge\ 1-C\exp(\beta\varepsilon/2)-d_N-\frac{B_N}{K}.\tag{93}
$$

除非下标显式指定了某个测度，下文中的概率与期望都包含初始化、传播、重采样与最终粒子选择，以及证明中引入的辅助重采样抽样。特别地，当费曼–卡茨模型精确瞄准 \(p_{(\beta,c)}\) 时 \(d_N=0\)。

**证明概述。** 把连续两次重采样之间的所有传播与权重累积都归入上文定义的路径值状态 \(Y_j\) 与势 \(G_j\)。初始提议路径是 i.i.d. 的；后续阶段按多项方式选择祖先，并独立地延伸其路径。这正是 Del Moral et al. [53] 第 1.1 节方程 (1.4)–(1.6) 所定义的费曼–卡茨粒子模型（其选择参数置零）。同一文献的方程 (1.2) 明确允许路径值状态。如算法 1 那样从所有对数权重中减去一个公共标量，不改变归一化权重。

仅为分析起见，我们从 \(\hat\pi_N^K\) 额外追加一次 \(K\) 粒子的最终多项重采样，并配以恒等变异（即被选状态保持不变）。其第一个粒子恰好具有 \(X_{\mathrm{out}}^{K}\) 的分布。在式 (91) 下，把 Del Moral et al. [53] 方程 (1.9) 的有限粒子混沌传播估计应用于单粒子分布，给出

$$
\bigl\|\mathrm{Law}(X_{\mathrm{out}}^{K})-\pi_N\bigr\|_{\mathrm{TV}}\le\frac{B_N}{K}.\tag{94}
$$

若粒子状态包含整条路径，则应用终端坐标映射（从该路径中提取终端轨迹 \(x_{t_N}\)）；全变差在可测映射下不会增大。因此

$$
\mathbb P\bigl(X_{\mathrm{out}}^{K}\notin G_\delta\bigr)\le 1-\pi_N(G_\delta)+\frac{B_N}{K}\le p_{(\beta,c)}(A_\delta)+d_N+\frac{B_N}{K}\le C\exp(\beta\varepsilon/2)+d_N+\frac{B_N}{K},
$$

最后一步即式 (90)。取补事件即得结论。∎

**粒子预算的选择。** 对精确瞄准的 Gibbs 后验与任意 \(\eta\in(0,1)\)，先按命题 F.4 选择惩罚，再取 \(\beta<0\) 使 \(C\exp(\beta\varepsilon/2)\le\eta/2\)，最后取 \(K\ge\max\{1,\lceil 2B_N/\eta\rceil\}\)。于是 \(\mathbb P(X_{\mathrm{out}}^{K}\in G_\delta)\ge 1-\eta\)。这些选择的次序很重要：\(B_N\) 可能依赖 \(\beta\)、\(c\)、网格与重采样时间表。对近似目标，只要 \(d_N\le\eta/3\)，把 Gibbs 尾部项与粒子项各控制在至多 \(\eta/3\) 即可得到同样结论。这里不对逆温度或数值分辨率作任何一致的界断言。

**推论 F.6（加权粒子群的集中性）。** 在定理 F.5 的条件下，可选择常数 \(B_N\)，使得对每个整数 \(K\ge 1\) 与每个置信失败概率 \(\alpha\in(0,1)\)，

$$
\mathbb P\left(\hat\pi_N^K(G_\delta)\ \ge\ 1-C\exp(\beta\varepsilon/2)-d_N-\sqrt{\frac{1+8B_N}{K\alpha}}\right)\ \ge\ 1-\alpha.\tag{95}
$$

因此 \(1-\alpha\) 是“随机加权质量 \(\hat\pi_N^K(G_\delta)\) 赋予可接受轨迹”这一下界的置信水平。外层概率是对加权粒子群的构造取的。

**证明概述。** 对 \(i\in\{1,\dots,K\}\)，令 \(Z_i\in\mathbb R^d\) 为上述辅助最终多项重采样之后第 \(i\) 个粒子的终端轨迹。在给定 \(\hat\pi_N^K\) 的条件下，这 \(K\) 个抽取相互独立，且每个都服从概率分布 \(\hat\pi_N^K\)。设 \(q\) 表示联合考虑的粒子数，并令 \(\pi_N^{\otimes q}\) 表示 \((\mathbb R^d)^q\) 上 \(q\) 个来自 \(\pi_N\) 的独立抽取的乘积概率测度。同一混沌传播估计（现在应用于一个或两个粒子）允许选取 \(B_N\)，使

$$
\bigl\|\mathrm{Law}(Z_1,\dots,Z_q)-\pi_N^{\otimes q}\bigr\|_{\mathrm{TV}}\le B_N q^2/K,\qquad q\in\{1,\dots,\min\{2,K\}\}.
$$

固定 Borel 可测事件 \(A\subseteq\mathbb R^d\)，定义中心化指示变量 \(U_i:=\mathbf 1_A(Z_i)-\pi_N(A)\)，\(i=1,\dots,K\)。对 \(K\ge 2\)，辅助粒子是可交换的，即其联合分布在粒子索引的任意置换下不变。可交换性与 \(q=2\) 的界给出

$$
\mathbb E\left[\left(\frac{1}{K}\sum_{i=1}^{K}U_i\right)^2\right]\ \le\ \frac{1}{K}+\frac{K-1}{K}\,\bigl|\mathbb E[U_1U_2]\bigr|\ \le\ \frac{1+8B_N}{K}.
$$

事实上 \(|U_1U_2|\le 1\)，其在 \(\pi_N^{\otimes 2}\) 下的期望为零，而两个绝对值不超过一的函数的期望之差至多是全变差的两倍。在给定加权群体的条件下，

$$
\mathbb E\left[\frac{1}{K}\sum_{i=1}^{K}\mathbf 1_A(Z_i)\ \middle|\ \hat\pi_N^K\right] = \hat\pi_N^K(A).
$$

于是由条件 Jensen 不等式得

$$
\mathbb E\bigl[(\hat\pi_N^K(A)-\pi_N(A))^2\bigr]\le\frac{1+8B_N}{K}.
$$

对 \(K=1\) 该不等式平凡成立。对平方误差应用 Markov 不等式（取 \(A=G_\delta\)、阈值为 \((1+8B_N)/(K\alpha)\)），并利用 \(\pi_N(G_\delta)\ge 1-C\exp(\beta\varepsilon/2)-d_N\)，即得结论。∎

**对所实现采样器的适用范围。** 该定理把有限粒子误差与“数值费曼–卡茨目标同 Gibbs 后验之间的差异”分离开来。特别地，时间离散化、近似得分、遗漏的权重增量以及不正确的初始倾斜律都可能贡献到 \(d_N\)；仅增大 \(K\) 并不能消除这些误差。限制重采样发生的时刻，只要相应权重被保留，就与该定理相容。所述粒子界适用于多项中间重采样；它们不会自动扩展到我们实验中使用的系统重采样——对某些输入次序，系统重采样可能不一致 [54]。

Naesseth et al. [20, 第 2.3 节] 给出了期望 SMC 经验测度与其目标之间 Kullback–Leibler 散度的一个相关界。上文所用的直接全变差估计对所选中轨迹给出 \(O(K^{-1})\) 的界，其中 \(O(K^{-1})\) 意指在整个数值模型固定、\(K\) 增大时被常数乘以 \(K^{-1}\) 所界定。这并不断言每个已实现的粒子群都有 \(O(K^{-1})\) 的误差，后者的波动反而由推论 F.6 控制。

#### F.4.1 目标差异对算法参数的依赖

对固定的粒子更新规则与保留的权重因子，\(d_N\) 与 \(K\) 及重采样周期 \(R\) 无关，只要改变重采样时刻仍保留全部累积权重、且不改变算法 1 中的粒子更新。以下结果描述对 \(d_N\) 的各个单独贡献。本小节中，算法 1 所用的代价 \(\mathcal J\) 具有固定惩罚 \(c\)，定义在提议状态上，并在 \(\mathcal X\) 上与 \(\mathcal J_c\) 一致。逆温度时间表固定，终端值为 \(\beta_{t_N}=\beta\)。

**初始化加权与活跃区间。** 考虑算法 1 从 \(p_{\mathrm{src}}\) 出发、对数权重置零的初始化。在一条按 \(Q_N\) 分布的提议路径上，令 \(\Delta w_n\) 表示由算法 1 相关分支在第 \(n\in\{0,\dots,N-1\}\) 次更新处计算出的标量对数权重增量（在中心化之前、在检查活跃区间之前）。因此 \(\Delta w_n\) 是该算法中 \(\Delta w^{(k)}\) 的单路径对应物，它包含了本次更新所用的积分步长。该定义遵循 \((t_n)_{n=0}^{N}\) 的积分次序，不对任一类策略强加不同的时间约定。定义活跃更新索引

$$
I_N := \bigl\{n\in\{0,\dots,N-1\}:\ t_n\in[t_{\min},t_{\max}]\bigr\}.
$$

定义两个累积的未中心化对数权重

$$
w_{t_N}^{\mathrm{act}} := \sum_{n\in I_N}\Delta w_n,\tag{96}
$$

$$
w_{t_N}^{\mathrm{full}} := \beta_{t_0}\mathcal J(x_{t_0}) + \sum_{n=0}^{N-1}\Delta w_n.\tag{97}
$$

上标 act 与 full 区分“实际保留的权重”与“保留每个增量及初始 Gibbs 因子的权重”。这些是不经重采样的提议路径的累积权重，而不是中间重采样之后的残差粒子对数权重。对这里考虑的初始化，\(e^{w_{t_N}^{\mathrm{act}}}=\prod_{j=1}^{N_{\mathrm{blk}}}G_j(Y_j)\)。式 (97) 中的初始因子预设 \(q_{t_0}=p_{\mathrm{src}}\)；这些源律之间的不匹配是另一项差异。

令 \(\Delta w_N^{\mathrm{omit}}\) 表示被省略的总对数权重：

$$
\Delta w_N^{\mathrm{omit}} := w_{t_N}^{\mathrm{full}}-w_{t_N}^{\mathrm{act}} = \beta_{t_0}\mathcal J(x_{t_0}) + \sum_{n\in\{0,\dots,N-1\}\setminus I_N}\Delta w_n.\tag{98}
$$

令 \(\pi_N^{\mathrm{full}}\) 为使用同一提议律与完整对数权重的对照终端概率测度：

$$
\pi_N^{\mathrm{full}}(A) := \frac{\mathbb E_{Q_N}\bigl[\mathbf 1_A(x_{t_N})e^{w_{t_N}^{\mathrm{full}}}\bigr]}{\mathbb E_{Q_N}\bigl[e^{w_{t_N}^{\mathrm{full}}}\bigr]}.\tag{99}
$$

假设两个累积对数权重在 \(Q_N\) 下都有有限期望绝对值与有限本质上界。定义

$$
\overline{w}_N^{\mathrm{full}} := \operatorname*{ess\,sup}_{Q_N}w_{t_N}^{\mathrm{full}},\qquad \overline{w}_N^{\mathrm{act}} := \operatorname*{ess\,sup}_{Q_N}w_{t_N}^{\mathrm{act}},
$$

其中本质上确界是丢弃 \(Q_N\)-概率为零的提议路径集合后的最小上界。引入平移后的归一化常数 \(Z_N^{\mathrm{full}}\) 与稳定因子 \(\kappa_N\)：

$$
Z_N^{\mathrm{full}} := \mathbb E_{Q_N}\bigl[e^{w_{t_N}^{\mathrm{full}}-\overline{w}_N^{\mathrm{full}}}\bigr],\qquad
\kappa_N := \frac{e^{\max\{0,\ \overline{w}_N^{\mathrm{act}}-\overline{w}_N^{\mathrm{full}}\}}}{Z_N^{\mathrm{full}}}.
$$

这些假设蕴含 \(0<Z_N^{\mathrm{full}}\le 1\) 且 \(\kappa_N<\infty\)。把 Sprungk [55] 的定理 8 应用于提议路径空间、取负对数权重 \(\overline{w}_N^{\mathrm{full}}-w_{t_N}^{\mathrm{full}}\) 与 \(\overline{w}_N^{\mathrm{full}}-w_{t_N}^{\mathrm{act}}\)，得到

$$
\|\pi_N-\pi_N^{\mathrm{full}}\|_{\mathrm{TV}}\le\kappa_N\,\mathbb E_{Q_N}\bigl|\Delta w_N^{\mathrm{omit}}\bigr|.\tag{100}
$$

这里路径测度的界也界定了它们的终端边缘分布，因为全变差在终端坐标映射下不会增大。用完整加权定义剩余差异

$$
e_N^{\mathrm{full}} := \|\pi_N^{\mathrm{full}}-p_{(\beta,c)}\|_{\mathrm{TV}}.
$$

于是由三角不等式得

$$
d_N\le e_N^{\mathrm{full}}+\kappa_N\,\mathbb E_{Q_N}\bigl|\Delta w_N^{\mathrm{omit}}\bigr|.\tag{101}
$$

保留每个增量并补上初始 Gibbs 因子可消除相应的省略项，但不会消除 \(e_N^{\mathrm{full}}\) 中的数值传播误差或学习模型误差。增量 \(\Delta w_n\)、提议律 \(Q_N\)、从而该界都可能依赖 \(\beta_t\)、\(c\)、网格与扩散时间表。特别地，\(\kappa_N\) 中逆归一化常数的依赖允许权重误差被放大；此处不对这些参数断言一致性，也不断言 \(d_N\) 的单调性。

**初始律的扰动。** 另一种对照刻画了初始倾斜的影响。假设所需的初始 Gibbs 边缘分布具有有限且严格正的归一化常数，令 \(\pi_N^{\mathrm{init}}\) 表示同一数值模型在把初始律 \(p_{\mathrm{src}}\) 替换为 \(p_{t_0}(\cdot\mid O=1)\) 后的终端概率测度，而所有后续粒子更新规则与保留权重因子保持不变。在 \(q_{t_0}=p_{\mathrm{src}}\) 下，这就是所需的初始 Gibbs 边缘分布 \(p_{t_0}(\cdot\mid O=1)\propto p_{\mathrm{src}}\exp(\beta_{t_0}\mathcal J)\)。其初始 Gibbs 因子由初始律的改变提供，不再同时计入第一块的势。Giraud 与 Del Moral [56, 引理 6 及引理 11 之后的第 2.1 节] 的稳定性估计，利用有限粒子定理的块势界特化后，给出

$$
\|\pi_N-\pi_N^{\mathrm{init}}\|_{\mathrm{TV}}\ \le\ \left(\prod_{j=1}^{N_{\mathrm{blk}}}\frac{\overline g_j}{\underline g_j}\right)\bigl\|p_{\mathrm{src}}-p_{t_0}(\cdot\mid O=1)\bigr\|_{\mathrm{TV}}.\tag{102}
$$

该界针对与上文相同的零初始权重数值模型。它是式 (100) 中计入初始倾斜省略项的替代方案；该贡献不应被重复计入。

**FK 势积分的离散化。** 令 \(\pi_N^{\mathrm{quad}}\) 表示在精确参考动力学、从精确初始 Gibbs 边缘分布初始化、并对连续对数权重积分在单位生成区间上用 \(N\) 个等距步做左端点求积时所得到的终端 FK 概率测度。该对照保留所有权重增量。为应用所引用的连续时间结果，参考动力学与对数权重速率都用递增的已流逝生成时间表达；对流分支，这意味着要一致地反转其递减的模型时间坐标。设精确连续 FK 终端律为 \(p_{(\beta,c)}\)，且 Del Moral et al. [57] 第 2.1 节情形 (C) 中的正则性假设成立。其定理 3.1 给出

$$
\|\pi_N^{\mathrm{quad}}-p_{(\beta,c)}\|_{\mathrm{TV}}\le\frac{C^{\mathrm{quad}}}{N},\tag{103}
$$

其中 \(C^{\mathrm{quad}}\) 是对固定连续模型与物理时域而言独立于 \(N\) 的有限非负常数；它可能依赖 \(\beta_t\)、\(c\) 与动力学。情形 (C) 要求一个在公共生成元定义域上有界、时间可微的势，以及该处所述的定义域不变性与半群正则性条件。该估计针对的是精确传播下的势求积；它本身不覆盖 Euler–Maruyama 或 DDPM 传播，也不覆盖学到的得分或速度中的误差。因此我们显式保留 \(d_N\)，不对完整数值实现断言速率。

## 附录 G 实验细节

本附录收集正文第 5 节中推迟的实验细节：我们全程使用的避障代价的确切形式、每个基准的任务定义，以及训练/评估协议。

### G.1 避障代价函数

正文所有避碰实验都使用同一个通用代价；任务之间唯一变化的是障碍几何（对 π0.5 则是表示场景的 SDF）。我们在此针对一般障碍物描述一次代价，然后在相关小节中特化。

**机器人本体离散化。** 给定策略预测的动作路点 \(a\)（依实验不同，可以是末端执行器位姿、末端执行器增量或关节位置指令），我们把它映射为世界坐标系中一组 \(N_{\mathrm{body}}\) 个采样的本体系点

$$
B(a) = \{p_1(a),p_2(a),\dots,p_{N_{\mathrm{body}}}(a)\}\subset\mathbb R^3.\tag{104}
$$

对预测末端执行器位姿或末端执行器增量的策略（Diffusion Policy、GR00T-N1.6），\(B(a)\) 在夹爪与臂的最后几个连杆上采样点。对预测关节位置的策略（π0.5），\(B(a)\) 由对预测关节构型施加可微正运动学、并沿每个连杆密集采点得到。

**逐点违反量。** 令 \(\mathcal O\subset\mathbb R^3\) 表示障碍区域，并令

$$
s_{\mathcal O}(p) := \mathrm{sdf}_{\mathcal O}(p)\tag{105}
$$

为其有符号距离函数，约定在障碍外部 \(s_{\mathcal O}(p)>0\)、内部 \(s_{\mathcal O}(p)<0\)。我们定义本体系点 \(p\) 相对 \(\mathcal O\) 的**间隙（clearance）**为

$$
c_{\mathcal O}(p) := s_{\mathcal O}(p)-\varepsilon,\tag{106}
$$

其中 \(\varepsilon>0\) 是一个安全裕度，把障碍略微膨胀，以免机器人擦过其边界。相应的逐点违反量是向膨胀后障碍内部侵入的深度：

$$
\mathrm{viol}_{\mathcal O}(p) := \max\{0,-c_{\mathcal O}(p)\} = \max\{0,\ \varepsilon-s_{\mathcal O}(p)\}\ \ge 0.\tag{107}
$$

当 \(p\) 位于膨胀障碍之外时 \(\mathrm{viol}_{\mathcal O}(p)\) 为零，随侵入内部的距离线性增长。

**轨迹级惩罚。** 给定由 \(H\) 个预测动作路点组成的轨迹 \(x=(a_1,\dots,a_H)\)，碰撞惩罚把式 (107) 在沿轨迹采样的所有本体系点、以及推理时指定的所有障碍 \(\mathcal O_k\) 上聚合：

$$
\mathcal J_{\mathrm{coll}}(x) = \sum_{h=1}^{H}\sum_{p\in B(a_t)}\sum_{k}\mathrm{viol}_{\mathcal O_k}(p).\tag{108}
$$

这就是正文式 (8) 中的 \(\rho(x)\) 项；我们取 \(\mathcal L\equiv 0\)，且避碰实验中没有等式/不等式约束 \(h_1,h_2\)，因此 \(\mathcal J(x)=\mathcal J_{\mathrm{coll}}(x)\)。

实践中 \(\mathrm{viol}_{\mathcal O}\) 在边界 \(s_{\mathcal O}(p)=\varepsilon\) 处非光滑。正如式 (8) 脚注所指出，我们的理论使用 \(C^2\) softplus 松弛 \(\frac{1}{\beta_{\mathrm{sp}}}\mathrm{softplus}\bigl(-\beta_{\mathrm{sp}}c_{\mathcal O}(p)\bigr)\)，但经验上式 (107) 的硬截断也没有问题，我们正是用它产生所报告的数字。全程 \(\varepsilon\) 量级为几厘米（例如圆柱障碍实验中 \(\varepsilon=0.02\) m）。

**特化到圆柱障碍（Diffusion Policy、GR00T-N1.6）。** 在 Diffusion Policy 与 GR00T-N1.6 的实验中，推理时障碍物是一个半径为 \(r\)、中心在 \((c_x,c_y)\)、沿世界 \(z\) 轴拉伸的竖直圆柱。其有符号距离函数退化为平面径向距离：

$$
s_{\mathcal O}(p) = \bigl\|p_{xy}-(c_x,c_y)\bigr\|_2 - r,\tag{109}
$$

于是式 (107) 的逐点违反量变为

$$
\mathrm{viol}_{\mathcal O}(p) = \max\Bigl\{0,\ (r+\varepsilon)-\bigl\|p_{xy}-(c_x,c_y)\bigr\|_2\Bigr\}.\tag{110}
$$

非凸 LIBERO 实验中使用的 V 形障碍物以类似方式实现：它是两个以一定角度连接的厚长方体棱柱之并，其 SDF 取两个棱柱 SDF 的最小值。

**特化到在线 SDF（π0.5）。** 对 π0.5 实验，我们无法访问障碍几何。取而代之，我们遵循正文第 5.1 节，用 nvblox [30] 从仿真器的深度观测构建场景的在线有符号距离函数 \(\hat s(p)\)。所有不是当前操作/抓取目标的对象，连同支撑桌面，都被标记为可碰撞。然后在式 (107) 与式 (108) 中取 \(s_{\mathcal O}(p)\equiv\hat s(p)\)。

### G.2 消融中使用的约束违反度量

令 \(N\) 为评估回合数。对每个回合 \(i\in\{1,\dots,N\}\)，我们在仿真中 rollout 策略，并记录每个仿真步 \(t\in\{0,1,\dots,T_i-1\}\) 上执行的末端执行器位置 \(e_t^{(i)}\in\mathbb R^3\)。令 \(\mathcal O\subset\mathbb R^3\) 表示推理时障碍区域，\(s_{\mathcal O}:\mathbb R^3\to\mathbb R\) 为其有符号距离函数，约定与之前完全一致：外部 \(s_{\mathcal O}(p)>0\)、内部 \(s_{\mathcal O}(p)<0\)。我们定义回合 \(i\) 在步 \(t\) 的**瞬时穿透深度**为

$$
p_t^{(i)} \triangleq \bigl[-s_{\mathcal O}\bigl(e_t^{(i)}\bigr)\bigr]_{+} = \max\Bigl(0,\ -s_{\mathcal O}\bigl(e_t^{(i)}\bigr)\Bigr),\tag{111}
$$

即执行的末端执行器越过障碍边界 \(\partial\mathcal O=\{p:s_{\mathcal O}(p)=0\}\) 的深度（当末端执行器位于 \(\mathcal O\) 之外时为零）。注意，与代价 \(\mathcal J_{\mathrm{coll}}\) 内部所用的逐点违反量 \(\mathrm{viol}_{\mathcal O}\)（式 (110)）不同，该度量采用零膨胀（\(\varepsilon=0\)），因此 \(p_t^{(i)}\) 报告的是向 \(\mathcal O\) 的几何穿透，而不是向膨胀障碍 \(\{p:s_{\mathcal O}(p)<\varepsilon\}\) 的穿透。我们沿执行轨迹聚合，得到每回合总穿透

$$
P^{(i)} \triangleq \sum_{t=0}^{T_i-1}p_t^{(i)},\tag{112}
$$

再跨回合取平均，得到**平均总穿透**

$$
\bar P \triangleq \frac{1}{N}\sum_{i=1}^{N}P^{(i)}.\tag{113}
$$

按构造 \(\bar P\ge 0\)，且 \(\bar P=0\) 当且仅当没有任何执行轨迹进入过 \(\mathcal O\)。\(\bar P\) 越大，意味着侵入越深、在障碍内停留越久，或二者兼有。由于 \(p_t^{(i)}\) 是在固定时长 \(\Delta t\) 的离散仿真步上求和的，\(\bar P\) 与跨回合平均的每回合时间积分穿透 \(\int_0^{T_i\Delta t}p^{(i)}(\tau)d\tau\) 只差常数因子 \(\Delta t\)。障碍区域 \(\mathcal O\) 及其 SDF \(s_{\mathcal O}\) 按附录 G.1 所述逐任务特化（例如 Push-T 与 RoboMimic 实验中为中心在 \(c\)、半径为 \(R\) 的竖直圆柱，非凸 LIBERO 实验中为两个棱柱的 V 形并，π0.5 实验中为在线 nvblox SDF）。全程取 \(\Delta t=0.05\) s、每个配置 \(N=50\) 个回合。

### G.3 任务描述与数据集

**RoboMimic 上的 Diffusion Policy（Can、Transport）。** 我们使用 Chi et al. [2] 为 RoboMimic 基准 [31] 的 **Can** 与 **Transport** 任务发布的预训练基于图像的 Diffusion Policy 检查点，二者都在 **Proficient-Human（PH）** 子集上训练（由单个熟练遥操作者采集的 200 条成功演示）。在 Can 任务中，单个 7 自由度 Franka Panda 臂必须从一侧料箱抓起易拉罐并放入相邻的目标箱。在 Transport 任务中，两条 Franka Panda 臂必须协作把锤子从起始箱转移到目标箱，这要求两臂在半空中完成交接。策略输出世界坐标系中一段时域的绝对末端执行器位置路点。推理时我们引入一个额外的圆柱障碍物：Can 任务中位于两箱之间，Transport 任务中位于双臂交接位置；该障碍在训练中从未出现，策略必须在完成任务的同时避开它。我们在每个条件下用随机化初始物体位姿评估 50 次 rollout。

**LIBERO-Object 上的 GR00T-N1.6。** 我们在 LIBERO-Object 套件 [32] 上微调预训练的 GR00T-N1.6 基础模型 [24]，使用发布的 **Proficient-Human（PH）** 演示（每任务 50 条遥操作轨迹）。LIBERO-Object 由 10 个抓取—放置任务组成：Franka Panda 臂必须从厨房桌面抓起指定杂货物品并放入白色篮子；任务之间仅目标物体的身份不同（字母汤、黄油、奶油奶酪、番茄酱、番茄沙司、沙拉酱、牛奶、橙汁、BBQ 酱、巧克力布丁）。对推理时碰撞实验，我们把评估限制在“Pick up the butter and place it in the basket（抓起黄油放入篮子）”这一任务上。这样做是因为：一旦在桌面与篮子之间插入圆柱形或 V 形半透明障碍物，大多数其他 LIBERO-Object 任务在几何上变得**不可行**——无论使用哪种碰撞感知规划器，目标物体都只能沿一条迫使夹爪穿过障碍物的路径被抬起与搬运。黄油任务是唯一一个目标物体位姿与篮子位姿在障碍就位时仍容许无碰撞抓放轨迹的任务，从而把约束满足与可行性分离开来。策略输出世界坐标系下的末端执行器动作增量；我们在每个条件下用随机化初始场景配置评估 100 次 rollout。

**RoboLab 上的 π0.5。** 我们使用已在 DROID 数据集 [33] 上微调过的预训练 π0.5 [25] 检查点，并在四个位于 π0.5 训练分布之外的 RoboLab [34] 任务上零样本评估它（不再进一步微调）。RoboLab 是一个基于 Isaac Lab 的基准，包含 120 多个桌面操作任务，具有照片级真实感渲染，并通过可组合谓词自动检测成功。我们使用的四个任务是：

- **FoodPacking2CansTask。** Franka Panda 臂必须从杂乱的桌面上抓起两个汤罐头式食品，并把它们竖直放入指定的打包箱。
- **BBQSauceInBinTask。** 机械臂必须从一组干扰杂货中挑出 BBQ 酱瓶，并把它们放入目标箱，同时不碰倒相邻物品。
- **HammersInLeftBinTask。** 机械臂必须从有多个料箱的车间场景中选出锤形工具物体，并把每一个放入特别指定的左侧料箱。
- **TakeMugsOffOfShelfTask。** 机械臂必须抓起搁在多层层架上的杯子，并把它们放到层架前方的桌面上，这要求伸入一个受约束、部分封闭的工作空间。

在四个任务上，π0.5 输出的都是 7 自由度关节位置指令而非笛卡尔位姿；因此我们对正运动学求导，把关节轨迹映射为采样的本体系点，以评估式 (108)。由于 RoboLab 场景包含许多位姿并不直接暴露给策略的物体，我们使用上述在线 SDF 构造，而非解析障碍几何。我们把**每一个**非目标物体（包括桌面）都视为可碰撞障碍。对每个任务，我们报告按 RoboLab 内置谓词定义的完成任务成功率，以及 rollout 过程中任一采样本体系点穿透 SDF 零水平集的比率。

**真实世界 SO101（带杯子障碍的 PickAndPlace；BimodalMugSelection）。** 我们另在低成本 SO101 机械臂 [35] 上、于两个真实世界任务中验证方法：每个任务仅用 20 条遥操作演示微调 π0.5 [25]。演示通过主从遥操作采集，策略输出关节位置指令。与 π0.5 实验一样，我们对正运动学求导把关节轨迹映射为采样本体系点，并使用两个相机：一个普通 RGB 相机与一个 RGB-D（Intel RealSense LiDAR Camera L515）相机。每个不是当前操作目标的对象都被视为可碰撞障碍。

- **以杯子为障碍的 PickAndPlace。** 训练数据由 20 条演示组成：机械臂从工作空间的固定区域抓起一个黄色玩具，并把它放入固定目标位置的碟子，路径上没有障碍。推理时我们引入一个训练中从未见过的陶瓷杯，放在抓取点与放置点之间的直线路径上。因此该杯子是纯粹的推理时障碍：预训练策略没有任何避让行为的演示，FKC 采样器必须在线重塑学到的轨迹分布以绕开它。
- **BimodalMugSelection。** 训练数据由 20 条演示组成：机械臂从桌上抓起一个小黄色玩具，并把它放入位于工作空间左侧和右侧的两个陶瓷杯之一；(20) 条演示在两个目的地之间均匀分配，因此预训练策略在放置目标上是双峰的。推理时我们把语言输入条件化为“place the yellow object in the right mug（把黄色物体放进右杯）”，并额外引入一个禁止左杯附近区域的推理时约束，通过与上文相同的基于 SDF 的碰撞代价编码。该实验探查了本框架的一种互补用法：不是避开训练中缺席的物体，而是用代价来**抑制两个训练中固有模态之一**，而该模态的选择无法仅靠语言条件化可靠地强制。

### G.4 实现细节

重加权方面我们全程使用附录 D 的序贯蒙特卡洛方案——在活跃区间 \([t_{\min},t_{\max}]\) 上做系统重采样——而**不是**马尔可夫跳过程解释；我们发现 SMC 更易实现，且在每项任务上都足够。我们还把每步对数权重增量在累积之前沿 \(K\) 个粒子中心化：这是一个无偏基线，能使有效样本量保持良态。对两个流策略，我们用一阶 Euler–Maruyama 积分器离散加权 SDE。对扩散策略而言这是一个实现选择而非数学选择：发布的 Diffusion Policy 检查点附带 DDPM 噪声调度器与训练好的 ϵ-网络，而非单独学习的得分模型，因此得分只通过 ϵ-网络提供的恒等式 \(\nabla\log q_t(x)=-\epsilon_\theta(x,t)/\sigma'_t\) 进入算法 1 的漂移。具体做法如下：与其把 \(\epsilon_\theta\) 转回得分再跑一个单独的 Euler–Maruyama 循环，我们直接把代价倾斜的噪声预测喂给该调度器原生的 DDPM 祖先更新

$$
\tilde\epsilon_\theta(x,t) := \epsilon_\theta(x,t) - \tfrac{1}{2}\beta_t\sigma'_t\nabla\mathcal J(x),\qquad \sigma'_t:=\sqrt{1-\bar\alpha_t},
$$

它通过恒等式 \(s=-\epsilon_\theta/\sigma'_t\) 把代价倾斜的得分 \(s+\frac{\beta_t}{2}\nabla\mathcal J\) 代入 ϵ-参数化。这在连续时间极限下等价于在代价倾斜的 VP-SDE 上运行 Euler–Maruyama——DDPM 祖先步正是该 SDE 的一种特定离散化，其每步方差增量为 \(\sigma_t^2\Delta t=1-\bar\alpha_t/\bar\alpha_{t-1}\)，而算法 1 中的 FK 对数权重使用的正是这个匹配的增量。\(N\) 步结束后，我们从残差对数权重中抽取一个多项样本，为每个批元素返回一个动作。

**Sigma 时间表。** 布朗扩散率 \(\sigma_t\) 是把确定性流提升为容许费曼–卡茨倾斜的保持边缘分布 SDE 的关键。对两个流策略（π0.5 与 GR00T-N1.6）我们使用 Singh 与 Fischer [16] 的“双端归零”时间表

$$
\sigma_t=\alpha\sqrt{t(1-t)},\qquad \alpha=0.25,
$$

它在去噪中段达到峰值、在数据端点与噪声端点都消失；这与 Singh 与 Fischer [16] 中最优的 ImageNet 时间表一致，我们也发现它在每项任务上都足够。对 DDPM 扩散策略，我们继承训练好的调度器的保方差（VP）扩散率 \(\sigma_t^2\Delta t=1-\bar\alpha_t/\bar\alpha_{t-1}\)，不引入额外旋钮；这使 \(\beta=0\) 时的提议过程与标准 DDPM 祖先采样器完全相同。两种情形下我们都使用恒定的逆温度时间表 \(\beta_t\equiv-\gamma\)（\(\gamma>0\)），于是 FK 权重中的 \((\beta_{t+\Delta t}-\beta_t)\mathcal J\) 项消失，只剩内积项；强度 \(\gamma\) 是主导的引导旋钮，正文中对其做了变化。

**活跃区间。** 我们对三种策略统一使用同一窗口 \([t_{\min},t_{\max}]=[0.05,0.95]\)，只裁剪最初与最后几步——那里插补的得分/速度最不可靠（得分表达式中 \(1/t\) 或 \(1/(1-t)\) 在端点处发散）。

**粒子数。** 扩散策略用 \(K=32\) 个粒子，GR00T-N1.6 用 \(K=8\)，π0.5 用 \(K=4\)（受更大的每步主干/VLM 开销限制）。图 5a 中 \(K\) 变化的粒子数消融是唯一例外。

## 附录 H 记号

本附录汇总全文使用的记号。符号按作用分组；末尾给出一个刻意的重载/依赖上下文的符号短表。

**表 3：本文所用记号汇总。**

**集合、空间与算子**

| 符号 | 说明 |
|---|---|
| \(\mathbb R^d\) | \(d\) 维欧氏空间，轨迹/动作所在空间。 |
| \(d\) | 轨迹（控制输入）空间的维数。 |
| \(\mathcal X\subset\mathbb R^d\) | 优化的可行域；在证明中为具有非空内部的紧集。 |
| \(\mathcal F\) | 可行集 \(\{x\in\mathcal X:\ h_1(x)=0,\ h_2(x)\le 0\}\)。 |
| \(I_d,\ \mathbf I\) | \(d\times d\) 单位矩阵。 |
| \(\nabla\) | 梯度算子（关于状态 \(x\)）。 |
| \(\nabla\cdot,\ \langle\nabla,\cdot\rangle\) | 散度算子；两种记号可互换使用。 |
| \(\Delta\) | 拉普拉斯算子，\(\Delta=\nabla\cdot\nabla\)。 |
| \(\langle\cdot,\cdot\rangle\) | 欧氏内积。 |
| \(\|\cdot\|_2\) | 欧氏（\(\ell_2\)）范数。 |
| \(\mathbb E[\cdot]\) | 期望；下标表示分布。 |
| \(\mathbb P(\cdot)\) | 事件概率。 |
| \(\mathrm{Leb}(\cdot)\) | 集合的 Lebesgue 测度。 |
| \((u)^{+}\) | 正部，\(\max(0,u)\)。 |
| \((u)^{-}\) | 负部，\(\max(0,-u)\)。 |
| \(\delta_z(\cdot)\) | 中心在 \(z\) 的 Dirac 测度。 |

**时间变量**

| 符号 | 说明 |
|---|---|
| \(\tau\in[0,1]\) | 前向（加噪）时间；\(\tau=0\) 为干净数据，\(\tau=1\) 为噪声。 |
| \(t\in[0,1]\) | 逆向（去噪/生成）时间，\(t=1-\tau\)。参见下文关于时间约定的说明。 |

**状态与轨迹**

| 符号 | 说明 |
|---|---|
| \(x\) | 从策略抽取或由策略产生的轨迹/控制输入序列（动作增量、关节位置或末端执行器位姿）。 |
| \(x_\tau\) | 前向加噪 SDE 在时间 \(\tau\) 的状态。 |
| \(x_t\) | 逆向生成过程在时间 \(t\) 的状态。 |
| \(x_{\mathrm{data}}\) | 干净专家演示，\(x_{\mathrm{data}}\sim p_{\mathrm{data}}\)。 |
| \(x_{\mathrm{src}}\) | 源噪声样本，\(x_{\mathrm{src}}\sim p_{\mathrm{src}}=\mathcal N(0,I_d)\)。 |
| \(\tilde x\) | 哑积分变量（例如归一化积分中）。 |
| \(x_t^{(k)}\) | 第 \(k\) 个费曼–卡茨粒子在时间 \(t\) 的状态。 |
| \(h(x_{\mathrm{data}},x_{\mathrm{src}},t)\) | 数据与源端点之间时间可微的插值；默认线性插值 \(x_t=(1-t)x_{\mathrm{data}}+t\,x_{\mathrm{src}}\)。 |

**分布与密度**

| 符号 | 说明 |
|---|---|
| \(p_{\mathrm{data}}(x)\) | 专家演示分布；贝叶斯先验。是 \(p_{\mathrm{data}}(x\mid o)\) 的简写（始终以观测为条件）。 |
| \(p_{\mathrm{src}}(x)\) | 可处理的源分布，通常为 \(\mathcal N(0,I_d)\)。 |
| \(\mathcal N(0,I_d)\) | 标准 \(d\) 维高斯。 |
| \(\nu(x_{\mathrm{data}},x_{\mathrm{src}})\) | （数据, 源）对上的耦合分布；独立耦合 \(\nu\equiv p_{\mathrm{data}}p_{\mathrm{src}}\) 是常用选择。 |
| \(p_t(x)\) | 逆时 \(t\) 的边缘密度，\(p_t=p_{1-\tau}\)（记号重载；见下注）。 |
| \(q_t(x)\) | 预训练扩散/流策略（基座过程）在时间 \(t\) 的边缘密度。 |
| \(p(x\mid O=1)\) | 最优轨迹上的目标后验，\(\propto p_{\mathrm{data}}(x)\exp(\beta\mathcal J(x))\)。 |
| \(p_t(x\mid O=1)\) | 时间 \(t\) 的后验（Gibbs 倾斜）边缘，\(\propto q_t(x)\exp(\beta\mathcal J(x))\)。 |
| \(p_{(\beta,c)}(dx)\) | 逆温度 \(\beta\)、惩罚 \(c\) 下的 Gibbs 倾斜分布（证明记号）。 |
| \(p_t^{\mathrm{FK}}(x)\) | 费曼–卡茨加权密度（重加权粒子群的密度）。 |
| \(p_t^{\mathrm{ode}}(x)\) | 纯在确定性输运下演化的密度（连续性方程）。 |
| \(p_t^{\mathrm{diff}}(x)\) | 纯在布朗扩散下演化的密度（热方程）。 |
| \(p_t^{\mathrm{sde}}(x)\) | （未加权）SDE 的密度，由福克–普朗克方程支配。 |
| \(p_t^{\mathrm{w}}(x)\) | 由对数权重 \(w_t\) 诱导的加权密度（重加权方程）。 |
| \(p_t^{\mathrm{jump}}(x)\) | 马尔可夫跳过程重加权下的密度。 |
| \(p_t^{K}(z)\) | \(p_t\) 的经验粒子近似 \(\frac{1}{K}\sum_k\delta_z(x^{(k)})\)。 |
| \(p(x_{\mathrm{data}}\mid x_t)\) | 给定加噪状态时干净样本的后验（用于得分插补）。 |
| \(p_t(x_t\mid x_{\mathrm{data}})\) | 给定数据端点时插值量的条件（高斯）密度；均值 \((1-t)x_{\mathrm{data}}\)，协方差 \(t^2I_d\)。 |
| \(Z_t\) | 倾斜边缘的归一化常数（配分函数），\(Z_t=\int q_t(\tilde x)\exp(\beta\mathcal J(\tilde x))d\tilde x\)。 |

**扩散与流动力学**

| 符号 | 说明 |
|---|---|
| \(f_\tau(x_\tau),\ f_t(x_t)\) | 加噪/去噪 SDE 的漂移；常取线性 \(f_\tau=\alpha_\tau x_\tau\)。 |
| \(\alpha_\tau\) | 线性漂移的系数。 |
| \(\sigma_\tau,\ \sigma_t\) | 前向/逆向 SDE 的扩散系数（噪声尺度）。 |
| \(W_\tau,\ W_t\) | 标准维纳过程；\(dW\) 为其增量。 |
| \(v_t(x),\ v(x_t,t)\) | （整流）流学到的速度场；\(v_t(x)=\mathbb E[x_{\mathrm{src}}-x_{\mathrm{data}}\mid x,t]\)。 |
| \(\nabla\log p_t(x)\) | 边缘 \(p_t\) 的得分函数。 |
| \(\nabla\log q_t(x)\) | 策略/流边缘的得分；对高斯源可由 \(v_t\) 闭式得到（命题 C.3）：\(\nabla\log p_t(x)=-\bigl((1-t)v_t(x)+x\bigr)/t\)。 |
| \(\tilde\sigma(t),\ \tilde\sigma_t\) | 用于把确定性流重述为保持边缘分布 SDE 的辅助（自由）扩散系数。 |
| \(\gamma_t\ge 0\) | 在 SDE 族中缩放原扩散贡献的标量（定理 C.1）。 |
| \(G_t(x)\) | 一般 Itô SDE 的（矩阵）扩散系数。 |
| \(\tilde G_t(x)\) | 注入额外随机性的辅助扩散矩阵（定理 C.1）。 |
| \(\bar f\) | 等价（同边缘）SDE 的修正漂移。 |
| \(\bar G\) | 等价 SDE 的修正扩散。 |

**贝叶斯后验、代价与受约束优化**

| 符号 | 说明 |
|---|---|
| \(O\in\{0,1\}\) | 二值最优性指示；\(O=1\) 标记满足最优性判据的轨迹。 |
| \(p(O=1\mid x)\) | 给定轨迹时最优性的似然，\(\exp(\beta\mathcal J(x))\)。 |
| \(\beta<0\) | 控制代价诱导倾斜强度的逆温度。 |
| \(\beta_t\) | 逆温度时间表（时变 \(\beta\)）；\(\partial\beta_t/\partial t\) 进入权重更新。 |
| \(\mathcal J(x)\) | 惩罚增广代价，编码推理时受约束问题。 |
| \(\mathcal J_c(x)\) | 带显式惩罚权重 \(c\) 的惩罚目标（证明记号）。 |
| \(\mathcal L(x)\) | 待最小化的任务目标。 |
| \(\rho(x)\) | 附加惩罚项。 |
| \(h_1(x)\) | 等式约束函数，\(h_1(x)=0\)。 |
| \(h_2(x)\) | 不等式约束函数，\(h_2(x)\le 0\)。 |
| \(c_1,c_2>0\) | 等式与不等式项的惩罚权重；\(c=(c_1,c_2)\)。 |
| \(\mathcal L^\star\) | 可行集上的最优目标值，\(\min_{x\in\mathcal F}\mathcal L(x)\)。 |
| \(\mathcal J^\star,\ \bar{\mathcal J}^\star\) | 惩罚目标在 \(\mathcal X\) 上的最小值。 |
| \(\nabla\mathcal J(x)\) | 代价梯度（代价感知漂移修正）。 |
| \(\Delta\mathcal J(x)\) | 代价的拉普拉斯（出现在一般权重更新中）。 |
| \(\mathrm{softmax}\{0,\cdot\}\) | \(\max\{0,\cdot\}\) 的 \(C^2\) 光滑 max 松弛（softplus）；经验上使用硬截断。 |
| \(\beta_{\mathrm{sp}}\) | softplus 松弛的锐度参数，\(\frac{1}{\beta_{\mathrm{sp}}}\mathrm{softplus}(-\beta_{\mathrm{sp}}c_{\mathcal O})\)。 |
| \(\lambda_t\) | 线性组合基线的引导强度（\(\nabla\log q_t+\lambda_t\nabla\mathcal J\)，或 \(v_t+\lambda_t\nabla\mathcal J\)）；区别于跳速率 \(\lambda_t(x)\)。 |

**费曼–卡茨权重与 SNIS**

| 符号 | 说明 |
|---|---|
| \(w_t\) | 粒子/轨迹携带的对数重要性权重；\(dw_t\) 为其增量。 |
| \(g_t(x)\) | 重加权函数：所模拟动力学与目标密度演化之间的差异。 |
| \(\bar g_t(x)\) | 中心化重加权函数，\(\bar g_t=g_t-\int g_t\,p_t^{\mathrm{FK}}dx\)，保证归一化保持。 |
| \(a\in\mathbb R\) | 在漂移与权重之间重新分配倾斜的自由设计参数；规范选择 \(a=\beta_t\sigma_t^2/2\)。（区别于动作路点 \(a\)。） |
| \(K\) | 费曼–卡茨粒子（并行轨迹）数。 |
| \(\{x_t^{(k)},w_t^{(k)}\}_{k=1}^{K}\) | 一批带对数权重的模拟粒子。 |
| \(w_T^{(k)}\) | 粒子 \(k\) 的终端对数权重（用于 SNIS）。 |
| \(\phi(x)\) | 任意测试函数，其目标期望被估计（常取 \(\phi(x)=x\)）。 |
| \(\mathbb E_{p_t^{\mathrm{FK}}}[\phi(x_t)]\) | 由自归一重要性采样（SNIS）估计的目标期望。 |

**重采样与跳过程解释**

| 符号 | 说明 |
|---|---|
| \(\lambda_t(x)\) | 跳过程速率函数（跳事件频率），\(\lambda_t(x)=\bigl(g_t(x)-\mathbb E_{p_t}[g_t]\bigr)^{-}\)。 |
| \(J_t(y\mid x)\) | 跳发生时的下一状态马尔可夫转移核（采样核，**不是**代价）。 |
| \(\mathbb E_{p_t}[g_t]\) | 重加权函数在 \(p_t\) 下的群体均值。 |
| \(w_t^{(k)}=g_t(x_t^{(k)})dt\) | 用于系统重采样的每步权重增量。 |
| \([t_{\min},t_{\max}]\) | 执行重采样的“活跃区间”；区间外权重置零。 |

**机器人本体、障碍与碰撞代价**

| 符号 | 说明 |
|---|---|
| \(o\) | 当前传感器观测（通常 RGB 相机）；始终作为条件，记号中省略。 |
| \(a\) | 预测的动作路点（末端执行器位姿/增量或关节指令）。区别于 FK 设计参数 \(a\)。 |
| \(B(a)\) | 动作 \(a\) 的世界坐标系中 \(N_{\mathrm{body}}\) 个采样机器人本体系点的集合。 |
| \(p_i(a)\) | 第 \(i\) 个采样本体系点，\(p\in\mathbb R^3\)。 |
| \(N_{\mathrm{body}}\) | 采样的机器人本体系点数。 |
| \(H\) | 轨迹时域（预测动作路点数）；\(x=(a_1,\dots,a_H)\)。 |
| \(a_h\) | 时域步 \(h\) 的动作路点。 |
| \(\mathcal O\subset\mathbb R^3\) | 障碍区域（花体；区别于最优性指示 \(O\)）。 |
| \(\mathcal O_k\) | 推理时指定的第 \(k\) 个障碍。 |
| \(\partial\mathcal O\) | 障碍边界，零水平集 \(\{p:s_{\mathcal O}(p)=0\}\)。 |
| \(s_{\mathcal O}(p),\ \mathrm{sdf}_{\mathcal O}(p)\) | \(\mathcal O\) 的有符号距离函数（外正内负）。 |
| \(\hat s(p)\) | π0.5 实验中由深度（nvblox）构建的场景在线 SDF。 |
| \(c_{\mathcal O}(p)\) | 本体系点的间隙，\(s_{\mathcal O}(p)-\varepsilon\)。 |
| \(\varepsilon>0\) | 使障碍膨胀的 SDF 安全裕度（几厘米）。区别于证明中的能量间隙 \(\varepsilon\)。 |
| \(\mathrm{viol}_{\mathcal O}(p)\) | 逐点向内穿透，\(\max\{0,\varepsilon-s_{\mathcal O}(p)\}\)。 |
| \(\mathcal J_{\mathrm{coll}}(x)\) | 轨迹级碰撞惩罚，在体点、路点与障碍上对 \(\mathrm{viol}\) 求和。 |
| \(p_{xy}\) | 本体系点的平面（\(xy\)）投影（圆柱 SDF）。 |
| \((c_x,c_y)\) | 圆柱障碍的中心。 |
| \(r,\ R\) | 圆柱障碍的半径。 |

**评估度量（消融）**

| 符号 | 说明 |
|---|---|
| \(N\) | 评估回合数。 |
| \(e_t^{(i)}\in\mathbb R^3\) | 回合 \(i\) 在仿真步 \(t\) 上执行的末端执行器位置。 |
| \(T_i\) | 回合 \(i\) 的仿真步数。 |
| \(p_t^{(i)}\) | 瞬时穿透深度 \(\max\{0,-s_{\mathcal O}(e_t^{(i)})\}\)（零膨胀，\(\varepsilon=0\)）。 |
| \(P^{(i)}\) | 每回合总穿透，\(\sum_t p_t^{(i)}\)。 |
| \(\bar P\) | 回合平均总穿透，\(\frac{1}{N}\sum_i P^{(i)}\)。 |
| \(\Delta t\) | 仿真步时长（例如 \(0.05\) s）。 |

**关于重载/依赖上下文记号的说明。** 少数符号依上下文承载不同含义；我们在此汇总以避免混淆。

- **\(t\) 的时间约定。** 对扩散（第 2.1 节），我们取 \(t=1-\tau\)，因此生成从 \(x_{t=0}\sim\mathcal N(0,I)\)（噪声）开始，向前积分至 \(x_{t=1}\)（数据）。对流设置（第 2.2 节），端点相反：\(x_{t=0}=x_{\mathrm{data}}\) 且 \(x_{t=1}=x_{\mathrm{src}}\sim\mathcal N(0,I)\)，推理从 \(t=1\) 到 \(t=0\) 积分。而采样 SDE 与算法 1 使用递增的生成时间，并在 \(1-t\) 处评估流模型。
- **\(p_t(\cdot)\)** 表示一般边缘密度；在附录中它被重载为任意边缘，并在明确说明处可表示后验边缘。
- **\(a\)** 既是费曼–卡茨漂移修正的自由设计参数，又（在实验中）是预测的动作路点。
- **\(\varepsilon\)** 既是碰撞代价中的 SDF 安全裕度，又是集中性证明中严格正的能量间隙。
- **\(\lambda_t\)** 是线性组合基线的标量引导强度，而 \(\lambda_t(x)\) 是跳过程的速率函数。
- **\(O\) 与 \(\mathcal O\)：** \(O\) 是二值最优性指示；\(\mathcal O\)（花体）是障碍区域。
- **\(\mathcal J\) 与 \(J_t\)：** \(\mathcal J\)（以及 \(\mathcal J_c\)、\(\mathcal J_{\mathrm{coll}}\)）是惩罚增广代价；\(J_t(y\mid x)\) 是马尔可夫跳转移核。
- **\(r\) 与 \(R\)** 在不同小节中都表示圆柱障碍的半径；\(c\) 既作为惩罚向量 \((c_1,c_2)\)，又作为间隙 \(c_{\mathcal O}\)。

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、关键词、正文第 1–7 节（§2.1–2.3、§4.1–4.4、§5.1–5.2、§6、§7）、式 (1)–(113) 编号、算法 1（逐行）、表 1（仿真碰撞/成功率，11 行 × 10 数值列，含原文加粗最优标记）、表 2（真实世界结果）、表 3（记号汇总，按原文分组逐项转写）、图 1–5 图注、参考文献 [1]–[57]（英文原条目），以及附录 A–H（含附录 C/D/F 的完整推导与证明）。**已知缺陷与核对说明：** ① pypdf 抽取存在编码错乱：Feynman–Kac 的连字符、π0.5 的 π、希腊字母 β/λ、算子 ∇、尖括号 ⟨·⟩ 与比例号 ∝ 等字符均被错误解码成汉字（例如“Feynman”与“Kac”之间出现乱码、π 变成“蟺”），本页按 PDF 渲染页核对后统一还原，未在正文中残留乱码；② 正文式 (1)–(14) 与定理/推论 4.1–4.3 已按 PDF 第 1、2、5、6 页渲染核对；附录 B/C/D/F 的式 (15)–(77)、附录 G 的式 (104)–(113) 依据 pypdf 抽取文本还原，仅重点式（如 (60)–(61)、(67)–(68)、(72)、(74)–(75)）结合渲染页（第 24–25、37 页）复核，未逐页渲染全部附录公式；③ 算法 1 依 PDF 第 20 页渲染逐行转写，其中第 8、13 行的 $\Delta w$ 括号与原文一致；④ 表 1 的加粗最优值已按 PDF 第 7 页放大核对（含并列最优：Can 成功率 96% 四处并列、Transport 碰撞率 4% 两处并列、LIBERO-Obj.+圆柱碰撞率 0% 两处并列、LIBERO-Obj.+V 形成功率 75% 两处并列）；⑤ 表 3（记号）在原文中跨第 38–42 页、以“continued on next page”续接，本页按符号作用重新分组为多个 Markdown 表，内容逐项对应原文，未增删符号；⑥ 原文偶有笔误（如“Gibbs titled marginals”“expect for the base drift”“RBG-D”），译文按语义处理并在相应处保持原意，未据以改写公式；⑦ 第 6 页“Cor. 4.2”中 $C,\varepsilon$ 依赖惩罚权重 $c$，译文按原文表述保留；⑧ 图 1–5 为位图，图注按原文翻译，未推测图中未标注的数值；图 5(b) 图例（$c_2=1,\dots,100000$）与轴范围按渲染页补注。**建议后续 QA 重点：** 式 (60)–(61) 与 (72) 的长括号归属、式 (100)–(103) 中稳定因子与差异分解的记号、表 1 π0.5 分块的“每时间步碰撞率”口径、以及附录 F.1.1 中时间重索引的符号约定。逐句逐式终校未做。

---

**登记（2026-11-02）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
