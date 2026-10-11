---
layout: page
title: "Integration Matters: Rollout-Based Training for Constrained Diffusion Models"
permalink: /papers/items/4b9fd6c01ae6ebf0/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=4b9fd6c01ae6ebf0)

[本篇日报说明](/papers/items/4b9fd6c01ae6ebf0/#paper-report) · [全文翻译（待补齐）](/papers/items/4b9fd6c01ae6ebf0/#paper-translation)

**推荐日期：** 2026-07-20 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. Integration Matters: Rollout-Based Training for Constrained Diffusion Models

- 作者：Xiaoxuan Liang, Saeid Naderiparizi, Berend Zwartsenberg, Frank Wood
- 时间/类型：2026，arXiv 预印本
- arXiv：[2607.14398](https://arxiv.org/abs/2607.14398)
- PDF：[官方 PDF](https://arxiv.org/pdf/2607.14398)
- 代码状态：**未发现公开代码**。论文、arXiv 页面及题名/IMCD/作者 GitHub 检索均未给出对应仓库。

### 核心问题与方法

常规 physics/constraint fine-tuning 通常只在前向加噪后的训练状态上计算约束；而实际反向采样会访问不同状态，少步采样时这种 distribution shift 更明显。IMCD（Integration Matters for Constrained Diffusion）在训练中执行固定噪声日程的在线反向 rollout，在终端样本上计算约束损失，并对整个数值积分轨迹反向传播，从而让模型在自己的采样状态上学习修正。

论文在弹球物理模拟和 INTERACTION 多车轨迹预测上报告：相对无约束扩散与采样时梯度修正，IMCD 显著降低越界/碰撞，同时保持有竞争力的轨迹质量与多样性。

### 与用户课题的接口

可把终端约束替换为导频与物理一致性：

\[
\mathcal L_{\text{terminal}}
=\lambda_y\|y-A\hat h_0\|_2^2
+\lambda_{\text{PSD}}\mathcal L_{\text{PSD}}
+\lambda_{\text{env}}\mathcal L_{\text{env}}.
\]

对当前 CM/DiT/GMFlow，可沿实际 4/8-step solver rollout 训练 LoRA 或小型 correction head；与“仅在推理端做 PnP/RC”形成清晰消融。该思路尤其适合验证：约束是否在少步采样中真实生效，而不是只在训练分布附近成立。

### 为什么不是重复

阅读笔记已有 PCFM、物理约束扩散、DPS/FlowDPS 与 PnP 数据一致性。本文新增的独立维度是 **training–sampling trajectory alignment**：不是再加一个约束项，而是把约束暴露到模型真实访问的反向积分状态。它填补少步 CM/DiT 与终端导频一致性之间的训练缺口。

### 局限

完整 rollout 反向传播成本较高；论文的交通实验使用 20 步采样，微调约需 72 小时/两张 L40S，尚不能视为轻量方案。验证任务是物理轨迹和自动驾驶，不是通信逆问题；结果还依赖固定噪声日程与约束可微性。

## 原推荐表字段

**日期：** 2026-07-20

**标题：** Integration Matters: Rollout-Based Training for Constrained Diffusion Models

**内容：** 作者：Xiaoxuan Liang、Saeid Naderiparizi、Berend Zwartsenberg、Frank Wood。IMCD（Integration Matters for Constrained Diffusion）把固定少步去噪积分轨迹展开并反向传播，在模型实际会访问的中间状态上训练，以终端约束损失直接对齐采样结果；在弹跳球和 INTERACTION 交通生成中降低碰撞/越界等约束违例，同时保持生成质量。局限：全 rollout 反传昂贵、依赖固定积分日程，实验非无线逆问题。

**契合方向：** 扩散/CM 少步生成；可微约束；物理一致性；条件生成

**推荐理由：** 可把终端损失替换为 pilot 残差、Hermitian/PSD 约束、路径几何或环境一致性，并直接训练 4/8 步 CM/flow rollout；它补足“只在采样时做 PnP 修正”与“训练时不知道实际积分误差”之间的断层。属于可迁移的训练原则，需在信道任务上重新验证。

**顶刊顶会/机构依据：** arXiv 2026 预印本；UBC、Inverted AI、Amii 团队。按少步约束训练机制入选，尚无正式刊会录用信息。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2607.14398

**检索来源：** arXiv:2607.14398；官方页：https://arxiv.org/abs/2607.14398；官方 PDF：https://arxiv.org/pdf/2607.14398

**筛选备注：** 硬去重无命中。对既有物理约束 diffusion/flow 的独立增量是“沿真实推理 rollout 训练终端约束”，不是普通扩散直接迁移；填补少步生成与数据一致性联合训练缺口。

**是否略读：** ☑

**是否精读：** ☐

**备注：** 补上少步 CM 训练与真实导频约束之间的缺口

**代码链接：** 未发现公开代码

**代码/数据状态：** 未发现公开代码：已检查论文页，并以完整标题、IMCD、作者和 arXiv ID 在 GitHub 检索，未发现作者方法仓库。

**反馈匹配：** 高匹配：CM/少步采样、物理/导频约束、连续条件生成和后验校正。

**反馈权重说明：** 与用户 CM+PnP 主线互补：把约束前移到训练轨迹，而非仅在推理末端投影；建议作为第二优先精读。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2607.14398)

[来源 2](https://arxiv.org/abs/2607.14398)
{% endraw %}
