---
layout: page
title: "新型几何感知 GPR 低能耗、低开销信道估计方案｜完整中文译文"
permalink: /papers/translations/2026-10-12-geometry-gpr-full-zh/
math: true
toc: true
---

{% raw %}
[← 论文库](/papers/) · [本篇推荐记录](/papers/items/f21a0dbb22c712a9/) · [原文（芬兰奥卢大学机构库）](https://oulurepo.oulu.fi/bitstream/handle/10024/65127/nbnfioulu-202609075987.pdf?sequence=1&isAllowed=y)

# 一种新型基于几何感知高斯过程回归的节能低开销信道估计方案

**原题：** A Novel Geometry-Aware GPR-Based Energy-Efficient and Low-Overhead Channel Estimation Scheme  
**作者：** Syed Luqman Shah（IEEE 研究生会员）、Nurul Huda Mahmood（IEEE 会员）  
**机构：** 芬兰奥卢大学无线通信中心（Centre for Wireless Communications, University of Oulu）。  
**基金：** 芬兰研究委员会，项目 359850（6G-ConCoRSe）及 369116（6G Flagship）。  
**底本：** 用户提供的 13 页机构库 PDF；与 arXiv:2512.22578 对应。公式号、算法序号、表格及参考文献序号按原文保留。

> 中文全文按原文顺序涵盖摘要、I—VII 节、算法 1—2、表 I—III、附录 A—B、参考文献 [1]—[37] 与两位作者简介。原文图 1—9 在文中提供定位链接，避免上传大文件。

## 摘要

在导频资源和训练能量预算受到严格限制的情况下准确获取信道状态信息（CSI），是下一代无线网络的一项关键要求。本文在训练期间仅激活部分发射天线，以降低导频开销和训练能量。这产生了稀疏且含噪的信道系数观测，使 CSI 获取成为一个高度欠定的贝叶斯逆问题。为解决该问题，我们在收发天线联合索引格点上，将无线信道建模为正规复高斯过程（Proper Complex Gaussian Process，GP），并设计高斯过程回归（Gaussian Process Regression，GPR）框架，根据已观测天线对的信息外推未观测天线对，从而重建完整 CSI。

高斯过程先验由新提出的**基于阵列几何的谱混合协方差函数**（Geometry-Based Spectral-Mixture Covariance Function，GB-SMCF）指定。该核函数为 Hermitian 正半定。不同于标准距离核，GB-SMCF 同时捕获平滑的空间衰减和多径传播引起的振荡相关性。通过最大化稀疏导频观测的边际似然，每个相干块都可在线学习核超参数，无需离线训练，也无需预先知道信道协方差。数值结果表明，该方法相对于所考虑的基线，最多可降低 75% 导频开销、93.75% 总训练能量，且取得更低的归一化均方误差；在低到中等 SNR 区间还具有更高的频谱效率。

**索引词：** 信道估计、协方差建模、复高斯过程、谱混合核、减少导频开销、节能训练。

## I. 引言

多输入多输出（MIMO）是第六代无线系统的关键技术，可提供空间复用和波束成形增益 [1,2]。但要实现这些增益，需要准确获取 CSI [3]。在紧凑室内小区等局部 6G 部署中，这一要求尤为困难 [4,5]：丰富散射、大阵列孔径及波前曲率会使阵列上的空间相关性呈现结构化特征 [6]。测量与电磁建模表明，这些相关性受到阵列几何结构、散射簇与角度分布的共同支配 [7,8]。在均匀矩形阵列（URA）中，这通常表现为缓慢变化的空间包络，叠加与主要到达角和离开角对应的振荡分量 [8]。这种结构为基于协方差的信道估计提供了天然基础 [3,9]。

GPR 是利用这种相关性的贝叶斯机制：其协方差函数（核）编码用于后验预测的二阶统计结构 [10]。当核反映阵列几何和传播物理时，GPR 可以从稀疏导频观测恢复未观测信道系数，而不必依赖显式稀疏性、带限性或固定协方差假设 [11]。据此，本文回顾导频辅助的 CSI 获取方法，并指出尚未解决的研究问题。

### A. 相关工作

导频辅助训练是 CSI 获取的标准方法：将已知参考序列送入信道，根据接收观测推断传播响应 [12]。使用正交训练时，最小二乘（LS）和最小均方误差（MMSE）估计器需要不小于发射天线数的导频长度 [13]。随着天线数量增长，这一要求带来不利的资源扩展性 [11,14]。

压缩感知（CS）方法通过利用角度或时延域稀疏性来降低导频开销 [15]。正交匹配追踪（OMP）、近似消息传递（AMP）等字典算法，在少数对齐网格的镜面路径占主导的环境中，可以用更少导频恢复信道 [15,16]。但连续角度扩展、近场传播及丰富散射可能违背离散稀疏模型，造成基不匹配、功率泄漏和重建偏差 [17]。矩阵补全方法则利用假定的低秩结构，求解核范数松弛问题来补全缺失矩阵元素 [18]。当阵列具有全局相干的主要空间结构时，此类方法有效；局部变化和孔径相关传播效应却可能削弱低秩假设 [6]。

GP 模型将统计正则化与协方差先验建模结合，提供原则明确的贝叶斯替代方案 [3]。各类 GP／高斯先验方案主要区别在于如何编码信道结构。基于距离的 GPR 将信道建模为高斯随机场，使用平方指数（SqExp）或 Matérn 核，以减少导频方式从部分观测预测完整 CSI [11,14]。物理信息 GP 则从电磁规律导出核函数，将角度扩展和近场效应纳入 MMSE 估计与信道预测 [7,9]。除核式 GP 以外，条件高斯先验已用于半盲估计，利用期望最大化与 MMSE 类推断共同开发导频和数据载荷观测 [3,19]。稀疏贝叶斯学习的分层及模式耦合高斯先验，可施加结构化稀疏性、共同支撑集，并提升对异常值和硬件扰动的鲁棒性 [20]—[22]。学习式贝叶斯估计器还通过高斯混合或生成先验，在波束空间和量化 MIMO 估计中逼近非高斯信道分布 [23,24]。GP 也被用于局部 6G 网络的干扰预测 [4]。

### B. 研究动机与贡献

上述研究仍存在四项局限。第一，现有观测模型大多针对全阵列导频探测、半盲数据辅助接收、波束空间投影、量化测量或硬件非理想观测，而不是根据稀疏天线索引导频样本，重建未接受探测的信道系数。第二，许多方法在变换域或潜在域而非实际天线索引域编码结构先验：稀疏贝叶斯学习利用角度域的分层／模式耦合先验，学习式估计器依赖适合半盲、波束空间或量化模型的混合或潜在先验。第三，虽然从麦克斯韦方程和角度分布推得的电磁核已改善协方差感知估计与预测 [7,9]，但尚未用于降低训练量的 CSI 补全。第四，所需先验信息通常从外部获取：MMSE 假设协方差已知或独立估计，学习式贝叶斯方法则往往依赖离线数据集或预训练生成模型。由稀疏天线索引观测进行低导频 CSI 补全，仍未被充分研究。

为解决这些问题，本文将**部分发射天线激活训练**，与收发天线联合索引格点上的**在线学习、几何感知、正规复 GP 先验**结合，在降低导频和能量开销的同时改善估计精度和频谱效率。具体贡献如下。

第一，仅激活部分发射天线发送正交导频，同时所有接收天线保持接收。观测是对信道矩阵列的带噪子采样，从而形成欠定线性逆问题，并以贝叶斯重建方式求解。第二，在收发天线联合索引上建立正规复 GP，以概率插值及外推获得未观测信道元素。第三，构建 GB-SMCF，并证明其为 Hermitian 正半定核；采用具有物理意义的谱混合参数，在收发两侧分别编码多个角度分量、平滑空间包络和振荡行为。第四，在每个相干块中最大化当前导频观测的边际似然，在线学习全部超参数，并推导闭式梯度以加速有界优化，无需离线训练或额外信道数据集；最终得到完整信道矩阵的后验均值和协方差。

这些贡献确立了一种新方法：建立阵列几何感知的结构化复信道协方差模型，从稀疏导频中学习该模型，再执行具有统计依据的 CSI 补全。它以当前少量导频学得、物理可解释的阵列域先验，代替传统 MMSE 的“已知协方差”假设与 CS 的“已知字典”假设。

全文结构如下：第 II 节建立系统模型及欠定问题；第 III 节提出 GB-SMCF；第 IV 节给出 GPR 完整框架；第 V 节分析优化及复杂度；第 VI 节仿真评估；第 VII 节总结。符号约定中，粗体大写、小写分别为矩阵和向量，花体为集合；\(\mathbb R,\mathbb C,\mathbb Z\) 为实数、复数、整数集合；\(\mathbf I_n\) 为单位阵，\(\mathbf e_i\) 为规范基向量；\(\operatorname{vec}\) 为向量化；上标 \(T,H\) 表示转置和 Hermitian 转置；\(\Re,\Im\) 分别取实部和虚部；\(j\) 为虚数单位；\(\|\cdot\|_F\) 为 Frobenius 范数；\(\operatorname{tr},\det,\operatorname{diag},\operatorname{rank}\) 分别为迹、行列式、对角提取与秩；\(\otimes,\circ\) 为 Kronecker 与 Hadamard 积；\(\mathbf A\succeq0\) 表示正半定；\(|\mathcal A|\) 为集合基数；\(\mathcal{CN},\mathcal N\) 为复圆对称、实高斯分布；\(\mathbb E\) 表示期望。

## II. 系统模型与问题定义

考虑图 1 所示窄带点对点 MIMO 系统。发射机和接收机分别有 \(N_t,N_r\) 根天线。为了降低导频开销和训练能量，训练时仅激活 \(n_t\le N_t\) 根发射天线。将已知活动天线索引集合记为 \(\Omega_t=\{a_1,\ldots,a_{n_t}\}\subset\{1,\ldots,N_t\}\)。只打开这些天线对应的射频链，其余发射天线停用 [11,14]。定义选择矩阵

\[
\mathbf F=[\mathbf e_{a_1},\ldots,\mathbf e_{a_{n_t}}]\in\{0,1\}^{N_t\times n_t},\quad \mathbf F^H\mathbf F=\mathbf I_{n_t}.
\]

该矩阵将活动链上的 \(n_t\) 维导频向量映射到完整发射阵列，在停用天线端口填零。因此，对于 \(\mathbf s\in\mathbb C^{n_t}\)，整个阵列的发射向量为 \(\mathbf x=\mathbf F\mathbf s\in\mathbb C^{N_t}\)。

### A. 训练信号模型

设相干块内通过 \(T\) 次信道使用发送 \(\mathbf S\in\mathbb C^{n_t\times T}\)，其第 \(t\) 列为 \(\mathbf s_t\)。活动天线的每符号导频功率固定为 \(P_A>0\)，故训练矩阵为 \(\mathbf X_{\rm TX}=\sqrt{P_A}\mathbf F\mathbf S\)。采用恒模行正交导频：

\[
\mathbf S\mathbf S^H=T\mathbf I_{n_t},\quad |[\mathbf S]_{\ell,t}|=1.
\]

单个相干块的总训练能量因此为 \(n_tTP_A\)。

未知窄带信道矩阵为 \(\mathbf H\in\mathbb C^{N_r\times N_t}\)，噪声矩阵 \(\mathbf N\in\mathbb C^{N_r\times T}\) 的元素独立同分布为 \(\mathcal{CN}(0,\sigma_n^2)\)。接收导频为

\[
\mathbf Y_{\rm RX}=\mathbf H\mathbf X_{\rm TX}+\mathbf N
=\sqrt{P_A}\mathbf H\mathbf F\mathbf S+\mathbf N.
\]

因此它仅依赖 \(\mathbf H\) 在所选天线对应的列 \(\mathbf H\mathbf F\)。与 \(\mathbf S^H\) 相关并除以 \(T\)，可得

\[
\widetilde{\mathbf Y}_{\rm RX}
=\frac1T\mathbf Y_{\rm RX}\mathbf S^H
=\sqrt{P_A}\mathbf H\mathbf F+\widetilde{\mathbf N},
\quad \widetilde{\mathbf N}=\frac1T\mathbf N\mathbf S^H.
\]

正交条件保证活动导频之间无干扰，且 \(\operatorname{vec}(\widetilde{\mathbf N})\sim\mathcal{CN}(0,\frac{\sigma_n^2}{T}\mathbf I_{N_rn_t})\)。令 \(\mathbf Z=\widetilde{\mathbf Y}_{\rm RX}/\sqrt{P_A}\)，得到

\[
\boxed{\mathbf Z=\mathbf H\mathbf F+\mathbf W,\qquad
\operatorname{vec}(\mathbf W)\sim\mathcal{CN}\bigl(\mathbf0,\frac{\sigma_n^2}{TP_A}\mathbf I_{N_rn_t}\bigr).}\tag{1}
\]

### B. 问题定义

接收机观测到的是所选信道列的带噪版本 \(\mathbf Z\in\mathbb C^{N_r\times n_t}\)。令 \(\mathbf z=\operatorname{vec}(\mathbf Z)\)、\(\mathbf h=\operatorname{vec}(\mathbf H)\)、\(\mathbf w=\operatorname{vec}(\mathbf W)\)，以及选择矩阵 \(\boldsymbol\Phi=\mathbf F^T\otimes\mathbf I_{N_r}\in\{0,1\}^{N_rn_t\times N_rN_t}\)。利用向量化恒等式，观测模型为

\[
\boxed{\mathbf z=\boldsymbol\Phi\mathbf h+\mathbf w\in\mathbb C^{N_rn_t}.}\tag{2}
\]

\(\boldsymbol\Phi\) 正好提取发射天线索引属于 \(\Omega_t\) 的信道系数。观测数为 \(N_rn_t\)，未知数为 \(N_rN_t\)，故当 \(n_t\ll N_t\) 时，这是高度欠定的问题。

**目标：** 根据式（2）中的 \(\mathbf z\)，重建 \(\mathbf H\in\mathbb C^{N_r\times N_t}\)。由于 \(\mathbf z\) 只含所选列的噪声观测，不能独立恢复每个未观测系数；必须利用收发天线联合索引格点上联结已观测与未观测元素的统计模型。下文通过 GB-SMCF 指定正规复 GP 的协方差来实现这种耦合。

**图 1：** 所提训练架构示意图。部分发射天线被激活发送导频，所有接收天线同时接收。[原图第 3 页](https://arxiv.org/pdf/2512.22578#page=3)

## III. 所提出的几何感知核

有限导频和能量预算下的精确 CSI 获取，需要能描述无线信道空间相关结构的先验 [11,14]。经典 Kronecker 模型 [25] 因简洁而广泛使用，但其收、发相关结构可分离的假设，在近场、双极化阵列及丰富散射场景下可能不成立 [7]；实测室内场景中，该模型还可能低估容量、错误描述特征值分布 [26]。固定 SqExp 或 Matérn 核虽然能描述各向同性或各向异性衰减，却不能表达多径相干相加和抵消产生的振荡相关性 [14]。因此，本文提出 GB-SMCF。

### A. 信道的正规复 GP 建模

在收发天线联合索引格点 \(\mathcal G=\{(i,j):1\le i\le N_r,1\le j\le N_t\}\) 上定义复信道场 \(h:\mathcal G\to\mathbb C\)，并令 \(h(i,j)=H_{i,j}\)。于是每个相干块的信道矩阵就是该场在 \(\mathcal G\) 上的取值集合。为它引入均值为零的正规复 GP 先验：

\[
h\sim\mathcal{GP}_{\mathbb C}(0,k_{\rm GB}(\cdot,\cdot)).
\]

协方差核 \(k_{\rm GB}((i,j),(i',j'))\) 描述两个天线对对应信道系数的统计耦合。因此，任何有限的信道系数向量均服从 \(\mathbf h\sim\mathcal{CN}(\mathbf0,\mathbf K_{\rm GB})\)。在该先验下对观测条件化，可解析计算未观测系数的高斯后验 [7,10]。

为了后续推断，将有限维复先验精确变换到实坐标。对 \(\mathbf h\sim\mathcal{CN}(\mathbf0,\mathbf K)\)，定义 \(\mathbf f=[\Re\{\mathbf h\}^T,\Im\{\mathbf h\}^T]^T\)，则其协方差为

\[
\mathcal T(\mathbf K)=\frac12
\begin{bmatrix}
\Re\{\mathbf K\}&-\Im\{\mathbf K\}\\
\Im\{\mathbf K\}&\Re\{\mathbf K\}
\end{bmatrix}. \tag{3}
\]

对于两个索引集合之间的矩形互协方差也执行同一变换。于是 \(\mathcal T\) 提供正规复协方差的精确实坐标表示。该表示仅用于第 IV 节的后验计算，原始先验仍直接定义在复数域中。

### B. GB-SMCF 的构造

首先引入 URA 的格点几何和索引差分，再在收发联合格点上定义可分离的复谱混合核 [27]。

**1）阵列格点与索引差分。** 接收和发射 URA 分别包含 \(N_r=N_y^{(r)}N_z^{(r)}\) 和 \(N_t=N_y^{(t)}N_z^{(t)}\) 个阵元。通过阵元索引与格点坐标间的一一映射，定义中心化坐标

\[
\mathbf r_i=(y_i^{(r)},z_i^{(r)})\in\mathbb Z^2,\qquad
\mathbf t_j=(y_j^{(t)},z_j^{(t)})\in\mathbb Z^2. \tag{4}
\]

对于收发阵元对，分别定义 \(\Delta\mathbf r=\mathbf r_i-\mathbf r_{i'}=(\Delta r_y,\Delta r_z)\) 及 \(\Delta\mathbf t=\mathbf t_j-\mathbf t_{j'}=(\Delta t_y,\Delta t_z)\)。在格点平稳性假设下，协方差只依赖相对位移 \((\Delta\mathbf r,\Delta\mathbf t)\)，不依赖绝对位置，与 URA 产生的平移不变二阶结构一致。

**2）阵列索引域上的可分离复谱混合核。** 受平稳核的谱表征启发 [27]，分别用复谱混合协方差描述收发两端的相关性：

\[
\begin{aligned}
k_r(i,i')={}&\sum_{q=1}^{Q_r}\pi_q^{(r)}
\exp[-2\pi^2(v_{q,y}^{(r)}\Delta r_y^2+v_{q,z}^{(r)}\Delta r_z^2)]\\
&\times\exp[j2\pi(\mu_{q,y}^{(r)}\Delta r_y+\mu_{q,z}^{(r)}\Delta r_z)] .
\end{aligned}\tag{5}
\]

\[
\begin{aligned}
k_t(j,j')={}&\sum_{p=1}^{Q_t}\pi_p^{(t)}
\exp[-2\pi^2(v_{p,y}^{(t)}\Delta t_y^2+v_{p,z}^{(t)}\Delta t_z^2)]\\
&\times\exp[j2\pi(\mu_{p,y}^{(t)}\Delta t_y+\mu_{p,z}^{(t)}\Delta t_z)] .
\end{aligned}\tag{6}
\]

联合核定义为

\[
\boxed{k_{\rm GB}((i,j),(i',j'))=\alpha\,k_r(i,i')k_t(j,j'),\quad \alpha>0.}\tag{7}
\]

混合权重满足 \(\pi_q^{(r)},\pi_p^{(t)}\ge0\)、\(\sum_q\pi_q^{(r)}=1\)、\(\sum_p\pi_p^{(t)}=1\)；各谱方差 \(v_{q,\xi}^{(r)},v_{p,\xi}^{(t)}>0\)（\(\xi\in\{y,z\}\)）。归一化使 \(k_r(i,i)=k_t(j,j)=1\)，进而 \(k_{\rm GB}((i,j),(i,j))=\alpha\)。因此 \(\alpha\) 单独决定先验边际方差，混合权重只控制不同谱分量的相对权重。该可分离结构保留收发关联的计算便利性，同时允许两侧均表示多个振荡模式和平滑空间衰减。

**引理 1（Hermitian 正半定性与格点平稳性）。** 对归一化非负权重、正谱方差和 \(\alpha>0\)，式（5）—（7）定义的 \(k_{\rm GB}\) 在 \(\mathcal G\times\mathcal G\) 上为 Hermitian 正半定核，仅依赖格点差分。对于任意有限有序集合 \(\mathcal A\subset\mathcal G\)，实增广协方差 \(\mathcal T(\mathbf K_{\rm GB}(\mathcal A,\mathcal A))\) 仍为正半定，加上各向同性观测噪声协方差也保留此性质。证明见附录 A。

**3）超参数解释。** 两侧的每个混合分量都代表 URA 格点上的空间谱成分。混合权重 \(\pi\) 分配相对谱质量；归一化空间频率 \(\mu\) 决定各格点轴上的振荡；谱方差 \(v\) 控制随格点间距增大的相关衰减速度，因而对应相关长度与有效角度扩展；\(\alpha\) 控制整体协方差幅度，等于各信道系数的边际先验方差。

### C. GB-SMCF 的性质

GB-SMCF 在离散天线索引域定义与 URA 结构一致的正规复平稳核。按构造它仅依赖格点差分，且因 \(k_{\rm GB}=\alpha k_rk_t\) 保留 Kronecker 类收发可分离结构。两个二维复谱混合核能够通过不同谱峰位置和宽度表示多个角度分量 [27]。相比仅依赖距离的 SqExp 或 Matérn 核，它同时编码振荡与空间衰减；每侧两个坐标轴上的谱方差可以不同，因此能表示方位角—俯仰角各向异性。

模型直接在复数域定义，实部与虚部的耦合由 Hermitian 协方差产生，而不是事后构造独立输出协方差。实坐标推断与正规复先验下的条件化在代数上等价。由于核在全格点上定义，其预测可自然从已观测索引扩展至格点内未观测天线对。超参数通过当前稀疏导频的边际似然直接学习，无需离线训练。引理 1 保证正半定性。每个相干块重新估计超参数，能够适应块间统计变化，但仍假定同一块内平稳；孔径上的显式空间非平稳性超出当前模型范围，未来可扩展为非平稳核 [28]。

## IV. 所提框架

将第 II 节的观测模型与 GB-SMCF 先验结合，从稀疏噪声导频重建完整 CSI，分为三步：将观测整理为已观测和未观测天线索引集合；最大化边际似然学习核超参数；根据观测对学得的先验进行条件化，获得后验分布和 CSI 估计。

### A. 观测模型

激活 \(\Omega_t\) 后，已观测索引集合及其元素数为

\[
\mathcal X=\{x_p\}_{p=1}^{P}=\{(i,a_\ell):1\le i\le N_r,\ 1\le\ell\le n_t\}\subset\mathcal G,\quad P=N_rn_t. \tag{8}
\]

未观测集合为

\[
\mathcal X_\star=\mathcal G\setminus\mathcal X,\quad |\mathcal X_\star|=P_\star. \tag{9}
\]

每个观测系数满足

\[
z_p=z(i,a_\ell)=h(i,a_\ell)+w_p,\quad w_p\sim\mathcal{CN}(0,\sigma_{\rm obs}^2), \tag{10}
\]

其中各 \(w_p\) 独立，\(\sigma_{\rm obs}^2=\sigma_n^2/(TP_A)\)。实增广向量形式为

\[
\mathbf z_{\rm aug}=[\Re\{\mathbf z\}^T,\Im\{\mathbf z\}^T]^T
=\mathbf f_{\mathcal X}+\mathbf n,\quad
\mathbf n\sim\mathcal N(\mathbf0,\tfrac{\sigma_{\rm obs}^2}{2}\mathbf I_{2P}).\tag{11}
\]

其中 \(\mathbf h_{\mathcal X}=[h(x_1),\ldots,h(x_P)]^T\in\mathbb C^P\)，其增广形式为 \(\mathbf f_{\mathcal X}\in\mathbb R^{2P}\)；对 \(\mathcal X_\star=\{x_{\star,q}\}_{q=1}^{P_\star}\)，类似地定义 \(\mathbf h_{\mathcal X_\star}\) 和 \(\mathbf f_{\mathcal X_\star}\)。于是 \(\mathcal X\) 上的实虚部构成 GPR 的训练数据，\(\mathcal X_\star\) 上的实虚部是预测目标。

**图 2：** 所提 GB-SMCF-GPR 在正规复 GP 先验下，利用有限导频估计 CSI 的完整流程：发射天线选择与正交导频、信道观测、核先验、超参数学习、后验更新及 CSI 组装。[原图第 5 页](https://arxiv.org/pdf/2512.22578#page=5)

### B. GB-SMCF 超参数学习

使用 \((\mathcal X,\mathbf z_{\rm aug})\) 最大化正规复 GP 先验导出的对数边际似然。集合超参数为

\[
\vartheta=\{\alpha;\{\pi_q^{(r)},\mu_{q,y}^{(r)},\mu_{q,z}^{(r)},v_{q,y}^{(r)},v_{q,z}^{(r)}\}_{q=1}^{Q_r};
\{\pi_p^{(t)},\mu_{p,y}^{(t)},\mu_{p,z}^{(t)},v_{p,y}^{(t)},v_{p,z}^{(t)}\}_{p=1}^{Q_t}\}. \tag{12}
\]

令 \(\theta\) 为无约束表示的优化变量，\(\vartheta=\vartheta(\theta)\)。为满足两侧 \(s\in\{r,t\}\) 的参数取值域，采用重参数化

\[
\begin{gathered}
\alpha=e^{\theta_\alpha},\\
\pi_m^{(s)}=\frac{e^{\theta_{\pi,m}^{(s)}}}
{1+\sum_{\ell=1}^{Q_s-1}e^{\theta_{\pi,\ell}^{(s)}}},
\qquad m=1,\ldots,Q_s-1,\\
\pi_{Q_s}^{(s)}=\frac1{1+\sum_{\ell=1}^{Q_s-1}e^{\theta_{\pi,\ell}^{(s)}}},\\
\mu_{m,\xi}^{(s)}=\tfrac12\tanh(\theta_{\mu,m,\xi}^{(s)}),\qquad
v_{m,\xi}^{(s)}=e^{\theta_{v,m,\xi}^{(s)}},\quad \xi\in\{y,z\}.
\end{gathered}\tag{13}
\]

令 \(\widetilde{\mathbf K}_{\mathcal X\mathcal X}=\mathcal T(\mathbf K_{\rm GB}(\mathcal X,\mathcal X))\)，\(\boldsymbol\Sigma_n=(\sigma_{\rm obs}^2/2)\mathbf I_{2P}\)，则实增广观测服从协方差为 \(\mathbf C_\theta=\widetilde{\mathbf K}_{\mathcal X\mathcal X}+\boldsymbol\Sigma_n\) 的零均值高斯分布，其对数边际似然为

\[
\mathcal L(\theta)=-\tfrac12\mathbf z_{\rm aug}^T\mathbf C_\theta^{-1}\mathbf z_{\rm aug}
-\tfrac12\log\det\mathbf C_\theta-P\log(2\pi). \tag{14}
\]

因而优化问题是

\[
\max_{\theta}\ \mathcal L(\theta)\quad\text{subject to}\quad \theta\in\Theta, \tag{15}
\]

其中 \(\Theta\) 为与表 II 中超参数区间对应的盒约束可行域。令 \(\mathbf q_\theta=\mathbf C_\theta^{-1}\mathbf z_{\rm aug}\)，对第 \(m\) 个优化变量有解析梯度

\[
\frac{\partial\mathcal L}{\partial\theta_m}
=\frac12\operatorname{tr}\left[
(\mathbf q_\theta\mathbf q_\theta^T-\mathbf C_\theta^{-1})
\frac{\partial\mathbf C_\theta}{\partial\theta_m}
\right]. \tag{16}
\]

由实增广变换线性性，\(\partial\mathbf C_\theta/\partial\theta_m=\mathcal T(\partial\mathbf K_{\rm GB}(\mathcal X,\mathcal X)/\partial\theta_m)\)。核可分离结构给出

\[
\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_\alpha}=\mathbf K_{\rm GB},\quad
\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_r}
=\alpha\left(\frac{\partial\mathbf K_r}{\partial\theta_r}\circ\mathbf K_t\right),\quad
\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_t}
=\alpha\left(\mathbf K_r\circ\frac{\partial\mathbf K_t}{\partial\theta_t}\right). \tag{17}
\]

其中 \(\theta_r,\theta_t\) 分别表示任意收发侧优化变量。两侧核的闭式导数见附录 B。

**算法 1：GB-SMCF 超参数在线学习（完整流程）**

输入：\(\mathcal X\)、\(\mathbf z_{\rm aug}\in\mathbb R^{2P}\)、\(\sigma_{\rm obs}\)、初始化 \(\theta^{(0)}\)、盒约束 \(\Theta\)。输出：\(\mathbf C_\theta\) 与学得的 \(\theta\)。

1. 令 \(\boldsymbol\Sigma_n=(\sigma_{\rm obs}^2/2)\mathbf I_{2P}\)，\(\theta\leftarrow\theta^{(0)}\)。
2. 重复：由式（5）—（6）计算收、发侧复协方差矩阵 \(\mathbf K_r,\mathbf K_t\in\mathbb C^{P\times P}\)，元素分别为 \(k_r(i_a,i_b)\)、\(k_t(j_a,j_b)\)，其中 \(x_a=(i_a,j_a),x_b=(i_b,j_b)\in\mathcal X\)。
3. 由式（7）构造 \(\mathbf K_{\rm GB}(\mathcal X,\mathcal X)=\alpha(\mathbf K_r\circ\mathbf K_t)\)。
4. 构造 \(\widetilde{\mathbf K}_{\mathcal X\mathcal X}=\mathcal T(\mathbf K_{\rm GB})\) 与 \(\mathbf C_\theta=\widetilde{\mathbf K}_{\mathcal X\mathcal X}+\boldsymbol\Sigma_n\)。
5. 由式（14）、（16）计算目标及梯度，在 \(\Theta\) 内更新 \(\theta\)。
6. 直至收敛，返回 \(\mathbf C_\theta,\theta\)。

### C. 基于 GB-SMCF 的 GPR 信道估计器

根据学得的超参数，在 \(\mathcal X,\mathcal X_\star\) 上计算各复协方差矩阵，经 \(\mathcal T\) 转换为对应实增广矩阵。正规复 GP 先验诱导的联合高斯分布为

\[
\begin{bmatrix}\mathbf f_{\mathcal X}\\\mathbf f_{\mathcal X_\star}\end{bmatrix}
\sim\mathcal N\left(\mathbf0,
\begin{bmatrix}
\widetilde{\mathbf K}_{\mathcal X\mathcal X}&\widetilde{\mathbf K}_{\mathcal X\mathcal X_\star}\\
\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}&\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X_\star}
\end{bmatrix}\right). \tag{18}
\]

