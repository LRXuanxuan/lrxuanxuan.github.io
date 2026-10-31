---
layout: page
title: "STAR：面向扩散光场重建的结构感知测试时自适应｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-19747-star-structure-aware-test-time-adaptation-for-diffusion-based-light-fi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/fc3db27e4c1cac09/) · [原文 arXiv](https://arxiv.org/abs/2609.19747) · [全部目录](/papers/catalog/)

# STAR：面向扩散光场重建的结构感知测试时自适应

**原题：** STAR: Structure-Aware Test-Time Adaptation for Diffusion-Based Light Field Reconstruction  
**作者：** Wontae Choi$^{1,\star}$、Ki Ryum Moon$^{1,\star}$、Jae Young Lee$^{2}$、Hyung Sup Yun$^{2}$、Il Yong Chun$^{1,2,\dagger}$  
**单位：** $^{1}$ 成均馆大学（SKKU）人工智能系（韩国水原）；$^{2}$ 成均馆大学电气与计算机工程系。$^{\star}$ 共同第一作者；$^{\dagger}$ 通讯作者。作者邮箱：wontae1998@g.skku.edu、jij7401@g.skku.edu、ljy2509@g.skku.edu、hyungsup0225@g.skku.edu、iychun@skku.edu。  
**版本：** arXiv:2609.19747v1（cs.CV），2026 年 9 月 17 日；原文 5 页（含图 1—3、表 1—2、参考文献 [1]—[29]）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 1—5 节（含 2.1—2.2.2、3.1—3.3、4.1—4.3）、致谢、图 1—3 中文图注、表 1—2 逐格转录、参考文献 [1]—[29]（英文原条目，按原编号）均按原文结构录入；逐句逐式终校未做。

## 摘要

从有限且含噪的焦栈（focal stack, FS）测量重构光场（light field, LF）是一个高度不适定的逆问题。虽然对给定光学装置而言，LF 到 FS 的成像几何是固定的，但 LF 的空域—角度结构——包括视图内空间细节、跨视图角度依赖关系与视图间视差——随场景而变。因此，一个固定的预训练先验可能无法最优地刻画每个测试 LF 的空域—角度结构。我们提出**面向扩散光场重构的结构感知测试时自适应（Structure-aware Test-time Adaptation for diffusion-based light field Reconstruction, STAR）**，这是首个用于从 FS 重构 LF 的测试时自适应框架。对每个测试 LF，STAR 冻结预训练的扩散先验，并把三个轻量适配器拟合到观测 FS 上，以联合自适应 LF 空域—角度结构的三个组成部分。STAR 在两焦平面与三焦平面两种设定下都优于现有最先进方法，且推理时间比采用测试时参数更新的方法更短。

**索引词：** 测试时自适应、扩散模型、光场重构、焦栈、逆问题。

## 1. 引言

光场（LF）成像已成为计算摄影中的基础技术，因为它同时记录光线的空间与方向信息。LF 定义为包含两个空间维与两个角度维的四维（4D）函数 [1]。这种表示捕获了传统相机无法获得的角度信息——传统相机只能从单一视点记录空间信息。LF 摄影对数字重聚焦、深度估计与新颖视点合成等多样化的计算成像/视觉任务都有用 [2–4]。

4D LF 一般可通过专用硬件直接采集，或从单幅图像 [5] 或焦栈（FS）[6–13] 间接重构。直接采集依赖相机阵列或光场相机 [14]、[15]，但要么昂贵，要么受空间分辨率与角度分辨率之间的折中限制。从 FS 测量间接重构已受到越来越多关注 [6–13]、[16]，尤其是透明光电探测器使单次 FS 采集成为可能之后 [8]。然而，从 FS 重构 LF 是高度不适定的逆问题，因为相应系统矩阵高度欠定。

现有方法要么采用任务专用的重构网络，要么利用预训练扩散先验。FSNet [11] 通过序列网络估计深度以重构 LF；Momentum-Net [10] 是用于一般逆问题的迭代神经网络；Joint FDL [13] 通过展开一个带视图合成网络的优化来重构 LF。在基于扩散的方法中，DDLFRM [16] 针对过大的 LF 到 FS 系统矩阵引入一种可处理分解，以便用去噪扩散恢复模型（Denoising Diffusion Restoration Models, DDRM）[17] 高效重构。DDNM [18] 与 DAPS [19] 利用测量约束预训练扩散模型的采样过程。然而，这些方法在测试时都保持学习到的参数固定，因而不能使其模型自适应每个测试 LF 的空域—角度结构。

相反，另一类基于扩散的逆问题求解器在测试时优化模型参数 [20]、[21]。DDS2M [20] 是一种自监督测试时学习方法，对每个测量从零开始优化一个未训练网络。这虽然能在不使用外部训练数据的情况下实现样本特定重构，但计算代价高，且没有利用从 LF 数据学到的先验。DDIP [21] 则提供一个通用框架，在反向扩散过程中把预训练扩散模型拟合到每个测量。然而，对 LF 先验的测试时自适应引出一个更根本的问题：**哪些场景相关结构应被自适应，哪些共享知识应被保留？**

