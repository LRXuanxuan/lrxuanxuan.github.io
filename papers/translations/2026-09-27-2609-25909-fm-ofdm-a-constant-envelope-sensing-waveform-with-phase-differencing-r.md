---
layout: page
title: "FM-OFDM：恒包络感知波形与相位差接收｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-25909-fm-ofdm-a-constant-envelope-sensing-waveform-with-phase-differencing-r/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c42f97ea436c96ec/) · [原文 arXiv](https://arxiv.org/abs/2609.25909) · [全部目录](/papers/catalog/)

# FM-OFDM：恒包络感知波形与相位差接收处理

**原题：** FM-OFDM: A Constant-Envelope Sensing Waveform with Phase-Differencing Receiver Processing  
**作者：** Amir Bouziane、Hüseyin Arslan（IEEE Fellow）（土耳其伊斯坦布尔梅迪波尔大学工程与自然科学学院电气与电子工程系，34810 伊斯坦布尔）  
**版本：** arXiv:2609.25909v1（eess.SP），2026 年 9 月 22 日提交，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VI 节、表 I、图 1—图 10 图注与参考文献（英文原条目 42 条）按原文结构录入；逐句逐式终校未做。

## 摘要

循环前缀正交频分复用（CP-OFDM）被广泛用作通感一体化（ISAC）的参考波形。然而其高峰均功率比（PAPR）要求功放回退，从而降低可用的感知链路预算。调频 OFDM（FM-OFDM）提供 **0 dB PAPR** 的恒包络信号，并在高移动性场景中展现出可靠通信性能，但其**感知特性尚未被充分研究**。本文从带宽、模糊函数、旁瓣行为与多普勒估计能力四方面刻画 FM-OFDM 作为感知波形的性质。分析表明：其**数据相关旁瓣底是互不相干的**，会随跨帧积累而下降，而对应的 CP-OFDM 旁瓣底保持不变。因此在**等占用带宽与等发射功率**下，帧级积累会**反转单符号性能排序**，并为 FM-OFDM 在弱目标检测中带来约 **20 dB** 的额外动态范围。此外，FM-OFDM 模糊函数的**零时延切面**被证明是确定性的、与发送数据实现无关——这与线性调制波形相反；对远离零时延切面的旁瓣底，本文给出闭式表达式。由于数据符号与时域样本之间的非线性映射使传统 CP-OFDM 距离—多普勒处理链无法直接应用，本文提出一种**加权的相位增量多普勒估计器**。所提估计器以最低计算复杂度实现感知底及其**交叉点**的闭式预测。

**关键词：** 模糊函数；恒包络；多普勒估计；调频 OFDM（FM-OFDM）；通感一体化（ISAC）；距离旁瓣；波形设计。

## I. 引言

在第六代（6G）系统中，感知成为**原生网络功能** [1]、[2]：目标时延与多普勒由承载用户数据的同一波形估计。标准化工作已在进行：IEEE 802.11bf 修正案定义了 Wi-Fi 的感知流程 [3]；3GPP 的 Release 19 研究项目处理 ISAC 信道建模 [4]、[5]，RAN1 已就共同建模框架达成一致 [6]；ETSI ISAC 产业规范组正在定义用例、需求与系统层面 [7]。因此感知的评估准则正在被固定，候选波形必须针对**距离与速度估计**而非仅数据速率进行评估。

ISAC 波形设计分为三类 [8]、[9]。**感知中心**设计从雷达波形出发并把数据加载其上，保留时延—多普勒响应但约束数据速率；**通信中心**设计从通信波形出发，保留数据速率而约束时延—多普勒响应 [10]；**联合**设计介于两者之间、力图兼顾，例如把 OFDM 数据面与 chirp 结合 [11]、[12]。调频正交频分复用（FM-OFDM）属于第三类：其子载波结构与解映射器与 OFDM 相同，而发送信号是调频载波，故数据面不变，仅把"块到样本"的映射替换掉。

当前 ISAC 标准化工作的参考波形是循环前缀正交频分复用（CP-OFDM），并作为感知评估基线 [4]。其感知接收机很简单：接收频域符号是信道与已知数据的乘积，逐元素相除即隔离信道响应，再对子载波与符号做二维快速傅里叶变换（FFT）得到距离—多普勒图 [10]。该选择在解析上也有支撑：在 QAM 与 PSK 星座下，CP-OFDM 在线性调制波形中取得最低的平均测距旁瓣电平 [13]。代价出现在发射端：CP-OFDM 符号叠加许多独立子载波，其包络趋于复高斯分布，PAPR 随活跃子载波数增长 [14]；功放（PA）必须回退数分贝以保持线性 [15]、[16]，在毫米波频段问题更严重——那里输出功率与线性度本已受限 [17]。雷达作用距离随发射功率的**四次方根**变化 [18]，故每 1 dB 回退要损失约 0.25 dB 的检测距离。

承载数据的波形是随机的，其相关响应逐块变化，分析只能针对其均值。已有工作给出了任意调制基与星座下此类信号**期望平方自相关函数（ACF）**的闭式，并把它分解为**由脉冲成形决定的确定性部分**与**由星座决定的数据相关底** [19]。该分解正是设计抓手：脉冲成形作用于第一部分 [20]，星座成形作用于第二部分 [21]，CP-OFDM 在平均测距旁瓣电平上的最优性亦由同一框架导出 [13]。但所有这些都以**线性调制**为前提——数据乘以固定脉冲。FM-OFDM 把数据**非线性**地映射为样本，故最优性结论与设计工具都不再适用，其模糊函数（AF）必须直接推导。

恒包络多载波波形完全消除回退，使功放可工作在饱和点；它们已成熟用于通信链路 [22]—[24]，代价是**带宽扩展**，因此适合带宽充足的高频段与非地面网络（NTN）场景 [25]。其中研究最充分的是恒包络正交频分复用（CE-OFDM），它把块直接映射到载波相位；它已被作为雷达波形评估 [26]、[27]，其 AF 通过广义 Bessel 函数以闭式刻画，参数也已针对旁瓣电平优化 [28]、[29]。由于数据位于**绝对相位**而非相位增量中，残余载波频偏（CFO）会平移每个样本、必须被估计 [24]。正交时频空间（OTFS）等时延—多普勒波形也为同一目的被研究，包括其恒包络（CE）变体 [30]—[32]。而 FM-OFDM——用数据驱动一个 OFDM 块的**瞬时频率**——尚未被评估用于感知，其感知能力被列为开放方向 [25]。[11] 中的三角 FM-OFDM 虽同名，却是把 OFDM 与线性调频 chirp 结合。

雷达有自己的 CE 调频族，即**随机调频（RFM）**：瞬时频率由随机过程而非确定性扫频驱动 [33]。其结果是 CE、连续相位与图钉状（thumbtack）AF，代价是旁瓣逐脉冲变化。单个 RFM 脉冲无法同时达到同等时间带宽积下优化 chirp 的旁瓣电平，因为图钉状响应把同一能量铺满整个时延—多普勒平面。这些旁瓣在脉冲间**互不相干**，因此 $P$ 个波形的慢时间合并可将其抑制 $10\log_{10}P$ [33]、[34]。该族的设计努力集中在**塑造频率指令**本身，例如优化多音正弦调频（MTSFM）波形的 Fourier 系数把旁瓣放到危害最小处 [35]。FM-OFDM 的不同在于：频率指令并不自由，它就是承载用户数据的 OFDM 块，故旁瓣底是**待推导**量而非可设计量。

Hernando 与 Armada 把 FM-OFDM 作为高移动性通信波形提出 [24]：数据驱动载波瞬时频率，而 CE-OFDM 驱动载波相位；二者都属纯相位调制，故都有 0 dB PAPR。其接收机是差分的，残余 CFO 无需估计即可去除。

CP-OFDM 感知链**不能**移植到 FM-OFDM：数据到样本的映射是非线性的，接收谱不再是信道与数据的乘积，标准变通办法都失效（见第 III 节）。匹配滤波仍可用，但它留下数据相关旁瓣与慢时间样本中的干扰相位。本文贡献如下：

- 推导 FM-OFDM 的 AF，并证明其**零时延切面对每个数据实现都确定且相同**；而远离原点处旁瓣底是数据相关的，本文给出闭式。
- 证明该旁瓣底**互不相干**，故随积分长度下降，而 CP-OFDM 的旁瓣底不降。[13] 的最低平均测距旁瓣结果仅适用于线性调制波形且是**逐符号平均**，两个条件都不覆盖"跨帧观测"的恒包络波形。在等占用带宽与等发射功率下，这**反转单符号排序**，并在弱目标检测中带来约 20 dB 的额外动态范围。
- 给出 FM-OFDM **占用带宽的闭式**及其对调制指数的约束。由此把三种波形的比较固定在由**实测带宽**而非标称带宽确定的工作点。
- 提出**加权相位增量多普勒估计器**，因为非线性映射阻断了标准 CP-OFDM 距离—多普勒链。抛物线权重最小化方差，使 RMSE 按 $U^{-3/2}$ 衰减（均匀权重为 $U^{-1}$），方差表达式以闭式预测感知底及其交叉点。该估计器无需变换、无需频率网格、无需相位解缠，运算量为 $\mathcal O(U)$。

本工作的初步版本见 [36]，它在鉴频器域处理感知并使用经验带宽规则。本文替换这两点：闭式推导占用带宽、在匹配滤波下刻画 AF，并说明慢时间数据相位**不会消失**、反而决定感知底。

本文其余部分安排：第 II 节给出系统模型，闭式推导 FM-OFDM 占用带宽并反解调制指数；第 III 节说明 CP-OFDM 距离—多普勒链为何不能移植、推导 AF 并得到旁瓣底；第 IV 节发展差分多普勒估计器、最小化方差的权重及由此得到的感知底；第 V 节用仿真检验闭式，并在等占用带宽与等发射功率下比较三种波形；第 VI 节总结。

## II. 系统模型

考虑单天线**单站** ISAC 系统：发射机（Tx）发送既用于数据传输又用于感知的 FM-OFDM 信号，信号传播到通信用户，同时被不同距离上的若干无源目标反射，这些回波到达感知接收机（Rx）。Tx 与 Rx 同址且隔离良好，可忽略 Tx→Rx 的直达径。Rx 处理回波以估计目标时延与多普勒。

