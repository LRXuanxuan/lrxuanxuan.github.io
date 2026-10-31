---
layout: page
title: "全帧 OFDM-ISAC：联合星座、导频与接收滤波器设计｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-22994-full-frame-ofdm-isac-joint-constellation-pilot-and-receive-filter-desi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1e048eb88aa75232/) · [原文 arXiv](https://arxiv.org/abs/2609.22994) · [全部目录](/papers/catalog/)

# 全帧 OFDM-ISAC：联合星座、导频与接收滤波器设计

**原题：** Full-Frame OFDM-ISAC: Joint Constellation, Pilot, and Receive-Filter Design  
**作者：** Dongil Yang、Kaitao Meng、Fan Liu、Christos Masouros、Kawon Han  
**版本：** arXiv:2609.22994v1，2026-09-19，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节（含全部小节）、图 1–9 图注、表 I 逐格、附录 A–E、参考文献 [1]–[38]（英文原条目）按原文结构录入；原文无致谢/基金段落。逐句逐式终校未做。

## 摘要

正交频分复用（orthogonal frequency-division multiplexing，OFDM）集成感知与通信（integrated sensing and communication，ISAC）将包括导频与数据载荷在内的整个时频帧复用于雷达感知。然而随机数据载荷会压缩感知动态范围，并劣化目标检测与参数估计性能。现有研究通常孤立地优化调制星座、导频图样、功率分配与接收滤波器，忽视了它们对感知模糊结构的耦合影响。为弥补这一空白，我们针对全帧 OFDM-ISAC 系统提出星座、导频位置与功率划分、以及失配接收滤波器的联合设计，在通信速率约束下最小化声明感兴趣区域（region of interest，ROI）内的残余干扰。对给定发射信号方案，接收滤波器存在闭式解。在此滤波器下，我们推导了二维距离—多普勒域上接收机特定干扰底噪与噪声放大的闭式表达式，表明该底噪由全帧信号的一个有效统计量支配。该规律把联合设计化简为两步：平衡交错导频放置消除导频功率提升带来的确定性栅瓣；随后在信道估计误差下的速率约束边界上联合选择成形星座与功率划分，从而在声明 ROI 尺寸的一阶精度内、在所构造的成形层级上达到联合最优。在常规 16-QAM 帧速率 98% 的服务质量（quality of service，QoS）约束下，所提设计相比常规的接收机感知设计显著降低干扰底噪、提升目标检测概率并取得更好的测距精度。

**索引词：** 星座成形、集成感知与通信（ISAC）、失配滤波、正交频分复用（OFDM）、导频设计。

## I. 引言

集成感知与通信（ISAC）已成为未来无线网络的关键使能技术：通信基础设施不仅需提供高速连接，还需获取环境信息以用于定位、跟踪、建图与态势感知 [1]–[4]。在候选波形中，正交频分复用（OFDM）因其对频率选择性信道的鲁棒性、与现有蜂窝标准的兼容性以及通过二维傅里叶变换实现的简单时延—多普勒处理而特别适合 ISAC [5]、[6]。这些特性使 OFDM 收发机可把同一时频资源同时用于通信与感知，从而避免专用雷达发射的频谱低效。

以通信为中心的 OFDM-ISAC 帧不仅包含确定性导频符号，还包含随机数据载荷。常规感知方法通常依赖确定性已知导频，其规则结构便于简单的确定性处理 [7]、[8]。然而这种仅导频感知丢弃了大部分信令资源，因为数据载荷占据了帧的很大部分。例如，在面向高移动链路的 5G NR PDSCH 配置中，采用常规循环前缀与含三个附加 DM-RS 位置的单符号 Type-1 DM-RS 时，导频约占每个物理资源块中资源单元的 14% [9]。相比之下，基于载荷的感知可调用更多 OFDM 资源——这些资源在单基地感知接收机处本来就可用，从而在不增加感知开销的情况下大幅提高相干积累增益，因此对以通信为中心的 ISAC 尤其有吸引力 [10]–[14]。

然而使用随机载荷相较以感知为中心的波形存在根本性限制。与恒模雷达序列不同，实用的正交幅度调制（quadrature amplitude modulation，QAM）或幅相键控（amplitude-phase-shift keying，APSK）载荷具有依赖符号的幅度起伏，它们表现为距离—多普勒响应中每个散射体周围模糊函数的数据相关旁瓣 [6]、[11]、[15]。尽管匹配滤波（matched filtering，MF）在信噪比（signal-to-noise ratio，SNR）意义下最优，其输出仍保留由星座四阶矩决定的、依赖载荷的旁瓣底噪 [12]、[16]。因此，强杂波回波会产生宽干扰底噪，无论噪声水平如何都会遮蔽目标。

已有多种感知接收滤波器用于处理该问题。倒数滤波器（reciprocal filter，RF）通过精确反演发射符号来去除载荷调制 [17]–[19]，以放大噪声造成的 SNR 损失为代价抑制数据相关旁瓣；其性能由星座逆二阶矩支配 [16]，当星座点靠近原点时该损失变得可观。另一方面，维纳滤波器是感知信道响应的线性最小均方误差（LMMSE）估计器，它按目标 SNR 对符号反演做正则化，从而在 MF 与 RF 之间插值，以残余数据相关旁瓣换取噪声放大 [18]、[20]。重要的是，这两种滤波器都无法选择旁瓣抑制的方向，而 SNR 损失遍及全帧，尽管检测只依赖覆盖感兴趣区域（ROI）的那些距离—多普勒单元。同一族中的感兴趣区域失配滤波器（region-of-interest mismatched filter，ROI-MMF）[21] 把自由度集中于预期出现弱目标的时延区域，同时保持主瓣响应；该工作表明当 ROI 足够小时，测距对星座的依赖被削弱。

与此同时，一批接收机感知发射设计工作把调制几何或其输入分布调谐到部署的感知接收机上。具体而言，这些设计匹配决定 MF 旁瓣水平的四阶矩 [12]、[22]，决定 RF 噪声放大的逆二阶矩 [16]，或接收机达到的估计精度 [21]。所得感知—速率折中已对随机波形 [23] 与有限星座概率成形 [24] 给出刻画。然而这些设计只优化载荷星座，而把导频结构视为给定。在导频方面，提升导频功率可改善信道估计，但减少可用于载荷符号的功率 [7]、[8]；此外，规则导频梳便于信道估计与确定性导频感知 [5]、[25]，但在导频功率提升下其周期功率图样会在距离—多普勒域产生确定性栅瓣伪影。导频图样对 OFDM 感知响应的强影响促成了近期的导频图样设计 [26]–[28]。除这些各自独立的改进外，近期研究开始联合利用导频与载荷进行感知，相较仅导频处理显示出明显增益 [13]、[29]。

尽管有上述进展，现有工作通常要么在固定发射帧下优化接收滤波器，要么在固定接收机下整形发射信号。结果，星座成形、导频密度选择、导频/数据功率分配、导频位置与失配接收滤波器设计在很大程度上被当作彼此独立的设计问题 [7]、[8]、[10]、[11]、[22]、[30]、[31]。因此，发射帧与感知接收机的联合设计仍是开放问题。关键难点在于这些设计变量紧密耦合，却通过不同机制作用于感知性能：星座与导频—载荷配置决定数据相关干扰统计与模糊结构，而接收滤波器以噪声放大为代价抑制由此产生的干扰。因此联合优化它们会在同时满足通信速率与感知性能要求时产生一个混合离散—连续、高度非凸的问题。因此，亟需一种全帧 OFDM-ISAC 设计，同时兼顾通信速率、感知接收机与完整的导频—载荷帧结构。

为弥补上述空白，我们提出一种接收机感知的全帧 OFDM-ISAC 框架，在给定通信速率要求下联合设计调制星座、导频结构与接收滤波器。借助对 MF、RF 与 ROI-MMF 的滤波后干扰的统一刻画，我们把数据载荷的随机贡献与功率提升导频格点的确定性贡献分离，将二者与检测和估计性能联系起来，并推导信道估计感知的可达速率，从而在通信侧闭环设计。本文主要贡献归纳如下。

- 我们对全帧 OFDM-ISAC 的调制星座、导频位置与功率划分、以及失配接收滤波器的联合设计进行建模：在给定通信速率要求下最小化声明 ROI 内的残余干扰。所提模型耦合全部四个设计变量，我们给出其目标的闭式分解——每个变量通过一个已识别的项起作用，即确定性导频模糊、载荷起伏统计量与滤波器噪声能量。
- 我们建立了全帧 OFDM 感知的统一接收机感知分析，在共同的主瓣增益归一化下同时覆盖导频与数据载荷。结果揭示了 ROI-MMF 的载荷诱导干扰底噪由单一统计量支配，即全帧 OFDM 信号的有效中心二阶矩；它耦合星座、导频密度与功率划分，并分别在覆盖与未覆盖的滞后上量化 ROI-MMF 的残余干扰。
- 在此分析基础上，我们提出具有最优性保证的三步设计流程：对每个发射帧以闭式得到接收滤波器；导频位置由平衡交错构造给出，在保持信道估计所需正交性的同时消除导频功率提升引起的确定性栅瓣响应；随后通过信道估计感知的有效信干噪比（signal-to-interference-plus-noise ratio，SINR）与基于服务质量（QoS）的选择准则，在速率边界上选取星座与功率划分。我们进一步证明该序贯流程在所构造的成形层级上达到一阶联合最优。

**记号：** 粗体小写与大写符号分别表示向量与矩阵；$\mathbf A\in\mathbb C^{N\times M}$ 与 $\mathbf B\in\mathbb R^{N\times M}$ 分别表示复值与实值 $N\times M$ 矩阵。算子 $(\cdot)^T$、$(\cdot)^H$、$(\cdot)^*$ 分别表示转置、Hermitian 转置与共轭。$\mathrm{diag}(\mathbf a)$ 表示以向量 $\mathbf a$ 为对角元的对角阵，$\mathrm{vec}(\cdot)$ 表示按列向量化。$\odot$ 与 $\oslash$ 分别表示 Hadamard 积与逐元素相除。$\mathbb E[\cdot]$ 表示统计期望算子。

## II. 系统模型

考虑以通信为中心的 OFDM-ISAC 系统：基站（base station，BS）同时服务一个通信用户并在杂波环境中感知多个目标（如图 1 所示）。通信与感知功能共享同一 OFDM 帧，该帧由确定性导频符号与随机数据载荷组成。由于单基地感知接收机与发射机同址，发射帧天然已知，并被复用为全帧感知参考。

### A. OFDM 帧结构

考虑由 $N$ 个子载波与 $M$ 个连续 OFDM 符号组成的 OFDM 帧，共有 $D=NM$ 个时频资源单元。子载波间隔记为 $\Delta f$，带宽为 $N\Delta f$，有用 OFDM 符号时长为 $T_{\mathrm u}=1/\Delta f$。设循环前缀（cyclic prefix，CP）时长为 $T_{\mathrm{cp}}$，则总 OFDM 符号时长为 $T_{\mathrm o}=T_{\mathrm u}+T_{\mathrm{cp}}$；假设所有感兴趣的时延均短于 $T_{\mathrm{cp}}$，因此帧模型仅包含无符号间干扰的 $N\times M$ 个承载数据的单元。

令 $\mathbf B\in\{0,1\}^{N\times M}$ 表示导频位置矩阵，$B_{n,m}=1$ 表示资源单元 $(n,m)$ 携带导频符号，$B_{n,m}=0$ 表示数据符号。导频与数据索引集分别为 $\mathcal P=\{(n,m):B_{n,m}=1\}$ 与 $\mathcal D=\{(n,m):B_{n,m}=0\}$，基数分别为 $D_p=|\mathcal P|$ 与 $D_d=|\mathcal D|=D-D_p$。相应导频密度定义为

$$
\eta=\frac{D_p}{D}. \tag{1}
$$

