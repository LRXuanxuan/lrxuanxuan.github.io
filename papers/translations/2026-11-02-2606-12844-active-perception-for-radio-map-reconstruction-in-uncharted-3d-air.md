---
layout: page
title: "未知 3D 空地环境中的无线电地图重建主动感知｜中文全文译文"
permalink: /papers/translations/2026-11-02-2606-12844-active-perception-for-radio-map-reconstruction-in-uncharted-3d-air/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/06c412124f26d651/) · [原文 arXiv](https://arxiv.org/abs/2606.12844/) · [全部目录](/papers/catalog/)

# 未知 3D 空地环境中的无线电地图重建主动感知

**原题：** Active Perception for Radio Map Reconstruction in Uncharted 3D Air-Ground Environments  
**作者：** Wenlihan Lu、Miaowen Wen、Shijian Gao（单位按 PDF 原文转写）  
**单位：** Wenlihan Lu 与 Shijian Gao：香港科技大学（广州）物联网学域（Internet of Things, The Hong Kong University of Science and Technology (Guangzhou)），中国，邮箱 `wlu162@connect.hkust-gz.edu.cn`、`shijiangao@hkust-gz.edu.cn`；Miaowen Wen：华南理工大学电子与信息工程学院（School of Electronic and Information Engineering, South China University of Technology），广州，中国，邮箱 `eemwwen@scut.edu.cn`。作者身份标注：Wenlihan Lu（Graduate Student Member, IEEE）、Miaowen Wen（Senior Member, IEEE）、Shijian Gao（Member, IEEE）。  
**版本：** arXiv:2606.12844v2（PDF 首页 arXiv 戳：arXiv:2606.12844v2 [eess.SP]，22 Oct 2026）；16 页；预印本/状态未确认（含早期 WCSP2025 工作）。  
**范围与状态：** 全文中文译稿：摘要、索引词、正文第 I–VI 节及全部小节与子小节、式 (1)–(20)、算法 1–3、表 I–XI 逐格、图 1–13 图注、参考文献 [1]–[47]（英文原条目），并含原文首页作者脚注；许可：CC BY 4.0。逐句逐式终校未做。

**作者脚注（原文第 1 页）：** 本文部分工作已在 2025 IEEE 国际无线通信与信号处理会议（2025 IEEE International Conference on Wireless Communications and Signal Processing, WCSP）上发表 [1]。

## 摘要

无线电地图为低空网络系统提供必要基础。与通常通过路测（drive test）测量生成的地面无线电地图不同，绘制空地环境的无线电地图需要部署无人机（unmanned aerial vehicle, UAV）。这一转变在未知 3D 场景中带来两项严峻挑战。首先，稀疏的无线电测量与不完整的几何观测会妨碍准确重建。其次，大的 3D 动作空间与频谱扫描仪高能耗带来的严格功率约束，使有信息量的探索变得困难。为应对这些问题，本文提出 **3D 不确定性感知无线电主动建图**（3D uncertainty aware radio active mapping, **3D-URAM**），一个把建图过程解耦为两个离线训练阶段的闭环主动感知框架。在阶段 I，开发贝叶斯 U-Net，从稀疏测量与部分几何中恢复无线电地图，同时给出预测不确定性。在阶段 II，动态概率路线图与经近端策略优化（proximal policy optimization, PPO）训练的 Transformer 航点选择策略，在行程预算下最大化长时程不确定性下降。实验结果表明，与代表性基线相比，3D-URAM 将重建误差降低超过 50%。在 300 m×200 m 空间内的真实外场测试也验证了主动无线电地图重建的潜力。

**索引词：** 3D 无线电地图、空地环境、主动感知、贝叶斯深度学习、不确定性量化、强化学习。

## I. 引言

新兴 6G 移动计算应用要求无线网络从被动通信演进为主动的、环境感知的智能。无线电地图通过刻画感兴趣区域内无线传播的空间变化，为物理无线电环境提供数字表示 [2]–[4]。它可以编码关键信道指标，包括被广泛用于反映大尺度信号覆盖与链路质量的参考信号接收功率（reference signal received power, RSRP）[5]–[7]。这种空间智能对新兴低空无线网络 [8] 尤为关键，其中可靠的 UAV 连接需要有依据的资源管理与轨迹设计 [9]。此外，无线电地图还能为基于深度强化学习（deep reinforcement learning, DRL）的资源协调与波束赋形 [10] 以及中断感知路径规划 [11] 提供空间上下文。尽管重要性显著，在 3D 低空环境中构建准确的无线电地图仍是一项严峻挑战 [12]。与二维地面网络不同，空中信号传播本质上是三维且高度异质的，常受到复杂城市峡谷中严重阴影与多径衰落的制约 [13]。确定性射线追踪（ray tracing, RT）模型 [14] 提供物理上严格的预测，但依赖详尽且最新的几何先验，而这在实际部署中往往不可得 [15]。

为规避 RT 对完整几何知识与繁重计算的依赖，大量研究探索了替代重建范式。统计插值技术，包括克里金（kriging）[16]、矩阵补全 [17] 与高斯过程（Gaussian process, GP）[18]，利用空间相关性，但过度简化了复杂的无线电传播模式。近年来，深度学习已成为高保真无线电地图重建的主流方法 [19]。代表性深度学习方法，包括 RadioUNet [20]、基于生成对抗网络（GAN）的模型 [21]、基于图神经网络（GNN）的方法 [22]、基于 Transformer 的架构 [23], [24] 以及基于扩散的框架 [25]–[27]，同时提升了重建保真度与空间真实性。在确定性预测之外，[28] 用 U-Net 输出高斯分布的均值与方差，给出了无线电地图估计的早期概率化处理。

尽管这些重建进展在某些场景中表现良好，但它们从根本上依赖预先采集且足够密集的数据集。一个关键挑战在于如何获取这些有信息量的测量。在实际部署中，建立保证密集覆盖的大规模静态传感器网络十分困难，使 UAV 等移动智能体成为采样无线电信号的更优选择。近期 UAV 辅助 3D 频谱建图研究同样把有限资源下的高效采样列为关键设计需求 [29]。然而，UAV 机载测量受严格功耗预算约束——这既来自 UAV 有限的电池容量，也来自机载频谱扫描仪所需能量——不可避免地造成稀疏观测 [30]。这一现实要求**主动无线电建图**：智能体自主编排其探索，在有限功率预算下获取最具信息量的测量，从而把地图估计与序贯路径规划深度耦合。

现有基于移动智能体的主动无线电建图方法，试图通过用预测不确定性或启发式次优视点准则引导采样，来处理重建与探索之间的耦合。早期研究使用 GP 联合建模信号分布与预测方差 [31], [32]，但在复杂环境中存在可扩展性限制与表示能力不足的问题。其他方法依赖带事后（post-hoc）不确定性估计器的神经预测器 [30], [33]，这类估计器在未见区域可能给出校准不良的置信度。更重要的是，现有方法在未知 3D 空域中仍因两点而受限：它们通常依赖短时程贪心规划器 [34]，无法在长期信息增益与能量预算之间有效权衡；并且往往假设已知自由空间或静态地理数据库，无法刻画瞬态障碍 [35], [36]。因此，它们并不适合仅有部分几何先验的真实 3D 环境中的主动感知。表 I 总结了这些研究路线。

**表 I（原文 TABLE I；原文第 2 页页首）：** 无线电地图重建与主动无线电建图的比较。

| 文献 | 方法 | 3D 无线电地图 | 几何先验 | 发射机先验 | 不确定性量化 | 主动规划 |
|---|---|---|---|---|---|---|
| [16]–[18] | 统计插值 | × | × | × | 后验方差（仅 GP） | × |
| [19]–[27] | 确定性深度学习 | △ | 完整 | △ | × | × |
| [28] | 概率深度学习 | × | 完整 | ✓ | 仅 aleatoric | × |
| [31], [32] | 主动高斯过程 | △ | × | × | 后验方差 | 短时程 |
| [30] | 主动事后不确定性 | × | 完整 | × | 事后 | 短时程 |
| [33] | 主动事后不确定性 | × | 部分 | × | 事后 | 短时程 |
| 本文 | 3D-URAM（所提） | ✓ | 部分 | × | aleatoric + epistemic | 长时程 RL 策略 |

注：✓ 表示包含；△ 表示部分包含；× 表示不包含。

为解决部分几何先验、障碍物感知导航与长时程主动感知等挑战，我们提出 **3D 不确定性感知无线电主动建图**（3D-URAM），一个把在线几何感知、不确定性感知无线电重建与预算约束长时程探索紧密结合的闭环框架，面向未知 3D 环境。在阶段 I，用双掩码补全（dual masked inpainting）训练的贝叶斯 U-Net 从稀疏测量与部分几何中恢复密集 3D 无线电地图，同时量化预测不确定性，以识别在何处追加测量更有价值。在阶段 II，强化学习策略在在线构建的动态概率路线图（probabilistic roadmap, PRM）[37] 上运行，以选择无障碍航点，在行程预算下最大化长时程不确定性下降。两个模块离线训练，并被组合成迭代的感知-动作闭环，用于自主 3D 无线电地图获取。本文主要贡献概括如下：

- 构建一个 3D 贝叶斯 U-Net，以应对稀疏测量与不完整几何先验下的无线电地图重建。该方法的能力在于：既能恢复信号场，又能同时量化 aleatoric 与 epistemic 两类不确定性。
- 提出 3D 动态概率建图，以处理未知环境中的大体积动作空间。该组件使智能体能够直接由部分几何感知在线增量构建无碰撞的航点图。
- 设计基于 Transformer 的航点选择策略，以最大化长时程不确定性下降。该策略通过在严格行程预算下优化信息增益，代表了显著进展。
- 在大规模基准上的广泛评估表明，3D-URAM 比代表性基线取得更高的重建精度。在 300 m×200 m 空间中的补充开环外场案例研究，验证了其面向真实世界应用的实践潜力。

本文其余部分组织如下。第 II 节表述问题。第 III 节与第 IV 节分别详述所提出的阶段 I 重建与阶段 II 主动探索。第 IV 节还给出闭环部署与复杂度分析。第 V 节给出实验结果，第 VI 节总结全文。符号列于表 II。

**表 II（原文 TABLE II）：** 符号表。

| 变量 | 定义 |
|---|---|
| \(\Omega\) | 感兴趣 3D 区域。 |
| \(\mathbf p_k\) | 决策步 \(k\) 的 UAV 位置。 |
| \(\mathcal C(\mathbf p_k)\) | \(\mathbf p_k\) 处的相机视场覆盖区域。 |
| \(\mathcal M_k\) | 截至步 \(k\) 融合的全局占据地图。 |
| \(\mathcal W_k\) | 步 \(k\) 的候选航点集合。 |
| \(\mathbf w_{k,j}\) | \(\mathcal W_k\) 中的第 \(j\) 个候选航点。 |
| \(\Gamma(\mathbf p_k,\mathbf p_{k+1})\) | 转移 \(k\) 的先垂直后水平飞行路线。 |
| \(\Psi_k\) | 沿 \(\Gamma(\mathbf p_k,\mathbf p_{k+1})\) 采集的无线电测量。 |
| \(\mathcal Y_k\) | 步 \(k\) 可用的累积无线电测量。 |
| \(P,\ \hat P\) | 真值与重建的无线电地图（接收功率场）。 |
| \(f_\theta\) | 参数为 \(\theta\) 的重建网络。 |
| \(\pi\) | 感知（航点选择）策略。 |
| \(c(\mathbf p_k,\mathbf p_{k+1})\) | 一次航点转移的路线长度。 |
| \(C(\mathcal T_\pi)\) | 轨迹 \(\mathcal T_\pi\) 的累积路线长度。 |
| \(B\) | 最大累积路线长度预算。 |

## II. 问题陈述

本节建立 3D 主动无线电地图构建的系统模型，并表述 UAV 行程预算下重建与探索的联合优化问题。

### A. 系统模型

**环境地图构建。** 考虑一架在未知 3D 区域 \(\Omega\) 内运行的自主 UAV。我们把 \(\Omega\) 离散为 3D 体素网格，并用占据地图表示环境，以支持导航与无线电地图重建。设 \(\mathbf p_k=[x_k,y_k,z_k]^{\top}\in\Omega\) 表示 UAV 在离散决策步 \(k\) 的位置。UAV 的机载相机提供实时几何感知：在每步 \(k\)，它观测局部区域 \(\mathcal C(\mathbf p_k)\subset\Omega\)，并估计视场（field of view, FoV）内周围结构的高度图。视觉感知范围与 UAV 飞行高度内在耦合。设 \(\psi_{\rm cam}\) 表示相机孔径角、\(z_k\) 为步 \(k\) 的高度，则覆盖区域 \(\mathcal C(\mathbf p_k)\) 随高度扩张，可近似为横向尺度随 \(z_k\cdot\tan(\psi_{\rm cam}/2)\) 变化的金字塔投影；因此更高的飞行高度使智能体能在单次观测中捕获更广的空间范围，如图 1 所示。为支持无线电地图重建与安全导航，智能体维护由基于相机的几何感知推断出的体素化占据地图 \(\mathcal M_k\)。在每步 \(k\)，把 \(\mathcal C(\mathbf p_k)\) 内的估计高度图体素化为局部占据栅格；对应建筑物与障碍物的体素标记为占据，并融合进全局地图 \(\mathcal M_k\)，该地图跨步保持，为无线电地图重建提供几何信息。

$$
\mathcal M_k=\bigcup_{i=0}^{k}\mathcal C(\mathbf p_i).
$$

**图 1（原文 Fig. 1）：** 不同高度下 UAV 相机的视场（FoV）。

在每步 \(k\)，智能体通过从当前相机视图的无障碍部分采样，生成固定规模的候选航点集合 \(\mathcal W_k=\{\mathbf w_{k,1},\mathbf w_{k,2},\ldots,\mathbf w_{k,m}\}\)。UAV 在相邻航点之间遵循**先垂直后水平**的运动规则。对任意目标 \(\mathbf w=[x_w,y_w,z_w]^{\top}\)，定义中间点 \(\mathbf q(\mathbf p_k,\mathbf w)=[x_k,y_k,z_w]^{\top}\) 与所得两段路线

$$
\Gamma(\mathbf p_k,\mathbf w)\triangleq \mathrm{seg}\big(\mathbf p_k,\mathbf q(\mathbf p_k,\mathbf w)\big)\cup \mathrm{seg}\big(\mathbf q(\mathbf p_k,\mathbf w),\mathbf w\big).
$$

于是 UAV 先垂直升降到目标高度，再水平飞向目标航点。候选 \(\mathbf w_{k,j}\) 仅在 \(\Gamma(\mathbf p_k,\mathbf w_{k,j})\) 的两段均无阻碍、且不与 \(\mathcal M_k\) 中占据体素相交时有效。

**无线电地图采样。** 假设无线电地图在采集期间时间不变。无线电地图由参考接收信号功率场 \(P:\Omega\rightarrow\mathbb R\) 刻画。除相机外，UAV 还携带轻量频谱扫描仪，沿飞行路径连续采集信号测量。在步 \(k\)，采样策略选择最优目标航点 \(\mathbf w_k^{\star}\in\mathcal W_k\)，UAV 位置更新为 \(\mathbf p_{k+1}=\mathbf w_k^{\star}\)。在沿先垂直后水平路线 \(\Gamma(\mathbf p_k,\mathbf p_{k+1})\) 的转移过程中，扫描仪连续收集观测，形式化定义为：

$$
\Psi_k\triangleq\big\{(x,P(x))\mid x\in\Gamma(\mathbf p_k,\mathbf p_{k+1})\big\}.
$$

截至步 \(T\) 可用于无线电地图重建的累积无线电采样，由所有转移路线的并集给出：\(\mathcal Y_T=\bigcup_{k=0}^{T-1}\Psi_k\)。为方便起见，我们记步 \(k\) 可用的累积测量为 \(\mathcal Y_k=\bigcup_{i=0}^{k-1}\Psi_i\)。

### B. 问题表述

给定最终步 \(T\) 的累积测量 \(\mathcal Y_T\) 与增量构建的环境地图 \(\mathcal M_T\)，神经估计器 \(f_\theta\) 重建全局无线电地图：

$$
\hat P=f_\theta\left(\mathcal Y_T,\mathcal M_T\right).
$$

设 \(e=(P^e,\mathcal O^e)\sim\mathcal D\) 表示一个环境实例，包含其真值无线电地图与建筑几何。我们的目标是最小化期望重建误差——用以均方误差（mean squared error, MSE）等度量 \(\mathcal E(\cdot,\cdot)\) 衡量——其期望在感兴趣区域与环境分布上取。由于环境与无线电地图初始未知，这需要联合学习重建参数 \(\theta\) 与把当前智能体状态映射到下一航点 \(\mathbf p_{k+1}\) 的感知策略 \(\pi\)。联合优化问题表述为：

$$
\begin{aligned}
\min_{\theta,\pi}\quad &\mathbb E_{e\sim\mathcal D}\ \mathbb E_{\mathcal T_\pi\sim p_\pi(\cdot\mid e)}\left[\mathcal E\left(P^e,\ f_\theta(\mathcal Y_T^e,\mathcal M_T^e)\right)\right]\\
\mathrm{s.t.}\quad & C(\mathcal T_\pi)\le B,
\end{aligned}\tag{1}
$$

其中 \(p_\pi(\cdot\mid e)\) 表示 \(\pi\) 在环境 \(e\) 中诱导的轨迹分布，\(\mathcal T_\pi=\{\mathbf p_0,\mathbf p_1,\ldots,\mathbf p_T\}\)，且 \((\mathcal Y_T^e,\mathcal M_T^e)\) 为沿该轨迹获得的累积测量与环境地图。我们定义累积行程代价为 \(C(\mathcal T_\pi)\triangleq\sum_{k=0}^{T-1}c(\mathbf p_k,\mathbf p_{k+1})\)。在所采用的先垂直后水平运动协议下，转移代价为

$$
c(\mathbf p_k,\mathbf p_{k+1})=|z_{k+1}-z_k|+\left\|[x_{k+1}-x_k,\ y_{k+1}-y_k]^{\top}\right\|_2.
$$

因此 \(B\) 规定了可用于探索的最大累积路线长度。剩余预算初始化为 \(b_0=B\)，并按 \(b_{k+1}=b_k-c(\mathbf p_k,\mathbf p_{k+1})\) 演化。在每个决策步，满足 \(c(\mathbf p_k,\mathbf w_{k,i})\le b_k\) 的候选构成可行动作集。对这里考虑的近似匀速运行区间，路线长度是推进能耗的高效代理。当可获得平台特定的功率剖面时，可把随方向变化的推进、悬停、感知、载荷与通信代价纳入 \(c(\cdot,\cdot)\)，而无需改变策略训练过程 [38]。

式 (1) 耦合了两个相互依存的组件：重建网络 \(f_\theta\) 定义基于稀疏测量的无线电地图信念，感知策略 \(\pi\) 决定行程预算下的未来测量。端到端直接优化该问题高度不易处理，因为 (i) 探索过程中环境与无线电地图只能被部分观测，策略必须作用于依赖 \(\theta\) 的信念状态；(ii) 该闭环需要昂贵的 on-policy 推演以及航点采样、图重建、碰撞检测等不可微操作，导致很高的样本复杂度。

### C. 求解概览：两阶段解耦框架

为应对这些挑战，我们采用两阶段解耦，包含两个离线训练阶段，随后是在线闭环部署，如图 2 总结。

1. **阶段 I：** 重建参数 \(\theta\) 在密集监督下用双掩码补全优化，得到贝叶斯预测器 \(f_{\theta^\star}\)，输出后验均值无线电地图与预测不确定性，详见第 III 节。不确定性图提供内在奖励信号，作为式 (1) 中真值重建误差的可计算替代——该误差在线不可得。
2. **阶段 II：** 冻结 \(\theta^\star\) 后，感知策略 \(\pi\) 通过强化学习训练，以选择无碰撞航点，在行程预算下最大化预测不确定性的长时程下降，详见第 IV 节。

该分解确保探索由预测信念状态引导，而重建网络对具体探索策略保持无关。

**图 2（原文 Fig. 2）：** 3D-URAM 概览：阶段 I 训练贝叶斯重建器，从稀疏测量与部分几何输出无线电地图信念；阶段 II 使用动态 PRM 与基于 Transformer 的策略，在行程预算下选择有信息量的无碰撞航点。

## III. 阶段 I：不确定性感知的无线电地图重建

在主动无线电建图中，自主智能体必须显式识别重建不佳的区域，以引导后续测量。因此，阶段 I 构建一个贝叶斯重建架构，在恢复无线电地图的同时量化预测不确定性。

### A. 双掩码机制的观测建模

现有无线电地图重建方法通常假设完整环境几何已知，却很少考虑未知环境中复杂的多模态感知模式。在实际主动建图中，建筑布局初始未知；部署的智能体必须增量感知几何，并由已采集的部分观测推断 \(P\)。更重要的是，这些实际观测来自两种空间结构根本不同的感知模态：频谱扫描仪沿 UAV 轨迹采集接收无线电功率样本，在 2D 网格上给出**稀疏、散落的点状**无线电信号；而机载相机仅在其 FoV 内揭示建筑几何，产生**块状连续**的有效几何先验区域。若忽略环境几何的部分可观测性，以及点状信号采样与块状视觉感知之间的结构二分性，传统通用掩码方案无法忠实模拟实际部署中复杂的观测缺失特性。

为显式建模这种异质缺失，我们在离线训练时生成两种因子化掩码：

- **稀疏无线电掩码。** 无线电掩码 \(\mathbf M_r\in\{0,1\}^{H\times W}\) 按网格单元独立同分布随机变量采样：\([\mathbf M_r]_{u,v}\sim\mathrm{Bernoulli}(p_r)\)，这与无线电地图重建中传统的基于随机采样的掩码方法一致。保留概率 \(p_r\) 控制期望测量密度，从而控制补全问题的难度。
- **块状几何掩码。** 为模拟 FoV 受限的感知，把（由 \(\mathcal M_k\) 栅格化得到的）高度图 \(H_k\) 划分为互不重叠的 \(s\times s\) 图块 \(\{\mathcal P_j\}\)。每个图块以概率 \(p_g\) 保留：采样 \(g_j\sim\mathrm{Bernoulli}(p_g)\)，并对所有 \((u,v)\in\mathcal P_j\) 置 \([\mathbf M_g]_{u,v}=g_j\)。实践中我们在一定范围内随机化 \(p_g\)，以覆盖由视点与遮挡造成的不同可见比例。

在线探索早期，已获得的无线电信道观测可能极为稀疏。直接用接近全零的无线电掩码 \(\mathbf M_r\) 从零训练重建网络，常常加剧补全问题的病态性，导致严重优化不稳定与不确定性估计不稳。为缓解此问题，我们采用课程学习调度，在训练轮次中对保留概率 \(p_r\) 线性退火。具体地，训练从相对密集的掩码机制开始：初始提供更多样本，网络能更有效捕获观测样本点与整体无线电环境之间的空间相关性。随着训练推进，\(p_r\) 逐步递减，逼近实际部署中遇到的目标极端稀疏状态。这种分阶段、单调增加的训练难度有效稳定收敛，并在严重观测稀缺下显著提升重建鲁棒性与不确定性感知。

给定决策步 \(k\) 的累积观测 \((\mathcal Y_k,\mathcal M_k)\)，我们将其栅格化为固定分辨率网格。设 \(\mathbf P_k^{\rm obs}\triangleq R_P(\mathcal Y_k)\in\mathbb R^{H\times W}\) 表示稀疏无线电观测网格（未观测单元填零），\(\mathbf H_k\triangleq R_H(\mathcal M_k)\in\mathbb R^{H\times W}\) 表示栅格化高度图。网络输入 \(\mathbf X_k\) 拼接栅格化无线电观测与部分观测高度图：

$$
\mathbf X_k=\mathrm{Concat}\left(\mathbf P_k^{\rm obs},\ \mathbf H_k\odot\mathbf M_g\right),\tag{2}
$$

其中 \(\odot\) 表示 Hadamard 积。离线训练时 \(\mathbf P_k^{\rm obs}\) 由 \(\mathbf P_k^{\rm obs}=P\odot\mathbf M_r\) 模拟；在线部署时直接由累积测量 \(\mathcal Y_k\) 栅格化得到。

### B. 贝叶斯 U-Net 架构

基于既有研究的成功 [39]，我们采用 U-Net 架构作为无线电地图重建的骨干，因为其经验性能已被验证且推理速度快。U-Net 在该领域的效力主要来自带跳跃连接的编码器–解码器结构。编码器高效地从原始输入提取多尺度空间特征，同时捕获局部传播现象与宏观路损趋势。同时，跳跃连接把信息直接路由到解码器，保留高分辨率空间细节，使网络能够准确恢复细粒度结构变化，例如复杂城市拓扑带来的阴影边界与衍射效应。

如图 3 所示，所提出的贝叶斯 U-Net 通过对称的四阶段编码器–解码器架构处理拼接的掩码高度图与掩码无线电地图输入。四个编码阶段各由一个用于空间下采样的 2D 最大池化层、一个卷积层、一个修正线性单元（rectified linear unit, ReLU）激活函数与一个蒙特卡洛（Monte Carlo, MC）Dropout 层组成。对称地，四个解码阶段各采用一个用于空间上采样的插值层，随后是一个卷积层、ReLU 激活与 MC Dropout 层。跳跃连接用于把编码器的中间多尺度特征图直接路由到对应解码阶段。

在解码器末端，网络使用两个输出头：一个预测均值信号强度 \(\hat P_k\)，另一个预测异方差方差 \(\hat\sigma_k^2\)。结合 MC Dropout 层，这一结构设计把重建器转化为贝叶斯预测器 \(f_\theta\)。推理时，它聚合随机采样以输出后验均值无线电地图 \(\bar P_k\) 与预测不确定性图 \(U_k\)。这种联合不确定性量化的理论表述在下一小节详述。

**图 3（原文 Fig. 3）：** 用于地图重建与不确定性估计的贝叶斯 U-Net。

### C. 贝叶斯不确定性量化

无线电地图重建中的不确定性来自两个互补来源：由固有信道随机性、衰落与测量噪声引起的 **aleatoric 不确定性**；以及由稀疏且有偏采样下的模型无知引起的 **epistemic 不确定性**。我们在统一贝叶斯框架内量化二者，并生成可被下游主动探索消费的信念状态。

#### 1) 经异方差负对数似然（NLL）损失的 aleatoric 不确定性

实际无线电传播中的观测噪声本质上是**空间非平稳**的。在开放视距（line-of-sight, LoS）区域，宏观衰减主要由平滑的距离相关衰减主导，可预测性高，因此噪声水平有界。相反，在密集建筑群附近，特别是非视距（non-line-of-sight, NLoS）过渡区附近，衍射、多面散射与阴影衰落等复杂物理现象会引发快速、高频的信号波动。这些随机变化无法仅由部分几何先验确定性解出。通过显式估计异方差方差图 \(\hat\sigma_i^2\)，所提架构在物理上有依据地区分本质可预测区域与高度易变环境，从而高保真地捕获 aleatoric 不确定性的空间异质性。这促使我们采用经方差头实现的空间变化噪声模型。

借助双头输出，解码器不再做传统确定性地图重建，而是为每个空间网格单元 \(i\) 预测均值–方差对 \((\hat P_i,\hat\sigma_i^2)\)。训练阶段，完整无线电地图 \(P\) 作为密集真值目标，而双掩码模拟推理时遇到的严重观测缺失。为显式考虑空间非平稳观测噪声，网络在环境分布与采样双掩码上优化，在有效网格单元集合 \(\mathcal Q\) 上最小化异方差负对数似然损失。此处 \(\mathbb E_{\mathcal D,\mathcal M}\) 简写联合期望 \(\mathbb E_{(P,H)\sim\mathcal D}\mathbb E_{\mathbf M_r,\mathbf M_g}\)：

$$
\begin{aligned}
\mathcal L_{\rm nll}(\theta)&=\mathbb E_{(P,H)\sim\mathcal D}\,\mathbb E_{\mathbf M_r,\mathbf M_g}\left[-\frac{1}{|\mathcal Q|}\sum_{i\in\mathcal Q}\ln p\left(P_i\mid\hat P_i,\hat\sigma_i^2\right)\right]\\
&=\mathbb E_{\mathcal D,\mathcal M}\left[\frac{1}{|\mathcal Q|}\sum_{i\in\mathcal Q}\left(\frac{(P_i-\hat P_i)^2}{2\hat\sigma_i^2}+\frac{1}{2}\log\left(2\pi\hat\sigma_i^2\right)\right)\right].
\end{aligned}\tag{3}
$$

在该表述中，平方残差项由预测方差 \(\hat\sigma_i^2\) 自适应地衰减，增强了对含噪观测的鲁棒性；而对数项引入正则惩罚，防止方差膨胀。于是，这种双头学习范式给出 aleatoric 不确定性估计，代表即使模型完美优化也无法消除的、数据固有的不可预测性。

#### 2) 经 MC Dropout 的 epistemic 不确定性

aleatoric 不确定性不会随更多样本消失，而 epistemic 不确定性反映由有限稀疏训练数据导致的模型歧义，正是主动感知要降低的对象。由于 UAV 驱动的测量代价高昂，许多参数配置都能同样好地解释训练集，意味着权重后验非退化。设 \(\mathcal D_{\rm train}=\{(\mathbf X_n,\mathbf P_n)\}_{n=1}^{N}\) 表示训练集。注意 \(\mathcal D_{\rm train}\) 指离线训练数据集，不应与第 II-A 节中的在线累积测量集 \(\mathcal Y_k\) 混淆。贝叶斯处理寻求权重后验

$$
p(\theta\mid\mathcal D_{\rm train})=\frac{p(\mathcal D_{\rm train}\mid\theta)p(\theta)}{p(\mathcal D_{\rm train})},\tag{4}
$$

其中 \(p(\theta)\) 为先验，\(p(\mathcal D_{\rm train})=\int p(\mathcal D_{\rm train}\mid\theta)p(\theta)\,\mathrm d\theta\) 为证据。新输入 \(\mathbf X^*\) 的预测分布通过对该后验边缘化得到：

$$
p(P^*\mid\mathbf X^*,\mathcal D_{\rm train})=\int p(P^*\mid\mathbf X^*,\theta)p(\theta\mid\mathcal D_{\rm train})\,\mathrm d\theta.\tag{5}
$$

对深度网络精确计算式 (4) 不可行。变分推断（variational inference, VI）通过用可处理的变分分布 \(q_\phi(\theta)\) 近似 \(p(\theta\mid\mathcal D_{\rm train})\) 来克服，这通过最大化证据下界实现：

$$
\mathcal L_{\rm ELBO}(\phi)=\mathbb E_{q_\phi(\theta)}\left[\log p(\mathcal D_{\rm train}\mid\theta)\right]-\mathrm{KL}\left(q_\phi(\theta)\,\|\,p(\theta)\right).\tag{6}
$$

最大化 \(\mathcal L_{\rm ELBO}(\phi)\) 在数学上等价于最小化近似分布 \(q_\phi(\theta)\) 与真实后验 \(p(\theta\mid\mathcal D_{\rm train})\) 之间的 Kullback–Leibler（KL）散度。遵循 [40]，MC Dropout 通过把 dropout 掩码解释为来自 Bernoulli 变分族的采样，提供了一种高效的 VI 近似。具体地，插入 dropout（尤其是解码器中间层）会诱导随机网络实现，可视为抽取权重样本 \(\hat\theta\sim q_\phi(\theta)\)。训练时，期望数据拟合项 \(\mathbb E_{q_\phi}[\log p(\mathcal D_{\rm train}\mid\theta)]\) 通过随机 dropout 样本（例如式 (3) 中的异方差 NLL）优化，而 KL 正则项 \(\mathrm{KL}(q_\phi\|p(\theta))\) 通常在高斯先验下用权重衰减近似。

与测试时关闭的标准 dropout 不同，MC dropout 在推理时保持 dropout 开启 [40]。给定当前观测 \((\mathcal Y_k,\mathcal M_k)\)，\(S\) 次随机前向传播——每次对应一个不同的**采样子网络**——近似式 (5) 中的预测积分，得到集成 \(\{\hat P_k^{(j)},\hat\sigma_k^{2,(j)}\}_{j=1}^{S}\)。后验均值无线电地图为 \(\bar P_k=\frac{1}{S}\sum_{j=1}^{S}\hat P_k^{(j)}\)。把 MC dropout 与异方差方差头结合，可实现有原则的不确定性分解。对每个网格单元 \(i\)，预测方差分解为 aleatoric 与 epistemic 分量，可由 \(S\) 次随机传播估计为：

$$
\begin{aligned}
\mathrm{var}(P_i^*\mid\mathbf X^*,\mathcal D_{\rm train})
&\approx\underbrace{\mathbb E_{q_\phi(\theta)}\left[\hat\sigma_i^2(\mathbf X^*;\theta)\right]}_{\rm aleatoric}
+\underbrace{\mathrm{var}_{q_\phi(\theta)}\left(\hat P_i(\mathbf X^*;\theta)\right)}_{\rm epistemic}\\
&\approx\frac{1}{S}\sum_{j=1}^{S}\left(\hat\sigma_i^{2,(j)}+\left(\hat P_i^{(j)}-\bar P_i\right)^2\right).
\end{aligned}\tag{7}
$$

**算法 1（原文 Algorithm 1）：** 掩码无线电地图重建的训练。

- **输入：** 训练数据 \(\{(P,H)\}\)；总训练轮数 \(N_{\rm epoch}\)；无线电采样调度 \(\{p_r^{(t)}\}_{t=1}^{N_{\rm epoch}}\)（随轮次递减）；图块尺寸 \(s\)；随机几何保留概率 \(p_g\sim\mathrm{Uniform}(p_g^{\min},p_g^{\max})\)；MC 采样数 \(S\)
- **输出：** 训练好的贝叶斯 U-Net \(f_\theta\)；步 \(k\) 的信念状态 \((\bar P_k,U_k)\)

1. for \(t=1,2,\ldots,N_{\rm epoch}\) do
2. 　设置无线电保留概率 \(p_r\leftarrow p_r^{(t)}\)
3. 　for 每个小批量 \((P,H)\) do
4. 　　按像素独立采样稀疏无线电掩码 \(\mathbf M_r\sim\mathrm{Bernoulli}(p_r)\)
5. 　　采样 \(p_g\)，并以概率 \(p_g\) 保留 \(s\times s\) 图块生成几何掩码 \(\mathbf M_g\)
6. 　　构造稀疏无线电观测 \(\mathbf P^{\rm obs}\leftarrow P\odot\mathbf M_r\)
7. 　　构造掩码输入 \(\mathbf X\leftarrow\mathrm{Concat}(\mathbf P^{\rm obs},H\odot\mathbf M_g)\)
8. 　　带 dropout 前向传播：\(f_\theta(\mathbf X)\rightarrow(\hat P,\hat\sigma^2)\)
9. 　　通过最小化式 (3) 更新 \(\theta\)
10. 　end for
11. end for
12. 在线推理（步 \(k\)）：按式 (2) 把 \((\mathcal Y_k,\mathcal M_k)\) 栅格化为 \(\mathbf X_k\)
13. for \(j=1,2,\ldots,S\) do
14. 　随机传播：\(f_\theta(\mathbf X_k)\rightarrow(\hat P_k^{(j)},\hat\sigma_k^{2,(j)})\)
15. end for
16. 用式 (8) 计算 \(\bar P_k\) 与 \(U_k\)；返回 \((\bar P_k,U_k)\)

对主动感知而言，epistemic 不确定性指示在何处追加测量有信息量，而 aleatoric 不确定性只能部分降低。实践中，用于规划的聚合不确定性图因此用规划系数 \(\eta\) 对两个经验分量加权：

$$
U_k=\frac{1}{S}\sum_{j=1}^{S}\left(\hat P_k^{(j)}-\bar P_k\right)^2+\eta\cdot\frac{1}{S}\sum_{j=1}^{S}\hat\sigma_k^{2,(j)}.\tag{8}
$$

所得信念状态 \((\bar P_k,U_k)\) 作为感知模块的输出。高不确定性区域表明预测不可靠，因而被下游规划器优先用于信息采集。在阶段 II，强化学习智能体把 \(U_k\) 聚合为标量 \(\Sigma_k=\sum_{q\in\mathcal Q}U_k(q)\)，并因其下降而获得奖励（式 (12)），在真值重建误差在线不可得时提供可计算的信息增益替代。

算法 1 总结阶段 I，涵盖双掩码补全的离线训练与经 MC dropout 的在线推理。关键输出是冻结的预测器 \(f_{\theta^\star}\)，它为部署中遇到的观测模式生成预测信念状态 \((\bar P_k,U_k)\)。

## IV. 阶段 II：经 DRL 的预算约束主动探索

虽然阶段 I 成功给出能够量化预测不确定性的贝叶斯重建器，但它依赖静态观测模式，并不决定 UAV 应如何持续获取未来测量。为弥合这一差距，阶段 II 把生成的密集不确定性图作为内在奖励替代，学习主动感知策略。

**图 4（原文 Fig. 4）：** 用于航点选择的 Transformer actor–critic 与 PPO 闭环。

### A. 动态局部图的构建

运行环境 \(\Omega\) 连续且初始未知，仅通过机载感知增量显现。因此，假设完全可观测与静态搜索空间的经典规划器不适用。为弥合连续物理域与可处理的序贯决策之间的差距，所提框架采用动态图抽象，并在每个决策步 \(k\) 由当前感知**在线**构建瞬态局部概率路线图 \(\mathcal G_k\)。与传统依赖预计算全局拓扑的 PRM 不同，该动态 PRM 把当前已知自由空间离散为有限的无碰撞候选航点集合。随着新观测从机载相机到达，图被重新生成，以与演化的占据地图 \(\mathcal M_k\) 及无线电地图信念状态保持同步。这种基于图的抽象把不易处理的连续 3D 控制问题转化为对固定规模候选集的类别选择，在动作生成时刻保证无碰撞，并允许沿每次转移的垂直段与水平段精确累积行程预算。此外，航点是商用自动驾驶仪栈 [41] 的原生任务格式，也符合民航框架 [42] 所预期的预先申报飞行几何。

在步 \(k\)，设 \(\mathbf p_k\) 表示 UAV 当前位置。构建以 \(\mathbf p_k\) 为中心、**星形拓扑**的图 \(\mathcal G_k=(\mathcal V_k,\mathcal E_k)\)。节点集 \(\mathcal V_k\) 由当前位置与从局部观测空间采样的固定规模 \(m_k\) 个候选航点组成。候选航点在以 \(\mathbf p_k\) 为中心的运动学半径 \(R\) 内均匀采样，并由当前占据地图 \(\mathcal M_k\) 诱导的两段碰撞约束与剩余预算过滤。节点集定义为：

$$
\begin{aligned}
\mathcal V_k&=\{\mathbf p_k\}\cup\mathcal W_k,\\
\mathcal W_k&=\Big\{\mathbf w_{k,i}\mid i=1,\ldots,m_k,\ \|\mathbf w_{k,i}-\mathbf p_k\|_2\le R,\ c(\mathbf p_k,\mathbf w_{k,i})\le b_k,\\
&\qquad\qquad \Gamma(\mathbf p_k,\mathbf w_{k,i})\ \text{is collision free}\Big\}.
\end{aligned}\tag{9}
$$

边集 \(\mathcal E_k\) 由 \(\mathbf p_k\) 指向每个有效候选 \(\mathbf w_{k,i}\in\mathcal W_k\) 的有向边组成，每条边表示对应路线 \(\Gamma(\mathbf p_k,\mathbf w_{k,i})\)。

除几何可行性外，每个节点还增补直接来自概率重建的无线电地图属性。在步 \(k\)，贝叶斯 U-Net 产生后验均值无线电地图 \(\bar P_k\) 与对应不确定性图 \(U_k\)，与式 (8) 一致。对每个候选航点 \(\mathbf w_{k,i}\)，在其空间位置查询 U-Net 预测，并把所得均值与不确定性和该航点的绝对坐标拼接：

$$
\mathbf x_i=\left[\mathbf w_{k,i},\ \bar P_k(\mathbf w_{k,i}),\ U_k(\mathbf w_{k,i})\right].\tag{10}
$$

该参数化把几何可达性与预测的无线电信息量耦合起来，使策略能够偏好预期可降低重建不确定性的航点。

### B. 马尔可夫决策过程（MDP）表述

动态图表述自然引出马尔可夫决策过程（Markov Decision Process, MDP）抽象。在主动建图中，直接在不断扩张的轨迹历史上规划会违反马尔可夫性。为解决此问题，贝叶斯 U-Net 把累积观测 \((\mathcal Y_k,\mathcal M_k)\) 压缩为信念状态 \((\bar P_k,U_k)\)，动态 PRM 则把局部自由空间蒸馏为候选集 \(\mathcal W_k\)。二者共同构成总结所有任务相关过去信息的**充分统计量**。以该聚合状态为条件，未来转移与所采取的具体历史路径无关，从而满足马尔可夫性。

**1) 状态空间：** 状态 \(s_k\in\mathcal S\) 在决策步 \(k\) 同时编码全局信念与局部候选集：

