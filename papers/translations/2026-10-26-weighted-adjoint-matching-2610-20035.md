---
layout: page
title: "加权伴随匹配：时变控制代价的流匹配微调｜中文全文译文"
permalink: /papers/translations/2026-10-26-weighted-adjoint-matching-2610-20035/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2610.20035)

# 加权伴随匹配：利用时变控制代价微调流匹配模型

**原题**：Weighted Adjoint Matching: Finetuning Flow Matching Models with Time-Dependent Control Cost  
**作者**：Eliot Beyler、Francis Bach  
**来源**：arXiv:2610.20035v1，2026 年 10 月 14 日。  
**翻译进度（2026-10-30 更新）**：正文 1–6 节、附录 A–E 的逐式补译（含命题 3–6、引理 7–9、命题 10 的证明要点与算法 1 的逐行公式）、图 1–11 的图注、表 1–3 全表，以及全部 47 条参考文献均已译出。仍为对照原文抽取文本的补译稿，逐句人工终校与公式排版复核尚未进行；**不得标为全文完成**。
**完整性与去重审计**：[2026-10-26 五篇译稿逐篇核查记录](/papers/qa/2026-10-26/)。已处理重复公式编号；表格与参考文献本轮已补入，逐段原文终校仍未完成。

## 摘要

本文提出加权伴随匹配（Weighted Adjoint Matching），一种利用可微奖励函数微调预训练扩散模型或流匹配模型的方法。该方法从伴随匹配（Adjoint Matching）出发推导而来；伴随匹配将微调重新表述为具有二次控制代价的随机最优控制问题。

基于这类模型通常先生成粗粒度特征、再生成精细细节的观察，本文为控制代价引入随时间变化的权重。在生成过程早期设置较高控制代价，可以保持粗粒度特征的平衡性与多样性，因为这些特征承载了大部分语义信息；而在生成末期降低控制代价，则允许模型通过细化细节来提高奖励。

本文证明，所提方法等价于在对生成轨迹施加时变 Kullback–Leibler（KL）正则化的条件下最大化奖励。高斯混合分布和 MNIST 数据集上的实验表明，与伴随匹配相比，所提方法在奖励和模式平衡性之间取得了更好的折中。

## 1. 引言

扩散模型 [7]、[10]、[11]、[14] 和流匹配模型 [20]、[17]、[21] 已成为从大量经验样本学习分布并从中采样的先进方法。它们通过近似一个去噪过程工作：该过程由常微分方程或随机微分方程建模，其漂移项通过得分匹配（score matching）学习 [5]。本文关注预训练流匹配模型的微调任务，并用 \(p_{\rm target}\) 表示该模型在 \(\mathbb R^d\) 上采样得到的分布。

**生成模型微调。** 假设给定一个可微奖励函数 \(r:\mathbb R^d\to\mathbb R\)。目标是使模型生成的样本 \(x\) 获得更大的奖励 \(r(x)\)。

一种朴素的微调目标是直接最大化 \(\max_p\mathbb E_p[r(X)]\)。但该目标可能使分布发散，或塌缩至奖励函数的一个最大值点 \(x^*\)，因此无法保留原始数据分布 \(p_{\rm target}\) 的结构。更合理的选择是在优化奖励的同时约束微调分布与原分布的距离，例如，对于 \(a>0\)，引入 KL 散度惩罚：

\[
\max_p\;
\mathbb E_p[r(X)]
-\frac{1}{a}D_{\rm KL}(p\Vert p_{\rm target}).\tag{1}
\]

可以证明，该目标等价于从倾斜分布（tilted distribution）\(p_a\) 中采样：

\[
p_a(x)\propto p_{\rm target}(x)e^{a r(x)}.\tag{2}
\]

**伴随匹配。** 在实践中，直接优化式（1）很困难，不同方法尝试利用生成过程本身的结构从 \(p_a\) 采样。生成模型可表示为如下随机过程：

\[
dX_t=b(X_t,t)dt+\gamma(t)dB_t,
\qquad X_0\sim\mathcal N(0,I),
\]

其中 \(b\) 是漂移函数，\(\gamma\) 是扩散系数，生成过程在终点的分布满足 \(p_1=\mathcal L(X_1)=p_{\rm target}\)。

Domingo-Enrich 等人 [35] 提议将微调转化为随机最优控制（stochastic optimal control，SOC）问题：

\[
\min_{u\in\mathcal U}
\mathbb E\left[
\int_0^1\frac12\|u(X_t^u,t)\|^2dt
-a r(X_1^u)
\right],\tag{3}
\]

约束条件为

\[
dX_t^u=
\left[b(X_t^u,t)+\gamma(t)u(X_t^u,t)\right]dt
+\gamma(t)dB_t,\qquad
X_0^u\sim\mathcal N(0,I).
\]

这一重新表述的理论基础是 Girsanov 定理，它建立了控制的平方范数与基础过程和受控过程之间 KL 散度的联系。通过学习最优控制 \(u^*\)，可以使受控过程的终点分布等于式（2）的倾斜分布。

**倾斜分布可能造成模式失衡。** 然而，从 \(p_a(x)\propto p_{\rm target}(x)e^{ar(x)}\) 采样并不一定正是人们希望得到的微调结果。倾斜操作会使概率质量在分布的不同区域之间转移，而不考虑这些区域在样本空间中相距多远。这可能使原本平衡的多个模式变得失衡。

作者使用一个由两个高斯分布构成的混合模型说明这一点。两个模式中心位于同一轴的对称位置，但方差不同。奖励函数鼓励样本靠近该轴。尽管两个模式具有相同的最优轴向中心位置，倾斜分布仍会偏向方差较小的模式，导致原始数据中不存在的比例失衡。

**从粗到细的生成过程。** 对于自然图像等数据，扩散模型和流匹配模型往往先生成轮廓等粗粒度特征，再生成纹理等细节。借助这一规律，可以在生成初期施加强惩罚以保留模式多样性，在生成后期施加较弱惩罚以调整细节并提高奖励。论文图 1 以数字类别和亮度为例说明：统一控制代价可能将生成轨迹提前推向平均亮度较高的数字类别，而时变权重可以抑制这种类别倾斜，使模型主要通过后期亮度细节调整实现奖励提升。

于是，所提出的加权目标为

\[
\min_{u\in\mathcal U}
\mathbb E\left[
\int_0^1\frac{w(t)}2
\|u(X_t^u,t)\|^2dt
-a r(X_1^u)
\right].
\]

权重 \(w(t)\) 可以根据生成的不同阶段调整控制强度。一般选择在早期较大、晚期较小的权重，以保护承载主要语义的粗粒度特征，并在后期通过调整精细结构提高奖励。

> **本轮补译范围**：相关工作、生成随机微分方程、路径 KL 定理（命题 3–6）、加权伴随匹配算法及其证明（引理 7–9、命题 10、算法 1 逐行公式）、高斯混合/MNIST 实验（含表 1–3 全表与图 1–11 图注）、讨论与全部 47 条参考文献。尚余逐句原文终校。

### 时变代价与模式保持动机

若只使用带恒定系数的 KL 正则化来鼓励高奖励样本，微调分布将倾斜为

\[
p_a(x)\propto p_{\mathrm{target}}(x)e^{ar(x)}.
\]

但这种倾斜会在原分布的不同模式之间重新分配概率质量，不区分这些模式在样本空间中相距多远。论文使用二维双高斯混合分布说明：两个模式的均值都落在同一条坐标轴上，但方差不同；奖励函数鼓励样本靠近该坐标轴，按直觉应当只调整样本在各模式内部的纵向位置。然而，倾斜后的混合权重也改变了，方差较小的模式获得更多概率质量。这种偏移与两个模式之间的水平距离无关。

作者利用生成过程“先形成粗特征、后形成细节”的时间规律，试图直接限制这种无谓的模式间概率质量转移。对自然图像，低频、较大尺度的特征通常先被确定，纹理及局部细节在后期形成。这种现象可从信号频域理解：自然图像的傅里叶谱幅度通常随频率升高而减小；高频细节在加噪过程中更容易被抹除，反向去噪时也往往在低频主体轮廓之后恢复。

更严格地说，某个特征在某个生成时间点已经“形成”，指的是从该时间状态继续演化的绝大多数轨迹在终点具有相同特征。相关模式分化（mode speciation）理论研究这一特征形成的临界时间窗口，并表明这些窗口与特征的空间尺度相关。本文希望在粗特征尚未稳定的早期严格限制模型偏离原过程，使其保持原始类别比例；等粗特征基本确定之后，再放松控制以提高奖励。

注意，这是一种**依赖生成时间与空间尺度对应关系的设计**：权重可以根据任务需要反过来选择，例如允许修改粗粒度特征、保留细节，或有针对性地限制某一频率尺度。高早期权重只是本文面向“细节奖励但希望保留类别平衡”任务的主要选择，而不是适用于所有奖励的必然最优形式。

## 2. 相关工作

已有奖励微调方法通常以提高 \(\mathbb E_p[r(X)]\) 为目标，并通过不同形式的正则化避免样本坍缩到少数高奖励模式。Xu 等人 [24] 提出 ImageReward 作为人类偏好打分模型，并使用 ReFL 对采样过程中的随机一个时间步反向传播奖励梯度；Clark 等人 [28] 进一步将梯度传播扩展至采样末端的若干步骤。另一类方法把扩散模型的去噪链看作马尔可夫决策过程，并利用强化学习进行优化；然而，不同时间步的 KL 正则化并不一定能保证终点分布恰好等于指数倾斜分布 \(p_a\)。

Domingo-Enrich 等人 [35] 证明，在适当噪声调度下，用具有二次控制成本的随机最优控制（SOC）问题表述微调，可以恢复式 (2) 的指数倾斜分布。后续研究探讨确定性采样、速度场修正或更一般的控制形式。还有研究依据奖励梯度质量或训练稳定性，对生成过程的不同时间步赋予不同权重。但本文的动机有所不同：**其目标并非只提高训练效率，而是在生成粗粒度结构时尽量维持原模型分布，在生成细节时允许更强的奖励驱动修正**。

Barceló 等人 [25] 和 Liu 等人 [45] 同样关注在生成早期施加强约束以改善多样性，但其方法主要依赖只使用标量奖励的强化学习型目标；相比之下，本研究利用可微奖励函数、伴随状态和随机控制理论来刻画微调后的路径分布。作者还说明，简单地不在早期时间步计算损失，并不意味着共享神经网络在早期的输出就一定与原模型一致；加权控制代价提供了更直接的约束。

### 相关方法比较

现有生成模型微调工作通常以增加期望奖励为目标，并辅以某种形式的正则化，以缓解模型只产生少量高奖励样本、丧失多样性的问题。Xu 等人 [24] 提出 ImageReward 和相应的 ReFL 微调方法，将奖励梯度反向传播通过随机选取的采样时刻；Clark 等人 [28] 进一步通过采样过程最后 $K$ 步传播梯度。另一类方法将扩散模型去噪链视为马尔可夫决策过程，以强化学习进行微调 [27]、[18]。不过，Uehara 等人 [33] 和 Domingo-Enrich 等人 [35] 指出，在去噪链每一步简单施加 KL 正则化，并不必然使最终分布等于所希望的倾斜分布。

为解决分布对应关系的问题，Uehara 等人 [33] 需要额外的辅助模型来改变初始分布；Domingo-Enrich 等人 [35] 则证明，在特定无记忆噪声日程下，具有二次控制代价的随机最优控制问题能够恢复目标倾斜分布。Potaptchik 等人 [47] 逐步倾斜基础模型的速度场，以匹配目标分布的速度场。Marion 等人 [37] 提供针对 Langevin 采样器和扩散模型等不同采样算法的统一微调框架。

有些研究同样对生成时间进行非均匀加权，但主要是为了效率或梯度质量，而不是明确保持多样性。比如仅对采样最后几个时间步反向传播奖励，或在 GRPO 类策略梯度中使用时变权重来稳定信用分配。Han 等人 [36] 在理论推导中允许逐时间步设置不同 KL 系数，但实验仅使用固定系数。

Barceló 等人 [25] 与 Liu 等人 [45] 同样注意到生成过程早期可能决定模式归属，并利用更强的早期正则化减轻模式坍缩；但它们使用的强化学习方法只把奖励当作标量，不直接刻画微调后完整的概率分布。Guo 等人 [41] 也基于伴随匹配改进模型微调，使用确定性采样并把微调限制在轨迹后期，不过这样会失去原随机模型中的分布刻画，而且“只对后几个时间步计算损失”并不意味着共享时间参数的神经网络在前几个时间步完全不改变其速度场。本文则通过直接增大 $w(t)$，在目标函数上限制早期受控生成过程相对于基础过程的偏离。

Domingo-Enrich 与 Han [40] 进一步将伴随匹配推广到具有控制依赖的漂移与扩散系数、凸运行代价的一类更一般随机最优控制问题。本文的加权目标可以在某些条件下纳入这一框架，但只在选取特定的稳定化权重 $\lambda(t)$ 时才能恢复这里的加权伴随匹配损失；相关对应关系在原文附录 D.4 说明。

## 3. 生成随机微分方程：特征逐步形成

**扩散模型的正向与反向过程。** 从目标样本 \(X\sim p_{\rm target}\) 出发，考虑正向加噪随机微分方程
\[
d\overrightarrow X_\tau
=-f(\tau)\overrightarrow X_\tau\,d\tau
+g(\tau)\,dB_\tau,\qquad
\overrightarrow X_0=X.\tag{4}
\]
其中 \(f,g\) 是时间的非负连续函数。线性 SDE 的解可表示为
\[
\overrightarrow X_\tau
=a(\tau)X+b(\tau)Z,\qquad Z\sim\mathcal N(0,I),
\]
\(Z\) 与 \(X\) 独立，系数
\[
a(\tau)=\exp\!\left(-\int_0^\tau f(u)\,du\right),\qquad
b(\tau)=a(\tau)
\sqrt{\int_0^\tau\frac{g(u)^2}{a(u)^2}\,du}.
\]
生成模型通常从较高噪声状态开始，通过反向时间演化恢复数据分布。选择不同的反向扩散系数 \(\gamma(t)\) 可以产生不同的采样过程：\(\gamma=0\) 时为确定性常微分方程；适当的随机系数则可在反向过程中保留正向过程的路径分布结构。

### 正向扩散与反向过程

从数据样本 $X\sim p_{\mathrm{target}}$ 出发，加噪的正向随机微分方程为

（式（4）已在本页列出，此处不再重复列式。）

其中 $f,g$ 为连续非负函数。该线性 SDE 的任意时刻都可表示为原样本与高斯噪声的线性组合，即

\[
\overrightarrow X_\tau
=a(\tau)X+b(\tau)Z,\qquad Z\sim\mathcal N(0,I),
\]

其中 a(\tau)=\exp[-\int_0^\tau f(u)\,du]$，b(\tau)=a(\tau)\sqrt{\int_0^\tau g(u)^2/a(u)^2\,du}$。因而正向加噪的边缘分布及其采样都容易处理。

生成过程从时间反转得到。取足够大的 $T$ 并定义反向边缘密度，反向过程可以写成

\[
\begin{aligned}
d\overleftarrow X_t
={}&\left[
\overleftarrow f(t)\overleftarrow X_t+
\frac{\gamma(t)^2+\overleftarrow g(t)^2}{2}
\nabla\log\overleftarrow p_t(\overleftarrow X_t)
\right]dt\\
&+\gamma(t)dW_t,\qquad
\overleftarrow X_0=\overrightarrow X_T.
\end{aligned}\tag{5}
\]

这类反向过程无论选择何种允许的 $\gamma(t)$，都可以保留正向过程相应时间反转的**边缘分布**。若选择 $\gamma(t)=0$，则得到确定性的常微分方程采样器；若选择 $\gamma(t)=\overleftarrow g(t)$，则不仅保留边缘分布，还保留过程轨迹的联合分布。论文特别关注后者。