全文假设导频构成密度为 $\eta=1/f_p$ 的梳状结构，其中 $f_p$ 为梳因子。在常规垂直梳中，每个 OFDM 符号的每第 $f_p$ 个子载波放置一个导频，该结构是本文的参考放置。除此之外，放置本身是本文的设计变量，且允许的放置在平衡约束下：每个子载波在整帧中携带相同数量的导频，

$$
\sum_{m=0}^{M-1}B_{n,m}=\frac{D_p}{N},\quad n=0,\ldots,N-1. \tag{2}
$$

由此得到的放置集合记作 $\mathcal B$。注意常规垂直梳把导频集中在 $N/f_p$ 个子载波上，因此不在 $\mathcal B$ 内。

令 $\mathbf S_p\in\mathbb C^{N\times M}$ 与 $\mathbf S_d\in\mathbb C^{N\times M}$ 分别表示确定性导频符号矩阵与随机数据符号矩阵。导频符号携带 Zadoff–Chu（ZC）序列——一种恒模零自相关波形，满足 $|[S_p]_{n,m}|=1$（$(n,m)\in\mathcal P$）。$\mathbf S_d$ 的非零元素独立且等概地取自 $L$ 元星座 $\mathcal X=\{x_1,\ldots,x_L\}$，归一化使 $\mathbb E[|x|^2]=1$。

星座约束为四分之一转旋转不变，即 $x\in\mathcal X$ 当且仅当 $jx\in\mathcal X$，称为 $C_4$ 对称 [32]。因此星座点成四元组 $\{x,jx,-x,-jx\}$ 出现；由于符号等概，该对称性蕴含

$$
\mathbb E[x]=0,\qquad\mathbb E[x^2]=0. \tag{3}
$$

四分之一转对称星座已被证明在几何成形下保持接近容量的互信息 [32]，故该约束牺牲的成形自由度很小，同时把自由设计变量减为 $L/4$ 个点。在感知侧，(3) 使进入感知分析的每个载荷统计量都化为功率统计量：具体地，对不同单元，独立性与 $\mathbb E[x]=0$ 给出 $\mathbb E[x_nx_m^*]=\mathbb E[x_nx_m]=0$；同一单元内 $\mathbb E[x^2]=0$ 消去剩余相位项，于是唯一存活的二阶量为功率 $\mathbb E[|x|^2]$。图 2 对比了两种发射结构：图 2(a) 的梳状导频与常规星座被图 2(b) 的平衡交错导频与成形星座取代，且这两个发射变量与 ROI 感知的感知接收滤波器在感知—通信折中下联合设计，这正是本文主题。

最后，$p_p$ 与 $p_d$ 分别表示分配给导频与数据资源单元的平均功率 [33]、[34]。发射 OFDM 帧为

$$
\mathbf X=\sqrt{p_p}\,\mathbf B\odot\mathbf S_p+\sqrt{p_d}\,(\mathbf 1-\mathbf B)\odot\mathbf S_d, \tag{4}
$$

受归一化平均功率约束

$$
\eta p_p+(1-\eta)p_d=1, \tag{5}
$$

该约束保证 $\mathbb E[\|\mathbf X\|_F^2]=D$。为参数化导频/数据功率分配，定义分配给导频的帧总能量比例为 $\gamma=\eta p_p$，于是由 (5) 得

$$
p_p=\frac{\gamma}{\eta},\qquad p_d=\frac{1-\gamma}{1-\eta}. \tag{6}
$$

均匀功率分配对应 $\gamma=\eta$，此时 $p_p=p_d=1$；而 $\gamma>\eta$ 表示以数据符号功率为代价提升导频功率。符合标准的逐单元提升上界为 $p_p/p_d\le B_{\mathrm{st}}$，它把 $\gamma$ 限制在 $\gamma\in[\eta,\gamma_{\max}]$，其中

$$
\gamma_{\max}=\frac{B_{\mathrm{st}}\eta}{1+(B_{\mathrm{st}}-1)\eta}. \tag{7}
$$

随机载荷的感知行为由归一化星座的两个统计矩刻画，定义为

$$
\mu_4=\mathbb E\left[|x|^4\right],\qquad \nu_{-2}=\mathbb E\left[|x|^{-2}\right], \tag{8}
$$

其中 $\mu_4$ 为星座四阶矩（峰度），$\nu_{-2}$ 为逆二阶矩。如 [12]、[16]、[21] 所建立，$\mu_4$ 支配 MF 的载荷诱导干扰，$\nu_{-2}$ 支配 RF 的噪声放大。只要星座不含原点，逆矩 $\nu_{-2}$ 就有限。对相移键控（phase-shift keying，PSK）等恒模星座，$\mu_4=\nu_{-2}=1$；任何非恒模星座满足 $\mu_4>1$ 与 $\nu_{-2}>1$。为记号简洁，定义向量化发射帧 $\mathbf x=\mathrm{vec}(\mathbf X)\in\mathbb C^D$。

### B. 通信系统模型

通信用户经历含 $K_h$ 个有效抽头的频率选择性信道 $\mathbf g=[g_0,\ldots,g_{K_h-1}]^T\sim\mathcal{CN}(\mathbf 0,\sigma_h^2\mathbf I_{K_h})$，其时延扩展落在 CP 内。用户链路在一个帧内建模为准静态，链路的公共载波与多普勒偏移由标准 OFDM 中的接收机同步处理。子载波 $n$ 上的信道频率响应为

$$
H_n=\sum_{\ell=0}^{K_h-1}g_\ell e^{-j2\pi n\ell/N}, \tag{9}
$$

资源单元 $(n,m)$ 上的接收信号为

$$
y_{n,m}=H_nX_{n,m}+w_{n,m}, \tag{10}
$$

其中 $w_{n,m}\sim\mathcal{CN}(0,\sigma_c^2)$ 表示通信接收机的加性白高斯噪声（AWGN）。抽头方差归一化为单位平均信道增益 $K_h\sigma_h^2=1$，使每个子载波上 $\mathbb E[|H_n|^2]=1$，单位符号功率下的逐单元通信 SNR 为 $\mathrm{SNR}_c=1/\sigma_c^2$。

把 (9) 在导频单元 $(n,m)\in\mathcal P$ 处代入 (10) 得

$$
y_{n,m}=\sum_{\ell=0}^{K_h-1}g_\ell X_{n,m}e^{-j2\pi n\ell/N}+w_{n,m}, \tag{11}
$$

它关于 $\mathbf g$ 线性。把 (11) 的 $D_p$ 个导频观测堆叠得 $\mathbf y_p=\boldsymbol\Omega\mathbf g+\mathbf w_p$，其中 $\boldsymbol\Omega\in\mathbb C^{D_p\times K_h}$ 中与导频单元 $(n,m)$ 对应的行元素为 $[\boldsymbol\Omega]_{(n,m),\ell}=X_{n,m}e^{-j2\pi n\ell/N}$，$\mathbf w_p\in\mathbb C^{D_p}$ 汇集导频单元的噪声样本。接收机用 LMMSE 估计器估计 $\mathbf g$：

$$
\hat{\mathbf g}=\sigma_h^2\boldsymbol\Omega^H\left(\sigma_h^2\boldsymbol\Omega\boldsymbol\Omega^H+\sigma_c^2\mathbf I\right)^{-1}\mathbf y_p, \tag{12}
$$

其误差协方差为 $\mathbf C_\epsilon=(\sigma_h^{-2}\mathbf I+\sigma_c^{-2}\boldsymbol\Omega^H\boldsymbol\Omega)^{-1}$ [35]。估计误差作为残余干扰传播到载荷解调中，从而把导频设计与载荷链路的可达速率近似耦合起来。载荷链路的有效速率近似为 $R(\eta,\gamma,\mathcal X)=(1-\eta)I_{\mathcal X}(\mathrm{SINR}_{\mathrm{eff}}(\gamma,\eta))$，其中 $I_{\mathcal X}$ 为星座受限互信息，$\mathrm{SINR}_{\mathrm{eff}}$ 为信道估计误差下载荷链路的有效 SINR。参考速率 $R_{\mathrm{base}}$ 为相同导频密度下、均匀功率 1 的 16-QAM 的速率。

### C. 感知系统模型与接收处理

去 CP 并逐符号做 $N$ 点 FFT 后，已知 $\mathbf x$ 的单基地感知接收机观测到接收时频帧

$$
\mathbf Y=\sum_{i=1}^{K}\alpha_i\mathbf X\odot\boldsymbol\Phi(q_i,k_i)+\mathbf W, \tag{13}
$$

其中距离—多普勒相位矩阵为

$$
\left[\boldsymbol\Phi(q,k)\right]_{n,m}=e^{-j2\pi\left(\frac{qn}{N}+\frac{km}{M}\right)}. \tag{14}
$$

(13) 中的求和遍历帧照亮的 $K=K_t+K_c$ 个散射体，包括 $K_t$ 个感兴趣目标与 $K_c$ 个杂波源。与用户链路不同，每个回波携带各自散射体特定的多普勒频移，无法由公共同步去除，而是待估计的参数。这里 $\alpha_i$ 为第 $i$ 个散射体的复幅度，吸收路径损耗与雷达截面积；$(q_i,k_i)$ 为其距离—多普勒单元（不必为整数值）；$\mathbf W\sim\mathcal{CN}(0,\sigma^2\mathbf I)$ 表示感知接收机的 AWGN。单元坐标是散射体时延与多普勒频移按单元尺寸归一化的结果，即 $q_i=\tau_iN\Delta f$、$k_i=f_{d,i}MT_{\mathrm o}$。相应的距离与径向速度为 $r_i=q_ic/(2N\Delta f)$ 与 $v_i=k_ic/(2f_cMT_{\mathrm o})$，其中 $c$ 为光速、$f_c$ 为载频。假设所有散射体时延落在 CP 内、所有多普勒频移满足 $f_d\ll\Delta f$，从而使信道在时频网格上逐单元作用，如 (13) 所示且无载波间干扰 [25]、[36]。

记 $\mathbf y=\mathrm{vec}(\mathbf Y)$、$\boldsymbol\phi(q,k)=\mathrm{vec}(\boldsymbol\Phi(q,k))$，接收机施加帧级接收滤波器 $\mathbf h\in\mathbb C^D$，并归一化 $\mathbf h^H\mathbf x=D$，使散射体的主瓣响应恰为其幅度。两种常规选择作为全文的固定基线，即经典 MF 与 RF [16]、[18]：

$$
\mathbf h^{\mathrm{MF}}=\mathbf x,\qquad \mathbf h^{\mathrm{RF}}=\mathbf 1\oslash\mathbf x^*, \tag{15}
$$

其中 RF 恒等地满足该归一化，而 MF 的缩放因子 $D/\|\mathbf x\|^2$ 随帧增大趋于 1。两种滤波器均逐单元施加，其代价仅随帧尺寸 $D$ 线性增长；且二者都是固定处理规则——帧一旦发射，接收端便无设计自由度。

### D. 问题建模

我们对所考虑 OFDM-ISAC 系统的全帧 OFDM 联合发射与接收滤波器设计进行建模。由于载荷是通信数据，发射机不选择单个符号，但选择符号所服从的统计特性以及承载它们的帧。因此发射机可支配三个量：调制星座 $\mathcal X$、导频位置 $\mathcal P$ 与功率划分 $\gamma$。它们服从帧模型约束，即星座的 $C_4$ 对称性与最小间距 $d_{\min}(\mathcal X)\ge d_0$（后者保护解调距离）、放置的平衡条件 (2)、以及功率划分的提升范围 (7)。在接收侧，滤波器可依赖实际发送的帧并对每个帧重新计算；因此接收变量是映射 $\mathbf h(\cdot)$ 而非单个固定向量。

设计取三个给定输入：导频密度 $\eta$、逐单元通信 SNR（$\mathrm{SNR}_c=1/\sigma_c^2$，见 (10)）、以及 QoS 要求 $\zeta$（设计必须为通信链路保证的参考速率比例）。在这些量固定后，我们提出

