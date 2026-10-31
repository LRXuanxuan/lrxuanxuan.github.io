---
layout: page
title: "KiloDA：从稀疏观测重建公里尺度近地表风场｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-11230-kiloda-reconstructing-kilometer-scale-near-surface-wind-states-from-sp/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/0529c0e21a47a2f4/) · [原文 arXiv](https://arxiv.org/abs/2609.11230) · [全部目录](/papers/catalog/)

# KiloDA：从稀疏观测重建公里尺度近地表风场

**原题：** KiloDA: Reconstructing kilometer-scale near-surface wind states from sparse station observations  
**作者：** Yihan Zheng、Ya Wang（通讯作者）、Gang Huang（通讯作者）、Shenming Fu、Haijie Li、Yujiang Cai  
**单位：** 1）中国科学院大气物理研究所季风系统研究中心（北京 100029）；2）中国科学院大气物理研究所地球系统数值模拟与应用重点实验室（北京 100029）；3）中国科学院大学（北京 100049）。通讯邮箱：wangya@mail.iap.ac.cn（Ya Wang）、hg@mail.iap.ac.cn（Gang Huang）。  
**版本：** arXiv:2609.11230v1，原文 31 页（正文 24 页 + 补充材料 7 页）。  
**范围与状态：** 全文中文译稿：摘要、引言、结果（含 6 幅正文图图注）、讨论、方法（含式 (1)–(10) 与全部实验设计）、统计与可复现性、数据与代码可用性、参考文献（40 条，英文原条目）、基金/致谢/作者贡献/利益冲突声明，以及补充材料（补充图 S.1–S.6 图注）均按原文结构录入；原文无表格。逐句逐式终校未做。

## 摘要

准确的公里尺度近地表风场对于理解复杂地形上的大气过程十分重要，但迄今仍难以从稀疏且分布不均的观测中重建。本文提出 **KiloDA**——一个用于从地面台站进行逐小时公里尺度风场重建的扩散框架。KiloDA 从历史 3 km 分辨率天气研究与预报（Weather Research and Forecasting，WRF）模式预报中学习风场的统计分布与空间结构。在每次重建时刻，**不使用同期的 WRF 场**；台站观测是当前大气状态的唯一约束，并引导从所学先验出发的后验采样。在理想化 WRF 实验中，当仅 0.24% 的网格单元被观测时，KiloDA 即可恢复局地化风结构，并在不同地形条件与风速区间上相对常规插值表现出总体优势。该能力在很大程度上可迁移到真实观测：在完全留出的区域内，仅使用区域外观测时，KiloDA 相比 ERA5 再分析将风速均方根误差（root mean square error，RMSE）的中位数降低 19%，改善在高海拔与高起伏地形上最大。随机台站留出实验进一步证实，该优势可扩展到不同复杂地形地点与留出配置。这些结果表明：历史模式存档能够为从稀疏观测重建公里尺度风场提供有用的结构知识，而无需对当前大气状态有准确的模式估计。

## 引言

公里尺度风场为风能资源评估、极端天气分析与局地风预报提供关键信息 [1–3]。在复杂地形上，由于地表高程变化、陆面非均匀性以及流道收缩（flow channeling）、山脊加速与背风侧遮蔽等地形效应，风速与风向可在短距离内急剧变化 [4–7]。然而地面台站只在这个高度非均匀场上稀疏且分布不均地采样，山区覆盖尤为有限 [8, 9]。因此核心挑战在于：从稀疏观测推断连续的公里尺度风状态，同时保留复杂地形造成的精细尺度结构。

反距离权重（inverse distance weighting，IDW）与 Kriging 等空间插值方法为填补不规则台站之间空白提供了常规途径 [10, 11]。然而由于它们主要依赖距离或空间协方差，难以表示未被观测直接采样的地形相关风结构；其性能随地形复杂度与空间变异性增加而退化，常导致场过度平滑与极值衰减 [12–15]。资料同化提供了把观测与模式信息融合的更系统方式 [16]。欧洲中期天气预报中心（ECMWF）第五代大气再分析（ERA5）等全球再分析产品提供空间完整、物理一致的大气状态，但其分辨率相对较粗，限制了复杂地形上地形诱导风结构的表征 [17–19]。WRF 等公里尺度区域模式能更好地解析地形变率与局地风结构，也可同化观测以改进大气状态 [20–22]；然而持续运行公里尺度数值模式并向其中同化观测计算代价高昂，限制了其在长时间、高空间分辨率风场分析中的使用 [23, 24]。

深度学习已迅速推进天气与气候研究，Pangu-Weather [25] 与 FuXi [26] 等数据驱动系统在全球天气预报中表现强劲，相关诊断框架也被用于研究大气过程 [27]。在这一更广阔的发展中，生成模型为重建高维大气场提供了特别有前景的途径。扩散模型可从高分辨率历史模拟中学习完整大气状态的空间结构与统计分布，随后无需重跑数值模式即可生成物理上合理的场 [28–30]。观测引导扩散进一步允许在推理阶段用稀疏测量约束预训练生成先验，为从不完整观测重建高维状态提供了灵活框架 [31, 32]。这一途径近来已被用于大气与海洋重建 [33–35]，但其在复杂地形上公里尺度的能力仍然缺乏确立。尤其是：极稀疏的台站观测是否足以恢复未观测位置处的地形相关风结构，以及这种能力能否从理想化模式设定迁移到真实观测设定，仍不清楚。

为此，我们提出 KiloDA——一个从稀疏台站观测重建近地表风场的公里尺度扩散同化框架。KiloDA 从历史 3 km WRF 样本中学习 10 m 纬向（U10）与经向（V10）风分量的公里尺度风场先验，并在推理时用台站观测引导反向扩散采样，从而在稀疏观测约束下重建完整风场状态。理想化 WRF 实验表明，KiloDA 能从极稀疏观测重建未观测的精细尺度风结构，并在不同地形条件与风速区间上持续优于常规插值。真实观测实验进一步表明该能力可迁移到复杂地形，相比 ERA5 与插值方法降低风速误差。这些结果说明：稀疏观测结合学习到的结构先验，能够恢复超出观测位置的公里尺度风状态。

## 结果

### KiloDA 从稀疏台站重建公里尺度近地表风

**图 1（原文 Fig. 1）：KiloDA 框架。** KiloDA 从 3 km WRF 模式数据学习公里尺度风先验，并用稀疏地面台站观测约束反向扩散采样，以生成 10 m 纬向（U10）与经向（V10）风分量的连续场，并据此导出 10 m 风速（WS10）。

