---
layout: page
title: "CAR-Flow：条件感知重参数化对齐源与目标｜中文全文译文"
permalink: /papers/translations/2026-07-16-2509-19300-car-flow-condition-aware-reparameterization-aligns-source-and-target-f/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/7f07ae93a51d317e/) · [原文 arXiv](https://arxiv.org/abs/2509.19300) · [全部目录](/papers/catalog/)

# CAR-Flow：条件感知重参数化对齐源与目标

**原题：** CAR-Flow: Condition-Aware Reparameterization Aligns Source and Target for Better Flow Matching  
**作者：** Chen Chen、Pengsheng Guo$^{*}$、Liangchen Song、Jiasen Lu、Rui Qian、Xinze Wang、Tsu-Jui Fu$^{*}$、Wei Liu$^{*}$、Yinfei Yang、Alex Schwing  
**单位：** Apple Inc.（$^{*}$ 表示工作完成于在 Apple 任职期间）。  
**版本：** 第 39 届神经信息处理系统大会（NeurIPS 2025）论文；arXiv:2509.19300（原文页眉标注 NeurIPS 2025）；27 页（正文 + 参考文献 + 附录 + NeurIPS 检查表）。  
**范围与状态：** 全文中文译稿：摘要、第 1—6 节（含 2.1—2.3、3.1—3.3、4.1—4.2）、算法 1—2、致谢、图 1—9 中文图注、表 1—4 逐格转录、参考文献 [1]—[27]（作者—年格式，按原顺序）、附录 A—F、NeurIPS 论文检查表 16 项均按原文结构录入；逐句逐式终校未做。

## 摘要

条件生成建模旨在从包含数据—条件对的样本中学习条件数据分布。为此，扩散与基于流的方法已取得令人瞩目的结果。这些方法使用学习到的（流）模型，把忽略条件的初始标准高斯噪声输运到条件数据分布。因此模型既要学习质量输运，又要学习条件注入。为减轻模型负担，我们提出**面向流匹配的条件感知重参数化（Condition-Aware Reparameterization for Flow Matching, CAR-Flow）**——一种轻量的、可学习的位移，用于对源分布、目标分布或二者同时施加条件。通过重新安置这些分布，CAR-Flow 缩短了模型必须学习的概率路径，从而在实践中加快训练。在低维合成数据上，我们可视化并量化了 CAR-Flow 的效果。在更高维的自然图像数据（ImageNet-256）上，为 SiT-XL/2 配备 CAR-Flow 把 FID 从 2.07 降到 1.68，而新增参数不到 0.6%。

## 1 引言

条件生成模型能够以外生变量（例如类别标签、文本描述或语义掩码）为条件进行采样。它们是过去十年间显著推进的关键技术，从变分自编码器（VAE）[Kingma and Welling, 2014] 与生成对抗网络 [Goodfellow et al., 2014]，到扩散模型 [Ho et al., 2020, Song et al., 2021a,b, Dhariwal and Nichol, 2021, Peebles and Xie, 2023, Rombach et al., 2022, Nichol and Dhariwal, 2021] 与流匹配 [Ma et al., 2024, Liu et al., 2023, Lipman et al., 2023, Albergo and Vanden-Eijnden, 2023, Albergo et al., 2023]。

最先进的扩散与流匹配框架通过训练深度网络追踪一条概率路径来完成条件生成，该路径把来自简单**源分布**的样本逐步变换为丰富的、依赖条件的目标分布。源分布的一个流行选择是单一的、与条件无关的标准高斯。于是条件信号只通过网络本身进入：例如在流匹配中，模型预测速度场，条件通常经由嵌入或自适应归一化层注入。虽然这一策略已取得令人印象深刻的结果，但该设计迫使网络同时承担两项任务——(i) 把概率质量输运到数据流形的正确区域，(ii) 编码条件的语义含义。由于不同条件常占据流形的遥远部分，这一双重负担拉长了学习到的轨迹、减慢收敛，并可能损害样本质量与多样性。

本文通过源分布与目标分布的条件相关映射来减轻这一负担。首先，我们用一个轻量映射——**源分布映射**——赋予源分布条件感知能力，使每个条件都有自己的源分布。同样的思想可用另一个轻量映射镜像到目标分布，即**目标分布映射**，我们要求它近似可逆以保持采样可处理。所得推前（push-forward）链如图 1 所示。直观上，目标分布映射及其近似逆对应潜扩散流程中常用的编码器与解码器 [Rombach et al., 2022]；不同之处在于，这里的目标分布映射显式以条件为输入，使我们的表述与近期把语义信息直接嵌入潜表示的潜空间条件化方法一致 [Wu et al., 2024, Leng et al., 2025, Yao et al., 2025]。

尽管完全一般的映射提供最大灵活性，这种自由却隐藏着一个关键失效模式：流匹配目标存在**零代价解**，此时预测的数据分布坍缩到单一模式。近期工作在把 VAE 与扩散模型简单端到端联合微调时也观察到类似的生成质量下降 [Leng et al., 2025]。我们形式化这些坍缩路径，并在实验中加以验证。

为排除这种平凡解，我们施加最简单有效的约束——**仅位移条件化**。具体而言，我们把映射重参数化为只做平移。在保持尺度不变的情况下重新安置起点和/或终点可消除所有平凡解，同时仍缩短残余概率路径。注意保体积映射同样可行。我们把由此得到的框架称为面向流匹配的条件感知重参数化（CAR-Flow）。

CAR-Flow 可作用于源分布、目标分布或二者。每种变体以不同方式塑造学习到的路径，我们发现联合版本在实践中表现最好。对低维合成基准与高维自然图像（ImageNet-256）数据，CAR-Flow 都一致改善性能：为强基线 SiT-XL/2 [Ma et al., 2024] 配备 CAR-Flow 后，FID 从 2.07 降至 1.68，而新增参数不到 0.6%。

我们的贡献如下：

1. 我们提出 CAR-Flow——一种简单却强大的仅位移映射，使源分布、目标分布或二者与条件变量对齐。CAR-Flow 让速度网络摆脱不必要的输运，而计算开销可忽略。
2. 我们给出理论分析，揭示无约束重参数化下存在的零代价解，并证明它们导致速度场坍缩，从而解释了朴素端到端 VAE—扩散训练的经验失败。
3. 我们在低维合成数据与高维 ImageNet-256 基准上验证 CAR-Flow，一致优于标准整流流基线。

## 2 背景与预备知识

我们先简要回顾标准流匹配表述。

### 2.1 条件生成与概率路径

条件生成旨在从条件数据分布 $x_1\sim p_{\mathrm{data}}^x(\cdot\mid y)$ 采样，其中 $y$ 是条件变量（如类别标签或文本提示）。扩散与基于流的模型通过模拟一条追踪概率密度路径 $p_t(x_1\mid x_0,y)$ 的微分方程来处理该问题，把样本从简单源分布 $x_0\sim p_{\mathrm{init}}^x$ 逐步输运到目标条件分布。源分布的标准选择是各向同性高斯 $p_{\mathrm{init}}^x=\mathcal N(0,I_d)$。随机轨迹 $(X_t)_{0\leq t\leq1}$ 服从 SDE

$$
dX_t=\left[u_t(X_t,y)+\frac{\sigma_t^2}{2}\nabla\log p_t(X_t\mid y)\right]dt+\sigma_t\,dW_t,\tag{1}
$$

其中 $u_t$ 为漂移场，$\sigma_t$ 为扩散系数，$W_t$ 为标准 Wiener 过程。项 $\nabla\log p_t(X_t\mid y)$ 表示 score 函数，可用漂移场 $u_t$ 表示 [Ma et al., 2024]。在确定性极限 $\sigma_t=0$ 下，该 SDE 退化为 ODE $dX_t=u_t(X_t,y)\,dt$。

### 2.2 高斯概率路径

一种方便的实例化是高斯路径。设 $\alpha_t$ 与 $\beta_t$ 为两个连续可微、单调的噪声调度函数，满足边界条件 $\alpha_0=\beta_1=0$、$\alpha_1=\beta_0=1$。在时刻 $t$，条件分布为

$$
p_t(\cdot\mid x_1,y)=\mathcal N\left(\alpha_tx_1,\beta_t^2I_d\mid y\right),\tag{2}
$$

其端点为 $p_0(\cdot\mid x_1,y)=\mathcal N(0,I_d)$ 与 $p_1(\cdot\mid x_1,y)=\delta_{x_1\mid y}$，其中 $\delta$ 表示 Dirac delta "分布"。沿该路径，状态由插值 $x_t=\beta_tx_0+\alpha_tx_1$ 演化，速度场为

$$
u_t=\dot\beta_tx_0+\dot\alpha_tx_1,\tag{3}
$$

其中上点表示时间导数。

### 2.3 条件流匹配与采样

条件流匹配训练神经速度场 $v_\theta(x,t,y)$ 来逼近式（3）中的真实速度 $u_t$。常用目标为

$$
\mathcal L(\theta)=\mathbb E_{\substack{y\sim p_Y,\ t\sim p_T\\ x_0\sim p_{\mathrm{init}}^x,\ x_1\sim p_{\mathrm{data}}^x}}\left\|v_\theta\left(\beta_tx_0+\alpha_tx_1,t,y\right)-\left(\dot\beta_tx_0+\dot\alpha_tx_1\right)\right\|^2,\tag{4}
$$

其中 $p_Y$ 为条件 $y$ 的边缘分布，$p_T$ 为 $[0,1]$ 上的时间密度。训练完成后，用 $\hat u_t=v_\theta(x_t,t,y)$ 把式（1）从 $t=0$ 数值积分到 $t=1$ 即可抽取 $x_1\sim p_{\mathrm{data}}^x$。与求解器无关的流程见算法 1。

**算法 1：通过条件流匹配采样（标准高斯源）.** 输入：训练好的网络 $v_\theta$；扩散调度 $\{\sigma_t\}_{t\in[0,1]}$；步数 $N$。
1. 采样 $y\sim p_Y$
2. 采样 $x_0\sim\mathcal N(0,I_d)$
3. $\Delta t\leftarrow1/N$；$x\leftarrow x_0$
4. 对 $k=0$ 到 $N-1$：
5. $t\leftarrow k\Delta t$
6. $u\leftarrow v_\theta(x,t,y)$（漂移）
7. 用 $(u,\sigma_t)$ 在 $[t,t+\Delta t]$ 上积分式（1）的 SDE（例如 Euler–Maruyama）
8. 结束循环
9. 返回 $x$（$t=1$ 处以 $y$ 为条件的样本）

## 3 条件感知重参数化

如第 2 节所述，标准条件流匹配从与条件无关的先验（通常是标准高斯）出发。因此速度网络 $v_\theta(x_t,t,y)$ 必须同时学习两个纠缠的任务——输运质量与编码语义，形成双重负担。为减轻这一点，我们用条件 $y$ 的显式函数重参数化源分布和/或目标分布。本节先给出使用一般重参数化的条件流匹配重表述（3.1 节），然后说明允许任意重参数化会导致平凡的零代价极小点、使分布坍缩到单一模式（3.2 节）。为同时缩短输运路径并消除这些平凡解，我们提出面向流匹配的条件感知重参数化（CAR-Flow，3.3 节）。

### 3.1 一般重参数化

形式上，我们不直接从固定源分布 $p_{\mathrm{init}}^x$ 抽取初值 $x_0$，而是先施加条件相关的源分布映射 $f:\mathbb R^n\times\mathcal Y\to\mathbb R^m$，$(x,y)\mapsto z$，使得

$$
z_0=f(x_0,y),\qquad x_0\sim p_{\mathrm{init}}^x.\tag{5}
$$

于是我们通过推前 $z_0\sim p_{\mathrm{init}}^z(\cdot\mid y)=f(\cdot,y)_{\#}p_{\mathrm{init}}^x$ 获得修正源分布的样本。

类似地，定义目标分布映射 $g:\mathbb R^n\times\mathcal Y\to\mathbb R^m$，$(x,y)\mapsto z$，使得

$$
z_1=g(x_1,y),\qquad x_1\sim p_{\mathrm{data}}^x(\cdot\mid y).\tag{6}
$$

我们通过推前 $z_1\sim p_{\mathrm{data}}^z(\cdot\mid y)=g(\cdot,y)_{\#}p_{\mathrm{data}}^x(\cdot\mid y)$ 刻画潜空间中目标分布的样本。关键在于，为使采样可处理，$g$ 必须近似可逆——即假设存在 $g^{-1}$ 使 $x_1\approx g^{-1}(z_1,y)$。

值得注意的是，我们的重参数化框架同时包含经典基于 VAE 的潜扩散模型 [Rombach et al., 2022] 与近期把语义意识直接注入潜空间的努力（如 Leng et al. [2025]）。要恢复标准潜扩散模型，我们保持源不变，即 $f(x_0,y)=x_0$，并令 $g(x_1,y)\triangleq\mathcal E(x_1)$、$g^{-1}(z_1,y)\triangleq\mathcal D(z_1)$，其中 $\mathcal E$、$\mathcal D$ 为通过 ELBO（重建损失加 KL 散度）训练、不含显式语义监督的 VAE 编码器与解码器。相反，更近期的工作 [Yu et al., 2025, Leng et al., 2025, Yao et al., 2025] 用语义对齐损失（常用预训练 DINO-V2 网络的特征）增强 VAE 训练，使编码器与解码器有效依赖 $y$ 的语义嵌入。这两种范式都作为我们一般推前重参数化框架的特例自然出现。此外，该框架可方便地容纳对任意预训练 VAE 的进一步重参数化。具体地，可引入可逆映射 $g':\mathbb R^m\times\mathcal Y\to\mathbb R^m$ 并令

$$
g(x_1,y)\triangleq g'\left(\mathcal E(x_1),y\right),\qquad g^{-1}(z_1,y)\triangleq\mathcal D\left((g')^{-1}(z_1,y)\right),\tag{7}
$$

从而把语义条件直接嵌入编码器与解码器。

**重参数化下的流匹配损失与采样。** 当 $p_{\mathrm{init}}^z(\cdot\mid y)$ 为高斯时，在插值 $z_t=\beta_tz_0+\alpha_tz_1$、$u_t=\dot\beta_tz_0+\dot\alpha_tz_1$ 下，概率路径 $z_0\to z_1$ 仍为高斯。$Z_t$ 的演化遵循 SDE

$$
dZ_t=\left[u_t(Z_t,y)+\frac{\sigma_t^2}{2}\nabla\log p_t(Z_t\mid y)\right]dt+\sigma_t\,dW_t,\tag{8}
$$

其中 $p_t$ 是 $z$ 空间的高斯路径。注意条件 score 函数一般不同：除非 $f(x_0,y)=x_0$，否则 $\nabla\log p_t(Z_t\mid y)\neq\nabla\log p_t(X_t\mid y)$（细节见附录 A）。所得流匹配损失为

$$
\mathcal L(\theta)=\mathbb E_{\substack{y\sim p_Y,\ t\sim p_T\\ x_0\sim p_{\mathrm{init}}^x,\ x_1\sim p_{\mathrm{data}}^x}}\left\|v_\theta\left(\beta_tz_0+\alpha_tz_1,t,y\right)-\left(\dot\beta_tz_0+\dot\alpha_tz_1\right)\right\|^2.\tag{9}
$$

训练完成后，采样时先抽取初始起点 $x_0\sim p_{\mathrm{init}}^x$ 并计算条件感知潜变量 $z_0=f(x_0,y)$，然后把式（8）的重参数化 SDE 从 $t=0$ 积分到 $t=1$ 得到 $z_1$，最后经 $x_1=g^{-1}(z_1,y)$ 映射回数据空间。算法 2 给出该流程的伪代码。

**算法 2：通过条件流匹配采样（重参数化）.** 输入：训练好的 $v_\theta$；扩散调度 $\{\sigma_t\}$；步数 $N$。
1. 采样 $y\sim p_Y$
2. 采样 $x_0\sim\mathcal N(0,I_d)$ 并令 $z\leftarrow f(x_0,y)$
3. $\Delta t\leftarrow1/N$
4. 对 $k=0$ 到 $N-1$：
5. $t\leftarrow k\Delta t$
6. $u\leftarrow v_\theta(z,t,y)$
7. 用 $(u,\sigma_t)$ 在 $[t,t+\Delta t]$ 上积分式（8）的 SDE
8. 结束循环
9. $x\leftarrow g^{-1}(z,y)$（此处需要可逆的 $g$）
10. 返回 $x$（$t=1$ 处以 $y$ 为条件的样本）

### 3.2 无约束重参数化下的模式坍缩

在式（9）的一般重参数化框架下，映射 $f$ 与 $g$ 享有完全灵活性。不幸的是，这种表达能力也允许若干平凡的**零代价极小点**：从解析上看，损失可被退化的位移解驱动到零，导致生成分布坍缩到单一/非正常模式。

**命题 1.** 设 $f,g:\mathbb R^n\times\mathcal Y\to\mathbb R^m$ 为任意映射。若以下任一条件成立（对某函数 $c(y)\in\mathbb R^m$ 或标量 $k(y)\in\mathbb R$）：

(i) 常量源：对一切 $x_0$ 有 $f(x_0,y)=c(y)$；
(ii) 常量目标：对一切 $x_1$ 有 $g(x_1,y)=c(y)$；
(iii) 无界源尺度：$\|f(x_0,y)\|\to\infty$；
(iv) 无界目标尺度：$\|g(x_1,y)\|\to\infty$；
(v) 比例坍缩：$f(x_0,y)=k(y)g(x_1,y)$；

则式（9）中的流匹配损失存在平凡极小值，其最优速度场形如

$$
v_\theta(z_t,t,y)=\gamma(t,y)z_t+\eta(t,y),
$$

使所有概率质量坍缩到单一/非正常模式。

命题 1 的证明以及 $\gamma(t,y)$ 与 $\eta(t,y)$ 的闭式表达式见附录 B。

为具体说明坍缩，我们考虑线性调度 $\beta_t=1-t$、$\alpha_t=t$ 与仿射重参数化

$$
f(x_0,y)=\sigma_0(y)x_0+\mu_0(y),\qquad g(x_1,y)=\sigma_1(y)x_1+\mu_1(y),\tag{10}
$$

它与标准高斯技巧类似。表 1 汇总每种坍缩模式，列出映射、闭式坍缩速度 $v^\ast(z,t,y)=\gamma(t,y)z+\eta(t,y)$ 以及所得推前分布 $p_{\mathrm{init}}^z$ 与 $p_{\mathrm{data}}^z$。

（表 1 见"图注与表注"一节。）

我们注意到，在**常量映射**情形（(i) 与 (ii)）中，仿射变换 $f$ 或 $g$ 实际上把 $p_{\mathrm{init}}^z$ 或 $p_{\mathrm{data}}^z$ 的方差坍缩为零。特别地，情形 (ii) 印证了 REPA-E（其表 1）[Leng et al., 2025] 的发现：端到端 VAE—扩散调优偏好方差更小的更简单潜空间。相反，**无界尺度**模式 (iii) 与 (iv) 把分布推向非正常均匀分布，消除任何有意义的局部化。**比例坍缩** (v) 产生退化流，$p_{\mathrm{init}}^z$、$p_{\mathrm{data}}^z$ 与速度场均为常量。

经验上我们没有观察到情形 (iii)—(v)。情形 (iii) 与 (iv) 对应无界坍缩解：当源或目标分布的尺度趋于无穷时，对应分布相对它坍缩，从而得到零代价。这些解需要无界权重，因而极不稳定——任何扰动都会把优化推回情形 (i) 或 (ii)。情形 (v) 假设映射 $f$ 与 $g$ 严格成比例，除非在退化为情形 (i) 或 (ii) 的平凡常量映射设定下，这不会在独立采样输入时出现。因此实践中优化器走最简单的"捷径"——常量映射坍缩，因为把 $f$ 或 $g$ 设为固定常量会立即把损失归零。第 4 节我们不仅经验验证这种常量映射坍缩会在真实模型中发生，还展示这些模式坍缩行为在实践中如何表现。

### 3.3 仅位移的条件感知重参数化

为在保留条件感知重参数化收益的同时消除平凡的零代价解，我们把两个重参数化都限制为**仅加性位移**（同时指出保体积映射亦可行）。为简单起见取

$$
f(x_0,y)=x_0+\mu_0(y),\qquad g(x_1,y)=x_1+\mu_1(y).\tag{11}
$$

其中 $\mu_0,\mu_1:\mathcal Y\to\mathbb R^m$ 为轻量的、可学习的、条件相关位移。通过保持尺度，我们封堵了命题 1 给出的所有坍缩模式，同时仍让 $z_0$ 与 $z_1$ 在潜空间中相互靠近。特别地，当与预训练 VAE 一起使用时，式（7）变为

$$
g(x_1,y)\triangleq\mathcal E(x_1)+\mu_0(y),\qquad g^{-1}(z_1,y)\triangleq\mathcal D\left(z_1-\mu_1(y)\right),\tag{12}
$$

CAR-Flow 有三种自然变体：

- **仅源（Source-only）**：$\mu_1\equiv0$，只位移源。
- **仅目标（Target-only）**：$\mu_0\equiv0$，只位移目标。
- **联合（Joint）**：$\mu_0$ 与 $\mu_1$ 都生效。

每种变体以不同方式改变概率路径 $z_t=\beta_t(x_0+\mu_0(y))+\alpha_t(x_1+\mu_1(y))$。注意对源施加位移无法被对目标施加相反位移所复制。事实上，源上任何非零常量位移都无法由目标上的常量位移匹配——除非在平凡情形：

**命题 2.** 把源位移 $\mu_0$ 等价于把目标位移 $\mu_1$，当且仅当 $\mu_0=\mu_1=0$。

**证明.** 仅源位移 $(\mu_0,\mu_1)=(\mu_0,0)$ 时插值为 $z_t^{(s)}=\beta_t(x_0+\mu_0)+\alpha_tx_1$；目标位移 $(\mu_0,\mu_1)=(0,\mu_1)$ 时为 $z_t^{(t)}=\beta_tx_0+\alpha_t(x_1+\mu_1)$。令二者相等得 $\forall t$，$\beta_t\mu_0=\alpha_t\mu_1$。由于 $\mu_0$ 与 $\mu_1$ 是 $t$ 无关的 $y$ 的函数，这迫使 $\mu_0=\mu_1=0$。$\square$

对**仅源**，插值简化为 $z_t=x_t+\beta_t\mu_0(y)$。当两个条件 $y,y'$ 的 $\mu_0(y)\approx\mu_0(y')$ 时，其路径共享共同的起始区域，简化早期流。对**仅目标**，轨迹变为 $z_t=x_t+\alpha_t\mu_1(y)$。当 $\mu_1(y)\approx\mu_1(y')$ 时，网络只需学习共享的"着陆区"，简化后期流。对**联合**，有 $z_t=x_t+\mu_t(y)$，其中 $\mu_t(y)=\beta_t\mu_0(y)+\alpha_t\mu_1(y)$，故时变位移对齐两个端点，最小化总体输运距离并在整条轨迹上减轻 $v_\theta$ 的负担。

经验上我们发现，联合 CAR-Flow 变体——让 $\mu_0$ 与 $\mu_1$ 都自适应——在收敛速度与样本保真度上取得最大改善（见第 4 节）。

## 4 实验

本节在 $\beta_t=1-t$、$\alpha_t=t$ 的线性噪声调度下评估 CAR-Flow 的有效性，并与经典整流流比较。所有实验均使用 axlearn 框架（https://github.com/apple/axlearn）。详细实现设置见附录 C。

### 4.1 合成数据

在合成数据实验中，我们考虑一维任务：源分布为 $\mathcal N(0,1)$，目标分布为二类高斯混合，其中 A 类数据分布为 $\mathcal N(-1.5,0.2^2)$，B 类为 $\mathcal N(+1.5,0.2^2)$。

我们用正弦嵌入编码 $x_t$、$y$ 与 $t$ 后送入网络。在基线整流流模型中，这些嵌入被拼接并经过一个三层 MLP（共 1,993 个参数）来预测速度场 $v_\theta(x_t,y,t)$。训练使用式（4）的损失，采样遵循算法 1。对 CAR-Flow，我们在该主干上增加两个轻量线性层，把类别嵌入映射为位移 $\mu_0(y)$ 和/或 $\mu_1(y)$，每个仅增加 9 个参数。仅源变体预测 $\mu_0$（$\mu_1=0$）；仅目标变体预测 $\mu_1$（$\mu_0=0$）；联合变体二者都预测。这些位移按式（11）施加，训练使用式（9）的损失，采样使用算法 2。所有模型（基线与 CAR 变体）都设 $\sigma_t=0$（把 SDE 退化为 ODE），并用 50 步 Euler 积分器采样。为保证鲁棒性，每个配置运行三次并报告平均性能；运行间方差可忽略。

图 2 展示 CAR-Flow 如何改变学习到的流。在图 2a 中，基线必须同时输运质量与编码类别信息，路径最长。图 2b 的仅源位移变体干净地重新安置每个类的起点；图 2c 的仅目标位移变体保持源不变并合并端点；图 2d 的联合变体在最小源位移下对齐起点与终点——产生最短轨迹（表 2）。

（表 2、图 2—3 见"图注与表注"一节。）

图 3a 用训练过程中的 Wasserstein 距离概括收敛：联合 CAR-Flow 收敛最快、误差最低，其次是仅源与仅目标，均优于基线。图 3b 追踪每个类与变体学习到的 $\mu_0$ 与 $\mu_1$：联合 CAR-Flow 给出最适度、最平衡的位移，这解释了其更优的收敛与流质量。

**模式坍缩。** 为经验验证 3.2 节的模式坍缩分析，我们复用该设置，但允许位移与尺度参数同时学习（式（10））。我们训练两个独立模型：一个用可学习参数 $(\mu_0,\sigma_0)$ 重参数化源分布，另一个用 $(\mu_1,\sigma_1)$ 变形目标分布。结果见图 4。具体地，图 4a 展示学习到的标准差 $\sigma$ 的快速演化，清楚表明网络很快发现把 $\sigma$ 缩到零的"捷径"解。图 4b 绘制期望范数间隙 $\mathbb E\|v_\theta-v^\ast\|^2$，显示其收敛到零，表明网络的速度预测与表 1 推导的解析零代价解高度一致。此外，源分布的无约束参数化触发命题 1 中的模式坍缩情形 (i)，流退化为预测目标的逐类均值（见图 4c）。相反，目标的无约束参数化把分布几乎坍缩为常量，因此由于 $\sigma_1\to0$，预测的 $x_1$ 退化为非正常均匀分布，如图 4d 所示。

### 4.2 ImageNet

为在高维大规模数据集上基准测试，我们在 ImageNet $256\times256$ 数据上使用 v6e-256 TPU 做实验。基线为 [Ma et al., 2024] 的 SiT-XL/2，我们在 JAX [Bradbury et al., 2018] 中重新实现；严格遵循开源 SiT 仓库的原始训练配方以复现论文报告的结果。对 CAR 变体，我们对 SiT 使用的 sd-vae-ft-ema VAE 主干施加仅位移重参数化（见式（11）—（12））。我们引入两个轻量卷积网络（各约 230 万参数），从类别嵌入预测 $\mu_0$ 与 $\mu_1$，并把它们投影到潜空间。所有模型使用 Heun SDE 求解器、250 NFEs 采样。

（表 3、图 5 见"图注与表注"一节。）

表 3 给出定量结果。为 SiT-XL/2 配备 CAR-Flow 后，所有变体都一致优于基线。特别地，联合位移变体取得最佳结果，在新增参数不到 0.6% 的情况下把 FID 从 2.07 降到 1.68。除最终性能外，CAR-Flow 还加速优化：ImageNet-256 上的收敛分析表明，所有 CAR-Flow 变体在各训练步上都比基线更快降低 FID（见图 5）。这些结果凸显了显式对源分布与目标分布施加条件的重要性：简单的位移重参数化不仅改善样本保真度，而且计算开销极小，便于集成到现有大规模生成框架中。

## 5 相关工作

过去十年，生成建模从变分自编码器（VAE）[Kingma and Welling, 2014]、生成对抗网络 [Goodfellow et al., 2014] 与归一化流 [Rezende and Mohamed, 2015] 取得了显著进展。更近期出现了 score matching [Song and Ermon, 2019, Song et al., 2020]、扩散模型 [Ho et al., 2020] 与流匹配 [Liu et al., 2023, Lipman et al., 2023, Albergo and Vanden-Eijnden, 2023, Albergo et al., 2023]。后三种框架相互关联：测试时采样可视为沿学习到的速度场、从时间零的源分布到时间一的目标分布，数值求解一个输运（常）微分方程。

关于速度场的学习，已有多种在源分布与目标分布样本之间做插值的方法 [Lipman et al., 2023, Liu et al., 2023, Tong et al., 2024]。其中，整流流匹配已被证明能在大规模数据上取得令人瞩目的结果 [Ma et al., 2024, Esser et al., 2024]。

为在大规模数据上使用，流匹配通常在潜空间中表述：用预训练且冻结的 VAE 编码器压缩数据 [Rombach et al., 2022]。这些映射与本文讨论的 CAR-Flow 不同，因为它们通常与条件变量无关。如前所述，CAR-Flow 可以叠加在潜空间的预训练冻结投影之上。

更近期，Yu et al. [2025] 与 Yao et al. [2025] 提出把建模速度的深度网络中的表示与视觉基础模型的表示对齐。具体地，Yu et al. [2025] 把 DiT [Peebles and Xie, 2023] 与 SiT [Ma et al., 2024] 模型的早期层特征与从 DINOv2 [Oquab et al., 2024] 与 CLIP [Radford et al., 2021] 提取的表示对齐。相反，Yao et al. [2025] 把 VAE 的潜空间与预训练视觉基础模型的表示对齐，随后冻结用于扩散训练。这些方法与我们的方法不同：我们学习变换源分布与目标分布，而非促进特征对齐。

与本文最相关的是近期提出的 REPA-E [Leng et al., 2025]。在该工作中，Leng et al. [2025] 研究扩散模型与 VAE 编码器/解码器的端到端训练，后者把数据映射到潜空间或从潜空间映射回数据。本文的不同之处在于：我们形式化了 Leng et al. [2025] 报告的失效模式，并把它们识别为联合训练流匹配模型与目标分布映射时出现的平凡解。我们进一步引入源分布映射，最后施加简单约束以排除这些平凡解。

## 6 结论

我们提出并研究了面向流匹配的条件感知重参数化（CAR-Flow），它对齐流匹配模型中的源分布与目标分布。我们发现 CAR-Flow 减轻了经典流匹配的负担：模型既要同时把概率质量输运到数据流形的正确区域，又要编码条件的语义含义。

**局限与更广泛影响。** 本工作刻画了联合训练流匹配模型、源分布映射与目标分布映射时的失效模式，并把它们识别为目标函数的平凡解。我们进一步研究了避免这些平凡解的最简单有效方法。虽然发现这一简单方法能带来令人瞩目的结果，但我们认为更一般的映射很可能进一步改善结果，更一般合适映射的识别留作未来工作。

提升生成模型的表达能力具有显著的更广泛影响。正面看，更容易地建模复杂分布可节省资源并支持新应用；负面看，高效的生成建模可能被滥用以更容易地传播虚假信息。

## 致谢

我们首先感谢 Byeongjoo Ahn、Wenze Hu、Zhe Gan 与 Jason Ren 的深入讨论与快速反馈，这些显著塑造了本研究。我们也感谢 Apple Foundation Model 团队提供支撑实验的关键基础设施。最后，我们深深感谢 Ruoming Pang 与 Yang Zhao 在本项目全程给予的战略视野、坚定指导与不懈鼓励。

## 图注与表注

### 表 1：线性调度 $\alpha_t=t$、$\beta_t=1-t$ 下仿射映射的零代价坍缩模式（原 PDF 第 6 页）

仿射映射 $f(x_0)=\sigma_0x_0+\mu_0$、$g(x_1)=\sigma_1x_1+\mu_1$；为简洁省略显式 $y$ 依赖。表中数值与第 6 页渲染图逐格核对一致。

| 情形 | $f$ | $g$ | $\gamma(t)$ | $\eta(t)$ | $v^\ast(z_t,t)$ | $p_{\mathrm{init}}^z$ | $p_{\mathrm{data}}^z$ |
|---|---|---|---|---|---|---|---|
| (i) | $\mu_0$ | 任意 | $\frac{1}{t}$ | $-\frac{1}{t}\mu_0$ | $\frac{z_t-\mu_0}{t}$ | $\delta_{\mu_0}$ | – |
| (ii) | 任意 | $\mu_1$ | $-\frac{1}{1-t}$ | $\frac{1}{1-t}\mu_1$ | $\frac{\mu_1-z_t}{1-t}$ | – | $\delta_{\mu_1}$ |
| (iii) | $\infty$ | 任意 | $-\frac{1}{1-t}$ | $0$ | $-\frac{z_t}{1-t}$ | $\mathrm{Uniform}(\mathbb R^d)$ | – |
| (iv) | 任意 | $\infty$ | $\frac{1}{t}$ | $0$ | $\frac{z_t}{t}$ | – | $\mathrm{Uniform}(\mathbb R^d)$ |
| (v) | $\mu_0$ | $k\mu_0$ | $0$ | $(k-1)\mu_0$ | $(k-1)\mu_0$ | $\delta_{\mu_0}$ | $\delta_{\mu_1}$ |

### 表 2：平均轨迹长度 $\|z_0\to z_1\|$（含 $2\sigma$ 误差界；原 PDF 第 8 页）

| 指标 | Baseline | CAR-Flow 仅源 | CAR-Flow 仅目标 | CAR-Flow 联合 |
|---|---|---|---|---|
| 长度 | $1.5355\pm0.0024$ | $0.7432\pm0.0019$ | $0.7129\pm0.0010$ | $0.7121\pm0.0011$ |

### 表 3：ImageNet $256\times256$ 上的类条件图像生成基准（原 PDF 第 9 页）

所有 CAR-Flow 变体都超过 SiT-XL/2 基线。表中数值与第 9 页渲染图逐格核对一致。

| 方法 | 参数 (M) | 训练步数 | FID↓ | IS↑ | sFID↓ | Precision↑ | Recall↑ |
|---|---|---|---|---|---|---|---|
| SiT-XL/2 | 675 | 400K | 17.28 | 78.88 | 5.71 | 0.67 | 0.61 |
| SiT-XL/2 CAR-Flow 仅源 | 677 | 400K | 15.15 | 83.42 | 5.56 | 0.68 | 0.61 |
| SiT-XL/2 CAR-Flow 仅目标 | 677 | 400K | 14.44 | 85.66 | 5.59 | 0.68 | 0.61 |
| SiT-XL/2 CAR-Flow 联合 | 679 | 400K | **13.91** | **87.96** | **5.38** | **0.68** | **0.62** |
| SiT-XL/2 cfg=1.5 | 675 | 7M | 2.07 | 280.2 | 4.46 | 0.81 | 0.58 |
| SiT-XL/2 CAR-Flow 联合+cfg=1.5 | 679 | 7M | **1.68** | **304.0** | **4.34** | **0.82** | **0.62** |

### 表 4：CIFAR-10 上的类条件图像生成（FID↓；原 PDF 第 19 页）

| 指标 | Baseline | CAR-Flow 仅源 | CAR-Flow 仅目标 | CAR-Flow 联合 |
|---|---|---|---|---|
| FID↓ | 13.8 | **7.5** | 11.1 | 10.6 |

### 图注

**图 1（原 PDF 第 2 页）：** CAR-Flow 示意。标准条件流匹配中（直接映射 $x_0\to x_1$），与条件无关的先验样本由网络速度场直接带到各条件相关的数据流形，迫使网络同时处理长程输运与语义注入；CAR-Flow 则用轻量源分布映射 $f(\cdot,y)$ 与目标分布映射 $g(\cdot,y)$ 对齐源与目标分布，免除网络不必要的输运。采样时经（近似）逆映射 $g^{-1}(\cdot,y)$ 得到 $x_1$。

**图 2（原 PDF 第 7 页）：** 一维合成数据上学习到的流轨迹。每个面板展示从源 $x_0$（下）到目标 $x_1$（上）的轨迹：(a) 基线；(b) 仅源；(c) 仅目标；(d) 联合。中间阶段 $z_0$、$z_1$ 反映重参数化坐标；彩色密度为预测与真值类别分布（红/蓝：预测；品红/青：真值）；细线为 $z_0$ 与 $z_1$ 之间的个体样本轨迹；虚线标出每个位移的 $\pm3\sigma$。仅源变体按类重新安置源分布，仅目标变体统一轨迹端点，联合变体结合二者并取得最佳对齐与流质量。

**图 3（原 PDF 第 8 页）：** 收敛与学习到的位移比较。(a) 预测分布与真值分布之间的 Wasserstein 距离（symlog 尺度），联合 CAR-Flow 收敛最快；(b) 两个类别的学习位移 $\mu_0$（上）与 $\mu_1$（下）的演化。

**图 4（原 PDF 第 9 页）：** 带尺度重参数化的模式坍缩诊断。(a)—(b) 学习到的 $\sigma$ 与验证误差的演化；(c)—(d) 允许源 vs 目标做位移+尺度时的学习流。

**图 5（原 PDF 第 10 页）：** ImageNet $256\times256$ 上的收敛：FID 随训练步数变化。CAR-Flow 变体一致比基线收敛更快。

**图 6（原 PDF 第 18 页）：** 在骨干学习率固定为 $1\times10^{-5}$ 时改变位移网络学习率的效果。(a)(c) 三种学习率下 $\mu_0$ 与 $\mu_1$ 的轨迹；(b)(d) 对应的 1 维 Wasserstein 距离。位移网络学习率最低时学习到的位移可忽略（对齐缓慢）；中等时稳步增长且不失稳；最高时先过冲后衰减，尽管早期振荡，总体收敛最快。

**图 7（原 PDF 第 18 页）：** 400K 步时 ImageNet FID 随条件网络学习率的变化（SiT-XL/2 CAR-Flow 变体：仅源蓝、仅目标橙、联合绿）；水平虚线为基线 FID 17.2。随位移网络学习率升高，所有变体都优于基线。

**图 8（原 PDF 第 19 页）：** SiT-XL/2 在 400K 步时 CAR-Flow 变体的定性消融。每行对应一个变体——（上）仅源、（中）仅目标、（下）联合 CAR-Flow——每列展示同一噪声在 cfg$=1$ 下针对不同类别的生成样本。联合模型在所有场景中产生最真实、语义最准确的图像。

**图 9（原 PDF 第 20 页）：** 由在 ImageNet $256\times256$ 上训练的 SiT-XL/2 CAR-Flow 联合模型、以 cfg$=4$ 随机生成的样本。

## 参考文献（英文原条目）

- 以下按原文（作者—年格式，无编号）顺序逐条转录英文书目，保留英文原貌；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

- M. Albergo and E. Vanden-Eijnden. Building normalizing flows with stochastic interpolants. In Proc. ICLR, 2023.

- M. Albergo, N. Boffi, and E. Vanden-Eijnden. Stochastic interpolants: A unifying framework for flows and diffusions. arXiv preprint arXiv:2303.08797, 2023.

- J. Bradbury, R. Frostig, P. Hawkins, M. J. Johnson, C. Leary, D. Maclaurin, G. Necula, A. Paszke, J. VanderPlas, S. Wanderman-Milne, and Q. Zhang. JAX: composable transformations of Python+NumPy programs, 2018. URL http://github.com/jax-ml/jax.

- P. Dhariwal and A. Nichol. Diffusion models beat gans on image synthesis. Advances in neural information processing systems, 34:8780–8794, 2021.

- P. Esser, S. Kulal, A. Blattmann, R. Entezari, J. Müller, H. Saini, Y. Levi, D. Lorenz, A. Sauer, F. Boesel, et al. Scaling rectified flow transformers for high-resolution image synthesis. In Forty-first international conference on machine learning, 2024.

- I. Goodfellow, J. Pouget-Abadie, M. Mirza, B. Xu, D. Warde-Farley, S. Ozair, A. Courville, and Y. Bengio. Generative adversarial nets. In Proc. NeurIPS, 2014.

- J. Ho, A. Jain, and P. Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

- D. Kingma and M. Welling. Auto-Encoding Variational Bayes. In Proc. ICLR, 2014.

- X. Leng, J. Singh, Y. Hou, Z. Xing, S. Xie, and L. Zheng. Repa-e: Unlocking vae for end-to-end tuning with latent diffusion transformers, 2025. URL https://arxiv.org/abs/2504.10483.

- Y. Lipman, R. Chen, H. Ben-Hamu, M. Nickel, and M. Le. Flow matching for generative modeling. In Proc. ICLR, 2023.

- X. Liu, C. Gong, and Q. Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In Proc. ICLR, 2023.

- N. Ma, M. Goldstein, M. S. Albergo, N. M. Boffi, E. Vanden-Eijnden, and S. Xie. Sit: Exploring flow and diffusion-based generative models with scalable interpolant transformers. In European Conference on Computer Vision, pages 23–40. Springer, 2024.

- A. Q. Nichol and P. Dhariwal. Improved denoising diffusion probabilistic models. In International conference on machine learning, pages 8162–8171. PMLR, 2021.

- M. Oquab, T. Darcet, T. Moutakanni, H. V o, M. Szafraniec, V. Khalidov, P. Fernandez, D. Haziza, F. Massa, A. El-Nouby, M. Assran, N. Ballas, W. Galuba, R. Howes, P.-Y. Huang, S.-W. Li, I. Misra, M. Rabbat, V. Sharma, G. Synnaeve, H. Xu, H. Jegou, J. Mairal, P. Labatut, A. Joulin, and P. Bojanowski. Dinov2: Learning robust visual features without supervision, 2024. URL https://arxiv.org/abs/2304.07193.

- W. Peebles and S. Xie. Scalable diffusion models with transformers. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4195–4205, 2023.

- A. Radford, J. W. Kim, C. Hallacy, A. Ramesh, G. Goh, S. Agarwal, G. Sastry, A. Askell, P. Mishkin, J. Clark, G. Krueger, and I. Sutskever. Learning transferable visual models from natural language supervision, 2021. URL https://arxiv.org/abs/2103.00020.

- D. Rezende and S. Mohamed. Variational inference with normalizing flows. In Proc. ICML, 2015.

- R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10684–10695, 2022.

- J. Song, C. Meng, and S. Ermon. Denoising diffusion implicit models. In Proc. ICLR, 2021a.

- Y. Song and S. Ermon. Generative modeling by estimating gradients of the data distribution. In Proc. NeurIPS, 2019.

- Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-based generative modeling through stochastic differential equations. arXiv preprint arXiv:2011.13456, 2020.

- Y. Song, J. Sohl-Dickstein, D. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-based generative modeling through stochastic differential equations. In Proc. ICLR, 2021b.

- A. Tong, N. Malkin, G. Huguet, Y. Zhang, J. Rector-Brooks, K. Fatras, G. Wolf, and Y. Bengio. Improving and generalizing flow-based generative models with minibatch optimal transport. TMLR, 2024.

- Y. Wu, Z. Zhang, J. Chen, H. Tang, D. Li, Y. Fang, L. Zhu, E. Xie, H. Yin, L. Yi, et al. Vila-u: a unified foundation model integrating visual understanding and generation. arXiv preprint arXiv:2409.04429, 2024.

- J. Yao, B. Yang, and X. Wang. Reconstruction vs. generation: Taming optimization dilemma in latent diffusion models, 2025. URL https://arxiv.org/abs/2501.01423.

- S. Yu, S. Kwak, H. Jang, J. Jeong, J. Huang, J. Shin, and S. Xie. Representation alignment for generation: Training diffusion transformers is easier than you think. In Proc. ICLR, 2025.

## 附录 A：重参数化下的 score 函数（原 PDF 第 14—15 页）

本节说明：1) 一旦施加源空间映射 $f$，条件 score $s_t=\nabla\log p(z_t\mid y)$ 一般会改变，除非 $f(x,y)=x$；2) 对实践中重要的仅位移映射 $f(x,y)=x+\mu_0(y)$ 与高斯路径，密度与 score 都有闭式；3) score 与采样 SDE 中出现的漂移（速度场）$u_t$ 耦合。

