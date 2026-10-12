---
layout: page
title: "集合控制流滤波 EnCF：附录证明与实验细节中文译稿"
permalink: /papers/translations/2026-10-12-encf-appendix/
math: true
toc: true
---

{% raw %}
[← 返回正文](/papers/translations/2026-10-12-encf-main/) · [论文条目](/papers/items/5cc0d0d751befc62/) · [官方 PDF](https://arxiv.org/pdf/2607.12975v1)

# 附录：延期给出的证明与实验细节

**论文：** *Ensemble Controlled-Flow Filtering for Implicit Data Assimilation*。本页翻译原稿第 24–26 页的附录 A、B，包括命题 A.1、命题 4.5 的证明、定理 4.9 的证明及完整实验实现设置。第 20–23 页的参考文献保留作者英文正式书目信息，见[原论文参考文献](https://arxiv.org/pdf/2607.12975v1#page=20)。

## A. 延后给出的证明

### A.1 基础漂移的蒙特卡罗误差

**命题 A.1（基础漂移的蒙特卡罗误差）。** 固定 (z,τ)，且 β_τ>0。令 Ẑ_k^(j)∼π_k^f 为相互独立的预测样本，j=1,…,N。定义：

$$
d(z_0):=p_{\tau\mid0}(z\mid z_0),\qquad
\zeta(z_0):=\frac{\alpha_\tau z_0-z}{\beta_\tau^2},
$$

以及

$$
\hat g_N(z,\tau):=
\sum_{j=1}^Nw_j\zeta(\hat Z_k^{(j)})
\approx\nabla\log p_\tau(z_\tau)=:g(z,\tau).\tag{56}
$$

于是，ĝ_N 就是式 (23) 中边缘 score g(z,τ) 的**自归一化估计量**。在假设 3.2 下，如果 E_{π_k^f}[d²]<∞ 且 E_{π_k^f}[||ζ||²d²]<∞，则 ĝ_N 强一致，并具有蒙特卡罗收敛率：

$$
\hat g_N-g=O_p(N^{-1/2}),\qquad
\mathbb E\|\hat g_N-g\|^2=O(N^{-1}).\tag{57}
$$

收敛阶数本身不随维度变化，但乘法常数与重要性权重的二阶矩有关：

$$
\rho:=
\frac{\mathbb E_{\pi_k^f}[d^2]}{p_\tau(z)^2}
=1+\chi^2(\pi^{z,\tau}\|\pi_k^f)\ge1,\qquad
\pi^{z,\tau}\propto\pi_k^f d.
$$

该 χ² 散度度量后验倾斜分布与预测先验间的差异。随着核尖锐化（β_τ→0，即 τ→1）或状态维数增大，它可能升高，令常数变差。因此所谓“与维度无关”指收敛的 N 阶数，而不是实际样本复杂度不受高维影响。

**证明。** ĝ_N 是比值

$$
g=\frac{\mathbb E_{\pi_k^f}[\zeta d]}{\mathbb E_{\pi_k^f}[d]}
$$

的自归一化重要性采样估计。在所给二阶矩条件下，式 (57) 是经典自归一化重要性采样中心极限定理的结果。误差常数随权重二阶矩 ρ 增大的依赖、即抽样问题的内在维数影响，可以由文献 [1] 的界定结果刻画。

### A.2 能量稳定性估计的证明

**命题 4.5 的证明。** 最优控制式 (20) 可以表示为基础转移核 score 在条件 Gibbs 倾斜分布下的加权平均：

$$
u^*_{J_r}(z,\tau)=
\sigma^2(\tau)
\frac{\int e^{-J_r(z')}\nabla_z p_{1\mid\tau}(z'\mid z)\,dz'}
{\int e^{-J_r(z')}p_{1\mid\tau}(z'\mid z)\,dz'}
=\sigma^2(\tau)\mathbb E_{\rho_r^{z,\tau}}
[\nabla_z\log p_{1\mid\tau}(\cdot\mid z)].\tag{58}
$$

沿同伦参数 r 在积分号内求导，可以依据控制收敛定理交换微分与积分。各被积函数的 r 导数由

$$
e^{-\inf_r J_r}|J_1-J_2|
\bigl(1+\|\nabla\log p_{1\mid\tau}\|\bigr)p_{1\mid\tau}
$$

控制，在假设 3.2 及有界 score 方差 V 的条件下可积。令 J_r=(1−r)J₁+rJ₂，则求导得到：

$$
\frac{d u^*_{J_r}}{dr}
=\sigma^2(\tau)
\operatorname{Cov}_{\rho_r^{z,\tau}}
\bigl(J_1-J_2,\nabla\log p_{1\mid\tau}(\cdot\mid z)\bigr).\tag{59}
$$

原因是 Gibbs 期望对 r 的导数恰是目标 score 与能量导数的协方差（相应符号可通过改变协方差项顺序写出）。对 r 从 0 积分至 1：

$$
u^*_{J_1}-u^*_{J_2}
=\sigma^2(\tau)\int_0^1
\operatorname{Cov}_{\rho_r^{z,\tau}}
\bigl(J_1-J_2,-\nabla\log p_{1\mid\tau}\bigr)\,dr.\tag{60}
$$

使用积分上确界与 Cauchy–Schwarz 不等式：

$$
\|u^*_{J_1}-u^*_{J_2}\|_\infty
\le\sigma^2(\tau)
\sup_{r\in[0,1]}
\sqrt{
\operatorname{Var}_{\rho_r}(J_1-J_2)
\operatorname{Tr}\operatorname{Var}_{\rho_r}
(\nabla\log p_{1\mid\tau})
}.\tag{61}
$$

再代入假设一致有界的 score 方差 V，以及共同 Poincaré 常数 C_P：

$$
\|u^*_{J_1}-u^*_{J_2}\|_\infty
\le\sigma^2(\tau)\sqrt{C_PV}
\|\nabla J_1-\nabla J_2\|_\infty.
$$

这便证明最优控制对终端能量梯度误差的连续依赖。

### A.3 多步滤波定理的证明

**定理 4.9 的证明。** 记：

$$
\pi_k^a=\Phi_{0\to k}(\pi_0^a),\qquad
\hat\pi_k^a=\hat\Phi_{0\to k}(\hat\pi_0^a),
\qquad k=0,1,\ldots.\tag{62}
$$

对第 l 步的实践分布与精确分布作望远镜分解。将一个实践同化步骤逐项替换为精确步骤，可写为：

$$
\hat\pi_l^a-\pi_l^a=
\sum_{k=0}^{l-1}
\left[
\Phi_{l-k\to l}(\hat\pi_{l-k}^a)
-\Phi_{l-k-1\to l}(\hat\pi_{l-k-1}^a)
\right]
+\Phi_{0\to l}(\hat\pi_0^a)-\Phi_{0\to l}(\pi_0^a).\tag{63}
$$

对 TV 使用三角不等式，再以假设 4.8 中的指数稳定性作用于每个传播到第 l 步的局部差异：

$$
d_l\le
\sum_{k=0}^{l-1}
C_{stab}\varrho^k
\operatorname{TV}
\bigl(\hat\pi_{l-k}^a,
\Phi_{l-k}(\hat\pi_{l-k-1}^a)\bigr)
+C_{stab}\varrho^l
\operatorname{TV}(\hat\pi_0^a,\pi_0^a).\tag{64}
$$

将每项 TV 以上文单步误差 e_{l−k} 表示，并用这些误差的最大值控制加权和；由于 ∑_{k=0}^{l−1}ϱ^k≤1/(1−ϱ)，立刻得到正文式 (46)：

$$
d_l\le C_{stab}\varrho^l d_0+
\frac{C_{stab}}{1-\varrho}\max_{1\le k\le l}e_k.
$$

因此在精确滤波指数稳定及局部误差一致有界时，最终误差不会随着同化次数线性或无界积累。

## B. 实验细节

**EnCF 配置。** 对正文式 (23) 的基础流采用以下插值系数：

$$
\alpha_\tau=\epsilon_\alpha+(1-\epsilon_\alpha)\tau,\quad
\beta_\tau=\sqrt{1-(1-\epsilon_\beta)\tau},\quad
(\epsilon_\alpha,\epsilon_\beta)=(0.5,0.025).\tag{65}
$$

此选择参考文献 [9]，其正则化作用在于抑制式 (22) 噪声调度在 τ→1 时的非有界行为。所有流式方法统一采用 N_τ=100 个输运时间步。

第 k 个周期训练控制网络的 epoch 数：

$$
E_k=\max\left\{1,\operatorname{round}\left[
1+\frac{99}{2}
\left(1+\cos\frac{\pi\min(k,20)}{20}\right)
\right]\right\}.\tag{66}
$$

因此前 20 个周期中 E_k 从约 100 降至 1，之后固定为 1。与单条 rollout 对应的 N_reg 个回归更新，采用一次批量前向评价。

**圆约束传感器能量。** 精确条件能量必须计入随状态 x 变化的归一化常数：

$$
Z(x)=\int
\exp\left[-\frac{(x^2+y_c^2-R^2)^2}{2\sigma_o^2}\right]
dy_c.\tag{67}
$$

作者按坐标独立计算 Z(x)，在

$$
|y_c|\le R+5\max(\sigma_o,10^{-3})\tag{68}
$$

的区间内进行 512 点数值求积，并使用 logsumexp 稳定化。log Z(x) 的梯度由穿过数值求积过程的自动微分计算。此归一化常数会随状态改变，因此如果把它当作与状态无关而丢掉，就不再是同一个严格条件观测律。这也是区分隐式关系与一般“平方残差能量”的关键细节。

**基线调参。** 对带扰动观测的 EnKF 和 LETKF，协方差膨胀系数从 {1.0,1.05,1.1,1.2} 中选择，Gaspari–Cohn 局部化半径固定为 4。每组配置评价五个随机种子。

**数值积分与初始化。** Kuramoto–Sivashinsky 方程采用谱方法积分，模型步长 Δt=0.25；在先运行 2000 步稳定化（spin-up）后，每四个模型步进行一次观测同化。初始集合由参考状态叠加相互独立的单位高斯扰动形成。§5.4 的双峰间距扫描使用 100 个同化周期。

双阱动力学采用 Euler–Maruyama 积分，步长 Δt=0.05，每个模型步中再细分为 10 个漂移子步。先运行 1000 步 spin-up，然后使用标准差为 1 的高斯扰动在两个势阱内初始化集合。

## 文献和源码

第 20–24 页的参考文献保留英文正式书目，可从 [官方 PDF 第 20 页](https://arxiv.org/pdf/2607.12975v1#page=20) 起核查。原稿最后一条为 [51] Z. Xiong 等（2026），*A two-step ensemble score filter for data assimilation in partially observed systems*，arXiv:2606.28264。

作者公开的实验代码：https://github.com/zylipku/EnCF 。这是原文“Reproducibility”部分提供的链接；代码的可执行性及当前仓库具体内容未在本译稿中独立复现。

{% endraw %}
