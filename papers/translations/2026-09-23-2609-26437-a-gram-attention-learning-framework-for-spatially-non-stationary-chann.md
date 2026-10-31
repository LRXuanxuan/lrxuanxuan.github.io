---
layout: page
title: "空间非平稳信道的 Gram 注意力学习框架｜中文全文译文"
permalink: /papers/translations/2026-09-23-2609-26437-a-gram-attention-learning-framework-for-spatially-non-stationary-chann/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c010f548cb2bbc18/) · [原文 arXiv](https://arxiv.org/abs/2609.26437) · [全部目录](/papers/catalog/)

# 空间非平稳信道的 Gram 注意力学习框架

**原题：** A Gram-Attention Learning Framework for Spatially Non-Stationary Channel Estimation  
**作者：** Jiannan Wang、Xianghao Yu（Senior Member, IEEE，通讯作者）、Chenshu Wu（Senior Member, IEEE）  
**单位：** 香港城市大学电子工程系（香港，jiannan.wang@my.cityu.edu.hk；alex.yu@cityu.edu.hk）；香港大学计算机科学系（香港，chenshu@cs.hku.hk）。  
**版本：** arXiv:2609.26437v1（eess.SP），v1 日期 2026 年 9 月 22 日；原文 13 页。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.26437v1 [eess.SP] 22 Sep 2026"，与库内登记编号 2609.26437 一致；首页仅给出作者单位与邮箱脚注，无独立资助脚注。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VI 节正文与编号小节、图 1–10 中文图注、表 I–II 逐格转写、参考文献 36 条英文原条目（按原编号）。原文无附录。逐句逐式终校未做。

## 摘要

随着下一代无线系统向高频段迁移，超大规模多输入多输出（extremely large-scale multiple-input multiple-output，XL-MIMO）对对抗严重路径损耗不可或缺。然而，沿超大阵列孔径（extremely large array aperture，ELAA）的传播路径接收能量可能出现空间非平稳性，使传统离散傅里叶变换（discrete Fourier transform，DFT）码本因其全阵列角度表示而不适用于信道估计（channel estimation，CE）。为克服这一模型失配，我们提出一种新的联合角度–子阵（joint angle-subarray，JAS）码本，其中每个码字关联一个角度方向与一个特定子阵。在此框架下，空间非平稳 CE 被转化为 JAS 域中的结构化稀疏支撑检测。然而，对传统基于模型的方法而言，可靠地恢复支撑仍然具有挑战性。为此，我们进一步发展了一个信号处理与深度学习协同设计框架：先进行数据驱动的 JAS 并行支撑检测，再做基于最小二乘（least-squares，LS）的信道重建。具体地，每个 JAS 网格的匹配滤波响应首先被嵌入高维特征向量；随后我们提出一个 Gram 注意力模块，把 Gram 矩阵作为物理先验注入以引导特征提纯，使网络能够抑制泄漏相关分量，同时保留每个网格的支撑相关信息。提纯后的特征再送入解耦头，以推断 JAS 域中的层次化稀疏支撑。最后，在由检测到的支撑构造的低维字典上执行 LS 以恢复路径增益。仿真结果表明，所提框架在所有基线中取得最高的支撑检测 F1 分数与最低的 CE 归一化均方误差（normalized mean square error，NMSE），消融研究进一步验证了将 Gram 域物理先验与数据驱动表示学习相结合的优势。

**索引词：** 信道估计、深度学习、联合角度–子阵码本、空间非平稳、支撑检测。

## I. 引言

第六代（6G）无线通信系统的演进由对超高速率、超低时延与海量连接日益增长的需求驱动 [1]–[3]。为满足这些需求，一个有望的方案是利用高频段，例如毫米波（mmWave）与太赫兹（THz）频段，那里有丰富的频谱资源 [4]–[6]。然而高频传播遭受严重路径损耗，导致接收信噪比（SNR）显著下降。为补偿该损耗，超大规模多输入多输出（XL-MIMO）系统已被广泛视为关键使能技术，通过大幅扩展阵列孔径提供高定向波束赋形增益 [7], [8]。在此背景下，获取准确的信道状态信息（CSI）是充分利用 XL-MIMO 潜力的关键，健壮可靠的信道估计（CE）因此成为基本前提。

然而，由于基站（BS）部署了大量天线，为每根天线分配专用且高功耗的射频（RF）链路代价过高。就此而言，混合架构成为实用替代方案：有限数量的 RF 链路通过混合合并网络连接大型天线阵列 [9]–[11]。但由于 RF 链路数通常远小于天线数，传统基于最小二乘（LS）的 CE 需要很重的导频开销来恢复高维信道，从而降低后续数据传输阶段的有效吞吐 [12]。为缓解该开销，压缩感知（CS）类方法被广泛用于 CE，通过利用高频信道的角度域稀疏性，通常基于经典离散傅里叶变换（DFT）码本 [13]。然而 DFT 码本隐含假设每条传播路径对整个阵列可见。对跨越数十个波长或更多的 ELAA，一条路径可能只照亮阵列的一部分，造成 DFT 表示失配，从而在角度域产生能量泄漏 [14]。

近期工作从不同角度研究空间非平稳 CE。一些工作把原始非平稳信道分解为若干更易处理的局部估计问题。例如，基于组时块码（GTBC）的方案设计时块导频，把空间非平稳信道分离为多个平稳子信道，并在其上用极域或自适应码本进行稀疏恢复 [15], [16]。遵循局部平稳原理，子阵级方法从每个局部阵列估计可见散射体，而散射体级方法进一步识别与单个散射体关联的可见区域 [17]。为更好适应不规则可见模式，[18] 还研究了自适应子阵划分，根据空间功率分布调整阵列分割。其他工作把结构化先验或基于学习的模型纳入估计过程。例如，基于隐马尔可夫模型（HMM）的稀疏先验被用于描述沿阵列孔径的可见性演化，导出 Turbo 正交近似消息传递（Turbo-OAMP）等贝叶斯推断算法 [19]。文献 [20] 探索了模型驱动的深度学习，把信道视为图像并用目标检测网络估计角度、时延与可见区域。

尽管有这些进展，空间非平稳信道的稀疏表示仍研究不足。为填补该空白，我们受雷达信号处理中经典短时傅里叶变换（STFT）定位原理的启发 [21]，提出一种新的可见性感知稀疏表示。其核心思想是把传统码本从一维（1D）角度表示扩展到二维（2D）角度–子阵表示。具体地，我们提出联合角度–子阵（JAS）码本，其中每个码字对应一个角度方向与一个特定子阵。通过联合编码路径方向与局部可见性，所提码本缓解了空间非平稳下传统 DFT 码本引起的表示失配。由此，空间非平稳 CE 可在 JAS 域中重新表述为结构化稀疏恢复问题。

然而，在 JAS 码本上进行可靠支撑检测对传统方法仍然困难。例如，正交匹配追踪（OMP）等贪心追踪方法依赖串行相关性的码字选择，一旦选错支撑就易受误差传播影响 [22], [23]。稀疏组 LASSO（sparse-group LASSO，SGL）类表述通过联合估计所有 JAS 系数并施加层次稀疏性，提供了并行的稀疏优化替代方案 [24]，但其固定收缩规则不够自适应，难以区分真实支撑与邻近泄漏响应。因此，仅依赖模型驱动的稀疏恢复可能限制 JAS 表示下的可达 CE 精度。需要一种更自适应的机制，以更好利用可见性感知的 JAS 表示，实现更可靠的支撑检测与更高的 CE 精度。

为实现该机制，我们发展了一个信号处理与深度学习协同设计框架。学习模块不直接回归稠密信道，而是专注于识别 JAS 码本上的活跃支撑。随后，给定检测到的支撑，原始欠定 CE 问题被转化为低维字典上的超定增益估计问题，可由 LS 方法良好求解。这种分离使神经网络处理问题中最困难的部分，即 JAS 网格上的并行支撑检测，同时保留基于模型的估计器进行连续增益恢复。为进一步提高支撑推断的可靠性，把嵌入在 Gram 矩阵中的物理先验纳入神经检测器。本文主要贡献可总结如下：

1) **JAS 码本：** 我们为空间非平稳信道提出一种新的 JAS 码本，其码字由在特定子阵上对角度导向矢量加窗构造。此外，我们分析 JAS 码本的列相干性，揭示其结构化的角度–子阵相关性以及传统算法在该码本上的局限。
2) **两阶段框架：** 我们基于所提 JAS 表示建立两阶段 CE 流程：先检测活跃 JAS 支撑，再用其构造约简字典进行基于 LS 的增益估计。该表述把关键推断步骤转化为 JAS 网格上的并行多标签支撑分类，从而利用数据驱动分类与基于模型估计的互补优势。
3) **Gram 注意力学习：** 我们开发一个 Gram 引导的深度学习模型，以在 JAS 码本上实现自适应并行支撑推断。具体地，每个 JAS 网格的匹配滤波响应首先被嵌入高维特征向量，Gram 矩阵先验被注入注意力操作以引导逐层特征精化。这样，网络学会抑制泄漏相关分量，生成用于 JAS 域可靠支撑检测的提纯特征。
4) **性能验证：** 我们通过全面仿真与消融研究验证所提框架。结果表明，所提方法在八个代表性基于模型与基于学习的基线之上同时改善 JAS 支撑检测与最终信道重建精度。消融研究进一步验证了把 Gram 矩阵编码的物理先验与数据驱动表示学习相结合对支撑检测的重要性。

本文其余部分组织如下：第 II 节给出系统模型与空间非平稳信道模型；第 III 节介绍所提 JAS 码本并讨论数据驱动并行推断的动机；第 IV 节详述所提两阶段 CE 框架；第 V 节给出仿真结果与消融研究；第 VI 节总结全文。

**记号：** 标量、向量与矩阵分别用小写 $x$、粗体小写 $\mathbf x$ 与粗体大写 $\mathbf X$ 表示。$\mathbf x$ 的转置与共轭转置分别记为 $\mathbf x^T$ 与 $\mathbf x^H$。$\mathcal{CN}(\boldsymbol\mu,\boldsymbol\Sigma)$ 表示均值 $\boldsymbol\mu$、协方差 $\boldsymbol\Sigma$ 的复圆对称高斯分布。此外，$\mathbb R$ 与 $\mathbb C$ 分别表示实数与复数集合，$\jmath=\sqrt{-1}$ 表示虚数单位。$\odot$ 与 $\otimes$ 分别表示 Hadamard 积与 Kronecker 积。对复标量 $x$，其实部、虚部、模与相位分别记为 $\Re\{x\}$、$\Im\{x\}$、$|x|$ 与 $\angle x$。最后，$\mathrm{diag}(\cdot)$ 与 $\mathrm{blkdiag}(\cdot)$ 分别表示由参数构造对角矩阵与块对角矩阵的算子，$\mathbf 1_N$ 表示 $N$ 维全一向量。

