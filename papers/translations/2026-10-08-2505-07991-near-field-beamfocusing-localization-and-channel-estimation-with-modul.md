---
layout: page
title: "模块化线性阵列下的近场波束聚焦、定位与信道估计｜中文全文译文"
permalink: /papers/translations/2026-10-08-2505-07991-near-field-beamfocusing-localization-and-channel-estimation-with-modul/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ce9aab0defec4206/) · [原文 arXiv](https://arxiv.org/abs/2505.07991) · [全部目录](/papers/catalog/)

# 模块化线性阵列下的近场波束聚焦、定位与信道估计

**原题：** Near-Field Beamfocusing, Localization, and Channel Estimation With Modular Linear Arrays  
**作者：** Alva Kosasih、Özlem Tuğfe Demir、Emil Björnson（IEEE 会士）  
**单位：** Alva Kosasih 曾在瑞典皇家理工学院（KTH）工作，现就职于 Nokia Standards（Espoo，芬兰）；Özlem Tuğfe Demir 曾在 TOBB 经济与技术大学工作，现就职于 Bilkent University（Ankara，Türkiye）；Emil Björnson 就职于瑞典皇家理工学院通信系统分部（斯德哥尔摩，瑞典）。  
**版本：** arXiv:2505.07991v2（eess.SP），2025 年 12 月 7 日（v2），原文 16 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VI 节及全部小节、定理与推论、图 1–10 图注、算法 1、附录 A–B（含式 (47)–(52) 的证明推导）、参考文献 [1]–[36]（英文原条目）均按原文结构录入；原文无表格；原第 16 页为作者简介，不属于正文，本页未逐段翻译。逐句逐式终校未做。  
**版权与来源说明：** 本文部分内容曾在 2024 年 IEEE Asilomar 信号、系统与计算机会议上报告 [1]；本工作受瑞典战略研究基金会（SSF）FFL18-0277 项目与瑞典研究理事会 2022-04222 项目资助。

## 摘要

本文研究如何利用模块化线性阵列（modular linear array，MLA）实现近场波束聚焦；MLA 由多个间距较大的均匀线性阵列（uniform linear array，ULA）组成。MLA 架构在不增加天线的条件下扩展了标准 ULA 的孔径长度，从而能够在不提升处理复杂度的前提下实现近场波束聚焦。与传统的远场波束成形不同，近场波束聚焦可以在同一角度区间内同时向处于不同距离的多个用户传输数据，带来显著的复用增益。本文对 MLA 可实现的波束宽度与波束深度进行了详细数学分析，并证明：通过适当选择各组成 ULA 的天线数，可以实现理想的近场波束聚焦。此外，本文提出一种计算高效的定位方法，把各 ULA 的估计结果融合起来，从而实现高效的参数化信道估计。仿真结果验证了解析表达式的准确性，并表明 MLA 能以有限的天线数实现近场波束聚焦，因而是一类有望用于下一代无线系统的方案。

**关键词：** 波束聚焦；波束宽度；波束深度；信道估计；模块化线性阵列；定位；近场。

## I. 引言

大规模多输入多输出（massive multiple-input multiple-output，mMIMO）技术的商用化是 5G 网络的基石，相较 4G 显著提升了频谱效率与能量效率 [2]。随着 5G 部署持续扩展——到 2023 年底已覆盖全球 45% 的人口 [3]——当前研究聚焦于发展更优技术，以实现 6G 及更远期的宏大目标。下一代基站（base station，BS）必须支持更高的蜂窝吞吐量以及无线感知、边缘人工智能（artificial intelligence，AI）等新业务 [4], [5]。这些基站将配备在上中频段（upper mid-band）使用更大规模阵列的 MIMO 技术，通过大幅增强的空间复用能力可能带来显著更高的吞吐量 [6]。然而，要在实践中充分利用这些优势，就应当利用近场球面波特性获得更丰富的信道特征，使距离接近的用户在联合距离/角度域中易于区分 [7]。

### A. 相关工作

经典上，天线阵列的电磁辐射图样按传播距离划分为三个区域：反应近场、辐射近场与远场 [8]。本文关注辐射近场：该区域内阵列各天线间的幅度变化可忽略，只需考虑相位变化。为简洁起见，下文将辐射近场简称为近场。传统远场波束成形把信号聚焦到远处的某一点；近场波束成形则像透镜一样把信号聚焦到某个特定位置上，称为有限深度波束成形/波束聚焦。它是通过基于各天线信道系数构造的匹配滤波器（matched filter，MF）实现的。

近场波束聚焦使空间复用在视距与稀疏多径环境中更具实用价值。原因是阵列可以同时在角度域与距离域上区分多个用户，而不像传统远场波束成形只能在角度域区分。当传播距离小于 Fraunhofer 距离 \(2D^2/\lambda\) 时，波束聚焦特性才会出现 [10]，其中 \(D\) 与 \(\lambda\) 分别表示阵列孔径长度与波长。实践中，给定覆盖距离 \(d_{\max}\) 与波长 \(\lambda\)，可以计算实现波束聚焦所需的孔径长度 \(D=\sqrt{d_{\max}\lambda/2}\)。然而，用传统的半波长间隔天线填满这一孔径并不容易：阵列在物理上会很大，需要数百甚至数千根天线，计算复杂度也会过高。

缓解上述问题的一种自然途径，是在保持孔径面积的同时减少阵列中的天线数。主要有两种方案：

1. **稀疏均匀阵列（sparse uniform arrays）：** 在保持均匀结构的前提下把阵元间距增大到超过半个波长，形成线性稀疏阵列（linear sparse array，LSA）[11], [12], [13], [14]。文献 [11] 与 [12] 全面研究了稀疏阵列如何服务于 6G 方向的通信感知一体化（integrated sensing and communication，ISAC），包括栅瓣抑制、波束码本设计与阵列几何优化。文献 [13] 分析了稀疏阵列与共址阵列的波束图样性质以及用户间角度间隔的分布，说明它们对用户间干扰（inter-user interference，IUI）的影响；该研究发现稀疏阵列比共址阵列更不容易遭受严重 IUI。文献 [14] 关注通过最小化栅瓣与 IUI 来最大化近场通信的和速率。
2. **模块化阵列（modular arrays）：** 构造天线数与半波长间距相同、但子阵之间间距更大的子阵列，以获得所需孔径面积 [15]。该文为 6G 提出模块化阵列，允许子阵具有不同形状与尺寸，并论证所需硬件在 2030 年前后的 6G 时间表内是可行的，同时给出系统级仿真说明模块化大规模 MIMO（modular massive MIMO，mmMIMO）的性能增益。

此外，还可以将上述两种思路结合，把每个子阵设计为稀疏阵列，例如互质阵列（coprime arrays）[16] 与扩展互质阵列（extended coprime arrays）[17]。稀疏均匀阵列的传统问题是会引入栅瓣 [18]，即与主瓣等高的旁瓣；这会带来强用户间干扰与定位模糊。相较之下，模块化阵列只产生低增益旁瓣 [19]，因为子阵本身具有"干净"的波束指向性。

典型的 5G 基站使用含数十根天线（例如 32 或 64 根）的紧凑阵列。把多个这类 5G 式阵列部署在同一屋顶上，即可构成模块化线性阵列（MLA）。这使这些子阵的同步与协同处理变得可行：它们之间只相隔数米（或更近），完全在电缆安装范围内，还可以共用本地振荡器与基带单元。因此，MLA 比无蜂窝 mMIMO 网络更易于部署与运营——后者的子阵分布在整个覆盖区域，需要本地处理能力与空中同步 [20]。

此前仅有少量研究涉及使用模块化阵列的近场通信 [19], [21], [22], [23], [24]。文献 [19] 提出一种多用户调度方法，在近场使用 MLA 通信时最大化和服务率。文献 [21] 考虑模块化均匀与非均匀阵列，重点推导双站近场感知系统中距离与角度估计的闭式 Cramér–Rao 界。文献 [22] 分析模块化阵列在不同阵列几何与用户位置下的性能，重点分析模块化阵列中的信噪比（signal-to-noise ratio，SNR），并解析推导出 SNR 与子阵数目和/或每个子阵内天线数成正比增长。文献 [23] 与 [24] 分别提出模块化近场阵列的码本设计与混合波束成形。

近来，在太赫兹（terahertz，THz）通信中，模块化阵列的概念也开始出现 [25], [26], [27]。这些模块化阵列被称为宽间隔子阵（widely spaced sub-arrays），最早由 [25] 引入；该文指出可联合利用两类空间复用：路径间（inter-path）与路径内（intra-path）。路径间复用指从各子阵观测到的信号，表现为类平面波前；路径内复用指从整个阵列观测到的信号，表现为类球面波前。利用这两类复用，文献 [26] 发展了一种为该场景量身定制的先进混合波束成形架构，以提供高频谱效率。进一步地，文献 [27] 考察了此类系统的定位能力，推导了宽间隔子阵近场定位的 Cramér–Rao 界等理论界。

据我们所知，此前工作尚未对 MLA 的近场波束聚焦图样进行解析研究。需要指出，MLA 的波束聚焦图样依赖于其构型，且与常规均匀阵列不同。因此，必须确定最高效的 MLA 构型（例如子阵数目与每个子阵的天线数）以实现有效的波束聚焦。此外，由于处理更多天线会带来更高的处理复杂度与成本，一个关键问题——也是本文的主要动机——是：能否用相对较少的天线实现有效的波束聚焦？

### B. 贡献

本文从数学与数值两方面分析 MLA 的几何结构如何影响其在近场通信中的波束图样。我们考虑的关键设计因素包括每个 ULA 的天线数、ULA 的数目以及 ULA 之间的间距。基于这些分析，我们找出以最少天线数实现波束聚焦效果的最有效几何结构。本文的主要目标是表明：用相对较少的天线实现波束聚焦是可能的。这与近期研究 [19] 形成对比——后者主要关注栅瓣。此外，我们为 MLA 提出低复杂度的定位与信道估计方法，并证明它们以显著降低的复杂度取得接近最优的性能。定位方法基于三角定位（triangulation），该方法以低复杂度著称，因为它只在角度域而非联合的角度—距离域中运算 [28]。这与 [25], [26] 中考虑的路径间/路径内复用概念一致。然而据我们所知，此前尚未有工作把三角定位用于为模块化阵列系统设计高效定位算法。更具体地说，所提算法的新颖性在于利用了实际的模块化阵列几何——其中子阵天然处于基站远场，因此可以在每个子阵内做远场角度估计。远场角度通过对阵列信号处理得到，具体采用多重信号分类（MUltiple SIgnal Classification，MUSIC）算法；随后通过最小二乘三角定位步骤融合估计出的距离。因此，该方法的新颖性来自"把远场角度估计与模块化阵列结构相结合"的完整近场定位框架，而非三角定位方法本身。主要贡献概括如下。

- 我们分析 MLA 所实现的波束图样，并给出相应的解析表达式，包括波束宽度与波束深度的闭式表达。分析先从两个 ULA 出发，再推广到任意个数 \(L\ge2\) 的 ULA。由两个子阵构成的 MLA 因其结构简单而潜力巨大，同时能显著少于具有相同孔径长度的传统半波长间距 ULA 的天线数实现波束聚焦。
- 利用得到的解析表达式，我们计算在波束聚焦区域内不出现增益起伏所需的天线数；并提出一种算法，针对给定孔径长度确定实现此类近场波束聚焦所需的子阵数目。我们给出的波束宽度与波束深度闭式表达式使这些计算成为可能，并保证算法高效执行。
- 我们为 MLA 提出一种高效的用户定位方法：对每个 ULA 估计一个角度，再把它们组合起来准确确定用户位置。因此，我们只需在角度维度上做网格搜索，而不像近场定位通常要求的那样同时在角度与距离维度搜索 [29], [30], [31]。这显著降低了复杂度，同时保持良好定位性能（见仿真结果）。此外，我们把所提定位方法用于信道估计，并证明其频谱效率（spectral efficiency，SE）与使用完美信道状态信息时的结果非常接近。

需要指出，本文考虑的 MLA 在每个 ULA 只有一根天线、且 ULA 之间间距超过 \(\lambda/2\) 时退化为 LSA；该 LSA 构型的波束图样分析详见 [17] 及 [18] 等教材。另一方面，当相邻 ULA 最近天线之间的间距等于各 ULA 内部阵元间距时，MLA 退化为标准 ULA（即半波长间距）。尽管 ULA 的波束聚焦图样分析此前未见报道，但它可以作为均匀矩形阵列波束图样分析的特例导出，我们在近期工作 [32] 中已给出概要。本文将在引理 1 中给出该推导。因此，本文扩展了 [32], [17] 的结果。相较会议版本 [1]，本文有三点主要差异：

- 会议版本只考虑 \(L=2\) 个 ULA 的情形，本文把分析推广到任意数目的 ULA。
- 会议版本没有给出确定实现期望波束聚焦图样所需阵列数目的算法。
- 会议版本未涉及 MLA 的信道估计与定位。

这些补充带来了期刊版本的实质性提升：我们扩展了分析、引入新算法，并把研究范围拓宽到把波束聚焦图样与无线通信中的实际性能指标（如频谱效率）联系起来。

### C. 文章结构

本文其余部分安排如下：第 II 节给出天线阵列阵列增益与使用 ULA 的波束聚焦的预备知识；第 III 节分析由两个 ULA 构成的 MLA 的波束图样（含波束宽度与波束深度）；第 IV 节把波束图样分析推广到任意数目 ULA 的 MLA；第 V 节讨论如何利用 MLA 的结构进行定位与信道估计；第 VI 节总结全文。

## II. 预备知识

本节阐述如何用 ULA 接收机与单天线用户发射机实现波束聚焦。本节方法将在后文分析多阵列场景时使用。我们考虑自由空间传播场景：各向同性发射天线位于 \((x_t,y_t,z)\)，接收阵列沿 \(x\) 轴部署、中心位于原点。为保持波束聚焦解释的清晰与简单，我们聚焦于正侧射（broadside）传输，即 \(x_t=y_t=0\)；非正侧射传输将在后文讨论。

> **原文脚注 2：** 为便于表述，本文从"接收端为阵列、发射端为各向同性源"的视角展开，但同样的结果适用于"发射端为阵列、接收端为各向同性"的互易设置。

### A. 计算 ULA 的阵列增益

考虑一个包含 \(N\) 根孔径天线的 ULA，天线编号为 \(n\in\{1,\ldots,N\}\)。天线 \(n\) 的中心位于 \((\bar{x}_n,0,0)\)：

$$
\bar{x}_n=\left(n-\frac{N+1}{2}\right)\delta,\tag{1}
$$

其中 \(\delta\) 为相邻天线间距。天线 \(n\) 覆盖面积为 \(\delta\times\delta\) 的区域：

$$
\mathcal{A}_n=\left\{(x,y,0):|x-\bar{x}_n|\le\frac{\delta}{2},\ |y|\le\frac{\delta}{2}\right\}.\tag{2}
$$

ULA 的孔径长度定义为 \(D_{\mathrm{array}}=N\delta\)。当传播距离超过 Fraunhofer 阵列距离 \(d_{\mathrm{FA}}=2D_{\mathrm{array}}^2/\lambda\) 时 [10]，入射波跨越阵列的球面相位变化可忽略（小于 \(\pi/8\)）；这对应远场通信，球面波前曲率可精确近似为平面。反之，当传播距离短于 \(d_{\mathrm{FA}}\) 时，球面波前曲率变得显著，即辐射近场通信。本文需要一个在远场与近场均准确的信道模型。

> **原文脚注 1：** 文献 [9] 表明，经典 Fraunhofer 距离仍能给出精度合理的近场/远场边界，与多数替代方案相比其信道容量估计误差相对较低。

若发射机发送 \(y\) 方向极化的信号，则接收孔径上点 \((x,y,0)\) 处的电场可由 Green 函数导出 [33, App. A]：

$$
E(x,y)=\frac{E_0}{\sqrt{4\pi}}\frac{\sqrt{z(x^2+z^2)}}{r^{5/4}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\sqrt{r}},\tag{3}
$$

其中 \(r=x^2+y^2+z^2\) 为发射机与所考虑点之间的平方欧氏距离，\(E_0\) 为发射信号的电强度。式 (3) 考虑了辐射近场中有效面积、极化损耗与路径损耗在孔径上的变化，详见 [33, Eq. 69]。

天线 \(n\) 接收到的功率为 \(E_0^2|h_n|^2/\eta\)，其中 \(E_0^2/\eta\) 为发射信号功率，\(\eta\) 为自由空间阻抗，而

$$
h_n=\frac{1}{E_0\sqrt{A}}\int_{\mathcal{A}_n}E(x,y)dxdy\tag{4}
$$

为无量纲复值信道响应 [33, Eq. (64)]，\(A=\delta^2\) 为每根接收天线的面积。若 \(s\in\mathbb C\) 表示以功率 \(E_0^2/\eta\) 发送的信息符号，则天线 \(n\) 处的接收信号为

$$
\chi_n=h_ns+v_n,\qquad n=1,\ldots,N,\tag{5}
$$

其中 \(v_n\sim\mathcal N_{\mathbb C}(0,\sigma^2)\) 为独立的复高斯接收噪声。假定采用线性接收合并从 \(\chi_1,\ldots,\chi_N\) 中检测 \(s\)：把每个接收信号乘以权重 \(w_n\) 后相加，得到 \(\sum_{n=1}^Nw_n\chi_n\)。不失一般性，可归一化权重使 \(\sum_{n=1}^N|w_n|^2=1\)。合并信号的 SNR 为

$$
\mathrm{SNR}=\frac{E_0^2}{\eta\sigma^2}\left|\sum_{n=1}^Nw_nh_n\right|^2
=\frac{\left|\sum_{n=1}^N\int_{\mathcal{A}_n}w_nE(x,y)dxdy\right|^2}{A\eta\sigma^2}.\tag{6}
$$

使用 MF 可最大化 SNR，其中天线 \(n\) 的权重为 \(w_n=h_n^*/\sqrt{\sum_{j=1}^N|h_j|^2}\)。由此得到的最大 SNR 为

$$
\mathrm{SNR}=\frac{E_0^2}{\eta\sigma^2}\sum_{n=1}^N|h_n|^2
=\frac{\left|\sum_{n=1}^N\int_{\mathcal{A}_n}E(x,y)dxdy\right|^2}{A\eta\sigma^2}.\tag{7}
$$

> **原文脚注 3：** 注意 MF 权重归一化为 \(\sum_{n=1}^N|w_n|^2=1\)，该归一化不影响所得的 SNR 表达式。

权重 \(w_n\) 出现在式 (6) 的积分内。因此可以把接收合并视为给电场乘以一个分段常数函数 \(w(x,y)\)，它在天线 \(n\) 上取常值 \(w_n\)。若天线足够小，该合并函数近乎连续，于是可以优化整个函数。相应的连续 MF 接收机为

$$
w(x,y)=E^*(x,y)\Bigg/
\sqrt{\sum_{n=1}^N\frac{1}{A}\int_{\mathcal{A}_n}|E(x,y)|^2dxdy},\tag{8}
$$

其中归一化保证天线上的平均权重总和为 1，即 \(\sum_{n=1}^N\frac{1}{A}\int_{\mathcal{A}_n}|w(x,y)|^2dxdy=1\)。采用连续 MF 时的 SNR 为

$$
\mathrm{SNR}=\frac{E_0^2}{\eta\sigma^2}\sum_{n=1}^N|h_n|^2
\approx\frac{\left|\sum_{n=1}^N\int_{\mathcal{A}_n}w(x,y)E(x,y)dxdy\right|^2}{A\eta\sigma^2}
=\frac{1}{\eta\sigma^2}\sum_{n=1}^N\int_{\mathcal{A}_n}|E(x,y)|^2dxdy.\tag{9}
$$

**注 1。** 式 (7) 与式 (9) 中绝对值位置的表观差异，源于从离散 MF 接收机到其连续孔径近似的过渡。在式 (7) 中，相干合并在 \(N\) 根离散天线上进行，导致各天线积分相互独立地取模后求和；在式 (9) 中，连续 MF 先在整个孔径上合并场，再对幅度平方，因此绝对值作用于完整积分表达式。两种表述都是 MF 合并的一致表示。

为量化多天线实际获得的阵列增益，我们考虑理想参考情形：采用连续 MF，且所有天线接收到的功率与原点处天线相同。此时 SNR 为

$$
\mathrm{SNR}^{\mathrm{ref}}=\frac{N}{\eta\sigma^2}\int_{\mathcal{A}}|E(x,y)|^2dxdy,\tag{10}
$$

其中 \(\mathcal{A}=\{(x,y,0):|x|\le\frac{\delta}{2},|y|\le\frac{\delta}{2}\}\) 表示位于原点的单根天线所覆盖的面积。于是可写出归一化阵列增益 [10]：

$$
G_{\mathrm{array}}=\frac{\sum_{n=1}^N\left|\int_{\mathcal{A}_n}E(x,y)dxdy\right|^2}{NA\int_{\mathcal{A}}|E(x,y)|^2dxdy},\tag{11}
$$

它由式 (7) 中常规 MF 取得的 SNR 除以式 (10) 中参考连续 MF 情形的 SNR 得到。这里 \(\mathcal{A}_n\) 表示天线 \(n\) 物理孔径面积对应的点集。\(G_{\mathrm{array}}\) 的取值在 0 到 1 之间。

只要到发射机的距离大于 \(2D_{\mathrm{array}}\)，式 (3) 的电场表达式即可用 Fresnel 近似简化为 [10]

$$
E(x,y)\approx\frac{E_0}{\sqrt{4\pi z}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(z+\frac{x^2}{2z}+\frac{y^2}{2z}\right)}.\tag{12}
$$

该式通过忽略孔径上的幅度变化、并对发射机与阵列之间欧氏距离的相位项作一阶 Taylor 展开得到。本文其余部分将使用式 (12) 的 Fresnel 近似进行解析推导；该近似的紧致性最近已在 [32] 中得到证明。

### B. 使用 ULA 的波束聚焦

MF 把接收/发射聚焦到期望的焦点，在该点应取得最大可达阵列增益；阵列增益在其他邻近点也会显著。在传统远场波束成形中，同一方向上的任意其他点都能取得最大阵列增益，与距离无关。波束聚焦则指另一种近场现象：阵列增益只在焦点附近有限的距离范围内较大。下面说明如何量化这一现象。

设 MF 配置为从焦点 \((0,0,F)\) 接收，而发射机位于 \((0,0,z)\)。利用 Fresnel 近似，为天线 \(n\) 设计的 MF 权重为

$$
w_n=\frac{\left(\int_{\mathcal{A}_n}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right)^*}
{\sqrt{\sum_{j=1}^N\left|\int_{\mathcal{A}_j}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right|^2}},\tag{13}
$$

按与式 (11) 相同的原理，把式 (6) 的 SNR 除以式 (10) 的参考 SNR，可得归一化阵列增益表达式。因此

$$
G_{\mathrm{ULA}}=\frac{\left|\sum_{n=1}^N\int_{\mathcal{A}_n}w_nE(x,y)dxdy\right|^2}{NA\int_{\mathcal{A}}|E(x,y)|^2dxdy}
\approx\hat{G}_{\mathrm{ULA}}
=\frac{1}{(NA)^2}\left|\sum_{n=1}^N\int_{\mathcal{A}_n}w(x,y)e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2z}+\frac{y^2}{2z}\right)}dxdy\right|^2
$$
$$
=\frac{1}{(NA)^2}\left|\sum_{n=1}^N\int_{\mathcal{A}_n}e^{+\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2z}+\frac{y^2}{2z}\right)}dxdy\right|^2,\tag{14}
$$

