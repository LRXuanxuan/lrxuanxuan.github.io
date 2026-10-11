---
layout: page
title: "STAR: Structure-aware Test-time Adaptation for diffusion-based light field Reconstruction"
permalink: /papers/items/fc3db27e4c1cac09/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=fc3db27e4c1cac09)

[本篇日报说明](/papers/items/fc3db27e4c1cac09/#paper-report) · [全文翻译（待补齐）](/papers/items/fc3db27e4c1cac09/#paper-translation)

**推荐日期：** 2026-09-27 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

### 01. STAR: Structure-aware Test-time Adaptation for diffusion-based light field Reconstruction

**作者：** Choi, Wontae; Moon, Ki Ryum; Lee, Jae Young; Yun, Hyung Sup; Chun, Il Yong。**年份/venue：** 2026 / arXiv。**浏览优先级：** A。

**发表状态：** 预印本/状态未确认。公开版本日期：2026/09/17。官方arXiv记录未提供已接受/正式发表信息；未据模板推断投稿状态。 核验日期2026-09-27。[来源1](https://arxiv.org/abs/2609.19747)

**问题：** 冻结生成先验在新场景中失配时，是否可只更新少量结构模块？

**方法：** STAR冻结光场DiT先验，以观测焦平面栈自监督更新空间卷积适配器LF-CA、跨视角LoRA及多域LF-MA；每次去噪保持物理成像约束。

**关键结果：** HCI异域测试使用2或3个焦平面、25 dB噪声；3平面消融中，冻结模型PSNR 37.09 dB，完整三适配器38.23 dB、SSIM 0.9463。

**局限与解释边界：** 主要是合成焦平面观测，训练与测试光场类别不同不等于真实传感器泛化。在线反向传播和适配成本必须计入；不能将光场空间/视角适配器直接当作MIMO条件机制。

**迁移类型：** 可改造工具。**与既有阅读的差异/位置：** 深化：相对阅读笔记中的DDNM、DPS、DiT，新增的是冻结先验上的观测驱动结构适配，而非更换扩散主干。

**推荐理由与课题接口：** 为跨站点条件失配提供小参数自适应对照，适合与完全冻结FlowADMM独立比较。

**原文：** [arXiv:2609.19747](https://arxiv.org/abs/2609.19747)；[官方页面](https://arxiv.org/abs/2609.19747)；[公开PDF](https://arxiv.org/pdf/2609.19747)。全文已解析5页，核查锚点：§3；§4.1；Tables 1–2（PDF第4页）。

**代码状态：** 未发现公开代码。核对官方论文页与PDF代码线索，并以题名/arXiv进行GitHub精确检索；本次未定位论文专属公开实现。未发现不等于不存在。

## 原推荐表字段

**日期：** 2026-09-27

**标题：** STAR: Structure-aware Test-time Adaptation for diffusion-based light field Reconstruction

**内容：** 作者：Choi, Wontae; Moon, Ki Ryum; Lee, Jae Young; Yun, Hyung Sup; Chun, Il Yong
问题：冻结生成先验在新场景中失配时，是否可只更新少量结构模块？
方法：STAR冻结光场DiT先验，以观测焦平面栈自监督更新空间卷积适配器LF-CA、跨视角LoRA及多域LF-MA；每次去噪保持物理成像约束。
结果：HCI异域测试使用2或3个焦平面、25 dB噪声；3平面消融中，冻结模型PSNR 37.09 dB，完整三适配器38.23 dB、SSIM 0.9463。
局限：主要是合成焦平面观测，训练与测试光场类别不同不等于真实传感器泛化。在线反向传播和适配成本必须计入；不能将光场空间/视角适配器直接当作MIMO条件机制。

**契合方向：** 生成式逆问题与自适应观测；可改造工具

**推荐理由：** 为跨站点条件失配提供小参数自适应对照，适合与完全冻结FlowADMM独立比较。

**顶刊顶会/机构依据：** arXiv；预印本/状态未确认；官方arXiv记录未提供已接受/正式发表信息；未据模板推断投稿状态。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.19747

**检索来源：** https://arxiv.org/abs/2609.19747

**筛选备注：** 2026-09-27身份去重通过；全文已解析5页，核查锚点：§3；§4.1；Tables 1–2（PDF第4页）。；官方arXiv记录未提供已接受/正式发表信息；未据模板推断投稿状态。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；核对官方论文页与PDF代码线索，并以题名/arXiv进行GitHub精确检索；本次未定位论文专属公开实现。未发现不等于不存在。

**反馈匹配：** 深化：相对阅读笔记中的DDNM、DPS、DiT，新增的是冻结先验上的观测驱动结构适配，而非更换扩散主干。

**反馈权重说明：** 优先级A；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.19747)

[来源 2](https://arxiv.org/abs/2609.19747)
{% endraw %}