### A.1 条件 score 的变化

回顾源变换 $f:\mathbb R^n\times\mathcal Y\to\mathbb R^m$，$(x,y)\mapsto z$。令 $J_f(x,y)\in\mathbb R^{m\times n}$ 表示其 Jacobian。由变量变换公式，

$$
p_X(x\mid y)=p_Z\left(f(x,y)\mid y\right)\left|\det J_f(x,y)\right|.\tag{13}
$$

对式（13）取 $\nabla_x\log$ 得

$$
\nabla_x\log p_X(x\mid y)=J_f(x,y)^{\top}\underbrace{\nabla_z\log p_Z\left(f(x,y)\mid y\right)}_{\text{$z$ 空间中的 score}}+\nabla_x\log\left|\det J_f(x,y)\right|.\tag{14}
$$

第一项经 Jacobian 转置把 $z$ 空间 score 输运回 $x$ 空间切空间；第二项校正 $f$ 引入的局部体积变化。

**保体积映射。** 若 $f$ 保体积，则 $\det J_f\equiv\pm1$，从而 $\nabla_x\log|\det J_f|=0$。此时式（14）简化为 $\nabla_x\log p_X=J_f^{\top}\nabla_z\log p_Z$。在 $f(x,y)=x$ 的特殊情形，$J_f=I$，故 $\nabla_x\log p_X=\nabla_x\log p_Z$，回到无重参数化的经典设定。

