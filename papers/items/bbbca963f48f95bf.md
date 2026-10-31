---
layout: page
title: "Radio Map Prediction From Aerial Images and Application to Coverage Optimization"
permalink: /papers/items/bbbca963f48f95bf/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=bbbca963f48f95bf)

[本篇日报说明](/papers/items/bbbca963f48f95bf/#paper-report) · [阅读已有译稿（非全文）](/papers/translations/2026-10-14-radio-map-aerial-images-2410-17264/)

**推荐日期：** 2026-10-14 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇现有译稿为阶段性/历史版本（未计入全文验收）；完整全文翻译尚未完成，完成后页首入口将直达全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

### 03. Radio Map Prediction From Aerial Images and Application to Coverage Optimization

作者：Fabian Jaensch; Giuseppe Caire; Begüm Demir。

年份/venue：2026；IEEE Transactions on Wireless Communications；状态：正式发表；核验2026-10-14。IEEE注册Crossref正式TWC卷25页308–320，2026；2025 Early Access与2024初始预印本明确分开。当前分析合法arXiv v2（2025-06-23）作者版；较早论文作为2026正式发表且未推荐的数据缺口补充。

方向：无线地图与数据：航空图、缺失高度与覆盖优化。

**问题与方法：** 许多地区只有航空影像，缺少完整3D环境和分类地图；还需把无线地图接入可微系统目标。 RMDirectionalBerlin含真实城市几何、植被、方向性Tx与射线仿真pathloss；比较航空RGBIR与可选高度/坐标输入。UNetDCN采用可变形卷积扩大感受野；冻结模型并对Tx方位/俯仰角反传，优化覆盖的平滑替代目标。

**关键结果：** 作者版p7概述不同模型/输入RMSE约5.2–7.2dB，加入高度明显改善。p11表VII：第10百分位功率从−86.5至−81.1dBm，随机搜索−81.6；表VIII满足SINR阈值像素3121至12338。两优化均500次，梯度约60s、随机约15s，不能泛称梯度法更快。

**局限：** 数据局限Berlin及模拟传播，不能当跨城市泛化证据。影像推高度存在歧义，阴影及边缘导致误差；仅pathloss地图，没有复CSI/完整AoA/AoD监督。下游优化主要在学习代理上评估，需用独立RT/实测复核，平滑覆盖目标并非原阈值目标严格最优。

**迁移类型及阅读位置：** 可直接复现；缺口与应用：可公开复现实验的环境模态输入与地图到覆盖设计。

**与既有阅读差异及接口：** 相对昨日FR3 UAV高度先验，本篇考察航空影像代替缺失3D几何，且展示方向性天线优化；相对RadioDiff，不以生成模型为核心贡献。 先在作者城市区域划分上复现RGBIR与RGBIR+高度，追加高度缺失/噪声mask对照；后续若要接p(H|r,e,M)，须另外配对复信道样本。

**推荐理由：** 完整代码/数据入口让缺失模态与系统效用可以独立验证，避免只有生成图像指标。

**来源：** [一手页面](https://arxiv.org/abs/2410.17264)；[官方原文/PDF入口](https://arxiv.org/pdf/2410.17264)；[DOI](https://doi.org/10.1109/twc.2025.3583171)；[arXiv](https://arxiv.org/abs/2410.17264)。

**代码：** 完整开源实现；[作者仓库](https://github.com/fabja19/RML_v2_img)。作者课题组及Zenodo关联该仓库；有main_cli、lib数据/模型模块、配置、环境、训练/测试/predict入口、覆盖优化notebook与预训练下载说明。仅静态审计，未执行模型或下载全数据。

**数据：** [作者Zenodo入口](https://zenodo.org/records/15721131)；尚未下载全数据，不虚报复现。

本篇全文翻译 （按标题/主键绑定本篇状态）。

**本地原文及翻译：** [PDF](https://arxiv.org/pdf/2410.17264)，13页；job_id=61010543f523f89eaeb7766e，状态=pending；已取得原文即入队，派发原worker失败：当前应用未找到既有threadId。尚未开始/验收译稿，不把入队称已翻译。预期路径：`本地资料：paper.md`。

**共享许可：** [原文许可](https://creativecommons.org/licenses/by/4.0/)允许署名衍生译文，完成QA后可公开。 PDF始终只保留官方链接。

## 原推荐表字段

**日期：** 2026-10-14

**标题：** Radio Map Prediction From Aerial Images and Application to Coverage Optimization

**内容：** 许多地区只有航空影像，缺少完整3D环境和分类地图；还需把无线地图接入可微系统目标。 RMDirectionalBerlin含真实城市几何、植被、方向性Tx与射线仿真pathloss；比较航空RGBIR与可选高度/坐标输入。UNetDCN采用可变形卷积扩大感受野；冻结模型并对Tx方位/俯仰角反传，优化覆盖的平滑替代目标。 作者版p7概述不同模型/输入RMSE约5.2–7.2dB，加入高度明显改善。p11表VII：第10百分位功率从−86.5至−81.1dBm，随机搜索−81.6；表VIII满足SINR阈值像素3121至12338。两优化均500次，梯度约60s、随机约15s，不能泛称梯度法更快。 局限：数据局限Berlin及模拟传播，不能当跨城市泛化证据。影像推高度存在歧义，阴影及边缘导致误差；仅pathloss地图，没有复CSI/完整AoA/AoD监督。下游优化主要在学习代理上评估，需用独立RT/实测复核，平滑覆盖目标并非原阈值目标严格最优。

**契合方向：** 无线地图与数据：航空图、缺失高度与覆盖优化

**推荐理由：** 完整代码/数据入口让缺失模态与系统效用可以独立验证，避免只有生成图像指标。

**顶刊顶会/机构依据：** IEEE Transactions on Wireless Communications；正式发表

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2410.17264

**检索来源：** https://arxiv.org/abs/2410.17264

**筛选备注：** 可直接复现；缺口与应用：可公开复现实验的环境模态输入与地图到覆盖设计。 相对昨日FR3 UAV高度先验，本篇考察航空影像代替缺失3D几何，且展示方向性天线优化；相对RadioDiff，不以生成模型为核心贡献。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/fabja19/RML_v2_img

**代码/数据状态：** 完整开源实现

**反馈匹配：** 先在作者城市区域划分上复现RGBIR与RGBIR+高度，追加高度缺失/噪声mask对照；后续若要接p(H|r,e,M)，须另外配对复信道样本。

**反馈权重说明：** 完整代码/数据入口让缺失模态与系统效用可以独立验证，避免只有生成图像指标。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2410.17264)

[来源 2](https://arxiv.org/abs/2410.17264)

[来源 3](https://github.com/fabja19/RML_v2_img)

[来源 4](https://doi.org/10.1109/twc.2025.3583171)

[来源 5](https://zenodo.org/records/15721131)

来源 6：见页首翻译状态

[来源 7](https://creativecommons.org/licenses/by/4.0/)允许署名衍生译文)
{% endraw %}