### A. 发射机模型

令单位功率、独立且零均值的 QAM 符号 $X[k]$ 填充频域向量 $\mathbf X=[X[0],X[1],\ldots,X[N-1]]^{T}$：

$$
X[k]=\begin{cases}X[k], & k_0\le k\le k_0+N_a/2-1,\\ X^{*}[N-k], & N-k_0-N_a/2+1\le k\le N-k_0,\\ 0, & \text{其他}.\end{cases}\tag{1}
$$

共轭对称使 $x[n]$ 为实值。以 $\mathcal K$ 表示活跃集、$|\mathcal K|=N_a$ 个活跃子载波，信号为酉逆离散傅里叶变换（IDFT）：

$$
x[n]=\frac{1}{\sqrt{N}}\sum_{k\in\mathcal K}X[k]e^{\mathrm j2\pi kn/N},\qquad n=0,\ldots,N-1.\tag{2}
$$

$1/\sqrt{N}$ 缩放固定 $x[n]$ 的功率并保留在后文每个方差表达式中，给出

$$
\sigma_x^{2}\triangleq\mathbb E\left[x^{2}[n]\right]=\frac{N_a}{N}.\tag{3}
$$

调制器把 $x[n]$ 映射为瞬时频率：

$$
f[n]\triangleq m\sqrt{\frac{N}{N_a}}\,x[n],\tag{4}
$$

其中 $m$ 为调制指数。因子 $\sqrt{N/N_a}$ 抵消 (3) 中的 $N_a/N$，故

$$
\sigma_f^{2}\triangleq\mathbb E\left[f^{2}[n]\right]=m^{2}.\tag{5}
$$

积分并取指数得到发送信号：

$$
\phi[n]=2\pi\sum_{i=0}^{n}f[i],\qquad s[n]=A_ce^{\mathrm j\phi[n]},\tag{6}
$$

其中 $\phi[-1]\triangleq0$。由于每个样本都有 $|s[n]|=A_c$，其 PAPR 为 0 dB。

(6) 中的**累加**正是 FM-OFDM 与 CE-OFDM 的区别：后者把 $x[n]$ 直接映射到相位 $\phi_{\mathrm{CE}}[n]=2\pi m\sqrt{N/N_a}\,x[n]$，无累加 [26]、[32]；而此处 $x[n]$ 设定的是**相位步长**，故第 $n$ 个样本的相位依赖其前所有样本。

对 (6) 差分得 $\phi[n]-\phi[n-1]=2\pi f[n]$，标准差为 $2\pi m$。接收机从该步长读回 $f[n]$，但每个样本在一周内才无歧义：当 $|f[n]|<1/2$ 时步长无歧义。由于 $x[n]$ 是 $N_a/2$ 个独立符号之和，可良好近似为高斯 [14]，而模型对相位步长未设上界，故 [24, 式 7] 的确定性峰值条件在此放宽为**概率条件**。当步长超过 $\pi$ 时发生**缠绕**，故

$$
P_w=2Q\left(\frac{1}{2m}\right),\tag{7}
$$

其中 $Q(\cdot)$ 为高斯尾概率，随 $m$ 减小而迅速下降。

**图 1：$s[n]$ 在单位圆上描绘的相位步长。** 图中给出两种 CE 映射在单位圆上描绘的轨迹：CE-OFDM 把数据放在点位置 $\phi[n]$ 本身，残余 CFO 使每个点位移且必须估计校正；FM-OFDM 把数据放在相邻点之间的间隔 $\Delta\phi[n]$ 内，故 CFO 给每个间隔加上相同增量、保持差分成形（至多差一个常数），该常数落入随后 DFT 的直流（DC）箱并被解映射器丢弃 [24]。上图给出由 $m$ 决定的偏移区域，严格保持在模糊边界内，使每个步长被正确读出；下图该区域越过边界，左下角标出的超过 $\pi$ 的步长被读成符号相反的较小步长，并在圆的另一侧解码。

### B. 通信接收机

接收端由 FM 解调器恢复 $x[n]$，再施加常规 OFDM 处理 [24]。下变频后接收信号为 $z[n]=s[n]e^{\mathrm j(2\pi\epsilon n+\psi)}$，其中 $\epsilon$ 为每样本的残余 CFO、$\psi$ 为未知常数相位 [24]。鉴频器形成

$$
\widehat f[n]=\frac{1}{2\pi}\arg\left(z[n]z^{*}[n-1]\right)=f[n]+\epsilon,\tag{8}
$$

在 $|f[n]+\epsilon|<1/2$ 时有效。子载波解映射器随后无需估计即丢弃 $\epsilon$——因为 $k_0\ge1$ 使 DC 箱不属于 $\mathcal K$——相位噪声同此。

(8) 中乘积在取辐角前先做相减，故返回 $f[n]$ 而无解缠环节；这在任何不发生缠绕的样本上成立，失效概率为 (7) 的 $P_w$。第 IV 节的慢时间估计器在**符号间**而非样本间施加同一乘积，并继承该性质。

### C. 感知场景

感知在一个相干处理间隔内进行，含 $U$ 个连续 FM-OFDM 符号（索引 $u=0,\ldots,U-1$），每个由独立抽取的 QAM 符号 $X_u[k]$ 构成，故数据逐符号变化。符号之间以 $N_g$ 个样本的保护间隔分隔：

$$
T_s=\frac{1}{f_s},\qquad T_u=NT_s,\qquad T_{\mathrm{sym}}=(N+N_g)T_s,\tag{9}
$$

其中 $f_s$ 为采样率、$T_u$ 为有效块时长、$T_{\mathrm{sym}}$ 为完整符号时长。保护间隔大于最大散射体时延，故相邻符号在接收端不重叠。所有感知处理都作用于 $N$ 个样本的有效块，因此分析不依赖保护间隔是零填充 [37] 还是循环前缀（CP）。

雷达为单站，收发天线间隔足够大使自干扰可忽略 [38]，且感知接收机**精确已知** $s_u[n]$。接收机观测 $L$ 个可分辨散射体（$\ell=0,\ldots,L-1$），散射体 $\ell$ 具有复幅度 $a_\ell$、往返时延 $\tau_\ell=p_\ell T_s$（$p_\ell$ 为对应时延分箱）与径向速度 $v_\ell$，其多普勒频移为

$$
\nu_\ell=\frac{2v_\ell}{\lambda},\qquad\lambda=\frac{c}{f_c},\tag{10}
$$

其中 $f_c$ 为载频、$c$ 为光速。噪声 $w[n]\sim\mathcal{CN}(0,\sigma_w^{2})$ 在样本与符号间独立，发射幅度 $A_c=\sqrt{P_t}$，故每个样本的瞬时功率为 $P_t$。

### D. 带宽与调制指数

发送信号是纯相位调制 $s[n]=A_ce^{\mathrm j\phi[n]}$，其功率谱密度（PSD）为自相关 $R[\Delta p]=\mathbb E\{s[n]s^{*}[n-\Delta p]\}$ 的离散时间傅里叶变换（DTFT）。$R[\Delta p]$ 只依赖相位差，而相位差是 $N_a/2$ 个符号的高斯和，其特征函数给出

$$
R[\Delta p]=A_c^{2}e^{-D_\phi(\Delta p)/2},\qquad D_\phi(\Delta p)\triangleq\operatorname{Var}\left(\phi[n]-\phi[n-\Delta p]\right).\tag{11}
$$

因此频谱由**单个标量函数**确定。相位 $\phi[n]=2\pi\sum_{i\le n}f[i]$ 是无界方差的随机游走；其滞后差性质良好，因为早于 $\Delta p$ 的每一项在两端都出现并相消。利用 (4) 的 $f[n]=m\sqrt{N/N_a}\,x[n]$，

$$
\phi[n]-\phi[n-\Delta p]=2\pi m\sqrt{\frac{N}{N_a}}\sum_{i=n-\Delta p+1}^{n}x[i],\tag{12}
$$

故 $D_\phi$ 是信号的**长度 $\Delta p$ 滑动和**的方差。把 (2) 的 IDFT 代入 $x[i]$ 并交换两个求和得

$$
\sum_{i=n-\Delta p+1}^{n}x[i]=\sum_{k\in\mathcal K}X[k]\sum_{i=n-\Delta p+1}^{n}e^{\mathrm j2\pi ki/N}.\tag{13}
$$

只有内和依赖窗。令 $i=n-l$，可提出 $e^{\mathrm j2\pi kn/N}$，剩下 $\Delta p$ 项、公比 $e^{-\mathrm j2\pi k/N}$ 的等比级数：

$$
G_{\Delta p}(k)=\sum_{l=0}^{\Delta p-1}e^{-\mathrm j2\pi kl/N}=\frac{1-e^{-\mathrm j2\pi k\Delta p/N}}{1-e^{-\mathrm j2\pi k/N}}.\tag{14}
$$

被提出的项模为一，不改变方差，因此子载波 $k$ 被 $G_{\Delta p}(k)$ 缩放。(14) 中两项都形如 $1-e^{-\mathrm j\theta}$，而 $|1-e^{-\mathrm j\theta}|^{2}=4\sin^{2}(\theta/2)$ 对每项成立；因子 4 相消，于是

$$
\left|G_{\Delta p}(k)\right|^{2}=\frac{\sin^{2}(\omega_k\Delta p)}{\sin^{2}(\omega_k)},\qquad\omega_k\triangleq\frac{\pi k}{N}.\tag{15}
$$

共轭对称 (1) 使每个镜像对贡献 $2\operatorname{Re}\{X[k]G_{\Delta p}(k)\}$、方差 $\frac{1}{2}|G_{\Delta p}(k)|^{2}$；$N_a/2$ 个对的方差相加得

$$
D_\phi(\Delta p)=\frac{(2\pi m)^{2}}{N_a}\sum_{k\in\mathcal K}\frac{\sin^{2}(\omega_k\Delta p)}{\sin^{2}(\omega_k)}.\tag{16}
$$

