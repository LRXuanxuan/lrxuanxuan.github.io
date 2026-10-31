---
layout: page
title: "空间稀疏 MIMO 信道的精确自由度｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-07926-exact-degrees-of-freedom-of-spatially-sparse-mimo-channels-without-pri/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b05fb1daabe5bcda/) · [原文 arXiv](https://arxiv.org/abs/2609.07926) · [全部目录](/papers/catalog/)

# 空间稀疏 MIMO 信道的精确自由度

**原题：** Exact Degrees of Freedom of Spatially Sparse MIMO Channels Without Prior CSI  
**作者：** Yifeng Xiong（Member, IEEE）、Weijiang Zhao、Fan Liu（Senior Member, IEEE）、Shi Jin（Fellow, IEEE）、Jianhua Zhang（Fellow, IEEE）  
**单位：** 原文抽取文本未包含作者单位行（IEEE 模板中通常置于首页脚注）；本页未凭推测补写单位信息。  
**版本：** arXiv:2609.07926v2（cs.IT），2026 年 9 月 11 日；原文页脚标注 DRAFT, September 14, 2026；48 页（正文 + 参考文献 + 附录 A—H）。  
**范围与状态：** 中文译稿覆盖：摘要、索引词、记号约定、第 I—VI 节（含 I-A/I-B、II（含定理 1 与解读）、III（III-A—III-E）、IV（IV-A—IV-F）、V（V-A—V-C）、VI）、图 1—4 中文图注、参考文献 [1]—[42]（英文原条目，按原编号），以及附录 A—H 的**结构化译文**（保留各引理/命题/定理的编号、证明思路与关键公式；附录证明未逐式全文翻译，已在页尾状态段说明）。原文无表格。逐句逐式终校未做。

## 摘要

本文刻画了**无先验信道状态信息（CSI）**的点到点分块无记忆信道的自由度（DoF）：信道具有固定数量 $K$ 条传播路径，发射端（Tx）与接收端（Rx）分别配备 $N_t$ 与 $N_r$ 根天线的**非均匀线阵（NULA）**。阵元位置固定、已知、两两不同，且不必等间距；均匀线阵（ULA）是其特例。在每个长度为 $T$ 的块内，连续的到达角（AoA）、离开角（AoD）以及独立的复高斯路径增益都会被重新抽取。收发两端都知道信道状态的分布，但在传输之前并不知道当前实现值。接收端可以从参考信号估计信道，也可以不显式估计而直接译码；参考符号计入 $T$，其能量计入功率约束。在上述模型下，我们证明 DoF 为

$$
\mathrm{DoF}=\begin{cases}1-\dfrac{1}{T},&K=1,\\[4pt] K\left(1-\dfrac{3}{2T}\right),&K\geqslant2,\end{cases}
$$

当 $N_r\geq K+1$、$N_t\geq\max\{K,2\}$、$T\geq K$ 时成立。这些解析结果进一步通过其在通信感知一体化（ISAC）DoF 折中分析中的应用得到展示。对更一般的阵列结构，我们建立了一个可达性结果，而一般情形下的逆定理仍为开放问题。

**索引词：** 自由度、信息维数、非相干 MIMO、稀疏信道、Saleh–Valenzuela 模型。

## I. 引言

### A. 背景与相关工作

无线系统中不断增大的天线阵列规模与传输带宽，使信道知识的获取成为通信系统设计的重要部分 [1]–[3]。在由有限条可分辨路径主导的传播环境中，信道系数通过共同的物理参数高度相关。特别地，每条路径都通过其增益、方向与时延在阵元、频率与观测时间之间联合作用。这种结构推动了稀疏信道模型：用少量传播分量描述大量系数 [4]–[6]。利用该结构可降低信道估计成本，同时也提出了一个问题：当信道实现未知时，这种结构如何影响基本的通信极限。

稀疏信道模型依传播场景与信号表示而有不同形式。远场空域模型使用少数路径的角度响应，而稀疏时延域模型描述频率选择性传播 [4]、[5]。对近场的电大孔径，路径响应可能同时依赖角度与距离，从而产生角度—距离联合表示 [7]。不同阵列几何进一步产生不同的响应函数 [8, 第 2 章]。当光滑参数化的实坐标数少于环境信道空间的维数时，可能的信道实现位于低维流形上。

为使问题明确，考虑窄带阵列观测模型

$$
\mathbf Y_\rho=\sqrt{\rho}\mathbf H\mathbf X+\mathbf N,
$$

其中 $\mathbf X$、$\mathbf H$、$\mathbf Y_\rho$、$\mathbf N$ 分别表示发射信号、信道矩阵、接收信号与独立高斯噪声，$\rho$ 为信噪比（SNR）参数。收发两端知道信道分布，但在传输前不知道 $\mathbf H$ 的当前实现。发射端独立于 $\mathbf H$ 把信息编码进 $\mathbf X$，接收端在该信道不确定性下从 $\mathbf Y_\rho$ 译码。对给定的分块无记忆信道与功率约束，容量 $C(\rho)$ 是每个信道使用时在给定 SNR $\rho$ 下、对所有容许输入分布取上确界的互信息 $I(\mathbf Y_\rho;\mathbf X)$。信道 DoF 是这一优化速率的预对数 [9]、[10]，即

$$
\mathrm{DoF}=\limsup_{\rho\to\infty}\frac{C(\rho)}{\log\rho}.
$$

给定某个输入分布则得到的是可达的互信息预对数。要证明某个输入是预对数最优的（即达到 DoF），需要对所有容许输入分布给出匹配的逆定理。我们强调，已知参考信号可作为 $\mathbf X$ 的确定性分量纳入，因此容量优化也覆盖参考辅助的信道估计与译码——所有参考符号计入 $T$，其能量计入功率约束。

从训练信号获取稀疏信道知识已有大量努力。压缩信道感知利用系数之间的相关性来减少重构所需资源 [5]、[6]。与本文研究的连续空间模型更相关的是，Shrestha 等人在发射与接收两端都存在离格角度的 MIMO 信道中，从压缩且量化的导频观测建立恢复保证 [11]。在这些信道估计问题中，探测矩阵已知，故无噪观测只随信道变化。而在没有先验 CSI 的通信中，发送块中承载数据的部分对接收端未知，其他位置可分配给已知参考信号。若参考信号不足，信道的某些变化便可由数据的变化补偿，使无噪观测保持不变 [12]。因此，从已知探测中恢复几何参数与通过同一信道传送未知数据，涉及不同的可辨识性问题；通信分析必须同时考虑数据与信道状态的联合作用。

无 CSI 下信道容量的信息论研究构成另一条相关工作线。对独立 Rayleigh 块衰落，Zheng 与 Tse 的开创性工作刻画了达到容量预对数的信号秩，揭示了空间复用与信道不确定性之间的平衡 [12]。后续研究确立了时间相关性与更一般信道分布的影响 [9]、[13]。特别地，Ngo、Yang 与 Guillaud 给出了环境矩阵空间中具有有限功率与有限微分熵的一般块衰落信道矩阵的最优 DoF [9]。然而，连续空间稀疏信道在该空间中可能具有奇异分布 [14]，其容量预对数因此需要尊重信道实现几何约束的分析。

若干结果进一步刻画了特定稀疏结构的收益。对具有固定有限可能时延支撑集的稀疏频率选择性块衰落，支撑不确定性本身不带来预对数损失，而未知复系数决定主要的学习代价 [15]。角度稀疏性已被用于盲多用户大规模 MIMO 的可达性 [16]，已知的发射相关子空间可降低非相干开销 [17]。随机镜面分量与分块常数相位噪声提供了另外的例子，其中不确定性结构影响容量或其高 SNR 展开 [18]、[19]。然而，它们关于支撑、子空间与连续参数的不同假设，并未给出确定连续几何信道 DoF 的共同规则。

在上述背景下，核心遗留问题便是：当几何状态与发送数据都未知时，如何刻画容量预对数。我们强调，仅统计所有信道参数只能不完整地描述候选输入分布的可达预对数，因为某些状态变化在联合输出中仍然可区分，而另一些可被吸收进数据或某个有效增益 [12]、[20]。具体而言，把导向向量投影到某个发射子空间，可能保留某些方向性变化而抑制另一些 [8, 第 2 与 8 章]。因此，输入设计通过决定发送流数以及这些流所能"看见"的信道不确定性，影响可达预对数。剩余任务是把可达预对数与一个在每个 SNR 下对所有容许输入分布一致成立的上界相匹配。

### B. 本文贡献

为研究上述问题，我们考虑具有固定路径数的点对点 NULA–Saleh–Valenzuela（SV）信道 [2]、[21]。该模型保留链路两端的连续到达与离开方向，以及独立的复高斯路径增益。完整状态逐块独立重抽，形成一种收发双方已知其分布律的分块无记忆信道。已知的阵列位置是任意且两两不同的，包括等间距 ULA 几何。块长与阵列规模在 SNR 增大时保持固定。因此 NULA–SV 模型为显式输出几何计算与匹配的容量预对数逆定理提供了一个有代表性的设定。

我们的分析分两步把接收信号的几何与通信目标联系起来。对在 SNR 增长时固定且满足所述正则条件的输入分布，每信道使用的可达预对数等于联合实信息维数减去条件实信息维数之差，再除以两倍块长。在显式正则条件下，这些维数可通过 Jacobian 秩求值 [10]、[14]、[22]。该方法建立在结构化通信模型的几何分析之上 [20]、[23]。为建立容量预对数，我们随后推导一个在每个 SNR 下对所有容许输入分布一致成立的上界。特别地，逼近上确界的分布可能依赖 SNR，并集中在退化输入附近 [9]、[24]。这一区分使我们能够在不假设某个固定分布在每个有限 SNR 都达到容量的情况下，识别出预对数最优的信令。

在此设定下，本文主要贡献如下。

1. 我们在所述条件下确定了精确的容量预对数：$K=1$ 时为 $1-1/T$，$K\geq2$ 时为 $K(1-3/(2T))$。我们证明这些值分别由通过单天线的与通过固定 $K$ 维子阵的高斯信令达到。
2. 我们揭示了非相干损失的几何来源。对多流输入，AoA 的贡献在联合输出维数与固定数据输出维数之间相互抵消，而复增益与可见的出发几何决定剩余损失。
3. 我们证明了匹配的逆定理，覆盖依赖 SNR 的输入分布，包括在多尺度上逼近秩 1 矩阵的混合分布；它还给出了参考信号辅助方案的 DoF 上界。对 NULA–SV 模型，第二奇异值同时控制 AoD 可分辨性与到秩 1 集合的接近程度；由此得到的条件输出熵下界与输出熵上界相结合，给出完整的 DoF 刻画。
4. 我们把可达性分析推广到具有固定预编码器的一般可分有限射线信道。我们推导了高斯信令的可达预对数公式，并给出基于路径响应矩阵与阵列响应导数的充分条件。我们通过均匀平面阵（UPA）天线选择与矩形连续孔径上的 Fourier 模式选择来说明这些结果，展示发射子空间如何控制在计入未知路径增益之后仍可区分的方向不确定性。

全文结构如下：第 II 节给出模型与主结果；第 III、IV 节分别证明可达性与逆定理；第 V 节讨论对其他阵列结构的推广及若干实际含义；第 VI 节总结。

**记号。** 全文中 $a$、$\mathbf a$、$\mathbf A$、$\mathcal A$ 分别表示随机标量、向量、矩阵与集合，其确定性对应物写作 $a$、$\mathbf a$、$\mathbf A$、$\mathcal A$；同一约定也适用于有限多重集。虚数单位记为 $\mathrm j=\sqrt{-1}$；零矩阵与 $n$ 维单位矩阵记为 $\mathbf 0$ 与 $\mathbf I_n$（上下文清楚时省略维数）。上标 $T$、$*$、$H$、${\dagger}$ 分别表示转置、复共轭、Hermitian 转置与 Moore–Penrose 伪逆；$\operatorname{diag}(\mathbf a)$ 表示以 $\mathbf a$ 为对角元构成的对角矩阵，$\otimes$ 表示 Kronecker 积；$\operatorname{vec}$、$\operatorname{Re}$、$\operatorname{Im}$ 分别表示按列堆叠、实部与虚部；$\operatorname{realify}(\mathbf Z)=(\operatorname{Re}\operatorname{vec}\mathbf Z,\operatorname{Im}\operatorname{vec}\mathbf Z)$ 把 $\operatorname{vec}\mathbf Z$ 的实部与虚部收集为实向量。$\|\mathbf a\|_2$ 表示 Euclidean 范数，$\|\mathbf A\|_2$ 与 $\|\mathbf A\|_F$ 分别表示谱范数与 Frobenius 范数；奇异值 $\sigma_i(\mathbf A)$ 按非增序排列。$\operatorname{dist}_F(\mathbf A,\mathcal A)$ 表示到集合的 Frobenius 距离；$\operatorname{rank}$、$\ker$、$\operatorname{col}$ 分别表示秩、核与列空间。对 Hermitian 矩阵，$\mathbf A\succcurlyeq\mathbf B$ 表示 $\mathbf A-\mathbf B$ 半正定，$\succ$ 表示正定。$\mathbb E\{\cdot\}$、$\mathbb P\{\cdot\}$、$\mathbb V\{\cdot\}$ 分别表示期望、概率与方差；$P_x$ 表示 $x$ 的概率分布，随机量之间的 $\perp$ 表示独立。$H(\cdot)$、$h(\cdot)$、$I(\cdot;\cdot)$ 分别表示离散熵、微分熵与互信息；$H_2(p)$ 表示 $\mathbb P\{x=0\}=p$ 的 Bernoulli 随机变量的熵。向下取整 $\lfloor\cdot\rfloor$ 对向量逐分量施加。所有对数均为自然对数，$\log^+x=\max\{0,\log x\}$、$\log^-x=\log^+x-\log x$。$O(\cdot)$、$o(\cdot)$、$\Theta(\cdot)$ 具有通常的渐近含义，极限变量由上下文指定。Jacobian 秩、流形维数与信息维数均在实化后于 $\mathbb R$ 上取；$D_u f$ 表示其他参数固定时关于 $u$ 的 Jacobian。