其中式 (8) 对应的连续 MF 接收机具有合并函数

$$
w(x,y)=e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2F}+\frac{y^2}{2F}\right)}\big/\sqrt{N},\tag{15}
$$

因为 \(\sum_{n=1}^N\frac{1}{A}\int_{\mathcal{A}_n}|E(x,y)|^2dxdy=NA/A=N\)。式 (14) 的近似来自以连续 MF 取代 MF（即假设天线很小）并使用式 (12) 的 Fresnel 近似。如下述引理所述，式 (14) 的归一化阵列增益存在闭式表达。

**引理 1。** 当发射机位于 \((0,0,z)\)、MF 聚焦于 \((0,0,F)\) 时，基于 Fresnel 近似的 ULA 归一化阵列增益为

$$
\hat{G}_{\mathrm{ULA}}=\frac{\left(C^2(\sqrt{a})+S^2(\sqrt{a})\right)\left(C^2(\sqrt{aN})+S^2(\sqrt{aN})\right)}{(Na)^2},\tag{16}
$$

其中 \(C(\cdot)\) 与 \(S(\cdot)\) 为 Fresnel 积分函数 [34]，\(a=\frac{\lambda}{8z_{\mathrm{eff}}}\)，\(z_{\mathrm{eff}}=\frac{Fz}{|F-z|}\)。

