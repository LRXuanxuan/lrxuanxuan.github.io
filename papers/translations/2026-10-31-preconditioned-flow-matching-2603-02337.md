---
layout: page
title: "Preconditioned Flow Matching：预条件流匹配｜中文主体译稿（长附录待补）"
permalink: /papers/translations/2026-10-31-preconditioned-flow-matching-2603-02337/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 arXiv](https://arxiv.org/abs/2603.02337) · [原文代码](https://github.com/ahxmeds/preconditioned-flow-matching)

# 预条件流匹配（Preconditioned Flow Matching）

**原题：** Preconditioned Flow Matching  
**作者：** Shadab Ahamed、Eshed Gal、Md Shahriar Rahim Siddiqui、Simon Ghyselincks、Moshe Eliasof、Eldad Haber  
**机构：** 不列颠哥伦比亚大学、剑桥大学。  
**原稿：** arXiv:2603.02337v3，2026-10-26，45 页，标注 NeurIPS 2026。  
**译稿状态：** 主体 1—6 节已翻译为中文技术稿，并录入核心公式与实验主表；附录 D—H 的大部分证明与实验、全部证明细节、附录数据表和完整英文参考书目尚未逐段补齐，因此**不是最终全文译文**。少数标题/定理编号以原文为准。

## 摘要

流匹配（Flow Matching，FM）通过对中间分布 $p_t$ 上的随机目标速度执行回归来学习向量场。本文识别了该回归问题中的一种几何优化瓶颈：当中间分布的协方差 $\Sigma_t$ 病态时，基于梯度的训练会迅速拟合高方差方向，却在低方差方向上进展缓慢。

在一个可以精确求解的高斯设置中，作者证明超额风险由 $\Sigma_t$ 加权，梯度下降（GD）及随机梯度下降（SGD）的收敛都取决于条件数。进一步将分析扩展到高斯混合模型，说明多模态性不会平均消除这种效应；相反，最慢且条件数最差的分量可能主导优化。

受此启发，本文提出预条件流匹配（Preconditioned Flow Matching）：先通过可逆变换把目标分布转换到更加各向同性的表示，再在转换后的空间训练主流模型，生成样本后应用逆变换返回原始空间。理论证明预条件化改变了 FM 的中间路径并改善条件数。在受控高斯与高斯混合实验、潜空间 MNIST、以及最高 $512\times512$ 分辨率图像数据集上，预条件化改善路径条件数诊断、低特征值方向恢复、FID、MMD、精度和召回率。计算量匹配的基线与预条件器质量消融进一步表明，提升不只是额外参数带来的，而来自下游流匹配问题的几何改善。

代码：[preconditioned-flow-matching](https://github.com/ahxmeds/preconditioned-flow-matching)。

## 1. 引言

流匹配 [Lipman et al., 2023] 与基于得分的扩散模型 [Song et al., 2021; Ho et al., 2020] 已成为连续时间生成建模的重要工具，在图像、音频和三维合成任务中取得先进表现。二者都将生成表述为由简单参考分布向复杂数据分布的输运过程，其核心是学习一个时间相关的动力系统。然而，这些模型存在一种持续出现的优化现象：训练损失往往在生成质量饱和之前很久便进入平台期，这说明总体训练目标的收敛可能掩盖了对生成有重要作用的某些动力学误差。

已有缓解方法包括精细设计的噪声调度、随时间变化的损失重加权和概率流蒸馏。这些技术可以改善样本质量，但主要调整训练调度、损失权重或采样过程，并没有直接改善沿流匹配路径产生的回归问题的条件数。因此，作者将重点放在**中间分布本身的几何结构**上。

本文表明，FM 收敛缓慢的一个重要原因，是流匹配损失中回归问题的病态性。每个时间步的训练都相当于从中间输运分布的样本估计速度向量场。当这些分布强烈各向异性时，梯度方法迅速拟合大方差方向，却在小方差方向上改善缓慢。即使模型足够表达精确速度场，这种困难仍然存在，说明瓶颈可完全来自优化，而非模型近似能力。

作者先研究可解析的线性高斯 FM，然后扩展到高斯混合 FM。在这两种场景下，优化动态都类似病态最小二乘问题上的 GD/SGD。进一步提出预条件化：通过改变问题所使用的表示，改善回归几何，而不必改变底层生成目标。与传统潜空间生成建模不同，预条件化并不以压缩数据为主要目标；自动编码器或 VAE 的潜空间可能仍存在强烈各向异性。因此，预条件化与潜空间 FM/扩散互补，可以在原始数据空间使用，也可以叠加到已有潜空间上。

本文需要额外训练预条件器并选择超参数，但其额外开销针对下游回归几何，而非单纯增加生成器容量。贡献包括：（i）从理论上分析数据各向异性如何控制 FM 优化速度；（ii）提出不改变主流架构与采样 ODE 的预条件—再匹配框架；（iii）说明低 FM 损失可能隐藏低方差方向上的速度误差、纯时间标量加权无法消除固定时间的方向刚性、而预条件化能改变中间路径协方差；（iv）从二维数据到 MNIST 与更高分辨率图像开展验证。

**图 1：** 预条件—再匹配示意。标准 FM 直接在各向异性的中间分布上学习，容易停滞；可逆预条件器 $P$ 将目标映射到更接近高斯、条件数更好的空间，训练后由 $P^{-1}$ 将生成样本变换回原空间。

## 2. 将流匹配视为随机回归

连续时间生成模型构建从简单参考分布 $p_0$（通常为高斯）向数据分布 $p_1$ 的输运。与直接学习 $\mathbf x_0\mapsto\mathbf x_1$ 不同，流匹配引入一族中间状态：

$$
\mathbf x_t=s(t)\mathbf x_1+c(t)\mathbf x_0, \tag{1}
$$

其中 $\mathbf x_0\sim p_0$、$\mathbf x_1\sim p_1$，满足 $s(0)=0$、$s(1)=1$、$c(0)=1$、$c(1)=0$。目标是学习控制中间分布 $p_t$ 的速度场，满足输运常微分方程 $d\mathbf x_t/dt=v_\theta(\mathbf x_t,t)$。对于式（1），目标速度为

$$
\mathbf v_t^\star(\mathbf x_0,\mathbf x_1)
=s'(t)\mathbf x_1+c'(t)\mathbf x_0.
$$

标准条件流匹配损失为

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathbb E_{t,\mathbf x_0,\mathbf x_1}
\left[\|v_\theta(\mathbf x_t,t)-\mathbf v_t^\star(\mathbf x_0,\mathbf x_1)\|_2^2\right],
\quad t\sim U[0,1]. \tag{2}
$$

**命题 2.1（CFM 的条件均值刻画）。** 对任意可测向量场 $g:\mathbb R^d\times[0,1]\to\mathbb R^d$，定义

$$
\mathcal L(g)=
\mathbb E\left[\|g(\mathbf x_t,t)-\mathbf v_t^\star(\mathbf x_0,\mathbf x_1)\|_2^2\right].
$$

则总体风险的最小化解为条件均值：

$$
g^\star(\mathbf x,t)
=\mathbb E[\mathbf v_t^\star(\mathbf x_0,\mathbf x_1)\mid\mathbf x_t=\mathbf x,t]. \tag{3}
$$

进一步有精确分解：

$$
\mathcal L(g)=
\underbrace{\mathbb E\left[\|g(\mathbf x_t,t)-g^\star(\mathbf x_t,t)\|_2^2\right]}_{\text{优化/近似误差}}
+\underbrace{\mathbb E\left[\operatorname{Tr}\big(\operatorname{Cov}(\mathbf v_t^\star\mid\mathbf x_t,t)\big)\right]}_{\text{不可约随机目标误差}}. \tag{4}
$$

式（4）的迹协方差是不可约随机目标误差（Irreducible Stochastic-Target Error，ISTE）。因此，超额风险为

$$
\mathcal L(g)-\mathcal L(g^\star)
=\mathbb E\|g(\mathbf x_t,t)-g^\star(\mathbf x_t,t)\|_2^2.
$$

随机条件 FM 的目标速度通常并非 $(\mathbf x_t,t)$ 的确定函数，所以损失存在不可消除的噪声下界，而最优速度场仍是条件均值。这说明 FM 是在中间分布 $p_t$ 下的随机目标回归。

## 3. 高斯与高斯混合流匹配的精确条件数理论

本节不试图证明任意非线性网络的全局收敛定理，而是通过可以解析刻画总体条件 FM 目标的设置，隔离中间分布引起的优化机制。先研究精确线性速度场的高斯问题，再扩展到高斯混合，以揭示多模态带来的瓶颈。

### 3.1 高斯 FM：可精确求解的回归问题

取线性插值

$$
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1,\quad
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_1\sim\mathcal N(0,H),
$$

其中 $H\in\mathbb R^{d\times d}$ 对称正定，两个端点样本独立。沿插值路径，中间协方差从 $I$ 转变为 $H$，回归几何逐渐继承目标分布的各向异性。令 $H=U\Lambda U^\top$，$\Lambda=\operatorname{diag}(\lambda_1,\ldots,\lambda_d)$、$\lambda_i>0$。若

$$
\kappa(H)=\frac{\lambda_{\max}(H)}{\lambda_{\min}(H)} \tag{5}
$$

很大，则称 $H$ 病态。

**命题 3.1（高斯 CFM 的精确目标及中间协方差）。** 中间状态为高斯，其协方差为

$$
\Sigma_t:=\mathbb E[\mathbf x_t\mathbf x_t^\top]
=(1-t)^2I+t^2H. \tag{6}
$$

线性插值的条件流匹配总体目标是

$$
g_t^\star(\mathbf x_t)=
\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t]
=A^\star(t)\mathbf x_t, \tag{7}
$$

$$
A^\star(t)=\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)\Sigma_t^{-1}
=[tH-(1-t)I][(1-t)^2I+t^2H]^{-1}. \tag{8}
$$

