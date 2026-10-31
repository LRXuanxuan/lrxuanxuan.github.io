---
layout: page
title: "Site Geometry and Calibration Uncertainties in Digital Twin-enabled Channel Estimation"
permalink: /papers/items/db37cdae3a25d2d0/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=db37cdae3a25d2d0)

[本篇日报说明](/papers/items/db37cdae3a25d2d0/#paper-report) · [阅读全文翻译](/papers/translations/2026-10-23-site-geometry-and-calibration-uncertainties-in-digital-twin-enabled-ch-2607-09334/)

**推荐日期：** 2026-10-23 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. Site Geometry and Calibration Uncertainties in Digital Twin-enabled Channel Estimation

**作者**：Del Moro, Lorenzo; Linsalata, Francesco; Spagnolini, Umberto; Magarini, Maurizio。

**方向/年份/venue**：无线地图：射线先验、协方差失配与误差理论；2026；IEEE TCOM 74:13423–13437（2026）；本次读arXiv作者版本。

**发表核验（2026-10-23）**：正式发表。IEEE DOI 10.1109/TCOMM.2026.3725321、出版社注册的Crossref journal-article/TCOM/74卷及页码核验；Xplore直接访问触发验证。arXiv缺journal-ref不能覆盖较新正式记录。作者稿与最终排版差异未逐行核对。

**问题**：数字孪生RT先验有位置误差和材料校准误差，两者为何对估计性能影响不同？

**方法**：以RT路径构造低秩信道协方差；一阶微扰分别刻画位置对角度/时延的影响及EM参数对增益的影响，再推导低秩和MMSE估计NMSE。固定主导路径集合，显式传播几何Jacobian及相关误差。

**关键结果**：16页作者稿。Milan城市及Tallinn郊区/乡村Sionna RT0.18.0场景；格点指纹用于数据库，含车辆网格/SUMO的独立仿真用于性能评估。低SNR城市设置最高约10dB NMSE改善；小于1m位置误差时高SNR部分设置与基线相近，不能外推所有地图精度。

**局限**：核心是小误差、路径集合不变的一阶近似；路径出生/消失、遮挡突变或显著地图拓扑错误超出保证。材料误差相对鲁棒依赖其主要改变增益的模型，并非普遍不敏感。RT仿真不等于真实空口实验，也不是Doppler可辨识性证明。

**迁移/笔记位置**：可改造工具；缺口：地图失配如何转化为估计误差；深化：环境先验可信度。

**与既有阅读差异**：相比既有WCM/CKM条件生成阅读，它直接给位置—角延—子空间—NMSE误差链，可作为不依赖神经生成器的强对照。

**推荐理由**：与10月22日期刊扩展讨论最贴近：先分析地图误差何时破坏观测推断，再决定条件flow/可靠性门控是否必要。

**代码状态**：未发现公开代码。arXiv/PDF未给实现仓库，精确标题和编号GitHub检索为0；未把Sionna依赖当作者实现。

**身份**：arXiv:2607.09334；DOI:10.1109/tcomm.2026.3725321。[证据1](https://arxiv.org/abs/2607.09334) [证据2](https://doi.org/10.1109/tcomm.2026.3725321) [证据3](https://api.crossref.org/works/10.1109/tcomm.2026.3725321) [证据4](https://ieeexplore.ieee.org/document/11660482/)

[官方PDF](https://arxiv.org/pdf/2607.09334)；[原文PDF](https://arxiv.org/pdf/2607.09334)。全文16页；定位：PDF SecIII–V，尤其SecIV固定路径一阶模型、SecV数据划分/RT设置；IEEE注册元数据。

全文翻译状态见页首。job `00c76da2daba470a78042b9c`，pending，指定gpt-6-luna/xhigh；原worker不可达，未启动/未译完。预计输出：`本地资料：paper.md`。

[源许可](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)。当前只获原文分发入口许可，未获公开译文许可；完成稿先本地保存。PDF仅官方链接，不上传网站。

## 原推荐表字段

**日期：** 2026-10-23

**标题：** Site Geometry and Calibration Uncertainties in Digital Twin-enabled Channel Estimation

**内容：** 作者：Del Moro, Lorenzo; Linsalata, Francesco; Spagnolini, Umberto; Magarini, Maurizio。问题：数字孪生RT先验有位置误差和材料校准误差，两者为何对估计性能影响不同？ 方法：以RT路径构造低秩信道协方差；一阶微扰分别刻画位置对角度/时延的影响及EM参数对增益的影响，再推导低秩和MMSE估计NMSE。固定主导路径集合，显式传播几何Jacobian及相关误差。 结果：16页作者稿。Milan城市及Tallinn郊区/乡村Sionna RT0.18.0场景；格点指纹用于数据库，含车辆网格/SUMO的独立仿真用于性能评估。低SNR城市设置最高约10dB NMSE改善；小于1m位置误差时高SNR部分设置与基线相近，不能外推所有地图精度。 局限：核心是小误差、路径集合不变的一阶近似；路径出生/消失、遮挡突变或显著地图拓扑错误超出保证。材料误差相对鲁棒依赖其主要改变增益的模型，并非普遍不敏感。RT仿真不等于真实空口实验，也不是Doppler可辨识性证明。

**契合方向：** 无线地图：射线先验、协方差失配与误差理论

**推荐理由：** 与10月22日期刊扩展讨论最贴近：先分析地图误差何时破坏观测推断，再决定条件flow/可靠性门控是否必要。

**顶刊顶会/机构依据：** IEEE TCOM 74:13423–13437（2026）；本次读arXiv作者版本；正式发表；IEEE DOI 10.1109/TCOMM.2026.3725321、出版社注册的Crossref journal-article/TCOM/74卷及页码核验；Xplore直接访问触发验证。arXiv缺journal-ref不能覆盖较新正式记录。作者稿与最终排版差异未逐行核对。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2607.09334

**检索来源：** https://arxiv.org/abs/2607.09334
https://doi.org/10.1109/tcomm.2026.3725321
https://api.crossref.org/works/10.1109/tcomm.2026.3725321
https://ieeexplore.ieee.org/document/11660482/

**筛选备注：** 可改造工具；缺口：地图失配如何转化为估计误差；深化：环境先验可信度。；PDF SecIII–V，尤其SecIV固定路径一阶模型、SecV数据划分/RT设置；IEEE注册元数据

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；arXiv/PDF未给实现仓库，精确标题和编号GitHub检索为0；未把Sionna依赖当作者实现。

**反馈匹配：** 相比既有WCM/CKM条件生成阅读，它直接给位置—角延—子空间—NMSE误差链，可作为不依赖神经生成器的强对照。

**反馈权重说明：** 优先数学机制、失配边界和系统指标，区分求解器/先验/数据收益，不预设有效。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2607.09334)

[来源 2](https://arxiv.org/abs/2607.09334)

[来源 3](https://doi.org/10.1109/tcomm.2026.3725321)

[来源 4](https://api.crossref.org/works/10.1109/tcomm.2026.3725321)

[来源 5](https://ieeexplore.ieee.org/document/11660482/)

来源 6：见页首翻译状态

[来源 7](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