$$
s_k=\left(s_k^{\rm global},\ \{\mathbf x_i\}_{i=1}^{m_k}\right),\tag{11}
$$

其中 \(s_k^{\rm global}\) 表示全局上下文，由密集不确定性图 \(U_k\in\mathbb R^{H\times W}\) 与一个低维智能体状态向量组成，该向量拼接归一化的剩余预算 \(b_k\) 与当前 UAV 位置 \(\mathbf p_k\)。集合 \(\{\mathbf x_i\}_{i=1}^{m_k}\) 是从 \(\mathcal G_k\) 提取的固定规模候选航点属性集合，如式 (10) 所定义。

**2) 动作空间：** 动作空间 \(\mathcal A(s_k)\) 对应 \(\mathcal G_k\) 中的出边集合。动作 \(a_k\in\{1,\ldots,m_k\}\) 选择候选航点索引；具体地，\(a_k=i\) 命令 UAV 先垂直调整高度，再沿 \(\Gamma(\mathbf p_k,\mathbf w_{k,i})\) 从 \(\mathbf p_k\) 水平飞向 \(\mathbf w_{k,i}\)。由于 \(\mathcal W_k\) 由局部感知在线重新生成，动作集在空间构型上随时间演化，而其基数 \(m_k\) 保持固定。