## II. 信道模型与主结果

我们考虑具有任意不同阵元位置的固定线阵 [8, 第 2 章]。对 $\nu\in\{\mathrm r,\mathrm t\}$，令 $x_{\nu,1},\ldots,x_{\nu,N_\nu}$ 表示以波长为单位的已知位置，其值不随 SNR 改变。导向向量为

$$
\mathbf a_\nu(u)=\frac{1}{\sqrt{N_\nu}}\left[e^{\mathrm j2\pi x_{\nu,1}u},\ldots,e^{\mathrm j2\pi x_{\nu,N_\nu}u}\right]^T,\qquad \nu\in\{\mathrm r,\mathrm t\}.\tag{1}
$$

我们称这种一般几何为 NULA 模型，均匀间距为其特例。特别地，取 $x_{\nu,n}=(n-1)d_\nu$（固定间距 $d_\nu>0$，以波长计）即得 ULA；半波长 ULA 对应 $d_\nu=1/2$。

我们为每个阵列选取原点使 $x_{\mathrm r,1}=x_{\mathrm t,1}=0$。确实，平移任一原点只会改变每条射线响应的一个标量相位，该相位可被吸收进复增益；在方向给定时，假设 1 中独立的循环高斯增益在这一相位改变后仍保持联合分布，因而仍与方向独立。该归一化不限制阵列几何。

物理射线没有内在顺序。因此我们用随机有限多重集表示第 $b$ 块的几何：

$$
\mathcal V_b=\left\{(u_{\mathrm r,b,k},u_{\mathrm t,b,k}):k=1,\ldots,K\right\},\tag{2}
$$

以及完整标记射线状态

$$
\mathcal S_b=\left\{(u_{\mathrm r,b,k},u_{\mathrm t,b,k},\alpha_{b,k}):k=1,\ldots,K\right\}.\tag{3}
$$

多重集记号保留了每条射线内 AoA–AoD–增益的对应关系。在下面施加的连续先验下，碰撞以概率零发生，故多重集几乎必然就是普通有限集。对确定性实现 $\mathcal S=\{(u_{\mathrm r,k},u_{\mathrm t,k},\alpha_k)\}_{k=1}^K$，定义确定性信道映射

$$
\mathbf H(\mathcal S)=\sum_{(u_{\mathrm r},u_{\mathrm t},\alpha)\in\mathcal S}\alpha\mathbf a_{\mathrm r}(u_{\mathrm r})\mathbf a_{\mathrm t}(u_{\mathrm t})^H.\tag{4}
$$

第 $b$ 块的随机信道矩阵为

$$
\mathbf H_b=\mathbf H(\mathcal S_b).\tag{5}
$$

下文若上下文清楚则省略下标 $b$。在上述设定下作如下假设。

**假设 1（NULA–SV 模型）：**

- **(U1)** 对每个 $\nu\in\{\mathrm r,\mathrm t\}$，式（1）中的阵元位置固定、已知且两两不同。固定一个闭的方向余弦区间 $\mathcal U_\nu=[\underline u_\nu,\overline u_\nu]\subseteq[-1,1]$，满足 $0<\overline u_\nu-\underline u_\nu\leq2$。$2K$ 个方向变量 $\{u_{\mathrm r,k},u_{\mathrm t,k}:k=1,\ldots,K\}$ 相互独立并满足 $\mathbb P\{u_{\nu,k}\in\mathcal U_\nu\}=1$。对每个 $(\nu,k)$，随机变量 $u_{\nu,k}$ 在 $\mathcal U_\nu$ 上关于 Lebesgue 测度有密度 $f_{u_{\nu,k}}\in C(\overline{\mathcal U}_\nu)$，且 $\int_{\mathcal U_\nu}f_{u_{\nu,k}}(u)\,du=1$。存在与 $(\nu,k)$ 无关的常数 $0<f_{\min}\leq f_{\max}<\infty$ 使 $f_{\min}\leq f_{u_{\nu,k}}(u)\leq f_{\max}$（$u\in\mathcal U_\nu$）。
- **(U2)** 增益满足 $\alpha_k\stackrel{\mathrm{iid}}{\sim}\mathcal{CN}(0,\sigma_\alpha^2)$（$0<\sigma_\alpha^2<\infty$），且与方向及输入独立。
- **(U3)** $K,T,N_t,N_r$ 满足 $N_r\geq K+1$、$N_t\geq\max\{K,2\}$、$T\geq K$。

尽管式（3）中的物理射线状态无序，假设 1 通过带索引的随机变量 $\{(u_{\mathrm r,k},u_{\mathrm t,k},\alpha_k):k=1,\ldots,K\}$ 规定其分布；我们在全部分析中只把这些索引当作辅助 Euclidean 坐标。相应地，记

$$
\mathbf A_{\mathrm r}(u_{\mathrm r})=\left[\mathbf a_{\mathrm r}(u_{\mathrm r,1}),\ldots,\mathbf a_{\mathrm r}(u_{\mathrm r,K})\right],\quad \mathbf A_{\mathrm t}(u_{\mathrm t})=\left[\mathbf a_{\mathrm t}(u_{\mathrm t,1}),\ldots,\mathbf a_{\mathrm t}(u_{\mathrm t,K})\right],\quad \mathbf D(\alpha)=\operatorname{diag}(\alpha_1,\ldots,\alpha_K),
$$

使得

$$
\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)=\mathbf A_{\mathrm r}(u_{\mathrm r})\mathbf D(\alpha)\mathbf A_{\mathrm t}(u_{\mathrm t})^H.\tag{6}
$$

发射端与接收端知道模型与先验分布，但不知道当前块 $\mathcal S$ 的实现。省略块索引，通信观测为

$$
\mathbf Y_\rho=\sqrt{\rho}\mathbf H\mathbf X+\mathbf N.\tag{7}
$$

噪声元素满足 $n_{it}\stackrel{\mathrm{iid}}{\sim}\mathcal{CN}(0,1)$，与完整信道状态及输入独立。输入满足 $\mathbb E\{\|\mathbf X\|_F^2\}\leq T$ 且与信道状态独立。定义

$$
C_{\mathrm{blind}}(\rho)=\frac{1}{T}\sup_{P_{\mathbf X}:\mathbb E\{\|\mathbf X\|_F^2\}\leq T}I(\mathbf X;\mathbf Y_\rho),\qquad d_{\mathrm{blind}}^{\mathrm{cap}}=\limsup_{\rho\to\infty}\frac{C_{\mathrm{blind}}(\rho)}{\log\rho}.
$$

形式上，状态块 $\{\mathcal S_b\}_{b\geq1}$ 独立同分布（i.i.d.），噪声块 $\{\mathbf N_b\}_{b\geq1}$ 也 i.i.d.，两个序列相互独立且独立于消息与编码器的私有信息；输入块之间不必独立。因此该信道分块无记忆，转移分布为 $P_{\mathbf Y_{1:B}\mid\mathbf X_{1:B}}=\prod_{b=1}^{B}P_{\mathbf Y_b\mid\mathbf X_b}$。尽管编码可跨越任意多块，容量仍由单块互信息的上确界给出。信道模型见图 1。

> **注 1：** 若角度在多个增益块间共享，转移核不再分解，本文定理不再适用。在常见稀疏 MIMO 信道模型中，角度或波束子空间的变化比小尺度复增益慢 [25]、[26]。

### A. 主结果与解读

在假设 1 下，主结果如下。

**定理 1（无 CSI 的 NULA–SV 信道 DoF）：** 考虑假设 1 与平均功率约束 $\mathbb E\{\|\mathbf X\|_F^2\}\leq T$ 下（5）—（7）的信道。极限 $\lim_{\rho\to\infty}C_{\mathrm{blind}}(\rho)/\log\rho$ 存在，且等于

$$
d_{\mathrm{blind}}^{\mathrm{cap}}=\begin{cases}1-\dfrac{1}{T},&K=1,\\[4pt] K\left(1-\dfrac{3}{2T}\right),&K\geq2.\end{cases}\tag{8}
$$

**证明：** 见附录 G-C。

对 $K\geq2$，$K$ 个接收方向维数同时出现在联合像与固定数据像中并相互抵消。这一抵消反映了在其概率 1 正则集上，两个输出映射中都存在 $K$ 个局部可区分的 AoA 变化。剩余损失由 $2K$ 个实增益维数与预编码输入可见的 $K$ 个 AoD 维数组成。

值得注意的是，对每个 $K$ 都存在达到 $1-1/T$ 的单天线输入分布；当 $K=T=2$ 时它已达到容量预对数 $1/2$，与双流高斯输入相同。因此，预对数最优性一般并不要求唯一的输入秩。

## III. 通过商秩证明可达性

### A. 证明架构

对 $K\geq2$，我们选择固定高斯输入 $\mathbf X=\mathbf B_K\mathbf S$，记无噪输出 $\mathbf Z=\mathbf H\mathbf B_K\mathbf S$。加性噪声的独立性给出

$$
I(\mathcal S;\mathbf Y_\rho)=I(\mathbf Z;\mathbf Y_\rho)-I(\mathbf Z;\mathbf Y_\rho\mid\mathcal S).
$$

下面的小噪声论证把该恒等式转化为

$$
\lim_{\rho\to\infty}\frac{I(\mathcal S;\mathbf Y_\rho)}{\log\rho}=\frac{1}{2}\left[\underline d(\mathbf Z)-\overline d(\mathbf Z\mid\mathcal S)\right],
$$

其中 $\underline d(\cdot)$ 为下文定义的信息维数。我们证明：输入数据与未知参数的联合实 Jacobian 秩为 $2KT+K$，而在固定输入下条件实 Jacobian 秩为 $4K$。通过证明所选输入满足绝对连续性、在概率 1 开集上秩恒定以及输出二阶矩有限等正则条件，我们进而证明这些秩等于相应的两个信息维数。

### B. Rényi 信息维数及其条件版本

Rényi 提出的信息维数通过细量化的熵增长率度量一个概率分布占据的有效实维数 [22]、[27]。对确定性向量 $\mathbf x\in\mathbb R^n$ 与整数 $m\geq1$，逐分量量化为

$$
\langle\mathbf x\rangle_m=\frac{\lfloor m\mathbf x\rfloor}{m}.
$$

由于乘以确定性非零常数不改变离散熵，有 $H(\langle\mathbf x\rangle_m)=H(\lfloor m\mathbf x\rfloor)$。

**定义 1（上、下 Rényi 信息维数）：** 若 $H(\lfloor\mathbf x\rfloor)<\infty$，定义

$$
\underline d_I(\mathbf x)=\liminf_{m\to\infty}\frac{H(\langle\mathbf x\rangle_m)}{\log m},\tag{9a}
$$

$$
\overline d_I(\mathbf x)=\limsup_{m\to\infty}\frac{H(\langle\mathbf x\rangle_m)}{\log m}.\tag{9b}
$$

若二者相等，其公共值记为 $d_I(\mathbf x)$。在上述有限熵条件下，离散分布的信息维数为零，而 $\mathbb R^r$ 上绝对连续分布的信息维数为 $r$ [22]、[27]。

我们采用 Geiger 与 Koch [28, 定义 1] 的条件信息维数：

$$
\underline d_I(\mathbf z\mid\theta)=\liminf_{m\to\infty}\frac{H(\langle\mathbf z\rangle_m\mid\theta)}{\log m},\tag{10a}
$$

$$
\overline d_I(\mathbf z\mid\theta)=\limsup_{m\to\infty}\frac{H(\langle\mathbf z\rangle_m\mid\theta)}{\log m}.\tag{10b}
$$

当二者相等时，其公共值记为 $d_I(\mathbf z\mid\theta)$。若 $H(\langle\mathbf z\rangle_1)<\infty$ 且逐点条件信息维数 $d_I(P_{\mathbf z\mid\theta=\theta})$ 对 $P_\theta$-几乎每个 $\theta$ 存在，则 [28] 的引理 2 给出

$$
d_I(\mathbf z\mid\theta)=\int d_I(P_{\mathbf z\mid\theta=\theta})P_\theta(d\theta).\tag{11}
$$

### C. 从常秩到信息维数

以下条件足以把 Jacobian 秩转化为信息维数。本小节中承载数据的变量记为 $\theta$，冗余（nuisance）变量记为 $u$。

**定义 2（信息维数转移条件）：** 设 $\theta$ 与 $u$ 为有限维实随机向量，分别表示数据与冗余参数，令 $\mathbf z=f(\theta,u)$。施加如下条件：

- **(A1)** $(\theta,u)$ 的分布除零概率奇异集外绝对连续。
- **(A2)** 存在开 Borel 集 $\mathcal O\subseteq\mathbb R^{\dim\theta+\dim u}$ 使 $\mathbb P\{(\theta,u)\in\mathcal O\}=1$；$f$ 在 $\mathcal O$ 上为 $C^1$，且 $\operatorname{rank}Df(\theta,u)=r$ 对所有 $(\theta,u)\in\mathcal O$ 成立。
- **(A2′)** 对 $P_\theta$-几乎每个 $\theta$，令 $\mathcal O_\theta=\{u:(\theta,u)\in\mathcal O\}$，则 $\mathbb P_{u\mid\theta=\theta}(\mathcal O_\theta)=1$ 且 $\operatorname{rank}D_uf(\theta,u)=r_u$ 对 $u\in\mathcal O_\theta$ 成立。
- **(A3)** $\mathbb E\{\|\mathbf z\|^2\}<\infty$。

我们将在后文证明，转移条件 (A1)—(A3) 并非额外假设，因为它们可由 NULA–SV 模型 (U1)—(U3) 与后文指定的输入分布推出。暂时假定其成立，可得如下引理。

