---
layout: page
title: "面向分区 IRS 辅助移动物联网上行链路的预测感知结构化资源控制与半盲级联信道获取｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-26601-prediction-aware-structured-resource-control-for-partitioned-irs-assis/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a9958f412dc97b7a/) · [原文 arXiv](https://arxiv.org/abs/2609.26601) · [全部目录](/papers/catalog/)

# 面向分区 IRS 辅助移动物联网上行链路的预测感知结构化资源控制与半盲级联信道获取

**原题：** Prediction-Aware Structured Resource Control for Partitioned IRS-Assisted Mobile IoT Uplinks With Semi-Blind Cascaded-Channel Acquisition  
**作者：** Hediyeh Soltanizadeh、Ardavan Rahimian（Senior Member, IEEE）  
**单位：** H. Soltanizadeh 为伊朗科技大学（Iran University of Science and Technology, IUST）电气工程学院，德黑兰，伊朗；A. Rahimian（通讯作者）为英国阿尔斯特大学（Ulster University）工程学院，贝尔法斯特 BT15 1AP。  
**版本：** arXiv:2609.26601v1，2026 年 9 月 22 日，原文 18 页。  
**范围与状态：** 全文中文译稿：摘要、第 I—XIII 节（含各 A/B/C 小节、算法 1—2、命题 1、定理 1、推论 1）、结论、图 1—8 图注、表 I—II 逐格转录、参考文献 [1]—[28]（英文原条目，按原编号）均按原文结构录入。原文（arXiv 版）不含附录与作者简介，本页亦不含；逐句逐式终校未做。

## 摘要

智能反射面（intelligent reflecting surface, IRS）辅助的移动物联网（Internet of Things, IoT）上行链路，需要联合控制信道老化、代价高昂的级联信道状态信息（channel state information, CSI）获取，以及相互耦合的 IRS 与无线资源。本文针对分区 IRS 辅助的大规模多输入多输出（massive multiple-input multiple-output, mMIMO）上行链路，提出一套统一的预测感知确定性框架。直达信道以递归方式跟踪，级联信道则通过差分半盲获取进行选择性刷新——在最小反射基线态与离散 Fourier 变换（discrete Fourier transform, DFT）编码的 IRS 状态之间复用同一段未知数据块。此外，有限块长度的获取协方差用于初始化降阶波束域预测：在线阶段只传播单位波束的均值，并按龄期从预先计算的表中检索协方差。本文建立混合整数非凸优化表述，涵盖净吞吐量、公平性、中断、不确定性、切换代价与滑动窗口 IRS 服务。因果控制器集成了协方差底的可执行性、可行的等尺寸粒度、残差可行的归属、孤立波束的单轮扫描精化、同块新鲜载荷计费，以及基于重算的不确定性感知迫零（zero-forcing, ZF）速率与双向接收机一致风险的服务优先分配。理论分析给出服务可行性保持、有效信道误差界、无分布可靠性界，以及多项式级在线复杂度。在未见环境中，预测的获取底与实际半盲误差一致，可执行性重标定使平均重标定率降低 31.5%，IRS 辅助控制相对仅直达传输获得 14.09% 的平均净速率增益。接收机一致分配提高了实得速率；消融结果支持等尺寸分区与单轮扫描精化；在标称、移动性与负载压力条件下均未出现动作后服务违约。

**索引词：** 信道分配（channel allocation）、信道预测（channel prediction）、智能反射面（intelligent reflecting surface, IRS）、物联网（Internet of Things）、IRS 分区（IRS partitioning）、大规模 MIMO（massive MIMO）、半盲信道获取（semi-blind channel acquisition）、不确定性感知资源控制（uncertainty-aware resource control）、无线系统（wireless systems）。

## I. 引言

移动与车载物联网（IoT）应用的持续增长，要求无线网络能够高效适应用户移动性、动态传播环境与有限的无线资源，同时保持可靠连接 [1]、[2]。大规模多输入多输出（mMIMO）通过空间复用、相干波束成形和有效的干扰管理，是满足上述需求的有前景的使能技术 [3]。智能反射面（IRS）则利用大量近乎无源的反射单元智能地重定向信号、改善覆盖，而无需为每个单元配置独立的射频（radio frequency, RF）链，因而是一种互补方案。把 IRS 与 mMIMO 集成，可对无线传播环境进行自适应控制，为更高效的干扰管理和更高的链路可靠性提供额外空间自由度 [4]、[5]。

然而，mMIMO 辅助 IRS 带来的性能增益高度依赖准确、及时的信道状态信息（CSI）。在移动 IoT 场景中，由于信道老化、导频受限以及级联 IRS 信道维数巨大，CSI 的维持依然困难 [6]。当信道估计在移动或车载场景中迅速过时，基于陈旧 CSI 的资源分配决策可能出现显著性能下降。IRS 辅助系统中这一困难更为突出：无源 IRS 没有专用 RF 链用于发送导频或处理基带观测，级联信道的维数随反射单元数增长，会带来可观的训练开销。在移动或密集环境中，快速信道变化、信道老化、拓扑变化与导频稀缺，要求对活跃与非活跃设备都采用递归结合历史 CSI 与当前观测的移动性感知跟踪方法 [7]—[10]。现有 CSI 获取方法主要面向静态或慢变场景；当需要同时处理用户移动性、选择性级联 CSI 刷新与多用户 IRS 共享时，它们会越来越低效。

近期 IRS 研究越来越多地关注移动条件下维持级联信道时的 CSI 开销与信道老化。文献 [11] 研究了带显式精度—开销折中的单条 IRS 信道获取；文献 [12] 利用 IRS—BS 链路的慢变特性提出双时间尺度估计器。文献 [13] 利用多用户级联信道结构降低估计与反馈开销；文献 [14] 把降维估计与快衰落、信道老化下的信道预测相结合；文献 [15] 进一步研究了不完美 CSI 下的双时间尺度大规模 MIMO 运行。更近期的工作中，文献 [16] 在端到端 IRS 框架内联合优化 CSI 获取、反馈与主/被动波束成形，使信道获取更贴近后续通信设计；文献 [17] 使用有界与统计 CSI 误差模型，研究了高移动性与不完美级联 CSI 下的鲁棒 IRS 辅助传输。这些研究推动了结构化时域 CSI 处理与不确定性感知设计，但没有联合处理选择性级联 CSI 刷新、降阶后验传播与因果多用户资源控制。

半盲与数据辅助方法为降低训练开销提供了途径。文献 [18] 联合利用导频与数据符号进行半盲反射信道估计；文献 [19] 研究了联合信道与发送符号的数据辅助恢复；文献 [20] 研究了多 IRS MIMO 的联合半盲信道估计与符号检测。这些方法主要针对信道恢复精度和导频削减，没有把有限块获取不确定性显式连接到降阶预测、选择性 CSI 刷新，以及同一物理块内重标定所引入的载荷代价。

IRS 辅助多用户系统的资源控制已从多个维度得到研究，包括表面分区、不完美 CSI、公平性与长期服务约束。文献 [21] 研究 IRS 分区与多用户调度的联合设计；文献 [22] 考虑完美与不完美 CSI 下的离散相位资源分配；文献 [23] 处理队列稳定性要求下的长期信道分配与 IRS 配置；文献 [24] 在有界 CSI 不确定性下提出兼顾地理公平、服务可用性与最差情况服务质量（quality of service, QoS）的鲁棒多 IRS 设计。更近期地，文献 [25] 在多 BS 毫米波网络中直接利用上行导频，联合优化负载均衡的用户关联、BS 波束成形与 IRS 相位控制，从而绕过显式 CSI 重建。尽管这些研究覆盖了分区、鲁棒分配、公平性、队列稳定性与负载均衡等重要方面，它们没有把选择性级联 CSI 刷新及其同块载荷代价，与降阶不确定性传播、服务可行的 IRS 共享、波束精化和接收机一致的共信道分配联合耦合起来。

最接近的系统级基线是文献 [26] 的移动性感知 IRS 辅助上行框架，它结合了有限分辨率 IRS 聚焦、逆速率用户优先级排序，以及基于顺序能量检测的信道分配。但其 IRS 控制局限于单用户聚焦，CSI 演化被简化，上行信道分配依赖基于感知的启发式规则。受这些局限启发，本文为分区 IRS 辅助移动 mMIMO IoT 上行链路提出统一的预测感知确定性框架，集选择性级联 CSI 刷新、服务可行的多用户 IRS 共享与接收机一致的上行分配于一体。主要贡献如下。

1. **移动性感知获取**：把递归直达信道跟踪与差分半盲级联信道重标定相结合。在最小反射基线态与 DFT 编码 IRS 状态下复用同一段未知数据块，在恢复级联信道之前先消去直达分量。锚点失配分析解释了由此产生的跨用户误差底，离线有限块协方差则用于初始化波束域后验不确定性。
2. **降阶波束域预测器**：在固定的基本 IRS 单元上构造。在线阶段只传播 $M$ 维的单位波束均值，按龄期从预计算表中检索误差协方差，以形成不确定性感知的有效信道与迫零（ZF）速率，避免传播完整的 $MN$ 维协方差。该不确定性模型用经验预测误差进行了验证。
3. **混合整数非凸表述**：涵盖净吞吐量、公平性、中断、预测不确定性、IRS 切换代价与滑动窗口服务。其确定性实现结合了协方差底可执行性、可行的等尺寸粒度、残差可行归属，以及孤立波束初始化加一次坐标扫描。消融实验支持等尺寸与单轮扫描的取舍优于更复杂的替代方案。
4. **全时隙控制器**：通过同块新鲜载荷计费计入重标定开销，并保持滑动窗口 IRS 服务。上行信道以服务优先顺序分配，使用重算的不确定性感知 ZF 速率与双向接收机一致风险，在不做穷举式预测速率选择的情况下优于仅按速率分配。
5. **理论研究**：建立 IRS 服务可行性及其顺序保持性、有效信道预测误差界与无分布可靠性界；复杂度分析表明在线复杂度为多项式级。在未见环境中，可执行性重标定使平均重标定率降低 31.5%，IRS 辅助控制相对仅直达传输获得 14.09% 的平均净速率增益，且在标称、移动性或负载压力条件下均未出现动作后服务违约。

## II. 系统模型

考虑单小区 mMIMO 系统：$M$ 根天线的基站（base station, BS）以时分双工方式服务 $Z$ 个单天线移动 IoT 用户。由于用户数超过可用正交导频序列数 $\tau$，每条导频序列分配给一组 $K=Z/\tau$ 个用户，假设 $K$ 为整数。不同导频组的用户可由导频正交性分离，因此分析可限于分配导频序列 $\boldsymbol\phi_1\in\mathbb C^{\tau_p\times1}$ 的第一组 $K$ 个用户 $\mathcal K=\{1,2,\ldots,K\}$。虽然该表述适用于一个相干频带上的 MIMO-OFDM 系统，它同样可等价表示窄带单载波系统。

每个用户在每一时隙独立决定是否发送其分配的导频。令 $b_t^{(k)}\in\{0,1\}$ 表示用户 $k$ 的导频活跃指示：若时隙 $t$ 发送导频则 $b_t^{(k)}=1$，否则为 0。定义导频活跃用户集合

$$
\mathcal D_t\triangleq\left\{k\in\mathcal K:\ b_t^{(k)}=1\right\}.
$$

BS 在信道估计前通过协调随机接入协议识别 $\mathcal D_t$，并假设被调度的数据用户集合与 $\mathcal D_t$ 一致。由于本文考虑高速率 IoT 场景，全文假设 $\mathcal D_t\neq\emptyset$。

系统还包含具有 $N$ 个反射单元的全无源 IRS。令 $\mathcal N=\{1,\ldots,N\}$ 与 $\mathcal C=\{1,\ldots,C\}$ 分别表示 IRS 单元集合与正交上行信道集合。用户 $k$ 在时隙 $t$ 分配到的上行信道记为 $c_t^{(k)}$。令 $\mathbf h_t^{d,(k)}\in\mathbb C^{M\times1}$ 为用户 $k$ 到 BS 的直达信道，$\mathbf g_t^{I,(k)}\in\mathbb C^{N\times1}$ 为用户到 IRS 的信道，$\mathbf G_t^B\in\mathbb C^{M\times N}$ 为 IRS 到 BS 的信道，$k=1,\ldots,K$（见图 1）。IRS—BS 信道对所有用户相同，而直达信道与用户—IRS 信道随用户而异。由于 IRS 完全无源，BS 只能通过级联响应观测用户—IRS 与 IRS—BS 链路，而不能把它们作为可分别辨识的信道。对用户 $k$，跨 $N$ 个 IRS 单元的级联信道定义为

$$
\mathbf L_t^{(k)}\triangleq\mathbf G_t^B\operatorname{diag}\left(\mathbf g_t^{I,(k)}\right)\in\mathbb C^{M\times N},\tag{1}
$$

其中 $\mathbf L_t^{(k)}=\left[\mathbf l_{1,t}^{(k)},\ldots,\mathbf l_{N,t}^{(k)}\right]$，且 $\mathbf l_{n,t}^{(k)}=\left[\mathbf G_t^B\right]_{:,n}\left[\mathbf g_t^{I,(k)}\right]_n\in\mathbb C^{M\times1}$。所提半盲获取框架直接估计 $\mathbf L_t^{(k)}$，而非分别估计 $\mathbf G_t^B$ 与 $\mathbf g_t^{I,(k)}$。

直达信道服从 $\mathbf h_t^{d,(k)}\sim\mathcal{CN}\left(\mathbf 0,d_t^{d,(k)}\mathbf I_M\right)$，其中 $d_t^{d,(k)}$ 为直达链路的慢时间尺度大尺度衰减，计入路径损耗变化与阴影衰落。遵循常规 mMIMO 假设，直达用户信道在 BS 阵列上具有有利传播性质，且直达信道与级联分量渐近不相关。对 $i\neq k$，直达用户信道满足

$$
\frac1M\left(\mathbf h_t^{d,(i)}\right)^{H}\mathbf h_t^{d,(k)}
\xrightarrow[M\to\infty]{\mathrm{a.s.}}0,\tag{2}
$$

$$
\frac1M\left(\mathbf h_t^{d,(k)}\right)^{H}\mathbf h_t^{d,(k)}
\xrightarrow[M\to\infty]{\mathrm{a.s.}}d_t^{d,(k)}.\tag{3}
$$

此外，对任意 $i$、$k$ 与 $n\in\mathcal N$，

$$
\frac1M\left(\mathbf l_{n,t}^{(i)}\right)^{H}\mathbf h_t^{d,(k)}
\xrightarrow[M\to\infty]{\mathrm{a.s.}}0.\tag{4}
$$

这些性质支持在第四节 A 部分把跟踪得到的直达信道矩阵用作多用户锚点：基线与差分观测被用来分离各用户特有的级联响应。

为刻画用户移动性引起的直达信道时间演化，采用文献 [27] 的一阶 Gauss–Markov 模型：

$$
\mathbf h_t^{d,(k)}
=\mathbf A_t^{d,(k)}\mathbf h_{t-1}^{d,(k)}+\mathbf u_t^{d,(k)},\tag{5}
$$

其中 $\mathbf A_t^{d,(k)}$ 为时间相关矩阵，$\mathbf u_t^{d,(k)}\sim\mathcal{CN}\left(\mathbf 0,\mathbf Q_t^{d,(k)}\right)$ 为信道状态噪声，用于建模小尺度衰落。矩阵 $\mathbf A_t^{d,(k)}$ 与 $\mathbf Q_t^{d,(k)}$ 由长期信道统计得到，并与边际协方差 $d_t^{d,(k)}\mathbf I_M$ 保持一致。令 $\mathbf Y_t$ 表示 BS 处的接收导频矩阵。为抑制属于其他组的用户贡献，接收导频矩阵被投影到分配给第 1 组的正交导频序列上：

$$
\mathbf y_t=\mathbf Y_t\boldsymbol\phi_1
=\sum_{k\in\mathcal D_t}\mathbf h_t^{d,(k)}+\mathbf v_t,\tag{6}
$$

