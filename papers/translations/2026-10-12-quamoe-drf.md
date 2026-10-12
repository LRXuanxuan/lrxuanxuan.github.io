---
layout: page
title: "QuaMoE-DRF：基于多模态动态无线电地图预测的主动波束与速率自适应（全文中译）"
permalink: /papers/translations/2026-10-12-quamoe-drf/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文条目](/papers/items/0605e8989459d625/) · [原文 arXiv](https://arxiv.org/abs/2607.00974)

> 依据上传的 arXiv:2607.00974v1（14 页，2026-07-01）翻译：摘要、引言、系统模型、框架方法、实验、结论以及附录 A 的推导，保留全部主要公式及编号、消融表与图注。参考文献正式英文著录见原 PDF。本站不存放 PDF 或大尺寸图片。

# QuaMoE-DRF：通过通感一体化网络中的多模态动态无线电地图预测，实现主动波束与速率自适应

*QuaMoE-DRF: Proactive Beam and Rate Adaptation via Multimodal Dynamic Radio Map Forecasting in ISAC Networks*

作者：Zhihan Zeng、Kaihe Wang、Zhongpei Zhang、Chongwen Huang

## 摘要

静态无线电地图提供与位置相关的传播先验，但无法捕获运动物体导致的短时遮挡。直接由感知数据预测波束同样存在局限，因为波束索引丢失了 SINR 裕量、MCS 门限、备选基站以及通信等价的相邻波束等重要信息。

本文提出 QuaMoE-DRF，一种用于通感一体化（ISAC）网络中主动波束和速率自适应的质量感知多模态动态无线电地图预测框架。核心表示是未来波束–SINR 场。我们表明：在有限波束码本和门限速率决策条件下，完整的多基站波束–SINR 场足以决定基站、波束、MCS、有效吞吐量和中断。为降低维度，实际模型学习紧凑的参考基站局部场，并借助基站级监督、联合基站–波束监督及潜在网络上下文；本文也明确指出，紧凑投影本身不足以决定多基站关联。

QuaMoE-DRF 通过质量感知混合专家（MoE）模块，融合静态几何、事件式运动观测、结构化感知状态和无线历史。该机制受异方差模态误差下逆方差融合原理启发。模型联合预测面向通信的地图通道以及主动基站、波束和 MCS 决策。

在动态多基站、多用户城市基准上，QuaMoE-DRF 达到 402.5 Mbps 有效速率、0.0417 中断概率和 0.1836 地图 RMSE。相对于已完成基线中有效速率最高的方法，有效速率提高 5.67%，中断降低 8.35%。目前的验证标签由紧凑遮挡/路径损耗仿真器生成，射线追踪只用于校准和合理性检查。

**关键词：**ISAC、动态无线电地图、信道知识地图、多模态融合、混合专家、动态遮挡、波束预测、速率自适应。

## I. 引言

6G 无线网络正在推动移动系统从以连接为中心的基础设施，转向具备感知能力、能够理解环境的平台。IMT-2030 愿景不仅要求高数据率、低延迟、无处不在的连接和高可靠性，也期望借助通感一体化、原生 AI 及环境感知运行，形成新的网络能力[1]–[3][28]。这种转变在密集城市和车辆高频网络中尤其突出：毫米波传播、大阵列、窄波束和频繁变化的链路状态，使反应式控制成本居高不下；每当传播条件变化，波束训练、导频测量和反馈都要重复[4]–[10][26][27]。核心问题由此转为：在链路质量实际恶化之前，如何从异构环境观测中得出可靠传输决策？

动态遮挡是主要困难。城市道路中，公交车、货车等运动物体可能突然阻断主视距或强反射路径，造成接收功率骤降、波束失准、切换失败和 MCS 失配[11]–[14][25]。导频测量和 CSI 反馈只能在信道已经变化后获取状态；穷举式或顺序式波束扫描则增加时延和资源开销。波束跟踪及机器学习对准可利用时间相关性节省开销，但高速运动和短时遮挡要求预测**未来**波束和链路质量，而不能只跟踪当前状态[9][15][16][24]。因此，主动波束与速率自适应应基于既能预测、又有明确通信含义的中间表示。

无线电地图（RM）与信道知识地图（CKM）提供这样的环境感知表示：它们存储位置相关信道知识，被用于覆盖估计、波束管理、导频减少和环境感知混合波束赋形[3][17]–[20]。近期任务导向的 RM/CKM 方法证明，学习到的传播地图能辅助波束赋形、降低导频开销、重建缺失地图区域，支持空中或三维网络[21]–[23][29][30]；生成模型也被用于改进稀疏或退化观测下的地图精度[31][32]。然而，多数地图是静态或准静态的，只捕获建筑遮挡和长期空间规律，不能预示车辆是否会在未来若干时隙横穿某条 BS–UE 路径。因此，背景传播地图即便准确，仍不足以用于遮挡感知链路自适应。

感知辅助通信通过观测移动物体和预测其运动来处理动态因素。雷达辅助预测波束赋形、LiDAR 辅助波束选择、视觉辅助波束对准、相机波束预测以及语义感知显示，环境观测可降低波束训练开销并改善高移动性场景的鲁棒性[15][33]–[37]。大型多模态感知与通信数据集使无线测量与摄像头、LiDAR、雷达和语义信息的联合利用成为可能，可用于未来波束预测和遮挡感知切换[38]–[44]。

但是，**感知不是通信决策**。物体位置与速度并不直接说明哪个遮挡物对某条 BS–UE 链路最关键、应选择哪个基站、哪个波束更稳健、实际 SINR 可支持何种 MCS。各模态的可靠性还会随交通密度、噪声、可见性、遮挡强度以及最近链路质量而变化。几何信息稳定却无法观察移动物体；事件式观测突出运动却可能稀疏；结构化感知有对象级运动状态却可能不完整；无线历史与通信直接相关，却可能在未来遮挡发生前已经陈旧。因此，实用预测器不仅应学习融合什么，还应学习何时信任各模态。

基于上述问题，本文研究 ISAC 网络中的多模态动态无线电地图预测，以支持主动波束和速率自适应。第一项关键设计是**中间表示**。直接预测波束标签虽然紧凑，却不是完整通信状态：它不告诉系统该波束距离 MCS 门限有多远、另一基站是否拥有更安全的裕量，或者相邻波束是否能取得等价速率。在理论层面，完整多基站波束–SINR 场对有限码本、门限 MCS 决策规则是充分的，因为最优基站、波束、MCS、goodput、中断及并列候选都是该场的确定性函数。实际目标则有意保持紧凑：仅保存参考服务基站在未来局部网格上的波束–SINR 切片，并结合基站级决策、联合 BS–beam 监督和潜在网络上下文。这一区别避免误将紧凑地图称作基站关联的充分统计量，同时在低维表示中保留主动波束和速率决策所需的裕量信息。

第二项设计问题是可靠性：只有融合规则能随失效状态改变，多模态融合才真正有效。事件地图可能缺失，物体级感知可能有噪声或遮挡；若新障碍在最近一次导频测量之后进入链路，无线历史就已经过时。固定拼接无法区分这些状态。QuaMoE-DRF 因而采用质量感知专家路由，以可靠性线索改变专家选择和模态权重。我们证明，在标准异方差误差模型下，最优线性融合权重取决于误差方差的倒数，因而随状态变化。这不仅表明 MoE 是灵活神经模块，还为质量感知路由提供通信理论动机。

贡献如下：（1）把主动波束与速率自适应表述为动态波束–SINR 地图预测，证明完整多基站场对有限码本门限速率决策充分，同时证明紧凑参考基站投影不足以独立决定 BS 关联；（2）推导 SINR 预测误差、模态不确定性、MCS 裕量和预测时长与 goodput、中断之间的可靠性关系，解释为何门限、波束边界和遮挡转变附近的误差最有害；（3）提出融合静态几何、事件式运动、结构化感知状态和无线历史的 QuaMoE-DRF，以异方差逆不确定性融合启发事件–感知校准和稀疏专家路由；（4）在动态多基站多用户城市基准上评估有效速率、中断、波束稳健性、地图精度、遮挡估计和模态退化鲁棒性，并明确说明标签来源及仿真限制。

文章后续结构：II 节系统模型，III 节方法和理论，IV 节实验设置，V 节结果，VI 节总结。

## II. 系统模型与问题表述

### A. 动态城市 ISAC 网络

如图 1，考虑城市道路中的 ISAC 下行网络。水平服务区域 \(\mathcal D\subset\mathbb R^2\)，由栅格场景地图表示。候选基站集合 \(\mathcal B=\{1,\ldots,M\}\)，基站 m 位置 \(\mathbf b_m\in\mathbb R^2\)，每个基站拥有预设波束码本 \(\mathcal F=\{\mathbf f_1,\ldots,\mathbf f_K\}\)。系统在时隙 t 决策未来时隙 \(t+\Delta\) 的传输。为简化记号，推导只描述一个被调度的 UE；基准中的每个 UE 都采用相同过程。UE 在 t 的位置为 \(\mathbf u(t)\in\mathbb R^2\)，场景含车辆等移动遮挡物。遮挡物 i 的可观测状态包括中心位置、速度和几何大小。未来局部地图网格 \(\Omega_{t+\Delta}\) 以根据当前 UE 状态做出的运动学位置预测为中心，而不使用未来通信标签，从而避免将未来 BS、波束、MCS、速率或遮挡真值泄漏到输入。

$$
\mathbf o_i(t)=[x_i(t),y_i(t),v_{x,i}(t),v_{y,i}(t),\ell_i(t),w_i(t)]^{\mathsf T},\tag{1}
$$

$$
\Delta=N_pT_s,\tag{2}
$$

$$
\Omega_{t+\Delta}=\{\mathbf x_{r,c}\}_{r=1,c=1}^{H_l,W_l}.\tag{3}
$$

*图 1：用于遮挡感知主动波束、速率自适应的动态城市 ISAC 场景。*

### B. 遮挡感知的链路与波束模型

对于候选 BS m 和位置 \(\mathbf x\)，距离及方位角决定几何链路。大尺度接收功率由距离路径损耗，以及静态结构、运动遮挡和建筑物内部无效区域的附加衰减构成。这是一种刻意保持紧凑的模型，只保留所研究基准中主导 BS 关联、波束选择和速率自适应的几何路径损耗及静动态衰减。因此应将其视为受控通信基准，而不是三维完整射线追踪的替代。

$$
d_m(\mathbf x)=\|\mathbf x-\mathbf b_m\|_2,\tag{4}
$$

$$
\phi_m(\mathbf x)=\operatorname{atan2}
([\mathbf x-\mathbf b_m]_2,[\mathbf x-\mathbf b_m]_1),\tag{5}
$$

$$
L_m(\mathbf x)=L_0+10\alpha\log_{10}
\left(\frac{\max\{d_m(\mathbf x),d_0\}}{d_0}\right),\tag{6}
$$

$$
P_m^{\rm rx}(\mathbf x,t)=
P^{\rm tx}-L_m(\mathbf x)
-\lambda_{\rm sta}a_m^{\rm sta}(\mathbf x)
-\lambda_{\rm dyn}a_m^{\rm dyn}(\mathbf x,t)
-\lambda_{\rm in}\mathbf1\{\mathbf x\in\mathcal I\}.\tag{7}
$$

其中 \(L_0,d_0,\alpha\) 为参考路径损耗参数；\(a_m^{\rm sta},a_m^{\rm dyn}\) 为静态和动态遮挡分数，\(\lambda_{\rm sta},\lambda_{\rm dyn}\) 为相应衰减系数，\(\mathcal I\) 表示建筑内部区域。

第 k 个波束有中心角 \(\bar\phi_k\) 与波束宽度 \(\Phi_{\rm bw}\)，其 dB 域方向增益为（式 8）：

$$
g_k(\phi)=\operatorname{clip}\left[
-12\left(\frac{\angle(\phi-\bar\phi_k)}{\Phi_{\rm bw}}\right)^2,
-18,0\right].\tag{8}
$$

波束接收功率及 SINR 也以 dB 表示，以匹配链路自适应中的 MCS 门限：

$$
P_{m,k}^{\rm rx}(\mathbf x,t)=P_m^{\rm rx}(\mathbf x,t)
+g_k(\phi_m(\mathbf x)),\tag{9}
$$

$$
\gamma_{m,k}^{\rm dB}(\mathbf x,t)=
P_{m,k}^{\rm rx}(\mathbf x,t)
-10\log_{10}(10^{P_N/10}+10^{P_I/10}).\tag{10}
$$

### C. 带 MCS 约束的通信目标

设 \(\mathcal C=\{0,\ldots,C-1\}\) 为 MCS 集合。MCS c 对应 dB 门限 \(\Gamma_c\) 与频谱效率 \(\eta_c\)；另定义 \(c=-1\) 为中断/不服务，\(\eta_{-1}=0,\ \Gamma_{-1}=-\infty\)。给定 BS、波束和 MCS 时，实际速率遵循门限链路自适应规则。最优决策先最大化 MCS 约束下速率，再用 SINR 解决并列；如果没有可行的正速率 MCS，则链路被判为中断、速率为零。该规则非常重要，因为多个相邻波束可能支持相同 MCS，从而给出通信等价的决策。

$$
c_{m,k}^\star(\mathbf x,t)=
\max\!\left(\{-1\}\cup
\{c\in\mathcal C:\gamma_{m,k}^{\rm dB}(\mathbf x,t)\geq\Gamma_c\}\right),\tag{11}
$$

包含 \(\{-1\}\) 使可行集合为空时最大值依然定义良好。

$$
R_{m,k,c}(\mathbf x,t)=
B_0\eta_c\mathbf1\{c=-1\ \text{或}\ \gamma_{m,k}^{\rm dB}\geq\Gamma_c\},\tag{12}
$$

其中 \(\eta_{-1}=0\)，所以 \(R_{m,k,-1}=0\)。

$$
R_{m,k}^\star(\mathbf x,t)=B_0\eta_{c_{m,k}^\star(\mathbf x,t)},\tag{13}
$$

$$
(m^\star,k^\star)=\arg\max_{m\in\mathcal B,k=1,\ldots,K}
\left(R_{m,k}^\star(\mathbf x,t),\gamma_{m,k}^{\rm dB}(\mathbf x,t)\right).\tag{14}
$$

式 (14) 是字典序最大化：先优化速率，只有相同 MCS 速率时才使用 SINR 破除并列。后续实验因此同时报告严格波束准确率与 Beam@3、并列波束准确率等通信导向指标。对预测决策 \((\widehat m,\widehat k,\widehat c)\)，中断指标为

$$
O(\widehat m,\widehat k,\widehat c)
=\mathbf1\{\widehat c=-1\}
+\mathbf1\{\widehat c\in\mathcal C,\,
\gamma_{\widehat m,\widehat k}^{\rm dB}<\Gamma_{\widehat c}\}.\tag{15}
$$

两事件互斥，因此主动选择不服务与选择不受支持的正速率 MCS 均计入中断概率。

### D. 多模态观测模型

在时刻 t，预测器观测静态几何、事件式运动、结构化感知、无线链路历史和模态质量线索。几何张量包含道路、建筑占用、障碍物及 BS 位置；事件张量表示运动显著性与动态占用变化；感知向量包含观测遮挡物状态、UE 运动状态、相对几何和补零的网络上下文；无线历史存储最近波束和链路质量。所有历史都来自不晚于 t 的时隙，不包含未来 BS、波束、MCS、遮挡或速率标签。质量向量为模态提供软可靠性线索，用于融合，而非硬选择。

$$
\mathcal O_t=
\{\mathbf X^{\rm geo},\mathbf X_t^{\rm evt},
\mathbf x_t^{\rm sen},
\mathbf X^{\rm wir}_{t-T_h+1:t},
\mathbf q_t\},\tag{16}
$$

$$
\mathbf q_t=[q_{\rm geo},q_{\rm evt},q_{\rm sen},q_{\rm wir}]^{\mathsf T}.\tag{17}
$$

### E. 未来动态无线电地图目标

目标是未来局部动态无线电地图，不是普通几何图或视觉重建。仿真器先按照遮挡感知链路模型，在未来网格上为全部候选 BS 与波束计算 SINR 场：

$$
\boldsymbol\Gamma_{t+\Delta}
=\{\gamma_{m,k}^{\rm dB}(\mathbf x_{r,c},t+\Delta)\}_{m,k,r,c},\tag{18}
$$

$$
\boldsymbol\Gamma_{t+\Delta}\in
\mathbb R^{M\times K\times H_l\times W_l}.\tag{19}
$$

第三节和附录 A 证明该完整多基站场对通信决策充分。然而实际模型为了降低维度，并不保存全部 MK 个 SINR 通道；它保存参考基站的紧凑投影，外加一个归一化接收功率通道、K 个波束链路质量通道、一个遮挡可能性通道及一个通信歧义通道。参考 BS 由未来局部决策所用的相同标签生成规则选取；BS 关联则通过独立 BS 与联合 BS–beam 标签学习。

$$
\mathbf Y_{t+\Delta}=\Pi_{\rm ref}
(\boldsymbol\Gamma_{t+\Delta},m^\star),\tag{20}
$$

$$
\mathbf Y_{t+\Delta}=
[\mathbf Y^\beta_{t+\Delta},
\mathbf Y^1_{t+\Delta},\ldots,\mathbf Y^K_{t+\Delta},
\mathbf Y^{\rm blk}_{t+\Delta},\mathbf Y^{\rm unc}_{t+\Delta}],\tag{21}
$$

$$
\mathbf Y_{t+\Delta}\in
\mathbb R^{(K+3)\times H_l\times W_l}.\tag{22}
$$

因此，紧凑地图应理解为完整充分场的低维替代，不能单独充当 BS 关联的充分统计量。BS 级监督与网络上下文补足基站之间的信息，紧凑地图则保留服务链路的波束裕量，以判断波束鲁棒性及可支持的 MCS。

所有地图通道采用下式归一化，\(a<b\)：

$$
\operatorname{norm}_{[a,b]}(z):=
\operatorname{clip}\left(\frac{z-a}{b-a},0,1\right).\tag{23}
$$

给定功率归一化区间 \([P_{\min},P_{\max}]\) 和 SINR 区间 \([\Gamma_{\min},\Gamma_{\max}]\)，前 K+1 个通道为：

$$
Y^\beta_{r,c}=
\operatorname{norm}_{[P_{\min},P_{\max}]}
(P_{m^\star}^{\rm rx}(\mathbf x_{r,c},t+\Delta)),\tag{24}
$$

$$
Y^k_{r,c}=
\operatorname{norm}_{[\Gamma_{\min},\Gamma_{\max}]}
(\gamma_{m^\star,k}^{\rm dB}(\mathbf x_{r,c},t+\Delta)),
\quad k=1,\ldots,K.\tag{25}
$$

实验取 SINR 归一化范围覆盖 MCS 门限，并留出裕量。遮挡通道叫作“遮挡可能性”，因为它由遮挡分数生成，而不是校准过的后验概率。歧义通道也是通信歧义代理量，而不是经过校准的贝叶斯方差。它综合物理遮挡风险与波束歧义，其中波束歧义由参考基站最佳与次佳波束的 SINR 差确定：

$$
Y^{\rm blk}_{r,c}=
\operatorname{clip}\left(
\max\{a_{m^\star}^{\rm sta}(\mathbf x_{r,c}),
a_{m^\star}^{\rm dyn}(\mathbf x_{r,c},t+\Delta)\},0,1\right),\tag{26}
$$

$$
\delta\gamma_{r,c}=
\max_k\gamma_{m^\star,k}^{\rm dB}(\mathbf x_{r,c},t+\Delta)
-\max_{k\ne k_1}\gamma_{m^\star,k}^{\rm dB}(\mathbf x_{r,c},t+\Delta),\tag{27}
$$

$$
k_1=\arg\max_k\gamma_{m^\star,k}^{\rm dB}(\mathbf x_{r,c},t+\Delta),\tag{28}
$$

$$
Y^{\rm unc}_{r,c}=
\operatorname{clip}\left[
\frac12(1-\operatorname{norm}_{[0,12]}(\delta\gamma_{r,c}))
+\frac12Y^{\rm blk}_{r,c},0,1\right].\tag{29}
$$

实验 K=8，所以次大值一定存在。单波束特例中令 \(\delta\gamma_{r,c}=12\,{\rm dB}\)，使波束歧义分量经归一化后为零。

### F. 学习问题

预测器从当前观测预测未来动态通信地图，再输出未来时隙的 BS、波束、联合 BS–beam、MCS 决策。通信目标是在 \(t+\Delta\) 最大化实际平均速率、降低中断概率。由于实际速率包含门限操作与离散决策，训练采用可微的多任务监督替代目标，结合地图预测、遮挡可能性、不确定性回归和通信决策监督。最终评价仍按式 (12) 的实际速率和式 (15) 的中断定义进行，因而训练是可微代理，评价则与通信目标直接相关。

$$
\widehat{\mathbf Y}_{t+\Delta}=f_\theta(\mathcal O_t),\tag{30}
$$

$$
(\widehat m,\widehat k,\widehat j,\widehat c)=
h_\theta(\widehat{\mathbf Y}_{t+\Delta},\mathcal O_t),\tag{31}
$$

$$
\max_\theta\mathbb E[
R_{\widehat m,\widehat k,\widehat c}
(\mathbf u(t+\Delta),t+\Delta)],\tag{32}
$$

$$
\min_\theta\Pr[O(\widehat m,\widehat k,\widehat c)=1].\tag{33}
$$

## III. 所提出的方法

### A. 总览

QuaMoE-DRF 把式 (17) 的观测集合转换为未来局部动态无线电地图，再转换为主动 BS、波束、MCS 决策。图 2 展示：各模态先由专用编码器处理，编码特征经过质量感知 MoE 融合，融合潜变量随后解码成式 (22) 的通信场。模型加入事件–感知校准、网络上下文残差和不会泄漏未来标签的运动学先验，以增强动态表示。未来最优 BS、波束、MCS、遮挡、速率标签均不进入模型输入。

*图 2：QuaMoE-DRF 框架，包括多模态编码、事件–感知校准、质量感知 MoE 融合、动态场预测和通信决策头。*

### B. 通信表示：完整充分性与紧凑近似

地图解码器把融合潜变量映射至第二节所定义的未来动态地图：

$$
\widehat{\mathbf Y}_{t+\Delta}=D_\theta(\mathbf z_c),\tag{34}
$$

$$
\widehat{\mathbf Y}_{t+\Delta}=
[\widehat{\mathbf Y}^\beta,\widehat{\mathbf Y}^{1},\ldots,
\widehat{\mathbf Y}^{K},\widehat{\mathbf Y}^{\rm blk},
\widehat{\mathbf Y}^{\rm unc}]_{t+\Delta},\tag{35}
$$

$$
\widehat{\mathbf Y}_{t+\Delta}
\in\mathbb R^{(K+3)\times H_l\times W_l}.\tag{36}
$$

重点是：式 (36) 不是一般的图像重建目标。式 (19) 的完整多基站波束–SINR 场，在给定有限码本门限速率模型后，可以确定最优 BS、波束、MCS、有效吞吐量与中断。

**定理 1（完整场的决策充分性）。**对固定未来网格点 x、有限基站集合 \(\mathcal B\)、有限波束码本 \(\{1,\ldots,K\}\) 和式 (11)–(14) 的门限 MCS 规则，完整波束–SINR 向量

$$
\boldsymbol\gamma_{\mathbf x}=
\{\gamma_{m,k}^{\rm dB}(\mathbf x,t+\Delta):
m\in\mathcal B,\ k=1,\ldots,K\}\tag{37}
$$

足以决定最优 BS、波束、MCS、实际速率、中断指标和通信等价波束集合；所有这些量都是 \(\boldsymbol\gamma_{\mathbf x}\) 的确定性函数。

**命题 1（紧凑参考投影不充分）。**式 (22) 的紧凑参考基站投影 \(\Pi_{\rm ref}(\boldsymbol\Gamma_{t+\Delta},m^\star)\) 本身不是多基站关联的充分统计量：存在两个完整场，它们的服务链路投影相同，但最优服务基站不同。

因此实际地图是完整充分场的紧凑参考投影，保留预测服务区域附近的波束裕量、遮挡风险与歧义；其他基站的信息则通过 BS logits、联合 BS–beam logits 和潜在网络上下文残差学习。这解释了波束索引标签为何过于贫乏，也解释了为何作者不声称单独的紧凑地图足以恢复 BS 关联。

设最终融合表示为 \(z_c\)，决策头结合该表示、预测地图及当前感知状态，生成 logits：

$$
\{\ell_{\rm BS},\ell_{\rm beam},\ell_{\rm joint},\ell_{\rm MCS}\}
=H_\theta(z_c,\widehat{\mathbf Y}_{t+\Delta},
\mathbf x_t^{\rm sen}).\tag{38}
$$

四类 logits 分别代表 BS、波束、联合 BS–beam 和 MCS。不会泄漏未来信息的运动学先验由当前 UE 状态、速度和 BS 几何构造。未来最优标签只用于监督和最终通信评估，不作为输入。

**定理 2（裕量中断与 goodput 下界）。**预测场选出链路 \(\widehat\ell=(\widehat m,\widehat k)\) 和 MCS \(\widehat c\)。定义所选链路预测误差 \(\delta_{\widehat\ell}=
\widehat\gamma_{\widehat\ell}-\gamma_{\widehat\ell}\)、
预测 MCS 裕量 \(\mu_{\widehat\ell,\widehat c}
=\widehat\gamma_{\widehat\ell}-\Gamma_{\widehat c}\)。若误差是零均值、方差代理为 \(\sigma^2_{f,\widehat\ell}\) 的次高斯随机变量，则

$$
\Pr\{\gamma_{\widehat\ell}<\Gamma_{\widehat c}\}
\leq\exp\left(-\frac{[\mu_{\widehat\ell,\widehat c}]_+^2}
{2\sigma^2_{f,\widehat\ell}}\right),\tag{39}
$$

$$
\mathbb E[R_{\widehat\ell,\widehat c}]
\geq B_0\eta_{\widehat c}
\left[1-\exp\left(-\frac{[\mu_{\widehat\ell,\widehat c}]_+^2}
{2\sigma^2_{f,\widehat\ell}}\right)\right].\tag{40}
$$

若只假设有限二阶矩，可使用 Cantelli 不等式得到相同结构的界，详见附录 A。定理 2 将地图误差直接联系通信损失。低地图 RMSE 在接近 MCS 门限、遮挡边界的链路上最有价值；反过来，平均误差虽小，如果集中出现在小裕量链路，仍可能造成中断。

**定理 3（异方差逆不确定性融合）。**假设各模态局部 SINR 估计为 \(\widehat\gamma_\ell^{(i)}
=\gamma_\ell+\varepsilon_{i,\ell}\)，条件均值零、方差 \(\sigma^2_{i,\ell}\)，不同模态条件协方差为零。在满足 \(\sum_i\rho_i=1\) 的无偏线性估计 \(\widehat\gamma_\ell=\sum_i\rho_i\widehat\gamma_\ell^{(i)}\) 中，最小方差权重和融合误差方差为：

$$
\rho_i^\star=
\frac{\sigma_{i,\ell}^{-2}}{\sum_j\sigma_{j,\ell}^{-2}},
\qquad
\sigma_{f,\ell}^{2,\star}=
\left(\sum_j\sigma_{j,\ell}^{-2}\right)^{-1}.\tag{41}
$$

由于各模态方差随质量分数、遮挡状态、感知几何和预测时长变化，固定融合通常次优。因此，质量感知 MoE 不只是通用神经模块，而是由定理 3 激发的一种状态依赖估计器。

### C. 质量感知多模态编码

QuaMoE-DRF 有四个输入模态。静态几何与事件运动地图使用 CNN 编码器；结构化感知向量使用 MLP；无线历史使用 GRU。融合前对所有编码特征进行层归一化：

$$
\mathbf z_g={\rm LN}(e_g(\mathbf X^{\rm geo})),\tag{42}
$$

$$
\mathbf z_e={\rm LN}(e_e(\mathbf X_t^{\rm evt})),\tag{43}
$$

$$
\mathbf z_s={\rm LN}(e_s(\mathbf x_t^{\rm sen})),\tag{44}
$$

$$
\mathbf z_w={\rm LN}(e_w(\mathbf X^{\rm wir}_{t-T_h+1:t})).\tag{45}
$$

静态几何表示道路、建筑占用、BS 位置和长期空间先验；事件表示运动显著性与动态占用变化；感知表示物体状态、UE 运动、相对几何和补齐的场景上下文；无线历史概括近期链路测量。由于失效机制不同，模型没有以固定权重简单拼接，而是使用质量感知路由与模态加权。

### D. 事件–感知动态校准

事件地图与结构化感知向量从互补角度描述运动物体。前者提供空间运动证据，后者提供对象级运动学状态。QuaMoE-DRF 使用事件–感知动态校准模块，更新事件与感知潜表示并产生动态残差特征：

$$
(\overline{\mathbf z}_e,\overline{\mathbf z}_s,\mathbf d_{\rm es})
=C_\theta(\mathbf z_e,\mathbf z_s).\tag{46}
$$

其中 \(\overline z_e,\overline z_s\) 为校准后特征，\(d_{\rm es}\) 为动态残差。该过程有助于使运动显著性与遮挡物运动学对齐，从而更好地预测受动态遮挡影响的无线电地图。

### E. 质量感知混合专家融合

对每个模态，专家路由器同时接收模态特征和可靠性分数，产生稀疏 top-k 专家权重，由选中的专家对该模态特征执行变换：

$$
\boldsymbol\alpha_i=
{\rm TopK}\left({\rm softmax}
\left(r_i([\mathbf z_i,q_i])/\tau\right),k\right),\tag{47}
$$

$$
\widetilde{\mathbf z}_i=
\sum_{j=1}^{N_{\rm exp}}\alpha_{ij}E_j(\mathbf z_i),
\quad i\in\{g,e,s,w\}.\tag{48}
$$

其中 \(r_i\) 是模态路由器，\(E_j\) 是第 j 个专家，\(\tau\) 是路由温度，\(N_{\rm exp}\) 是专家数量。TopK 将除前 k 个最大权重外的值置零，再归一化，使和为 1。

经过专家路由后，另计算模态级权重，实现 MoE 融合：

$$
\mathbf a_\rho=[
a_g(\widetilde z_g,q_g),
a_e(\widetilde z_e,q_e),
a_s(\widetilde z_s,q_s),
a_w(\widetilde z_w,q_w)]^{\mathsf T},\tag{49}
$$

$$
\boldsymbol\rho={\rm softmax}(\mathbf a_\rho),\tag{50}
$$

$$
\mathbf z_f=P_f\left(\sum_{i\in\{g,e,s,w\}}
\rho_i\widetilde{\mathbf z}_i\right).\tag{51}
$$

最终潜变量通过加入事件–感知动态残差和网络上下文残差获得：

$$
\mathbf z_c={\rm LN}
\left(\mathbf z_f+\lambda_dP_d(\mathbf d_{\rm es})
+\lambda_nP_n(\mathbf c_{\rm net})\right).\tag{52}
$$

其中 \(c_{\rm net}\) 是网络上下文，\(P_d,P_n\) 是投影层。注意实现中网络上下文是在 MoE 之后以残差形式加入，而不是直接放到专家路由中。

质量感知路由重点处理三种失效状态：（1）事件地图缺失或稀疏时，降低对运动显著性的依赖，改用几何、感知和历史；（2）结构化感知噪声过大时，校准事件分支和近期无线观测可能更可靠；（3）无线历史残缺或陈旧时，由于未来遮挡尚未出现在过去导频中，模型应更多信任当前几何与感知。因此，质量向量不是单纯增加一组特征，而是改变融合块所实现的有效估计器。

### F. 面向通信的决策学习

QuaMoE-DRF 采用联合目标，包含地图级监督和通信决策监督。地图损失监督归一化的波束无关接收功率、K 个波束归一化 SINR 链路质量通道、遮挡可能性和歧义。决策损失监督 BS、beam、联合 BS–beam 和 MCS。启用事件–感知融合时，还可以加入辅助遮挡物状态预测损失，以正则化动态特征。

地图损失为（式 53）：

$$
L_{\rm map}=\|\widehat Y^\beta-Y^\beta\|_1+
\frac1K\sum_{k=1}^{K}\|\widehat Y^k-Y^k\|_1.\tag{53}
$$

遮挡与歧义损失分别为（式 54、55）：

$$
L_{\rm blk}={\rm BCE}(\widehat Y^{\rm blk},Y^{\rm blk}),\tag{54}
$$

$$
L_{\rm unc}=\|\widehat Y^{\rm unc}-Y^{\rm unc}\|_2^2.\tag{55}
$$

通信决策损失为交叉熵之和（式 56）：

$$
L_{\rm dec}=
{\rm CE}(\ell_{\rm BS},m^\star)+
{\rm CE}(\ell_{\rm beam},k^\star)+
{\rm CE}(\ell_{\rm joint},j^\star)+
{\rm CE}(\ell_{\rm MCS},c^\star),\tag{56}
$$

其中 \(j^\star\) 是最优 BS–beam 对的索引。默认总损失为

$$
L_{\rm def}=\sum_{q\in\mathcal D_{\rm loss}}\lambda_q L_q,
\quad\mathcal D_{\rm loss}=\{{\rm map,blk,unc,dec,aux}\}.\tag{57}
$$

当动态校准分支预测遮挡物状态时，激活辅助损失 \(L_{\rm aux}\)。实现还支持 SINR 导出的软波束目标和波束 logit 裕量正则化：

$$
L=L_{\rm def}+
\lambda_{\rm soft}L_{\rm softbeam}
+\lambda_{\rm mar}L_{\rm margin}.\tag{58}
$$

但主结果设置 \(\lambda_{\rm soft}=\lambda_{\rm mar}=0\)，不启用这两项，除非在专门调优的变体中明确打开。耦合目标阻止模型只优化地图像素误差，并要求动态地图携带主动通信控制真正需要的信息。

## IV. 实验设置

### A. 数据集与仿真配置

在多 BS、多 UE 的动态城市 ISAC 基准上评估：包含静态道路几何、运动遮挡物、事件式运动观测、结构化感知状态和无线历史。每个样本包括当前多模态观测与未来局部动态地图真值，目标定义遵循第二节。

基准包含 13,200 个带标签样本，固定训练/验证/测试划分 9,240/1,320/2,640。场景比例为 33.3% 道路峡谷，以及各占 16.7% 的十字路口、丁字路口、错位十字路口和复杂道路。因此，测试集中道路峡谷有 880 个样本，其余四类各 440 个。严重遮挡子集是按条件选出的，与道路布局子集有重叠，并非额外独立划分。

数据划分使用随机种子 2025；神经网络实验用训练种子 {2023,2024,2025} 重复三次，表格报告平均值，三个随机种子下排序相同。全部对比方法共用数据划分；模型选择和超参数调整仅用验证集，测试集只用于最终报告。

主要标签来自第二节介绍的紧凑遮挡/路径损耗仿真器。Sionna RT 仅在 600 条链路的小型子集上用于校准和合理性检查，**不用于生成本文报告的训练、验证或测试标签**。因此，目前数值说明受控动态遮挡设置下的性能，不应被理解为完成了大规模射线追踪验证。作者计划发表后发布基准生成器、配置、划分索引及评估脚本。

额外做了场景不重叠诊断：在四种非复杂道路布局上训练、仅在未见过的复杂道路上测试，QuaMoE-DRF 有效速率为 386.9 Mbps，中断为 0.0647。这意味着新布局会导致性能下降，但相对优势的定性趋势仍存在。

**表 I：主要仿真参数。**

| 项目 | 数值 | 项目 | 数值 |
|---|---|---|---|
| 场景类型 | 道路峡谷、十字路口、T 路口、错位十字路口、复杂道路 | 场景范围 | 96×96 m² |
| 全局几何网格 |64×64|局部预测网格|32×32|
| 局部预测范围 |36×36 m²|历史长度|6 时隙|
| 预测跨度 |2 时隙|时隙持续时间|1 s|
| 候选 BS 数 |2–4|每场景用户数|3–8|
| 遮挡物数 |3–7|最多编码遮挡物数|3|
| 候选波束数 |8|波束宽度|42°|
| 发射功率 |28 dBm|1 m 参考路径损耗|34 dB|
| 路径损耗指数 |2.45|动态遮挡损失|18 dB|
| 静态遮挡损失 |12 dB|噪声功率|-94 dBm|
| 干扰功率 |-103 dBm|MCS 门限|[-5,-1,3,7,11,15] dB|
| MCS 频谱效率 |[0.50,1.00,1.60,2.40,3.20,4.20]|速率归一化|每 1 bit/s/Hz 对应 100 Mbps|

### B. 对比方法

QuaMoE-DRF 与三个已完成的代表性基线比较，使用同一测试划分与评价协议。

**CKM-UNet。**受到 RadioUNet[18] 启发的 CKM 风格 U-Net 基线，输入静态环境语义和稀疏当前无线观测，无线观测率为 0.10。

**Radar-EKF BF。**根据雷达辅助预测波束赋形思想[15]设计的感知状态基线：从当前感知向量外推 UE 和遮挡物状态，利用预测几何选择 BS、波束、MCS。

**RM+RP。**受利用少量导频的无线电地图辅助波束赋形[22]启发的静态地图与减量探测基线。主比较采用探测 N=2 个波束，因为计入探测开销后，这是所测试预算中有效速率最高的设置。RM+RP 的有效速率包含在线探测开销：K=8 候选波束，完整扫描开销为 0.10，故 N=2 时开销比例 \(0.10\times2/8=0.025\)。另外三种方法的报告设置没有显式在线波束探测。

### C. 评价指标

主要指标是有效实际速率：

$$
R_{\rm eff}=(1-\rho_{\rm oh})R_{\rm raw},\tag{59}
$$

其中 \(R_{\rm raw}\) 是扣除探测开销前的速率，\(\rho_{\rm oh}\) 是在线探测开销率。实际速率按第二节 MCS 门限规则计算，中断由式 (15) 定义。

通信性能包括有效速率、原始速率、频谱效率、中断概率、速率比值、BS 准确率、波束准确率、联合 BS–beam 准确率、Beam@3、通信等价并列波束准确率及 MCS 准确率。Beam@3 指最优波束位于预测 BS 的三个最高波束 logits 中；并列波束准确率指 BS 预测正确，且所选波束属于达到最优等价 MCS 速率的波束集合。由于码本只有八个波束、相邻波束可能通信等价，Beam@3 可能天然较高，所以论文同时报告 Beam@1、并列波束、中断和有效速率。

地图与遮挡预测指标为 RMSE、NMSE、MAE、遮挡准确率、遮挡 F1 和遮挡转变准确率；复杂度通过单样本推理时延和可训练参数量衡量。保存的评价文件包含上述通信、地图、遮挡、开销、时延及模型规模指标，以支持复现。

### D. 硬件与软件

全部实验在 Intel Core i9-12900KF CPU、NVIDIA RTX 5060 Ti 16 GB GPU 和 64 GB RAM 的工作站运行。数据生成用 Python 3.11；主要数据生成路径采用第二节紧凑遮挡/路径损耗仿真器，Sionna RT/TensorFlow 只作为抽样合理性检查的可选校准后端。预测模型、基线、训练和评价代码采用 PyTorch 2.x、CUDA 11.8、cuDNN。推理时延在 CUDA 同步下测量，并对测试集求单样本平均运行时间。

## V. 结果与分析

### A. 动态无线电地图可视化

图 3 展示道路峡谷、十字路口、丁字路口、错位十字路口和复杂道路的代表性场景，具有不同 BS 布局、运动遮挡物及未来 UE 位置。未来 β 图显示：开阔道路上面向通信的无线电地图变化较平滑，但在遮挡物和路口附近变化剧烈。遮挡可能性地图进一步显示主要性能退化集中在运动障碍物及 UE 未来可能轨迹周围。动态残差图显示最大的地图变化位于障碍物引发的阴影区域，远处变化较小。

可视化明确体现动态地图的作用。静态 CKM 无法直接描述移动遮挡物的未来遮挡状态；本文预测器则结合多模态感知与无线历史，推断未来动态地图、遮挡模式和动态残差变化，更适合作为主动 BS 关联、波束选择和速率自适应的依据。

*图 3：道路峡谷、十字路口、丁字路口、错位十字路口和复杂道路的代表性动态地图场景。每组展示静态场景及物体、未来 β 地图、遮挡可能性和动态残差。*

### B. 整体通信性能

表 II 给出 QuaMoE-DRF 与三种已完成基线在固定测试集上的通信性能；RM+RP 采用计入开销后最好的 N=2 配置。QuaMoE-DRF 在有效速率、中断概率、Beam@3 和并列波束准确率上均为最佳。相比有效速率最强的基线 Radar-EKF BF，有效速率改善 5.67%，中断降低 8.35%。绝对提升是中等幅度，而非压倒性优势，因此应结合裕量理论分析、地图重建、消融和压力测试理解。相比 RM+RP N=2，改善更大，因为 QuaMoE-DRF 能利用多模态预测，免去显式在线波束探测。其设计思想是用未来波束–SINR 场预测替代部分在线搜索。

**表 II：核心方法最终测试通信性能。**

| 方法 | 有效速率 Mbps | 频谱效率 | 中断概率 | 速率比值 | Beam@1 | Beam@3 | 并列波束准确率 |
|---|---:|---:|---:|---:|---:|---:|---:|
| QuaMoE-DRF |402.5|4.025|.0417|.9583|.8836|1.0000|.9773|
| CKM-UNet |305.5|3.055|.2727|.7273|.7235|.8173|.7691|
| Radar-EKF BF |380.9|3.809|.0455|.9069|.8439|.9561|.8897|
| RM+RP，N=2 |370.7|3.707|.0827|.8826|.8182|.9014|.8467|

Beam@3=1.0000 并不表示任务无难度。码本只有八个波束，门限速率规则下邻近波束可能支持同一 MCS；因此严格 Beam@1 为 0.8836，而并列波束准确率为 0.9773。有效速率和中断仍是主要通信指标。

### C. 地图预测和遮挡估计

表 III 给出地图和遮挡指标。QuaMoE-DRF 均为最优，说明通信增益不仅来自下游决策头的调整，还得到更准确的未来动态地图重建支持。Radar-EKF BF 在表 II 的通信指标上具有竞争力，但地图指标较差，表明纯跟踪预测缺乏显式通信导向地图。总体结果说明，改善未来地图预测也能提升下游传输决策的可靠性。

**表 III：核心方法最终测试地图与遮挡指标。**

| 方法 | RMSE | NMSE | MAE | 遮挡准确率 | 遮挡 F1 |
|---|---:|---:|---:|---:|---:|
| QuaMoE-DRF |.1836|.0620|.1356|.9645|.9280|
| CKM-UNet |.2215|.0855|.1685|.9255|.8885|
| Radar-EKF BF |.3124|.1012|.2037|.9115|.8716|
| RM+RP N=2 |.2174|.0821|.1670|.9262|.8878|

### D. 鲁棒性与敏感性分析

图 4 在四类压力因素下检验各方法。**事件地图丢失**：丢失概率增加到 1.0 时，QuaMoE-DRF 的有效速率只从约 402 Mbps 降至 392 Mbps；RM+RP 从约 370 降至 331 Mbps，Radar-EKF BF 从约 381 降至 354 Mbps；CKM-UNet 始终最弱。说明本方法不依赖单一事件地图，因为无线历史和感知特征仍能支持未来动态地图推断。

**感知向量高斯噪声**：当噪声标准差升至 1.0，本文方法仍保持约 388 Mbps，而 Radar-EKF BF、RM+RP 和 CKM-UNet 分别降至约 364、352、297 Mbps。这说明质量感知融合能减轻噪声感知特征的影响，保持稳定通信决策。

**无线历史丢失**：当丢失概率从 0 增加到 1.0，QuaMoE-DRF 从约 403 降至约 384 Mbps，下降幅度小于 RM+RP（最终约 323 Mbps）和 Radar-EKF BF。这是多模态鲁棒性的直接证据：历史观测不完整时，模型可退回利用互补感知和事件信息。

**减量探测预算**：在测试范围内，QuaMoE-DRF 保持约 400 Mbps，而 RM+RP 随可用探测资源减少而下降。由于 RM+RP 需要在线探测补偿地图缺失，它对探测预算更敏感；本方法直接由多模态信息预测未来决策地图，避免显式探测开销。

因此，图 4 证明本方法不仅在标准条件下性能较高，也对缺失事件、感知噪声、无线历史丢失及探测资源受限较为稳健。压力测试还说明质量感知路由在何时必要：不同失效模式分别影响不同模态，而模型通过调整对剩余可靠信息的信任，将有效速率损失控制在适中范围。这符合异方差模态不确定性下固定融合次优的理论观点。

*图 4：事件地图丢失、感知向量高斯噪声、无线历史丢失和减量探测预算四种压力下的有效速率敏感性。*

### E. 子集与通信等价波束分析

表 IV 给出 QuaMoE-DRF 在不同子集的表现。道路峡谷直接对应 canyon 场景；路口子集合并十字路口、丁字路口、错位十字路口和复杂道路；严重遮挡按条件筛选，与道路布局子集重叠，因此各行样本数不要求加起来等于测试总数。

总体有效速率 402.5 Mbps、中断 .0417。严重遮挡时速率降至 394.3 Mbps，中断升至 .0611，说明深度遮挡仍是最困难的状态；但并列波束准确率仍为 .9667，说明大多数样本所选波束接近通信意义的最优解。

道路峡谷表现最好：415.2 Mbps、.0114 中断，这与峡谷布局更规则的传播结构一致；路口为 396.1 Mbps、.0568 中断，反映交叉遮挡和更频繁链路状态转变导致的不确定性。

严格 Beam@1 与并列波束准确率的差距也重要：总体分别为 .8836、.9773。许多波束索引虽不严格匹配，但在通信效果上仍等价。实际码本中，相邻波束可以产生类似 SINR、支持同一个 MCS，因此有效速率、中断、Beam@3 和并列波束准确率比单独 Beam@1 更有解释力。

**表 IV：QuaMoE-DRF 的子集和并列波束分析。**

| 子集 | 样本数 | 有效速率 Mbps | 中断 | Beam@1 | 并列波束 |
|---|---:|---:|---:|---:|---:|
| 整体 |2640|402.5|.0417|.8836|.9773|
| 严重遮挡 |1800|394.3|.0611|.8000|.9667|
| 道路峡谷 |880|415.2|.0114|.9886|.9886|
| 路口 |1760|396.1|.0568|.8011|.9716|

### F. 消融研究

表 V 验证各主要模块贡献。完整模型在通信与地图预测方面整体最佳。用直接拼接替代 MoE，会使速率从 402.5 降至 390.8 Mbps、中断从 .0417 升至 .0568；移除质量向量后，速率为 393.6 Mbps、中断为 .0530。这两项消融对于方法的新颖性尤其重要：增益并不只是堆叠若干模块，而是允许估计器随每个样本的模态可靠性变化。相对而言，去除质量向量使中断增加约 27%，与定理 3 的异方差融合分析一致。

单模态消融显示全部模态均有贡献。移除静态几何会损害空间传播先验；去掉事件或结构化感知会削弱捕捉动态遮挡演化的能力；无线历史的缺失也导致明显下降，说明近期链路观测提供了与环境感知互补的通信证据。

仅地图训练的变体可以获得有竞争力的地图重建精度，但通信决策较差；仅决策训练的变体通信表现尚可，却显著损害地图精度。这证实联合地图与决策训练对于把动态地图预测和主动 BS、波束、MCS 自适应对齐是必要的。

**表 V：QuaMoE-DRF 消融。**

| 变体 | 有效速率 Mbps | 中断 | Beam@3 | 并列波束 | 地图 RMSE | 遮挡 F1 |
|---|---:|---:|---:|---:|---:|---:|
| 完整 QuaMoE-DRF |402.5|.0417|1.0000|.9773|.1836|.9280|
| 不使用 MoE 融合 |390.8|.0568|.9826|.9424|.1947|.9145|
| 不使用质量向量 |393.6|.0530|.9879|.9515|.1912|.9184|
| 不使用静态几何 |385.4|.0682|.9659|.9258|.2079|.9021|
| 不使用事件运动 |392.2|.0576|.9818|.9477|.1964|.9106|
| 不使用感知状态 |386.7|.0648|.9735|.9330|.2038|.9047|
| 不使用无线历史 |388.1|.0621|.9773|.9364|.2005|.9089|
| 仅地图训练 |371.3|.0909|.9205|.8614|.1868|.9241|
| 仅决策训练 |382.4|.0723|.9545|.9121|.2458|.8720|

## VI. 结论

本文提出 QuaMoE-DRF，一种用于 ISAC 网络主动波束和速率自适应的通信导向动态无线电地图预测框架。核心表示是未来波束–SINR 场：完整多基站场对于有限码本门限速率决策充分，而实现中使用的紧凑参考基站投影本身不足以完成 BS 关联。因此，QuaMoE-DRF 将紧凑局部场与基站级监督、联合 BS–beam 监督和潜在网络上下文结合。

框架还通过质量感知 MoE 路由，融合静态几何、事件式运动、结构化感知状态与无线历史，使预测器能够适应不同模态可靠性的变化；联合地图–决策目标将动态场预测与 BS 关联、波束选择和 MCS 自适应对齐。

动态城市基准上的仿真表明，相比典型基线，本文在有效速率、中断、波束鲁棒性、遮挡估计和地图精度方面改善。未来工作将利用规模更大的射线追踪或真实世界多模态数据集，以及更广泛的直接波束预测基线，加强外部验证。

## 附录 A. 证明及面向通信的误差界

附录将 QuaMoE-DRF 的表示和融合设计与通信可靠性联系起来，按如下顺序推导：波束–SINR 场的决策充分性、紧凑投影的不充分性、由 CRLB 决定的 SINR 地图误差、逆不确定性融合、基于裕量的中断与 MCS 回退，以及减量探测的有效速率损失。CRLB 型感知指标在 ISAC 性能分析中十分常见[45]–[47]。未来链路预测思想遵循感知辅助预测波束赋形[15]，减量探测的解释与 RM 辅助少导频波束赋形[22]一致。

### A. 定理 1 的证明

取未来网格点 \(\mathbf x\in\Omega_{t+\Delta}\)。定义候选链路集合、链路 SINR 和完整波束–SINR 场（式 60）：

$$
\begin{aligned}
\mathcal L&:=\mathcal B\times\{1,\ldots,K\},\tag{60a}\\
\ell&:=(m,k)\in\mathcal L,\tag{60b}\\
\gamma_\ell&:=\gamma_{m,k}^{\rm dB}(\mathbf x,t+\Delta),\tag{60c}\\
\boldsymbol\gamma_{\mathbf x}&:=\{\gamma_\ell:\ell\in\mathcal L\}.\tag{60d}
\end{aligned}
$$

根据式 (11)–(14) 的门限 MCS 规则，MCS、原始速率和最优 BS–beam 链路均是该场的确定性函数：

$$
\begin{aligned}
c_\ell^\star&=\max(\{-1\}\cup\{c\in\mathcal C:\gamma_\ell\geq\Gamma_c\}),\tag{61a}\\
R_\ell^\star&=B_0\eta_{c_\ell^\star},\tag{61b}\\
\ell^\star&=\arg\max_{\ell\in\mathcal L}(R_\ell^\star,\gamma_\ell),\tag{61c}\\
(m^\star,k^\star)&=\ell^\star.\tag{61d}
\end{aligned}
$$

所选 MCS 为 \(c_{\ell^\star}^\star\)，最优实际速率为 \(R_{\ell^\star}^\star\)，中断指标由式 (15) 直接决定。选定 BS 下通信等价的并列波束集合为：

$$
\mathcal T_{m^\star}=
\{k:B_0\eta_{c_{m^\star,k}^\star}=R_{\ell^\star}^\star\}.\tag{62}
$$

它也是完整场的确定性函数。因此，在有限码本门限速率模型中，完整多 BS 波束–SINR 场对决策充分，证毕。

### B. 命题 1 的证明

给出反例即可：两个 BS，每个只有一个波束，未来只有一个网格点。考虑两个完整场（式 63）：

$$
\boldsymbol\gamma^{(A)}=(10,9),\qquad
\boldsymbol\gamma^{(B)}=(9,10).\tag{63}
$$

两个分量分别对应 BS 1、BS 2。不论按 SINR 还是门限速率、再以严格递增准则破除并列，场 A 的最优基站为 BS 1，而场 B 为 BS 2。若紧凑投影只保存参考服务 SINR 切片、不保存 BS 身份，则两者投影都为数值 10。也就是说，同一个紧凑投影对应两种不同最优 BS，故投影本身对多 BS 关联不充分。QuaMoE-DRF 使用 BS logits、联合 BS–beam logits 和潜在网络上下文填补缺失信息，而不是错误声称紧凑地图独自充分，证毕。

### C. 由 CRLB 限制的 SINR 预测误差

令 \(\boldsymbol\xi_{t+\Delta}\) 表示影响未来链路的动态状态，包括 UE 位置及相关遮挡物状态。局部链路模型与模态观测模型为（式 64）：

$$
\begin{aligned}
\gamma_\ell&=G_\ell(\boldsymbol\xi_{t+\Delta}),\tag{64a}\\
\mathcal M_{\rm mod}&=\{g,e,s,w\},\tag{64b}\\
\mathbf s_i&=\nabla_{\boldsymbol\xi_t}\log p_i(\mathbf y_i\mid\boldsymbol\xi_t,q_i),\tag{64c}\\
\mathbf J_i(q_i)&=\mathbb E[\mathbf s_i\mathbf s_i^{\mathsf T}],
\quad i\in\mathcal M_{\rm mod}.\tag{64d}
\end{aligned}
$$

未来状态预测及传播后的 CRLB 为（式 65）：

$$
\begin{aligned}
\boldsymbol\xi_{t+\Delta}&=\mathbf F_\Delta\boldsymbol\xi_t+\boldsymbol\omega_\Delta,\tag{65a}\\
\mathbb E[\boldsymbol\omega_\Delta\boldsymbol\omega_\Delta^{\mathsf T}]
&=\mathbf Q_\Delta,\tag{65b}\\
\mathbf P_i^{\rm obs}(\Delta)&=
\mathbf F_\Delta\mathbf J_i(q_i)^{-1}\mathbf F_\Delta^{\mathsf T},\tag{65c}\\
\mathbf P_i(\Delta)&=\mathbf P_i^{\rm obs}(\Delta)+\mathbf Q_\Delta,\tag{65d}\\
\operatorname{cov}(\widehat{\boldsymbol\xi}_{i,t+\Delta})
&\succeq\mathbf P_i(\Delta).\tag{65e}
\end{aligned}
$$

使用一阶线性化，将状态估计误差传播到 dB 域 SINR 误差（式 66）：

$$
\begin{aligned}
\mathbf h_\ell&:=\nabla_{\boldsymbol\xi}G_\ell(\boldsymbol\xi)
\big|_{\boldsymbol\xi=\boldsymbol\xi_{t+\Delta}},\tag{66a}\\
\sigma_{i,\ell}^2&:=
\operatorname{var}(\widehat\gamma_\ell^{(i)}-\gamma_\ell\mid q_i),\tag{66b}\\
\underline{\sigma}_{i,\ell}^2&:=
\mathbf h_\ell^{\mathsf T}\mathbf P_i(\Delta)\mathbf h_\ell,\tag{66c}\\
\sigma_{i,\ell}^2&\geq\underline{\sigma}_{i,\ell}^2.\tag{66d}
\end{aligned}
$$

式 (65)、(66) 说明：感知费舍尔信息越少、预测跨度越长、遮挡过程不确定性越强，则不可消除的 SINR 地图误差越大。

### D. 局部链路敏感性

为确定 CRLB 状态误差最有害的位置，设 UE 位置分量为 x 且 \(d_m(x)>d_0\)。由式 (7)–(10)，链路函数对位置的梯度可分解为路径损耗、波束方向图和遮挡分量（式 67）：

$$
\begin{aligned}
\nabla_{\mathbf x}G_\ell&=\mathbf h_\ell^{\rm pl}+
\mathbf h_\ell^{\rm bm}+\mathbf h_\ell^{\rm blk},\tag{67a}\\
\mathbf h_\ell^{\rm pl}&=
-\frac{10\alpha}{\ln10}\frac{\mathbf x-\mathbf b_m}{d_m(\mathbf x)^2},\tag{67b}\\
\mathbf r_m^\perp(\mathbf x)&=
\begin{bmatrix}-[\mathbf x-\mathbf b_m]_2\\ [\mathbf x-\mathbf b_m]_1\end{bmatrix},\tag{67c}\\
\mathbf h_\ell^{\rm bm}&=
\frac{g_k'(\phi_m(\mathbf x))}{d_m(\mathbf x)^2}
\mathbf r_m^\perp(\mathbf x),\tag{67d}\\
\mathbf h_\ell^{\rm blk}&=\mathbf h_\ell^{\rm sta}+
\mathbf h_\ell^{\rm dyn},\tag{67e}\\
\mathbf h_\ell^{\rm sta}&=-\lambda_{\rm sta}\nabla_{\mathbf x}a_m^{\rm sta}(\mathbf x),\tag{67f}\\
\mathbf h_\ell^{\rm dyn}&=-\lambda_{\rm dyn}\nabla_{\mathbf x}a_m^{\rm dyn}(\mathbf x,t+\Delta),\tag{67g}\\
g_k'(\phi)&=-24\frac{\angle(\phi-\bar\phi_k)}{\Phi_{\rm bw}^2}.\tag{67h}
\end{aligned}
$$

最后一式适用于方向图未被截断的区间；截断点可使用次梯度或平滑后的波束增益近似。因而同样的状态估计误差会在陡峭波束边缘和遮挡边界引发更大的 SINR 不确定性。

### E. 定理 3 的证明

假设各模态 SINR 估计局部无偏，且条件不相关：

$$
\begin{aligned}
\widehat\gamma_\ell^{(i)}&=\gamma_\ell+\varepsilon_{i,\ell},\tag{68a}\\
\mathbb E[\varepsilon_{i,\ell}\mid q_i]&=0,\tag{68b}\\
\operatorname{var}(\varepsilon_{i,\ell}\mid q_i)&=\sigma^2_{i,\ell},\tag{68c}\\
\operatorname{cov}(\varepsilon_{i,\ell},\varepsilon_{j,\ell}\mid q_i,q_j)&=0,\quad i\ne j.\tag{68d}
\end{aligned}
$$

线性融合、无偏约束和误差方差为（式 69）：

$$
\begin{aligned}
\widehat\gamma_\ell&=\sum_{i\in\mathcal M_{\rm mod}}\rho_i
\widehat\gamma_\ell^{(i)},\tag{69a}\\
\sum_{i\in\mathcal M_{\rm mod}}\rho_i&=1,\tag{69b}\\
\operatorname{var}(\widehat\gamma_\ell-\gamma_\ell)
&=\sum_{i\in\mathcal M_{\rm mod}}\rho_i^2\sigma_{i,\ell}^2.\tag{69c}
\end{aligned}
$$

条件 MSE 最小化为：

$$
\boldsymbol\rho^\star=
\arg\min_{\sum_i\rho_i=1}\sum_{i\in\mathcal M_{\rm mod}}
\rho_i^2\sigma_{i,\ell}^2.\tag{70}
$$

构造拉格朗日函数 \(\mathcal J=\sum_i\rho_i^2\sigma_{i,\ell}^2+
\lambda(\sum_i\rho_i-1)\)，最优条件给出
\(2\rho_i^\star\sigma_{i,\ell}^2+\lambda^\star=0\)。
再用 \(\sum_i\rho_i^\star=1\)，得到

$$
\rho_i^\star=\frac{\sigma_{i,\ell}^{-2}}
{\sum_{j\in\mathcal M_{\rm mod}}\sigma_{j,\ell}^{-2}},\tag{71}
$$

$$
\sigma_{f,\ell}^{2,\star}=
\left(\sum_{j\in\mathcal M_{\rm mod}}
\sigma_{j,\ell}^{-2}\right)^{-1}.\tag{72}
$$

由于式 (66) 中的误差方差随样本、模态和预测时长变化，固定拼接一般不是最优融合，证毕。

### F. 定理 2 的证明及 MCS 安全回退

设决策头从预测场选择 \(\widehat\ell=(\widehat m,\widehat k)\)、\(\widehat c\)。定义预测误差、MCS 裕量和正部运算（式 73）：

$$
\delta_{\widehat\ell}=\widehat\gamma_{\widehat\ell}
-\gamma_{\widehat\ell},\quad
\mu_{\widehat\ell,\widehat c}=\widehat\gamma_{\widehat\ell}
-\Gamma_{\widehat c},\quad
[z]_+=\max\{z,0\}.\tag{73}
$$

链路中断概率满足（式 74）：

$$
P_{\rm out}=
\Pr\{\gamma_{\widehat\ell}<\Gamma_{\widehat c}\}
=\Pr\{\delta_{\widehat\ell}>\mu_{\widehat\ell,\widehat c}\}.\tag{74}
$$

如果预测误差为方差代理 \(\sigma_{f,\widehat\ell}^2\) 的次高斯变量，则

$$
P_{\rm out}\leq\exp\left(
-\frac{[\mu_{\widehat\ell,\widehat c}]_+^2}
{2\sigma^2_{f,\widehat\ell}}\right).\tag{75}
$$

将成功概率乘以 \(B_0\eta_{\widehat c}\)，就得到正文式 (40)。如果仅假设二阶矩有限，Cantelli 不等式给出不依赖完整分布的界：

$$
P_{\rm out}\leq
\frac{\sigma^2_{f,\widehat\ell}}
{\sigma^2_{f,\widehat\ell}
+[\mu_{\widehat\ell,\widehat c}]_+^2},\tag{76a}
$$

$$
\mathbb E[R_{\widehat\ell,\widehat c}]
\geq B_0\eta_{\widehat c}
\frac{[\mu_{\widehat\ell,\widehat c}]_+^2}
{\sigma^2_{f,\widehat\ell}
+[\mu_{\widehat\ell,\widehat c}]_+^2}.\tag{76b}
$$

对目标中断概率 \(\varepsilon\in(0,1)\)，次高斯与 Cantelli 安全裕量回退分别为：

$$
b_{\varepsilon,\ell}^{\rm SG}=
\sqrt{2\sigma^2_{f,\ell}\log(1/\varepsilon)},\tag{77a}
$$

$$
b_{\varepsilon,\ell}^{\rm C}=
\sigma_{f,\ell}\sqrt{\frac{1-\varepsilon}{\varepsilon}},\tag{77b}
$$

$$
\mu_{\ell,c}=\widehat\gamma_\ell-\Gamma_c.\tag{77c}
$$

用次高斯回退，可构造中断受限的 MCS 集合并选择级别：

$$
\mathcal C_{\varepsilon,\ell}^{\rm SG}
=\{c\in\mathcal C:\mu_{\ell,c}\geq b_{\varepsilon,\ell}^{\rm SG}\},\tag{78a}
$$

$$
c_\varepsilon^\star(\ell)=
\max(\{-1\}\cup\mathcal C_{\varepsilon,\ell}^{\rm SG}),\tag{78b}
$$

$$
\Pr\{\gamma_\ell<\Gamma_{c_\varepsilon^\star(\ell)}\}
\leq\varepsilon,\tag{78c}
$$

$$
\mathbb E[R_{\ell,c_\varepsilon^\star}]
\geq(1-\varepsilon)B_0\eta_{c_\varepsilon^\star(\ell)}.\tag{78d}
$$

可见，质量感知融合模块的融合不确定性 \(\sigma_{f,\ell}^2\)，也直接控制 MCS 决策应保守到何种程度。预测越可靠，所需安全回退越小；不确定性大时，即使预测 SINR 较高，也可能必须选择更低 MCS。

### G. 减量探测的有效速率界

相同的不确定性–裕量机制还能描述减量探测。令 \(\mathcal S_N\) 是按照预测 SINR 排序的前 N 条候选链路：

$$
\mathcal S_N=\{s_1,\ldots,s_N\},\qquad
\widehat\gamma_{s_1}\geq\cdots\geq\widehat\gamma_{s_N},
\quad\widehat\gamma_{s_N}\geq\widehat\gamma_\ell\
(\ell\notin\mathcal S_N).\tag{79}
$$

对于未探测链路 \(\ell\notin\mathcal S_N\)，定义与最弱已探测链路之间的预测差值及两两反超概率上界（式 80）：

$$
d_{\ell,N}=[\widehat\gamma_{s_N}-\widehat\gamma_\ell]_+,\tag{80a}
$$

$$
v_{\ell,N}=\sigma^2_{f,\ell}+\sigma^2_{f,s_N},\tag{80b}
$$

$$
\upsilon_{\ell,N}=
\exp\left(-\frac{d_{\ell,N}^2}{2v_{\ell,N}}\right),\tag{80c}
$$

$$
\Pr\{\gamma_\ell\geq\gamma_{s_N}\}\leq\upsilon_{\ell,N}.\tag{80d}
$$

使用联合界（union bound），可估计探测集合遗漏最优链路的概率：

$$
p_{\rm miss}(N)=\Pr\{\ell^\star\notin\mathcal S_N\},\tag{81a}
$$

$$
p_{\rm miss}(N)\leq
\sum_{\ell\notin\mathcal S_N}\upsilon_{\ell,N},\tag{81b}
$$

$$
\bar p_{\rm miss}(N)=\mathbb E[p_{\rm miss}(N)].\tag{81c}
$$

这一界对门限速率通信偏保守，因为即使未探测链路的 SINR 更高，它也可能只支持相同 MCS，因而不会造成速率损失。令 \(R^\star\) 为在全部候选上计算的最优原始速率，则

$$
R_{\max}=B_0\eta_{C-1},\tag{82a}
$$

$$
R_{\rm raw}^{(N)}\geq
R^\star-R_{\max}\mathbf1\{\ell^\star\notin\mathcal S_N\},\tag{82b}
$$

$$
K_{\rm sw}\in\{K,MK\},\tag{82c}
$$

$$
\rho_{\rm oh}(N)=\rho_{\rm fs}\frac{N}{K_{\rm sw}}.\tag{82d}
$$

定义开销因子及遗漏惩罚后的原始速率下界项：

$$
\zeta_N=1-\rho_{\rm fs}\frac{N}{K_{\rm sw}},\tag{83a}
$$

$$
\overline R_N=\mathbb E[R^\star]-R_{\max}\bar p_{\rm miss}(N).\tag{83b}
$$

合并式 (81)–(83)，得到有效速率下界及有限码本内最优探测预算：

$$
\mathbb E[R_{\rm eff}^{(N)}]\geq\zeta_N\overline R_N,\tag{84a}
$$

$$
N^\star=\arg\max_{1\leq N\leq K_{\rm sw}}
\zeta_N\overline R_N.\tag{84b}
$$

式 (66)–(84) 将通信分析串成一条完整链：感知不确定性经 CRLB 形成 SINR 地图误差；融合不确定性产生逆不确定性权重和稳健 MCS 回退；同一误差与裕量关系又决定减量探测遗漏概率和有效速率损失。

## 参考文献

原论文的 47 项参考文献（含 IMT-2030、ISAC、CKM、毫米波预测波束赋形与 CRB–rate 文献）的编号、作者和出版信息，按 PDF 正式英文著录为准。参见[原文第 13–14 页的 References](https://arxiv.org/pdf/2607.00974v1)。

{% endraw %}