图 1 概括了 KiloDA 框架（详见方法）。KiloDA 首先用历史 3 km WRF 预报学习公里尺度风结构的生成先验。重建时**不使用**该时刻的 WRF 预报，而是由当前台站观测引导 Bayes 后验采样，生成完整的 U10 与 V10 场，再据此导出 10 m 风速（WS10）。每个重建场须满足两项要求：既遵循 WRF 先验所刻画的统计分布与空间结构，又与可用观测一致。在这个意义上，WRF 定义了公里尺度风的合理结构流形，而观测确定当前大气状态。由于先验由 WRF 预报建立，不可避免地会继承部分预报误差。WRF 的台站级均方根误差（RMSE）确实大于 ERA5，但它更好地刻画了观测到的空间变异性、保留了远更丰富的精细尺度结构（补充图 1）。这一性质使 WRF 适合用于构建 KiloDA 先验——该先验更依赖真实的分布与空间关系，而非单个时刻的准确状态估计。

### 从 WRF 预报学习公里尺度风先验

**图 2（原文 Fig. 2）：从 WRF 预报学习公里尺度风先验。** 对 U10（a–h）与 V10（i–p），上两行分别给出由 WRF 样本与生成样本计算的平均场、95 百分位场与标准差场。子图 (g, o) 给出汇集的概率密度函数（PDF），子图 (h, p) 给出径向平均功率谱密度（PSD）。均方根误差（RMSE）与空间型相关系数（pattern correlation coefficient，PCC）量化生成统计场与相应 WRF 统计场之间的空间差异与型态一致性。子图 (h, p) 中，log-RMSE 表示 log₁₀ 变换后的生成平均 PSD 与 WRF 平均 PSD 之间的 RMSE，Pearson 相关系数 \(r\) 量化二者一致性。PSD 曲线周围的阴影表示样本间四分位距。U10 与 V10 单位为 m s⁻¹。

可靠的观测约束重建需要一个能同时表示公里尺度风场空间结构与内在变异性的先验。因此我们首先评估扩散模型能否从 2024 年逐小时 WRF 风场中学习这些特征：用平均场、95 百分位场、标准差场、概率密度函数（PDF）与径向平均功率谱密度（PSD），把 5,000 个生成样本与 2024 年全部可用 WRF 样本比较（图 2）。

生成样本很好地再现了 U10 与 V10 的 WRF 统计量。平均场、95 百分位场与标准差场的 RMSE 为 0.065–0.367 m s⁻¹，空间型相关系数（PCC）为 0.990–0.996；概率分布与 WRF 样本高度一致。径向平均 PSD 也几乎相同，两个风分量的 Pearson 相关系数均为 0.999。这些结果表明扩散模型成功学习了公里尺度 WRF 风场的统计分布、空间非均匀性与多尺度结构，为后续观测约束重建提供了合适的生成先验。

### WRF 模型世界中的理想化重建

**图 3（原文 Fig. 3）：WRF 模型世界中未观测公里尺度风状态的理想化重建。** 所有评估指标只在未受约束的网格单元上计算。(a–c) 在"类台站"重建中，反距离权重（IDW）、Kriging 与 KiloDA 的网格单元 RMSE，基于 2025 年 1 月至 3 月的 2,117 个逐小时 WRF 参考场评估；插图数值为空间平均 RMSE。(d, e) 分别为按地形起伏分级与台站网之外网格单元的 RMSE 分布。箱体表示四分位距，中心线表示中位数，须线延伸至 1.5 倍四分位距内的最极端值；离群点未显示。(f–j) 随机网格重建中 2025 年 2 月 6 日 07:00 的代表性强风个例：WRF 参考场（约束网格单元 N = 100，f）、N = 100 的 IDW（g）、N = 100 的 Kriging（h）、N = 100 的 KiloDA（i）与 N = 4,000 的 KiloDA（j）。(g–j) 插图数值为 RMSE 与 PCC。(k, l) 在 32 小时强风时段内，平均 RMSE 与 PCC 随随机选取约束网格单元数的变化。(a–c) 阴影表示 RMSE，(f–j) 阴影表示 WS10、箭头表示水平风矢量；(f) 中青色标记为约束网格单元。WS10 与 RMSE 单位为 m s⁻¹。

为把 KiloDA 的内在重建能力与真实世界观测误差、数据不匹配分离开，我们首先在"完整风场已知、稀疏观测直接取自同一模式世界"的理想化设定中评估它。以 2025 年 1–3 月（JFM）的独立 WRF 场作为完整参考状态，我们开展理想化重建实验：从选定网格单元提取伪观测，作为 KiloDA 的观测约束以及插值基线的输入。

在类台站实验中，IDW 与 Kriging 的误差呈现明显的空间组织性、而非均匀分布（图 3a、b）。大误差在地形变化强烈区域形成拉长条带，说明常规插值在没有直接观测约束的位置难以恢复随地形快速变化的风结构。相比之下，KiloDA 显著抑制了这些与地形相关的误差条带，在大部分区域产生低得多的误差（图 3c）。随着地形起伏增大，这种地形依赖性更加清晰：IDW 与 Kriging 的误差随地形起伏明显上升，而 KiloDA 的上升幅度小得多（图 3d）。在台站网之外、网格单元距观测约束较远处，插值误差同样保持较高；KiloDA 在这些区域仍保持显著更低的误差，体现出在观测约束空间覆盖范围之外重建风场的更强能力（图 3e）。在全部 2,117 个逐小时场上，空间平均 RMSE 从 IDW 的 1.83 m s⁻¹、Kriging 的 1.64 m s⁻¹ 降至 KiloDA 的 0.84 m s⁻¹。

我们随后考察一个代表性强风事件，以判断稀疏观测能否恢复局地化风结构、而不只是大尺度背景状态。WRF 参考场显示一条横跨区域中部与北部的狭窄、高度非均匀强风带，含多个局地极大值与显著空间变化，包括区域东缘一个明显极大值（图 3f）。在仅有 100 个约束网格单元时，IDW 与 Kriging 只恢复出宽泛的强风中心，把参考场平滑成相对简单的型态，错过了大部分狭窄的地形相关结构与东缘的明显极大值（图 3g、h）；其风向也远比参考场均匀。相反，即使用相同的 100 个约束网格单元，KiloDA 仍恢复了主要的拉长强风带、其内部大部分空间变异性以及相应的风向变化（图 3i）。把约束网格单元增至 4,000 个后，这些结构进一步细化，东缘局地极大值被很好地再现，整体场与 WRF 参考场高度接近（图 3j）。