在 $\Delta p=1$ 时 (16) 中每个比值为 1，求和回到 $N_a$，故 $D_\phi(1)=(2\pi\sigma_f)^{2}$，与 (5) 一致。(15) 决定谱形：当 $\omega_k\Delta p\ll1$ 时两个正弦都取小角近似，比值趋于 $\Delta p^{2}$，增益随滞后增长。条件作用在乘积上，故对小 $\Delta p$ 与小 $\omega_k$ 都成立；当 $\omega_k\Delta p\gtrsim1$ 时分子只在 0 与 1 间摆动，增益保持在 $1/\sin^{2}(\omega_k)$ 以下，并在滞后上平均为 $1/(2\sin^{2}\omega_k)$。增长止于 $\Delta p\sim1/\omega_k$，即每个子载波一个滞后。活跃子载波占据最低的箱，故最高者约为 $k\approx N_a/2$、$\omega_{\max}\approx\pi N_a/(2N)$，它是最后停止增长的增益，在 $\omega_{\max}\Delta p\sim1$ 处停止。因此 $D_\phi$ 的增长大致终止于

$$
\Delta p^{\star}\sim\frac{N}{N_a},\tag{17}
$$

这给出数量级而非精确滞后。该尺度也是信号的**相关时间**，因为宽度 $N_a$ 的频带不可能比每 $N/N_a$ 个样本一个周期变化得更快。$\Delta p^{\star}$ 以下相位稳定累积、$D_\phi\simeq(2\pi m\Delta p)^{2}$；其上信号已被重抽多次、各贡献独立，$D_\phi$ 线性增长。对 $\Delta p$ 小于 $\Delta p^{\star}$，(11) 是宽度 $1/(2\pi m)$ 的 $\Delta p$ 高斯，故 PSD 是标准差 $m$ 的高斯（如 (5) 所示）。其双侧 99% 区间为

$$
\frac{B_{99}}{f_s}\approx2\eta m=5.15m,\qquad\eta\triangleq Q^{-1}(0.005)\approx2.58,\tag{18}
$$

这是 (11) 的短滞后极限而非独立模型，$N_a$ 的缺失由此而来；一旦 $\Delta p^{\star}$ 落入 $R$ 的衰减长度内，依赖关系便出现。活跃箱在低端，故 $\omega_k$ 很小；把 (15) 对 $\omega_k$ 展开、$\Delta p$ 保持精确，得 $|G_{\Delta p}(k)|^{2}\simeq\Delta p^{2}[1-\frac{1}{3}\omega_k^{2}(\Delta p^{2}-1)]$。对活跃集平均把 $\omega_k^{2}$ 换成 $\overline{\omega^{2}}=(\pi/N)^{2}[k_0^{2}+k_0N_a/2+N_a^{2}/12]$。-1 比其旁的 $\Delta p^{2}$ 小，故丢弃。把滞后写成 $y=2\pi m\Delta p$、在 (11) 中把指数展开到一阶，只剩一个参数：

$$
R(y)\simeq A_c^{2}e^{-y^{2}/2}\left(1+\frac{1}{18}\zeta^{2}y^{4}\right),\qquad\zeta^{2}\triangleq\frac{3\overline{\omega^{2}}}{(2\pi m)^{2}},\tag{19}
$$

对 $k_0\ll N_a$，$\zeta=N_a/(4mN)$，即信号带边除以两倍 RMS 频偏。只保留一阶项是因为感兴趣范围内 $\zeta<1$。

(19) 的变换需要高斯变换对及其四阶导数，因为 $\mathrm d^{4}\cos(\chi y)/\mathrm d\chi^{4}=y^{4}\cos(\chi y)$。写 $\chi=F/m$ 并以 $G(\chi)$ 表示标准正态密度，Rodrigues 关系 $G^{(n)}=(-1)^{n}He_nG$ [39, 式 12.6.4]、[40, 式 22.11.8] 把 $e^{-\chi^{2}/2}$ 的四阶导数化为四阶概率论 Hermite 多项式 $He_4(\chi)=\chi^{4}-6\chi^{2}+3$ [39, 式 12.6.5]，于是

$$
\Phi_s(\chi)\propto G(\chi)\left[1+\frac{1}{18}\zeta^{2}He_4(\chi)\right].\tag{20}
$$

(20) 即 Gram–Charlier A 级数 [39, 式 17.6.5]，超额峰度为 $\gamma_2=\frac{4}{3}\zeta^{2}$ [39, 式 17.6.6]；偏度为零，故无低阶项。正交性 [39, 式 12.6.6] 给出 $\int GHe_4\,\mathrm d\chi=0$，故 RMS 带宽对任意 $N_a$ 都保持为 $m$，只有尾部移动。把每侧尾部 0.005 功率置于 (20) 需尾积分 $\int_{\chi_0}^{\infty}GHe_4\,\mathrm d\chi=He_3(\chi_0)G(\chi_0)$，其中 $He_3(\chi)=\chi^{3}-3\chi$。写 $\chi_{99}=\eta+\delta$ 并在 $\eta$ 附近线性化 $Q$，$G(\eta)$ 相消，得 $\delta=\frac{1}{18}\zeta^{2}(\eta^{3}-3\eta)$，于是以 $C\triangleq(\eta^{2}-3)/18=0.2019$、$B_{99}/f_s=2m\chi_{99}$，

$$
\frac{B_{99}}{f_s}=2\eta m\left(1+C\zeta^{2}\right).\tag{21}
$$

(21) 中无任何拟合参数，在 $\zeta\le0.5$ 时与 (11) 的直接数值计算吻合优于 0.5%，在 $\zeta=1$ 时优于 1.7%。

由 (21) 可反解调制指数。令 $B_{99}=B_{\mathrm{ch}}$（$B_{\mathrm{ch}}$ 为分配信道的占用带宽预算），以 $m_0=B_{\mathrm{ch}}/(2\eta f_s)$ 表示未修正值，(21) 变为关于 $m$ 的二次方程，其相关根为

$$
m_{\mathrm{ch}}=\frac{m_0}{2}\left[1+\sqrt{1-\frac{4C}{m_0^{2}}\left(\frac{N_a}{4N}\right)^{2}}\right].\tag{22}
$$

另有两个限制：混叠要求 $B_{99}<f_s$，即 $m<1/(2\eta)$；可靠判别要求每符号至多一次相位缠绕，由 (7) 得 $m\le1/[2Q^{-1}(1/2N)]$。可用指数取三者最小：

$$
m_{\max}=\min\left\{\frac{1}{2\eta},\left[2Q^{-1}(1/2N)\right]^{-1},m_{\mathrm{ch}}\right\}.\tag{23}
$$

对表 I 的参数，三者分别为 0.194、0.143 与 0.0744，故**带宽预算以两倍之差起约束作用**，混叠与缠绕均未激活。式 (22) 把调制指数固定为 $m=0.0744$，全文使用该值。

## III. 距离—多普勒处理与模糊函数

在标准 OFDM 雷达处理中，接收信号是信道乘以已知数据：

$$
R_u[k]=H_u[k]X_u[k]+W_u[k],\tag{24}
$$

其中 $R_u[k]$、$H_u[k]$、$W_u[k]$ 分别为符号 $u$ 第 $k$ 个子载波上的接收信号、信道响应与噪声。除以 $X_u[k]$ 即隔离 $H_u[k]$，其中时延是跨 $k$ 的相位斜坡、多普勒是跨 $u$ 的相位推进，故二维 FFT 给出距离—多普勒图。对 CP-OFDM，该除法优于相关处理，因为去除数据也去除了其对相关底的贡献 [10]。

式 (24) **不**适用于发送的 FM-OFDM 信号，因为 (6) 把 $X[k]$ 非线性地映射为 $s[n]$。解调可恢复（测距仍有效），但多普勒落进 DC 箱并被解映射器丢弃，第二次 FFT 无可变换之物。匹配滤波避免此问题，代价是数据相关旁瓣底（在第 III-B 节刻画）。

### A. 接收信号与解调

在一个 $N$ 样本有效块上，第 II-C 节的 $L$ 个散射体给出块循环、时变多径信道

$$
h_u[n,p]\triangleq\sum_{\ell=0}^{L-1}a_\ell e^{\mathrm j2\pi\nu_\ell(uT_{\mathrm{sym}}+nT_s)}\delta[p-p_\ell],\tag{25}
$$

于是符号 $u$ 中的接收信号为

$$
r_u[n]=\sum_{\ell=0}^{L-1}a_\ell e^{\mathrm j2\pi\nu_\ell(uT_{\mathrm{sym}}+nT_s)}s_u[n-p_\ell]+w_u[n].\tag{26}
$$

假设信道在有效块内**欠扩展**：

$$
f_D^{\max}T_u\ll1,\tag{27}
$$

其中 $f_D^{\max}=\max_\ell|\nu_\ell|$，使块内多普勒相位近似恒定，而慢时间相位 $e^{\mathrm j2\pi\nu_\ell uT_{\mathrm{sym}}}$ 跨符号变化并被保留用于多普勒处理。

为把经典 OFDM 雷达处理链用于 FM-OFDM，先让接收波形通过鉴频器以恢复调制信号 $x[n]$。对单个散射体，鉴频器输出为

$$
g[n]=\frac{1}{2\pi}\arg\left(r[n]r^{*}[n-1]\right),\tag{28}
$$

代入 (26) 后变为

$$
g[n]=\nu_\ell T_s+m\sqrt{N/N_a}\,x[n-p_\ell]+\xi[n],\tag{29}
$$

其中 $\xi[n]$ 为零均值鉴频器噪声。时延表现为调制信号的时间移位，多普勒表现为**加性常数**。

对 (29) 在有效块上取 DFT 得

$$
G[k]=\nu_\ell T_sN\delta[k]+m\sqrt{N/N_a}\,X[k]e^{-\mathrm j2\pi kp_\ell/N}+\Xi[k],\tag{30}
$$

其中 $\Xi[k]\triangleq\mathrm{DFT}\{\xi[n]\}[k]$。多普勒被限制在常数项 $\nu_\ell T_sN\delta[k]$ 中，仅当 $k=0$ 时非零。由于活跃集 $\mathcal K$ 排除 $k=0$，该项被丢弃，存活的子载波只携带时延信息、**不携带速度信息**。