### A.2 仅位移变换

假设初始分布 $p_{\mathrm{init}}^x=\mathcal N(0,I_d)$ 为标准高斯，$f$ 为仅位移映射，即 $f(x,y)=x+\mu_0(y)$。沿由 $\alpha_t,\beta_t$ 参数化的高斯路径（边界条件 $\alpha_0=0$、$\beta_0=1$、$\alpha_1=1$、$\beta_1=0$），时刻 $t$ 的条件密度为

$$
p_t(\cdot\mid z_1,y)=\mathcal N\left(\alpha_tz_1+\beta_t\mu_0,\beta_t^2I_d\mid y\right),\tag{15}
$$

两个端点为

$$
p_0(\cdot\mid z_1,y)=\mathcal N\left(\mu_0,I_d\mid y\right),\qquad p_1(\cdot\mid z_1,y)=\delta_{z_1\mid y}.\tag{16}
$$

因此，利用高斯概率密度形式，条件 score 为

$$
s_t(z_t\mid z_1,y)=\nabla_{z_t}\log p_t(z_t\mid z_1,y)=\frac{\alpha_tz_1+\beta_t\mu_0(y)-z_t}{\beta_t^2}.\tag{17}
$$

### A.3 score 与速度场的联系

固定条件标签 $y$ 与从 3.1 节高斯端点分布抽取的一对 $(z_0,z_1)$。流定义为

