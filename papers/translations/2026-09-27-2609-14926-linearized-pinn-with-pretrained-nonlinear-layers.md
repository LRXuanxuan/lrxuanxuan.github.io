---
layout: page
title: "带预训练非线性层的线性化 PINN｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-14926-linearized-pinn-with-pretrained-nonlinear-layers/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/23374adc12c265ee/) · [原文 arXiv](https://arxiv.org/abs/2609.14926) · [全部目录](/papers/catalog/)

# 带预训练非线性层的线性化 PINN

**原题：** Linearized PINN with pretrained nonlinear layers  
**作者：** Wenhao Chen、Alexandre Tartakovsky  
**版本：** arXiv:2609.14926v1（math.AP），2026-09-14；文稿标注日期 2026-09-15，原文 30 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含 2.1/2.2、3.1–3.4 全部小节）、结论、致谢、附录 6.1 的超参数汇总（表 3–16 逐格）、正文表 1–表 2、图 1–20 图注、参考文献 [1]–[29]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

我们提出线性化物理信息神经网络（Linearized Physics-Informed Neural Network，lPINN），一种用于求解正问题与逆问题偏微分方程的降阶神经基方法。在**离线**阶段，lPINN 从数值解集学习与算子相容的连续神经基函数；这些函数用由偏微分方程（PDE）解及其导数构成的数据集预训练。所学基函数通过自动微分可微，从而支持基于物理的推断。对每个新的问题实例，基函数被冻结，解通过最小化控制方程残差以及相应的初始、边界、正则与观测项来确定。该表述不同于直接代理模型与算子学习方法：训练数据集在离线步决定基函数，而实例特定解通过在线施加控制物理获得。对线性微分算子，在线 lPINN 问题化为正则化线性最小二乘；对非线性算子，它仍为非线性，但被限制在低维基系数上。在逆问题中，降阶系数与未知物理参数由物理残差与稀疏观测联合估计。与原版 PINN 相比，预训练基函数相当于在离线步估计（非线性）隐藏层参数、在在线步学习最后（线性）层参数。

我们在对流—扩散方程、Burgers 方程与非线性单摆方程的正问题与逆问题上评估 lPINN。实验比较了导数匹配与基于残差的基预训练，并展示了与 Fourier 特征网络对振荡解的兼容性。与原始 PINN 相比，在所报告测试用例中 lPINN 取得更低的解误差与参数误差，同时把在线推断时间从约一个数量级缩短到三个数量级以上；当残差点或测量数据受限时增益通常最大。跨分辨率测试进一步表明，所学连续表示可在更细网格上评估而无需重新训练，且精度几乎不变。这些结果表明，当离线代价可在大量正问题或逆问题查询上摊销时，lPINN 可成为 PINN 的有效替代方案。

## 1 引言

物理信息神经网络（physics-informed neural networks，PINNs）为求解由微分方程支配的正问题与逆问题提供了灵活框架：它用基于坐标的神经网络表示未知状态，并把控制方程、初始与边界条件以及可用观测纳入训练目标 [1]、[2]。在正问题中，网络参数被优化以获得满足给定物理约束的 PDE 解的连续近似；在逆问题中，未知物理参数被纳入优化变量，与状态一起由物理约束和观测数据联合估计 [3]、[4]。该表述已促成在流体与固体力学、输运、参数辨识与本构模型发现中的应用。然而其灵活性付出了可观计算代价：传统 PINN 训练为每个问题实例估计全部网络参数，形成高维、非凸且往往病态的优化问题；收敛性可能强烈依赖初始化、损失加权与采样，且网络可能无法分辨物理上重要的特征。这些困难在刚性、对流占优、振荡与多尺度系统中尤为突出 [5]。在需要多次求解 PDE 的问题中，PINN 的计算负担更为显著，这限制了它在不确定性量化、灵敏度分析、优化与时限预测中的适用性。

为改善 PINN 的优化与表示性质，已有多种技术被提出。拟牛顿及相关方法可提高非线性与刚性问题训练的稳定性与精度 [6]；自适应加权与预条件策略旨在平衡目标中的物理、边界、初始与观测项 [7]；Fourier 特征与谱结构改善振荡或高频分量的表示，并能缓解标准多层感知机的谱偏置 [8]、[9]。尽管这些进展可改善单实例训练，它们并未消除为每个新问题优化大型非线性表示的需要。本文通过结合降阶建模、可微神经场与物理信息系数推断的思想，来处理这一重复优化瓶颈。

我们提出 lPINN 作为面向需要求解多个正/逆 PDE 问题的神经降阶方法。在离线阶段，把数值解集合分解为平均场与起伏；用基于坐标的神经网络近似平均场以及起伏降阶表示所需的一组共享基函数。基函数可通过匹配状态与算子相关导数来预训练，也可通过用控制方程、初值与边界条件残差增强状态重构来预训练。在在线阶段，系数通过最小化控制方程残差与相应的初始、边界、正则和观测项来确定。由于基函数可微，该推断在标准 PINN 框架内完成：自动微分提供每个基函数的导数，而优化仅限于最后一层的系数。对线性微分算子与线性约束，在线问题是通常秩条件或正正则化条件下的正则化线性最小二乘；对非线性算子，它是降维非线性最小二乘问题。在逆问题中，降阶系数与未知物理参数被联合估计。

标准降阶方法建立在参数化微分方程的离线—在线范式之上：离线阶段用高保真快照构造低维基函数空间（常用本征正交分解，proper orthogonal decomposition）；在线阶段在该空间中近似状态，并由投影后的控制模型确定其降阶坐标 [10]、[11]。当离线代价在针对不同参数查询的大量 PDE 求解上摊销时，该分解可带来显著节省。然而标准基受限于定义快照向量与降阶算子的空间或时空离散：导数继承自全阶离散，把基迁移到不同网格或在任意坐标处评估状态通常需要插值、重构或新的离散。lPINN 保留离线—在线结构，但用依赖坐标的神经基替代离散快照基：所得基函数关于空间与时间连续且通过自动微分可微，因此微分算子可直接作用于任意配点处的基函数，降阶系数可用与 PINN 相同的强形式可微残差机制估计。

残差最小化降阶方法通过最小化控制方程残差来确定降阶系数，例如最小二乘 Petrov–Galerkin 方法与物理信息 Karhunen–Loève 展开（PICKLE）方法 [12]–[15]。时空扩展（包括时空 LSPG 与动态 PICKLE，dynamic PICKLE，dPICKLE）构造完整轨迹的低维表示，并在空间与时间上联合最小化残差 [16]、[17]；这同时降低空间与时间维度，避免在每个全阶时间步上演化空间降阶模型。然而在这些方法中，基函数、残差算子与降阶解一般定义在用于构造模型的离散之上。lPINN 采用相关的残差最小化策略，但用依赖坐标的神经网络表示时空基函数：每个基函数同时依赖空间与时间坐标，单个系数向量表示完整轨迹。由于基函数连续且通过自动微分可微，微分方程残差可在任意配点处评估，与离线快照网格无关；这支持跨分辨率评估，并使在线配点集可以不同于、且可能细于生成训练集合所用离散。对线性微分算子，在线 lPINN 问题化为正则化线性最小二乘；对非线性算子，它仍为非线性，但被限制在降阶系数（逆问题中还包括未知物理参数）上。这种灵活性要求离线训练神经基，且与其他基于快照的方法一样依赖训练集合的代表性。

连续试探空间把 lPINN 与神经场（也称为隐式神经表示）联系起来：神经场把坐标映射为物理或几何量，提供连续、可微、可独立于训练离散查询的表示 [18]。近期连续降阶建模方法用神经场表示解流形并演化低维隐状态，从而消除传统 ROM 基对特定网格的直接依赖 [19]；物理信息条件神经场 ROM 进一步通过自动微分纳入微分方程残差，并考虑初值与边界条件的精确处理 [20]。lPINN 同样使用基于坐标的可微表示，但其降阶坐标的作用不同：它不是学习由隐动力学模型驱动的非线性解码器，而是把最后一个隐藏层的特征当作线性神经试探基，直接由控制残差与可用观测确定实例特定的系数向量。该构造保持了透明的降阶展开，在微分算子与约束线性时给出线性在线求解，并自然支持状态与参数的联合估计，而无需额外学习隐演化律或参数—隐变量映射。

第二类密切相关的方法是极端学习与随机特征物理信息方法。物理信息极端学习机冻结随机生成的隐藏层参数，由物理与边界约束确定输出权重，从而对线性微分方程给出快速线性求解 [21]、[22]；随机特征方法同样在给定随机非线性特征空间中近似解，并通过配点与最小二乘估计系数 [23]。这些方法展示了把训练限制在线性输出权重上的计算优势；然而其特征空间一般是随机的或与问题无关的，可能需要大量特征、多尺度构造、区域分解或仔细的重新缩放才能表示参数化解族。在 lPINN 中，非线性特征不是随机的，而是从解集合离线学习，并可训练以不仅复现状态，还复现控制算子所需的导数或残差量，因此所学特征构成适配解流形的算子相容降阶基。在线推断保留输出层优化的效率，同时使用同时由解集合以及（在需要时）控制物理所塑造的特征空间。

迁移学习 PINN 也在相关微分方程之间复用表示：标准迁移学习用相关问题上训练的参数初始化新 PINN，再微调部分或全部网络层。特别相关的是 Desai 等人的一次性（one-shot）方法 [24]：它冻结捆绑训练 PINN 的隐藏层，并为新的线性常微分与偏微分方程调整最终线性层，该工作确立了最终层适配可把线性正问题转化为线性最小二乘求解。lPINN 建立在冻结非线性特征这一普遍效率原则之上，但目标与范围不同：其离线表示被明确构造为来自数值解集合的均值—起伏降阶基，并用导数匹配或基于残差的目标使基与目标算子相容；其在线表述覆盖非线性正问题（只优化降阶系数）与逆问题（系数与未知物理参数由物理与稀疏数据联合估计）。因此，lPINN 更应被视为物理校正的神经降阶基方法，而非传统参数微调。

神经算子以另一种途径摊销 PDE 求解代价：DeepONet 通过分支与主干网络学习算子，Fourier 神经算子则用 Fourier 空间参数化的积分核层学习函数空间之间的映射 [25]、[26]。训练完成后，这些方法直接把系数、源项、初始条件或边界数据映射为解场，并可在不求解问题特定优化的情况下评估新实例。物理信息算子学习方法（包括物理信息 DeepONet 与物理信息神经算子）把控制方程残差纳入算子训练，以降低数据需求并改善物理一致性 [27]、[28]。lPINN 不同于纯数据驱动与物理信息神经算子，因为它不学习完整的输入—解映射：离线数据用于学习试探空间，而非最终状态或其降阶坐标的直接预测器；对每个新实例，系数通过施加该实例的控制方程、条件与观测重新计算。这种在线物理校正可使预测适配特定查询，并纳入稀疏测量而无需重新训练全局算子，也避免为每个可能的参数、源项、初始条件或边界函数构造显式编码。代价是 lPINN 需要一次小型在线求解，而神经算子通常只提供一次前馈预测。

lPINN 表述具有若干方法学优势。第一，它把降阶基方法的降维与离线—在线摊销，与可在任意坐标处评估和微分的连续神经表示结合起来。第二，它执行问题特定的残差最小化（不同于代理模型），因此数值快照定义可容许的试探空间，却不完全决定新查询处的解。第三，算子相容预训练可把表示能力集中于控制在线残差的状态与导数，不同于随机特征方法。第四，对最后一层系数的线性依赖使线性算子下的在线问题为凸，并大幅降低非线性正问题与逆问题的优化维度。第五，观测可直接纳入降阶物理目标，从而在统一表述中进行状态与参数推断。这些收益伴随基于快照的模型降阶的常见局限：离线集合必须充分覆盖预期的解流形，且离线仿真与基训练代价必须在足够多的查询上摊销。

本文主要贡献如下：

1. 我们发展出从数值解集合学习的算子相容连续神经基函数。这些依赖坐标的基函数通过自动微分可微，并可用状态与导数信息、或用由 PDE 残差增强的状态数据预训练。
2. 我们把正问题预测表述为预训练基函数空间内基于残差的系数推断。在线问题对线性算子化为正则化线性最小二乘、对非线性算子化为降维非线性最小二乘，避免对完整非线性网络的重复优化。
3. 我们把降阶表述扩展到逆问题：由 PDE 残差与稀疏观测联合估计基函数系数与未知物理参数。
4. 我们演示了与表示增强架构（包括面向振荡解的 Fourier 特征）的兼容性，并研究构造算子相容神经基的导数匹配与基于残差策略。

数值实验考虑对流—扩散方程、Burgers 方程与非线性单摆方程的正问题与逆问题。数值研究检验本文核心假设：神经表示学习可与问题特定物理推断分离，从而使重复的正问题与逆问题无需为每个新实例优化完整非线性网络。因此我们以原版 PINN 作为后续实验的主要基线，并与一种残差最小化 ROM [17] 进行比较；与经典投影型及非线性 ROM 的系统比较超出本文范围，留待未来研究。实验考察预测精度、参数估计、在线计算代价、对残差与测量采样的敏感性、基维度与正则化的影响，以及所学连续表示在不同评估分辨率之间的迁移。

## 2 方法

### 2.1 原版物理信息神经网络（PINN）

考虑如下形式的 PDE：

$$
\mathcal L(h(\mathbf x,t);\mathbf y)=0,\quad \mathbf x\in\Omega,\ t\in(0,T], \tag{1}
$$

受初始条件

$$
h(\mathbf x,0)=h_0(\mathbf x),\quad \frac{\partial h}{\partial t}(\mathbf x,0)=h_1(\mathbf x),\quad \mathbf x\in\Omega, \tag{2}
$$

与边界条件

$$
\mathcal B(h(\mathbf x,t))=g(\mathbf x,t),\quad \mathbf x\in\Gamma,\ t\in(0,T], \tag{3}
$$

约束，其中 $\mathcal L$ 为已知微分算子，$\Omega$ 为边界为 $\Gamma=\partial\Omega$ 的空间域，$T$ 为时间范围，$h(\mathbf x,t)$ 为解，$\mathbf y$ 表示系统的物理参数，$h_0(\mathbf x)$ 与 $h_1(\mathbf x)$ 为零阶与一阶初始条件，$\mathcal B$ 为边界算子，$g(\mathbf x,t)$ 为给定边界数据。

在 PINN 框架中，解 $h(\mathbf x,t)$ 由含可训练参数 $\boldsymbol\theta$ 的神经网络 $\hat h(\mathbf x,t;\boldsymbol\theta)$ 近似。在正问题中物理参数 $\mathbf y$ 已知，网络参数通过最小化残差最小二乘损失确定：