**引理 1（可求长像的信息维数）：** 在定义 2 下，$d_I(\mathbf z)=r$、$d_I(\mathbf z\mid\theta)=r_u$。**证明：** 见附录 A-A。

引理 1 正式表明，在 (A1)—(A3) 下信息维数等于 Jacobian 秩。其思想与 [14] 中的定理 14 相似；然而参数不可辨识性在技术上使我们无法直接复用该结果，因此引理 1 是必要的。下一步把 Jacobian 秩之差转化为互信息预对数。

### D. 从信息维数到可达预对数

Wu、Shamai 与 Verdú 的开创性工作表明，标量干扰信道的 DoF 可通过信息维数之差来刻画：每个期望信号的贡献由"信号加干扰"观测的信息维数减去"仅干扰"的信息维数来度量 [29]。这一结构提示对本文问题做类似分解。此处被减去的项改为：输入固定时由未知信道状态产生的输出维数。本小节余下部分为 NULA–SV 模型形式化这一原理。我们首先给出经典预对数结果的一个略作特化的版本。

**引理 2（高 SNR 预对数）：** 设 $\mathbf x\in\mathbb R^n$ 与 $\mathbf n\sim\mathcal N(0,\mathbf I_n)$ 独立，且 $H(\lfloor\mathbf x\rfloor)<\infty$。若 $d_I(\mathbf x)$ 存在，则

$$
I(\mathbf x;\sqrt{\rho}\mathbf x+\mathbf n)=\frac{d_I(\mathbf x)}{2}\log\rho+o(\log\rho).\tag{12}
$$

任何固定的正定噪声协方差给出相同预对数。**证明：** 用 [10, 定理 6] 与 $d_I(\mathbf x)$ 的存在性，有 $\limsup_{\rho\to\infty}I(\mathbf x;\sqrt{\rho}\mathbf x+\mathbf n)/(\tfrac12\log\rho)=d_I(\mathbf x)$。为得到相应的下极限，取 $m=\lfloor\sqrt\rho\rfloor$；由高斯信道互信息对 SNR 的单调性与引理 13 的量化下界，$I(\mathbf x;\sqrt{\rho}\mathbf x+\mathbf n)\geq I(\mathbf x;m\mathbf x+\mathbf n)\geq H(\langle\mathbf x\rangle_m)-C_n$，其中 $C_n$ 只依赖 $\mathbf n$。由 $H(\langle\mathbf x\rangle_m)/\log m\to d_I(\mathbf x)$ 与 $\log m/(\tfrac12\log\rho)\to1$ 即得下极限不小于 $d_I(\mathbf x)$。两界合并即证 (12)。对任何固定正定噪声协方差，可由白化得到相同预对数，因为可逆线性变换保持信息维数与量化变量的熵有限性 [10, 引理 2]。

借助引理 2，我们得到如下结果。

**命题 1（带冗余参数的高 SNR 商秩公式）：** 设 $\mathbf z=f(\theta,u)$，$\theta$ 为承载数据的变量、$u$ 为冗余变量，且 $\mathbf n\sim\mathcal N(0,\boldsymbol\Sigma)$ 与 $(\theta,u)$ 独立，其中 $\boldsymbol\Sigma\succ0$ 为确定性且不依赖 $\rho$。令 $\mathbf y_\rho=\sqrt{\rho}\mathbf z+\mathbf n$。在定义 2 下，

$$
I(\theta;\mathbf y_\rho)=\frac{r-r_u}{2}\log\rho+o(\log\rho).\tag{13}
$$

**证明：** 见附录 A-B。

秩差 $r-r_u$ 是联合无噪像与"固定承载数据变量后剩余像"之间的商维数，它在所述正则条件下决定可达预对数。本文余下部分计算 NULA–SV 信道的该商，并证明没有输入分布能超过它。

### E. 高斯输入的 Jacobian 秩

式（3）中的物理状态在带索引路径参数的同时置换下不变。在路径碰撞集之外，这只在带索引的 Euclidean 表示中产生有限的置换模糊性；这种离散模糊性不改变局部 Jacobian 秩。此外，揭示或抑制相应的置换最多花费 $\log K!$ nats，因此不影响信息维数或相应的 DoF。所以我们直接在假设 1 指定的带索引坐标中计算全部 Jacobian 秩。

**引理 3（几乎处处的满秩条件）：** 设 $\lambda_1,\ldots,\lambda_N$ 为固定且两两不同的实数，记 $\mathbf a(u)=N^{-1/2}[e^{\mathrm j\lambda_1u},\ldots,e^{\mathrm j\lambda_Nu}]^T$、$\mathbf A(u)=[\mathbf a(u_1),\ldots,\mathbf a(u_K)]$。在任意固定的非退化紧方向余弦区间上，当 $N\geq K$ 时 $\mathbf A(u)$ 对几乎每个 $u$ 的秩为 $K$；当 $N\geq K+1$ 时，矩阵 $[\mathbf A(u),\dot{\mathbf a}(u_k)]$（$k=1,\ldots,K$）同时对几乎每个 $u$ 的秩为 $K+1$。**证明：** 见附录 B-A。

$[\mathbf A(u),\dot{\mathbf a}(u_k)]$ 的秩条件是对阵列流形所需的最小条件。注意方向互异并不保证任意 NULA 满足该秩条件。例如，以波长为单位的位置 $(0,1,3)$ 与方向余弦 $(-1/3,0,1/3)$ 给出（在归一化意义下）矩阵 $\begin{bmatrix}1&1&1\\\omega^*&1&\omega\\1&1&1\end{bmatrix}$（$\omega=e^{\mathrm j2\pi/3}$），它对每一对列都线性无关，但整体秩为 2。所幸根据引理 3，在 (U1) 下这类事件概率为零。这使我们能得到如下信道状态秩结果。

**引理 4（SV 信道参数化的局部秩）：** 在假设 1 下，排除零增益以及使某个 $k$ 满足 $\operatorname{rank}\mathbf A_{\mathrm t}<K$ 或 $\operatorname{rank}[\mathbf A_{\mathrm r},\dot{\mathbf a}_{\mathrm r}(u_{\mathrm r,k})]<K+1$ 的零测集后，映射 $(u_{\mathrm r},u_{\mathrm t},\alpha)\mapsto\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)$ 的实 Jacobian 秩为 $4K$。**证明：** 见附录 B-B。

接下来的两个引理把该信道状态秩结果推广到无噪信道输出。为此，我们显式选择用于证明可达性的候选输入分布。特别地，对 $K\geqslant2$ 定义半酉天线选择矩阵 $\mathbf B_K=[\mathbf e_1,\ldots,\mathbf e_K]\in\mathbb C^{N_t\times K}$，并把输入固定为高斯矩阵

$$
\mathbf X=\mathbf B_K\mathbf S,\qquad \mathbf S=[s_{ij}]\in\mathbb C^{K\times T},\qquad s_{ij}\stackrel{\mathrm{iid}}{\sim}\mathcal{CN}(0,1/K),\qquad \mathbf S\perp(u_{\mathrm r},u_{\mathrm t},\alpha,\mathbf N).\tag{14}
$$

因此 $\mathbb E\{\|\mathbf X\|_F^2\}=\mathbb E\{\|\mathbf S\|_F^2\}=\sum_{i=1}^{K}\sum_{t=1}^{T}\mathbb E\{|s_{it}|^2\}=T$。

**引理 5（无条件输出的局部秩）：** 对 $K\geq2$，记 $\mathbf X=\mathbf B_K\mathbf S$、$\mathbf Z=\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)\mathbf B_K\mathbf S$，其中 $\mathbf S\in\mathbb C^{K\times T}$。在满足 $\operatorname{rank}\mathbf S=K$、增益非零、$\operatorname{rank}(\mathbf B_K^H\mathbf A_{\mathrm t})=K$，且对所有 $k$ 有 $\operatorname{rank}[\mathbf A_{\mathrm r},\dot{\mathbf a}_{\mathrm r}(u_{\mathrm r,k})]=K+1$ 的每个点上，

$$
\operatorname{rank}_{\mathbb R}D_{(u_{\mathrm r},u_{\mathrm t},\alpha,\mathbf S)}\mathbf Z=2KT+K.
$$

**证明：** 见附录 B-C。

如附录 B-C 所详述，引理 5 的核心思想是：当 $\mathbf S$ 未知时，三元组 $(u_{\mathrm t},\alpha,\mathbf S)$ 在可用观测下等价于一个（实的）$2KT$ 维对象；而该三元组本身是 $(2KT+3K)$ 维的，故存在一个 $3K$ 维纤维无法由观测辨识，它在局部对应 AoD 与复增益。下一引理表明，固定满行秩输入 $\mathbf S$ 可在正则集上消除这一局部模糊。

**引理 6（条件输出的局部秩）：** 对 $K\geq2$ 与每个满行秩 $\mathbf S\in\mathbb C^{K\times T}$，当所有增益非零、$\operatorname{rank}(\mathbf B_K^H\mathbf A_{\mathrm t})=K$ 且对每个 $k$ 有 $\operatorname{rank}[\mathbf A_{\mathrm r},\dot{\mathbf a}_{\mathrm r}(u_{\mathrm r,k})]=K+1$ 时，有

$$
\operatorname{rank}_{\mathbb R}D_{(u_{\mathrm r},u_{\mathrm t},\alpha)}\left[\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)\mathbf B_K\mathbf S\right]=4K.
$$

在假设 1 下这些条件以概率 1 成立。**证明：** 见附录 B-D。

下面处理剩余的秩正则条件。

**推论 1（概率 1 的正则图册覆盖）：** 对 $K\geq2$，定义信道参数的正则集 $\mathcal O_{\mathrm{ch}}$ 为满足以下条件的参数集合：$u_{\nu,k}\in\operatorname{int}\mathcal U_\nu$（$\nu\in\{\mathrm r,\mathrm t\}$，$k=1,\ldots,K$）；$u_{\mathrm r,i}\neq u_{\mathrm r,j}$、$u_{\mathrm t,i}\neq u_{\mathrm t,j}$（$i\neq j$）；$\alpha_k\neq0$（$k=1,\ldots,K$）；$\operatorname{rank}(\mathbf B_K^H\mathbf A_{\mathrm t})=K$；$\operatorname{rank}[\mathbf A_{\mathrm r},\dot{\mathbf a}_{\mathrm r}(u_{\mathrm r,k})]=K+1$（$k=1,\ldots,K$）。再定义联合正则集 $\mathcal O_{\mathrm{joint}}=\mathcal O_{\mathrm{ch}}\times\{\mathbf S\in\mathbb C^{K\times T}:\operatorname{rank}\mathbf S=K\}$。在假设 1 的 (U1)—(U3) 下，$\mathbb P\{(u_{\mathrm r},u_{\mathrm t},\alpha)\in\mathcal O_{\mathrm{ch}}\}=1$；若 $\mathbf S$ 与信道参数独立且在 $\mathbb C^{K\times T}$ 上绝对连续，则 $\mathbb P\{(u_{\mathrm r},u_{\mathrm t},\alpha,\mathbf S)\in\mathcal O_{\mathrm{joint}}\}=1$。在 $\mathcal O_{\mathrm{joint}}$ 上，联合映射 $(u_{\mathrm r},u_{\mathrm t},\alpha,\mathbf S)\mapsto\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)\mathbf B_K\mathbf S$ 为 $C^1$ 且实 Jacobian 秩恒为 $2KT+K$；对每个固定满行秩 $\mathbf S$，条件映射 $(u_{\mathrm r},u_{\mathrm t},\alpha)\mapsto\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)\mathbf B_K\mathbf S$ 在 $\mathcal O_{\mathrm{ch}}$ 上为 $C^1$ 且实 Jacobian 秩恒为 $4K$。因此联合映射与条件映射满足定义 2 的条件 (A2)。**证明：** 见附录 B-E。

**引理 7（高斯输入的正则性）：** 设 $K\geq2$ 且 $(\mathbf X,\mathbf S)$ 由（14）给定。在假设 1 下，映射 $(u_{\mathrm r},u_{\mathrm t},\alpha,\mathbf S)\mapsto\mathbf H(u_{\mathrm r},u_{\mathrm t},\alpha)\mathbf B_K\mathbf S$ 满足定义 2 的 (A1)—(A3)，其中数据变量 $\theta=\operatorname{realify}(\mathbf S)$、冗余变量 $u=(u_{\mathrm r},u_{\mathrm t},\operatorname{realify}(\alpha))$。**证明：** 见附录 B-F。

汇总上述结果，即得如下 $K\geqslant2$ 的可达性结果。

**命题 2（高斯输入的可达预对数）：** 对 $K\geq2$，在假设 1 下，（14）中的高斯输入达到

$$
d_{\mathrm{Gauss}}=K\left(1-\frac{3}{2T}\right).\tag{15}
$$

**证明：** 见附录 C-A。

命题 2 尚不是容量结论，因为最优输入可能（本质上）支撑在更低秩的子集上，或在 SNR 增长时支撑集随之变化。下面通过考察单天线发射策略处理 $K=1$ 情形。我们强调，该策略实际上可推广到每个 $K\geq1$；特别地，它恢复了经典单输入块衰落的预对数 $1-1/T$ [12]，且足以给出 $K=1$ 的下界。

**命题 3（单流可达性）：** 在假设 1 下，对每个 $K\geq1$，固定输入 $\mathbf X=\mathbf e_1\mathbf s^T$（$\mathbf s\sim\mathcal{CN}(0,\mathbf I_T)$ 与信道和噪声独立）达到每信道使用至少 $1-1/T$ 的预对数。因此 $d_{\mathrm{blind}}^{\mathrm{cap}}\geq1-1/T$。**证明：** 见附录 C-B。