**证明：** 见附录 A，其思路受 [34, Eq. (22)] 的推导启发。∎

## III. 由同一线上两个分离 ULA 构成的 MLA

现在考虑位于 \((0,0,z)\) 的各向同性发射机与配备两个 ULA 的 MLA 接收机通信。两 ULA 中最内层天线的中心相距 \(\Delta\) 米，如图 1 所示。注意两个 ULA 位于 \(x\) 轴的同一直线上，这不同于典型的无蜂窝 massive MIMO 设置——后者 ULA 可部署在任意位置。每个 ULA 配备 \(N\) 根天线。ULA-\(\ell\in\{1,2\}\) 的第 \(n\) 根天线阵元位于

$$
\bar{x}_n^{(\ell)}=\left(n-\frac{N+1}{2}\right)\delta+\left(\ell-\frac{3}{2}\right)\left(\Delta+(N-1)\delta\right).\tag{17}
$$

注意式 (17) 的第二项为加或减 \(\bar\Delta\)，其中 \(\bar\Delta=\frac{\Delta+(N-1)\delta}{2}\)。上述配置的一个特例是 \(\Delta=\delta\)，此时两个 ULA 合并为阵元间距为 \(\delta\) 的单个 ULA。阵列孔径长度为 \(D_{\mathrm{array}}=\Delta+(2N-1)\delta\)。阵列的 Fraunhofer 距离随两 ULA 之间间隔 \(\Delta\) 的增大而增大。这可能意味着：即使两个 ULA 部署的总天线数很少（每个 ULA 孔径长度很小），通过适当调整间隔 \(\Delta\) 也能实现波束聚焦。为验证这一点，我们将对该 MLA 模型的波束聚焦行为进行解析研究。

我们首先把式 (14) 中基于 MF 的波束聚焦归一化阵列增益表达式适配到 MLA 的两个 ULA。所得表达式为式 (18)，其中 \(\mathcal{A}_{\ell,n}\) 为 ULA-\(\ell\) 的天线 \(n\) 所覆盖的正方形区域：

$$
G_2=\frac{1}{2NA}\frac{\left|\sum_{n=1}^N\int_{\mathcal{A}_{1,n}}w_{1,n}E(x,y)dxdy+\sum_{n=1}^N\int_{\mathcal{A}_{2,n}}w_{2,n}E(x,y)dxdy\right|^2}{\int_{\mathcal{A}}|E(x,y)|^2dxdy}.\tag{18}
$$

利用 Fresnel 近似，得到归一化阵列增益表达式

$$
\hat{G}_2=\frac{1}{2NA^2}\left|\sum_{n=1}^N\int_{\mathcal{A}_{1,n}}w_{1,n}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2z}+\frac{y^2}{2z}\right)}dxdy+\sum_{n=1}^N\int_{\mathcal{A}_{2,n}}w_{2,n}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2z}+\frac{y^2}{2z}\right)}dxdy\right|^2,\tag{19}
$$

其中 MF 权重 \(w_{1,n}\) 与 \(w_{2,n}\) 由式 (20)–(21) 给出：

$$
w_{1,n}=\frac{\left(\int_{\mathcal{A}_{1,n}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right)^*}
{\sqrt{\sum_{j=1}^N\left(\left|\int_{\mathcal{A}_{1,j}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right|^2+\left|\int_{\mathcal{A}_{2,j}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right|^2\right)}},\tag{20}
$$

$$
w_{2,n}=\frac{\left(\int_{\mathcal{A}_{2,n}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right)^*}
{\sqrt{\sum_{j=1}^N\left(\left|\int_{\mathcal{A}_{1,j}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right|^2+\left|\int_{\mathcal{A}_{2,j}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right|^2\right)}}.\tag{21}
$$

按第 II-B 节相同的方法，它们可近似为连续 MF 函数

$$
w_1(x,y)=e^{+\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}\big/\sqrt{2N},
\qquad
w_2(x,y)=e^{+\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}\big/\sqrt{2N}.
$$

因此式 (19) 可近似为

$$
\hat{G}_2=\frac{1}{(2NA)^2}\Bigg|
\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2z}+\frac{y^2}{2z}\right)}dxdy
$$
$$
+\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2z}+\frac{y^2}{2z}\right)}dxdy\Bigg|^2.\tag{22}
$$

下面把标准 ULA 与 MLA 的归一化阵列增益作比较。标准 ULA 具有 \(N=50\) 根半波长间距天线；MLA 由两个 ULA 组成，每个含 25 根半波长间距天线，二者相隔 \(\Delta=5\) 米。把阵列焦点设在 \((0,0,30)\)，阵列工作在 15 GHz 载频（脚注 4）。图 2(a) 描绘 ULA 在 \(xz\) 平面上的归一化阵列增益（波束图样），增益在黄色与绿色区域较大。可以看到波束能量向用户后方无限延伸；这是远场波束成形的典型图样，也在预期之内，因为用户距离大于 23 m 的 Fraunhofer 阵列距离。相比之下，图 2(b) 给出 MLA 的波束图样，信号聚焦在同一位置，阵列增益只在焦点附近有限区域内较大。这表明即使总天线数与 ULA 相同，MLA 构型也能实现波束聚焦。下面给出 MLA 波束图样的理论刻画。

