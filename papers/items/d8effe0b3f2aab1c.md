---
layout: page
title: "AIRMap: AI-Generated Radio Maps for Wireless Digital Twins"
permalink: /papers/items/d8effe0b3f2aab1c/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=d8effe0b3f2aab1c)

[本篇日报说明](/papers/items/d8effe0b3f2aab1c/#paper-report) · 全文翻译（待补齐）

**推荐日期：** 2026-07-26 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 5. AIRMap: AI-Generated Radio Maps for Wireless Digital Twins

- **作者**：Ali Saeizadeh, Miead Tehrani-Moayyed, Davide Villa, J. Gordon Beattie Jr., Pedram Johari, Stefano Basagni, Tommaso Melodia
- **年份 / venue**：2026，IEEE Transactions on Wireless Communications
- **DOI**：10.1109/TWC.2026.3704457
- **方向**：无线数字孪生；radio map；Sim2Real 校准；系统级验证
- **问题**：高保真 ray tracing 太慢，纯仿真模型又存在系统性误差；数字孪生需要低时延、可实测校准并能进入链路/系统仿真的模型。
- **方法**：以单通道 2D terrain/building elevation map 为输入，用 U-Net autoencoder 预测 path-gain map；先在大规模 Sionna RT 数据上训练，再用少量实测点微调校准，并接入 Sionna SYS 与 Colosseum。
- **关键结果**：最新 v4 在 1.2M Boston 样本和四种城乡/地形环境上报告低于 4 dB RMSE、NVIDIA L40S 上约 4 ms 推理、相对 GPU ray tracing 超过 100 倍加速；使用 20% 实测点后，median error 约降至 5%，系统级频谱效率和 BLER 与测量信道接近。
- **局限**：论文明确说明当前固定 1 GHz、各向同性天线，只输出 scalar path gain；扩展到方向性阵列、CIR、delay spread、AoA/AoD 仍需重新校准和验证。
- **迁移类型**：**可改造工具 / 系统基线**
- **与既有阅读差异**：相对 DeepRT/OpenPathNet，它强调的不是更快生成仿真标签，而是**小样本实测校准 + 系统级闭环验证**；相对 CKM 生成论文，它提供复杂度和链路指标接口。
- **课题接口**：将 20% 校准思路改为少量真实/高保真场景的 adapter 或 residual calibration；报告 radio-map 误差之外的 beam/SE/BLER 与 4 ms 级延迟。
- **相对阅读笔记位置**：**应用/系统基线**——补足 Sim2Real 与系统指标验证。
- **代码状态**：**作者预告/部分代码**。作者公开了 Sionna/BostonTwin 数据生成仓库，但未发现 AIRMap U-Net 训练、校准、权重和完整系统复现实代码；GitHub 精确题名/ID检索只出现第三方笔记仓库。
- **链接**：
  - 官方页：https://arxiv.org/abs/2511.05522
  - PDF：https://arxiv.org/pdf/2511.05522
  - DOI：https://doi.org/10.1109/TWC.2026.3704457
  - 部分代码：https://github.com/wineslab/sionna_data_generator
- **推荐理由**：它为当前偏“模型 NMSE”的实验补上实测校准、时延和系统 KPI，适合作为中期验证框架而非新的核心生成模型。

---

## 原推荐表字段

**日期：** 2026-07-26

**标题：** AIRMap: AI-Generated Radio Maps for Wireless Digital Twins

**内容：** 作者：Ali Saeizadeh、Miead Tehrani-Moayyed、Davide Villa、J. Gordon Beattie Jr.、Pedram Johari、Stefano Basagni、Tommaso Melodia。AIRMap 用单通道 terrain/building elevation map 和 U-Net 预测 path-gain map，先用 Sionna RT 训练，再用少量实测校准并接入 Sionna SYS/Colosseum。最新 v4 报告 1.2M 样本、四类环境、低于 4 dB RMSE、约 4 ms 推理、相对 GPU RT 超过 100×；20% 实测校准后 median error 约 5%。局限：固定 1 GHz、各向同性天线、只输出 scalar path gain。

**契合方向：** 无线数字孪生；RadioMap；Sim2Real 校准；实时系统验证

**推荐理由：** 可把少量实测 residual calibration 迁移到 CKM/WCM，并把评估扩展到 beam、SE、BLER 与推理时延；定位为可改造工具/系统基线，不是新的完整 MIMO CSI 生成器。

**顶刊顶会/机构依据：** IEEE Transactions on Wireless Communications 2026；DOI 10.1109/TWC.2026.3704457；Northeastern/WIoT 团队；作者主页列为 in print。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2511.05522

**检索来源：** arXiv:2511.05522；DOI 10.1109/TWC.2026.3704457；官方页：https://arxiv.org/abs/2511.05522；作者数据生成代码：https://github.com/wineslab/sionna_data_generator

**筛选备注：** 硬去重无命中。相对 DeepRT/OpenPathNet，新增小样本实测校准、4 ms 实时性与系统级 SE/BLER 验证；定位为应用/系统基线。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/wineslab/sionna_data_generator

**代码/数据状态：** 作者预告/部分代码：公开的是 Sionna/BostonTwin 数据生成器；未发现 AIRMap U-Net 训练、校准、权重和完整系统复现实代码。

**反馈匹配：** 中高匹配：环境先验、数字孪生、Sim2Real、复杂度—精度与系统 KPI。

**反馈权重说明：** 中期验证框架。不要把 scalar path-gain 结果外推为完整 CIR、AoA/AoD 或 MIMO CSI。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2511.05522)

[来源 2](https://arxiv.org/abs/2511.05522)

[来源 3](https://github.com/wineslab/sionna_data_generator)

[来源 4](https://doi.org/10.1109/TWC.2026.3704457)
{% endraw %}
