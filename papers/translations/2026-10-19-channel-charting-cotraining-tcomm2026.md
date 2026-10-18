---
layout: page
title: "共训练信道图半监督定位算法｜中文逐节译稿（校对中）"
permalink: /papers/translations/2026-10-19-channel-charting-cotraining-tcomm2026/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/eb181bdf15229320/) · [IEEE 原文](https://doi.org/10.1109/TCOMM.2026.3693171)

# 一种具有共训练机制的基于信道图的半监督定位算法

**原题：** A Channel Charting-Based Semi-Supervised Positioning Algorithm With Co-Training  
**作者：** Yuhang Pan、Junling Li、Yang Wu、Jianghan Ji、Chen Huang、Cheng-Xiang Wang  
**出处：** *IEEE Transactions on Communications*，第 74 卷，9010 页起，2026；DOI：10.1109/TCOMM.2026.3693171。论文于 2025 年 6 月 25 日收到，2026 年 4 月 23 日录用，5 月 13 日发表。早期版本部分内容发表于 IEEE ICC 2025（DOI：10.1109/ICC52391.2025.11160825）。  
**译文状态：** 已按原文覆盖摘要、正文 I—VI 节、公式（1）—（22）、算法 1—2、图表说明与主要实验结果；参考文献 42 条已补入中文题名与书目信息，逐式终校中，暂不计入全文验收。

## 摘要

传统几何定位方法在非视距（non-line-of-sight，NLoS）环境下精度较低，而指纹定位方法由于需要不断更新数据库，维护成本较高。基于信道图构建（channel charting）的定位方法通过无监督学习从信道状态信息（channel state information，CSI）推断用户位置，但在复杂传播环境下通常精度不足。信道地图通过提供与传播环境相关的先验信道信息，使真实地理位置预测成为可能。利用这一思想，基于信道图的定位方法可充分使用这些先验知识，改善定位精度并减少对大量标注数据的依赖。

本文提出一种具有共训练（co-training）机制的新型基于信道图的半监督定位算法，同时利用信道地图提供的有标签数据，以及实际通信系统获取的无标签数据，预测真实地理位置。所提方法使用基于协方差的信道特征及相应非相似度度量，提高对噪声与定时提前量（timing advance，TA）干扰的鲁棒性。利用经过实际测量校准的射线追踪仿真，将该方法与先进定位算法在不同噪声条件下进行比较，验证了有效性和优势。

**关键词：** 信道图构建；半监督学习；定位；共训练；协方差特征。

## I. 引言

随着 B5G/6G 研究发展，未来无线通信预计将支持扩展现实、空中无人机和智能驾驶等新兴应用，它们均需要高精度定位 [2]。与传统定位方式相比，基于无线电的定位能够利用丰富的多径传播信息及空时特征，因此具有发展前景 [3], [4]。几何定位方法（geometry-based positioning methods，GPMs）在仅考虑收发端 LoS 路径时可实现厘米级精度，但复杂环境特别是室内场景中 LoS 条件难以保证。相较之下，指纹定位方法（fingerprint-based positioning methods，FPMs）即使在 NLoS 场景下也能实现较可靠的定位。

FPM 通过信道测量或仿真建立指纹库，再将用户设备（user equipment，UE）的信道数据与数据库比较来估计位置 [5]。因此，FPM 需要昂贵的真实坐标参考系统进行标注；环境变化可能使数据库频繁更新，造成较高的部署和维护成本。

### A. 相关工作

信道图定位已成为缓解 FPM 局限的替代技术 [6]。它通过无监督学习，将高维 CSI 从原始空间映射到保留 UE 周围空间几何的低维潜在空间。奠基性研究 [7] 介绍了多种方法，大致分为传统方法和深度神经网络（DNN）方法。传统方法包括主成分分析（PCA）、Sammon 映射、多维尺度分析 [8] 和 Isomap [9]。DNN 更适合处理高维数据中的复杂非线性关系。自编码器（AE）能够在无显式非相似度度量条件下降维 [10]；卷积自编码器（CAE）采用卷积层取代全连接层，更充分地提取 CSI 特征 [11]。孪生网络（Siamese）使用非相似度度量学习表示，约束潜在空间中两样本的距离与原始空间中的距离一致 [12]—[15]。后来的 Triplet DNN 则侧重保持相对距离关系，而不强制精确匹配距离 [16]：原始空间中较接近的样本，在潜在空间中仍应较接近。这样在高维 CSI 中难以定义明确物理距离时，往往更稳健。

无线电定位中，信道特征十分重要。文献 [7] 表明，将 CSI 二阶矩的绝对值投影到角度域可作为性能较好的信道特征。文献 [17] 构造对信道损伤不敏感的特征：先计算频域复自相关的绝对值，再取对数。文献 [13] 通过按传播时延对 CSI 进行填充，保留多径分量和相对时间偏移信息。文献 [15] 将 CSI 自相关的实部与虚部连接为一个向量。

非相似度度量使用信道信息衡量 UE 之间的距离，以指导降维。文献 [7] 使用 CSI 二阶矩的 Frobenius 距离；[13] 使用信道冲激响应，构造与物理距离接近全局线性相关的度量；[9] 使用对小尺度衰落不敏感的 CSI 度量；[16] 以时间戳差值代替 CSI 度量；[18] 从 CSI 估计多径参数，构造基于角度—时延轮廓（angle-delay profile，ADP）的度量。文献 [15] 在 [9] 和 [18] 的基础上提出 ADP 度量，并结合时间戳构造融合非相似度。文献 [19] 使用深度学习预测样本间非相似度，利用潜在特征缓解噪声影响。但 CSI 非相似度往往对低信噪比（SNR）和 TA 干扰敏感，影响实际性能。

通常，信道图通过 UE 之间的信道相关性仅提供**相对位置**，而不是绝对地理位置。利用少量已知锚点，文献 [8], [12], [20] 采用仿射变换将相对位置映射到真实坐标。文献 [14] 增加基于 AoA 或 ToA 的似然校正项。文献 [21] 提出分离式 Triplet 损失，利用 CSI 采样过程中已有的速度信息；文献 [22] 结合速度与楼层平面图作为监督信号，在无专用参考信号条件下构建绝对信道图，但依赖额外辅助信息。文献 [23] 联合多 BS CSI 学习多小区信道图；文献 [24] 使用“不太深”（not-too-deep，N2D）的两阶段深度流形学习，先用 AE 学习全局嵌入，再进行浅层聚类以发现流形结构。

信道地图（channel map）是场景相关数据库，存储 BS、UE 位置及能反映环境传播特性的信道信息 [25]—[28]。通过信道地图，信道图定位方法能够改善复杂传播条件下的准确性和鲁棒性，也为半监督学习提供标注锚点。文献 [10] 将已知标签的绝对距离作为正则项，使 AE 输出恢复全局几何结构；[12] 同时约束网络输出与已知锚点对齐，及成对输出距离与相应信道特征距离匹配；[29] 在半监督框架中利用带坐标标签的 CSI 样本；[30] 提出半监督 t-SNE，将高维多天线 CSI 通过少量标注数据映射到二维地理地图。

### B. 贡献与论文结构

本文提出基于信道图的半监督定位算法 CCP（channel charting-based positioning），以改善复杂传播环境下的定位精度。此外，信道图定位虽然比 FPM 依赖更少的标签，但如何充分利用无标签数据仍缺少有效方法。共训练是一种重要的半监督学习框架 [31]：它利用数据的多个视角进行协同学习。因此，进一步提出具有共训练机制的 CCPC（channel charting-based positioning with co-training），利用有标签与无标签数据，在噪声条件下恢复真实位置的邻域结构。

主要贡献为：

1. 明确考虑真实通信信道损伤，包括加性噪声和 TA 干扰；构造新型协方差信道特征及匹配的非相似度度量，以减弱损伤并保留与定位相关的几何结构。
2. 提出两阶段 CCP：先通过无监督 Triplet 预训练得到 32 维信道图，再使用半监督微调学习二维坐标，在改善精度的同时降低训练复杂度。
3. 提出 CCPC：基于互补信道视角训练两个 CCP 模型，利用预测一致性筛选可信无标签样本，通过更新非相似度度量进一步减轻噪声。CCPC 能更充分地使用有标签与无标签数据，在高噪声环境下提高定位鲁棒性。

本文第二节为框架与系统模型，第三节为特征与非相似度度量，第四节描述 CCPC，第五节给出评价方法与实验结果，第六节总结。

## II. 算法框架与系统模型

### A. 算法框架

所提定位算法如图 1。左侧图 1(a) 为整体数据处理与 CCPC：首先将 CSI 变换为信道协方差矩阵（channel covariance matrix，CCM），再变换到角度—协方差域，得到角度域协方差（angle-domain covariance，ADC）特征；利用 ADC 计算基于协方差的余弦相似度（covariance cosine similarity，CCS），再结合测地距离（geodesics）得到 CCSG。CCSG 作为 CCPC 的非相似度输入。

CCPC 使用 ADC 的幅度和相位分别训练两个 CCP。每轮迭代中，从无标签样本里挑选高置信度样本形成伪标签，并联合最小化 Triplet、真实标签与伪标签损失，更新网络。初步预测后，再通过非相似度度量更新（dissimilarity-metric renewal，DMR）利用预测坐标更新 CCSG，缓解噪声影响。

单个 CCP 由无监督信道图构建模块和半监督定位模块组成。前者以 CCSG 为约束构建 32 维信道图；后者使用有限的真实标注将信道图映射到实际坐标。最终输出来自伪标签样本与更新 CCSG 共同训练后的模型。

**图 1.** 所提定位框架：（a）数据处理与 CCPC 总体结构；（b）共训练和 DMR；（c）CCP 结构。

### B. 系统模型

根据 6G 泛在信道模型（6G pervasive channel model，6GPCM）[32] 并调整参数，可研究未来 6G 的全频段、全场景信道 [33], [34]。设频域 CSI 为 $\mathbf H\in\mathbb C^{T\times R\times N_{\rm sub}}$，其中 $T$ 为 UE 发送探测参考信号（SRS）的端口数，$R$ 为 BS 接收天线数，$N_{\rm sub}$ 为子载波数。

考虑一个 BS 配备均匀矩形阵列（uniform rectangular array，URA）的 MIMO 系统。每个阵列位置具有 $P$ 个极化分支，$P=1$ 表示单极化，$P=2$ 表示双极化。阵列具有 $M$ 列、每列 $N$ 个通道，因此 $R=PMN$，CSI 也可以写成 $\mathbf H\in\mathbb C^{T\times P\times M\times N\times N_{\rm sub}}$，与此前定义等价。

为保证实际通信场景中的可行性，考虑噪声与 TA 干扰。

**1）噪声：** 噪声建模为加性白高斯噪声（additive white Gaussian noise，AWGN），受噪声影响的 CSI 为

$$
\widetilde{\mathbf H}=\mathbf H+\mathbf N.
\tag{1}
$$

其中 $\mathbf N=\mathbf N_{\rm Re}+j\mathbf N_{\rm Im}$，且 $\mathbf N_{\rm Re},\mathbf N_{\rm Im}\sim\mathcal N(0,\boldsymbol\Sigma/2)$，$\boldsymbol\Sigma$ 为噪声协方差矩阵。

**2）TA 干扰：** 在实际通信系统中，BS 向不同 UE 发送 TA 命令，指导它们适当调整上行发送时刻，使接收信号在循环前缀范围内对齐。TA 在时域表现为整体时延，在频域表现为相位旋转：

$$
\widehat H(\cdot,\cdot,k)=H(\cdot,\cdot,k)e^{-j2\pi f_k\Delta\tau}.
\tag{2}
$$

$\Delta\tau$ 为 TA，$f_k$ 为第 $k$ 个子载波频率。

用于定位的数据包含 CSI $\mathbf H^{(l)}\in\mathbb C^{T\times R\times N_{\rm sub}}$ 与 UE 的位置 $\mathbf x^{(l)}\in\mathbb R^D$，其中 $l=1,\ldots,L$。本文考虑二维空间，即 $D=2$，数据集为 $\mathcal D=\{(\mathbf H^{(l)},\mathbf x^{(l)})\}_{l=1}^{L}$。

### C. 数据采集

数据由三部分组成：华为技术有限公司通过 RT 生成的两个室外仿真数据集，以及 DICHASUS [35] 中的一个室内实测数据集。图 2 展示这些场景的布局，彩色区域是 UE 分布区域，空白区域为建筑。主要仿真参数列于原文表 I。

两个 RT 室外场景使用相同的仿真设置，仅传播环境（布局与散射体配置）不同。UE 位于边长 200 m 的菱形区域中，每个数据集有 $L=20\,000$ 个样本。

室内实测场景为工厂内的分布式 MIMO 通信系统，发射机是沿各种路径在 L 形区域移动的机器人。场景左下角有一个主要散射体，在右下区域形成 NLoS，而上部区域保持 LoS；UE 分布区域中未放置其他散射体。

**图 2.** 三种数据场景布局，包括两个 RT 室外场景和一个 DICHASUS 室内实测场景。  
**表 I.** 各场景的频率、带宽、BS 阵列、采样数、位置分布与信道损伤设置，具体取值以原表为准。

## III. 信道特征与非相似度度量

无线电定位的精度在很大程度上取决于特征及非相似度度量的设计。它们决定模型能否保留不同 UE 在真实空间中的几何关系。稳健的特征和度量有助于在有噪声条件下，从信道测量恢复真实空间的邻域结构。

### A. 基于角度域协方差的信道特征

CCM 捕获信道二阶统计特性，尤其是 MIMO 中不同接收天线之间的相关性。定义 $\mathbf R\in\mathbb C^{N_T\times N_R\times N_R}$，其元素为

$$
R(t,r,r')=
\frac1{N_{\rm sub}}\sum_{k=1}^{N_{\rm sub}}
H(t,r,k)H(t,r',k)^H.
\tag{3}
$$

其中 $t=1,\ldots,N_T$，$r,r'=1,\ldots,N_R$，$N_T,N_R$ 分别为发射与接收天线数；$(\cdot)^H$ 表示共轭转置。

与原始 CSI 相比，CCM 降低了特征维度，可减少后续网络的参数与训练成本；同时，通过频域平均减轻小尺度衰落，提高鲁棒性。

**1）抗噪声：** 当 CSI 含噪时，相应 CCM 为

$$
\begin{aligned}
\widetilde{\mathbf R}
&=\mathbb E[(\mathbf H+\mathbf N)(\mathbf H+\mathbf N)^H]\\
&=\mathbb E[\mathbf H\mathbf H^H+\mathbf H\mathbf N^H+
\mathbf N\mathbf H^H+\mathbf N\mathbf N^H]\\
&=\mathbb E[\mathbf H\mathbf H^H]
+\mathbb E[\mathbf H\mathbf N^H]
+\mathbb E[\mathbf N\mathbf H^H]
+\mathbb E[\mathbf N\mathbf N^H].
\end{aligned}\tag{4}
$$

$\mathbb E[\cdot]$ 表示数学期望。假设 AWGN 与信道互不相关，则交叉项 $\mathbb E[\mathbf H\mathbf N^H]=\mathbb E[\mathbf N\mathbf H^H]=0$，因此

$$
\widetilde{\mathbf R}=
\mathbb E[\mathbf H\mathbf H^H]+\mathbb E[\mathbf N\mathbf N^H]
=\mathbf R+\boldsymbol\Sigma.
\tag{5}
$$

$\boldsymbol\Sigma$ 是对角矩阵，噪声只影响 CCM 的对角元素，其整体影响相对有限。

**2）抗 TA 干扰：** 将式（2）代入式（3）：

$$
\begin{aligned}
\widehat R(t,r,r')
&=\frac1{N_{\rm sub}}\sum_k
\widehat H(t,r,k)\widehat H(t,r',k)^H\\
&=\frac1{N_{\rm sub}}\sum_k
H(t,r,k)e^{-j2\pi f_k\Delta\tau}
H(t,r',k)^He^{j2\pi f_k\Delta\tau}\\
&=\frac1{N_{\rm sub}}\sum_k H(t,r,k)H(t,r',k)^H
=R(t,r,r').
\end{aligned}\tag{6}
$$

由此，CCM 可消除由同一整体 TA 引起的频域相位旋转。

BS 使用 $P$ 极化的 $M\times N$ URA，共有 $R=PMN$ 个接收通道。因此式（3）的接收天线索引 $r$ 可重排为 $(p,m,n)$，其中 $p$ 为极化索引，$m,n$ 为两个阵列空间索引，故 $H(t,r,k)$ 可写为 $H(t,p,m,n,k)$。为提高保持邻域关系的能力，将 CCM $R(t,p,m,n,r')$ 转换到更紧凑的角度—协方差域。其中，第二个接收通道索引 $r'$ 被视为协方差矩阵的参考维度，而不是子载波索引。

首先对 URA 两个空间维度执行二维傅里叶变换：

$$
\begin{aligned}
R'(t,p,z,a,r')
&=\mathcal F_{m,n}\{R(t,p,m,n,r')\}\\
&=\sum_{m=0}^{M-1}\sum_{n=0}^{N-1}
R(t,p,m,n,r')e^{-j2\pi(zm/M+an/N)}.
\end{aligned}\tag{7}
$$

其中 $z,a$ 为天顶、方位波束索引。再沿参考通道维度 $r'$ 执行一维逆离散傅里叶变换：

$$
\begin{aligned}
F(t,p,z,a,\eta)
&=\mathcal F_{r'}^{-1}\{R'(t,p,z,a,r')\}\\
&=\frac1{N_R}\sum_{r'=1}^{N_R}
R'(t,p,z,a,r')e^{j2\pi\eta r'/N_R}.
\end{aligned}\tag{8}
$$

$\eta$ 为变换后的协方差域索引。把 $\mathbf F$ 称为角度域协方差（ADC）特征。由于 CCM 本身对噪声具有一定鲁棒性，ADC 也相对不敏感。进一步可写为

$$
\begin{aligned}
F(t,p,z,a,\eta)
&=\mathcal F_{r'}^{-1}
\bigl\{\mathcal F_{m,n}[R(t,p,m,n,r')]\bigr\}\\
&=\frac1{N_RN_{\rm sub}}
\sum_{r'=1}^{N_R}\sum_{k=1}^{N_{\rm sub}}
\mathcal F_{m,n}\{H(t,p,m,n,k)\}\\
&\qquad\cdot H(t,r',k)^*e^{j2\pi\eta r'/N_R}\\
&=\frac1{N_RN_{\rm sub}}
\sum_{r'=1}^{N_R}\sum_{k=1}^{N_{\rm sub}}
H'(t,p,z,a,k)H(t,r',k)^*
e^{j2\pi\eta r'/N_R},
\end{aligned}\tag{9}
$$

其中 $H'(t,p,z,a,k)=\mathcal F_{m,n}\{H(t,p,m,n,k)\}$ 是波束域信道响应。该表达式表明，ADC 保留了波束域信道响应与参考通道响应的相关性，沿 $r'$ 变换则进一步集中协方差表示。

ADC 与 CSI 都是复矩阵，在进入神经网络前需要转换为实矩阵。图 3 在相同条件下展示 CSI 与 ADC 的角度域幅度轮廓。噪声明显破坏 CSI，ADC 能部分恢复信息。图 4 比较二者幅度剖面，CSI 峰值因 TA 发生偏移，又被噪声扰动，而 ADC 的主峰保持稳定。

ADC 的相位也包含位置信息。图 5 显示，发射阵列相位变化可以反映 BS 与 UE 的相对位置；ADC 能在噪声中恢复这一特征，为后续预测提供信息。虽然 ADC 相位的信息量看起来少于幅度，后续实验仍将证明通过共训练使用相位能改善定位。图 3—5 共同说明 ADC 幅度和相位都能减小噪声影响、保留信道关系，适合 CCPC 架构。

**图 3.** 角度域幅度分布：（a）CSI；（b）含噪 CSI；（c）ADC；（d）含噪 ADC。  
**图 4.** CSI、含噪 CSI、ADC、含噪 ADC 的幅度剖面。  
**图 5.** 对应特征的空间/波束域相位剖面。

### B. 基于协方差余弦相似度的非相似度度量

CSI 非相似度容易受环境噪声影响；即使无噪声，不同样本的 TA 差异也会使相邻位置 CSI 时间特征不对齐，造成不可忽视的偏差，有时偏差甚至超过样本真实空间距离。因此，本文利用较抗噪的 ADC 构造非相似度，提出协方差余弦相似度（CCS）。根据文献 [9], [15]，两个样本 $i,j$ 的度量为

$$
d_{\rm CCS}^{i,j}
=\sum_{t=1}^{N_T}\sum_{r'=1}^{N_R}
\left[
1-
\frac{\left|\sum_{r=1}^{N_R}
F^{(i)}(t,r,r')F^{(j)}(t,r,r')^*\right|^2}
{\left(\sum_{r=1}^{N_R}|F^{(i)}(t,r,r')|^2\right)
\left(\sum_{r=1}^{N_R}|F^{(j)}(t,r,r')|^2\right)}
\right].
\tag{10}
$$

其中 $\mathbf F^{(i)}$、$\mathbf F^{(j)}$ 分别为样本 $i,j$ 的 ADC。为简化记号，将 $F(t,p,z,a,\eta)$ 重排为 $F(t,r,r')$；$r$ 是由 $(p,z,a)$ 展平得到的角度域索引，$r'$ 对应变换后的协方差域索引 $\eta$。

式（10）得到的信道图通常能较好地保留局部邻域，但定位还需要反映环境的全局几何结构 [13]。因此构造结合测地距离的 CCS（CCS with geodesics，CCSG）。首先根据式（10）计算任意两样本非相似度，组成距离矩阵 $\mathbf D$；在 $\mathbf D$ 上建立 $k$ 近邻图 $\mathcal G$，取 $k=10$；再用 Dijkstra 最短路径算法计算全局非相似距离，得到 $\mathbf D_{\rm geo}$。图 6 选取一个样本，与其他样本分别计算 CCSG 和真实地理坐标之间的欧氏距离。两种分布较为接近，说明 CCSG 能保留样本间的几何依赖关系。

**图 6.** （a）CCSG 距离与（b）真实坐标欧氏距离的空间分布比较。

## IV. 具有共训练机制的信道图定位算法

### A. 基于信道图的定位算法 CCP

CCP 首先通过无监督学习把高维信道特征映射到 32 维信道图，再在信道地图的监督下将信道图变换为二维预测坐标。其信道图构建模块使用 DNN 学习表示，使相似样本接近、不相似样本远离。

CCP 包含信道图构建模块和定位模块，如图 7。信道图构建模块从残差层开始，随后是四层 CNN 和三层全连接（fully connected，FC），产生信道图。定位模块再由两层 FC 将信道图映射为预测位置。网络使用批归一化（batch normalization，BN）稳定训练，所有激活函数采用高斯误差线性单元（Gaussian error linear unit，GELU）。

信道图构建模块采用 Triplet 损失 [16]：

$$
\begin{aligned}
\mathcal L_{\rm tri}
=\frac1{|\mathcal T|}
\sum_{(i,j,k)\in\mathcal T}
\Bigl(
&\|f_\theta(\mathbf x_i)-f_\theta(\mathbf x_j)\|\\
&-\|f_\theta(\mathbf x_i)-f_\theta(\mathbf x_k)\|
+\mathcal M\Bigr)_+,
\end{aligned}\tag{11}
$$

其中 $f_\theta$ 为输入到信道图的映射，$(u)_+=\max(u,0)$，$\mathcal M$ 为间隔超参数（margin）。

信道图降维本身是无监督的，仅反映样本相对位置；准确定位则需要真实地理坐标。因此引入信道地图的有限标注作为监督，定义标签损失 [29]：

$$
\mathcal L_{\rm lb}
=\frac1{|\mathcal D_{\rm lb}|}
\sum_{\mathbf x_{\rm lb}\in\mathcal D_{\rm lb}}
\|g_\theta(\mathbf x_{\rm lb})-\mathbf y_{\rm lb}\|.
\tag{12}
$$

$\mathcal D_{\rm lb}$ 是带标签数据集，$g_\theta$ 是 CCP 映射到地理坐标的函数，$\mathbf y_{\rm lb}$ 是真实标签位置。为减轻过拟合，采用 10 折交叉验证，每轮使用 90% 样本训练、剩余 10% 测试，以评价泛化能力 [36]。

**图 7.** 所提神经网络架构：残差层、卷积层、用于 32 维信道图的全连接层，以及用于二维坐标输出的全连接定位模块。

### B. 共训练半监督定位算法 CCPC

虽然 CCP 已使用有标签数据，无标签数据的潜力仍未充分挖掘。共训练利用无标签样本的不同视角，从中选择最有信心的样本作为伪标注来增强半监督学习 [31], [37], [38]。CCPC 使用 ADC 的幅度和相位作为两个互补视角，分别训练两个 CCP，再选择伪标签样本用于网络训练和非相似度更新。

CCPC 性能改进依赖两个假设：（1）高置信度样本具有较好的信道条件；（2）信道条件较好样本之间的非相似度估计较准确。

#### 1）伪标签样本选择

算法 1 从无标签样本中选择高置信度样本。置信度由两个 CCP 的预测差异定义，亦即不确定性。无标签样本 $\mathbf x$ 在过去 $T$ 轮迭代中的不确定性为

$$
u_{\rm ulb}(\mathbf x)
=\frac1T\sum_{t=1}^{T}
\|g_{\theta_1}^{\,t}(\mathbf x)
-g_{\theta_2}^{\,t}(\mathbf x)\|_2.
\tag{13}
$$

$\|\cdot\|_2$ 为欧氏范数，$g_{\theta_1}^{\,t}$、$g_{\theta_2}^{\,t}$ 是第 $t$ 轮两个 CCP 的定位函数。为选中的无标签样本 $\mathbf x_{\rm plb}$ 分配伪标签 $\mathbf y_{\rm plb}$，定义为两个 CCP 在过去 $T$ 轮输出的平均值：

$$
\mathbf y_{\rm plb}
=\frac1{2T}\sum_{t=1}^{T}
\bigl[g_{\theta_1}^{\,t}(\mathbf x_{\rm plb})
+g_{\theta_2}^{\,t}(\mathbf x_{\rm plb})\bigr].
\tag{14}
$$

重复 $Q$ 轮后，将数据集分为真实标签集 $\mathcal D_{\rm lb}$、伪标签集 $\mathcal D_{\rm plb}$ 和剩余无标签集 $\mathcal D_{\rm ulb}$。训练损失由 Triplet 损失、真实标签损失和伪标签损失组成：

$$
\mathcal L=
(1-\beta)\bigl[(1-\alpha)\mathcal L_{\rm tri}
+\alpha\mathcal L_{\rm lb}\bigr]
+\beta\mathcal L_{\rm plb}.
\tag{15}
$$

其中 $\alpha,\beta$ 调节监督强度与伪标签数据的权重。伪标签损失定义为

$$
\mathcal L_{\rm plb}
=\frac1{|\mathcal D_{\rm plb}|}
\sum_{\mathbf x_{\rm plb}\in\mathcal D_{\rm plb}}
\Bigl(\|g_\theta(\mathbf x_{\rm plb})
-\mathbf y_{\rm plb}\|_2-u_{\rm plb}\Bigr)_+.
\tag{16}
$$

$u_{\rm plb}$ 是伪标签样本的不确定性。不同于强制网络输出与伪标签精确一致，式（16）只要求预测坐标与伪标签的距离不超过不确定性阈值。该软约束有助于缓解错误伪标签对最终定位性能的影响。

**算法 1：伪标签样本选择**

输入：ADC 特征 $\mathbf F$、CCSG 全局距离矩阵 $\mathbf D_{\rm geo}$、真实标签集 $\mathcal D_{\rm lb}$、无标签集 $\mathcal D_{\rm ulb}$。输出：伪标签集 $\mathcal D_{\rm plb}$。

1. 初始化 $\mathcal D_{\rm plb}\leftarrow\varnothing$。
2. 利用 $|\mathbf F|$、$\mathbf D_{\rm geo}$、$\mathcal D_{\rm lb}$ 和 $\mathcal D_{\rm plb}$ 训练第一个 CCP $g_1$。
3. 利用 ADC 相位 $\angle\mathbf F$ 与相同距离矩阵、标签集训练第二个 CCP $g_2$。
4. 对外层迭代 $q=1,\ldots,Q$：对于 $r=1,\ldots,R$，按式（13）计算无标签样本不确定性；选择 $\mathbf x_{\rm plb}=\arg\min_{\mathbf x\in\mathcal D_{\rm ulb}}u_{\rm ulb}(\mathbf x)$；记录 $u_{\rm plb}=u_{\rm ulb}(\mathbf x_{\rm plb})$；按式（14）计算伪标签位置。
5. 将三元组 $(\mathbf x_{\rm plb},\mathbf y_{\rm plb},u_{\rm plb})$ 加入 $\mathcal D_{\rm plb}$，并从 $\mathcal D_{\rm ulb}$ 删除 $\mathbf x_{\rm plb}$。
6. 每次内层选择 $R$ 个样本后，分别用更新的 $\mathcal D_{\rm plb}$ 重训两个 CCP；外层循环直到 $q>Q$。

#### 2）非相似度度量更新 DMR

受噪声与 TA 干扰影响，原始 CSI 难以完整反映真实信道。ADC 与 CCSG 虽能挖掘部分潜在信息，仍无法完全消除噪声。CCPC 利用 DNN 正则化减小噪声造成的几何畸变，并通过有标签与无标签数据共同推断位置，为更新非相似度提供了条件。

DMR 先根据训练中预测的坐标计算欧氏距离矩阵 $\mathbf D_{\rm pos}$，再将 $\mathbf D_{\rm pos}$ 与 $\mathbf D_{\rm geo}$ 融合，减小噪声导致的距离偏差：

$$
d_{\rm geo}^{\rm renewal}=
\begin{cases}
d_{\rm geo},&d_{\rm geo}<d_{\rm pos},\\
d_{\rm geo}+\gamma(d_{\rm pos}-d_{\rm geo}),
&d_{\rm geo}\ge d_{\rm pos}.
\end{cases}\tag{17}
$$

其中 $d_{\rm geo}$ 是原测地距离矩阵元素，$d_{\rm pos}$ 是预测位置之间的距离，$\gamma$ 为 DMR 学习率，本文设为 0.1。这个规则只把**偏大的测地距离**向预测位置距离靠拢，而不对原本更小的距离作修改。

**算法 2：非相似度度量更新**

输入：$\mathbf D_{\rm geo}$、特征 $\mathbf F$。输出：更新后的非相似度矩阵 $\mathbf D$。

1. 使用 $\mathbf F$ 与 $\mathbf D_{\rm geo}$ 训练定位算法。
2. 利用训练好的算法得到预测位置 $\mathbf P$。
3. 根据 $\mathbf P$ 构造欧氏距离矩阵 $\mathbf D_{\rm distance}$。
4. 依式（17）更新 $\mathbf D_{\rm geo}$。

## V. 实验结果

本节首先介绍信道图评价指标；随后考察不同噪声条件下特征和非相似度度量的性能，以及定位性能；再进行 CCPC 的收敛分析；然后与现有信道图定位算法比较；最后研究标签数量的影响。

数据集 1、2 均使用 18,000 个训练样本和 2,000 个测试样本，除另行说明，训练集中只有 500 个样本带有位置标签。数据集 3 含 18,602 个实测样本，其中 16,742 个用于训练、1,860 个用于测试，默认同样仅有 500 个训练样本带标签。B、C、E 小节使用数据集 1；D 小节比较全部三种数据集。

### A. 评价指标

采用连续性（continuity，CT）、可信度（trustworthiness，TW）[39] 以及 Kruskal 压力（Kruskal's Stress，KS）[40] 衡量定位结果能否保留真实位置的空间几何结构；另使用平均绝对误差（MAE）评价定位精度。

**1）连续性：** 衡量物理空间中的最近邻在预测位置空间中仍保持最近邻的程度：

$$
\mathrm{CT}(K)=1-
\frac{2}{LK(2L-3K-1)}
\sum_{l=1}^{L}
\sum_{i\in V_K^{(l)}}
\max\{0,\widehat r_{l,i}-K\}.
\tag{18}
$$

其中 $K$ 为最近邻数量，$L$ 为样本数；$\widehat r_{l,i}$ 表示样本 $l$ 的第 $i$ 个邻居在预测空间中的排序；$V_K^{(l)}=\{i\mid r_{l,i}\le K\}$ 为样本 $l$ 在真实物理空间中的 $K$ 个最近邻集合，$r_{l,i}$ 为真实物理空间中的邻居名次。

**2）可信度：** 衡量预测位置空间是否引入错误的局部邻居：

$$
\mathrm{TW}(K)=1-
\frac{2}{LK(2L-3K-1)}
\sum_{l=1}^{L}
\sum_{i\in U_K^{(l)}}
\max\{0,r_{l,i}-K\}.
\tag{19}
$$

$U_K^{(l)}=\{i\mid\widehat r_{l,i}\le K\}$ 为预测位置空间中的 $K$ 个最近邻。CT 和 TW 均位于 $[0,1]$，越接近 1 越好。

**3）Kruskal 压力：** 用于评价降维后全局结构的保持程度：

$$
\mathrm{KS}=
\sqrt{
\frac{\displaystyle\sum_{i=1}^{L-1}\sum_{j=i+1}^{L}
\left(\|\mathbf x^{(i)}-\mathbf x^{(j)}\|_2
-\beta\|\mathbf z^{(i)}-\mathbf z^{(j)}\|_2\right)^2}
{\displaystyle\sum_{i=1}^{L-1}\sum_{j=i+1}^{L}
\|\mathbf x^{(i)}-\mathbf x^{(j)}\|_2^2}
}.
\tag{20}
$$

$\mathbf x^{(i)}$ 是真实坐标，$\mathbf z^{(i)}$ 是预测坐标；缩放因子为

$$
\beta=
\frac{\displaystyle\sum_{i=1}^{L-1}\sum_{j=i+1}^{L}
\|\mathbf x^{(i)}-\mathbf x^{(j)}\|_2
\|\mathbf z^{(i)}-\mathbf z^{(j)}\|_2}
{\displaystyle\sum_{i=1}^{L-1}\sum_{j=i+1}^{L}
\|\mathbf z^{(i)}-\mathbf z^{(j)}\|_2^2}.
\tag{21}
$$

**4）MAE：** 预测位置与真实位置的平均欧氏距离：

$$
\mathrm{MAE}=
\frac1n\sum_{i=1}^{n}\|\widehat{\mathbf y}_i-\mathbf y_i\|_2.
\tag{22}
$$

$n$ 为样本数。**原文的文字定义**将 $\mathbf y_i$ 称为预测位置、$\widehat{\mathbf y}_i$ 称为观测位置，与常见的帽号记法相反；式（22）的欧氏距离关于两者交换对称，因此这一记号差异不改变计算结果。

### B. 不同噪声条件下特征与非相似度度量的评价

**1）不同噪声条件下的特征性能。** 比较原始时间—角度域 CSI、文献 [7] 的二阶矩（raw second moment，R2M）以及本文的 ADC。原文表 II 通过不同噪声信号功率比（noise-to-signal power ratio，NSR）下的 TW、CT 衡量特征性能。在全部受测 NSR 下，ADC 的 TW、CT 均优于 CSI，平均增益约 0.219。相比 R2M，ADC 在 TW 上只有小幅改善，但 CT 提升约 0.022。整体而言，ADC 在这些噪声条件下表现最佳。

**2）不同噪声条件下的非相似度性能。** 比较 CCSG 与文献 [15] 的角度—时延轮廓测地距离度量（angle-delay profile with geodesics，ADPG）。原文表 III 给出 NSR 从 0 到 1 时的 TW、CT；CCSG 在大多数条件下优于 ADPG。特别在 NSR=1 时，CCSG 的 TW、CT 分别提高约 2.3%、2.8%，说明其对噪声更不敏感。

**3）不同噪声条件下 ADC+CCSG 定位性能。** 使用 CSI+ADPG、R2M+ADPG 作为基线，所提方法使用 ADC+CCSG。图 8 的误差 CDF 表明，ADC 在多个噪声条件下的定位性能优于 CSI，且精度对噪声变化更不敏感。原文表 IV 显示，三个 NSR 水平平均而言，ADC+CCSG 的 MAE 相比 CSI+ADPG 降低约 35.8%，相比 R2M+ADPG 降低约 21.8%；在 NSR=1 时降幅分别为 40.2%、24.5%。此外，ADC+CCSG 的 KS 最低，在多数条件下 TW、CT 也高于基线。整体而言，ADC+CCSG 在全部受测噪声条件下获得最佳定位表现。

**表 II.** 各信道特征在不同 NSR 下的 TW 和 CT。  
**表 III.** 不同非相似度度量在不同 NSR 下的 TW 和 CT。  
**表 IV.** 不同特征和度量的定位性能，包含 TW、CT、KS、MAE。  
**图 8.** 不同噪声条件下各特征和度量的定位误差 CDF。

### C. 共训练定位性能与收敛

如第四节所述，CCPC 结合有标签与无标签数据，减小噪声对非相似度的影响并改善定位。图 9 展示迭代过程：横轴为 CCPC 迭代次数；右侧纵轴为每次迭代的非相似度（黑线）及定位结果（红线）的 TW、CT；左侧纵轴是 CCPC 定位结果的 MAE（蓝线）。

定义 $\mathbf D_{\rm geo}^{(i)}$ 和 $\mathbf P^{(i)}$ 为第 $i$ 次迭代后的非相似度矩阵和预测坐标。初始 $\mathbf D_{\rm geo}^{(0)}$ 的 TW、CT 分别为 0.9517 和 0.9648；$\mathbf P^{(0)}$ 的 TW、CT、MAE 分别为 0.9870、0.9880 和 7.5154 m。由于 $\mathbf P^{(0)}$ 的几何保持能力较高，第一次更新后 $\mathbf D_{\rm geo}^{(1)}$ 的 TW、CT 上升到 0.9631 和 0.9731；随后 $\mathbf P^{(1)}$ 的 MAE 下降 4.6% 至 7.1685 m，TW、CT 上升到 0.9871、0.9884。经过这一互相促进的过程，14 次迭代后 $\mathbf P^{(14)}$ 的 TW、CT、MAE 分别达到 0.9898、0.9910、6.2742 m；MAE 相较初始减少 16.5%。

图 10 将某个样本与其余样本的 CCSG、更新后的 CCSG、真实欧氏距离分布进行对比。初始 CCSG 在黑色方框区域低估距离、在紫色方框区域高估距离。主要有两个原因：两区域均属于 NLoS，信道条件复杂；噪声和 TA 使相邻 NLoS 样本的距离被高估，难以区分它们之间的真实关系。基于 CCPC 预测位置，DMR 主要将过大的测地距离向预测距离靠拢，从而减小噪声与 TA 引起的偏差，又不会大幅改变原来的非相似结构。图 10(b) 更新后的分布明显更接近图 10(c) 的真实坐标距离，说明 DMR 提高了困难传播环境中的度量可靠性。

**图 9.** CCPC 多轮迭代过程中定位 MAE、非相似度及定位结果的 TW/CT 变化。  
**图 10.** （a）原 CCSG；（b）更新 CCSG；（c）真实坐标欧氏距离的空间分布。

### D. CCPC 的定位性能

选取 PCA、均匀流形近似与投影（UMAP）[41]、卷积自编码器（ConAE）[10]、Siamese [12] 和 Triplet [16] 作为基线，以验证 CCPC 的准确性、鲁棒性与泛化能力。训练/测试划分及有标签样本数量遵循本节开头设置。由于半监督方法通常利用标签约束预测坐标，为公平比较，在传统降维算法之后使用仿射变换将信道图映射为真实位置。除 CCP、CCPC 外，对所列基线保持相同实验条件。

**1）数据集 1。** 图 11 比较 PCA、UMAP、ConAE、Siamese、Triplet、CCP、CCPC 和真实位置的二维分布。传统无监督方法不能很好地恢复样本的真实几何形状；半监督方法有所改善，但仍存在区域重叠。CCP 与 CCPC 能更好地恢复全局地理形状与邻域关系，其中 CCPC 与真实分布最接近。

从图 12 的误差 CDF 与原文表 V 可见，CCPC 的定位误差明显低于多个基线。根据本文后续给出的跨数据集比较，CCPC 相较仅含两阶段定位的 CCP 在数据集 1 上将 MAE 降低约 7.5%；与传统 Triplet 相比改善约 22.8%。这些结果说明共训练选取的高置信样本和 DMR 有助于提高性能。

**图 11.** 数据集 1 中各算法预测位置分布：（a）PCA；（b）UMAP；（c）ConAE；（d）Siamese；（e）Triplet；（f）CCP；（g）CCPC；（h）真实坐标。  
**图 12.** 数据集 1 中各算法定位误差 CDF。  
**表 V.** 数据集 1 中各算法 TW、CT、KS、MAE 比较。

**2）数据集 2。** 图 13 展示 CCP 与 CCPC 在数据集 2 的性能。与数据集 1 相似，无监督基线难以恢复真实全局几何；半监督基线中 Triplet 较好，但仍存在不同区域重叠。数据集 2 的建筑遮挡更多、传播更复杂，尤其场景右侧。总体而言，CCP 与 CCPC 在恢复全局形状和保留局部邻域方面优于基线。但严重 NLoS 区域的绝对坐标仍较难恢复，因此两方法在数据集 2 的精度都低于数据集 1。

图 14 中，CCPC 有 80% 的误差小于 14 m，CCP 有 80% 小于 18 m。表 VI 显示 CCPC 的 TW、CT 分别为 0.9645 和 0.9691，为各算法中最好；其 MAE 为 9.1218 m，较 Triplet 降低 26.9%，较 UMAP、ConAE、Siamese 分别降低 78.6%、59.5%、44.1%。

与数据集 1 相比，CCPC 在数据集 2 上的 MAE、TW、CT、KS 分别恶化约 45.4%、2.6%、2.2%、33.7%，作者认为可能与散射体增加有关。不过 CCPC 相比 CCP 的 MAE 改善由数据集 1 的 7.5% 增至数据集 2 的 17.2%。这说明共训练在复杂散射环境中收益更明显：CCPC 通过选择信道条件良好的样本作为伪标签，使信道条件较差区域能借助附近高质量样本改善预测。

**图 13.** 数据集 2 中各算法预测坐标分布。  
**图 14.** 数据集 2 中各算法误差 CDF。  
**表 VI.** 数据集 2 中各算法 TW、CT、KS、MAE 比较。

**3）数据集 3。** 数据集 3 来自真实通信信道测量，没有额外人为加入噪声，只包含采集过程中存在的 TA 干扰。图 15 为各算法的预测位置分布。由于 BS 在左上方，左下空白区域的一个大型散射体阻挡右下绿色区域，导致该区域信道条件恶化。各算法均在绿色区域出现一定畸变，但 CCP、CCPC 误差最小，表现出低 SNR 环境下的鲁棒性。值得注意的是，只有 UMAP 保留了沿一维扫描路线大致线性推进的轨迹形状，说明它擅长保持局部结构。

图 16 显示 CCPC 在 80% 情况下的定位误差小于 1.7 m。表 VII 中其 MAE 为 0.8459 m，比 Triplet 低 37.8%，且明显优于 UMAP、ConAE、Siamese。CCPC 的 TW、CT 分别为 0.9573、0.9608，说明较好地保持局部位置结构。文献 [42] 在使用同一基础数据但没有 TA 干扰的条件下，采用多 BS CSI 的半监督方法得到 1.02 m MAE；本方法仅使用一个选定接收阵列的 CSI，MAE 仍改善 17.1%。

数据集 3 同样证明，PCA 不适合该任务，在三个数据集上均表现较差。作者推测 PCA 在展开信道特征时损失了有利于准确定位的高维结构。与前两个数据集不同，UMAP 在数据集 3 上表现较好，虽然总体仍不及部分 DNN 方法，但 TW、CT 优于 ConAE、Siamese 和 Triplet，说明其局部结构保持能力较强。在 DNN 基线中，Triplet 仍是表现最好的方法。

相较数据集 1、2，CCPC 对 CCP 的改善在数据集 3 较小：三组数据上的 MAE 改善分别为 7.5%、17.2%、5.7%。作者认为可能是因为数据集 3 仅有一个主要散射体，LoS 与 NLoS 区域区分较清晰；数据集 1、2 则具有多个交错的 LoS/NLoS 区域，共训练能更充分地利用 LoS 高质量样本辅助较差区域。

此外，CCPC 相对半监督 Triplet 的提升在数据集 3 最大，三组数据上的 MAE 改善分别为 22.8%、26.9%、37.8%。作者将这一现象归因于数据集 3 噪声功率较低，而数据集 1、2 设置了 NSR=1。较低噪声使 DMR 更新更准确，也改善共训练选出的伪标签质量。

**图 15.** 数据集 3 中各算法预测位置分布。  
**图 16.** 数据集 3 中各算法误差 CDF。  
**表 VII.** 数据集 3 各算法定位性能比较。

### E. 有标签样本数量的影响

为研究标签数量对 CCPC 的影响，在数据集 1、NSR=1 下将总训练数据量固定为 18,000，调整有标签样本数量 $N_{\rm lb}$，其余 $18\,000-N_{\rm lb}$ 个为无标签样本，测试集固定为 2,000。对照方法是使用全部 18,000 个样本及其真实坐标训练的监督式 FPM。

图 17 显示，增加标签数量能够提高 CCPC 定位精度。当 $N_{\rm lb}$ 达到 7,500 时，CCPC 的性能已接近完全监督式 FPM；继续增加标签数量，边际收益逐渐减小。

表 VIII 中，定位指标随标注数增加不断改善，在 $N_{\rm lb}\approx10\,000$ 时精度开始明显饱和。使用 15,000 个带标签样本时，CCPC 的 TW、CT、KS、MAE 分别为 0.9984、0.9986、0.0337、2.3406 m；作者指出此时仅使用监督式 FPM 约 83% 的标签，却在全部指标上优于 FPM。只用 7,500 个标签时，CCPC 的 TW、CT、KS 分别为 0.9977、0.9980、0.0396，MAE 为 2.6189 m，仅比 FPM 高 10.9%。因此，只使用全部标签的 41.7%，CCPC 便能取得接近监督式 FPM 的定位表现。

**图 17.** 不同标注样本数量下 CCPC 定位误差 CDF。  
**表 VIII.** 不同标注数量下 CCPC 的定位性能，指标为 TW、CT、KS、MAE。

## VI. 结论

本文提出一种基于信道图的半监督定位算法，结合协方差特征和共训练机制。所提 ADC 特征与 CCSG 对噪声和 TA 干扰表现出较强鲁棒性，从而提高定位结果的稳定性及实际部署适用性。实验结果确认 CCPC 能够较准确地预测真实地理位置，并优于所比较的其他定位算法。即使仅有较少标注样本，CCPC 也能取得接近完全监督式 FPM 的性能，缓解传统 FPM 对昂贵、高密度地理标签的依赖。共训练和 DMR 可以充分利用有标签与无标签数据，改善不同信道条件下的几何表示和定位精度。

## 附录 A：原论文表 I—VIII 的逐项数值

以下按原论文图表逐项转录，保留原有精度、单位、NSR 条件及算法名称。

**表 I　不同数据场景参数**

| 参数 | 室外 RT 仿真 | 室内实测 [35] |
|---|---|---|
| 载波频率 | 3.5 GHz | 1.272 GHz |
| 发射天线数 | 2 | 1 |
| 接收天线数 | 64 | 8 |
| BS 天线结构 | 8 × 4 均匀矩形阵列 | 2 × 4 均匀矩形阵列 |
| 极化数量 | 2 | 1 |
| BS 高度 | 30 m | 1.56—1.78 m |
| UE 位置数量 | 20000 | 18602 |
| BS 天线间距 | 半波长 | 半波长 |
| 带宽 | 100 MHz | 50.056 MHz |
| 子载波数 | 408 | 1024 |

**表 II　不同信道特征的可信度 TW 与连续性 CT**

| NSR | CSI TW | CSI CT | R2M TW | R2M CT | ADC TW | ADC CT |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 0.6928 | 0.7897 | 0.8806 | 0.8876 | **0.8825** | **0.9071** |
| 0.5 | 0.6403 | 0.6736 | 0.8789 | 0.8847 | **0.8813** | **0.9059** |
| 1 | 0.6190 | 0.6338 | 0.8761 | 0.8801 | **0.8798** | **0.9043** |

**表 III　不同非相似度度量的 TW 与 CT**

| NSR | ADPG TW | ADPG CT | CCSG TW | CCSG CT |
|---|---:|---:|---:|---:|
| 0 | 0.9515 | 0.9596 | **0.9570** | **0.9652** |
| 0.5 | 0.9530 | 0.9698 | **0.9544** | **0.9706** |
| 1 | 0.9296 | 0.9374 | **0.9517** | **0.9648** |

**表 IV　不同特征与非相似度度量的定位性能**

| 特征 + 度量 | NSR | MAE (m) | TW | CT | KS |
|---|---:|---:|---:|---:|---:|
| CSI + ADPG | 0 | 8.7676 | 0.9902 | 0.9910 | 0.1109 |
| CSI + ADPG | 0.5 | 9.7917 | 0.9825 | 0.9857 | 0.1128 |
| CSI + ADPG | 1 | 11.7304 | 0.9757 | 0.9795 | 0.1465 |
| R2M + ADPG | 0 | 7.4094 | 0.9907 | 0.9916 | 0.1023 |
| R2M + ADPG | 0.5 | 8.0998 | 0.9902 | 0.9914 | 0.0999 |
| R2M + ADPG | 1 | 9.2835 | 0.9857 | 0.9890 | 0.1184 |
| ADC + CCSG | 0 | **5.9666** | 0.9907 | 0.9920 | **0.0868** |
| ADC + CCSG | 0.5 | **6.3539** | 0.9900 | 0.9908 | **0.0982** |
| ADC + CCSG | 1 | **7.0125** | 0.9882 | 0.9897 | **0.1070** |

**表 V　数据集 1 上不同算法的定位性能**

| 算法 | MAE (m) | TW | CT | KS |
|---|---:|---:|---:|---:|
| PCA | 47.5717 | 0.8401 | 0.8603 | 0.4938 |
| UMAP | 48.4792 | 0.9266 | 0.9247 | 0.4422 |
| ConAE | 28.6253 | 0.9260 | 0.9430 | 0.2506 |
| Siamese | 15.2555 | 0.9631 | 0.9747 | 0.1967 |
| Triplet | 8.1275 | 0.9810 | 0.9852 | 0.1156 |
| CCP（所提） | **6.7831** | **0.9886** | **0.9896** | **0.1078** |
| CCPC（所提） | **6.2742** | **0.9898** | **0.9910** | **0.0986** |

**表 VI　数据集 2 上不同算法的定位性能**

| 算法 | MAE (m) | TW | CT | KS |
|---|---:|---:|---:|---:|
| PCA | 43.6254 | 0.8667 | 0.8827 | 0.4558 |
| UMAP | 42.6851 | 0.9167 | 0.9214 | 0.3917 |
| ConAE | 22.5262 | 0.9321 | 0.9354 | 0.2151 |
| Siamese | 16.3118 | 0.9481 | 0.9536 | 0.1824 |
| Triplet | 12.4782 | 0.9590 | 0.9680 | 0.1581 |
| CCP（所提） | **11.0155** | **0.9634** | **0.9688** | **0.1528** |
| CCPC（所提） | **9.1218** | **0.9645** | **0.9691** | **0.1318** |

**表 VII　数据集 3（实测）中不同算法的定位性能**

| 算法 | MAE (m) | TW | CT | KS |
|---|---:|---:|---:|---:|
| PCA | 3.2524 | 0.8423 | 0.8585 | 0.7633 |
| UMAP | 1.9381 | 0.9249 | 0.8974 | 0.3525 |
| ConAE | 1.9168 | 0.8628 | 0.8715 | 0.2944 |
| Siamese | 1.6655 | 0.8703 | 0.8909 | 0.3141 |
| Triplet | 1.3601 | 0.8844 | 0.8884 | 0.2762 |
| 文献 [42] 基线 | 1.0200 | 0.9550 | 0.9690 | 0.1820 |
| CCP（所提） | **0.8974** | **0.9429** | **0.9511** | **0.1844** |
| CCPC（所提） | **0.8459** | **0.9573** | **0.9608** | **0.1755** |

**表 VIII　不同标注数量下 CCPC 定位性能**

| 方法 | 带标签样本数 | MAE (m) | TW | CT | KS |
|---|---:|---:|---:|---:|---:|
| CCPC | 500 | 6.2742 | 0.9898 | 0.9910 | 0.0986 |
| CCPC | 2500 | 3.7829 | 0.9969 | 0.9973 | 0.0559 |
| CCPC | 7500 | 2.6189 | 0.9977 | 0.9980 | 0.0396 |
| CCPC | 10000 | 2.4379 | 0.9981 | 0.9983 | 0.0369 |
| CCPC | 12500 | 2.3720 | 0.9982 | 0.9983 | 0.0363 |
| CCPC | 15000 | 2.3406 | 0.9984 | 0.9986 | 0.0337 |
| 全监督 FPM | 18000 | 2.3611 | 0.9984 | 0.9984 | 0.0356 |

---

## 参考文献（完整编号与中文题名）

以下按原文 [1]—[42] 顺序翻译题名，保留作者姓名、发表来源、卷期、页码、年份以及必要的 DOI 等书目信息。

[1] Y. Wu、Y. Pan、J. Ji、C.-X. Wang、J. Li、C. Huang，《利用协方差特征改进基于 Triplet 的信道图定位算法》，IEEE ICC，蒙特利尔，3852—3857，2025。

[2] C.-X. Wang 等，《通向 6G：愿景、需求、关键技术与试验平台》，*IEEE Communications Surveys & Tutorials*，25(2)，905—974，2023。

[3] C. Huang 等，《人工智能赋能的通信无线传播——第一部分：信道表征与天线—信道优化》，*IEEE Transactions on Antennas and Propagation*，70(6)，3939—3954，2022。

[4] C. Huang 等，《人工智能赋能的通信无线传播——第二部分：场景识别与信道建模》，*IEEE Transactions on Antennas and Propagation*，70(6)，3955—3969，2022。

[5] W. Yang、Y. Wang、J. Huang、C. Wang、C. Huang，《基于加权随机森林的 6G 室内通信定位算法》，IEEE VTC-Fall，1—6，2022。

[6] P. Ferrand、M. Guillaud、C. Studer、O. Tirkkonen，《无线信道图构建：理论、实践与应用》，*IEEE Communications Magazine*，61(6)，124—130，2023。

[7] C. Studer、S. Medjkouh、E. Gonultas、T. Goldstein、O. Tirkkonen，《信道图构建：利用信道状态信息定位无线电环境中的用户》，*IEEE Access*，6，47682—47698，2018。

[8] J. Pihlajasalo、M. Koivisto、J. Talvitie、S. Ali-Löytty、M. Valkama，《面向 5G 网络的无监督多点信道图绝对定位》，IEEE VTC-Fall，维多利亚，1—5，2020。

[9] L. Le Magoarou，《通过相位不敏感距离计算实现高效信道图构建》，*IEEE Wireless Communications Letters*，10(12)，2634—2638，2021。

[10] P. Huang 等，《利用表征约束自编码器改进信道图构建》，IEEE SPAWC，戛纳，1—5，2019。

[11] C. Geng、H. Huang、J. Langerman，《采用多输入多输出卷积自编码器的多点信道图构建》，IEEE/ION PLANS，波特兰，1022—1028，2020。

[12] E. Lei、O. Castañeda、O. Tirkkonen、T. Goldstein、C. Studer，《用于无线定位与信道图构建的孪生神经网络》，Allerton Conference，蒙蒂塞洛，200—207，2019。

[13] M. Stahlke、G. Yammine、T. Feigl、B. M. Eskofier、C. Mutschler，《利用鲁棒全局信道图进行室内定位：基于时间—距离的方法》，*IEEE Transactions on Machine Learning in Communications and Networking*，1，3—17，2023。

[14] F. Euchner、P. Stephan、S. T. Brink，《利用经典无线信号源定位技术增强信道图构建》，Asilomar Conference，太平洋丛林市，1641—1647，2023。

[15] P. Stephan、F. Euchner、S. T. Brink，《用于信道图构建的角度—时延轮廓和时间戳辅助非相似度度量》，*IEEE Transactions on Communications*，72(9)，5611—5625，2024。

[16] P. Ferrand、A. Decurninge、L. G. Ordóñez、M. Guillaud，《基于 Triplet 的无线信道图构建：架构与实验》，*IEEE Journal on Selected Areas in Communications*，39(8)，2361—2373，2021。

[17] P. Ferrand、A. Decurninge、M. Guillaud，《利用信道估计进行基于 DNN 的定位：特征设计及实验结果》，IEEE GLOBECOM，1—6，2020。

[18] H. Al-Tous、P. Kazemi、C. Studer、O. Tirkkonen，《采用角度—时延—功率轮廓特征和推土机距离的信道图构建》，Asilomar Conference，1195—1201，2022。

[19] P. Q. Viet、D. Romero，《隐式信道图构建及其在无人机辅助定位中的应用》，IEEE SPAWC，奥卢，1—5，2022。

[20] S. Taner、V. Palhares、C. Studer，《真实世界坐标下的信道图构建》，IEEE GLOBECOM，吉隆坡，3940—3946，2023。

[21] B. Rappaport、E. Gönültaş、J. Hoydis、M. Arnold、P. K. Srinath、C. Studer，《通过分离式 Triplet 损失和惯性正则项改进信道图构建》，ISWCS，柏林，1—6，2021。

[22] M. Stahlke、G. Yammine、T. Feigl、B. M. Eskofier、C. Mutschler，《利用空间分布地图匹配进行基于速度的信道图构建》，*IEEE Journal of Indoor and Seamless Positioning and Navigation*，2，230—239，2024。

[23] J. Deng、S. Medjkouh、N. Malm、O. Tirkkonen、C. Studer，《无线网络中的多点信道图构建》，Asilomar Conference，286—290，2018。

[24] P. Agostini、Z. Utkovski、S. Stańczak、A. A. Memon、B. Zafar、M. Haardt，《不太深的信道图构建（N2D-CC）》，IEEE WCNC，2160—2165，2022。

[25] T. Qi 等，《基于混合信道模型的新型 6G 动态信道地图》，*IEEE Transactions on Vehicular Technology*，75(2)，2628—2643，2026。

[26] S. Chen 等，《基于信道地图、面向无蜂窝大规模 MIMO 通信的角度域多址接入》，*IEEE Journal of Selected Topics in Signal Processing*，19(2)，366—380，2025。

[27] Y. Zeng、X. Xu，《借助信道知识地图迈向环境感知的 6G 通信》，*IEEE Wireless Communications*，28(3)，84—91，2021。

[28] Y. Zeng 等，《关于利用信道知识地图实现 6G 环境感知通信的教程》，*IEEE Communications Surveys & Tutorials*，26(3)，1478—1519，2024。

[29] Q. Zhang、W. Saad，《面向毫米波网络中信道图辅助物联网定位的半监督学习》，IEEE GLOBECOM，马德里，1—6，2021。

[30] J. Deng、W. Shi、J. Hu、X. Jiao，《用于毫米波无线定位的半监督 t-SNE》，ICCC，成都，1015—1019，2021。

[31] A. Blum、T. Mitchell，《通过共训练结合带标签与无标签数据》，第 11 届计算学习理论年会，92—100，1998。

[32] C.-X. Wang、J. Huang、H. Wang、X. Gao、X. You、Y. Hao，《6G 无线信道测量和模型：趋势与挑战》，*IEEE Vehicular Technology Magazine*，15(4)，22—32，2020。

[33] C.-X. Wang、Z. Lv、X. Gao、X. You、Y. Hao、H. Haas，《全频段、全场景 6G 几何随机信道模型的泛在无线信道建模理论与应用》，*IEEE Transactions on Vehicular Technology*，71(9)，9159—9173，2022。

[34] C.-X. Wang、Z. Lv、Y. Chen、H. Haas，《6G 泛在信道模型的空时频统计特性完整研究》，*IEEE Transactions on Communications*，71(12)，7273—7287，2023。

[35] F. Euchner、M. Gauger，《CSI 数据集 dichasus-cf0x：工业环境中的分布式天线布置，第 1 天》，DaRUS，斯图加特大学，第 3 版，2022；DOI：10.18419/darus-2854。

[36] S. L. Salzberg，《比较分类器时应避免的陷阱及推荐方法》，*Data Mining and Knowledge Discovery*，1，317—328，1997。

[37] Z.-H. Zhou、M. Li，《采用共训练式算法的半监督回归》，*IEEE Transactions on Knowledge and Data Engineering*，19(11)，1479—1493，2007。

[38] W. Dai、X. Li、K.-T. Cheng，《基于不确定性一致性和贝叶斯神经网络变分模型集成的半监督深度回归》，AAAI，7304—7313，2023。

[39] J. Venna、S. Kaski，《非线性投影方法中的邻域保持：实验研究》，ICANN，柏林，485—491，2001。

[40] J. B. Kruskal，《通过优化非度量假设的拟合优度进行多维尺度分析》，*Psychometrika*，29(1)，1—27，1964。

[41] L. McInnes、J. Healy、J. Melville，《UMAP：用于降维的均匀流形近似与投影》，*Statistics*，1050，6，2018（书目信息按原文保留）。

[42] S. Taner、V. Palhares、C. Studer，《分布式 MIMO 下真实世界坐标中的信道图构建》，原文著录：*IEEE Transactions on Wireless Communications*，7286—7300，2024。

## 作者简介（原 PDF 第 15—16 页）

**Yuhang Pan。** 2024 年于东南大学获得信息工程学士学位，目前在该校攻读硕士学位，隶属东南大学移动通信国家重点实验室。研究兴趣包括基于信道图的定位与 6G 信道地图。

**Junling Li（IEEE 会员）。** 分别于 2013 年、2016 年和 2020 年获得天津大学学士学位、北京邮电大学硕士学位和加拿大滑铁卢大学电子与计算机工程博士学位。2020—2022 年在深圳人工智能与机器人研究院、滑铁卢大学、香港中文大学（深圳）联合开展博士后研究。现任东南大学移动通信国家重点实验室副教授。研究兴趣包括数字孪生、信道建模、博弈论及基于机器学习的信道预测。曾获 IEEE ICCC 2019、ICCT 2023 和 ICC 2025 最佳论文奖。

**Yang Wu（武阳，IEEE 学生会员）。** 2022 年于南京师范大学获得工学学士学位，2025 年于东南大学获得信息与通信工程硕士学位。研究兴趣包括基于机器学习的室内定位、6G 信道测量、特性分析与建模。

**Jianghan Ji。** 2023 年于东南大学获得信息工程学士学位，目前在东南大学移动通信国家重点实验室攻读硕士学位。研究兴趣包括信道估计和信道地图构建。

**Chen Huang（IEEE 会员）。** 2021 年于北京交通大学获得博士学位。2018—2020 年在美国南加州大学及比利时鲁汶天主教大学访问。2021 年 4 月至 2023 年 4 月在紫金山实验室泛在通信研究中心和东南大学移动通信国家重点实验室开展博士后研究；2023 年 4 月起担任紫金山实验室副研究员，并担任东南大学移动通信国家重点实验室校外导师。已发表或合作发表一本书的章节、80 余篇期刊及会议论文，拥有 17 项专利。研究兴趣包括 6G 信道测量、特性分析与建模、基于机器学习的信道预测及定位。担任 IEEE GLOBECOM、ICC、VTC 等会议技术程序委员会委员，入选中国科协青年人才托举工程、江苏省“333”高层次人才培养工程及优秀博士后项目；曾五次获得最佳论文奖，分别来自 IEEE ICC 2025、IEEE/CIC ICCC 2024、IEEE ICCT 2023、WCSP 2018、IEEE/CIC ICCC 2018。担任 AI 信道建模子组和 IEEE P1499 标准工作组主席，并任 *IEEE Transactions on Vehicular Technology* 副编辑。

**Cheng-Xiang Wang（IEEE Fellow）。** 1997 年和 2000 年在山东大学分别获得通信与信息系统理学学士及工学硕士学位，2004 年在丹麦奥尔堡大学获得无线通信博士学位。2000—2001 年任汉堡工业大学研究助理，2001—2005 年任挪威阿格德大学研究员，2004 年曾访问西门子移动电话部门。2005—2018 年任职于英国赫瑞瓦特大学，并于 2011 年晋升教授。2018 年起任东南大学教授，2020 年 12 月和 2025 年 4 月先后担任信息科学与工程学院执行院长、院长；原文发表时任东南大学副校长，亦为紫金山实验室教授。已出版 4 本专著、3 篇著作章节，并在学术期刊和会议发表 730 余篇论文，其中 IEEE 期刊和杂志论文 290 余篇、高被引论文 33 篇；获授权发明专利 50 余项（含 3 项美国专利），在国际会议作 40 次受邀大会报告及 24 次教程报告。研究兴趣包括无线信道测量与建模、6G/B6G 泛在智能连接网络和电磁信息论。

王承祥于 2019—2025 年担任 *IEEE Transactions on Wireless Communications* 执行编委会委员。他是欧洲科学院、欧洲科学与艺术院成员，英国爱丁堡皇家学会、IET 及中国通信学会会士；2019—2020 年任 IEEE 通信学会杰出讲师，2017—2020 年及 2025 年入选科睿唯安全球高被引科学家。曾获 2024 年 IEEE Neal Shepherd Memorial 最佳传播论文奖和国际会议 20 项最佳论文奖，担任 30 余次国际会议的技术程序委员会主席或大会主席，并担任 16 种以上国际期刊的编辑，包括 *IEEE Transactions on Wireless Communications*（2007—2009）、*IEEE Transactions on Vehicular Technology*（2011—2017）及 *IEEE Transactions on Communications*（2015—2017）。也曾担任 *IEEE Journal on Selected Areas in Communications*、*IEEE Transactions on Big Data* 与 *IEEE Transactions on Cognitive Communications and Networking* 的客座编辑。

**校对状态：** 中文正文及参考文献题名已覆盖。部分图中文字、表格及长公式仍需与原始 PDF 逐式校核，尚未计入全文质量验收。

{% endraw %}
