---
layout: page
title: "优化你的采样：基于贝叶斯优化的扩散采样调优｜中文全文译文"
permalink: /papers/translations/2026-09-28-2608-18040-optimize-your-sampling-tuned-diffusion-sampling-with-bayesian-optimiza/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/635364ae01804c27/) · [原文 arXiv](https://arxiv.org/abs/2608.18040) · [全部目录](/papers/catalog/)

# 优化你的采样：基于贝叶斯优化的扩散采样调优

**原题：** Optimize Your Sampling: Tuned Diffusion Sampling with Bayesian Optimization  
**作者：** Travis Zhang\*、Christian Belardi\*、Justin Lovelace、Jin Peng Zhou、Saebyeol Shin、Carla P. Gomes、Kilian Q. Weinberger（康奈尔大学；\* 表示同等贡献）  
**版本：** arXiv:2608.18040v1（cs.LG），2026 年 8 月 18 日提交，原文 19 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1—5 节、致谢、附录 A—D、图 1—图 9 图注、表 1—表 10 与参考文献（英文原条目）按原文结构录入；原文公式未编号；逐句逐式终校未做。

## 摘要

从扩散模型采样通常需要大量通过大型神经网络的前向传播，使生成在计算上代价高昂。尽管已有大量工作聚焦于高效求解器与采样器，但对**采样时间步本身的选择**关注相对较少。近期一类工作优化的是为样本质量理论推导的替代指标，而非质量指标本身。本文提出 **Optimizing Your Sampling（OYS）**，它把时间步选择视为**黑盒优化问题**，用贝叶斯优化直接优化目标指标。在文本到图像生成上，OYS 优于默认调度与 Align Your Steps 的调度；在图像修复（inpainting）及其他图像任务上优于默认调度——这体现在定量指标与人工评估两方面。OYS 无需额外训练，甚至适用于蒸馏模型，并可改进 Euler、DPM-Solver++ 等简单与复杂采样器。一个 5 步 OYS 调度保留了 50 步调度 **89%–94%** 的质量，同时把推理代价降低 **10 倍**。

## 1 引言

扩散模型（Ho et al., 2020；Song et al., 2021；Sohl-Dickstein et al., 2015）已在广泛的生成任务中取得先进性能，包括文本到图像合成（Ramesh et al., 2022；Rombach et al., 2022；Saharia et al., 2022b；Peebles & Xie, 2023）、超分辨率（Saharia et al., 2023；2022a）、图像修复（Lugmayr et al., 2022；Corneanu et al., 2024）与视频生成（Ho et al., 2022；Blattmann et al., 2023）。然而，迭代去噪过程需要大量通过大型神经网络的前向传播，使生成计算代价高昂。

降低该代价的大量努力集中于设计高效采样器（Liu et al., 2022；Lu et al., 2022a;b），以及开发少步模型，例如蒸馏模型（Salimans & Ho, 2022；Meng et al., 2023；Zhou et al., 2024；Xie et al., 2024；Starodubcev et al., 2025；Gu et al., 2023）、一致性模型（Song et al., 2023；Luo et al., 2023；Lu & Song, 2024）与 meanflow 模型（Geng et al., 2026a;b）。相比之下，对**采样时间步的选择**——即反向扩散过程中使用哪些时间步——关注少得多。然而该选择对质量影响显著，尤其在低步数预算下，此时默认调度会迅速退化。

先前工作 Align Your Steps（AYS）（Sabour et al., 2024）通过把时间步选择表述为最小化真实生成过程与其离散化之间的 KL 散度上界（KLUB）来处理该问题。但完全最小化该上界并不必然最小化输出分布之间的失配，因此 AYS 需要从启发式初始化出发并提前停止（Sabour et al., 2024）。已发布的 AYS 调度均在 10 步下优化，且在 log-SNR 空间中与默认调度保持接近。我们发现这在低步数预算下代价明显：在完整时间步范围内**全局重分配**步数所获得的增益，大于局部精化所能达到的增益。

本文提出 **Optimizing Your Sampling（OYS）**，把时间步选择视为黑盒优化问题，并用贝叶斯优化求解（Kushner, 1964；Žilinskas, 1975；Močkus, 1975；Jones et al., 1998；Osborne et al., 2009；Garnett, 2023）。OYS 在不需要梯度信息的条件下搜索完整配置空间，使优化器能够在整个时间步范围内重分配步数，而非仅作局部精化。它不需要额外训练，且适用于任何扩散模型。

在文本到图像生成上，OYS 一致优于 AYS 与按对数线性降采样的默认调度；在图像修复与逆图像任务上优于默认调度；这些结论均经定量指标与人工评估验证，图 1 给出定性比较。检查优化后的调度可发现一致规律：OYS 把更多步分配给高噪声时间步，而 AYS 与默认调度在 log-SNR 上近似均匀间隔。OYS 仅用 5 步便保留了 50 步调度的相当大部分质量。此外 OYS 是高效的：对 SDXL，调优在约 1.7 万次 5 步生成（8.5 万次前向传播）处饱和——比 Sabour et al.（2024）报告的 AYS 调优代价上界低一个数量级以上。

## 2 相关工作

若干先前工作探索了定制化的采样调度或配置。Karras et al.（2022）提出一个统一的扩散模型训练与采样框架，定义了控制随机与确定性采样多方面的若干参数（包括调度）：$\sigma_{\min}$ 与 $\sigma_{\max}$ 规定噪声范围边界，$\rho$ 控制步长的分布方式。然而寻找最优配置需要昂贵的网格搜索，每次评估需 50,000 次图像生成。Karras et al.（2024）在该框架上增加指数滑动平均（EMA）长度与引导强度等参数，同样依赖网格搜索。

Lugmayr et al.（2022）是最早提出定制采样调度的工作之一：为图像修复设计一种在时间上反复前进／后退（在扩散过程中呈之字形）的去噪调度，以额外函数评估为代价改善掩蔽区域与非掩蔽区域之间的一致性。

Watson et al.（2021）则把调度本身作为优化对象，用动态规划选择使证据下界最大的 $K$ 步子序列；所得调度改善了似然，但并未改善感知质量。Watson et al.（2022）用可微扩散采样器搜索（DDSS）处理该失配：通过反向传播穿过采样过程，优化参数化采样器族的自由度以最大化感知分数。这带来两项代价。第一，目标必须可微，因此他们优化 Kernel Inception Distance 作为样本质量的可微替代。第二，展开采样链需要保留其前向传播状态，其内存随采样步数线性增长；正如作者所述，对大型去噪器结构而言很快变得不可行，因此 DDSS 必须重算（rematerialize）分数函数调用，在反向传播中重新计算它们，以额外计算换取内存。OYS 同样以直接优化感知质量为目标，但把目标视为黑盒：每次评估都是一次普通的前向采样，采样器中不流动梯度。因此它优化目标指标本身而非可微代理，既避免展开采样器的内存开销，也避免重算的计算开销，并能容纳不可微操作（例如离散时间模型把时间步取整为整数）。

Sabour et al.（2024）提出 Align Your Steps（AYS），把调度优化表述为最小化真实生成随机微分方程（SDE）与其离散化之间的 KL 散度上界（KLUB）。KLUB 可分解为相邻调度点之间区间上的求和。AYS 通过一种零阶过程迭代地在局部调整每个中间时间步来最小化该总量，端点固定、调度由启发式调度初始化。他们证明手工设计的调度（如 Karras et al., 2022）是次优的，其调优调度可改善样本质量。然而由于 KLUB 是上界而非输出失配本身，最小化它并不必然最小化该失配（Sabour et al., 2024），其过程依赖提前停止以避免过度优化。经验上，所得调度在 log-SNR 空间中仍接近默认调度（见图 5）。已发布的 AYS 调度为 10 步；本文按其规定的对数线性插值把它们适配到更少步数。

另有两项方法重新审视时间步选择。与本文同期，Huang et al.（2026）提出自适应重参数化时间（ART），把采样器"时钟"的速度视为控制变量，把计算沿轨迹重新分配以最小化累计 Euler 离散化误差，并用连续时间强化学习求解所得问题。近期 Zhu et al.（2026）提出层次化调度优化器（HSO），一种双层方法：在调度初始化的全局搜索与中点误差代理的局部精化之间交替，并对病态接近的时间步施加惩罚以在极低步数下保持稳健。

两者都具有 AYS 的界定特征：优化的是理论上推导的样本质量替代指标（AYS 为 KLUB，ART 为 Euler 离散化误差，HSO 为中点误差代理），而非所关心的量本身。这样使搜索代价低（优化时无需生成图像），但把所得调度绑定于替代指标追踪感知质量的忠实程度。OYS 处于该权衡的另一端：由于直接评估目标指标，它在调优期间承担生成图像的代价，但优化的恰是调度最终被评判的准则，并且可原样应用于不存在可处理替代指标的目标——人类偏好分数、LPIPS 或任务特定的重建误差。该代价对每个模型与任务只需支付一次，并在后续所有采样中摊销。本文方法也自然地从时间步本身扩展到周围的采样参数，例如引导强度与 EMA 长度，而这些是替代指标类目标无法建模的。

## 3 Optimize Your Sampling（OYS）

本节介绍 OYS 框架，优化循环概览见图 2。概括而言，对给定任务（例如文本到图像生成或图像修复），假设可获得用于调优的输入集合 $\mathbf X$、固定的预训练扩散模型 $m$ 以及量化性能的黑盒评估指标 $e$。OYS 用贝叶斯优化迭代地优化一组采样参数 $\mathbf p=\{p_1,\ldots,p_M\}$，直至优化收敛或预算耗尽。

### 优化不同的扩散表述

扩散模型可大致分为两种表述：**离散时间**表述把扩散过程定义为固定长度的加噪马尔可夫链；**连续时间**表述把它定义为连续噪声日程上的微分方程。两种表述中时间都参数化噪声水平，采样都需要选择有序的时间步序列（即采样调度）来馈入模型。该采样调度的表示方式各异：多数模型不参数化调度、直接指定时间步，而某些连续时间模型把它定义为一个带若干可调参数的函数族。下面分别讨论。

### 直接调度优化

多数扩散模型并未为采样调度规定参数族；对这些模型，本文直接优化调度时间步。

关键挑战是：如何参数化调度以进行连续优化。虽然并不严格要求采样调度单调递减，但标准实践建议去噪轨迹应从高噪声走向低噪声。本文用**累积乘积重参数化**强制这一点：对 $K$ 步调度中的每一步 $k$，优化连续参数 $p_k\in[0,1]$ 并把调度定义为

$$
\mathbf s(\mathbf p)=\left[t_{\max}\prod_{i=1}^{k}p_i\right]_{k=1}^{K}
=\left[t_{\max}p_1,\ (t_{\max}p_1p_2),\ \ldots,\ (t_{\max}p_1p_2\cdots p_K)\right],
$$

其中 $t_{\max}$ 为最大时间步，$K\le M$ 以便在调度之外容纳额外超参数。由于每个 $p_k$ 都把一个 $[0,1]$ 内的值乘到累积乘积上，所得调度按构造单调递减。对 $k>1$，每个参数 $p_k$ 即相邻时间步之比 $t_k/t_{k-1}$。对时间步必须属于固定整数集合（通常 $\{0,\ldots,999\}$）的离散时间模型，在缩放之后施加取整（记为 $q$）：

$$
\mathbf s(\mathbf p)=\left[q\!\left(t_{\max}\prod_{i=1}^{k}p_i\right)\right]_{k=1}^{K}
=\left[q(t_{\max}p_1),\ q(t_{\max}p_1p_2),\ \ldots,\ q(t_{\max}p_1p_2\cdots p_K)\right].
$$

作者指出，该参数化并不会在合法单调调度上诱导均匀分布。由于靠后的时间步是更多 $[0,1]$ 项的乘积，它们会集中在较小取值附近，使搜索偏向在低噪声处花费更多步数的调度。实践中，贝叶斯优化代理会学习补偿这种非均匀性；我们发现尽管存在该偏置，OYS 仍一致地发现把更多步分配到高噪声（大时间步）区域的调度，见图 5。

### 参数化调度

EDM 系列扩散模型（Karras et al., 2022；2024）为其采样调度规定函数形式，参数为 $\sigma_{\min}$、$\sigma_{\max}$ 与 $\rho$。Karras et al.（2024）还额外调优 EMA 长度与无分类器引导强度。由于所有参数均为实值且约束在闭区间内，本文把每个参数视为 $\mathbf p$ 中元素并联合优化。在此设置下，时间步本身通过调度函数形式的参数被间接调优。

### 贝叶斯优化

目标是寻找采样配置 $\mathbf p$，使其在调优集 $\mathbf X$ 与模型 $m$ 上最小化评估指标 $e$：

$$
\mathbf p^{\ast}=\arg\min_{\mathbf p\in\mathcal P}\ e\big(m(\mathbf X;\mathbf p)\big).
$$

对越高越好的指标（如 HPS），本文最小化其取负值；因此全文把优化统一表述为最小化。

本文使用贝叶斯优化（Kushner, 1964；Žilinskas, 1975；Močkus, 1975；Jones et al., 1998；Osborne et al., 2009；Garnett, 2023）：它用高斯过程逼近函数 $f(\mathbf p)=e(m(\mathbf X;\mathbf p))$，顺序地选择并评估配置。高斯过程拟合到已有评估 $\mathcal D=(\mathbf p^{(j)},y^{(j)})_{j=1}^{N}$，给出目标函数上的后验分布，其中 $y^{(j)}$ 是采样配置 $\mathbf p^{(j)}$ 的观测值。该后验同时提供均值与不确定性估计，用于定义引导搜索有前景采样配置的采集函数。初始配置通过 Sobol 采样选择，Sobol 样本数设为参数个数的两倍。评估完 Sobol 采样配置后，拟合高斯过程并切换到 qLogNEI 采集函数（Ament et al., 2023；Letham et al., 2019）来选择新的候选配置。

## 4 实验

本文在多种图像域任务上评测 OYS 找到的采样配置，并在适用时与相关基线比较。凡是对调度降采样，都采用 Sabour et al.（2024）为把其调度适配到其他步数所规定的对数线性插值流程。由于已发布的 AYS 调度均为 10 步（Sabour et al., 2024），少步 AYS 基线通过对它们降采样得到。所有实验都在留出示例集上评测。

### 评估指标

本文用标准图像质量指标评估，例如 Fréchet Inception Distance（FID）（Heusel et al., 2017）与峰值信噪比（PSNR）（在适用时）。然而这些指标并不刻画文本提示与生成图像之间的对齐。为此，Wu et al.（2023）提出 Human Preference Dataset v2（HPD v2），并在该数据集上微调 CLIP 模型的 ViT-L/14 版本。利用该微调模型，他们把文本—图像对 $(T,I)$ 的**人类偏好分数**定义为

$$
\mathrm{HPS}(T,I)=\omega\,\frac{E_T(T)}{\lVert E_T(T)\rVert}\cdot\frac{E_I(I)}{\lVert E_I(I)\rVert},
$$

其中 $E_T$ 与 $E_I$ 分别为 CLIP 文本编码器与图像编码器，$\omega$ 为学习得到的缩放参数。给定提示 $T$ 与两个竞争方法生成的图像 $I_1$、$I_2$，预测偏好胜率由二者 HPS 分数经 Bradley–Terry 模型计算：

$$
P(I_1\succ I_2\mid T)=\operatorname{Softmax}\big(\mathrm{HPS}(T,I_1),\ \mathrm{HPS}(T,I_2)\big)_{I_1}.
$$

本文报告逐提示比较得到的经验胜率：对每个留出提示，用被比较的两个调度各生成一张图像，用 HPS 打分，分数更高者获胜；胜率为获胜提示所占比例。除另作说明外，比较对象为相同步数下的默认调度。

### 文本到图像

本文在六个文本到图像模型上评测 OYS。在 COCO Captions（Chen et al., 2015）上，于训练集调优、在验证集评测，使用 DeepFloyd（at StabilityAI, 2023）、Stable Diffusion XL（Podell et al., 2024）与 Stable Diffusion v1.5（Rombach et al., 2022）——它们是已发布 AYS 调度（Sabour et al., 2024）、也是本文主要比较对象的模型——以及 SDXL-Turbo（Sauer et al., 2025），后者是为少步采样蒸馏的模型，用以检验调优是否能与蒸馏互补。在 DiffusionDB（Wang et al., 2022）上，于一个子集上分别调优 FLUX.1-dev（Labs et al., 2025）与 QwenImage（Wu et al., 2025），并在留出子集上评测，与它们各自的默认调度比较。本文用贝叶斯优化最大化 HPS（Wu et al., 2023）来优化采样时间步，每轮以批大小 128 计算 HPS。遵循 Sabour et al.（2024），DeepFloyd、Stable Diffusion XL 与 Stable Diffusion v1.5 的采样器固定为 DPM-Solver++（Lu et al., 2022b），而 FLUX.1-dev、QwenImage 与 SDXL-Turbo 使用 Euler Discrete 采样器。

COCO Captions 的结果见表 1，DiffusionDB 的结果见表 2。如表 1 所示，在 10 步时调度选择影响很小：对三个模型而言，把默认调度按对数线性降采样后仍与 AYS 具有竞争力。但在 5 步时性能显著退化，各调度明显分化。因此本文聚焦这一激进的低步数区间——调度选择对质量的影响在此最大。OYS 在所有模型上发现更优的采样调度，相对默认调度取得更高的胜率与更高的平均 HPS 分数。

对 SDXL-Turbo，3 步调优调度优于 3 步默认调度。对 FLUX.1-dev 与 QwenImage（见表 2），调优的 5 步调度优于默认调度，且分别只需 5,376 与 2,560 次生成——相当于在模型各自 28 步与 50 步默认预算下 960 与 256 次生成的成本。因此，两模型的绝对 HPS 不应被解读为模型比较：表 2 中所有数值都是 5 步预算下的结果，远低于其默认预算。这些结果跨越标准模型与蒸馏模型、离散时间与连续时间表述以及多种采样器，表明 OYS 调度调优的收益具有广泛适用性。

为评估 OYS 的改善是否对应人类感知质量而非仅针对调优指标，本文用 SDXL 的 5 步调度开展人工评估，比较 AYS、OYS 与 Default（默认）的生成结果。从 58 名参与者众包收集对图像保真度与对齐度的评价。每名参与者收到从 AYS、OYS 或 Default 生成并随机打乱的图像对，并被要求选择图像 1、图像 2 还是平局更好回答所问问题。评分界面示例见附录。如图 3 所示，OYS 在图像质量与对齐两方面都显著优于 AYS 与 Default。显著性用对每组配对胜／负计数（剔除平局）的双侧精确二项检验评估；每一比较都在 $p<0.001$ 下显著。质量方面，OYS 相对 AYS 的胜率为 68.8%、相对 Default 为 70.6%（平局在两方法间均分）；对齐方面，OYS 相对 AYS 的胜率为 62.9%、相对 Default 为 66.8%。当 AYS 被对数线性降采样到 5 个时间步时，在 SDXL 上不敌 5 步默认调度。这些人类偏好结果也得到了**从未作为调优目标**的指标的支持：优化 HPS 可显著改善 DeepFloyd 与 SDXL 上的 FID；在 SDv1.5 上所有 5 步调度的 FID 相当，本文不解读如此小的差异，因为零样本 COCO FID 只能松散地追踪感知质量（Hoogeboom et al., 2025）。任何情况下，为人类偏好优化都不会降低分布质量（见附录表 6）。如下文各节所示，为图像修复用 LPIPS 调优可同时改善 PSNR 与 HPS（见表 3）；为逆图像任务用 MSE 调优可改善 HPS（见表 4）。这些结果共同表明 OYS 的增益反映了图像质量的真实提升。

### 图像修复

本文在图像修复任务上评测 OYS：在 COCO Captions（Chen et al., 2015）训练集上为 Stable Diffusion 1.5 与 Stable Diffusion XL 优化 5 步采样调度（批大小 64），在验证集上评测；两个模型均使用 PNDMScheduler（Liu et al., 2022）。优化目标为 LPIPS（Zhang et al., 2018），它度量修复样本与真值之间的感知相似度。调优调度在两个模型上都优于默认调度：SDXL 上 PSNR 提升 6.9 dB、SDv1.5 上提升 2.9 dB，并分别赢得 93.4% 与 85.1% 的 HPS 比较（见表 3 与图 4）。需注意这些模型被训练用于改动**整幅**图像而非仅掩蔽区域，这使修复区域与非掩蔽区域之间的过渡更平滑；在 5 步默认调度下这种自由反而成为失效模式（连非掩蔽区域也被破坏），而 OYS 调度能保留它们。

### 调度分析

对任何扩散模型，每个时间步都映射到一个 log 信噪比（log-SNR），从而为不同模型的噪声水平提供统一表示（Kingma & Gao, 2023）。本文在图 5 中于 log-SNR 空间绘制调度。AYS 与 Default 看起来非常相似：AYS 从启发式初始化出发、局部精化并提前停止，使其调度保持接近默认。相反，OYS 把更多时间步分配给更高噪声水平，在低步数预算下改善下游图像质量与提示对齐。

### 逆 HED、逆深度与逆分割

本文探索 Prompt Diffusion（Wang et al., 2023）的采样优化；该模型通过上下文学习执行多种图像生成任务，同时接受文本提示、两张演示期望变换的图像与一张查询图像。本文为三个逆图像任务优化调度：(1) 逆 HED 把突出物体边界的边缘图转换为逼真图像；(2) 逆深度把深度图转换为视觉丰富的渲染图像；(3) 逆分割把语义分割图转换为逼真图像。使用 Wang et al.（2023）的数据集，按他们的设置生成 HED、深度与分割图。在验证集上优化 5 步调度以最小化生成输出与真值图像之间的均方误差，再在测试集上评测。与先前实验一致，OYS 在三个任务上都取得更高的平均 HPS，相对默认调度的 HPS 胜率分别为 65.4%、57.6% 与 58.8%（逆 HED、逆深度、逆分割），并在逆 HED 与逆深度上改善 PSNR；在逆分割上 PSNR 基本不变（见表 4 与图 8）。

### 优化效率

图 6 给出优化调度性能作为优化期间所用生成次数的函数。所有模型的性能都在 17 万张图像之前饱和，SDXL 则在 1.7 万次生成之前饱和。由于这些是 5 步生成，SDXL 的代价约等价于 1.7 千次 50 步生成。作为对比，Sabour et al.（2024）报告 AYS 调优代价的上界——最多 300 轮、每轮 8,192 个样本，约 240 万次生成——依模型不同，比 OYS 所需多一到两个数量级。即使把该上界下调一个数量级，OYS 在我们调优的每个模型上仍更便宜。

### EDM2 图像生成

本文考察调优 EDM2 系列扩散模型（Karras et al., 2024）的采样配置还能带来多少性能增益。Karras et al.（2024）采用 Karras et al.（2022）通过从粗到细网格搜索得到的确定性采样配置。本文优化其第 2 节所述确定性采样器的参数 $\sigma_{\min}$、$\sigma_{\max}$ 与 $\rho$，并与 EMA 长度、引导强度联合优化（使用各模型提供的默认引导网络），以最小化每个配置在 8,192 张图像上估计的 FID。

OYS 改进了 Karras et al.（2024）网格搜索得到的配置，在 ImageNet-512 上跨模型规模取得 3.57%–7.00% 的 FID 改善（见图 7）。优化后的配置以一致方式偏离默认值：OYS 在两端收窄采样噪声范围，对每个模型都把 $\sigma_{\max}$ 从默认的 80 降到约 20，同时对除 EDM2-XS 外的所有模型把 $\sigma_{\min}$ 提高五倍；它还增大了较小模型的引导，但对 EDM2-L 及更大模型完全关闭引导。完整配置与进一步分析见附录。

**表 1：COCO Captions 上的文本到图像结果。** 不同模型与方法在 HPS 平均值与 HPS 胜率上的比较（在 COCO Captions 验证集上评估）。胜率相对同一步数下的基线调度计算。DeepFloyd、Stable Diffusion v1.5 与 Stable Diffusion XL 使用 DPM-Solver++。对 SDXL-Turbo，本文基准测试 Euler Discrete（ED）采样器；Euler Ancestral（EA）结果完整列于附录。

| 模型 | 方法 | 步数 | HPS 平均值 ↑ | HPS 胜率 ↑ |
|---|---|---|---|---|
| DeepFloyd | Default | 50 | 0.267 | – |
| DeepFloyd | Default | 10 | 0.258 | – |
| DeepFloyd | AYS | 10 | 0.261 | – |
| DeepFloyd | Default | 5 | 0.215 | – |
| DeepFloyd | AYS | 5 | 0.225 | 65.39% |
| DeepFloyd | OYS | 5 | 0.252 | 83.99% |
| Stable Diffusion v1.5 | Default | 50 | 0.262 | – |
| Stable Diffusion v1.5 | Default | 10 | 0.258 | – |
| Stable Diffusion v1.5 | AYS | 10 | 0.258 | – |
| Stable Diffusion v1.5 | Default | 5 | 0.230 | – |
| Stable Diffusion v1.5 | AYS | 5 | 0.231 | 52.30% |
| Stable Diffusion v1.5 | OYS | 5 | 0.238 | 59.29% |
| Stable Diffusion XL | Default | 50 | 0.275 | – |
| Stable Diffusion XL | Default | 10 | 0.266 | – |
| Stable Diffusion XL | AYS | 10 | 0.264 | – |
| Stable Diffusion XL | Default | 5 | 0.229 | – |
| Stable Diffusion XL | AYS | 5 | 0.210 | 25.29% |
| Stable Diffusion XL | OYS | 5 | 0.245 | 70.70% |
| SDXL Turbo | Default | 3 | 0.287 | – |
| SDXL Turbo | OYS | 3 | 0.298 | 83.35% |

**表 2：DiffusionDB 上的文本到图像结果。** FLUX.1-dev 与 QwenImage 在 DiffusionDB 的不相交子集上调优与评估时，默认调度与 OYS 调度在 HPS 平均值与 HPS 胜率上的比较。两个模型均使用 Euler Discrete 采样器；胜率相对同一步数下的默认调度计算。由于这两个模型在不同提示集上评估，其 HPS 平均值不能直接与表 1 比较；又因两者都运行在远低于默认步数的预算下，两模型之间的差异并不反映它们在完整预算下的相对质量。

| 模型 | 方法 | 步数 | HPS 平均值 ↑ | HPS 胜率 ↑ |
|---|---|---|---|---|
| FLUX.1-dev | Default | 5 | 0.251 | – |
| FLUX.1-dev | OYS | 5 | 0.283 | 82.69% |
| QwenImage | Default | 5 | 0.174 | – |
| QwenImage | OYS | 5 | 0.193 | 77.19% |

**表 3：图像修复。** SDXL 与 SDv1.5 上 Default 与 OYS 调度在 PSNR、平均 HPS 与 HPS 胜率上的比较；HPS 胜率相对 Default 调度。

| 模型 | 方法 | PSNR ↑ | HPS 平均值 ↑ | HPS 胜率 ↑ |
|---|---|---|---|---|
| SDXL | Default | 66.59 | 0.203 | – |
| SDXL | OYS | 73.47 | 0.240 | 93.40% |
| SDv1.5 | Default | 64.46 | 0.213 | – |
| SDv1.5 | OYS | 67.34 | 0.237 | 85.10% |

**表 4：Prompt Diffusion。** 逆 HED、逆深度与逆分割上 Default 与 OYS 调度在 PSNR、HPS 与胜率上的比较；HPS 胜率相对 Default 调度。

| 任务 | 方法 | PSNR ↑ | HPS 平均值 ↑ | HPS 胜率 ↑ |
|---|---|---|---|---|
| 逆 HED | Default | 59.79 | 0.197 | – |
| 逆 HED | OYS | 60.46 | 0.206 | 65.43% |
| 逆深度 | Default | 58.51 | 0.198 | – |
| 逆深度 | OYS | 59.05 | 0.202 | 57.62% |
| 逆分割 | Default | 57.97 | 0.196 | – |
| 逆分割 | OYS | 57.60 | 0.201 | 58.80% |

## 5 结论

本文提出 Optimize Your Sampling（OYS）框架，把扩散采样参数选择转化为黑盒优化问题，调优评估指标本身而非替代指标。它无需重新训练，适用于任何预训练模型、采样器或目标。对文本到图像生成，OYS 同时优于 AYS 与默认调度；对图像修复与逆图像任务，OYS 优于默认调度。其增益还扩展到已为少步采样蒸馏的 SDXL-Turbo，表明调度调优在蒸馏之后仍有意义。一个 5 步 OYS 调度以十分之一的推理代价保留了 50 步调度 89%–94% 的质量；且改善在很大程度上也体现在从未用于调优的指标上，并得到人类评分者的佐证——这说明它们反映真实质量提升而非对调优指标的利用。

检查所发现的配置可揭示主流启发式所忽略的一致规律。在 log-SNR 空间中，短调度受益于把更多步分配给高噪声区域，这与默认调度和 AYS 调度都表现出的近似均匀间隔相反。对 EDM2 系列（OYS 调优的是参数化调度而非时间步本身），优化器在每种模型规模下都把 $\sigma_{\max}$ 压到远低于默认值。这些结果共同表明，常规的间隔与噪声范围启发式在低步数预算下浪费了真实的质量空间，且值得调优的参数不止于时间步。

OYS 并不追求普适调度——最优噪声调度本质上是依赖领域的（Chen, 2023）——而是使本就必要的领域特定调优过程更简单、更便宜。其代价对每个模型与任务只需支付一次，并在后续所有采样中摊销。因此 OYS 为跨架构与跨任务的高效采样提供了一条实用路径。

## 致谢

JL 获 Google PhD Fellowship 资助。本工作还得到美国国家科学基金会 AI 研究机构计划（Award No. DMR-2433348）、美国国家食品与农业研究所（USDA/NIFA）、美国空军科学研究办公室（AFOSR）、纽约长老会医院 NYP-Cornell 心血管 AI 合作项目以及 Schmidt AI2050 Senior Fellowship 的支持。

## 参考文献（英文原书目）

原文采用作者—年份（author–year）引用制，参考文献表未编号。以下按原文顺序逐条转录英文原条目并加序号（共 56 条，源文 pp. 11–14）。

[1] Sebastian Ament, Samuel Daulton, David Eriksson, Maximilian Balandat, and Eytan Bakshy. Unexpected improvements to expected improvement for bayesian optimization. Advances in Neural Information Processing Systems, 36:20577–20612, 2023.

[2] DeepFloyd Lab at StabilityAI. DeepFloyd IF: a novel state-of-the-art open-source text-to-image model with a high degree of photorealism and language understanding. https://www.deepfloyd.ai/deepfloyd-if, 2023.

[3] Andreas Blattmann, Tim Dockhorn, Sumith Kulal, Daniel Mendelevitch, Maciej Kilian, Dominik Lorenz, Yam Levi, Zion English, Vikram Voleti, Adam Letts, Varun Jampani, and Robin Rombach. Stable video diffusion: Scaling latent video diffusion models to large datasets, 2023.

[4] Ting Chen. On the importance of noise scheduling for diffusion models. arXiv preprint arXiv:2301.10972, 2023.

[5] Xinlei Chen, Hao Fang, Tsung-Yi Lin, Ramakrishna Vedantam, Saurabh Gupta, Piotr Dollár, and C Lawrence Zitnick. Microsoft COCO captions: Data collection and evaluation server. arXiv preprint arXiv:1504.00325, 2015.

[6] Ciprian Corneanu, Raghudeep Gadde, and Aleix M Martinez. LatentPaint: Image inpainting in latent space with diffusion models. In Proceedings of the IEEE/CVF winter conference on applications of computer vision, pp. 4334–4343, 2024.

[7] Roman Garnett. Bayesian Optimization. Cambridge University Press, 2023.

[8] Zhengyang Geng, Mingyang Deng, Xingjian Bai, Zico Kolter, and Kaiming He. Mean flows for one-step generative modeling. Advances in Neural Information Processing Systems, 38:75460–75482, 2026a.

[9] Zhengyang Geng, Yiyang Lu, Zongze Wu, Eli Shechtman, J Zico Kolter, and Kaiming He. Improved mean flows: On the challenges of fastforward generative models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 30467–30476, 2026b.

[10] Jiatao Gu, Shuangfei Zhai, Yizhe Zhang, Lingjie Liu, and Joshua M Susskind. BOOT: Data-free distillation of denoising diffusion models with bootstrapping. In ICML 2023 Workshop on Structured Probabilistic Inference & Generative Modeling, 2023.

[11] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. GANs trained by a two time-scale update rule converge to a local Nash equilibrium. Advances in neural information processing systems, 30, 2017.

[12] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[13] Jonathan Ho, Tim Salimans, Alexey Gritsenko, William Chan, Mohammad Norouzi, and David J Fleet. Video diffusion models. Advances in Neural Information Processing Systems, 35:8633–8646, 2022.

[14] Emiel Hoogeboom, Thomas Mensink, Jonathan Heek, Kay Lamerigts, Ruiqi Gao, and Tim Salimans. Simpler diffusion: 1.5 FID on ImageNet512 with pixel-space diffusion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 18062–18071, June 2025.

[15] Yilie Huang, Wenpin Tang, and Xunyu Zhou. ART for diffusion sampling: A reinforcement learning approach to timestep schedule, 2026. URL https://arxiv.org/abs/2601.18681.

[16] Donald R Jones, Matthias Schonlau, and William J Welch. Efficient global optimization of expensive black-box functions. Journal of Global optimization, 13(4):455–492, 1998.

[17] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models, 2022. URL https://arxiv.org/abs/2206.00364.

[18] Tero Karras, Miika Aittala, Jaakko Lehtinen, Janne Hellsten, Timo Aila, and Samuli Laine. Analyzing and improving the training dynamics of diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 24174–24184, 2024.

[19] Diederik Kingma and Ruiqi Gao. Understanding diffusion objectives as the ELBO with simple data augmentation. Advances in Neural Information Processing Systems, 36:65484–65516, 2023.

[20] Harold J Kushner. A new method of locating the maximum point of an arbitrary multipeak curve in the presence of noise. Journal of Basic Engineering, 1964.

[21] Black Forest Labs, Stephen Batifol, Andreas Blattmann, Frederic Boesel, Saksham Consul, Cyril Diagne, Tim Dockhorn, Jack English, Zion English, Patrick Esser, Sumith Kulal, Kyle Lacey, Yam Levi, Cheng Li, Dominik Lorenz, Jonas Müller, Dustin Podell, Robin Rombach, Harry Saini, Axel Sauer, and Luke Smith. FLUX.1 Kontext: Flow matching for in-context image generation and editing in latent space, 2025. URL https://arxiv.org/abs/2506.15742.

[22] Benjamin Letham, Brian Karrer, Guilherme Ottoni, and Eytan Bakshy. Constrained bayesian optimization with noisy experiments. Bayesian Analysis, 14(2):495–519, 2019. doi: 10.1214/18-BA1110.

[23] Luping Liu, Yi Ren, Zhijie Lin, and Zhou Zhao. Pseudo numerical methods for diffusion models on manifolds. In International Conference on Learning Representations, 2022. URL https://openreview.net/forum?id=PlKWVd2yBkY.

[24] Cheng Lu and Yang Song. Simplifying, stabilizing and scaling continuous-time consistency models. arXiv preprint arXiv:2410.11081, 2024.

[25] Cheng Lu, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. DPM-Solver: A fast ODE solver for diffusion probabilistic model sampling in around 10 steps. Advances in Neural Information Processing Systems, 35:5775–5787, 2022a.

[26] Cheng Lu, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. DPM-Solver++: Fast solver for guided sampling of diffusion probabilistic models. arXiv preprint arXiv:2211.01095, 2022b.

[27] Andreas Lugmayr, Martin Danelljan, Andres Romero, Fisher Yu, Radu Timofte, and Luc Van Gool. Repaint: Inpainting using denoising diffusion probabilistic models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 11461–11471, 2022.

[28] Simian Luo, Yiqin Tan, Longbo Huang, Jian Li, and Hang Zhao. Latent consistency models: Synthesizing high-resolution images with few-step inference. arXiv preprint arXiv:2310.04378, 2023.

[29] Chenlin Meng, Robin Rombach, Ruiqi Gao, Diederik Kingma, Stefano Ermon, Jonathan Ho, and Tim Salimans. On distillation of guided diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 14297–14306, 2023.

[30] Jonas Močkus. On bayesian methods for seeking the extremum. In Optimization Techniques IFIP Technical Conference Novosibirsk, July 1–7, 1974 6, pp. 400–404. Springer, 1975.

[31] Michael A Osborne, Roman Garnett, and Stephen J Roberts. Gaussian processes for global optimization. 3rd International Conference on Learning and Intelligent Optimization, pp. 1–15, 2009.

[32] William Peebles and Saining Xie. Scalable diffusion models with transformers. In Proceedings of the IEEE/CVF international conference on computer vision, pp. 4195–4205, 2023.

[33] Dustin Podell, Zion English, Kyle Lacey, Andreas Blattmann, Tim Dockhorn, Jonas Müller, Joe Penna, and Robin Rombach. SDXL: Improving latent diffusion models for high-resolution image synthesis. In B. Kim, Y. Yue, S. Chaudhuri, K. Fragkiadaki, M. Khan, and Y. Sun (eds.), International Conference on Learning Representations, volume 2024, pp. 1862–1874, 2024.

[34] Aditya Ramesh, Prafulla Dhariwal, Alex Nichol, Casey Chu, and Mark Chen. Hierarchical text-conditional image generation with CLIP latents. arXiv preprint arXiv:2204.06125, 2022.

[35] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 10684–10695, 2022.

[36] Amirmojtaba Sabour, Sanja Fidler, and Karsten Kreis. Align your steps: Optimizing sampling schedules in diffusion models. In Ruslan Salakhutdinov, Zico Kolter, Katherine Heller, Adrian Weller, Nuria Oliver, Jonathan Scarlett, and Felix Berkenkamp (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 42947–42975. PMLR, 21–27 Jul 2024.

[37] Chitwan Saharia, William Chan, Huiwen Chang, Chris Lee, Jonathan Ho, Tim Salimans, David Fleet, and Mohammad Norouzi. Palette: Image-to-image diffusion models. In ACM SIGGRAPH 2022 conference proceedings, pp. 1–10, 2022a.

[38] Chitwan Saharia, William Chan, Saurabh Saxena, Lala Li, Jay Whang, Emily L Denton, Kamyar Ghasemipour, Raphael Gontijo Lopes, Burcu Karagol Ayan, Tim Salimans, et al. Photorealistic text-to-image diffusion models with deep language understanding. Advances in neural information processing systems, 35:36479–36494, 2022b.

[39] Chitwan Saharia, Jonathan Ho, William Chan, Tim Salimans, David J. Fleet, and Mohammad Norouzi. Image super-resolution via iterative refinement. IEEE Transactions on Pattern Analysis and Machine Intelligence, 45(4):4713–4726, 2023. doi: 10.1109/TPAMI.2022.3204461.

[40] Tim Salimans and Jonathan Ho. Progressive distillation for fast sampling of diffusion models. In International Conference on Learning Representations, 2022. URL https://openreview.net/forum?id=TIdIXIpzhoI.

[41] Axel Sauer, Dominik Lorenz, Andreas Blattmann, and Robin Rombach. Adversarial diffusion distillation. In European Conference on Computer Vision, pp. 87–103. Springer, 2025.

[42] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International conference on machine learning, pp. 2256–2265. pmlr, 2015.

[43] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In International Conference on Learning Representations, 2021. URL https://openreview.net/forum?id=St1giarCHLP.

[44] Yang Song, Prafulla Dhariwal, Mark Chen, and Ilya Sutskever. Consistency models. In Andreas Krause, Emma Brunskill, Kyunghyun Cho, Barbara Engelhardt, Sivan Sabato, and Jonathan Scarlett (eds.), Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pp. 32211–32252. PMLR, 23–29 Jul 2023.

[45] Nikita Starodubcev, Denis Kuznedelev, Artem Babenko, and Dmitry Baranchuk. Scale-wise distillation of diffusion models. arXiv preprint arXiv:2503.16397, 2025.

[46] Antanas Žilinskas. Single-step bayesian search method for an extremum of functions of a single variable. Cybernetics, 11(1):160–166, 1975.

[47] Zhendong Wang, Yifan Jiang, Yadong Lu, Pengcheng He, Weizhu Chen, Zhangyang Wang, Mingyuan Zhou, et al. In-context learning unlocked for diffusion models. Advances in Neural Information Processing Systems, 36:8542–8562, 2023.

[48] Zijie J. Wang, Evan Montoya, David Munechika, Haoyang Yang, Benjamin Hoover, and Duen Horng Chau. DiffusionDB: A large-scale prompt gallery dataset for text-to-image generative models. arXiv:2210.14896 [cs], 2022. URL https://arxiv.org/abs/2210.14896.

[49] Daniel Watson, Jonathan Ho, Mohammad Norouzi, and William Chan. Learning to efficiently sample from diffusion probabilistic models. arXiv preprint arXiv:2106.03802, 2021.

[50] Daniel Watson, William Chan, Jonathan Ho, and Mohammad Norouzi. Learning fast samplers for diffusion models by differentiating through sample quality. In International Conference on Learning Representations, 2022.

[51] Chenfei Wu, Jiahao Li, Jingren Zhou, Junyang Lin, Kaiyuan Gao, Kun Yan, Sheng ming Yin, Shuai Bai, Xiao Xu, Yilei Chen, Yuxiang Chen, Zecheng Tang, Zekai Zhang, Zhengyi Wang, An Yang, Bowen Yu, Chen Cheng, Dayiheng Liu, Deqing Li, Hang Zhang, Hao Meng, Hu Wei, Jingyuan Ni, Kai Chen, Kuan Cao, Liang Peng, Lin Qu, Minggang Wu, Peng Wang, Shuting Yu, Tingkun Wen, Wensen Feng, Xiaoxiao Xu, Yi Wang, Yichang Zhang, Yongqiang Zhu, Yujia Wu, Yuxuan Cai, and Zenan Liu. Qwen-Image technical report, 2025. URL https://arxiv.org/abs/2508.02324.

[52] Xiaoshi Wu, Yiming Hao, Keqiang Sun, Yixiong Chen, Feng Zhu, Rui Zhao, and Hongsheng Li. Human preference score v2: A solid benchmark for evaluating human preferences of text-to-image synthesis. arXiv preprint arXiv:2306.09341, 2023.

[53] Sirui Xie, Zhisheng Xiao, Diederik Kingma, Tingbo Hou, Ying Nian Wu, Kevin P Murphy, Tim Salimans, Ben Poole, and Ruiqi Gao. Em distillation for one-step diffusion models. Advances in Neural Information Processing Systems, 37:45073–45104, 2024.

[54] Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In Proceedings of the IEEE conference on computer vision and pattern recognition, pp. 586–595, 2018.

[55] Zhenyu Zhou, Defang Chen, Can Wang, Chun Chen, and Siwei Lyu. Simple and fast distillation of diffusion models. Advances in Neural Information Processing Systems, 37:40831–40860, 2024.

[56] Aihua Zhu, Rui Su, Qinglin Zhao, Li Feng, Meng Shen, and Shibo He. Hierarchical schedule optimization for fast and robust diffusion model sampling. Proceedings of the AAAI Conference on Artificial Intelligence, 40(16):13907–13915, Mar. 2026. doi: 10.1609/aaai.v40i16.38400.

## 附录 A：补充结果

本文在表 5 中给出 SDXL-Turbo 的详细结果。SDXL-Turbo 是为少步推理设计的蒸馏模型，其默认调度已被高度压缩，因此对调度优化而言是颇具挑战的设置。本文用 3 步 Euler Discrete 调度评估 OYS，并与 1 步、3 步下使用 Euler Discrete 与 Euler Ancestral 采样器的默认调度比较。OYS 取得最高平均 HPS（0.298），一致优于所有默认基线，胜率在 78.55%–83.94% 之间。值得注意的是，3 步 OYS 甚至大幅超过同一步数的默认调度，说明即使对专为少步生成训练的模型，调度优化仍能带来有意义的增益。

**表 5：SDXL-Turbo 结果。** COCO Captions 验证集上的平均 HPS，以及 OYS（3 步，ED）相对各默认基线的 HPS 胜率。ED 与 EA 分别表示 Euler Discrete 与 Euler Ancestral。

| 方法 | 采样器 | 步数 | HPS 平均值 ↑ | OYS 相对该行的 HPS 胜率 ↑ |
|---|---|---|---|---|
| Default | EA/ED | 1 | 0.277 | 83.94% |
| Default | ED | 3 | 0.287 | 83.35% |
| Default | EA | 3 | 0.287 | 78.55% |
| OYS | ED | 3 | 0.298 | – |

Hoogeboom et al.（2025）指出，MSCOCO 上的零样本 FID 已知并不必然对应实际感知性能。尽管如此，本文仍报告文本到图像、图像修复与 Prompt Diffusion 任务的 FID。文本到图像与图像修复在 COCO Captions 验证集上评估（见表 6 与表 7），Prompt Diffusion 在 Wang et al.（2023）数据集的测试集上评估（见表 8）。

在 5 步时，OYS 在 DeepFloyd 与 SDXL 上都显著改善 FID，优于默认调度与 AYS 调度。在 SDv1.5 上，三个 5 步调度的 FID 彼此相差在 0.7 以内，尽管 OYS 在表 1 中赢得 HPS 比较，其 FID 仍略落后于基线——这与上文所述 COCO FID 与感知质量之间只有松散关联相符。

**表 6：文本到图像 FID。** DeepFloyd、SDXL 与 SDv1.5 在不同调度与步数下于 COCO Captions 验证集上的 FID。

| 模型 | 方法 | 步数 | FID ↓ |
|---|---|---|---|
| DeepFloyd | Default | 50 | 27.732 |
| DeepFloyd | Default | 10 | 25.834 |
| DeepFloyd | AYS | 10 | 25.496 |
| DeepFloyd | Default | 5 | 34.912 |
| DeepFloyd | AYS | 5 | 27.613 |
| DeepFloyd | OYS | 5 | 25.681 |
| Stable Diffusion XL | Default | 50 | 25.182 |
| Stable Diffusion XL | Default | 10 | 26.130 |
| Stable Diffusion XL | AYS | 10 | 24.584 |
| Stable Diffusion XL | Default | 5 | 31.264 |
| Stable Diffusion XL | AYS | 5 | 36.757 |
| Stable Diffusion XL | OYS | 5 | 27.088 |
| Stable Diffusion v1.5 | Default | 50 | 26.051 |
| Stable Diffusion v1.5 | Default | 10 | 24.316 |
| Stable Diffusion v1.5 | AYS | 10 | 24.057 |
| Stable Diffusion v1.5 | Default | 5 | 24.362 |
| Stable Diffusion v1.5 | AYS | 5 | 24.182 |
| Stable Diffusion v1.5 | OYS | 5 | 24.865 |

**表 7：图像修复 FID。** SDXL 与 SDv1.5 在 5 步调度下于 COCO Captions 验证集上的 FID。

| 模型 | 方法 | FID ↓ |
|---|---|---|
| SDXL | Default | 31.80 |
| SDXL | OYS | 6.85 |
| SDv1.5 | Default | 64.83 |
| SDv1.5 | OYS | 3.98 |

**表 8：Prompt Diffusion FID。** 三个逆图像任务在 5 步调度下于 Wang et al.（2023）数据集测试集上的 FID。

| 任务 | 方法 | FID ↓ |
|---|---|---|
| 逆 HED | Default | 40.93 |
| 逆 HED | OYS | 9.05 |
| 逆深度 | Default | 34.50 |
| 逆深度 | OYS | 12.89 |
| 逆分割 | Default | 32.42 |
| 逆分割 | OYS | 13.57 |

## 附录 B：用户研究

图 9 给出用于评估不同采样调度下图像质量与提示对齐的用户研究模板。为确保无偏评估，本文对每对图像采用两阶段评估流程。

在研究方法中，参与者先在不考虑提示的情况下评估图像质量（问题 1）。只有在完成质量评估之后，才向其展示提示以评估文本—图像对齐（问题 2）。这种顺序安排确保提示内容不会影响质量判断。

对每次评估，向参与者展示由不同采样调度（Default、AYS、OYS）生成的一对对图像。图像被随机打乱并匿名化，参与者无从知道每张图由哪种采样技术生成。

正文给出的用户研究结果表明：在图像质量与提示对齐两方面，参与者都明显更偏好由本文 OYS 方法生成的图像，而非 Default 与 AYS 采样调度的结果。

## 附录 C：EDM2 采样配置

本文在表 9 中给出 OYS 发现的参数并与默认参数比较。最清晰的趋势在 $\sigma_{\max}$：对除 EDM2-S 外的每个模型，OYS 都把它压到 20（本文搜索范围的下限）；EDM2-S 则停在略高于下限的 22.1。所有取值都远低于默认的 80。最优解在上界处饱和，说明偏好的 $\sigma_{\max}$ 可能更低，即默认值大幅高估了采样需要起始的噪声水平。$\sigma_{\min}$ 呈现互补趋势：每个模型都在其 $[0.0001,0.01]$ 搜索范围的边界处饱和——EDM2-XS 取到下限，其余模型取到上限 0.01，是默认值 0.002 的五倍。合起来，这些结果表明 OYS 在两端都收窄了采样噪声范围。引导按模型规模分化：OYS 对较小模型（EDM2-XS 至 EDM2-M）把引导提高到默认值以上，但对较大模型（EDM2-L 至 EDM2-XXL）把引导压到 1.0（同样是搜索范围边缘），实际上完全关闭引导。其余参数跨模型没有一致趋势，不过我们注意到 $\rho$ 对 EDM2-L 也饱和于其上限 10。

**表 9：EDM2 采样配置。** 各 EDM2 模型规模下默认配置与 OYS 优化配置的比较。

| 模型 | 方法 | $\sigma_{\min}$ | $\sigma_{\max}$ | $\rho$ | EMA 长度 | 引导 |
|---|---|---|---|---|---|---|
| EDM2-XS | Default | 0.002 | 80.0 | 7.0 | 0.045 | 1.40 |
| EDM2-XS | OYS | 0.0001 | 20.0 | 4.976 | 0.025 | 1.758 |
| EDM2-S | Default | 0.002 | 80.0 | 7.0 | 0.025 | 1.40 |
| EDM2-S | OYS | 0.010 | 22.132 | 9.767 | 0.028 | 1.659 |
| EDM2-M | Default | 0.002 | 80.0 | 7.0 | 0.030 | 1.20 |
| EDM2-M | OYS | 0.010 | 20.0 | 3.466 | 0.020 | 1.505 |
| EDM2-L | Default | 0.002 | 80.0 | 7.0 | 0.015 | 1.20 |
| EDM2-L | OYS | 0.010 | 20.0 | 10.000 | 0.099 | 1.000 |
| EDM2-XL | Default | 0.002 | 80.0 | 7.0 | 0.020 | 1.20 |
| EDM2-XL | OYS | 0.010 | 20.0 | 4.098 | 0.099 | 1.000 |
| EDM2-XXL | Default | 0.002 | 80.0 | 7.0 | 0.015 | 1.20 |
| EDM2-XXL | OYS | 0.010 | 20.0 | 4.901 | 0.077 | 1.000 |

## 附录 D：记号

本文全文所用记号汇总于表 10。

**表 10：记号。** 全文记号汇总。

| 记号 | 定义 |
|---|---|
| **问题设置** | |
| $\mathbf X$ | 用于调优的任务输入集合（例如文本提示） |
| $m$ | 固定、预训练扩散模型的采样函数 |
| $e$ | 黑盒评估指标 |
| $\mathbf p$ | 采样配置，$\mathbf p=\{p_1,\ldots,p_M\}$；即 OYS 优化的参数 |
| $p_k$ | $\mathbf p$ 的第 $k$ 个元素；对调度参数有 $p_k\in[0,1]$ |
| $M$ | $\mathbf p$ 中参数个数 |
| $\mathcal P$ | 采样配置的搜索空间 |
| $\mathbf p^{\ast}$ | 最优采样配置 |
| **采样调度** | |
| $K$ | 采样调度的步数 |
| $\mathbf s$ | 把配置 $\mathbf p$ 映射到采样调度的函数 |
| $t_{\max}$ | 扩散模型的最大时间步 |
| $t_k$ | 采样调度的第 $k$ 个时间步 |
| $q$ | 离散时间模型中取整到最近合法整数时间步 |
| $\sigma_{\min},\sigma_{\max},\rho$ | EDM 参数化调度的参数 |
| **贝叶斯优化** | |
| $f$ | 目标函数，$f(\mathbf p)=e(m(\mathbf X;\mathbf p))$ |
| $N$ | 已观测评估次数 |
| $\mathbf p^{(j)}$ | 第 $j$ 个观测到的采样配置 |
| $y^{(j)}$ | 配置 $\mathbf p^{(j)}$ 上观测到的指标值 |
| $\mathcal D$ | 观测到的配置—性能对，$(\mathbf p^{(j)},y^{(j)})_{j=1}^{N}$ |
| **人类偏好分数** | |
| $T$ | 文本提示 |
| $I$ | 生成图像 |
| $E_T$ | CLIP 文本编码器 |
| $E_I$ | CLIP 图像编码器 |
| $\omega$ | 人类偏好分数的学习缩放参数 |
| $\mathrm{HPS}(T,I)$ | 图像 $I$ 在提示 $T$ 下的人类偏好分数 |
| $P(I_1\succ I_2\mid T)$ | 给定提示 $T$ 时图像 $I_1$ 优于 $I_2$ 的预测偏好胜率 |

## 图注与表注

**图 1：Default、AYS（Sabour et al., 2024）与本文方法（OYS）在使用 5 步采样调度时的定性比较。** 所有提示均为留出测试样本，在两种方法的调度优化过程中均未出现。

**图 2：本文 Optimize Your Sampling（OYS）框架的贝叶斯优化流程概览。** 流程从采集最大化（左上）开始，识别有前景的采样配置；所选配置经黑盒指标评估（右），即用扩散模型生成图像并用 FID、HPS 等指标打分；结果更新代理模型的后续分布（左下），改进对配置空间的理解；该循环重复直至收敛或预算耗尽，从而高效发现有效的采样参数。

**图 3：文本到图像用户研究。** SDXL 上衡量图像保真度与图像对齐度的百分比胜率。显著性用对胜／负计数（剔除平局）的双侧精确二项检验评估，所有差异均高度显著（$p<0.001$）。OYS 在质量（相对 AYS 胜率 68.8%、相对 Default 70.6%；平局均分）与对齐（相对 AYS 62.9%、相对 Default 66.8%）两方面都显著优于 AYS 与默认采样。

**图 4：SDv1.5 与 SDXL 的图像修复结果（相对默认调度与 OYS 调度）。** OYS 重建结果对非掩蔽区域保持忠实，而 5 步默认调度会明显破坏整幅图像。

**图 5：log-SNR 空间中的 5 步文本到图像采样调度。** AYS 紧密追踪默认调度近似均匀的 log-SNR 间隔，而 OYS 一致地把更多步放在低 log-SNR（即高噪声水平）处。

**图 6：三个扩散模型上文本到图像调度调优的优化效率。** 图中给出人类偏好分数改善与优化期间生成图像数的关系。所有模型都能以相对少量样本获得显著 HPS 增益，通常在仅 5 万–10 万次生成后趋于平台，凸显 OYS 相对 AYS 等方法（后者可能需要显著更多生成）的效率。

**图 7：ImageNet-512 性能。** 比较 EDM2 模型族的原始采样配置与 OYS 优化后的采样配置；图中给出 ImageNet-512 上 FID（越低越好）与模型复杂度的关系。本文 OYS 优化配置在 EDM2-XS 至 EDM2-XXL 的全部模型规模上一致优于 Karras et al.（2024）的原始采样配置。

**图 8：逆深度与逆 HED 的 Prompt Diffusion 结果（相对默认调度与 OYS 调度）。** 建议以彩色查看。

**图 9：用户研究模板。** 本文用户研究中用于评估图像对的说明与问题格式。

**表注：** 表 1—表 10 分别对应对题所述内容；其中表 1—表 4 为主文实验表（COCO Captions 文本到图像、DiffusionDB 文本到图像、图像修复、Prompt Diffusion），表 5—表 8 为附录 A 的补充结果（SDXL-Turbo、文本到图像 FID、图像修复 FID、Prompt Diffusion FID），表 9 为附录 C 的 EDM2 配置，表 10 为附录 D 的记号表。原文公式未编号。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2608.18040v1（cs.LG，2026-08-18）的全文中文译稿，按原文结构译出：摘要；第 1 节引言；第 2 节相关工作；第 3 节 OYS 框架（不同扩散表述的优化、直接调度优化与累积乘积重参数化、参数化调度、贝叶斯优化）；第 4 节实验（评估指标与 HPS/Bradley–Terry 胜率、文本到图像、图像修复、调度分析、Prompt Diffusion 三个逆任务、优化效率、EDM2 图像生成）；第 5 节结论；致谢；图 1—图 9 图注；表 1—表 4；56 条英文参考文献；附录 A—D（补充结果表 5—表 8、用户研究、EDM2 配置表 9、记号表 10）。原文公式未编号，译文以不带编号的 `$$` 显示式呈现，未自行添加编号。

**源文页码：** 第 1 页（题名、作者、摘要、第 1 节开头）→ 第 2 页（引言续、相关工作开头、图 1）→ 第 3 页（图 2、相关工作续）→ 第 4 页（相关工作续、第 3 节开头、直接调度优化）→ 第 5 页（参数化调度、贝叶斯优化、HPS 定义）→ 第 6 页（Sobol 采样、第 4 节、评估指标、文本到图像）→ 第 7 页（表 1—表 3、文本到图像续、图像修复）→ 第 8 页（图像修复与图 4、用户研究）→ 第 9 页（图 3、图 5、调度分析、表 4、优化效率）→ 第 10 页（图 6、图 7、EDM2、第 5 节）→ 第 11 页（图 8、结论续、致谢、参考文献开头）→ 第 11—14 页（参考文献 [1]—[56]）→ 第 15 页（附录 A、表 5）→ 第 15—16 页（表 6—表 8、附录 B、附录 C 开头）→ 第 16 页（附录 C）→ 第 17 页（表 9）→ 第 18 页（图 9 用户研究模板）→ 第 19 页（表 10 记号表）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 1—表 10 的全部数值、单位与符号已按 PDF 文本层与第 7、17 页渲染图交叉核对（表 1—表 3、表 9 逐格核对），未改变任何数值。
2. 图 1—图 9 均未上传图片，仅提供中文图注与正文关键数值（图 3 的胜／平／负计数与图 6、图 7 的曲线趋势按正文与图注记录，未做数字化估算）。
3. 原文公式（累积乘积重参数化、HPS、Bradley–Terry、贝叶斯优化目标等）均未编号；译文保留为无编号显示式，未添加原文本不存在的编号。
4. **原文疑点／说明：** ①原文第 4 节正文称 5 步 OYS 保留 50 步调度 89%–94% 的质量（摘要亦如此），与表 1 的 HPS 数值口径不同（表 1 为 HPS 绝对值），两者不矛盾，摘要的百分比按原文照录；②图 3 的计数与正文胜率（68.8%/70.6%、62.9%/66.8%）核对一致（平局均分口径），已在图注中标明"平局均分"；③原文参考文献为作者—年份制、未编号，译文按原文顺序加序号 [1]—[56] 便于站内引用；④式中的"$\mathbf s$"（调度映射）与"$\mathbf X$"（调优输入集）等记号按原文表 10 统一。
5. 原文作者含两位同等贡献者（标 \*），已按原文注明；页面目录日期 2026-09-28 为站点归档日期，页首"版本"采用 arXiv v1（2026-08-18）信息。
6. 版权：本文为 arXiv 预印本（cs.LG），本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}