$$
(\mathrm{P}1)\quad\min_{\mathcal X,\mathcal P,\gamma,\mathbf h(\cdot)}\ \mathbb E_{\mathbf x}\Big[\underbrace{\lambda\|\mathbf h(\mathbf x)\|^2}_{\text{噪声能量}}
+\underbrace{\sum_{(q,k)\in\mathcal S}\left|\mathbf h(\mathbf x)^H\left(\mathbf x\odot\boldsymbol\phi(q,k)\right)\right|^2}_{\text{ROI 旁瓣残余}}\Big] \tag{16a}
$$

$$
\text{s.t.}\quad \mathcal X\in C_4,\ \mathcal P\in\mathcal B,\ \gamma\in[\eta,\gamma_{\max}], \tag{16b}
$$

$$
\mathbf h(\mathbf x)^H\mathbf x=D\quad\forall\mathbf x, \tag{16c}
$$

$$
R(\eta,\gamma,\mathcal X)\ge\zeta R_{\mathrm{base}}. \tag{16d}
$$

这里 $\mathcal S$ 为陷波集，收集声明 ROI 单元与散射体中心之间的成对相对位移并排除零位移，从而保留所有主瓣。定义 $\mathcal S$ 的散射体中心假设可由前几帧的检测获得，这在感兴趣区域处理中是标准做法 [21]。权重 $\lambda>0$ 平衡滤波器噪声能量与在这些位移处留下的残余。单位增益约束 (16c) 对载荷的每个实现成立。(16a) 中的目标是声明 ROI 内滤波后干扰加噪声功率，即滤波器通过的噪声能量加上在陷波位移处留下的旁瓣残余。单位增益约束 (16c) 强制散射体的峰值响应等于其自身幅度，从而无法通过缩小主瓣而非抑制旁瓣来降低残余。最后，速率约束 (16d) 使通信服务保持在给定水平。

### E. 特定 OFDM 帧下的最优感知接收机

尽管 $(\mathrm P1)$ 耦合四个不同类型变量，关于接收滤波器 $\mathbf h(\cdot)$ 的最小化存在精确解。由于目标与单位增益约束分别作用于 $\mathbf x$ 的每个实现，(16a) 中的期望可通过在每个实现处最小化被积函数来最小化。因此对任意固定发射设计，滤波器设计化简为带单个线性约束的逐实现二次问题，其中 $\mathbf x$ 为已知常数：

$$
\mathbf h^{\mathrm{ROI}}=\arg\min_{\mathbf h}\ \lambda\|\mathbf h\|^2+\sum_{(q,k)\in\mathcal S}\left|\mathbf h^H\left(\mathbf x\odot\boldsymbol\phi(q,k)\right)\right|^2\quad\text{s.t.}\ \mathbf h^H\mathbf x=D, \tag{17}
$$

它把 [21] 的时延域 ROI-MMF 推广到二维距离—多普勒平面。其闭式解由 Woodbury 恒等式给出。令 $\mathbf Z=[\mathbf x\odot\boldsymbol\phi(q,k)]_{(q,k)\in\mathcal S}\in\mathbb C^{D\times|\mathcal S|}$，则

$$
\mathbf h^{\mathrm{ROI}}=\frac{\beta}{\lambda}\left(\mathbf x-\mathbf Z\left(\lambda\mathbf I+\mathbf Z^H\mathbf Z\right)^{-1}\mathbf Z^H\mathbf x\right), \tag{18}
$$

其中 $\beta$ 使 $\mathbf h^H\mathbf x=D$ 成立，故滤波器计算量随声明 ROI 尺寸 $|\mathcal S|$ 而非帧维数 $D$ 增长 [21]。然而滤波器无法去除载荷本身的随机性：陷波抵消帧的平均响应，而符号功率围绕该平均值的随机起伏作为残余干扰泄漏出来。因此，滤波器留下什么由载荷起伏决定，而只有发射设计能通过速率约束下的星座成形来降低它。

## III. 全帧 OFDM 感知—通信性能

基于系统模型与闭式接收滤波器 (18)，本节推导滤波后干扰底噪、噪声放大与 $(\mathrm P1)$ 目标的闭式表达式，以及通信链路的闭式可达速率。

### A. 全帧 OFDM 感知的底噪分析

本小节刻画目标在距离—多普勒图每个单元上所面对的底噪。该底噪由三部分组成：平均帧功率的确定性响应、载荷的随机起伏、以及滤波器通过的噪声。全文按列向量化帧，故元素 $n=n_f+n_tN$ 汇集子载波索引 $n_f$ 与 OFDM 符号索引 $n_t$。接收机分两步形成该图：逐单元时频滤波可写为

$$
r_n=h_n^*y_n, \tag{19}
$$

随后对滤波后帧作二维 DFT 报出图的每个单元：

$$
\chi(q,k)=\frac{1}{D}\boldsymbol\phi^H(q,k)\left(\mathbf h^*\odot\mathbf y\right)=\frac{1}{D}\sum_{n=0}^{D-1}r_ne^{j\theta^{(q,k)}(n)}, \tag{20}
$$

其中 $\theta^{(q,k)}(n)=2\pi(qn_f/N+kn_t/M)$ 为 (14) 中导向矢量的相位，关于单元对 $(q,k)$ 线性。在单位增益约束 (16c) 下，散射体自身单元处的统计量返回其幅度加滤波后噪声。图关于 (13) 的回波线性，故多个散射体的泄漏叠加，只需分析一个。考虑位于单元 $(q_c,k_c)$、幅度为 $\alpha_c$ 的散射体。把其回波 $\alpha_c\mathbf x\odot\boldsymbol\phi(q_c,k_c)$（式 (13)）代入 (19) 得

$$
r_n=\alpha_ca_ne^{-j\theta^{(q_c,k_c)}(n)}+h_n^*w_n, \tag{21}
$$

其中 $a_n=h_n^*x_n$ 加权第 $n$ 个元素对图的贡献。现把 (20) 在距该散射体位移为滞后 $\Delta=(q_c-q_e,k_c-k_e)\ne(0,0)$ 的单元 $(q_e,k_e)$ 处求值。把 (21) 代入 (20)，相位的线性给出 $\theta^{(q_c,k_c)}(n)-\theta^{(q_e,k_e)}(n)=\theta^\Delta(n)$，故该统计量只依赖滞后，记作 $\chi(\Delta)$：

$$
\chi(\Delta)=\frac{\alpha_c}{D}\sum_{n=0}^{D-1}a_ne^{-j\theta^\Delta(n)}+\chi_w, \tag{22}
$$

其中 $\chi_w=\frac{1}{D}\sum_{n=0}^{D-1}h_n^*w_ne^{j\theta^{(q_e,k_e)}(n)}$ 为滤波后噪声。

散射体经权重 $a_n$ 泄漏到图的每个其他单元，且泄漏只依赖两单元间的滞后。三种接收机仅通过 $a_n$ 不同；在各自单位增益常数意义下有

$$
a_n^{\mathrm{MF}}=|x_n|^2, \tag{23a}
$$

$$
a_n^{\mathrm{RF}}=1, \tag{23b}
$$

$$
a_n^{\mathrm{ROI}}=\tilde\beta|x_n|^2(1-\xi_n), \tag{23c}
$$

其中 $\tilde\beta$ 恢复单位主瓣增益。MF 权重即符号功率本身，故随数据起伏；RF 权重恒定，故 RF 无数据相关泄漏，只付出噪声放大代价。ROI-MMF 形式 (23c) 是精确的。把闭式滤波器 (18) 写成 $\mathbf h^{\mathrm{ROI}}=\frac{\beta}{\lambda}(\mathbf x-\mathbf Z\mathbf b)$，其中最优幅度向量为

$$
\mathbf b=\left(\lambda\mathbf I+\mathbf Z^H\mathbf Z\right)^{-1}\mathbf Z^H\mathbf x, \tag{24}
$$

并注意 $\mathbf Z$ 的每一列为 $\mathbf x\odot\boldsymbol\phi_i$（$\boldsymbol\phi_i=\boldsymbol\phi(\Delta_i)$，$\theta_i(n)=\theta^{\Delta_i}(n)$，对应第 $i$ 个陷波滞后 $\Delta_i\in\mathcal S$ 的导向矢量与相位），则修正项可分解为

$$
\mathbf Z\mathbf b=\sum_{i\in\mathcal S}b_i\left(\mathbf x\odot\boldsymbol\phi_i\right)=\mathbf x\odot\sum_{i\in\mathcal S}b_i\boldsymbol\phi_i, \tag{25}
$$

于是滤波器逐元素写为 $h_n=\frac{\beta}{\lambda}x_n(1-\xi_n^*)$，增益 $a_n=h_n^*x_n$ 取 (23c) 的形式。数据相关修正为每个陷波滞后收集一个复指数：

$$
\xi_n=\sum_{i\in\mathcal S}b_i^*e^{j\theta_i(n)}. \tag{26}
$$

这些幅度恰是使滤波器在覆盖滞后处响应最小的取值。修正项 $\xi_n$ 在工作点处很小（附录 C 给出量化），故 (23) 中 MF 与 ROI-MMF 的增益以帧功率 $|x_n|^2$ 为主因子。因此下面分析建立在把 $|x_n|^2$ 分解为确定性均值与随机起伏之上：

$$
\lvert x_n\rvert^2=\underbrace{\bar p_n}_{p_p\ \text{或}\ p_d}+\underbrace{\psi_n}_{0\ (\text{导频})\ \text{或}\ p_d(\lvert s_n\rvert^2-1)\ (\text{数据})}. \tag{27}
$$

这里 $s_n$ 为元素 $n$ 承载的 $\mathbf S_d$ 载荷符号。导频恒模，不携带功率起伏；而载荷起伏由符号功率的方差支配：

$$
\kappa_2=\mathbb E\left[\left(|x|^2-1\right)^2\right]=\mu_4-1, \tag{28}
$$

第二个等式使用了单位功率 $\mathbb E[|x|^2]=1$。因此 (27) 的起伏满足

$$
\mathbb E[\psi_n]=0,\qquad\mathrm{Var}(\psi_n)=p_d^2\kappa_2,\quad n\in\mathcal D. \tag{29}
$$

统计量 $\kappa_2$ 对恒模星座为零，对 16-QAM 等于 0.32。在时延域，它是每种接收机底噪都与之成正比的唯一星座统计量 [21]。我们先刻画确定性均值分量，再处理随机起伏与滤波噪声。

**引理 1。** 在任意整数滞后 $\Delta=(q,k)\ne(0,0)$ 处，常规垂直梳帧的均值剖面满足 $\sum_{n=0}^{D-1}\bar p_ne^{-j\theta^\Delta(n)}=0$，除非 $k=0$ 且 $q$ 与梳谐波重合，$q_{\mathrm{gl}}\in\{\pm N/f_p,\pm2N/f_p,\ldots\}$，此时其等于 $(p_p-p_d)D_p$。因此，梳谐波处的确定性栅瓣响应为

$$
\left|\chi_{\mathrm{gl}}\right|^2=|\alpha_c|^2\left[(p_p-p_d)\eta\right]^2, \tag{30}
$$

而在其他所有滞后处 $\mathbb E[\chi(\Delta)]=0$。

**证明：** 由于 $\bar p_n=p_p$（$\mathcal P$ 上）与 $\bar p_n=p_d$（$\mathcal D$ 上），滞后 $\Delta=(q,k)$ 处的均值剖面可拆为

$$
\sum_{n=0}^{D-1}\bar p_ne^{-j\theta^\Delta(n)}=p_d\sum_{n_f=0}^{N-1}e^{-j2\pi qn_f/N}\sum_{n_t=0}^{M-1}e^{-j2\pi kn_t/M}+(p_p-p_d)\sum_{(n,m)\in\mathcal P}e^{-j2\pi\left(\frac{qn}{N}+\frac{km}{M}\right)}. \tag{31}
$$

