---
layout: page
title: "基于电磁传播建模的近场定位与姿态感知｜中文全文译文"
permalink: /papers/translations/2026-10-05-2310-17327-near-field-positioning-and-attitude-sensing-based-on-electromagnetic-p/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/bf9c99bd8d106ad5/) · [原文 arXiv](https://arxiv.org/abs/2310.17327) · [全部目录](/papers/catalog/)

# 基于电磁传播建模的近场定位与姿态感知

**原题：** Near-Field Positioning and Attitude Sensing Based on Electromagnetic Propagation Modeling  
**作者：** Ang Chen（中国科学技术大学无线光通信 CAS 重点实验室）、Li Chen（中国科学技术大学，通讯作者）、Yunfei Chen（英国杜伦大学工程系）、Nan Zhao（大连理工大学信息与通信工程学院）、Changsheng You（南方科技大学电子与电气工程系）；其中 Li Chen、Yunfei Chen、Nan Zhao 为 IEEE 高级会员（Senior Member），Changsheng You 为 IEEE 会员。  
**版本：** arXiv:2310.17327v3（cs.IT），v3 日期 2024 年 5 月 13 日；IEEE Journal on Selected Areas in Communications 录用日期 2024 年 5 月 8 日；原文 19 页。本页对应论文库 2026-10-05 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、图 1—11 图注、表 I—II、附录 A—H 全部证明、参考文献 [1]—[50]（英文原条目）。原文页首版权声明为 © 2024 IEEE（个人使用允许，再传播需 IEEE 许可），本页仅为学习研究用中文译稿，**版权与再传播许可需另行核验**；作者简介等非正文内容按惯例省略。逐句逐式终校未做，不标记为已验收全文。

> **译注（符号约定）：** 原文用无点字母 ı、ȷ 表示矩阵/向量的下标，以避免与虚数单位 j 混淆；本译稿按其语义写作 $i$、$j$，虚数单位仍记作 $\mathrm{j}$。原文以 $\otimes$ 表示**叉积**（而非通常的 Kronecker 积），本页沿用该符号并保留其叉积含义。原文中的初场强 $\mathcal{E}_{\mathrm{in}}$（印刷体为花体 E）在本页记作 $\mathcal{E}_{\mathrm{in}}$。

## 摘要

无线网络中的定位与感知对众多新兴应用至关重要。然而，传统无线信道模型把用户设备（UE）过度简化为点目标，因而无法用于感知 UE 的姿态——姿态通常由空间朝向描述。本文基于电磁理论建立一套完备的电磁传播模型（electromagnetic propagation modeling，EPM），用以精确建模近场信道。在无噪声情形下，EPM 建立了观测信号对 UE 位置与姿态的非线性函数依赖关系。为克服这种非线性耦合带来的求解困难，我们首先提出把距离域划分为三个区域，分界由所定义的**相位模糊距离**与**间距约束距离**给出。随后，在每个区域内获得低复杂度的位置—姿态联合估计闭式解。接着，为研究随机噪声对联合估计性能的影响，推导了 Ziv–Zakai 界（ZZB）以得到有用洞见；进一步给出期望 Cramér–Rao 界（ECRB），获得性能下界的简化闭式表达式。数值结果表明，所推导的 ZZB 能在所有信噪比（SNR）区间内准确预测估计器性能。更重要的是，我们实现了毫米级的位置估计精度与 0.1 量级的姿态估计精度。

**关键词：** 近场定位、电磁传播模型、期望 Cramér–Rao 界、电场、联合位置与姿态估计、Ziv–Zakai 界。

## I. 引言

无线网络中的定位与感知在众多新兴应用中发挥关键作用，包括基于位置的服务 [1]、目标检测与跟踪 [2]、物联网（IoT）[3]、智能环境 [4] 以及通感一体化（ISAC）系统 [5]、[6]。利用无线网络提升定位与感知精度既具挑战性又意义深远。特别是，定位与感知的精度从根本上取决于观测信号的结构，而后者又内在地受制于底层无线信道模型。因此，信道建模非常重要。

传统信道建模方法通常采用远场均匀平面波（uniform plane wavefront，UPW）假设 [7]，如图 1a 中的点 $\mathrm p_2$ 所示。这是因为当今无线网络的小尺寸阵列使 UE 通常处于接收阵列的远场区$^1$。远场 UPW 模型只允许提取方向信息，因为它假定到达所有接收单元的信号具有相同到达角（AoA）。为获得 UE 的位置参数，一种可行途径是布设多个位置已知、空间分布的天线阵列来估计 AoA [9]，即三角测量法；或者利用 UE 与接收机之间的时钟同步测量到达时间（ToA）[10]，即三边测量法。此外，基于载波相位的方法近来被作为超精度定位方案加以研究 [11]、[12]。借助大规模接收阵列或表面 [13]、[14]、[15] 可以提升定位精度。事实上，5G 标准即规划在毫米波（mmWave）频段工作 [16]，而正在进行的后 5G（B5G）研究已聚焦于所谓亚太赫兹（sub-THz）频段 [17]、[18]、[19]，即 100—300 GHz 范围。高频信号对应的短波长使实现由大量小尺寸单元构成的天线阵列在实践上成为可能。在高频段采用大规模阵列会使电磁衍射场从远场区转移到近场区$^2$，使远场 UPW 假设不再成立。当 UE 位于接收阵列的近场区内（如图 1a 中点 $\mathrm p_1$ 所示）时，球面波前建模（spherical wavefront modeling，SWM）被广泛采用，以有效利用球面波前特性实现高精度位置估计。基于 SWM 的阵列流形蕴含关于 UE 位置的丰富信息，允许从接收阵列直接提取方向与距离两类信息。因此，文献 [21]、[22]、[23]、[24]、[25]、[26] 研究了基于 SWM 的高精度近场定位信号处理算法；此外，文献 [13]、[27]、[28]、[29] 推导了基于 SWM 的近场定位理论性能界。

然而，远场 UPW 与近场 SWM 都无法刻画 UE 的姿态参数，因为二者都忽略了 UE 的几何形状。事实上，姿态参数依赖于 UE 的几何形状，应把 UE 建模为扩展目标。对偶极子、线天线等基本电子器件而言，姿态参数可定义为**空间朝向**，即 UE 的旋转角。

要在无线网络上感知姿态，必须建立无线信道与姿态之间的精确关系。由于 UE 可视为产生无线等效信道的扩展激励源，这可以借助电磁传播理论实现。图 1b 给出一种由基本电磁（Maxwell）方程出发的近场信道精细建模方法，称为**电磁传播建模（EPM）**。与传统的 UPW 和 SWM 相比，EPM 全面考虑 UE 的物理特性，即姿态、形状与尺寸。这些物理特性直接影响 UE 内部的源电流分布，而源电流分布在三维（3D）空间中产生传播的电场与磁场，从而在接收阵列处形成观测电场。观测电场与初始电场之比定义了等效信道，而等效信道又由 UE 的源电流分布决定，因此本质上刻画了其对位置与姿态参数的函数依赖。于是，EPM 使位置与姿态的联合感知成为可能。表 I 汇总了不同信道建模下可获得的参数类型。

**表 I：不同信道模型下可获得的参数。**（来源：原文第 2 页。）

| 信道模型 | 可获得的参数 |
|---|---|
| 远场 UPW | AoA |
| 近场 SWM | 位置 |
| 近场 EPM | 位置与姿态 |

EPM 被认为是迄今为止研究近场区信号或信道时最精确的、基于电磁理论的模型。在 [30] 中，B. Friedlander 首先指出远场 UPW 与近场 SWM 都忽略了源的特征，更精确的近场信道建模应建立在电磁理论之上。A. A. D'Amico 等人在 [31]、[32] 中研究了基于辐射矢量 [33, 第 15 章] 的 EPM，并获得了高精度的源定位 Cramér–Rao 界（CRB）。在 [34] 中，A. Chen 等人针对 UE 任意位置与三类不同观测电场，建立了通用的近场定位系统。然而，上述 EPM 工作主要局限于近场定位。据作者所知，利用 EPM 进行位置与姿态联合估计的研究在现有文献中仍然缺失。其挑战在于：EPM 是同时包含位置与姿态参数的复杂非线性模型，很难从无噪声信号中精确估计这些参数；此外，联合位置与姿态估计在含噪情形下的相应性能界从未被研究，使联合估计系统的基本极限尚不清晰。

为填补这一空白，本文率先研究基于 EPM 的位置与姿态联合估计。为此，我们首先建立一套完备的 EPM，据此得到一组同时包含位置与姿态参数的非线性方程$^3$；随后推导这组非线性方程的闭式解。进一步，为研究随机噪声对联合估计性能的影响以及估计性能的基本极限，我们推导位置与姿态联合估计的 Ziv–Zakai 界（ZZB）与期望 CRB（ECRB）。主要贡献总结如下。

- **无噪声联合估计的闭式解。** 在无噪声情形下，联合估计问题可转化为求解一组非线性方程，从而以已知观测信号的函数形式精确获得未知的位置与姿态量。由于复杂的指数耦合，上述方程组难以直接求解。为应对这一挑战，我们首先提出按所定义的相位模糊距离 $d_{\mathrm{PA}}$ 与间距约束距离 $d_{\mathrm{SC}}$ 把距离域划分为三个区域；随后在每个区域内通过解耦重构上述方程并给出闭式解。
- **联合估计的全局紧性能界。** 我们推导了位置与姿态联合估计的 ZZB。具体地，ZZB 是适用于所有 SNR 区间的全局紧界，它纳入未知参数的先验信息，且不限于无偏估计。所推导的 ZZB 是 SNR、接收阵列尺寸、载频、未知参数先验分布以及与近场电磁信道相关的模糊函数（AF）的显式函数。因此，ZZB 为上述系统参数对联合估计性能的影响提供了新的洞见。进一步，为获得性能下界的简化闭式表达式并便于与所推导的 ZZB 比较，我们推导了 ECRB——它是在高 SNR 区间刻画基本极限的局部紧界。

**组织结构：** 第 II 节描述通用的位置—姿态联合估计系统模型，建立完备的 EPM，并基于 EPM 推导近场电磁信道。第 III 节提出相位模糊距离 $d_{\mathrm{PA}}$ 与间距约束距离 $d_{\mathrm{SC}}$，把距离域细分为三个区域，并给出各区域位置与姿态参数的闭式解。第 IV 节推导 ZZB 与 ECRB 的闭式表达式以评估联合估计性能。第 V 节给出数值结果，第 VI 节给出结论。

**符号：** 向量与矩阵分别用粗体小写与粗体大写字母表示，如 $\mathbf a$ 与 $\mathbf A$。$[\mathbf A]_{ij}$ 表示 $\mathbf A$ 的第 $(i,j)$ 个元素，$a_i$ 表示 $\mathbf a$ 的第 $i$ 个元素。上标 $(\cdot)^\dagger$、$(\cdot)^{-1}$、$(\cdot)^{T}$ 分别表示矩阵的 Hermite 转置、逆与转置；$(\cdot)^{*}$ 与 $\Re\{\cdot\}$ 分别表示输入的复共轭与实部。算子 $\|\cdot\|$ 表示输入的 $L_2$ 范数，$|\cdot|$ 表示取模；$\otimes$ 表示叉积。$\mathbb C$ 与 $\mathbb R$ 分别表示复数集与实数集。$\mathrm{j}$ 表示虚数单位，$\mathbf I$ 表示单位阵。$\mathbb E_\kappa\{\cdot\}$ 与 $\mathbb V_\kappa\{\cdot\}$ 分别表示关于 $\kappa$ 的统计期望与方差。$F(x)|_{x=\kappa}$ 表示函数 $F(x)$ 在条件 $x=\kappa$ 下的取值。

## II. 系统模型

### A. 系统描述

考虑图 2 所示的系统，其目标是根据观测信号联合估计 UE 的位置与姿态。不同电磁组件具有不同几何形状，导致不同的电流分布与姿态描述。我们考虑 UE 是一根长度为 $l_{\mathrm{dip}}$ 的赫兹偶极子$^4$。于是 UE 的位置与姿态参数可分别由其质点的空间坐标与空间朝向刻画。

**发射机（UE）的几何模型。** 首先建立 OXYZ 直角坐标系。UE 位于源区 $\mathcal R_t$ 内 Z 轴上的任意点 $\mathbf p_t=(0,0,z_t)^T$$^5$，并指向任意方向 $\hat{\mathbf t}=t_x\hat{\mathbf x}+t_y\hat{\mathbf y}+t_z\hat{\mathbf z}$，其中 $\hat{\mathbf x}$、$\hat{\mathbf y}$、$\hat{\mathbf z}$ 为 OXYZ 系中沿 X、Y、Z 维的单位向量。我们假设 UE 在 YOZ 平面内旋转（即 $t_x=0$），且姿态估计足够频繁，使偶极子的偏转角与参考状态相比变化不大；该参考状态的数学描述为 $t_y\in(0,1]$、$t_z\in[0,1)$。于是由归一化约束 $t_x^2+t_y^2+t_z^2=1$ 得 $t_y=\sqrt{1-t_z^2}$。待估计的位置与姿态参数由定义 1 给出，其先验分布由假设 1 给出。

**定义 1（待估计参数）：** UE 的位置与姿态参数可写成未知向量 $\xi\triangleq(z_t,t_z)^T\in\mathbb R^2$。

**假设 1（$\xi$ 的先验分布）：** $z_t$ 在 $[H_1,H_2]$ 上均匀分布，$t_z$ 在 $[0,1)$ 上均匀分布，即 $z_t\sim\mathcal U[H_1,H_2]$、$t_z\sim\mathcal U[0,1)$，其中 $H_1$、$H_2$ 为任意正常数且 $H_1<H_2$，$H_t\triangleq H_2-H_1$。

**接收机的几何模型。** 长条形观测区域为 $\mathcal R_r=\{(x_r,y_r,0):|x_r|\le l_s/2,\,0\le y_r\le D_r\}$，其上任一观测点记作 $\mathbf p_r=(x_r,y_r,0)^T$，$l_s$ 为短边长度，$D_r$ 为长边长度。于是 $\mathcal R_r$ 的最大几何尺寸可表示为 $D=\sqrt{l_s^2+D_r^2}\approx D_r$。此外，我们考虑 $\mathcal R_r$ 被长度与宽度均为 $l_s$ 的小矩形天线单元填满，单元沿线性网格排布，相邻网格中心间距记为 $d_{\mathrm{sp}}$，满足 $l_s\le d_{\mathrm{sp}}$。定义 $\varpi\triangleq l_s/d_{\mathrm{sp}}\le1$ 为**阵列占空比（AOR）**，它清楚地表示观测区域总面积中被矩形阵元占据的比例。我们考虑离散阵列变为完全覆盖 $\mathcal R_r$ 的连续全息表面 [35]、[36]、[37] 的极端情形，即 $\varpi=1$。因此，阵元中心为 $\{(0,y_r,0):y_r=(n_y-\tfrac12)l_s\triangleq y_{r;n_y}\}$，其中 $1\le n_y\le N$、$N=\lfloor D_r/l_s\rfloor$；第 $n_y$ 个阵元的区域为 $\mathcal R_{r;n_y}=\{(x_r,y_r,0):x_r\in[-\tfrac{l_s}{2},\tfrac{l_s}{2}],\ y_r\in[y_{r;n_y}-\tfrac{l_s}{2},y_{r;n_y}+\tfrac{l_s}{2}]\}$。我们还以 $\mathbf p_t$ 为原点建立 PX′Y′Z 系，它与 OXYZ 系之间是纯平移关系；并以 PX′Y′Z 系建立点 $\mathbf p_t$ 的球坐标系 $(r,\theta,\varphi)$。$\hat{\boldsymbol\theta}$ 与 $\hat{\boldsymbol\varphi}$ 为沿 $\theta$、$\varphi$ 坐标曲线的单位向量；$\hat{\mathbf r}$ 为表示空间向量 $\mathbf r\triangleq\mathbf p_r-\mathbf p_t$ 方向的单位向量，即 $\hat{\mathbf r}=\mathbf r/\|\mathbf r\|$。

**电磁传播的描述。** 根据电磁理论，UE 的电流分布 $\mathbf J(\mathbf p_t,t)$ 在 $\mathbf p_r$ 处产生电场向量 $\mathbf e(\mathbf r,t)\in\mathbb C^3$，它由向量 $\mathbf r$ 标识。考虑时谐场并引入相量场：$\mathbf J(\mathbf p_t,t)=\Re\{\mathbf J(\mathbf p_t)e^{\mathrm{j}\omega t}\}$ 与 $\mathbf e(\mathbf r,t)=\Re\{\mathbf e(\mathbf r)e^{\mathrm{j}\omega t}\}$，其中 $\omega$ 为角频率（弧度/秒）。此时 Maxwell 方程大为简化，可用电流与场相量 $\mathbf J(\mathbf p_t)$、$\mathbf e(\mathbf r)$ 写出。我们假设电磁场在无散射体、无反射体的均匀各向同性介质中传播，即从 $\mathcal R_t$ 到 $\mathcal R_r$ 只存在一条视距链路$^6$。

### B. 基于完备 EPM 的电场模型

根据基本电磁（Maxwell）方程，空间任意点 $\mathbf p_v\in\mathbb R^3$ 处的电流分布 $\mathbf J(\mathbf p_v)$ 与向量电场 $\mathbf e(\mathbf p_v)$ 满足如下非齐次 Helmholtz 波方程 [38]：

$$
-\nabla_{\mathbf p_v}\times\nabla_{\mathbf p_v}\times\mathbf e(\mathbf p_v)+k^2\mathbf e(\mathbf p_v)=\mathrm{j}k\eta\mathbf J(\mathbf p_v),\tag{1}
$$

其中 $\nabla_{\mathbf p_v}\times$ 为关于 $\mathbf p_v$ 的旋度运算，$k=2\pi/\lambda$ 为波数，$\eta$ 为空间介质的本征阻抗（自由空间中为 376.73 欧姆）。

为显式表达激励源（UE）的电流分布 $\mathbf J(\mathbf p_t)$ 与接收机处电场 $\mathbf e(\mathbf r)$ 之间的关系，利用 Green 方法求式（1）的逆映射：

$$
\mathbf e(\mathbf r)=\iiint_{\mathcal R_t}\mathbf G_t(\mathbf r)\mathbf J(\mathbf p_t)\,\mathrm d\mathbf p_t,\tag{2}
$$

其中 $\mathbf G_t(\mathbf r)\in\mathbb C^{3\times3}$ 称为电磁理论中的张量 Green 函数，可表示为

$$
\mathbf G_t(\mathbf r)\triangleq G_s(\mathbf r)\left[\left(1+\mathrm{j}\frac{1}{kr}-\frac{1}{k^2r^2}\right)\mathbf I-\left(1+\mathrm{j}\frac{3}{kr}-\frac{3}{k^2r^2}\right)\hat{\mathbf r}\hat{\mathbf r}^\dagger\right],\tag{3}
$$

其中 $r=\|\mathbf r\|$，$G_s(\mathbf r)$ 为标量 Green 函数，即

$$
G_s(\mathbf r)=\mathrm{j}\frac{\eta}{2\lambda r}e^{\mathrm{j}kr}.\tag{4}
$$

由式（3）显然可见，当 $r\ge\lambda$ 时$^7$，式（3）中两个括号内的第二、三项可以忽略 [34]，故

$$
\mathbf G_t(\mathbf r)\simeq G_s(\mathbf r)\left(\mathbf I-\hat{\mathbf r}\hat{\mathbf r}^\dagger\right).\tag{5}
$$

由于当 UE 位于接收阵列（观测区域 $\mathcal R_r$）的近场区时 $r\ge\lambda$ 恒成立，后续分析采用式（5）。把式（5）代入式（2）并依据向量叉积的定义，得

$$
\mathbf e(\mathbf r)=G_s(\mathbf r)\left(\hat{\mathbf r}\otimes\iiint_{\mathcal R_t}\mathbf J(\mathbf p_t)\,\mathrm d\mathbf p_t\right)\otimes\hat{\mathbf r}.\tag{6}
$$

把 $\iiint_{\mathcal R_t}\mathbf J(\mathbf p_t)\,\mathrm d\mathbf p_t$ 改写为 $\mathbf J_{\mathcal R_t}=J_r\hat{\mathbf r}+J_\theta\hat{\boldsymbol\theta}+J_\varphi\hat{\boldsymbol\varphi}$，其中 $J_r$、$J_\theta$、$J_\varphi$ 为源电流积分向量 $\mathbf J_{\mathcal R_t}$ 沿 $\hat{\mathbf r}$、$\hat{\boldsymbol\theta}$、$\hat{\boldsymbol\varphi}$ 方向的分量。由于 $\hat{\mathbf r}\otimes\hat{\mathbf r}=\mathbf 0$、$(\hat{\mathbf r}\otimes\hat{\boldsymbol\theta})\otimes\hat{\mathbf r}=\hat{\boldsymbol\theta}$、$(\hat{\mathbf r}\otimes\hat{\boldsymbol\varphi})\otimes\hat{\mathbf r}=\hat{\boldsymbol\varphi}$，有

$$
\mathbf e(\mathbf r)=G_s(\mathbf r)\left(J_\theta\hat{\boldsymbol\theta}+J_\varphi\hat{\boldsymbol\varphi}\right)\triangleq G_s(\mathbf r)\mathbf J^{\perp}_{\mathcal R_t}.\tag{7}
$$

式（7）即完备的 EPM，它是 $G_s(\mathbf r)$ 与横向分量 $\mathbf J^{\perp}_{\mathcal R_t}$ 的乘积。$J_r$ 不能产生电场的原因在于：式（5）中的矩阵 $\mathbf I-\hat{\mathbf r}\hat{\mathbf r}^\dagger$ 把辐射场的振荡方向限制为垂直于传播方向向量 $\hat{\mathbf r}$。此外，备注 1 与 2 给出了一些有意义的洞见。

**备注 1（EPM 包含 SWM）：** $G_s(\mathbf r)$ 表示标量球面波，它刻画了 $\mathbf p_t$ 与 $\mathbf p_r$ 之间的距离 $r$。注意，以往绝大多数近场信号模型都基于 SWM，其接收标量场可写成 $e_{\mathrm{swm}}(\mathbf r)=\varepsilon G_s(\mathbf r)$ [22]、[24]、[27]，其中 $\varepsilon$ 为信道功率缩放参数。因此，当把 $\mathbf J^{\perp}_{\mathcal R_t}$ 视为标量常数 $\varepsilon$ 时，EPM 把 SWM 作为特例包含在内。

**备注 2（EPM 提供姿态信息）：** $\mathbf J^{\perp}_{\mathcal R_t}$ 本质上刻画了 $\mathbf e(\mathbf r)$ 的向量特性及其对 $\mathcal R_t$ 内部电流分布的函数依赖。进一步，电流分布与 UE 的位置和姿态参数存在函数关系。因此，EPM 不仅提供位置信息，也提供姿态信息——这正是联合估计位置与姿态的本质。

如第 II-A 节所述，我们考虑 UE 为具有位置参数 $z_t$ 与姿态参数 $t_z$ 的偶极子。因此，式（6）中的 $\mathbf J(\mathbf p_t)$ 可写为

$$
\mathbf J(\mathbf p_t)=I_{\mathrm{dip}}l_{\mathrm{dip}}\delta(\mathbf p_t)\hat{\mathbf t},\tag{8}
$$

其中 $I_{\mathrm{dip}}$ 为偶极子中的均匀电流电平，$\delta(\cdot)$ 为 Dirac delta 函数。于是 $\mathbf J_{\mathcal R_t}$ 可写为

$$
\mathbf J_{\mathcal R_t}=\iiint_{\mathcal R_t}I_{\mathrm{dip}}l_{\mathrm{dip}}\delta(\mathbf p_t)\hat{\mathbf t}\,\mathrm d\mathbf p_t=I_{\mathrm{dip}}l_{\mathrm{dip}}\hat{\mathbf t}.\tag{9}
$$

把式（9）代入式（6），可得

$$
\frac{\mathbf e(\mathbf r)}{G_s(\mathbf r)I_{\mathrm{dip}}l_{\mathrm{dip}}}
=\left(\hat{\mathbf r}\otimes\hat{\mathbf t}\right)\otimes\hat{\mathbf r}
=\underbrace{\hat{\mathbf t}-\left(\hat{\mathbf r}\cdot\hat{\mathbf t}\right)\hat{\mathbf r}}_{\text{辐射矢量}},\tag{10}
$$

其中辐射矢量由单位向量 $\hat{\mathbf t}$ 与 $\hat{\mathbf r}$ 决定。可见向量电场 $\mathbf e(\mathbf r)$ 的方向由辐射矢量 $\hat{\mathbf t}-(\hat{\mathbf r}\cdot\hat{\mathbf t})\hat{\mathbf r}$ 决定，且平行于垂直于传播方向的平面。考虑球坐标与直角坐标的基向量变换关系：$\hat{\mathbf r}=\sin\theta\cos\varphi\,\hat{\mathbf x}+\cos\theta\,\hat{\mathbf y}-\sin\theta\sin\varphi\,\hat{\mathbf z}$。把上述变换代入式（10），并考虑电场向量沿 OXYZ 系中 $\hat{\mathbf x}$、$\hat{\mathbf y}$、$\hat{\mathbf z}$ 方向的三个分量，得

$$
\frac{e_x(\mathbf r)}{\mathcal E_{\mathrm{in}}}
=\mathrm{j}\sin\theta\cos\varphi\frac{-\cos\theta t_y+\sin\theta\sin\varphi t_z}{r}e^{\mathrm{j}kr},\tag{11}
$$

$$
\frac{e_y(\mathbf r)}{\mathcal E_{\mathrm{in}}}
=\mathrm{j}\sin\theta\frac{\sin\theta t_y+\cos\theta\sin\varphi t_z}{r}e^{\mathrm{j}kr},\tag{12}
$$

$$
\frac{e_z(\mathbf r)}{\mathcal E_{\mathrm{in}}}
=\mathrm{j}\frac{\sin\theta\cos\theta\sin\varphi\,t_y+\left(1-\sin^2\theta\sin^2\varphi\right)t_z}{r}e^{\mathrm{j}kr},\tag{13}
$$

其中 $e_x(\mathbf r)\triangleq\mathbf e(\mathbf r)\cdot\hat{\mathbf x}$、$e_y(\mathbf r)\triangleq\mathbf e(\mathbf r)\cdot\hat{\mathbf y}$、$e_z(\mathbf r)\triangleq\mathbf e(\mathbf r)\cdot\hat{\mathbf z}$，$\mathcal E_{\mathrm{in}}=\frac{\eta I_{\mathrm{dip}}l_{\mathrm{dip}}}{2\lambda}$ 为以伏特（Volt）计的初始电场强度。注意 $e_x(\mathbf r)$、$e_y(\mathbf r)$、$e_z(\mathbf r)$ 对 $z_t$ 的函数依赖隐藏在 $(r,\theta,\varphi)$ 中。事实上，$\cos\theta=\frac{y_r}{r}$、$\tan\varphi=\frac{z_t}{x_r}$、$r=\sqrt{x_r^2+y_r^2+z_t^2}$。把上述换算代入式（11）—（13），得到 $e_x(\mathbf r)$、$e_y(\mathbf r)$、$e_z(\mathbf r)$ 关于 $z_t$ 与 $t_z$ 的显式表达式：

$$
e_x(\mathbf r)=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{-x_ry_r\sqrt{1-t_z^2}+x_rz_tt_z}{r^3}e^{\mathrm{j}kr},\tag{14}
$$

$$
e_y(\mathbf r)=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{\left(x_r^2+z_t^2\right)\sqrt{1-t_z^2}+y_rz_tt_z}{r^3}e^{\mathrm{j}kr},\tag{15}
$$

$$
e_z(\mathbf r)=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{y_rz_t\sqrt{1-t_z^2}+\left(x_r^2+y_r^2\right)t_z}{r^3}e^{\mathrm{j}kr}.\tag{16}
$$

进一步，我们考虑从功率观点定义的标量电场。具体地，利用 Poynting 矢量中垂直于观测区域 $\mathcal R_r$ 的分量作为标量电场，即$^8$

$$
e_s(\mathbf r)\triangleq\|\mathbf e(\mathbf r)\|\underbrace{\sqrt{-\hat{\mathbf r}\cdot\hat{\mathbf z}}}_{\text{投影因子}}e^{\mathrm{j}kr}
=\mathcal E_{\mathrm{in}}\frac{e^{\mathrm{j}kr}}{r^{5/2}}\underbrace{\sqrt{z_tx_r^2+z_t\left(y_rt_z+z_t\sqrt{1-t_z^2}\right)^2}}_{\triangleq\, h(\xi;x_r,y_r)},\tag{17}
$$

其中 $h(\xi;x_r,y_r)$ 为具有参数向量 $\xi$ 的偶极子（UE）与观测点 $\mathbf p_r$ 之间的**近场电磁（NF-EM）信道**。投影因子来自以下事实：有效信号是垂直于接收表面的信号分量$^9$。此外，在 Y 轴上（即 $x_r=0$）时，NF-EM 信道简化为

$$
h_y(\xi;y_r)=\frac{e^{\mathrm{j}kr_{ry}}}{r_{ry}^{5/2}}\sqrt{z_t}\left(y_rt_z+z_t\sqrt{1-t_z^2}\right),\tag{18}
$$

其中 $r_{ry}\triangleq r|_{x_r=0}=\sqrt{y_r^2+z_t^2}$。

**讨论 1（一般情形）：** 值得一提的是，我们的系统可以容易地推广到更一般的情形：UE 位于 $\mathcal R_r$ 前方任意点，且在三维空间中具有一般朝向。相应地，一般位置与姿态参数可写为

$$
\xi_{\mathrm{ar}}\triangleq\left(\mathbf p_{\mathrm{ar}}^T,\hat{\mathbf t}^T\right)^T=(x_t,y_t,z_t,t_x,t_y,t_z)^T,\tag{19}
$$

其中 $\mathbf p_{\mathrm{ar}}$ 为 UE 在 OXYZ 系中的一般位置坐标。于是 UE 与 $\mathbf p_r$ 之间的 NF-EM 信道可推导为

$$
h_{\mathrm{ar}}(\xi_{\mathrm{ar}};\mathbf p_r)=\frac{e^{\mathrm{j}k\|\mathbf p_r-\mathbf p_{\mathrm{ar}}\|}}{\|\mathbf p_r-\mathbf p_{\mathrm{ar}}\|^{5/2}}\sqrt{z_t}\left[(t_yx_{r,t}-t_xy_{r,t})^2+(t_zx_{r,t}+t_xz_t)^2+(t_zy_{r,t}+t_yz_t)^2\right]^{1/2},\tag{20}
$$

其中 $x_{r,t}\triangleq x_r-x_t$、$y_{r,t}\triangleq y_r-y_t$。为便于阅读，式（20）的证明推迟到附录 A。式（20）建立了信道模型与一般位置和姿态参数之间的函数关系，使估计这些参数成为可能。与式（17）和（18）相比，式（20）中未知参数的数量从两个增加到六个。这不影响第 III 节闭式解与第 IV 节性能界的推导方法，但会在实现过程中引入一些繁琐而直接的代数计算。

**讨论 2（显式电磁仿真平台信道）：** 常见电磁仿真平台，如 MATLAB Antenna Toolbox 与高频结构仿真器（HFSS），利用特定数值计算方法求解 Maxwell 方程以获得天线的电磁特性。基于式（3）给出的完整张量 Green 函数，我们可以导出适用于全场区（包括反应近场、辐射近场与远场区）的电磁信道，这可以视为电磁仿真平台所采用的信道$^{10}$ [39]、[40]、[41]。具体地，UE 与 $\mathbf p_r$ 之间的**显式电磁仿真平台（EM-SIMP）信道**可表示为 $h_{\mathrm{SIM}}(\xi;x_r,y_r)=\mathcal F_{\mathrm{SF}}h(\xi;x_r,y_r)$，其中 $\mathcal F_{\mathrm{SF}}\triangleq\sqrt{1+\frac{3}{k^2r^2}+\frac{9}{k^4r^4}}$ 为无量纲缩放因子。$h_{\mathrm{SIM}}(\xi;x_r,y_r)$ 的计算过程见附录 B。

**讨论 3（式（17）中 $h(\xi;x_r,y_r)$ 的简化）：** 为给出直观比较，我们简要讨论 NF-EM 信道 $h(\xi;x_r,y_r)$ 的一系列简化如下。

- **姿态固定的电磁（AF-EM）信道：** 文献 [31]、[34]、[42]、[43]、[44] 假设姿态固定沿 Y 轴正方向，即 $t_y=1$。相应地，NF-EM 信道 $h(\xi;x_r,y_r)$ 退化为 AF-EM 信道 $h_{\mathrm{AFEM}}(\mathbf p_t;x_r,y_r)=\frac{\sqrt{z_t}}{\sqrt{x_r^2+z_t^2}}\frac{e^{\mathrm{j}kr}}{r^{5/2}}$。
- **非均匀 SWM（NU-SW）信道：** 忽略姿态失配与投影损失，即 $\frac{\sqrt{x_r^2+z_t^2}}{r}=1$ 与 $\frac{\sqrt{z_t}}{r}=1$ 时，AF-EM 信道退化为 NU-SW 信道 [21]、[22]、[27]：$h_{\mathrm{NUSW}}(\mathbf p_t;x_r,y_r)=\frac1r e^{\mathrm{j}kr}$。
- **均匀 SWM（U-SW）信道 [45]：** 若 $z_t\sim O(D_r^P)$ 且 $P>1$，则幅度项中的 $r$ 可用 $z_t$ 替换。不同接收单元对应的传播距离相同，即各接收单元接收到“均匀”功率。于是 NU-SW 信道可简化为 U-SW 信道：$h_{\mathrm{USW}}(\mathbf p_t;x_r,y_r)=\frac{1}{z_t}e^{\mathrm{j}kr}$。

**讨论 4（$h(\xi;x_r,y_r)$ 的精度）：** 我们计算 EM-SIMP 信道与 NF-EM 信道之间的相对误差（RERR）为 $\mathrm{RERR}_{\mathrm{NFEM}}=\frac{|h_{\mathrm{SIM}}(\xi;x_r,y_r)-h(\xi;x_r,y_r)|}{|h_{\mathrm{SIM}}(\xi;x_r,y_r)|}=1-\frac{1}{\mathcal F_{\mathrm{SF}}}$，它是波长 $\lambda$ 与 $\mathbf p_t$、$\mathbf p_r$ 之间距离 $r$ 的函数。同时，以 EM-SIMP 信道为基准，计算其与讨论 3 中三种近场信道之间的 RERR 为 $\mathrm{RERR}_{\mathrm{type}}=\frac{|h_{\mathrm{SIM}}(\xi;x_r,y_r)-h_{\mathrm{type}}(\mathbf p_t;x_r,y_r)|}{|h_{\mathrm{SIM}}(\xi;x_r,y_r)|}$，其中下标 type 表示 AFEM、NUSW 或 USW。图 3 给出了当 $\lambda=0.01$ m、$x_r=0$ m、$y_r=10\lambda$、$t_z=\sqrt{0.1}$、$\sqrt{0.5}$ 或 $\sqrt{0.9}$ 时 RERR 随归一化 $z_t$（用波长 $\lambda$ 归一化）的变化。可以观察到：当 $\mathbf p_r$ 非常接近 UE，即 $\lambda\le z_t\le10\lambda$ 时，$\mathrm{RERR}_{\mathrm{NFEM}}$ 约为 $10^{-4}$，并随收发距离增大而进一步减小，说明 NF-EM 信道足够精确。此外，其余三个 RERR 在所有距离上都相对较大，且不能像 $\mathrm{RERR}_{\mathrm{NFEM}}$ 那样随收发距离增大而无限减小。这是因为 AF-EM 信道无法准确刻画 UE 的姿态，而 NU-SW 与 U-SW 信道直接忽略了姿态。事实上，即使在远场区，UE 的姿态信息也不能被忽略。

式（17）与（18）中的 NF-EM 信道给出了定义 1 与假设 1 所述 $\xi$ 的复值非线性函数，其相位部分包含 $z_t$，幅度部分同时包含 $z_t$ 与 $t_z$。这使我们能够联合估计 UE 的位置与姿态参数。
## III. 联合估计的闭式解

位置与姿态联合估计问题本质上可转化为：由已知量求解 $z_t$ 与 $t_z$。在无噪声情形下，我们利用任意两个$^{11}$接收单元的观测电压构造一组非线性方程，再求解该方程组以获得 $z_t$ 与 $t_z$ 的闭式解。

具体地，第 $n_y$ 个阵元处的无噪声电压（单位为伏特）可由式（17）的标量电场在 $\mathcal R_{r;n_y}$ 上积分得到：

$$
v_{n_y}=\frac{1}{l_s}\iint_{\mathcal R_{r;n_y}}e_s(\mathbf r)\,\mathrm dx_r\,\mathrm dy_r
\overset{(a)}{\approx}\mathcal E_{\mathrm{in}}l_sh_y\left(\xi;y_{r;n_y}\right),\tag{21}
$$

其中 $(a)$ 成立是因为每个阵元的尺寸处于波长量级，故同一阵元上不同点处标量电场的变化可忽略。$h_y(\xi;y_{r;n_y})$ 是式（18）中 $h_y(\xi;y_r)$ 在 $y_r=y_{r;n_y}$ 处的离散采样点，即 $h_y(\xi;y_{r;n_y})\triangleq h_y(\xi;y_r)|_{y_r=y_{r;n_y}}$。

由式（21），无噪声情形下的联合估计可转化为求解如下非线性方程：

$$
v_\alpha=\mathcal E_{\mathrm{in}}l_s\frac{\sqrt{z_t}\left(y_{r;\alpha}t_z+z_t\sqrt{1-t_z^2}\right)}{r_\alpha^{5/2}}e^{\mathrm{j}kr_\alpha},\tag{22a}
$$

$$
v_\beta=\mathcal E_{\mathrm{in}}l_s\frac{\sqrt{z_t}\left(y_{r;\beta}t_z+z_t\sqrt{1-t_z^2}\right)}{r_\beta^{5/2}}e^{\mathrm{j}kr_\beta},\tag{22b}
$$

其中 $v_\alpha$ 与 $v_\beta$ 是由中心位于 $y_{r;\alpha}$ 与 $y_{r;\beta}$ 的两个阵元获得的已知电压（$1\le\alpha<\beta\le N$），$r_\alpha\triangleq r_{ry}|_{y_r=y_{r;\alpha}}$、$r_\beta\triangleq r_{ry}|_{y_r=y_{r;\beta}}$，而未知变量为 $z_t$ 与 $t_z$。

由于复杂的指数耦合，直接求解上述非线性方程是困难的。为应对这一挑战，我们提出用适当的解耦方法重构上述方程。具体地，把已知复数值 $v_\alpha$ 与 $v_\beta$ 解耦为已知幅度与相位角，因为复数的实部与虚部组合同其幅度与相位组合之间存在一一映射关系。然而，这种解耦方法会带来相位模糊问题，将在第 III-A 节详细讨论。

### A. 相位模糊问题

相位模糊问题是指：所获得的已知相位角可能不同于实际相位角。具体地，由于相位的周期性，已知相位角范围为 $[0,2\pi)$，而实际相位角范围为 $[0,\infty)$。实际相位可与 UE 的位置建立映射关系，即 $\frac{2\pi}{\lambda}\sqrt{y_r^2+z_t^2}=\Theta_{\mathrm{actual}}\in[0,\infty)$，其中 $\Theta_{\mathrm{actual}}$ 为实际相位。相位模糊的存在使该关系不再成立，即 $\frac{2\pi}{\lambda}\sqrt{y_r^2+z_t^2}\ne\Theta_{\mathrm{known}}\in[0,2\pi)$，其中 $\Theta_{\mathrm{known}}$ 为所获得的已知相位。下面讨论相位模糊的不同情形。

1) **情形 I（$r_\alpha<\lambda$ 且 $r_\beta<\lambda$）：** 在情形 I 中，UE 到任意接收单元的距离都在一个波长以内，故已知相位角与实际相位相同，不存在相位模糊。记 $v_\alpha\triangleq\Psi_\alpha e^{\mathrm{j}\Theta_\alpha}$、$v_\beta\triangleq\Psi_\beta e^{\mathrm{j}\Theta_\beta}$，其中 $\Psi_\alpha$、$\Psi_\beta$ 为已知幅度，$\Theta_\alpha$、$\Theta_\beta$ 为已知相位角。于是式（22a）与（22b）解耦为

