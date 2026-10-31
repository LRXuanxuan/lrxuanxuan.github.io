---
layout: page
title: "Preconditioned Flow Matching：预条件流匹配｜中文全文译稿（逐字符终校待做）"
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
**译稿状态：** 中文译稿已扩展至主体第 1—6 节、全部附录 A—K、全部编号公式（1）—（189）、全部图 1—19 的文字说明、表 1—10，以及原稿全部 45 条英文参考文献。逐自然段与未编号公式、符号、表格全部单元格及图内文字的严格终校仍未通过；原 PDF 为最终核验依据。

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

## 参考文献

以下保留原稿的**英文原题、作者及主要书目信息**，避免在学术检索时将中文译名误认为正式论文题名。原稿采用作者—年份引用方式，故以下依原书目顺序列出，不另造文内编号。

- Shadab Ahamed and Eldad Haber. “Dawn-FM: Data-aware and noise-informed flow matching for solving inverse problems.” arXiv:2412.04766, 2024.
- Shadab Ahamed and Arman Rahmim. “IGCONDA-PET: Weakly-supervised PET anomaly detection using implicitly-guided attention-conditional counterfactual diffusion modeling—a multi-center, multi-cancer, and multi-tracer study.” *Computerized Medical Imaging and Graphics*, 102615, 2025.
- Santiago Aranguri, Giulio Biroli, Marc Mezard, and Eric Vanden-Eijnden. “Optimizing noise schedules of generative models in high dimensions.” arXiv:2501.00988, 2025.
- Michele Benzi. “Preconditioning techniques for large linear systems: A survey.” *Journal of Computational Physics*, 182(2):418–477, 2002. doi:10.1006/jcph.2002.7176.
- Lukas Billera, Hedwig Nora Nordlinder, and Ben Murrell. “Time dependent loss reweighting for flow matching and diffusion models is theoretically justified.” *ICLR 2026 2nd Workshop on Deep Generative Model in Machine Learning: Theory, Principle and Efficacy*, 2026.
- Francisco Caetano, Christiaan Viviers, Peter H. N. De With, and Fons Van der Sommen. “Symmetrical flow matching: Unified image generation, segmentation, and classification with score-based generative models.” *Proceedings of the AAAI Conference on Artificial Intelligence*, 40:2498–2506, 2026.
- Wenbo Cao and Weiwei Zhang. “An analysis and solution of ill-conditioning in physics-informed neural networks.” *Journal of Computational Physics*, 520:113494, 2025.
- Shoufa Chen, Peize Sun, Yibing Song, and Ping Luo. “DiffusionDet: Diffusion model for object detection.” *Proceedings of ICCV*, pp. 19773–19786, 2023.
- Yunjey Choi, Youngjung Uh, Jaejun Yoo, and Jung-Woo Ha. “StarGAN v2: Diverse image synthesis for multiple domains.” *Proceedings of CVPR*, 2020.
- Patryk Chrabaszcz, Ilya Loshchilov, and Frank Hutter. “A downsampled variant of ImageNet as an alternative to the CIFAR datasets.” arXiv:1707.08819, 2017.
- Hyungjin Chung and Jong Chul Ye. “Score-based diffusion models for accelerated MRI.” *Medical Image Analysis*, 80:102479, 2022.
- Danilo Danese, Angela Lombardi, Matteo Attimonelli, Giuseppe Fasano, and Tommaso Di Noia. “Flowlet: Conditional 3D brain MRI synthesis using wavelet flow matching.” arXiv:2601.05212, 2026.
- Quan Dao, Hao Phung, Binh Nguyen, and Anh Tran. “Flow matching in latent space.” arXiv:2307.08698, 2023.
- Yann N. Dauphin, Razvan Pascanu, Caglar Gulcehre, Kyunghyun Cho, Surya Ganguli, and Yoshua Bengio. “Identifying and attacking the saddle point problem in high-dimensional non-convex optimization.” *Advances in Neural Information Processing Systems*, 2014.
- Sascha Diefenbacher, Engin Eren, Gregor Kasieczka, Anatolii Korol, Benjamin Nachman, and David Shih. “DCTRGAN: Improving the precision of generative models with reweighting.” *Journal of Instrumentation*, 15(11):P11004, 2020.
- Laurent Dinh, Jascha Sohl-Dickstein, and Samy Bengio. “Density estimation using Real NVP.” *ICLR*, 2017.
- Gene H. Golub and Qiang Ye. “Inexact preconditioned conjugate gradient method with inner-outer iteration.” *SIAM Journal on Scientific Computing*, 21(4):1305–1320, 1999.
- Wenhao Guan, Kaidi Wang, Wangjin Zhou, Yang Wang, Feng Deng, Hui Wang, Lin Li, Qingyang Hong, and Yong Qin. “LAFMA: A latent flow matching model for text-to-audio generation.” *Interspeech*, 2024.
- Jonathan Ho, Ajay Jain, and Pieter Abbeel. “Denoising diffusion probabilistic models.” *Advances in Neural Information Processing Systems*, 2020.
- Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. “Elucidating the design space of diffusion-based generative models.” *Neural Information Processing Systems*, 2022.
- Agnan Kessy, Alex Lewin, and Korbinian Strimmer. “Optimal whitening and decorrelation.” *The American Statistician*, 72(4):309–314, 2018.
- Diederik P. Kingma and Max Welling. “Auto-encoding variational Bayes.” *International Conference on Learning Representations*, 2014.
- Ivan Kobyzev, Simon J. D. Prince, and Marcus A. Brubaker. “Normalizing flows: An introduction and review of current methods.” *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 43(11):3964–3979, 2020.
- Nikita Kornilov, Petr Mokrov, Alexander Gasnikov, and Alexander Korotin. “Optimal flow matching: Learning straight trajectories in just one step.” *Advances in Neural Information Processing Systems*, 37:104180–104204, 2024.
- Alex Krizhevsky, Geoffrey Hinton, et al. “Learning multiple layers of features from tiny images.” 2009.
- Lorenzo Lazzarino, Yuji Nakatsukasa, and Umberto Zerbinati. “Preconditioned normal equations for solving discretised partial differential equations.” arXiv:2502.17626, 2025.
- Shanchuan Lin and Xiao Yang. “Diffusion model with perceptual loss.” arXiv:2401.00110v7, 2025.
- Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew L. Le. “Flow matching for generative modeling.” *ICLR*, 2023.
- Yaron Lipman, Marton Havasi, Peter Holderrieth, Neta Shaul, Matt Le, Brian Karrer, Ricky T. Q. Chen, David Lopez-Paz, Heli Ben-Hamu, and Itai Gat. “Flow matching guide and code.” arXiv:2412.06264, 2024.
- Xingchao Liu, Chengyue Gong, and Qiang Liu. “Flow straight and fast: Learning to generate and transfer data with rectified flow.” arXiv:2209.03003, 2022.
- Andreas Lugmayr, Martin Danelljan, Andres Romero, Fisher Yu, Radu Timofte, and Luc Van Gool. “RePaint: Inpainting using denoising diffusion probabilistic models.” *CVPR*, pp. 11451–11461, 2022.
- Maria-Elena Nilsback and Andrew Zisserman. “Automated flower classification over a large number of classes.” *ICVGIP*, 2008.
- George Papamakarios, Eric Nalisnick, Danilo Jimenez Rezende, Shakir Mohamed, and Balaji Lakshminarayanan. “Normalizing flows for probabilistic modeling and inference.” *Journal of Machine Learning Research*, 2021.
- Rien Quirynen and Stefano Di Cairano. “PRESAS: Block-structured preconditioning of iterative solvers within a primal active-set method for fast model predictive control.” *Optimal Control Applications and Methods*, 41(6):2282–2307, 2020.
- Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. “High-resolution image synthesis with latent diffusion models.” *CVPR*, pp. 10684–10695, 2022.
- Yousef Saad. “Analysis of some Krylov subspace approximations to the matrix exponential operator.” *SIAM Journal on Numerical Analysis*, 29(1):209–228, 1992.
- Yousef Saad. *Iterative Methods for Sparse Linear Systems*. SIAM, 2003.
- Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. “Score-based generative modeling through stochastic differential equations.” *ICLR*, 2021.
- Lloyd N. Trefethen and David Bau. *Numerical Linear Algebra*. SIAM, 1997.
- Jiayi Wang, Hadrien Reynaud, Franciskus Xaverius Erick, and Bernhard Kainz. “CTFlow: Video-inspired latent flow matching for 3D CT synthesis.” arXiv:2508.12900, 2025.
- Yixian Xu, Shengjie Luo, Liwei Wang, Di He, and Chang Liu. “Diagnosing and improving diffusion models by estimating the optimal loss value.” *ICLR*, 2026.
- Qiang Ye. “Preconditioning for accelerated gradient descent optimization and regularization.” arXiv:2410.00232v2, 2024.
- Fisher Yu, Ari Seff, Yinda Zhang, Shuran Song, Thomas Funkhouser, and Jianxiong Xiao. “LSUN: Construction of a large-scale image dataset using deep learning with humans in the loop.” *CVPR*, 2015.
- Shuangfei Zhai, Ruixiang Zhang, Preetum Nakkiran, David Berthelot, Jiatao Gu, Huangjie Zheng, Tianrong Chen, Miguel Angel Bautista, Navdeep Jaitly, and Joshua M. Susskind. “Normalizing flows are capable generative models.” *ICML*, 2025.
- Mingyuan Zhou, Yi Gu, Huangjie Zheng, Liangchen Song, Guande He, Yizhe Zhang, Wenze Hu, and Yinfei Yang. “Score distillation of flow matching models.” arXiv:2509.25127, 2025.

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

$$
Y:=v_t^\star(\mathbf x_0,\mathbf x_1),\qquad X:=(\mathbf x_t,t). \tag{25}
$$

总体目标可以写为

$$
\mathcal L(g)=\mathbb E[\|g(X)-Y\|^2]. \tag{26}
$$

定义

$$
g^\star(X):=\mathbb E[Y\mid X]. \tag{27}
$$

则

$$
Y=g^\star(X)+(Y-g^\star(X)), \tag{28}
$$