这一行为在不同约束密度下一致。即使只有 100 个约束网格单元（占区域的 0.24%），KiloDA 仍取得 1.39 m s⁻¹ 的 RMSE 与 0.82 的 PCC，而插值方法的 RMSE 高于 2 m s⁻¹、PCC 低于 0.5。随着约束网格单元增加，KiloDA 逐步逼近参考场：4,000 个约束网格单元时 RMSE 降至 0.57 m s⁻¹、PCC 升至 0.97（图 3k、l）。该优势在不同约束数下的各类地形起伏与海拔等级上均得以保持（补充图 3）。值得注意的是，KiloDA 与插值方法之间的 RMSE 差距并不随约束数增加而缩小，说明仅增加约束数量不足以消除常规插值在重建未观测空间结构方面的局限。这些结果表明，KiloDA 的主要优势并非仅在于逐点误差更低：借助学习到的公里尺度风先验，它能够恢复稀疏观测本身未能直接解析的地形相关空间结构。

**图 4（原文 Fig. 4）：跨 WRF 风速区间的重建误差与重建场特征。** (a) 2025 年 1–3 月评估期内，未约束网格单元上 IDW、Kriging 与 KiloDA 的 WS10 RMSE 分布，按 WRF 参考风速分位数（≤Q05、Q05–Q25、Q25–Q75、Q75–Q95 与 ≥Q95）分层；分位阈值在每个网格单元由其评估期 WRF 风速时间序列单独定义。箱体表示四分位距，中心线表示中位数，须线延伸至 1.5 倍四分位距内的最极端值；离群点未显示。(b) WRF 参考、IDW、Kriging 与 KiloDA 在整个场上 WS10 的概率密度函数。(c) 四者 WS10 的径向平均 PSD，在采样风场上平均。WS10 与 RMSE 单位为 m s⁻¹。

为进一步考察可重建哪些类型的风场，我们在不同风速区间上评估类台站实验，并比较重建场的统计与空间特征（图 4）。KiloDA 的优势随风速增大而愈明显。在 Q05 以下的弱风区，三种方法误差相当，IDW 略优；但从 Q05 向上，KiloDA 持续产生更低的 RMSE，且与 IDW、Kriging 的差距在较高风速区间显著扩大。对 Q75 以上的风，KiloDA 的 RMSE 中位数约为插值方法的一半，表明在重建更强、空间更非均匀的风时，学习到的先验尤为重要（图 4a）。

重建风速分布进一步解释了插值方法为何失去技巧（图 4b）。IDW 产生窄得多的分布、在弱风处概率过多，Kriging 呈类似但更弱的倾向；两种方法因此都压制了 WRF 参考中的变异性与较强风。相反，KiloDA 的分布在主体部分紧贴 WRF 参考，并延伸到相似的高风速尾部。同样的对比出现在空间尺度上（图 4c）：IDW 与 Kriging 从中等尺度到小尺度迅速损失谱功率，与其过度平滑的重建场一致；KiloDA 保留了显著更多的谱能量，并在大部分可解析尺度上紧贴 WRF 参考。综合来看，这些结果表明 KiloDA 的作用不止于降低逐点误差：它保留了常规插值倾向于抹平的风速变异性与公里尺度空间结构，在更强的风条件下尤为如此。

### 基于真实台站观测的重建

**图 5（原文 Fig. 5）：使用真实观测对完全留出区域的验证结果。** (a) 2025 年 1–3 月的验证设置：红色矩形内所有台站均从重建输入中留出，仅用于独立验证，而区域外台站提供观测约束。S1 与 S2 为两个代表性留出台站。(b, c) 留出台站上 ERA5、IDW、Kriging 与 KiloDA 的台站级 WS10 RMSE 与时间相关系数（temporal correlation coefficient，TCC）。箱体表示四分位距，中心线表示中位数，须线延伸至 1.5 倍四分位距内的最极端值；点表示各留出台站。(d–g) 代表性强风事件峰值（2025 年 2 月 6 日 07:00）时 ERA5、IDW、Kriging 与 KiloDA 的 WS10 场与风矢量；插图数值为留出台站上的 RMSE 与空间 PCC。红色箭头突出气旋式环流型。(h, i) S1 与 S2 在事件峰值前后的 WS10 时间序列。WS10 与 RMSE 单位为 m s⁻¹。

理想化实验已确立：当先验与观测在统计上一致、且完整参考场已知时，KiloDA 能重建未观测的公里尺度风状态。更重要的问题是这一能力能否迁移到真实台站观测——真实观测分布不均，且在采样特征与代表性上可能与基于模式的先验不一致。因此我们开展"连续留出区域"验证：把目标区域内全部观测从重建输入中移除，从而检验区域外观测能否约束完全未观测区域内的风状态（图 5）。该连续目标区域主要位于山西中西部吕梁山区，依据 2025 年 JFM 期间 ERA5 误差的空间型选取（见方法）。区域内全部 238 个台站被留出、仅用于独立评估，其余 1,102 个台站为 IDW、Kriging 与 KiloDA 提供完全相同的观测约束。

在评估期内，KiloDA 在留出台站上取得 1.26 m s⁻¹ 的 WS10 RMSE 中位数，相对 ERA5、IDW 与 Kriging 分别降低 19.2%、18.2% 与 15.4%（图 5b）。该优势并不局限于少数台站：KiloDA 分别在 66.4%、88.2% 与 89.5% 的留出台站上取得低于 ERA5、IDW 与 Kriging 的 RMSE，改善广泛分布于目标区域（补充图 4）。值得注意的是，该型态在各地形起伏与海拔组别上持续存在，且改善在最高起伏与最高海拔类别中最大（补充图 5）。在时间一致性上也有类似优势：KiloDA 在留出台站上取得最高的 TCC 中位数 0.69（图 5c）。

一个代表性强风事件进一步揭示了重建风场空间组织方式的差异（图 5d–g）。对 IDW 与 Kriging，局地风速变化主要体现为约束台站周围的不连续斑块，而完全留出区域明显平滑、内部空间变异性很小；其他未约束区域也可见类似平滑。相反，KiloDA 在完全留出区域内呈现更大的内部空间变异性与更非均匀的风速型态，在离约束台站更远处也可见空间变化。风矢量进一步揭示重建流结构的差异：ERA5 在研究域南部与东南部呈现连贯的气旋式环流型（如红色箭头所示），而插值方法产生的流向均匀得多（图 5d–f）；KiloDA 则重建出 ERA5 中所见的气旋式环流型，说明它捕捉到了连贯的大尺度流特征（图 5g）。与空间对比一致，留出台站 S1 与 S2 的时间序列表明，KiloDA 在强风事件期间更贴近观测到的风速演变（图 5h、i）。

