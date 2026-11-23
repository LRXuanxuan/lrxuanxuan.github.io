---
layout: page
title: "Multi-Step Underwater Acoustic Channel Prediction via Dual-Domain Structure Preservation and Pretrained Transformer"
permalink: /papers/items/0241faaca7addab7/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=0241faaca7addab7)

[本篇日报说明](/papers/items/0241faaca7addab7/#paper-report) · [全文翻译（待补齐）](/papers/items/0241faaca7addab7/#paper-translation)

**推荐日期：** 2026-11-24 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. Multi-Step Underwater Acoustic Channel Prediction via Dual-Domain Structure Preservation and Pretrained Transformer

**作者/年份/venue**：Mingjie Cao、Gewei Zhang、Deqing Wang、Lizhao You、Fei-Yun Wu、Liqun Fu；2026；arXiv。

**发表状态**：预印本/状态未确认。官方arXiv条目与公开全文未给出可确认的录用/投稿声明。 [证据](https://arxiv.org/abs/2611.14592)

**方向**：实测多步信道预测；时频结构一致性。

**问题**：递归多步预测误差累积与海试样本不足。

**方法（论文事实）**：CIR/CFR傅里叶一致融合，延迟-时间token，冻结预训练Transformer并用BOFT联合输出多步CIR。

**关键结果（论文事实）**：Table III：SO-06/SO-07 NMSE 0.0411/0.0399；0.11M可训练参数，实际总参数21.08M、12.103 GFLOPs与7.602 ms。

**局限与审计**：水声信道不是射频MIMO；对照采用递归而本法直接多步，需拆分预测策略收益；少量可训练参数不等于低计算量。

**迁移类型**：可改造工具。

**研究接口（迁移推断）**：先比较同网络直接多步与递归输出，再检验傅里叶一致约束。

**与既有阅读差异**：不同于仅连续位置条件，提供实测时间预测与参数/推理成本分离。

**推荐理由**：联合多时距预测可作不依赖大生成器的对照。

**待验证假设**：保持网络容量与输入相同，直接多步是否仍优于递归有待验证。

**全文定位**：PDF pp.8–9数据；pp.20–24 Table II–III及Fig.8。

**身份与原文**：arXiv:2611.14592。[官方条目](https://arxiv.org/abs/2611.14592) · [PDF](https://arxiv.org/pdf/2611.14592)。Submission history From: Deqing Wang [ view email ] [v1] Tue, 10 Nov 2026 08:38:49 UTC (3,960 KB)

**代码状态**：未发现公开代码。已查官方条目、全文与精确题名/编号搜索，未定位本篇作者实现；不表示代码必然不存在。 [精确编号检索](https://github.com/search?q=%222611.14592%22&type=repositories)

**全文/翻译**：公开全文34页已缓存，gpt-6-luna/xhigh已入队，worker不可达未启动。[本篇全文翻译状态](https://lrxuanxuan.github.io/papers/items/0241faaca7addab7/#paper-translation)。原文许可：https://arxiv.org/licenses/nonexclusive-distrib/1.0/。PDF仅本地保存与官方链接，不上传。

## 原推荐表字段

**日期：** 2026-11-24

**标题：** Multi-Step Underwater Acoustic Channel Prediction via Dual-Domain Structure Preservation and Pretrained Transformer

**内容：** 作者：Mingjie Cao、Gewei Zhang、Deqing Wang、Lizhao You、Fei-Yun Wu、Liqun Fu。问题：递归多步预测误差累积与海试样本不足。方法：CIR/CFR傅里叶一致融合，延迟-时间token，冻结预训练Transformer并用BOFT联合输出多步CIR。关键结果：Table III：SO-06/SO-07 NMSE 0.0411/0.0399；0.11M可训练参数，实际总参数21.08M、12.103 GFLOPs与7.602 ms。局限：水声信道不是射频MIMO；对照采用递归而本法直接多步，需拆分预测策略收益；少量可训练参数不等于低计算量。

**契合方向：** 实测多步信道预测；时频结构一致性

**推荐理由：** 联合多时距预测可作不依赖大生成器的对照

**顶刊顶会/机构依据：** arXiv；预印本/状态未确认；官方arXiv条目与公开全文未给出可确认的录用/投稿声明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.14592

**检索来源：** https://arxiv.org/abs/2611.14592
https://doi.org/10.48550/arXiv.2611.14592

**筛选备注：** 可改造工具；先比较同网络直接多步与递归输出，再检验傅里叶一致约束；全文定位：PDF pp.8–9数据；pp.20–24 Table II–III及Fig.8

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；已查官方条目、全文与精确题名/编号搜索，未定位本篇作者实现；不表示代码必然不存在。 证据：https://github.com/search?q=%222611.14592%22&type=repositories

**反馈匹配：** 不同于仅连续位置条件，提供实测时间预测与参数/推理成本分离

**反馈权重说明：** 待验证假设：保持网络容量与输入相同，直接多步是否仍优于递归有待验证

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.14592)

[来源 2](https://arxiv.org/abs/2611.14592)

[来源 3](https://doi.org/10.48550/arXiv.2611.14592)

[来源 4](https://github.com/search?q=%222611.14592%22&type=repositories)

[来源 5](https://lrxuanxuan.github.io/papers/items/0241faaca7addab7/#paper-translation)

[来源 6](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
