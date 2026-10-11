---
layout: page
title: "A Highway Vehicular Channel Model for OTFS Performance Evaluation"
permalink: /papers/items/4b346a8bd1ffac3c/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=4b346a8bd1ffac3c)

[本篇日报说明](/papers/items/4b346a8bd1ffac3c/#paper-report) · [全文翻译（待补齐）](/papers/items/4b346a8bd1ffac3c/#paper-translation)

**推荐日期：** 2026-10-10 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

### 04. A Highway Vehicular Channel Model for OTFS Performance Evaluation

**作者：** A. Compagnoni; R. Tuninato; C. F. Chiasserini; R. Garello; A. Nordio; E. Viterbo。**年份/venue：** IEEE TCOM, vol.74, pp.5074–5088, 2026。**日期/版本：** 2026正式发表；首次上线具体日待核验；阅读机构库公开作者接收稿。

**方向与问题：** 高速移动与多径相关性。独立抽样的TDL信道忽略高速道路场景中路径延迟/Doppler相关性，可能虚增分集和OTFS表现，使算法在过于容易的数据上评估。

**方法：** V-TDL（车载抽头延迟线）从几何随机参考模型V-CORE拟合路径数、功率、延迟与Doppler联合统计；以相关高斯Doppler及混合方向刻画车流、车道和道路几何，利用车辆双站RCS拟合功率衰减。保留低成本随机生成，避免每次显式布置所有车辆。

**关键结果：** 已读作者稿第13–15页：3.6GHz、15.36MHz、最高160km/h，比较OTFS/OFDM FER。独立EVA相对V-CORE/V-TDL可呈现约5dB乐观OTFS优势；控制变体EVA-1→EVA-2（延迟相关增强）及EVA-2→EVA-3（增加Doppler相关）各损失约2dB。这里是论文曲线讨论下的模型敏感性结果，不是V-TDL估计器或生成网络的增益。

**局限与证据边界：** 系统实验假设接收端已知CSI、整数延迟、帧内几何参数稳定，未验证导频估计误差下的MIMO/PnP恢复。主要是高速公路车辆反射及其拟合统计，不能宣称实测多城泛化或适用于所有散射机制。公开代码示例采用64×64网格，而正文系统表为512×128，不应直接声称默认示例复现整篇图。该库核心输出路径增益/延迟/Doppler，不直接提供用户阵列AoA/AoD监督。

**迁移类型：** 可直接复现。**相对阅读笔记的位置：** 应用/基线：可公开运行的相关移动信道数据对照，先验证生成器和边缘统计。

**与既有阅读差异：** 相对阅读笔记中的CKM-SRF和既有OTFS/移动预测，关注的是跨路径联合统计改变评估难度，而非用过去CSI预测未来CSI。它能检验当前合成数据是否把环境变化仅压缩成独立路径参数。

**课题接口与推荐理由：** 先在独立SISO delay-Doppler sandbox中比较V-TDL与保留相同边缘但置零非对角协方差的版本。若迁移MIMO需另行明确阵列流形与角度模型；不能把库里没有的角度标签补成真值。固定同一接收机和功率归一化，再增加导频估计误差。 TCOM已发表并有可核验作者代码；给高速移动数据和系统结论提供比单看NMSE更直接的压力测试。

**身份/来源：** DOI: 10.1109/tcomm.2026.3663522；[一手论文/作者资料](https://iris.polito.it/handle/11583/3007387)；[PDF](https://iris.polito.it/retrieve/6f92a83d-19f2-4139-ad81-0a9f3e57bbb8/OTFS_vehicular_channel_model-3.pdf)；本地PDF（本地资料：3663522.pdf）。已分析公开全文16页，关注页码1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16。

**发表核验（2026-10-10）：** 正式发表。[IEEE DOI](https://doi.org/10.1109/tcomm.2026.3663522)、[IEEE页面](https://ieeexplore.ieee.org/document/11390681)与[Crossref原始元数据](https://api.crossref.org/works/10.1109/tcomm.2026.3663522)核对期刊类型、卷页、标题和作者；IEEE直接访问出现验证/错误，采用公开作者版与DOI登记交叉证据。不能把Crossref created/deposited日当发表日。

**代码：完整开源实现。** [作者仓库](https://github.com/AleComp7/VTDL---Vehicular-Channel-Model)。机构作者公开发文链接仓库；README列相同DOI/作者。核对VTDL_setting、Generate_delay_Doppler_channel、Generate_delay_channel及usage_example/Main和检测器/均衡器依赖。提供核心生成器和OTFS/OFDM示例；静态审计，未运行MATLAB，未验证正文所有图可由默认配置重现。

## 原推荐表字段

**日期：** 2026-10-10

**标题：** A Highway Vehicular Channel Model for OTFS Performance Evaluation

**内容：** 作者：A. Compagnoni; R. Tuninato; C. F. Chiasserini; R. Garello; A. Nordio; E. Viterbo
问题：独立抽样的TDL信道忽略高速道路场景中路径延迟/Doppler相关性，可能虚增分集和OTFS表现，使算法在过于容易的数据上评估。
方法：V-TDL（车载抽头延迟线）从几何随机参考模型V-CORE拟合路径数、功率、延迟与Doppler联合统计；以相关高斯Doppler及混合方向刻画车流、车道和道路几何，利用车辆双站RCS拟合功率衰减。保留低成本随机生成，避免每次显式布置所有车辆。
结果：已读作者稿第13–15页：3.6GHz、15.36MHz、最高160km/h，比较OTFS/OFDM FER。独立EVA相对V-CORE/V-TDL可呈现约5dB乐观OTFS优势；控制变体EVA-1→EVA-2（延迟相关增强）及EVA-2→EVA-3（增加Doppler相关）各损失约2dB。这里是论文曲线讨论下的模型敏感性结果，不是V-TDL估计器或生成网络的增益。
局限：系统实验假设接收端已知CSI、整数延迟、帧内几何参数稳定，未验证导频估计误差下的MIMO/PnP恢复。主要是高速公路车辆反射及其拟合统计，不能宣称实测多城泛化或适用于所有散射机制。公开代码示例采用64×64网格，而正文系统表为512×128，不应直接声称默认示例复现整篇图。该库核心输出路径增益/延迟/Doppler，不直接提供用户阵列AoA/AoD监督。
迁移：可直接复现
阅读位置：应用/基线：可公开运行的相关移动信道数据对照，先验证生成器和边缘统计。
区别：相对阅读笔记中的CKM-SRF和既有OTFS/移动预测，关注的是跨路径联合统计改变评估难度，而非用过去CSI预测未来CSI。它能检验当前合成数据是否把环境变化仅压缩成独立路径参数。
课题接口：先在独立SISO delay-Doppler sandbox中比较V-TDL与保留相同边缘但置零非对角协方差的版本。若迁移MIMO需另行明确阵列流形与角度模型；不能把库里没有的角度标签补成真值。固定同一接收机和功率归一化，再增加导频估计误差。

**契合方向：** 高速移动与多径相关性

**推荐理由：** TCOM已发表并有可核验作者代码；给高速移动数据和系统结论提供比单看NMSE更直接的压力测试。

**顶刊顶会/机构依据：** IEEE TCOM, vol.74, pp.5074–5088, 2026；正式发表

**发表年份：** 2026

**论文下载链接：** https://iris.polito.it/retrieve/6f92a83d-19f2-4139-ad81-0a9f3e57bbb8/OTFS_vehicular_channel_model-3.pdf

**检索来源：** https://doi.org/10.1109/tcomm.2026.3663522
https://iris.polito.it/handle/11583/3007387

**筛选备注：** DOI: 10.1109/tcomm.2026.3663522；2026正式发表；首次上线具体日待核验；阅读机构库公开作者接收稿；发表核验2026-10-10；公开全文已分析；可直接复现；代码静态审计未执行

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/AleComp7/VTDL---Vehicular-Channel-Model

**代码/数据状态：** 完整开源实现

**反馈匹配：** 应用/基线：可公开运行的相关移动信道数据对照，先验证生成器和边缘统计。 相对阅读笔记中的CKM-SRF和既有OTFS/移动预测，关注的是跨路径联合统计改变评估难度，而非用过去CSI预测未来CSI。它能检验当前合成数据是否把环境变化仅压缩成独立路径参数。

**反馈权重说明：** 机构作者公开发文链接仓库；README列相同DOI/作者。核对VTDL_setting、Generate_delay_Doppler_channel、Generate_delay_channel及usage_example/Main和检测器/均衡器依赖。提供核心生成器和OTFS/OFDM示例；静态审计，未运行MATLAB，未验证正文所有图可由默认配置重现。

## 原文与代码入口

[来源 1](https://iris.polito.it/retrieve/6f92a83d-19f2-4139-ad81-0a9f3e57bbb8/OTFS_vehicular_channel_model-3.pdf)

[来源 2](https://doi.org/10.1109/tcomm.2026.3663522)

[来源 3](https://iris.polito.it/handle/11583/3007387)

[来源 4](https://github.com/AleComp7/VTDL---Vehicular-Channel-Model)

[来源 5](https://doi.org/10.1109/tcomm.2026.3663522)、)

[来源 6](https://ieeexplore.ieee.org/document/11390681)与)

[来源 7](https://api.crossref.org/works/10.1109/tcomm.2026.3663522)核对期刊类型、卷页、标题和作者)
{% endraw %}