本文提出**面向扩散光场重构的结构感知测试时自适应（STAR）**，这是首个用于从有限且含噪 FS 测量重构 LF 的测试时自适应框架。我们的设计原则是：保持预训练 LF 主干冻结，同时通过轻量适配器自适应场景相关的空域—角度结构。对给定光学装置，LF 到 FS 成像算子固定，但其底层 LF 的空域—角度结构——包括视图内空间细节、跨视图角度依赖关系与视图间视差——随场景而变。作为扩散先验，我们提出**光场沙漏扩散 Transformer（Light Field Hourglass Diffusion Transformer, LF-HDiT）**：它在 HDiT 主干 [22] 上扩展了专门的角度注意力，并在 LF 数据上预训练。为重构每个测试 LF，STAR 保持 LF-HDiT 主干冻结，并把三个轻量适配器拟合到相应观测 FS：1) 用于视图内细节的**空间卷积适配器**；2) 用于跨视图依赖关系的**低秩角度适配器**；3) 通过极平面对极线图像（epipolar-plane-image, EPI）特征显式捕获空域—角度结构（含视图间视差）的**多域适配器**。数值实验表明，STAR 在两焦平面与三焦平面两种设定下都优于最先进（SOTA）的 LF 重构方法与基于扩散的逆问题求解器，同时推理速度比采用测试时参数优化的求解器更快。

## 2. 预备知识

### 2.1 基于焦栈的光场成像

从 LF 采集 FS 测量的过程可建模为

$$
\mathbf y=\mathbf A\mathbf x+\mathbf n,\qquad \mathbf A\triangleq\left[\mathbf A_{c,s}\right]_{c=1,\,s=1}^{C,\,S},\tag{1}
$$

其中 $\mathbf y=[\mathbf y_1^{\top},\ldots,\mathbf y_C^{\top}]^{\top}\in\mathbb R^{CN}$ 表示由 $C$ 个光电传感器采集的向量化 FS 测量，$\mathbf x=[\mathbf x_1^{\top},\ldots,\mathbf x_S^{\top}]^{\top}\in\mathbb R^{SN}$ 表示由 $S$ 幅子孔径图像（sub-aperture image, SAI）堆叠而成的 LF，$N$ 表示每幅光电传感器图像（或每幅 SAI）的像素数。SAI 由角度坐标 $(u,v)\in\{1,\ldots,U\}\times\{1,\ldots,V\}$ 索引，共 $S=UV$ 幅 SAI，每幅空间分辨率为 $H\times W$，故 $N=HW$ 个像素。已知的成像系统矩阵 $\mathbf A\in\mathbb R^{CN\times SN}$ 建模从 LF 到 FS 测量的形成过程，由子矩阵 $\{\mathbf A_{c,s}\in\mathbb R^{N\times N}:c=1,\ldots,C,\ s=1,\ldots,S\}$ 组成。每个 $\mathbf A_{c,s}$ 是二维（2D）卷积矩阵，其核刻画从第 $s$ 幅 SAI 到第 $c$ 个传感器平面的光学传递 [7]、[8]、[16]。光电传感器的电子噪声建模为加性白高斯噪声 $\mathbf n\sim\mathcal N(\mathbf 0,\sigma_n^2\mathbf I_{CN})$，其中 $\sigma_n^2$ 表示噪声方差。给定 FS 测量 $\mathbf y$，LF 重构的目标是通过反演（1）中的前向模型恢复 $\mathbf x$。

### 2.2 用于逆问题的扩散模型

#### 2.2.1 去噪扩散概率模型（DDPM）

DDPM [23] 是由固定的前向扩散过程与可学习的反向扩散过程组成的隐变量生成模型，二者都以马尔可夫链表述。前向过程迭代地向原始样本 $\mathbf x_0$ 加入各向同性高斯噪声，使 $\mathbf x_T$ 近似服从标准高斯分布：$q(\mathbf x_{1:T}\mid\mathbf x_0)\triangleq\prod_{t=1}^{T}q(\mathbf x_t\mid\mathbf x_{t-1})$，且 $q(\mathbf x_t\mid\mathbf x_{t-1})\triangleq\mathcal N(\mathbf x_t;\sqrt{\alpha_t}\mathbf x_{t-1},(1-\alpha_t)\mathbf I)$，其中 $\mathbf x_t$ 表示第 $t$ 步的受污染样本，$\alpha_t\in(0,1)$ 是由噪声调度确定的系数。反向扩散过程定义为 $p_\theta(\mathbf x_{0:T})\triangleq p(\mathbf x_T)\prod_{t=1}^{T}p_\theta(\mathbf x_{t-1}\mid\mathbf x_t)$，其中 $p(\mathbf x_T)=\mathcal N(\mathbf 0,\mathbf I)$，$p_\theta(\mathbf x_{t-1}\mid\mathbf x_t)\triangleq\mathcal N(\mathbf x_{t-1};\boldsymbol\mu_\theta(\mathbf x_t,t),\boldsymbol\Sigma_\theta(\mathbf x_t,t))$，由参数为 $\theta$ 的神经网络参数化。实践中，该网络用如下简化目标训练以预测噪声 $\boldsymbol\epsilon_\theta(\mathbf x_t,t)$ [23]：

$$
\mathcal L_{\mathrm{simple}}=\mathbb E_{t,\mathbf x_0,\boldsymbol\epsilon}\left[\left\|\boldsymbol\epsilon-\boldsymbol\epsilon_\theta(\mathbf x_t,t)\right\|_2^2\right],\qquad \boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I).
$$

