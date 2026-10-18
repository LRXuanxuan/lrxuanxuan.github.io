---
layout: page
title: "新型三维非平稳定位辅助 ISAC 信道模型｜中文全文译稿"
permalink: /papers/translations/2026-10-19-3d-localization-assisted-isac-2311-16798/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b65ab8ecd9ff2ed4/) · [arXiv 原文](https://arxiv.org/abs/2311.16798) · [原始 PDF](https://arxiv.org/pdf/2311.16798v1)

# 一种新型三维非平稳定位辅助通感一体化信道模型

**原题：** A Novel 3D Non-stationary Localization-assisted ISAC Channel Model  
**作者：** Runruo Yang、Yang Wu、Jie Huang、Cheng-Xiang Wang  
**作者单位：** 东南大学信息科学与工程学院移动通信全国重点实验室；紫金山实验室。通讯作者：Jie Huang、Cheng-Xiang Wang。  
**来源：** arXiv:2311.16798v1，2023 年 11 月 28 日，原 PDF 6 页。  
**译文范围：** 摘要、正文 I—V 节、式（1）—（28）、图 1—6 说明、致谢及参考文献 [1]—[16]。原文公式中的部分符号及量纲存在待进一步核实之处，译文保持原貌并明确标识。

## 摘要

通感一体化（integrated sensing and communication，ISAC）作为第六代（6G）无线通信系统的新兴应用场景，受到广泛关注。本文提出一种新型三维（three-dimensional，3D）非平稳、定位辅助的 ISAC 几何随机模型（geometry-based stochastic model，GBSM）。利用反向散射感知提供的辅助信息，通过粒子滤波器（particle filter）估计通信信道中首跳散射体和末跳散射体的位置。本文对所提信道模型的重要统计特性进行仿真，并与射线追踪（ray tracing，RT）结果比较，具体包括时延扩展、离开/到达方位角（azimuth angle of departure/arrival，AAoD/AAoA）扩展，以及离开/到达俯仰角（elevation angle of departure/arrival，EAoD/EAoA）扩展。所提信道模型的仿真结果与 RT 结果吻合良好，验证了模型的正确性。利用散射体的位置参数，所提出的 ISAC 信道模型可以更好地映射真实环境。

**关键词：** 6G；定位辅助；ISAC；GBSM；粒子滤波器。

## I. 引言

随着无线通信技术发展，6G 无线通信系统既要求高数据速率通信，又要求高精度感知与定位，以实现物理世界与数字世界的映射 [1], [2]。由于感知和通信在所使用的频段、波形设计以及硬件平台方面具有共性 [3]—[5]，ISAC 作为一种新兴的 6G 应用场景受到广泛关注。信道模型在系统设计、资源分配和性能优化中具有重要作用 [6]。因此，为实现 ISAC 系统中感知与通信的相互辅助，有必要研究 ISAC 信道。

已有文献研究了基于信道模型实现的定位方法。文献 [7] 提出毫米波波束域通信信道模型，利用最大似然（maximum likelihood，ML）分类器定位接收端（receiver，Rx）。文献 [8] 提出基于 GBSM 的多径分量（multipath component，MPC）跟踪算法，并比较仿真和实测结果。文献 [9] 则利用扩展卡尔曼滤波器，根据多径相位信息跟踪用户运动；与视距（line-of-sight，LoS）场景的测量数据比较证明，该方法能够较好地跟踪用户轨迹。然而，这些方法均不能定位环境中的散射体。

文献 [10] 提出面向室内场景的无地图定位方法，将所估计的发射机（transmitter，Tx）及聚簇位置与测量结果比较。不过，该方法只能定位 Tx 及 LoS 或单次反射路径上的散射体，不适用于多跳传播。文献 [11] 提出基于感知反向散射信道的室内环境建图方法，但要求目标与收发端之间存在 LoS 路径，也不能定位散射体。综上，上述定位方法主要能够定位用户或单跳聚簇，而不能估计 MPC 多跳聚簇中的散射体位置。

已有大量文献研究信道模型。文献 [6] 提出 6G 泛在信道模型（6G pervasive channel model，6GPCM），按照椭球高斯分布随机生成散射体位置。文献 [12] 提出三维非平稳无人机（unmanned aerial vehicle，UAV）多输入多输出（multiple-input multiple-output，MIMO）信道模型，采用 von Mises–Fisher 分布对角度参数建模。文献 [13] 提出移动端对移动端的双环非平稳信道模型，假定散射体规则分布在 Tx 环和 Rx 环上。文献 [14], [15] 提出三维非平稳 UAV MIMO GBSM，将散射体分布在接收端附近的圆柱面上。文献 [16] 提出高速列车信道模型，将散射体设在以 Tx、Rx 为焦点的椭圆上。然而，这些模型中的散射体位置均由特定随机分布描述，或局限于特定几何表面。通过这些方法生成的散射体空间位置，不能反映物理环境中真实物体的位置。

本文提出一种新型三维非平稳定位辅助 ISAC 信道模型。通过通信与感知相结合，利用粒子滤波确定信道中多跳散射体的位置。考虑到信道模型的非平稳性，散射体的位置随时间变化；粒子滤波的重采样过程能够体现这一特性。重采样过程还隐含着信道模型中散射体的出生—死亡机制。

本文其余部分安排如下：第二节提出三维非平稳定位辅助 ISAC 信道模型；第三节分析时延扩展、AAoD/AAoA 扩展和 EAoD/EAoA 扩展等信道统计特性；第四节给出仿真结果及分析；第五节为结论。

## II. 新型三维定位辅助 ISAC GBSM

### A. 信道模型描述

ISAC 信道模型由单基地（mono-static）感知信道和通信信道组成。Tx 为 ISAC 基站（base station，BS），Rx 为通信用户。ISAC BS 同时配备发射和接收天线阵列，能够发送感知与通信信号，并接收感知回波。Rx 配备用于接收通信信号的天线阵列。由于通信收、发天线阵列位于不同位置，通信信道也可以视为双基地（bi-static）信道。通过时延、AAoD（AAoA）和 EAoD（EAoA）参数，可以确定信道模型中首跳（末跳）散射体的位置；这些参数也是信道模型不可缺少的组成部分。图 1 展示所提 ISAC 信道模型。

**图 1.** ISAC 信道模型。图中包括 ISAC BS、用户、首跳散射体及末跳散射体的位置、速度、发射与接收天线阵列、传播距离矢量和感知回波。

#### 1）单基地感知信道模型

ISAC BS 发射导频符号或伪噪声（pseudo-noise，PN）序列，对分布在基站周围物理环境中的障碍物进行感知。在感知信道模型中，这些障碍物被抽象为散射体。若 ISAC BS 与散射体之间存在 LoS 路径，则基站能够感知该散射体。感知信道可获取散射体的距离、角度和速度。单基地感知回波的信道冲激响应（channel impulse response，CIR）为

$$
\begin{aligned}
h^{\rm mo}(t,\tau)=
\sum_{i=1}^{I(t)}\sum_{j=1}^{J_i}
&\sqrt{G_{ji}(t)}\,
e^{j2\pi f_c\tau_{ji}(t)}
e^{j2\pi f_{D,ji}(t)\tau_{ji}(t)}\\
&\cdot \mathbf A\bigl(\alpha_{ji}(t),\beta_{ji}(t)\bigr)
\delta\bigl(\tau-\tau_{ji}(t)\bigr).
\end{aligned}\tag{1}
$$

其中，$G_{ji}(t)=\lambda^2\varepsilon_{{\rm RCS},ji}/[64\pi^3d_{ji}^4(t)]$ 为信道增益；$\varepsilon_{{\rm RCS},ji}$ 是第 $i$ 个聚簇中第 $j$ 个散射体的雷达散射截面（radar cross section，RCS）；$\lambda$ 是波长；$d_{ji}(t)$ 是 ISAC BS 与该散射体之间的距离；$f_c$ 是载波频率；$\tau_{ji}(t)$ 是路径时延；$f_{D,ji}(t)$ 是该散射体的多普勒频移。ISAC BS 的导向向量表示为 $\mathbf A(\alpha_{ji}(t),\beta_{ji}(t))$，其中 $\alpha_{ji}(t)$ 和 $\beta_{ji}(t)$ 分别为散射体的方位角和俯仰角。回波路径的时延和多普勒频移分别为 $\tau_{ji}(t)=2d_{ji}(t)/c$、$f_{D,ji}(t)=2v_{ji}(t)/\lambda$；$c$ 和 $v_{ji}(t)$ 分别为光速和相应散射体的速度。

#### 2）通信信道模型

通信信道指 ISAC BS 与用户之间的信道。这也是一种双基地信道，因为 ISAC BS 与用户位于不同位置。信道由 LoS 分量 $h_{qp}^{\rm LoS}(t,\tau)$ 与非视距（non-LoS，NLoS）分量 $h_{qp,mn}^{\rm NLoS}(t,\tau)$ 组成。通信 CIR 为

$$
\begin{aligned}
h_{qp}^c(t,\tau)
={}&\sqrt{\frac{K(t)}{K(t)+1}}\,
h_{qp}^{\rm LoS}(t,\tau)\\
&+\sqrt{\frac{1}{K(t)+1}}\,
\sum_{n=1}^{N_c(t)}\sum_{m=1}^{M_n(t)}
h_{qp,mn}^{\rm NLoS}(t,\tau).
\end{aligned}\tag{2}
$$

其中，$K(t)$ 为莱斯因子（Rician factor），$N_c(t)$ 为时刻 $t$ 的聚簇数量，$M_n(t)$ 为第 $n$ 个聚簇中的散射体数量。

LoS 分量可表示为

$$
\begin{aligned}
h_{qp}^{\rm LoS}(t,\tau)
={}&\begin{bmatrix}
F_{q,V}(\beta_L^R(t),\alpha_L^R(t))\\
F_{q,H}(\beta_L^R(t),\alpha_L^R(t))
\end{bmatrix}^{T}
\begin{bmatrix}
e^{j\xi_L^{VV}}&0\\
0&-e^{j\xi_L^{HH}}
\end{bmatrix}\\
&\cdot\begin{bmatrix}
F_{p,V}(\beta_L^T(t),\alpha_L^T(t))\\
F_{p,H}(\beta_L^T(t),\alpha_L^T(t))
\end{bmatrix}
e^{j2\pi f_c\tau_{qp}^{\rm LoS}(t)}
\delta\bigl(\tau-\tau_{qp}^{\rm LoS}(t)\bigr).
\end{aligned}\tag{3}
$$

这里 $(\cdot)^T$ 表示转置，$\delta(\cdot)$ 表示狄拉克冲激函数；$F_{p(q),V}$、$F_{p(q),H}$ 分别为 ISAC BS（Rx）天线方向图的垂直极化和水平极化分量；$\alpha_L^T(t)$（$\alpha_L^R(t)$）和 $\beta_L^T(t)$（$\beta_L^R(t)$）分别为 LoS 路径的 AAoD（AAoA）与 EAoD（EAoA）。初始相位 $\xi_L^{HH}$ 与 $\xi_L^{VV}$ 服从 $[0,2\pi]$ 上的均匀分布。$\tau_{qp}^{\rm LoS}(t)$ 是第 $p$ 根发射天线到第 $q$ 根接收天线的 LoS 时延。

NLoS 分量定义为

$$
\begin{aligned}
h_{qp,mn}^{\rm NLoS}(t,\tau)
={}&
\begin{bmatrix}
F_{q,V}(\beta_{mn}^R(t),\alpha_{mn}^R(t))\\
F_{q,H}(\beta_{mn}^R(t),\alpha_{mn}^R(t))
\end{bmatrix}^{T}\\
&\cdot
\begin{bmatrix}
e^{j\xi_{mn}^{VV}}&
\sqrt{\mu\kappa_{mn}^{-1}(t)}e^{j\xi_{mn}^{VH}}\\
\sqrt{\kappa_{mn}^{-1}(t)}e^{j\xi_{mn}^{HV}}&
\sqrt{\mu}e^{j\xi_{mn}^{HH}}
\end{bmatrix}\\
&\cdot
\begin{bmatrix}
F_{p,V}(\beta_{mn}^T(t),\alpha_{mn}^T(t))\\
F_{p,H}(\beta_{mn}^T(t),\alpha_{mn}^T(t))
\end{bmatrix}\\
&\cdot\sqrt{P_{qp,mn}(t)}
e^{j2\pi f_c\tau_{qp,mn}^{\rm NLoS}(t)}
\delta\bigl(\tau-\tau_{qp,mn}^{\rm NLoS}(t)\bigr).
\end{aligned}\tag{4}
$$

其中，$\mu$ 为同极化不平衡度，$\kappa_{mn}$ 为交叉极化功率比；$\alpha_{mn}^{T(R)}(t)$ 和 $\beta_{mn}^{T(R)}(t)$ 分别表示第 $n$ 个聚簇第 $m$ 条射线在时刻 $t$ 的 AAoD（AAoA）与 EAoD（EAoA）；$P_{qp,mn}(t)$ 为路径功率；$\tau_{qp,mn}^{\rm NLoS}(t)$ 表示从第 $p$ 根发射天线出发，经第 $n$ 个聚簇第 $m$ 个散射体到达第 $q$ 根接收天线的 NLoS 路径时延。

路径时延满足 $\tau_{qp,mn}^{\rm NLoS}(t)=D_{qp,mn}(t)/c+\widetilde\tau(t)$，其中 $D_{qp,mn}(t)$ 为 NLoS 路径长度，$\widetilde\tau(t)$ 为虚拟时延。路径长度为

$$
D_{qp,mn}(t)=
\bigl|\mathbf D_{p,mn}(t)\bigr|
+\bigl|\mathbf D_{q,mn}(t)\bigr|.
\tag{5}
$$

$\mathbf D_{p,mn}(t)$ 和 $\mathbf D_{q,mn}(t)$ 分别为第 $p$ 根发射天线至第 $m$ 个散射体、第 $q$ 根接收天线至该散射体的距离矢量：

$$
\mathbf D_{p,mn}(t)=\mathbf D_{mn}^{T}(t)-\mathbf A_p^{T},
\tag{6}
$$

$$
\mathbf D_{q,mn}(t)=\mathbf D_{mn}^{R}(t)-\mathbf A_q^{R}.
\tag{7}
$$

其中 $\mathbf D_{mn}^{T(R)}(t)$ 为 Tx（Rx）阵列第一根天线到第 $m$ 个散射体的距离矢量；$\mathbf A_p^T$（$\mathbf A_q^R$）是 Tx（Rx）阵列第一根天线到第 $p$（$q$）根天线的矢量。距离矢量为

$$
\mathbf D_{mn}^{T}(t)=D_{mn}^{T}(t)
\begin{bmatrix}
\cos\beta_{mn}^{T}(t)\cos\alpha_{mn}^{T}(t)\\
\cos\beta_{mn}^{T}(t)\sin\alpha_{mn}^{T}(t)\\
\sin\beta_{mn}^{T}(t)
\end{bmatrix}.
\tag{8}
$$

$$
\mathbf D_{mn}^{R}(t)=D_{mn}^{R}(t)
\begin{bmatrix}
\cos\beta_{mn}^{R}(t)\cos\alpha_{mn}^{R}(t)\\
\cos\beta_{mn}^{R}(t)\sin\alpha_{mn}^{R}(t)\\
\sin\beta_{mn}^{R}(t)
\end{bmatrix}.
\tag{9}
$$

其中 $D_{mn}^{T}(t)$ 和 $D_{mn}^{R}(t)$ 是相应距离矢量的模长。通过粒子滤波可以估计信道中多跳散射体的位置，从而进一步得到散射体的时延与角度参数，而无须随机生成这些参数。

### B. 基于粒子滤波的定位

通信信道中的首跳散射体分布在 Tx 附近，能够被 ISAC BS 感知。通过利用感知信息和粒子滤波，可对通信信道中的末跳散射体进行定位和跟踪。时刻 $t_k$ 的粒子滤波状态向量定义为

$$
\mathbf s(t_k)=
[\mathbf s_u(t_k),\mathbf s_{\rm CA}(t_k),\mathbf s_{\rm CZ}(t_k)]^{T}.
\tag{10}
$$

其中，$\mathbf s_u(t_k)$ 为用户状态向量；$\mathbf s_{\rm CA}(t_k)=[\ldots,\mathbf s_{{\rm CA},mn}(t_k),\ldots]^T$ 与 $\mathbf s_{\rm CZ}(t_k)=[\ldots,\mathbf s_{{\rm CZ},mn}(t_k),\ldots]^T$ 分别为首跳和末跳散射体状态向量，$m=1,\ldots,M_n(t_k)$，$n=1,\ldots,N_c(t_k)$。每个状态向量均由位置与速度组成：

$$
\mathbf s_u(t_k)=[\mathbf p_u(t_k),\mathbf v_u(t_k)]^T,
\tag{11a}
$$
$$
\mathbf s_{{\rm CA},mn}(t_k)=
[\mathbf p_{{\rm CA},mn}(t_k),\mathbf v_{{\rm CA},mn}(t_k)]^T,
\tag{11b}
$$
$$
\mathbf s_{{\rm CZ},mn}(t_k)=
[\mathbf p_{{\rm CZ},mn}(t_k),\mathbf v_{{\rm CZ},mn}(t_k)]^T.
\tag{11c}
$$

用户、首跳散射体、末跳散射体的位置向量分别为

$$
\mathbf p_u(t_k)=
[x_u(t_k),y_u(t_k),z_u(t_k)]^T,
\tag{12a}
$$
$$
\mathbf p_{{\rm CA},mn}(t_k)=
[x_{{\rm CA},mn}(t_k),y_{{\rm CA},mn}(t_k),z_{{\rm CA},mn}(t_k)]^T,
\tag{12b}
$$
$$
\mathbf p_{{\rm CZ},mn}(t_k)=
[x_{{\rm CZ},mn}(t_k),y_{{\rm CZ},mn}(t_k),z_{{\rm CZ},mn}(t_k)]^T.
\tag{12c}
$$

$x_u,y_u,z_u$ 为用户在笛卡尔坐标系中的三个坐标分量；首跳、末跳散射体的相应坐标分量采用下标 $\rm CA$ 与 $\rm CZ$ 区分。其速度向量分别为

$$
\mathbf v_u(t_k)=
[v_u^x(t_k),v_u^y(t_k),v_u^z(t_k)]^T,
\tag{13a}
$$
$$
\mathbf v_{{\rm CA},mn}(t_k)=
[v_{{\rm CA},mn}^x(t_k),v_{{\rm CA},mn}^y(t_k),v_{{\rm CA},mn}^z(t_k)]^T,
\tag{13b}
$$
$$
\mathbf v_{{\rm CZ},mn}(t_k)=
[v_{{\rm CZ},mn}^x(t_k),v_{{\rm CZ},mn}^y(t_k),v_{{\rm CZ},mn}^z(t_k)]^T.
\tag{13c}
$$

其中，$v^x,v^y,v^z$ 分别为用户或散射体沿 $x,y,z$ 三个坐标轴方向的速度分量。利用这些状态量，可计算信道模型中的距离参数：

$$
\widehat D_{mn}^{T}(t_k)=
\sqrt{x_{{\rm CA},mn}^2(t_k)+y_{{\rm CA},mn}^2(t_k)+z_{{\rm CA},mn}^2(t_k)},
\tag{14}
$$

$$
\begin{aligned}
\widehat D_{mn}^{R}(t_k)=\bigl[
&(x_{{\rm CZ},mn}(t_k)-x_u(t_k))^2\\
+&(y_{{\rm CZ},mn}(t_k)-y_u(t_k))^2\\
+&(z_{{\rm CZ},mn}(t_k)-z_u(t_k))^2
\bigr]^{1/2}.
\end{aligned}\tag{15}
$$

其中，$\widehat{(\cdot)}$ 表示估计值。令 $\Upsilon_1=\arctan[y_{{\rm CA},mn}(t_k)/x_{{\rm CA},mn}(t_k)]$，估计的 AAoD 为

$$
\widehat\alpha_{mn}^{T}(t_k)=
\begin{cases}
\Upsilon_1,&x_{\rm CA}>0,\ y_{\rm CA}\gtrless0,\\
\Upsilon_1+\pi,&x_{\rm CA}<0,\ y_{\rm CA}>0,\\
\Upsilon_1-\pi,&x_{\rm CA}<0,\ y_{\rm CA}<0.
\end{cases}\tag{16}
$$

相似地，令 $\Upsilon_2=\arctan[(y_{{\rm CZ},mn}(t_k)-y_u(t_k))/(x_{{\rm CZ},mn}(t_k)-x_u(t_k))]$，估计的 AAoA 为

$$
\widehat\alpha_{mn}^{R}(t_k)=
\begin{cases}
\Upsilon_2,&x_{\rm CZ}-x_u>0,\ y_{\rm CZ}-y_u\gtrless0,\\
\Upsilon_2+\pi,&x_{\rm CZ}-x_u<0,\ y_{\rm CZ}-y_u>0,\\
\Upsilon_2-\pi,&x_{\rm CZ}-x_u<0,\ y_{\rm CZ}-y_u<0.
\end{cases}\tag{17}
$$

*式（16）—（17）中 $\gtrless0$ 用于保留原文排版中“正、负两种情况”合并的含义；在程序实现中可使用 atan2 确定正确象限。*

EAoD 和 EAoA 可估计为

$$
\widehat\beta_{mn}^{T}(t_k)=
\arccos\left(\frac{z_{{\rm CA},mn}(t_k)}
{\widehat D_{mn}^{T}(t_k)}\right),
\tag{18}
$$

$$
\widehat\beta_{mn}^{R}(t_k)=
\arccos\left(\frac{z_{{\rm CZ},mn}(t_k)-z_u(t_k)}
{\widehat D_{mn}^{R}(t_k)}\right).
\tag{19}
$$

通过粒子滤波，状态向量可在时间域递推，从而获得不同时刻用户和散射体的位置与速度向量。由于单基地感知信道与通信信道存在交集，可利用两者联合确定初始状态向量。假设初始时刻 Tx 和 Rx 的位置及 Rx 的速度已知。为获取通信信道信息，ISAC BS 在初始时刻向 Rx 发射导频。同时，ISAC BS 接收阵列接收周围散射体反向散射的回波。分别处理 Rx 与 ISAC BS 接收阵列的信号，获取通信信道与单基地感知信道信息。首跳散射体的初始状态 $\mathbf s_{\rm CA}(t_1)$ 可由两类信道的交集确定，而末跳散射体的初始状态 $\mathbf s_{\rm CZ}(t_1)$ 则由通信信道单独确定。

初始化之后，状态向量需要随时间递推。从 $t_{k-1}$ 到 $t_k$ 的状态转移方程表示为

$$
\mathbf s(t_k)=\mathbf A\mathbf s(t_{k-1})+\mathbf n_s(t_k),
\tag{20}
$$

其中 $\mathbf A$ 为状态转移矩阵；$\mathbf n_s(t_k)$ 是服从零均值高斯分布的系统噪声。状态转移矩阵可写为块对角结构：

$$
\mathbf A=\operatorname{diag}(\mathbf Q,\mathbf Q,\ldots,\mathbf Q),
\tag{21}
$$

其中

$$
\mathbf Q=
\begin{bmatrix}
1&0&0&T_s&0&0\\
0&1&0&0&T_s&0\\
0&0&1&0&0&T_s\\
0&0&0&1&0&0\\
0&0&0&0&1&0\\
0&0&0&0&0&1
\end{bmatrix}.
\tag{22}
$$

$T_s$ 为采样间隔。每个散射体使用 $C$ 个粒子近似，因此对于 $N_c(t_k)M_n(t_k)$ 个散射体，需要总共 $N_c(t)M_n(t)C$ 个粒子进行近似。随后执行重采样，在每个散射体对应的 $C$ 个粒子中提取权重最大的粒子。文中将权重表示为第 $c$ 个粒子状态向量与观测向量 $\mathbf z(t_k)$ 之间的欧氏距离：

$$
w^{(c)}(t_k)=
p\bigl(\mathbf z(t_k)\mid\mathbf s^{(c)}(t_k)\bigr)
=\left\|\mathbf z(t_k)-\mathbf s^{(c)}(t_k)\right\|.
\tag{23}
$$

观测向量为 $\mathbf z(t_k)=[\tau(t_k),\alpha^T(t_k),\beta^T(t_k),\alpha^R(t_k),\beta^R(t_k)]$，包含通信信道随时间变化的参数：时延、AAoD、EAoD、AAoA 和 EAoA。

*原文式（23）同时以条件概率密度及欧氏距离表示权重，而观测向量和状态向量的构成也不同；这里按原文呈现其数学关系，不擅自把距离改成高斯似然。*

## III. 统计特性

### A. 时延扩展

时延扩展由不同多径分量到达 Rx 的时间差异引起，是描述信道多径时延色散的一项直观且重要的统计特性。时延扩展为

$$
\sigma_\tau(t)=
\sqrt{\overline{\tau^2}(t)-\bigl(\mu_\tau(t)\bigr)^2},
\tag{24}
$$

其中

$$
\overline{\tau^2}(t)=
\frac{\displaystyle\sum_{n=1}^{N_c(t)}
\sum_{m=1}^{M_n(t)}P_{qp,mn}(t)
\bigl(\tau_{qp,mn}^{\rm NLoS}(t)\bigr)^2}
{\displaystyle\sum_{n=1}^{N_c(t)}
\sum_{m=1}^{M_n(t)}P_{qp,mn}(t)},
\tag{25}
$$

$$
\mu_\tau(t)=
\frac{\displaystyle\sum_{n=1}^{N_c(t)}
\sum_{m=1}^{M_n(t)}P_{qp,mn}(t)
\tau_{qp,mn}^{\rm NLoS}(t)}
{\displaystyle\sum_{n=1}^{N_c(t)}
\sum_{m=1}^{M_n(t)}P_{qp,mn}(t)}.
\tag{26}
$$

### B. 角度扩展

角度扩展描述多径分量在空间域中的离散程度。AAoD（AAoA）扩展和 EAoD（EAoA）扩展定义为

$$
\sigma_{\alpha^{T(R)}}(t)=
\sqrt{\overline{\alpha^{T(R)2}}(t)
-\bigl(\mu_{\alpha^{T(R)}}(t)\bigr)^2},
\tag{27}
$$

$$
\sigma_{\beta^{T(R)}}(t)=
\sqrt{\overline{\beta^{T(R)2}}(t)
-\bigl(\mu_{\beta^{T(R)}}(t)\bigr)^2}.
\tag{28}
$$

其中，角度的二阶矩与均值采用和式（25）、（26）类似的方式计算，只需分别用 $\alpha_{mn}^{T(R)}(t)$ 或 $\beta_{mn}^{T(R)}(t)$ 代替 $\tau_{qp,mn}^{\rm NLoS}(t)$。

## IV. 结果及分析

本节仿真分析所提出的定位辅助 ISAC 信道模型的统计特性。由于无法开展对应的信道测量，采用 RT 验证模型。RT 仿真在 28 GHz 的室外场景中进行。Tx 配备 $32\times4$ 平面阵列天线，Rx 配备 $2\times2$ 平面阵列天线。仿真环境地图如图 2 所示。Tx 位于坐标原点，高度为 10 m；Rx 以 1 m/s 的速度依次沿路线 1、路线 2 移动。路线 1 的起点、终点分别为 (−164, 0) 与 (0, 20)；路线 2 从 (0, 20) 延伸到 (0, 231)。Rx 高度为 1.2 m。

将 RT 仿真结果作为粒子滤波器的观测状态。在路线 1 的 (−104, 7.32, 1.2) 以及路线 2 的 (0, 120, 1.2) 位置分别选取 Rx 的粒子滤波初始状态。图 3 展示了初始化 20 s 后，用户与首跳、末跳散射体的估计位置。可见散射体分布于物理环境中的建筑周围。通过粒子滤波估计初始时刻后 20 s 内包括时延与角度在内的信道状态，并将对应的统计特性与 RT 仿真结果比较。

**图 2.** 室外场景的 RT 仿真环境地图。图中标出 Tx、Rx、路线 1 和路线 2。  
**图 3.** 初始化 20 s 后用户与首跳、末跳散射体的估计位置：（a）路线 1；（b）路线 2；散点图以不同符号标记 ISAC BS、用户、首跳散射体和末跳散射体。

### A. 时延扩展

图 4 比较所提定位辅助 ISAC 信道模型与 RT 得到的时延扩展。在路线 1 的 (−84.2, 9.76, 1.2) 和路线 2 的 (0, 140, 1.2) 两个位置，分别得到图 4(a)、(b) 所示结果。两位置均位于各自初始状态点之后 20 s。结果表明，所提模型在这两点的时延扩展仿真结果几乎与 RT 一致。这说明模型可以估计和跟踪信道的多径时延参数。

**图 4.** 所提 ISAC 信道模型与 RT 结果的时延扩展累积分布函数（CDF）比较：（a）路线 1；（b）路线 2。

### B. 角度扩展

**1）方位角扩展：** 图 5(a)、(b) 分别比较所提模型与 RT 的 AAoD 扩展、AAoA 扩展。在路线 1 和路线 2 的两个测试点上，模型的方位角扩展均较好地逼近 RT 结果。这说明所提模型能够有效跟踪和仿真方位角参数。

**图 5.** 所提 ISAC 信道模型与 RT 的方位角扩展 CDF 比较：（a）AAoD 扩展；（b）AAoA 扩展；包含路线 1、2 的仿真曲线与 RT 曲线。

**2）俯仰角扩展：** 图 6(a) 将路线 1 测试点的 EAoD 扩展与 RT 结果比较；图 6(b) 将路线 2 测试点的 EAoA 扩展与 RT 比较。EAoD 和 EAoA 扩展都能与 RT 结果良好匹配。不过可以看到，所提模型的仿真曲线在两端存在较长的尾部，这可能是由于俯仰方向的天线单元数量较少、角度分辨率不足所致。

**图 6.** 所提 ISAC 信道模型与 RT 的俯仰角扩展 CDF 比较：（a）路线 1 的 EAoD；（b）路线 2 的 EAoA。

## V. 结论

本文提出一种新型三维非平稳定位辅助 ISAC 信道模型。利用粒子滤波算法定位并跟踪信道模型中的首跳和末跳散射体，并进一步使用散射体的位置辅助通信信道建模。粒子滤波估计的散射体位置在不同时间具有差异，体现了信道模型的非平稳性。对时延扩展、AAoD（AAoA）扩展和 EAoD（EAoA）扩展等信道特性进行仿真，并与 RT 结果比较。信道模型的仿真结果与 RT 结果准确吻合，验证了所提信道模型的正确性。

## 致谢

本工作得到以下项目支持：中国国家重点研发计划（2018YFB1801101）；国家自然科学基金（61960206006、62271147）；江苏省重点技术研发计划（面向产业的前瞻性与关键技术，BE2022067、BE2022067-1）；移动信息通信与安全前沿科学中心；欧盟 H2020 RISE TESTBED2 项目（872172）；江苏省高层次创新创业博士引进计划（JSSCBS20210082）。

## 参考文献

文献编号、作者、期刊会议、卷期和页码依原文保留，并给出题名的中文译意。

[1] X.-H. You, C.-X. Wang, J. Huang 等，《迈向 6G 无线通信网络：愿景、使能技术与新范式转变》，*Science China Information Sciences*，64(1)，1—74，2020；DOI: 10.1007/s11432-020-2955-6。原题：Towards 6G wireless communication networks: Vision, enabling technologies, and new paradigm shifts.

[2] C.-X. Wang, J. Wang, S. Hu 等，《6G 太赫兹无线通信系统的关键技术综述》，*IEEE Vehicular Technology Magazine*，16(4)，27—37，2021。原题：Key technologies in 6G THz wireless communication systems: A survey.

[3] Z. Feng, Z. Fang, Z. Wei, X. Chen, Z. Quan, D. Ji，《雷达与通信联合设计综述》，*China Communications*，17(1)，1—27，2020。原题：Joint radar and communication: A survey.

[4] J. A. Zhang, Md. Lushanur Rahman, K. Wu 等，《移动网络中的通信与雷达感知联合实现——综述》，*IEEE Communications Surveys & Tutorials*，24(1)，306—345，2022。原题：Enabling joint communication and radar sensing in mobile networks—A survey.

[5] F. Liu, C. Masouros, A. P. Petropulu, H. Griffiths, L. Hanzo，《雷达与通信联合设计：应用、研究现状及未来路线》，*IEEE Transactions on Communications*，68(6)，3834—3862，2020。原题：Joint radar and communication design: Applications, state-of-the-art, and the road ahead.

[6] C.-X. Wang, Z. Lv, X. Gao 等，《泛在无线信道建模理论及其在全频段全场景 6G GBSM 中的应用》，*IEEE Transactions on Vehicular Technology*，71(9)，9159—9173，2022。原题：Pervasive wireless channel modeling theory and applications to 6G GBSMs for all frequency bands and all scenarios.

[7] H. Deng, A. Sayeed，《利用稀疏波束空间特征进行毫米波 MIMO 信道建模和用户定位》，*SPAWC*，多伦多，130—134，2014。原题：Mm-wave MIMO channel modeling and user localization using sparse beamspace signatures.

[8] J. Rodríguez-Piñeiro, Z. Huang, X. Cai, T. Domínguez-Bolaño, X. Yin，《时变 UAV 信道的几何 MPC 跟踪与建模算法》，*IEEE Transactions on Wireless Communications*，20(4)，2700—2715，2021。原题：Geometry-based MPC tracking and modeling algorithm for time-varying UAV channels.

[9] M. Zhu, J. Vieira, Y. Kuang, K. Åström, A. F. Molisch, F. Tufvesson，《利用估计多径分量的相位信息进行跟踪与定位》，*ICCW*，伦敦，712—717，2015。原题：Tracking and positioning using phase information from estimated multi-path components.

[10] Y. Ji, J. Hejselbæk, W. Fan, G. F. Pedersen，《使用超宽带大规模阵列系统的无地图室内定位方法》，*IEEE Antennas and Wireless Propagation Letters*，17(9)，1682—1686，2018。原题：A map-free indoor localization method using ultrawideband large-scale array systems.

[11] A. Guerra, F. Guidi, D. Dardari, A. Clemente, R. D’Errico，《面向环境建图的毫米波室内反向散射信道模型》，*IEEE Transactions on Antennas and Propagation*，65(9)，4935—4940，2017。原题：A millimeter-wave indoor backscattering channel model for environment mapping.

[12] Q. Zhu, K. Jiang, X. Chen, W. Zhong, Y. Yang，《新型三维非平稳 UAV-MIMO 信道模型及其统计特性》，*China Communications*，15(12)，147—158，2018。原题：A novel 3D non-stationary UAV-MIMO channel model and its statistical properties.

[13] R. He, B. Ai, G. L. Stüber, Z. Zhong，《基于移动性模型的非平稳移动端对移动端信道建模》，*IEEE Transactions on Wireless Communications*，17(7)，4388—4400，2018。原题：Mobility model-based non-stationary mobile-to-mobile channel modeling.

[14] C. Ge, R. Zhang, Y. Jiang, B. Li, Y. He，《面向 UAV MIMO 信道的三维动态非宽平稳聚簇几何随机模型》，*IEEE Transactions on Vehicular Technology*，71(7)，6884—6899，2022。原题：A 3-D dynamic non-WSS cluster geometrical-based stochastic model for UAV MIMO channels.

[15] J. Bian, C.-X. Wang, Y. Liu 等，《基于航空随机移动模型的三维非平稳宽带 UAV 对地 MIMO 信道模型》，*IEEE Transactions on Vehicular Technology*，70(11)，11154—11168，2021。原题：3D non-stationary wideband UAV-to-ground MIMO channel models based on aeronautic random mobility model.

[16] Y. Bi, J. Zhang, Q. Zhu 等，《新型非平稳高速列车信道建模与仿真方法》，*IEEE Transactions on Vehicular Technology*，68(1)，82—92，2019。原题：A novel non-stationary high-speed train (HST) channel modeling and simulation method.

{% endraw %}