$$
\Theta_\kappa=k\sqrt{y_{r;\kappa}^2+z_t^2},\tag{23a}
$$

$$
\Psi_\kappa=\mathcal E_{\mathrm{in}}l_s\frac{\sqrt{z_t}\left(y_{r;\kappa}t_z+z_t\sqrt{1-t_z^2}\right)}{r_\kappa^{5/2}},\tag{23b}
$$

其中 $\kappa\triangleq\alpha$ 或 $\beta$。情形 I 通常难以出现，因为无线系统的波长往往很小。

2) **情形 II（$r_\alpha\ge\lambda$ 且 $r_\beta\ge\lambda$）：** 在情形 II 中，UE 到任意接收单元的距离都不小于波长，故已知相位角经过了未知的整数周期，与实际相位不同。进一步，式（23a）可写为

$$
\Theta_\alpha+2\pi N_\alpha=kr_\alpha,\tag{24a}
$$

$$
\Theta_\beta+2\pi N_\beta=kr_\beta,\tag{24b}
$$

其中 $\Theta_\alpha$ 与 $\Theta_\beta$ 为已知相位角，$N_\alpha$ 与 $N_\beta$ 为相应的未知整数周期。注意这些未知整数周期很棘手，因为它们作为一系列新变量引入；未知整数周期随 UE 位置与所涉接收单元而变化。为处理未知整数周期，我们提出一种高效方法：把 UE 的距离域划分，以探究不同接收单元处未知整数周期之间的关系。结果由命题 1 给出。

