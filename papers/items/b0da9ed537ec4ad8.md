---
layout: page
title: "WiSER: A Wireless Scene Encoder for Geometry-Grounded Multi-View Wireless Prediction"
permalink: /papers/items/b0da9ed537ec4ad8/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=b0da9ed537ec4ad8)

[本篇日报说明](/papers/items/b0da9ed537ec4ad8/#paper-report) · [全文翻译（待补齐）](/papers/items/b0da9ed537ec4ad8/#paper-translation)

**推荐日期：** 2026-11-13 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 7. WiSER: A Wireless Scene Encoder for Geometry-Grounded Multi-View Wireless Prediction

**作者与出版信息**　Jing Qiao、Yiyang Guo、Hao Ye，2026，arXiv。预印本/状态未确认。核验 arXiv 版本，未确认正式出版或明确投稿状态。

**方向**　几何条件与地图/CIR

**问题**　单一 radiomap 或 CIR 预测忽略共同传播结构。

**论文方法**　共享发射机条件稀疏三维场景编码，分别预测 radiomap 与多径集合，包含沿射线路径的特征汇聚。

**论文结果**　表 I 地图 MAE 3.834 dB；表 II 匹配时延 MAE 0.61 ns，对照 3D CNN 为 1.50 ns。

**局限**　匹配峰值功率和时延不提供相干复相位；地图与 CIR 任务的数据划分不同。

**原文定位**　§III–VI、表 I–III

**迁移类型**　理论启发或基线

**研究接口（迁移推断）**　将连续查询的功率/延迟先验限定为可辨识统计，由导频提供相位信息。

**与既有阅读的差异**　相比单视图 WCM，检验共享几何表征对两类标签的作用。

**推荐理由**　有助于设计不同接收分辨率下可核验的地图先验。

**待验证假设**　同样的几何输入下，多任务先验是否改善未见场景的稀疏导频估计？

**代码状态**　作者预告/部分代码。项目仓库仅含网页与资源，README 的实现、数据和 checkpoint 均为 coming soon。 [GitHub 检索](https://github.com/search?q=%222606.04770%22&type=repositories) [作者项目或仓库](https://github.com/scp10086/wiser-page)

arXiv 2606.04770。Submission history From: Hao Ye [ view email ] [v1] Wed, 3 Jun 2026 11:52:09 UTC (1,300 KB) [arXiv 条目](https://arxiv.org/abs/2606.04770) [原文 PDF](https://arxiv.org/pdf/2606.04770)

全文 13 页。已进入 gpt-6-luna / xhigh 队列。 [本篇全文翻译](https://lrxuanxuan.github.io/papers/items/b0da9ed537ec4ad8/#paper-translation) [原文许可](https://creativecommons.org/licenses/by/4.0/)

## 原推荐表字段

**日期：** 2026-11-13

**标题：** WiSER: A Wireless Scene Encoder for Geometry-Grounded Multi-View Wireless Prediction

**内容：** 作者 Jing Qiao、Yiyang Guo、Hao Ye。问题：单一 radiomap 或 CIR 预测忽略共同传播结构。 方法：共享发射机条件稀疏三维场景编码，分别预测 radiomap 与多径集合，包含沿射线路径的特征汇聚。 结果：表 I 地图 MAE 3.834 dB；表 II 匹配时延 MAE 0.61 ns，对照 3D CNN 为 1.50 ns。 局限：匹配峰值功率和时延不提供相干复相位；地图与 CIR 任务的数据划分不同。

**契合方向：** 几何条件与地图/CIR

**推荐理由：** 有助于设计不同接收分辨率下可核验的地图先验。

**顶刊顶会/机构依据：** arXiv。预印本/状态未确认。核验 arXiv 版本，未确认正式出版或明确投稿状态。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2606.04770

**检索来源：** https://arxiv.org/abs/2606.04770

**筛选备注：** 理论启发或基线。将连续查询的功率/延迟先验限定为可辨识统计，由导频提供相位信息。 原文定位 §III–VI、表 I–III。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/scp10086/wiser-page

**代码/数据状态：** 作者预告/部分代码。项目仓库仅含网页与资源，README 的实现、数据和 checkpoint 均为 coming soon。 检索证据 https://github.com/search?q=%222606.04770%22&type=repositories

**反馈匹配：** 相比单视图 WCM，检验共享几何表征对两类标签的作用。

**反馈权重说明：** 待验证假设：同样的几何输入下，多任务先验是否改善未见场景的稀疏导频估计？

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2606.04770)

[来源 2](https://arxiv.org/abs/2606.04770)

[来源 3](https://github.com/scp10086/wiser-page)

[来源 4](https://github.com/search?q=%222606.04770%22&type=repositories)

[来源 5](https://lrxuanxuan.github.io/papers/items/b0da9ed537ec4ad8/#paper-translation)

[来源 6](https://creativecommons.org/licenses/by/4.0/)
{% endraw %}