**流匹配与无记忆噪声调度。** 设相互独立的两个样本为 \(\overline X_0\sim\mathcal N(0,I)\) 和 \(\overline X_1\sim p_{\rm target}\)，定义插值
\[
\overline X_t=\beta_t\overline X_0+
\alpha_t\overline X_1,\qquad t\in[0,1],
\]
其中 \(\alpha_0=\beta_1=0\)、\(\alpha_1=\beta_0=1\)，\(\alpha_t\) 非降而 \(\beta_t\) 非增。流匹配通过拟合速度场 \(\mathbf v(x,t)\)，构造
\[
dX_t=\mathbf v(X_t,t)\,dt,\qquad
X_0\sim\mathcal N(0,I).\tag{6}
\]
可将其转换为具有相同时间边缘分布的 SDE：
\[

dX_t=b^\gamma(X_t,t)\,dt+\gamma(t)dB_t,\quad
b^\gamma(x,t)=v(x,t)+\frac{\gamma(t)^2}{2}
\nabla\log p_t(x).
\tag{7}

\]
其中
\[
\mathbf b^\gamma(x,t)
=\mathbf v(x,t)+\frac{\gamma(t)^2}{2}
\nabla\log p_t(x).
\]
速度场和得分函数之间满足原文式 (8) 的关系。

### 流匹配与无记忆噪声

流匹配首先选取独立的高斯源变量 \overline X_0\sim\mathcal N(0,I)$ 和目标数据变量 \overline X_1\sim p_{\mathrm{target}}$，并构造

\[
\overline X_t=\beta_t\overline X_0+
\alpha_t\overline X_1,
\quad t\in[0,1],
\]

其中 $\alpha_0=\beta_1=0$、$\alpha_1=\beta_0=1$，$\alpha_t$ 单调不减，$\beta_t$ 单调不增。利用二次回归损失学习速度场 $v$ 后，确定性生成过程满足

（式（6）已在本页列出，此处不再重复列式。）

通过调整漂移并增加扩散项，还可构造与确定性流具有相同边缘分布的随机采样过程：

（式（7）已在本页列出，此处不再重复列式。）

流匹配速度场与得分函数之间有如下关系：

\[
v(x,t)=\frac{\dot\alpha_t}{\alpha_t}x+
\beta_t\left(
\frac{\dot\alpha_t}{\alpha_t}\beta_t-\dot\beta_t
\right)\nabla\log p_t(x).
\tag{8}
\]

因此，带随机扩散系数的流匹配过程本质上可以视作适当时间参数化的反向扩散过程。文献 [35] 的无记忆噪声日程为

（式（9）已在本页列出，此处不再重复列式。）

在这一选择下，反向 SDE 的联合分布具有特定的保真性质，生成轨迹两端 $X_0,X_1$ 也相互独立：初始变量来自高斯噪声，终点变量来自目标分布。作者利用该过程来讨论：在某个时间之后，一个模式或类别是否已经由轨迹状态基本确定。

**图 2（随机与确定性采样轨迹）**：图中使用红、蓝分量表示从当前状态出发最终落入上方/下方高斯模式的概率，用透明度表示当前边缘密度。随机无记忆采样在模式分化窗口之前仍具有显著不确定性，而在之后逐渐明确类别；确定性流匹配路径的终点归属则在初始样本时已经预先确定。理论工作把不同空间尺度特征形成的时间范围描述为临界窗口，且粗尺度特征的窗口一般早于细尺度特征。



作者特别考虑
\[
\gamma(t)=
\sqrt{\,2\beta_t\!
\left(\frac{\dot\alpha_t}{\alpha_t}\beta_t
-\dot\beta_t\right)}.\tag{9}
\]
该无记忆调度能使反向 SDE 不只是与正向扩散的各时刻边缘分布一致，还与正向过程的时间反转具有一致的路径分布。此时生成过程的初态和终态在指定构造下是独立的。

**特征生成时间与空间尺度。** 对自然图像，低频、大尺度结构往往先确定，高频纹理则后确定。这可以从加噪过程对不同尺度信号的影响理解：自然图像傅里叶幅度一般随频率增大而衰减，逐步加噪时较小幅度的高频信息更早被淹没。相应地，反向生成时较大尺度信息更早稳定。作者在图 2 比较随机与确定性轨迹的模式分化：在具有无记忆噪声调度的随机过程里，一个早期状态的最终模式仍不确定；而在确定性过程里，轨迹的最终归属由初始样本唯一决定。这为“早期保持模式平衡，后期修改细节”的时间权重提供依据。

## 4. 加权伴随匹配

### 方法背景

在原伴随匹配的随机控制目标中，引入正的时间权重 \(w:[0,1]\to\mathbb R_{+}^{*}\)：
\[
\min_{u\in\mathcal U}
\mathbb E\left[
\int_0^1\frac{w(t)}2
\|u(X_t^u,t)\|^2\,dt
-a\,r(X_1^u)
\right],\tag{10}
\]
满足
\[
dX_t^u=
\left[\mathbf b(X_t^u,t)+\gamma(t)u(X_t^u,t)\right]dt
+\gamma(t)dB_t,\qquad
X_0^u\sim p_0.\tag{11}
\]
其中 \(r\) 是奖励函数、\(a>0\) 是奖励倾斜参数。权重 \(w\) 假设具有有界变差，从而可表示为
\[
w(t)=w(0)+\int_0^t dw(s)
=w(1)-\int_t^1dw(s).\tag{12}
\]
这一假设允许可微权重，也允许分段常数等带跳变的权重形式。

### 4.1 路径 KL 正则化

用 \(p^u\) 表示控制 \(u\) 对生成路径诱导的分布，\(p^{\rm base}\) 表示不施加额外控制时的路径分布。定义条件前缀路径散度
\[
K_t(X_0)=
D_{\rm KL}\!\left(
p^u(X_{[0,t]}\mid X_0)
\,\Vert\,
p^{\rm base}(X_{[0,t]}\mid X_0)\right).\tag{13}
\]
**命题 1**：加权 SOC 问题等价于在固定初态的条件下最大化
\[

\begin{aligned}
\max_{u\in\mathcal U}\;
\mathbb E_{X_0\sim p_0}\Big[
&a\,\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}
[r(X_1^u)]\\
&-w(1)D_{\rm KL}
\big(p^u(X\mid X_0)\Vert p^{\rm base}(X\mid X_0)\big)\\
&+\int_0^1 K_t(X_0)\,dw(t)
\Big].
\end{aligned}\tag{14}

\]
其关键意义是：控制成本不仅约束终点分布，还约束**生成轨迹在不同时间区间上的偏离**。若 \(w\) 随时间下降，则 \(dw(t)\) 为负，前缀路径 KL 被额外惩罚，从而强制早期过程尽量接近原模型。

例如，对某个模式分化时间 \(t_s\)，可选
\[
w(t)=
\begin{cases}
1+w_0,&t<t_s,\\
1,&t>t_s,
\end{cases}\qquad w_0>0.
\]
则除完整路径 KL 惩罚外，对 \([0,t_s]\) 的前缀路径 KL 还会施加额外强度为 \(w_0\) 的惩罚。因此，早期轨迹更难离开预训练模型的行为区域，之后才主要通过细节修改实现奖励最大化。

#### 时变路径惩罚的补充推导

为了根据生成阶段调节控制代价，引入正的时间权重函数 \(w:[0,1]\to\mathbb R_+^*\)，令随机最优控制目标为

（式（10）已在本页列出，此处不再重复列式。）

其中状态过程满足

（式（11）已在本页列出，此处不再重复列式。）

为涵盖分段常数在内的时间权重，作者假设 \(w\) 为有界变差函数，满足

（式（12）已在本页列出，此处不再重复列式。）

用 \(p^u\) 和 \(p^{\rm base}\) 分别表示受控生成过程与基础生成过程的**整条轨迹概率分布**。定义给定初始条件 \(X_0\) 时，区间 \([0,t]\) 上的条件路径 KL 散度

（式（13）已在本页列出，此处不再重复列式。）

**命题 1。** 在权重满足式（12）的条件下，式（10）的加权随机最优控制目标等价于：

（式（14）已在本页列出，此处不再重复列式。）

这一结果表明，时间加权的二次控制代价可以重写为针对**生成过程所有前缀子路径**的 KL 正则化。当 \(w(t)\) 随时间下降时，\(dw(t)\) 为负，因而式（14）的积分项进一步惩罚受控过程在前期偏离基础过程的行为。

例如，选择某一模式分化时刻 \(t_s\)，令

\[
w(t)=
\begin{cases}
1+w_0,&t<t_s,\\
1,&t>t_s,
\end{cases}\qquad w_0>0.
\]

此时，除了整条生成轨迹的 KL 惩罚外，区间 \([0,t_s]\) 上的路径偏离还要额外承担系数为 \(w_0\) 的惩罚。其物理直观是：当数字类别等粗粒度特征尚未确定时，使控制尽量维持基础模型行为；在类别已经确定后，允许控制通过亮度或纹理等细节调整提高奖励。

### 4.2 算法与伴随状态

令 \(J(u,x,t)\) 为从状态 \(X_t=x\) 出发，沿控制 \(u\) 演化的未来运行成本和终端负奖励的条件期望。满足最优性条件的控制为
\[
u^\star(x,t)
=-\frac{\gamma(t)}{w(t)}
\nabla_xJ(u^\star,x,t).\tag{15}
\]
为了求出该梯度，引入从终点向前追溯的伴随状态 \(a(t,X^u,u)\)，它可由后向 ODE 计算。其终端条件为
\[
a(1,X^u,u)=-a\,\nabla r(X_1^u),
\]
后向演化同时包含原始漂移、控制项与瞬时代价的导数（原式 (16)）。控制最优性可表示为条件期望
\[
u^\star(x,t)=
-\frac{\gamma(t)}{w(t)}
\mathbb E[a(t,X^{u^\star},u^\star)\mid X_t=x].
\tag{17}
\]
作者证明，在最优控制处，一部分与控制反馈相关的伴随项在条件期望中相互抵消。因此可改用只依赖基础漂移梯度的**简化伴随状态**（lean adjoint）\(\widetilde a\)：

于是提出加权伴随匹配损失
\[
\mathcal L_{\rm WAM}(u)=
\mathbb E_{X\sim p^{\bar u}}\left[
\frac12\int_0^1
\left\|
u(X_t,t)+
\frac{\gamma(t)}{w(t)}\widetilde a(t,X)
\right\|^2dt\right],
\qquad \bar u=\operatorname{stopgrad}(u).
\tag{18}
\]

简化伴随状态遵循以下后向微分方程：
\[
\frac{d}{dt}\widetilde a(t,X)=
-\nabla_x\mathbf b(X_t,t)^T\widetilde a(t,X),
\qquad
\widetilde a(1,X)=-a\nabla r(X_1).\tag{19}
\]

stop-gradient（停止梯度）作用于生成轨迹分布所使用的控制分支，而拟合的控制网络仍参与损失微分。这一区分非常重要：作者并未宣称通常的自动微分优化过程必然使该损失单调下降，或一定收敛；其理论结果针对的是函数空间中所定义的临界点。

**命题 2**：以针对控制函数 \(u\) 的泛函导数定义临界点，\(\delta\mathcal L_{\rm WAM}/\delta u=0\) 的唯一解，是加权 SOC 问题的最优控制 \(u^\star\)。如果将控制限制在有限参数神经网络 \(u_\theta\) 中，则通常的条件 \(\nabla_\theta\mathcal L=0\) 比函数空间中的临界点条件弱，不能直接推出参数化模型已达到全局最优控制。

#### 简化伴随的补充公式

作者沿用伴随匹配的随机最优控制框架。最优控制与值函数的梯度满足

（式（15）已在本页列出，此处不再重复列式。）

其中 \(J\) 是给定 \(X_t=x\) 时，从当前时刻到终点的预期控制代价与负奖励之和。通过定义伴随状态 \(a\)，将终点奖励对中间状态的梯度沿生成轨迹反向传播，最优控制还能表示为条件伴随期望：

（式（17）已在本页列出，此处不再重复列式。）

在最优解处，伴随微分方程中一组与控制相关的导数项，其条件期望相互抵消。于是作者定义**简化伴随状态（lean adjoint）** \(\widetilde a\)，仅保留基础漂移的雅可比项：

（式（19）已在本页列出，此处不再重复列式。）

并令终点条件为 \(\widetilde a(1,X)=-a\nabla r(X_1)\)。相应的加权伴随匹配训练损失是

（式（18）已在本页列出，此处不再重复列式。）

其中 \(\bar u=\operatorname{stopgrad}(u)\)，表示在计算梯度时将采样过程中的控制值视作常数。因此，和原伴随匹配相比，新方法在损失的伴随目标中只增加了一个 \(1/w(t)\) 因子，并没有引入额外的伴随求解步骤。

需要注意，\(\operatorname{stopgrad}\) 损失的优化并不自动保证目标单调下降或收敛。作者证明的是函数空间中的一个更精确的结论：其泛函导数的唯一临界点是原加权随机最优控制问题的最优控制（命题 2）。当控制用有限维神经网络参数化后，参数梯度为零只是较弱的条件，因此不能仅据此断言任何网络架构都一定收敛到全局最优控制。

#### 网络参数化与稳定化

设预训练流匹配网络为 \(\mathbf v^{\rm base}\)，微调网络为 \(\mathbf v_\theta^{\rm finetune}\)。作者将控制写为
\[
u_\theta(x,t)=\frac{2}{\gamma(t)}
\bigl(\mathbf v_\theta^{\rm finetune}(x,t)
-\mathbf v^{\rm base}(x,t)\bigr).
\]
初始化时令微调网络等于基础网络，因此初始控制为零。将此参数化代入式 (18)，得到论文式 (20)。对于常用的 \(\alpha_t=t\)、\(\beta_t=1-t\)，噪声系数 \(\gamma(t)\) 或其倒数在端点附近出现数值奇异，使直接实现式 (20) 不稳定。

作者进一步在损失的时间积分里加入**正的稳定权重** \(\lambda(t)>0\)，得到
\[

\mathcal L^\lambda_{\mathrm{WAM}}(u)
=\mathbb E_{X\sim p^{\bar u}}
\left[\frac12\int_0^1\lambda(t)
\left\|u(X_t,t)+
\frac{\gamma(t)}{w(t)}\widetilde a(t,X)
\right\|^2dt\right].
\tag{21}

\]
该权重只改变不同时间步在训练中的数值贡献，不改变函数空间中的最优临界点。选取 \(\lambda(t)=2t(1-t)\) 可抵消式 (20) 在端点附近产生的不稳定因子，使数值实现更稳定。作者利用离散化的随机微分方程和伴随 ODE，在成批的生成轨迹上估计该损失并对网络参数执行梯度下降；具体步骤见附录 D.5 的算法 1。

#### 时间稳定化权重

把预训练的流匹配速度网络记为 v_\theta^{\mathrm{base}}$，微调速度网络记为 v_\theta^{\mathrm{finetune}}$，作者将控制参数化为

\[
u_\theta(x,t)=\frac{2}{\gamma(t)}
\big(v_\theta^{\mathrm{finetune}}(x,t)
-v^{\mathrm{base}}(x,t)\big).
\]

用预训练参数初始化微调网络，初始控制就是零。把它代入加权伴随匹配损失（式（18））可得到关于神经网络速度差和简化伴随变量的目标（原文式（20））。

然而，对常用插值时间表 $\alpha_t=t,\ \beta_t=1-t$，无记忆噪声系数为 $\gamma(t)=\sqrt{2(1-t)/t}$。当 $t\to0$ 或 $t\to1$ 时，$\gamma(t)$ 或其倒数会变得很大，直接使用式（20）会引起数值不稳定。