其中 $\mathbf v_t=\mathbf V_t\boldsymbol\phi_1\sim\mathcal{CN}\left(\mathbf 0,\mathbf R_t\right)$。利用截至时隙 $t$ 收集的全部导频观测，BS 更新活跃用户的信道，同时预测非活跃用户的信道。

直达信道与级联信道被分别处理，因为它们遵循不同的观测模型。第 III 节使用最优协调接入（optimal coordinated-access, O-CA）算法从导频观测中跟踪直达信道；第 IV 节则从最小反射基线与 DFT 编码 IRS 状态下采集的重复未知载荷块中获取级联信道。因此，基线相减在观测层面直接消去直达分量，之后才恢复级联信道。重标定只在选定时隙执行；两次重标定之间，级联状态由预测传播。

> **注 1：** 对标量度量 $x_t$，截断训练统计归一化定义为
>
> $$
> \mathcal N_x(x_t)\triangleq\left[\frac{x_t-x^{\mathrm{tr}}_{\min}}{x^{\mathrm{tr}}_{\max}-x^{\mathrm{tr}}_{\min}+\epsilon_x}\right]_0^1,\tag{7}
> $$
>
> 其中 $[u]_0^1\triangleq\min\{1,\max\{0,u\}\}$，$\epsilon_x>0$，且训练统计在验证与测试阶段保持不变。

## III. 低复杂度直达信道跟踪

在直达信道导频阶段，IRS 工作于最小反射态，$\mathcal D_t$ 中的活跃用户发送导频序列 $\boldsymbol\phi_1$。O-CA 算法用于递归跟踪直达的用户—BS 信道，其预测作为后续级联信道获取与资源优化过程的先验信息。按照文献 [28]，O-CA 为每个用户计算 $M\times1$ 的信道状态以及 $M\times M$ 的协方差与互协方差矩阵，从而避免直接操作 $KM\times KM$ 的大协方差矩阵。O-CA 算法包含以下两步。

**预测步。** 对每一对用户 $k,l=1,\ldots,K$ 且 $k\neq l$，预测方程为

$$
\hat{\mathbf h}_{t|t-1}^{d,(k)}=\mathbf A_t^{d,(k)}\hat{\mathbf h}_{t-1|t-1}^{d,(k)},\tag{8}
$$

$$
\mathbf P_{t|t-1}^{d,(k,k)}=\mathbf A_t^{d,(k)}\mathbf P_{t-1|t-1}^{d,(k,k)}\left(\mathbf A_t^{d,(k)}\right)^{H}+\mathbf Q_t^{d,(k)},\tag{9}
$$

$$
\mathbf P_{t|t-1}^{d,(k,l)}=\mathbf A_t^{d,(k)}\mathbf P_{t-1|t-1}^{d,(k,l)}\left(\mathbf A_t^{d,(l)}\right)^{H}.\tag{10}
$$

具体而言，互协方差矩阵刻画了共享同一导频序列的用户之间因导频碰撞而产生的统计耦合。

**校正步。** 对每个活跃用户 $k\in\mathcal D_t$，信道状态与协方差矩阵更新为

$$
\hat{\mathbf h}_{t|t}^{d,(k)}=\hat{\mathbf h}_{t|t-1}^{d,(k)}+\mathbf K_t^{(k)}\left(\mathbf y_t-\sum_{j\in\mathcal D_t}\hat{\mathbf h}_{t|t-1}^{d,(j)}\right),\tag{11}
$$

$$
\begin{aligned}
\mathbf P_{t|t}^{d,(k,k)}={}&\mathbf P_{t|t-1}^{d,(k,k)}+\mathbf K_t^{(k)}\boldsymbol\Upsilon_t\left(\mathbf K_t^{(k)}\right)^{H}+\mathbf K_t^{(k)}\mathbf R_t\left(\mathbf K_t^{(k)}\right)^{H}\\
&-\sum_{j\in\mathcal D_t}\mathbf P_{t|t-1}^{d,(k,j)}\left(\mathbf K_t^{(k)}\right)^{H}-\mathbf K_t^{(k)}\sum_{n\in\mathcal D_t}\mathbf P_{t|t-1}^{d,(n,k)},
\end{aligned}\tag{12}
$$

$$
\begin{aligned}
\mathbf P_{t|t}^{d,(k,l)}={}&\mathbf P_{t|t-1}^{d,(k,l)}-\sum_{m\in\mathcal D_t}\mathbf P_{t|t-1}^{d,(k,m)}\left(\mathbf K_t^{(l)}\right)^{H}-\mathbf K_t^{(k)}\sum_{n\in\mathcal D_t}\mathbf P_{t|t-1}^{d,(n,l)}\\
&+\mathbf K_t^{(k)}\boldsymbol\Upsilon_t\left(\mathbf K_t^{(l)}\right)^{H},
\end{aligned}\tag{13}
$$

其中 $\boldsymbol\Upsilon_t\triangleq\sum_{i\in\mathcal D_t}\sum_{j\in\mathcal D_t}\mathbf P_{t|t-1}^{d,(i,j)}$，活跃用户 $k\in\mathcal D_t$ 的 O-CA 增益为 $\mathbf K_t^{(k)}=\sum_{j\in\mathcal D_t}\mathbf P_{t|t-1}^{d,(k,j)}\left(\boldsymbol\Upsilon_t+\mathbf R_t\right)^{-1}$。

> **注 2：** 在时不变状态空间与观测噪声统计下，O-CA 的协方差矩阵与估计增益有界，并收敛到稳态矩阵 [28]，因此可以离线预计算。

O-CA 跟踪器只估计直达信道。所得估计堆叠为 $\hat{\mathbf H}_{t|t}^{d}$，并在第 IV-A 节的差分半盲获取中用作多用户直达信道锚点。

## IV. 半盲级联信道获取与波束域跟踪

O-CA 跟踪器为半盲级联信道获取提供所需的直达信道估计。每个时隙包含 $S$ 个符号，并建模为一个相干块。当时隙 $t$ 触发重标定时，在 $\tau_p$ 符号的直达信道导频之后，所有活跃用户在一个最小反射基线与 $N$ 个 DFT 编码 IRS 状态下重复发送同一段未知的 $\alpha$ 符号载荷。剩余常规数据区间长度为 $\beta=S-\tau_p-\alpha(N+1)>0$。基线相减在级联信道恢复之前消去直达分量，随后逐元素后验被投影到第 IV-C 节的降阶波束域状态。未触发重标定时，现有级联状态仅由预测传播。

### A. 差分重复数据获取

令 $\mathbf X_t=\operatorname{row}_{k\in\mathcal D_t}\left\{\mathbf x_t^{(k)}\right\}\in\mathbb C^{|\mathcal D_t|\times\alpha}$ 表示活跃用户发送的未知载荷块。其各行零均值、跨用户相互独立，并满足 $\mathbb E\left[\mathbf X_t\mathbf X_t^{H}\right]=\alpha\sigma_x^2\mathbf I$。同一 $\mathbf X_t$ 实现会在所有获取配置中重复使用。在基线块期间，IRS 置于最小反射态，在获取实现中建模为零反射。记 $\mathbf H_t^{d}=\left[\mathbf h_t^{d,(k)}\right]_{k\in\mathcal D_t}$，接收到的基线块为 $\mathbf Y_{t,0}=\mathbf H_t^{d}\mathbf X_t+\mathbf N_{t,0}$。令 $\mathbf F_N=[\mathbf f_1,\ldots,\mathbf f_N]\in\mathbb C^{N\times N}$ 为单位模 DFT 图样矩阵，其中 $[\mathbf F_N]_{n,p}=\exp\left(-j\frac{2\pi(n-1)(p-1)}{N}\right)$，且 $\mathbf F_N\mathbf F_N^{H}=N\mathbf I_N$。对编码态 $p=1,\ldots,N$，定义 $\mathbf C_{t,p}=\left[\mathbf L_t^{(k)}\mathbf f_p\right]_{k\in\mathcal D_t}$。相应的接收块为

$$
\mathbf Y_{t,p}=\left(\mathbf H_t^{d}+\mathbf C_{t,p}\right)\mathbf X_t+\mathbf N_{t,p},\qquad p=1,\ldots,N.\tag{14}
$$

假设直达与级联信道在时隙 $t$ 内的导频、基线以及全部 $N$ 个编码获取块上保持恒定。由于所有配置复用同一未知载荷实现，相减基线即可在观测层面消去直达信道：

$$
\Delta\mathbf Y_{t,p}\triangleq\mathbf Y_{t,p}-\mathbf Y_{t,0}=\mathbf C_{t,p}\mathbf X_t+\Delta\mathbf N_{t,p},\tag{15}
$$

其中 $\Delta\mathbf N_{t,p}=\mathbf N_{t,p}-\mathbf N_{t,0}$。因此，直达信道项是在级联信道恢复之前被消去的，而不是通过相减两个分别估计的信道来实现。记 $\hat{\mathbf H}_{t|t}^{d}=\left[\hat{\mathbf h}_{t|t}^{d,(k)}\right]_{k\in\mathcal D_t}$，$\hat{\mathbf R}_t\triangleq\left(\hat{\mathbf H}_{t|t}^{d}\right)^{H}\hat{\mathbf H}_{t|t}^{d}$，$\nu\triangleq\sigma_n^2/\sigma_x^2$。假设 $|\mathcal D_t|\leqslant M$ 且 $\hat{\mathbf H}_{t|t}^{d}$ 列满秩，从而 $\hat{\mathbf R}_t$ 非奇异。各获取配置的接收噪声矩阵相互独立，其列独立服从 $\mathcal{CN}\left(\mathbf 0,\sigma_n^2\mathbf I_M\right)$。利用基线观测估计归一化经验用户数据协方差矩阵：

$$
\mathbf Z_{t,0}=\left(\hat{\mathbf R}_t\right)^{-1}\left(\hat{\mathbf H}_{t|t}^{d}\right)^{H}\mathbf Y_{t,0},\qquad
\hat{\mathbf S}_{X,t}=\frac{\mathbf Z_{t,0}\mathbf Z_{t,0}^{H}}{\alpha\sigma_x^2}-\nu\hat{\mathbf R}_t^{-1}.\tag{16}
$$

求逆之前，$\hat{\mathbf S}_{X,t}$ 先做 Hermitian 对称化，并利用小幅特征值下限投影到正定锥以保证数值稳定。对编码态 $p$，级联响应估计为

$$
\hat{\mathbf C}_{t,p}=\left(\frac{\Delta\mathbf Y_{t,p}\mathbf Y_{t,0}^{H}\hat{\mathbf H}_{t|t}^{d}}{\alpha\sigma_x^2}+\nu\hat{\mathbf H}_{t|t}^{d}\right)\hat{\mathbf R}_t^{-1}\hat{\mathbf S}_{X,t}^{-1}.\tag{17}
$$

对用户 $k$，收集 $\hat{\mathbf C}_t^{(k)}=\left[\hat{\mathbf c}_{t,1}^{(k)},\ldots,\hat{\mathbf c}_{t,N}^{(k)}\right]$。$\nu\hat{\mathbf H}_{t|t}^{d}$ 项补偿了包含在 $\Delta\mathbf N_{t,p}=\mathbf N_{t,p}-\mathbf N_{t,0}$ 中的基线噪声分量。由于 $\mathbf C_t^{(k)}=\mathbf L_t^{(k)}\mathbf F_N$，逐元素的半盲估计可由逆 DFT 得到：

$$
\hat{\mathbf L}_t^{SB,(k)}=\frac1N\hat{\mathbf C}_t^{(k)}\mathbf F_N^{H}.
$$

> **注 3：** 虽然式（15）消去了瞬时直达分量，但仍需要 O-CA 估计，以便通过基线观测分离重复的多用户数据。定义直达锚点混合矩阵 $\mathbf A_t^{anc}\triangleq\left(\left(\hat{\mathbf H}_{t|t}^{d}\right)^{H}\hat{\mathbf H}_{t|t}^{d}\right)^{-1}\left(\hat{\mathbf H}_{t|t}^{d}\right)^{H}\mathbf H_t^{d}$。假设 $\mathbf A_t^{anc}$ 非奇异，则第 $p$ 个 DFT 状态估计的大样本、无噪声极限为 $\hat{\mathbf C}_{t,p}\to\mathbf C_{t,p}\left(\mathbf A_t^{anc}\right)^{-1}$。因此，即使有限样本误差与接收噪声误差都消失，直达锚点失配仍会产生不消失的跨用户混合底。对完美锚点 $\hat{\mathbf H}_{t|t}^{d}=\mathbf H_t^{d}$，有 $\mathbf A_t^{anc}=\mathbf I$，该误差底消失。

### B. 半盲后验初始化

对重标定时隙 $t_r$，定义半盲估计误差 $\tilde{\mathbf e}_L^{(k)}=\mathbf L_{t_r}^{(k)}-\hat{\mathbf L}_{t_r}^{SB,(k)}$。其协方差为 $\mathbf C_{SB}^{(k)}\triangleq\mathbb E\left[\operatorname{vec}\left(\tilde{\mathbf e}_L^{(k)}\right)\operatorname{vec}\left(\tilde{\mathbf e}_L^{(k)}\right)^{H}\right]\in\mathbb C^{MN\times MN}$，期望对信道实现、发送数据与接收噪声取。$\mathbf C_{SB}^{(k)}$ 由重复获取试验估计得到，涵盖有限块恢复误差、接收噪声、直达信道锚点误差以及正则化数据协方差估计的影响；它离线计算，在线控制期间保持不变。

重标定之后，全状态后验初始化为 $\hat{\mathbf L}_{t_r|t_r}^{(k)}=\hat{\mathbf L}_{t_r}^{SB,(k)}$、$\hat{\mathbf s}_{t_r|t_r}^{(k)}=\operatorname{vec}\left(\hat{\mathbf L}_{t_r}^{SB,(k)}\right)$，以及 $\mathbf P_{t_r|t_r}^{(k,k)}=\mathbf C_{SB}^{(k)}$。跨用户混合对每个用户边际获取误差的影响由 $\mathbf C_{SB}^{(k)}$ 经验性地刻画。后续预测阶段不传播跨用户误差互协方差。

令 $\left\{\mathcal N_u^{e}\right\}_{u=1}^{U}$ 为 IRS 向连续基本单元的一个固定有序划分，独立于动态控制分区，满足 $\mathcal N_u^{e}\cap\mathcal N_v^{e}=\emptyset$（$u\neq v$）且 $\bigcup_{u=1}^{U}\mathcal N_u^{e}=\mathcal N$。令 $\mathcal V=\left\{\mathbf v_q\right\}_{q=1}^{Q}$ 表示有限的 IRS 控制码本，其相位量化在第 V 节给出。定义 $\tilde{\mathbf e}_{u,q}^{v}\triangleq\mathbf 1_{\mathcal N_u^{e}}\odot\mathbf v_q$，它保留 $\mathbf v_q$ 在 $\mathcal N_u^{e}$ 上的元素、其余位置为零。后验波束域状态为 $\mathbf r_{u,t_r|t_r}^{(k)}(q)=\hat{\mathbf L}_{t_r}^{SB,(k)}\tilde{\mathbf e}_{u,q}^{v}=\hat{\mathbf L}_{t_r}^{SB,(k)}\left(:,\mathcal N_u^{e}\right)\left[\mathbf v_q\right]_{\mathcal N_u^{e}}$。记 $\mathbf H_{u,q}\triangleq\tilde{\mathbf e}_{u,q}^{vT}\otimes\mathbf I_M$，相应的后验误差协方差为

$$
\mathbf P_{r,u,q,t_r|t_r}^{(k,k)}=\mathbf H_{u,q}\mathbf C_{SB}^{(k)}\mathbf H_{u,q}^{H}
=\left(\tilde{\mathbf e}_{u,q}^{vT}\otimes\mathbf I_M\right)\mathbf C_{SB}^{(k)}\left(\tilde{\mathbf e}_{u,q}^{v*}\otimes\mathbf I_M\right).\tag{18}
$$

这些投影协方差可对所需跟踪的单元—波束对预先计算，避免在线操作完整的 $MN\times MN$ 协方差矩阵。