为检验重建优势是否特定于该连续目标区域，我们进一步开展随机留出实验：从复杂地形区域选取 100 个台站留出（补充图 6）。尽管留出台站的空间配置不同，KiloDA 在三个月评估期内仍持续取得低于全部基线的 RMSE，TCC 与基线持平或更高。这些结果表明，重建优势可扩展到不同复杂地形地点，不依赖连续目标区域的特定空间配置。

综合来看，这些结果表明 KiloDA 仅用目标区域外的稀疏观测，就能重建一个内部无任何观测约束的连续区域内的风场。其总体优势在不同地形条件与不同留出配置下均得以保持，说明理想化实验中确立的重建能力在很大程度上可迁移到复杂地形上的真实观测。然而改善在风速分布上并不均匀：KiloDA 在观测分布的大部分区间保持竞争力，但在风速最高的 5% 处其 RMSE 略高于 ERA5（补充图 5）。

### 稀疏观测的区域影响

**图 6（原文 Fig. 6）：区域远程影响（RI）对 KiloDA 重建性能的作用。** (a) 各源区域的平均 RI，在其余全部目标区域上平均。(b) 各目标区域的平均 RI，在其余全部源区域上平均。RI 为正值表示 KiloDA 在该目标区域产生的 WS10 RMSE 低于 ERA5。

为考察 KiloDA 的远程重建能力如何随观测约束的空间位置变化，我们在同一代表性 32 小时强风事件期间，于九个分区（R0–R8）上开展区域影响实验（图 6）。

区域观测对远程重建的影响呈现明显的空间非均匀性。来自 R5 与 R4 的观测在远程重建中产生最大的平均改善：在其他目标区域上平均的相对 RMSE 降幅分别为 10.8% 与 9.2%。相反，R0 在其他目标区域上相对 ERA5 出现 3.5% 的平均 RMSE 上升，说明远程改善并非在所有源区域上一致为正。远程重建在不同目标区域间也有差异：平均相对 RMSE 降幅在 R3 达 18.5%、R6 达 13.3%，而 R2 相对 ERA5 出现平均 RMSE 上升。

作为一项附加诊断，区域影响实验通过考察研究域内源区域与目标区域的多种配对，扩展了单次留出区域检验。结果表明，观测的远程影响具有空间非均匀性，并取决于源区域与目标区域的具体配对。

## 讨论与结论（原文 Discussion）

本文提出 KiloDA——一个从稀疏台站观测重建近地表风场的公里尺度扩散同化框架。与直接由现有观测估计未观测值的常规插值不同，KiloDA 从历史高分辨率 WRF 场学习公里尺度风场的生成先验，并用当前台站观测约束空间完整风场的重建。这一区别在复杂地形上尤为重要——公里尺度风具有强烈的空间非均匀性、局地梯度与地形调制结构，常规插值难以从稀疏观测中恢复。

这一区别在理想化实验与真实观测实验中都有明显的性能含义。在理想化 WRF 实验中，KiloDA 在极稀疏观测约束下重建未观测的公里尺度风结构，并在不同观测密度、地形条件与风速区间上相对插值方法保持总体优势。更重要的是，当 KiloDA 以真实台站观测为条件时，该重建能力在很大程度上得以保留：即使某连续区域内全部台站被留出，KiloDA 在大多数留出台站上仍取得低于 ERA5 与插值基线的误差，且该优势在不同地形条件与留出配置下持续存在。

此外，区域影响实验为观测信息如何传播到观测区域之外提供了补充诊断。不同源区域与目标区域之间的非均匀响应表明，远程观测影响可能并非仅由距离决定；但对观测网价值的详细解释超出了本文范围。

一项重要局限是：当前评估主要集中于山西及其周边复杂地形区域的冬春季，KiloDA 对其他季节、地形—气候体系与天气过程的适用性仍需进一步验证。未来工作应把框架扩展到更长时间、多个区域与更广泛天气背景，并明确处理网格尺度生成先验向点观测的适配问题。总体而言，KiloDA 为从稀疏观测进行公里尺度风重建提供了实用框架；而真实观测风速分布上尾处性能下降，则凸显了未来工作需关注的重要局限。

## 方法

### 用于先验训练的 WRF 模拟

KiloDA 用扩散模型从历史 WRF [20] 模拟学习公里尺度近地表风场的生成先验。这些模拟并不被假定代表真实大气状态，而是提供动力学上合理、空间连续的样本，供扩散模型从中学习复杂地形上风场的空间组织、局地梯度与统计变率。

WRF 模拟使用全球预报系统（Global Forecast System，GFS）[36] 场为外层区域提供初始与侧边界条件，采用两域单向嵌套配置，外域与内域水平网格间距分别为 15 km 与 3 km。模式使用 37 个垂直层。外域每 3 小时获得外部侧边界条件，内域则由外域侧向强迫。模式为非静力、采用自适应时间步长。主要物理配置包括 Thompson 微物理、RRTMG 长波与短波辐射、修订的 MM5 Monin–Obukhov 近地层方案、Noah 陆面模式以及 Yonsei 大学行星边界层方案。外域使用 Kain–Fritsch 积云方案，3 km 内域不使用。与地形相关的选项（坡面辐射、地形遮蔽与地形风修正）均开启。对风、温度与水汽施加带内部质量控制的观测松弛（observation nudging）。

训练数据集由 2024 年 3 km 内域的逐小时 U10 与 V10 场组成。这些场被裁剪到覆盖山西省及其周边地区的统一 \(240\times176\) 网格。训练前，每个风分量用由训练数据集得到的、分量专属的最小值与最大值线性缩放到 \([-1,1]\)；采样后，重建分量再变换回物理单位。对后续分析中使用的所有网格化风场，相应 WS10 按

$$
WS10=\sqrt{U10^2+V10^2}\tag{1}
$$

计算。

### 台站观测