$$
\boldsymbol\theta^*=\arg\min_{\boldsymbol\theta}\left\{\frac{1}{N_{\mathrm{res}}}\sum_{i=1}^{N_{\mathrm{res}}}\left[\mathcal L\left(\hat h(\mathbf x_i^r,t_i^r;\boldsymbol\theta);\mathbf y\right)\right]^2
+\frac{\lambda_{\mathrm{BC}}}{N_{\mathrm{BC}}}\sum_{j=1}^{N_{\mathrm{BC}}}\left[\mathcal B\left(\hat h(\mathbf x_j^{\mathrm{BC}},t_j^{\mathrm{BC}};\boldsymbol\theta)\right)-g(\mathbf x_j^{\mathrm{BC}},t_j^{\mathrm{BC}})\right]^2
+\frac{\lambda_{\mathrm{IC},0}}{N_{\mathrm{IC}}}\sum_{k=1}^{N_{\mathrm{IC}}}\left[\hat h(\mathbf x_k^{\mathrm{IC}},0;\boldsymbol\theta)-h_0(\mathbf x_k^{\mathrm{IC}})\right]^2
+\frac{\lambda_{\mathrm{IC},1}}{N_{\mathrm{IC}}}\sum_{k=1}^{N_{\mathrm{IC}}}\left[\frac{\partial\hat h(\mathbf x_k^{\mathrm{IC}},0;\boldsymbol\theta)}{\partial t}-h_1(\mathbf x_k^{\mathrm{IC}})\right]^2
+\lambda\|\boldsymbol\theta\|_2^2\right\}, \tag{4}
$$

其中 $\lambda_{\mathrm{BC}}$、$\lambda_{\mathrm{IC},0}$、$\lambda_{\mathrm{IC},1}$ 分别为边界项与初始项权重，$\lambda$ 为 $L_2$ 正则化权重，$N_{\mathrm{res}}$、$N_{\mathrm{BC}}$、$N_{\mathrm{IC}}$ 分别为内部、边界与初始域配点数。

在逆问题中，$\mathbf y$ 被视为额外可训练变量，并与 $\boldsymbol\theta$ 一起由物理约束和 $h$ 的测量 $\{(X_i^s,T_i^s,h_i^s)\}_{i=1}^{N_m}$ 联合估计，其中 $X_i^s$ 与 $T_i^s$ 为测量的时空坐标，$h_i^s$ 为测量值。逆 PINN 表述为

$$
(\boldsymbol\theta^*,\mathbf y^*)=\arg\min_{\boldsymbol\theta,\mathbf y}\left\{\frac{1}{N_{\mathrm{res}}}\sum_{i=1}^{N_{\mathrm{res}}}\left[\mathcal L\left(\hat h(\mathbf x_i^r,t_i^r;\boldsymbol\theta);\mathbf y\right)\right]^2
+\frac{\lambda_{\mathrm{BC}}}{N_{\mathrm{BC}}}\sum_{j=1}^{N_{\mathrm{BC}}}\left[\mathcal B\left(\hat h(\mathbf x_j^{\mathrm{BC}},t_j^{\mathrm{BC}};\boldsymbol\theta)\right)-g(\mathbf x_j^{\mathrm{BC}},t_j^{\mathrm{BC}})\right]^2
+\frac{\lambda_{\mathrm{IC},0}}{N_{\mathrm{IC}}}\sum_{k=1}^{N_{\mathrm{IC}}}\left[\hat h(\mathbf x_k^{\mathrm{IC}},0;\boldsymbol\theta)-h_0(\mathbf x_k^{\mathrm{IC}})\right]^2
+\frac{\lambda_{\mathrm{IC},1}}{N_{\mathrm{IC}}}\sum_{k=1}^{N_{\mathrm{IC}}}\left[\frac{\partial\hat h(\mathbf x_k^{\mathrm{IC}};\boldsymbol\theta)}{\partial t}-h_1(\mathbf x_k^{\mathrm{IC}})\right]^2
+\frac{\lambda_{\mathrm{data}}}{N_m}\sum_{i=1}^{N_m}\left[\hat h(X_i^s,T_i^s;\boldsymbol\theta)-h_i^s\right]^2
+\lambda\|\boldsymbol\theta\|_2^2\right\}, \tag{5}
$$

其中倒数第二项表示网络预测与测量数据之间的数据失配。式 (4) 与 (5) 的优化问题关于神经网络参数是非线性最小二乘问题。随着可训练参数增多，优化可能严重病态，导致收敛缓慢、鲁棒性下降，对刚性、非线性 PDE 尤其如此。

### 2.2 线性化物理信息神经网络（lPINN）

我们的目标是用 PDE 解集合（称为训练数据集）预训练 DNN 的部分参数，从而简化 PINN 训练：

$$
\mathcal D_{\mathrm{train}}=\left\{\left(g^{(i)},\mathbf y^{(i)},h_0^{(i)},h_1^{(i)}\right)\mapsto h^{(i)}\right\}_{i=1}^{N_{\mathrm{train}}},
$$

其中每个样本由不同的 PDE 参数、初始与边界条件实例，以及相应地在 $N_x$ 个空间节点与 $N_t$ 个时间步的网格上得到的 PDE 解向量 $h$ 组成。

首先把 PDE 解分解为样本均值 $\bar h(\mathbf x,t)$ 与起伏 $h'(\mathbf x,t)$：

$$
h(\mathbf x,t)=\bar h(\mathbf x,t)+h'(\mathbf x,t). \tag{6}
$$

$\bar h(\mathbf x,t)$ 与 $h'(\mathbf x,t)$ 均由 DNN 近似。起伏场由 DNN 近似为

$$
h'(\mathbf x,t)\approx\hat h'(\mathbf x,t;\boldsymbol\theta)=\mathcal{NN}(\mathbf z;\boldsymbol\theta), \tag{7}
$$

其中 $\mathbf z=[\mathbf x,t]^T$ 为输入向量，$\boldsymbol\theta$ 为可训练网络参数集合。为一般性，考虑含 $N$ 个隐藏层的全连接网络：

$$
\mathcal{NN}(\mathbf z;\boldsymbol\theta)=\rho_{N+1}\left(\rho_N\left(\rho_{N-1}\left(\cdots\rho_1(\mathbf z)\right)\right)\right), \tag{8}
$$

其中每层定义为

$$
\mathbf z_{i+1}=\rho_i(\mathbf W_i\mathbf z_i+\mathbf b_i),\quad i=1,\ldots,N, \tag{9}
$$

且 $\mathbf z_1=\mathbf z$。这里 $\mathbf W_i$ 与 $\mathbf b_i$ 为第 $i$ 层的权重与偏置，$\rho_i$ 为激活函数。本文隐藏层使用双曲正切激活函数，输出层使用恒等函数。因此完整参数集为 $\boldsymbol\theta=(\mathbf W_{1:N+1},\mathbf b_{1:N+1})$。由于激活函数的选择，网络关于隐藏层参数 $\tilde{\boldsymbol\theta}=(\mathbf W_{1:N},\mathbf b_{1:N})$ 非线性，关于输出层参数 $\mathbf W_{N+1}$ 与 $\mathbf b_{N+1}$ 线性。记最后一个隐藏层规模为 $N_\eta$，并注意对标量状态变量输出层只有一个输出，因此 $\mathbf W_{N+1}$ 为 $N_\eta$ 维向量、$\mathbf b_{N+1}$ 为标量。由于我们用 DNN 建模均值周围的起伏，取 $\mathbf b_{N+1}=0$。最终可把起伏表示为

$$
\hat h'(\mathbf z;\boldsymbol\theta)=\hat h'(\mathbf z;\tilde{\boldsymbol\theta},\mathbf W_{N+1})=\mathbf W_{N+1}\cdot\boldsymbol\psi(\mathbf z;\tilde{\boldsymbol\theta}), \tag{10}
$$

其中 $\boldsymbol\psi=[\psi_1,\ldots,\psi_{N_\eta}]^T$，$\psi_i(\mathbf z;\tilde{\boldsymbol\theta})$ 为最后一个隐藏层第 $i$ 个神经元的输出。

式 (10) 把 $h'(\mathbf x,t)$ 展开为依赖时空的参数化基函数 $\psi_i(\mathbf x,t;\tilde{\boldsymbol\theta})$ 与系数 $\mathbf W_{N+1}$ 之积。由于 $\psi_i(\mathbf x,t;\tilde{\boldsymbol\theta})$ 由 DNN 层定义，我们称其为**神经基函数**。

如有限元、POD-ROM 与其他降阶方法一样，假设解流形可由一组与 PDE 参数、初始条件、边界条件无关的基函数近似；PDE 参数、初始与边界条件对解的影响由 $\mathbf W_{N+1}$ 捕获。在标准 PINN 中，$\tilde{\boldsymbol\theta}$ 与 $\mathbf W_{N+1}$ 通过最小化 PDE 残差联合学习，得到高度非线性的最小二乘问题。

lPINN 的关键思想是在“离线”阶段从训练数据集 $\{\mathbf y^{(i)}\to h^{(i)}\}_{i=1}^{N_{\mathrm{train}}}$ 学习基函数（即估计 $\tilde{\boldsymbol\theta}$），而“在线”仅通过最小化 PDE 残差估计 $\mathbf W_{N+1}$。训练数据集中 $\mathbf y^{(i)}$ 为来自期望范围的参数样本，$h^{(i)}$ 为相应解（一般由数值方法）在含 $N_e$ 个单元或网格点的网格上得到。

平均场由另一个同样离线训练的 DNN 近似：

$$
\bar h(\mathbf x,t)\approx\hat{\bar h}(\mathbf x,t;\boldsymbol\gamma)=\mathcal{NN}(\mathbf z;\boldsymbol\gamma), \tag{11}
$$

其中 $\boldsymbol\gamma$ 为可训练参数集合。DNN $\hat{\bar h}(\mathbf x,t;\boldsymbol\gamma)$ 用样本均值训练：

$$
\bar h\approx\frac{1}{N_{\mathrm{train}}}\sum_{i=1}^{N_{\mathrm{train}}}h^{(i)}. \tag{12}
$$

我们希望 $\hat{\bar h}(\mathbf x,t;\boldsymbol\gamma)$ 与 $\hat h'(\mathbf x,t;\boldsymbol\theta)$ 不仅准确近似 $h(\mathbf x,t)$，还准确近似控制方程中出现的全部导数。为一般性，假设 $\mathcal L$ 含一阶与二阶时空导数；于是用其导数 $\partial_t\bar h$、$\partial_x\bar h$、$\partial_{xx}\bar h$、$\partial_{tt}\bar h$ 补充 $\bar h$ 数据，这些导数可在计算 $\bar h$ 所用的同一时空网格上数值计算。于是 $\boldsymbol\gamma$ 可通过求解最小化 $\hat{\bar h}(\mathbf z;\boldsymbol\gamma)$、$\bar h$ 及其导数之间失配的优化问题得到：

$$
\boldsymbol\gamma^*=\arg\min_{\boldsymbol\gamma}\Big\{\|\hat{\bar h}(\boldsymbol\gamma)-\bar h\|_2^2+\lambda_1\|\partial_t\hat{\bar h}(\boldsymbol\gamma)-\partial_t\bar h\|_2^2
+\lambda_2\|\partial_x\hat{\bar h}(\boldsymbol\gamma)-\partial_x\bar h\|_2^2+\lambda_3\|\partial_{xx}\hat{\bar h}(\boldsymbol\gamma)-\partial_{xx}\bar h\|_2^2
+\lambda_4\|\partial_{tt}\hat{\bar h}(\boldsymbol\gamma)-\partial_{tt}\bar h\|_2^2+\lambda\|\boldsymbol\gamma\|_2^2\Big\}, \tag{13}
$$

其中 $\hat{\bar h}(\boldsymbol\gamma)$、$\partial_t\hat{\bar h}(\boldsymbol\gamma)$、$\partial_x\hat{\bar h}(\boldsymbol\gamma)$、$\partial_{xx}\hat{\bar h}(\boldsymbol\gamma)$、$\partial_{tt}\hat{\bar h}(\boldsymbol\gamma)$ 分别为在时空网格上求值的 $\hat{\bar h}(\mathbf x,t;\boldsymbol\gamma)$ 及其导数向量。权重 $\lambda_1,\lambda_2,\lambda_3,\lambda_4$ 与 $\lambda$ 用于平衡各项，由网格搜索选取。

类似地，$\tilde{\boldsymbol\theta}$ 由数据集 $\{h'^{(i)},\partial_th'^{(i)},\partial_{tt}h'^{(i)},\partial_xh'^{(i)},\partial_{xx}h'^{(i)}\}_{i=1}^{N_{\mathrm{train}}}$ 估计，其中 $h'^{(i)}=h^{(i)}-\bar h$。系数 $\{\mathbf W_{N+1}^{(i)}\}_{i=1}^{N_{\mathrm{train}}}$ 通过求解如下最小化问题得到：

$$
\tilde{\boldsymbol\theta}^*,\left\{\mathbf W_{N+1}^{(i)}\right\}_{i=1}^{N_{\mathrm{train}}}=\arg\min_{\tilde{\boldsymbol\theta},\{\mathbf W_{N+1}^{(i)}\}}\sum_{i=1}^{N_{\mathrm{train}}}\Big\{\|\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})-h'^{(i)}\|_2^2+\lambda_1\|\partial_t\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})-\partial_th'^{(i)}\|_2^2
+\lambda_2\|\partial_x\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})-\partial_xh'^{(i)}\|_2^2+\lambda_3\|\partial_{xx}\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})-\partial_{xx}h'^{(i)}\|_2^2
+\lambda_4\|\partial_{tt}\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})-\partial_{tt}h'^{(i)}\|_2^2\Big\}
+\lambda\left(\|\tilde{\boldsymbol\theta}\|_2^2+\sum_{i=1}^{N_{\mathrm{train}}}\|\mathbf W_{N+1}^{(i)}\|_2^2\right), \tag{14}
$$

其中 $\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})$ 为在 $N_x\times N_t$ 时空网格上求值的 $\hat h'(\mathbf z;\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})$ 预测向量，$\partial_t\hat h'^{(i)}$、$\partial_{tt}\hat h'^{(i)}$、$\partial_x\hat h'^{(i)}$、$\partial_{xx}\hat h'^{(i)}$ 为在同一网格上求值的 $\hat h'(\mathbf z;\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})$ 导数向量。由 (14) 估计 $\tilde{\boldsymbol\theta}$ 还需要估计 $\{\mathbf W_{N+1}^{(i)}\}_{i=1}^{N_{\mathrm{train}}}$，即训练数据集中每个样本特定的 $\mathbf W_{N+1}$ 参数，尽管这些参数并不属于预训练 DNN 网络。

计算解的导数会带来额外计算代价。虽然该代价远小于生成解集合的代价，但仍会增加离线训练时间与存储需求，故应尽可能避免。我们发现对某些 PDE 类型，$\boldsymbol\gamma$ 与 $\tilde{\boldsymbol\theta}$ 可用样本 $\{h^{(i)}\}_{i=1}^{N_{\mathrm{train}}}$ 与 PDE 残差约束联合估计：

$$
\boldsymbol\gamma^*,\tilde{\boldsymbol\theta}^*,\left\{\mathbf W_{N+1}^{*(i)}\right\}=\arg\min_{\boldsymbol\gamma,\tilde{\boldsymbol\theta},\{\mathbf W_{N+1}^{(i)}\}}\sum_{i=1}^{N_{\mathrm{train}}}\Big\{\|\hat{\bar h}(\boldsymbol\gamma)-\bar h\|_2^2+\|\hat h'^{(i)}(\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})-h'^{(i)}\|_2^2
+\lambda_f\|\mathcal R^{(i)}(\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})\|_2^2+\lambda_{\mathrm{IC},0}\|\mathcal R_{\mathrm{IC},0}^{(i)}(\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})\|_2^2
+\lambda_{\mathrm{IC},1}\|\mathcal R_{\mathrm{IC},1}^{(i)}(\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})\|_2^2+\lambda_{\mathrm{BC}}\|\mathcal R_{\mathrm{BC}}^{(i)}(\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})\|_2^2\Big\}
+\lambda\left(\|\boldsymbol\gamma\|_2^2+\|\tilde{\boldsymbol\theta}\|_2^2+\sum_{i=1}^{N_{\mathrm{train}}}\|\mathbf W_{N+1}^{(i)}\|_2^2\right), \tag{15}
$$