**3) 奖励结构：** 奖励 \(r_k\) 旨在有限预算下最大化不确定性下降。步 \(k\) 的聚合地图不确定性定义为 \(\Sigma_k=\sum_{q\in\mathcal Q}U_k(q)\)，其中 \(\mathcal Q\) 表示网格位置集合。瞬时奖励为

$$
r_k=\begin{cases}
\alpha\cdot\dfrac{\Sigma_{k-1}-\Sigma_k}{\Sigma_{k-1}},&\text{if } b_{k+1}>0,\\[2mm]
-\beta\cdot\Sigma_k,&\text{if } b_{k+1}\le 0.
\end{cases}\tag{12}
$$

对 \(b_{k+1}>0\) 的中间步，智能体按全局不确定性的归一化下降成比例获得奖励。预算耗尽时（\(b_{k+1}\le0\)），奖励切换为终止惩罚 \(-\beta\Sigma_k\)，惩罚终止时的残余不确定性，使学习目标与最小化最终重建不确定性一致。

### C. 神经策略架构与优化

在每个决策步 \(k\)，策略必须融合密集全局信念与稀疏、置换不变的候选航点集。该设定带来两个主要挑战：(i) 联合处理高维栅格输入与低维本体感知；(ii) 从无序的固定基数 \(m_k\) 候选集选择动作。我们用混合架构应对：双流全局上下文编码器、Fourier 增强的候选嵌入模块，以及基于 Transformer 的决策头，如图 4 所示。\(m_k\) 个候选被视为无序 token 集合，从而可在以全局信念为条件的同时，对可行导航选项做置换不变推理。actor 在候选索引上产生类别分布，critic 提供用于在 PPO 更新中计算优势的价值估计。