> **原文脚注 4：** 全文考虑 15 GHz 载频，这是下一代无线系统颇具前景的上中频段 [6]；不过若按比例缩放仿真设置，所得结论也适用于其他载频。

### A. 波束宽度分析

焦点 \((0,0,F)\) 附近的横向波束宽度（beamwidth，BW）可通过沿 \(x\) 轴考察归一化阵列增益来分析。具体而言，我们计算从另一点 \((x_t,0,F)\) 发射的信号（沿 \(x\) 轴坐标为 \(x_t\)）所取得的阵列增益；注意沿 \(z\) 轴的距离与焦点相同。计算归一化阵列增益时，必须把新的 \(x\) 轴坐标并入相移表达式。把式 (22) 推广到任意 \(x_t\) 并令 \(z=F\)，得到式 (23)：

$$
\hat{G}_{2,x_t}=\frac{1}{(2N\delta^2)^2}\Bigg|
\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta-x_t)^2}{2F}+\frac{y^2}{2F}\right)}dxdy
$$
$$
+\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta-x_t)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\Bigg|^2
$$
$$
=\frac{1}{(2N\delta^2)^2}\left|\delta\left(\int_{-\frac{N\delta}{2}-\bar\Delta}^{\frac{N\delta}{2}-\bar\Delta}e^{\mathrm{j}\frac{2\pi}{\lambda F}u_1x_t}du_1+\int_{-\frac{N\delta}{2}+\bar\Delta}^{\frac{N\delta}{2}+\bar\Delta}e^{\mathrm{j}\frac{2\pi}{\lambda F}u_2x_t}du_2\right)\right|^2
$$
$$
=\left|\frac{1}{2}\operatorname{sinc}\left(\frac{Nx_t}{2F}\right)\left(e^{\mathrm{j}\left(\frac{2\pi\bar\Delta x_t}{\lambda F}\right)}+e^{-\mathrm{j}\left(\frac{2\pi\bar\Delta x_t}{\lambda F}\right)}\right)\right|^2.\tag{23}
$$

最后一个表达式可简化为

$$
\hat{G}_{2,x_t}=\operatorname{sinc}^2\left(\frac{Nx_t}{2F}\right)\cos^2\left(\frac{2\pi\bar\Delta x_t}{\lambda F}\right)
\le\operatorname{sinc}^2\left(\frac{Nx_t}{2F}\right),\tag{24}
$$

其中上界是该函数的包络，因为余弦项比 sinc 项振荡得更快。

我们用"波束聚焦区域"指归一化阵列增益包络大于 0.5 的区域，这与经典半功率波束宽度概念一致。半功率波束宽度可解析表示为

$$
0.443\approx\frac{N|x_t|}{2F}\ \to\ \mathrm{BW}_{3\mathrm{dB}}\approx\frac{1.77F}{N},\tag{25}
$$

因为 \(\operatorname{sinc}^2(0.443)\approx0.5\)。注意该上界与阵列间间距 \(\bar\Delta\) 无关；但间距决定实际增益图样的振荡，如下例所示。

我们在图 3 中评估 MLA 的波束宽度。MLA 中每个 ULA 配备 \(N=16\) 根天线，MF 焦点位于 \((0,0,30)\) m，图中给出点 \((x_t,0,30)\) m 在不同 \(x_t\) 取值下的归一化阵列增益。黑色曲线是精确归一化阵列增益（不经近似计算），红色虚线对应式 (24) 中 \(\hat{G}_{2,x_t}\) 的解析公式（基于 Fresnel 近似与连续 MF 近似），蓝色虚线对应式 (24) 的上界（包络），绿色虚线标出上界大于 0.5 的区间，即（半功率）波束宽度。

在图 3(a) 中，MLA 孔径长度设为 \(D_{\mathrm{array}}=1\) m，可以看到归一化阵列增益沿 \(x\) 轴振荡；当图 3(b) 取更大孔径长度 \(D_{\mathrm{array}}=2\) m（即两 ULA 间距更大）时，增益振荡更明显。增益起伏并不理想，因为它意味着位于焦点的用户若在波束聚焦区域内移动，阵列增益可能意外降至零。因此下面解析推导消除起伏的条件。

我们首先刻画波纹在波束聚焦区域内的峰数。当 \(\cos^2\left(\frac{2\pi\bar\Delta x_t}{\lambda F}\right)=1\) 时出现峰值；由于对任意整数 \(k\) 有 \(\cos^2(\pi k)=1\)，峰值出现在

$$
x_t=\pm\frac{\lambda F}{2\bar\Delta}k.\tag{26}
$$

波束聚焦区域中心有一个峰；相邻两峰间距为 \(\frac{\lambda F}{2\bar\Delta}\)，因此波束聚焦区域内的峰数为

$$
2\left\lfloor\frac{\mathrm{BW}_{3\mathrm{dB}}/2}{\lambda F/(2\bar\Delta)}\right\rfloor+1
\approx2\left\lfloor\frac{1.77\bar\Delta}{N\lambda}\right\rfloor+1.\tag{27}
$$

该式表明：当每个 ULA 的天线数 \(N\) 增大、或 \(\bar\Delta\) 减小时，波束聚焦区域内的波纹数减少。当 \(\frac{1.77\bar\Delta}{N\lambda}<1\) 时，区域内只有一个峰。因此每个 ULA 中满足该条件的天线数为

$$
N>\frac{1.77\bar\Delta}{\lambda}.\tag{28}
$$

把 \(\bar\Delta=\frac{\Delta+(N-1)\delta}{2}\) 代入式 (28)，得到

$$
1.13>\frac{\Delta}{N\lambda}+\frac{(N-1)\delta}{N\lambda}.\tag{29}
$$

若 \(\delta=\lambda/2\)，则得到如下条件：

$$
0.63+\frac{1}{2N}>\frac{\Delta}{N\lambda}.\tag{30}
$$

由于含两个分离 ULA 的 MLA 总孔径长度为 \(D_{\mathrm{array}}=(2N-1)\frac{\lambda}{2}+\Delta\)，可把式 (30) 改写为用两个 ULA 孔径长度与 MLA 总孔径长度表示的条件：

$$
\frac{N\lambda}{D_{\mathrm{array}}}\ge0.62.\tag{31}
$$

因此，各 ULA 的总孔径长度必须至少达到 MLA 总孔径长度的 62%，才能只得到一个聚焦波束。

为说明这一结果，我们在图 4 中画出 MF 聚焦于 \((0,0,30)\) 时 \(xz\) 平面上的波束图样与沿 \(x\) 轴的归一化阵列增益。MLA 总孔径长度设为 \(D_{\mathrm{array}}=2\) m，每个 ULA 的天线数设为 \(N=64\)。于是阵列间距为 \(\Delta=0.72\) m，比值 \((N\lambda/D_{\mathrm{array}})\) 为 64%，满足式 (31)。图 4 表明，波束聚焦区域（绿色线以上）内只有一个峰。这与图 3(b) 形成对比：那里总孔径长度相同，但每个 ULA 的天线数更少，因此波束聚焦区域更宽、其内部有 9 个峰。获得无波纹波束聚焦的另一条途径是用半波长间距天线填满整个 2 m 孔径；在本例中 \(\lambda=0.02\) m，这需要 200 根天线；相比之下，MLA 构型只需 128 根天线即可实现所需的波束聚焦能力。

### B. 波束深度分析

波束深度同样可用归一化阵列增益分析。进行波束聚焦时，我们预期归一化阵列增益只在沿 \(z\) 轴的有限区间内大于 0.5。为分析这一点，设 MF 聚焦于 \((0,0,F)\)，并考虑可能的发射机位置 \((0,0,z_t)\)。可得式 (22) 中归一化阵列增益随 \(z_t\) 变化的如下闭式表达。

**定理 1。** 设发射机位于 \((0,0,z_t)\)，MLA 使用聚焦于 \((0,0,F)\) 的 MF。归一化阵列增益的 Fresnel 近似为

$$
\hat{G}_{2,z_t}=\frac{1}{(2Na)^2}\left(C^2(\sqrt{a})+S^2(\sqrt{a})\right)\cdot\left(\left(C(\beta_1)+C(\beta_2)\right)^2+\left(S(\beta_1)+S(\beta_2)\right)^2\right),\tag{32}
$$

其中 \(\beta_1=\sqrt{aN}+\sqrt{\frac{2}{\lambda z_{\mathrm{eff}}}}\bar\Delta\)，\(\beta_2=\sqrt{aN}-\sqrt{\frac{2}{\lambda z_{\mathrm{eff}}}}\bar\Delta\)，\(a=\frac{\lambda}{8z_{\mathrm{eff}}}\)，\(z_{\mathrm{eff}}=\frac{Fz_t}{|F-z_t|}\)。

**证明：** 见附录 B。∎

我们通过绘制图 5 来评估式 (32) 的 Fresnel 近似。图 5 的设置与图 4 相同；Fresnel 近似得到的增益与在焦点 \((0,0,30)\) m 处用积分 MF 数值计算式 (18) 所得的精确值几乎相同。

## IV. 由多个分离 ULA 构成的 MLA

现在把上一节的波束宽度与波束深度分析推广到 MLA 由 \(L\ge2\) 个 ULA 构成的情形。为记号方便，假定 \(L\) 为偶数；奇数情形可得类似结果。\(L\) 个 ULA 位于 \(x\) 轴的同一直线上，每个含 \(N\) 根天线；任意相邻 ULA 最近天线中心之间的距离为 \(\Delta\) 米。因此，ULA \(\ell\in\{1,\ldots,L\}\) 中的天线 \(n\) 位于 \(x\) 坐标

$$
\bar{x}_n^{(\ell)}=\left(n-\frac{N+1}{2}\right)\delta+\left(\ell-\frac{L+1}{2}\right)\left(\Delta+(N-1)\delta\right).\tag{33}
$$

对任意入射电场 \(E(x,y)\) 与接收合并权重 \(w_{\ell,n}\)，ULA \(\ell\) 中天线 \(n\) 对应的归一化天线阵列增益为