其中残差算子定义为

$$
\mathcal R(\mathbf x,t;\mathbf y;\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1})=\mathcal L\left(\hat{\bar h}(\mathbf x,t;\boldsymbol\gamma)+\hat h'(\mathbf x,t;\tilde{\boldsymbol\theta},\mathbf W_{N+1});\mathbf y\right), \tag{16}
$$

$$
\mathcal R_{\mathrm{BC}}(\mathbf x,t;g;\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1})=\mathcal B\left(\hat{\bar h}(\mathbf x,t;\boldsymbol\gamma)+\hat h'(\mathbf x,t;\tilde{\boldsymbol\theta},\mathbf W_{N+1})\right)-g(\mathbf x,t), \tag{17}
$$

$$
\mathcal R_{\mathrm{IC},0}(\mathbf x;h_0;\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1})=\hat{\bar h}(\mathbf x,0;\boldsymbol\gamma)+\hat h'(\mathbf x,0;\tilde{\boldsymbol\theta},\mathbf W_{N+1})-h_0(\mathbf x), \tag{18}
$$

以及

$$
\mathcal R_{\mathrm{IC},1}(\mathbf x;h_0;\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1})=\frac{\partial\hat{\bar h}(\mathbf x,0;\boldsymbol\gamma)}{\partial t}+\frac{\partial\hat h'(\mathbf x,0;\tilde{\boldsymbol\theta},\mathbf W_{N+1})}{\partial t}-h_1(\mathbf x). \tag{19}
$$

这里 $\mathcal R^{(i)}$ 为在时空域上随机抽样残差配点处求值的 $\mathcal R(\mathbf x,t;\mathbf y^{(i)};\boldsymbol\gamma,\tilde{\boldsymbol\theta},\mathbf W_{N+1}^{(i)})$ 分量向量；$\mathcal R_{\mathrm{IC},0}^{(i)}$ 与 $\mathcal R_{\mathrm{IC},1}^{(i)}$ 分别为在 $t=0$ 的空间域上求值的 $\mathcal R_{\mathrm{IC},0}(\mathbf x;h_0^{(i)};\cdot)$ 与 $\mathcal R_{\mathrm{IC},1}(\mathbf x;h_1^{(i)};\cdot)$ 分量向量；$\mathcal R_{\mathrm{BC}}^{(i)}$ 为在边界时间域上求值的 $\mathcal R_{\mathrm{BC}}(\mathbf x,t;g^{(i)};\cdot)$ 分量向量；$\mathbf y^{(i)}$、$g^{(i)}$、$h_0^{(i)}$、$h_1^{(i)}$ 为训练集 $\mathcal D_{\mathrm{train}}$ 的组成部分。

离线预训练阶段之后，对任意 $\mathbf y$、$g$、$h_0$，PDE 解通过由如下最小化问题估计 $\mathbf W_{N+1}$ 得到：

$$
\begin{aligned}
\mathbf W_{N+1}^*=\arg\min_{\mathbf W_{N+1}}\Big\{&\|\mathcal R(\mathbf y;\boldsymbol\gamma^*,\tilde{\boldsymbol\theta}^*,\mathbf W_{N+1})\|_2^2+\lambda_{\mathrm{BC}}\|\mathcal R_{\mathrm{BC}}(g;\boldsymbol\gamma^*,\tilde{\boldsymbol\theta}^*,\mathbf W_{N+1})\|_2^2\\
&+\lambda_{\mathrm{IC},0}\|\mathcal R_{\mathrm{IC},0}(h_0;\boldsymbol\gamma^*,\tilde{\boldsymbol\theta}^*,\mathbf W_{N+1})\|_2^2+\lambda_{\mathrm{IC},1}\|\mathcal R_{\mathrm{IC},1}(h_1;\boldsymbol\gamma^*,\tilde{\boldsymbol\theta}^*,\mathbf W_{N+1})\|_2^2+\lambda\|\mathbf W_{N+1}\|_2^2\Big\},
\end{aligned}\tag{20}
$$

其中 $\boldsymbol\gamma^*$ 与 $\tilde{\boldsymbol\theta}^*$ 在离线预训练中获得。基函数近似满足初始与边界条件；但我们的数值结果表明，加入初始与边界条件惩罚项（即一般取 $\lambda_{\mathrm{BC}}>0$、$\lambda_{\mathrm{IC},0}>0$、$\lambda_{\mathrm{IC},1}>0$）会得到更准确的解。

或者，可用 Galerkin 投影法把 $\mathbf W_{N+1}$ 估计为如下方程的解：

$$
\boldsymbol\Psi_r^T\mathcal R\left(\mathbf y;\boldsymbol\gamma^*,\tilde{\boldsymbol\theta}^*,\mathbf W_{N+1}^*\right)=0, \tag{21}
$$

其中 $\boldsymbol\Psi_r\in\mathbb R^{N_{\mathrm{res}}\times N_\eta}$ 为预训练神经基函数在残差点处求值的矩阵，其第 $i$ 行为 $\boldsymbol\psi(\mathbf z_i;\tilde{\boldsymbol\theta}^*)^T$。在我们的数值实验中，Galerkin 表述产生的误差与 (20) 中残差最小二乘 lPINN 表述相近，因此下文报告的结果采用残差最小二乘 lPINN 表述。

在 lPINN 中，“线性化”一词指泛函表示对 $\mathbf W_{N+1}$（在类 PINN 在线阶段估计的参数向量）的线性依赖，并不意味着线性化控制微分算子。若 $\mathcal L$ 与 $\mathcal B$ 为线性算子，则 (20) 是正则化线性最小二乘问题；当增广最小二乘矩阵具有满列秩，或严格正二次正则化使目标严格凸时，它有唯一解。对非线性算子，降阶问题仍为非线性，但仍是低维的，可用标准非线性最小二乘方法迭代求解。

lPINN 中逆 PDE 问题的表述与 PINN 方法类似。考虑一个或多个参数 $\mathbf y$、$g$、$h_0$、$h_1$ 未知、必须由 $h$ 在位置 $\mathbf x_d=[x_j]_{j=1}^{N_m}$ 与时刻 $t_d=[t_j]_{j=1}^{N_m}$ 处观测 $\mathbf u^*=[u_j^*]_{j=1}^{N_m}$ 推断的逆问题。参数可在在线阶段与 $\mathbf W_{N+1}$ 联合估计为如下最小化问题的解：

$$
\begin{aligned}
\left(\mathbf W_{N+1}^*,\mathbf y^*,g^*,h_0^*\right)=\arg\min_{\mathbf W_{N+1},\mathbf y,g,h_0}\Big\{&\|\mathcal R(\mathbf y;\mathbf W_{N+1})\|_2^2+\lambda_{\mathrm{BC}}\|\mathcal R_{\mathrm{BC}}(g;\mathbf W_{N+1})\|_2^2+\lambda_{\mathrm{IC},0}\|\mathcal R_{\mathrm{IC},0}(h_0,\mathbf W_{N+1},\mathbf y)\|_2^2\\
&+\lambda_{\mathrm{IC},1}\|\mathcal R_{\mathrm{IC},1}(h_1,\mathbf W_{N+1},\mathbf y)\|_2^2+\lambda\|\mathbf W_{N+1}\|_2^2+\lambda_{\mathrm{data}}\left\|\hat{\mathbf h}_d(\mathbf W_{N+1})-\mathbf h^*\right\|_2^2\Big\},
\end{aligned}\tag{22}
$$

其中 $\mathbf W_{N+1}$ 参数采用 $L_2$ 正则化，数据项中的 $\hat{\mathbf h}_d(\mathbf W_{N+1})$ 为分量为 $\hat{\bar h}(x_i,t_i;\boldsymbol\gamma^*)+\hat h'(x_i,t_i;\tilde{\boldsymbol\theta}^*,\mathbf W_{N+1})$ 的向量。由于基函数近似满足初始与边界条件，我们发现该损失函数中可令 $\lambda_{\mathrm{BC}}=\lambda_{\mathrm{IC},0}=\lambda_{\mathrm{IC},1}=0$ 而不在逆解中引入显著误差。损失函数中的权重系数（包括 $\lambda$ 与 $\lambda_{\mathrm{data}}$）可如 PINN 中那样估计；本文用网格搜索选取权重系数的最优组合。lPINN 方法用于正问题与逆问题的示意表示见图 1。

**图 1：** lPINN 方法的示意图。均值 DNN 的全部参数以及与起伏 DNN 各层相关的参数都用训练数据集离线估计；起伏 DNN 最后一层的其余参数针对给定参数、用物理信息损失确定。

神经表示的一个关键推论是：用于生成离线解集合的网格与离线、在线训练所用的配点集相互解耦。一旦学到均值函数 $\hat{\bar h}(\mathbf z,\boldsymbol\gamma^*)$ 与基函数 $\boldsymbol\psi(\mathbf z;\tilde{\boldsymbol\theta}^*)$，则 $\hat h(\mathbf z;\mathbf W_{N+1})=\hat{\bar h}(\mathbf z,\boldsymbol\gamma^*)+\boldsymbol\psi(\mathbf z;\tilde{\boldsymbol\theta}^*)\cdot\mathbf W_{N+1}$ 及其微分算子所需的导数都可通过自动微分在任意坐标 $\mathbf z$ 处求值。因此，由粗网格上生成的解集合学到的基可用于表示与评估更细分辨率下的解而无需重新训练。下文结果表明，这种跨分辨率精度并不需要在线推断时使用大量残差点，因为只估计相对少量的降阶系数；可达到的精度主要取决于预训练均值与基函数的质量。在本文考察的范围内，该表示精度可通过增加离线训练集合中的解样本数来提高；增加基于残差离线预训练时的残差点数也能改善所学表示，但我们观察到其改善小于增加训练样本数所带来的改善。我们把 lPINN 的**超分辨**（superresolution）定义为：在粗分辨率集合上训练的 lPINN 能产生比在更细网格上计算的数值解更准确的预测（二者都针对同一高保真参考解评估）。

## 3 数值算例

除另有说明，所报告的解误差与参数误差均由 10 次独立运行的平均预测或参数估计计算，所报告的计算时间为每次运行的平均在线训练时间。

在比较研究中，PINN 网络与 lPINN 所用的均值、起伏网络具有相同规模与架构，包括相同的隐藏层数、每层相同宽度与相同激活函数；因此 lPINN 中每个单独网络在规模与架构上都与 PINN 网络匹配。例外是第 3.3 节中 PINN 与 lPINN 使用不同 Fourier 频率尺度的一次比较。

### 3.1 对流扩散方程

我们首先在一维对流—扩散方程上评估所提 lPINN 框架：

$$
\frac{\partial u}{\partial t}+V\frac{\partial u}{\partial x}=D\frac{\partial^2u}{\partial x^2}, \tag{23}
$$

受初始条件

$$
u(x,0)=0 \tag{24}
$$

与边界条件

$$
u(0,t)=u_0 \tag{25}
$$

（其中 $u_0=1$）以及

$$
\left.\frac{\partial u}{\partial x}\right|_{x=L}=0 \tag{26}
$$

约束。在正问题中，目标是预测 $V\in[V_{\min},V_{\max}]$ 与 $D\in[D_{\min},D_{\max}]$ 下的解；在逆问题中，目标是由 $u(x,t)$ 的稀疏测量推断 $V$ 与 $D$。

当 $t\ll L/V$ 时，该方程的解可由 Ogata–Banks 公式近似：

$$
u(x,t)=\frac{u_0}{2}\left[\mathrm{erfc}\left(\frac{x-Vt}{2\sqrt{Dt}}\right)+\exp\left(\frac{Vx}{D}\right)\mathrm{erfc}\left(\frac{x+Vt}{2\sqrt{Dt}}\right)\right]. \tag{27}
$$

为构造训练数据集，把 $V$ 与 $D$ 视为分别在区间 $V\in[V_{\min},V_{\max}]$ 与 $D\in[D_{\min},D_{\max}]$ 上独立均匀分布的随机变量，并从这些分布生成 $N_{\mathrm{train}}$ 个 $V$ 与 $D$ 样本。对每个 $V$、$D$ 样本，在均匀 $N_x\times N_t$ 网格（节点 $(x_i,t_k)$，不含 $t=0$，其中 $x_1=0$、$x_{N_x}=L$、$t_1=T/(N_t-1)$、$t_{N_t}=T$）上求 Ogata–Banks 解。样本均值估计为

$$
\bar u(x_i,t_k)=\frac{1}{N_{\mathrm{train}}}\sum_{n=1}^{N_{\mathrm{train}}}u^{(n)}(x_i,t_k), \tag{28}
$$

起伏场定义为

$$
u'(x,t)=u(x,t)-\bar u(x,t). \tag{29}
$$

在所有 ADE 实验中取 $L=86$、$T=200$。训练数据集含 $N_{\mathrm{train}}=500$ 个实现，由 $V\in[0.6V^*,1.4V^*]$、$D\in[0.6D^*,1.4D^*]$ 生成，其中 $V^*=0.213$、$D^*=0.061$，给出 Peclet 数 $Pe=\frac{V^*L}{D^*}=300$。训练模型在 $V_{\mathrm{ref}}=1.2V^*$、$D_{\mathrm{ref}}=0.7D^*$（对应 $Pe=514$）上测试。该测试用例被有意选在训练范围中心之外；此外 $Pe\gg1$ 的 ADE 解用标准数值方法难以获得，因此所考虑问题为 lPINN 提供了严格检验。

lPINN 与其他 ADE 方法的精度用预测解 $u$（逆问题中还包括估计参数 $V$、$D$）的无量纲相对均方根误差（rRMSE）评估，定义为

$$
\mathrm{rRMSE}_u=\frac{\left\|u-u_{\mathrm{ref}}\right\|_2}{u_0\sqrt{N_u}},\quad
\mathrm{rRMSE}_V=\frac{\left|V-V_{\mathrm{ref}}\right|}{\left|V_{\mathrm{ref}}\right|},\quad
\mathrm{rRMSE}_D=\frac{\left|D-D_{\mathrm{ref}}\right|}{\left|D_{\mathrm{ref}}\right|},
$$

其中 $N_u$ 为与参考解 $u_{\mathrm{ref}}$ 比较的网格点数（一般 $N_u=N_g$，$N_g$ 为评估解所用网格的网格点数），$u_0=1$ 为参考解在 $x=0$ 处取得的最大值。PDE 残差、初始条件与边界条件的无量纲 rRMSE 定义为

$$
\mathrm{rRMSE}_R=\frac{L}{u_0V}\frac{\|\mathcal R\|_2}{\sqrt{N_{\mathrm{res}}}},\quad
\mathrm{rRMSE}_{\mathrm{IC}}=\frac{\left\|u_{\mathrm{IC}}-u_{\mathrm{IC}}^{\mathrm{ref}}\right\|_2}{u_0\sqrt{N_{\mathrm{IC}}}},
$$

以及

$$
\mathrm{rRMSE}_{\mathrm{BC}}=\frac{\left\|u(x=0)-u^{\mathrm{ref}}(x=0)\right\|_2}{u_0\sqrt{N_{\mathrm{BC},0}}}
+\frac{L}{u_0}\frac{\left\|\partial_xu(x=L)\right\|_2}{\sqrt{N_{\mathrm{BC},L}}},
$$

其中 $N_{\mathrm{IC}}$ 为 $t=0$ 处残差点数（不含点 $(x,t)=(0,0)$），$N_{\mathrm{BC},0}$ 为 $x=0$ 边界时间域上的残差点数，$N_{\mathrm{BC},L}$ 为 $x=L$ 边界上的残差点数。

在 lPINN 中，均值与起伏网络用 Adam 优化器预训练。正 ADE 问题的在线训练（即求解最小化问题 (20)）是线性最小二乘问题，用 `numpy.linalg.lstsq` 求解；逆 ADE 最小化问题非线性，用 L-BFGS 方法求解。残差点数取 $N_{\mathrm{res}}=10N_\eta$；逆解用 $N_m=40$ 个 $u$ 测量获得。

我们比较了导数匹配（式 (13)、(14)）与基于残差（式 (15)）的离线预训练方法。对基于残差的离线预训练，把 $N_x\times(N_t-1)=870$ 个网格点分成每 epoch 10 批；每批用 $N_{\mathrm{train}}=500$ 个实现在 87 个网格点处的解值训练，并使用 $N_{\mathrm{res}}=435$ 个残差点、$N_{\mathrm{IC}}=435$ 个初始条件配点与 $N_{\mathrm{BC}}=435$ 个边界条件配点（每批随机重采样）。对导数匹配离线预训练，同样把 870 个网格点分成 10 批，每批用相应 87 个网格点处的解与导数值训练，并使用 $N_{\mathrm{IC}}=435$ 与 $N_{\mathrm{BC}}=N_{\mathrm{BC},0}+N_{\mathrm{BC},L}=435$ 个随机重采样的初始条件与边界条件配点。神经基函数数取 $N_\eta=50$。模型在正、逆解 rRMSE 方面的性能见表 1。lPINN 正解误差是近似误差与残差最小二乘误差的组合：前者度量预训练 DNN 对 PDE 解的近似程度，后者度量残差最小二乘表述估计 $\mathbf W_{N+1}$ 的准确度。为计算近似误差，用最小二乘把预训练 DNN 拟合到参考 PDE 解来估计 $\mathbf W_{N+1}$。基于残差的预训练给出略小的近似误差（$3.94\times10^{-4}$，对比导数匹配预训练的 $4.44\times10^{-4}$）。另一个相关指标是预训练 DNN 在由最小二乘拟合参考 PDE 解得到 $\mathbf W_{N+1}$ 后产生的 PDE 残差值；残差的 RMSE（相对于参考解产生的零残差值）在基于残差预训练时更小（$3.60\times10^{-2}$，对比 $4.36\times10^{-2}$）。然而基于残差的预训练给出小得多的 lPINN 正解误差：$1.45\times10^{-3}$ 对 $9.38\times10^{-3}$。在逆问题中，基于残差的预训练对解 $u$ 与速度 $V$ 给出更好的精度，而导数匹配预训练对扩散系数 $D$ 给出更小的误差。由于我们追求最佳总体性能、尤其是准确的正问题预测，结论是对所考虑的 ADE 问题基于残差的预训练是更好的策略，并在本节其余数值算例中使用它。

**表 1　基于残差预训练与导数匹配预训练的 ADE 比较（每行较小值以粗体显示）**

| 情形 / 指标 | 基于残差 | 导数匹配 |
|---|---|---|
| 近似误差：rRMSE | **3.94×10⁻⁴** | 4.44×10⁻⁴ |
| 残差：rRMSE | **3.60×10⁻²** | 4.36×10⁻² |
| 正问题：rRMSE_u | **1.45×10⁻³** | 9.38×10⁻³ |
| 逆问题：rRMSE_u | **3.90×10⁻³** | 2.01×10⁻² |
| 逆问题：rRMSE_V | **4.13×10⁻³** | 1.22×10⁻² |
| 逆问题：rRMSE_D | 1.07×10⁻¹ | **6.23×10⁻²** |

图 2 画出相对近似误差、残差误差以及 lPINN 正、逆解相对误差随 $N_\eta$（最后隐藏层神经元数）的变化。近似误差随 $N_\eta$ 增大而下降；残差误差在 $N_\eta<50$ 时几乎不变，之后随 $N_\eta$ 增大。应注意在所描述实验中离线步的残差点数固定，这可能导致残差误差随 $N_\eta$ 增大而增大。

当 (20) 中正则化系数 $\lambda=0$ 时，lPINN 正解误差随 $N_\eta$ 增大。对所考虑的线性 ADE，(20) 给出可写成 $\mathbf A\cdot\mathbf W_{N+1}=\mathbf b$ 的线性最小二乘问题，其中 $\mathbf A$ 为 $N_{\mathrm{res}}\times N_\eta$ 矩阵、$\mathbf b$ 为 $N_{\mathrm{res}}$ 向量。无正则化最小二乘解在 $\mathbf A$ 满列秩（等价地 $\mathbf A^T\mathbf A$ 非奇异）时唯一；当系统秩亏或病态时，正则化（即 $\lambda>0$）可提供唯一性并改善数值稳定性。我们通过网格搜索为每个 $N_\eta$ 选择 $\lambda$。由于残差 rRMSE 随 $N_\eta$ 增大，我们未观察到 $N_\eta>30$ 时 lPINN rRMSE 下降。第 3.4 节表明，增大训练数据集规模或（如前述）在离线步使用更多残差点可改善预训练精度。

对逆问题，所估计 $u$、$V$、$D$ 的相对误差对 $N_\eta$ 依赖性较弱；总体最佳性能在 $N_\eta=50$ 处取得，本节其余数值实验即采用该值。

**图 2：** ADE 问题：左：预训练起伏网络的近似误差与相应残差误差。中：lPINN 正问题预测的相对误差。右：lPINN 逆问题预测中解 $u$ 与推断参数 $V$、$D$ 的相对误差。$N_{\mathrm{train}}=500$。本测试中 $N_\eta=50$、$N_{\mathrm{res}}=500$ 的 lPINN 误差与后续正问题中 $N_\eta=50$、$N_{\mathrm{res}}=500$ 的 lPINN 误差不能直接比较，因为该问题中我们对所有 $N_{\mathrm{res}}$ 使用共享的 $\lambda=10^{-4}$。

本节其余部分将 lPINN 与原版 PINN 及 PICKLE ROM 比较。

#### 3.1.1 与 PINN 的比较

先考虑正问题。图 3 在 $t=20.7$ 与 $200.0$ s 处、用 $N_{\mathrm{res}}=500$ 个残差点比较 PINN 与 lPINN 预测与参考解。lPINN 解明显更接近参考解，rRMSE 为 0.0015，而 PINN 为 0.0104。计算代价也显著降低：lPINN 需 0.2 s，PINN 需 631.2 s。全部 PINN 与 lPINN 计算都在同一工作站上使用 48 GB 显存的 NVIDIA RTX A6000 GPU 完成。

**图 3：** ADE 正问题：（a）PINN 与 lPINN 预测在 $t=20.7$ s 与 $200.0$ s 处与参考解的比较。（b）同一网格上 $N_x=30$ 个网格点在 $t=20.7$ s 与 $200.0$ s 处的逐点标准差。$N_{\mathrm{res}}=500$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

接着考察 lPINN 与 PINN 误差对残差点数的敏感性。图 4(a) 表明 lPINN 的 rRMSE 始终低于 PINN；二者误差都随 $N_{\mathrm{res}}$ 增大而减小，并在 $N_{\mathrm{res}}=500$ 处达到渐近值。

**图 4：** ADE 正问题：（a）rRMSE($u$) 随残差点数 $N_{\mathrm{res}}$ 的变化，$u$ 为 10 次 PINN 或 lPINN 解的平均。（b）残差、初始条件与边界条件误差的相对均方根误差（rRMSE）随残差点数 $N_{\mathrm{res}}$ 的变化。$N_\eta=50$、$N_{\mathrm{train}}=500$。

然后比较用 $N_m=40$ 个 $u$ 测量得到的 PINN 与 lPINN 参数 $V$、$D$ 及状态 $u$ 的逆解。图 5 给出 $t=20.7$ 与 $200.0$ s 处的估计 $u$ 与参考 $u$。lPINN 预测的 rRMSE 为 0.0039，PINN 为 0.0509；lPINN 得到的 $V$、$D$ 的 rRMSE 分别为 0.0041 与 0.1074，PINN 的 $V$ 与 $D$ 的 rRMSE 分别为 0.0290 与 0.8513。推断时间由 PINN 的 350.6 s 降至 lPINN 的 19.2 s。

**图 5：** ADE 逆问题：PINN 与 lPINN 对 $u(x,t)$ 的估计在 $t=20.7$ s 与 $200.0$ s 处与参考解的比较。$N_{\mathrm{res}}=500$、$N_m=40$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

图 6 给出 lPINN 与 PINN 逆解 rRMSE 随 $N_m$ 的变化，报告所估计 $V$、$D$ 与 $u$ 的误差。对这三个变量，lPINN 一般优于 PINN，且 $N_m$ 越小时优势越大。这一性质在实际逆问题中很重要，因为观测往往有限且获取代价高。

**图 6：** ADE 逆问题：所推断速度 $V$、弥散系数 $D$ 与预测解 $u$ 的相对均方根误差（rRMSE）随测量点数 $N_m$ 的变化。$N_{\mathrm{res}}=500$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

#### 3.1.2 与 dPICKLE ROM 方法的比较

这里比较正问题 lPINN 解与 dPICKLE 解。dPICKLE ROM 方法 [17] 基于状态变量 $u$ 的时空依赖 Karhunen–Loève 展开（KLE）：

$$
u(\mathbf a)=\bar{\mathbf u}+\boldsymbol\Phi\mathbf a, \tag{30}
$$

其中 $\mathbf u$ 为解向量，$\bar{\mathbf u}$ 为训练数据集均值，$\boldsymbol\Phi$ 为用相应特征值平方根缩放的特征向量矩阵，$\mathbf a$ 为系数向量。这些系数可用投影估计，或如 PINN 与 lPINN 方法中那样通过最小化 PDE 残差的 $L_2$ 范数估计：

$$
\mathbf a^*=\arg\min_{\mathbf a}\|\mathcal R(\mathbf a)\|_2^2, \tag{31}
$$

其中 $\mathcal R(\mathbf a)$ 为残差向量。在 dPICKLE 中（如同大多数 ROM 方法），包括 $\bar{\mathbf u}$、$\boldsymbol\Phi$、$\mathcal R$ 乃至最终解 $\mathbf u$ 在内的全部量都在训练数据集生成所用的同一时空网格上计算；[17] 中，进入 $\mathcal R$ 的空间与时间导数用有限差分离散评估。为公平比较，我们用与 lPINN 解相同数量的样本来计算 $\bar{\mathbf u}$ 与 $\boldsymbol\Phi$，并把 $\mathbf a$ 的维度设为与 $\mathbf W_{N+1}$ 相同；lPINN 解中的残差点取为与 dPICKLE 评估残差的网格点重合。

正解比较所用参数为 $V=1.2V^*$、$D=0.7D^*$。图 7 在 $t=20.7$ 与 $200.0$ s 处比较 lPINN 与 dPICKLE 预测与参考解。lPINN 预测与参考解更一致，rRMSE 为 0.0013，而 dPICKLE 为 0.0470；不过 dPICKLE 计算代价更低：lPINN 需 0.26 s，dPICKLE 仅需 0.01 s。lPINN 运行时间更长，是因为通过自动微分计算导数比 dPICKLE 中的数值计算更耗时。

**图 7：** ADE 正问题：lPINN 与 dPICKLE 预测在 $t=20.7$ s 与 $200.0$ s 处与参考解的比较。$N_{\mathrm{res}}=784$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

### 3.2 Burgers 方程

本节考虑一维 Burgers 方程：

$$
\frac{\partial u}{\partial t}+u\frac{\partial u}{\partial x}=\nu\frac{\partial^2u}{\partial x^2}, \tag{32}
$$

受初始条件

$$
u(x,0)=-\sin(\pi x) \tag{33}
$$

与边界条件

$$
u(-1,t)=u(1,t)=0 \tag{34}
$$

约束。正问题 lPINN 模型预训练用于求解时间域 $(0,1]$、$\nu\in\left[\frac{0.1}{\pi},\frac{0.5}{\pi}\right]$ 上的 Burgers 方程。我们用 Burgers 方程的 Cole–Hopf 解析解构造训练数据集：

$$
u(x,t)=\frac{\int_{-\infty}^{\infty}-\sin\left(\pi(x-\xi)\right)\exp\left(-\frac{\cos(\pi(x-\xi))}{2\pi\nu}\right)\exp\left(-\frac{\xi^2}{4\nu t}\right)\,d\xi}{\int_{-\infty}^{\infty}\exp\left(-\frac{\cos(\pi(x-\xi))}{2\pi\nu}\right)\exp\left(-\frac{\xi^2}{4\nu t}\right)\,d\xi}. \tag{35}
$$

我们从给定区间均匀抽取 $N_{\mathrm{train}}=500$ 个 $\nu$ 样本；对每个 $\nu$ 样本，在 $N_x\times N_t$ 网格（$N_x=30$、$N_t=30$）上求 Cole–Hopf 解，时间网格均匀、空间网格在 $[-1,1]$ 上中心聚集。中心聚集空间网格点定义为

$$
s_i=-1+\frac{2i}{N_x-1},\qquad
x_i=\mathrm{sign}(s_i)\left[1-\frac{\tanh\left(\sigma(1-|s_i|)\right)}{\tanh(\sigma)}\right],\quad i=0,\ldots,N_x-1,
$$

其中聚集强度取 $\sigma=2$。预训练正问题 lPINN 模型随后在 $\nu_{\mathrm{ref}}=\frac{0.1}{\pi}$、同一网格上测试。逆问题在给定 $u$ 的稀疏测量下求解 $\nu$ 与 $u$。

在 $N_x\times N_t$ 网格上评估的预测解 $u$ 的 rRMSE、以及逆问题中估计黏度 $\nu$ 的 rRMSE 定义为

$$
\mathrm{rRMSE}_u=\frac{\left\|u-u_{\mathrm{ref}}\right\|_2}{u_0\sqrt{N_u}},\qquad
\mathrm{rRMSE}_\nu=\frac{\left|\nu-\nu_{\mathrm{ref}}\right|}{\left|\nu_{\mathrm{ref}}\right|},
$$

其中 $N_u=N_x\times N_t$，$u_{\mathrm{ref}}$ 为在 $N_x\times N_t$ 网格上评估的参考解，$u_0=u\left(x=-\frac{1}{2},t=0\right)$ 为初始条件的最大值。PDE 残差、初始条件与边界条件的无量纲 rRMSE 定义为

$$
\mathrm{rRMSE}_R=\frac{L}{u_0^2}\frac{\|\mathcal R\|_2}{\sqrt{N_{\mathrm{res}}}},\quad
\mathrm{rRMSE}_{\mathrm{IC}}=\frac{\left\|u_{\mathrm{IC}}-u_{\mathrm{IC}}^{\mathrm{ref}}\right\|_2}{u_0\sqrt{N_{\mathrm{IC}}}},
$$

以及

$$
\mathrm{rRMSE}_{\mathrm{BC}}=\frac{\left\|u(x=-1)-u^{\mathrm{ref}}(x=-1)\right\|_2}{u_0\sqrt{N_{\mathrm{BC},-1}}}
+\frac{\left\|u(x=1)-u^{\mathrm{ref}}(x=1)\right\|_2}{u_0\sqrt{N_{\mathrm{BC},1}}}.
$$

图 8 画出相对近似误差、近似解残差以及 lPINN 正、逆解相对误差随 $N_\eta$ 的变化；残差点数取 $N_{\mathrm{res}}=10N_\eta$，逆解用 $N_m=50$ 个测量。DNN 用基于残差的损失函数预训练，该选择由表 2 汇总的比较研究支持。预训练 DNN 的近似误差与残差 RMSE 对所选 $N_\eta$ 依赖性较弱；正问题 lPINN 解的最小 rRMSE 在 $N_\eta=20$ 处取得；逆问题中 $u$ 与 $\nu$ 的估计误差都在 $N_\eta=50$ 处最小。因此本节其余算例中正问题取 $N_\eta=20$、逆问题取 $N_\eta=50$。

**图 8：** Burgers 方程：左：预训练起伏网络的近似误差与相应残差误差。中：lPINN 正问题预测的相对误差。右：lPINN 逆问题预测中解 $u$ 与推断参数 $\nu$ 的相对误差。$N_{\mathrm{train}}=500$。

接着比较导数匹配预训练与基于残差的预训练。对基于残差的离线预训练，把 $N_x\times N_t=900$ 个解网格点在每个 epoch 分成 10 批；每批用全部 $N_{\mathrm{train}}=500$ 个实现在 90 个网格点处的解值训练，并使用 $N_{\mathrm{res}}=90$ 个残差点、$N_{\mathrm{IC}}=90$ 个初始条件配点与 $N_{\mathrm{BC}}=90$ 个边界条件配点（每批随机重采样）。对导数匹配离线预训练，同样把 900 个解网格点分成 10 批，每批用相应 90 个网格点处的解与导数值训练，并使用 $N_{\mathrm{IC}}=90$ 与 $N_{\mathrm{BC}}=90$ 个随机重采样的初始条件与边界条件配点。正问题中 lPINN 与 PINN 的残差点数都取 $N_{\mathrm{res}}=100$；逆问题使用 $N_{\mathrm{res}}=100$ 个残差点与 $N_m=5$ 个 $u$ 测量。如表 2 所示，对 $N_\eta=20$ 与 $N_\eta=50$，基于残差的预训练都给出更小的近似误差、更小的残差 RMSE 以及更好的正、逆问题精度；具体地，它把正问题误差从 $3.15\times10^{-3}$ 降到 $8.07\times10^{-4}$，并给出更低的 $u$、$\nu$ 逆误差。本节其余数值实验采用基于残差的预训练。

**表 2　Burgers 方程下基于残差与导数匹配预训练的比较**（本测试用 $N_m=5$，而本节后续逆问题用 $N_m=50$，故结果不能直接比较）

| 指标 | $N_\eta$ | 基于残差 | 导数匹配 |
|---|---|---|---|
| 近似 rRMSE | 20 | **5.35×10⁻⁴** | 2.11×10⁻³ |
| 近似 rRMSE | 50 | **8.13×10⁻⁴** | 8.24×10⁻⁴ |
| 残差 rRMSE | 20 | **3.10×10⁻²** | 4.90×10⁻² |
| 残差 rRMSE | 50 | **4.56×10⁻²** | 6.32×10⁻² |
| 正问题 rRMSE_u | 20 | **8.07×10⁻⁴** | 3.15×10⁻³ |
| 逆问题 rRMSE_u | 50 | **1.57×10⁻³** | 3.24×10⁻³ |
| 逆问题 rRMSE_ν | 50 | **3.18×10⁻³** | 1.14×10⁻² |

接着比较 PINN 与 lPINN 的正 Burgers 问题解。图 9 给出 $t=0.0$ 与 $1.0$ s 处的 PINN、lPINN 与参考解。lPINN 解与参考解吻合得多，rRMSE 为 0.0008，PINN 为 0.0439；计算优势也很可观：lPINN 仅需 17.3 s，PINN 需 308.3 s。

**图 9：** Burgers 正问题：PINN 与 lPINN 预测在 $t=0.0$ s 与 $1.0$ s 处与参考解的比较。$N_{\mathrm{res}}=100$、$N_\eta=20$、$N_{\mathrm{train}}=500$。

图 10(a) 考察 $N_\eta=20$ 时正 Burgers 问题 lPINN 与 PINN 误差对 $N_{\mathrm{res}}$ 的依赖。PINN 的 rRMSE 在 $N_{\mathrm{res}}\approx800$ 处降到渐近值，而 lPINN 的 rRMSE 在整个 $N_{\mathrm{res}}$ 范围内几乎不变。lPINN 渐近误差接近 $N_\eta=20$ 时的近似误差，后者是 lPINN 误差的下限；PINN 的渐近误差小于 lPINN 的渐近误差，这与 ADE 问题不同——在 ADE 中，lPINN 在全部所考虑的 $N_{\mathrm{res}}$ 下都比 PINN 准确。图 10(b) 解释了 lPINN 误差何以不随 $N_{\mathrm{res}}$ 增大而减小：PDE 残差误差下降的同时，初始与边界条件残差误差随 $N_{\mathrm{res}}$ 保持不变。

**图 10：** Burgers 正问题：（a）PINN 与 lPINN 预测解的相对均方根误差（rRMSE）随残差点数 $N_{\mathrm{res}}$ 的变化。（b）残差、初始条件与边界条件误差的 rRMSE 随 $N_{\mathrm{res}}$ 的变化。$N_\eta=20$、$N_{\mathrm{train}}=500$。

图 11 用 $N_{\mathrm{res}}=100$ 个残差点与 $N_m=5$ 个 $u$ 测量，比较 $t=0.0$ 与 $1.0$ s 处的 PINN 与 lPINN 逆 $u$ 解。lPINN 解的 rRMSE 为 0.0016，PINN 为 0.0061；lPINN 估计的 $\nu$ 相对误差为 0.0032，PINN 为 0.0119。得到 lPINN 解的时间（不含预训练）为 3.2 s，PINN 为 251.5 s。

**图 11：** Burgers 逆问题：PINN 与 lPINN 预测在 $t=0.0$ 与 $1.0$ s 处与参考解的比较。$N_{\mathrm{res}}=100$、$N_m=5$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

我们进一步在 $N_\eta=50$、$N_{\mathrm{res}}=100$ 下研究测量数对逆解精度的影响。如图 12 所示，PINN 对 $\nu$ 与 $u$ 的估计误差强烈依赖 $N_m$，而 lPINN 误差对 $N_m$ 的敏感性较低；lPINN 用相对很少的测量即可达到相近精度。所估计 $\nu$ 的误差在所有考虑的 $N_m$ 下都小于 PINN；$u$ 的估计在 $N_m<20$ 时 lPINN 更准确，其余情形则不如 PINN。这表明在数据受限区域 lPINN 比 PINN 更鲁棒。

**图 12：** Burgers 逆问题：所推断运动黏度 $\nu$ 与预测解 $u$ 的相对均方根误差（rRMSE）随测量点数 $N_m$ 的变化。$N_{\mathrm{res}}=100$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

### 3.3 非线性单摆方程

接着在非线性单摆方程上评估所提 lPINN 框架：

$$
\frac{d^2\theta}{dt^2}+\gamma\frac{d\theta}{dt}+\frac{g_0}{\ell}\sin(\theta)=0, \tag{36}
$$

受初始条件

$$
\theta(0)=\frac{\pi}{2},\qquad \frac{d\theta}{dt}(0)=0 \tag{37}
$$

约束，其中 $\gamma$ 为阻尼系数、$\ell$ 为摆长、$\theta$ 为摆角、$g_0$ 为重力加速度。正问题中计算 $\gamma\in[0.05,0.5]$、$\ell\in[0.5,2.0]$ 下的 $\theta$；逆问题中由若干时刻的 $\theta$ 测量估计 $\gamma$、$\ell$ 与 $\theta(t)$。

为构造训练数据集，从其考察范围均匀抽取 $N_{\mathrm{train}}=500$ 个 $(\gamma,\ell)$ 样本；对每个参数组合，用 Runge–Kutta 方法在均匀时间网格（常数时间步长 $\Delta t=T/(N_t-1)$，$N_t=300$、$T=30$）上数值求解 (36)。除 $\theta$ 外，求解器还给出 $d\theta/dt$ 与 $d^2\theta/dt^2$，一并用于 DNN 预训练。预训练模型随后在同一时间网格上针对 $\gamma_{\mathrm{ref}}=0.1$、$\ell_{\mathrm{ref}}=0.8$ 测试。

式 (36) 难以用 PINN 求解，原因是 $\theta$ 随 $t$ 振荡，而 DNN 因谱偏置倾向于更快学习低频分量 [29]。在 lPINN 中，我们发现标准全连接网络在早期时刻比后期更准确地近似 $\theta(t)$；我们还发现均值分量与起伏分量的训练损失以明显不同的速率收敛，这进一步增加了用标准 DNN 联合训练的难度。为改善 DNN 预训练，我们用数值 $\bar\theta$、$d\bar\theta/dt$、$d^2\bar\theta/dt^2$ 与 $\theta'$、$d\theta'/dt$、$d^2\theta'/dt^2$ 分别单独预训练均值网络与起伏网络。此外，我们用 Fourier 特征神经网络（Fourier Feature Neural Network，FFNN）代替标准全连接网络来建模起伏 $\theta'(t)$。PINN 与 lPINN 都使用映射尺寸 64、隐藏层宽度 $N_\eta$ 的 FFNN。我们使用不同频率尺度（PINN 为 0.5，lPINN 为 0.1），因为初步调参表明两种方法在不同 Fourier 特征尺度下取得最佳性能；对 lPINN，较小尺度在不引入虚假高频伪影的前提下为振荡解提供足够分辨率。

预测 $\theta$ 的 rRMSE、以及逆问题中估计 $\gamma$、$\ell$ 的 rRMSE 定义为

$$
\mathrm{rRMSE}_\theta=\frac{\left\|\theta-\theta_{\mathrm{ref}}\right\|_2}{\theta_0\sqrt{N_t}},\qquad
\mathrm{rRMSE}_\gamma=\frac{\left|\gamma-\gamma_{\mathrm{ref}}\right|}{\left|\gamma_{\mathrm{ref}}\right|},\qquad
\mathrm{rRMSE}_\ell=\frac{\left|\ell-\ell_{\mathrm{ref}}\right|}{\left|\ell_{\mathrm{ref}}\right|},
$$

其中 $\theta_{\mathrm{ref}}$ 为参考解，$\theta_0=\pi/2$ 为初始条件。PDE 残差与初始条件的无量纲 rRMSE 定义为

$$
\mathrm{rRMSE}_R=\frac{\ell}{\theta_0g_0}\frac{\|\mathcal R\|_2}{\sqrt{N_{\mathrm{res}}}},\qquad
\mathrm{rRMSE}_{\mathrm{IC},0}=\frac{\left|\theta(0)-\theta_0\right|}{\theta_0},
$$

以及

$$
\mathrm{rRMSE}_{\mathrm{IC},1}=\frac{\left|\frac{d\theta(0)}{dt}\right|}{\theta_0\sqrt{g_0/\ell}}.
$$

对非线性单摆 (36)，基于残差的预训练未能产生准确的预训练表示，并在后续在线步中导致较大误差；相反，导数匹配预训练准确复现了均值场与起伏场及其一阶、二阶时间导数。因此该方法更适合学习非线性单摆方程的基函数，本节全部算例采用它。对导数匹配离线预训练，用全部 $N_{\mathrm{train}}=500$ 个实现在 $N_t=300$ 个时间网格点处的解及其一阶、二阶时间导数训练。

图 13 画出相对近似误差、近似解残差以及 lPINN 正、逆解相对误差随 $N_\eta$ 的变化；残差点数取 $N_{\mathrm{res}}=10N_\eta$，训练集规模固定为 $N_{\mathrm{train}}=500$；逆问题中 $\theta$ 测量数取 $N_m=50$。近似误差随 $N_\eta$ 增大显著下降，在 $N_\eta=400$ 处接近机器精度；相反，残差误差在所有测试宽度下保持在相同量级，表明对固定 $N_{\mathrm{train}}$，把最后层增大到 $N_\eta=200$ 以上并不改善整体解表示。正问题 lPINN 解在 $N_\eta=200$ 处取得最小误差；逆问题中估计 $\theta$ 与参数 $\gamma$ 的相对误差随 $N_\eta$ 减小，而估计参数 $\ell$ 几乎与之无关。因此兼顾精度与计算代价，后续数值实验取 $N_\eta=200$。

**图 13：** 非线性单摆方程。左：预训练起伏网络的近似误差与相应残差误差。中：lPINN 正问题预测的相对误差。右：lPINN 逆问题预测中解 $\theta$ 与推断参数 $\gamma$、$\ell$ 的相对误差。$N_{\mathrm{train}}=500$、$N_{\mathrm{res}}=10N_\eta$，逆问题取 $N_m=50$。

图 14 比较 PINN 与 lPINN 正解与参考解。lPINN 的 rRMSE 为 0.0022，PINN 为 0.0994，误差约降低 98%；计算代价从 PINN 的 2375.3 s 降到 lPINN 的 287.1 s，约加速 8.3 倍。

**图 14：** 非线性单摆方程正问题：PINN 与 lPINN 预测与参考解的比较。$N_{\mathrm{res}}=1000$、$N_\eta=200$、$N_{\mathrm{train}}=500$。

接下来考察残差点数如何影响正解精度。图 15(a) 表明 lPINN 误差在所有考虑的 $N_{\mathrm{res}}$ 下都小于 PINN。PINN 误差先随 $N_{\mathrm{res}}$ 下降，并在 $N_{\mathrm{res}}=2000$ 处达到渐近值；lPINN 误差也先随 $N_{\mathrm{res}}$ 下降，并在 $N_{\mathrm{res}}=1000$ 处达到渐近值。在 $N_{\mathrm{res}}=1000$ 处，lPINN 误差比 PINN 误差小一个数量级以上。

**图 15：** 非线性单摆正问题：（a）PINN 与 lPINN 预测解的 rRMSE 随残差点数 $N_{\mathrm{res}}$ 的变化。（b）残差与初始条件误差的 rRMSE 随 $N_{\mathrm{res}}$ 的变化。$N_\eta=200$、$N_{\mathrm{train}}=500$。

图 16 比较逆问题 PINN 与 lPINN 对 $\theta$ 的解与参考解。lPINN 解更准确，rRMSE 为 0.0014，PINN 为 0.3767；lPINN 的参数估计也更准确：$\gamma$ 的 rRMSE 为 0.0133、$\ell$ 为 0.0012，而 PINN 分别为 1.0917 与 0.2648。lPINN 解的在线部分耗时 209.0 s，PINN 为 2271.0 s。

**图 16：** 非线性单摆方程逆问题：PINN 与 lPINN 预测与参考解的比较。$N_{\mathrm{res}}=500$、$N_m=10$、$N_\eta=200$、$N_{\mathrm{train}}=500$。

图 17 描述测量数对 PINN 与 lPINN 逆解精度的影响。二者误差一般随 $N_m$ 增大而减小；lPINN 对 $\theta$ 与 $\ell$ 给出与 PINN 相近的误差，对 $\gamma$ 的估计更准确。当 $N_m=10$ 时，lPINN 对全部三个未知量的误差都小于 PINN；当 $N_m\ge20$ 时，lPINN 对 $\ell$ 与 $\gamma$ 给出与 PINN 相近的误差，而 PINN 对 $\theta$ 的估计更准确。

**图 17：** 非线性单摆方程逆问题：所推断阻尼系数 $\gamma$、摆长 $\ell$ 与预测解 $\theta$ 的相对均方根误差（rRMSE）随测量点数 $N_m$ 的变化。$N_{\mathrm{res}}=500$、$N_\eta=200$、$N_{\mathrm{train}}=500$。

### 3.4 lPINN 的超分辨

本节研究训练数据集中的数值误差与 lPINN 精度之间的相互依赖关系，其中 lPINN 精度作为生成离线预训练数据集所用模型数值分辨率的函数。目标是证明：在较粗网格上计算的数据集上预训练的 lPINN，能够产生比同一粗网格上计算的测试数值解更准确的数值解，更重要的是比在更细网格上计算的测试数值解更准确。我们把后者称为**超分辨**。我们针对 ADE、非线性 Burgers 与单摆方程展示 lPINN 的超分辨性质。

#### 3.4.1 ADE 方程

首先研究 lPINN 精度如何依赖构成训练数据集的数值仿真的精度。数值解用空间二阶中心差分与时间自适应五阶 Runge–Kutta（RK45）方法获得。我们生成三个训练数据集 $\{\mathcal D_i\}_{i=1}^{3}$，每个含 $N_{\mathrm{train}}=500$ 个数值仿真，在均匀网格 $(N_x^i,N_t^i)$（$N_x^i=N_t^i\in\{30,59,240\}$）上进行。在每个相应数据集上预训练五个 lPINN 模型。在线阶段用这些 lPINN 模型以 $N_{\mathrm{res}}=500$ 个残差点获得测试解；在生成相应数据集的网格上计算相对解析解的 rRMSE 误差。为比较，我们也在相应网格上计算数值测试解的 rRMSE。

图 18 表明 lPINN 与数值解的误差都随 $\Delta x=L/(N_x^i-1)$ 减小而减小。两个重要观察是：对同一 $\Delta x$，lPINN 误差小于数值解误差；更重要的是，在 $L/29$ 网格上得到的 lPINN 误差小于在更细 $L/58$ 网格上得到的数值解误差；类似地，对应 $L/58$ 网格尺寸的 lPINN 误差小于更细 $L/239$ 网格上的数值解误差。我们也看到在所考虑设置（训练数据集规模、基函数数目与残差点数）下 lPINN 超分辨的局限：在 $L/29$ 网格上预训练的 lPINN 误差大于 $L/239$ 网格上数值解的误差。

**图 18：** ADE 方程的 lPINN 预测误差随网格间距 $\Delta x$ 的变化。对每个网格，lPINN 用该网格上生成的数值解数据集预训练，然后在该网格上评估；$\Delta x$ 越小对应网格越细。$N_{\mathrm{res}}=500$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

#### 3.4.2 Burgers 方程

同样先研究 lPINN 精度如何依赖构成训练数据集的数值仿真的精度。数值解用空间二阶中心差分与时间自适应五阶 Runge–Kutta（RK45）方法获得。我们生成三个训练数据集 $\{\mathcal D_i\}_{i=1}^{3}$，每个含 $N_{\mathrm{train}}=500$ 个数值仿真，在均匀网格 $(N_x^i,N_t^i)$（$N_x^i=N_t^i\in\{15,30,59\}$）上进行。在每个相应数据集上预训练五个 lPINN 模型。在线阶段用这些 lPINN 模型以 $N_{\mathrm{res}}=100$ 个残差点获得测试解；在生成相应数据集的网格上计算相对解析解的 rRMSE 误差，并与相应网格上数值测试解的 rRMSE 比较。

图 19 表明 lPINN 与数值解误差都随 $\Delta x=L/(N_x^i-1)$ 减小而减小。两个重要观察是：对同一 $\Delta x$，lPINN 误差小于数值解误差；更重要的是，在 $L/14$ 网格上得到的 lPINN 误差小于更细 $L/29$ 网格上数值解的误差；类似地，对应 $L/29$ 网格尺寸的 lPINN 误差小于更细 $L/58$ 网格上数值解的误差。我们也看到在所考虑设置下的超分辨局限：在 $L/14$ 网格上预训练的 lPINN 误差大于 $L/58$ 网格上数值解的误差。

**图 19：** Burgers 方程的 lPINN 预测误差随网格间距 $\Delta x$ 的变化。对每个网格，lPINN 用该网格上生成的数值解数据集预训练，然后在该网格上评估；$\Delta x$ 越小对应网格越细。$N_{\mathrm{res}}=100$、$N_\eta=20$、$N_{\mathrm{train}}=500$。

#### 3.4.3 非线性单摆方程

接着考察同一结论对非线性单摆方程是否成立，其 lPINN 用导数匹配方法预训练。数值解用四阶 Runge–Kutta（RK4）方法获得。我们生成三个训练数据集 $\{\mathcal D_i\}_{i=1}^{3}$，每个含 $N_{\mathrm{train}}=500$ 个数值仿真，在 $t\in[0,30]$ 上的均匀时间网格 $N_t^i\in\{181,241,481\}$ 上进行，对应常数时间步长 $\Delta t=T/(N_t^i-1)$。在每个数据集上预训练 lPINN 模型。在线阶段，lPINN 模型用于以 $N_{\mathrm{res}}=1000$ 个随机采样残差点获得 $\gamma=0.1$、$\ell=0.8$ 的测试解。lPINN 的 rRMSE 与同一网格上、以及 $N_t=361$ 时计算的数值解 rRMSE 比较；全部 rRMSE 都相对于用自适应五阶 Runge–Kutta（RK5）方法、$N_t^{\mathrm{ref}}=2881$ 获得的高分辨率数值参考解计算。

我们考虑两组 lPINN 解：一组用 $N_{\mathrm{train}}=500$、$N_\eta=200$ 获得，另一组用 $N_{\mathrm{train}}=4000$、$N_\eta=400$ 获得。

图 20 画出数值解与 lPINN 解 rRMSE 随时间步长的变化。当 $N_{\mathrm{train}}=500$、$N_\eta=200$ 时 lPINN 未产生超分辨，且 lPINN 并不一致地优于同一时间网格上的数值解。把集合规模增至 $N_{\mathrm{train}}=4000$、基维度增至 $N_\eta=400$，基函数表示的精度显著提高，lPINN 解 rRMSE 明显下降。在此增强设置下，lPINN 的 rRMSE 小于同一时间网格上数值解的 rRMSE；此外，用 $N_t=181$ 训练的 lPINN 比用 $N_t=241$ 得到的数值解更准确，用 $N_t=241$ 训练的 lPINN 比用 $N_t=361$ 得到的数值解更准确。因此，$N_{\mathrm{train}}=4000$、$N_\eta=400$ 的 lPINN 实现了超分辨。

**图 20：** 非线性单摆方程的 lPINN 预测误差 $e_{\mathrm{lPINN}}$ 随时间步长 $\Delta t$ 的变化。对每个时间网格，lPINN 用该网格上生成的数值解数据集预训练，然后在该网格上评估；$\Delta t$ 越小对应时间网格越细。$N_{\mathrm{res}}=1000$。

## 4 结论

我们把线性化物理信息神经网络（lPINN）发展为面向由微分方程支配的多次查询正问题与逆问题的物理校正神经降阶基方法。该方法的核心特征是：离线用数值解集合学习连续、依赖坐标的神经基函数，而每个新问题的解通过在该低维系数空间中最小化控制方程残差在线确定。连续神经基可通过导数匹配预训练，也可通过用物理残差增强解重构来预训练；这些替代方式为表示在线推断所需的微分量提供了不同机制。数值实验表明，首选策略可能依赖控制方程与神经架构：基于残差的预训练对对流—扩散方程与 Burgers 方程产生最准确的下游解，而导数匹配预训练对振荡的非线性单摆问题更有效。后一算例还表明，当解族含有标准多层感知机难以表示的振荡分量时，该框架可纳入 Fourier 特征网络。一旦神经试探空间构造完成，lPINN 把问题特定优化限制在降阶系数（逆问题中还有未知物理参数）上：对线性微分算子，在线问题可作为正则化线性最小二乘求解；对非线性算子，残差在降阶变量中仍为非线性，但非线性特征表示不再重新训练。这一区别使 lPINN 能把最终层适配从线性正问题扩展到非线性正问题与逆问题推断。我们在对流—扩散方程、Burgers 方程与非线性单摆方程上评估了该方法；在所报告测试用例中，lPINN 比相应原版 PINN 产生更低的解误差与参数误差，同时把在线推断时间缩短约一个数量级到三个数量级以上，且当残差点数或测量点数受限时优势通常最明显。跨分辨率实验进一步表明，由粗网格解数据学到的连续基可在更细网格上评估而无需重新训练，且精度几乎不变；这些结果证明了所学表示的跨分辨率迁移，尽管可达到的精度仍受离线试探空间的质量与表达能力的限制。

若干局限界定了本文结果的范围。第一，lPINN 需要具有代表性的数值解集合，其在预训练所覆盖的参数、初始条件或边界条件范围之外的可信性尚未确立。第二，生成训练集合与学习神经基可能计算代价高昂，因此该方法最适合离线代价可在足够多正问题或逆问题查询上摊销的场合。第三，性能依赖基维度、架构、预训练目标、正则化以及初始与边界条件的在线施加方式；某些实验中观察到的约束精度退化也表明，当在线只最小化内部微分方程残差时，不应总假设离线学到的性质仍被满足。未来工作应建立选择基维度与预训练策略的系统准则，发展对初始集合未充分表示的参数区域的自适应增强方法，并研究在降阶推断中对初始与边界条件的精确或加权施加。其他优先方向包括量化分布外泛化、分析摊销计算代价与条件数，以及把该方法与经典残差最小化降阶模型、随机特征方法与神经算子进行比较。向高维系统、空间非均质系数、可变几何以及场尺度正逆问题的扩展，将是确定该方法实际适用范围所必需的。

总体而言，这些结果支持在多查询设置中把 lPINN 作为反复全网络 PINN 优化的替代方案：通过在离线学习算子相容的连续神经降阶基，并在其系数空间在线施加控制物理，lPINN 把可复用的数据驱动表示与问题特定的物理校正结合起来。

本文的比较旨在分离"用预训练神经试探空间中的降阶系数推断替代实例特定全网络 PINN 优化"所带来的计算后果；不应把它们解释为确立了相对经典或非线性降阶模型的优越性。系统的 ROM 比较需要控制快照集合、基维度、离散模态的连续重构、导数近似、残差采样、约束施加与超缩减（hyper-reduction）等因素。此类比较是未来工作的重要方向，尤其是为了量化 lPINN 基固有的坐标连续性与自动可微性在何时足以证明其额外离线训练代价是合理的。

## 5 致谢

本研究得到 CUSSP（Center for Understanding Subsurface Signals and Permeability，由美国能源部（DOE）科学办公室在 FWP 81834 下资助的 Energy Earthshot Research Center）以及 UIUC Grainger 工学院 SRI（Strategic Research Initiative）计划的支持。

## 6 附录

### 6.1 超参数、误差与标准差汇总

**表 3　lPINN 基规模研究中的正问题。** $N_{\mathrm{train}}=500$。对 ADE 方程 $N_{\mathrm{IC}}=N_{\mathrm{res}}$、$N_{\mathrm{BC}}=2N_{\mathrm{res}}$；对 Burgers 方程 $N_{\mathrm{IC}}=N_{\mathrm{BC}}=N_{\mathrm{res}}$。

| Fig. | Equation | $N_\eta$ | $N_{\mathrm{res}}$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{BC}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ |
|---|---|---|---|---|---|---|---|---|
| 2 | ADE | 10 | 100 | 0.7 | 1 | 0 | 0.002579 | 0.001858 |
| 2 | ADE | 20 | 200 | 1.5 | 1.75 | 10⁻⁴ | 0.004899 | 0.002794 |
| 2 | ADE | 50 | 500 | 0.3 | 0.5 | 0 | 0.001249 | 0.002268 |
| 2 | ADE | 100 | 1000 | 0.6 | 1 | 10⁻⁴ | 0.001342 | 0.002638 |
| 2 | ADE | 150 | 1500 | 0.6 | 0.85 | 0 | 0.001555 | 0.001287 |
| 2 | ADE | 200 | 2000 | 0.7 | 1 | 0 | 0.001499 | 0.001388 |
| 8 | Burgers' | 8 | 80 | 1 | 10 | 0 | 0.000962 | 0.000280 |
| 8 | Burgers' | 20 | 200 | 10 | 1 | 10⁻⁸ | 0.000741 | 0.000185 |
| 8 | Burgers' | 50 | 500 | 30 | 3 | 0 | 0.001526 | 0.000159 |
| 8 | Burgers' | 100 | 1000 | 10 | 0 | 0 | 0.001880 | 0.000218 |

**表 4　lPINN 基规模研究中的非线性单摆正问题。** $N_{\mathrm{train}}=500$。

| Fig. | $N_\eta$ | $N_{\mathrm{res}}$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{IC},1}$ | $\lambda$ | $\mathrm{rRMSE}_\theta$ | $\sigma_{\mathrm{rRMSE}_\theta}$ |
|---|---|---|---|---|---|---|---|
| 13 | 100 | 1000 | 316.228 | 0.003 | 0 | 0.050856 | 0.005259 |
| 13 | 200 | 2000 | 0.01 | 10 | 0 | 0.002318 | 0.003529 |
| 13 | 400 | 4000 | 0 | 0 | 10⁻⁴ | 0.003344 | 0.000264 |