对任意 $\Delta\ne(0,0)$，第一项由离散指数正交性为零。对垂直梳，第二项除非 $k=0$ 且 $qf_p\equiv0\ (\mathrm{mod}\ N)$，即处于梳谐波处，否则为零；在梳谐波处其等于 $(p_p-p_d)D_p$。除以 $D$ 并取平方，利用 $D_p/D=\eta$ 即得 (30)。

引理 1 表明，均匀功率帧（$\gamma=\eta$）具有完全平坦的均值剖面，因而无确定性伪影；相反，常规垂直梳上的任何导频功率提升 $\gamma>\eta$ 都恰在零多普勒响应上产生栅瓣，而距离切面与单元平均恒虚警率（constant false alarm rate，CFAR）窗口正是在此工作 [26]、[27]。因此功率不对称仅在栅瓣落在处理窗之外或被 $\mathcal S$ 覆盖时才可接受。引理 1 由此固定了设计目标的确定性项，并指出所提导频放置必须消除的障碍，之后 $\gamma>\eta$ 的提升才可使用。

下面转向底噪的随机分量，它把载荷起伏与滤波器通过的噪声结合起来。

**引理 2。** 在梳谐波之外的任意整数滞后 $\Delta$ 处，各接收机的滤波后单元功率满足

$$
\mathbb E\left[\left|\chi^{\mathrm{MF}}(\Delta)\right|^2\right]=|\alpha_c|^2\kappa_2^{\mathrm{eff}}+\sigma^2\frac{\delta_N^{\mathrm{MF}}}{D}, \tag{32a}
$$

$$
\mathbb E\left[\left|\chi^{\mathrm{RF}}(\Delta)\right|^2\right]=\sigma^2\frac{\delta_N^{\mathrm{RF}}}{D}, \tag{32b}
$$

$$
\mathbb E\left[\left|\chi^{\mathrm{ROI}}(\Delta)\right|^2\right]=\left[\frac{\lambda}{\lambda+D}\right]^2|\alpha_c|^2\kappa_2^{\mathrm{eff}}+\sigma^2\frac{\delta_N^{\mathrm{ROI}}}{D},\quad\Delta\in\mathcal S, \tag{32c}
$$

其中有效中心二阶矩为

$$
\kappa_2^{\mathrm{eff}}=(1-\eta)p_d^2\kappa_2, \tag{33}
$$

而 $\delta_N^{\mathrm{MF}}$、$\delta_N^{\mathrm{RF}}$、$\delta_N^{\mathrm{ROI}}$ 分别表示各接收机的单位增益噪声放大因子 $\delta_N=\|\mathbf h\|^2/D$，其闭式表达式由引理 3 给出。(32c) 式在陷波集上成立；在未覆盖滞后 $\Delta\notin\mathcal S$ 处，ROI-MMF 底噪在 $|\mathcal S|\kappa_2^{\mathrm{eff}}/D$ 的一阶精度内与 MF 底噪 (32a) 一致。

**证明：** 见附录 A。

底噪表达式 (32) 涉及单位增益噪声放大因子 $\delta_N$，它量化每种滤波器为其干扰行为付出的 SNR 代价；下述引理对三种接收机给出其闭式。

**引理 3。** 引理 2 中定义的噪声放大因子可闭式计算为

$$
\delta_N^{\mathrm{MF}}=1, \tag{34a}
$$

$$
\delta_N^{\mathrm{RF}}=\frac{1}{D}\left(\frac{D_p}{p_p}+\frac{D_d}{p_d}\nu_{-2}\right), \tag{34b}
$$

$$
\delta_N^{\mathrm{ROI}}\approx\frac{D}{D-\kappa_2^{\mathrm{eff}}|\mathcal S|}, \tag{34c}
$$

其中 (34a) 在帧能量相对起伏可忽略的意义下成立，(34c) 在 $|\mathcal S|/D$ 一阶精度内成立。

**证明：** 见附录 B。

(34) 中的一阶近似在 $|\mathcal S|\ll D$ 的区域成立，与本文声明 ROI 的前提一致。在此条件下，ROI-MMF 的附加噪声功率按 $|\mathcal S|/D$ 加权因而可忽略；而 RF 承担完全的星座相关代价 $\nu_{-2}$，当星座点靠近原点时该代价增大。

引理 2 与 3 共同确定了滤波后底噪的干扰与噪声水平，且星座与功率划分只通过 $\kappa_2^{\mathrm{eff}}$ 作用于该底噪——下面的目标分解与工作点选择都归结到它。

### B. 闭式目标分解

现在对 $(\mathrm P1)$ 目标作闭式求值。把 (18) 的 $\mathbf h^{\mathrm{ROI}}$ 代回 (16a)，目标仅剩发射变量。下述定理对该目标求值，并揭示各设计变量在何处起作用。

**定理 1。** 记 $\bar u_n=\mathbb E[h_n^*x_n]$ 为平均逐单元参考剖面。对单位增益 ROI-MMF 滤波器，$(\mathrm P1)$ 目标具有精确分解

$$
J=\underbrace{\lambda\mathbb E\|\mathbf h\|^2}_{\text{噪声控制（滤波器）}}
+\underbrace{\sum_{(q,k)\in\mathcal S}\left|\sum_{n=0}^{D-1}\bar u_n\left[\boldsymbol\phi(q,k)\right]_n\right|^2}_{\substack{\text{确定性导频模糊}\\\text{（放置 }\mathcal P\text{ 与提升 }\gamma\text{）}}}
+\underbrace{\kappa_2^{\mathrm{eff}}\Omega_{\mathbf h}(\mathcal S)}_{\substack{\text{载荷起伏}\\\text{（}\kappa_2\text{（星座）与 }p_d(\gamma)\text{）}}}, \tag{35}
$$

其中 $\kappa_2^{\mathrm{eff}}\Omega_{\mathbf h}(\mathcal S)=\sum_{(q,k)\in\mathcal S}\mathrm{Var}\left(\mathbf h^H(\mathbf x\odot\boldsymbol\phi(q,k))\right)\ge0$ 为中心化载荷项，在恒模端点处为零。在 $|\mathcal S|/D$ 一阶精度内，平均参考 $\bar u_n$ 退化为平均功率剖面 $\bar p_n$，且 ROI-MMF 的载荷权重为

$$
\Omega_{\mathbf h}=\left[\frac{\lambda}{\lambda+D}\right]^2D|\mathcal S|, \tag{36}
$$

它只依赖正则化参数与陷波集。

**证明：** 见附录 C。

**注 1。** 定理 1 揭示各设计变量的作用。星座只通过 $\kappa_2$ 进入：其成形因而在互信息与 $\kappa_2$ 之间折中，速率约束 (16d) 在该折中边界上选取工作点。导频设计两次进入：一次通过提升导频图样的确定性模糊，一次通过 $\kappa_2^{\mathrm{eff}}$ 内的载荷功率 $p_d=(1-\gamma)/(1-\eta)$。接收滤波器决定噪声项与载荷权重 $\Omega_{\mathbf h}$。由于 ROI-MMF 把覆盖滞后抑制到由 $\lambda$ 决定水平，载荷项在工作点处很小。因此 $\kappa_2^{\mathrm{eff}}$ 的感知相关效应来自未覆盖滞后处留下的干扰。

### C. 有效通信 SINR 与可达速率

为闭环设计，现给出闭式可达速率。对满足 $K_h\le N/f_p$ 的格点恒模导频，(12) 中的 Gram 矩阵恰好正交：

$$
\boldsymbol\Omega^H\boldsymbol\Omega=p_pD_p\mathbf I_{K_h}, \tag{37}
$$

这使残余误差的迹具有闭式。把估计误差视为附加的不相关噪声项，得到有效 SINR：

$$
\mathrm{SINR}_{\mathrm{eff}}(\gamma,\eta)=\frac{p_d/\sigma_c^2}{(p_d/\sigma_c^2)\mathrm{tr}(\mathbf C_\epsilon)+1}, \tag{38}
$$

其中残余误差的迹具有闭式

$$
\mathrm{tr}(\mathbf C_\epsilon)=\frac{K_h\sigma_h^2}{1+\sigma_h^2p_pD_p/\sigma_c^2}, \tag{39}
$$

只要 $\gamma\mathrm{SNR}_c\ge10^3K_h/D$（本文考虑的所有工作点均满足），该值保持在 $10^{-3}$ 以下，故 (38) 中估计误差的高斯处理是准确的。有效速率近似为

$$
R(\eta,\gamma,\mathcal X)=(1-\eta)I_{\mathcal X}\left(\mathrm{SINR}_{\mathrm{eff}}(\gamma,\eta)\right), \tag{40}
$$

其中 $I_{\mathcal X}$ 为星座受限互信息 [37]。值得注意的是，$(\eta,\gamma)$ 对通过 $\kappa_2^{\mathrm{eff}}$ 出现在感知底噪中，通过 $R$ 出现在通信速率中，因此感知与通信性能在同一组设计变量上彼此折中。然而仅最小化 $\kappa_2^{\mathrm{eff}}$ 会把星座推向恒模端点、把功率划分推向最大提升，二者都损害通信速率。

## IV. 联合星座与导频设计

本节基于第 III 节的闭式结果发展发射设计。

### A. 平衡交错导频放置

引理 2 把导频贡献从起伏底噪中移除，(33) 揭示载荷功率 $p_d^2$ 是乘性的底噪因子。因此把能量移向导频（$\gamma>\eta$）会降低底噪，并同时通过 (38) 改善载荷速率所依赖的信道估计。然而由引理 1，$\gamma\ne\eta$ 的常规垂直梳会在零多普勒响应上放置确定性栅瓣，故该提升只有在能消除它们的放置下才可用。

为此，把导频放在符号子集 $\mathcal T$ 上，并通过偏移向量 $\mathbf o$ 参数化放置：

