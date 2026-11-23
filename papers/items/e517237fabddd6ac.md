---
layout: page
title: "MIMO Channel Extrapolation to Unobserved Radiation Modes via Learned Path Refinement"
permalink: /papers/items/e517237fabddd6ac/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=e517237fabddd6ac)

[本篇日报说明](/papers/items/e517237fabddd6ac/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-24-4f124cfbc67d749fecfc7265/)

**推荐日期：** 2026-11-24 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. MIMO Channel Extrapolation to Unobserved Radiation Modes via Learned Path Refinement

**作者/年份/venue**：Shaoyang Sun、Chongwen Huang；2026；arXiv。

**发表状态**：预印本/状态未确认。官方arXiv条目与公开全文未给出可确认的录用/投稿声明。 [证据](https://arxiv.org/abs/2611.23904)

**方向**：缺失模式外推；可观测性与先验。

**问题**：测量所有天线仍可能完全缺失部分辐射模式，如何利用公共路径外推。

**方法（论文事实）**：阻尼LS提议与噪声/阵列敏感性条件学习修正，联合更新复增益与空间频率，转移至ridge变量投影初始化。

**关键结果（论文事实）**：1152独立仿真信道、0 dB参考SNR：未观测模式NMSE从VarPro 0.02146及自适应ridge 0.01970降至0.01902；对ridge收益3.49%。

**局限与审计**：匹配仿真且依赖图样标定和公共路径；0 dB参考对应约4.8 dB中位实收SNR；区间条件于拟合权重，外推区间为事后描述。

**迁移类型**：可改造工具。

**研究接口（迁移推断）**：作为地图/学习先验是否改善不可观测目标的受控实验模板。

**与既有阅读差异**：区别于泛化静态PnP：提供同观测强ridge对照、模式分区与残差反例。

**推荐理由**：测量残差增大时外推误差也可能下降，能校正数据一致性的过度解释。

**待验证假设**：在固定路径表示下，学习修正相对等预算自适应ridge是否仍有独立增益需验证。

**全文定位**：PDF pp.2–5 Table I–II及Figs.2–3；补充材料。

**身份与原文**：arXiv:2611.23904。[官方条目](https://arxiv.org/abs/2611.23904) · [PDF](https://arxiv.org/pdf/2611.23904)。Submission history From: Shaoyang Sun [ view email ] [v1] Wed, 18 Nov 2026 05:57:12 UTC (1,510 KB)

**代码状态**：未发现公开代码。已查官方条目、全文与精确题名/编号搜索，未定位本篇作者实现；不表示代码必然不存在。 [精确编号检索](https://github.com/search?q=%222611.23904%22&type=repositories)

**全文/翻译**：公开全文24页已缓存，gpt-6-luna/xhigh已入队，worker不可达未启动。[本篇全文翻译状态](https://lrxuanxuan.github.io/papers/items/e517237fabddd6ac/#paper-translation)。原文许可：https://arxiv.org/licenses/nonexclusive-distrib/1.0/。PDF仅本地保存与官方链接，不上传。

## 原推荐表字段

**日期：** 2026-11-24

**标题：** MIMO Channel Extrapolation to Unobserved Radiation Modes via Learned Path Refinement

**内容：** 作者：Shaoyang Sun、Chongwen Huang。问题：测量所有天线仍可能完全缺失部分辐射模式，如何利用公共路径外推。方法：阻尼LS提议与噪声/阵列敏感性条件学习修正，联合更新复增益与空间频率，转移至ridge变量投影初始化。关键结果：1152独立仿真信道、0 dB参考SNR：未观测模式NMSE从VarPro 0.02146及自适应ridge 0.01970降至0.01902；对ridge收益3.49%。局限：匹配仿真且依赖图样标定和公共路径；0 dB参考对应约4.8 dB中位实收SNR；区间条件于拟合权重，外推区间为事后描述。

**契合方向：** 缺失模式外推；可观测性与先验

**推荐理由：** 测量残差增大时外推误差也可能下降，能校正数据一致性的过度解释

**顶刊顶会/机构依据：** arXiv；预印本/状态未确认；官方arXiv条目与公开全文未给出可确认的录用/投稿声明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.23904

**检索来源：** https://arxiv.org/abs/2611.23904
https://doi.org/10.48550/arXiv.2611.23904

**筛选备注：** 可改造工具；作为地图/学习先验是否改善不可观测目标的受控实验模板；全文定位：PDF pp.2–5 Table I–II及Figs.2–3；补充材料

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；已查官方条目、全文与精确题名/编号搜索，未定位本篇作者实现；不表示代码必然不存在。 证据：https://github.com/search?q=%222611.23904%22&type=repositories

**反馈匹配：** 区别于泛化静态PnP：提供同观测强ridge对照、模式分区与残差反例

**反馈权重说明：** 待验证假设：在固定路径表示下，学习修正相对等预算自适应ridge是否仍有独立增益需验证

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.23904)

[来源 2](https://arxiv.org/abs/2611.23904)

[来源 3](https://doi.org/10.48550/arXiv.2611.23904)

[来源 4](https://github.com/search?q=%222611.23904%22&type=repositories)

[来源 5](https://lrxuanxuan.github.io/papers/items/e517237fabddd6ac/#paper-translation)

[来源 6](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