作为参照，定义完整级联状态 $\mathbf s_t^{(k)}\triangleq\operatorname{vec}\left(\mathbf L_t^{(k)}\right)\in\mathbb C^{MN\times1}$，其动力学为 $\mathbf s_{t+1}^{(k)}=\tilde{\mathbf A}_t^{(k)}\mathbf s_t^{(k)}+\tilde{\mathbf u}_t^{(k)}$，其中 $\tilde{\mathbf u}_t^{(k)}\sim\mathcal{CN}\left(\mathbf 0,\tilde{\mathbf Q}_t^{(k)}\right)$。矩阵 $\tilde{\mathbf A}_t^{(k)}$ 与 $\tilde{\mathbf Q}_t^{(k)}\in\mathbb C^{MN\times MN}$ 由长期级联信道观测离线辨识。在两次重标定事件之间，全状态预测器遵循

$$
\hat{\mathbf s}_{t+1|t}^{(k)}=\tilde{\mathbf A}_t^{(k)}\hat{\mathbf s}_{t|t}^{(k)},\qquad
\mathbf P_{t+1|t}^{(k,k)}=\tilde{\mathbf A}_t^{(k)}\mathbf P_{t|t}^{(k,k)}\left(\tilde{\mathbf A}_t^{(k)}\right)^{H}+\tilde{\mathbf Q}_t^{(k)}.\tag{19}
$$

预测的级联信道矩阵为 $\hat{\mathbf L}_{t+1|t}^{(k)}=\operatorname{unvec}_{M\times N}\left(\hat{\mathbf s}_{t+1|t}^{(k)}\right)$。该全状态递推作为分析参照；大 $N$ 时实际采用的降阶实现见下文。式（18）的投影协方差为每个被跟踪的单元—波束状态提供了原始的获取后不确定性模型。第 VII-A 节引入其随时隙变化的校准对应量，用于估计候选半盲重标定所关联的残余不确定性。

### C. 低复杂度波束域跟踪

当 $N$ 较大时，传播完整的 $MN$ 维级联状态代价高昂。因此本文在第 IV-B 节引入的固定基本单元上跟踪反射响应。令 $\mathcal Q_t^{tr}\subseteq\{1,\ldots,Q\}$ 表示时隙 $t$ 需要跟踪降阶响应的波束索引集合，并定义 $\mathbf r_{u,t}^{(k)}(q)=\mathbf L_t^{(k)}\tilde{\mathbf e}_{u,q}^{v}=\left(\tilde{\mathbf e}_{u,q}^{vT}\otimes\mathbf I_M\right)\mathbf s_t^{(k)}\in\mathbb C^{M\times1}$。由于全状态过程的投影一般不能得到闭合的降阶模型，单元—波束动力学直接由历史响应辨识：

$$
\mathbf r_{u,t+1}^{(k)}(q)=\tilde{\mathbf A}_{u,q,t}^{(k)}\mathbf r_{u,t}^{(k)}(q)+\tilde{\mathbf e}_{u,q,t}^{(k)},\tag{20}
$$

其中 $\tilde{\mathbf e}_{u,q,t}^{(k)}\sim\mathcal{CN}\left(\mathbf 0,\tilde{\mathbf Q}_{r,u,q,t}^{(k)}\right)$。转移矩阵 $\tilde{\mathbf A}_{u,q,t}^{(k)}$ 与创新协方差 $\tilde{\mathbf Q}_{r,u,q,t}^{(k)}$ 由历史单元级波束响应及其一步预测残差离线估计。所得预测器为

$$
\hat{\mathbf r}_{u,t+1|t}^{(k)}(q)=\tilde{\mathbf A}_{u,q,t}^{(k)}\hat{\mathbf r}_{u,t|t}^{(k)}(q),\qquad
\mathbf P_{r,u,q,t+1|t}^{(k,k)}=\tilde{\mathbf A}_{u,q,t}^{(k)}\mathbf P_{r,u,q,t|t}^{(k,k)}\left(\tilde{\mathbf A}_{u,q,t}^{(k)}\right)^{H}+\tilde{\mathbf Q}_{r,u,q,t}^{(k)}.\tag{21}
$$

为便于结构化在线实现，协方差序列在允许的预测龄期上预先计算，在线跟踪只传播 $M$ 维均值向量，并从查找表中检索相应的预测误差协方差。若所有 $U$ 个基本单元跟踪同一波束集合 $\mathcal Q_t^{tr}$，则每个用户的降阶状态维数为 $MU\left|\mathcal Q_t^{tr}\right|$，而完整级联状态为 $MN$。因此当 $U\left|\mathcal Q_t^{tr}\right|\ll N$ 时维数得到降低。对由基本单元索引集 $\mathcal U_{g,t}$ 构成的控制分区 $g$，预测反射响应为 $\hat{\mathbf r}_{g,t+1|t}^{(k)}(q)=\sum_{u\in\mathcal U_{g,t}}\hat{\mathbf r}_{u,t+1|t}^{(k)}(q)$。为避免传播跨单元误差协方差，假设不同基本单元的预测误差近似不相关。相应地，$\mathbf P_{r,g,q,t+1|t}^{(k,k)}\approx\sum_{u\in\mathcal U_{g,t}}\mathbf P_{r,u,q,t+1|t}^{(k,k)}$。

重标定之后与纯预测运行期间使用同一降阶状态表示。重标定时，第 IV-B 节的半盲后验被投影到所跟踪的单元—波束状态，用作更新后的波束域后验；否则按式（21）传播现有后验。模式选择仍是第 VI 节联合控制问题的一部分，由第 VII-A 节的结构化重标定规则求解。

## V. 波束相关的预测有效信道

为计入实际硬件的有限分辨率，IRS 相位配置选取为 $\mathbf v_q=\left[e^{j\psi_{1,q}},\ldots,e^{j\psi_{N,q}}\right]^{T}$，$q=1,\ldots,Q$。对 $b$ 比特相位量化，单元 $n$ 的相位限制为 $\psi_{n,q}\in\left\{\frac{2\pi m}{2^b}:m=0,\ldots,2^b-1\right\}$，因此全表面最多有 $2^{bN}$ 种配置，码本可包含其中任意 $Q\leqslant2^{bN}$ 个配置的子集。这些单位模码字用于正常反射，与第 IV-A 节最小反射获取态不同。

令 $\mathcal N_{g,t}\subseteq\mathcal N$ 表示 IRS 单元 $g$ 的单元集合，$n_{g,t}\triangleq\left|\mathcal N_{g,t}\right|$。有序集合 $\left\{\mathcal N_{g,t}\right\}_{g=1}^{G_t}$ 构成当前 IRS 分区。对单元 $g$，$\mathbf v_{g,q}\triangleq\left[\mathbf v_q\right]_{\mathcal N_{g,t}}$ 是码字 $\mathbf v_q$ 在该单元上的限制。可执行控制器使用第 VII-B 节定义的等尺寸候选分区。在目标用户主导反射模型下，控制器侧有效信道只保留分配给用户 $k$ 的 IRS 单元，忽略分配给其他用户的单元带来的反射泄漏。当单元级波束聚焦相对期望分量抑制了非预期反射分量时，该近似最为准确。对波束索引向量 $\mathbf q_t=\left[q_{1,t},\ldots,q_{G_t,t}\right]$ 与分配矩阵 $\mathbf B_t=\left[a_{g,t}^{(k)}\right]\in\{0,1\}^{G_t\times K}$，一步预测有效信道为

$$
\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(k)}(\mathbf B_t,\mathbf q_t)\approx\hat{\mathbf h}_{t+1|t}^{d,(k)}+\sum_{g=1}^{G_t}a_{g,t}^{(k)}\hat{\mathbf r}_{g,t+1|t}^{(k)}(q_{g,t}),\tag{22}
$$

其中 $\hat{\mathbf r}_{g,t+1|t}^{(k)}(q)=\sum_{u\in\mathcal U_{g,t}}\hat{\mathbf r}_{u,t+1|t}^{(k)}(q)$ 由第 IV-C 节的降阶预测器得到。

在波束域中，预测有效信道直接由聚合后的单元级响应构成，其协方差由相应的降阶预测协方差得到。用户特定的掩码码字 $\tilde{\mathbf e}_t^{(k)}\triangleq\operatorname{col}_{g=1}^{G_t}\left(a_{g,t}^{(k)}\mathbf v_{g,q_{g,t}}\right)\in\mathbb C^{N}$ 是全长码字，其对应于未分配给用户 $k$ 的 IRS 单元的元素置零。应用恒等式 $\mathbf L\mathbf v=\left(\mathbf v^{T}\otimes\mathbf I_M\right)\operatorname{vec}(\mathbf L)$，预测有效信道误差为

$$
\Delta\mathbf h_{\mathrm{eff},t+1|t}^{(k)}=\Delta\mathbf h_{t+1|t}^{d,(k)}+\left(\tilde{\mathbf e}_t^{(k)T}\otimes\mathbf I_M\right)\Delta\mathbf s_{t+1|t}^{(k)}.\tag{23}
$$

定义 $\Delta\mathbf h_{t+1|t}^{d,(k)}\triangleq\mathbf h_{t+1}^{d,(k)}-\hat{\mathbf h}_{t+1|t}^{d,(k)}$ 与 $\Delta\mathbf s_{t+1|t}^{(k)}\triangleq\operatorname{vec}\left(\mathbf L_{t+1}^{(k)}-\hat{\mathbf L}_{t+1|t}^{(k)}\right)$。在给定时隙 $t$ 可用信息的条件下，并假设直达与级联信道预测误差均值为零且相互不相关，有效信道协方差为

$$
\mathbf P_{\mathrm{eff},t+1|t}^{(k,k)}(\mathbf B_t,\mathbf q_t)=\mathbf P_{t+1|t}^{d,(k,k)}+\sum_{g=1}^{G_t}a_{g,t}^{(k)}\mathbf P_{r,g,q_{g,t},t+1|t}^{(k,k)}.\tag{24}
$$

有效信道不确定性定义为 $\eta_t^{(k)}(\mathbf B_t,\mathbf q_t)\triangleq\operatorname{Tr}\left(\mathbf P_{\mathrm{eff},t+1|t}^{(k,k)}(\mathbf B_t,\mathbf q_t)\right)$，它量化了跨 BS 天线的预测有效信道总均方误差。

## VI. 问题表述

时隙 $t$ 的控制问题联合选择重标定模式与其余 IRS 及无线资源变量。对候选重标定决策 $a_t^{cal}\in\{0,1\}$，令 $\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(k),ctrl}\left(\mathbf B_t,\mathbf q_t;a_t^{cal}\right)$ 与 $\mathbf P_{\mathrm{eff},t+1|t}^{(k,k),ctrl}\left(\mathbf B_t,\mathbf q_t;a_t^{cal}\right)$ 表示由候选重标定模式所对应后验得到的有效信道均值与协方差。

**预测 SINR 与净速率。** 令 $p^{(k)}$ 表示用户 $k$ 的发射功率，$\mathbf w_{t+1|t}^{(k)}\in\mathbb C^{M}$ 表示由控制条件化的预测有效信道构造的接收合并器，$\mathbf c_t\triangleq\left[c_t^{(k)}\right]_{k\in\mathcal D_t}$。仿真采用迫零（ZF）合并。对候选动作 $\left(\mathbf B_t,\mathbf q_t,\mathbf c_t,a_t^{cal}\right)$，式（25）的不确定性感知预测 SINR 把信道预测误差计为额外的非相关干扰。

$$
\operatorname{SINR}_{t+1|t}^{(k)}=\frac{p^{(k)}\left|\left(\mathbf w_{t+1|t}^{(k)}\right)^{H}\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(k),ctrl}\right|^{2}}{\sigma_n^2\left\|\mathbf w_{t+1|t}^{(k)}\right\|_2^2+p^{(k)}\left(\mathbf w_{t+1|t}^{(k)}\right)^{H}\mathbf P_{\mathrm{eff},t+1|t}^{(k,k),ctrl}\mathbf w_{t+1|t}^{(k)}+\sum_{j\in\mathcal D_t\setminus\{k\},\,c_t^{(j)}=c_t^{(k)}}p^{(j)}\left[\left|\left(\mathbf w_{t+1|t}^{(k)}\right)^{H}\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(j),ctrl}\right|^{2}+\left(\mathbf w_{t+1|t}^{(k)}\right)^{H}\mathbf P_{\mathrm{eff},t+1|t}^{(j,j),ctrl}\mathbf w_{t+1|t}^{(k)}\right]}\tag{25}
$$

此后为简洁起见省略 $\operatorname{SINR}_{t+1|t}^{(k)}$ 的动作参数。常规数据区间上的相应预测速率为

$$
\hat R_{N,t+1|t}^{(k)}=B_{\mathrm{ch}}\log_2\left(1+\operatorname{SINR}_{t+1|t}^{(k)}\right),\tag{26}
$$

其中 $B_{\mathrm{ch}}$ 为一条上行信道的带宽。由于同一段未知 $\alpha$ 符号载荷块在基线与 $N$ 个 DFT 编码获取状态上重复使用，编码重复不携带额外的新鲜载荷。因此净块速率为

$$
\hat R_{\mathrm{net},t}^{(k)}=(1-a_t^{cal})\frac{S-\tau_p}{S}\hat R_{N,t+1|t}^{(k)}
+a_t^{cal}\frac{\alpha\hat R_{\mathrm{base},t+1|t}^{(k)}+\beta\hat R_{N,t+1|t}^{(k)}}{S},\tag{27}
$$

其中 $\beta=S-\tau_p-\alpha(N+1)>0$，$\hat R_{\mathrm{base},t+1|t}^{(k)}$ 表示最小反射基线下的预测速率。因此，$\hat R_{\mathrm{net},t}^{(k)}$ 是一个基于一步预测的效用，直接计入 $a_t^{cal}$ 引起的获取开销。

**公平性与中断度量。** 定义预测瞬时交付速率 $\tilde R_t^{(k)}\triangleq\mathbf 1\{k\in\mathcal D_t\}\hat R_{\mathrm{net},t}^{(k)}$。候选相关的平滑速率为 $\hat R_{t+1|t}^{(k)}=(1-\alpha_R)R_t^{(k)}+\alpha_R\tilde R_t^{(k)}$，其中 $0<\alpha_R<1$。正则化 Jain 公平性指标为 $\hat J_{t+1|t}^{fair}\triangleq\frac{\left(\sum_{k=1}^{K}\hat R_{t+1|t}^{(k)}\right)^{2}}{K\sum_{k=1}^{K}\left(\hat R_{t+1|t}^{(k)}\right)^{2}+\epsilon_J}$，其中 $\epsilon_J>0$。非活跃用户的瞬时速率为零。对目标速率 $R_{\min}>0$，预测中断计数为 $\hat N_{out,t}\triangleq\sum_{k\in\mathcal D_t}\mathbf 1\left\{\hat R_{\mathrm{net},t}^{(k)}<R_{\min}\right\}$。为记法简洁，这些度量对候选动作（包括 $a_t^{cal}$）的依赖被省略。

**联合控制问题。** 下面给出可执行控制器使用的等尺寸分区族。令 $\mathcal S_N\subseteq\left\{n\in\mathbb Z_{>0}:n\mid N,\ \Delta_N\mid n\right\}$ 包含与第 IV-B 节基本跟踪网格兼容的 $N$ 的因子。对 $N_{0,t}\in\mathcal S_N$，定义 $G_t=N/N_{0,t}$ 个连续等尺寸单元 $\mathcal N_{g,t}=\left\{(g-1)N_{0,t}+1,\ldots,gN_{0,t}\right\}$，$g=1,\ldots,G_t$。完整 IRS 反射向量与相位切换代价分别为 $\boldsymbol\nu_t=\operatorname{col}_{g=1}^{G_t}\left(\mathbf v_{g,q_{g,t}}\right)$ 与 $C_t^{sw}=\sum_{n=1}^{N}\mathbf 1\left\{[\boldsymbol\nu_t]_n\neq[\boldsymbol\nu_{t-1}]_n\right\}$。时隙 $t$ 的控制问题为