为此，论文在时间积分中再引入任意严格为正的**稳定化权重** $\lambda(t)>0$：

（式（21）已在本页列出，此处不再重复列式。）

这个额外权重不改变函数空间中最优控制对应的临界点，但可以改变训练中的不同时间步尺度。取 $\lambda(t)=2(1-t)t$ 可以抵消端点附近的发散因子，得到稳定的网络训练形式：

\[
\mathcal L^\lambda_{\mathrm{WAM}}(\theta)
=\mathbb E_{X\sim p^{\bar u_\theta}}
\left[
2\int_0^1
\left\|
t\big(v_\theta^{\mathrm{finetune}}(X_t,t)
-v^{\mathrm{base}}(X_t,t)\big)
+\frac{1-t}{w(t)}\widetilde a(t,X)
\right\|^2dt
\right].
\]

实际算法将受控生成 SDE（11）与伴随 ODE（19）按时间离散，并用一个由多条采样轨迹组成的批次近似期望。完整伪代码见原文附录 D.5 的算法 1。

需要区分两个权重：w(t)$ 属于问题本身，决定在哪些生成时段更严格地惩罚偏离基础模型；\lambda(t)$ 则是计算中的稳定化权重，用于避免参数化后端点处的数值发散。把二者混为一谈会误解算法的目标函数。

## 5. 实验

论文使用高斯混合分布与 MNIST 研究奖励提升和模式多样性之间的折中。加权控制问题在同时缩放 \((w,a)\mapsto(cw,ca)\) 时最优控制不变，因此奖励系数 \(a\) 需要与权重函数一起解释。作者统一归一化 \(w(1)=1\)，并把达到的**实际平均奖励**而非 \(a\) 作为比较横轴。

### 实验评价口径

实验旨在比较各微调算法的**奖励–模式平衡折中**。对控制代价权重和倾斜系数同时乘以同一个正数，最优控制不变，所以不能脱离 $w$ 讨论单独的 $a$ 数值。作者把各权重归一化为 $w(1)=1$。不同时间权重在同一 $a$ 下施加的正则化不同，因此实验以实际达到的平均奖励 $R=\mathbb E[r(X_1^{u_\theta})]$ 为横向比较的条件，而不是简单比较相同的倾斜系数。



### 5.1 高斯混合

基础模型拟合二维两模式高斯混合分布：
\[
p_{\rm target}(x)=\tfrac12
\mathcal N(x;-\mu,\sigma_1^2I)
+\tfrac12\mathcal N(x;\mu,\sigma_2^2I),
\]
其中 \(\mu=(2,0)\)、\(\sigma_1^2=0.25\)、\(\sigma_2^2=0.5\)，奖励为
\[
r(x)=-\tfrac12 x_2^2.
\]
因此奖励鼓励样本靠近第一坐标轴。由于两个模式的方差不同，即使两个模式的中心均处于目标轴上，标准指数倾斜仍会偏向原本在奖励上更有利的模式，导致概率质量重新分配。

比较传统伴随匹配 \(w(t)=1\) 与两类加权方案：指数权重 \(w_{\exp}(t)=e^{\alpha(1-t)}\)，以及早期取 \(10^5\)、后期取 1 的阶梯权重
\[
w_{\rm steps}(t)=
\begin{cases}
10^5,&t<t_s,\\
1,&t\ge t_s.
\end{cases}
\]
图 3 将平均奖励与正模式权重 \(\mathbb E[\mathbf1_{X_1>0}]\) 作图。传统伴随匹配较接近标准指数倾斜的理论曲线：奖励越高，模式越不平衡。采用较晚的权重切换时刻，则能够在提高奖励的同时保持模式之间的相对比例。相反，若 \(t_s\) 过早，例如 \(0.25\)，两个模式尚未充分分化，早期已经结束强约束，因此其行为仍接近普通伴随匹配。

#### 模式平衡与奖励分析

基础目标分布为

\[
p_{\mathrm{target}}(x)=
\frac12\mathcal N(x;-\boldsymbol\mu,\sigma_1^2I)
+\frac12\mathcal N(x;\boldsymbol\mu,\sigma_2^2I),
\]

其中 $\boldsymbol\mu=(2,0)$，$\sigma_1^2=0.25$、$\sigma_2^2=0.5$。奖励为 $r(x)=-\|x_2\|^2/2$，鼓励样本在保持模式归属的同时靠近横轴。作者先训练基础流匹配模型，再分别使用伴随匹配和加权伴随匹配微调，并改变倾斜系数 $a$。

所比较的时间权重包括指数形式

\[
w_{\mathrm{exponential}}(t)=e^{\alpha(1-t)},
\qquad\alpha>0,
\]

以及分段常数形式

\[
w_{\mathrm{steps}}(t)=
\begin{cases}
10^5,&t<t_s,\\
1,&t\ge t_s.
\end{cases}
\]

前者随时间平滑减弱早期控制代价；后者在 [0,t_s)$ 上施加非常强的惩罚，使微调轨迹在这一时段几乎等于基础模型轨迹。实验用正模式概率 \kappa^+=\mathbb E[\mathbf1_{\{X_{1,1}^{u_\theta}\ge0\}}]$ 表示类别平衡，并把它与平均奖励绘于图 3，同时给出依据倾斜分布解析结果得到的理论曲线。

**图 3（不同权重下的奖励–模式比例）**：标准伴随匹配基本沿理论倾斜分布曲线变化，高奖励伴随着模式权重越来越失衡；在特别高的奖励下，实际失衡甚至可能超过理论预测，作者认为这或与优化过程中的数值或训练误差有关。相对而言，两类加权伴随匹配都能实现更优的奖励–平衡折中。对于分段权重且 t_s\in\{0.5,0.65,0.8\}$，奖励能够提升而模式比例几乎不变；t_s=0.25$ 的效果却接近普通伴随匹配，因为在 0.25 时刻两个模式尚未充分分离，概率质量仍可能跨模式转移。

### 5.2 MNIST

作者在未使用标签进行条件训练的情况下拟合 MNIST 流匹配生成模型，随后把**平均亮度**作为微调奖励：
\[
r(x)=\frac1d\sum_{i=1}^{d}x_i,\qquad
d=28\times28=784,\quad x\in[0,1]^d.
\]
每个微调模型生成 50,000 个样本，并使用预训练分类器估计数字类别。以最少类样本数 \(n_{\min}\) 与最多类样本数 \(n_{\max}\) 的比值
\[
\mathrm{balance}=\frac{n_{\min}}{n_{\max}}
\]
评价模式均衡性。比值越接近 1，意味着十个数字类别的样本数量越平衡。原始 MNIST 数据集的该比值约为 0.80。

图 4 显示，在相近的奖励水平下，采用时间加权控制代价通常能够得到更高的最少类/最多类数量比。原文表 2 给出非常直观的对照：传统伴随匹配在平均亮度奖励约 0.176 时，生成样本中数字 0 占 18.0%，数字 1 仅占 3.4%；阶梯加权匹配在 \(t_s=0.45\) 时，获得约 0.180 的奖励，同时数字 0 占 10.5%、数字 1 占 9.1%。这表明奖励提高并不必然以严重类别失衡为代价。

#### MNIST 亮度与类别平衡

作者在 MNIST 上训练不使用数字类别标签的流匹配模型，再用平均像素亮度作为奖励。对 28\times28$ 灰度图像 x\in[0,1]^{784}$，奖励定义为

\[
r(x)=\frac1{784}\sum_{i=1}^{784}x_i.
\]

微调后每种模型生成 50000 张图像，再用预训练分类器预测各数字类别。记样本数最多和最少的类别分别含 $n_{\max}$ 和 $n_{\min}$ 张，使用比值 $n_{\min}/n_{\max}$ 衡量类别平衡性。基础模型的这一比值接近 MNIST 原始训练集（约 0.80），而不是假设每个数字恰好占 10%。

**图 4（平均亮度奖励与最少/最多类别比例）**：加权伴随匹配的结果一般更靠近“亮度奖励较高且类别比例较均衡”的区域。具体而言，当普通伴随匹配达到约 0.176 的平均亮度奖励时，生成样本中数字 0 占 18.0%，数字 1 仅占 3.4%；而选用 $t_s=0.45$ 的加权伴随匹配在平均奖励提高至约 0.180 的同时，数字 0 和 1 的比例分别约为 10.5% 和 9.1%。相关更完整的类别分布列在原文附录表 1 与表 2。

## 6. 讨论

**Wasserstein 正则化的替代方案。** 也可以把分布 KL 正则化改成二阶 Wasserstein 距离 \(W_2^2(p,p_{\rm target})/a\)，以限制样本与初始位置间的移动距离。相应优化具有通过奖励 proximal 映射移动单个样本的解释，因此一般不容易在距离很远的模式之间转移概率质量。但是，单纯沿奖励梯度移动样本可能使样本离开原始数据流形。以 MNIST 平均亮度为例，直接向全白方向更新会使黑色背景变灰，而不是只让数字笔画变亮。

**奖励定义本身的不足。** 平均亮度是容易解释的数学指标，却无法区分“让笔画变亮”和“让背景变灰”两种不同机制；对不同数字类别而言，亮度数值也不一定对应相同的语义偏好。KL 正则化有助于把微调分布限制在数据流形附近，但并不为流形上相距较远的模式提供距离概念。本文的时变控制成本正是利用生成时间和空间尺度的联系，在保持数据流形约束的同时，减少不必要的跨模式概率迁移。

**未来方向。** 本文主要研究无条件生成模型和可以精确度量类别平衡的相对简单数据集。作者提出，下一步可以拓展到条件流匹配、比 MNIST 更大规模的图像数据集，以及其他实际应用的数据类型。

### 结果限定说明

作者分别在二维高斯混合分布与 MNIST 数据集上考察不同时间加权方式。高斯混合实验使两个模式的中心处于同一轴、方差不同，使用偏好样本接近该轴的奖励，考察微调是否会不必要地改变两个模式的相对概率。MNIST 实验则以数字类别为粗粒度特征、像素亮度等属性为细节，研究奖励提高时的类别分布变化。

论文报告，在实验设置下，对生成早期施加较大惩罚、在后期放宽控制，能够比均匀时间惩罚的伴随匹配方法更好地兼顾奖励与模式平衡。这并不表示任意奖励函数或任意权重都可以保证多样性：其机制依赖目标数据中粗粒度与细粒度特征的生成时间分离，并且生成后期仍有足够自由度可以优化奖励。

**本轮已补入**：实验设置与数值结果的逐段说明、全部图表注释、第 6 节完整讨论、全部 47 条参考文献，以及附录 A–E 的逐式推导与证明要点（式 (4)、(5)、(7)、(8)、(15)、(22)–(28)、(30)–(36)，表 1–3 全表）。

### Wasserstein 正则化及展望

**Wasserstein 正则化。** 另一条可能的研究路线是完全不用式（1）的 KL 正则化，而改用 $W_2^2(p,p_{\mathrm{target}})/a$ 惩罚。这会直接限制样本相对于初始位置在数据空间中的移动距离，因此自然限制相距很远的模式之间的概率质量转移。相应的优化问题有显式构造：先从目标数据分布采样，再对每个样本执行一次奖励的近端优化。这样可以大致维持模式权重，但也可能使样本沿着离开数据流形的方向移动。例如，对 MNIST 的平均亮度奖励，其梯度基本相当于一张常数白色图像，直接提升亮度会把原本黑色的背景涂灰，而不仅是使数字笔画更明亮。

**什么是好的奖励？** MNIST 平均亮度等简单奖励很容易定义、解释，却存在两个缺陷：一是可以通过离开数据流形的方向增加奖励，例如让黑色背景变灰；二是对差异很大的样本，其奖励的相对大小未必具有所希望的意义，例如一张很暗的数字 8 可能仍比很亮的数字 1 具有更大的平均亮度。作者认为，仅仅重新设计奖励函数未必能轻易解决问题，因为奖励本质上依赖具体语境，其数值必须结合基础数据分布解释。KL 正则化能够缓解第一个问题，使优化更多停留在数据流形附近，却不能解决第二个问题：在分布支持集内部，它不区分相距较近和较远的模式。本文通过生成时间和空间尺度之间的关系，试图缓解第二个问题。

**后续工作。** 当前研究主要采用无条件生成模型和便于精确评估模式比例的简单数据集。未来可将方法扩展到大规模图像数据集上的条件流匹配模型，以及其他实际应用中的数据类型。作者没有在正文实验中验证这些更大规模任务，因此现有结论不应被扩大为“在任意条件生成场景下均能保持多样性”的保证。

## 致谢及原文说明

作者感谢 Marylou Gabrié、Benjamin Dupuis、Tyler Farghly 和 Adam Perbost 的讨论，并感谢 Inria Paris 的 CLEPS 计算基础设施。本研究获得法国政府由国家研究署管理的 France 2030 计划支持，项目编号为 ANR-23-IACL-0008。

论文披露在研究过程中使用生成式 AI 工具帮助检查公式和证明、提出纠正建议，以及辅助编写、审查实验代码。核心算法实现由作者编写，然后使用 AI 协助审查和改进；在其他实验代码、模型、训练脚本、图表生成和整理方面，AI 参与更多。AI 工具也被用于论文语法检查、表述改写、标题与关键词构思、根据要点起草部分文字、将部分内容调整到附录、文献检索和背景数学问题的查询。图 1 是作者手绘示意图经 Claude Design 制作的说明性插图。作者声明所有 AI 辅助内容均已由其审查，并由作者对最终论文的论断、文字及相关成果负责。

**本轮补入与仍余事项**：附录 B–D 的中间随机微分与条件期望等式（式 (4)、(5)、(7)、(8)、(15)、(22)–(28)、(30)–(36)）、算法 1 的逐行公式说明、附录 E 的全部实验参数与表 1–3 全表、图 1–11 图注、全部 47 条参考文献均已补入。仍需做的是逐句人工对照原文终校与公式排版复核（含图 1–4 图注在抽取文本中被正文交错、措辞存在不确定处，已在相应位置加注）。故本页保持“未完成、未通过全文 QA”状态。

## 参考文献

以下按原文编号逐条转录英文原条目（共 47 条，源文 pp. 9–11）。

[1] Wendell Fleming and Raymond Rishel. Deterministic and Stochastic Optimal Control. Springer New York, 1975.

[2] U. G. Haussmann and E. Pardoux. "Time Reversal of Diffusions". In: The Annals of Probability 14.4 (Oct. 1986).

[3] Hannes Risken. The Fokker-Planck Equation: Methods of Solution and Applications. Second. 18. Springer, 1996.

[4] Yann LeCun. "The MNIST Database of Handwritten Digits". In: http://yann.lecun.com/exdb/mnist/ (1998).

[5] Pascal Vincent. "A Connection between Score Matching and Denoising Autoencoders". In: Neural Computation 23.7 (July 2011), pp. 1661–1674.

[6] Vladimir Bogachev, Nicolai Krylov, Michael Röckner, and Stanislav Shaposhnikov. Fokker–Planck–Kolmogorov Equations. Vol. 207. Mathematical Surveys and Monographs. American Mathematical Society, Dec. 2015.

[7] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. "Deep Unsupervised Learning Using Nonequilibrium Thermodynamics". In: International Conference on Machine Learning. June 2015.

[8] Jean-François Le Gall. Brownian Motion, Martingales, and Stochastic Calculus. Vol. 274. Graduate Texts in Mathematics. Springer International Publishing, 2016.

[9] Jose Blanchet and Karthyek R. A. Murthy. "Quantifying Distributional Model Risk via Optimal Transport". In: Mathematics of Operations Research 44.2 (2019).

[10] Yang Song and Stefano Ermon. "Generative Modeling by Estimating Gradients of the Data Distribution". In: Advances in Neural Information Processing Systems. 2019.