因此该例中精确目标速度本身是线性的，不存在模型表达不足的干扰。

**引理 3.2（线性预测器的精确超额风险分解）。** 对固定时间 $t$，定义

$$
\mathcal L_t(A)=\mathbb E\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|_2^2. \tag{9}
$$

唯一极小值在 $A^\star(t)$ 处，并且对任意 $A$，

$$
\mathcal L_t(A)=\mathcal L_t(A^\star(t))
+\operatorname{Tr}\big[(A-A^\star(t))\Sigma_t(A-A^\star(t))^\top\big]. \tag{10}
$$

等价地，将最小可达风险写为不可约随机标签误差：

$$
\mathcal L_t(A)=
\mathbb E[\operatorname{Tr}(\operatorname{Cov}(\mathbf x_1-\mathbf x_0\mid\mathbf x_t))]
+\operatorname{Tr}\big[(A-A^\star(t))\Sigma_t(A-A^\star(t))^\top\big]. \tag{11}
$$

所以

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\operatorname{Tr}\big[(A-A^\star(t))\Sigma_t(A-A^\star(t))^\top\big]. \tag{12}
$$

式（12）指出，去除不可约目标方差后，FM 优化项是由 $\Sigma_t$ 加权的二次型。其特征值谱直接控制优化几何。**即使能够精确表示目标速度场，低方差方向也可能使优化任意缓慢。**

### 3.2 条件数控制高斯 FM 的优化

由于 $\Sigma_t$ 与 $H$ 共享特征向量，前者特征值为 $\sigma_i(t)=(1-t)^2+t^2\lambda_i$，条件数为

$$
\kappa(\Sigma_t)=
\frac{(1-t)^2+t^2\lambda_{\max}}
{(1-t)^2+t^2\lambda_{\min}}. \tag{13}
$$

$t=0$ 时 $\Sigma_0=I$，问题条件数为 1；$t=1$ 时 $\Sigma_1=H$，继承目标分布的全部各向异性；中间时间则处于两种状态之间。

**定理 3.3（梯度下降收敛受 $\Sigma_t$ 控制）。** 对固定 $t$，以 $A\in\mathbb R^{d\times d}$ 为优化变量，令交叉协方差为

$$
C_t:=\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)
=tH-(1-t)I. \tag{14}
$$

最优解满足 $A^\star(t)\Sigma_t=C_t$。采用步长 $\eta>0$ 的全批量梯度下降：

$$
A_{k+1}=A_k-2\eta(A_k\Sigma_t-C_t). \tag{15}
$$

令误差 $E_k=A_k-A^\star(t)$，其演化为

$$
E_{k+1}=E_k(I-2\eta\Sigma_t). \tag{16}
$$

当 $0<\eta<1/\sigma_{\max}(t)$ 时，GD 线性收敛到 $A^\star(t)$；取最优固定步长 $\eta^\star=1/(\sigma_{\max}(t)+\sigma_{\min}(t))$，把误差缩小为 $\varepsilon\in(0,1)$ 倍所需迭代次数为

$$
k=O\!\left(\kappa(\Sigma_t)\log(1/\varepsilon)\right). \tag{17}
$$

**推论 3.4（低方差方向是高斯 FM 瓶颈）。** 在定理 3.3 条件下，属于较小特征值 $\sigma_i(t)$ 的方向收敛最慢。若 $H$ 病态且 $t$ 不接近零，优化会受中间分布低方差方向主导。

**命题 3.5（逐模态 SGD 平均动力学）。** 对式（9）使用无偏单样本 SGD，在 $\Sigma_t$ 的特征基下，模态误差满足条件期望

$$
\mathbb E[e_{i,m+1}\mid e_{i,m}]
=(1-2\eta\sigma_i(t))e_{i,m}.
$$

SGD 的均值动力学与 GD 具有相同的模态收缩因子；$\sigma_i(t)$ 较小的方向收缩较慢。固定步长下的稳态方差还取决于随机梯度噪声协方差，不能普遍断言其必然按 $1/\sigma_i(t)$ 缩放。

**注 3.6（分析适用范围）。** 上述 GD/SGD 结果是线性预测器、高斯 FM 条件下的精确总体分析，不是关于全部自适应优化器或任意非线性网络的全局定理。其作用是隔离条件数机制，为后续预条件化提供动机。

### 3.3 高斯混合 FM：多模态性加重瓶颈

将目标扩展为 $K$ 分量高斯混合：

$$
\mathbf x_1\sim\sum_{k=1}^K\pi_k\mathcal N(0,H_k),\qquad
\pi_k>0,\quad\sum_{k=1}^K\pi_k=1. \tag{18}
$$

仍令 $\mathbf x_0\sim\mathcal N(0,I)$，$\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$。该模型在保持解析结构的同时引入多模态，可用来简化表示含多语义类别的数据。

**假设 3.7（理想分量归属）。** 为隔离条件数效应，假设混合分量的责任概率准确已知，使优化可按分量分解。

**命题 3.8（高斯混合 FM 的精确条件均值）。** 定义后验分量权重

$$
w_k(\mathbf x_t,t)=
\Pr(\mathbf x_1\text{ 来自分量 }k\mid\mathbf x_t,t). \tag{19}
$$

则

$$
g_t^\star(\mathbf x_t)=
\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t]
=\sum_{k=1}^K w_k(\mathbf x_t,t)\,A_k^\star(t)\mathbf x_t, \tag{20}
$$

其中

$$
A_k^\star(t)=
[tH_k-(1-t)I][(1-t)^2I+t^2H_k]^{-1}.
$$

在理想分量归属假设下，问题分为 $K$ 个回归子问题，其协方差为 $\Sigma_{t,k}=(1-t)^2I+t^2H_k$，对应特征值 $\sigma_{k,i}(t)=(1-t)^2+t^2\lambda_{k,i}$。

**定理 3.9（最差分量瓶颈）。** 在上述假设下，按分量分解的高斯混合 FM 中，基于梯度的优化由最慢子问题控制。全批量 GD 及 SGD 均值动力学均受到所有分量与方向中最小 $\sigma_{k,i}(t)$ 的约束。因此即便绝大多数混合分量都具有良好条件数，单个病态分量也可能主导整体收敛时间尺度。

**推论 3.10（多模态放大条件数问题）。** 多模态并不能平均抵消条件数的不利影响；整体瓶颈由最难优化的混合分量决定。上述结论在总体、已知分量归属的高斯/高斯混合设置下精确成立，不能直接外推为所有非线性流网络的全局收敛定理。

**图 2：** 二维高斯输运中的预条件化效果。标准 FM 在细长目标分布的窄方向上训练停滞；预条件模型在白化空间学习后逆变换，可降低 MMD 和中间协方差条件数。曲线为 10 个随机种子的均值，阴影为一个标准差。

## 4. 流匹配的预条件化

第 3 节说明 FM 的优化受中间协方差 $\Sigma_t$（高斯）或 $\Sigma_{t,k}$（高斯混合）的条件数制约。自然的对策是在训练主 FM 前，对目标数据应用可逆映射 $P$，使其推前（pushforward）分布更加各向同性。此时主流学习

$$
\mathcal N(0,I)\longrightarrow \tilde{\mathbf x}_1,\qquad
\tilde{\mathbf x}_1=P\mathbf x_1,
$$

生成后再使用 $P^{-1}$ 返回原始空间。本文所称预条件器，是任意能够将目标分布映射到更各向同性表示的可逆或近似可逆变换；既可通过学习获得，也可解析指定。这类似数值线性代数中改善病态线性系统条件数的预条件化。

**定理 4.1（预条件化重塑高斯 FM 路径）。** 对第 3 节的高斯设置，令 $P\in\mathbb R^{d\times d}$ 为任意可逆线性映射，定义

$$
\tilde{\mathbf x}_1=P\mathbf x_1,\qquad
\tilde{\mathbf x}_t=(1-t)\mathbf x_0+t\tilde{\mathbf x}_1.
$$

则变换后的中间协方差为

$$
\tilde\Sigma_t=(1-t)^2I+t^2PHP^\top.
$$

(a) 若精确白化 $P=H^{-1/2}$，则

$$
\tilde\Sigma_t=[(1-t)^2+t^2]I,\qquad
\kappa(\tilde\Sigma_t)=1,\quad\forall t\in[0,1]. \tag{21}
$$

(b) 若存在 $0<m\le M$ 满足 $mI\preceq PHP^\top\preceq MI$，则

$$
(1-t)^2+t^2m\le\lambda_i(\tilde\Sigma_t)\le(1-t)^2+t^2M,
$$

$$
\kappa(\tilde\Sigma_t)\le
\frac{(1-t)^2+t^2M}{(1-t)^2+t^2m}. \tag{22}
$$

