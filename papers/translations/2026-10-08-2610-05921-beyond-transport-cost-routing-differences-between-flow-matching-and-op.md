---
layout: page
title: "超越传输代价：流匹配与最优传输的路由差异｜中文全文译文"
permalink: /papers/translations/2026-10-08-2610-05921-beyond-transport-cost-routing-differences-between-flow-matching-and-op/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8200a045c27a78d5/) · [原文 arXiv](https://arxiv.org/abs/2610.05921) · [全部目录](/papers/catalog/)

# 超越传输代价：流匹配与最优传输的路由差异

**原题：** Beyond Transport Cost: Routing Differences between Flow Matching and Optimal Transport  
**作者：** Eungyeol Han、Jong-Seok Lee（通讯作者）  
**单位：** 延世大学融合技术学院（School of Integrated Technology, Yonsei University）  
**版本：** arXiv:2610.05921v1（cs.LG），2026 年 10 月 5 日提交，原文 5 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节、假定 A1–A3、图 1–2 图注、表 1–3 表注、参考文献 [1]–[19]（英文原条目）均按原文结构录入；原文无致谢与附录。逐句逐式终校未做。

## 摘要

在生成模型中，最优传输（Optimal Transport，OT）常被用来改进流匹配（Flow Matching，FM），以降低噪声—数据之间的耦合代价。然而，不同的噪声到输出指派方式可能得到几乎相同的代价，这引出一个关键问题：**仅凭代价是否足以指导耦合设计？** 本文把传输代价与路由（routing，即每个噪声样本最终到达的目标）区分开来，对这一问题进行研究。我们以数值方式表明，FM 与 OT 可以在路由上明显不同，而在代价上仍然接近；并进一步在学习得到的神经流匹配中考察其后果。以精确 FM 路由作为 oracle（预言机），我们构造了一种路由感知的训练耦合，并发现：相对于仅按代价匹配的对照方案，它在生成质量上带来方向一致的改进。我们的发现说明了仅最小化代价可能忽略什么，并表明应当同时使用代价与路由来评估基于 OT 的 FM 耦合设计。代码将在论文被接收后公开。

**关键词：** 流匹配模型；最优传输。

## 1. 引言

流匹配（Flow Matching，FM）通过学习方法学到一个速度场，把噪声样本输运到数据分布，从而生成图像等数据。常规做法是随机地把噪声样本与数据样本配对，并在两者之间的直线插值上训练模型 [1, 2]。然而，这样得到的生成轨迹可能是弯曲的，使准确的少步生成变得困难 [1, 3, 4, 5]。这促使人们采用更有结构的训练耦合，即明确规定噪声样本与数据样本如何配对。

最优传输（Optimal Transport，OT）[6, 7] 为构造这类耦合提供了有原则的方法。它使轨迹更直，从而支持高效的少步生成。二次最优传输（Quadratic OT）[8, 9] 最小化配对样本之间的平均平方欧氏距离，而 minibatch OT [4] 在训练批次内对这一目标作近似。也就是说，用 OT 优化耦合代价，会使 FM 的耦合代价接近 OT 的耦合代价。

然而，近期研究 [10, 11] 表明，即使 FM 与 OT 具有相同代价，它们的路由——即噪声样本被精确放置到何处——仍可能不同。为准确观察路由差异，已有工作采用半离散（semi-discrete）FM 设定。在该设定中，源分布取为连续分布（例如高斯分布），目标分布取为离散原子。因此，根据源分布中每个初始噪声被指派到哪个原子，可以得到相应的路由与边界（如图 1 所示）。

由此引出一个此前被忽视的问题：**如果 OT 与 FM 取得几乎相同的传输代价，却把同一批噪声样本路由到不同的目标，那么仅最小化耦合代价对 FM 而言是否足够？**

为回答该问题，我们不只给出反例，而是定量研究 FM 与 OT 之间的关系。本文贡献如下：

1. 我们说明**相似传输代价并不意味着相似路由**，并在半离散设定下量化 FM 与 OT 之间的这一差距。
2. 我们用实验验证该"代价—路由"差距在**学习得到的神经 FM** 中同样存在。
3. 我们证明**路由感知的训练目标**相对于仅考虑代价的耦合，能在生成质量上带来方向一致的改进。

## 2. 相关工作

**面向流匹配的最优传输。** FM 通过耦合源样本与目标样本，并对插值路径上的平均速度作回归，学习一个含时的向量场 [1, 2, 12]。OT 以最短路径指派的方式配对源与目标，从而降低耦合代价，较随机耦合有所改进 [13]；实际中常用 mini-batch OT 近似 [14, 13, 4]。耦合的评价主要依赖传输代价与 FID 等下游指标，路由则几乎未被考察 [15]。

**FM 与 OT 的几何差异。** FM 一般不能恢复 OT 映射。Rectified flow [1] 通过迭代 reflow 降低代价，但结果仍非最优 [10]。已有工作 [11] 给出了一些反例，说明 FM 与 OT 可以不同；然而，这种指派差异在数值上是如何产生的、又如何影响生成，仍不清楚。这正是本文与直接学习 OT 映射的神经 OT 方法 [16, 17] 的区别。

## 3. 方法

我们试图比较 FM 与 OT 在代价和路由上分化的速率。通过证明代价的分化慢于路由的分化，我们说明：当只优化代价时，忽略路由差异会带来风险。

第 3.1 节定义 \(D(\theta)\) 与 \(\Delta C(\theta)\)，以便精确量化二者并进行比较：\(D(\theta)\) 表示路由差异，\(\Delta C(\theta)\) 表示代价差异。为进行准确的比较，我们把半离散 FM 设定 [11] 细化为如图 2 所示的四目标原子设定。

第 3.2 节通过移动一个会改变路由的原子，观察 FM 与 OT 各自的路由如何变化。我们定义 \(S_{\rm FM}\)、\(S_{\rm OT}\) 来度量路由发生改变的边界，并将二者的差记为 \(q(\beta)\)；随后以闭式形式考察 \(q(\beta)\) 及其变化规律。

第 3.3 节从移动单个原子推广到移动整条边界。通过考察整条边界，我们以闭式形式度量 \(D(\theta)\) 与 \(\Delta C(\theta)\) 的分化速率差异。

最后，第 3.4 节把这些结果从二维空间推广到一般的环境维度 \(d\)。

### 3.1 设置

我们采用半离散设定 [11, 18]：二维连续高斯源 \(\mathbf Z\sim\mathcal N(0,I_2)\)，以及四个目标原子，其分布为 \(\nu_\theta=\frac14\sum_{i=1}^{4}\delta_{\mathbf a_i^\theta}\)，其中 \(\delta_{\mathbf a}\) 为单位点质量，且

$$
\mathbf a_1^\theta=r(1,1),\qquad \mathbf a_2^\theta=r(-1,1),\qquad
\mathbf a_3^\theta=r(-1,-1),\qquad \mathbf a_4^\theta=rR_\theta(1,-1).\tag{1}
$$

这里 \(r>0\) 固定，\(R_\theta\) 表示逆时针旋转 \(\theta\) 弧度，且 \(|\theta|<\pi/4\)。如图 2 所示，从 \(\theta=0\) 出发——此时 FM 与 OT 的代价和路由完全相同——我们将改变 \(\theta\) 来移动原子，并观察路由与边界如何变化。

在该设定下可以得到 FM 的精确速度，用来计算 FM 实际上把每个噪声样本送到何处，以及计算该映射的代价。对独立的 \(\mathbf Z\) 与 \(\mathbf X_1\sim\nu_\theta\)，按线性插值 [1, 2, 11] 取 \(\mathbf X_t=(1-t)\mathbf Z+t\mathbf X_1\)，其中 \(t\in[0,1]\)。在计算速度之前，先计算在 \(\mathbf X_t=\mathbf x\) 条件下 \(\mathbf X_1=\mathbf a_i^\theta\) 的后验概率。由于每个原子在 \(\mathbf x\) 上给出一个高斯分布，该概率可由 Bayes 公式直接得到：

$$
p_i^\theta(t,\mathbf x)=
\frac{
e^{-\|\mathbf x-t\mathbf a_i^\theta\|^2/[2(1-t)^2]}
}{
\sum_j e^{-\|\mathbf x-t\mathbf a_j^\theta\|^2/[2(1-t)^2]}
}.\tag{2}
$$

进而利用 \(p_i^\theta(t,\mathbf x)\) 得到速度

$$
\mathbf v_t^\theta(\mathbf x)=
\frac{\sum_i p_i^\theta(t,\mathbf x)\,\mathbf a_i^\theta-\mathbf x}{1-t}.\tag{3}
$$

我们定义 \(D(\theta)\) 与 \(\Delta C(\theta)\)，分别评估 FM 与 OT 在路由和代价上的差异：

$$
D(\theta)=\Pr\!\left[k_{\rm FM}^\theta(\mathbf Z)\neq k_{\rm OT}^\theta(\mathbf Z)\right],
\qquad
\Delta C(\theta)=C(T_{\rm FM}^\theta)-C(T_{\rm OT}^\theta)\ge 0,\tag{4}
$$

其中 \(k_M^\theta\) 表示 \(M\in\{\mathrm{FM},\mathrm{OT}\}\) 的目标原子编号，\(T_M^\theta\) 表示从 \(\mathbf z\) 出发求解 ODE 所到达的原子。\(D(\theta)\) 是 FM 与 OT 就把噪声送往哪个原子发生分歧的概率；\(\Delta C(\theta)\) 度量 FM 相对 OT 多付出的代价。由于 OT 取得最小代价，恒有 \(\Delta C(\theta)\ge0\)。

### 3.2 单个原子移动时的边界响应

本节说明 FM 与 OT 在路由与边界上的精确形式如何不同。由于路由最终取决于噪声被移动到哪个原子，我们用 \(\theta\) 移动第 3.1 节中四个原子里的一个，以观察 FM 与 OT 的路由如何变得不同（见图 2）。此外，为考察路由改变处边界的变化，我们定义 \(S_{\rm FM}\)、\(S_{\rm OT}\) 分别为 FM 与 OT 的边界，并以闭式形式导出二者的差。

为观察边界变化，我们定义垂直于边界、沿水平方向的坐标 \(s_M(\beta;\theta)\)，\(M\in\{\mathrm{FM},\mathrm{OT}\}\)，并以它为参照计算边界如何改变；这里 \(\beta\) 指边界的高度。由于目标是说明边界相对代价变化很快，我们对 \(s_M(\beta;\theta)\) 在 \(\theta=0\) 处作一阶 Taylor 展开：

$$
s_M(\beta;\theta)=\theta S_M(\beta)+o(\theta),\tag{5}
$$

其中 \(S_M(\beta)\) 表示 \(s_M(\beta,\theta)\) 随 \(\theta\) 的线性变化速率，\(o(\theta)\) 表示其余高阶项，它比 \(\theta\) 更快趋于零。

**FM 响应。** 记 FM 轨迹为 \(\dot{\boldsymbol\gamma}_t^\theta=\mathbf v_t^\theta(\boldsymbol\gamma_t^\theta)\)，从 \(t=0\) 处的噪声点出发。为追踪该轨迹在 \(\theta\) 由零变为非零时如何移动，我们把它改写为消去 \(t\) 的坐标。

我们作三次替换：把原子按 \(r\) 缩放，即 \(\mathbf b_i^\theta=\mathbf a_i^\theta/r\)；以 \(u=rt/(1-t)\) 替换 \(t\)，于是当 \(t\) 从 0 变到 1 时 \(u\) 从 0 变到 \(+\infty\)，FM 的最终输出对应 \(u\to\infty\)；并缩放轨迹 \(\mathbf y=\boldsymbol\gamma_t^\theta/(1-t)\)，以消去速度场中的收缩项。于是精确速度 (3) 简化为

$$
\mathbf y'=
\frac{\sum_i \mathbf b_i^\theta\,e^{u\mathbf y^\top\mathbf b_i^\theta}}
{\sum_j e^{u\mathbf y^\top\mathbf b_j^\theta}},\tag{6}
$$

其中撇号现在表示对 \(u\) 的导数。

在 \(\theta=0\) 处，对称边界使 \(\mathbf y\) 的两个坐标解耦：每个 \(y_j\) 按 \(y_j'=\tanh(uy_j)\) 独立演化。从原子 1 与原子 2 之间边界上出发的点满足对所有 \(u\) 都有 \(y_1=0\)，而其竖直坐标按 \(Y_\beta(u)\) 演化，后者是 \(y_2'=\tanh(uy_2)\) 从高度 \(\beta\) 出发的解。我们把这条边界轨迹写作 \((0,Y_\beta(u))\)。

现在扰动 \(\theta\)，并问：在固定 \(\beta\) 时，起始水平坐标必须如何改变才能仍停留在边界上？当一点在 FM 下到达任一原子的可能性相等（等后验条件）时，它位于边界上。由于该条件无法直接在 \(u=\infty\) 处求值，我们先在有限时刻 \(u=H\) 施加该条件，随后再令 \(H\to\infty\)。设 \(s_{{\rm FM},H}\) 为满足该有限时刻条件的起始坐标；将其对 \(\theta\) 在 0 处求导，得到灵敏度 \(\xi_{\beta,H}\) 的线性 ODE：

$$
Y_\beta'=\tanh(uY_\beta),\qquad Y_\beta(0)=\beta,
$$
$$
\xi_{\beta,H}'=u\,\xi_{\beta,H}+g_\beta(u),\qquad \xi_{\beta,H}(H)=0,
$$
$$
g_\beta(u)=\frac14\left[1-\tanh(uY_\beta)\right]\left(1+uY_\beta\right).\tag{7}
$$

这里 \(\xi_{\beta,H}(0)=\partial_\theta s_{{\rm FM},H}|_0\) 就是我们（在时间视界 \(H\) 内）要求的量。用积分因子求解该线性 ODE，得

$$
\left.\partial_\theta s_{{\rm FM},H}\right|_0
=-\int_0^H e^{-u^2/2}g_\beta(u)\,du.\tag{8}
$$

为得到终端响应，令 \(H\to\infty\)，这需要一个假设：

> **假设 A1。** 当 \(H\to\infty\) 时，有限视界边界连同其关于 \((\beta,\theta)\) 的一阶导数，在 \(\theta=0\) 附近且远离原点处收敛到终端边界——也就是说，极限 \(H\to\infty\) 与对 \(\theta\) 的求导可以交换。

由 A1 可直接在上式积分内取 \(H\to\infty\)，从而恢复式 (8) 中的终端响应：

$$
S_{\rm FM}(\beta)=-\int_0^\infty e^{-u^2/2}g_\beta(u)\,du,\tag{9}
$$

由于 \(0\le g_\beta\le1/4\)，该积分恒为有限值。

**OT 响应与带符号差距。** 现在我们用同样的方式计算 \(S_{\rm OT}(\beta)\)，但采用 OT 的指派规则而非 ODE。OT 并不简单地把每个点送到最近的原子，而是用称为**对偶势**（dual potential）的偏移量 \(\psi_i^\theta\) 调整每个原子的代价，再把每个点送到调整后代价最低的原子：

$$
\ell_i^\theta(\mathbf z)=\frac12\|\mathbf z-\mathbf a_i^\theta\|^2-\psi_i^\theta.\tag{10}
$$

这些偏移量之所以存在，是因为若没有它们，一旦方形被扰动，朴素的"最近原子"规则就无法把高斯质量的恰好 \(1/4\) 送往每个原子。对偶势 \(\psi_i^\theta\) 的选取恰好使该等质量条件对四个原子都成立 [9, 19]；我们再通过要求 \(\sum_i\psi_i^\theta=0\) 固定其定义中的唯一自由常数。

由于 \(\ell_i^\theta\) 关于 \(\mathbf z\) 是二次的，两个调整后代价相等的边界总是直线，这与上面弯曲的 FM 边界不同。特别地，原子 1 与原子 2 之间的边界位于 \(s_{\rm OT}=(\psi_2^\theta-\psi_1^\theta)/(2r)\)，因为 \(\ell_1^\theta(\mathbf z)-\ell_2^\theta(\mathbf z)=-2rz_1-\psi_1^\theta+\psi_2^\theta=0\)，其中 \(\mathbf z=(z_1,z_2)\)。该位置与 \(\beta\) 无关，因此上侧 OT 边界保持竖直，只作水平平移。把四个等质量约束对 \(\theta\) 求导，得

$$
\left.\partial_\theta\psi_1^\theta\right|_{\theta=0}=r\varphi_0,\qquad
\left.\partial_\theta\psi_3^\theta\right|_{\theta=0}=-r\varphi_0,\qquad
\left.\partial_\theta\psi_2^\theta\right|_{\theta=0}
=\left.\partial_\theta\psi_4^\theta\right|_{\theta=0}=0,
$$
$$
S_{\rm OT}(\beta)=-\kappa,\qquad \kappa=\varphi_0/2,\tag{11}
$$

其中 \(\varphi(\beta)=(2\pi)^{-1/2}e^{-\beta^2/2}\) 为标准高斯密度，\(\varphi_0=\varphi(0)=1/\sqrt{2\pi}\)。

现在可以直接比较两种响应。定义二者之差

$$
q(\beta):=S_{\rm FM}(\beta)-S_{\rm OT}(\beta)
=\kappa-\int_0^\infty e^{-u^2/2}g_\beta(u)\,du,\tag{12}
$$

于是 \(s_{\rm FM}-s_{\rm OT}=\theta q(\beta)+o(\theta)\)。这说明在每个高度 \(\beta\) 上，FM 与 OT 对同一微小 \(\theta\) 变化的响应相差多少。

**\(q(\beta)\) 改变符号。** 随着 \(\beta\) 增大，\(Y_\beta\) 也随之增大（因为 \(Y_\beta(0)=\beta\) 且 \(Y_\beta'=\tanh(uY_\beta)>0\)）。这使每个固定 \(u\) 处的 \(g_\beta(u)\) 趋向 0，于是式 (12) 中的积分缩小、\(q(\beta)\) 随 \(\beta\) 增大。在两个极端处，

$$
q(0^+)=\kappa-\frac14\sqrt{\pi/2}<0,\qquad q(\infty)=\kappa>0.\tag{13}
$$

由于 \(q(\beta)\) 单调且变号，恰存在一个高度 \(\beta^\ast\) 使 \(q(\beta^\ast)=0\)。在 \(\beta^\ast\) 下方与上方，FM 与 OT 以相反方向发生分歧：当正 \(\theta\) 很小时，\(\beta^\ast\) 下方的情形是 FM 把边界附近的窄条送往左上原子，而 OT 送往右上原子；在 \(\beta^\ast\) 上方则相反。无论哪种情况，两个上侧原子只是互相交换样本，任一原子的样本总份额都不变。

同样的规律对四条边界都成立。以上我们只研究了上边界；同样的步骤适用于图 2 中其余三条边界（左、下、右），每条边界用其自身的轴向距离 \(\beta>0\) 度量：

**式 (14)**

| 边界 \(e\) | \(\tilde S_{\rm FM}^e\) | \(\tilde S_{\rm OT}^e\) |
|---|---|---|
| \(U\)（上）、\(L\)（左） | \(S_{\rm FM}\) | \(-\kappa\) |
| \(B\)（下）、\(R\)（右） | \(S_{\rm FM}+\beta/2\) | \(-\kappa+\beta/2\) |

其中 \(\tilde S_M^e=\left.\partial_\theta\tilde s_M^e\right|_0\)。每条边界共享同一个带符号差距 \(q(\beta)\)，尽管各边界自身的位移 \(S_M^e\) 不同。换言之，上面发现的变号并不只出现在上边界，而是出现在方形四周的全部四条边界上。

### 3.3 一阶路由、二阶超额代价

注意 \(q(\beta)\) 是 FM 与 OT 边界响应之差，且是针对某条边界上每个高度 \(\beta\) 的差，因此是**局部**量。但式 (4) 定义的 \(D(\theta)\) 与 \(\Delta C(\theta)\) 是**全局**量：它们是在整个噪声分布上取平均。本节把局部结果对每个高度和每条边界求和，得到这些全局量。我们将看到，当 \(\theta\to0\) 时二者以不同速率增长：路由分歧 \(D(\theta)\) 增长很快，与 \(\theta\) 成正比；超额代价 \(\Delta C(\theta)\) 增长很慢，只与 \(\theta^2\) 成正比。我们分别称这两种速率为关于 \(\theta\) 的**一阶**与**二阶**。

**为什么路由分歧是一阶的。** 回顾第 3.2 节：在高度 \(\beta\) 处，FM 与 OT 在一个细窄条带上发生分歧，条带宽度为

$$
|h_e|=|s_{{\rm FM}}^e-s_{{\rm OT}}^e|
=|\theta q(\beta)+o(\theta)|.\tag{15}
$$

这一宽度与 \(\theta\) 成正比。在边界附近，噪声样本的密度不依赖于 \(\theta\)，只有条带宽度依赖 \(\theta\)。因此条带内的概率质量与宽度成正比，也就与 \(\theta\) 成正比。由于 \(D(\theta)\) 恰为该质量在四条条带上的总和，\(D(\theta)\) 随 \(|\theta|\) 线性增长。

**为什么超额代价是二阶的。** 恰好位于 OT 边界上时，把点送往任一相邻原子代价相同。离开边界后，这一等式被破坏，两个代价之间的差距随距边界的距离 \(n\) 增大；在上边界上，该差距精确等于 \(2r|n|\)。把这一逐渐增大的惩罚在条带上从边界（\(n=0\)）积分到其远端（\(n=|h_U|\)），得

$$
\int_0^{|h_U|}2rn\,dn=rh_U^2.\tag{16}
$$

由于 \(h_U\) 如式 (15) 所示是 \(O(\theta)\)，上式是 \(O(\theta^2)\)。原因在于条带的宽度与其内部的惩罚都随 \(\theta\) 缩小，因此代价"双重缩小"，表现为 \(\theta^2\) 而不是 \(\theta\)。其余三条边界行为相同。

利用第 3.2 节的化简代价 \(\ell_i^\theta=\frac12\|\mathbf z-\mathbf a_i^\theta\|^2-\psi_i^\theta\)，原子 \(k\) 的真实代价为 \(\ell_k^\theta+\psi_k^\theta\)。FM 与 OT 都把概率 \(1/4\) 送往每个原子，因此两者的期望偏移量 \(\psi_{k_M^\theta}\) 相同，均为 \(\frac14\sum_i\psi_i^\theta\)，并在二者之差中相消：

$$
\Delta C(\theta)=\mathbb E\!\left[\ell_{k_{\rm FM}^\theta}^\theta(\mathbf Z)-\ell_{k_{\rm OT}^\theta}^\theta(\mathbf Z)\right].\tag{17}
$$

**再引入两个假设。** 为严格地把四条条带相加，需要两个假设。在 \(\theta=0\) 附近，四条边界在原点相交，正是各边界相互作用最难控制之处，因此我们在原点周围用一个尺寸正比于 \(\theta\) 的小方块 \(J_\theta\) 隔离该区域。**A2：** 在 \(J_\theta\) 之外，分歧由四条互不相交的相邻原子条带组成，可用 \(\beta\) 参数化；任何异常情形（例如三个或更多原子相遇的点）都局限在 \(J_\theta\) 内。**A3：** 在更远处，\(|s_M^e(\beta;\theta)|/|\theta|\le W(\beta)\)，其中 \(W\) 固定且其积分收敛。与 A1 一样，这些是关于精确终端边界的假设。

**条件分离结果。** 在 A1–A3 下，以高斯密度加权，把四条条带的质量与代价相加，得到

$$
D(\theta)=A|\theta|+o(|\theta|),\qquad
\Delta C(\theta)=B\theta^2+o(\theta^2),
$$
$$
A=4\varphi_0\int_0^\infty\varphi(\beta)|q(\beta)|\,d\beta,\qquad
B=4r\varphi_0\int_0^\infty\varphi(\beta)q(\beta)^2\,d\beta,
\quad A,B>0.\tag{18}
$$

中心交汇区 \(J_\theta\) 只贡献 \(O(\theta^2)\) 的质量，每份的惩罚为 \(O(|\theta|)\)，即总代价 \(O(|\theta|^3)\)，相对于上面的 \(O(\theta^2)\) 可以忽略。

等价地，由于 \(D(\theta)\approx A|\theta|\)，

$$
\Delta C(\theta)=\frac{B}{A^2}D(\theta)^2+o\!\left(D(\theta)^2\right):
$$

**超额代价仅按路由分歧的平方增长。** 因此，大的路由差距可以与小的代价差距并存。

### 3.4 推广到更高环境维度

对满足 \(U^\top U=I_2\) 的 \(U\in\mathbb R^{d\times2}\)，我们把原子嵌入为 \(U\mathbf a_i^\theta\)，并采用源分布 \(\mathcal N(0,I_d)\)。正交分解把两种指派都约化到 \(U^\top\mathbf z\) 上 [11]。用环境维度对同样的指标作编号，得到

$$
D_d(\theta)=D_2(\theta),\qquad
\Delta C_d(\theta)=\Delta C_2(\theta),\qquad
C_{M,d}(\theta)=C_{M,2}(\theta)+(d-2)/2.\tag{19}
$$

因此，对这些平面嵌入而言，\(q\)、\(A\)、\(B\) 保持不变。

## 4. 实验

我们分三步检验理论：(i) 在精确、合成的设定中检验 \(q(\beta)\) 是否预测边界位移以及式 (18) 的分离定律；(ii) 检验当 FM 由网络学习得到时，这一"代价—路由"差距是否仍然存在，以及它是否影响生成质量；(iii) 检验该差距是否延伸到图像数据。

### 4.1 设置

**精确设定。** 我们采用式 (1) 的高斯源与单原子旋转族，扫过 \(\theta\)（取正值、负值，以及对称的 \(\theta=0\) 作为对照）。\(q\)、\(A\)、\(B\) 只从未扰动的动力学中计算一次，之后不再重新拟合，因此下文的比较都是样本外的。FM 积分到 \(t=0.999\)；OT 的偏移量独立求解。

**学习得到的 FM。** 固定源样本库、目标、网络与训练预算，只改变训练耦合。使用带 SiLU 激活的 3 层 MLP，以 Adam（学习率 \(10^{-3}\)）训练 8,000 次更新，批大小 512，跨十个随机种子。**仅代价（Cost Only，CO）** 最小化配对代价；**路由感知（Routing Aware，RA）** 在与 CO 相匹配的代价预算下，最大化与精确 FM 路由 \(k_{\rm FM}^\theta\) 的一致程度（以精确路由作为 oracle）；**路由劣化（Routing Bad，RB）** 匹配同一代价预算，但转而最大化与 \(k_{\rm FM}^\theta\) 的分歧。

### 4.2 结果

**表 1 在精确设定中验证了理论。** Displacement 各行表明，我们的闭式预测 \(\theta q(\beta)\) 与实测边界位移相符，其中包括在 \(\beta^\ast\) 处的预期变号。Routing mass 与 Excess cost 各行表明，把这一局部预测在整条边界上积分，能够重现分离定律：0.999 与 1.998 的对数—对数斜率证实，分歧质量随 \(|\theta|\) 线性增长，而超额代价仅按二次增长，与式 (18) 的预测完全一致。

**表 2 表明这一分离在学习后仍然存在，并且确实重要。** 尽管 \(C\) 几乎相同，CO、RA、RB 在 \(D_{\rm FM}\) 上差异显著：匹配代价并不能固定路由。该差距延续到训练后的网络：RA 的 \(D_{{\rm net},{\rm FM}}\) 与 \(D_{{\rm net},{\rm OT}}\) 最低，RB 最高。它同样影响生成：RA 在 MMD 与 FD 两项指标上都优于 CO，而 RB 没有改进。该改进是显著的（对种子做配对 \(t\) 检验，\(p<0.05\)）。

### 4.3 在图像数据上的泛化

为检验该差距是否超出合成设定，我们在 \(28\times28\) 的 MNIST（\(d=784\)）上重复 CO/RA/RB 的比较，采用连续高斯源与十分类离散目标。速度场用带时间条件的 U-Net 参数化，优化器为 Adam，学习率 \(2\times10^{-4}\)，8,000 次更新，批大小 64。由于此处无法获得精确的 FM 路由，我们在与第 4.1 节相同的代价约束下，把训练好的 CO 网络的终端指派作为 RA 与 RB 的路由 oracle。

表 3 呈现出与前面相同的规律：RA 相对 CO 改善了生成质量。这表明"代价—路由"分离并非四原子设定的假象；不过大规模验证仍属未来工作。

## 5. 结论

我们说明，FM 与 OT 的耦合可以取得几乎相同的传输代价，却把样本路由到差别显著的目标；并在学习得到的神经 FM 中验证了这些结果。我们的发现表明，仅最小化代价可能无法完整刻画基于 OT 的 FM 耦合的质量，这促使人们把路由感知目标作为更广泛的 OT-FM 训练算法中的一项补充准则。

## 图注与表注

**图 1（原文 Fig. 1）：** FM 与 OT 之间传输代价相似但路由不同。数据空间中的每个区域内的噪声样本到达同一个目标原子。子图 (a) OT、(b) 精确 FM、(c) 边界不一致（boundary disagreement）：三者质量/代价相近，但路由不同。

**图 2（原文 Fig. 2）：** FM 与 OT 对同一原子旋转表现出不同的路由—边界响应；红色为精确 FM，蓝色为 OT。三个子图分别为 (a) \(\theta=0^\circ\)、(b) \(\theta=-15^\circ\)、(c) \(\theta=+15^\circ\)，坐标轴为 \(z_1,z_2\)，标注原子 \(\mathbf a_1,\mathbf a_2,\mathbf a_3,\mathbf a_4^{(0)},\mathbf a_4^{(\theta)}\)。

**表 1（原文 Table 1）：** 边界位移预测与由此得到的代价—路由分离（式 (18)）的数值验证。

| 量 | 指标 | 理论值 | 实测值 |
|---|---|---|---|
| 位移 | \(R^2\)，全网格 | – | 0.9986 |
| 位移 | \(R^2\)，\(|\theta|\le2^\circ\) | – | 0.9991 |
| 位移 | 在 \(\beta^\ast\) 处变号 | 0.6455 | 0.6455 |
| 路由质量 | 对数—对数斜率 | 1 | 0.9992 |
| 路由质量 | \(A\) 对 \(D/|\theta|\) | 0.038038 | 0.038040 |
| 超额代价 | 对数—对数斜率 | 2 | 1.9976 |
| 超额代价 | \(B\) 对 \(\Delta C/\theta^2\) | 0.010222 | 0.010226 |

**表 2（原文 Table 2）：** 代价匹配的学习型 FM 诊断。耦合指标只计算一次；路由与生成指标报告十次运行的均值 \(\pm\) 标准差。MMD 为最大均值差异（Maximum Mean Discrepancy），FD 为 Fréchet 距离。原表为排版分成上下两块，此处合并为一张表。

| 耦合 | \(C\) | \(D_{\rm FM}\downarrow\) | \(D_{{\rm net},{\rm FM}}\downarrow\) | \(D_{{\rm net},{\rm OT}}\downarrow\) | MMD\(_1\downarrow\) | MMD\(_4\downarrow\) | FD\(_1\downarrow\) | FD\(_4\downarrow\) |
|---|---|---|---|---|---|---|---|---|
| CO | 0.814 | 0.020 | 0.022±0.008 | 0.022±0.008 | 0.076±0.011 | 0.038±0.008 | 0.012±0.001 | 0.005±0.002 |
| RA | 0.818 | 0.013 | 0.020±0.008 | 0.020±0.008 | 0.074±0.012 | 0.038±0.008 | 0.009±0.000 | 0.003±0.000 |
| RB | 0.819 | 0.063 | 0.025±0.008 | 0.025±0.008 | 0.076±0.012 | 0.040±0.006 | 0.011±0.001 | 0.007±0.002 |

**表 3（原文 Table 3）：** \(28\times28\) MNIST 上的代价—路由诊断与生成质量。

| 耦合 | \(C\) | \(D_{\rm net}\downarrow\) | FD\(\downarrow\) |
|---|---|---|---|
| CO | 0.818 | 0.025 | 24.72 |
| RA | 0.820 | 0.011 | 21.32 |
| RB | 0.821 | 0.071 | 28.54 |

## 参考文献（英文原书目）

[1] Xingchao Liu, Chengyue Gong, and Qiang Liu, “Flow straight and fast: Learning to generate and transfer data with rectified flow,” International Conference on Learning Representations, 2023.

[2] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le, “Flow matching for generative modeling,” International Conference on Learning Representations, 2023.

[3] Zhengyang Geng, Mingyang Deng, Xingjian Bai, Zico Kolter, and Kaiming He, “Mean flows for one-step generative modeling,” Advances in Neural Information Processing Systems, vol. 38, pp. 75460–75482, 2026.

[4] Aram-Alexandre Pooladian, Heli Ben-Hamu, Carles Domingo-Enrich, Brandon Amos, Yaron Lipman, and Ricky TQ Chen, “Multisample flow matching: Straightening flows with minibatch couplings,” Proceedings of the 40th International Conference on Machine Learning, vol. 202, pp. 28100–28127, 2023.

[5] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine, “Elucidating the design space of diffusion-based generative models,” Advances in neural information processing systems, vol. 35, pp. 26565–26577, 2022.

[6] Cédric Villani et al., Optimal transport: old and new, vol. 338, Springer, 2009.

[7] Marco Cuturi, “Sinkhorn distances: Lightspeed computation of optimal transport,” Advances in neural information processing systems, vol. 26, 2013.

[8] Yann Brenier, “Polar factorization and monotone rearrangement of vector-valued functions,” Communications on pure and applied mathematics, vol. 44, no. 4, pp. 375–417, 1991.

[9] Peyré Gabriel and Cuturi Marco, “Computational optimal transport with applications to data sciences,” Foundations and trends® in machine learning, vol. 11, no. 5-6, pp. 355–607, 2019.

[10] Johannes Hertrich, Antonin Chambolle, and Julie Delon, “On the relation between rectified flows and optimal transport,” Advances in Neural Information Processing Systems, vol. 38, pp. 172578–172610, 2026.

[11] Emile Pierret, Johannes Hertrich, Samuel Hurault, and Julie Delon, “Tessellations of semi-discrete flow matching,” arXiv preprint arXiv:2605.07513, 2026.

[12] Michael Albergo, Nicholas M Boffi, and Eric Vanden-Eijnden, “Stochastic interpolants: A unifying framework for flows and diffusions,” Journal of Machine Learning Research, vol. 26, no. 209, pp. 1–80, 2025.

[13] Alexander Tong, Kilian Fatras, Nikolay Malkin, Guillaume Huguet, Yanlei Zhang, Jarrid Rector-Brooks, Guy Wolf, and Yoshua Bengio, “Improving and generalizing flow-based generative models with minibatch optimal transport,” Transactions on Machine Learning Research, 2024.

[14] Kilian Fatras, Younes Zine, Szymon Majewski, Rémi Flamary, Rémi Gribonval, and Nicolas Courty, “Minibatch optimal transport distances; analysis and applications,” arXiv preprint arXiv:2101.01792, 2021.

[15] Bharath Bhushan Damodaran, Benjamin Kellenberger, Rémi Flamary, Devis Tuia, and Nicolas Courty, “Deepjdot: Deep joint distribution optimal transport for unsupervised domain adaptation,” in European conference on computer vision. Springer, 2018, pp. 467–483.

[16] Ashok Makkuva, Amirhossein Taghvaei, Sewoong Oh, and Jason Lee, “Optimal transport mapping via input convex neural networks,” in International Conference on Machine Learning. PMLR, 2020, pp. 6672–6681.

[17] Litu Rout, Alexander Korotin, and Evgeny Burnaev, “Generative modeling with optimal transport maps,” International Conference on Learning Representations, 2021.

[18] Thibaut Le Gouic and Jean-Michel Loubes, “Existence and consistency of wasserstein barycenters,” Probability Theory and Related Fields, vol. 168, no. 3, pp. 901–917, 2017.

[19] Chloé Jimenez and Filippo Santambrogio, “Optimal transportation for a quadratic cost with convex constraints and applications,” Journal de mathématiques pures et appliquées, vol. 98, no. 1, pp. 103–113, 2012.

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–5 节全部正文、假定 A1–A3、式 (1)–(19)、图 1–2 图注、表 1–3、参考文献 [1]–[19]（英文原条目、按原编号）。原文无致谢、无附录，故未增加对应小节。第 4 页开头的"条件分离结果"一段在源抽取文本中被截断（原文该段以 "Conditional separation result." 起始），本页已按 PDF 渲染页补足该段；逐句逐式终校未做，公式编号与符号以原文为准（如式 (14) 原为表格式编号，此处以 Markdown 表转写并保留编号 14）。本文为 arXiv 预印本，图 1–2 为示意图，本页不复制图片、不对图内曲线作数字化估算。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
