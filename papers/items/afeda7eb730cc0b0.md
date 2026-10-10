---
layout: page
title: "Mobility- and Feedback-Aware Multi-Level Conflict-Triggered Hybrid Beamforming for Multi-User mmWave UAV Systems"
permalink: /papers/items/afeda7eb730cc0b0/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=afeda7eb730cc0b0)

[本篇日报说明](/papers/reports/2026-10-08/#paper-afeda7eb730cc0b0)

**推荐日期：** 2026-10-08 · **发表状态：** 在投

## 本篇推荐与证据

### 10. Mobility- and Feedback-Aware Multi-Level Conflict-Triggered Hybrid Beamforming for Multi-User mmWave UAV Systems

**作者：** Van Le, Thuan; Luong, Nguyen Cong; Li, Xingwang; Bao, Vo Nguyen Quoc; Tu, Ngo Hoang。**年份/venue：** 2026 / arXiv预印本。**浏览优先级：** A。

**发表状态：** 在投（作者自述，当前进展未确认）。首个公开版本日期：2026/09/14。arXiv于2026-09-14公开的comments注明提交IEEE；未确认具体刊物或后续录用，不计入已发表顶刊。 核验日期2026-10-08。[来源1](https://arxiv.org/abs/2609.15458)

**问题：** 反馈滞后和用户波束冲突下，更深的波束搜索可能因计算/训练开销反而降低净频谱效率。

**方法：** 由有限反馈、运动预测和冲突分数触发多级搜索，结合老化风险决定精化深度；模拟波束选定后再以导频获取有效信道并计算RZF数字波束。

**关键结果：** 以净和SE、5%用户速率和中断率共同评价。速度扫描中相对GS的中断率降幅在0与80 m/s端点分别约21.1%与29.9%；更激进AG3可进一步降中断但在主设置牺牲13.7%净SE。

**局限与解释边界：** 有限反馈、候选数和实际处理延迟必须对齐。oracle与可实现方法分开；不能将理想全CSI上界作同成本比较。RZF仍需有效信道，不是完全免CSI。

**迁移类型：** 可改造工具。**与既有阅读的差异/位置：** 应用：相对低延迟Null-Space Flow Matching信道估计，从重建算力预算转向波束搜索和反馈的真实收益。

**推荐理由与课题接口：** 适合给现有H估计增加同反馈条件的下游净SE与尾部速率；先审计H到波束的时间顺序，防止使用未来CSI。

**原文：** [arXiv:2609.15458](https://arxiv.org/abs/2609.15458)；[官方页面](https://arxiv.org/abs/2609.15458)；[公开PDF](https://arxiv.org/pdf/2609.15458)。全文已解析17页，核查锚点：系统时序、TableII–IV及速度扫描，PDF13–15页。

**版本记录：** Submission history From: Ngo Hoang Tu [ view email ] [v1] Mon, 14 Sep 2026 12:23:29 UTC (664 KB)

**代码状态：** 未发现公开代码。核查论文/公开作者信息和精确标题或arXiv ID的仓库检索，未定位到对应作者实现；不等于断言不存在。未运行复现实验。

## 原推荐表字段

**日期：** 2026-10-08

**标题：** Mobility- and Feedback-Aware Multi-Level Conflict-Triggered Hybrid Beamforming for Multi-User mmWave UAV Systems

**内容：** 作者：Van Le, Thuan; Luong, Nguyen Cong; Li, Xingwang; Bao, Vo Nguyen Quoc; Tu, Ngo Hoang
问题：反馈滞后和用户波束冲突下，更深的波束搜索可能因计算/训练开销反而降低净频谱效率。
方法：由有限反馈、运动预测和冲突分数触发多级搜索，结合老化风险决定精化深度；模拟波束选定后再以导频获取有效信道并计算RZF数字波束。
结果：以净和SE、5%用户速率和中断率共同评价。速度扫描中相对GS的中断率降幅在0与80 m/s端点分别约21.1%与29.9%；更激进AG3可进一步降中断但在主设置牺牲13.7%净SE。
局限：有限反馈、候选数和实际处理延迟必须对齐。oracle与可实现方法分开；不能将理想全CSI上界作同成本比较。RZF仍需有效信道，不是完全免CSI。

**契合方向：** 高速移动与波束管理；可改造工具

**推荐理由：** 适合给现有H估计增加同反馈条件的下游净SE与尾部速率；先审计H到波束的时间顺序，防止使用未来CSI。

**顶刊顶会/机构依据：** arXiv预印本；在投（作者自述，当前进展未确认）；arXiv于2026-09-14公开的comments注明提交IEEE；未确认具体刊物或后续录用，不计入已发表顶刊。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.15458

**检索来源：** https://arxiv.org/abs/2609.15458

**筛选备注：** 2026-10-08身份去重通过；全文已解析17页，核查锚点：系统时序、TableII–IV及速度扫描，PDF13–15页。；arXiv于2026-09-14公开的comments注明提交IEEE；未确认具体刊物或后续录用，不计入已发表顶刊。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；核查论文/公开作者信息和精确标题或arXiv ID的仓库检索，未定位到对应作者实现；不等于断言不存在。未运行复现实验。

**反馈匹配：** 应用：相对低延迟Null-Space Flow Matching信道估计，从重建算力预算转向波束搜索和反馈的真实收益。

**反馈权重说明：** 优先级A；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.15458)

[来源 2](https://arxiv.org/abs/2609.15458)
{% endraw %}