$$
\mathcal P(\mathbf o)=\left\{(n,m):m\in\mathcal T,\ n=o_m\ (\mathrm{mod}\ f_p')\right\}, \tag{41}
$$

使每个承载导频的符号携带因子 $f_p'<f_p$、偏移为 $o_m$ 的全频带梳。符号轴上腾空的部分由每符号更密的梳补偿，因此导频数 $D_p$（从而密度 $\eta$）不变。偏移向量 $\mathbf o$ 的抽取使所得放置属于 (2) 的平衡集 $\mathcal B$，即每个子载波在整帧中携带相同数量 $c_p=D_p/N$ 的导频。功率 (6) 与提升界 (7) 不变，只有放置在二维网格上被重新分布。下述命题建立该构造的两个结构不变性。

**命题 1。** 对任意 $\gamma\in[\eta,\gamma_{\max}]$ 与 $\mathcal B$ 中任意放置，(i) 帧的频率边缘平均功率剖面完全平坦，即对每个 $n$ 有 $\sum_m\mathbb E|X_{n,m}|^2=M$，因此 (30) 的栅瓣在每个滞后处的零多普勒响应上恒等消失；(ii) 时延导向堆叠的导频 Gram 矩阵保持精确正交，$\boldsymbol\Omega^H\boldsymbol\Omega=p_pD_p\mathbf I_{K_h}$，从而闭式有效 SINR (38) 仍然精确。

**证明：** 见附录 D。

命题 1 严格强于引理 1 下方的加窗容许规则，因为它把容许功率不对称集扩大到 (7) 的整个区间 $\gamma\in[\eta,\gamma_{\max}]$，从而使整个提升范围都可用于工作点选择。命题 1 保证该结构增益在通信侧无代价，因为信道估计器与闭式速率仍与常规梳相同。被移位的导频功率起伏反而以二维掩模模糊的形式出现，由决定导频集 $\mathcal P$ 的偏移向量 $\mathbf o$ 参数化：

$$
A_{\mathbf o}(q,k)=\frac{1}{D_p^2}\left|\sum_{(n,m)\in\mathcal P}e^{-j2\pi\left(\frac{qn}{N}+\frac{km}{M}\right)}-\eta D\delta_{q,0}\delta_{k,0}\right|^2, \tag{42}
$$

它仅在 $k\ne0$ 处非零，本身也是一个设计自由度，分两步使用。首先，承载导频的符号位置取非周期：周期符号子集会把 (42) 集中为在其周期多普勒谐波处的确定性尖峰，而非周期子集把同一能量散布到多普勒轴上。其次，对已选位置，偏移置换最小化加权代价

$$
\min_{\mathbf o}\left\{\max_{(q,k)}A_{\mathbf o}+w_tA_{\mathbf o}^{\mathrm{top}\text{-}J}+w_r\max_{(q,k)\in\mathrm{ROI}}A_{\mathbf o}+w_m\bar A_{\mathbf o}^{\mathrm{ROI}}\right\}, \tag{43}
$$

其中 $A_{\mathbf o}^{\mathrm{top}\text{-}J}$ 为 $A_{\mathbf o}$ 在原点之外 $J$ 个最大值的均值，$\bar A_{\mathbf o}^{\mathrm{ROI}}$ 为它在声明 ROI 上的均值，$w_t,w_r,w_m>0$ 为优先考虑声明距离—多普勒 ROI 的固定权重。由于平衡放置构成一个置换类，(43) 由随机重启与保持平衡的成对偏移交换求解。当 $p_p\ne p_d$ 时，导频格点的非零多普勒谐波滞后被额外加入 $\mathcal S$，使掩模模糊的任何确定性分量都不在处理区域内残留。

### B. 星座成形与导频—数据功率分配

剩余变量为星座 $\mathcal X$ 与功率划分 $\gamma$。它们在底噪中只通过 (33) 的 $\kappa_2^{\mathrm{eff}}$ 进入，在速率中通过 (40) 进入；故把星座收紧到恒模与提升导频都会降低底噪，也都会降低载荷速率。速率约束 (16d) 解决该折中，且 $(\mathcal X^\star,\gamma^\star)$ 被联合选取。选择分两阶段进行：先构造一族 $C_4$ 对称的几何星座成形（geometric constellation shaping，GCS）集合并按 $\kappa_2$ 排序，随后在该族上于速率边界联合优化选取工作对。

我们用 $L/4$ 个自由复点经 $90^\circ$ 旋转复现来参数化 $L$ 元星座，$\mathcal X(\mathbf z)=\{j^rz_u:r\in\{0,1,2,3\},\ u=1,\ldots,L/4\}$，并归一化为单位平均功率。$C_4$ 对称保证每次迭代的均值严格为零且 I/Q 平衡，因此 (3) 由构造成立。设计目标为等概 AWGN 信道 $Y=x+n$（$n\sim\mathcal CN(0,1/s)$，$s$ 为评估 SNR）的精确有限字母互信息：

$$
I_{\mathcal X}(s)=\log_2L-\frac{1}{L}\sum_{i=1}^{L}\mathbb E_n\left[\log_2\sum_{j=1}^{L}e^{-s\left(|x_i-x_j+n|^2-|n|^2\right)}\right], \tag{44}
$$

它在训练中由 Monte Carlo 采样评估，在速率约束 (16d) 中由 Gauss–Hermite 求积评估。

**表 I　设计 SNR 为 10 dB 时等互信息的 $L=16$ 成形星座层级**

| $\rho$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| MI (bit) | 3.200 | 3.134 | 3.054 | 2.977 | 2.903 | 2.828 | 2.746 |
| $\kappa_2$ | 0.402 | 0.190 | 0.128 | 0.092 | 0.060 | 0.033 | 0.000 |
| $\nu_{-2}$ | 2.040 | 1.339 | 1.207 | 1.134 | 1.080 | 1.038 | 1.000 |

对每个接收滤波器，我们求解接收机匹配的矩约束问题

$$
\max_{\mathcal X\in C_4}\ I_{\mathcal X}\left(\mathrm{SNR}_c^{\mathrm{des}}\right)\quad\text{s.t.}\ \Gamma(\mathcal X)\le\tau_\rho, \tag{45}
$$

其中感知统计量 $\Gamma$ 按引理 2 与 3 匹配部署的接收机。具体而言，对 ROI-MMF（其底噪统计量与 MF 共享）取 $\Gamma=\mu_4$（等价地 $\kappa_2=\mu_4-1$）；对 RF 取 $\Gamma=\nu_{-2}$。约束水平 $\tau_\rho$ 在无约束的通信最优端点 $\rho=0$ 与恒模端点 $\rho=6$（对应 $L$-PSK）之间的七个取值上扫描。由于 (45) 非凸，为避免差的局部最优，每个层级都用带惩罚的梯度上升求解，并从 QAM、同心环与随机初值多重启动，同时从上一个更宽松层级热启动；在满足约束的运行中保留互信息最大的一个。按此方法遍历各层级可保持星座嵌套，该排序供工作点选择使用。

随后，通过交换目标与约束的角色，把各接收机匹配的星座集重新网格化到共同的七个等互信息目标 $\{I_\rho\}$ 上：

$$
\min_{\mathcal X\in C_4}\ \Gamma(\mathcal X)\quad\text{s.t.}\ I_{\mathcal X}\left(\mathrm{SNR}_c^{\mathrm{des}}\right)\ge I_\rho, \tag{46}
$$

由同样的带惩罚多重启动上升法求解。所得各层级在接收机特定集合之间相互匹配（汇总于表 I），使后续每次接收机比较在每个层级上都是等速率的。星座集在 $\mathrm{SNR}_c^{\mathrm{des}}=10$ dB 处构造一次并固定，工作点在声明的工作 SNR 下于其中选取。

给定通信 SNR（$\mathrm{SNR}_c$）与 QoS 要求 $\zeta$，把 (16d) 中的参考速率 $R_{\mathrm{base}}$ 实例化为均匀功率与参考密度下 16-QAM 帧的速率：

$$
R_{\mathrm{base}}=(1-\eta)I_{16\text{-}\mathrm{QAM}}\left(\mathrm{SINR}_{\mathrm{eff}}(\eta,\eta)\right). \tag{47}
$$

在由命题 1 消除栅瓣后，工作点选择从仅 $\mathcal X$ 扩展到对 $(\mathcal X,\gamma)$：

$$
\begin{aligned}
\left(\mathcal X^\star,\gamma^\star\right)=\arg\min_{\mathcal X\in C_4,\ \gamma\in[\eta,\gamma_{\max}]}\ &\kappa_2^{\mathrm{eff}}=(1-\eta)p_d^2\kappa_2(\mathcal X)\\
\text{s.t.}\quad&(1-\eta)I_{\mathcal X}\left(\mathrm{SINR}_{\mathrm{eff}}(\gamma,\eta)\right)\ge\zeta R_{\mathrm{base}},\\
&d_{\min}(\mathcal X)\ge d_0,
\end{aligned}\tag{48}
$$

其中 $d_0$ 为给定最小符号间距。

问题 (48) 通过逐一遍历表 I 的成形层级求解。对每个层级，提升 $\gamma$ 由速率约束 (16d) 上的二分法确定。对每个 $\kappa_2>0$ 的层级，底噪通过 $p_d^2$ 随提升严格下降，故最优 $\gamma^\star$ 就是满足 (16d) 的最大提升。在评估的每个工作点，该提升都严格低于上界 $\gamma_{\max}$，故速率约束在最优处是起作用的。

在表 I 的成形层级中，设计选取边界速率仍满足 (16d) 的最紧层级。由于各层级在速率与 $\kappa_2$ 上都是嵌套且有序的，该层级取得最小的可行 $\kappa_2^{\mathrm{eff}}$。最后说明导频密度的作用：密度 $\eta$ 是由标准固定的给定参数，QoS 基线在同密度下定义。设计对每个密度求解一次且对密度稳健，因为 $\kappa_2^{\mathrm{eff}}$ 与基线底噪共同的 $(1-\eta)$ 前因子在二者比值中相消，且边界载荷功率近似相等，故每个 $\eta$ 都给出相同的成形层级与底噪降低。

于是设计由三步得到：接收滤波器对每个发射帧由 (18) 闭式给出；放置由 (43) 的平衡交错构造固定；星座与功率划分由 (48) 选取。下面说明该序贯流程在何种意义下恢复 $(\mathrm P1)$ 的联合最优。

**命题 2。** 该三步流程在表 I 的成形层级上达到 $(\mathrm P1)$ 的一阶最优，精度受平衡导频放置的残余谐波滞后模糊限制。被忽略项比保留项小 $|\mathcal S|/D$ 倍。

**证明：** 见附录 E。

**注 2。** 所提流程单次遍历即处理 $(\mathrm P1)$。滤波器步是精确的，放置步是结构性的，而 $(\mathcal X,\gamma)$ 的选取是离散搜索——由定理 1 建立的目标对 $\kappa_2^{\mathrm{eff}}$ 的严格单调性，该搜索简化为单个成形层级的选择。

## V. 数值结果

本节通过全面数值仿真验证理论框架与所提联合设计。除另有说明，取 $N=256$ 个子载波、$M=32$ 个 OFDM 符号、带宽 50 MHz（对应距离单元尺寸 3 m），正则化参数 $\lambda=0.1$，参考导频密度 $\eta=1/8$ 处声明的 $\mathrm{SNR}_c=15$ dB，载频 $f_c=28$ GHz，CP 为 $T_{\mathrm{cp}}=T_{\mathrm u}/8$（对应速度单元尺寸 29.1 m/s），信道抽头数 $K_h=8$。评估场景在单元 $(0,0)$ 放置比噪声底噪高 40 dB 的格点杂波回波，目标 1 位于 $(-24,0)$，目标 2 位于 $(18,8)$，目标 SNR 均为 10 dB。声明 ROI 为两个目标周围半宽为 $(6,3)$ 与 $(8,3)$ 的矩形框，陷波集 $\mathcal S$ 为 (16) 下方定义的成对相对位移构造。每个 Monte Carlo 点对 1000 至 3000 次独立试验取平均。放置代价 (43) 用权重 $(w_t,w_r,w_m)=(0.25,0.60,0.15)$ 与 $J=24$，在 600 个随机平衡初值上最小化，其中最优的 8 个各由 500 次成对偏移交换精修，保留最好的 4 个。所有给出的底噪与陷波水平都是试验平均的均方功率。

MF、RF 与 ROI-MMF 基线在固定 16-QAM、均匀功率的发射信号上评估：对地图、切面与检测图使用 $\gamma=\eta$ 的格点导频帧，对估计基准使用全载荷帧。所提设计在选定成形层级 $\kappa_2=0.128$ 处、以速率边界上的提升 $\gamma^\star$ 工作，图中标记为 "Full joint"（全联合）。所有速率都通过声明 SNR 下同一有效 SINR (38) 报告。

### A. 联合星座与导频设计

图 3 给出 $L\in\{16,64\}$ 的星座集，它们由接收机匹配矩约束 (45) 下最大化互信息得到，从感知最优的恒模端点扫到通信最优端点。对每个阶数，$\mu_4$ 约束集由 MF 与 ROI-MMF 共享，$\nu_{-2}$ 约束集服务于 RF，每个子图标注等互信息目标与设计 SNR 下相应的矩。在恒模端点，每个阶数的两个星座集都与 $L$-PSK 重合，此时 $\mu_4=1$（$\kappa_2=0$）且 $\nu_{-2}=1$。趋向通信最优端点时，$\mu_4$ 约束集在近乎均匀的环占用下降低功率离散度，而 $\nu_{-2}$ 约束集额外把点推离原点，与引理 2、3 的接收机特定统计量一致。等互信息保证在每个层级上，各阶数的星座集都在相同互信息下工作。

图 4 在工作点验证命题 1 的两部分。尽管有 $\gamma^\star>\eta$ 的提升，平衡放置未在零多普勒响应上留下确定性栅瓣；而相同提升下的常规垂直梳恰在谐波滞后 $\pm N/f_p,\pm2N/f_p,\ldots$ 处出现栅瓣，其水平与闭式 (30) 一致。此外，优化后的偏移排序把被移位的导频模糊 (42) 限制在声明 ROI 之外的少数非零多普勒混叠线上。

### B. 全帧 OFDM-ISAC 的感知性能

图 5 在零多普勒与多普勒切面上检验 (32) 预测的滤波后底噪，比较 $\gamma=\eta$ 下 16-QAM 与等互信息成形的 MF、RF 基线以及固定工作点下的所提联合设计。MF 输出在整条切面上都保留高底噪——无论 16-QAM 还是成形星座——弱目标不能清晰突出。RF 输出在噪声水平附近平坦，以引理 3 的 $\nu_{-2}$ 放大代替载荷底噪。相反，所提联合设计把声明区域抑制到噪声水平，使弱目标在其中清晰可见；其未覆盖底噪在声明 QoS 水平 $\zeta=0.98$ 下低于 MF 底噪，正如 $\kappa_2^{\mathrm{eff}}$ 的降低所预示。此外，提升 $\gamma^\star>\eta$ 不产生栅瓣，这证实平衡放置如命题 1 所建立的那样消除了确定性栅瓣响应。

图 6 在二维地图上重复该比较，其中遮蔽是逐单元判定的。MF 下两个目标单元处的响应为 $-44.5$ dB，这是 $\kappa_2^{\mathrm{eff}}$ 底噪的水平而非目标的水平，故两个目标都无法与其周围分离。所提联合设计下两个目标高出陷波水平 $+49$ dB，清晰可检测。未覆盖底噪相对 16-QAM ROI-MMF 也下降 4.3 dB，与声明 QoS 水平下预测的 $\kappa_2^{\mathrm{eff}}$ 降低 4.4 dB 高度一致。

图 7(a) 检验 MF 与 RF（分别在固定 16-QAM 与等互信息成形几何上评估）以及所提联合设计的时延估计精度，其中距离估计由矩阵束（matrix-pencil）估计器 [38] 按 [21] 的方式得到。虚线为根 CRB（RCRB）。应用标准 Fisher 信息分析可得逐目标界

$$
\mathrm{RCRB}_{\hat r_i}=\frac{c}{2N\Delta f}\sqrt{\frac{\sigma^2N^2}{8\pi^2|\alpha_i|^2\sum_{n_f=-N/2}^{N/2-1}n_f^2}},\qquad
\mathrm{RCRB}_{\hat v_i}=\frac{c}{2f_cMT_{\mathrm o}}\sqrt{\frac{\sigma^2M^2}{8\pi^2N|\alpha_i|^2\sum_{n_t=-M/2}^{M/2-1}n_t^2}}, \tag{49}
$$

单位分别为米与米/秒 [12]，其中前导因子是第 II-C 节的距离单元与速度单元尺寸，子载波与符号索引关于频带中心与帧中心对称取值，速度界中的因子 $N$ 是距离匹配的相干增益。MF 曲线对 16-QAM 与成形载荷都变平，两个底噪之差等于成形降低 $\kappa_2^{\mathrm{eff}}$ 的幅度。RF 曲线在整个扫描范围内与 RCRB 平行，与常数乘性间隙 $\sqrt{\nu_{-2}}$ 一致。最后，所提联合设计最贴近该界：目标 SNR 为 $+10$ dB 时达到 0.025 m，而界为 0.023 m。图 7(b) 在多普勒轴上重复该比较，对每个目标距离处的慢时间序列施加同一估计器。观察到相同的排序，所提联合设计同样最贴近该界：同一目标 SNR 下达到 0.042 m/s，而界为 0.040 m/s。

图 8 检验声明 ROI 内 $P_{\mathrm{FA}}=10^{-4}$ 的 CFAR 处理下的弱目标检测概率，它由引理 2 的滤波后底噪支配、因而由 $\kappa_2^{\mathrm{eff}}$ 支配。由 (32a)，被覆盖的杂波以底噪超出量抬高 CFAR 训练单元：

$$
\Delta_{\mathrm{ex}}=10\log_{10}\left(1+\frac{|\alpha_c|^2\kappa_2^{\mathrm{eff}}}{\sigma^2}\right). \tag{50}
$$

实测超出量为：16-QAM MF 为 $+34.5$ dB（与 (50) 一致），成形载荷为 $+32.2$ dB。RF 的超出量保持在 $+2.5$ dB 以下，反映其 $\nu_{-2}$ 代价；而所提设计基本无超出，因为被覆盖的干扰在区域内已被抑制。因此所提设计取得最小的检测门限：$P_D=0.9$ 的门限从所提设计的 $-27$ dB 到 MF 的 $+7$ dB，相差 34 dB，与引理 2 的 $\kappa_2^{\mathrm{eff}}$ 排序一致。

### C. 感知—通信折中

最后，图 9 通过在一次发射扫描的等互信息约定下把成形星座扫过估计基准，刻画速率约束 (16d) 所施加的整体感知—通信折中：MF、RF 与所提联合设计在全部七个成形层级上接收同一发射扫描（取自所提设计的等互信息成形族）。在恒模端点三条链路重合，$L=16$ 与 $64$ 分别为 0.0233 m 与 0.0231 m，此时所提设计在 $\kappa_2=0$ 处释放提升（$\gamma\to\eta$）。趋向通信最优端点时，MF 的 RMSE 增加一倍以上，RF 承担不断增大的噪声代价，而所提联合设计在每个层级上都最低，相较 RF 的余量在 $L=16$ 与 $64$ 时分别为 13% 与 22%。余量随阶数增大的原因在于高阶成形载荷把点放得更靠近原点，故 $\nu_{-2}$ 随阶数增大，与引理 3 一致。这些结果证实所提联合设计把可达的感知—通信折中区域扩展到任何固定收发组合之外。

## VI. 结论

本文提出了全帧 OFDM-ISAC 的联合收发设计框架，其中调制星座、导频位置与功率划分、以及接收滤波器在给定通信速率要求下作为单一优化问题设计。分析表明，所提 ROI-MMF 的载荷诱导干扰底噪由单一统计量——有效中心二阶矩——支配。受此结果指导，接收滤波器以闭式得到；平衡交错导频放置在无牺牲信道估计精度的前提下消除确定性栅瓣；星座功率工作点在速率边界上选取。仿真证实：闭式表达式与测量一致；常规处理下被遮蔽的弱目标在声明 QoS 水平下恢复到清晰可检测；测距与速度估计精度紧密跟踪 CRB。因此，整个 OFDM 帧——导频与数据载荷一视同仁——都能以很小且已声明的通信速率代价充当高质量感知参考。

## 附录 A：引理 2 的证明

全文记 $\boldsymbol\phi_\Delta$ 表示滞后 $\Delta=(q,k)$ 对应的 $\boldsymbol\phi(q,k)$。把 (27) 代入 (22) 得

$$
\chi(\Delta)=\frac{\alpha_c}{D}\sum_{n=0}^{D-1}\bar p_ne^{-j\theta^\Delta(n)}+\chi_\psi+\chi_w,\qquad
\chi_\psi=\frac{\alpha_c}{D}\sum_{n\in\mathcal D}\psi_ne^{-j\theta^\Delta(n)}, \tag{51}
$$

其中确定性求和由引理 1 在梳谐波之外为零。由于 $\psi_n$ 由 (29) 独立同分布且零均值，

$$
\mathbb E\left[|\chi_\psi|^2\right]=\frac{|\alpha_c|^2}{D^2}\sum_{n\in\mathcal D}\mathrm{Var}(\psi_n)=\frac{|\alpha_c|^2}{D^2}D_dp_d^2\kappa_2=\frac{|\alpha_c|^2\kappa_2^{\mathrm{eff}}}{D}, \tag{52}
$$

其中 $D_d/D=1-\eta$；滤波噪声功率为 $\mathbb E[|\chi_w|^2]=\sigma^2\|\mathbf h\|^2/D^2=\sigma^2\delta_N/D$。两项相加即得 (32a)。对 RF，(23) 中 $a_n=1$，故仅噪声项给出 (32b)。导频单元因恒模而满足 $\psi_n=0$，这证明了导频排除的论断。

把 (18) 写成 $\mathbf h^{\mathrm{ROI}}=\beta(\mathbf x-\mathbf Z\mathbf b)/\lambda$，其中 $\mathbf b=(\lambda\mathbf I+\mathbf Z^H\mathbf Z)^{-1}\mathbf Z^H\mathbf x$。覆盖滞后处的响应为 $\mathbf Z^H\mathbf h^{\mathrm{ROI}}$ 的条目：

$$
\mathbf Z^H\mathbf h^{\mathrm{ROI}}=\frac{\beta}{\lambda}\left(\mathbf Z^H\mathbf x-\mathbf Z^H\mathbf Z\mathbf b\right)=\beta\left(\lambda\mathbf I+\mathbf Z^H\mathbf Z\right)^{-1}\mathbf Z^H\mathbf x. \tag{53}
$$

利用 $\mathbf Z^H\mathbf Z\approx D\mathbf I$、$\beta\approx\lambda$（附录 B）以及由 (52) 得到的 $\mathbb E\left|\left[\mathbf Z^H\mathbf x\right]_\Delta\right|^2=D\kappa_2^{\mathrm{eff}}$，有

$$
\mathbb E\left|\mathbf h_{\mathrm{ROI}}^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)\right|^2\approx\left(\frac{\lambda}{\lambda+D}\right)^2D\kappa_2^{\mathrm{eff}},\quad\Delta\in\mathcal S, \tag{54}
$$

与上述滤波噪声功率结合即得 (32c)。在未覆盖滞后 $\Delta\notin\mathcal S$ 处，

$$
\mathbf h_{\mathrm{ROI}}^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)=\frac{\beta}{\lambda}\left[\mathbf x^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)-\sum_{i\in\mathcal S}b_i^*\mathbf z_i^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)\right], \tag{55}
$$