具体地，策略网络分三阶段进行。首先，全局上下文 \(s_k^{\rm global}\) 由两个并行流编码。密集不确定性图 \(U_k\in\mathbb R^{H\times W}\) 由 3 层卷积神经网络（convolutional neural network, CNN）编码，卷积核 \(3\times3\)、通道维度 \(\{32,64,64\}\)，使用 ReLU 激活与最大池化以产生紧凑空间特征。同时，一个轻量多层感知机（multi-layer perceptron, MLP）嵌入低维本体感知向量，该向量由归一化剩余预算 \(b_k\) 与当前 UAV 位置 \(\mathbf p_k\) 拼接而成。两个特征被拼接并投影到统一的上下文嵌入 \(\mathbf z_{\rm ctx}\in\mathbb R^{d_{\rm embed}}\)，用于为后续候选评估提供条件。

给定该上下文嵌入，每个候选航点通过显式编码几何与局部无线电属性来表示。由于标准 MLP 可能表现频谱偏置、对高频空间变化欠拟合，我们采用 Fourier 特征映射。对坐标向量 \(\mathbf u\in\mathbb R^{3}\)，映射 \(\xi(\cdot)\) 把输入逐元素提升到多频域：

$$
\xi(\mathbf u)_\ell=\begin{cases}
\sin\left(2^{(\ell-1)/2}\pi\mathbf u\right),&\ell\ \text{is odd},\\[1mm]
\cos\left(2^{(\ell-2)/2}\pi\mathbf u\right),&\ell\ \text{is even}.
\end{cases}\tag{13}
$$

其中 \(L\) 为频带数。映射 \(\xi(\cdot)\) 同时施加于绝对航点坐标 \(\mathbf w_{k,i}\) 与相对位移 \(\mathbf w_{k,i}-\mathbf p_k\)。这些几何嵌入与式 (10) 中定义的局部航点属性 \(\mathbf x_i\) 拼接，经融合 MLP 得到候选嵌入 \(\mathbf e_i\)。

最后，为对候选集联合推理并避免在空间聚集的选项间冗余采样，采用基于 Transformer 的架构在保持置换不变的同时建模候选间相互依赖。为使局部候选特征以当前预算与地图状态为条件，把全局上下文嵌入注入每个候选 token：

$$
\tilde{\mathbf e}_i=\mathbf e_i+\mathbf W_{\rm ctx}\mathbf z_{\rm ctx},\tag{14}
$$

其中 \(\mathbf W_{\rm ctx}\) 为可学习线性投影。条件化后的 token \(\{\tilde{\mathbf e}_i\}_{i=1}^{m_k}\) 随后由带多头自注意力的标准 Transformer 编码器处理：

$$
\mathrm{Attention}(\mathbf Q,\mathbf K,\mathbf V)=\mathrm{softmax}\left(\frac{\mathbf Q\mathbf K^{\top}}{\sqrt{d_{\rm key}}}\right)\mathbf V,\tag{15}
$$

其中 \(d_{\rm key}\) 表示键维度。该设计置换不变，并在基数 \(m_k\) 的固定规模候选集上运行。最后，共享决策头把精炼后的 token 映射为标量 logits，Softmax 定义策略分布 \(\pi_\vartheta(a_k\mid s_k)\)。

为训练该 actor–critic，策略 \(\pi_\vartheta\) 与价值函数 \(V_\omega\) 用 PPO [43] 联合优化，其最大化截断替代目标，并加上价值回归项与熵正则：

$$
\mathcal L(\vartheta,\omega)=\hat{\mathbb E}_k\left[\mathcal L_k^{\rm CLIP}(\vartheta)-c_1\mathcal L_k^{\rm VF}(\omega)+c_2\mathcal S[\pi_\vartheta](s_k)\right],\tag{16}
$$

其中 \(c_1\) 与 \(c_2\) 分别为平衡价值估计精度与探索的系数。

主要策略更新项为截断替代目标。设 \(\rho_k(\vartheta)=\frac{\pi_\vartheta(a_k\mid s_k)}{\pi_{\vartheta_{\rm old}}(a_k\mid s_k)}\) 表示当前策略与旧策略之间的概率比。截断策略损失 \(\mathcal L_k^{\rm CLIP}\) 促使有利动作的概率增加，同时限制更新幅度：

$$
\mathcal L_k^{\rm CLIP}=\min\left(\rho_k(\vartheta)\hat A_k,\ \mathrm{clip}\left(\rho_k(\vartheta),1-\epsilon,1+\epsilon\right)\hat A_k\right),\tag{17}
$$

其中 \(\epsilon\) 为控制截断范围的超参数，例如 \(\epsilon=0.2\)，\(\hat A_k\) 为估计优势。截断机制确保 \(\rho_k(\vartheta)\) 不显著偏离 1，从而保持训练稳定。

为计算式 (16) 中的 \(\hat A_k\)，采用广义优势估计（generalized advantage estimation, GAE）在降低梯度方差的同时保持可管理的偏差。时序差分（temporal difference, TD）误差 \(\delta_k\) 定义为：

