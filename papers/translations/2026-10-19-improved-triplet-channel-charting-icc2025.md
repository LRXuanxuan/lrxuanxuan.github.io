---
layout: page
title: "利用协方差特征改进 Triplet 信道图定位算法｜中文全文译稿"
permalink: /papers/translations/2026-10-19-improved-triplet-channel-charting-icc2025/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/330fe2a20548bae3/) · [IEEE DOI](https://doi.org/10.1109/ICC52391.2025.11160825)

# 利用协方差特征改进基于 Triplet 的信道图定位算法

**原题：** An Improved Triplet-Based Channel Charting Algorithm for Positioning via Covariance Feature  
**作者：** Yang Wu、Yuhang Pan、Jianghan Ji（共同第一作者），Cheng-Xiang Wang、Junling Li、Chen Huang  
**机构：** 东南大学移动通信全国重点实验室；紫金山实验室泛在通信研究中心。通讯作者：Cheng-Xiang Wang、Chen Huang。  
**出处：** IEEE International Conference on Communications（ICC 2025），SAC Machine Learning for Communications and Networking Track，第 3852—3857 页。DOI: 10.1109/ICC52391.2025.11160825。  
**译文范围：** 摘要、I—VI 节、式（1）—（14）、算法 1、图 1—6、表 I—III、致谢及参考文献 [1]—[19]。部分原文公式符号简写保留；原文没有给出的训练超参数不另行杜撰。

## 摘要

传统基于几何的定位方法（geometry-based positioning methods，GPMs）在非视距（non-line-of-sight，NLoS）环境下精度较低，而基于指纹的定位方法（fingerprint-based methods，FPMs）需要不断更新数据库，因此维护成本较高。作为新兴的无监督技术，信道图构建（channel charting）通过将信道状态信息（channel state information，CSI）映射到表示用户设备（user equipments，UEs）伪位置的低维虚拟空间，可以缓解上述问题。本文提出一种基于信道图的定位算法，采用基于协方差的信道特征及相应的非相似度度量，以增强对噪声和定时提前量（timing advance，TA）干扰的鲁棒性。此外，提出改进的 Triplet 神经网络算法，使信道图能够直接、准确地预测真实地理位置。通过射线追踪仿真，将所提方法与先进的信道图定位方法进行比较，验证了其有效性和优越性。

**关键词：** 信道图构建；定位；协方差特征；基于 Triplet 的神经网络算法。

## I. 引言

随着 B5G/6G 研究发展，未来无线通信技术预计将支持扩展现实、无人机、智能驾驶等新兴应用；这些应用均要求高精度定位 [1]。当仅考虑收发端之间的视距（line-of-sight，LoS）路径时，GPM 能实现厘米级定位精度。但在复杂环境、尤其是室内环境中，LoS 条件往往难以维持。相比之下，FPM 即使在 NLoS 场景中也能实现可靠定位。FPM 使用信道测量或仿真建立信道指纹数据库，并将 UE 的信道数据与数据库条目比较，以估计位置 [2]。因此，FPM 需要成本较高的真实位置参考系统进行准确标注，环境变化还可能要求频繁更新数据库，增加部署与维护成本。

近年来，信道图构建作为一种替代定位技术受到关注，用于解决 FPM 的局限 [3]。它通过无监督学习，将高维 CSI 映射到低维虚拟坐标，在减少昂贵位置标签依赖的同时，有效刻画 UE 周围的空间几何关系。

信道图构建依赖无监督降维。奠基性工作 [4] 介绍了多种方法，可分为传统方法与深度神经网络（deep neural network，DNN）方法。传统方法包括主成分分析（principal component analysis，PCA）、Sammon 映射、多维尺度分析 [5] 和 Isomap [6]。DNN 更灵活，也更擅长捕获高维数据中的复杂非线性关系。自编码器（autoencoder，AE）不需要显式的非相似度度量即可降维，而孪生网络（Siamese-based DNN）使用此类度量学习有意义的表示 [7]—[10]。不过，这两类方法仍依赖高维空间中的欧氏距离，很难为高维向量之间的距离赋予明确的物理意义。为解决这一问题，文献 [11] 引入基于 Triplet 的 DNN，在低维空间中学习有意义的欧氏距离。

与 Siamese 一样，Triplet 也依赖非相似度度量。文献 [4] 使用 CSI 二阶矩之间的 Frobenius 距离；文献 [8] 引入基于信道冲激响应幅度和欧氏距离的度量；文献 [6] 利用 CSI 向量构造对小尺度衰落不敏感的度量；文献 [11] 提出基于时间戳绝对差值的度量，作为 CSI 度量的替代；文献 [12] 从 CSI 中估计多径参数，构造基于角度—时延轮廓（angle-delay profile，ADP）的度量。文献 [10] 结合 [6] 和 [12]，提出基于 ADP 和测地距离（geodesics）的 ADPG 度量，并进一步通过融合非相似度度量增强它。然而，实际环境中的低信噪比（signal-to-noise ratio，SNR）与 TA 干扰使这些 CSI 非相似度度量表现不佳。

一般而言，信道图构建利用不同 UE 之间信道特征的相关性，仅能表示 UE 之间的**相对位置**，不能直接得到绝对位置。使用少量已知锚点，文献 [7], [5], [13] 通过仿射变换将相对位置转化为绝对位置。文献 [9] 则采用混合方法，引入基于 AoA 或 ToA 的似然估计作为校正项，构建能够表示绝对位置的信道图。然而，这些方法增加了基本信道图框架的复杂度，精度仍不够理想。

因此，本文提出一种新型信道图定位算法，其主要贡献如下：

1. 提出改进的基于 Triplet 的信道图算法，以直接、准确地推断绝对地理位置。
2. 提出新型基于协方差的信道特征和非相似度度量，以克服低 SNR 与 TA 干扰。
3. 通过理论分析及仿真实验验证所提算法的有效性和优越性。

本文第二节介绍系统模型和评价指标；第三节推导协方差特征与非相似度度量；第四节描述改进的 Triplet 信道图算法；第五节给出实验及性能评价；第六节总结全文。

## II. 系统模型与评价指标

### A. 系统模型

考虑基站（base station，BS）配备 64 单元毫米波通信阵列的多输入多输出（multiple-input multiple-output，MIMO）系统。该阵列采用双极化设计，包括 8 列单极化单元，每列具有 4 个信道；相邻信道间水平间距为 $d_h=0.5\lambda$，垂直间距为 $d_v=2.0\lambda$，其中 $\lambda$ 为波长。

同时考虑工作于 3.5 GHz 频段的正交频分复用（orthogonal frequency-division multiplexing，OFDM）系统，子载波间隔为 30 kHz。由于使用 two-comb 探测参考信号（sounding reference signal，SRS）技术，SRS 资源元素（resource elements，REs）间的子载波间隔设置为 60 kHz。在 100 MHz 带宽内，SRS RE 原始数量为 1632。为降低数据处理负担，采用 4:1 降采样，使有效 SRS RE 数量降至 408，对应间隔增加到 240 kHz。

通过调整参数，文献 [14] 提出的 6G 泛在信道模型（6G pervasive channel model，6GPCM）可用于研究未来 6G 全频段、全场景信道 [15]—[17]。参照 6GPCM，定义频域 CSI 矩阵 $\mathbf H\in\mathbb C^{N_T\times N_R\times N_{\rm sub}}$，其中 $N_T$ 为 UE 发送 SRS 使用的端口数，本系统取 2；$N_R$ 为 BS 接收天线数；$N_{\rm sub}$ 为子载波数量。

*校对注：原文将基站阵列称为“毫米波通信阵列”，同时将 OFDM 工作频率设为 3.5 GHz；其“8 列、每列 4 信道”与“64 单元”的关系还涉及双极化计数。上述信息依原文译出，不自行修正系统参数。*

该系统使用的数据集由华为技术有限公司提供，通过射线追踪生成，包含一系列用于复现不同真实场景条件的仿真。每个场景中，多个 UE 位于一个 BS 的覆盖范围内。每个场景共有 20,000 个数据点，其中 500 个为锚点。全部已知锚点及目标 UE 位于同一扇区内，到 BS 的最大距离为 200 m。

### B. 评价指标

为评价信道特征的有效性和信道图质量，需要衡量这些特征能够在多大程度上保留真实 UE 位置的空间几何结构。本文采用两种常见的降维评价指标：连续性（continuity，CT）与可信度（trustworthiness，TW）[18]。它们分别衡量物理空间和信道图中的局部邻域关系能否得到保持。此外，定位任务还必须评价平均绝对误差（mean absolute error，MAE）。

#### 1）连续性

CT 衡量物理空间中的最近邻在多大程度上仍为信道图中的最近邻：

$$
{\rm CT}(K)=
1-\frac{2}{LK(2L-3K-1)}
\sum_{l=1}^{L}\sum_{i\in V_K^{(l)}}
\max\{0,\widehat r_{l,i}-K\}.
\tag{1}
$$

其中 $K$ 为最近邻个数，$L$ 为总数据点数；$\widehat r_{l,i}$ 是数据点 $l$ 的第 $i$ 个邻居在信道图中的邻居排序名次；$V_K^{(l)}$ 是物理空间中数据点 $l$ 的 $K$ 个最近邻的集合，即 $V_K^{(l)}=\{i\mid r_{l,i}\le K\}$；$r_{l,i}$ 为物理空间中的邻居名次。

#### 2）可信度

TW 衡量信道图保留局部邻域的能力，重点惩罚在图中错误出现的近邻：

$$
{\rm TW}(K)=
1-\frac{2}{LK(2L-3K-1)}
\sum_{l=1}^{L}\sum_{i\in U_K^{(l)}}
\max\{0,r_{l,i}-K\}.
\tag{2}
$$

其中 $U_K^{(l)}$ 为信道图中数据点 $l$ 的 $K$ 个最近邻集合，即 $U_K^{(l)}=\{i\mid\widehat r_{l,i}\le K\}$。CT、TW 均归一化到 $[0,1]$，越接近 1 表示性能越好。

#### 3）平均绝对误差

MAE 衡量预测值与实际观测值之间绝对差的均值，直观反映预测精度：

$$
{\rm MAE}=\frac1n\sum_{i=1}^{n}|y_i-\widehat y_i|.
\tag{3}
$$

其中 $n$ 为样本数，$y_i$ 为第 $i$ 个观测值，$\widehat y_i$ 为第 $i$ 个预测值。

## III. 协方差特征和非相似度度量

### A. 协方差特征

信道协方差矩阵（channel covariance matrix，CCM）刻画信道的二阶统计特性，尤其是 MIMO 系统不同天线之间的相关性。定义 $\mathbf R\in\mathbb C^{N_T\times N_R\times N_R}$，其元素为

$$
R(t,r,r')=
\frac1{N_{\rm sub}}\sum_{k=1}^{N_{\rm sub}}
H(t,r,f_k)H(t,r',f_k)^H.
\tag{4}
$$

其中 $t=1,\ldots,N_T$，$r,r'=1,\ldots,N_R$，$N_T$ 与 $N_R$ 分别为发射、接收天线数量，$f_k$ 是第 $k$ 个子载波频率，$(\cdot)^H$ 表示共轭转置。

与原始 CSI 相比，CCM 降低了特征维度，减少后续训练参数量并提升训练效率。此外，CCM 通过频域平均缓解小尺度衰落影响，提高鲁棒性。下面分析 CCM 抵抗噪声与 TA 干扰的能力。

#### 1）抗噪声

假设实际 CSI 为 $\widetilde{\mathbf H}=\mathbf H+\mathbf N$，$\mathbf N$ 为噪声矩阵，则对应 CCM 为

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
\end{aligned}\tag{5}
$$

其中 $\mathbb E[\cdot]$ 为数学期望。实际通信场景通常将噪声建模为白高斯噪声（white Gaussian noise，WGN），假定噪声与信道不相关，即 $\mathbb E[\mathbf H\mathbf N^H]=\mathbb E[\mathbf N\mathbf H^H]=0$。因此

$$
\widetilde{\mathbf R}
=\mathbb E[\mathbf H\mathbf H^H]+\mathbb E[\mathbf N\mathbf N^H]
=\mathbf R+\mathbf R_N.
\tag{6}
$$

$\mathbf R_N$ 为噪声的协方差矩阵。对 WGN 而言，

$$
\mathbf R_N=\sigma^2\mathbf I,
\tag{7}
$$

其中 $\sigma^2$ 是噪声方差。由此，在 CSI 含噪时，即便处于低 SNR 场景，也可以通过协方差计算将噪声协方差与信道协方差分离。

#### 2）抗 TA 干扰

为了确保不同 UE 的上行信号在 BS 循环前缀范围内对齐，BS 向 UE 发送 TA 命令，令其使用适当的 TA 发射上行信号。受 TA 影响，信号在时域中产生整体时延，在频域中对应相位旋转：

$$
\widehat H(\cdot,\cdot,f_k)
=H(\cdot,\cdot,f_k)e^{-j2\pi f_k\Delta\tau},
\tag{8}
$$

其中 $\Delta\tau$ 表示 TA。将式（8）代入式（4）：

$$
\begin{aligned}
\widehat R(t,r,r')
&=\frac1{N_{\rm sub}}\sum_k\widehat H(t,r,f_k)
\widehat H(t,r',f_k)^H\\
&=\frac1{N_{\rm sub}}\sum_k
H(t,r,f_k)e^{-j2\pi f_k\Delta\tau}
H(t,r',f_k)^He^{j2\pi f_k\Delta\tau}\\
&=\frac1{N_{\rm sub}}\sum_k H(t,r,f_k)H(t,r',f_k)^H
=R(t,r,r').
\end{aligned}\tag{9}
$$

因此，在接收天线维度计算 CCM 不受 TA 影响。

进一步地，对 $\mathbf R$ 中由 $m,n$ 索引的两个接收天线空间维度执行二维傅里叶变换 [19]。天线的对偶空间通常称为波束域，以 $z$ 索引天顶波束、$a$ 索引方位波束：

$$
F(\cdot,z,a)=\mathcal F_{m,n}\{R(\cdot,m,n)\}.
\tag{10}
$$

该变换提高了角度分辨率，并与下一节的 Triplet DNN 结构相兼容。本文将 $\mathbf F$ 作为最终数据集输入特征，称之为 **CovBeam**。使用 TW 与 CT 评价 CovBeam 的效果，如表 I 所示。可以看到，即使存在噪声和 TA 干扰，CovBeam 仍表现较好，并且与真实坐标空间保持较高的一致性。

**表 I　不同信道特征的 TW 与 CT**

| 信道特征 | TW | CT |
|---|---:|---:|
| CSI | 0.8338 | 0.7127 |
| 含噪 CSI | 0.7933 | 0.6889 |
| 含噪 CovBeam | **0.8999** | **0.8906** |

### B. 基于协方差的余弦相似度

余弦相似度通过比较两个特征矩阵的方向来衡量相似性，重点关注方向是否一致，而不是绝对幅值的差别。对于 CovBeam 矩阵，尤其在其变换到角度域后，可以使用余弦相似度评价不同位置的信道特征相似程度。基于文献 [6] 和 [10]，本文提出基于协方差的余弦相似度（covariance-based cosine similarity，CCS）作为新型非相似度度量。对于位置 $i,j$，按原文式（11）的归一化内积形式，可写为

$$
d_{\rm CCS}^{i,j}
=\sum_{t=1}^{N_T}
\left(1-
\frac{\bigl|\langle\mathbf F_t^{(i)},\mathbf F_t^{(j)}\rangle\bigr|^2}
{\|\mathbf F_t^{(i)}\|_F^2\,
 \|\mathbf F_t^{(j)}\|_F^2}\right).
\tag{11}
$$

其中 $\mathbf F^{(i)}$、$\mathbf F^{(j)}$ 为两个位置的 CovBeam 特征，$\langle\cdot,\cdot\rangle$ 表示对应元素的共轭内积，$\|\cdot\|_F$ 为 Frobenius 范数。原文式（11）将归一化分子、分母分别展开为接收天线索引上的求和式；这里以等价的矩阵内积记法排版。

式（11）生成的信道图通常能够保留局部邻域关系。然而，为了有效定位，信道图还必须准确反映环境的**全局**几何结构 [8]。因此，需要扩展 CCS，构造结合测地距离的 CCS（CCS with geodesics，CCSG）。

首先利用式（11）计算任意两个数据点之间的非相似度 $d$，将所有值汇总为距离矩阵 $\mathbf D$；随后根据 $\mathbf D$ 构建 $k$ 近邻图 $\mathcal G$，设 $k=10$。最后，通过 Dijkstra 最短路径算法计算全局非相似度，并汇总得到全局距离矩阵 $\mathbf D_{\rm geo}$。

从 $\mathbf D_{\rm geo}$ 中随机选取一个数据点，计算它与所有其他数据点之间的 CCSG；再计算其真实坐标与其他数据点坐标之间的欧氏距离，如图 1 所示。结果表明，CCSG 能有效捕获数据点之间的相对位置关系。

**图 1.** 距离的空间分布：（a）CCSG 计算的距离；（b）真实坐标之间的欧氏距离。

## IV. 基于 Triplet 的信道图构建算法

### A. 基于 Triplet 的 DNN 算法

Triplet 是一种用于学习非相似度度量的 DNN 结构，其主要目标是将样本映射到某种表示空间，使相似样本彼此靠近，不相似样本彼此远离。Triplet 使用三元组：锚样本（anchor）、正样本（与锚样本同类）和负样本（与锚样本不同类）。三个分支通常共享网络架构与权重，使不同样本被一致地映射到同一表示空间。因此，三元组选择是 Triplet 的重要环节。本文设计了结构清晰、效率较高的三元组选择算法，见算法 1。

图 2 所示 Triplet 架构首先包含四层卷积神经网络（convolutional neural network，CNN）。输入通过一条捷径连接，直接连接到第一层 CNN 输出。卷积层之后接五层全连接层，用于生成信道图。网络使用批归一化确保稳定性，激活函数为高斯误差线性单元（Gaussian error linear unit，GELU），提供平滑的非线性。

**算法 1　三元组选择**

输入：距离矩阵 $\mathbf D$、全局测地距离矩阵 $\mathbf D_{\rm geo}$。输出：三元组集合 $\mathcal T$。

1. 从数据集 $\mathcal D$ 中以均匀概率随机选择锚样本 $i$。
2. 定义 $i$ 的邻近样本集合 $\mathcal N_q^{(i)}=\{l\mid d_{i,l}<d_q^{(i)}\}$，其中 $d_q^{(i)}$ 是所有 CCSG 非相似度中的 $q$ 分位数，$q$ 随训练轮次增加而减小。
3. 定义 $i$ 的非相邻样本集合 $\widetilde{\mathcal N}_{q'}^{(i)}=\{l\mid d_{i,l}>d_{q'}^{(i)}\}$，其中 $q'=1-q$。
4. 分别从 $\mathcal N_q^{(i)}$ 和 $\widetilde{\mathcal N}_{q'}^{(i)}$ 中均匀随机选择正样本 $j$、负样本 $k$。
5. 重复步骤 1—4，直到收集足够数量的 $(i,j,k)$，组成 $\mathcal T$。

Triplet 损失函数为

$$
\begin{aligned}
{\rm loss}_{\rm tri}
=\frac1{|\mathcal T|}
\sum_{(i,j,k)\in\mathcal T}
\Bigl(&\|f_\theta(\mathbf x_i)-f_\theta(\mathbf x_j)\|\\
&-\|f_\theta(\mathbf x_i)-f_\theta(\mathbf x_k)\|+M\Bigr)_+.
\end{aligned}\tag{12}
$$

其中，$f_\theta(\cdot)$ 是 DNN 的映射函数，将输入数据映射到信道图；$(x)_+=\max(x,0)$；$M$ 是用于设置三元组间隔的超参数（margin），使损失不会过早变为零。

**图 2.** DNN 网络架构：卷积层、残差捷径连接及全连接层组成 Triplet 表示提取网络。

### B. 改进的信道图定位方法

信道图降维过程本质上是无监督的，仅捕获数据点之间的相对位置。然而，准确定位要求信道图能够反映绝对位置信息。因此，本文在 Triplet 信道图算法中加入半监督学习。具体而言，在原有五层全连接层之后再增加两层全连接层，以生成预测的绝对位置坐标。同时，在损失函数中增加监督项，引导模型学习绝对位置信息：

$$
{\rm loss}=\alpha\,{\rm loss}_{\rm semi}
+(1-\alpha)\,{\rm loss}_{\rm tri}.
\tag{13}
$$

其中 $\alpha$ 为监督项权重，随训练轮次从 0.1 增加到 0.9；监督损失为

$$
{\rm loss}_{\rm semi}
=\frac1{|\mathcal P|}
\sum_{p\in\mathcal P}\|g_\theta(\mathbf x_p)-\mathbf y_p\|.
\tag{14}
$$

其中，$\mathcal P$ 是具有真实位置标注的锚点集合；$g_\theta(\cdot)$ 将输入映射到预测的绝对坐标；$\mathbf y_p$ 为锚点真实坐标。

尽管已经使用全局测地非相似度，它仍不能完全准确地反映数据点的空间分布。为解决这一问题，本文提出更新 $\mathbf D_{\rm geo}$ 的方法：先计算训练期间生成坐标之间的欧氏距离矩阵 $\mathbf D_{\rm distance}$，再引入区域约束，将 $\mathbf D_{\rm distance}$ 与 $\mathbf D_{\rm geo}$ 融合。经过 2—3 次重复，定位性能趋于收敛。实验结果表明，这项改进能够使定位误差降低约 3 m。

完整算法框架见图 3。

**图 3.** 所提信道图定位算法框架。输入 CSI 后，先计算 CCM 并变换至波束域，得到 CovBeam；随后构造 CCS、CCSG 和 $\mathbf D_{\rm geo}$，选取 Triplet 样本，利用共享权重 DNN 以及监督锚点训练；最后根据预测坐标更新 $\mathbf D_{\rm geo}$ 2—3 次，输出预测位置。

## V. 实验结果

### A. CovBeam 与 CCSG 的性能评价

图 4 与表 II 的结果表明，CovBeam 具有最高的定位精度。含噪条件下，与 CSI + ADPG 相比，CovBeam + CCSG 的 MAE 从 17.6940 m 降至 11.0853 m，降低 36.8%。误差为 10 m 时，CovBeam + CCSG 的累计概率超过 70%，而 CSI + ADPG 约为 40%，说明前者在保持特征空间几何结构方面更有优势。CovBeam 的 CT 与 TW 在噪声条件下分别仅降低约 0.5% 与 0.6%，进一步说明这种特征对噪声具有鲁棒性，能够保持关键的几何关系和邻域结构。

**表 II　不同信道特征与非相似度度量的定位性能**

| 特征及度量 | CT | TW | MAE (m) |
|---|---:|---:|---:|
| CSI + ADPG | 0.9715 | 0.9698 | 10.6630 |
| 含噪 CSI + ADPG | 0.9693 | 0.9662 | 17.6940 |
| CovBeam + CCSG | **0.9786** | **0.9768** | **10.1176** |
| 含噪 CovBeam + CCSG | 0.9722 | 0.9706 | 11.0853 |

**图 4.** 不同特征及其非相似度度量对应的定位误差 CDF，比较有噪声与无噪声条件下的 CSI + ADPG 和 CovBeam + CCSG。

### B. 改进的 Triplet 信道图定位算法的性能评价

选择 PCA、AE [4]、Siamese [10] 以及传统 Triplet [11] 四种定位方法作为基线，以验证所提改进 Triplet 算法的精度和鲁棒性。根据真实坐标将数据点划分为四个相邻区域，再使用各算法构建信道图，如图 5 所示。

在信道图定位任务中，Triplet 的预测精度优于 PCA、AE 和 Siamese。虽然 Siamese 相较 PCA 和 AE 有所改善，但不同类别之间仍存在重叠。传统 Triplet 能较为清晰地分离不同类别，尤其是蓝色和绿色区域，不过仍不能完全保持数据点的真实形状。相比之下，本文改进的 Triplet 所构建的信道图更接近真实地图的空间分布，同时保留了邻域关系和形状。

**图 5.** 不同算法预测位置的分布：（a）PCA；（b）自编码器；（c）Siamese；（d）传统 Triplet；（e）改进 Triplet；（f）真实位置。

进一步比较各算法定位性能，结果见图 6 与表 III。改进 Triplet 的 CT 与 TW 分别为 0.9722 与 0.9706，相较传统 Triplet 与 PCA 的相关结果，文中报告了约 6.6% 与 10% 的改善。这说明改进 Triplet 能更好地保持低维空间中的原始数据结构，在复杂环境中更准确地映射 UE 邻域关系，提高信道图几何结构的稳定性。这种提升主要归功于经过优化的距离度量和损失函数，使模型更准确地捕获数据中的几何关系。

此外，改进 Triplet 的 MAE 为 11.0853 m，与传统 Triplet、Siamese、AE 和 PCA 相比分别降低约 68%、72%、75% 和 75%。这验证了改进措施在降低定位误差方面的有效性，使算法能在需要准确映射邻域关系的复杂环境中更加可靠地工作。

**图 6.** 不同算法的定位误差 CDF：改进 Triplet、传统 Triplet、Siamese、AE 与 PCA。

**表 III　不同算法的定位性能**

| 算法 | CT | TW | MAE (m) |
|---|---:|---:|---:|
| PCA | 0.8870 | 0.8646 | 43.9478 |
| 自编码器 | 0.8712 | 0.8700 | 43.8383 |
| Siamese | 0.9110 | 0.8875 | 40.0683 |
| 传统 Triplet | 0.9402 | 0.9185 | 35.0518 |
| **改进 Triplet（本文）** | **0.9722** | **0.9706** | **11.0853** |

## VI. 结论

本文提出一种信道图辅助定位算法，利用基于协方差的信道特征及改进的 Triplet 算法。所提协方差特征与全局 CCS 对噪声具有较强抵抗能力，并能有效抑制 TA 干扰，从而提高信道图的鲁棒性，使其更适合真实部署。此外，实验结果表明，所提 Triplet 信道图算法能够准确预测绝对地理位置，性能优于其他基于信道图的定位算法。因此，该算法不仅提高定位精度，也增强了对实际信道损伤的适应能力，有望成为未来定位系统的可行解决方案。

## 致谢

本研究得到国家自然科学基金（62394290、62394291）、中央高校基本科研业务费（2242022k60006）、东南大学移动通信全国重点实验室研究基金（2025A05）、中国科协青年人才托举工程（2022QNRC001）和东南大学科研启动基金（RF1028623062）的支持。

## 参考文献

下列条目保留原文编号、作者、发表来源和书目信息，同时翻译论文标题。

[1] C.-X. Wang, X. You, X. Gao 等，《通向 6G：愿景、需求、关键技术与试验平台》，*IEEE Communications Surveys & Tutorials*，25(2)，905—974，2023。原题：On the road to 6G: Visions, requirements, key technologies and testbeds.

[2] Y. Wu, Y. Wang, J. Huang, C.-X. Wang, C. Huang，《基于加权随机森林的 6G 室内通信定位算法》，*IEEE VTC 2022-Fall*，1—6，2022。原题：A weighted random forest based positioning algorithm for 6G indoor communications.

[3] P. Ferrand, M. Guillaud, C. Studer, O. Tirkkonen，《无线信道图构建：理论、实践与应用》，*IEEE Communications Magazine*，61(6)，124—130，2023。原题：Wireless channel charting: Theory, practice, and applications.

[4] C. Studer, S. Medjkouh, E. Gönültaş, T. Goldstein, O. Tirkkonen，《信道图构建：利用 CSI 在无线电环境中定位用户》，*IEEE Access*，6，47682—47698，2018。原题：Channel charting: Locating users within the radio environment using channel state information.

[5] J. Pihlajasalo, M. Koivisto, J. Talvitie, S. Ali-Loytty, M. Valkama，《用于 5G 网络的无监督多点信道图绝对定位》，*VTC 2020-Fall*，1—5，2020。原题：Absolute positioning with unsupervised multipoint channel charting for 5G networks.

[6] L. Le Magoarou，《通过相位不敏感距离计算高效构建信道图》，*IEEE Wireless Communications Letters*，10(12)，2634—2638，2021。原题：Efficient channel charting via phase-insensitive distance computation.

[7] E. Lei, O. Castañeda, O. Tirkkonen, T. Goldstein, C. Studer，《用于无线定位和信道图构建的孪生神经网络》，*ACSSC 2019*，200—207，2019。原题：Siamese neural networks for wireless positioning and channel charting.

[8] M. Stahlke, G. Yammine, T. Feigl, B. M. Eskofier, C. Mutschler，《利用鲁棒全局信道图进行室内定位：基于时间—距离的方法》，*IEEE Transactions on Machine Learning in Communications and Networking*，1，3—17，2023。原题：Indoor localization with robust global channel charting: A time-distance-based approach.

[9] F. Euchner, P. Stephan, S. ten Brink，《利用经典无线源定位技术增强信道图构建》，*ACSSC 2022*，1641—1647，2023。原题：Augmenting channel charting with classical wireless source localization techniques.

[10] P. Stephan, F. Euchner, S. ten Brink，《用于信道图构建的角度—时延轮廓度量和时间戳辅助非相似度度量》，*IEEE Transactions on Communications*，72(9)，5611—5625，2024。原题：Angle-delay profile-based and timestamp-aided dissimilarity metrics for channel charting.

[11] P. Ferrand, A. Decurninge, L. G. Ordóñez, M. Guillaud，《基于 Triplet 的无线信道图构建：网络架构与实验》，*IEEE Journal on Selected Areas in Communications*，39(8)，2361—2373，2021。原题：Triplet-based wireless channel charting: Architecture and experiments.

[12] H. Al-Tous, P. Kazemi, C. Studer, O. Tirkkonen，《采用角度—时延—功率轮廓特征与推土机距离的信道图构建》，*ACSSC 2022*，1195—1201，2022。原题：Channel charting with angle-delay-power-profile features and earth-mover distance.

[13] S. Taner, V. Palhares, C. Studer，《真实世界坐标下的信道图构建》，*IEEE Globecom 2023*，3940—3946，2023。原题：Channel charting in real-world coordinates.

[14] C.-X. Wang, J. Huang, H. Wang, X. Gao, X.-H. You, Y. Hao，《6G 无线信道测量与模型：趋势与挑战》，*IEEE Vehicular Technology Magazine*，15(4)，22—32，2020。原题：6G wireless channel measurements and models: Trends and challenges.

[15] C.-X. Wang, Z. Lv, X. Gao, X.-H. You, Y. Hao, H. Haas，《全频段全场景的泛在信道建模理论及其在 6G GBSM 中的应用》，*IEEE Transactions on Vehicular Technology*，71(9)，9159—9173，2022。原题：Pervasive channel modeling theory and applications to 6G GBSMs for all frequency bands and all scenarios.

[16] C.-X. Wang, Z. Lv, Y. Chen, H. Haas，《6G 泛在信道模型的空时频统计特性完整研究》，*IEEE Transactions on Communications*，71(12)，7273—7287，2023。原题：A complete study of space-time-frequency statistical properties of the 6G pervasive channel model.

[17] S. Chen, J. Zhang, E. Björnson, J. Zhang, B. Ai，《面向可扩展无蜂窝大规模 MIMO 系统的结构化海量接入》，*IEEE Journal on Selected Areas in Communications*，39(4)，1086—1100，2021。原题：Structured massive access for scalable cell-free massive MIMO systems.

[18] J. Venna, S. Kaski，《非线性投影方法中的邻域保持：实验研究》，*ICANN 2001*，485—491，2001。原题：Neighborhood preservation in nonlinear projection methods: An experimental study.

[19] P. Ferrand, A. Decurninge, M. Guillaud，《从信道估计进行基于 DNN 的定位：特征设计和实验结果》，*IEEE Globecom 2020*，1—6，2020。原题：DNN-based localization from channel estimates: Feature design and experimental results.

{% endraw %}