**表 5　lPINN 基规模研究中的 ADE 逆问题。** $N_{\mathrm{train}}=500$、$N_m=40$、$N_{\mathrm{IC}}=N_{\mathrm{BC}}=N_{\mathrm{res}}$、$\lambda_{\mathrm{data}}=1$（Fig. 2）。

| $N_\eta$ | $N_{\mathrm{res}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ | $\mathrm{rRMSE}_V$ | $\sigma_{\mathrm{rRMSE}_V}$ | $\mathrm{rRMSE}_D$ | $\sigma_{\mathrm{rRMSE}_D}$ |
|---|---|---|---|---|---|---|---|---|
| 10 | 100 | 0 | 0.007071 | 0.004013 | 0.003085 | 0.002319 | 0.194328 | 0.221529 |
| 20 | 200 | 0 | 0.008056 | 0.000843 | 0.005200 | 0.001114 | 0.197752 | 0.035221 |
| 50 | 500 | 10⁻⁶ | 0.003898 | 0.002181 | 0.004135 | 0.002421 | 0.107233 | 0.088383 |
| 100 | 1000 | 10⁻⁸ | 0.006063 | 0.001795 | 0.004601 | 0.001695 | 0.166546 | 0.067861 |
| 150 | 1500 | 0 | 0.005475 | 0.001152 | 0.003259 | 0.001233 | 0.134873 | 0.046461 |
| 200 | 2000 | 10⁻⁶ | 0.006883 | 0.001085 | 0.005783 | 0.000727 | 0.195849 | 0.046107 |

**表 6　lPINN 基规模研究中的 Burgers 方程逆问题。** $N_{\mathrm{train}}=500$、$N_m=50$、$N_{\mathrm{IC}}=N_{\mathrm{BC}}=N_{\mathrm{res}}$、$\lambda_{\mathrm{data}}=1$（Fig. 8）。

| $N_\eta$ | $N_{\mathrm{res}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ | $\mathrm{rRMSE}_\nu$ | $\sigma_{\mathrm{rRMSE}_\nu}$ |
|---|---|---|---|---|---|---|
| 8 | 80 | 0 | 0.005800 | 0.001245 | 0.039483 | 0.008887 |
| 20 | 200 | 10⁻⁶ | 0.006070 | 0.002712 | 0.042535 | 0.019688 |
| 50 | 500 | 10⁻⁸ | 0.002922 | 0.000346 | 0.014586 | 0.003803 |
| 100 | 1000 | 10⁻⁸ | 0.003454 | 0.000325 | 0.018585 | 0.002970 |

**表 7　lPINN 基规模研究中的非线性单摆逆问题。** $N_{\mathrm{train}}=500$、$N_m=50$、$\lambda_{\mathrm{data}}=1$（Fig. 13）。

| $N_\eta$ | $N_{\mathrm{res}}$ | $\lambda$ | $\mathrm{rRMSE}_\theta$ | $\sigma_{\mathrm{rRMSE}_\theta}$ | $\mathrm{rRMSE}_\gamma$ | $\sigma_{\mathrm{rRMSE}_\gamma}$ | $\mathrm{rRMSE}_\ell$ | $\sigma_{\mathrm{rRMSE}_\ell}$ |
|---|---|---|---|---|---|---|---|---|
| 100 | 1000 | 0 | 0.006772 | 0.000292 | 0.04747 | 0.006382 | 0.00092 | 0.000347 |
| 200 | 2000 | 10⁻⁸ | 0.001398 | 0.000245 | 0.02072 | 0.001825 | 0.00083 | 0.000248 |
| 400 | 4000 | 10⁻⁸ | 0.000600 | 0.000028 | 0.01841 | 0.000628 | 0.00134 | 0.000025 |

**表 8　正问题：PINN 与 lPINN 误差随 $N_{\mathrm{res}}$ 的变化。** lPINN 取 $N_{\mathrm{train}}=500$。对 ADE 方程 $N_{\mathrm{IC}}=N_{\mathrm{res}}$、$N_{\mathrm{BC}}=2N_{\mathrm{res}}$；对 Burgers 方程 $N_{\mathrm{IC}}=N_{\mathrm{BC}}=N_{\mathrm{res}}$。

| Fig. | Equation | $N_{\mathrm{res}}$ | Method | $N_\eta$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{BC}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ |
|---|---|---|---|---|---|---|---|---|---|
| 4 | ADE | 100 | PINN | – | 1 | 1 | 10⁻⁴ | 0.028976 | 0.026853 |
| 4 | ADE | 100 | lPINN | 50 | 0.003 | 0.01 | 10⁻⁴ | 0.002354 | 0.005093 |
| 3,4 | ADE | 500 | PINN | – | 1 | 1 | 10⁻⁴ | 0.010406 | 0.004776 |
| 3,4 | ADE | 500 | lPINN | 50 | 0.1 | 0.1 | 10⁻⁴ | 0.001451 | 0.002036 |
| 4 | ADE | 1500 | PINN | – | 1 | 1 | 10⁻⁴ | 0.010727 | 0.004047 |
| 4 | ADE | 1500 | lPINN | 50 | 0.3 | 0.3 | 10⁻⁴ | 0.001420 | 0.001167 |
| 4 | ADE | 3000 | PINN | – | 1 | 1 | 10⁻⁴ | 0.010341 | 0.002033 |
| 4 | ADE | 3000 | lPINN | 50 | 3.225 | 6.45 | 10⁻⁴ | 0.001447 | 0.000705 |
| 9,10 | Burgers' | 100 | PINN | – | 1 | 2 | 10⁻⁶ | 0.043862 | 0.099357 |
| 9,10 | Burgers' | 100 | lPINN | 20 | 24 | 0.03 | 10⁻⁶ | 0.000807 | 0.000189 |
| 10 | Burgers' | 300 | PINN | – | 1 | 2 | 10⁻⁶ | 0.000902 | 0.000905 |
| 10 | Burgers' | 300 | lPINN | 20 | 25 | 1.00 | 10⁻⁶ | 0.000780 | 0.000047 |
| 10 | Burgers' | 800 | PINN | – | 1 | 2 | 10⁻⁶ | 0.000211 | 0.000331 |
| 10 | Burgers' | 800 | lPINN | 20 | 25 | 0.15 | 10⁻⁶ | 0.000810 | 0.000041 |
| 10 | Burgers' | 1500 | PINN | – | 1 | 2 | 10⁻⁶ | 0.000151 | 0.000099 |
| 10 | Burgers' | 1500 | lPINN | 20 | 25 | 0.005 | 10⁻⁶ | 0.000835 | 0.000051 |

**表 9　非线性单摆正问题：PINN 与 lPINN 误差随 $N_{\mathrm{res}}$ 的变化。** lPINN 取 $N_{\mathrm{train}}=500$。

| Fig. | $N_{\mathrm{res}}$ | Method | $N_\eta$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{IC},1}$ | $\lambda$ | $\mathrm{rRMSE}_\theta$ | $\sigma_{\mathrm{rRMSE}_\theta}$ |
|---|---|---|---|---|---|---|---|---|
| 15 | 500 | PINN | – | 1 | 1 | 10⁻⁸ | 0.271213 | 0.112946 |
| 15 | 500 | lPINN | 200 | 10⁻⁴ | 0 | 10⁻⁸ | 0.005755 | 0.013405 |
| 14,15 | 1000 | PINN | – | 1 | 1 | 10⁻⁸ | 0.099410 | 0.159099 |
| 14,15 | 1000 | lPINN | 200 | 3 | 3 | 10⁻⁸ | 0.002208 | 0.003536 |
| 15 | 2000 | PINN | – | 1 | 1 | 10⁻⁸ | 0.015899 | 0.000640 |
| 15 | 2000 | lPINN | 200 | 10 | 100 | 10⁻⁸ | 0.002178 | 0.004497 |
| 15 | 8000 | PINN | – | 1 | 1 | 10⁻⁸ | 0.016420 | 0.000193 |
| 15 | 8000 | lPINN | 200 | 0.1 | 300 | 10⁻⁸ | 0.002187 | 0.002994 |

**表 10　ADE 逆问题：PINN 与 lPINN 误差随 $N_m$ 的变化。** $N_{\mathrm{train}}=500$、$N_\eta=50$、$N_{\mathrm{res}}=500$、$N_{\mathrm{IC}}=500$、$N_{\mathrm{BC}}=500$、$\lambda_{\mathrm{data}}=1$。

| Fig. | $N_m$ | Method | $N_{\mathrm{res}}$ | $N_\eta$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{BC}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ | $\mathrm{rRMSE}_V$ | $\sigma_{\mathrm{rRMSE}_V}$ | $\mathrm{rRMSE}_D$ | $\sigma_{\mathrm{rRMSE}_D}$ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 6 | 5 | PINN | 500 | 50 | 1 | 1 | 10⁻⁴ | 0.253604 | 0.235495 | 0.486947 | 0.513296 | 0.996616 | 0.001698 |
| 6 | 5 | lPINN | 500 | 50 | 0 | 0 | 0 | 0.010980 | 0.004001 | 0.006302 | 0.001981 | 0.366958 | 0.158113 |
| 5,6 | 40 | PINN | 500 | 50 | 1 | 1 | 0 | 0.050878 | 0.030874 | 0.028985 | 0.019506 | 0.851279 | 0.279618 |
| 5,6 | 40 | lPINN | 500 | 50 | 0 | 0 | 0 | 0.003886 | 0.002205 | 0.004118 | 0.002396 | 0.107385 | 0.089965 |
| 6 | 80 | PINN | 500 | 50 | 1 | 1 | 0 | 0.018262 | 0.040573 | 0.024940 | 0.029324 | 0.491649 | 0.416658 |
| 6 | 80 | lPINN | 500 | 50 | 0 | 0 | 0 | 0.002356 | 0.000988 | 0.002744 | 0.001640 | 0.052280 | 0.056886 |
| 6 | 160 | PINN | 500 | 50 | 1 | 1 | 10⁻⁶ | 0.002576 | 0.004371 | 0.001215 | 0.007101 | 0.172043 | 0.281317 |
| 6 | 160 | lPINN | 500 | 50 | 0 | 0 | 0 | 0.001833 | 0.000939 | 0.001649 | 0.001257 | 0.051348 | 0.056867 |

**表 11　Burgers 方程逆问题：PINN 与 lPINN 误差随 $N_m$ 的变化。** $N_{\mathrm{train}}=500$、$N_\eta=50$、$N_{\mathrm{res}}=100$、$N_{\mathrm{IC}}=100$、$N_{\mathrm{BC}}=100$。

| Fig. | $N_m$ | Method | $\lambda_{\mathrm{data}}$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{BC}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ | $\mathrm{rRMSE}_{\bar\nu}$ | $\sigma_{\mathrm{rRMSE}_\nu}$ |
|---|---|---|---|---|---|---|---|---|---|---|
| 12 | 1 | PINN | 1 | 1 | 1 | 10⁻⁸ | 0.089693 | 0.040345 | 0.43077 | 0.193140 |
| 12 | 1 | lPINN | 1 | 0 | 0 | 10⁻⁸ | 0.002252 | 0.001035 | 0.00786 | 0.006911 |
| 11,12 | 5 | PINN | 1 | 1 | 1 | 10⁻⁸ | 0.006089 | 0.016743 | 0.01190 | 0.027147 |
| 11,12 | 5 | lPINN | 1 | 0 | 0 | 10⁻⁶ | 0.001568 | 0.000236 | 0.00318 | 0.002070 |
| 12 | 20 | PINN | 1 | 1 | 1 | 0 | 0.001236 | 0.001589 | 0.00214 | 0.011031 |
| 12 | 20 | lPINN | 5 | 0 | 0 | 10⁻⁸ | 0.001503 | 0.000098 | 0.00196 | 0.001913 |
| 12 | 50 | PINN | 1 | 1 | 1 | 10⁻⁶ | 0.001059 | 0.000894 | 0.00173 | 0.004184 |
| 12 | 50 | lPINN | 1000 | 0 | 0 | 10⁻⁸ | 0.001409 | 0.000052 | 0.001456 | 0.001385 |

**表 12　非线性单摆逆问题：PINN 与 lPINN 误差随 $N_m$ 的变化。** $N_{\mathrm{train}}=500$、$N_\eta=200$、$N_{\mathrm{res}}=500$。

| Fig. | $N_m$ | Method | $\lambda_{\mathrm{data}}$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{IC},1}$ | $\lambda$ | $\mathrm{rRMSE}_\theta$ | $\sigma_{\mathrm{rRMSE}_\theta}$ | $\mathrm{rRMSE}_\gamma$ | $\sigma_{\mathrm{rRMSE}_\gamma}$ | $\mathrm{rRMSE}_\ell$ | $\sigma_{\mathrm{rRMSE}_\ell}$ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 17 | 5 | PINN | 1 | 10 | 10 | 10⁻⁴ | 0.434149 | 0.048105 | 1.10 | 0.337883 | 0.497 | 0.107659 |
| 17 | 5 | lPINN | 1 | 0 | 0 | 10⁻⁴ | 0.501447 | 0.000623 | 0.314 | 0.018098 | 0.499 | 0.000960 |
| 16,17 | 10 | PINN | 1 | 10 | 10 | 0 | 0.376713 | 0.135898 | 1.09 | 0.507195 | 0.265 | 0.161166 |
| 16,17 | 10 | lPINN | 5 | 0 | 0 | 10⁻⁸ | 0.001433 | 0.000873 | 0.01332 | 0.006621 | 0.001212 | 0.000433 |
| 17 | 20 | PINN | 1 | 10 | 10 | 10⁻⁴ | 0.000530 | 0.000107 | 0.0145 | 0.003320 | 0.00114 | 0.000068 |
| 17 | 20 | lPINN | 5 | 0 | 0 | 10⁻⁸ | 0.001150 | 0.000732 | 0.01308 | 0.009210 | 0.00121 | 0.000390 |
| 17 | 50 | PINN | 1 | 10 | 10 | 10⁻⁶ | 0.000307 | 0.000244 | 0.0112 | 0.005170 | 0.00129 | 0.000288 |
| 17 | 50 | lPINN | 1000 | 0 | 0 | 10⁻⁸ | 0.000825 | 0.000112 | 0.01336 | 0.006976 | 0.00123 | 0.000387 |