## II. 系统模型

本节给出 CE 的信号模型，随后介绍空间非平稳信道模型。基于该模型，进一步讨论为何传统基于 DFT 的稀疏表示会失配。

### A. 信号模型

本文考虑工作在时分双工（TDD）模式下的 XL-MIMO 系统，其中单天线用户设备（UE）与 BS 通信。BS 配备间距为半波长的 $N$ 天线均匀线阵（ULA）。由于 XL-MIMO 系统中 $N$ 通常非常大，BS 采用全连接混合合并结构以降低硬件成本与能耗 [9]。具体地，在上行导频训练阶段，共使用 $Q$ 个时隙进行 CE，估计得到的信道随后利用信道互易性用于下行传输。在第 $q$ 个时隙，合并矩阵为 $\mathbf A_q=\mathbf W_{\mathrm{BB},q}\mathbf W_{\mathrm{RF},q}\in\mathbb C^{N_{\mathrm{RF}}\times N}$，其中 $\mathbf W_{\mathrm{RF},q}\in\mathbb C^{N_{\mathrm{RF}}\times N}$ 与 $\mathbf W_{\mathrm{BB},q}\in\mathbb C^{N_{\mathrm{RF}}\times N_{\mathrm{RF}}}$ 分别表示模拟与数字合并矩阵，$N_{\mathrm{RF}}$ 是 RF 链路数。此外，由于模拟合并器通常由移相网络实现，其元素固有地受恒模约束 [9]。

在第 $q$ 个时隙，UE 向 BS 发送导频符号 $s_q\in\mathbb C$。混合合并后的接收导频记为 $\mathbf y_q\in\mathbb C^{N_{\mathrm{RF}}\times1}$，由下式给出

$$
\mathbf y_q=\mathbf A_q\mathbf h s_q+\mathbf A_q\mathbf n_q, \tag{1}
$$

其中 $\mathbf h\in\mathbb C^{N\times1}$ 表示 UE 与 BS 之间的信道向量，$\mathbf n_q\sim\mathcal{CN}(\mathbf 0,\sigma_n^2\mathbf I_N)$ 是第 $q$ 个时隙的复加性白高斯噪声（AWGN）。不失一般性，导频符号归一化为 $s_q=1$，$q=1,2,\dots,Q$。把 $Q$ 个时隙的导频堆叠起来，可得接收导频的紧凑形式

$$
\mathbf y=\mathbf A\mathbf h+\mathbf n, \tag{2}
$$

其中 $\mathbf y=[\mathbf y_1^T,\mathbf y_2^T,\dots,\mathbf y_Q^T]^T$，$\mathbf A=[\mathbf A_1^T,\mathbf A_2^T,\dots,\mathbf A_Q^T]^T$，$\mathbf n=[\mathbf n_1^T\mathbf A_1^T,\mathbf n_2^T\mathbf A_2^T,\dots,\mathbf n_Q^T\mathbf A_Q^T]^T$。关键在于，由于合并矩阵 $\mathbf A$ 的作用，堆叠噪声向量 $\mathbf n$ 变为有色的，服从分布 $\mathcal{CN}(\mathbf 0,\mathbf C)$，其中协方差矩阵 $\mathbf C$ 为

$$
\mathbf C=\sigma_n^2\,\mathrm{blkdiag}\left(\mathbf A_1\mathbf A_1^H,\mathbf A_2\mathbf A_2^H,\dots,\mathbf A_Q\mathbf A_Q^H\right)\in\mathbb C^{M\times M}. \tag{3}
$$

这里 $M=QN_{\mathrm{RF}}$ 表示测量数。在传统线性估计中，可靠恢复 $\mathbf h$ 通常要求 $M$ 不小于未知信道系数个数 $N$。然而在 XL-MIMO 系统中该要求会带来难以承受的导频开销。为克服这一挑战，需要利用无线信道固有的稀疏性，如下两小节所述。

### B. 非平稳信道模型

在多径信道模型中，设第 $l$ 条路径相对 ULA 的空间角为 $\theta_l\in[-1,1]$。在远场假设下，相应的导向矢量为

$$
\mathbf b(\theta_l)=\frac{1}{\sqrt N}\left[1,e^{-\jmath\frac{2\pi}{\lambda}d\theta_l},\dots,e^{-\jmath\frac{2\pi}{\lambda}(N-1)d\theta_l}\right]^T, \tag{4}
$$

其中 $d=\lambda/2$ 为天线间距，$\lambda$ 为波长。在传统空间平稳信道中，假设每条路径照亮整个阵列。然而 ELAA 的不同部分可能经历不同传播环境，涉及不同散射簇和/或障碍物。因此一条传播路径可能只在阵列的一部分上可见，如图 1 所示。

> **图 1（原文 Fig. 1）：** 空间非平稳信道示意，$L=2$、$N_{\mathrm{sub}}=8$。阴影区域表示两条传播路径的可见区域，分别对应 $\boldsymbol\phi_1=[0,1,1,0,0,0,0,0]^T$ 与 $\boldsymbol\phi_2=[0,0,0,1,1,1,1,0]^T$。

为以可处理的方式建模这种空间非平稳性，本文采用子阵级可见性模型 [15]–[17]。具体地，把 BS 阵列分为 $N_{\mathrm{sub}}$ 个子阵，每个子阵包含 $N_b=N/N_{\mathrm{sub}}$ 根天线，假设 $N_b$ 为整数。由于每个子阵的孔径远小于整个阵列，路径可见性可近似为在一个子阵内局部不变。因此对给定路径，特定子阵内的所有天线共享相同可见性状态。令 $\boldsymbol\phi_l\in\{0,1\}^{N_{\mathrm{sub}}\times1}$ 表示第 $l$ 条路径的子阵级可见性指示，其第 $i$ 个元素等于 1 表示第 $i$ 个子阵对该路径可见，等于 0 表示不可见。则空间非平稳信道建模为

$$
\mathbf h=\sqrt{\frac{N}{L}}\sum_{l=1}^{L}\beta_l\,\mathbf b(\theta_l)\odot\left(\boldsymbol\phi_l\otimes\mathbf 1_{N_b}\right), \tag{5}
$$

其中 $\beta_l$ 为第 $l$ 条路径的复增益，$L$ 为路径数。注意当所有路径对整个阵列可见，即 $\boldsymbol\phi_l=\mathbf 1_{N_{\mathrm{sub}}}$（$l=1,2,\dots,L$）时，式 (5) 的模型退化为传统空间平稳情形。

### C. 基于 DFT 的稀疏表示与模型失配

在传统空间平稳 CE 中，DFT 码本常被用于利用无线信道在角度域的稀疏性。具体地，码本矩阵的每个码字是在离散角度 $\bar\theta_g=\frac{2g-G+1}{G}$ 上采样的导向矢量 $\mathbf b(\bar\theta_g)$，其中 $g=0,1,\dots,G-1$，$G$ 为采样角度数。据此，信道可从空间域变换到角度域：

$$
\mathbf h=\mathbf F_{\mathrm{DFT}}\mathbf h_{\mathrm{DFT}}, \tag{6}
$$

其中 $\mathbf F_{\mathrm{DFT}}=[\mathbf b(\bar\theta_0),\mathbf b(\bar\theta_1),\dots,\mathbf b(\bar\theta_{G-1})]\in\mathbb C^{N\times G}$ 表示 DFT 码本，$\mathbf h_{\mathrm{DFT}}\in\mathbb C^{G\times1}$ 为角度域中相应的稀疏表示。把 (6) 代入 (2)，基于 DFT 的测量模型为

$$
\mathbf y=\mathbf A\mathbf F_{\mathrm{DFT}}\mathbf h_{\mathrm{DFT}}+\mathbf n. \tag{7}
$$

关键在于，该基于 DFT 的稀疏表示的有效性依赖于假设：每个路径分量都能由全阵列导向矢量 $\mathbf b(\theta_l)$ 良好表示。然而根据式 (5) 的空间非平稳模型，第 $l$ 条路径由 $\mathbf b(\theta_l)\odot(\boldsymbol\phi_l\otimes\mathbf 1_{N_b})$ 刻画，其角度响应进一步被子阵级可见性模式 $\boldsymbol\phi_l$ 调制。因此传统 DFT 码本遭受表示失配，在角度域引入能量泄漏，从而降低稀疏恢复的可靠性。为解决该问题，我们在下一节提出一种面向空间非平稳信道的新型码本。

## III. 所提码本

本节介绍所提 JAS 码本的原理，用于缓解空间非平稳引起的表示失配；随后分析其列相干性，以讨论传统方法的局限。

### A. 所提 JAS 码本

如上一节所述，信道的空间非平稳性引入与经典 DFT 码本的结构性失配，导致角度域能量泄漏。为解决该问题，受 STFT 启发，我们构造加窗角度表示，其中每个全阵列导向矢量被局部化到单个子阵。令 $\mathbf w_s=\mathbf e_s\otimes\mathbf 1_{N_b}$ 表示选择第 $s$ 个子阵的二元窗，其中 $\mathbf e_s\in\mathbb R^{N_{\mathrm{sub}}\times1}$ 是第 $s$ 个元素为 1 的 one-hot 向量。则与第 $g$ 个采样角度、第 $s$ 个子阵关联的 JAS 码字定义为

$$
\mathbf f_{g,s}=\mathbf b(\bar\theta_g)\odot\mathbf w_s, \tag{8}
$$

其中 $g=1,2,\dots,G$，$s=1,2,\dots,N_{\mathrm{sub}}$。在该表示中，对多个子阵可见的路径可通过激活若干角度索引相同但子阵索引不同的 JAS 码字来描述。因此空间非平稳性被良好嵌入 JAS 表示的支撑模式。收集所有这样的角度–子阵对，得到所提码本 $\mathbf F_{\mathrm{JAS}}\in\mathbb C^{N\times J}$（式 (9)），其中 $J=GN_{\mathrm{sub}}$ 为 JAS 码本大小：