将定理 3.3 用于变换后的高斯 FM，优化复杂度取决于 $\kappa(\tilde\Sigma_t)$ 而非原来的 $\kappa(\Sigma_t)$；精确白化可完全消除该条件数瓶颈，近似各向同性化则根据 $PHP^\top$ 的谱质量改善它。对于实际的非线性预条件器，目标并不是绝对高斯化，而是寻找使下游 FM 传输路径显著更好条件化的表示。

**算法 1：Precondition-then-Match（预条件—再匹配）**

1. 给定目标样本 $\{\mathbf x_1^{(i)}\}_{i=1}^N\sim p_1$、标准高斯参考 $p_0$、预条件器类 $P_\phi$ 及主 FM 模型 $v_\theta$。
2. 在目标数据上学习可逆或近似可逆的预条件器 $P_\phi$。
3. 将目标样本变换为 $\tilde{\mathbf x}_1^{(i)}=P_\phi(\mathbf x_1^{(i)})$。
4. 在预条件路径 $\tilde{\mathbf x}_t=(1-t)\mathbf x_0+t\tilde{\mathbf x}_1$ 上训练主流模型，最小化 $\mathbb E\|v_\theta(\tilde{\mathbf x}_t,t)-(\tilde{\mathbf x}_1-\mathbf x_0)\|_2^2$。
5. 推理时抽取 $\mathbf z\sim\mathcal N(0,I)$，在预条件空间中求解已学习的 ODE，得到 $\hat{\tilde{\mathbf x}}_1$。
6. 以逆预条件器映射回原空间：$\hat{\mathbf x}_1=P_\phi^{-1}(\hat{\tilde{\mathbf x}}_1)$，返回生成样本。

这一过程改变了下游主流的学习表示，却不需要改变其原始 FM 目标和采样 ODE。对线性高斯问题，式（21）是理想精确白化；在非线性场景，目标是让经验中间分布的条件数更好，而非要求严格服从高斯。

**FM 特有的推论。** 设 $H=U\Lambda U^\top$，$\mathbf u_i$ 是 $U$ 的第 $i$ 个特征向量。由式（12）得到

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\sum_{i=1}^d\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2,
\quad \sigma_i(t)=(1-t)^2+t^2\lambda_i. \tag{23}
$$

因此 FM 目标不能均匀认证全部方向上的速度场精度。特别地，若固定时间的 FM 超额损失不超过 $\varepsilon$，则只能保证

$$
\|(A-A^\star(t))\mathbf u_i\|_2^2
\le\frac{\varepsilon}{\sigma_i(t)}. \tag{24}
$$

当 $\sigma_i(t)$ 很小时，即使整体损失很小，该方向仍允许较大速度误差。这解释了训练损失近乎饱和但生成质量仍有改进空间的现象：剩余误差可能集中在中间分布弱加权的方向。

此外，若固定时间的损失乘以标量权重 $\alpha(t)>0$，对 $A$ 的 Hessian 也仅随之缩放，条件数仍由 $\kappa(\Sigma_t)$ 控制。时间重加权可改变不同时间的重要程度，但不能消除特定时间的方向刚性。预条件化则直接把路径协方差从 $\Sigma_t$ 改为 $\tilde\Sigma_t$，作用于方向几何而非仅仅重新缩放目标。

**归一化流预条件器。** 使用可逆归一化流 $P_\theta$ 通过最大似然将目标数据映射向标准高斯，采用含雅可比行列式校正的变量变换损失。尽管普通归一化流的表达能力可能低于现代 FM 骨干，其可逆性使它适合预条件阶段：先把目标映射到更各向同性的空间训练主流，再经 $P_\theta^{-1}$ 返回原空间。

**低容量/低精度 FM 预条件器。** 也可以先训练容量受限的 FM 速度场 $v_\eta$，使用逆时间 ODE $d\mathbf x_\tau/d\tau=-v_\eta(\mathbf x_\tau,1-\tau)$ 把目标数据映射回较简单表示，形成 $\tilde{\mathbf x}_1=P_\eta(\mathbf x_1)$。有限容量使第一阶段只捕获粗尺度结构，其输出常比原始数据更接近高斯。再用标准高斯为参考训练主 FM，最终通过 $P_\eta^{-1}$ 生成原空间样本。

## 5. 实验

实验评估预条件化是否在三种设置下改善 FM：（i）可直接观察输运几何的低维受控问题；（ii）可比较多个预条件方案和参数/计算量匹配基线的潜空间 MNIST；（iii）使用流预条件器的多分辨率图像合成。目标不是提出新图像骨干或声称刷新最先进结果，而是检验理论预测：改善目标数据的几何形状能提高中间 FM 回归条件数，进而提升样本质量。

指标包括 Fréchet Inception Distance（FID）和最大均值差异（MMD），用于度量生成分布差异；Precision 和 Recall 分别评价样本保真度及分布覆盖程度。FID/MMD 越低越好，Precision/Recall 越高越好；除另有说明，同一数据集下的对照使用相同下游 FM 生成器。

**受控诊断。** 理论预测低方差方向会抑制优化进展。图 2 的高斯实验证明标准 FM 会快速拟合高方差方向，却在窄方向上停滞；预条件化降低中间协方差条件数和 MMD。图 3 的高斯混合实验还表明，跨越多个分量数与不同条件数配置，预条件化能够降低最差路径条件数、改善低特征值恢复并降低最终 MMD，支持定理 3.9 的最差分量瓶颈。更多 Swiss-roll 可视化见附录 G.1。

**图 3：** 三个各向异性高斯分量上的预条件化效果。标准 FM 能拟合主要高方差方向，却难以恢复狭窄分量；预条件化提高样本对齐、降低训练 MMD、减少小特征值恢复误差和各分量路径条件数。曲线为十次独立实验均值，误差条/阴影为一个标准差。

**MNIST 实验。** 在已训练 VAE 的潜空间中比较预条件化。下游生成器为类别条件 CNN 潜空间 FM；保持其不变以隔离预条件器的贡献。比较无预条件、ZCA 白化、归一化流（NF）预条件及 FM 预条件，并提供参数量匹配的未预条件基线。所有预条件方案都优于原始基线：NF 的 FID/MMD 最好，FM 预条件器的 Precision/Recall 最好；纯粹增加未预条件生成器参数量的收益相对有限，支持几何改善而非单纯容量增加的解释。

**表 1：MNIST 预条件策略比较（原文数值）**

| 预条件方法 | 参数量匹配？ | 参数量 | FID ↓ | MMD (×10⁻³) ↓ | Precision ↑ | Recall ↑ |
|---|---|---:|---:|---:|---:|---:|
| 无预条件 | 否 | 2.32M | 5.97 | 77.10 | 0.5774 | 0.2856 |
| 无预条件 | 是 | 3.37M | 5.42 | 75.46 | 0.5869 | 0.2618 |
| ZCA 白化 | 否 | 2.32M | 4.20 | 6.25 | 0.6022 | 0.3107 |
| ZCA 白化 | 是 | 3.37M | 4.02 | 7.02 | 0.6117 | 0.2885 |
| NF 预条件器 | 否 | 3.37M | 2.74 | 2.95 | 0.7271 | 0.3561 |
| FM 预条件器 | 否 | 3.37M | 3.98 | 3.02 | 0.8440 | 0.5486 |

**多分辨率图像生成。** 下游使用基于 U-Net 或 DiT 的潜流匹配生成器，比较标准 FM 与使用学习式 FM 预条件器的方案。数据集为 $256\times256$ 的 LSUN Churches 与 Oxford Flowers-102、$512\times512$ 的 AFHQ Cats、$32\times32$ 的 CIFAR-10、$64\times64$ 的 ImageNet-1k。除 CIFAR-10 直接在像素空间处理外，其他数据集都使用预训练 VAE 的潜空间。高复杂度图像数据使用基于流的预条件器，而不使用要求特定可逆架构的 NF 预条件器。表 2 显示五个数据集的 FID 都有改善，Precision/Recall 整体也有提升，但个别指标未必同时改善。

**表 2：不同图像数据集的 FID、Precision 与 Recall（原文数值）**

| 数据集 | 方法 | FID ↓ | Precision ↑ | Recall ↑ |
|---|---|---:|---:|---:|
| LSUN Churches 256×256 | 无预条件 | 19.53 | 0.4540 | 0.3239 |
| LSUN Churches 256×256 | FM 预条件器 | 14.47 | 0.5313 | 0.3255 |
| Oxford Flowers-102 256×256 | 无预条件 | 23.82 | 0.5213 | 0.2761 |
| Oxford Flowers-102 256×256 | FM 预条件器 | 22.64 | 0.5428 | 0.2854 |
| AFHQ Cats 512×512 | 无预条件 | 7.11 | 0.7764 | 0.5396 |
| AFHQ Cats 512×512 | FM 预条件器 | 4.86 | 0.8320 | 0.5297 |
| CIFAR-10 32×32 | 无预条件 | 4.15 | 0.8097 | 0.5878 |
| CIFAR-10 32×32 | FM 预条件器 | 4.02 | 0.7856 | 0.5892 |
| ImageNet-1k 64×64 | 无预条件 | 8.66 | 0.7800 | 0.6339 |
| ImageNet-1k 64×64 | FM 预条件器 | 4.98 | 0.8172 | 0.6432 |

