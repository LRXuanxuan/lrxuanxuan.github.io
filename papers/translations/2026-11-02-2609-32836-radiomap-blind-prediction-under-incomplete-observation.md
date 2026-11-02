---
layout: page
title: "不完整观测下的无线电地图盲预测：误差刻画与可纠正传播先验学习｜中文全文译文"
permalink: /papers/translations/2026-11-02-2609-32836-radiomap-blind-prediction-under-incomplete-observation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a372011476d9d171/) · [原文 arXiv](https://arxiv.org/abs/2609.32836/) · [全部目录](/papers/catalog/)

# 不完整观测下的无线电地图盲预测：误差刻画与可纠正传播先验学习

**原题：** Radiomap Blind Prediction under Incomplete Observation: Error Characterization and Correctable Propagation-Prior Learning  
**作者：** Xiaojie Li、Yu Han、Han Fang、Shangqing Liu、Guangxu Zhu、Shi Jin、Chao-Kai Wen（单位按 PDF 原文转写）  
**版本：** arXiv:2609.32836v1（PDF 首页 arXiv 戳：arXiv:2609.32836v1 [eess.SP]，26 Sep 2026）；13 页；在投（arXiv 声明 submitted to IEEE for possible publication，未确认录用）。  
**范围与状态：** 全文中文译稿：摘要与索引词、正文第 I–VII 节全部正文与小节（含 §III–§V）、定理 1（含证明）、推论 1、注 1、命题 1–2（含证明）、式 (1)–(60)（保留原编号）、表 I–VI（逐格转写）、图 1 图注、参考文献 [1]–[39]（英文原条目）、原文首页作者脚注与第 3 页记号脚注；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

**作者单位（按 PDF 首页脚注转写）：** Xiaojie Li、Yu Han、Shi Jin——东南大学信息科学与工程学院，并属东南大学移动通信国家重点实验室（南京 210096，邮箱 {xiaojieli, hanyu, jinshi}@seu.edu.cn）；Han Fang——东南大学网络空间安全学院（南京 210096，邮箱 hfang@seu.edu.cn）；Shangqing Liu——南京大学计算机软件新技术国家重点实验室（南京 210023，邮箱 shangqingliu@nju.edu.cn）；Guangxu Zhu——香港中文大学（深圳）深圳市大数据研究院（广东 518172，邮箱 gxzhu@sribd.cn）；Chao-Kai Wen——台湾中山大学（National Sun Yat-sen University）通信工程研究所（高雄 80424，邮箱 chaokai.wen@mail.nsysu.edu.tw）。原文署名中的 IEEE 会员标注：Xiaojie Li（Student Member）、Yu Han、Guangxu Zhu（Member）、Shi Jin、Chao-Kai Wen（Fellow）；Han Fang 与 Shangqing Liu 未标注。原文页眉为 IEEE TRANSACTIONS ON WIRELESS COMMUNICATIONS（投稿格式）。

**作者脚注（原文第 1 页）：** 本工作的初步版本题为“Rethinking Radiomap Blind Prediction with Limited Environment and Configuration Representations”，已被 2026 IEEE Global Communications Conference（GLOBECOM）接收作报告。

## 摘要

无线电地图盲预测（radiomap blind prediction）旨在不依赖现场测量，仅从传播环境与基站（BS）配置的可观测表示推断无线电地图。在实际中，这类可观测表示本质上是不完整的。因此，当泛化到未见过的配置或环境时，目标无线电地图并不能由输入完全确定。在不完整观测下，我们建立确定性无线电地图盲预测的总体层面理论：该理论把条件均值识别为最优目标，并把预测误差分解为可约的预测器近似误差与由物理信息缺失导致的不可约不确定性。该框架进一步刻画训练—测试风险差距，以及观测丰富化所带来不确定性的下降。在此基础之上，我们揭示传播先验的双重作用：它们提供有物理依据的引导，但其可实现形式可能使可达预测器产生偏差。这促使我们提出 RadioDecomp：它把先验引导的预测器视为可纠正基座，并通过残差精化学习其剩余的、可预测的偏差。为在不同传播先验设计下评估 RadioDecomp，我们分别以特征引导的整体式基座与 LoS–Shadow 结构化基座实例化之，得到 RadioFR 与 RadioLSR。在随机、跨配置与跨环境设定下，实验证实了传播相关表示的收益，并表明两种实例均优于各自的基座。关于基座容量、训练支撑覆盖与观测粗化的进一步受控研究印证了所提出的分析。

**索引词：** 无线电地图（radiomap）、不完整观测（incomplete observation）、泛化（generalization）、残差学习（residual learning）、无线传播模型（wireless propagation model）。

## I. 引言

未来 6G 网络预计将依赖环境感知的无线电智能，这产生了对无线电地图的强烈需求——无线电地图刻画接收功率、到达角等无线电属性的空间分布 [1]。此类无线电地图对无线网络规划 [2]、优化 [3]、预测式无线资源管理 [4], [5] 以及隐蔽通信 [6], [7] 都具有价值。在实践中，通过穷举测量获取无线电地图的代价高得难以承受，这推动了大量关于无线电地图重建的研究 [8]–[10]。然而，许多应用需要为没有可用无线电地图测量的区域或网络配置提供可靠无线电地图，例如基站（BS）部署、重配置或退役时的覆盖预测。这催生了无线电地图盲预测：它仅从传播环境与基站配置的可观测表示来预测无线电地图 [11], [12]。

传统上，无线电地图盲预测主要依赖统计传播模型 [13], [14] 或射线追踪（ray tracing）[15]。统计模型从针对特定场景类别校准的经验传播律、或从网络几何的随机模型出发推断无线电地图，能够高效估计但站点特定刻画能力有限。射线追踪则在本地建模的场景内模拟传播路径，提供更精细的无线电地图刻画，但需要详细的环境与基站建模以及大量计算。

借助深度学习的进展，基于学习的方法已成为关键替代途径。此类方法直接学习从可观测环境与基站配置表示到相应无线电地图的映射。早期研究主要考察固定或简化基站配置（各向同性天线方向图）下跨不同环境的无线电地图盲预测 [16]–[18]。后续研究把该设定扩展到环境与配置同时变化的情形，显式考虑载波频率、天线方向图、阵列配置与波束赋形的变化 [12], [19]–[23]。然而，在实际盲预测中，只有部分环境与配置表示可用。这类不完整表示忽略了传播相关因素，如材料属性、细粒度几何、小散射体、室内结构与硬件非理想性。因此，同一可观测表示可能与多个产生不同无线电地图的完整物理状态相容。尽管如此，无线电地图盲预测通常仍以确定性预测器形式表述，即为每个可观测输入返回单一估计。这一反差引出了关于此类预测器所逼近的统计目标、以及在不完整观测下应如何理解其预测误差与泛化的根本问题。

理解这些问题，需要把不完整观测下的无线电地图预测与完整物理状态下的无线电地图生成区分开来。理论上，可观测因素与隐藏因素共同定义了一个完整物理状态。在该状态下，无线电地图经由最终受麦克斯韦方程组支配的电磁传播被确定性地生成。因此，物理规律性使传播知识成为无线电地图盲预测中天然且有原则的结构引导来源，尤其在训练数据有限与测试条件未见的情形下。现有方法在特征、模型与损失三个层面引入这类传播知识。特征级方法把传播知识变换为模型输入 [24]–[28]，模型级方法把传播过程编码进网络结构 [29]–[32]，损失级方法用传播规则约束模型训练 [33]–[35]。这些机制利用了有用的传播规律性，并降低了从有限样本学习的难度 [36]。然而，在不完整观测下，完整传播过程无法从可观测输入中完全刻画，而可实现的传播先验通常只捕捉选定或简化的物理规律性。因此，这类先验可能与统计最优的预测关系不一致，从而引入先验诱导的偏差（prior-induced bias）。已有研究主要强调其经验收益，而对不完整观测下这一“收益—偏差”权衡的理解仍不充分。

为处理这些问题，我们建立不完整观测下无线电地图盲预测的总体层面框架。我们用可观测物理因素与隐藏物理因素表述无线电地图生成，并把给定可观测表示下的条件均值识别为平方损失下的最优确定性预测器，从而为理解预测误差与训练—测试泛化提供统计基础。我们进一步对照该条件均值目标考察传播先验的注入，并表明：虽然传播先验可以促进有限样本学习，但其部分或简化的物理假设可能引入先验诱导的偏差。这一观察促使我们提出 RadioDecomp：它保留传播先验引导的预测器作为基座，并引入残差预测器来纠正其相对条件目标的偏差。本文的主要贡献总结如下：

- **不完整观测下的误差分析框架。** 我们建立一个总体层面框架，用于区分可由预测器改进解决的无线电地图盲预测误差、与由不完整观测导致的误差。在平方损失下，我们把条件均值无线电地图识别为最优预测目标，并把任意确定性预测器的期望误差分解为相对该目标的近似误差与不可约不确定性两部分。该框架进一步刻画这两项如何贡献于训练—测试风险差距，并证明：只要附加观测以正概率改变条件均值无线电地图，就严格降低不确定性。
- **传播先验的收益—偏差分析。** 在该框架基础上，对特征级、模型级与损失级先验注入的统一分析刻画了信息压缩偏差、结构近似偏差与损失诱导偏差。这些结果共同表明：传播先验如何促进有限样本学习，而其可实现形式又可能使可达预测器产生偏差。
- **RadioDecomp：可纠正的传播先验学习。** 我们提出 RadioDecomp，保留先验引导的无线电地图预测器作为基座，并通过残差分支学习其剩余的、可预测的偏差。两种实例考察互补的纠正需求：RadioFR 处理信息保持的特征增广下仍然存在的预测误差，而 RadioLSR 处理更受限的 LoS–Shadow 基座（配合区域特定输入）下的偏差。在随机、跨配置、跨环境与有限数据设定下的实验展示了先验引导与残差纠正的收益，而关于训练支撑覆盖与观测粗化的研究支持了理论分析。

## II. 相关工作

### A. 基于学习的无线电地图预测

早期盲预测方法主要在固定或简化的发射端配置（各向同性天线方向图）下建模环境变化。RadioUNet [16] 用建筑地图与发射机位置建立了图像到图像的预测范式，而 RME-GAN [17] 采用条件生成对抗网络进行无线电地图预测。随后 RadioDiff [18] 引入了用于无测量预测的条件扩散模型。

更近的研究把无线电地图学习扩展到配置感知。定向天线方向图通过空间增益投影被纳入 [19]，而 UniRM [20] 借助稀疏目标测量研究了跨频段与接收机高度的适配。BeamCKM [21] 与 BeamCKMDiff [22] 分别对离散与连续波束赋形配置进行了建模。配置相关覆盖还被通过解耦表示（使用真实测量）[23] 以及面向 U6G XL-MIMO 系统的显式波束地图表示 [12] 加以研究。这些研究展示了从环境感知到环境—配置联合感知预测的进展，但不完整观测下确定性盲预测的统计目标仍未被充分理解。

### B. 无线电地图预测中的传播先验

传播知识已在特征、模型与损失三个层面被引入。特征级方法为模型提供由几何、材料、衰减、遮挡或波动方程导出的传播相关表示 [24]–[28]。此类特征能把有用的传播图样呈现给无线电地图预测器，但由于依赖简化模型与不完整观测，它们可能并不准确。

模型级方法把传播假设嵌入预测器结构。现有例子包括射线追踪引导的大模型模块 [29]、传播分量的几何感知分解 [30]、互易性约束的双向高斯泼溅 [31]、物理引导的扩散架构 [32]，以及覆盖因子的解耦建模 [23]。这些结构可以提升数据效率，但结构失配可能限制假设类，并束缚其对最优预测器的近似能力。

损失级方法在训练中通过物理约束或传播感知的误差度量引入传播知识。代表性做法使用体积分方程 [33]、LoS 功率约束与 NLoS 传播时延下界 [34]、亥姆霍兹方程与边界残差 [35]，或对数功率域的预测损失 [31]。然而，近似约束及其权重可能移动原预测任务的总体最优解。

总体而言，已有研究主要展示任务特定传播先验的经验收益。对于不完整观测下它们的有限样本收益与先验诱导偏差的统一理解，以及纠正此类偏差的一般机制，仍然缺失。

## III. 不完整观测下的误差刻画

### A. 从物理生成到盲预测

设 \(E\) 表示完整物理环境，\(C\) 表示完整基站配置。前者包含传播相关的场景信息，如几何与材料属性；后者指定基站位置与发射设置，包括天线阵列、载波频率与波束赋形配置。无线电地图是某一无线电属性（如接收功率、到达角或离开角）的离散化空间表示。在此考虑的二维情形中，一个无线电地图实现表示为 \(\mathbf{y}\in\mathbb{R}^{H\times W}\)。同一表述可推广到体素化的三维无线电地图 [37], [38]。当 \(E\) 与 \(C\) 完全确定时，无线电地图生成可写为

$$
\mathbf{y}=F(E,C),\tag{1}
$$

其中 \(F\) 表示确定性传播机制。因此，全信息无线电地图生成是一个确定性正问题，原则上可用全波仿真 [39] 或高保真射线追踪数值求解。

无线电地图盲预测之所以不同，是因为预测器只接收到环境与基站配置的不完整观测。可观测环境可能遗漏细尺度几何、电磁材料属性、室内结构或小散射体。类似地，记录到的基站配置可能只包含粗粒度参数，如波束方向、3 dB 波束宽度与标称发射功率，而精确波束方向图、硬件导致的功率偏移以及其他站点特定校准参数未被记录。令 \(\mathbf{Z}=(E_{\mathrm{obs}},C_{\mathrm{obs}})\) 表示可观测表示，取值于可观测输入空间 \(\mathcal{Z}\)。\(\mathcal{Z}\) 的元素可把空间环境表示与离散、连续的基站配置变量组合在一起。令 \(\mathbf{H}\) 汇集其余隐藏传播因素。于是完整物理状态可划分为 \((\mathbf{Z},\mathbf{H})\)。相应地有

$$
\mathbf{Y}=F(\mathbf{Z},\mathbf{H}).\tag{2}
$$

对给定可观测表示 \(\mathbf{z}\)，可能有多个隐藏状态与其相容并产生不同的无线电地图。例如，可观测几何相同的场景可能在材料属性或未观测散射体上不同。相应地有¹

$$
\mathbf{Y}\mid(\mathbf{Z}=\mathbf{z})=F(\mathbf{z},\mathbf{H}),\qquad \mathbf{H}\sim p(\cdot\mid\mathbf{z}).\tag{3}
$$

> **脚注 1（原文脚注）：** 全文以粗体大写符号表示随机变量，其小写对应表示实现值。我们用 \(p(\cdot)\) 泛指概率律，涵盖离散、连续与混合情形。

尽管 \(\mathbf{H}\) 未被观测，确定性盲预测器必须为每个可观测输入 \(\mathbf{z}\) 返回单一无线电地图。这一单值映射从 \(\mathbf{Z}\) 与 \(\mathbf{Y}\) 的成对观测中学习。在平方损失下，其总体最优输出为

$$
\begin{aligned}
m^\star(\mathbf{z})&:=\arg\min_{\hat{\mathbf{y}}}\mathbb{E}\left[\|\mathbf{Y}-\hat{\mathbf{y}}\|_{\mathrm{F}}^2\mid\mathbf{Z}=\mathbf{z}\right]\\
&=\mathbb{E}[\mathbf{Y}\mid\mathbf{Z}=\mathbf{z}]=\mathbb{E}_{\mathbf{H}\sim p(\cdot\mid\mathbf{z})}\left[F(\mathbf{z},\mathbf{H})\right].
\end{aligned}\tag{4}
$$

**注 1（学习目标与误差分析视角）。** 对给定数据总体，确定性无线电地图盲预测旨在从可用观测学习一个映射 \(f:\mathcal{Z}\to\mathbb{R}^{H\times W}\)，得到单一无线电地图估计。**在平方损失下，理想预测器是条件均值映射 \(m^\star\)，学习目标就是尽可能紧密地逼近该映射。** 即便 \(f(\mathbf{Z})=m^\star(\mathbf{Z})\) 几乎必然成立，其预测仍可能与已实现的无线电地图 \(\mathbf{Y}\) 不同，因为隐藏传播因素未被观测所分辨。因此，下面的分析以 \(m^\star\) 作为参考预测器，把由 \(f\) 近似不完美造成的误差与不完整观测下的不可约不确定性区分开来，并考察这两项如何在训练域与测试域之间变化。

### B. 分域风险分解与训练—测试差距

无线电地图预测器通常在可用的环境与基站配置上训练，然后应用于未见过的环境与配置。其预测误差可能发生变化，因为可观测环境/配置分布与未记录的传播因素在训练与测试部署之间都可能不同。令 \(d\in\{\mathrm{tr},\mathrm{te}\}\) 分别索引训练域与测试域。每个域由可观测输入与未观测传播因素上的联合分布 \(p_d(\mathbf{z},\mathbf{h})\) 刻画。相应地，平方损失下的总体最优确定性预测器依赖于域：

$$
m_d^\star(\mathbf{z}):=\mathbb{E}_d[\mathbf{Y}\mid\mathbf{Z}=\mathbf{z}]=\mathbb{E}_{\mathbf{H}\sim p_d(\cdot\mid\mathbf{z})}\left[F(\mathbf{z},\mathbf{H})\right].\tag{5}
$$

相应的条件不确定性定义为

$$
v_d(\mathbf{z}):=\mathbb{E}_d\left[\|\mathbf{Y}-m_d^\star(\mathbf{z})\|_{\mathrm{F}}^2\mid\mathbf{Z}=\mathbf{z}\right].\tag{6}
$$

条件目标 \(m_d^\star\) 描述域 \(d\) 中的确定性预测目标 \(m^\star\)，而 \(v_d\) 度量由未观测因素引起的剩余无线电地图变化。当隐藏因素的条件分布不同时，这些函数可能跨域不同。独立地，不同的可观测输入分布决定了相应的逐点量在每个域内如何聚合。下面定理表明，这两个量给出域风险的精确分解。

**定理 1（分域风险分解）。** 对任意具有有限二阶矩的确定性预测器 \(f\) 与任意 \(d\in\{\mathrm{tr},\mathrm{te}\}\)，总体风险满足

$$
\begin{aligned}
R_d(f)&:=\mathbb{E}_d\left[\|\mathbf{Y}-f(\mathbf{Z})\|_{\mathrm{F}}^2\right]\\
&=\underbrace{\mathbb{E}_d\left[\|f(\mathbf{Z})-m_d^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right]}_{\mathcal{A}_d(f)}+\underbrace{\mathbb{E}_d\left[v_d(\mathbf{Z})\right]}_{\mathcal{U}_d},
\end{aligned}\tag{7}
$$

其中 \(\mathcal{A}_d(f)\) 是分域近似误差，\(\mathcal{U}_d\) 是域 \(d\) 中由不完整观测导致的不可约不确定性。

**证明。** 加、减 \(m_d^\star(\mathbf{Z})\) 得

$$
\begin{aligned}
R_d(f)&=\mathbb{E}_d\left[\|f(\mathbf{Z})-m_d^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right]+\mathbb{E}_d\left[\|\mathbf{Y}-m_d^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right]\\
&\quad+2\mathbb{E}_d\left[\langle f(\mathbf{Z})-m_d^\star(\mathbf{Z}),\,m_d^\star(\mathbf{Z})-\mathbf{Y}\rangle_{\mathrm{F}}\right].
\end{aligned}\tag{8}
$$

交叉项为零，因为 \(\mathbb{E}_d\left[\mathbf{Y}-m_d^\star(\mathbf{Z})\mid\mathbf{Z}\right]=0\)。由全期望定律，第二项等于 \(\mathbb{E}_d[v_d(\mathbf{Z})]\)，从而证明 (7)。\(\square\)

定理 1 把无线电地图预测误差分离为两个物理含义不同的来源。近似项 \(\mathcal{A}_d(f)\) 度量预测器利用已记录环境与基站配置的有效程度，而 \(\mathcal{U}_d\) 刻画与隐藏传播因素相关的剩余无线电地图变化。对固定观测与固定域，\(R_d(f)\ge\mathcal{U}_d\)，当预测器几乎必然恢复 \(m_d^\star\) 时取等号。因此，增大模型容量或改进训练可以使预测更接近条件均值无线电地图，但无法消解输入未能区分的传播差异。例如，仅依赖几何的预测器可以学到典型的衰减与遮挡图样，却仍保留与未记录材料属性相关的不确定性。因此，该分解把通过预测器改进可获得的收益、与需要更丰富物理观测才能获得的收益区分开来。由于两项都依赖于部署域，它们的共同变化决定了训练—测试风险差距。

**推论 1（训练—测试风险差距）。** 对任意固定的确定性预测器 \(f\)，

$$
R_{\mathrm{te}}(f)-R_{\mathrm{tr}}(f)=\underbrace{\mathcal{A}_{\mathrm{te}}(f)-\mathcal{A}_{\mathrm{tr}}(f)}_{\text{domain-specific approximation gap}}+\underbrace{\mathcal{U}_{\mathrm{te}}-\mathcal{U}_{\mathrm{tr}}}_{\text{conditional-uncertainty gap}}.\tag{9}
$$

推论 1 解释了为何无线电地图预测性能在模型迁移到新环境或新基站配置时可能发生显著变化。近似差距反映所学映射在测试域中对传播行为的刻画程度。当训练数据对相关布局或配置的覆盖有限时，或当不同的隐藏传播条件改变条件均值无线电地图时，该差距可能增大。不确定性差距则捕捉一个互补效应：同一可观测表示在不同域中可能留下不同数量的未解析传播变化。例如，在同一套建筑几何地图下，材料相对均匀的域可能比材料变化大量未被记录的域得到更完整的传播描述。因此，训练—测试差距既反映所学传播关系的可迁移性，也反映各域中可用物理描述的充分性。

在实践中，学习主要由可用的训练无线电地图支撑。训练数据更广的覆盖（相关环境与基站配置）有助于预测器学习训练域中的传播关系，而有效的预测器设计决定这些关系能从有限样本中被提取到什么程度。不确定性项则指向另一个问题：额外的环境或配置信息能否使目标无线电地图更可预测？这促使我们下面分析观测丰富化。

### C. 观测丰富化与条件不确定性

对无线电地图盲预测而言，观测丰富化意味着提供额外的传播相关信息，例如在建筑几何地图上增加材料属性，或在粗波束描述之外给出详细天线方向图。这类信息可能区分那些在原输入下无法区分的传播条件，从而降低可达到的最小无线电地图预测误差。

令 \(\tilde{\mathbf{Z}}\) 表示可从中恢复原观测的丰富化观测：

$$
\mathbf{Z}=\psi\left(\tilde{\mathbf{Z}}\right).\tag{10}
$$

于是 \(\tilde{\mathbf{Z}}\) 保留 \(\mathbf{Z}\) 所含的全部信息，并可能额外揭示传播相关因素。对每个域 \(d\in\{\mathrm{tr},\mathrm{te}\}\)，定义丰富化观测下的条件均值

$$
\tilde{m}_d^\star(\tilde{\mathbf{z}}):=\mathbb{E}_d\left[\mathbf{Y}\mid\tilde{\mathbf{Z}}=\tilde{\mathbf{z}}\right]\tag{11}
$$

与条件不确定性

$$
\tilde{v}_d(\tilde{\mathbf{z}}):=\mathbb{E}_d\left[\|\mathbf{Y}-\tilde{m}_d^\star(\tilde{\mathbf{z}})\|_{\mathrm{F}}^2\mid\tilde{\mathbf{Z}}=\tilde{\mathbf{z}}\right].\tag{12}
$$

令

$$
\tilde{\mathcal{U}}_d:=\mathbb{E}_d\left[\tilde{v}_d(\tilde{\mathbf{Z}})\right].\tag{13}
$$

**命题 1（观测丰富化下的单调性）。** 设所涉随机变量具有有限二阶矩，且 \(\mathbf{Z}=\psi(\tilde{\mathbf{Z}})\)。则对每个域 \(d\in\{\mathrm{tr},\mathrm{te}\}\)，

$$
v_d(\mathbf{Z})-\mathbb{E}_d\left[\tilde{v}_d(\tilde{\mathbf{Z}})\mid\mathbf{Z}\right]=\mathbb{E}_d\left[\left\|\tilde{m}_d^\star(\tilde{\mathbf{Z}})-m_d^\star(\mathbf{Z})\right\|_{\mathrm{F}}^2\mid\mathbf{Z}\right]\ge 0\tag{14}
$$

几乎必然成立。从而

$$
\mathcal{U}_d-\tilde{\mathcal{U}}_d=\mathbb{E}_d\left[\left\|\tilde{m}_d^\star(\tilde{\mathbf{Z}})-m_d^\star(\mathbf{Z})\right\|_{\mathrm{F}}^2\right]\ge 0.\tag{15}
$$

**证明。** 由于 \(\mathbf{Z}=\psi(\tilde{\mathbf{Z}})\)，\(m_d^\star(\mathbf{Z})\) 也由 \(\tilde{\mathbf{Z}}\) 确定。展开

$$
\mathbf{Y}-m_d^\star(\mathbf{Z})=\mathbf{Y}-\tilde{m}_d^\star(\tilde{\mathbf{Z}})+\tilde{m}_d^\star(\tilde{\mathbf{Z}})-m_d^\star(\mathbf{Z})
$$

并先对 \(\tilde{\mathbf{Z}}\) 条件化，可消去交叉项，因为 \(\mathbb{E}_d\left[\mathbf{Y}-\tilde{m}_d^\star(\tilde{\mathbf{Z}})\mid\tilde{\mathbf{Z}}\right]=0\)。随后对 \(\mathbf{Z}\) 条件化即证 (14)。取期望即证 (15)。\(\square\)

命题 1 给出评估附加物理观测价值的一个精确判据：不确定性的下降量等于条件均值无线电地图的期望平方变化量。因此，当附加信息能够区分此前被平均在一起的传播条件时，它就有助于降低预测极限。例如，记录材料属性可以区分几何相同场景之间的衰减行为，而详细天线方向图可以区分被粗波束描述掩盖的覆盖变化。于是，真正相关的考虑是表示所额外揭示的传播信息量。

综合来看，这些结果区分了训练数据采集、观测设计与预测器学习三者的作用。更多训练无线电地图、以及更广的环境与配置变化覆盖，有助于学习可预测的传播关系；更丰富的观测则可使此前未解析的无线电地图变化变得可预测。在可用观测固定的前提下，剩余任务就是从有限训练数据中有效利用其传播信息。传播先验通过把选定的物理关系显式化，提供了天然的引导来源，这促使我们下面分析其收益与潜在偏差。

## IV. 传播先验引导与偏差

### A. 面向预测器近似的传播引导

在可用环境与基站信息固定的情况下，无线电地图预测器设计旨在降低近似项 \(\mathcal{A}_d(f)\)。给定训练数据，最小化训练域总体风险等价于降低

$$
\mathcal{A}_{\mathrm{tr}}(f)=\mathbb{E}_{\mathrm{tr}}\left[\|f(\mathbf{Z})-m_{\mathrm{tr}}^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right],\tag{16}
$$

即学习一个逼近训练域条件目标 \(m_{\mathrm{tr}}^\star\) 的预测器。实践中，经验训练误差往往可以显著降低，例如通过增大模型容量或改进优化。然而，小的经验训练误差并不必然意味着 \(f\) 在总体层面紧密逼近 \(m_{\mathrm{tr}}^\star\)，更不意味着它在测试域能很好地逼近 \(m_{\mathrm{te}}^\star\)。为找出测试域引导的可能来源，注意两个域的条件目标都可写为

$$
m_d^\star(\mathbf{z})=\mathbb{E}_{\mathbf{H}\sim p_d(\cdot\mid\mathbf{z})}\left[F(\mathbf{z},\mathbf{H})\right],\quad d\in\{\mathrm{tr},\mathrm{te}\}.\tag{17}
$$

尽管隐藏因素的条件分布在两个域之间可能不同，两个目标都由同一物理传播机制 \(F\) 支配。因此，对 \(F\) 的部分知识可为学习那些可能从训练样本迁移到未见测试输入的关系提供与域相关的引导。这使传播知识成为改进测试域近似的天然归纳先验。

在本文中，\(\Phi\) 表示一个**传播先验**，即关于 \(F\) 的部分结构知识，例如距离相关衰减、天线辐射、LoS 传播、遮挡、反射、绕射或散射。它可通过输入特征、模型结构、训练损失或其组合注入。下面分析考察这些不同先验注入机制如何影响训练域学习问题，包括其总体解与可能的诱导偏差。

### B. 先验注入形式与诱导偏差

**1）特征级先验。** 对无线电地图盲预测而言，特征级注入把可用环境与基站信息转换为传播相关输入，例如由几何导出的遮挡指示、基于距离的衰减地图，或由记录的天线与波束赋形参数计算出的波束增益地图。对固定先验 \(\Phi\)，该构造表示为

$$
\mathbf{U}=T_\Phi(\mathbf{Z}),\tag{18}
$$

其中 \(T_\Phi\) 把选定的传播关系显式呈现给无线电地图预测器。所得特征可替代原始观测，或与原始观测一并提供，分别得到**仅先验输入**与**先验增广输入**。

**1）仅先验输入。** 考虑仅使用 \(\mathbf{U}=T_\Phi(\mathbf{Z})\) 的预测器 \(g(\mathbf{U})\)。在训练域平方损失下，其总体条件目标为

$$
\begin{aligned}
m_{\Phi,\mathrm{tr}}^\star(\mathbf{u})&:=\mathbb{E}_{\mathrm{tr}}[\mathbf{Y}\mid\mathbf{U}=\mathbf{u}]=\mathbb{E}_{\mathrm{tr}}\left[\mathbb{E}_{\mathrm{tr}}[\mathbf{Y}\mid\mathbf{Z}]\mid\mathbf{U}=\mathbf{u}\right]\\
&=\mathbb{E}_{\mathrm{tr}}\left[m_{\mathrm{tr}}^\star(\mathbf{Z})\mid T_\Phi(\mathbf{Z})=\mathbf{u}\right].
\end{aligned}\tag{19}
$$

第二个等号成立，是因为 \(\mathbf{U}=T_\Phi(\mathbf{Z})\) 关于 \(\mathbf{Z}\) 可测。

为在原始可观测空间上与 \(m_{\mathrm{tr}}^\star(\mathbf{z})\) 比较，定义其在 \(\mathbf{Z}\) 空间上的拉回：

$$
\bar{m}_{\Phi,\mathrm{tr}}^\star(\mathbf{z}):=m_{\Phi,\mathrm{tr}}^\star(T_\Phi(\mathbf{z}))=m_{\Phi,\mathrm{tr}}^\star(\mathbf{u}).\tag{20}
$$

于是，用 \(T_\Phi(\mathbf{Z})\) 替代 \(\mathbf{Z}\) 所诱导的信息压缩偏差为

$$
B_{\Phi,\mathrm{tr}}^{\mathrm{feat}}:=\mathbb{E}_{\mathrm{tr}}\left[\left\|m_{\mathrm{tr}}^\star(\mathbf{Z})-\bar{m}_{\Phi,\mathrm{tr}}^\star(\mathbf{Z})\right\|_{\mathrm{F}}^2\right].\tag{21}
$$

仅当 \(T_\Phi(\mathbf{Z})\) 保留的信息足以确定原条件目标时，该偏差为零。等价地，必须在训练分布下几乎必然存在可测函数 \(q_\Phi\) 使

$$
m_{\mathrm{tr}}^\star(\mathbf{Z})=q_\Phi(T_\Phi(\mathbf{Z}))\tag{22}
$$

成立。否则 \(B_{\Phi,\mathrm{tr}}^{\mathrm{feat}}>0\)。

对任意预测器 \(g(\mathbf{U})\)，预测误差可展开为

$$
\mathbf{Y}-g(\mathbf{U})=\mathbf{Y}-m_{\mathrm{tr}}^\star(\mathbf{Z})+m_{\mathrm{tr}}^\star(\mathbf{Z})-m_{\Phi,\mathrm{tr}}^\star(\mathbf{U})+m_{\Phi,\mathrm{tr}}^\star(\mathbf{U})-g(\mathbf{U}).\tag{23}
$$

第一分量在期望意义上与其余两项正交，因为

$$
\mathbb{E}_{\mathrm{tr}}\left[\mathbf{Y}-m_{\mathrm{tr}}^\star(\mathbf{Z})\mid\mathbf{Z}\right]=0.\tag{24}
$$

此外，

$$
\mathbb{E}_{\mathrm{tr}}\left[m_{\mathrm{tr}}^\star(\mathbf{Z})-m_{\Phi,\mathrm{tr}}^\star(\mathbf{U})\mid\mathbf{U}\right]=\mathbb{E}_{\mathrm{tr}}\left[m_{\mathrm{tr}}^\star(\mathbf{Z})\mid\mathbf{U}\right]-m_{\Phi,\mathrm{tr}}^\star(\mathbf{U})=0,\tag{25}
$$

所以第二分量在期望意义上也与第三分量正交。因此

$$
\mathbb{E}_{\mathrm{tr}}\left[\|\mathbf{Y}-g(\mathbf{U})\|_{\mathrm{F}}^2\right]=\mathcal{U}_{\mathrm{tr}}+B_{\Phi,\mathrm{tr}}^{\mathrm{feat}}+\mathbb{E}_{\mathrm{tr}}\left[\left\|m_{\Phi,\mathrm{tr}}^\star(\mathbf{U})-g(\mathbf{U})\right\|_{\mathrm{F}}^2\right].\tag{26}
$$

三项分别表示原观测下的不可约条件不确定性、把 \(\mathbf{Z}\) 压缩为 \(T_\Phi(\mathbf{Z})\) 所引起的附加误差，以及相对仅先验条件目标的预测器相关误差。特别地，即便仅基于 \(\mathbf{U}\) 的总体最优预测器，其最小风险也是 \(\mathcal{U}_{\mathrm{tr}}+B_{\Phi,\mathrm{tr}}^{\mathrm{feat}}\)。

**2）先验增广输入。** 转而考虑增广表示

$$
\mathbf{Z}_\Phi=[\mathbf{Z},T_\Phi(\mathbf{Z})].\tag{27}
$$

由于原始观测被保留，且 \(T_\Phi(\mathbf{Z})\) 由它确定性生成，\(\mathbf{Z}_\Phi\) 与 \(\mathbf{Z}\) 含有相同的总体层面信息。因此

$$
\mathbb{E}_{\mathrm{tr}}[\mathbf{Y}\mid\mathbf{Z},T_\Phi(\mathbf{Z})]=\mathbb{E}_{\mathrm{tr}}[\mathbf{Y}\mid\mathbf{Z}]=m_{\mathrm{tr}}^\star(\mathbf{Z}).\tag{28}
$$

于是，保留原始观测维持了最优无线电地图目标与 \(\mathcal{U}_{\mathrm{tr}}\)。然而，与仅先验输入相比，它给模型带来更高维的输入空间，因此要找到接近 \(m_{\mathrm{tr}}^\star\) 的映射可能需要更苛刻的有限样本搜索。

**2）模型级先验。** 模型级注入把传播知识 \(F\) 嵌入无线电地图预测器处理与组合信息的方式。一个例子是采用基于 CNN 的架构 [16]，它反映了“传播图样具有局部空间依赖性并近似平移等变”这一先验信念。另一个例子是把信号传播分解为不同分量或区段，用专门分支学习，再聚合其贡献形成最终预测 [23]。

令 \(\mathcal{H}_\Phi\) 表示由模型级先验诱导的有效假设类。由于预测器仍在 \(\mathbf{Z}\) 上运算，其训练域条件目标仍为 \(m_{\mathrm{tr}}^\star(\mathbf{Z})\)。先验转而对可用于逼近该目标的函数施加限制。由此产生的结构近似偏差为

$$
B_{\Phi,\mathrm{tr}}^{\mathrm{model}}:=\inf_{f\in\mathcal{H}_\Phi}\mathbb{E}_{\mathrm{tr}}\left[\|f(\mathbf{Z})-m_{\mathrm{tr}}^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right].\tag{29}
$$

相应地，可达到的最小训练域总体风险为

$$
\inf_{f\in\mathcal{H}_\Phi}R_{\mathrm{tr}}(f)=\mathcal{U}_{\mathrm{tr}}+B_{\Phi,\mathrm{tr}}^{\mathrm{model}}.\tag{30}
$$

当 \(\mathcal{H}_\Phi\) 中的函数能在训练分布下任意好地逼近条件均值无线电地图映射 \(m_{\mathrm{tr}}^\star\) 时，该偏差为零。否则，所施加的结构会产生即使在无限数据与理想优化下依然存在的近似误差。

**3）损失级先验。** 不失一般性，我们考虑在训练中额外加入惩罚项、以鼓励与物理传播机制一致性的无线电地图预测器。令

$$
\Omega_{\Phi,\mathrm{tr}}(f):=\mathbb{E}_{\mathrm{tr}}[\omega_\Phi(f;\mathbf{Z},\mathbf{Y})]\tag{31}
$$

表示其训练域总体形式。例子包括物理一致性惩罚、传播引导的辅助监督，以及平滑或边界约束。由此产生的总体目标为

$$
J_{\lambda,\mathrm{tr}}^{\mathrm{pop}}(f)=R_{\mathrm{tr}}(f)+\lambda\Omega_{\Phi,\mathrm{tr}}(f),\quad f\in\mathcal{H},\tag{32}
$$

其中 \(\lambda\ge0\) 控制先验强度。

损失级先验在从 \(\mathcal{H}\) 选取预测器时引入软偏好。由于 \(\mathcal{U}_{\mathrm{tr}}\) 与 \(f\) 无关，相应的总体解满足

$$
f_{\lambda,\mathrm{tr}}^\star\in\arg\min_{f\in\mathcal{H}}\left\{\mathbb{E}_{\mathrm{tr}}\left[\|f(\mathbf{Z})-m_{\mathrm{tr}}^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right]+\lambda\Omega_{\Phi,\mathrm{tr}}(f)\right\}.\tag{33}
$$

为把该偏好诱导的偏差与 \(\mathcal{H}\) 的固有近似限制区分开，定义

$$
B_{\lambda,\mathrm{tr}}^{\mathrm{loss}}:=\mathbb{E}_{\mathrm{tr}}\left[\left\|f_{\lambda,\mathrm{tr}}^\star(\mathbf{Z})-m_{\mathrm{tr}}^\star(\mathbf{Z})\right\|_{\mathrm{F}}^2\right]-\inf_{f\in\mathcal{H}}\mathbb{E}_{\mathrm{tr}}\left[\|f(\mathbf{Z})-m_{\mathrm{tr}}^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right]\ge 0.\tag{34}
$$

当损失引导的解仍是 \(m_{\mathrm{tr}}^\star\) 在 \(\mathcal{H}\) 内的最佳近似时，该偏差为零。特别地，若 \(m_{\mathrm{tr}}^\star\in\mathcal{H}\) 且同时最小化 \(\Omega_{\Phi,\mathrm{tr}}\)，则原总体最优解被保留。否则，在固定非零 \(\lambda\) 下，不相容的惩罚可能使所选解偏离条件目标，即使数据无限且优化理想。

**讨论。** 对无线电地图盲预测而言，传播先验可通过呈现辐射相关特征、组织预测器的模型分量、或设计引导训练中物理一致性的损失来促进学习。其潜在偏差通过不同机制产生：特征替代可能丢弃有信息量的观测细节，架构限制可能约束可表示的映射，不相容的损失惩罚可能偏好不准确的传播关系。虽然特征增广保持条件均值目标，但更高的输入维数可能使在有限数据与有限优化下识别有效无线电地图映射更为困难。原则上，若注入机制的设计保留了恢复条件均值无线电地图所需的信息、表示能力或损失相容性，每种机制都可避免总体层面的偏差。然而在实践中，这些设计是在不完整观测、有限训练数据与选定传播假设下做出的；它们与不完整观测下最优映射的相容性通常难以保证。这促使我们设计一种既保留传播引导、又允许数据驱动纠正其剩余可预测偏差的预测器。

## V. RadioDecomp：可纠正的传播先验学习

### A. RadioDecomp 表述

对无线电地图盲预测，令 \(b_\Phi(\mathbf{z})\) 表示通过第 IV 节注入机制、由可观测环境与基站配置生成的先验引导无线电地图估计。目标仍是条件均值无线电地图 \(m^\star(\mathbf{z})\)。基座估计可能因信息压缩、结构限制、不相容先验损失或有限样本学习而偏离该目标。为在保留已编码传播引导的同时纠正这些潜在偏差，我们提出 **RadioDecomp**，用一个数据驱动残差纠正来增广先验引导基座：

$$
\hat{\mathbf{y}}=b_\Phi(\mathbf{z})+r\left(\mathbf{z},b_\Phi(\mathbf{z})\right).\tag{35}
$$

残差分支接收 \(\mathbf{z}\) 以利用基座未捕捉的可观测线索，并接收 \(b_\Phi(\mathbf{z})\) 以把纠正条件化于被纠正的预测。虽然 \(b_\Phi(\mathbf{z})\) 因在给定 \(\mathbf{z}\) 时确定而不加入新的可观测信息，但它充当传播引导的预测锚点。于是基座提供先验引导，残差分支纠正其有数据支持的偏差。

为把这种可纠正性形式化，我们考虑固定的先验引导基座预测器。令 \(\mathcal{H}_R\) 表示残差假设类，并定义

$$
\mathcal{H}_{\mathrm{RD}}(b_\Phi):=\left\{f:f(\mathbf{z})=b_\Phi(\mathbf{z})+r\left(\mathbf{z},b_\Phi(\mathbf{z})\right),\ r\in\mathcal{H}_R\right\}.
$$

**命题 2（残差可纠正性）。** 若零函数属于残差类，即 \(0\in\mathcal{H}_R\)，则对任意 \(d\in\{\mathrm{tr},\mathrm{te}\}\)，

$$
\inf_{f\in\mathcal{H}_{\mathrm{RD}}(b_\Phi)}\mathbb{E}_d\left[\|f(\mathbf{Z})-m_d^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right]\le\mathbb{E}_d\left[\|b_\Phi(\mathbf{Z})-m_d^\star(\mathbf{Z})\|_{\mathrm{F}}^2\right].\tag{36}
$$

此外，在平方损失下，域 \(d\) 中残差分支的逐点总体目标为

$$
r_{\Phi,d}^\star\left(\mathbf{z},b_\Phi(\mathbf{z})\right)=m_d^\star(\mathbf{z})-b_\Phi(\mathbf{z}).\tag{37}
$$

**证明。** 因为 \(0\in\mathcal{H}_R\)，取 \(r\equiv0\) 即恢复 \(b_\Phi\)。因此 \(b_\Phi\in\mathcal{H}_{\mathrm{RD}}(b_\Phi)\)，从而证明 (36)。

对固定基座预测器，\(b_\Phi(\mathbf{Z})\) 在给定 \(\mathbf{Z}\) 时确定。因此对任意 \(d\in\{\mathrm{tr},\mathrm{te}\}\)，

$$
\begin{aligned}
\mathbb{E}_d\left[\mathbf{Y}-b_\Phi(\mathbf{Z})\mid\mathbf{Z}=\mathbf{z}\right]&=\mathbb{E}_d\left[\mathbf{Y}\mid\mathbf{Z}=\mathbf{z}\right]-b_\Phi(\mathbf{z})\\
&=m_d^\star(\mathbf{z})-b_\Phi(\mathbf{z}).
\end{aligned}\tag{38}
$$

由于条件均值最小化条件平方损失，(37) 得证。\(\square\)

命题 2 表明：零残差恢复 \(b_\Phi\)，而域 \(d\) 中的总体最优残差以 \(m_d^\star-b_\Phi\) 为目标。于是 RadioDecomp 在保留基座预测的同时，使其可预测的、与域相关的偏差可被纠正。

### B. 代表性实例

RadioDecomp 不绑定特定传播先验或基座架构。为在不同先验引导预测器下评估其有效性，我们给出两种实例，考察无线电地图盲预测中互补的纠正需求。RadioFR 考察特征增广下的残差纠正，而 RadioLSR 考察更受限传播引导预测下的纠正。RadioFR 联合处理可用表示，以评估在特征增广不引入信息压缩偏差时的纠正。RadioLSR 则使用 LoS–Shadow 划分与受限分支输入，给出更严格的传播先验设定。这些实例展示了通用“基座 + 残差”框架如何应用于不同形式的先验注入。我们先介绍两种实例共享的可观测表示与传播先验表示。

**1）共享表示与两阶段训练。** 对每个无线电地图样本，可观测表示包含环境描述与基站配置。环境由高度地图 \(\mathbf{G}\in\mathbb{R}^{H\times W}\) 表示，而基站配置指定天线阵列、载波频率、发射功率与波束赋形参数。基于可观测环境与配置，构造若干确定性传播相关表示。这些表示揭示出原本需要完全从有限训练样本推断的、具有物理意义的关系。

第一，波束地图 \(\mathbf{B}\in\mathbb{R}^{H\times W}\) 表示解析生成的 LoS 波束赋形功率。令 \(k\in\{1,\ldots,HW\}\) 表示一个空间格点。波束地图取值定义为 [12]

$$
B_k=\frac{\lambda^2}{(4\pi)^2}P_t\left|\mathbf{w}^{\mathrm{H}}\mathbf{h}_k^{\mathrm{LoS}}\right|^2,\tag{39}
$$

其中 \(\lambda\) 为波长，\(P_t\) 为发射功率，\(\mathbf{w}\) 为波束赋形向量，\(\mathbf{h}_k^{\mathrm{LoS}}\) 表示格点 \(k\) 处解析生成的 LoS 信道。因此波束地图揭示配置相关的直达覆盖图样。

第二，从高度地图提取两个方向边缘地图：

$$
\mathbf{E}^{(x)}=\mathcal{D}_x(\mathbf{G}),\qquad\mathbf{E}^{(y)}=\mathcal{D}_y(\mathbf{G}),\tag{40}
$$

其中 \(\mathcal{D}_x(\cdot)\) 与 \(\mathcal{D}_y(\cdot)\) 表示沿两个空间轴的方向边缘算子。边缘地图揭示可能影响遮挡、反射与绕射的几何边界。

第三，由可观测几何与基站位置构造遮挡得分地图 \(\mathbf{S}\in\mathbb{R}^{H\times W}\)。对格点 \(k\)，在 \(M\) 个中间位置对基站—格点线段采样：

$$
S_k=\frac{1}{M}\sum_{m=1}^{M}\left[h_{\mathrm{bld}}\left(\mathbf{p}_{\mathrm{BS}}+t_m(\mathbf{p}_k-\mathbf{p}_{\mathrm{BS}})\right)-h_{\mathrm{ray}}(t_m)\right]_+,\tag{41}
$$

其中 \(\mathbf{p}_{\mathrm{BS}}\) 与 \(\mathbf{p}_k\) 分别表示基站与格点 \(k\) 的水平位置，\(\{t_m\}_{m=1}^{M}\subset(0,1)\) 为插值因子，\(h_{\mathrm{bld}}(\cdot)\) 表示建筑高度，\(h_{\mathrm{ray}}(t_m)\) 表示直达基站—格点线段的高度，\([a]_+=\max(a,0)\)。遮挡得分在送入网络前被裁剪并归一化。

预测只在有效非建筑区域上进行。令 \(\mathbf{M}_{\mathrm{valid}}\in\{0,1\}^{H\times W}\) 表示相应的二值掩码。传播特征表示写为

$$
\mathbf{X}_\Phi=\left[\mathbf{B},\mathbf{G},\mathbf{E}^{(x)},\mathbf{E}^{(y)},\mathbf{S}\right].\tag{42}
$$

波束地图、方向边缘地图与遮挡得分都是可用环境与配置信息的确定性变换。因此，它们并不构成命题 1 意义上的真正观测丰富化。相反，它们把原观测重组为传播相关表示，作为特征级传播先验。RadioFR 与 RadioLSR 由相同的底层可观测环境与配置信息构造。然而，它们按各自的先验引导基座结构，以不同方式组织并提供上述表示。

在后续训练中，令 \(\mathbf{y}\) 表示归一化的真值无线电地图。对预测 \(\mathbf{a}\)、目标 \(\mathbf{b}\) 与二值掩码 \(\mathbf{M}\)，定义掩码平方 \(L_2\) 损失为

$$
\ell_{\mathrm{mask}}^{(2)}(\mathbf{a},\mathbf{b};\mathbf{M})=\frac{\left\|(\mathbf{a}-\mathbf{b})\odot\mathbf{M}\right\|_{\mathrm{F}}^2}{\max\left(\|\mathbf{M}\|_1,1\right)}.\tag{43}
$$

两种实例都遵循两阶段训练流程。先验引导基座先用其模型特定目标训练，然后冻结。随后仅优化残差分支，使其在掩码平方 \(L_2\) 损失下拟合训练无线电地图与冻结基座预测之间的差值。RadioFR 与 RadioLSR 中所有预测分支都使用表 I 总结的公共 U-Net 骨干，其中 \(C_b\) 表示每个分支的初始通道宽度。

**表 I（原文 TABLE I）：** 预测分支使用的统一 U-Net 骨干。

| 阶段 | 规格 |
|---|---|
| 编码器 | DoubleConv(\(C_b\))，然后 3×[MaxPool + DoubleConv]；通道数：\(2C_b\)、\(4C_b\)、\(8C_b\) |
| 瓶颈层 | DoubleConv(\(8C_b\)) |
| 解码器 | 3×[Up + skip concat + DoubleConv]；通道数：\(4C_b\)、\(2C_b\)、\(C_b\) |
| 输出 | 1×1 卷积，单输出通道 |

**2）RadioFR（特征—残差预测）。** RadioFR 用联合使用全部传播相关特征预测无线电地图的整体式网络实现 RadioDecomp。式 (42) 中的特征表示被直接送入 U-Net：

$$
b_{\mathrm{F}}(\mathbf{z})=f_{\mathrm{F}}(\mathbf{X}_\Phi)\odot\mathbf{M}_{\mathrm{valid}},\tag{44}
$$

这里整体式 U-Net \(f_{\mathrm{F}}\) 联合处理所有输入通道。相对高度地图与波束地图输入，加入边缘与遮挡特征保留了可用信息，不引入压缩偏差。然而，有限容量、有限训练数据与不完美优化仍可能留下可预测的无线电地图误差。因此 RadioFR 检验在这一通用特征增广设定下残差纠正是否仍然有用。残差分支接收相同特征以及基座无线电地图：

$$
\mathbf{X}_{\mathrm{R,F}}=\left[\mathbf{B},\mathbf{G},\mathbf{E}^{(x)},\mathbf{E}^{(y)},\mathbf{S},b_{\mathrm{F}}(\mathbf{z})\right].\tag{45}
$$

残差预测为

$$
\hat{\mathbf{r}}_{\mathrm{F}}=g_{\mathrm{F}}(\mathbf{X}_{\mathrm{R,F}})\odot\mathbf{M}_{\mathrm{valid}},\tag{46}
$$

其中 \(g_{\mathrm{F}}\) 用另一个 U-Net 实现。最终 RadioFR 预测为

$$
\hat{\mathbf{y}}_{\mathrm{F}}=b_{\mathrm{F}}(\mathbf{z})+\hat{\mathbf{r}}_{\mathrm{F}}.\tag{47}
$$

在第一训练阶段，特征引导基座用下式优化：

$$
\mathcal{L}_{\mathrm{base,F}}=\ell_{\mathrm{mask}}^{(2)}\left(b_{\mathrm{F}}(\mathbf{z}),\mathbf{y};\mathbf{M}_{\mathrm{valid}}\right).\tag{48}
$$

在第二阶段，训练好的基座被冻结，残差目标定义为

$$
\mathbf{y}_{\mathrm{res,F}}=\mathbf{y}-b_{\mathrm{F}}(\mathbf{z}).\tag{49}
$$

随后仅用下式优化残差分支：

$$
\mathcal{L}_{\mathrm{res,F}}=\ell_{\mathrm{mask}}^{(2)}\left(\hat{\mathbf{r}}_{\mathrm{F}},\mathbf{y}_{\mathrm{res,F}};\mathbf{M}_{\mathrm{valid}}\right).\tag{50}
$$

**3）RadioLSR：LoS–Shadow–残差预测。** RadioLSR 考察一种更受限的传播引导基座，用于无线电地图盲预测。它用遮挡得分划分预测区域，并为两个分支分配不同输入：LoS 区域使用波束地图，Shadow 区域使用波束地图与遮挡得分。该设计强调直达覆盖与遮挡趋势，同时限制基座预测可用的几何信息。基于遮挡得分，LoS 与 Shadow 掩码定义为

$$
\mathbf{M}_{\mathrm{LoS}}=\mathbb{I}(\mathbf{S}\le\epsilon)\odot\mathbf{M}_{\mathrm{valid}},\qquad
\mathbf{M}_{\mathrm{Shd}}=\mathbb{I}(\mathbf{S}>\epsilon)\odot\mathbf{M}_{\mathrm{valid}},\tag{51}
$$

其中 \(\epsilon\) 为遮挡得分阈值。两个掩码满足

$$
\mathbf{M}_{\mathrm{LoS}}+\mathbf{M}_{\mathrm{Shd}}=\mathbf{M}_{\mathrm{valid}}.\tag{52}
$$

LoS 分支用波束地图估计直达覆盖趋势：

$$
\hat{\mathbf{y}}_{\mathrm{LoS}}=f_{\mathrm{LoS}}(\mathbf{B})\odot\mathbf{M}_{\mathrm{LoS}},\tag{53}
$$

其中 \(f_{\mathrm{LoS}}\) 用 U-Net 实现。Shadow 分支联合使用波束地图与遮挡得分：

$$
\hat{\mathbf{y}}_{\mathrm{Shd}}=f_{\mathrm{Shd}}([\mathbf{B},\mathbf{S}])\odot\mathbf{M}_{\mathrm{Shd}},\tag{54}
$$

其中 \(f_{\mathrm{Shd}}\) 是另一个 U-Net。于是 LoS–Shadow 结构化基座为

$$
\begin{aligned}
b_{\mathrm{LS}}(\mathbf{z})&=\hat{\mathbf{y}}_{\mathrm{LoS}}+\hat{\mathbf{y}}_{\mathrm{Shd}}\\
&=f_{\mathrm{LoS}}(\mathbf{B})\odot\mathbf{M}_{\mathrm{LoS}}+f_{\mathrm{Shd}}([\mathbf{B},\mathbf{S}])\odot\mathbf{M}_{\mathrm{Shd}}.
\end{aligned}\tag{55}
$$

两个分支在其各自区域内由总无线电地图监督。然而，其受限输入可能遗漏几何相关的覆盖变化，包括与反射、绕射相关的变化。因此残差分支在波束地图与基座预测之外还接收高度地图与边缘地图，以恢复基座无法获得的可预测空间细节：

$$
\mathbf{X}_{\mathrm{R,LS}}=\left[\mathbf{B},\mathbf{G},\mathbf{E}^{(x)},\mathbf{E}^{(y)},b_{\mathrm{LS}}(\mathbf{z})\right].\tag{56}
$$

残差预测为

$$
\hat{\mathbf{r}}_{\mathrm{LS}}=g_{\mathrm{LS}}(\mathbf{X}_{\mathrm{R,LS}})\odot\mathbf{M}_{\mathrm{valid}},\tag{57}
$$

其中 \(g_{\mathrm{LS}}\) 用 U-Net 实现。最终 RadioLSR 预测为

$$
\hat{\mathbf{y}}_{\mathrm{LS}}=b_{\mathrm{LS}}(\mathbf{z})+\hat{\mathbf{r}}_{\mathrm{LS}}.\tag{58}
$$

在第一训练阶段，LoS 与 Shadow 分支用下式在各自区域上优化：

$$
\mathcal{L}_{\mathrm{base,LS}}=\lambda_{\mathrm{LoS}}\ell_{\mathrm{mask}}^{(2)}\left(\hat{\mathbf{y}}_{\mathrm{LoS}},\mathbf{y};\mathbf{M}_{\mathrm{LoS}}\right)
+\lambda_{\mathrm{Shd}}\ell_{\mathrm{mask}}^{(2)}\left(\hat{\mathbf{y}}_{\mathrm{Shd}},\mathbf{y};\mathbf{M}_{\mathrm{Shd}}\right),\tag{59}
$$

其中 \(\lambda_{\mathrm{LoS}}\ge0\) 与 \(\lambda_{\mathrm{Shd}}\ge0\) 分别为 LoS 与 Shadow 区域目标的权重。

在第二阶段，训练好的基座分支被冻结，仅用下式优化 \(g_{\mathrm{LS}}\)：

$$
\mathcal{L}_{\mathrm{res,LS}}=\ell_{\mathrm{mask}}^{(2)}\left(\hat{\mathbf{r}}_{\mathrm{LS}},\mathbf{y}-b_{\mathrm{LS}}(\mathbf{z});\mathbf{M}_{\mathrm{valid}}\right).\tag{60}
$$

## VI. 实验

实验中，我们验证前述分析，并在不同训练与评估条件下评估 RadioDecomp 的有效性。

### A. 实验设置

**1）数据集与评估协议。** 实验在 U6G XL-MIMO 无线电地图数据集 [12] 上进行，该数据集包含由 800 个城市场景与 98 个基站配置生成的 78,400 幅无线电地图。每个样本包含一个可观测环境表示、一个基站配置表示，以及一幅 \(128\times128\) 的接收功率无线电地图。除非另有说明，数据集按 \(6/1/3\) 的训练/验证/测试比例划分，随机种子为 42。考虑三种评估协议：

- **Random（随机）：** 全部无线电地图样本被随机划分为训练、验证与测试集。
- **Cross-config（跨配置）：** 用于测试的基站配置与用于训练的不相交。
- **Cross-env（跨环境）：** 用于测试的城市场景与用于训练的不相交。

**2）对比预测器。** 考虑以下受控预测器：

- **Vanilla：** 一个独立 U-Net，直接由可观测环境与基站配置预测无线电地图。环境由高度地图表示，基站配置由二值 3 dB 波束掩码表示。
- **BaseFR：** 第 V-B2 节定义的特征引导整体式基座，不含残差纠正。
- **RadioFR：** 第 V-B2 节定义的特征引导整体式实例。
- **BaseLSR：** 第 V-B3 节定义的 LoS–Shadow 结构化基座，不含残差纠正。
- **RadioLSR：** 第 V-B3 节定义的完整 LoS–Shadow–残差实例。

除非另有说明，所有实验使用以下初始通道宽度。BaseFR 使用 \(C_b=32\)，而 RadioFR 的基座与残差分支都使用 \(C_b=32\)。对 BaseLSR 与 RadioLSR，LoS 与 Shadow 分支各使用 \(C_b=16\)；RadioLSR 的残差分支使用 \(C_b=32\)。

**3）训练与指标。** 所有预测器用 AdamW 优化，批大小 32，初始学习率 \(10^{-3}\)。所有训练目标使用式 (43) 定义的掩码平方 \(L_2\) 损失。RadioFR 与 RadioLSR 分两阶段训练：先训练基座预测器，然后冻结，之后仅优化残差分支。除非另有说明，每个训练阶段使用 60 个 epoch，并保留验证损失最低的检查点。对 RadioLSR 基座，\(\lambda_{\mathrm{LoS}}=\lambda_{\mathrm{Shd}}=0.5\)。

性能在有效非建筑区域上评估。报告训练与测试均方根误差（RMSE）以度量平方误差性能，并额外给出测试平均绝对误差（MAE），作为对大幅局部误差较不敏感的平均预测误差补充指标。

### B. 传播先验引导与残差纠正

我们首先在三种评估协议下评估传播先验注入的效果与残差可纠正性。表 II 比较所考虑的预测器。

**表 II（原文 TABLE II）：** \(6/1/3\) 随机、跨配置与跨环境协议下的训练 RMSE 与测试 RMSE/MAE（dB）。原文以粗体标出各列最优值（表注未说明标记含义，此处按 PDF 渲染所见转写）。

| 方法 | Random 训练 RMSE | Random 测试 RMSE | Random 测试 MAE | Cross-config 训练 RMSE | Cross-config 测试 RMSE | Cross-config 测试 MAE | Cross-env 训练 RMSE | Cross-env 测试 RMSE | Cross-env 测试 MAE |
|---|---|---|---|---|---|---|---|---|---|
| Vanilla | 5.7382 | 5.9414 | 4.0935 | 5.7474 | 11.3364 | 8.7591 | 8.5897 | 11.6593 | 8.3522 |
| BaseFR | 3.4333 | 3.6075 | 2.1264 | 3.7145 | 6.4390 | 4.6388 | 6.1419 | 8.1933 | 4.7766 |
| RadioFR | 3.3841 | 3.5588 | 2.0856 | 3.0630 | **5.9706** | **4.2466** | **4.8478** | **7.8755** | **4.4046** |
| BaseLSR | 7.2615 | 7.2742 | 3.7781 | 7.2774 | 11.0581 | 8.2632 | 8.4982 | 10.0741 | 5.3493 |
| RadioLSR | **3.2009** | **3.4356** | **1.8905** | **3.0369** | 9.1946 | 7.1526 | 5.9953 | 8.0501 | 4.4138 |

在随机协议下，所有预测器的训练与测试 RMSE 值都保持接近，差距低于 0.24 dB。这证实随机划分只产生很小的训练—测试差距。相反，在跨配置与跨环境协议下，差距显著增大。在三种协议下，Vanilla 在测试 RMSE 与 MAE 上都被 BaseFR、RadioFR 与 RadioLSR 稳定超越。特别地，与 Vanilla 相比，BaseFR 在随机、跨配置与跨环境协议下分别把测试 RMSE 降低 2.3339、4.8974 与 3.4660 dB。由于 BaseFR 不含残差纠正，这些改进展示了注入传播相关表示的收益。BaseLSR 并未提供一致更好的独立性能，因为其 LoS–Shadow 结构只刻意建模选定的传播效应，把其余偏差留给残差纠正。

与该设计一致，残差纠正在三种协议下都改进了两个先验引导基座。相对 BaseFR，RadioFR 把测试 RMSE 分别降低 0.0487、0.4684 与 0.3178 dB。对 BaseLSR 的纠正更明显：RadioLSR 把测试 RMSE 分别降低 3.8386、1.8635 与 2.0240 dB。在两个结构不同的基座上都取得一致改进，支持 RadioDecomp 在纠正其剩余可预测偏差方面的有效性。

图 1 给出两种分布偏移协议下的代表性空间比较。RadioFR 精化了 BaseFR 捕捉到的局部覆盖细节，并降低相应的局部误差。在跨配置设定中，从 BaseLSR 到 RadioLSR 的纠正尤为明显：残差分支捕捉到 LoS–Shadow 基座未能表示的额外空间变化，这些变化可能来自反射等复杂传播交互。这些结果从视觉上支持 RadioDecomp 的纠正作用。

**图 1（原文 Fig. 1）：** 在代表性跨配置与跨环境测试样本上的定性比较：无线电地图与误差图分别使用统一的接收功率色标与误差色标，白色区域表示被掩码的建筑，每幅误差图下方给出该样本的 RMSE 与 MAE。（图中排版：两行分别为 Cross-config 与 Cross-env 样本；列为 Target 与 BaseFR/RadioFR/BaseLSR/RadioLSR，每个方法给出 Prediction 与 Absolute error 两幅子图；图中色标为接收功率（dBm，约 \(-160\) 至 \(-100\)）与绝对误差（dB，0 至 30）。Cross-config 行各方法的 RMSE/MAE：BaseFR 6.37/5.11 dB、RadioFR 5.12/4.00 dB、BaseLSR 8.01/6.05 dB、RadioLSR 5.58/4.44 dB；Cross-env 行：BaseFR 6.57/5.03 dB、RadioFR 5.51/3.57 dB、BaseLSR 7.78/5.36 dB、RadioLSR 6.63/4.99 dB。）

### C. 极端有限监督下的传播先验学习

在实际部署中，为目标区域获取足够无线电地图可能代价高昂。因此我们在随机协议下把训练集限制为仅 10 幅无线电地图，以评估极端有限监督下的 RadioDecomp。该实验中每个训练阶段使用 200 个 epoch。结果见表 III。

**表 III（原文 TABLE III）：** 随机协议下仅使用 10 幅训练无线电地图时的预测性能。原文以粗体标出各列最优值（表注未说明标记含义，按 PDF 渲染所见转写）。

| 方法 | 训练 RMSE | 测试 RMSE | 测试 MAE |
|---|---|---|---|
| Vanilla | 14.9871 | 17.9310 | 13.6009 |
| BaseFR | 12.3616 | 15.6376 | 11.0481 |
| BaseLSR | 11.6288 | 20.8432 | 11.8843 |
| RadioFR | 11.2497 | **14.4285** | 10.4248 |
| RadioLSR | **7.9732** | 19.6369 | **9.3178** |

与标准随机协议相比，十样本设定产生明显更大的训练—测试差距。所有预测器的测试 RMSE 至少比训练 RMSE 高 2.9439 dB，而表 II 中相应的（随机）差距低于 0.24 dB。Vanilla 表现出最小的训练—测试 RMSE 差距 2.9439 dB。这可能部分源于其更简单的输入表示与更弱的训练拟合，因为它同时具有最高的训练 RMSE。此外，BaseFR 把测试 RMSE 从 17.9310 降到 15.6376 dB，把测试 MAE 从 13.6009 降到 11.0481 dB，表明在标注无线电地图稀缺时传播相关表示仍然有益。

残差纠正改进两个先验引导基座。相对 BaseFR，RadioFR 把训练 RMSE 降低 1.1119 dB、测试 RMSE 降低 1.2091 dB，取得最低测试 RMSE 14.4285 dB。相对 BaseLSR，RadioLSR 把训练 RMSE 降低 3.6556 dB、测试 RMSE 降低 1.2063 dB、测试 MAE 降低 2.5665 dB。这些一致的下降支持 RadioDecomp 在极端有限监督下的有效性。

RadioLSR 取得最低测试 MAE 9.3178 dB，尽管其测试 RMSE 仍相对较高。其 LoS–Shadow 划分可能使主导传播图样在大多数位置上更易拟合，从而降低平均绝对误差，但在复杂或划分不完美的区域留下少量大误差。这些局部误差在 RMSE 中获得大得多的权重，这解释了两种指标之间的分化。

### D. 跨特征引导基座容量的残差纠正

虽然特征拼接不改变总体条件目标，但从有限样本学到的基座预测器仍可能保留优化偏差。我们通过在 \(C_b\in\{32,48,64,96\}\) 上改变 BaseFR 的初始通道宽度来考察这一效应。对每个宽度，RadioFR 使用相应的冻结 BaseFR 与固定宽度 32 的残差分支。² 表 IV 报告三种评估协议下的结果。

**表 IV（原文 TABLE IV）：** 三种评估协议下跨特征引导基座容量的残差纠正；所有 RadioFR 残差分支使用 \(C_b=32\)，粗体表示每一 BaseFR–RadioFR 对中较低的误差。

| 方法 | 参数量 | Random 训练 RMSE | Random 测试 RMSE | Random 测试 MAE | Cross-config 训练 RMSE | Cross-config 测试 RMSE | Cross-config 测试 MAE | Cross-env 训练 RMSE | Cross-env 测试 RMSE | Cross-env 测试 MAE |
|---|---|---|---|---|---|---|---|---|---|---|
| BaseFR-32 | 3.1295M | 3.4333 | 3.6075 | 2.1264 | 3.7145 | 6.4390 | 4.6388 | 6.1419 | 8.1933 | 4.7766 |
| BaseFR-48 | 7.0375M | 2.9885 | 3.2183 | 1.9032 | 2.7451 | 5.5745 | 3.9754 | 4.6841 | 8.0554 | 4.4492 |
| BaseFR-64 | 12.5075M | 2.5282 | 2.8246 | 1.6136 | 2.5515 | 5.6783 | 4.0489 | 4.9321 | 7.9993 | 4.4656 |
| BaseFR-96 | 28.1340M | 2.5231 | 2.8096 | 1.6132 | 2.1523 | **5.7090** | 4.0976 | 4.1787 | 8.0248 | 4.2922 |
| RadioFR-32 | 6.2594M | **3.3841** | **3.5588** | **2.0856** | **3.0630** | **5.9706** | **4.2466** | **4.8478** | **7.8755** | **4.4046** |
| RadioFR-48 | 10.1673M | **2.7781** | **3.0476** | **1.7520** | **2.7298** | **5.5734** | **3.9512** | **4.1774** | **7.7778** | **4.2241** |
| RadioFR-64 | 15.6373M | **2.4831** | **2.7865** | **1.5862** | **2.5248** | **5.5063** | **3.8939** | **4.2651** | **7.6678** | **4.1429** |
| RadioFR-96 | 31.2638M | **2.5185** | **2.8065** | **1.6042** | **2.1504** | 5.7128 | **4.0915** | **3.9909** | **7.8003** | **4.2199** |

> **脚注 2（原文脚注）：** 固定残差容量提供了跨基座宽度的受控比较；更宽的残差分支可能提供额外纠正，但此处未予考虑。

在随机与跨配置协议下，残差纠正在较小或中等基座宽度下更有益。最大的 RMSE 下降在随机协议下为 0.1707 dB，在跨配置下为 0.4684 dB。在 \(C_b=96\) 时，随机与跨配置协议下的绝对 RMSE 差异仅为 0.0031 与 0.0038 dB，且在后一情形 RadioFR 略差。这些结果提示，足够有表达力的 BaseFR 在这些设定下能捕捉大部分可预测关系。特别地，解析构造的波束地图直接表示配置相关辐射，这可能限制跨配置评估下剩余的可纠正偏差。

跨环境下出现不同模式：RadioFR 在每个宽度上都把测试 RMSE 降低 0.2245 至 0.3315 dB。跨环境预测涉及未见空间布局，其可观测几何特征与无线电地图之间的关系未被训练样本完全覆盖。因此残差分支对纠正相对特征引导基座的有限样本误差仍然有用。RadioFR-64 在参数更少的情况下也取得比 BaseFR-96 更低的跨环境 RMSE（7.6678 对 8.0248 dB），表明该收益不能仅归因于模型容量增加。

### E. 固定测试域下的训练支撑覆盖

推论 1 引出一个实际的数据采集问题：当目标是在预先指定的目标域上最小化预测误差时，训练数据应优先覆盖相关环境、相关基站配置，还是两者？为隔离该选择如何影响训练—测试差距，我们保持测试集固定。因此测试可观测分布与条件不确定性项保持不变，性能差异主要反映所选训练数据如何影响所学预测器在同一目标域上的表现。

我们把 800 个环境划分为 \(\mathcal{E}_{\mathrm{te}}\) 与 \(\mathcal{E}_{\mathrm{other}}\)，各含 400 个环境；把 98 个配置划分为 \(\mathcal{C}_{\mathrm{te}}\) 与 \(\mathcal{C}_{\mathrm{other}}\)，各含 49 个配置。固定测试集为 \(\mathcal{D}_{\mathrm{te}}=\mathcal{E}_{\mathrm{te}}\times\mathcal{C}_{\mathrm{te}}\)，包含 19,600 幅无线电地图。我们考虑四种固定预算训练策略：

- **Both Covered（两者覆盖）：** \((\mathcal{E}_{\mathrm{te}}\times\mathcal{C}_{\mathrm{other}})\cup(\mathcal{E}_{\mathrm{other}}\times\mathcal{C}_{\mathrm{te}})\)；
- **Environment Only（仅环境）：** \(\mathcal{E}_{\mathrm{te}}\times\mathcal{C}_{\mathrm{other}}\)；
- **Configuration Only（仅配置）：** \(\mathcal{E}_{\mathrm{other}}\times\mathcal{C}_{\mathrm{te}}\)；
- **Neither Covered（均未覆盖）：** \(\mathcal{E}_{\mathrm{other}}\times\mathcal{C}_{\mathrm{other}}\)。

每种策略使用 17,600 幅训练与 2,000 幅验证无线电地图。我们另外加入 **Both Covered (Full)**，它使用完整的、无泄漏的 Both Covered 池，含 37,200 个训练与 2,000 个验证样本。固定测试集中没有任何精确的环境—配置对用于训练或验证。RadioLSR 架构与优化设置保持不变。

**表 V（原文 TABLE V）：** 不同策略下 RadioLSR 的固定测试性能。原文以粗体标出各列最优值（表注未说明标记含义，按 PDF 渲染所见转写）。

| 训练策略 | 训练 RMSE | 测试 RMSE | 测试 MAE |
|---|---|---|---|
| Both Covered | 3.4032 | 4.6924 | 2.5305 |
| Environment Only | 3.1738 | 5.7332 | 3.8413 |
| Configuration Only | **3.0217** | 9.3269 | 4.4443 |
| Neither Covered | 3.0554 | 10.4874 | 6.1990 |
| Both Covered (Full) | 3.1288 | **4.4540** | **2.3567** |

如表 V 所示，四种策略在共同 17,600 样本预算下取得的训练 RMSE 相近，仅在 3.0217 至 3.4032 dB 之间，但其固定测试性能差异显著。Neither Covered 产生最高的测试 RMSE 与 MAE，分别为 10.4874 与 6.1990 dB。相对该策略，Configuration Only 把两项误差降低 1.1605 与 1.7547 dB，而 Environment Only 把它们降低 4.7542 与 2.3577 dB。因此，当只能覆盖一个因素时，在当前数据集上使用 RadioLSR 时，从测试相关环境采集数据比采集具有测试相关配置的数据更有益。同时覆盖两个因素带来互补增益，并取得最佳固定预算结果，测试 RMSE 为 4.6924 dB、MAE 为 2.5305 dB。这些差异在训练误差相当且无配对泄漏的情况下表明，训练—测试差距强烈依赖于训练样本采集自何处。

把 Both Covered 扩展到完整候选池使训练集规模从 17,600 增到 37,200、增加逾一倍，但只带来更小的额外下降：RMSE 0.2384 dB 与 MAE 0.1738 dB。结果提示一种实际采集优先级：训练数据应首先同时覆盖目标相关环境与配置，尤其关注环境覆盖；在已覆盖支撑内提高采样密度带来进一步但更小的收益。

### F. 可观测表示粗化效应

命题 1 表明，用额外预测性信息丰富观测可以降低不可约条件不确定性。我们通过反向操作来考察该效应：逐步粗化可观测环境与基站配置表示。所有设定使用相同的简单整体式 U-Net、优化策略与随机 \(6/1/3\) 划分。训练 RMSE 被视为信息损失的主要指标，而测试 RMSE 作为实际参考报告，因为输入粗化也可能改变训练—测试分布失配。

我们考虑两种基站配置表示：第 V-B1 节的连续波束地图，及其二值 3 dB 高增益区域掩码。环境由完整高度地图或移除 10% 高度观测的粗化版本表示。表 VI 报告由此得到的四种输入组合。

**表 VI（原文 TABLE VI）：** 不同波束与高度地图表示下的 RMSE。原文以粗体标出各列最优值（表注未说明标记含义，按 PDF 渲染所见转写）。

| 波束输入 | 高度输入 | 训练 RMSE | 测试 RMSE |
|---|---|---|---|
| Continuous | Complete | **3.4488** | **3.6185** |
| Continuous | 10% missing | 3.5844 | 3.7440 |
| 3-dB mask | Complete | 5.7382 | 5.9414 |
| 3-dB mask | 10% missing | 5.7254 | 5.9323 |

连续波束表示提供主导性改进。相对 3 dB 掩码，它在完整高度地图下把训练 RMSE 降低 2.2894 dB，在 10% 高度缺失下降低 2.1410 dB。相比之下，移除 10% 高度观测在完整波束地图下只使训练 RMSE 增加 0.1356 dB，在 3 dB 掩码下则反向变化 0.0128 dB，可忽略不计。在受控训练设定下，连续波束地图带来的显著下降与更丰富可观测信息所赋能的更低条件不确定性一致。测试结果大体遵循相同的主导趋势。唯一例外是第四种设定比第三种好 0.0091 dB。这一轻微反转可能源于诱发的训练—测试分布失配变化或有限样本优化波动，并不表明移除高度信息降低了条件不确定性。

## VII. 结论

本文研究了不完整观测下的确定性无线电地图盲预测。在平方损失下，我们把其总体最优目标识别为条件均值无线电地图。基于该目标，我们建立了精确的风险分解：可约的预测器近似与由隐藏传播因素导致的不可约不确定性。在此分解基础上，我们通过两项与域相关的变化刻画了训练—测试风险差距，并证明有信息量的观测丰富化会降低不确定性项。

在观测固定时，预测器设计可进一步降低近似误差。因此我们考察传播先验作为这一降低的、有物理依据的引导，同时表明其实现可能使可达预测器产生偏差。为在纠正此类偏差的同时保留该引导，我们提出 RadioDecomp，用残差精化增广先验引导基座。其特征引导实例 RadioFR 与 LoS–Shadow 结构化实例 RadioLSR 在随机、分布偏移与有限数据设定下都优于各自的基座。关于模型容量、训练支撑覆盖与观测粗化的受控研究进一步支持了分析。总体而言，观测丰富化与可纠正的传播先验学习分别提供了降低不可约不确定性与预测器近似误差的互补途径。

## 参考文献

（原文采用 IEEE 编号制；条目保留英文原文，编号与原文一致。）

[1] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A Tutorial on Environment-Aware Communications via Channel Knowledge Map for 6G,” IEEE Communications Surveys & Tutorials, vol. 26, no. 3, pp. 1478–1519, 2024.

[2] H. Quan, W. Ni, T. Zhang, X. Ye, Z. Xie, S. Wang, Y. Liu, and H. Song, “Large Language Model Agents for Radio Map Generation and Wireless Network Planning,” IEEE Networking Letters, vol. 7, no. 3, pp. 166–170, 2025.

[3] S. Zhang, X. Ning, X. Zheng, Q. Shi, T.-H. Chang, and Z.-Q. Luo, “A Physics-Based and Data-Driven Approach for Localized Statistical Channel Modeling,” IEEE Transactions on Wireless Communications, vol. 23, no. 6, pp. 5409–5424, 2024.

[4] B. Li and J. Chen, “Radio Map-Assisted Routing and Predictive Resource Allocation Over Dynamic Low-Altitude Networks,” IEEE Transactions on Wireless Communications, vol. 25, pp. 9955–9970, 2026.

[5] R. Ding, F. Zhou, M. Giordani, Q. Wu, and M. Zorzi, “Toward 6G: Spectrum Management in Low-Altitude Aerial Information Networks,” IEEE Network, pp. 1–9, 2026.

[6] H. Jiang, J. Wang, J. Mu, C. Xing, H. Wymeersch, N. Zhao, and D. Niyato, “Covert Communications: A Generative Spectrum Map Paradigm,” IEEE Wireless Communications, pp. 1–8, 2026.

[7] K. Wang, T.-X. Zheng, J. Shi, Z. Yang, J. An, and Z. Li, “Movable Antenna Assisted Covert Communication With Wavelength-Scale Beamforming Resolution,” IEEE Transactions on Vehicular Technology, vol. 74, no. 12, pp. 19 864–19 869, 2025.

[8] Z. Xing, G. Zhang, L. Xie, X. Ma, W. Zhao, Y. Liu, Y. Chen, Y. Zhao, and L. Cui, “Constructing Radio Map via Spatio-Temporal Learning of Crowdsourced Trajectory data,” IEEE Transactions on Mobile Computing, pp. 1–18, 2026.

[9] T. Hu, Y. Huang, J. Chen, Q. Wu, and Z. Gong, “3D Radio Map Reconstruction Based on Generative Adversarial Networks Under Constrained Aircraft Trajectories,” IEEE Transactions on Vehicular Technology, vol. 72, no. 6, pp. 8250–8255, 2023.

[10] D. Schäufele, R. L. G. Cavalcante, and S. Stanczak, “Tensor Completion for Radio Map Reconstruction using Low Rank and Smoothness,” in 2019 IEEE 20th International Workshop on Signal Processing Advances in Wireless Communications (SPAWC), 2019, pp. 1–5.

[11] S. Bi, J. Lyu, Z. Ding, and R. Zhang, “Engineering Radio Maps for Wireless Resource Management,” IEEE Wireless Communications, vol. 26, no. 2, pp. 133–141, 2019.

[12] X. Li, Y. Han, Z. Lu, S. Jin, and C.-K. Wen, “U6G XL-MIMO Radiomap Prediction: Multi-Config Dataset and Beam Map Approach,” 2026. [Online]. Available: https://arxiv.org/abs/2603.06401

[13] V. Abhayawardhana, I. Wassell, D. Crosby, M. Sellars, and M. Brown, “Comparison of empirical propagation path loss models for fixed wireless access systems,” in 2005 IEEE 61st Vehicular Technology Conference, vol. 1, 2005, pp. 73–77 Vol. 1.

[14] J. Bian, C.-X. Wang, X. Gao, X. You, and M. Zhang, “A General 3D Non-Stationary Wireless Channel Model for 5G and Beyond,” IEEE Transactions on Wireless Communications, vol. 20, no. 5, pp. 3211–3224, 2021.

[15] J. Zhang, J. Lin, P. Tang, W. Fan, Z. Yuan, X. Liu, H. Xu, Y. Lyu, L. Tian, and P. Zhang, “Deterministic Ray Tracing: A Promising Approach to THz Channel Modeling in 6G Deployment Scenarios,” IEEE Communications Magazine, vol. 62, no. 2, pp. 48–54, 2024.

[16] R. Levie, c. Yapar, G. Kutyniok, and G. Caire, “RadioUNet: Fast Radio Map Estimation With Convolutional Neural Networks,” IEEE Transactions on Wireless Communications, vol. 20, no. 6, pp. 4001–4015, 2021.

[17] S. Zhang, A. Wijesinghe, and Z. Ding, “RME-GAN: A Learning Framework for Radio Map Estimation Based on Conditional Generative Adversarial Network,” IEEE Internet of Things Journal, vol. 10, no. 20, pp. 18 016–18 027, 2023.

[18] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, “RadioDiff: An Effective Generative Diffusion Model for Sampling-Free Dynamic Radio Map Construction,” IEEE Transactions on Cognitive Communications and Networking, vol. 11, no. 2, pp. 738–750, 2025.

[19] F. Jaensch, G. Caire, and B. Demir, “Radio Map Prediction From Aerial Images and Application to Coverage Optimization,” IEEE Transactions on Wireless Communications, vol. 25, pp. 308–320, 2026.

[20] X. Jiang, T. Li, Z. Xiao, K. Chen, S. Ma, Z. Wang, and K. Li, “UniRM: A Universal Large Model for Multiband 3D Radio Map Construction,” IEEE Journal on Selected Areas in Communications, vol. 44, pp. 2244–2258, 2026.

[21] H. Wang, X. Shi, H. Zhang, Y. Cao, S. Yang, J. Wang, and K. Huang, “BeamCKM: A Framework of Channel Knowledge Map Construction for Multi-Antenna Systems,” IEEE Transactions on Wireless Communications, vol. 25, pp. 21 261–21 275, 2026.

[22] L. Zhao, Y. Wang, X. Wang, Z. Fei, and Y. Zeng, “BeamCKMDiff: Beam-Aware Channel Knowledge Map Construction via Diffusion Transformer,” in IEEE INFOCOM 2026 - IEEE Conference on Computer Communications, 2026, pp. 1–6.

[23] X. Li, Z. Cai, N. Qi, C. Dong, G. Zhu, H. Ma, Q. Wu, and S. Jin, “A Disentangled Representation Learning Framework for Low-Altitude Network Coverage Prediction,” IEEE Transactions on Mobile Computing, vol. 25, no. 5, pp. 6261–6276, 2026.

[24] W. Chen and J. Chen, “Diffraction and Scattering Aware Radio Map and Environment Reconstruction Using Geometry Model-Assisted Deep Learning,” IEEE Transactions on Wireless Communications, vol. 23, no. 12, pp. 19 804–19 819, 2024.

[25] W. Lu, Z. Lu, J. Yan, and S. Gao, “SIP2Net: Situational-Aware Indoor Pathloss-Map Prediction Network for Radio Map Generation,” in ICASSP 2025 - 2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2025, pp. 1–2.

[26] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, “RadioGAT: A Joint Model-Based and Data-Driven Framework for Multi-Band Radiomap Reconstruction via Graph Attention Networks,” IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 17 777–17 792, 2024.

[27] Y. Zhou, A. Wijesinghe, Y. Ma, S. Zhang, and Z. Ding, “TiRE-GAN: Task-Incentivized Generative Learning for Radiomap Estimation,” IEEE Wireless Communications Letters, vol. 14, no. 5, pp. 1401–1405, 2025.

[28] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, “RadioDiff-k2: Helmholtz Equation Informed Generative Diffusion Model for Multi-Path Aware Radio Map Construction,” IEEE Journal on Selected Areas in Communications, vol. 44, pp. 2318–2333, 2026.

[29] M. Li, T. Wu, Z. Dong, X. Liu, Y. Lu, S. Zhang, Z. Wu, Y. Zhang, L. Yu, and J. Zhang, “DeepRT: A Hybrid Framework Combining Large Model Architectures and Ray Tracing Principles for 6G Digital Twin Channels,” Electronics, vol. 14, no. 9, 2025. [Online]. Available: https://www.mdpi.com/2079-9292/14/9/1849

[30] W. Chen and J. Chen, “Learning Blockage and Reflection Geometry for MIMO Beam Map Construction,” in ICC 2025 - IEEE International Conference on Communications, 2025, pp. 2321–2326.

[31] J. Zhou, C. Hu, G. Wu, Z. Ren, H. Hu, J. Zhang, R. Zhang, and J. Xu, “6D Channel Knowledge Map Construction via Bidirectional Wireless Gaussian Splatting,” arXiv preprint arXiv:2510.26166, 2025.

[32] X. Wang, T. Yuan, Y. Cao, N. Cheng, R. Sun, and W. Zhuang, “iRadioDiff: Physics-Informed Diffusion Model for Indoor Radio Map Construction and Localization,” in ICC 2026 - IEEE International Conference on Communications, 2026, pp. 1–6.

[33] F. Jiang, T. Li, X. Lv, H. Rui, and D. Jin, “Physics-Informed Neural Networks for Path Loss Estimation by Solving Electromagnetic Integral Equations,” IEEE Transactions on Wireless Communications, vol. 23, no. 10, pp. 15 380–15 393, 2024.

[34] L. Liu, X. Chen, Z. Tang, M. Ma, and W. Zhang, “PINN and GNN-based RF Map Construction for Wireless Communication Systems,” in 2025 International Conference on Future Communications and Networks (FCN), 2025, pp. 1–6.

[35] H. Jia, W. Chen, Z. Huang, L. Wang, H. Xiao, N. Jia, K. Wu, S. Lai, B. Tian, and Y. Yue, “Physics-Informed Representation Alignment for Sparse Radio-Map Reconstruction,” in Proceedings of the 33rd ACM International Conference on Multimedia, ser. MM ’25. New York, NY, USA: Association for Computing Machinery, 2025, p. 12352–12360. [Online]. Available: https://doi.org/10.1145/3746027.3758161

[36] W. Li, B. Wang, H. Fan, Y. Zhang, G. Zhu, and Y. Zhang, “Cross-Domain Radiomap Prediction for Multi-Scatterer Environment: A Spherical-Wave-Based Approach,” 2026. [Online]. Available: https://arxiv.org/abs/2605.02401

[37] L. Zhao, Z. Fei, X. Wang, J. Luo, and Z. Zheng, “3D-RadioDiff: An Altitude-Conditioned Diffusion Model for 3D Radio Map Construction,” IEEE Wireless Communications Letters, vol. 14, no. 7, pp. 1969–1973, 2025.

[38] Z. Liu, Q. Liu, S. Zhang, H. Zhang, and L. Song, “A Fine-Grained 3D Radio Map Construction Paradigm With Ultra-Low Sampling Rates by Large Generative Models,” IEEE Journal on Selected Areas in Communications, vol. 44, pp. 4397–4413, 2026.

[39] J. Jeong, L. Tsang, X. Xu, S. H. Yueh, and S. A. Margulis, “Full-Wave Electromagnetic Model Simulations of P-Band Radio Signal Propagation Through Forest Using the Fast Hybrid Method,” IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing, vol. 16, pp. 6711–6722, 2023.

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要与索引词、第 I–VII 节正文与全部小节（§III.A–C、§IV.A–B、§V.A–B、§VI.A–F）、定理 1（含证明）、推论 1、注 1、命题 1–2（含证明）、式 (1)–(60)（保留原文编号）、表 I–VI（逐格转写，含原文粗体标记）、图 1 图注与面板数值、参考文献 [1]–[39]（英文原条目）、首页作者脚注与第 3 页记号脚注；原文无附录、无算法框，全文仅 1 幅图（Fig. 1）、6 张表（Table I–VI）。**已知缺陷与核对说明：** ① pypdf 纯文本抽取会把分式、上下标、矩阵与范数符号打散（如式 (3)–(8)、(14)–(15)、(19)–(26)、(34)、(41)、(43) 等），本页对式 (1)–(60) 的编号与主体已按 PDF 渲染页逐式核对（重点核对第 3–8 页）；个别符号（如 \(\mathbb{E}_d\)、\(\mathcal{H}\)、\(\mathcal{D}_x\)、\(\mathbb{I}\)）按渲染所见保留黑板体/花体/指示函数记号。② 表 II 与表 III 原文以粗体标出各列最优值，但表注未说明标记含义，本页按 PDF 高分辨率渲染逐格转写并在表注中如实注明；表 IV 依原文表注“粗体表示每对 BaseFR–RadioFR 中较低误差”逐格标注（其中跨配置测试 RMSE 的 \(C_b=96\) 一对中 BaseFR-96 的 5.7090 更低故加粗，RadioFR-96 为 5.7128）；表 V、表 VI 同样按渲染所见粗体标出各列最优。③ 图 1 图注与两行四列各面板的 RMSE/MAE 数值按第 11 页渲染核对；原文图注未逐面板编号，本页按 Cross-config/Cross-env 两行、BaseFR/RadioFR/BaseLSR/RadioLSR 四列描述。④ 正文所述各降幅已与表值交叉核对一致：BaseFR 相对 Vanilla 的 2.3339/4.8974/3.4660 dB，RadioFR 相对 BaseFR 的 0.0487/0.4684/0.3178 dB，RadioLSR 相对 BaseLSR 的 3.8386/1.8635/2.0240 dB；表 III 的 1.1119/1.2091 dB 与 3.6556/1.2063/2.5665 dB；表 IV 的 0.1707/0.4684/0.0031/0.0038 dB 与 0.2245–0.3315 dB；表 V 的 1.1605/1.7547、4.7542/2.3577、0.2384/0.1738 dB；表 VI 的 2.2894/2.1410/0.1356/0.0128/0.0091 dB——均与表中数字相符。⑤ 原文 §IV-B 的子条编号存在重复（“1）特征级先验”之下又出现“1）仅先验输入”，随后为“2）先验增广输入”“2）模型级先验”“3）损失级先验”），本页照原文保留，未擅自重排。⑥ 参考文献 [16] 中 “c. Yapar” 的大小写、[36] 中重复出现的 “Y. Zhang”、[13] 中 “pp. 73–77 Vol. 1” 等异常均按原文照录，未做更正。⑦ 原文首页第 1 页与第 3 页脚注已分别译出；arXiv 声明为 submitted to IEEE for possible publication，录用状态未确认。⑧ 术语按原文表述：原文用 “irreducible uncertainty / conditional uncertainty”，本页统一译为“不可约不确定性 / 条件不确定性”（即 \(v_d(\mathbf{z})\) 的条件方差），未强行改写为“不可约条件方差”。逐句逐式终校未做；建议后续 QA 重点复核：式 (14)–(15) 中条件期望的嵌套关系、式 (34) 的偏差定义与 \(B_{\lambda,\mathrm{tr}}^{\mathrm{loss}}\ge0\) 的依据、式 (41) 的遮挡得分符号、以及 \(\tilde{\mathcal{U}}_d\) 与 \(\mathcal{U}_d\) 在命题 1 中的方向。

**登记（2026-11-02）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