将观测噪声模型并入，得

\[
\begin{bmatrix}\mathbf z_{\rm aug}\\\mathbf f_{\mathcal X_\star}\end{bmatrix}
\sim\mathcal N\left(\mathbf0,
\begin{bmatrix}
\mathbf C_\theta&\widetilde{\mathbf K}_{\mathcal X\mathcal X_\star}\\
\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}&
\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X_\star}
\end{bmatrix}\right). \tag{19}
\]

对 \(\mathbf z_{\rm aug}\) 条件化，未观测集合的后验为 \(\mathcal N(\mathbf m_{\mathcal X_\star},\boldsymbol\Sigma_\star)\)，其中

\[
\mathbf m_{\mathcal X_\star}=
\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}\mathbf C_\theta^{-1}\mathbf z_{\rm aug}, \tag{20}
\]

\[
\boldsymbol\Sigma_\star=
\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X_\star}
-\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}
\mathbf C_\theta^{-1}
\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}^{T}. \tag{21}
\]

已观测集合的后验均值平滑器为

\[
\mathbf m_{\mathcal X}=\widetilde{\mathbf K}_{\mathcal X\mathcal X}
\mathbf C_\theta^{-1}\mathbf z_{\rm aug}. \tag{22}
\]

\(\mathbf m_{\mathcal X},\mathbf m_{\mathcal X_\star}\) 分别给出已观测和未观测信道实虚部的后验均值；\(\operatorname{diag}(\boldsymbol\Sigma_\star)\) 衡量未观测元素的预测不确定性。

