---
layout: page
title: "Reformulated Partial-Inverse Algorithms for Time-Domain Reed–Solomon Codes With Hardware Considerations"
permalink: /papers/items/fa792f0d4a8db9aa/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=fa792f0d4a8db9aa)

[本篇日报说明](/papers/items/fa792f0d4a8db9aa/#paper-report) · 全文翻译（待补齐）

**推荐日期：** 2026-10-08 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

### 17. Reformulated Partial-Inverse Algorithms for Time-Domain Reed–Solomon Codes With Hardware Considerations

**作者：** Li Liu; Jiun-Hung Yu; Wun-Jhe Wu; Chih-Wei Liu; Yu Ted Su。**年份/venue：** 2026 / IEEE Transactions on Signal Processing。**浏览优先级：** B。

**发表状态：** 正式发表。首个公开版本日期：2026年正式卷页；精确首次在线日期未核实。出版社注册元数据：卷74，页3708-3723，2026年。 IEEE页面受访问限制，以DOI注册元数据及下列公开作者/机构证据交叉核验。 核验日期2026-10-08。[来源1](https://ieeexplore.ieee.org/document/11672207/)；[来源2](https://doi.org/10.1109/tsp.2026.3724255)；[来源3](https://api.crossref.org/works/10.1109/tsp.2026.3724255)；[来源4](https://signalprocessingsociety.org/index.php/publications-resources/ieee-transactions-signal-processing/2026/09/reformulated-partial-inverse)

**问题：** Reed–Solomon部分逆算法的软件形式未必适合低门数、低时延或高吞吐硬件。

**方法：** 公开IEEE摘要给出rPI、RPI和ERPI重构：串行架构配Horiguchi–Koetter插值，平行高速架构配Forney插值，并保留内生早停机制。

**关键结果：** IEEE SPS公开摘要报告：RS(255,239)、P=16平行度下，RPI加Forney相对ePIBMA加HK的Gbps/门数效率约提高20%。只引用摘要明确给出的配置和数值。

**局限与解释边界：** 全文受限，工艺、时钟、面积/功耗测量方式与其他码率范围尚未核查；不能把20%推广到所有RS码或GPU上运行的神经求解器。

**迁移类型：** 理论启发或基线（拓展阅读）。**与既有阅读的差异/位置：** 缺口：对以NFE/NMSE为主的笔记补充算法重排与硬件结构联合设计，独立贡献在译码实现而非无线地图。

**推荐理由与课题接口：** 可学习复杂度报告方式：操作数量、数据依赖、并行深度、实测吞吐分开；需学校访问全文后再做硬件复现。

**原文：** [DOI:10.1109/tsp.2026.3724255](https://doi.org/10.1109/tsp.2026.3724255)；[官方页面](https://ieeexplore.ieee.org/document/11672207/)；[出版社PDF入口（访问受限）](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=11672207)。全文暂不可访问，待用户通过学校账号获取；当前介绍依据公开摘要/元数据，未完成全文核验。DOI和出版社链接见本条来源。

**版本记录：** 仅核验2026正式卷页，首次上线精确日期待核验

**代码状态：** 未发现公开代码。核查论文/公开作者信息和精确标题或arXiv ID的仓库检索，未定位到对应作者实现；不等于断言不存在。未运行复现实验。

## 原推荐表字段

**日期：** 2026-10-08

**标题：** Reformulated Partial-Inverse Algorithms for Time-Domain Reed–Solomon Codes With Hardware Considerations

**内容：** 作者：Li Liu; Jiun-Hung Yu; Wun-Jhe Wu; Chih-Wei Liu; Yu Ted Su
问题：Reed–Solomon部分逆算法的软件形式未必适合低门数、低时延或高吞吐硬件。
方法：公开IEEE摘要给出rPI、RPI和ERPI重构：串行架构配Horiguchi–Koetter插值，平行高速架构配Forney插值，并保留内生早停机制。
结果：IEEE SPS公开摘要报告：RS(255,239)、P=16平行度下，RPI加Forney相对ePIBMA加HK的Gbps/门数效率约提高20%。只引用摘要明确给出的配置和数值。
局限：全文受限，工艺、时钟、面积/功耗测量方式与其他码率范围尚未核查；不能把20%推广到所有RS码或GPU上运行的神经求解器。

**契合方向：** 编码算法与硬件实现；理论启发或基线（拓展阅读）

**推荐理由：** 可学习复杂度报告方式：操作数量、数据依赖、并行深度、实测吞吐分开；需学校访问全文后再做硬件复现。

**顶刊顶会/机构依据：** IEEE Transactions on Signal Processing；正式发表；出版社注册元数据：卷74，页3708-3723，2026年。 IEEE页面受访问限制，以DOI注册元数据及下列公开作者/机构证据交叉核验。

**发表年份：** 2026

**论文下载链接：** https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=11672207

**检索来源：** https://ieeexplore.ieee.org/document/11672207/
https://doi.org/10.1109/tsp.2026.3724255
https://api.crossref.org/works/10.1109/tsp.2026.3724255
https://signalprocessingsociety.org/index.php/publications-resources/ieee-transactions-signal-processing/2026/09/reformulated-partial-inverse

**筛选备注：** 2026-10-08身份去重通过；全文暂不可访问，待用户通过学校账号获取；当前介绍依据公开摘要/元数据，未完成全文核验。DOI和出版社链接见本条来源。；出版社注册元数据：卷74，页3708-3723，2026年。 IEEE页面受访问限制，以DOI注册元数据及下列公开作者/机构证据交叉核验。

**是否略读：** ☐

**是否精读：** ☐

**备注：** 全文暂不可访问，待用户通过学校账号获取；当前介绍依据公开摘要/元数据，未完成全文核验；DOI：https://doi.org/10.1109/tsp.2026.3724255；出版社：https://ieeexplore.ieee.org/document/11672207/

**代码链接：** —

**代码/数据状态：** 未发现公开代码；核查论文/公开作者信息和精确标题或arXiv ID的仓库检索，未定位到对应作者实现；不等于断言不存在。未运行复现实验。

**反馈匹配：** 缺口：对以NFE/NMSE为主的笔记补充算法重排与硬件结构联合设计，独立贡献在译码实现而非无线地图。

**反馈权重说明：** 优先级B；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=11672207)

[来源 2](https://ieeexplore.ieee.org/document/11672207/)

[来源 3](https://doi.org/10.1109/tsp.2026.3724255)

[来源 4](https://api.crossref.org/works/10.1109/tsp.2026.3724255)

[来源 5](https://signalprocessingsociety.org/index.php/publications-resources/ieee-transactions-signal-processing/2026/09/reformulated-partial-inverse)
{% endraw %}