$$
G_{\mathrm{MLA}}=\frac{\left|\sum_{\ell=1}^L\sum_{n=1}^N\int_{\mathcal{A}_{\ell,n}}w_{\ell,n}E(x,y)dxdy\right|^2}{LNA\int_{\mathcal{A}}|E(x,y)|^2dxdy}.\tag{34}
$$

若各向同性发射机位于 \((x_t,0,z)\)，则可采用与上一节相同的 Fresnel 近似与小天线近似，得到近似归一化阵列增益式 (35)：

$$
\hat{G}_{\mathrm{MLA}}=\frac{\left|\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\left(\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}w(x,y)e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-k\bar\Delta-x_t)^2}{2z}+\frac{y^2}{2z}\right)}dxdy+\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}w(x,y)e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+k\bar\Delta-x_t)^2}{2z}+\frac{y^2}{2z}\right)}dxdy\right)\right|^2}{LNA^2},\tag{35}
$$

其中 \(w(x,y)\) 表示连续接收滤波器。注意式 (34) 是式 (18) 的推广，也是本节推导波束宽度与波束深度表达式的起点。

### A. 波束宽度分析

下面分析 MF 聚焦于 \((0,0,F)\) 时的波束宽度。考虑发射用户位于 \((x_t,0,z=F)\)，其中 \(x_t\) 为变量。采用连续 MF 时，式 (35) 的归一化增益表达式变为式 (36)：

$$
\frac{\left|\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\left(\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-k\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-k\bar\Delta-x_t)^2}{2F}+\frac{y^2}{2F}\right)}dxdy+\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+k\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+k\bar\Delta-x_t)^2}{2F}+\frac{y^2}{2F}\right)}dxdy\right)\right|^2}{(LN\delta^2)^2}
$$
$$
=\frac{\left|\delta\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\left(\int_{-\frac{N\delta}{2}-k\bar\Delta}^{\frac{N\delta}{2}-k\bar\Delta}e^{\mathrm{j}\frac{2\pi}{\lambda F}u_1x_t}du_1+\int_{-\frac{N\delta}{2}+k\bar\Delta}^{\frac{N\delta}{2}+k\bar\Delta}e^{\mathrm{j}\frac{2\pi}{\lambda F}u_2x_t}du_2\right)\right|^2}{(LN\delta^2)^2}
$$
$$
=\left|\frac{1}{L}\operatorname{sinc}\left(\frac{Nx_t}{2F}\right)\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\left(e^{\mathrm{j}\left(\frac{2k\pi\bar\Delta x_t}{\lambda F}\right)}+e^{-\mathrm{j}\left(\frac{2k\pi\bar\Delta x_t}{\lambda F}\right)}\right)\right|^2.\tag{36}
$$

最后一个表达式可简化为

$$
\operatorname{sinc}^2\left(\frac{Nx_t}{2F}\right)\left|\frac{2}{L}\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\cos\left(\frac{2k\pi\bar\Delta x_t}{\lambda F}\right)\right|^2
\le\operatorname{sinc}^2\left(\frac{Nx_t}{2F}\right),\tag{37}
$$

其中上界可视为该表达式的包络，因为余弦项随 \(x_t\) 振荡得更快。该式是式 (24) 的推广（对应 \(L=2\)）。有趣的是，包络与 \(L\) 无关，代表含 \(N\) 根天线的单个 ULA 的阵列增益变化。因此，只要 \(N\)、\(x_t\)、\(F\) 相同，MLA 的最大可能波束宽度与其所含 ULA 数目无关；ULA 构型只决定波纹。

如前所述，理想的波束聚焦图样在横向维度上应只有一个归一化阵列增益高于 0.5 的峰。为找出实现该效果所需的阵列数，我们提出算法 1。该算法原理是：把阵列数增加 2，直到 3 dB 波束宽度内只剩一个峰。3 dB 波束宽度内的 \(x\) 轴被离散为 \(R_{\mathrm{BW}}\) 个网格点（本文取 300）。函数 CountPeaks(\(\cdot\)) 先对输入数据插值，再统计所得曲线中的峰数。

**算法 1：计算所需阵列数 \(L\)**

1. 输入：总孔径长度 \(D_{\mathrm{array}}\)、焦距 \(F\)、每个 ULA 的天线数 \(N\)、波长 \(\lambda\)、带宽网格分辨率 \(R_{\mathrm{BW}}\)。
2. 输出：阵列数 \(L\)。
3. 初始化：\(t_0\leftarrow\infty\)，\(L\leftarrow0\)。
4. 计算 \(\mathrm{BW}_{3\mathrm{dB}}=\frac{1.77F}{N}\)。
5. 把区间 \(-\mathrm{BW}_{3\mathrm{dB}}/2\) 到 \(\mathrm{BW}_{3\mathrm{dB}}/2\) 离散为 \(R_{\mathrm{BW}}\) 个点 \(x_t^{(1)},\ldots,x_t^{(R_{\mathrm{BW}})}\)。
6. 当 \(t_0>1\) 且 \(LN\delta<D_{\mathrm{array}}\) 时循环：
7. 把 \(L\) 增加 2：\(L\leftarrow L+2\)。
8. 计算 \(\Delta=\frac{D_{\mathrm{array}}-(L(N-1)+1)\delta}{L-1}\)。
9. 计算 \(\bar\Delta=\frac{\Delta+(N-1)\delta}{2}\)。
10. 对 \(i\leftarrow1\) 到 \(R_{\mathrm{BW}}\)：
11. 基于式 (37) 计算 \(\hat{G}_{\mathrm{BW}}^{(i)}\)：

$$
\hat{G}_{\mathrm{BW}}^{(i)}=\operatorname{sinc}^2\left(\frac{Nx_t^{(i)}}{2F}\right)\left|\frac{2}{L}\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\cos\left(\frac{2k\pi\bar\Delta x_t^{(i)}}{\lambda F}\right)\right|^2
$$

12. 结束内层循环。
13. \(t_0\leftarrow\mathrm{CountPeaks}\left(\hat{G}_{\mathrm{BW}}^{(1)},\cdots,\hat{G}_{\mathrm{BW}}^{(R_{\mathrm{BW}})}\right)\)。
14. 结束外层循环。
15. 返回 \(L\)。

作为一个具体例子，图 6 给出实现期望波束聚焦效果所需阵列数 \(L\) 随每个 ULA 天线数 \(N\) 的变化。考虑 \(D_{\mathrm{array}}=2\) m、\(F=30\) m 的 MLA。可以看到：每个 ULA 的天线数越多，所需阵列数越少。这是合理的，因为每个 ULA 中天线更多会减小包络的波束宽度、并缩小相邻 ULA 之间的间隙。例如，当 \(N=64\) 时只需 \(L=2\) 个阵列（与第 III-A 节的分析及图 4 一致）；相反，当每个 ULA 只有一根天线时，实现期望波束聚焦效果需要 \(L=62\)，该构型类似 LSA——即间距大于 \(\lambda/2\) 的 ULA。

整个 MLA 中使用最少天线数 \(NL\) 的构型是 LSA，但 LSA 会遭受栅瓣 [11], [18]，即会意外产生多个达到最大阵列增益的焦点。MLA 避免了这一问题：它虽然也有波纹，但 sinc 包络表明最大阵列增益只在期望位置取得。此外，当考虑定位与信道估计等额外目标时，第 V 节将证明每个 ULA 含多根天线的 MLA 能提供优异性能。需要注意存在复杂度—性能折中，最优平衡随应用而异。

### B. 波束深度分析

下面考虑潜在发射机位于 \((0,0,z_t)\)、MF 聚焦于 \((0,0,F)\) 的情形来分析波束深度。可得式 (35) 中归一化阵列增益表达式如以下推论所示的闭式结果，它是定理 1 的推广。

**推论 1。** 设发射机位于 \((0,0,z_t)\)，含 \(L\) 个 ULA 的 MLA 使用聚焦于 \((0,0,F)\) 的 MF。归一化阵列增益的 Fresnel 近似为

$$
\hat{G}_{L,z_t}=\frac{1}{(LNa)^2}\left(C^2(\sqrt{a})+S^2(\sqrt{a})\right)\times\left(\left(\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\left(C(\beta_1^k)+C(\beta_2^k)\right)\right)^2+\left(\sum_{\substack{k=1\\k\ \mathrm{odd}}}^{L-1}\left(S(\beta_1^k)+S(\beta_2^k)\right)\right)^2\right),\tag{38}
$$

其中 \(\beta_1^k=\sqrt{aN}+\sqrt{\frac{2}{\lambda z_{\mathrm{eff}}}}k\bar\Delta\)，\(\beta_2^k=\sqrt{aN}-\sqrt{\frac{2}{\lambda z_{\mathrm{eff}}}}k\bar\Delta\)，\(a=\frac{\lambda}{8z_{\mathrm{eff}}}\)，\(z_{\mathrm{eff}}=\frac{Fz_t}{|F-z_t|}\)。

**证明：** 把附录 B 中的求和推广到 \(L\) 个 ULA 并按相同步骤进行即可。∎

有限深度波束聚焦是近场传播场景中非常理想的特性，因为它允许在距离域上做空间复用。为演示 MLA 的这一特性，考虑多用户场景：单天线用户位于同一角度方向但距离不同。图 7 用不同颜色给出聚焦于不同距离时的归一化阵列增益。考虑 \(L=4\) 个 ULA、每个含 \(N=16\) 根天线的 MLA。首先画出焦点 \(F=2D_{\mathrm{array}}=2\) m 对应的黄色曲线；接着画出品红色曲线，其焦点设为 \(F=2.74\) m（由黑色竖直虚线标出），约位于黄色曲线的第一个零点；类似地，绿色与蓝色曲线分别把焦点设为其前一条曲线的第一个零点。注意式 (38) 的闭式表达使图 7 中曲线的计算非常高效：选定特定焦点 \(F\) 后，对一组距离域上的 \(z_t\) 取值求值即可。

## V. 定位与信道估计

