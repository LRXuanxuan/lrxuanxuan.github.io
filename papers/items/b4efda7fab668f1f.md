---
layout: page
title: "Learning-based near- versus far-field boundaries for ultra-massive MIMO communications"
permalink: /papers/items/b4efda7fab668f1f/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=b4efda7fab668f1f)

[本篇日报说明](/papers/items/b4efda7fab668f1f/#paper-report)

**推荐日期：** 2026-09-28 · **发表状态：** 已接受待刊

<span id="paper-report"></span>

## 本篇推荐与证据

### 09. Learning-based near- versus far-field boundaries for ultra-massive MIMO communications

**作者：** Tarboush, Simon; Kouzayha, Nour; Sarieddeen, Hadi; Al-Naffouri, Tareq Y.; Caire, Giuseppe。**年份/venue：** 2026 / IEEE NextGCom 2026（作者版接受声明）。**浏览优先级：** B。

**发表状态：** 已接受待刊（作者自述）。公开版本日期：2026/09/17。PDF第一页声明Accepted for publication；未获得出版社会议录记录确认。 核验日期2026-09-28。[来源1](https://arxiv.org/abs/2609.21055)

**问题：** 在未知距离、CSI与位置标签时，如何判断适用近场还是远场处理？

**方法：** 以子阵接收功率差异作物理特征，OPTICS无监督聚类；按功率变化对簇排序，输出近/远场标签。

**关键结果：** TeraMIMO球面波仿真在0.3THz、1GHz及多个低SNR设置下与理论边界吻合；无需监督位置标签。

**局限与解释边界：** 簇到二分类的排序规则和噪声点处理仍是先验；受阵列、波束和传播设定影响，未证明跨硬件/实测普适性。

**迁移类型：** 可改造工具（拓展阅读）。**与既有阅读的差异/位置：** 应用：可作为模型选择或失配预警前端，而非替代CSI估计。不能因无坐标监督就推断现有Sheet2足以复现所有原始观测。

**推荐理由与课题接口：** 可作为模型选择或失配预警前端，而非替代CSI估计。不能因无坐标监督就推断现有Sheet2足以复现所有原始观测。

**原文：** [arXiv:2609.21055](https://arxiv.org/abs/2609.21055)；[官方页面](https://arxiv.org/abs/2609.21055)；[公开PDF](https://arxiv.org/pdf/2609.21055)。全文已解析4页，核查锚点：PDF第2–3页特征/OPTICS、第3页表I与实现规则、第4页结果。。

**代码状态：** 未发现公开代码。检查论文/项目线索及GitHub精确编号或题名搜索，未找到可确认的本文实现；不代表代码不存在。

## 原推荐表字段

**日期：** 2026-09-28

**标题：** Learning-based near- versus far-field boundaries for ultra-massive MIMO communications

**内容：** 作者：Tarboush, Simon; Kouzayha, Nour; Sarieddeen, Hadi; Al-Naffouri, Tareq Y.; Caire, Giuseppe
问题：在未知距离、CSI与位置标签时，如何判断适用近场还是远场处理？
方法：以子阵接收功率差异作物理特征，OPTICS无监督聚类；按功率变化对簇排序，输出近/远场标签。
结果：TeraMIMO球面波仿真在0.3THz、1GHz及多个低SNR设置下与理论边界吻合；无需监督位置标签。
局限：簇到二分类的排序规则和噪声点处理仍是先验；受阵列、波束和传播设定影响，未证明跨硬件/实测普适性。

**契合方向：** 可重构阵列与近远场识别；可改造工具（拓展阅读）

**推荐理由：** 可作为模型选择或失配预警前端，而非替代CSI估计。不能因无坐标监督就推断现有Sheet2足以复现所有原始观测。

**顶刊顶会/机构依据：** IEEE NextGCom 2026（作者版接受声明）；已接受待刊（作者自述）；PDF第一页声明Accepted for publication；未获得出版社会议录记录确认。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.21055

**检索来源：** https://arxiv.org/abs/2609.21055

**筛选备注：** 2026-09-28身份去重通过；全文已解析4页，核查锚点：PDF第2–3页特征/OPTICS、第3页表I与实现规则、第4页结果。。；PDF第一页声明Accepted for publication；未获得出版社会议录记录确认。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；检查论文/项目线索及GitHub精确编号或题名搜索，未找到可确认的本文实现；不代表代码不存在。

**反馈匹配：** 应用：可作为模型选择或失配预警前端，而非替代CSI估计。不能因无坐标监督就推断现有Sheet2足以复现所有原始观测。

**反馈权重说明：** 优先级B；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.21055)

[来源 2](https://arxiv.org/abs/2609.21055)
{% endraw %}