$$
\begin{aligned}
\max_{N_{0,t}\in\mathcal S_N,\ \mathbf q_t,\mathbf c_t,\mathbf B_t,a_t^{cal}}\quad
&\sum_{k\in\mathcal D_t}\hat R_{\mathrm{net},t}^{(k)}+\lambda_F\hat J_{t+1|t}^{fair}-\lambda_O\hat N_{out,t}-\lambda_{sw}C_t^{sw}\\
&-\lambda_U\sum_{k\in\mathcal D_t}\operatorname{Tr}\left(\mathbf P_{\mathrm{eff},t+1|t}^{(k,k),ctrl}\left(\mathbf B_t,\mathbf q_t;a_t^{cal}\right)\right)
\end{aligned}\tag{28a}
$$

约束为

$$
\begin{aligned}
&\text{s.t.}\quad q_{g,t}\in\mathcal Q_t^{tr},\quad g=1,\ldots,G_t,\tag{28b}\\
&c_t^{(k)}\in\mathcal C,\quad k\in\mathcal D_t,\tag{28c}\\
&a_t^{cal}\in\{0,1\},\quad a_{g,t}^{(k)}\in\{0,1\},\tag{28d}\\
&a_{g,t}^{(k)}=0,\quad g=1,\ldots,G_t,\ k\notin\mathcal D_t,\tag{28e}\\
&\sum_{k\in\mathcal D_t}a_{g,t}^{(k)}=1,\quad g=1,\ldots,G_t,\tag{28f}\\
&G_t=\frac{N}{N_{0,t}},\tag{28g}\\
&\sum_{\tau=\max\{1,t-W+1\}}^{t}\sum_{g=1}^{G_\tau}N_{0,\tau}a_{g,\tau}^{(k)}\geqslant s_{\min}^{(k)},\quad k\in\mathcal D_t,\tag{28h}
\end{aligned}
$$

其中 $a_{g,t}^{(k)}=1$ 表示 IRS 单元 $g$ 分配给用户 $k$，因此 $N_t^{(k)}=N_{0,t}\sum_{g=1}^{G_t}a_{g,t}^{(k)}$ 为相应的已分配孔径。与第 VII-A 节一致，若某活跃用户尚无已初始化的级联信道状态，则可行动作集被限制为 $a_t^{cal}=1$。

约束（28h）通过在最近 $W$ 个时隙上强制最小累积单元分配，防止持续的 IRS 服务饥饿。阈值 $s_{\min}^{(k)}$ 的选取保证分配可行性，其对应的逐时隙条件由命题 1 给出。服务约束调节 IRS 接入，而 $\hat J_{t+1|t}^{fair}$ 控制长期速率公平性。非负系数 $\lambda_F$、$\lambda_O$、$\lambda_{sw}$ 与 $\lambda_U$ 定义了耦合设计目标的一种参考标量化，测试期间保持不变。所得问题是时间耦合、混合整数、非凸的，且联合动作空间呈组合规模，因此可执行控制器不直接求解该问题。

## VII. 不确定性感知结构化控制

第 VI 节中的耦合变量通过一个确定性结构化过程求解，该过程基于第 III—VI 节建立的渠道统计与不确定性感知物理度量。控制器先选择重标定模式，再在该决策条件下确定等尺寸 IRS 粒度、单元归属与波束索引。上行信道分配随后由第 IX 节的接收机一致过程完成。

### A. 重标定与 IRS 可行性

为避免对两种重标定模式都求解式（28a）的组合资源问题，$a_t^{cal}$ 在其余资源变量之前确定。若任一活跃用户没有已初始化的级联信道状态，则半盲获取为强制操作且 $a_t^{cal}=1$。否则对已初始化的活跃用户执行如下风险检验。对每个 $k\in\mathcal D_t$，令 $\hat{\mathbf r}_{u,t}^{pre,(k)}(q)$ 与 $\mathbf P_{r,u,q,t}^{pre,(k,k)}$ 表示重标定决策之前立即可用的波束域均值与协方差。定义

$$
U_{pre,t}^{(k)}=\left(\widetilde D_t^{(k)}\right)^{-1}\sum_{u=1}^{U}\sum_{q\in\mathcal Q_t^{tr}}\operatorname{Tr}\left(\mathbf P_{r,u,q,t}^{pre,(k,k)}\right),\tag{29}
$$

其中 $\widetilde D_t^{(k)}\triangleq\sum_{u=1}^{U}\sum_{q\in\mathcal Q_t^{tr}}\left(\left\|\hat{\mathbf r}_{u,t}^{pre,(k)}(q)\right\|_2^2+\varepsilon_{cas}\right)$，且 $\varepsilon_{cas}>0$ 在反射信道能量很低时保证数值稳定。令 $\mathbf P_{0,u,q}^{(k,k)}$ 表示式（18）中原始的投影获取后协方差。其随时隙变化的校准对应量为

$$
\mathbf P_{\mathrm{floor},u,q,t}^{(k,k)}\triangleq C_k\left(10\log_{10}\left(\max\left\{\operatorname{Tr}\left(\mathbf P_{t|t}^{d,(k,k)}\right),\varepsilon_d\right\}\right)\right)\mathbf P_{0,u,q}^{(k,k)},\tag{30}
$$

其中 $\varepsilon_d>0$，$C_k(\cdot)$ 由用户特定校准数据离线得到。在线查询被裁剪到校准范围内，以 dB 插值，再转换为线性协方差尺度。预测的获取后协方差底风险为

$$
U_{floor,t}^{(k)}=\left(\widetilde D_t^{(k)}\right)^{-1}\sum_{u=1}^{U}\sum_{q\in\mathcal Q_t^{tr}}\operatorname{Tr}\left(\mathbf P_{\mathrm{floor},u,q,t}^{(k,k)}\right).\tag{31}
$$

定义最差用户系统风险为 $U_{pre,t}\triangleq\max_{k\in\mathcal D_t}U_{pre,t}^{(k)}$ 与 $U_{floor,t}\triangleq\max_{k\in\mathcal D_t}U_{floor,t}^{(k)}$。对 dB 可靠性阈值 $\varepsilon_{cal}^{dB}$，令 $\varepsilon_{cal}\triangleq10^{\varepsilon_{cal}^{dB}/10}$。重标定决策为

$$
a_t^{cal}=\mathbf 1\left\{U_{pre,t}>\varepsilon_{cal}\ \wedge\ U_{pre,t}>U_{floor,t}\right\}.\tag{32}
$$

可靠性检验 $U_{pre,t}>\varepsilon_{cal}$ 识别不可靠的预测，而 $U_{pre,t}>U_{floor,t}$ 要求存在正的预测不确定性下降。若 $a_t^{cal}=1$，第 IV-A 节的半盲获取按第 IV-B 节刷新时隙 $t$ 的波束域后验；否则保留纯预测后验。所选后验用于后续资源决策，并作为下一决策周期的状态参照。

令 $\mathcal S_N$ 表示等尺寸 IRS 单元尺寸的允许集合。对候选尺寸 $n_0\in\mathcal S_N$，IRS 包含 $G(n_0)=\frac{N}{n_0}$ 个连续单元，$\mathcal N_g(n_0)=\left\{(g-1)n_0+1,\ldots,gn_0\right\}$，$g=1,\ldots,G(n_0)$。由于每个允许的 $n_0$ 都与第 IV-C 节的固定基本跟踪网格兼容，这些控制单元由基本单元—波束状态聚合而成，不需要新的级联信道估计。令 $\mathcal H_t^{W-1}$ 表示块 $t$ 之前最近 $W-1$ 个非空控制器块的索引。活跃用户 $k$ 的残余孔径亏空为

$$
d_t^{(k)}\triangleq\left[s_{\min}^{(k)}-\sum_{\tau\in\mathcal H_t^{W-1}}N_\tau^{(k)}\right]^{+},\quad k\in\mathcal D_t,\tag{33}
$$

其中 $[x]^{+}\triangleq\max\{x,0\}$，$N_\tau^{(k)}$ 为第 VI 节定义的先前已分配 IRS 孔径。对候选尺寸 $n_0$，用户 $k$ 所需的最少单元数为 $n_{req,t}^{(k)}(n_0)\triangleq\left\lceil\frac{d_t^{(k)}}{n_0}\right\rceil$。因此可行的候选尺寸集合为

$$
\mathcal S_{N,t}^{feas}=\left\{n_0\in\mathcal S_N:\sum_{k\in\mathcal D_t}n_{req,t}^{(k)}(n_0)\leqslant G(n_0)\right\}.\tag{34}
$$

当 $\mathcal S_{N,t}^{feas}\neq\emptyset$ 时，式（34）是存在满足当前残余服务要求的排他等尺寸分配的充要条件；其顺序保持性在第 X-A 节证明。若存在不可行时隙，将在数值评估中显式处理。对由若干基本单元构成的控制单元，预测均值响应相加，而获取时刻的不确定性采用第 IV-C 节直接校准的连续块协方差，而非基本获取后协方差之和。

### B. IRS 配置选择

对固定的 $n_0\in\mathcal S_{N,t}^{feas}$，IRS 归属由孤立的系统速率贡献确定。令 $\mathcal Q_t^{cand}\subseteq\mathcal Q_t^{tr}$ 表示控制器考虑的波束码字集合。由于此时尚未分配上行信道，每个 IRS 候选都在把全部活跃用户视为共同临时共信道集的条件下评估，IRS 排序度量为

$$
\hat R_t(\mathbf B,\mathbf q)\triangleq\sum_{k\in\mathcal D_t}B_{\mathrm{ch}}\log_2\left(1+\operatorname{SINR}_{\mathrm{IRS},t+1|t}^{(k)}(\mathbf B,\mathbf q)\right),\tag{35}
$$

其中 $\operatorname{SINR}_{\mathrm{IRS},t+1|t}^{(k)}$ 由式（25）在相应控制条件化 ZF 接收机下得到。该度量仅用于 IRS 排序；依赖信道的速率在第 IX 节重算。由于 $a_t^{cal}$ 在 IRS 优化之前已固定，共同的获取开销因子不影响该排序。

令 $\hat R_{t,g\to k}^{iso}(q;n_0)$ 表示当分区 $n_0$ 中只有单元 $g$ 对用户 $k$ 的反射信道有贡献且使用波束 $q$ 时式（35）的取值，其余反射贡献被掩蔽。定义

$$
\Delta\hat R_{t,g}^{(k)}(n_0)\triangleq\max_{q\in\mathcal Q_t^{cand}}\hat R_{t,g\to k}^{iso}(q;n_0)-\hat R_t^{dir},\tag{36}
$$

$$
q_{t,g}^{iso,(k)}(n_0)\in\arg\max_{q\in\mathcal Q_t^{cand}}\hat R_{t,g\to k}^{iso}(q;n_0),\tag{37}
$$

其中 $\hat R_t^{dir}$ 表示去掉全部反射贡献后的式（35）。因此 $\Delta\hat R_{t,g}^{(k)}$ 度量了在最佳孤立波束下把该单元分配给用户 $k$ 所产生的预测系统速率变化。

各单元按顺序分配。令 $n_{t,g-1}^{(j)}(n_0)=\sum_{\ell=1}^{g-1}\mathbf 1\left\{k_{\ell,t}^{\star}(n_0)=j\right\}$ 表示处理单元 $g$ 之前已分配给用户 $j$ 的单元数。若当前单元被分配给候选用户 $k$，则用户 $j$ 的残余需求为

$$
\delta_{t,g}^{(j)}(k;n_0)\triangleq\left[n_{req,t}^{(j)}(n_0)-n_{t,g-1}^{(j)}(n_0)-\mathbf 1\{j=k\}\right]^{+}.\tag{38}
$$

于是残差可行的归属集合为

$$
\mathcal K_{t,g}^{feas}(n_0)=\left\{k\in\mathcal D_t:\sum_{j\in\mathcal D_t}\delta_{t,g}^{(j)}(k;n_0)\leqslant G(n_0)-g\right\}.\tag{39}
$$

单元 $g$ 的归属选择为

$$
k_{g,t}^{\star}(n_0)\in\arg\max_{k\in\mathcal K_{t,g}^{feas}(n_0)}\Delta\hat R_{t,g}^{(k)}(n_0).\tag{40}
$$

单元按固定顺序 $g=1,\ldots,G(n_0)$ 处理；孤立波束与归属选择中的并列分别由最小波束索引与最小用户索引解决。条件（39）保持残余服务可行性，这一点在第 X-A 节建立。

所得归属索引定义 $\left[\hat{\mathbf B}_t(n_0)\right]_{g,k}=\mathbf 1\left\{k=k_{g,t}^{\star}(n_0)\right\}$，相应的波束初始化为

$$
q_{g,t}^{(0)}(n_0)=q_{t,g}^{iso,(k_{g,t}^{\star}(n_0))}(n_0),\quad g=1,\ldots,G(n_0).\tag{41}
$$

随后波束向量通过一次固定顺序坐标扫描进行精化：

$$
q_{g,t}^{(1)}(n_0)\in\arg\max_{q\in\mathcal Q_t^{cand}}\hat R_t\left(\hat{\mathbf B}_t(n_0),\mathbf q_{t,g}^{(q)}(n_0)\right),\tag{42}
$$

其中

$$
\mathbf q_{t,g}^{(q)}(n_0)=\left[q_{1,t}^{(1)}(n_0),\ldots,q_{g-1,t}^{(1)}(n_0),q,q_{g+1,t}^{(0)}(n_0),\ldots,q_{G(n_0),t}^{(0)}(n_0)\right]^{T}.
$$

并列由使目标最大的最小波束索引解决。由于当前波束属于 $\mathcal Q_t^{cand}$，每次坐标更新都不会降低 $\hat R_t$。

扫描结束后，定义 $\hat{\mathbf q}_t(n_0)=\left[q_{1,t}^{(1)}(n_0),\ldots,q_{G(n_0),t}^{(1)}(n_0)\right]^{T}$。最终等尺寸粒度为

$$
N_{0,t}^{\star}=\min\arg\max_{n_0\in\mathcal S_{N,t}^{feas}}\hat R_t\left(\hat{\mathbf B}_t(n_0),\hat{\mathbf q}_t(n_0)\right),\tag{43}
$$

其中 IRS 候选按式（35）的不确定性感知速率代理排序，服务可行性由式（34）与式（39）保证。选定的 IRS 变量为 $\mathbf B_t^{\star}=\hat{\mathbf B}_t\left(N_{0,t}^{\star}\right)$ 与 $\mathbf q_t^{\star}=\hat{\mathbf q}_t\left(N_{0,t}^{\star}\right)$，从而 $A_t^{IRS}=\left(a_t^{cal},N_{0,t}^{\star},\mathbf B_t^{\star},\mathbf q_t^{\star}\right)$。最终上行信道向量 $\mathbf c_t^{\star}$ 随后由第 IX 节的接收机一致顺序分配器得到。

## VIII. 全时隙确定性控制器执行

第 VII—IX 节的结构化控制器在每个非空物理控制块执行一次。所有决策都是因果的，只使用控制器可用的信道统计、IRS 服务历史，以及在开发阶段固定的参数。重标定块仍是活跃控制块：当选择半盲获取时，先刷新级联信道后验，再用所得后验确定剩余数据区间的 IRS 与上行信道动作。因此，常规块与重标定块都会推进服务历史与交付速率历史。与第 IV 节一致，一个物理控制块对应一个控制时隙。

### A. 控制状态与资源选择

在块 $t$ 开始时，O-CA 跟踪器更新直达信道后验与纯预测波束域状态。控制器随后按式（32）选择 $a_t^{cal}$，其中对任何没有已初始化级联状态的活跃用户，重标定为强制操作。若 $a_t^{cal}=1$，在做出其余资源决策之前刷新半盲后验并投影到所跟踪的单元—波束状态。