如前几节所示，近场波束图样同时依赖角度与距离。这一性质可用于用户定位与参数化信道估计，但代价是计算复杂度显著增加：与只需角度搜索的远场不同，近场需要额外的距离域搜索。本节为基于 MLA 的系统提出一种低复杂度定位方法，使定位精度只依赖角度参数即可取得较高水平。定位结果随后用于在近场参数化信道模型基础上估计 MLA 与用户之间的信道。

### A. 用户定位

设在 \(xz\) 平面内用 MLA 定位用户。图 8 给出含 4 个 ULA（每个含 \(N\) 根天线）的 MLA 用户定位场景。MLA 的孔径通常远大于各组成 ULA 的孔径，因此 MLA 的 Fraunhofer 距离显著大于单个 ULA 的 Fraunhofer 距离。例如，考虑工作在 15 GHz 载频、孔径为 2 m 的 MLA，它由 4 个各含 \(N=36\) 根半波长间距阵元的 ULA 组成；此时 MLA 的 Fraunhofer 距离为 400 m，而每个 ULA 仅为 12.96 m。因此，可以假设用户处于 MLA 的近场，但处于每个单独 ULA 的远场。本节提出一种专为该工作区间设计的高效定位方法。

设用户在时刻 \(\tau\) 发送（可能随机的）信号 \(u[\tau]\)。ULA \(\ell\) 在时刻 \(\tau\) 的接收信号为

$$
\mathbf y^{(\ell)}[\tau]=\sqrt{P\beta}\,\mathbf a\!\left(\varphi^{(\ell)}\right)u[\tau]+\mathbf n^{(\ell)}[\tau],\qquad\tau=1,\cdots,T,\tag{39}
$$

其中 \(\mathbf a\!\left(\varphi^{(\ell)}\right)=\left[e^{\mathrm{j}\frac{2\pi}{\lambda}\bar{x}_1^{(\ell)}\cos(\varphi^{(\ell)})},\cdots,e^{\mathrm{j}\frac{2\pi}{\lambda}\bar{x}_N^{(\ell)}\cos(\varphi^{(\ell)})}\right]^T\) 表示经典远场阵列响应向量（脚注 5），\(\bar{x}_n^{(\ell)}\) 由式 (33) 定义；\(\beta=\left(\frac{\lambda}{4\pi d}\right)^2\) 为由 Friis 自由空间路径损耗得到的大尺度信道增益，\(d\) 表示用户到 MLA 中心的距离，\(P\) 为发射功率，\(\mathbf n^{(\ell)}[\tau]\in\mathbb C^N\) 为噪声向量，其各元素服从方差为 \(\sigma^2\) 的独立循环对称复高斯分布。

我们采用 MUSIC 算法（脚注 6）估计每个单独 ULA 与用户之间的角度。MUSIC 算法利用样本协方差矩阵的特征向量结构：

$$
\widehat{\mathbf R}=\frac{1}{T}\sum_{t=1}^{T}\mathbf y^{(\ell)}[\tau]\left(\mathbf y^{(\ell)}[\tau]\right)^H\tag{40}
$$

（该式在长度为 \(T\) 的接收信号区间上计算。）注意接收信号不应是标量，因此要求 MLA 中 \(N>1\)。由于只考虑单用户，构造噪声子空间矩阵 \(\widehat{\mathbf U}_n\in\mathbb C^{N\times(N-1)}\)，其列是 \(\widehat{\mathbf R}\) 对应最小 \((N-1)\) 个特征值的特征向量。角度域上的一维（1D）MUSIC 谱按下式计算 [35]：

$$
S_M(\varphi)=\frac{1}{\mathbf a^H(\varphi)\widehat{\mathbf U}_n\widehat{\mathbf U}_n^H\mathbf a(\varphi)}.\tag{41}
$$

ULA \(\ell\) 的角度估计 \(\hat\varphi^{(\ell)}\) 由 MUSIC 谱中的峰值确定。

随后可把全部 ULA 的角度估计 \(\hat\varphi^{(1)},\cdots,\hat\varphi^{(L)}\) 组合起来，得到用户的精确位置。我们提出基于几何交会的最小二乘估计器：通过求一组方向直线的最小二乘解来确定用户位置；这些直线由已知 ULA 位置处的到达角（angle-of-arrival，AoA）测量导出：

$$
\begin{bmatrix}\hat{x}_t\\ \hat{z}_t\end{bmatrix}
=
\begin{bmatrix}
\tan(\hat\varphi^{(1)}) & -1\\
\vdots & \vdots\\
\tan(\hat\varphi^{(\ell)}) & -1\\
\vdots & \vdots\\
\tan(\hat\varphi^{(L)}) & -1
\end{bmatrix}^{\dagger}
\begin{bmatrix}
\bar{x}^{(1)}\tan(\hat\varphi^{(1)})\\
\vdots\\
\bar{x}^{(\ell)}\tan(\hat\varphi^{(\ell)})\\
\vdots\\
\bar{x}^{(L)}\tan(\hat\varphi^{(L)})
\end{bmatrix},\tag{42}
$$

其中 \(\dagger\) 表示伪逆，\(\hat{x}_t\) 与 \(\hat{z}_t\) 表示用户在 \(xz\) 平面内的坐标估计，\(\bar{x}^{(\ell)}\) 表示 ULA \(\ell\) 中心沿 \(x\) 轴的位置。用户到 MLA 中心（即原点）的距离与角度估计可由笛卡尔坐标到极坐标的变换得到，分别记为 \(\hat{d}_t\) 与 \(\hat\varphi_t\)。需要注意，式 (42) 的最小二乘方法可能产生病态矩阵，使求逆不可靠。这对应于所估计的方向直线不准确、致使交点高度不精确甚至无法确定的情形。此类情形通常出现在噪声主导接收信号时，即极低 SNR 下；这在近场通信环境中不太可能出现。不过，仍可在最小二乘表述中加入正则项，以避免不稳定解、防止估计变得不可接受。

> **原文脚注 5：** 该阵列响应向量表达式仅在用户处于每个 ULA 远场时成立；若用户也位于子阵近场，则需要不同的建模方法。

> **原文脚注 6：** 虽然本文考虑单用户场景，但推广到多用户是直接的，因为 MUSIC 算法本身支持检测多个用户的方向。

需要注意，所提定位算法基于式 (42) 的未加权最小二乘估计器，隐含假设所有子阵提供的 AoA 估计具有相同可靠性。然而实践中，子阵之间可能因孔径大小、SNR 或硬件损伤而存在异质性。因此，该方法的一个自然扩展是采用加权最小二乘，其权重根据各子阵的估计方差或 SNR 选取。

我们将用归一化均方误差（normalized mean square error，NMSE）评估所提定位方法的性能：

$$
\mathrm{NMSE}=\frac{\mathbb E\{\|\hat{\mathbf x}-\mathbf x\|^2\}}{\mathbb E\{\|\mathbf x\|^2\}},\tag{43}
$$

其中 \(\hat{\mathbf x}\) 为 \(\mathbf x\) 的估计。

在图 9 中，MLA 孔径长度设为 2 m，样本数 \(T=100\)，发射功率 \(P=20\) dBm，带宽 400 MHz；噪声功率 \(\sigma^2=-78\) dBm（含 10 dB 噪声系数）。基站阵列位于原点，用户随机取角度 \(\varphi_t\sim\mathcal U(-60^\circ,60^\circ)\)、距离 \(d_t\sim\mathcal U(4\ \mathrm m,40\ \mathrm m)\)；角度域以 0.002 弧度的分辨率离散化。

如图 9(a) 所示，天线数越多，NMSE 性能越好；当 \(N>20\) 时 NMSE 饱和。该饱和源于有限的网格分辨率；若提高分辨率，角度与距离的 NMSE 性能都会进一步改善。注意若取 \(N=1\)（类似 LSA），该定位方法无法执行，因为不存在样本协方差矩阵；角度估计至少需要 \(N=2\) 根天线。复杂度与性能之间存在折中：增加天线或提高网格分辨率会改善定位性能，但会提高计算复杂度。在图 9(b) 中，每个 ULA 的天线数固定为 \(N=16\)，而阵列数 \(L\) 变化；定位性能随 \(L\) 增大而改善，但由于总孔径长度固定，很快饱和。

### B. 信道估计

定位结果可用于估计用户信道。现在考虑 MLA 处的完整接收信号：

$$
\bar{\mathbf y}[\tau]=\sqrt{P\beta}\,\mathbf b(\varphi_t,d_t)u[\tau]+\mathbf n[\tau],\tag{44}
$$

其中近场阵列响应向量为

$$
\mathbf b(\varphi_t,d_t)=\left[e^{-\mathrm{j}\frac{2\pi}{\lambda}d_1^{(1)}},\cdots,e^{-\mathrm{j}\frac{2\pi}{\lambda}d_N^{(1)}},\cdots,e^{-\mathrm{j}\frac{2\pi}{\lambda}d_1^{(L)}},\cdots,e^{-\mathrm{j}\frac{2\pi}{\lambda}d_N^{(L)}}\right]^T,\tag{45}
$$

且 \(d_n^{(\ell)}=\sqrt{d_t^2+\left(\bar{x}_n^{(\ell)}\right)^2-2\bar{x}_n^{(\ell)}d_t\cos(\varphi_t)}\) 表示用户与 ULA \(\ell\) 中天线 \(n\) 之间的距离。由于上一小节已得到用户位置参数的估计 \((\hat\varphi_t,\hat{d}_t)\)，可以估计阵列响应向量 \(\hat{\mathbf b}(\hat\varphi_t,\hat{d}_t)=[\hat{b}_1,\ldots,\hat{b}_{NL}]^T\) 以及大尺度信道增益 \(\beta=\lambda^2/(4\pi d_t)^2\)。于是即可恢复 MLA 与用户之间的信道。

作为基线对比，我们考虑基于二维 MUSIC（2D-MUSIC）的方法。基线 2D-MUSIC 采用集中式联合处理：把所有子阵快拍堆叠为单个协方差矩阵，并使用 MLA 导向向量，把 MLA 视为一个阵列；用户位置由 2D-MUSIC 谱的峰值得到 [31]。该方法的两个维度分别是角度域与距离域。2D-MUSIC 谱为