**命题 1（相位模糊距离 $d_{\mathrm{PA}}$ 与间距约束距离 $d_{\mathrm{SC}}$）：** 当 $z_t$ 不小于相位模糊距离 $d_{\mathrm{PA}}$ 时，任意两个接收单元处未知整数周期之差为 0 或 1，即

$$
N_\beta-N_\alpha=0,\quad\text{若}\ \Theta_\beta>\Theta_\alpha,\tag{25a}
$$

$$
N_\beta-N_\alpha=1,\quad\text{若}\ \Theta_\beta\le\Theta_\alpha,\tag{25b}
$$

其中把 $d_{\mathrm{PA}}$ 定义为 Fraunhofer 距离 $d_F$ 的四分之一，即

$$
d_{\mathrm{PA}}\triangleq\frac14d_F=\frac{D_r^2}{2\lambda},\tag{26}
$$

且 $D_r\ge4.8\lambda$。于是，我们可以用差分法消去式（24a）与（24b）中的 $N_\alpha$ 与 $N_\beta$。当 $z_t<d_{\mathrm{PA}}$ 时，不能任意选择两个接收单元来消除相位模糊，需要缩小两个接收单元之间的距离。具体地，我们利用中心位于 $y_{r;1}=\frac{l_s}{2}$ 与 $y_{r;2}=\frac{3l_s}{2}$ 的两个阵元。于是当 $z_t\ge d_{\mathrm{SC}}$ 时，这两个接收单元处未知整数周期之差为 0 或 1，即

$$
N_2-N_1=0,\quad\text{若}\ \Theta_2>\Theta_1,\tag{27a}
$$

$$
N_2-N_1=1,\quad\text{若}\ \Theta_2\le\Theta_1,\tag{27b}
$$

其中 $d_{\mathrm{SC}}$ 定义为**间距约束距离**：

$$
d_{\mathrm{SC}}\triangleq\max\left\{\frac{l_s^2}{\lambda},\ 3.6l_s\right\}.\tag{28}
$$

**证明：** 如图 4 所示，UE 到接收单元的最小与最大距离分别为

$$
r_{\min}=\sqrt{z_t^2+l_s^2/4}\overset{(b)}{\approx}z_t,\tag{29}
$$

与

$$
r_{\max}\overset{(c)}{\approx}\sqrt{z_t^2+D_r^2}\overset{(d)}{\approx}z_t+\frac{D_r^2}{2z_t},\tag{30}
$$

其中 $(b)$ 成立是因为 $l_s$ 很小，$(c)$ 成立是因为忽略了最后一个阵元中心与观测区域上边界之间的距离，而 $(d)$ 中对 $x=\frac{D_r^2}{z_t^2}$ 使用了 Taylor 近似 $\sqrt{1+x}\approx1+\frac{x}{2}$。于是不同阵元之间的最大相位差可写为

$$
\frac{2\pi}{\lambda}(r_{\max}-r_{\min})\approx\frac{\pi}{\lambda}\frac{D_r^2}{z_t}.\tag{31}
$$

令式（31）不大于 $2\pi$，可得 $z_t\ge\frac{D_r^2}{2\lambda}$。此外，若 $z_t\ge2.4D_r$，则 $(d)$ 中的 Taylor 近似误差小于 $3.5\times10^{-3}$，这给出附加条件 $\frac{D_r^2}{2\lambda}\ge2.4D_r$，即 $D_r\ge4.8\lambda$。注意该条件对电大阵列恒成立，故把相位模糊距离 $d_{\mathrm{PA}}$ 定义为式（26）。类似地，从 UE 到 $(0,y_{r;1},0)$ 与 $(0,y_{r;2},0)$ 的距离之差可写为

$$
\sqrt{z_t^2+y_{r;2}^2}-\sqrt{z_t^2+y_{r;1}^2}
\overset{(e)}{\approx}\frac{y_{r;2}^2-y_{r;1}^2}{2z_t}=\frac{l_s^2}{z_t},\tag{32}
$$

其中 $(e)$ 对 $x=\frac{y_{r;1}^2}{z_t^2}$ 与 $x=\frac{y_{r;2}^2}{z_t^2}$ 使用了 $\sqrt{1+x}\approx1+\frac{x}{2}$。令式（32）不大于 $\lambda$，可得 $z_t\ge\frac{l_s^2}{\lambda}$。此外，若 $z_t\ge3.6l_s$，则 $(e)$ 中的 Taylor 近似误差小于 $3.5\times10^{-3}$。因此把 $d_{\mathrm{SC}}$ 定义为式（28）。证毕。

注意，即使对近场区，$z_t\ge d_{\mathrm{SC}}$ 通常也成立，因为 $l_s$ 处于小波长量级。因此，基于命题 1，当 $z_t\ge d_{\mathrm{PA}}$ 时利用式（25a）与（25b）消除相位模糊，当 $d_{\mathrm{SC}}\le z_t<d_{\mathrm{PA}}$ 时利用式（27a）与（27b）消除相位模糊。

### B. $z_t$ 与 $t_z$ 的闭式解

下面分别针对情形 I 与情形 II 推导 $z_t$ 与 $t_z$ 的闭式解。

1) **情形 I（$r_\alpha<\lambda$ 且 $r_\beta<\lambda$）：** 在情形 I 中，仅需一个观测阵元即可获得 $z_t$。由式（23a）给出的球面波相位，可解出 $z_t$（记为 $z_{\mathrm{I}}$）：

$$
z_{\mathrm{I}}=\sqrt{\frac{\Theta_\kappa^2}{k^2}-y_{r;\kappa}^2}.\tag{33}
$$

接着推导参数 $t_z$ 的表达式。对式（23b）中两式作差，得

$$
\left(y_{r;\alpha}-y_{r;\beta}\right)t_z=\frac{\Psi_\alpha r_\alpha^{5/2}-\Psi_\beta r_\beta^{5/2}}{\mathcal E_{\mathrm{in}}l_s\sqrt{z_t}}.\tag{34}
$$

把式（33）代入式（34），可解出 $t_z$（记为 $t_{\mathrm{I}}$）：

$$
t_{\mathrm{I}}=\frac{\Psi_\alpha\left(y_{r;\alpha}^2+z_{\mathrm{I}}^2\right)^{5/4}-\Psi_\beta\left(y_{r;\beta}^2+z_{\mathrm{I}}^2\right)^{5/4}}{\mathcal E_{\mathrm{in}}l_s\sqrt{z_{\mathrm{I}}}\left(y_{r;\alpha}-y_{r;\beta}\right)}.\tag{35}
$$

2) **情形 II（$r_\alpha\ge\lambda$ 且 $r_\beta\ge\lambda$）：** 在情形 II 中，把式（24a）与（24b）改写为

$$
\Theta_\alpha+2\pi N_\alpha\overset{(f)}{\approx}k\left(z_t+\frac{y_{r;\alpha}^2}{2z_t}\right),\tag{36a}
$$

$$
\Theta_\beta+2\pi N_\beta\overset{(f)}{\approx}k\left(z_t+\frac{y_{r;\beta}^2}{2z_t}\right),\tag{36b}
$$

其中 $(f)$ 中对 $x=\frac{y_{r;\kappa}^2}{z_t^2}$ 使用了近似 $\sqrt{1+x}\approx1+\frac{x}{2}$。由于 $\frac{y_{r;\kappa}^2}{z_t^2}<\frac{D_r^2}{(2.4D_r)^2}\approx0.174$，该近似误差小于 $3.5\times10^{-3}$。把式（25a）与（25b）代入式（36a）与（36b），可解出 $z_t$（记为 $z_{\mathrm{II}1}$）：

$$
z_{\mathrm{II}1}=\dfrac{k\left(y_{r;\beta}^2-y_{r;\alpha}^2\right)}{2\left(\Theta_\beta-\Theta_\alpha\right)},\quad\text{若}\ \Theta_\beta>\Theta_\alpha,\tag{37a}
$$

$$
z_{\mathrm{II}1}=\dfrac{k\left(y_{r;\beta}^2-y_{r;\alpha}^2\right)}{2\left(\Theta_\beta-\Theta_\alpha+2\pi\right)},\quad\text{若}\ \Theta_\beta\le\Theta_\alpha.\tag{37b}
$$

随后通过式（35）求解 $t_z$（记为 $t_{\mathrm{II}1}$），其中令 $z_{\mathrm{I}}=z_{\mathrm{II}1}$。式（37a）与（37b）的闭式解适用于 $z_t\ge d_{\mathrm{PA}}$。若 $d_{\mathrm{SC}}\le z_t<d_{\mathrm{PA}}$，则利用索引为 1 与 2 的阵元。此时与式（36a）—（37b）类似，可解出 $z_t$（记为 $z_{\mathrm{II}2}$）：

$$
z_{\mathrm{II}2}=\dfrac{kl_s^2}{\Theta_2-\Theta_1},\quad\text{若}\ \Theta_2>\Theta_1,\tag{38a}
$$

$$
z_{\mathrm{II}2}=\dfrac{kl_s^2}{\Theta_2-\Theta_1+2\pi},\quad\text{若}\ \Theta_2\le\Theta_1.\tag{38b}
$$

随后通过式（35）求解 $t_z$（记为 $t_{\mathrm{II}2}$），其中令 $z_{\mathrm{I}}=z_{\mathrm{II}2}$。

**备注 3（闭式解汇总）：** 基于假设 1 给出的先验分布，有：

- 若 $\sqrt{H_2^2+y_{r;\kappa}^2}<\lambda$，则 $z_t$ 的闭式解由式（33）给出。
- 若 $\sqrt{H_2^2+y_{r;\kappa}^2}\ge\lambda$ 且 $H_1\ge d_{\mathrm{PA}}$，则 $z_t$ 的闭式解由式（37a）与（37b）给出。
- 若 $\sqrt{H_2^2+y_{r;\kappa}^2}\ge\lambda$ 且 $d_{\mathrm{SC}}\le H_1<d_{\mathrm{PA}}$，则 $z_t$ 的闭式解由式（38a）与（38b）给出。
- $t_z$ 的闭式解由式（35）给出，其中 $z_{\mathrm{I}}$ 替换为相应的 $z_t$ 闭式解。
- 位置与姿态参数可直接计算，时间复杂度为 $O(1)$。此外，闭式解可作为未知参数的初始估计 [44]。

## IV. 联合估计的性能界

第 III 节推导了无噪声情形的闭式解。实际中，式（21）的观测电压不可避免地受噪声影响。本节讨论噪声对联合估计性能的影响。

对含噪情形，位置与姿态联合估计的目标是根据接收阵列上的观测估计 $z_t$ 与 $t_z$。第 $n_y$ 个阵元的观测方程可写为

$$
\tilde v_{n_y}=v_{n_y}+n_{n_y},\tag{39}
$$

其中 $\tilde v_{n_y}$ 为观测电压，$n_{n_y}$ 为与第 $n_y$ 个阵元关联的随机噪声，建模如下。

**假设 2（随机噪声场建模）：** 随机噪声场可建模为空间不相关、圆对称、零均值复高斯过程，其相关函数为 $\mathbb E\{n_{n_y}n_{n_y'}^{*}\}=\sigma^2\delta(n_y-n_y')$，其中 $n_y'$ 为不同于 $n_y$ 的任意索引，$\sigma^2$ 为以 $\mathrm{V}^2_{\mathrm{olt}}$ 计的方差。

把式（39）的观测方程堆叠，得到观测阵列的观测方程向量：

$$
\tilde{\mathbf v}=\mathbf v+\mathbf n=\mathcal E_{\mathrm{in}}l_s\mathbf h_y(\xi)+\mathbf n,\tag{40}
$$

其中 $\tilde{\mathbf v}=[\tilde v_1,\cdots,\tilde v_N]^T$ 与 $\mathbf v=[v_1,\cdots,v_N]^T$ 分别为观测电压向量与无噪声电压向量；$\mathbf h_y(\xi)=[h_y(\xi;y_{r;1}),\cdots,h_y(\xi;y_{r;N})]^T$ 为信道向量，其元素以连续形式由式（18）给出；$\mathbf n=[n_1,\cdots,n_N]^T$ 为随机噪声向量。

均方误差（MSE）是评估估计性能广为接受的指标，可表示为

$$
\mathrm{MSE}(\xi_\imath)=\mathbb E\left\{\left(\xi_\imath-\hat\xi_\imath\right)^2\right\},\quad\imath=1,2,\tag{41}
$$

其中 $\hat\xi\triangleq(\hat z_t,\hat t_z)^T$ 为 $\xi$ 的估计。作为一个具有挑战性的非线性向量参数估计问题，位置与姿态联合估计的最小 MSE 不存在精确闭式表达式，这促使我们寻找 MSE 的闭式下界。如第 IV-A 与 IV-B 节所述，我们将推导闭式 ZZB 与 ECRB 以给出 MSE 的下界。此外，第 V 节评估最大后验（MAP）估计器的 MSE 作为参照。

### A. 位置与姿态联合估计的 ZZB

ZZB 是适用于所有 SNR 区间的全局紧界，它把 MSE 与二元假设检验问题的错误概率联系起来。ZZB 的预备知识由引理 1 给出。

**引理 1（$\xi$ 的 ZZB 预备知识）：** 记 $\xi$ 的估计为 $\hat\xi$，则 MSE 矩阵定义为

$$
\mathbf R_\epsilon=\mathbb E\left\{\epsilon\epsilon^T\right\}=\mathbb E\left\{\left(\hat\xi-\xi\right)\left(\hat\xi-\xi\right)^T\right\}.\tag{42}
$$

用于对 MSE 矩阵取下界的、估计 $\xi$ 的 ZZB 为

$$
\mathbf u^T\mathbf R_\epsilon\mathbf u\ge\frac12\int_0^\infty\mathcal V\left\{\max_{\delta:\mathbf u^T\delta=h}\iint_{\Xi}\left[f_\xi(\vartheta)+f_\xi(\vartheta+\delta)\right]\times P_{\min}(\vartheta,\vartheta+\delta)\,\mathrm d\vartheta\right\}h\,\mathrm dh,\tag{43}
$$

其中 $\mathbf u\in\mathbb R^2$ 为任意归一化权重向量，$\mathcal V\{\cdot\}$ 为谷填充（valley-filling）函数，即 $\mathcal V\{f(t)\}=\sup_{u:u\ge t}f(u)$；$\Xi$ 表示 $\xi$ 的定义区域；$f_\xi(\vartheta)\triangleq f_\xi(\xi)|_{\xi=\vartheta}$，其中 $f_\xi(\xi)$ 为未知向量 $\xi$ 的先验概率密度函数（PDF）；$P_{\min}(\vartheta,\vartheta+\delta)$ 为二元假设检验问题在 $H_0:\xi=\vartheta$ 与 $H_1:\xi=\vartheta+\delta$ 之间判决的最小错误概率。该假设检验问题为

$$
H_0:\xi=\vartheta;\ \tilde{\mathbf v}\sim f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\vartheta),
\qquad
H_1:\xi=\vartheta+\delta;\ \tilde{\mathbf v}\sim f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\vartheta+\delta),\tag{44}
$$

其中 $f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\vartheta)\triangleq f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\xi)|_{\xi=\vartheta}$，$f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\xi)$ 表示给定向量 $\xi$ 时 $\tilde{\mathbf v}$ 的条件 PDF（CPDF）。式（44）先验概率可写为

$$
\Pr\{H_0\}=\frac{f_\xi(\vartheta)}{f_\xi(\vartheta)+f_\xi(\vartheta+\delta)},\tag{45}
$$

$$
\Pr\{H_1\}=\frac{f_\xi(\vartheta+\delta)}{f_\xi(\vartheta)+f_\xi(\vartheta+\delta)}.\tag{46}
$$

**证明：** 证明可参考文献 [46]、[47]、[48]。证毕。

值得注意的是，对引理 1 中 MSE 矩阵的二次型取下界，是同时约束总误差（$\mathbf R_\epsilon$ 对角元素之和）或 $\xi$ 特定分量误差的有效途径。为计算特定参数的估计误差，把 $\mathbf u$ 中与所关注参数对应的元素置 1，其余置 0。

为获得 ZZB 的显式表达式，我们通过用 MAP 准则计算式（44）问题似然比检验的错误概率，推导式（43）中的 $P_{\min}(\vartheta,\vartheta+\delta)$，结果如下。

**引理 2（最小错误概率）：** 式（43）中 $P_{\min}(\vartheta,\vartheta+\delta)$ 的表达式可计算为

$$
P_{\min}(\vartheta,\vartheta+\delta)=\Pr\{H_0\}Q\left(\frac{\mu_{\mathcal L_\vartheta}-\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}}{\sqrt{2\mu_{\mathcal L_\vartheta}}}\right)
+\Pr\{H_1\}Q\left(\frac{\mu_{\mathcal L_\vartheta}+\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}}{\sqrt{2\mu_{\mathcal L_\vartheta}}}\right),\tag{47}
$$

其中 $\Pr\{H_0\}$ 与 $\Pr\{H_1\}$ 由式（45）与（46）给出，$Q(\cdot)$ 表示标准正态分布的尾部分布函数，即 $Q(x)=\frac{1}{\sqrt{2\pi}}\int_x^\infty e^{-\frac{v^2}{2}}\,\mathrm dv$，而 $\mu_{\mathcal L_\vartheta}$ 为

$$
\mu_{\mathcal L_\vartheta}=\mathrm{SNR}\,l_s\int_0^{D_r}A(\vartheta,\delta,y_r)\,\mathrm dy_r,\tag{48}
$$