DFT 并除以 $X[k]$ 后，剩余相位项 $H[k]=m\sqrt{N/N_a}\,e^{-\mathrm j2\pi kp_\ell/N}$ 恰为时延相位斜坡，与经典 CP-OFDM 雷达相同。对活跃子载波 $\mathcal K$ 取 IDFT 得到在 $p_\ell$ 处有峰的距离剖面。然而分辨率被限制为 $c/(2N_a\Delta f)$，而非 (46) 的全波形带宽 $c/(2B_{99})$，损失因子为

$$
\frac{B_{99}}{N_a\Delta f}=\frac{B_{99}T_u}{N_a},\tag{31}
$$

在 $m=0.6/(2\pi)$、$N=512$、$N_a=64$ 时等于 3.9。解调步骤丢弃 FM 波形的宽带频谱扩展，因为时延是在**调制信号** $x[n]$ 上测量的，而非在发送的 FM 信号 $s[n]$ 上。

对多目标，多个回波同时到达，鉴频器并不线性求和，而是**最强回波压制其余**，弱回波被抑制的程度超过其功率差；叠加多普勒零陷，只有最强目标出现且被限制在零多普勒。

不经过鉴频器、直接套用常规 CP-OFDM 二维 FFT 链同样失败：CP-OFDM 发送谱平坦，除以 $S_u[k]$ 可干净恢复 $H_u[k]$；而 FM-OFDM 的谱高度不平整并含许多深零点，除以 $S_u[k]$ 给出噪声项 $W_u[k]/S_u[k]$，在 $|S_u[k]|$ 接近零的箱处该项极大，距离剖面纯为噪声。匹配滤波避免两种失败，并能正确分离两个目标。

### B. 脉冲压缩

解调丢失多普勒、直接谱除放大噪声，而**匹配滤波（MF）**通过把接收信号与已知波形相关来避免这两个问题。对符号 $u$，非周期互相关为

$$
C_u[p]\triangleq\sum_{n}r_u[n]s_u^{*}[n-p],\tag{32}
$$

在有效块上求和。基于 FFT 的实现需零填充到 $N'\ge2N$ 以避免循环相关。先用单目标评估 MF 的基本响应，再推广到多目标：把 $L=1$ 的 (26) 代入 (32) 得

$$
C_u[p]=a_\ell e^{\mathrm j2\pi\nu_\ell uT_{\mathrm{sym}}}e^{\mathrm j2\pi\nu_\ell pT_s}A(p_\ell-p,\nu_\ell)+\widetilde w_u[p],\tag{33}
$$

其中

$$
A(\Delta p,\nu)=\sum_{n}s^{*}[n]s[n-\Delta p]e^{\mathrm j2\pi\nu nT_s}\tag{34}
$$

为模糊函数。相位因子 $e^{\mathrm j2\pi\nu_\ell pT_s}$ 对固定距离 bin 为常数，被吸收进慢时间幅度。因此脉冲压缩的输出完全由 $A(\Delta p,\nu)$ 描述。

**图 2：式 (34) 的 $|A(\Delta p,\nu)|$。** 对 $k_0=1$、$m=0.6/(2\pi)$ 展示原点附近的 $|A(\Delta p,\nu)|$：$\Delta p=0$ 处的竖带是确定性的、对每个数据实现都相同，而周围旁瓣场随数据变化。

零多普勒切面 $A(\Delta p,0)$ 是用于测距的标准自相关，但它只描述**零多普勒**处的响应；匹配滤波输出在目标多普勒处评估，故需要完整二维模糊函数。由于每个样本 $|s[n]|=A_c$，数据只能通过**相位增量**进入模糊函数：

$$
A(\Delta p,\nu)=A_c^{2}\sum_{n}e^{-\mathrm j\Delta_{\Delta p}\phi[n]}e^{\mathrm j2\pi\nu nT_s},\qquad
\Delta_{\Delta p}\phi[n]=\phi[n]-\phi[n-\Delta p]=2\pi\sum_{i=n-\Delta p+1}^{n}f[i].\tag{35}
$$

滞后 $\Delta p$ 个样本的相位变化决定模糊函数，其两个切面行为不同。图 2 展示 $k_0=1$、$m=0.6/(2\pi)$ 时原点附近的 $|A(\Delta p,\nu)|$：$\Delta p=0$ 处的竖带是确定性的、对每个数据实现都相同，而周围旁瓣场随数据变化。

**1）零时延切面。** 在 $\Delta p=0$ 处，(35) 中相位增量对每个样本为零，模糊函数化为

$$
A(0,\nu)=A_c^{2}\sum_{n=0}^{N-1}e^{\mathrm j2\pi\nu nT_s}=A_c^{2}e^{\mathrm j\pi\nu(N-1)T_s}\frac{\sin(\pi\nu NT_s)}{\sin(\pi\nu T_s)},\tag{36}
$$

即 **$N$ 阶 Dirichlet 核**。其峰值为 $A(0,0)=A_c^{2}N$，且由于所有 $n$ 都有 $|s[n]|=A_c$，其多普勒主瓣宽度与旁瓣结构**对每个数据实现都固定**，故零时延切面不依赖数据。对 CP-OFDM，零时延切面逐块变化，因为它依赖发送数据；[13] 的结果是对许多实现取平均。此处 (36) 对**每个块都精确**。仿真确认了这一差异：跨独立实现，FM-OFDM 的 $A(0,\nu)$ 峰峰散布为 $10^{-16}$ 量级，而 CP-OFDM 的同一测量散布为 $10^{-1}$ 量级。[13] 的最优性结论适用于线性调制波形，而 FM-OFDM 不属于此类（数据被非线性映射到信号）；第 V 节进行等带宽比较。

**2）非零时延切面。** 远离 $\Delta p=0$ 时相位增量依赖数据。把 (11) 应用于 (35) 得平均相位项 $e^{-D_\phi(\Delta p)/2}$（$D_\phi$ 取自 (16)），故平均模糊函数为

$$
\mathbb E\left[A(\Delta p,\nu)\right]=A_c^{2}e^{-D_\phi(\Delta p)/2}\sum_{n}e^{\mathrm j2\pi\nu nT_s}.\tag{37}
$$

方差 $D_\phi(\Delta p)$ 随 $\Delta p$ 增长但有界。随 $\Delta p$ 增大，分子 $\sin^{2}(\pi k\Delta p/N)$ 在 0 与 1 间振荡，均值为 $1/2$，故大 $\Delta p$ 时方差趋于

$$
\overline{D}_\phi=\frac{(2\pi m)^{2}}{2N_a}\sum_{k\in\mathcal K}\frac{1}{\sin^{2}(\pi k/N)}\approx\frac{4m^{2}N^{2}}{N_a}\sum_{k=k_0}^{k_0+N_a/2-1}\frac{1}{k^{2}},\tag{38}
$$

其中对 $k_0+N_a/2\ll N$ 使用 $\sin(\pi k/N)\approx\pi k/N$。相位增量方差要等到滞后足够大、使最慢的活跃子载波（位于 $k_0$）完成数个周期后，才逼近该底；残余振荡因而在约 $N/k_0$ 的滞后尺度上衰减。

(15) 的增益 $|G_{\Delta p}(k)|^{2}$ 在小 $k$ 处最大（分母 $\sin(\pi k/N)$ 小），故低频子载波对 $D_\phi(\Delta p)$ 贡献最大。在 $k=0$ 处 (16) 的比值趋于 $\Delta p$，即 DC 子载波将贡献 $(2\pi m)^{2}\Delta p^{2}/N_a$ 且永不饱和；每个活跃项却被限制在 $1/\sin^{2}(\pi k/N)$，故**正是 $k_0\ge1$ 决定了底**。图 3 展示若干 $k_0$ 下的 $D_\phi(\Delta p)$，虚线为 (38) 的底电平 $\overline{D}_\phi$。

平均模糊函数只给出旁瓣响应的**相干部分**，实际旁瓣电平由二阶矩决定。对主瓣峰值归一化得零多普勒均方旁瓣电平

$$
\mathrm{SLL}(\Delta p)\triangleq\frac{\mathbb E\left[|A(\Delta p,0)|^{2}\right]}{|A(0,0)|^{2}}\approx\rho^{2}e^{-D_\phi(\Delta p)}+\rho\left(1-e^{-D_\phi(\Delta p)}\right)\frac{B_{99}}{T_u},\tag{39}
$$

其中 $\rho\triangleq1-|\Delta p|/N$ 为非周期相关的重叠比例。第一项来自相位增量的均值部分，在重叠样本上相干叠加；第二项来自起伏，设定**互不相干底**，其电平由**等效噪声带宽**

$$
B_e\triangleq\frac{\left(\int\Phi_s(f)\,\mathrm df\right)^{2}}{\int\Phi_s^{2}(f)\,\mathrm df}=2\sqrt{\pi}\,mf_s\tag{40}
$$

决定，它计数信号的独立频谱自由度。该闭式来自 (20) 的高斯谱，给出 $B_e/B_{99}=2\sqrt{\pi}/(2\eta)=0.688$，即底比仅由 99% 带宽所预言的**高 1.6 dB**。对小 $|\Delta p|$，$\rho\to1$，用 (38) 的饱和电平，两极限为

$$
\mathrm{SLL}\approx\begin{cases}-10\log_{10}\left(B_eT_u\right)\ \mathrm{dB}, & \overline{D}_\phi\gg1,\\ -4.34\,\overline{D}_\phi\ \mathrm{dB}, & \overline{D}_\phi\lesssim1.\end{cases}\tag{41}
$$

代入 (40) 可把第一支写成 $-10\log_{10}(2\sqrt{\pi}mN)$，故在饱和区远旁瓣底**仅由调制指数与块长决定**。精确二阶矩可在同一近似下由联合高斯相位增量得到，其协方差为

$$
C_{\Delta p}(\tau)=\frac{(2\pi m)^{2}}{N_a}\sum_{k\in\mathcal K}\frac{\sin^{2}(\pi k\Delta p/N)}{\sin^{2}(\pi k/N)}\cos\left(\frac{2\pi k\tau}{N}\right),\tag{42}
$$

且 $C_{\Delta p}(0)=D_\phi(\Delta p)$。双重求和给出

