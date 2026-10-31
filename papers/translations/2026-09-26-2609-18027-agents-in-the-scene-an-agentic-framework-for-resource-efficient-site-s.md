---
layout: page
title: "场景中的智能体：资源高效站点特定建模的智能体框架｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-18027-agents-in-the-scene-an-agentic-framework-for-resource-efficient-site-s/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6cd22d3b2ff792a9/) · [原文 arXiv](https://arxiv.org/abs/2609.18027) · [全部目录](/papers/catalog/)

# 场景中的智能体：资源高效站点特定建模的智能体框架

**原题：** Agents in the Scene: An Agentic Framework for Resource-Efficient Site-Specific Base Station Deployment  
**作者：** Zihao Zhou（Graduate Student Member, IEEE）、Zhaolin Wang（Member, IEEE）、Yuanwei Liu（Fellow, IEEE）。单位：香港大学电机与电子工程学系（Department of Electrical and Computer Engineering, The University of Hong Kong, Hong Kong；{eezihaozhou, zhaolin.wang, yuanwei}@hku.hk）。  
**版本：** arXiv:2609.18027v1（eess.SY），2026 年 9 月 16 日提交，原文 13 页（IEEE 双栏期刊投稿格式，含图 1–7、表 I–IV、算法 1、公式 (1)–(32)、参考文献 24 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–V 节（含 I-A–B、III-A–C、IV-A–D 等全部小节）、结论、全部图注（图 1–7，含子图说明）、表 I–IV（逐格转录）、算法 1、公式 (1)–(32) 与 24 条参考文献英文原条目；原文无附录、无作者简介；逐句逐式终校未做。

## 摘要

本文提出一种用于无线网络规划中自主、站点特定基站（BS）部署的智能体框架。与传统依赖人工现场勘测或需要大量人工干预的高开销射线追踪（RT）仿真的方法不同，所提框架在有限的 RT 评估预算下自主探索并优化 BS 部署，从而实现资源高效的网络规划。为此，首先由三维（3D）无线数字孪生构造出连续的、以几何为依据的部署动作空间。在该动作空间内，智能体团队通过**有状态的感知–推理–反思闭环**运行。具体地，**Placement Agent** 以两种互补模式生成候选 BS 部署：精化有前景解的经验引导模式，以及避免陷入局部最优的探索模式。候选部署经 RT 评估后，**Reflection Agent** 把 RT 结果与场景几何结合起来解读，识别阻塞、覆盖重叠、未覆盖区域等限制性能的因素，并把诊断转化为后续部署的指导。通过该迭代过程，站点特定经验得以累积，部署方案在无需人工干预下被优化。两个真实城市场景的数值结果表明：1）所提方法显著优于启发式、基于学习以及大语言模型（LLM）辅助的方法；2）相对最优解达到极具竞争力的覆盖，同时所需发射机级 RT 评估大幅减少；3）站点特定反思有效地把原始 RT 反馈转化为精化指导，而双模式机制保持了多样性并有助于跳出局部最优。

**关键词：** 智能体 AI、基站部署、大语言模型、网络规划、6G。

## I. 引言

面向第六代（6G）无线网络的快速演进有望支撑不断增长的流量需求、多样化的服务质量（QoS）要求以及新兴通信业务与 AI 原生应用 [1]。在 6G 无线网络规划中，基站（BS）部署是一项基础任务，因为 BS 位置直接影响无线覆盖、服务质量与基础设施成本 [2], [3]。随着无线网络部署日益密集与复杂，低效的 BS 布局可能导致覆盖变差，并使资本支出（CAPEX）与运营支出（OPEX）不必要地上升。尽管具有基础重要性，有效的 BS 部署在实践中仍因若干瓶颈而困难重重。

第一，确定有效的 BS 部署本质上是**站点特定**的 [4]，因为无线传播与目标环境的几何紧密耦合。建筑物、地形及其他结构可能阻挡、反射或重定向无线信号，使空间坐标相近的候选位置呈现出显著不同的覆盖性能。因此，在某一环境中表现良好的部署策略在另一环境中未必有效；可靠的网络规划需要把目标场址的空间与传播特性显式纳入部署决策。此外，在考虑物理部署约束的前提下联合选择多个 BS 的连续位置，会形成具有挑战性的非凸组合优化问题，其难度随部署 BS 数与目标环境空间范围迅速上升。

部署评估同样是瓶颈。简化传播模型可能无法刻画特定场址的阻塞与多径效应；虽然高保真实测或三维数字孪生（DT）中的射线追踪（RT）仿真能更准确地刻画这些效应，但对大量候选部署逐一评估需要大量时间、人力或计算资源。因此核心挑战在于：仅用有限次高保真评估，找出高质量、物理可行且站点特定的多 BS 部署。

### A. 先前工作

按环境信息的表示方式及其融入决策的方式，现有 BS 部署方法可大致分为三类：1）模型驱动优化、2）数据驱动学习、3）大语言模型（LLM）辅助决策。三者的概念关系如图 1 所示。

**1）模型驱动优化：** 模型驱动方法把环境特征显式抽象为数学模型，并据此建立优化问题，用精确、近似或启发式算法求解 [5]–[12]。[5] 在 BS 部署中联合考虑覆盖与容量需求：先用 COST-231-HATA 传播模型估计所需 BS 数，再建立优化问题确定 BS 位置以减少冗余部署。[6] 研究成本有效的毫米波 BS 部署：基于经验视距（LoS）路损模型，把加权安装成本最小化表述为整数非线性规划（INP），再通过分别优化小区覆盖与子集 BS 选择来次优求解。[7] 作者联合考虑概率性信号阻塞与容量受限中断，在总阻塞概率约束下从候选位置中选取以最小化 BS 数。[8] 考虑时变用户分布，以最大化长期物理可达性为目标、以平均不可达概率为约束优化毫米波 BS 位置；该工作中，用户在某 BS 的固定覆盖半径内且 BS–用户链路未被任何障碍物阻挡时被视为物理可达。对空中基站（ABS）部署，[9] 的概率 LoS 模型被用于优化三维 ABS 布置以支撑能效覆盖 [10] 与异构 QoS 需求 [11]，而 [12] 进一步联合优化用户关联、ABS 布置、资源分配与布置更新间隔。

**2）数据驱动学习：** 数据驱动方法本质上是在测量或仿真数据上训练模型，以隐式捕获环境与性能之间的关系，从而实现智能网络规划 [13]–[18]。[13] 用实测城市传播数据训练极端随机树回归模型，由 BS 到用户预测路损；随后用所学传播模型按预测覆盖与平均接收功率对一小批预定义 BS 位置排序。[14] 作者研究基于深度 Q 网络（DQN）的二维 BS 序列部署方法，在射频电磁场（RF-EMF）暴露约束下最大化覆盖，并在奖励计算中用条件生成对抗网络（cGAN）预测接收信号强度（RSS）。类似地，[15] 用近端策略优化（PPO）算法训练 BS 部署智能体，并在奖励函数中用 PMNet 预测站点特定路损。作为另一种基于强化学习（RL）的方法，[16] 提出带表示学习的分层多智能体 PPO，联合优化二维 BS 位置及其配置（如方位角/倾角、水平/垂直波束宽度），奖励函数同时考虑覆盖、平均吞吐量与部署成本。对数据驱动 ABS 部署，[17] 把用户分布图构造为视觉输入，提出用卷积神经网络（CNN）优化 ABS 部署；[18] 提出 Lyapunov 引导的 RL 框架，用于移动用户与异构流量需求下多 ABS 的在线三维布置，在 ABS 移动性、队列稳定性与平均推进功率约束下最大化用户长期平均意见分（MOS）。

**3）LLM 辅助决策：** 受 LLM 广泛领域知识与显著推理能力启发，研究者近期探索其在无线网络优化与决策中的潜力 [19]–[23]。例如，为最大化覆盖，[19] 微调 LLM 辅助的 RL 智能体以确定 BS 位置：凭借预训练获得的丰富先验知识，LLM 作为 actor 可直接从文本输入解读目标与约束。[20] 提出 TelePlanNet：微调的 Qwen2.5-32B-Instruct 解读规划意图并为奖励计算中的非量化因素打分，RL 策略则从预定义候选集顺序选择 BS 并兼顾多项性能与实际考虑。从提示工程角度，[21] 用 LLM 作为零样本组合优化器，通过确定 BS 数量与位置最大化覆盖；每次迭代由任务描述、场址布局与历史性能构造提示。[22] 研究基于提示、单智能体与协作多智能体的 LLM 范式，以自动化 BS 部署中的问题建模、求解代码生成、调试与执行以及迭代解精化。[23] 聚焦室内场景，提出 LLM 优化器 iPLAN：依据建筑描述、领域知识与传播性能反馈，迭代调整室内接入点（AP）的数量与二维位置；并进一步提出多智能体扩展，以联合优化室内布局与 AP 部署，服务于“无线友好”建筑设计。

**图 1：** BS 部署范式对比（模型驱动优化、数据驱动学习、LLM 辅助决策三类的环境信息表示与决策方式差异）。

### B. 动机与贡献