其中 $\mathrm{SNR}\triangleq\frac{\mathcal E_{\mathrm{in}}^2}{\sigma^2}$ 为 SNR，$A(\vartheta,\delta,y_r)$ 为**模糊函数（AF）**，定义为

$$
A(\vartheta,\delta,y_r)=|h_y(\vartheta+\delta;y_r)|^2+|h_y(\vartheta;y_r)|^2-2|h_y(\vartheta+\delta;y_r)||h_y(\vartheta;y_r)|\cos\left(k\angle A\right),\tag{49}
$$

其中 $h_y(\vartheta;y_r)\triangleq h_y(\xi;y_r)|_{\xi=\vartheta}$，$h_y(\xi;y_r)$ 为式（18）给出的近场电磁（NF-EM）信道，且

$$
\angle A\triangleq r_{ry}|_{z_t=\vartheta_z+\delta_z}-r_{ry}|_{z_t=\vartheta_z}\tag{50}
$$

其中 $\vartheta\triangleq(\vartheta_z,\vartheta_t)^T$、$\delta\triangleq(\delta_z,\delta_t)^T$。

**证明：** 证明见附录 C。证毕。

引理 2 清楚地表明，最小错误概率 $P_{\min}(\vartheta,\vartheta+\delta)$ 是两个先验条件 PDF $f_\xi(\vartheta)$ 与 $f_\xi(\vartheta+\delta)$、以及式（49）中 AF $A(\vartheta,\delta,y_r)$ 的函数。此外，$A(\vartheta,\delta,y_r)$ 刻画了两个 NF-EM 信道 $h_y(\vartheta;y_r)$ 与 $h_y(\vartheta+\delta;y_r)$ 之间的差异。

基于假设 1 中的先验分布，我们在下面命题中推导 ZZB 的显式表达式。

**命题 2（$\xi$ 的 ZZB 表达式）：** 估计 $\xi$ 的 ZZB 表达式可写为

$$
\mathrm{ZZB}(z_t)=\frac{1}{H_t}\int_0^{H_t}\left[\max_{\delta_t}\iint_{\Xi}Q\left(\sqrt{\frac{\mu_{\mathcal L_\vartheta}}{2}}\right)\mathrm d\vartheta\right]\delta_z\,\mathrm d\delta_z,\tag{51}
$$

$$
\mathrm{ZZB}(t_z)=\frac{1}{H_t}\int_0^{1}\left[\max_{\delta_z}\iint_{\Xi}Q\left(\sqrt{\frac{\mu_{\mathcal L_\vartheta}}{2}}\right)\mathrm d\vartheta\right]\delta_t\,\mathrm d\delta_t,\tag{52}
$$

其中 $\mu_{\mathcal L_\vartheta}$ 由式（48）给出，且

$$
\Xi=\left\{\vartheta_z,\vartheta_t:\ \vartheta_z\in\left[H_1,H_2-\delta_z\right],\ \vartheta_t\in\left[0,1-\delta_t\right)\right\},\tag{53}
$$

其中 $\delta_z\in[0,H_t]$、$\delta_t\in[0,1)$。

**证明：** 我们有 $f_\xi(\vartheta)=f_\xi(\vartheta+\delta)=\frac{1}{H_t}$ 及

$$
P_{\min}(\vartheta,\vartheta+\delta)=Q\left(\sqrt{\frac{\mu_{\mathcal L_\vartheta}}{2}}\right).\tag{54}
$$

为简化忽略 $\mathcal V\{\cdot\}$ 函数，式（43）化为

$$
\mathbf u^T\mathbf R_\epsilon\mathbf u\ge\frac{1}{H_t}\int_0^\infty\left[\max_{\delta:\mathbf u^T\delta=h}\iint_{\Xi}Q\left(\sqrt{\frac{\mu_{\mathcal L_\vartheta}}{2}}\right)\mathrm d\vartheta\right]h\,\mathrm dh,\tag{55}
$$

其中 $\Xi$ 由式（53）给出。把式（55）中的 $\mathbf u$ 分别取为 $\mathbf u_z\triangleq(1,0)^T$ 与 $\mathbf u_t\triangleq(0,1)^T$，得

$$
\mathbb E\left\{|z_t-\hat z_t|^2\right\}=\mathbf u_z^T\mathbf R_\epsilon\mathbf u_z=[\mathbf R_\epsilon]_{11}\ge\mathrm{ZZB}(z_t),\tag{56}
$$

$$
\mathbb E\left\{|t_z-\hat t_z|^2\right\}=\mathbf u_t^T\mathbf R_\epsilon\mathbf u_t=[\mathbf R_\epsilon]_{22}\ge\mathrm{ZZB}(t_z),\tag{57}
$$

其中 ZZB 分别由式（51）与（52）给出。证毕。

**讨论 5（ZZB 的计算困难与潜在优化策略）：** 式（51）与（52）与常见联合估计问题的 ZZB 形式类似 [47]。计算困难在于多重积分与最大值搜索，这是大多数多参数 ZZB 计算中的共同困难。我们给出以下潜在优化策略。首先，可以利用粗粒度搜索与低精度区间划分的矩形数值积分计算 ZZB 的初步值，再根据所需精度细化粒度与区间划分。其次，可以通过下一推论 2 所讨论的单参数估计来避免最大值搜索。最后，应当指出，使用适当的优化算法降低计算复杂度值得进一步探索。

在 SNR 很小、或长边长度 $D_r$ 很小、或假设增量 $\xi$ 很小的渐近情形下，式（44）的观测向量在两个假设下不可区分，由此得到下面简化的 ZZB。

**推论 1（ZZB 的渐近分析）：** 当 $\mathrm{SNR}\to0$、或 $D_r\to0$、或 $\delta\to0$ 时，式（51）与（52）的 ZZB 退化为

$$
\mathrm{ZZB}(z_t)=\frac{H_t^2}{12},\qquad \mathrm{ZZB}(t_z)=\frac{1}{12}.\tag{58}
$$

**证明：** 若 SNR 或 $D_r$ 趋于零，则式（88）中的 $\mathcal L_\vartheta$ 与 $\mathcal L_{\vartheta+\delta}$ 可视为确定值 0。于是在假设 1 下可得 $P_{\min}=\frac12$（此处用 $P_{\min}$ 表示 $P_{\min}(\vartheta,\vartheta+\delta)$）。此外，若 $\delta$ 趋于 0，则式（44）中的观测电压向量 $\tilde{\mathbf v}$ 在两个假设下不可区分，故 $P_{\min}=\frac{f_\xi(\vartheta)}{2f_\xi(\vartheta)}=\frac12$。因此式（54）中的 $P_{\min}$ 退化为 $P_{\min}=\frac12$，代入式（51）与（52）即得式（58）。证毕。

推论 1 表明，若 $\mathrm{SNR}\to0$、或 $D_r\to0$、或 $\delta\to0$，则 ZZB 就是位置与姿态参数的先验方差。换言之，当观测向量 $\tilde{\mathbf v}$ 不可区分时，ZZB 利用先验知识，从而能够为 MSE 提供全局紧界。

进一步，为简化 ZZB 表达式，我们考虑非联合估计，即仅姿态估计$^{12}$：假设位置参数 $z_t$ 已知，未知参数为 $t_z$。仅姿态估计是联合估计的一个特例，此前尚无人研究。为使仅姿态估计聚焦于非联合估计情形的原始结构、不受已知参数取值干扰，我们对仅姿态估计作假设 3。

**假设 3（仅姿态估计）：** 不假定 $z_t$ 取确定值；具体地，仍把它视为随机变量，且其概率分布与假设 1 中相应随机变量相同。

**推论 2（仅姿态估计的 ZZB）：** 仅姿态估计的 ZZB 表达式为

$$
\mathrm{ZZB}_{\mathrm{AO}}(t_z)=\int_0^1\delta_t\int_0^{1-\delta_t}\mathbb E_{z_t}\left\{Q\left(\sqrt{\frac{\mu_{\mathcal L_{\vartheta_a}}}{2}}\right)\right\}\mathrm d\vartheta_t\,\mathrm d\delta_t,\tag{59}
$$

其中

$$
\frac{\mu_{\mathcal L_{\vartheta_a}}}{\mathrm{SNR}\,l_s}
=\frac{\delta_t^2\tau^3+2\delta_t\mathcal F_t+\mathcal F_t^2\left(2\tau^2+3\right)\tau}{3z_t\left(\tau^2+1\right)^{3/2}}-\frac{2\delta_t\mathcal F_t}{3z_t},\tag{60}
$$

且 $\mathcal F_t\triangleq\sqrt{1-\vartheta_t^2}-\sqrt{1-(\vartheta_t+\delta_t)^2}$。式（60）中参数 $\tau\triangleq D_r/z_t$ 度量接收表面最大几何尺寸 $D_r$ 相对 UE 到接收机距离的归一化比例。进一步，当 $\mathcal R_r$ 在 Y 维上无限，即 $D_r\to\infty$（$\tau\to\infty$）时，式（60）可写为

$$
\lim_{D_r\to\infty}\mu_{\mathcal L_{\vartheta_a}}=\frac{\mathrm{SNR}\,l_s}{3z_t}\left[\left(\delta_t-\mathcal F_t\right)^2+\mathcal F_t^2\right].\tag{61}
$$

**证明：** 证明见附录 D。证毕。

由于积分维数降低且没有一维最大值搜索过程，式（59）中的 ZZB 相比式（52）大为简化。通过推论 5 与第 V-B6 节，我们指出 $\mathrm{ZZB}_{\mathrm{AO}}(t_z)$ 可用于以很小的误差近似 $\mathrm{ZZB}(t_z)$。此外可以观察到，波长 $\lambda$ 不影响 $t_z$ 的 ZZB，因为式（18）中信道 $h_y(\xi;y_r)$ 的相位项只含 $z_t$ 而不含 $t_z$。

### B. 位置与姿态联合估计的 ECRB

CRB 为任意无偏估计的 MSE 提供下界，即任何此类估计器的 MSE 至少等于 Fisher 信息的逆。与第 IV-A 节的 ZZB 相比，CRB 是局部界，仅在小误差估计情形（如高 SNR）下渐近紧。然而，由于 CRB 更易计算且被广泛使用，我们将推导联合估计的闭式 CRB，以在高 SNR 区间获得更多洞见。

由于参数向量 $\xi$ 是随机的且具有已知先验分布 $f_\xi(\xi)$，我们考虑 CRB 的贝叶斯版本，即期望 CRB（ECRB）[49]。ECRB 的预备知识由引理 3 给出。

**引理 3（$\xi$ 的 ECRB 预备知识）：** 基于估计理论，估计 $\xi$ 的第 $\imath$ 个元素的 ECRB 为

$$
\mathrm{ECRB}(\xi_\imath)=\mathbb E_\xi\left\{\left[\mathbf F^{-1}(\xi)\right]_{\imath\imath}\right\},\quad\imath=1,2,\tag{62}
$$

其中 $\mathbf F(\xi)$ 为特定向量 $\xi$ 的确定性 Fisher 信息矩阵（FIM），其第 $\imath$ 行第 $j$ 列元素为

$$
[\mathbf F(\xi)]_{\imath j}=2\mathrm{SNR}\,l_s\int_0^{D_r}\Re\left\{\frac{\partial h_y^{*}(\xi;y_r)}{\partial\xi_\imath}\frac{\partial h_y(\xi;y_r)}{\partial\xi_j}\right\}\mathrm dy_r.\tag{63}
$$

**证明：** 证明见附录 E。证毕。

**讨论 6（贝叶斯 CRB）：** CRB 的另一种贝叶斯版本是贝叶斯 CRB（BCRB）。估计 $\xi$ 的第 $\imath$ 个元素的 BCRB 为 $\mathrm{BCRB}(\xi_\imath)=[\mathbf B^{-1}]_{\imath\imath}$、$\imath=1,2$，其中 $\mathbf B$ 为 $2\times2$ 正定矩阵，其第 $\imath$ 行第 $j$ 列元素为

$$
[\mathbf B]_{\imath j}=\underbrace{\mathbb E_\xi\left\{[\mathbf F(\xi)]_{\imath j}\right\}}_{\triangleq[\mathbf F_{\mathrm O}]_{\imath j}}
+\underbrace{\mathbb E_\xi\left\{\frac{\partial\ln f_\xi(\xi)}{\partial\xi_\imath}\frac{\partial\ln f_\xi(\xi)}{\partial\xi_j}\right\}}_{\triangleq[\mathbf B_{\mathrm P}]_{\imath j}},\tag{64}
$$

其中 $\mathbf F_{\mathrm O}$ 与 $\mathbf B_{\mathrm P}$ 分别表示从观测数据和先验知识获得的信息。在假设 1 下，$\xi$ 没有先验信息贡献到 $\mathbf B$，即 $\mathbf B_{\mathrm P}=\mathbf 0$。注意 BCRB 难以评估，因为 $\mathbf F(\xi)$ 关于 $\xi$ 的期望在解析上不可处理。此外，在高 SNR 区间，ECRB 是比 BCRB 更紧的 MSE 界，即 $\mathrm{BCRB}(\xi_\imath)<\mathrm{ECRB}(\xi_\imath)\le\mathrm{MSE}(\xi_\imath)$$^{13}$ [50]。因此本文采用 ECRB。

下面给出 ECRB 的表达式。

**命题 3（$\xi$ 的 ECRB 表达式）：** 估计 $\xi$ 的 ECRB 表达式为

$$
\mathrm{ECRB}(z_t)=\frac{\mathrm{SNR}^{-1}}{2l_s}\mathbb E_\xi\left\{\frac{\mathcal I_{tt}}{\mathcal I_{zz}\mathcal I_{tt}-\mathcal I_{zt}^2}\right\},\tag{65}
$$

$$
\mathrm{ECRB}(t_z)=\frac{\mathrm{SNR}^{-1}}{2l_s}\mathbb E_\xi\left\{\frac{\mathcal I_{zz}}{\mathcal I_{zz}\mathcal I_{tt}-\mathcal I_{zt}^2}\right\},\tag{66}
$$

其中 $\mathcal I_{zz}\triangleq\mathcal I_{zz1}+k^2\mathcal I_{zz2}$，

$$
\mathcal I_{zz1}\triangleq\frac{1}{z_t}\int_0^{D_r}\frac{\left[t_zy_r\left(y_r^2-4z_t^2\right)+t_y\ell_{yz}z_t\right]^2}{4r_{ry}^9}\,\mathrm dy_r,\tag{67}
$$

$$
\mathcal I_{zz2}\triangleq z_t^3\int_0^{D_r}\frac{\left(t_zy_r+t_yz_t\right)^2}{r_{ry}^7}\,\mathrm dy_r,\tag{68}
$$

$$
\mathcal I_{tt}\triangleq z_t\int_0^{D_r}\frac{\left(y_r-z_tt_z/t_y\right)^2}{r_{ry}^5}\,\mathrm dy_r,\tag{69}
$$

$$
\mathcal I_{zt}\triangleq\int_0^{D_r}\frac{t_zy_r\left(y_r^2-4z_t^2\right)+t_yz_t\ell_{yz}}{2r_{ry}^7}\left(y_r-z_tt_z/t_y\right)^{-1}\mathrm dy_r,\tag{70}
$$

且 $\ell_{yz}\triangleq3y_r^2-2z_t^2$。$\mathcal I_{zz1}$、$\mathcal I_{zz2}$、$\mathcal I_{tt}$、$\mathcal I_{zt}$ 的闭式表达式在附录 F 的式（106）—（109）中给出。

**证明：** 证明见附录 F。证毕。

命题 3 表明 ECRB 与 SNR 成反比。具体地，无论在高 SNR 还是低 SNR 区间，SNR 提高 10 倍都会使 ECRB 降低 10 倍。注意 ECRB 仅在高 SNR 区间才是 MSE 的渐近紧下界。此外，ECRB 与 $l_s$（观测区域短边长度）成反比；若 $l_s\to0$，则 CRB 将无限增大。这是因为式（7）与（18）中的近场电磁信号与信道是物理世界中的 3D 模型，而 $l_s$ 减到 0 会使式（21）中的无噪声观测信号减到 0，即无法捕获任何有效信息，先验知识也无法利用。

在 SNR 很小或长边长度 $D_r$ 很小的渐近情形，即 $\mathrm{SNR}\to0$ 或 $D_r\to0$ 时，有 $\mathrm{ECRB}(\xi_\imath)=\infty$，意味着观测信息与先验知识均无法利用。

在观测区域 $\mathcal R_r$ 沿 Y 维无限且偶极子指向 Y 轴正方向的渐近情形，ECRB 可简化如下。

**推论 3（ECRB 的渐近分析）：** 当 $D_r\to\infty$ 且 $t_z\to0$ 时，式（65）与（66）中的 ECRB 简化为

$$
\mathrm{ECRB}(z_t)=\frac{\mathrm{SNR}^{-1}}{2l_s}\mathbb E_{z_t}\left\{\frac{210z_t^3}{112k^2z_t^2+75}\right\},\tag{71}
$$

$$
\mathrm{ECRB}(t_z)=\frac{3\mathrm{SNR}^{-1}}{2l_s}\mathbb E_{z_t}\left\{z_t\right\}.\tag{72}
$$

进一步，当位置坐标沿 Z 方向的分量远大于波长，即 $z_t\gg\lambda$$^{14}$——这在载频处于 GHz 及以上范围的系统中通常成立——式（71）可简化为

$$
\mathrm{ECRB}(z_t)\approx\frac{15\mathrm{SNR}^{-1}}{64\pi^2l_s}\lambda^2\mathbb E_{z_t}\left\{z_t\right\}.\tag{73}
$$

**证明：** 证明见附录 G。证毕。

推论 3 表明，由于 $\mathbb E_{z_t}\{z_t\}$ 可直接由先验知识获得，我们不再需要用 Monte Carlo 仿真来评估式（72）与（73）。此外，式（73）揭示了 $z_t$ 的 ECRB 依赖 $\lambda$ 的二次方：事实上，把 $\lambda$ 减小为原来的 $1/\varrho$ 会使其减小为 $1/\varrho^2$。$t_z$ 的 ECRB 不具有同一结论。

与推论 2 类似，我们简化仅姿态估计情形下的 ECRB 表达式。

**推论 4（仅姿态估计的 ECRB）：** 仅姿态估计的 ECRB 表达式为

$$
\mathrm{ECRB}_{\mathrm{AO}}(t_z)=\frac{\mathrm{SNR}^{-1}}{2l_s}\mathbb E_\xi\left\{\mathcal I_{tt}^{-1}\right\},\tag{74}
$$

其中 $\mathcal I_{tt}$ 由式（69）给出，其闭式表达式在式（108）中计算。进一步，若 $D_r\to\infty$，式（108）写为

$$
\lim_{D_r\to\infty}\mathcal I_{tt}=\frac{1}{3z_t}\frac{1+t_z^2-2t_z^2\sqrt{1-t_z^2}}{1-t_z^2}.\tag{75}
$$

**证明：** 仅姿态估计的 FIM 退化为标量 Fisher 信息参数，随后可沿用命题 3 的类似证明过程。证毕。

在获得联合估计与仅姿态估计的 ZZB 与 ECRB 之后，我们讨论它们之间的关系。

**推论 5（ZZB、ECRB 与联合/仅姿态估计的比较）：** 对联合估计与仅姿态估计，有

$$
\mathrm{ZZB}(t_z)\ge\mathrm{ZZB}_{\mathrm{AO}}(t_z),\tag{76}
$$

$$
\mathrm{ECRB}(t_z)\ge\mathrm{ECRB}_{\mathrm{AO}}(t_z).\tag{77}
$$

**证明：** 证明见附录 H。证毕。

推论 5 表明，联合估计的 ZZB 与 ECRB 的可达下界分别是仅姿态估计的 ZZB 与 ECRB。这是合理的：由于其他参数带来的不确定性，估计更多参数会导致更大的误差。
## V. 数值结果与讨论

本节给出数值结果以验证解析结果。首先分析第 III 节推导的闭式解；然后评估第 IV-A 与 IV-B 节给出的 ZZB 与 ECRB，以展示各种系统参数对联合估计性能的影响；此外给出 MAP 估计器的 MSE 作为基准。

