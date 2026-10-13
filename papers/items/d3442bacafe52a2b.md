---
layout: page
title: "RadioTrace: Transmitter-Aware Diffusion for Radio Map Estimation without Deployment-Time Fine-Tuning"
permalink: /papers/items/d3442bacafe52a2b/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=d3442bacafe52a2b)

[本篇日报说明](/papers/items/d3442bacafe52a2b/#paper-report) · [阅读中文译稿（校对中）](/papers/translations/2026-07-29-2607-20909/)

**推荐日期：** 2026-07-29 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

本篇中文译稿已发布，尚未完成逐段校对和全文验收：[阅读中文译稿（校对中）](/papers/translations/2026-07-29-2607-20909/)。公式、表格与原文细节请同时对照原 PDF。

<span id="paper-report"></span>

## 本篇推荐与证据

## 1. RadioTrace: Transmitter-Aware Diffusion for Radio Map Estimation without Deployment-Time Fine-Tuning

- **作者**：Liu Yang, Qiang Li, Zhuo Cao, Weijie Xiong, Guomin Sun, Jingran Lin
- **年份/venue**：2026 arXiv；稿件标注 IEEE Transactions on Wireless Communications，正式录用与出版信息待核验
- **方向**：稀疏 RadioMap、未知发射机、冻结扩散先验、物理变量后验修正
- **问题**：稀疏 RSS 重建通常假设发射机位置已知；当 Tx 未知时，仅做地图级 measurement consistency 无法修正生成条件。
- **方法**：在冻结 RadioDiff 反向去噪内显式参数化 Tx 坐标；用 propagation-guided K-means 初始化，以稀疏观测残差更新 Tx，并用 incumbent best-anchor 抑制低噪声阶段振荡。
- **关键结果**：
  - RadioMapSeer 限制区域、1% 采样：NMSE 0.0174、SSIM 0.9518、PSNR 31.95 dB。
  - 0.05% 采样（约 33/65,536 个点）：SSIM 0.9087、PSNR 27.40 dB，Tx 平均定位误差仍由 41.28 m 降至 33.88 m。
  - 完整方法相对仅 PG-KMeans 的 RMSE 约低 25%；相对 PG-KMeans+Momentum GD 约低 10%。
- **局限**：使用约 137M 参数 U-Net 与 87M 条件网络，默认 100 步；主要输出 RSS 标量图，不能外推为完整 CIR、AoA/AoD 或 MIMO CSI；数据以 RadioMapSeer/BART-Lab 为主。
- **迁移类型**：**可直接复现 / 可改造工具**。
- **课题接口**：把 Tx/BS/粗几何或 CKM 条件 token 视为待估变量，与 \(H\) 或 PSD 在 PnP/CM 迭代中交替更新；这是比“固定 CKM 条件”更强的 posterior correction。
- **与既有阅读差异**：相对 RadioDiff-Inverse/LaPnP，独立增量是**观测同时更新地图和物理条件**，不是只把扩散先验作为正则项。
- **来源**：[arXiv](https://arxiv.org/abs/2607.20909)｜[PDF](https://arxiv.org/pdf/2607.20909)
- **代码状态**：**完整开源实现**；[YannLeo/RadioTrace](https://github.com/YannLeo/RadioTrace) 包含配置、PG-KMeans、Tx 更新、推理/评估、训练入口和 checkpoint 说明。
- **相对阅读笔记位置**：**深化**（CKM/RadioMap + PnP 后验闭环）。

## 原推荐表字段

**日期：** 2026-07-29

**标题：** RadioTrace: Transmitter-Aware Diffusion for Radio Map Estimation without Deployment-Time Fine-Tuning

**内容：** 作者：Liu Yang、Qiang Li、Zhuo Cao、Weijie Xiong、Guomin Sun、Jingran Lin。RadioTrace 将未知发射机坐标作为显式物理变量，在冻结 RadioDiff 先验的反向去噪中用稀疏 RSS 残差迭代更新，并以 propagation-guided K-means 与 best-anchor 稳定优化。RadioMapSeer 限制区域、1% 采样时 PSNR 31.95 dB、SSIM 0.9518；仅约 33 个点时仍有 27.40 dB。局限：137M U-Net+87M 条件网络、默认 100 步，输出为 RSS 标量图而非完整 CSI。

**契合方向：** 稀疏 RadioMap；未知 Tx；冻结扩散先验；物理变量后验校正

**推荐理由：** 最接近“环境/源变量+观测一致性+生成先验”的可执行闭环；可把 Tx/BS/粗几何 token 作为 CKM 条件变量，与 PnP 中的信道状态交替更新。迁移类型：可直接复现/可改造工具。

**顶刊顶会/机构依据：** 2026 arXiv；稿件标注 IEEE Transactions on Wireless Communications；正式 DOI/录用状态待核验。作者完整代码与 checkpoint 可用。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2607.20909

**检索来源：** arXiv:2607.20909；官方页：https://arxiv.org/abs/2607.20909；代码：https://github.com/YannLeo/RadioTrace

**筛选备注：** 硬去重无命中。相对 RadioDiff/RadioDiff-Inverse，独立增量是把未知 Tx 坐标嵌入去噪循环并联合恢复，而非只将地图先验作正则；相对阅读笔记为深化。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/YannLeo/RadioTrace

**代码/数据状态：** 完整开源实现：含配置、RadioDiff 先验、PG-KMeans、Tx 坐标更新、推理/评估脚本、依赖与预训练 checkpoint 说明。

**反馈匹配：** 强匹配：环境/地图先验、稀疏观测、物理后验修正、未知/噪声条件与 PnP 接口。

**反馈权重说明：** 今日首要精读。先做独立 Tx-aware 条件更新分支，不与 FlowADMM、CAR-Flow 等模块叠加归因。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2607.20909)

[来源 2](https://arxiv.org/abs/2607.20909)

[来源 3](https://github.com/YannLeo/RadioTrace)

[来源 4](https://arxiv.org/abs/2607.20909)｜)
{% endraw %}
