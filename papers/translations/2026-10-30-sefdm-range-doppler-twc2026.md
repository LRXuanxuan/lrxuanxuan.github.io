---
layout: page
title: "频谱高效 FDM 的联合距离与多普勒估计｜中文主体译稿（待补齐）"
permalink: /papers/translations/2026-10-30-sefdm-range-doppler-twc2026/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [论文 DOI](https://doi.org/10.1109/TWC.2026.3658942) · [全部目录](/papers/catalog/)

# 使用频谱高效 FDM 的联合距离与多普勒估计

**原题：** Joint Range and Doppler Estimation Using Spectrally Efficient FDM  
**作者：** Michele Mirabella、Pasquale Di Viesti、Christos Masouros、Giorgio M. Vitetta。  
**期刊：** *IEEE Transactions on Wireless Communications*, Vol. 25, 2026, pp. 11113–11127；DOI: 10.1109/TWC.2026.3658942。  
**版权声明：** 原 PDF 第 1 页注明 © 2026 The Authors，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。  
**范围：** 已译摘要、信号模型、主要估计目标、算法框架和实验结论；Newton 迭代的完整推导、全部长公式、图表逐项数值、两项附录证明、参考书目与作者简介尚未逐段逐式完成，故当前是**主体译稿**。

## 摘要

本文研究将频谱高效频分复用（spectrally efficient frequency division multiplexing，SEFDM）波形调制的数据用于感知。首先证明，在发射信号包含循环前缀（cyclic prefix，CP）的条件下，多目标感知等价于对未知数量的二维复指数信号进行检测与参数估计。随后提出一种基于最大似然（maximum likelihood，ML）的新型迭代估计方法，求解上述问题。

仿真结果表明，对于静态或缓慢时变信道，SEFDM 是可行的技术选择。与文献中的其他估计方法相比，所提算法具有更好的估计精度与计算复杂度折中。在多个测试场景中，数值结果显示所提方法以有限计算复杂度实现了约 **15%–50%** 的估计精度提升。

**关键词：** 循环前缀、最大似然估计、正交频分复用、频谱效率、雷达信号处理。

## I. 引言

无线通信与雷达感知在长期发展过程中相对独立，尽管二者在信号处理技术与系统架构方面有许多共性。近年来，通信与感知一体化（integrated sensing and communication，ISAC）受到广泛关注。这类系统能够联合完成无线通信及雷达任务，在设备尺寸、功耗、成本和频谱效率方面具有优势。

ISAC 的一项关键问题，是在带宽与处理复杂度受限的条件下设计兼顾两项功能的波形。频谱高效频分复用（SEFDM）是一种与正交频分复用（OFDM）密切相关的调制方式。两者均利用多个子载波实现频分复用；但 SEFDM 放弃严格正交性，增加不同子载波之间的频谱重叠，使给定带宽内可以容纳更多子载波，从而提升频谱效率（spectral efficiency，SE）。其代价是接收机不可避免的载波间干扰（inter-carrier interference，ICI）和更复杂的数据检测。

已有大量 SEFDM 研究聚焦通信端的数据检测、解调和 ICI 缓解。本文则从无线感知角度出发，研究使用 SEFDM 发射波形估计多个目标的距离和径向速度。

OFDM 感知已经有较成熟的技术文献，主要可以分为直接感知与间接感知。直接感知不先消除通信载荷，而是直接从接收信号估计目标参数，常用高复杂度的压缩感知方法。间接感知先估计通信信道，再从接收观测中除去已知的发射数据贡献。后者又可分为：基于离散 Fourier 变换（DFT）或相关的方法；子空间方法；最大似然方法。很多方法都先通过距离—多普勒谱图的周期图（periodogram）得到粗估计，再用不同技术精化目标参数。

本文的动机是考察 SEFDM 的感知能力以及子载波间距压缩程度引起的通信效率与感知性能权衡，具体贡献有三项。

第一，在共址单输入单输出（SISO）SEFDM 收发系统中，考虑通常被 SEFDM 文献忽略的 CP，建立简化接收信号模型。CP 能消除符号间干扰（ISI），使信道估计更简便，但会降低总体频谱效率。第二，提出近似 ML 的 Newton-based multiple cisoid refiner（NMCR），从周期图粗初始化开始，利用 Newton 迭代对多个目标参数进行联合精化，属于间接感知。第三，在多种条件下评估 NMCR 的精度和复杂度，并与相关算法比较。文中报告部分场景下精度改善约 15%–50%。

论文第二节给出系统与信号模型，第三节推导 NMCR 及其复杂度，第四节进行数值比较，第五节总结。

**图 1：** 共址 SEFDM 感知系统示意：同一无线节点进行通信与单站式雷达感知，环境中既有感兴趣的目标，也有其他无源散射物。

## II. 系统与信号模型

### A. 多目标条件下的接收信号

考虑在缓慢时变无线信道上传输一帧 SEFDM 信号，包含 $M$ 个连续 SEFDM 符号。每帧同时携带导频和通信数据，可被一个或多个接收节点使用。由于感知收发机共址，雷达接收端已知整个发射帧的结构、数据内容和发射频率，因而这些信息可被用于回波处理。以下假设单站 SISO 架构以及完美定时同步；若要恢复目标的精确空间位置，则需要 MIMO 架构，这不在本文范围内。

每个 SEFDM 符号由 $N$ 维信道符号向量 $\mathbf c_N^{(m)}$ 构成，其中 $N_u$ 个位置承载调制星座符号，其余位置置零，以抑制部分子载波。所有符号具有长度 $N_{\mathrm{cp}}$ 的 CP，同一帧采用一致的子载波压缩系数 $0<\beta\le1$。脉冲整形采用滚降系数为 $\alpha$ 的根升余弦（root-raised cosine，RRC）滤波器，接收端采用相应匹配滤波器。

与 OFDM 不同，SEFDM 在发射前使用参数为 $\beta$ 的 $N$ 阶分数逆离散 Fourier 变换（FrIDFT）：

$$
\mathbf x_N^{(m)}
=\mathbf F_{N,\beta}^{H}\mathbf c_N^{(m)},
\qquad
[\mathbf F_{N,\beta}]_{p,q}
=\frac1{\sqrt N}\exp\left(-j\frac{2\pi pq\beta}{N}\right).
\tag{1}
$$

当 $\beta=1$ 时，SEFDM 退化为 OFDM。各符号的时域样本经循环扩展形成 CP，随后经过脉冲整形、逐符号时移后叠加发射：

$$
\tilde s(t)=\sum_{m=0}^{M-1}s(t-mT,\mathbf x_N^{(m)}),\tag{2}
$$

$$
s(t,\mathbf x_N)=\sum_{k=-N_{\mathrm{cp}}}^{N-1}
x_k\,p(t-kT_s/\beta),\qquad T=NT_s/\beta .
\tag{3}
$$

传播由 $L$ 个点状散射体对应的多径构成，其中部分为雷达目标，其余为无源环境散射物。信道冲激响应（CIR）为

$$
h(t,\tau)=\sum_{\ell=0}^{L-1}\tilde h_\ell(t,\tau),\tag{4}
$$

$$
\tilde h_\ell(t,\tau)
=a_\ell e^{j2\pi\nu_\ell t}\delta(\tau-\tau_\ell).
\tag{5}
$$

第 $\ell$ 条路径的参数为复增益 $a_\ell$、时延 $\tau_\ell$ 和多普勒频移 $\nu_\ell$。假设路径按时延递增排序，所有参数在一个 SEFDM 帧期间保持不变，即准静态信道。

若目标距离、径向速度分别为 $R_\ell$、$v_\ell$，则

$$
\tau_\ell=\frac{2R_\ell}{c},\qquad
\nu_\ell=\frac{2f_c v_\ell}{c},
$$

其中 $c$ 为光速，$f_c$ 为载频。上述多普勒符号定义遵循原文约定。

接收端首先将发射波形与各目标 CIR 卷积，再经过匹配滤波。对于第 $\ell$ 条路径，忽略噪声时：

$$
\tilde r_\ell(t)
=\tilde s(t)*\tilde h_\ell(t,\tau)*p^*(-t).
\tag{6}
$$

随后累加所有路径与噪声。利用 CP 和采样处理，可将每条目标路径对应的观测组织为 $M\times N$ 矩阵。原文进一步给出式（7）—（18），定义 $\tilde r_\ell(t)$、频域数据矩阵 $X$、通道矩阵 $H_\ell$、多普勒相位矩阵 $D_\ell$ 及标准化时延、多普勒频率。

其中关键的二维复指数信道模型为

$$
[H_\ell]_{m,n}
=\breve a_\ell \exp(-j2\pi n f_{\tau_\ell})
\exp(j2\pi m f_{\nu_\ell}), \tag{17}
$$

$\breve a_\ell$ 为归一化复增益，$f_{\tau_\ell}$、$f_{\nu_\ell}$ 分别为归一化时延和多普勒频率。对所有目标求和，并加入独立同分布复高斯噪声 $W$，得到观测矩阵：

$$
R=\sum_{\ell=0}^{L-1}
(X\odot H_\ell)\,\Xi_N^H D_\ell+W .
\tag{19}
$$

这里 $\odot$ 为 Hadamard 逐元素乘积，$\Xi_N$ 是单位化 $N$ 阶 DFT 矩阵。作者利用这一矩阵结构对距离与多普勒进行联合估计。

**图 2：** 发射链路包含符号映射、FrIDFT、CP 插入与脉冲整形；共址接收机包含匹配滤波、采样和 CP 移除、DFT、符号除法及后续信道估计。

### B. 信道估计

对式（19）的接收矩阵实施 DFT，得到

$$
Y=R\Xi_N
=\sum_{\ell=0}^{L-1}(X\odot H_\ell)
\Xi_N^H D_\ell\Xi_N+W\Xi_N .\tag{20}
$$

假设所有多普勒频率的绝对值小于 SEFDM 子载波间距，即 $|\nu_\ell|<\beta\Delta f$。在缓慢变化假设下，$\Xi_N^H D_\ell\Xi_N\approx I_N$，因此

$$
Y\approx X\odot H+\bar W,\qquad
H=\sum_{\ell=0}^{L-1}H_\ell,\quad
\bar W=W\Xi_N .\tag{21--22}
$$

由于发射端和接收端共址，频域数据矩阵 $X$ 是完全已知的，因此可逐元素消除数据影响：

$$
\hat H=Y\oslash X\approx H+\breve W .\tag{23}
$$

$\oslash$ 表示逐元素相除。矩阵 $\hat H$ 的元素可以视为 **$L$ 个二维复指数信号叠加噪声**。每个二维复指数的两个频率和复增益分别对应目标的距离、径向速度与雷达散射截面相关信息。因此，SEFDM 感知被转换为二维谐波参数恢复问题。

这一化简具有适用条件：逐元素除法使噪声方差依赖 $X$ 的元素幅度。对于 QAM，幅度不恒定，噪声通常不再同方差；SEFDM 的非正交 ICI 进一步加剧这一问题。因此，后续采用独立同方差噪声的传统 ML 度量，严格来说是近似形式。对于常模 PSK，只有在 $\beta=1$ 的 OFDM 情况下，所述经典假设才保持最直接的最优性条件。

CP 的作用同样关键：它降低频谱效率，却抑制 ISI，使式（8）的 Fourier 表示和式（23）的简化信道估计可行。不使用 CP 时，相邻符号干扰将破坏这些简化关系，需要更复杂的信道估计。

## III. 信道参数的近似最大似然估计

### A. NMCR 算法的推导

定义所有二维复指数的目标参数集合

$$
\mathcal S_H=
\{(\breve a_\ell,f_{\nu_\ell},f_{\tau_\ell}):
\ell=0,\ldots,L-1\}.
$$

将信道估计向量化：

$$
\hat h:=\operatorname{vec}(\hat H)=h+\breve w,\tag{24}
$$

$$
h(a,f_\tau,f_\nu)=B(f_\tau,f_\nu)\,a,\qquad
B(f_\tau,f_\nu)=C_N^*(f_\tau)\odot_{\mathrm{KR}}C_M(f_\nu).
\tag{25--26}
$$

$\odot_{\mathrm{KR}}$ 表示 Khatri–Rao 乘积，$a$ 是所有目标复增益组成的列向量，$f_\tau$、$f_\nu$ 则分别收集归一化时延和多普勒频率。原文式（27）—（31）具体定义这几个复指数构造矩阵及向量。

若目标数量 $L$ 已知，并且 $\breve w$ 可近似为零均值同方差的圆对称复高斯噪声，则最大似然估计等价于最小化接收观测与模型输出之间的平方残差：

$$
(\hat a,\hat f_\tau,\hat f_\nu)
=\arg\min_{\tilde a,\tilde f_\tau,\tilde f_\nu}
\mathcal L(\hat h\mid\tilde a,\tilde f_\tau,\tilde f_\nu),
\tag{34}
$$

$$
\mathcal L(\hat h\mid\tilde a,\tilde f_\tau,\tilde f_\nu)
=\|\hat h-h(\tilde a,\tilde f_\tau,\tilde f_\nu)\|_2^2 .
\tag{35}
$$

固定频率参数后，复幅度的最小二乘估计具有闭式解：

$$
\hat a=B^\dagger(\tilde f_\tau,\tilde f_\nu)\hat h.
\tag{36}
$$

但对两个频率向量的联合优化通常没有封闭形式。若能先提供足够好的粗频率估计，则可采用 Newton 型数值迭代精化。NMCR 因此结合二维周期图峰值检测和迭代联合精化。

具体思想是：首先，在二维周期图上搜索显著峰值，得到目标个数估计 $\hat L$ 以及每个目标的粗时延和粗多普勒；然后按当前目标参数构造复指数矩阵，更新增益，并使用代价函数的梯度和 Hessian（Hesse 矩阵）计算 Newton 更新；迭代处理各目标并联合调整已检测目标，使峰值位置不被粗网格分辨率限制。

这一方法依赖目标在时延—多普勒平面上具有足够的分离度，使二维谱峰可以无歧义识别。原文包含广义似然比检测（GLRT）、Newton 更新与收敛控制的具体推导及算法框；目前尚需逐式核对。

### B. 计算复杂度

论文分析初始化与精化两阶段的计算量，比较二维 FFT、二维 FFT 插值、NMCR、期望最大化（EM）、近似 ML 以及其他相关方案。作者区分数值运算量与运行时间，并在实验中考察精度—复杂度折中。这里的复杂度结论依赖 FFT 尺寸、目标个数、迭代次数等设置，不能脱离具体条件直接排序。

## IV. 数值结果

论文在多个合成雷达场景中比较二维 FFT、插值二维 FFT、NMCR、EM、AP-ML 等方法。比较指标包括目标检测概率、距离估计均方根误差（RMSE）、径向速度估计 RMSE、Cramér–Rao 下界和浮点计算量等。相关模拟结果见图 3—11。

**图 3：** 在基础场景 S0 中考察 GLRT 的检测概率与信噪比及相关参数的关系。  
**图 4—7：** 对比不同算法在距离与速度估计中的 RMSE，研究信噪比、目标相互分离程度与系统参数变化的影响。  
**图 8—10：** 比较 NMCR、EM、AP-ML 等方法的误差性能与计算开销。  
**图 11：** 考察其他测试配置中的估计误差。

作者指出：在目标分离充分、信道变化较慢且简化模型适用的条件下，NMCR 的联合迭代精化能够提高估计精度；多个场景中相对于基准方法约有 15%—50% 的改善，并具有可接受的复杂度。需要区分**论文所报告的多场景实验结论**与对所有传播或硬件条件的一般保证。

## V. 结论

本文研究将 SEFDM 作为 ISAC 感知波形，并在引入 CP 和慢时变假设的条件下，把多目标距离—多普勒估计转化为二维复指数参数估计。提出的 NMCR 使用周期图粗搜索与 Newton 型联合精化，实现比部分现有方法更有竞争力的精度—复杂度折中。SEFDM 的通信频谱效率优势与雷达感知性能之间需要结合子载波压缩系数、ICI、CP 开销及信道动态性共同评估。

## 附录、引用与终校范围

原文包含两个附录：**A. 对数似然代价函数的梯度与 Hessian**，**B. Cramér–Rao 下界的推导**；还包含参考文献和作者简介。本译稿尚未完整转录其偏导表达式、矩阵求导推导、CRLB 长公式与每个数值图的曲线配置，因此不应作为数值复现的唯一依据。严谨复现请逐式对照原 PDF 及论文 DOI。对原论文作者与 CC BY 4.0 授权的归属保留如上。
{% endraw %}