#### 2.2.2 采用（1）中 $\mathbf A$ 的可处理分解的 DDRM

DDRM [17] 是用于图像恢复的通用线性逆问题求解器，它以预训练 DDPM 作为学习到的先验。其条件生成过程为 $p_\theta(\mathbf x_{0:T}\mid\mathbf y)\triangleq p_\theta^{(T)}(\mathbf x_T\mid\mathbf y)\prod_{t=0}^{T-1}p_\theta^{(t)}(\mathbf x_t\mid\mathbf x_{t+1},\mathbf y)$，其中 $\mathbf y$ 是为该过程提供条件的测量向量，$\theta$ 为用 §2.2.1 的损失预训练的 DDPM [23] 参数。DDRM 在由系统矩阵 $\mathbf A$ 的奇异值分解（SVD）$\mathbf A=\mathbf U\boldsymbol\Sigma\mathbf V^{\top}$ 定义的光谱空间中执行恢复。$\mathbf x_t$ 与 $\mathbf y$ 都通过 $\bar{\mathbf x}_t=\mathbf V^{\top}\mathbf x_t$ 与 $\bar{\mathbf y}=\boldsymbol\Sigma^{\dagger}\mathbf U^{\top}\mathbf y$ [17] 变换到该共享空间，其中 $(\cdot)^{\dagger}$ 表示 Moore–Penrose 伪逆。对每个正奇异值，DDRM 把相应变换后的测量纳入去噪更新，其形式由谱域中的测量噪声与扩散噪声的相对水平决定。对零奇异值，测量在相应谱分量上不提供信息，DDRM 按 DDPM 执行无条件去噪。

在（1）中，直接计算 $\mathbf A$ 的 SVD 因其 $CN\times SN$ 的规模而不可行。因此我们采用 [16] 描述的可处理分解。在周期边界条件下，每个子矩阵 $\mathbf A_{c,s}$ 是块循环矩阵（其块亦为循环矩阵），因而可由二维离散 Fourier 变换对角化。适当的置换随后把完整 SVD 归约为 $N$ 个独立的 $C\times S$ 矩阵 SVD [16]。所得因子使 $\bar{\mathbf x}_t$ 与 $\bar{\mathbf y}$ 的计算可用于基于 DDRM 的（1）反演。

## 3. 方法

### 3.1 STAR 框架概览

图 1 给出 STAR 框架概览。STAR 由三部分组成：1) 作为扩散先验的**冻结 LF-HDiT 主干**；2) 针对每个测试 LF 的**轻量适配器**；3) 强制与 FS 测量一致的 **DDRM 更新**。在第 $t$ 步，LF-HDiT 从 $\mathbf x_t$ 预测 $\boldsymbol\epsilon_t$ 以产生干净 LF 估计 $\hat{\mathbf x}_{0\mid t}$，随后 DDRM 由 $\hat{\mathbf x}_{0\mid t}$ 与 FS 测量 $\mathbf y$、利用 §2.2.2 所述系统矩阵 $\mathbf A$ 的可处理分解计算 $\mathbf x_{t-1}$。

我们把每个 LF-HDiT 块设计为依次施加空间注意力、角度注意力与多层感知机（MLP），以建模 4D LF 的空域—角度结构。按分辨率层级不同，空间注意力在每个视图内的空间位置上执行多头邻域注意力或全局注意力；角度注意力在每个空间位置上跨视图执行多头自注意力；MLP 独立处理每个 token。为测试时自适应，我们用轻量适配器增强这些模块：面向空间注意力的**光场卷积适配器（Light Field Convolutional Adapter, LF-CA）**、面向角度注意力的**低秩适配（Low-Rank Adaptation, LoRA）**[24]，以及面向 MLP 的**光场多域适配器（Light Field Multi-domain Adapter, LF-MA）**。三个主干模块的预训练权重在自适应期间全部保持冻结。

在每个反向扩散步，STAR 用 $\mathbf x_{t-1}$ 作为自监督目标，仅更新适配器，从而逐步重构 4D LF。

### 3.2 面向 LF-HDiT 的结构感知适配器

#### 3.2.1 用 LF-CA 做空间适配

虽然预训练主干在测试场景间保持冻结，但每幅 SAI 内的空间细节随场景而变，这促使我们做显式考虑局部空间关系的自适应。LoRA 为这种自适应提供了一种参数高效的选项，但其对每个投影的低秩更新按 token 进行，不直接聚合相邻 token。为克服该局限，我们引入 LF-CA——在空间注意力中与每个冻结的 Q、K、V 投影并行的低秩卷积分支，以把每幅 SAI 内的相邻空间 token 纳入投影更新。如图 2(a) 所示，对角度坐标为 $(u,v)$ 的每幅 SAI，LF-CA 的输入 $\mathbf Z_{\mathrm{spa}}(u,v)\in\mathbb R^{H'W'\times D}$ 由 $D$ 维 patch token 组成，其中 $H'$ 与 $W'$ 分别表示沿每幅 SAI 垂直与水平方向的 patch 数。对每个投影 $m\in\{\mathrm{Q},\mathrm{K},\mathrm{V}\}$，LF-CA 计算