**表 13　ADE lPINN 与 dPICKLE 比较。** $N_{\mathrm{train}}=500$、$N_\eta=50$、$N_{\mathrm{res}}=784$、$N_{\mathrm{IC}}=30$、$N_{\mathrm{BC}}=59$。

| Method | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{BC}}$ | $\lambda$ | $\mathrm{rRMSE}_u$ |
|---|---|---|---|---|
| lPINN | 0.5 | 750 | 10⁻⁴ | 0.0013 |
| dPICKLE | – | – | – | 0.0470 |

**表 14　超分辨研究。** ADE 方程取 $N_{\mathrm{IC}}=N_{\mathrm{res}}$、$N_{\mathrm{BC}}=2N_{\mathrm{res}}$；Burgers 方程取 $N_{\mathrm{IC}}=N_{\mathrm{BC}}=N_{\mathrm{res}}$。lPINN 取 $N_{\mathrm{train}}=500$，$\mathrm{rRMSE}_{\mathrm{num}}$ 为数值解的误差。

| Fig. | Equation | Mesh ($N_t\times N_x$) | $N_\eta$ | $N_{\mathrm{res}}$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{BC}}$ | $\lambda$ | $\mathrm{rRMSE}_{\mathrm{num}}$ | $\mathrm{rRMSE}_u$ | $\sigma_{\mathrm{rRMSE}_u}$ |
|---|---|---|---|---|---|---|---|---|---|---|
| 18 | ADE | 30×30 | 50 | 500 | 7 | 6 | 0 | 0.055363 | 0.008344 | 0.002795 |
| 18 | ADE | 59×59 | 50 | 500 | 3.5 | 5 | 10⁻⁸ | 0.024839 | 0.002061 | 0.002378 |
| 18 | ADE | 240×240 | 50 | 500 | 0.48 | 0.96 | 0 | 0.002109 | 0.001816 | 0.001932 |
| 19 | Burgers' | 15×15 | 20 | 100 | 30 | 70 | 0 | 0.120381 | 0.005004 | 0.000806 |
| 19 | Burgers' | 30×30 | 20 | 100 | 8 | 0.1 | 10⁻⁴ | 0.029587 | 0.003316 | 0.000202 |
| 19 | Burgers' | 59×59 | 20 | 100 | 0.3 | 10 | 10⁻⁸ | 0.005350 | 0.000618 | 0.000088 |