令 $\mathcal P_t^{ctrl}$ 表示所选的控制条件化信道统计。后续资源决策在 $a_t^{cal}=1$ 时使用刷新后的信道后验，否则使用纯预测统计。令 $\mathcal P_t^{acq}$ 与 $\mathcal P_t^{pred}$ 分别表示半盲刷新后得到的控制条件化信道统计与纯预测信道统计。所选统计集合提供后续 IRS 与上行信道决策所用的有效信道均值与误差协方差。在给定 $\mathcal P_t^{ctrl}$ 的条件下，第 VII-B 节选择 $N_{0,t}^{\star}$、$\mathbf B_t^{\star}$ 与 $\mathbf q_t^{\star}$，第 IX 节确定 $\mathbf c_t^{\star}$。执行动作为 $A_t=\left(a_t^{cal},N_{0,t}^{\star},\mathbf B_t^{\star},\mathbf q_t^{\star},\mathbf c_t^{\star}\right)$。

### B. 块执行与状态更新

当 $a_t^{cal}=0$ 时，所选 IRS 与上行信道配置在导频之后的常规数据区间应用。当 $a_t^{cal}=1$ 时，先利用最小反射基线与 $N$ 个 DFT 编码重复数据状态做级联信道获取，随后在剩余的 $\beta$ 符号常规数据区间应用所选动作。

预测净块速率按式（27）评估，因此获取开销被计入执行重标定的同一物理块。特别地，重复的未知 $\alpha$ 符号载荷只把一个实现计为新鲜数据；DFT 编码重复提供信道获取观测但不提供额外新鲜载荷。因此，重标定同时改变信道状态精度与可用载荷时长，无需额外的启发式重标定惩罚。相应的数值载荷比例在第 XII 节给出。

令 $G_t^{\star}=\frac{N}{N_{0,t}^{\star}}$。分配给用户 $k$ 的执行 IRS 孔径为 $N_t^{(k)}=N_{0,t}^{\star}\sum_{g=1}^{G_t^{\star}}\left[\mathbf B_t^{\star}\right]_{g,k}$。每个非空块之后，$N_t^{(k)}$ 都被追加一次到式（33）的 $W$ 块 IRS 服务历史，与重标定模式无关。因此，重标定块使用其获取后数据区间所执行的分配贡献一个服务样本。

令 $R_t^{del,(k)}$ 表示采用与式（27）相同的载荷计费所得到的实得净块速率，对 $k\notin\mathcal D_t$ 有 $R_t^{del,(k)}=0$。在第一个可用交付速率样本之前，$R_t^{(k)}=0$；此后平滑速率更新为 $R_{t+1}^{(k)}=(1-\alpha_R)R_t^{(k)}+\alpha_RR_t^{del,(k)}$，$0<\alpha_R<1$。一旦初始化，非活跃用户的速率状态会通过零交付速率观测衰减。服务状态与速率状态都只在当前动作执行之后更新，因此不会把非因果信息引入时隙 $t$ 的决策。

算法 1 汇总了完整在线流程。它以 $\mathcal S_{N,t}^{feas}\neq\emptyset$ 为前提给出。若 $\mathcal S_{N,t}^{feas}=\emptyset$，实现中取 $n_0=\min\mathcal S_N$，把强制优先级给予残余服务亏空最大的活跃用户，并应用相同的确定性归属与波束选择规则。

**算法 1：全时隙不确定性感知结构化控制**

- **输入：** $\mathcal D_t$；直达与级联信道后验；IRS 服务历史；基本 IRS 网格；波束码本；$\mathcal S_N$；固定校准参数。
- **输出：** $A_t=\left(a_t^{cal},N_{0,t}^{\star},\mathbf B_t^{\star},\mathbf q_t^{\star},\mathbf c_t^{\star}\right)$。
1. 更新直达信道后验，并形成预测的波束域级联状态与协方差。
2. **if** 存在活跃用户没有已初始化的级联状态 **then**
3. $\quad a_t^{cal}\leftarrow1$。
4. **else**
5. $\quad$ 计算 $U_{pre,t}$ 与 $U_{floor,t}$，并按式（32）选择 $a_t^{cal}$。
6. **end if**
7. **if** $a_t^{cal}=1$ **then**
8. $\quad$ 执行差分重复数据 DFT 获取，并把更新后的后验投影到所跟踪的单元—波束状态。
9. **end if**
10. 若 $a_t^{cal}=1$ 置 $\mathcal P_t^{ctrl}$ 为重标定后验，否则置为纯预测后验。
11. 按式（34）构造 $\mathcal S_{N,t}^{feas}$。
12. **for** $n_0\in\mathcal S_{N,t}^{feas}$ **do**
13. $\quad$ 按第 VII-B 节确定残差可行的单元归属。
14. $\quad$ 按式（41）初始化波束，并用式（42）执行一次固定顺序扫描。
15. $\quad$ 评估 $\hat R_t\left(\hat{\mathbf B}_t(n_0),\hat{\mathbf q}_t(n_0)\right)$。
16. **end for**
17. 按式（43）选择 $N_{0,t}^{\star}$，并把 $\mathbf B_t^{\star}$、$\mathbf q_t^{\star}$ 置为相应候选值。
18. 形成服务优先用户顺序，并用第 IX 节的顺序分配器得到 $\mathbf c_t^{\star}$。
19. 执行 $A_t$，计算交付净速率，并更新服务历史与速率历史。
20. **return** $A_t$。

## IX. 接收机一致的信道分配

在确定重标定决策、IRS 单元归属与波束配置之后，控制器为每个活跃用户分配一条上行信道。由于上行信道可以被复用，每个候选分配都用其条件不确定性感知 ZF 速率，以及它与已分配到同一信道的用户所产生的干扰风险来评估。为获得与顺序信道分配状态无关的接收机一致成对风险度量，本文用用户特定的全孔径参考波束构造一个与分配无关的参考 ZF 接收机。

### A. 接收机一致的风险与信道度量

对 $q\in\mathcal Q_t^{tr}$，定义全孔径反射响应及其预测误差协方差为 $\hat{\mathbf r}_{t+1|t}^{(k)}(q)\triangleq\sum_{u=1}^{U}\hat{\mathbf r}_{u,t+1|t}^{(k)}(q)$ 与 $\mathbf P_{r,q,t+1|t}^{(k,k)}\approx\sum_{u=1}^{U}\mathbf P_{r,u,q,t+1|t}^{(k,k)}$，其中协方差近似遵循第 IV-C 节的跨单元误差独立假设。相应参考有效信道与不确定性为 $\hat{\mathbf h}_{t+1|t}^{ref,(k)}(q)\triangleq\hat{\mathbf h}_{t+1|t}^{d,(k)}+\hat{\mathbf r}_{t+1|t}^{(k)}(q)$ 与 $\eta_t^{ref,(k)}(q)\triangleq\operatorname{Tr}\left(\mathbf P_{t+1|t}^{d,(k,k)}+\mathbf P_{r,q,t+1|t}^{(k,k)}\right)$。该聚合仅用于与分配无关的参考度量，不替代可执行 IRS 候选所使用的连续块获取协方差。

用户特定的参考波束选择为

$$
q_t^{ref,(k)}=\min\left(\arg\max_{q\in\mathcal Q_t^{tr}}\left\{\left\|\hat{\mathbf h}_{t+1|t}^{ref,(k)}(q)\right\|_2^2-\lambda_{ref}\eta_t^{ref,(k)}(q)\right\}\right),\tag{44}
$$

其中 $\lambda_{ref}\geqslant0$ 控制增益—不确定性折中。为简洁起见，定义 $\hat{\mathbf h}_{t+1|t}^{ref,(k)}\triangleq\hat{\mathbf h}_{t+1|t}^{ref,(k)}\left(q_t^{ref,(k)}\right)$ 与 $\mathbf P_{t+1|t}^{eff,(k,k),ref}\triangleq\mathbf P_{t+1|t}^{d,(k,k)}+\mathbf P_{r,q_t^{ref,(k)},t+1|t}^{(k,k)}$。把活跃用户的参考有效信道堆叠得到 $\hat{\mathbf H}_{t+1|t}^{ref}\triangleq\left[\hat{\mathbf h}_{t+1|t}^{ref,(k)}\right]_{k\in\mathcal D_t}$。相应的参考 ZF 合并器为

$$
\mathbf W_{t+1|t}^{ref,ZF}=\hat{\mathbf H}_{t+1|t}^{ref}\left[\left(\hat{\mathbf H}_{t+1|t}^{ref}\right)^{H}\hat{\mathbf H}_{t+1|t}^{ref}\right]^{\dagger},
$$

其中 $\mathbf w_{t+1|t}^{ref,(i)}$ 表示对应用户 $i$ 的列。

对 $i,j\in\mathcal D_t$ 且 $i\neq j$，定义 $s_{t+1|t}^{ref,(j\to i)}\triangleq\left|\left(\mathbf w_{t+1|t}^{ref,(i)}\right)^{H}\hat{\mathbf h}_{t+1|t}^{ref,(j)}\right|^2$。从用户 $j$ 到用户 $i$ 的有向接收机一致干扰耦合为

$$
e_{int,t}^{(j\to i)}=\frac{p^{(j)}\left[s_{t+1|t}^{ref,(j\to i)}+\left(\mathbf w_{t+1|t}^{ref,(i)}\right)^{H}\mathbf P_{t+1|t}^{eff,(j,j),ref}\mathbf w_{t+1|t}^{ref,(i)}\right]}{\sigma_n^2\left\|\mathbf w_{t+1|t}^{ref,(i)}\right\|_2^2+\epsilon_I}.\tag{45}
$$

其中 $\epsilon_I>0$ 是与合并后噪声功率同量级的固定数值保护项。该度量是有向的，因为与用户 $i$ 关联的接收合并器决定了用户 $j$ 所产生的干扰。它同时计入预测的残余多用户耦合，以及在控制器所用同一 ZF 接收处理模型下由信道预测不确定性引起的干扰。对列满秩的参考信道，精确 ZF 下确定性跨用户项消失；该项为伪逆或秩亏情形保留。

对 $c\in\mathcal C$，令 $\mathcal K_{t,c}\subseteq\mathcal D_t$ 表示已分配到信道 $c$ 的用户集合，首次分配前 $\mathcal K_{t,c}=\emptyset$。对候选用户 $k$，定义双向接收机一致共信道风险为

$$
\Omega_{t,c}^{(k)}=
\begin{cases}
0, & \mathcal K_{t,c}=\emptyset,\\[4pt]
\dfrac{1}{\left|\mathcal K_{t,c}\right|}\displaystyle\sum_{j\in\mathcal K_{t,c}}\left(e_{int,t}^{(j\to k)}+e_{int,t}^{(k\to j)}\right), & \mathcal K_{t,c}\neq\emptyset.
\end{cases}\tag{46}
$$

保留两个方向是因为接收合并一般使共信道耦合呈非对称：$e_{int,t}^{(j\to k)}$ 度量强加给候选用户 $k$ 的风险，而 $e_{int,t}^{(k\to j)}$ 度量 $k$ 引入到已分配用户 $j$ 的风险。对 $\mathcal K_{t,c}$ 取平均可限制额外的占用偏差，因为信道负载已体现在临时 ZF 速率中。

对候选对 $(k,c)$，定义临时共信道集合 $\mathcal S_{t,c}^{(k)}=\mathcal K_{t,c}\cup\{k\}$。在所选 IRS 动作 $\left(\mathbf B_t^{\star},\mathbf q_t^{\star}\right)$ 下，构造临时预测信道矩阵为

$$
\hat{\mathbf H}_{t,c}^{(k)}=\left[\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(j),ctrl}\left(\mathbf B_t^{\star},\mathbf q_t^{\star};a_t^{cal}\right)\right]_{j\in\mathcal S_{t,c}^{(k)}},\tag{47}
$$

其中各列按用户索引递增顺序排列。临时 ZF 合并器为

$$
\mathbf W_{t,c}^{ZF,(k)}=\hat{\mathbf H}_{t,c}^{(k)}\left[\left(\hat{\mathbf H}_{t,c}^{(k)}\right)^{H}\hat{\mathbf H}_{t,c}^{(k)}\right]^{\dagger},\tag{48}
$$

其中 $(\cdot)^{\dagger}$ 表示 Moore–Penrose 伪逆。令 $\mathbf w_{t,c}^{(k)}$ 表示式（48）中对应用户 $k$ 的列。条件不确定性感知 SINR 为

$$
\hat\gamma_{t,c}^{(k)}=\frac{p^{(k)}\left|\left(\mathbf w_{t,c}^{(k)}\right)^{H}\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(k),ctrl}\right|^2}{I_{t,c}^{(k)}},\tag{49}
$$

其中

$$
\begin{aligned}
I_{t,c}^{(k)}={}&\sigma_n^2\left\|\mathbf w_{t,c}^{(k)}\right\|_2^2+p^{(k)}\left(\mathbf w_{t,c}^{(k)}\right)^{H}\mathbf P_{\mathrm{eff},t+1|t}^{(k,k),ctrl}\mathbf w_{t,c}^{(k)}\\
&+\sum_{j\in\mathcal S_{t,c}^{(k)}\setminus\{k\}}p^{(j)}\left[\left|\left(\mathbf w_{t,c}^{(k)}\right)^{H}\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(j),ctrl}\right|^2+\left(\mathbf w_{t,c}^{(k)}\right)^{H}\mathbf P_{\mathrm{eff},t+1|t}^{(j,j),ctrl}\mathbf w_{t,c}^{(k)}\right].
\end{aligned}\tag{50}
$$

这些表达式把第 VI 节的不确定性感知 SINR 特殊化到临时共信道集合。依赖信道的速率为

$$
\hat R_{t,c}^{(k)}=\zeta_t^{ctrl}B_{\mathrm{ch}}\log_2\left(1+\hat\gamma_{t,c}^{(k)}\right),\tag{51}
$$

其中 $\zeta_t^{ctrl}\triangleq(1-a_t^{cal})\frac{S-\tau_p}{S}+a_t^{cal}\frac{\beta}{S}$。式（51）保留式（27）净块速率中依赖信道的分量。在重标定块中，新鲜的最小反射基线贡献对所有候选信道都相同，因此从信道排序中省略，但仍计入交付块速率。

速率项与共信道风险项都用式（7）的截断训练统计映射归一化。对候选速率 $\hat R_{t,c}^{(k)}$，取 $\left(x_{\min}^{tr},x_{\max}^{tr},\epsilon_x\right)=\left(R_{\min}^{tr},R_{\max}^{tr},\epsilon_R\right)$，结果记为 $\mathcal N_R\left(\hat R_{t,c}^{(k)}\right)$，其中 $R_{\min}^{tr}$ 与 $R_{\max}^{tr}$ 为冻结边界。对干扰风险定义 $\tilde\Omega_{t,c}^{(k)}=\frac{\Omega_{t,c}^{(k)}}{s_{int}^{tr}}$，其中 $s_{int}^{tr}>0$ 为固定训练集尺度，并用 $\left(0,\Omega_{\max}^{tr},\epsilon_\Omega\right)$ 施加 $\mathcal N_\Omega$。所有归一化统计在训练之后保持不变。

### B. 服务优先的顺序分配

用户按服务优先顺序处理，因为每个信道效用都依赖先前分配所形成的共信道集合。对 $k\in\mathcal D_t$，定义归一化服务优先得分 $F_t^{(k)}\triangleq\min\left\{1,\frac{d_t^{(k)}}{s_{\min}^{(k)}+\epsilon_F}\right\}$，其中 $\epsilon_F>0$，$d_t^{(k)}$ 为式（33）的残余孔径亏空。服务优先级相同的用户按各自的单用户预测速率 $\hat R_{t,iso}^{(k)}=\zeta_t^{ctrl}B_{\mathrm{ch}}\log_2\left(1+\hat\gamma_{t,iso}^{(k)}\right)$ 排序，其中 $\hat\gamma_{t,iso}^{(k)}$ 由式（49）在 $\mathcal S_{t,c}^{(k)}=\{k\}$ 时得到。

令 $\boldsymbol\pi_t=\left[\pi_t(1),\ldots,\pi_t\left(\left|\mathcal D_t\right|\right)\right]^{T}$ 表示所得用户顺序。它满足当 $m<n$ 时 $\pi_t(m)\prec_t\pi_t(n)$，其中

$$
k\prec_t j\iff
\begin{cases}
F_t^{(k)}>F_t^{(j)},\ \text{或}\\
F_t^{(k)}=F_t^{(j)}\ \text{且}\ \hat R_{t,iso}^{(k)}>\hat R_{t,iso}^{(j)}.
\end{cases}\tag{52}
$$