直观上，选择第一根发射与接收天线后，标量观测中既不含 AoA 也不含 AoD（固定在某一位置的阵元只携带常数相位），每块只剩一个复衰落系数。

## IV. 通过辅助（genie）界证明逆定理

上一节用信息维数建立了固定输入分布的可达性；但容量逆定理还必须覆盖随 SNR 变化的输入分布。本节通过引入辅助（genie-aided）观测获得所需的统一上界，并把 $K=1$ 与 $K\geq2$ 分开处理。

定义随机逐路径（pathwise）信道矩阵

$$
\mathbf G_{\mathrm{path}}:=\mathbf D(\alpha)\mathbf A_{\mathrm t}(u_{\mathrm t})^H.\tag{16}
$$

逐路径 genie 提供如下物理上不可观测的观测：

$$
\mathbf Z_\rho=\sqrt{\rho}\mathbf G_{\mathrm{path}}\mathbf X+\mathbf N_0,\qquad \mathbf N_0\sim\mathcal{CN}\left(0,K^{-1}\mathbf I_K\otimes\mathbf I_T\right),\tag{17}
$$

其中 $\mathbf N_0$ 与输入及信道参数独立。下面证明该逐路径 genie 确实构成可达互信息的上界。

**命题 4（逐路径 genie 归约）：** 对（7）中的原始观测 $\mathbf Y_\rho$ 与（17）中的逐路径观测 $\mathbf Z_\rho$，存在随机核 $Q_\rho$ 使 $P_{\mathbf Y_\rho\mid\mathbf X}=P_{\mathbf Z_\rho\mid\mathbf X}Q_\rho$。等价地，可构造观测 $\tilde{\mathbf Y}$ 使 $P_{\tilde{\mathbf Y}\mid\mathbf X}=P_{\mathbf Y_\rho\mid\mathbf X}$，且 $\mathbf X\to\mathbf Z_\rho\to\tilde{\mathbf Y}$ 构成 Markov 链。因此每个容许输入分布都满足 [30, 第 3 章]

$$
I(\mathbf X;\mathbf Y_\rho)\leq I(\mathbf X;\mathbf Z_\rho).\tag{18}
$$

**证明：** 见附录 D-A。

### A. $K=1$ 情形

对 $K=1$，我们再用一个附加的几何 genie，把完整几何 $\mathcal V=(u_{\mathrm r},u_{\mathrm t})$ 揭示给接收端。

**命题 5（单路径几何 genie 逆定理）：** 对 $K=1$，在假设 1 下，

$$
d_{\mathrm{blind}}^{\mathrm{cap}}\leq1-\frac{1}{T}.\tag{19}
$$

**证明：** 见附录 D-B。

在几何被揭示后，投影到接收导向向量是充分统计量，从而把信道化为经典标量非相干块衰落模型。结合命题 3 即得 $K=1$ 的精确 DoF。

**推论 2（单路径精确 DoF）：** 对 $K=1$，$d_{\mathrm{blind}}^{\mathrm{cap}}=1-1/T$。**证明：** 由命题 3 与命题 5 直接得到。

### B. $K\geqslant2$ 的逆定理：目标与证明架构

本小节余下部分假设 $K\geq2$。对 $K=1$ 使用的几何 genie 过强，无法恢复多路径所需的预对数，因此我们直接在逐路径观测 $\mathbf Z_\rho$ 上工作。定义峰值与平均功率下的逐路径互信息包络：

$$
J_{\mathrm{pk}}^{\mathbf Z}(\rho;A):=\sup_{P_{\mathbf X}:\mathbb P\{\|\mathbf X\|_F\leq A\}=1}I(\mathbf X;\mathbf Z_\rho),\tag{20a}
$$

$$
J_{\mathrm{av}}^{\mathbf Z}(\rho):=\sup_{P_{\mathbf X}:\mathbb E\{\|\mathbf X\|_F^2\}\leq T}I(\mathbf X;\mathbf Z_\rho).\tag{20b}
$$

令 $D^{\star}:=KT-\frac{3K}{2}$。由（18），DoF 逆定理归约为证明

$$
\limsup_{\rho\to\infty}\frac{J_{\mathrm{av}}^{\mathbf Z}(\rho)}{\log\rho}\leq D^{\star}.
$$

核心障碍在于最优输入分布可能依赖 $\rho$。为此我们先固定于一个固定幅度壳层，其中 $\sigma_1(\mathbf X)\asymp1$，并固定第二奇异值的一个尺度。设对某个 $a\geq0$ 有

$$
\sigma_2(\mathbf X)\asymp\rho^{-a/2},\qquad b=(1-a)^+\in[0,1]\tag{21}
$$

在支撑上一致成立。则 $b$ 是第二空间模式中高于噪声底的比例，因为 $\log(1+\rho\sigma_2(\mathbf X)^2)=b\log\rho+O(1)$。

证明围绕

$$
I(\mathbf X;\mathbf Z_\rho)=h(\mathbf Z_\rho)-h(\mathbf Z_\rho\mid\mathbf X)
$$

组织。对满足（21）的同一输入分布，我们建立两个互补估计：

$$
h(\mathbf Z_\rho)\leq\left[(1-b)(K+T-1)+bKT\right]\log\rho+o(\log\rho),\tag{22a}
$$

$$
h(\mathbf Z_\rho\mid\mathbf X)\geq\left(K+\frac{bK}{2}\right)\log\rho-o(\log\rho).\tag{22b}
$$

条件输出下界随 $b$ 增大而增强，因为可分辨的 AoD 变化更多；而秩 1 管输出上界随 $b$ 减小而收紧。两者相减得

$$
D(a)=(1-b)(T-1)+bD^{\star},\qquad b=(1-a)^+.\tag{23}
$$

于是在每个单一 $\sigma_2$ 尺度上，DoF 都被 $D^{\star}$ 所界，因为当 $T\geq K\geq2$ 时 $D^{\star}\geq T-1$。峰值功率有界的任意输入分布稍后通过对 $\log(\rho\sigma_1^2)$ 与 $\log(1+\rho\sigma_2^2)$ 联合分箱处理，并最终提升到原问题的平均功率约束情形。我们首先说明为什么同一第二奇异值在固定幅度壳层上同时控制两个熵估计。

### C. 第二奇异值作为秩 1 接近度与 AoD 可分辨性的共同尺度

令 $\mathcal R_1^{\mathrm{in}}=\{\mathbf b\mathbf s^T:\mathbf b\in\mathbb C^{N_t},\mathbf s\in\mathbb C^{T}\}$ 为秩 1 输入集合。下一引理表明 $\sigma_2(\mathbf X)$ 与该集合的绝对距离相关，从而把第二模式有效 SNR 的上界转化为秩 1 管半径，这在后文有用。

**引理 8（经由第二奇异值到秩 1 集合的距离）：** 对任意 $\mathbf X\in\mathbb C^{N_t\times T}$，令 $r_X=\min\{N_t,T\}$，则

$$
\sigma_2(\mathbf X)\leq\operatorname{dist}_F\left(\mathbf X,\mathcal R_1^{\mathrm{in}}\right)\leq\sqrt{r_X-1}\,\sigma_2(\mathbf X).\tag{24}
$$

**证明：** Eckart–Young 恒等式给出 $\operatorname{dist}_F(\mathbf X,\mathcal R_1^{\mathrm{in}})=\left(\sum_{j=2}^{r_X}\sigma_j(\mathbf X)^2\right)^{1/2}$；再用 $\sigma_j(\mathbf X)\leq\sigma_2(\mathbf X)$（$j\geq2$）即得（24）。

特别地，该引理还表明跟踪 $\sigma_2$ 即可控制所有更高奇异值，从而控制到秩 1 集合的所有接近方式；这很方便，因为我们无需用其他奇异值构造更精细的秩 1 管界。

接下来量化在接收端观测给定时 $\sigma_2(\mathbf X)$ 如何下界 AoD 灵敏度。对确定性输入矩阵 $\mathbf X$，定义 AoD 投影的时域信号

$$
\mathbf v_X(u)=\mathbf a_{\mathrm t}(u)^H\mathbf X.\tag{25}
$$

对固定 NULA，$\mathbf v_X(u)$ 是频率位于固定集合 $\Lambda_{\mathrm t}=\{-2\pi x_{\mathrm t,n}:n=1,\ldots,N_t\}$ 的向量值指数多项式。定义成对 Wronskian 向量

$$
\mathbf w_X(u)=\mathbf v_X(u)\wedge\dot{\mathbf v}_X(u),\tag{26}
$$

其频率属于 $\Lambda_{\mathrm t}+\Lambda_{\mathrm t}$。记 $\|\mathbf w_X\|_{\mathrm{coef}}$ 为该有限系数向量的 Euclidean 范数。特别地，对标量值指数多项式 $f(u)=\sum_{\ell=1}^{L}c_\ell e^{\mathrm j\lambda_\ell u}$（频率互异、$c_\ell\in\mathbb C$），定义

$$
\|f\|_{\mathrm{coef}}=\left[\sum_{\ell=1}^{L}|c_\ell|^2\right]^{1/2}.\tag{27}
$$

对向量值指数多项式 $\mathbf v(u)=\sum_{\ell=1}^{L}\mathbf c_\ell e^{\mathrm j\lambda_\ell u}=[v_1,\ldots,v_T]^T$（$\mathbf c_\ell\in\mathbb C^T$），定义

$$
\|\mathbf v\|_{\mathrm{coef}}=\left[\sum_{t=1}^{T}\|v_t\|_{\mathrm{coef}}^2\right]^{1/2}.\tag{28}
$$

借助该构造与标准 Wronskian 论证，可证如下结果 [32]、[33]。

**命题 6（来自第二外幂的一致 AoD 灵敏度）：** 存在仅依赖固定发射位置与 $(N_t,T)$ 的常数 $c>0$，使

$$
\|\mathbf w_X\|_{\mathrm{coef}}\geq c\,\sigma_1(\mathbf X)\sigma_2(\mathbf X).\tag{29}
$$

**证明：** 见附录 E-A。

引理 8 与命题 6 合起来赋予同一量 $\sigma_2(\mathbf X)$ 在固定幅度壳层上两个互补含义：它控制到秩 1 输入集合的接近度，并下界 AoD 灵敏度。这两个含义分别服务于输出熵上界与条件输出熵下界。

### D. 来自 AoD 可分辨性的条件输出熵

我们现在把命题 6 的投影灵敏度转化为固定输入下的一致输出熵下界。借助逐路径 genie，我们可以逐条路径处理。先考虑无噪情形：下面的引理在固定输入与对应单路径输出周围 $\epsilon$ 球下控制参数原像的体积。

**引理 9（一致投影原像体积界）：** 固定由互异实频率参数 $\Lambda=\{\lambda_1,\ldots,\lambda_{|\Lambda|}\}$ 构成的有限集与非退化紧区间 $\mathcal I$；本引理中所有常数只依赖 $(\Lambda,\mathcal I,T)$。设 $\mathbf v:\mathcal I\to\mathbb C^T$ 的分量为频率属于 $\Lambda$ 的指数多项式，并满足 $\|\mathbf v\|_{\mathrm{coef}}=1$、$\|\mathbf v\wedge\dot{\mathbf v}\|_{\mathrm{coef}}\geq\delta>0$。则存在 $\kappa=\kappa(\Lambda,\mathcal I,T)>0$，使对每个 $0<\tau<1$ 存在可测"好集" $\mathcal G_\tau\subseteq\mathcal I$ 满足 $|\mathcal I\setminus\mathcal G_\tau|=O(\tau^\kappa)$，并且对每个 $u\in\mathcal G_\tau$、$\alpha\neq0$ 与 $\epsilon>0$ 有

$$
\operatorname{Vol}(\mathcal P_\epsilon(\alpha,u))=O\left(\tau^{-4}\epsilon^2\min\left\{1,\frac{\epsilon}{|\alpha|\delta}\right\}\right),\tag{30}
$$

其中参数分辨单元定义为 $\mathcal P_\epsilon(\alpha,u):=\{(\alpha',u')\in\mathbb C\times\mathcal G_\tau:\|\alpha'\mathbf v(u')-\alpha\mathbf v(u)\|_2\leq\epsilon\}$。**证明：** 见 E-B 节。

对固定输出分辨率 $\epsilon$，（30）界定了被映射到给定无噪输出周围 $\epsilon$ 球内的参数对体积。因子 $\epsilon^2$ 来自复增益截面，而 $\min\{1,\epsilon/(|\alpha|\delta)\}$ 描述可容许 AoD 总长度的缩放。进一步说，引理 9 通过在 $(\alpha,u)$ 坐标中计算原像体积，给出每个 $\epsilon$ 球内概率的上界（如图 2 所示），这自然给出单路径输出 $\mathbf z$ 条件熵的下界。在计入例外事件并应用引理 13 的高斯量化界之后，即得如下含噪单路径输出熵下界。

**命题 7（一致单路径固定输入输出熵下界）：** 设 $u$ 支撑于固定区间 $\mathcal U_{\mathrm t}$ 上，其密度上下均有界；设 $\alpha\sim\mathcal{CN}(0,\sigma_\alpha^2)$ 与 $u$ 独立，$\mathbf n\sim\mathcal{CN}(0,\boldsymbol\Sigma_n)$ 与 $(u,\alpha)$ 独立且 $\boldsymbol\Sigma_n\succ0$ 固定。则对幅度壳层 $1\leq\sigma_1(\mathbf X_\rho)\leq C_1$ 内任意确定性矩阵序列，当 $\rho\to\infty$ 时

$$
h\left(\sqrt{\rho}\alpha\mathbf a_{\mathrm t}(u)^H\mathbf X_\rho+\mathbf n\right)\geq\log\rho+\frac{1}{2}\log\left(1+\rho\sigma_2(\mathbf X_\rho)^2\right)-o(\log\rho).\tag{31}
$$