**额外分析。** 最优流匹配（Optimal Flow Matching）与预条件化解决不同问题：前者降低随机目标歧义，后者改善超额风险的优化（附录 G.3）。在潜 MNIST 上，降低路径条件数伴随着高低方差特征方向学习更加均衡（G.4—G.5）。模型容量消融排除“只是增加参数”的解释（G.6）；相同主流函数求值次数下，NF 预条件化的 FID 优于一轮 Reflow（G.7）。附录 G.8—G.9 讨论预条件器选择及逆雅可比敏感性，G.10 扩展至条件去模糊和超分辨率；附录 H—J 提供可视化、实现细节和计算资源；附录 B、C 讨论局限与更广泛影响。

## 6. 讨论与结论

本文把流匹配分析为按时间索引的随机回归问题，并证明在高斯及高斯混合情形，病态中间分布会使低方差方向的优化变慢，即使目标速度可被精确表达。由此可见，除模型表达能力外，中间输运分布的几何结构也决定了 FM 的训练效率。这种观点带来 FM 特有的结论：较小 FM 损失可能隐藏方向性速度误差；随时间变化的标量加权无法消除固定时间步的方向刚性；预条件化通过将路径协方差从 $\Sigma_t$ 重塑为条件数更好的 $\tilde\Sigma_t$ 发挥作用。

基于上述分析，本文提出通过可逆目标分布变换改善学习问题几何的预条件—再匹配框架，同时保留标准下游 FM 目标。受控实验和潜空间实验支持这一机制：路径条件数改善、各方向的学习更加均衡，且多个数据集上的样本质量提高。理论与经验结果共同说明，改善学习输运时采用的表示可带来超出单纯扩大模型容量的收益。研究非线性网络的局部几何并开发自适应预条件器，是未来的重要方向。

## 致谢

本研究获加拿大自然科学与工程研究理事会（NSERC）Discovery Grants 计划及 Canada Graduate Scholarships – Master’s（CGS-M）计划资助。作者声明不存在与本工作有关的竞争利益。

## 附录 A：补充相关工作

### 生成模型

生成模型试图学习复杂数据分布，以便合成真实感较高的样本。早期方法包括变分自动编码器和自回归模型等显式密度模型，它们具有基于似然的原则性训练目标 [Kingma and Welling, 2014]。随后的研究提出了通过可逆映射或随机动力学把简单参考分布转换为复杂目标分布的方法，包括归一化流和扩散模型 [Dinh et al., 2017; Ho et al., 2020]。Zhai 等人（2025）的近期工作进一步表明，归一化流本身也可以成为具有很强竞争力的生成模型。流匹配 [Lipman et al., 2023] 则通过学习控制两个分布间连续变换的速度场，提供了另一种生成建模方法。

除了无条件合成，上述生成模型也广泛用于条件生成及特定领域任务。扩散和相关生成模型逐渐应用到计算机视觉、医学成像等多个问题。Lugmayr 等人（2022）将预训练扩散模型用于图像修复；Chen 等人（2023）把目标检测表示为逐步精化边界框预测的去噪过程。医学成像中，Chung 和 Ye（2022）采用基于得分的扩散模型加速 MRI 重建，验证其处理病态逆问题的能力。Ahamed 和 Rahmim（2025）提出类条件反事实扩散框架，用于 PET 图像的弱监督异常检测。这些应用显示，扩散生成模型的用途远不止传统图像合成，还涉及修复、识别、重建和异常检测。

### 预条件化

预条件化是数值分析中的经典技术，目的是改善优化问题 [Ye, 2024] 或微分方程 [Lazzarino et al., 2025] 的条件数，从而加快收敛、增强数值稳定性 [Saad, 2003; Trefethen and Bau, 1997]。通过重新缩放变量或算子，减轻各向异性及曲率差异，预条件化能够提高迭代求解器效率，并使时间积分更加稳定 [Quirynen and Di Cairano, 2020]。

机器学习也存在类似困难：病态优化目标可能妨碍训练，导致优化缓慢或不稳定 [Cao and Zhang, 2025]。因此，大规模学习系统经常以隐式方式（例如自适应优化器）或显式方式（例如依赖问题结构的变量变换）采用预条件化，在收敛速度及鲁棒性方面得到改善 [Dauphin et al., 2014]。对于扩散模型，已有研究表明，恰当的重新参数化与依赖噪声的预条件化能够改善优化行为和样本质量，凸显条件数对生成训练的重要性 [Karras et al., 2022]。

## 附录 B：局限性

理论分析隔离了高斯和高斯混合 FM 的条件数机制。在这两种设置中，可以精确刻画总体目标与优化动力学。这些模型是有意简化的：它们揭示各向异性中间分布如何使一阶优化变慢，但并未为任意非线性神经网络、自适应优化器或大型生成骨干提供全局收敛定理。在实际图像模型中，相关几何结构是局部的、高维的，并随训练而变化，因此文中的条件数诊断应视为对所提机制的经验证据，而不是对整个训练问题完整的谱刻画。

预条件化还引入额外训练阶段，需要选择预条件器架构、容量、训练时长与逆变换精度。计算量匹配实验和消融结果表明，收益不能仅用额外参数数量解释，但预条件器的最佳计算成本—生成质量折中依赖任务。标准 FM 与预条件 FM 均在采样时使用数值 ODE 积分，每一个数值求解步骤都引入可能沿轨迹传播的离散化误差；使用流预条件器还需额外执行一次反向 ODE 求解，因此会出现另一种依赖求解器的误差来源。最后，实验涉及受控分布、潜空间 MNIST 和若干图像数据集；更大规模的条件生成、更强的实际生产级骨干网络，以及标准化计算预算下的比较，有助于明确预条件化何时最有效。未来还可以研究依赖时间或局部自适应的预条件器，以匹配 FM 路径上持续变化的几何结构。

## 附录 C：更广泛的影响

本工作主要研究流匹配的优化几何，是一项理论和方法学研究。潜在积极影响包括使生成建模更加稳定和高效，从而有益于科学建模、图像合成与表示学习。和其他生成模型技术进步一样，相关能力也可能被滥用于生成误导性或欺骗性的合成内容。本文不以这些应用为目标，没有引入已部署系统，并使用标准公开数据集与受控合成实验。

## 附录 D：流匹配作为随机回归及高斯流匹配的证明

### D.1 定理 2.1 的证明

下面证明条件流匹配目标的标准条件均值刻画。令

$
Y:=v_t^\star(\mathbf x_0,\mathbf x_1),\qquad X:=(\mathbf x_t,t). \tag{25}
$

总体目标可以写为

$
\mathcal L(g)=\mathbb E[\|g(X)-Y\|^2]. \tag{26}
$

定义

$
g^\star(X):=\mathbb E[Y\mid X]. \tag{27}
$

则

$
Y=g^\star(X)+(Y-g^\star(X)), \tag{28}
$

并且根据条件均值的定义，

$
\mathbb E[Y-g^\star(X)\mid X]=0. \tag{29}
$

将式（28）代入总体目标并展开平方范数：

$
\mathcal L(g)=\mathbb E[\|g(X)-g^\star(X)+g^\star(X)-Y\|^2], \tag{30}
$

$
\begin{aligned}
\mathcal L(g)=&
\mathbb E[\|g(X)-g^\star(X)\|^2]
+\mathbb E[\|Y-g^\star(X)\|^2]\\
&+2\mathbb E[\langle g(X)-g^\star(X),g^\star(X)-Y\rangle].
\end{aligned}\tag{31}
$

交叉项之所以消失，是因为以 $X$ 为条件时，$g(X)-g^\star(X)$ 已确定，而条件残差具有零均值。具体地，

$
\mathbb E[\langle g(X)-g^\star(X),g^\star(X)-Y\rangle] \tag{32}
$

$
=\mathbb E[\langle g(X)-g^\star(X),\mathbb E[g^\star(X)-Y\mid X]\rangle]=0. \tag{33}
$

因此得到正交分解：

$
\mathcal L(g)=\mathbb E[\|g(X)-g^\star(X)\|^2]
+\mathbb E[\|Y-g^\star(X)\|^2]. \tag{34}
$

第二项就是随机目标在给定 $X$ 时的条件方差迹的期望：

$
\mathbb E[\|Y-g^\star(X)\|^2]
=\mathbb E[\operatorname{Tr}(\operatorname{Cov}(Y\mid X))]. \tag{35}
$

还原 $\mathbf x_t$ 和目标速度的定义，得

$
\begin{aligned}
\mathcal L(g)=&
\mathbb E[\|g(\mathbf x_t,t)-g^\star(\mathbf x_t,t)\|^2]\\
&+\mathbb E[\operatorname{Tr}(\operatorname{Cov}
(v_t^\star(\mathbf x_0,\mathbf x_1)\mid\mathbf x_t,t))].
\end{aligned}\tag{36}
$

这就是正文式（4）。特别地，

$
\mathcal L(g)-\mathcal L(g^\star)=
\mathbb E[\|g(\mathbf x_t,t)-g^\star(\mathbf x_t,t)\|^2]. \tag{37}
$

因此 $g^\star$ 是总体目标的唯一最优预测器（在几乎处处相等的意义下）。

### D.2 定理 3.1 的证明