$$
\frac{\mathbb E\left[|A(\Delta p,0)|^{2}\right]}{|A(0,0)|^{2}}=\frac{1}{N^{2}}\sum_{|\tau|<\rho N}\left(\rho N-|\tau|\right)e^{-D_\phi(\Delta p)+C_{\Delta p}(\tau)}.\tag{43}
$$

仿真在 $m\in[0.1,0.6]/(2\pi)$ 范围内确认 (43) 误差在 0.5 dB 内；近似式 (39) 抓住定标但不精确常数。由于 $D_\phi(\Delta p)$ 从零开始后饱和，相干项在主瓣外刚刚被抬高，形成一条"裙边"，延伸到 $D_\phi(\Delta p)$ 超过 $\ln(B_eT_u)$ 处——在工作点约为 $\Delta p\approx5$ 个样本。紧邻的散射体是对着该裙边而非远滞后底被分辨的。图 4 展示了不同调制指数下的情形。

提高 $k_0$ 也会恶化 MF 旁瓣底：随 $k_0$ 增大，最低活跃子载波处的项被更高子载波处的项替换，而 (38) 的分母随 $k$ 增大，故被去掉的项更大、$\overline{D}_\phi$ **减小**，于是相干旁瓣项 $e^{-\overline{D}_\phi}$ 随 $k_0$ 增大。提高 $k_0$ 改善链路鲁棒性 [24]，但在感知上有两项代价：它从解调路径中移除了多普勒可观测量，并降低 $\overline{D}_\phi$ 从而抬高相干旁瓣项。第 V-B 节表明该项在允许范围内远低于 (41) 的互不相干底，故 $k_0$ 在该范围内可自由选取。

数据相关旁瓣并非 FM-OFDM 独有：在 CE-OFDM 中自相关旁瓣也随发送符号变化 [32]。此处的零时延主瓣结果对每个实现都确定，不同于 [32] 中含数据相关距离—多普勒耦合的统计主瓣模型 [26]。

### C. 差分慢时间处理

在检测到的距离 bin $\widehat\tau_\ell$ 处，跨符号的脉冲压缩输出为

$$
y_\ell[u]\triangleq C_u[\widehat p_\ell]\approx\alpha_\ell e^{\mathrm j(2\pi\nu_\ell uT_{\mathrm{sym}}+\theta_\ell[u])}+w_\ell[u],\tag{44}
$$

其中 $\theta_\ell[u]$ 汇总离网格与泄漏贡献，其方差由 (39) 得到并在第 IV-A 节量化。由于数据符号 $X_u[k]$ 逐符号变化，$\theta_\ell[u]$ 在 $u$ 上伪随机变化，**不能**用常数相位校正去除。

MF 恢复了多普勒信息，但慢时间样本仍含该数据相关相位。第 IV-B 节改为估计慢时间**相位增量**而非相位本身：这使 $\theta_\ell[u]$ 只出现在估计器权重的**一阶差分**中，且无需已知数据、无需相位解缠。

## IV. 所提差分感知接收机

第 III 节表明 MF 保持测距能力，而慢时间相位携带数据相关起伏。所提接收机对测距保留 MF，并从慢时间相位推进估计多普勒。该推进之所以存活，是因为 MF 把接收样本与已知发送波形相关、**从不施加鉴频器**，故多普勒从未被压缩到某个子载波索引上。估计器复用 (28) 的乘积，但索引改为符号 $u$；它不消除数据相关相位，而是把该相位限制在权重的**一阶差分**中，从而一套权重设计同时控制噪声与数据。

### A. 慢时间样本

对每个符号 $u$，接收块与已知发送波形做匹配滤波，如 (32)。非相干平均

$$
\overline C[p]=\frac{1}{U}\sum_{u=0}^{U-1}\left|C_u[p]\right|\tag{45}
$$

减小数据相关旁瓣的散布但**不降低**其均值电平，故检测仍坐落在 (39) 的底上。检测峰给出时延 bin $\widehat p_\ell$，分辨率为

$$
\Delta R=\frac{c}{2B_{99}},\tag{46}
$$

其中 $B_{99}$ 取自 (21)。在检测到的 bin 处，跨符号的脉冲压缩输出为

$$
y_\ell[u]\triangleq C_u[\widehat p_\ell]\approx\alpha_\ell e^{\mathrm j(2\pi\nu_\ell uT_{\mathrm{sym}}+\theta_\ell[u])}+w_\ell[u],\tag{47}
$$

其中 $w_\ell[u]$ 为压缩后噪声、$\theta_\ell[u]$ 为该 bin 处的残余数据相关相位。

其他散射体的泄漏主导 $\theta_\ell[u]$。每个干扰源贡献其功率比乘以在其时延间隔处的旁瓣电平，并**减半**——因为只有正交分量会移动相位：

$$
\sigma_\theta^{2}\approx\sigma_{\mathrm{og}}^{2}+\frac{1}{2}\sum_{q\ne\ell}\frac{|a_q|^{2}}{|a_\ell|^{2}}\mathrm{SLL}(\widehat p_\ell-\widehat p_q).\tag{48}
$$

$\sigma_{\mathrm{og}}^{2}$ 来自在分数滞后处评估 AF（检测峰未落在真实时延上）：它在半个 bin 处最大、在网格上消失。(16) 只在整数滞后成立，故 $\sigma_{\mathrm{og}}^{2}$ 无闭式，取自仿真；在工作点其为 $1.87\times10^{-6}$，而单个低 10 dB、位于 $\Delta p=91$（$\mathrm{SLL}=-22.48$ dB）的干扰源给出 $3.11\times10^{-4}$。(48) 在干扰幅度两个数量级范围内与仿真吻合在 0.42 dB 内。实测 $\theta_\ell[u]$ 的自相关在所有非零滞后处幅度低于 0.024，故 $\theta_\ell[u]$ 零均值且在 $u$ 上**白**。

该模型假设每个可分辨 bin 内有**一个主导散射体**，与其他散射体的间隔超出旁瓣裙边（工作点处该裙边延伸到约 $\Delta p\approx6$ 个样本）。同一 bin 内两个可比散射体使 $y_\ell[u]$ 成为矢量和之相位，(47) 不再描述；裙边内泄漏保留主瓣电平的相干分量，以两散射体的多普勒差旋转，该分量非白，(48) 会偏离数分贝。

### B. 多普勒估计器

未知相位 $\theta_\ell[u]$ 逐符号变化，故 $y_\ell[u]$ 的**绝对相位**不可用；多普勒表现为相邻符号间的旋转，估计器因此对相邻符号做差。两符号间的相位变化为

$$
\Delta\phi_\ell[u]\triangleq\arg\left(y_\ell[u]y_\ell^{*}[u-1]\right)\in(-\pi,\pi],\tag{49}
$$

乘以共轭即相减相位。代入 (47) 得

$$
\Delta\phi_\ell[u]=2\pi\nu_\ell T_{\mathrm{sym}}+\left(\theta_\ell[u]-\theta_\ell[u-1]\right)+\left(\delta_\ell[u]-\delta_\ell[u-1]\right),\tag{50}
$$

其中 $\delta_\ell[u]$ 为噪声引起的相位误差。只有 $y_\ell[u]$ 上的噪声移动其相位，且那是噪声功率的一半，故 $\delta_\ell[u]$ 方差为 $1/(2\gamma_\ell)$，其中 $\gamma_\ell=|\alpha_\ell|^{2}/\sigma_{w_\ell}^{2}$ 为检测 bin 处压缩后信噪比。所需项不再依赖 $u$：每个增量都带同一个 $2\pi\nu_\ell T_{\mathrm{sym}}$，故对增量取平均即可。以权重 $w_u$ 平均得

$$
\widehat\nu_\ell=\frac{1}{2\pi T_{\mathrm{sym}}}\sum_{u=1}^{U-1}w_u\Delta\phi_\ell[u],\tag{51}
$$

径向速度估计为 $\widehat v_\ell=\lambda\widehat\nu_\ell/2$。每个增量携带所需项的一份拷贝，故权重归一 $\sum_{u=1}^{U-1}w_u=1$，边界约定 $w_0=w_U=0$。

(51) 中只出现差分，故无需解缠；但每个差分须在一周内：

$$
\left|2\pi\nu_\ell T_{\mathrm{sym}}+\theta_\ell[u]-\theta_\ell[u-1]+\delta_\ell[u]\right|<\pi\quad\forall u,\tag{52}
$$

这是 (50) 成立的条件。把 (51) 中的求和按符号重组而非按差分得

$$
\sum_{u=1}^{U-1}w_u\left(\theta_\ell[u]-\theta_\ell[u-1]\right)=\sum_{u=0}^{U-1}\left(w_u-w_{u+1}\right)\theta_\ell[u].\tag{53}
$$

数据相位**不会**相消：它乘以相邻权重之**差**而不是权重本身，噪声项同样重组，故同一组差分同时控制二者。

误差是两种扰动的加权和：

$$
\widehat\nu_\ell-\nu_\ell=\frac{1}{2\pi T_{\mathrm{sym}}}\sum_{u=0}^{U-1}\left(w_u-w_{u+1}\right)\left(\theta_\ell[u]+\delta_\ell[u]\right).\tag{54}
$$

二者都零均值，故估计器**无偏** $\mathbb E[\widehat\nu_\ell]=\nu_\ell$；二者在 $u$ 上都白，故方差相加无交叉项。记

$$
S(w)\triangleq\sum_{u=0}^{U-1}\left(w_u-w_{u+1}\right)^{2},\tag{55}
$$

则

$$
\operatorname{Var}(\widehat\nu_\ell)=\frac{\sigma_\theta^{2}+1/(2\gamma_\ell)}{(2\pi T_{\mathrm{sym}})^{2}}S(w),\tag{56}
$$

其中 $\sigma_\theta^{2}$ 取自 (48)。噪声与数据通过**同一** $S(w)$ 到达估计，故一次最小化同时服务二者。

最小化 (55) 的权重变化缓慢、两端为零且和为 1。这些条件给出**抛物线窗**：

$$
w_u^{\star}=\frac{6u(U-u)}{U(U^{2}-1)},\qquad u=1,\ldots,U-1,\tag{57}
$$

且 $S(w^{\star})=12/[U(U^{2}-1)]$，故