### A. 联合估计的闭式解

为评估闭式解的精度，我们计算均方根误差（RMSE），即

$$
\mathrm{RMSE}(z_t)=\sqrt{\frac{1}{UV}\sum_{u=1}^{U}\sum_{v=1}^{V}\left(z_{t;u}-z_{\chi;u,v}\right)^2},
$$

其中 $z_{t;u}$ 为先验区域 $[H_1,H_2]$ 中的第 $u$ 个均匀采样点，$z_{\chi;u,v}$ 为对应不同条件（$\chi=\mathrm{I},\mathrm{II}1,\mathrm{II}2$）的闭式解——分别由式（33）、（37a）、（37b）、（38a）、（38b）给出——在 $z_t$ 的第 $u$ 个均匀采样点与 $t_z$ 的第 $v$ 个均匀采样点处的取值，$U$ 与 $V$ 为采样点数，取 $U=10{,}000$、$V=10{,}000$。类似地定义 $\mathrm{RMSE}(t_z)$，因篇幅所限此处省略。$\mathrm{RMSE}(z_t)$ 以米 [m] 计，$\mathrm{RMSE}(t_z)$ 无量纲，单位为常数 [1]。

随后研究闭式解对 EM-SIMP 信道的精度。定义仿真 RMSE 为

$$
\mathrm{RMSE}_{\mathrm{SIM}}(z_t)=\sqrt{\frac{1}{UV}\sum_{u=1}^{U}\sum_{v=1}^{V}\left(z_{t;u}-\tilde z_{\chi;u,v}\right)^2},
$$

其中 $\tilde z_{\chi;u,v}$ 为 $z_t$ 的仿真闭式解，式（33）、（37a）、（37b）、（38a）、（38b）中的已知量 $\Theta_\kappa$ 与 $\Psi_\kappa$ 由讨论 2 中的 $h_{\mathrm{SIM}}(\xi;x_r,y_r)$ 生成。

进一步，为说明基于波长 $\lambda$、式（26）的相位模糊距离 $d_{\mathrm{PA}}$ 与式（28）的间距约束距离 $d_{\mathrm{SC}}$ 划分 UE 距离域的重要性，定义失配 RMSE 为

$$
\mathrm{RMSE}_{\mathrm{mis}}(t_z)=\sqrt{\frac{1}{UV}\sum_{u=1}^{U}\sum_{v=1}^{V}\left(t_{z;v}-\breve t_{\chi;u,v}\right)^2},
$$

其中 $\breve t_{\chi;u,v}$ 为 $t_z$ 的失配闭式解。具体地，对 $z_t\ge d_{\mathrm{PA}}$ 的情形 II，使用式（33）与（35）中情形 I 的解；对 $d_{\mathrm{SC}}\le z_t<d_{\mathrm{PA}}$ 的情形 II，使用式（37a）、（37b）与（35）中 $z_t\ge d_{\mathrm{PA}}$ 的情形 II 解。

大量数值评估结果列于表 II。可以观察到，闭式解的 RMSE 在所有情形中都接近 0，说明闭式解的精度；情形 II 的 RMSE 不为 0 的原因在于式（36a）与（36b）中的 Taylor 近似引入了可容忍的误差。此外，由于 NF-EM 信道的相位完全准确，$\mathrm{RMSE}_{\mathrm{SIM}}(z_t)$ 与 $\mathrm{RMSE}(z_t)$ 相等；$\mathrm{RMSE}_{\mathrm{SIM}}(t_z)$ 相对 $\mathrm{RMSE}(t_z)$ 仅有极小的增量。因此，我们的闭式解对电磁仿真平台信道同样准确。此外可以观察到，情形 II 的失配 RMSE 为异常的复数或非常大的实数值。这是因为失配会使命题式（33）根号内的值变为负数，或使 $N_\beta-N_\alpha\gg1$。因此，基于 $\lambda$、$d_{\mathrm{PA}}$ 与 $d_{\mathrm{SC}}$ 对 UE 距离域进行精细划分十分重要。

**表 II：$\alpha=1$、$\beta=N/2$ 时闭式解的精度。各情形的参数设置在表中给出。**（来源：原文第 12 页。原表是一张 9 列宽表，三个情形并列；为便于网页阅读，此处按三个情形拆为三张子表，逐格内容与原表一致；"✓"表示理论值与仿真值一致，"✗"表示失配、不适用。）

**表 II(a)：情形 I（式（33）、（35）），单位 [m]。**

| 参数 | 设置 1 | 设置 2 |
|---|---|---|
| $\lambda$ | 1 | 0.5 |
| $D_r$ | 0.5 | 1 |
| $l_s$ | 0.05 | 0.05 |
| $y_{r;1}$ | 0.025 | 0.025 |
| $y_{r;N/2}$ | 0.225 | 0.475 |
| $H_1$ | 0.5 | 0.1 |
| $H_2$ | 0.9 | 0.45 |
| $d_{\mathrm{PA}}$（式（26）） | 0.125 | 1 |
| $d_F$（式（26）） | 0.5 | 4 |
| $\mathrm{RMSE}(z_t)$（✓） | 0 | 0 |
| $\mathrm{RMSE}_{\mathrm{SIM}}(z_t)$（✓） | 0 | 0 |
| $\mathrm{RMSE}_{\mathrm{mis}}(z_t)$（✗） | — | — |
| $\mathrm{RMSE}(t_z)$（✓） | 0 | 0 |
| $\mathrm{RMSE}_{\mathrm{SIM}}(t_z)$（✓） | $3.57\times10^{-2}$ | $9.85\times10^{-2}$ |
| $\mathrm{RMSE}_{\mathrm{mis}}(t_z)$（✗） | — | — |

**表 II(b)：$z_t\ge d_{\mathrm{PA}}$ 的情形 II（式（37a）、（37b）、（35）），单位 [m]。**

| 参数 | 设置 3 | 设置 4 | 设置 5 |
|---|---|---|---|
| $\lambda$ | 0.1 | 0.1 | 0.01 |
| $D_r$ | 1 | 2 | 2 |
| $l_s$ | 0.05 | 0.05 | 0.05 |
| $y_{r;1}$ | 0.025 | 0.025 | 0.025 |
| $y_{r;N/2}$ | 0.475 | 0.975 | 0.975 |
| $H_1$ | 5 | 20 | 200 |
| $H_2$ | 20 | 80 | 400 |
| $d_{\mathrm{PA}}$（式（26）） | 5 | 20 | 200 |
| $d_F$（式（26）） | 20 | 80 | 800 |
| $\mathrm{RMSE}(z_t)$（✓） | $5.70\times10^{-3}$ | $5.90\times10^{-3}$ | $8.41\times10^{-4}$ |
| $\mathrm{RMSE}_{\mathrm{SIM}}(z_t)$（✓） | $5.70\times10^{-3}$ | $5.90\times10^{-3}$ | $8.41\times10^{-4}$ |
| $\mathrm{RMSE}_{\mathrm{mis}}(z_t)$（✗） | $13.2-\mathrm{j}0.0236$ | $52.9-\mathrm{j}0.0236$ | $306-\mathrm{j}0.0245$ |
| $\mathrm{RMSE}(t_z)$（✓） | $7.72\times10^{-4}$ | $2.15\times10^{-4}$ | $3.66\times10^{-6}$ |
| $\mathrm{RMSE}_{\mathrm{SIM}}(t_z)$（✓） | $7.74\times10^{-4}$ | $2.15\times10^{-4}$ | $3.66\times10^{-6}$ |
| $\mathrm{RMSE}_{\mathrm{mis}}(t_z)$（✗） | $0.440+\mathrm{j}0.0686$ | $0.469+\mathrm{j}0.0529$ | $0.525+\mathrm{j}0.00910$ |

**表 II(c)：$d_{\mathrm{SC}}\le z_t<d_{\mathrm{PA}}$ 的情形 II（式（38a）、（38b）、（35）），单位 [m]。**

| 参数 | 设置 6 | 设置 7 | 设置 8 | 设置 9 |
|---|---|---|---|---|
| $\lambda$ | 0.1 | 0.1 | 0.01 | 0.01 |
| $D_r$ | 1 | 1 | 2 | 2 |
| $l_s$ | 0.05 | 0.1 | 0.05 | 0.005 |
| $y_{r;1}$ | 0.025 | 0.05 | 0.025 | 0.0025 |
| $y_{r;2}$ | 0.075 | 0.15 | 0.075 | 0.0075 |
| $H_1$ | 0.18 | 0.36 | 0.25 | 0.018 |
| $H_2$ | 4.98 | 4.98 | 199 | 199 |
| $d_{\mathrm{PA}}$（式（26）） | 5 | 5 | 200 | 200 |
| $d_{\mathrm{SC}}$（式（28）） | 0.18 | 0.36 | 0.25 | 0.018 |
| $\mathrm{RMSE}(z_t)$（✓） | $1.60\times10^{-3}$ | $4.60\times10^{-3}$ | $2.22\times10^{-4}$ | $2.19\times10^{-5}$ |
| $\mathrm{RMSE}_{\mathrm{SIM}}(z_t)$（✓） | $1.60\times10^{-3}$ | $4.60\times10^{-3}$ | $2.22\times10^{-4}$ | $2.19\times10^{-5}$ |
| $\mathrm{RMSE}_{\mathrm{mis}}(z_t)$（✗） | 33.1 | 27.2 | $2.74\times10^{3}$ | $2.19\times10^{3}$ |
| $\mathrm{RMSE}(t_z)$（✓） | $3.80\times10^{-3}$ | $5.50\times10^{-3}$ | $3.99\times10^{-4}$ | $7.29\times10^{-4}$ |
| $\mathrm{RMSE}_{\mathrm{SIM}}(t_z)$（✓） | $4.30\times10^{-3}$ | $5.60\times10^{-3}$ | $4.00\times10^{-4}$ | $8.22\times10^{-4}$ |
| $\mathrm{RMSE}_{\mathrm{mis}}(t_z)$（✗） | $1.82\times10^{4}$ | $1.36\times10^{4}$ | $1.14\times10^{7}$ | $4.85\times10^{4}$ |

### B. 联合估计的 ZZB 与 ECRB

下面数值评估式（51）与（52）给出的 ZZB、式（65）与（66）给出的 ECRB。

1) **SNR 的影响：** 图 5 仿真了当 $z_t\sim\mathcal U[3\ \mathrm m,5\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$\lambda=0.1$ m（即 $f=3$ GHz）、$D_r=5$ m、$l_s=0.1$ m 时，ZZB、ECRB 与由 Monte Carlo 仿真得到的 MAP 估计 MSE 随 SNR 的变化。由图 5 的结果可得出以下有趣结论。

- **ZZB、ECRB 与 MSE 的关系：** MAP 估计器的 MSE 被相应的 ZZB 全局地界定。由于 ECRB 是局部紧界而 ZZB 是全局紧界，因此 ZZB 在所有 SNR 区间都提供至少与相应 ECRB 一样紧或更紧的界，这并不令人意外。
- **渐近阈值与先验阈值：** 图 5 表明先验阈值为 20 dB、渐近阈值为 40 dB。当 SNR 低于先验阈值（先验区）时，ZZB 由先验信息主导并趋近先验方差（见推论 1），这可通过忽略观测、改用先验均值估计来实现；当 SNR 高于渐近阈值（渐近区）时，ZZB 与 ECRB 一致，并由 Fisher 信息的逆主导；当 SNR 介于两个阈值之间（过渡区）时，观测的作用变大，使 ZZB 与 ECRB 逐渐相互接近。
- **$\mathrm{ZZB}(z_t)$ 与 $\mathrm{ZZB}(t_z)$ 曲线的差异：** 对 $\mathrm{ZZB}(t_z)$ 曲线，其斜率绝对值在过渡区逐渐增大，随后在渐近区趋于稳定；对 $\mathrm{ZZB}(z_t)$ 曲线，其斜率绝对值先逐渐增大、随后减小，最终趋于常值。事实上，感知系统的物理参数设置导致这两条曲线的不同特征，进而使 ECRB$(z_t)$ 与 ECRB$(t_z)$ 在先验区相对相应 ZZB 呈现不同偏差（表现为不同的正负号以及不同的绝对值），因为 ECRB 在渐近区按 ZZB 的斜率呈线性变化。这也揭示出 ECRB 无法在渐近区之外提供有效的性能预测。
- **联合估计的精度：** 当接收线阵尺寸为数米、频率约 3 GHz 且 SNR 较高时，位置估计可达到毫米级精度，姿态估计可达到 0.1 量级精度。

2) **长边长度 $D_r$ 的影响：** 图 6 给出当 $z_t\sim\mathcal U[4\ \mathrm m,8\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$\lambda=0.1$ m、$l_s=0.1$ m、$\mathrm{SNR}=30$ dB、40 dB 或 50 dB 时 ECRB 与 ZZB 随长边长度 $D_r$ 的变化。可以看到，所有 ECRB 与 ZZB 都随 $D_r$ 增大而不同程度地减小。具体地，有以下洞见。

- **ECRB 随 $D_r$ 的变化：** 所有 ECRB 在 $D_r$ 从 0.1 m 增至 10 m 的过程中急剧下降，并在 $D_r\approx10$ m 之后趋近渐近极限。原因是在实际关注的 $D_r$ 取值上，$D_r$ 增大会极大改善观测性能，而当 $D_r$ 超过 10 m 这一临界点后，继续增大不再增强观测。
- **ZZB 随 $D_r$ 的变化：** $t_z$ 的 ZZB 随 $D_r$ 增大缓慢下降，说明增大 $D_r$ 对提升 $t_z$ 估计性能的作用有限。此外，$z_t$ 的 ZZB 在 $D_r$ 处于 1 m～10 m 范围内随 $D_r$ 增大而快速下降，因为观测极大改善了 $z_t$ 的估计性能；同时还发现，当 $D_r$ 小于 1 m 或大于 10 m 时，$\mathrm{ZZB}(z_t)$ 下降缓慢或趋近极限值。
- **ZZB 与 ECRB 的收敛性：** 当 SNR 为 30 dB 时，ZZB 未能收敛到相应 ECRB，尽管二者差异随 $D_r$ 增大而逐渐减小；当 SNR 为 40 dB 且 $D_r$ 大于 10 m，或 SNR 为 50 dB 且 $D_r$ 大于 6 m 时，ZZB 收敛到相应 ECRB。这揭示出：在高 SNR 与充分观测（观测区域长边 $D_r$ 处于数米范围）下，ZZB 收敛于 ECRB。

3) **载频的影响：** 图 7 给出当 $z_t\sim\mathcal U[5\ \mathrm m,6\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$D_r=5$ m、$l_s=0.1$ m，且波长取三种不同值（$\lambda=0.1$ m，对应 $f=3$ GHz；$\lambda=0.01$ m，即 $f=30$ GHz；$\lambda=0.001$ m，即 $f=300$ GHz）时 ECRB 与 ZZB 随 SNR 的变化。如预期，估计精度随 SNR 提高而提升，渐近阈值与先验阈值分别出现在 40 dB 与 20 dB。注意 $z_t$ 的 ECRB 线性依赖于波长平方（即 $\lambda^2$）：事实上，把波长减小为 $1/10$ 会使 ECRB$(z_t)$ 减小为 $1/10^2$，这可由推论 3 的结果解析导出。此外，当 SNR 大于渐近阈值时，$z_t$ 的 ZZB 也线性依赖于 $\lambda^2$；而当 SNR 小于渐近阈值时，$\mathrm{ZZB}(z_t)$ 不再具有对 $\lambda^2$ 的同一依赖关系。具体地，当 SNR 小于先验阈值时，$z_t$ 的三个 ZZB 都趋近 $z_t$ 的先验方差；而当 SNR 处于过渡区时，载频更高的 $\mathrm{ZZB}(z_t)$ 会更快下降并收敛到相应更小的 ECRB。注意 $t_z$ 的 ECRB 与 ZZB 都与 $\lambda$ 无关，因为式（18）中信道 $h_y(\xi;y_r)$ 的相位项只含 $z_t$ 而不含 $t_z$。

4) **短边长度 $l_s$ 的影响：** 图 8 给出当 $z_t\sim\mathcal U[5\ \mathrm m,6\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$D_r=5$ m、$\lambda=0.01$ m，且短边长度取四种不同值 $l_s=0.02$ m、0.1 m、0.5 m、2.5 m 时 ECRB 与 ZZB 随 $l_s$ 的变化。为说明沿 X 维的短边长度 $l_s$ 对联合估计性能的影响，沿 Y 维的子阵元间隔仍设为 $l_s=0.1$ m，只改变沿 X 维的 $l_s$。可以看到，$z_t$ 与 $t_z$ 的 ECRB 线性依赖于 $l_s$ 的倒数（即 $l_s^{-1}$）：事实上，把 $l_s$ 增大为 5 倍会使 ECRB$(z_t)$ 与 ECRB$(t_z)$ 减小为同等的 $1/5$。由于在高 SNR 区 ZZB 收敛到相应 ECRB，当 SNR 大于渐近阈值时，$\mathrm{ZZB}(z_t)$ 与 $\mathrm{ZZB}(t_z)$ 也线性依赖于 $l_s^{-1}$。此外，图 8 还表明：当 $l_s=0.02$ m、0.1 m、0.5 m、2.5 m 时，渐近阈值分别约为 47 dB、40 dB、33 dB、26 dB，先验阈值分别约为 27 dB、20 dB、13 dB、6 dB。因此，$l_s$ 影响渐近阈值与先验阈值的取值，且这一影响与 SNR 的影响相同：具体地，$l_s$ 或 SNR 越大，渐近阈值与先验阈值越小。事实上，由式（48）的结果可知，渐近阈值出现在 $\mathrm{SNR}\,l_s\approx10^3$ m 处，先验阈值出现在 $\mathrm{SNR}\,l_s\approx10$ m 处。

5) **$z_t$ 先验区域参数 $H_1$ 与 $H_2$ 的影响：** 图 9a 与图 9b 给出当 $t_z\sim\mathcal U[0,1)$、$\mathrm{SNR}=40$ dB、$\lambda=0.01$ m、$l_s=0.5$ m，且 $z_t$ 取五种不同先验分布（$z_t\sim\mathcal U[4\ \mathrm m,5\ \mathrm m]$、$\mathcal U[4\ \mathrm m,7\ \mathrm m]$、$\mathcal U[4\ \mathrm m,10\ \mathrm m]$、$\mathcal U[6\ \mathrm m,7\ \mathrm m]$、$\mathcal U[9\ \mathrm m,10\ \mathrm m]$）时 ECRB 随长边长度 $D_r$ 的变化。可以观察到，固定 $H_1$ 时，ECRB$(z_t)$ 与 ECRB$(t_z)$ 都随 $H_t$ 增大而变大，说明增大位置参数 $z_t$ 的先验区域范围会降低联合估计精度。此外，固定 $H_t$ 时，ECRB$(z_t)$ 与 ECRB$(t_z)$ 都随 $z_t$ 先验均值的增大而变大，揭示出位置参数 $z_t$ 增大同样会降低精度。