假设 $\mathbf x_0\sim\mathcal N(0,I)$、$\mathbf x_1\sim\mathcal N(0,H)$ 相互独立，且 $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$。于是交叉二阶矩为零。先计算中间状态协方差：

$
\Sigma_t:=\mathbb E[\mathbf x_t\mathbf x_t^\top]. \tag{38}
$

$
=\mathbb E[((1-t)\mathbf x_0+t\mathbf x_1)((1-t)\mathbf x_0+t\mathbf x_1)^\top]. \tag{39}
$

$
\begin{aligned}
=&(1-t)^2\mathbb E[\mathbf x_0\mathbf x_0^\top]
+t^2\mathbb E[\mathbf x_1\mathbf x_1^\top]\\
&+t(1-t)\mathbb E[\mathbf x_0\mathbf x_1^\top]
+t(1-t)\mathbb E[\mathbf x_1\mathbf x_0^\top].
\end{aligned}\tag{40}
$

$
\Sigma_t=(1-t)^2I+t^2H. \tag{41}
$

其次计算条件目标速度。令 $\mathbf y=\mathbf x_1-\mathbf x_0$；因 $(\mathbf y,\mathbf x_t)$ 联合高斯、均值为零，其条件均值线性地依赖 $\mathbf x_t$：

$
\mathbb E[\mathbf y\mid\mathbf x_t]
=\operatorname{Cov}(\mathbf y,\mathbf x_t)\Sigma_t^{-1}\mathbf x_t. \tag{42}
$

交叉协方差为

$
\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)
=\mathbb E[(\mathbf x_1-\mathbf x_0)((1-t)\mathbf x_0+t\mathbf x_1)^\top]. \tag{43}
$

$
=(1-t)\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_0^\top]
+t\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_1^\top]. \tag{44}
$

独立且零均值给出

$
\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_0^\top]=-I,\quad
\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_1^\top]=H. \tag{45}
$

$
\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)=tH-(1-t)I. \tag{46}
$

故

$
g_t^\star(\mathbf x_t)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t]
=A^\star(t)\mathbf x_t, \tag{47}
$

$
A^\star(t)=[tH-(1-t)I][(1-t)^2I+t^2H]^{-1}. \tag{48}
$

这证明了正文关于目标速度和中间协方差的命题。

### D.3 定理 3.2 的证明

固定 $t\in[0,1]$，定义二次回归损失

$
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{49}
$

记

$
\mathbf y=\mathbf x_1-\mathbf x_0,\qquad
g_t^\star(\mathbf x_t)=A^\star(t)\mathbf x_t=\mathbb E[\mathbf y\mid\mathbf x_t]. \tag{50}
$

由定理 2.1 的条件均值分解，

$
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-A^\star(t)\mathbf x_t\|^2]
+\mathbb E[\operatorname{Tr}(\operatorname{Cov}(\mathbf y\mid\mathbf x_t))]. \tag{51}
$

注意

$
A\mathbf x_t-A^\star(t)\mathbf x_t=(A-A^\star(t))\mathbf x_t. \tag{52}
$

对应平方范数的期望依次转化为

$
\mathbb E[\|(A-A^\star(t))\mathbf x_t\|^2]
=\mathbb E[\mathbf x_t^\top(A-A^\star)^\top(A-A^\star)\mathbf x_t], \tag{53}
$

$
=\mathbb E[\operatorname{Tr}(\mathbf x_t^\top(A-A^\star)^\top(A-A^\star)\mathbf x_t)], \tag{54}
$

$
=\operatorname{Tr}((A-A^\star)^\top(A-A^\star)\mathbb E[\mathbf x_t\mathbf x_t^\top]), \tag{55}
$

$
=\operatorname{Tr}((A-A^\star)^\top(A-A^\star)\Sigma_t), \tag{56}
$

$
=\operatorname{Tr}((A-A^\star)\Sigma_t(A-A^\star)^\top). \tag{57}
$

上式最后一步使用迹的循环不变性；为节省排版，式（53）—（57）中的 $A^\star$ 均指 $A^\star(t)$。于是

$
\begin{aligned}
\mathcal L_t(A)=&\mathbb E[\operatorname{Tr}(\operatorname{Cov}
(\mathbf x_1-\mathbf x_0\mid\mathbf x_t))]\\
&+\operatorname{Tr}((A-A^\star(t))\Sigma_t(A-A^\star(t))^\top).
\end{aligned}\tag{58}
$

由于 $\Sigma_t\succ0$，第二项非负且仅在 $A=A^\star(t)$ 时为零，故最优解唯一。取最优解得到

$
\mathcal L_t(A^\star(t))=
\mathbb E[\operatorname{Tr}(\operatorname{Cov}
(\mathbf x_1-\mathbf x_0\mid\mathbf x_t))]. \tag{59}
$

两式相减，

$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\operatorname{Tr}((A-A^\star(t))\Sigma_t(A-A^\star(t))^\top). \tag{60}
$

这同时证明正文式（10）与式（12）的精确超额风险表达式。

### D.4 定理 3.3 的证明

再次考虑总体损失

$
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{61}
$

令

$
C_t=\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)=tH-(1-t)I. \tag{62}
$

使用矩阵求导公式，

$
\nabla_A\mathcal L_t(A)=2(A\Sigma_t-C_t). \tag{63}
$

步长为 $\eta$ 的全批量梯度下降为

$
A_{k+1}=A_k-2\eta(A_k\Sigma_t-C_t). \tag{64}
$

定义误差

$
E_k=A_k-A^\star(t). \tag{65}
$

利用最优解满足 $A^\star(t)\Sigma_t=C_t$，误差递推逐步化为

$
E_{k+1}=A_{k+1}-A^\star(t), \tag{66}
$

$
=A_k-2\eta(A_k\Sigma_t-C_t)-A^\star(t), \tag{67}
$

$
=A_k-A^\star(t)-2\eta(A_k-A^\star(t))\Sigma_t, \tag{68}
$

$
=E_k(I-2\eta\Sigma_t). \tag{69}
$

故

$
E_{k+1}=E_k(I-2\eta\Sigma_t). \tag{70}
$

由于 $\Sigma_t$ 对称正定，可以正交对角化：

$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top, \tag{71}
$

$
0<\sigma_{\min}(t)\le\sigma_i(t)\le\sigma_{\max}(t). \tag{72}
$

$
I-2\eta\Sigma_t
=U\operatorname{diag}(1-2\eta\sigma_1(t),\ldots,1-2\eta\sigma_d(t))U^\top. \tag{73}
$

每个特征方向的误差收缩因子为

$
|1-2\eta\sigma_i(t)|. \tag{74}
$

最坏收缩因子是

$
\rho(\eta)=\max_i|1-2\eta\sigma_i(t)|
=\max\{|1-2\eta\sigma_{\min}(t)|,|1-2\eta\sigma_{\max}(t)|\}. \tag{75}
$

收敛要求 $\rho(\eta)<1$，等价于

$
0<\eta<\frac{1}{\sigma_{\max}(t)}. \tag{76}
$

固定步长最优化就是最小化

$
\rho(\eta)=\max\{|1-2\eta\sigma_{\min}(t)|,\,
|1-2\eta\sigma_{\max}(t)|\}. \tag{77}
$

最优步长处，两个极端特征方向的收缩幅度相等，符号相反：

$
1-2\eta^\star\sigma_{\min}(t)
=-[1-2\eta^\star\sigma_{\max}(t)]. \tag{78}
$

即

$
1-2\eta^\star\sigma_{\min}(t)
=-1+2\eta^\star\sigma_{\max}(t), \tag{79}
$

$
2=2\eta^\star[\sigma_{\max}(t)+\sigma_{\min}(t)]. \tag{80}
$

所以

$
\eta^\star=\frac1{\sigma_{\max}(t)+\sigma_{\min}(t)}. \tag{81}
$

将其代入式（75）得到

$
\rho^\star=1-2\eta^\star\sigma_{\min}(t)
=1-\frac{2\sigma_{\min}(t)}{\sigma_{\max}(t)+\sigma_{\min}(t)}, \tag{82}
$

$
\rho^\star=\frac{\sigma_{\max}(t)-\sigma_{\min}(t)}
{\sigma_{\max}(t)+\sigma_{\min}(t)}. \tag{83}
$

利用

$
\kappa(\Sigma_t)=\frac{\sigma_{\max}(t)}{\sigma_{\min}(t)}, \tag{84}
$

可写为

$
\rho^\star=\frac{\kappa(\Sigma_t)-1}{\kappa(\Sigma_t)+1}. \tag{85}
$

经过 $k$ 次梯度下降，

$
\|E_k\|\le(\rho^\star)^k\|E_0\|. \tag{86}
$

要将误差缩小为原来的 $\varepsilon\in(0,1)$ 倍，只需

$
(\rho^\star)^k\le\varepsilon. \tag{87}
$

取对数，

$
k\log\rho^\star\le\log\varepsilon. \tag{88}
$

因为 $\log\rho^\star<0$，其充分条件为

$
k\ge\frac{\log(1/\varepsilon)}{-\log\rho^\star}. \tag{89}
$

又有

$
\rho^\star=\frac{\kappa(\Sigma_t)-1}{\kappa(\Sigma_t)+1}
=1-\frac{2}{\kappa(\Sigma_t)+1}. \tag{90}
$

采用标准不等式 $-\log(1-a)\ge a$，令