$$
\left.\operatorname{Var}(\widehat\nu_\ell)\right|_{w^{\star}}=\frac{12\sigma_\theta^{2}+6/\gamma_\ell}{(2\pi T_{\mathrm{sym}})^{2}U(U^{2}-1)}.\tag{58}
$$

这正是 Kay 针对加性噪声中纯音推导的权重 [41]。由于 $\theta_\ell[u]$ 是白的，它们在此仍最优，并使 (58) 成为**设计方程**。

(58) 的第二项随发射功率下降，且与 $U$ 个相干样本频率估计的 Cramér–Rao 界（CRB）一致：

$$
\mathrm{CRB}(\nu_\ell)=\frac{6}{(2\pi T_{\mathrm{sym}})^{2}\gamma_\ell U(U^{2}-1)},\tag{59}
$$

故该估计器对热噪声是**有效**的。第一项不含 $\gamma_\ell$，在

$$
\gamma_\ell^{\mathrm{fl}}=\frac{1}{2\sigma_\theta^{2}}\tag{60}
$$

处接管；超过该点方差饱和于

$$
\left.\operatorname{Var}(\widehat\nu_\ell)\right|_{\mathrm{fl}}=\frac{12\sigma_\theta^{2}}{(2\pi T_{\mathrm{sym}})^{2}U(U^{2}-1)}.\tag{61}
$$

这是**多普勒域的感知底**。它保持噪声项的 $U^{-3}$ 衰减，故随 $U$ 增大而下降。均匀权重 $w_u=1/(U-1)$ 退化为经典未加权相位差估计器 [41]、[42]：此时 (53) 中所有内部差分消失，只剩首末符号，给出 $S=2/(U-1)^{2}$ 与惩罚

$$
\frac{S(w_{\mathrm{unif}})}{S(w^{\star})}=\frac{U(U+1)}{6(U-1)}\approx\frac{U}{6},\tag{62}
$$

在 $U=64$ 时方差惩罚 10.42 dB。因此去掉内部数据相位所付出的代价大于其节省。就 RMSE 而言，(62) 使未加权估计器按 $U^{-1}$ 衰减，而加权估计器按 $U^{-3/2}$ 衰减。

提高 $k_0$ 在允许范围内不改变 $\sigma_\theta^{2}$：它抬高第 III-B 节的相干旁瓣项，但该项远低于互不相干底，故进入 (48) 的电平不动，(61) 的底亦然。**截止子载波的代价只是解调路径中的多普勒可观测量，而在速度精度上无代价。**

### C. 多普勒底

本文把两种权重下的 (51) 与周期图比较。场景含一个在距离网格上偏离半个样本、速度 100 m/s 的参考散射体，以及一个低 10 dB、位于 91 个 bin 之外、速度 −60 m/s 的干扰源。压缩后 SNR 比积分 SNR 低 18 dB（在 $U=64$ 时）。

$\gamma_\ell=12$ dB 以上，两种估计器都跟随 (59) 且在 0.2 dB 内一致，故所提估计器**在精度上无增益**。二者都饱和于 0.0401 m/s，而 (58) 给出 0.0384 m/s。两个不相关的估计器停在同一个值，说明**底在波形之中**。方差在 32.4 dB 处加倍，与 (60) 的 32.1 dB 吻合。均匀权重损失 10.46 dB 方差，与 (62) 的 10.42 dB 吻合。

$\gamma_\ell=10$ dB 以下差分估计器落后：差分使每个增量中的噪声相位方差加倍，故 (52) 失效而周期图峰仍成立。周期图跟随 (59) 直到 2 dB。5 dB 以下均匀权重优于抛物线权重，因为块中心附近发生缠绕的增量在 (57) 中权重更大。1 dB 以下两者都不可用。

(51) 的价值不在精度，而在于 (58) 以 $\sigma_\theta^{2}$ 的闭式把底与交叉点预测在 0.5 dB 内。该估计器还**无需搜索**、运算量为 $\mathcal O(U)$。

同一条件 (52) 给出无模糊速度：

$$
|\nu_\ell|<\frac{1}{2T_{\mathrm{sym}}},\qquad|v_\ell|<\frac{\lambda}{4T_{\mathrm{sym}}},\tag{63}
$$

相干慢时间变换有同样极限，故差分不损失覆盖。缠绕的增量使 $\widehat\nu_\ell$ 偏移 $w_u/T_{\mathrm{sym}}$，在块中心最大。

闭式还需要 (27)，因为它们假设路径权重在块内恒定。取 $f_D^{\max}T_u\le0.1$ 对照 $f_D^{\max}T_{\mathrm{sym}}<1/2$，二者间留有五倍余量；估计器在该带内仍工作，但符号内多普勒旋转会恶化匹配滤波并放大 (56)。第 V 节扫描该带并对每个场景报告 $f_D^{\max}T_{\mathrm{sym}}$。

## V. 仿真结果

本节用仿真检验第 II—IV 节的闭式，并在**等占用带宽与等发射功率**下比较 FM-OFDM 与 CP-OFDM、CE-OFDM。先检验频谱，因为后续所有比较都依赖带宽匹配。表 I 列出参数；网格为单个 FR2 信道、66 个资源块，三种波形都填满。

(22) 固定 FM-OFDM 指数；CP-OFDM 的活跃子载波数与 CE-OFDM 指数无闭式，迭代调整至三种波形测得**相同** $B_{99}$。散射体时延以发送块的循环移位施加，故模型假设前缀长于最大时延但不为其收取时间或能量代价，即 $N_g=0$、$T_{\mathrm{sym}}=T_u$。因此表 I 的无模糊距离是**循环模型**的缠绕极限，而非部署系统的前缀极限。SNR 按接收机输入端每样本给出，压缩额外增加 $10\log_{10}N$，区间积分再增加 $10\log_{10}U$。各图注明其散射体，且每个场景都满足 $f_D^{\max}T_{\mathrm{sym}}\le0.1$。

### A. 频谱与占用带宽

图 5 测量缠绕率随 $m$ 的变化。在预测高于仿真符号所分辨率底之处，测量跟随 (7) 的 $2Q(0.5/m)$，其下未观察到缠绕。每块一次缠绕对应速率 $1/N$，实测交叉与 (23) 的中间界吻合。工作点比该底低若干数量级，故相位缠绕对后文一切均无影响。

图 5 插图把同一高斯读作**占用率上限**：Nyquist 边位于瞬时频率的 $\xi$ 个标准差处、99% 带边位于 $\eta$ 处，故 $B_{99}/f_s=\eta/\xi$ 不含任何波形参数。测量在整个扫描范围内跟随它、保持在 1 以下，并随缠绕要求收紧而下降。

图 6 插图测量占用带宽与 (18) 的对比：测量值高出 $C\zeta^{2}$，故超出量随指数下降而增大。实测误差与 $C\zeta^{2}$ 在 $\zeta\simeq1$（(19) 展开的极限）之前相互跟随；在扫描顶部，测量低于 (18)，此时峰值偏移超过每样本一周、触及混叠界 $m<1/(2\eta)$。实测等效噪声带宽 $B_e/B_{99}=0.688$，用于第 V-B 节的互不相干旁瓣底。(23) 的三个界都被测量；反解 (21) 使带宽落在未修正根 $m_0=B_{\mathrm{ch}}/(2\eta f_s)$ 上，并以 $C\zeta^{2}$ 超出。

### B. 模糊函数与旁瓣底

图 6 主图测量旁瓣底随 $m$ 的变化。(38) 的相干底 $e^{-\overline D}$ 与 (39) 的互不相干项在扫描范围内跟踪测量。在 $k_0=1$ 处相干底无贡献（$\overline D$ 很大），故 (41) 第一支适用。点线用高斯 $0.688B_{99}$ 替代实测 $B_e$；二者除扫描底部外一致——底部由 $N_a$ 而非偏移决定带宽，谱不再高斯。工作点远在该一致范围内。

图 7 给出 96 与 49 MHz 下远旁瓣底随积分长度的变化。$U=1$ 且带宽较宽时 CP-OFDM 比两种恒包络波形低约 6 dB，即线性调制在平均旁瓣电平上的最优性 [13]。**积分反转了这一结论**：FM-OFDM 的底互不相干，按完整的 $10\log_{10}U$ 下降，(41) 在扫描两端预测误差在 0.2 dB 内；CP-OFDM 的底则不降——其远离原点的平均自相关是矩形分配的 Dirichlet 核，对每个数据抽取都相同，因而在平均中存活。两曲线在 $U\simeq32$ 处交叉，最终 FM-OFDM 低约 5 dB。

两种恒包络波形在 96 MHz 一致、在 49 MHz 分离，因为其相干项由不同量决定：CE-OFDM 的项跟随其自身调制指数，故更窄的带宽把它抬到积分无法达到的底，其底停在 FM-OFDM 之上；FM-OFDM 的项为 $e^{-\overline D}$，可忽略，故其底持续下降并仍与 (41) 吻合。

提高 $k_0$ 会移除主导 (38) 的子载波、使 $\overline D$ 下降一个数量级以上。它在允许范围内仍远高于 $\ln(B_eT_u)$，故 $e^{-\overline D}$ 仍可忽略、实测底不动。在该范围内，$k_0$ 以零旁瓣代价换取一个 DC 保护。

### C. 距离与速度估计

图 8 给出距离 RMSE 随 SNR 的变化。三个匹配滤波在几乎相同 SNR 处达阈值，因为压缩峰值由帧能量决定、三者又在同一帧上发送同样功率；谱形不移动阈值。可以看到除法接收机因数据除法而晚一步达阈值。

阈值以上四条曲线都跟随各自界。修正 Cramér–Rao 界（MCRB）取决于 **RMS 带宽**而非占用带宽，故 CP-OFDM 的界比 CE 低 3.6 dB。占用确定 (46) 的分辨率，二阶矩确定精度；除法接收机比 CP-OFDM 匹配滤波高 2.8 dB，即单位功率 16-QAM 下的 $10\log_{10}\mathbb E[1/|X|^{2}]$——二者用同一波形，故该差距是**接收机侧损失**。