对充分大的 $\rho$，（31）中的 $o(\log\rho)$ 余项可替换为确定性函数 $R_{\mathrm{sp}}(\rho)=B_1\sqrt{\log\rho}+B_2(\log\rho)e^{-b\sqrt{\log\rho}}+B_3$，其中 $B_1,B_2,B_3,b>0$ 只依赖固定阵列位置、维数、壳层界、增益方差、噪声协方差与 AoD 分布。特别地，$R_{\mathrm{sp}}(\rho)=o(\log\rho)$ 在整个壳层上一致成立，包括 $\sigma_2(\mathbf X_\rho)=0$。**证明：** 见附录 E-D。

现在把命题 7 的单路径结果提升为壳层内允许 $\sigma_2(\mathbf X)$ 任意分布的条件输出熵界。令 $\mathbf z_{\rho,k}$ 表示 $\mathbf Z_\rho$ 的第 $k$ 行。在 $\mathbf X=\mathbf X$ 条件下，

$$
\mathbf z_{\rho,k}=\sqrt{\rho}\alpha_k\mathbf a_{\mathrm t}(u_{\mathrm t,k})^H\mathbf X+\mathbf n_k,\tag{32}
$$

与（31）中的量同形。此外在 $\mathbf X=\mathbf X$ 条件下，路径增益、AoD 与噪声行跨 $k$ 独立，故 $h(\mathbf Z_\rho\mid\mathbf X=\mathbf X)=\sum_{k=1}^{K}h(\mathbf z_{\rho,k}\mid\mathbf X=\mathbf X)$。对壳层内每个固定实现 $\mathbf X$，可关于 $\sigma_1(\mathbf X)$ 归一化，得 $\sigma_1(\mathbf X/\sigma_1(\mathbf X))=1$ 与 $\rho\sigma_1(\mathbf X)^2\sigma_2(\mathbf X/\sigma_1(\mathbf X))^2=\rho\sigma_2(\mathbf X)^2$；又壳层上一致地有 $\sigma_1(\mathbf X)=\Theta(1)$，故 $\rho\sigma_1(\mathbf X)^2=\Theta(\rho)$ 且 $\log(\rho\sigma_1(\mathbf X)^2)=\log\rho+O(1)$。对每个条件行取 $\boldsymbol\Sigma_n=K^{-1}\mathbf I_T$、SNR 为 $\rho\sigma_1(\mathbf X)^2$ 应用命题 7，得

$$
h(\mathbf z_{\rho,k}\mid\mathbf X=\mathbf X)\geq\log\rho+\frac{1}{2}\log\left(1+\rho\sigma_2(\mathbf X)^2\right)-o(\log\rho),
$$

在壳层上关于 $\mathbf X$ 一致。对 $k$ 求和并对 $\mathbf X$ 取平均得

$$
h(\mathbf Z_\rho\mid\mathbf X)\geq K\log\rho+\frac{K}{2}\mathbb E\left\{\log\left(1+\rho\sigma_2(\mathbf X)^2\right)\right\}-o(\log\rho).\tag{33}
$$

注意该期望界无需假设单一 $\sigma_2(\mathbf X)$ 尺度即可成立。现在若（21）在支撑上一致成立，则 $\mathbb E\{\log(1+\rho\sigma_2(\mathbf X)^2)\}=b\log\rho+O(1)$（$b=(1-a)^+$）；代入（33）得

$$
h(\mathbf Z_\rho\mid\mathbf X)\geq\left(K+\frac{bK}{2}\right)\log\rho-o(\log\rho),\tag{34}
$$

恰为（22b）。结果（34）确实需要单一 $\sigma_2$ 尺度，后文将借助期望界（33）提升到一般的多尺度情形。

### E. 来自秩 1 管集中的输出熵

下面界定无条件输出熵 $h(\mathbf Z_\rho)$。当 $\sigma_2(\mathbf X)$ 很小时，无噪输出位于秩 1 输出集合附近；这种集中限制了其覆盖数，从而限制含噪熵（如图 3 所示）。定义截断的输入秩 1 管

$$
\mathcal T_1^{\mathrm{in}}(C_1,\delta):=\left\{\mathbf X\in\mathbb C^{N_t\times T}:\|\mathbf X\|_F\leq C_1,\ \operatorname{dist}_F\left(\mathbf X,\mathcal R_1^{\mathrm{in}}\right)\leq\delta\right\}.\tag{35}
$$

借助引理 8 可用 $\sigma_2(\mathbf X)$ 表示该管：

$$
\mathcal T_1^{\mathrm{in}}(C_1,\delta)\subseteq\left\{\mathbf X:\|\mathbf X\|_F\leq C_1,\ \sigma_2(\mathbf X)\leq\delta\right\}\subseteq\mathcal T_1^{\mathrm{in}}\left(C_1,\max\left\{1,\sqrt{\min\{N_t,T\}-1}\right\}\delta\right).\tag{36}
$$

因此对 $\sigma_2$ 的约束与 Frobenius 范数下的秩 1 管仅相差一个依赖维数的半径变化。在逐路径 genie 信道映射下，该输入管被变换为秩 1 输出子集周围的相应管。

为界输出熵，我们使用标准的覆盖数技术，特别是 KL 覆盖界 [30, 定理 32.4] 的高斯特化版本。设 $\mathcal A\subset\mathbb R^m$ 有界（可依赖 $\rho$），$\mathcal N_\epsilon(\mathcal A)$ 为其 Euclidean 覆盖数。若 $\mathbf s$ 支撑于 $\mathcal A$ 且与 $\mathbf n\sim\mathcal N(0,\boldsymbol\Sigma_n)$ 独立（$\boldsymbol\Sigma_n\succ0$ 固定），则

$$
h(\sqrt{\rho}\mathbf s+\mathbf n)\leq\log\mathcal N_{\rho^{-1/2}}(\mathcal A)+C_{m,\boldsymbol\Sigma_n}.\tag{37}
$$

确实，若 $\mathbf c_j$ 为 $\mathbf s$ 的覆盖中心、$P_{\mathbf s}=\mathcal N(\sqrt{\rho}\mathbf s,\boldsymbol\Sigma_n)$，则当 $\|\mathbf s-\mathbf c_j\|_2\leq\rho^{-1/2}$ 时 $D(P_{\mathbf s}\|P_{\mathbf c_j})\leq\frac{1}{2\lambda_{\min}(\boldsymbol\Sigma_n)}$；于是（37）由该界与 $h(\sqrt{\rho}\mathbf s+\mathbf n)=h(\mathbf n)+I(\mathbf s;\sqrt{\rho}\mathbf s+\mathbf n)$ 得到。该结果可通过向量化与实化推广到复向量与矩阵。

因此下一任务是界定秩 1 输出管的覆盖数。定义秩 1 输出集合 $\mathcal R_1^{\mathrm{out}}(R)=\{\mathbf Q\in\mathbb C^{K\times T}:\operatorname{rank}\mathbf Q\leq1,\|\mathbf Q\|_F\leq R\}$，并定义其半径 $r$ 的环境管 $\mathcal T_1(R,r)=\{\mathbf S:\operatorname{dist}_F(\mathbf S,\mathcal R_1^{\mathrm{out}}(R))\leq r\}$。下述引理界定输出秩 1 管 $\mathcal T_1(R,r)$ 的覆盖数。

**引理 10（秩 1 管覆盖）：** 存在只依赖 $(K,T)$ 的常数 $C,c>0$，使对 $0<\epsilon\leq R$ 与 $0\leq r\leq R$ 有

$$
\mathcal N_\epsilon(\mathcal T_1(R,r))\leq C\left(\frac{cR}{\epsilon}\right)^{2(K+T-1)}\left(1+\frac{cr}{\epsilon}\right)^{2(KT-K-T+1)}.\tag{38}
$$

**证明：** 见 F-A 节。

通过处理秩 1 输出管之外的概率尾部，我们得到如下结果。

**引理 11（秩 1 管的输出熵上界）：** 设 $\mathbf Z_\rho$ 为（17）中的逐路径观测，并设 $\mathbb P\{\mathbf X\in\mathcal T_1^{\mathrm{in}}(C_1,\delta)\}=1$（$0\leq\delta\leq\delta_{\max}<\infty$），其中 $C_1$ 与 $\delta_{\max}$ 固定且不依赖 $\rho$，而确定性半径 $\delta$ 可随 $\rho$ 变化。则对所有此类分布与半径序列一致地有

$$
h(\mathbf Z_\rho)\leq(K+T-1)\log\rho+(KT-K-T+1)\log(1+\rho\delta^2)+o(\log\rho).\tag{39}
$$

更精确地，对 $\rho\geq e^2$，$o(\log\rho)$ 余项可界为 $R_{\mathrm{tube}}(\rho)=C(1+\log\log\rho)$，其中 $C$ 不依赖输入分布与 $\delta\in[0,\delta_{\max}]$。**证明：** 见附录 F-B。

在固定幅度壳层与（21）的单尺度条件下，引理 8 把输入支撑置于半径 $O(\rho^{-a/2})$ 的秩 1 输入管中，因此引理 11 给出（22a），而（34）给出（22b）。于是后者从前者的相减给出单尺度 DoF 上界 $\limsup_{\rho\to\infty}I(\mathbf X_\rho;\mathbf Z_\rho)/\log\rho\leq D(a)\leq D^{\star}$，其中 $D(a)$ 由（23）定义。下一小节通过在二维有效 SNR 网格的每个单元内应用这两个分量界，得到多尺度版本。

### F. 完整的多尺度逆定理

本小节汇总前述结果，得到最终的多尺度逆定理。我们先在峰值功率约束下讨论，再把结果提升到平均功率。固定 $\Delta>0$，令 $w=\Delta\log\rho$。满足 $\rho\sigma_1^2\leq A^2\rho^\Delta$ 的输入构成单个低 SNR 单元，其互信息仅为 $O(\Delta\log\rho)$。在其补集上，使用对数坐标

$$
s=\log(\rho\sigma_1^2),\qquad q=\log(1+\rho\sigma_2^2),
$$

并把其可行区域划分为边长至多 $w$ 的矩形单元（如图 4 所示）。该二维网格有助于得到如下结果。

**定理 2（峰值功率约束下的多尺度逆定理）：** 设 $K\geq2$ 且 $T\geq K$。对每个不依赖 $\rho$ 的固定 $A\geq1$，

$$
\limsup_{\rho\to\infty}\frac{J_{\mathrm{pk}}^{\mathbf Z}(\rho;A)}{\log\rho}\leq D^{\star}.\tag{40}
$$

**证明：** 见附录 G-A。

为把结果推广到平均功率约束，我们在增长阈值 $\|\mathbf X\|_F^2=\rho^\epsilon$ 处拆分输入。在典型事件上，重缩放会把条件输入置入单位峰值功率球内，并把有效 SNR 变为 $\rho^{1+\epsilon}$；Markov 不等式可用于控制加权的高功率尾部，如下引理所示。

**引理 12（平均功率约束下的逆定理）：** 在定理 2 的条件下，$A=1$ 时的界（40）蕴含

$$
\limsup_{\rho\to\infty}\frac{J_{\mathrm{av}}^{\mathbf Z}(\rho)}{\log\rho}\leq D^{\star}.\tag{41}
$$

**证明：** 见附录 G-B。

于是主定理由可达性与逆定理论证相结合得到。

## V. 讨论

上述容量结果针对分块无记忆 NULA–SV 信道。不过，只要输入分布固定，其可达性论证可应用于更一般的阵列结构，本节将详细说明；我们还将讨论结果在通信感知一体化（ISAC）背景下的含义。

### A. 一般可达性

考虑可分有限射线模型

$$
\mathbf H(\xi,\eta,\alpha)=\sum_{k=1}^{K}\alpha_k\mathbf a_{\mathrm r}(\xi_k)\mathbf a_{\mathrm t}(\eta_k)^H,\tag{42}
$$

其中 $\xi_k\in\mathbb R^{p_r}$ 与 $\eta_k\in\mathbb R^{p_t}$ 分别收集描述第 $k$ 条路径接收与发射阵列响应的实参数（如 AoA 与 AoD）。令

$$
\mathbf X=\mathbf B\mathbf S,\qquad \mathbf B\in\mathbb C^{N_t\times L},\quad K\leq L\leq T,
$$

其中 $\mathbf B$ 为满列秩的固定预编码器，$\mathbf S$ 的元素为独立 $\mathcal{CN}(0,\|\mathbf B\|_F^{-2})$ 变量，且与信道状态及噪声独立。于是 $\mathbb E\{\|\mathbf B\mathbf S\|_F^2\}=T$，且 $\mathbf S$ 在 $\mathbb C^{L\times T}$ 上有非退化密度、几乎必然满行秩。该分布要求确保数据变化能够探索全部 $L\times T$ 个复方向。

为排除可被吸收进路径增益的非零复缩放因子，对向量 $\mathbf v$，记 $[\mathbf v]_{\mathrm{line}}$ 为其在非零复标量乘法下的等价类。接着定义投影导向向量的一般实投影秩

$$
q_B=\operatorname{rank}_{\mathbb R}D_\eta\left[\mathbf B^H\mathbf a_{\mathrm t}(\eta)\right]_{\mathrm{line}}.\tag{43}
$$

进一步定义导向矩阵 $\mathbf A_{\mathrm r}(\xi)=(\mathbf a_{\mathrm r}(\xi_1),\ldots,\mathbf a_{\mathrm r}(\xi_K))$、$\mathbf A_{\mathrm t}(\eta)=(\mathbf a_{\mathrm t}(\eta_1),\ldots,\mathbf a_{\mathrm t}(\eta_K))$，并记

$$
d_R=\operatorname{rank}_{\mathbb R}D_\xi\operatorname{col}\mathbf A_{\mathrm r}(\xi),\tag{44a}
$$