$$
\mathbf F_{\mathrm{JAS}}=\left[\underbrace{\mathbf f_{1,1},\mathbf f_{1,2},\dots,\mathbf f_{1,N_{\mathrm{sub}}}}_{\text{角度 }\bar\theta_1},\underbrace{\mathbf f_{2,1},\mathbf f_{2,2},\dots,\mathbf f_{2,N_{\mathrm{sub}}}}_{\text{角度 }\bar\theta_2},\dots,\underbrace{\mathbf f_{G,1},\mathbf f_{G,2},\dots,\mathbf f_{G,N_{\mathrm{sub}}}}_{\text{角度 }\bar\theta_G}\right]. \tag{9}
$$

在基于 CS 的稀疏信号恢复框架中，码本的互相干性是决定恢复精度的重要指标。基于 (8) 的定义，任意两个码字 $\mathbf f_{g,s}$ 与 $\mathbf f_{g',s'}$ 的归一化内积可推导为

$$
\begin{aligned}
\frac{\left|\mathbf f_{g,s}^H\mathbf f_{g',s'}\right|}{\|\mathbf f_{g,s}\|_2\|\mathbf f_{g',s'}\|_2}&=N_{\mathrm{sub}}\left|\left(\mathbf b(\bar\theta_g)\odot\mathbf w_s\right)^H\left(\mathbf b(\bar\theta_{g'})\odot\mathbf w_{s'}\right)\right|\\
&=\frac{1}{N_b}\left|\sum_{n=0}^{N-1}[\mathbf w_s]_n[\mathbf w_{s'}]_n e^{\jmath\pi n(\bar\theta_g-\bar\theta_{g'})}\right|.
\end{aligned} \tag{10}
$$

基于该表述，从以下两个不同角度进行互相干性分析。