其中第一项由 (52) 具有功率 $D\kappa_2^{\mathrm{eff}}$。第二项中，由 (53) 有 $\mathbb E|b_i|^2\approx D\kappa_2^{\mathrm{eff}}/(\lambda+D)^2$ 且 $|\mathcal S|$ 个求和项不相关，故

$$
\mathbb E\left|\sum_{i\in\mathcal S}b_i^*\mathbf z_i^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)\right|^2\approx|\mathcal S|\frac{D\kappa_2^{\mathrm{eff}}}{(\lambda+D)^2}D\kappa_2^{\mathrm{eff}}\approx|\mathcal S|\left(\kappa_2^{\mathrm{eff}}\right)^2, \tag{56}
$$

它与直接项 $D\kappa_2^{\mathrm{eff}}$ 之比为 $|\mathcal S|\kappa_2^{\mathrm{eff}}/D$，故未覆盖底噪在一阶精度内不变。■

## 附录 B：引理 3 的证明

1) **MF：** 单位增益归一化给出

$$
\delta_N^{\mathrm{MF}}=\frac{D}{\|\mathbf x\|^2},\qquad\mathbb E\|\mathbf x\|^2=D,\qquad\mathrm{Var}\left(\|\mathbf x\|^2\right)=D\kappa_2^{\mathrm{eff}}, \tag{57}
$$

故 $\delta_N^{\mathrm{MF}}=1$，误差为相对起伏 $\sqrt{\kappa_2^{\mathrm{eff}}/D}$。

2) **RF：** 取 $h_n=1/x_n^*$，约束 $\mathbf h^H\mathbf x=D$ 精确成立，且

$$
\mathbb E\|\mathbf h\|^2=\sum_{n\in\mathcal P}\frac{1}{p_p}+\sum_{n\in\mathcal D}\frac{1}{p_d}\mathbb E\left[\frac{1}{|s_n|^2}\right]=\frac{D_p}{p_p}+\frac{D_d}{p_d}\nu_{-2}, \tag{58}
$$

即 (34b)。