$$
d_H(\mathbf B)=\operatorname{rank}_{\mathbb R}D_{(\xi,\eta,\operatorname{Re}\alpha,\operatorname{Im}\alpha)}\left(\mathbf H(\xi,\eta,\alpha)\mathbf B\right).\tag{44b}
$$

这里 $\operatorname{col}\mathbf A_{\mathrm r}$ 是 Grassmann 流形上的一个点 [12]，而 $d_H(\mathbf B)$ 是有效信道矩阵的普通实 Jacobian 秩。

**命题 8（固定预编码器的条件预对数公式）：** 考虑（42）与上述独立高斯输入及（7）中的独立加性高斯噪声，并设以下条件成立：

- **(G1)** $\xi,\eta,\operatorname{Re}\alpha,\operatorname{Im}\alpha$ 的联合分布关于实 Lebesgue 测度绝对连续。
- **(G2)** 在状态坐标的一个概率 1 开集上，导向映射为 $C^1$、增益非零、$\mathbf A_{\mathrm r}$ 列秩为 $K$、矩阵 $\mathbf A_{\mathrm t}(\eta)^H\mathbf B$ 行秩为 $K$；且 (44a)—(44b) 中的两个秩 $d_R$ 与 $d_H(\mathbf B)$ 在该集合上恒定。
- **(G3)** 无噪输出 $\mathbf Z=\mathbf H(\xi,\eta,\alpha)\mathbf B\mathbf S$ 满足 $\mathbb E\{\|\mathbf Z\|_F^2\}<\infty$。

则联合无噪输出映射 $(\xi,\eta,\alpha,\mathbf S)\mapsto\mathbf H(\xi,\eta,\alpha)\mathbf B\mathbf S$ 在概率 1 开集上实秩为 $r=2KT+d_R$；对几乎每个固定 $\mathbf S$，条件映射 $(\xi,\eta,\alpha)\mapsto\mathbf H(\xi,\eta,\alpha)\mathbf B\mathbf S$ 在概率 1 开状态集上实秩恒为 $r_u=d_H(\mathbf B)$。因此该固定输入达到的预对数为

$$
d_B:=\lim_{\rho\to\infty}\frac{I(\mathbf S;\mathbf Y_\rho)}{T\log\rho}=\frac{2KT+d_R-d_H(\mathbf B)}{2T}.\tag{45}
$$

**证明：** 见附录 H-A。

上述命题给出指定高斯输入的可达预对数。下一命题用充分秩条件替代几何条件 (G2)，并显式计算相应秩。

**命题 9（显式预对数的充分条件）：** 考虑命题 8 的模型与高斯输入，并假设 (G1) 与 (G3) 成立、不假设 (G2)。定义 $\mathbf b(\eta)=\mathbf B^H\mathbf a_{\mathrm t}(\eta)$、$\mathbf Q_r=\mathbf I_{N_r}-\mathbf A_{\mathrm r}\mathbf A_{\mathrm r}^{\dagger}$，并设在状态坐标的一个概率 1 开集上：

- **(R1)** 导向映射为 $C^1$、所有增益非零、$\operatorname{rank}_{\mathbb C}\mathbf A_{\mathrm r}=K$、$\operatorname{rank}_{\mathbb C}(\mathbf A_{\mathrm t}^H\mathbf B)=K$。
- **(R2)** 对每个 $k=1,\ldots,K$，接收响应导数在接收列空间之外保留全部 $p_r$ 个实方向：$\operatorname{rank}_{\mathbb R}(\mathbf Q_rD_{\xi_k}\mathbf a_{\mathrm r}(\xi_k))=p_r$。
- **(R3)** 对每个 $k=1,\ldots,K$，投影后的发射响应具有相同的常实投影秩 $q_B$：$\operatorname{rank}_{\mathbb R}\left[\left(\mathbf I_L-\frac{\mathbf b(\eta_k)\mathbf b(\eta_k)^H}{\|\mathbf b(\eta_k)\|_2^2}\right)D_{\eta_k}\mathbf b(\eta_k)\right]=q_B$。

（在 (R2)—(R3) 中参数变化为实，输出在取秩前已实化。）则 $d_R=Kp_r$、$d_H(\mathbf B)=K(p_r+q_B+2)$，且高斯输入达到

$$
d_B=K\left(1-\frac{q_B+2}{2T}\right).\tag{46}
$$

**证明：** 见附录 H-B。

进一步解释：(R1) 在收发两端分离路径系数；(R2) 确保每个接收侧参数（如 AoA）变化都会改变接收子空间；而 (R3) 在去除被增益吸收的复缩放后统计发射侧变化。于是 $Kp_r$ 个接收侧参数维数同时出现在（条件与无条件的）输出维数中，并在其差中抵消。对（14）中 NULA 子阵预编码器，引理 3 验证了所需接收秩，且对 $K\geq2$ 有 $q_BK=1$。

### B. 其他阵列结构的例子

下面给出两个可显式计算 $q_B$ 的具体阵列结构。两个例子都假设联合状态分布如 (G1) 绝对连续；两例中的响应在方向上一致有界。再利用 $\mathbb E\{\|\alpha\|^2\}<\infty$，对某固定常数 $C$ 有 $\mathbb E\{\|\mathbf H\mathbf B\mathbf S\|_F^2\}\leqslant C\mathbb E\{\|\alpha\|^2\}\mathbb E\{\|\mathbf S\|_F^2\}<\infty$，即 (G3) 成立。其余条件 (R1)—(R2) 在附录 H-C 中验证，它们通过计算出的 $q_B$ 与命题 9 反过来保证 (G2)。下面具体给出接收端构造并显式计算 $q_B$。

**1）带天线选择的均匀平面阵（UPA）：** 对 UPA，记其索引 $(m,n)$ 处响应为 $a_{m,n}(u,v)\propto e^{\mathrm j(mu+nv)}$，其中 $u,v$ 为乘以固定非零间距因子的两个方向余弦。设 $\mathbf B$ 为选择 $L$ 个索引 $(m_\ell,n_\ell)$（$\ell=1,\ldots,L$）上互异阵元的天线选择矩阵，其相对响应满足

$$
\frac{b_\ell(u,v)}{b_1(u,v)}=e^{\mathrm j\left[(m_\ell-m_1)u+(n_\ell-n_1)v\right]}.
$$

于是

$$
q_B=\operatorname{rank}_{\mathbb R}\begin{bmatrix}m_2-m_1&n_2-n_1\\\vdots&\vdots\\m_L-m_1&n_L-n_1\end{bmatrix},\tag{47}
$$

当 $L=1$ 时其值为零；仅选择共线阵元且 $L\geqslant2$ 时 $q_B=1$；选择至少三个非共线阵元时 $q_B=2$。例如阵元 $(0,0)$、$(1,0)$、$(0,1)$ 保留了两种方向变化。

**2）带 Fourier 模式选择的矩形孔径：** 对连续矩形孔径，Fourier 表示为有限模式信号模型提供了便利 [34]。这里把该表示用于有限射线 SV 信道。把每个孔径坐标归一化到 $[-1/2,1/2]$，整数索引 $(m,n)$ 的正交模式为

$$
\phi_{m,n}(x,y)=e^{\mathrm j2\pi(mx+ny)}.
$$

它与归一化空间频率 $(u,v)$ 的远场平面波的内积为

$$
b_{m,n}(u,v)=\operatorname{sinc}(u-m)\operatorname{sinc}(v-n),\tag{48}
$$

其中 $\operatorname{sinc}(x)=\frac{\sin(\pi x)}{\pi x}$、$\operatorname{sinc}(0)=1$。从固定有限模式集中选择 $L$ 个模式，有限输入与输出模式数分别扮演 $N_t$ 与 $N_r$ 的角色，发射模式系数服从相同的平均功率约束。显然单个模式给出 $q_B=0$；若所有被选模式具有相同的第二索引且 $L\geqslant2$，则其互异的第一索引给出几乎处处的 $q_B=1$；若选择包含 $(0,0)$、$(1,0)$、$(0,1)$，则在 $b_{0,0}\neq0$ 的概率 1 事件上，由于

$$
\frac{b_{1,0}}{b_{0,0}}=\frac{u}{1-u},\qquad\frac{b_{0,1}}{b_{0,0}}=\frac{v}{1-v},\tag{49}
$$

一般有 $q_B=2$。

由此可以得出结论：商秩方法能为一般阵列结构给出有用的可达 DoF 下界估计。然而，要获得有用的逆界或证明所得 DoF 估计的最优性，一般是困难的。

### C. 在 ISAC 中的应用：DoF 折中

ISAC 是第六代（6G）网络的主要应用场景之一，旨在通过把感知与通信两种功能集成到统一平台来提升资源效率并促进互利 [35]。其简化形式可建模为如下一对信道：

$$
\mathbf Y_c=\mathbf H_c\mathbf X+\mathbf N_c,\qquad \mathbf Y_s=\mathbf H_s\mathbf X+\mathbf N_s,\tag{50}
$$

其中 $\mathbf Y_c\in\mathbb C^{N_c\times T}$、$\mathbf Y_s\in\mathbb C^{N_s\times T}$、$\mathbf H_c\in\mathbb C^{N_c\times N_t}$、$\mathbf H_s\in\mathbb C^{N_s\times N_t}$ 分别表示接收到的通信与感知信号、通信与感知信道；感知信道 $\mathbf H_s$ 又称目标响应矩阵。感知与通信噪声 $\mathbf N_s,\mathbf N_c$ 假设为逐元素零均值 i.i.d. 的适定复高斯噪声，相互独立，方差分别为 $\sigma_s^2$ 与 $\sigma_c^2$。发送信号 $\mathbf X$ 由感知与通信功能共享，并假设对感知接收端已知。某注入 $\eta\mapsto\mathbf H_s(\eta)$ 决定感知信道，感知任务即估计 $\eta$。

在上述模型下，当 $\mathbf H_c$ 对通信接收端已知时，感知—通信折中已有研究 [36]、[37]；特别地，当感知性能最优时，通常存在通信 DoF 损失。相反，当 $\mathbf H_c$ 未知（与本文主题更相关）时，[38] 表明若 $\mathbf H_c$ 的元素 i.i.d. 且服从 $\mathcal{CN}(0,1)$（即独立 Rayleigh 块衰落），则不存在感知引起的 DoF 损失。这一差异源于：独立 Rayleigh 块衰落情形中达到通信 DoF 的输入分布是酉不变的，它比感知引起的正交约束更强。具体而言，通信最优信息载体位于 $2K(T-K)$ 维 Grassmann 流形上，而感知最优约束只把输入限制在 $2K(T-K/2)$ 维 Stiefel 流形上。

本文表明，在 NULA–SV 模型中，未知 CSI 引起的 DoF 损失至多为 $3K/2T$；当 $K\geq4$ 时，它小于感知约束引起的 $K^2/2T$ DoF 损失（只要感知最优样本协方差矩阵唯一，见 [36] 关于唯一性问题的详细讨论）。这意味着，即使通信接收端没有 CSI，NULA–SV 模型中仍可能存在感知—通信 DoF 折中。

下面给出一个具体例子。考虑 $N_t=K\geq4$、$N_c,N_s\geq K+1$、$T\geq K$，且通信与感知信道都满足有限射线模型

$$
\mathbf H_i=\sum_{k=1}^{K}\alpha_{i,k}\mathbf a_{i,\mathrm r}(u_{i,\mathrm r,k})\mathbf a_{\mathrm t}(u_{i,\mathrm t,k})^H,\qquad i\in\{c,s\},
$$

其中所有方向余弦服从 $\mathcal U(-1,1)$，复增益服从相互独立的适定复高斯分布。通信收发两端都知道这些参数的分布但不知道其实现。假设阵元位于半波长整数倍处，即 $x_n=\frac{m_n}{2}$（$m_n$ 互异整数），从而先验协方差矩阵为 $\operatorname{Cov}(\operatorname{vec}\mathbf H_s)=\beta\mathbf I$（$\beta>0$ 为常数）。

现在考虑在仅使用线性估计器的约束下估计完整目标响应矩阵 $\mathbf H_s$ 的感知任务，性能度量为均方误差（MSE）。此时最优估计器是已知的线性最小均方误差（LMMSE）估计器，其 MSE 为

$$
J(\mathbf R_X)=N_s\operatorname{tr}\left(\beta^{-1}\mathbf I+\frac{T}{\sigma_s^2}\mathbf R_X\right)^{-1},\tag{51}
$$

其中 $\mathbf R_X=(1/T)\mathbf X\mathbf X^H$。在平均功率约束 $\mathbb E[\operatorname{tr}\mathbf R_X]\leqslant P$ 下，Jensen 不等式给出

$$
\mathbb E\{J(\mathbf R_X)\}\geqslant N_sK\,\mathbb E\left[\left(\beta^{-1}+\frac{T}{K\sigma_s^2}\operatorname{tr}\mathbf R_X\right)^{-1}\right]\geqslant\frac{N_sK}{\beta^{-1}+\frac{T}{K\sigma_s^2}P},\tag{52}
$$

表明感知最优的 $\mathbf R_X$ 几乎必然为 $\mathbf R_X^{\star}=\frac{P}{K}\mathbf I$。因此感知最优样本协方差矩阵唯一且满秩，故该例子确实存在感知—通信 DoF 折中。

> **注 2：** 直观上，感知任务希望以高精度学习每个未知参数，因而给每个方向分配相同功率；相反，通信任务无需为学习 AoA 分配额外资源，因为盲估计所保证的精度已足以达到 DoF。

我们指出，本文结果限于这一具体例子，尤其限于使用线性估计器的假设。我们希望所提分析框架能够被扩展并用于揭示更一般的感知—通信 DoF 折中。

## VI. 结论

本文确定了无先验 CSI 的分块无记忆 NULA–SV 信道的容量预对数，适用于任意固定且互异的阵列位置，包括作为重要特例的 ULA。对 $K\geq2$，商秩论证给出 $3K$ 个实维度的净损失，而固定 $K$ 天线高斯输入达到由此得到的预对数。对 $K=1$，单天线发射策略通过把观测化为标量块衰落信道而达到该 DoF。一致逆定理表明，依赖 SNR 的输入分布无法达到更高 DoF。

