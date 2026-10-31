---
layout: page
title: "曲率自适应管状修正的几何感知扩散引导｜中文全文译文"
permalink: /papers/translations/2026-09-24-2609-21251-geometry-aware-diffusion-guidance-via-curvature-adaptive-tubular-corre/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a288be10790c6d1b/) · [原文 arXiv](https://arxiv.org/abs/2609.21251) · [全部目录](/papers/catalog/)

# 曲率自适应管状修正的几何感知扩散引导

**原题：** Geometry-Aware Diffusion Guidance via Curvature-Adaptive Tubular Correction  
**作者：** Enze Jiang、Jinwei He、Zheng Ma  
**单位：** 上海交通大学数学科学学院（School of Mathematical Sciences, Shanghai Jiao Tong University），中国上海。邮箱：geguojia@sjtu.edu.cn、hjw10086@sjtu.edu.cn、zhengma@sjtu.edu.cn。  
**版本：** arXiv:2609.21251v1（cs.CV），2026 年 9 月 18 日；预印本标注日期 2026 年 9 月 21 日；原文 23 页（正文 + 参考文献 + 附录 A—B）。  
**范围与状态：** 全文中文译稿：摘要、第 1—6 节（含 2.1—2.2、4.1—4.2、5.1—5.5（含 5.5.1—5.5.2））、算法 1、致谢、图 1—11 中文图注、表 1—8 逐格转录、参考文献 [1]—[31]（英文原条目，按原编号）、附录 A（A.1—A.3 证明）与附录 B（可复现性与超参数）均按原文结构录入；逐句逐式终校未做。

## 摘要

基于梯度引导的扩散采样器为逆问题与条件生成提供了灵活先验，但强引导会把采样轨迹推入学习到的 score 支撑较差的区域。现有的切向投影策略只限制相对等密度曲面的一阶偏离，却丢弃了可能有用的法向运动，也忽略了曲面上切向运动引起的二阶偏离。我们提出**曲率自适应管状修正（curvature-adaptive tubular correction, CAT）**——一种无需训练的插件，在共享的、与噪声相关的几何预算内同时调控这两种效应。CAT 把引导梯度分解为法向与切向分量：法向位移按一阶计入预算，切向位移则按方向曲率计入，并从一维对偶方程中获得二者的联合最优幅度。Armijo 回溯根据实际引导目标校准所得的有限步长，而无矩阵方向导数避免了构造完整 score Jacobian。我们建立了管状近似的局部保证、修正的唯一性以及目标的充分下降。在 FFHQ 与 ImageNet 上的七个逆问题中，CAT 改进了所评估的像素空间与潜空间宿主采样器，在感知指标上增益尤为一致。它还把 InverseBench 上的黑洞重建结果进一步提升，并在所有测试的无分类器引导尺度下取得所比较方法中最低的 FID，同时保持稳定的饱和度与对比度。这些结果支持把曲率感知的管状控制作为一种可复用的、稳定扩散引导的机制。

## 1 引言

扩散模型是从来不完全、模糊或非线性测量中恢复图像的强大先验，因为单个预训练模型可跨前向算子复用而无需任务特定重训练 [1, 2, 3, 4]。其影响日益扩展到科学与医学逆问题，包括 PDE 约束反演 [5]、全波形反演 [6, 7]、加速 MRI [8] 以及 3D CT/MRI 重建 [9]。基于梯度引导的后验采样器通过在反向扩散中插入可微的测量目标来利用这种灵活性 [10]。其核心困难在于：既要足够强地施加观测以求解逆问题，又不能使演化中的样本远离学习先验表示良好的区域。

这一困难既是几何的也是数值的。远离高概率含噪数据区域的引导状态在 score 训练时受到的监督较少，因此激进的测量更新会暴露约束较差的 score 估计并累积伪影。流形约束与在流形上的方法降低了这一风险 [11, 12]，而基于 score 的投影通过去掉测量梯度中与 score 平行的分量，获得局部切向更新 [13]。然而，精确切向投影可能移除由法向分量携带的测量信息。此外，相切只在**一阶**意义上保持等密度曲面：在曲面上，有限的切向步会造成二阶法向偏离。单一的各向同性步长或硬切向投影都无法同时顾及这两种效应。

我们用**曲率自适应管状修正（CAT）**解决该问题，它是面向梯度引导扩散求解器的无需训练插件。CAT 用局部等密度曲面周围一个与噪声相关的**管（tube）**代替精确的曲面保持。在每个反向步，它把引导梯度分解为法向与切向分量，并在二者之间分配共享的偏离预算：法向位移在一阶消耗管厚，而切向位移按其方向曲率在二阶计费。该表述保留了有用的法向引导，同时抑制任一方向上几何代价过高的运动。

由此得到的修正既易于处理又被显式控制。我们把分量分配表述为具有唯一解的凸子问题，该解由标量对偶方程给出。由于管只是局部近似、且初始宿主步可能仍然过大，我们采用 Armijo 回溯，要求实际引导目标充分下降，同时保持二阶管模型的可行性。在实现上，CAT 只需由自动微分得到的方向曲率，而无需完整 score Jacobian，且所有运算都在宿主求解器的工作变量中进行，因而在像素空间与潜空间中可采用相同的构造。图 1 概括了所得的一步几何。

我们把 CAT 挂载到像素空间 DPS 采样器以及潜空间 PSLD 与 ReSample 采样器上，在 FFHQ 与 ImageNet 上的七个逆问题中评估它。CAT 改进了每个被评估的宿主—任务组合，LPIPS 与 FID 的下降尤为一致，并在引导强度、管半径与测量噪声的扫描中保持有效。分量消融表明，单独的 Armijo 回溯、一阶管状控制与仅切向投影都不及完整方法。除自然图像恢复之外，DPS+CAT 在两种观测时间下都把 InverseBench 黑洞成像相对其宿主提升了图像保真度；在无分类器文本到图像生成中，CFG+CAT 在每个测试的引导尺度下都取得最低 FID，同时保持饱和度与对比度稳定。我们的贡献是：

- 我们提出扩散引导的**二阶管状视角**，它联合控制一阶法向偏离与曲率诱导的切向偏离，而不丢弃引导梯度的任一分量。
- 我们推导出唯一的标量对偶修正，将其与 Armijo 有限步校准配对，并建立管状近似与测量下降的局部保证。
- 我们给出无矩阵、无需训练的实现，并通过广泛比较、鲁棒性分析与针对性消融，验证其在像素与潜空间逆求解器、科学成像以及无分类器引导中的可复用性。

## 2 预备知识

### 2.1 扩散模型

扩散模型通过高斯扰动过程 $x_t=\mu_t x_0+\sigma_t\epsilon$（$\epsilon\sim\mathcal N(0,I_n)$）表示数据先验，并学习 score 模型 $s_\theta(x,t)\approx\nabla_x\log p_t(x)$ 以反转该过程 [1, 2]。对连续时间前向 SDE $dx=f(x,t)dt+g(t)dw_t$，反向漂移为 $f(x,t)-g(t)^2\nabla_x\log p_t(x)$；用 $s_\theta$ 替换精确 score 即得实用的生成采样器。同一 score 还给出 Tweedie 估计

$$
\hat x_{0,\theta}(x_t,t)=\frac{x_t+\sigma_t^2s_\theta(x_t,t)}{\mu_t}\approx\mathbb E[x_0\mid x_t],\tag{1}
$$

它把含噪扩散状态映射到测量算子所作用的干净域。

### 2.2 扩散后验采样

扩散后验采样（diffusion posterior sampling, DPS）从测量 $y=A(x_0)+\xi$ 中恢复 $x_0$，其中 $A:\mathbb R^n\to\mathbb R^m$ 是已知可微算子、$\xi\sim\mathcal N(0,\sigma_y^2I_m)$。它通过 $\nabla_{x_t}\log p_t(x_t\mid y)=\nabla_{x_t}\log p_t(x_t)+\nabla_{x_t}\log p_t(y\mid x_t)$ [10] 在预训练先验 score 上加入测量引导。由于时刻 $t$ 的条件似然一般不可解，DPS 在 Tweedie 估计处计算它，即 $p_t(y\mid x_t)\approx p(y\mid\hat x_{0,\theta}(x_t,t))$。在高斯测量噪声下，这给出可微的引导目标

$$
L_t(x)=\frac{1}{2\sigma_y^2}\left\|A(\hat x_{0,\theta}(x,t))-y\right\|_2^2.\tag{2}
$$

在每个反向时刻，DPS 先生成先验锚点，再施加测量梯度修正：

$$
x_t^+=\Psi_t^{\mathrm{prior}}(x_{t+\Delta t}^-),\qquad q_t=\nabla_xL_t(x_t^+),\qquad x_t^-=x_t^+-\alpha_tq_t,\tag{3}
$$

其中 $\alpha_t>0$ 控制引导强度。标准 DPS 对 $q_t$ 的每个分量统一缩放，不区分一阶法向偏离与曲率诱导的切向偏离。CAT 在保留宿主采样器反向转移的同时引入这种几何区分。

## 3 相关工作

**面向逆问题的免训练扩散先验。** 一大类方法把无条件扩散模型复用作与任务无关的图像先验，并只在推理时施加测量。对线性算子，DDRM 利用前向模型的谱分解，而 DDNM 分离其值域与零空间以在反向扩散中施加数据一致性 [3, 4]。DPS 则对在 Tweedie 估计处求值的似然代理求导，从而可处理含噪非线性算子而无需任务特定训练 [10]；DiffPIR 把扩散去噪器放入即插即用恢复框架 [14]。更新的工作改进周边采样机制：DPnP 交替使用仅含似然的近端采样器与扩散先验采样器并提供鲁棒性保证 [15]，DAPS 解耦相邻噪声水平以允许更大转移并纠正轨迹早期累积的误差 [16]。这些工作主要决定似然与扩散先验如何构成条件采样器。我们的工作处理一个互补的问题：一旦得到可微的测量梯度，应如何缩放其法向与切向分量，才能使修正保持在学习先验的局部可靠区域内？因此，我们的修正可以挂接到梯度引导求解器上，而不替换其底层反向转移。

**保持几何的扩散引导。** 最接近的一类工作利用扩散先验的几何来控制条件更新。MCG 把累积的离流形误差识别为扩散逆求解器的失效模式，并引入流形约束的梯度修正 [11]。MPGD 利用预训练自编码器发展出免训练的在流形上引导，并说明相应的 shortcut 能为潜扩散模型保持潜流形 [12]。基于 score 的流形投影直接把 score 视为等密度曲面的法向，并去掉测量梯度中与 score 平行的分量，从而产生一阶切向更新 [13]。这些方法促使我们保持流形保真，但强制精确在流形上或切向的修正可能丢弃法向上有用的测量运动，也没有考虑切向步在曲面上的二阶偏离。我们改为在符号距离管内容纳两个分量：法向运动在一阶消耗预算，切向运动通过方向曲率消耗预算，并由一个标量对偶方程选择其唯一联合最优缩放。因此该管状表述放松了精确投影，同时仍阻止无限制地移入学习 score 支撑较差的区域。

**潜扩散模型下的逆问题。** 潜扩散先验降低生成成本，但使测量一致性更微妙，因为前向算子与非线性解码器复合。ReSample 通过求解硬数据一致性子问题，并把所得估计重采样回噪声潜流形来解决该困难 [17]。P2L 通过交替优化联合调整文本提示、潜码与像素重建 [18]，而 STSL 为二阶 Tweedie 信息构造可处理的代理以改进潜后验采样 [19]。这些方法专门为潜扩散重新设计数据一致性或后验近似。相比之下，我们的构造与表示无关：解码器被纳入测量目标，而 score 几何、梯度分解、曲率与管状步都相对当前工作变量计算。因此同一修正可在像素空间或潜空间运行，而无需改动其几何推导。

## 4 我们的方法

### 4.1 动机

强测量引导可能把扩散轨迹推出 score 训练时表示良好的区域，导致先验误差累积与可见的纹理或颜色伪影。Chung 等 [11] 的集中结果刻画了这一行为背后的含噪数据区域。

**命题 1（含噪数据的集中 [11]）.** 设干净分布在局部线性的 $n$ 维流形 $\mathcal M\subset\mathbb R^D$（$n<D$）上均匀。在 $x_t=\mu_tx_0+\sigma_t\epsilon$ 下，含噪边缘分布集中在其为 $(D-1)$ 维壳层

$$
\mathcal S_t=\left\{x\in\mathbb R^D:\operatorname{dist}(x,\mu_t\mathcal M)=\sigma_t\sqrt{D-n}\right\}\tag{4}
$$

的附近。由于 score 训练从 $p_t$ 中抽取含噪状态，监督集中在 $\mathcal S_t$ 附近，而激进引导可能把迭代点带入可靠性更低的区域，并在随后的反向步中放大 score 误差。CAT 通过在局部先验几何周围一个与噪声相关的管内调控每次修正，直接针对这一失效模式。与精确流形投影不同，该管状设计在控制法向位移与曲率诱导切向偏离的同时，保留了有用的测量运动。

### 4.2 曲率自适应管状（CAT）修正

CAT 适用于任何在其工作空间中提供可微引导梯度 $q_t=\nabla L_t(x_t)$ 的扩散求解器，无论 $x_t$ 是含噪图像还是潜码。我们在 DPS 之上介绍 CAT，其中 $x_t$ 表示（3）中的先验锚点 $x_t^+$，$\alpha_t>0$ 为宿主引导步长。同一构造可直接迁移到其他梯度引导采样器。

CAT 用通过当前状态的等密度曲面描述局部先验几何。令 $\phi_t=\log p_t$、$c_t:=\phi_t(x_t)=\log p_t(x_t)$，并令 $\mathcal M_t:=\{x\in\mathbb R^D:\phi_t(x)=c_t\}$。曲面 $\mathcal M_t$ 在每个反向步都更新。当 $\phi_t$ 为 $C^3$ 且在 $x_t$ 附近梯度非零时，其局部成分是由 score 诱导的单位法向 $\nu_t(z):=\nabla\phi_t(z)/\|\nabla\phi_t(z)\|_2$ 定向的正则超曲面。令 $U_t$ 为具有唯一最近点投影到 $\mathcal M_t$ 的管状邻域。其由 $\nu_t$ 定向的符号距离为

$$
r(x,\mathcal M_t):=\begin{cases}+\operatorname{dist}(x,\mathcal M_t),&x\text{ 位于 }\nu_t\text{ 所指一侧},\\-\operatorname{dist}(x,\mathcal M_t),&x\text{ 位于相反一侧},\end{cases}\tag{5}
$$

其中 $\operatorname{dist}(x,\mathcal M_t)=\inf_{z\in\mathcal M_t}\|x-z\|_2$，故 $|r(x,\mathcal M_t)|=\operatorname{dist}(x,\mathcal M_t)$。对 $z\in\mathcal M_t$ 有 $r(z,\mathcal M_t)=0$ 与 $\nabla_xr(z,\mathcal M_t)=\nu_t(z)$。假设 $r$ 在 $U_t$ 上为 $C^3$，则 $x_t$ 处的局部 score 几何为

$$
s_t=\nabla\phi_t(x_t),\quad g_t=\|s_t\|_2,\quad H_t=\nabla^2\phi_t(x_t),\quad \nu_t:=\nu_t(x_t)=\frac{s_t}{g_t},\quad P_{N,t}=\nu_t\nu_t^{\top},\quad P_{T,t}=I-P_{N,t},\tag{6}
$$

其中 $P_{N,t}$ 与 $P_{T,t}$ 分别投影到 score 法空间与切空间，且 $T_{x_t}\mathcal M_t=\{v:s_t^{\top}v=0\}$。CAT 允许引导在噪声自适应管 $\mathcal T_t(R_t):=\{x\in U_t:|r(x,\mathcal M_t)|\leq R_t\}$ 内进行，其中 $R_t=\rho\sigma_t$，$\rho>0$ 控制几何预算。把半径按 $\sigma_t$ 缩放遵循含噪分布的宽度，并在去噪过程中逐步收紧引导。

**定理 2（二阶管状展开）.** 假设前述局部正则条件成立，且在相关管状邻域内 $\sup_x\|D^3r(x,\mathcal M_t)\|_{\mathrm{op}}\leq M_3$。局部曲率矩阵为

$$
B_t=\frac{1}{g_t}P_{T,t}H_tP_{T,t}.\tag{7}
$$

对每个足够局部的位移 $d=d_N+d_T$（其中 $d_N=P_{N,t}d$、$d_T=P_{T,t}d$）有

$$
r(x_t+d,\mathcal M_t)=\nu_t^{\top}d_N+\frac{1}{2}d_T^{\top}B_td_T+\mathcal R_3(d),\qquad|\mathcal R_3(d)|\leq\frac{M_3}{6}\|d\|_2^3.\tag{8}
$$

定理 2 揭示了 CAT 所利用的关键不对称性：法向运动在一阶消耗管厚，而切向运动按方向曲率在二阶计费。对沿单位切方向 $u$ 的分量幅度 $r_N$ 与 $r_T$，令 $K_t=|u^{\top}B_tu|$。由此得到的非抵消预算 $r_N+\frac12K_tr_T^2\leq R_t$ 保守地控制二阶符号距离模型，同时不允许两分量相互抵消。附录 A.1 给出推导。

接下来在法向与切向引导分量之间最优分配共享预算。分解 $q_{N,t}=P_{N,t}q_t$、$q_{T,t}=P_{T,t}q_t$，幅度为 $a_t=\|q_{N,t}\|_2$、$b_t=\|q_{T,t}\|_2$。对每个非零分量，定义 $e_{N,t}=q_{N,t}/a_t$、$e_{T,t}=q_{T,t}/b_t$；消失的分量对应零位移。我们寻求下降修正 $d_t=-r_{N,t}e_{N,t}-r_{T,t}e_{T,t}$，并用方向曲率 $K_t=|e_{T,t}^{\top}B_te_{T,t}|$ 度量切向代价，其中当 $b_t=0$ 时 $K_t=0$。最优幅度求解

$$
\min_{r_{N,t},r_{T,t}\geq0}\ -a_tr_{N,t}-b_tr_{T,t}+\frac{r_{N,t}^2+r_{T,t}^2}{2\alpha_t}\qquad\text{s.t.}\ r_{N,t}+\frac{1}{2}K_tr_{T,t}^2\leq R_t.\tag{9}
$$

该目标在最大化一阶测量下降的同时，尽量贴近宿主更新。若无管约束，其解 $(r_{N,t},r_{T,t})=(\alpha_ta_t,\alpha_tb_t)$ 恰好还原原来的各向同性引导步。

**定理 3（唯一的曲率自适应步）.** 对 $\alpha_t,R_t>0$ 与 $a_t,b_t,K_t\geq0$，（9）有唯一全局极小点，由 $r_{N,t}(\lambda_t)=\alpha_t(a_t-\lambda_t)_+$ 与 $r_{T,t}(\lambda_t)=\alpha_tb_t/(1+\alpha_t\lambda_tK_t)$ 给出，其中当 $\alpha_ta_t+\frac12K_t(\alpha_tb_t)^2\leq R_t$ 时 $\lambda_t=0$。否则 $\lambda_t$ 是

$$
F_t(\lambda_t):=\alpha_t(a_t-\lambda_t)_++\frac{K_t}{2}\left(\frac{\alpha_tb_t}{1+\alpha_t\lambda_tK_t}\right)^2=R_t\tag{10}
$$

的唯一正根。该标量方程开销很小，可对每个样本用区间套与二分法独立求解。所得逐分量步长为

$$
\eta_{N,t}=\alpha_t\left(1-\frac{\lambda_t}{a_t}\right)_+,\qquad \eta_{T,t}=\frac{\alpha_t}{1+\alpha_t\lambda_tK_t},\tag{11}
$$

从而 $d_t=-\eta_{N,t}q_{N,t}-\eta_{T,t}q_{T,t}$。因此 CAT 通过单个标量乘子，使法向分量按其在一阶管代价、切向分量按其方向曲率自适应。附录 A.2 给出证明。

**定理 4（测量下降与 Armijo 接受）.** 设 $\nabla L_t$ 沿更新线段是 $L_g$-Lipschitz，令 $d_t^{\star}$ 求解（9）。若 $0<\alpha_t\leq1/L_g$，则 $L_t(x_t+d_t^{\star})\leq L_t(x_t)$，且当 $q_t\neq0$ 时严格成立。对任意 $\alpha_t>0$ 与 $q_t\neq0$，$d_t^{\star}$ 仍是严格下降方向，且取 $c,\beta\in(0,1)$ 的 Armijo 回溯终止于某个尺度 $\gamma_t\in\{1,\beta,\beta^2,\ldots\}$ 使得

$$
L_t(x_t+\gamma_td_t^{\star})\leq L_t(x_t)+c\gamma_tq_t^{\top}d_t^{\star}<L_t(x_t).\tag{12}
$$

此外，被接受的位移仍满足二阶可行性：$\gamma_tr_{N,t}^{\star}+\frac12K_t\gamma_t^2(r_{T,t}^{\star})^2\leq R_t$。

定理 4 把几何控制与可靠的有限步优化耦合起来。CAT 不去估计依赖轨迹的常数 $L_g$，而是对每个曲率自适应提议施加 Armijo 回溯。被接受的更新在实际引导目标上取得充分下降，同时保持二阶管可行。为降低重复目标评估的成本，我们还引入 Armijo 周期 $p$：每 $p$ 个反向步做一次回溯，中间各步复用最近一次被接受的尺度 $\gamma_t$。因此增大 $p$ 可摊薄线搜索开销，并提供可控的效率—质量折中，我们在 5.4 节评估它。附录 A.3 给出逐步接受结果的证明。

结合曲率自适应分配与有限步校准，CAT 把宿主的各向同性修正替换为

$$
x_t^-=x_t+\gamma_td_t=x_t-\gamma_t\left(\eta_{N,t}q_{N,t}+\eta_{T,t}q_{T,t}\right),\tag{13}
$$

其中逐分量步长 $\eta_{N,t}$ 与 $\eta_{T,t}$ 由（11）定义，Armijo 尺度 $\gamma_t$ 按（12）选取。因此 CAT 保留宿主先验转移，只自适应其引导修正。

实践中，CAT 用学到的 score $\hat s_t=s_\theta(x_t,t)$ 构造 $\hat\nu_t=\hat s_t/\|\hat s_t\|_2$，并直接把引导分解为 $\hat q_{N,t}=\hat\nu_t(\hat\nu_t^{\top}q_t)$ 与 $\hat q_{T,t}=q_t-\hat q_{N,t}$。CAT 只计算更新所需的方向曲率。对 $\hat b_t=\|\hat q_{T,t}\|_2>0$，定义

$$
u_t=\operatorname{stopgrad}\left(\frac{\hat q_{T,t}}{\hat b_t}\right),\qquad v_t=D_{x_t}\left(u_t^{\top}\hat s_t\right),\qquad \hat K_t=\frac{|u_t^{\top}v_t|}{\|\hat s_t\|_2}.\tag{14}
$$

这里 $D_{x_t}$ 表示关于 $x_t$ 的反向模式微分。由于 $u_t$ 是 stop-gradient 的，该式只用 $D$ 维辅助向量、通过一次反向传播即可计算所需的二次型。若 $\hat b_t=0$，则置 $\hat K_t=0$ 并跳过该次传播。

完整的 CAT 流程用学到的 score 分解引导梯度、计算（14）、求解标量对偶方程，并用 Armijo 回溯校准提议。算法 1 概括了所得实现。

**算法 1：DPS+CAT。** 输入：状态 $x_{t+\Delta t}^-$、观测 $y$、初始步长 $\alpha_t$、预算系数 $\rho$、Armijo 常数 $c,\beta$。
1. $x_t\leftarrow\mathrm{prior\_step}(x_{t+\Delta t}^-)$；$q_t\leftarrow\nabla L_t(x_t)$；$\hat s_t\leftarrow s_\theta(x_t,t)$
2. $\hat\nu_t\leftarrow\hat s_t/\|\hat s_t\|_2$；$\hat q_{N,t}\leftarrow\hat\nu_t(\hat\nu_t^{\top}q_t)$；$\hat q_{T,t}\leftarrow q_t-\hat q_{N,t}$
3. $\hat a_t\leftarrow\|\hat q_{N,t}\|_2$；$\hat b_t\leftarrow\|\hat q_{T,t}\|_2$
4. 若 $\hat b_t>0$：$u_t\leftarrow\operatorname{stopgrad}(\hat q_{T,t}/\hat b_t)$；$v_t\leftarrow\mathrm{autograd}_{x_t}(u_t^{\top}\hat s_t)$；$\hat K_t\leftarrow|u_t^{\top}v_t|/\|\hat s_t\|_2$；否则 $\hat K_t\leftarrow0$
5. $R_t\leftarrow\rho\sigma_t$
6. 若 $\alpha_t\hat a_t+\frac12\hat K_t(\alpha_t\hat b_t)^2\leq R_t$：$\lambda_t\leftarrow0$；否则用二分法求解 $\hat F_t(\lambda_t)=R_t$
7. $r_{N,t}\leftarrow\alpha_t(\hat a_t-\lambda_t)_+$；$r_{T,t}\leftarrow\alpha_t\hat b_t/(1+\alpha_t\lambda_t\hat K_t)$
8. $d_t\leftarrow-r_{N,t}\hat q_{N,t}/\hat a_t-r_{T,t}\hat q_{T,t}/\hat b_t$；$\gamma_t\leftarrow1$
9. 当 $d_t\neq0$ 且 $L_t(x_t+\gamma_td_t)>L_t(x_t)+c\gamma_tq_t^{\top}d_t$ 时：$\gamma_t\leftarrow\beta\gamma_t$
10. 返回 $x_t^-\leftarrow x_t+\gamma_td_t$

## 5 实验

### 5.1 主要结果

**评估协议。** 我们在 FFHQ 的 100 幅图像与 ImageNet 的 100 幅图像上、以原生 $256\times256$ 分辨率评估。基准覆盖随机掩码与盒式修复、超分辨率、运动与高斯去模糊、高动态范围（HDR）重建以及非线性去模糊。完整的算子与测量噪声设置见附录 B。我们报告 PSNR、SSIM、LPIPS 与 FID；PSNR 与 SSIM 越高越好，LPIPS 与 FID 越低越好。

**方法与插件协议。** 我们把 CAT 修正挂载到多个宿主采样器上并分别报告所得组合：像素空间的 DPS [10] 与 DPS+CAT，潜空间的 PSLD [20]/PSLD+CAT 与 ReSample [17]/ReSample+CAT。该设计检验所提几何修正能否跨求解器族迁移。我们还纳入相同宿主的 DiffState 增强变体 [21]，以及像素空间基线 DPS、DDRM [3]、DDNM [4]、DAPS [16]、DCDP [22] 与 DiffRGD [23]。这些实验所用的算法超参数设置见附录 B。

**定量比较。** 表 1 汇总 FFHQ 与 ImageNet 上的全部七个任务。在 FFHQ 上，加入 CAT 在所有七个逆问题上都一致地改善底层求解器，LPIPS 与 FID 的下降尤为显著，表明感知保真更好。这些增益延伸到 ImageNet：在所有报告任务上，DPS+CAT 在像素空间方法中取得最强的感知结果。Resample+CAT 在五个线性任务上给出最强的潜空间总体结果。DPS、PSLD 与 ReSample 上的一致改进表明，CAT 是一种有效的即插即用几何修正，而非某个求解器专用的替代方案。图 2 进一步印证这些增益：在六个代表性任务中，DPS+CAT 更好地保持面部结构与精细细节，同时抑制局部伪影。

### 5.2 鲁棒性分析

我们沿三类敏感性来源评估 CAT 的鲁棒性：宿主引导步长、管半径与测量噪声水平。所有扫描都使用 FFHQ 运动去模糊，并在每种设置下聚合 100 幅图像。

**对引导步长的鲁棒性。** 引导步长控制宿主采样器施加的测量一致性更新的强度。虽然更强引导可改善数据保真，但过大的步长可能把迭代点推离学习先验建模良好的区域。为评估该敏感性，我们在 FFHQ 运动去模糊上扫描 PSLD 引导权重 $\omega\in\{0.1,0.5,1,2,5\}$，同时把潜数据一致性权重固定为 $\gamma=0.01$、测量噪声水平固定为 $\sigma_y=0.05$，其他超参数保持不变。我们在同一组 100 幅图像上评估 PSLD、PSLD+DiffState 与 PSLD+CAT；图 3 报告扫描过程中的 PSNR、SSIM、LPIPS 与 FID。

定量与定性结果一致表明，CAT 显著降低了对引导步长的敏感性。随着引导更激进，PSLD 与 PSLD+DiffState 在各项指标上急剧退化，而 PSLD+CAT 在较宽的工作范围内保持强重建质量。图 4 进一步显示，对比方法在大步长下出现明显的结构畸变与颜色伪影，而 PSLD+CAT 保持连贯的面部几何与自然外观。

**对管半径的鲁棒性。** 系数 $\rho$ 控制噪声相关管预算 $R_t=\rho\sigma_t$：较小的值把修正限制在局部先验几何的窄邻域内，较大的值允许更多测量驱动的运动。我们在 FFHQ 运动去模糊上对 PSLD+CAT 扫描 $\rho\in\{0.1,0.5,1,1.5,2\}$，同时保持宿主设置与测量噪声水平 $\sigma_y=0.05$ 固定，并在同一 100 幅图像上评估每个半径；图 5 报告所得指标曲线。

半径扫描确认 PSLD+CAT 在较宽工作范围内对 $\rho$ 的选择不敏感。在所有测试半径上，PSLD+CAT 都一致优于主实验中的 PSLD 结果（图 5 中的水平虚线）。失真指标在整个扫描中保持稳定，而图 6 表明 PSLD+CAT 在所有测试半径下都比 PSLD 更忠实地保持全局面部结构。总体而言，PSLD+CAT 无需仔细调 $\rho$ 即可保持可靠的重建质量，展现出在实用管半径范围内的鲁棒行为。

**对测量噪声的鲁棒性。** 测量噪声通过扰动后验采样全程所用的观测，使数据一致性引导可靠性下降。我们通过令 $\sigma_y\in\{0,0.01,0.05,0.1\}$ 并固定运动核与所有求解器超参数来评估这种敏感性，在同一 100 幅 FFHQ 图像上比较 DAPS、DCDP、DiffRGD、DPS、DPS+Diffstate 与 DPS+CAT；图 7 为每种方法在每项指标上各给出一条曲线。

噪声扫描表明 DPS+CAT 对测量退化的强鲁棒性。随着观测越来越不可靠，DPS+CAT 始终给出最佳感知质量，同时保持很有竞争力的失真指标，说明 CAT 在显著测量扰动下仍然有效。图 8 进一步印证该优势：DPS+CAT 忠实保持面部边界与眼镜框等高对比细节，同时避免若干基线中出现的噪声放大与过平滑。综合来看，这些结果表明 CAT 在很宽的噪声水平范围内都能给出稳定、高质量的重建，而不依赖窄范围调好的测量条件。

### 5.3 消融研究

我们在 FFHQ 上评估 CAT 的六个诊断变体：非线性去模糊用 DPS，运动去模糊用 PSLD。Host 表示不加 CAT 的强引导宿主；Host+Armijo 只加入 CAT 的回溯线搜索；First-order CAT 令 $K_t=0$ 以关闭曲率项；Tangent-only 去掉法向引导分量；CAT w/o Armijo 通过固定 $\gamma_t=1$ 关闭回溯；Full CAT 同时保留二阶管约束与自适应线搜索。测量噪声水平全程固定为 $\sigma_y=0.05$。

（表 2 见"图注与表注"一节。）

**分量消融。** Armijo 回溯大幅改善两个宿主求解器，但并不能解释 CAT 的全部增益。Full CAT 在两个宿主上都取得最佳总体性能，相对 Host+Armijo 有一致且不可忽略的提升。相反，CAT w/o Armijo 只带来部分增益，说明几何控制与有限步损失校准起互补作用。图 9 支持该结论：Full CAT 抑制了部分变体中残留的严重伪影并恢复连贯的面部结构。

**二阶几何的作用。** First-order CAT 与 Host+Armijo 接近，而 Full CAT 在两个宿主上都一致更好。这一差距表明只约束一阶法向位移并不充分，而对曲率诱导的切向偏离建模在实践中很重要。Tangent-only 也落后于 Full CAT，说明精确切向投影丢弃了有用的测量运动，而 CAT 因保留受控的法向分量而受益。

### 5.4 效率分析

我们在 FFHQ 非线性去模糊上用 DPS 分析 CAT 的计算折中，使用与主实验相同的 100 幅图像，所有运行都在单块 NVIDIA GeForce RTX 4090 GPU 上进行。我们变化两个因素：反向采样步数 $N$ 与上文引入的 Armijo 周期 $p$；每个扫描内其他方法设置保持不变。表 3 报告重建质量、GPU 显存占用与墙钟时间。

（表 3 见"图注与表注"一节。）

**Armijo 频率。** Armijo 周期提供灵活的效率—质量折中：更稀疏的搜索降低运行时开销，同时保持相对 DPS 的明显质量优势。当把重建质量放在首位时，每步都做回溯会在各项指标上给出最强且最一致的表现。总体而言，CAT 提供了一种实用且可调的增强，其计算成本可在不牺牲核心重建收益的前提下调整。

**采样步数。** 与 DPS 相比，DPS+CAT 在每个测试步数下都改善全部四项重建指标。即使在 $N=200$ 时，它也以更短的运行时间超过 DPS。随着 $N$ 增大，运行时间近似线性增长而显存占用几乎不变，重建质量逐步提升。这种平滑的质量—效率折中使 CAT 能方便地适配不同推理预算而不增加显存需求，因而在质量优先与资源受限两种场景下都实用。

### 5.5 扩展

#### 5.5.1 科学逆问题

**评估协议。** 我们把评估从自然图像恢复扩展到 InverseBench [24] 中的黑洞成像。该任务利用非线性闭合相位与对数闭合振幅约束、以及总通量约束，从稀疏干涉观测重建源图像。我们在 $64\times64$ 分辨率下、使用 InverseBench [24] 的预训练黑洞扩散先验，在 100 幅测试图像上评估 DPS+CAT，观测时间比为 100% 与 10%。这些实验的算法超参数设置见附录 B。我们与领域专用方法 SMILI、EHT-Imaging 以及扩散先验方法 DPS、LGD、RED-Diff、PnPDM、DAPS、DiffPIR 比较，使用其报告的 InverseBench 结果。图像质量用 PSNR 与 Blur PSNR 度量；我们还报告闭合相位与对数闭合振幅的约化卡方统计量 $\tilde\chi^2_{\mathrm{cp}}$ 与 $\tilde\chi^2_{\mathrm{logca}}$，其值接近 1 表示与测量噪声水平一致。

**定量比较。** 表 4 表明，DPS+CAT 在两种观测时间设置下都一致取得最强的图像空间重建质量。相比 DPS 宿主，CAT 改善了 PSNR 与 Blur PSNR，说明像素级保真与相对真值的大尺度形态一致性都更好。该优势在观测时间减少时仍然保持，支持 CAT 超越自然图像恢复、适用于具有挑战性的物理非线性逆问题。图 10 进一步表明，DPS+CAT 恢复出更锐利、更连续的辐射环且伪影更少，在 10% 观测时间下尤为明显。

#### 5.5.2 无分类器引导

**评估协议。** 我们进一步把曲率自适应管状修正应用于无分类器引导（classifier-free guidance, CFG）[25]。CFG 由条件与无条件模型预测之差构成条件更新；我们在把该引导方向与无条件预测合并之前，让它通过 CAT。该构造用无条件 score 定义局部先验几何，且无需重训练。我们在 Stable Diffusion 2.1 [26] 上、使用 COCO 2017 验证划分 [27] 的 1000 条描述评估 CFG+CAT。所有方法使用模型官方采样器与相同默认采样设置，并在引导尺度 $w\in\{10,20,50,100\}$ 下使用相同提示与初始种子。我们与标准 CFG 及自适应投影引导（adaptive projected guidance, APG）[28] 比较；对所有方法采用同一协议，报告 CLIP 分数 [29]、FID [30]、饱和度与 RMS 对比度。CLIP 与 FID 分别度量文本—图像对齐与分布保真，而饱和度与对比度刻画更强引导下图像外观的变化。

**定量与定性比较。** 表 5 表明，CFG+CAT 在每个评估的引导尺度下都取得最低 FID，且随 $w$ 增大保持稳定的 FID、饱和度与对比度；相比之下，标准 CFG 的 FID 显著恶化，APG 的 FID 增长较温和。虽然 CFG+CAT 未取得最高 CLIP 分数，但对齐在整个扫描中保持稳定。图 11 中 $w=100$ 的定性结果印证这些趋势：标准 CFG 产生严重过饱和与平坦、色块化的区域，APG 减少这些伪影但仍保留夸张的颜色与对比度；相反，CFG+CAT 给出更连贯的布局、更平滑的色调过渡与更自然的颜色，同时保留提示指定的内容。综合来看，这些结果表明 CAT 超越了逆问题引导，在强条件引导下提供了有利的保真—对齐折中。

## 6 结论

本文提出 CAT，一种用于稳定梯度引导扩散的无需训练修正。CAT 在与噪声相关的管预算内，在一阶法向位移与曲率诱导的二阶切向偏离之间分配预算，在保留有用法向引导的同时限制移出先验局部可靠区域的运动。该分配具有唯一的标量对偶解，Armijo 回溯则针对引导目标校准每个有限步。其无矩阵实现可同时用于像素空间与潜空间。

在 FFHQ 与 ImageNet 上的七个逆问题中，CAT 改进了所评估的 DPS、PSLD 与 ReSample 宿主，尤其在感知质量方面。消融与鲁棒性扫描支持曲率感知控制与有限步校准的互补作用。CAT 还把黑洞重建相对 DPS 提升，并在每个测试尺度下取得所比较文本到图像引导方法中最低的 FID。不过，CAT 提供的是局部控制而非全局准确后验采样的保证，依赖未经认证的局部 score 几何，并增加曲率估计与线搜索开销。使其预算适配 score 不确定性、并在更广泛的科学与条件生成设置中验证它，仍是重要方向。

## 致谢

Zheng Ma 受国家自然科学基金（NSFC）Grant No. 12531016 与北京应用物理与计算数学研究所 funding HX02023-6 资助。我们还感谢上海数学与交叉学科研究院（SIMIS）的经费支持。本研究由 SIMIS 在 grant number SIMIS-ID-2025-ST 下资助。作者感谢 SIMIS 提供的资源与设施，这些对本工作的完成至关重要。

## 图注与表注

### 表 1：FFHQ 与 ImageNet 上的主要结果（每数据集 100 幅图像；原 PDF 第 7 页）

PSNR/SSIM 越高越好，LPIPS/FID 越低越好。原文以加粗标出每个任务与类型内的最佳值；本页转录全部数值，未逐格复刻加粗样式。

**超分辨率 4×（Super-resolution 4×）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 28.07 | 0.749 | 0.2773 | 76.15 | 25.54 | 0.642 | 0.3759 | 113.16 |
| 像素 | DCDP | 26.55 | 0.765 | 0.3074 | 103.17 | 25.80 | 0.681 | 0.3808 | 128.53 |
| 像素 | DDNM | 28.80 | 0.822 | 0.2435 | 80.38 | 26.84 | 0.743 | 0.3083 | 102.82 |
| 像素 | DDRM | 28.47 | 0.814 | 0.2511 | 84.87 | 26.43 | 0.730 | 0.3175 | 99.85 |
| 像素 | DiffRGD | 27.49 | 0.778 | 0.2266 | 64.60 | 23.96 | 0.625 | 0.3687 | 121.27 |
| 像素 | DPS | 24.01 | 0.672 | 0.3176 | 88.23 | 22.09 | 0.542 | 0.4486 | 166.28 |
| 像素 | DPS+Diffstate | 22.67 | 0.629 | 0.3475 | 90.20 | 20.85 | 0.494 | 0.4933 | 192.38 |
| 像素 | DPS+CAT（本文） | 27.58 | 0.780 | 0.2132 | 54.63 | 25.67 | 0.691 | 0.2977 | 82.44 |
| 潜空间 | PSLD | 23.91 | 0.610 | 0.3973 | 134.91 | 22.62 | 0.531 | 0.4974 | 265.51 |
| 潜空间 | PSLD+DiffState | 24.53 | 0.649 | 0.3444 | 94.91 | 21.20 | 0.474 | 0.5525 | 299.54 |
| 潜空间 | PSLD+CAT（本文） | 27.16 | 0.754 | 0.2497 | 71.01 | 23.43 | 0.575 | 0.4487 | 233.00 |
| 潜空间 | ReSample | 23.25 | 0.585 | 0.4635 | 164.56 | 24.42 | 0.637 | 0.3618 | 150.49 |
| 潜空间 | Resample+Diffstate | 21.31 | 0.436 | 0.5914 | 291.91 | 23.36 | 0.570 | 0.4467 | 235.14 |
| 潜空间 | Resample+CAT（本文） | 26.80 | 0.720 | 0.3719 | 124.63 | 25.41 | 0.694 | 0.3538 | 138.28 |

**盒式修复（Inpainting (box)）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 24.46 | 0.752 | 0.2128 | 54.73 | 20.94 | 0.711 | 0.2754 | 97.58 |
| 像素 | DCDP | 22.87 | 0.750 | 0.3009 | 103.14 | 19.93 | 0.757 | 0.2694 | 122.64 |
| 像素 | DDNM | 24.51 | 0.860 | 0.1553 | 48.08 | 20.74 | 0.802 | 0.2172 | 99.90 |
| 像素 | DDRM | 22.18 | 0.818 | 0.2117 | 72.35 | 19.14 | 0.759 | 0.2685 | 121.00 |
| 像素 | DiffRGD | 23.33 | 0.839 | 0.1664 | 47.21 | 19.30 | 0.707 | 0.3359 | 154.77 |
| 像素 | DPS | 23.60 | 0.801 | 0.2201 | 65.92 | 19.97 | 0.695 | 0.3295 | 121.47 |
| 像素 | DPS+Diffstate | 23.23 | 0.736 | 0.2626 | 72.40 | 19.74 | 0.626 | 0.3818 | 137.10 |
| 像素 | DPS+CAT（本文） | 24.35 | 0.849 | 0.1437 | 38.88 | 20.01 | 0.786 | 0.1769 | 64.99 |
| 潜空间 | PSLD | 23.50 | 0.857 | 0.1163 | 41.16 | 19.71 | 0.804 | 0.1956 | 120.25 |
| 潜空间 | PSLD+DiffState | 23.78 | 0.862 | 0.1140 | 40.54 | 19.74 | 0.804 | 0.2005 | 125.97 |
| 潜空间 | PSLD+CAT（本文） | 24.25 | 0.876 | 0.0983 | 33.38 | 20.19 | 0.814 | 0.1888 | 115.24 |
| 潜空间 | ReSample | 20.63 | 0.838 | 0.1444 | 80.55 | 20.79 | 0.822 | 0.1769 | 108.18 |
| 潜空间 | Resample+Diffstate | 20.66 | 0.793 | 0.1919 | 141.88 | 19.86 | 0.811 | 0.1766 | 108.59 |
| 潜空间 | Resample+CAT（本文） | 23.83 | 0.876 | 0.1079 | 40.42 | 21.10 | 0.827 | 0.1782 | 106.21 |

**随机修复（Inpainting (random)）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 29.44 | 0.784 | 0.2144 | 52.17 | 27.35 | 0.725 | 0.2516 | 48.76 |
| 像素 | DCDP | 27.17 | 0.786 | 0.2838 | 98.72 | 26.67 | 0.743 | 0.3111 | 88.60 |
| 像素 | DDNM | 29.60 | 0.862 | 0.1845 | 59.98 | 27.32 | 0.785 | 0.2394 | 67.16 |
| 像素 | DDRM | 25.65 | 0.768 | 0.2791 | 109.90 | 23.24 | 0.633 | 0.4105 | 170.01 |
| 像素 | DiffRGD | 30.88 | 0.889 | 0.1329 | 32.88 | 28.71 | 0.822 | 0.2415 | 72.51 |
| 像素 | DPS | 28.08 | 0.804 | 0.2362 | 72.72 | 26.17 | 0.707 | 0.3328 | 105.54 |
| 像素 | DPS+Diffstate | 26.24 | 0.740 | 0.2768 | 80.76 | 24.41 | 0.633 | 0.3962 | 142.86 |
| 像素 | DPS+CAT（本文） | 30.69 | 0.883 | 0.1260 | 29.56 | 29.22 | 0.841 | 0.1781 | 39.52 |
| 潜空间 | PSLD | 23.86 | 0.651 | 0.4148 | 148.66 | 24.93 | 0.699 | 0.4098 | 188.71 |
| 潜空间 | PSLD+DiffState | 22.64 | 0.600 | 0.4572 | 161.32 | 23.56 | 0.647 | 0.4622 | 245.96 |
| 潜空间 | PSLD+CAT（本文） | 29.85 | 0.858 | 0.2117 | 69.04 | 25.31 | 0.722 | 0.3842 | 176.52 |
| 潜空间 | ReSample | 29.61 | 0.849 | 0.1911 | 55.54 | 27.38 | 0.802 | 0.2667 | 85.86 |
| 潜空间 | Resample+Diffstate | 29.14 | 0.833 | 0.2338 | 86.92 | 27.03 | 0.776 | 0.3091 | 110.79 |
| 潜空间 | Resample+CAT（本文） | 30.23 | 0.866 | 0.1725 | 51.99 | 27.46 | 0.805 | 0.2650 | 85.22 |

**高斯去模糊（Gaussian deblurring）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 28.23 | 0.752 | 0.2687 | 72.33 | 25.95 | 0.662 | 0.3578 | 108.40 |
| 像素 | DCDP | 28.17 | 0.790 | 0.2650 | 81.75 | 25.89 | 0.673 | 0.4067 | 149.88 |
| 像素 | DDNM | 29.19 | 0.828 | 0.2707 | 95.79 | 26.77 | 0.733 | 0.3347 | 115.95 |
| 像素 | DDRM | 28.66 | 0.817 | 0.2499 | 83.63 | 26.82 | 0.735 | 0.3168 | 105.26 |
| 像素 | DiffRGD | 26.46 | 0.750 | 0.2259 | 64.63 | 22.62 | 0.568 | 0.4158 | 141.71 |
| 像素 | DPS | 25.15 | 0.698 | 0.2719 | 73.70 | 22.42 | 0.547 | 0.3834 | 119.95 |
| 像素 | DPS+Diffstate | 24.53 | 0.678 | 0.2890 | 76.71 | 22.50 | 0.547 | 0.3951 | 136.01 |
| 像素 | DPS+CAT（本文） | 27.20 | 0.764 | 0.2064 | 50.69 | 24.86 | 0.657 | 0.2736 | 74.27 |
| 潜空间 | PSLD | 22.96 | 0.561 | 0.3875 | 119.22 | 20.76 | 0.464 | 0.5297 | 270.49 |
| 潜空间 | PSLD+DiffState | 22.51 | 0.549 | 0.3949 | 109.64 | 20.77 | 0.429 | 0.5379 | 277.55 |
| 潜空间 | PSLD+CAT（本文） | 25.59 | 0.706 | 0.3141 | 97.68 | 22.01 | 0.519 | 0.5165 | 275.79 |
| 潜空间 | ReSample | 25.88 | 0.643 | 0.3274 | 94.59 | 24.65 | 0.640 | 0.4351 | 186.59 |
| 潜空间 | Resample+Diffstate | 24.45 | 0.565 | 0.3857 | 112.11 | 24.26 | 0.621 | 0.4542 | 203.70 |
| 潜空间 | Resample+CAT（本文） | 27.91 | 0.779 | 0.2460 | 75.52 | 24.85 | 0.652 | 0.3981 | 164.85 |

**运动去模糊（Motion deblurring）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 30.28 | 0.811 | 0.2093 | 56.99 | 28.62 | 0.768 | 0.2487 | 54.31 |
| 像素 | DCDP | 29.53 | 0.808 | 0.2185 | 57.84 | 27.27 | 0.704 | 0.2961 | 72.03 |
| 像素 | DiffRGD | 28.81 | 0.816 | 0.1913 | 53.84 | 23.32 | 0.597 | 0.4284 | 155.59 |
| 像素 | DPS | 26.31 | 0.740 | 0.2532 | 70.15 | 24.55 | 0.643 | 0.3479 | 102.60 |
| 像素 | DPS+Diffstate | 25.33 | 0.706 | 0.2773 | 75.78 | 23.55 | 0.597 | 0.3864 | 128.44 |
| 像素 | DPS+CAT（本文） | 29.80 | 0.833 | 0.1634 | 39.25 | 28.76 | 0.800 | 0.2072 | 48.09 |
| 潜空间 | PSLD | 23.79 | 0.606 | 0.3706 | 117.02 | 21.68 | 0.488 | 0.5275 | 280.95 |
| 潜空间 | PSLD+DiffState | 23.40 | 0.601 | 0.3695 | 100.68 | 20.33 | 0.433 | 0.5752 | 303.47 |
| 潜空间 | PSLD+CAT（本文） | 27.05 | 0.751 | 0.2670 | 76.61 | 22.77 | 0.558 | 0.4825 | 253.68 |
| 潜空间 | ReSample | 28.19 | 0.742 | 0.2589 | 74.53 | 25.34 | 0.675 | 0.4004 | 173.04 |
| 潜空间 | Resample+Diffstate | 28.04 | 0.746 | 0.2670 | 85.76 | 24.94 | 0.652 | 0.4246 | 190.48 |
| 潜空间 | Resample+CAT（本文） | 29.23 | 0.806 | 0.2109 | 66.22 | 25.45 | 0.684 | 0.3597 | 140.46 |

**HDR 重建（HDR）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 26.98 | 0.828 | 0.1977 | 53.10 | 26.12 | 0.827 | 0.2051 | 45.60 |
| 像素 | DCDP | 27.09 | 0.842 | 0.2222 | 61.53 | 26.11 | 0.831 | 0.2126 | 50.16 |
| 像素 | DPS | 23.59 | 0.721 | 0.2938 | 82.85 | 17.12 | 0.460 | 0.5375 | 184.88 |
| 像素 | DPS+Diffstate | 24.00 | 0.717 | 0.2931 | 78.95 | 20.34 | 0.525 | 0.5038 | 186.90 |
| 像素 | DPS+CAT（本文） | 25.91 | 0.819 | 0.1664 | 42.80 | 25.93 | 0.822 | 0.1763 | 41.82 |
| 潜空间 | ReSample | 24.98 | 0.769 | 0.2877 | 91.27 | – | – | – | – |
| 潜空间 | Resample+Diffstate | 25.67 | 0.757 | 0.2927 | 94.89 | – | – | – | – |
| 潜空间 | Resample+CAT（本文） | 25.61 | 0.794 | 0.2561 | 81.15 | – | – | – | – |

**非线性去模糊（Nonlinear deblurring）**

| 类型 | 方法 | FFHQ PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | ImageNet PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|
| 像素 | DAPS | 26.25 | 0.710 | 0.2809 | 80.99 | 25.16 | 0.661 | 0.3429 | 119.91 |
| 像素 | DCDP | 24.22 | 0.710 | 0.3182 | 101.08 | 22.17 | 0.531 | 0.4619 | 176.27 |
| 像素 | DPS | 21.97 | 0.627 | 0.3219 | 85.68 | 20.05 | 0.502 | 0.4320 | 169.87 |
| 像素 | DPS+Diffstate | 21.57 | 0.607 | 0.3336 | 83.03 | 18.78 | 0.428 | 0.5075 | 194.37 |
| 像素 | DPS+CAT（本文） | 26.30 | 0.762 | 0.2197 | 55.17 | 24.95 | 0.690 | 0.2583 | 73.02 |
| 潜空间 | ReSample | 26.75 | 0.742 | 0.2790 | 81.67 | – | – | – | – |
| 潜空间 | Resample+Diffstate | 25.96 | 0.712 | 0.3191 | 108.60 | – | – | – | – |
| 潜空间 | Resample+CAT（本文） | 27.00 | 0.750 | 0.2666 | 74.39 | – | – | – | – |

### 表 2：CAT 消融（FFHQ；非线性去模糊用 DPS、运动去模糊用 PSLD；每宿主与变体评估 100 幅图像；原 PDF 第 11 页）

"1st" 与 "2nd" 分别表示一阶与二阶管模型。

| 变体 | 法向/切向 | 曲率 | 管 | Armijo | DPS 非线性去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | PSLD 运动去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Host | No | No | – | No | 17.06 | 0.326 | 0.5698 | 214.46 | 17.96 | 0.366 | 0.6719 | 374.57 |
| Host + Armijo | No | No | – | Yes | 24.08 | 0.696 | 0.2751 | 71.71 | 25.74 | 0.695 | 0.3482 | 123.15 |
| First-order CAT | Yes | No | 1st | Yes | 24.26 | 0.700 | 0.2718 | 73.44 | 25.80 | 0.699 | 0.3471 | 121.86 |
| Tangent-only | Yes | No | Projection | Yes | 24.15 | 0.696 | 0.2731 | 75.45 | 25.61 | 0.688 | 0.3504 | 125.81 |
| CAT w/o Armijo | Yes | Yes | 2nd | No | 17.33 | 0.409 | 0.4555 | 192.73 | 19.18 | 0.413 | 0.6243 | 323.10 |
| Full CAT | Yes | Yes | 2nd | Yes | 26.30 | 0.762 | 0.2197 | 55.17 | 27.05 | 0.751 | 0.2670 | 76.61 |

### 表 3：DPS+CAT 在 FFHQ 非线性去模糊上的效率（100 幅图像、单块 RTX 4090；原 PDF 第 12 页）

两个区块都含同一 DPS 基线作参照。上块在每步都施加 Armijo 的情况下变化反向采样步数 $N$；下块固定 $N=1000$ 并变化 Armijo 周期 $p$。Memory 与 Time 分别为记录的 GPU 显存占用与墙钟运行时间。

| 研究 | 设置 | PSNR↑ | SSIM↑ | LPIPS↓ | FID↓ | Memory (MiB) | Time (s) |
|---|---|---|---|---|---|---|---|
| 采样步数 | DPS | 21.97 | 0.6269 | 0.3219 | 85.68 | 3490 | 38 |
| 采样步数 | $N=200$ | 23.50 | 0.6851 | 0.2922 | 82.91 | 3610 | 26 |
| 采样步数 | $N=400$ | 24.62 | 0.7152 | 0.2633 | 70.54 | 3610 | 51 |
| 采样步数 | $N=600$ | 25.42 | 0.7380 | 0.2432 | 64.24 | 3610 | 78 |
| 采样步数 | $N=800$ | 25.92 | 0.7525 | 0.2297 | 58.73 | 3612 | 103 |
| 采样步数 | $N=1000$ | 26.30 | 0.7623 | 0.2197 | 55.17 | 3612 | 132 |
| Armijo 周期 | DPS | 21.97 | 0.6269 | 0.3219 | 85.68 | 3490 | 38 |
| Armijo 周期 | $p=5$ | 24.85 | 0.7292 | 0.2473 | 67.04 | 3616 | 89 |
| Armijo 周期 | $p=3$ | 24.82 | 0.7285 | 0.2472 | 62.92 | 3614 | 97 |
| Armijo 周期 | $p=2$ | 24.48 | 0.7161 | 0.2561 | 69.29 | 3614 | 106 |
| Armijo 周期 | $p=1$（Full CAT） | 26.30 | 0.7623 | 0.2197 | 55.17 | 3612 | 132 |

### 表 4：InverseBench 黑洞成像（100% 与 10% 观测时间；原 PDF 第 13 页）

条目为均值（标准差）。基线结果取自 InverseBench [24]；DPS+CAT 在 100 幅测试图像上评估。

| 方法 | 100% PSNR↑ | Blur PSNR↑ | $\tilde\chi^2_{\mathrm{cp}}\downarrow$ | $\tilde\chi^2_{\mathrm{logca}}\downarrow$ | 10% PSNR↑ | Blur PSNR↑ | $\tilde\chi^2_{\mathrm{cp}}\downarrow$ | $\tilde\chi^2_{\mathrm{logca}}\downarrow$ |
|---|---|---|---|---|---|---|---|---|
| SMILI | 22.67 (3.13) | 27.79 (4.02) | 1.878 (0.952) | 17.612 (10.299) | 20.85 (2.90) | 25.24 (3.86) | 1.209 (0.169) | 21.788 (12.491) |
| EHT-Imaging | 24.28 (3.63) | 28.57 (4.52) | 1.251 (0.250) | 1.259 (0.316) | 22.67 (3.46) | 26.66 (3.93) | 1.166 (0.156) | 1.240 (0.205) |
| DPS | 25.86 (3.90) | 32.94 (6.19) | 8.759 (37.784) | 5.456 (24.185) | 24.36 (3.72) | 30.79 (5.75) | 13.052 (43.087) | 6.614 (26.789) |
| LGD | 21.22 (3.64) | 26.06 (4.98) | 13.239 (17.231) | 13.233 (39.107) | 22.08 (3.75) | 27.48 (5.09) | 10.775 (21.684) | 13.375 (56.397) |
| RED-Diff | 23.77 (4.13) | 29.13 (6.22) | 1.853 (0.938) | 2.050 (2.361) | 22.53 (3.02) | 27.67 (4.53) | 2.488 (2.925) | 4.916 (13.221) |
| PnPDM | 26.07 (3.70) | 32.88 (6.02) | 1.311 (0.195) | 1.199 (0.221) | 24.57 (3.47) | 30.80 (5.22) | 1.433 (0.417) | 1.336 (0.478) |
| DAPS | 25.60 (3.64) | 32.78 (5.68) | 1.300 (0.324) | 1.229 (0.532) | 23.99 (3.56) | 30.10 (5.13) | 1.545 (0.705) | 2.253 (9.903) |
| DiffPIR | 25.01 (4.64) | 31.86 (6.56) | 3.271 (1.623) | 2.970 (1.202) | 23.84 (3.59) | 30.04 (5.03) | 5.374 (3.733) | 5.205 (5.556) |
| DPS+CAT（本文） | 27.94 (3.95) | 35.94 (6.17) | 2.625 (13.114) | 1.663 (4.784) | 26.35 (4.04) | 33.14 (5.99) | 1.239 (0.222) | 1.264 (0.221) |

### 表 5：COCO 2017 验证描述上的无分类器文本到图像引导（1000 条描述；原 PDF 第 14 页）

原文加粗标出每个引导尺度下最佳的 CLIP 与 FID。

| 尺度 $w$ | 方法 | CLIP↑ | FID↓ | 饱和度 | 对比度 |
|---|---|---|---|---|---|
| 10 | CFG | 31.6905 | 66.63 | 0.2901 | 0.2352 |
| 10 | APG | 31.4236 | 65.26 | 0.2014 | 0.1689 |
| 10 | CFG+CAT（本文） | 31.2664 | 64.67 | 0.2228 | 0.1943 |
| 20 | CFG | 31.8678 | 69.85 | 0.3538 | 0.2728 |
| 20 | APG | 31.7346 | 67.04 | 0.2212 | 0.1865 |
| 20 | CFG+CAT（本文） | 31.2742 | 65.59 | 0.2263 | 0.1974 |
| 50 | CFG | 31.6969 | 78.71 | 0.4332 | 0.3199 |
| 50 | APG | 31.9653 | 69.71 | 0.3213 | 0.2544 |
| 50 | CFG+CAT（本文） | 31.3065 | 65.48 | 0.2285 | 0.1991 |
| 100 | CFG | 30.6990 | 104.88 | 0.5228 | 0.3489 |
| 100 | APG | 32.0276 | 74.59 | 0.4473 | 0.3280 |
| 100 | CFG+CAT（本文） | 31.3109 | 66.26 | 0.2295 | 0.1996 |

### 图注

**图 1（原 PDF 第 1 页）：** 一个反向扩散步内的 CAT。宿主更新可能离开安全区域，而 CAT 用曲率自适应的法向—切向分配产生位于其中的 $x_t^-$。

**图 2（原 PDF 第 8 页）：** FFHQ 上基于 DPS 的方法在六个代表性逆问题上的定性比较。每个面板展示两个示例，其原图与测量相同。DPS+CAT 表示装备 CAT 的 DPS，DPS+Diffstate 为相应的 DiffState 基线。

**图 3（原 PDF 第 9 页）：** 在 FFHQ 运动去模糊上对引导步长 $\omega$ 的鲁棒性。每个点聚合 100 幅图像。

**图 4（原 PDF 第 9 页）：** FFHQ 运动去模糊上对引导步长的定性鲁棒性。行对应 PSLD、PSLD+DiffState 与 PSLD+CAT；列展示真值标签、模糊测量以及取五个 $\omega$ 值得到的重建。

**图 5（原 PDF 第 9 页）：** PSLD+CAT 在 FFHQ 运动去模糊上对管半径系数 $\rho$ 的鲁棒性。每个点聚合 100 幅图像，水平虚线标出主实验中报告的 PSLD 结果。

**图 6（原 PDF 第 10 页）：** PSLD+CAT 在 FFHQ 运动去模糊上对管半径系数的定性鲁棒性。列依次为真值标签、模糊测量、主实验中 PSLD 的重建，以及同一输入下取五个 $\rho$ 值的 PSLD+CAT 重建。

**图 7（原 PDF 第 10 页）：** 在 FFHQ 运动去模糊上对测量噪声标准差 $\sigma_y$ 的鲁棒性。每个点聚合 100 幅图像。

**图 8（原 PDF 第 10 页）：** FFHQ 运动去模糊上对测量噪声的定性鲁棒性。最左图为真值标签；行对应四个噪声水平，列展示测量及各方法对同一输入的重建。

**图 9（原 PDF 第 11 页）：** FFHQ 上的定性分量消融。第一行用 DPS 做非线性去模糊，第二行用 PSLD 做运动去模糊；每行在各变体间共享同一真值与测量。

**图 10（原 PDF 第 13 页）：** InverseBench 中同一真值源在 100%（上）与 10%（下）观测时间下的定性黑洞成像结果。

**图 11（原 PDF 第 14 页）：** 引导尺度 $w=100$ 下的定性比较。每个三图组内所有方法使用相同提示与初始种子；从左到右两组对应 "A bird that is on a tree limb" 与 "A polar bear dives off a rock into a river"。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[2] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[3] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in neural information processing systems, 35:23593–23606, 2022.

[4] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In The Eleventh International Conference on Learning Representations, 2023.

[5] Enze Jiang, Jishen Peng, Zheng Ma, and Xiong-Bin Yan. Ode-dps: Ode-based diffusion posterior sampling for linear inverse problems in partial differential equation. Journal of Scientific Computing, 102(3):69, 2025.

[6] Jishen Peng, Enze Jiang, Zheng Ma, and Xiongbin Yan. Robust physics-guided diffusion for full-waveform inversion. arXiv preprint arXiv:2603.16393, 2026.

[7] Chen Min and Zheng Ma. Decoupled latent optimization of diffusion models for full waveform inversion. arXiv preprint arXiv:2606.14139, 2026.

[8] Hyungjin Chung and Jong Chul Ye. Score-based diffusion models for accelerated mri. Medical image analysis, 80:102479, 2022.

[9] Hyungjin Chung, Dohoon Ryu, Michael T McCann, Marc L Klasky, and Jong Chul Ye. Solving 3d inverse problems using pre-trained 2d diffusion models. In 2023 IEEE/CVF conference on computer vision and pattern recognition (CVPR), pages 22542–22551. IEEE, 2023.

[10] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.

[11] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. Advances in neural information processing systems, 35:25683–25696, 2022.

[12] Yutong He, Naoki Murata, Chieh-Hsin Lai, Yuhta Takida, Toshimitsu Uesaka, Dongjun Kim, WeiHsiang Liao, Yuki Mitsufuji, Zico Kolter, Ruslan Salakhutdinov, et al. Manifold preserving guided diffusion. In International Conference on Learning Representations, volume 2024, pages 44819–44850, 2024.

[13] Shayan Mohajer Hamidi and En-Hui Yang. Score-based manifold projection for diffusion-based inverse problems. In 2025 IEEE International Symposium on Information Theory (ISIT), pages 1–6. IEEE, 2025.

[14] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In 2023 IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops (CVPRW), pages 1219–1229. IEEE, 2023.

[15] Xingyu Xu and Yuejie Chi. Provably robust score-based diffusion posterior sampling for plug-and-play image reconstruction. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.

[16] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. In 2025 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 20895–20905. IEEE, 2025.

[17] Bowen Song, Soo Min Kwon, Zecheng Zhang, Xinyu Hu, Qing Qu, and Liyue Shen. Solving inverse problems with latent diffusion models via hard data consistency. In International Conference on Learning Representations, volume 2024, pages 7624–7654, 2024.

[18] Hyungjin Chung, Jong Chul Ye, Peyman Milanfar, and Mauricio Delbracio. Prompt-tuning latent diffusion models for inverse problems. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 8941–8967. PMLR, 21–27 Jul 2024.

[19] Litu Rout, Yujia Chen, Abhishek Kumar, Constantine Caramanis, Sanjay Shakkottai, and Wen-Sheng Chu. Beyond first-order tweedie: Solving inverse problems using latent diffusion. In 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 9472–9481. IEEE, 2024.

[20] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.

[21] Rayhan Zirvi, Bahareh Tolooshams, et al. Diffusion state-guided projected gradient for inverse problems. In International Conference on Learning Representations, volume 2025, pages 31217–31242, 2025.

[22] Xiang Li, Soo Min Kwon, Shijun Liang, Ismail Alkhouri, Saiprasad Ravishankar, and Qing Qu. Dcdp: Decoupled data consistency via diffusion purification for inverse problems. In 2026 IEEE International Conference on Computational Photography (ICCP), pages 1–15. IEEE, 2026.

[23] Jia-Wei Liao, Li-Xuan Peng, Mei-Heng Yueh, Min Sun, Cheng-Fu Chou, and Jun-Cheng Chen. Diffrgd: An inference-time diffusion guidance through riemannian gradient descent. arXiv preprint arXiv:2606.28417, 2026.

[24] Hongkai Zheng, Wenda Chu, Bingliang Zhang, Zihui Wu, Austin Wang, Berthy Feng, Caifeng Zou, Yu Sun, Nikola Kovachki, Zachary Ross, et al. Inversebench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In International Conference on Learning Representations, volume 2025, pages 90912–90940, 2025.

[25] Jonathan Ho and Tim Salimans. Classifier-free diffusion guidance. In NeurIPS 2021 Workshop on Deep Generative Models and Downstream Applications, 2021.

[26] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In 2022 IEEE/CVF conference on computer vision and pattern recognition (CVPR), pages 10674–10685. ieee, 2022.

[27] Tsung-Yi Lin, Michael Maire, Serge Belongie, James Hays, Pietro Perona, Deva Ramanan, Piotr Dollár, and C Lawrence Zitnick. Microsoft coco: Common objects in context. In European conference on computer vision, pages 740–755. Springer, 2014.

[28] Seyedmorteza Sadat, Otmar Hilliges, and Romann M. Weber. Eliminating oversaturation and artifacts of high guidance scales in diffusion models. In The Thirteenth International Conference on Learning Representations, 2025.

[29] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pages 8748–8763. PmLR, 2021.

[30] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. Gans trained by a two time-scale update rule converge to a local nash equilibrium. Advances in neural information processing systems, 30, 2017.

[31] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat gans on image synthesis. Advances in neural information processing systems, 34:8780–8794, 2021.

## 附录 A：主要结果的证明（原 PDF 第 16—21 页）

### A.1 定理 2 的证明

记 $r_t(x):=r(x,\mathcal M_t)$。在锚点处

$$
\phi_t(x_t)-c_t=0,\qquad D\phi_t(x_t)=s_t^{\top},\qquad\operatorname{rank}D\phi_t(x_t)=1.\tag{15}
$$

由正则水平集定理可得

$$
\dim\mathcal M_t=D-1,\qquad T_{x_t}\mathcal M_t\subseteq\ker(s_t^{\top}).\tag{16}
$$

事实上，对任意 $C^1$ 曲线 $\gamma:(-\epsilon,\epsilon)\to\mathcal M_t$ 且 $\gamma(0)=x_t$，

$$
0=\left.\frac{d}{d\tau}\left(\phi_t(\gamma(\tau))-c_t\right)\right|_{\tau=0}=s_t^{\top}\gamma'(0).\tag{17}
$$

由于

$$
\dim T_{x_t}\mathcal M_t=D-1=\dim\ker(s_t^{\top}),\tag{18}
$$

（16）为等式：

$$
T_{x_t}\mathcal M_t=\ker(s_t^{\top})=\{v\in\mathbb R^D:s_t^{\top}v=0\}.\tag{19}
$$

此外

$$
\|\nu_t\|_2=1,\quad P_{N,t}^2=P_{N,t},\quad P_{T,t}^2=P_{T,t},\quad P_{N,t}P_{T,t}=0,\quad P_{N,t}+P_{T,t}=I.\tag{20}
$$

把（6）的 score 与 score 范数记号延拓到邻近点：

$$
s_t(x):=\nabla\phi_t(x),\qquad g_t(x):=\|s_t(x)\|_2,\qquad \nu_t(x)=\frac{s_t(x)}{g_t(x)},\tag{21}
$$

故 $s_t(x_t)=s_t$、$g_t(x_t)=g_t$。对每个 $v\in\mathbb R^D$，

$$
Ds_t(x_t)[v]=H_tv.\tag{22}
$$

由 $g_t(x)^2=s_t(x)^{\top}s_t(x)$ 求导得

$$
2g_t(x_t)Dg_t(x_t)[v]=2s_t(x_t)^{\top}Ds_t(x_t)[v],\qquad Dg_t(x_t)[v]=\frac{s_t^{\top}H_tv}{g_t}=\nu_t^{\top}H_tv.\tag{23}
$$

因此

$$
D\nu_t(x_t)[v]=\frac{Ds_t(x_t)[v]}{g_t}-\frac{s_t}{g_t^2}Dg_t(x_t)[v]=\frac{1}{g_t}\left(H_tv-\nu_t\nu_t^{\top}H_tv\right)=\frac{1}{g_t}P_{T,t}H_tv.\tag{24}
$$

把自变量与结果投影到切空间：

$$
P_{T,t}D\nu_t(x_t)P_{T,t}=\frac{1}{g_t}P_{T,t}H_tP_{T,t}=B_t.\tag{25}
$$

于是对 $u=P_{T,t}u$ 且 $\|u\|_2=1$ 有

$$
\kappa_t(u)=u^{\top}D\nu_t(x_t)[u]=u^{\top}B_tu=\frac{u^{\top}H_tu}{g_t},\tag{26}
$$

这证明了（7）。在 $\mathcal M_t$ 及其管状邻域内

$$
r_t|_{\mathcal M_t}=0,\qquad\nabla r_t(z)=\nu_t(z)\ (z\in\mathcal M_t),\qquad\|\nabla r_t(x)\|_2^2=1.\tag{27}
$$

对每个 $w\in\mathbb R^D$，

$$
0=\frac{1}{2}D\left(\|\nabla r_t(x)\|_2^2\right)[w]=w^{\top}\nabla^2r_t(x)\nabla r_t(x).\tag{28}
$$

由于这对一切 $w$ 成立，

$$
\nabla^2r_t(x)\nabla r_t(x)=0,\qquad\nabla^2r_t(x_t)\nu_t=0,\qquad\nu_t^{\top}\nabla^2r_t(x_t)=0.\tag{29}
$$

对 $v\in T_{x_t}\mathcal M_t$，取 $\gamma(0)=x_t$、$\gamma'(0)=v$ 代入（17），对 $\nabla r_t(\gamma(\tau))=\nu_t(\gamma(\tau))$ 在 $\tau=0$ 求导得

$$
\nabla^2r_t(x_t)v=D\nu_t(x_t)[v].\tag{30}
$$

由（25）、（29）与（20）得

$$
\nabla^2r_t(x_t)=(P_{N,t}+P_{T,t})\nabla^2r_t(x_t)(P_{N,t}+P_{T,t})=P_{T,t}\nabla^2r_t(x_t)P_{T,t}=\frac{1}{g_t}P_{T,t}H_tP_{T,t}=B_t.\tag{31}
$$

对位于 $U_t$ 内的位移 $d$（线段 $\{x_t+\tau d:0\leq\tau\leq1\}$ 位于 $U_t$），定义

$$
\psi_d(\tau):=r_t(x_t+\tau d).\tag{32}
$$

则

$$
\psi_d(0)=0,\quad\psi_d'(0)=\nu_t^{\top}d_N,\quad\psi_d''(0)=d^{\top}\nabla^2r_t(x_t)d=d_T^{\top}B_td_T,\quad\psi_d'''(\tau)=D^3r_t(x_t+\tau d)[d,d,d].\tag{33}
$$

带积分余项的 Taylor 公式给出

$$
r_t(x_t+d)=\psi_d(1)=\psi_d(0)+\psi_d'(0)+\frac{1}{2}\psi_d''(0)+\mathcal R_3(d)=\nu_t^{\top}d_N+\frac{1}{2}d_T^{\top}B_td_T+\mathcal R_3(d),\tag{34}
$$

其中

$$
\mathcal R_3(d)=\frac{1}{2}\int_0^1(1-\tau)^2D^3r_t(x_t+\tau d)[d,d,d]\,d\tau.\tag{35}
$$

因此

$$
|\mathcal R_3(d)|\leq\frac{1}{2}\int_0^1(1-\tau)^2\|D^3r_t(x_t+\tau d)\|_{\mathrm{op}}\|d\|_2^3\,d\tau\leq\frac{M_3}{2}\|d\|_2^3\int_0^1(1-\tau)^2\,d\tau=\frac{M_3}{6}\|d\|_2^3.\tag{36}
$$

（34）与（36）证明了（8）。

### A.2 定理 3 的证明

为记号简洁，令

$$
m_t(r_N,r_T):=-a_tr_N-b_tr_T+\frac{r_N^2+r_T^2}{2\alpha_t},\quad c_t(r_N,r_T):=r_N+\frac{1}{2}K_tr_T^2-R_t,\quad \mathcal C_t:=\{(r_N,r_T)\in\mathbb R_+^2:c_t(r_N,r_T)\leq0\}.\tag{37}
$$

其 Hessian 为

$$
\nabla^2m_t=\frac{1}{\alpha_t}I_2\succ0,\qquad\nabla^2c_t=\begin{bmatrix}0&0\\0&K_t\end{bmatrix}\succeq0.\tag{38}
$$

故 $m_t$ 严格凸且 $\mathcal C_t$ 凸。此外

$$
m_t(r_N,r_T)=\frac{1}{2\alpha_t}\left\|\begin{bmatrix}r_N\\r_T\end{bmatrix}-\alpha_t\begin{bmatrix}a_t\\b_t\end{bmatrix}\right\|_2^2-\frac{\alpha_t}{2}\left(a_t^2+b_t^2\right),\tag{39}
$$

从而

$$
\lim_{\|(r_N,r_T)\|_2\to\infty}m_t(r_N,r_T)=+\infty.\tag{40}
$$

集合 $\mathcal C_t$ 非空（因 $(0,0)\in\mathcal C_t$）且闭（$c_t$ 连续）。对 $K_t>0$，取

$$
0<\epsilon<\min\left\{\frac{R_t}{2},\sqrt{\frac{R_t}{K_t}}\right\};\tag{41}
$$

则

$$
\epsilon+\frac{1}{2}K_t\epsilon^2<\frac{R_t}{2}+\frac{R_t}{2}=R_t.\tag{42}
$$

对 $K_t=0$，任意 $0<\epsilon<R_t$ 都给出同样的严格不等式。于是

$$
c_t(\epsilon,\epsilon)<0,\qquad-\epsilon<0,\qquad-\epsilon<0.\tag{43}
$$

对乘子 $\lambda_t,\mu_N,\mu_T\geq0$，定义

$$
\mathcal L=-a_tr_N-b_tr_T+\frac{r_N^2+r_T^2}{2\alpha_t}+\lambda_t\left(r_N+\frac{1}{2}K_tr_T^2-R_t\right)-\mu_Nr_N-\mu_Tr_T.\tag{44}
$$

Slater 条件成立，故（38）—（43）蕴含

$$
\arg\min_{(r_N,r_T)\in\mathcal C_t}m_t(r_N,r_T)=\{(r_{N,t}^{\star},r_{T,t}^{\star})\},\qquad \min_{\mathcal C_t}m_t=\max_{\lambda_t,\mu_N,\mu_T\geq0}\inf_{(r_N,r_T)\in\mathbb R^2}\mathcal L,\qquad (r_N,r_T)\ \text{最优}\iff\text{满足 KKT 系统}.\tag{45}
$$

完整 KKT 系统为

$$
\begin{cases}
-a_t+\dfrac{r_N}{\alpha_t}+\lambda_t-\mu_N=0,\\[2pt]
-b_t+\dfrac{r_T}{\alpha_t}+\lambda_tK_tr_T-\mu_T=0,\\[2pt]
r_N+\dfrac{1}{2}K_tr_T^2-R_t\leq0,\quad r_N,r_T,\lambda_t,\mu_N,\mu_T\geq0,\\[2pt]
\lambda_t\left(r_N+\dfrac{1}{2}K_tr_T^2-R_t\right)=0,\quad \mu_Nr_N=\mu_Tr_T=0.
\end{cases}\tag{46}
$$

法向平稳性与互补松弛条件给出

$$
(r_N>0\Rightarrow\mu_N=0,\ r_N=\alpha_t(a_t-\lambda_t),\ \lambda_t<a_t;\qquad r_N=0\Rightarrow\mu_N=\lambda_t-a_t\geq0,\ \lambda_t\geq a_t).\tag{47}
$$

因此

$$
r_N(\lambda_t)=\alpha_t(a_t-\lambda_t)_+.\tag{48}
$$

若 $b_t>0$ 且 $r_T=0$，切向平稳性将要求

$$
-b_t-\mu_T=0\Rightarrow\mu_T=-b_t<0,\tag{49}
$$

与对偶可行性矛盾。因此 $r_T>0$、$\mu_T=0$，且

$$
\left(\frac{1}{\alpha_t}+\lambda_tK_t\right)r_T=b_t\Rightarrow r_T(\lambda_t)=\frac{\alpha_tb_t}{1+\alpha_t\lambda_tK_t}.\tag{50}
$$

若 $b_t=0$，切向平稳性与互补松弛给出

$$
r_T\left[\left(\frac{1}{\alpha_t}+\lambda_tK_t\right)r_T-\mu_T\right]=\left(\frac{1}{\alpha_t}+\lambda_tK_t\right)r_T^2=0\Rightarrow r_T=0,\tag{51}
$$

这也与（50）一致。因此（48）与（50）证明了 $r_{N,t}(\lambda_t)$ 与 $r_{T,t}(\lambda_t)$ 的所述闭式表达式。

在 $\lambda_t=0$ 处，

$$
(r_N(0),r_T(0))=(\alpha_ta_t,\alpha_tb_t),\tag{52}
$$

其约束值为

$$
F_t(0)-R_t=\alpha_ta_t+\frac{1}{2}K_t(\alpha_tb_t)^2-R_t.\tag{53}
$$

若 $\alpha_ta_t+\frac{1}{2}K_t(\alpha_tb_t)^2\leq R_t$，则 $\lambda_t=0$ 与（48）—（50）满足（46），从而给出唯一最优解。若该条件不成立，则（53）蕴含 $\lambda_t\neq0$。因此 $\lambda_t>0$，互补松弛强制

$$
r_N(\lambda_t)+\frac{1}{2}K_tr_T(\lambda_t)^2=R_t,\tag{54}
$$

这正是（10）。对 $\lambda\geq0$，定义

$$
F_t(\lambda)=\alpha_t(a_t-\lambda)_++\frac{K_t\alpha_t^2b_t^2}{2(1+\alpha_t\lambda K_t)^2}.\tag{55}
$$

它满足

$$
F_t(0)>R_t>0,\qquad\lim_{\lambda\to\infty}F_t(\lambda)=0<R_t.\tag{56}
$$

在 $\lambda<a_t$ 上，

$$
F_t'(\lambda)=-\alpha_t-\frac{K_t^2\alpha_t^3b_t^2}{(1+\alpha_t\lambda K_t)^3}<0.\tag{57}
$$

在 $\lambda>a_t$ 上，

$$
F_t'(\lambda)=-\frac{K_t^2\alpha_t^3b_t^2}{(1+\alpha_t\lambda K_t)^3}\leq0.\tag{58}
$$

连续性与（56）保证根存在。对 $0\leq\lambda_1<\lambda_2$ 且 $F_t(\lambda_1)>0$，

$$
\lambda_1<a_t\Rightarrow F_t(\lambda_2)<F_t(\lambda_1),\qquad\lambda_1\geq a_t\Rightarrow K_tb_t>0\Rightarrow F_t(\lambda_2)<F_t(\lambda_1).\tag{59}
$$

因此正水平 $R_t$ 上不可能存在两个不同根，故（10）的非负解唯一。

### A.3 定理 4 的证明

对任意位于 $L_g$-光滑邻域内的更新位移 $d$，

$$
L_t(x_t+d)-L_t(x_t)=\int_0^1\nabla L_t(x_t+\tau d)^{\top}d\,d\tau=q_t^{\top}d+\int_0^1\left[\nabla L_t(x_t+\tau d)-\nabla L_t(x_t)\right]^{\top}d\,d\tau\leq q_t^{\top}d+\frac{L_g}{2}\|d\|_2^2.\tag{60}
$$

令

$$
d_t^{\star}=-r_{N,t}^{\star}e_{N,t}-r_{T,t}^{\star}e_{T,t}.\tag{61}
$$

法向与切向分量的正交性给出

$$
q_t^{\top}d_t^{\star}=-a_tr_{N,t}^{\star}-b_tr_{T,t}^{\star},\qquad\|d_t^{\star}\|_2^2=(r_{N,t}^{\star})^2+(r_{T,t}^{\star})^2.\tag{62}
$$

由于 $(0,0)$ 可行，

$$
m_t(r_{N,t}^{\star},r_{T,t}^{\star})\leq m_t(0,0)=0.\tag{63}
$$

若 $a_t>0$，取

$$
0<\epsilon_N<\min\{R_t,2\alpha_ta_t\}.\tag{64}
$$

则 $(\epsilon_N,0)$ 可行且

$$
m_t(\epsilon_N,0)=-a_t\epsilon_N+\frac{\epsilon_N^2}{2\alpha_t}=-\epsilon_N\left(a_t-\frac{\epsilon_N}{2\alpha_t}\right)<0.\tag{65}
$$

若 $a_t=0$ 且 $b_t>0$，取

$$
0<\epsilon_T<\begin{cases}\min\left\{2\alpha_tb_t,\sqrt{2R_t/K_t}\right\},&K_t>0,\\2\alpha_tb_t,&K_t=0.\end{cases}\tag{66}
$$

则 $(0,\epsilon_T)$ 可行且

$$
m_t(0,\epsilon_T)=-b_t\epsilon_T+\frac{\epsilon_T^2}{2\alpha_t}=-\epsilon_T\left(b_t-\frac{\epsilon_T}{2\alpha_t}\right)<0.\tag{67}
$$

因此

$$
q_t\neq0\Rightarrow a_t>0\ \text{或}\ b_t>0\Rightarrow m_t(r_{N,t}^{\star},r_{T,t}^{\star})<0.\tag{68}
$$

由（62）得

$$
m_t(r_{N,t}^{\star},r_{T,t}^{\star})=q_t^{\top}d_t^{\star}+\frac{1}{2\alpha_t}\|d_t^{\star}\|_2^2.\tag{69}
$$

对 $0<\alpha_t\leq1/L_g$，

$$
L_t(x_t+d_t^{\star})-L_t(x_t)\leq q_t^{\top}d_t^{\star}+\frac{L_g}{2}\|d_t^{\star}\|_2^2\leq q_t^{\top}d_t^{\star}+\frac{1}{2\alpha_t}\|d_t^{\star}\|_2^2=m_t(r_{N,t}^{\star},r_{T,t}^{\star})\leq0.\tag{70}
$$

（68）与（70）使 $q_t\neq0$ 时最后的不等式严格，从而证明了所述全步下降。对任意 $\alpha_t>0$，（68）与（69）蕴含

$$
q_t^{\top}d_t^{\star}<-\frac{1}{2\alpha_t}\|d_t^{\star}\|_2^2<0\qquad(q_t\neq0).\tag{71}
$$

对 $\gamma\in(0,1]$，把（60）用于 $\gamma d_t^{\star}$：

$$
L_t(x_t+\gamma d_t^{\star})-L_t(x_t)\leq\gamma q_t^{\top}d_t^{\star}+\frac{L_g}{2}\gamma^2\|d_t^{\star}\|_2^2.\tag{72}
$$

只要

$$
\gamma q_t^{\top}d_t^{\star}+\frac{L_g}{2}\gamma^2\|d_t^{\star}\|_2^2\leq c\gamma q_t^{\top}d_t^{\star}\iff\gamma\leq\gamma_t:=\frac{2(1-c)(-q_t^{\top}d_t^{\star})}{L_g\|d_t^{\star}\|_2^2},\tag{73}
$$

Armijo 不等式即成立。定义

$$
\gamma_{\mathrm{req}}:=\min\{1,\gamma_t\},\qquad j^{\star}:=\max\left\{0,\left\lceil\frac{\log\gamma_{\mathrm{req}}}{\log\beta}\right\rceil\right\}.\tag{74}
$$

因 $0<\beta<1$，

$$
0<\beta^{j^{\star}}\leq\gamma_{\mathrm{req}}\leq\gamma_t.\tag{75}
$$

因此 Armijo 回溯至多在第 $j^{\star}$ 次迭代被接受，且

$$
L_t(x_t+\beta^{j^{\star}}d_t^{\star})\leq L_t(x_t)+c\beta^{j^{\star}}q_t^{\top}d_t^{\star}<L_t(x_t),\tag{76}
$$

这证明了（12）。最后，对任意被接受的 $\gamma_t\in(0,1]$，

$$
\gamma_tr_{N,t}^{\star}+\frac{1}{2}K_t\gamma_t^2(r_{T,t}^{\star})^2\leq\gamma_t\left[r_{N,t}^{\star}+\frac{1}{2}K_t(r_{T,t}^{\star})^2\right]\leq\gamma_tR_t\leq R_t,\tag{77}
$$

这证明了所述二阶可行性。

## 附录 B：可复现性与超参数设置（原 PDF 第 21—23 页）

**逆问题算子。** 自然图像基准使用缺失像素概率为 0.7 的随机掩码修复、$128\times128$ 掩码的盒式修复、$4\times$ 超分辨率、核为 $61\times61$、强度分别为 0.5 与 3.0 的运动与高斯去模糊、高动态范围重建以及非线性去模糊。除评估多个噪声水平的噪声鲁棒性实验外，每个任务都加入标准差 $\sigma_y=0.05$ 的高斯测量噪声。

**配置报告协议。** 表 6—8 汇总表 1 中自然图像实验所用的超参数；表 6 还报告表 4 中科学逆问题所用的 DPS+CAT 配置与表 5 所用的 CFG+CAT 配置。对逆问题积分，$\rho$ 控制噪声相关管预算 $R_t=\rho\sigma_t$，$p$ 表示 Armijo 评估之间的间隔，$N$ 为反向采样步数。全程使用 Armijo 常数 $c=10^{-4}$ 与 $\beta=0.5$，在该上限可配置时最多做三次回溯试验。除非这些表中另有报告，DPS+CAT、PSLD+CAT 与 Resample+CAT 的超参数分别与 DPS [10]、PSLD [20] 与 ReSample [17] 的相同。

**预训练模型来源。** 对像素空间实验，FFHQ 先验是 Chung 等 [10] 随 DPS 发布的预训练扩散模型，ImageNet 先验是 Dhariwal 与 Nichol [31] 的无条件 $256\times256$ 扩散模型。对潜空间实验，FFHQ 先验是公开的 LDM-VQ-4 checkpoint，ImageNet 先验是 Rombach 等 [26] 发布的公开类条件 LDM-VQ-8 checkpoint。科学扩展使用 InverseBench [24] 发布的公开 $64\times64$ 黑洞扩散先验。CFG+CAT 使用公开 Stable Diffusion 2.1 checkpoint `sd2-community/stable-diffusion-2-1`（https://huggingface.co/sd2-community/stable-diffusion-2-1）的原生 $768\times768$ 分辨率。所有扩散先验都未经重训练或任务特定微调。

### 表 6：自然图像、科学逆问题与文本到图像实验所用的 DPS+CAT 与 CFG+CAT 超参数（原 PDF 第 22 页）

宿主引导步对自然图像对应 scale、对 InverseBench 对应 step_size、对 COCO 对应 CFG 尺度 $w$。$\rho$、$p$、$N$ 分别为管半径系数、Armijo 周期与去噪步数。所有 CFG+CAT 运行使用 score 范数阈值 $10^{-8}$，二分法迭代 30 次、容差 $10^{-4}$。

| 数据集 | 逆问题 | 宿主步长 | $\rho$ | $p$ | $N$ |
|---|---|---|---|---|---|
| FFHQ | 随机修复 | 4.0 | 0.1 | 1 | 1000 |
| FFHQ | 盒式修复 | 2.0 | 0.1 | 1 | 1000 |
| FFHQ | 超分辨率 | 2.0 | 0.1 | 1 | 1000 |
| FFHQ | 运动去模糊 | 5.0 | 0.1 | 1 | 1000 |
| FFHQ | 高斯去模糊 | 5.0 | 0.1 | 1 | 1000 |
| FFHQ | HDR 重建 | 10.0 | 0.1 | 1 | 1000 |
| FFHQ | 非线性去模糊 | 5.0 | 0.1 | 1 | 1000 |
| ImageNet | 随机修复 | 2.0 | 1.0 | 1 | 1000 |
| ImageNet | 盒式修复 | 4.0 | 1.0 | 1 | 1000 |
| ImageNet | 超分辨率 | 1.5 | 1.0 | 1 | 1000 |
| ImageNet | 运动去模糊 | 6.0 | 1.0 | 1 | 1000 |
| ImageNet | 高斯去模糊 | 5.0 | 1.0 | 1 | 1000 |
| ImageNet | HDR 重建 | 5.0 | 0.01 | 1 | 1000 |
| ImageNet | 非线性去模糊 | 10.0 | 1.0 | 1 | 1000 |
| InverseBench | 黑洞成像（100% 观测） | 95 | 0.0005 | 1 | 1000 |
| InverseBench | 黑洞成像（10% 观测） | 95 | 0.0005 | 1 | 1000 |
| COCO 2017 | 文本到图像 | 10/20/50/100 | 1.0 | 1 | 50 |

### 表 7：主实验所用的 PSLD+CAT 超参数（原 PDF 第 23 页）

PSLD 的原始超参数为潜数据一致性权重 $\gamma$ 与引导权重 $\omega$；其余记号沿用表 6。PSLD 在其宿主实现支持的五个线性逆问题上评估。

| 数据集 | 逆问题 | $\gamma$ | $\omega$ | $\rho$ | $p$ | $N$ |
|---|---|---|---|---|---|---|
| FFHQ | 随机修复 | 0.01 | 2.0 | 1.0 | 1 | 1000 |
| FFHQ | 盒式修复 | 0.01 | 0.5 | 1.0 | 1 | 1000 |
| FFHQ | 超分辨率 | 0.01 | 5.0 | 1.0 | 1 | 1000 |
| FFHQ | 运动去模糊 | 0.01 | 5.0 | 1.0 | 1 | 1000 |
| FFHQ | 高斯去模糊 | 0.10 | 10.0 | 1.0 | 1 | 1000 |
| ImageNet | 随机修复 | 0.10 | 4.0 | 0.1 | 1 | 1000 |
| ImageNet | 盒式修复 | 0.01 | 1.0 | 0.1 | 1 | 1000 |
| ImageNet | 超分辨率 | 0.10 | 2.0 | 0.1 | 1 | 1000 |
| ImageNet | 运动去模糊 | 0.10 | 1.0 | 0.1 | 1 | 1000 |
| ImageNet | 高斯去模糊 | 0.10 | 2.0 | 0.1 | 1 | 1000 |

### 表 8：主实验所用的 Resample+CAT 超参数（原 PDF 第 23 页）

sDPS 为软潜 DPS 步的尺度，$P_{tt}$ 为时间旅行（time-travel）周期，其余记号沿用表 6。

| 数据集 | 逆问题 | sDPS | $P_{tt}$ | $\rho$ | $p$ | $N$ |
|---|---|---|---|---|---|---|
| FFHQ | 随机修复 | 15.0 | 10 | 0.1 | 5 | 500 |
| FFHQ | 盒式修复 | 5.0 | 500 | 0.1 | 5 | 500 |
| FFHQ | 超分辨率 | 150.0 | 500 | 0.1 | 5 | 500 |
| FFHQ | 运动去模糊 | 5.0 | 10 | 0.1 | 5 | 500 |
| FFHQ | 高斯去模糊 | 10.0 | 10 | 0.1 | 5 | 500 |
| FFHQ | HDR 重建 | 30.0 | 500 | 0.1 | 1 | 500 |
| FFHQ | 非线性去模糊 | 1.0 | 10 | 0.1 | 1 | 500 |
| ImageNet | 随机修复 | 2.0 | 10 | 0.1 | 5 | 500 |
| ImageNet | 盒式修复 | 2.0 | 10 | 0.1 | 5 | 500 |
| ImageNet | 超分辨率 | 15.0 | 10 | 0.1 | 5 | 500 |
| ImageNet | 运动去模糊 | 2.5 | 10 | 0.1 | 5 | 500 |
| ImageNet | 高斯去模糊 | 2.0 | 10 | 0.1 | 5 | 500 |

**对比方法的设置。** 对 DPS、PSLD、ReSample、DDRM、DDNM、DAPS、DCDP、DiffRGD、DPS+Diffstate、PSLD+DiffState 与 Resample+Diffstate，凡其原论文报告了超参数的，我们采用该设置；未指定的超参数则通过网格搜索调优。

**本页范围与校对状态：** 本页依据 arXiv:2609.21251v1（cs.CV，2026-09-18，23 页；预印本标注 2026-09-21）完成全文中文翻译：摘要、第 1—6 节（含 2.1—2.2、4.1—4.2、5.1—5.5（含 5.5.1—5.5.2））、算法 1、致谢、图 1—11 中文图注、表 1—8 逐格转录、参考文献 [1]—[31] 英文原条目（按原编号）、附录 A（A.1—A.3，含式（15）—（77））与附录 B（含表 6—8）均按原文结构录入。编号公式 (1)—(77) 按原文保留（正文 (1)—(14)，附录 (15)—(77)）。表 1 与表 4 已用 PDF 第 7、13 页渲染图逐格核对；表 2 与表 5 已用第 11、14 页渲染图核对；表 3 及表 6—8 的数值按原文抽取文本转录（表 3 另经第 12 页渲染图核对）。**逐句逐式终校未做**；图内重建图像只转录图注与正文信息，未作数字化读取；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：表 1 中原文以加粗标出各任务/类型内最佳值，本页转录全部数值但未逐格复刻加粗样式；表 1 中 DPS+CAT 并非在每个任务/类型组合的每项指标上都最优（例如高斯去模糊 ImageNet 上其 FID 为 74.27），摘要中"最低 FID"的表述须结合 5.5.2 节文本到图像实验来理解；表 4 中 DPS+CAT 的 PSNR/Blur PSNR 在两种观测时间下均最高，但约化卡方仅在 10% 观测下最优（100% 观测下为 2.625/1.663，高于 PnPDM 的 1.311/1.199），已照原文数值转录。原文为预印本，无作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