3) **ROI-MMF：** (17) 的约束最小化元为 $\mathbf h=\mu(\lambda\mathbf I+\mathbf Z\mathbf Z^H)^{-1}\mathbf x$，$\mu$ 由 $\mathbf h^H\mathbf x=D$ 确定；于是令 $\mathbf A=(\lambda\mathbf I+\mathbf Z\mathbf Z^H)^{-1}$，

$$
\delta_N=\frac{\|\mathbf h\|^2}{D}=\frac{D\mathbf x^H\mathbf A^2\mathbf x}{\left(\mathbf x^H\mathbf A\mathbf x\right)^2}. \tag{59}
$$

把 $\mathbf x$ 拆为其在约束张成空间中的分量与正交余项。Gram 矩阵集中于缩放的单位阵：

$$
\left[\mathbf Z^H\mathbf Z\right]_{ii}=\|\mathbf x\|^2\approx D,\qquad\mathbb E\left|\left[\mathbf Z^H\mathbf Z\right]_{ij}\right|^2=D\kappa_2^{\mathrm{eff}},\ i\ne j, \tag{60}
$$

因为每个非对角元都是 (52) 的起伏求和。同样 $\mathbb E|\mathbf z_i^H\mathbf x|^2/D=\kappa_2^{\mathrm{eff}}$，故张成空间占 $\kappa_2^{\mathrm{eff}}|\mathcal S|$，余项占 $D-\kappa_2^{\mathrm{eff}}|\mathcal S|$。对提升后的帧，附加到 $\mathcal S$ 的谐波滞后 $\mathcal S_{\mathrm{harm}}$ 增加 (42) 的掩模模糊能量，其上界为

$$
\frac{1}{D}\sum_{\Delta\in\mathcal S_{\mathrm{harm}}}\left|\sum_{n=0}^{D-1}\bar p_ne^{-j\theta^\Delta(n)}\right|^2\le(p_p-p_d)^2\eta(1-\eta)D, \tag{61}
$$

因为由 Parseval 定理，所有非零滞后上的总和等于 $D\sum_{n=0}^{D-1}(\bar p_n-1)^2=(p_p-p_d)^2\eta(1-\eta)D^2$，且在工作提升下该附加量可忽略。由于 $\mathbf A$ 以增益 $1/\lambda$ 通过余项、以增益 $1/(\lambda+D)$ 通过张成空间，(59) 中两个二次型都由余项支配：

$$
\mathbf x^H\mathbf A\mathbf x\approx\frac{D-\kappa_2^{\mathrm{eff}}|\mathcal S|}{\lambda},\qquad\mathbf x^H\mathbf A^2\mathbf x\approx\frac{D-\kappa_2^{\mathrm{eff}}|\mathcal S|}{\lambda^2}, \tag{62}
$$

代入 (59) 得

$$
\delta_N^{\mathrm{ROI}}=\frac{D}{D-\kappa_2^{\mathrm{eff}}|\mathcal S|} \tag{63}
$$

误差为小 $|\mathcal S|/D$ 的修正，即 (34c)。此外 (62) 给出附录 A 所用的常数 $\beta\approx\lambda$。■

## 附录 C：定理 1 的证明

固定发射设计以及单位增益滤波器 $\mathbf h(\mathbf x)=\tilde\beta(\mathbf x\odot\mathbf w)$，使 $h_n^*x_n=\tilde\beta^*w_n^*|x_n|^2$。MF 有 $\mathbf w=\mathbf 1$，ROI-MMF 有 $w_n=1-\xi_n$，$\xi_n$ 为陷波修正 (26)，其一阶均方为 $|\mathcal S|\kappa_2^{\mathrm{eff}}/D$。对位移 $\Delta\in\mathcal S$，定义

$$
S_\Delta=\mathbf h^H\left(\mathbf x\odot\boldsymbol\phi(\Delta)\right)=\sum_{n=0}^{D-1}h_n^*x_ne^{-j\theta^\Delta(n)}. \tag{64}
$$

把每项拆为均值与中心化部分，$\mathbb E|S_\Delta|^2=|\mathbb E S_\Delta|^2+\mathrm{Var}(S_\Delta)$，并对 $\mathcal S$ 求和得

$$
\mathbb E\sum_{\Delta\in\mathcal S}\left|S_\Delta\right|^2=\sum_{\Delta\in\mathcal S}\left|\sum_{n=0}^{D-1}\bar u_ne^{-j\theta^\Delta(n)}\right|^2+\kappa_2^{\mathrm{eff}}\Omega_{\mathbf h}(\mathcal S), \tag{65}
$$

其中对 $\kappa_2^{\mathrm{eff}}>0$ 定义载荷权重

$$
\Omega_{\mathbf h}(\mathcal S)=\frac{1}{\kappa_2^{\mathrm{eff}}}\sum_{\Delta\in\mathcal S}\mathrm{Var}\left(S_\Delta\right), \tag{66}
$$

该求和汇集覆盖滞后的载荷方差。把 $\lambda\mathbb E\|\mathbf h\|^2$ 加到 (65) 即得 (35)。

在 $|\mathcal S|/D$ 一阶精度内，把 (27) 代入 $\bar u_n=\mathbb E[h_n^*x_n]$ 得

$$
\bar u_n=\bar p_n\mathbb E\left[\tilde\beta^*w_n^*\right]+\mathbb E\left[\tilde\beta^*w_n^*\psi_n\right], \tag{67}
$$

其第二项小 $|\mathcal S|/D$，故 $\bar u_n$ 退化为 $\bar p_n$，而 (35) 的确定性项由命题 1 在非零多普勒谐波之外消失。

取 $\mathbf w=\mathbf 1$、$\tilde\beta=D/\|\mathbf x\|^2\approx1$，有

$$
\mathrm{Var}(S_\Delta)=\sum_{n\in\mathcal D}\mathrm{Var}(\psi_n)=D\kappa_2^{\mathrm{eff}}\ \Longrightarrow\ \Omega_{\mathbf h}^{\mathrm{MF}}=D|\mathcal S|. \tag{68}
$$

对 ROI-MMF，代入 (18) 并利用 (53) 中的 $\mathbf Z^H\mathbf Z\approx D\mathbf I$、$\beta\approx\lambda$，得

$$
\mathbf h^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)=\frac{\lambda}{\lambda+D}\sum_{n\in\mathcal D}\psi_ne^{-j\theta^\Delta(n)}\ \Longrightarrow\ \Omega_{\mathbf h}^{\mathrm{ROI}}=\left[\frac{\lambda}{\lambda+D}\right]^2D|\mathcal S|, \tag{69}
$$

即 (36)。被忽略项小 $|\mathcal S|/D$，且主载荷项是 $\kappa_2^{\mathrm{eff}}$ 的正倍数，故在同一精度下目标关于 $\kappa_2^{\mathrm{eff}}$ 严格递增。■

## 附录 D：命题 1 的证明

(i) 由 (2)，每个子载波携带相同数量 $c_p=D_p/N=\eta M$ 的导频，故对每个 $n$，

$$
\sum_{m=0}^{M-1}\mathbb E|X_{n,m}|^2=c_pp_p+(M-c_p)p_d=M\left(\eta p_p+(1-\eta)p_d\right)=M \tag{70}
$$

由 (5) 成立，且与 $n$、$\gamma$ 无关。零多普勒确定性响应是该平坦剖面的 DFT，即滞后零处的单个尖峰。(ii) 对抽头 $\ell,\ell'$，平衡计数使导频子载波多重集等于重复 $c_p$ 次的 $\{0,\ldots,N-1\}$，故

$$
\left[\boldsymbol\Omega^H\boldsymbol\Omega\right]_{\ell,\ell'}=p_p\sum_{(n,m)\in\mathcal P}e^{j2\pi(\ell-\ell')n/N}=p_pc_p\sum_{n=0}^{N-1}e^{j2\pi(\ell-\ell')n/N}=p_pD_p\delta_{\ell,\ell'}, \tag{71}
$$

证毕。■

## 附录 E：命题 2 的证明

令 $\mathbf h^{\mathrm{ROI}}$ 表示在 $\mathbf x$ 处求值的逐实现滤波器 (18)。固定满足 (16d) 的一对 $(\mathcal X,\gamma)$。对任意放置 $\mathcal P\in\mathcal B$ 与任意满足 (16c) 的滤波器策略 $\mathbf h(\cdot)$，$(\mathrm P1)$ 的目标满足

$$
\begin{aligned}
\mathbb E\Big[\lambda\|\mathbf h(\mathbf x)\|^2+\sum_{\Delta\in\mathcal S}\left|\mathbf h(\mathbf x)^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)\right|^2\Big]
&\overset{(a)}{\ge}\lambda\mathbb E\|\mathbf h^{\mathrm{ROI}}\|^2+\mathbb E\sum_{\Delta\in\mathcal S}\left|\mathbf h_{\mathrm{ROI}}^H\left(\mathbf x\odot\boldsymbol\phi_\Delta\right)\right|^2\\
&\overset{(b)}{=}\lambda\mathbb E\|\mathbf h^{\mathrm{ROI}}\|^2+\sum_{\Delta\in\mathcal S}\left|\sum_{n=0}^{D-1}\bar u_n\left[\boldsymbol\phi_\Delta\right]_n\right|^2+\kappa_2^{\mathrm{eff}}\Omega_{\mathbf h}(\mathcal S)\\
&\overset{(c)}{\ge}\lambda\mathbb E\|\mathbf h^{\mathrm{ROI}}\|^2+\kappa_2^{\mathrm{eff}}\Omega_{\mathbf h}(\mathcal S)=:J(\mathcal X,\gamma).
\end{aligned}\tag{72}
$$

步骤 (a) 成立是因为期望跨实现解耦，故关于 $\mathbf h(\cdot)$ 的最小值就是逐实现 ROI-MMF（(17)–(18)）。步骤 (b) 即 (65)。步骤 (c) 丢弃确定性项；该确定性项由命题 1(i) 在 $\mathcal S$ 的每个滞后处为零（非零多普勒谐波处除外），而在那里它由 (61) 界住并被放置代价 (43) 抑制——后者作为该残余的替代指标。因此 $J$ 在所述精度内与放置无关。

由 (69) 与引理 3，$J$ 的两项都只通过 $\kappa_2^{\mathrm{eff}}$ 依赖发射变量并随其增大，故在 (16d) 约束下最小化 $J$ 恰为 (48)。把 (38) 写为

$$
\mathrm{SINR}_{\mathrm{eff}}=\left[\mathrm{tr}(\mathbf C_\epsilon)+\sigma_c^2/p_d\right]^{-1}, \tag{73}
$$

其分母关于 $\gamma$ 凸，故 $\mathrm{SINR}_{\mathrm{eff}}$ 拟凹，$R$ 经由单调的 $I_{\mathcal X}$ 也拟凹，(16d) 的可行集是区间。因此单调的 $\kappa_2^{\mathrm{eff}}$ 在最大可行提升处取得最小值，而各层级的速率与 $\kappa_2^{\mathrm{eff}}$ 排序选出最紧的可行层级。所得的 $(\mathcal X^\star,\gamma^\star)$ 连同 $\mathcal P^\star$ 与 $\mathbf h^{\mathrm{ROI}}$ 即为三步流程的输出。证毕。■

## 图注与表注

**图 1：** 以通信为中心的 OFDM-ISAC 系统模型（基站同时服务一个通信用户并在杂波环境中感知多个目标，通信与感知共享同一 OFDM 帧）。

**图 2：** (a) 常规与 (b) 所提全帧 OFDM 发射信令结构（梳状导频与传统星座替换为平衡交错导频与成形星座）。

**图 3：** 接收机特定的 $C_4$ 对称 GCS 星座集：（a）$L=16$；（b）$L=64$；在设计 SNR 为 10 dB 处扫过七个等互信息成形层级（各子图标注该层级对应的 $\mu_4$ 或 $\nu_{-2}$ 与互信息值）。