[11] Jonathan Ho, Ajay Jain, and Pieter Abbeel. "Denoising Diffusion Probabilistic Models". In: Advances in Neural Information Processing Systems. 2020.

[12] Aman Sinha, Hongseok Namkoong, Riccardo Volpi, and John Duchi. Certifying Some Distributional Robustness with Principled Adversarial Training. arXiv:1710.10571. May 2020.

[13] Jiaming Song, Chenlin Meng, and Stefano Ermon. "Denoising Diffusion Implicit Models". In: International Conference on Learning Representations. 2021.

[14] Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. "Score-Based Generative Modeling through Stochastic Differential Equations". In: International Conference on Learning Representations. 2021.

[15] Tero Karras, Timo Aila, Miika Aittala, and Samuli Laine. "Elucidating the Design Space of Diffusion-Based Generative Models". In: Advances in Neural Information Processing Systems. 2022.

[16] Patrick Kidger. "On Neural Differential Equations". PhD thesis. University of Oxford, 2022.

[17] Michael S Albergo and Eric Vanden-Eijnden. "Building Normalizing Flows With Stochastic Interpolants". In: International Conference on Learning Representations. 2023.

[18] Ying Fan, Olivia Watkins, Yuqing Du, Hao Liu, Moonkyung Ryu, Craig Boutilier, Pieter Abbeel, Mohammad Ghavamzadeh, Kangwook Lee, and Kimin Lee. "DPOK: Reinforcement Learning for Fine-Tuning Text-to-Image Diffusion Models". In: Advances in Neural Information Processing Systems. 2023.

[19] Rui Gao and Anton J. Kleywegt. "Distributionally Robust Stochastic Optimization with Wasserstein Distance". In: Mathematics of Operations Research 48.2 (2023).

[20] Yaron Lipman, Ricky T Q Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. "Flow Matching for Generative Modeling". In: International Conference on Learning Representations. 2023.

[21] Xingchao Liu, Chengyue Gong, and Qiang Liu. "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow". In: International Conference on Learning Representations. 2023.

[22] Gabriel Raya and Luca Ambrogioni. "Spontaneous Symmetry Breaking in Generative Diffusion Models". In: Advances in Neural Information Processing Systems. 2023.

[23] Severi Rissanen, Markus Heinonen, and Arno Solin. "Generative Modelling With Inverse Heat Dissipation". In: International Conference on Learning Representations. 2023.

[24] Jiazheng Xu, Xiao Liu, Yuchen Wu, Yuxuan Tong, Qinkai Li, Ming Ding, Jie Tang, and Yuxiao Dong. "ImageReward: Learning and Evaluating Human Preferences for Text-to-Image Generation". In: Thirty-Seventh Conference on Neural Information Processing Systems. Nov. 2023.

[25] Roberto Barceló, Cristóbal Alcázar, and Felipe Tobar. Avoiding Mode Collapse in Diffusion Models Fine-Tuned with Reinforcement Learning. arXiv:2410.08315. Oct. 2024.

[26] Giulio Biroli, Tony Bonnaire, Valentin De Bortoli, and Marc Mézard. "Dynamical Regimes of Diffusion Models". In: Nature Communications 15.1 (2024), p. 9957.

[27] Kevin Black, Michael Janner, Yilun Du, Ilya Kostrikov, and Sergey Levine. "Training Diffusion Models with Reinforcement Learning". In: International Conference on Learning Representations. 2024.

[28] Kevin Clark, Paul Vicol, Kevin Swersky, and David J. Fleet. "Directly Fine-Tuning Diffusion Models on Differentiable Rewards". In: International Conference on Learning Representations. 2024.

[29] Sander Dieleman. Diffusion Is Spectral Autoregression. https://sander.ai/2024/09/02/spectral-autoregression.html. Sept. 2024.

[30] Carles Domingo-Enrich, Jiequn Han, Brandon Amos, Joan Bruna, and Ricky T Q Chen. "Stochastic Optimal Control Matching". In: Advances in Neural Information Processing Systems. 2024.

[31] Marvin Li and Sitan Chen. "Critical Windows: Non-Asymptotic Theory for Feature Emergence in Diffusion Models". In: International Conference on Machine Learning. 2024.

[32] Masatoshi Uehara, Yulai Zhao, Tommaso Biancalani, and Sergey Levine. Understanding Reinforcement Learning-Based Fine-Tuning of Diffusion Models: A Tutorial and Review. arXiv:2407.13734. July 2024.

[33] Masatoshi Uehara, Yulai Zhao, Kevin Black, Ehsan Hajiramezanali, Gabriele Scalia, Nathaniel Lee Diamant, Alex M. Tseng, Tommaso Biancalani, and Sergey Levine. Fine-Tuning of Continuous-Time Diffusion Models as Entropy-Regularized Control. arXiv:2402.15194. Feb. 2024.

[34] Binxu Wang and John J. Vastola. Diffusion Models Generate Images Like Painters: An Analytical Theory of Outline First, Details Later. arXiv:2303.02490. Mar. 2024.

[35] Carles Domingo-Enrich, Michal Drozdzal, Brian Karrer, and Ricky T. Q. Chen. "Adjoint Matching: Fine-Tuning Flow and Diffusion Generative Models with Memoryless Stochastic Optimal Control". In: International Conference on Learning Representations. 2025.

[36] Yinbin Han, Meisam Razaviyayn, and Renyuan Xu. "Stochastic Control for Fine-Tuning Diffusion Models: Optimality, Regularity, and Convergence". In: International Conference on Machine Learning. 2025.

[37] Pierre Marion, Anna Korba, Peter Bartlett, Mathieu Blondel, Valentin De Bortoli, Arnaud Doucet, Felipe Llinares-López, Courtney Paquette, and Quentin Berthet. "Implicit Diffusion: Efficient Optimization through Stochastic Sampling". In: International Conference on Artificial Intelligence and Statistics. 2025.

[38] Antonio Sclocchi, Alessandro Favero, and Matthieu Wyart. "A Phase Transition in Diffusion Models Reveals the Hierarchical Nature of Data". In: Proceedings of the National Academy of Sciences 122.1 (2025).

[39] Beatrice Achilli, Marco Benedetti, Giulio Biroli, and Marc Mézard. "Theory of Speciation Transitions in Diffusion Models with General Class Structure". In: Journal of Statistical Mechanics: Theory and Experiment 2026.4 (2026).

[40] Carles Domingo-Enrich and Jiequn Han. "Adjoint Matching through the Lens of the Stochastic Maximum Principle in Optimal Control". In: Transactions on Machine Learning Research (2026).

[41] Zhengyi Guo, Jiayuan Sheng, David D. Yao, and Wenpin Tang. Improved Techniques for Fine-Tuning Flow Models via Adjoint Matching: A Deterministic Control Pipeline. arXiv:2605.06583. May 2026.

[42] Xiaoxuan He, Siming Fu, Yuke Zhao, Wanli Li, Jian Yang, Dacheng Yin, Fengyun Rao, and Bo Zhang. "TempFlow-GRPO: When Timing Matters for GRPO in Flow Models". In: International Conference on Learning Representations. 2026.

[43] Rishi Leburu, Levon Nurbekyan, and Lars Ruthotto. Differentiating through Stochastic Differential Equations: A Primer. arXiv:2601.08594. Jan. 2026.

[44] Jeongjae Lee and Jong Chul Ye. "PCPO: Proportionate Credit Policy Optimization for Preference Alignment of Image Generation Models". In: International Conference on Learning Representations. 2026.

[45] Henglin Liu, Huijuan Huang, Jing Wang, Chang Liu, Xiu Li, and Xiangyang Ji. "DiverseGRPO: Mitigating Mode Collapse in Image Generation via Diversity-Aware GRPO". In: Conference on Computer Vision and Pattern Recognition (CVPR). 2026.

[46] Ankur Moitra, Andrej Risteski, and Dhruv Rohatgi. The Tractability Landscape of Diffusion Alignment: Regularization, Rewards, and Computational Primitives. arXiv:2605.11361. May 2026.

[47] Peter Potaptchik, Cheuk-Kit Lee, and Michael S. Albergo. "Tilt Matching for Scalable Sampling and Fine-Tuning". In: International Conference on Machine Learning. 2026.

## 附录（部分译稿，尚未逐段校核）

### A. KL 正则化高斯混合

考虑二维高斯混合
\[
p_{\rm target}(x)=
\kappa_0^1\mathcal N(x;\mu_1,\sigma_1^2I)
+\kappa_0^2\mathcal N(x;\mu_2,\sigma_2^2I),
\]
其中 \(\mu_1=(-m,0)\)、\(\mu_2=(m,s)\)、\(\kappa_0^1+\kappa_0^2=1\)，奖励仍为 \(r(x)=-x_2^2/2\)。指数倾斜
\[
p_a(x)=Z_a^{-1}p_{\rm target}(x)e^{ar(x)},\qquad
Z_a=\mathbb E_{p_{\rm target}}[e^{ar(X)}]
\]
仍是两个 Gaussian 分布的混合。其协方差沿第一个方向保持不变，而第二个方向缩减：
\[
\Sigma_{i,a}=
\operatorname{diag}\left(
\sigma_i^2,\frac{\sigma_i^2}{1+a\sigma_i^2}\right).
\]
第二个模式的均值在垂直方向移动至
\[
\mu_{2,a}=\left(m,\frac{s}{1+a\sigma_2^2}\right).
\]
两个模式的混合权重之比为
\[
\frac{\kappa_a^1}{\kappa_a^2}
=
\frac{\kappa_0^1}{\kappa_0^2}
\sqrt{\frac{1+a\sigma_2^2}
{1+a\sigma_1^2}}\,
\exp\left(\frac{as^2}{2(1+a\sigma_2^2)}\right).
\]
特别是在 \(s=0,\sigma_2>\sigma_1\) 时，权重比严格大于原来的比值，说明标准 KL 正则化下的奖励倾斜会改变模式比例。附录还计算正负半平面的概率质量和奖励期望，其解析式用标准正态分布 CDF \(\Phi\) 表示。

#### A.1 倾斜分布的显式形式与模式权重（补录）

为完整起见，把两分量高斯的倾斜分布 \(p_a\) 逐步写开。对 \(i\in\{1,2\}\) 定义

$$
\Sigma_{i,a}=\begin{pmatrix}\sigma_i^2 & 0\\ 0 & \dfrac{\sigma_i^2}{1+a\sigma_i^2}\end{pmatrix},\qquad
\mu_{2,a}=\left(m,\ \frac{s}{1+a\sigma_2^2}\right),
$$

并以 \(\lVert x\rVert_A^2=x^\top Ax\) 记加权范数。由配方可得 \(p_a\) 仍是两个高斯的混合，其两个分量的权重为

$$
\kappa_a^1=\frac{\kappa_0^1}{Z_a}\frac{\det(\Sigma_{1,a})^{1/2}}{\sigma_1^2},\qquad
\kappa_a^2=\frac{\kappa_0^2}{Z_a}\frac{\det(\Sigma_{2,a})^{1/2}}{\sigma_2^2}\exp\left(-\frac{as^2}{2(1+a\sigma_2^2)}\right),
$$

其中 \(Z_a=\mathbb E_{p_{\rm target}}[e^{ar(X)}]\)。由此得到权重比与各权重本身：

$$
\kappa_a=\frac{\kappa_a^1}{\kappa_a^2}=\kappa_0\sqrt{\frac{1+a\sigma_2^2}{1+a\sigma_1^2}}\exp\left(\frac{as^2}{2(1+a\sigma_2^2)}\right),\qquad \kappa_0=\frac{\kappa_0^1}{\kappa_0^2},
$$

$$
\kappa_a^1=\frac{\kappa_a}{1+\kappa_a},\qquad \kappa_a^2=\frac{1}{1+\kappa_a}.
$$

特别地，\(a\to+\infty\) 时倾斜分布收敛为两个退化高斯分布的混合（即投影到由 \(x_2=0\) 定义的第一坐标轴），其权重比趋于

$$
\kappa_\infty=\lim_{a\to+\infty}\kappa_a=\kappa_0\frac{\sigma_2}{\sigma_1}\exp\left(\frac{s^2}{2\sigma_2^2}\right).
$$

附录还定义了 \(\kappa_a^-=\mathbb E_{p_a}[\mathbf 1_{x_1\le0}]\) 与 \(\kappa_a^+=\mathbb E_{p_a}[\mathbf 1_{x_1>0}]=1-\kappa_a^-\)：当两个模式分离良好时它们接近 \(\kappa_a^1,\kappa_a^2\)，但更容易从经验上估计：

$$
\kappa_a^-=\kappa_a^1\Phi\left(\frac{m}{\sigma_1}\right)+\kappa_a^2\Phi\left(\frac{-m}{\sigma_2}\right),\qquad
\kappa_a^+=\kappa_a^1\Phi\left(\frac{-m}{\sigma_1}\right)+\kappa_a^2\Phi\left(\frac{m}{\sigma_2}\right),
$$

其中 \(\Phi(x)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{x}e^{-t^2/2}\,\mathrm dt\) 为标准正态分布的累积分布函数。最后给出 \(p_a\) 所达到的最优奖励

$$
R_a=\mathbb E_{p_a}[r(X)]
=-\frac12\left(\kappa_a^1\frac{\sigma_1^2}{1+a\sigma_1^2}
+\kappa_a^2\left(\frac{\sigma_2^2}{1+a\sigma_2^2}+\left(\frac{s}{1+a\sigma_2^2}\right)^2\right)\right).
$$

### B. 正反向扩散推导

附录 B 从线性前向 SDE 式 (4) 出发，利用 Itô 公式对 \(Y_\tau=a(\tau)^{-1}\overrightarrow X_\tau\) 求微分，得到前述边缘分布的显式表示。随后通过 Fokker–Planck 方程刻画密度随时间的演化，并利用时间反演 \(t=T-\tau\) 得到带有得分 \(\nabla\log p_t\) 的反向 SDE。作者说明，反向过程可采用不同的噪声调度，确定性 \(\gamma=0\) 仅保留边缘分布；若取反向的原扩散系数，则可保留完整路径分布。

附录再把流匹配插值的系数 \(\alpha_t,\beta_t\) 代入扩散模型的正反向表达式，建立两者之间的对应关系，并说明式 (9) 的无记忆调度并非孤立构造，而是上述路径分布保持条件下的一个具体选择。

#### B.1 前向加噪过程与边缘分布的显式解（补录）

高斯噪声污染过程定义为

$$
\mathrm d\overrightarrow X_\tau=-f(\tau)\overrightarrow X_\tau\,\mathrm d\tau+g(\tau)\,\mathrm dB_\tau,\qquad \overrightarrow X_0=X,\tag{4}
$$

其中 \(f,g:\mathbb R\mapsto\mathbb R_+\) 为连续函数。为求式 (4) 的闭式解，记 \(Y_\tau=a(\tau)^{-1}\overrightarrow X_\tau\)，其中 \(a(\tau)=\exp\left(-\int_0^\tau f(u)\,\mathrm du\right)\)。由 Itô 公式，

$$
\mathrm dY_\tau=f(\tau)a(\tau)^{-1}\overrightarrow X_\tau\,\mathrm d\tau+a(\tau)^{-1}\mathrm d\overrightarrow X_\tau=\frac{g(\tau)}{a(\tau)}\,\mathrm dB_\tau,
$$

故 \(Y_\tau=a(0)^{-1}\overrightarrow X_0+\int_0^\tau\frac{g(u)}{a(u)}\,\mathrm dB_u=X+\int_0^\tau\frac{g(u)}{a(u)}\,\mathrm dB_u\)，从而

$$
\overrightarrow X_\tau=a(\tau)X+a(\tau)\int_0^\tau\frac{g(u)}{a(u)}\,\mathrm dB_u .
$$

特别地，对每个时刻 \(\tau\)，联合分布满足