将它们分解为实部与虚部，并重组成复估计 \(\widehat{\mathbf h}_{\mathcal X}=\mathbf m_{\mathcal X}^{\Re}+j\mathbf m_{\mathcal X}^{\Im}\)、\(\widehat{\mathbf h}_{\mathcal X_\star}=\mathbf m_{\mathcal X_\star}^{\Re}+j\mathbf m_{\mathcal X_\star}^{\Im}\)，即可合并为完整 CSI：

\[
\widehat{\mathbf H}_{\rm GPR}
=\bigl[\widehat h(i,j)\bigr]_{i=1,\ldots,N_r}^{j=1,\ldots,N_t}
\in\mathbb C^{N_r\times N_t}. \tag{23}
\]

**算法 2：基于 GB-SMCF 的 GPR 估计器（完整流程）**

输入：活动发射集合 \(\Omega_t\)、式（1）中的 \(\mathbf Z\)、\(\sigma_{\rm obs}\)、初始化 \(\theta^{(0)}\) 和约束 \(\Theta\)；输出：\(\widehat{\mathbf H}_{\rm GPR}\) 与 \(\boldsymbol\Sigma_\star\)。

1. 根据式（8）、（9）生成 \(\mathcal X,\mathcal X_\star\)。
2. 令 \(\mathbf z=\operatorname{vec}(\mathbf Z)\)，由式（11）构造 \(\mathbf z_{\rm aug}\)。
3. 调用算法 1 学习 \(\theta\)。
4. 根据学得的 \(\vartheta(\theta)\)，在已观测及未观测集合上计算 \(\mathbf K_{\rm GB}(\mathcal X,\mathcal X)\)、\(\mathbf K_{\rm GB}(\mathcal X_\star,\mathcal X)\) 和 \(\mathbf K_{\rm GB}(\mathcal X_\star,\mathcal X_\star)\)。
5. 将上述协方差变换为实增广矩阵；构造 \(\mathbf C_\theta=\widetilde{\mathbf K}_{\mathcal X\mathcal X}+\frac{\sigma_{\rm obs}^2}{2}\mathbf I_{2P}\)。
6. 求解线性系统 \(\mathbf C_\theta\mathbf q_\theta=\mathbf z_{\rm aug}\)，计算 \(\mathbf m_{\mathcal X}=\widetilde{\mathbf K}_{\mathcal X\mathcal X}\mathbf q_\theta\) 和 \(\mathbf m_{\mathcal X_\star}=\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}\mathbf q_\theta\)。
7. 从两组实增广均值恢复复向量，并将其放入对应索引，组装 \(\widehat{\mathbf H}_{\rm GPR}\)。
8. 求解 \(\mathbf C_\theta\mathbf V=\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}^{T}\)，计算 \(\boldsymbol\Sigma_\star=\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X_\star}-\widetilde{\mathbf K}_{\mathcal X_\star\mathcal X}\mathbf V\)。
9. 返回估计值与后验协方差。