$
a=\frac{2}{\kappa(\Sigma_t)+1}. \tag{91}
$

则

$
-\log\rho^\star
=-\log\left(1-\frac{2}{\kappa(\Sigma_t)+1}\right)
\ge\frac{2}{\kappa(\Sigma_t)+1}. \tag{92}
$

由此

$
\frac{\log(1/\varepsilon)}{-\log\rho^\star}
\le\frac{\kappa(\Sigma_t)+1}{2}\log(1/\varepsilon). \tag{93}
$

于是可取

$
k\ge\frac{\kappa(\Sigma_t)+1}{2}\log(1/\varepsilon). \tag{94}
$

从而证明迭代复杂度

$
k=O(\kappa(\Sigma_t)\log(1/\varepsilon)). \tag{95}
$

这一证明精确展示固定时间 $t$ 的回归条件数如何决定 GD 收敛时间尺度。

### D.5 推论 3.4 的证明

由定理 3.3，梯度下降误差在 $\Sigma_t$ 的每个特征方向分别收缩；最小特征值对应最慢模态。若 $H$ 病态且 $t$ 不接近零，则

$
\sigma_i(t)=(1-t)^2+t^2\lambda_i \tag{96}
$

继承 $H$ 的特征值差异，因此优化受中间分布的低方差方向支配，证毕。

### D.6 定理 3.5 的证明

固定时间 $t$，对第 $m$ 个单样本，记

$
\mathbf x_t^{(m)}=(1-t)\mathbf x_0^{(m)}+t\mathbf x_1^{(m)},
\qquad\mathbf y^{(m)}=\mathbf x_1^{(m)}-\mathbf x_0^{(m)}. \tag{97}
$

单样本损失为

$
\ell_m(A)=\|A\mathbf x_t^{(m)}-\mathbf y^{(m)}\|^2, \tag{98}
$

其梯度为

$
\nabla_A\ell_m(A)
=2(A\mathbf x_t^{(m)}-\mathbf y^{(m)})(\mathbf x_t^{(m)})^\top. \tag{99}
$

SGD 更新为

$
A_{m+1}=A_m-2\eta(A_m\mathbf x_t^{(m)}-\mathbf y^{(m)})
(\mathbf x_t^{(m)})^\top. \tag{100}
$

记

$
E_m=A_m-A^\star. \tag{101}
$

从递推中减去 $A^\star$：

$
E_{m+1}=A_{m+1}-A^\star, \tag{102}
$

$
=E_m-2\eta E_m\mathbf x_t^{(m)}(\mathbf x_t^{(m)})^\top
-2\eta(A^\star\mathbf x_t^{(m)}-\mathbf y^{(m)})
(\mathbf x_t^{(m)})^\top. \tag{103}
$

在给定当前误差 $E_m$ 的条件下取期望：

$
\begin{aligned}
\mathbb E[E_{m+1}\mid E_m]
=&E_m-2\eta E_m\mathbb E[\mathbf x_t\mathbf x_t^\top]\\
&-2\eta\mathbb E[(A^\star\mathbf x_t-\mathbf y)\mathbf x_t^\top].
\end{aligned}\tag{104}
$

已知

$
\mathbb E[\mathbf x_t\mathbf x_t^\top]=\Sigma_t, \tag{105}
$

以及总体正规方程

$
A^\star\Sigma_t=\operatorname{Cov}(\mathbf y,\mathbf x_t)
=\mathbb E[\mathbf y\mathbf x_t^\top], \tag{106}
$

则

$
\mathbb E[(A^\star\mathbf x_t-\mathbf y)\mathbf x_t^\top]
=A^\star\Sigma_t-\mathbb E[\mathbf y\mathbf x_t^\top]=0. \tag{107}
$

因此

$
\mathbb E[E_{m+1}\mid E_m]=E_m(I-2\eta\Sigma_t). \tag{108}
$

将中间协方差分解为

$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top, \tag{109}
$

定义特征基下的误差矩阵

$
\widetilde E_m:=E_mU. \tag{110}
$

右乘 $U$ 得

$
\mathbb E[\widetilde E_{m+1}\mid E_m]
=\widetilde E_m\operatorname{diag}(1-2\eta\sigma_1(t),\ldots,
1-2\eta\sigma_d(t)). \tag{111}
$

对输出坐标 $k$ 和特征方向 $i$，标量误差为

$
e_{ki,m}:=(\widetilde E_m)_{ki}, \tag{112}
$

满足

$
\mathbb E[e_{ki,m+1}\mid E_m]=(1-2\eta\sigma_i(t))e_{ki,m}. \tag{113}
$

等价地，可把随机递推写成

$
e_{ki,m+1}=(1-2\eta\sigma_i(t))e_{ki,m}+\zeta_{ki,m}, \tag{114}
$

其中零均值随机梯度噪声满足

$
\mathbb E[\zeta_{ki,m}\mid E_m]=0. \tag{115}
$

由式（113）可见，较小的 $\sigma_i(t)$ 对应更慢的平均误差衰减。即使考虑随机梯度，病态中间协方差造成的方向性收敛差异依然存在，从而证明定理 3.5。

**图 4：** 高斯模型中的条件数及优化现象。（a）沿插值路径增长的条件数；（b）$\kappa(H)=1000$ 时中间协方差特征值的分离；（c）不同时刻的协方差椭圆；（d）达到固定精度所需 GD 迭代数；（e）理想白化使路径条件数约为 1；（f）$t=0.9$ 时各模态误差衰减；（g）最优得分场 $s^\star(\mathbf x,t)=-\Sigma_t^{-1}\mathbf x$；（h）最优 FM 速度场 $v^\star(\mathbf x,t)=A^\star(t)\mathbf x$。

## 附录 E：高斯混合流匹配的证明

### E.1 定理 3.8 的证明

假定目标是具有 $K$ 个分量的零均值高斯混合，源分布为标准高斯，使用线性插值：

$
\mathbf x_1\sim\sum_{k=1}^K\pi_k\mathcal N(0,H_k),\quad
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1. \tag{116}
$

令 $Z\in\{1,\ldots,K\}$ 表示 $\mathbf x_1$ 所属的隐含混合分量，满足

$
\Pr(Z=k)=\pi_k. \tag{117}
$

由全期望公式，

$
g_t^\star(\mathbf x_t)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t], \tag{118}
$

$
=\sum_{k=1}^K\Pr(Z=k\mid\mathbf x_t,t)
\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t,Z=k,t]. \tag{119}
$

定义后验分量责任概率

$
w_k(\mathbf x_t,t):=\Pr(Z=k\mid\mathbf x_t,t). \tag{120}
$

给定 $Z=k$，有

$
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_1\sim\mathcal N(0,H_k),\quad
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1. \tag{121}
$

因此可以应用附录 D.2 的单高斯结论：

$
\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t,Z=k,t]
=A_k^\star(t)\mathbf x_t, \tag{122}
$

$
A_k^\star(t)=[tH_k-(1-t)I][(1-t)^2I+t^2H_k]^{-1}. \tag{123}
$

代回全期望式，得到

$
g_t^\star(\mathbf x_t)=\sum_{k=1}^Kw_k(\mathbf x_t,t)A_k^\star(t)\mathbf x_t. \tag{124}
$

故高斯混合 FM 的目标向量场是分量条件线性速度的责任概率加权和。

### E.2 定理 3.9 的证明

在正文假设 3.7 下，各样本的分量归属或责任概率准确已知，从而总体高斯混合 FM 回归可分解为独立的分量回归问题。对于第 $k$ 个分量，中间协方差为

$
\Sigma_{t,k}=(1-t)^2I+t^2H_k. \tag{125}
$

如果 $\lambda_{k,i}$ 是 $H_k$ 的第 $i$ 个特征值，对应中间协方差特征值为

$
\sigma_{k,i}(t)=(1-t)^2+t^2\lambda_{k,i}. \tag{126}
$

每个分量都适用高斯情形的 GD 分析。特别地，

$
E_{k,m+1}=E_{k,m}(I-2\eta\Sigma_{t,k}), \tag{127}
$

所以在特征方向 $i$ 上

$
e_{k,i,m+1}=(1-2\eta\sigma_{k,i}(t))e_{k,i,m}. \tag{128}
$

较小的 $\sigma_{k,i}(t)$ 使该方向的收敛更慢。单样本 SGD 的条件平均误差满足

$
\mathbb E[E_{k,m+1}\mid E_{k,m}]
=E_{k,m}(I-2\eta\Sigma_{t,k}), \tag{129}
$

以及

$
\mathbb E[e_{k,i,m+1}\mid E_{k,m}]
=(1-2\eta\sigma_{k,i}(t))e_{k,i,m}. \tag{130}
$

若希望各混合分量与所有特征方向获得可比较的优化精度，整体时间尺度由最慢的分量模态决定，即

$
\min_{k,i}\sigma_{k,i}(t). \tag{131}
$

因此，即使多数混合分量条件数良好，单个具有很小特征值的分量也可能控制整体优化收敛，证毕。

### E.3 推论 3.10 的证明

由定理 3.9，收敛时间由所有分量的最小模态特征值决定，故多模态结构并不会自动平均掉条件数瓶颈。相反，最难优化的分量可能决定整个系统的训练难度。此结论依赖准确分量归属的假设，不能直接解释为任意复杂高斯混合网络的无条件优化定理。