$$
\mathcal L\left((\overrightarrow X_0,\overrightarrow X_\tau)\right)=\mathcal L\left((X,\ a(\tau)X+b(\tau)Z)\right),
$$

其中 \(Z\sim\mathcal N(0,\mathbf I)\) 与 \(X\) 独立，\(b(\tau)=a(\tau)\sqrt{\int_0^\tau\frac{g(u)^2}{a(u)^2}\,\mathrm du}\)。

#### B.2 Fokker–Planck 方程与反向过程（补录）

扩散模型取足够大的 \(T>0\)，使 \(\overrightarrow X_T\) 接近标准正态，然后构造一个与 \((\overrightarrow X_{T-t})_{t\in[0,T]}\) 具有相同边缘律的过程，把高斯映射到目标分布。\(\overrightarrow X_\tau\) 的边缘律由支配其密度 \(\overrightarrow p_\tau\) 演化的 Fokker–Planck 方程刻画（参见文献 [3]、[6]）：

$$
\partial_\tau\overrightarrow p_\tau=-\nabla\cdot\left(-f(\tau)x\,\overrightarrow p_\tau\right)+\frac12 g(\tau)^2\Delta\overrightarrow p_\tau .
$$

取时间反演 \(t=T-\tau\)、\(\overleftarrow p_t=\overrightarrow p_{T-t}\)、\(\overleftarrow f(t)=f(T-t)\)、\(\overleftarrow g(t)=g(T-t)\)，得

$$
\partial_t\overleftarrow p_t=-\nabla\cdot\left(\overleftarrow f(t)x\,\overleftarrow p_t\right)-\frac12\overleftarrow g(t)^2\Delta\overleftarrow p_t,
$$

但此时 Laplacian 前的系数为负，不能读作某个 SDE 的 Fokker–Planck 方程。技巧是引入 \(\gamma:\mathbb R\to\mathbb R_+\)，并利用 \(\Delta\overleftarrow p_t=\nabla\cdot(\overleftarrow p_t\nabla\log\overleftarrow p_t)\) 改写为

$$
\partial_t\overleftarrow p_t=-\nabla\cdot\left(\left(\overleftarrow f(t)x+\frac{\gamma(t)^2+\overleftarrow g(t)^2}{2}\nabla\log\overleftarrow p_t\right)\overleftarrow p_t\right)+\frac{\gamma(t)^2}{2}\Delta\overleftarrow p_t .
$$

Laplacian 前系数为正，故这是如下过程 \(\overleftarrow X_t\) 的 Fokker–Planck 方程：

$$
\mathrm d\overleftarrow X_t=\left(\overleftarrow f(t)\overleftarrow X_t+\frac{\gamma(t)^2+\overleftarrow g(t)^2}{2}\nabla\log\overleftarrow p_t(\overleftarrow X_t)\right)\mathrm dt+\gamma(t)\,\mathrm dW_t,\qquad \overleftarrow X_0=\overrightarrow X_T,\tag{5}
$$

其中 \(W_t\) 为布朗运动。因此该过程满足 \(\forall t\in[0,T]\)，\(\mathcal L(\overleftarrow X_t)=\mathcal L(\overrightarrow X_{T-t})\)。需注意，Fokker–Planck 方程只能保证边缘律相等；而 Haussmann 与 Pardoux（文献 [2]）证明，取 \(\gamma(t)^2=\overleftarrow g(t)^2\) 还能保持路径分布：\(\mathcal L((\overleftarrow X_t)_{t\in[0,T]})=\mathcal L((\overrightarrow X_{T-t})_{t\in[0,T]})\)。

#### B.3 流匹配与无记忆噪声日程的对应（补录）

Domingo-Enrich 等人（文献 [35]）通过在流匹配中加入扩散系数 \(\gamma:[0,1]\mapsto\mathbb R\) 推广了模型：

$$
\begin{cases}
\mathrm dX_t=b_\gamma(X_t,t)\,\mathrm dt+\gamma(t)\,\mathrm dB_t\\
X_0\sim\mathcal N(0,\mathbf I),\qquad b_\gamma(x,t)=v(x,t)+\frac{\gamma(t)^2}{2}\nabla\log p_t(x)
\end{cases}\tag{7}
$$

其速度场闭式解（见该文附录 B.4）为

$$
v(x,t)=\frac{\dot\alpha_t}{\alpha_t}x+\beta_t\left(\frac{\dot\alpha_t}{\alpha_t}\beta_t-\dot\beta_t\right)\nabla\log p_t(x),\tag{8}
$$

于是

$$
b_\gamma(x,t)=\frac{\dot\alpha_t}{\alpha_t}x+\left(\beta_t\left(\frac{\dot\alpha_t}{\alpha_t}\beta_t-\dot\beta_t\right)+\frac{\gamma(t)^2}{2}\right)\nabla\log p_t(x).
$$

把该式与式 (5) 对照可知，式 (7) 就是取特定 \(f(\tau)\)、\(g(\tau)\) 的反向 SDE。具体取

$$
f(\tau)=-\frac{\mathrm d}{\mathrm d\tau}\log\alpha_{1-\tau}=\frac{\dot\alpha_{1-\tau}}{\alpha_{1-\tau}},\qquad
g(\tau)=\alpha_{1-\tau}\sqrt{\frac{\mathrm d}{\mathrm d\tau}\left(\alpha_{1-\tau}^{-2}\beta_{1-\tau}^2\right)}=\sqrt{2\beta_{1-\tau}\left(\frac{\dot\alpha_{1-\tau}}{\alpha_{1-\tau}}\beta_{1-\tau}-\dot\beta_{1-\tau}\right)},
$$

则

$$
a(\tau)=\exp\left(-\int_0^\tau f(u)\,\mathrm du\right)=\exp\left(-\int_0^\tau-\frac{\mathrm d}{\mathrm du}\log\alpha_{1-u}\,\mathrm du\right)=\frac{\alpha_{1-\tau}}{\alpha_1}=\alpha_{1-\tau},
$$

$$
b(\tau)=a(\tau)\sqrt{\int_0^\tau\frac{g(u)^2}{a(u)^2}\,\mathrm du}
=\alpha_{1-\tau}\sqrt{\int_0^\tau\frac{\mathrm d}{\mathrm du}\left(\alpha_{1-u}^{-2}\beta_{1-u}^2\right)\mathrm du}
=\alpha_{1-\tau}\sqrt{\alpha_{1-\tau}^{-2}\beta_{1-\tau}^2-\alpha_1^{-2}\beta_1^2}=\beta_{1-\tau}.
$$

因此前向过程 \(\overrightarrow X_\tau\) 的边缘分布为 \(\mathcal L(a(\tau)X+b(\tau)Z)\)（\(Z\sim\mathcal N(0,\mathbf I)\) 与 \(X\) 独立），从数据端 \(\tau=0\)、\(a(0)=\alpha_1=1\)、\(b(0)=\beta_1=0\) 出发，到 \(T=1\) 时成为纯噪声：\(a(1)=\alpha_0=0\)、\(b(1)=\beta_0=1\)。把 \(\overleftarrow a(t)=a(1-t)=\alpha_t\)、\(\overleftarrow b(t)=b(1-t)=\beta_t\)、\(\overleftarrow f(t)=\frac{\dot\alpha_t}{\alpha_t}\)、\(\overleftarrow g(t)=\sqrt{2\beta_t\left(\frac{\dot\alpha_t}{\alpha_t}\beta_t-\dot\beta_t\right)}\) 代入式 (5)，恰好得到式 (7)。可见 Domingo-Enrich 等人的流匹配 SDE 不过是一个取特定时间日程的扩散模型。此外，无记忆噪声日程的选择

$$
\gamma(t)=\sqrt{2\beta_t\left(\frac{\dot\alpha_t}{\alpha_t}\beta_t-\dot\beta_t\right)}=\overleftarrow g(t)
$$

正是按 Haussmann 与 Pardoux（文献 [2]）同样能保持路径分布 \(\mathcal L((\overleftarrow X_t)_{t\in[0,T]})=\mathcal L((\overrightarrow X_{T-t})_{t\in[0,T]})\) 的那个 \(\gamma(t)\)。

### C. 路径 KL 目标

这里将主文的目标推广至任意终端时刻 \(T>0\)、运行代价 \(f(x,t)\) 和终端代价 \(g(x)\)：
\[
\min_u\mathbb E\left[
\int_0^T\left(
\frac{w(t)}2\|u(X_t^u,t)\|^2+
f(X_t^u,t)\right)dt+g(X_T^u)\right],
\tag{22}
\]
其 SDE 约束仍是含附加漂移 \(\gamma u\) 的受控随机过程。主文微调问题对应 \(T=1\)、\(f=0\)、\(g=-ar\)。

**命题 3** 由 Girsanov 定理给出：对于 \(0\le s\le t\le T\)，从给定初态 \(X_s\) 出发，受控与基础过程在 \([s,t]\) 上的条件路径 KL，等于受控过程在该时间区间内二次控制能量条件期望的一半：
\[
D_{\rm KL}\bigl(p^u(X_{[s,t]}\mid X_s)\Vert
p^{\rm base}(X_{[s,t]}\mid X_s)\bigr)
=
\mathbb E_{p^u}\left[
\frac12\int_s^t\|u(X_r^u,r)\|^2dr
\;\middle|\;X_s\right].\tag{24}
\]
**命题 4** 在一般时间范围上重新给出前缀路径 KL 正则化目标，并证明主文命题 1 是其特例。证明通过对 \(w\) 的有界变差分解、交换积分顺序以及使用命题 3 完成：
\[
\mathbb E\!\left[
\int_0^T\frac{w(t)}2\|u_t\|^2dt\middle|X_0\right]
=w(T)K_T(X_0)-\int_0^T K_t(X_0)\,dw(t).
\]
**命题 5** 提供对偶的后缀路径 \([t,T]\) KL 表述，权重出现在 \(-dw(t)\) 项中；如果 \(w\) 是非降函数，则对后期子路径施加额外正则化。**命题 6** 说明前缀与后缀两种形式完全等价：完整路径散度 \(K_T(X_0)\) 可拆分为 \([0,t]\) 上的散度和未来子路径散度的条件期望。利用随机过程的 Markov 性和条件概率链式分解便可证明这一关系。

#### C.1 一般形式的加权 SOC 问题（式 (22)–(23)）

附录 C 与附录 D 针对时间范围 \(T>0\) 上的加权 SOC 问题写出，其运行代价 \(f:\mathbb R^d\times[0,T]\to\mathbb R\) 与终端代价 \(g:\mathbb R^d\to\mathbb R\) 任意：

$$
\min_{u\in\mathcal U}\ \mathbb E\left[\int_0^T\left(\frac{w(t)}{2}\lVert u(X_t^u,t)\rVert^2+f(X_t^u,t)\right)\mathrm dt+g(X_T^u)\right]\tag{22}
$$

$$
\text{s.t.}\quad \mathrm dX_t^u=\left(b(X_t^u,t)+\gamma(t)u(X_t^u,t)\right)\mathrm dt+\gamma(t)\,\mathrm dB_t,\qquad X_0^u\sim p_0\tag{23}
$$

主文的微调问题 (10) 是其特例 \(T=1\)、\(f=0\)、\(g=-ar\)。

#### C.2 命题 3：Girsanov 定理的推论（式 (24)）

**命题 3。** 对每个 \(0\le s\le t\le T\) 与每个 \(u\in\mathcal U\)，

$$
\mathrm{KL}\left(p^u(X_{[s,t]}\mid X_s)\,\Vert\,p^{\mathrm{base}}(X_{[s,t]}\mid X_s)\right)
=\mathbb E_{p^u}\left[\frac12\int_s^t\lVert u(X_r^u,r)\rVert^2\,\mathrm dr\ \Big|\ X_s\right].
$$

**证明。** 取 \(s=0\)、\(t=T=1\) 时即为 Domingo-Enrich 等人（文献 [35]）的定理 2 与附录 C.4；一般情形把相同论证用于从 \(X_s\) 出发的过程 \((X_r^u)_{r\in[s,t]}\) 即可。特别地，主文式 (13) 定义的 \(K_t\) 满足

$$
K_t(X_0)=\mathbb E_{p^u}\left[\frac12\int_0^t\lVert u(X_s^u,s)\rVert^2\,\mathrm ds\ \Big|\ X_0\right].\tag{24}
$$

#### C.3 命题 4：\((0,t)\) 路径 KL 正则化（式 (25)）

**命题 4。** 设 \(w\) 满足式 (12)，则加权 SOC 问题 (22) 等价于

$$
\max_{u\in\mathcal U}\ \mathbb E_{X_0\sim p_0}\left[\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[\int_0^T-f(X_t^u,t)\,\mathrm dt-g(X_T^u)\right]-w(T)\,\mathrm{KL}\left(p^u(X\mid X_0)\,\Vert\,p^{\mathrm{base}}(X\mid X_0)\right)+\int_0^T K_t(X_0)\,\mathrm dw(t)\right].\tag{25}
$$

主文命题 1 是取 \(T=1\)、\(f=0\)、\(g=-ar\) 的特例。**证明。** 利用权重函数满足式 (12)、式 (24)，并交换积分次序：

$$
\mathbb E_{p^u}\left[\int_0^T\frac{w(t)}{2}\lVert u(X_t^u,t)\rVert^2\,\mathrm dt\ \Big|\ X_0\right]
=w(T)K_T(X_0)-\mathbb E\left[\int_{t=0}^{T}\int_{s=t}^{T}\frac12\lVert u(X_t^u,t)\rVert^2\,\mathrm dw(s)\,\mathrm dt\ \Big|\ X_0\right]
$$

$$
=w(T)K_T(X_0)-\int_{s=0}^{T}\mathbb E\left[\int_{t=0}^{s}\frac12\lVert u(X_t^u,t)\rVert^2\,\mathrm dt\ \Big|\ X_0\right]\mathrm dw(s)
=w(T)K_T(X_0)-\int_0^T K_s(X_0)\,\mathrm dw(s).
$$

把该等式代入式 (22) 即得式 (25)。\(\square\)

#### C.4 命题 5：\((t,T)\) 路径 KL 正则化（式 (26)–(27)）

考虑 \(t\) 与 \(T\) 之间的过程，命题 3 给出

$$
\widetilde K_t(X_t):=\mathrm{KL}\left(p^u(X_{[t,T]}\mid X_t)\,\Vert\,p^{\mathrm{base}}(X_{[t,T]}\mid X_t)\right)=\mathbb E_{p^u}\left[\frac12\int_t^T\lVert u(X_s^u,s)\rVert^2\,\mathrm ds\ \Big|\ X_t\right].\tag{26}
$$

**命题 5。** 在命题 4 的假设下，加权 SOC 问题 (22) 也等价于

$$
\max_{u\in\mathcal U}\ \mathbb E_{X_0\sim p_0}\left[\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[-\int_0^T f(X_t^u,t)\,\mathrm dt-g(X_T^u)-\int_0^T\widetilde K_t(X_t)\,\mathrm dw(t)\right]-w(0)\,\mathrm{KL}\left(p^u(X\mid X_0)\,\Vert\,p^{\mathrm{base}}(X\mid X_0)\right)\right].\tag{27}
$$

**证明。** 由式 (12) 与式 (26)，并利用 \(X_t^u\) 的 Markov 性，

$$
\mathbb E_{p^u}\left[\int_0^T\frac{w(t)}{2}\lVert u(X_t^u,t)\rVert^2\,\mathrm dt\ \Big|\ X_0\right]
=w(0)\widetilde K_0(X_0)+\mathbb E_{p^u}\left[\int_{t=0}^{T}\int_{s=0}^{t}\frac12\lVert u(X_t^u,t)\rVert^2\,\mathrm dw(s)\,\mathrm dt\ \Big|\ X_0\right]
$$

