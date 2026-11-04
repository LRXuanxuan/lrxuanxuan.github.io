---
layout: page
title: "AFDM 信道参数估计：利用移位性质与输入输出关系｜中文全文译文"
permalink: /papers/translations/2026-11-04-2610-11758-afdm-channel-parameter-estimation-shift-properties/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/04fa65dc9dd5428c/) · [原文 arXiv](https://arxiv.org/abs/2610.11758/) · [全部目录](/papers/catalog/)

# AFDM 信道参数估计：利用移位性质与输入输出关系

**原题：** AFDM Channel Parameter Estimation: Exploiting its Shift Properties and Input-Output Relationship  
**作者：** Jialiang Zhu、Zeping Sui、Zilong Liu、Arman Farhang（按 PDF 原文转写）  
**作者单位（PDF 第 1 页）：** \(\ast\) 爱尔兰都柏林圣三一学院（Trinity College Dublin）电子与电气工程系（Department of Electronic & Electrical Engineering）；\(\dagger\) 英国埃塞克斯大学（University of Essex）计算机科学与电子工程系（School of Computer Science and Electronic Engineering）。邮箱：`zhuj3@tcd.ie`、`zepingsui@outlook.com`、`zilong.liu@essex.ac.uk`、`arman.farhang@tcd.ie`。  
**版本：** arXiv:2610.11758v1（PDF 首页 arXiv 戳：arXiv:2610.11758v1 [eess.SP]，8 Oct 2026）；7 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、索引词、正文第 I–VII 节及全部小节（含 §III-A–B 移位性质、§IV-A–D 估计与 SIC 流程、§V 复杂度、§VI 与图 2–7）、式 (1)–(35) 编号、算法 1 逐行、图 1–7 图注、参考文献 [1]–[13] 英文原条目；许可：CC BY 4.0。原文无表格、无附录。逐句逐式终校未做。

**资助与许可声明（原文第 1 页脚注）：** Jialiang Zhu 与 Arman Farhang 的工作由 Research Ireland 资助（项目号 18/CRT/6222 与 24/US/4013），并得到欧盟“地平线欧洲”（Horizon Europe）研究与创新计划资助的 MULTIPLY-6G 项目支持（Grant Agreement No. 101293106）。Zilong Liu 与 Zeping Sui 的工作部分由英国工程与物理科学研究理事会（EPSRC）资助（项目号 EP/Y037243/1、EP/X040569/1、EP/X035352/1、EP/Y000986/1），并部分由英国皇家学会（Royal Society）资助（项目号 IEC\NSFC\233292 与 IES\R1\241212）。为开放获取（Open Access）之目的，作者已对本投稿所产生的任何作者接受稿（Author Accepted Manuscript）版本适用 CC BY 公共版权许可。

## 摘要

仿射频分复用（affine frequency division multiplexing，AFDM）凭借其优异的后向兼容性、全分集可达性以及对高多普勒与各类硬件损伤的强鲁棒性，已受到广泛关注。然而，现有 AFDM 信道参数估计方法要么需要较大的导频开销，要么依赖计算密集的网格搜索方法。本文通过利用 AFDM 固有的移位性质，提出一种**网格搜索无关**、**低开销**、基于**冲激导频**（impulse pilot）的 AFDM 系统信道参数估计方法。具体而言，我们证明：多普勒频移对冲激导频的作用，等价于时域中带相位旋转的时延移位；此外，时延与多普勒频移都会导致仿射域中的循环移位。通过在时域与仿射域中同时利用这些性质，可构造两个线性方程来估计每条路径的整数时延与整数多普勒。多普勒的分数部分则利用 AFDM 输入输出关系，由冲激导频周围由多普勒引起的泄漏估计得到。对于多径信道，我们构建了连续干扰消除（successive interference cancellation，SIC）框架：先估计最强的传播路径，重建并消除其贡献，再依次估计其余路径。仿真结果表明，与基准方法相比，所提方法显著降低了计算复杂度，并允许更低的导频开销；同时取得更好的信道参数估计与完整信道估计精度，以及更低的误码率（bit error rate，BER）。

**索引词（Index Terms）：** AFDM、信道估计、冲激导频。

## I. 引言

未来第六代（6G）无线通信系统预计将在无人机（unmanned aerial vehicle，UAV）、高速列车与低地球轨道（low-Earth-orbit，LEO）卫星通信等多样应用场景中，于高度动态的无线信道上支持可靠的高移动性通信与通感一体化（integrated sensing and communications，ISAC）[1]。在这些应用中，传统正交频分复用（orthogonal frequency-division multiplexing，OFDM）因大多普勒与快速变化信道所引入的强子载波间干扰而难以胜任。

在此背景下，仿射频分复用（AFDM）近来作为面向高移动性信道的候选波形而出现 [2]–[4]。基于离散仿射傅里叶变换（discrete affine Fourier transform，DAFT），AFDM 建立了无线信道的仿射时延—多普勒表示，其中每条传播路径被转换为仿射域中的一次移位 [5]。通过恰当选择后啁啾（post-chirp）参数 \(c_1\)，不同时延—多普勒对所对应的有效信道元素可占据仿射域中的不同位置 [2]。因此，AFDM 能够无歧义地辨识相关信道参数。

作为每个相干通信系统的基本需求，信道估计直接决定后续数据检测的性能。然而，现有 AFDM 信道参数估计方法通常受制于高导频开销或高计算复杂度。[6] 中最初的 AFDM 信道估计方案采用嵌入保护符号的冲激导频。虽然该方法提供了可靠的信道参数估计，但较大的保护区域带来了显著的导频开销。为此，[7] 的作者提出了一种无保护（guard-free）的冲激导频方案。[8] 中同样构想了一种消除保护区域的叠加导频（superimposed pilot）设计。尽管这两种方法都能降低导频开销，但为确保可靠信道估计，导频功率通常需要比数据符号高 20 dB 以上。结果，分配给数据部分的发射功率减少，从而降低整体数据检测性能。为降低估计复杂度，[9] 提出了面向 AFDM 的基于基扩展模型（basis expansion model，BEM）辅助的信道估计。然而，其方法需要两个冲激导频，导致保护开销加倍。[10] 中的离网格（off-grid）稀疏贝叶斯学习（sparse Bayesian learning，SBL）方法在常规的网格化时延—多普勒搜索之后进行多普勒细化。尽管如此，SBL 细化所需的期望最大化（expectation-maximization，EM）会显著增加计算复杂度。

鉴于 AFDM 信道估计中的上述挑战，本文贡献总结如下：

- 我们提出一种面向 AFDM 系统、使用冲激导频的信道参数估计技术。所提方法利用 AFDM 在时域与仿射域中固有的时延与多普勒移位性质，从而高效估计整数时延与整数多普勒。
- 我们基于 AFDM 输入输出关系，利用冲激导频周围由多普勒引起的泄漏，提出一种分数多普勒估计技术。由于所提技术不依赖网格搜索，其计算复杂度显著更低。
- 对于多径信道，我们引入迭代连续干扰消除（SIC）框架：先估计、重建并消除最强传播路径，再对剩余路径依次施加同一流程。

仿真结果表明，与峰值选择（peak selection）以及基于正交匹配追踪（orthogonal matching pursuit，OMP）的基准相比，所提信道参数估计技术取得更好的信道估计精度与更优的 BER 性能，且允许更低的导频开销。

**记号说明：** 标量、向量与矩阵分别用常规小写、粗体小写与粗体大写字母表示。上标 \((\cdot)^{H}\) 与 \((\cdot)^{T}\) 分别表示 Hermitian 与转置运算。\(\mathbf I_N\) 为 \(N\) 阶单位矩阵，\(\mathbf 0_{M\times N}\) 为 \(M\times N\) 的全零矩阵。\(\delta[\cdot]\) 为 Dirac 冲激函数。\(((\cdot))_N\) 表示模 \(N\) 运算。

## II. 仿射频分复用

在 AFDM 中，复数值数据符号被置于 DAFT 域。DAFT 域符号随后经逆 DAFT（IDAFT）映射到时域。考虑 \(N\) 个啁啾子载波，以及包含零均值、单位功率独立同分布（i.i.d.）正交幅度调制（quadrature amplitude modulated，QAM）数据符号的向量 \(\mathbf x\)，时域信号表示为

$$
\mathbf s=\mathbf A^{H}\mathbf x,\tag{1}
$$

其中 \(\mathbf A=\boldsymbol\Lambda_{c_2}\mathbf F_N\boldsymbol\Lambda_{c_1}\) 为 DAFT 矩阵，\(c_1\)、\(c_2\) 分别为后啁啾与预啁啾（pre-chirp）参数。此外，\(\boldsymbol\Lambda_c=\operatorname{diag}\{e^{-j2\pi cn^{2}},n=0,1,\ldots,N-1\}\) 为啁啾参数为 \(c\) 的对角啁啾矩阵，\(\mathbf F_N\) 为归一化 \(N\) 点离散傅里叶变换（DFT）矩阵。为缓解多径信道引起的符号间干扰（inter-symbol interference），在每个 AFDM 符号前添加啁啾周期前缀（chirp-periodic prefix，CPP）。所得信号可表示为

$$
\mathbf s_{\mathrm{cpp}}=\mathbf A_{\mathrm{cpp}}\mathbf s,\tag{2}
$$

其中 \(\mathbf A_{\mathrm{cpp}}=\left[(\boldsymbol\Omega\mathbf G_{\mathrm{cpp}})^{T},\mathbf I_N^{T}\right]^{T}\) 为 CPP 添加矩阵。这里 \(\boldsymbol\Omega=\operatorname{diag}\{e^{-j2\pi c_1(N^{2}+2N\ell)},\ell=-L_{\mathrm{cpp}},\ldots,-1\}\)，\(L_{\mathrm{cpp}}\) 为 CPP 长度，其取值应超过时延扩展。\(L_{\mathrm{cpp}}\times N\) 矩阵 \(\mathbf G_{\mathrm{cpp}}\) 由单位矩阵 \(\mathbf I_N\) 的最后 \(L_{\mathrm{cpp}}\) 行构成。

AFDM 信号经过包含 \(P\) 条传播路径的时变信道后，接收信号为

$$
\mathbf r_{\mathrm{cpp}}=\mathbf H\mathbf s_{\mathrm{cpp}}+\mathbf w,\tag{3}
$$

其中 \(\mathbf H=\sum_{p=0}^{P-1}h_p\tilde{\boldsymbol\Delta}^{\nu_p}\mathbf L^{l_p}\) 为时域信道矩阵，\(h_p\)、\(\nu_p\) 与 \(l_p\) 分别表示第 \(p\) 条路径的复数值路径增益、归一化多普勒频移与归一化时延。\(\tilde{\boldsymbol\Delta}^{\nu_p}=\operatorname{diag}\{e^{j2\pi\frac{\nu_p}{N}n},n=-L_{\mathrm{cpp}},\ldots,N-1\}\) 表示由 \(\nu_p\) 引起的多普勒相位旋转。方阵 \(\mathbf L^{l_p}\) 的元素为 \(L^{l_p}[m,n]=\delta[m-(n+l_p)]\)（\(m,n=0,\ldots,N+L_{\mathrm{cpp}}-1\)），表示 \(l_p\) 个采样的线性时间移位。最后，\(\mathbf w\sim\mathcal{CN}(\mathbf 0,\sigma_w^{2}\mathbf I_N)\) 为方差为 \(\sigma_w^{2}\) 的复加性白高斯噪声（additive white Gaussian noise，AWGN）。

在接收端，首先移除 CPP，即

$$
\mathbf r=\mathbf R_{\mathrm{cpp}}\mathbf r_{\mathrm{cpp}}=\bar{\mathbf H}\mathbf s+\bar{\mathbf w},\tag{4}
$$

其中 \(\mathbf R_{\mathrm{cpp}}=[\mathbf 0_{N\times L_{\mathrm{cpp}}},\mathbf I_N]\) 为 CPP 移除矩阵。移除 CPP 后所得信道矩阵为

$$
\bar{\mathbf H}=\mathbf R_{\mathrm{cpp}}\mathbf H\mathbf A_{\mathrm{cpp}}=\sum_{p=0}^{P-1}h_p\boldsymbol\Gamma_{\mathrm{CPP}_p}\boldsymbol\Delta^{\nu_p}\boldsymbol\Pi^{l_p},\qquad
\boldsymbol\Gamma_{\mathrm{CPP}_p}=\operatorname{diag}\left(\begin{cases}e^{-j2\pi c_1\left(N^{2}-2N(l_p-n)\right)},&n<l_p,\\1,&n\ge l_p,\end{cases}\right),\tag{5}
$$

第 \(i\) 条路径的多普勒移位矩阵为 \(\boldsymbol\Delta^{\nu_i}=\operatorname{diag}\{e^{j2\pi\frac{\nu_i}{N}n},n=0,\ldots,N-1\}\)，\(\boldsymbol\Pi\) 表示单位循环移位矩阵，其元素为 \(\Pi[m,n]=\delta[m-((n+1))_N]\)（\(m,n=0,\ldots,N-1\)）。移除 CPP 后的噪声向量为 \(\bar{\mathbf w}=\mathbf R_{\mathrm{cpp}}\mathbf w\)。接收信号随后经 DAFT 变换到仿射域：

$$
\mathbf y=\mathbf A\mathbf r=\mathbf A\bar{\mathbf H}\mathbf A^{H}\mathbf x+\mathbf A\bar{\mathbf w}=\mathbf H_{\mathrm{eff}}\mathbf x+\tilde{\mathbf w},\tag{6}
$$

其中 \(\mathbf H_{\mathrm{eff}}=\mathbf A\bar{\mathbf H}\mathbf A^{H}\) 与 \(\tilde{\mathbf w}=\mathbf A\bar{\mathbf w}\) 分别表示有效信道与噪声项。由于 \(\mathbf A\) 为酉矩阵，噪声的统计特性与功率在仿射域中保持不变，即 \(\tilde{\mathbf w}\sim\mathcal{CN}(\mathbf 0,\sigma_w^{2}\mathbf I_N)\)。最后，发射数据符号可用线性最小均方误差（linear minimum mean square error，LMMSE）均衡估计，即

$$
\hat{\mathbf x}=\left(\mathbf H_{\mathrm{eff}}^{H}\mathbf H_{\mathrm{eff}}+\sigma_w^{2}\mathbf I_N\right)^{-1}\mathbf H_{\mathrm{eff}}^{H}\mathbf y.\tag{7}
$$

## III. 时域与频域移位对 AFDM 的影响

本节研究时延与多普勒频移对 AFDM 的影响。对于仿射域冲激导频，由多普勒引起的频率移位在时域上表现为带相位旋转的移位——这是一个有趣的观察。此外，定时偏移会导致仿射域中带相位旋转的移位。这些性质为第 IV 节所提信道参数估计技术奠定了基础。

### A. 时域中多普勒频移的影响

离散时域 AFDM 信号可写为

$$
s[n]=\frac{1}{\sqrt{N}}\sum_{m=0}^{N-1}x[m]e^{j2\pi\left(c_1n^{2}+\frac{nm}{N}+c_2m^{2}\right)},\quad n=0,\ldots,N-1.\tag{8}
$$

假设发送信号 \(\mathbf x_p\) 仅在子载波索引 \(m_p\) 处包含冲激导频，即 \(x_p[m]=\sqrt{\rho}\,\delta[m-m_p]\)，其中 \(\rho\) 为冲激导频的功率。则时域冲激导频变为

$$
s_p[n]=A\,e^{j\pi\mu\frac{n^{2}}{N}}e^{j2\pi\frac{m_pn}{N}},\tag{9}
$$

其中 \(\mu=2Nc_1\)，\(A=\sqrt{\rho}N e^{j2\pi c_2m_p^{2}}\)。若对 \(s_p[n]\) 施加归一化多普勒频移 \(\varepsilon\)，则

$$
s_1[n]=s_p[n]e^{j2\pi\frac{\varepsilon n}{N}}=A\,e^{j\pi\mu\frac{n^{2}}{N}}e^{j2\pi\frac{(m_p+\varepsilon)n}{N}}.\tag{10}
$$

假设 \(s_2[n]\) 为 \(s_p[n]\) 的 \(d_1\) 采样移位版本，则

$$
\begin{aligned}
s_2[n]&=s_p[((n-d_1))_N]=A\,e^{j\pi\mu\frac{(n-d_1)^{2}}{N}}e^{j2\pi\frac{m_p(n-d_1)}{N}}\\
&=A\,e^{-j2\pi\frac{d_1}{N}\left(m_p-\frac{\mu d_1}{2}\right)}e^{j\pi\mu\frac{n^{2}}{N}}e^{j2\pi\frac{(m_p-\mu d_1)n}{N}}.
\end{aligned}\tag{11}
$$

可以观察到，除 (11) 中的常数相位项 \(e^{-j2\pi\frac{d_1}{N}\left(m_p-\frac{\mu d_1}{2}\right)}\) 外，(10) 与 (11) 具有相同形式。因此，当 \(((m_p+\varepsilon))_N\equiv((m_p-\mu d_1))_N\) 时，\(s_1[n]\) 等价于 \(s_p[n]\) 经常数相位与 \(d_1\) 个采样循环移位后的结果。我们进一步可得

$$
((\varepsilon))_N\equiv((-\mu d_1))_N.\tag{12}
$$

因此，时域中受多普勒影响的冲激导频信号 \(s_1[n]\) 可视为冲激导频信号 \(s_p[n]\) 经循环移位后的版本（附加常数相位）：

$$
s_1[n]=e^{j2\pi\frac{d_1}{N}\left(m_p-\frac{\mu d_1}{2}\right)}s_p[((n-d_1))_N].\tag{13}
$$

### B. 仿射域中定时偏移的影响

我们首先回顾 (11) 中给出的、带 \(d_1\) 采样移位的时域冲激导频表达式。把 \(s_2[n]\) 变换到仿射域，有

$$
\begin{aligned}
S_2[k]&=\frac{1}{\sqrt{N}}\sum_{n=0}^{N-1}A'\,e^{j2\pi c_1n^{2}}e^{j2\pi\frac{m_p-\mu d_1}{N}n}e^{-j2\pi\left(c_1n^{2}+\frac{nk}{N}+c_2k^{2}\right)}\\
&=\frac{A'}{\sqrt{N}}e^{-j2\pi c_2k^{2}}\sum_{n=0}^{N-1}e^{j2\pi\frac{n(m_p-\mu d_1-k)}{N}},
\end{aligned}\tag{14}
$$

其中 \(A'=A\,e^{-j2\pi\frac{d_1}{N}\left(m_p-\frac{\mu d_1}{2}\right)}\)。基于 DFT 正交性，可导出 \(\sum_{n=0}^{N-1}e^{j2\pi\frac{n(m_p-\mu d_1-k)}{N}}=N\delta\left[k-((m_p-\mu d_1))_N\right]\)。因此，(14) 可重写为

$$
S_2[k]=A'\sqrt{N}\,e^{-j2\pi c_2k^{2}}\delta\left[k-((m_p-\mu d_1))_N\right].\tag{15}
$$

\(S_2[k]\) 的唯一非零值位于 \(k=((m_p-\mu d_1))_N\)，这表明导频仍保持冲激性质，其位置为 \(((m_p-\mu d_1))_N\)（原文此处第二个位置写作 \(((m_p-\mu d_2))_N\)，其中 \(d_2\) 未定义，疑为笔误；按上下文应为 \(d_1\)），且其复幅度被施加了一个额外的相位因子。

因此，时延与多普勒频移会同时在时域与仿射域中产生移位。路径时延导致冲激导频在仿射域中的循环位移以及依赖于时延的相位旋转。类似地，多普勒频移导致时域中的循环移位以及依赖于多普勒的相位旋转。这些关系与线性正则变换（linear canonical transform，LCT）的移位性质密切相关——在 LCT 中，时间平移与频率调制对应于坐标位移与相位旋转。这凸显了基于啁啾的 AFDM 波形背后的 LCT 结构 [11]。

## IV. 所提信道参数估计

本节提出一种使用冲激导频的信道参数估计技术。所提技术首先通过估计最强传播路径的整数时延与多普勒频移来辨识该路径。随后估计分数多普勒频移，再通过求解最小二乘（least-squares，LS）问题估计相应的路径增益。接着重建已辨识路径的贡献，并将其从接收信号中减去。该过程在残余信号上重复，直至找到全部路径参数。¹

¹ 假设采样率足够高，路径时延被建模为整数值，而多普勒频移由整数部分与分数部分组成。我们进一步假设传播路径数可先验已知。

**图 1（原文 Fig. 1）：** AFDM 帧结构 [6]。子载波按循环意义排列：索引 0 处为幅度 \(\sqrt{\rho}\) 的冲激导频，其右侧紧接 \(Q/2\) 个保护零符号，帧末尾再有 \(Q/2\) 个保护零符号（与索引 0 循环相邻）；导频区 \(\mathcal P\) 共 \(Q+1\) 个符号（1 个导频 + \(Q\) 个保护符号），导频功率 \(\rho=Q+1\) 以保证单位平均发射功率；其余子载波承载数据符号 \(d\)，构成数据区 \(\mathcal D\)。

采用 [6] 中的 AFDM 帧设计，如图 1 所示。AFDM 子载波网格被划分为导频区与数据区，分别由互斥的索引集 \(\mathcal P\) 与 \(\mathcal D\) 定义。为确保单位发射信号功率，导频功率设为 \(\rho=Q+1\)。

### A. 整数时延与多普勒估计

所提信道估计以迭代方式寻找路径参数：每次迭代中，我们求出主路径的参数，而其余路径则被吸收到噪声中。考虑估计第 \(i\) 条路径，其由时延 \(l_i\) 与多普勒频移 \(\nu_i=\alpha_i+a_i\) 表征，其中 \(\alpha_i\) 为归一化多普勒频移的整数部分，\(a_i\) 为多普勒频移的分数部分且 \(-0.5<a_i\le0.5\)。当冲激导频经过信道时，多普勒频移会导致时域中与路径时延相叠加的时延移位，而仿射域中也会观察到相同的效应。因此，计算接收信号 \(\mathbf r\) 与发送导频信号 \(\mathbf s_p\) 之间的互相关时，主相关峰出现在样本索引 \(n_{1,i}\) 处，对应最强传播路径。相关函数为 \(c[n]=\left|\left\langle\mathbf r,\mathbf s_p^{(n)}\right\rangle\right|\)，其中 \(\mathbf s_p^{(n)}\) 表示 \(\mathbf s_p\) 循环移位 \(n\) 个采样后的版本。根据第 III 节导出的移位性质，峰值在时域中的位置可表示为

$$
n_{1,i}=((l_i+d_i))_N,\tag{16}
$$

其中 \(d_i\) 为由多普勒频移 \(\alpha_i\) 引起的时域移位。我们进一步可得 \(((d_i))_N=((n_{1,i}-l_i))_N\)；若把 \(d_i\) 代入 (12)，则有

$$
((\alpha_i))_N=\left(\left(-\mu((n_{1,i}-l_i))_N\right)\right)_N.\tag{17}
$$

对接收信号 \(\mathbf r\) 施加 DAFT，对应最强路径的峰可在仿射域中位置 \(n_{2,i}\) 处观测到，即

$$
n_{2,i}=((m_p-\mu l_i+\alpha_i))_N.\tag{18}
$$

整数时延与多普勒参数利用 (17) 与 (18) 联合估计。具体地，整数时延候选 \(l_i\) 在 \(0\le l_i\le l_{\max}\) 范围内搜索，其中 \(l_{\max}\) 为最大时延移位。对每个时延候选，用 (17) 计算相应的多普勒索引 \(\alpha_i\)。若候选对 \((\hat l_i,\hat\alpha_i)\) 满足 (18)，则接受该候选。与仅依赖每个时延—多普勒对在仿射域中无歧义位置的常规估计方法 [8]、[12] 不同，所提方法同时利用时域与仿射域中的移位性质。因此，即使时延—多普勒引起的仿射域移位超过 AFDM 块长度 \(N\) 并按模 \(N\) 回绕，所提技术仍然适用。

### B. 分数多普勒估计

考虑 [6] 中的 AFDM 输入输出关系，(6) 中向量 \(\mathbf y\) 的元素由下式给出：

$$
\begin{aligned}
y[k]=&\sum_{p=0}^{P-1}\frac{1}{N}h_pe^{j2\pi c_1l_p^{2}}\sum_{q=((k+\mathrm{loc}_p-k_\nu))_N}^{((k+\mathrm{loc}_p+k_\nu))_N}e^{j\frac{2\pi}{N}\left(-ql_p+Nc_2(q^{2}-k^{2})\right)}\\
&\times\frac{e^{j2\pi(k-q+a_p+\mathrm{loc}_p)}-1}{e^{j\frac{2\pi}{N}(k-q+a_p+\mathrm{loc}_p)}-1}x[q]+\tilde w[k],
\end{aligned}\tag{19}
$$

其中 \(k=0,\ldots,N-1\)，\(\mathrm{loc}_p\triangleq((\alpha_p+2Nc_1l_p))_N\) 表示在发送导频位于 \(m_p=0\)（即 \(x[q]=\sqrt{\rho}\,\delta[q]\)）时，来自路径 \(p\) 的接收导频的近似位置。把除最强路径 \(i\) 之外的所有路径的贡献视为干扰，输入输出关系化简为

$$
y[k]=\frac{\sqrt{\rho}}{N}h_ie^{j2\pi\left(c_1l_i^{2}-c_2k^{2}\right)}\frac{e^{j2\pi(k+a_i+\mathrm{loc}_i)}-1}{e^{j\frac{2\pi}{N}(k+a_i+\mathrm{loc}_i)}-1}+\eta[k],\tag{20}
$$

其中

$$
\eta[k]=\sum_{p=0,\,p\neq i}^{P-1}\frac{\sqrt{\rho}}{N}h_pe^{j2\pi\left(c_1l_p^{2}-c_2k^{2}\right)}\frac{e^{j2\pi(k+a_p+\mathrm{loc}_p)}-1}{e^{j\frac{2\pi}{N}(k+a_p+\mathrm{loc}_p)}-1}+\tilde w[k]
$$

包含来自其他路径的干扰与信道噪声。为简化后续推导，噪声与干扰项 \(\eta[k]\) 被忽略；不过在仿真结果中，噪声与干扰均被计入。利用 \(\left|e^{j\theta}-1\right|=2\left|\sin\left(\frac{\theta}{2}\right)\right|\) 以及（由于 \(k+\mathrm{loc}_i\) 为整数）\(\left|\sin(\pi(k+a_i+\mathrm{loc}_i))\right|=\left|\sin(\pi a_i)\right|\)，\(y[k]\) 的绝对值可近似为

$$
|y[k]|=\frac{|h_i|\sqrt{\rho}}{N}\frac{\left|\sin(\pi a_i)\right|}{\left|\sin\left(\frac{\pi}{N}(k+a_i+\mathrm{loc}_i)\right)\right|}.\tag{21}
$$

由于整数时延与整数多普勒已在前一节估计，故 \(\hat{\mathrm{loc}}_i=\left(\left(\hat\alpha_i+2Nc_1\hat l_i\right)\right)_N\) 已知。考虑 \(k_c=\left(\left(-\hat{\mathrm{loc}}_i\right)\right)_N\)，有 \(\left(\left(k_c+\hat{\mathrm{loc}}_i\right)\right)_N=0\)。由于对 \(a_i\in(-0.5,0.5]\) 有 \(\left|\sin\left(\frac{\pi a_i}{N}\right)\right|=\sin\left(\frac{\pi|a_i|}{N}\right)\)，故

$$
|y[k_c]|=\frac{|h_i|\sqrt{\rho}}{N}\frac{\left|\sin(\pi a_i)\right|}{\sin\left(\frac{\pi|a_i|}{N}\right)}.\tag{22}
$$

对 \(k_c\) 的左邻居 \(k_l=\left(\left(-\hat{\mathrm{loc}}_i-1\right)\right)_N\)，有

$$
|y[k_l]|=\frac{|h_i|\sqrt{\rho}}{N}\frac{\left|\sin(\pi a_i)\right|}{\sin\left(\frac{\pi}{N}(1-a_i)\right)}.\tag{23}
$$

类似地，对 \(k_c\) 的右邻居 \(k_r=\left(\left(-\hat{\mathrm{loc}}_i+1\right)\right)_N\)，

$$
|y[k_r]|=\frac{|h_i|\sqrt{\rho}}{N}\frac{\left|\sin(\pi a_i)\right|}{\sin\left(\frac{\pi}{N}(1+a_i)\right)}.\tag{24}
$$

下面，我们用中心样本 \(k_c\) 与较强的相邻样本 \(\lambda=\max\{|y[k_l]|,|y[k_r]|\}\) 来求分数多普勒 \(a_i\) 的绝对值，其中 \(\lambda=\frac{|h_i|\sqrt{\rho}}{N}\frac{|\sin(\pi a_i)|}{\sin\left(\frac{\pi}{N}(1-|a_i|)\right)}\)。比值 \(\phi=|y[k_c]|/\lambda\) 为

$$
\phi=\frac{\sin\left(\frac{\pi}{N}(1-|a_i|)\right)}{\sin\left(\frac{\pi|a_i|}{N}\right)}=\frac{\sin\left(\frac{\pi}{N}\right)}{\tan\left(\frac{\pi|a_i|}{N}\right)}-\cos\left(\frac{\pi}{N}\right).\tag{25}
$$

因此，\(\phi\) 仅是 \(a_i\) 的函数。对 (25) 关于 \(|a_i|\) 求解，得到

$$
|\hat a_i|=\frac{N}{\pi}\tan^{-1}\left[\frac{\sin\left(\frac{\pi}{N}\right)}{\phi+\cos\left(\frac{\pi}{N}\right)}\right].\tag{26}
$$

最后，我们通过选择使接收信号与受估计时延及候选多普勒频移影响的发送导频之间相关性最大的符号假设，来确定分数多普勒的符号。令

$$
\hat\nu_i=\hat\alpha_i+\gamma_i|\hat a_i|,\qquad\gamma_i\in\{-1,+1\},\tag{27}
$$

其中 \(\gamma_i\) 表示分数多普勒频移的未知符号。记第 \(i\) 条路径的有效信道（不含路径增益）为

$$
\mathbf H_{\mathrm{eff}}^{i}=\mathbf A\boldsymbol\Gamma_{\mathrm{CPP}_i}\boldsymbol\Delta^{\nu_i}\boldsymbol\Pi^{l_i}\mathbf A^{H}.\tag{28}
$$

对每个符号假设 \(\gamma_i\)，代入 \(\hat l_i\)、\(\hat\alpha_i\)、\(\hat a_i\)，得到第 \(i\) 条路径相应的有效信道矩阵 \(\hat{\mathbf H}_{\mathrm{eff}}^{i}\)。因此，\(\gamma_i\) 通过最大化接收信号 \(\mathbf y\) 与估计有效信道矩阵 \(\hat{\mathbf H}_{\mathrm{eff}}^{i}\) 的相关性来估计，即

$$
\hat\gamma_i=\arg\max_{\gamma_i\in\{-1,+1\}}\left|\mathbf x_p^{H}\left(\hat{\mathbf H}_{\mathrm{eff}}^{i}\right)^{H}\mathbf y\right|^{2}.\tag{29}
$$

### C. 路径增益估计

在估计了第 \(i\) 条传播路径的时延与多普勒参数之后，相应的复数值路径增益可通过 LS 估计获得。接收信号可近似为

$$
\mathbf y\approx h_i\hat{\mathbf H}_{\mathrm{eff}}^{i}\mathbf x+\boldsymbol\eta,\tag{30}
$$

其中 \(h_i\) 为未知复路径增益，\(\boldsymbol\eta=[\eta[0],\ldots,\eta[N-1]]^{T}\)。\(h_i\) 的 LS 估计为

$$
\hat h_i=\arg\min_{h_i\in\mathbb C}\left\|\mathbf y-h_i\hat{\mathbf H}_{\mathrm{eff}}^{i}\mathbf x_p\right\|_2^{2}.\tag{31}
$$

令 \(\hat{\mathbf y}_p^{i}=\hat{\mathbf H}_{\mathrm{eff}}^{i}\mathbf x_p\)，则闭式解为

$$
\hat h_i=\frac{\left(\hat{\mathbf y}_p^{i}\right)^{H}\mathbf y}{\left\|\hat{\mathbf y}_p^{i}\right\|^{2}}.\tag{32}
$$

### D. 基于 SIC 的多径信道估计

如前所述，所提信道估计技术以迭代方式运行。一旦估计出主路径的参数，就重建其对接收信号的贡献。由于与主路径相关的导频分量与数据分量都可能干扰其余路径的估计，因此在进入下一次迭代之前先去除它们的贡献。

由于 (28) 中所有矩阵均为酉矩阵，故有 \(\left(\mathbf H_{\mathrm{eff}}^{i}\right)^{-1}=\left(\mathbf H_{\mathrm{eff}}^{i}\right)^{H}\)。因此 \(\left(\mathbf H_{\mathrm{eff}}^{i}\right)^{H}\mathbf H_{\mathrm{eff}}^{i}=\mathbf I_N\)。于是，常规 LMMSE 检测中的矩阵求逆退化为简单的标量归一化，可写为

$$
\hat{\mathbf x}_i=\frac{\hat h_i^{*}}{|\hat h_i|^{2}+\sigma_\eta^{2}}\left(\hat{\mathbf H}_{\mathrm{eff}}^{i}\right)^{H}\mathbf y_i.\tag{33}
$$

对所提信道估计技术，首先使用 LMMSE 检测器获得数据符号的初步估计 \(\hat{\mathbf x}_i\)，见算法 1 第 11 行。随后重建路径 \(i\) 的贡献为 \(\hat{\mathbf y}_i=\hat h_i\hat{\mathbf H}_{\mathrm{eff}}^{i}(\mathbf x_p+\hat{\mathbf x}_i)\)。在第 \(i\) 次迭代中，从接收信号中减去重建的贡献，得到残余信号

$$
\mathbf y^{(i+1)}=\mathbf y^{(i)}-\hat{\mathbf y}_i,\tag{34}
$$

其中 \(\mathbf y^{(0)}=\mathbf y\)。所得信号 (34) 随后按第 IV-A 至 IV-C 节所述步骤用于估计剩余的主导路径。该过程重复，直至 \(P\) 条路径的全部参数都被估计。我们提出的基于 SIC 的信道参数估计技术总结于算法 1。

**算法 1　所提信道参数估计**

```text
输入: r, x_p, s_p, P, N, μ, ν_max 与 l_max
输出: 所选参数集 S
1: 初始化解集 S ← ∅, y^(0) ← Ar, r^(0) ← r
2: for i = 0 to P−1 do
3:     c(n) ← |⟨r^(i), s_p^(n)⟩|
4:     n_{1,i}, n_{2,i} ← c(n) 与 |y^(i)| 取最大值处的索引
5:     {α̂_i, l̂_i} ← {n_{1,i}, n_{2,i}}
6:     loc_i ← ((α_i + 2Nc_1l_i))_N
7:     φ ← |y[k̂_c]| / max{|y[k̂_l]|, |y[k̂_r]|}
8:     â_i ← (N/π) tan⁻¹( sin(π/N) / (φ + cos(π/N)) )
9:     γ̂_i ← argmax_{γ_i∈{−1,+1}} |x_p^H (Ĥ_eff^i)^H y^(i)|² ⇒ ν̂_i = α̂_i + γ̂_i|â_i|
10:    ŷ_p^i ← Ĥ_eff^i x_p, ĥ_i = (ŷ_p^i)^H y / ||ŷ_p^i||²
11:    x̂_i ← ĥ_i^*/(|ĥ_i|² + σ_w²) (Ĥ_eff^i)^H y_i
12:    y^(i+1) ← y^(i) − ĥ_i Ĥ_eff^i (x_p + x̂_i) ⇒ r^(i+1) = A^H y^(i+1)
13:    S ← S ∪ {ĥ_i, l̂_i, ν̂_i}
14: end for
15: return S
```

## V. 计算复杂度分析

本节以复乘（complex multiplication，CM）次数为度量，分析所提信道参数估计技术与基准方案的计算复杂度。[6] 中基于字典的方法包含两个阶段：对整数时延与多普勒参数进行网格化搜索，随后针对分数多普勒细化进行局部搜索。因此，其计算复杂度为 \(\mathcal O(NN_lN_\alpha N_a)\) 量级，其中 \(N_l\)、\(N_\alpha\) 与 \(N_a\) 分别为时延、整数多普勒与分数多普勒的字典尺寸。因此，复杂度随搜索分辨率迅速增长。此外，由于所有路径的相关峰被同时检测，强路径或间距很近的路径可能分别掩盖较弱路径或彼此掩盖。为避免该问题，可以考虑使用基于 OMP 的方法 [13] 来依次估计并消除传播路径。每次迭代中，把残余信号与全部时延—多普勒字典原子做相关需要 \(\mathcal O(NN_lN_\nu)\) 次 CM，其中 \(N_\nu\) 表示多普勒字典尺寸。我们用 (33) 对数据做初步估计，其需要 \(\mathcal O(N)\) 次 CM。因此，对 \(P\) 径信道，总复杂度约为 \(\mathcal O(PNN_lN_\nu)\)。

对所提技术，信道参数估计主要受峰值检测所需的时域相关以及对分数多普勒符号进行判定所需的相关评估支配。这两类运算每径均需 \(\mathcal O(N)\) 次 CM。计入 (33) 的 LMMSE 检测器，\(P\) 径信道的 CM 总次数为 \(\mathcal O(3PN)\)。

## VI. 仿真结果

本节评估所提信道估计方案的性能。AFDM 系统采用 \(N=1024\) 个子载波，调制方式为 4-QAM。最大整数时延与多普勒分别设为 \(l_{\max}=5\) 与 \(\nu_{\max}=2\)。无线信道包含 \(P=3\) 条传播路径，并假设实现了完美同步。采用视距（line-of-sight，LOS）主导的 Rician 抽头延迟线（tapped-delay-line，TDL）信道模型 [1]。第一个抽头对应 LOS 分量，建模为 Rician 衰落信道；其余抽头建模为独立的 Rayleigh 衰落。各抽头的平均功率服从指数衰减的功率时延分布（power-delay profile，PDP），并按 \(\sum_{\ell=0}^{P-1}P_\ell=1\) 归一化，其中 \(P_\ell\) 表示第 \(\ell\) 条传播路径的平均功率。LOS 信道系数由下式给出：

$$
h_0=\sqrt{P_0}\left(\sqrt{\frac{K_0}{K_0+1}}e^{j\varphi_0}+\sqrt{\frac{1}{K_0+1}}g_0\right),\tag{35}
$$

其中 \(K_0\) 为 Rician K 因子，\(\varphi_0\) 在 \([0,2\pi)\) 上均匀分布，\(g_0\sim\mathcal{CN}(0,1)\)。仿真中，峰值选择方法与基于 OMP 的基准的时延与多普勒网格分辨率分别设为 1 与 0.01。在这些设置下，所提方法所需的 CM 次数分别约为峰值选择方法与基于 OMP 方法的 1/300 与 1/800，表明计算复杂度大幅降低。

我们在图 2、3、4 中评估信道参数估计性能。由这些图可得到以下观察。第一，与基准相比，当信噪比（signal-to-noise ratio，SNR）高于 15 dB 时，我们的方案取得更低的参数归一化均方误差（normalized mean square error，NMSE）。这一改进主要归因于所提方法直接估计了分数多普勒分量，从而缓解了离散化多普勒字典带来的分辨率限制。

**图 2（原文 Fig. 2）：** 时延估计的 NMSE。横轴为 SNR（dB），纵轴为时延 \(l\) 的 NMSE；图例：Proposed Method, \(Q=108\)；OMP, \(Q=108\)；Peak selection, \(Q=108\) [6]。

**图 3（原文 Fig. 3）：** 多普勒估计的 NMSE。横轴为 SNR（dB），纵轴为多普勒 \(\nu\) 的 NMSE；图例与图 2 相同。

**图 4（原文 Fig. 4）：** 路径增益估计的 NMSE。横轴为 SNR（dB），纵轴为 NMSE；图例与图 2 相同。

图 5 给出重建信道矩阵的 NMSE。可以观察到，当 SNR 高于 15 dB 时，与 OMP 及峰值选择方法相比，所提方法取得更低的 NMSE。在低 SNR 区域，弱路径可能导致 (16) 与 (18) 的峰值检测不可靠，从而出现路径漏估。在这种情形下，时延、多普勒与路径增益的估计误差分别设为 \(l_{\max}/2\)、\(\nu_{\max}\) 与平均路径功率的平方根。这种惩罚导致低 SNR 下参数估计 NMSE 偏高。然而，由于漏估路径较弱，其对整体信道的贡献有限，因此低 SNR 下所得信道矩阵 NMSE 仍与基准方法相当。

**图 5（原文 Fig. 5）：** 信道矩阵的 NMSE。横轴为 SNR（dB），纵轴为信道矩阵 \(\mathbf H\) 的 NMSE；图例与图 2 相同。

为评估所提方法降低保护开销的潜力，我们在 SNR 为 25 dB 时考察减小保护尺寸 \(Q\) 后的信道估计 NMSE。如图 6 所示，当 \(Q\) 减小到 96 时，所提方法取得约 \(4.8\times10^{-3}\) 的 NMSE，大致相当于峰值选择方法在相同 SNR 下的 NMSE。这相当于在保持可比信道估计精度的同时将保护开销降低 11%。

**图 6（原文 Fig. 6）：** 不同 \(Q\) 下的信道矩阵 NMSE。横轴为 \(Q\)（取值约从 86 到 108），纵轴为信道矩阵 \(\mathbf H\) 的 NMSE。

图 7 比较了不同信道估计方案在使用 LMMSE 检测器时的 BER 性能。我们观察到，所提方法优于 OMP 与峰值选择方法，并取得更低的误码平台（error floor）。这些结果表明，所提方法不仅具有更低的计算复杂度，还具有更少的开销、更好的信道估计精度与检测可靠性。作为参考，图中也给出了使用完美信道状态信息（channel state information，CSI）时的 BER。当 SNR 低于 18 dB 时，所提方法与完美 CSI 基准几乎相同，仅在更高 SNR 下观察到较小的性能差距。

**图 7（原文 Fig. 7）：** BER 性能。横轴为 SNR（dB），纵轴为 BER；图例：Proposed Method, \(Q=108\)；OMP, \(Q=108\)；Perfect CSI, \(Q=108\)；Peak selection, \(Q=108\) [6]。

## VII. 结论

本文通过利用 AFDM 固有的时延—多普勒移位性质及其输入输出关系，提出了一种面向 AFDM 系统的低复杂度、基于冲激导频的信道参数估计方法。整数时延与整数多普勒参数由时域与仿射域的移位性质估计得到，分数多普勒则由冲激导频周围由多普勒引起的泄漏获得。对于多径信道，我们引入了一种新颖的迭代 SIC 框架，以依次估计、重建并消除主导路径。仿真结果表明，与基准方案相比，所提方法具有更低的计算复杂度、更好的信道估计与 BER 性能，以及更低的导频开销。

## 参考文献（英文原条目）

[1] 3GPP, "Feature lead summary No.2 on 6G waveform TSG-RAN WG1," 3GPP, Tech. Rep., 2025. [Online]. Available: https://www.3gpp.org/ftp/tsg_ran/WG1_RL1/TSGR1_122/Docs/R1-2506595.zip

[2] A. Bemani, N. Ksairi, and M. Kountouris, "AFDM: A full diversity next generation waveform for high mobility communications," in 2021 IEEE International Conference on Communications Workshops (ICC Workshops), 2021, pp. 1–6.

[3] Z. Sui, Z. Liu, L. Musavian, L.-L. Yang, and L. Hanzo, "Generalized spatial modulation aided affine frequency division multiplexing," IEEE Transactions on Wireless Communications, vol. 25, pp. 4658–4673, 2026.

[4] Z. Sui, Q. Luo, Z. Liu, M. Temiz, L. Musavian, C. Masouros, Y. L. Guan, P. Xiao, and L. Hanzo, "Multi-functional chirp signalling for next-generation multi-carrier wireless networks: Communications, sensing and ISAC perspectives," arXiv preprint arXiv:2508.06022, 2025.

[5] Z. Sui, Z. Liu, L. Musavian, Y. L. Guan, L.-L. Yang, and L. Hanzo, "MIMO-AFDM outperforms MIMO-OFDM in the face of hardware impairments," IEEE Transactions on Communications, vol. 74, pp. 10432–10447, 2026.

[6] A. Bemani, N. Ksairi, and M. Kountouris, "Affine frequency division multiplexing for next generation wireless communications," IEEE Transactions on Wireless Communications, vol. 22, no. 11, pp. 8214–8229, 2023.

[7] Y. Zhou, H. Yin, N. Zhou, Y. Tang, X. Zhang, and W. Yuan, "GI-free pilot-aided channel estimation for affine frequency division multiplexing systems," arXiv preprint arXiv:2404.01088, 2024.

[8] K. Zheng, M. Wen, T. Mao, L. Xiao, and Z. Wang, "Channel estimation for AFDM with superimposed pilots," IEEE Transactions on Vehicular Technology, vol. 74, no. 2, pp. 3389–3394, 2025.

[9] L. Liu, Z. Li, Q. Peng, Q. Luo, P. Xiao, and H. Wu, "BEM-assisted low-complexity channel estimation for AFDM systems over doubly selective channels," IEEE Wireless Communications Letters, vol. 15, pp. 2974–2978, 2026.

[10] F. Yang, S. Luo, L. Wu, D. Song, R. Lin, and S. Xie, "An AFDM off-grid channel estimation based on sparse Bayesian learning," in IEEE 24th International Conference on Communication Technology, 2024, pp. 1565–1569.

[11] J. Shi, X. Liu, and N. Zhang, "Generalized convolution and product theorems associated with linear canonical transform," Signal, Image and Video Processing, vol. 8, no. 5, pp. 967–974, 2014.

[12] Y. Luo, Y. L. Guan, Y. Ge, D. González G, and C. Yuen, "A novel angle-delay-doppler estimation scheme for AFDM-ISAC system in mixed near-field and far-field scenarios," IEEE Internet of Things Journal, vol. 12, no. 13, pp. 22669–22682, 2025.

[13] R. Cao, Y. Zhong, J. Lyu, D. Wang, and L. Fu, "AFDM channel estimation in multi-scale multi-lag channels," in GLOBECOM 2024 - 2024 IEEE Global Communications Conference, 2024, pp. 1569–1574.

**本页范围与校对状态：** 本页覆盖原文全部内容：摘要、索引词（Index Terms）、第 I–VII 节及全部小节（§III-A–B、§IV-A–D、§V、§VI）、式 (1)–(35)（逐式带编号环境）、算法 1（15 行逐行转写）、图 1–7 图注（图 1 为 AFDM 帧结构，图 2–7 为仿真结果曲线；图注含坐标轴与图例）、参考文献 [1]–[13]（英文原条目），以及原文第 1 页的资助/CC BY 声明脚注。**原文共 7 幅图（图 1 帧结构 + 图 2–7 结果），无表格、无附录、无定理/命题环境。** 公式、图注与实验参数均按 PDF 渲染页逐页核对（p01–p06，含 4× 放大裁切核对式 (19) 与算法 1）。**已知缺陷与核对说明：** ① 式 (19) 求和下标中的 \(k_\nu\) 在正文中未给出定义（疑沿用 [6] 记号或笔误），译文按原文保留；② §III-B 在 (15) 之后一句把位置写作 \(((m_p-\mu d_2))_N\)，而 \(d_2\) 全文未定义，按上下文应为 \(((m_p-\mu d_1))_N\)，译文保留原文并在括注中说明；③ 算法 1 第 5 行按原文写作 \(\{\hat\alpha_i,\hat l_i\}\leftarrow\{n_{1,i},n_{2,i}\}\)，属简写（实际须借 (16)–(18) 由 \(n_{1,i},n_{2,i}\) 联立求解 \(l_i,\alpha_i\)），译文按原文保留；④ 算法 1 第 11 行用 \(\sigma_w^{2}\)，而式 (33) 用 \(\sigma_\eta^{2}\)，原文记号不一致，译文两处均按原样保留；⑤ 式 (5) 中 \(\boldsymbol\Gamma_{\mathrm{CPP}_p}\) 的分段定义在 PDF 中以 cases 形式与 \(\bar{\mathbf H}\) 同属式 (5)，译文合并为同一编号 (5) 的公式块；⑥ 图 2–7 为曲线图，原文未提供逐点数值表，译文仅译图注与图例，未转写/推测数据点；⑦ 适用范围审计：本文模型为 SISO、\(P=3\) 的稀疏多径、假设完美同步、时延取整数且多普勒含整数+分数部分；不直接覆盖载波频偏（CFO）/定时误差未同步、大规模 MIMO 阵列（空域角度参数需扩展）、稠密散射（\(P\) 很大）以及硬件损伤场景；“复乘数约少 300/800 倍”的结论依赖所设字典分辨率（时延网格 1、多普勒网格 0.01）与具体 \(N,l_{\max},\nu_{\max}\)；⑧ 原文个别拼写按语义翻译：§III "normalized Doppler shift ε is applied" 等句按通顺语义处理，未改符号。逐句逐式终校未做；供 QA 重点核对：式 (16)–(18) 的移位与符号约定（\(d_i\) 与 \(\alpha_i\) 的关系）、式 (19)–(20) 分母相位差、式 (25)–(26) 的 \(\phi\) 反解、算法 1 第 12 行的 SIC 重建表达式，以及 §VI 中 300/800 倍、4.8×10⁻³、11%、15 dB/18 dB 等数字与图 2–7 的一致性。

**登记（2026-11-04）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。
{% endraw %}