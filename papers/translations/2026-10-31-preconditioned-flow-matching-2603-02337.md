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
**译稿状态：** 主体 1—6 节已翻译为中文技术稿，并录入核心公式与实验主表；附录 A—J、全部证明细节、附录数据表和完整英文参考书目尚未逐段补齐，因此**不是最终全文译文**。少数标题/定理编号以原文为准。

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

## 参考文献及附录（待补）

原稿包含完整英文参考文献以及长附录 A—J、严格证明、实验配置和扩展数据。**这些部分尚未完整译录，不能用上述主体正文代替。** 请以[原文 PDF（45 页）](https://arxiv.org/pdf/2603.02337)为准。

{% endraw %}