$$
=w(0)\widetilde K_0(X_0)+\int_{s=0}^{T}\mathbb E\left[\int_{t=s}^{T}\frac12\lVert u(X_t^u,t)\rVert^2\,\mathrm dt\ \Big|\ X_0\right]\mathrm dw(s)
=w(0)\widetilde K_0(X_0)+\mathbb E\left[\int_0^T\widetilde K_s(X_s^u)\,\mathrm dw(s)\ \Big|\ X_0\right].
$$

把该等式代入式 (22) 即得式 (27)。\(\square\)

与无权重 SOC 问题相比，\([t,T]\) 上路径间的 KL 散度以权重 \(-\mathrm dw(t)\) 进入目标：对非降的 \(w\)，该权重为负，因而增加正则化。

**例（分段常数权重）。** 取

$$
w(t)=\begin{cases}1,& t<\dfrac T2,\\[2pt] 2,& t>\dfrac T2,\end{cases}
$$

则得到等价目标

$$
\max_{u\in\mathcal U}\ \mathbb E_{X_0\sim p_0}\left[\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[\int_0^T-f(X_t^u,t)\,\mathrm dt-g(X_T^u)-\mathrm{KL}\left(p^u(X_{[T/2,T]}\mid X_{T/2}^u)\,\Vert\,p^{\mathrm{base}}(X_{[T/2,T]}\mid X_{T/2}^u)\right)\right]-\mathrm{KL}\left(p^u(X\mid X_0)\,\Vert\,p^{\mathrm{base}}(X\mid X_0)\right)\right].
$$

即 \((T/2,T)\) 上偏离基础分布的行为被惩罚两次。

#### C.5 命题 6：两种表述的等价性

**命题 6。** 对每个 \(t\in[0,T]\)，

$$
K_T(X_0)=\widetilde K_0(X_0),\qquad K_T(X_0)-K_t(X_0)=\mathbb E\left[\widetilde K_t(X_t^u)\ \Big|\ X_0\right],
$$

并且式 (25) 与式 (27) 的正则项相等：

$$
-w(T)K_T(X_0)+\int_0^T K_t(X_0)\,\mathrm dw(t)=-w(0)K_T(X_0)-\mathbb E\left[\int_0^T\widetilde K_t(X_t)\,\mathrm dw(t)\ \Big|\ X_0\right].
$$

**证明。** 第一个等式由式 (13) 中 \(K_T\) 与式 (26) 中 \(\widetilde K_0\) 的定义直接得到。对第二个等式，利用 \(X_t^u\) 的 Markov 性：

$$
K_T(X_0)-K_t(X_0)=\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[\log\frac{p^u(X_{[0,T]}\mid X_0)}{p^{\mathrm{base}}(X_{[0,T]}\mid X_0)}\right]-\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[\log\frac{p^u(X_{[0,t]}\mid X_0)}{p^{\mathrm{base}}(X_{[0,t]}\mid X_0)}\right]
$$

$$
=\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[\log\left(\frac{p^u(X_{[0,T]}\mid X_0)}{p^u(X_{[0,t]}\mid X_0)}\frac{p^{\mathrm{base}}(X_{[0,t]}\mid X_0)}{p^{\mathrm{base}}(X_{[0,T]}\mid X_0)}\right)\right]
=\mathbb E_{X^u\sim p^u(\cdot\mid X_0)}\left[\log\frac{p^u(X_{[t,T]}\mid X_t)}{p^{\mathrm{base}}(X_{[t,T]}\mid X_t)}\right]
$$

$$
=\mathbb E\left[\mathbb E\left[\log\frac{p^u(X_{[t,T]}\mid X_t)}{p^{\mathrm{base}}(X_{[t,T]}\mid X_t)}\ \Big|\ X_t\right]\ \Big|\ X_0\right]=\mathbb E\left[\widetilde K_t(X_t^u)\ \Big|\ X_0\right].
$$

于是

$$
-w(T)K_T(X_0)+\int_0^T K_t(X_0)\,\mathrm dw(t)
=-w(0)K_T(X_0)-(w(T)-w(0))K_T(X_0)+\int_0^T K_t(X_0)\,\mathrm dw(t)
$$

$$
=-w(0)K_T(X_0)+\int_0^T\left(K_t(X_0)-K_T(X_0)\right)\mathrm dw(t)
=-w(0)K_T(X_0)-\mathbb E\left[\int_0^T\widetilde K_t(X_t)\,\mathrm dw(t)\ \Big|\ X_0\right].\ \square
$$

### D. 加权伴随匹配理论

**D.1 最优控制刻画。** 从受控扩散的无穷小生成元出发，构造代价函数 \(J(u,x,t)\) 和价值函数 \(V(x,t)=\min_uJ(u,x,t)\)。在适当正则性条件下，Hamilton–Jacobi–Bellman（HJB）方程为
\[
(\partial_t+\mathcal L_t)V(x,t)
-\frac{1}{2w(t)}
\|\gamma(t)^T\nabla_x V(x,t)\|^2
+f(x,t)=0,
\quad V(x,T)=g(x).
\]
将该式中对控制 \(u\) 的二次函数完成平方，可以得到
\[
u^\star(x,t)=
-\frac{\gamma(t)^T}{w(t)}\nabla_xV(x,t).
\]
这就是主文式 (15) 的一般形式。文中进一步证明，若一个控制满足将价值梯度替换为自身未来成本梯度后的最优性关系，则它是原 SOC 目标的最优控制。

**D.2 伴随 ODE 与条件期望。** 作者给出未来成本对当前状态的导数，说明它可以通过后向伴随 ODE 计算。为了证明简化伴随状态的条件期望具有所需性质，使用了与未来条件期望有关的积分方程以及唯一性引理。证明中的关键步骤是：两个候选解之差可以被某个可积系数乘自身积分所控制，因此由 Grönwall 不等式推出二者一致。

**D.3 命题 2 的证明。** 首先在生成路径分布固定的情况下，按泛函导数定义计算加权匹配损失相对于控制函数的梯度。临界点条件要求
\[
u(x,t)=
-\frac{\gamma(t)^T}{w(t)}
\mathbb E[\widetilde a(t,X^u)\mid X_t^u=x].
\]
其次，对该等式关于状态求微分，证明控制相关的伴随项在条件期望中抵消，使简化伴随状态与完整伴随状态具有相同的条件均值。根据 D.2 的唯一性引理，该条件均值就是未来成本的状态梯度；再由 D.1 的最优性刻画，得到临界点控制必然最优。反向证明则从最优控制的 HJB 条件出发，验证它也满足简化伴随匹配的泛函梯度零条件。正权重 \(\lambda(t)\) 的加入只改变时间采样测度，不改变上述临界点集合。

**D.4 与一般化伴随匹配框架的关系。** Domingo-Enrich 与 Han [40] 将伴随匹配推广至控制同时影响漂移、扩散和一般凸运行代价的随机控制问题。把本文的运行代价设置为 \(f(x,t)+w(t)\|u\|^2/2\)，可在其框架下得到加权伴随匹配损失的一个特例，对应 \(\lambda(t)=w(t)\)。但本文还允许独立选择用于数值稳定的 \(\lambda(t)\)，从而额外调整不同时间步的梯度尺度。

**D.5 算法 1：利用加权伴随匹配微调流匹配模型。** 输入预训练速度场、插值调度 \(\alpha_t,\beta_t\)、奖励函数 \(r\)、控制代价权重 \(w(t)\)、损失权重 \(\lambda(t)\)、时间离散步数 \(K\)、每次微调的轨迹数 \(M\) 和总迭代次数。初始化微调网络为预训练网络，步长 \(h=1/K\)。每轮从标准 Gaussian 采样 \(M\) 个起点，并使用受控 SDE 的 Euler–Maruyama 离散化生成轨迹；从终点 \(-a\nabla r(X_1)\) 出发，利用基础漂移的状态 Jacobian 沿时间反向积分简化伴随 ODE；对轨迹和伴随状态停止梯度，再计算离散化的加权匹配平方损失，并对网络参数做一步梯度下降。原文还说明，为减少计算开销，实际可随机抽取部分时间步评估损失；对 \(\alpha_t=t,\beta_t=1-t\) 造成的 \(t=0\) 奇异项，首次更新采用正的时间步点代替零时刻。

#### D.0 最优控制刻画：生成元、价值函数与 HJB 方程（补录）

**无穷小生成元。** 与 \(\mathrm dX_t=b(X_t,t)\,\mathrm dt+\gamma(t)\,\mathrm dB_t\) 对应的无穷小生成元 \(\mathcal L_t\) 定义为

$$
\mathcal L_t f=\lim_{\Delta t\searrow0}\frac{\mathbb E\left[f(X_{t+\Delta t})\mid X_t=x\right]-f(x)}{\Delta t},
$$

对使该极限存在的函数 \(f\) 成立。设 \(f\in C^2\)，二阶 Taylor 展开给出（\(Z\sim\mathcal N(0,\mathbf I)\)）

$$
f(X_{t+\Delta t})\approx f(X_t)+\langle\nabla f(X_t),b(X_t,t)\rangle\Delta t+\frac12\operatorname{tr}\left(\gamma(t)^\top\nabla^2f(X_t)\gamma(t)ZZ^\top\right)\Delta t,
$$

于是 \(\mathcal L_tf=\langle\nabla f(x),b(x,t)\rangle+\frac12\operatorname{tr}\left(\gamma(t)\gamma(t)^\top\nabla^2f(x)\right)\)，也可写成 \(\mathcal L_t=\sum_i b_i(x,t)\partial_{x_i}+\frac12\sum_{i,j}(\gamma\gamma^\top)_{ij}\partial_{x_i}\partial_{x_j}\)。类似地，对控制 \(u\)，与 \(\mathrm dX_t^u=(b(X_t^u,t)+\gamma(t)u(X_t^u,t))\mathrm dt+\gamma(t)\mathrm dB_t\) 对应的生成元为 \(\mathcal L_t^u=\mathcal L_t+\sum_i(\gamma(t)u)_i(x,t)\partial_{x_i}\)。

**代价函数与价值函数。** 对控制 \(u\) 与 \(t\in[0,T]\)，代价函数定义为

$$
J(u,x,t)=\mathbb E_{X\sim p^u}\left[\int_t^T\left(\frac{w(s)}{2}\lVert u(X_s,s)\rVert^2+f(X_s,s)\right)\mathrm ds+g(X_T)\ \Big|\ X_t=x\right],
$$

价值函数为 \(V(x,t)=\min_uJ(u,x,t)\)。

**验证定理与 HJB 方程。** 验证定理（参见文献 [1] 第 VI 章定理 4.1）指出，\(V\) 由下式刻画（对所有 \((x,t)\in\mathbb R^d\times[0,T)\)）：

$$
\begin{cases}
\partial_tV(x,t)+\min_{u\in\mathbb R^d}\left[\mathcal L_t^uV(x,t)+\dfrac{w(t)}{2}\lVert u\rVert^2+f(x,t)\right]=0,\\
V(x,T)=g(x),
\end{cases}
$$

等价地

$$
\begin{cases}
(\partial_t+\mathcal L_t)V(x,t)+\min_{u\in\mathbb R^d}\left[\langle\gamma(t)u,\nabla_xV(x,t)\rangle+\dfrac{w(t)}{2}\lVert u\rVert^2\right]+f(x,t)=0,\\
V(x,T)=g(x).
\end{cases}
$$

对最优 \(u\) 求解即得 Hamilton–Jacobi–Bellman（HJB）方程

$$
\begin{cases}
(\partial_t+\mathcal L_t)V(x,t)-\dfrac{1}{2w(t)}\left\lVert(\gamma^\top\nabla V)(x,t)\right\rVert^2+f(x,t)=0,\\
V(x,T)=g(x),
\end{cases}
$$

最优控制为 \(u^\star(x,t)=-\frac{\gamma(t)^\top}{w(t)}\nabla V(x,t)\)。利用 \(V\) 的定义可写成

$$
u^\star(x,t)=-\frac{\gamma(t)^\top}{w(t)}\nabla_xJ(u^\star,x,t).\tag{15}
$$

#### D.1 引理 7：最优性关系刻画最优控制

**引理 7。** 若控制 \(u\) 满足

$$
u(x,t)=-\frac{\gamma(t)^\top}{w(t)}\nabla_xJ(u,x,t),
$$

则 \(u\) 是 (22) 的最优控制。

**证明。** 证明思路是：若 \(u\) 满足该关系，则 \(J^u:(x,t)\mapsto J(u,x,t)\) 解 HJB 方程。首先

$$
\mathcal L_t^uJ^u(x,t)=\lim_{\Delta t\to0}\frac{\mathbb E\left[J(u,X_{t+\Delta t}^u,t)\mid X_t^u=x\right]-J(u,x,t)}{\Delta t}
$$

$$
=\lim_{\Delta t\to0}\frac{\mathbb E\left[J(u,X_{t+\Delta t}^u,t+\Delta t)\mid X_t^u=x\right]-J(u,x,t)}{\Delta t}-\partial_tJ^u(x,t).
$$

又由动态规划

$$
J(u,x,t)=\mathbb E\left[\int_t^{t+\Delta t}\left(\frac{w(s)}{2}\lVert u(X_s,s)\rVert^2+f(X_s,s)\right)\mathrm ds+J(u,X_{t+\Delta t},t+\Delta t)\ \Big|\ X_t=x\right],
$$

故上式第一项极限为 \(-\frac{w(t)}{2}\lVert u(x,t)\rVert^2-f(x,t)\)，从而

$$
\mathcal L_tJ^u(x,t)=\mathcal L_t^uJ^u(x,t)-\langle\gamma(t)u(x,t),\nabla_xJ^u(x,t)\rangle=-\frac{w(t)}{2}\lVert u(x,t)\rVert^2-f(x,t)-\partial_tJ^u(x,t)-\langle\gamma(t)u(x,t),\nabla_xJ^u(x,t)\rangle.
$$

取 \(V=J^u\)，HJB 方程化为

$$
-\frac{w(t)}{2}\lVert u(x,t)\rVert^2-\langle\gamma(t)u(x,t),\nabla_xJ^u(x,t)\rangle-\frac{1}{2w(t)}\left\lVert(\gamma^\top\nabla J^u)(x,t)\right\rVert^2=0
\iff
\frac{w(t)}{2}\left\lVert u(x,t)+\frac{\gamma(t)^\top}{w(t)}\nabla J^u(x,t)\right\rVert^2=0,
$$

在所作假设下成立。按定义 \(J^u\) 满足边界条件 \(J^u(x,T)=g(x)\)。由验证定理得 \(J^u=V\)，于是 \(u^\star(x,t)=-\frac{\gamma(t)^\top}{w(t)}\nabla V(x,t)=u(x,t)\)。\(\square\)

#### D.2 伴随状态与引理 8

对某个控制 \(u\)，伴随状态定义为

$$
a(t,X^u,u)=\nabla_{X_t^u}\left(\int_t^T\left(\frac{w(s)}{2}\lVert u(X_s^u,s)\rVert^2+f(X_s^u,s)\right)\mathrm ds+g(X_T^u)\right),
$$

其中 \(X^u\) 是 \(\mathrm dX_t^u=(b(X_t^u,t)+\gamma(t)u(X_t^u,t))\mathrm dt+\gamma(t)\mathrm dB_t\) 的解。伴随状态是一个依赖随机轨迹 \(X^u\) 的随机变量，\(\nabla_{X_t^u}\) 表示在固定 \(t\) 之后布朗运动 \((B_s)_{s\ge t}\) 轨迹的前提下对过程在 \(t\) 时刻取值 \(X_t^u\) 求导（对 SDE 解求导的技术细节见文献 [16]、[43]）。取伴随状态的条件期望即得代价函数的梯度：\(\nabla J(u,x,t)=\mathbb E[a(t,X^u,u)\mid X_t=x]\)。为计算伴随，利用它满足一个 ODE：