$$
\psi_t(z_0\mid z_1,y)=\beta_tz_0+\alpha_tz_1,\qquad0\leq t\leq1,\tag{18}
$$

故 $\psi_0=z_0$、$\psi_1=z_1$。由于 $\psi_t$ 满足 ODE $d\psi_t/dt=u_t(\psi_t\mid z_1,y)$，对式（18）关于 $t$ 求导得条件速度场

$$
u_t(\alpha_tz_1+\beta_tz_0\mid z_1,y)=\dot\beta_tz_0+\dot\alpha_tz_1.\tag{19}
$$

由 $z_t=\psi_t(z_0\mid z_1,y)$ 得 $z_0=(z_t-\alpha_tz_1)/\beta_t$，代入式（19）得

$$
u_t(z_t\mid z_1,y)=\dot\beta_t\left(\frac{z_t-\alpha_tz_1}{\beta_t}\right)+\dot\alpha_tz_1.\tag{20}
$$

式（17）把 $z_1$ 与条件 score $s_t(z_t\mid z_1,y)$ 联系起来。从式（17）解出 $z_1$ 并代入式（20）得

$$
u_t(z_t\mid z_1,y)=\frac{\dot\alpha_t}{\alpha_t}z_t+\left(\frac{\beta_t^2\dot\alpha_t}{\alpha_t}-\dot\beta_t\beta_t\right)\left(\underbrace{\frac{\alpha_tz_1+\beta_t\mu_0(y)-z_t}{\beta_t^2}}_{s_t(z_t\mid z_1,y)}-\underbrace{\frac{\mu_0(y)}{\beta_t}}_{\text{偏置校正}}\right).\tag{21}
$$