尽管现有 BS 部署范式已取得进展，仍存在若干局限。模型驱动方法提供了明确的优化流程，但通常依赖简化传播模型或离散化候选位置 [5]–[12]。数据驱动方法能捕获站点特定传播特性，但需要场景特定数据集与模型训练，且所学环境知识仍隐式存在于模型参数中 [13]–[18]。近期 LLM 辅助方法通过对文本输入推理提升规划自主性 [19]–[23]，但它们一般缺乏与底层三维场景的直接交互。

随着无线网络向空间智能演进，其规划与优化需要一种**情境化、智能体化**的范式：智能体与传播环境保持持续的感知–行动–反馈闭环。具体地，智能体可主动访问并检视场景数据，用分析工具提取空间特征，并产生站点特定诊断以支撑后续精化。通过这种持续交互，智能体可如始终“置身于”环境中一般运行，把场景视为决策过程的有机组成部分，而非静态的描述性输入。

然而，实现这一自主且资源高效的规划过程面临若干挑战。**第一**，BS 位置须满足目标场址的几何与安装约束：把搜索限制在预定义候选位置会在空间分辨率与搜索复杂度之间造成折中，而直接生成任意三维坐标可能反复产生无效布置。**第二**，每次 RT 评估计算开销大，且标量网络效用只能说明某部署是否表现良好，无法揭示是哪些几何或传播因素导致该结果；因此把这种黑箱反馈直接交给规划器，对后续精化的指导有限。**第三**，虽然累积经验可改善推理，但过度依赖此前成功的部署可能使不同提案过早收敛到相似解，降低探索性并增大陷入局部最优的风险。

为解决这些问题，本文提出一种在有限 RT 评估预算下进行站点特定 BS 部署的智能体框架。主要贡献概括如下：

- **自主的站点特定部署框架：** 我们把 BS 部署表述为有状态的智能体优化过程，迭代地生成、评估、诊断并精化候选部署。由目标三维场景识别满足规定几何约束的安装表面，构造出连续可行部署空间；该构造保证所生成 BS 位置的物理有效性，而无需把可行表面离散化为固定候选坐标集。
- **具备双模式提案生成的 Placement Agent：** 开发 Placement Agent 在连续可行空间内生成候选 BS 部署。经验引导的常规模式利用最佳已评估解、既往反思指导与累积站点特定经验精化有前景部署；探索模式搜索考察不足的部署区域，并避免与同一迭代中常规提案过于相似的提案。二者非对称执行在利用已验证经验的同时保持提案多样性。
- **具备站点特定诊断的 Reflection Agent：** 进一步开发 Reflection Agent，联合分析结构化 RT 评估结果与目标场景几何。该智能体不把网络效用当作黑箱反馈，而是识别有证据支撑的因素，如局部阻塞、冗余覆盖与覆盖不足区域；这些诊断被转化为下一迭代的可执行指导与可复用的站点特定经验。Placement Agent 与 Reflection Agent 共同构成有状态的感知–推理–反思闭环。
- **充分的数值评估：** 两个复杂城市场景的数值结果表明，所提框架仅用少量 RT 评估即达到极具竞争力的覆盖性能，显著优于启发式、基于学习以及近期 LLM 辅助的部署方法。消融研究进一步表明，站点特定反思把原始评估反馈转化为有效的精化指导，而平衡的利用–探索分配可防止多样性坍缩并有助于跳出局部最优部署。

本文余下部分安排如下：第 II 节描述系统模型与问题建模；第 III 节介绍所提资源高效 BS 部署框架；第 IV 节给出数值结果；第 V 节为结论。为便于参考，全文主要记号汇总于表 I。

## II. 系统模型与问题建模

我们考虑在目标城市场景 $\mathcal S$ 中部署 $B$ 个 BS，并令 $\mathcal U=\{\mathbf u_n\}_{n=1}^{N}$ 表示室外接收机（Rx）位置集合。进一步，令 $\mathbf q_b\in\mathbb R^{3\times1}$ 表示第 $b$ 个已部署 BS 的位置，$\mathcal X=\{\mathbf q_1,\dots,\mathbf q_B\}$ 表示一个部署方案。在实际网络规划中，BS 布置常受环境法规、站点特定条件与既有基础设施约束；因此每个 BS 位置须位于连续可行部署空间 $\Omega_{\rm dep}$ 内。

对部署 $\mathcal X$，我们用高保真 RT 引擎评估其站点特定传播响应。设 $r^{\rm RT}_{b,n}(\mathcal S,\mathbf q_b,\mathbf u_n;\boldsymbol\psi)$ 表示 Rx $\mathbf u_n$ 处接收到的、来自位于 $\mathbf q_b$ 的第 $b$ 个 BS 的接收信号强度（RSS）。参数集 $\boldsymbol\psi$ 规定 RT 配置，包括载频、发射功率、天线配置、材料属性与求解器设置。为记号简便，定义 RT 算子为

$$
{\rm RT}_{\boldsymbol\psi}:(\mathcal S,\mathcal X,\mathcal U)\mapsto\mathbf Z^{\rm RT}\in\mathbb R^{B\times N}, \tag{1}
$$

其中

$$
\mathbf Z^{\rm RT}={\rm RT}_{\boldsymbol\psi}(\mathcal S,\mathcal X,\mathcal U)
=\left[r^{\rm RT}_{b,n}(\mathcal S,\mathbf q_b,\mathbf u_n;\boldsymbol\psi)\right]_{\substack{b=1,\dots,B\\ n=1,\dots,N}}. \tag{2}
$$

于是 $\mathbf Z^{\rm RT}$ 的第 $(b,n)$ 个元素表示在给定 RT 配置下第 $b$ 个 BS 对第 $n$ 个 Rx 的 RSS 贡献。进一步，任务特定的度量函数 $\mathcal F_\phi(\cdot)$ 把 RT 响应映射为标量网络效用：

$$
J(\mathcal X;\mathcal S,\mathcal U,\boldsymbol\psi)=\mathcal F_\phi\left(\mathbf Z^{\rm RT}\right), \tag{3}
$$

其中 $\phi$ 规定所选部署度量的配置，例如用于覆盖评估的 RSS 阈值。由于对给定部署任务 $\phi$ 固定，为记号简便将其从 $J(\cdot)$ 的自变量中省略。依 $\mathcal F_\phi(\cdot)$ 不同，该效用可表示覆盖比、和速率或其他部署目标。本文把 $\mathcal F_\phi(\cdot)$ 具体化为基于 RSS 阈值的室外覆盖比。

然而，RT 计算密集，对候选解频繁评估成为优化的主要瓶颈。因此我们在有限 RT 评估预算 $N_{\rm bud}$ 内寻求高质量 BS 部署。据此，BS 部署问题表述为