**引理 8。** 伴随满足 ODE

$$
\begin{cases}
\dfrac{\mathrm d}{\mathrm dt}a(t,X^u,u)=-\left[\nabla_{X_t^u}\left(b(X_t^u,t)+\gamma(t)u(X_t^u,t)\right)^\top a(t,X^u,u)+\nabla_{X_t^u}\left(f(X_t^u,t)+\dfrac{w(t)}{2}\lVert u(X_t^u,t)\rVert^2\right)\right],\\[4pt]
a(T,X^u,u)=\nabla g(X_T^u).
\end{cases}\tag{28}
$$

为简化记号，后文记 \(b^u:(x,t)\mapsto b(x,t)+\gamma(t)u(x,t)\)、\(f^u:(x,t)\mapsto f(x,t)+\frac{w(t)}{2}\lVert u(x,t)\rVert^2\)。**证明。** 由定义展开

$$
a(t,X^u,u)=\nabla_{X_t^u}\left(\int_t^Tf^u(X_s^u,s)\mathrm ds+g(X_T^u)\right)=\int_t^T\left(\nabla_{X_t^u}X_s^u\right)^\top\nabla_xf^u(X_s^u,s)\,\mathrm ds+\left(\nabla_{X_t^u}X_T^u\right)^\top\nabla_xg(X_T^u).
$$

再对 \(t\) 求导（利用 \(\nabla_{X_t^u}X_s^u\) 满足的线性化方程与文献 [16]、[43] 的结论），即得式 (28)。\(\square\)

#### D.3 引理 9：伴随条件期望的唯一性

为证明简化伴随状态的条件期望具有所需性质，附录使用与未来条件期望有关的积分方程以及下述唯一性引理。

**引理 9。** 设 \(A:\mathbb R^d\times[0,T]\to\mathbb R^{d\times d}\)、\(c:\mathbb R^d\times[0,T]\to\mathbb R^d\) 可测。假设存在可测的 \(\kappa:(0,T]\to\mathbb R_+\)，使对所有 \((x,s)\in\mathbb R^d\times(0,T]\) 有算子范数界 \(\lVert A(x,s)\rVert\le\kappa(s)\)，且对每个 \(\varepsilon\in(0,T]\) 有 \(\int_\varepsilon^T\kappa(s)\,\mathrm ds<\infty\)。设 \(Y^1\)、\(Y^2\) 是形如 \(Y_t^i=y^i(X_t^u,t)\) 的两个过程（\(y^i\) 可测、\(\sup_{t\in[0,T]}\mathbb E\lVert Y_t^i\rVert<\infty\)），且都满足对一切 \(t\in[0,T]\)

$$
Y_t=\mathbb E\left[\nabla g(X_T^u)+\int_t^T\left(A(X_s^u,s)^\top Y_s+c(X_s^u,s)\right)\mathrm ds\ \Big|\ X_t^u\right],
$$

其中假设 \(\nabla g(X_T^u)\)、\(\int_0^T\lVert c(X_s^u,s)\rVert\mathrm ds\) 与 \(\int_0^T\lVert A(X_s^u,s)^\top Y_s^i\rVert\mathrm ds\) 可积。则 \(Y^1=Y^2\)。

**证明。** 令 \(D_t=Y_t^1-Y_t^2\)、\(\phi(t)=\mathbb E\lVert D_t\rVert\)。两式相减，终端项与源项抵消，得 \(D_t=\mathbb E\left[\int_t^TA(X_s^u,s)^\top D_s\,\mathrm ds\mid X_t^u\right]\)。由三角不等式与 \(A\) 的界，\(\lVert D_t\rVert\le\mathbb E\left[\int_t^T\kappa(s)\lVert D_s\rVert\,\mathrm ds\mid X_t^u\right]\)；取期望得 \(\phi(t)\le\int_t^T\kappa(s)\phi(s)\,\mathrm ds\)。固定 \(\varepsilon\in(0,T]\)，因 \(\kappa\) 在 \([\varepsilon,T]\) 上可积，Grönwall 引理给出 \(\phi=0\) 于 \([\varepsilon,T]\)；由 \(\varepsilon\) 任意，故几乎必然有 \(D_t=0\)（\(t\in(0,T]\)）。对 \(t=0\)，\(\mathbb E\lVert D_0\rVert\le\int_0^T\mathbb E\lVert A(X_s^u,s)^\top D_s\rVert\mathrm ds=0\)，故 \(D_0=0\) 几乎必然。\(\square\)

**关于 \(A\) 的假设在流匹配漂移下成立。** 在主文流匹配设定中 \(T=1\)，且

$$
\nabla_xb(x,t)=2\nabla_xv^{\mathrm{base}}(x,t)-\frac{\dot\alpha_t}{\alpha_t}\mathbf I,\qquad
\nabla_xb^{u_\theta}(x,t)=2\nabla_xv^{\mathrm{finetune}}_\theta(x,t)-\frac{\dot\alpha_t}{\alpha_t}\mathbf I .
$$

若 \(v^{\mathrm{base}}\) 与 \(v^{\mathrm{finetune}}_\theta\) 关于 \(x\) 一致 \(L\)-Lipschitz，则 \(\lVert\nabla_xb(x,t)\rVert\le2L+\frac{\dot\alpha_t}{\alpha_t}=:\kappa(t)\)，且 \(\int_\varepsilon^1\kappa(t)\,\mathrm dt=2L(1-\varepsilon)+\log\frac{1}{\alpha_\varepsilon}<\infty\) 对每个 \(\varepsilon\in(0,1]\) 成立，\(\nabla_xb^{u_\theta}\) 有同样界。对 \(\alpha_t=t\) 有 \(\kappa(t)=2L+1/t\)，这不构成问题：引理只要求在初始时刻之外可积，因为后向 Grönwall 论证从终端时刻 \(t=1\) 出发。对一般关于 \(x\) 满足 Lipschitz 的控制 \(u\)，\(\nabla_xb^u=\nabla_xb+\gamma(t)\nabla_xu\) 会多出 \(\gamma(t)L_u\) 项，它在 \([\varepsilon,1]\) 上有界。

#### D.4 命题 10（即主文命题 2 的精确表述）与证明要点

**命题 10。** 对由下式定义的损失

$$
\widehat L_{\mathrm{WAM}}(u,v):=\mathbb E_{X\sim p^v}\left[\frac12\int_0^T\left\lVert u(X_t,t)+\frac{\gamma(t)^\top\widetilde a(t,X)}{w(t)}\right\rVert^2\mathrm dt\right],\tag{31}
$$

其中 \(\frac{\mathrm d}{\mathrm dt}\widetilde a(t,X)=-\left(\nabla_xb(X_t,t)^\top\widetilde a(t,X)+\nabla_xf(X_t,t)\right)\)、\(\widetilde a(T,X)=\nabla_xg(X_T)\)，唯一的临界点 \(\frac{\delta}{\delta u}\widehat L_{\mathrm{WAM}}(u,v)|_{v=u}=0\) 就是加权 SOC 问题 (22) 的最优控制 \(u^\ast\)。

**证明要点（原文顺序）。** ① **泛函梯度定义。** 对 \(\mathbb R^d\times[0,T]\) 上的测度 \(M\)、泛函 \(F:L^2(\mathbb R^d\times[0,T],M;\mathbb R^d)\to\mathbb R\) 与 \(f\in L^2\)，把泛函梯度 \(\frac{\delta}{\delta f}F(f)\) 定义为满足下式的 \(g\in L^2\)：对一切 \(h\in L^2\)，\(\lim_{\varepsilon\to0}\frac{F(f+\varepsilon h)-F(f)}{\varepsilon}=\int\langle g(x,t),h(x,t)\rangle M(\mathrm dx,\mathrm dt)\)。② **临界点条件。** 对固定控制 \(v\)，取测度 \(M(\mathrm dx,\mathrm dt)=p(X_t^v=x)\mathrm dx\mathrm dt\)，把损失展开并把 \(\widetilde a(t,X)\) 用其条件期望替换，得

$$
\frac{\delta}{\delta u}\mathbb E_{X\sim p^v}[L_{\mathrm{WAM}}(u,X)](x,t)=u(x,t)+\frac{\gamma(t)^\top\mathbb E_{X\sim p^v}[\widetilde a(t,X)\mid X_t=x]}{w(t)},
$$

于是 \(u\) 是 \(u\mapsto\mathbb E_{X\sim p^{\bar u}}[L_{\mathrm{WAM}}(u,X)]\) 的临界点当且仅当

$$
\forall(x,t)\in\mathbb R^d\times[0,T],\quad u(x,t)=-\frac{\gamma(t)^\top}{w(t)}\mathbb E[\widetilde a(t,X^u)\mid X_t^u=x].\tag{32}
$$

③ **简化伴随方程。** 记 \(\widetilde Y_t=\mathbb E[\widetilde a(t,X^u)\mid X_t]\)，由 \(\widetilde a\) 的构造可得

$$
\widetilde Y_t=\mathbb E\left[\nabla g(X_T^u)+\int_t^T\left(\nabla_xb(X_s^u,s)^\top\widetilde Y_s+\nabla_xf(X_s^u,s)\right)\mathrm ds\ \Big|\ X_t\right],\tag{30}
$$

由引理 9，满足式 (30) 的过程唯一。④ **与完整伴随比较。** 对 \(u\) 满足式 (32) 的情形，完整伴随状态 \(a(t)\) 与简化伴随状态 \(\widetilde Y_t\) 的条件期望相等（关键步骤：对式 (32) 关于状态求微分，证明控制相关的伴随项在条件期望中抵消）；再由引理 9 的唯一性，该条件均值就是未来代价的状态梯度。⑤ **由最优性刻画收尾。** 由引理 7，临界点控制必然最优；反向则由最优控制的 HJB 条件出发，验证它也满足简化伴随匹配的泛函梯度零条件。加入正权重 \(\lambda(t)\) 只改变时间采样测度，不改变临界点集合。

#### D.6 算法 1 逐行说明（式 (34)–(36)）

**算法 1：利用加权伴随匹配微调流匹配模型。**

- **输入：** 流匹配模型 \(v^{\mathrm{base}}=v^{\mathrm{base}}_{\theta_0}\)、插值调度 \(\alpha_t,\beta_t\)、奖励函数 \(r\)、控制代价权重 \(w(t)\)、损失权重 \(\lambda(t)\)、离散化步数 \(K\)、每次微调的轨迹数 \(M\)、微调迭代数 \(N\)。
- **初始化：** 微调模型参数 \(\theta=\theta_0\)（即 \(v^{\mathrm{finetune}}_\theta=v^{\mathrm{base}}\)）；取 \(h=1/K\)，对 \(k\in\{0,1,\ldots,K\}\) 令 \(t_k=kh\)。
- **对 \(n\in\{0,\ldots,N-1\}\)：**

**（1）采样 \(M\) 条轨迹（式 (34)）。** 对 \(m\in\{0,\ldots,M-1\}\) 按受控 SDE 的 Euler–Maruyama 离散化生成轨迹 \(X^{(m)}=(X^{(m)}_{t_k})_{k\in\{0,\ldots,K\}}\)：

$$
X^{(m)}_{t_0}=X^{(m)}_0\sim\mathcal N(0,\mathbf I),\qquad
X^{(m)}_{t_{k+1}}=X^{(m)}_{t_k}+h\left(2v^{\mathrm{finetune}}_\theta(X^{(m)}_{t_k},t_k)-\frac{\dot\alpha_{t_k}}{\alpha_{t_k}}X^{(m)}_{t_k}\right)+\sqrt{h}\,\gamma(t_k)\,\mathcal N(0,\mathbf I).\tag{34}
$$

**（2）反向求解伴随 ODE（式 (35)）。** 从终端出发计算 \(\widetilde a^{(m)}=(\widetilde a^{(m)}_{t_k})_{k\in\{0,\ldots,K\}}\)：

$$
\widetilde a^{(m)}_{t_K}=\widetilde a^{(m)}_1=-a\nabla r(X^{(m)}_1),\qquad
\widetilde a^{(m)}_{t_{k-1}}=\widetilde a^{(m)}_{t_k}+h\,\nabla_{X^{(m)}_{t_k}}\left(2v^{\mathrm{base}}(X^{(m)}_{t_k},t_k)-\frac{\dot\alpha_{t_k}}{\alpha_{t_k}}X^{(m)}_{t_k}\right)^\top\widetilde a^{(m)}_{t_k}.\tag{35}
$$

**（3）停止梯度。** 取 \(X^{(m)}=\operatorname{stopgrad}(X^{(m)})\)、\(\widetilde a=\operatorname{stopgrad}(\widetilde a)\)。

**（4）计算加权伴随匹配目标（式 (36)）。**

$$
\widehat L_{\mathrm{WAM}}(\theta)=\frac{1}{2M(K+1)}\sum_{m,k}\lambda(t_k)\left\lVert\frac{2}{\gamma(t_k)}\left(v^{\mathrm{finetune}}_\theta(X^{(m)}_{t_k},t_k)-v^{\mathrm{base}}(X^{(m)}_{t_k},t_k)\right)+\frac{\gamma(t_k)}{w(t_k)}\widetilde a^{(m)}_{t_k}\right\rVert^2.\tag{36}
$$

**（5）更新参数。** 计算 \(\nabla_\theta\widehat L_{\mathrm{WAM}}(\theta)\)，用梯度下降更新 \(\theta\)。

- **输出：** 微调后的模型 \(v^{\mathrm{finetune}}_\theta\)。

原文补充：实现中还会在式 (36) 中随机抽取 \(K_0<K\) 个时间步以降低计算开销；对经典选择 \(\alpha_t=t\)、\(\beta_t=1-t\)，式 (34) 中的两项 \(\frac{\dot\alpha_{t_k}}{\alpha_{t_k}}=\frac{1}{t_k}\) 与 \(\gamma(t_k)=\sqrt{\frac{2(1-t_k)}{t_k}}\) 在 \(t_0=0\) 处奇异，故仅在第一步改用 \(t_1=h>0\) 处的取值。

### E. 补充实验

**E.1 计算资源与参数。** 作者在学术 Slurm 集群上执行实验，单任务采用一张 NVIDIA GPU，型号覆盖 RTX 2080 Ti、6000/8000、V100、A100、H100/H200，配 4–8 个 CPU 核、至多 12 GB 内存。包括先导实验、未在正文报告的实验和被中断任务在内，总计算投入约 480 GPU 小时。高斯混合实验的基础模型为约 4546 参数的多层感知机，采用 Adam，学习率 \(2\times10^{-4}\)，批次大小为 100，训练 100 个 epoch；微调使用 40 个离散时间步、每轮 1000 条轨迹、80 个 epoch 等设置。MNIST 的基础模型为约 900 万参数的 UNet，采用 Adam 在 MNIST 上训练 50 个 epoch；微调每次从基础模型初始化，执行 25 个 epoch，采样也使用 40 个离散时间步。分类使用一个预训练 ViT-B/16 分类器。

**E.2 高斯混合额外实验。** E.2.1 将加权函数改为线性变化 \(w_{\rm linear}(t)=w_0+(1-w_0)t\)，图 5 显示其奖励/均衡折中优于普通伴随匹配，但不如指数或分段常数权重。E.2.2 将一个模式从奖励所对应的坐标轴移开，比较相同方差的双 Gaussian 模式；其结论仍与主要实验一致。

