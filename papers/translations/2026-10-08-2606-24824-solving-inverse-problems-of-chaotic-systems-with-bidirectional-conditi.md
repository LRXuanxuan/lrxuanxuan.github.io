---
layout: page
title: "双向条件流匹配求解混沌系统逆问题｜中文全文译文"
permalink: /papers/translations/2026-10-08-2606-24824-solving-inverse-problems-of-chaotic-systems-with-bidirectional-conditi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2fd7c6f4df7bed7e/) · [原文 arXiv](https://arxiv.org/abs/2606.24824) · [全部目录](/papers/catalog/)

# 双向条件流匹配求解混沌系统逆问题

**原题：** Solving Inverse Problems of Chaotic Systems with Bidirectional Conditional Flow Matching  
**作者：** Peiyan Hu<sup>3‡</sup>、Jian Zhang<sup>7</sup>、Jiashu Pan<sup>1</sup>、Ruiqi Feng<sup>1</sup>、Tao Zhang<sup>1</sup>、Zhi-Ming Ma<sup>3</sup>、Yuan-Sen Ting<sup>4,5,6</sup>、Gongjie Li<sup>2*</sup>、Tailin Wu<sup>1*</sup>（*通讯作者）  
**单位：** 1 西湖大学工学院人工智能系（杭州 310030，中国）；2 佐治亚理工学院相对论天体物理中心（Atlanta, GA 30313, USA）；3 中国科学院数学与系统科学研究院（北京 100190，中国）；4 马克斯·普朗克天文研究所（Heidelberg, Germany）；5 俄亥俄州立大学天文学系（Columbus, OH 43210, USA）；6 俄亥俄州立大学宇宙学与天体粒子物理中心（CCAPP）；7 中国科学院大学天文与空间科学学院（北京 100049，中国）。  
**通讯邮箱：** gongjie.li@physics.gatech.edu；wutailin@westlake.edu.cn。‡ Hu 在西湖大学实习期间完成本工作。  
**版本：** arXiv:2606.24824v1（cs.AI），2026 年 6 月 23 日，原文 50 页（正文 25 页 + 附录 A–E）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1–5 节及全部小节（2.1–2.4、4.1–4.6）、附录 A–E（含附录 E 的命题 3 与两个数值示例）、式 (1)–(8) 及附录中的无编号方程、图 1–6 与图 A1–A3、B4–B11 图注、表 B1（超参数）、参考文献 [1]–[121]（英文原条目）均按原文结构录入；原文无独立结论节（末节为讨论）。逐句逐式终校未做。

## 摘要

对混沌系统建模至关重要却充满挑战。混沌动力学中的逆问题——由末态推断初态——因不适定性、解不唯一、不稳定性以及可能混沌的时间反演动力学而大部分仍未解决。我们用**双向条件流匹配**（Bidirectional Conditional Flow Matching，Bi-CFM）应对这一开放问题：它学习初态分布与末态分布之间的双向映射，以刻画混沌演化的随机性并缓解随时间指数累积的误差。此外，对具有守恒律的系统，我们将其扩展为**守恒约束 Bi-CFM**（Conservation-constrained Bi-CFM，CBi-CFM）。在经典 Lorenz、Circuit 与高维 Lorenz 96 系统上，Bi-CFM 在五项分布级指标上优于基线，同时实现两个数量级以上的加速。在行星动力学中的三体行星—行星散射问题<sup>*</sup>（脚注 ∗：行星—行星散射指行星间相互引力扰动导致轨道变化与不稳定性的过程）上，CBi-CFM 更好地遵守守恒律，其守恒误差与真值相当。最后，在球状星团的真实观测上——由约 10<sup>10</sup> 年（10 Gyr）演化塑造的碰撞百万体系统——我们的方法取得精度上的进步，为求解长时标真实混沌动力学逆问题建立了可扩展路径。

**关键词：** 混沌系统、逆问题、生成模型。

## 1. 引言

混沌系统是重要而复杂的非线性物理系统，出现在电气系统 [1, 2]、气候系统 [3, 4]、天文学 [5–7] 与生物学 [8, 9] 中。其内在复杂性给建模与分析带来根本挑战，主要因为初始状态的微小扰动会随时间指数放大——如图 1c 所示，量级 10<sup>−6</sup> 的初始扰动会使轨迹迅速分离。本文聚焦混沌系统的**逆问题**，即从目标末态观测推断初始条件。这一长期挑战在科学 [10–12] 与工程 [13, 14] 中影响广泛，因为恢复初始状态对理解混沌物理系统的机制与历史至关重要 [15]。

尽管意义重大，该任务主要有三方面困难。第一，此类逆问题是不适定的，即其解可能不唯一或不稳定 [16]。第二，逆问题的一个目标是推断初态、使其演化后的末态接近目标末态；然而初态误差在前向演化中放大，导致与目标末态的偏离更大。第三，逆推断可能因演化中某些天体或组分消失而遭遇信息损失——例如行星被散射出行星系统 [17–19]，其信息随之丢失，重建只能依赖剩余组分。

对确定性、非混沌的物理系统，一旦运动方程已知，传统数值方法可以较小数值误差推断初始条件：这些方法的收敛性保证从目标末态出发沿时间反向积分即可获得高保真初态估计，其前向演化与目标吻合 [20–22]。然而在混沌系统中，随机性来自确定性非线性动力学把初态中的无穷小扰动放大为不可预测行为；因此即便方程已知并做反向积分，传统数值方法也无法准确恢复初态。特别是当前向演化发生信息损失（如某些天体或组分从系统中消失）时，传统数值方法可能完全失效。

深度学习的最新进展为应对该挑战开辟了新可能：神经网络已展示出建模混沌动力学的能力，可兼顾加速、精度与效率，相关方法不断涌现。然而现有研究主要关注混沌系统的其他任务，如预测任务 [23–26]；也有研究用深度学习求解逆问题，但尚未聚焦更具挑战的设定（即信息损失下的长时间反向推断）。

如图 1 所示，我们提出 **Bi-CFM**：面向混沌系统逆问题的算法，及其扩展 **CBi-CFM**——在守恒量已知时施加守恒律。我们系统性地分析并应对混沌系统逆问题。方法基于概率生成模型**条件流匹配**（Conditional Flow Matching，CFM）[32, 33]，其优势源于两个关键洞见。第一，在有限计算资源下，混沌系统可被视为随机系统 [34–36]，因此我们学习其**状态分布**而非确定性轨迹；该概率建模框架也更适合处理解可能不唯一的适定性问题。第二，我们直接学习初态与末态之间的端到端映射，而不像传统数值求解器那样依赖含时的迭代更新；该设计避免沿时间维反复累积数值误差，使推理误差即使随时域长度增加也更为可控，并缓解混沌动力学中的误差累积。

此外，我们引入**双向建模**框架，联合学习前向与反向动力学，使模型能够捕捉混沌系统的全局结构，而不仅着眼于复现初态。通过强制前向演化与时间反演动力学之间的相互一致性，我们的方法缓解了混沌系统中前向演化时通常出现的误差放大。进一步地，对受守恒律支配的物理系统，我们把框架扩展为 CBi-CFM，强制所学概率流路径在守恒原理定义的**守恒流形**上演化，使模型能在混沌条件下生成物理一致解。

我们通过在多种混沌系统（含经典与真实系统）上的实验验证方法有效性。在经典 Lorenz 系统、Circuit 系统与高维 Lorenz 96 系统上，所提方法在五项分布级指标上优于其他基线，包括基于传统数值求解器的反向积分。此外，在含散射与碰撞的三体行星系统这一挑战性问题上，逆问题跨越多达 10<sup>6</sup> 个轨道周期且包含信息损失，我们的方法成功推断出接近真值的分布与因果关系；CBi-CFM 更把能量守恒保持在原始数据同量级。为在真实场景测试，我们进一步研究基于观测数据的长时标球状星团演化逆问题。作为初始状态已被约 10 Gyr 动力学演化重塑的古老致密恒星系统，球状星团编码了银河系组装历史，是银河系考古的挑战性试验台。与最先进的 Monte Carlo 方法相比，Bi-CFM 给出的末态模拟轮廓在视觉与定量上都更匹配观测。这些结果表明 Bi-CFM 可作为求解长时标混沌系统逆问题的可扩展工具。

所提模型概览见图 1。图 1a 的 Bi-CFM 框架基于 CFM，学习定义从高斯噪声到数据分布之流路径的速度场 \(v_\theta\)；在此基础上，我们引入同时学习前向与反向动力学的双向建模策略。图 1b 的 CBi-CFM 框架把整条流路径约束在守恒律定义的流形 \(\mathcal M\) 内，确保推断的初态满足守恒量 \(H\)：先获得满足守恒律的先验分布，再把速度场约束在守恒流形 \(\mathcal M\) 的切平面 \(T_{\mathbf u_\tau}\mathcal M\) 内，从而保证整条概率流保持在 \(\mathcal M\) 中。更多细节见第 4 节方法。

为清晰起见，本文记号如下：真值轨迹记为 \(\mathbf u_t^{\rm gt}\)（\(t=0,\ldots,T\)），算法推断的初态为 \(\mathbf u_0\)；用同一高精度数值求解器前向演化 \(\mathbf u_0\) 所得轨迹记为 \(g(\mathbf u_0,t)\)，其中 \(g(\cdot,t)\) 表示从初态到时刻 \(t\) 状态的映射。逆问题的评价指标包含三方面：第一，推断初态 \(\mathbf u_0\) 与真值初态 \(\mathbf u_0^{\rm gt}\) 的接近程度；第二，前向演化所得末态 \(g(\mathbf u_0,T)\) 与目标末态 \(\mathbf u_T^{\rm gt}\) 的接近程度；第三，不同时刻状态之间的因果关系。

**图 1（原文 Fig. 1）：** Bi-CFM 与 CBi-CFM 的示意图，以及对初态的敏感依赖。(a) **Bi-CFM 框架**：在条件流匹配基础上联合学习前向条件分布 \(p(\mathbf u_0^{\rm gt})\)（上图）与逆向条件分布 \(p(\mathbf u_T^{\rm gt})\)（下图）；无噪声的条件状态与当前流状态拼接作为模型输入。(b) **CBi-CFM 框架**：把概率流约束在守恒流形 \(\mathcal M\) 内以强制守恒量 \(H\)；先验分布通过在 \(\mathcal M\) 上随机游走采样，随后施加投影校正以减小数值误差；速度被投影到切空间 \(T\mathcal M\)，使流动全程保持守恒。(c) **指数敏感性**：Lorenz 系统中量级 10<sup>−6</sup> 的扰动被迅速放大，使初态相近的轨迹在混沌吸引子上分离。

## 2. 结果

### 2.1 三个经典混沌系统上的评估

我们首先在复杂度递增的 Lorenz [37]、Circuit [38] 与 Lorenz 96 [39] 系统上评估 Bi-CFM，覆盖低维、多叶与高维混沌动力学。由于这些系统不施加守恒约束，故不应用 CBi-CFM。

**评价指标。** 由于混沌带来的随机性与不可预测性，确定性指标在演化时间增长后失去意义 [26, 34]。因此我们采用分布级指标，即 Wasserstein-2 距离（W-2 距离）与 Kullback–Leibler 散度（KL 散度）比较分布。对 W-2 距离，我们比较若干分布对：\(\mathbf u_0\) 与 \(\mathbf u_0^{\rm gt}\) 之间、\(\mathbf u_T\) 与 \(\mathbf u_T^{\rm gt}\) 之间、整条轨迹之间，以及初态—目标末态对 \((\mathbf u_0,\mathbf u_T^{\rm gt})\) 之间。这里特别强调：评估不同时刻状态之间的因果关系是否符合系统动力学同样重要，这反映在最后两项涉及不同 \(T\) 的指标中。此外我们考虑初态—目标末态对 \((\mathbf u_0,\mathbf u_T^{\rm gt})\) 之间的 KL 散度，以进一步度量推断初态在系统动态相关性意义上与目标末态的对齐程度。细节见第 4.4 节。

**结果。** 我们在若干时域长度 \(T\)（以周期数计）下于 Lorenz、Circuit 与 Lorenz 96 系统上评估不同方法，考察其求解逆问题的能力随时域增长如何变化，定量结果整理于图 2。图 2a 显示代表性指标随时域长度的演变，包括推断初态分布的 W-2 距离、前向演化末态分布的 W-2 距离，以及初态—目标末态对的 KL 散度，分别评估推断初始条件的准确性、这些初始条件前向演化所得末态的准确性，以及初末态之间因果关系是否与底层物理动力学一致。其余分布级指标（轨迹与初末态对的 W-2 距离等）见附录 C，其趋势与 KL 散度相似。为紧凑、显式地比较各指标，图 2b 给出每个系统在最长时域上的雷达图，各指标值用同一指标特定常数归一化；反向积分未在雷达图中显示，因其数值超出显示范围。

对 Lorenz 与 Circuit 系统，在初态与末态分布的 W-2 距离上 Bi-CFM 表现接近 Random——说明它成功匹配了目标边缘分布（Random 正是为匹配这些边缘分布而构造的）；然而 Random 忽略了初末态之间的因果关系，因此在依赖联合分布或轨迹级分布（含整条轨迹分布与初末态对分布）的指标上表现很差。相反，Bi-CFM 在这些**因果指标**上表现更好。此外，Bi-CFM 优于 Backbone 也凸显了概率生成建模与双向学习的优势。对时域长度的依赖进一步揭示了迭代式反向数值方法的不稳定性：反向积分在时域较短、系统行为更确定时尚可，但随着 \(T\) 增大、混沌性更明显，其性能迅速恶化。这些结果表明，混沌系统中的误差累积使沿时间维反复积分的方法不如端到端学习映射，尤其在长时域；相比之下 Backbone 与 Bi-CFM 随 \(T\) 增大保持相对稳定。对 Lorenz 96 系统，Bi-CFM 同样取得最佳整体性能，优势最明显地体现在匹配推断初态分布上——这与 CFM 的训练目标（直接学习推断状态的目标分布）一致。

**图 2（原文 Fig. 2）：** Lorenz、Circuit 与 Lorenz 96 系统的评价指标。a. 不同方法评价指标随时域长度 \(T\) 的变化（阴影带为重复子采样的 5–95% 范围）。b. 最长时域下各评价指标的归一化结果（反向积分的结果完全落在圆外）。

进一步地，图 3 展示推断分布的差异：图 3b 比较三种方法推断的初态分布三维密度等值面，Bi-CFM 产生的分布最接近真值，Backbone 产生的分布偏离真值（反映确定性映射的局限），反向积分不稳定、其推断初态与目标分布偏差最大。对应的二维 \((x,y)\) 分布见附录 C，其中 Backbone 进一步表现为向低维一维流形（实质上是线段）的坍缩。最后，我们可视化演化轨迹于图 4：图 4a 为 Lorenz 系统在 \(T=2.6\)（取 \(T=2.0\) 与 \(T=3.0\) 之间的中间时域），图 4b 为 Circuit 系统在 \(T=1.4\)；两种情形都可视化来自真值与前向演化轨迹 \(g(\mathbf u_0,t)\) 的 5000 个轨迹点。Bi-CFM 产生的轨迹分布形状几乎与真值一致，而 Backbone 产生更窄的分布；反向积分给出范围大得多（达 10<sup>5</sup> 量级）的非真实分布，其初态与末态都显著偏离目标分布。值得注意的是，在 Circuit 系统中，反向积分尽管初态不真实，其末态分布却部分类似三叶吸引子——这凸显了逆问题的不适定性：差异很大的初态可导致相似的末态分布。Lorenz 96 系统的轨迹可视化见附录 C。

**图 3（原文 Fig. 3）：** Lorenz 与 Circuit 系统上的分布可视化。a. 推断初态的分布对比。b. 三维密度等值面对比。

**图 4（原文 Fig. 4）：** 测试集上从推断初态出发的演化轨迹 \(g(\mathbf u_0,t)\)。a. Lorenz 系统轨迹；b. Circuit 系统轨迹。

### 2.2 三体行星系统上的评估

本节把 Bi-CFM 与 CBi-CFM 应用于涉及行星—行星动力学相互作用（含散射与碰撞事件）的天体物理问题，如图 5a 所示。这一过程是原行星盘中行星形成的自然结果：新生行星向内迁移并发生引力相互作用，最终在原行星盘消散时驱动动力学不稳定、近距离交会、散射与碰撞 [18, 44, 45]。既有研究表明，行星—行星散射与碰撞能够解释从近距错位热木星、偏心宽轨道行星到巨型撞击塑造的系统等多种行星构型 [17, 19, 46–51]；然而不稳定性发生前行星系统的初始动力学状态仍受约束不足。确定这些初始条件将有助于揭示行星起源、解释行星系统多样性，并更好理解太阳系在宇宙中的独特性。

**实验设置。** 仿真中我们考虑三颗行星绕太阳质量宿主恒星运行的系统（沿用 [19]）。散射仿真用 REBOUND 与 REBOUNDx 完成，包含广义相对论修正、质量与动量守恒的碰撞以及行星抛射。系统细节见第 4.5 节与附录 A。

分析与理解该系统很有意义，但求解其逆问题较为困难，原因在于**信息损失**：一旦行星被抛射或发生碰撞，系统的一部分即不可观测，初始条件只能由剩余可观测状态推断。虽然某些传统数值算法原则上可逆 [21]，但由于系统部分不可观测，此处无法应用反向积分。因此本实验中反向积分基线不适用。

该系统中，能量守恒（即初末态总能量相同）是根本物理约束，满足该守恒律对准确求解前向与逆问题都必不可少。我们注意到保持结构的求解器（特别是辛积分器）在行星动力学中被广泛使用 [52, 53]。为利用该性质，我们评估显式强制能量守恒的 CBi-CFM 在训练与采样过程中的表现。

**评价指标。** 由于需要强制守恒约束，我们引入新指标**相对守恒误差**（Relative Conservation Error，RCE），度量守恒律被满足的程度，其中 \(H\) 表示由推断状态计算的守恒量（如总能量），\(H^{\rm gt}\) 为相应真值。

**结果。** 实验结果按图 5 的四个子图组织。图 5b 给出各方法在所有指标上的定量结果（Random 的 RCE 超出归一化圆范围，故省略）。第一，除初态 W-2 距离外，Bi-CFM 与 CBi-CFM 表现最佳——在初态 W-2 距离上 Random 因直接匹配目标初态分布而略优于 Bi-CFM。第二，比较 CBi-CFM 与 Bi-CFM 可见 CBi-CFM 取得更低 RCE，说明约束先验分布与速度场提升了守恒律的遵循程度；同时 CBi-CFM 在基于分布的指标上略差于 Bi-CFM，表明存在"强制守恒"与"保持分布精度"之间的权衡——可能因为守恒约束缩小了可行解空间。

图 5c 的两个子图评估各重建是否保持散射系统的守恒能量：把推断初态的能量与目标末态的能量比较。对数尺度 RCE 的经验累积分布概括了全测试集上的比较：曲线在较小误差处更快上升到 1，说明更大比例的样本具有低能量失配。由于真值轨迹由数值积分产生，其守恒误差因有限步长与浮点误差并非严格为零；我们观察到 CBi-CFM 把能量守恒保持在几乎与该数值真值误差相当的水平，Bi-CFM 次之，Backbone 再次，Random 偏差最大。另一方面，校准图给出互补的逐样本视角：每点对应一条测试轨迹，横轴为目标末态能量、纵轴为推断初态能量，虚线对角线表示完全一致；CBi-CFM 的点最接近对角线，其次为 Bi-CFM 与 Backbone，而 Random 的点几乎不对齐对角线。

图 5d 可视化不同方法下第一个天体推断初态的代表性特征分布，分别考虑全部轨迹与含散射事件轨迹。首先，真值在两类轨迹上的分布在若干特征上存在差异；CBi-CFM、Bi-CFM 与 Backbone 都能区分这两类轨迹。其次，对每个分布，最接近目标分布的是 Bi-CFM 或 CBi-CFM，显示其相对 Backbone 更强的动力学捕捉能力；特别地，对重要特征**偏心率**，尽管所有方法都难以拟合该分布，Backbone 生成的分布在两类轨迹上都明显比 Bi-CFM 与 CBi-CFM 更窄，揭示确定性模型的局限。

最后，图 5e 考察 CBi-CFM 能否依据末态正确推断初始半长轴的相应区间（Bi-CFM 与 Backbone 的结果见附录 C 图 C10）。具体地，我们按初始半长轴把所有轨迹分为三组。结果表明 CBi-CFM 能推断出正确的 \(a_0\) 区间，且推断分布与真值高度接近，说明 CBi-CFM 能捕捉初态特征与末态可观测之间的对应关系。

**图 5（原文 Fig. 5）：** 恒星—行星系统上的可视化、评价指标、分布与能量守恒。a. 碰撞与散射的可视化。b. 类同图 2b，但为恒星—行星系统并增加"相对守恒误差"指标。c. 相对守恒误差的累积分布，以及推断初态能量与真值末态能量的校准散点图。d. 全部轨迹与含散射轨迹的推断初态特征（质量、半长轴、偏心率）分布。e. 在初始半长轴较小（\(a_0<0.05\)）、中等与较大三类轨迹上推断初始半长轴 \(a_0\) 的分布。

### 2.3 真实世界百万体球状星团上的评估

为在真实观测场景中测试 Bi-CFM，我们把它应用于长时标球状星团（globular cluster，GC）演化的逆问题。银河系 GC 是古老、致密、自引力的恒星系统，通常含 10<sup>4</sup>–10<sup>6</sup> 颗恒星，演化时间尺度约为 10 Gyr 或更长 [54–56]。作为银河系早期组装历史的示踪物，它们为银河系考古提供了天然试验台 [57]。给定现今星团的观测表面亮度轮廓（surface brightness profile，SBP）、速度弥散轮廓（velocity dispersion profile，VDP）与年龄，目标是推断其初始动力学状态，使长期演化后的末态重现这些观测量。

该逆问题之所以困难，是因为约 10 Gyr 的恒星演化、两体弛豫、质量分层、潮汐剥离、双星相互作用以及可能的核坍缩会抹去或强烈重塑诞生状态的记忆，从初始星团参数到现今可观测量的映射高度退化 [58–61]。传统直接模拟与 Monte Carlo 模拟一直是建模 GC 演化的核心工具，但在大规模初始条件空间上做暴力逆推断在计算上不可行 [62–65]。因此该设定为 Bi-CFM 这类分布级、由模拟训练的方法提供了严格的真实世界检验。更多天体物理背景与计算细节见附录 A。

**实验设置。** 我们考虑一组以 NGC 编号标识的银河系 GC 观测。图 6a 展示 NGC 3201 的观测数据：观测数据由其文献报道的现今结构与运动学性质构成，编码了长期动力学演化信息。本文的观测约束主要基于投影 SBP、VDP 与年龄，三者对每个星团提供互补约束：SBP 追踪恒星光的投影分布，VDP 约束内部运动学与动力学质量分布，年龄则设定模拟星团应与观测系统比较的演化时刻。数据细节见附录 A。

**基线与指标。** 我们与最先进的 Monte Carlo 方法 [66] 比较。由于模拟使用 \(N=4\times10^5\) 个粒子，我们沿用 Rui 等 [66] 的推断，在初始粒子数最可能为 \(N=4\times10^5\) 的十个星团上做基线比较。为量化模拟轮廓与观测轮廓的一致性，我们沿用既有工作 [66–68] 用不确定性加权 \(\chi^2\) 统计量比较 SBP 与 VDP。

**结果。** 总体而言，我们由各方法推断的初态出发做模拟，并用 \(\chi^2\) 误差将所得末态与观测数据比较。部分模拟在达到文献年龄之前星团即瓦解，此时我们使用最终模拟状态计算误差。观测的 SBP 与 VDP 在星团相关半径上测量，而模拟轮廓表示在固定径向网格上；因此我们插值观测轮廓并在与训练数据相同的径向网格上评估，使观测星团可作为模型输入。然而观测半径常集中在有限径向范围内、不能均匀覆盖整个模拟网格，插值在观测稀疏处可能不可靠，从而把不准确的轮廓值引入推断流程。为减小弱约束径向区域的影响，我们构造训练数据的三种径向覆盖变体；结合两种模拟数据来源，共得到六个训练数据集。对每个星团，我们报告相应六个训练模型中表现最好的 Bi-CFM 结果。我们发现"半网格"变体通常整体表现最佳，可能因为该径向范围更好地匹配了观测半径最密集的区域。

图 6c 汇总基线与此方法在各星团上的结果，同一星团的结果用线段连接；越靠近左下角的点表示 SBP 与 VDP 误差都更小。可见 Bi-CFM 总体优于基线 Monte Carlo 方法，仅在一个星团上两者相当。为提供更细致的比较，图 6d 可视化三个星团的轮廓，包括与图 6a 对应的 NGC 3201，以及 NGC 5897 与 NGC 6362：三角形为观测数据点，竖直区间为其不确定度，虚线为观测数据点线性插值所得轮廓，绿色与黄色曲线分别为由 Monte Carlo 方法与 Bi-CFM 推断初态演化得到的末态。可见 Bi-CFM 的结果更贴合观测数据点、也更接近线性插值轮廓——Bi-CFM 推断出物理上更一致的初始条件，其长期演化更匹配观测。原因是：Monte Carlo 方法通过有限次前向模拟在初始条件空间中搜索，而 Bi-CFM 学习初末态之间**分布级**的物理对应。其在这一长时标问题上的成功进一步说明，所提端到端双向设计有效缓解了混沌动力学固有的误差累积。该实验表明，所提方法可作为 GC 这一大规模、混沌、长时标系统逆问题的新工具，优于传统方法。

**推理时间。** 图 6e 记录不同方法对单个样本的推理时间（Lorenz、Circuit、Lorenz 96 系统的时域 \(T\) 分别为 3、1.5、7）。尽管任务复杂，Bi-CFM 在 GC 任务上的推理时间与其他系统相当；时间按预热后批大小为 1 的 50 个批次的平均计算。深度学习方法在 GPU 上运行，反向积分在 CPU 上运行（其实现不适用于 GPU）；我们注意到传统数值求解器的 GPU 实现未来可能加速反向积分类方法。由图 6e 可见，相比反向积分，CFM 实现两个数量级以上加速，但比 Backbone 慢，因为采样需要若干步；此外反向积分的耗时随维数增加而显著增长，而深度学习方法的推理时间几乎不变，显示其处理高维问题的潜力。CBi-CFM 比 Bi-CFM 耗时更长，主要因为从先验分布采样需要随机游走与投影校正步骤。

### 2.4 推理时间与鲁棒性分析

在推理时间之外，我们还评估方法对噪声观测的鲁棒性（图 6f）：向输入末态注入不同强度的高斯噪声，比较各方法的分布级指标。结果表明 Bi-CFM 对中等噪声保持稳定，其退化速度慢于 Backbone 与反向积分，这得益于其概率建模与双向一致性约束；CBi-CFM 在噪声下仍保持最低的守恒误差。该鲁棒性分析也说明所提分布级框架适合真实观测中不可避免的测量噪声。

**图 6（原文 Fig. 6）：** 百万体球状星团系统的观测数据、模拟数据、评价指标与轮廓，以及推理时间与鲁棒性消融分析。a. 观测数据可视化。b. 模拟数据可视化。c. Monte Carlo 方法与 Bi-CFM 的 SBP、VDP 误差。d. 观测数据、Monte Carlo 方法与 Bi-CFM 的表面亮度轮廓与速度弥散轮廓。e. 不同方法在不同系统上的推理时间。f. 不同方法在含噪数据上的评价指标。

## 3. 讨论与结论（原文 Discussion）

本文提出 Bi-CFM——一种面向混沌系统逆问题的概率化、物理有据的方法。大量实验证明其有效性，并揭示深度生成建模在处理不适定逆问题上的潜力。一方面，Bi-CFM 通过端到端学习与双向建模应对混沌系统的核心挑战之一：误差随时间的指数累积；另一方面，其概率表述捕捉了混沌演化的随机性与非唯一性。其守恒约束扩展 CBi-CFM 进一步纳入关键物理原理，在逆建模中强制守恒量。此外，随着系统维数增加，深度学习方法的推理时间几乎不变，说明其有潜力缓解维数灾难 [69]。综合而言，Bi-CFM 与 CBi-CFM 为银河系考古、行星动力学及其他混沌物理系统中的高维、长时标逆问题提供了一条可行路径。

在一系列系统实验中，我们观察到若干有趣现象，可为未来工作提供洞见。第一，我们发现反向积分产生的一些初态 \(\mathbf u_0\) 与其真值 \(\mathbf u^{\rm gt}\) 在量级上差异显著，而前向演化所得末态 \(g\) 却很接近。这反映了逆问题的不适定性与多解性，表明在数据分布之外还存在合理解，可能带来重要科学发现；但要让深度学习方法揭示这些解，需要增强泛化能力，可通过引入物理约束与先验实现。第二，我们观察到 CBi-CFM 在施加守恒约束时出现性能退化。这一权衡反映了强制物理规律与保持表示灵活性之间的内在张力，在高维混沌系统中尤为明显。我们预期未来理论进展能为该现象提供理解与解决方案；未来工作也可探索自适应或可学习的守恒约束，在训练中动态调节物理约束强度，从而按需求与具体设定平衡物理一致性与表达力。

此外，还有若干值得研究的改进方向。第一，我们发现 Bi-CFM 在建模初态分布上相对末态保持优势，这可归因于其直接以初始分布为重点的优化目标；一种可能的改进是在训练中为末态引入额外约束，例如把推断初态经所学动力学演化后再施加一致性约束。第二，尽管 Bi-CFM 相对基于反向积分的传统数值求解器实现百倍加速，但仍慢于基础模型 Backbone，主要因为 CFM 采样涉及多步迭代；该局限可通过改进流匹配方法（如 Short-cut Models [70] 或 MeanFlow [71] 等一步方法）缓解，另一种方案是把当前模型蒸馏为更小、更高效的版本 [72, 73]，以减少采样步数并加速每步推理。最后，一个有趣方向是为推断状态提供显式的置信度估计：未来可用数值求解概率流方程来计算概率估计，这将使模型更可解释、更可靠。未来我们计划系统研究这些方向，为生成框架配备置信度估计，有望把生成式学习应用于混沌物理系统。

## 4. 方法

### 4.1 条件流匹配

条件流匹配（CFM）[32, 33] 已成为最先进的生成建模范式之一。为从**目标**概率分布采样，CFM 构造一条概率"流"路径 \(p_\tau\)：它从 \(\tau=0\) 处易于采样的**源**分布 \(p_0\)（如高斯分布）出发，在 \(\tau=1\) 处到达目标分布 \(p_1\)。CFM 的目标是学习该流路径上的速度场 \(v_\tau\)，使从 \(p_0\) 抽取的样本 \(\mathbf x_0\) 能通过从 \(\tau=0\) 到 \(\tau=1\) 积分如下 ODE 变换为目标分布的样本 \(\mathbf x_1\)：

$$
\frac{{\rm d}\mathbf x_\tau}{{\rm d}\tau}=v_\tau(\mathbf x_\tau),\tag{1}
$$

因此模型 \(v_\theta(\tau,\mathbf x_\tau)\) 需回归边际速度场，采用边际损失。该边际速度场是条件速度的期望：

$$
v_\tau(\mathbf x_\tau)=\mathbb E\left[v_\tau(\mathbf x_\tau\mid z)\right],
$$

其中 \(z\) 为条件、\(p_\tau(\mathbf x_\tau|z)\) 为条件概率路径。条件概率路径通常远比边际路径 \(p_t(\mathbf x_t)\) 简单，因为 \(z\) 通常包含路径的起点或终点；在已知 \(z\) 的条件下，可在不引入期望运算所涉高维积分的情况下构造条件概率路径。因此相比边际速度，条件速度 \(v_t(\mathbf x_t|z)\) 是可处理的，从而得到可处理的**条件训练损失**。此外已证明，用于优化模型参数 \(\theta\) 时该条件损失等价于**边际**训练损失 [32, 33]，即 \(\nabla_\theta\mathcal L_{\rm conditional}=\nabla_\theta\mathcal L_{\rm marginal}\)，故可以条件损失作为训练目标。与归一化流 [74] 等其他基于流的生成模型相比，条件损失赋予 CFM 训练高效性以及对复杂概率分布和大数据集的可扩展性，因此我们采用它来建模混沌系统逆问题中的分布。

本文取 \(p_0=\mathcal N(0;\mathbf I)\)、\(z=(\mathbf x_0,\mathbf x_1)\) 对。此时构造的条件概率路径退化为插值形式

$$
\mathbf x_\tau=\alpha(\tau)\mathbf x_0+\beta(\tau)\mathbf x_1+\eta(\tau)\boldsymbol\epsilon,
$$

其中 \(\alpha(\tau)\) 与 \(\beta(\tau)\) 为含时插值系数，\(\eta(\tau)\) 为小随机噪声尺度，用于保持随机性。此时源样本与目标样本可耦合，从而允许更灵活的流映射。采样方面，由于 CFM 采样涉及模拟 ODE（式 1），可采用不同数值求解器；本研究中我们采用 Dormand–Prince（RKDP）方法 [75] 与 100 步。

### 4.2 双向建模

双向建模策略是我们为联合学习混沌系统的前向与反向动力学而引入的方法，其动机来自混沌系统中的误差累积。经验上，我们在实验中观察到：尽管模型能准确逼近初始状态分布 \(p(\mathbf u_0^{\rm gt})\)，但推断初态 \(\mathbf u_0\) 前向演化到 \(g(\mathbf u_0,T)\) 时误差常被放大，导致末态偏差较大。双向表述通过改善前向与反向动力学之间的一致性来缓解该问题，使模型学到更完整、物理更一致的表示。

具体地，我们的目标是既学习由 \(p(\mathbf u_T^{\rm gt})\) 表示的逆向动力学，也学习对应 \(p(\mathbf u_0^{\rm gt})\) 的前向动力学。实践中我们让模型学习生成状态对 \((\mathbf u_0^{\rm gt},\mathbf u_T^{\rm gt})\)。训练时随机选择一部分样本对，以 \(\mathbf u_T^{\rm gt}\) 位置作为条件（即无噪声变量），而对应的 \(\mathbf u_0^{\rm gt}\) 位置仍按从高斯噪声去噪到初始分布的方式训练；对其余样本，角色互换：以 \(\mathbf u_0^{\rm gt}\) 为条件生成 \(\mathbf u_T^{\rm gt}\)。这些样本对应的时间对为 \((\tau_1,\tau_2)=(1,\tau)\)。条件 CFM 与双向训练实现的细节见附录 B。

采样时，我们的目标是从 \(p(\mathbf u_0\mid\mathbf u_T^{\rm gt})\) 采样，令 \(\tau_1\) 从 0 逐渐增至 1，使概率流从 \(p(\mathcal N(0;\mathbf I)\mid\mathbf u_T^{\rm gt})\) 出发。通过该双向采样与训练方案，模型联合学习前向与反向动力学，得到一致的表示。

### 4.3 守恒律约束

守恒律通过约束系统演化、保证动力学一致性，在物理中扮演重要角色。根据 Noether 定理 [76]，物理系统的每个连续对称性都对应一个守恒量：平移对称性导致动量守恒，旋转对称性导致角动量守恒，时间不变性导致能量守恒。这些守恒律不仅简化复杂动力学，也编码了对称性与物理不变量之间的因果关系。在数据驱动模型中强制此类约束，可引导所学动力学保持物理一致。因此我们提出把 Bi-CFM 约束为遵循守恒律的方法，可应用于任何守恒量已知的系统。

为推断满足守恒律的初态 \(\mathbf u_0\)，我们把 \(p(\mathbf u_0)\) 约束在**守恒流形**（即由守恒律约束的数据流形）上，通过对先验分布与速度场同时施加守恒约束实现（如图 1b 所示）：先约束先验分布位于守恒约束流形内，再限制速度场与该流形相切，从而使整条概率流在守恒流形内演化。

数学上，设系统存在守恒量 \(H\)。例如在 \(N\) 体行星—恒星系统中总能量守恒，可写为

$$
H=-\sum_{i=1}^{N}\frac{Gm_iM}{2a_i},
$$

其中 \(m_i\) 与 \(a_i\) 分别为第 \(i\) 个天体的质量与半长轴，\(M\) 为中央恒星质量。对轨迹 \((\mathbf u_0,\mathbf u_1,\ldots,\mathbf u_T)\)，守恒律要求 \(H(\mathbf u_t)\) 对所有 \(t=0,\ldots,T\) 保持不变。因此给定 \(\mathbf u_T^{\rm gt}\)，我们的目标是推断初态 \(\mathbf u_0\) 使 \(H(\mathbf u_0)=H(\mathbf u_T^{\rm gt})\)，确保推断的初始条件与目标状态位于同一守恒流形。由于目标是使生成的 \(\mathbf u_0\) 满足守恒律，以下所有操作都施加于双向建模框架中的 \(\mathbf u_0\) 分量；为简洁起见，后文还省略表示条件 \(\mathbf u_T^{\rm gt}\) 的记号。

**守恒约束先验分布。** 为在 \(H(\mathbf u)=H(\mathbf u_T)\) 定义的 \(\mathbf u\) 守恒流形内采样，我们从 \(\mathbf u_T\) 出发沿守恒流形的切空间做随机游走，最后施加投影校正以减小数值误差。具体地，初始化 \(\mathbf u=\mathbf u_T^{\rm gt}\) 并按如下方式迭代更新：每步从高斯分布采样随机向量 \(\mathbf r\)，通过 \(\mathbf r\cdot\mathbf P(\mathbf u)\) 投影到守恒流形切空间，并用 \(\mathbf u'=\mathbf u+\mathbf r\cdot\mathbf P(\mathbf u)\Delta r\) 更新当前状态，其中 \(\Delta r\) 为步长。与守恒量 \(H\) 相关的投影矩阵定义为

$$
\mathbf P(\mathbf u)=\mathbf I-\frac{\nabla H(\mathbf u)\nabla H(\mathbf u)^\top}{\|\nabla H(\mathbf u)\|^2}.\tag{2}
$$

我们给出一个命题，保证 \(\mathbf r\cdot\mathbf P(\mathbf u)\) 位于守恒流形切空间内，其证明见附录 D。

**命题 1。** 设 \(H:\mathbb R^n\to\mathbb R\) 连续可微，守恒流形定义为

$$
\mathcal M=\{\mathbf u\in\mathbb R^n:H(\mathbf u)=H(\mathbf u_T^{\rm gt})\},
$$

且其上 \(\nabla H(\mathbf u)\ne\mathbf 0\)。令 \(\mathbf P\) 如式 (2) 定义，则对任意 \(\mathbf r\in\mathbb R^n\)，向量 \(\mathbf r\cdot\mathbf P(\mathbf u)\) 位于 \(\mathbf u\) 处流形 \(\mathcal M\) 的切空间 \(T_{\mathbf u}\mathcal M\) 内。

尽管该命题保证 \(\mathbf r\cdot\mathbf P(\mathbf u)\) 位于切空间，我们观察到以 \(\mathbf u'=\mathbf u+\mathbf r\Delta r\) 更新时存在精度与效率的权衡：若 \(\Delta r\) 较大，更新引入不可忽略的数值误差把 \(\mathbf u\) 推出守恒流形，且偏差会随迭代累积；若 \(\Delta r\) 太小，随机游走又局限在 \(\mathbf u_T\) 附近的小邻域内，限制先验分布的多样性与算法的表达力。为此我们用投影校正缓解该权衡。投影步同样是迭代的：每次迭代的目标是校正当前状态 \(\mathbf u\)，使其守恒量 \(H(\mathbf u)\) 更接近目标值 \(H(\mathbf u_T)\)；校正沿 \(H\) 的梯度方向进行，即

$$
\mathbf u\leftarrow\mathbf u-\left(H(\mathbf u)-H(\mathbf u_T)\right)\frac{\nabla H(\mathbf u)}{\|\nabla H(\mathbf u)\|^2},
$$

每次迭代都减小偏差 \(|H(\mathbf u')-H(\mathbf u_T)|\)，逐步把 \(\mathbf u\) 拉回守恒流形。实践中通常只需少数几次迭代即可充分满足守恒。

**守恒约束速度场。** 为确保所学流保持在守恒流形内，我们进一步约束模型预测的速度场位于守恒流形切空间内，具体通过把速度场投影到切空间实现：在训练与采样过程中都把速度场与式 (2) 的投影矩阵 \(\mathbf P(\mathbf u)\) 相乘。命题 1 为该操作提供理论依据，保证 \(v_\theta\cdot\mathbf P(\mathbf u)\) 总位于守恒流形切空间内。此外，训练中 CFM 的损失 \(\mathcal L_{\rm conditional}\) 定义在条件速度 \(v_t(\mathbf u|z)\) 上，故只能对这些条件速度施加约束；我们指出，作为条件速度期望的边际速度同样保持在切空间内——因为期望算子保持线性、且每个条件速度都已在切空间内。

### 4.4 评价指标

如第 2.1 节所述，我们用分布级距离评估不同方法，具体采用 Wasserstein 距离与 KL 散度两类经典且广泛使用的指标；对球状星团系统，我们还用 SBP 与 VDP 的 \(\chi^2\) 统计量。

**Wasserstein 距离。** 形式上，对定义在带代价函数 \(d(\cdot,\cdot)\) 的度量空间上的两个概率分布 \(q_1\) 与 \(q_2\)，Wasserstein 距离（W-\(p\)）为 \(W_p(q_1,q_2)=\left(\inf_{\pi\in\Pi(q_1,q_2)}\int d(x,y)^p\,{\rm d}\pi(x,y)\right)^{1/p}\)，其中 \(\Pi(q_1,q_2)\) 表示以 \(q_1\)、\(q_2\) 为边缘的所有联合分布的集合。实现中我们取 \(p=2\)，对应平方欧氏代价 \(d(x,y)=\|x-y\|^2\)。Wasserstein 距离度量把一个概率分布输运到另一个的最小代价，是同时捕捉分布几何与全局结构的有意义指标。为数值稳定与效率，我们用熵正则近似——即 Sinkhorn 散度 [77]，配合 GeomLoss 软件包 [78] 计算 W-2 距离。Sinkhorn 散度在原始最优传输问题上加入熵正则项，使其成为凸问题并可用 Sinkhorn–Knopp 算法高效求解 [79]；在 GeomLoss 中，熵正则项由参数 blur 控制，实验中我们取 blur \(=0.01\)，得到稳定可微的 W-2 距离估计。

**KL 散度。** KL 散度量化两个分布之间的相对熵，反映用 \(q\) 近似 \(p\) 时损失的信息量。其定义为

$$
D_{\rm KL}(p\|q)=\int p(x)\log\frac{p(x)}{q(x)}\,{\rm d}x.\tag{3}
$$

与 W-2 距离不同，它不对称、不满足三角不等式，但对分布间的局部失配提供敏感度量。我们用基于 \(k\) 最近邻的估计器 [80] 估计两个经验分布之间的 KL 散度：该非参数方法由每个样本到 \(k\) 个最近邻的距离估计局部概率密度，并直接由这些密度比计算散度。实现中取 \(k=5\)，每个分布对使用 2500 个样本；为量化不确定性，我们对数据做 100 次 bootstrap 重采样并重算每次试验的散度估计，从而得到稳健、样本高效的 KL 散度估计，适合比较高维动力学分布。

**归一化。** 对跨不同时间步的状态分布级指标，为防止某一时间步的分布主导整体距离，我们按减去均值、除以标准差的方式对不同步的分布做归一化。

**\(\chi^2\) 统计量。** 在球状星团系统中，我们沿用既有工作 [66–68, 81, 82] 使用不确定性加权 \(\chi^2\) 统计量。我们由星表质量权重 [83] 估计有效不确定度：对第 \(i\) 个 SBP 点定义

$$
\delta\mu_{V,i}=\frac{\delta\mu_{V,0}}{w_i},\tag{4}
$$

其中 \(w_i\) 为星表质量权重。归一化由表格化三阶 Chebyshev 拟合的残差估计：

$$
\delta\mu_{V,0}=\left[\frac{1}{N_{\rm SBP}}\sum_{i}w_i^2\epsilon_{\mu,i}^2\right]^{1/2},\tag{5}
$$

其中 \(\epsilon_{\mu,i}\) 为观测 SBP 点相对 Chebyshev 拟合的残差，\(N_{\rm SBP}\) 为有效 SBP 观测径向点数；非正权重点被剔除。所得逆方差权重随后归一化，再用于构造插值观测轮廓。对 VDP 数据，我们使用 Baumgardt 汇编 [84, 85] 中径向速度或自行测量所报告的上、下观测不确定度；由于轮廓统计对每点使用单一对称权重，我们定义有效不确定度

$$
\delta\sigma_i=\frac{\delta\sigma_{i,+}+\delta\sigma_{i,-}}{2}.\tag{6}
$$

由此得到观测轮廓构造中使用的逆不确定度权重。模拟轮廓与相应观测轮廓的差异在观测半径处评估：把模拟轮廓线性插值到每个观测半径，并计算

$$
\chi^2_{\rm SBP}=\frac{1}{N_{\rm SBP}}\sum_{i}W_i^{\rm SBP}\left[\mu_{V,{\rm sim}}(R_i)-\mu_{V,{\rm obs}}(R_i)\right]^2,\tag{7}
$$

$$
\chi^2_{\rm VDP}=\frac{1}{N_{\rm VDP}}\sum_{i}\left[\frac{\sigma_{\rm sim}(R_i)-\sigma_{\rm obs}(R_i)}{\delta\sigma_i}\right]^2,\tag{8}
$$

其中 \(W_i^{\rm SBP}=\omega_i/\sum_j\omega_j\) 表示归一化的 SBP 权重。

### 4.5 实验设置

**三个经典混沌系统。** 首先考虑 Lorenz 系统——最初作为大气对流简化模型提出的经典三维混沌系统 [37]。我们采用标准混沌参数设置，系统呈现著名的蝶形奇异吸引子与强初值敏感性。其次研究一个三维自治混沌系统，它已被用于保密通信与加密等应用 [38]，通过改变单一参数可产生多叶混沌吸引子。最后考虑 Lorenz 96 系统——广泛用作非线性动力学与大气建模基准的高维混沌系统 [39]，在周期边界条件下捕捉多变量之间的复杂相互作用，常用于研究高维混沌；我们取强迫参数 \(F=20\)、维数 \(N=10\)。更多细节见附录 A。

**三体行星系统。** 为采样广泛初始条件，我们令行星质量从地球量级到数个木星质量，最内侧行星的初始半长轴在 0.02 至 0.4 AU 之间对数均匀抽取，另两颗行星的半长轴随后按允许高效散射的方式设定。我们令行星处于近圆、共面轨道，这符合原行星盘—行星相互作用早期阶段的预期。我们用 REBOUND 运行 N 体散射模拟 [86]，并通过 REBOUNDx 的 gr-potential 选项加入广义相对论修正 [87]；此外假设天体以质量与动量守恒方式碰撞（REBOUND 内置碰撞例程），并在行星到达 1000 AU 逃逸距离时将其抛射（移除）。系统细节见附录 A。

**真实世界百万体球状星团系统。** 我们从标准银河系 GC 星表汇编观测 SBP、VDP 与年龄。具体地，观测数据取自 [66] 使用的观测汇编；SBP 取自 Trager 等 [83] 的星表——它仍是研究银河系 GC 结构的标准大型汇编之一；VDP 取自 Holger Baumgardt 汇编的第四版 GC 数据库 [84, 85, 88]，该库结合大量视向速度样本与 Gaia 自行，为相当一部分银河系 GC 提供运动学轮廓。年龄估计则取自基于颜色—星等图、食双星、水平分支约束与 HST 测光的文献 [89–95]。

训练用模拟数据方面，我们从先前研究 [65] 收集模拟数据，并用同一求解器进一步生成额外数据（图 6b）。具体地，我们用 Cluster Monte Carlo（CMC）代码运行一套星团模拟——CMC 是模拟碰撞星团动力学的最先进代码 [64, 96]。CMC 遵循 Hénon 型 Monte Carlo 方法：两体弛豫以统计方式建模，把许多弱引力交会在一个时间步内的累积效应用相邻粒子的等效交会表示 [96, 97]。

为减小弱约束径向区域的影响，我们构造训练数据的三个变体，分别在完整径向网格、约覆盖一半径向范围的子集与约覆盖四分之一径向范围的子集上评估每个轮廓。模拟的物理参数选择基于 CMC Cluster Catalog [65] 与 Rui 等 [66] 观测比较的结果：后者用观测 SBP 与 VDP 拟合 59 个银河系 GC，表明星表模型中相当一部分可重现现今银河系 GC。因此我们选择的参数范围大致覆盖大多数银河系 GC 的星团尺度性质，同时保持模拟套件在计算上可行。具体地，固定初始粒子数 \(N=4\times10^5\)，变化三个星团尺度参数：初始位力半径 \(r_v\)、银心距 \(R_g\) 与金属丰度；其余初始条件沿用 Kremer 等 [65]。每个模型演化至 13.8 Gyr。

### 4.6 基线方法

第 2.1 与 2.2 节考虑三个主要基线。第一是**反向积分**（Backward Integration），使用第 1 节所述传统数值算法：对确定性非混沌系统，当时间步长足够小时它能以较小数值误差推断初态。实践中我们观察到其性能随时间步数增加先升后降：步数太少时难以精确收敛，步数过多时误差累积占主导。实验中我们选取性能最佳的时间步长，详细结果见附录 B。此外该基线要求显式已知运动方程，而 Bi-CFM 不需要。第二是 **Backbone**——CFM 算法的基础神经架构，其输入为目标末态、输出为推断初态。第三是从真值数据集中**随机选择**初始状态，下文称 Random：该基线所得初态 \(\mathbf u_0\) 分布及相应 \(g(\mathbf u_0,T)\) 的分布分别与真值 \(p(\mathbf u_T^{\rm gt})\) 相同，但它无法捕捉不同时间点状态之间的因果关系。更多基线实现细节见附录 B。

第 2.3 节考虑最先进的 Monte Carlo 方法作为基线 [66]。该方法通过在一组前向演化的星团模型中搜索来推断观测星团的初始条件：每个候选用一组给定物理参数初始化，并用星团模拟演化到老年，再计算其投影 SBP 与 VDP 并与相应观测轮廓比较；最终快照给出最小轮廓差异的候选被视为最佳匹配演化类比，其初始参数即作为该观测星团推断的初始条件。

## 5. 致谢

我们感谢西湖大学未来产业研究中心与西湖大学高性能计算中心的支持。内容仅由作者负责，不一定代表资助机构的官方观点。

## 附录 A 各系统的详细设置

本节介绍实验所用各系统的详细设置。

### A.1 Lorenz 系统

Lorenz 系统是混沌动力学系统的经典范例，最初作为大气对流的简化模型被研究 [37]。它由三个耦合非线性常微分方程（ODE）组成：

$$
\begin{cases}\dot x=\sigma(y-x),\\ \dot y=x(\rho-z)-y,\\ \dot z=xy-\beta z,\end{cases}
$$

其中 \(x(t),y(t),z(t)\) 为状态变量，\(\sigma,\rho,\beta\) 为分别控制扩散率、浮力与耗散的系统参数。常用设置为 \(\sigma=10\)、\(\rho=28\)、\(\beta=8/3\)；该参数下系统呈现著名的蝶形奇异吸引子，特征是敏感依赖初始条件与正的最大 Lyapunov 指数。数据生成中我们共生成 50,000 条轨迹，其中 45,000 条用于训练、5,000 条用于测试。我们采样初始状态，并用 \(\Delta t=10^{-5}\) 的步长、借助 scipy 软件包 [99] 数值求解方程。轨迹 \((x,y)\) 值的可视化见图 A1，展示经典蝶形吸引子。

**图 A1（原文 Fig. A1）：** Lorenz 系统数据集中一条轨迹的可视化。

### A.2 Circuit 系统

我们考虑的第二个系统是一个三维自治混沌系统，对通信、加密技术与安全信息传输等实际应用有重要意义 [38]。通过改变单一参数，该系统可产生双叶、三叶与四叶混沌吸引子。系统描述如下：

$$
\begin{cases}\dot x=y-ax+byz,\\ \dot y=cy-xz+z,\\ \dot z=dxy-hz,\end{cases}
$$

其中 \(x(t),y(t),z(t)\) 为状态变量，\(a,b,c,d,h\) 为正的常数参数。此处取 \(a=3\)、\(b=2.7\)、\(c=1.7\)、\(d=2\)、\(h=9\)。本实验中我们用 90,000 条轨迹训练、10,000 条评估；轨迹初始状态取自高斯分布 \(\mathcal N((1,-3,1);\mathbf I)\)。我们采用 8 阶显式 Runge–Kutta 方法 DOP853 [100]（scipy 实现）作数值求解器，时间步长 \(\Delta t=10^{-5}\)。图 A2 为该系统的 \((x,y)\) 可视化，展示吸引子的三叶结构。

**图 A2（原文 Fig. A2）：** Circuit 系统数据集中一条轨迹的可视化。

### A.3 Lorenz 96 系统

最后考虑高维 Lorenz 96 系统，它在非线性动力学中被广泛研究，最初用于表示大尺度天气模型中的大气对流 [39]。Lorenz 96 系统特别适合研究大系统中的混沌，常作为高维混沌研究的基准，其中多变量之间的相互作用导致复杂、不可预测的动力学。系统由以下方程支配：

$$
\dot u_i=(u_{i+1}-u_{i-2})u_{i-1}-u_i+F,\qquad i=1,2,\ldots,N,
$$

其中 \(u_i\) 表示第 \(i\) 个变量的状态，\(N\) 为系统中变量数；参数 \(F\) 为强迫项，控制外部强迫或输入的水平。系统通常采用周期边界条件，即 \(u_0=u_N\)、\(u_{N+1}=u_1\)。实验中取 \(F=20\)、\(N=10\)。该 10 维系统中我们共生成 50,000 条轨迹，训练集含 45,000 条、测试集 5,000 条；初始状态分布为均匀分布 \(\mathcal U([-2,2]^{10})\)。数值求解器采用 DOP853（8 阶显式 Runge–Kutta 方法），使用 scipy 且时间步长 \(\Delta t=10^{-5}\)。该系统的 \((u_1,u_2)\) 轨迹可视化见图 A3。

**图 A3（原文 Fig. A3）：** Lorenz 96 系统数据集中一条轨迹的可视化。

### A.4 三体恒星—行星系统

本实验中我们生成 49,999 条由一颗中央恒星与三颗行星组成的三体恒星—行星系统轨迹，考虑散射事件与碰撞；取 45,000 条训练，其余 4,999 条为测试集。所有量以天文学常用单位表示：恒星质量以太阳质量（\(M_\odot\)）为单位，行星质量以太阳质量为单位，距离以天文单位（AU）为单位，角度以弧度为单位（除另有说明）。

**中央恒星。** 恒星质量与半径固定为 \(M_\star=1.0\,M_\odot\)、\(R_\star=1.0\,R_\odot\)。

**行星质量与半径。** 令 \(M_{\rm Jup}=10^{-3}M_\odot\) 表示一个木星质量。最内侧行星质量 \(m_1\) 从对数均匀先验抽取，\(m_1\sim{\rm LogUniform}(\cdot\,)\times M_{\rm Jup}\)；另两颗行星质量设为在 \(m_1\) 的 \(\pm10\%\) 范围内。行星半径 \(R(m)\) 采用 Müller 等 [101] 依据 PlanetS 星表（仅含质量与半径可靠测量的行星）导出的三段式断裂幂律质量—半径关系，其中 \(R\) 以地球半径为单位；把 \(R(m)\) 应用于 \((m_1,m_2,m_3)\) 即得各自半径。

**半长轴。** 最内侧半长轴对数均匀抽取，\(a_1\sim{\rm LogUniform}(0.02,0.40)\) AU。外侧行星的初始化通过强制相邻轨道之间相隔固定 \(K\) 个相互 Hill 半径实现：取 \(K=4\) 以促进高效动力学散射；只要发生不稳定与散射，最终轨道分布对具体间距不敏感 [19]。具体地，设 \(a_k\) 与 \(a_{k+1}\) 为相邻半长轴、行星质量为 \(m_k\) 与 \(m_{k+1}\)，其相互 Hill 半径为

$$
R_{H,{\rm mut}}=\left(\frac{m_k+m_{k+1}}{3M_\star}\right)^{1/3}\frac{a_k+a_{k+1}}{2},
$$

并要求 \(a_{k+1}>a_k\) 满足 \(a_{k+1}-a_k=KR_{H,{\rm mut}}\)（\(K=4\)），由此隐式确定 \(a_2\) 及后续半长轴。

**轨道要素。** 偏心率、平近点角、近心点幅角、倾角与升交点黄经独立采样：偏心率取自 \([0,0.1]\) 上的均匀分布，平近点角、近心点幅角与升交点黄经取自 \([0,2\pi)\) 上的均匀分布，倾角取自小幅度的 Rayleigh 分布（具体取值见原文附录 A）。

**数值求解器。** 我们采用 TRACE [21]——一种用于行星动力学任意近距离交会的混合可逆积分器，位于 N 体软件包 REBOUND [86] 中。碰撞设置取 `sim.collision = 'direct'`、`sim.collision_resolve = 'merge'`。若行星到恒星距离超过 1000 AU，则视为被抛射并从模拟中移除。借助 REBOUNDx 的 `gr-potential` 选项，我们还计入广义相对论引起的近心点进动效应 [87]。

### A.5 球状星团：天体物理背景与模拟细节

**天体物理背景。** 球状星团（GC）是质量大、致密、自引力的恒星系统，通常含约 \(10^4\)–\(10^6\) 颗恒星，以及一批恒星残骸 [54, 55]。它们是现今宇宙中存留的最古老恒星系统之一，典型年龄约为 10 Gyr 或更老 [56]。由于年龄、金属丰度、轨道与动力学性质保留了早期恒星形成与吸积事件的信息，银河系 GC 被认为与银河系早期组装历史（包括原位形成与早期星系并合吸积）密切相关 [57]。

GC 也为研究致密环境中的恒星动力学提供了独特实验室 [102]：其高恒星密度使近距离交会、双星相互作用、并合与物理碰撞在长时标上具有动力学重要性。这些过程能够形成或改造奇异恒星族群，包括蓝离散星 [103]、低质量 X 射线双星 [104]、毫秒脉冲星 [105]，以及可能的中等质量黑洞 [106, 107]。这些性质使 GC 成为研究长期弛豫、恒星演化、双星动力学与外部潮汐场耦合效应的重要天体物理系统。

**现有方法与计算挑战。** GC 研究的一个核心目标是推断可能产生现今星团族群的初始条件与演化历史。该逆问题数十年来通过 GC 质量函数演化模型、直接与 Monte Carlo 动力学模拟，以及把现今 GC 系统联系到高红移恒星形成与星系组装的成团模型来研究 [59, 61, 108–111]。然而一个 Hubble 时间的恒星演化、两体弛豫、质量分层、双星相互作用、潮汐剥离以及可能的核坍缩会抹去或强烈重塑诞生状态的记忆，使初始星团参数到现今可观测量的映射高度退化。

正向建模 GC 演化本身也是理论天体物理的重大挑战：GC 是碰撞引力热系统，其演化需同时处理约百万粒子的引力相互作用与恒星演化；直接 N 体积分 [113] 的计算代价随粒子数超线性增长，Monte Carlo 方法 [62, 63, 96] 通过统计采样两体弛豫大幅降低代价，但单次模拟仍需大量计算资源，且在初始条件空间上做暴力逆推断不可行 [64, 65, 114, 115]。

**模拟数据。** 我们用 Cluster Monte Carlo（CMC）代码与 CMC Cluster Catalog [65] 的模型设置生成模拟数据（图 6b）：对每个模型，固定初始粒子数 \(N=4\times10^5\)，变化初始位力半径 \(r_v\)、银心距 \(R_g\) 与金属丰度三个星团尺度参数，其余初始条件沿用 Kremer 等 [65]，并把每个模型演化至 13.8 Gyr。为减小弱约束径向区域的影响，每个轮廓在三种径向区间上提取（完整网格、约一半、约四分之一径向范围），得到三组训练数据变体；结合两种模拟数据来源共六个训练数据集。

**观测数据。** 观测 SBP 取自 Trager 等 [83] 汇编，VDP 取自 Baumgardt 等 [84, 85, 88] 数据库第四版，年龄估计取自基于颜色—星等图、食双星、水平分支约束与 HST 测光的文献 [89–95]。观测轮廓在星团相关半径上测量，模拟轮廓在固定径向网格上表示，因此我们把观测轮廓插值到与训练数据相同的径向网格上。

## 附录 B 模型实现细节

本节介绍模型实现细节，包括计算资源以及本方法与基线实现。

**计算资源。** 所有 GPU 实验在单块 NVIDIA A6000 显卡上完成；服务器配备两颗 Intel 第三代 Ice Lake 处理器，基础频率至少 2.6 GHz，热设计功耗（TDP）不低于 250 W。

**条件 CFM 细节与双向训练实现。** 首先介绍用于生成条件概率 \(p(\mathbf x\mid\mathbf c)\) 的 CFM。在条件生成中 \(\mathbf c\) 表示用户提供的外部条件（如标签或上下文），而第 4.1 节原始 CFM 中的条件 \(z=(\mathbf x_0,\mathbf x_1)\) 是用于计算条件向量场（而非边际向量场）的流路径端点。沿用第 4.1 节的 CFM 表述，可把全部中间量 \(p_\tau(\mathbf x)\)、\(p_\tau(\mathbf x|z)\)、\(v_\tau(\mathbf x)\)、\(v_\tau(\mathbf x|z)\) 与 \(v_\theta(\tau,\mathbf x)\) 扩展为以 \(\mathbf c\) 为条件，即得到 \(p_\tau(\mathbf x|\mathbf c)\)、\(p_\tau(\mathbf x|z,\mathbf c)\)、\(v_\tau(\mathbf x|\mathbf c)\)、\(v_\tau(\mathbf x|z,\mathbf c)\) 与 \(v_\theta(\tau,\mathbf x,\mathbf c)\)，而推导仍然成立。该条件化使模型能够逼近目标分布 \(p(\mathbf x|\mathbf c)\)。

在双向建模中，状态对与 \(\mathbf u_0^{\rm gt}\)、\(\mathbf u_T^{\rm gt}\) 均属于 \(\mathbb R^{2n}\)（在此表述中 \(v_\tau\) 的定义域为 \(\mathbb R^{2n}\)）。对每个样本，我们为其分配相应时间对 \((\tau_1,\tau_2)\)，表示与该样本关联的时间变量。对前 \(k_0\) 个样本，我们沿概率路径插值 \(\mathbf u_T^{\rm gt}\)：

$$
\mathbf u_\tau=\alpha(\tau_2)\mathbf x_0+\beta(\tau_2)\mathbf u_T^{\rm gt}+\eta(\tau_2)\boldsymbol\epsilon,
$$

其中 \(\tau_2\sim p(\tau)\)、\(\tau_1=1\)，表示 \(\mathbf u_0^{\rm gt}\) 作为干净条件变量。对其余 \(K-k_0\) 个样本，我们采用对称流程学习反向条件分布 \(p(\mathbf u_0^{\rm gt}\mid\mathbf u_T^{\rm gt})\)：沿路径 \(\alpha(\tau_1)\mathbf x_0+\beta(\tau_1)\mathbf u_0^{\rm gt}+\eta(\tau_1)\boldsymbol\epsilon\) 插值，其中 \(\tau_1\sim p(t)\)、\(\tau_2=1\)，表示此时 \(\mathbf u_T\) 作为干净条件变量。

**超参数。** 我们对数据做归一化：减去不同特征的均值并除以标准差。模型架构以多层感知机（MLP）为基础模型，CFM 的时间变量被重复并作为通道与其他输入拼接。MLP 设为 6 层、1024 个节点，激活函数为带自归一化性质的 Scaled Exponential Linear Unit（SELU）[116]。超参数见表 B1。训练中取 \(\eta(t)=10^{-5}\)、批大小 1024、学习率 \(10^{-4}\)、600,000 次更新。先验分布方面，在行星系统上取 6 次步长 0.002 的随机游走与 5 步投影。采样时把采样步数设为 100，并使用 Torchdyn [117] 中的 Dormand–Prince（RKDP）方法 [75]。此外，为使行星系统实验中的优化稳定，我们把优化梯度裁剪到 1；并在采样后对输出做后处理，把其上界裁剪到训练集最大值，从而过滤离群值。

**表 B1（原文 Table B1）：Bi-CFM 与 CBi-CFM 的超参数**

| 阶段 | 超参数 | Lorenz、Circuit、Lorenz96 | 行星系统 |
|---|---|---|---|
| 训练 | \(\eta(t)\) | \(10^{-5}\) | \(10^{-5}\) |
| 训练 | 批大小 | 1024 | 1024 |
| 训练 | 学习率 | \(10^{-4}\) | \(10^{-4}\) |
| 训练 | 更新次数 | 600000 | 600000 |
| 训练 | 梯度裁剪 | – | 1 |
| CBi-CFM 先验分布 | 随机游走次数 | – | 6 |
| CBi-CFM 先验分布 | 步长 \(\Delta r\) | – | 0.002 |
| CBi-CFM 先验分布 | 投影步数 | – | 5 |
| 采样 | 采样步数 | 100 | 100 |
| 采样 | 求解器 | Dormand–Prince | Dormand–Prince |

**基线实现。** **反向积分**：采用与各系统数据生成相同的传统求解器，时间步长设为 \(10^{-5}\)（对应最佳性能）；为加速推理，使用 multiprocessing 软件包充分利用多处理器。**Backbone**：与 Bi-CFM 采用相同的数据归一化与相同的基础模型架构（节点数与层数相同）以公平比较；训练中批大小 2048、学习率 \(10^{-4}\)、更新 10,000 次。**Random**：随机改变不同时间步状态的顺序，从而改变对应关系，而各时间步的分布仍与真值相同。

**图 B4（原文 Fig. B4）：** Lorenz 系统上评价指标随时域长度的变化。

**图 B5（原文 Fig. B5）：** Circuit 系统上评价指标随时域长度的变化。

**图 B6（原文 Fig. B6）：** Lorenz 96 系统上评价指标随时域长度的变化。

## 附录 C 其他可视化

本附录给出于正文因篇幅限制而未展示的补充结果。**（1）三个混沌系统的其余评价指标**：图 B4、B5、B6 分别报告 Lorenz、Circuit 与 Lorenz 96 系统的其他评价指标，包括初态—目标末态对之间的 W-2 距离与轨迹之间的 W-2 距离。如图所示，在不同系统与不同评价指标上，Bi-CFM 始终取得最低误差，且其误差随时间仅缓慢增长，而 Backbone 与反向积分的误差增长明显更快。

**（2）二维边缘分布**：图 B7 与图 B8 分别可视化 Lorenz 系统与 Circuit 系统中推断初态的 \((x,y)\) 值分布；Backbone 的分布出现向低维流形的坍缩（实质上是线段），而 Bi-CFM 的分布与真值形状一致。

**图 B7（原文 Fig. B7）：** Lorenz 系统 \((x,y)\) 值分布的可视化。

**图 B8（原文 Fig. B8）：** Circuit 系统 \((x,y)\) 值分布的可视化。

**（3）Lorenz 96 轨迹**：图 B9 给出 Lorenz 96 系统中 \((u_0,u_1,u_2)\) 值的轨迹，Bi-CFM 的轨迹分布在形态上与真值接近。

**图 B9（原文 Fig. B9）：** Lorenz 96 系统 \((u_0,u_1,u_2)\) 值轨迹。

**（4）三体系统补充结果**：图 B10 给出 Bi-CFM 与 CBi-CFM 推断初始半长轴的分布（按初始 \(a_0\) 分组），CBi-CFM 在各组上都更接近真值分布。图 B11 给出初末态对与轨迹在不同时域下的 W-2 距离。

**图 B10（原文 Fig. B10）：** Bi-CFM 与 CBi-CFM 推断的初始半长轴分布。

**图 B11（原文 Fig. B11）：** 初末态对与轨迹在不同时域下的 W-2 距离。

## 附录 D 命题 1 的证明

下面给出第 4 节方法中命题 1 的证明。

**命题 2（与命题 1 同述）。** 设 \(H:\mathbb R^n\to\mathbb R\) 连续可微，守恒流形 \(\mathcal M=\{\mathbf u\in\mathbb R^n:H(\mathbf u)=H(\mathbf u_T^{\rm gt})\}\) 上 \(\nabla H(\mathbf u)\ne\mathbf 0\)。令 \(\mathbf P(\mathbf u)=\mathbf I-\frac{\nabla H(\mathbf u)\nabla H(\mathbf u)^\top}{\|\nabla H(\mathbf u)\|^2}\)，则对任意 \(\mathbf r\in\mathbb R^n\)，向量 \(\mathbf r\cdot\mathbf P(\mathbf u)\) 位于 \(\mathbf u\) 处流形 \(\mathcal M\) 的切空间 \(T_{\mathbf u}\mathcal M\) 内。

**证明。** 对 \(H\) 定义的流形 \(\mathcal M\)，\(\mathbf u\in\mathcal M\) 处的切空间为

$$
T_{\mathbf u}\mathcal M=\left\{\mathbf v\in\mathbb R^n:\left\langle\nabla H(\mathbf u),\mathbf v\right\rangle=0\right\},
$$

即与守恒量梯度正交的向量全体。令 \(\mathbf v=\mathbf r\mathbf P(\mathbf u)\)（\(\mathbf r\) 任意）。由 \(\mathbf P(\mathbf u)\) 的定义，

$$
\langle\nabla H(\mathbf u),\mathbf v\rangle=\langle\nabla H(\mathbf u),\mathbf r\mathbf P(\mathbf u)\rangle=\left\langle\nabla H(\mathbf u),\mathbf r-\mathbf r\frac{\nabla H(\mathbf u)\nabla H(\mathbf u)^\top}{\|\nabla H(\mathbf u)\|^2}\right\rangle=\langle\nabla H(\mathbf u),\mathbf r\rangle-\langle\nabla H(\mathbf u),\mathbf r\rangle=0.
$$

因此 \(\mathbf v\in T_{\mathbf u}\mathcal M\)，即 \(\mathbf P(\mathbf u)\mathbf r\) 位于守恒流形在 \(\mathbf u\) 处的切平面内。∎

## 附录 E 用 Lyapunov 谱分析混沌性

本附录介绍 Lyapunov 谱分析——一种用于分析混沌性的工具，并借此讨论前向与反向动力学的混沌行为。

### E.1 前向与反向混沌性的不对称

我们用 Lyapunov 谱分析前向与反向动力学的不对称混沌行为。对由方程 \(\dot{\mathbf u}=f(\mathbf u)\) 支配的动力系统，Lyapunov 谱 \(\{\lambda_1,\lambda_2,\ldots,\lambda_n\}\)（\(\lambda_1\ge\lambda_2\ge\cdots\ge\lambda_n\)）通过量化邻近轨迹在切空间不同方向上的指数发散或收敛速率，度量系统的稳定性与混沌程度。下面从理论上讨论前向与反向动力学的 Lyapunov 谱，以说明两种动力学的混沌程度不对称、且反向动力学可能比前向更混沌。

Lyapunov 谱由变分方程的解 \(\Phi(t)\) 定义：

$$
\dot\Phi=J(\mathbf x)\Phi,\qquad \Phi(0)=\mathbf I,
$$

其中 \(J(\mathbf x)=Df(\mathbf x)\) 为系统的 Jacobian 矩阵、\(\mathbf I\) 为单位阵。\(\Phi(t)\) 刻画扰动如何随时间演化，扰动幅度 \(\|\delta\mathbf u(t)\|\) 因而按 \(\exp(\Phi(t))\) 增长。于是 Lyapunov 指数 \(\lambda_i\)（\(i=1,\ldots,n\)）由 \(\Lambda=\lim_{t\to\infty}\frac{1}{2t}\ln\left(\Phi(t)^\top\Phi(t)\right)\) 的特征值给出。最大 Lyapunov 指数 \(\lambda_1\) 量化沿最不稳定方向的指数发散速率，因而刻画对初始条件敏感性的主导模态——这正是混沌的标志。若系统最大 Lyapunov 指数为正，则认为系统混沌：无穷小扰动至少在一个方向上指数增长，使轨迹分离。

现在考虑由时间反演动力学支配的方程（记为式 E3）及其相应 Lyapunov 指数 \(\sigma_1\ge\sigma_2\ge\cdots\ge\sigma_n\)。根据 Dyson 级数可比较 \(\Phi(t)\) 与 \(\Psi(t)\)：两者一般不具有显式解析关系，这说明前向与反向演化的混沌性并不相同、而是内在不平衡的——这正是我们提出双向建模策略的动因。

**例：可交换情形。** 考虑一个特殊情况以说明反向过程最大 Lyapunov 指数与前向过程的关系：当 \(J(t)\) 可交换，即对任意 \(t_1,t_2\) 有 \(J(t_1)J(t_2)=J(t_2)J(t_1)\) 时，\(\Psi(t)=\Phi(t)^{-1}\)。对 \(\Phi(t)\) 作奇异值分解可得如下命题。

**命题 3。** 当 \(J(t)\) 可交换时，\(\Psi(t)=\Phi(t)^{-1}\)；因此 \(\boldsymbol\Sigma=-\boldsymbol\Lambda\)，且 \(\sigma_1=\lambda_n\)。

**证明。** 设 \(\Phi(t)\) 的奇异值分解为 \(\Phi(t)=U(t)\Sigma(t)V(t)^\top\)，其中 \(\Sigma(t)\) 的对角元为奇异值 \(s_i(t)\)。则 \(\Phi(t)^{-1}=V(t)\Sigma(t)^{-1}U(t)^\top\)，其指数增长率为 \(-s_i(t)\) 的对数增长率，于是 \(\boldsymbol\Sigma=-\boldsymbol\Lambda\)，从而 \(\sigma_i=-\lambda_i\)，特别地最大指数满足 \(\sigma_1=-\lambda_n\)。在该情形下，若前向动力学存在至少一个收缩方向（\(\lambda_n<0\)），则相应反向动力学将呈现扩张，导致 \(\sigma_1>0\)。∎

### E.2 Lyapunov 谱的数值算法

基于上述推导，Lyapunov 谱可用离散化方式数值计算。给定任意由 \(\dot{\mathbf u}=f(\mathbf u)\) 描述的动力系统，我们用变分矩阵 \(\Phi(t)\in\mathbb R^{d\times d}\) 扩展原状态，其满足 \(\dot\Phi=J(\mathbf u(t))\Phi(t)\)，其中 \(J(\mathbf u(t))=\partial f/\partial\mathbf u\) 为系统 Jacobian。算法步骤如下：

1. **增广系统构造。** 对给定右端函数 \(f(\mathbf u)\)，把 \(\mathbf u\) 与向量化的 \(\Phi(t)\) 拼接为单个状态向量以构造扩展系统；Jacobian \(J(\mathbf u(t))\) 用有限差分近似。
2. **初始化。** 初始变分矩阵设为 \(\Phi(0)=\mathbf I\)；扩展初始条件 \(X_0=[\mathbf u_0,\Phi(0)]\) 在区间 \([0,t_{\max}]\) 上积分，并采用大小为 \(\Delta t\) 的离散重正交化步长。
3. **分段积分。** 在每个区间 \([t_k,t_{k+1}]\) 内用自适应 Runge–Kutta 方法（RK45）[98] 积分，容差取 `rtol=10^{-6}`、`atol=10^{-9}`；每段结束时对当前 \(\Phi\) 矩阵做处理。
4. **QR 重正交化。** 用 `numpy.linalg` 中的 QR 分解把 \(\Phi\) 分解为 \(\Phi=QR\) [120]，并把 \(R\) 的对角元绝对值的对数累加为局部拉伸率；下一段从重正交化基 \(\Phi\leftarrow Q\) 开始以保持数值稳定性。
5. **指数估计。** 全部时间分段结束后，把累加的拉伸率除以总时间得到 Lyapunov 指数；所得指数按降序排列即得 Lyapunov 谱。

下面给出两个代表性示例，分别对应反向动力学比前向过程更混沌、以及前向与反向动力学混沌程度相当的情形。

**例 1（Lorenz 系统）。** 我们把上述数值流程应用于经典混沌 Lorenz 系统 [37]，计算前向与反向 Lyapunov 谱。结果表明，在 \(\sigma=10\)、\(\rho=28\)、\(\beta=8/3\)、初值 \(\mathbf u(0)=(0,1,0)\) 的 Lorenz 系统中，前向 Lyapunov 谱为 \((\lambda_1,\lambda_2,\lambda_3)=(13.898,0.947,-1.180)\)；反向过程的最大指数比前向更大。我们还发现反向过程的最大 Lyapunov 指数约等于前向过程最小指数的相反数。该发现揭示反向动力学呈现更强的混沌行为，说明前向与反向动力学的混沌程度存在内在不对称。

**例 2（三体问题）。** 接着考虑另一个经典混沌系统——三体问题。记三个相互引力作用天体的位置为 \(\mathbf r_i=(x_i,y_i,z_i)\)，则前向动力学的支配方程为

$$
\ddot{\mathbf r}_i=-G\sum_{j\ne i}m_j\frac{\mathbf r_i-\mathbf r_j}{\|\mathbf r_i-\mathbf r_j\|^3},
$$

其中 \(m_i\) 为质量、\(G\) 为引力常数 [121]。考虑其反向动力学：由于每个 \(\mathbf r_i\) 涉及二阶时间导数，反向动力学满足与前向完全相同的演化方程，因此两者的 Lyapunov 谱相同——即在该保守系统中前向与反向的混沌程度相当，这与 Lorenz 系统形成对照，说明混沌性不对称的程度依赖于系统是否可逆。这一分析从理论上支撑了双向建模的必要性：对前向可逆的系统，仅用反向映射即可；而对混沌性不对称的系统（如 Lorenz），联合学习前向与反向动力学才能有效约束推断结果。

## 参考文献（英文原书目）

[1] Hasler, M.J.: Electrical circuits with chaotic behavior. Proceedings of the IEEE 75(8), 1009–1021 (2005)

[2] Sprott, J.C.: Simple chaotic systems and circuits. American Journal of Physics 68(8), 758–763 (2000)

[3] Tsonis, A., Elsner, J.: Chaos, strange attractors, and weather. Bulletin of the American Meteorological Society 70(1), 14–23 (1989)

[4] Broecker, W.S.: Chaotic climate. Scientific American 273(5), 62–68 (1995)

[5] Laskar, J., Robutel, P.: The chaotic obliquity of the planets. Nature 361(6413), 608–612 (1993)

[6] Contopoulos, G.: Order and Chaos in Dynamical Astronomy, vol. 21. Springer, Heidelberg (2002)

[7] Barrow, J.D.: A chaotic cosmology. Nature 267(5607), 117–120 (1977)

[8] Olsen, L.F., Degn, H.: Chaos in an enzyme reaction. Nature 267(5607), 177–178 (1977)

[9] Chialvo, D.R., Gilmour Jr, R.F., Jalife, J.: Low dimensional chaos in cardiac tissue. Nature 343(6259), 653–657 (1990)

[10] Pecora, L.M., Carroll, T.L.: Synchronization in chaotic systems. Physical Review Letters 64(8), 821–824 (1990)

[11] Kantas, N., Beskos, A., Jasra, A.: Sequential Monte Carlo methods for high-dimensional inverse problems: A case study for the Navier–Stokes equations. SIAM/ASA J. Uncertain. Quantification 2, 464–489 (2013)

[12] Ouannas, A., Azar, A.T., Radwan, A.G.: On inverse problem of generalized synchronization between different dimensional integer-order and fractional-order chaotic systems. 2016 28th International Conference on Microelectronics (ICM), 193–196 (2016)

[13] Bennett, A.F., Chua, B.S., Leslie, L.M.: Generalized inversion of a global numerical weather prediction model. Meteorology and Atmospheric Physics 60, 165–178 (1996)

[14] Gallet, A., Rigby, S., Tallman, T., Kong, X., Hajirasouliha, I., Liew, A., Liu, D., Chen, L., Hauptmann, A., Smyl, D.J.: Structural engineering from an inverse problems perspective. Proceedings of the Royal Society A 478 (2021)

[15] Jung, C., Lipp, C., Seligman, T.: The inverse scattering problem for chaotic Hamiltonian systems. Annals of Physics 275(2), 151–189 (1999)

[16] Kaipio, J.P., Somersalo, E.: Statistical and Computational Inverse Problems. Springer, New York (2005)

[17] Rasio, F.A., Ford, E.B.: Dynamical instabilities and the formation of extrasolar planetary systems. Science 274(5289), 954–956 (1996)

[18] Goldreich, P., Lithwick, Y., Sari, R.: Final stages of planet formation. The Astrophysical Journal 614(1), 497 (2004)

[19] Chatterjee, S., Ford, E.B., Matsumura, S., Rasio, F.A.: Dynamical outcomes of planet-planet scattering. The Astrophysical Journal 686(1), 580–602 (2008)

[20] LeVeque, R.J.: Finite difference methods for differential equations. Draft version for use in AMath 585(6), 112 (1998)

[21] Lu, T., Hernandez, D.M., Rein, H.: TRACE: a code for time-reversible astrophysical close encounters. Monthly Notices of the Royal Astronomical Society 533(3), 3708–3723 (2024)

[22] Binev, P., Dahmen, W., DeVore, R.: Adaptive finite element methods with convergence rates. Numerische Mathematik 97(2), 219–268 (2004)

[23] Du, P., Parikh, M.H., Fan, X., Liu, X.-Y., Wang, J.-X.: Conditional neural field latent diffusion model for generating spatiotemporal turbulence. Nature Communications 15(1), 10416 (2024)

[24] Hu, P., Wang, R., Zheng, X., Zhang, T., Feng, H., Feng, R., Wei, L., Wang, Y., Ma, Z.-M., Wu, T.: Wavelet diffusion neural operator. In: The Thirteenth International Conference on Learning Representations (2024)

[25] Alibert, Y., Davoult, J., Marques, S.: A transformer-based generative model for planetary systems. Astronomy & Astrophysics 701, 149 (2025)

[26] Wang, M., Li, J.: Interpretable predictions of chaotic dynamical systems using dynamical system deep learning. Scientific Reports 14(1), 3143 (2024)

[27] Raissi, M., Perdikaris, P., Karniadakis, G.E.: Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics 378, 686–707 (2019)

[28] Yang, L., Meng, X., Karniadakis, G.E.: B-PINNs: Bayesian physics-informed neural networks for forward and inverse PDE problems with noisy data. Journal of Computational Physics 425, 109913 (2021)

[29] Bastek, J.-H., Kochmann, D.M.: Inverse design of nonlinear mechanical metamaterials via video denoising diffusion models. Nature Machine Intelligence 5(12), 1466–1475 (2023)

[30] Molinaro, R., Yang, Y., Engquist, B., Mishra, S.: Neural inverse operators for solving PDE inverse problems. In: International Conference on Machine Learning, pp. 25105–25139 (2023). PMLR

[31] Huang, J., Yang, G., Wang, Z., Park, J.J.: DiffusionPDE: Generative PDE-solving under partial observation. Advances in Neural Information Processing Systems 37, 130291–130323 (2024)

[32] Lipman, Y., Chen, R.T., Ben-Hamu, H., Nickel, M., Le, M.: Flow matching for generative modeling. In: The Eleventh International Conference on Learning Representations (2023)

[33] Liu, X., Gong, C., et al.: Flow straight and fast: Learning to generate and transfer data with rectified flow. In: The Eleventh International Conference on Learning Representations (2023)

[34] Berliner, L.M.: Statistics, probability and chaos. Statistical Science, 69–90 (1992)

[35] Leith, C.E.: Stochastic models of chaotic systems. Physica D: Nonlinear Phenomena 98(2), 481–491 (1996)

[36] Stone, N.C., Leigh, N.W.: A statistical solution to the chaotic, non-hierarchical three-body problem. Nature 576(7787), 406–410 (2019)

[37] Lorenz, E.N.: Deterministic nonperiodic flow. In: Universality in Chaos, 2nd edn., pp. 367–378. Routledge, Cambridge (2017)

[38] Dadras, S., Momeni, H.R.: A novel three-dimensional autonomous chaotic system generating two, three and four-scroll attractors. Physics Letters A 373(40), 3637–3642 (2009)

[39] Lorenz, E.N.: Predictability: A problem partly solved. In: Proc. Seminar on Predictability, vol. 1, pp. 1–18 (1996). Reading

[40] Maaten, L., Hinton, G.E.: Visualizing data using t-SNE. Journal of Machine Learning Research 9, 2579–2605 (2008)

[41] Karimi, A., Paul, M.R.: Extensive chaos in the Lorenz-96 model. Chaos: An Interdisciplinary Journal of Nonlinear Science 20(4) (2010)

[42] Maaten, L., Hinton, G.: Visualizing data using t-SNE. Journal of Machine Learning Research 9(11) (2008)

[43] Wattenberg, M., Viégas, F., Johnson, I.: How to use t-SNE effectively. Distill (2016)

[44] Kokubo, E., Ida, S.: Formation of protoplanet systems and diversity of planetary systems. The Astrophysical Journal 581(1), 666 (2002)

[45] Ida, S., Lin, D.N.: Toward a deterministic model of planetary formation. I. A desert in the mass and semimajor axis distributions of extrasolar planets. The Astrophysical Journal 604(1), 388 (2004)

[46] Chambers, J.E., Wetherill, G.W., Boss, A.P.: The stability of multi-planet systems. Icarus 119(2), 261–268 (1996)

[47] Lin, D., Ida, S.: On the origin of massive eccentric planets. The Astrophysical Journal 477(2), 781 (1997)

[48] Adams, F.C., Laughlin, G.: Migration and dynamical relaxation in crowded systems of giant planets. Icarus 163(2), 290–306 (2003)

[49] Scharf, C., Menou, K.: Long-period exoplanets from dynamical relaxation. The Astrophysical Journal 693(2), 113 (2009)

[50] Boss, A.P.: On the formation of gas giant planets on wide orbits. The Astrophysical Journal 637(2), 137 (2006)

[51] Mustill, A.J., Davies, M.B., Johansen, A.: The effects of external planets on inner systems: multiplicities, inclinations and pathways to eccentric warm Jupiters. Monthly Notices of the Royal Astronomical Society 468(3), 3000–3023 (2017)

[52] Rein, H., Tamayo, D.: WHFAST: a fast and unbiased implementation of a symplectic Wisdom–Holman integrator for long-term gravitational simulations. Monthly Notices of the Royal Astronomical Society 452(1), 376–388 (2015)

[53] Mikkola, S., Tanikawa, K.: Explicit symplectic algorithms for time-transformed Hamiltonians. Celestial Mechanics and Dynamical Astronomy 74(4), 287–295 (1999)

[54] Harris, W.E.: A catalog of parameters for globular clusters in the Milky Way. The Astronomical Journal 112, 1487 (1996)

[55] Heggie, D.C.: The gravitational million-body problem. In: Makino, J., Hut, P. (eds.) Astrophysical Supercomputing Using Particle Simulations. IAU Symposium, vol. 208, p. 81 (2003)

[56] VandenBerg, D.A., Brogaard, K., Leaman, R., Casagrande, L.: The ages of 55 globular clusters as determined using an improved ΔV<sub>HB</sub><sup>TO</sup> method along with color-magnitude diagram constraints, and their implications for broader issues. The Astrophysical Journal 775(2), 134 (2013)

[57] Massari, D., Koppelman, H.H., Helmi, A.: Origin of the system of globular clusters in the Milky Way. Astronomy & Astrophysics 630, 4 (2019)

[58] Vesperini, E., Heggie, D.C.: On the effects of dynamical evolution on the initial mass function of globular clusters. Monthly Notices of the Royal Astronomical Society 289(4), 898–920 (1997)

[59] Baumgardt, H., Makino, J.: Dynamical evolution of star clusters in tidal fields. Monthly Notices of the Royal Astronomical Society 340(1), 227–246 (2003)

[60] Giersz, M., Heggie, D.C.: Monte Carlo simulations of star clusters – VII. The globular cluster 47 Tuc. Monthly Notices of the Royal Astronomical Society 410(4), 2698–2713 (2011)

[61] Pijloo, J.T., Portegies Zwart, S.F., Alexander, P.E.R., Gieles, M., Larsen, S.S., Groot, P.J., Devecchi, B.: The initial conditions of observed star clusters – I. Method description and validation. Monthly Notices of the Royal Astronomical Society 453(1), 605–637 (2015)

[62] Hénon, M.: Monte Carlo models of star clusters. Astrophysics and Space Science 13(2), 284–299 (1971)

[63] Giersz, M., Heggie, D.C., Hurley, J.R., Hypki, A.: MOCCA code for star cluster simulations – II. Comparison with N-body simulations. Monthly Notices of the Royal Astronomical Society 431(3), 2184–2199 (2013)

[64] Rodriguez, C.L., Morscher, M., Wang, L., Chatterjee, S., Rasio, F.A., Spurzem, R.: Million-body star cluster simulations: comparisons between Monte Carlo and direct N-body. Monthly Notices of the Royal Astronomical Society 463(2), 2109–2118 (2016)

[65] Kremer, K., Ye, C.S., Rui, N.Z., Weatherford, N.C., Chatterjee, S., Fragione, G., Rodriguez, C.L., Spera, M., Rasio, F.A.: Modeling dense star clusters in the Milky Way and beyond with the CMC Cluster Catalog. The Astrophysical Journal Supplement Series 247(2), 48 (2020)

[66] Rui, N.Z., Kremer, K., Weatherford, N.C., Chatterjee, S., Rasio, F.A., Rodriguez, C.L., Ye, C.S.: Matching globular cluster models to observations. The Astrophysical Journal 912(2), 102 (2021)

[67] Heggie, D.C., Giersz, M.: Monte Carlo simulations of star clusters – V. The globular cluster M4. Monthly Notices of the Royal Astronomical Society 389(4), 1858–1870 (2008)

[68] Heggie, D.C., Giersz, M.: MOCCA code for star cluster simulations – III. Stellar-mass black holes in the globular cluster M22. Monthly Notices of the Royal Astronomical Society 439(3), 2459–2467 (2014)

[69] Bellman, R.: Dynamic programming. Science 153(3731), 34–37 (1966)

[70] Frans, K., Hafner, D., Levine, S., Abbeel, P.: One step diffusion via shortcut models. In: The Thirteenth International Conference on Learning Representations (2025)

[71] Zhengyang, G., Mingyang, D., Xingjian, B., J. Zico, K., Kaiming, H.: Mean flows for one-step generative modeling. In: The Thirty-Ninth Annual Conference on Neural Information Processing Systems (2025)

[72] Song, Y., Dhariwal, P., Chen, M., Sutskever, I.: Consistency models. In: International Conference on Machine Learning, pp. 32211–32252 (2023). PMLR

[73] Meng, C., Rombach, R., Gao, R., Kingma, D., Ermon, S., Ho, J., Salimans, T.: On distillation of guided diffusion models. In: Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 14297–14306 (2023)

[74] Rezende, D., Mohamed, S.: Variational inference with normalizing flows. In: International Conference on Machine Learning, pp. 1530–1538 (2015). PMLR

[75] Dormand, J.R., Prince, P.J.: A family of embedded Runge–Kutta formulae. Journal of Computational and Applied Mathematics 6(1), 19–26 (1980)

[76] Noether, E.: Invariante Variationsprobleme. In: Gesammelte Abhandlungen – Collected Papers, pp. 231–239. Springer (1983)

[77] Cuturi, M.: Sinkhorn distances: Lightspeed computation of optimal transport. Advances in Neural Information Processing Systems 26 (2013)

[78] Feydy, J., Séjourné, T., Vialard, F.-X., Amari, S.-i., Trouvé, A., Peyré, G.: Interpolating between optimal transport and MMD using Sinkhorn divergences. In: The 22nd International Conference on Artificial Intelligence and Statistics, pp. 2681–2690 (2019). PMLR

[79] Sinkhorn, R.: A relationship between arbitrary positive matrices and doubly stochastic matrices. The Annals of Mathematical Statistics 35(2), 876–879 (1964)

[80] Wang, Q., Kulkarni, S.R., Verdú, S.: Divergence estimation for multidimensional densities via k-nearest-neighbor distances. IEEE Transactions on Information Theory 55(5), 2392–2405 (2009)

[81] Kremer, K., Ye, C.S., Chatterjee, S., Rodriguez, C.L., Rasio, F.A.: How black holes shape globular clusters: modeling NGC 3201. The Astrophysical Journal Letters 855(2), 15 (2018)

[82] Ye, C.S., Kremer, K., Chatterjee, S., Rodriguez, C.L., Rasio, F.A.: Millisecond pulsars and black holes in globular clusters. The Astrophysical Journal 877(2), 122 (2019)

[83] Trager, S.C., King, I.R., Djorgovski, S.: Catalogue of Galactic globular-cluster surface-brightness profiles. The Astronomical Journal 109, 218 (1995)

[84] Baumgardt, H., Hilker, M.: A catalogue of masses, structural parameters, and velocity dispersion profiles of 112 Milky Way globular clusters. Monthly Notices of the Royal Astronomical Society 478(2), 1520–1557 (2018)

[85] Baumgardt, H., Hilker, M., Sollima, A., Bellini, A.: Mean proper motions, space orbits, and velocity dispersion profiles of Galactic globular clusters derived from Gaia DR2 data. Monthly Notices of the Royal Astronomical Society 482(4), 5138–5155 (2019)

[86] Rein, H., Liu, S.-F.: REBOUND: an open-source multi-purpose N-body code for collisional dynamics. Astronomy & Astrophysics 537, 128 (2012)

[87] Tamayo, D., Rein, H., Shi, P., Hernandez, D.M.: REBOUNDx: a library for adding conservative and dissipative forces to otherwise symplectic N-body integrations. Monthly Notices of the Royal Astronomical Society 491(2), 2885–2901 (2020)

[88] Vasiliev, E., Baumgardt, H.: Gaia EDR3 view on Galactic globular clusters. Monthly Notices of the Royal Astronomical Society 505(4), 5978–6002 (2021)

[89] Faria, D., Feltzing, S.: The age of the metal-rich globular cluster NGC 6352. In: Lejeune, T., Fernandes, J. (eds.) Observed HR Diagrams and Stellar Evolution. Astronomical Society of the Pacific Conference Series, vol. 274, p. 373 (2002)

[90] Correnti, M., Gennaro, M., Kalirai, J.S., Cohen, R.E., Brown, T.M.: The age of the old metal-poor globular cluster NGC 6397 using WFC3/IR photometry. The Astrophysical Journal 864(2), 147 (2018)

[91] Ying, J.M., Chaboyer, B., Du, W.: The absolute age of NGC 3201 derived from detached eclipsing binaries and the Hess diagram. The Astrophysical Journal 970(2), 184 (2024)

[92] Kaluzny, J., Thompson, I.B., Rozyczka, M., Dotter, A., Krzeminski, W., Pych, W., Rucinski, S.M., Burley, G.S., Shectman, S.A.: The Cluster AgeS Experiment (CASE). V. Analysis of three eclipsing binaries in the globular cluster M4. The Astronomical Journal 145(2), 43 (2013)

[93] Campos, F., Kepler, S.O., Bonatto, C., Ducati, J.R.: Multichromatic colour–magnitude diagrams of the globular cluster NGC 6366. Monthly Notices of the Royal Astronomical Society 433(1), 243–250 (2013)

[94] VandenBerg, D.A., Denissenkov, P.A.: Constraints on the distance moduli, helium and metal abundances, and ages of globular clusters from their RR Lyrae and non-variable horizontal-branch stars. III. M55 and NGC 6362. The Astrophysical Journal 862(1), 72 (2018)

[95] Aguado-Agelet, F., Massari, D., Monelli, M., Cassisi, S., Gallart, C., Ceccarelli, E., González Koda, Y.K., Ruiz-Lara, T., Pancino, E., Saracino, S., Salaris, M.: Cluster Ages to Reconstruct the Milky Way Assembly (CARMA): II. The age–metallicity relation of Gaia-Sausage-Enceladus globular clusters. Astronomy and Astrophysics 704, 255 (2025)

[96] Rodriguez, C.L., Weatherford, N.C., Coughlin, S.C., Amaro-Seoane, P., Breivik, K., Chatterjee, S., Fragione, G., Kıroğlu, F., Kremer, K., Rui, N.Z., Ye, C.S., Zevin, M., Rasio, F.A.: Modeling dense star clusters in the Milky Way and beyond with the Cluster Monte Carlo code. The Astrophysical Journal Supplement Series 258(2), 22 (2022)

[97] Hénon, M.H.: The Monte Carlo method. Astrophysics and Space Science 14(1), 151–167 (1971)

[98] Dormand, J.R., Prince, P.J.: A family of embedded Runge–Kutta formulae. Journal of Computational and Applied Mathematics 6(1), 19–26 (1980)

[99] Virtanen, P., Gommers, R., Oliphant, T.E., Haberland, M., Reddy, T., Cournapeau, D., Burovski, E., Peterson, P., Weckesser, W., Bright, J., et al.: SciPy 1.0: fundamental algorithms for scientific computing in Python. Nature Methods 17(3), 261–272 (2020)

[100] Hairer, E., Wanner, G., Nørsett, S.P.: Solving Ordinary Differential Equations I: Nonstiff Problems. Springer, Heidelberg (1993)

[101] Müller, S., Baron, J., Helled, R., Bouchy, F., Parc, L.: The mass–radius relation of exoplanets revisited. Astronomy & Astrophysics 686, 296 (2024)

[102] Hut, P., McMillan, S., Goodman, J., Mateo, M., Phinney, E.S., Pryor, C., Richer, H.B., Verbunt, F., Weinberg, M.: Binaries in globular clusters. Publications of the Astronomical Society of the Pacific 104, 981 (1992)

[103] Bailyn, C.D.: Blue stragglers and other stellar anomalies: implications for the dynamics of globular clusters. Annual Review of Astronomy and Astrophysics 33, 133–162 (1995)

[104] Pooley, D., Lewin, W.H.G., Anderson, S.F., Baumgardt, H., Filippenko, A.V., Gaensler, B.M., Homer, L., Hut, P., Kaspi, V.M., Makino, J., Margon, B., McMillan, S., Portegies Zwart, S., van der Klis, M., Verbunt, F.: Dynamical formation of close binary systems in globular clusters. The Astrophysical Journal Letters 591(2), 131–134 (2003)

[105] Ransom, S.M.: Pulsars in globular clusters. In: Vesperini, E., Giersz, M., Sills, A. (eds.) Dynamical Evolution of Dense Stellar Systems. IAU Symposium, vol. 246, pp. 291–300 (2008)

[106] Miller, M.C., Hamilton, D.P.: Production of intermediate-mass black holes in globular clusters. Monthly Notices of the Royal Astronomical Society 330(1), 232–240 (2002)

[107] Mezcua, M.: Observational evidence for intermediate-mass black holes. International Journal of Modern Physics D 26(11), 1730021 (2017)

[108] Vesperini, E.: Evolution of the mass function of the Galactic globular cluster system. Monthly Notices of the Royal Astronomical Society 299(4), 1019–1039 (1998)

[109] Chatterjee, S., Umbreit, S., Fregeau, J.M., Rasio, F.A.: Understanding the dynamical state of globular clusters: core-collapsed versus non-core-collapsed. Monthly Notices of the Royal Astronomical Society 429(4), 2881–2893 (2013)

[110] Kruijssen, J.M.D.: Globular clusters as the relics of regular star formation in 'normal' high-redshift galaxies. Monthly Notices of the Royal Astronomical Society 454(2), 1658–1686 (2015)

[111] Forbes, D.A., Bastian, N., Gieles, M., Crain, R.A., Kruijssen, J.M.D., Larsen, S.S., Ploeckinger, S., Agertz, O., Trenti, M., Ferguson, A.M.N., Pfeffer, J., Gnedin, O.Y.: Globular cluster formation and evolution in the context of cosmological galaxy assembly: open questions. Proceedings of the Royal Society A 474(2210), 20170616 (2018)

[112] Spitzer, L.: Dynamical Evolution of Globular Clusters (1987)

[113] Makino, J., Hut, P.: Performance analysis of direct N-body calculations. The Astrophysical Journal Supplement Series 68, 833 (1988)

[114] Wang, L., Spurzem, R., Aarseth, S., Giersz, M., Askar, A., Berczik, P., Naab, T., Schadow, R., Kouwenhoven, M.B.N.: The DRAGON simulations: globular cluster evolution with a million stars. Monthly Notices of the Royal Astronomical Society 458(2), 1450–1465 (2016)

[115] González Prieto, E., Weatherford, N.C., Fragione, G., Kremer, K., Rasio, F.A.: Intermediate-mass black hole progenitors from stellar collisions in dense star clusters. The Astrophysical Journal 969(1), 29 (2024)

[116] Klambauer, G., Unterthiner, T., Mayr, A., Hochreiter, S.: Self-normalizing neural networks. Advances in Neural Information Processing Systems 30 (2017)

[117] Poli, M., Massaroli, S., Yamashita, A., Asama, H., Park, J., Ermon, S.: Torchdyn: implicit models and neural numerical methods in PyTorch. In: NeurIPS Workshop on Physical Reasoning and Inductive Biases for the Real World, vol. 2 (2021)

[118] Lyapunov, A.M.: The general problem of motion stability. Annals of Mathematics Studies 17 (1892)

[119] Oseledets, V.I.: A multiplicative ergodic theorem. Characteristic Lyapunov exponents of dynamical systems. Trudy Moskovskogo Matematicheskogo Obshchestva 19, 179–210 (1968)

[120] Harris, C.R., Millman, K.J., Walt, S.J., Gommers, R., Virtanen, P., Cournapeau, D., Wieser, E., Taylor, J., Berg, S., Smith, N.J., Kern, R., Picus, M., Hoyer, S., Kerkwijk, M.H., Brett, M., Haldane, A., Río, J.F., Wiebe, M., Peterson, P., Gérard-Marchant, P., Sheppard, K., Reddy, T., Weckesser, W., Abbasi, H., Gohlke, C., Oliphant, T.E.: Array programming with NumPy. Nature 585(7825), 357–362 (2020)

[121] Marchal, C., Yoshida, J., Yi-Sui, S.: Three-body problem. Celestial Mechanics 34(1–4), 65–93 (1984)

## 图注与表注

**正文图注：** 图 1–6 的图注已随文置于相应位置（图 1 见第 1 节末，图 2–4 见第 2.1 节，图 5 见第 2.2 节，图 6 见第 2.3–2.4 节）。

**附录图注：** 图 A1–A3（Lorenz、Circuit、Lorenz 96 数据集中的单条轨迹可视化）见附录 A；图 B4–B6（三个混沌系统的其余评价指标随时域长度的变化）与图 B7–B11（二维分布、Lorenz 96 轨迹、初始半长轴分布、W-2 距离随时域变化）见附录 B 与附录 C。

**表注：** 原文共 1 张表：表 B1（Bi-CFM 与 CBi-CFM 的超参数），已在附录 B 逐格转写（按 PDF 渲染页 p31 核对）。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 1–5 节全部正文与小节（2.1–2.4、4.1–4.6）、附录 A–E（含附录 E 的命题 3、两个示例与数值算法）、式 (1)–(8) 及附录 A/E 中的系统方程、图 1–6 与图 A1–A3、B4–B11 图注、表 B1（逐格转写）、参考文献 [1]–[121]（英文原条目）。原文无独立结论节（第 3 节为讨论）。**原文说明：** ① 原文用星号脚注解释"行星—行星散射"，本页以脚注形式保留；② 附录 A 中行星半径的三段式断裂幂律质量—半径关系与轨道要素的具体参数取值在原文以公式/表格片段给出，本页按正文描述录入并注明详见原文；③ 附录 D 中原文将命题重述为"命题 2"，本页照录并注明与命题 1 同述。逐句逐式终校未做；供后续 QA 重点核对：式 (1)–(2)、(4)–(8) 的记号，附录 A 的系统方程，表 B1 数值，以及附录 E 的 Lyapunov 谱数值（例 1 中 \((13.898,0.947,-1.180)\)）。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
