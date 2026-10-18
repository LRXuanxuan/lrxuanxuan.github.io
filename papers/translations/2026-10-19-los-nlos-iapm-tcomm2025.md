---
layout: page
title: "LoS/NLoS 识别辅助的 6G 室内 MIMO 定位方法｜中文逐节译稿（校对中）"
permalink: /papers/translations/2026-10-19-los-nlos-iapm-tcomm2025/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c87cd5ee4b0a13ea/) · [IEEE 原文](https://doi.org/10.1109/TCOMM.2025.3605449)

# 面向 6G 室内 MIMO 通信的 LoS/NLoS 识别辅助定位新方法

**原题：** A Novel LoS/NLoS Identification-Assisted Positioning Method for 6G Indoor MIMO Communications  
**作者：** Yang Wu、Cheng-Xiang Wang、Chen Huang、Junling Li、Li Zhang、El-Hadi M. Aggoune、Yunfei Chen  
**出处：** *IEEE Transactions on Communications*，73(12)，13578—13594，2025。DOI：10.1109/TCOMM.2025.3605449。  
**译文状态：** 按原文顺序覆盖摘要、I—VI 节、公式（1）—（38）、主要图表与实验数据。仍在逐页校对；英文参考文献书目以 IEEE 原文为准，暂不计入“全文验收通过”。

## 摘要

室内定位是第六代（6G）无线通信中通感一体化（integrated sensing and communication，ISAC）技术的重要应用。为解决现有基于指纹的定位方法（fingerprint-based positioning methods，FPMs）在严重多径效应下的局限，本文面向 6G 室内多输入多输出（multiple-input multiple-output，MIMO）通信，提出一种新型的基于信道状态信息（channel state information，CSI）的信道指纹结构，以及一种新的视距（line-of-sight，LoS）/非视距（non-LoS，NLoS）识别辅助定位方法（identification-assisted positioning method，IAPM）。所提出的信道指纹结构采用最大接收功率路径，提高特征的可区分性。IAPM 结合 LoS/NLoS 识别模块与改进加权随机森林（improved weighted random forest，IWRF）定位算法，以实现准确定位。基于信道实测数据与射线追踪（ray tracing，RT）生成的合成信道数据进行评价。结果表明，相比广泛采用的 FPM，所提方法在准确性和鲁棒性方面具有优势。

**关键词：** 6G 通信；改进加权随机森林；室内定位；LoS/NLoS 识别；射线追踪。

## I. 引言

尽管第四代（4G）长期演进（LTE）、第五代（5G）新空口（NR）在定位与导航技术方面的持续进步推动了全球定位系统在室外达到令人满意的精度 [1], [2]，高精度室内定位仍面临巨大挑战。与主要依赖 LoS 传播的室外定位不同，室内环境受到墙体阻挡、复杂结构和人员活动的影响，通常存在多径衰落与 NLoS 传播。另一方面，室内定位是 6G 无线通信 ISAC 技术的重要应用 [3]—[6]。因此，需要探索面向 6G 的新型室内定位方法。

现有室内定位方法可分为几何定位方法（geometry-based positioning methods，GPMs）和 FPM。GPM 根据接收信号强度（received signal strength，RSS）[9]、到达角（angle of arrival，AoA）[10]、到达时间（time of arrival，ToA）[11] 和载波相位 [12] 等信道特征，利用几何原理估计位置。随着 MIMO 在 4G LTE 与 5G NR 中发展，AoA 与 ToA 估计取得明显进展，改善了相应 GPM 的精度 [13], [14]。但 GPM 一般容易受到 NLoS 干扰，且对收发端硬件要求较高，导致定位精度不稳定、成本上升。相比之下，FPM [15] 不需要专门定位设备，也能在一定程度上减轻 NLoS 的影响。

然而，大多数现有 FPM 面临三个明显问题：第一，忽略不同标签之间的差异，限制了对不同部署环境的适应能力；第二，对特征变化比较敏感，在信道波动时定位精度下降；第三，仍受到 NLoS 干扰，复杂传播条件下性能恶化。这些问题削弱了 FPM 在真实部署中的鲁棒性与泛化能力。

FPM 通常包含离线和在线两个阶段。离线阶段建立信道指纹数据库并训练定位模型。早期 FPM 常将 RSS 作为指纹特征 [16], [17]，但室内 NLoS 路径多，RSS 波动剧烈，影响定位精度。CSI 的粒度更细、稳定性更高，更能准确反映多径信息 [19]，因此研究者开始将 CSI 引入精确室内定位 [20]。6G 的发展进一步增强了这一趋势。文中指出 ITU 关注 26、40、60、70 GHz 毫米波频段 [7]；与 sub-6 GHz 相比，毫米波具有更宽带宽、更高数据率，结合 MIMO 可获得延迟—功率域以外的角度域信息 [8]。毫米波和 MIMO 因而能够生成高分辨率 CSI，涵盖 AoA、离开角（AoD）、RSS 和 ToA，捕获更精细的传播特征。6G ISAC 还能提供高分辨率环境信息，辅助感知细粒度信道状态变化，改善指纹数据库质量。

在线阶段，FPM 利用离线训练模型估计终端实际位置。加权 K 近邻（WKNN）[21], [22] 可以无需离线训练，且预测较准确，但稳定性较差，不能挖掘指纹与位置的潜在关系。朴素贝叶斯（naive Bayes，NB）[18] 的精度取决于假设分布与真实分布的吻合程度。支持向量机（SVM）[23], [24] 在处理多个可能位置、表达预测不确定性方面存在局限。随着人工智能技术的发展 [25]—[28]，研究者也使用卷积神经网络（CNN）[29]—[31]、双向长短期记忆网络 [32]、Transformer [33] 等人工神经网络（ANN）。但 ANN 通常需要大量训练样本，其复杂结构和众多参数也增加了训练难度。

随机森林（RF）是一种基于决策树的集成学习算法 [34]，能够处理高维数据，通常无须先做归一化，训练速度较快，适合室内定位。文献 [35] 提出基于 RSS 指纹的 RF 改进方法，证明其快速响应与较高定位精度；文献 [36] 设计 RF 指纹组融合定位框架；文献 [37] 利用分层 RF 对射频识别信号分类以定位患者。然而，已有 RF 定位方法仍存在：（1）依赖全部树的平均/投票结果，忽略标签差异及不同标签贡献；（2）各训练集对特征的敏感程度不同，在不同场景中使用固定特征组合会影响稳定性；（3）不能完全消除 NLoS 对定位精度的影响。

高精度定位还需要可靠的数据库结构 [38]。多数 FPM 研究侧重估计算法，缺乏对室内信道特征的分析；建立指纹数据库又耗时耗力。RT 作为确定性建模方法，可获得准确的信道参数 [39], [40]，因此已被用于构建指纹数据库 [32], [41]，但 RT 与真实信道测量之间如何对齐仍很少得到研究 [42]。聚类式定位方法 [43]—[45] 可在缺乏大量标注数据时，借助子空间分析或序列建模实现无监督定位，但通常更适合信号子空间可分性较高、环境较稳定的场景。因此，构造同时具有稳定性与区分性的信道指纹至关重要。

基于上述观察，本文通过扩展前期工作 [46]，提出 LoS/NLoS 识别辅助定位方法 IAPM。该方法有望部署在 BS 端，为网络优化、运动检测提供终端位置，也可部署在 UE 端辅助室内障碍物定位和导航，但这些应用不在本文研究范围内。文献 [46] 已提出使用信道指纹的加权随机森林（WRF）定位。与 [46] 相比，本文主要贡献包括：

1. **新型指纹结构：** 基于最大接收功率路径（maximum received power path，MRP）及延迟/角度功率谱密度（power spectral density，PSD）设计指纹特征。MRP 增强不同数据点之间的区分度，提高 IWRF 训练模型精度。实验验证，相较传统 RSS 指纹，该结构显著改善定位。
2. **IWRF 算法：** 在 RF 和加权预测的基础上引入自适应 $K$ 值，以提高权重预测的灵活性；再通过特征选择，自适应选取有利于模型训练的信道指纹。实验表明 IWRF 相比原始 RF 改进显著。
3. **IAPM 方法：** 在 IWRF 基础上增加 LoS/NLoS 识别模块，针对两类传播场景分别执行定位，有助于更充分地理解室内传播环境。评价表明 IAPM 在准确性和鲁棒性上优于现有方法。

本文第二节介绍算法框架和数据采集；第三节讲述 CSI 指纹数据库构建；第四节给出 IAPM；第五节为实验评价；第六节总结。

## II. 算法框架与数据采集

### A. 算法框架

图 1 展示 IAPM 的总体结构。离线阶段，在参考点（reference points，RPs）处通过 RT 仿真或信道实测采集训练数据，利用新型指纹结构重建 PSD，并从 MRP 与延迟/角度 PSD 中提取指纹，最终建立训练数据库 $\mathrm{FPDat}_{\rm IP,train}$。该数据库包含指纹特征、RP 的 LoS/NLoS 标签及 RP 坐标。

将训练数据库送入 IWRF 算法，同时训练 LoS/NLoS 识别模型和定位模型。IWRF 训练过程中迭代执行特征选择，直至模型收敛，并与模型一起输出最优特征排序准则。LoS 与 NLoS RP 分开训练定位模型，坐标的 $x$、$y$ 分量也分别用于训练。

在线阶段，在测试点（test points，TPs）处通过 RT 或实测采集数据，处理得到仅包含指纹特征的 $\mathrm{FPDat}_{\rm IP,test}$。先输入 LoS/NLoS 识别模型，预测 TP 的传播状态；再根据标签选择对应定位模型，执行包括自适应 $K$ 和加权预测的 IWRF，最终得到 TP 估计坐标。

**图 1.** 所提方法框架：左侧为 CSI 指纹结构，包括延迟/角度 PSD 重建、MRP 及 PSD 特征提取；右侧为 IAPM，包括离线特征选择与 IWRF 模型训练，以及在线 LoS/NLoS 识别、模型选择和坐标预测。

### B. RT 室内信道模型

RT 基于几何光学原理与一致性衍射理论，模拟无线电波在空间中的传播路径 [39]。6G 的高频特性与 RT 在无线信道研究中适用的高频条件相符合。本文使用商业软件 Wireless InSite® 建立室内场景并模拟信道。

场景 1 为 $16\ {\rm m}\times15\ {\rm m}$ 的住宅室内环境（图 2(a)）。两面墙造成占主导的 NLoS 传播，场景中还包括材料电磁特性各异的多个散射物体。场景 2 为 $46\ {\rm m}\times17\ {\rm m}$ 的办公室环境（图 2(b)），有 12 根铁柱造成复杂的 NLoS 传播。但 Tx 位于场景中间，LoS 仍占主导；散射材料类型较少，却分布有植被散射物。仿真使用的材料电磁参数依照 ITU-R P.2040-3 [47] 计算。

由于波长较短，毫米波反射、衍射和散射的有效传播分量减少，LoS 分量通常较强，其他分量较弱，表现出信道稀疏性。复杂室内环境会进一步凸显这种稀疏性，因而毫米波通信通常更依赖 LoS 覆盖 [48]—[50]。在 RT 中，每条到达 Rx 的路径最多经历 6 次反射和 1 次衍射。其他主要仿真参数见原文表 I。另从 RP 随机选取 100 个验证点用于模型校准，并在两场景内随机设置 200 个 TP 用于测试。RT 仿真能够直接获得 RSS、ToA、AoA、AoD 等 CSI 相关参数。

**图 2.** 仿真场景：（a）住宅室内场景；（b）办公室室内场景。  
**表 I.** RT 建模参数：Rx 高度 1.5 m、Tx 高度 2.8 m；场景 1 Tx 位置 (−7.35 m, −7.35 m)，场景 2 Tx 位置 (13.59 m, 14.11 m)；频率 60 GHz；带宽 3 GHz；Rx 为 $2\times2$ MIMO 全向阵列，Tx 为 $4\times4$ MIMO 全向阵列；发射功率 23 dBm。其余几何与材料参数依原表。

### C. 室内信道实测

除 RT 仿真外，本文还构建一个与场景 2 对应的测量场景 [51]，如图 3(a) 所示。测量点中，桌面有 30 个 NLoS RP，过道有 90 个 LoS RP。由于存在异常数据点，实际使用时排除部分数据，最终保留 100 个数据点。这些数据点的分布不均匀且稀疏，如图 3(b)。Tx 与 Rx 分别采用 $4\times8$ 双极化圆柱形 MIMO 阵列和 $4\times4$ 双极化平面 MIMO 阵列，载频 5.5 GHz，带宽 700 MHz。数据按 70%/20%/10% 划分为训练/测试/验证集，信道特征通过空间交替广义期望算法（space-alternating generalized expectation algorithm）[53] 估计。

**图 3.** 实测场景：（a）信道测量现场；（b）RP、AP 及 LoS/NLoS 测量位置布局。

## III. 信道指纹特征提取

本节介绍新型 CSI 指纹结构：首先重建延迟/角度 PSD；再提出基于 MRP 与 PSD 的指纹特征；最后说明指纹数据库结构。

### A. 时延功率谱密度

利用多径角度、时延、相位和功率等参数，重建多个收发天线对的平均时延 PSD [54]：

$$
\widehat P(\tau)=\frac{1}{N_TN_RN_{\rm sc}}
\sum_{p=1}^{N_T}\sum_{q=1}^{N_R}
\sum_{k=1}^{N_{\rm sc}}|h_{pq}(\tau_k)|^2.
\tag{1}
$$

其中 $N_{\rm sc}=1024$ 为子载波数；$N_T,N_R$ 分别为发射和接收阵列单元数；$h_{pq}(\tau_k)$ 是发射单元 $p$ 到接收单元 $q$ 的信道传递函数 $H_{pq}(f_k)$ 的傅里叶逆变换。信道传递函数为

$$
H_{pq}(f_k)=
\sum_{l=1}^{L}\alpha_l e^{j\phi_l}e^{-j2\pi f_k\tau_l}.
\tag{2}
$$

$L$ 为多径数；$\alpha_l,\phi_l,\tau_l$ 分别为第 $l$ 条多径的幅度、相位和时延；$f_k$ 是带宽范围内的频率。

### B. 角度功率谱密度

利用 $L$ 条多径的角度与接收功率，可得角度 PSD [54]：

$$
\widehat f(\theta)=\sum_{l=1}^{L}p_l\delta(\theta-\theta_l).
\tag{3}
$$

$p_l$ 为第 $l$ 条路径的功率，$\delta(\cdot)$ 为 Dirac 冲激函数。$\theta$ 可表示方位 AoA（AAoA）、方位 AoD（AAoD）、俯仰 AoA（EAoA）或俯仰 AoD（EAoD），$\theta_l$ 是第 $l$ 条路径的对应角度。

### C. 基于 MRP 的指纹特征

室内散射体丰富，多径效应严重，使 Rx 所检测到的不同路径之间的功率差异显著。大多数到达 Rx 的射线对位置预测贡献有限。NLoS 主导的环境还会引起显著衰减；Rx 距离 Tx 越远，NLoS 对信号强度影响越大，如图 4(a)。因此，使用全部路径的指纹特征会引入多径分量之间的相互干扰，降低不同 RP 的区分度。本文据此提出基于 MRP 的指纹特征。

MRP 是信号传输中功率最高的路径，对 Rx 接收功率贡献最大。从时延 PSD 中获取 $\max_\tau\widehat P(\tau)$ 与对应 $\arg\max_\tau\widehat P(\tau)$，并由角度 PSD 提取 MRP 对应的 AoA 与 AoD，即 $\arg\max_\theta\widehat f(\theta)$。这类特征利用时延和角度 PSD 显式融合功率、时延与角度信息。以下分析其稳定性与可区分性。

#### 1）稳定性分析

将式（2）改写为

$$
H_{pq}(f_k)=
\alpha_1e^{j\phi_1}e^{-j2\pi f_k\tau_1}
+\sum_{l=2}^{L}\alpha_le^{j\phi_l}e^{-j2\pi f_k\tau_l}.
\tag{4}
$$

其中 $\alpha_1,\phi_1,\tau_1$ 是 MRP 参数，$l\ge2$ 为其他 MPC。假设小幅环境变化造成的衰落幅度扰动 $\Delta\alpha_l$ 服从瑞利分布，MRP 功率变化近似为

$$
|\Delta P_{\rm MRP}|=
|(\alpha_1+\Delta\alpha_1)^2-\alpha_1^2|
\approx2|\alpha_1||\Delta\alpha_1|.
\tag{5}
$$

其他 MPC 的功率变化近似为 $\Delta p_l\approx2|\alpha_l||\Delta\alpha_l|$，全部 MPC 的功率变化为

$$
\Delta P_{\rm MPC}=
\sum_{l=1}^{L}\Delta p_l
\approx2\sum_{l=1}^{L}|\alpha_l||\Delta\alpha_l|.
\tag{6}
$$

MRP 的相对功率变化为

$$
\frac{|\Delta P_{\rm MRP}|}{|P_{\rm MRP}|}
\approx\frac{2|\alpha_1||\Delta\alpha_1|}{\alpha_1^2}
=\frac{2|\Delta\alpha_1|}{|\alpha_1|}.
\tag{7}
$$

相应地，全部 MPC 的相对变化为

$$
\frac{|\Delta P_{\rm MPC}|}{|P_{\rm MPC}|}
\approx
\frac{2\sum_{l=1}^{L}|\alpha_l||\Delta\alpha_l|}
{\alpha_1^2+\sum_{l=2}^{L}\alpha_l^2}.
\tag{8}
$$

在 6G 室内毫米波场景中，多数 RP 的 MRP 通常为 LoS 路径。即使是 NLoS 路径，其低阶反射或衍射造成的损耗也可能在可接受范围内。假定 $\alpha_1^2\gg\sum_{l=2}^L\alpha_l^2$，作者进一步给出

$$
\frac{|\Delta P_{\rm MPC}|}{|P_{\rm MPC}|}
\approx\frac{2\sum_{l=1}^{L}|\alpha_l||\Delta\alpha_l|}{\alpha_1^2}
\gg\frac{2|\Delta\alpha_1|}{|\alpha_1|}
=\frac{|\Delta P_{\rm MRP}|}{|P_{\rm MRP}|}.
\tag{9}
$$

由此作者认为，环境发生较小变化时，MRP 功率比全部 MPC 的合成功率更稳定。

#### 2）可区分性分析

大尺度衰落决定了小尺度衰落的整体特征；信号功率随距离增大而衰减。本文主要考虑路径损耗，采用几何路径损耗模型 [52]。位置 $(x,y)$ 的第 $l$ 条路径功率为

$$
p_l(x,y)=C_l\,r_l(x,y)^{-\gamma},
\tag{10}
$$

其中 $C_l=G_{t,l}G_rp_{t,l}$，$G_{t,l}$ 为第 $l$ 条路径的发射天线增益，$G_r$ 为接收增益，$p_{t,l}$ 为发射功率，$r_l(x,y)$ 为散射体到 $(x,y)$ 的距离，$\gamma$ 为路径损耗指数。

对于微小位置变化 $\Delta\mathbf x=(\Delta x,\Delta y)$，距离的一阶变化为

$$
\Delta r_l\approx\nabla r_l\cdot\Delta\mathbf x
=\frac{\mathbf r_l}{r_l}\cdot\Delta\mathbf x.
\tag{11}
$$

其中 $\mathbf r_l$ 为位置矢量。功率一阶变化近似为

$$
\Delta P_l\approx
-\gamma C_l r_l^{-\gamma-1}\Delta r_l
=-\gamma C_l r_l^{-\gamma-1}
\frac{\mathbf r_l}{r_l}\cdot\Delta\mathbf x.
\tag{12}
$$

总 RSS 的变化为

$$
\Delta P_{\rm RSS}\approx
\sum_{l=1}^{L}\Delta P_l
=-\gamma C\sum_{l=1}^{L}
r_l^{-\gamma-1}\,\mathbf r_l\cdot\Delta\mathbf x.
\tag{13}
$$

利用三角不等式得到

$$
|\Delta P_{\rm RSS}|
\le\gamma C\sum_{l=1}^{L}r_l^{-\gamma}
|\nabla d_l\cdot\Delta\mathbf x|.
\tag{14}
$$

其中 $\nabla d_l$ 的方向与 $\mathbf r_l$ 一致。对于 MRP（$l=1$），原文给出的变化近似为

$$
|\Delta P_{\rm MRP}|
\approx\left|-\gamma C\,r_1^{-\gamma-1}
\mathbf r_1\cdot\Delta\mathbf x\right|.
\tag{15}
$$

在毫米波室内场景中，假定其他路径的距离变化梯度很小、路径长度 $r_l\gg r_1$ 且 $2<\gamma<6$，则原文得出

$$
|\Delta P_{\rm RSS}|
\ll\gamma C r_1^{-\gamma}
|\nabla d_1\cdot\Delta\mathbf x|
\approx|\Delta P_{\rm MRP}|.
\tag{16}
$$

作者认为 MRP 相比传统 RSS 具有更高的空间区分度。图 4(b) 表明，MRP 减轻多径引起的信号波动，并增强指纹独特性。图 5 进一步展示从 RT 与信道实测中提取的 MRP 具有良好一致性 [53]。因此，MRP 不仅能表达空间距离关系，也有助于减小仿真与实测之间的特征差异。

*译者校核提示：原文式（9）、（14）—（16）的不等式推演包含较强隐含条件；这里按原文编号与结论译出，不将其视为无条件成立的数学定理。*

**图 4.** 空间 RSS 分布：（a）传统 RSS；（b）MRP 的 RSS。  
**图 5.** RT 与信道实测得到的时延 PSD 比较。

### D. 基于时延/角度 PSD 的指纹特征

在缺少 LoS 的 NLoS 环境中，Rx 接收到的多条 MPC 可能具有接近的功率，比 LoS 环境更难区分。因此引入基于时延/角度 PSD 的指纹特征辅助定位 [56]。

**1）接收功率峰度（Kurtosis）。** 峰度量化接收功率概率分布的尖峰程度：

$$
\mathcal K=
\frac{\mathbb E[(\widehat P(\tau_n)-\mu_h)^4]}
{\sigma_h^4}.
\tag{17}
$$

其中 $\mu_h$ 和 $\sigma_h$ 分别为时延 PSD 的均值和标准差：

$$
\mu_h=\frac1{N_{\rm sc}}\sum_{n=1}^{N_{\rm sc}}\widehat P(\tau_n),
\tag{18}
$$

$$
\sigma_h=
\sqrt{\frac1{N_{\rm sc}-1}
\sum_{n=1}^{N_{\rm sc}}(\widehat P(\tau_n)-\mu_h)^2}.
\tag{19}
$$

**2）接收功率偏度（Skewness）。** 偏度衡量分布的不对称性：

$$
\mathcal S=
\frac{\mathbb E[(\widehat P(\tau_n)-\mu_h)^3]}{\sigma_h^3}.
\tag{20}
$$

**3）上升时间（Rising Time）。** 衡量最强载波分量与第一个载波分量的时间间隔：

$$
\Delta\tau=
\arg\max_{\tau_n}\widehat P(\tau_n)-\min(\tau_n).
\tag{21}
$$

**4）均方根时延扩展（RMS Delay Spread）。** 衡量多径传播条件下的时延离散程度：

$$
\sigma_{\rm DS}=
\sqrt{\frac{\sum_{n=1}^{N_{\rm sc}}
(\tau_n-\mu_\tau)^2\,\widehat P(\tau_n)}
{\sum_{n=1}^{N_{\rm sc}}\widehat P(\tau_n)}}.
\tag{22}
$$

加权平均时延为

$$
\mu_\tau=
\frac{\sum_{n=1}^{N_{\rm sc}}\tau_n\widehat P(\tau_n)}
{\sum_{n=1}^{N_{\rm sc}}\widehat P(\tau_n)}.
\tag{23}
$$

**5）均方根角度扩展（RMS Angle Spread）。** 描述多径在空间域中的离散程度：

$$
\sigma_{\rm AS}=
\sqrt{\frac{\sum_{n=1}^{N_{\rm sc}}
(\widehat\theta_n-\mu_\theta)^2p_n}
{\sum_{n=1}^{N_{\rm sc}}p_n}},
\tag{24}
$$

其中 $\widehat\theta_n$ 可为 AAoA、AAoD、EAoA、EAoD，平均角度为

$$
\mu_\theta=
\frac{\sum_{n=1}^{N_{\rm sc}}\widehat\theta_n p_n}
{\sum_{n=1}^{N_{\rm sc}}p_n}.
\tag{25}
$$

**6）莱斯 $K$ 因子（Rician $K$-factor）。** 衡量确定性与随机多径分量的功率比例，可用 [55]：

$$
\widehat K=
\frac{\sqrt{G_a^2-G_v}}{G_a-\sqrt{G_a^2-G_v}},
\tag{26}
$$

其中

$$
G_a=\frac1{N_{\rm sc}}\sum_{n=1}^{N_{\rm sc}}|H_{pq}(f_n)|^2,
\tag{27}
$$

$$
G_v=\frac1{N_{\rm sc}-1}
\left(\sum_{n=1}^{N_{\rm sc}}|H_{pq}(f_n)|^4
-N_{\rm sc}G_a^2\right).
\tag{28}
$$

### E. 信道指纹数据库结构

离线信道指纹数据库为 $N_{\rm RP}\times18$ 矩阵，其中 $N_{\rm RP}$ 为参考点数，由定位网格密度决定。前 15 列为信道指纹特征，之后 2 列为 RP 的地理坐标，最后 1 列是 LoS/NLoS 二进制标签（LoS 为 1，NLoS 为 0）。指纹特征包括 $\max\widehat P(\tau)$、$\arg\max_\tau\widehat P(\tau)$、$\arg\max_\theta\widehat f(\theta)$、峰度、偏度、上升时间、RMS 时延扩展、RMS 角度扩展以及 $\widehat K$。四种角度统计量对应 AAoA、AAoD、EAoA、EAoD，因此合计为 15 维。

为与定位算法匹配，将定位区域按照笛卡尔坐标系划分为网格，并将 RP 设置在网格交点。在线指纹数据格式为 $N_{\rm TP}\times15$，其中 $N_{\rm TP}$ 是 TP 数，15 个特征与离线数据库保持一致。

## IV. 室内定位方法

针对引言中提出的实际问题，前期研究 [46] 已提出 WRF，本节进一步提出 IAPM 以增强定位性能。

### A. 加权预测与自适应 K 值

WRF 的关键是加权预测：根据 RF 给出的 $K$ 个最高预测得分 $S$，对预测坐标加权：

$$
(x,y)_{\rm TP}=
\frac{\sum_{k=1}^{K}(x_k,y_k)S_k}
{\sum_{k=1}^{K}S_k}.
\tag{29}
$$

传统 WRF 中的 $K$ 通常是预先指定的超参数，会随着场景变化或网格间距调整而需要重新设置，因此有必要自适应选取 $K$。将 TP 指纹输入训练模型后，RF 得到的坐标得分通常可分为高分与低分（近零）两类。本文使用 $K$-means 对坐标得分进行聚类。把得分集合表示为 $\mathbf S=\{S_1,\ldots,S_n\}$，初始聚类中心设为 $\boldsymbol\mu=\{S_H,S_L\}$，其中 $S_H,S_L$ 为最大、最小得分。各得分划归距离最近的聚类中心：

$$
C_i=\arg\min_j\|S_i-\mu_j\|.
\tag{30}
$$

随后将每个类别的中心更新为该类别全部得分的均值：

$$
\mu_j=\frac1{|c_j|}\sum_{i\in c_j}S_i.
\tag{31}
$$

重复式（30）、（31）直到聚类中心收敛，最终将高分组内坐标的数量作为自适应 $K$。算法还沿用 WRF 中的坐标分离，即对 $x$ 和 $y$ 坐标分别训练、预测。文献 [46] 已验证坐标分离优于直接联合预测。

### B. 特征选择

增加特征数通常能增加信息量，改善模型准确率，但加入过多特征可能引入冗余或无关信息，降低训练效果 [57], [58]。特征增加也加重计算和训练负担，影响算法可扩展性。文献 [56] 指出 RF 对与时间和角度相关的指纹特征尤为敏感。此外，决策树数量超过一定值后 RF 错误率趋于收敛，继续增加决策树无法提升训练效果，反而降低预测效率。因此，特征选择还需要同时确定最优树数量，构成 IWRF。

RF 使用袋外数据（out-of-bag，OOB）误差计算特征重要性。训练随机树时，对原训练集进行自助采样（bootstrap），对每份自助样本 $B_k$ 构造决策树 $d_k$，并计算 OOB 泛化误差：

$$
\varepsilon_{\rm oob}=
\frac1{|\mathcal O|}
\sum_{(\mathbf x,y)\in\mathcal O}
\mathbb I(D_{\rm oob}(\mathbf x)\neq y).
\tag{32}
$$

其中 $\mathcal O$ 表示训练集，$y$ 为相应标签，$\mathbb I$ 为指示函数。OOB 预测结果为

$$
D_{\rm oob}(\mathbf x)=
\arg\max_{y\in\mathcal Y}
\sum_{k=1}^{p}
\mathbb I(d_k(\mathbf x)=y)\,
\mathbb I(\mathbf x\notin\mathcal O_k).
\tag{33}
$$

对 OOB 数据中的特征 $x_i$ 加入扰动，其他特征不变，重新根据式（32）计算 OOB 误差 $\varepsilon_{\rm oob}^{(i)}$。特征重要性为

$$
P_i=\frac1{n_T}\sum_{k=1}^{n_T}
\bigl(\varepsilon_{{\rm oob},k}^{(i)}
-\varepsilon_{{\rm oob},k}\bigr).
\tag{34}
$$

$n_T$ 是 RF 决策树数量。根据 $P_i$ 降序排列特征；在每轮迭代中，选取排序靠前的特征送入 WRF 训练，并用验证集计算平均误差。同时，将 $n_T$ 从 10 增加至 150，步长为 5。选取平均误差最小的特征组，并输出特征排序准则 $f_L$ 和对应训练模型 $M$。在线阶段依照 $f_L$ 重新筛选、排列 TP 指纹，输入模型 $M$，通过 WRF 得到预测坐标。

### C. LoS/NLoS 识别辅助定位

NLoS 传播比 LoS 更复杂，两种环境中的信道特征有所不同。尽管 FPM 利用机器学习匹配数据库时可在一定程度上减小 NLoS 的影响，但如果不区分 RP 的 LoS/NLoS 状态，IWRF 训练便可能遇到困难，进而影响定位精度与可靠性。

在 IWRF 基础上，本文进一步提出 LoS/NLoS 识别辅助的 IWRF 定位方法（IAPM）。训练定位模型之前，先使用 IWRF 训练 RP 的 LoS/NLoS 标签，得到识别模型 $M_{\rm LoSI}$。同时将 RP 分为 LoS 和 NLoS 两组，分别送入 IWRF 训练定位模型。因此，识别和定位两个任务均采用 IWRF、使用同一初始指纹特征集，并行训练，以降低算法整体复杂度。不过，由于特征选择和决策树数目的优化，这两类任务最后得到的特征子集与 RF 结构并不相同。

离线阶段最终输出识别模型 $M_{\rm LoSI}$ 与两个定位模型 $M_{\rm IP,LoS}$、$M_{\rm IP,NLoS}$。在线阶段，将 TP 指纹先输入 $M_{\rm LoSI}$ 获得传播类别，再据此选择对应定位模型，通过 IWRF 预测坐标，如图 1 所示。

图 6 表明，在 LoS/NLoS 识别及定位任务中，MRP 指纹的重要性均显著高于其他特征，说明 MRP 在 RF 中具有较高区分能力。排除 MRP 后，两个任务的敏感特征不同：LoS/NLoS 识别更敏感于时延 PSD 特征，而定位对角度 PSD 特征非常敏感。这与 [56] 的结论一致，也说明室内定位应重视角度域信道特征。

图 7 比较 LoS 和 NLoS 下的定位特征重要性。在 LoS 条件下，RF 对 MRP 特征仍很敏感，说明其在直接传播条件下可靠；但在 NLoS 条件下，MRP 特征的重要性显著降低，这与 MRP 难以充分描述障碍物后的复杂多径传播相符。延迟/角度 PSD 特征恰好可以弥补 NLoS 下 MRP 的信息不足。因此，LoS/NLoS 的不同特征重要性说明了场景感知训练的重要性。

由于训练为离线过程，作者在复杂度分析中忽略训练成本。论文将 RF 在线预测复杂度记为 $O(n\log m)$，其中 $n,m$ 分别为树深度、特征数；识别模块复杂度为 $O(n_I\log m_I)$，坐标预测复杂度为 $O(2k_xn_x\log m_x)+O(2k_yn_y\log m_y)$，所以 IAPM 的整体在线复杂度为上述三项之和。

真实部署仍有其他挑战：动态环境变化可能使指纹数据库失效，需要重新采集数据并训练模型，增加维护开销。未来将构建更准确、实用、鲁棒的指纹库，研究多模态感知数据与无线传播之间的映射，以应对动态场景。

**图 6.** 特征重要性：（a）LoS/NLoS 识别；（b）定位。  
**图 7.** 不同场景中的定位特征重要性：（a）LoS；（b）NLoS。

## V. 性能评价

### A. 评价指标

使用以下指标评价定位性能：

$$
\mathrm{RMSE}=
\sqrt{\frac1{N_{\rm obs}}\sum_{t=1}^{N_{\rm obs}}
(X_{{\rm obs},t}-X_{{\rm pre},t})^2},
\tag{35}
$$

$$
\mathrm{STD}=
\sqrt{\frac1{N_{\rm obs}}\sum_{t=1}^{N_{\rm obs}}
(X_{{\rm pre},t}-\mu_{\rm pre})^2},
\tag{36}
$$

$$
\mathrm{MAE}=
\frac1{N_{\rm obs}}\sum_{t=1}^{N_{\rm obs}}
|X_{{\rm obs},t}-X_{{\rm pre},t}|,
\tag{37}
$$

$$
\mathrm{MaxE}=
\max_t|X_{{\rm obs},t}-X_{{\rm pre},t}|.
\tag{38}
$$

其中 $N_{\rm obs}$ 为观测值数量；$X_{\rm obs,t}$ 为观测坐标，$X_{\rm pre,t}$ 为预测坐标，$\mu_{\rm pre}$ 为预测均值。除以上指标外，还使用误差累积分布函数（CDF）与箱线图展示结果。在箱线图中，红色“+”表示异常值，箱内红线为中位数，黑线为边界值，蓝色箱体边缘为四分位数。箱体越紧凑、异常值越少，说明误差分布越集中。CDF 中的误差指真实位置与预测位置的绝对距离。

### B. MRP 指纹特征的性能

为验证 MRP 指纹特征的优势，在场景 1 中以 0.5 m 网格间距建立离线数据库，使用 IWRF 定位。图 8 比较的特征包括：传统 RSS、原始 CSI 的幅相、仅 AoA、ToA + AoA、从 CSI 提取的 25 个多径参数 [32]、本论文第三节 D 部分的 PSD 特征，以及所提 MRP 指纹。

图 8 表明，传统 RSS 对环境波动高度敏感，定位精度最差；传统 CSI 略有改善，却未充分利用多维特征。AoA 利用传播方向提高精度，ToA + AoA 又通过时空信息融合继续改善。提取全面多径参数的方法 [32] 虽提供较完整的传播信息，却因冗余和不同路径间干扰而可能过拟合，削弱指纹区分度。单独使用延迟/角度 PSD 特征，也不足以应对环境动态变化。相比之下，MRP 指纹使 95% 的定位误差小于 0.4 m，CDF 曲线优于其他特征，尤其在误差小于 0.5 m 时。MRP 结合 RSS、ToA、AAoA、EAoA、AAoD、EAoD，在时空分辨率、抑制多径干扰及区分度之间取得较好平衡。

**图 8.** 场景 1 中不同信道指纹特征的定位精度比较。

### C. LoS/NLoS 识别性能

为验证识别模块的定位价值，先评价 IWRF 的 LoS/NLoS 识别性能。从场景 1 的 RT 数据中选取 284 个已标注的 LoS/NLoS 点训练 IWRF，另选取 50 个点验证。在 50 个验证点上，预测与真实标签完全一致，识别准确率达到 100%。多轮交叉验证中，最低准确率仍为 98%，即 50 个点中至多有 1 个误判。图 9(a) 还展示 TP 的 LoS/NLoS 标签预测与真实分布几乎一致，分类准确率为 99.5%，只有一个点预测错误。MRP 特征的有效性对这一结果起了关键作用。

进一步在实测场景中评价识别模块。虽然数据量与数据分布有所限制，IWRF 仍取得 93% 的识别准确率，如图 9(b)，只有一个点被错误分类。这验证了算法在实测条件下识别传播状态的能力。

**图 9.** TP 的 LoS/NLoS 识别结果热力图：（a）场景 1；（b）实测场景。

### D. IAPM 的性能

本小节将 IAPM 与 IWRF 在不同场景下比较，以验证 LoS/NLoS 识别的作用。作者指出，此前 FPM 研究很少专门考察这一点。

表 II 表明，在没有额外干扰的理想仿真场景 1 和 2 中，IWRF 略优于 IAPM：场景 1 的 IWRF MAE 为 0.20 m、IAPM 为 0.21 m；场景 2 则分别为 0.17 m 和 0.29 m。这说明在理想条件下，单靠加权预测与自适应 $K$ 可能已获得较高精度，LoS/NLoS 识别附加价值有限。场景 2 面积较大且具有密集金属立柱，反射造成 LoS 与 NLoS 指纹重叠，NLoS 条件下可能出现高达 8 m 的误差。

在非理想条件下，LoS/NLoS 识别更重要。在存在动态变化和低频条件时，**原文正文**声称 IAPM 的 MAE 分别为 0.25 m 和 0.18 m，而 IWRF 分别为 0.24 m 和 0.20 m；但**原文表 II** 的动态场景数据实际列为 IWRF 0.2520 m、IAPM 0.2432 m，二者对应关系与正文相反。低频条件表 II 则为 IWRF 0.1971 m、IAPM 0.1853 m。此处保留原文正文与表格的差异，不混作一组一致结果。在真实实测环境中，IAPM 的 MAE 为 1.36 m、RMSE 为 1.83 m，优于 IWRF 的 1.42 m 与 1.96 m。图 10 也显示实测条件下 IAPM 的误差收敛更快。LoS 与 NLoS 的 MAE 分别为 0.99 m 和 2.77 m；NLoS 的最大误差反而较小，部分原因是 NLoS 样本量有限。

在低分辨率场景中，IWRF 的 MAE 0.42 m 略低于 IAPM 的 0.45 m，但 IWRF 的最大误差更大、稳定性较差；IAPM 的 RMSE 为 0.94 m，优于 IWRF 的 1.08 m。总体而言，IWRF 在理想条件下表现较强，而 IAPM 的传播场景识别模块在复杂实际环境中更有利于提高鲁棒性。

**表 II.** IAPM 与 IWRF 在不同场景中的性能对比，指标包括 MAE、RMSE、MaxE。  
**图 10.** 实测场景中 IAPM 与 IWRF 的误差分布比较。

### E. 与不同定位算法比较

选取七种算法作为基线：WKNN [22]、SVM [23]、NB [18]、CNN [30]、自编码器 CNN（ACNN）[31]、结构化内部注意力双向循环网络（SIABR）[32] 和 SWIN [33]。为降低一些机器学习算法训练随机性的影响，将随机种子固定为 42。

**1）RT 仿真数据评价。** 将场景 1、2 按 0.5 m 网格划分，利用所提特征建立指纹数据库。表 III 汇总各算法 MAE、MaxE、RMSE、STD，图 11、12 给出误差 CDF 与箱线图。

表 III 表明，在两个场景中，IAPM 的 MAE、RMSE 和 STD 均明显低于原 WRF，说明其精度和稳定性更好。图 11(a) 中，IAPM 有 95% 的误差小于 0.4 m。在场景 2，WRF 的最大误差远大于 IAPM，说明后者极端条件下更可靠。IAPM 将特征选择、加权预测、自适应 $K$、LoS/NLoS 识别结合，使场景 1、2 相比 WRF 的精度分别提高约 42% 和 70%。

与 WKNN、SVM、NB 等传统算法相比，IAPM 与 WRF 整体误差更小、分散程度更低。图 12 的箱线图显示 IAPM 的误差高度集中，稳定性较高。与 ACNN、SIABR、SWIN 等先进 ANN 比较，IAPM 在场景 1 可达到与 SWIN 接近的精度；在面积更大、金属立柱密集、阻挡复杂的场景 2 中，IAPM 比 SWIN、ACNN、SIABR 的相关指标分别改善 43%、32%、39%。值得注意的是，IAPM 在场景 2 甚至比场景 1 精度更高，而所有 ANN 算法在场景复杂化后均出现不同程度下降。图 11(b) 中，IAPM 有 95% 的定位误差小于 0.35 m，这与特征选择和自适应 $K$ 在不同环境中动态调整预测有关。

**图 11.** 60 GHz、0.5 m 网格间隔时不同算法的误差 CDF：（a）场景 1；（b）场景 2。  
**图 12.** 同设置下不同算法的误差箱线图：（a）场景 1；（b）场景 2。  
**表 III.** 60 GHz、0.5 m 网格间隔条件下各定位算法性能。

**2）实测数据评价。** 测量场景对应图 3 的办公室，实测点分布不均，集中在局部区域。为考察有限数据下的算法效果，实际测得 120 个点，其中 LoS 90 个，相邻间距 0.5 m；NLoS 30 个，相邻间距 3 m。排除 20 个异常点后，仅剩 100 个点，某些 RP 之间距离最大达 7.5 m。作者用基于网格的方法估计平均采样间距为 2.49 m。在数据量有限的情况下，随机选择 10% 测试，其余用于训练与验证。

表 IV 显示，实测条件下 IAPM 仍获得最佳性能，MAE 为 1.36 m，相比其他算法中表现最佳者提升约 32%。图 13 中，IAPM 的误差收敛最快、分布最集中。SWIN、SIABR、ACNN 等 ANN 在这种稀疏实测数据下表现不够理想，说明其需要更多训练样本。一个值得注意的现象是，实测时 WKNN 比仿真中表现更好，精度仅次于 IAPM。图 13(b) 还表明 WKNN 的误差下限较小。因此，样本量有限时，WKNN 等传统方法可能比 CNN、Transformer 更合适，这说明算法设计必须考虑数据规模。

**图 13.** 实测场景中各算法性能：（a）误差 CDF；（b）箱线图。  
**表 IV.** 实测场景中各定位算法性能。

### F. 不同频段的影响

在场景 2 以 0.5 m 网格间距，比较 60 GHz 与 5.5 GHz 两个频段。60 GHz 下 IAPM 的 MAE 为 0.17 m、RMSE 为 0.22 m。较短波长提高空间分辨率，有助于更准确地估计 ToA、AoA。在 5.5 GHz 下，各算法精度普遍下降；IAPM 的 MAE 为 0.19 m、RMSE 为 0.33 m，但相较其他算法仍具有优势。较长波长限制空间分辨率，多径参数估计精度降低；同时，5.5 GHz 较强的穿透能力可能使室内多径干扰更加复杂。这表明 IAPM 能跨不同频段保持一定适应性，但高频条件下通常获得更高的定位分辨率。

**图 14.** 5.5 GHz、场景 2、0.5 m 网格间隔时各算法误差 CDF。  
**表 V.** 对应频段与场景中的定位性能比较。

### G. 人员运动的影响

已有不少 FPM 研究没有充分考虑人员运动对鲁棒性的影响：离线指纹数据库通常来自静态环境，但实际室内场景存在大量人员活动，可能显著影响在线预测。因此，本文研究人员运动条件下 FPM 的鲁棒性。

在场景 1 的 LoS 和 NLoS 区域各设置一个 $0.5\ {\rm m}\times0.2\ {\rm m}\times1.7\ {\rm m}$ 的长方体模拟人体活动，重新生成测试数据，其余实验设置与第五节 E.1 相同。图 15 给出加入人员活动后的定位结果。

与图 11(a) 的静态场景比较，所有算法均出现不同程度退化。IAPM 仍优于传统机器学习方法，且接近 SWIN 等先进 DNN 的精度。SWIN 略优于 IAPM，可能得益于其注意力机制对动态信道指纹变化的刻画。值得指出，所有受测算法都使用本文提出的指纹特征，尤其是 MRP 特征；它们在复杂动态环境中表现出的鲁棒性说明，这种特征设计具有实际价值，也能改善其他定位算法。

IAPM 在动态条件下仍有一定退化，因为人员运动造成的 LoS/NLoS 传播路径切换会暂时干扰其识别与定位决策。ACNN、SIABR、SWIN 同样因特征波动而泛化受损。WKNN、SVM、NB 等传统算法则在动态信道下误差增加更为明显；尤其依赖静态先验概率分布的 NB 难以适应环境扰动。因此，动态室内定位需要具备环境自适应能力的特征工程方法。

**图 15.** 场景 1 存在人员运动、网格间隔为 0.5 m 时各算法的误差 CDF。

### H. 参考网格尺寸的影响

数据集规模是影响 FPM 精度的重要因素，参考网格尺寸直接决定数据量。本小节将场景 1 分别划分为 $1{\rm m}\times1{\rm m}$、$0.5{\rm m}\times0.5{\rm m}$ 和 $0.2{\rm m}\times0.2{\rm m}$ 三种网格。

表 VI 显示，网格越细，定位精度越高：MAE 从约 0.4 m 降至 6.7 cm，MaxE 从 3.25 m 降至 0.68 m，误差 CDF 收敛也更快。即使使用 1 m 网格、仅有 240 个训练点，MAE 仍低于 0.41 m，说明 IAPM 有一定鲁棒性。较大网格虽导致最大误差增加，但在 1 m 网格时仍有约 80% 的预测误差在 0.5 m 以内。然而，网格变细也将显著增加训练与在线估计时间，需要在精度和计算耗时之间权衡。

**表 VI.** 不同参考网格尺寸下 IAPM 的定位性能。

### I. 接入点数量与位置的影响

在场景 2 中评价接入点（access points，APs）数量及位置对定位的影响。网格间隔设为 0.2 m，依次加入 1—4 个 AP，其中三个位于边角，从 3 个增加为 4 个时加入中部 AP。

表 VII 表明，AP 数量从 1 增至 4 时，RMSE 从 0.67 m 降至 7.6 cm，MAE 从 0.16 m 降至 5.7 cm，尤其加入中部 AP 后提升明显。表 VIII 进一步显示，不同 AP 位置存在显著差异。位于中央的 AP1 性能最佳：RMSE 0.1 m、MAE 6.7 cm、MaxE 0.68 m。中央位置具有更均衡的信号覆盖，可以降低多径干扰和物理遮挡影响。相较之下，边缘 AP2—AP4 更容易受衰减、墙体和其他障碍物影响，定位精度较低。

仅使用中央 AP 便可达到平均误差 6.7 cm 的厘米级精度，甚至优于一些多 AP 配置。无选择地增加边缘 AP，可能使环境噪声和冗余传播信息增加，反而降低定位可靠性。因此，相比单纯增加 AP 数量，更重要的是合理安排 AP 的位置并优先覆盖关键区域。

**表 VII.** 不同 AP 数量下的定位性能。  
**表 VIII.** 不同 AP 放置位置下的定位性能。

## VI. 结论

本文面向 6G 室内 MIMO 通信，提出新型 CSI 信道指纹结构及 LoS/NLoS 识别辅助定位方法 IAPM。所提指纹结构包括 CIR 重建，以及从 MRP 和时延/角度 PSD 中提取 CSI 指纹特征。IAPM 将 LoS/NLoS 识别模块与 IWRF 结合；IWRF 利用加权预测、自适应 $K$ 和特征选择进一步提高定位性能。

数值结果表明，LoS/NLoS 识别模块对时间相关信道特征更敏感，而定位模块对角度相关特征更敏感。此外，RT 仿真数据与信道实测数据共同验证，所提方法相较现有 FPM 在准确性和鲁棒性方面表现较好。该方法还能在环境发生一定变化时保持稳健，说明即使没有大量训练数据，也具有潜在应用价值。

## 附录 A：原论文表 I—VIII 的逐项数值

为避免在正文叙述中遗漏基线数据，以下按原论文表格顺序逐项转录。误差和标准差单位除特别说明外均为 m。

**表 I　RT 建模参数**

| 参数 | 值 |
|---|---|
| Rx 高度 | 1.5 m |
| Tx 高度 | 2.8 m |
| Tx 位置（场景 1） | (−7.35 m, −7.35 m) |
| Tx 位置（场景 2） | (13.59 m, 14.11 m) |
| 载频 | 60 GHz |
| 带宽 | 3 GHz |
| Rx 天线 | 2 × 2 MIMO 全向天线 |
| Tx 天线 | 4 × 4 MIMO 全向天线 |
| Tx 发射功率 | 23 dBm |

**表 II　不同场景下 IAPM 与 IWRF 性能**

| 场景 | 算法 | MAE | MaxE | RMSE | STD |
|---|---|---:|---:|---:|---:|
| 场景 1 | IWRF | 0.2001 | 3.1196 | 0.3278 | 0.2597 |
| 场景 1 | IAPM | 0.2097 | 2.6713 | 0.3594 | 0.2981 |
| 场景 2 | IWRF | 0.1720 | 0.9256 | 0.2212 | 0.1391 |
| 场景 2 | IAPM | 0.2949 | 7.9759 | 0.8343 | 0.7805 |
| 动态场景 | IWRF | 0.2520 | 3.5737 | 0.4776 | 0.4110 |
| 动态场景 | IAPM | 0.2432 | 3.0364 | 0.4820 | 0.4109 |
| 低频 | IWRF | 0.1971 | 2.7570 | 0.3263 | 0.2600 |
| 低频 | IAPM | 0.1853 | 2.6207 | 0.2830 | 0.2140 |
| 真实实测 | IWRF | 1.4216 | 4.8883 | 1.9607 | 1.3503 |
| 真实实测 | IAPM | 1.3578 | 4.3351 | 1.8315 | 1.2291 |
| 低分辨率 | IWRF | 0.4237 | 9.6172 | 1.0767 | 0.9771 |
| 低分辨率 | IAPM | 0.4468 | 6.8663 | 0.9429 | 0.7856 |

**表 III　60 GHz、0.5 m 网格间隔下算法性能**

| 算法 | 场景 1 MAE | 场景 1 MaxE | 场景 1 RMSE | 场景 1 STD | 场景 2 MAE | 场景 2 MaxE | 场景 2 RMSE | 场景 2 STD |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IAPM | 0.2001 | 3.1196 | 0.3278 | 0.2597 | 0.1720 | 0.9256 | 0.2212 | 0.1391 |
| WRF | 0.3468 | 2.6050 | 0.4728 | 0.3214 | 0.5725 | 12.7283 | 1.3157 | 1.1876 |
| WKNN | 0.4533 | 2.7984 | 0.6104 | 0.4099 | 0.5546 | 5.2529 | 0.7887 | 0.5621 |
| NB | 0.5745 | 5.4137 | 0.8194 | 0.5858 | 0.6730 | 5.4525 | 0.8999 | 0.5989 |
| SVM | 0.6361 | 9.4601 | 1.1282 | 0.9318 | 1.0043 | 5.5206 | 1.3235 | 0.8620 |
| CNN | 0.5541 | 5.1849 | 0.6874 | 0.4076 | 0.5671 | 3.9028 | 0.6911 | 0.3949 |
| ACNN | 0.2295 | 3.6646 | 0.3948 | 0.3220 | 0.2761 | 3.1788 | 0.3814 | 0.2638 |
| SIABR | 0.2238 | 4.0029 | 0.4160 | 0.3515 | 0.2996 | 1.5426 | 0.3563 | 0.1934 |
| SWIN | 0.2153 | 2.3999 | 0.3016 | 0.2136 | 0.2827 | 1.2496 | 0.3325 | 0.1755 |

*原文表 II 中，场景 1 的 IWRF 与 IAPM MAE 分别为 0.2001 m、0.2097 m，场景 2 分别为 0.1720 m、0.2949 m；原文表 III 的 IAPM 行却分别列为 0.2001 m 和 0.1720 m。此外，正文描述动态场景为 IAPM 约 0.25 m、IWRF 约 0.24 m，但表 II 对应数值分别为 0.2432 m 与 0.2520 m，归属反转。这些属于原文内部的对应关系冲突，不能在缺少作者说明时自行确定哪组应被更正；故译稿分别照录并提示。*

**表 IV　真实实测环境中算法性能**

| 算法 | MAE | MaxE | RMSE | STD |
|---|---:|---:|---:|---:|
| IAPM | 1.3578 | 4.3351 | 1.8315 | 1.2291 |
| WRF | 1.8770 | 7.5559 | 2.6482 | 1.9293 |
| WKNN | 2.0085 | 6.3213 | 2.9737 | 2.2649 |
| NB | 4.9639 | 19.4446 | 8.2797 | 6.8441 |
| SVM | 6.2158 | 13.7000 | 7.3022 | 3.8322 |
| CNN | 4.2455 | 12.5720 | 5.4972 | 3.4921 |
| ACNN | 3.4203 | 11.4520 | 5.0562 | 3.8459 |
| SIABR | 3.9861 | 10.2397 | 4.8609 | 2.8732 |
| SWIN | 2.9071 | 11.8487 | 4.5926 | 3.6720 |

**表 V　5.5 GHz、场景 2、0.5 m 网格间隔下算法性能**

| 算法 | MAE | MaxE | RMSE | STD |
|---|---:|---:|---:|---:|
| IAPM | 0.1853 | 2.6207 | 0.2830 | 0.2140 |
| WRF | 0.5775 | 5.2370 | 0.9607 | 0.7697 |
| WKNN | 0.6222 | 5.3578 | 0.8825 | 0.6274 |
| NB | 0.7499 | 5.8565 | 1.0202 | 0.6936 |
| SVM | 1.2547 | 26.2112 | 2.4663 | 2.1233 |
| CNN | 0.4033 | 2.8287 | 0.3608 | 0.2749 |
| ACNN | 0.2904 | 1.8132 | 1.5417 | 0.2146 |
| SIABR | 0.3265 | 4.1586 | 0.4766 | 0.3481 |
| SWIN | 0.3996 | 1.4774 | 0.4635 | 0.2353 |

*表 V 中 ACNN 的 RMSE 为 1.5417，而 MAE 为 0.2904，保留原文数值。*

**表 VI　不同参考网格尺寸下 IAPM 定位性能（原表标题标注仿真场景 2）**

| 网格间距 (m) | MAE | MaxE | RMSE | STD |
|---|---:|---:|---:|---:|
| 1 × 1 | 0.4075 | 3.2459 | 0.5339 | 0.3458 |
| 0.5 × 0.5 | 0.1720 | 0.9256 | 0.2212 | 0.1391 |
| 0.2 × 0.2 | 0.0662 | 0.6809 | 0.1037 | 0.0800 |

*正文 H 小节写“场景 1”，但表 VI 标题写“场景 2”；保留原文两处差异。*

**表 VII　不同 AP 数量下的定位性能（原表标题标注仿真场景 2、0.5 m 网格）**

| AP 数量 | MAE | MaxE | RMSE | STD |
|---|---:|---:|---:|---:|
| 1 | 0.1580 | 8.3963 | 0.6733 | 0.6561 |
| 2 | 0.0777 | 3.4000 | 0.2528 | 0.2411 |
| 3 | 0.0637 | 0.4527 | 0.0827 | 0.0528 |
| 4 | 0.0566 | 0.4221 | 0.0758 | 0.0505 |

**表 VIII　不同 AP 位置下的定位性能（场景 2、0.2 m 网格）**

| AP 位置 | MAE | MaxE | RMSE | STD |
|---|---:|---:|---:|---:|
| AP1（中央） | 0.0662 | 0.6809 | 0.1037 | 0.0800 |
| AP2 | 0.1460 | 9.6613 | 0.7510 | 0.7386 |
| AP3 | 0.0876 | 5.5420 | 0.4022 | 0.3935 |
| AP4 | 0.1605 | 6.1465 | 0.5515 | 0.5290 |

---

## 参考文献（完整编号与中文题名）

以下对应原论文 [1]—[58]，逐条翻译题名并保留书目信息。IEEE、ITU-R 等专有名称使用原文缩写。

[1] S. Kozhaya、Z. M. Kassas，《无线电导航的基础跟踪性能与设计考虑》，*IEEE Journal on Selected Areas in Communications*，42(9)，2395—2409，2024。

[2] M. Neinavaie、Z. M. Kassas，《利用未知 OFDM 信号进行认知感知与导航：在地面 5G 和 Starlink 低轨卫星中的应用》，*IEEE Journal on Selected Areas in Communications*，42(1)，146—160，2024。

[3] F. Liu 等，《通感一体化：迈向面向 6G 及未来的双功能无线网络》，*IEEE Journal on Selected Areas in Communications*，40(6)，1728—1767，2022。

[4] C.-X. Wang 等，《通向 6G：愿景、需求、关键技术与试验平台》，*IEEE Communications Surveys & Tutorials*，25(2)，905—974，2023。

[5] X. You 等，《迈向 6G 无线通信网络：愿景、使能技术与新范式转变》，*Science China Information Sciences*，64(1)，文章 110301，2020。

[6] Z. Xiao、Y. Zeng，《面向 6G 的定位与通信一体化概述》，*Science China Information Sciences*，65(3)，文章 131301，2022。

[7] ITU-R，《面向 2030 年及以后的 IMT 未来发展的框架与总体目标》，ITU 在线报告；原文链接：https://www.itu.int/md/R19-SG05-C-0131 。

[8] C.-X. Wang、J. Bian、J. Sun、W. Zhang、M. Zhang，《5G 信道测量与模型综述》，*IEEE Communications Surveys & Tutorials*，20(4)，3142—3168，2018。

[9] W. Ding、S. Chang、J. Li，《基于 RSS/AoA 混合测量的无线传感器网络新型加权定位方法》，*IEEE Access*，9，150677—150685，2021。

[10] Z. Lin、T. Lv、P. T. Mathiopoulos，《毫米波大规模 MIMO 系统的三维室内定位》，*IEEE Transactions on Communications*，66(6)，2472—2486，2018。

[11] M. Pan 等，《利用 5G 微微蜂窝基站进行室内定位的高效 DOA 与 TOA 联合估计》，*IEEE Transactions on Instrumentation and Measurement*，71，1—19，2022。

[12] L. Chen、X. Zhou、F. Chen、L.-L. Yang、R. Chen，《利用 5G NR 信号的载波相位室内定位测距》，*IEEE Internet of Things Journal*，9(13)，10908—10919，2022。

[13] Z. Liu、L. Chen、X. Zhou、N. Shen、R. Chen，《利用 LTE 信号进行多径跟踪以实现室内定位中的精确 TOA 估计》，*Geo-Spatial Information Science*，26(1)，31—43，2022。

[14] Z. Liu、L. Chen、X. Zhou、Z. Jiao、G. Guo、R. Chen，《基于 5G 信号机器学习的室内定位到达时间估计》，*IEEE Internet of Things Journal*，10(11)，9782—9795，2023。

[15] P. Bahl、V. N. Padmanabhan，《RADAR：基于室内无线射频的用户定位与跟踪系统》，IEEE INFOCOM，775—784，2000。

[16] M. Zhou、X. Li、Y. Wang、S. Li、Y. Ding、W. Nie，《利用高斯核密度估计实现面向 6G 的多源信息融合室内定位》，*IEEE Internet of Things Journal*，8(20)，15117—15125，2021。

[17] S. Huang 等，《用于 5G 物联网的卡尔曼滤波和泛克里金优化指纹室内定位》，*Wireless Communications and Mobile Computing*，2021，文章 9936706。

[18] N. L. Dortz、F. Gain、P. Zetterberg，《采用概率分布比较的 Wi-Fi 指纹室内定位系统》，IEEE ICASSP，2301—2304，2012。

[19] P. Chen、F. Liu、S. Gao、P. Li、X. Yang、Q. Niu，《利用信道状态信息实现基于智能手机的室内指纹定位》，*IEEE Access*，7，180609—180619，2019。

[20] K. Wu、J. Xiao、Y. Yi、M. Gao、L. M. Ni，《FILA：细粒度室内定位》，IEEE INFOCOM，2210—2218，2012。

[21] J. Torres-Sospedra、R. Montoliu、S. Trilles、Ó. Belmonte、J. Huerta，《Wi-Fi 指纹室内定位系统中距离和相似度测度的全面分析》，*Expert Systems with Applications*，42(23)，9263—9278，2015。

[22] R. Zhou、Y. Yang、P. Chen，《用于室内定位的基于 RSS 变换的 WKNN》，*Sensors*，21(17)，5685，2021。

[23] A. Chriki、H. Touati、H. Snoussi，《无线传感器网络中基于支持向量机的室内定位》，IWCMC，1144—1149，2017。

[24] H. Li、J. Su、W. Liu、Y. Zhang、X. Zhou，《麻雀搜索算法优化的支持向量回归室内定位模型》，IDAACS，610—615，2021。

[25] C. Huang 等，《人工智能赋能的通信无线传播——第一部分：信道表征与天线—信道优化》，*IEEE Transactions on Antennas and Propagation*，70(6)，3939—3954，2022。

[26] C. Huang 等，《人工智能赋能的通信无线传播——第二部分：场景识别与信道建模》，*IEEE Transactions on Antennas and Propagation*，70(6)，3955—3969，2022。

[27] M. Chen、U. Challita、W. Saad、C. Yin、M. Debbah，《面向无线网络的基于人工神经网络的机器学习：教程》，*IEEE Communications Surveys & Tutorials*，21(4)，3039—3071，2019。

[28] K. B. Letaief、Y. Shi、J. Lu、J. Lu，《面向 6G 的边缘人工智能：愿景、使能技术与应用》，*IEEE Journal on Selected Areas in Communications*，40(1)，5—36，2022。

[29] X. Wang、X. Wang、S. Mao，《利用 CSI 图像的深度卷积神经网络室内定位》，*IEEE Transactions on Network Science and Engineering*，7(1)，316—327，2020。

[30] G. Cerar、A. Švigelj、M. Mohorčič、C. Fortuna、T. Javornik，《利用卷积神经网络改进基于 CSI 的大规模 MIMO 室内定位》，EuCNC/6G Summit，276—281，2021。

[31] H. Arslantas、S. Okdem，《采用基于自编码器的卷积神经网络进行室内定位》，*IEEE Access*，12，46059—46066，2024。

[32] S. Fan、Y. Wu、C. Han、X. Wang，《SIABR：用于超高精度太赫兹室内定位的结构化内部注意力双向循环深度学习方法》，*IEEE Journal on Selected Areas in Communications*，39(7)，2226—2240，2021。

[33] X. Xu 等，《Swin-Loc：利用 MIMO ISAC 系统的基于 Transformer 的 CSI 指纹室内定位》，*IEEE Transactions on Vehicular Technology*，73(8)，11664—11679，2024。

[34] L. Breiman，《随机森林》，*Machine Learning*，45，5—32，2001。

[35] N. A. Maung Maung、B. Y. Lwi、S. Thida，《采用随机森林分类器增强的 RSS 指纹无线室内定位》，ICAIT，59—63，2020。

[36] X. Guo、N. Ansari、L. Li、H. Li，《利用随机森林融合一组指纹实现室内定位》，*IEEE Internet of Things Journal*，5(6)，4686—4698，2018。

[37] L. Calderoni、M. Ferrara、A. Franco、D. Maio，《在医院环境中使用随机森林分类器进行室内定位》，*Expert Systems with Applications*，42(1)，125—134，2015。

[38] K. Gao、H. Wang、H. Lv、W. Liu，《通过信道频率响应迈向 5G NR 高精度室内定位：新范式与数据集生成方法》，*IEEE Journal on Selected Areas in Communications*，40(7)，2233—2247，2022。

[39] Z. Yun、M. F. Iskander，《用于无线传播建模的射线追踪：原理与应用》，*IEEE Access*，3，1089—1100，2015。

[40] S. Yang、C.-X. Wang、Y. Wang、J. Huang、Y. Zhou、E.-H.-M. Aggoune，《用于 6G 动态射线追踪信道建模的高效预处理方法》，*IEEE Transactions on Vehicular Technology*，74(5)，6941—6953，2025。

[41] P.-H. Tseng、Y.-C. Chan、Y.-J. Lin、D.-B. Lin、N. Wu、T.-M. Wang，《使用信道冲激响应测量的射线追踪辅助指纹室内定位》，*IEEE Transactions on Instrumentation and Measurement*，66(5)，1032—1045，2017。

[42] Y. Li、H. Li、B. Yu、J. Li，《基于 RT-ANN 的室内伪卫星定位 CSI 指纹方法》，*Future Internet*，14(8)，235，2022。

[43] Z. Xing、J. Chen、Y. Tang，《盲校准条件下基于 RSS 定位的联合分割与子空间聚类》，IEEE GLOBECOM，5360—5365，2022。

[44] Z. Xing、J. Chen，《无需位置标签构建基于室内区域的无线电地图》，*IEEE Transactions on Signal Processing*，72，2512—2526，2024。

[45] Z. Xing、W. Zhao，《利用区域信道追踪实现无校准室内定位》，*IEEE Internet of Things Journal*，12(5)，5449—5461，2025。

[46] Y. Wu、Y. Wang、J. Huang、C.-X. Wang、C. Huang，《面向 6G 室内通信的加权随机森林定位算法》，IEEE VTC-Fall，1—6，2022。

[47] ITU-R，《约 100 MHz 以上无线电波传播中建筑材料和建筑结构的影响》，Recommendation ITU-R P.2040-3，2023；原文链接：https://www.itu.int/rec/R-REC-P.2040-3-202308-I/en 。

[48] C.-X. Wang、J. Huang、H. Wang、X. Gao、X. You、Y. Hao，《6G 无线信道测量和模型：趋势与挑战》，*IEEE Vehicular Technology Magazine*，15(4)，22—32，2020。

[49] C.-X. Wang、Z. Lv、X. Gao、X. You、Y. Hao、H. Haas，《面向全频段和全场景 6G GBSM 的泛在无线信道建模理论与应用》，*IEEE Transactions on Vehicular Technology*，71(9)，9159—9173，2022。

[50] C.-X. Wang、Z. Lv、Y. Chen、H. Haas，《6G 泛在信道模型的空时频统计特性完整研究》，*IEEE Transactions on Communications*，71(12)，7273—7287，2023。

[51] L. Zhang 等，《大型室内办公室环境中的多频无线信道测量与表征》，*IEEE Transactions on Antennas and Propagation*，71(6)，5221—5234，2023。

[52] Y. Hu，《无线随机网络中的几何路径损耗分布：理论与应用》，*IEEE Transactions on Information Theory*，70(1)，244—255，2024。

[53] Z. Zhou 等，《用于估计具有天线极化的宽带空间非平稳无线信道参数的新型 SAGE 算法》，*IEEE Transactions on Antennas and Propagation*，71(9)，7457—7472，2023。

[54] Y. Li 等，《基于射线追踪的 6G 工业物联网场景信道建模与特性分析》，IEEE/CIC ICCC，大连，1—6，2023。

[55] P. Tang、J. Zhang、A. F. Molisch、P. J. Smith、M. Shafi、L. Tian，《从单快照宽带测量估计时变衰落的莱斯 K 因子》，*IEEE Transactions on Vehicular Technology*，68(1)，49—63，2019。

[56] C. Huang 等，《在动态环境下为 MIMO 系统启用机器学习的 LoS/NLoS 识别》，*IEEE Transactions on Wireless Communications*，19(6)，3643—3657，2020。

[57] A. Benkessirat、N. Benblidia，《特征选择基础：概述与比较》，AICCSA，1—6，2019。

[58] N. N. Thuy、S. Wongthanavasu，《面向高维混合决策表的新型特征选择方法》，*IEEE Transactions on Neural Networks and Learning Systems*，33(7)，3024—3037，2022。

## 作者简介（原 PDF 第 15—17 页）

**Yang Wu（武阳，IEEE 学生会员）。** 2022 年于南京师范大学获得工学学士学位，2025 年于东南大学获得信息与通信工程硕士学位。研究兴趣包括基于机器学习的室内定位、6G 信道测量、特性分析与建模。

**Cheng-Xiang Wang（IEEE Fellow）。** 1997 年和 2000 年在山东大学获得通信与信息系统学士及硕士学位，2004 年在丹麦奥尔堡大学获得无线通信博士学位。2000—2001 年任汉堡工业大学研究助理，2004 年任西门子移动电话公司访问研究员，2001—2005 年任挪威阿格德大学研究员。2005—2018 年在英国赫瑞瓦特大学工作，并于 2011 年晋升教授。2018 年起任东南大学教授，2020 年 12 月起任信息科学与工程学院院长，原文发表时亦为紫金山实验室教授。著有 4 本专著、3 篇书籍章节以及 640 余篇同行评审期刊与会议论文，其中 IEEE 期刊/杂志论文 240 余篇、高被引论文 29 篇；在国际会议作过 34 次受邀大会报告及 23 次教程报告。研究兴趣包括无线信道测量与建模、6G 无线通信网络以及电磁信息论。

王承祥是欧洲科学院、欧洲科学与艺术院成员，英国爱丁堡皇家学会、IET 及中国通信学会会士；2019—2020 年任 IEEE 通信学会杰出讲师，并于 2017—2020 年入选科睿唯安全球高被引科学家。原文发表时为 *IEEE Transactions on Wireless Communications* 执行编委会委员。2024 年获 IEEE Neal Shepherd Memorial 最佳传播论文奖，并曾在 IEEE GLOBECOM 2010、IEEE ICCT 2011、ITST 2012、IEEE VTC 2013 Spring、IWCMC 2015、IWCMC 2016、IEEE/CIC ICCC 2016、WPMC 2016、WOCC 2019、IWCMC 2020、WCSP 2020、CSPS 2021、WCSP 2021、IEEE/CIC ICCC 2022、IEEE ICCT 2023、WCSP 2024、IEEE/CIC ICCC 2024、IEEE ICC 2025 等会议获得共 19 项最佳论文奖。曾担任 30 余次国际会议的技术程序委员会主席和大会主席，在 10 余种国际期刊担任编辑，包括 *IEEE Transactions on Wireless Communications*（2007—2009）、*IEEE Transactions on Vehicular Technology*（2011—2017）和 *IEEE Transactions on Communications*（2015—2017）。曾担任 *IEEE Journal on Selected Areas in Communications* 关于车联网、频谱及能量高效无线网络、空中通信网络专刊的客座编辑，也担任过 *IEEE Transactions on Big Data* 无线大数据专刊的客座编辑，并任 *IEEE Transactions on Cognitive Communications and Networking* 关于 5G 及未来智能资源管理专刊的客座编辑。

**Chen Huang（IEEE 会员）。** 2021 年于北京交通大学获得博士学位，2018—2020 年曾在美国南加利福尼亚大学以及比利时鲁汶天主教大学访问。2021 年 4 月至 2023 年 4 月在紫金山实验室泛在通信研究中心及东南大学移动通信国家重点实验室担任博士后研究人员；2023 年 4 月起任紫金山实验室副研究员及东南大学移动通信国家重点实验室校外导师。参与编写 1 篇著作章节，已发表或合作发表 60 余篇期刊及会议论文、拥有 17 项专利。研究兴趣包括 6G 信道测量、特性分析与建模、基于机器学习的信道预测及定位。他是 IEEE GLOBECOM、ICC、VTC 等多个会议的技术程序委员会委员，曾入选中国科协青年人才托举工程和江苏省优秀博士后项目；曾获 IEEE/CIC ICCC 2024、IEEE ICCT 2023、WCSP 2018、IEEE/CIC ICCC 2018 共四项最佳论文奖，并任 *IEEE Transactions on Vehicular Technology* 副编辑。

**Junling Li（IEEE 会员）。** 2013 年于天津大学获学士学位，2016 年于北京邮电大学获硕士学位，2020 年于加拿大滑铁卢大学电子与计算机工程系获博士学位。2020—2022 年在深圳人工智能与机器人研究院、滑铁卢大学及香港中文大学（深圳）联合开展博士后研究。原文发表时任东南大学移动通信国家重点实验室副教授。研究兴趣包括数字孪生、信道建模、博弈论和基于机器学习的信道预测。曾获 IEEE ICCC 2019、ICCT 2023 和 ICC 2025 最佳论文奖。

**Li Zhang（IEEE 学生会员）。** 2019 年于湖南大学获得工学学士学位，2025 年于东南大学获得信息与通信工程博士学位。研究兴趣包括室内信道测量、信道特性分析与建模。

**El-Hadi M. Aggoune（IEEE 终身高级会员）。** 在美国华盛顿大学获得电气工程硕士及博士学位，曾在美国及其他国家多所大学讲授电气工程本科和研究生课程，历任不同教职，包括讲席教授。作为发明人参与两项由美国波音公司及沙特阿拉伯塔布克大学传感器网络与蜂窝系统研究中心持有的专利，并在其他企业的专利中获得引用。现为美国华盛顿州注册专业工程师、塔布克大学教授及传感器网络与蜂窝系统研究中心主任。发表多篇 IEEE 及其他期刊和会议论文，研究兴趣包括无线传感器网络、能源系统与科学可视化；其一所实验室曾获波音供应商卓越奖。曾获华盛顿大学 IEEE 分会年度教授奖，亦参与多项国际会议的技术委员会和期刊评审工作。

**Yunfei Chen（IEEE 高级会员）。** 1998 年与 2001 年在上海交通大学获得电子工程学士及硕士学位，2006 年在加拿大阿尔伯塔大学获博士学位。原文发表时任英国杜伦大学工程系教授。研究兴趣包括无线通信、性能分析、雷达与通信联合设计、认知无线电、无线中继以及能量采集。

**译稿校对状态：** 已覆盖 58 条参考文献的中文题名及书目信息、八张实验数据表。部分原文公式的隐含假设、图中文字及作者简介仍在终校，未标记全文验收通过。

{% endraw %}