$$
\delta_k=r_k+\gamma V_\omega(s_{k+1})-V_\omega(s_k),\tag{18}
$$

其中 \(V_\omega\) 为 critic。对长度为 \(T_{\rm roll}\) 的推演，优势估计为 TD 误差的指数加权和：

$$
\hat A_k=\sum_{l=0}^{T_{\rm roll}-k-1}(\gamma\lambda)^l\delta_{k+l},\tag{19}
$$

其中 \(\gamma\) 为折扣因子，\(\lambda\) 为 GAE 平滑参数。算法 2 总结所提出基于图的航点规划器的 PPO 训练过程。

**算法 2（原文 Algorithm 2）：** 航点选择策略的 PPO 训练。

- **输入：** 仿真器环境；生成 \(\mathcal W_k=\{\mathbf w_{k,i}\}_{i=1}^{m_k}\) 的候选生成器；式 (10) 中的节点属性；策略 \(\pi_\vartheta\)；critic \(V_\omega\)；PPO 超参数 \((\gamma,\lambda,\epsilon,c_1,c_2)\)；推演长度 \(T_{\rm roll}\)；更新轮数 \(N_{\rm epoch}\)
- **输出：** 训练好的规划器参数 \((\vartheta,\omega)\)

1. for iteration \(=1,2,\ldots\) do
2. 　令 \(\vartheta_{\rm old}\leftarrow\vartheta\) 并采集一段推演：
3. 　for \(k=0,1,\ldots,T_{\rm roll}-1\) do
4. 　　观测 \(s_k=(s_k^{\rm global},\{\mathbf x_i\}_{i=1}^{m_k})\) 并采样 \(a_k\sim\pi_{\vartheta_{\rm old}}(\cdot\mid s_k)\)
5. 　　执行 \(a_k\)；接收 \(r_k\) 与 \(s_{k+1}\)；存储 \((s_k,a_k,r_k,\log\pi_{\vartheta_{\rm old}}(a_k\mid s_k))\)
6. 　end for
7. 　用 GAE 计算优势 \(\{\hat A_k\}\) 与回报 \(\hat R_k=\hat A_k+V_\omega(s_k)\)；在批内归一化 \(\{\hat A_k\}\)
8. 　for epoch \(=1,2,\ldots,N_{\rm epoch}\) do
9. 　　用小批量、Adam 优化式 (16) 更新 \((\vartheta,\omega)\)；应用熵正则与梯度裁剪
10. 　end for
11. end for

### D. 迭代感知–动作闭环

在线执行期间，3D-URAM 作为闭环感知–动作系统运行，如算法 3 总结。在每个决策步 \(k\)，UAV 基于累积无线电测量 \(\mathcal Y_k\) 与动态扩展的占据地图 \(\mathcal M_k\) 更新其空间与电磁感知。具体地，贝叶斯网络把过去观测映射为密集信念状态 \((\bar P_k,U_k)\)，随后投影到动态构建的有效候选航点 \(\mathcal W_k\) 上。通过按式 (10) 提取每个候选的属性，连续信念被离散化为 Transformer 策略可直接消费的格式。策略随后选择最优航点 \(\mathbf p_{k+1}\) 以最大化期望信息增益。向该航点飞行会带来新测量 \(\Psi_k\) 并扩展感知环境 \(\mathcal M_{k+1}\)，驱动下一次迭代。该主动感知闭环持续，直到 UAV 耗尽行程预算 \(B\)。

**算法 3（原文 Algorithm 3）：** 3D-URAM 的在线部署。

- **输入：** 冻结的贝叶斯 U-Net \(f_{\theta^\star}\)；已学习策略 \(\pi\)；初始位置 \(\mathbf p_0\)；初始地图 \((\mathcal Y_0,\mathcal M_0)\)；行程预算 \(B\)；MC 采样数 \(S\)
- **输出：** 轨迹 \(\mathcal T_\pi\) 与测量 \(\mathcal Y_T\)

1. 初始化 \(k\leftarrow0\)，剩余预算 \(b_0\leftarrow B\)
2. while \(b_k>0\) do
3. 　信念更新：用 \(S\) 次随机前向传播计算 \((\bar P_k,U_k)\leftarrow f_{\theta^\star}(\mathcal Y_k,\mathcal M_k)\)
4. 　由 \((\mathcal M_k,b_k)\) 构建瞬态局部图 \(\mathcal G_k\) 与预算可行的候选 \(\mathcal W_k\)（第 IV-A 节）
5. 　按式 (10) 构造节点属性 \(\{\mathbf x_i\}_{i=1}^{m_k}\)
6. 　采样 \(a_k\sim\pi(\cdot\mid s_k)\)，令 \(\mathbf p_{k+1}\leftarrow\mathbf w_{k,a_k}\)
7. 　执行 \(\Gamma(\mathbf p_k,\mathbf p_{k+1})\)（先垂直后水平）；采集新测量 \(\Psi_k\)
8. 　更新 \(\mathcal Y_{k+1}\leftarrow\mathcal Y_k\cup\Psi_k\)，并由机载感知扩展 \(\mathcal M_{k+1}\)
9. 　更新预算 \(b_{k+1}\leftarrow b_k-c(\mathbf p_k,\mathbf p_{k+1})\)；令 \(k\leftarrow k+1\)
10. end while

### E. 计算复杂度

为确保机载部署的实时可行性，我们分析重规划闭环的每步计算复杂度。设 \(H\times W\) 为各高度层的栅格分辨率，\(Z\) 为高度层数，\(S\) 为随机前向传播次数，\(m_k=|\mathcal W_k|\) 为候选航点固定数量。体素化与地图融合的规模为 \(\mathcal O(ZHW)\)，动态 PRM 采样与碰撞检测的规模为 \(\mathcal O(m_k)\)。更新所有高度层上的贝叶斯信念需要 \(S\) 次前向传播，规模为 \(\mathcal O(SZHW)\)；用 CNN 编码所得不确定性体积的开销为 \(\mathcal O(ZHW)\)，对候选集的 Transformer 自注意力每层开销为 \(\mathcal O(m_k^2)\)。因此，吸收低阶项后，整体每步复杂度为

$$
\mathcal O\left(SZHW+m_k^2\right).\tag{20}
$$

由于实践中 \(Z\)、\(S\)、\(m_k\) 均为固定的小常数，重规划开销随环境地图分辨率**线性**增长。

这种有界复杂度相对经典概率方法具有显著优势。例如，密集 GP 推断的复杂度为 \(\mathcal O(N_k^3+N_kZHW)\)，其中 \(N_k\triangleq|\mathcal Y_k|\) 表示累积样本数。由于 \(N_k\) 在探索中单调增加，三次复杂度很快成为机载重规划的瓶颈。而确定性深度模型（如 Spectrum Surveying）用单次前向传播取得 \(\mathcal O(ZHW)\) 的更低复杂度，却无法捕获把主动探索引向真正未探索区域所必需的 epistemic 不确定性。通过结合经异方差 NLL 损失学习的 aleatoric 不确定性、用于 epistemic 不确定性的轻量 MC dropout 集成（\(S=10\)）以及经动态 PRM 得到的固定基数候选集，3D-URAM 在不承受 GP 类方法严重可扩展性问题的前提下，为探索提供不确定性估计。

## V. 实验

### A. 数据集生成

为训练与评估 3D-URAM，我们用 NVIDIA Sionna 构建大规模无线电地图数据集，这是一个 GPU 加速、基于物理的仿真器，采用确定性射线追踪，建模反射、衍射与散射。射线追踪数据集按以下流程生成：

1. **场景提取：** 从 OpenStreetMap 提取 150 个城市场景，覆盖多样的建筑布局与密度。每个场景覆盖 \(200\times200\ \mathrm{m}^2\) 区域。
2. **几何与材料：** 建筑物近似为长方体，并为地面、墙面与屋顶指定电磁材料模型，如表 III 所列，以捕获 LoS 遮挡与城市峡谷传播效应。
3. **收发机设置：** 每个场景随机部署 25 个发射机，接收机位置布置在四个高度层（\(h\in\{10,20,30,40\}\ \mathrm{m}\)）的均匀网格上。
4. **射线追踪与切片：** 用 Sionna [14] 计算路损，得到 \(150\times25\times4=15{,}000\) 个无线电地图切片。
5. **预处理：** 路损图被截断到 \([0,150]\ \mathrm{dB}\) 以抑制可忽略的弱信号并缓解极端近场奇异性，随后线性映射到 \([0,255]\) 并量化为 8 位无符号整数（记为 `uint8`），产生灰度图像 \(\mathbf P\in\{0,\ldots,255\}^{H\times W}\)。

最后，数据集按环境以 7:3 划分训练/测试，得到 105 个训练场景与 45 个测试场景。这种严格分离确保评估在完全未见的建筑布局上进行，从而对跨多样城市几何的泛化能力给出严格检验。

**表 III（原文 TABLE III）：** 射线追踪仿真参数。

| 参数 | 取值 |
|---|---|
| 载波频率 | 2.4 GHz |
| 发射功率 | 0 dBm |
| 天线方向图 | 各向同性 |
| 衍射 | 启用 |
| 折射 | 禁用 |
| 屋顶材料 | ITU_brick |
| 墙面材料 | ITU_concrete |
| 地面材料 | ITU_very_dry_ground |

### B. 不确定性网络

无线电地图预测网络在第 V-A 节所述射线追踪数据集上训练。训练时，课程学习调度逐步把输入掩码比例从 0.8 提高到 0.98，以确保稳健收敛。推理时，MC dropout 保持开启以估计 epistemic 不确定性。表 V 总结训练超参数。我们比较三种规划基线：协方差矩阵自适应进化策略（covariance matrix adaptation evolution strategy, CMA-ES）、蒙特卡洛树搜索（Monte Carlo Tree Search, MCTS）与随机采样。

**图 5（原文 Fig. 5）：** 阶段 I 在四个高度层（\(h=10,20,30,40\ \mathrm{m}\)）上的预测与分解不确定性。左侧区块显示真值无线电地图（上）与贝叶斯 U-Net 预测（下）；右侧区块显示 aleatoric 不确定性（上）与 epistemic 不确定性（下）。

图 5 可视化了代表性预测及跨高度的分解不确定性估计。不确定性图表现出清晰的空间结构：高不确定性集中在复杂几何边界与非视距区域附近，那里阴影、衍射与强多径效应占主导。这类低置信区域为下游鲁棒 UAV 路径规划提供了可靠性线索。

所提贝叶斯 U-Net 与三个代表性基线对比：Spectrum Surveying [30]，一种基于自编码器的方法；GP-DKL [44]，一种深度核学习高斯过程；以及 GP-ATT，一种基于注意力的高斯过程基线。我们考虑两种评估设置，以反映不同的部署阶段：

1. **完整环境知识：** 完整建筑布局作为先验可得。
2. **部分可观测性：** 仅部分建筑几何可得，代表在线探索期间不完整的环境上下文。

如图 6(a) 所示，我们在完整建筑布局下比较四种方法。由于 GP-ATT 无法融合建筑信息，它在无建筑几何（w/o building）条件下评估。所提贝叶斯 U-Net 优于所有其他方法。Spectrum Surveying 优于 GP-DKL，但仍不如贝叶斯 U-Net，原因在于其朴素自编码器架构缺少跳跃连接，导致细粒度空间细节丢失。

如图 6(b) 所示（比较不同建筑先验下的贝叶斯 U-Net），可以看到随着建筑观测增多，重建性能持续改善。这表明在纯无线电信号采样过程中同时采集环境先验以辅助无线电地图生成是必要的。此外，如图 6(c) 所示，我们评估各方法的推理速度。Spectrum Surveying 因单次确定性前向传播而计算最快，为 24.61 ms。所提贝叶斯 U-Net 尽管为不确定性量化使用 \(S=10\) 次随机传播，仍取得 28.54 ms 的极具竞争力的推理时间。两者都远在实时限制之内，并显著快于 GP-DKL 所需的 36.42 ms。

**图 6（原文 Fig. 6）：** 所提贝叶斯 U-Net 与 Spectrum Surveying、GP-DKL 及 GP-ATT 的比较。子图：(a) 不同采样率下的 RMSE；(b) 不同建筑先验比例（100%/75%/50%/25%/0%）下的 RMSE；(c) 各方法推理时间。

**表 V（原文 TABLE V）：** 训练超参数。