$$
\Delta\mathbf Z_{\mathrm{spa},m}(u,v)=\mathcal R^{-1}\left(\mathrm{Conv}^{1\times1,D}_{\mathrm{spa},m}\left(\mathrm{Conv}^{P\times P,R}_{\mathrm{spa},m}\left(\mathcal R\left(\mathbf Z_{\mathrm{spa}}(u,v)\right)\right)\right)\right),\tag{2}
$$

对所有 $(u,v)$ 成立，其中 $\mathcal R$ 把输入 patch-token 序列重排为 $H'\times W'\times D$ 的空间特征张量，$\mathcal R^{-1}$ 恢复原始 token 布局。卷积层 $\mathrm{Conv}^{P\times P,R}_{\mathrm{spa},m}$ 在每幅 SAI 内聚合 $P\times P$ 邻域 patch token 的特征，并把通道维从 $D$ 降到 $R$（$R\ll D$）；而 $\mathrm{Conv}^{1\times1,D}_{\mathrm{spa},m}$ 在每个 token 位置把所得 $R$ 维特征映射回 $D$ 维。对每幅 SAI $(u,v)$ 与每个投影 $m\in\{\mathrm{Q},\mathrm{K},\mathrm{V}\}$，我们把适配器输出加到相应冻结投影输出上：$\tilde{\mathbf Z}_{\mathrm{spa},m}(u,v)=\mathbf Z_{\mathrm{spa}}(u,v)\mathbf W_{\mathrm{spa},m}^{\top}+\Delta\mathbf Z_{\mathrm{spa},m}(u,v)$，其中 $\mathbf W_{\mathrm{spa},m}$ 是空间注意力中投影 $m$ 的冻结权重矩阵。

下面刻画 LF-CA 的低秩结构：

**命题 1（LF-CA 的低秩结构）.** 假设卷积层为线性，则（2）中的分支等价于一个 $P\times P$ 卷积层，其输入与输出通道数均为 $D$，且其展开核矩阵的秩至多为 $R$。

**证明.** 首先把输入与输出通道均为 $D$ 的 $P\times P$ 卷积层写成 $\mathbf O=\mathbf W\mathbf Z$，其中 $\mathbf W\in\mathbb R^{D\times DP^2}$ 是块矩阵，其第 $(o,i)$ 块是连接输入通道 $i$ 与输出通道 $o$ 的 $P\times P$ 核的转置向量化形式。$\mathbf Z\in\mathbb R^{DP^2\times H'W'}$ 的每一列堆叠某一输出空间位置上所有 $D$ 个通道的 $P\times P$ 输入 patch 向量化结果。因此 $\mathbf O\in\mathbb R^{D\times H'W'}$ 的每一列给出相应位置的 $D$ 维输出特征向量。

为把 $\mathbf W$ 的秩约束到至多 $R$（$R\ll D$），我们把它分解为 $\mathbf W=\mathbf W_2\mathbf W_1$，其中 $\mathbf W_2\in\mathbb R^{D\times R}$、$\mathbf W_1\in\mathbb R^{R\times DP^2}$。于是 $\mathbf O=\mathbf W_2(\mathbf W_1\mathbf Z)$。这里 $\mathbf W_1$ 对应 $\mathrm{Conv}^{P\times P,R}$，$\mathbf W_2$ 对应 $\mathrm{Conv}^{1\times1,D}$。二者顺序施加即实现（2），其等效核矩阵满足 $\operatorname{rank}(\mathbf W_2\mathbf W_1)\leq R$。$\square$

该分解把权重参数数量从 $D^2P^2$ 降至 $R(DP^2+D)$。当 $P=1$ 时，该分支退化为 LoRA [24] 的逐 token 低秩更新；因此 LF-CA 把这种更新推广到 $P>1$ 的空间邻域。

#### 3.2.2 用 LoRA 做角度适配

跨视图角度依赖关系随场景而变。由于角度注意力已通过全局自注意力连接所有视图，我们通过在每个冻结的 Q、K、V 投影旁并行加入 LoRA [24] 来自适应这些依赖关系。如图 2(b) 所示，在每个空间 token 位置 $(h',w')$，输入 $\mathbf Z_{\mathrm{ang}}(h',w')\in\mathbb R^{UV\times D}$ 包含每个视图一个 $D$ 维 token。对每个 $m\in\{\mathrm{Q},\mathrm{K},\mathrm{V}\}$，LoRA 计算 $\Delta\mathbf Z_{\mathrm{ang},m}(h',w')=\mathbf Z_{\mathrm{ang}}(h',w')\mathbf W_{1,m}^{\top}\mathbf W_{2,m}^{\top}$（$\forall(h',w')$），其中 $\mathbf W_{1,m}\in\mathbb R^{R\times D}$、$\mathbf W_{2,m}\in\mathbb R^{D\times R}$。我们把该更新加到冻结投影输出上：$\tilde{\mathbf Z}_{\mathrm{ang},m}(h',w')=\mathbf Z_{\mathrm{ang}}(h',w')\mathbf W_{\mathrm{ang},m}^{\top}+\Delta\mathbf Z_{\mathrm{ang},m}(h',w')$，其中 $\mathbf W_{\mathrm{ang},m}$ 是冻结投影权重。

#### 3.2.3 用 LF-MA 做多域适配