### E.4 非零均值高斯及高斯混合的扩展

**推论 E.1。** 令 $\mathbf x_0\sim\mathcal N(0,I)$、$\mathbf x_1\sim\mathcal N(\mu,H)$ 独立，$H\succ0$，线性插值得 $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$。定义 $m_t=t\mu$、$\Sigma_t=(1-t)^2I+t^2H$、$C_t=tH-(1-t)I$。总体最优速度由线性变为仿射：

$
g_t^\star(\mathbf x)
=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t=\mathbf x]
=A^\star(t)\mathbf x+b^\star(t),
$

$
A^\star(t)=C_t\Sigma_t^{-1},\quad
b^\star(t)=\mu-A^\star(t)m_t=(1-t)\Sigma_t^{-1}\mu.
$

考虑带截距的损失 $\mathcal L_t(A,b)=\mathbb E[\|A\mathbf x_t+b-(\mathbf x_1-\mathbf x_0)\|_2^2]$，超额风险分解为

$
\mathcal L_t(A,b)-\mathcal L_t(A^\star,b^\star)=
\operatorname{Tr}((A-A^\star)\Sigma_t(A-A^\star)^\top)
+\|(A-A^\star)m_t+(b-b^\star)\|_2^2.
$

等价地，用中心化参数 $A(\mathbf x_t-m_t)+\beta$ 表示预测器，最优截距为 $\beta^\star=\mu$，超额风险变成

$
\widetilde{\mathcal L}_t(A,\beta)-\widetilde{\mathcal L}_t(A^\star,\mu)
=\operatorname{Tr}((A-A^\star)\Sigma_t(A-A^\star)^\top)+\|\beta-\mu\|_2^2.
$

斜率与截距因此解耦：斜率的 GD 仍满足 $E_{\ell+1}=E_\ell(I-2\eta\Sigma_t)$，截距误差的收缩因子为 $1-2\eta$。可见，若先中心化或将截距消去，非零均值不会改变由协方差控制的方向性瓶颈。

对混合分量 $\mathbf x_1\mid Z=k\sim\mathcal N(\mu_k,H_k)$，其分量中间协方差仍是 $\Sigma_{t,k}=(1-t)^2I+t^2H_k$，与均值 $\mu_k$ 无关。条件目标速度为 $A_k^\star(t)\mathbf x+b_k^\star(t)$，其中 $A_k^\star(t)=[tH_k-(1-t)I]\Sigma_{t,k}^{-1}$，$b_k^\star(t)=(1-t)\Sigma_{t,k}^{-1}\mu_k$。故在假设 3.7 下，非零均值不改变各分量收敛率或最差分量结论。

**备注 E.2（均值偏移的影响）。** 若不采用中心化参数化，$(A,b)$ 的 Hessian 与

$
M_t=\begin{pmatrix}
\Sigma_t+m_tm_t^\top&m_t\\
m_t^\top&1
\end{pmatrix}
$

有关，大的均值可能使原始参数化更病态。然而这种影响可以通过显式中心化完全消除；$\kappa(\Sigma_t)$ 带来的方向性刚性则依然存在。对于混合分布，不同均值会影响后验责任概率和模态位置，但不影响单个分量内部的协方差。更大的均值间隔通常还会使假设 3.7 的理想分量归属近似更合理。

证明如下。令 $\mathbf y=\mathbf x_1-\mathbf x_0$，联合高斯的基本矩为 $\mathbb E[\mathbf y]=\mu$、$\mathbb E[\mathbf x_t]=m_t$、$\operatorname{Cov}(\mathbf x_t)=\Sigma_t$、$\operatorname{Cov}(\mathbf y,\mathbf x_t)=C_t$。因此 $\mathbb E[\mathbf y\mid\mathbf x_t=\mathbf x]=\mu+C_t\Sigma_t^{-1}(\mathbf x-m_t)$。由于 $\Sigma_t-tC_t=(1-t)I$，得到上述 $A^\star,b^\star$。令 $\Delta A=A-A^\star$、$\Delta b=b-b^\star$，$\mathbf z_t=\mathbf x_t-m_t$，利用 $\mathbb E[\mathbf z_t]=0$、$\operatorname{Cov}(\mathbf z_t)=\Sigma_t$ 和条件均值正交分解，即得两项超额风险。将同样推导逐分量应用于非零均值高斯混合，完成证明。

## 附录 F：流匹配预条件化的证明

### F.1 定理 4.1 的证明

设源与目标为独立零均值高斯，线性输运为

$
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_1\sim\mathcal N(0,H),\quad
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1. \tag{132}
$

令可逆矩阵 $P\in\mathbb R^{d\times d}$，定义

$
\tilde{\mathbf x}_1=P\mathbf x_1,\qquad
\tilde{\mathbf x}_t=(1-t)\mathbf x_0+t\tilde{\mathbf x}_1. \tag{133}
$

先计算变换后的中间协方差：

$
\tilde\Sigma_t:=\mathbb E[\tilde{\mathbf x}_t\tilde{\mathbf x}_t^\top], \tag{134}
$

$
=\mathbb E[((1-t)\mathbf x_0+tP\mathbf x_1)((1-t)\mathbf x_0+tP\mathbf x_1)^\top], \tag{135}
$

$
=(1-t)^2\mathbb E[\mathbf x_0\mathbf x_0^\top]
+t^2\mathbb E[P\mathbf x_1\mathbf x_1^\top P^\top], \tag{136}
$

$
\quad+t(1-t)\mathbb E[\mathbf x_0\mathbf x_1^\top]P^\top
+t(1-t)P\mathbb E[\mathbf x_1\mathbf x_0^\top], \tag{137}
$

$
\tilde\Sigma_t=(1-t)^2I+t^2PHP^\top. \tag{138}
$

若采用精确白化 $P=H^{-1/2}$，

$
PHP^\top=I, \tag{139}
$

$
\tilde\Sigma_t=(1-t)^2I+t^2I=[(1-t)^2+t^2]I. \tag{140}
$

所有特征值相等，因此

$
\kappa(\tilde\Sigma_t)=1,\qquad t\in[0,1]. \tag{141}
$

对于近似各向同性化，假定存在 $0<m\le M$，满足

$
mI\preceq PHP^\top\preceq MI. \tag{142}
$

利用式（138），有

$
(1-t)^2I+t^2mI\preceq\tilde\Sigma_t
\preceq(1-t)^2I+t^2MI. \tag{143}
$

从而每个特征值满足

$
(1-t)^2+t^2m\le\lambda_i(\tilde\Sigma_t)\le(1-t)^2+t^2M, \tag{144}
$

最终得到

$
\kappa(\tilde\Sigma_t)
\le\frac{(1-t)^2+t^2M}{(1-t)^2+t^2m}. \tag{145}
$

上述三步证明了精确白化可以把路径条件数降为 1，近似白化的改进则取决于 $PHP^\top$ 的谱界。

### F.2 高斯混合预条件化的补充说明

如果能够针对高斯混合的每个分量分别采用白化算子

$
T_k=H_k^{-1/2}, \tag{146}
$

则变换后的分量路径协方差为

$
\tilde\Sigma_{t,k}=[(1-t)^2+t^2]I. \tag{147}
$

所有分量的条件数因此成为 1，不再存在单个病态分量拖慢训练的机制。正文第 4 节主要阐述单高斯情况，是因为其定理表述最简洁。实际训练的非线性预条件器只能看作上述理想分量白化思想的近似推广。

### F.3 条件数理论对于 FM 的特有推论

**推论 F.3.1（较小 FM 损失也可能隐藏方向性速度误差）。** 固定时间的超额风险可以在 $H$ 的特征向量基下展开：

$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\sum_{i=1}^d\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2. \tag{148}
$

由此若超额风险不超过 $\varepsilon$，各方向只能得到较弱的界：

$
\|(A-A^\star(t))\mathbf u_i\|_2^2
\le\frac{\varepsilon}{\sigma_i(t)}. \tag{149}
$

在特征值很小的方向，即使总体 FM 损失已经接近最优，速度场仍可能存在明显误差。

*证明。* 由式（12），

$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\operatorname{Tr}((A-A^\star(t))\Sigma_t(A-A^\star(t))^\top). \tag{150}
$

令

$
\Delta_t:=A-A^\star(t). \tag{151}
$

由于 $H=U\Lambda U^\top$，有

$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top,\quad
\sigma_i(t)=(1-t)^2+t^2\lambda_i. \tag{152}
$

代入二次型：

$
\operatorname{Tr}(\Delta_t\Sigma_t\Delta_t^\top)
=\operatorname{Tr}(\Delta_tU\operatorname{diag}(\sigma_i(t))U^\top\Delta_t^\top). \tag{153}
$

谱分解也可写成

$
U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top
=\sum_{i=1}^d\sigma_i(t)\mathbf u_i\mathbf u_i^\top. \tag{154}
$

所以

$
\operatorname{Tr}(\Delta_t\Sigma_t\Delta_t^\top)
=\sum_{i=1}^d\sigma_i(t)\operatorname{Tr}
(\Delta_t\mathbf u_i\mathbf u_i^\top\Delta_t^\top). \tag{155}
$

每个迹项为

