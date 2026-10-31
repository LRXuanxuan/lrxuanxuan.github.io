---
layout: page
title: "Interference-Cancellation-Based Channel Knowledge Map Construction and Its Applications to Channel Estimation"
permalink: /papers/items/ef5d07dc84efccfe/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=ef5d07dc84efccfe)

[本篇日报说明](/papers/items/ef5d07dc84efccfe/#paper-report) · [阅读全文翻译（学习页；未登记）](/papers/translations/2026-10-16-interference-cancellation-ckm-2409-00461/)

**推荐日期：** 2026-10-16 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

### 04. Interference-Cancellation-Based Channel Knowledge Map Construction and Its Applications to Channel Estimation

作者：Wenjun Jiang; Xiaojun Yuan; Boyu Teng; Hao Wang; Jing Qian。

年份/venue：2025；IEEE Transactions on Wireless Communications；正式发表。卷/期/页：24；7；6240-6256。 核验日期：2026-10-15。

版本：提交记录： Wenjun Jiang [ view email ] [v1] Sat, 31 Aug 2024 13:50:45 UTC (1,523 KB)

方向：TWC：含小区间干扰的 CKM 提取与协方差估计。

**问题与方法：** 许多地图构建默认已有无误差信道知识，忽略接收信号到路径参数的提取以及小区间干扰污染。 每个空间网格用多径功率、时延与角度表示局部统计；以干扰源块稀疏先验构建 Bayesian 模型，用混合消息传递联合提取/消干扰，再从 CKM 得到时频空间协方差并构造 MMSE-IRC。

**关键结果与证据：** 原文第10页式44给出路径功率加权的协方差和，第12页图4–7展示低 SINR 地图提取与估计效果；例如图6达到地图误差约−20 dB时，2 m网格需约40条表示路径、3 m网格需约60条，说明精度与复杂度共同受网格粒度影响。

**局限与适用范围：** 路径统计的网格内一致性、网格定位和干扰模型是前提；协方差推导忽略表示残差。原文中的 ICI 主要指 inter-cell interference（小区间干扰），不要与 OFDM 子载波间干扰混淆。2024预印本、2025正式发表，不是本周新文。

**迁移类型、阅读位置与差异：** 可改造工具；深化：CKM统计先验来源与污染；当前稿件的物理统计参照。 相对把现成地图直接喂给生成器，本篇向前追溯地图自身的估计误差与干扰来源；台账身份未出现不表示用户此前没有接触过该方向。

**课题接口：** 固定现有信道与导频，独立比较干净/受污染 CKM 协方差及其低秩近似；先以 CKM-LMMSE/IRC 验证，再决定是否让 flow 条件输入带入置信度，不同时修改 solver。

**推荐理由：** 能够把地图失配落到可计算的协方差和干扰结构，而非抽象地添加噪声。

**一手来源：** [原文/出版社](https://ieeexplore.ieee.org/document/10938781/)；[官方PDF或作者版](https://arxiv.org/pdf/2409.00461)；[DOI](https://doi.org/10.1109/twc.2025.3552519)；[arXiv](https://arxiv.org/abs/2409.00461)。

**代码/数据：** 未发现公开代码。原文与 arXiv 没有对应作者仓库，精确标题检索未找到公开实现；不把其他 CKM 仓库当本文复现。

**原文核查范围：** 13页作者版；重点第3–5页模型、第6–10页推断/协方差、第12–13页结果。

本篇全文翻译（只指向本篇真实进度，未完成稿不冒充全文）。

**本地原文与翻译：** PDF（本地资料：2409.00461.pdf），13页；已入队，job_id=d78ddd05b6962950a6b60391，status=pending。请求模型gpt-6-luna/xhigh；原翻译worker读取返回“No Codex thread found”，派发未启动，不能称已翻译。预期路径：`本地资料：paper.md`。

**许可与网站：** [源许可](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)；未确认公开译稿权限，先本地处理；代码/数据许可不自动扩展到论文。 PDF一律仅官方链接，网页不上传PDF/XLSX文件。

## 原推荐表字段

**日期：** 2026-10-16

**标题：** Interference-Cancellation-Based Channel Knowledge Map Construction and Its Applications to Channel Estimation

**内容：** 许多地图构建默认已有无误差信道知识，忽略接收信号到路径参数的提取以及小区间干扰污染。 每个空间网格用多径功率、时延与角度表示局部统计；以干扰源块稀疏先验构建 Bayesian 模型，用混合消息传递联合提取/消干扰，再从 CKM 得到时频空间协方差并构造 MMSE-IRC。 结果：原文第10页式44给出路径功率加权的协方差和，第12页图4–7展示低 SINR 地图提取与估计效果；例如图6达到地图误差约−20 dB时，2 m网格需约40条表示路径、3 m网格需约60条，说明精度与复杂度共同受网格粒度影响。 局限：路径统计的网格内一致性、网格定位和干扰模型是前提；协方差推导忽略表示残差。原文中的 ICI 主要指 inter-cell interference（小区间干扰），不要与 OFDM 子载波间干扰混淆。2024预印本、2025正式发表，不是本周新文。

**契合方向：** TWC：含小区间干扰的 CKM 提取与协方差估计

**推荐理由：** 能够把地图失配落到可计算的协方差和干扰结构，而非抽象地添加噪声。

**顶刊顶会/机构依据：** IEEE Transactions on Wireless Communications；正式发表

**发表年份：** 2025

**论文下载链接：** https://arxiv.org/pdf/2409.00461

**检索来源：** https://ieeexplore.ieee.org/document/10938781/

**筛选备注：** 可改造工具；深化：CKM统计先验来源与污染；当前稿件的物理统计参照。 相对把现成地图直接喂给生成器，本篇向前追溯地图自身的估计误差与干扰来源；台账身份未出现不表示用户此前没有接触过该方向。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码

**反馈匹配：** 固定现有信道与导频，独立比较干净/受污染 CKM 协方差及其低秩近似；先以 CKM-LMMSE/IRC 验证，再决定是否让 flow 条件输入带入置信度，不同时修改 solver。

**反馈权重说明：** 能够把地图失配落到可计算的协方差和干扰结构，而非抽象地添加噪声。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2409.00461)

[来源 2](https://ieeexplore.ieee.org/document/10938781/)

[来源 3](https://doi.org/10.1109/twc.2025.3552519)

[来源 4](https://arxiv.org/abs/2409.00461)

来源 5：见页首翻译状态（只指向本篇真实进度)

[来源 6](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
