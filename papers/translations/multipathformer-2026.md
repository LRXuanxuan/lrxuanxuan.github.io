---
layout: page
title: "MultiPathFormer：面向多径无线传播的基础模型｜中文全文译文"
permalink: /papers/translations/multipathformer/
math: true
toc: true
---

[← 返回论文条目](/papers/items/50a1b62e5cb84f9d/) · [原始 PDF](https://arxiv.org/pdf/2608.05076v1)

# MultiPathFormer：迈向面向多径无线传播的基础模型

**原题：** MultiPathFormer: Towards a Foundation Model for Multipath Wireless Propagation  
**作者：** Blessed Guda、Kayley Sze、Carlee Joe-Wong  
**机构：** Carnegie Mellon University，美国匹兹堡  
**版本：** arXiv:2608.05076v1，2026-08-05  
**版权与授权：** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本页为依据原文制作的中文译本，属改编作品。保留原作者、题名、来源和公式编号；为便于核查，技术缩写、源代码地址与参考文献书目信息保持英文。译文不代表原作者对译本的认可。原文图像未复制，均给出中文图注及对应页码，以减小网页体积。

## 摘要

机器学习的最新进展使无线基础模型（wireless foundation model）的训练成为可能。这类模型旨在利用无线信号支持信道估计、波束预测和定位等任务。现有无线基础模型一般在信道张量上进行预训练，对子载波、天线或者时间维度采用掩码重建，却忽略了无线传播的物理特征。本文主张将**多径传播**本身作为基本的预训练对象。我们提出自回归基础模型 MultiPathFormer，将每条发射机—接收机链路表示成连续值路径 token 的有序序列，并通过“下一路径预测”（next-path prediction）进行预训练。在 Transformer 主干网络上，我们引入环境检索增强生成（Environmental RAG）机制和首径码本，利用环境知识改进时延、功率等路径统计量的估计，最高改善 59%。在 27 个环境上预训练的 MultiPathFormer 能够迁移至未见过的用户；经过特定场景微调后，在新环境中的表现优于从头训练相应模型。跨下游任务比较表明，该模型超过了最先进的信道级基础模型，达到 5.57 m 的平均定位误差、0.914 的 Top-3 波束准确率、0.994 的视距分类准确率，以及 0.561 的信道估计 NMSE。结果说明，路径级预训练可以学习具有复用价值的无线传播表示。

**关键词：** 无线基础模型、多径传播、自回归建模、信道估计。

## I. 引言（Introduction）

现代机器学习应用通常以基础模型为起点：先利用通用自监督目标进行预训练，再把学到的模型用于各种下游任务。这种方法已经在语言、视觉、机器人与多模态学习中形成通用表征 [1]–[6]，随后服务于文本分类、机器翻译、生成与推理等任务 [7]–[9]。它的基本原则很简单：只要选择合适的预训练对象，大规模自监督学习就能够获取某个领域的底层结构，从而在多种任务之间复用。

无线通信也是基础模型有望发挥作用的领域 [10]。正在发展的 5G/6G 网络越来越依赖环境感知推理来进行波束选择、信道估计、定位和感知。在毫米波和大规模 MIMO 部署中尤其如此：窄波束、阻挡及空间异质性使传播过程高度依赖物理场景 [11]–[13]。这些现象的核心是**多径传播**。电磁波从发射机传播到接收机时，会与场景中的物体发生反射、折射、散射和绕射，从而形成由环境决定的一组传播路径。虽然室内/室外、城市/乡村等场景的相互作用差异很大，传播过程始终遵循相同的物理规律。能够捕获这些规律的基础模型便可能用于多种下游任务。

**现有基于信道的模型。** 最近已经有多项无线基础模型研究 [14], [15]。例如 WiFo [16] 和 ChannelGPT [17] 以信道预测为目标，展示了同一信道预测任务在不同 CSI 配置间的零样本泛化。Large Wireless Model（LWM）[18] 从大规模无线信道数据中学习带上下文的信道嵌入，并在 LoS 分类及波束预测中取得增益。WirelessGPT [19] 将类似思想推广到人体活动识别和无线环境重建。它们的共同点在于：均以**信道层面**为预训练对象，其训练目标是某种形式的掩码信道建模（Masked Channel Modeling，MCM）[20]。设 $M$ 为被遮蔽的子载波、时间或空间位置集合，$h_i$ 为位置 $i$ 的真实信道，$f$ 为基础模型，其目标函数为

$$
\ell_{\rm MCM}
=\frac{1}{|M|}\sum_{i\in M}
\left\|f\left(i\mid\{h_j\}_{j\notin M}\right)-h_i\right\|^2.
\tag{1}
$$

但是，**信道是否真的是无线基础模型最合适的预训练对象？** 对于一条链路，子载波 $k$ 的信道是多条传播路径的叠加：

$$
\mathbf H[k]
=\sum_{\ell=1}^{L}\alpha_\ell
e^{-j2\pi f_k\tau_\ell}
\mathbf a_{\rm rx}(\boldsymbol\Omega^{\rm rx}_{\ell})
\mathbf a_{\rm tx}^{H}(\boldsymbol\Omega^{\rm tx}_{\ell}),
\tag{2}
$$

其中第 $\ell$ 条路径由复增益 $\alpha_\ell$、时延 $\tau_\ell$、到达角与离开角 $\boldsymbol\Omega^{\rm rx}_{\ell}$、$\boldsymbol\Omega^{\rm tx}_{\ell}$ 描述。式 (2) 揭示了信道级预训练的局限：信道张量不仅混合了数量可变的路径事件，而且将它们与阵列响应、子载波采样以及系统配置纠缠在一起。因此，模型很难分离真正决定无线传播行为的环境结构 [15]。即使两个位置的合成信道很相似，它们也可能具有不同的环境特征；这种表示方式不利于可解释性和消歧。

**本文洞见：基于路径的架构。** 我们认为更基础的预训练对象是多径传播过程。直接在路径层面建模，可以显式保留生成信道的物理参数，包括路径功率、时延、相位、AoA、AoD，以及视距、反射、绕射、散射等交互类型。除了可解释性之外，这种表示还有望改善模型复用：在多条路径叠加成信道张量之前，模型必须学习路径数量变化、主导路径结构、角度几何和传播属性。然而，这一思路也面临技术难题。发射机—接收机（Tx-Rx）链路产生的是长度可变的**连续值路径描述序列**，而不是适合标准掩码重建的固定离散 token 网格。因此，模型需要同时预测路径数量及各条路径的物理属性，并依赖发射机、接收机以及有关场景几何进行条件推理。

为此我们提出 MultiPathFormer。它把无线预训练改写为类似语言模型下一 token 预测的**下一传播路径预测**，但预测对象是连续的路径参数。每条 Tx-Rx 链路被转换成有序路径 token 序列，随后在来自多个环境的路径序列上预训练自回归 Transformer。设计中需要回答三个问题：

1. **如何对长度可变、取值连续的路径序列进行自回归预测？** 语言 token 属于离散词表，而传播路径由时延、功率、相位、角度等连续物理量描述；不同链路的路径数量也不同。
2. **如何建模并稳定预测主导路径？** 文本 token 不同位置可以具有不同语义作用，但无线传播通常由一条最强路径支配，且路径之间不存在天然的时间先后顺序。主导路径贡献了大量接收功率，在很大程度上决定链路特征，需要区别于后续路径处理。
3. **应该检索哪些与链路有关的环境上下文？** 路径形成取决于周边几何、遮挡及潜在反射体。建筑物和基站等固定设施的位置可由 OpenStreetMap 等来源获取 [21]，但基础模型还必须识别其中哪些物体与当前链路最相关，并决定如何编码。

据作者所知，MultiPathFormer 是首个以单条多径 token 序列为对象、通过下一路径预测预训练的无线基础模型。本文贡献包括：

1. 引入路径级自回归无线预训练形式，用有序多径 token 代替信道张量，支持连续参数及可变序列长度；公开在 27 个环境、约 2390 万条多径 token 上训练的模型权重（[Hugging Face 权重](https://huggingface.co/gblessed/multipathformer)）。
2. 引入 Environmental RAG 和基于 KMeans 的主导路径聚类码本，将局部及传播走廊几何注入模型，同时稳定首径预测；在 31 个场景上，相对直接自回归基线的时延 MAE 降低 38.7%，功率 MAE 降低 59.2%。
3. 证明预训练有助于迁移与适应：对预训练环境中的未见用户进行迁移；在新环境中进行场景专属微调后，优于从头训练相同架构。
4. 将模型用于波束预测、用户定位和 LoS 分类等任务；相对于信道基础模型，波束预测准确率最高提升约 30%，LoS 分类提升约 3%，定位误差降低约 65 m；文中报告信道估计的比较结果，具体 NMSE 见表 III。

## II. 文献综述（Literature Review）

通用自监督预训练及下游任务复用是基础模型的核心 [1]。BERT 的掩码 token 建模和 GPT 的自回归下一 token 预测展示了 token 级目标在语言中的价值 [2], [7]；视觉 Transformer、掩码自动编码器以及 CLIP 式对比学习则将类似思想推广到图像块与图文数据 [3], [4], [22]。MultiPathFormer 由这些工作启发，以传播路径 token 建立无线基础模型。

### A. 无线基础模型（Wireless Foundation Models）

近年的无线通信和感知基础模型研究 [14]，尤其是信道级方法，可参见综述 [20]。LWM [18] 使用 BERT 式纯编码器，在天线和子载波维度上执行掩码信道建模，生成对 LoS 分类和波束预测有用的上下文化嵌入。WiFo [16] 用三维信道输入建模 CSI 的时间演化，捕获时间、频率和空间变化，并采用带 Transformer 解码器的掩码自动编码器（MAE）增加重建能力；文献 [23] 在此基础上加入对比学习目标，使表征更有区分性。

其他工作提出受物理规律启发的信道级 [24] 或电磁级 [10] 架构，也有工作尝试利用无线信号的时间序列特性 [25], [26]，但它们都不以路径级 token 为输入。WirelessGPT [19] 和 ChannelGPT [17] 希望把无线基础模型接入更广泛的网络系统：前者扩展感知任务，后者探索依据物理环境及网络性能变化形成反馈。还有一些研究融合多模态环境信息 [27], [28]，这也与 MultiPathFormer 的思路有关。

这些工作说明自监督 MCM 可以学习可复用的信道表示。但是，它们都选择信道张量作为预训练对象，使表征与天线、子载波及带宽配置绑定，而且只能隐式获取构成信道的多径事件。MultiPathFormer 改为直接预训练多径序列。

### B. 任务专用无线模型（Task-Specific Wireless Models）

在基础模型出现前，大多数无线深度学习模型只服务单一任务。例如，文献 [29] 使用大型 MLP 根据 sub-6 GHz 信道预测毫米波波束及阻挡状态；[30] 将低开销导频观测映射到波束选择；CsiNet [31] 采用自动编码器进行 massive MIMO CSI 压缩及重建；ChannelNet [32] 将时频网格上的信道估计表述成图像超分辨率及恢复问题；[33] 使用图像去噪形式，以消息传递去噪 CNN 估计稀疏毫米波 massive MIMO 信道。这些工作证明神经网络可以改善信道恢复，但仍是信道矩阵方法，而不是显式传播路径序列方法。

## III. MultiPathFormer 设计（MultiPathFormer Design）

本节先介绍问题形式（III-A），再给出骨干架构（III-B），最后介绍用于整合环境上下文的 RAG（III-C）与稳定主导路径的聚类码本（III-D）。

### A. 背景及问题定义（Background and Problem Formulation）

**信道模型。** 设训练集包含 $M$ 个环境；正如 V-D 节将展示的，MultiPathFormer 以后可以在新环境中微调。对于 $m\in\mathcal S=\{1,\ldots,M\}$，我们考虑该环境中发射机 $b\in\mathcal B_m$ 与接收机 $u\in\mathcal U_m$ 之间的多径传播。每条链路 $(m,b,u)$ 包含发射机及接收机的三维地理位置 $\mathbf x_{\rm tx}^{(m,b)},\mathbf x_{\rm rx}^{(m,u)}\in\mathbb R^3$、链路相关环境特征 $\mathbf x_m^{\rm tx-rx}\in\mathbb R^{d_{\rm env}}$ 和信道张量 $\mathbf H_{m,b,u}$。图 1(a) 给出环境示例。若有 $L_{m,b,u}$ 条路径，其序列定义为

$$
\mathcal P_{m,b,u}
=\left(\boldsymbol\pi_1^{(m,b,u)},\ldots,
\boldsymbol\pi_{L_{m,b,u}}^{(m,b,u)}\right),
\tag{3}
$$

$$
\boldsymbol\pi_\ell^{(m,b,u)}
=(\rho_\ell,\tau_\ell,\phi_\ell,
\theta_{\ell,az}^{aoa},\theta_{\ell,el}^{aoa},
\theta_{\ell,az}^{aod},\theta_{\ell,el}^{aod},
\mathbf z_\ell).
\tag{4}
$$

式 (4) 中，$\rho_\ell$ 是路径功率，$\tau_\ell$ 为传播时延，$\phi_\ell$ 为相位；$\theta_{\ell,az}^{aoa},\theta_{\ell,el}^{aoa}$ 是到达方位角和俯仰角，$\theta_{\ell,az}^{aod},\theta_{\ell,el}^{aod}$ 是对应的离开角；$\mathbf z_\ell\in\{0,1\}^4$ 为多热（multi-hot）交互类别向量，标记反射、绕射、散射或 LoS。为简洁，后文省略部分 $(m,b,u)$ 上标。式 (1)–(4) 是文献 [16], [34] 等使用的标准多径描述。

**自回归路径形式。** 对于给定链路和环境特征，我们希望利用已预测路径来预测下一条路径，其序列概率写为

$$
p_\theta(\mathcal P_{m,b,u}\mid\mathbf x_m)
=\prod_{t=1}^{L_{m,b,u}}
p_\theta(\boldsymbol\pi_t\mid
\boldsymbol\pi_{<t},
\mathbf x_{\rm rx},
\mathbf x_{\rm tx},
\mathbf x_m^{\rm tx-rx}).
\tag{5}
$$

这相当于对变长序列进行自回归回归，而非语言模型的自回归分类：语言来自离散词表，通常用起始和终止 token 控制生成；多径路径是连续物理实体，天然也不存在文本那样的时间次序。

为解决上述问题，我们将路径按照接收功率从大到小排序：$\rho_1^{m,b,u}\ge\rho_2^{m,b,u}\ge\cdots\ge\rho_{L_{m,b,u}}^{m,b,u}$。另一种方案是按时延排序，因为功率与时延并不是严格的反线性关系（见图 1(b)）；不过实验未发现这两种排序有显著性能差异。我们在序列前增加全零起始 token $\boldsymbol\pi_0^{(m,b,u)}=\mathbf0$。每一步模型同时预测式 (4) 的路径参数。对于何时停止，本文不设计可能损害连续回归表现的“结束路径”token，而是显式预测 Tx-Rx 之间的路径条数，并据此结束生成。由于较晚的路径一般功率较弱，其对信号的贡献较小，因此终止位置出现轻微误差可能不会明显影响信道预测。

余下的问题是如何提供合适的物理上下文。完整场景中许多物体对指定链路没有意义，而固定发射机附近用户的最强路径又常具有明显空间规律。因此，图 2 的 MultiPathFormer 在 Transformer 主干之外结合两个模块：Environmental RAG 检索与链路相关的几何（III-C），紧凑的首径聚类码本提供主导路径的低维先验（III-D）。

**图 1（原文第 4 页）**：(a) 示例物理环境及无线信号可能传播经过的三维场景；(b) 根据首径时延和功率进行 KMeans 聚类，聚类结果在固定发射机下对应空间上相干的用户区域。  
**图 2（原文第 4 页）**：引入传播走廊上下文的 MultiPathFormer。模型将 Environmental RAG 特征及首径 KMeans 码本加入 Tx-Rx 条件输入，再自回归预测多径序列，对最强首径作残差修正。

### B. MultiPathFormer 主干网络（Backbone Model）

MultiPathFormer 使用类似视觉—语言模型 [35] 的编码器—解码器 Transformer，分别处理不同来源的信息。编码器提取 Tx-Rx 与物理场景之间的关系。为了让编码表征与环境相关，同时处理可变路径长度，训练中让编码器预测链路的多径数量。解码器在环境编码条件下建模当前路径与过去路径的关系。

令 $E_{\rm env}$ 表示环境编码、$\widehat L_{m,b,u}$ 表示预测路径数、$\mathbf h_t$ 表示解码器第 $t$ 步输出：

$$
E_{\rm env}=\mathrm{Encoder}_\theta
([\mathbf x_m,\mathbf x_{\rm tx},\mathbf x_{\rm rx}]),
\tag{6}
$$

$$
\widehat L_{m,b,u}=f_{\rm len}(E_{\rm env}),
\tag{7}
$$

$$
\mathbf h_t=\mathrm{Decoder}_\theta
([E_{\rm env};\boldsymbol\pi_{<t}]).
\tag{8}
$$

解码输出经过线性层，预测式 (4) 中的多径参数。为处理周期性角度，网络预测角的正弦/余弦，而不是直接回归角度本身：

$$
\begin{aligned}
\widehat{\mathbf y}_t
=(&\widehat\tau_t,\widehat\rho_t,
\widehat{\sin\phi_t},\widehat{\cos\phi_t},\\
&\widehat{\sin\theta^{aoa}_{t,az}},
\widehat{\cos\theta^{aoa}_{t,az}},
\widehat{\sin\theta^{aoa}_{t,el}},
\widehat{\cos\theta^{aoa}_{t,el}},\\
&\widehat{\sin\theta^{aod}_{t,az}},
\widehat{\cos\theta^{aod}_{t,az}},
\widehat{\sin\theta^{aod}_{t,el}},
\widehat{\cos\theta^{aod}_{t,el}})
=\mathbf W_{\rm reg}\mathbf h_t+\mathbf b_{\rm reg},
\end{aligned}\tag{9}
$$

$$
\widehat{\mathbf z}_t=\sigma(\mathbf s_t),
\qquad
\mathbf s_t=\mathbf W_{\rm int}\mathbf h_t+\mathbf b_{\rm int}.
\tag{10}
$$

**训练损失。** 对长度为 $L_{m,b,u}$ 的真实路径序列，$\mathbf y_t$ 为从第 $t$ 条真实路径导出的回归目标。以路径参数的平方误差定义 $\mathcal L_{\rm path}$，以预测路径数的平方误差定义 $\mathcal L_{\rm len}$，以交叉熵定义交互类别损失 $\mathcal L_{\rm int}$：

$$
\mathcal L_{\rm path}
=\frac1{L_{m,b,u}}\sum_t
\|\widehat{\mathbf y}_t-\mathbf y_t\|_2^2,
\qquad
\mathcal L_{\rm len}
=(\widehat L_{m,b,u}-L_{m,b,u})^2,
$$

$$
\mathcal L_{\rm int}
=-\frac1{L_{m,b,u}}\sum_t
\left[\mathbf z_t^\top\log\widehat{\mathbf z}_t
+(1-\mathbf z_t)^\top
\log(1-\widehat{\mathbf z}_t)\right].
$$

使用标准反向传播，最小化 $\mathcal L=\mathcal L_{\rm path}+\lambda_{\rm int}\mathcal L_{\rm int}+\lambda_{\rm len}\mathcal L_{\rm len}$，共同训练骨干及回归/分类层。具体权重和训练配置见附录。

### C. 环境检索增强生成（Environmental Retrieval Augmented Generation）

传播路径与环境内多种物体发生相互作用。不同环境差异很大：低人口密度区域建筑稀疏，城市环境则具有密集物体与用户。然而模型必须在各种场景中高效推理相关物体。直接提供一个全局环境描述 $\mathbf x_m$ 可能过于粗糙且含有噪声，尤其不利于区分不同位置的用户。决定某条 Tx-Rx 链路路径的，既包括它所属的大环境，更包括接收机附近的物体，以及位于 Tx-Rx 传播走廊内的物体。因此 Environmental RAG 从场景中检索链路专属几何上下文，并用于条件化 MultiPathFormer。

对于环境 $m$，设发射机和接收机的二维位置为 $\mathbf x_{\rm tx}^{(m,b)},\mathbf x_{\rm rx}^{(m,u)}\in\mathbb R^2$，场景内物体集合为 $\mathcal O_m=\{o_1^{(m)},\ldots,o_{J_m}^{(m)}\}$。这些物体可以由 OpenStreetMap 生成的三维环境模型取得 [21]，已有工作也采用过这种表示 [36]。每个物体 $o_j^{(m)}$ 具有平面质心 $\mathbf p_j^{(m)}\in\mathbb R^2$、高度 $h_j^{(m)}$、占地面积 $a_j^{(m)}$ 和材料性质等属性。RAG 模块检索局部物体、走廊物体及稀疏多尺度统计。

**(a) 局部密集检索。** 对二维查询点 $\mathbf q$（发射端或接收端位置），设最大距离为 $d_{\max}$，先定义候选物体集合

$$
\mathcal O_m(\mathbf q,d_{\max})
=\{o_j\in\mathcal O_m:
\|\mathbf p_j^{(m)}-\mathbf q\|_2\le d_{\max}\},
\tag{11}
$$

再保留其中最近的 $K$ 个物体 $\mathcal N_K(\mathbf q,d_{\max})$：

$$
\mathcal N_K(\mathbf q,d_{\max})
=\mathrm{TopK}_{o_j\in\mathcal O_m(\mathbf q,d_{\max})}
\left(-\|\mathbf p_j^{(m)}-\mathbf q\|_2\right).
\tag{12}
$$

对于每个保留物体，使用包含距离、高度、占地面积和材料属性的详细描述。

**(b) 传播走廊密集检索。** 一些物体虽然不靠近任何一个端点，却靠近传播线路，仍可能产生重要作用。我们在 Tx-Rx 之间定义走廊，将物体质心投影到 Tx-Rx 直线上：

$$
\mathbf v_j^{m,b,u}
=\mathbf x_{\rm tx}^{(m,b)}
+\operatorname{proj}_{\mathbf x_{\rm rx}^{(m,u)}
-\mathbf x_{\rm tx}^{(m,b)}}
(\mathbf p_j^{(m)}-\mathbf x_{\rm tx}^{(m,b)}),
\tag{13}
$$

$$
d_j^{\rm cor}
=\|\mathbf p_j^{(m)}-\mathbf v_j^{m,b,u}\|_2.
\tag{14}
$$

之后与式 (12) 类似，检索距离走廊最近的 Top-$K$ 物体。

**(c) 稀疏多尺度统计。** 密集 Top-$K$ 检索可以识别最相关的单个物体，却无法概括更大范围的杂波空间分布。因此再对半径 $d_{\max}$ 内未必进入 Top-$K$ 的物体计算统计。对于半径序列 $\{d_1,\ldots,d_R\}$，分别统计发射机和接收机周围各半径内的物体数量及最大高度。对 Tx-Rx 走廊，则把线段分成 $B$ 个区间，在走廊半径 $d_{\max}$ 内统计各区间的物体数及最大高度。这些稀疏特征提供环境密度及阻挡模式的粗粒度多尺度描述。

最终，将局部密集、走廊密集及稀疏统计拼接，形成链路的完整检索上下文 $\mathbf x_m^{\rm tx-rx}$。它既保存发射端、接收端附近 Top-$K$ 物体的细粒度特征，又包含走廊附近 Top-$K$ 物体的特征及更大尺度环境统计，因此是一种高效的链路专属上下文表示：密集部分保留最相关的物体级信息，稀疏部分概括更广泛的环境结构。

### D. 首径聚类码本（First-Path Cluster Codebook）

与语言建模不同，无线信号的第一条路径通常也是最强路径，往往决定接收信道的大致量级。自回归模型如果在这一步犯错，误差会传播到后续解码状态并逐步累积。因此我们为首径加入粗略先验：对于同一发射机，位置接近的接收机由于共享大尺度几何、遮挡及 LoS 或首反射结构，往往具有相近的首径功率与时延。图 1(b) 表明，按首径功率与时延对用户聚类，会形成空间上相干的区域。并且，发射机通常是固定基站 [37]，因此在同一环境的训练集和测试集中保持一致。

为利用这一规律，我们设计刻意保持简洁的 First-Path Cluster Codebook。码本只捕获少数主导空间模式，而完整的连续路径预测——包括角度、相位、交互类别、路径数量及所有后续路径——仍交给 Transformer。对环境 $m$ 中的每个发射机 $b$，使用训练集中相应接收机的首径功率和时延拟合 KMeans：

$$
\{\mathbf c_k^{(m,b)}\}_{k=1}^K
=\mathrm{KMeans}\left(
\{(\rho_1^{(m,b,u)},\tau_1^{(m,b,u)}):
u\in\mathcal U_m^{\rm train}\}\right).
\tag{15}
$$

$\mathbf c_k^{(m,b)}\in\mathbb R^2$ 是第 $k$ 类在功率—时延空间的质心。对每一类，还统计类内用户首径功率及时延的离散程度：

$$
\boldsymbol\sigma_k^{(m,b)}
=\operatorname{Std}\left(
\{(\rho_1^{(m,b,u)},\tau_1^{(m,b,u)}):
z^{(m,b,u)}=k\}\right).
\tag{16}
$$

其中 $z^{(m,b,u)}$ 是该接收机的聚类编号。测试阶段，通过相同发射机下训练用户的最近邻，将首径先验分配给新的接收机：

$$
u^\star
=\arg\min_{u'\in\mathcal U_m^{\rm train}(b)}
\|\mathbf x_{\rm rx}^{(m,u)}
-\mathbf x_{\rm rx}^{(m,u')}\|_2^2,
\tag{17}
$$

$$
\mathbf c_{m,b,u}=\mathbf c_{z^{(m,b,u^\star)}}^{(m,b)},
\qquad
\boldsymbol\sigma_{m,b,u}
=\boldsymbol\sigma_{z^{(m,b,u^\star)}}^{(m,b)}.
\tag{18}
$$

**首径残差预测。** 将 KMeans 质心作为首径的强初始化，网络仅预测修正残差：

$$
\widehat{\mathbf y}_{m,b,u}^{(1)}
=\mathbf c_{m,b,u}
+f_{\rm res}\left(
\mathbf h_1,\mathbf c_{m,b,u},
\boldsymbol\sigma_{m,b,u},
\mathbf x_{m,b,u}\right).
\tag{19}
$$

这里 $\mathbf h_1$ 为首个生成步骤的解码器隐藏状态，$\mathbf x_{m,b,u}$ 为 Environmental RAG 上下文。该设计把两种信息分开：码本表达可以由邻近训练接收机推断的粗粒度最强路径模式，残差网络依据检索场景几何及解码状态进行链路专属修正。换言之，KMeans 先验提供稳健的默认假设，Environmental RAG 提供用于细化假设的场景证据。对于 $t\ge2$ 的路径，恢复 MultiPathFormer 解码器的标准自回归预测。

## IV. 下游任务复用（Downstream Task Reuse）

为证明 MultiPathFormer 能作为无线基础模型，我们将其用于四项任务：由 sub-6 GHz 信息预测毫米波波束、用户定位、LoS 分类及信道估计。这些任务也常见于以往的无线基础模型研究 [16], [18], [19]，因而可以在 V-E 节直接比较。

**适配头微调。** 波束预测和用户定位采用 adapter 微调；LoS 分类同时评估零样本规则及 adapter 微调。下游任务通过轻量 MLP 头利用 MultiPathFormer 骨干提供的通用表征。模型对自回归 rollout 中的隐藏状态执行 first/mean/max 等池化操作，冻结骨干，只训练任务专用头 $f_{\rm task}$：

$$
\overline{\mathbf h}_{m,n}
=\mathrm{Pool}(\mathbf h_1,\ldots,\mathbf h_{\widehat L_{m,n}}),
\tag{20}
$$

$$
\widehat{\mathbf y}_{\rm task}
=f_{\rm task}(\overline{\mathbf h}_{m,n}).
\tag{21}
$$

用户定位中，接收机位置本身就是待预测目标，因此将位置、RAG 和码本等依赖真实用户位置的输入置零。输入解码器的多径序列仍然可以产生用于区分位置的表征。零样本 LoS 分类则直接根据最大功率路径相对其他路径的支配程度进行判断。

**信道估计。** 与 [16], [18] 类似，任务是在若干已知含噪子载波观测的条件下，推断未知子载波的信道。由于高频传播的相位方差很大，MultiPathFormer 不直接用预测路径参数合成最终信道，而是将路径视为**几何先验**，配合已知子载波恢复未知信道。对每条预测路径 $\widehat{\boldsymbol\pi}_k$，令 $\mathbf b_k$ 为该路径在全部天线及子载波上引起的、单位幅度且初相位设为零的信道响应。具体对频率 $f$，

$$
\mathbf b_k(f)
=e^{-j2\pi f\widehat\tau_k}
\mathbf a_{\rm rx}(\widehat{\boldsymbol\theta}^{AoA}_k)
\mathbf a_{\rm tx}^{H}
(\widehat{\boldsymbol\theta}^{AoD}_k).
$$

由 MultiPathFormer 提供的路径基写成 $\mathbf B=[\mathbf b_1,\ldots,\mathbf b_K]$。设 $\mathbf h$ 为真实信道，$\Omega$ 为已知子载波位置集合，对基的复系数进行带正则项的最小二乘估计：

$$
\mathbf h\approx\mathbf B\boldsymbol\alpha,
\qquad
\widehat{\boldsymbol\alpha}
=\arg\min_{\boldsymbol\alpha}
\left\|\mathbf B_\Omega\boldsymbol\alpha
-\mathbf h_\Omega\right\|_2^2
+\lambda\|\boldsymbol\alpha\|_2^2.
\tag{22}
$$

最终以 $\widehat{\mathbf h}=\mathbf B\widehat{\boldsymbol\alpha}$ 重建信道。这里 MultiPathFormer 提供稀疏传播支撑集，而实测子载波提供推断未知子载波所需的瞬时复系数，使系统可以跟踪实时变化。

## V. 实验验证（Experimental Validation）

本节从多个角度评估 MultiPathFormer。V-B 节测试首径码本和 Environmental RAG 对多径生成质量的贡献；V-E 节比较多项下游任务；V-C 节分析可解释性；V-D 节评估向未见用户及新环境的泛化；V-F 节讨论实时推理成本。

### A. 实验设置（Experimental Setup）

实验使用 DeepMIMO 数据集框架 [34]。该框架根据射线追踪仿真提供可复现的站点专属无线数据，已被相关研究 [18], [23] 广泛采用。DeepMIMO 特别适合本文，因为除信道响应外，还提供形成信道的几何与路径级传播结构。数据集包含来自 NVIDIA Sionna RT [38]、Remcom Wireless InSite [39]、NVIDIA AODT [40] 等高保真射线追踪来源的数据。

本文选取 31 个不同环境场景。除非另有说明，在其中 27 个环境的 80% 用户上预训练 MultiPathFormer，然后评估两类零样本情形：（i）这 27 个环境余下的 20% 未见用户；（ii）完全未参与预训练的四个环境。更多模型配置见附录。

**基线与消融。** 通常比较 MultiPathFormer 的三个版本：

- **Direct：** 只基于 Tx-Rx 几何直接自回归预测路径序列；
- **+Codebook：** 增加 III-D 节的首径码本及残差预测；
- **+RAG：** 再增加 III-C 节的 Environmental RAG 特征。

下游波束预测、用户定位与 LoS 分类均在冻结骨干上训练轻量任务头；信道估计和 LoS 分类还考虑零样本设置。环境中的码本聚类仅根据训练 Tx-Rx 对拟合。下游对照包括信道基础模型 LWM [18]、WiFo [16]，以及任务专用波束分类 MLP [29] 和信道估计 LSTM [41]。下游实验所指的 MultiPathFormer 骨干，是未进行场景专属微调的原始预训练基础模型，指标在目标场景留出的测试用户上计算。

### B. 生成质量与架构消融（Generative Quality and Architectural Ablations）

为了考察各模块的重要性，先分别对每个环境从头训练 MultiPathFormer。表 I 表明，每增加一个结构模块都有利于模型表现。只引入首径码本，就使平均功率 MAE 从 7.54 降至 4.58（对所有场景中留出用户与未见环境求平均），交互类别 F1 由 0.786 增至 0.813。这说明紧凑的主导路径先验可以稳定影响最大的生成步骤。

加入 Environmental RAG 后，在每一项指标上都取得最佳结果。相较 Direct，完整 +RAG 使时延 MAE 降低 38.7%、功率 MAE 降低 59.2%，交互类型准确率由 0.870 提升至 0.925，F1 由 0.786 提升至 0.890。这支持本文的核心架构假设：精确的多径生成既需要稳健的首径先验，又需要针对当前 Tx-Rx 的环境上下文。图 3 表明，这种优势在小数据条件下依然存在；即使只有 10% 的用户用于训练，码本仍有益，MAE 仍保持较低水平。

图 4 给出了直观例子。直接自回归模型能够学习总体功率衰减趋势，但前几条路径偏差较大；码本稳定了首径；完整 +RAG 模型能更准确跟随最初的高功率路径和后续路径序列。

**表 I　31 个 DeepMIMO 场景上的路径生成误差（均值±离散程度）**

| 版本 | 时延 MAE (μs) | 功率 MAE (dB) | AoA 方位角 (°) | AoA 俯仰角 (°) | AoD 方位角 (°) | AoD 俯仰角 (°) | 交互准确率 | 交互 F1 |
|---|---|---|---|---|---|---|---|---|
| Direct | 0.111±0.062 | 7.544±2.475 | 33.106±11.941 | 4.890±1.751 | 31.936±12.001 | 4.042±1.614 | 0.870±0.077 | 0.786±0.147 |
| +Codebook | 0.095±0.054 | 4.582±1.851 | 30.097±10.297 | 4.688±1.744 | 28.976±11.066 | 3.778±1.539 | 0.884±0.079 | 0.813±0.145 |
| +RAG | 0.068±0.038 | 3.081±1.383 | 22.076±10.166 | 3.610±1.655 | 20.147±9.357 | 2.964±1.493 | 0.925±0.050 | 0.890±0.079 |

**图 3（原文第 6 页）**：不同训练用户比例下的时延 MAE 与功率 MAE，显示训练用户减少时 MultiPathFormer 仍保持相对较低的误差。  
**图 4（原文第 7 页）**：单个接收机的路径功率和时延随路径编号的变化。Direct 捕获总体趋势但首径漂移明显；码本改善最强路径，+RAG 更接近真实功率衰减和时延序列。

### C. 空间相干性与可解释性（Spatial Coherence and Interpretability）

下面考察模型的可解释性及空间相干性。图 5 展示用户网格上预测的 AoA 方位角场。使用 RAG 的完整模型更接近真实空间结构，说明环境检索能够使局部预测与邻近链路几何更一致。对于传播基础模型而言，除了最小化单条链路误差，还需要保持部署区域内的空间一致性。

为了检验网络是否以可解释方式使用检索的环境信息，作者还研究一个诊断变体：不再将物体压缩成少量汇总 prompt token，而是将每个选定物体单独编码成 token。图 6 显示，生成最初几条路径时，解码器交叉注意力更多关注全局 prompt token（Tx-Rx 位置）；生成较晚路径时，注意力更多转向物体 token。这符合物理直觉：最初几条路径更可能是 LoS，主要取决于两端位置；后续多径则与更多环境物体发生相互作用。

**图 5（原文第 7 页）**：一个发射机对应的 AoA 方位角空间预测对比，红色标注区域显示完整 +RAG 模型改善了空间一致性。  
**图 6（原文第 7 页）**：物体 token 注意力可视化。将检索到的每个物体作为独立编码 token，在 teacher forcing rollout 下测量解码器交叉注意力。曲线表示随着预测路径索引增加，全局 prompt token 和单个物体 token 所获平均注意力权重的变化。只有最初几条路径对位置 prompt 的注意力高于环境物体，这与早期路径更可能是 LoS 一致。

### D. 跨用户—环境迁移（Cross User-Environment Transfer）

本节研究向未见用户位置的零样本迁移，以及针对目标环境的适配。表 II 比较预训练骨干在未见用户位置与未见环境中的性能。在零样本设置下，MultiPathFormer 能较好迁移至 27 个预训练环境中的留出用户，平均时延 MAE 为 0.071、功率 MAE 为 4.160、交互 F1 为 0.898。而在四个完全未见的环境中，性能明显下降，说明当目标几何未被预训练覆盖时，真正的零样本跨环境迁移依然有挑战。

不过，如果在每个目标场景上微调预训练 checkpoint，预训练模型便是比从头训练相同 +RAG 架构更好的初始化。在 31 个环境的平均结果上，时延 MAE 从 0.068 改善到 0.065，功率 MAE 从 3.081 改善到 2.888。

**表 II　基础模型迁移：27 个预训练环境留出用户、4 个新环境，以及 31 个环境的场景适配**

| 评估设置 | 时延 (μs) | 功率 (dB) | AoA 方位 (°) | AoA 俯仰 (°) | AoD 方位 (°) | AoD 俯仰 (°) | 交互准确率 | 交互 F1 |
|---|---|---|---|---|---|---|---|---|
| 预训练环境留出用户（零样本） | 0.071±0.036 | 4.160±1.818 | 22.753±9.837 | 3.736±1.669 | 20.942±8.840 | 3.108±1.469 | 0.929±0.054 | 0.898±0.082 |
| 4 个全新环境（零样本） | 0.326±0.083 | 14.153±2.893 | 60.725±5.987 | 6.545±1.136 | 61.279±6.272 | 4.998±0.533 | 0.716±0.044 | 0.557±0.087 |
| 31 场景从头训练 +RAG | 0.068±0.038 | 3.081±1.383 | 22.076±10.166 | 3.610±1.655 | 20.147±9.357 | 2.964±1.493 | 0.925±0.050 | 0.890±0.079 |
| 基础模型 + 场景微调 | 0.065±0.037 | 2.888±1.471 | 20.208±9.570 | 3.311±1.633 | 18.056±8.450 | 2.654±1.389 | 0.932±0.050 | 0.900±0.078 |

### E. 下游任务（Downstream Tasks）

接下来，在 IV 节提出的四项任务上对比路径级模型与已有信道级架构。需要注意，完整 MultiPathFormer 使用环境与发射机信息，而标准信道模型一般没有这些附加知识；不过根据表 I，即便不使用这些信息的较简单 MultiPathFormer 版本，也有望获得至少可比的表现。

**1）波束预测（Beam Prediction）。** 仿照 [18], [29]，测试模型能否利用 sub-6 GHz 信道/多径来选择毫米波波束。以下各项下游指标按相应基线共同参与的场景取平均。MultiPathFormer 的平均 Top-1 准确率为 0.671，Top-3 为 0.914，超过 MLP、WiFo 和 LWM。直观上，最优毫米波波束方向主要由主导路径的 AoD 决定；MultiPathFormer 的路径 token 明确表达该信息，而信道级模型需要从叠加后的信道张量中间接恢复相关几何结构。

**2）用户定位（User Localization）。** 表 III 还研究路径级表示能否支持反向几何推理。因为定位任务中接收机坐标本身未知，提取定位表征时会把所有依赖真实接收机坐标的码本与 RAG prompt 置零。MultiPathFormer 在三个定位指标上都最优：平均误差 5.57 m、中位数 4.15 m、90% 分位数 10.13 m。这说明解码器从多径结构中确实编码了可用于定位的几何信息，而非仅依靠包含真实接收机位置信息的码本或 RAG。

**3）LoS 分类（LoS Classification）。** 首先根据最大功率路径相对于其他路径的优势程度执行零样本 LoS 分类，得到准确率 0.976、F1 0.959，表明生成的多径已经包含 LoS/NLoS 结构。对相同骨干采用 adapter 微调后，准确率进一步达到 0.994、F1 达到 0.990，超过所有对照方法。

**4）信道估计（Channel Estimation）。** 将 IV 节的 MultiPathFormer 复用方法与信道级 LSTM、WiFo、LWM 基线进行比较。LSTM 在每个目标场景从头训练，而 MultiPathFormer、WiFo、LWM 不进行场景专属信道估计微调。阵列配置为 $1\times8$，共有 32 个子载波；观测前一半子载波，估计其余一半。表 III 表明，场景专属训练的 LSTM 得到最低 NMSE；在**未做任务专属微调的基础模型**之间，MultiPathFormer 最优。

**表 III　不同下游任务的场景平均性能**

| 模型 | 波束 Top-1 | 波束 Top-3 | 定位平均 (m) | 中位 (m) | P90 (m) | LoS 准确率 | LoS F1 | CE NMSE | CE NMSE (dB) |
|---|---|---|---|---|---|---|---|---|---|
| MLP | 0.450±0.054 | 0.672±0.087 | 82.25±17.30 | 80.82±21.59 | 131.57±22.46 | 0.936±0.092 | 0.884±0.263 | — | — |
| LSTM | — | — | — | — | — | — | — | 0.049±0.019 | -14.78±1.66 |
| WiFo | 0.369±0.057 | 0.616±0.081 | 68.79±9.08 | 58.52±9.52 | 136.00±22.61 | 0.962±0.028 | 0.946±0.040 | 1.321±0.404 | 0.93±1.56 |
| LWM | 0.429±0.037 | 0.648±0.053 | 72.78±13.30 | 69.86±15.08 | 123.60±21.73 | 0.978±0.018 | 0.968±0.028 | 1.000±0.000 | 0.00±0.00 |
| MultiPathFormer | 0.671±0.052 | 0.914±0.030 | 5.57±2.01 | 4.15±1.27 | 10.13±3.09 | 0.994±0.003 | 0.990±0.008 | 0.561±0.353 | -13.27±4.40 |

### F. 推理成本（Inference Cost）

表 IV 表明，三个 MultiPathFormer 版本均能快速推理。虽然作者在正文中笼统称每次推理约 2–3 ms，但表中实际测得 Direct 为 2.77 ms，+Codebook 为 3.39 ms，+RAG 为 3.45 ms。Direct 无需码本/RAG 查找，因而最快；完整 +RAG 虽有一定检索开销与参数增加（约 35.5M 对 35.26M），却显著提高生成保真度。因此其准确率与部署实用性具有吸引力。

**表 IV　三种架构在不同场景的平均推理开销**

| 版本 | 参数量 (M) | 推理 (ms) | 码本检索 (ms) | RAG 检索 (ms) |
|---|---:|---:|---:|---:|
| Direct | 35.256 | 2.77 | — | — |
| +Codebook | 35.261 | 3.39 | 0.92 | — |
| +RAG | 35.512 | 3.45 | 0.92 | 0.21 |

## VI. 结论与未来方向（Conclusion and Future Direction）

本文提出 MultiPathFormer，一种将多径传播而非信道张量作为预训练对象的无线基础模型。通过将每条 Tx-Rx 链路表示为自回归路径 token 序列，模型学到了可复用的路径级表征，保留主导路径结构、角度几何和传播相互作用。下一项重要工作，是在真实测量场景中验证从射线追踪数据得到的这些性能增益是否仍然成立。

## 附录（Appendix）

**a）模型架构。** MultiPathFormer 使用编码器—解码器结构，带完整 Transformer 解码器及 MLP 编码器。网络包括 12 层 Transformer，每层 8 个注意力头，隐藏维度为 1024，支持最多 25 条路径。

**b）RAG 及走廊检索配置。** 首径码本对每个发射机设置 $K=25$ 个 KMeans 聚类。环境检索设置 $K_{\rm local}=5$ 个最近局部物体、$K_{\rm corr}=5$ 个最近走廊物体、$B=8$ 个走廊区间；局部/走廊半径为 $\{25,50,100\}$ m。物体详细描述包含距离、高度、占地面积，以及可用时的材料特性（介电常数、电导率、散射系数）。

**c）训练设置。** 每个发射机下用户划分为训练/验证集，只保留至少具有一条有效路径的用户。路径时延转换为微秒，功率乘以 0.01 进行缩放，角度使用弧度。模型使用批大小 128、AdamW 及余弦退火热重启。基础模型训练 200 个 epoch，学习率 $2\times10^{-5}$，$\lambda_{\rm len}$ 和 $\lambda_{\rm int}$ 都设为 0.01。每个 epoch 的训练中，对每条路径的 20% token 随机加噪，作为数据增强，使模型能够从生成误差中恢复。

**d）评估协议。** 推理采用完整自回归生成，不使用 teacher forcing。结果先对每个用户真实多径数目下的各条路径平均，再对用户平均。

**e）环境概况。** 主要生成实验涵盖 31 个 DeepMIMO 场景。其中活跃用户数量在 25,669–320,104 之间；LoS 用户比例介于 0.042–0.763；每位活跃用户的平均路径数介于 2.3–21.4；平均 Tx-Rx 距离介于 77.8–178.7 m。不同场景既包含建筑密集城市，也包含遮挡较少的开阔区域，提供较丰富的评估条件。

## 参考文献（References）

学术书目按原论文的 [1]–[41] 编号引用，作者、会议、卷页及 DOI 等书目信息以[原文第 9–11 页](https://arxiv.org/pdf/2608.05076v1)为准。为避免转录过程引入新的书目错误，此处不擅自改写英文书目条目。正文所有引用编号与原文对应，主要引用的完整标题及出处均可在原文检索。

[1] Bommasani et al. (2021), *On the opportunities and risks of foundation models*.  
[2] Brown et al. (2020), *Language models are few-shot learners*.  
[3] Dosovitskiy et al. (2020), *An image is worth 16x16 words*.  
[4] Radford et al. (2021), *Learning transferable visual models from natural language supervision*.  
[5] Zitkovich et al. (2023), *RT-2: Vision-language-action models transfer web knowledge to robotic control*.  
[6] Reed et al. (2022), *A generalist agent*.  
[7] Devlin et al. (2019), *BERT: Pre-training of deep bidirectional transformers*.  
[8] Vaswani et al. (2017), *Attention is all you need*.  
[9] Guo et al. (2025), *DeepSeek-R1*.  
[10] Xiao et al. (2026), *Wireless AI evolution*.  
[11] Rappaport et al. (2013), *Millimeter wave mobile communications for 5G cellular*.  
[12] Rappaport et al. (2015), *Wideband millimeter-wave propagation measurements and channel models*.  
[13] 3GPP, TR 38.901 (2017).  
[14] Guo et al. (2026), *Scalable pre-trained large channel models*.  
[15] Guo et al. (2026), *Large AI models for wireless physical layer*.  
[16] Liu et al. (2025), *WiFo: Wireless foundation model for channel prediction*.  
[17] Yu et al. (2024), *ChannelGPT*.  
[18] Alikhani et al. (2024), *Large Wireless Model*.  
[19] Yang et al. (2025), *WirelessGPT*.  
[20] Jiang et al. (2025), *Towards channel foundation models*.  
[21] OpenStreetMap.  
[22] He et al. (2021), *Masked autoencoders are scalable vision learners*.  
[23] Guler et al. (2025), *Robust channel representation for wireless*.  
[24] Chen et al. (2026), *Spa-MAE*.  
[25] Sheng et al. (2025), *A wireless foundation model for multi-task prediction*.  
[26] Fontaine et al. (2024), *Towards a wireless physical-layer foundation model*.  
[27] Zhang et al. (2025), *Multi-modal data-enhanced foundation models*.  
[28] Z. Han、L. Bai、X. Cai、X. Cheng：《WiCo-MG：通过机器联觉实现多径生成的无线信道基础模型》，arXiv:2511.15026，2025。

[29] M. Alrabeiah、A. Alkhateeb：《使用 sub-6 GHz 信道进行毫米波波束及阻挡预测的深度学习方法》，*IEEE Transactions on Communications*，68(9):5504–5518，2020。

[30] A. Alkhateeb、S. Alex、P. Varkey、Y. Li、Q. Qu、D. Tujkovic：《用于高移动性毫米波系统的深度学习协同波束成形》，*IEEE Access*，6:37328–37348，2018。

[31] X. Li、J. Guo、C.-K. Wen、S. Jin：《Auto-CsiNet：面向 massive MIMO CSI 反馈的场景定制自动神经架构生成》，arXiv:2311.15950，2023。

[32] M. Soltani、V. Pourahmadi、A. Mirzaei、H. Sheikhzadeh：《基于深度学习的信道估计》，arXiv:1810.05893，2019。

[33] H. He、C.-K. Wen、S. Jin、G. Y. Li：《面向波束空间毫米波大规模 MIMO 系统的深度学习信道估计》，*IEEE Wireless Communications Letters*，7(5):852–855，2018。

[34] A. Alkhateeb：《DeepMIMO：面向毫米波及 massive MIMO 应用的通用深度学习数据集》，CoRR abs/1902.06435，2019。

[35] M. Li、T. Lv、J. Chen、L. Cui、Y. Lu、D. Florencio、C. Zhang、Z. Li、F. Wei：《TrOCR：采用预训练模型的 Transformer 光学字符识别》，*Proceedings of the AAAI Conference on Artificial Intelligence*，37(11):13094–13102，2023。

[36] E.-C. Trînc、C. Ancuți、A. Vesa、C. Simu、V.-A. Niță、C. Stolojescu-Crișan：《使用射线追踪与机器学习的三维城市室外 WiFi 7 网络规划与分析：面向高分辨率数字孪生的 Transformer 代理建模》，*Sensors*，26(7)，2026。

[37] T. S. Rappaport：《无线通信——原理与实践》（书评/相关条目），*Microwave Journal*，45(12):128–129，2002。

[38] J. Hoydis、S. Cammerer、F. A. Aoudia、A. Vem、N. Binder、G. Marcus、A. Keller：《Sionna：面向下一代物理层研究的开源库》，arXiv:2203.11854，2023。

[39] RemCom：《无线电磁传播软件》，[Wireless InSite 官方页面](https://www.remcom.com/wireless-insite-propagation-software)。

[40] NVIDIA：《Omniverse Digital Twin—Aerial Omniverse Digital Twin》，[官方文档](https://docs.nvidia.com/aerial/aerial-dt/index.html)。

[41] W. Jiang、H. D. Schotten：《用于衰落信道预测的深度学习》，*IEEE Open Journal of the Communications Society*，1:320–332，2020。
