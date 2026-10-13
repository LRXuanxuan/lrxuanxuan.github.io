---
layout: page
title: "Flow Map Denoisers 附录 D：完整证明及高斯逆问题分析"
permalink: /papers/translations/2026-10-13-flow-map-appendix-d/
math: true
toc: true
---

{% raw %}
[← 论文正文](/papers/translations/2026-10-13-flow-map-denoisers-2606-19802/) · [补充实验 C.5—C.13](/papers/translations/2026-10-13-flow-map-appendix-c5-c13/) · [原文 PDF](https://arxiv.org/pdf/2606.19802v2)

# Flow Map Denoisers：附录 D 完整中文翻译

本页对应原文第 43—53 页的理论部分，包括 D.1—D.5、命题 1—2、引理 1—2、定理 1 的证明、二维高斯混合实验及 PnP 固定点分析。原文公式（15）—（38）按编号保留。

## D. 证明与理论结果

### D.1 平均去噪器

回顾平均去噪器的定义：

\[
D_{s,t}(x)=x+(1-s)v(x,s,t), \tag{15}
\]

这里 \(v(x,s,t)\) 是区间 \([s,t]\) 上的流映射平均速度，流映射表示为

\[
X_{s,t}(x)=x+(t-s)v(x,s,t). \tag{16}
\]

**命题 1（基本性质）。** 对所有 \(0\le s\le u\le t\le1\)，平均去噪器满足：

**1. 流映射关系：**

\[
X_{s,t}(x)=\frac{1-t}{1-s}x+\frac{t-s}{1-s}D_{s,t}(x). \tag{17}
\]

**2. 对角线一致性（MMSE）：**

\[
D_{s,s}(x)=D_s(x)=\mathbb E[x_1\mid x_s=x]. \tag{18}
\]

**3. 半群结构：**

\[
D_{s,t}(x)=\gamma D_{s,u}(x)+(1-\gamma)D_{u,t}(X_{s,u}(x)), \tag{19}
\]

其中

\[
\gamma=\frac{(1-t)(u-s)}{(1-u)(t-s)}\in[0,1]. \tag{20}
\]

此处有关分母为零的端点情形，按连续极限解释。

**证明。** （1）由参数化定义，

\[
D_{s,t}(x)-x=(1-s)v(x,s,t),\quad
X_{s,t}(x)-x=(t-s)v(x,s,t).
\]

消去 \(v\)，得到

\[
X_{s,t}(x)=x+\frac{t-s}{1-s}(D_{s,t}(x)-x)
=\frac{1-t}{1-s}x+\frac{t-s}{1-s}D_{s,t}(x).
\]

（2）由流映射定义，当 \(t\to s\) 时，\(v(x,s,t)\to v(x,s)\)，即瞬时速度。由 Tweedie 关系，

\[
D_s(x)=x+(1-s)v(x,s),
\]

正好等于 \(t=s\) 时的 \(D_{s,t}\)。

（3）流映射满足半群性质 \(X_{s,t}(x)=X_{u,t}(X_{s,u}(x))\)。分别将第（1）项的仿射表达式代入两侧，对 \(x\) 和 \(D_{s,t}\) 的系数进行整理，得到式（19）的凸组合及给定的 \(\gamma\)。证毕。

### D.2 高斯情形的完整推导（定理 1）

下面给出标量高斯目标下平均去噪器增益及其与最优 DP 估计器关系的完整推导。

#### D.2.1 设置

令 \(p_1=\mathcal N(0,\sigma_p^2)\)、\(\sigma_p^2\le1\)；令

\[
x_\tau=\tau x_1+(1-\tau)\epsilon,
\quad x_1\sim p_1,\quad
\epsilon\sim\mathcal N(0,1),\quad x_1\perp\epsilon.
\]

则 \(x_\tau\sim\mathcal N(0,\sigma_\tau^2)\)，其中 \(\sigma_\tau^2=\tau^2\sigma_p^2+(1-\tau)^2\)。瞬时去噪器和速度均是线性的：

\[
D_\tau(x)=a_\tau x,\quad
a_\tau=\frac{\tau\sigma_p^2}{\sigma_\tau^2},\quad
v_\tau(x)=b_\tau x,\quad
b_\tau=\frac{a_\tau-1}{1-\tau}
=\frac{\tau(\sigma_p^2+1)-1}{\sigma_\tau^2}. \tag{21}
\]

ODE \(\dot x_\tau=v_\tau(x_\tau)=b_\tau x_\tau\) 有闭式解 \(x_t=\Phi(t,s)x_s\)，其中 \(\Phi(t,s)=\exp(\int_s^t b_\tau\,d\tau)\)。区间平均速度满足

\[
x_t=x_s+(t-s)v_{s,t}(x_s),\qquad
v_{s,t}(x_s)=\frac{\Phi(t,s)-1}{t-s}x_s.
\]

由定义 \(D_{s,t}(x)=x+(1-s)v_{s,t}(x)\)，因此 \(D_{s,t}(x_s)=\Lambda(s,t)x_s\)，且

\[
\Lambda(s,t)=\frac{(1-s)\Phi(t,s)-(1-t)}{t-s}. \tag{22}
\]

为继续化简，先给出两个引理。

**引理 1（\(\Phi,\Lambda\) 的闭式表达）。** \(\Phi(t,s)=\sigma_t/\sigma_s\)。

**证明。** 直接计算

\[
\frac{d}{d\tau}\frac12\log\sigma_\tau^2
=\frac{\dot\sigma_\tau^2}{2\sigma_\tau^2}
=\frac{\tau(\sigma_p^2+1)-1}{\sigma_\tau^2}
=b_\tau.
\]

故 \(\int_s^t b_\tau\,d\tau=\log(\sigma_t/\sigma_s)\)，于是 \(\Phi(t,s)=\sigma_t/\sigma_s\)。证毕。

将引理代入式（22），得到正文式（9）的形式：

\[
\Lambda(s,t)=\frac{(1-s)\sigma_t-(1-t)\sigma_s}{\sigma_s(t-s)}. \tag{23}
\]

**边界值。** 当 \(t=1\)，\(\sigma_1=\sigma_p\)，所以 \(\Lambda(s,1)=\sigma_p/\sigma_s\)。当 \(t=s\)，对式（9）应用洛必达法则，利用 \(\dot\sigma_\tau=[\tau(\sigma_p^2+1)-1]/\sigma_\tau\)，得到

\[
\Lambda(s,s)=\frac{(1-s)\dot\sigma_s+\sigma_s}{\sigma_s}
=1+\frac{(1-s)[s(\sigma_p^2+1)-1]}{\sigma_s^2}
=\frac{s\sigma_p^2}{\sigma_s^2}=a_s. \tag{24}
\]

最后一个等号可通过展开 \(\sigma_s^2=s^2\sigma_p^2+(1-s)^2\) 验证。

**引理 2（\(\Lambda\) 的单调性）。** 固定 \(s\in(0,1)\)，映射 \(t\mapsto\Lambda(s,t)\) 在 \([s,1]\) 严格递增。

**证明。** 对式（9）按 \(t\) 微分，并用 \(\sigma_t-\sigma_s=\int_s^t\dot\sigma_u\,du\)：

\[
\partial_t\Lambda(s,t)=
\frac{1-s}{\sigma_s(t-s)^2}
\left[(t-s)\dot\sigma_t-\int_s^t\dot\sigma_u\,du\right]. \tag{25}
\]

设 \(c=\sigma_p^2+1\)，则 \(\sigma_\tau^2=c\tau^2-2\tau+1\)。直接求导：

\[
\ddot\sigma_\tau=
\frac{c\sigma_\tau^2-(c\tau-1)^2}{\sigma_\tau^3}
=\frac{\sigma_p^2}{\sigma_\tau^3}>0
\]

对全部 \(\tau\in(0,1)\) 成立，因此 \(\dot\sigma_\tau\) 严格递增，且 \(\int_s^t\dot\sigma_u\,du<(t-s)\dot\sigma_t\)。于是 \(\partial_t\Lambda>0\)。证毕。

**关于 \(\sigma_p^2\le1\) 假设。** 这只是说目标方差不超过标准高斯源的方差，符合图像数据常见的 [−1,1] 缩放，并非证明的必要条件。前述凸性对所有 \(\sigma_p>0\) 都成立；\(\sigma_p/\sigma_s>a_s\) 等价于 \(\sigma_s^2>s^2\sigma_p^2\)，对任意 \(s<1\) 成立。因此引理 2、命题 2 和定理 1 对任何 \(\sigma_p>0\) 有效。

#### D.2.2 与最优 DP 估计器的联系

**Freirich 等（2021）的最优 DP 估计器。** MMSE 估计量 \(\widehat X_0=a_sx_s\) 的标准差是 \(\widehat\sigma=a_s\sigma_s=s\sigma_p^2/\sigma_s\)，与先验的感知差距

\[
P^\star=W_2(p_{\widehat X_0},p_1)=|\sigma_p-\widehat\sigma|.
\]

从 \(\mathcal N(0,\widehat\sigma^2)\) 到 \(p_1=\mathcal N(0,\sigma_p^2)\) 的二阶 Wasserstein 最优传输映射是尺度变换 \(T^\star=\sigma_p/\widehat\sigma\)。根据 Freirich 等（2021，定理 3），在感知水平 \(P=\alpha P^\star\)、\(\alpha\in[0,1]\) 下，最小失真确定性估计器由位移插值得到：

\[
\widehat X_\alpha^{\rm det}
=[\alpha+(1-\alpha)T^\star]a_sx_s
=:\Gamma_s(\alpha)x_s. \tag{26}
\]

当 \(\alpha=1\)，\(\Gamma_s(1)=a_s\)（MMSE）；当 \(\alpha=0\)，\(\Gamma_s(0)=T^\star a_s=\sigma_p/\sigma_s\)（完美感知）。对应 \(D(P)=D^\star+(P^\star-P)^2\)。

**命题 2（平均去噪器精确最优）。** 对任意 \(s\in(0,1),t\in[s,1]\)，有 \(\Lambda(s,t)=\Gamma_s(\alpha(s,t))\)，其中

\[
\alpha(s,t)=\frac{\sigma_p/\sigma_s-\Lambda(s,t)}
{\sigma_p/\sigma_s-a_s}, \tag{27}
\]

它随 \(t\) 从 \(s\) 增至 1 单调从 1 降至 0。

**证明。** 根据式（26），\(\Gamma_s\) 对 \(\alpha\) 为仿射函数，将 \([0,1]\) 一一映射至 \([a_s,\sigma_p/\sigma_s]\)。由于 \(s<1\)，有 \(\sigma_p/\sigma_s>a_s\)。由 \(\Lambda\) 的边界值与引理 2，\(\Lambda(s,\cdot)\) 在 \([s,1]\) 连续严格递增，且端点分别为 \(\Lambda(s,s)=a_s=\Gamma_s(1)\)、\(\Lambda(s,1)=\sigma_p/\sigma_s=\Gamma_s(0)\)。反解 \(\Gamma_s(\alpha)=\Lambda(s,t)\) 即得式（27）；单调性来自 \(\Gamma_s\) 随 \(\alpha\) 递减而 \(\Lambda\) 随 \(t\) 递增。证毕。

**归纳。** 当 \(t\) 从 \(s\) 增至 1，平均去噪器增益由 \(a_s\) 连续变化至 \(\sigma_p/\sigma_s\)。这一线段描述 MMSE 输出分布到目标分布的 \(W_2\) 测地线，按 Freirich 等（2021，定理 3），其每个点均实现该感知水平下的最小失真。图 35 提供自然图像上的直观对照。

#### D.2.3 多维高斯目标

**各向同性与相关高斯目标。** 设 \(p_1=\mathcal N(0,\Sigma)\)，特征值分解 \(\Sigma=U\Lambda_\Sigma U^\top\)，\(\Lambda_\Sigma=\operatorname{diag}(\sigma_{p,1}^2,\ldots,\sigma_{p,d}^2)\)。由于源为各向同性，\(U^\top x_0\sim\mathcal N(0,I)\)。旋转变量 \(\widetilde x_\tau=U^\top x_\tau\) 是两个对角协方差高斯分布的线性插值，各分量独立；速度、流映射与平均去噪器对该正交旋转等变。因此问题分解为 \(d\) 个互不耦合的一维问题，方向 \(i\) 分别具有 \(\sigma_{p,i}\)、\(a_{s,i}\)、\(\Lambda_i(s,t)\) 和感知权重：

\[
\alpha_i(s,t)=\frac{\sigma_{p,i}/\sigma_{s,i}-\Lambda_i(s,t)}
{\sigma_{p,i}/\sigma_{s,i}-a_{s,i}}. \tag{28}
\]

对各向同性目标，所有方向共享同一个 \(\alpha(s,t)\)，所以定理 1 原样成立。

**各向异性目标。** 最优 DP 估计量在所有方向使用相同插值权重 \(\alpha=P/P^\star\)，而共享的前瞻 \(t\) 一般产生方向依赖的 \(\alpha_i(s,t)\)，因此：（1）任意协方差下两个端点严格最优——\(t=s\) 时所有 \(\alpha_i=1\)（MMSE），\(t=1\) 时所有 \(\alpha_i=0\)（完美感知）；（2）中间前瞻只有当全部 \(\alpha_i(s,t)\) 相同才严格最优，这对平坦谱成立；（3）偏离最优性的程度受 \(\max_i\alpha_i-\min_i\alpha_i\) 控制，该散布随协方差谱不均匀性加剧，并在谱变平坦时消失。

故算法 1 使用的单个标量前瞻，在各向异性高斯目标的中间工作点上，不能精确得到最优 DP 前沿。

**通过端点插值恢复最优曲线。** 但同一个训练模型仍能实现严格最优性。端点 \(D_{s,s}\) 是 MMSE 估计器，\(D_{s,1}\) 与最优完美感知估计器一致（Freirich 等，定理 2）：从 MMSE 输出分布到 \(p_1\) 的 \(W_2\) 最优映射将方向 \(i\) 乘以 \(\sigma_{p,i}/(a_{s,i}\sigma_{s,i})\)，作用于 \(a_{s,i}\widetilde x_{s,i}\) 后恰等于 \((\sigma_{p,i}/\sigma_{s,i})\widetilde x_{s,i}=\Lambda_i(s,1)\widetilde x_{s,i}\)。

按 Freirich 等（定理 3），最优估计器为两个端点的凸组合：

\[
\widehat x_\lambda=(1-\lambda)D_{s,1}(x_s)+\lambda D_{s,s}(x_s),\qquad\lambda\in[0,1]. \tag{29}
\]

因此任何高斯目标的最优 DP 曲线都可由式（29）精确遍历，所有方向有 \(\alpha_i=\lambda\)，代价是两次而非一次网络评估。对各向同性目标，\(\Lambda(s,t)\) 本身就是端点增益的凸组合，前瞻与式（29）只是不同参数化下的同一条曲线。图像上的两种构造比较见附录 C.6。

**经验离散目标分布。** 若 \(p_1=\tfrac1n\sum_i\delta_{x^{(i)}}\)，瞬时去噪器为对数据原子 \(x^{(i)}\) 的 softmax 加权平均。在 \(t=s\)，\(D_{s,s}\) 返回该平均值，类似模糊的 MMSE；在 \(t=1\)，返回 ODE 终点的一个数据原子，感知差距为零。因此定性 DP 行为仍然存在（图 1）。但中间前瞻不能保证最优：定理 1 依赖 \(D_{s,t}\) 线性，而此处并非如此，ODE 轨迹也不一定沿着 \(W_2\) 测地线。

**图 35：** \(\xi=0.3\) 的视觉示例。从左到右为干净图、含噪图、MMSE（\(t=s\)），以及逐渐增大的前瞻（\(t=s+.10,.20,.30,.70\)）；估计器逐步从模糊条件均值过渡到清晰样本，恢复纹理、对比度和饱和度。[原图第 47 页](https://arxiv.org/pdf/2606.19802v2#page=47)

### D.3 高斯混合分布实验

#### D.3.1 高斯混合的 MMSE 去噪器

**设置。** 设 \(p_0=\mathcal N(0,I)\)，\(p_1=\frac12\mathcal N(\mu_a,\sigma_c^2 I)+\frac12\mathcal N(\mu_b,\sigma_c^2 I)\)。在线性插值 \(x_t=(1-t)x_0+tx_1\) 下，求 MMSE：

\[
D_t(x)=\mathbb E[x_1\mid x_t=x]. \tag{30}
\]

**步骤 1：\(x_t\) 的边缘分布。** 条件于 \(x_1\) 来自第 \(k\in\{a,b\}\) 个混合分量，有 \(x_1\sim\mathcal N(\mu_k,\sigma_c^2 I)\)、\(x_0\sim\mathcal N(0,I)\)，因此

\[
x_t\mid k\sim\mathcal N(t\mu_k,\sigma_t^2 I),\quad
\sigma_t^2=(1-t)^2+t^2\sigma_c^2. \tag{31}
\]

边缘分布为

\[
p(x_t)=\tfrac12\mathcal N(x_t;t\mu_a,\sigma_t^2I)
+\tfrac12\mathcal N(x_t;t\mu_b,\sigma_t^2I). \tag{32}
\]

**步骤 2：后验混合权重。** 由贝叶斯公式，观测到 \(x_t=x\) 时来自分量 \(k\) 的概率：

\[
w_k(x,t)=\frac{\mathcal N(x;t\mu_k,\sigma_t^2 I)}
{\mathcal N(x;t\mu_a,\sigma_t^2 I)+\mathcal N(x;t\mu_b,\sigma_t^2 I)}. \tag{33}
\]

在对数空间中，未归一化 logit 正比于 \(-\|x-t\mu_k\|_2^2/(2\sigma_t^2)\)，通过 softmax 归一化，满足 \(w_a+w_b=1\)。

**步骤 3：分量内条件均值。** 若已知 \(x_1\) 来自分量 \(k\)，则

\[
\mathbb E[x_1\mid x_t=x,k]=\mu_k+\kappa_t(x-t\mu_k),\quad
\kappa_t=\frac{t\sigma_c^2}{\sigma_t^2}. \tag{34}
\]

\(\kappa_t\) 是回归系数，可由分量内 Tweedie 公式得到。

**步骤 4：完整 MMSE 去噪器。** 全期望公式给出

\[
D_t(x)=w_a(x,t)[\mu_a+\kappa_t(x-t\mu_a)]
+w_b(x,t)[\mu_b+\kappa_t(x-t\mu_b)]. \tag{35}
\]

它是分量内后验均值的 softmax 加权平均。若 \(x\) 接近 \(t\mu_a\)，\(w_a\approx1\)，估计主要来自 a 分量；若 \(x\) 到 \(t\mu_a,t\mu_b\) 等距，两个权重约为 0.5，估计位于两个模态之间，呈现后验平均伪影。

通过瞬时速度场的 ODE 数值积分计算平均去噪器。Softmax 使高斯混合与单高斯存在本质区别：去噪器不再关于 \(x\) 线性，流映射没有闭式解，混合结构导致模态间的平均伪影。不过可以利用已知瞬时去噪器进行数值近似。

#### D.3.2 DP 分析

使用二维高斯混合进行受控分析。该分布的边缘速度可解析计算，因此无需训练网络即可高精度计算平均去噪器 \(D_{s,t}\) 与 Freirich 等（2021）的最优 DP 估计器。

**设置。** 取 \(\mu_a=(-2,0)\)、\(\mu_b=(2,0)\)、\(\sigma_c=.3\)。用四阶 Runge–Kutta（RK4，200 步）积分 ODE \(\dot x_\tau=v(x_\tau,\tau)\)，从 \(\tau=s\) 至 \(t\)，计算平均去噪器。

**最优 DP 曲线构造。** 依据 Freirich 等（2021，定理 3），感知水平 \(P\in[0,P^\star]\) 下最优估计由正文式（7）给出。以 \(N=5000\) 个样本近似该构造：计算 \(\widehat x^{(i)}_0=D_s(x_s^{(i)})\)，再用 Flamary 等（2021）的方法，在 MMSE 输出样本集合与目标 \(p_1\) 样本之间求离散最优传输耦合 \(\pi\)。据此按权重插值：

\[
\widehat x_P^{(i)}
=\left(1-\frac P{P^\star}\right)\widehat x_0^{(i)}
+\frac P{P^\star}x_1^{(\pi(i))}.
\]

失真以相对于真实值的 MSE 计算，感知用经验分布间的 \(W_2^2(\widehat p,p_1)\) 衡量。

**结果。** 图 36 对比 \(s\in\{.3,.5,.7\}\) 三个噪声级别（分别为强、中、轻噪声，因 \(\xi=1-s\)）：

1. **MMSE 端点重合。** \(t=s\)（亦即 \(\alpha=1\)）时，两条曲线按构造都退化为 MMSE 估计器，因此失真和感知坐标相同。
2. **内部近乎最优。** 在中间前瞻，平均去噪器轨迹略高于 Freirich 最优曲线，差距小且大致均匀。最强噪声 \(s=.3\) 时，整个感知范围的 MSE 差距小于 .02。这个差异不是积分精度不足：即使使用 RK4 并将样本量从 2000 增到 5000，差异仍存在；它表明非线性速度场下的流映射轨迹不再严格沿 \(W_2\) 测地线。
3. **\(t=1\) 感知端点。** \(D_{s,1}(p_{x_s})\) 接近目标分布，但不完全一致，留下微小的 \(W_2^2\) 差距；随着噪声增强，该差距减小：从 \(s=.5\) 的 \(9.4\times10^{-3}\) 降至 \(s=.3\) 的 \(3.8\times10^{-3}\)，数值采样噪声地板约 \(2.2\times10^{-3}\)。这一现象与速度场中可积的 \(1/(1-\tau)\) 奇性在较短终点积分区间造成更强影响的直觉一致。

总体上，该受控非高斯例子显示平均去噪器近乎最优：曲线平滑、单调、凸，在 MMSE 端点严格重合，其他位置只有较小且可解释的偏差。它补充了单高斯的精确证明，也支持图像规模的实验观察。

**图 36：** 二维高斯混合在 \(s=.3,.5,.7\) 下的 DP 比较。蓝色为扫描 \(D_{s,t}\) 的前瞻所得曲线，红色为 Freirich 等最优估计器扫描感知权重得到的曲线；星号标记共有 MMSE 端点，感知端的小残留差距来自接近 \(\tau=1\) 的速度奇性。[原图第 49 页](https://arxiv.org/pdf/2606.19802v2#page=49)

### D.4 PnP 迭代的经验分析

**收敛性。** 本文没有为算法 1 提供收敛保证。经验上，稳定行为依赖退火调度 \(s_k\to1\)，它使去噪器修正逐渐变小，而非依赖收缩：测得 PnP 算子的局部 Lipschitz 常数大于一，并随 \(t\) 增大。

分析固定噪声级别 \(s\)、\(\epsilon=0\) 的确定性迭代，并令正向模型线性 \(f(x)=Hx\)。这时重新加噪步骤为 \(R_s(z)=sz\)，单次迭代算子

\[
T_t(x):=D_{s,t}(R_s(F_\lambda(x))),\quad
F_\lambda(x)=x-\lambda\nabla g(x),\quad R_s(z)=sz. \tag{36}
\]

令 \(L_D(t)\) 为 \(D_{s,t}\) 的 Lipschitz 常数，\(L_F=\|I-\lambda H^\top H\|\) 为 \(F_\lambda\) 的常数，则复合算子的 Lipschitz 上界为 \(sL_D(t)L_F\)。对于 \(\lambda\in(0,2/\|H^\top H\|]\)，有 \(L_F\le1\)；若 \(H^\top H\) 奇异，如修复任务，则 \(L_F=1\)。

**复合上界大于 1。** 图 38 报告 CelebA 128×128 高斯去模糊中的 \(sL_D(t)L_F\)；模糊核尺寸 45、标准差 3，\(\lambda=1.0\)，\(L_F=1.000\)。在 \(x_s=sx_1+(1-s)\epsilon\) 上，通过对去噪器 Jacobian 做幂迭代估计 \(L_D(t)\)，取 20 个样本中的最大值。测试的全部 \((s,t)\) 中该上界均大于 1，且随 \(t\) 增大，所以不能据此证明 \(T_t\) 是全局收缩映射。

**迭代处的局部正则性。** 进一步用幂迭代估计完整复合算子在局部的最大奇异值 \(\widehat\rho=\sigma_{\max}(\partial T_t/\partial x)\)，既在含噪插值样本 \(x_s\)，也在实际固定-\(s\) 迭代（第 5 和 250 步、8 幅图）测量；任务为高斯去模糊及良态对照 \(H=I,\lambda=.5\)（图 37）。观察结果：

1. 对插值样本，各噪声级别下 \(\widehat\rho\) 随前瞻单调增加。例如 \(s=.5\)，从 \(t=s\) 时的 1.35 增至后续前瞻的 1.85、2.64、3.17（最后为 \(t=1\)）。
2. 对实际迭代，各工作点 \(\widehat\rho\in[1.3,9.5]\)，包括良态对照。因此迭代并不是因局部收缩而稳定；固定-\(s\) 迭代不收敛，逐次残差比为 \(1.000\pm10^{-4}\)。在六组设置中有五组在 \(t=1\) 时比 \(t=s\) 时局部常数大，但中间过程不总是单调。
3. 实际算法采用 \(s_k=k/N\) 的退火，约以几何速率稳定，连续残差比位于 .958—.962，且基本不依赖 \(t\)。

因此，算法 1 的稳定性主要来自退火调度令去噪修正趋零，而不是去噪器的收缩性。文献中可以在其他假设下（如平均性，Pesquet et al., 2021；非凸优化框架下的梯度步去噪器，Hurault et al., 2022）证明没有收缩条件的 PnP 收敛；把这些分析推广至流映射去噪器尚待未来研究。局部常数随 \(t\) 增长也与附录 C.12 两端点表现不对称一致。

**图 37：** CelebA 上确定性 PnP 算子局部 Lipschitz 常数 \(\widehat\rho\) 随前瞻变化，对照三种 \(s\)，纵轴对数尺度、8 张图平均；实线为含噪插值样本，虚线为第 250 步实际迭代（误差棒为标准差），点线标记 \(\widehat\rho=1\)。[原图第 50 页](https://arxiv.org/pdf/2606.19802v2#page=50)

**图 38：** CelebA 高斯去模糊的复合上界 \(sL_D(t)L_F\)，所有 \((s,t)\) 下均大于 1；去噪器 Jacobian 上通过幂迭代、20 样本最坏值估计 \(L_D(t)\)，且前瞻越大上界越高，低噪声（大 \(s\)）时增幅最明显。[原图第 50 页](https://arxiv.org/pdf/2606.19802v2#page=50)

### D.5 高斯线性逆问题：迭代的固定点

**迭代究竟求解什么？** PnP 起源于近端分裂，以 MAP 类解为目标；将本文的去噪器代入后仍然如此。前瞻并不让算法在优化与后验采样之间切换，而是改变隐式正则项。去噪器通常对应平滑后的正则项的近端算子，而不一定是 \(-\log p\) 本身的近端算子（Gribonval & Nikolova, 2021）。对于线性高斯情况，固定点相当于一个替代高斯先验下的 MAP 估计，且该先验方差随 \(t\) 增大。其他情形没有闭式解，本文仅将对应行为作为经验观察。

把第 3.2.1 节中单独使用去噪器的分析，扩展到先验 \(p_1=\mathcal N(0,\sigma_p^2 I)\) 的线性逆问题，研究确定性迭代（36）的输出。此时 \(D_{s,t}(x)=\Lambda(s,t)x\)，增益由式（9）给出，迭代算子为仿射映射：

\[
T_t(x)=m(t)\bigl[x-\lambda H^\top(Hx-y)\bigr],\qquad
m(t):=s\Lambda(s,t). \tag{37}
\]

固定点的闭式表达为

\[
x^\star(t)=\bigl[c(t)I+\lambda H^\top H\bigr]^{-1}\lambda H^\top y,\quad
c(t)=\frac1{m(t)}-1. \tag{38}
\]

这是一个 Tikhonov 正则化估计量，权重 \(c(t)\) 随前瞻变化。由于 \(m(t)\in(0,1)\)，有 \(c(t)>0\)；并且由引理 2，\(\Lambda(s,t)\) 随 \(t\) 严格增大，所以 \(c(t)\) 严格递减，意味着前瞻增大时正则约束逐渐减弱。

**MAP 解释。** 等价地，\(x^\star(t)\) 是下式的最小化解：

\[
\frac1{2\sigma_{\rm obs}^2}\|Hx-y\|_2^2+
\frac1{2\tau^2(t)}\|x\|_2^2,\quad
\tau^2(t)=\frac{\lambda\sigma_{\rm obs}^2}{c(t)},
\]

其中 \(\sigma_{\rm obs}^2\) 为测量噪声方差。因此它是替代先验 \(\mathcal N(0,\tau^2(t)I)\) 下的 MAP，其方差随 \(t\) 增加。

它不一定等于**真实先验**下的 MAP／维纳估计器，因为后者要求 \(c(t)/\lambda=\sigma_{\rm obs}^2/\sigma_p^2\)。流映射去噪器实际针对插值变量 \(x_s\) 的噪声水平 \(\sigma_s\) 工作，而非测量噪声水平，因此一般不是给定权重下 \(-\log p_1\) 的近端算子。这是一般现象：去噪器对应平滑正则项而非原始负对数先验本身。在这种设置中，前瞻改变的是隐式正则器，而非把输出变为真正的后验样本。

#### D.5.1 式（38）的证明

按定义，固定点满足 \(x^\star=T_t(x^\star)\)，即

\[
x^\star=m(t)x^\star-m(t)\lambda H^\top Hx^\star+m(t)\lambda H^\top y.
\]

因为 \(m(t)>0\)，两边除以 \(m(t)\) 并整理得

\[
\bigl[(m(t)^{-1}-1)I+\lambda H^\top H\bigr]x^\star
=\lambda H^\top y.
\]

左侧矩阵由于 \(c(t)=m^{-1}-1>0\) 为正定矩阵，求逆即得式（38）。证毕。

**经验验证。** 令二维先验 \(p_1=\mathcal N(0,\sigma_p^2I)\)，\(\sigma_p=2\)。两个线性正向模型分别为各向同性缩放旋转 \(H_1=.8R(\pi/6)\)，以及各向异性模型 \(H_2=R(\pi/6)\operatorname{diag}(1.0,.3)R(\pi/4)\)；后者 Gram 矩阵 \(H_2^\top H_2\) 特征值 \(\{1.0,.09\}\)，并耦合两个坐标。观测 \(y=H_kx_1+\eta\)，\(\eta\sim\mathcal N(0,\sigma_{\rm obs}^2I)\)，\(\sigma_{\rm obs}=.1\)。

在 \(\epsilon=0\) 下运行确定性 PnP-Flow，取 \(\lambda=.1,.5\)，固定 \(s=.45\)、\(t\in\{s,s+.27,1\}\)。所有迭代值均以机器精度收敛至 \(x^\star(t)\)，即 \(\operatorname{mean}\|\widehat x-x^\star(t)\|<5\times10^{-16}\)，验证式（38）。随 \(t\) 增大，有效正则系数 \(c(t)/\lambda\) 从 .93 降至 .59，再降至 .43，形成逐步减弱收缩的 Tikhonov 估计器族。图 39 给出结果。

**图 39：** 两种正向模型：(a) \(H_1=.8R(\pi/6)\)、\(\lambda=.1\)；(b) \(H_2=R(\pi/6)\operatorname{diag}(1,.3)R(\pi/4)\)、\(\lambda=.5\)。黑色为观测，金叉为真实样本，黄色为真实先验维纳／MAP 估计，红点为式（38）固定点，红叉为收敛 PnP（与理论机器精度一致），蓝点为随机 PnP 样本，展示第 3.3 节讨论的方差恢复。[原图第 52 页](https://arxiv.org/pdf/2606.19802v2#page=52)

在本高斯逆问题中，前瞻是正则化旋钮，不再是最优 DP 曲线的参数化。由于此例处于过度正则化区域（\(c(t)/\lambda>\sigma_{\rm obs}^2/\sigma_p^2\)），增大 \(t\) 会减小偏差，使 \(x^\star(t)\) 更接近维纳解，也降低 MSE。这并不矛盾：严格 DP 最优性只在去噪设置中成立；逆问题中与正向模型的交互打破了这一保证。

**重新加噪在高斯情形的作用。** 为隔离重新加噪步骤，再以完整随机 PnP 迭代重复实验。确定性情况收敛到单一 Tikhonov 解，随机迭代则生成估计量分布，其离散程度基本不依赖步长 \(\lambda\)。对于不同 \(\lambda\)，样本云都保留非平凡的方差，并符合数据分布几何结构，即使平均估计仍处于过度正则化状态。这说明重新加噪和去噪器主要控制估计量方差，而 \(\lambda\) 主要通过数据一致性更新控制其均值。随着前瞻增大，离散程度进一步增加，形成前述实验中的失真—感知行为。

{% endraw %}