并且根据条件均值的定义，

$$
\mathbb E[Y-g^\star(X)\mid X]=0. \tag{29}
$$

将式（28）代入总体目标并展开平方范数：

$$
\mathcal L(g)=\mathbb E[\|g(X)-g^\star(X)+g^\star(X)-Y\|^2], \tag{30}
$$

$$
\begin{aligned}
\mathcal L(g)=&
\mathbb E[\|g(X)-g^\star(X)\|^2]
+\mathbb E[\|Y-g^\star(X)\|^2]\\
&+2\mathbb E[\langle g(X)-g^\star(X),g^\star(X)-Y\rangle].
\end{aligned}\tag{31}
$$

交叉项之所以消失，是因为以 $X$ 为条件时，$g(X)-g^\star(X)$ 已确定，而条件残差具有零均值。具体地，

$$
\mathbb E[\langle g(X)-g^\star(X),g^\star(X)-Y\rangle] \tag{32}
$$

$$
=\mathbb E[\langle g(X)-g^\star(X),\mathbb E[g^\star(X)-Y\mid X]\rangle]=0. \tag{33}
$$

因此得到正交分解：

$$
\mathcal L(g)=\mathbb E[\|g(X)-g^\star(X)\|^2]
+\mathbb E[\|Y-g^\star(X)\|^2]. \tag{34}
$$

第二项就是随机目标在给定 $X$ 时的条件方差迹的期望：

$$
\mathbb E[\|Y-g^\star(X)\|^2]
=\mathbb E[\operatorname{Tr}(\operatorname{Cov}(Y\mid X))]. \tag{35}
$$

还原 $\mathbf x_t$ 和目标速度的定义，得

$$
\begin{aligned}
\mathcal L(g)=&
\mathbb E[\|g(\mathbf x_t,t)-g^\star(\mathbf x_t,t)\|^2]\\
&+\mathbb E[\operatorname{Tr}(\operatorname{Cov}
(v_t^\star(\mathbf x_0,\mathbf x_1)\mid\mathbf x_t,t))].
\end{aligned}\tag{36}
$$

这就是正文式（4）。特别地，

$$
\mathcal L(g)-\mathcal L(g^\star)=
\mathbb E[\|g(\mathbf x_t,t)-g^\star(\mathbf x_t,t)\|^2]. \tag{37}
$$

因此 $g^\star$ 是总体目标的唯一最优预测器（在几乎处处相等的意义下）。

### D.2 定理 3.1 的证明

假设 $\mathbf x_0\sim\mathcal N(0,I)$、$\mathbf x_1\sim\mathcal N(0,H)$ 相互独立，且 $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$。于是交叉二阶矩为零。先计算中间状态协方差：

$$
\Sigma_t:=\mathbb E[\mathbf x_t\mathbf x_t^\top]. \tag{38}
$$

$$
=\mathbb E[((1-t)\mathbf x_0+t\mathbf x_1)((1-t)\mathbf x_0+t\mathbf x_1)^\top]. \tag{39}
$$

$$
\begin{aligned}
=&(1-t)^2\mathbb E[\mathbf x_0\mathbf x_0^\top]
+t^2\mathbb E[\mathbf x_1\mathbf x_1^\top]\\
&+t(1-t)\mathbb E[\mathbf x_0\mathbf x_1^\top]
+t(1-t)\mathbb E[\mathbf x_1\mathbf x_0^\top].
\end{aligned}\tag{40}
$$

$$
\Sigma_t=(1-t)^2I+t^2H. \tag{41}
$$

其次计算条件目标速度。令 $\mathbf y=\mathbf x_1-\mathbf x_0$；因 $(\mathbf y,\mathbf x_t)$ 联合高斯、均值为零，其条件均值线性地依赖 $\mathbf x_t$：

$$
\mathbb E[\mathbf y\mid\mathbf x_t]
=\operatorname{Cov}(\mathbf y,\mathbf x_t)\Sigma_t^{-1}\mathbf x_t. \tag{42}
$$

交叉协方差为

$$
\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)
=\mathbb E[(\mathbf x_1-\mathbf x_0)((1-t)\mathbf x_0+t\mathbf x_1)^\top]. \tag{43}
$$

$$
=(1-t)\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_0^\top]
+t\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_1^\top]. \tag{44}
$$

独立且零均值给出

$$
\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_0^\top]=-I,\quad
\mathbb E[(\mathbf x_1-\mathbf x_0)\mathbf x_1^\top]=H. \tag{45}
$$

$$
\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)=tH-(1-t)I. \tag{46}
$$

故

$$
g_t^\star(\mathbf x_t)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t]
=A^\star(t)\mathbf x_t, \tag{47}
$$

$$
A^\star(t)=[tH-(1-t)I][(1-t)^2I+t^2H]^{-1}. \tag{48}
$$

这证明了正文关于目标速度和中间协方差的命题。

### D.3 定理 3.2 的证明

固定 $t\in[0,1]$，定义二次回归损失

$$
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{49}
$$

记

$$
\mathbf y=\mathbf x_1-\mathbf x_0,\qquad
g_t^\star(\mathbf x_t)=A^\star(t)\mathbf x_t=\mathbb E[\mathbf y\mid\mathbf x_t]. \tag{50}
$$

由定理 2.1 的条件均值分解，

$$
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-A^\star(t)\mathbf x_t\|^2]
+\mathbb E[\operatorname{Tr}(\operatorname{Cov}(\mathbf y\mid\mathbf x_t))]. \tag{51}
$$

注意

$$
A\mathbf x_t-A^\star(t)\mathbf x_t=(A-A^\star(t))\mathbf x_t. \tag{52}
$$

对应平方范数的期望依次转化为

$$
\mathbb E[\|(A-A^\star(t))\mathbf x_t\|^2]
=\mathbb E[\mathbf x_t^\top(A-A^\star)^\top(A-A^\star)\mathbf x_t], \tag{53}
$$

$$
=\mathbb E[\operatorname{Tr}(\mathbf x_t^\top(A-A^\star)^\top(A-A^\star)\mathbf x_t)], \tag{54}
$$

$$
=\operatorname{Tr}((A-A^\star)^\top(A-A^\star)\mathbb E[\mathbf x_t\mathbf x_t^\top]), \tag{55}
$$

$$
=\operatorname{Tr}((A-A^\star)^\top(A-A^\star)\Sigma_t), \tag{56}
$$

$$
=\operatorname{Tr}((A-A^\star)\Sigma_t(A-A^\star)^\top). \tag{57}
$$

上式最后一步使用迹的循环不变性；为节省排版，式（53）—（57）中的 $A^\star$ 均指 $A^\star(t)$。于是

$$
\begin{aligned}
\mathcal L_t(A)=&\mathbb E[\operatorname{Tr}(\operatorname{Cov}
(\mathbf x_1-\mathbf x_0\mid\mathbf x_t))]\\
&+\operatorname{Tr}((A-A^\star(t))\Sigma_t(A-A^\star(t))^\top).
\end{aligned}\tag{58}
$$

由于 $\Sigma_t\succ0$，第二项非负且仅在 $A=A^\star(t)$ 时为零，故最优解唯一。取最优解得到

$$
\mathcal L_t(A^\star(t))=
\mathbb E[\operatorname{Tr}(\operatorname{Cov}
(\mathbf x_1-\mathbf x_0\mid\mathbf x_t))]. \tag{59}
$$

两式相减，

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\operatorname{Tr}((A-A^\star(t))\Sigma_t(A-A^\star(t))^\top). \tag{60}
$$

这同时证明正文式（10）与式（12）的精确超额风险表达式。

### D.4 定理 3.3 的证明

再次考虑总体损失

$$
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{61}
$$

令

$$
C_t=\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t)=tH-(1-t)I. \tag{62}
$$

使用矩阵求导公式，

$$
\nabla_A\mathcal L_t(A)=2(A\Sigma_t-C_t). \tag{63}
$$

步长为 $\eta$ 的全批量梯度下降为

$$
A_{k+1}=A_k-2\eta(A_k\Sigma_t-C_t). \tag{64}
$$

定义误差

$$
E_k=A_k-A^\star(t). \tag{65}
$$

利用最优解满足 $A^\star(t)\Sigma_t=C_t$，误差递推逐步化为

$$
E_{k+1}=A_{k+1}-A^\star(t), \tag{66}
$$

$$
=A_k-2\eta(A_k\Sigma_t-C_t)-A^\star(t), \tag{67}
$$

$$
=A_k-A^\star(t)-2\eta(A_k-A^\star(t))\Sigma_t, \tag{68}
$$

$$
=E_k(I-2\eta\Sigma_t). \tag{69}
$$

故

$$
E_{k+1}=E_k(I-2\eta\Sigma_t). \tag{70}
$$

由于 $\Sigma_t$ 对称正定，可以正交对角化：

$$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top, \tag{71}
$$

$$
0<\sigma_{\min}(t)\le\sigma_i(t)\le\sigma_{\max}(t). \tag{72}
$$

$$
I-2\eta\Sigma_t
=U\operatorname{diag}(1-2\eta\sigma_1(t),\ldots,1-2\eta\sigma_d(t))U^\top. \tag{73}
$$

每个特征方向的误差收缩因子为

$$
|1-2\eta\sigma_i(t)|. \tag{74}
$$

最坏收缩因子是

$$
\rho(\eta)=\max_i|1-2\eta\sigma_i(t)|
=\max\{|1-2\eta\sigma_{\min}(t)|,|1-2\eta\sigma_{\max}(t)|\}. \tag{75}
$$

收敛要求 $\rho(\eta)<1$，等价于

$$
0<\eta<\frac{1}{\sigma_{\max}(t)}. \tag{76}
$$

固定步长最优化就是最小化

$$
\rho(\eta)=\max\{|1-2\eta\sigma_{\min}(t)|,\,
|1-2\eta\sigma_{\max}(t)|\}. \tag{77}
$$

最优步长处，两个极端特征方向的收缩幅度相等，符号相反：

$$
1-2\eta^\star\sigma_{\min}(t)
=-[1-2\eta^\star\sigma_{\max}(t)]. \tag{78}
$$

即

