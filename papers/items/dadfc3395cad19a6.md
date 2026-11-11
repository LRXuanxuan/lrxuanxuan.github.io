---
layout: page
title: "From Discrete Snapshots to Geometric Entity: Motion-Native Channel Tracking for THz Near-Field XL-MIMO"
permalink: /papers/items/dadfc3395cad19a6/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=dadfc3395cad19a6)

[本篇日报说明](/papers/items/dadfc3395cad19a6/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-11-09e479285524a98946ad998c/#paper-dadfc3395cad19a6) · [全文中文译文](/papers/translations/2026-11-11-09e479285524a98946ad998c/#paper-dadfc3395cad19a6)

**推荐日期：** 2026-11-11 · **发表状态：** 在投

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. From Discrete Snapshots to Geometric Entity: Motion-Native Channel Tracking for THz Near-Field XL-MIMO

**作者/年份/venue**：Yuheng Fan; Chuang Yang; Mugen Peng；2026；arXiv公开预印本，投稿 venue 未公开确认。

**发表状态及证据**：在投。PDF 首页明确声明已向 IEEE 投稿，具体 venue 与审稿结果未确认。

**方向**：高速移动／THz 近场 XL-MIMO／稀疏导频追踪

**问题**：近场球面波耦合距离与角度，逐导频快照估计可能提前丢失共享轨迹信息。

**论文方法**：用三次 B 样条共享连续轨迹，通过各导频的剖面似然直接估计样条系数；二次罚分裂把局部几何更新与带状全局解耦。

**论文结果**：图5中中高 SNR 下 NMSE 优于测试的快照后平滑基线。图6在 20 dB、0.2–1.2 倍 Rayleigh 距离的测试内亦优于这些时序基线。

**局限与审计判断**：仿真主模型为占优 LoS，失配试验加入一条未建模 NLoS 路径，最高测至相对 LoS 的 −5 dB；固定样条阶数的线性复杂度针对全局带状更新。

**迁移类型**：理论启发或基线

**研究接口（迁移推断）**：在校正端用共享轨迹汇聚跨时刻导频似然；与已有条件 CSI 先验分离，评估轨迹约束对零空间 NMSE 的影响。

**与既有阅读差异**：区别于 DyRadio 的片段联合生成，本文通过球面波模型在形成快照前耦合导频似然。

**推荐理由**：提供可解释的移动约束基线，能独立检查共享轨迹是否优于后验平滑。

**待验证假设**：保持导频预算，速度较平滑且 LoS 占优时受益更大，转弯或多径主导时收益可能收缩。

**代码状态**：未发现公开代码

**代码证据**：官方页面、全文和 GitHub 精确标题、arXiv 编号检索未找到作者实现。搜索证据 https://github.com/search?q=2611.10587&type=repositories

**全文定位**：PDF §III–V，图5–7、10–14

**身份与版本**：arXiv:2611.10587；DOI 10.48550/arXiv.2611.10587；Submission history From: Yuheng Fan [ view email ] [v1] Sat, 7 Nov 2026 08:52:06 UTC (2,219 KB)；

[官方页面](https://arxiv.org/abs/2611.10587)；[官方PDF](https://arxiv.org/pdf/2611.10587)；[原文PDF](https://arxiv.org/pdf/2611.10587)。完整PDF可访问，共16页。

[本篇全文翻译/状态](https://lrxuanxuan.github.io/papers/items/dadfc3395cad19a6/#paper-translation)：job `09e479285524a98946ad998c`已入队，gpt-6-luna/xhigh；原worker找不到会话，未启动。

[原文许可](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)：公开译文许可未确认，先保留本地。PDF只保留本地与官方链接。

## 原推荐表字段

**日期：** 2026-11-11

**标题：** From Discrete Snapshots to Geometric Entity: Motion-Native Channel Tracking for THz Near-Field XL-MIMO

**内容：** 作者：Yuheng Fan; Chuang Yang; Mugen Peng。问题：近场球面波耦合距离与角度，逐导频快照估计可能提前丢失共享轨迹信息。 方法：用三次 B 样条共享连续轨迹，通过各导频的剖面似然直接估计样条系数；二次罚分裂把局部几何更新与带状全局解耦。 结果：图5中中高 SNR 下 NMSE 优于测试的快照后平滑基线。图6在 20 dB、0.2–1.2 倍 Rayleigh 距离的测试内亦优于这些时序基线。 局限：仿真主模型为占优 LoS，失配试验加入一条未建模 NLoS 路径，最高测至相对 LoS 的 −5 dB；固定样条阶数的线性复杂度针对全局带状更新。

**契合方向：** 高速移动／THz 近场 XL-MIMO／稀疏导频追踪

**推荐理由：** 提供可解释的移动约束基线，能独立检查共享轨迹是否优于后验平滑。

**顶刊顶会/机构依据：** arXiv公开预印本，投稿 venue 未公开确认；在投；PDF 首页明确声明已向 IEEE 投稿，具体 venue 与审稿结果未确认。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.10587

**检索来源：** https://arxiv.org/abs/2611.10587

**筛选备注：** 理论启发或基线；在校正端用共享轨迹汇聚跨时刻导频似然；与已有条件 CSI 先验分离，评估轨迹约束对零空间 NMSE 的影响。；PDF §III–V，图5–7、10–14

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；官方页面、全文和 GitHub 精确标题、arXiv 编号检索未找到作者实现。搜索证据 https://github.com/search?q=2611.10587&type=repositories

**反馈匹配：** 区别于 DyRadio 的片段联合生成，本文通过球面波模型在形成快照前耦合导频似然。

**反馈权重说明：** 独立机制；事实/迁移推断/待验证假设分开；同预算配对，不预设提升。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.10587)

[来源 2](https://arxiv.org/abs/2611.10587)

[来源 3](https://github.com/search?q=2611.10587&type=repositories)

[来源 4](https://lrxuanxuan.github.io/papers/items/dadfc3395cad19a6/#paper-translation)：job)

[来源 5](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)：公开译文许可未确认)
{% endraw %}