中国气象局的地面气象观测用于约束 KiloDA 重建，并作为真实观测验证实验的主要依据。台站档案包含 2024 年与 2025 年 JFM 的逐小时 10 m 风速、风向以及台站坐标。2024 年观测仅用于补充图 1 中的诊断比较，2025 年 JFM 观测则用于观测条件化与真实观测验证。编码为 999999 的风速或风向值视为缺测并剔除；超出 0–50 m s⁻¹ 的风速与超出 0–360° 的风向也剔除，但编码为 999017、对应风速 ≤0.2 m s⁻¹ 的静风记录除外——这些静风记录在预处理中保留。有效记录少于 100 条或存在明显时间质量异常的台站也被剔除。为确保与 WRF 变量及 KiloDA 重建目标一致，台站风速与风向被转换为 U10 与 V10 风分量。每个台站按其地理坐标匹配到最近的 WRF 模式网格单元，从而建立台站观测与公里尺度模式网格之间的对应关系；当多个台站被分配到同一网格单元时，其 U10 与 V10 分量取平均。经质量控制与网格匹配后，保留的观测覆盖 1,340 个网格单元。由于逐小时观测存在间歇性缺测，有效观测约束数随时间变化，平均约为每小时 1,294 个网格单元。

### ERA5 与插值基线

ERA5 再分析 [17] 被用作外部基准，代表广泛使用的粗分辨率网格化产品。逐小时 ERA5 U10 与 V10 场按 2024 年与 2025 年 JFM、在其原生水平分辨率 \(0.25^\circ\times0.25^\circ\) 上获取，并双线性插值到 \(240\times176\) 分析网格。2024 年场仅用于补充图 1 的诊断比较，2025 年 JFM 场则在真实观测实验中作为外部基准。ERA5 **未**被用作 KiloDA 的输入、背景场、训练目标或采样约束。

IDW [37] 与普通 Kriging [38] 另外被用作常规空间插值基线。两种方法在每个分析时刻分别作用于 U10 与 V10，再据此导出 WS10。对 IDW，目标位置 \(x\) 处的每个风分量 \(X\in\{U10,V10\}\) 估计为

$$
\hat X(x,t)=\frac{\sum_{i\in\mathcal S_t}w_i(x)X_i(t)}{\sum_{i\in\mathcal S_t}w_i(x)},\qquad w_i(x)=d_i(x)^{-2}\tag{2}
$$

其中 \(\mathcal S_t\) 表示时刻 \(t\) 的有效约束台站集合，\(d_i(x)\) 为目标位置与约束位置之间的欧氏距离。当目标位置与约束位置重合时，直接使用该位置的观测值。普通 Kriging 使用带六个滞后区间的指数半变异函数，其参数在每个分析时刻自动估计，预测基于最近 32 个有效约束台站。每次实验中，IDW、Kriging 与 KiloDA 使用相同的有效观测约束。

### KiloDA 模型

KiloDA 是一个把扩散风场先验与稀疏观测约束相结合的重建框架。它首先从公里尺度 WRF 场学习近地表风的空间结构与统计分布；在反向扩散过程中施加台站观测一致性，以生成与可用稀疏观测一致的空间完整风场。与直接订正 ERA5 或 WRF 背景场的方法不同，KiloDA 不使用同期模式场作为初始状态；它不进行常规台站插值，而是通过观测约束的后验采样重建风场。

#### 从 WRF 场学习扩散先验

KiloDA 的生成部分基于去噪扩散概率模型（denoising diffusion probabilistic model，DDPM）[29]。令 \(x_0\) 表示一个干净 WRF 风场样本。前向扩散过程在 \(T\) 个扩散步中用高斯噪声逐步扰动 \(x_0\)。定义 \(\alpha_t=1-\beta_t\) 与 \(\bar\alpha_t=\prod_{s=1}^{t}\alpha_s\)，扩散步 \(t\) 处的含噪样本写为

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\qquad \epsilon\sim\mathcal N(\mathbf 0,\mathbf I),\tag{3}
$$

其中 \(\beta_t\) 由噪声调度规定。反向过程逐步去除 \(x_t\) 中的噪声，参数化为

$$
p_\theta(x_{t-1}\mid x_t)=\mathcal N\!\left(x_{t-1};\mu_\theta(x_t,t),\Sigma_\theta(x_t,t)\right),\tag{4}
$$

其中 \(\mu_\theta\) 与 \(\Sigma_\theta\) 表示反向转移的参数化均值与对角协方差。U-Net 在当前含噪状态中预测噪声分量 \(\epsilon_\theta(x_t,t)\)。噪声预测目标为

$$
\mathcal L_{\rm simple}=\mathbb E_{x_0,t,\epsilon}\left[\left\|\epsilon-\epsilon_\theta(x_t,t)\right\|_2^2\right].\tag{5}
$$

该目标训练反向去噪过程的噪声预测部分。训练完成后，从高斯噪声 \(x_T\sim\mathcal N(\mathbf 0,\mathbf I)\) 出发采样，逐步施加所学反向过程，即可生成服从 WRF 训练数据分布的公里尺度近地表风场。训练期间**未**向扩散模型直接提供台站观测或 ERA5 场，因此模型从 WRF 存档中学习的是空间完整风场的先验。

对 U10 与 V10 分别用 2024 年逐小时 WRF 数据训练了扩散模型。每个模型使用含 64 个基础通道、通道倍增系数为 (1, 2, 3, 4) 的 U-Net。反向过程方差用 learned-range 形式 [39] 参数化。训练采用 AdamW，学习率 \(1\times10^{-4}\)，全局批大小 32。扩散过程含 1,000 步，线性噪声调度从 \(\beta_1=1\times10^{-4}\) 到 \(\beta_T=2\times10^{-2}\)。重建使用在 700,000 次优化步保存的指数滑动平均（EMA）检查点，并运行完整的 1,000 步反向过程。

#### 受台站观测约束的后验采样

预训练的扩散模型可以从高斯噪声生成公里尺度风场样本，但目标风场的重建还必须与可用台站观测一致。因此 KiloDA 在反向扩散中引入观测一致性约束，把风场生成转变为观测约束的后验采样问题 [40]。令 \(x_0\) 表示完整网格化风场、\(y\) 表示在模式网格上表示的稀疏台站观测、\(A\) 为观测算子。观测模型为

$$
y=A(x_0)+\eta,\tag{6}
$$

其中 \(\eta\) 表示观测误差。观测算子 \(A\) 用台站观测掩膜 \(M\) 实现为

$$
A(x)=M\odot x,\tag{7}
$$

其中 \(M\) 为二值台站观测掩膜（在观测网格单元 \(M=1\)、其余处 \(M=0\)），\(\odot\) 表示逐元素相乘。在每个反向扩散步，U-Net 从当前含噪状态 \(x_t\) 预测噪声分量 \(\epsilon_\theta(x_t,t)\)，由此得到干净风场估计

$$
\hat x_0=\frac1{\sqrt{\bar\alpha_t}}\left[x_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta(x_t,t)\right].\tag{8}
$$

