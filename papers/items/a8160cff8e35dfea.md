---
layout: page
title: "Plug-and-Play ADMM for Inverse Problems with Flow Matching Denoiser"
permalink: /papers/items/a8160cff8e35dfea/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=a8160cff8e35dfea)

[本篇日报说明](/papers/items/a8160cff8e35dfea/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-12-c1713fa3122f24faa368c653/)

**推荐日期：** 2026-11-12 · **发表状态：** 已接受待刊

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 1. Plug-and-Play ADMM for Inverse Problems with Flow Matching Denoiser

**作者/年份/venue**：Dibyanshu Kumar; Magda Gregorova；2026；NeurIPS 2026。

**发表状态及证据**：已接受待刊。作者 arXiv Comments 明确声明录用，NeurIPS 官方 2026 目录列出该题名。

**方向**：PnP-ADMM 与流匹配

**问题**：数据近端可能把恢复迭代推离流轨迹。

**论文方法**：引入辅助变量和对偶更新，再用时间相关的确定性与随机投影校正轨迹。

**论文结果**：表 2 的 AFHQ-Cat 超分实验中，每 4 张图一批用时 12.81 s、峰值显存 1.79 GB。OT-ODE 对照为 27.63 s、9.52 GB。

**局限与审计判断**：§5 明确缺少严格收敛分析。图像实验的效率依赖前向算子、实现及硬件。

**迁移类型**：可改造工具

**研究接口（迁移推断）**：复用复数导频近端和同一冻结先验，只替换轨迹校正规则。

**与既有阅读差异**：此前 FANO 在退火层内优化前向噪声。本篇提供 ADMM 与轨迹校正的直接对照。

**推荐理由**：便于检验对偶反馈与流轨迹校正各自的贡献。

**待验证假设**：在固定 NFE 与随机种子下，轨迹校正可能减少秩亏情形的尾部误差。

**代码状态**：完整开源实现

**代码证据**：作者仓库提供主程序、配置、算子、依赖及数据与预训练模型下载说明，README 标注 BSD 3-Clause。静态检查，未运行。 检索证据 https://github.com/search?q=2611.13742&type=repositories

**全文定位**：§3、§4.2 表 2、附录 A.1

[作者仓库](https://github.com/dibyanshu100/flow_admm)

**身份与版本**：arXiv:2611.13742；DOI 10.48550/arXiv.2611.13742；Submission history From: Dibyanshu Kumar [ view email ] [v1] Tue, 10 Nov 2026 08:42:28 UTC (28,553 KB)；[发表或版本证据](https://neurips.cc/Downloads/2026)

[官方页面](https://arxiv.org/abs/2611.13742)；[官方PDF](https://arxiv.org/pdf/2611.13742)；[原文PDF](https://arxiv.org/pdf/2611.13742)。完整PDF可访问，共31页。

[本篇全文翻译/状态](https://lrxuanxuan.github.io/papers/items/a8160cff8e35dfea/#paper-translation)：job `c1713fa3122f24faa368c653`已入队，gpt-6-luna/xhigh；原worker找不到会话，未启动。

[原文许可](https://creativecommons.org/licenses/by/4.0/)：允许验收完成、保留归属/许可/翻译说明后的译文分享。PDF只保留本地与官方链接。

## 原推荐表字段

**日期：** 2026-11-12

**标题：** Plug-and-Play ADMM for Inverse Problems with Flow Matching Denoiser

**内容：** 作者：Dibyanshu Kumar; Magda Gregorova。问题：数据近端可能把恢复迭代推离流轨迹。 方法：引入辅助变量和对偶更新，再用时间相关的确定性与随机投影校正轨迹。 结果：表 2 的 AFHQ-Cat 超分实验中，每 4 张图一批用时 12.81 s、峰值显存 1.79 GB。OT-ODE 对照为 27.63 s、9.52 GB。 局限：§5 明确缺少严格收敛分析。图像实验的效率依赖前向算子、实现及硬件。

**契合方向：** PnP-ADMM 与流匹配

**推荐理由：** 便于检验对偶反馈与流轨迹校正各自的贡献。

**顶刊顶会/机构依据：** NeurIPS 2026；已接受待刊；作者 arXiv Comments 明确声明录用，NeurIPS 官方 2026 目录列出该题名。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.13742

**检索来源：** https://arxiv.org/abs/2611.13742
https://neurips.cc/Downloads/2026

**筛选备注：** 可改造工具；复用复数导频近端和同一冻结先验，只替换轨迹校正规则。；§3、§4.2 表 2、附录 A.1

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/dibyanshu100/flow_admm

**代码/数据状态：** 完整开源实现；作者仓库提供主程序、配置、算子、依赖及数据与预训练模型下载说明，README 标注 BSD 3-Clause。静态检查，未运行。 检索证据 https://github.com/search?q=2611.13742&type=repositories

**反馈匹配：** 此前 FANO 在退火层内优化前向噪声。本篇提供 ADMM 与轨迹校正的直接对照。

**反馈权重说明：** 独立机制；事实/迁移推断/待验证假设分开；同预算配对，不预设提升。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.13742)

[来源 2](https://arxiv.org/abs/2611.13742)

[来源 3](https://neurips.cc/Downloads/2026)

[来源 4](https://github.com/dibyanshu100/flow_admm)

[来源 5](https://github.com/search?q=2611.13742&type=repositories)

[来源 6](https://lrxuanxuan.github.io/papers/items/a8160cff8e35dfea/#paper-translation)：job)

[来源 7](https://creativecommons.org/licenses/by/4.0/)：允许验收完成、保留归属/许可/翻译说明后的译文分享)
{% endraw %}