LF-CA 与 LoRA 分别自适应空间注意力与角度注意力，而随后的 MLP 仍保持其冻结的逐 token 非线性变换。虽然这些注意力模块能联合建模空域—角度依赖关系，但二者都不直接处理 EPI 结构——其直线斜率编码了视图间视差。为解决这些局限，我们在每个 LF-HDiT 块的冻结 MLP 旁并行引入 LF-MA（如图 2(c) 所示），以利用包含 EPI 特征的多域特征自适应每个测试 LF 的 MLP 输出。LF-MA 把输入重排为宏像素图像（macro-pixel image, MacPI）特征网格，在每个空间位置聚合所有视图的特征。按照 [25]，采用不同核大小、步长与膨胀率的域专用卷积并行提取空间、角度、水平 EPI（H-EPI）与垂直 EPI（V-EPI）特征。每个 EPI 域跨越一个空间维与一个角度维，从而可直接建模视差结构。

给定 MLP 输入 $\mathbf Z_{\mathrm{multi}}\in\mathbb R^{UVH'W'\times D}$，LF-MA 用四个域专用特征提取器 $\mathcal E_k$（$k\in\{\mathrm{spa},\mathrm{ang},\text{H-EPI},\text{V-EPI}\}$）计算更新：

$$
\begin{aligned}
\Delta\mathbf Z&=\mathcal R_{\mathrm{MacPI}}^{-1}\left(\mathrm{Conv}^{1\times1,D}_{\mathrm{multi}}\left(\bar{\mathbf Z}+\mathrm{Conv}^{1\times1,R}_{\mathrm{fuse}}\left(\mathrm{Concat}\left(\left\{\mathbf F_k:\forall k\right\}\right)\right)\right)\right),\\
\bar{\mathbf Z}&=\mathrm{GELU}\left(\mathrm{Conv}^{1\times1,R}_{\mathrm{multi}}\left(\mathcal R_{\mathrm{MacPI}}\left(\mathbf Z_{\mathrm{multi}}\right)\right)\right),\qquad \mathbf F_k=\mathcal E_k\left(\bar{\mathbf Z}\right),
\end{aligned}\tag{3}
$$

其中 $\mathcal R_{\mathrm{MacPI}}$ 把输入 token 重排为 $UH'\times VW'\times D$ 的 MacPI 特征张量，其逆操作恢复原始 token 布局。卷积 $\mathrm{Conv}^{1\times1,R}_{\mathrm{multi}}$ 与 $\mathrm{Conv}^{1\times1,D}_{\mathrm{multi}}$ 分别把通道从 $D$ 映射到 $R$ 与映射回 $D$，GELU [26] 表示高斯误差线性单元激活。每个提取器 $\mathcal E_k$ 在共享的 MacPI 布局中返回 $\mathbf F_k\in\mathbb R^{UH'\times VW'\times R}$；H-EPI 与 V-EPI 网格的大小分别为 $V\times W'$ 与 $U\times H'$。$\mathrm{Concat}(\cdot)$ 沿通道维拼接四个特征，$\mathrm{Conv}^{1\times1,R}_{\mathrm{fuse}}$ 通过把 $4R$ 个通道映射为 $R$ 个来融合拼接后的域专用特征。最后 $\tilde{\mathbf Z}_{\mathrm{multi}}=\mathbf Z_{\mathrm{MLP}}+\Delta\mathbf Z$，其中 $\mathbf Z_{\mathrm{MLP}}$ 是图 2(c) 中的冻结 MLP 输出。

### 3.3 自监督测试时自适应

测试时含噪 FS 测量 $\mathbf y$ 可用，而 §2.2.1 扩散训练损失所需的相应干净 LF 不可用。我们把 [20] 的自监督目标适配到本设定：

$$
\mathcal L=\sum_{t=1}^{T}\left\|\mathbf x_{t-1}-\sqrt{\bar\alpha_{t-1}}\,\hat{\mathbf x}_{0\mid t}\right\|_2^2,
$$

其中 $\bar\alpha_{t-1}=\prod_{s=1}^{t-1}\alpha_s$（原文该式未编号）。DDRM 样本 $\mathbf x_{t-1}$ 作为固定目标，梯度只经由 $\hat{\mathbf x}_{0\mid t}$ 回传，以更新 LF-CA、LoRA 与 LF-MA。

## 4. 实验

### 4.1 实验设置

**数据集与评价指标。** 我们在 LF 数据集 [5] 上预训练 LF-HDiT，该数据集包含 3,343 幅用 Lytro Illum 相机拍摄的花卉与植物 LF，具有复杂遮挡与多样视差。我们用中心裁剪、左裁剪、右裁剪与水平翻转把数据集扩充六倍。测试时自适应使用 HCI LF 数据集 [27]，包含 53 幅目标与场景均不同于预训练数据的 LF。我们以 dB 为单位的峰值信噪比（PSNR）、结构相似性指数（SSIM）以及每幅 LF 的推理时间（秒）评价性能。

