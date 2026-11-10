---
layout: page
title: "DeepRT-Cal: Learning to Calibrate Ray-Traced Twin Channel Statistics with Low-Fidelity Environmental Geometry"
permalink: /papers/items/b92a56da7bc9bb4f/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=b92a56da7bc9bb4f)

[本篇日报说明](/papers/items/b92a56da7bc9bb4f/#paper-report) · [全文翻译（待补齐）](/papers/items/b92a56da7bc9bb4f/#paper-translation)

**推荐日期：** 2026-11-11 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. DeepRT-Cal: Learning to Calibrate Ray-Traced Twin Channel Statistics with Low-Fidelity Environmental Geometry

**作者/年份/venue**：Shaoyi Liu; Jianhua Zhang; Li Yu; Yichen Cai; Tao Wu; Yuxiang Zhang; Jikun Du; Guangyi Liu；2026；arXiv预印本；未确认正式venue。

**发表状态及证据**：预印本/状态未确认。官方arXiv记录与所读PDF未提供可确认录用的公开声明。

**方向**：无线数字孪生／低保真地图／统计先验校准

**问题**：粗几何会改变射线路径，造成接收功率和时延统计的系统偏差。

**论文方法**：从链路、低保真 MPC、传播走廊和局部物体中以链路条件交叉注意力提取特征，训练时用高保真几何作为特权信息，部署用低保真输入。

**论文结果**：室外 NLoS 测试区相对高保真 RT，功率 MAE 从 16.80 降至 3.88 dB，RMS 时延扩展 MAE 从 304.89 降至 98.19 ns；LoS 主导区后一个指标与直接 RT 相近。

**局限与审计判断**：校准参照是校园高保真 RT。结果依赖配对的几何保真度监督，缺少实测 CSI 和跨城市验证。

**迁移类型**：可改造工具

**研究接口（迁移推断）**：把低保真地图输入校准成统计条件，分开报告地图统计误差与导频后验误差，保留未经校准的对照。

**与既有阅读差异**：此前 Ray-Traced Prior 检查模拟先验向实测的迁移；此文比较同场景低保真到高保真 RT 的统计校准。

**推荐理由**：给出直接可控的先验失配因素与 NLoS 分组口径。

**待验证假设**：低保真遮挡误差较大时，校准带来的收益应在 NLoS 组更明显。

**代码状态**：未发现公开代码

**代码证据**：官方页面、全文和 GitHub 精确标题、arXiv 编号检索未找到作者实现。搜索证据 https://github.com/search?q=2611.09079&type=repositories

**全文定位**：PDF §IV，表I–III、图8–9

**身份与版本**：arXiv:2611.09079；DOI 10.48550/arXiv.2611.09079；Submission history From: Shaoyi Liu [ view email ] [v1] Fri, 6 Nov 2026 07:07:21 UTC (7,661 KB)；

[官方页面](https://arxiv.org/abs/2611.09079)；[官方PDF](https://arxiv.org/pdf/2611.09079)；[原文PDF](https://arxiv.org/pdf/2611.09079)。完整PDF可访问，共16页。

[本篇全文翻译/状态](https://lrxuanxuan.github.io/papers/items/b92a56da7bc9bb4f/#paper-translation)：job `0c452128ba99a690e72b1d05`已入队，gpt-6-luna/xhigh；原worker找不到会话，未启动。

[原文许可](https://creativecommons.org/licenses/by/4.0/)：允许验收完成、保留归属/许可/翻译说明后的译文分享。PDF只保留本地与官方链接。

## 原推荐表字段

**日期：** 2026-11-11

**标题：** DeepRT-Cal: Learning to Calibrate Ray-Traced Twin Channel Statistics with Low-Fidelity Environmental Geometry

**内容：** 作者：Shaoyi Liu; Jianhua Zhang; Li Yu; Yichen Cai; Tao Wu; Yuxiang Zhang; Jikun Du; Guangyi Liu。问题：粗几何会改变射线路径，造成接收功率和时延统计的系统偏差。 方法：从链路、低保真 MPC、传播走廊和局部物体中以链路条件交叉注意力提取特征，训练时用高保真几何作为特权信息，部署用低保真输入。 结果：室外 NLoS 测试区相对高保真 RT，功率 MAE 从 16.80 降至 3.88 dB，RMS 时延扩展 MAE 从 304.89 降至 98.19 ns；LoS 主导区后一个指标与直接 RT 相近。 局限：校准参照是校园高保真 RT。结果依赖配对的几何保真度监督，缺少实测 CSI 和跨城市验证。

**契合方向：** 无线数字孪生／低保真地图／统计先验校准

**推荐理由：** 给出直接可控的先验失配因素与 NLoS 分组口径。

**顶刊顶会/机构依据：** arXiv预印本；未确认正式venue；预印本/状态未确认；官方arXiv记录与所读PDF未提供可确认录用的公开声明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.09079

**检索来源：** https://arxiv.org/abs/2611.09079

**筛选备注：** 可改造工具；把低保真地图输入校准成统计条件，分开报告地图统计误差与导频后验误差，保留未经校准的对照。；PDF §IV，表I–III、图8–9

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；官方页面、全文和 GitHub 精确标题、arXiv 编号检索未找到作者实现。搜索证据 https://github.com/search?q=2611.09079&type=repositories

**反馈匹配：** 此前 Ray-Traced Prior 检查模拟先验向实测的迁移；此文比较同场景低保真到高保真 RT 的统计校准。

**反馈权重说明：** 独立机制；事实/迁移推断/待验证假设分开；同预算配对，不预设提升。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.09079)

[来源 2](https://arxiv.org/abs/2611.09079)

[来源 3](https://github.com/search?q=2611.09079&type=repositories)

[来源 4](https://lrxuanxuan.github.io/papers/items/b92a56da7bc9bb4f/#paper-translation)：job)

[来源 5](https://creativecommons.org/licenses/by/4.0/)：允许验收完成、保留归属/许可/翻译说明后的译文分享)
{% endraw %}