$$
1-2\eta^\star\sigma_{\min}(t)
=-1+2\eta^\star\sigma_{\max}(t), \tag{79}
$$

$$
2=2\eta^\star[\sigma_{\max}(t)+\sigma_{\min}(t)]. \tag{80}
$$

所以

$$
\eta^\star=\frac1{\sigma_{\max}(t)+\sigma_{\min}(t)}. \tag{81}
$$

将其代入式（75）得到

$$
\rho^\star=1-2\eta^\star\sigma_{\min}(t)
=1-\frac{2\sigma_{\min}(t)}{\sigma_{\max}(t)+\sigma_{\min}(t)}, \tag{82}
$$

$$
\rho^\star=\frac{\sigma_{\max}(t)-\sigma_{\min}(t)}
{\sigma_{\max}(t)+\sigma_{\min}(t)}. \tag{83}
$$

利用

$$
\kappa(\Sigma_t)=\frac{\sigma_{\max}(t)}{\sigma_{\min}(t)}, \tag{84}
$$

可写为

$$
\rho^\star=\frac{\kappa(\Sigma_t)-1}{\kappa(\Sigma_t)+1}. \tag{85}
$$

经过 $k$ 次梯度下降，

$$
\|E_k\|\le(\rho^\star)^k\|E_0\|. \tag{86}
$$

要将误差缩小为原来的 $\varepsilon\in(0,1)$ 倍，只需

$$
(\rho^\star)^k\le\varepsilon. \tag{87}
$$

取对数，

$$
k\log\rho^\star\le\log\varepsilon. \tag{88}
$$

因为 $\log\rho^\star<0$，其充分条件为

$$
k\ge\frac{\log(1/\varepsilon)}{-\log\rho^\star}. \tag{89}
$$

又有

$$
\rho^\star=\frac{\kappa(\Sigma_t)-1}{\kappa(\Sigma_t)+1}
=1-\frac{2}{\kappa(\Sigma_t)+1}. \tag{90}
$$

采用标准不等式 $-\log(1-a)\ge a$，令

$$
a=\frac{2}{\kappa(\Sigma_t)+1}. \tag{91}
$$

则

$$
-\log\rho^\star
=-\log\left(1-\frac{2}{\kappa(\Sigma_t)+1}\right)
\ge\frac{2}{\kappa(\Sigma_t)+1}. \tag{92}
$$

由此

$$
\frac{\log(1/\varepsilon)}{-\log\rho^\star}
\le\frac{\kappa(\Sigma_t)+1}{2}\log(1/\varepsilon). \tag{93}
$$

于是可取

$$
k\ge\frac{\kappa(\Sigma_t)+1}{2}\log(1/\varepsilon). \tag{94}
$$

从而证明迭代复杂度

$$
k=O(\kappa(\Sigma_t)\log(1/\varepsilon)). \tag{95}
$$

这一证明精确展示固定时间 $t$ 的回归条件数如何决定 GD 收敛时间尺度。

### D.5 推论 3.4 的证明

由定理 3.3，梯度下降误差在 $\Sigma_t$ 的每个特征方向分别收缩；最小特征值对应最慢模态。若 $H$ 病态且 $t$ 不接近零，则

$$
\sigma_i(t)=(1-t)^2+t^2\lambda_i \tag{96}
$$

继承 $H$ 的特征值差异，因此优化受中间分布的低方差方向支配，证毕。

### D.6 定理 3.5 的证明

固定时间 $t$，对第 $m$ 个单样本，记

$$
\mathbf x_t^{(m)}=(1-t)\mathbf x_0^{(m)}+t\mathbf x_1^{(m)},
\qquad\mathbf y^{(m)}=\mathbf x_1^{(m)}-\mathbf x_0^{(m)}. \tag{97}
$$

单样本损失为

$$
\ell_m(A)=\|A\mathbf x_t^{(m)}-\mathbf y^{(m)}\|^2, \tag{98}
$$

其梯度为

$$
\nabla_A\ell_m(A)
=2(A\mathbf x_t^{(m)}-\mathbf y^{(m)})(\mathbf x_t^{(m)})^\top. \tag{99}
$$

SGD 更新为

$$
A_{m+1}=A_m-2\eta(A_m\mathbf x_t^{(m)}-\mathbf y^{(m)})
(\mathbf x_t^{(m)})^\top. \tag{100}
$$

记

$$
E_m=A_m-A^\star. \tag{101}
$$

从递推中减去 $A^\star$：

$$
E_{m+1}=A_{m+1}-A^\star, \tag{102}
$$

$$
=E_m-2\eta E_m\mathbf x_t^{(m)}(\mathbf x_t^{(m)})^\top
-2\eta(A^\star\mathbf x_t^{(m)}-\mathbf y^{(m)})
(\mathbf x_t^{(m)})^\top. \tag{103}
$$

在给定当前误差 $E_m$ 的条件下取期望：

$$
\begin{aligned}
\mathbb E[E_{m+1}\mid E_m]
=&E_m-2\eta E_m\mathbb E[\mathbf x_t\mathbf x_t^\top]\\
&-2\eta\mathbb E[(A^\star\mathbf x_t-\mathbf y)\mathbf x_t^\top].
\end{aligned}\tag{104}
$$

已知

$$
\mathbb E[\mathbf x_t\mathbf x_t^\top]=\Sigma_t, \tag{105}
$$

以及总体正规方程

$$
A^\star\Sigma_t=\operatorname{Cov}(\mathbf y,\mathbf x_t)
=\mathbb E[\mathbf y\mathbf x_t^\top], \tag{106}
$$

则

$$
\mathbb E[(A^\star\mathbf x_t-\mathbf y)\mathbf x_t^\top]
=A^\star\Sigma_t-\mathbb E[\mathbf y\mathbf x_t^\top]=0. \tag{107}
$$

因此

$$
\mathbb E[E_{m+1}\mid E_m]=E_m(I-2\eta\Sigma_t). \tag{108}
$$

将中间协方差分解为

$$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top, \tag{109}
$$

定义特征基下的误差矩阵

$$
\widetilde E_m:=E_mU. \tag{110}
$$

右乘 $U$ 得

$$
\mathbb E[\widetilde E_{m+1}\mid E_m]
=\widetilde E_m\operatorname{diag}(1-2\eta\sigma_1(t),\ldots,
1-2\eta\sigma_d(t)). \tag{111}
$$

对输出坐标 $k$ 和特征方向 $i$，标量误差为

$$
e_{ki,m}:=(\widetilde E_m)_{ki}, \tag{112}
$$

满足

$$
\mathbb E[e_{ki,m+1}\mid E_m]=(1-2\eta\sigma_i(t))e_{ki,m}. \tag{113}
$$

等价地，可把随机递推写成

$$
e_{ki,m+1}=(1-2\eta\sigma_i(t))e_{ki,m}+\zeta_{ki,m}, \tag{114}
$$

其中零均值随机梯度噪声满足

$$
\mathbb E[\zeta_{ki,m}\mid E_m]=0. \tag{115}
$$

由式（113）可见，较小的 $\sigma_i(t)$ 对应更慢的平均误差衰减。即使考虑随机梯度，病态中间协方差造成的方向性收敛差异依然存在，从而证明定理 3.5。

**图 4：** 高斯模型中的条件数及优化现象。（a）沿插值路径增长的条件数；（b）$\kappa(H)=1000$ 时中间协方差特征值的分离；（c）不同时刻的协方差椭圆；（d）达到固定精度所需 GD 迭代数；（e）理想白化使路径条件数约为 1；（f）$t=0.9$ 时各模态误差衰减；（g）最优得分场 $s^\star(\mathbf x,t)=-\Sigma_t^{-1}\mathbf x$；（h）最优 FM 速度场 $v^\star(\mathbf x,t)=A^\star(t)\mathbf x$。

## 附录 E：高斯混合流匹配的证明

### E.1 定理 3.8 的证明

假定目标是具有 $K$ 个分量的零均值高斯混合，源分布为标准高斯，使用线性插值：

$$
\mathbf x_1\sim\sum_{k=1}^K\pi_k\mathcal N(0,H_k),\quad
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1. \tag{116}
$$

令 $Z\in\{1,\ldots,K\}$ 表示 $\mathbf x_1$ 所属的隐含混合分量，满足

$$
\Pr(Z=k)=\pi_k. \tag{117}
$$

由全期望公式，

$$
g_t^\star(\mathbf x_t)=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t], \tag{118}
$$

$$
=\sum_{k=1}^K\Pr(Z=k\mid\mathbf x_t,t)
\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t,Z=k,t]. \tag{119}
$$

定义后验分量责任概率

$$
w_k(\mathbf x_t,t):=\Pr(Z=k\mid\mathbf x_t,t). \tag{120}
$$

给定 $Z=k$，有

$$
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_1\sim\mathcal N(0,H_k),\quad
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1. \tag{121}
$$

因此可以应用附录 D.2 的单高斯结论：

$$
\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t,Z=k,t]
=A_k^\star(t)\mathbf x_t, \tag{122}
$$

$$
A_k^\star(t)=[tH_k-(1-t)I][(1-t)^2I+t^2H_k]^{-1}. \tag{123}
$$

代回全期望式，得到

$$
g_t^\star(\mathbf x_t)=\sum_{k=1}^Kw_k(\mathbf x_t,t)A_k^\star(t)\mathbf x_t. \tag{124}
$$

故高斯混合 FM 的目标向量场是分量条件线性速度的责任概率加权和。

### E.2 定理 3.9 的证明

在正文假设 3.7 下，各样本的分量归属或责任概率准确已知，从而总体高斯混合 FM 回归可分解为独立的分量回归问题。对于第 $k$ 个分量，中间协方差为

$$
\Sigma_{t,k}=(1-t)^2I+t^2H_k. \tag{125}
$$

如果 $\lambda_{k,i}$ 是 $H_k$ 的第 $i$ 个特征值，对应中间协方差特征值为

$$
\sigma_{k,i}(t)=(1-t)^2+t^2\lambda_{k,i}. \tag{126}
$$

每个分量都适用高斯情形的 GD 分析。特别地，