任何剩余的并列由较小用户索引解决。对当前用户 $k=\pi_t(m)$ 与候选信道 $c$，分配器评估 $U_{t,c}^{(k)}=\mathcal N_R\left(\hat R_{t,c}^{(k)}\right)-\lambda_G\mathcal N_\Omega\left(\tilde\Omega_{t,c}^{(k)}\right)$，其中 $\lambda_G>0$ 在控制器开发期间固定。信道按确定性规则选择为 $c_t^{(k)}=\min\left(\arg\max_{c\in\mathcal C}U_{t,c}^{(k)}\right)$，随后更新 $\mathcal K_{t,c_t^{(k)}}\leftarrow\mathcal K_{t,c_t^{(k)}}\cup\{k\}$。

所有活跃用户处理完毕后，最终分配为 $\mathbf c_t^{\star}=\left[c_t^{(k)}\right]_{k\in\mathcal D_t}$。不使用单独的负载惩罚，因为信道占用已体现在临时 ZF 速率中，且第 XII-B 节表明额外负载项没有可重复的增益。完整的确定性过程汇总于算法 2。每次分配之后都会重算候选速率，因此此前所有决策都反映在后续的临时 ZF 接收机中。该过程只评估 $C\left|\mathcal D_t\right|$ 个信道候选，而不是枚举 $C^{\left|\mathcal D_t\right|}$ 个完整信道向量。

**算法 2：接收机一致的上行信道顺序分配**

- **输入：** $\mathcal D_t$；$a_t^{cal}$；$\left(\mathbf B_t^{\star},\mathbf q_t^{\star}\right)$；控制条件化有效信道均值与协方差；$\left\{F_t^{(k)}\right\}$；$\left\{e_{int,t}^{(j\to k)}\right\}$；$\mathcal C$；$\lambda_G$。
- **输出：** 上行信道向量 $\mathbf c_t^{\star}$。
1. 置 $\mathcal K_{t,c}\leftarrow\emptyset$，$c\in\mathcal C$。
2. 计算 $\left\{\hat R_{t,iso}^{(k)}\right\}_{k\in\mathcal D_t}$，按式（52）对活跃用户排序，得到 $\boldsymbol\pi_t$。
3. **for** $m=1,\ldots,\left|\mathcal D_t\right|$ **do**
4. $\quad$ 置 $k\leftarrow\pi_t(m)$。
5. $\quad$ **for** 每个 $c\in\mathcal C$ **do**
6. $\quad\quad$ 构造 $\mathcal S_{t,c}^{(k)}=\mathcal K_{t,c}\cup\{k\}$。
7. $\quad\quad$ 按式（48）重算临时 ZF 合并器。
8. $\quad\quad$ 用式（49）—（51）与式（46）计算 $\hat\gamma_{t,c}^{(k)}$ 与 $\Omega_{t,c}^{(k)}$。
9. $\quad\quad$ 计算 $U_{t,c}^{(k)}\leftarrow\mathcal N_R\left(\hat R_{t,c}^{(k)}\right)-\lambda_G\mathcal N_\Omega\left(\tilde\Omega_{t,c}^{(k)}\right)$。
10. $\quad$ **end for**
11. $\quad$ 选择 $c_t^{(k)}\leftarrow\min\left(\arg\max_{c\in\mathcal C}U_{t,c}^{(k)}\right)$。
12. $\quad$ 更新 $\mathcal K_{t,c_t^{(k)}}\leftarrow\mathcal K_{t,c_t^{(k)}}\cup\{k\}$。
13. **end for**
14. 按用户索引递增顺序形成 $\mathbf c_t^{\star}=\left[c_t^{(k)}\right]_{k\in\mathcal D_t}$。
15. **return** $\mathbf c_t^{\star}$。

## X. 理论性质

本节分析第 VII—IX 节所建确定性控制器的 IRS 服务可行性、预测误差界、可靠性与重标定规则性质。

### A. IRS 可行性与有效信道误差界

**命题 1：** 对 $n_0\in\mathcal S_N$，存在满足当前残余服务要求的 $G(n_0)$ 个等尺寸 IRS 单元的排他分配，当且仅当 $\sum_{k\in\mathcal D_t}n_{req,t}^{(k)}(n_0)\leqslant G(n_0)$。此外，若 $n_0\in\mathcal S_{N,t}^{feas}$ 且每一步 $g$ 的归属都从式（39）的 $\mathcal K_{t,g}^{feas}(n_0)$ 中选择，则

$$
\sum_{j\in\mathcal D_t}\left[n_{req,t}^{(j)}(n_0)-n_{t,g}^{(j)}(n_0)\right]^{+}\leqslant G(n_0)-g,\quad g=1,\ldots,G(n_0),\tag{53}
$$

其中 $n_{t,g}^{(j)}(n_0)=\sum_{\ell=1}^{g}\mathbf 1\left\{k_{\ell,t}^{\star}(n_0)=j\right\}$。因此，对每个 $k\in\mathcal D_t$ 都有 $n_{t,G(n_0)}^{(k)}(n_0)\geqslant n_{req,t}^{(k)}(n_0)$。

**证明：** 必要性成立，因为用户 $k$ 至少需要 $n_{req,t}^{(k)}(n_0)$ 个不同单元。反之，若总需求不超过 $G(n_0)$，可先保留所需单元，再任意分配其余单元。对顺序规则，假设处理单元 $g$ 之前剩余需求不超过 $G(n_0)-g+1$。若该需求为正，则把当前单元分配给任何残余需求为正的用户都会使其减少 1；若为零，则所有活跃用户都可行。因此 $\mathcal K_{t,g}^{feas}(n_0)\neq\emptyset$，且式（53）得以保持。对 $g=1,\ldots,G(n_0)$ 归纳可得最终分配后残余需求为零，命题得证。$\square$

因此，对每个 $n_0\in\mathcal S_{N,t}^{feas}$，式（40）的归属选择在不做后处理修复的情况下保持当前残余服务要求。令 $\mathcal I_t$ 表示时隙 $t$ 的控制后验形成之后、IRS 配置选择之前可用的信息：当 $a_t^{cal}=1$ 时它包含重标定后验，否则包含纯预测后验。对所选配置 $\left(N_{0,t}^{\star},\mathbf B_t^{\star},\mathbf q_t^{\star}\right)$，定义 $G_t^{\star}\triangleq G\left(N_{0,t}^{\star}\right)$ 与 $\mathcal N_{g,t}^{\star}\triangleq\mathcal N_g\left(N_{0,t}^{\star}\right)$。令 $\Delta\mathbf L_{g,t+1|t}^{(k)}=\left[\mathbf L_{t+1}^{(k)}-\hat{\mathbf L}_{t+1|t}^{(k)}\right]_{:,\mathcal N_{g,t}^{\star}}$ 表示 IRS 单元 $g$ 上的级联信道预测误差，且所有所选单元尺寸相同，$\left|\mathcal N_{g,t}^{\star}\right|=N_{0,t}^{\star}$，$g=1,\ldots,G_t^{\star}$。

**定理 1：** 假设在给定 $\mathcal I_t$ 的条件下，对每个活跃用户 $k$ 与所选 IRS 单元 $g$ 有 $\mathbb E\left[\left\|\Delta\mathbf h_{t+1|t}^{d,(k)}\right\|_2^2\middle|\mathcal I_t\right]\leqslant\xi_d^{(k)}$ 与 $\mathbb E\left[\left\|\Delta\mathbf L_{g,t+1|t}^{(k)}\right\|_F^2\middle|\mathcal I_t\right]\leqslant\xi_{L,g}^{(k)}$。则是在目标用户主导反射模型与第 V 节单位模码字下，控制器侧有效信道预测误差满足

$$
\mathbb E\left[\left\|\Delta\mathbf h_{\mathrm{eff},t+1|t}^{(k)}\right\|_2^2\middle|\mathcal I_t\right]\leqslant\left(\sqrt{\xi_d^{(k)}}+\sum_{g=1}^{G_t^{\star}}\left[\mathbf B_t^{\star}\right]_{g,k}\sqrt{N_{0,t}^{\star}\xi_{L,g}^{(k)}}\right)^{2}.\tag{54}
$$

**证明：** 在给定 $\mathcal I_t$ 的条件下，确定性动作 $\left(\mathbf B_t^{\star},\mathbf q_t^{\star}\right)$ 固定，有效信道预测误差为

$$
\Delta\mathbf h_{\mathrm{eff},t+1|t}^{(k)}=\Delta\mathbf h_{t+1|t}^{d,(k)}+\sum_{g=1}^{G_t^{\star}}\left[\mathbf B_t^{\star}\right]_{g,k}\Delta\mathbf L_{g,t+1|t}^{(k)}\mathbf v_{g,q_{g,t}^{\star}}.\tag{55}
$$

Minkowski 不等式，连同 $\left\|\mathbf A\mathbf x\right\|_2\leqslant\left\|\mathbf A\right\|_F\left\|\mathbf x\right\|_2$ 与 $\left\|\mathbf v_{g,q_{g,t}^{\star}}\right\|_2^2=N_{0,t}^{\star}$，给出

$$
\sqrt{\mathbb E\left[\left\|\Delta\mathbf h_{\mathrm{eff},t+1|t}^{(k)}\right\|_2^2\middle|\mathcal I_t\right]}\leqslant\sqrt{\varepsilon_d^{(k)}}+\sum_{g=1}^{G_t^{\star}}a_{g,t}^{(k)}\sqrt{\mathbb E\left[\left\|\Delta\mathbf L_{g,t+1|t}^{(k)}\mathbf v_{g,q_{g,t}^{\star}}\right\|_2^2\middle|\mathcal I_t\right]},\tag{56}
$$

由此即得式（54）。该界不要求所选控制单元的预测误差之间相互独立。$\square$

> **原文疑点：** 定理 1 假设中使用的下界符号为 $\xi_d^{(k)}$ 与 $\xi_{L,g}^{(k)}$，但证明中式（56）的对应位置印作 $\varepsilon_d^{(k)}$；从上下文看二者应指同一量。本页按原印刷形式分别转录并加注，未静默统一符号。

### B. 可靠性界与重标定可执行性

对所选的 IRS 动作，定义 $\mathbf e_t^{(k)}\triangleq\mathbf h_{\mathrm{eff},t+1}^{(k)}\left(\mathbf B_t^{\star},\mathbf q_t^{\star}\right)-\hat{\mathbf h}_{\mathrm{eff},t+1|t}^{(k),ctrl}\left(\mathbf B_t^{\star},\mathbf q_t^{\star};a_t^{cal}\right)$，其中为简洁省略所选动作参数。假设控制条件化的不确定性模型以 $\mathbb E\left[\left\|\mathbf e_t^{(k)}\right\|_2^2\middle|\mathcal I_t\right]\leqslant\eta_t^{(k)}$ 为上界，且 $\eta_t^{(k)}\triangleq\operatorname{Tr}\left(\mathbf P_{\mathrm{eff},t+1|t}^{(k,k),ctrl}\left(\mathbf B_t^{\star},\mathbf q_t^{\star};a_t^{cal}\right)\right)$。

**推论 1：** 对每个 $\delta_k\in(0,1)$，

$$
\Pr\left(\left\|\mathbf e_t^{(k)}\right\|_2\leqslant\sqrt{\frac{\eta_t^{(k)}}{\delta_k}}\middle|\mathcal I_t\right)\geqslant1-\delta_k.\tag{57}
$$

**证明：** 由假设 $\mathbb E\left[\left\|\mathbf e_t^{(k)}\right\|_2^2\middle|\mathcal I_t\right]\leqslant\eta_t^{(k)}$。对 $\left\|\mathbf e_t^{(k)}\right\|_2^2$ 应用条件 Markov 不等式得 $\Pr\left(\left\|\mathbf e_t^{(k)}\right\|_2^2>\frac{\eta_t^{(k)}}{\delta_k}\middle|\mathcal I_t\right)\leqslant\delta_k$，即证式（57）。$\square$

一旦所述迹占优条件成立，该结果是无分布的。因此，较小的 $\eta_t^{(k)}$ 给出更紧的条件误差界，使该协方差迹具有直接的可靠性解释。在 IRS 选择之前，控制器由式（32）计算 $U_{pre,t}$ 与 $U_{floor,t}$，以判定重标定是否可执行。当所有活跃用户都已初始化级联信道状态时，仅当 $U_{pre,t}>\varepsilon_{cal}$ 且 $U_{floor,t}<U_{pre,t}$ 才选择重标定。因此，即使绝对风险阈值被超过，$U_{floor,t}\geqslant U_{pre,t}$ 仍会抑制重标定。第一个条件标记过高的归一化预测风险，第二个要求最差用户归一化风险存在预测下降。该可执行性检验基于模型，并不保证每个块的实得估计误差都更小。

## XI. 计算复杂度分析

本节刻画第 III—IV 节信道处理与第 VII—IX 节结构化控制器的在线复杂度。离线转移模型辨识、协方差校准与查找表、训练集归一化统计均不计入。令 $a_t\triangleq\left|\mathcal D_t\right|$、$Q_t^{tr}\triangleq\left|\mathcal Q_t^{tr}\right|$、$Q_t^{cand}\triangleq\left|\mathcal Q_t^{cand}\right|$。令 $K_t^{cas}\leqslant K$ 表示已初始化级联信道状态的用户数，$U$ 表示基本 IRS 单元数。定义 $G_t\triangleq\sum_{n_0\in\mathcal S_{N,t}^{feas}}G(n_0)$。对回退情形 $\mathcal S_{N,t}^{feas}=\emptyset$，与第 VIII-B 节一致地取 $G_t=G\left(\min\mathcal S_N\right)$。

对含 $s$ 个预测有效信道的临时 ZF 接收机，Gram 矩阵构造与伪逆需要 $C_{ZF}(s)=O\left(Ms^2+s^3\right)$。在稠密 $M\times M$ 有效信道误差协方差下，一次不确定性感知 ZF 速率评估的复杂度为 $C_{UAZF}^{(1)}(s)=O\left(Ms^2+s^3+sM^2\right)$，而在同一配置下评估全部 $s$ 个速率的上界为 $C_{UAZF}^{(\Sigma)}(s)=O\left(Ms^2+s^3+s^2M^2\right)$。

### A. 信道处理与物理度量

O-CA 跟踪器的协方差、互协方差与增益矩阵复杂度为 $C_t^{OCA}=O\left(a_t\left(a_t+1\right)^2M^3\right)$。在注 2 的稳态条件下，这些矩阵可离线计算，直达信道均值的在线预测与校正只需 $C_t^{OCA,ss}=O\left(\left(K+a_t\right)M^2\right)$。当 $a_t^{cal}=1$ 时，半盲获取处理一个最小反射块与 $N$ 个 DFT 编码重复数据块。差分恢复、逆 DFT 以及向所跟踪单元—波束状态的投影，给出重标定阶段复杂度

$$
C_t^{SB}=O\left(NM^2\left(\alpha+a_t\right)+a_tMN\left(\log N+Q_t^{tr}\right)\right),
$$

其中更低维的 $a_t\times a_t$ 运算被该界吸收，因为 $a_t\leqslant M$。

作为对比，完整 $MN$ 维级联状态的协方差传播需要 $O\left(K_t^{cas}M^3N^3\right)$，而传播全部 $M$ 维基本单元—波束协方差需要 $O\left(K_t^{cas}UQ_t^{tr}M^3\right)$。在第 IV-C 节的结构化实现中，协方差序列从预计算的龄期相关表中检索，在线只传播单元—波束均值，得到

$$
C_t^{beam}=O\left(K_t^{cas}UQ_t^{tr}M^2\right).
$$

可执行性检验需要 $C_t^{cal}=O\left(a_tUQ_t^{tr}M\right)$。全孔径参考响应在同一次遍历中累加并缓存，因此参考波束评估额外增加 $O\left(a_tQ_t^{tr}M\right)$，而构造参考 ZF 接收机与全部有向接收机一致干扰度量需要