**图 4：** $\eta=1/16$ 与 $1/8$、工作提升 $\gamma^\star$ 下的导频设计诊断：（a）（b）为平衡交错掩模；（c）（d）为提升后常规垂直梳与平衡放置的零多普勒响应（横轴为距离单元，纵轴为确定性响应 dB）。

**图 5：** $\eta=1/8$（$\zeta=0.98$、杂波高于底噪 40 dB、目标 SNR 10 dB）下的距离—多普勒场景切面；左图为零多普勒、穿过杂波与目标 1 的距离切面，右图为目标 2 距离处的多普勒切面；对比 MF（16QAM）、RF（16QAM）、MF（$M=16$ GCS）、RF（$M=16$ GCS）与 Full joint。

**图 6：** 距离—多普勒地图：左为 16-QAM MF 基线的结果，右为所提联合设计的结果（$\eta=1/8$、$\gamma^\star=0.167$、$\zeta=0.98$）；虚线框标出声明 ROI。

**图 7：** 声明 ROI 内两个目标的（a）测距 RMSE 与（b）测速 RMSE 随目标 SNR 的变化（$\eta=1/8$、$\zeta=0.98$）；对比 MF（16QAM）、RF（16QAM）、MF（$M=16$ GCS）、RF（$M=16$ GCS）、Full joint，并给出 RCRB 曲线。

**图 8：** CFAR 下的弱目标检测概率（横轴为目标 SNR）。

**图 9：** 测距 RMSE 与载荷互信息之间的感知—通信折中：（a）$L=16$；（b）$L=64$。

**表 I：** 设计 SNR 为 10 dB 时等互信息的 $L=16$ 成形星座层级。$\rho$ 取 0–6 七级，对应互信息 3.200、3.134、3.054、2.977、2.903、2.828、2.746 bit，对应 $\kappa_2$ 为 0.402、0.190、0.128、0.092、0.060、0.033、0.000，对应 $\nu_{-2}$ 为 2.040、1.339、1.207、1.134、1.080、1.038、1.000（逐格见正文表 I）。

> **原文说明：** 原文无致谢/基金段落、无独立附录索引页；正文第 V 节后直接为结论与附录 A–E。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 13 页转录；未逐条核对 DOI）。

[1] F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar, and S. Buzzi, "Integrated sensing and communications: Towards dual-functional wireless networks for 6G and beyond," IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, Jun. 2022.

[2] F. Liu, C. Masouros, A. P. Petropulu, H. Griffiths, and L. Hanzo, "Joint radar and communication design: Applications, state-of-the-art, and the road ahead," IEEE Trans. Commun., vol. 68, no. 6, pp. 3834–3862, 2020.

[3] J. A. Zhang, F. Liu, C. Masouros, R. W. Heath, Z. Feng, L. Zheng, and A. Petropulu, "An overview of signal processing techniques for joint communication and radar sensing," IEEE J. Sel. Topics Signal Process., vol. 15, no. 6, pp. 1295–1315, 2021.

[4] X. Luo, Q. Lin, R. Zhang, H.-H. Chen, X. Wang, and M. Huang, "ISAC–A Survey on Its Layered Architecture, Technologies, Standardizations, Prototypes and Testbeds," IEEE Communications Surveys & Tutorials, 2025.

[5] C. Sturm and W. Wiesbeck, "Waveform design and signal processing aspects for fusion of wireless communications and radar sensing," Proc. IEEE, vol. 99, no. 7, pp. 1236–1259, 2011.

[6] F. Liu, Y. Zhang, Y. Xiong, S. Li, W. Yuan, F. Gao, S. Jin, and G. Caire, "CP-OFDM achieves the lowest average ranging sidelobe under QAM/PSK constellations," IEEE Trans. Inf. Theory, 2025.

[7] W. Zhu, Y. Han, L. Wang, L. Xu, Y. Zhang, and A. Fei, "Pilot optimization for OFDM-based ISAC signal in emergency IoT networks," IEEE Internet Things J., vol. 11, no. 18, pp. 29 600–29 614, 2023.

[8] M. Hua, Q. Wu, W. Chen, A. Jamalipour, C. Wu, and O. A. Dobre, "Integrated sensing and communication: Joint pilot and transmission design," IEEE Trans. Wireless Commun., 2024.

[9] 3GPP, "NR; Physical Channels and Modulation," 3rd Generation Partnership Project (3GPP), Tech. Rep. TS 38.211, Apr. 2019.

[10] Z. Du, F. Liu, Y. Xiong, T. X. Han, Y. C. Eldar, and S. Jin, "Reshaping the ISAC tradeoff under OFDM signaling: A probabilistic constellation shaping approach," IEEE Trans. Signal Process., 2024.

[11] F. Liu, Y. Xiong, S. Lu, S. Li, W. Yuan, C. Masouros, S. Jin, and G. Caire, "Uncovering the iceberg in the sea: Fundamentals of pulse shaping and modulation design for random ISAC signals," IEEE Trans. Signal Process., 2025.

[12] K. Han, K. Meng, A. Chatzicharistou, and C. Masouros, "Constellation design in OFDM-ISAC over data payloads: From MSE analysis to experimentation," in ICC 2026-IEEE International Conference on Communications. IEEE, 2026, pp. 1–6.

[13] C. Xu, X. Yu, F. Liu, and S. Jin, "Exploiting both pilots and data payloads for integrated sensing and communications," IEEE Transactions on Wireless Communications, 2025.

[14] K. Han, C. Masouros, T. Riihonen, and M. G. Amin, "Next-generation MIMO transceivers for integrated sensing and communications: Unique security vulnerabilities and solutions," Proceedings of the IEEE, 2026.

[15] S. Lu, F. Liu, F. Dong, Y. Xiong, J. Xu, Y.-F. Liu, and S. Jin, "Random ISAC signals deserve dedicated precoding," IEEE Transactions on Signal Processing, vol. 72, pp. 3453–3469, 2024.

[16] K. Meng, K. Han, C. Masouros, and F. Liu, "Constellation Selection and Power Control for OFDM-based ISAC: From Theory to Prototype," IEEE Transactions on Signal Processing, 2026.

[17] P. Wojaczek, F. Colone, D. Cristallini, and P. Lombardo, "Reciprocal-filter-based STAP for passive radar on moving platforms," IEEE Trans. Aerosp. Electron. Syst., vol. 55, no. 2, pp. 967–988, 2018.

[18] J. T. Rodriguez, F. Colone, and P. Lombardo, "Supervised reciprocal filter for OFDM radar signal processing," IEEE Trans. Aerosp. Electron. Syst., vol. 59, no. 4, pp. 3871–3889, 2023.

[19] K. Han, K. Meng, and C. Masouros, "Sensing-Secure ISAC: Ambiguity Function Engineering for Impairing Unauthorized Sensing," IEEE Trans. Wireless Commun., 2025.

[20] M. F. Keskin, M. M. Mojahedian, J. O. Lacruz, C. Marcus, O. Eriksson, A. Giorgetti, J. Widmer, and H. Wymeersch, "Fundamental trade-offs in monostatic ISAC: A holistic investigation towards 6G," IEEE Trans. Wireless Commun., 2025.

[21] D. Yang, K. Meng, C. Masouros, and K. Han, "Constellation-Independent Range Estimation in Payload-Based OFDM-ISAC," IEEE Wireless Communications Letters, 2026.

[22] B. Geiger, F. Liu, S. Lu, A. Rode, D. G. Gaviria, C. Muth, and L. Schmalen, "Constellation shaping for OFDM-ISAC systems: From theoretical bounds to practical implementation," IEEE Transactions on Communications, 2026.

[23] X. Yang, R. Zhang, D. Zhai, F. Liu, R. Du, and T. X. Han, "Constellation design for integrated sensing and communication with random waveforms," IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 17 415–17 428, 2024.

[24] Y. Liu, Y. Guo, Y. Gu, M. Wang, J. Liu, and B. Xia, "Probabilistic shaping based ISAC systems with finite constellations: Analysis and optimization," IEEE Transactions on Wireless Communications, 2025.

[25] M. F. Keskin, H. Wymeersch, and V. Koivunen, "MIMO-OFDM joint radar-communications: Is ICI friend or foe?" IEEE J. Sel. Topics Signal Process., vol. 15, no. 6, pp. 1393–1408, 2021.

[26] F. Zhang, T. Mao, R. Liu, Z. Han, S. Chen, and Z. Wang, "Cross-domain dual-functional OFDM waveform design for accurate sensing/positioning," IEEE Journal on Selected Areas in Communications, vol. 42, no. 9, pp. 2259–2274, 2024.

[27] A. Bouziane and H. Arslan, "Optimized Non-Uniform Pilot Pattern for OFDM Sensing," IEEE Wireless Communications Letters, vol. 15, pp. 2463–2467, 2026.

[28] J. Wu, F. Liu, Y. Zhang, Y. Xiong, J. Yang, and S. Jin, "Ambiguity Function Analysis of Pilot-Embedded Random OFDM Signals," arXiv preprint arXiv:2607.17663, 2026.

[29] L. Xie, H. He, Y. Xiong, F. Liu, and S. Jin, "Adaptive matched filtering for sensing with communication signals in cluttered environments," arXiv preprint arXiv:2512.08157, 2025.

[30] Y. Zhang, F. Liu, T. Liu, and S. Jin, "Optimal Power Allocation for OFDM-Based Ranging Using Random Communication Signals," IEEE Trans. Wireless Commun., vol. 25, pp. 6460–6473, 2025.

[31] R. McAulay and J. Johnson, "Optimal mismatched filter design for radar ranging, detection, and resolution," IEEE Trans. Inf. Theory, vol. 17, no. 6, pp. 696–701, 1971.

[32] E. Boutillon, "Constellations Cross Circular auto-Correlation C4-sequences," IEEE Transactions on Communications, vol. 72, no. 12, pp. 7664–7673, 2024.

[33] M. Šimko, Q. Wang, and M. Rupp, "Optimal pilot symbol power allocation under time-variant channels," EURASIP Journal on Wireless Communications and Networking, vol. 2012, no. 1, p. 225, 2012.

[34] M. Simko, P. S. Diniz, Q. Wang, and M. Rupp, "Adaptive pilot-symbol patterns for MIMO OFDM systems," IEEE Transactions on wireless communications, vol. 12, no. 9, pp. 4705–4715, 2013.

[35] M. Morelli, U. Mengali et al., "A comparison of pilot-aided channel estimation methods for OFDM systems," IEEE Transactions on signal processing, vol. 49, no. 12, pp. 3065–3073, 2001.

[36] X. Xu, Z. Zhou, and Y. Zeng, "How does CP length affect the sensing range for OFDM-ISAC?" IEEE Trans. Signal Process., vol. 73, pp. 5106–5120, 2025.

[37] G. Caire, G. Taricco, and E. Biglieri, "Bit-interleaved coded modulation," IEEE transactions on information theory, vol. 44, no. 3, pp. 927–946, 1998.

[38] T. K. Sarkar and O. Pereira, "Using the matrix pencil method to estimate the parameters of a sum of complex exponentials," IEEE Antennas and propagation Magazine, vol. 37, no. 1, pp. 48–55, 1995.

**本页范围与校对状态：** 本页为 arXiv:2609.22994v1 的全文中文译稿，覆盖摘要、正文第 I–VI 节（含 II-A–E、III-A–C、IV-A–B 全部小节）、图 1–9 图注、表 I 逐格、附录 A–E 与参考文献 [1]–[38]。公式编号沿用原文 (1)–(73)（含 (16a)–(16d)、(23a)–(23c)、(32a)–(32c)、(34a)–(34c) 子编号），附录证明的原式编号亦保留（(51)–(73)）；其中 (67)–(73) 等处的中间推导按原文顺序译出。表 I 已用 PDF 第 8 页渲染图逐格核对（$\rho$ 0–6、MI、$\kappa_2$、$\nu_{-2}$ 三行数值一致）。原文整体无致谢/基金段落，故本页未设"致谢"节。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。如发现公式排版或个别符号与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