所有曲线在高 SNR 处变平。去掉干扰源后 FM-OFDM 底不变、CE-OFDM 底下降，故只有 FM-OFDM 的底源自波形；因此该情形下底电平不依赖带宽。

图 9 给出速度 RMSE 随 SNR 的变化。(58) 在无任何拟合的情况下把饱和 FM-OFDM RMSE 预测在 0.3 dB 内；实测损失与 (62) 吻合，且两种估计器到达同一底，故极限在波形之中。去掉干扰源后 FM-OFDM 与 CE-OFDM 的底下降而 CP-OFDM 不动，故 CP-OFDM 的底由其自身数据设定：其慢时间相位有两个来源，一为变化包络、一为数据的谱质心；CE 消除前者，空 DC 箱消除后者，而 FM-OFDM 与 CE-OFDM 因 $k_0\ge1$ 同时满足两个条件。

### D. 目标遮蔽

把一个弱散射体置于强散射体旁并逐渐降低直至接收机丢失。两目标共享同一速度、多普勒已知并已去除，从而隔离距离域并给出最坏情形（任何多普勒分离都会把弱目标移离强目标的旁瓣）。

图 10 给出 [13] 场景下用本文波形参数得到的零多普勒切面：35 m 处的弱目标比 20 m 处的强目标低 35 dB，每条剖面按自身峰值归一化。三种波形在弱目标处放置的响应相当，但它们留下的**周围旁瓣电平**不同：对 FM-OFDM 与 CE-OFDM，该处最大响应就是弱目标；对 CP-OFDM，最大响应是 27 m 处的旁瓣，比弱目标高 10.7 dB。

其机制正是第 V-B 节所区分者：积分抽干底的互不相干部分、留下相干部分，而后者并不均匀铺在滞后上、而是集中于少数滞后。因此**平均**旁瓣电平会低估检测器所见——判决由门内**峰值**决定。

该增益并非免费：匹配是在 $B_{99}$ 上进行的，而 CP-OFDM 用平坦谱填满该带，故三者中主瓣最窄、两目标分辨率最细；FM-OFDM 与 CE-OFDM 的谱以更宽主瓣换取更低旁瓣。赋予 CP-OFDM 分辨率的**硬带边**同时也是赋予其相干底的原因。

本文运行了量化该遮蔽的双目标检测仿真：在每样本 SNR 为 6 dB（故测量受旁瓣而非噪声限制）下把弱目标相对强目标从 0 扫到 −55 dB，半检测点对 CP-OFDM 为 −23 dB、对 FM-OFDM 为 −43 dB、对 CE-OFDM 为 −44 dB，即在等带宽、等功率与等积分长度下，CE 波形多出约 **20 dB** 动态范围。

**表 I：仿真参数。**

| 组别 | 参数 | 取值 |
|---|---|---|
| 网格 | 载频 $f_c$ | 28 GHz |
| | 采样率 $f_s$ | 245.76 MHz |
| | 子载波间隔 $\Delta f$ | 120 kHz |
| | 块长 $N$ | 2048 |
| | 保护长度 $N_g$ | 0 |
| | 每区间符号数 $U$ | 112 |
| | 符号时长 $T_{\mathrm{sym}}$ | 8.33 µs |
| | 信道带宽 $B_{\mathrm{ch}}$ | 95.04 MHz |
| | FM-OFDM 活跃子载波 $N_a$ | 128 |
| | 截止子载波 $k_0$ | 1 |
| | 星座 $M$ | 16 |
| 推导量 | FM-OFDM 指数（(22)）$m$ | 0.0744 |
| | 距离分辨率（(46)）$\Delta R$ | 1.58 m |
| | 无模糊距离 | 1250 m |
| | 无模糊速度（(63)） | 321 m/s |

## VI. 结论

本文在匹配带宽下把 FM-OFDM 作为恒包络感知波形与 CP-OFDM、CE-OFDM 对照研究，并用闭式带宽界固定调制指数。虽然 FM-OFDM 可获得更低的**单符号**旁瓣底，但其数据相关旁瓣相位在帧上**互不相干**地累加、按 $\sqrt{N}$ 定标，而 CP-OFDM 旁瓣以完整积分增益相干累加；因此经帧积分后，FM-OFDM 能检测更弱的目标。所提差分多普勒估计器把数据相关相位保留在权重的**一阶差分**中，给出闭式方差，并能估计感知底与交叉点，与仿真结果一致。在零时延处，其 AF 与数据无关——这与线性调制波形不同。仍有两项权衡：差分估计器只在阈值以上与周期图相当、阈值以下退化；CP-OFDM 保留由 RMS 带宽决定的固定测距优势。未来工作包括谱成形 DFT-s-OFDM 等低 PAPR 替代方案、双站运行、共享带宽下的速率—感知权衡，以及多天线扩展。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 42 条，源文 pp. 12–13）。

[1] F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar, and S. Buzzi, "Integrated sensing and communications: Toward dual-functional wireless networks for 6G and beyond," IEEE Journal on Selected Areas in Communications, vol. 40, no. 6, pp. 1728–1767, 2022.

[2] N. González-Prelcic, M. Furkan Keskin, O. Kaltiokallio, M. Valkama, D. Dardari, X. Shen, Y. Shen, M. Bayraktar, and H. Wymeersch, "The integrated sensing and communication revolution for 6G: Vision, techniques, and applications," Proceedings of the IEEE, vol. 112, no. 7, pp. 676–723, 2024.

[3] "IEEE 802.11bf WLAN sensing amendment (approved 2025)," https://standards.ieee.org/ieee/802.11bf/11077/, 2025.

[4] W. Chen, "RAN Rel-19 status and a look beyond," https://www.3gpp.org/technologies/ran-rel-19, 2025, apr 07, 2025.

[5] 3GPP TSG-SA, "Evaluations on ISAC_ARC timeline (SP-231583), TSG-SA #102, Edinburgh, 11–15 Dec. 2023," https://shorturl.at/OM9Ni, 2023.

[6] Y. Zhang, J. Zhang, Y. Pei, Y. Liu, and T. Jiang, "Latest progress for 3GPP ISAC channel modeling standardization," Science China. Information Sciences, vol. 67, no. 11, p. 217301, 2024.

[7] ETSI ISAC ISG, "Integrated sensing and communications (ISAC); use cases and deployment scenarios," ETSI ISG ISAC, Tech. Rep., 2025-03. [Online]. Available: https://shorturl.at/kzEzU

[8] W. Zhou, R. Zhang, G. Chen, and W. Wu, "Integrated sensing and communication waveform design: A survey," IEEE Open Journal of the Communications Society, vol. 3, pp. 1930–1949, 2022.

[9] Z. Wei, H. Qu, Y. Wang, X. Yuan, H. Wu, Y. Du, K. Han, N. Zhang, and Z. Feng, "Integrated sensing and communication signals toward 5G-A and 6G: A survey," IEEE Internet of Things Journal, vol. 10, no. 13, pp. 11 068–11 092, 2023.

[10] C. Sturm and W. Wiesbeck, "Waveform design and signal processing aspects for fusion of wireless communications and radar sensing," Proceedings of the IEEE, vol. 99, no. 7, pp. 1236–1259, 2011.

[11] Y. Wang, Z. Wei, W. Zhou, K. Han, and Z. Feng, "Triangular FM-OFDM waveform design for integrated sensing and communication," in 2022 IEEE International Conference on Communications Workshops (ICC Workshops), 2022, pp. 515–519.

[12] A. Bouziane, S. Eddine Zegrar, and H. Arslan, "A novel OFDM-FMCW waveform for low-complexity joint sensing and communication," IEEE Wireless Communications Letters, vol. 14, no. 2, pp. 425–429, 2025.

[13] F. Liu, Y. Zhang, Y. Xiong, S. Li, W. Yuan, F. Gao, S. Jin, and G. Caire, "CP-OFDM achieves the lowest average ranging sidelobe under QAM/PSK constellations," IEEE Transactions on Information Theory, vol. 71, no. 9, pp. 6950–6967, 2025.

[14] H. Ochiai and H. Imai, "On the distribution of the peak-to-average power ratio in OFDM signals," IEEE Transactions on Communications, vol. 49, no. 2, pp. 282–289, 2001.

[15] Y. Rahmatallah and S. Mohan, "Peak-to-average power ratio reduction in OFDM systems: A survey and taxonomy," IEEE Communications Surveys & Tutorials, vol. 15, no. 4, pp. 1567–1592, 2013.

[16] M. O'Droma, S. Meza, and Y. Lei, "New modified Saleh models for memoryless nonlinear power amplifier behavioural modelling," IEEE Communications Letters, vol. 13, no. 6, pp. 399–401, 2009.

[17] A. K. Kumaran, M. Pashaeifar, M. Alexanderson, L. C. N. d. Vreede, and M. S. Alavi, "A single-supply balun-first three-way mm-wave Doherty PA," IEEE Transactions on Microwave Theory and Techniques, vol. 72, no. 5, pp. 2757–2772, 2024.

[18] M. A. Richards et al., Fundamentals of Radar Signal Processing. McGraw-Hill, New York, 2005, vol. 1.

[19] F. Liu, Y. Xiong, S. Lu, S. Li, W. Yuan, C. Masouros, S. Jin, and G. Caire, "Uncovering the iceberg in the sea: Fundamentals of pulse shaping and modulation design for random ISAC signals," IEEE Transactions on Signal Processing, vol. 73, pp. 2511–2526, 2025.

[20] Z. Liao, F. Liu, S. Li, Y. Xiong, W. Yuan, C. Masouros, and M. Lops, "Pulse shaping for random ISAC signals: The ambiguity function between symbols matters," IEEE Transactions on Wireless Communications, vol. 24, no. 4, pp. 2832–2846, 2025.

[21] Z. Du, F. Liu, Y. Xiong, T. X. Han, Y. C. Eldar, and S. Jin, "Reshaping the ISAC tradeoff under OFDM signaling: A probabilistic constellation shaping approach," IEEE Transactions on Signal Processing, vol. 72, pp. 4782–4797, 2024.

[22] C.-D. Chung and S.-M. Cho, "Constant-envelope orthogonal frequency division multiplexing modulation," in Fifth Asia-Pacific Conference on Communications and Fourth Optoelectronics and Communications Conference on Communications, vol. 1, 1999, pp. 629–632 vol.1.