$$
C_t^{int}=O\left(C_{ZF}(a_t)+a_t^2M^2\right).
$$

### B. 结构化资源控制复杂度

跨所有可行单元尺寸，孤立归属阶段需要 $a_tQ_t^{cand}G_t$ 次系统速率评估，坐标扫描额外需要 $Q_t^{cand}G_t$ 次。因此 IRS 侧的主要物理评估代价为

$$
C_t^{IRS}=O\left(Q_t^{cand}\left(a_t+1\right)G_tC_{UAZF}^{(\Sigma)}(a_t)\right).
$$

候选尺寸可行性检验与增量的残余可行性更新只额外增加 $O\left(\left|\mathcal S_N\right|a_t+a_tG_t\right)$ 次运算。

固定 IRS 动作之后，用于并列判决的单用户速率只计算一次并缓存；其代价被后续的信道候选评估所主导。对活跃用户排序需要 $O\left(a_t\log a_t\right)$。令 $s_{t,c}^{(m)}$ 表示第 $m$ 个被处理用户在信道 $c$ 上评估时的临时共信道集合大小。顺序信道分配代价为

$$
C_t^{ch}=O\left(\sum_{m=1}^{a_t}\sum_{c=1}^{C}C_{UAZF}^{(1)}\left(s_{t,c}^{(m)}\right)+a_t^2+a_t\log a_t\right),
$$

其中 $a_t^2$ 项对应利用缓存接收机一致度量所作的成对风险累加。由于 $s_{t,c}^{(m)}\leqslant a_t$，更简单的上界为

$$
C_t^{ch}=O\left(Ca_t\left[Ma_t^2+a_t^3+a_tM^2\right]+a_t^2+a_t\log a_t\right).
$$

### C. 总体在线复杂度与标度

采用逐用户滚动求和时，服务历史与平滑速率更新每块需要 $O(K)$ 次运算。忽略低阶的可行性、排序与缓存参考波束项，一个紧致的在线上界为

$$
\begin{aligned}
C_t^{online}=O\Big(&\frac{a_t\left(a_t+1\right)}{2}M^3+K_t^{cas}UQ_t^{tr}M^2+a_tUQ_t^{tr}M\\
&+a_t^{cal}\left[NM^2\left(\alpha+a_t\right)+a_tMN\left(\log N+Q_t^{tr}\right)\right]\\
&+C_{ZF}(a_t)+a_t^2M^2+Ca_tC_{UAZF}^{(1)}(a_t)+K\\
&+Q_t^{cand}\left(a_t+1\right)G_tC_{UAZF}^{(\Sigma)}(a_t)\Big),
\end{aligned}\tag{58}
$$

其中半盲项仅在 $a_t^{cal}=1$ 时产生。

在给定所选重标定模式的条件下，对归属、波束与信道选择的穷举枚举最多包含 $N_t^{ex}=C^{a_t}\sum_{n_0\in\mathcal S_{N,t}^{feas}}\left(a_tQ_t^{cand}\right)^{G(n_0)}$ 个候选。相比之下，结构化过程最多评估 $N_t^{IRS,eval}=Q_t^{cand}\left(a_t+1\right)G_t$ 个 IRS 候选，以及 $N_t^{ch,eval}=Ca_t$ 个顺序信道候选。因此，当 $\left|\mathcal S_N\right|$、$Q_t^{cand}$ 与 $C$ 固定时，资源控制搜索随联合动作维数呈多项式而非指数标度。降阶预测把完整的 $MN$ 维协方差传播替换为独立的 $M$ 维单元—波束均值传播与离线协方差检索。

## XII. 仿真设置与数值结果

本节评估所提出的信道获取、预测与确定性资源控制框架。考虑第 II 节的单小区上行模型，主要物理、移动性、IRS、服务与控制器参数汇总于表 I。

### A. 仿真设置与留出集汇总

BS 与 IRS 中心分别位于 $(0,0,10)$ m 与 $(50,20,5)$ m，用户高度为 $1.5$ m。初始用户位置独立抽取于 $10\leqslant x\leqslant100$ m 与 $-40\leqslant y\leqslant60$ m，并要求与 BS 和 IRS 的距离均不小于 $10$ m。用户以随机初始方向运动，速度上限为标称值 $v_{\max}=3$ m/s，并用边界反射约束轨迹。直达链路遵循所采用的城市微小区模型，而与 IRS 相关的链路包含依赖几何的大尺度衰减与 Rician 小尺度衰落。通过激活一个用户来避免空的活动实现。

对重复数据获取，在 $96$ 个活跃子载波上使用一个 OFDM 符号作为直达信道导频，即 $\tau_p=96$ 个信道使用，而重复未知块为 $\alpha=96$ 个信道使用。取 $N=32$ 时，重标定使用一个最小反射基线与 $32$ 个 DFT 编码 IRS 状态。每个物理块包含 $S=56\times96=5376$ 个信道使用，剩余 $\beta=S-\tau_p-\alpha(N+1)=2112$ 个常规数据信道使用，相当于 $22$ 个 OFDM 符号。由于只有第一份重复数据副本携带新鲜载荷，重标定块的新鲜载荷比例为 $23/56=41.071\%$，纯预测块为 $55/56$。这些因子直接计入所有报告的净块速率。

将第 VII-A 节的可执行性感知重标定规则与绝对风险参考 $a_{t,abs}^{cal}=\mathbf 1\left\{U_{pre,t}>\epsilon_{cal}\right\}$ 进行比较。所提规则额外要求预测的获取后协方差底低于当前预测风险。两种规则都在 $30$ 个此前未见环境上的成对轨迹上评估，每个环境包含 $160$ 个物理块，且不基于留出集做参数选择。

如表 II 所汇总，可执行性条件把平均重标定率从 $3.103\%$ 降至 $2.126\%$。第 95 百分位与环境级最大速率分别从 $12.931\%$ 降至 $6.034\%$、从 $17.241\%$ 降至 $7.759\%$，最长连续重标定序列从七个块降至两个块。在满足绝对风险条件的 $150$ 个块中，有 $75$ 个（$50\%$）被可执行性检验拒绝。这一降低并未损害实得吞吐量：当 $C=2$ 时平均和速率提高 $0.622\%$，$C=3$ 时提高 $0.728\%$。相应的 Jain 指标变化仅为 $-0.0020$ 与 $-0.0009$，而最小平滑用户速率分别提高 $0.878\%$ 与 $0.920\%$。两种信道数下成对吞吐量变化的中位数均为零，进一步说明所提规则主要抑制的是那些预测协方差底不带来不确定性下降的重标定。因此，可执行性条件起到结构性保护作用，而不是又一个连续调参的控制项。

### B. 数值结果与设计验证

在固定仿真配置与留出协议之后，下面用图 2—8 依次评估获取精度、降阶预测、重标定行为、IRS 辅助吞吐量、控制器设计选择、端到端性能与鲁棒性。差分重复数据获取独立于资源控制器进行评估，采用归一化均方误差

$$
\mathrm{NMSE}_{L,t}^{(k)}[\mathrm{dB}]=10\log_{10}\frac{\left\|\hat{\mathbf L}_t^{(k)}-\mathbf L_t^{(k)}\right\|_F^2}{\left\|\mathbf L_t^{(k)}\right\|_F^2},
$$

并以 dB 报告。考虑三种参照：TRUE-H 使用真实直达信道矩阵，O-CA-H 表示基于 O-CA 估计的实际获取，Oracle-X 假设已知重复的用户数据矩阵。半盲误差协方差 $\mathbf C_{SB}^{(k)}$ 由独立获取实现估计，并在在线评估前冻结。

图 2 刻画所提半盲获取的有限样本精度与锚点引起的误差底。在图 2(a) 中，TRUE-H 与 Oracle-X 参照几乎重合，NMSE 从 $\alpha=16$ 时约 $-33.5$ dB 改善到 $\alpha=160$ 时 $-44.8$ dB，说明在具备可靠多用户分离时差分 DFT 恢复是准确的。相比之下，实际 O-CA-H 结果在整个扫描范围内保持在约 $-12.06$ dB，表明更长的重复数据块无法消除由不完美直达信道锚点造成的误差。在标称 $\alpha=96$ 时，预测的仅锚点误差底与仿真 O-CA-H NMSE 分别为 $-12.065$ 与 $-12.064$ dB，逐环境相关系数为 $1.000$，如图 2(b) 所示。失配矩阵平均非对角能量占 $17.57\%$，其中位数与第 90 百分位条件数仅为 $1.385$ 与 $1.969$。观察到的误差底主要由直达信道估计误差导致的跨用户混合引起，而非数值病态或重复数据长度不足。因此该获取误差被纳入 $\mathbf C_{SB}^{(k)}$，供后续不确定性感知控制使用。

图 3 验证由实际半盲获取初始化的降阶波束域预测器。如图 3(a) 所示，平均 NMSE 仅从 $h=0$ 的 $-16.344$ dB 退化到 $h=10$ 的 $-14.052$ dB。虽然完美初始状态参照在短预测龄期明显更准确，但其优势从 $h=1$ 时约 $9.30$ dB 减小到 $h=10$ 时 $2.12$ dB，表明时间过程不确定性逐渐比初始获取误差更重要。图 3(b) 进一步表明，最终控制器保留的原始协方差与经验预测误差能量高度吻合：对 $h=0,1,2,5,10$，经验值与预测值之差分别为 $-0.070$、$-0.058$、$-0.061$、$-0.117$ 与 $0.078$ dB，与理想聚合校准的偏差保持在 $0.12$ dB 以内，而归一化协方差始终更保守。这些结果支持在后续有效信道预测、重标定与可靠性分析中采用原始获取后协方差与按龄期索引的降阶不确定性模型。

与表 II 一致，图 4 展示可执行性感知规则的分布效果。图 4(a) 显示平均重标定率降低 $31.5\%$，同时上尾变异性与重复重标定事件明显减少。图 4(b) 表明更低的获取频率并未降低实得吞吐量：成对平均增益为 $C=2$ 时 $0.758$ Mbps（$0.622\%$）、$C=3$ 时 $1.132$ Mbps（$0.728\%$）。此外，$70\%$ 的环境吞吐量完全相同，只有 $3.33\%$ 出现负的成对变化。结合表 II 的公平性与最小速率结果，这些发现表明可执行性在显著降低重标定开销的同时保持了控制器的速率公平行为。

图 5 在相同信道实现与块级载荷计费下，比较所提 IRS 辅助控制与仅直达传输的实得物理层性能。平均实得净和速率从 $79.966$ Mbps 提高到 $91.234$ Mbps，扣除获取开销后对应 $14.09\%$ 的增益。如图 5(a) 所示，$93.87\%$ 的评估块获得正的成对净速率增益，第 10、50、90 百分位增益分别为 $0.154$、$0.587$、$1.022$ dB。预测与实得 IRS 辅助净速率之间的相关系数为 $0.914$，支持把不确定性感知预测速率作为结构化控制器的物理排序度量。图 5(b) 进一步表明，全部五个用户的平均净吞吐量都更高，个体增益在 $4.20\%$ 到 $28.20\%$ 之间。合并的活跃用户第 10 百分位速率从 $9.830$ Mbps 提高到 $11.737$ Mbps，约改善 $19.4\%$。因此，聚合的 IRS 增益并未集中于少数用户，对低尾用户性能同样有利。

图 6 联合验证接收机一致的信道分配规则与最终控制器保留的结构选择。在图 6(a) 中，所提修正使平均实得和速率相对仅速率分配器在 $C=2$ 时提高 $0.228$ Mbps（$0.188\%$）、$C=3$ 时提高 $0.930$ Mbps（$0.605\%$），而精确预测速率搜索尽管最大化了预测目标，却使实得速率分别降低 $4.716$ 与 $3.789$ Mbps。图 6(b) 确认该修正是选择性的：在 $77.56\%$ 与 $86.35\%$ 的成对快照中仅速率分配保持不变，而所提规则在两种信道数下提高实得速率的次数都多于降低的次数。图 6(c) 与 (d) 的消融表明，进一步的结构复杂度几乎没有可重复的增益。可变分区相对等尺寸设计仅带来 $0.283$ Mbps 的平均改善，中位增益为零，且仅在 $10.43\%$ 的可比周期中为正；第二次预测波束扫描只在 $3.76\%$ 的时隙改变波束向量，平均增益仅 $0.027$ Mbps。相应的实得 oracle 审计保留了 $0.668$ 与 $2.528$ Mbps 的平均余量，说明剩余机会主要与预测失配有关，而不是分区或波束搜索灵活性不足。这些结果支持在最终控制器中采用接收机一致修正、等尺寸 IRS 候选与单轮波束精化。最细的允许粒度 $N_0=8$ 在 $77.64\%$ 的稳态块中被选中，常规块与重标定块中的粒度分布相似。单独的负载惩罚没有可重复增益，因此其权重设为零，支持第 IX 节的两项信道效用。

图 7 在固定获取、IRS 控制、重标定与信道分配决策之后评估完整的确定性控制器。在 $30$ 个未触碰物理环境上，实得全块和速率对 $C=2$ 为 $122.492\pm4.466$ Mbps、对 $C=3$ 为 $156.667\pm5.858$ Mbps，对应平均 Jain 指标为 $0.9041$ 与 $0.9396$，最小平滑用户速率为 $16.680$ 与 $22.716$ Mbps。正的服务亏空出现在 $21.60\%$ 的活跃用户实例中，说明服务可行性机制被实际触发；而不可行稳态的比例与动作后服务违约率均为零。因此，最终控制器在此前未见的移动环境中保持了可行的滑动窗口服务决策，以及稳定的吞吐量与公平性。

图 8 在固定参数、不做重新调参的情况下，评估冻结控制器在不同移动性与业务负载下的表现。将 $v_{\max}$ 从 $1$ 提高到 $5$ m/s，会使平均实得和速率在 $C=2$ 时从 $146.123$ 降至 $111.056$ Mbps、在 $C=3$ 时从 $170.376$ 降至 $150.506$ Mbps，反映出信道预测难度上升。同时，平均可执行重标定率从 $4.885\%$ 降至 $0.029\%$——这并非因为跟踪变好，而是因为可执行性条件越来越多地拒绝那些预测收益不足以抵消开销的重标定。在负载扫描下，最小平滑用户速率与 Jain 指标在标称 $p_{act}=0.8$ 以内保持良好，$C=2/3$ 时分别达到 $15.138/20.791$ Mbps 与 $0.8880/0.9257$，但在全活跃业务下明显下降，呈现出饱和区间。在任何测试的移动性或负载点上，都未出现稳态不可行状态或动作后服务违约。因此，控制器在测试的压力条件下保持了服务可行性，同时在相关移动性与中等负载范围内表现出性能退化。

## XIII. 结论

本文研究了分区 IRS 辅助移动 mMIMO IoT 上行链路中的 CSI 维持与资源控制联合问题。O-CA 跟踪直达链路，差分半盲获取刷新级联链路，有限块校准量化其不确定性；两次刷新之间只传播单元—波束均值，并按龄期查表协方差。混合整数模型涵盖吞吐量、公平性、中断、切换代价与滑动窗口 IRS 服务，并通过可执行性重标定、可行等尺寸分区、残差可行归属、单轮波束精化、同块载荷计费，以及带更新不确定性感知 ZF 速率的服务优先接收机一致分配来实现。分析证明了服务可行性保持、有效信道预测误差界与无分布可靠性界，以及多项式在线复杂度。仿真复现了锚点引起的获取误差底，验证了降阶不确定性模型，把平均重标定降低 $31.5\%$，并相对仅直达传输取得 $14.09\%$ 的净速率增益。接收机一致分配提高了实得速率；消融支持等尺寸分区与单轮扫描精化，在标称、移动性或负载压力下均无动作后服务违约。

未来工作可评估实际硬件损伤与控制时延，并用实测信道与实验 IRS 平台进行验证；还可研究在变化传播条件下自适应更新协方差—龄期表，以及扩展到存在小区间干扰与协调 IRS 控制的多小区系统。

## 图注与表注

### 表 I：主要仿真参数（原 PDF 第 13 页）