**1) 子阵间相干性（$s\neq s'$）。** 当两个码字采样自不同子阵时，其空间窗向量 $\mathbf w_s$ 与 $\mathbf w_{s'}$ 的非零支撑不相交，对所有 $n$ 有 $[\mathbf w_s]_n[\mathbf w_{s'}]_n=0$。把该性质代入 (10) 得

$$
\frac{\left|\mathbf f_{g,s}^H\mathbf f_{g',s'}\right|}{\|\mathbf f_{g,s}\|_2\|\mathbf f_{g',s'}\|_2}=0,\quad\forall s\neq s', \tag{11}
$$

这表明对应不同子阵的码字彼此严格正交，与各自采样角度无关。因此对特定子阵的响应不会向其他子阵引入能量泄漏。

**2) 子阵内相干性（$s=s'$）。** 当两个码字对应同一子阵但采样角度不同，即 $g\neq g'$ 时，非零支撑简化为第 $s$ 个子阵的天线索引范围。就此而言，(10) 中的相干函数简化为

$$
\begin{aligned}
\frac{\left|\mathbf f_{g,s}^H\mathbf f_{g',s'}\right|}{\|\mathbf f_{g,s}\|_2\|\mathbf f_{g',s'}\|_2}&=\frac{1}{N_b}\left|\sum_{n=(s-1)N_b}^{sN_b-1}e^{\jmath\pi n(\bar\theta_g-\bar\theta_{g'})}\right|\\
&=\frac{1}{N_b}\left|\frac{\sin\left(\frac{\pi}{2}N_b(\bar\theta_g-\bar\theta_{g'})\right)}{\sin\left(\frac{\pi}{2}(\bar\theta_g-\bar\theta_{g'})\right)}\right|.
\end{aligned} \tag{12}
$$

由 (12) 可见，沿角度维度的列相干性由归一化 Dirichlet 核描述，在 $\bar\theta_g=\bar\theta_{g'}$ 时达到最大值 1，随后随角度间隔 $|\bar\theta_g-\bar\theta_{g'}|$ 增大而下降。因此所提 JAS 字典呈现结构化相关模式：不同子阵的码字正交，而同一子阵内的码字因有限孔径沿角度维度仍相关。

### B. 从串行追踪到自适应并行推断

借助所提 JAS 码本，空间非平稳信道可在可见性感知角度域中表示，其中每个活跃系数对应一个特定角度–子阵对。相应地，信道向量变换为

$$
\mathbf h=\mathbf F_{\mathrm{JAS}}\mathbf h_{\mathrm{JAS}}, \tag{13}
$$

其中 $\mathbf h_{\mathrm{JAS}}\in\mathbb C^{J\times1}$ 表示 JAS 域中的稀疏表示。基于该新表示，式 (7) 的测量方程修改为

$$
\mathbf y=\boldsymbol\Theta\mathbf h_{\mathrm{JAS}}+\mathbf n, \tag{14}
$$

其中 $\boldsymbol\Theta=\mathbf A\mathbf F_{\mathrm{JAS}}\in\mathbb C^{M\times J}$ 表示有效测量矩阵。求解 (14) 的经典方法是 OMP，它迭代选择与残差信号相关性最大的码字。然而把该串行相关策略直接用于 JAS 域表示很困难。由 (12)，一个子阵内角度响应的第一零点主瓣宽度为 $4/N_b$，而传统全阵列 DFT 码字的为 $4/N$。因此 JAS 码字的角度响应被展宽 $N_{\mathrm{sub}}$ 倍，反映类似 STFT 中的定位–分辨力折中。为说明该效应对 OMP 选择所用相关响应的影响，图 2 分别描绘 $(\mathbf A\mathbf F_{\mathrm{DFT}})^H\mathbf y$ 与 $(\mathbf A\mathbf F_{\mathrm{JAS}})^H\mathbf y$ 的幅度分布。可以观察到 $|(\mathbf A\mathbf F_{\mathrm{JAS}})^H\mathbf y|$ 中每条真实路径的响应比 DFT 域响应扩散到更多邻近角度组，形成更宽、更不孤立的峰。由于 OMP 没有回溯机制，这种模糊可能导致早期错误选择，进而偏置残差更新并导致误差传播。因此串行贪心追踪不适合 JAS 域表示上的支撑检测。

> **图 2（原文 Fig. 2）：** 含三条路径的空间非平稳信道上相关性的幅度分布，三条路径的空间角分别配置为 $-0.5$、$0.1$ 与 $0.6$；路径 1 对所有子阵可见，路径 2 仅对前 4 个子阵可见，路径 3 仅对后 4 个子阵可见。(a) $G=128$ 时 $|(\mathbf A\mathbf F_{\mathrm{DFT}})^H\mathbf y|$ 的归一化分布。(b) $G=128$、$N_{\mathrm{sub}}=8$ 时 $|(\mathbf A\mathbf F_{\mathrm{JAS}})^H\mathbf y|$ 的归一化分布。

为应对串行贪心追踪的挑战，自然的替代是联合估计所有 JAS 系数以进行并行稀疏推断。由于 JAS 表示同时呈现角度级稀疏性与元素级稀疏性，考虑经典 SGL 表述 [24]：

$$
\min_{\mathbf h_{\mathrm{JAS}}}\ (\mathbf y-\boldsymbol\Theta\mathbf h_{\mathrm{JAS}})^H\mathbf C^{-1}(\mathbf y-\boldsymbol\Theta\mathbf h_{\mathrm{JAS}})+\gamma_1\|\mathbf h_{\mathrm{JAS}}\|_1+\gamma_2\sum_{g=1}^{G}\left\|[\mathbf h_{\mathrm{JAS}}]_{(g-1)N_{\mathrm{sub}}+1:gN_{\mathrm{sub}}}\right\|_2, \tag{15}
$$

其中 $\gamma_1$ 与 $\gamma_2$ 分别控制元素级稀疏性与组级角度稀疏性。求解 (15) 的典型方法是迭代收缩阈值算法（ISTA）[25]。具体地，在第 $k$ 次迭代，数据保真项产生如下梯度更新：

$$
\begin{aligned}
\mathbf r^{(k)}&=\hat{\mathbf h}_{\mathrm{JAS}}^{(k)}+\eta\boldsymbol\Theta^H\mathbf C^{-1}\left(\mathbf y-\boldsymbol\Theta\hat{\mathbf h}_{\mathrm{JAS}}^{(k)}\right)\\
&=\hat{\mathbf h}_{\mathrm{JAS}}^{(k)}+\eta\boldsymbol\Theta^H\mathbf C^{-1}\boldsymbol\Theta\left(\mathbf h_{\mathrm{JAS}}-\hat{\mathbf h}_{\mathrm{JAS}}^{(k)}\right)+\eta\boldsymbol\Theta^H\mathbf C^{-1}\mathbf n,
\end{aligned} \tag{16}
$$

其中 $\eta>0$ 是步长，$\hat{\mathbf h}_{\mathrm{JAS}}^{(k)}$ 是第 $k$ 次迭代对 $\mathbf h_{\mathrm{JAS}}$ 的估计。此外，$\boldsymbol\Theta^H\mathbf C^{-1}\boldsymbol\Theta$ 是有效感知字典的 Gram 矩阵。更新后的中间向量 $\mathbf r^{(k)}$ 随后通过结合元素级与组级收缩的近端映射，得到下一次估计 $\hat{\mathbf h}_{\mathrm{JAS}}^{(k+1)}$。

该基于模型的并行求解器的局限可从 (16) 看出。由于邻近 JAS 网格之间的相关性，项 $\boldsymbol\Theta^H\mathbf C^{-1}\boldsymbol\Theta(\mathbf h_{\mathrm{JAS}}-\hat{\mathbf h}_{\mathrm{JAS}}^{(k)})$ 把网格间泄漏引入 $\mathbf r^{(k)}$，使真实支撑分量与泄漏纠缠。尽管随后的近端映射促进稀疏性，其固定收缩规则无法适应不同网格与不同信道实现中变化的路径增益与泄漏水平。因此强泄漏可能被误保留为活跃支撑，而弱真实支撑可能被漏掉，导致精度与召回下降。这促使我们开发一种自适应推断规则，以在 JAS 域中实现可靠并行支撑检测。

## IV. 所提两阶段框架

本节给出用于空间非平稳 CE 的信号处理与深度学习协同设计框架。先概述两阶段估计框架，再详述核心模块实现，最后介绍为处理高频信道稀疏性造成的严重类别不平衡而设计的训练目标。

### A. 两阶段框架概述

如图 3 所示，所提框架把空间非平稳 CE 分解为两阶段过程。第一阶段，基于学习的支撑检测器并行评估所有 $J$ 个网格，输出二元支撑图 $\hat{\mathbf B}\in\{0,1\}^{G\times N_{\mathrm{sub}}}$，其中 $[\hat{\mathbf B}]_{g,s}=1$ 表示与第 $(g,s)$ 个角度–子阵对关联的 JAS 码字被检测为活跃。随后，由 $\hat{\mathbf B}$ 的非零项得到相应支撑集

$$
\mathcal S=\left\{(\hat g_k,\hat s_k)\,\middle|\,[\hat{\mathbf B}]_{\hat g_k,\hat s_k}=1,\ k=1,2,\dots,|\mathcal S|\right\}, \tag{17}
$$

由于 JAS 域的信道稀疏性，$|\mathcal S|\ll J$。第二阶段，检测到的 JAS 码字先按角度索引分组。假设从 $\mathcal S$ 中检测到 $\hat L$ 个不同角度索引，令 $\hat g_l$ 表示第 $l$ 个检测到的角度索引。对每个检测到的角度，把与其活跃子阵关联的码字求和，以重建相应的非平稳导向矢量：

$$
\hat{\mathbf f}_l=\sum_{\hat g_i=\hat g_l}\mathbf f_{\hat g_i,\hat s_i},\qquad l=1,2,\dots,\hat L, \tag{18}
$$

其中求和遍历 $\mathcal S$ 中角度索引等于 $\hat g_l$ 的所有检测支撑对。这样，$\hat{\mathbf f}_l$ 充当式 (5) 中 $\mathbf b(\theta_l)\odot(\boldsymbol\phi_l\otimes\mathbf 1_{N_b})$ 的估计。把这些非平稳向量拼接，得到低维码本

$$
\mathbf F_{\mathrm{low}}=\left[\hat{\mathbf f}_1,\hat{\mathbf f}_2,\dots,\hat{\mathbf f}_{\hat L}\right]\in\mathbb C^{N\times\hat L}, \tag{19}
$$

据此感知矩阵为 $\boldsymbol\Theta_{\mathrm{low}}=\mathbf A\mathbf F_{\mathrm{low}}\in\mathbb C^{M\times\hat L}$。这样未知变量数从 $J$ 大幅降至 $\hat L$。由于高频信道的稀疏性，路径数通常限于较小整数 [26]，远小于测量数。因此可通过 LS 估计器稳健地获得复路径增益：

$$
\hat{\boldsymbol\beta}=\left(\boldsymbol\Theta_{\mathrm{low}}^H\boldsymbol\Theta_{\mathrm{low}}\right)^{-1}\boldsymbol\Theta_{\mathrm{low}}^H\mathbf y, \tag{20}
$$

其中 $\hat{\boldsymbol\beta}\in\mathbb C^{\hat L\times1}$ 包含与 $\hat L$ 条检测路径相关的估计复增益。最后，空间信道恢复为 $\hat{\mathbf h}=\mathbf F_{\mathrm{low}}\hat{\boldsymbol\beta}\in\mathbb C^{N\times1}$。在该两阶段框架中，根本挑战在于第一阶段，因为第二阶段依赖相对确定的信号处理过程。因此本小节其余部分聚焦第一阶段的概述。

我们从回顾 (15) 的数据保真项开始，明确第一阶段的输入。展开 (15) 中的加权二次型，得

$$
\begin{aligned}
&(\mathbf y-\boldsymbol\Theta\mathbf h_{\mathrm{JAS}})^H\mathbf C^{-1}(\mathbf y-\boldsymbol\Theta\mathbf h_{\mathrm{JAS}})\\
&=\mathbf y^H\mathbf C^{-1}\mathbf y-2\Re\left\{\mathbf h_{\mathrm{JAS}}^H\boldsymbol\Theta^H\mathbf C^{-1}\mathbf y\right\}+\mathbf h_{\mathrm{JAS}}^H\boldsymbol\Theta^H\mathbf C^{-1}\boldsymbol\Theta\mathbf h_{\mathrm{JAS}}.
\end{aligned} \tag{21}
$$

由 (21) 可见，$\mathbf h_{\mathrm{JAS}}$ 仅通过两个特定项与观测 $\mathbf y$ 和字典 $\boldsymbol\Theta$ 耦合：匹配滤波响应 $\boldsymbol\Theta^H\mathbf C^{-1}\mathbf y$ 与 Gram 矩阵 $\boldsymbol\Theta^H\mathbf C^{-1}\boldsymbol\Theta$。根据 Neyman–Fisher 因子分解定理 [27]，这两项构成支撑检测问题的充分统计量。因此，把这两项而非原始高维三元组 $(\mathbf y,\mathbf A,\mathbf F_{\mathrm{JAS}})$ 送入网络，可在不损失统计信息的情况下显著压缩输入空间。然而直接计算这些统计量涉及噪声协方差矩阵 $\mathbf C$ 的逆。为避免该额外计算负担，我们采用数字基带白化。对第 $q$ 个时隙，把 $\mathbf W_{\mathrm{RF},q}\mathbf W_{\mathrm{RF},q}^H$ 分解为

$$
\mathbf W_{\mathrm{RF},q}\mathbf W_{\mathrm{RF},q}^H=\mathbf U_q\boldsymbol\Sigma_q\mathbf U_q^H, \tag{22}
$$

其中 $\mathbf U_q$ 是酉矩阵，$\boldsymbol\Sigma_q$ 是对角矩阵，包含 $\mathbf W_{\mathrm{RF},q}\mathbf W_{\mathrm{RF},q}^H$ 的非负特征值。然后令数字合并器为 $\mathbf W_{\mathrm{BB},q}=\mathbf U_q\boldsymbol\Sigma_q^{-1/2}\mathbf U_q^H$。这样有效噪声协方差变为 $\mathbf C=\sigma_n^2\mathbf I_M$，网络输入简化为 $\mathbf u=\boldsymbol\Theta^H\mathbf y\in\mathbb C^{J\times1}$ 与 $\mathbf G=\boldsymbol\Theta^H\boldsymbol\Theta\in\mathbb C^{J\times J}$。在指定 $(\mathbf u,\mathbf G)$ 作为网络输入后，下面概述所提学习架构的三个核心设计原则。

第一，把匹配滤波响应 $\mathbf u$ 提升到高维隐空间。虽然 $\mathbf u$ 提供所有 JAS 网格的初始响应，但每个网格只由一个复标量表示，期望的支撑信息与泄漏分量混在一起。因此为提高特征可分性，逐点嵌入函数 $\mathcal M_{\mathrm{embed}}(\cdot)$ 把 $\mathbf u$ 映射为高维实值张量：

$$
\mathbf X^{(0)}=\mathcal M_{\mathrm{embed}}(\mathbf u)\in\mathbb R^{J\times d_{\mathrm{model}}}, \tag{23}
$$

其中 $\mathcal M_{\mathrm{embed}}(\cdot)$ 表示嵌入函数，$d_{\mathrm{model}}$ 是特征维度。

第二，设计 Gram 引导的多头自注意力（MHSA）机制（称为 Gram 注意力）来精化纠缠的网格特征。关键动机是物理泄漏模式与注意力操作之间的结构一致性。具体地，网格间泄漏关系编码在 Gram 矩阵 $\mathbf G$ 中，而 MHSA 中的 token 间交互由注意力图描述。这种对应使注意力成为建模 JAS 网格间干扰的自然机制。通过把 Gram 矩阵作为物理先验注入 MHSA，特征交互不仅由学到的特征相似度引导，也由有效感知矩阵的相关结构引导。基于所提 Gram 注意力，第 $t$ 层的特征更新为

$$
\mathbf X^{(t)}=\mathcal H^{(t)}\left(\mathbf X^{(t-1)},\mathbf G\right),\qquad t=1,2,\dots,T, \tag{24}
$$

其中 $\mathcal H^{(t)}(\cdot)$ 表示第 $t$ 个骨干层的映射，实现为带所提 Gram 注意力机制的 Transformer 编码器层。每层通过抑制泄漏诱导分量来精化网格特征。经 $T$ 层逐层精化后，最终张量 $\mathbf X^{(T)}\in\mathbb R^{J\times d_{\mathrm{model}}}$ 包含每个 JAS 网格的提纯且具判别性的特征表示。

第三，为与 (15) 中的先验函数对齐，设计双头结构。第一个头通过把 $\mathbf X^{(T)}$ 聚合为角度级表示 $\mathbf X_{\mathrm{ang}}\in\mathbb R^{G\times d_{\mathrm{model}}}$ 施加组级角度稀疏性，为每个采样角度输出概率分数。同时，第二个头在无任何特征聚合的情况下施加元素级稀疏性，直接把 $\mathbf X^{(T)}$ 映射为每个角度–子阵对的概率分数。最后，融合两个分数得到总体支撑概率 $\mathbf P\in[0,1]^{G\times N_{\mathrm{sub}}}$。对 $\mathbf P$ 施加硬阈值即可确定 (17) 的离散支撑集 $\mathcal S$。下面分别详述三个核心组件。

> **图 3（原文 Fig. 3）：** 所提两阶段 CE 框架，由（左）数据驱动并行支撑检测与（右）基于模型的增益估计组成。

### B. 输入嵌入

把复匹配滤波响应 $\mathbf u$ 变换为高维特征的嵌入模块 $\mathcal M_{\mathrm{embed}}(\cdot)$ 包含三步：复到实变换、逐点多层感知机（MLP）投影与二维位置编码（PE）。

第一，由于标准神经网络作用于实值张量，每个复响应被转换为四维（4D）实值表示：

$$
\mathbf D(u_i)=[\Re\{u_i\},\Im\{u_i\},|u_i|,\angle u_i]^T\in\mathbb R^{4\times1}, \tag{25}
$$

其中 $u_i\in\mathbb C$ 是 $\mathbf u$ 的第 $i$ 个元素。随后，该 4D 特征向量经 $\mathrm{MLP}_u(\cdot)$ 投影为 $d_{\mathrm{model}}$ 维 token：

$$
\boldsymbol\xi_i=\mathrm{MLP}_u\left(\mathbf D(u_i)\right)\in\mathbb R^{d_{\mathrm{model}}\times1}. \tag{26}
$$

本文中 $\mathrm{MLP}_u(\cdot)$ 实现为两层线性网络，其间插入层归一化（LayerNorm）模块与高斯误差线性单元（GELU）激活函数，以引入必要非线性来增强网络表示能力。最后，利用并行张量计算，该逐点映射在所有 $J$ 个网格上同时执行。所得 token 堆叠成原始高维特征张量 $\mathbf X_{\mathrm{raw}}=[(\boldsymbol\xi_1)^T,(\boldsymbol\xi_2)^T,\dots,(\boldsymbol\xi_J)^T]^T\in\mathbb R^{J\times d_{\mathrm{model}}}$。

由于后续骨干采用 Transformer 编码器，引入 PE 把位置信息注入输入特征，因为自注意力本身无法区分 JAS 网格的顺序 [28]。值得注意的是，在 JAS 域中角度维度因角度周期性而是循环的，而子阵维度遵循天线阵列的线性布局。因此我们采用分解式二维 PE 方案分别编码角度与子阵结构。

第一，为建模角度域的循环拓扑，构造循环 PE 矩阵 $\mathbf E_{\mathrm{ang}}\in\mathbb R^{G\times d_{\mathrm{model}}}$。对第 $g$ 个角度索引，其 PE 矩阵为

$$
\begin{cases}
[\mathbf E_{\mathrm{ang}}]_{g,2p}=\sin\left(\frac{2\pi g}{G}(p+1)\right),\\[6pt]
[\mathbf E_{\mathrm{ang}}]_{g,2p+1}=\cos\left(\frac{2\pi g}{G}(p+1)\right),
\end{cases} \tag{27}
$$

其中 $p=0,1,\dots,d_{\mathrm{model}}/2-1$ 是频率索引。

第二，对子阵域，采用标准正弦 PE 构造 $\mathbf E_{\mathrm{sub}}\in\mathbb R^{N_{\mathrm{sub}}\times d_{\mathrm{model}}}$ [28]。对第 $s$ 个子阵索引，其 PE 矩阵为

$$
\begin{cases}
[\mathbf E_{\mathrm{sub}}]_{s,2p}=\sin\left(\frac{s}{10000^{2p/d_{\mathrm{model}}}}\right),\\[6pt]
[\mathbf E_{\mathrm{sub}}]_{s,2p+1}=\cos\left(\frac{s}{10000^{2p/d_{\mathrm{model}}}}\right).
\end{cases} \tag{28}
$$

最后，按 (9) 中 JAS 码本的块状排序展开 PE 矩阵。具体地，把 $\mathbf E_{\mathrm{ang}}$ 的每一行重复 $N_{\mathrm{sub}}$ 次得 $\bar{\mathbf E}_{\mathrm{ang}}\in\mathbb R^{J\times d_{\mathrm{model}}}$，把 $\mathbf E_{\mathrm{sub}}$ 平铺 $G$ 次得 $\bar{\mathbf E}_{\mathrm{sub}}\in\mathbb R^{J\times d_{\mathrm{model}}}$。送入骨干的初始特征张量为

$$
\mathbf X^{(0)}=\mathbf X_{\mathrm{raw}}+\bar{\mathbf E}_{\mathrm{ang}}+\bar{\mathbf E}_{\mathrm{sub}}\in\mathbb R^{J\times d_{\mathrm{model}}}. \tag{29}
$$

这样每个 JAS 网格特征既携带其响应信息，也携带其在 JAS 域中的相对位置，为后续基于 Gram 注意力的骨干提供结构化输入。

### C. Gram 注意力 Transformer 编码器层

输入嵌入后，每个 JAS 网格由高维特征向量表示。然而有用支撑证据与泄漏相关分量仍在这些特征中混杂。为提纯网格表示，我们用堆叠的 Transformer 编码器层构建骨干，每层配备所提 Gram 注意力机制。设 Gram 注意力模块含 $N_{\mathrm{head}}$ 个并行头，每个头工作在 $d_{\mathrm{head}}=d_{\mathrm{model}}/N_{\mathrm{head}}$ 维子空间。对第 $t$ 层第 $m$ 个头，输入特征 $\mathbf X^{(t-1)}$ 被线性投影为查询、键与值矩阵：

$$
\mathbf Q_m^{(t)}=\mathbf X^{(t-1)}\mathbf W_m^{Q,(t)},\quad\mathbf K_m^{(t)}=\mathbf X^{(t-1)}\mathbf W_m^{K,(t)},\quad\mathbf V_m^{(t)}=\mathbf X^{(t-1)}\mathbf W_m^{V,(t)}. \tag{30}
$$

我们不完全依赖数据驱动的语义相关性，而是用确定性物理泄漏先验 $\mathbf G$ 显式引导注意力机制。复用 §IV-B 的复到实算子 $\mathbf D(\cdot)$，先按 $[\mathbf G]_{i,j}$ 逐元素变换为 4D 描述子 $\mathbf D([\mathbf G]_{i,j})$。随后小型 MLP 网络把该描述子投影为偏置向量 $[\mathbf B_G]_{:,i,j}=\mathrm{MLP}_G(\mathbf D([\mathbf G]_{i,j}))\in\mathbb R^{N_{\mathrm{head}}\times1}$。本文中 $\mathrm{MLP}_G(\cdot)$ 实现为带 GELU 激活的两层 MLP。于是，通过在所有网格上并行计算，Gram 矩阵被映射为多头偏置张量 $\mathbf B_G\in\mathbb R^{N_{\mathrm{head}}\times J\times J}$。把该物理偏置张量引入标准 MHSA 机制，第 $m$ 个头的输出 $\mathbf H_m^{(t)}\in\mathbb R^{J\times d_{\mathrm{head}}}$ 为

$$
\mathbf H_m^{(t)}=\mathrm{softmax}\left(\frac{\mathbf Q_m^{(t)}(\mathbf K_m^{(t)})^T}{\sqrt{d_{\mathrm{head}}}}+[\mathbf B_G]_{m,:,:}\right)\mathbf V_m^{(t)}. \tag{31}
$$

为更细致考察 Gram 注意力如何更新每个网格特征，令 $\alpha_{i,j}^{(t,m)}$ 表示 (31) 中注意力矩阵的第 $(i,j)$ 项。对第 $i$ 个网格，相应输出特征可分解为

$$
[\mathbf H_m^{(t)}]_{i,:}=\alpha_{i,i}^{(t,m)}[\mathbf V_m^{(t)}]_{i,:}+\sum_{j=1,j\neq i}^{J}\alpha_{i,j}^{(t,m)}[\mathbf V_m^{(t)}]_{j,:}. \tag{32}
$$

如图 4 所示，第一项对应第 $i$ 个网格的特征向量，第二项构成其他网格贡献的学到的修正项。由于注意力权重与值投影都可学习，该修正项在特征空间中自适应调整第 $i$ 个网格的表示，使泄漏相关分量被削弱、支撑相关证据被更好保留。

> **图 4（原文 Fig. 4）：** 泄漏抑制过程示意；为简洁只画出两个特征维度与三个网格，且省略了头与层的索引 $m$、$t$。

然后，第 $t$ 层所有注意力头的输出被拼接并线性投影：

$$
\mathbf O^{(t)}=\mathrm{Concat}\left(\mathbf H_1^{(t)},\mathbf H_2^{(t)},\dots,\mathbf H_{N_{\mathrm{head}}}^{(t)}\right)\mathbf W^{O,(t)}, \tag{33}
$$

其中 $\mathbf W^{O,(t)}\in\mathbb R^{d_{\mathrm{model}}\times d_{\mathrm{model}}}$ 是第 $t$ 层的输出投影矩阵。令 $\mathcal A_{\mathrm{Gram}}^{(t)}(\cdot)$ 表示由 (30)、(31)、(33) 定义的 Gram 注意力算子。基于该算子，(24) 中的层映射 $\mathcal H^{(t)}(\cdot)$ 通过整合 Gram 注意力、残差连接、LayerNorm 与前馈网络（FFN）实现：

$$
\begin{aligned}
\mathbf X^{(t)\prime}&=\mathbf X^{(t-1)}+\mathcal A_{\mathrm{Gram}}^{(t)}\left(\mathrm{LN}(\mathbf X^{(t-1)}),\mathbf B_G\right),\\
\mathbf X^{(t)}&=\mathbf X^{(t)\prime}+\mathrm{FFN}^{(t)}\left(\mathrm{LN}(\mathbf X^{(t)\prime})\right),
\end{aligned} \tag{34}
$$

其中 $\mathrm{LN}(\cdot)$ 表示 LayerNorm 算子，$\mathrm{FFN}^{(t)}(\cdot)$ 实现为两层 MLP：特征维度先由 $d_{\mathrm{model}}$ 扩展到 $4d_{\mathrm{model}}$，经 GELU 激活后投影回 $d_{\mathrm{model}}$。级联 $T$ 层，整体特征提纯过程可写为

$$
\mathbf X^{(T)}=\left(\mathcal H^{(T)}\circ\mathcal H^{(T-1)}\circ\cdots\circ\mathcal H^{(1)}\right)\left(\mathbf X^{(0)},\mathbf B_G\right). \tag{35}
$$

最终张量 $\mathbf X^{(T)}\in\mathbb R^{J\times d_{\mathrm{model}}}$ 包含每个 JAS 网格的提纯特征表示，用于后续支撑检测。

### D. 解耦头与损失函数

为简化本小节表述，先把二维张量 $\mathbf X^{(T)}$ 重塑为三维张量 $\tilde{\mathbf X}\in\mathbb R^{G\times N_{\mathrm{sub}}\times d_{\mathrm{model}}}$，其中 $[\tilde{\mathbf X}]_{g,s,:}\in\mathbb R^{d_{\mathrm{model}}\times1}$ 表示第 $(g,s)$ 个角度–子阵对的精化特征向量。随后设计解耦头结构以施加 (15) 中表述的组级与元素级稀疏性。

**1) 角度头（组级稀疏性）。** 第一个头评估第 $g$ 个采样角度处是否存在路径。由于非平稳路径可能只照亮部分子阵，标准平均池化不合适，因为把有效特征与其余空特征平均会稀释有效信息。因此采用动态注意力池化（AP）机制。具体地，评分网络 $\mathrm{MLP}_{\mathrm{attn}}(\cdot)$ 后接 softmax 评估特征 $[\tilde{\mathbf X}]_{g,s,:}$，计算归一化注意力系数 $w_{g,s}$，满足 $\sum_s w_{g,s}=1$。然后把特征 $\tilde{\mathbf X}$ 聚合为角度级表示 $\mathbf X_{\mathrm{ang}}$：

$$
[\mathbf X_{\mathrm{ang}}]_{g,:}=\sum_{s=1}^{N_{\mathrm{sub}}}w_{g,s}[\tilde{\mathbf X}]_{g,s,:}, \tag{36}
$$

再经小型 MLP 与 sigmoid 激活映射为组级概率 $\mathbf p_{\mathrm{ang}}\in[0,1]^{G\times1}$：

$$
[\mathbf p_{\mathrm{ang}}]_g=\mathrm{sigmoid}\left(\mathrm{MLP}_{\mathrm{ang}}([\mathbf X_{\mathrm{ang}}]_g)\right). \tag{37}
$$

**2) 子阵头（元素级稀疏性）。** 第二个头评估第 $g$ 个角度在第 $s$ 个子阵处的可见性。不同于角度头需要先聚合特征再检测，我们用另一个 MLP 网络 $\mathrm{MLP}_{\mathrm{sub}}(\cdot)$ 把特征张量 $\tilde{\mathbf X}$ 直接映射为二维概率图 $\mathbf P_{\mathrm{sub}}\in[0,1]^{G\times N_{\mathrm{sub}}}$：

$$
[\mathbf P_{\mathrm{sub}}]_{g,s}=\mathrm{sigmoid}\left(\mathrm{MLP}_{\mathrm{sub}}([\tilde{\mathbf X}]_{g,s,:})\right). \tag{38}
$$

本文中 $\mathrm{MLP}_{\mathrm{attn}}(\cdot)$、$\mathrm{MLP}_{\mathrm{ang}}(\cdot)$ 与 $\mathrm{MLP}_{\mathrm{sub}}(\cdot)$ 都由两个线性层与中间 GELU 激活组成。

**3) 损失函数与概率融合。** 训练阶段用解耦损失函数优化模型。令 $\mathbf T_{\mathrm{JAS}}\in\{0,1\}^{G\times N_{\mathrm{sub}}}$ 表示 JAS 域中的二维真值支撑图。由于只要至少一个子阵可见该角度网格就活跃，组级标签 $\mathbf t_{\mathrm{ang}}\in\{0,1\}^{G\times1}$ 由下式导出：

$$
[\mathbf t_{\mathrm{ang}}]_g=\mathbb I\left(\sum_{s=1}^{N_{\mathrm{sub}}}[\mathbf T_{\mathrm{JAS}}]_{g,s}>0\right), \tag{39}
$$

其中 $\mathbb I(\cdot)$ 表示指示函数。为处理高频信道的极端稀疏性造成的严重正负类不平衡，角度级支撑检测采用非对称损失（asymmetric loss，ASL）[29]：

$$
\mathcal L_{\mathrm{ang}}=-\frac{1}{G}\sum_{g=1}^{G}\left[[\mathbf t_{\mathrm{ang}}]_g(1-[\mathbf p_{\mathrm{ang}}]_g)^{\gamma_+}\log([\mathbf p_{\mathrm{ang}}]_g)+(1-[\mathbf t_{\mathrm{ang}}]_g)\left([\mathbf p_{\mathrm{ang}}]_g^\ast\right)^{\gamma_-}\log\left(1-[\mathbf p_{\mathrm{ang}}]_g^\ast\right)\right], \tag{40}
$$

其中 $[\mathbf p_{\mathrm{ang}}]_g^\ast=\max([\mathbf p_{\mathrm{ang}}]_g-\delta,0)$ 引入概率边际 $\delta$ 以丢弃易分类的非活跃角度。此外，$\gamma_+$ 与 $\gamma_-$ 分别表示正样本与负样本的聚焦参数。

对子阵级可见性预测，跨所有角度–子阵网格的标准二元交叉熵（BCE）损失不合适，因为子阵可见性只在相应角度活跃时才有定义。因此我们使用掩码 BCE 损失，只把属于活跃角度组的子阵标签纳入损失计算 [30]：

$$
\mathcal L_{\mathrm{sub}}=-\frac{1}{N'}\sum_{g=1}^{G}\sum_{s=1}^{N_{\mathrm{sub}}}[\mathbf t_{\mathrm{ang}}]_g\left[[\mathbf T_{\mathrm{JAS}}]_{g,s}\log([\mathbf P_{\mathrm{sub}}]_{g,s})+(1-[\mathbf T_{\mathrm{JAS}}]_{g,s})\log(1-[\mathbf P_{\mathrm{sub}}]_{g,s})\right], \tag{41}
$$

其中 $N'=N_{\mathrm{sub}}\sum_{g=1}^{G}[\mathbf t_{\mathrm{ang}}]_g$ 是掩码 BCE 损失涉及的网格数。于是总体训练损失为

$$
\mathcal L=\kappa_{\mathrm{ang}}\mathcal L_{\mathrm{ang}}+\kappa_{\mathrm{sub}}\mathcal L_{\mathrm{sub}}, \tag{42}
$$

其中 $\kappa_{\mathrm{ang}}$ 与 $\kappa_{\mathrm{sub}}$ 是平衡权重。

推断时，按两个输出的解耦训练设计融合它们。由于子阵头只在活跃角度组内受监督，$[\mathbf P_{\mathrm{sub}}]_{g,s}$ 自然表示在给定第 $g$ 个角度存在时第 $s$ 个子阵的条件可见概率。因此，第 $(g,s)$ 个 JAS 网格的最终支撑概率由角度级概率与条件子阵级概率相乘得到：

$$
\mathbf P=\mathrm{diag}(\mathbf p_{\mathrm{ang}})\mathbf P_{\mathrm{sub}}. \tag{43}
$$

最后，对 $\mathbf P$ 施加全局阈值 $\tau$ 得到二元支撑图 $\hat{\mathbf B}$，再由 (17) 得到支撑集 $\mathcal S$，用于第二阶段的增益估计。

## V. 实验结果

本节首先给出仿真设置并介绍用于比较的基线；随后给出仿真结果与消融研究，以评估所提框架的有效性。

### A. 仿真设置与基线定义

**1) 仿真设置：** 我们考虑载波频率 30 GHz 的通信系统。BS 配备 128 天线 ULA 与 $N_{\mathrm{RF}}=8$ 条 RF 链路。阵列分为 $N_{\mathrm{sub}}=8$ 个子阵以刻画空间非平稳性。此外，角度域量化为 $G=128$ 个网格，由此得到 JAS 码本大小 $J=1024$。对每个信道样本，路径数是 1 到 5 之间均匀分布的随机整数。对每条路径，空间角 $\theta_l$ 在 $[-1,1]$ 内均匀生成，复信道增益 $g_l$ 抽取自 $\mathcal{CN}(0,1)$。为模拟空间非平稳性，为每条路径分配随机子阵可见模式，可见子阵的数量与位置均随机生成。导频测量数 $Q$ 从 $[8,16]$ 均匀采样。此外，发射功率设为 30 dBm，信号 SNR 在 0 dB 与 20 dB 之间均匀采样。

为防止过拟合并增强泛化能力，训练数据通过动态流式方法生成，每个 epoch 即时实例化 20,000 个信道实现。为公平可复现地评估，使用固定的验证集与测试集，各含 10,000 个离线生成样本。所提模型配置为 $T=6$ 层、$N_{\mathrm{head}}=8$ 个注意力头、隐藏维度 $d_{\mathrm{model}}=128$。此外，模型用 AdamW 优化器端到端训练，批大小 32，初始学习率 $3\times10^{-4}$。训练 200 个 epoch，由带 5 epoch 预热的余弦退火学习率调度器调节。为稳定训练，梯度范数裁剪到 2.0。对 (40) 的 ASL，参数设为 $\gamma_-=2.0$、$\gamma_+=0.0$，概率边际 $\delta=0.05$，而 (42) 的平衡权重固定为 $\kappa_{\mathrm{ang}}=1.0$、$\kappa_{\mathrm{sub}}=1.0$。此外，硬阈值 $\tau$ 在验证集上以步长 0.01 在 $[0.05,0.95]$ 内最大化 F1 分数搜索得到，随后固定用于测试集上的性能评估。

**2) 基线定义：** 为评估所提框架，我们与八个代表性基线比较：