[23] S. C. Thompson, A. U. Ahmed, J. G. Proakis, J. R. Zeidler, and M. J. Geile, "Constant envelope OFDM," IEEE Transactions on Communications, vol. 56, no. 8, pp. 1300–1312, 2008.

[24] J. Lorca Hernando and A. G. Armada, "Frequency-modulated OFDM: A new waveform for high-mobility wireless communications," IEEE Transactions on Communications, vol. 71, no. 1, pp. 540–552, 2023.

[25] L. Méndez-Monsanto, K. Chen-Hu, J. L. Hernando, and A. G. Armada, "Constant envelope multicarrier waveforms for 6G: Application to NTN and high frequency bands," IEEE Communications Standards Magazine, vol. 10, no. 2, pp. 98–106, 2026.

[26] S. C. Thompson and J. P. Stralka, "Constant envelope OFDM for power-efficient radar and data communications," in 2009 International Waveform Diversity and Design Conference, 2009, pp. 291–295.

[27] J. P. Stralka and G. G. Meyer, "Constant-envelope OFDM phase modulated radar waveforms," in Adaptive Sensor Array Processing (ASAP) Workshop, 2007, pp. 5–6.

[28] D. G. Felton and D. A. Hague, "Characterizing the ambiguity function of constant-envelope OFDM waveforms," in 2023 IEEE Radar Conference (RadarConf23), 2023, pp. 1–6.

[29] D. Felton and D. A. Hague, "Gradient-descent based optimization of constant envelope OFDM waveforms," in 2023 IEEE Radar Conference (RadarConf23), 2023, pp. 1–6.

[30] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, "Orthogonal time frequency space modulation," in 2017 IEEE Wireless Communications and Networking Conference (WCNC), 2017, pp. 1–6.

[31] H. S. Rou, G. T. F. de Abreu, J. Choi, D. González G., M. Kountouris, Y. L. Guan, and O. Gonsa, "From orthogonal time frequency space to affine frequency-division multiplexing: A comparative study of next-generation waveforms for integrated sensing and communications in doubly dispersive channels," IEEE Signal Processing Magazine, vol. 41, no. 5, pp. 71–86, 2024.

[32] D. Zhao, Z. Dong, D. Cai, J. Wang, Z. Khan, and W. Boulila, "Constant envelope OTFS waveform design and performance analysis for mobile ISAC systems," IEEE Transactions on Vehicular Technology, vol. 75, no. 2, pp. 3055–3065, 2026.

[33] S. D. Blunt, J. K. Jakabosky, C. A. Mohr, P. M. McCormick, J. W. Owen, B. Ravenscroft, C. Sahin, G. D. Zook, C. C. Jones, J. G. Metcalf, and T. Higgins, "Principles and applications of random FM radar waveform design," IEEE Aerospace and Electronic Systems Magazine, vol. 35, no. 10, pp. 20–28, 2020.

[34] J. W. Owen, C. C. Jones, P. M. McCormick, D. G. Felton, M. B. Heintzelman, J. E. Quirk, and S. D. Blunt, "Analysis of spectrally efficient random FM radar waveforms," in 2024 International Radar Conference (RADAR), 2024, pp. 1–6.

[35] D. A. Hague, "Adaptive transmit waveform design using multitone sinusoidal frequency modulation," IEEE Transactions on Aerospace and Electronic Systems, vol. 57, no. 2, pp. 1274–1287, 2021.

[36] A. Bouziane and H. Arslan, "Constant-envelope ISAC via FM-OFDM: Analytical framework and receiver design," arXiv preprint arXiv:2508.16107, 2025.

[37] J. Lorca Hernando, L. Méndez-Monsanto, and A. García Armada, "Channel estimation and equalization of zero-padded waveforms in doubly-dispersive channels," IEEE Transactions on Communications, vol. 73, no. 10, pp. 9470–9483, 2025.

[38] Y. Chen, C. Ding, Y. Jia, and Y. Liu, "Antenna/propagation domain self-interference cancellation (SIC) for in-band full-duplex wireless communication systems," Sensors, vol. 22, no. 5, p. 1699, 2022.

[39] H. Cramér, Mathematical Methods of Statistics. Princeton University Press, 1999, vol. 9.

[40] M. Abramowitz and I. A. Stegun, Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables. US Government Printing Office, 1948, vol. 55.

[41] S. Kay, "A fast and accurate single frequency estimator," IEEE Transactions on Acoustics, Speech, and Signal Processing, vol. 37, no. 12, pp. 1987–1990, 1989.

[42] S. Tretter, "Estimating the frequency of a noisy sinusoid by linear regression (Corresp.)," IEEE Transactions on Information Theory, vol. 31, no. 6, pp. 832–835, 1985.

## 图注与表注

**图 1：$s[n]$ 在单位圆上描绘的相位步长。** 上：由 $m$ 决定的偏移区域严格保持在模糊边界内，每个步长被正确读出。下：区域越过边界，左下角标出的超过 $\pi$ 的步长被读成符号相反的较小步长，并在圆的另一侧解码。

**图 2：式 (34) 的 $|A(\Delta p,\nu)|$。** 对 $k_0=1$、$m=0.6/(2\pi)$ 展示原点附近；$\Delta p=0$ 的竖带确定、与数据实现无关，周围旁瓣场随数据变化。

**图 3：若干 $k_0$ 下的相位增量方差 $D_\phi(\Delta p)$。** 虚线为 (38) 的底电平 $\overline D_\phi$。

**图 4：三种调制指数下的零多普勒切面与旁瓣底。**

**图 5：缠绕率随 $m$ 的变化。** 插图：占用率随 $\eta/\xi$ 的变化。

**图 6：旁瓣底随 $m$ 的变化。** 插图：占用带宽与 (18) 的对比，以及 (21) 预测的误差。

**图 7：三种波形远旁瓣平均功率随积分长度的变化**（96 MHz 与 49 MHz）。

**图 8：三种波形距离 RMSE 随每样本 SNR 的变化。**

**图 9：速度 RMSE 随每样本 SNR 的变化。** ST 为单目标。

**图 10：等占用带宽下双目标场景的零多普勒切面。** 弱目标比强目标低 35 dB。

**表注：** 表 I 汇总仿真参数，分"网格"（载频、采样率、子载波间隔、块长、保护长度、每区间符号数、符号时长、信道带宽、FM-OFDM 活跃子载波、截止子载波、星座）与"推导量"（FM-OFDM 指数、距离分辨率、无模糊距离、无模糊速度）两组。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.25909v1（eess.SP，2026-09-22）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（ISAC 标准化背景、三类波形、CP-OFDM 基线与其 PAPR 代价、随机 ISAC 信号相关分析、CE 波形与 RFM 家族、FM-OFDM 定位、4 项贡献、与初步版本 [36] 的区别、组织结构）；第 II 节系统模型（II-A 发射机模型、式 (1)—(7)；II-B 通信接收机、式 (8)；II-C 感知场景、式 (9)—(10)；II-D 带宽与调制指数、式 (11)—(23)）；第 III 节距离—多普勒处理与模糊函数（III-A 接收信号与解调、式 (24)—(31)；III-B 脉冲压缩、式 (32)—(43)；III-C 差分慢时间处理、式 (44)）；第 IV 节所提差分感知接收机（IV-A 慢时间样本、式 (45)—(48)；IV-B 多普勒估计器、式 (49)—(63)；IV-C 多普勒底）；第 V 节仿真结果（A 频谱与占用带宽；B 模糊函数与旁瓣底；C 距离与速度估计；D 目标遮蔽）；第 VI 节结论；42 条英文参考文献；表 I 与图 1—图 10 图注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言开头）→ 第 2 页（引言续、贡献、结构、第 II 节）→ 第 3 页（II-A、式 (1)—(8)、图 1）→ 第 4 页（II-C/II-D、式 (9)—(18)）→ 第 5 页（式 (19)—(23)、第 III 节、式 (24)—(25)）→ 第 6 页（式 (26)—(35)、图 2）→ 第 7 页（图 3、式 (36)—(43)、图 4）→ 第 8 页（III-C、第 IV 节、式 (44)—(49)）→ 第 9 页（式 (50)—(62)、图 5）→ 第 10 页（IV-C、式 (63)、第 V 节、表 I、图 6）→ 第 11 页（图 7—图 8、V-A/V-B/V-C）→ 第 12 页（图 9—图 10、V-D、第 VI 节、参考文献 [1]—[15]）→ 第 13 页（参考文献 [16]—[45]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I 的全部条目已按 PDF 第 10 页渲染图逐项核对（载频 28 GHz、采样率 245.76 MHz、块长 2048、符号时长 8.33 µs、$B_{\mathrm{ch}}$ 95.04 MHz、$m=0.0744$、$\Delta R=1.58$ m、无模糊距离 1250 m、无模糊速度 321 m/s），未改变任何数值。
2. 图 1—图 10 均未上传图片；本页以"图注与表注"小节统一给出 10 条中文图注与 1 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖原文编号式 (1)—(63)，全部保留原编号。
4. **原文疑点／说明：** ①原文 PDF 每页页眉出现模板占位符 **"CHANGE TITLE 1"…"CHANGE TITLE 13"**（作者未替换的标题占位），与正文内容无关，本页略去并在正文不引用；②式 (1) 的 cases 中左右两侧都写作 $X[k]$（即用同一符号表示"输入 QAM 符号"与"分配后的频域向量"），译文按原文照录；③式 (5) 前一句原文作 "cancels $N_a/N$ from (3). so"，句末标点异常，属原文排版问题，译文按语义译出；④式 (18)—(21) 的 $\eta$、$C$ 等常数按原文数值（$\eta\approx2.58$、$C=0.2019$）照录；⑤式 (41) 的两支分别对应 $\overline D_\phi\gg1$ 与 $\lesssim1$，译文保留不等式方向；⑥第 IV-C 节与第 V 节中的具体数值（0.0401/0.0384 m/s、32.4/32.1 dB、10.46/10.42 dB、−23/−43/−44 dB 等）按原文照录。
5. 原文为 arXiv 预印本（eess.SP），13 页；页面目录日期 2026-09-27 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-22）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