KiloDA 随后评估受约束位置上估计值与观测值之间的差异，相应的观测一致性梯度表示为

$$
\nabla_{x_t}\left\|y-A(\hat x_0)\right\|_2^2.\tag{9}
$$

在每个反向扩散步，该梯度被施加到采样更新上，以改善与台站观测的一致性。引导尺度（guidance scale）控制观测一致性与所学扩散先验的相对贡献：较大的引导尺度赋予观测一致性更大权重，较小值则赋予扩散先验更大权重。本研究中所有反向扩散步均使用固定引导尺度 6。

对每个重建时刻，KiloDA 分别采样两个风分量，各生成 10 个集合成员；随后把对应的 U10 与 V10 成员配对计算 WS10，并取其集合平均。各实验之间通过改变观测掩膜 \(M\) 来改变用于观测条件化的台站集合。

### 实验设计

#### 理想化 WRF 实验

完全基于 WRF 场的理想化实验用于在完整参考场已知的受控条件下，评估 KiloDA 从稀疏观测恢复完整公里尺度风场的能力。未用于模型训练的独立 WRF 场作为参考场；从选定网格点提取伪观测，作为 KiloDA 与插值基线的唯一约束。

采用两种实验配置。在类台站实验中，伪观测取自与实际台站位置对应的 WRF 网格单元，重建性能在 2025 年 JFM 期间评估。在随机网格实验中，随机抽取 100–4,000 个网格点作为伪观测，以考察 32 小时强风时段内重建技巧对约束数的敏感性。两种配置下的重建性能进一步按地形起伏与海拔等级考察，以评估不同地形条件下的稳健性。海拔分为低（<800 m）、中（800–1,500 m）与高（≥1,500 m）三类。地形起伏定义为 \(3\times3\) 网格单元邻域内地形高程最大值与最小值之差，分为低（<100 m）、中（100–300 m）与高（≥300 m）三类。上述阈值参照研究域内高程与地形起伏的空间分布选取（补充图 2），以区分相对低平地形与高海拔、强变化地形。类台站实验中的非台站网格单元与随机网格实验中的未约束网格单元用于独立验证。

#### 真实观测验证实验

连续留出区域验证用于评估 KiloDA 能否仅用区域外观测，重建一个内部无任何观测约束的连续区域内的风场。目标区域由 ERA5 风分量相对观测的 RMSE 在 2025 年 JFM 期间排名前 20% 的台站所形成的主导空间簇确定，并把包围该簇的扩展矩形区域定义为留出区域。目标区域内全部 238 个台站被留出用于独立评估，区域外其余 1,102 个台站用作观测约束。该设计避免在受约束台站上进行可能偏乐观的评估，并直接评估留出区域内的重建。

作为补充稳健性检验，从地形起伏 ≥300 m 或海拔 ≥1,500 m 的复杂地形位置随机留出 100 个台站，仅用于独立评估，其余 1,240 个台站提供观测约束。该实验评估空间分散留出配置下重建性能的稳健性。

#### 区域影响实验

区域影响实验在代表性 32 小时强风时段内进行，以考察 KiloDA 的远程重建性能如何随观测约束的空间位置变化。研究域内台站被划分为九个子区域（R0–R8），每个子区域所含台站数大致相同。每次实验仅用某一个子区域的观测约束 KiloDA，而在其余八个子区域（作为目标区域）中分别评估重建性能。

对每种源区域与目标区域组合，远程影响（remote impact，RI）量化为 KiloDA 相对 ERA5 在目标区域取得的 WS10 RMSE 百分比降幅：

$$
RI_{s,t}=\frac{RMSE_{ERA5,t}-RMSE_{KiloDA,s,t}}{RMSE_{ERA5,t}}\times100\%\tag{10}
$$

平均 RI 通过对每个源区域在八个对应目标区域上求平均、以及对每个目标区域在八个源区域上求平均得到。RI 为正值表示 KiloDA 的目标区域 RMSE 低于 ERA5，负值表示更高。

### 统计与可复现性

重建精度用 RMSE、空间 PCC 与 TCC 量化，其中 PCC 在空间位置上计算、TCC 在每个留出台站上随时间计算。PDF 与径向平均 PSD 用于评估分布与大中尺度特征。未进行推断性假设检验。类台站与随机网格评估分别使用 2,117 个与 32 个逐小时 WRF 参考场，连续区域与复杂地形随机留出分别包含 238 个与 100 个留出台站。集合成员仅用于获得集合平均 WS10 场，不被视作独立统计重复。随机抽取使用固定种子 0。随机网格约束掩膜对每个约束数独立采样，并在评估时刻之间固定；随机留出实验中的验证与同化掩膜全程固定。在适用处，所有比较方法使用相同的选定位置。

### 数据可用性

本研究使用的数据包括 WRF 近地表风模拟、地面气象台站观测与 ERA5 再分析数据。ERA5 逐小时 10 m 风分量数据可从 Copernicus Climate Data Store 获取（https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels）。WRF 模拟由作者生成，用于训练 KiloDA 中的公里尺度扩散先验。由于数据量巨大，完整 WRF 训练存档未公开，但在合理请求下可从通讯作者处获得。用于观测条件化与评估的原始地面台站观测受第三方数据使用协议约束，不能公开再分发。支持分析与图表的处理后数据可在合理请求下从通讯作者处获得。

### 代码可用性

支持本研究结论的自定义代码在同行评审期间可在合理请求下从通讯作者处获得，并将在论文发表后于永久仓库中公开。

## 参考文献（英文原书目）