> **原文脚注 1：** 为便于复现，源代码将在论文录用后发布。  
> **原文脚注 2：** 为公平比较，所有基线在与所提方法相同的两阶段协议下实现，即先支撑检测后基于 LS 的增益估计；此外，Deep-SGL-ISTA、Deep-CFAR 与 U-Net 使用相同的真值支撑标签与 (40) 中相同的 ASL 损失训练。

- **OMP-DFT：** 采用经典 OMP 算法与标准 DFT 码本，用于说明空间非平稳引起的模型失配。
- **OMP-JAS：** 把 OMP 应用于 JAS 码本，用于评估串行贪心追踪在可见性感知 JAS 表示上进行支撑检测的局限。
- **SGL-ISTA：** 用 ISTA 求解 (15) 的 SGL 表述。每次迭代包含 (16) 的梯度更新，随后是元素级软阈值与组级收缩。
- **Deep-SGL-ISTA：** 实现 SGL-ISTA 的数据驱动变体，用可训练线性层参数化 SGL-ISTA 中的固定更新算子，并用可学习参数替换近端阈值 [25], [31]，在保留 SGL 结构的同时提高自适应性。
- **CA-CFAR：** 实现经典单元平均恒虚警率（CA-CFAR）检测器 [32]。对每个 JAS 网格，CA-CFAR 在排除保护单元后从邻近参考单元估计局部阈值，再把网格响应与阈值比较以确定支撑。
- **Deep-CFAR：** 实现受 CFAR 启发的局部 CNN 检测器 [33]，用轻量卷积神经网络（CNN）从网格周围局部上下文预测其支撑概率。
- **U-Net：** 基于 U-Net 架构的通用图像到掩码学习基线 [34], [35]。把变换后的匹配滤波响应 $\mathbf D(\mathbf u)$ 重塑为 $\mathbb R^{4\times G\times N_{\mathrm{sub}}}$ 张量，再经带跳连的卷积编码器–解码器预测二元支撑图。
- **Oracle LS：** 用真值支撑集执行 LS 估计，作为信道重建性能的上界。