$
\operatorname{Tr}(\Delta_t\mathbf u_i\mathbf u_i^\top\Delta_t^\top)
=\operatorname{Tr}((\Delta_t\mathbf u_i)(\Delta_t\mathbf u_i)^\top)
=\|\Delta_t\mathbf u_i\|_2^2. \tag{156}
$

因而

$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\sum_{i=1}^d\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2. \tag{157}
$

若

$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))\le\varepsilon, \tag{158}
$

注意全部 $\sigma_i(t)>0$，且每项

$
\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2 \tag{159}
$

非负，因此

$
\begin{aligned}
\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2
&\le\sum_{j=1}^d\sigma_j(t)\|(A-A^\star(t))\mathbf u_j\|_2^2\\
&=\mathcal L_t(A)-\mathcal L_t(A^\star(t))\le\varepsilon.
\end{aligned}\tag{160}
$

除以 $\sigma_i(t)$，

$
\|(A-A^\star(t))\mathbf u_i\|_2^2
\le\frac{\varepsilon}{\sigma_i(t)}. \tag{161}
$

即证明式（149）。

**推论 F.3.2（时间标量加权不能消除固定时间的方向刚性）。** 固定 $t$ 并令 $\alpha(t)>0$，考虑

$
\mathcal L_{t,\alpha}(A)=
\alpha(t)\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{162}
$

这种加权同时缩放全部方向的曲率，但不会改变其条件数。

*证明。* 因 $\alpha(t)$ 对于待优化变量 $A$ 是常数，

$
\mathcal L_{t,\alpha}(A)=\alpha(t)\mathcal L_t(A),\quad
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{163}
$

未加权梯度为

$
\nabla_A\mathcal L_t(A)=2(A\Sigma_t-C_t), \tag{164}
$

其中

$
\Sigma_t=\mathbb E[\mathbf x_t\mathbf x_t^\top],\quad
C_t=\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t). \tag{165}
$

加权梯度为

$
\nabla_A\mathcal L_{t,\alpha}(A)
=\alpha(t)\nabla_A\mathcal L_t(A)
=2\alpha(t)(A\Sigma_t-C_t). \tag{166}
$

对任意扰动 $\Delta\in\mathbb R^{d\times d}$，

$
\nabla_A\mathcal L_{t,\alpha}(A+\Delta)
-\nabla_A\mathcal L_{t,\alpha}(A)
=2\alpha(t)\Delta\Sigma_t. \tag{167}
$

因此 Hessian 可视作线性算子

$
\Delta\mapsto2\alpha(t)\Delta\Sigma_t. \tag{168}
$

再把协方差对角化：

$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top. \tag{169}
$

各特征方向的曲率变为

$
2\alpha(t)\sigma_i(t). \tag{170}
$

最大和最小曲率分别为

$
2\alpha(t)\sigma_{\max}(t),\quad
2\alpha(t)\sigma_{\min}(t). \tag{171}
$

故其比值为

$
\frac{2\alpha(t)\sigma_{\max}(t)}
{2\alpha(t)\sigma_{\min}(t)}
=\frac{\sigma_{\max}(t)}{\sigma_{\min}(t)}
=\kappa(\Sigma_t). \tag{172}
$

时间标量加权只改变整体曲率的尺度。等价地，加权 GD 更新为

$
A_{k+1}=A_k-2\eta\alpha(t)(A_k\Sigma_t-C_t). \tag{173}
$

定义

$
E_k=A_k-A^\star(t), \tag{174}
$

得到误差递推

$
E_{k+1}=E_k(I-2\eta\alpha(t)\Sigma_t). \tag{175}
$

在第 $i$ 个特征方向上的收缩因子为

$
1-2\eta\alpha(t)\sigma_i(t). \tag{176}
$

因此，$\alpha(t)$ 只是把有效学习率从 $\eta$ 调整成 $\eta\alpha(t)$，不同方向的相对快慢仍由 $\Sigma_t$ 的谱决定，固定时间下最优步长的迭代复杂度依然取决于 $\kappa(\Sigma_t)$。

## 附录 J：计算资源

论文中的全部实验在一台计算服务器上运行。该服务器配备三张 NVIDIA RTX A6000 GPU，每张具有 48 GB 显存；主机采用两颗 Intel Xeon Gold 5317 CPU，共 24 个物理核心、48 个逻辑处理器，内存为 1 TB，运行 AlmaLinux 9.6。所有模型训练、采样和评价均在该系统上完成。适用时，研究使用三张 GPU 上的分布式数据并行（DDP）训练。上述硬件足以支持论文报告的全部实验。

## 附录 K：已有资产及许可

实验使用已有公开数据集和标准模型组件，并引用所使用的 MNIST、CIFAR-10、ImageNet-1k、LSUN Churches、Oxford Flowers-102 和 AFHQ Cats 原始来源。研究仅将这些资产用于研究与评价，并遵守其相关使用条款。作者还引用了用于把较高分辨率图像编码到潜空间的 Stable Diffusion VAE 检查点（CC BY 4.0）。论文不引入或再分发新的数据集；如发布代码，将对外部代码库和所用程序库及其许可作出注明。

## 附录 I：实验配置（原表 9–10）

**表 9：MNIST 潜空间 FM 实验参数。** 表中的主流模型均为类条件 CNN，主模型采用 7 层卷积、隐藏通道数 256、十类独热编码与 MLP 进行条件化。三种配置均使用 64 维潜空间、正弦/余弦插值及 Adam。

| 参数 | 无预条件 | NF 预条件 | FM 预条件 |
|---|---|---|---|
| 潜空间维度 | 64 | 64 | 64 |
| $s(t)$ | $\sin(\pi t/2)$ | $\sin(\pi t/2)$ | $\sin(\pi t/2)$ |
| $c(t)$ | $\cos(\pi t/2)$ | $\cos(\pi t/2)$ | $\cos(\pi t/2)$ |
| 主 FM 网络 | CNN | CNN | CNN |
| 主 FM 参数量 | 2.32M | 2.32M | 2.32M |
| 主 FM 最大训练轮数 | 1000 | 1000 | 1000 |
| 主 FM 学习率 | $2\times10^{-4}$ | $2\times10^{-4}$ | $10^{-3}$ |
| 主 FM 批量大小 | 4096 | 4096 | 1024 |
| 预条件器网络 | — | RealNVP | CNN |
| 预条件器参数量 | — | 1.05M | 1.05M |
| 预条件器最大训练轮数 | — | 450 | 650 |
| 预条件器学习率 | — | $2\times10^{-4}$ | $10^{-3}$ |
| 预条件器批量大小 | — | 4096 | 1024 |

NF 预条件器具有 8 层耦合层，隐藏 MLP 宽度 256；FM 预条件器具有 7 层卷积、隐藏通道 169。二者均以十类独热编码加 MLP 条件化，并使用 Adam。

**表 10：各图像生成数据集的模型、优化和预条件器参数。**

| 参数 | LSUN Churches | Flowers-102 | AFHQ Cats | CIFAR-10 | ImageNet-1k |
|---|---:|---:|---:|---:|---:|
| 图像分辨率 | 256×256 | 256×256 | 512×512 | 32×32 | 64×64 |
| 训练空间 | 潜空间 | 潜空间 | 潜空间 | 像素空间 | 潜空间 |
| VAE/编码器 | Stable Diffusion VAE | Stable Diffusion VAE | Stable Diffusion VAE | — | Stable Diffusion VAE |
| 潜表示维度 | $4\times32\times32$ | $4\times32\times32$ | $4\times64\times64$ | — | $4\times8\times8$ |
| 主模型 | U-Net | U-Net | DiT-L/2 | U-Net | DiT-B/2 |
| 主模型参数量 | 189M | 189M | 458M | 214M | 130M |
| 主模型最大训练轮数 | 150 | 300 | 50 | 1275 | 350 |
| 主模型学习率 | $5\times10^{-5}$ | $5\times10^{-5}$ | $10^{-4}$ | $2\times10^{-4}$ | $10^{-4}$ |
| 主模型批量大小 | 32 | 32 | 32（16×2） | 512 | 1536 |
| 预条件器 | U-Net | U-Net | U-Net | U-Net | DiT-S/2 |
| 预条件器参数量 | 189M | 189M | 148M | 54M | 33M |
| 预条件器最大训练轮数 | 50 | 100 | 200 | 200 | 200 |
| 预条件器学习率 | $5\times10^{-5}$ | $5\times10^{-5}$ | $10^{-4}$ | $10^{-4}$ | $10^{-4}$ |
| 预条件器批量大小 | 32 | 32 | 32（16×2） | 128 | 1536 |

LSUN Churches、Flowers-102 和 AFHQ Cats 使用 $s(t)=\sin(\pi t/2)$、$c(t)=\cos(\pi t/2)$；CIFAR-10 与 ImageNet-1k 使用 $s(t)=t$、$c(t)=1-t$。表 10 的网络细节还包括 U-Net 的残差块深度、DiT 的注意力头数、patch size 和类别嵌入；这些附加列的原始细目目前需要进一步按原表核对。

## 参考文献及附录（待补）

原稿包含完整英文参考文献以及附录 A—K。已补译附录 A—C、J、K 与原表 9—10；附录 D—H 的证明、长公式、扩展实验和书目仍未完整译录。**这些部分尚未完整译录，不能用上述主体正文代替。** 请以[原文 PDF（45 页）](https://arxiv.org/pdf/2603.02337)为准。

{% endraw %}