大括号下第一项正是式（17）的条件 score，第二项补偿仅位移变换引入的均值偏移 $\mu_0(y)$。

式（21）可重排为用速度表示 score：

$$
s_t(z_t\mid z_1,y)=\frac{\alpha_tu_t(z_t\mid z_1,y)-\dot\alpha_tz_t}{\beta_t^2\dot\alpha_t-\alpha_t\dot\beta_t\beta_t}+\frac{\mu_0(y)}{\beta_t}.\tag{22}
$$

为把式（22）的条件恒等式推广到推理时使用的边缘设定，对目标端点 $z_1$ 积分。为此引入后验 $q_t(z_1\mid z_t,y):=\frac{p(z_t\mid z_1,y)p_{\mathrm{data}}^z(z_1\mid y)}{p_t(z_t\mid y)}$，其积分为 1。边缘速度与 score 就是该密度下的期望，即 $u_t(z_t\mid y)=\mathbb E_{q_t}[u_t(z_t\mid z_1,y)]$、$s_t(z_t\mid y)=\mathbb E_{q_t}[s_t(z_t\mid z_1,y)]$。把式（22）代入期望并利用线性得

$$
s_t(z_t\mid y)=\frac{\alpha_tu_t(z_t\mid y)-\dot\alpha_tz_t}{\beta_t^2\dot\alpha_t-\alpha_t\dot\beta_t\beta_t}+\frac{\mu_0(y)}{\beta_t},\tag{23}
$$