| 参数 | 取值 |
|---|---|
| BS 天线数，$M$ | 100 |
| 导频组内用户数，$K$ | 5 |
| 载频 | 3.5 GHz |
| 子载波间隔 | 30 kHz |
| 活跃子载波数 | 96 |
| 上行信道带宽，$B_{\mathrm{ch}}$ | 2.88 MHz |
| 物理控制块时长 | 2 ms |
| 每控制块 OFDM 符号数 | 56 |
| 用户发射功率，$p^{(k)}$ | 23 dBm |
| 接收机噪声系数 | 5 dB |
| 最大标称用户速度 | 3 m/s |
| 用户活跃概率 | 0.8 |
| IRS 控制维度，$N$ | 32 |
| IRS 基本分辨率，$\Delta N$ | 8 |
| 波束码字数量 | 4 |
| IRS Rician 因子 | 10 dB |
| 候选单元尺寸，$\mathcal S_N$ | $\{8,16,32\}$ |
| 服务窗口，$W$ | 4 |
| 最小 $W$ 块服务量，$s_{\min}^{(k)}$ | 8 个单元，$\forall k$ |
| 速率平滑因子，$\alpha_R$ | 0.05 |
| 重标定阈值，$\varepsilon_{cal}^{dB}$ | −3.5 dB |
| 信道风险系数，$\lambda_G$ | 2 |
| 参考波束不确定性系数，$\lambda_{ref}$ | 1 |
| 上行信道数 | $C\in\{2,3\}$ |

### 表 II：重标定规则的最终留出集比较（原 PDF 第 13 页）

| 指标 | 绝对触发 | 可执行性感知 |
|---|---|---|
| 平均重标定率 [%] | 3.103 | 2.126 |
| 第 90 百分位 [%] | 6.897 | 5.172 |
| 第 95 百分位 [%] | 12.931 | 6.034 |
| 环境级最大速率 [%] | 17.241 | 7.759 |
| 最长连续块数 | 7 | 2 |
| $C=2$ 实得速率 [Mbps] | 121.734 | 122.492 |
| $C=3$ 实得速率 [Mbps] | 155.535 | 156.667 |
| $C=2$ Jain 指标 | 0.9060 | 0.9041 |
| $C=3$ Jain 指标 | 0.9405 | 0.9396 |
| $C=2$ 最小平滑速率 [Mbps] | 16.535 | 16.680 |
| $C=3$ 最小平滑速率 [Mbps] | 22.509 | 22.716 |

### 图注

**图 1（原 PDF 第 3 页）：** 分区 IRS 辅助移动 mMIMO IoT 上行链路的系统模型与因果预测感知控制架构。图中标出直达信道（用户→BS）、IRS 辅助信道（用户→IRS）与 IRS→BS 链路，第 1 组用户 $1,2,\ldots,K$，含 $N$ 个反射单元的 IRS，以及 BS 侧的"信道跟踪与级联 CSI 更新"模块（O-CA 跟踪直达 CSI、级联信道更新）。控制器一侧给出预测感知确定性控制器：可执行性感知重标定（$a_t^{cal}=1$ 时做重复数据 DFT 获取得到半盲后验，$a_t^{cal}=0$ 时做降阶单元波束预测）、细固定基本跟踪网格、等尺寸控制单元、等尺寸 IRS 共享、单轮波束精化、接收机一致信道分配与同块载荷计费；$C$ 条正交上行信道上的上行分配记为 $\mathbf C_t^{\star}$，级联信道记为 $\mathbf L_t^{(k)}=\mathbf G_t^B\operatorname{diag}\left(\mathbf g_t^{I,(k)}\right)$。

**图 2（原 PDF 第 14 页）：** 差分半盲获取的精度与直达锚点引起的误差底。(a) 获取 NMSE 与锚点误差底：完整级联信道 NMSE [dB] 随重复数据块长度 $\alpha$（信道使用数）的变化，对比半盲 TRUE-H、所提 O-CA-H、Oracle-X 与预测锚点误差底，竖点线标出 $\alpha=96$；(b) $\alpha=96$ 时逐环境的误差底闭合：实际 O-CA-H NMSE 与预测锚点底 NMSE 的散点对比，平均差 $+0.001$ dB、相关系数 $1.000$。

**图 3（原 PDF 第 14 页）：** 冻结结构化物理信道下，降阶波束域预测与不确定性模型的验证。(a) 预测精度与 CSI 龄期：平均波束域 NMSE [dB] 随预测龄期 $h$（控制块数）的变化，对比半盲初始化与完美初始状态；(b) 经验误差能量与协方差预测误差能量：平均波束域误差能量（dB）随 $h$ 的变化，对比经验预测误差、原始协方差 $P_0$ 预测（最终采用）与归一化协方差 $P_0$ 预测（审计）。

**图 4（原 PDF 第 15 页）：** 可执行性感知重标定规则在未触碰成对留出集上的效果。(a) 重标定频率分布：环境级重标定率的经验 CDF，对比绝对触发与可执行性感知两种规则，图内标注均值由 $3.103\%$ 降至 $2.126\%$、第 95 百分位由 $12.931\%$ 降至 $6.034\%$；(b) 成对实得吞吐量变化：按环境百分位给出 $\Delta R_{\mathrm{real}}=R_{\mathrm{act}}-R_{\mathrm{abs}}$（Mbps），$C=2$ 平均 $+0.758$ Mbps（$+0.622\%$），$C=3$ 平均 $+1.132$ Mbps（$+0.728\%$）。

**图 5（原 PDF 第 15 页）：** 所提 IRS 辅助物理层控制相对仅直达参照的实得净吞吐量增益。(a) 块级净速率增益分布：经验 CDF 随成对净速率增益 $10\log_{10}\left(R_{\mathrm{IRS}}/R_{\mathrm{dir}}\right)$（dB）的变化，竖虚线为 0 dB；(b) 各用户平均纠正后净吞吐量：用户 1—5 在仅直达（Direct-only）与所提 IRS 辅助（Proposed IRS-assisted）两种方案下的对比。

**图 6（原 PDF 第 16 页）：** 接收机一致信道分配的验证与最终控制器的结构消融。(a) 相对仅速率分配的变化：$C=2,3$ 时所提接收机一致方案与精确预测搜索（审计）的平均实得速率变化（Mbps）；(b) 接收机一致筛选：成对快照中三种结果的占比（所提更好 / 不变 / 仅速率更好），$C=2,3$；(c) 等尺寸与可变分区的对比：实得速率差（可变分区减等尺寸）的经验 CDF，对比预测选择的可变分区与实得 oracle 可变分区（审计）；(d) 一次与两次波束扫描的对比：相对单轮扫描基线的实得速率变化（Mbps）的经验 CDF，对比第二次预测扫描与实得 oracle 扫描（审计）。

**图 7（原 PDF 第 17 页）：** 最终确定性控制器在未触碰物理留出集上的端到端性能。(a) 端到端速率：实得和速率（Mbps）的经验 CDF，$C=2$ 与 $C=3$；(b) 公平性与服务底：Jain 指标随最小平滑用户速率（Mbps）的散点分布，$C=2$ 与 $C=3$；(c) 服务完整性：正服务亏空（$21.60\%$）、不可行稳态（$0.0000\%$）与动作后违约（$0.0000\%$）的比例。

**图 8（原 PDF 第 17 页）：** 最终确定性控制器对移动性与业务负载的鲁棒性与压力响应。(a) 吞吐量与移动性：平均实得和速率（Mbps）随最大用户速度 $v_{\max}\in\{1,3,5\}$ m/s 的变化，$C=2$ 与 $C=3$；(b) 可执行重标定与移动性：平均可执行重标定率（%）随 $v_{\max}$ 的变化；(c) 服务底与业务负载：平均最小平滑用户速率（Mbps）随用户活跃概率 $p_{act}\in\{0.4,0.6,0.8,1\}$ 的变化；(d) 公平性与业务负载：平均 Jain 指标随 $p_{act}$ 的变化。

## 参考文献（英文原书目）

以下按原 PDF 第 18 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

[1] M. Tariq, S. Ahmad, and H. V. Poor, “Dynamic resource allocation in IoT enhanced by digital twins and intelligent reflecting surfaces,” IEEE Internet Things J., vol. 11, no. 16, pp. 27295–27302, Aug. 2024.

[2] Z. Chen, L. Huang, S. Xia, B. Tang, M. Haardt, and X. Y. Zhang, “Parallel channel estimation for RIS-assisted Internet of Things,” IEEE Trans. Intell. Transp. Syst., vol. 25, no. 8, pp. 9762–9773, Aug. 2024.

[3] X. Chen, J. Shi, Z. Yang, and L. Wu, “Low-complexity channel estimation for intelligent reflecting surface-enhanced massive MIMO,” IEEE Wireless Commun. Lett., vol. 10, no. 5, pp. 996–1000, May 2021.

[4] H. Guo and V. K. N. Lau, “Uplink cascaded channel estimation for intelligent reflecting surface assisted multiuser MISO systems,” IEEE Trans. Signal Process., vol. 70, pp. 3964–3977, 2022.

[5] J. Amadid, A. Khabba, Z. El Ouadi, and A. Zeroual, “Channel estimation based intelligent reflecting surfaces for massive MIMO system considering spatially correlated channels,” Trans. Emerg. Telecommun. Technol., vol. 36, no. 2, Feb. 2025, Art. no. e70066.

[6] G. Interdonato, F. Di Murro, C. D’Andrea, G. Di Gennaro, and S. Buzzi, “Approaching massive MIMO performance with reconfigurable intelligent surfaces: We do not need many antennas,” IEEE Trans. Commun., vol. 73, no. 6, pp. 4000–4016, Jun. 2025.

[7] P. Wang, D. Li, Y. Zhang, and X. Chen, “Real-time multi-IRS partitioning for sum-rate optimization in a UAV-IRS-aided vehicular communication system,” Digit. Signal Process., vol. 160, May 2025, Art. no. 105047.

[8] H. Soltanizadeh and A. Falahati, “Uncoordinated channel tracking algorithms and their stability in practical scenario for high-rate IoT devices with massive MIMO,” IEEE Trans. Veh. Technol., vol. 73, no. 6, pp. 7962–7979, Jun. 2024.

[9] H. Soltanizadeh and A. Falahati, “Channel tracking of uncoordinated access under uncertain evolution for massive connectivity with massive MIMO,” AEU–Int. J. Electron. Commun., vol. 141, Nov. 2021, Art. no. 153961.

[10] H. Soltanizadeh and A. Falahati, “Moving devices channel tracking with massive MIMO systems over high-rate internet of things,” AEU–Int. J. Electron. Commun., vol. 157, Dec. 2022, Art. no. 154435.

[11] G. Zhou, Z. Peng, C. Pan, and R. Schober, “Individual channel estimation for RIS-aided communication systems—A general framework,” IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 12038–12053, Sep. 2024.

[12] Z. Huang, C. Liu, Y. Song, H. Wang, H. Zhou, and S. Shen, “Manifold optimization empowered two-timescale channel estimation for RIS-assisted systems,” IEEE Trans. Veh. Technol., vol. 73, no. 10, pp. 15034–15048, Oct. 2024.

[13] R. Wang, Z. Wang, L. Liu, S. Zhang, and S. Jin, “Reducing channel estimation and feedback overhead in IRS-aided downlink system: A quantize-then-estimate approach,” IEEE Trans. Wireless Commun., vol. 24, no. 2, pp. 1325–1338, Feb. 2025.

[14] N. Ginige, A. S. de Sena, N. H. Mahmood, N. Rajatheva, and M. Latva-Aho, “Efficient channel prediction for beyond diagonal RIS-assisted MIMO systems with channel aging,” IEEE Trans. Veh. Technol., vol. 74, no. 8, pp. 12658–12672, Aug. 2025.

[15] K. Zhi et al., “Two-timescale design for reconfigurable intelligent surface-aided massive MIMO systems with imperfect CSI,” IEEE Trans. Inf. Theory, vol. 69, no. 5, pp. 3001–3033, May 2023.

[16] Y. Cui, J. Guo, C.-K. Wen, S. Jin, and E. Tong, “End-to-end beamforming-oriented CSI acquisition framework for RIS-assisted networks,” IEEE Trans. Wireless Commun., vol. 25, pp. 4953–4965, 2026.

[17] C. Liu et al., “Robust transmission design for RIS-assisted high-speed train communication coverage enhancement with imperfect cascaded channels,” IEEE Trans. Wireless Commun., vol. 25, pp. 15911–15928, 2026.

[18] A. S. Alwakeel and A. Elzanaty, “Semi-blind channel estimation for intelligent reflecting surfaces in massive MIMO systems,” IEEE Access, vol. 10, pp. 127783–127797, 2022.

[19] A. L. Magalhães, A. L. F. de Almeida, and G. T. de Araújo, “Reducing complexity of data-aided channel estimation in RIS-assisted communications,” IEEE Wireless Commun. Lett., vol. 14, no. 9, pp. 2758–2762, Sep. 2025.

[20] N. Li, R. Xiong, Y. Deng, F. Xu, and H. Deng, “Semi-blind joint channel estimation and symbol detection for multi-RIS aided MIMO systems,” IEEE Wireless Commun. Lett., vol. 14, no. 3, pp. 586–590, Mar. 2025.

[21] H. Hashida et al., “Joint design of intelligent reflecting surface partitioning and scheduling for multiuser communications,” IEEE Trans. Netw. Sci. Eng., vol. 13, pp. 8397–8409, 2026.

[22] Y. Wu, D. Xu, D. W. K. Ng, R. Schober, and W. Gerstacker, “Globally optimal resource allocation design for discrete phase shift IRS-assisted multiuser networks with perfect and imperfect CSI,” IEEE Trans. Wireless Commun., vol. 24, no. 2, pp. 1306–1324, Feb. 2025.

[23] J. Jia, K. Yu, X. Mu, Y. Liu, J. Chen, and X. Wang, “Delay-aware resource allocation for RIS assisted semi-grant-free NOMA systems,” IEEE Trans. Commun., vol. 73, no. 3, pp. 2016–2031, Mar. 2025.

[24] P. Zivuku et al., “Geographical fairness in multi-RIS-assisted networks in smart cities: A robust design,” IEEE Trans. Commun., vol. 73, no. 8, pp. 6622–6638, Aug. 2025.

[25] K.-L. Chan, R. Y. Chang, F.-T. Chien, and H. V. Poor, “Beamforming and load-balanced user association in RIS-aided mmWave systems via adaptive attention graph neural networks,” IEEE Trans. Wireless Commun., vol. 25, pp. 5781–5796, 2026.

[26] A. Rahimian, “A baseline mobility-aware IRS-assisted uplink framework with energy-detection-based channel allocation,” 2026, arXiv:2603.16595.

[27] H. Soltanizadeh, S. Farahmand, and S. M. Razavizadeh, “Coordinated versus uncoordinated channel tracking for high-rate internet of things in multiuser massive MIMO: Algorithms and performance,” Signal Process., vol. 186, Sep. 2021, Art. no. 108132.

[28] H. Soltanizadeh and A. Falahati, “Low complexity channel tracking algorithms for coordinated and uncoordinated pilot access over high-rate internet of things,” Internet of Things, vol. 24, Dec. 2023, Art. no. 100946.

**本页范围与校对状态：** 本页依据 arXiv:2609.26601v1（18 页）完成全文中文翻译：摘要、索引词、第 I—XIII 节全部正文与 A/B/C 小节、命题 1、定理 1 与推论 1 及其证明、算法 1—2、图 1—8 中文图注、表 I—II 逐格转录、参考文献 [1]—[28] 英文原条目。公式编号 (1)—(58) 按原文保留；表 I 与表 II 的数值已用 PDF 第 13 页渲染图逐格核对，图 2—8 的面板构成已用 PDF 第 14—17 页渲染图核对。原文（arXiv 版）不含附录与作者简介，故本页不含相应内容。**逐句逐式终校未做**；图内曲线未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接；原文中定理 1 假设使用的 $\xi_d^{(k)}$ 与证明式 (56) 印作 $\varepsilon_d^{(k)}$ 的符号不一致，以及式 (30)、(45)—(50) 的抽取上下标可能不完整，均已就地加注。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
