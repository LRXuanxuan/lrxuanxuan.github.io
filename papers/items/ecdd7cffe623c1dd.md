---
layout: page
title: "Channel Estimation for Stacked Intelligent Metasurfaces with Mutual Coupling"
permalink: /papers/items/ecdd7cffe623c1dd/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=ecdd7cffe623c1dd)

[本篇日报说明](/papers/items/ecdd7cffe623c1dd/#paper-report) · [全文翻译（待补齐）](/papers/items/ecdd7cffe623c1dd/#paper-translation)

**推荐日期：** 2026-11-08 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. Channel Estimation for Stacked Intelligent Metasurfaces with Mutual Coupling

**作者/年份/venue**：Chandan Kumar Sheemar; Giovanni Iacovelli; Symeon Chatzinotas；2026；arXiv预印本；未确认正式venue。

**发表状态及证据**：预印本/状态未确认。官方arXiv记录与所读PDF未提供可确认录用的公开声明。

**方向**：互耦算子；导频可辨识性

**问题**：级联近似遗漏层间反射与互耦，模型偏差可在高 SNR 主导。

**论文方法**：多端口模型把未知信道分段后写成已知负载决定的线性回归，推导训练矩阵可辨识条件和未训练负载下的预测误差，优化电抗序列。

**论文结果**：Fig.2 在20 dB时，LMMSE估计后为19.4 bit/s/Hz，完美CSI为23.9；扣除训练后，文中设置需约210–310个符号的相干块才超越裸馈电。

**局限与审计判断**：数值多端口仿真，名义硬件模型已知。30 dB时位置抖动0.02λ使NMSE由−22.7恶化至−9.3 dB；系统速率比较依赖训练开销和相干时间。

**迁移类型**：理论启发或基线

**研究接口（迁移推断）**：把名义/真实导频算子分别用于反演/生成观测，拆分算子误差与条件先验失配。

**与既有阅读差异**：相较 GIST 的位置路径先验，本篇改变的是导频观测算子及训练序列。

**推荐理由**：训练算子的秩、偏差和相干块开销均可单独量化。

**待验证假设**：固定先验后，算子偏差可能压过高SNR下增加先验调用的收益。

**代码状态**：未发现公开代码

**代码证据**：已查官方页面及全文实现链接，精确标题与arXiv ID检索未发现可确认的作者实现；公开GitHub API精确标题和编号均返回0；作者PDF/页面另行核查；不是证明代码不存在。证据：https://arxiv.org/abs/2611.01114；https://github.com/search?q=2611.01114&type=repositories

**全文定位**：PDF pp.2–5 Propositions 1–3, Eq.(19), Fig.2

**身份与版本**：arXiv:2611.01114；DOI 10.48550/arXiv.2611.01114；Submission history From: Giovanni Iacovelli [ view email ] [v1] Sat, 31 Oct 2026 17:00:31 UTC (124 KB)

[官方页面](https://arxiv.org/abs/2611.01114)；[官方PDF](https://arxiv.org/pdf/2611.01114)；[原文PDF](https://arxiv.org/pdf/2611.01114)。完整PDF可访问，共5页。

[本篇全文翻译/状态](https://lrxuanxuan.github.io/papers/items/ecdd7cffe623c1dd/#paper-translation)：job `d4f93852507d7e32a21c42b9`已入队，gpt-6-luna/xhigh；原worker找不到会话，未启动。

[原文许可](https://creativecommons.org/licenses/by/4.0/)：允许验收完成、保留归属/许可/翻译说明后的译文分享。PDF只保留本地与官方链接。

## 原推荐表字段

**日期：** 2026-11-08

**标题：** Channel Estimation for Stacked Intelligent Metasurfaces with Mutual Coupling

**内容：** 作者：Chandan Kumar Sheemar; Giovanni Iacovelli; Symeon Chatzinotas。问题：级联近似遗漏层间反射与互耦，模型偏差可在高 SNR 主导。 方法：多端口模型把未知信道分段后写成已知负载决定的线性回归，推导训练矩阵可辨识条件和未训练负载下的预测误差，优化电抗序列。 结果：Fig.2 在20 dB时，LMMSE估计后为19.4 bit/s/Hz，完美CSI为23.9；扣除训练后，文中设置需约210–310个符号的相干块才超越裸馈电。 局限：数值多端口仿真，名义硬件模型已知。30 dB时位置抖动0.02λ使NMSE由−22.7恶化至−9.3 dB；系统速率比较依赖训练开销和相干时间。

**契合方向：** 互耦算子；导频可辨识性

**推荐理由：** 训练算子的秩、偏差和相干块开销均可单独量化。

**顶刊顶会/机构依据：** arXiv预印本；未确认正式venue；预印本/状态未确认；官方arXiv记录与所读PDF未提供可确认录用的公开声明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.01114

**检索来源：** https://arxiv.org/abs/2611.01114

**筛选备注：** 理论启发或基线；把名义/真实导频算子分别用于反演/生成观测，拆分算子误差与条件先验失配。；PDF pp.2–5 Propositions 1–3, Eq.(19), Fig.2

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；已查官方页面及全文实现链接，精确标题与arXiv ID检索未发现可确认的作者实现；公开GitHub API精确标题和编号均返回0；作者PDF/页面另行核查；不是证明代码不存在。证据：https://arxiv.org/abs/2611.01114；https://github.com/search?q=2611.01114&type=repositories

**反馈匹配：** 相较 GIST 的位置路径先验，本篇改变的是导频观测算子及训练序列。

**反馈权重说明：** 独立机制；事实/迁移推断/待验证假设分开；同预算配对，不预设提升。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.01114)

[来源 2](https://arxiv.org/abs/2611.01114)

[来源 3](https://github.com/search?q=2611.01114&type=repositories)

[来源 4](https://lrxuanxuan.github.io/papers/items/ecdd7cffe623c1dd/#paper-translation)：job)

[来源 5](https://creativecommons.org/licenses/by/4.0/)：允许验收完成、保留归属/许可/翻译说明后的译文分享)
{% endraw %}