| 参数 | 取值 |
|---|---|
| **网络训练** | |
| 输入分辨率 | \(50\times50\) |
| 优化器 | Adam |
| 初始学习率 | \(1\times10^{-3}\) |
| 学习率衰减 | 余弦退火 |
| 批大小 | 64 |
| Dropout 率 | 0.1 |
| 掩码比例策略 | 从 0.8 线性增至 0.98 |
| **RL 策略训练** | |
| 优化器 | Adam |
| 学习率 | \(3\times10^{-4}\) |
| 折扣因子 \(\gamma\) | 0.99 |
| GAE 参数 \(\lambda\) | 0.97 |
| 裁剪范围 \(\epsilon\) | 0.2 |
| 价值损失系数 \(c_1\) | 0.5 |
| 熵系数 \(c_2\) | 0.01 |
| 最大梯度范数 | 0.5 |
| 小批量大小 | 128 |
| 更新轮数 | 4 |
| 推演时程（步） | 1024 |
| MC Dropout 采样数 \(S\) | 10 |
| 规划系数 \(\eta\) | 1 |

### C. RL 路径规划

在监督学习阶段之后，强化学习智能体针对主动感知进行训练。3D-URAM 的一个关键目标是在底层预测模型**未见过**的环境中导航并重建无线电地图。为严格满足这一泛化要求，RL 智能体的训练集完全由不确定性网络的留出测试集构建，如第 V-A 节所定义。具体地，从 45 个测试场景中选择 10 个代表性城市环境。在每个选定环境中使用 10 种不同的发射机配置，构成用于策略优化的聚焦数据集。该设置确保 RL 智能体无法依赖预测网络训练阶段记忆的环境特征。

如图 7 所示，在三种预算下，回合回报在前 1000 个回合内快速上升，并在 8000 个训练回合内趋于稳定。更大的预算通过允许更大的累积不确定性下降而得到更高的最终回报。更大预算也导致回合回报的更大波动，这可能来自随机动作选择与更长探索时程中不同观测序列的累积效应。

**图 7（原文 Fig. 7）：** 三种行程预算下的 PPO 训练收敛。更大预算表现出更大的回合回报波动。

为全面评估所提探索策略的通用性与鲁棒性，我们考察其与不同重建后端耦合时的协同性能。具体地，把经所提框架训练的智能体与三种代表性预测器集成：基于核的 GP-DKL [44]、基于深度学习的 Spectrum Surveying [30]，以及所提贝叶斯 U-Net。为对标既有方法的规划效率，把所提方法与三种替代策略比较：进化算法 CMA-ES [45]、基于启发式搜索的 MCTS [46] 与随机采样方法。对比结果见表 IV。

如表 IV 详述，所提贝叶斯 U-Net 在不同轨迹长度预算 \(B\) 下始终表现出更优的重建保真度。特别地，当与所提 RL 策略配合时，贝叶斯 U-Net 在所有测试场景中取得最低 RMSE：平均 RMSE 从 \(B=1\ \mathrm{km}\) 的 0.0536，降到 \(B=2\ \mathrm{km}\) 的 0.0452 与 \(B=4\ \mathrm{km}\) 的 0.0355，且最优–最差散布很小，例如 \(B=1\ \mathrm{km}\) 时为 0.0519–0.0548，表明重建质量稳定。就基线预测器而言，Spectrum Surveying 在多数情况下优于 GP-DKL，因为其神经表示更好地捕获复杂非线性空间依赖。例如在所提 RL 策略下，Spectrum Surveying 在 \(B=1/2/4\ \mathrm{km}\) 取得 0.1522/0.1218/0.0813 的平均 RMSE，而 GP-DKL 仍显著更高，为 0.5187/0.4791/0.4217。这一差距反映了基于核的 GP 模型在建模城市复杂无线电地图上的困难。

除重建后端外，表 IV 还突出了探索规划的效果。与 CMA-ES、MCTS 和随机采样相比，所提 RL 策略在三种预测器下都始终给出最低的平均与最差情形 RMSE，且优势在测量选择至关重要的预算受限条件下最为明显。例如在 \(B=1\ \mathrm{km}\) 的贝叶斯 U-Net 下，所提策略把平均 RMSE 降至 0.0536，而 CMA-ES 为 0.0694、MCTS 为 0.0623、随机采样为 0.0714，同时取得最低的最差情形 RMSE。随着预算增加，所有规划器都受益于更多测量；但所提策略保持最佳精度与鲁棒性，显示出更高的样本效率。为定性理解，图 8 可视化了所提方法在多个决策步、跨高度层的重建演化。为清晰起见，该时间线仅绘制规划器与重建器组合的所提流程；不同规划器与重建后端的相对优势已在表 IV 中全面量化。

**表 IV（原文 TABLE IV）：** 不同预算、规划器与重建器的 RMSE。

| 预算 | 规划方法 | GP-DKL 最优 | GP-DKL 平均 | GP-DKL 最差 | Spectrum Surveying 最优 | Spectrum Surveying 平均 | Spectrum Surveying 最差 | 贝叶斯 U-Net［本文］最优 | 贝叶斯 U-Net［本文］平均 | 贝叶斯 U-Net［本文］最差 |
|---|---|---|---|---|---|---|---|---|---|---|
| \(B=1\) | 所提 | 0.5034 | 0.5187 | 0.5254 | 0.1411 | 0.1522 | 0.1648 | **0.0519** | **0.0536** | **0.0548** |
| \(B=1\) | CMA-ES | 0.5096 | 0.5173 | 0.5325 | 0.1520 | 0.1742 | 0.1898 | 0.0663 | 0.0694 | 0.0721 |
| \(B=1\) | MCTS | 0.5084 | 0.5113 | 0.5237 | 0.1499 | 0.1635 | 0.1840 | 0.0592 | 0.0623 | 0.0677 |
| \(B=1\) | 随机 | 0.4933 | 0.5538 | 0.6002 | 0.1549 | 0.2194 | 0.2688 | 0.0603 | 0.0714 | 0.0799 |
| \(B=2\) | 所提 | 0.4643 | 0.4791 | 0.4911 | 0.1103 | 0.1218 | 0.1402 | **0.0435** | **0.0452** | **0.0479** |
| \(B=2\) | CMA-ES | 0.4770 | 0.4926 | 0.5067 | 0.1247 | 0.1321 | 0.1521 | 0.0495 | 0.0536 | 0.0588 |
| \(B=2\) | MCTS | 0.4792 | 0.4866 | 0.5148 | 0.1194 | 0.1333 | 0.1640 | 0.0476 | 0.0524 | 0.0553 |
| \(B=2\) | 随机 | 0.4564 | 0.5687 | 0.6493 | 0.1362 | 0.1782 | 0.2531 | 0.0519 | 0.0651 | 0.0780 |
| \(B=4\) | 所提 | 0.3909 | 0.4217 | 0.4683 | 0.0664 | 0.0813 | 0.1027 | **0.0320** | **0.0355** | **0.0382** |
| \(B=4\) | CMA-ES | 0.4311 | 0.4658 | 0.4926 | 0.0791 | 0.0945 | 0.1162 | 0.0419 | 0.0487 | 0.0545 |
| \(B=4\) | MCTS | 0.4122 | 0.4442 | 0.5029 | 0.0748 | 0.0910 | 0.1194 | 0.0416 | 0.0506 | 0.0574 |
| \(B=4\) | 随机 | 0.4126 | 0.5388 | 0.5839 | 0.0667 | 0.1325 | 0.2080 | 0.0362 | 0.0581 | 0.0743 |

注：加粗为原文以红框标注的所提方法最佳值；原文表头将每个重建器的三列细分为 Best/Avg/Worst，本页为便于 Markdown 排版在每行重复预算列标签，数值未改。

**图 8（原文 Fig. 8）：** \(B=4\) 时跨高度的重建随决策步的演化，最终 RMSE 为 0.0363。

### D. 运行时间评估

各模块的运行时间在 \(H=W=50\)、\(Z=4\)、\(S=10\)、\(m_k=20\) 下评估。经过 20 次预热运行后，表 VI 报告 100 次重复的中位延迟。

**表 VI（原文 TABLE VI）：** 每个重规划步的模块级运行时间。

| 模块 | 复杂度 | 中位延迟 |
|---|---|---|
| 体素化与地图融合 | \(\mathcal O(ZHW)\) | 0.010 ms |
| PRM 采样与碰撞检测 | \(\mathcal O(m_k)\) | 0.849 ms |
| 贝叶斯信念更新（\(S\) 次前向传播） | \(\mathcal O(SZHW)\) | 28.54 ms |
| CNN 上下文编码 | \(\mathcal O(ZHW)\) | 0.290 ms |
| Transformer 策略 | \(\mathcal O(m_k^2)\) | 0.566 ms |

每步重规划的总中位延迟约为 30.26 ms。大部分运行时间与用于贝叶斯信念更新的 \(S\) 次随机前向传播有关。

### E. 消融研究

#### 1) 观测掩码分布的影响

为评估随机训练掩码与轨迹诱导观测之间的失配，我们在其余设置完全相同的条件下，用随机稀疏掩码与模拟 UAV 轨迹掩码训练两个阶段 I 模型。两个模型都在两种掩码类型、不同观测体素比例下评估。图 9 显示，在随机掩码验证数据上 RMSE 几乎相同，在轨迹掩码验证数据上性能接近。

**图 9（原文 Fig. 9）：** 稀疏掩码与轨迹掩码训练的阶段 I 模型分别在稀疏掩码验证数据与轨迹掩码验证数据上的 RMSE。

我们进一步用稀疏化曲线与稀疏化误差曲线下面积（area under the sparsification error, AUSE）[47] 评估 \(U_k\) 的误差排序质量，该指标越低表示与 oracle 误差排序越一致。保持同一冻结的阶段 I 模型、测试地图与观测数量不变，我们只改变观测的空间布局。如图 10 所示，AUSE 仅从随机掩码的 0.226 略微升到轨迹掩码的 0.231，表明在测试的变更下 \(U_k\) 的误差排序质量基本保持。

**图 10（原文 Fig. 10）：** 随机观测掩码与轨迹观测掩码下的不确定性稀疏化曲线，使用同一冻结的阶段 I 模型、测试地图与观测数量。子图 (a) 随机掩码（AUSE = 0.226）；(b) 轨迹掩码（AUSE = 0.231）。

最后，我们用相同 RL 配置为每个冻结的阶段 I 模型训练独立的阶段 II 策略。表 VII 显示平均端到端 RMSE 差异小于 1.8%，且两种训练掩码分布都没有一致占优。

**表 VII（原文 TABLE VII）：** 阶段 I 训练掩码对平均端到端 RMSE 的影响。

| 阶段 I 训练掩码 | \(B=1\ \mathrm{km}\) | \(B=2\ \mathrm{km}\) | \(B=4\ \mathrm{km}\) |
|---|---|---|---|
| 随机稀疏掩码 | 0.0536 | **0.0452** | 0.0355 |
| 轨迹掩码 | **0.0528** | 0.0460 | **0.0349** |

#### 2) MC Dropout 对阶段 I 的影响

我们用 \(S\in\{1,2,5,10,20,30\}\) 评估 MC Dropout 采样数对重建 RMSE、聚合不确定性标准差与推理延迟的影响。如图 11 所示，增大 \(S\) 通过集成平均降低重建误差并稳定不确定性估计。当 \(S=1\) 时，基于样本的 epistemic 方差退化为零。超过 \(S=10\) 后，把 \(S\) 增到 20 与 30 相对 \(S=10\) 只把 RMSE 降低不到 1%，却分别使中位推理延迟增加约 60% 与 145%。因此，额外的随机传播带来不成比例的计算代价，而精度收益可忽略。我们取 \(S=10\) 作为精度–稳定性–延迟的最佳折中。

**图 11（原文 Fig. 11）：** MC Dropout 采样数对阶段 I 重建 RMSE、聚合不确定性稳定性与中位推理延迟的影响。

#### 3) 系数 \(\eta\) 对阶段 II 的影响

式 (8) 中的系数 \(\eta\) 控制 aleatoric 项相对 epistemic 项对聚合不确定性 \(U_k\) 的贡献强度，从而决定内在奖励在噪声区域与未探索区域之间的权衡。我们保持冻结的阶段 I 预测器、\(S=10\)、\(m_k=20\) 与所有 PPO 设置不变，用 \(\eta\in\{1,2,3,4,5\}\) 重新训练策略。表 VIII 报告所得 RMSE。