1. Li, Z. et al. Intelligent Super-Resolution of Wind Fields: A Terrain-Aware Approach for 25 km to 1 km Downscaling. J. Geophys. Res. Atmos. 131, e2025JD045875 (2026).
2. Zhang, Z. et al. A 1 km hourly high-resolution 3D wind field dataset over the Yangtze River Delta incorporating dynamical downscaling, observational assimilation, and land use updates. Earth Syst. Sci. Data 18, 1683–1701 (2026).
3. Dupuy, F., Durand, P. & Hedde, T. Downscaling of surface wind forecasts using convolutional neural networks. Nonlin. Processes Geophys. 30, 553–570 (2023).
4. Ma, Y., Menenti, M., Feddes, R. & Wang, J. Analysis of the land surface heterogeneity and its impact on atmospheric variables and the aerodynamic and thermodynamic roughness lengths. J. Geophys. Res. Atmos. 113, D08113 (2008).
5. Rotach, M. W. et al. On the Vertical Exchange of Heat, Mass, and Momentum Over Complex, Mountainous Terrain. Front. Earth Sci. 3, 76 (2015).
6. Helbig, N., Mott, R., Van Herwijnen, A., Winstral, A. & Jonas, T. Parameterizing surface wind speed over complex topography. J. Geophys. Res. Atmos. 122, 651–667 (2017).
7. Dujardin, J. & Lehning, M. Wind-Topo: Downscaling near-surface wind fields to high-resolution topography in highly complex terrain with deep learning. Q. J. R. Meteorol. Soc. 148, 1368–1388 (2022).
8. Horel, J. D. & Dong, X. An Evaluation of the Distribution of Remote Automated Weather Stations (RAWS). J. Appl. Meteorol. Climatol. 49, 1563–1578 (2010).
9. Song, L., Yang, L., Cheng, C., Hasi, A. & Chen, M. The Impacts of Grid Spacing and Station Network on Surface Analyses and Forecasts in Beijing Winter Olympic Complex Terrain. J. Appl. Meteorol. Climatol. 62, 1761–1781 (2023).
10. Luo, W., Taylor, M. C. & Parker, S. R. A comparison of spatial interpolation methods to estimate continuous wind speed surfaces using irregularly distributed data from England and Wales. Int. J. Climatol. 28, 947–959 (2008).
11. Li, J. & Heap, A. D. Spatial interpolation methods applied in the environmental sciences: A review. Environ. Model. Softw. 53, 173–189 (2014).
12. Li, J. & Heap, A. D. A review of comparative studies of spatial interpolation methods in environmental sciences: Performance and impact factors. Ecol. Inform. 6, 228–241 (2011).
13. Friedland, C. J. et al. Isotropic and anisotropic kriging approaches for interpolating surface-level wind speeds across large, geographically diverse regions. Geomatics Nat. Hazards Risk 8, 207–224 (2017).
14. Wang, Y., Liu, X., Liu, R. & Zhang, Z. Research Progress on Spatiotemporal Interpolation Methods for Meteorological Elements. Water 16, 818 (2024).
15. Samalot, A., Astitha, M., Yang, J. & Galanis, G. Combined Kalman Filter and Universal Kriging to Improve Storm Wind Speed Predictions for the Northeastern United States. Weather Forecast. 34, 587–601 (2019).
16. Carrassi, A., Bocquet, M., Bertino, L. & Evensen, G. Data assimilation in the geosciences: An overview of methods, issues, and perspectives. WIREs Clim. Change 9, e535 (2018).
17. Hersbach, H. et al. The ERA5 global reanalysis. Q. J. R. Meteorol. Soc. 146, 1999–2049 (2020).
18. Hu, W., Scholz, Y., Yeligeti, M., Bremen, L. V. & Deng, Y. Downscaling ERA5 wind speed data: a machine learning approach considering topographic influences. Environ. Res. Lett. 18, 094007 (2023).
19. Jung, C. & Schindler, D. On the influence of wind speed model resolution on the global technical wind energy potential. Renew. Sustain. Energy Rev. 156, 112001 (2022).
20. Skamarock, W. C. et al. A Description of the Advanced Research WRF Model Version 4. 145 (2019) doi:10.5065/1dfh-6p97.
21. Jiménez, P. A. et al. An evaluation of WRF's ability to reproduce the surface wind over complex terrain based on typical circulation patterns. J. Geophys. Res. Atmos. 118, 7651–7669 (2013).
22. Zhang, D., Chen, L., Zhang, F., Tan, J. & Wang, C. Numerical Simulation of Near-Surface Wind during a Severe Wind Event in a Complex Terrain by Multisource Data Assimilation and Dynamic Downscaling. Adv. Meteorol. 2020, 7910532 (2020).
23. Prein, A. F. et al. A review on regional convection-permitting climate modeling: Demonstrations, prospects, and challenges. Rev. Geophys. 53, 323–361 (2015).
24. Doglioni, G., Serafin, S., Weissmann, M., Ferrari, G. & Zardi, D. Impact of the Assimilation of Surface Observations on Limited-Area Forecasts Over Complex Terrain. Meteorol. Appl. 32, e70107 (2025).
25. Bi, K. et al. Accurate medium-range global weather forecasting with 3D neural networks. Nature 619, 533–538 (2023).
26. Chen, L. et al. FuXi: a cascade machine learning forecasting system for 15-day global weather forecast. npj Clim Atmos Sci 6, 190 (2023).
27. Xiang, L. et al. Revealing the Mechanisms of Heat Extremes Using an AI Enabled Diagnostic Framework. Geophys. Res. Lett. 53, e2025GL120917 (2026).
28. Song, Y. et al. Score-Based Generative Modeling through Stochastic Differential Equations. in International Conference on Learning Representations (2021).
29. Ho, J., Jain, A. & Abbeel, P. Denoising Diffusion Probabilistic Models. in Advances in Neural Information Processing Systems vol. 33 6840–6851 (2020).
30. Wang, J. et al. Generative High-Resolution Ensemble Weather Forecast Supports Renewable Energy Planning and Operation. Geophys. Res. Lett. 53, e2025GL119044 (2026).
31. Rozet, F. & Louppe, G. Score-based Data Assimilation. in Advances in Neural Information Processing Systems vol. 36 40521–40541 (2023).
32. Manshausen, P. et al. Generative Data Assimilation of Sparse Weather Station Observations at Kilometer Scales. J. Adv. Model. Earth Syst. 17, e2024MS004505 (2025).
33. Huang, L., Gianinazzi, L., Yu, Y., Dueben, P. D. & Hoefler, T. DiffDA: A Diffusion Model for Weather-scale Data Assimilation. in Proceedings of the 41st International Conference on Machine Learning vol. 235 19798–19815 (PMLR, 2024).
34. Martin, S., Manucharyan, G. & Klein, P. Generative Data Assimilation for Surface Ocean State Estimation from Multi-Modal Satellite Observations. J. Adv. Model. Earth Syst. 17, e2025MS005063 (2025).
35. Han, X. et al. Physics-guided score-based diffusion for 3D reconstruction of tropical cyclones from sparse observations. npj Clim Atmos Sci 9, 134 (2026).
36. National Centers for Environmental Information. Global Forecast System (GFS). https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast.
37. Shepard, D. A two-dimensional interpolation function for irregularly-spaced data. in Proceedings of the 1968 23rd ACM national conference 517–524 (Association for Computing Machinery, New York, NY, United States, 1968). doi:10.1145/800186.810616.
38. Cressie, N. Spatial prediction and ordinary kriging. Math. Geol. 20, 405–421 (1988).
39. Nichol, A. & Dhariwal, P. Improved Denoising Diffusion Probabilistic Models. in Proceedings of the 38th International Conference on Machine Learning vol. 139 8162–8171 (PMLR, 2021).
40. Chung, H., Kim, J., McCann, M. T., Klasky, M. L. & Ye, J. C. Diffusion Posterior Sampling for General Noisy Inverse Problems. in International Conference on Learning Representations (2023).