**表 15　非线性单摆超分辨研究。** lPINN 取 $N_{\mathrm{res}}=1000$，$\mathrm{rRMSE}_{\mathrm{num}}$ 为数值解的误差。

| Fig. | $N_t$ | $N_{\mathrm{train}}$ | $N_\eta$ | $\lambda_{\mathrm{IC},0}$ | $\lambda_{\mathrm{IC},1}$ | $\lambda$ | $\mathrm{rRMSE}_{\mathrm{num}}$ | $\mathrm{rRMSE}_\theta$ | $\sigma_{\mathrm{rRMSE}_\theta}$ |
|---|---|---|---|---|---|---|---|---|---|
| 20 | 181 | 500 | 200 | 10 | 10 | 10⁻⁸ | 0.004882 | 0.003288 | 0.002839 |
| 20 | 241 | 500 | 200 | 10 | 1 | 0 | 0.001046 | 0.004369 | 0.003157 |
| 20 | 481 | 500 | 200 | 100 | 100 | 10⁻⁶ | 0.000120 | 0.000597 | 0.001220 |
| 20 | 181 | 4000 | 400 | 10 | 10 | 0 | 0.004882 | 0.000691 | 0.001927 |
| 20 | 241 | 4000 | 400 | 0.1 | 1 | 10⁻⁶ | 0.001046 | 0.000131 | 0.000760 |
| 20 | 481 | 4000 | 400 | 0.1 | 0.1 | 0 | 0.000120 | 0.000114 | 0.000362 |