6) **联合估计与仅姿态估计：** 图 10 给出当 $z_t\sim\mathcal U[3\ \mathrm m,4\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$\lambda=0.1$ m、$D_r=5$ m 或 $D_r\to\infty$、$l_s=0.5$ m 或 $2.5$ m 时，联合估计与仅姿态估计的 ECRB 与 ZZB 随 SNR 的变化。可以观察到，ECRB$(t_z)$ 与 ECRB$_{\mathrm{AO}}(t_z)$ 的取值一致，无可见差异。原因在于式（65）与（66）中的 $\mathcal I_{zz}$ 与 $\mathcal I_{tt}$ 远大于 $\mathcal I_{zt}$，使 FIM 近似为对角矩阵。此外，我们发现 $\mathrm{ZZB}_{\mathrm{AO}}(t_z)$ 小于 $\mathrm{ZZB}(t_z)$，且二者差异小到可以忽略。值得一提的是，假设 3 使我们能够聚焦仅姿态估计的原始结构而不受 $z_t$ 确定性取值的干扰；我们已在推论 5 中证明 $\mathrm{ZZB}_{\mathrm{AO}}(t_z)$ 与 $\mathrm{ECRB}_{\mathrm{AO}}(t_z)$ 分别是 $\mathrm{ZZB}(t_z)$ 与 $\mathrm{ECRB}(t_z)$ 的可达下界。图 10 的结果表明，式（59）、（60）、（61）推导的 $\mathrm{ZZB}_{\mathrm{AO}}(t_z)$ 与式（74）、（75）、（108）推导的 $\mathrm{ECRB}_{\mathrm{AO}}(t_z)$ 可分别用作 $\mathrm{ZZB}(t_z)$ 与 $\mathrm{ECRB}(t_z)$ 的闭式近似。

## VI. 结论

本文建立了电磁传播模型（EPM），以准确刻画观测信号对 UE 位置与姿态参数的函数依赖。我们提出了基于 EPM 联合估计 UE 位置与姿态的高效方法。具体地，从无噪声情形出发，我们提出相位模糊距离与间距约束距离，把 UE 距离域细分为三个区域，并给出各区域位置与姿态参数的闭式解。为阐明噪声对联合估计性能的影响，我们首次推导了联合估计的 ZZB；进一步给出 ECRB 的闭式表达式以作比较。我们揭示出：所推导的 ZZB 在低与中等 SNR 区间比 ECRB 更紧，并在高 SNR 区间收敛于 ECRB。此外，我们发现当 SNR 足够大时，位置估计可达到毫米级精度，姿态估计可达到 0.1 量级精度。不同系统配置对性能的影响已通过数值研究加以展示。

我们以若干有趣的方向结束本文，以启发未来研究。首先，为满足各类实时感知应用的需求，进一步研究能够逼近所推导 ZZB 与 CRB 的近场定位与姿态感知低复杂度算法十分必要。其次，尽管电磁信号与感知算法可以在通用数值计算平台上用符合电磁学的模型进行仿真与验证，但对该技术的真正信心来自真实世界的试验平台与测量。本文建立了稳健的理论基础并提供了清晰的评估基线，为后续必要的真实世界测试与验证奠定了基础。第三，就近场边界而言，Fraunhofer 距离通过令相位差不大于 $\pi/8$ 确立了 UPW 与 SWM 之间的边界；鉴于 EPM 的精度与复杂度，为满足高精度、低复杂度感知的需求，建立 EPM 与 SWM 之间的边界是必要的。最后，在多个领域中实施与改进近场定位与姿态感知技术值得进一步研究，包括智能家居与工厂等 IoT 环境、智能停车与路障检测等自动驾驶系统，以及移动通信中感知辅助的通信。

## 图注与表注

**图 1（原文第 1 页）：** 远场 UPW、近场 SWM 与近场 EPM 的示意。图 1a 以二维视图给出远场 UPW 与近场 SWM，其中由球面波前到平面波前的近似过渡过程因版面所限被截断；图 1b 给出基于三维电磁传播理论的近场 EPM，其中 UE 作为偶极子示例。图中标注了 UPW、SWM、SWM 截断、来自远场源的波射线与来自近场源的波射线、接收阵列，以及 EPM 中的电场、磁场、UE 与传播过程。

**图 2（原文第 3 页）：** 位置与姿态联合估计系统示意。图中给出源区 $\mathcal R_t$ 内的偶极子 UE（位置 $\mathbf p_t$、朝向 $\hat{\mathbf t}$）、观测区域 $\mathcal R_r$（长边 $D_r$、短边 $l_s$）与观测点 $\mathbf p_r$，以及 OXYZ、PX′Y′Z′ 坐标系和球坐标 $(r,\theta,\varphi)$。

**图 3（原文第 6 页）：** RERR 随归一化 $z_t$ 的变化。不失一般性，取 $\lambda=0.01$ m、$x_r=0$ m、$y_r=10\lambda$，$t_z=\sqrt{0.1}$、$\sqrt{0.5}$ 或 $\sqrt{0.9}$。图中比较了 NF-EM 信道（相对误差约 $10^{-4}$ 并随收发距离增大而减小）与 AF-EM、NU-SW、U-SW 三种信道（误差在各距离上相对较大且不随距离无限减小）。

**图 4（原文第 7 页）：** UE 距离域划分示意。其中 $\mathrm p_{t1}$ 位于 Fraunhofer 距离 $d_F$ 定义的近场边界处，$\mathrm p_{t2}$ 位于相位模糊距离 $d_{\mathrm{PA}}$ 定义的边界处，$\mathrm p_{t3}$ 位于间距约束距离 $d_{\mathrm{SC}}$ 定义的边界处。

**图 5（原文第 12 页）：** 联合估计 $z_t$ 与 $t_z$ 的 MSE 随 SNR 的变化，取 $z_t\sim\mathcal U[3\ \mathrm m,5\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$\lambda=0.1$ m、$D_r=5$ m、$l_s=0.1$ m。其中 $\mathrm{ZZB}(z_t)$ 与 $\mathrm{ZZB}(t_z)$ 按式（51）、（52）计算，ECRB$(z_t)$ 与 ECRB$(t_z)$ 按式（65）、（66）计算，MAP$(z_t)$ 与 MAP$(t_z)$ 由 Monte Carlo 仿真得到；图中标注了先验阈值 20 dB 与渐近阈值 40 dB。

**图 6（原文第 13 页）：** 联合估计 $z_t$ 与 $t_z$ 的 ECRB 与 ZZB 随长边长度 $D_r$ 的变化，取 $z_t\sim\mathcal U[4\ \mathrm m,8\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$\lambda=0.1$ m、$l_s=0.1$ m，SNR 取 30 dB、40 dB、50 dB。

**图 7（原文第 13 页）：** 联合估计 $z_t$ 与 $t_z$ 的 ECRB 与 ZZB 随 SNR 的变化，取 $z_t\sim\mathcal U[5\ \mathrm m,6\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$D_r=5$ m、$l_s=0.1$ m，载频取 $f=3$ GHz、30 GHz、300 GHz（即 $\lambda=0.1$ m、0.01 m、0.001 m）三种。

**图 8（原文第 13 页）：** 联合估计 $z_t$ 与 $t_z$ 的 ECRB 与 ZZB 随 SNR 的变化，取 $z_t\sim\mathcal U[5\ \mathrm m,6\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$D_r=5$ m、$\lambda=0.01$ m，短边长度取 $l_s=0.02$ m、0.1 m、0.5 m、2.5 m 四种。

**图 9（原文第 14 页）：** 联合估计 $z_t$ 与 $t_z$ 的 ECRB 随长边长度 $D_r$ 的变化，取 $t_z\sim\mathcal U[0,1)$、$\mathrm{SNR}=40$ dB、$\lambda=0.01$ m、$l_s=0.5$ m，$z_t$ 取五种不同先验分布：$\mathcal U[4\ \mathrm m,5\ \mathrm m]$、$\mathcal U[4\ \mathrm m,7\ \mathrm m]$、$\mathcal U[4\ \mathrm m,10\ \mathrm m]$、$\mathcal U[6\ \mathrm m,7\ \mathrm m]$、$\mathcal U[9\ \mathrm m,10\ \mathrm m]$。(a) ECRB$(z_t)$ 随 $D_r$ 的变化；(b) ECRB$(t_z)$ 随 $D_r$ 的变化。

**图 10（原文第 14 页）：** 联合估计与仅姿态估计的 ECRB、ZZB 随 SNR 的变化，取 $z_t\sim\mathcal U[3\ \mathrm m,4\ \mathrm m]$、$t_z\sim\mathcal U[0,1)$、$\lambda=0.1$ m、$D_r=5$ m 或 $D_r\to\infty$、$l_s=0.5$ m 或 $2.5$ m。$\mathrm{ZZB}_{\mathrm{AO}}(t_z)$ 按式（59）、（60）、（61）计算，$\mathrm{ECRB}_{\mathrm{AO}}(t_z)$ 按式（74）、（75）、（108）计算。

**图 11（原文第 15 页）：** 讨论 1 所介绍的一般系统示意。UE 位于 $\mathcal R_r$ 前方任意点 $\mathbf p_{\mathrm{ar}}=(x_t,y_t,z_t)^T$；同时 UE 具有一般空间朝向 $\hat{\mathbf t}=t_x\hat{\mathbf x}+t_y\hat{\mathbf y}+t_z\hat{\mathbf z}$，其端点位于单位球壳 $\mathcal S_u$ 表面上。UE 的电流分布记为 $\mathbf J(\mathbf p_{\mathrm{ar}})$。与图 2 相同，以 $\mathbf p_{\mathrm{ar}}$ 为原点建立 PX′Y′Z′ 系，它与 OXYZ 系之间是纯平移关系；随后以 PX′Y′Z′ 系建立点 $\mathbf p_{\mathrm{ar}}$ 的球坐标系 $(r_{\mathrm{ar}},\theta,\varphi)$，其中 $\hat{\mathbf r}_{\mathrm{ar}}=\frac{\mathbf r_{\mathrm{ar}}}{\|\mathbf r_{\mathrm{ar}}\|}=\frac{\mathbf p_r-\mathbf p_{\mathrm{ar}}}{\|\mathbf p_r-\mathbf p_{\mathrm{ar}}\|}$。

**表注汇总：** 表 I 为不同信道模型下可获得的参数（原文第 2 页）；表 II 为 $\alpha=1$、$\beta=N/2$ 时闭式解的精度（原文第 12 页），本页按三个情形拆为表 II(a)—(c)，逐格内容与原表一致。

## 附录

### A. 式（20）的证明

一般系统的描述见讨论 1 与图 11。由于 $\hat{\mathbf t}$ 存在三个分量，把式（11）—（13）改写为

$$
e_x(\mathbf r_{\mathrm{ar}})=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{\Gamma_1t_x+\Gamma_2t_y+\Gamma_3t_z}{\|\mathbf r_{\mathrm{ar}}\|}e^{\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|},\tag{78}
$$

$$
e_y(\mathbf r_{\mathrm{ar}})=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{\Gamma_2t_x+\Gamma_4t_y+\Gamma_5t_z}{\|\mathbf r_{\mathrm{ar}}\|}e^{\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|},\tag{79}
$$

$$
e_z(\mathbf r_{\mathrm{ar}})=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{\Gamma_3t_x+\Gamma_5t_y+\Gamma_6t_z}{\|\mathbf r_{\mathrm{ar}}\|}e^{\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|},\tag{80}
$$

其中 $\Gamma_1\triangleq1-\sin^2\theta\cos^2\varphi$、$\Gamma_2\triangleq-\sin\theta\cos\theta\cos\varphi$、$\Gamma_3\triangleq\sin^2\theta\sin\varphi\cos\varphi$、$\Gamma_4\triangleq1-\cos^2\theta$、$\Gamma_5\triangleq\sin\theta\cos\theta\sin\varphi$、$\Gamma_6\triangleq1-\sin^2\theta\sin^2\varphi$。由于 $\|\mathbf r_{\mathrm{ar}}\|=\sqrt{x_{r,t}^2+y_{r,t}^2+z_t^2}$、$\cos\theta=\frac{y_{r,t}}{\|\mathbf r_{\mathrm{ar}}\|}$、$\tan\varphi=\frac{z_t}{x_{r,t}}$、$x_{r,t}\triangleq x_r-x_t$、$y_{r,t}\triangleq y_r-y_t$，有 $\Gamma_1=1-\frac{x_{r,t}^2}{\|\mathbf r_{\mathrm{ar}}\|^2}$、$\Gamma_2=-\frac{x_{r,t}y_{r,t}}{\|\mathbf r_{\mathrm{ar}}\|^2}$、$\Gamma_3=\frac{x_{r,t}z_t}{\|\mathbf r_{\mathrm{ar}}\|^2}$、$\Gamma_4=1-\frac{y_{r,t}^2}{\|\mathbf r_{\mathrm{ar}}\|^2}$、$\Gamma_5=\frac{y_{r,t}z_t}{\|\mathbf r_{\mathrm{ar}}\|^2}$、$\Gamma_6=1-\frac{z_t^2}{\|\mathbf r_{\mathrm{ar}}\|^2}$。把上述换算代入式（78）—（80），得到 $e_x(\mathbf r_{\mathrm{ar}})$、$e_y(\mathbf r_{\mathrm{ar}})$、$e_z(\mathbf r_{\mathrm{ar}})$ 关于未知的位置与姿态参数 $\xi_{\mathrm{ar}}$ 的显式表达式：

$$
e_x(\mathbf r_{\mathrm{ar}})=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{\left(y_{r,t}^2+z_t^2\right)t_x-x_{r,t}y_{r,t}t_y+x_{r,t}z_tt_z}{\|\mathbf r_{\mathrm{ar}}\|^3}e^{-\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|},\tag{81}
$$

$$
e_y(\mathbf r_{\mathrm{ar}})=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{-x_{r,t}y_{r,t}t_x+\left(x_{r,t}^2+z_t^2\right)t_y+y_{r,t}z_tt_z}{\|\mathbf r_{\mathrm{ar}}\|^3}e^{-\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|},\tag{82}
$$

$$
e_z(\mathbf r_{\mathrm{ar}})=\mathrm{j}\mathcal E_{\mathrm{in}}\frac{x_{r,t}z_tt_x+y_{r,t}z_tt_y+\left(x_{r,t}^2+y_{r,t}^2\right)t_z}{\|\mathbf r_{\mathrm{ar}}\|^3}e^{-\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|}.\tag{83}
$$

> **原文疑点：** 式（78）—（80）与正文式（11）—（16）的相位因子均为 $e^{+\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|}$，而由式（78）—（80）直接代入 $\Gamma_1$—$\Gamma_6$ 得到的式（81）—（83）在原文中被印为 $e^{-\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|}$（负号）。据推导，式（81）—（83）应与式（78）—（80）同号；此处按原文照录减号并加注，未静默改动。

随后，把式（81）—（83）代入

$$
h_{\mathrm{ar}}(\xi_{\mathrm{ar}};\mathbf p_r)=\frac{e^{\mathrm{j}k\|\mathbf r_{\mathrm{ar}}\|}}{\mathcal E_{\mathrm{in}}}\sqrt{\sum_{\tilde\epsilon\in\{x,y,z\}}\left|e_{\tilde\epsilon}(\mathbf r_{\mathrm{ar}})\right|^2\left(-\hat{\mathbf r}_{\mathrm{ar}}\cdot\hat{\mathbf z}\right)}\tag{84}
$$

即得式（20）。至此，我们给出了通用的信道模型。

### B. $h_{\mathrm{SIM}}(\xi;x_r,y_r)$ 的计算过程

把式（3）代入式（2），EM-SIMP 信道的向量电场 $\mathbf e^{\mathrm{SIM}}(\mathbf r)$ 可推导为

$$
\mathbf e^{\mathrm{SIM}}(\mathbf r)=\left(1+\mathrm{j}\frac{3}{kr}-\frac{3}{k^2r^2}\right)\mathbf e(\mathbf r)
=\underbrace{G_s(\mathbf r)\mathbf J^{\perp}_{\mathcal R_t}}_{\text{传播分量}}+\underbrace{\left(\mathrm{j}\frac{3}{kr}-\frac{3}{k^2r^2}\right)G_s(\mathbf r)\mathbf J^{\perp}_{\mathcal R_t}}_{\text{非传播分量}}.\tag{85}
$$

可以观察到，$\mathbf e^{\mathrm{SIM}}(\mathbf r)$ 包含一个功率按 $r^{-2}$ 衰减的传播分量，以及两个功率分别按 $r^{-4}$ 与 $r^{-6}$ 衰减的非传播分量。把式（85）代入式（17），EM-SIMP 信道的标量电场 $e_s^{\mathrm{SIM}}(\mathbf r)$ 可推导为

$$
e_s^{\mathrm{SIM}}(\mathbf r)=\left|1+\mathrm{j}\frac{3}{kr}-\frac{3}{k^2r^2}\right|\frac{\sqrt{z_t}}{r}\|\mathbf e(\mathbf r)\|e^{\mathrm{j}kr}
=\mathcal E_{\mathrm{in}}\sqrt{1+\frac{3}{k^2r^2}+\frac{9}{k^4r^4}}\,h(\xi;x_r,y_r),\tag{86}
$$

其中 $h_{\mathrm{SIM}}(\xi;x_r,y_r)\triangleq\sqrt{1+\frac{3}{k^2r^2}+\frac{9}{k^4r^4}}\,h(\xi;x_r,y_r)$ 即 EM-SIMP 信道。

### C. 引理 2 的证明

与 MAP 准则相关的最小错误概率可表示为

$$
P_{\min}(\vartheta,\vartheta+\delta)=\Pr\{H_0\}\Pr\left\{\mathcal L_\xi\le\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}\,\middle|\,\xi=\vartheta\right\}
+\Pr\{H_1\}\Pr\left\{\mathcal L_\xi>\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}\,\middle|\,\xi=\vartheta+\delta\right\},$$

$$
\triangleq\Pr\{H_0\}\Pr\left\{\mathcal L_\vartheta\le\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}\right\}
+\Pr\{H_1\}\Pr\left\{\mathcal L_{\vartheta+\delta}>\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}\right\},\tag{87}
$$

其中 $\mathcal L_\xi$ 为对数似然比（LLR）检验，给出为

$$
\mathcal L_\xi=\ln\frac{f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\vartheta)}{f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\vartheta+\delta)}=\Lambda(\vartheta|\tilde{\mathbf v})-\Lambda(\vartheta+\delta|\tilde{\mathbf v}),\tag{88}
$$

且 $\Lambda(\vartheta|\tilde{\mathbf v})\triangleq\Lambda(\xi|\tilde{\mathbf v})|_{\xi=\vartheta}$，$\Lambda(\xi|\tilde{\mathbf v})$ 表示式（40）的对数似然函数。具体地，给定向量 $\xi$ 时，观测向量 $\tilde{\mathbf v}$ 服从复高斯分布 $\mathcal{CN}(\bar{\mathbf v}|_\xi,\mathbf C_{\tilde{\mathbf v}})$，均值向量 $\bar{\mathbf v}|_\xi=\mathcal E_{\mathrm{in}}l_s\mathbf h_y(\xi)$，协方差矩阵 $\mathbf C_{\tilde{\mathbf v}}=\mathbb E_{\tilde{\mathbf v}|\xi}\{(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)^\dagger\}=\sigma^2\mathbf I_N$。因此，给定向量 $\xi$ 时观测向量 $\tilde{\mathbf v}$ 的条件 PDF 为

$$
f_{\tilde{\mathbf v}|\xi}(\tilde{\mathbf v}|\xi)=\frac{1}{\pi^N\det\{\mathbf C_{\tilde{\mathbf v}}\}}e^{-(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)^\dagger\mathbf C_{\tilde{\mathbf v}}^{-1}(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)},\tag{89}
$$

其中 $\det\{\cdot\}$ 表示矩阵行列式。于是，对给定观测向量 $\tilde{\mathbf v}$，对数似然函数为

$$
\Lambda(\xi|\tilde{\mathbf v})=-\frac{1}{\sigma^2}\sum_{n_y=1}^{N}\left|\tilde v_{n_y}-\mathcal E_{\mathrm{in}}l_sh_y\left(\xi;y_{r;n_y}\right)\right|^2.\tag{90}
$$

把式（90）代入式（88），可进一步计算 $\mathcal L_\xi$ 为

$$
\mathcal L_\xi=\frac{\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^2}\left[\left\|\mathbf h_y(\vartheta+\delta)\right\|^2-\left\|\mathbf h_y(\vartheta)\right\|^2\right]
-\frac{2\mathcal E_{\mathrm{in}}l_s}{\sigma^2}\Re\left\{\tilde{\mathbf v}^\dagger\mathbf h_y(\vartheta+\delta)-\tilde{\mathbf v}^\dagger\mathbf h_y(\vartheta)\right\},\tag{91}
$$

