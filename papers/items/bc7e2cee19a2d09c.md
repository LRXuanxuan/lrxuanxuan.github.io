---
layout: page
title: "PTNO: Training Neural Operators with Noisy Monte Carlo Estimates for Particle Transport Problems"
permalink: /papers/items/bc7e2cee19a2d09c/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=bc7e2cee19a2d09c)

[本篇日报说明](/papers/reports/2026-10-08/#paper-bc7e2cee19a2d09c)

**推荐日期：** 2026-10-08 · **发表状态：** 在投

## 本篇推荐与证据

### 19. PTNO: Training Neural Operators with Noisy Monte Carlo Estimates for Particle Transport Problems

**作者：** Cao, Yubo; Deng, Xi; Xia, Mengqi; Gopakumar, Vignesh; Gray, Ander; Anandkumar, Anima。**年份/venue：** 2026 / arXiv预印本。**浏览优先级：** A。

**发表状态：** 在投（作者自述，当前进展未确认）。首个公开版本日期：2026/09/30。作者主页称under review at NeurIPS 2026，网页未标披露日期；本次2026-10-08读取。不能写成NeurIPS已录用。 核验日期2026-10-08。[来源1](https://arxiv.org/abs/2609.40090)；[来源2](https://www.yubo-cao.com/)

**问题：** 高精度Monte Carlo标签昂贵；固定仿真预算应增加场景数，还是增加每场景粒子数？

**方法：** PTNO以有噪声的低预算MC标签训练神经算子，利用条件无偏性分析平方损失；避免对噪声标签取log引起Jensen偏差，以softplus正值输出和停止梯度的预测归一化相对损失处理高动态范围。

**关键结果：** 覆盖辐射输运和中子输运；预算扫描支持一定范围内“更多低精度场景”优于更少高精度标签。关键核验：远场辐射和EU-DEMO已用固定训练终点；3D fluence与球形托卡马克仍是按评测配置选检查点的历史结果。

**局限与解释边界：** 后一两组结果在论文中明确列为provisional，不作为独立测试集泛化证据；部分预算扫描每N仅1个seed。条件无偏L2论证不直接证明所有相对损失，参数族内仿真也未证明实测或新几何泛化。

**迁移类型：** 可改造工具（拓展阅读）。**与既有阅读的差异/位置：** 深化/缺口：对RadioDiff及仿真信道数据阅读补充标签预算与log变换偏差；收益来源是监督质量—覆盖度分配，不是再换生成网络。

**推荐理由与课题接口：** 适合设计射线/随机散射仿真的等预算实验，但必须先验证标签确实无偏并隔离所有测试场景；当前论文的检查点问题也可作为自身实验审计反例。

**原文：** [arXiv:2609.40090](https://arxiv.org/abs/2609.40090)；[官方页面](https://arxiv.org/abs/2609.40090)；[公开PDF](https://arxiv.org/pdf/2609.40090)。全文已解析41页，核查锚点：PDF8–10页Table1/2和Fig.3，附录F/J/L及噪声损失分析。

**版本记录：** Submission history From: Yubo Cao [ view email ] [v1] Wed, 30 Sep 2026 16:31:40 UTC (1,608 KB) [v2] Thu, 1 Oct 2026 19:32:26 UTC (1,608 KB)

**代码状态：** 未发现公开代码。论文中的openmc-plasma-source等为模拟器/数据工具，不等于PTNO完整实现；作者主页及精确标题/ID检索未发现本论文公开训练库。

## 原推荐表字段

**日期：** 2026-10-08

**标题：** PTNO: Training Neural Operators with Noisy Monte Carlo Estimates for Particle Transport Problems

**内容：** 作者：Cao, Yubo; Deng, Xi; Xia, Mengqi; Gopakumar, Vignesh; Gray, Ander; Anandkumar, Anima
问题：高精度Monte Carlo标签昂贵；固定仿真预算应增加场景数，还是增加每场景粒子数？
方法：PTNO以有噪声的低预算MC标签训练神经算子，利用条件无偏性分析平方损失；避免对噪声标签取log引起Jensen偏差，以softplus正值输出和停止梯度的预测归一化相对损失处理高动态范围。
结果：覆盖辐射输运和中子输运；预算扫描支持一定范围内“更多低精度场景”优于更少高精度标签。关键核验：远场辐射和EU-DEMO已用固定训练终点；3D fluence与球形托卡马克仍是按评测配置选检查点的历史结果。
局限：后一两组结果在论文中明确列为provisional，不作为独立测试集泛化证据；部分预算扫描每N仅1个seed。条件无偏L2论证不直接证明所有相对损失，参数族内仿真也未证明实测或新几何泛化。

**契合方向：** 科学机器学习与物理算子；可改造工具（拓展阅读）

**推荐理由：** 适合设计射线/随机散射仿真的等预算实验，但必须先验证标签确实无偏并隔离所有测试场景；当前论文的检查点问题也可作为自身实验审计反例。

**顶刊顶会/机构依据：** arXiv预印本；在投（作者自述，当前进展未确认）；作者主页称under review at NeurIPS 2026，网页未标披露日期；本次2026-10-08读取。不能写成NeurIPS已录用。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.40090

**检索来源：** https://arxiv.org/abs/2609.40090
https://www.yubo-cao.com/

**筛选备注：** 2026-10-08身份去重通过；全文已解析41页，核查锚点：PDF8–10页Table1/2和Fig.3，附录F/J/L及噪声损失分析。；作者主页称under review at NeurIPS 2026，网页未标披露日期；本次2026-10-08读取。不能写成NeurIPS已录用。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；论文中的openmc-plasma-source等为模拟器/数据工具，不等于PTNO完整实现；作者主页及精确标题/ID检索未发现本论文公开训练库。

**反馈匹配：** 深化/缺口：对RadioDiff及仿真信道数据阅读补充标签预算与log变换偏差；收益来源是监督质量—覆盖度分配，不是再换生成网络。

**反馈权重说明：** 优先级A；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.40090)

[来源 2](https://arxiv.org/abs/2609.40090)

[来源 3](https://www.yubo-cao.com/)
{% endraw %}