**表 16　离线预训练。** 对 ADE 与 Burgers 方程，式 (15) 中取 $\lambda_f=\lambda_{\mathrm{IC},0}=\lambda_{\mathrm{BC}}=1$；对非线性单摆方程，$\lambda_1=\lambda_4=1$（原文此处交叉引用显示为 "??"，见页尾原文疑点注）。

| Equation | $\lambda$ |
|---|---|
| ADE | 10⁻⁶ |
| Burgers | 10⁻⁶ |
| 非线性单摆（均值网络） | 0 |
| 非线性单摆（基） | 10⁻⁶ |

## 图注与表注

**图 1：** lPINN 方法示意图。均值 DNN 的全部参数以及与起伏 DNN 各层相关的参数都用训练数据集离线估计；起伏 DNN 最后一层其余参数针对给定参数、用物理信息损失确定。

**图 2：** ADE 问题：左：预训练起伏网络的近似误差与相应残差误差；中：lPINN 正问题预测的相对误差；右：lPINN 逆问题预测中解 $u$ 与推断参数 $V$、$D$ 的相对误差。$N_{\mathrm{train}}=500$。本测试中 $N_\eta=50$、$N_{\mathrm{res}}=500$ 的 lPINN 误差与后续正问题中同参数下的误差不能直接比较，因为该问题对所有 $N_{\mathrm{res}}$ 使用共享的 $\lambda=10^{-4}$。