$$
E_{k,m+1}=E_{k,m}(I-2\eta\Sigma_{t,k}), \tag{127}
$$

所以在特征方向 $i$ 上

$$
e_{k,i,m+1}=(1-2\eta\sigma_{k,i}(t))e_{k,i,m}. \tag{128}
$$

较小的 $\sigma_{k,i}(t)$ 使该方向的收敛更慢。单样本 SGD 的条件平均误差满足

$$
\mathbb E[E_{k,m+1}\mid E_{k,m}]
=E_{k,m}(I-2\eta\Sigma_{t,k}), \tag{129}
$$

以及

$$
\mathbb E[e_{k,i,m+1}\mid E_{k,m}]
=(1-2\eta\sigma_{k,i}(t))e_{k,i,m}. \tag{130}
$$

若希望各混合分量与所有特征方向获得可比较的优化精度，整体时间尺度由最慢的分量模态决定，即

$$
\min_{k,i}\sigma_{k,i}(t). \tag{131}
$$

因此，即使多数混合分量条件数良好，单个具有很小特征值的分量也可能控制整体优化收敛，证毕。

### E.3 推论 3.10 的证明

由定理 3.9，收敛时间由所有分量的最小模态特征值决定，故多模态结构并不会自动平均掉条件数瓶颈。相反，最难优化的分量可能决定整个系统的训练难度。此结论依赖准确分量归属的假设，不能直接解释为任意复杂高斯混合网络的无条件优化定理。

### E.4 非零均值高斯及高斯混合的扩展

**推论 E.1。** 令 $\mathbf x_0\sim\mathcal N(0,I)$、$\mathbf x_1\sim\mathcal N(\mu,H)$ 独立，$H\succ0$，线性插值得 $\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1$。定义 $m_t=t\mu$、$\Sigma_t=(1-t)^2I+t^2H$、$C_t=tH-(1-t)I$。总体最优速度由线性变为仿射：

$$
g_t^\star(\mathbf x)
=\mathbb E[\mathbf x_1-\mathbf x_0\mid\mathbf x_t=\mathbf x]
=A^\star(t)\mathbf x+b^\star(t),
$$

$$
A^\star(t)=C_t\Sigma_t^{-1},\quad
b^\star(t)=\mu-A^\star(t)m_t=(1-t)\Sigma_t^{-1}\mu.
$$

考虑带截距的损失 $\mathcal L_t(A,b)=\mathbb E[\|A\mathbf x_t+b-(\mathbf x_1-\mathbf x_0)\|_2^2]$，超额风险分解为

$$
\mathcal L_t(A,b)-\mathcal L_t(A^\star,b^\star)=
\operatorname{Tr}((A-A^\star)\Sigma_t(A-A^\star)^\top)
+\|(A-A^\star)m_t+(b-b^\star)\|_2^2.
$$

等价地，用中心化参数 $A(\mathbf x_t-m_t)+\beta$ 表示预测器，最优截距为 $\beta^\star=\mu$，超额风险变成

$$
\widetilde{\mathcal L}_t(A,\beta)-\widetilde{\mathcal L}_t(A^\star,\mu)
=\operatorname{Tr}((A-A^\star)\Sigma_t(A-A^\star)^\top)+\|\beta-\mu\|_2^2.
$$

斜率与截距因此解耦：斜率的 GD 仍满足 $E_{\ell+1}=E_\ell(I-2\eta\Sigma_t)$，截距误差的收缩因子为 $1-2\eta$。可见，若先中心化或将截距消去，非零均值不会改变由协方差控制的方向性瓶颈。

对混合分量 $\mathbf x_1\mid Z=k\sim\mathcal N(\mu_k,H_k)$，其分量中间协方差仍是 $\Sigma_{t,k}=(1-t)^2I+t^2H_k$，与均值 $\mu_k$ 无关。条件目标速度为 $A_k^\star(t)\mathbf x+b_k^\star(t)$，其中 $A_k^\star(t)=[tH_k-(1-t)I]\Sigma_{t,k}^{-1}$，$b_k^\star(t)=(1-t)\Sigma_{t,k}^{-1}\mu_k$。故在假设 3.7 下，非零均值不改变各分量收敛率或最差分量结论。

**备注 E.2（均值偏移的影响）。** 若不采用中心化参数化，$(A,b)$ 的 Hessian 与

$$
M_t=\begin{pmatrix}
\Sigma_t+m_tm_t^\top&m_t\\
m_t^\top&1
\end{pmatrix}
$$

有关，大的均值可能使原始参数化更病态。然而这种影响可以通过显式中心化完全消除；$\kappa(\Sigma_t)$ 带来的方向性刚性则依然存在。对于混合分布，不同均值会影响后验责任概率和模态位置，但不影响单个分量内部的协方差。更大的均值间隔通常还会使假设 3.7 的理想分量归属近似更合理。

证明如下。令 $\mathbf y=\mathbf x_1-\mathbf x_0$，联合高斯的基本矩为 $\mathbb E[\mathbf y]=\mu$、$\mathbb E[\mathbf x_t]=m_t$、$\operatorname{Cov}(\mathbf x_t)=\Sigma_t$、$\operatorname{Cov}(\mathbf y,\mathbf x_t)=C_t$。因此 $\mathbb E[\mathbf y\mid\mathbf x_t=\mathbf x]=\mu+C_t\Sigma_t^{-1}(\mathbf x-m_t)$。由于 $\Sigma_t-tC_t=(1-t)I$，得到上述 $A^\star,b^\star$。令 $\Delta A=A-A^\star$、$\Delta b=b-b^\star$，$\mathbf z_t=\mathbf x_t-m_t$，利用 $\mathbb E[\mathbf z_t]=0$、$\operatorname{Cov}(\mathbf z_t)=\Sigma_t$ 和条件均值正交分解，即得两项超额风险。将同样推导逐分量应用于非零均值高斯混合，完成证明。

## 附录 F：流匹配预条件化的证明

### F.1 定理 4.1 的证明

设源与目标为独立零均值高斯，线性输运为

$$
\mathbf x_0\sim\mathcal N(0,I),\quad
\mathbf x_1\sim\mathcal N(0,H),\quad
\mathbf x_t=(1-t)\mathbf x_0+t\mathbf x_1. \tag{132}
$$

令可逆矩阵 $P\in\mathbb R^{d\times d}$，定义

$$
\tilde{\mathbf x}_1=P\mathbf x_1,\qquad
\tilde{\mathbf x}_t=(1-t)\mathbf x_0+t\tilde{\mathbf x}_1. \tag{133}
$$

先计算变换后的中间协方差：

$$
\tilde\Sigma_t:=\mathbb E[\tilde{\mathbf x}_t\tilde{\mathbf x}_t^\top], \tag{134}
$$

$$
=\mathbb E[((1-t)\mathbf x_0+tP\mathbf x_1)((1-t)\mathbf x_0+tP\mathbf x_1)^\top], \tag{135}
$$

$$
=(1-t)^2\mathbb E[\mathbf x_0\mathbf x_0^\top]
+t^2\mathbb E[P\mathbf x_1\mathbf x_1^\top P^\top], \tag{136}
$$

$$
\quad+t(1-t)\mathbb E[\mathbf x_0\mathbf x_1^\top]P^\top
+t(1-t)P\mathbb E[\mathbf x_1\mathbf x_0^\top], \tag{137}
$$

$$
\tilde\Sigma_t=(1-t)^2I+t^2PHP^\top. \tag{138}
$$

若采用精确白化 $P=H^{-1/2}$，

$$
PHP^\top=I, \tag{139}
$$

$$
\tilde\Sigma_t=(1-t)^2I+t^2I=[(1-t)^2+t^2]I. \tag{140}
$$

所有特征值相等，因此

$$
\kappa(\tilde\Sigma_t)=1,\qquad t\in[0,1]. \tag{141}
$$

对于近似各向同性化，假定存在 $0<m\le M$，满足

$$
mI\preceq PHP^\top\preceq MI. \tag{142}
$$

利用式（138），有

$$
(1-t)^2I+t^2mI\preceq\tilde\Sigma_t
\preceq(1-t)^2I+t^2MI. \tag{143}
$$

从而每个特征值满足

$$
(1-t)^2+t^2m\le\lambda_i(\tilde\Sigma_t)\le(1-t)^2+t^2M, \tag{144}
$$

最终得到

$$
\kappa(\tilde\Sigma_t)
\le\frac{(1-t)^2+t^2M}{(1-t)^2+t^2m}. \tag{145}
$$

上述三步证明了精确白化可以把路径条件数降为 1，近似白化的改进则取决于 $PHP^\top$ 的谱界。

### F.2 高斯混合预条件化的补充说明

如果能够针对高斯混合的每个分量分别采用白化算子

$$
T_k=H_k^{-1/2}, \tag{146}
$$

则变换后的分量路径协方差为

$$
\tilde\Sigma_{t,k}=[(1-t)^2+t^2]I. \tag{147}
$$

所有分量的条件数因此成为 1，不再存在单个病态分量拖慢训练的机制。正文第 4 节主要阐述单高斯情况，是因为其定理表述最简洁。实际训练的非线性预条件器只能看作上述理想分量白化思想的近似推广。

### F.3 条件数理论对于 FM 的特有推论

**推论 F.3.1（较小 FM 损失也可能隐藏方向性速度误差）。** 固定时间的超额风险可以在 $H$ 的特征向量基下展开：

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\sum_{i=1}^d\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2. \tag{148}
$$

由此若超额风险不超过 $\varepsilon$，各方向只能得到较弱的界：

$$
\|(A-A^\star(t))\mathbf u_i\|_2^2
\le\frac{\varepsilon}{\sigma_i(t)}. \tag{149}
$$

在特征值很小的方向，即使总体 FM 损失已经接近最优，速度场仍可能存在明显误差。

*证明。* 由式（12），

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\operatorname{Tr}((A-A^\star(t))\Sigma_t(A-A^\star(t))^\top). \tag{150}
$$

令

$$
\Delta_t:=A-A^\star(t). \tag{151}
$$

由于 $H=U\Lambda U^\top$，有

