---
layout: page
title: "One-Step Generative CSI Prediction"
permalink: /papers/items/efb1c2b897f3baec/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=efb1c2b897f3baec)

[本篇日报说明](/papers/items/efb1c2b897f3baec/#paper-report) · [全文翻译（待补齐）](/papers/items/efb1c2b897f3baec/#paper-translation)

**推荐日期：** 2026-10-21 · **发表状态：** 在投

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. One-Step Generative CSI Prediction

**作者**：Sattari, Mehdi; Aliakbari, Javad; Amat, Alexandre Graell i; Svensson, Tommy。**年份/venue**：2026；arXiv（作者披露投稿IEEE WCNC 2027）。

**发表状态**：在投（作者公开自述）。2026-09-15 v1。arXiv comments写submitted to IEEE WCNC 2027；该披露截至核验日可能变化，未查到正式接收证据。 核验2026-10-21。

**方向与问题**：核心生成：有信息源分布、单步时序CSI预测与校准。从纯噪声生成未来CSI需要多步采样，在线延迟和分布过度自信会妨碍链路自适应。

**方法与独立机制**：ConvLSTM由过去CSI产生条件特征Z和点预测μ；源样本为stop-gradient(μ)+σε，MeanFlow用JVP学习平均速度。FiLM注入时间对(r,t)，每个未来帧一次生成器评估，自回归滚动；辅助MSE训练μ。

**关键结果**：28GHz、16×1 MIMO、Sionna CDL-A–E、30kHz SCS、30历史/10预测帧、30–120km/h；约2.2M参数，batch256训练50k步。Table II在20dB输入SNR下μ-MeanFlow/μ-Diffusion NMSE为−10.6/−11.0dB，90%覆盖率0.73/0.18；仍未达到0.90。A40单用户单帧推理6.8ms(1NFE)对19.8ms(3NFE)。

**局限与迁移边界**：1NFE是每个生成样本/未来帧，不等于完整10帧、30个样本或端到端仅一次网络调用。历史CSI加性噪声代替实际导频获取，尚无地图、ICI和实测跨城验证；覆盖不足且AR误差累积。表II覆盖0.73、表III同档0.72略有差异，保留各表原值。

**迁移类型与位置**：可直接复现；缺口：因果历史与CSI aging；基线：低NFE生成预测。

**与既有阅读差异**：相对静态单切片KAP和昨天的Conditional Mean Flows，本篇直接预测未来复数CSI，以可预测均值为源并评估覆盖/速率CRPS；不是仅把扩散网络改名。

**推荐理由**：最贴合“传播预测＋残差flow”和推理延迟导致CSI变旧的期刊扩展；优先核验相同参数量和真实使用时刻。

**代码状态**：完整开源实现。论文p4脚注链接作者库；实际存在Sionna数据流、ConvLSTM/U-Net、meanflow.py/JVP、inference.py、训练/评估/校准/时延脚本及测试。README部分旧归一化备注与论文不一致，复现前锁定config和commit；未运行复现。

[作者实现入口](https://github.com/MehdiSattari/meanflow-csi-prediction)。

**身份与证据**：arXiv:2609.17033；[来源1](https://arxiv.org/abs/2609.17033)。

[官方PDF/原文](https://arxiv.org/pdf/2609.17033)；[原文PDF](https://arxiv.org/pdf/2609.17033)。证据定位：PDF Sec.III/Algorithms1–2、Tables I–V、Figs2–4；6页。

全文可打开，标题核验通过；6页已缓存。job `71460b27ca64aeb140de7c94` 已入队，要求 `gpt-6-luna / xhigh`。原worker发送及有界查询均返回找不到会话，未成功启动、未译完。[本篇全文翻译状态](https://lrxuanxuan.github.io/papers/items/efb1c2b897f3baec/#paper-translation)。预计本地路径：`本地资料：paper.md`。

原文许可/权利政策：[https://arxiv.org/licenses/nonexclusive-distrib/1.0/](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)。当前全文版本未取得公开译文许可，完成稿仅本地；代码许可证不替代论文许可。全部PDF只保留原文链接，不上传GitHub/网站。

## 原推荐表字段

**日期：** 2026-10-21

**标题：** One-Step Generative CSI Prediction

**内容：** 作者：Sattari, Mehdi; Aliakbari, Javad; Amat, Alexandre Graell i; Svensson, Tommy。问题：从纯噪声生成未来CSI需要多步采样，在线延迟和分布过度自信会妨碍链路自适应。 方法：ConvLSTM由过去CSI产生条件特征Z和点预测μ；源样本为stop-gradient(μ)+σε，MeanFlow用JVP学习平均速度。FiLM注入时间对(r,t)，每个未来帧一次生成器评估，自回归滚动；辅助MSE训练μ。 结果：28GHz、16×1 MIMO、Sionna CDL-A–E、30kHz SCS、30历史/10预测帧、30–120km/h；约2.2M参数，batch256训练50k步。Table II在20dB输入SNR下μ-MeanFlow/μ-Diffusion NMSE为−10.6/−11.0dB，90%覆盖率0.73/0.18；仍未达到0.90。A40单用户单帧推理6.8ms(1NFE)对19.8ms(3NFE)。 局限：1NFE是每个生成样本/未来帧，不等于完整10帧、30个样本或端到端仅一次网络调用。历史CSI加性噪声代替实际导频获取，尚无地图、ICI和实测跨城验证；覆盖不足且AR误差累积。表II覆盖0.73、表III同档0.72略有差异，保留各表原值。

**契合方向：** 核心生成：有信息源分布、单步时序CSI预测与校准

**推荐理由：** 最贴合“传播预测＋残差flow”和推理延迟导致CSI变旧的期刊扩展；优先核验相同参数量和真实使用时刻。

**顶刊顶会/机构依据：** arXiv（作者披露投稿IEEE WCNC 2027）；在投（作者公开自述）；2026-09-15 v1。arXiv comments写submitted to IEEE WCNC 2027；该披露截至核验日可能变化，未查到正式接收证据。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.17033

**检索来源：** https://arxiv.org/abs/2609.17033

**筛选备注：** 可直接复现；缺口：因果历史与CSI aging；基线：低NFE生成预测。；与既有阅读差异：相对静态单切片KAP和昨天的Conditional Mean Flows，本篇直接预测未来复数CSI，以可预测均值为源并评估覆盖/速率CRPS；不是仅把扩散网络改名。；证据：PDF Sec.III/Algorithms1–2、Tables I–V、Figs2–4；6页；核验2026-10-21。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/MehdiSattari/meanflow-csi-prediction

**代码/数据状态：** 完整开源实现；论文p4脚注链接作者库；实际存在Sionna数据流、ConvLSTM/U-Net、meanflow.py/JVP、inference.py、训练/评估/校准/时延脚本及测试。README部分旧归一化备注与论文不一致，复现前锁定config和commit；未运行复现。

**反馈匹配：** 相对静态单切片KAP和昨天的Conditional Mean Flows，本篇直接预测未来复数CSI，以可预测均值为源并评估覆盖/速率CRPS；不是仅把扩散网络改名。

**反馈权重说明：** 以连续条件、物理先验、历史导频、真实时延和校准为匹配依据；区分瞬时恢复、动态预测与系统验证。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.17033)

[来源 2](https://arxiv.org/abs/2609.17033)

[来源 3](https://github.com/MehdiSattari/meanflow-csi-prediction)

[来源 4](https://lrxuanxuan.github.io/papers/items/efb1c2b897f3baec/#paper-translation)

[来源 5](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