$$
S_{2M}(\varphi,d)=\frac{1}{\mathbf b^H(\varphi,d)\widehat{\mathbf U}_n\widehat{\mathbf U}_n^H\mathbf b(\varphi,d)}.\tag{46}
$$

通过识别 MUSIC 谱中的峰值得到距离与角度估计，再把估计出的用户位置参数代入信道模型（与所提方法类似），即可确定用户与 MLA 之间的信道。

信道估计最终影响可达频谱效率（SE）。对基于 MF 的合并器，上行 SE 可计算为 \(\mathrm{SE}=\log_2\left(1+\frac{P\beta}{\sigma^2}\left|\frac{\hat{\mathbf h}^H\mathbf h}{\|\hat{\mathbf h}\|}\right|^2\right)\)（脚注 7），其中 \(\hat{\mathbf h}=\hat{\mathbf b}(\hat\varphi,\hat{d})\)。在图 10 中，我们评估所提方法的 SE，并与基于 2D-MUSIC 的信道估计对比。系统设置与图 9 相同。对 2D-MUSIC，角度域采用与所提方法相同的 0.002 弧度分辨率，距离域采用 0.02 米分辨率。当发射功率足够高（例如高于 0 dBm）时，所提方法取得的 SE 与 2D-MUSIC 非常接近；在低 SNR 区间，所提方法与 2D-MUSIC 之间存在轻微差距，这可视为子阵处理带来的性能—复杂度折中。尽管如此，所提方法的 SE 性能接近理想方案（即完美信道状态信息），而相较 2D-MUSIC 基线的计算复杂度降低约三个数量级。总之，所提方法以显著降低的复杂度取得接近最优的性能。

> **原文脚注 7：** 该 SE 表达式假设合并器基于不完美的信道估计，但解调时有效信道 \(\hat{\mathbf h}^H\mathbf h/\|\hat{\mathbf h}\|\) 已知（例如借助解调导频）。

**注 2。** 基于子空间的 AoA 估计在低 SNR 下可能脆弱，且当子阵天线较多时计算量大。波束训练为模块化阵列提供了一种实用替代方案：通过在每个模块中激活一根天线，即可实现多波束训练 [36]。

## VI. 结论

本文对使用 MLA 的近场波束聚焦进行了全面分析。我们指出，相较等长、半波长间距的 ULA，MLA 能以显著更少的天线实现高效波束聚焦，且不受传统稀疏 ULA 所遭受的模糊性（例如栅瓣）影响。具体而言，我们从解析与仿真两方面刻画了波束聚焦行为，考虑的因素包括 ULA 数目、每个 ULA 的天线数以及 MLA 的总孔径长度。为两个 ULA 以及多个 ULA 构成的 MLA 推导出的波束宽度与波束深度解析表达式，为理解 MLA 的波束特性提供了有价值的洞见。

所提 MLA 架构构成 6G 网络的一种新颖基站部署策略：运营商可利用若干正常尺寸的阵列、以数米间距部署在同一屋顶上，从而实现波束聚焦特性。这种方法可视为迈向未来无蜂窝 mMIMO 架构的初步一步——在该架构中，阵列被设想为分布式部署在覆盖区域上。即使用户处于各单独 ULA 的远场，MLA 也能通过组合各 ULA 获得使波束聚焦成为可能的深度感知；这一效果类似于人类用双眼感知深度。我们证明了 MLA 能在角度与距离两方面提供精确定位，并提出一种聚焦于各 ULA 角度估计的定位方法，相较传统方法显著降低了计算复杂度。总体而言，这些结果凸显了 MLA 架构在提高未来基站部署效率方面的潜力。

## 附录 A：引理 1 的证明

由式 (14) 有

$$
\hat{G}_{\mathrm{ULA}}=\frac{1}{(NA)^2}\times\left|\sum_{n=1}^N\int_{\mathcal{A}_n}e^{+\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2z}+\frac{y^2}{2z}\right)}dxdy\right|^2
$$
$$
=\frac{1}{(NA)^2}\times\left|\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{x^2}{2z}+\frac{y^2}{2z}\right)}dydx\right|^2
$$
$$
=\frac{1}{(NA)^2}\left|\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{-\mathrm{j}\frac{2\pi}{\lambda}\frac{(|F-z|)(x^2+y^2)}{2zF}}dydx\right|^2.\tag{47}
$$

定义 \(z_{\mathrm{eff}}=\frac{Fz}{|F-z|}\)，可将表达式改写为

$$
\hat{G}_{\mathrm{ULA}}=\frac{1}{(NA)^2}\left|\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{-\mathrm{j}\frac{\pi}{\lambda}\frac{x^2}{z_{\mathrm{eff}}}}e^{-\mathrm{j}\frac{\pi}{\lambda}\frac{y^2}{z_{\mathrm{eff}}}}dydx\right|^2.\tag{48}
$$

求式 (48) 的原函数可得 [34]

$$
\hat{G}_{\mathrm{ULA}}=\frac{\left(C^2(\sqrt{a})+S^2(\sqrt{a})\right)\left(C^2(\sqrt{aN})+S^2(\sqrt{aN})\right)}{(Na)^2},\tag{49}
$$

其中 \(C(\cdot)\) 与 \(S(\cdot)\) 为 Fresnel 积分，\(a=\frac{\lambda}{8z_{\mathrm{eff}}}\)。证毕。∎

## 附录 B：定理 1 的证明

由式 (22) 有

$$
\hat{G}_{2,z_t}=\frac{1}{(2N\delta^2)^2}\Bigg|
\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x-\bar\Delta)^2}{2z_t}+\frac{y^2}{2z_t}\right)}dxdy
$$
$$
+\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2F}+\frac{y^2}{2F}\right)}e^{-\mathrm{j}\frac{2\pi}{\lambda}\left(\frac{(x+\bar\Delta)^2}{2z_t}+\frac{y^2}{2z_t}\right)}dxdy\Bigg|^2
$$
$$
=\frac{\left|\int_{-\frac{\delta}{2}}^{\frac{\delta}{2}}e^{\mathrm{j}\frac{\pi}{\lambda}\frac{y^2}{z_{\mathrm{eff}}}}dy\left(\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}e^{\mathrm{j}\frac{\pi}{\lambda}\frac{(x-\bar\Delta)^2}{z_{\mathrm{eff}}}}dx+\int_{-\frac{N\delta}{2}}^{\frac{N\delta}{2}}e^{\mathrm{j}\frac{\pi}{\lambda}\frac{(x+\bar\Delta)^2}{z_{\mathrm{eff}}}}dx\right)\right|^2}{(2N\delta^2)^2}.\tag{50}
$$

用 Fresnel 积分求式 (50) 的原函数，得

$$
\hat{G}_{2,z_t}=\frac{1}{(4Na)^2}\left(C^2(\sqrt{a})+S^2(\sqrt{a})\right)\cdot\left(\left(C(\beta_1)-C(-\beta_1)+C(\beta_2)-C(-\beta_2)\right)^2+\left(S(\beta_1)-S(-\beta_1)+S(\beta_2)-S(-\beta_2)\right)^2\right),\tag{51}
$$

其中 \(a\)、\(\beta_1\)、\(\beta_2\) 如定理中所定义。由于 Fresnel 积分函数 \(C(\cdot)\) 与 \(S(\cdot)\) 均为奇函数，可把表达式简化为

$$
\hat{G}_{2,z_t}=\frac{1}{(2Na)^2}\left(C^2(\sqrt{a})+S^2(\sqrt{a})\right)\cdot\left(\left(C(\beta_1)+C(\beta_2)\right)^2+\left(S(\beta_1)+S(\beta_2)\right)^2\right),\tag{52}
$$

证毕。∎

## 图注与表注

**图 1（原文 Fig. 1）：** 由两个相隔 \(\Delta\) 米的 ULA 构成的 MLA。两个 ULA 均聚焦于 \((0,0,F)\)；水平方向为 \(x\) 轴，竖直方向为 \(z\) 轴。

**图 2（原文 Fig. 2）：** 单个 ULA 与 MLA 的波束图样；颜色表示归一化阵列增益，品红色矩形标出 ULA 的位置，红色圆圈标出用户位置，\(z\) 轴采用对数刻度。(a) 单个 ULA；(b) 相隔 5 m 的两个 ULA。

**图 3（原文 Fig. 3）：** 由两个各含 \(N=16\) 根天线的 ULA 构成的 MLA 沿 \(x\) 轴的波束图样。(a) 总孔径长度 \(D_{\mathrm{array}}=1\) m；(b) 总孔径长度 \(D_{\mathrm{array}}=2\) m。

**图 4（原文 Fig. 4）：** 由两个各含 \(N=64\) 根天线的 ULA 构成的 MLA 经波束聚焦取得的归一化阵列增益，焦点为 \((0,0,30)\) m。(a) \(xz\) 平面波束图样；(b) 在 \((x,0,30)\) 处的归一化阵列增益。

**图 5（原文 Fig. 5）：** 每个 ULA 天线数 \(N=64\)、焦点为 \((0,0,30)\) m 时 MLA 的 Fresnel 近似；红色圆圈为精确值，蓝色叉号为 Fresnel 近似结果，可见两者几乎重合。

**图 6（原文 Fig. 6）：** 实现波束聚焦效果所需 ULA 数目随每个 ULA 天线数的变化（\(D_{\mathrm{array}}=2\) m，\(F=30\) m）：天线数越多，所需阵列数越少（\(N=64\) 时仅需 \(L=2\)；每个 ULA 仅一根天线时需 \(L=62\)）。

**图 7（原文 Fig. 7）：** 含 \(L=4\) 个 ULA（每个 \(N=16\) 根天线）、总孔径长度 \(D_{\mathrm{array}}=1\) m 的 MLA 的近场波束聚焦。每种颜色对应不同聚焦位置，焦点依次调整到相邻波束的零点（黄色 \(F=2\) m、品红 \(F=2.74\) m，绿色与蓝色依次取前一条曲线的第一个零点），体现出距离域的空间复用。