等权（\(\eta=1\)）在全部三个预算下取得最低 RMSE。增大 \(\eta\) 会过度强调基本不可降的观测噪声，把智能体引向追加测量收益有限的噪声区域，并远离 epistemic 不确定性高的区域。这种退化在 \(B=4\) 时最明显，因为更大预算会放大错误导向的探索。

**表 VIII（原文 TABLE VIII）：** 规划系数 \(\eta\) 对阶段 II 的影响。

| 系数 | \(B=1\) | \(B=2\) | \(B=4\) |
|---|---|---|---|
| \(\eta=1\)（采用） | **0.0536** | **0.0452** | **0.0355** |
| \(\eta=2\) | 0.0556 (+3.8%) | 0.0453 (+0.1%) | 0.0368 (+3.8%) |
| \(\eta=3\) | 0.0559 (+4.3%) | 0.0480 (+6.2%) | 0.0395 (+11.2%) |
| \(\eta=4\) | 0.0575 (+7.2%) | 0.0471 (+4.2%) | 0.0383 (+7.9%) |
| \(\eta=5\) | 0.0571 (+6.5%) | 0.0483 (+6.9%) | 0.0390 (+9.9%) |

#### 4) 策略组件对阶段 II 的影响

我们每次移除一个策略组件重新训练智能体，其余设置与 \(m_k=20\) 保持不变。表 IX 报告所得 RMSE 与相对退化。

移除 Fourier 映射带来 1.1%–5.0% 的代价，表明航点坐标的多频提升有助于策略区分空间相邻候选。舍弃终止惩罚 \(-\beta\Sigma_k\) 带来 0.7%–1.9% 的代价，因为此时智能体只优化逐步不确定性下降，在预算接近耗尽时变得短视。不确定性来源的影响最大：仅 aleatoric 变体损失 1.3%–3.0%，因为内在噪声基本不可降、是较弱的探索信号；仅 epistemic 变体最差，在 \(B=1/2/4\) 分别退化 6.7%/12.7%/14.6%。该差距随预算增大而扩大，因为仅凭模型不确定性会把 UAV 驱向未访问但不一定有信息量的区域。因此，组合两项的聚合不确定性取得最佳精度。

**表 IX（原文 TABLE IX）：** 策略组件在阶段 II 上的消融。

| 变体 | \(B=1\) | \(B=2\) | \(B=4\) |
|---|---|---|---|
| 完整 Transformer–PPO（\(m_k=20\)） | **0.0536** | **0.0452** | **0.0355** |
| 去除 Fourier 特征 | 0.0542 (+1.1%) | 0.0475 (+5.0%) | 0.0361 (+1.7%) |
| 去除终止不确定性惩罚 | 0.0546 (+1.9%) | 0.0458 (+1.3%) | 0.0357 (+0.7%) |
| 仅 aleatoric 不确定性 | 0.0545 (+1.7%) | 0.0466 (+3.0%) | 0.0360 (+1.3%) |
| 仅 epistemic 不确定性 | 0.0572 (+6.7%) | 0.0509 (+12.7%) | 0.0407 (+14.6%) |

#### 5) 候选集规模对阶段 II 的影响

基数 \(m_k\) 控制离散化动作空间的分辨率。我们在其余设置相同时用 \(m_k\in\{10,20,30,40\}\) 重新训练策略，汇总于表 X。

当 \(m_k=10\) 时，粗糙动作空间使 RMSE 最多增加 6.8%，因为路线图可能漏掉有信息量的航点。把 \(m_k\) 从 20 增到 30 或 40 只把 RMSE 降低 2.1%–3.0%，从 30 到 40 的进一步下降也很微弱。同时，PRM 采样与 Transformer 自注意力分别按 \(\mathcal O(m_k)\) 与 \(\mathcal O(m_k^2)\) 扩展。因此我们取 \(m_k=20\) 作为精度与复杂度之间的平衡。

**表 X（原文 TABLE X）：** 候选集规模 \(m_k\) 对阶段 II 的影响。

| 候选数量 | \(B=1\) | \(B=2\) | \(B=4\) |
|---|---|---|---|
| \(m_k=10\) | 0.0572 (+6.8%) | 0.0462 (+2.3%) | 0.0361 (+1.7%) |
| \(m_k=20\)（采用） | **0.0536** | **0.0452** | **0.0355** |
| \(m_k=30\) | 0.0525 (−2.1%) | 0.0442 (−2.3%) | 0.0345 (−2.7%) |
| \(m_k=40\) | 0.0523 (−2.5%) | 0.0439 (−2.8%) | 0.0344 (−3.0%) |

### F. 小规模真实世界外场测试

测量活动在 HKUST(GZ) 校园内进行，覆盖 \(300\ \mathrm{m}\times200\ \mathrm{m}\) 的运行区域，如图 13 所示。一架搭载 R&S TSMA6 频谱扫描仪的 DJI Matrice 350 RTK 以 40 m AGL 的恒定高度飞行约 52 分钟，记录 NR-ARFCN 504990（2524.95 MHz，n41 频段）下基于 SSB 的 5G NR 测量。由于扫描仪解码该频段内每个可检测 SSB，一次飞行即可产生每个（PCI，波束索引）对单独一张无线电地图：该活动产生 742,988 条有效记录，覆盖 45 个物理小区与 8 个 SSB 波束。表 XI 总结配置，图 12 展示该数据集中三个密集采样 PCI–波束对的无线电地图示例。

阶段 I 重建器首先在 Sionna 射线追踪数据集上预训练，随后在活动期间采集的其余地图上微调。为防止数据泄漏，被评估的地图（PCI 657，波束 6）在整个微调过程中留出。重建误差在 \(50\times50\) 网格上、飞行覆盖足迹凸包内的 1473 个单元上计算。给定初始测量样本，微调后的贝叶斯 U-Net 产生临时重建与不确定性图。基于该不确定性图，选择若干高不确定性区域构成单条精化轨迹。

**表 XI（原文 TABLE XI）：** 真实世界测量活动的配置。

| 参数 | 取值 |
|---|---|
| **测量平台** | |
| UAV 平台 | DJI Matrice 350 RTK |
| 频谱扫描仪 | R&S TSMA6 |
| 飞行高度 | 40 m AGL |
| 覆盖足迹 | \(300\times200\ \mathrm{m}^2\) |
| **无线电配置** | |
| NR-ARFCN | 504990 |
| 中心频率 | 2524.95 MHz（n41） |
| SSB_RP 范围 | −120.0 至 −49.9 dBm |
| **采集数据集** | |
| 有效测量记录 | 742,988 |
| 检测到的小区 | 45 个 PCI |
| 波束索引 | 0–7 |
| 去重（PCI，波束）地图数 | 180 |
| **被评估地图** | |
| 评估小区／波束 | PCI 657 / 波束 6 |
| 记录数／位置数 | 12004 / 2390 |
| SSB_RP 范围 | −106.9 至 −73.4 dBm |
| 评估网格 | \(50\times50\) |
| 路线长度 | 385 m |

该轨迹执行时不做中间重规划或航点重选。飞行约持续 10 分钟，总航程 385 m。

该外场测试检验阶段 I 的不确定性估计在真实 RSRP 测量下是否仍可用于引导采样。在相同的 385 m 行程预算下，不确定性引导轨迹把重建 RMSE 从预定义 Lawnmower 扫掠（割草机式往复扫掠）所达到的 0.175，降到 0.082。该结果仅作为合理性检查：在判定为不确定的区域追加测量可改善重建，表明所学不确定性能够支持离线轨迹精化。由于测量仅在单一高度采集，该实验只在 2D 切片上评估阶段 I 估计器；完整 3D-URAM 框架的端到端真实世界验证仍属未来工作。

**图 12（原文 Fig. 12）：** 真实世界数据集中的无线电地图示例。子图：(a) PCI 184 / 波束 4；(b) PCI 366 / 波束 4；(c) PCI 183 / 波束 7；色标为 SSB-RSRP（dBm，−90 至 −65）。

**图 13（原文 Fig. 13）：** HKUST-GZ 的离线真实世界外场测试配置。子图：(a) 测量工具；(b) 真实空中无线电地图；(c) 不确定性地图；(d) 轨迹可视化。

## VI. 结论

本文提出了在未知环境中主动揭示 3D 空地无线电地图的首个方案。所提 3D-URAM 框架先通过双掩码补全训练贝叶斯 U-Net，把稀疏测量与几何先验顺序映射为具有空间分辨预测不确定性的连续信号场。随后该信念状态引导动态概率路线图上的 Transformer 策略，在严格行程预算下最大化长时程信息增益。该方法在重建精度与样本效率两方面都显著优于最新基线。此外，一项补充的外场测量案例研究表明，所学不确定性也支持真实测量上的离线批量轨迹精化。未来工作包括更广泛的外场验证以及纳入跨频段预测。

## 参考文献

以下按原文参考文献顺序照录英文原条目（含卷期、页码、年份与在线链接等书目信息）。

[1] W. Lu, S. Gao, M. Wen, Y. Liang, L. Yang, C.-B. Chae, and H. V. Poor, “Bayesian-Driven Graph Reasoning for Active Radio Map Construction,” in *2025 Seventeenth International Conference on Wireless Communications and Signal Processing (WCSP)*, Chongqing, China, Oct. 2025.

[2] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A Tutorial on Environment-Aware Communications via Channel Knowledge Map for 6G,” *IEEE Communications Surveys & Tutorials*, vol. 26, no. 3, pp. 1478–1519, Thirdquarter 2024.

[3] C. Wu, Z. Yang, and C. Xiao, “Automatic Radio Map Adaptation for Indoor Localization Using Smartphones,” *IEEE Transactions on Mobile Computing*, vol. 17, no. 3, pp. 517–528, Mar. 2018.

[4] K. Majeed, S. Sorour, T. Y. Al-Naffouri, and S. Valaee, “Indoor Localization and Radio Map Estimation Using Unsupervised Manifold Alignment with Geometry Perturbation,” *IEEE Transactions on Mobile Computing*, vol. 15, no. 11, pp. 2794–2808, Nov. 2016.

[5] W. B. Chikha, M. Masson, Z. Altman, and S. B. Jemaa, “Radio Environment Map Based Inter-Cell Interference Coordination for Massive-MIMO Systems,” *IEEE Transactions on Mobile Computing*, vol. 23, no. 1, pp. 785–796, Jan. 2024.

[6] S. Zhang, Y. Zeng, and R. Zhang, “Cellular-Enabled UAV Communication: A Connectivity-Constrained Trajectory Optimization Perspective,” *IEEE Transactions on Communications*, vol. 67, no. 3, pp. 2580–2604, Mar. 2019.

[7] J. Perez-Romero, A. Zalonis, L. Boukhatem, A. Kliks, K. Koutlia, N. Dimitriou, and R. Kurda, “On the Use of Radio Environment Maps for Interference Management in Heterogeneous Networks,” *IEEE Communications Magazine*, vol. 53, no. 8, pp. 184–191, Aug. 2015.

[8] S. Gao, J. Yan, P. Huang, Z. Lu, M. Gong, L. Miao, G. Zhu, J. Liang, and L. Yang, “Integrated Sensing, Communication, and Computation for Low-Altitude Networks Towards Seamless Connectivity and Connected Intelligence,” *IEEE Internet of Things Magazine*, pp. 1–9, 2026.

[9] B. Li and J. Chen, “Large Timescale Optimization for Communications Over Aerial Ad Hoc Networks With Predetermined Trajectories,” *IEEE Transactions on Communications*, vol. 72, no. 10, pp. 6371–6385, Oct. 2024.

[10] Y. Li and A. H. Aghvami, “Radio Resource Management for Cellular-Connected UAV: A Learning Approach,” *IEEE Transactions on Communications*, vol. 71, no. 5, pp. 2784–2800, Mar. 2023.

[11] Y. Li, A. H. Aghvami, and D. Dong, “Path Planning for Cellular-Connected UAV: A DRL Solution With Quantum-Inspired Experience Replay,” *IEEE Transactions on Wireless Communications*, vol. 21, no. 10, pp. 7897–7912, Apr. 2022.

[12] D. Romero and S.-J. Kim, “Radio Map Estimation: A Data-driven Approach to Spectrum Cartography,” *IEEE Signal Processing Magazine*, vol. 39, no. 6, pp. 53–72, Nov. 2022.

