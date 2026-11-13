---
layout: page
title: "CSI Prediction Frameworks for Enhanced 5G Link Adaptation: Performance-Complexity Trade-offs"
permalink: /papers/items/cb0783afa5fb9ec6/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=cb0783afa5fb9ec6)

[本篇日报说明](/papers/items/cb0783afa5fb9ec6/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-13-beec105b83cab44eb8a5b35c/)

**推荐日期：** 2026-11-13 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 5. CSI Prediction Frameworks for Enhanced 5G Link Adaptation: Performance-Complexity Trade-offs

**作者与出版信息**　Francisco Díaz-Ruiz、Francisco J. Martín-Vega、Jose A. Cortés、Gerardo Gómez、Mari Carmen Aguayo，2025，arXiv。预印本/状态未确认。核验 arXiv 版本，未确认正式出版或明确投稿状态。

**方向**　链路强基线与 AMC

**问题**　老化或低频反馈使 CQI/MCS 选择失配。

**论文方法**　在有效 SINR 域比较 By-CQI、Best-CQI 以及 Wiener 与 GRU 等预测器，评估 MSE、吞吐与 FLOPs。

**论文结果**　已知二阶统计时，Wiener 的 MSE 和吞吐接近 GRU，且复杂度更低；GRU 跨传播条件更稳。

**局限**　自建 5G 链路仿真，预测对象为有效 SINR；复杂度比较依赖二阶统计的获得条件。

**原文定位**　§II–V、表 II、图 11–12

**迁移类型**　理论启发或基线

**研究接口（迁移推断）**　由冻结波束输出有效 SINR，配同信息 Wiener、GRU 和过时 CSI 对照。

**与既有阅读的差异**　与只报告复 CSI NMSE 的研究相比，单独评价实际链路动作。

**推荐理由**　检验更复杂预测器是否产生吞吐价值。

**待验证假设**　相同输入和决策规则下，误差改善能否转化为好吞吐及低误块率？

**代码状态**　未发现公开代码。核对原文、arXiv 页面和 GitHub 题名及 ID，未定位作者实现。 [GitHub 检索](https://github.com/search?q=%222511.20160%22&type=repositories)

arXiv 2511.20160。Submission history From: Francisco Díaz-Ruiz [ view email ] [v1] Tue, 25 Nov 2025 10:37:12 UTC (845 KB) [arXiv 条目](https://arxiv.org/abs/2511.20160) [原文 PDF](https://arxiv.org/pdf/2511.20160)

全文 13 页。已进入 gpt-6-luna / xhigh 队列。 [本篇全文翻译](https://lrxuanxuan.github.io/papers/items/cb0783afa5fb9ec6/#paper-translation) [原文许可](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)

## 原推荐表字段

**日期：** 2026-11-13

**标题：** CSI Prediction Frameworks for Enhanced 5G Link Adaptation: Performance-Complexity Trade-offs

**内容：** 作者 Francisco Díaz-Ruiz、Francisco J. Martín-Vega、Jose A. Cortés、Gerardo Gómez、Mari Carmen Aguayo。问题：老化或低频反馈使 CQI/MCS 选择失配。 方法：在有效 SINR 域比较 By-CQI、Best-CQI 以及 Wiener 与 GRU 等预测器，评估 MSE、吞吐与 FLOPs。 结果：已知二阶统计时，Wiener 的 MSE 和吞吐接近 GRU，且复杂度更低；GRU 跨传播条件更稳。 局限：自建 5G 链路仿真，预测对象为有效 SINR；复杂度比较依赖二阶统计的获得条件。

**契合方向：** 链路强基线与 AMC

**推荐理由：** 检验更复杂预测器是否产生吞吐价值。

**顶刊顶会/机构依据：** arXiv。预印本/状态未确认。核验 arXiv 版本，未确认正式出版或明确投稿状态。

**发表年份：** 2025

**论文下载链接：** https://arxiv.org/pdf/2511.20160

**检索来源：** https://arxiv.org/abs/2511.20160

**筛选备注：** 理论启发或基线。由冻结波束输出有效 SINR，配同信息 Wiener、GRU 和过时 CSI 对照。 原文定位 §II–V、表 II、图 11–12。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码。核对原文、arXiv 页面和 GitHub 题名及 ID，未定位作者实现。 检索证据 https://github.com/search?q=%222511.20160%22&type=repositories

**反馈匹配：** 与只报告复 CSI NMSE 的研究相比，单独评价实际链路动作。

**反馈权重说明：** 待验证假设：相同输入和决策规则下，误差改善能否转化为好吞吐及低误块率？

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2511.20160)

[来源 2](https://arxiv.org/abs/2511.20160)

[来源 3](https://github.com/search?q=%222511.20160%22&type=repositories)

[来源 4](https://lrxuanxuan.github.io/papers/items/cb0783afa5fb9ec6/#paper-translation)

[来源 5](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
