---
layout: page
title: "OFDM 大规模 MIMO 中的近场速度估计与多普勒感知定位｜中文全文译文"
permalink: /papers/translations/2026-10-31-2608-05133-near-field-velocity-estimation-and-doppler-aware-localization-in-ofdm/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/10de81d8e4c55488/) · [原文 arXiv](https://arxiv.org/abs/2608.05133) · [全部目录](/papers/catalog/)

# OFDM 大规模 MIMO 中的近场速度估计与多普勒感知定位

**原题：** Near-Field Velocity Estimation and Doppler-Aware Localization in OFDM Massive MIMO  
**作者：** Qing Zhang\*˒†、Dario Tagliaferri‡、Robbert Beerten\*、Zhuangzhuang Cui\*˒†、Yang Miao#、Sofie Pollin\*˒†。单位：\* 鲁汶大学电气工程系（ESAT，KU Leuven，比利时）；† 微电子研究中心（IMEC，比利时）；‡ 米兰理工大学电子、信息与生物工程系（DEIB，Politecnico di Milano，意大利）；# 特温特大学电气工程系（EEMCS-EE，University of Twente，荷兰）。原文未给出作者邮箱。  
**版本：** arXiv:2608.05133v1（eess.SP），v1 日期 2026 年 8 月 5 日；原文 5 页（IEEE 期刊/会议短文格式）；2026-10-31 推荐。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、图 1—5 图注、表 I—III、式（1）—（18）、参考文献 [1]—[12]（英文原条目）。三张表均已逐格转录并用 PDF 渲染核对；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写在本页首次出现时保留英文：OFDM（orthogonal frequency division multiplexing）、MIMO、NF/FF（near-field/far-field，近场/远场）、ISAC、Tx/Rx（发射机/接收机）、CPI（coherent processing interval，相干处理间隔）、SAF（spatial ambiguity function，空间模糊函数）、LSE（least squares estimator）、MLE（maximum likelihood estimator）、ULA（uniform linear array）、MoCap（motion capture，动捕）、SNR、RCS 不涉及。**原文疑点/说明（按原文照录并加注）：** ①原文参考文献 [1]、[2]、[8] 中残留了 BibTeX 的 "conference Name:" 字段文本（论文集导出残留），按原文照录；②原文 §IV 未说明仿真统计次数（单次实现还是多次平均），表 II 只报告一组误差值，按原文照录；③原文 §IV 的 4D MLE 搜索范围写作"每个未知参数中心化于真值的 0.2 范围"，但距离、角度、速度量纲不同（0.2 m / 0.2° / 0.2 m/s），原文未分别标注单位，按原文照录；④原文表 II 中 4D MLE 的 $e_{v_r}=0.002564$ m/s 与正文 2.564×10⁻³ m/s 一致；表 III 中 4D MLE 的 $e_\theta=3.378961$° 较大，与正文"实测下未达到同等定位精度"一致；⑤原文图 2 与图 5 分别对应仿真与实测数据下"两次迭代后"的 SAF；⑥原文式（12）用 $\approx$ 表示因速度未知而对堆叠多普勒的一阶近似。

## 摘要

在基于正交频分复用（OFDM）的大规模多输入多输出（MIMO）近场（NF）感知中，目标运动会在阵列孔径上引起**依赖天线的双站多普勒变化**。忽略这种空间多普勒变化会带来模型失配，从而降低近场定位精度。本文提出一种低复杂度的**递归框架**，用于联合径向/横向速度估计与多普勒感知定位。该框架由常多普勒粗定位初始化，然后在基于闭式最小二乘估计器（LSE）的速度估计与依赖天线的多普勒感知定位精化之间交替。仿真与实测结果证明了所提框架相对两种基准方法的有效性。与低复杂度常多普勒基准方法相比，所提算法改善了距离、角度与径向速度的估计结果，同时还能估计横向速度。在实测结果中，整体定位误差从 0.268 m 降至 0.064 m，径向与横向速度估计误差分别为 0.032 m/s 与 0.069 m/s。与高复杂度的穷举四维（4D）最大似然估计器（MLE）相比，在 4D MLE 使用实际有限搜索网格时，所提方法取得相当的速度估计结果并给出更准确的定位结果。

**关键词：** 大规模 MIMO；近场定位；OFDM；空间多普勒变化；横向速度估计。

## I. 引言

随着目标落入辐射近场 [1]—[4]，传统远场（FF）平面波假设失效，基于大规模多输入多输出（MIMO）阵列的近场（NF）感知近来在通感一体化（ISAC）中受到显著关注。在近场中，球面波前传播使接收信号呈现更丰富的空间信息，从而可联合估计目标位置与运动状态 [5]—[7]。然而多数现有近场感知工作聚焦定位，忽略了速度估计的潜力及其对定位的影响。在远场，多普勒被近似为在整个阵列上恒定，且只反映径向速度；相反，近场中的运动目标会在阵列上引起**空间变化的多普勒**，这种空间多普勒变化使径向与横向速度的联合估计成为可能 [5]—[7]。此外，忽略该变化会引入多普勒失配，从而降低近场定位精度 [8]。

近场速度估计的潜力最早在 [5] 中被强调：该文在假定目标距离与角度已知的情况下，用二维（2D）最大似然估计器（MLE）估计径向与横向速度。随后 [9] 提出四维（4D）MLE，可联合估计距离、角度、径向与横向速度；但细网格下的 4D 非线性搜索计算代价在实践中难以承受。为降低计算复杂度，[10] 提出基于子阵列的两步估计方案：先在远场近似下用子阵列估计角度与径向速度，再用完整近场模型估计距离与横向速度。这种分离降低了复杂度，却在两个阶段引入误差传播。现有文献所揭示的局限促使我们寻找一种**低复杂度**方法：既利用近场空间多普勒变化做速度估计，又同时改善定位。

本文提出一种低复杂度的递归速度与位置估计框架：从常多普勒粗定位出发，通过闭式最小二乘估计器（LSE）估计径向与横向速度，并执行依赖天线的多普勒感知**空间模糊函数（SAF）**精化。我们通过仿真与实测验证该框架，并相对两种基准方法展示其有效性：低复杂度的常多普勒 SAF 基线方法 [8]，以及高复杂度的穷举 4D MLE 参考方法 [9]。

主要贡献总结如下：

- 我们建立了 OFDM 大规模 MIMO 感知中运动目标的近场**双站多普勒结构**，并指出其在阵列上的空间变化如何使径向与横向速度的联合估计成为可能。
- 我们提出一种低复杂度递归算法，在基于闭式 LSE 的速度估计与多普勒感知 SAF 精化之间交替。
- 我们首先用仿真验证所提框架：相对常多普勒基线，所提算法显著改善距离、角度与径向速度的估计精度，同时实现横向速度估计；我们还表明，相对使用实际有限网格的 4D MLE 基准，所提方法取得相当的径向/横向速度估计与更准确的定位结果。
- 我们还在大规模 MIMO 测试床上通过真实实验验证所提框架：实验结果与仿真吻合良好，所提方法取得与 4D MLE 相当的速度估计，并在三种方法中取得最佳定位结果。

## II. 系统模型

### A. 近场几何与运动参数化

如图 1 所示，我们考虑基于 OFDM 的大规模 MIMO 感知场景：$M$ 个发射机（Tx）与 $N$ 个接收机（Rx）位于任意二维位置 $\mathbf p_{T,m}\in\mathbb R^2$（$m\in\{1,2,\ldots,M\}$）与 $\mathbf p_{R,n}\in\mathbb R^2$（$n\in\{1,2,\ldots,N\}$）。一个点目标在近场感知区域内运动，其相对阵列中心的位置为 $\mathbf p=[d\sin\theta,\ d\cos\theta]^\top$，其中 $d>0$ 与 $\theta\in(-\pi,\pi]$ 分别表示距离与角度。对第 $(m,n)$ 个 Tx–Rx 对，双站路径长度与传播时延为

$$
D_{mn}=d_{T,m}+d_{R,n},\qquad \tau_{mn}=\frac{D_{mn}}{c},\tag{1}
$$

其中 $d_{T,m}=\|\mathbf p_{T,m}-\mathbf p\|$ 为目标到第 $m$ 个 Tx 的距离，$d_{R,n}=\|\mathbf p_{R,n}-\mathbf p\|$ 为目标到第 $n$ 个 Rx 的距离，$c$ 为光速。

目标速度分解为相互正交的径向与横向分量：

$$
\mathbf v=v_r\mathbf u_r+v_t\mathbf u_t,\tag{2}
$$

其中径向与横向单位向量定义为 $\mathbf u_r=[-\sin\theta,-\cos\theta]^\top$、$\mathbf u_t=[-\cos\theta,\sin\theta]^\top$。为刻画第 $(m,n)$ 个 Tx–Rx 对的双站多普勒，我们首先定义径向与横向双站系数：

$$
q_{r,mn}=\mathbf u_r^\top\left(\mathbf e_{T,m}+\mathbf e_{R,n}\right),\qquad q_{t,mn}=\mathbf u_t^\top\left(\mathbf e_{T,m}+\mathbf e_{R,n}\right),\tag{3}
$$

其中 $\mathbf e_{T,m}=\frac{\mathbf p_{T,m}-\mathbf p}{d_{T,m}}$、$\mathbf e_{R,n}=\frac{\mathbf p_{R,n}-\mathbf p}{d_{R,n}}$ 为双站单位向量。则双站多普勒为

$$
f_{D,mn}=\frac1\lambda\left[v_rq_{r,mn}+v_tq_{t,mn}\right],\tag{4}
$$

其中 $\lambda$ 为波长。式（4）表明：在近场中，双站多普勒通过依赖几何的系数 $q_{r,mn}$ 与 $q_{t,mn}$ 随 Tx–Rx 对变化——这正是本文利用的关键性质。

**图 1：** 近场系统几何示意（Tx、Rx 与运动点目标）。（来源：原文第 2 页。）

### B. OFDM 信号模型

我们考虑一个由 $L$ 个 OFDM 符号构成的相干处理间隔（CPI），符号索引 $l\in\{0,1,\ldots,L-1\}$。如传统雷达信号处理中常见假设，目标位置在一个 CPI 内近似不变，即距离徙动可忽略 [11]。于是单个 OFDM 符号期间第 $(m,n)$ 个 Tx–Rx 对经信道估计后的接收信号为

$$
h_{mn}[k,l]=\beta e^{-\mathrm j2\pi f_k\tau_{mn}}e^{\mathrm j2\pi f_{D,mn}lT_p}+w_{mnkl},\tag{5}
$$

其中 $\beta\in\mathbb C$ 表示目标反射系数，$f_k=f_c+k\Delta f$ 为第 $k$ 个子载波的频率（子载波索引 $k\in\{0,1,\ldots,K-1\}$，$f_c$ 为载频，$\Delta f$ 为子载波间隔）。式（5）中第一个相位项随式（1）的双站路径时延 $\tau_{mn}$ 变化，第二个相位项则揭示式（4）双站多普勒 $f_{D,mn}$ 与 OFDM 符号时长 $T_p$ 共同作用的效果。此外 $w_{mnkl}\sim\mathcal{CN}(0,\sigma^2)$ 表示复加性高斯白噪声。

## III. 递归速度估计与多普勒感知定位算法

本节提出一种低复杂度递归算法，用于从一个 CPI 内式（5）的接收 OFDM 观测中估计 $(d,\theta,v_r,v_t)$。流程从每个 Tx–Rx 对的距离—多普勒处理出发，用常多普勒 SAF 做粗位置初始化；随后算法在两个更新之间交替：1）利用当前位置估计做基于 LSE 的速度估计；2）利用更新后的速度估计做多普勒感知定位。该交替过程重复直至收敛。

**距离—多普勒处理。** 对每个 Tx–Rx 对，我们对式（5）的 $h_{mn}[k,l]$ 做二维 Fourier 变换以完成距离—多普勒处理：

$$
h^{rd}_{mn}[\rho,\varphi]=\frac{1}{KL}\sum_{l=0}^{L-1}\sum_{k=0}^{K-1}h_{mn}[k,l]e^{\mathrm j2\pi k\Delta f\tau_\rho}e^{-\mathrm j2\pi f_{D,\varphi}lT_p},\tag{6}
$$

其中 $\rho\in\{0,1,\ldots,N_\tau-1\}$ 为时延格索引、$\tau_\rho=\rho/(N_\tau\Delta f)$，$\varphi\in\{0,1,\ldots,N_D-1\}$ 为多普勒格索引、$f_{D,\varphi}=(\varphi-N_D/2)/(N_DT_p)$。

**粗位置初始化。** 随后我们采用常多普勒 SAF 基线初始化粗位置——该基线假设所有 Tx–Rx 对共享同一个多普勒格 [8]。该多普勒格由所有 Tx–Rx 对的平均距离—多普勒图选出：

$$
\bar\varphi=\arg\max_\varphi\frac1{MN}\sum_{m=1}^{M}\sum_{n=1}^{N}\max_\rho\left|h^{rd}_{mn}[\rho,\varphi]\right|^2.\tag{7}
$$

相应 SAF 由匹配滤波器输出构成：

$$
\mathcal A^{\mathrm{CD}}(d,\theta;\bar\varphi)=\left|\sum_{m=1}^{M}\sum_{n=1}^{N}h^{rd}_{mn}[\rho_{mn},\bar\varphi]\,a_{mn}(d,\theta)\right|^2\tag{8}
$$

其中 $\rho_{mn}$ 表示第 $(m,n)$ 个 Tx–Rx 对在多普勒格 $\bar\varphi$ 内最强距离响应所在的距离格，$a_{mn}(d,\theta)=e^{\mathrm j\frac{2\pi}{\lambda}D_{mn}(d,\theta)}$ 为假设位置 $(d,\theta)$ 处的期望信号。粗位置随后由 SAF 峰值获得：

$$
(\hat d^{(0)},\hat\theta^{(0)})=\arg\max_{d,\theta}\mathcal A^{\mathrm{CD}}(d,\theta;\bar\varphi).\tag{9}
$$

**基于 LSE 的速度估计。** 我们把式（9）初始化的粗位置作为递归过程第一次迭代的输入。在第 $i$ 次迭代，记输入位置估计为 $(\hat d^{(i-1)},\hat\theta^{(i-1)})$，相应的依赖几何的双站系数计算为

$$
\hat q_{r,mn}=q_{r,mn}\left(\hat d^{(i-1)},\hat\theta^{(i-1)}\right),\qquad\hat q_{t,mn}=q_{t,mn}\left(\hat d^{(i-1)},\hat\theta^{(i-1)}\right).\tag{10}
$$

随后我们从每个 Tx–Rx 对的距离—多普勒图中选取主峰，提取其双站多普勒 $\hat f_{D,mn}=(\hat\varphi_{mn}-N_D/2)/(N_DT_p)$：

$$
(\hat\rho_{mn},\hat\varphi_{mn})=\arg\max_{\rho,\varphi}\left|h^{rd}_{mn}[\rho,\varphi]\right|^2.\tag{11}
$$

利用式（4）并把所有 Tx–Rx 对提取的双站多普勒堆叠，得到

$$
\hat{\mathbf f}_D\approx\frac1\lambda\boldsymbol\Psi\left(\hat d^{(i-1)},\hat\theta^{(i-1)}\right)[v_r,v_t]^T\tag{12}
$$

其中 $\boldsymbol\Psi$ 把式（10）的双站系数堆叠。径向与横向速度随后用闭式 LSE 估计：

$$
[\hat v_r^{(i)},\hat v_t^{(i)}]^T=\lambda\left(\boldsymbol\Psi^T\boldsymbol\Psi\right)^{-1}\boldsymbol\Psi^T\hat{\mathbf f}_D.\tag{13}
$$

**多普勒感知定位。** 给定第 $i$ 次迭代的速度估计 $(\hat v_r^{(i)},\hat v_t^{(i)})$，我们用式（4）计算每个 Tx–Rx 对的相应双站多普勒 $\hat f_{D,mn}^{(i)}$。多普勒格随后选为最接近预测双站多普勒的格：

$$
\varphi_{mn}^{(i)}=\arg\min_\varphi\left|f_{D,\varphi}-\hat f_{D,mn}^{(i)}\right|.\tag{14}
$$

然后只保留所选多普勒格内最强的距离响应：

$$
\rho_{mn}^{(i)}=\arg\max_\rho\left|h^{rd}_{mn}\left[\rho,\varphi_{mn}^{(i)}\right]\right|^2.\tag{15}
$$

利用这些依赖天线的距离—多普勒选择，构造多普勒感知 SAF：

$$
\mathcal A^{(i)}(d,\theta)=\left|\sum_{m=1}^{M}\sum_{n=1}^{N}h^{rd}_{mn}\left[\rho_{mn}^{(i)},\varphi_{mn}^{(i)}\right]a_{mn}(d,\theta)\right|^2.\tag{16}
$$

位置估计随后精化为

$$
(\hat d^{(i)},\hat\theta^{(i)})=\arg\max_{d,\theta}\mathcal A^{(i)}(d,\theta).\tag{17}
$$

**递归精化与终止准则。** 框架递归应用式（13）的速度更新与式（17）的位置精化；当四个未知参数的更新量均低于各自预设阈值时递归终止，即

$$
\left|\hat d^{(i+1)}-\hat d^{(i)}\right|<\epsilon_d,\quad\left|\hat\theta^{(i+1)}-\hat\theta^{(i)}\right|<\epsilon_\theta,\quad\left|\hat v_r^{(i+1)}-\hat v_r^{(i)}\right|<\epsilon_{v_r},\quad\left|\hat v_t^{(i+1)}-\hat v_t^{(i)}\right|<\epsilon_{v_t}.\tag{18}
$$

**表 I：大规模 MIMO 系统参数。**（来源：原文第 3 页。）

| 系统参数 | 符号 | 取值 |
|---|---|---|
| 中心频率 | $f_c$ | 3.5 GHz |
| 子载波间隔 | $\Delta f$ | 180 kHz |
| 带宽 | BW | 18 MHz |
| 采样率 | $f_s$ | 2 kHz |
| 符号时长 | $T_p$ | 0.5 ms |
| 子载波数 | $K$ | 100 |
| 符号数 | $L$ | 1024 |
| 发射天线数 | $M$ | 4 |
| 接收天线数 | $N$ | 64 |
| 天线间距 | $\Delta a$ | 0.07 m |

**图 2：** 常多普勒基线与所提递归多普勒感知定位在**两次迭代后**的 SAF（使用仿真数据）。（来源：原文第 3 页。）

## IV. 仿真结果

本节通过数值仿真评估所提算法，并与两种基准比较：常多普勒 SAF [8] 与穷举 4D 网格搜索 MLE [9]。为保持一致，仿真参数与表 I 的实验设置相同。Tx 与 Rx 布置为均匀线性阵列（ULA）以清晰展示空间多普勒变化。目标状态固定为 $d=4$ m、$\theta=15^\circ$、$v_r=1$ m/s、$v_t=1$ m/s；仿真信噪比（SNR）为 20 dB。

表 II 给出三种方法的估计误差。常多普勒 SAF 给出粗位置估计，其距离、角度与整体定位误差分别为 0.272 m、3.67° 与 0.367 m。由于该基准假设所有 Tx–Rx 对共享一个多普勒，它只能估计径向速度而无法恢复横向速度，所得径向速度误差为 0.953 m/s。

相比之下，所提递归方法显著改善了定位与速度估计：仅两次迭代后，距离与角度误差降至 $7.734\times10^{-3}$ m 与 $2.521\times10^{-3}$°，整体定位误差为 $7.736\times10^{-3}$ m；同时径向与横向速度误差分别降至 0.014 m/s 与 $2.36\times10^{-4}$ m/s。作为高复杂度基准，我们假设在 4D MLE 之前已完成一次粗搜索以减轻仿真负担，故 4D MLE 在 $40\times40\times40\times40$ 网格上实现，每个未知参数的搜索范围取 0.2（中心化于真值）。4D MLE 也取得 $(d,\theta,v_r,v_t)$ 的准确联合估计，误差分别为 0.0436 m、0.147°、$2.564\times10^{-3}$ m/s 与 0.0128 m/s；然而由于其网格分辨率在实践中不可能无限小，其定位精度低于所提递归方法。

**表 II：三种方法估计误差的仿真比较。**（来源：原文第 4 页。）

| 方法 | $e_d=|\hat d-d|$ [m] | $e_\theta=|\hat\theta-\theta|$ [°] | $e_{v_r}=|\hat v_r-v_r|$ [m/s] | $e_{v_t}=|\hat v_t-v_t|$ [m/s] | $e_{\mathrm{loc}}=\|\hat{\mathbf p}-\mathbf p\|_2$ [m] |
|---|---|---|---|---|---|
| 常多普勒 SAF | 0.271825 | 3.669909 | 0.952756 | N/A | 0.367491 |
| 所提递归方法 | 0.007734 | 0.002521 | 0.014495 | 0.000236 | 0.007736 |
| 穷举 4D MLE | 0.043590 | 0.146906 | 0.002564 | 0.012821 | 0.044793 |

图 2 进一步给出常多普勒基线与所提方法的 SAF：常多普勒 SAF 产生展宽且有偏的峰值，表明多普勒失配导致相干聚焦损失，这也解释了表 II 中相对较大的定位误差；两次迭代后，所提多普勒感知方法在真实目标位置附近给出明显更尖锐、聚焦更好的峰值。

我们简要讨论三种方法的计算复杂度。常多普勒 SAF 复杂度最低，因为它在距离—多普勒处理后只需对 $(d,\theta)$ 做一次二维搜索。相比常多普勒 SAF，所提递归方法的额外开销主要来自逐 Tx–Rx 对提取双站多普勒，以及若干次迭代中求解 $2\times2$ 闭式 LSE 与多普勒感知 SAF 精化。至于 4D MLE，其复杂度显著更高，因为搜索维数从二维增加到四维。总体而言，仿真结果确认所提递归框架在估计精度与计算复杂度之间提供了有利折中：它优于低复杂度常多普勒基线，并超过有限网格分辨率下实现的 4D MLE 的性能。

## V. 实验验证

我们用 KU Leuven 大规模 MIMO 测试床上采集的实测数据验证所提方法。比较同样包含所提递归算法、常多普勒 SAF 与穷举 4D MLE。实验装置如图 3 所示：由 4 个 Tx 与 64 个 Rx 构成的线阵、阵列前方运动的圆柱形目标，以及提供目标真值位置的运动捕捉（MoCap）相机系统。大规模 MIMO 系统参数见表 I。对一个 CPI，实测数据被重塑为尺寸 $M\times N\times K\times L$ 的数据立方。整条轨迹上的 MoCap 测量被降采样到各 CPI 时间戳，相应真值目标速度由 MoCap 轨迹做有限差分得到。在应用速度估计与定位算法之前，实测数据经校准以补偿硬件不完美造成的频率相关与天线相关相位偏移 [12]；这一步对恢复阵列相位相干性、实现准确近场定位至关重要。

表 III 表明实验结果与仿真观察吻合良好：常多普勒 SAF 仅足以做粗初始化，而纳入依赖天线的双站多普勒显著改善定位性能。特别地，所提递归方法把定位误差从 0.268 m 降至 0.0639 m，并且还能估计横向速度。在实际有限网格设定下，穷举 4D MLE 也未达到与所提递归方法相同的定位精度。

**图 3：** 真实世界验证的实验装置（4 Tx 与 64 Rx 线阵、运动圆柱目标、MoCap 相机）。（来源：原文第 4 页。）

图 4 给出四个 Tx 下沿 Rx 孔径提取的双站多普勒：实测多普勒总体跟随真值的空间变化，证实实测中存在近场多普勒变化；但也可观察到若干明显尖峰，表明实践中双站多普勒提取受噪声影响，可能降低速度估计精度。尽管如此，由所提递归算法最终速度估计计算出的双站多普勒仍捕捉到真值曲线的整体趋势，表明尽管观测不完美，主导空间多普勒结构仍被成功恢复。

**图 4：** 所提递归方法下四个 Tx 沿 Rx 孔径的实测与估计双站多普勒（Tx 位置 $x_{T,1}=1.25$ m、$x_{T,2}=0.62$ m、$x_{T,3}=-0.57$ m、$x_{T,4}=-1.20$ m）。（来源：原文第 4 页。）

SAF 如图 5 所示。常多普勒假设下 SAF 明显散焦，其峰值偏离真值目标位置；两次迭代后峰值更尖锐且更接近真实位置，与表 III 报告的误差下降及先前仿真的结论一致。此外，递归框架对图 4 中的含噪多普勒提取提供了额外稳健性：通过用速度估计引导依赖天线的多普勒选择，它缓解了多普勒离群值的影响并稳定了实测数据上的定位过程。

**表 III：三种方法估计误差的实验比较。**（来源：原文第 5 页。）

| 方法 | $e_d=|\hat d-d|$ [m] | $e_\theta=|\hat\theta-\theta|$ [°] | $e_{v_r}=|\hat v_r-v_r|$ [m/s] | $e_{v_t}=|\hat v_t-v_t|$ [m/s] | $e_{\mathrm{loc}}=\|\hat{\mathbf p}-\mathbf p\|_2$ [m] |
|---|---|---|---|---|---|
| 常多普勒 SAF | 0.267165 | 0.556227 | 0.032646 | N/A | 0.267584 |
| 所提递归方法 | 0.063596 | 0.215432 | 0.032378 | 0.068892 | 0.063898 |
| 穷举 4D MLE | 0.100000 | 3.378961 | 0.100000 | 0.043590 | 0.142864 |

**图 5：** 常多普勒基线与所提递归多普勒感知定位在两次迭代后的 SAF（使用实测数据）。（来源：原文第 5 页。）

总体而言，实验结果与仿真观察一致：所提递归方法联合估计径向与横向速度，并在三种方法中取得最佳定位结果，展示了实际近场场景中复杂度、稳健性与估计性能之间的有效平衡。

## VI. 结论

本文研究了基于 OFDM 的大规模 MIMO 感知中的近场速度估计与多普勒感知定位。我们表明近场中跨 Tx–Rx 对的空间多普勒变化可由目标位置及其径向、横向速度参数化；基于该结构，我们提出一种低复杂度递归算法，把基于闭式 LSE 的速度估计与多普勒感知 SAF 定位精化结合。相比常多普勒基线，所提方法显著改善定位并额外实现横向速度估计：仿真中把定位误差从 0.367 m 降至 $7.74\times10^{-3}$ m，实验中从 0.268 m 降至 0.0639 m。结果还表明，当 4D MLE 使用实际有限网格分辨率时，所提方法在定位上可优于高复杂度穷举 4D MLE。总体而言，所提框架为实际近场感知在复杂度与估计性能之间提供了有效且稳健的折中。

## 参考文献（英文原书目）

[1] H. Zhang, N. Shlezinger, F. Guidi, D. Dardari, and Y. C. Eldar, "6G Wireless Communications: From Far-Field Beam Steering to Near-Field Beam Focusing," IEEE Communications Magazine, vol. 61, no. 4, pp. 72–77, Apr. 2023.
[2] H. Chen, M. F. Keskin, A. Sakhnini, N. Decarli, S. Pollin, D. Dardari, and H. Wymeersch, "6G Localization and Sensing in the Near Field: Features, Opportunities, and Challenges," IEEE Wireless Communications, vol. 31, no. 4, pp. 260–267, Aug. 2024.
[3] B. Zhao, C. Ouyang, Y. Liu, X. Zhang, and H. V. Poor, "Modeling and Analysis of Near-Field ISAC," IEEE Journal of Selected Topics in Signal Processing, vol. 18, no. 4, pp. 678–693, May 2024.
[4] Y. Xu, E. G. Larsson, E. A. Jorswieck, X. Li, S. Jin, and T.-H. Chang, "Distributed Signal Processing for Extremely Large-Scale Antenna Array Systems: State-of-the-Art and Future Directions," IEEE Journal of Selected Topics in Signal Processing, vol. 19, no. 2, pp. 304–330, Mar. 2025.
[5] Z. Wang, X. Mu, and Y. Liu, "Near-Field Velocity Sensing and Predictive Beamforming," IEEE Transactions on Vehicular Technology, vol. 74, no. 1, pp. 1806–1810, Jan. 2025, arXiv:2311.09888.
[6] L. Lin, M. Wang, Z. Shi, M. S. Greco, and F. Gini, "ISAC-Enabled Near-Field High-Mobility UAV Localization: Analysis, Bounds and Algorithm," IEEE Transactions on Aerospace and Electronic Systems, pp. 1–15, 2025.
[7] H. Miao and M. Peng, "Near-Field High-Speed User Sensing in Wideband mmWave Communications: Algorithms and Bounds," IEEE Transactions on Signal Processing, vol. 73, pp. 919–935, 2025.
[8] A. Sakhnini, S. De Bast, M. Guenach, A. Bourdoux, H. Sahli, and S. Pollin, "Near-Field Coherent Radar Sensing Using a Massive MIMO Communication Testbed," IEEE Transactions on Wireless Communications, vol. 21, no. 8, pp. 6256–6270, Aug. 2022.
[9] Z. Wang, P. Ramezani, Y. Liu, and E. Björnson, "Near-Field Localization and Sensing With Large-Aperture Arrays: From signal modeling to processing," IEEE Signal Processing Magazine, vol. 42, no. 1, pp. 74–87, Jan. 2025.
[10] Z. Ebadi, A. M. Molaei, M. A. Babar Abbasi, S. Cotton, A. Tukmanov, and O. Yurduseven, "Near-Field Source Localization and Velocity Estimation using an Extremely Large Antenna Array," in 2025 IEEE 26th International Workshop on Signal Processing and Artificial Intelligence for Wireless Communications (SPAWC). Surrey, United Kingdom: IEEE, Jul. 2025, pp. 1–5.
[11] M. A. Richards et al., Fundamentals of radar signal processing. McGraw-Hill New York, 2005, vol. 1.
[12] Q. Zhang, A. Sakhnini, R. Beerten, H. Xiong, Z. Cui, Y. Miao, and S. Pollin, "Robust Localization in OFDM-Based Massive MIMO through Phase Offset Calibration," in 2026 IEEE 6th International Symposium on Joint Communications & Sensing (JC&S), Jan. 2026, pp. 1–6.

## 图注与表注

**图 1（原文第 2 页）：** 近场系统几何示意（Tx、Rx 与运动点目标）。
**图 2（原文第 3 页）：** 常多普勒基线与所提递归多普勒感知定位在两次迭代后的 SAF（仿真数据）。
**图 3（原文第 4 页）：** 真实世界验证的实验装置（线阵 4 Tx/64 Rx、运动圆柱目标、MoCap 相机）。
**图 4（原文第 4 页）：** 所提递归方法下四个 Tx 沿 Rx 孔径的实测与估计双站多普勒。
**图 5（原文第 5 页）：** 常多普勒基线与所提递归多普勒感知定位在两次迭代后的 SAF（实测数据）。

**表注汇总：** 表 I（原文第 3 页）为大规模 MIMO 系统参数（$f_c=3.5$ GHz、$\Delta f=180$ kHz、BW 18 MHz、$f_s=2$ kHz、$T_p=0.5$ ms、$K=100$、$L=1024$、$M=4$、$N=64$、$\Delta a=0.07$ m）；表 II（第 4 页）为三种方法估计误差的仿真比较；表 III（第 5 页）为三种方法估计误差的实验比较。三张表均已在正文中逐格转录，并用 `render.py` 渲染 PDF 第 3、4、5 页逐格核对一致。

**本页范围与校对状态：** 本页覆盖 arXiv:2608.05133v1（eess.SP，2026 年 8 月 5 日）全文 5 页：摘要、第 I—VI 节、图 1—5 图注、表 I—III、式（1）—（18）、参考文献 [1]—[12]（英文原条目）。表格核对：用 `render.py` 渲染 PDF 第 3、4、5 页并逐格核对表 I、表 II、表 III（含 4D MLE 与所提方法各列数值）。原文疑点/说明已在页首译注列出（参考文献残留 BibTeX 字段、仿真未说明统计次数、4D MLE 搜索范围量纲未标注单位、表 II/III 与正文数值一致性、图 2/图 5 分别对应仿真/实测、式（12）的近似记号），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2608.05133v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}