E.2.3 考察四个模式：
\[
p_{\rm target}(x)=\frac14\sum_{i=1}^4
\mathcal N(x;\mu_i,\sigma^2I),
\quad \sigma^2=0.25,
\]
其中
\[
\mu_1=(4,-2),\quad\mu_2=(4,2),\quad
\mu_3=(-4,-2),\quad\mu_4=(-4,2),
\]
奖励 \(r(x)=x_1+x_2\)，鼓励样本向右上移动。图 7 表明，普通伴随匹配较快塌缩到右上模式，而加权匹配的结果随 \(t_s\) 变化：\(t_s=0.5\) 时仍可能模式坍缩，只是发生得更晚；\(t_s=0.6\) 时，主要发生上下相邻两个模式之间的坍缩，却能够保留左右两个模式群之间的平衡；\(t_s=0.7\) 或 0.8 时，左右和上下两层模式分化都得到保留，奖励提高主要来自每个模式内部的局部移动。该实验特别说明**不同空间尺度的特征可以在不同生成时间窗口稳定**，时间权重可以选择性保护其中一层或多层结构。

**E.3 MNIST 主实验的类别分布。** 原文表 1 在平均亮度约 0.16 时比较各方法的十类样本占比；表 2 在平均亮度约 0.18 时比较。对表 2，关键数值如下：

| 方法 | 奖励系数 \(a\) | 实际平均奖励 | 数字 0 占比 | 数字 1 占比 |
|---|---:|---:|---:|---:|
| 基础模型 | — | 0.140 | 10.2% | 9.9% |
| 普通伴随匹配 | 10 | 0.176 | 18.0% | 3.4% |
| 加权，\(t_s=0.25\) | 37 | 0.181 | 12.0% | 3.4% |
| 加权，\(t_s=0.30\) | 57 | 0.180 | 11.9% | 6.1% |
| 加权，\(t_s=0.35\) | 92 | 0.180 | 10.6% | 7.8% |
| 加权，\(t_s=0.40\) | 143 | 0.180 | 10.7% | 8.4% |
| 加权，\(t_s=0.45\) | 227 | 0.180 | 10.5% | 9.1% |

这些数据说明，在类似甚至略高的奖励下，随着早期高代价约束覆盖更多模式形成过程，类别比例更接近基础模型。原文图 9–10 以类别分组展示生成样本，图 9 采用约 0.16 的亮度，图 10 采用约 0.18 的亮度。图片中展示的是每组抽取的 1000 个样本，因此图示占比与基于 50,000 个样本统计的表格数值不必完全一致。

**E.4 以暗度为奖励的 MNIST 实验。** 定义
\[
r(x)=1-\frac1d\sum_{i=1}^{d}x_i.
\]
作者用相同方法鼓励生成更暗的数字，原文图 8、图 11 与表 3 显示总体结论没有改变。表 3 中，基础模型平均暗度奖励约 0.857；普通伴随匹配在奖励约 0.880 时，数字 1 占比从 10.1% 增至 19.6%，数字 0 降至 5.3%；加权匹配 \(t_s=0.45\) 在奖励约 0.881 时，数字 1 占比约 10.3%，数字 0 约 10.1%，显著降低了偏向特定类别的趋势。

#### E.0 实验细节补录（计算资源与超参数）

**计算资源。** 实验在学术 Slurm 集群上运行，每个任务使用单张 NVIDIA GPU（RTX 2080Ti/6000/8000、V100、A100、H100 或 H200），配 4–8 个 CPU 核、至多 12 GB 内存。包括先导实验、论文未报告的实验和被抢占或丢失的任务在内，总运行约 480 GPU 小时。源代码将在发表时公开。

**高斯混合。** 对第 5.1 节第一个高斯混合实验，基础模型是含 4 546 个参数的多层感知机，用 Adam（恒定学习率 \(2\times10^{-4}\)）与批次大小 100 训练 100 个 epoch，每个 epoch 使用 \(10^5\) 个目标分布的新样本；取其权重的指数滑动平均（衰减 0.999）。微调进行 80 个 epoch，每个 epoch 10 个批次、每批 1 000 条轨迹，采样用 40 个离散化步；优化器为 Adam（学习率 \(2\times10^{-4}\)），权重指数滑动平均衰减 0.99。对伴随匹配与分段常数权重扫 \(a\in[0.2,39.95]\)，对分段常数（\(t_s\in\{0.25,0.5,0.65,0.8\}\)）、线性（\(w_0\in\{10,10^2,10^3,10^4\}\)）与指数（\(\alpha\in\{2,4,6,8\}\)）权重函数也各扫相应参数。每种方法（伴随、分段、指数或固定 \(t_s,\alpha,w_0\) 的线性）都从最小的 \(a\) 开始，用前一个 \(a\) 的权重热启动，只优化 40 个 epoch；最终检查点用 \(10^6\) 个样本评估。附录 E.2.2 的附加实验参数类似，但 \(a\in[0.2,29.95]\) 且不使用线性权重；E.2.3 的附加实验参数类似，但 \(a\in[0.2,9.2]\)、\(t_s\in\{0.5,0.6,0.7,0.8\}\)，不热启动，且不使用线性与指数权重函数。

**MNIST。** 对第 5.2 节与附录 E.4 的 MNIST 实验，基础模型是含 900 万参数的 UNet，在缩放到 \([-1,1]\) 的 MNIST 训练图像上训练：批次大小 64，Adam（学习率 \(2\times10^{-4}\)，由 PyTorch 的 ReduceLROnPlateau 按验证损失减半，patience 5）训练 50 个 epoch；取其权重的指数滑动平均（衰减 0.9999）。每次微调都从基础模型出发，进行 25 个 epoch、每个 epoch 50 个批次、每批 64 条轨迹，采样用 40 个离散化步；优化器为 Adam（学习率 \(2\times10^{-4}\)，由 ReduceLROnPlateau 按每个 epoch 的平均梯度范数减半，patience 5），权重指数滑动平均衰减 0.995。对伴随匹配扫 \(a\in[1,10]\)；对分段常数权重函数，在 \(t_s=0.25\) 时扫 \(a\in[10,50]\)、\(t_s=0.3\) 时 \([10,100]\)、\(t_s=0.35\) 时 \([40,150]\)、\(t_s=0.4\) 时 \([80,250]\)、\(t_s=0.45\) 时 \([120,375]\)。最终检查点用 \(5\times10^4\) 个样本评估，并用 Hugging Face 分类器 `farleyknight/mnist-digit-classification-2022-09-04`（微调的 ViT-B/16，Apache 2.0 许可）预测类别。

#### E.1 高斯混合补充实验的细节

**E.1.1 线性权重函数。** 对第 5.1 节实验另试线性函数 \(w_{\mathrm{linear}}(t)=w_0+(w_1-w_0)t\)（\(w_1=1\)、\(w_0\) 取不同值）。图 5 显示线性权重的奖励/均衡折中优于普通伴随匹配，但不如指数或分段常数权重有效。

**E.1.2 偏移模式。** 图 6 用不同基础分布重做第 5.1 节实验：两个模式方差相同，但第二个偏出第一坐标轴，

$$
p_{\mathrm{target}}(x)=\frac12\mathcal N(x;\mu_1,\sigma^2\mathbf I)+\frac12\mathcal N(x;\mu_2,\sigma^2\mathbf I),\qquad \mu_1=(-m,0),\ \mu_2=(m,s),\ m,s\in\mathbb R,\ \sigma>0 .
$$

结论不变。

**E.1.3 四模式。** 另做四个高斯作为基础分布的实验（\(\mu_1=(4,-2)\)、\(\mu_2=(4,2)\)、\(\mu_3=(-4,-2)\)、\(\mu_4=(-4,2)\)，\(\sigma^2=0.25\)，奖励 \(r(x)=x_1+x_2\)）。图 7 把基础分布样本与伴随匹配、不同 \(a\) 和 \(t_s\) 下分段常数加权匹配的样本并列展示：伴随匹配很快坍缩到右上模式；加权匹配随 \(t_s\) 减轻该效应——\(t_s=0.5\) 仍观察到坍缩，只是发生更晚；\(t_s=0.6\) 时每一对上下相邻模式内部发生坍缩，但左右之间不坍缩，原因是模式的水平间距大于垂直间距，故左右分裂在生成轨迹上更早发生；此时左右特征是**被保留的粗特征**，上下特征是微调过程中被改变的更细特征。最后，\(t_s=0.7\) 与 \(t_s=0.8\) 时左右与上下两层特征都被保留，奖励最大化只在每个模式内部把样本局部推向**右上方**。

#### E.2 MNIST 主实验：表 1 与表 2 的完整类别分布

表 1 与表 2 给出全部数字类别分布（由预训练分类器对 50 000 个样本分类），对应基础模型、伴随匹配以及不同 \(t_s\) 的加权伴随匹配。对每种方法，各自选取使实际平均奖励最接近 0.16（表 1）与 0.18（表 2）的 \(a\)。可观察到：在平均奖励 0.176 时，伴随匹配生成 18.0% 的数字 0、仅 3.4% 的数字 1；而 \(t_s=0.45\) 的加权伴随匹配在奖励 0.180 时数字 0 为 10.5%、数字 1 为 9.1%。基础模型、伴随匹配与 \(t_s=0.45\) 加权匹配按预测类别分组的样本见原文图 9 与图 10。

**表 1：各方法中平均亮度最接近 0.16 的那次运行的生成样本预测类别（百分比）。** \(\hat R\) 为实际平均亮度奖励。

| 方法 | \(a\) | \(\hat R\) | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 基础 | – | 0.140 | 10.2 | 9.9 | 9.9 | 10.8 | 9.4 | 9.1 | 9.8 | 10.0 | 10.1 | 10.9 |
| 伴随 | 5.7 | 0.159 | 14.8 | 5.8 | 12.0 | 12.0 | 7.4 | 8.5 | 10.0 | 8.0 | 12.1 | 9.4 |
| 加权，\(t_s=0.25\) | 21 | 0.161 | 10.6 | 6.6 | 11.4 | 11.8 | 8.9 | 8.1 | 10.2 | 9.1 | 13.0 | 10.4 |
| 加权，\(t_s=0.3\) | 34 | 0.162 | 10.5 | 7.4 | 10.6 | 10.9 | 9.4 | 8.5 | 9.2 | 9.2 | 12.9 | 11.4 |
| 加权，\(t_s=0.35\) | 52 | 0.161 | 10.6 | 8.8 | 10.2 | 11.0 | 9.2 | 7.7 | 9.8 | 9.0 | 12.3 | 11.2 |
| 加权，\(t_s=0.4\) | 80 | 0.160 | 10.5 | 9.5 | 10.0 | 10.7 | 9.2 | 8.4 | 9.7 | 9.3 | 11.5 | 11.2 |
| 加权，\(t_s=0.45\) | 120 | 0.160 | 10.3 | 9.7 | 9.8 | 10.6 | 9.1 | 8.5 | 9.8 | 9.6 | 11.2 | 11.3 |

**表 2：各方法中平均亮度最接近 0.18 的那次运行的生成样本预测类别（百分比）。**

| 方法 | \(a\) | \(\hat R\) | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 基础 | – | 0.140 | 10.2 | 9.9 | 9.9 | 10.8 | 9.4 | 9.1 | 9.8 | 10.0 | 10.1 | 10.9 |
| 伴随 | 10 | 0.176 | 18.0 | 3.4 | 12.5 | 12.3 | 7.0 | 7.9 | 10.7 | 6.5 | 13.1 | 8.6 |
| 加权，\(t_s=0.25\) | 37 | 0.181 | 12.0 | 3.4 | 13.7 | 11.3 | 8.2 | 7.8 | 8.0 | 7.7 | 17.4 | 10.6 |
| 加权，\(t_s=0.3\) | 57 | 0.180 | 11.9 | 6.1 | 11.2 | 11.6 | 8.1 | 6.4 | 8.9 | 8.4 | 16.0 | 11.2 |
| 加权，\(t_s=0.35\) | 92 | 0.180 | 10.6 | 7.8 | 11.0 | 10.7 | 8.5 | 7.6 | 9.7 | 8.6 | 14.2 | 11.4 |
| 加权，\(t_s=0.4\) | 143 | 0.180 | 10.7 | 8.4 | 10.4 | 10.5 | 8.6 | 7.6 | 9.8 | 9.1 | 13.3 | 11.6 |
| 加权，\(t_s=0.45\) | 227 | 0.180 | 10.5 | 9.1 | 10.2 | 10.3 | 8.9 | 7.9 | 9.7 | 9.3 | 12.4 | 11.5 |

#### E.3 以暗度为奖励的实验：表 3 的完整数据

**表 3：各方法中平均暗度最接近 0.88 的那次运行的生成样本预测类别（百分比）。** \(\hat R\) 为实际平均暗度奖励。

| 方法 | \(a\) | \(\hat R\) | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 基础 | – | 0.857 | 10.4 | 10.1 | 9.4 | 10.8 | 9.5 | 9.0 | 9.9 | 9.8 | 10.3 | 10.7 |
| 伴随 | 8.6 | 0.880 | 5.3 | 19.6 | 7.8 | 9.9 | 9.6 | 9.6 | 8.9 | 10.8 | 7.8 | 10.6 |
| 加权，\(t_s=0.25\) | 25 | 0.880 | 8.8 | 14.8 | 8.1 | 10.4 | 12.0 | 9.0 | 7.3 | 10.4 | 7.6 | 11.6 |
| 加权，\(t_s=0.3\) | 43 | 0.880 | 9.3 | 12.2 | 8.8 | 11.1 | 10.2 | 10.0 | 9.6 | 10.7 | 8.1 | 10.1 |
| 加权，\(t_s=0.35\) | 63 | 0.880 | 9.8 | 11.2 | 9.0 | 10.5 | 10.6 | 10.5 | 9.4 | 10.4 | 8.4 | 10.2 |
| 加权，\(t_s=0.4\) | 98 | 0.879 | 10.1 | 10.6 | 9.4 | 11.0 | 8.5 | 9.8 | 10.0 | 10.4 | 9.1 | 11.1 |
| 加权，\(t_s=0.45\) | 160 | 0.881 | 10.1 | 10.3 | 9.8 | 11.0 | 9.9 | 9.9 | 9.1 | 10.3 | 9.2 | 10.5 |

#### E.4 图 1–图 11 的原始图注（译录）

- **图 1：** 流匹配模型的轨迹（黑色）先采样粗特征——此处示意为数字形状的整体轮廓——再采样细节。该图为纯示意，由作者手绘后经 Claude Design 制作。
- **图 2：** 红色分量正比于“经过该点的轨迹最终落于上方模式”的概率；用于说明生成轨迹的早期选择如何决定模式归属。
- **图 3：** 平均奖励随正模式权重 \(w(t)\) 的变化（高斯混合实验）。
- **图 4：** MNIST 上的平均亮度奖励；横轴为最少/最多类别样本数之比，用以同时衡量奖励与类别均衡。
- **图 5：** 伴随匹配与线性权重加权伴随匹配的 \(\mathbb E[r(\hat X)]\) 对 \(\mathbb E[\mathbf 1_{x_1>0}(\hat X)]\) 曲线。
- **图 6：** 不同函数 \(t\mapsto w(t)\) 下，伴随匹配与加权伴随匹配的平均奖励对正模式权重曲线：(a) 指数权重；(b) 分段常数权重。
- **图 7：** 基础分布样本（蓝）与微调模型样本（橙），对比伴随匹配与分段常数加权匹配在不同 \(a\)、\(t_s\) 下的结果。
- **图 8：** 平均奖励对 \(n_{\min}/n_{\max}\) 曲线。
- **图 9：** 按预测类别分组的生成样本，对应各方法中平均亮度最接近 0.16 的那次运行；百分比在图中展示的 1 000 个样本上统计，故与基于 50 000 样本的表 1 不同。
- **图 10：** 同上，对应平均亮度最接近 0.18（与表 2 相对应的样本级图示）。
- **图 11：** 同上，对应平均暗度最接近 0.88（与表 3 相对应的样本级图示）。

> **转录说明：** 图 1–图 4 的图注在源文抽取文本中被正文交错，个别措辞（如图 2 的坐标含义）存在不确定；此处按可辨识内容译录，未逐字猜补。图片本身未上传，站点仅保留文字说明。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
