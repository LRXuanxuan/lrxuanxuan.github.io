---
layout: page
title: "Environment-Aware MIMO Channel Estimation in Pilot-Constrained Upper Mid-Band Systems"
permalink: /papers/items/9fbabb9ea67e23ff/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=9fbabb9ea67e23ff)

[本篇日报说明](/papers/items/9fbabb9ea67e23ff/#paper-report) · 全文翻译（待补齐）

**推荐日期：** 2026-07-12 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

# Environment-Aware MIMO Channel Estimation in Pilot-Constrained Upper Mid-Band Systems

- 原推荐日期：2026-07-12；原表身份：每日论文推荐第 10 行；论文身份键：8945337f08cbfbf33d79d68b。

- 本篇网站条目：[本篇日报与证据](https://lrxuanxuan.github.io/papers/items/9fbabb9ea67e23ff/#paper-report)（身份键 8945337f08cbfbf33d79d68b）；本篇翻译状态。
- 本次补写/核验日期：2026-10-12。
- 作者：Seyed Alireza Javid, Nuria González-Prelcic。原预印本年份：2025；Venue：IEEE ICASSP 2026，同题论文列入官方会议日程并于2026-05-07安排报告（Paper 13690）。IEEE Xplore DOI本轮未核实。作者另有题名不同的扩展期刊稿，不在本条合并身份。
- 本轮证据范围：arXiv摘要/元数据；全文未核验。本轮没有读取论文全文，以下方法/结果限于公开摘要或书目证据；不会把表中“略读”状态当成本轮全文阅读事实。

## 问题与方法

**问题：** upper mid-band MIMO在导频受限场景下，模型估计精度下降；纯数据驱动方法又缺少物理可解释性并需要大量场景数据。

**方法：** 物理模型初始信道估计与RSS环境地图作为两路输入，经带cross-attention的增强U-Net融合；论文定位为PINN式环境先验辅助信道估计。

## 结果、局限

**公开结果：** arXiv摘要称在城市射线追踪数据上，相对其SOTA对照NMSE提升超过5 dB，并称跨频率/环境只需少量微调；因未读全文，未核对基线、测试划分和dB计算口径。

**局限与待核验：** 本轮只读到arXiv摘要与元数据，全文/实验表未核验；RSS地图可用性、地图生成误差、跨频率/环境划分、微调数据量及推理复杂度都需全文确认。发表状态不由arXiv摘要推断。

## 对当前课题的迁移位置

适合作为“环境特征+低导频CSI”的确定性基线，与CKM条件flow/score先验比较。MVP：固定射线追踪场景划分，对比LS/模型估计、U-Net、RSS cross-attention；逐步减少导频并增加环境迁移，报告NMSE、少样本适配量与复杂度，地图不可用时单列降级。

## 链接与代码

- 原文/摘要：[https://arxiv.org/abs/2511.05771](https://arxiv.org/abs/2511.05771)
- 原文PDF：[https://arxiv.org/pdf/2511.05771](https://arxiv.org/pdf/2511.05771)（网站仅保留官方原文链接）
- DOI/出版信息：未核实
- 作者/出版核验：[ICASSP官方会议日程](https://www.cmsworkshops.com/ICASSP2026/view_paper.php?PaperNum=13690&bare=1)；[原预印本](https://arxiv.org/abs/2511.05771)
- 代码：[作者仓库](https://github.com/ajavid34/PINN_channel-estimation)（仅确认作者主页所链接，本轮未审查仓库完整性）
- 精读建议：精读建议：核查PINN具体约束是否进入损失/网络、RSS图与CSI样本如何配对、跨环境协议及5 dB所用指标基线。

> 本条是 2026-07-12 原推荐记录的增量补写稿，不代表完整日报。整日仍需补齐原表5篇，并完成组合逻辑、覆盖概览与优先精读/MVP汇总后才能发布。

## 原推荐表字段

**日期：** 2026-07-12

**标题：** Environment-Aware MIMO Channel Estimation in Pilot-Constrained Upper Mid-Band Systems

**内容：** 将初始信道估计与 RSS map 通过交叉注意力融合进 PINN/U-Net，在导频受限的 upper mid-band MIMO 中引入可解释环境先验。

**契合方向：** environment-aware；MIMO channel estimation；PINN；RSS map；pilot-limited

**推荐理由：** 是 CKM/location-specific prior 用于 MIMO CE 的互补路线：可与 score/flow 生成先验对比，尤其适合作为“物理环境特征+低导频恢复”的实验基线。

**顶刊顶会/机构依据：** arXiv 预印本（2025）；作者为 Nuria González-Prelcic 团队，预印本尚未确认正式发表版本。

**发表年份：** 2025

**论文下载链接：** https://arxiv.org/pdf/2511.05771

**检索来源：** arXiv: https://arxiv.org/abs/2511.05771

**筛选备注：** 近三年；预印本；与已记录的 CKM-score-function 方案不同，侧重 RSS map+PINN；后续跟踪正式发表版本。

**是否略读：** ☑

**是否精读：** ☐

**备注：** 值得参考

**代码链接：** —

**代码/数据状态：** —

**反馈匹配：** —

**反馈权重说明：** —

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2511.05771)

[来源 2](https://arxiv.org/abs/2511.05771)

[来源 3](https://lrxuanxuan.github.io/papers/items/9fbabb9ea67e23ff/#paper-report)（身份键)

来源 4：见页首翻译状态

[来源 5](https://arxiv.org/pdf/2511.05771)（网站仅保留官方原文链接)

[来源 6](https://www.cmsworkshops.com/ICASSP2026/view_paper.php?PaperNum=13690&bare=1)

[来源 7](https://github.com/ajavid34/PINN_channel-estimation)（仅确认作者主页所链接)
{% endraw %}