**实现细节。** 我们按 [8] 合成 $C=2$ 或 $3$ 个焦平面的 FS 测量（（1）中的 $\mathbf y$），并加入信噪比 25 dB 的加性白高斯噪声；所有实验中取 $U=V=5$、$H=W=192$。我们在四块 NVIDIA A100 GPU 上以批大小 4、用于 token 嵌入的 $4\times4$ patch、Adam 优化器（学习率 $\lambda=2\times10^{-5}$）、sigmoid 噪声调度 [28] 与 $T=1000$ 个扩散时间步预训练 LF-HDiT 999K 次迭代。我们用默认设置在该 LF 数据集 [5] 上训练 FSNet [11]、Joint FDL [13] 与 DDLFRM [16]。对 DDNM [18]、DAPS [19] 与 DDIP [21]，我们以预训练的 LF-HDiT 作为其扩散先验，并用 DDIM [29] 采样。对 DDS2M [20]，我们用 [16] 中的可处理系统矩阵分解进行反向扩散。这些方法均使用 100 个去噪步，其余超参数保持其默认设置。对 STAR，我们取 $P=3$、$R=32$、学习率 $\lambda=5\times10^{-6}$，并使用 100 个 DDIM 步、以 [16] 的分解执行 DDRM 更新。

### 4.2 与现有 SOTA 方法的比较

表 1 与图 3 表明，无论焦平面设定如何，所提 STAR 在重构质量上都优于现有 SOTA 方法。DDS2M 对每个测量优化一个未训练网络而不使用学到的 LF 先验，它在基于扩散的求解器中 PSNR 最低、推理最慢。DDIP 自适应预训练扩散模型但没有显式针对 LF 空域—角度结构，其重构质量低于 STAR 且推理更慢。

### 4.3 适配变体分析

表 2(a) 中，全参数微调相对冻结基线仅有有限提升。表 2(b)—(c) 表明，组合各适配器一般能改善性能。表 2(d) 中，LF-MA$^{2}$ 优于 LF-MA$^{1}$，印证了 EPI 特征的价值。完整适配器组合在 $3\times3$ LF-CA 核下表现最佳；$5\times5$ 核没有进一步收益（见表 2(e)）。

## 5. 结论

我们提出用于从有限且含噪 FS 测量重构 LF 的 STAR。在预训练 LF-HDiT 主干冻结的情况下，STAR 通过三个轻量适配器自适应场景相关的空域—角度结构：用于视图内空间细节的 LF-CA、用于跨视图依赖关系的 LoRA，以及用于包含编码视差的 EPI 结构的多域特征的 LF-MA。这些适配器在无需干净 LF 的自监督目标下于每个去噪步更新。实验表明，在两焦平面与三焦平面设定下都取得更优的重构质量，且推理比在测试时更新参数的竞争求解器更快。

## 6. 致谢

本工作部分受以下项目资助：MSIT 资助的 NRF 项目 RS-2026-25480389 与 RS-2023-00213455；MSIT 资助的 IITP 项目 RS-2026-25615334（AI Star Fellowship 支持计划）与 RS-2019-II190421（AI 研究生院支持计划（成均馆大学））；BK21 FOUR 项目；MSIT 与 NIPA 资助的 Digital Therapeutics Development and Demonstration Support Program 项目 H0601-24-1023；以及 MOTIE 资助的 KIAT 项目 RS-2024-00418086（面向产业创新的 HRD 计划）。

## 图注与表注

### 表 1：在 HCI LF 数据集上与现有 SOTA LF 重构方法及逆问题求解器的比较（原 PDF 第 4 页）

使用不同焦平面数 $C$。Time 为每幅 LF 的平均推理时间（秒），在单块 NVIDIA A100 GPU 上测得。

| 方法 | $C=2$ PSNR↑ | SSIM↑ | Time↓ | $C=3$ PSNR↑ | SSIM↑ | Time↓ |
|---|---|---|---|---|---|---|
| 伪逆（Pseudo-inverse） | 3.83 | 0.0801 | $9.1\times10^{-2}$ | 9.24 | 0.3008 | $1.0\times10^{-1}$ |
| FSNet [11] | 31.40 | 0.8594 | $1.5\times10^{-2}$ | 31.59 | 0.8644 | $1.6\times10^{-2}$ |
| Joint FDL [13] | 30.42 | 0.7342 | $8.1\times10^{-1}$ | 32.67 | 0.8301 | $8.3\times10^{-1}$ |
| DDLFRM [16] | 33.49 | 0.8618 | 55.88 | 34.92 | 0.8876 | 57.70 |
| DDNM [18] | 31.96 | 0.7881 | 78.04 | 34.24 | 0.8602 | 89.64 |
| DAPS [19] | 36.73 | 0.9234 | 139.17 | 37.65 | 0.9384 | 143.66 |
| DDS2M [20] | 31.67 | 0.8282 | 275.43 | 32.96 | 0.9041 | 313.51 |
| DDIP [21] | 36.54 | 0.9229 | 122.32 | 37.11 | 0.9311 | 123.01 |
| **STAR（本文）** | **37.16** | **0.9355** | **106.74** | **38.23** | **0.9463** | **106.98** |

### 表 2：在 HCI LF 数据集（$C=3$）上的适配变体比较（原 PDF 第 4 页）

(a) 适配范围；(b) STAR 变体；(c) 模块组合；(d) LF-MA 变体；(e) LF-CA 核大小。Full FT 表示全参数微调；$(\cdot,\cdot)$ 表示核大小变体；LF-MA$^{1}$ 去掉 $\mathcal E_{\mathrm{H-EPI}}$ 与 $\mathcal E_{\mathrm{V-EPI}}$；LF-MA$^{2}$ 去掉 $\mathcal E_{\mathrm{spa}}$ 与 $\mathcal E_{\mathrm{ang}}$。