这正是潜空间 SDE（式（8））在采样中用漂移表示 score 时使用的耦合关系。

## 附录 B：命题 1 的证明（原 PDF 第 15—16 页）

本节分两步证明命题 1：(i) 证明任何把式（9）目标驱动到全局最小的参数选择都迫使速度场关于插值仿射，$v_\theta(z_t,t,y)=\gamma(t,y)z_t+\eta(t,y)$；(ii) 对命题中每种坍缩模式 (i)—(v)，验证损失确实达到该平凡极小并给出 $\gamma(t,y)$ 与 $\eta(t,y)$ 的闭式。

**第 1 步：零损失处的仿射形式。** 令 $z_t=\beta_tz_0+\alpha_tz_1$。若式（9）的损失几乎处处为零，则被积函数必须恒为零：

$$
v_\theta(z_t,t,y)=\dot\beta_tz_0+\dot\alpha_tz_1\qquad\forall(z_0,z_1,t,y).\tag{24}
$$

固定 $(t,y)$，对 $z_0$ 与 $z_1$ 应用链式法则：$\frac{\partial v_\theta}{\partial z_t}\beta_t=\dot\beta_t$、$\frac{\partial v_\theta}{\partial z_t}\alpha_t=\dot\alpha_t$。右端在 $(z_0,z_1)$ 上为常数，故 $\partial v_\theta/\partial z_t\equiv\gamma(t,y)$ 不依赖 $z_t$。对 $z_t$ 积分一次得仿射形式