[13] T. Hu, Y. Huang, J. Chen, Q. Wu, and Z. Gong, “3D Radio Map Reconstruction Based on Generative Adversarial Networks Under Constrained Aircraft Trajectories,” *IEEE Transactions on Vehicular Technology*, vol. 72, no. 6, pp. 8250–8255, Jun. 2023.

[14] J. Hoydis, S. Cammerer, F. A. Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, “Sionna: An Open-Source Library for Next-Generation Physical Layer Research,” 2023. [Online]. Available: https://arxiv.org/abs/2203.11854

[15] S. Bakirtzis, Ç. Yapar, M. Fiore, J. Zhang, and I. Wassell, “Empowering Wireless Network Applications with Deep Learning-Based Radio Propagation Models,” *IEEE Wireless Communications*, vol. 32, no. 4, pp. 124–131, Aug. 2025.

[16] K. Sato and T. Fujii, “Kriging-Based Interference Power Constraint: Integrated Design of the Radio Environment Map and Transmission Power,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 3, no. 1, pp. 13–25, Mar. 2017.

[17] H. Sun and J. Chen, “Propagation Map Reconstruction via Interpolation Assisted Matrix Completion,” *IEEE Transactions on Signal Processing*, vol. 70, pp. 6154–6169, 2022.

[18] N. Cressie, *Statistics for Spatial Data*. Hoboken, NJ, USA: Wiley-Interscience, 1993.

[19] Y. Teganya and D. Romero, “Deep Completion Autoencoders for Radio Map Estimation,” *IEEE Transactions on Wireless Communications*, vol. 21, no. 3, pp. 1710–1724, Mar. 2022.

[20] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “RadioUNet: Fast Radio Map Estimation With Convolutional Neural Networks,” *IEEE Transactions on Wireless Communications*, vol. 20, no. 6, pp. 4001–4015, Jun. 2021.

[21] S. Zhang, A. Wijesinghe, and Z. Ding, “RME-GAN: A Learning Framework for Radio Map Estimation Based on Conditional Generative Adversarial Network,” *IEEE Internet of Things Journal*, vol. 10, no. 20, pp. 18 016–18 027, Oct. 2023.

[22] G. Chen, Y. Liu, T. Zhang, J. Zhang, X. Guo, and J. Yang, “A Graph Neural Network Based Radio Map Construction Method for Urban Environment,” *IEEE Communications Letters*, vol. 27, no. 5, pp. 1327–1331, May 2023.

[23] P. Q. Viet and D. Romero, “Spatial Transformers for Radio Map Estimation,” in *ICC 2025 - IEEE International Conference on Communications*, Sep. 2025, pp. 6155–6160.

[24] C. Zhao, R. Zhang, J. Wang, D. Niyato, G. Sun, H. Du, Z. Li, A. Jamalipour, and D. I. Kim, “Temporal Spectrum Cartography in Low-Altitude Economy Networks: A Generative AI Framework With Multi-Agent Learning,” *IEEE Transactions on Mobile Computing*, pp. 1–17, 2025.

[25] X. Luo, Z. Li, Z. Peng, M. Chen, and Y. Liu, “Denoising Diffusion Probabilistic Model for Radio Map Estimation in Generative Wireless Networks,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 11, no. 2, pp. 751–763, Apr. 2025.

[26] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, “RadioDiff: An Effective Generative Diffusion Model for Sampling-Free Dynamic Radio Map Construction,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 11, no. 2, pp. 738–750, Apr. 2025.

[27] S. Gao, J. Liang, Y. Yuan, W. Lu, G. Shen, and L. Yang, “FARM: Foundational Aerial Radio Map for Intelligent Low-Altitude Networking,” Jun. 2026. [Online]. Available: https://arxiv.org/abs/2604.17362

[28] E. Krijestorac, S. Hanna, and D. Cabric, “Spatial Signal Strength Prediction using 3D Maps and Deep Learning,” in *ICC 2021 - IEEE International Conference on Communications*, Aug. 2021.

[29] J. Wang, Q. Zhu, Z. Jia, Y. Zheng, K.-K. Ma, Q. Gao, Y. Chen, Z. Lin, and Q. Wu, “UAV-Aided 3D Spectrum Mapping Framework: Architecture, Technique, and Opportunity,” *IEEE Communications Magazine*, pp. 1–8, Feb. 2026.

[30] R. Shrestha, D. Romero, and S. P. Chepuri, “Spectrum Surveying: Active Radio Map Estimation with Autonomous UAVs,” *IEEE Transactions on Wireless Communications*, vol. 22, no. 1, pp. 627–641, Jan. 2023.

[31] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder, Z.-L. Zhang, and G. B. Giannakis, “Bayesian Active Learning for Sample Efficient 5G Radio Map Reconstruction,” *IEEE Transactions on Wireless Communications*, vol. 23, no. 12, pp. 19 382–19 396, Dec. 2024.

[32] Y. Chen, Q. Zhu, J. Wang, Z. Jia, X. Wang, Z. Lin, Y. Huang, Q. Wu, and C. Briso-Rodríguez, “UAV-Aided Efficient Informative Path Planning for Autonomous 3D Spectrum Mapping,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 12, pp. 1664–1677, Aug. 2026.

[33] N. C. Matson and K. Sundaresan, “Online Radio Environment Map Creation via UAV Vision for Aerial Networks,” in *2024 IEEE Conference on Computer Communications (INFOCOM)*, Vancouver, BC, Canada, 2024, pp. 81–90.

[34] A. Bircher, M. Kamel, K. Alexis, H. Oleynikova, and R. Siegwart, “Receding Horizon ‘Next-Best-View’ Planner for 3D Exploration,” in *2016 IEEE International Conference on Robotics and Automation (ICRA)*, Stockholm, Sweden, 2016.

[35] OpenStreetMap contributors, “Planet dump retrieved from https://planet.osm.org,” https://www.openstreetmap.org, 2017.

[36] F. Jaensch, G. Caire, and B. Demir, “Radio Map Prediction From Aerial Images and Application to Coverage Optimization,” *IEEE Transactions on Wireless Communications*, vol. 25, pp. 308–320, 2026.

[37] A. Vashisth, J. Rückin, F. Magistri, C. Stachniss, and M. Popović, “Deep Reinforcement Learning with Dynamic Graphs for Adaptive Informative Path Planning,” *IEEE Robotics and Automation Letters (RA-L)*, pp. 1–8, Sep. 2024.

[38] Y. Li, A. S. Madhukumar, T. Zheng Hui Ernest, G. Zheng, W. Saad, and A. Hamid Aghvami, “Energy-Efficient UAV-Driven Multi-Access Edge Computing: A Distributed Many-Agent Perspective,” *IEEE Transactions on Communications*, vol. 73, no. 9, pp. 8405–8420, Mar. 2025.

[39] W. Lu, Z. Lu, J. Yan, and S. Gao, “SIP2Net: Situational-Aware Indoor Pathloss-Map Prediction Network for Radio Map Generation,” in *2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)*, Hyderabad, India, 2025.

[40] Y. Gal and Z. Ghahramani, “Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning,” 2016. [Online]. Available: https://arxiv.org/abs/1506.02142

[41] DJI, “Wayline management sample,” DJI Mobile SDK Documentation, 2024, [Online]. Available: https://developer.dji.com/doc/mobile-sdk-tutorial/en/tutorials/waypoint.html

[42] Federal Aviation Administration, “Normalizing unmanned aircraft systems beyond visual line of sight operations,” Notice of Proposed Rulemaking, 90 Fed. Reg., Aug. 2025, [Online]. Available: https://www.federalregister.gov/documents/2025/08/07/2025-14992/normalizing-unmanned-aircraft-systems-beyond-visual-line-of-sight-operations

[43] J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov, “Proximal Policy Optimization Algorithms,” *CoRR*, vol. abs/1707.06347, 2017. [Online]. Available: http://arxiv.org/abs/1707.06347

[44] A. G. Wilson, Z. Hu, R. R. Salakhutdinov, and E. P. Xing, “Stochastic Variational Deep Kernel Learning,” in *Proc. Advances in Neural Information Processing Systems*, vol. 29, 2016.

[45] N. Hansen, “The CMA Evolution Strategy: A Tutorial,” *CoRR*, vol. abs/1604.00772, 2016. [Online]. Available: http://arxiv.org/abs/1604.00772

[46] M. Swiechowski, K. Godlewski, B. Sawicki, and J. Mandziuk, “Monte Carlo Tree Search: A Review of Recent Modifications and Applications,” *CoRR*, vol. abs/2103.04931, 2021. [Online]. Available: https://arxiv.org/abs/2103.04931

[47] E. Ilg, Ö. Çiçek, S. Galesso, A. Klein, O. Makansi, F. Hutter, and T. Brox, “Uncertainty Estimates and Multi-Hypotheses Networks for Optical Flow,” in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2018, pp. 677–693.

**本页范围与校对状态：** 本页覆盖原文全部内容：摘要、索引词、正文第 I–VI 节及全部小节与子小节（II-A–C、III-A–C 含 III-C-1/2、IV-A–E、V-A–F 含 V-E-1–5）、式 (1)–(20)、算法 1–3、表 I–XI（逐格转写）、图 1–13 图注、参考文献 [1]–[47]（英文原条目），并含原文首页作者脚注。**核对方式：** 先按分页抽取文本（pypdf 6.10.0，16 页）翻译，再把 PDF 第 2、3、5、6、7、8、9、10、11、13、14 页渲染为 PNG 逐页核对；表 I–XI 与式 (1)–(20)、算法 1–3 的符号、上下标、数值均已对照 PDF 渲染版逐格核验，数值照抄未改。**已知缺陷与核对疑点：**
1. 原文表标题编号为 I–XI（共 11 张表），本页全部逐格转写。表 IV 原文为两级表头（3 个重建器 × Best/Avg/Worst），Markdown 不支持两级表头，本页展开为 11 列并在每行重复预算列标签，数值与原文红框加粗未改。
2. 表 II（符号表）、表 V、表 VI、表 XI 中的分区标题（如“Network Training”“RL Policy Training”“Measurement Platform”）以加粗行保留；表 V 的两组参数用一张表呈现。
3. 表 I 的 ✓（包含）/△（部分包含）/×（不包含）图例以字符原样保留，并在表下加注说明。
4. 图 1–13 的图形内容（光照渲染场景图、U-Net 结构框图、Transformer actor–critic 与 PPO 闭环框图、无线电地图/不确定性热图、训练曲线、外场照片与轨迹）无法在译文中复现，本页仅给出图注译文；图 6、10、12、13 的子图标签按 PDF 原文的 (a)–(d) 保留。
5. 术语处理：aleatoric/epistemic uncertainty 保留英文原词（中文常译“偶然/认知不确定性”，首次出现处已并注）；PRM=概率路线图；PPO、GAE、CMA-ES、MCTS、GP-DKL、GP-ATT 等按原文缩写保留；“Lawnmower sweep”译为“割草机式往复扫掠”并保留英文原词，避免歧义。
6. 式 (1) 的目标与约束在原 PDF 中分两行排布，本页用 aligned 环境还原；式 (9) 的候选集条件在原文中跨行，本页保留为两行；式 (3)、(7) 的两步等式在原文中为多行推导，本页按原顺序还原。
7. 数值核对要点：摘要中“重建误差降低超过 50%”；实测部分 385 m 行程、归一化 RMSE 0.175→0.082、飞行约 52 分钟与约 10 分钟、40 m AGL、NR-ARFCN 504990 / 2524.95 MHz（n41）、742,988 条记录、45 个 PCI、8 个 SSB 波束、1473 个单元；表 IV 中 \(B=1/2/4\ \mathrm{km}\) 的 0.0536/0.0452/0.0355；运行时间 30.26 ms 与 28.54/24.61/36.42/32.80 ms；AUSE 0.226→0.231——均与 PDF 渲染版一致。
8. 原文为 16 页期刊格式预印本（LaTeX 模板页眉为 “JOURNAL OF LATEX CLASS FILES”），无附录；参考文献照录英文原条目，其中 [35] 为 OpenStreetMap 数据条目、[42] 为 FAA 拟议规章链接，均按原文保留。
**逐句逐式终校未做**；供后续 QA 重点核对：表 IV 的 36 组数值、式 (3)/(7) 的方差分解记号、式 (9)/(12) 的分段条件、算法 1–3 的步骤编号，以及 V-E 消融中各百分比增量的符号方向。

---

**登记（2026-11-02）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