**图 3：** ADE 正问题：（a）PINN 与 lPINN 预测在 $t=20.7$ s 与 $200.0$ s 处与参考解的比较；（b）$t=20.7$ s 与 $200.0$ s 处同一网格上 $N_x=30$ 个网格点的逐点标准差。$N_{\mathrm{res}}=500$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 4：** ADE 正问题：（a）rRMSE($u$) 随残差点数 $N_{\mathrm{res}}$ 的变化（$u$ 为 10 次 PINN 或 lPINN 解的平均）；（b）残差、初始条件与边界条件误差的 rRMSE 随 $N_{\mathrm{res}}$ 的变化。$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 5：** ADE 逆问题：PINN 与 lPINN 对 $u(x,t)$ 的估计在 $t=20.7$ s 与 $200.0$ s 处与参考解的比较。$N_{\mathrm{res}}=500$、$N_m=40$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 6：** ADE 逆问题：所推断速度 $V$、弥散系数 $D$ 与预测解 $u$ 的 rRMSE 随测量点数 $N_m$ 的变化。$N_{\mathrm{res}}=500$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 7：** ADE 正问题：lPINN 与 dPICKLE 预测在 $t=20.7$ s 与 $200.0$ s 处与参考解的比较。$N_{\mathrm{res}}=784$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 8：** Burgers 方程：左：预训练起伏网络的近似误差与相应残差误差；中：lPINN 正问题预测的相对误差；右：lPINN 逆问题预测中解 $u$ 与推断参数 $\nu$ 的相对误差。$N_{\mathrm{train}}=500$。

**图 9：** Burgers 正问题：PINN 与 lPINN 预测在 $t=0.0$ s 与 $1.0$ s 处与参考解的比较。$N_{\mathrm{res}}=100$、$N_\eta=20$、$N_{\mathrm{train}}=500$。

**图 10：** Burgers 正问题：（a）PINN 与 lPINN 预测解的 rRMSE 随 $N_{\mathrm{res}}$ 的变化；（b）残差、初始条件与边界条件误差的 rRMSE 随 $N_{\mathrm{res}}$ 的变化。$N_\eta=20$、$N_{\mathrm{train}}=500$。

**图 11：** Burgers 逆问题：PINN 与 lPINN 预测在 $t=0.0$ 与 $1.0$ s 处与参考解的比较。$N_{\mathrm{res}}=100$、$N_m=5$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 12：** Burgers 逆问题：所推断运动黏度 $\nu$ 与预测解 $u$ 的 rRMSE 随测量点数 $N_m$ 的变化。$N_{\mathrm{res}}=100$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 13：** 非线性单摆方程：左：预训练起伏网络的近似误差与相应残差误差；中：lPINN 正问题预测的相对误差；右：lPINN 逆问题预测中解 $\theta$ 与推断参数 $\gamma$、$\ell$ 的相对误差。$N_{\mathrm{train}}=500$、$N_{\mathrm{res}}=10N_\eta$，逆问题取 $N_m=50$。

**图 14：** 非线性单摆方程正问题：PINN 与 lPINN 预测与参考解的比较。$N_{\mathrm{res}}=1000$、$N_\eta=200$、$N_{\mathrm{train}}=500$。

**图 15：** 非线性单摆正问题：（a）PINN 与 lPINN 预测解的 rRMSE 随 $N_{\mathrm{res}}$ 的变化；（b）残差与初始条件误差的 rRMSE 随 $N_{\mathrm{res}}$ 的变化。$N_\eta=200$、$N_{\mathrm{train}}=500$。

**图 16：** 非线性单摆方程逆问题：PINN 与 lPINN 预测与参考解的比较。$N_{\mathrm{res}}=500$、$N_m=10$、$N_\eta=200$、$N_{\mathrm{train}}=500$。

**图 17：** 非线性单摆方程逆问题：所推断阻尼系数 $\gamma$、摆长 $\ell$ 与预测解 $\theta$ 的 rRMSE 随测量点数 $N_m$ 的变化。$N_{\mathrm{res}}=500$、$N_\eta=200$、$N_{\mathrm{train}}=500$。

**图 18：** ADE 方程的 lPINN 预测误差随网格间距 $\Delta x$ 的变化。对每个网格，lPINN 用该网格上生成的数值解数据集预训练，然后在该网格上评估；$\Delta x$ 越小对应网格越细。$N_{\mathrm{res}}=500$、$N_\eta=50$、$N_{\mathrm{train}}=500$。

**图 19：** Burgers 方程的 lPINN 预测误差随网格间距 $\Delta x$ 的变化。对每个网格，lPINN 用该网格上生成的数值解数据集预训练，然后在该网格上评估；$\Delta x$ 越小对应网格越细。$N_{\mathrm{res}}=100$、$N_\eta=20$、$N_{\mathrm{train}}=500$。

**图 20：** 非线性单摆方程的 lPINN 预测误差 $e_{\mathrm{lPINN}}$ 随时间步长 $\Delta t$ 的变化。对每个时间网格，lPINN 用该网格上生成的数值解数据集预训练，然后在该网格上评估；$\Delta t$ 越小对应时间网格越细。$N_{\mathrm{res}}=1000$。

> **原文说明：** 原文表 1、表 2 位于正文第 3.1 与 3.2 节；表 3–16 集中在第 6.1 节附录，逐格已按 PDF 第 11、16、25–29 页渲染图核对。原文表 16 的题注交叉引用显示为 "??"，属原文排版遗留，译文照录并在此说明。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 29–30 页转录；未逐条核对 DOI）。

[1] Maziar Raissi, Paris Perdikaris, and George E Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational physics, 378:686–707, 2019.

[2] GE Karniadakis, IG Kevrekidis, L Lu, P Perdikaris, S Wang, and L Yang. Physics-informed machine learning: Nature reviews physics. (2021). 2021.

[3] Alexandre M Tartakovsky, C Ortiz Marrero, Paris Perdikaris, Guzel D Tartakovsky, and David Barajas-Solano. Physics-informed deep neural networks for learning parameters and constitutive relationships in subsurface flow problems. Water Resources Research, 56(5):e2019WR026731, 2020.

[4] Ramakrishna Tipireddy, Paris Perdikaris, Panos Stinis, and Alexandre Tartakovsky. A comparative study of physics-informed neural network models for learning unknown dynamics and constitutive relations. arXiv preprint arXiv:1904.04058, 2019.

[5] Aditi Krishnapriyan, Amir Gholami, Shandian Zhe, Robert Kirby, and Michael W Mahoney. Characterizing possible failure modes in physics-informed neural networks. Advances in neural information processing systems, 34:26548–26560, 2021.

[6] Jorge F Urbán, Petros Stefanou, and José A Pons. Unveiling the optimization process of physics informed neural networks: How accurate and competitive can pinns be? Journal of Computational Physics, 523:113656, 2025.

[7] Sifan Wang, Yujun Teng, and Paris Perdikaris. Understanding and mitigating gradient flow pathologies in physics-informed neural networks. SIAM Journal on Scientific Computing, 43(5):A3055–A3081, 2021.

[8] Matthew Tancik, Pratul Srinivasan, Ben Mildenhall, Sara Fridovich-Keil, Nithin Raghavan, Utkarsh Singhal, Ravi Ramamoorthi, Jonathan Barron, and Ren Ng. Fourier features let networks learn high frequency functions in low dimensional domains. Advances in neural information processing systems, 33:7537–7547, 2020.

[9] Sifan Wang, Xinling Yu, and Paris Perdikaris. When and why pinns fail to train: A neural tangent kernel perspective. Journal of Computational Physics, 449:110768, 2022.

[10] Jan S. Hesthaven, Gianluigi Rozza, and Benjamin Stamm. Certified Reduced Basis Methods for Parametrized Partial Differential Equations. Springer International Publishing, Cham, 2016.

[11] Alfio Quarteroni, Andrea Manzoni, and Federico Negri. Reduced Basis Methods for Partial Differential Equations: An Introduction. Springer International Publishing, Cham, 2016.

[12] A.M. Tartakovsky, D.A. Barajas-Solano, and Q. He. Physics-informed machine learning with conditional Karhunen-Loève expansions. Journal of Computational Physics, 426:109904, 2021.

[13] Kevin Carlberg, Charbel Bou-Mosleh, and Charbel Farhat. Efficient non-linear model reduction via a least-squares petrov–galerkin projection and compressive tensor approximations. International Journal for Numerical Methods in Engineering, 86(2):155–181, 2011.

[14] Kevin Carlberg, Matthew Barone, and Harbir Antil. Galerkin v. least-squares petrov–galerkin projection in nonlinear model reduction. Journal of Computational Physics, 330:693–734, 2017.

[15] Kevin Carlberg, Charbel Farhat, Julien Cortial, and David Amsallem. The GNAT method for nonlinear model reduction: Effective implementation and application to computational fluid dynamics and turbulent flows. Journal of Computational Physics, 242:623–647, 2013.

[16] Youngsoo Choi and Kevin Carlberg. Space–time least-squares petrov–galerkin projection for nonlinear model reduction. SIAM Journal on Scientific Computing, 41(1):A26–A58, 2019.

[17] Alexandre M Tartakovsky and Yifei Zong. Physics-informed machine learning method with space-time karhunen-loève expansions for forward and inverse partial differential equations. Journal of Computational Physics, 499:112723, 2024.

[18] Yiheng Xie, Towaki Takikawa, Shunsuke Saito, Or Litany, Shiqin Yan, Numair Khan, Federico Tombari, James Tompkin, Vincent Sitzmann, and Srinath Sridhar. Neural fields in visual computing and beyond. Computer Graphics Forum, 41(2):641–676, 2022.

[19] Peter Yichen Chen, Jinxu Xiang, Dong Heon Cho, Yue Chang, G. A. Pershing, Henrique Teles Maia, Maurizio M. Chiaramonte, Kevin Carlberg, and Eitan Grinspun. CROM: Continuous reduced-order modeling of PDEs using implicit neural representations. In International Conference on Learning Representations, 2023.

[20] Minji Kim, Tianshu Wen, Kookjin Lee, and Youngsoo Choi. Physics-informed reduced order model with conditional neural fields. arXiv preprint arXiv:2412.05233, 2024.

[21] Vikas Dwivedi and Balaji Srinivasan. Physics informed extreme learning machine (PIELM)–a rapid method for the numerical solution of partial differential equations. Neurocomputing, 391:96–118, 2020.

[22] Xu Liu, Wen Yao, Wei Peng, and Weien Zhou. Bayesian physics-informed extreme learning machine for forward and inverse PDE problems with noisy data. Neurocomputing, 549:126425, 2023.

[23] Jingrun Chen, Xurong Chi, Weinan E, and Zhouwang Yang. Bridging traditional and machine learning-based algorithms for solving PDEs: The random feature method. arXiv preprint arXiv:2207.13380, 2022.

[24] Shaan Desai, Marios Mattheakis, Hayden Joy, Pavlos Protopapas, and Stephen Roberts. One-shot transfer learning of physics-informed neural networks. arXiv preprint arXiv:2110.11286, 2021.

[25] Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, and George Em Karniadakis. Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators. Nature Machine Intelligence, 3:218–229, 2021.

[26] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Fourier neural operator for parametric partial differential equations. In International Conference on Learning Representations, 2021.

[27] Sifan Wang, Hanwen Wang, and Paris Perdikaris. Learning the solution operator of parametric partial differential equations with physics-informed DeepONets. Science Advances, 7(40):eabi8605, 2021.

[28] Zongyi Li, Hongkai Zheng, Nikola Kovachki, David Jin, Haoxuan Chen, Burigede Liu, Kamyar Azizzadenesheli, and Anima Anandkumar. Physics-informed neural operator for learning partial differential equations. ACM Transactions on Machine Learning Research, 3(1):1–27, 2024.

[29] Sifan Wang, Hanwen Wang, and Paris Perdikaris. On the eigenvector bias of fourier feature networks: From regression to solving multi-scale pdes with physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 384:113938, 2021.

**本页范围与校对状态：** 本页为 arXiv:2609.14926v1 的全文中文译稿，覆盖摘要、正文第 1–6 节（含 2.1/2.2 与 3.1–3.4 的全部小节）、结论、致谢、附录 6.1（表 3–16 逐格）以及正文表 1、表 2（逐格）、图 1–20 图注与参考文献 [1]–[29]。公式编号沿用原文 (1)–(37)；附录表的指数采用上标写法（如 10⁻⁴），与原文排版一致。表 1、2、3–16 已用 PDF 第 11、16、25、26、27、28、29 页渲染图逐格核对（含指数位置）；图内曲线未做数字化估算。**原文疑点：** ① 原文式 (4)、(5) 后写作 "Egs. (4) and (5)"，为 "Eqs." 的笔误；② 表 16 题注中的交叉引用显示为 "??"，属原文遗留占位，译文照录并在此说明；③ 表 12 中 $N_m=5$ 行 lPINN 的 $\mathrm{rRMSE}_\theta$（0.501447）显著大于 PINN（0.434149），与正文"lPINN 误差更小"的一般表述不一致，属原文数据本身的例外，照录。**逐句逐式对照原 PDF 的终校未做。** 另：骨架"版本"行原为 2026-09-27（收录日），已按 BRIEF2 结构改为 arXiv:2609.14926v1（2026-09-14，依据 PDF 页眉 "arXiv:2609.14926v1 [math.AP] 14 Sep 2026"）；作者为 Wenhao Chen、Alexandre Tartakovsky；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