其中 $\mathbf h_y(\vartheta)\triangleq\mathbf h_y(\xi)|_{\xi=\vartheta}$，$\tilde{\mathbf v}$ 与 $\mathbf h_y(\xi)$ 由式（40）给出。

由式（91）容易发现，$\mathcal L_\xi$ 通过 $\tilde{\mathbf v}$ 成为未知参数向量 $\xi$ 的函数。为获得式（87）中条件概率的表达式，需要求出 $\mathcal L_\vartheta$ 与 $\mathcal L_{\vartheta+\delta}$ 的分布。给定 $\xi=\vartheta$，我们在式（92）中推导 $\mathcal L_\vartheta$。

$$
\mathcal L_\vartheta=\frac{\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^2}\underbrace{\left\{\left\|\mathbf h_y(\vartheta+\delta)\right\|^2+\left\|\mathbf h_y(\vartheta)\right\|^2-2\Re\left\{\mathbf h_y^\dagger(\vartheta)\mathbf h_y(\vartheta+\delta)\right\}\right\}}_{\mu_{\mathcal L_\vartheta}}
+\underbrace{\frac{2\mathcal E_{\mathrm{in}}l_s}{\sigma^2}\Re\left\{\mathbf n^\dagger\left[\mathbf h_y(\vartheta)-\mathbf h_y(\vartheta+\delta)\right]\right\}}_{\text{由 }\mathbf n\text{ 引起的随机项}}.\tag{92}
$$

显然，由于 $\mathcal L_\vartheta$ 中唯一的随机变量是高斯噪声向量 $\mathbf n$，$\mathcal L_\vartheta$ 服从高斯分布 $\mathcal N(\mu_{\mathcal L_\vartheta},\sigma^2_{\mathcal L_\vartheta})$，其中 $\mu_{\mathcal L_\vartheta}$ 与 $\sigma^2_{\mathcal L_\vartheta}$ 分别由式（93）与（94）给出。

$$
\mu_{\mathcal L_\vartheta}=\frac{\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^2}\sum_{n_y=1}^{N}\left\{\left|h_y\left(\vartheta+\delta;y_{r;n_y}\right)\right|^2+\left|h_y\left(\vartheta;y_{r;n_y}\right)\right|^2-2\Re\left\{h_y^{*}\left(\vartheta;y_{r;n_y}\right)h_y\left(\vartheta+\delta;y_{r;n_y}\right)\right\}\right\}
$$

$$
\overset{(g)}{\simeq}\frac{\mathcal E_{\mathrm{in}}^2l_s}{\sigma^2}\int_0^{D_r}\left|h_y(\vartheta+\delta;y_r)\right|^2+\left|h_y(\vartheta;y_r)\right|^2-2\left|h_y(\vartheta+\delta;y_r)\right|\left|h_y(\vartheta;y_r)\right|\cos\left[k\left(r_{ry}|_{z_t=\vartheta_z+\delta_z}-r_{ry}|_{z_t=\vartheta_z}\right)\right]\mathrm dy_r,\tag{93}
$$

$$
\sigma^2_{\mathcal L_\vartheta}=\frac{4\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^4}\mathbb V_{\mathbf n}\left\{\Re\left\{\mathbf n^\dagger\left[\mathbf h_y(\vartheta)-\mathbf h_y(\vartheta+\delta)\right]\right\}\right\}
=\frac{2\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^2}\left[\mathbf h_y(\vartheta)-\mathbf h_y(\vartheta+\delta)\right]^\dagger\left[\mathbf h_y(\vartheta)-\mathbf h_y(\vartheta+\delta)\right]
=2\mu_{\mathcal L_\vartheta}.\tag{94}
$$

在式（93）的 $(g)$ 中，我们利用 Riemann 积分方法把求和近似为积分；若 Y 轴上每个连续点都能独立观测电压，则 $(g)$ 取等号。此外，我们利用 Euler 公式消去取实部运算 $\Re\{\cdot\}$，其中记 $\vartheta\triangleq(\vartheta_z,\vartheta_t)^T$、$\delta\triangleq(\delta_z,\delta_t)^T$。因此有 $\mathcal L_\vartheta\sim\mathcal N(\mu_{\mathcal L_\vartheta},2\mu_{\mathcal L_\vartheta})$。类似地，给定 $\xi=\vartheta+\delta$，则 $\mathcal L_{\vartheta+\delta}=-\mu_{\mathcal L_\vartheta}-\frac{2\mathcal E_{\mathrm{in}}l_s}{\sigma^2}\Re\{\mathbf n^\dagger[\mathbf h_y(\vartheta+\delta)-\mathbf h_y(\vartheta)]\}$ 服从 $\mathcal L_{\vartheta+\delta}\sim\mathcal N(-\mu_{\mathcal L_\vartheta},2\mu_{\mathcal L_\vartheta})$。于是式（87）中的概率可由下式得到：

$$
\Pr\left\{\mathcal L_\vartheta\le\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}\right\}=Q\left(\frac{\mu_{\mathcal L_\vartheta}-\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}}{\sqrt{2\mu_{\mathcal L_\vartheta}}}\right),\tag{95}
$$

$$
\Pr\left\{\mathcal L_{\vartheta+\delta}>\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}\right\}=Q\left(\frac{\mu_{\mathcal L_\vartheta}+\ln\frac{\Pr\{H_1\}}{\Pr\{H_0\}}}{\sqrt{2\mu_{\mathcal L_\vartheta}}}\right),\tag{96}
$$

其中 $Q(x)=\frac{1}{\sqrt{2\pi}}\int_x^\infty e^{-\frac{v^2}{2}}\,\mathrm dv$ 为标准正态分布的尾部分布函数。把式（95）与（96）代入式（87）即得式（47）。因此引理 2 成立。证毕。

### D. 推论 2 的证明

对仅姿态估计，向量 $\vartheta$ 与 $\delta$ 退化为两个标量参数 $\vartheta_t$ 与 $\delta_t$，式（43）退化为

$$
\mathbb E\left\{|t_z-\hat t_z|^2\right\}\ge\frac12\int_0^1\int_0^{1-\delta_t}\left[f_{t_z}(\vartheta_t)+f_{t_z}(\vartheta_t+\delta_t)\right]\times P^{\mathrm{AO}}_{\min}(\vartheta_t,\vartheta_t+\delta_t)\,\mathrm d\vartheta_t\,\delta_t\,\mathrm d\delta_t.\tag{97}
$$

在假设 1 与假设 3 下，得到先验 PDF：

$$
f_{t_z}(\vartheta_t)=f_{t_z}(\vartheta_t+\delta_t)=1,\tag{98}
$$

以及对 $z_t$ 的确定取值条件下的最小错误概率：

$$
P^{\mathrm{AO}}_{\min}(\vartheta_t,\vartheta_t+\delta_t)=Q\left(\sqrt{\frac{\mu_{\mathcal L_{\vartheta_a}}}{2}}\right),\tag{99}
$$

其中 $\mu_{\mathcal L_{\vartheta_a}}$ 可通过把式（48）中 $\mu_{\mathcal L_\vartheta}$ 的 $\vartheta$ 与 $\delta$ 分别替换为 $(z_t,\vartheta_t)^T$ 与 $(0,\delta_t)^T$ 得到，即

$$
\mu_{\mathcal L_{\vartheta_a}}=\mathrm{SNR}\,l_sz_t\int_0^{D_r}\frac{\left(y_r\delta_t+z_t\vartheta_{\delta s}-z_t\vartheta_{ts}\right)^2}{\left(y_r^2+z_t^2\right)^{5/2}}\,\mathrm dy_r,\tag{100}
$$

其中 $\vartheta_{ts}\triangleq\sqrt{1-\vartheta_t^2}$、$\vartheta_{\delta s}\triangleq\sqrt{1-(\vartheta_t+\delta_t)^2}$。式（100）的被积函数不再包含余弦函数，因此可以给出式（60）中 $\mu_{\mathcal L_{\vartheta_a}}$ 的闭式表达式。通过对式（99）关于 $z_t$ 取期望，可得最小错误概率为

$$
P^{\mathrm{AO}}_{\min}(\vartheta_t,\vartheta_t+\delta_t)=\mathbb E_{z_t}\left\{Q\left(\sqrt{\frac{\mu_{\mathcal L_{\vartheta_a}}}{2}}\right)\right\}.\tag{101}
$$

把式（98）与（101）代入式（97）即得式（59）。证毕。

### E. 引理 3 的证明

证明可基于 [34] 完成；我们主要给出 $\mathbf F(\xi)$ 的推导。对式（90）中的对数似然函数求一次导数，得

$$
\frac{\partial\ln\Lambda(\xi|\tilde{\mathbf v})}{\partial\xi_\imath}=\frac{2\mathcal E_{\mathrm{in}}l_s}{\sigma^2}\Re\left\{\left[\tilde{\mathbf v}-\mathcal E_{\mathrm{in}}l_s\mathbf h_y(\xi)\right]^\dagger\frac{\partial\mathbf h_y(\xi)}{\partial\xi_\imath}\right\},\tag{102}
$$

其中所需的正则条件 $\mathbb E_{\tilde{\mathbf v}|\xi}\left\{\frac{\partial\ln\Lambda(\xi|\tilde{\mathbf v})}{\partial\xi_\imath}\right\}=0$ 因 $\mathbb E_{\tilde{\mathbf v}|\xi}\{\tilde{\mathbf v}\}=\mathcal E_{\mathrm{in}}l_s\mathbf h_y(\xi)$ 而满足。然后，我们计算 $\mathbf F(\xi)$ 的第 $\imath$ 行第 $j$ 列元素为

$$
[\mathbf F(\xi)]_{\imath j}=\mathbb E_{\tilde{\mathbf v}|\xi}\left\{\frac{\partial\ln\Lambda(\xi|\tilde{\mathbf v})}{\partial\xi_\imath}\frac{\partial\ln\Lambda(\xi|\tilde{\mathbf v})}{\partial\xi_j}\right\}
\overset{(h)}{=}\frac{\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^4}\left[\frac{\partial\mathbf h_y^\dagger(\xi)}{\partial\xi_\imath}\mathbf C_{\tilde{\mathbf v}}\frac{\partial\mathbf h_y(\xi)}{\partial\xi_j}+\frac{\partial\mathbf h_y^\dagger(\xi)}{\partial\xi_j}\mathbf C_{\tilde{\mathbf v}}\frac{\partial\mathbf h_y(\xi)}{\partial\xi_\imath}\right]
$$

$$
=\frac{2\mathcal E_{\mathrm{in}}^2l_s^2}{\sigma^2}\Re\left\{\sum_{n_y=1}^{N}\frac{\partial h_y^{*}\left(\xi;y_{r;n_y}\right)}{\partial\xi_\imath}\frac{\partial h_y\left(\xi;y_{r;n_y}\right)}{\partial\xi_j}\right\}
\overset{(i)}{\simeq}2\mathrm{SNR}\,l_s\int_0^{D_r}\Re\left\{\frac{\partial h_y^{*}(\xi;y_r)}{\partial\xi_\imath}\frac{\partial h_y(\xi;y_r)}{\partial\xi_j}\right\}\mathrm dy_r,\tag{103}
$$

其中 $(h)$ 由 $\mathbb E_{\tilde{\mathbf v}|\xi}\{(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)^T\}=\mathbf 0$ 与 $\mathbb E_{\tilde{\mathbf v}|\xi}\{(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)^{*}(\tilde{\mathbf v}-\bar{\mathbf v}|_\xi)^\dagger\}=\mathbf 0$ 得到；$(i)$ 中与式（93）的 $(g)$ 一样使用了 Riemann 积分方法。证毕。

### F. 命题 3 的证明

根据式（18）与引理 3，首先计算 FIM 中的一阶导数 $\partial h_y(\xi;y_r)/\partial\xi_\imath$、$\imath=1,2$：

$$
\frac{\partial h_y(\xi;y_r)}{\partial z_t}=\frac{t_zy_r\left(y_r^2-\ell_1\right)+t_yz_t\left(3y_r^2-\ell_2\right)}{2z_t^{1/2}r_{ry}^{9/2}}e^{\mathrm{j}kr_{ry}},\tag{104}
$$

$$
\frac{\partial h_y(\xi;y_r)}{\partial t_z}=\frac{y_r-z_tt_z/t_y}{z_t^{-1/2}r_{ry}^{5/2}}e^{\mathrm{j}kr_{ry}},\tag{105}
$$

其中 $\ell_1\triangleq2z_t^2\left(2-\mathrm{j}kr_{ry}\right)$、$\ell_2\triangleq2z_t^2\left(1-\mathrm{j}kr_{ry}\right)$、$t_y\triangleq\sqrt{1-t_z^2}$。把式（104）与（105）代入式（103），可得 FIM 为 $F_{zz}\triangleq[\mathbf F(\xi)]_{11}=2\mathrm{SNR}\,l_s\left(\mathcal I_{zz1}+k^2\mathcal I_{zz2}\right)$、$F_{tt}\triangleq[\mathbf F(\xi)]_{22}=2\mathrm{SNR}\,l_s\mathcal I_{tt}$、$F_{zt}\triangleq[\mathbf F(\xi)]_{12}=2\mathrm{SNR}\,l_s\mathcal I_{zt}$，其中 $\mathcal I_{zz1}$、$\mathcal I_{zz2}$、$\mathcal I_{tt}$、$\mathcal I_{zt}$ 由式（67）—（70）给出。定义 $\tau\triangleq D_r/z_t$ 后，式（67）—（70）的闭式表达式可推导如下：

$$
\mathcal I_{zz1}=\frac{1}{z_t^3}\left(t_zt_y\mathcal F_{\tau1}+t_z^2\mathcal F_{\tau2}+t_y^2\mathcal F_{\tau3}\right),\tag{106}
$$

$$
\mathcal I_{zz2}=\frac{1}{z_t}\left(t_zt_y\mathcal F_{\tau4}+t_z^2\mathcal F_{\tau5}+t_y^2\mathcal F_{\tau6}\right),\tag{107}
$$

$$
\mathcal I_{tt}=\frac{1}{z_t}\left(\frac{t_z^2}{t_y^2}\mathcal F_{\tau7}+\frac{t_z}{t_y}\mathcal F_{\tau8}+\frac{1}{t_y^2}\mathcal F_{\tau9}\right),\tag{108}
$$

$$
\mathcal I_{zt}=\frac{1}{z_t^2}\left(\frac{t_z^2}{t_y}\mathcal F_{\tau10}+t_z\mathcal F_{\tau11}+t_y\mathcal F_{\tau12}\right),\tag{109}
$$

其中

$$
\begin{aligned}
&\mathcal F_{\tau1}\triangleq\frac{2\tau^8+8\tau^6+12\tau^4+8\tau^2+2}{7\left(\tau^2+1\right)^4}-\frac{7\tau^4-14\tau^2+4}{14\left(\tau^2+1\right)^{7/2}}, &
\mathcal F_{\tau2}\triangleq\frac{19\tau^7+56\tau^5+112\tau^3}{84\left(\tau^2+1\right)^{7/2}},\\
&\mathcal F_{\tau3}\triangleq\frac{10\tau^7+35\tau^5+28\tau^3+28\tau}{28\left(\tau^2+1\right)^{7/2}}, &
\mathcal F_{\tau4}\triangleq\frac25-\frac{2}{5\left(\tau^2+1\right)^{5/2}},\\
&\mathcal F_{\tau5}\triangleq\frac{\tau^3\left(2\tau^2+5\right)}{15\left(\tau^2+1\right)^{5/2}}, &
\mathcal F_{\tau6}\triangleq\frac{8\tau^5+20\tau^3+15\tau}{15\left(\tau^2+1\right)^{5/2}},\\
&\mathcal F_{\tau7}\triangleq\frac{\tau^3+3\tau}{3\left(\tau^2+1\right)^{3/2}}, &
\mathcal F_{\tau8}\triangleq\frac{2}{3\left(\tau^2+1\right)^{3/2}}-\frac23,\qquad
\mathcal F_{\tau9}\triangleq\frac{\tau^3}{3\left(\tau^2+1\right)^{3/2}},\\
&\mathcal F_{\tau10}\triangleq\frac{\tau^2-2}{6\left(\tau^2+1\right)^{5/2}}+\frac{\tau^4+2\tau^2+1}{3\left(\tau^2+1\right)^2}, &
\mathcal F_{\tau11}\triangleq\frac{\tau^5+\tau^3+6\tau}{6\left(\tau^2+1\right)^{5/2}},\qquad
\mathcal F_{\tau12}\triangleq\frac{-\tau^2}{2\left(\tau^2+1\right)^{5/2}}.
\end{aligned}
$$

随后应用矩阵求逆引理，得到 $\mathbf F(\xi)$ 的逆 $\mathbf F^{-1}(\xi)$。对 $\mathbf F^{-1}(\xi)$ 关于 $\xi$ 取期望即得式（65）与（66），从而完成命题 3 的证明。证毕。

### G. 推论 3 的证明

当 $D_r\to\infty$ 且 $t_z\to0$ 时，式（67）—（70）退化为

$$
\mathcal I_{zz1}=\frac{z_t}{4}\int_0^\infty\frac{\left(3y_r^2-2z_t^2\right)^2}{\left(y_r^2+z_t^2\right)^{9/2}}\,\mathrm dy_r=\frac{5}{14z_t^3},\tag{110}
$$

$$
\mathcal I_{zz2}=z_t^5\int_0^\infty\frac{1}{\left(y_r^2+z_t^2\right)^{7/2}}\,\mathrm dy_r=\frac{8}{15z_t},\tag{111}
$$

$$
\mathcal I_{tt}=z_t\int_0^\infty\frac{y_r^2}{\left(y_r^2+z_t^2\right)^{5/2}}\,\mathrm dy_r=\frac{1}{3z_t},\tag{112}
$$

$$
\mathcal I_{zt}=\frac{z_t}{2}\int_0^\infty\frac{y_r\left(3y_r^2-2z_t^2\right)}{\left(y_r^2+z_t^2\right)^{7/2}}\,\mathrm dy_r=0.\tag{113}
$$

我们也可以使用式（106）—（109）的闭式表达式。具体地，当 $D_r\to\infty$（即 $\tau\to\infty$）且 $t_z\to0$ 时，式（106）—（109）退化为 $\mathcal I_{zz1}=\lim\frac{1}{z_t^3}\frac{10\tau^7+35\tau^5+28\tau^3+28\tau}{28(\tau^2+1)^{7/2}}=\frac{5}{14z_t^3}$、$\mathcal I_{zz2}=\lim\frac{1}{z_t}\frac{8\tau^5+20\tau^3+15\tau}{15(\tau^2+1)^{5/2}}=\frac{8}{15z_t}$、$\mathcal I_{tt}=\lim\frac{1}{z_t}\frac{\tau^3}{3(\tau^2+1)^{3/2}}=\frac{1}{3z_t}$、$\mathcal I_{zt}=\lim\frac{1}{z_t^2}\frac{-\tau^2}{2(\tau^2+1)^{5/2}}=0$，其中用 lim 代表 $\lim_{\tau\to\infty}$。把式（110）—（113）代入式（65）与（66）即得式（71）与（72）。若 $z_t\gg\lambda$，则 $k^2z_t^2\gg4\pi^2$。因此 $\frac{210z_t^3}{112k^2z_t^2+75}\approx\frac{15z_t}{8k^2}$，式（73）得证。证毕。

### H. 推论 5 的证明