$$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top,\quad
\sigma_i(t)=(1-t)^2+t^2\lambda_i. \tag{152}
$$

代入二次型：

$$
\operatorname{Tr}(\Delta_t\Sigma_t\Delta_t^\top)
=\operatorname{Tr}(\Delta_tU\operatorname{diag}(\sigma_i(t))U^\top\Delta_t^\top). \tag{153}
$$

谱分解也可写成

$$
U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top
=\sum_{i=1}^d\sigma_i(t)\mathbf u_i\mathbf u_i^\top. \tag{154}
$$

所以

$$
\operatorname{Tr}(\Delta_t\Sigma_t\Delta_t^\top)
=\sum_{i=1}^d\sigma_i(t)\operatorname{Tr}
(\Delta_t\mathbf u_i\mathbf u_i^\top\Delta_t^\top). \tag{155}
$$

每个迹项为

$$
\operatorname{Tr}(\Delta_t\mathbf u_i\mathbf u_i^\top\Delta_t^\top)
=\operatorname{Tr}((\Delta_t\mathbf u_i)(\Delta_t\mathbf u_i)^\top)
=\|\Delta_t\mathbf u_i\|_2^2. \tag{156}
$$

因而

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))
=\sum_{i=1}^d\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2. \tag{157}
$$

若

$$
\mathcal L_t(A)-\mathcal L_t(A^\star(t))\le\varepsilon, \tag{158}
$$

注意全部 $\sigma_i(t)>0$，且每项

$$
\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2 \tag{159}
$$

非负，因此

$$
\begin{aligned}
\sigma_i(t)\|(A-A^\star(t))\mathbf u_i\|_2^2
&\le\sum_{j=1}^d\sigma_j(t)\|(A-A^\star(t))\mathbf u_j\|_2^2\\
&=\mathcal L_t(A)-\mathcal L_t(A^\star(t))\le\varepsilon.
\end{aligned}\tag{160}
$$

除以 $\sigma_i(t)$，

$$
\|(A-A^\star(t))\mathbf u_i\|_2^2
\le\frac{\varepsilon}{\sigma_i(t)}. \tag{161}
$$

即证明式（149）。

**推论 F.3.2（时间标量加权不能消除固定时间的方向刚性）。** 固定 $t$ 并令 $\alpha(t)>0$，考虑

$$
\mathcal L_{t,\alpha}(A)=
\alpha(t)\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{162}
$$

这种加权同时缩放全部方向的曲率，但不会改变其条件数。

*证明。* 因 $\alpha(t)$ 对于待优化变量 $A$ 是常数，

$$
\mathcal L_{t,\alpha}(A)=\alpha(t)\mathcal L_t(A),\quad
\mathcal L_t(A)=\mathbb E[\|A\mathbf x_t-(\mathbf x_1-\mathbf x_0)\|^2]. \tag{163}
$$

未加权梯度为

$$
\nabla_A\mathcal L_t(A)=2(A\Sigma_t-C_t), \tag{164}
$$

其中

$$
\Sigma_t=\mathbb E[\mathbf x_t\mathbf x_t^\top],\quad
C_t=\operatorname{Cov}(\mathbf x_1-\mathbf x_0,\mathbf x_t). \tag{165}
$$

加权梯度为

$$
\nabla_A\mathcal L_{t,\alpha}(A)
=\alpha(t)\nabla_A\mathcal L_t(A)
=2\alpha(t)(A\Sigma_t-C_t). \tag{166}
$$

对任意扰动 $\Delta\in\mathbb R^{d\times d}$，

$$
\nabla_A\mathcal L_{t,\alpha}(A+\Delta)
-\nabla_A\mathcal L_{t,\alpha}(A)
=2\alpha(t)\Delta\Sigma_t. \tag{167}
$$

因此 Hessian 可视作线性算子

$$
\Delta\mapsto2\alpha(t)\Delta\Sigma_t. \tag{168}
$$

再把协方差对角化：

$$
\Sigma_t=U\operatorname{diag}(\sigma_1(t),\ldots,\sigma_d(t))U^\top. \tag{169}
$$

各特征方向的曲率变为

$$
2\alpha(t)\sigma_i(t). \tag{170}
$$

最大和最小曲率分别为

$$
2\alpha(t)\sigma_{\max}(t),\quad
2\alpha(t)\sigma_{\min}(t). \tag{171}
$$

故其比值为

$$
\frac{2\alpha(t)\sigma_{\max}(t)}
{2\alpha(t)\sigma_{\min}(t)}
=\frac{\sigma_{\max}(t)}{\sigma_{\min}(t)}
=\kappa(\Sigma_t). \tag{172}
$$

时间标量加权只改变整体曲率的尺度。等价地，加权 GD 更新为

$$
A_{k+1}=A_k-2\eta\alpha(t)(A_k\Sigma_t-C_t). \tag{173}
$$

定义

$$
E_k=A_k-A^\star(t), \tag{174}
$$

得到误差递推

$$
E_{k+1}=E_k(I-2\eta\alpha(t)\Sigma_t). \tag{175}
$$

在第 $i$ 个特征方向上的收缩因子为

$$
1-2\eta\alpha(t)\sigma_i(t). \tag{176}
$$

因此，$\alpha(t)$ 只是把有效学习率从 $\eta$ 调整成 $\eta\alpha(t)$，不同方向的相对快慢仍由 $\Sigma_t$ 的谱决定，固定时间下最优步长的迭代复杂度依然取决于 $\kappa(\Sigma_t)$。

## 附录 G：扩展实验与结果

### G.1 使用归一化流与低容量 FM 预条件器可视化 Swiss roll 输运

为了直观理解所提方法并隔离其算法效果，作者首先研究二维分布：低维设置允许直接可视化概率密度、输运映射及轨迹。Swiss roll（瑞士卷）是一种弯曲、强各向异性、非高斯流形，沿流形方向分布很长，而在其正交方向高度集中，具有显著尺度差异。即便加入较小的各向同性噪声，这种几何仍难以用简单高斯输运拟合。预条件化的作用是先改善其各向同性，使下游输运问题更容易求解。

基准模型直接从高斯分布向 Swiss roll 进行标准 FM。图 5 显示真实目标样本及标准 FM 生成结果；两者仍有可见差异。作者进一步分别采用归一化流（Normalizing Flow，NF）及低容量 FM 对目标进行预条件变换。

**图 5：** 没有预条件化的 Swiss roll 流匹配。（a）真实目标分布 $x_1\sim p_1$；（b）将高斯源样本 $z$ 输入所学习的流后得到的生成样本 $\hat x_1=\mathrm{Flow}(z)$。

**归一化流预条件器。** 图 6 上半部分先把原数据变换成 $\tilde x=P_\theta(x_1)$。变换后的分布虽然不完全是高斯，但比原始 Swiss roll 更接近各向同性，下游主流只需在这一更简单的空间中拟合。推理时先由标准高斯生成预条件空间的样本，再通过逆 NF 映射回原始空间。与图 5 相比，最终分布更接近真实目标。

**低容量 FM 预条件器。** 第二种实验使用仅含 168 个参数的低容量流 $\mathrm{Flow}_{lc}$。图 6 下半部分显示，即使预条件器参数量很小，第二阶段高容量流的性能也有改善，现象与 NF 预条件化类似。为了定量评价，作者沿数据→高斯与高斯→数据两个方向计算切片 Wasserstein 距离（Sliced-Wasserstein Distance）；两种预条件器均优于不使用预条件的基线，其中 NF 最好。文中将这类改善解释为预条件器与下游 FM 在表达能力上的互补，但并未由此证明标准 FM 的数学零空间必定减小。

**表 3：Swiss roll 数据集两个方向的切片 Wasserstein 距离，越小越好。**

| 比较方向 | 无预条件 | NF 预条件 | FM 预条件 |
|---|---:|---:|---:|
| 高斯 $\to$ 数据，$z\to x_1$ | 0.11 | 0.06 | 0.07 |
| 数据 $\to$ 高斯，$x_1\to z$ | 0.81 | 0.31 | 0.34 |

**图 6：** 预条件化 Swiss roll 输运。上半部分（a）—（d）表示 NF 预条件器：先把目标 $x_1$ 推前为 $\tilde x$，训练主 FM 从高斯生成 $\hat{\tilde x}$，可逆向可视化回高斯，再用 $P_\theta^{-1}$ 生成原数据空间的 $\hat x$。下半部分（e）—（h）使用低容量 FM 预条件器执行对应的变换与逆变换。

### G.2 高斯混合的受控实验：条件数与小特征值恢复

图 7 比较不同分量数、各向异性强度及输运距离的二维高斯混合。每行对应一个 GMM 设置，每列依次为未经预条件的输运样本、预条件输运样本、训练 MMD 曲线、小特征值相对恢复误差和各分量路径最大条件数。十次随机种子独立重复，阴影或误差条显示一个标准差。

在所有展示的 GMM 配置中，预条件化改善了样本与目标的对齐。未经预条件化的 FM 往往能拟合单个分量的高方差延展方向，却不能准确恢复狭窄方向，表现为形状扭曲和较高的小特征值误差。其 MMD 在训练早期快速下降，而后在高于预条件化方案的水平上停滞；与理论中高方差方向先收敛、低方差方向进展缓慢的预测一致。

路径条件数提供了最直接的机制证据：未经预条件的路径继承最难 GMM 分量的各向异性，使 $\max_t\kappa(\Sigma_{t,k})$ 很大；经预条件化后，各分量的最大路径条件数下降，低特征值方向的恢复也改善。因此这些结果不仅是视觉外形变化，还反映了 FM 训练过程中回归几何的变化。

**图 7：** 在多个二维 GMM 配置中比较标准 FM 与预条件 FM 的生成样本、MMD、小特征值恢复误差及各分量最大路径条件数。十次随机重复的均值与标准差同时报告。

### G.3 最优流匹配降低随机目标误差，而预条件化改善超额风险优化

式（4）把 FM 风险分为不可约随机目标误差（ISTE）与超额风险。最优流匹配（Optimal Flow Matching，OFM）[Kornilov et al., 2024] 使用 Monge 型确定性耦合，主要试图降低第一项；预条件化则改善中间分布条件数，旨在降低第二项。由于目标变换本身可能增加 ISTE，本节在六种 GMM 配置中评估这种折中。