$$
v_\theta(z_t,t,y)=\gamma(t,y)z_t+\eta(t,y),\tag{25}
$$

其中 $\eta(t,y)$ 为积分常数。因此任何零损失解必然具有式（25）的仿射形式，且已独立于 $\theta$。第 1 步完成。

**第 2 步：每种坍缩模式都达到零损失仿射场。** 记 $z_0:=f(x_0,y)$、$z_1:=g(x_1,y)$。把式（25）的拟设代入式（24）的逐点恒等式，并代入 $z_t=\beta_tz_0+\alpha_tz_1$：

$$
\gamma(t,y)\left[\beta_tz_0+\alpha_tz_1\right]+\eta(t,y)=\dot\beta_tz_0+\dot\alpha_tz_1.\tag{26}
$$

式（26）关于 $(z_0,z_1)$ 线性；每种坍缩情形把它化为一或两个标量条件，由此显式得到 $\gamma$ 与 $\eta$。

(i) **常量源。** $z_0\equiv c(y)$ 固定而 $z_1$ 自由变化。匹配式（26）中 $z_1$ 的系数迫使 $\gamma=\dot\alpha_t/\alpha_t$；剩余标量方程给出 $\eta=c(y)(\dot\beta_t-\gamma\beta_t)$。

(ii) **常量目标。** 与 (i) 对称：$\gamma=\dot\beta_t/\beta_t$、$\eta=c(y)(\dot\alpha_t-\gamma\alpha_t)$。

(iii) **无界源尺度。** 当 $\|z_0\|\to\infty$ 而 $z_1$ 有界时，式（26）中 $z_0$ 项占优；左端有限要求 $\gamma\beta_t=\dot\beta_t\Rightarrow\gamma=\dot\beta_t/\beta_t$。取该选择并令 $\eta=0$ 时恒等式对所有 $(z_0,z_1)$ 成立。

(iv) **无界目标尺度。** 与 (iii) 对称（角色互换）：$\gamma=\dot\alpha_t/\alpha_t$、$\eta=0$。

(v) **比例坍缩。** 设 $z_0=k(y)z_1$。代入式（26）得关于自由变量 $z_1$ 的单一方程：$\gamma[\beta_tk(y)+\alpha_t]z_1=[\dot\beta_tk(y)+\dot\alpha_t]z_1$。因此 $\gamma(t,y)=(\dot\beta_tk(y)+\dot\alpha_t)/(\beta_tk(y)+\alpha_t)$、$\eta(t,y)=0$。

在全部五种情形中，$\gamma$ 与 $\eta$ 都只依赖 $(t,y)$ 与坍缩映射 $(f,g)$。因此优化器可达到平凡极小，此时 $v_\theta$ 不再引导有意义的流，生成分布坍缩到单一/非正常模式。

## 附录 C：实现细节（原 PDF 第 16—17 页）

### C.1 合成数据

速度网络接收三个正弦位置嵌入，分别编码潜状态 $x_t$、类别标签 $y$ 与时间 $t$。每个嵌入维数为 8，拼接得到 24 维特征向量；该向量经三层 MLP 处理（隐层均为 24→24 线性投影后接 GELU 激活），最后由线性层把 24 维映射为 1 维，产生标量速度。整个模型（含全部嵌入参数）共 1,993 个可训练参数。

为实现加性位移 $\mu_0(y)$ 与 $\mu_1(y)$，我们引入两个轻量条件网络；每个由一个把 8 维类别嵌入映射为标量位移的线性层加一个偏置项构成，每网络 9 个参数。两个线性层的权重与偏置都初始化为零，确保训练开始时加性位移恒为零。

训练批大小为 1,024，使用 AdamW（$\beta_1=0.9$、$\beta_2=0.95$）。学习率按参数组微调：源位移网络 $1\times10^{-3}$、目标位移网络 $1\times10^{-4}$、其余参数 $1\times10^{-5}$。除另有说明，模型训练 50k 步；模式坍缩实验延长到 100k 步以确保收敛。所有合成数据实验在 Apple M1 Pro 笔记本的 CPU 上执行。

### C.2 ImageNet

我们在 JAX 中重新实现开源的 SiT 代码库（https://github.com/willisma/SiT），并在 ImageNet $256\times256$ 分辨率上复现 SiT/XL-2 配置作为基线；精确架构、数据管线、优化器（AdamW）与学习率调度都与原代码一致。训练在单个 v6e-256 TPU 切片上完成。

对源与目标 CAR-Flow，我们都附加一个轻量标签条件网络，把 1152 维类别嵌入映射为形状 $32\times32\times4$ 的潜张量：

- **稠密层**：$1152\to128\times4\times4$。
- **上采样**：三次重复 ConvTranspose2d(kernel_size=2, stride=2) → GroupNorm → ReLU；形状 $4\times4\times128\to8\times8\times64\to16\times16\times32\to32\times32\times16$。
- **输出头**：$3\times3$ 卷积（padding 1）到 $32\times32\times4$，权重与偏置初始化全零以确保训练开始时无位移。

每个网络含 240 万参数（约为 SiT/XL-2 主干的 0.3%），带来可忽略的开销。SiT 主干沿用原始 AdamW 优化器、学习率 $1\times10^{-4}$、全局批大小 256。两个标签条件网络使用更高的学习率 $1\times10^{-1}$ 训练；其他超参数不变。