| 分组 | 空间（Spatial） | 角度（Angular） | MLP | PSNR↑ | SSIM↑ |
|---|---|---|---|---|---|
| (a) | Frozen | Frozen | Frozen | 37.09 | 0.9269 |
| (a) | Full FT | Full FT | Full FT | 37.40 | 0.9297 |
| (b) | Frozen | LoRA | Frozen | 37.19 | 0.9286 |
| (b) | Frozen | Frozen | LF-MA | 37.50 | 0.9317 |
| (b) | LF-CA ($3\times3$, $1\times1$) | Frozen | Frozen | 37.94 | 0.9321 |
| (c) | LoRA | LoRA | Frozen | 37.32 | 0.9309 |
| (c) | Frozen | LoRA | LF-MA | 37.66 | 0.9293 |
| (c) | LF-CA ($3\times3$, $1\times1$) | LoRA | Frozen | 37.96 | 0.9357 |
| (c) | LF-CA ($3\times3$, $1\times1$) | Frozen | LF-MA | 38.11 | 0.9447 |
| (d) | LF-CA ($3\times3$, $1\times1$) | LoRA | LF-MA$^{1}$ | 37.96 | 0.9406 |
| (d) | LF-CA ($3\times3$, $1\times1$) | LoRA | LF-MA$^{2}$ | 38.10 | 0.9438 |
| (e) | LF-CA ($3\times3$, $1\times1$) | LoRA | LF-MA | **38.23** | **0.9463** |
| (e) | LF-CA ($5\times5$, $1\times1$) | LoRA | LF-MA | 38.11 | 0.9459 |

### 图注

**图 1（原 PDF 第 2 页）：** 所提 STAR 框架概览。上：第 $t$ 步的整体反向扩散过程——LF-HDiT 估计干净 LF，DDRM 利用 $\mathbf A$ 的可处理分解执行测量条件更新。下：所提 LF-HDiT 块，配有用于测试时自适应的 LF-CA、LoRA 与 LF-MA，其中 QKV proj. 表示查询（Q）、键（K）、值（V）投影。这些适配器分别与冻结的空间注意力 QKV 投影、角度注意力 QKV 投影与 MLP 并行工作；其输出加到相应冻结输出上，且只更新适配器。

**图 2（原 PDF 第 3 页）：** 所提适配模块的架构。(a) LF-CA 为空间注意力中冻结的 Q、K、V 投影加入低秩卷积更新；(b) LoRA 为角度注意力中相应投影加入低秩更新；(c) LF-MA 提取并融合空间、角度、H-EPI 与 V-EPI 特征，以计算加到冻结 MLP 输出上的更新。

**图 3（原 PDF 第 4 页）：** 在 $(1,1)$ 角度坐标处 LF 重构结果的比较（$C=2$）。每幅重构图给出其 PSNR（dB）及下方相应的误差图。(a) 伪逆；(b) FSNet；(c) Joint FDL；(d) DDLFRM；(e) DDNM；(f) DAPS；(g) DDS2M；(h) DDIP；(i) STAR；(j) 真值。

## 7. 参考文献（英文原书目）

以下按原 PDF 第 5 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] M. Levoy and P. Hanrahan, "Light field rendering," in Proc. Conf. Comput. Graphics Interactive Techniques, 1996, pp. 31–42.

[2] D. G. Dansereau, O. Pizarro, and S. B. Williams, "Linear volumetric focus for light field cameras," ACM Trans. Graph., vol. 34, no. 2, pp. 1–20, 2015.

[3] C. Shin, H.-G. Jeon, Y. Yoon, I. S. Kweon, and S. J. Kim, "EPINET: A fully-convolutional neural network using epipolar geometry for depth from light field images," in Proc. IEEE/CVF CVPR, 2018, pp. 4748–4757.

[4] R. S. Overbeck, D. Erickson, D. Evangelakos, M. Pharr, and P. Debevec, "A system for acquiring, processing, and rendering panoramic light field stills for virtual reality," ACM Trans. Graph., vol. 37, no. 6, pp. 1–15, 2018.

[5] P. P. Srinivasan, T. Wang, A. Sreelal, R. Ramamoorthi, and R. Ng, "Learning to synthesize a 4D RGBD light field from a single image," in Proc. IEEE ICCV, 2017, pp. 2243–2251.

[6] A. Mousnier, E. Vural, and C. Guillemot, "Partial light field tomographic reconstruction from a fixed-camera focal stack," 2015, arXiv:1503.01903.

[7] C. J. Blocker, Y. Chun, and J. A. Fessler, "Low-rank plus sparse tensor models for light-field reconstruction from focal stack data," in Proc. IEEE IVMSP, 2018, pp. 1–5.

[8] M.-B. Lien, C.-H. Liu, I. Y. Chun, S. Ravishankar, H. Nien, M. Zhou, J. A. Fessler, Z. Zhong, and T. B. Norris, "Ranging and light field imaging with transparent photodetectors," Nat. Photonics, vol. 14, no. 3, pp. 143–148, 2020.

[9] M. Le Pendu, C. Guillemot, and A. Smolic, "A Fourier disparity layer representation for light fields," IEEE Trans. Image Process., vol. 28, no. 11, pp. 5740–5753, 2019.