## V. 优化与复杂度分析

所提 GPR 方法结合在线超参数学习与精确 GP 后验计算，必须分析边际似然优化行为、计算复杂度以及向更大阵列扩展的可行性。

### A. 目标函数的优化行为

GB-SMCF 超参数通过最大化式（15）中的非凸边际似然目标进行学习。虽然优化在数值上执行，但目标的局部几何结构可以揭示稀疏导频能否稳定识别核参数，以及优化对初始化的敏感程度。

图 3 展示在参考解 \(\widehat\theta\) 附近的代表性分析。左图在其他变量固定时，对占主导的发射侧第 \(p_\star=2\) 个谱分量的两个平均空间频率 \((\mu_{p_\star,y}^{(t)},\mu_{p_\star,z}^{(t)})\)，绘制边际似然间隙 \(\Delta\mathcal L(\theta)=\mathcal L(\widehat\theta)-\mathcal L(\theta)\) 的二维切片。叠加的六组曲线为不同初始化下全维有界优化轨迹在该二维平面的投影 [29]，\(S_i,E_i\) 分别表示第 \(i\) 次运行的起终点。参考解附近轮廓光滑且各向异性，说明在这两个坐标上局部结构表现良好；倾斜的轮廓表明两个频率参数之间存在耦合，不同主曲率表明沿不同线性组合方向的数据敏感度有差异。

右图显示同一组多起点运行中，随迭代次数变化的收敛间隙。进入主导吸引盆地的轨迹间隙迅速下降，并收敛至几乎相同的目标值；另一些起点却停留在更大的间隙，说明全参数优化依然非凸且依赖初始化。因此，目标在相关盆地内局部光滑、优化器一旦接近盆地便较可靠，多起点方法具有实际价值，且所选发射侧频率存在不同方向的局部耦合与约束强度。