### B. 支撑检测性能

我们首先在测试集上评估活跃支撑识别的准确性。除 Oracle LS 外，所有算法按精度、召回与 F1 分数比较 [36]。此外报告每个算法的平均运行时间，以比较计算效率。结果汇总于表 I。

如表 I 所示，所提方法在所有基线中取得最高精度、召回与 F1 分数。OMP+DFT 获得相对较高的召回，但因平稳 DFT 模型失配而精度低；OMP+JAS 表现更差，因为串行贪心选择无法有效处理 JAS 域支撑检测问题。与 CFAR 类方法相比，所提方法在精度与召回上均大幅提升，显示全局特征交互优于局部阈值化。对稀疏优化类方法，SGL-ISTA 相比贪心追踪提高了精度，但 F1 分数仍远低于所提方法；此外，其迭代收缩更新导致 29.04 ms 的运行时间，比所提方法慢一个数量级以上。尽管 Deep-SGL-ISTA 通过展开减少推理时间，其稀疏组恢复结构仍限制检测性能。此外，U-Net 提供了有竞争力的学习型基线，但它本质上把支撑检测视为图像到掩码问题，未显式利用 Gram 矩阵中嵌入的先验，因此与所提方法存在明显性能差距。通过用 Gram 域先验引导特征交互，所提方法在保持毫秒级推理的同时取得最佳精度–召回折中。

