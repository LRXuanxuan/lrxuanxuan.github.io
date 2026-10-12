---
layout: page
title: "SigMap：以地图作为提示的跨场景无线定位基础模型——全文中译"
permalink: /papers/translations/2026-10-12-sigmap-full-zh/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文条目](/papers/items/2e094f4029e01a73/) · [原论文 PDF](https://arxiv.org/pdf/2607.15713v1)

# 以地图作为提示：面向跨场景无线定位的多模态空间—信号基础模型学习

**原题：** Map as a Prompt: Learning Multi-Modal Spatial-Signal Foundation Models for Cross-Scenario Wireless Localization  
**作者：** Yong Chu、Xun Zhou（通讯作者）、Zenglin Xu、Hui Wang、Yue Yu  
**单位：** 哈尔滨工业大学（深圳）、鹏城实验室、上海人工智能科学研究院、复旦大学人工智能创新与孵化研究院  
**版本：** ICLR 2026 会议论文；arXiv:2607.15713v1，17 页。

> 按原论文顺序译出摘要、正文第 1–5 节、致谢、A–C 附录与全部公式、表格及图题；为方便检索，正式参考文献保留英文作者与题名。原文存在若干数值及配置不一致之处，译文按原样保留并在文末标明，不擅自修正。图形链接官方 PDF，博客不重新托管 PDF 或图片。

## 摘要（Abstract）

准确、鲁棒的无线定位是自动驾驶、扩展现实以及智能制造等新兴 5G/6G 应用的关键支撑。尽管无线定位十分重要，但无线信号具有复杂特征且对环境变化敏感，因而要在多种环境中实现准确定位仍然具有挑战。现有数据驱动方法通常泛化能力有限，需要大量标注数据，并且难以适应新场景。为解决这些局限，本文提出 **SigMap** 多模态基础模型，包括两项关键创新：（1）**周期自适应掩码策略**，根据无线信道的周期性特征动态调整掩码模式，以学习鲁棒的无线表征；（2）**“地图作为提示”（map-as-prompt）框架**，通过轻量级软提示融入三维地理信息，以实现有效的跨场景适配。大量实验表明，模型在多种定位任务上实现了先进性能，并在未见过的环境中表现出较强的零样本泛化能力，明显优于监督和自监督基线方法。

## 1 引言（Introduction）

无线定位技术经历了从经典模型驱动方法到数据驱动深度学习，再到基础模型和大语言模型（LLM）范式的演进。尽管取得了上述进展，现有技术在复杂环境中仍然面临显著困难，尤其是在非视距（NLoS）及丰富多径场景中，表征学习和环境推理的局限尤为突出。

传统定位系统利用到达时间（ToA）、到达时间差（TDoA）、到达角（AoA）和接收信号强度（RSS）等几何或信号强度测量（Chen et al., 2022a），并广泛采用 MUSIC、OMP 等经典参数估计算法（Keskin et al., 2021）。然而，模型驱动方法通常假定理想传播条件，在具有显著多径和 NLoS 效应的城市环境中表现欠佳，有时产生超过 100 m 的定位误差（Chen et al., 2024）。虽然已有研究通过滤波或硬件增强缓解 NLoS 影响（Huang et al., 2023；Zhou et al., 2019），却往往忽略来自地图或信道特征的更丰富的环境语义信息。

为解决这些问题，人们广泛探索数据驱动方法。多层感知机（MLP）、卷积神经网络（CNN）以及长短期记忆网络（LSTM）等监督模型，直接学习由信道状态信息（CSI）到用户位置的映射（Gao et al., 2023；Wu et al., 2021；Chen et al., 2023）。这些方法在特定场景中可能有效，却依赖规模较大的标注数据，并在跨环境泛化上存在局限（Pan et al., 2025）。随后出现的半监督和无监督方法利用自动编码器、GAN 和领域自适应降低标注开销（Ruan et al., 2023；Chen et al., 2022b；Junoh & Pyun, 2024；Li et al., 2021），但通常难以学习到具备高层次环境语义、鲁棒且可迁移的表征。

近期研究受到自然语言处理和计算机视觉成功经验的启发，开始采用自监督学习（SSL）与基础模型。LWM（Alikhani et al., 2024）和 WirelessGPT（Yang et al., 2025）通过掩码信道建模学习通用信道表征，对比学习框架则提取不变信道特征（Salihu et al., 2024）。然而，这些模型并非专门面向定位，往往缺乏任务感知的语义理解。CrowdBERT（Han et al., 2024）和信号引导掩码自编码器（Wang et al., 2025）等自监督框架更直接地面向定位，采用掩码策略重构 RSS 或信道冲激响应（CIR），但常受限于特定配置，并依赖单一自监督目标，限制了学得特征的多样性和泛化能力。

与此同时，LLM 被引入无线通信领域。例如 WirelessLLM（Shao et al., 2024）通过提示工程和检索增强生成纳入领域知识。虽然 LLM 在高层次协议推理方面有用，但低层次信号处理仍是难点；当其用于基于信道的推断时，还可能产生幻觉，因此不适合直接承担高精度定位任务。

### 1.1 研究缺口（Research Gaps）

现有无线定位方法有两个基本局限。第一，**没有充分处理信号周期性**：自监督方法通常采用通用掩码策略，忽略 CSI 内在的循环模式，使模型容易利用局部周期结构进行“捷径学习”，而不是理解信号传播的全局表征。第二，**地理信息融合过于浅层**：即便引入基础地图数据，也常常没有捕捉三维环境中丰富的空间拓扑关系；几何约束与信道表征融合得不充分，可解释性较弱。

### 1.2 本文贡献（Contributions）

本文从三个方面填补上述缺口。

- **周期自适应掩码建模。** 计算 CSI 不同行之间的互相关，并生成考虑位移的掩码模式，使掩码动态适应 CSI 周期性，破坏模型利用周期重复的捷径，促使其学习具有全局意义的传播表征。
- **地图条件提示调优。** 通过图神经网络编码三维地图信息，形成地理提示；在微调过程中将环境约束以可解释的方式引入模型，提升复杂多径环境下的定位精度。
- **参数高效泛化。** 使用有限标注数据达到先进性能，并对未见过的环境和基站配置表现出较强的泛化能力。

## 2 预备知识（Preliminaries）

本节介绍无线信道建模的核心概念，并正式定义定位问题。这些物理原理将直接用于地理提示调优。

### 2.1 用于定位的无线信道建模

本文的基本假设是 CSI 包含发射端与接收端之间的几何关系。图 1 表明，无线信号经由视距（LoS）及非视距（NLoS）路径传播，在 CSI 数据中形成独特的空间指纹。

**图 1：城市环境中的无线传播路径（原文第 3 页）。** LoS 代表直接传播，NLoS 路径来自反射或绕射；右下方小图给出相应的三维地图，具有用于生成提示的相同 LoS/NLoS 拓扑。[查看图 1](https://arxiv.org/pdf/2607.15713v1#page=3)

对于具有 Nt 根发射天线、Nr 根接收天线的 MIMO-OFDM 系统，第 k 个子载波上的 CSI 矩阵 H[k]（尺寸 Nr × Nt）可写为 LoS 与 NLoS 分量之和：

> **式（1）：** H[k] = α_LoS · exp(−j2π τ_LoS f_k) · a_r(θ^r_LoS) a_t(θ^t_LoS)^H + Σ_(l=1)^(L_NLoS) α_l · exp(−j2π τ_l f_k) · a_r(θ^r_l) a_t(θ^t_l)^H。

其中 L_NLoS 为 NLoS 多径数量，α_l 和 τ_l 为第 l 条路径的复增益与时延，f_k 为第 k 个子载波的频率，a_r(θ^r_l) 和 a_t(θ^t_l) 分别是收端与发端的阵列导向向量。

用于定位的关键洞见在于：式（1）中的每条传播路径都含有几何信息。单基站定位之所以可行，是因为 CSI 含有与距离相关的时延信息以及角度信息，足以形成空间约束向量。多径效应提供多组约束，即使缺少精确的时间测量，也可实现粗略定位。多基站则可提供不同的空间观察视角，使可利用的信息更丰富。

### 2.2 射线追踪与地图对齐（Ray-Tracing and Map Alignment）

本文使用射线追踪生成能够描述物理几何与无线信道映射关系的训练数据，其过程可抽象为：

> **式（2）：** (p_BS, p_UE, M) —射线追踪→ H_CSI。

其中 p_BS 是基站位置，p_UE 是用户位置，M 是三维环境地图。地图 M 有两项关键作用：（1）生成符合物理传播规律的训练数据；（2）在推理期间提供几何约束，以解决多径带来的歧义。上述对齐过程有助于将原始 CSI 分解为 LoS 与 NLoS 分量；本文模型通过地理提示调优隐式学习这一过程。

### 2.3 问题定义：无线定位（Problem Formulation）

将无线定位定义为：根据信道测量与环境上下文估计用户设备位置。输入包括一个或多个基站采集的 CSI 张量 H（Nr × Nt × Nsc 复值）、包含建筑几何的三维地图 M，以及 T 个基站的位置集合 P_BS = {p_BS^(1), …, p_BS^(T)}；输出为三维位置估计 p̂_UE ∈ R³。目标是学习映射 f_θ 以最小化：

> **式（3）：** E[ || f_θ(H, M, P_BS) − p_UE ||₂ ]。

纳入地图 M 是该方法与传统纯 CSI 定位方法的主要区别，能够实现更精确、物理一致性更强的定位。

## 3 方法（Methodology）

### 3.1 整体框架（Overall Framework）

所提出的无线定位基础模型旨在以尽可能少的标注数据，在多种环境中实现精确定位。框架采用两阶段学习范式：先在无标注 CSI 上进行自监督预训练，再针对具体定位任务进行基于提示的微调。这使模型得以学习通用无线传播表征，并高效适应新环境。

图 2 所示框架有三个核心组成部分：（1）基于 Transformer 的主干网络，用于捕获 CSI 中的长距离依赖；（2）防止周期信号捷径学习的周期自适应掩码建模策略；（3）微调期间引入环境约束的地理提示调优机制。创新重点是根据信号周期性动态调整掩码，以及利用地图条件提示，在仅更新极少参数的情况下完成环境适配。

**图 2：无线定位基础模型的整体架构（原文第 4 页）。** 预训练阶段将原始信道数据送入主干，使用条带掩码和网格掩码的重构解码器；微调阶段则由包含基站位置的三维地图经 GNN 生成提示词元，并针对单基站、多基站等任务配置输出头。[查看图 2](https://arxiv.org/pdf/2607.15713v1#page=4)

### 3.2 信号表示与预处理（Signal Representation and Preprocessing）

无线 CSI 描述多径、衰落和空间分集等传播特征。对于多天线 OFDM 系统，信道频率响应可表示为复值张量：

> **式（4）：** H ∈ C^(Nr × Nt × Ns)。

其中 Nr、Nt、Ns 分别是接收天线数、发射天线数和子载波数；h_(i,j)[k] 表示某天线对在对应子载波上的复信道增益。为了在保留关键相位信息的同时便于深度学习处理，作者采用实部与虚部分通道的方式将复值 CSI 转为实值表示：

> **式（5）：** X = [Re(H), Im(H)] ∈ R^(2 × Nr × Nt × Ns)。

该表示保留精确定位所需的空间和频率分集信息，并兼容标准神经网络运算。

### 3.3 周期自适应掩码建模（Cycle-Adaptive Masked Modeling）

无线信号具有内在的周期模式，因此传统掩码自编码方法容易利用周期重复来完成任务，形成捷径学习。本文的掩码策略根据输入信号动态生成掩码，破坏周期结构，同时保留具有语义意义的信息。

核心方法是检测 CSI 的主导周期，并生成一种无法通过简单插值轻易恢复的掩码。对每个输入样本，通过互相关分析计算位移模式，再形成自适应掩码：

> **式（6）：** M_cycle[i,j] = 0，当 |j − (j₀ + i·d_final)| ≤ w；其他位置为 1。

其中 d_final 为检测出的周期位移，j₀ 是起始偏移，w 控制掩码带宽。该方法迫使网络学习有意义的传播表征，而不是直接利用重复图案进行重构。

**图 3：周期自适应掩码示例（原文第 5 页）。** 左侧是原始 CSI 幅度信息及其周期性，右侧展示由其动态生成的掩码模式；中间展示条带掩码与网格掩码的信道频率响应。[查看图 3](https://arxiv.org/pdf/2607.15713v1#page=5)

重构训练的目标是从被遮掩输入恢复原始信号：

> **式（7）：** L_MAE = E_X[ ||X − f_θ,dec(X_masked)||₂ ]。

### 3.4 地理提示调优（Geographic Prompt Tuning）

预训练后，模型利用三维环境模型中的地理信息开展参数高效微调。关键创新在于将建筑物与基站之间的空间关系变成一组可学习提示词元，从而在不更新核心网络参数的条件下指导预训练模型。

**算法 1：地理提示生成（Geographic Prompt Generation）**

1. 输入三维地图 M 与基站位置集合 P_BS。
2. 由顶点 MLP 将建筑顶点 v 编码为初始向量 h_v^(0)；由基站 MLP 将 p_BS 编码为 h_BS^(0)。两组向量合并为初始图节点表示。
3. 连续执行两层图卷积。对每层 l 和每个节点 i，根据自身前层表示及邻域 N(i) 的聚合表示，经可训练矩阵 W^(l)、U^(l) 和非线性激活 σ 更新 h_i^(l)。
4. 对最终图节点表示执行全局均值池化，得到整体地图嵌入 g。
5. 使用投影 MLP 将 g 投影到提示向量 g_prompt，并返回该向量。

**图 4：地理提示生成流程（原文第 6 页）。** 输入三维坐标，利用 Delaunay 三角剖分建立含建筑顶点与基站的图，经 MLP、两层 GCN、全局均值池化及投影层生成提示词元。[查看图 4](https://arxiv.org/pdf/2607.15713v1#page=6)

流程从构建表征场景空间配置的异构图 G=(V,E) 开始。三维建筑网格地图 M 由顶点 {v_i} 表示，每个顶点 v_i∈R³；另有 T 个基站位置 {p_t}，每个 p_t∈R³。图的节点集合是建筑顶点与基站位置的并集：V={v₁,…,v_V}∪{p₁,…,p_T}。为体现三维空间中的临近关系，利用节点集合上的 Delaunay 三角剖分构建边集：E={(i,j)：节点 i、j 在三角剖分中相连}。

每一层图卷积网络（GCN）的更新规则为：

> **图卷积更新：** H^(l+1) = σ[ D̃^(−1/2) Ã D̃^(−1/2) H^(l) W^(l) ]。

其中 Ã = A + I 表示添加自环后的邻接矩阵，D̃ 是 Ã 的度矩阵，W^(l) 是第 l 层的可训练权重。

生成的地理提示 g_prompt∈R^(D_p) 被并入预训练 Transformer 的输入序列，具体方式是将它插入原有序列的前部。完整输入 T_input∈R^((1+1+L)×D) 由冻结的分类词元 t_cls、可训练的地理提示词元 T_geo=g_prompt（仅一个提示时），以及冻结的 CSI 测量词元序列 T_CSI 构成，再加上冻结的位置编码 E_pos：

> **输入序列：** T_input = [t_cls ; T_geo ; T_CSI] + E_pos。

自注意力在扩展后的序列上运行。查询、键和值由冻结的预训练矩阵得到：Q=T_input W_Q、K=T_input W_K、V=T_input W_V；注意力输出为 softmax(QKᵀ/√d_k)V。

该方法的关键优势是参数效率。微调时只更新 GNN 的参数 θ_gnn、投影 MLP 的参数 θ_proj 和任务头参数 θ_task；对应的优化目标为：

> **微调目标：** min_(θ_gnn,θ_proj,θ_task) E_((X,M,P_BS,y)∼D_task) [ L_task(f(X,M,P_BS), y) ]。

其中完整前向过程定义为 f(X,M,P_BS)=f_(θ_task)(f_(θ_enc)([T_geo;T_CSI]))。

### 3.5 面向具体任务的适配（Task-Specific Adaptation）

针对不同定位场景设计专用输出头。单基站定位直接通过简单 MLP，由最终的 [CLS] 词元预测用户位置：

> **式（8）：** p̂_UE = MLP_single(t_cls ; W_single)。

多基站场景采用注意力融合机制，将所有可用基站的信息动态整合。首先提取 T 个基站各自的 [CLS] 词元并堆叠为 B∈R^(T×D)，再通过可学习注意力函数计算每个基站的权重 α_t：

> **式（9）：** α_t = exp(vᵀ tanh(W_attn t_cls^(t))) / Σ_(j=1)^T exp(vᵀ tanh(W_attn t_cls^(j)))。

各基站的 [CLS] 词元经各自的 MLP 头输出初始位置估计，再以注意力权重融合：

> **式（10）：** p̂_UE = Σ_(t=1)^T α_t · MLP_multi(t_cls^(t); W_multi^(t))。

该机制可根据信号质量及基站几何配置动态调整各基站的贡献，使信号较强或几何关系更有利的基站获得较大权重。整体框架展示了如何结合自监督预训练与地理提示调优，在保持参数高效及实际部署可行性的同时，实现跨环境鲁棒定位。

## 4 实验（Experiments）

实验关注四个问题：（1）与先进方法相比性能如何？（2）地理信息带来多大作用？（3）周期自适应掩码是否有效？（4）模型在新环境中的泛化表现如何？

### 4.1 数据集与评价指标

本文在 DeepMIMO 数据集（Alkhateeb, 2019）上开展评估，预训练与微调均使用 O1 3p5 城市场景。数据集由射线追踪仿真生成，提供具有真实传播特征的 CSI。详细配置见附录 B.3。评价指标为平均绝对误差（MAE）、均方根误差（RMSE）及 1 m 范围内误差累计概率（CDF@1m）。结果均取五次独立运行的平均值。

### 4.2 主要结果

基线包括 OMP（压缩感知）、CNN、SWiT（Salihu et al., 2024）和 LWLM（Pan et al., 2025）。单基站 NLoS 定位是一种较困难的场景。表 1 显示，带地图的 SigMap 达到 MAE=1.564 m、RMSE=5.675 m、CDF@1m=60.5%，相对于最佳基线 LWLM 的 MAE 降低 34.4%，CDF@1m 提高至两倍以上。

作者将优势归因于显式建模多径传播的 NLoS 感知注意力机制，其针对不同传播路径分配权重：

> **式（11）：** α_i = exp(φ_o,s^(i)·W_NLoS) / Σ_j exp(φ_o,s^(j)·W_NLoS)。

该机制帮助网络区分直接传播路径与反射路径，从而降低定位歧义。

**表 1：单基站定位指标。**

| 方法 | MAE（m） | RMSE（m） | CDF@1m（%） |
|---|---:|---:|---:|
| SigMap（含地图） | 1.564 | 5.675 | 60.5 |
| SigMap（无地图） | 2.275 | 8.532 | 31.0 |
| LWLM | 2.382 | 5.822 | 25.3 |
| SWiT | 2.586 | 8.967 | 24.3 |
| CNN | 2.943 | 9.423 | 21.7 |
| OMP | 3.287 | 9.851 | 15.4 |

多基站协作利用空间分集克服 NLoS 的局限。表 2 显示，带地图 SigMap 在四基站协作定位中达到 MAE=0.673 m、RMSE=1.099 m 和 CDF@1m=84.5%。相比次优方法（无地图 SigMap），MAE 改善 14.7%，CDF@1m 高 7.0 个百分点。图 5 从多项指标可视化性能，定位误差 CDF 见附录 B.5。

**表 2：四基站协作定位指标。**

| 方法 | MAE（m） | RMSE（m） | CDF@1m（%） |
|---|---:|---:|---:|
| SigMap（含地图） | 0.673 | 1.099 | 84.5 |
| SigMap（无地图） | 0.789 | 1.285 | 77.5 |
| LWLM | 0.828 | 1.178 | 75.6 |
| SWiT | 1.102 | 1.368 | 68.1 |
| CNN | 1.398 | 1.731 | 59.3 |
| OMP | 1.685 | 2.089 | 50.6 |

### 4.3 周期自适应掩码的有效性

表 3 对比不同掩码策略。周期自适应掩码达到最佳整体权衡：MAE=0.673 m，CDF@1m=84.5%，优于固定网格或固定条带掩码。通过动态破坏 CSI 周期图案，网络被迫学习可泛化特征，而非依赖捷径插值。

**图 5：各项性能指标的综合比较（原文第 9 页）。** 所提出方法在精度和鲁棒性等方面具有一致优势。[查看图 5](https://arxiv.org/pdf/2607.15713v1#page=9)

**表 3：周期自适应掩码策略的效果。**

| 方法 | MAE（m） | RMSE（m） | CDF@1m（%） |
|---|---:|---:|---:|
| 仅网格掩码 | 0.770 | 1.176 | 80.3 |
| 仅条带掩码 | 0.753 | 0.972 | 75.3 |
| 自适应掩码 | 0.673 | 1.099 | 84.5 |

### 4.4 地图提示消融实验

为量化地图质量的作用，作者对比（i）完整三维建筑网格、（ii）二维俯视多边形及（iii）不使用地图（仅 CSI）的结果。二维版本除去建筑高度信息外，沿用与三维版本相同的处理流程。因此，两者之间的差异主要来自缺失高度与建筑立面法向信息。

二维与三维地图的消融示例在图 1 并列给出。误差条高度接近表明，即使缺少垂直方向的详细信息，大部分拓扑收益仍能保留。作者由此提出一种后续拓展方向：可以使用街景照片作为视觉提示来补充立面与纹理特征，为环境提示提供低成本途径。

表 4 汇总结果：相对于完整三维网格，二维俯视图的 MAE 恶化约 8%，说明多数收益来自拓扑与 LoS 特征，提示机制对一定程度的几何简化较为鲁棒。

**表 4：使用不同地图模态的单基站定位。**

| 方法 | MAE（m） | RMSE（m） | CDF@1m（%） |
|---|---:|---:|---:|
| SigMap（三维地图） | 1.564 | 5.675 | 60.5 |
| SigMap（二维俯视图） | 1.692 | 6.128 | 55.7 |
| SigMap（无地图） | 2.275 | 8.532 | 31.0 |

### 4.5 向新环境泛化

作者使用两套预训练阶段完全未见过的射线追踪场景评估泛化能力：（i）DeepMIMO O2；（ii）WAIR-D（Huangfu et al., 2022）的 Scenario-2，即从 OpenStreetMap 获取的 100 个真实城市场景。图 6 给出 WAIR-D 的典型复杂环境，包括高密度城市峡谷与不规则建筑轮廓，具有明显的跨域迁移挑战。

所有实验仅用目标场景的少量样本（每场景约 100 个实例）微调下游任务头，**自监督主干保持冻结**。这一设置属于小样本学习，体现模型快速适应新环境的能力；因此，正文实验条件并非严格意义上无需任何目标场景标注的零样本迁移。

**图 6：WAIR-D 的两类典型复杂场景（原文第 10 页）。** [查看图 6](https://arxiv.org/pdf/2607.15713v1#page=10)

**新场景泛化实验表（原文第 10 页）。**

| 场景与方法 | MAE（m） | RMSE（m） | CDF@1m（%） |
|---|---:|---:|---:|
| DeepMIMO O2：SigMap（含地图） | 1.026 | 1.551 | 66.4 |
| DeepMIMO O2：SigMap（无地图） | 1.282 | 5.824 | 63.9 |
| DeepMIMO O2：LWLM | 2.213 | 11.837 | 63.2 |
| WAIR-D Scenario-2：SigMap（含地图） | 1.880 | 3.717 | 58.0 |
| WAIR-D Scenario-2：SigMap（无地图） | 2.578 | 4.650 | 51.5 |
| WAIR-D Scenario-2：LWLM | 3.375 | 6.921 | 50.3 |

作者在紧随表格的叙述中再次报告：带地理提示的 SigMap 在 DeepMIMO O2 上 MAE 为 1.026 m，在 WAIR-D Scenario-2 上为 **1.580 m**，较 LWLM 分别改善 53.2% 和 44.3%，同时仅更新 0.4% 的参数。以上文字中的 1.580 m 与表中 **1.880 m** 不一致，译文保留原稿两处数字，不进行静默更正。原文认为，利用环境特定提示生成机制，模型能够在不同无线环境中获得良好的迁移性能。

### 4.6 参数效率（Parameter Efficiency）

**表 5：实验设置下的训练成本。**

| 阶段 | 可训练参数数量 | 每轮时间 | 总时间 |
|---|---:|---:|---:|
| 预训练 | 11.730 M | 10.8 min | 36 h |
| 微调 | 0.085 M | 1.8 s | 30 min |
| 推理 | — | 0.83 ms/样本 | — |

根据附录 B 所述设置，作者首先预训练 200 个 epoch，再微调 1000 个 epoch；由于微调只激活全部参数的 0.7%，整个 1000-epoch 微调阶段仅耗时约 30 min，同时保留预训练阶段学到的丰富表征，体现较高的参数效率。需要注意：这一处的 0.7% 与上一节的 0.4% 以及附录 B.2 的训练 epoch 数量并不完全一致，均按原稿分别保留。

## 5 结论（Conclusion）

本文提出一种无线定位基础模型，利用周期自适应掩码和地理提示调优达到先进性能。方法在单基站和多基站任务中都表现出较好的定位精度，并能较为鲁棒地泛化到此前未见过的地理场景。

未来将探索两个方向：一是超越定位任务，扩展为服务于信道估计、波束成形和其他信号处理任务的通用无线基础模型；二是在三维地图不完整或不可用时，将图像和点云等视觉模态与无线信号结合，生成更丰富的环境表示。这些进展有望使无线感知系统更加通用和实用，并支持智能基础设施与移动计算等新兴应用。

## 致谢（Acknowledgments）

本研究部分受到中国国家自然科学基金（62472125）、广东省基础与应用基础研究基金（2025A1515011258）、广东省重点领域研发计划（2026B0909060001）和深圳市科技计划（GXWD20231128102922001、ZDCY20250901111705007、ZDSYS20230626091203008）资助；同时获得鹏城实验室重大重点项目（PCL2024A08）的支持。

## A 作者声明（Statements）

### A.1 大语言模型使用声明（Use of LLMs Statement）

作者主要使用大语言模型工具润色语言与提供措辞建议。所有技术内容、实验设计和科学解释均由作者构思、审阅并批准。

### A.2 可复现性声明（Reproducibility Statement）

为促进结果复现，作者将从数据集生成、模型预训练、微调到评估脚本的完整流程整合到一个匿名 GitHub 仓库：[SigMap_anonymous](https://anonymous.4open.science/r/SigMap_anonymous-838D)。

## B 实验详细设置（Detailed Setups of Our Experiments）

### B.1 计算资源（Compute Resources）

实验在具有以下规格的计算服务器上完成：6 块 NVIDIA A800 80GB PCIe GPU；单卡显存 80 GB，总显存 480 GB；驱动版本 550.144.03；CUDA 版本 12.4。A800 GPU 为大规模 Transformer 训练以及含复杂位移模式增强的高维 CSI 数据处理提供了必要计算能力。

### B.2 通用配置（General Configurations）

模型以复值 CFR 矩阵 H_s 为输入。为方便神经网络处理，将其分解为幅度和相位两个分量，并表示为：

> **式（12）：** H̄_s = [|H_s|, ∠H_s] ∈ R^(2×N_ant×N_subc)。

H̄_s 是尺寸为 (2,N_ant,N_subc) 的三维张量，第一维分别代表幅度和相位。尽管 H̄_s 指特定输入格式，论文为记号统一，后文仍使用 H_s 泛指输入信道数据的通用表示。

作者采用面向无线信道建模与定位的 Transformer 编码器—解码器结构。主要配置为：输入尺寸 B×C×T×F，其中批量大小 B=32，通道数 C=2（实部/虚部），时间/天线维度 T=128，频率/子载波维度 F=32；编码器使用具有位置编码的多头自注意力层；解码器使用交叉注意力机制预测坐标；隐表示维度为 512。

**表 6：训练超参数。**

| 参数 | 数值 |
|---|---|
| Batch size | 32 |
| 优化器 | Adam |
| 学习率 | 1×10⁻⁴ |
| 权重衰减 | 1×10⁻⁵ |
| 训练 epoch | 300 |
| 梯度裁剪 | 1.0 |
| 学习率策略 | 余弦退火 |
| 预热 epoch | 10 |

### B.3 数据集参数（Dataset Parameters）

**表 7：DeepMIMO 数据集配置。**

| 参数 | 预训练 | 微调 |
|---|---|---|
| 场景 | O1 3p5 | O1 3p5 |
| 基站数量 | 4 | 4 |
| 基站 ID | [3,4,9,10] | [3,4,9,10] |
| 频带（MHz，按原表标注） | [10,20,50] | 10 |
| 带宽（GHz） | [0.01,0.02,0.05] | 0.01 |
| 子载波数量 | 128 | 128 |
| 天线单元数 | 32 | 32 |
| 用户分布 | 均匀 | 随机 |
| 用户下采样率 | 100% | 2% |
| 路径数 | 5 | 5 |
| CSI 样本数 | 480,000 | 12,000 |
| 训练/验证/测试划分 | 原表显示“10,000/1,000/10,00”，疑有排印缺失 | 原表未完整对齐，见下文明确叙述 |

预训练数据的关键参数为：场景 O1 3p5（城市室外），启用基站 3、4、9、10；频带 10、20、50 MHz；天线为 32 单元均匀线阵；选取全部 128 个子载波；覆盖完整用户行（5200 个用户）。每个样本包含复信道数据（实部与虚部）、用户与基站位置、LoS 状态、距离及出发角参数。

微调数据与预训练数据属于同一环境场景，但采用不同采样策略：只使用 10 MHz 频带；从可用用户中下采样 2%；训练、验证、测试分别为 10,000、1,000、1,000 条样本；仅保留具有有效路径信息的样本。数据集在保持真实用户分布模式的同时，充分覆盖环境，为模型评估提供基础。

### B.4 数据增强实验细节（Details of Data Augmentation Experiments）

CSI 幅度数据常因射频链硬件特性（如天线间距和载波频率）而表现出周期性。例如，在均匀线阵中，不同天线间的信道响应可能每隔固定数量的天线单元重复。在基于视觉 Transformer（ViT）的掩码自编码器（MAE）重构信道数据时，如果只遮掩部分行或列，模型便可能轻易学习表面的周期性模式，无法从冗余信息中提取全局特征。

为解决这一问题，作者采用经典时序分析方法：计算 CFR 矩阵每一行与下一行之间的互相关系数。由于行长度相同，直接计算会存在显著边界效应。为减轻该问题，只比较有效的重叠区域，避免边界伪影。示例中的行位移可能为正、负或零（例如 d=8、d=−3、d=0，见图 7），由此促成自适应掩码设计。

当带宽等于逐行位移幅度时，相邻掩码带首尾连接，形成无缝的连续斜向条带。这是实现连续实心掩码所需的最小临界带宽。位移模式增强可形式化为：

> **式（13）：** M_shift = GenerateShiftMask(d, N_a, N_s, T, F)。

其中 d 是控制位移方向和大小的斜率参数；N_a 为基于天线的掩码数量（8），N_s 为基于子载波的掩码数量（32）；T 为时间维度尺寸（128），F 为频率维度尺寸（32）。

算法执行以下步骤。**1. 参数初始化：** 带宽 bw=|d|，半带宽 hw=⌊bw/2⌋，填充量 P=hw。**2. 矩阵填充：** 将频率维扩展为 F_padded=F+2P（式 14）。**3. 基于天线的掩码生成：** 对 i=1,…,N_a，随机生成起始列 c₀∼U(0,F)（式 15）；计算列位置 c(t)=c₀−t·d+P（式 16）；对应掩码带 B(t)=[c(t)−hw,c(t)+hw]∩[0,F_padded]（式 17）。**4. 基于子载波的掩码生成：** 对 j=1,…,N_s，随机选择起始行 r₀∼U(0,T)（式 18）；计算列位置 c(t)=(t−r₀)(−d)+P（式 19）；对应掩码带 B(t)=[c(t)−hw,c(t)+hw]∩[0,F_padded]（式 20）。**5. 应用掩码：**

> **式（21）：** X_augmented = X⊙M + (1−M)⊙T_mask。

其中 T_mask 表示可学习的掩码词元。

**图 7：不同位移模式下的 CSI 幅度热力图（原文第 15 页）。** [查看图 7](https://arxiv.org/pdf/2607.15713v1#page=15)

### B.5 定位误差 CDF 曲线（Localization Error CDF Curves）

定位误差累计分布函数（CDF）衡量定位误差不超过指定距离的概率，是第 4.2 节比较不同方法精度和鲁棒性的关键指标。图 8 和图 9 分别绘制单基站与四基站协同场景中的 CDF 曲线。曲线越陡、1 m 位置的 CDF 值越高，表示表现越好。带地图 SigMap 在这两种场景中分别取得 CDF@1m=60.5% 和 84.5%，明显优于各基线。

**图 8：单基站定位性能比较（原文第 16 页）。** [查看图 8](https://arxiv.org/pdf/2607.15713v1#page=16)  
**图 9：多基站定位性能比较（原文第 16 页）。** [查看图 9](https://arxiv.org/pdf/2607.15713v1#page=16)

## C 信道数据的特征（Characteristics of Channel Data）

无线 CSI 与常规视觉或语言模态不同，也不同于一般时间序列和时空数据。这些特征促成了 SigMap 沿天线—子载波维度联合遮掩的策略。

### C.1 独特维度：空间—时间—频谱结构

多天线 OFDM 系统采集的 CSI 张量 H 本质上是多维的，涉及三个关键域：

- **频谱域（子载波）：** 描述信道的频率选择性衰落。不同子载波 k 之间的相关性是多径环境时延扩展 τ_max 的函数，通常用信道频率相关函数建模。
- **空间域（天线）：** 描述传播的几何性质。天线单元 n 之间的相关性由角度扩展 θ_spread 与阵列几何决定，可由空间相关矩阵 R_spatial = E[H_f H_fᴴ] 描述。
- **时间域（快照）：** 描述移动性或环境变化产生的信道时变性，可由多普勒扩展 f_d 表征。

这些结构可以表示为三维张量 H∈C^(N_ant×N_sc×N_time)，即一个空间—时间—频谱数据立方体。它不同于通常只有时间维 N_time、缺少明确空间和频谱结构的一维时间序列；也不同于交通栅格、视频等通常具有“高度×宽度×时间”均匀空间网格的时空数据。CSI 的空间维度由天线阵列几何决定，并不是一般的均匀图像网格，而且与频谱域耦合。

### C.2 对基础模型设计的影响

以上特征要求在基础模型结构和预训练策略上进行针对性调整，而不能直接复用为其他模态设计的模型。

- **超越标准 ViT 图像块。** ViT 通常将图像划分为规则二维块，这对 CSI 并非最优。SigMap 的周期自适应掩码正是针对 CSI 张量空间—频谱平面内固有周期性和结构设计的，而不是把 CSI 当作一般图像处理。
- **超越图像 MAE。** 图像掩码自编码器基于相邻像素高度相关的直觉，但 CSI 的相关性结构更复杂，并受无线传播物理规律控制。纯随机掩码无法充分利用天线与子载波维度已知的结构。本文将领域知识明确用于构造更具挑战、也更有意义的预训练任务。
- **超越 NLP 与时间序列模型。** GPT 等语言模型或普通时序模型处理一维序列，并不天然适配 CSI 中相互交织的三维相关结构。SigMap 依靠定制预训练目标，才能同时学习三个域上的表征。

综上，SigMap 的设计思路是遵循无线信号数据独有的归纳偏置来构建基础模型，而不是迫使 CSI 数据符合为其他模态设计的网络结构。

## 译文核验说明

- 已覆盖摘要、第 1–5 节、致谢、附录 A.1–A.2、B.1–B.5、C.1–C.2，含公式（1）–（21）、图 1–9 题注及表 1–7 的主要数值。
- 原文第 10 页的 WAIR-D 结果表为 **1.880 m**，表后描述为 **1.580 m**；原文同时出现微调参数比例 0.4% 与 0.7%，以及训练轮次 200 和 300，均按原文保留。
- 附录 B.3 的数据划分表局部字符在 PDF 文本中不完整，正文明确写出的训练/验证/测试 10,000/1,000/1,000 已翻译，原表缺损位置未猜测。
- 下接原论文正式参考文献。为确保引用可检索，保留作者姓名与英文原题，而不是将已发表论文题名替换成可能无法检索的中文题名。

## 参考文献（References）

> 下列条目的书目信息沿用原论文参考文献，按原始先后顺序排列。

Sadjad Alikhani, Gouranga Charan, and Ahmed Alkhateeb. Large wireless model (LWM): A foundation model for wireless channels. arXiv preprint arXiv:2411.08872, 2024. Ahmed Alkhateeb. Deepmimo: A generic deep learning dataset for millimeter wave and massive mimo applications. arXiv preprint arXiv:1902.06435, 2019. Hui Chen, Hadi Sarieddeen, Tarig Ballal, Henk Wymeersch, Mohamed-Slim Alouini, and Tareq Y Al-Naffouri. A tutorial on terahertz-band localization for 6G communication systems. IEEE Commun. Surveys Tuts., 24(3):1780–1815, 2022a. Xi Chen, Hang Li, Chenyi Zhou, Xue Liu, Di Wu, and Gregory Dudek. Fidora: Robust WiFibased indoor localization via unsupervised domain adaptation. IEEE Internet Things J., 9(12): 9872–9888, 2022b. Yiwen Chen, Tianqi Xiang, Xi Chen, and Xin Zhang. Map-assisted wireless tdoa localization enhancement based on cnn. In 2024 IEEE 6th Advanced Information Management, Communicates, Electronic and Automation Control Conference (IMCEC), volume 6, pp. 255–260. IEEE, 2024. Zirui Chen, Zhaoyang Zhang, Zhuoran Xiao, Zhaohui Yang, and Richeng Jin. Deep learning-based multi-user positioning in wireless FDMA cellular networks. IEEE J. Sel. Areas Commun., 41(12): 3848–3862, 2023. Jun Gao, Dongze Wu, Feng Yin, Qinglei Kong, Lexi Xu, and Shuguang Cui. Metaloc: Learning to learn wireless localization. IEEE Journal on Selected Areas in Communications, 41(12):3831– 3847, 2023. Yu Han, Zan Li, Zhongliang Zhao, and Torsten Braun. CrowdBERT: Crowdsourcing indoor positioning via semi-supervised BERT with masking. IEEE Internet Things J., 11(24):40100–40112, 2024. Lixiong Huang, Ruizhi Chen, Ying Chen, Guangyi Guo, Feng Ye, Zuoya Liu, and Liang Chen. Robust tdoa-based indoor localization using improved clock-sync-scheme and multilevel constrained arpf. IEEE Sensors Journal, 23(10):10633–10643, 2023. Yourui Huangfu, Jian Wang, Shengchen Dai, Rong Li, Jun Wang, Chongwen Huang, and Zhaoyang Zhang. Wair-d: Wireless ai research dataset. arXiv preprint arXiv:2212.02159, 2022. Suhardi Azliy Junoh and Jae-Young Pyun. Enhancing indoor localization with semi-crowdsourced fingerprinting and GAN-based data augmentation. IEEE Internet Things J., 11(7):11945–11959, 2024. Musa Furkan Keskin, Henk Wymeersch, and Visa Koivunen. MIMO-OFDM joint radarcommunications: Is ICI friend or foe? IEEE J. Sel. Topics Signal Process., 15(6):1393–1408, 2021. Lin Li, Xiansheng Guo, Mengxue Zhao, Huiyong Li, and Nirwan Ansari. Transloc: A heterogeneous knowledge transfer framework for fingerprint-based indoor localization. IEEE Trans. Wireless Commun., 20(6):3628–3642, 2021. Guangjin Pan, Kaixuan Huang, Hui Chen, Shunqing Zhang, Christian Häger, and Henk Wymeersch. Large wireless localization model (lwlm): A foundation model for positioning in 6g networks. arXiv preprint arXiv:2505.10134, 2025. Yanlin Ruan, Liang Chen, Xin Zhou, Zhaoliang Liu, Xiaoyan Liu, Guangyi Guo, and Ruizhi Chen. iPos-5G: Indoor positioning via commercial 5G NR CSI. IEEE Internet Things J., 10(10):8718– 8733, 2023. Artan Salihu, Markus Rupp, and Stefan Schwarz. Self-supervised and invariant representations for wireless localization. IEEE Trans. Wireless Commun., 23(8):8281–8296, 2024. Jiawei Shao, Jingwen Tong, Qiong Wu, Wei Guo, Zijian Li, Zehong Lin, and Jun Zhang. Wirelessllm: Empowering large language models towards wireless intelligence. arXiv preprint arXiv:2405.17053, 2024. Ji Wang, Wei Fang, Jian Xiao, Yi Zheng, Le Zheng, and Fan Liu. Signal-guided masked autoencoder for wireless positioning with limited labeled samples. IEEE Trans. Veh. Technol., 74(1):1759– 1764, 2025. Chi Wu, Xinping Yi, Wenjin Wang, Li You, Qing Huang, Xiqi Gao, and Qing Liu. Learning to localize: A 3D CNN approach to user positioning in massive MIMO-OFDM systems. IEEE Trans. Wireless Commun., 20(7):4556–4570, 2021. Tingting Yang, Ping Zhang, Mengfan Zheng, Yuxuan Shi, Liwen Jing, Jianbo Huang, and Nan Li. WirelessGPT: A generative pre-trained multi-task learning framework for wireless communication. arXiv preprint arXiv:2502.06877, 2025. Xinghang Zhou, Cheng Xu, Jie He, and Jiawang Wan. A cross-region wireless-synchronizationbased tdoa method for indoor positioning applications. In 2019 28th Wireless and Optical Communications Conference (WOCC), pp. 1–4. IEEE, 2019.

{% endraw %}