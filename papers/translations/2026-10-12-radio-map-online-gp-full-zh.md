---
layout: page
title: "基于记忆式在线高斯过程的流式频谱测量无线电地图更新——全文中译"
permalink: /papers/translations/2026-10-12-radio-map-online-gp-full-zh/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文条目](/papers/items/ad7c6f680aefcbc8/) · [官方论文 PDF](https://arxiv.org/pdf/2607.17954v1)

# 基于记忆式在线高斯过程的流式频谱测量无线电地图更新

**原题：** Radio Map Updating from Streaming Spectrum Measurements via Memory-Based Online Gaussian Processes  
**作者：** Yuanyuan Deng、Bo Zhou、Tian Chen、Shijian Gao、Jia Yan、Lantu Guo、Qiuming Zhu、Qihui Wu  
**来源：** arXiv:2607.17954v1，2026 年 7 月，14 页。

> 本页依原文章节顺序翻译正文、算法、实验结果、图题与附录推导说明。原文部分数学公式较长，采用适合轻量 Markdown 的纯文本数学记号；复杂矩阵排版可点击对应的官方 PDF 页面逐项核验。参考文献保留英文正式书目信息以方便检索。

## 摘要（Abstract）

无线电地图根据频谱测量估计射频特性的空间分布，是频谱管理和网络规划等应用的重要基础。随着频谱测量不断到来，传统批处理无线电地图重构方法的计算开销会难以承受，因为每次更新无线电地图都需要重新处理所有已积累测量。对此，本文提出基于记忆的在线稀疏变分高斯过程（Memory-Based Online Sparse Variational Gaussian Process，M-OSVGP）方法，高效利用流式频谱测量更新无线电地图。方法采用稀疏变分推断，通过最小化融合新到测量和少量历史测量记忆子集的混合目标，在线更新后验，以减轻灾难性遗忘。为进一步提高测量逐渐覆盖不同空间区域时的后验近似精度，本文提出网格辅助在线诱导点选择（Grid-Assisted Online Inducing Point Selection，GOIPS）算法来扩展 M-OSVGP。GOIPS 根据测量密度和空间相关性动态调整诱导点的数量和位置，在保持计算效率的同时选出信息量更高的诱导点集合。多种场景下的大量仿真表明，相较现有批处理及在线基线，提出的方法在重构精度、计算效率和不确定性量化方面具有优势。

**索引词：** 无线电地图、在线高斯过程、稀疏近似、变分推断、诱导点选择。

## I. 引言（Introduction）

无线电地图用空间表示描述一定地理范围内射频频谱的特征，刻画频谱活动与传播信道的信息 [2]、[3]。它广泛用于无线频谱分配 [4]、网络资源管理 [5]–[7]、异常检测与识别 [8]、[9] 及辐射源定位 [10]–[12]。构建无线电地图需要利用空间分布的传感器所采集的频谱测量估计目标区域中的信号分布。实际部署时，频谱测量往往以连续批次发送到监测中心，例如新的传感器被部署到先前未监测的区域，或传感器被重新安置。为了准确反映频谱环境，需要高效处理这些流式测量，并随时间持续更新无线电地图。

现有无线电地图构建方法大体分为模型驱动和数据驱动两类。模型驱动方法利用发射源或传播模型的先验，如经验路径损耗模型 [13]、主导路径模型 [14]、射线追踪模型 [15]，推断频谱分布。这些方法要求详细环境建模和大量射线路径级计算，成本较高；当所假定模型与真实环境不一致时，精度还可能明显下降。数据驱动方法不依赖详细环境或辐射源信息，而是通过测量信号的统计特征进行插值，包括插值法 [16]–[18]、高斯过程（GP）[19]、矩阵补全 [20] 及张量补全 [21]、[22]，能够适应更多场景。

例如，插值方法把待估位置的接收信号强度（RSS）表示为邻近测量的加权和；K 近邻（KNN）[16]、反距离加权（IDW）[17] 和 Kriging [18] 使用不同权重规则。矩阵及张量补全方法把问题表示为缺失数据恢复，利用频谱测量矩阵的低秩结构估计未测值。近年来深度学习也被用于无线电地图重构 [23]–[27]，因为它能够学习测量数据中的复杂非线性空间关系，捕获多径和阴影效应。不过，这类方法通常需要难以获得的大规模标注数据；其黑箱特征也增加了在真实无线系统中的部署难度。

多数现有无线电地图构建采用批处理：每收到一批新频谱测量，就重新处理所有既有数据，从头构建地图。这造成较高的计算开销和较差的可扩展性，不适用于连续测量流。研究者因此开始研究在线方法。例如 [28] 利用众包 RSS 构建在线无线电地图，以改善存在位置标签噪声的 Wi-Fi 指纹定位；[29] 使用固定的预训练 GAN 生成器，根据主动收集的众包数据生成信号地图；[30] 为蜂窝覆盖图提出利用用户轨迹信息的两种核在线算法，让靠近目标轨迹的测量获得更大权重；[31] 则用双核在线方法分别表示信道损耗的直流分量和变化分量。然而，[29] 不利用新测量调整 GAN 生成器，而 [30]、[31] 需要用户轨迹或预设信道损耗分解等专门先验，这些信息并非在所有场景中可得。因此，如何在不依赖严格先验假设的情况下利用测量流高效、自适应地更新无线电地图，仍然是关键挑战。

本文为此提出 M-OSVGP。基于稀疏变分推断，方法先从频谱测量中随机选择部分点作为诱导点，再通过梯度下降细化其位置。在线更新时，使用混合目标将当前测量与代表性历史记忆子集结合，以减轻灾难性遗忘并维持推断精度。由于稀疏变分后验的质量受到诱导点选取的直接影响，本文进一步提出 GOIPS，根据流式测量的空间覆盖与相关性增删诱导点，并交由变分优化继续细化，从而提高精度及效率。

**本文贡献包括：** （1）设计将在线稀疏变分 GP 与历史测量记忆结合的混合目标，在吸收新数据的同时保留既有信息；（2）提出 GOIPS，依据空间相关性和测量密度自适应调整诱导点数量和位置，既改善后验近似，也降低计算成本；（3）通过多场景仿真与现有在线、批处理基线比较，并证明 GOIPS 还可独立接入其他基于诱导点的 GP 方法。

后续安排为：第 II 节介绍系统模型，第 III 节介绍批处理 GP 重构，第 IV 节提出 M-OSVGP 和 GOIPS，第 V 节给出仿真与分析，第 VI 节总结。

**图 1：在线无线电地图更新示意（原文第 2 页）。** 新传感器带来不同空间位置的新测量，监测中心随批次到达持续更新地图。[查看图 1](https://arxiv.org/pdf/2607.17954v1#page=2)

**资助及作者信息：** 研究获中国国家自然科学基金项目 62231015、62571237 支持；初步版本在 2025 年 8–9 月土耳其伊斯坦布尔举行的 IEEE 机器学习用于信号处理国际研讨会发表 [1]。Yuanyuan Deng、Bo Zhou、Tian Chen、Qiuming Zhu、Qihui Wu 来自南京航空航天大学电子信息工程学院；Shijian Gao、Jia Yan 分别来自香港科技大学（广州）物联网学域和智能交通学域；Lantu Guo 来自中国电波传播研究所。

## II. 系统模型（System Model）

考虑二维地理目标区域 X⊂R² 内的无线覆盖场景。分布式传感器持续将 RSS 测量及对应位置报告给监测中心。将 X 均匀划分为 H×W 的矩形网格 G；每积累一批指定数量的新测量，监测中心就更新一次无线电地图。

记第 n 批数据为 D_n={X_n, ψ_n}，其中 X_n=[x_(n,1),…,x_(n,N_n)]、ψ_n=[ψ_(n,1),…,ψ_(n,N_n)]；N_n 是批次样本数，ψ_(n,i) 是位置 x_(n,i) 的 RSS。到第 n 批为止的全部数据记作 D_(1:n)=∪_(j=1)^n D_j={X_(1:n),ψ_(1:n)}。另外，以 X_n* 表示接收第 n 批数据后网格中尚未测量的位置集合，ψ_n* 表示待估计的 RSS 值。无线电地图重构正是要估计这些缺失位置的 RSS。

每个位置 x 上的测量可建模为：

> **式（1）：** ψ = f(x) + ε。

其中 f(x) 为真实 RSS，作为未知潜函数 f:R²→R；ε 为零均值、方差 σ_ψ² 的高斯测量噪声。采用高斯过程表示 f：

> **式（2）：** f∼GP(m(x), k(x,x′))。

其中 m(x) 是先验均值函数，k(x,x′) 是刻画两处 RSS 相似性的核函数；常见核包括径向基函数（RBF）、线性、多项式及 Matérn 核 [35]。

本文的目标是在每收到新批次 D_n 后更新潜函数估计 f̂_n，并预测 X_n* 处的 ψ_n*。批处理方法直接使用全部积累数据 D_(1:n) 估计 f̂_n；在线方法则在前一步 f̂_(n−1) 的基础上吸收新批次进行调整。下一节介绍批处理 GP 与 SVGP，第 IV 节讨论以流式稀疏 GP 为基础并增加记忆子集与动态诱导点管理的 M-OSVGP。

## III. 批处理条件下的 GP 无线电地图重构

本节介绍每次更新都重新处理全部积累测量的 GP 方法。标准 GP 提供精确空间预测，但成本较高；稀疏变分 GP（SVGP）[32] 则使用较少诱导点提高可扩展性。为简化记号，本节省略批次下标 n。

### A. 标准高斯过程重构

GP 在空间插值和函数估计方面具有良好性能，因此是无线电地图重构的基础工具 [35]、[36]。给定积累数据 D={X,ψ}，希望推断位置 X* 上的 RSS ψ*。GP 任意有限个函数值服从联合高斯分布，因此可将已测 RSS 与目标 RSS 的联合分布写为：

> **式（3）：** [ψ;ψ*] ∼ N([u;u*], [[K_ψψ+σ_ψ²I, K_ψψ*],[K_ψ*ψ,K_ψ*ψ*]])。

u 和 u* 是已测及待测位置的先验均值向量（通常取零或常数），I 为单位矩阵；K_ψψ 是 X 上的正定核协方差矩阵，其第 (p,q) 项为 k(x_p,x_q)；K_ψψ*、K_ψ*ψ 为交叉协方差，K_ψ*ψ* 为目标位置的协方差。根据多元高斯条件分布公式，可以得到：

> **式（4）：** p(ψ*|ψ,X,X*)=N(μ*_GP, Σ*_GP)。  
> **式（5）：** μ*_GP = u* + K_ψ*ψ(K_ψψ+σ_ψ²I)^(-1)(ψ−u)。  
> **式（6）：** Σ*_GP = K_ψ*ψ* − K_ψ*ψ(K_ψψ+σ_ψ²I)^(-1)K_ψψ*。

后验均值给出未测位置的 RSS 估计，协方差对角线量化各位置的不确定性。GP 是非参数模型，不事先限定 f 的具体函数表达式，而是通过核函数定义不同输入位置的函数值协方差。核的超参数决定空间平滑程度与幅度。例如 RBF 核为：k(x,x′)=σ_f² exp(−||x−x′||²/(2ℓ²))；信号方差 σ_f² 决定纵向幅度尺度，长度尺度 ℓ 控制相关性随距离减弱的速度。Matérn 核再引入光滑度参数 ν：

> **Matérn 核：** k_ν(x,x′)=σ_f²·2^(1−ν)/Γ(ν)·(√(2ν)||x−x′||/ℓ)^ν·K_ν(√(2ν)||x−x′||/ℓ)。

其中 K_ν 是修正贝塞尔函数，Γ 是 Gamma 函数；ν 越小，采样函数越粗糙，ν 越大则越光滑。

实际应用中，须根据测量估计核的超参数 θ（如 σ_f²、ℓ）和测量噪声方差 σ_ψ²，通常通过最大化测量的对数边缘似然实现。将潜函数值 f=f(X) 积分消去，得到：

> **式（7）：** p(ψ|θ)=∫p(ψ|f)p(f|θ)df=N(0,K_ψψ+σ_ψ²I)。  
> **式（8）：** log p(ψ|θ)=−N/2·log(2π) −(1/2)log|K_ψψ+σ_ψ²I| −(1/2)(ψ−μ)ᵀ(K_ψψ+σ_ψ²I)^(-1)(ψ−μ)。

标准 GP 必须对包含到第 n 批全部 RSS 测量的协方差矩阵求逆。批处理复杂度约为 O((Σ_(j=1)^n N_j)^3)，积累数据较多时可能无法承受。

### B. 稀疏变分 GP 重构

为降低标准 GP 的成本，采用 SVGP 框架 [32]：用少量诱导点对全部测量进行概括，再使用变分近似实现可扩展推断。给定 D={X,ψ}，引入 M 个诱导点，M 远小于累计测量数量。诱导位置记为 Z=[z₁,…,z_M]，其对应的潜函数值 u=f(Z)。将潜函数值划分为 u 与其余分量 f_≠u，使用以下变分分布近似精确后验：q(f)=q(u)p(f_≠u|u,θ)，其中 q(u)=N(m_u,S_u)；θ 表示核超参数。

通过最大化对数边缘似然的证据下界（Evidence Lower Bound，ELBO）优化变分参数 m_u、S_u、诱导位置 Z 及核参数 θ。根据 Jensen 不等式：

> **式（9）：** log p(ψ|θ)=log ∫p(ψ,f|θ)df ≥∫q(f) log[p(ψ,f|θ)/q(f)]df ≜ L_batch。

由于 L_batch=log p(ψ|θ)−KL[q(f)||p(f|ψ,θ)]，最大化 ELBO 等价于最小化变分分布与真实后验的 KL 散度。将 q(f)=q(u)p(f_≠u|u,θ) 代入，可将其写为：

> **式（10）：** L_batch = Σ_(ψ_i∈ψ) E_(q_u(f_i))[log p(ψ_i|f_i)] − KL[q(u)||p(u|θ)]。

其中 f_i=f(x_i)，q_u(f_i)=∫p(f_i|u,θ)q(u)du。用最优变分参数预测 X* 上未测 RSS，可得到：

> **式（11）：** p(ψ*|ψ)≈q(ψ*)=N(μ*_SVGP,Σ*_SVGP)。  
> **式（12）：** μ*_SVGP=K_ψ*u K_uu^(-1)m_u。  
> **式（13）：** Σ*_SVGP=K_ψ*ψ*−K_ψ*u K_uu^(-1)(K_uu−S_u)K_uu^(-1)K_uψ*。

主要计算涉及累计测量与 M 个诱导点间的协方差，SVGP 的计算复杂度为 O((Σ_(j=1)^n N_j)M²)，相比标准 GP 的立方复杂度更易扩展；但每次新数据到来后仍需重新处理所有历史测量。

## IV. 所提出的在线无线电地图更新方法

SVGP 虽降低了计算复杂度，却仍须每次用全部累计数据从头更新后验。为解决这一问题，本文借鉴流式稀疏变分 GP（SSVGP）[33]，采用增量后验更新，并设计记忆式 M-OSVGP 以减少灾难性遗忘，随后使用 GOIPS 根据流式测量的空间分布管理诱导点。

### A. 在线稀疏变分 GP

**核心思想：** 新批次到来时，利用诱导点定义能够概括历史测量的变分近似，并通过在线变分推断得到的混合目标来更新变分参数，而不必重新处理全部旧数据。

**1）通过在线变分推断增量更新后验。** 在收到第 n 批 ψ_n 后，希望高效估计潜函数后验 p(f|ψ_(1:n))。利用贝叶斯法则：

> **式（14）：** p(f|ψ_(1:n))=p(f|θ_n)p(ψ_(1:n−1)|f)p(ψ_n|f)/Z₁(θ_n)。

Z₁(θ_n)=p(ψ_(1:n)|θ_n)，θ_n 是当前批次的 GP 超参数。引入新诱导变量 u_n=f(Z_n)，其中 Z_n 在收到 D_n 后基于旧诱导点集合及新批次位置初始化，再经变分优化细化。令 qⁿ(f)=p(f_≠u_n|u_n,θ_n)qⁿ(u_n)，qⁿ(u_n)=N(m_(u_n),S_(u_n))。理想目标是最小化 KL[qⁿ(f)||p(f|ψ_(1:n))]。

旧变分近似 qⁿ⁻¹(f) 可作为旧后验 p(f|ψ_(1:n−1)) 的近似：

> **式（15）：** qⁿ⁻¹(f)≈p(f|ψ_(1:n−1))=p(f|θ_(n−1))p(ψ_(1:n−1)|f)/Z₂(θ_(n−1))。

由此可把历史测量对应的似然因子替换为旧后验与旧 GP 先验之比，再带回式（14）得到式（16）的近似后验。通过计算 KL 散度并舍去与优化无关的归一化常数，推导出式（17）的在线目标，最终得到式（18）的在线 ELBO 表示。在原文记号约定下，式（18）右边由四项构成：

> **式（18），按原文符号整理：** L_online = KL[qⁿ(u_n)||p(u_n|θ_n)] − Σ_(ψ_i∈ψ_n)E_(q_(u_n)(f_i))[log p(ψ_i|f_i)] + KL[qⁿ(u_(n−1))||qⁿ⁻¹(u_(n−1))] − KL[qⁿ(u_(n−1))||p(u_(n−1)|θ_(n−1))]。

前两项与当前批次的标准变分目标对应；后两项则引入旧后验近似包含的信息，清晰地区分了新数据与历史知识的贡献。详细推导见附录 A。[核对原始式（14）–（18）](https://arxiv.org/pdf/2607.17954v1#page=5)

**2）利用记忆子集构建混合目标。** 式（18）的有效性依赖旧近似 qⁿ⁻¹(u_(n−1)) 的准确度，但多次近似在线更新可能积累误差并导致灾难性遗忘。因此作者从旧数据 D_(1:n−1) 中保留大小为 N_M 的代表性记忆子集 M={X_M,ψ_M}，用新数据 D_n 与记忆 M 的并集构造伪批次，并得到类似式（10）的辅助 ELBO，即原文式（19）。将在线目标与历史记忆似然结合，构建包含两个权重 μ₁、μ₂ 的**混合目标**：

> **式（20）的结构：** L_hybrid = 当前批次变分拟合项 + μ₁ × 旧后验知识保持项 + μ₂ × 记忆子集的负对数似然项。

原文将 L_hybrid 作为需要最小化的目标，并给出精确的 KL 与积分表示。这里 μ₁ 决定历史后验约束的重要程度，μ₂ 决定记忆样本的贡献。对这个目标进行变分求解，得到最优诱导点后验 q_optⁿ(u_n) 的指数形式（式 21），其要点是：以当前 GP 先验为基础，乘上由新批次似然、历史后验比和记忆子集似然共同形成的指数倾斜项。

在高斯观测假设下，式（21）还可改写为含伪观测向量 ψ̂、协方差矩阵 Σ_ψ̂ 的高斯形式：

> **式（22）：** q_optⁿ(u_n) ∝ p(u_n)·N(ψ̂; K_f̂u K_uu^(-1)u_n, Σ_ψ̂)，并且 q_optⁿ(u_n)=N(m_(u_n),S_(u_n))。

伪观测 ψ̂ 包括新批次测量、记忆测量以及由旧后验构造的历史信息；式（23）定义其块协方差。将 q_optⁿ 代入混合目标后，得到式（24）的优化形式，含高斯对数似然与迹、行列式修正项 Δ₁、Δ₂、Δ₃。数值实现中同时优化诱导位置 Z_n 和核超参数 θ_n，先保留一部分旧诱导位置，再从新测量中选择其他位置，最后通过梯度下降细化。

更新后由 qⁿ(f) 估计未测 RSS 的均值和方差：

> **式（25）：** μ*_n=K_ψ*u_n K_(u_nu_n)^(-1)m_(u_n)。  
> **式（26）：** Σ*_n=K_ψ*ψ*−K_ψ*u_n K_(u_nu_n)^(-1)(K_(u_nu_n)−S_(u_n))K_(u_nu_n)^(-1)K_u_nψ*。

这种更新每次只处理新数据与有限历史记忆，计算复杂度为 O((N_n+N_M)M²)，不会随已处理批次数增长。为减小协方差求逆与对数行列式计算的不稳定性，附录 C、D 进一步给出采用 Cholesky 分解、Woodbury 恒等式等的稳定实现形式。[核对原始式（19）–（26）与块矩阵定义](https://arxiv.org/pdf/2607.17954v1#page=6)

### B. 网格辅助在线诱导点选择（GOIPS）

在原始 M-OSVGP 中，诱导点先随机选取，再通过梯度优化调整。这有两个问题。第一，随机初始化忽视新测量的空间位置；当新测量远离现有诱导点时，梯度优化可能收敛缓慢甚至陷入较差局部解。第二，随机选点可能带来相互距离很近的冗余诱导点，使有限点预算无法被高效利用。

GOIPS 用具有空间意识的网格化初始化代替随机选点。每一新批次中，算法增加能够覆盖未被代表区域的诱导点，并移除高度冗余的点以控制规模。算法依据再生核希尔伯特空间（RKHS）[37] 中的核相似性选择靠近实际测量、同时又具有足够多样性的代表点，在空间覆盖、计算成本和后验近似质量之间达到较好折中。

**1）增加诱导点。** 首先把目标区域划分为均匀网格。每收到位置 x_(n,i)，查找它所在网格。如果该网格没有诱导点，立即将其加入 Z_n，以覆盖此前没有代表点的区域。否则，计算新位置与当前诱导点的最大核相似度 d=max_(z∈Z_n)k(x_(n,i),z)，只有当 d 小于当前网格的自适应阈值 ρ_g 时才添加。阈值由该网格诱导点密度控制：密集网格使用更低阈值以减少冗余，稀疏网格则用更高阈值保留更多代表性点。

**2）动态维护诱导点。** 当诱导点数量超过预设最大值 M_max 时，根据核相关性移除冗余点。对于每个诱导点 z_i，统计其与其他诱导点的核相似度超过阈值 ρ 的数量 C_i；C_i>1 的点成为候选删除点。删除时采用概率方案，重叠数量越高，删除概率越大，使冗余最多的点优先被去除。重复操作，直到没有符合条件的冗余点，或诱导点数量下降到最低阈值 M_min。

**算法 1：网格辅助在线诱导点选择（按原步骤译出）。**

1. 输入新测量位置 X_n、上次诱导点 Z_(n−1)、核函数 k、基础阈值 ρ、最大和最小诱导点数量 M_max 与 M_min。
2. 初始化 Z_n←Z_(n−1)。定义 g(x) 为位置所属的网格编号，G_Z 为当前有诱导点覆盖的网格集合。
3. 对每个新测量 x∈X_n：如 g(x)∉G_Z，则加入 Z_n 并将 g(x) 加入 G_Z；否则，计算网格诱导点数量 M_(g(x))，置 ρ_g=ρ/M_(g(x))，并计算 d=max_(z∈Z_n)k(x,z)；若 d<ρ_g 则加入 x。
4. 若 |Z_n|>M_max，则在 |Z_n|>M_min 的条件下循环：计算核相关矩阵；对每个诱导点统计 C_i=Σ_(j≠i)1[K_ij>ρ]；建立候选删除集合 {z_i:C_i>1}；如果该集合非空，以概率与 C_i 成正比的方式选择并删除一个点。
5. 输出更新后的 Z_n。该集合是下一阶段变分优化的初始化，而不是最终固定的诱导位置。

GOIPS 天然适用于流式数据，因为每个新测量只需处理一次。添加诱导点时所需的核相似度 K_(x,Z) 在变分 GP 更新中通常已计算，因此额外开销较小。删除步骤将数量保持在 [M_min,M_max] 范围内，控制计算成本。网格划分及密度自适应又体现了无线电地图的地理特征，提高诱导点分配效率及空间代表性。[核对算法 1 原表](https://arxiv.org/pdf/2607.17954v1#page=8)

## V. 仿真结果与分析（Simulation Results and Analysis）

### A. 仿真设置

作者借助无线网络规划软件 WinProp [38]，采用主导路径模型生成两种场景的真实 RSS 地图（图 2）：Campus 场景对应中国南京航空航天大学江宁校区，Urban 场景对应意大利米兰高密度城市区域。通过从真实地图随机采样获得测量，并将数据分为连续 10 批：首批 N₁=600，之后每批 N_j=200（j=2,…,10）。

**图 2：校区、城市仿真场景与相应真实无线电地图（原文第 8 页）。** 子图 (a)、(c) 的红色五角星标注发射源位置。[查看图 2](https://arxiv.org/pdf/2607.17954v1#page=8)

**表 I：仿真参数。**

| 参数 | 数值 |
|---|---|
| 目标区域大小 | 512 m×512 m |
| 网格尺寸 | 2 m |
| 发射源数量 | 5 |
| 发射源工作频率 | 3.5 GHz |
| 单个发射源最大发射功率 | 23 dBm |
| 传感器高度 | 1.5 m |
| 发射天线高度 | 40 m |

比较方法包括 KNN、IDW、SVGP [32]、SSVGP [33] 和 Memory-DGP [34]。KNN、IDW 与 SVGP 是批处理方法：新批次到来后重新处理全部数据。SSVGP 与 Memory-DGP 是在线方法，只根据新批次增量更新，后者采用带历史记忆的双稀疏变分 GP。后三者为 GP 方法，KNN、IDW 则是启发式插值。

评价维度包括重构精度、不确定性与计算开销。重构误差采用 RMSE=√[(1/N)Σ_(i=1)^N||ψ(x_i)−ψ̃(x_i)||²]，其中 ψ 为真实 RSS，ψ̃ 为估计 RSS，N 为未测位置总数。不确定性采用负对数预测密度（NLPD）=(1/N)Σ_i[−log p(ψ(x_i)|ψ̃(x_i))]；NLPD 越低表示不确定性校准越好、置信估计越可靠。计算开销采用累计运行时间 T_n，即从第 1 批到第 n 批，训练并估计未测位置 RSS 所需的总时间。

GP 方法统一采用三个不同光滑度 Matérn 核的加性组合：Matérn 1/2、3/2、5/2 [35]。稀疏变分方法使用 M=300 个诱导点。M-OSVGP 设 μ₁=μ₂=1、记忆子集 N_M=500，从历史测量随机抽取；诱导点初始化时保留前次点的 70%，其余 30% 从新测量随机选取。M-OSVGP-GOIPS 使用 25 m×25 m 网格、接受阈值 ρ=0.9，M_max=350、M_min=250。仿真在配备 32 GB 内存的 Intel Xeon Platinum 8352V CPU 上运行，报告 30 次独立试验的平均结果。

### B. 性能比较

图 3 比较两种场景下各方法的 RMSE、累计运行时间和 NLPD。总体而言，所提方法在基线中达到最低重构误差，在 GP 方法中兼顾计算效率，并提供可靠的不确定性估计。

在**重构精度**方面，M-OSVGP 和 M-OSVGP-GOIPS 在两个场景下持续取得较低 RMSE。校园场景下，相对于 SVGP、SSVGP 和 Memory-DGP，M-OSVGP 的最大 RMSE 降幅分别为 4.9%、4.3% 和 25.6%；城市环境下对应降幅分别为 3.1%、2.7% 和 11.2%。GOIPS 进一步提高精度，M-OSVGP-GOIPS 相比 M-OSVGP 额外最多降低 1.8% 的 RMSE。

在**计算效率**方面，所提出的在线方法明显快于其他 GP 方法。校园场景中，M-OSVGP 相对 SVGP、SSVGP 和 Memory-DGP 的运行时间最多分别减少 71.3%、36.1% 和 68.3%；城市场景对应最大降幅为 58.2%、33.5% 和 68.1%。GOIPS 在提升精度的同时，也比原始 M-OSVGP 更省计算时间。KNN、IDW 虽然更快，但重构精度较低，且不能给出有原则的不确定性估计，因此不参加后续不确定性比较。

在**不确定性**方面，M-OSVGP 相比在线 SSVGP、Memory-DGP 取得较低 NLPD。批处理 SVGP 利用全部积累测量，因此 NLPD 稳定下降；本文使用记忆混合目标的在线方法则能在保留在线效率的同时逼近批处理方法的校准表现。GOIPS 通过具有空间意识的诱导点选择，更好地捕获空间变化，从而进一步改善不确定性估计。

图 4 展示了城市场景接收第 5 批测量后的重构地图。相对于基线，所提两种方法重构结果更接近真实无线电地图，能捕获更细的空间变化，并在测量稀疏区域给出更平滑的插值。

**图 3：校园及城市两种场景中，各方法 RMSE、累计运行时间与 NLPD 的比较（原文第 9 页）。** [查看图 3](https://arxiv.org/pdf/2607.17954v1#page=9)  
**图 4：城市环境中处理第 5 批测量后的真实地图、测量分布，以及 IDW、KNN、SVGP、SSVGP、Memory-DGP、M-OSVGP、M-OSVGP-GOIPS 等方法的重构对照（原文第 10 页）。** [查看图 4](https://arxiv.org/pdf/2607.17954v1#page=10)

### C. 关键参数影响

本节在城市环境分析 M-OSVGP 的重要超参数；校园环境及 M-OSVGP-GOIPS 呈现类似结果，因此未展示。图 5 在第 2、6、10 批后比较混合目标中不同 μ₁、μ₂ 对 RMSE 的影响。固定 μ₁ 时，RMSE 随 μ₂ 往往呈 U 形变化。μ₂ 太小使模型过度依赖最新批次，更新不稳定；μ₂ 太大使模型保守，难以充分适应新测量。μ₁ 控制历史后验近似的影响；太小可能使更新不连续、破坏空间连贯性，太大则会过度保守，无法充分使用新空间信息。

合适的 μ₁、μ₂ 会随处理批次数变化。在早期（例如第 2 批），测量数量有限、不确定性较大，相对较大权重有利于稳定；随着数据积累，模型获得更可信的空间表征，适中权重更好，例如第 6 批 μ₁=1、μ₂=2，第 10 批 μ₁=1、μ₂=1。这体现了从依赖历史知识以确保稳定，向增强对新数据的适应性过渡的过程。

图 6 分别研究记忆子集大小 N_M 以及 GOIPS 网格大小。学习早期（第 2–4 批），适中的记忆大小（例如 400）效果较好，因为它提供足够空间多样性而不会压倒有限的当前测量。到第 6–10 批，更大的记忆空间越来越有利，N_M=500 优于较小设置。较大记忆保留更多空间多样的旧测量，从而在引入新信息的同时防止遗忘。网格大小的影响在前期不显著；随着知识积累，中间尺度网格（约 20 m）表现较好。较粗网格（30–35 m）不足以刻画精细地理异质性，而过细的 15 m 网格造成过度空间碎片化，不利于核函数捕获传播中的平滑相关结构。

**图 5：第 2、6、10 批数据后，不同 μ₁、μ₂ 对 M-OSVGP RMSE 的影响（原文第 11 页）。** [查看图 5](https://arxiv.org/pdf/2607.17954v1#page=11)  
**图 6：不同记忆规模及网格尺寸下 M-OSVGP 的 RMSE（原文第 11 页）。** [查看图 6](https://arxiv.org/pdf/2607.17954v1#page=11)

### D. GOIPS 的有效性

作者比较不同诱导点初始化策略下三种 M-OSVGP 变体的 RMSE 与累计运行时间（图 7）。第一种使用原始随机初始化；第二种用 GOIPS 代替随机初始化；第三种是 M-OSVGP-OIPS，采用文献 [37] 的在线诱导点选择（OIPS）算法，仅基于核相似度阈值逐个添加诱导点。结果表明，GOIPS 在整个更新过程中取得最低 RMSE，并且累计运行时间明显低于其他两种方法。原因在于它能根据当前测量模式和空间分布自适应调整诱导点规模及位置，从而更好权衡计算开销与近似精度。

为检验 GOIPS 的通用性，作者将其作为独立模块接入批处理 SVGP 和在线 SSVGP，对比重构误差及累计时间。图 8 表明 SVGP 引入 GOIPS 后可明显节约计算时间，同时基本保留原有精度；图 9 表明 SSVGP 在接入 GOIPS 后，不仅计算效率提高，重构精度也得到明显改善。这说明 GOIPS 可作为不同稀疏 GP 框架的插件，以较低成本获得高质量、具有代表性的诱导点。

**图 7：城市场景下三种 M-OSVGP 诱导点初始化策略的 RMSE 与累计时间（原文第 11 页）。** [查看图 7](https://arxiv.org/pdf/2607.17954v1#page=11)  
**图 8：城市场景下 SVGP 接入 GOIPS 前后的 RMSE 与累计时间（原文第 12 页）。** [查看图 8](https://arxiv.org/pdf/2607.17954v1#page=12)  
**图 9：城市场景下 SSVGP 接入 GOIPS 前后的 RMSE 与累计时间（原文第 12 页）。** [查看图 9](https://arxiv.org/pdf/2607.17954v1#page=12)

## VI. 结论（Conclusion）

本文提出 M-OSVGP 框架，以自适应、高效的方式从流式频谱测量重构无线电地图。通过混合目标与代表性历史记忆子集，方法在维持恒定单次更新计算复杂度的同时逐步吸收新测量，并减轻灾难性遗忘。为进一步提高后验近似精度，提出 GOIPS，根据测量的空间分布与相关性动态调整诱导点的位置和数量。仿真表明，相比现有批处理和在线基线，M-OSVGP 与 M-OSVGP-GOIPS 在重构精度和计算效率上均具有优势。此外，GOIPS 不仅比其他点选择策略获得较低 RMSE 和运行时间，还可作为独立模块改善标准 SVGP 和 SSVGP。

## 附录（Appendix）

### A. 在线 ELBO 式（18）的推导

利用变分分布的因子分解形式与贝叶斯定理，可将先验与变分分布之比分别简化为只含诱导变量的形式。具体而言：

> p(f|θ_(n−1))/qⁿ⁻¹(f) = p(u_(n−1)|θ_(n−1))/qⁿ⁻¹(u_(n−1))；  
> qⁿ(f)/p(f|θ_n) = qⁿ(u_n)/p(u_n|θ_n)。

把这两个恒等式代入在线目标中含旧后验的最后一项，并对其他条件潜变量积分，可以得到式（27）的在线 ELBO 积分形式：

> **式（27），等价表述：** L_online = ∫qⁿ(f)log{ qⁿ(f)p(u_(n−1)|θ_(n−1)) / [p(f|θ_n)p(ψ_n|f)qⁿ⁻¹(u_(n−1))] }df。

将含当前诱导变量的部分写为 KL[qⁿ(u_n)||p(u_n|θ_n)]，将新测量似然拆为逐样本期望，并将其余部分整理为旧诱导变量上的两个 KL 散度，得到：

> **式（28）：** L_online = KL[qⁿ(u_n)||p(u_n|θ_n)] − Σ_(ψ_i∈ψ_n) E_(q_(u_n)(f_i))[log p(ψ_i|f_i)] + KL[qⁿ(u_(n−1))||qⁿ⁻¹(u_(n−1))] − KL[qⁿ(u_(n−1))||p(u_(n−1)|θ_(n−1))]。

因此得到了正文式（18）。[查看附录 A 原式](https://arxiv.org/pdf/2607.17954v1#page=13)

### B. 最优分布 q_optⁿ(u_n) 式（21）的推导

首先将混合目标 L_hybrid 写为包含四项积分的形式（原文式 29）：当前诱导变量变分分布相对于先验的对数比、新数据负对数似然、权重为 μ₁ 的旧后验与旧先验对数比，以及权重为 μ₂ 的记忆测量负对数似然。具体可写为：

> **式（29）：** L_hybrid = ∫qⁿ(f)log[qⁿ(u_n)/p(u_n|θ_n)]df −∫qⁿ(f)log p(ψ_n|f)df + μ₁∫qⁿ(f)log[p(u_(n−1)|θ_(n−1))/qⁿ⁻¹(u_(n−1))]df − μ₂∫qⁿ(f)log p(ψ_M|f)df。

对 qⁿ(u_n) 求变分导数，并引入保证分布归一化的拉格朗日项 λ，令导数等于零，得到式（30）的驻点方程。解该方程得到：

> **式（31）：** q_optⁿ(u_n)=C^(−1) p(u_n|θ_n)·exp{ ∫p(f|u_n)log p(ψ_n|f)df + μ₁∫p(u_(n−1)|u_n)log[qⁿ⁻¹(u_(n−1))/p(u_(n−1)|θ_(n−1))]du_(n−1) + μ₂∫p(f_M|u_n)log p(ψ_M|f_M)df_M }。

其中 C 是归一化常数，log C=λ+1；原文在部分位置省略 p(u_n|θ_n) 的超参数下标以简化记号。旧变分后验和旧先验分别为 qⁿ⁻¹(u_(n−1))=N(m_(u_(n−1)),S_(u_(n−1)))、p(u_(n−1)|θ_(n−1))=N(0,K_(u_(n−1)u_(n−1)))。

为了整理各项，高斯条件分布引入剩余协方差 Q_f=K_ff−K_fu K_uu^(-1)K_uf，Q_fM=K_fMfM−K_fMu K_uu^(-1)K_ufM，以及旧诱导点条件协方差 Q_(u_(n−1))=K_(u_(n−1)u_(n−1))−K_(u_(n−1)u_n)K_(u_nu_n)^(-1)K_(u_nu_(n−1))。原文式（32）–（34）将式（31）指数中的新批次、旧后验及记忆三项分别记为 E₁、E₂、E₃，并利用高斯二次型期望将其化为高斯对数密度及修正项 Δ₁、Δ₂、Δ₃。

最后将 E₁、E₂、E₃ 代入式（31），即可得到正文式（21）所给的最优变分后验。[查看附录 B 式（29）–（34）](https://arxiv.org/pdf/2607.17954v1#page=13)

### C. 混合目标 L_hybrid 的数值实现

由式（31）出发，对最优分布取对数并重新整理，将其代入式（29）的混合目标，可得 L_hybrid(q_optⁿ(u_n))=−log C。因此只需计算归一化常数的对数，即可实现最优混合目标。对式（31）两端积分再取对数，得到式（35）：由伪观测 ψ̂ 的高斯对数密度、历史及记忆修正项 Δ₁、Δ₂、Δ₃ 和若干常数组成。

令 S_ψ=K_f̂u K_uu^(-1)K_uf̂ + Σ_ψ̂，则该目标的第一项为：

> **式（36）：** L_hybrid,1=log N(ψ̂;0,S_ψ)=−(N_n+N_M+M)/2·log(2π)−(1/2)log|S_ψ|−(1/2)ψ̂ᵀ S_ψ^(-1)ψ̂。

S_ψ 的维数是 N_n+N_M+M，直接求逆及求行列式既昂贵又可能数值不稳定。作者因此利用矩阵行列式引理，将行列式转化为小矩阵表达，并对诱导点协方差进行 Cholesky 分解：K_uu^(-1)=L_u^(−T)L_u^(−1)。记 D=I+L_u^(−1)K_uf̂ Σ_ψ̂^(-1)K_f̂u L_u^(−T)，可以得到原文式（37）：

> **式（37）：** log|S_ψ|=(N_n+N_M)log σ_ψ² + log|D_(u_(n−1))| + log|D|；其等价分解还保留了伪观测协方差的分块常数。

再利用 Woodbury 矩阵恒等式可求 S_ψ 的逆：

> **式（38）：** S_ψ^(-1)=Σ_ψ̂^(-1)−Σ_ψ̂^(-1)K_f̂u L_u^(−T)D^(-1)L_u^(−1)K_uf̂ Σ_ψ̂^(-1)。

将式（37）和式（38）代入式（35），得到式（39）的稳定目标，其中仍含迹运算 tr(Q_f)、tr(Q_fM)、历史后验参数及小规模系统的二次型。原文定义辅助向量 c，以避免直接对大维数协方差矩阵进行操作。由此可以采用一系列规模更小的矩阵计算混合目标，改善数值稳定性。[查看附录 C 原式（35）–（39）](https://arxiv.org/pdf/2607.17954v1#page=14)

### D. 未测位置 RSS 值的估计

正文式（22）的最优后验参数 m_(u_n)、S_(u_n) 可用于式（25）、（26）的预测，但直接计算包含新数据和记忆伪观测的大矩阵逆，开销和数值风险较高。为此作者将 q_optⁿ(u_n) 写成自然参数形式（式 40），然后借助 Woodbury 恒等式得到对应的精度矩阵及自然均值参数：

> **式（40）的要点：** S_(u_n)^(-1) = K_uu^(-1)+K_uu^(-1)K_uf̂ Σ_ψ̂^(-1)K_f̂u K_uu^(-1)，以及 S_(u_n)^(-1)m_(u_n)=K_uu^(-1)K_uf̂ Σ_ψ̂^(-1)ψ̂。

这样可把未测位置上的 RSS 预测均值化为通过小矩阵 D 求逆得到的形式：

> **式（41）：** μ*_n=K_ψ*u L_u^(−T)D^(-1)L_u^(−1)K_uf̂ Σ_ψ̂^(-1)ψ̂。

预测协方差同样可表示为避免大矩阵求逆的形式：

> **式（42）：** Σ*_n=K_ψ*ψ*−K_ψ*u K_uu^(-1)K_uψ* + K_ψ*u L_u^(−T)D^(-1)L_u^(−1)K_uψ*。

通过式（41）、（42）即可避免直接求逆大维数矩阵，并使用 Cholesky 分解完成稳定计算。[查看附录 D 原式（40）–（42）](https://arxiv.org/pdf/2607.17954v1#page=14)

## 参考文献（References）

> 正式书目信息保留原论文的英文题目及作者；参考文献并非待翻译的研究论述。下列条目顺序与原文 [1]–[38] 一致。

[1] Y. Deng, B. Zhou, F. Li, and Q. Wu, “Online Gaussian process for
dynamic radio map updating,” in IEEE International Workshop on
Machine Learning for Signal Processing, Istanbul, Turkey, 2025.
[2] S. Bi, J. Lyu, Z. Ding, and R. Zhang, “Engineering radio maps for
wireless resource management,” IEEE Wireless Commun., vol. 26, no. 2,
pp. 133–141, 2019.
[3] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui,
and R. Zhang, “A tutorial on environment-aware communications via
channel knowledge map for 6G,” IEEE Commun. Surv. Tutor., vol. 26,
no. 3, pp. 1478–1519, 2024.
[4] D. Romero and S.-J. Kim, “Radio map estimation: A data-driven
approach to spectrum cartography,” IEEE Signal Process. Mag., vol. 39,
no. 6, pp. 53–72, 2022.
[5] S. Zhang and R. Zhang, “Radio map-based 3D path planning for cellularconnected UAV,” IEEE Trans. Wireless Commun., vol. 20, no. 3, pp.
1975–1989, 2020.
[6] M. Wu, H. Wu, W. Lu, Z. Ning, L. Guo, and A. Jamalipour, “Secure split
ofﬂoading and trajectory design for uav-assisted multi-exit collaborative
dnn inference,” IEEE Trans. Mob. Comput., pp. 1–15, 2026.
[7] M. Wu, H. Wu, W. Lu, L. Guo, I. Lee, and A. Jamalipour, “Securityaware designs of multi-uav deployment, task ofﬂoading and service
placement in edge computing networks,” IEEE Trans. Mob. Comput.,
vol. 24, no. 10, pp. 11 046–11 060, 2025.
[8] Y. Dang, A. Karakoc, S. Norshahida, and R. Jäntti, “3d radio map-based
gps spooﬁng detection and mitigation for cellular-connected uavs,” IEEE
Trans. Mach. Learn. Commun. Netw., vol. 1, pp. 313–327, 2023.
[9] J. Li, Z. Du, B. Zhou, W. Wang, Q. Wu, and W. Saad, “Open-set
recognition of communication jamming using raw i/q data with domain
adaptation,” IEEE Trans. Commun., vol. 74, pp. 6508–6522, 2026.
[10] J. Chen and U. Mitra, “Unimodality-constrained matrix factorization
for non-parametric source localization,” IEEE Trans. Signal Process.,
vol. 67, no. 9, pp. 2371–2386, 2019.
[11] Ç. Yapar, R. Levie, G. Kutyniok, and G. Caire, “Real-time outdoor
localization using radio maps: A deep learning approach,” IEEE Trans.
Wireless Commun., vol. 22, no. 12, pp. 9703–9717, 2023.
[12] C. He, Y. Dong, and Z. J. Wang, “Radio map assisted multi-UAV target
searching,” IEEE Trans. Wireless Commun., vol. 22, no. 7, pp. 4698–
4711, 2023.
[13] M. F. Iskander and Z. Yun, “Propagation prediction models for wireless
communication systems,” IEEE Trans. Microw. Theory Tech., vol. 50,
no. 3, pp. 662–673, 2002.
[14] R. Wahl, G. Wölﬂe, P. Wertz, P. Wildbolz, and F. Landstorfer, “Dominant
path prediction model for urban scenarios,” in 14th IST Mobile and
Wireless Communications Summit, Dresden, German, 2005.
[15] N. Suga, R. Sasaki, M. Osawa, and T. Furukawa, “Ray tracing acceleration using total variation norm minimization for radio map simulation,”
vol. 10, no. 3, pp. 522–526, 2021.
[16] T. Cover and P. Hart, “Nearest neighbor pattern classiﬁcation,” IEEE
Trans. Inf. Theory, vol. 13, no. 1, pp. 21–27, 1967.
[17] J.-P. Chiles and P. Delﬁner, Geostatistics: modeling spatial uncertainty.
John Wiley & Sons, 2012.
[18] K. Sato and T. Fujii, “Kriging-based interference power constraint:
Integrated design of the radio environment map and transmission power,”
IEEE Trans. on Cogn. Commun. Netw., vol. 3, no. 1, pp. 13–25, 2017.
[19] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder,
Z.-L. Zhang, and G. B. Giannakis, “Bayesian active learning for sample
efﬁcient 5G radio map reconstruction,” IEEE Trans. Wireless Commun.,
2024.
[20] H. Sun and J. Chen, “Propagation map reconstruction via interpolation
assisted matrix completion,” IEEE Trans. Signal Process., vol. 70, pp.
6154–6169, 2022.
[21] G. Zhang, X. Fu, J. Wang, X.-L. Zhao, and M. Hong, “Spectrum
cartography via coupled block-term tensor decomposition,” IEEE Trans.
Signal Process., vol. 68, pp. 3660–3675, 2020.
[22] H. Sun and J. Chen, “Integrated interpolation and block-term tensor
decomposition for spectrum map construction,” IEEE Trans. Signal
Process., vol. 72, pp. 3896–3911, 2024.
[23] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “Radiounet: Fast
radio map estimation with convolutional neural networks,” IEEE Trans.
Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.
[24] Y. Teganya and D. Romero, “Deep completion autoencoders for radio
map estimation,” IEEE Trans. Wireless Commun., vol. 21, no. 3, pp.
1710–1724, 2021.
[25] F. Li, Y. Deng, B. Zhou, and Q. Wu, “Partial convolutional based-radio
map reconstruction for urban environments with inaccessible areas,” in
2024 IEEE International Conference on Acoustics, Speech and Signal
Processing (ICASSP), Seoul, South Korea, 2024.
[26] Z. Liu, S. Zhang, Q. Liu, H. Zhang, and L. Song, “Wiﬁ-diffusion:
Achieving ﬁne-grained wiﬁ radio map estimation with ultra-low sampling rate by diffusion models,” IEEE J. Sel. Areas Commun., vol. 43,
no. 11, pp. 3796–3812, 2025.
[27] Z. Liu, Q. Liu, S. Zhang, H. Zhang, and L. Song, “A ﬁne-grained 3d
radio map construction paradigm with ultra-low sampling rates by large
generative models,” IEEE J. Sel. Areas Commun., vol. 44, pp. 4397–
4413, 2026.
[28] B. Huang, Z. Xu, B. Jia, and G. Mao, “An online radio map update
scheme for wiﬁ ﬁngerprint-based localization,” IEEE Internet Things J.,
vol. 6, no. 4, pp. 6909–6918, 2019.
[29] Y. Zhao, C. Liu, K. Zhu, S. Zhang, and J. Wu, “GSMAC: GAN-based
signal map construction with active crowdsourcing,” IEEE Trans. Mobile
Comput., vol. 22, no. 4, pp. 2190–2204, 2021.
[30] M. Kasparick, R. L. Cavalcante, S. Valentin, S. Stańczak, and
M. Yukawa, “Kernel-based adaptive online reconstruction of coverage
maps with side information,” IEEE Trans. Veh. Technol., vol. 65, no. 7,
pp. 5461–5473, 2015.
[31] R. Nikbakht, A. Jonsson, and A. Lozano, “Dual-kernel online reconstruction of power maps,” in 2018 IEEE Global Communications
Conference (GLOBECOM), Abu Dhabi, UAE, 2018.
[32] M. Titsias, “Variational learning of inducing variables in sparse Gaussian
processes,” in Artiﬁcial Intelligence and Statistics (AISTATS), Clearwater
Beach, Florida, USA, 2009.
[33] T. D. Bui, C. Nguyen, and R. E. Turner, “Streaming sparse Gaussian
process approximations,” in Advances in Neural Information Processing
Systems (NeurIPS), Long Beach, CA, USA, 2017.
[34] P. E. Chang, P. Verma, S. John, A. Solin, and M. E. Khan, “Memorybased dual Gaussian processes for sequential learning,” in International
Conference on Machine Learning (ICML), Honolulu, HI, USA, 2023.
[35] C. K. Williams and C. E. Rasmussen, Gaussian processes for machine
learning. MIT press Cambridge, MA, 2006.
[36] K. Chen, Q. Kong, Y. Dai, Y. Xu, F. Yin, L. Xu, and S. Cui,
“Recent advances in data-driven wireless communication using Gaussian
processes: a comprehensive survey,” China Commun., vol. 19, no. 1, pp.
218–237, 2022.
[37] T. Galy-Fajou and M. Opper, “Adaptive inducing points
selection for Gaussian processes,” 2021. [Online]. Available:
https://arxiv.org/abs/2107.10066
[38] R. Hoppe, G. Wölﬂe, and U. Jakobus, “Wave propagation and radio
network planning software winprop added to the electromagnetic solver
package feko,” in 2017 International Applied Computational Electromagnetics Society Symposium (ACES), Firenze, Italy, 2017.

**阅读边界：** 复杂公式以等价纯文本记号和逐式推导说明呈现，但受 PDF 数学排版提取限制，矩阵下标及部分分块常数请对照原文公式。算法、实验指标、所有正文节与附录节均在此译稿覆盖。

{% endraw %}