一般而言，商秩论证提示可达性分析也可应用于其他有限射线阵列模型，UPA 与矩形孔径例子即是说明。然而，要扩展容量定理，需要对其额外的退化集合给出匹配的逆定理，这值得未来研究。

## 图注

**图 1（原 PDF 第 7 页）：** 空间稀疏 NULA–SV 信道及其逐块状态演化：每个块内重新抽取 $K$ 条射线的 AoA、AoD 与复增益，收发两端只知道状态分布。

**图 2（原 PDF 第 15 页）：** 引理 9 的图示：在固定输入条件下，更小的参数分辨单元产生更可区分的输出，从而带来更大的输出熵。

**图 3（原 PDF 第 17 页）：** 用半径 $\epsilon$ 的环境球对秩 1 管做覆盖的图示；其截面半径 $r$ 由第二大奇异值 $\sigma_2(\mathbf X)$ 控制。

**图 4（原 PDF 第 18 页）：** 定理 2 中二维有效 SNR 网格的图示（横轴对应 $\log(\rho\sigma_1^2)$、纵轴对应 $\log(1+\rho\sigma_2^2)$，网格边长 $w=\Delta\log\rho$）。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, "Massive MIMO for next generation wireless systems," IEEE Commun. Mag., vol. 52, no. 2, pp. 186–195, Feb. 2014.

[2] A. Alkhateeb, O. El Ayach, G. Leus, and R. W. Heath, Jr., "Channel estimation and hybrid precoding for millimeter wave cellular systems," IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 831–846, Oct. 2014.

[3] K. Venugopal, A. Alkhateeb, N. González Prelcic, and R. W. Heath, Jr., "Channel estimation for hybrid architecture-based wideband millimeter wave systems," IEEE J. Sel. Areas Commun., vol. 35, no. 9, pp. 1996–2009, Sep. 2017.

[4] A. M. Sayeed, "Deconstructing multiantenna fading channels," IEEE Trans. Signal Process., vol. 50, no. 10, pp. 2563–2579, Oct. 2002.

[5] W. U. Bajwa, J. Haupt, A. M. Sayeed, and R. Nowak, "Compressed channel sensing: A new approach to estimating sparse multipath channels," Proc. IEEE, vol. 98, no. 6, pp. 1058–1076, Jun. 2010.

[6] R. W. Heath, Jr., N. González-Prelcic, S. Rangan, W. Roh, and A. M. Sayeed, "An overview of signal processing techniques for millimeter wave MIMO systems," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 436–453, Apr. 2016.

[7] M. Cui and L. Dai, "Channel estimation for extremely large-scale MIMO: Far-field or near-field?" IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, Apr. 2022.

[8] H. L. Van Trees, Optimum Array Processing, ser. Detection, Estimation, and Modulation Theory. New York, NY, USA: Wiley, 2002, vol. IV.

[9] K.-H. Ngo, S. Yang, and M. Guillaud, "The optimal DoF for the noncoherent MIMO channel with generic block fading," in Proc. IEEE Information Theory Workshop, Riva del Garda, Italy, 2020.

[10] D. Stotz and H. Bölcskei, "Degrees of freedom in vector interference channels," IEEE Trans. Inf. Theory, vol. 62, no. 7, pp. 4172–4197, Jul. 2016.

[11] R. Shrestha, M. Shao, M. Hong, W.-K. Ma, and X. Fu, "Downlink MIMO channel estimation from bits: Recoverability and algorithm," IEEE Trans. Signal Process., vol. 73, pp. 3718–3733, 2025.

[12] L. Zheng and D. N. C. Tse, "Communication on the Grassmann manifold: A geometric approach to the noncoherent multiple-antenna channel," IEEE Trans. Inf. Theory, vol. 48, no. 2, pp. 359–383, Feb. 2002.

[13] G. Koliander, E. Riegler, G. Durisi, and F. Hlawatsch, "Degrees of freedom of generic block-fading MIMO channels without a priori channel state information," IEEE Trans. Inf. Theory, vol. 60, no. 12, pp. 7760–7781, Dec. 2014.

[14] G. Koliander, G. Pichler, E. Riegler, and F. Hlawatsch, "Entropy and source coding for integer-dimensional singular random variables," IEEE Trans. Inf. Theory, vol. 62, no. 11, pp. 6124–6154, Nov. 2016.

[15] A. P. Kannu and P. Schniter, "On communication over unknown sparse frequency-selective block-fading channels," IEEE Trans. Inf. Theory, vol. 57, no. 10, pp. 6619–6632, Oct. 2011.

[16] J. Zhang, X. Yuan, and Y. J. A. Zhang, "Blind signal detection in massive MIMO: Exploiting the channel sparsity," IEEE Trans. Commun., vol. 66, no. 2, pp. 700–712, Feb. 2018.

[17] F. Zhang, K.-H. Ngo, S. Yang, and A. Nosratinia, "Transmit correlation diversity: Generalization, new techniques, and improved bounds," IEEE Trans. Inf. Theory, vol. 68, no. 6, pp. 3841–3869, Jun. 2022.

[18] M. Godavarti, T. L. Marzetta, and S. Shamai, "Capacity of a mobile multiple-antenna wireless link with isotropically random Rician fading," IEEE Trans. Inf. Theory, vol. 49, no. 12, pp. 3330–3334, Dec. 2003.

[19] G. Durisi, "On the capacity of the block-memoryless phase-noise channel," IEEE Commun. Lett., vol. 16, no. 8, pp. 1157–1160, Aug. 2012.

[20] M. Karzand and L. Zheng, "Degrees of freedom in fading channels with memory: Achievability through nonlinear decoding," in Proc. 52nd Annual Allerton Conference on Communication, Control, and Computing, Monticello, Illinois, USA, 2014.

[21] A. A. M. Saleh and R. A. Valenzuela, "A statistical model for indoor multipath propagation," IEEE J. Sel. Areas Commun., vol. 5, no. 2, pp. 128–137, Feb. 1987.

[22] Y. Wu and S. Verdú, "Rényi information dimension: Fundamental limits of almost lossless analog compression," IEEE Trans. Inf. Theory, vol. 56, no. 8, pp. 3721–3748, Aug. 2010.

[23] H. V. Cheng and W. Yu, "Degree-of-freedom of modulating information in the phases of reconfigurable intelligent surface," IEEE Trans. Inf. Theory, vol. 70, no. 1, pp. 170–188, Jan. 2024.

[24] V. I. Morgenshtern, E. Riegler, W. Yang, G. Durisi, S. Lin, B. Sturmfels, and H. Bölcskei, "Capacity pre-log of noncoherent SIMO channels via Hironaka's theorem," IEEE Trans. Inf. Theory, vol. 59, no. 7, pp. 4213–4229, Jul. 2013.

[25] C. K. Anjinappa, A. C. Gürbüz, Y. Yapici, and I. Güvenc, "Off-grid aware channel and covariance estimation in mmWave networks," IEEE Trans. Commun., vol. 68, no. 6, pp. 3908–3921, Jun. 2020.

[26] V. Va, J. Choi, and R. W. Heath, Jr., "The impact of beamwidth on temporal channel variation in vehicular channels and its implications," IEEE Trans. Veh. Technol., vol. 66, no. 6, pp. 5014–5029, Jun. 2017.

[27] A. Rényi, "On the dimension and entropy of probability distributions," Acta Mathematica Academiae Scientiarum Hungaricae, vol. 10, pp. 193–215, 1959.

[28] B. C. Geiger and T. Koch, "On the information dimension of stochastic processes," IEEE Trans. Inf. Theory, vol. 65, no. 10, pp. 6496–6518, Oct. 2019.

[29] Y. Wu, S. Shamai (Shitz), and S. Verdú, "Information dimension and the degrees of freedom of the interference channel," IEEE Trans. Inf. Theory, vol. 61, no. 1, pp. 256–279, Jan. 2015.

[30] Y. Polyanskiy and Y. Wu, Information Theory: From Coding to Learning. Cambridge, U.K.: Cambridge University Press, 2025.

[31] R. A. Horn and C. R. Johnson, Matrix Analysis, 2nd ed. Cambridge, U.K.: Cambridge University Press, 2013.

[32] A. Eremenko and A. Gabrielov, "Degrees of real Wronski maps," Discrete & Computational Geometry, vol. 28, pp. 331–347, 2002.

[33] D. Kravvarritis and M. Mitrouli, "Compound matrices: Properties, numerical issues and analytical computations," Numerical Algorithms, vol. 50, pp. 155–177, 2009.

[34] A. Pizzo, T. L. Marzetta, and L. Sanguinetti, "Spatially-stationary model for holographic MIMO small-scale fading," IEEE J. Sel. Areas Commun., vol. 38, no. 9, pp. 1964–1979, Sep. 2020.

[35] Y. Cui, F. Liu, X. Jing, and J. Mu, "Integrating sensing and communications for ubiquitous IoT: Applications, trends, and challenges," IEEE Netw., vol. 35, no. 5, pp. 158–167, Sep. 2021.

[36] Y. Xiong, F. Liu, Y. Cui, W. Yuan, T. X. Han, and G. Caire, "On the fundamental tradeoff of integrated sensing and communications under Gaussian channels," IEEE Trans. Inf. Theory, vol. 69, no. 9, pp. 5723–5751, Sep. 2023.

[37] Z.-J. Wang, X. Wang, and G. Caire, "On Pareto-optimal estimation-information performance limits of MIMO integrated sensing and communications systems," IEEE Trans. Inf. Theory, pp. 1–1, 2026.

[38] H. Yang, K. Wan, and G. Caire, "Noncoherent ISAC over block-fading channels: Asymptotic performance analysis," arXiv preprint, 2026. [Online]. Available: https://arxiv.org/abs/2606.14400

[39] J. M. Lee, Introduction to Smooth Manifolds, 2nd ed., ser. Graduate Texts in Mathematics. New York, NY, USA: Springer, 2013, vol. 218.

[40] S. G. Krantz and H. R. Parks, A Primer of Real Analytic Functions, 2nd ed. Boston, MA, USA: Birkhäuser, 2002.

[41] F. L. Nazarov, "Local estimates for exponential polynomials and their applications to inequalities of the uncertainty principle type," St. Petersburg Mathematical Journal, vol. 5, no. 4, pp. 663–717, 1994.

[42] Y. Wu, "Shannon theory for compressed sensing," Ph.D. dissertation, Department of Electrical Engineering, Princeton University, Princeton, NJ, USA, Sep. 2011. [Online]. Available: https://www.stat.yale.edu/~yw562/reprints/wu.thesis.pdf

## 附录 A—H：证明的结构化译文

以下按原文附录顺序给出各附录所证结果、证明思路与关键公式。鉴于原文附录共约 24 页、以逐式推导为主，本页对附录采用**结构化译文**（保留全部引理/命题/定理编号与证明要点，不逐式全文翻译），此为与"全文"口径的已知差异，见页尾状态段。

### 附录 A：信息维数相关结果

**A-A 引理 1 的证明。** 令 $\mathbf z=f(\theta,u)\in\mathbb R^n$。由 (A1)—(A2)，常秩定理与第二可数性 [39, Thm. 4.12] 给出概率 1 正则集的一个可数开覆盖 $\{G_j\}_{j\geq1}$。在细化并收缩图册后，每片具有正规形

$$
\psi_j\circ f\circ\phi_j^{-1}(s,w)=(s,\mathbf 0_{n-r}),\qquad s\in D_j\subset\mathbb R^r,
$$

其中 $D_j$ 有界，$\iota_j(s)=\psi_j^{-1}(s,\mathbf 0_{n-r})$ 在 $D_j$ 上双 Lipschitz。用 $E_1=G_1$、$E_j=G_j\setminus\bigcup_{i<j}G_i$ 把覆盖互斥化，并丢弃零测块。在每个非零测块上，由 (A1)，$\phi_j(\theta,u)$ 的条件分布绝对连续，故其前 $r$ 个坐标 $s_j$ 绝对连续且有界，且 $z=\iota_j(s_j)$。由绝对连续性与信息维数在双 Lipschitz 映射下的不变性 [10]、[27]，得 $d_I(z\mid J=j)=r$；当 $r=0$ 时映射在各正规形图册上为常值，结论同样成立。

为在可数多片图册上控制总信息维数，取 $M\geq1$ 并定义有限标签 $J_M=J$（$J\leq M$）、$0$（$J>M$）。由 (A3)，$z$ 的无条件分布与每个非零测条件分布都有有限二阶矩，从而其整数部分熵有限 [10, Remark 2 and Lemma 11]，于是 $H(\langle\mathbf z\rangle_m\mid J_M)\leq H(\langle\mathbf z\rangle_m)\leq H(J_M)+H(\langle\mathbf z\rangle_m\mid J_M)$。对非零测尾事件有 $H(\langle\mathbf z\rangle_m\mid J>M)\leq H(\lfloor\mathbf z\rfloor\mid J>M)+n\log(m+1)$，故 $0\leq\underline d_I(\mathbf z\mid J>M)\leq\overline d_I(\mathbf z\mid J>M)\leq n$。展开 $H(\langle\mathbf z\rangle_m\mid J_M)$ 并除以 $\log m$ 得

$$
\frac{H(\langle\mathbf z\rangle_m\mid J_M)}{\log m}=\sum_{j=1}^{M}\mathbb P\{J=j\}\frac{H(\langle\mathbf z\rangle_m\mid J=j)}{\log m}+\mathbb P\{J>M\}\frac{H(\langle\mathbf z\rangle_m\mid J>M)}{\log m},
$$