式（66）可写为 $\mathrm{ECRB}(t_z)=\frac{\mathrm{SNR}^{-1}}{2l_s}\mathbb E_\xi\left\{\frac{1}{\mathcal I_{tt}-\mathcal I_{zz}^{-1}\mathcal I_{zt}^2}\right\}$，其中 $\mathcal I_{zz}^{-1}\mathcal I_{zt}^2\ge0$。故有 $\mathrm{ECRB}(t_z)\ge\mathrm{ECRB}_{\mathrm{AO}}(t_z)$。此外，由式（72）、（74）与（75）可知，当 $D_r\to\infty$ 且 $t_z\to0$ 时 $\mathrm{ECRB}(t_z)=\mathrm{ECRB}_{\mathrm{AO}}(t_z)=\frac{3\mathrm{SNR}^{-1}}{2l_s}\mathbb E_{z_t}\{z_t\}$，说明该下界可达。另一方面，式（52）与（59）可改写为 $\mathrm{ZZB}(t_z)=\int_0^1W_t\delta_t\,\mathrm d\delta_t$ 与 $\mathrm{ZZB}_{\mathrm{AO}}(t_z)=\int_0^1W_{\mathrm{AO};t}\delta_t\,\mathrm d\delta_t$，其中

$$
W_t\triangleq\frac{1}{H_t}\max_{\delta_z}\int_0^{1-\delta_t}\int_{H_1}^{H_2-\delta_z}Q\left(\sqrt{\frac{\mu_{\mathcal L_\vartheta}}{2}}\right)\mathrm d\vartheta_z\,\mathrm d\vartheta_t
$$

$$
\overset{(j)}{\ge}\frac{1}{H_t}\max_{\delta_z=0}\int_0^{1-\delta_t}\int_{H_1}^{H_2-\delta_z}Q\left(\sqrt{\frac{\mu_{\mathcal L_\vartheta}}{2}}\right)\mathrm d\vartheta_z\,\mathrm d\vartheta_t
=\frac{1}{H_t}\int_0^{1-\delta_t}\int_{H_1}^{H_2}Q\left(\sqrt{\frac{\mu_{\mathcal L_{\vartheta_a}}}{2}}\right)\mathrm dz_t\,\mathrm d\vartheta_t
$$

$$
\overset{(k)}{=}\int_0^{1-\delta_t}\mathbb E_{z_t}\left\{Q\left(\sqrt{\frac{\mu_{\mathcal L_{\vartheta_a}}}{2}}\right)\right\}\mathrm d\vartheta_t\triangleq W_{\mathrm{AO};t},\tag{114}
$$

其中 $(j)$ 中 $\delta_z=0$ 是最大值搜索集的一个特例，$(k)$ 是因为 $z_t$ 是 PDF 为 $\frac{1}{H_t}$ 的已知随机变量。于是 $\mathrm{ZZB}(t_z)\ge\mathrm{ZZB}_{\mathrm{AO}}(t_z)$ 得证。同时，由式（58）、（59）与（60）可知，当 $\mathrm{SNR}\to0$、或 $D_r\to0$、或 $\delta\to0$ 时 $\mathrm{ZZB}(t_z)=\mathrm{ZZB}_{\mathrm{AO}}(t_z)=\frac{1}{12}$，说明该下界可达。证毕。

## 原文脚注（译）

1. 远场区中，收发距离大于 Fraunhofer 距离 $d_F\triangleq2D^2/\lambda$ [8]，其中 $D$ 为接收阵列的最大几何尺寸，$\lambda$ 为波长。
2. 本文中"近场"指"辐射近场"，即收发距离小于 $d_F$、但大于 Fresnel 距离 $d_f=0.5\sqrt{D^3/\lambda}$ [20]。
3. 我们把 UE 视为偶极子，其位置定义为空间坐标，姿态建模为空间朝向。
4. 赫兹偶极子又称基本、理想或短偶极子，可视为 V 形偶极子、线天线、矩形环、双环以及蝶形天线等复杂电磁器件的基本组成部分。
5. 这是"CPL"情形（UE 位于 $(0,0,z_t)$），在经典近场定位工作（如 [13]、[22]、[31]、[32]）中经常讨论。
6. 我们模型的一个有趣扩展是考虑多径，此时障碍物或簇的电磁反射与散射特性需要进一步研究，留待未来工作。
7. 当 $r=\lambda$ 时，$\left|1+\mathrm{j}\frac{1}{kr}-\frac{1}{k^2r^2}\right|^2\approx0.975$，$\left|1+\mathrm{j}\frac{3}{kr}-\frac{3}{k^2r^2}\right|^2\approx1.082$。
8. 在 [34] 中，我们比较了使用式（14）—（16）形式的向量场与使用式（17）形式的标量场进行近场定位的性能，结果表明两类电场的性能差距可忽略；使用标量场可避免接收端向量场三个分量的复杂解耦。
9. 换言之，接收表面的有效面积是其物理区域在垂直于传播方向上的投影面积。
10. [39] 与 [40] 已验证：基于完整 Green 函数的信道与电磁仿真平台所用信道之间的相对误差小于 $10^{-3}$。
11. 使用两个阵元仅适用于无噪声情形，因为两个阵元足以求解方程组；对含噪情形（如第 IV 节所述），我们使用全部阵元对噪声取平均。
12. 另一种非联合估计是仅位置估计：此时姿态参数 $t_z$ 假设已知，未知参数为 $z_t$。仅位置估计在经典近场定位文献中经常讨论，例如 [13] 与 [28] 假设 UE 为质点，[31] 与 [34] 假设 $t_z=0$。因此本文只讨论仅姿态估计。
13. 由 Woodbury 恒等式有 $\mathbf B^{-1}=\mathbf F_{\mathrm O}^{-1}-\mathbf F_{\mathrm O}^{-1}\mathbf K^{-1}\mathbf F_{\mathrm O}^{-1}$，其中 $\mathbf K\triangleq\mathbf B_{\mathrm P}^{-1}+\mathbf F_{\mathrm O}^{-1}$。由于 $\mathbf F_{\mathrm O}$ 与 $\mathbf B_{\mathrm P}$ 正定，$\mathbf F_{\mathrm O}^{-1}\mathbf K^{-1}\mathbf F_{\mathrm O}^{-1}$ 也正定，故 $\mathrm{BCRB}(\xi_\imath)<[\mathbf F_{\mathrm O}^{-1}]_{\imath\imath}$；进一步由 Jensen 不等式得 $[\mathbf F_{\mathrm O}^{-1}]_{\imath\imath}<\mathrm{ECRB}(\xi_\imath)$。
14. 当 $z_t\gg\lambda$ 且 $D$ 不是很小时恒有 $z_t\ll2D^2/\lambda$，因此在观测区域 $\mathcal R_r$ 尺寸处于米量级的条件下，$z_t\gg\lambda$ 对应近场区。

## 参考文献（英文原书目）

[1] Z. Wang, Z. Liu, Y. Shen, A. Conti, and M. Z. Win, "Location awareness in beyond 5G networks via reconfigurable intelligent surfaces," IEEE Journal on Selected Areas in Communications, vol. 40, no. 7, pp. 2011–2025, 2022.
[2] Y. Yuan, W. Yi, R. Hoseinnezhad, and P. K. Varshney, "Robust power allocation for resource-aware multi-target tracking with colocated MIMO radars," IEEE Transactions on Signal Processing, vol. 69, pp. 443–458, 2021.
[3] M. Z. Win, F. Meyer, Z. Liu, W. Dai, S. Bartoletti, and A. Conti, "Efficient multisensor localization for the internet of things: Exploring a new class of scalable localization algorithms," IEEE Signal Processing Magazine, vol. 35, no. 5, pp. 153–167, 2018.
[4] V. Moreno, M. A. Zamora, and A. F. Skarmeta, "A low-cost indoor localization system for energy sustainability in smart buildings," IEEE Sensors Journal, vol. 16, no. 9, pp. 3246–3262, 2016.
[5] J. Cong, C. You, J. Li, L. Chen, B. Zheng, Y. Liu, W. Wu, Y. Gong, S. Jin, and R. Zhang, "Near-field integrated sensing and communication: Opportunities and challenges," arXiv preprint arXiv:2310.01342, 2023.
[6] Y. Xiong, F. Liu, Y. Cui, W. Yuan, T. X. Han, and G. Caire, "On the fundamental tradeoff of integrated sensing and communications under gaussian channels," IEEE Transactions on Information Theory, vol. 69, no. 9, pp. 5723–5751, 2023.
[7] H. Lu and Y. Zeng, "Communicating with extremely large-scale array/surface: Unified modelling and performance analysis," IEEE Transactions on Wireless Communications, 2021.
[8] J. Sherman, "Properties of focused apertures in the fresnel region," IRE Transactions on Antennas and Propagation, vol. 10, no. 4, pp. 399–408, 1962.
[9] M. Z. Win, A. Conti, S. Mazuelas, Y. Shen, W. M. Gifford, D. Dardari, and M. Chiani, "Network localization and navigation via cooperation," IEEE Communications Magazine, vol. 49, no. 5, pp. 56–62, 2011.
[10] B. Denis, J.-B. Pierrot, and C. Abou-Rjeily, "Joint distributed synchronization and positioning in UWB ad hoc networks using TOA," IEEE Transactions on Microwave Theory and Techniques, vol. 54, no. 4, pp. 1896–1911, 2006.
[11] O. L. A. López, D. Kumar, and A. Tölli, "Polarization diversity-enabled LOS/NLOS identification via carrier phase measurements," IEEE Transactions on Communications, vol. 71, no. 3, pp. 1678–1690, 2023.
[12] L. Chen, X. Zhou, F. Chen, L.-L. Yang, and R. Chen, "Carrier phase ranging for indoor positioning with 5G NR signals," IEEE Internet of Things Journal, vol. 9, no. 13, pp. 10 908–10 919, 2022.
[13] S. Hu, F. Rusek, and O. Edfors, "Beyond massive MIMO: The potential of positioning with large intelligent surfaces," IEEE Transactions on Signal Processing, vol. 66, no. 7, pp. 1761–1774, 2018.
[14] E. Björnson, L. Sanguinetti, H. Wymeersch, J. Hoydis, and T. L. Marzetta, "Massive MIMO is a reality—what is next?: Five promising research directions for antenna arrays," Digital Signal Processing, vol. 94, pp. 3–20, 2019.
[15] W. Tang, M. Z. Chen, J. Y. Dai, Y. Zeng, X. Zhao, S. Jin, Q. Cheng, and T. J. Cui, "Wireless communications with programmable metasurface: New paradigms, opportunities, and challenges on transceiver design," IEEE Wireless Communications, vol. 27, no. 2, pp. 180–187, 2020.
[16] J. Lee, E. Tejedor, K. Ranta-aho, H. Wang, K.-T. Lee, E. Semaan, E. Mohyeldin, J. Song, C. Bergljung, and S. Jung, "Spectrum for 5G: Global status, challenges, and enabling technologies," IEEE Communications Magazine, vol. 56, no. 3, pp. 12–18, 2018.
[17] V. Petrov, T. Kurner, and I. Hosako, "IEEE 802.15.3d: First standardization efforts for Sub-Terahertz band communications toward 6G," IEEE Communications Magazine, vol. 58, no. 11, pp. 28–33, 2020.
[18] I. F. Akyildiz, C. Han, and S. Nie, "Combating the distance problem in the millimeter wave and Terahertz frequency bands," IEEE Communications Magazine, vol. 56, no. 6, pp. 102–108, 2018.
[19] T. S. Rappaport, Y. Xing, O. Kanhere, S. Ju, A. Madanayake, S. Mandal, A. Alkhateeb, and G. C. Trichopoulos, "Wireless communications and applications above 100 GHz: Opportunities and challenges for 6G and beyond," IEEE Access, vol. 7, pp. 78 729–78 757, 2019.
[20] K. T. Selvan and R. Janaswamy, "Fraunhofer and fresnel distances: Unified derivation for aperture antennas," IEEE Antennas and Propagation Magazine, vol. 59, no. 4, pp. 12–15, 2017.
[21] F. Guidi and D. Dardari, "Radio positioning with EM processing of the spherical wavefront," IEEE Transactions on Wireless Communications, vol. 20, no. 6, pp. 3571–3586, 2021.
[22] A. Guerra, F. Guidi, D. Dardari, and P. M. Djurić, "Near-field tracking with large antenna arrays: Fundamental limits and practical algorithms," IEEE Transactions on Signal Processing, vol. 69, pp. 5723–5738, 2021.
[23] D. Dardari, N. Decarli, A. Guerra, and F. Guidi, "LOS/NLOS near-field localization with a large reconfigurable intelligent surface," IEEE Transactions on Wireless Communications, vol. 21, no. 6, pp. 4282–4294, 2022.
[24] F. Guidi and D. Dardari, "Radio positioning with EM processing of the spherical wavefront," IEEE Transactions on Wireless Communications, vol. 20, no. 6, pp. 3571–3586, 2021.
[25] S. Zhang, T. Jost, R. Pöhlmann, A. Dammann, D. Shutin, and P. A. Hoeher, "Spherical wave positioning based on curvature of arrival by an antenna array," IEEE Wireless Communications Letters, vol. 8, no. 2, pp. 504–507, 2018.
[26] X. Yin, S. Wang, N. Zhang, and B. Ai, "Scatterer localization using large-scale antenna arrays based on a spherical wave-front parametric model," IEEE Transactions on Wireless Communications, vol. 16, no. 10, pp. 6543–6556, 2017.
[27] J. P. Delmas, M. N. El Korso, H. Gazzah, and M. Castella, "CRB analysis of planar antenna arrays for optimizing near-field source localization," Signal Processing, vol. 127, pp. 117–134, 2016.
[28] J. V. Alegría and F. Rusek, "Cramér-Rao lower bounds for positioning with large intelligent surfaces using quantized amplitude and phase," in 2019 53rd Asilomar Conference on Signals, Systems, and Computers. IEEE, 2019, pp. 10–14.
[29] M. N. El Korso, A. Renaux, R. Boyer, and S. Marcos, "Deterministic performance bounds on the mean square error for near field source localization," IEEE Transactions on Signal Processing, vol. 61, no. 4, pp. 871–877, 2013.
[30] B. Friedlander, "Localization of signals in the near-field of an antenna array," IEEE Transactions on Signal Processing, vol. 67, no. 15, pp. 3885–3893, 2019.
[31] A. de Jesus Torres, A. A. D'Amico, L. Sanguinetti, and M. Z. Win, "Cramér-Rao bounds for near-field localization," in 2021 55th Asilomar Conference on Signals, Systems, and Computers. IEEE, 2021, pp. 1250–1254.
[32] A. A. D'Amico, A. de Jesus Torres, L. Sanguinetti, and M. Win, "Cramér-Rao bounds for holographic positioning," IEEE Transactions on Signal Processing, vol. 70, pp. 5518–5532, 2022.
[33] S. J. Orfanidis, "Electromagnetic waves and antennas," 2016.
[34] A. Chen, L. Chen, Y. Chen, C. You, G. Wei, and F. R. Yu, "Cramér-Rao bounds of near-field positioning based on electromagnetic propagation model," IEEE Transactions on Vehicular Technology, vol. 72, no. 11, pp. 13 808–13 825, 2023.
[35] C. Huang, S. Hu, G. C. Alexandropoulos, A. Zappone, C. Yuen, R. Zhang, M. Di Renzo, and M. Debbah, "Holographic MIMO surfaces for 6G wireless networks: Opportunities, challenges, and trends," IEEE Wireless Communications, vol. 27, no. 5, pp. 118–125, 2020.
[36] A. Pizzo, L. Sanguinetti, and T. L. Marzetta, "Fourier plane-wave series expansion for holographic MIMO communications," IEEE Transactions on Wireless Communications, vol. 21, no. 9, pp. 6890–6905, 2022.
[37] R. Deng, B. Di, H. Zhang, Y. Tan, and L. Song, "Reconfigurable holographic surface-enabled multi-user wireless communications: Amplitude-controlled holographic beamforming," IEEE Transactions on Wireless Communications, vol. 21, no. 8, pp. 6003–6017, 2022.
[38] A. S. Poon, R. W. Brodersen, and D. N. Tse, "Degrees of freedom in multiple-antenna channels: A signal space approach," IEEE Transactions on Information Theory, vol. 51, no. 2, pp. 523–536, 2005.
[39] M. R. Castellanos and R. W. Heath, "Electromagnetic-based signal processing for arbitrary arrays," in 2023 57th Asilomar Conference on Signals, Systems, and Computers, 2023, pp. 1584–1588.
[40] ——, "Electromagnetic manifold characterization of antenna arrays," arXiv preprint arXiv:2311.04835, 2023.
[41] E. Björnson, C.-B. Chae, R. W. Heath Jr, T. L. Marzetta, A. Mezghani, L. Sanguinetti, F. Rusek, M. R. Castellanos, D. Jun, and Ö. T. Demir, "Towards 6G MIMO: Massive spatial multiplexing, dense arrays, and interplay between electromagnetics and processing," arXiv preprint arXiv:2401.02844, 2024.
[42] E. Björnson and L. Sanguinetti, "Power scaling laws and near-field behaviors of massive MIMO and intelligent reflecting surfaces," IEEE Open Journal of the Communications Society, vol. 1, pp. 1306–1324, 2020.
[43] E. Björnson, Ö. T. Demir, and L. Sanguinetti, "A primer on near-field beamforming for arrays and reconfigurable intelligent surfaces," in 2021 55th Asilomar Conference on Signals, Systems, and Computers. IEEE, 2021, pp. 105–112.
[44] X. Cao, A. Chen, H. Yin, and L. Chen, "A low-complexity near-field localization method based on electric field model," IEEE Communications Letters, vol. 28, no. 2, pp. 288–292, 2024.
[45] N. Deshpande, M. R. Castellanos, S. R. Khosravirad, J. Du, H. Viswanathan, and R. W. Heath, "A wideband generalization of the near-field region for extremely large phased-arrays," IEEE Wireless Communications Letters, vol. 12, no. 3, pp. 515–519, 2023.
[46] K. Bell, Y. Steinberg, Y. Ephraim, and H. Van Trees, "Extended Ziv-Zakai lower bound for vector parameter estimation," IEEE Transactions on Information Theory, vol. 43, no. 2, pp. 624–637, 1997.
[47] V. M. Chiriac, Q. He, A. M. Haimovich, and R. S. Blum, "Ziv-Zakai bound for joint parameter estimation in MIMO radar systems," IEEE Transactions on Signal Processing, vol. 63, no. 18, pp. 4956–4968, 2015.
[48] K. Bell, Y. Ephraim, and H. Van Trees, "Explicit Ziv-Zakai lower bound for bearing estimation," IEEE Transactions on Signal Processing, vol. 44, no. 11, pp. 2810–2824, 1996.
[49] H. L. Van Trees and K. L. Bell, "Bayesian bounds for parameter estimation and nonlinear filtering/tracking," AMC, vol. 10, no. 12, pp. 10–1109, 2007.（该条抽取文本的期刊缩写与页码疑为排版/抽取问题，未强行改写，待核对原 PDF。）
[50] J. H. de M. Goulart, M. Boizard, R. Boyer, G. Favier, and P. Comon, "Tensor CP decomposition with structured factor matrices: Algorithms and performance," IEEE Journal of Selected Topics in Signal Processing, vol. 10, no. 4, pp. 757–769, 2016.

**本页范围与校对状态：** 本页覆盖 arXiv:2310.17327v3（IEEE JSAC 2024）全文 19 页：摘要、第 I—VI 节、结论、图 1—11 图注、表 I 与表 II（表 II 按三个情形拆为三张子表，逐格与原表一致）、附录 A—H 全部证明（式（78）—（114））、原文脚注 1—14、参考文献 [1]—[50]（英文原条目，按原编号保留）。表格与关键矢量式已用 `render.py` 将 PDF 第 2、12、15、18、19 页渲染为图像后逐格核对；原文作者简介（ biography）与页首版权声明按非正文内容省略，版权与再传播许可需另行核验。已标注一处原文疑点（式（81）—（83）的相位因子符号与式（78）—（80）不一致）以及一条抽取残缺书目（[49] 待核对）。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、表格数值的独立复算均未做），因此本页不标记为已验收全文；若需引用具体数值或公式，请以 [原文 PDF](https://arxiv.org/pdf/2310.17327v3) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}

