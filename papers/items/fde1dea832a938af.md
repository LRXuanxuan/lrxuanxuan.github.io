---
layout: page
title: "Deep Learning based Channel Estimation for Massive MIMO with Hybrid Transceivers"
permalink: /papers/items/fde1dea832a938af/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=fde1dea832a938af)

[本篇日报说明](/papers/items/fde1dea832a938af/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-26-2245c976d6e4ce4f897fd14e/)

**推荐日期：** 2026-11-26 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇中文全文译稿已通过本地验收。依据原文许可，译稿仅本地保存。官方原文入口见下方。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. Deep Learning based Channel Estimation for Massive MIMO with Hybrid Transceivers

Jiabao Gao、Caijun Zhong、Geoffrey Ye Li、Zhaoyang Zhang · 2022 · IEEE Transactions on Wireless Communications。正式发表。出版方登记的卷页或文章号 5162-5174。[发表证据](https://doi.org/10.1109/twc.2021.3137354)

**位置条件与混合收发机**　角域可分区时，位置和测量矩阵各贡献多少？利用 GPS 选择区域网络，在区域内联合训练模拟测量矩阵与信道估计器，从有限射频链观测恢复上行信道。

**原文结果**　仿真中区域专用估计相对文中的压缩感知方案改善估计误差和在线计算开销。（第 1、18–24 页）

**局限与迁移判断**　联合优化测量算子与估计器，直接横比固定算子的结果会混入观测设计收益。可跑作者程序；迁移时分别固定测量算子与位置输入，检查边界样本的误分区。

**代码**　作者预告/部分代码。作者仓库含生成数据和主程序，未见显式许可证。[审计入口](https://github.com/EricGJB/HAD_channel_estimation) · [arXiv 2202.03220](https://arxiv.org/abs/2202.03220) · [原文 PDF，29 页](https://arxiv.org/pdf/2202.03220)

## 原推荐表字段

**日期：** 2026-11-26

**标题：** Deep Learning based Channel Estimation for Massive MIMO with Hybrid Transceivers

**内容：** Jiabao Gao、Caijun Zhong、Geoffrey Ye Li、Zhaoyang Zhang。角域可分区时，位置和测量矩阵各贡献多少？利用 GPS 选择区域网络，在区域内联合训练模拟测量矩阵与信道估计器，从有限射频链观测恢复上行信道。仿真中区域专用估计相对文中的压缩感知方案改善估计误差和在线计算开销。

**契合方向：** 位置条件与混合收发机

**推荐理由：** 可跑作者程序；迁移时分别固定测量算子与位置输入，检查边界样本的误分区。

**顶刊顶会/机构依据：** IEEE Transactions on Wireless Communications，正式发表。出版方登记的卷页或文章号 5162-5174

**发表年份：** 2022

**论文下载链接：** https://arxiv.org/pdf/2202.03220

**检索来源：** https://arxiv.org/abs/2202.03220
https://doi.org/10.1109/twc.2021.3137354

**筛选备注：** 联合优化测量算子与估计器，直接横比固定算子的结果会混入观测设计收益。 原文第 1、18–24 页。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/EricGJB/HAD_channel_estimation

**代码/数据状态：** 作者预告/部分代码。作者仓库含生成数据和主程序，未见显式许可证。 https://github.com/EricGJB/HAD_channel_estimation

**反馈匹配：** 角域可分区时，位置和测量矩阵各贡献多少？

**反馈权重说明：** 可跑作者程序；迁移时分别固定测量算子与位置输入，检查边界样本的误分区。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2202.03220)

[来源 2](https://arxiv.org/abs/2202.03220)

[来源 3](https://doi.org/10.1109/twc.2021.3137354)

[来源 4](https://github.com/EricGJB/HAD_channel_estimation)
{% endraw %}
