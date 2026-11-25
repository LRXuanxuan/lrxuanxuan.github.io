---
layout: page
title: "Uncertainty-Aware Dimensionality Reduction for Channel Charting with Geodesic Loss"
permalink: /papers/items/e75ceb72b8dbba20/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=e75ceb72b8dbba20)

[本篇日报说明](/papers/items/e75ceb72b8dbba20/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-25-64727213f389ede2c2055788/)

**推荐日期：** 2026-11-25 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. Uncertainty-Aware Dimensionality Reduction for Channel Charting with Geodesic Loss

Florian Euchner、Phillip Stephan、Stephan ten Brink · 2024 · 2024 58th Asilomar Conference on Signals, Systems, and Computers。正式发表。出版方登记的卷页或文章号 1665-1672。[发表证据](https://doi.org/10.1109/ieeeconf60004.2024.10942819)

**地图邻域可信度**　非凸覆盖区中，两个指纹看似相近时，如何识别不可靠邻居？由实测 CSI 构建差异度，对距离不确定性建模，以测地损失约束低维嵌入。

**原文结果**　实测定位评价显示改进，作者也报告额外计算和超参数调节负担。（第 8 页）

**局限与迁移判断**　定位误差衡量地图几何，不能替代同帧信道估计误差。用邻域置信度控制局部向全局 LMMSE 回退，在验证场地确定阈值。

**代码**　作者预告/部分代码。作者在正文明确说明部分源码，仓库含计算差异度、评价与实验 notebooks。[审计入口](https://github.com/Jeija/Geodesic-Uncertainty-Loss-ChannelCharting) · [arXiv 2412.01715](https://arxiv.org/abs/2412.01715) · [原文 PDF，8 页](https://arxiv.org/pdf/2412.01715)

## 原推荐表字段

**日期：** 2026-11-25

**标题：** Uncertainty-Aware Dimensionality Reduction for Channel Charting with Geodesic Loss

**内容：** Florian Euchner、Phillip Stephan、Stephan ten Brink。非凸覆盖区中，两个指纹看似相近时，如何识别不可靠邻居？由实测 CSI 构建差异度，对距离不确定性建模，以测地损失约束低维嵌入。实测定位评价显示改进，作者也报告额外计算和超参数调节负担。

**契合方向：** 地图邻域可信度

**推荐理由：** 用邻域置信度控制局部向全局 LMMSE 回退，在验证场地确定阈值。

**顶刊顶会/机构依据：** 2024 58th Asilomar Conference on Signals, Systems, and Computers，正式发表。出版方登记的卷页或文章号 1665-1672

**发表年份：** 2024

**论文下载链接：** https://arxiv.org/pdf/2412.01715

**检索来源：** https://arxiv.org/abs/2412.01715
https://doi.org/10.1109/ieeeconf60004.2024.10942819

**筛选备注：** 定位误差衡量地图几何，不能替代同帧信道估计误差。 原文第 8 页。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/Jeija/Geodesic-Uncertainty-Loss-ChannelCharting

**代码/数据状态：** 作者预告/部分代码。作者在正文明确说明部分源码，仓库含计算差异度、评价与实验 notebooks。 https://github.com/Jeija/Geodesic-Uncertainty-Loss-ChannelCharting

**反馈匹配：** 非凸覆盖区中，两个指纹看似相近时，如何识别不可靠邻居？

**反馈权重说明：** 用邻域置信度控制局部向全局 LMMSE 回退，在验证场地确定阈值。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2412.01715)

[来源 2](https://arxiv.org/abs/2412.01715)

[来源 3](https://doi.org/10.1109/ieeeconf60004.2024.10942819)

[来源 4](https://github.com/Jeija/Geodesic-Uncertainty-Loss-ChannelCharting)
{% endraw %}