从而 $(1-\mathbb P\{J>M\})r\leq\underline d_I(\mathbf z\mid J_M)\leq\overline d_I(\mathbf z\mid J_M)\leq(1-\mathbb P\{J>M\})r+\mathbb P\{J>M\}n$。去掉对 $J_M$ 的条件在 $m\to\infty$ 时只带来可忽略的熵增，故同样有 $(1-\mathbb P\{J>M\})r\leq\underline d_I(\mathbf z)\leq\overline d_I(\mathbf z)\leq(1-\mathbb P\{J>M\})r+\mathbb P\{J>M\}n$；令 $M\to\infty$（$\mathbb P\{J>M\}\to0$）即得 $d_I(\mathbf z)=r$。对 $P_\theta$-几乎每个 $\theta$，由 (A1) 得 $P_{u\mid\theta=\theta}$ 绝对连续、由 (A2) 得其概率 1 开截面上秩恒为 $r_u$、由 (A3) 得有限条件二阶矩；对 $u\mapsto f(\theta,u)$ 重复同一图册论证即得 $d_I(\mathbf z\mid\theta)=r_u$。

**A-B 命题 1 的证明。** 先对噪声做白化并应用高斯最大熵界 [30, Thm. 2.8]，对 $\rho\geq e$ 得

$$
0\leq\frac{I(\mathbf z;\mathbf y_\rho\mid\theta=\theta)}{\log\rho}\leq\frac{n}{2}\frac{\log\left[1+\rho c\sum\mathcal M(\theta)\right]}{\log\rho}\leq\frac{n}{2}\left(1+\frac{\log\left[1+c\sum\mathcal M(\theta)\right]}{\log\rho}\right).\tag{53}
$$

该上界可积：由 Jensen 不等式与 (A3) 得 $\mathbb E\{\log[1+c\sum\mathcal M(\theta)]\}\leq\log[1+c\sum\mathbb E\{\|\mathbf z\|^2\}]<\infty$，故由控制收敛定理成立。随后依据引理 1 计算两个 Jacobian 秩，再按引理 2 的高 SNR 预对数公式相减。关键点在于：条件（A1）—（A3）在给定输入分布与 NULA–SV 先验下成立（引理 7），故 $r=2KT+K$、$r_u=4K$，代入即得（13）。

### 附录 B：Jacobian 秩与正则性

**B-A 引理 3 的证明。** 只需证明由 $[\mathbf A(u),\dot{\mathbf a}(u_k)]$ 的 $K+1$ 行构成的方子矩阵行列式是方向的复值实解析函数且不恒为零。对选定的互异频率取互异实数 $t_1,\ldots,t_m$ 与方向区间内点 $u_0$，Taylor 展开给出

$$
\det\left[e^{\mathrm j\lambda_n(u_0+\epsilon t_j)}\right]_{n,j=1}^{m}=e^{\mathrm ju_0\sum_n\lambda_n}(\mathrm j\epsilon)^{\frac{m(m-1)}{2}}\prod_{r=0}^{m-1}r!\prod_{n<\ell}(\lambda_\ell-\lambda_n)\prod_{i<j}(t_j-t_i)+O\left(\epsilon^{\frac{m(m-1)}{2}+1}\right).\tag{54}
$$

取 $m=K$ 即证某个普通子式不恒为零；由于该行列式关于方向实解析，它在几乎处处非零，故 $\mathbf A(u)$ 几乎处处满列秩。再取 $m=K+1$，把前 $K$ 列在 $u_0+\epsilon t_j$ 处取值、把 $u_0+\epsilon t_k$ 处的导数作为最后一列，其首项为

$$
e^{\mathrm ju_0\sum_n\lambda_n}\frac{\det\left[(\mathrm j\lambda_n)^r\right]_{n=1,r=0}^{m,m-1}\prod_{r=0}^{m-1}r!}{\det V^H}\epsilon^{\frac{m(m-1)}{2}-1}\tag{55}
$$

加高一阶余项。$V^H$ 的前 $K$ 列是 $(t_j^r)_{r=0}^{K}$，最后一列是 $(rt_k^{r-1})_{r=0}^{K}$，其首项为零；该 Hermite 求值矩阵非奇异——若次数不超过 $K$ 的多项式在所有 $K$ 个互异节点处为零且在 $t_k$ 处导数为零，则它至少有 $K+1$ 个根，从而恒为零。故（55）中两个行列式都非零。对充分小的非零 $\epsilon$，所取方向都落在 $I$ 内；每个子式的实解析平方模因此非平凡，其零集 Lebesgue 测度为零 [40]。所需子式有限多，其零集之并仍为零测集，证毕。

**B-B 引理 4 的证明。** 借助引理 3 的满秩性，在排除零增益与退化方向集后，关于 $(u_{\mathrm r},u_{\mathrm t},\alpha)$ 的实 Jacobian 可分解为接收/发射侧块与增益块，其秩为 $4K$。

**B-C 引理 5 与 B-D 引理 6 的证明。** 核心是"商维数"计数：当 $\mathbf S$ 未知时，$(u_{\mathrm t},\alpha,\mathbf S)$ 在观测下等价于 $2KT$ 维实对象，而三元组本身为 $2KT+3K$ 维，故存在 $3K$ 维不可辨识纤维，局部对应 AoD 与复增益；固定满行秩 $\mathbf S$ 后该模糊被消除，条件实秩降为 $4K$。

**B-E 推论 1 与 B-F 引理 7 的证明。** 由 (U1)—(U3)，零增益、方向碰撞与退化秩均属零测集，故正则集概率为 1；在其上联合映射与条件映射分别为 $C^1$ 且秩恒定（满足定义 2 的 (A2)）。引理 7 进一步验证 (A1)（高斯输入在 $\mathbb C^{K\times T}$ 上绝对连续）与 (A3)（有限二阶矩）。

### 附录 C：可达性结果的证明

**C-A 命题 2 的证明。** 由引理 7 与推论 1，所选高斯输入满足定义 2；再由引理 1 与命题 1，其信息维数之差为 $(2KT+K-4K)/(2T)$，即（15）。

**C-B 命题 3 的证明。** 对 $\mathbf X=\mathbf e_1\mathbf s^T$，接收端取单个参考天线后，观测化为经典标量非相干块衰落，其可达预对数为 $1-1/T$ [12]；把标量结果推广到所有 $K$ 即得所述下界。

### 附录 D：逆定理的基础

**D-A 命题 4 的证明。** 由逐路径 genie 的构造可知 $(\mathbf X,\mathbf H,\mathbf Y_\rho)$ 与 $(\mathbf X,\mathbf G_{\mathrm{path}},\mathbf Z_\rho)$ 之间存在随机核，故 $P_{\mathbf Y_\rho\mid\mathbf X}=P_{\mathbf Z_\rho\mid\mathbf X}Q_\rho$；由数据处理不等式得（18）。

**D-B 命题 5 的证明。** 对 $K=1$ 额外揭示完整几何后，投影到接收导向向量为充分统计量；由此把容量预对数界为经典标量块衰落信道的 $1-1/T$，即（19）。

### 附录 E：条件输出熵下界的证明

**E-A 命题 6 的证明。** 用 Wronskian 论证：$\mathbf v_X$ 的成对 Wronskian $\mathbf w_X$ 的系数范数一致地控制 $\sigma_1(\mathbf X)\sigma_2(\mathbf X)$ 的下界，其中常数只依赖固定发射位置与 $(N_t,T)$。

**E-B 引理 9 的证明。** 通过把参数分辨单元 $\mathcal P_\epsilon(\alpha,u)$ 投影到 AoD 方向并按（26）—（28）的 Wronskian 范数估计，得到原像体积界（30）；关键指数来自复增益的二维截面与 AoD 的可分辨长度 $\min\{1,\epsilon/(|\alpha|\delta)\}$。

**E-C 引理 13（高斯量化下界）。** 设 $\mathbf x\in\mathbb R^n$ 与 $\mathbf n\sim\mathcal N(0,\mathbf I_n)$ 独立，$H(\lfloor\mathbf x\rfloor)<\infty$；则对 $m=\lfloor\sqrt\rho\rfloor$ 有 $I(\mathbf x;m\mathbf x+\mathbf n)\geq H(\langle\mathbf x\rangle_m)-C_n$，其中 $C_n$ 只依赖 $n$。证明借助高斯噪声下的格点量化与子引理 1（指数多项式的一致下界），并处理无界支撑情形。

**E-D 命题 7 的证明。** 把无噪单路径输出按分辨单元划分，结合引理 9 的原像体积界、例外事件控制与引理 13 的高斯量化下界，得条件输出熵下界（31）及其显式一致余项 $R_{\mathrm{sp}}(\rho)$。

### 附录 F：输出熵上界的证明

**F-A 引理 10 的证明。** 用秩 1 分解 $\mathbf Q=\mathbf u\mathbf v^H$ 覆盖 $\mathcal R_1^{\mathrm{out}}(R)$（各 $2(K+T-1)$ 维），再用 $\mathcal R_1^{\mathrm{out}}(R)$ 周围半径 $r$ 的环境管（各 $2(KT-K-T+1)$ 维）覆盖 $\mathcal T_1(R,r)$，由两者乘积得覆盖数界（38）。

**F-B 引理 11 的证明。** 由引理 10 与覆盖—熵界（37），取 $\epsilon=\rho^{-1/2}$、$r=\sqrt{\max\{1,\min\{N_t,T\}-1\}}\,\delta$，即得 $h(\mathbf Z_\rho)$ 的上界（39）；余项 $R_{\mathrm{tube}}(\rho)=C(1+\log\log\rho)$ 来自覆盖数中 $\log\log\rho$ 项与尾部处理。证明中用到 $v(1)\leq\left(2m(m-1)\|c\|\right)/(2\pi)$ 与 $v(m)\leq(2m-1)\|c\|$ 等上界，以及 $\frac{m-1}{2}\log(1+\rho\sigma_2(\mathbf X)^2)+O(1)$ 与 $\frac{m-d_1}{2}\log(1+\rho\delta^2)+C(1+\log\log\rho)$ 两式的比较（对应（93a）、（94））。

### 附录 G：DoF 定理的证明

**G-A 定理 2 的证明。** 按图 4 的二维网格（$s=\log(\rho\sigma_1^2)$、$q=\log(1+\rho\sigma_2^2)$，单元边长 $w=\Delta\log\rho$）逐单元应用（22a）与（22b）；低 SNR 单元的互信息仅为 $O(\Delta\log\rho)$，其余单元由（23）给出不超过 $D^{\star}$ 的界，取 $\Delta\to0$ 并合并即得（40）。

**G-B 引理 12 的证明。** 在 $\|\mathbf X\|_F^2=\rho^{\epsilon}$ 处拆分：典型事件上重缩放使条件输入落入单位峰值球并把有效 SNR 变为 $\rho^{1+\epsilon}$，高功率尾部用 Markov 不等式控制；令 $\epsilon\to0$ 即得（41）。

**G-C 定理 1 的证明。** 由命题 3（$K=1$）与命题 2、定理 2、引理 12（$K\geq2$）的上、下界匹配，即得（8）。

### 附录 H：一般阵列结构结果的证明

**H-A 命题 8 的证明。** 对一般可分模型（42），在 (G1)—(G3) 下计算联合映射的实秩 $r=2KT+d_R$ 与条件映射的实秩 $r_u=d_H(\mathbf B)$，再由命题 1 得预对数（45）。其中 $d_R$ 为接收导向矩阵列空间的实 Jacobian 秩（对应 Grassmann 流形上的维数 [12]）。

**H-B 命题 9 的证明。** 在 (R1)—(R3) 下证明 $d_R=Kp_r$、$d_H(\mathbf B)=K(p_r+q_B+2)$：接收侧参数变化全部可见于条件输出（因 $\mathbf Q_r$ 投影保持全部 $p_r$ 个实方向），发射侧变化经投影后仅剩 $q_B$ 个实维度可分辨，其余被复增益吸收；代入（45）即得（46）。

**H-C 验证例子。** 对 UPA 天线选择，由（47）得 $L=1$ 时 $q_B=0$、共线选择（$L\geq2$）时 $q_B=1$、非共线三阵元时 $q_B=2$；对矩形孔径的 Fourier 模式选择，由（48）—（49）得相应 $q_B\in\{0,1,2\}$。两例中 (R1)—(R2) 均被验证，进而由命题 9 保证 (G2) 成立。

**本页范围与校对状态：** 本页依据 arXiv:2609.07926v2（cs.IT，2026-09-11；页脚 DRAFT, September 14, 2026；48 页）完成中文全文翻译：摘要、索引词、记号约定、第 I—VI 节（含 I-A/I-B、II 与假设 1 及定理 1、III-A—III-E、IV-A—IV-F、V-A—V-C、VI）、图 1—4 中文图注、参考文献 [1]—[42] 英文原条目（按原编号）均按原文结构录入；编号公式 (1)—(55) 按原文保留（含（9a）—（10b）分式、（20a）—（20b）、（22a）—（22b）、（44a）—（44b）等，附录另含（54）（55）显示式；附录 F 中对（93a）（94）等编号仅作文字引用，未逐式排为显示式）。**已知口径差异：** 原文附录 A—H 共约 24 页、以逐式推导为主，本页对附录采用**结构化译文**（保留全部引理/命题/定理编号、证明思路与关键公式，未逐式全文翻译），此为与"全文"要求的已知差异，已在此明确披露。**原文疑点已就地加注：** ①原文抽取文本未含作者单位行，本页未凭推测补写；②附录标题在抽取文本中被并入"APPENDIX X"行，本页以内容描述代替字面标题；③原文正文引用附录 G-C（定理 1 的证明），而附录 G 的小节序为 A（定理 2）、B（引理 12）、C（定理 1），本页按原编号保留。图 1—4 的图注按原文第 7、15、17、18 页内容转录。**逐句逐式终校未做**；图内示意图未作数字化读取；参考文献未联网核验 DOI、页码与在线链接。原文无表格。本页不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