比较四个方法：标准 FM、OFM、预条件 FM，以及在预条件空间使用 OFM。最后两者生成的样本均逆变换回原目标空间再计算 MMD。作者采用分箱并归一化的 ISTE 代理指标：在中间位置的分箱中估计目标位移条件协方差，再除以全局目标位移协方差。即使采用确定性 Monge 耦合，由于同一箱内仍含多个不同中间点，该代理指标也可能非零。

结果表明，单纯预条件化在六种配置中均增加分箱 ISTE 代理值及对直线轨迹的偏离，但最终 MMD 仍低于标准 FM。因此，改善生成分布拟合**并不必然依赖降低随机目标歧义**。OFM 及其预条件版本则保持较低 ISTE 代理值；二者结合在六种配置中的五种获得最低的平均最终 MMD，并在全部六种配置的 NFE=8 条件下获得最低 MMD。两个技术因此可互补，而不能简单地相互替代。

须注意，分箱代理不能证明单条轨迹是否彼此交叉；在预条件坐标系中更直的轨迹，经非线性逆预条件器映射后也不一定仍然笔直。

**图 8：** 六种 GMM 配置下，FM、OFM、预条件 FM 与两者组合的最终 MMD、轨迹直线性、分箱归一化 ISTE 代理及 NFE=8 时 MMD；误差条来自十次重复。预条件方法在逆映射回原空间后评价。  
**图 9：** 六种 GMM 配置的真实目标、源样本与四种方法的输运结果。蓝色为源点，绿色为目标点，红色为输运结果，黑色三角标记预条件方法中的变换目标；图中 MMD 的数值单位为 $10^{-3}$。

### G.4 MNIST 与 ImageNet-1k 训练的路径条件数演化

为了直接测量不同时间的输运几何，作者在训练期间选取 $t\in(0,1)$，从中间分布各采样 8192 个 $\mathbf x_t=s(t)\mathbf x_1+c(t)\mathbf x_0$，其中 $\mathbf x_0\sim\mathcal N(0,I)$，$\mathbf x_1$ 均匀来自训练数据：无预条件时为归一化潜表示，预条件时为 $\tilde{\mathbf x}_1=P(\mathbf x_1)$。在展平的潜向量上估计样本协方差，并报告 $\lambda_{\max}(\hat\Sigma_t)/\lambda_{\min}(\hat\Sigma_t)$。为避免数值退化，先添加 $\epsilon I$，其中 $\epsilon=10^{-6}\operatorname{Tr}(\hat\Sigma_t)/D$。

图 10 显示，MNIST 与 ImageNet-1k 的原始潜空间中，$\kappa(\Sigma_t)$ 随 $t\to1$ 增大；NF 和 FM 预条件器都显著降低该条件数，特别是在数据终点附近。MNIST 的 NF 预条件器给出最接近各向同性的路径，与表 1 的生成质量结果相符；ImageNet-1k 则表明同样的几何改善存在于更复杂的高维潜空间中。

**图 10：** （a）MNIST 与（b）ImageNet-1k 潜空间的中间路径协方差条件数 $\kappa(\Sigma_t)$ 随时间变化。预条件方法在临近数据终点时显著减小条件数。

### G.5 MNIST 潜空间中方向学习的机制分析

第 G.4 节说明预条件化能降低中间分布的经验条件数。本节进一步检验一个更直接的预测：非线性神经速度场是否也会先拟合高方差方向，而在低方差方向上收敛缓慢？预条件化能否减弱这种不均衡？分析使用 MNIST 潜流模型训练过程保存的检查点，属于训练后诊断。

设 MNIST 预训练 VAE 的潜向量为 $\mathbf z_1\in\mathbb R^{64}$。标准模型的目标为 $\mathbf z_1$；NF 预条件模型的目标则为 $\tilde{\mathbf z}_1=P_\phi(\mathbf z_1,y)$，其中 $y$ 是数字类别标签。所有诊断均在相应模型实际训练使用的表示空间内计算。设该表示下的训练集大小为 $M$，估计均值与协方差：

$$
\hat\mu=\frac1M\sum_{m=1}^M\mathbf z_1^{(m)},\qquad
\hat H=\frac1{M-1}\sum_{m=1}^M
(\mathbf z_1^{(m)}-\hat\mu)(\mathbf z_1^{(m)}-\hat\mu)^\top. \tag{177}
$$

对 $\hat H=U\Lambda U^\top$ 进行谱分解，按特征值升序排列特征向量；最大八个特征值所对应的方向构成高方差子空间，最小八个特征值所对应方向构成低方差子空间。

MNIST 使用三角插值 $\mathbf x_t=s(t)\mathbf z_1+c(t)\mathbf z_0$，其中 $s(t)=\sin(\pi t/2)$、$c(t)=\cos(\pi t/2)$，$\mathbf z_0\sim\mathcal N(0,I)$。条件目标速度为

$$
v_t^\star=\dot s(t)\mathbf z_1+\dot c(t)\mathbf z_0
=\frac{\pi}{2}[c(t)\mathbf z_1-s(t)\mathbf z_0]. \tag{178}
$$

在矩匹配高斯近似 $\mathbf z_1\sim\mathcal N(\hat\mu,\hat H)$ 下，

$$
\hat\Sigma_t=c(t)^2I+s(t)^2\hat H. \tag{179}
$$

$\hat\Sigma_t$ 与 $\hat H$ 共享特征向量；相应的最优线性速度算子为

$$
\hat A_t^\star=
\frac{\pi}{2}s(t)c(t)(\hat H-I)
[c(t)^2I+s(t)^2\hat H]^{-1}. \tag{180}
$$

训练中的神经速度场通常是非线性的，因此其局部作用由输入 Jacobian 表征。第 $e$ 轮参数模型的 Jacobian 定义为

$$
J_{\theta_e}(\mathbf x_t,y,t)
=\frac{\partial v_{\theta_e}(\mathbf x_t,y,t)}{\partial\mathbf x_t}. \tag{181}
$$

采用精确 Jacobian–向量乘积计算其沿每个协方差特征向量的作用。定义不按协方差加权的方向算子误差：

$$
e_i(t,e)=\frac{1}{N_{\rm probe}}\sum_{n=1}^{N_{\rm probe}}
\|J_{\theta_e}(\mathbf x_t^{(n)},y^{(n)},t)\mathbf u_i
-\hat A_t^\star\mathbf u_i\|_2^2. \tag{182}
$$

每个检查点使用同一组固定探针样本，因此误差变化主要反映已学习速度场的变化，而非抽样变动。对 $t\in\{0.50,0.75,0.90\}$ 分别计算。设 $\mathcal I_{\rm top8}$、$\mathcal I_{\rm bottom8}$ 为最大、最小八个特征值的索引集合：

$$
\mathrm{err}_{\rm top8}(t,e)
=\frac18\sum_{i\in\mathcal I_{\rm top8}}e_i(t,e), \tag{183}
$$

$$
\mathrm{err}_{\rm bottom8}(t,e)
=\frac18\sum_{i\in\mathcal I_{\rm bottom8}}e_i(t,e). \tag{184}
$$

这些误差不按 $\sigma_i(t)$ 加权，因此低方差方向的误差不会因数据方差小而被缩小。方向学习不均衡用比值表示：

$$
R(t,e)=\frac{\mathrm{err}_{\rm bottom8}(t,e)}
{\mathrm{err}_{\rm top8}(t,e)}. \tag{185}
$$

$R\approx1$ 表示两组方向学得近似同样准确；$R\gg1$ 表示高方差方向明显先于低方差方向被学习。

图 11 表明，未经预条件的 FM 高方差方向误差迅速下降并达到低平台，而低方差方向下降慢得多；当 $t$ 靠近数据终点，这种差异更明显，$R$ 可长期显著高于 1。经 NF 预条件化后，高低方差方向的误差很快接近同一量级，$R$ 在多数训练阶段接近 1。改善并非通过牺牲高方差方向精度获得，而是主要改善了原本较慢的低方差方向。

相同训练轨迹下，NF 预条件模型最佳 FID 为 2.74，标准 FM 为 5.97，且前者贯穿训练总体更低。作者不直接比较不同表示空间的原始 FM 损失，因为两个模型所回归的目标速度定义不同；方向误差各自相对所在空间的高斯参考计算，而 FID 则统一在逆预条件并解码后的原图像空间评价。该实验是支持机制的诊断，而非任意非线性速度场的全局收敛证明。

**图 11：** MNIST 潜空间中的方向学习动力学。左列为标准 FM，右列为 NF 预条件 FM；上部比较不同 $t$ 的高/低方差方向算子误差，中部给出不均衡比 $R(t,e)$，下部展示相同训练阶段的 FID。

### G.6 预条件器质量消融：容量与训练轮数

使用 50,000 张生成 MNIST 图像，改变预条件器参数量和训练轮数，评估改善是否必须依赖高容量或近乎完美训练的预条件器。图 12(a) 显示，NF 与 FM 预条件器的容量增加时，FID 都逐步下降。为单独隔离容量，各容量配置的预条件器都训练到相应的收敛检查点，使用定期评估的 FID10k 选择，避免混入训练不足造成的变化。未预条件但参数量匹配的模型则只有较小的 FID 改善，说明收益不只是来自额外容量。

图 12(b) 固定预条件器参数量为 1.05M，仅改变其训练轮数。训练不足的预条件器带来有限改进，训练更充分后 FID 显著下降，但最终收益逐渐饱和；下游 FM 并不要求预条件器严格收敛才能受益。两个消融中 NF 的 FID 最低，FM 预条件器也稳定优于未预条件与参数匹配基线。

**图 12：** MNIST 预条件器质量消融。（a）生成 FID 与预条件器参数量的关系；（b）生成 FID 与预条件器训练轮数的关系。各结果基于 50,000 张生成图像，图中同时给出原始 2.32M 参数和匹配 3.37M 参数的未预条件基线。

### G.7 与 Rectified Flow 和 Reflow 的对照

