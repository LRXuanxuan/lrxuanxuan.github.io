---
layout: page
title: "Channel Knowledge Maps for FR3 UAV Base Stations: Dataset and ML-based Modeling"
permalink: /papers/items/fa7f1bb2b6bb36bc/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=fa7f1bb2b6bb36bc)

[本篇日报说明](/papers/items/fa7f1bb2b6bb36bc/#paper-report) · [阅读全文翻译](/papers/translations/2026-10-13-fr3-uav-ckm-2610-06356/)

**推荐日期：** 2026-10-13 · **发表状态：** 已接受待刊

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

### 03. Channel Knowledge Maps for FR3 UAV Base Stations: Dataset and ML-based Modeling

作者：Moreno~Garcia, Guillem; Abadal, Sergi; Vinogradov, Evgenii。

年份/venue：IEEE GLOBECOM 2026 Workshops（arXiv作者自述已接受）（2026）；发表状态：已接受待刊（作者自述）。核验日期2026-10-13。

方向：无线数据与环境先验：FR3 UAV跨城市。

**问题与方法：** 既有地面CKM很少覆盖FR3高空基站几何，建筑高度与跨城市泛化常被简化。 16180个513×513样本来自66城3236处布局、每布局5个发射高度，7.125GHz、1m水平格；包含几何、LOS、衰减、时延扩展与角扩展。LOS使用自由空间/相干双径与校准，NLOS使用COST231和14特征ridge，按拓扑与高度分组。

**关键结果：** p5：37/15/14城市严格训练/验证/测试，10840/2750/2590张图；测试总RMSE1.93dB、LOS1.74、NLOS3.54；GMM U-Net总4.36，但NLOS3.34优于本篇。p6同CPU模型0.0602s/map，MAC仅统计NLOS点积，RT时延只作情境参考。

**局限与审计：** 需要给定确定性LOS掩码，代码不估计可见性。有效测试目标仅7.4%为NLOS，总指标LOS主导；地面接收机1.5m、中心Tx、固定频率。角扩展不是AoA/AoD路径标签，衰减图不是复数CSI，更不能填补Sheet2全模态联合监督。公开Zenodo编号由PDF给出，但本次服务访问失败，未下载或核验数据文件完整性。

**迁移与阅读位置：** 可直接复现（模型代码）；数据获取待核验；缺口：连续高度、真实建筑高度与严格城市留出协议。 先复现公开attenuation prior与9分组消融，再将预测衰减/LOS置信度作为独立环境token；需另有配对CSI才可用于p(H|r,e,M)训练，不能只改网络输出维数。

**差异与推荐理由：** 相对CKMImageNet/OpenPathNet增加FR3高空Tx与城市分组；相对GeoGS-CE，不学习delay-beam复信道先验，输出是衰减统计地图。 数据和物理基线共同约束泛化论证，避免用总体RMSE掩盖NLOS弱项。

**身份/来源：** [一手页面](https://arxiv.org/abs/2610.06356)；[官方原文/PDF入口](https://arxiv.org/pdf/2610.06356)；[arXiv](https://arxiv.org/abs/2610.06356)。arXiv comments称accepted for IEEE Globecom26 Workshops；作者自述而非出版社录用确认，未核验正式会议DOI。

**代码：** 完整开源实现；[作者仓库](https://github.com/unworthyzeus/CKMAttenuationPriors)。PDF直接给作者仓库；静态核验model.py、冻结artifact加载、evaluate_hdf5.py、recalibrate_nlos.py及测试/结果目录。完整指attenuation模型/评估实现，不含完整射线追踪器或本次未获取的HDF5数据。

**数据：** [论文给出的数据入口](https://doi.org/10.5281/zenodo.21839567)；访问/文件完整性待核验，不虚报已下载。

本篇全文翻译（按本篇身份绑定）。

**本地原文与翻译：** [PDF](https://arxiv.org/pdf/2610.06356)；job_id=b5206d10b28143a3b007fe81，当前状态=pending。已立即派发并确认gpt-6-luna/xhigh活跃；尚未验收全文完成。预期输出 `本地资料：paper.md`。

**许可：** [CC BY4.0原文许可](https://creativecommons.org/licenses/by/4.0/)，署名及翻译说明齐备后可分享完成稿。 网站PDF始终links_only，不上传文件。

## 原推荐表字段

**日期：** 2026-10-13

**标题：** Channel Knowledge Maps for FR3 UAV Base Stations: Dataset and ML-based Modeling

**内容：** 既有地面CKM很少覆盖FR3高空基站几何，建筑高度与跨城市泛化常被简化。 16180个513×513样本来自66城3236处布局、每布局5个发射高度，7.125GHz、1m水平格；包含几何、LOS、衰减、时延扩展与角扩展。LOS使用自由空间/相干双径与校准，NLOS使用COST231和14特征ridge，按拓扑与高度分组。 p5：37/15/14城市严格训练/验证/测试，10840/2750/2590张图；测试总RMSE1.93dB、LOS1.74、NLOS3.54；GMM U-Net总4.36，但NLOS3.34优于本篇。p6同CPU模型0.0602s/map，MAC仅统计NLOS点积，RT时延只作情境参考。 局限：需要给定确定性LOS掩码，代码不估计可见性。有效测试目标仅7.4%为NLOS，总指标LOS主导；地面接收机1.5m、中心Tx、固定频率。角扩展不是AoA/AoD路径标签，衰减图不是复数CSI，更不能填补Sheet2全模态联合监督。公开Zenodo编号由PDF给出，但本次服务访问失败，未下载或核验数据文件完整性。

**契合方向：** 无线数据与环境先验：FR3 UAV跨城市

**推荐理由：** 数据和物理基线共同约束泛化论证，避免用总体RMSE掩盖NLOS弱项。

**顶刊顶会/机构依据：** IEEE GLOBECOM 2026 Workshops（arXiv作者自述已接受）；已接受待刊（作者自述）

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2610.06356

**检索来源：** https://arxiv.org/abs/2610.06356

**筛选备注：** 可直接复现（模型代码）；数据获取待核验；缺口：连续高度、真实建筑高度与严格城市留出协议。 相对CKMImageNet/OpenPathNet增加FR3高空Tx与城市分组；相对GeoGS-CE，不学习delay-beam复信道先验，输出是衰减统计地图。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/unworthyzeus/CKMAttenuationPriors

**代码/数据状态：** 完整开源实现

**反馈匹配：** 先复现公开attenuation prior与9分组消融，再将预测衰减/LOS置信度作为独立环境token；需另有配对CSI才可用于p(H|r,e,M)训练，不能只改网络输出维数。

**反馈权重说明：** 数据和物理基线共同约束泛化论证，避免用总体RMSE掩盖NLOS弱项。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2610.06356)

[来源 2](https://arxiv.org/abs/2610.06356)

[来源 3](https://github.com/unworthyzeus/CKMAttenuationPriors)

[来源 4](https://doi.org/10.5281/zenodo.21839567)

来源 5：见页首翻译状态（按本篇身份绑定)

[来源 6](https://creativecommons.org/licenses/by/4.0/)
{% endraw %}