**图 3：** GB-SMCF-GPR 的多起点边际似然优化行为。[原图第 7 页](https://arxiv.org/pdf/2512.22578#page=7)

### B. 计算复杂度

表 I 比较在共同的导频相关预处理（形成 \(\mathbf Z\)）之后，各估计器的主导计算量。所提方法的学习成本来自对实增广矩阵 \(\mathbf C_\theta\in\mathbb R^{2P\times2P}\) 反复分解。每次目标与梯度评估执行一次 Cholesky 分解，随后进行较低阶的三角求解、对数行列式和导数收缩计算。因此每次优化约需 \(O(P^3)\) 时间和 \(O(P^2)\) 内存，若有 \(I_{\rm opt}\) 次迭代，主导成本为 \(O(I_{\rm opt}P^3)\)。在最后一次分解之后，\(P_\star\) 个测试点的后验均值计算需要 \(O(PP_\star)\)。如显式构造完整后验协方差，还需 \(O(P^2P_\star+PP_\star^2)\) 时间及 \(O(P_\star^2)\) 内存；若只计算边际预测方差，成本可降低。

| 估计器 | 主导复杂度 | 备注 |
|---|---|---|
| GB-SMCF-GPR | \(O(I_{\rm opt}P^3)\) | \(P=N_rn_t\)；实增广矩阵大小 \(2P\times2P\)，在线学习主导 |
| LS | \(O(N_rN_t)\) | 全阵列导频下直接取 \(\widehat{\mathbf H}_{LS}=\mathbf Z\) |
| 各向同性 LMMSE | \(O((N_rN_t)^3)\) | 稠密固定协方差线性 MMSE |
| OMP | \(O(I_{\rm OMP}MG)\) | 测量数 \(M\)、字典大小 \(G\)；另有最小二乘及支撑集更新 |
| AMP | \(O(I_{\rm AMP}MG)\) | 稠密矩阵—向量迭代，依赖模型与实现 |

GB-SMCF 的组装是低阶成本。一般训练集合下 \(\mathbf K_{\rm GB}=\alpha(\mathbf K_r\circ\mathbf K_t)\)，构造 Gram 矩阵和导数约为 \(O(D_\theta P^2)\)，每个混合分量参数数目固定时为 \(O((Q_r+Q_t)P^2)\)，低于三次分解成本。

当训练集合为笛卡儿积 \(\mathcal X=\{1,\ldots,N_r\}\times\Omega_t\)，且索引按字典序排列时，复协方差具备精确 Kronecker 形式 \(\mathbf K_{\rm GB}(\mathcal X,\mathcal X)=\alpha(\mathbf K_r^{\rm lat}\otimes\mathbf K_t^{\Omega_t})\)。结构化实现可以利用复 Hermitian 系统中的这一 Kronecker 形式；实增广协方差虽代数等价，但一般不再是普通的 Kronecker 乘积。因此，如果线性代数实现未专门利用结构，精确训练仍为最坏三次复杂度。上述仅为渐近分析，不能据此断言系统能实时运行；在线部署仍需将实测推理时延和内存使用与具体信道相干时间预算比较 [32,33]。

### C. 大型阵列的可扩展性

当 \(N_r\) 或 \(n_t\) 增加时，稠密 Cholesky 精确 GP 训练迅速成为瓶颈。标准精确 GP 的时间、内存分别按 \(O(P^3)\)、\(O(P^2)\) 增长；若不利用额外结构，稠密方法通常只能处理适度规模，例如 \(P\lesssim10^4\) [32]。对此有四类原则明确的扩展方法：

1. 基于矩阵向量运算的精确求解器，如黑盒矩阵—矩阵 GP，用迭代运算替代稠密分解，支持 GPU 加速的大数据 GP 推断 [33]。
2. 诱导点与 Nyström 近似，用秩 \(M\) 的近似核代替完整核，其中 \(M\ll P\)，获得 \(O(PM^2+M^3)\) 时间与 \(O(PM+M^2)\) 内存 [32]。
3. 结构化核插值接近线性复杂度；与 Kronecker 结构联合时，对 \(D\) 维输入与 \(m\) 个诱导格点，可达到 \(O(P+Dm^{1+1/D})\) 计算量及 \(O(P+Dm^{2/D})\) 存储 [34]。
4. 对笛卡儿格点与张量积核，精确 Kronecker 方法可以对因子矩阵进行特征分解，而非分解完整稠密矩阵，求解线性系统及对数行列式 [35]。

本文的笛卡儿训练集合和可分离 GB-SMCF 与这类结构化精确或近似 GP 求解器直接兼容。因此，当前精确实现适合中等 \(P\)，较大阵列应利用 Kronecker 结构或稀疏近似 [32]—[35]。这些扩展留待未来研究。

## VI. 仿真结果

使用两种信道模型评估所提方法：Saleh–Valenzuela 簇模型 [36]，以及 3GPP 技术报告 TR 38.901 中室内办公场景的簇时延线（CDL）模型，采用 CDL-A 时延分布 [37]。除非另行说明，参数与优化设置见表 II。

为了提高空间覆盖率，活动天线集合按等间距规则选择 [11,14]：

\[
\Omega_t=
\begin{cases}
\{1\},& n_t=1,\\
\{1+\operatorname{round}((m-1)(N_t-1)/(n_t-1)):m=1,\ldots,n_t\},&n_t\ge2.
\end{cases}\tag{24}
\]

如有必要，再采用确定性的去重补足步骤，确保集合确有 \(n_t\) 个元素。虽然本文仿真采用等间距选择，但方法可以处理任意发射天线激活模式。

**表 II：仿真参数与优化器设置**

| 参数 | 符号 | 取值 |
|---|---|---|
| 接收 × 发射天线数 | \(N_r\times N_t\) | \(16\times16\) |
| 阵元间距 | \(d/\lambda_c\) | 0.5 |
| 载波频率 | \(f_c\) | 28 GHz |
| 相干块长度 | \(T_c\) | 100 |
| 每活动天线导频功率 | \(P_A\) | 1 |
| 导频长度 | \(T\) | \(n_t\) |
| 导频归一化 | — | \(\mathbf S\mathbf S^H=T\mathbf I_{n_t}\) |
| 训练 SNR | — | \(1/\sigma_{\rm obs}^2\) |
| 总训练能量 | \(E_{\rm tr}\) | \(n_tTP_A=n_t^2P_A\) |
| 蒙特卡洛仿真次数 | — | 100 |
| Saleh–Valenzuela 簇数 | \(C\) | 3 |
| 每簇射线数 | \(R_c\) | 2 |
| 两侧角度扩展 | \(\sigma_\phi,\sigma_\psi\) | 10°、7° |
| CDL 场景 | — | 室内办公、CDL-A |
| CDL 延迟扩展缩放 | — | 28 GHz 下 20 ns |
| 核幅度 | \(\alpha\) | \([10^{-3},30]\) |
| 收、发混合阶数 | \(Q_r,Q_t\) | 各 3 |
| 两侧混合权重 | \(\pi\) | 非负，分别求和为 1 |
| 收发空间频率 | \(\mu\) | \([-0.5,0.5]\) |
| 收发谱方差 | \(v\) | \([6\times10^{-4},10^{-1}]\) |
| 优化器 | — | 盒约束优化器 [29] |
| 多起点初始化 | — | 6 组 |
| Cholesky 稳定微扰 | \(\epsilon\) | \(10^{-8}\) |

表中数值稳定微扰是在协方差矩阵对角线上添加的小正数，以改善 Cholesky 分解的数值稳定性。

**a）信道模型。** Saleh–Valenzuela 模型生成

\[
\mathbf H=\sum_{c=1}^{C}\sum_{r=1}^{R_c}
\beta_{c,r}\mathbf a_r(\phi_{c,r})\mathbf a_t^H(\psi_{c,r})
\in\mathbb C^{N_r\times N_t}, \tag{25}
\]

其中 \(C\) 为簇数，\(R_c\) 为簇内射线数，\(\beta_{c,r}\in\mathbb C\) 为复路径增益，\(\mathbf a_t,\mathbf a_r\) 为发射和接收 URA 导向向量。对于 3GPP 基准，按室内 CDL-A 分布生成信道，时延扩展缩放为 20 ns，并在 \(f_c\) 提取一个窄带信道实现，其余 CDL-A 参数来自规范。两种信道生成器独立于估计器设计，因此不会直接向所提核引入偏向 [11,14]。

**b）基线估计器。** 除非另行说明，LS、各向同性 LMMSE、OMP、AMP 在全阵列训练 \(n_t=N_t\) 下评估。因此这些比较强调**训练效率权衡**，并非严格相同导频预算下的算法性能排名。SqExp 与 Matérn-GPR 则与所提方法采用相同导频预算，因为它们也使用部分阵列观测。每次蒙特卡洛试验中，各算法使用相同信道、活动天线和噪声实现。

LS 在全阵列训练时直接取 \(\widehat{\mathbf H}_{LS}=\mathbf Z\)。各向同性 LMMSE [30] 使用先验协方差 \([\mathbf R_{\rm iso}]_{mn}=\sigma_h^2\operatorname{sinc}((2\pi/\lambda_c)\|\mathbf x_m-\mathbf x_n\|_2)\)，其中 \(\sigma_h^2=1\)、\(\operatorname{sinc}(x)=\sin x/x\)，\(\mathbf x_n\) 为 \(\mathbf h\) 第 \(n\) 个元素对应的物理坐标，其估计为

\[
\widehat{\mathbf h}_{LMMSE}=\mathbf R_{\rm iso}\boldsymbol\Phi^H
(\boldsymbol\Phi\mathbf R_{\rm iso}\boldsymbol\Phi^H+\sigma_{\rm obs}^2\mathbf I)^{-1}\mathbf z.
\]

SqExp、Matérn 核在相同正规复 GP／实增广精确推断框架下使用相同在线边际似然优化与蒙特卡洛协议，其具体实现参照 [10,11,14]。OMP 与 AMP 采用文献 [11,14] 的同一基线字典及数值设置，其中 AMP 收缩参数 \(\tau_{\rm AMP}=1.2\)，OMP 固定稀疏度 \(K=7\)。另以“完美 CSI”作为接近无法达到的理想性能参照。

### A. 归一化均方误差

定义

\[
\mathrm{NMSE}=\mathbb E\left[\frac{\|\widehat{\mathbf H}-\mathbf H\|_F^2}{\|\mathbf H\|_F^2}\right].
\]

以 100 次独立信道和噪声实现的蒙特卡洛试验近似期望。Saleh–Valenzuela 模型下，图 4 显示所提方法即使减少导频仍维持较好 NMSE。\(n_t=8\) 时减少 50% 导频，却在所考虑 SNR 范围内优于采用全导频的基线。即使 \(n_t=4\)、减少 75% 导频，也具有竞争力：在低 SNR 下优于 AMP 与 OMP，并在一段不可忽略的 SNR 范围内优于 LS 和各向同性 LMMSE。

这些现象与核结构一致：GB-SMCF 使用谱混合表示几何相关的收发侧相关性，更符合簇状多径。LS 将信道系数独立处理，无法根据空间相关预测缺失项；各向同性 LMMSE 的简化协方差无法准确匹配阵列几何及簇散射产生的各向异性；OMP/AMP 主要利用角度稀疏性，而非校准后的空间协方差。所提方法并非只对已观测系数去噪，也学习能够完成未观测信道预测的空间先验。

为隔离核结构本身的作用，图 5 将所提核与 SqExp、Matérn 核的 GPR 进行比较。GB-SMCF 在缩减导频至 \(n_t=8\) 时仍具有优势，表明收益不仅来自 GP 的边际似然学习，也来自 GB-SMCF 编码的归纳偏置。Matérn 通常优于 SqExp，因为前者允许粗糙的样本路径，而后者过于平滑；但两种距离型平稳核仍不及显式捕获角度振荡相关性的 GB-SMCF。

将生成模型从 Saleh–Valenzuela 换成标准 3GPP TR 38.901 CDL-A，可检验模型失配鲁棒性。图 6 的定性结果仍成立：全导频下 GB-SMCF 在所考察 SNR 中 NMSE 最低，半数导频下也保留优势，说明核不只适配 Saleh–Valenzuela 生成器。图 7 进一步在同一 \(16\times16\) 链路上对两个信道模型比较三种 GPR 核：GB-SMCF 在两种模型中均为最低 NMSE，在几何簇状模型下表现尤好；CDL-A 包含更丰富的标准化角度和时延特征，因而失配挑战更大。SqExp 与 Matérn 的性能相近，Matérn 略好，但均缺少显式角度振荡相关结构。

**图 4：** 在 \(16\times16\) Saleh–Valenzuela 信道中，GB-SMCF-GPR 与 LS、各向同性 LMMSE、OMP、AMP 的 NMSE–SNR 曲线。[原图第 8 页](https://arxiv.org/pdf/2512.22578#page=8)  
**图 5：** 相同模型下，GB-SMCF 与 SqExp、Matérn 核 GPR 的 NMSE–SNR 比较。[原图第 9 页](https://arxiv.org/pdf/2512.22578#page=9)  
**图 6：** \(16\times16\) 的 3GPP TR 38.901 CDL-A 信道中，GB-SMCF-GPR 与 LS、各向同性 LMMSE、OMP、AMP 的 NMSE–SNR 比较。[原图第 9 页](https://arxiv.org/pdf/2512.22578#page=9)  
**图 7：** 在 Saleh–Valenzuela 与 CDL-A 两种信道模型中，GB-SMCF、SqExp、Matérn 核的 NMSE–SNR 比较。[原图第 9 页](https://arxiv.org/pdf/2512.22578#page=9)

### B. 能量—精度权衡

第 VI-A 节表明所提估计器可在减少导频时保持精度。图 8 以 \(16\times16\) MIMO 信道为对象，绘制 NMSE 随归一化导频预算比 \(n_t/N_t\) 的变化。由于瞬时训练功率为 \(n_tP_A\)，该比值也是归一化瞬时训练功率。又因表 II 取 \(T=n_t\)，一个训练阶段的归一化**总训练能量**为 \((n_t/N_t)^2\)，不能将横轴比例误认为总能量比例。各曲线对应 \([-15,10]\) dB 的固定 SNR，竖线标出 \(n_t\in\{2,4,8,16\}\)。

第一，各 SNR 下，增加 \(n_t\) 均降低 NMSE，因为更多有导频的发射天线向超参数学习和重建提供更多信息。第二，收益不均匀：从非常稀疏的 \(n_t=2,4\) 增至适中 \(n_t=8\)，误差下降明显；进一步增至 16，收益较小，说明识别主导空间结构后出现边际收益递减。第三，导频预算越大，不同 SNR 曲线分离越明显，因为完整或近完整观测能充分利用高信噪比；极小导频预算下的瓶颈不仅在噪声，还在观测不足，继续提高 SNR 的收益有限。

**图 8：** GB-SMCF-GPR 的训练成本与估计精度权衡。[原图第 10 页](https://arxiv.org/pdf/2512.22578#page=10)

### C. 频谱效率

为评估估计器保留的数据检测所需信道信息，考虑基于估计信道设计的线性接收机，在空间复用 Saleh–Valenzuela MIMO 信道上计算频谱效率 [14]。对估计信道 \(\widehat{\mathbf H}\)，使用线性 MMSE 检测器

\[
\mathbf G(\widehat{\mathbf H})=
(\widehat{\mathbf H}\widehat{\mathbf H}^{H}+\frac{N_t}{\rho}\mathbf I_{N_r})^{-1}
\widehat{\mathbf H}
=[\mathbf g_1,\ldots,\mathbf g_{N_t}],
\]

其中 \(\rho\) 为数据阶段总 SNR，发射功率在 \(N_t\) 条数据流间均分。设 \(\mathbf h_k,\mathbf g_k\) 分别为真实信道与检测器的第 \(k\) 列，则流 \(k\) 的均衡后 SINR 为

\[
\mathrm{SINR}_k(\widehat{\mathbf H})=
\frac{|\mathbf g_k^{H}\mathbf h_k|^2}
{\sum_{j\ne k}|\mathbf g_k^H\mathbf h_j|^2+\frac{N_t}{\rho}\|\mathbf g_k\|_2^2}. \tag{26}
\]

频谱效率定义为

\[
\mathrm{SE}(\widehat{\mathbf H})=
\left(1-\frac{T}{T_c}\right)
\sum_{k=1}^{N_t}\log_2(1+\mathrm{SINR}_k(\widehat{\mathbf H})). \tag{27}
\]

前置因子计入导频资源占用。由于仿真中 \(T=n_t\)，该因子为 \(1-n_t/T_c\)。因此，SE 同时取决于信道估计精度与训练开销：增加导频可能改善接收滤波器，却减少可传输数据的信道使用比例。比较不同导频预算的所提方法，以及 LS、各向同性 LMMSE、OMP，并以零导频的完美 CSI 作为由理想信息提供的上界。

图 9 表明，在 \(16\times16\) MIMO 链路、低至中等 SNR（大致不超过 5 dB）下，所提 \(n_t=4\) 配置取得最高 SE。此时系统尚未明显受到流间干扰限制，较少导频引起的方向误差代价尚可接受，而导频前置因子的收益显著。随着 SNR 升高，多流残余干扰取代热噪声成为主要限制，接收机对 \(\widehat{\mathbf H}\) 的方向误差更加敏感；\(n_t=8\) 或 16 的精度收益逐渐抵消额外导频开销，最小预算不再占优。

另一个现象是，\(n_t=8\) 与 \(n_t=16\) 的 SE 曲线在大部分 SNR 区间接近：超过适度导频预算后，额外训练只能带来有限 SINR 改善，却要支付更多前置因子损失。这与 GB-SMCF 对主导空间结构的预测能力一致。基线中 OMP 利用角度稀疏性优于 LS 和各向同性 LMMSE，但支撑集失配、基离散化和系数误差会削弱接收滤波器和均衡后 SINR。LS 不利用结构先验，对噪声及估计误差非常敏感；各向同性 LMMSE 在低 SNR 下利用正则化减弱噪声放大，却在中高 SNR 下受协方差失配限制。

**图 9：** 频谱效率随 SNR 变化的曲线。所提 GB-SMCF-GPR 采用 \(n_t=4,8,16\)，分别节省 75%、50%、0% 导频。[原图第 10 页](https://arxiv.org/pdf/2512.22578#page=10)

### D. 关键讨论

表 III 汇总 \(16\times16\) MIMO 链路在 SNR = 0 dB 时的代表性配置。相对 SE 以理想完美 CSI 上界归一化；导频和能量节省相对于全导频 \(n_t=N_t\)。每活动天线每导频时隙功率固定为 \(P_A\)，且 \(T=n_t\)，因此总能量 \(E_{\rm tr}=n_tTP_A=n_t^2P_A\)。计算成本列只列导频相关公共预处理之后的估计器主导项：对于 GPR 为 \(O(I_{\rm opt}P^3)\)，不含后验评估及完整 \(\boldsymbol\Sigma_\star\) 显式计算。

**表 III：16 × 16 MIMO 链路信道估计器比较（SNR = 0 dB）**

| 估计器 | \(n_t\) | 导频节省 % | 能量节省 % | 相对 SE % | NMSE dB | 主导成本 |
|---|---:|---:|---:|---:|---:|---|
| GB-SMCF-GPR | 16 | 0 | 0 | 75.60 | −19.56 | \(1.68\times10^7 I_{\rm opt}\) |
| GB-SMCF-GPR | 8 | 50 | 75 | 74.28 | −16.72 | \(2.10\times10^6 I_{\rm opt}\) |
| GB-SMCF-GPR | 4 | 75 | 93.75 | 79.99 | −13.78 | \(2.62\times10^5 I_{\rm opt}\) |
| LS | 16 | 0 | 0 | 45.82 | −10.85 | \(2.56\times10^2\) |
| 各向同性 LMMSE | 16 | 0 | 0 | 47.15 | −11.15 | \(1.68\times10^7\) |
| OMP | 16 | 0 | 0 | 63.70 | −15.52 | \(256GI_{\rm OMP}\) |
| AMP | 16 | 0 | 0 | 65.60 | −14.56 | \(256GI_{\rm AMP}\) |
| SqExp-GPR | 16 | 0 | 0 | 66.52 | −13.25 | \(1.68\times10^7I_{\rm opt}\) |
| SqExp-GPR | 8 | 50 | 75 | 70.23 | −11.13 | \(2.10\times10^6I_{\rm opt}\) |
| Matérn-GPR | 16 | 0 | 0 | 67.09 | −15.28 | \(1.68\times10^7I_{\rm opt}\) |
| Matérn-GPR | 8 | 50 | 75 | 72.37 | −12.39 | \(2.10\times10^6I_{\rm opt}\) |

有三项结论。第一，GB-SMCF-GPR 的总体 SE—训练权衡最好：\(n_t=4\) 时相对 SE 最高，同时分别节省 75% 导频和 93.75% 总训练能量，说明几何感知贝叶斯插值可弥补部分直接观测损失，使低导频训练在端到端 SE 上优于所比较的全导频基线。第二，如果以估计精度为优先，所提方法的全导频配置 NMSE 最佳；但 \(n_t=8\) 可在降低 50% 导频和 75% 能量时保持与全导频近似的相对 SE，因此是更均衡的配置，而 \(n_t=4\) 最大化 SE。第三，对于精确 GPR，\(P=N_rn_t\)，主导训练成本按 \(P^3\) 增长；\(n_t\) 从 16 减至 8 或 4 时，主导项分别降低 8 倍和 64 倍。这进一步强化了小预算配置的优势，但也须结合实际延迟及硬件要求。

## VII. 结论与未来方向

本文将受导频限制的信道估计视为高度欠定的贝叶斯逆问题，提出基于 GB-SMCF 的 GPR 估计器。无线信道被建模为收发联合天线索引格点上的正规复高斯随机场，核先验描述由阵列几何与多径传播引起的平滑空间衰减、振荡相关性和各向异性。通过将学习所得协方差嵌入 GPR，从有限含噪导频中恢复完整 CSI：后验均值平滑已观测元素并预测未观测元素，后验协方差量化重建不确定性。

不同于 CS 估计器，本方法不需要固定字典、网格对齐角度稀疏性或严格低秩结构；不同于协方差型 MMSE，也不要求事先知道信道协方差。取而代之，每个相干块直接从当前导频学习物理可解释的阵列域协方差。Saleh–Valenzuela 及 3GPP TR 38.901 CDL-A 模型上的数值结果表明，可最多降低 75% 导频和 93.75% 训练能量，同时比所比较的基线取得更低 NMSE 和更高 SE。

未来将利用后验预测不确定性进行自适应导频分配、可靠性感知的链路自适应和考虑不确定性的波束成形。另一个重要方向是以随空间变化的超参数或局部核混合扩展先验，处理大阵列的空间非平稳效应。

## 附录 A：引理 1 的证明

证明三项性质：核的格点平稳性、Hermitian 正半定性，以及其实增广协方差的正半定性。

**a）格点平稳性。** 根据式（5）、（6），\(k_r(i,i')\) 仅依赖 \(\Delta\mathbf r\)，\(k_t(j,j')\) 仅依赖 \(\Delta\mathbf t\)。由式（7），联合核可写为 \(\alpha k_r(\Delta\mathbf r)k_t(\Delta\mathbf t)\)，所以只依赖联合格点差分。

**b）两侧核的 Hermitian 正半定性。** 固定 \(s\in\{r,t\}\)。式（5）或（6）的每个分量具有形式

\[
\exp[-2\pi^2(v^{(s)}_{q,y}\Delta u_y^2+v^{(s)}_{q,z}\Delta u_z^2)]
\exp[j2\pi(\mu_{q,y}^{(s)}\Delta u_y+\mu_{q,z}^{(s)}\Delta u_z)].
\]

这是非负高斯谱密度的逆傅里叶变换。根据 Bochner 定理，每个分量都是 \(\mathbb R^2\) 上的 Hermitian 正半定核。限制到整数格点不改变正半定性，非负加权求和也保留该性质。因此收发两侧核均为 Hermitian 正半定。

**c）联合核的 Hermitian 正半定性。** 取任意有限有序集合 \(\mathcal X=\{(i_a,j_a)\}_{a=1}^{P}\)。定义 \([\mathbf K_r]_{ab}=k_r(i_a,i_b)\)、\([\mathbf K_t]_{ab}=k_t(j_a,j_b)\)。由上一步两者均为 Hermitian 正半定。式（7）给出

\[
\mathbf K_{\rm GB}(\mathcal X,\mathcal X)=\alpha(\mathbf K_r\circ\mathbf K_t).
\]

因 \(\alpha>0\)，按 Schur 乘积定理，正半定矩阵的 Hadamard 积仍为正半定，故该 Gram 矩阵正半定，联合核得证。

**d）实增广协方差的正半定性。** 令 \(\mathbf K=\mathbf A+j\mathbf B\)，其中 \(\mathbf A=\Re\{\mathbf K\}\) 为对称矩阵，\(\mathbf B=\Im\{\mathbf K\}\) 为反对称矩阵。对任意 \(\mathbf u,\mathbf v\in\mathbb R^P\)，令 \(\mathbf x=[\mathbf u^T,\mathbf v^T]^T\)，\(\mathbf c=\mathbf u+j\mathbf v\in\mathbb C^P\)。由式（3）：

\[
\mathbf x^T\mathcal T(\mathbf K)\mathbf x=
\frac12[\mathbf u^T,\mathbf v^T]
\begin{bmatrix}\mathbf A&-\mathbf B\\\mathbf B&\mathbf A\end{bmatrix}
\begin{bmatrix}\mathbf u\\\mathbf v\end{bmatrix}
=\frac12\mathbf c^H\mathbf K\mathbf c\ge0.
\]

因此 \(\mathcal T(\mathbf K_{\rm GB}(\mathcal X,\mathcal X))\succeq0\)。最后，观测噪声协方差 \(\boldsymbol\Sigma_n=(\sigma_{\rm obs}^2/2)\mathbf I_{2P}\succeq0\)，将它相加仍为正半定，引理 1 得证。

## 附录 B：GB-SMCF 的闭式梯度

本附录给出式（16）需要的导数，均针对重参数化后的优化变量 \(\theta\)。

**a）两侧核的分量记号。** 对 \(s\in\{r,t\}\)，用 \(\Delta\mathbf u=(\Delta u_y,\Delta u_z)\) 表示相应格点差分。对于第 \(q\) 个分量，定义

\[
E_q^{(s)}=\exp[-2\pi^2(v_{q,y}^{(s)}\Delta u_y^2+v_{q,z}^{(s)}\Delta u_z^2)],
\]

\[
\phi_q^{(s)}=2\pi(\mu_{q,y}^{(s)}\Delta u_y+\mu_{q,z}^{(s)}\Delta u_z),\quad
G_q^{(s)}=E_q^{(s)}e^{j\phi_q^{(s)}},\quad C_q^{(s)}=\pi_q^{(s)}G_q^{(s)},
\]

故 \(k_s(\cdot,\cdot)=\sum_{q=1}^{Q_s}C_q^{(s)}\)。

**b）每个分量对优化变量的导数。** 对 \(q=1,\ldots,Q_s-1\)，softmax 权重参数导数为

\[
\frac{\partial k_s}{\partial\theta_{\pi,q}^{(s)}}=
\pi_q^{(s)}(G_q^{(s)}-k_s)
=C_q^{(s)}-\pi_q^{(s)}k_s. \tag{28}
\]

对 \(q=1,\ldots,Q_s\) 和 \(\xi\in\{y,z\}\)，频率、谱方差参数的导数为

\[
\frac{\partial k_s}{\partial\theta_{\mu,q,\xi}^{(s)}}=
j\pi\bigl(1-4(\mu_{q,\xi}^{(s)})^2\bigr)\Delta u_\xi\, C_q^{(s)}, \tag{29}
\]

\[
\frac{\partial k_s}{\partial\theta_{v,q,\xi}^{(s)}}=
-2\pi^2v_{q,\xi}^{(s)}(\Delta u_\xi)^2C_q^{(s)}. \tag{30}
\]

其依据是链式法则：\(\partial\mu_{q,\xi}^{(s)}/\partial\theta_{\mu,q,\xi}^{(s)}=\frac12[1-\tanh^2(\theta_{\mu,q,\xi}^{(s)})]=\frac12[1-4(\mu_{q,\xi}^{(s)})^2]\)，以及 \(\partial v_{q,\xi}^{(s)}/\partial\theta_{v,q,\xi}^{(s)}=v_{q,\xi}^{(s)}\)。

**c）基础核导数。** 取 \(x=(i,j),x'=(i',j')\)。由联合核可分离性，

\[
\frac{\partial k_{\rm GB}}{\partial\theta_\alpha}=k_{\rm GB},\quad
\frac{\partial k_{\rm GB}}{\partial\theta_r}=\alpha\frac{\partial k_r}{\partial\theta_r}k_t,\quad
\frac{\partial k_{\rm GB}}{\partial\theta_t}=\alpha k_r\frac{\partial k_t}{\partial\theta_t}. \tag{31}
\]

**d）矩阵导数。** 在一般训练集合上，\(\mathbf K_{\rm GB}=\alpha(\mathbf K_r\circ\mathbf K_t)\)，因而

\[
\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_\alpha}=\mathbf K_{\rm GB},\quad
\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_r}=
\alpha(\frac{\partial\mathbf K_r}{\partial\theta_r}\circ\mathbf K_t),\quad
\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_t}=
\alpha(\mathbf K_r\circ\frac{\partial\mathbf K_t}{\partial\theta_t}). \tag{32}
\]

**e）实增广协方差导数。** 由 \(\widetilde{\mathbf K}_{\mathcal X\mathcal X}=\mathcal T(\mathbf K_{\rm GB})\)、\(\mathbf C_\theta=\widetilde{\mathbf K}_{\mathcal X\mathcal X}+\boldsymbol\Sigma_n\)，并利用 \(\mathcal T\) 的线性性，得

\[
\frac{\partial\widetilde{\mathbf K}_{\mathcal X\mathcal X}}{\partial\theta_m}
=\mathcal T(\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_m}),\quad
\frac{\partial\mathbf C_\theta}{\partial\theta_m}
=\mathcal T(\frac{\partial\mathbf K_{\rm GB}}{\partial\theta_m}). \tag{33}
\]

这里 \(\boldsymbol\Sigma_n\) 固定，不随 \(\theta\) 变化。将式（33）代入式（16），即得到算法 1 所用的精确梯度。

## 参考文献（保留原题及书目身份）

[1] N. Rajatheva, I. Atzeni et al., “White paper on broadband connectivity in 6G,” University of Oulu, Tech. Rep. 10, Jun. 2020. https://urn.fi/URN:ISBN:9789526226798

[2] Q. Li, M. El-Hajjar et al., “Stacked intelligent metasurfaces for holographic MIMO-aided cell-free networks,” *IEEE Trans. Commun.*, 72(11), 7139–7151, 2024. https://doi.org/10.1109/TCOMM.2024.3403499

[3] F. Weißer, N. Turan et al., “Semi-blind strategies for MMSE channel estimation utilizing generative priors,” *IEEE Trans. Wireless Commun.*, 25, 13788–13802, 2026. https://doi.org/10.1109/TWC.2026.3669634

[4] S. L. Shah, N. H. Mahmood et al., “Interference prediction using Gaussian process regression and management framework for critical services in local 6G networks,” *IEEE WCNC*, Milan, 1–6, 2025. https://doi.org/10.1109/WCNC61545.2025.10978635

[5] S. Rahman, S. L. Shah et al., “Controlled out-of-band device-to-device communication in cellular networks using a backup channel in television white space,” *ICET*, Peshawar, 275–280, 2023. https://doi.org/10.1109/ICET59753.2023.10374858

[6] Q. Li, M. El-Hajjar et al., “Performance analysis of reconfigurable holographic surfaces in the near-field scenario of cell-free networks under hardware impairments,” *IEEE TWC*, 23(9), 11972–11984, 2024. https://doi.org/10.1109/TWC.2024.3386850

[7] J. Zhu, Z. Wan et al., “Electromagnetic information theory-based statistical channel model for improved channel estimation,” *IEEE Trans. Inf. Theory*, 71(3), 1777–1793, 2025. https://doi.org/10.1109/TIT.2025.3526689

[8] O. T. Demir, A. Kosasih et al., “Spatial correlation modeling and RS-LS estimation of near-field channels with uniform planar arrays,” *IEEE SPAWC*, Lucca, 236–240, 2024. https://doi.org/10.1109/SPAWC60668.2024.10694490

[9] J. Li, J. Zhu et al., “Spatio-temporal electromagnetic kernel learning for channel prediction,” *IEEE TWC*, 25, 8114–8130, 2026. https://doi.org/10.1109/TWC.2025.3635412

[10] C. E. Rasmussen and C. K. I. Williams, *Gaussian Processes for Machine Learning*, MIT Press, 2006. https://doi.org/10.7551/mitpress/3206.001.0001

[11] S. L. Shah, N. H. Mahmood et al., “Improved GPR-based CSI acquisition via spatial-correlation kernel,” *IEEE Wireless Commun. Lett.*, 15, 3661–3665, 2026. https://doi.org/10.1109/LWC.2026.3704829

[12] G. Fodor, N. Rajatheva et al., “An overview of massive MIMO technology components in METIS,” *IEEE Commun. Mag.*, 55(6), 155–161, 2017. https://doi.org/10.1109/MCOM.2017.1600802

[13] E. Björnson, C.-B. Chae et al., “Towards 6G MIMO: Massive spatial multiplexing, dense arrays, and interplay between electromagnetics and processing,” arXiv:2401.02844, 2024. https://doi.org/10.48550/arXiv.2401.02844

[14] S. L. Shah, N. H. Mahmood et al., “Low-overhead CSI prediction via Gaussian process regression,” *IEEE Wireless Commun. Lett.*, 15, 1075–1079, 2026. https://doi.org/10.1109/LWC.2025.3648532

[15] T. T. Cai and L. Wang, “Orthogonal matching pursuit for sparse signal recovery with noise,” *IEEE Trans. Inf. Theory*, 57(7), 4680–4688, 2011. https://doi.org/10.1109/TIT.2011.2146090

[16] D. L. Donoho, A. Maleki et al., “Message passing algorithms for compressed sensing: I. Motivation and construction,” *IEEE ITW*, Cairo, 1–5, 2010. https://doi.org/10.1109/ITWKSPS.2010.5503193

[17] E. Vlachos, G. C. Alexandropoulos et al., “Massive MIMO channel estimation for millimeter wave systems via matrix completion,” *IEEE Signal Process. Lett.*, 25(11), 1675–1679, 2018. https://doi.org/10.1109/LSP.2018.2870533

[18] Z. Chen, Q. Yao et al., “Efficient spatial channel estimation in extremely large antenna array communication systems: A subspace approximated matrix completion approach,” *IEEE Open J. Commun. Soc.*, 6, 1216–1230, 2025. https://doi.org/10.1109/OJCOMS.2025.3539936

[19] E. Nayebi and B. D. Rao, “Semi-blind channel estimation in massive MIMO systems with different priors on data symbols,” *IEEE ICASSP*, Calgary, 3879–3883, 2018. https://doi.org/10.1109/ICASSP.2018.8461447

[20] X. Cheng, J. Sun et al., “Pattern-shared sparse Bayesian learning for channel estimation in FDD massive MIMO systems,” *WCSP*, Hangzhou, 1–6, 2018. https://doi.org/10.1109/WCSP.2018.8555899

[21] B. Xiao, P. Huang et al., “Channel estimation using variational Bayesian learning for multi-user mmWave MIMO systems,” *IET Commun.*, 15(4), 566–579, 2021. https://doi.org/10.1049/cmu2.12088

[22] A. Arjas and I. Atzeni, “Nonlinear sparse Bayesian learning methods with application to massive MIMO channel estimation with hardware impairments,” *IEEE Trans. Signal Process.*, 74, 830–845, 2026. https://doi.org/10.1109/TSP.2026.3664263

[23] X. Wei, C. Hu et al., “Deep learning for beamspace channel estimation in millimeter-wave massive MIMO systems,” *IEEE Trans. Commun.*, 69(1), 182–193, 2021. https://doi.org/10.1109/TCOMM.2020.3027027

[24] B. Fesl, A. Banna et al., “Enhancing channel estimation in quantized systems with a generative prior,” *IEEE SPAWC*, Lucca, 681–685, 2024. https://doi.org/10.1109/SPAWC60668.2024.10694129

[25] J.-P. Kermoal, L. Schumacher et al., “A stochastic MIMO radio channel model with experimental validation,” *IEEE J. Sel. Areas Commun.*, 20(6), 1211–1226, 2002. https://doi.org/10.1109/JSAC.2002.801223

[26] H. Özcelik, M. Herdin et al., “Deficiencies of the ‘Kronecker’ MIMO radio channel model,” *Electronics Letters*, 39(16), 1209–1210, 2003. https://doi.org/10.1049/el:20030785

[27] A. G. Wilson and R. P. Adams, “Gaussian process kernels for pattern discovery and extrapolation,” *ICML*, Atlanta, 1067–1075, 2013. https://proceedings.mlr.press/v28/wilson13.html

[28] Y. Zhang, H. Guo et al., “A novel pilot scheme for uplink channel estimation for sub-array structured ELAA in XL-MIMO systems,” *IEEE Trans. Signal Process.*, 74, 2787–2802, 2026. https://doi.org/10.1109/TSP.2026.3661556

[29] R. H. Byrd, P. Lu et al., “A limited memory algorithm for bound constrained optimization,” *SIAM J. Sci. Comput.*, 16(5), 1190–1208, 1995. https://doi.org/10.1137/0916069

[30] O. T. Demir, E. Björnson et al., “Channel modeling and channel estimation for holographic massive MIMO with planar arrays,” *IEEE Wireless Commun. Lett.*, 11(5), 997–1001, 2022. https://doi.org/10.1109/LWC.2022.3152600

[31] T. T. Do, L. Gan et al., “Sparsity adaptive matching pursuit algorithm for practical compressed sensing,” *Asilomar Conference*, Pacific Grove, 581–587, 2008. https://doi.org/10.1109/ACSSC.2008.5074472

[32] J. Hensman, A. G. d. G. Matthews et al., “Scalable variational Gaussian process classification,” *AISTATS*, 38, 351–360, 2015. https://proceedings.mlr.press/v38/hensman15.html

[33] J. Gardner, G. Pleiss et al., “GPyTorch: Blackbox matrix-matrix Gaussian process inference with GPU acceleration,” *NeurIPS*, 31, 7576–7586, 2018. https://proceedings.neurips.cc/paper/2018/file/27e8e17134dd7083b050476733207ea1-Paper.pdf

[34] A. G. Wilson and H. Nickisch, “Kernel interpolation for scalable structured Gaussian processes (KISS-GP),” *ICML*, 37, 1775–1784, 2015. https://proceedings.mlr.press/v37/wilson15.html

[35] J. A. Lin, S. Ament et al., “Scalable Gaussian processes with latent Kronecker structure,” *ICML*, 267, 37730–37744, 2025. https://proceedings.mlr.press/v267/lin25a.html

[36] A. A. M. Saleh and R. A. Valenzuela, “A statistical model for indoor multipath propagation,” *IEEE J. Sel. Areas Commun.*, 5(2), 128–137, 1987. https://doi.org/10.1109/JSAC.1987.1146527

[37] 3GPP, “Study on channel model for frequencies from 0.5 to 100 GHz,” Technical Report TR 38.901, Release 16, Dec. 2019. https://www.3gpp.org/DynaReport/38901.htm

## 作者简介

**Syed Luqman Shah**（IEEE 研究生会员）生于巴基斯坦 Swat，于 2021 年在白沙瓦工程技术大学获得电气工程学士学位并获大学金奖，于 2023 年以优异成绩在 GIK 工程科学与技术学院取得电气工程硕士学位。2023—2024 年任职于伊斯兰堡 FAST–NUCES 的研究助理。现于芬兰奥卢大学无线通信中心攻读通信工程博士学位，研究兴趣包括无线传播建模、无线数字孪生、信道估计和超可靠低时延通信。

**Nurul Huda Mahmood**（IEEE 会员）生于孟加拉国，于 2013 年获得挪威科技大学（NTNU）博士学位，现任芬兰奥卢大学无线通信中心高级研究员，协调芬兰 6G Flagship 项目的无线连接研究领域，并领导关键机器类型通信（MTC）研究团队。2018 年加入奥卢大学前，他是丹麦奥尔堡大学电子系统系副教授，参与过 Hexa-X-II 等国际项目，已合著逾 100 篇同行评议论文；现研究方向为无线网络的韧性通信。

{% endraw %}