> **表 I（原文 Table I）：** 测试集上的支撑检测性能与运行时间比较。

| 算法 | 精度 (%) | 召回 (%) | F1 (%) | 运行时间 (ms) |
|---|---|---|---|---|
| OMP+DFT | 21.91 | 78.31 | 34.24 | 0.45 |
| OMP+JAS | 13.26 | 29.62 | 18.32 | 6.45 |
| SGL-ISTA | 35.18 | 53.01 | 42.29 | 29.04 |
| CA-CFAR | 4.00 | 15.00 | 6.32 | 0.68 |
| Deep-SGL-ISTA | 69.00 | 54.05 | 60.62 | 1.12 |
| Deep-CFAR | 65.19 | 49.19 | 56.07 | **0.42** |
| U-Net | 79.03 | 63.94 | 70.69 | 0.96 |
| Proposed | **91.29** | **81.89** | **86.34** | 2.14 |

### C. CE 性能随 SNR 变化

在评估支撑检测精度后，我们进一步用归一化均方误差（NMSE）比较信道重建精度：

$$
\mathrm{NMSE}=\frac{1}{N_{\mathrm{mc}}}\sum_{i=1}^{N_{\mathrm{mc}}}\frac{\left\|\mathbf h^{(i)}-\hat{\mathbf h}^{(i)}\right\|_2^2}{\left\|\mathbf h^{(i)}\right\|_2^2}, \tag{44}
$$

其中 $N_{\mathrm{mc}}=1000$ 表示 Monte Carlo 试验次数，$\mathbf h^{(i)}$ 与 $\hat{\mathbf h}^{(i)}$ 分别表示第 $i$ 个样本的真实与估计空间信道。基于该指标，我们考察跨不同 SNR 水平的算法鲁棒性，结果分别在固定与随机参数配置下绘于图 5 与图 6。

如图 5 所示，固定路径数 $L=3$、导频测量数 $Q=12$，把 SNR 从 0 dB 扫描到 10 dB。可以观察到所有评估算法的 NMSE 随 SNR 增加而持续下降。关键在于，所提方法在整个 SNR 区间显著优于所有基准，且性能最接近 Oracle LS 界。这表明检测到的支撑足够准确，可支撑有效的基于 LS 的信道重建。各基准中 U-Net 与 SGL-ISTA 表现相对有竞争力；然而 U-Net 缺乏显式 Gram 域物理引导，SGL-ISTA 受固定收缩规则限制，二者均不如所提方法。此外，Deep-CFAR 与 Deep-SGL-ISTA 随 SNR 增加出现早期性能平台，表明其对非平稳信道特征的自适应能力有限。OMP-DFT、OMP-JAS 与 CA-CFAR 等传统方案竞争力也更弱，因为其支撑决策主要依赖预定义匹配或局部统计，而非在 JAS 域表示上的自适应支撑推断。

为进一步验证架构在动态环境下的鲁棒性，图 6 评估每个信道实现中 $L$ 与 $Q$ 随机生成时的 NMSE 性能。尽管结构不确定性增加，所提方法仍保持相对所有基线算法的性能提升，并紧密跟踪 Oracle LS 曲线。这种优越的泛化能力表明，所提 Gram 注意力机制有效抑制字典诱导的泄漏，并能适应任意路径数与导频开销组合而无需重新训练模型。

> **图 5（原文 Fig. 5）：** 固定路径数与导频测量数时 CE NMSE 随 SNR 的变化，其余参数设为 $L=3$ 与 $Q=12$。

> **图 6（原文 Fig. 6）：** 随机路径数与导频测量数时 CE NMSE 随 SNR 的变化，其中每个信道实现的 $L$ 与 $Q$ 均随机生成。

### D. CE 性能随导频数变化

为展示所提模型在不同测量数下的鲁棒性，我们评估不同导频数 $Q$ 下的 CE 性能，仿真曲线分别见图 7 与图 8。

图 7 给出固定 $\mathrm{SNR}=3$ dB、$L=3$ 时 CE NMSE 随导频测量数 $Q$ 的变化。当 $Q$ 从 8 增至 16 时，所有算法 NMSE 性能改善，因为更多导频测量为支撑检测与增益估计提供更丰富的观测。所提方法在整个 $Q$ 范围内取得最佳性能。特别地，其 NMSE 在 $Q$ 从 8 增至 11 时明显下降，随后进入相对稳定区，表明所提 Gram 注意力检测器能以中等导频测量数获得可靠支撑信息。比较而言，U-Net 与 SGL-ISTA 也从 $Q$ 增加中获益，但其 NMSE 曲线与所提方法明显分离。此外，OMP-DFT、Deep-SGL-ISTA 与 Deep-CFAR 也随导频增多明显改善，但其 NMSE 仍在所提方法之上饱和，表明额外观测未充分转化为性能提升。OMP-JAS 与 CA-CFAR 的竞争力仍较弱，因为其决策依赖串行选择或局部统计。

图 8 进一步评估随机信道条件下的 NMSE 性能，其中 SNR 与路径数随信道实现变化。与固定设置不同，所提方法在整个 $Q$ 范围内保持高度稳定，并始终接近 Oracle LS 基准。这表明所提框架对变化的信道稀疏性与噪声条件鲁棒，而不是只在固定信道配置下有效。

> **图 7（原文 Fig. 7）：** 固定 SNR 与路径数时 CE NMSE 随导频测量数的变化，其余参数设为 $\mathrm{SNR}=3$ dB 与 $L=3$。

> **图 8（原文 Fig. 8）：** 随机信道条件下 CE NMSE 随导频测量数的变化，其中每个信道实现的 SNR 与路径数均随机生成。

### E. 消融研究

最后，为验证第 IV 节关键设计的有效性，我们通过移除或替换若干组件进行消融研究。具体考虑四个变体。1) **Proposed (w/o GB)：** 移除 (31) 中的 Gram 偏置（GB）项，使第 $m$ 个头的输出退化为 $\mathbf H_m^{(t)}=\mathrm{softmax}\left(\frac{\mathbf Q_m^{(t)}(\mathbf K_m^{(t)})^T}{\sqrt{d_{\mathrm{head}}}}\right)\mathbf V_m^{(t)}$。2) **Proposed (w/o QK)：** 移除 (31) 中数据驱动的查询–键注意力项，注意力图仅由 GB 决定，得到 $\mathbf H_m^{(t)}=\mathrm{softmax}([\mathbf B_G]_{m,:,:})\mathbf V_m^{(t)}$。3) **Proposed (w/o PE)：** 从 $\mathbf X^{(0)}$ 移除角度与子阵维度的二维 PE，即 $\bar{\mathbf E}_{\mathrm{ang}}$ 与 $\bar{\mathbf E}_{\mathrm{sub}}$。4) **Proposed (w/o AP)：** 把 (36) 的 AP 机制替换为沿子阵维度的标准平均池化。支撑检测指标汇总于表 II，相应 CE NMSE 性能在固定与随机信道配置下分别见图 9 与图 10。

如表 II、图 9 与图 10 所示，移除 Gram 诱导的物理先验（w/o GB）导致最严重退化，F1 分数下降 15.61%，且在所有 SNR 区域出现巨大 NMSE 性能差距。这凸显 Gram 先验在提纯每个网格高维表示中的关键作用。停用查询–键交互（w/o QK）或 PE（w/o PE）也会损害 F1 分数（分别下降 6.23% 与 5.38%）并明显抬高 NMSE，证实数据驱动特征交互与空间几何保留都不可或缺。最后，移除 AP（w/o AP）在支撑检测中造成可忽略的性能下降；然而完整所提模型在整个 SNR 范围内持续获得更好的信道重建性能，表明自适应 AP 精化组级特征并进一步提高 CE 精度。

> **表 II（原文 Table II）：** 测试集上的消融研究。

| 变体 | 精度 (%) | 召回 (%) | F1 (%) | $\Delta$F1 (%) |
|---|---|---|---|---|
| Proposed (w/o GB) | 81.03 | 62.75 | 70.73 | −15.61 |
| Proposed (w/o QK) | 86.07 | 74.91 | 80.11 | −6.23 |
| Proposed (w/o PE) | 87.51 | 75.33 | 80.96 | −5.38 |
| Proposed (w/o AP) | 91.87 | 81.29 | 86.26 | −0.08 |
| Proposed | 91.29 | 81.89 | 86.34 | 0.00 |

> **原文疑点：** 正文称移除 Gram 先验后"F1 分数下降 15.61%"、移除 QK/PE 后"分别下降 6.23% 与 5.38%"，但表 II 的 $\Delta$F1 列单位为百分点（86.34→70.73 为 15.61 个百分点，相对下降约 18.1%）；正文以"%"表述实为百分点口径，此处按原文照录并加注。

> **原文疑点：** 第 I 节贡献 4 与第 V-A 节称与"八个代表性基线"比较，但八个条目中的 Oracle LS 是使用真值支撑的上界参照（第 V-B 节也说明"除 Oracle LS 外"才参与精度/召回/F1 比较），并非可竞争的基线；此处按原文照录并加注。

> **图 9（原文 Fig. 9）：** 固定路径数与导频测量数时 CE NMSE 随 SNR 的变化，其余参数设为 $L=3$ 与 $Q=12$。

> **图 10（原文 Fig. 10）：** 随机路径数与导频测量数时 CE NMSE 随 SNR 的变化，其中每个信道实现的 $L$ 与 $Q$ 均随机生成。

## VI. 结论