## 基金、致谢与作者贡献

**基金。** 本工作由智能电网国家科技重大专项（Grant No. 2025ZD0805500）资助。

**致谢。** 作者感谢中国气象局提供地面气象台站观测、欧洲中期天气预报中心提供 ERA5 再分析数据。作者感谢国家重大科技基础设施"地球系统数值模拟装置"（https://cstr.cn/31134.02.EL）提供的技术支持。

**作者贡献。** Ya Wang 构思研究并设计实验；Yihan Zheng 开发 KiloDA 框架、执行模型实验、完成数据分析、制作图表并撰写初稿；Ya Wang 与 Gang Huang 指导项目并提供主要学术指导；Shenming Fu 参与结果的解释与讨论以及文稿修订；Haijie Li 协助解决模型训练与推理相关问题；Yujiang Cai 参与数据分析的讨论与结果解释。全体作者讨论结果并审阅定稿。

**利益冲突。** 作者声明无利益冲突。

## 补充材料（Supplementary Information）

**补充材料：KiloDA——从稀疏台站观测重建公里尺度近地表风状态**（作者与单位同正文；本文件目录：补充图 1–6）

**补充图 1（原文 Supplementary Fig. 1）：** 2024 年 WRF 模式、ERA5 大气再分析与台站观测之间近地表风特征的比较。(a, b) 分别为 ERA5 与 WRF 的平均 10 m 风速（WS10）场。(c) ERA5 与 WRF 相对地面台站观测的台站级 WS10 均方根误差（RMSE）。(d) 在共同有效台站位置上，观测、WRF 与 ERA5 的逐小时 WS10 空间标准差（SD）分布。WS10、RMSE 与 SD 单位为 m s⁻¹。

**补充图 2（原文 Supplementary Fig. 2）：** 研究域的地形特征。(a) 研究域内 WRF 地形高度，行政边界以黑线表示，并标注吕梁山与太行山。(b) 地形起伏，即每个 \(3\times3\) 网格单元邻域内地形高程最大值与最小值之差。地形高度与地形起伏单位为 m。

**补充图 3（原文 Supplementary Fig. 3）：** 随机网格实验中 WS10 重建误差对约束网格单元数与地形条件的敏感性。在代表性 32 小时强风时段内，使用 N = 100、500、1,000、2,000 与 4,000 个随机选取的约束网格单元时，反距离权重（IDW）、Kriging 与 KiloDA 在低（L）、中（M）、高（H）地形复杂度等级上的 WS10 RMSE 分布。(a–e) 按地形起伏分层；(f–j) 按海拔分层。箱体表示四分位距，中心线表示中位数，须线延伸至 1.5 倍四分位距内的最极端值；离群点未显示。蓝色与紫色百分比标签分别表示 KiloDA 相对 IDW 与 Kriging 的 RMSE 相对降幅。RMSE 单位为 m s⁻¹。

**补充图 4（原文 Supplementary Fig. 4）：** 连续留出区域内台站级 WS10 误差的空间分布。2025 年 1–3 月间 (a) ERA5、(b) IDW、(c) Kriging、(d) KiloDA 的台站级 WS10 RMSE。每个标记表示一个留出台站，并按其余 RMSE 着色；所有子图使用相同色标；子图标题给出平均与中位台站级 RMSE。红色矩形标出留出目标区域。RMSE 单位为 m s⁻¹。

**补充图 5（原文 Supplementary Fig. 5）：** 连续留出区域验证的分层 WS10 重建误差。2025 年 1–3 月期间，留出台站上 ERA5、IDW、Kriging 与 KiloDA 的台站级 WS10 RMSE 分布，按 (a) 地形起伏、(b) 台站海拔、(c) 观测风速分位数分层。箱体表示四分位距，中心线表示中位数，须线延伸至 1.5 倍四分位距内的最极端值；离群点未显示。RMSE 单位为 m s⁻¹。

**补充图 6（原文 Supplementary Fig. 6）：** 复杂地形上的随机留出验证。结果基于 2025 年 1–3 月评估期与 100 个复杂地形随机留出台站。(a) 研究域地形起伏图与 100 个随机留出台站的位置。(b, c) ERA5、IDW、Kriging 与 KiloDA 的台站级 WS10 RMSE 与时间相关系数（TCC）分布。箱体表示四分位距，中心线表示中位数，须线延伸至 1.5 倍四分位距内的最极端值，点表示各留出台站，数值为中位数。(d–g) 分别为 ERA5、IDW、Kriging 与 KiloDA 的台站级 RMSE 空间分布，插图标签为平均 RMSE。(h) 100 个随机留出台站的逐小时空间 RMSE，细线为逐小时值、粗线为 24 小时滑动平均。

## 图注与表注

**图注：** 正文图 1–6 的图注已随文置于相应位置（见"结果"各小节）；补充图 1–6 的图注见"补充材料"一节。

> **表注：** 原文没有表格。

**本页范围与校对状态：** 本页覆盖原文摘要、引言、结果（全部 6 幅正文图及其图注）、讨论、方法（WRF 模拟、台站观测、ERA5 与插值基线、KiloDA 模型两小节、实验设计三小节、统计与可复现性）、数据与代码可用性、参考文献（40 条英文原条目，编号与原文一致）、基金/致谢/作者贡献/利益冲突，以及补充材料（补充图 S.1–S.6 图注）。式 (1)–(10) 均按 PDF 渲染页（p15–p19）逐式核对后转写；图注按原文（p1–p14、p26–p31）逐条翻译，关键数值（如 0.24%、1.83/1.64/0.84 m s⁻¹、19.2%/18.2%/15.4%、238/1,102 台站等）均照原文录入。原文无表格；讨论节的原文标题为 "Discussion"（本文无独立 "Conclusion" 节），本页将其标题译为"讨论与结论（原文 Discussion）"以便阅读；原文章节编号为期刊式（摘要/引言/结果/讨论/方法等，无罗马数字编号），本页按原文标题结构录入。逐句逐式终校未做；供后续 QA 重点核对：方法中各超参数（引导尺度 6、扩散步 1,000、EMA 检查点 700,000 步）与补充图图注中的数值标签。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
