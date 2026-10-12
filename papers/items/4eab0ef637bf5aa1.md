---
layout: page
title: "F^4-CKM: Learning Channel Knowledge Map with Radio Frequency Radiance Field Rendering"
permalink: /papers/items/4eab0ef637bf5aa1/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=4eab0ef637bf5aa1)

[本篇日报说明](/papers/items/4eab0ef637bf5aa1/#paper-report) · [全文翻译（待补齐）](/papers/items/4eab0ef637bf5aa1/#paper-translation)

**推荐日期：** 2026-07-17 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

F⁴-CKM 已有摘要与推荐笔记。原上传版本为 IEEE 正式发表版，版权页明确写明转载/再发布需要 IEEE 许可。全文译稿暂不公开，待取得相应授权后再添加。

[原文（作者预印本）](https://arxiv.org/abs/2601.03601)

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. F^4-CKM: Learning Channel Knowledge Map with Radio Frequency Radiance Field Rendering

**作者**：Kequan Zhou, Guangyi Zhang, Hanlei Li, Yunlong Cai, Shengli Liu, Guanding Yu  
**年份/期刊**：2026，IEEE Transactions on Communications  
**标识**：[DOI: 10.1109/TCOMM.2026.3668162](https://doi.org/10.1109/TCOMM.2026.3668162)；[arXiv:2601.03601](https://arxiv.org/abs/2601.03601)  
**PDF**：[官方预印本 PDF](https://arxiv.org/pdf/2601.03601)  
**代码**：[kqzzzz/F4CKM](https://github.com/kqzzzz/F4CKM)  
**代码状态**：**作者预告/部分代码**。仓库已有配置、训练、测试、评估和消融入口，但 README 明确表示完整版本将逐步上传；数据与预训练权重通过外部入口提供。

### 核心问题与方法

论文以 RF radiance field 的思路构建 WiRARE，用连续空间-频率场代替规则栅格上的 CKM 插值。关键机制包括空间/频率感知编码、shaping filter 和 angular sampling，使模型能够按查询位置与频率“渲染”信道。

论文在模拟室内场景和 Argos 真实测量上验证。其报告三个场景的中位 PSNR 约为 17.13–19.23 dB，多数样本的 SGCS 高于 0.976，并进一步用系统 spectral efficiency 检查信道重建的通信意义。

### 与用户课题的关系

- **可改造成条件编码器**：把 WiRARE 的局部连续场表征变成 SRF/GMFlow/DiT 的环境 token，而不是仅把离散城市标签或坐标拼到网络输入。
- **适配不完整模态**：当前数据不存在同一城市同时完整具备坐标与 AoA/AoD 监督。可以先学习空间-频率连续场，再按现有模态分别提供位置、角域或增益条件，避免强行全监督绑定。
- **后续组合**：`RF field prior -> conditional cFMM -> pilot/PnP correction`，对应完整的先验、生成与观测修正链路。

### 为什么不是重复

**硬去重已排除；填补研究缺口。** 不同于 RadioDiff/CKMImage 的栅格图像生成，本篇的独立维度是连续 RF 场渲染、频率泛化、角度采样和真实测量验证；也不同于只用位置坐标的普通神经场回归。

### 局限

仓库尚非完整公开版本，外部数据下载的可持续性也需复现前再检查。论文核心是场重建/渲染，并非观测条件后验采样器。

---

## 原推荐表字段

**日期：** 2026-07-17

**标题：** F^4-CKM: Learning Channel Knowledge Map with Radio Frequency Radiance Field Rendering

**内容：** 核心问题：如何以连续场表示而非规则栅格插值学习空间-频率 CKM。方法：构建 WiRARE 射频辐射场，结合空间/频率感知、shaping filter 与角度采样，从查询位置和频率渲染信道。结果：模拟室内与 Argos 实测均验证位置/频率泛化；论文报告三个场景中位 PSNR 约 17.13–19.23 dB，且多数 SGCS 超过 0.976。局限：官方仓库注明完整实现仍在逐步上传，公开内容和数据入口需按部分代码看待。

**契合方向：** CKM/WCM；RF radiance field；连续空间-频率表征；角度采样；真实测量

**推荐理由：** 可把辐射场编码器输出作为连续环境 token 或 CKM condition，避免把位置、角度和增益强行绑定到当前不完整城市监督；也可作为生成式信道先验前的可微场表征层。

**顶刊顶会/机构依据：** Kequan Zhou 等；IEEE Transactions on Communications（2026）

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2601.03601

**检索来源：** IEEE TCOM DOI 10.1109/TCOMM.2026.3668162；arXiv:2601.03601；作者官方 GitHub

**筛选备注：** 硬去重已排除；填补“连续 RF 场渲染 + 频率泛化 + 真实测量”的 CKM 表征缺口，不同于 RadioDiff/CKMImage 的栅格图像生成，也不同于普通坐标回归。

**是否略读：** ☑

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/kqzzzz/F4CKM

**代码/数据状态：** 作者预告/部分代码：仓库含配置、训练/测试/评估与消融入口，但 README 明示将逐步上传完整版本；数据/预训练权重为外部下载。

**反馈匹配：** 高度匹配：连续 CKM、空间-频率先验、真实测量

**反馈权重说明：** 可改造成条件编码器；先做结构阅读，待仓库完整度提高后再全面复现

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2601.03601)

[来源 2](https://github.com/kqzzzz/F4CKM)

[来源 3](https://doi.org/10.1109/TCOMM.2026.3668162)

[来源 4](https://arxiv.org/abs/2601.03601)
{% endraw %}