[10] I. Y. Chun, Z. Huang, H. Lim, and J. A. Fessler, "Momentum-Net: Fast and convergent iterative neural network for inverse problems," IEEE Trans. Pattern Anal. Mach. Intell., vol. 45, no. 4, pp. 4915–4931, 2023.

[11] Z. Huang, J. A. Fessler, T. B. Norris, and I. Y. Chun, "Light-field reconstruction and depth estimation from focal stack images using convolutional neural networks," in Proc. IEEE ICASSP, 2020, pp. 8648–8652.

[12] S. Gao, G. Qu, M. Sjöström, and Y. Liu, "A TV regularisation sparse light field reconstruction model based on guided-filtering," Signal Process.-Image Commun., vol. 109, pp. 116852, 2022.

[13] B. Le Bon, M. Le Pendu, and C. Guillemot, "Joint Fourier disparity layers unrolling with learned view synthesis for light field reconstruction from few-shots focal stacks," IEEE Access, vol. 11, pp. 123350–123360, 2023.

[14] B. Wilburn, N. Joshi, V. Vaish, E.-V. Talvala, E. Antunez, A. Barth, A. Adams, M. Horowitz, and M. Levoy, "High performance imaging using large camera arrays," ACM Trans. Graph., vol. 24, no. 3, pp. 765–776, 2005.

[15] R. Ng, M. Levoy, M. Brédif, G. Duval, M. Horowitz, and P. Hanrahan, "Light field photography with a hand-held plenoptic camera," Comput. Sci. Tech. Rep., vol. 2, no. 11, 2005.

[16] H. S. Yun and I. Y. Chun, "Improving light field reconstruction from limited focal stack using diffusion models," in Proc. IEEE MLSP, 2024, pp. 1–6.

[17] B. Kawar, M. Elad, S. Ermon, and J. Song, "Denoising diffusion restoration models," in Proc. NeurIPS, 2022.

[18] Y. Wang, J. Yu, and J. Zhang, "Zero-shot image restoration using denoising diffusion null-space model," in Proc. ICLR, 2023.

[19] B. Zhang, W. Chu, J. Berner, C. Meng, A. Anandkumar, and Y. Song, "Improving diffusion inverse problem solving with decoupled noise annealing," in Proc. IEEE/CVF CVPR, 2025, pp. 20895–20905.

[20] Y. Miao, L. Zhang, L. Zhang, and D. Tao, "DDS2M: Self-supervised denoising diffusion spatio-spectral model for hyperspectral image restoration," in Proc. IEEE ICCV, 2023, pp. 12052–12062.

[21] H. Chung and J. C. Ye, "Deep diffusion image prior for efficient OOD adaptation in 3D inverse problems," in Proc. ECCV, 2024, pp. 432–455.

[22] K. Crowson, S. A. Baumann, A. Birch, T. M. Abraham, D. Z. Kaplan, and E. Shippole, "Scalable high-resolution pixel-space image synthesis with hourglass diffusion transformers," in Proc. ICML, 2024.

[23] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Proc. NeurIPS, 2020.

[24] E. J. Hu, Y. Shen, P. Wallis, Z. Allen-Zhu, Y. Li, S. Wang, L. Wang, and W. Chen, "LoRA: Low-Rank Adaptation of large language models," in Proc. ICLR, 2022.

[25] Y. Wang, L. Wang, G. Wu, J. Yang, W. An, J. Yu, and Y. Guo, "Disentangling light fields for super-resolution and disparity estimation," IEEE Trans. Pattern Anal. Mach. Intell., vol. 45, no. 1, pp. 425–443, 2023.

[26] D. Hendrycks and K. Gimpel, "Gaussian error linear units (GELUs)," 2016, arXiv:1606.08415.

[27] K. Honauer, O. Johannsen, D. Kondermann, and B. Goldluecke, "A dataset and evaluation methodology for depth estimation on 4D light fields," in Proc. ACCV, 2016, pp. 19–34.

[28] A. Jabri, D. J. Fleet, and T. Chen, "Scalable adaptive computation for iterative generation," in Proc. ICML, 2023.

[29] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proc. ICLR, 2021.

**本页范围与校对状态：** 本页依据 arXiv:2609.19747v1（cs.CV，2026-09-17，5 页）完成全文中文翻译：摘要、索引词、第 1—5 节（含 2.1、2.2.1—2.2.2、3.1—3.3、4.1—4.3）、致谢、图 1—3 中文图注、表 1—2 逐格转录、参考文献 [1]—[29] 英文原条目（按原编号）。编号公式 (1)—(3) 按原文保留；§3.3 的自监督损失在原文中未编号，故按未编号显示式录入。表 1 与表 2 已用 PDF 第 4 页渲染图逐格核对，图 1—3 的图注也已对照第 2—4 页渲染图核对。**逐句逐式终校未做**；图内 LF 重构图像与误差图未作数字化读取，只转录图注与正文给出的 PSNR 数值；参考文献未联网核验 DOI、页码与在线链接。原文疑似问题：表 1 中伪逆（Pseudo-inverse）的 PSNR 仅 3.83 dB（$C=2$）/9.24 dB（$C=3$），远低于其余方法，这是高度欠定系统伪逆重建的预期行为，已照原文转录、未作改动。原文为会议短文，无附录与作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
