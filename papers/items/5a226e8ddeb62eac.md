---
layout: page
title: "Predicting silent failures of learned inference under restricted access: what measurement physics and prior information explain"
permalink: /papers/items/5a226e8ddeb62eac/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=5a226e8ddeb62eac)

[本篇日报说明](/papers/items/5a226e8ddeb62eac/#paper-report) · [全文翻译（待补齐）](/papers/items/5a226e8ddeb62eac/#paper-translation)

**推荐日期：** 2026-10-30 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 1. Predicting silent failures of learned inference under restricted access: what measurement physics and prior information explain

**作者/年份/venue**：Mario Gianni；2026；arXiv stat.ML。

**发表状态**：预印本/状态未确认。2026-10-20上传；arXiv未列录用信息。Zenodo DOI是代码数据身份，不是期刊发表证明。

**方向**：秩亏逆问题；不确定性；物理可探测性

**问题**：低残差与看似正常的诊断可能同时遗漏错误真值和不覆盖的区间。

**论文方法**：把未检测且未覆盖定义为blind set；先建立正确线性Gaussian模型下的先验平均分解，再以局部VAE线性化构造事前排序分数；比较latent Laplace与ensemble Kalman inversion。

**结果及证据边界**：240个预设错误的排序相关为0.79/0.84；后续对照未检出有界观测下学习分数超过物理基线的收益。最弱衰减时先验对排序有帮助，但Gaussian先验也有类似收益，trial层面不显著。

**局限与审计判断**：分数不是校准概率；64×64、单VAE、同一批物体分片训练测试，真实CT参考但受限观测是模拟Gaussian噪声；17项标准未多重校正，不证明跨物体泛化。

**迁移类型**：理论启发或基线

**研究接口（迁移推断）**：在当前导频算子及可观测/零空间分析后增加blind-error测试，不替换FlowADMM；优先服务期刊扩展可靠性证据。

**与既有阅读差异**：相对PosteriorBench及PC-DAPS，重点是事前预测诊断不报警的失败，且明确检验物理简单基线是否已解释收益。

**推荐理由**：直接审视低导频残差能否支持零空间恢复可信性，提供不利于学习先验优势的必要控制。

**代码状态**：作者预告/部分代码

**代码证据**：论文p16明确声明Zenodo包含代码、冻结预测与计划；本次Zenodo页面/API不可达(403)，未核验文件完整性，故保守归类，未运行。GitHub精确标题/编号检索未发现替代作者实现。

**全文定位**：p2–5定义/参考分解；p8–15实验及后续控制；p16局限和代码声明。

**稳定身份**：2610.28155

**一手来源**：[来源1](https://arxiv.org/abs/2610.28155) [来源2](https://doi.org/10.5281/zenodo.23392686)

[官方PDF](https://arxiv.org/pdf/2610.28155)；[原文PDF](https://arxiv.org/pdf/2610.28155)；22页。
代码存档Zenodo访问受限，完整性未核验；论文PDF可访问。

**代码入口**：[作者存档/仓库](https://doi.org/10.5281/zenodo.23392686)

[本篇全文翻译/真实状态](https://lrxuanxuan.github.io/papers/items/5a226e8ddeb62eac/#paper-translation)：job `93782749d8c453c1687facd4`已入队，固定gpt-6-luna/xhigh。原worker发送返回找不到会话，未启动/未完成。

[原文许可](https://creativecommons.org/licenses/by/4.0/)：许可允许完成并保留署名/改动说明后的译文共享。PDF仅本地/官方链接，不上传PDF/XLSX。

## 原推荐表字段

**日期：** 2026-10-30

**标题：** Predicting silent failures of learned inference under restricted access: what measurement physics and prior information explain

**内容：** 作者：Mario Gianni。问题：低残差与看似正常的诊断可能同时遗漏错误真值和不覆盖的区间。 方法：把未检测且未覆盖定义为blind set；先建立正确线性Gaussian模型下的先验平均分解，再以局部VAE线性化构造事前排序分数；比较latent Laplace与ensemble Kalman inversion。 结果：240个预设错误的排序相关为0.79/0.84；后续对照未检出有界观测下学习分数超过物理基线的收益。最弱衰减时先验对排序有帮助，但Gaussian先验也有类似收益，trial层面不显著。 局限：分数不是校准概率；64×64、单VAE、同一批物体分片训练测试，真实CT参考但受限观测是模拟Gaussian噪声；17项标准未多重校正，不证明跨物体泛化。

**契合方向：** 秩亏逆问题；不确定性；物理可探测性

**推荐理由：** 直接审视低导频残差能否支持零空间恢复可信性，提供不利于学习先验优势的必要控制。

**顶刊顶会/机构依据：** arXiv stat.ML；预印本/状态未确认；2026-10-20上传；arXiv未列录用信息。Zenodo DOI是代码数据身份，不是期刊发表证明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2610.28155

**检索来源：** https://arxiv.org/abs/2610.28155
https://doi.org/10.5281/zenodo.23392686

**筛选备注：** 理论启发或基线；在当前导频算子及可观测/零空间分析后增加blind-error测试，不替换FlowADMM；优先服务期刊扩展可靠性证据。；p2–5定义/参考分解；p8–15实验及后续控制；p16局限和代码声明。

**是否略读：** ☐

**是否精读：** ☐

**备注：** 代码存档Zenodo访问受限，完整性未核验；论文PDF可访问。

**代码链接：** https://doi.org/10.5281/zenodo.23392686

**代码/数据状态：** 作者预告/部分代码；论文p16明确声明Zenodo包含代码、冻结预测与计划；本次Zenodo页面/API不可达(403)，未核验文件完整性，故保守归类，未运行。GitHub精确标题/编号检索未发现替代作者实现。

**反馈匹配：** 相对PosteriorBench及PC-DAPS，重点是事前预测诊断不报警的失败，且明确检验物理简单基线是否已解释收益。

**反馈权重说明：** 机制互补；区分论文事实、迁移推断、待验证假设；不将功率图指标冒充复MIMO后验收益。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2610.28155)

[来源 2](https://arxiv.org/abs/2610.28155)

[来源 3](https://doi.org/10.5281/zenodo.23392686)

[来源 4](https://lrxuanxuan.github.io/papers/items/5a226e8ddeb62eac/#paper-translation)：job)

[来源 5](https://creativecommons.org/licenses/by/4.0/)：许可允许完成并保留署名/改动说明后的译文共享)
{% endraw %}