预条件化与 Reflow [Liu et al., 2022] 修改的输运机制不同。前者在主流训练前变换目标分布，后者先生成模型诱导的源—目标配对，再重新训练 Rectified Flow（RF），以获得更直的轨迹。实验在 MNIST 上进行，Reflow 只执行一轮，主流使用 60 次函数求值（NFE）。

**表 4：预条件化、Rectified Flow 与一次 Reflow 的比较。** NF 的逆变换为直接网络前向，不计入 ODE NFE。

| 方法 | 额外训练 | 额外推理操作 | 主流 NFE | 逆预条件 NFE | 总 NFE | FID ↓ |
|---|---|---|---:|---:|---:|---:|
| FM | 无 | 无 | 60 | 0 | 60 | 5.97 |
| NF 预条件（本文） | 训练 NF 预条件器 | 一次 NF 逆变换 | 60 | 不适用 | 60 | 2.74 |
| FM 预条件（本文） | 训练 FM 预条件器 | 积分逆预条件 ODE | 60 | 60 | 120 | 3.98 |
| RF | 无 | 无 | 60 | 0 | 60 | 6.86 |
| RF + Reflow | 生成配对并重训 RF | 无 | 60 | 0 | 60 | 5.15 |

Reflow 将 RF 的 FID 从 6.86 改善到 5.15，但仍高于两种预条件方案。NF 预条件在质量与推理 ODE 求值次数之间最有利；FM 预条件虽然达到 3.98，却额外需要 60 次逆 ODE 求值。Reflow 不增加推理积分次数，但把额外成本放在配对生成与重训练阶段。由于没有统一训练墙钟时间或 FLOPs，本比较不能证明预条件化的总训练成本更低。

### G.8 预条件器的实际选择与收益受限场景

作者建议首先测量标准 FM 路径的 $\max_t\kappa(\Sigma_t)$；若全局协方差可能掩盖局部各向异性，还需分类别或分量估计。若各向异性主要是整体椭圆结构，可采用仿射或 ZCA 白化；若仍存在局部、分量内的复杂各向异性，可能需要非线性可逆映射。不论选择哪一种，宜优先使用能够明显降低路径条件数、又不使 $\|J_{P^{-1}}\|_2$ 过大的最低容量预条件器。

**表 5：路径条件数降低倍数与各数据集生成质量之间的关系。**

| 数据集 | 空间 | 基线最大路径条件数 | 预条件后 | 降低倍数 | 基线 FID | FM 预条件 FID | 相对改善 | 诊断 |
|---|---|---:|---:|---:|---:|---:|---:|---|
| MNIST | 潜空间 | 52.83 | 2.02 | 26.2× | 5.97 | 3.98 | 33.3% | 有益 |
| LSUN Churches | 潜空间 | 102.63 | 5.54 | 18.53× | 19.53 | 14.47 | 25.9% | 有益 |
| Oxford Flowers-102 | 潜空间 | 83.47 | 47.92 | 1.74× | 23.82 | 22.64 | 5.0% | 收益有限 |
| AFHQ Cats | 潜空间 | 64.75 | 2.36 | 27.44× | 7.11 | 4.86 | 31.6% | 有益 |
| CIFAR-10 | 像素 | 755.92 | 453.68 | 1.67× | 4.15 | 4.02 | 3.1% | 收益有限 |
| ImageNet-1k | 潜空间 | 84.37 | 1.90 | 44.4× | 8.66 | 4.98 | 42.5% | 有益 |

表 5 的经验表明，路径条件数的实际下降比例，比单纯的基线条件数更能预测 FID 改善。在所测试数据中，约 18.5—44.4 倍的条件数下降对应约 25.9%—42.5% 的 FID 改善；低于 2 倍时改善不超过 5%。这些是当前实验的诊断规律，**并非通用阈值**。当基线路径已经良态、试验性预条件器改善有限、或进一步降低条件数要求使用逆映射极不稳定的变换时，预条件收益可能很小。

### G.9 逆预条件器的 Jacobian 敏感性

设 $\mathbf z$ 是预条件空间的终点，$\delta\mathbf z$ 是较小的终点误差。逆映射的一阶展开为

$$
P^{-1}(\mathbf z+\delta\mathbf z)-P^{-1}(\mathbf z)
=J_{P^{-1}}(\mathbf z)\delta\mathbf z+O(\|\delta\mathbf z\|_2^2). \tag{186}
$$

因此局部最坏绝对误差放大由 $\|J_{P^{-1}}\|_2=\sigma_{\max}(J_{P^{-1}})$ 决定；Jacobian 条件数 $\kappa(J_{P^{-1}})=\sigma_{\max}/\sigma_{\min}$ 只描述不同方向放大比例的差异，单独的条件数不等同于绝对误差放大。

**受控 GMM 消融。** 在双峰与各向异性环形 GMM 上改变仿射预条件强度 $\gamma$：$\gamma=0$ 表示无预条件，$\gamma=1$ 表示完全白化。

**表 6：部分仿射预条件化的路径条件数、逆映射敏感性和最终 MMD。** 每项路径条件数与 MMD 均为 3 个随机种子的均值 ± 标准差；仿射情况下逆 Jacobian 数值与位置无关。

| 数据分布 | $\gamma$ | 最大路径条件数 ↓ | $\|J_{P_\gamma^{-1}}\|_2$ ↓ | $\kappa(J_{P_\gamma^{-1}})$ ↓ | 最终 MMD (×10⁻³) ↓ |
|---|---:|---:|---:|---:|---:|
| 双峰 | 0.00 | 849.75 ± 11.14 | 1.00 | 1.00 | 114.69 ± 4.26 |
| 双峰 | 0.25 | 160.02 ± 2.05 | 2.18 | 2.31 | 202.96 ± 10.04 |
| 双峰 | **0.50** | 30.14 ± 0.37 | 4.76 | 5.34 | **55.74 ± 17.32** |
| 双峰 | 0.75 | 5.70 ± 0.06 | 10.39 | 12.35 | 66.88 ± 17.59 |
| 双峰 | 1.00 | 1.21 ± 0.02 | 22.66 | 28.53 | 324.64 ± 5.02 |
| 各向异性环 | 0.00 | 7.95 ± 0.17 | 1.00 | 1.00 | 20.46 ± 2.90 |
| 各向异性环 | **0.25** | 4.71 ± 0.09 | 1.63 | 1.29 | **14.01 ± 4.78** |
| 各向异性环 | 0.50 | 2.80 ± 0.03 | 2.66 | 1.67 | 20.26 ± 5.72 |
| 各向异性环 | 0.75 | 1.68 ± 0.02 | 4.34 | 2.16 | 24.48 ± 10.49 |
| 各向异性环 | 1.00 | 1.19 ± 0.01 | 7.08 | 2.79 | 53.78 ± 15.70 |

完全白化使路径条件数最小，但逆变换的最大放大增益也最高，最终 MMD 反而恶化。最佳结果出现在**部分预条件化**：双峰设置 $\gamma=0.50$ 将最大路径条件数降低 28.2 倍、MMD 降低 51.4%，逆增益为 4.76；环形设置 $\gamma=0.25$ 将 MMD 降低 31.5%，逆增益为 1.63。将终点 RMS 的 $10^{-3}$ 量级扰动加入端点，对 MMD 影响很小。

**MNIST 非线性逆映射。** 对真实预条件样本与主 FM 的生成终点，在每个点上计算精确逆 Jacobian 的奇异值，并比较随机扰动方向与最大右奇异向量方向的有限差分放大。

**表 7：MNIST 学习式非线性预条件器的局部逆映射敏感性。** p95 为 95% 分位数；放大因子为 $\|P^{-1}(\mathbf z+\delta\mathbf z)-P^{-1}(\mathbf z)\|_2/\|\delta\mathbf z\|_2$。

| 评价点 | $\|J_{P^{-1}}\|_2$ 中位 / p95 / 最大 | $\kappa(J_{P^{-1}})$ 中位 / p95 | 随机方向放大 中位 / p95 | 最坏方向放大 中位 / p95 |
|---|---|---|---|---|
| 真实预条件样本 | 2.41 / 2.99 / 3.33 | 275 / 388 | 0.60 / 0.88 | 2.41 / 2.99 |
| 生成终点 | 2.32 / 3.01 / 4.65 | 273 / 379 | 0.66 / 0.95 | 2.32 / 3.01 |

最坏方向的典型增益约为 2.3—3.0，最大观测值 4.65；随机方向扰动一般反而被缩小。两类端点的敏感性相似。较大的 Jacobian 条件数可以与不高的谱范数同时存在，说明方向性各向异性不代表同等严重的绝对误差放大。选择预条件器时应兼顾路径改善和逆映射敏感性。

### G.10 面向条件图像恢复任务的预条件化

本节检验预条件化在必须保存测量信息的条件 FM 任务中是否有效。采用 MNIST 上两个轻量级逆问题，测量模型均为

$$
\mathbf b=A\mathbf x+\boldsymbol\epsilon,\qquad
\boldsymbol\epsilon\sim\mathcal N(0,s^2I). \tag{187}
$$

噪声水平 $s$ 在测量动态范围的 0%—10% 间均匀抽样。任务分别为模糊标准差 $\sigma=3$ 像素的高斯去模糊，以及四倍超分辨率（$A$ 为因子 4 的下采样算子）。

**条件 FM 模型。** 基线使用多尺度 U-Net 参数化 $v_\theta(\mathbf x_t,t,c)$，条件 $c=(A^\top\mathbf b,s)$。采用 Ahamed 和 Haber（2024）的逆问题 FM 表述，终点预测为

$$
\hat{\mathbf x}_1=\mathbf x_t+(1-t)v_\theta(\mathbf x_t,t,c). \tag{188}
$$

训练中还加入测量一致性惩罚 $\|A\hat{\mathbf x}_1-\mathbf b\|_2^2$。预条件模型遵循算法 1，把同一个条件 $c$ 同时提供给预条件器与主流，并在潜空间实施对应一致性惩罚 $\|\hat{\tilde{\mathbf z}}_1-\tilde{\mathbf z}_1\|_2^2$。比较对象包括原始条件 FM 及参数量匹配、训练 FLOPs 匹配的未预条件控制组；评价后验均值的 SSIM/PSNR、后验标准差（样本多样性）与测量失配。

