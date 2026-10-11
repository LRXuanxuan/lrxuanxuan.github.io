---
layout: page
title: "Physics-Guided Conditional Flow Matching with Energy Regularization for Robust PDE Inverse Problems"
permalink: /papers/items/5cdd2cbc4dcb1cfc/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=5cdd2cbc4dcb1cfc)

[本篇日报说明](/papers/items/5cdd2cbc4dcb1cfc/#paper-report) · [全文翻译（待补齐）](/papers/items/5cdd2cbc4dcb1cfc/#paper-translation)

**推荐日期：** 2026-09-17 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. Physics-Guided Conditional Flow Matching with Energy Regularization for Robust PDE Inverse Problems

- **作者**：Yongsheng Chen; Shuo Lu; Wei Guo; Xinghui Zhong
- **日期/venue**：2026-09-14；2026 arXiv预印本；正式venue待核验。
- **方向 / 迁移类型**：物理引导Flow；污染观测鲁棒性；能量重加权；可改造工具。
- **问题**：离群观测与物理约束不一致，统一拟合所有观测会使恢复偏移。
- **方法**：第一阶段使用轨迹局部PDE残差与间歇全局配点约束；冻结教师后计算物理—数据能量，第二阶段重加权flow matching损失。作者给出教师诱导重加权分布解释。
- **关键结果（原文证据）**：Table 4中NS压力相对L2误差从PG-CFM的0.575降至ERFM的0.406，MSE从0.00356降至0.00178；Table 5的β1仍由R-PINN取得更低MSE，不能概括成全部指标最优。公开仓库包含五类PDE notebooks、NS数据、主方法与消融。
- **局限**：针对单实例PDE反演，需优化网络，不能视为现成冻结信道先验的零成本推理替换。错误教师或错误物理模型可能压低真实稀有样本权重；模型约束不等于可靠标签。
- **与既有阅读差异**：相对Robust-CKMSRF缺失模态mask及一般SNR curriculum，新增的是物理一致性能量决定训练权重；不是测试后删难例。
- **课题接口（建议，未实测）**：独立分支把PDE残差替换为已知复数导频残差，训练/验证阶段注入预设污染；将普通损失、Huber和教师能量加权配平训练预算，完整测试集一律保留。
- **推荐理由**：提供有作者实现的鲁棒机制，适合独立扩展，避免把当前测试异常事后过滤包装成方法。
- **阅读笔记位置**：缺口：独立的训练期观测污染鲁棒分支。
- **一手来源**：[arXiv:2609.15536](https://arxiv.org/abs/2609.15536) · [PDF](https://arxiv.org/pdf/2609.15536) · 本地全文（本地资料：2609.15536.pdf）。未核实期刊DOI，不猜补。
- **代码状态（2026-09-17）**：完整开源实现。由PDF首页链接追溯作者仓库；树含BInv/HInv/NSInv/PInv/WInv，已检查PInv与NSInv主notebook的能量、ERFM优化、评估与保存代码。本次未运行复现，环境依赖仍需整理。 [作者代码](https://github.com/mosdf/PG-CFM-ERFM)。

## 原推荐表字段

**日期：** 2026-09-17

**标题：** Physics-Guided Conditional Flow Matching with Energy Regularization for Robust PDE Inverse Problems

**内容：** 作者：Yongsheng Chen; Shuo Lu; Wei Guo; Xinghui Zhong。问题：离群观测与物理约束不一致，统一拟合所有观测会使恢复偏移。 方法：第一阶段使用轨迹局部PDE残差与间歇全局配点约束；冻结教师后计算物理—数据能量，第二阶段重加权flow matching损失。作者给出教师诱导重加权分布解释。 结果：Table 4中NS压力相对L2误差从PG-CFM的0.575降至ERFM的0.406，MSE从0.00356降至0.00178；Table 5的β1仍由R-PINN取得更低MSE，不能概括成全部指标最优。公开仓库包含五类PDE notebooks、NS数据、主方法与消融。 局限：针对单实例PDE反演，需优化网络，不能视为现成冻结信道先验的零成本推理替换。错误教师或错误物理模型可能压低真实稀有样本权重；模型约束不等于可靠标签。

**契合方向：** 物理引导Flow；污染观测鲁棒性；能量重加权

**推荐理由：** 提供有作者实现的鲁棒机制，适合独立扩展，避免把当前测试异常事后过滤包装成方法。

**顶刊顶会/机构依据：** 2026 arXiv预印本；正式venue待核验

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.15536

**检索来源：** https://arxiv.org/abs/2609.15536

**筛选备注：** 可改造工具；缺口：独立的训练期观测污染鲁棒分支；差异：相对Robust-CKMSRF缺失模态mask及一般SNR curriculum，新增的是物理一致性能量决定训练权重；不是测试后删难例。 接口：独立分支把PDE残差替换为已知复数导频残差，训练/验证阶段注入预设污染；将普通损失、Huber和教师能量加权配平训练预算，完整测试集一律保留。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/mosdf/PG-CFM-ERFM

**代码/数据状态：** 完整开源实现；由PDF首页链接追溯作者仓库；树含BInv/HInv/NSInv/PInv/WInv，已检查PInv与NSInv主notebook的能量、ERFM优化、评估与保存代码。本次未运行复现，环境依赖仍需整理。

**反馈匹配：** 缺口：独立的训练期观测污染鲁棒分支

**反馈权重说明：** 提供有作者实现的鲁棒机制，适合独立扩展，避免把当前测试异常事后过滤包装成方法。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.15536)

[来源 2](https://arxiv.org/abs/2609.15536)

[来源 3](https://github.com/mosdf/PG-CFM-ERFM)
{% endraw %}