$$
\max_{\mathcal X=\{\mathbf q_b\}_{b=1}^{B}}\ J(\mathcal X;\mathcal S,\mathcal U,\boldsymbol\psi) \tag{4a}
$$
$$
\text{s.t.}\quad
\mathbf q_b\in\Omega_{\rm dep},\ \forall b\in\{1,\dots,B\}, \tag{4b}
$$
$$
\left\|\mathbf q_b-\mathbf q_{b'}\right\|_2\ge d_{\min},\quad\forall b\ne b', \tag{4c}
$$
$$
N_{\rm RT}\le N_{\rm bud}, \tag{4d}
$$

其中 $N_{\rm RT}$ 为优化过程中使用的 RT 评估次数，$N_{\rm bud}$ 为可用评估预算。约束 (4b) 表示每个 BS 位置必须可行，(4c) 强制任意两个已部署 BS 之间的最小间隔，(4d) 为 RT 评估预算约束。

**表 I：** 主要记号汇总。

| 符号 | 含义 | 符号 | 含义 |
|---|---|---|---|
| $\mathcal S$ | 目标三维部署场景 | $t$ 与 $T$ | 当前迭代序号与最大迭代次数 |
| $\mathcal U=\{\mathbf u_n\}_{n=1}^{N}$ | 接收机位置集合，$N$ 为接收机数 | $s\in\{\rm reg,exp\}$ | 提案生成模式：常规或探索 |
| $B$ | 待部署 BS 数 | $K_s$ | 模式 $s$ 下每次迭代生成的提案数 |
| $\mathbf q_b\in\mathbb R^{3\times1}$ | 第 $b$ 个 BS 的位置 | $\mathcal D_{s,t,k}$ | 第 $t$ 次迭代、模式 $s$ 下生成的第 $k$ 个部署提案 |
| $\mathcal X=\{\mathbf q_b\}_{b=1}^{B}$ | 一个 BS 部署方案 | $\mathcal Q_{s,t}$ | 第 $t$ 次迭代、模式 $s$ 下生成的部署提案批次 |
| $\Omega_{\rm dep}$ | 连续可行 BS 部署空间 | $\mathbf y_{s,t,k}$ | 提案 $\mathcal D_{s,t,k}$ 的结构化性能摘要 |
| $\mathcal T_o=(\mathcal V_o,\mathcal F_o)$ | 对象 $o$ 的三角网格，顶点集 $\mathcal V_o$、面集 $\mathcal F_o$ | $\mathcal Y_t$ | 第 $t$ 次迭代的已评估提案及其性能摘要批次 |
| $\mathcal P_m$ | 第 $m$ 个可行部署表面片 | $\mathcal R_t$ | 第 $t$ 次迭代生成的反思记录 |
| $\Omega_m$ | 表面片 $\mathcal P_m$ 所支持的可行 BS 位置集合 | $\mathcal I_t$ | $\mathcal R_t$ 中包含的站点特定诊断 |
| $\mathbf Z^{\rm RT}$ | RT 产生的原始传播响应 | $\mathcal G_t$ | 第 $t$ 次迭代生成的可执行布置指导 |
| $\boldsymbol\psi$ | RT 配置 | $\Delta\mathcal M_t$ | 第 $t$ 次迭代提取的可复用站点特定经验 |
| $J(\mathcal X;\mathcal S,\mathcal U,\boldsymbol\psi)$ | 部署 $\mathcal X$ 达到的网络效用 | $\mathcal M_t$ | 可复用站点特定经验的跨迭代记忆 |
| $d_{\min}$ | 已部署 BS 间的最小间隔距离 | $\mathcal H_t$ | 已评估部署提案的历史 |
| $N_{\rm RT}$ 与 $N_{\rm bud}$ | 已使用与可用的 RT 评估次数 | $\mathcal B_t$ | 第 $t$ 次迭代可获得的最佳已评估部署记录 |
| ${\rm PA}(\cdot)$ 与 ${\rm RA}(\cdot)$ | Placement Agent 与 Reflection Agent 算子 | $\boldsymbol\Xi_t$ | 优化状态 $(\mathcal M_t,\mathcal H_t,\mathcal B_t,\mathcal G_{t-1})$ |
| $\mathcal P^{\rm PA}_{s,t}$ | 模式 $s$ 下提供给 Placement Agent 的结构化提示 | $\mathcal P^{\rm RA}_{t}$ | 提供给 Reflection Agent 的结构化提示 |

## III. 所提框架

所提智能体框架的概览如图 2 所示。框架包含两个主要组件：**Placement Agent** 与 **Reflection Agent**。每次迭代中，Placement Agent 依据目标场景与既往迭代累积的经验生成多个可行 BS 部署提案；这些提案由第 II 节定义的 RT 评估器评估。随后 Reflection Agent 联合分析评估结果与三维场景，识别可解释所观测性能的站点特定因素；所得诊断被转化为可执行指导与可复用经验，供后续提案生成使用。在这一**有状态的感知–推理–反思闭环**中，两个智能体在规定 RT 评估预算下逐步改进 BS 部署。下面第 III-A 节介绍 Placement Agent 及其双模式提案生成机制；第 III-B 节给出用于站点特定性能诊断的 Reflection Agent；完整的闭环优化流程与状态更新机制见第 III-C 节。

**图 2：** 所提框架的整体流水线（三维场景数据与几何信息→动作空间提取→Placement Agent（利用导向与探索导向提案）→基于 Sionna 的射线追踪评估→Reflection Agent 反思反馈→状态更新与上下文管理，含编号 ①–⑨ 的信息流）。

### A. Placement Agent：BS 部署提案生成

**1）可行部署空间构造：** Placement Agent 负责在目标场景中生成 $B$ 个 BS 的位置。若允许智能体直接在 $\mathbb R^{3\times1}$ 中生成任意坐标，可能产生无效布置，例如位于建筑物内部、陡峭建筑立面上，或距屋顶边界过近的位置。反复检测并修正此类无效提案会浪费智能体推理与 RT 评估资源。因此，在提案生成之前先处理三维场景，识别可物理安装 BS 的表面；所得可行部署空间把 Placement Agent 限制在有效位置，同时在每个可部署表面内保持连续。

在本文考虑的三维场景模型中，每栋建筑的表面由一组相连三角面表示。设 $\mathcal T_o=(\mathcal V_o,\mathcal F_o)$ 表示建筑对象 $o$ 的三角表面模型，其中 $\mathcal V_o$ 含三维顶点，$\mathcal F_o$ 含由这些顶点构成的三角面。对每个面 $f\in\mathcal F_o$，记 $\mathbf n_f$、$\mathbf p_f$、$a_f$ 分别为其单位法向量、质心与表面积。若某区域满足下列基本要求，则被视为潜在可部署：足够水平、空间充足、高程高于规定的最小平台高度、其上方空间无遮挡。首先，$f$ 相对水平面的倾角定义为

$$
\theta_f=\arccos\left(\left|\mathbf n_f^T\mathbf e_z\right|\right), \tag{5}
$$

其中 $\mathbf e_z=[0,0,1]^T$ 为竖直单位向量。仅当面的倾角不超过 $\theta_{\max}$ 且其质心高程不低于规定的最小平台高度 $h_{\min}$ 时，该面才被保留为初始部署候选。此外，为保证面在竖直方向无遮挡，定义开阔天空指示符 $v^{\rm sky}_f\in\{0,1\}$：若从面质心 $\mathbf p_f$ 向上发射的竖直射线不与场景中其他对象相交，则 $v^{\rm sky}_f=1$，否则 $v^{\rm sky}_f=0$。因此对象 $o$ 的可行面集合定义为

$$
\mathcal F^{\rm dep}_o=\left\{f\in\mathcal F_o:\ \theta_f\le\theta_{\max},\ [\mathbf p_f]_z\ge h_{\min},\ v^{\rm sky}_f=1\right\}. \tag{6}
$$

空间上相连且近似共面的相邻可行面被聚合为一个**可部署表面片**，记为 $\mathcal P_m$。这种聚合避免把同一屋顶的大量小三角面当作彼此独立的部署区域。记每个表面片 $\mathcal P_m$ 的水平投影为

$$
\mathcal A_m=\bigcup_{f\in\mathcal P_m}{\rm Proj}_{xy}(f), \tag{7}
$$

其中 ${\rm Proj}_{xy}(\cdot)$ 把三角面投影到水平面。为防止生成的 BS 位置过于靠近表面片边界，把该投影按规定距离 $d_{\rm edge}$ 内缩：

$$
\widetilde{\mathcal A}_m=\mathcal A_m\ominus\mathcal B(d_{\rm edge}), \tag{8}
$$

其中 $\ominus$ 表示形态学腐蚀，$\mathcal B(d_{\rm edge})$ 为半径 $d_{\rm edge}$ 的圆盘。仅当表面片的总表面积与剩余可用面积满足

$$
\sum_{f\in\mathcal P_m}a_f\ge A_{\min},\qquad
{\rm Area}\left(\widetilde{\mathcal A}_m\right)\ge\widetilde A_{\min} \tag{9}
$$

时该片才被保留，其中 ${\rm Area}(\widetilde{\mathcal A}_m)$ 为 $\widetilde{\mathcal A}_m$ 的面积，$a_f$ 为三角面的面积，可计算为

$$
a_f=\frac{1}{2}\left\|(\mathbf v_{f,2}-\mathbf v_{f,1})\times(\mathbf v_{f,3}-\mathbf v_{f,1})\right\|_2, \tag{10}
$$

$\mathbf v_{f,1},\mathbf v_{f,2},\mathbf v_{f,3}$ 为面 $f$ 的三个顶点。设 $z_m(x,y)$ 表示 $\mathcal P_m$ 在水平位置 $(x,y)$ 处的高程。给定规定的 BS 安装高度 $h_{\rm BS}$，该表面片所支持的可行 BS 位置集合为

$$
\Omega_m=\left\{\mathbf q=[x,y,z_m(x,y)+h_{\rm BS}]^T:\ (x,y)\in\widetilde{\mathcal A}_m\right\}. \tag{11}
$$

因此，以几何为依据的部署动作空间由

$$
\Omega_{\rm dep}=\bigcup_{m=1}^{M}\Omega_m \tag{12}
$$

得到，其中 $M$ 为保留的可部署表面片数。每个表面片由包含其标识、所属建筑、代表位置、高程、投影、可用面积与空间范围的结构化描述符表示。于是，暴露给 Placement Agent 的每个候选都与一个物理表面显式关联，并满足几何与安装约束。需要强调，$\Omega_{\rm dep}$ **不是**预定义候选坐标的有限集，而是连续表面区域的并集，Placement Agent 可在其中选择 BS 位置；因此每个生成位置都与一个物理安装表面关联并满足规定几何约束。

**2）双模式提案生成：** 在可行部署空间 $\Omega_{\rm dep}$ 给定的条件下，Placement Agent 在每次迭代生成一个或多个结构化 BS 部署提案。本文采用两种提案生成模式。常规模式以利用为导向，即利用最佳已评估部署、既往反思指导与可复用站点特定经验来精化有前景的解；相反，探索模式聚焦考察不足的部署区域，并避免与已评估解过于相似的提案。两种模式共同平衡已验证经验的复用与提案多样性的保持。提供给 Placement Agent 的运行上下文取决于所采用模式与当前优化状态，其构造将在第 III-C 节详述；本小节先聚焦两种模式共享的提案表示。

设 $s\in\{\rm reg,exp\}$ 表示生成提案所用模式，并记 $K_s$ 为模式 $s$ 在一次迭代中生成的提案数，则 Placement Agent 返回

$$
\mathcal Q_{s,t}=\left\{\mathcal D_{s,t,k}\right\}_{k=1}^{K_s}, \tag{13}
$$

其中 $\mathcal Q_{s,t}$ 表示第 $t$ 次迭代生成的提案批次$^1$。对 $B$ 个 BS 的部署，第 $k$ 个提案表示为

$$
\mathcal D_{s,t,k}=\left(\iota_{s,t,k},\ r_{s,t,k},\ \mathcal X_{s,t,k},\ \mathbf m_{s,t,k},\ \rho_{s,t,k}\right), \tag{14}
$$

其中 $\iota_{s,t,k}$ 为提案标识，$r_{s,t,k}$ 为 Placement Agent 赋予的偏好排序，$\mathcal X_{s,t,k}$ 为所提 BS 部署集合，$\rho_{s,t,k}$ 为其结构化理由。相应 BS 部署集合为 $\mathcal X_{s,t,k}=\{\mathbf q_{s,t,k,b}\}_{b=1}^{B}$；此外 $\mathbf m_{s,t,k}=[m_{s,t,k,1},\dots,m_{s,t,k,B}]$ 记录每个 BS 所选的部署表面片，使 $\mathbf q_{s,t,k,b}\in\Omega_{m_{s,t,k,b}}$，$b=1,\dots,B$。最后，结构化理由 $\rho_{s,t,k}$ 包含简洁的布置解释、生成时使用的站点特定几何线索以及预期的联合部署收益。这些陈述被视为布置假设而非已验证的传播结果，实际性能由 RT 评估器确定。

### B. Reflection Agent：站点特定诊断与指导

Placement Agent 生成的部署理由代表关于所选 BS 位置将如何与目标环境相互作用的假设，其实际性能必须由高保真 RT 评估器验证。然而，标量网络效用只能说明提案表现是否良好，却无法解释：哪些 BS 贡献了性能、哪些区域未被覆盖、或某部署为何成功或失败。Reflection Agent 的引入正是为弥合这一差距——联合解读结构化评估结果与目标场景几何。

**1）结构化 RT 评估：** Placement Agent 生成的每个部署提案 $\mathcal D_{s,t,k}$ 由一个不可修改$^2$的任务特定评估工具评估。对其关联的部署方案 $\mathcal X_{s,t,k}$，RT 传播响应为

$$
\mathbf Z^{\rm RT}_{s,t,k}={\rm RT}_{\boldsymbol\psi}\left(\mathcal S,\mathcal X_{s,t,k},\mathcal U\right)\in\mathbb R^{B\times N}, \tag{15}
$$

其中 $\mathbf Z^{\rm RT}_{s,t,k}$ 的第 $(b,n)$ 个元素为第 $b$ 个 BS 对接收机 $\mathbf u_n$ 的 RSS 贡献。评估一个部署提案消耗可用预算中的一次 RT 评估。标量部署效用计算为

$$
J_{s,t,k}=\mathcal F_\phi\left(\mathbf Z^{\rm RT}_{s,t,k}\right), \tag{16}
$$

其中 $\mathcal F_\phi(\cdot)$ 为第 II 节引入的任务特定度量函数。除该标量效用外，度量适配器 $g_\phi(\cdot)$ 提取结构化性能摘要：

$$
\mathbf y_{s,t,k}=g_\phi\left(\mathbf Z^{\rm RT}_{s,t,k},\mathcal X_{s,t,k}\right). \tag{17}
$$

对本文考虑的覆盖目标，$\mathbf y_{s,t,k}$ 含总体覆盖比、每个 BS 的覆盖与唯一覆盖贡献、以及 BS 间两两覆盖重叠。这些量比仅用标量目标为 Reflection Agent 提供更有信息的证据。对其他部署目标，度量适配器可用相应任务特定量实例化，如可达速率、中断概率或干扰。

第 $t$ 次迭代生成的全部提案评估完成后，已评估提案批次定义为

$$
\mathcal Y_t=\left\{\left(\mathcal D_{s,t,k},\mathbf y_{s,t,k}\right):\ s\in\{\rm reg,exp\},\ k=1,\dots,K_s\right\}. \tag{18}
$$

当前迭代中部署效用最高的提案选为

$$
\left(s^\star_t,k^\star_t\right)=\arg\max_{\substack{s\in\{\rm reg,exp\}\\ k\in\{1,\dots,K_s\}}}J_{s,t,k}. \tag{19}
$$

其提案与结构化性能摘要分别记为 $\mathcal D^\star_t=\mathcal D_{s^\star_t,t,k^\star_t}$ 与 $\mathbf y^\star_t=\mathbf y_{s^\star_t,t,k^\star_t}$。

然而，数值性能摘要主要量化部署提案**取得什么**，对**为何**出现该结果、或**如何**改进部署策略提供的洞见有限。这主要源于数值歧义性：相似的目标值可能来自完全不同的站点特定因素，如阻塞或空间分集不足。因此，把这些数值结果直接反馈给 Placement Agent，可能无法为后续提案改进提供足够可执行的指导。为弥合该差距，我们引入可访问三维场景数据的 Reflection Agent，以推断已评估提案优缺点背后可能的站点特定成因；随后 Reflection Agent 把这些诊断假设转化为可执行布置指导与可在后续迭代复用的更高层部署知识。

**2）站点特定反思输出：** 基于已评估提案与目标场景，Reflection Agent 产生结构化反思记录

$$
\mathcal R_t=\left(\mathcal I_t,\mathcal G_t,\Delta\mathcal M_t\right), \tag{20}
$$

其中 $\mathcal I_t$ 为站点特定诊断，$\mathcal G_t$ 为面向下一迭代的可执行指导，$\Delta\mathcal M_t$ 含从当前评估中提取的经验$^3$。更具体地，站点特定诊断 $\mathcal I_t$ 通过把结构化数值摘要与目标三维场景中具体几何与传播因素关联来解释所观测性能：例如，它可能指出某 BS 因可见区域已被另一 BS 服务而几乎不提供唯一覆盖，或某高层屋顶因周边建筑遮挡相关传播路径而表现不佳。这些陈述被视为有证据支撑的诊断假设，而非精确因果结论。

可执行指导 $\mathcal G_t$ 把诊断转化为 Placement Agent 下一迭代可直接使用的具体指令。一条指导可能建议保留表现良好的 BS、把冗余 BS 移向覆盖不足区域、探索不同部署表面片，或增大覆盖高度重叠的 BS 之间的空间间隔。因此 $\mathcal G_t$ 把站点特定解释与即时提案精化连接起来。

记忆增量 $\Delta\mathcal M_t$ 抽象出在下一迭代之后仍可能有用的经验。每条经验记录相关站点条件、部署决策、其评估结果与支撑证据。与面向即时下一提案的 $\mathcal G_t$ 不同，$\Delta\mathcal M_t$ 被纳入跨迭代记忆，可在后续部署决策中复用。

据此，Reflection Agent 把昂贵的 RT 评估从孤立数值观测转化为站点特定指导与可复用部署经验。其输入提示的构造与跨迭代优化状态的更新见第 III-C 节。

### C. 闭环优化与状态更新

在介绍 Placement Agent 与 Reflection Agent 之后，我们将其整合为闭环部署优化流程。如图 2 所示，每次迭代含四步：1）利用累积站点特定经验的常规提案生成；2）为保持多样性的探索导向提案生成；3）基于 RT 的评估与站点特定反思；4）优化状态更新。该过程重复进行，直至达到规定迭代数或 RT 评估预算。第 $t$ 次迭代开始时，优化状态可定义为

$$
\boldsymbol\Xi_t=\left(\mathcal M_t,\mathcal H_t,\mathcal B_t,\mathcal G_{t-1}\right), \tag{21}
$$

其中 $\mathcal M_t$ 为含可复用站点特定经验的跨迭代记忆，$\mathcal H_t$ 为已评估布置提案的历史，$\mathcal B_t$ 为当前最佳 BS 部署记录（含提案与其评估性能），$\mathcal G_{t-1}$ 为 Reflection Agent 在上一迭代产生的可执行指导，直接指导当前迭代的提案生成。优化状态初始化为 $\mathcal M_1=\varnothing$、$\mathcal H_1=\varnothing$、$\mathcal B_1=\varnothing$、$\mathcal G_0=\varnothing$。

上下文管理器由当前优化状态 $\boldsymbol\Xi_t$ 构造模式特定的结构化上下文。对常规模式，上下文为

$$
\mathcal C_{{\rm reg},t}=\boldsymbol\Xi_t. \tag{22}
$$

它鼓励 Placement Agent 遵循最近的可执行指导、利用已验证的站点特定经验、保留有前景部署的优点并纠正此前诊断出的弱点。为避免陷入局部最优，探索模式改用

$$
\mathcal C_{{\rm exp},t}=\left(\mathcal E_t,\mathcal B_t,\mathcal Q_{{\rm reg},t}\right), \tag{23}
$$

其中 $\mathcal E_t$ 表示由 $\mathcal H_t$ 导出的搜索覆盖摘要，含此前已评估的可部署表面片、建筑、BS 位置与片组合。此外，探索上下文还包含同一迭代早前生成的常规提案批次；因此它引导 Placement Agent 走向考察不足但几何上合理的区域，同时避免与全局最优及当前常规提案近似重复。

结构化上下文用于构造最终智能体输入。对 $s\in\{\rm reg,exp\}$，提供给 Placement Agent 的结构化提示可写为

$$
\mathcal P^{\rm PA}_{s,t}={\rm Prompt}\left(\mathcal T_s,\ \widetilde{\mathcal C}_{s,t},\ \mathcal J_\Omega,\ \mathcal O_{\rm pl}\right), \tag{24}
$$

其中 $\mathcal T_s$ 为提供给 Placement Agent 的模式特定说明，含智能体角色、部署目标、硬性要求、提案预算 $K_s$、每个提案规定的 BS 数 $B$ 以及与模式 $s$ 对应的生成指令；$\widetilde{\mathcal C}_{s,t}$ 为 $\mathcal C_{s,t}$ 的压缩形式；$\mathcal J_\Omega$ 提供对以几何为依据的部署动作空间的结构化访问；$\mathcal O_{\rm pl}$ 为 Placement Agent 的输出模式，规定第 III-A 节引入的提案表示。式 (24) 中提示构造算子 ${\rm Prompt}(\cdot)$ 可采用字符串拼接形式。两种提案模式在每次迭代内非对称执行（利用在前）。具体地，常规与探索提案批次生成为

$$
\mathcal Q_{{\rm reg},t}={\rm PA}\left(\mathcal P^{\rm PA}_{{\rm reg},t}\right),\qquad
\mathcal Q_{{\rm exp},t}={\rm PA}\left(\mathcal P^{\rm PA}_{{\rm exp},t}\right), \tag{25}
$$

其中 ${\rm PA}(\cdot)$ 表示 Placement Agent。因此，第 $t$ 次迭代评估的完整提案批次为

$$
\mathcal Q_t=\mathcal Q_{{\rm reg},t}\cup\mathcal Q_{{\rm exp},t}. \tag{26}
$$

非对称次序很重要：探索模式观察到同一迭代中生成的常规提案，因而可避免近似重复的部署集合；而常规模式则保持专注于利用累积的站点特定经验。

任务特定评估器随后处理 $\mathcal Q_t$ 中每个提案并构造已评估提案批次 $\mathcal Y_t$；第 $t$ 次迭代的最佳提案 $\mathcal D^\star_t$ 与其性能摘要 $\mathbf y^\star_t$ 已在第 III-B 节定义。历次最佳布置记录 $\mathcal B_t$ 跨迭代维护，并在反思之后按 (30c) 更新。为支撑站点特定诊断，提供给 Reflection Agent 的上下文构造为

$$
\mathcal C_{{\rm ref},t}=\left(\mathcal Y_t,\mathcal D^\star_t,\mathbf y^\star_t,\mathcal B_t,\mathcal M_t\right). \tag{27}
$$

与布置上下文类似，$\mathcal C_{{\rm ref},t}$ 在提示构造前被压缩，提供给 Reflection Agent 的结构化提示为

$$
\mathcal P^{\rm RA}_{t}={\rm Prompt}\left(\mathcal T_{\rm ref},\ \widetilde{\mathcal C}_{{\rm ref},t},\ \mathcal J_\Omega,\ \mathcal O_{\rm ref}\right), \tag{28}
$$

其中 $\mathcal T_{\rm ref}$ 含 Reflection Agent 的角色、硬性要求与经验提炼指令，$\widetilde{\mathcal C}_{{\rm ref},t}$ 为 $\mathcal C_{{\rm ref},t}$ 的压缩形式，$\mathcal O_{\rm ref}$ 规定结构化反思输出模式。随后生成结构化反思记录：

$$
\mathcal R_t={\rm RA}\left(\mathcal P^{\rm RA}_{t}\right), \tag{29}
$$

其中 ${\rm RA}(\cdot)$ 表示 Reflection Agent。如第 III-B 节所定义，所得反思记录含站点特定诊断 $\mathcal I_t$、可执行指导 $\mathcal G_t$ 与可复用记忆增量 $\Delta\mathcal M_t$。获得 $\mathcal R_t$ 后，优化状态按

$$
\mathcal M_{t+1}={\rm FIFO}\left({\rm Dedup}\left(\mathcal M_t\cup\Delta\mathcal M_t\right)\right), \tag{30a}
$$
$$
\mathcal H_{t+1}={\rm Append}\left(\mathcal H_t,\mathcal Y_t\right), \tag{30b}
$$
$$
\mathcal B_{t+1}={\rm Best}\left(\mathcal B_t,\left(\mathcal D^\star_t,\mathbf y^\star_t\right)\right), \tag{30c}
$$
$$
\boldsymbol\Xi_{t+1}=\left(\mathcal M_{t+1},\mathcal H_{t+1},\mathcal B_{t+1},\mathcal G_t\right) \tag{30d}
$$

从第 $t$ 次迭代转移到第 $t+1$ 次迭代，其中 ${\rm Append}(\cdot)$ 按时间顺序把已评估提案批次追加到历史，${\rm Best}(\cdot)$ 保留所选性能度量取值最佳的部署记录，且 ${\rm Best}(\varnothing,\mathcal B)=\mathcal B$。完整流程汇总于算法 1，其中 $N_{\rm RT}=T(K_{\rm reg}+K_{\rm exp})\le N_{\rm bud}$。

**算法 1　智能体式 BS 部署优化**

输入：场景 $\mathcal S$、部署动作空间 $\Omega_{\rm dep}$、最大迭代数 $T$、提案预算 $K_{\rm reg}$ 与 $K_{\rm exp}$

输出：最佳布置记录 $\mathcal B_{T+1}$

1. 初始化 $\mathcal M_1\leftarrow\varnothing$、$\mathcal H_1\leftarrow\varnothing$、$\mathcal B_1\leftarrow\varnothing$、$\mathcal G_0\leftarrow\varnothing$
2. 置 $\boldsymbol\Xi_1\leftarrow(\mathcal M_1,\mathcal H_1,\mathcal B_1,\mathcal G_0)$
3. **for** $t=1,\dots,T$ **do**
4. 按式 (22) 构造 $\mathcal C_{{\rm reg},t}$
5. 生成 $\mathcal Q_{{\rm reg},t}\leftarrow{\rm PA}\left(\mathcal P^{\rm PA}_{{\rm reg},t}\right)$
6. 按式 (23) 构造 $\mathcal C_{{\rm exp},t}$
7. 生成 $\mathcal Q_{{\rm exp},t}\leftarrow{\rm PA}\left(\mathcal P^{\rm PA}_{{\rm exp},t}\right)$
8. 评估 $\mathcal Q_t=\mathcal Q_{{\rm reg},t}\cup\mathcal Q_{{\rm exp},t}$ 得 $\mathcal Y_t$
9. 选出 $(\mathcal D^\star_t,\mathbf y^\star_t)$
10. 按式 (27) 构造 $\mathcal C_{{\rm ref},t}$
11. 生成 $\mathcal R_t\leftarrow{\rm RA}\left(\mathcal P^{\rm RA}_{t}\right)$
12. 按式 (30a)–(30d) 更新 $\boldsymbol\Xi_{t+1}$
13. **end for**
14. **return** $\mathcal B_{T+1}$

> **原文疑点：** 算法 1 与第 III-C 节均未给出 RT 评估预算 (4d) 的动态检查或提前终止规则，而是末尾假定 $N_{\rm RT}=T(K_{\rm reg}+K_{\rm exp})\le N_{\rm bud}$ 预先成立；若该不等式不成立，算法将在超出预算后仍继续迭代。本译按原文照录并加注。

**脚注（原文）：** ¹ 模式标签 $s$ 为完整性保留，而两种模式共享相同的提案结构。² 任何智能体均不可编辑该评估工具，以避免指标博弈。³ 完整反思上下文的构造见第 III-C 节。

## IV. 数值结果

本节评估所提智能体式站点特定 BS 部署框架，具体回答以下重要问题：1）所提方法能否识别高质量 BS 部署；2）能否用更少 RT 评估达到目标；3）以几何为依据的动作空间、站点特定反思与非对称双模式提案机制对整体性能各有何贡献。

### A. 仿真设置

**1）参数配置与性能度量：** 我们在香港两个真实城市场景中评估所提框架，即湾仔站附近区域（场景 #1）与西营盘站附近区域（场景 #2），如图 3 所示。每个场景的近似水平范围为 $750\,\text{m}\times600\,\text{m}$。假定 BS 仅部署在可行建筑安装表面片上，每个 BS 的天线置于所选平台表面以上 $h_{\rm BS}=10$ m 处。室外 Rx 由地形测量表面表示，该表面竖直平移 $h_{\rm Rx}=1.5$ m 以模拟接收机相对局部地面的高度。我们用 NVIDIA SionnaRT 实现评估器。每个 BS 的发射功率设为 $P_{\rm tx}=44$ dBm，每个发射机追踪 $10^7$ 条样本，最大路径交互深度为 5。除非另有说明，优化迭代数设为 $T=10$，并考虑 $B\in\{1,\dots,6\}$ 个已部署 BS。

仿真采用基于 RSS 阈值的室外覆盖比作为部署目标；需要说明的是，所提框架同样适用于其他部署准则。设 $r_{b,n}(\mathcal X)$ 表示在部署 $\mathcal X$ 下第 $n$ 个地形表面单元从第 $b$ 个 BS 接收到的 RSS（dBm）。该单元的服务 RSS 由最强 BS 关联确定：

$$
r_n(\mathcal X)=\max_{b\in\{1,\dots,B\}}r_{b,n}(\mathcal X). \tag{31}
$$

当某单元的服务 RSS 不小于阈值 $r_{\rm th}=-100$ dBm 时，该单元被视为已覆盖。因此覆盖比定义为

$$
J(\mathcal X;\mathcal S,\mathcal U,\boldsymbol\psi)=\frac{1}{N}\sum_{n=1}^{N}\mathbf 1\{r_n(\mathcal X)\ge r_{\rm th}\}, \tag{32}
$$

其中 $N$ 为地形表面单元总数，$\mathbf 1\{\cdot\}$ 为指示函数。该定义计算全部已部署 BS 的并集覆盖，而评估器另行记录每 BS 覆盖、唯一覆盖与跨 BS 覆盖重叠，以支撑站点特定反思。

在实现中，全部智能体经 Codex SDK 用 GPT-5.5 实例化，并在各自独立的只读线程中运行。搜索覆盖由此前已评估的表面片、建筑、BS 坐标与片组合汇总。跨迭代经验用 all-MiniLM-L6-v2 做语义去重，余弦相似度阈值 0.8，随后按类别最多保留 40 条、并保留 6 条最近反思记录（FIFO）。智能体输出遵循预定义 JSON 模式，并在 RT 评估前接受必填字段、提案模式、部署规模、标识符与数值坐标的校验。详细参数设置列于表 II。

**表 II：** 主要参数。

| 参数 | 取值 |
|---|---|
| $\theta_{\max}$ | $10^\circ$ |
| $h_{\min}$ | 5 m |
| $d_{\rm edge}$ | 1.5 m |
| $A_{\min}$ | 20 m² |
| $\widetilde A_{\min}$ | 1 m² |
| $d_{\min}$ | 20 m |
| BS 发射功率 $P_{\rm tx}$ | 44 dBm |
| BS 安装高度 $h_{\rm BS}$ | 10 m |
| 接收机高度 $h_{\rm Rx}$ | 1.5 m |
| RSS 阈值 $r_{\rm th}$ | −100 dBm |
| 每个发射机的样本数 | $10^7$ |
| 最大路径交互深度 | 5 |
| BS 数 $B$ | 1–6 |
| 迭代数 $T$ | 10 |
| 智能体底层模型 | GPT-5.5 |
| 语义嵌入模型 | all-MiniLM-L6-v2 |
| 语义去重阈值 $\tau_{\rm sem}$ | 0.8 |
| 长期记忆容量 | 每类 40 条 |
| 最近反思反馈容量 | 6 条记录 |
| 智能体上下文中的最大记忆条目数 | 8 |

**图 3：** 所考虑的城市场景：(a) 场景 #1，香港湾仔站附近；(b) 场景 #2，香港西营盘站附近（两场景水平范围约 750 m × 600 m）。

**2）基线：** 我们把所提方法与以下代表性部署策略比较。

- **子模贪心优化 [24]：** 该方法通过贪心最大化单调子模网络效用的边际增益来顺序选择 BS 位置；[24] 建立了其相对全局最优的可证近似保证，因而是一个强基线。但该方法需要把连续部署区域离散化为有限候选位置集，并对每个离散点调用 RT，从而在计算开销与空间分辨率之间带来潜在折中。
- **AutoBS [15]：** AutoBS 把 BS 部署表述为马尔可夫决策过程，训练近端策略优化（PPO）智能体逐步确定 BS 位置；它用 PMNet 作为代理预测站点特定路损图，从而在策略训练中高效评估奖励而无需反复调用 RT。为适配所考虑场景，我们先用自身场景生成的 RT 数据微调 PMNet，再训练策略网络。
- **LLM 辅助 BS 部署（LaBa）[22]：** 在 LaBa 中，LLM 智能体接收可行可部署表面、场景元数据与评估历史的结构化摘要。首次迭代中，它建模数学问题、选择启发式搜索策略，并编写与执行代码以生成 BS 部署提案；该提案经可行性约束校验并由与本文方法相同的 SionnaRT 评估器评估。此后每次迭代，智能体依据数值反馈修改并重执行其启发式，迭代数同样设为 10。与本文框架不同，LaBa 不采用独立反思模块或显式利用–探索划分，而是在单个 LLM 生成的启发式内部隐式完成反馈驱动自适应。
- **启发式：** 我们实现基于粒子群优化（PSO）的 BS 部署搜索方案，其中每个粒子表示 $B$ 个 BS 的一个完整布置；其适应度函数联合考虑覆盖性能、BS 间距离与部署可行性。然而，由于它忽略站点特定信息，需要大量 RT 评估。实现中粒子数与迭代数分别设为 30 与 200。

为公平比较各方法的 RT 开销，我们区分**部署级 RT 查询**与**发射机级 RT 工作量**。一次部署级查询评估一个含 $B$ 个 BS 的完整部署。据此，定义归一化发射机级 RT 工作量为

$$
C_{\rm RT}=\sum_{i=1}^{N_{\rm RT}}\left|\mathcal X_i\right|,
$$

其中 $\mathcal X_i$ 为第 $i$ 次 RT 查询所评估的部署。由于给定任务中考虑的每个部署都含 $B$ 个 BS，所提方法产生 $C_{\rm RT}=BN_{\rm RT}$ 次发射机级 RT 评估。对本文框架，$N_{\rm RT}=T(K_{\rm reg}+K_{\rm exp})$。

### B. 部署策略能否被迭代精化？

图 4 给出三种提案预算设置下最佳至今覆盖比的演化，其中图 4(a)–(c) 分别对应 $K_{\rm reg}=K_{\rm exp}=1,2,3$。在不同已部署 BS 数下，覆盖比在早期迭代中提升，随后逐渐收敛。例如，当 $K_{\rm reg}=K_{\rm exp}=1$、$B=3$ 时，覆盖比从第 1 次迭代的 0.4837 升至第 10 次迭代的 0.6131。还可注意到，增大提案预算可能提高发现更优部署的概率、并减少达到高质量解所需迭代数；但当搜索接近稳定部署结构时，曲线最终表现出递减的改善。这些结果表明，所提框架可在不同提案预算下精化部署策略，而更大预算主要提高在更早迭代即识别出强部署的概率。

为说明站点特定反思反馈如何引导部署精化，我们考察 $B=2$、$K_{\rm reg}=K_{\rm exp}=2$ 的情形（图 4(b)）。第 2 次迭代中比较了两个东侧屋顶候选：二者高程与部署可行性大致相当，但有效可视几何差异显著。位于 $(144.52,-124.77,169.06)$ 的中东部候选给出的唯一覆盖比仅为 0.27%，几乎可忽略，表明局部周边几何很可能限制了其有效可见性。相反，位于 $(211.60,-79.68,179.23)$ 的中东部屋顶与位于 $(-262.99,-143.77,165.86)$ 的西南视点配对时，二者唯一覆盖比分别为 20.64% 与 14.6%，并取得 45.48% 的覆盖比。后续精化因此保留这一互补的东西—西南可视关系，并把西南角色替换为附近更高的屋顶，使覆盖比升至 52.66%。该过程确立了一条重要经验：候选表面片的效用无法仅由其高度、面积或粗略空间扇区推断，而取决于其局部暴露程度以及与其他 BS 尚未服务区域形成互补视角的能力。因此，反思通过区分受不利局部传播条件影响的位置与提供互补空间覆盖的位置来引导精化，而非仅依据目标值盲目扰动坐标。

**图 4：** 不同已部署 BS 数下最佳至今覆盖比随迭代数的变化：(a) $(K_{\rm reg},K_{\rm exp})=(1,1)$；(b) $(2,2)$；(c) $(3,3)$（$B=6$ 至 $B=1$）。

### C. 所提方法能否取得良好覆盖？

我们随后评估所提框架的覆盖性能，并考察提案预算与站点特定反思对最终部署质量的贡献。表 III 与表 IV 报告两个场景的最终覆盖比。除完整框架外，还考虑两种反思消融：**“Pure-value”** 直接返回每个已评估部署的标量覆盖值，而不产生以几何为依据的诊断或可执行指导；**“Disabled”** 则从后续提案生成中移除评估驱动反馈。这些变体使我们能把站点特定反思的收益与仅保留数值性能反馈的收益区分开。

第一，增大每次迭代的提案预算总体上改善最终部署质量。$K_{\rm reg}=K_{\rm exp}=3$ 的设置在 12 个“场景 × BS 数”组合中的 10 个取得最高覆盖。更大的提案批次使 Reflection Agent 面对更多样的部署结果，并提供更多识别有前景 BS 位置的机会，这在联合布置空间随 $B$ 增大时尤为有用。然而改善并非在每种情形下都单调，因为额外提案未必包含更优部署。更重要的是，把 $K_{\rm reg}=K_{\rm exp}$ 从 1 增至 3 使部署级 RT 评估数从 20 增至 60（增至三倍），但在场景 #1 与 #2 中仅分别把平均覆盖改善 1.51 与 1.23 个百分点。这种递减回报表明，较小提案预算已捕获大部分可达覆盖增益，而当部署质量优先于评估成本时，更大预算更为可取。

第二，所提框架一致优于 PSO、AutoBS 与 LaBa 基线。在 $K_{\rm reg}=K_{\rm exp}=3$ 时，它对每个 $B$ 都超过这三个基线中最强者，在场景 #1 与 #2 中平均分别领先 16.90 与 8.69 个百分点。性能提升主要源于对站点特定信息更高效的利用。子模方法提供了更强的参照，因为它系统评估了大量离散化候选集；尽管评估预算大幅更小，本文方法仍在 12 个情形中的 7 个达到或超过该基线，其余情形最大覆盖差距仅 3.07 个百分点。此外，在 $K_{\rm reg}=K_{\rm exp}=3$ 下，本文框架需要 $60B$ 次发射机级 RT 评估，而子模方法需 800 次单发射机评估，从而使工作量从 $B=1$ 时的 92.5% 降至 $B=6$ 时的 55.0%。该比较揭示了所提框架的重要优势：自适应的以几何为依据的搜索可避免穷举离散化带来的“空间分辨率 vs. 评估成本”折中。

> **原文疑点：** 摘要与第 IV-C 节的措辞称所提方法“相对最优解（optimal solution）”达到极具竞争力的覆盖，但该对比对象实为子模贪心基线 [24]——它只具可证的近似保证，并非全局最优解（且其候选集为离散化位置）。本译按原文照录并加注，未改动数据。

第三，消融结果表明主要收益并非仅来自增加已评估提案数。在每个场景中 $B$ 与提案预算的 18 个组合上，启用站点特定反思比反思禁用变体在场景 #1 与 #2 中平均分别改善覆盖 11.27 与 5.12 个百分点；相对 pure-value 变体则分别改善 13.23 与 4.71 个百分点。完整框架在每个测试配置中都取得三种反思设置下的最佳结果。这确认仅靠标量效用不足以实现有效精化：它能说明某部署是否优于另一部署，却无法把观测增益归因于站点特定因素，因而可执行洞见有限。以几何为依据的反思通过把同一次 RT 评估转化为更有信息的布置更新来化解这种歧义。此外，反思的收益还取决于部署决策的复杂度：在场景 #2 中，其相对禁用变体的平均增益在 $B=1$ 与 $B=2$ 时仅为 0.18 与 2.10 个百分点，但在 $B=3$–$5$ 时增至 6.21 至 9.91 个百分点。该趋势表明，当覆盖依赖多个 BS 之间的相互作用（如互补可见性与冗余覆盖）时，反思变得更有价值；而在场景 #1 中，即便 $B$ 较小反思也带来可观增益，说明复杂的站点特定阻塞使以几何为依据的解释更有价值。

总体上，结果揭示了两种互补作用：提案预算控制搜索的广度，而站点特定反思决定每次昂贵评估能被多有效地转化为后续改进。事实上，用更少提案但启用反思可以优于用更多提案但不启用反思；例如在场景 #1、$B=4$ 时，启用反思的 $(1,1)$ 设置达到 70.19%，而反思禁用的 $(3,3)$ 设置仅为 58.17%。因此，资源高效部署不仅取决于评估更多候选，更取决于从已评估候选中提取可执行的站点特定知识。

**表 III：** 场景 #1 中各方法的覆盖比。

| 方法/设置 | 反思 | B=1 | B=2 | B=3 | B=4 | B=5 | B=6 |
|---|---|---|:-:|:-:|:-:|:-:|:-:|
| 子模优化 [24] | – | 41.95% | 55.27% | 65.47% | 71.01% | 75.75% | 79.70% |
| 基于 PSO 的启发式 | – | 28.38% | 30.85% | 40.49% | 46.53% | 44.01% | 58.61% |
| AutoBS [15] | – | 5.24% | 12.36% | 25.87% | 26.66% | 53.87% | 60.35% |
| LaBa [22] | – | 31.46% | 38.54% | 39.76% | 57.57% | 55.04% | 58.02% |
| 本文（$K_{\rm reg}=1,K_{\rm exp}=1$） | 启用 | 41.83% | 55.45% | 61.30% | 70.19% | 73.32% | 73.67% |
| 同上 | 禁用 | 31.46% | 42.59% | 48.36% | 55.53% | 60.01% | 59.47% |
| 同上 | Pure-value | 31.46% | 36.41% | 39.56% | 55.71% | 62.66% | 61.00% |
| 本文（$K_{\rm reg}=2,K_{\rm exp}=2$） | 启用 | 41.87% | 53.19% | 65.58% | 68.29% | 73.72% | 73.86% |
| 同上 | 禁用 | 26.25% | 42.59% | 52.50% | 54.97% | 64.31% | 68.48% |
| 同上 | Pure-value | 31.46% | 38.89% | 44.91% | 58.78% | 61.71% | 68.01% |
| 本文（$K_{\rm reg}=3,K_{\rm exp}=3$） | 启用 | 41.95% | 55.78% | 65.72% | 70.41% | 74.33% | 76.63% |
| 同上 | 禁用 | 36.19% | 38.53% | 55.74% | 58.17% | 74.27% | 64.74% |
| 同上 | Pure-value | 41.85% | 39.37% | 49.17% | 57.61% | 56.63% | 63.81% |

**表 IV：** 场景 #2 中各方法的覆盖比。

| 方法/设置 | 反思 | B=1 | B=2 | B=3 | B=4 | B=5 | B=6 |
|---|---|---|:-:|:-:|:-:|:-:|:-:|
| 子模优化 [24] | – | 40.59% | 59.75% | 68.56% | 76.07% | 79.81% | 82.88% |
| 基于 PSO 的启发式 | – | 36.54% | 48.31% | 42.99% | 51.61% | 48.84% | 53.99% |
| AutoBS [15] | – | 35.35% | 43.71% | 54.09% | 44.14% | 62.74% | 64.11% |
| LaBa [22] | – | 36.02% | 55.66% | 58.14% | 62.8% | 67.87% | 74.76% |
| 本文（$K_{\rm reg}=1,K_{\rm exp}=1$） | 启用 | 40.83% | 59.76% | 65.99% | 74.07% | 78.66% | 81.21% |
| 同上 | 禁用 | 40.66% | 57.97% | 59.34% | 62.47% | 69.20% | 75.85% |
| 同上 | Pure-value | 40.66% | 57.97% | 62.77% | 62.19% | 71.02% | 78.13% |
| 本文（$K_{\rm reg}=2,K_{\rm exp}=2$） | 启用 | 40.88% | 59.96% | 67.51% | 75.32% | 79.62% | 80.92% |
| 同上 | 禁用 | 40.66% | 57.97% | 59.82% | 68.23% | 72.23% | 73.99% |
| 同上 | Pure-value | 40.66% | 57.97% | 64.50% | 67.63% | 71.25% | 78.24% |
| 本文（$K_{\rm reg}=3,K_{\rm exp}=3$） | 启用 | 40.75% | 60.49% | 68.50% | 77.36% | 79.85% | 80.95% |
| 同上 | 禁用 | 40.59% | 57.97% | 64.21% | 66.32% | 74.85% | 78.07% |
| 同上 | Pure-value | 40.66% | 57.97% | 64.71% | 67.63% | 68.09% | 75.82% |

**图 5：** 所提框架最终 $B=3$ 部署下的 RSS 无线电图：(a) 场景 #1；(b) 场景 #2（色标为接收信号强度，单位 dBm；标注 BS1、BS2、BS3）。

### D. 所提方法能否跳出局部最优？

我们接下来考察探索模式能否防止搜索过早集中于狭窄的部署策略集合。为隔离提案分配的作用，固定总预算 $K_{\rm reg}+K_{\rm exp}=4$ 并改变常规与探索提案的分配。设置 $(K_{\rm reg},K_{\rm exp})=(4,0)$ 对应纯利用。

如图 6 所示，把一份提案分配给探索在场景 #1 中一致地改善最终覆盖，相对纯利用平均增益 4.45 个百分点；$B=2$ 与 $B=4$ 时增益尤为显著，分别达 13.06 与 7.28 个百分点。以 $B=2$ 为例，在相同总 RT 预算下覆盖从约 42% 升至 55%。该结果表明，纯利用可能反复精化已有前景的部署模式，而探索引入本不会被考察的替代可部署表面组合。

在场景 #2 中，探索的收益更强烈地依赖 $B$。如图 7 所示，$(3,1)$ 分配对 $B=1$ 与 $B=2$ 改善很小，但对 $B=3$、$B=4$、$B=5$ 分别带来 1.82、6.36 与 1.67 个百分点的增益。当仅部署少量 BS 时，常规模式已能有效搜索相对简单的布置空间；随着 $B$ 增大，可能的 BS 组合数及其覆盖区域间的相互作用变得更复杂，使探索更有价值。

有趣的是，最佳部署一般源于常规模式而非直接来自探索模式。探索的作用是把有信息量的替代方案引入已评估提案池：即使某探索提案本身未被选为最佳解，其 RT 结果也能暴露当前部署模式的局限，并引导后续常规提案走向此前被忽视的区域。因此，探索充当经验引导精化的**催化剂**。

不过，更多探索未必带来更好性能。在固定总预算下，增大 $K_{\rm exp}$ 会减少可用于利用已验证经验的常规提案数；因此偏重探索的设置 $(1,3)$ 可能不及更均衡的分配。这些结果揭示两种模式扮演互补角色：常规模式精化有前景的解，探索模式防止搜索过度集中。较小的探索预算（如 $(3,1)$）在所考虑场景中提供稳健折中。所观察到的对场景与 $B$ 的依赖也表明，未来实现可根据提案相似度或最佳至今性能停滞情况自适应调整 $K_{\rm exp}$。

**图 6：** 固定总提案预算 $K_{\rm reg}+K_{\rm exp}=4$ 时，场景 #1 中探索预算分配的影响。上：不同 $(K_{\rm reg},K_{\rm exp})$ 组合达到的最佳至今覆盖比；下：双模式设置 $(K_{\rm reg},K_{\rm exp})=(3,1)$ 相对纯利用设置 $(4,0)$ 在每个已部署 BS 数下的覆盖增益（图中另标出“陷入局部最优”情形）。

**图 7：** 固定总提案预算 $K_{\rm reg}+K_{\rm exp}=4$ 时，场景 #2 中探索预算分配的影响（上、下两部分的含义同图 6）。

## V. 结论

本文提出一种在有限 RT 评估预算下进行站点特定 BS 部署的资源高效智能体框架。连续的、以几何为依据的动作空间把 BS 生成约束到可行部署表面。在有状态的优化闭环内，Placement Agent 把经验引导精化与探索导向提案生成结合起来，而 Reflection Agent 把结构化 RT 结果与场景几何转化为可执行指导与可复用站点特定经验。两个真实城市场景的结果表明，所提框架优于所考虑的启发式、基于学习与 LLM 辅助方法；相对子模贪心基线也达到极具竞争力的覆盖，同时所需 RT 评估大幅减少。消融结果进一步验证：站点特定反思改善提案质量，而双模式生成保持搜索多样性并有助于跳出局部最优。

## 参考文献（英文原条目，按原文顺序）

[1] C. X. Wang et al., “On the road to 6G: Visions, requirements, key technologies, and testbeds,” *IEEE Commun. Surv. Tutorials*, vol. 25, no. 2, pp. 905–974, Feb. 2023.

[2] H. Yu et al., “Towards robust space- and frequency-domain cooperative distributed-large MIMO systems,” *IEEE Wirel. Commun.*, vol. 32, no. 6, pp. 35–43, Dec. 2025.

[3] J. Liu, M. Sheng, L. Liu and J. Li, “Network densification in 5G: From the short-range communications perspective,” *IEEE Commun. Mag.*, vol. 55, no. 12, pp. 96–102, Dec. 2017.

[4] Z. Wang, Z. Zhou, C. J. Zhao, and Y. Liu, “Generative site-specific beamforming for next-generation spatial intelligence,” *arXiv preprint arXiv:2601.02301*, 2026.

[5] H. Ghazzai, E. Yaacoub, M.-S. Alouini, Z. Dawy and A. Abu-Dayya, “Optimized LTE cell planning with varying spatial and temporal user densities,” *IEEE Trans. Veh. Technol.*, vol. 65, no. 3, pp. 1575–1589, Mar. 2016.

[6] M. Dong, M. Cho, K. Lee, S. Yoon and T. Kim, “Cost-optimal deployment of millimeter-wave base stations under outage requirement,” *IEEE Trans. Wireless Commun.*, vol. 21, no. 12, pp. 10544–10559, Dec. 2022.

[7] H. Qi, L. Xiao, Q. Li, J. Wu and E. W. M. Wong, “Computationally efficient optimal millimeter wave base station deployment,” *IEEE Trans. Veh. Technol.*, Early Access 2026.

[8] Y. Zhang, L. Dai and E. W. M. Wong, “Optimal BS deployment and user association for 5G millimeter wave communication networks,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 5, pp. 2776–2791, May. 2021.

[9] A. Al-Hourani, S. Kandeepan and S. Lardner, “Optimal LAP altitude for maximum coverage,” *IEEE Wireless Commun. Lett.*, vol. 3, no. 6, pp. 569–572, Dec. 2014.

[10] M. Alzenad, A. El-Keyi, F. Lagum and H. Yanikomeroglu, “3-D placement of an unmanned aerial vehicle base station (UAV-BS) for energy-efficient maximal coverage,” *IEEE Wireless Commun. Lett.*, vol. 6, no. 4, pp. 434–437, Aug. 2017.

[11] M. Alzenad, A. El-Keyi and H. Yanikomeroglu, “3-D placement of an unmanned aerial vehicle base station for maximum coverage of users with different QoS requirements,” *IEEE Wireless Commun. Lett.*, vol. 7, no. 1, pp. 38–41, Feb. 2018.

[12] M. Peer, V. A. Bohara, A. Srivastava and G. Ghatak, “User mobility-aware UAV-BS placement update with optimal resource allocation,” *IEEE Open J. Commun. Soc.*, vol. 3, pp. 1853–1866, Oct. 2022.

[13] W. R. Loh, S. Y. Lim, I. F. M. Rafie, J. S. Ho and K. S. Tze, “Intelligent base station placement in urban areas with machine learning,” *IEEE Antennas Wirel. Propag. Lett.*, vol. 22, no. 9, pp. 2220–2224, Sep. 2023.

[14] M. Mallik and G. Villemaud, “EMF aware reinforcement learning for base station deployment using conditional GANs,” *IEEE Access*, vol. 14, pp. 3806–3820, Dec. 2025.

[15] J. Lee, and A. Molisch, “Autobs: Autonomous base station deployment with reinforcement learning and digital network twins,” in *ICML 2025 Workshop on Mach. Learn. Wirel. Commun. and Netw (ML4Wireless)*, 2025.

[16] W. Su et al., “Jointly optimizing deployment and antenna of base stations using hierarchical reinforcement learning,” *ACM Trans. Knowl. Discov. Data*, vol. 20, no. 1, pp. 1–25, Nov. 2025.

[17] L. Wang, H. Zhang, S. Guo, D. Li and D. Yuan, “Learning to deployment: Data-driven on-demand UAV placement for throughput maximization,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 6, pp. 8007–8012, Jun. 2024.

[18] L. T. Hoang, C. T. Nguyen, H. D. Le, and A. T. Pham, “Adaptive 3D placement of multiple UAV-mounted base stations in 6G airborne small cells with deep reinforcement learning,” *IEEE Trans. Netw.*, vol. 33, no. 4, pp. 1989–2004, Jan. 2025.

[19] N. Sevim, M. Ibrahim, and S. Ekin, “Large language models (LLMs) assisted wireless network deployment in urban settings,” in *2024 IEEE 100th Veh. Technol. Conf. (VTC2024-Fall)*, pp. 1–7, Oct. 2024.

[20] Z. Deng, Y. Cai, Q. Liu, S. Mu, B. Lyu, and Z. Yang, “Teleplannet: An ai-driven framework for efficient telecom network planning,” in *2025 IEEE/CIC Int. Conf. Commun. China (ICCC)*, pp. 1–6, Aug. 2025.

[21] K. Qiu, S. Bakirtzis, I. Wassell, H. Song, J. Zhang and K. Wang, “Large language model-based wireless network design,” *IEEE Wireless Commun. Lett.*, vol. 13, no. 12, pp. 3340–3344, Dec. 2024.

[22] Y. Wang et al., “Large language model as a catalyst: A paradigm shift in base station siting optimization,” *IEEE Trans. Cogn. Commun. Netw.*, vol. 11, no. 6, pp. 4313–4327, Dec. 2025.

[23] J. Hou et al., “iPLAN: Redefining indoor wireless network planning through large language models,” *IEEE Commun. Mag.*, vol. 64, no. 4, pp. 158–163, Apr. 2026.

[24] L. Taus, R. Tsai, and J. G. Andrews, “Optimal transmitter placement in realistic urban environments,” *arXiv preprint arXiv:2604.28153*, 2026.

**原文插图：** 原 PDF 中的图 1–7 未重传至本页，仅保留中文图注与图中关键标注（如各场景范围、子图编号、BS1–BS3 标识与图例含义）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.18027v1（eess.SY，13 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–V 节（含 I-A–B、III-A–C（含 A-1/A-2、B-1/B-2）、IV-A–D 等全部小节）、结论、全部图注（图 1–7，含图 4、6、7 的子图/上下面板说明）、表 I–IV（逐格转录）、算法 1、公式 (1)–(32)（含 (4a)–(4d)、(30a)–(30d)）、原文 3 条脚注与 24 条参考文献英文原条目；原文无附录、无作者简介。**逐句终校未做**：表 I（32 项记号）、表 II（19 项参数）、表 III/IV（各 13 行 × 8 列覆盖比）均已用 PDF 页面渲染逐格核对；式 (5)–(12)、(22)–(30d) 亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①摘要称与“optimal solution”对比，但实际最强对比对象为子模贪心基线 [24]（具近似保证，非全局最优）；②算法 1 与 §III-C 未给出 RT 评估预算 (4d) 的动态检查/提前终止规则，而是假定 $T(K_{\rm reg}+K_{\rm exp})\le N_{\rm bud}$ 预先成立。均按原文照录，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