**表 8：MNIST 条件图像恢复比较。** PSNR 对后验均值计算；参数量及训练 FLOPs 相对基线列出。

| 任务 | 方法 | 参数量 / FLOPs | SSIM ↑ | 后验均值 PSNR ↑ | 后验标准差 | 测量失配 (×10⁻³) ↓ |
|---|---|---|---:|---:|---:|---:|
| 去模糊 | 基线 FM | 1.07M / 1.0× | 0.803 | 22.4 | 0.135 | 5.8 |
| 去模糊 | 参数匹配 | 1.50M / 1.0× | 0.756 | 22.6 | 0.156 | 5.8 |
| 去模糊 | FLOPs 匹配 | 1.07M / 1.27× | 0.817 | 22.5 | 0.128 | 5.8 |
| 去模糊 | 预条件（本文） | (1.07+0.44)M / 1.27× | **0.834** | 21.7 | 0.128 | 6.2 |
| 4× 超分辨率 | 基线 FM | 1.07M / 1.0× | 0.685 | 19.8 | 0.195 | 9.6 |
| 4× 超分辨率 | 预条件（本文） | (1.07+0.44)M / 1.27× | **0.708** | 19.2 | 0.203 | 15.4 |

**恢复结果。** 去模糊任务中，预条件方案的 SSIM 优于所有未预条件对照，后验标准差未下降，测量失配相对基线增大约 7%；其早期重建质量在约少 2—3 倍 epoch 的条件下达到相近水平。超分辨率任务在相同 1.27 倍训练 FLOPs 下也改善 SSIM，后验多样性保持相近，但后验均值 PSNR 略降且测量失配明显增大。这说明结构相似性改善与严格测量一致性之间存在任务相关的折中，不能断言所有恢复指标均获提升。

**条件生成下的条件数诊断。** 未预条件时，路径条件数从 $t=0.1$ 的 3.9 增至 $t=0.9$ 的 $7.0\times10^3$，预条件后分别为 3.6 和 $1.7\times10^3$。对于去模糊，目标分布条件数由 $8.0\times10^7$ 降至 $7.8\times10^4$；对于超分辨率则降至 $6.4\times10^4$。预条件器自身是否接收条件也很重要：去掉条件会使边缘分布看似更各向同性（$5.7\times10^4$ 对 $7.5\times10^4$），实际重建却明显恶化。把数字类别当作测量条件的替代，非条件预条件器在最差条件下的条件数高于条件预条件器（$9.5\times10^5$ 对 $4.3\times10^5$），说明边缘各向同性可能掩盖某些条件分布内部的病态性。

进一步测量条件逆预条件器的敏感性：

$$
G=\frac{\|P^{-1}(\tilde{\mathbf z}+\boldsymbol\delta,c)
-P^{-1}(\tilde{\mathbf z},c)\|_2}{\|\boldsymbol\delta\|_2}. \tag{189}
$$

无条件预条件器的 $G=2.3$，具有扰动放大；条件预条件器则收缩，$G=0.37$，在扰动幅度为 $\|\tilde{\mathbf z}\|_2$ 的 1%—10% 时仍稳定。结果说明，给预条件器输入条件信息有助于维持条件相关几何与逆映射稳定性，而不是破坏预条件化收益。应依据最差条件对应的路径条件数及逆变换敏感性选择条件预条件器，而不应仅依靠边缘协方差的各向同性。

## 附录 H：基于流的预条件化生成结果定性对照

### H.1 MNIST

图 13 比较在一个训练好的 MNIST VAE 的 64 维潜空间中，三种 FM 生成策略所得到的数字图像：左侧为未预条件的潜空间 FM（FID=5.97），中间为归一化流（NF）预条件后训练的 FM（FID=2.74），右侧为使用另一个 FM 预条件器的主 FM（FID=3.98）。图像视觉效果与这些 FID 结果一致：预条件模型生成的数字更加清晰，轮廓和笔画结构更加连贯。相应模型训练过程中关于时间 $t$ 的条件数变化已在图 10(a) 展示。

**图 13：MNIST 不同预条件策略的定性结果。** 左列：无预条件基线能生成可辨认的数字，但部分形状不一致、清晰度偏低（FID 5.97）。中列：NF 预条件改善保真度，数字轮廓更规整（FID 2.74）。右列：FM 预条件同样改善一致性与多样性（FID 3.98）。定性结果与定量 FID 趋势一致。

### H.2 不同分辨率图像生成

为展示基于流的预条件化在不同图像规模上的实际效果，作者对 LSUN Churches [Yu et al., 2015]、Oxford Flowers-102 [Nilsback and Zisserman, 2008]、AFHQ Cats [Choi et al., 2020]、CIFAR-10 [Krizhevsky et al., 2009] 及 ImageNet-1k [Chrabaszcz et al., 2017] 提供了定性比较。图 14—19 与表 2 的定量结果互为补充，显示当标准流匹配在视觉上仍有明显缺陷时，额外的预条件流可改善生成结构的一致性。

**图 14：LSUN Churches 定性对照。** 上方为标准 FM，下方为添加预条件流的 FM；预条件方案具有更加清晰的整体建筑结构和更稳定的空间布局。

**图 15：Oxford Flowers-102 定性对照。** 上方为标准 FM，下方为预条件 FM；预条件化使花朵的局部结构更加连贯、视觉一致性更好。

**图 16：AFHQ Cats 定性对照。** 上方为标准 FM，下方为添加额外预条件流生成的猫图像。

**图 17：CIFAR-10 定性对照。** 左侧为标准 FM 生成样本，右侧为增加预条件流的生成样本。

**图 18：ImageNet-1k 定性对照。** 上方为标准 FM，下方为预条件 FM。在相同的下游生成配置下，预条件方法改善视觉一致性与样本保真度。

**图 19：ImageNet-1k 补充定性对照。** 上方为标准 FM，下方为预条件 FM。在相同下游生成配置下，预条件方法改善视觉一致性与样本保真度。

## 附录 I：实验实现细节

### I.1 MNIST

所有 MNIST 实验在训练好的 VAE 潜空间中进行。VAE 是带 Group Normalization（组归一化）和 SiLU 激活函数的深层 ResNet 结构，由多级下采样及上采样 ResBlock 构成编码器和解码器，潜空间维度为 64。训练损失同时使用 MSE 与感知损失，学习率采用余弦衰减，并使用较小权重 $\beta=0.05$ 的 KL 正则化。生成潜变量由 VAE 解码器映射回像素空间后评价。

比较三种策略：无预条件的潜空间 FM、NF 预条件 FM 和 FM 预条件 FM。所有策略使用相同的类条件主生成器：基于 CNN 的潜向量速度场，隐藏通道数 256、七层卷积，通过标签 MLP 接入数字类别独热编码；主生成器参数量均约为 2.32M。因此不同性能不能归因于修改了下游主 FM 的网络骨干。

辅助变换的实现则不同。NF 预条件器采用条件 RealNVP、仿射耦合层及宽度 256 的 MLP，参数约 1.05M。FM 预条件器先训练一个较小的类条件 CNN 向量场，隐藏通道数为 169，参数约 1.05M，再在其变换后的潜分布上训练主 FM。相对于主生成器，预条件阶段使用更小模型，但足以改变下游回归问题的几何结构。确切架构、潜维度、插值函数、学习率、批大小、轮数和参数量汇总于表 9。

### I.2 不同分辨率图像合成

实验包括五个数据集：LSUN Churches（256×256）、Oxford Flowers-102（256×256）、AFHQ Cats（512×512）、CIFAR-10（32×32）及 ImageNet-1k（64×64）。前四者中的前三个及 ImageNet-1k 在预训练 Stable Diffusion VAE 的潜空间中训练 [Rombach et al., 2022]，分辨率分别压缩为 $4\times32\times32$、$4\times32\times32$、$4\times64\times64$、$4\times8\times8$。CIFAR-10 则直接在其原始 $32\times32$ 像素空间中训练。

主生成器与预条件器的架构根据数据规模选择。LSUN Churches 和 Oxford Flowers-102 在 VAE 潜空间中均使用 U-Net 作为主生成器及预条件器，预条件器训练轮数较少。AFHQ Cats 使用 U-Net 预条件器及 DiT-L/2 主生成器。CIFAR-10 在像素空间使用类条件 U-Net，并通过减小基础通道数构造更小的预条件器。ImageNet-1k 使用 DiT-B/2 主生成器及 DiT-S/2 预条件器。

对于各数据集，标准 FM 与预条件 FM 的主生成器配置相同。后者先训练辅助流，把数据分布变换到条件数更好的表示空间，再训练主 FM；推理时用逆预条件流将生成样本返回原空间。通过更小的网络容量或更少的训练轮数，预条件阶段可以比主生成器训练便宜，同时仍能改善下游回归几何。全部具体架构、训练表示、插值函数、潜维度、学习率、批大小及训练轮数列于原稿表 10。

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


## 附录 J：计算资源

论文中的全部实验在一台计算服务器上运行。该服务器配备三张 NVIDIA RTX A6000 GPU，每张具有 48 GB 显存；主机采用两颗 Intel Xeon Gold 5317 CPU，共 24 个物理核心、48 个逻辑处理器，内存为 1 TB，运行 AlmaLinux 9.6。所有模型训练、采样和评价均在该系统上完成。适用时，研究使用三张 GPU 上的分布式数据并行（DDP）训练。上述硬件足以支持论文报告的全部实验。

## 附录 K：已有资产及许可

实验使用已有公开数据集和标准模型组件，并引用所使用的 MNIST、CIFAR-10、ImageNet-1k、LSUN Churches、Oxford Flowers-102 和 AFHQ Cats 原始来源。研究仅将这些资产用于研究与评价，并遵守其相关使用条款。作者还引用了用于把较高分辨率图像编码到潜空间的 Stable Diffusion VAE 检查点（CC BY 4.0）。论文不引入或再分发新的数据集；如发布代码，将对外部代码库和所用程序库及其许可作出注明。

{% endraw %}