本文从稀疏恢复角度研究了 XL-MIMO 系统中的空间非平稳 CE。为克服传统 DFT 码本的模型失配，我们提出一种新的 JAS 码本，联合刻画角度方向与子阵级可见性。基于该表示，我们进一步发展了信号处理与深度学习协同设计框架，把 CE 分解为基于 Gram 注意力的并行支撑检测与随后的基于 LS 的增益估计。首先，每个 JAS 网格的匹配滤波响应被嵌入高维特征向量。Gram 矩阵作为物理先验被纳入 MHSA 机制，以引导数据驱动的特征精化。提纯后的特征随后通过解耦头进行层次化支撑预测，检测到的支撑使基于 LS 的增益估计可在重建的低维字典上进行。仿真结果表明，与代表性基于模型与基于学习的基线相比，所提框架取得更优的支撑检测精度与 CE NMSE；消融研究进一步验证了 Gram 域物理先验与自适应特征精化的有效性。总体上，所提框架为稀疏表示上的并行支撑推断提供了有效的基于学习的解决方案。未来工作可通过分别引入俯仰角与距离维度，把所提可见性感知表示扩展到均匀平面阵列（UPA）与近场信道，从而联合刻画二维角度结构、球面波前与空间非平稳性。

## 参考文献（英文原书目）

- [1] M. Z. Chowdhury, M. Shahjalal, S. Ahmed, and Y. M. Jang, "6G wireless communication systems: Applications, requirements, technologies, challenges, and research directions," IEEE Open J. Commun. Soc., vol. 1, pp. 957–975, Jul. 2020.
- [2] C.-X. Wang et al., "On the road to 6G: Visions, requirements, key technologies, and testbeds," IEEE Commun. Surveys Tuts., vol. 25, no. 2, pp. 905–974, secondquarter 2023.
- [3] W. Jiang, B. Han, M. A. Habibi, and H. D. Schotten, "The road towards 6G: A comprehensive survey," IEEE Open J. Commun. Soc., vol. 2, pp. 334–366, Feb. 2021.
- [4] W. Jiang et al., "Terahertz communications and sensing for 6G and beyond: A comprehensive review," IEEE Commun. Surveys Tuts., vol. 26, no. 4, pp. 2326–2381, fourthquarter 2024.
- [5] A. Shafie, N. Yang, C. Han, J. M. Jornet, M. Juntti, and T. Kürner, "Terahertz communications for 6G and beyond wireless networks: Challenges, key advancements, and opportunities," IEEE Netw., vol. 37, no. 3, pp. 162–169, May/Jun. 2023.
- [6] J. Wang, X. Yu, and R. Schober, "Throughput analysis for near-field mobile communications: Beamfocusing or caustic beamforming?" 2026. [Online]. Available: https://arxiv.org/abs/2606.09652
- [7] R. W. Heath, N. González-Prelcic, S. Rangan, W. Roh, and A. M. Sayeed, "An overview of signal processing techniques for millimeter wave MIMO systems," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 436–453, Apr. 2016.
- [8] Z. Wang et al., "A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1560–1605, Jan. 2024.
- [9] X. Yu, J.-C. Shen, J. Zhang, and K. B. Letaief, "Alternating minimization algorithms for hybrid precoding in millimeter wave MIMO systems," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 485–500, Apr. 2016.
- [10] X. Gao, L. Dai, S. Han, C.-L. I, and R. W. Heath, "Energy-efficient hybrid analog and digital precoding for mmwave MIMO systems with large antenna arrays," IEEE J. Sel. Areas Commun., vol. 34, no. 4, pp. 998–1009, Mar. 2016.
- [11] A. Alkhateeb, O. El Ayach, G. Leus, and R. W. Heath, "Channel estimation and hybrid precoding for millimeter wave cellular systems," IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 831–846, Jul. 2014.
- [12] S. Liu, X. Yu, Z. Gao, J. Xu, D. W. K. Ng, and S. Cui, "Sensing-enhanced channel estimation for near-field XL-MIMO systems," IEEE J. Sel. Areas Commun., vol. 43, no. 3, pp. 628–643, Jan. 2025.
- [13] J. Lee, G.-T. Gil, and Y. H. Lee, "Channel estimation via orthogonal matching pursuit for hybrid MIMO systems in millimeter wave communications," IEEE Trans. Commun., vol. 64, no. 6, pp. 2370–2386, Apr. 2016.
- [14] E. D. Carvalho, A. Ali, A. Amiri, M. Angjelichinoski, and R. W. Heath, "Non-stationarities in extra-large-scale massive MIMO," IEEE Wireless Commun., vol. 27, no. 4, pp. 74–80, Aug. 2020.
- [15] Y. Chen and L. Dai, "Non-stationary channel estimation for extremely large-scale MIMO," IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7683–7697, Dec. 2024.
- [16] Y. Chen, M. Jian, and L. Dai, "Channel estimation for RIS assisted wireless communications: Stationary or non-stationary?" IEEE Trans. Signal Process., vol. 72, pp. 3776–3791, Aug. 2024.
- [17] Y. Han, S. Jin, C.-K. Wen, and X. Ma, "Channel estimation for extremely large-scale massive MIMO systems," IEEE Wireless Commun. Lett., vol. 9, no. 5, pp. 633–637, Jan. 2020.
- [18] S. Yang, P. An, P. Yang, X. Cao, D. O. Wu, and T. Q. S. Quek, "Adaptive subarray segmentation: A new paradigm of spatial non-stationary near-field channel estimation for XL-MIMO systems," 2025. [Online]. Available: https://arxiv.org/abs/2503.04211
- [19] Y. Zhu, H. Guo, and V. K. N. Lau, "Bayesian channel estimation in multi-user massive MIMO with extremely large antenna array," IEEE Trans. Signal Process., vol. 69, pp. 5463–5478, Sep. 2021.
- [20] Y. Han, M. Li, S. Jin, C.-K. Wen, and X. Ma, "Deep learning-based FDD non-stationary massive MIMO downlink channel reconstruction," IEEE J. Sel. Areas Commun., vol. 38, no. 9, pp. 1980–1993, Jun. 2020.
- [21] V. Chen and S. Qian, "Joint time-frequency transform for radar range-Doppler imaging," IEEE Trans. Aerosp. Electron. Syst., vol. 34, no. 2, pp. 486–499, Apr. 1998.
- [22] Y. C. Pati, R. Rezaiifar, and P. S. Krishnaprasad, "Orthogonal matching pursuit: recursive function approximation with applications to wavelet decomposition," in Proc. Asilomar Conf. Signals, Syst. Comput., vol. 1, 1993, pp. 40–44.
- [23] J. A. Tropp and A. C. Gilbert, "Signal recovery from random measurements via orthogonal matching pursuit," IEEE Trans. Inf. Theory, vol. 53, no. 12, pp. 4655–4666, Dec. 2007.
- [24] N. Simon, J. Friedman, T. Hastie, and R. Tibshirani, "A sparse-group Lasso," J. Comput. Graph. Statist., vol. 22, no. 2, pp. 231–245, May 2013.
- [25] J. Zhang and B. Ghanem, "ISTA-Net: Interpretable optimization-inspired deep network for image compressive sensing," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR), 2018, pp. 1828–1837.
- [26] M. Xiao et al., "Millimeter wave communications for future mobile networks," IEEE J. Sel. Areas Commun., vol. 35, no. 9, pp. 1909–1935, Jun. 2017.
- [27] S. M. Kay, Fundamentals of Statistical Signal Processing: Estimation Theory. Englewood Cliffs, NJ, USA: Prentice-Hall, 1993, vol. 1.
- [28] A. Vaswani et al., "Attention is all you need," in Proc. Adv. Neural Inf. Process. Syst., vol. 30, 2017, pp. 5998–6008.
- [29] T. Ridnik et al., "Asymmetric loss for multi-label classification," in Proc. IEEE/CVF Int. Conf. Comput. Vis. (ICCV), Feb. 2021, pp. 82–91.
- [30] J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, "You only look once: Unified, real-time object detection," in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), Dec. 2016, pp. 779–788.
- [31] K. Gregor and Y. LeCun, "Learning fast approximations of sparse coding," in Proc. 27th Int. Conf. Mach. Learn. (ICML), 2010, pp. 399–406.
- [32] H. Rohling, "Radar CFAR thresholding in clutter and multiple target situations," IEEE Trans. Aerosp. Electron. Syst., vol. AES-19, no. 4, pp. 608–621, Jul. 1983.
- [33] L. Wang, J. Tang, and Q. Liao, "A study on radar target detection based on deep neural networks," IEEE Sensors Lett., vol. 3, no. 3, pp. 1–4, Jan. 2019.
- [34] O. Ronneberger, P. Fischer, and T. Brox, "U-net: Convolutional networks for biomedical image segmentation," in Proc. Int. Conf. Med. Image Comput. Comput.-Assist. Intervent. (MICCAI). Springer, 2015, pp. 234–241.
- [35] J. Wang et al., "Linear-geometry distortion correction for bistatic inverse synthetic aperture radar imaging based on deep learning model," in Proc. IEEE Int. Geosci. Remote Sens. Symp. (IGARSS), 2024, pp. 11 414–11 417.
- [36] D. M. W. Powers, "Evaluation: from precision, recall and F-measure to ROC, informedness, markedness and correlation," arXiv preprint arXiv:2010.16061, 2020.

## 图注与表注索引

本页图 1–10 的中文图注与表 I–II 的表注均按原文出现位置内联在正文中（图 1 见第 II-B 节，图 2 见第 III-B 节，图 3–4 见第 IV-A/C 节，图 5–10 见第 V 节；表 I 见第 V-B 节，表 II 见第 V-E 节），此处不重复罗列。原文为 IEEE 期刊单栏排版（双栏宽表），图以浮动方式穿插于正文，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.26437v1 全文（13 页）的中文译稿：摘要、索引词、第 I–VI 节正文与编号小节、图 1–10 的中文图注、表 I–II 的逐格转写、参考文献 36 条英文原条目（按原编号）。原文无附录。公式与表格已对照 PDF 渲染页核对：式 (1)–(44) 逐式核对（重点式 (9)–(12)、(15)–(16)、(21)–(24)、(31)–(34)、(40)–(44)），表 I 用第 10 页、表 II 用第 12 页渲染图逐格核对（并与 pymupdf 表格抽取交叉验证）。已加注两处原文疑点：正文以"%"表述的 F1 下降（15.61%/6.23%/5.38%）实为百分点口径；"八个基线"中包含 Oracle LS 上界参照而非可竞争基线。本页不上传原文图片，图内曲线与图例数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