**图 8（原文 Fig. 8）：** 由 4 个 ULA 构成的 MLA 的定位示意图；标出用户到各 ULA 的距离 \(d^{(1)},\ldots,d^{(4)}\)、各 ULA 的到达角 \(\varphi^{(1)},\ldots,\varphi^{(4)}\) 以及用户到 MLA 中心的距离 \(d_t\) 与角度 \(\varphi_t\)。

**图 9（原文 Fig. 9）：** 所提定位方法在不同天线数与阵列数下的性能评估；NMSE 分为角度（红色）与距离（蓝色）两项。(a) 阵列数 \(L=4\)；(b) 每个 ULA 天线数 \(N=16\)。

**图 10（原文 Fig. 10）：** 所提方法与 2D-MUSIC 的对比（\(L=4\)、\(N=16\)、\(D_{\mathrm{array}}=2\) m）：所提方法、2D-MUSIC 与完美 CSI 的频谱效率随发射功率的变化；高功率下所提方法接近 2D-MUSIC 与完美 CSI。

> **表注：** 原文没有表格。

## 参考文献（英文原书目）

[1] A. Kosasih, O. T. Demir, and E. Björnson, “Achieving beamfocusing via two separated uniform linear arrays,” in Proc. Asilomar Conf. Signals Syst. Comput., USA, Nov 2024.

[2] E. Björnson, J. Hoydis, and L. Sanguinetti, “Massive MIMO networks: Spectral, energy, and hardware efficiency,” Foundations and Trends in Signal Processing, vol. 11, no. 3-4, pp. 154–655, 2017.

[3] Ericsson, “Ericsson mobility report,” Ericsson, Tech. Rep., Jun 2024. [Online]. Available: http://www.ericsson.com/mobility-report

[4] W. Saad, M. Bennis, and M. Chen, “A vision of 6G wireless systems: Applications, trends, technologies, and open research problems,” IEEE Netw., vol. 34, no. 3, pp. 134–142, June 2020.

[5] A. Pourkabirian, M. S. Kordafshari, A. Jindal, and M. H. Anisi, “A vision of 6G URLLC: Physical-layer technologies and enablers,” IEEE Commun. Std. Mag., vol. 8, no. 2, pp. 20–27, June 2024.

[6] E. Björnson, F. Kara, N. Kolomvakis, A. Kosasih, P. Ramezani, and M. B. Salman, “Enabling 6G performance in the upper mid-band by transitioning from massive to gigantic MIMO,” IEEE Open J. Commun. Soc., vol. 6, pp. 5450–5463, June 2025.

[7] P. Ramezani, A. Kosasih, A. Irshad, and E. Björnson, “Exploiting the depth and angular domains for massive near-field spatial multiplexing,” IEEE BITS the Inf. Theory Mag., vol. 3, no. 1, pp. 14–26, Mar. 2023.

[8] C. A. Balanis, Antenna theory: Analysis and design. John wiley & sons, 2016.

[9] S. Sun, R. Li, C. Han, X. Liu, L. Xue, and M. Tao, “How to differentiate between near field and far field: revisiting the Rayleigh distance,” IEEE Commun. Mag., vol. 63, no. 1, pp. 22–28, Jan. 2025.

[10] E. Björnson, Ö. T. Demir, and L. Sanguinetti, “A primer on near-field beamforming for arrays and reconfigurable intelligent surfaces,” in Proc. IEEE 55th Asilomar Conf. on Signal, Syst., and Comput., USA, Nov. 2021, pp. 105–112.

[11] S. Yang, W. Lyu, Z. Zhang, and C. Yuen. (2023) Enhancing near-field sensing and communications with sparse arrays: Potentials, challenges, and emerging trends. Preprint, arXiv:2309.08681. [Online]. Available: https://arxiv.org/abs/2309.08681

[12] X. Li et al., “Sparse MIMO for ISAC: New opportunities and challenges,” IEEE Wireless Commun., vol. 32, no. 4, pp. 170–178, Aug. 2025.

[13] H. Wang and Y. Zeng, “Can sparse arrays outperform collocated arrays for future wireless communications?” in Proc. IEEE Globecom Workshops, Malaysia, Dec. 2023, pp. 667–672.

[14] K. Chen, C. Qi, G. Y. Li, and O. A. Dobre, “Near-field multiuser communications based on sparse arrays,” IEEE J. Sel. Top. Signal Process., vol. 18, no. 4, pp. 619–632, May 2024.

[15] J. Jeon et al., “MIMO evolution toward 6G: Modular massive MIMO in low-frequency bands,” IEEE Commun. Mag., vol. 59, no. 11, pp. 52–58, Nov. 2021.

[16] H. Wang and Y. Zeng, “Can sparse arrays outperform collocated arrays for future wireless communications?” in IEEE Globecom Workshops, 2023, pp. 667–672.

[17] C. Zhou, C. You, H. Zhang, L. Chen, and S. Shi, “Sparse array enabled near-field communications: Beam pattern analysis and hybrid beamforming design,” IEEE Trans. on Wireless Commun., Early Access 2025.

[18] E. Björnson and Ö. T. Demir, Introduction to multiple antenna communications and reconfigurable surfaces. Now Publishers, Inc., 2024.

[19] X. Li, Z. Dong, Y. Zeng, S. Jin, and R. Zhang, “Multi-user modular XL-MIMO communications: Near-field beam focusing pattern and user grouping,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13 766–13 781, Oct. 2024.

[20] O. T. Demir, E. Björnson, and L. Sanguinetti, “Foundations of user-centric cell-free massive MIMO,” Foundations and Trends in Signal Processing, vol. 14, 2021.

[21] C. Meng, D. Ma, X. Chen, Z. Feng, and Y. Liu, “Cramér–Rao bounds for near-field sensing: A generic modular architecture,” IEEE Wireless Commun. Lett., vol. 13, no. 8, pp. 2205–2209, Aug. 2024.

[22] X. Li, H. Lu, Y. Zeng, S. Jin, and R. Zhang, “Near-field modeling and performance analysis of modular extremely large-scale array communications,” IEEE Commun. Lett., vol. 26, no. 7, pp. 1529–1533, Jul. 2022.

[23] X. Li, Z. Dong, Y. Zeng, and Y. Li, “Codebook design and beam training for multi-user modular XL-MIMO communications: From far-field to near-field,” IEEE Trans. on Commun., Early Access 2025.

[24] C. Meng, D. Ma, Z. Wang, Y. Liu, Z. Wei, and Z. Feng, “Near-field hybrid beamforming design for modular XL-MIMO ISAC systems,” IEEE Trans. on Commun., Early Access 2025.

[25] X. Song, W. Rave, N. Babu, S. Majhi, and G. Fettweis, “Two-level spatial multiplexing using hybrid beamforming for millimeter-wave backhaul,” IEEE Trans. on Wireless Commun., vol. 17, no. 7, pp. 4830–4844, July 2018.

[26] L. Yan, Y. Chen, C. Han, and J. Yuan, “Joint inter-path and intra-path multiplexing for terahertz widely-spaced multi-subarray hybrid beamforming systems,” IEEE Trans. on Commun., vol. 70, no. 2, pp. 1391–1406, Feb. 2022.

[27] S. Yang, X. Chen, Y. Xiu, W. Lyu, Z. Zhang, and C. Yuen, “Performance bounds for near-field localization with widely-spaced multi-subarray mmWave/THz MIMO,” IEEE Trans. on Wireless Commun., vol. 23, no. 9, pp. 10 757–10 772, Sept. 2024.

[28] M. Haghshenas, A. Mahmood, and M. Gidlund. (2025) Efficient multi-source localization in near-field using only angular domain MUSIC. [Online]. Available: https://arxiv.org/abs/2501.11460

[29] H. Chen, M. F. Keskin, A. Sakhnini, N. Decarli, S. Pollin, D. Dardari, and H. Wymeersch, “6G localization and sensing in the near field: Features, opportunities, and challenges,” IEEE Wireless Communications, vol. 31, no. 4, pp. 260–267, 2024.

[30] A. Kosasih, Ö. T. Demir and E. Björnson, “Parametric near-field channel estimation for extremely large aperture arrays,” in Proc. IEEE 57th Asilomar Conf. on Signal, Syst., and Comput., USA, Oct. 2023, pp. 162–166.

[31] P. Ramezani, Ö. T. Demir, E. Björnson. (2024) Localization in massive MIMO networks: From near-field to far-field. [Online]. Available: https://arxiv.org/abs/2402.07644, preprint.

[32] A. Kosasih and E. Björnson, “Finite beam depth analysis for large arrays,” IEEE Trans. on Wireless Commun, vol. 23, no. 8, pp. 10 015–10 029, Aug. 2024.

[33] E. Björnson and L. Sanguinetti, “Power scaling laws and near-field behaviors of massive MIMO and intelligent reflecting surfaces,” IEEE Open J. of the Commun. Soc., vol. 1, pp. 1306–1324, Sept. 2020.

[34] C. Polk, “Optical Fresnel-zone gain of a rectangular aperture,” IRE Trans. Antennas Propag., vol. 4, no. 1, pp. 65–69, Jan. 1956.

[35] P. Stoica and R. L. Moses, Spectral Analysis of Signals. Upper Saddle River: Prentice-Hall, 2005.

[36] C. Zhou, C. You, Z. Huang, S. Shi, Y. Gong, C.-B. Chae, and K. Huang, “Multi-beam training for near-field communications in high-frequency bands,” arXiv preprint arXiv:2406.14931, 2024.

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VI 节全部正文与子节、注 1–2、全部 6 条脚注（以块引形式随文注出）、式 (1)–(52) 与 SE 表达式、算法 1、图 1–10 图注、附录 A–B（引理 1 与定理 1 的完整证明推导）、参考文献 [1]–[36]（英文原条目、按原编号）。原文没有表格，故"图注与表注"中注明"原文没有表格"。原文第 15 页末至第 16 页为作者简介，按仓库规则不属于正文，未逐段翻译并在范围段说明。逐句逐式终校未做；式 (14)、(19)–(23)、(35)–(38)、(50) 等长公式均由 PDF 渲染页逐式核对转写，其中式 (17) 的 \(\bar\Delta\)、式 (33) 的一般 \(L\) 位置表达式与算法 1 的步骤按渲染页原样录入。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