## 附录 D：发现的讨论（原 PDF 第 17—18 页）

### D.1 相对学习率

实验中我们发现，轻量条件网络（学习加性位移 $\mu_0(y)$ 与 $\mu_1(y)$）与速度网络主干之间的相对学习率，对学习到的位移幅度与收敛速度都有一阶影响——二者之间存在"竞速"。

为研究这一点，我们复用合成数据示例：固定主干学习率为 $1\times10^{-5}$，在三个数量级（$1\times10^{-5}$、$1\times10^{-4}$、$1\times10^{-3}$）上扫描位移网络学习率，训练仅源与仅目标 CAR-Flow 模型。图 6a 与 6c 分别画出仅源与仅目标变体的 $\mu_0$ 与 $\mu_1$ 轨迹。在最小学习率下，位移接近零，主干承担条件化，导致对齐较慢；在中等学习率下，位移稳步增长——但仍可能被主干拉动（例如 $\mu_0(y=B)$ 先为正、后逐渐变负，从而减小 $|\mu_0(y=A)-\mu_0(y=B)|$）；在最大学习率下，位移迅速达到较大幅度并驱动最快收敛。图 6b 与 6d 报告 Wasserstein 距离，确认最高的位移网络学习率取得最快的分布对齐。

这些观察表明，赋予位移网络更高学习率可显著加速对齐。实践中应选择足够高的位移网络学习率以加快收敛，同时保持稳健的类间分离。

为验证这些趋势可推广到大规模数据，我们在 ImageNet 上用 SiT-XL/2 主干做了同样的学习率扫描：固定主干学习率为其默认值 $1\times10^{-4}$，在仅源、仅目标与联合三种配置下训练 CAR-Flow 条件网络，把其学习率从 $1\times10^{-3}$ 变到 $1\times10^{-1}$。图 7 展示每个变体在 400K 步时的 FID，虚线标出 SiT-XL/2 基线 17.2。

在较低条件网络学习率（约 $10^{-3}$）下，仅源与仅目标变体与基线持平或更差，而联合变体已优于基线。随学习率升高，三种变体都带来实质改善——仅目标在 $2\times10^{-2}$ 时取得最佳 FID 12.77，联合变体在整个扫描中表现最稳定。即使在最高学习率（$10^{-1}$）下，所有配置仍远低于基线。

这些大规模结果与合成数据发现一致：提高位移网络学习率可加速对齐并改善样本质量，尽管具体最优值随变体而异并需要一定调参。为简单与稳健，我们在主实验中采用 $1\times10^{-1}$ 的学习率。图 8 给出该学习率下各 CAR-Flow 变体的示例输出，显示联合变体的视觉保真优于仅源与仅目标模型。

### D.2 条件感知源 vs 无条件位移

作为上述观察的补充，我们检验让源条件感知相比使用单一无条件位移是否有益。直观上，考虑仅源 CAR-Flow 变体：它用依赖 $y$ 的位移重参数化源。当目标分布随条件变量变化时，按条件对齐源应相对无条件源减少输运负担 [Albergo et al., 2023]。

我们在 4.1 节的 1 维合成设置中检验这一点，比较 (i) 带全局位移的可学习无条件源与 (ii) 带 $y$ 相关位移的条件感知源。Wasserstein 距离对 (i) 为 0.058、对 (ii) 为 0.041，表明逐条件对齐减少了输运。这支持 CAR-Flow 的设计选择，并澄清它与无条件"可学习源"的区别。

## 附录 E：CIFAR-10 上的额外结果（原 PDF 第 19 页）

为评估 ImageNet 之外的泛化，我们在 CIFAR-10 上用像素空间扩散训练 SiT-XL/2 基线与 CAR-Flow 变体 400k 步（因 CIFAR-10 分辨率仅 $32\times32$，故省略 VAE）。所有 CAR-Flow 变体都优于基线（见表 4），表明 CAR-Flow 的收益可跨数据集泛化。

## 附录 F：定性结果（原 PDF 第 20 页）

定性结果见图 9。

## NeurIPS 论文检查表（原 PDF 第 21—27 页）

以下逐项保留原文问答与作者理由（模板性 Guidelines 说明从略）。

1. **主张**：摘要与引言中的主要主张是否准确反映论文贡献与范围？答：[是]。理由：三项贡献总结于第 1 节末；第 1、2 点在 3 节详述，第 3 点在 4 节详述。
2. **局限**：论文是否讨论作者工作的局限？答：[是]。理由：局限在第 6 节讨论。
3. **理论假设与证明**：每个理论结果是否给出完整假设与完整（且正确）的证明？答：[是]。理由：本文有两个命题（命题 1 与命题 2）；命题 1 的证明在附录 B，命题 2 的证明在 3.3 节。
4. **实验结果可复现性**：论文是否充分披露复现主要结果所需信息？答：[是]。理由：实现细节在 4 节与附录 C 提供。
5. **数据与代码的开放获取**：论文是否提供数据与代码开放获取及充分说明？答：[否]。理由：所提方法实现直接；超参数设置遵循先前工作。
6. **实验设置/细节**：论文是否说明理解结果所需的全部训练与测试细节？答：[是]。理由：细节在 4 节与附录 C 提供。
7. **实验统计显著性**：论文是否恰当且正确地报告误差棒或其他显著性信息？答：[是]。理由：细节在 4 节提供。
8. **实验计算资源**：论文是否提供复现实验所需的计算资源信息？答：[是]。理由：信息在 4 节与附录 C 提供。
9. **伦理准则**：研究是否在所有方面符合 NeurIPS 伦理准则（https://neurips.cc/public/EthicsGuidelines）？答：[是]。理由：我们已确认本研究符合 NeurIPS 伦理准则。
10. **更广泛影响**：论文是否讨论潜在正面与负面社会影响？答：[是]。理由：更广泛影响在第 6 节讨论。
11. **防护措施**：论文是否描述针对高风险误用数据/模型发布的防护措施？答：[不适用]。理由：我们的贡献主要偏理论，直接误用风险极小。
12. **现有资产的许可**：所用资产（代码、数据、模型）的创建者/所有者是否被恰当署名，许可与使用条款是否明确提及并遵守？答：[是]。理由：基线与数据集都有恰当引用，许可得到遵守。
13. **新资产**：论文引入的新资产是否有良好文档并与资产一同提供？答：[不适用]。理由：不发布新资产。
14. **众包与人类受试者研究**：论文是否包含给参与者的完整说明、截图与报酬细节？答：[不适用]。理由：所报告研究不涉及众包或人类受试者研究。
15. **IRB 批准**：论文是否描述受试者潜在风险、风险披露与 IRB 批准？答：[不适用]。理由：所报告研究不涉及众包或人类受试者研究。
16. **LLM 使用声明**：若 LLM 是核心方法的重要、原创或非标准组件，论文是否说明其使用？答：[不适用]。理由：本研究的方法开发不涉及作为重要、原创或非标准组件的 LLM。

**本页范围与校对状态：** 本页依据 arXiv:2509.19300（NeurIPS 2025 会议论文，正文含参考文献与附录共 27 页）完成全文中文翻译：摘要、第 1—6 节（含 2.1—2.3、3.1—3.3、4.1—4.2）、算法 1—2、致谢、图 1—9 中文图注、表 1—4 逐格转录、参考文献 27 条（原文为作者—年格式、无编号；本页按原顺序以项目符号列表转录，条目文字未改动）、附录 A—F（含式（13）—（26）与全部实现细节）、NeurIPS 论文检查表 16 项问答与理由均按原文结构录入。编号公式 (1)—(26) 按原文保留。表 1 与表 3 已用本地 NeurIPS PDF 第 6、9 页渲染图逐格核对一致；表 2 与表 4 按抽取文本转录。**逐句逐式终校未做**；图内轨迹/样本图像未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①本地可用的 PDF 为 NeurIPS 2025 正式版，与 arXiv 抽取文本在表 3 的 FID/IS 呈现上略有排版差异（正文数值口径一致），已按抽取文本与渲染图双重核对；②检查表第 5 项对代码开放获取答"否"，已在对应条目照录；③论文作者中有三位标注"工作完成于在 Apple 任职期间"，已在作者信息中注明。原文为 NeurIPS 双栏格式，无作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
