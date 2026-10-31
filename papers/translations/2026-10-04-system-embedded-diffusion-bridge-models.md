---
layout: page
title: "系统嵌入扩散桥模型｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-04-system-embedded-diffusion-bridge-models/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/5856c0521ef7a0c4/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 系统嵌入扩散桥模型

> **许可与使用范围说明：** 原文为 NeurIPS 2025 会议论文集版本，**再传播许可待核验**；本页仅为**学习用途**的中文译稿，**不计入本站「可公开全文」统计**，也不作为正式译文对外发布。如后续确认许可，再按站点流程更新。

**原题：** System-Embedded Diffusion Bridge Models  
**作者：** Bartlomiej Sobieski^{*,†,1}、Matthew Tivnan^{†,2,3}、Yuang Wang^{2,3}、Siyeop Yoon^{2,3}、Pengfei Jin^{2,3}、Dufan Wu^{2,3}、Quanzheng Li^{2,3}、Przemyslaw Biecek^{1,4}（¹ 华沙理工大学；² 麻省总医院；³ 哈佛医学院；⁴ 华沙理工大学数学与信息科学学院；\* 与 † 表示共同贡献/共同一作，原文标注）  
**版本：** NeurIPS 2025（第 39 届神经信息处理系统大会）会议论文集版本，本地 PDF 38 页（含附录）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1—6 节、致谢、参考文献（英文原条目）、附录 A—H、表 1—表 11、图 1—图 9；逐句逐式终校未做。

## 摘要

求解逆问题——从**不完整或含噪的测量**中恢复信号——是科学与工程的基础。基于分数的生成模型（SGM）近来已成为该任务的强框架。目前形成两种主要范式：**无监督**方法，把预训练生成模型适配到逆问题；以及**监督桥方法**，训练以成对干净与损坏数据为条件的随机过程。前者通常假设已知测量模型，而后者在很大程度上**忽视了这一结构信息**。本文提出**系统嵌入扩散桥模型（SDB）**——一类新的监督桥方法，把已知的**线性测量系统显式嵌入**一个**矩阵值 SDE** 的系数中。这种原理性集成在多种线性逆问题上带来一致改进，并在训练与部署之间的**系统失配**下展现出稳健泛化，为未来系统感知、结构驱动的随机过程提供了有前景的方向。

## 1 引言

从损坏或不完整测量中恢复数据是科学与工程的基础任务 [Abbott et al., 2016, Akiyama et al., 2019]，通常称为逆问题。其**线性**形式在信号处理与医学成像等实际领域起核心作用 [Bertero et al., 1985, Candes et al., 2006]。深度学习显著推进了该领域，带来诸多科学突破 [Ongie et al., 2020]。自 Song et al. [2021b] 起，学界越来越多采用基于分数的生成模型（SGM，亦称扩散模型）处理逆问题。由此出现两个关键方向：其一把为图像合成预训练的模型适配到条件生成；其二常称为**桥方法**，在随机微分方程（SDE）基础上训练问题专用模型，假设可访问成对的干净数据与对应测量样本。

预训练模型通常假设已知线性测量系统，而桥方法主要发展通用方案、**未利用**这类结构信息。然而在许多真实场景（如 CT 或 MRI 重建）中，线性测量过程**先验已知**，数据集也常包含干净样本与相应损坏观测的配对。为填补这一空白，本文提出 **SDB**：把**系统响应与噪声协方差直接纳入矩阵值 SDE 的系数**。通过嵌入测量系统知识，SDB 在复杂度各异的多种线性系统上取得可观的性能提升，本文以三种不同实现加以展示；此外，本文对 SDB 在训练与部署间系统失配下的泛化做了广泛研究，表明 SDB 一致优于基线、并对参数漂移保持稳健，适合真实场景。


此外，本文倡导生成建模中**更具表达力的扩散过程表述**，为系统感知、结构驱动的随机过程研究开辟新途径。

## 2 相关工作

本文对构建任务专用扩散桥（监督）提出新视角，同时从基于扩散的即插即用方法（无监督）中汲取灵感。两个方向从不同视角处理图像复原与逆问题；更详细的综述见附录。

**逆问题的扩散模型。** 如 Song et al. [2021b] 所示，预训练无条件扩散模型经 Bayes 定理的简单应用即可适配到条件合成；所得似然项被广泛用于引导生成 [Dhariwal and Nichol, 2021]，尤其是图像复原 [Daras et al., 2024]。这些方法从通用方案 [Song et al., 2021b, Chung et al., 2022] 到对生成过程加入额外假设与约束的方法，如 DPS [Chung et al., 2023a]、DDNM [Wang et al., 2023]、ΠGDM [Song et al., 2023a]、DDPG [Garber and Tirer, 2024] 等 [Kawar et al., 2022, Chung et al., 2023a, Mardani et al., 2024]。

**扩散桥。** 也可扩展 SGM 框架，在给定配对数据下得到任意概率分布之间的映射 [Särkkä and Solin, 2019]。该领域的开创性工作包括 [Heng et al., 2021, Somnath et al., 2023, Peluchetti, 2022, Delbracio and Milanfar, 2023, De Bortoli et al., 2021]：Liu et al. [2023]（I2SB）提出求解 Schrödinger 桥（SB）问题的**免模拟**算法；Luo et al. [2023a]（IR-SDE）构造把含噪退化映射到干净样本的条件 SDE；Yue et al. [2024]（GOUB）用 Doob h-变换 [Doob, 1984] 推广它，Zhou et al. [2024]（DDBM）亦采用该变换。

**扩散模型。** 随扩散模型 [Sohl-Dickstein et al., 2015, Ho et al., 2020, Dhariwal and Nichol, 2021] 的引入，视觉数据生成建模进展迅速，模型通过逐步去噪生成图像。扩散模型最初表述为带高斯核的离散 Markov 链，后来在与分数匹配 [Song and Ermon, 2019] 统一于 SDE 框架 [Song et al., 2021b]，建立了连续时间表述（SGM）。

## 3 背景

令 $p(\mathbf x_t)$ 表示 $\mathbf x_t\in\mathbb R^{d}$ 在时间 $t\in[0,1]$ 上的概率分布，其中 $p(\mathbf x_0)$ 为数据分布、$p(\mathbf x_1)$ 为先验。本文强调 SGM 中常被忽视的**线性**表述。把 $p(\mathbf x_0)$ 映射到 $p(\mathbf x_1)$ 的前向 SDE 定义为

$$
\mathrm d\mathbf x_t=\mathbf F_t\mathbf x_t\,\mathrm dt+\mathbf G_t\,\mathrm d\mathbf w_t,\tag{1}
$$

其中 $\mathbf F_t\mathbf x_t$ 为带时变矩阵 $\mathbf F_t\in\mathbb R^{d\times d}$ 的线性漂移项，$\mathbf G_t$ 为矩阵值扩散系数。由 Anderson [1982]，把 $p(\mathbf x_1)$ 映射回 $p(\mathbf x_0)$ 的反向 SDE 为

$$
\mathrm d\mathbf x_t=\left[\mathbf F_t\mathbf x_t-\mathbf G_t\mathbf G_t^{\top}\nabla_{\mathbf x_t}\log p(\mathbf x_t)\right]\mathrm dt+\mathbf G_t\,\mathrm d\mathbf w_t,\tag{2}
$$

其中 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$ 为分数函数，$\mathbf w_t$ 为时间反向的 Wiener 过程。前向—反向关系保证由 (1)、(2) 定义的时间边缘分布 $p(\mathbf x_t)$ 保持一致。

标准图像合成 SGM 中 $p(\mathbf x_1)$ 通常取各向同性高斯。为从 $p(\mathbf x_0)$ 采样，先从 $p(\mathbf x_1)$ 采样、再用时间离散求解 (2)，这需要未知分数函数 $\nabla_{\mathbf x_t}\log p(\mathbf x_t)$；一般用神经网络 $\mathbf s_{\boldsymbol\theta}(\mathbf x_t,t)$ 通过分数匹配损失 [Song et al., 2021b] 近似：

$$
\mathbb E\left[\left\lVert\mathbf s_{\boldsymbol\theta}(\mathbf x_t,t)-\nabla_{\mathbf x_t}\log p(\mathbf x_t\mid\mathbf x_0)\right\rVert_2^{2}\right],\tag{3}
$$

期望对 $\mathbf x_0\sim p(\mathbf x_0)$、$t\sim\mathcal U([0,1])$、$\mathbf x_t\sim p(\mathbf x_t\mid\mathbf x_0)$ 取。

(1)、(2) 的线性表述是 Song et al. [2021b] 更一般 SGM 框架的特例（漂移与扩散系数可为 $\mathbf x_t,t$ 的任意复杂函数），但它推广了成熟的标量情形。具体地，**方差保持（VP）SDE**在各时刻保持 $\mathbf x_t$ 方差恒定；**方差爆炸（VE）SDE**则令 $p(\mathbf x_1)$ 方差随 $t\to1$ 无界增长。标量矩阵虽简单，却引出**更精细设计能否带来额外收益**的问题。

**逆问题。** 对信号样本 $\mathbf x\in\mathbb R^{d}$，定义线性测量系统

$$
\mathbf y=\mathbf A\mathbf x+\boldsymbol\Sigma^{\frac{1}{2}}\boldsymbol\epsilon,\tag{4}
$$

其中 $\mathbf y\in\mathbb R^{m}$ 为测量，$\mathbf A\in\mathbb R^{m\times d}$ 为系统响应矩阵，$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0_m,\mathbf I_{m\times m})$，$\boldsymbol\Sigma\in\mathbb R^{m\times m}$ 为噪声协方差，前向模型 $p(\mathbf y\mid\mathbf x)=\mathcal N(\mathbf A\mathbf x,\boldsymbol\Sigma)$。基于给定 $\mathbf y$ 求未知 $\mathbf x$ 即带加性高斯噪声的线性逆问题 [Tarantola, 2005]。该表述是信号处理、医学成像与遥感的核心 [Mueller and Siltanen, 2012]，尤其适用于**不可逆线性系统**（$m\ne d$ 或 $\mathbf A$ 秩亏）。

**矩阵伪逆。** 考虑 (4) 的最简**无噪**（$\boldsymbol\Sigma=\mathbf 0_{m\times m}$）且 $\mathbf A$ 可逆情形：可由 $\mathbf A^{-1}$ 完全恢复 $\mathbf x=\mathbf A^{-1}\mathbf y$。但这仅当 $m=d$ 且 $\mathbf A$ 满秩时可行，极大限制了逆问题范围；实践中 $\mathbf A$ 通常不可逆，且测量过程的不完美会自然引入噪声。对不可逆 $\mathbf A$，可用其 Moore–Penrose 逆（伪逆）$\mathbf A^{+}$，它把方阵逆推广到任意形状与秩。考虑 $\mathbf A$ 的奇异值分解（SVD）$\mathbf A=\mathbf U\mathbf D\mathbf V^{*}$（$\mathbf U,\mathbf V$ 酉、$\mathbf D$ 非负实对角），伪逆为 $\mathbf A^{+}=\mathbf V\mathbf D^{+}\mathbf U^{*}$，其中 $\mathbf D^{+}$ 由把 $\mathbf D$ 的正奇异值取倒数、其余置零得到。

**值域—零空间分解。** 伪逆的一个特别有用性质是其在著名**值域—零空间分解** [Strang, 2022] 中的作用：任意信号可分解为

$$
\mathbf x=\underbrace{\mathbf A^{+}\mathbf A\mathbf x}_{\text{值域空间}}+\underbrace{(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x}_{\text{零空间}},\tag{5}
$$

第一项位于 $\mathbf A$ 的值域（像），第二项位于其零空间（核），即被 $\mathbf A$ 湮灭。该分解在逆问题中尤其相关：对 $\mathbf x$ 施加 $\mathbf A$ 会消去零空间分量、保留值域分量。因此求解逆问题可视为**在值域空间去噪、在零空间合成缺失信息**。

**伪逆重建。** 伪逆也可用于计算 $\mathbf x$ 的**伪逆重建（PR）** $\widehat{\mathbf x}=\mathbf A^{+}\mathbf y$。关键在于：无论 $\mathbf y$ 形状如何，该重建总位于 $\mathbb R^{d}$。这解决了先前桥方法的一个常见局限，即它们默认在**固定维空间**中操作；当 $m\ne d$ 时，这类方法需额外努力才能保持良定义。对更难的逆问题（如医学成像），PR 提供了原理性的解决机制。

从理论角度看，假设可访问 $\mathbf A^{+}$ 也简化了 $\mathbf x$ 与 $\mathbf y$ 的关系 [Strang, 2022]：当 $m<d$ 时，PR 是 $\min_{\mathbf x^{*}}\lVert\mathbf A\mathbf x^{*}-\mathbf y\rVert_2$ 在 $\mathbb R^{d}$ 上的唯一最小化者；当 $m>d$ 时，它给出满足 $\mathbf A\mathbf x^{*}=\mathbf y$ 的解中**最小 $\ell_2$ 范数**者，即 $\min_{\mathbf x^{*}}\lVert\mathbf x^{*}\rVert_2$ s.t. $\mathbf A\mathbf x^{*}=\mathbf y$。这些最优性性质进一步支持使用 PR。

**问题专用扩散桥。** 许多无监督方法假设可访问特定含噪线性系统（(4)），在额外假设下提供提升性能的定制解 [Song et al., 2023a, Wang et al., 2023, Chung et al., 2023a, Garber and Tirer, 2024]。相反，最先进的扩散桥 [Liu et al., 2023, Luo et al., 2023a, Yue et al., 2024, Zhou et al., 2024] 在训练时**不对底层系统做任何假设**，专注于任意分布之间的通用映射。当系统（即使近似地）已知时，这可能**次优**：例如图像修补中，这些方法不区分已知值域（未遮挡）与缺失零空间（被遮挡），在值域空间中引入本应无噪的冗余噪声。更复杂场景下，这类冗余会降低效率，而忽略系统信息可能妨碍泛化。因此，为特定系统开发**专用监督扩散桥**仍是重要而开放的问题。

## 4 方法

本节构造一个直接纳入**所假设测量系统信息**的桥扩散过程，即满足：i) 把 PR 映射到相应信号样本；ii) 直接在**零空间**合成缺失信息；iii) 可选地对值域空间部分去噪。本文先从一般线性扩散过程的中间步骤与含噪线性测量系统映射干净样本的方式之间的具体联系入手，进而提出一种矩阵值 SDE 的特定设计，满足上述性质。

**连接系统与 SDE。** 由 (4) 可知 $\mathbf y\mid\mathbf x\sim\mathcal N(\mathbf A\mathbf x,\boldsymbol\Sigma)$：给定信号 $\mathbf x$，含噪线性系统施加线性变换 $\mathbf A$ 并加入（可能相关的）高斯噪声以采样测量。另一方面，给定干净样本 $\mathbf x_0$，(1) 通过**级联**这样的含噪线性系统把其变换为 $\mathbf x_t$，而该级联本身也是一个含噪线性系统：$\mathbf x_t\mid\mathbf x_0\sim\mathcal N(\mathbf H_t\mathbf x_0,\boldsymbol\Sigma_t)$，其中 $\mathbf H_t,\boldsymbol\Sigma_t$ 随时间变化。因此，可通过**对 $\mathbf x$ 连续施加一系列含噪线性系统**（而非仅一次）等价地得到 $\mathbf y\mid\mathbf x$（或其某个线性变换）。在极限情形下，这意味着存在某 SDE，其系数编码了测量系统的信息。

上述考虑提示可把测量系统直接嵌入 $\mathbf H_t$ 与 $\boldsymbol\Sigma_t$。虽然这些与相应随机过程的漂移、扩散系数之间的关系并不显然，但 Tivnan et al. [2025] 的近期理论结果在温和假设下提供了二者的方便映射；为清晰起见重述如下。

**定理 1** [Tivnan et al., 2025]。假设 $\mathbf x_t\mid\mathbf x_0$ 按如下线性前向过程演化（设 $\mathbf x_t\mid\mathbf x_0\sim\mathcal N(\mathbf H_t\mathbf x_0,\boldsymbol\Sigma_t)$），则其均值与协方差满足

$$
\mathbf H_t=\exp\left(\boldsymbol\Omega_t\right)\ \text{（近似）},\qquad
\boldsymbol\Sigma_t=\mathbf H_t\left(\int_0^{t}\mathbf H_s^{-1}\mathbf G_s\mathbf G_s^{\top}\mathbf H_s^{-1\top}\,\mathrm ds\right)\mathbf H_t^{\top},\tag{6}
$$

其中 $\boldsymbol\Omega_t$ 为 Magnus 展开；当对所有 $s,s'\in[0,t]$ 有 $[\mathbf F_s,\mathbf F_{s'}]=\mathbf 0$（即 $\mathbf F_s$ 与 $\mathbf F_{s'}$ 可交换）时近似为等式。反之，给定 $\mathbf H_t$ 与 $\boldsymbol\Sigma_t$，可经下式得到漂移与扩散系数：

$$
\mathbf F_t=\frac{\mathrm d\mathbf H_t}{\mathrm dt}\mathbf H_t^{-1},\qquad
\mathbf G_t\mathbf G_t^{\top}=\frac{\mathrm d\boldsymbol\Sigma_t}{\mathrm dt}-\mathbf F_t\boldsymbol\Sigma_t-\boldsymbol\Sigma_t\mathbf F_t^{\top}.\tag{7}
$$

因此，定理 1 可由 $\mathbf H_t$、$\boldsymbol\Sigma_t$ 得到支配 $\mathbf x_t\mid\mathbf x_0$ 演化的线性扩散过程，进而使连续时间模型的训练与采样成为可能。

**嵌入测量系统。** 有了必要工具，本文提出通过下式把测量系统嵌入线性扩散过程：

$$
\mathbf H_t=\mathbf A^{+}\mathbf A+\alpha_t(\mathbf I-\mathbf A^{+}\mathbf A),\tag{8a}
$$
$$
\boldsymbol\Sigma_t=\gamma_t\mathbf A^{+}\boldsymbol\Sigma\mathbf A^{+\top}+\beta_t(\mathbf I-\mathbf A^{+}\mathbf A),\tag{8b}
$$

其中 $\alpha_t,\beta_t,\gamma_t$ 分别为**零空间漂移**、**零空间扩散**与**值域空间扩散**系数。称由 (8a)、(8b) 得到的过程为**系统嵌入扩散桥模型（SDB）**。

为更好理解该设计的动机，值得分别考察所得 $\mathbf x_t$ 的值域与零空间分量：

$$
\mathbf A^{+}\mathbf A\mathbf x_t=\mathbf A^{+}\left(\mathbf A\mathbf x_0+\gamma_t\boldsymbol\Sigma^{\frac{1}{2}}\boldsymbol\epsilon\right)=\mathbf A^{+}\mathbf A\mathbf x_0+\sqrt{\gamma_t}\mathbf A^{+}\boldsymbol\Sigma^{\frac{1}{2}}\boldsymbol\epsilon,\tag{9a}
$$
$$
(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_t=\alpha_t(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_0+\sqrt{\beta_t}(\mathbf I-\mathbf A^{+}\mathbf A)\boldsymbol\epsilon',\tag{9b}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0_m,\boldsymbol\Sigma_{m\times m})$、$\boldsymbol\epsilon'\sim\mathcal N(\mathbf 0_d,\boldsymbol\Sigma_{d\times d})$。值域空间部分包含原始信号 $\mathbf A^{+}\mathbf A\mathbf x_0$ 与经过投影的噪声；当 $\boldsymbol\Sigma=\mathbf 0$ 时每个时刻 $t$ 的真信号被完全保留。零空间部分是真实信号零空间分量 $\alpha_t(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_0$ 与零空间投影高斯噪声 $\sqrt{\beta_t}(\mathbf I-\mathbf A^{+}\mathbf A)\boldsymbol\epsilon'$ 的混合。值得注意的是，SDB 连接了两个分别在值域与零空间中同时演化的随机过程，各由独立噪声变量 $\boldsymbol\epsilon$ 与 $\boldsymbol\epsilon'$ 刻画。此外，适当选择 $\alpha_t,\beta_t,\gamma_t$ 显然可得到 $t=1$ 处 PR 到 $t=0$ 处相应干净样本之间的映射。

**SDE 视角。** 把定理 1 应用于 (8) 的系数，得到 SDB 的漂移与扩散系数：

$$
\mathbf F_t=\frac{\mathrm d}{\mathrm dt}\log\alpha_t\,(\mathbf I-\mathbf A^{+}\mathbf A),\tag{10a}
$$
$$
\mathbf G_t\mathbf G_t^{\top}=\frac{\mathrm d\gamma_t}{\mathrm dt}\mathbf A^{+}\boldsymbol\Sigma\mathbf A^{+\top}+\left(\frac{\mathrm d\beta_t}{\mathrm dt}-2\beta_t\frac{\mathrm d}{\mathrm dt}\log\alpha_t\right)(\mathbf I-\mathbf A^{+}\mathbf A).\tag{10b}
$$

有了该表述，本文提出标量函数 $\alpha_t$ 与 $\beta_t$ 的一个特定设定，它推广 Liu et al. [2023] 的结果，并把 SDB 与**最优传输（OT）**计划 [Mikami, 2004] 直接联系起来。

**定理 2。** 对由 (1) 定义、$\mathbf F_t$ 与 $\mathbf G_t$ 分别由 (10a)、(10b) 给出的线性 SDE，令 $\alpha_t=\bar\sigma_t^{2}/(\bar\sigma_t^{2}+\sigma_t^{2})$、$\beta_t=\sigma_t^{2}\bar\sigma_t^{2}/(\bar\sigma_t^{2}+\sigma_t^{2})$，其中 $\sigma_t^{2}=\int_0^{t}g^{2}(\tau)\,\mathrm d\tau$、$\bar\sigma_t^{2}=\int_t^{1}g^{2}(\tau)\,\mathrm d\tau$，$g(t)$ 为某非负函数。假设 $g(t)$ 对所有 $t$ 一致趋于 $0$，则该 SDE 的零空间部分化为一个 **OT-ODE**：

$$
\mathrm d(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_t=\mathbf v_t(\mathbf x_t\mid\mathbf x_0)\,\mathrm dt,\tag{11}
$$

其中 $\mathbf v_t(\mathbf x_t\mid\mathbf x_0)$ 为相应后验均值所定义的速度场（证明见附录 A.2）。为对齐值域与零空间的动力学，本文还取 $\gamma_t=\frac{\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}$。实践中**不**令 $g(t)=0$，而是保持足够小的值；由于与 SB 问题的联系，称该变体为 **SDB (SB)**。

**新过程。** 为展示框架的通用性，本文引入两个额外变体，重新解释 Song et al. [2021b] 的 VP 与 VE 扩散过程：

- **SDB (VP)：** $\alpha_t=1-t$，$\beta_t=\sqrt{1-\alpha_t}$，$\gamma_t=\beta_t$；
- **SDB (VE)：** $\alpha_t=1$，$\beta_t=\sigma_{\max}\sqrt{t}$，$\gamma_t=\sqrt{t}$，其中 $\sigma_{\max}\gg1$。

两种情形下原始 VP 或 VE 过程都施加于**零空间**，而值域空间系数 $\gamma_t$ 与 $\beta_t$ 相关联以简化动力学。与 DDBM 等方法把方差调度围绕 $t=0.5$ 对称化不同，这些变体**显式控制**原信号在零空间中被擦除的方式：SDB (VP) 在干净输入与高斯噪声间做凸插值，SDB (VE) 当 $t\to1$ 时收敛到各向同性高斯 $\mathcal N(\mathbf 0,\sigma_{\max}^{2}\mathbf I)$。二者因而更接近 IR-SDE 等保持端点非奇异边缘分布的方法。为简洁起见，SDB (VP) 与 SDB (VE) 过程采用**线性**调度，更精细的设计留待未来工作。

**原理性后验采样。** 在无限数据与无限模型容量的渐近极限下，自然会问：SDB 是否是底层逆问题的**精确概率模型**——即是否产生 $p(\mathbf x\mid\mathbf y)$ 的原理性后验样本？下述结果在对前向过程系数的温和条件下给出肯定回答（证明见附录）。

**定理 3。** 设前向测量模型为 $p(\mathbf y\mid\mathbf x)=\mathcal N(\mathbf A\mathbf x,\boldsymbol\Sigma)$。则在前向过程动力学由 (1)、(7)、(8) 定义、时变标量系数 $\alpha_t,\beta_t,\gamma_t$ 满足

$$
\lim_{t\to1}\gamma_t=1,\qquad \lim_{t\to1}\frac{\alpha_t^{2}}{\beta_t}=0
$$

的条件下，相应反向时间 SDE 生成**渐近精确**的 Bayes 后验分布 $p(\mathbf x\mid\mathbf y)$ 样本。

**表 1：现有 SOTA 扩散桥与 SDB 的对比。** 后续各行给出前向过程的漂移（$\mathbf F_t$）与扩散（$\mathbf G_t$）系数，$\boldsymbol\mu_t,\boldsymbol\Sigma_t$ 为其在时刻 $t$ 的均值与协方差；各列沿用各原文记号。

| 对比项 | I2SB | IR-SDE | GOUB | DDBM | SDB（本文） |
|---|---|---|---|---|---|
| 前向过程形式 | 线性标量 SDE | 线性标量 SDE | 线性标量 SDE（Doob h-变换） | 线性标量 SDE（Doob h-变换） | **矩阵值线性 SDE** |
| 是否嵌入测量系统 $\mathbf A$ | 否 | 否 | 否 | 否 | **是**（经 $\mathbf A^{+}\mathbf A$ 与 $\mathbf I-\mathbf A^{+}\mathbf A$ 分解） |
| 漂移 $\mathbf F_t$ | $\beta_t\mathbf I$ 型标量 | 标量系数 | 标量系数（含 $\theta_t$） | 标量系数 | $\frac{\mathrm d}{\mathrm dt}\log\alpha_t(\mathbf I-\mathbf A^{+}\mathbf A)$ |
| 扩散 $\mathbf G_t\mathbf G_t^{\top}$ | $\beta_t\mathbf I$ | $\sigma^{2}(t)\mathbf I$ | $g^{2}(t)\mathbf I$ | $g^{2}(t)\mathbf I$ | $\frac{\mathrm d\gamma_t}{\mathrm dt}\mathbf A^{+}\boldsymbol\Sigma\mathbf A^{+\top}+\left(\frac{\mathrm d\beta_t}{\mathrm dt}-2\beta_t\frac{\mathrm d}{\mathrm dt}\log\alpha_t\right)(\mathbf I-\mathbf A^{+}\mathbf A)$ |
| Markovian | ✗ | ✗ | ✗ | ✗ | ✓ |

**算法 1　SDB 训练**

```text
Require: p(x0), p(t), A, A+, Σ^{1/2}, α_t, β_t, γ_t, D_θ
1: for 每轮迭代 do
2:     x ~ p(x0)                                  ▷ 采样干净数据 x
3:     t ~ p(t)                                   ▷ 采样扩散时间步 t
4:     ε ~ N(0, I) ∈ R^m                           ▷ 采样值域空间高斯噪声 ε
5:     ε' ~ N(0, I) ∈ R^d                          ▷ 采样零空间高斯噪声 ε'
6:     x_t ← [A+A + α_t(I − A+A)]x + γ_t^{1/2} A+Σ^{1/2}ε + β_t^{1/2}(I − A+A)ε'   ▷ 前向步
7:     L_θ ← ||D_θ(x_t, t) − x||_1                 ▷ 计算 x 的重建损失
8:     θ ← optimizer(∇_θ L_θ)                      ▷ 更新网络参数 θ
9: end for
10: return θ
```

**算法 2　SDB 采样（Euler–Maruyama）**

```text
Require: N, A, A+, Σ^{1/2}, α_t, β_t, γ_t, H_t, F_t, D_θ, y
1: t ← 1                                          ▷ 初始化时间
2: Δt ← 1/N                                       ▷ 设置时间步
3: ε' ~ N(0, I) ∈ R^d                             ▷ 采样零空间噪声
4: x̂ ← A+y                                        ▷ 伪逆重建
5: x_t ← x̂ + β_t^{1/2}(I − A+A)ε'                 ▷ 初始化
6: for i ∈ {1, …, N} do
7:     ε ~ N(0, I) ∈ R^m                           ▷ 采样值域空间噪声
8:     ε' ~ N(0, I) ∈ R^d                          ▷ 采样零空间噪声
       x_{t−Δt} ← x_t + Δt[(f_t I − 2F_t)(H_t D_θ(x_t, t) − x_t) − F_t x_t] +
9:     Δt^{1/2}[(dγ_t/dt)^{1/2} A+Σ^{1/2}ε + (dβ_t/dt − 2β_t d/dt log α_t)^{1/2}(I − A+A)ε']   ▷ 更新
10:    t ← t − Δt                                   ▷ 递减时间
11: end for
12: return x_0                                      ▷ 最终样本
```

## 5 实验

**基线。** 本文把 SDB 与**监督**桥方法及**无监督**即插即用扩散基线比较。前者包括 I2SB [Liu et al., 2023]、IR-SDE [Luo et al., 2023a]、GOUB [Yue et al., 2024] 与 DDBM [Zhou et al., 2024]；后者选用 DPS [Chung et al., 2023a]、ΠGDM [Song et al., 2023a] 与 DDNM [Wang et al., 2023]，它们都依赖含噪线性测量模型假设。与这些使用**标量** SDE 的方法不同，SDB 引入更一般的**矩阵值**表述，可对值域与零空间分量做结构化控制。表 1 汇总了与基线桥方法的概念差异，算法 1、2 给出 SDB 的训练与采样流程。遵循标准评估实践 [Luo et al., 2023a, Yue et al., 2024]，报告感知分数（FID [Heusel et al., 2017]、LPIPS [Zhang et al., 2018]）与重建指标（PSNR、SSIM 等）。

**实验设计。** 为隔离 SDB 作为**扩散过程**的贡献，本文在所有方法间统一关键实现细节：(i) 监督与无监督方法都用 Luo et al. [2023a] 的训练超参数与架构**从头训练**分数网络，监督方法 256 轮、无监督方法 512 轮；(ii) 每个监督方法学习信号样本与其 PR 之间的映射，确保 SDB 不会因更有利的参数化而获益，尤其在 $m\ne d$ 时；(iii) 评估时监督方法用 100 个离散步、无监督方法用 200 个离散步，配合标准 Euler–Maruyama 求解器与其最优噪声调度（如 DDBM 用 VP）。为保证一致评估，本文在统一框架内**重新实现**所有方法，从而把算法改进与所提随机过程分离。

**表 2：SDB 与基线在四个逆问题上的定量对比。** 粗体表示每个指标的最优值，下划线表示次优值。

| 方法 | Inpainting FID↓ | Inpainting LPIPS↓ | Inpainting PSNR↑ | Inpainting SSIM↑ | SR×4 FID↓ | SR×4 LPIPS↓ | SR×4 PSNR↑ | SR×4 SSIM↑ | CT FID↓ | CT LPIPS↓ | CT PSNR↑ | CT SSIM↑ | MRI FID↓ | MRI LPIPS↓ | MRI PSNR↑ | MRI SSIM↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DPS（无监督） | 12.3 | 0.213 | 18.59 | 0.684 | 101.2 | 0.295 | 19.04 | 0.492 | 29.25 | 0.160 | 32.870 | 0.709 | 40.73 | 0.187 | 21.336 | 0.549 |
| ΠGDM（无监督） | 10.2 | 0.146 | 19.02 | 0.762 | 97.09 | 0.311 | 18.84 | 0.530 | 32.29 | 0.165 | 31.272 | 0.757 | 41.14 | 0.211 | 19.830 | 0.665 |
| DDNM（无监督） | 10.7 | 0.112 | 18.90 | 0.791 | 99.21 | 0.302 | 17.13 | 0.513 | 30.41 | 0.238 | 27.226 | 0.783 | 42.23 | 0.196 | 18.122 | 0.636 |
| I2SB（监督） | 5.56 | 0.047 | 27.41 | 0.889 | 83.73 | **0.176** | 25.21 | 0.686 | 24.81 | 0.107 | 41.886 | 0.924 | 31.54 | 0.065 | 28.750 | 0.849 |
| IR-SDE（监督） | 4.68 | 0.031 | 29.92 | 0.912 | 96.22 | 0.185 | 23.51 | 0.603 | 18.88 | 0.028 | 43.438 | 0.964 | 30.14 | 0.065 | 28.878 | 0.871 |
| GOUB（监督） | 4.69 | 0.031 | 29.89 | 0.912 | 98.89 | 0.178 | 24.39 | 0.649 | 19.90 | 0.024 | 43.878 | 0.967 | 30.63 | 0.058 | 28.590 | 0.863 |
| DDBM（监督） | 6.03 | 0.047 | 28.15 | 0.906 | 90.16 | 0.233 | 25.79 | 0.720 | **23.36** | 0.040 | **44.415** | 0.964 | 32.42 | 0.074 | 28.971 | 0.872 |
| SDB (VP)（本文） | 4.90 | **0.030** | 30.51 | 0.914 | 87.08 | 0.228 | 25.91 | 0.724 | 15.43 | 0.019 | 46.365 | 0.981 | 32.88 | 0.068 | 29.255 | 0.881 |
| SDB (VE)（本文） | 5.97 | 0.042 | **32.12** | **0.944** | 94.73 | 0.226 | 25.90 | 0.718 | **14.17** | 0.020 | 46.325 | 0.981 | 33.90 | 0.083 | 29.098 | 0.876 |
| SDB (SB)（本文） | **4.63** | 0.031 | 30.40 | 0.930 | **81.56** | 0.226 | **26.10** | **0.724** | 15.02 | **0.018** | **46.672** | **0.982** | **29.85** | **0.053** | **29.812** | **0.893** |

**基准。** 本文在四个测量系统复杂度不同的逆问题上评估 SDB，原始图像分辨率 $256\times256$。沿用前人工作 [Luo et al., 2023a, Yue et al., 2024]，首先考虑 CelebA-HQ [Karras et al., 2018] 上的**修补**，其中 $\mathbf A$ 为掩膜算子、$\boldsymbol\Sigma=\mathbf 0_{m\times m}$（无噪）；测量为被遮挡的原图（$m=d$），等价于 PR（$\mathbf A^{+}=\mathbf I$）。其次考察 DIV2K [Agustsson and Timofte, 2017, Timofte et al., 2017] 上的**超分辨率**，$\mathbf A$ 为 $4\times$ 下采样算子（$d=4m$，用平均池化实现），$\mathbf A^{+}$ 用最近邻插值重建图像。为评估更复杂、更实际的逆问题，本文另提出两个医学成像任务：在 RSNA 颅内出血数据集 [Anouk Stein et al., 2019] 上的 **CT 重建**，以及在 Br35H 数据集 [Merlin, 2022] 上的 **MRI 重建**，均使用二维轴位脑切片。

CT 重建中正弦图 $\mathbf y$ 表示物体衰减系数的线积分，系统矩阵 $\mathbf A$ 描述沿 X 射线轨迹的探测器特定积分；本文用其 SVD 分解 $\mathbf A=\mathbf U\mathbf D\mathbf V^{*}$ 实现 $\mathbf A$，为使问题更真实并引入领域特有伪影，把 $\mathbf D$ 中低于阈值 $\tau=3.2$ 的奇异值置零，并使用标量协方差 $\boldsymbol\Sigma=\sigma_1^{2}\mathbf I$ 的含噪设置（$\sigma_1^{2}=0.0001$）。

MRI 重建中 $\mathbf y$ 为欠采样 Fourier 域测量，系统矩阵建模为 $\mathbf A=\mathbf M\mathcal F$（$\mathcal F$ 为 Fourier 变换、$\mathbf M$ 为掩膜矩阵）。掩膜 $\mathbf M$ 由 $\lambda_1$ 控制保留的最低频率百分比（确定性操作）、$\lambda_2$ 指定从其余频率中采样的百分比（随机操作）；含噪设置同样用标量协方差 $\boldsymbol\Sigma=\sigma_2^{2}\mathbf I$（$\sigma_2^{2}=5.0$）。默认取 $\lambda_1=16$、$\lambda_2=30$。

表 2 的结果表明 **SDB (SB) 在每一项指标上都优于所有基线**，唯一例外是 DIV2K 上的 LPIPS。值得注意的是，SDB (SB) 相比随机过程最相近的 I2SB 有**明显优势**，说明它有效利用了来自测量系统的额外信息；这也为定理 2 中零空间 OT 计划提供了经验支持。此外，SDB (SB) 表现出更优的**稳定性**，而基线桥方法在不同任务间的性能排名波动更大。这些优势在定性结果（图 2）中同样明显。

SDB (VE) 与 SDB (VP) 在感知与重建指标间取得不同平衡：在修补任务中它们常优于所有其他方法、且明显强调重建质量；这一趋势在超分辨率与 MRI 重建中更突出；在 CT 重建中其性能与 SDB (SB) 几乎持平。尽管它们偶尔略逊于基线桥方法，这在其随机过程性质下并不意外——与 IR-SDE 一样，它们不把 $p(\mathbf x_1)$ 视为 Dirac delta 之和，意味着反向过程从**含噪样本**开始；额外噪声使问题更难，但直接与 IR-SDE 相比时性能提升明显。

最后，在本文的统一设置下，先前桥方法表现出**相近性能与显著更小的波动**（与这些工作原先报告相比）[Luo et al., 2023a, Yue et al., 2024]。例如，它们在 MRI 重建上的 PSNR 落在 $[28.590,28.971]$ 区间，意味着约 0.2 量级的性能提升在此情境下已属显著。值得注意的是，无监督基线性能明显低于桥方法；这在意料之中（缺少配对数据训练），但本文设置给无条件模型的训练预算仅为桥方法的两倍，说明其性能尚未饱和，改进留待未来工作。


### 5.1 总体评估

（接上文基准与结果讨论：本节在四个任务上比较全部方法，结论见上；图 2 给出定性对比。）

### 5.2 系统失配下的评估

实践中，虽然逆问题的测量系统一般形式可能已知，但**具体参数值**在训练与部署间常有差异，形成泛化挑战：模型必须学习底层动力学而非依赖捷径。例如 CT 重建中，训练良好的模型应在原参数 $\tau$ 附近表现稳定；更大的 $\tau'$ 会减少低频信息、使任务更难，但泛化模型应在 $\tau'$ 变化时保持大部分性能。

该问题对 SDB 尤为关键，因为测量系统参数被**直接嵌入**其随机过程的系数。虽然 5.1 节显示有性能收益，但若 SDB 对特定参数值过拟合，实际部署会有风险。因此本节测试 SDB 在**失配模型**下评估时能否泛化。评估聚焦 5.1 节表现最好的方法。

**泛化改进。** 先从 MRI 重建任务开始：系统响应矩阵保留一部分原始信号，即从最低频开始保留 $\lambda_1$ 比例的频率。这维持了真图的总体结构；随 $\lambda_1$ 逐渐减小，信息损失更多、任务越来越难——这也对应真实场景中探测器采集更少测量。下文用默认设置（$\lambda_1=16$、$\sigma_2^{2}=5.0$）下训练的桥方法检查点，在由修改参数系统生成的测量上评估。


图 3（上）显示随 $\lambda_1$ 逐渐减小各方法的性能变化：SDB 与基线的差距**早在 $\lambda_1=14$ 时就已扩大**，且在更低值处持续保持。SDB 继续更好地利用可用测量信息，表明对 $\lambda_1$ 减小具有更强鲁棒性。

为使设置更具挑战性，本文固定 $\lambda_1=14$ 并逐渐把测量噪声 $\sigma_2^{2}$ 增大到训练时值的两倍，模拟更真实的情形。图 3（下）表明，即使在该扰动下，SDB 仍保持对基线方法的显著性能优势。不出所料，所有方法对 $\sigma_2^{2}$ 变化的鲁棒性都强于对 $\lambda_1$ 变化的鲁棒性。

附录给出 CT 重建任务的类似分析，结论相似。两项实验与实际逆问题求解器应用密切相关，凸显 SDB 在广泛系统扰动下的泛化能力，使其成为真实场景的有前景方案。

**扩展评估。** 附录给出更多实验结果，包括更具挑战性的失配模型评估、病态系统算子影响的分析、计算复杂度与运行时评估、一系列消融研究；最后给出 SDB 向**非线性**测量系统的概念性扩展，并在小规模研究中展示其相对基线桥方法的经验优势。把 SDB 扩展到更广问题类别仍是值得研究的方向。

## 6 讨论、局限与结论

SDB 为线性高斯模型下逆问题的**测量系统专用扩散桥**提供了原理性框架。通过把测量系统信息显式纳入生成过程，它提升了重建质量并在系统扰动下展现强泛化。但方法也有天然局限：扩展到非线性测量系统仍是开放挑战，本文仅给出基于**局部线性化**的初步概念验证（受限于可微系统）；此外，本文对值域与零空间分量都采用**简单方差调度**，二者过程的相互作用需要进一步理论与经验研究以确定最优调度策略。从实际应用看，CT 与 MRI 重建通常以**三维**进行，在三维设置中评估本文方法仍是未来方向。尽管有这些局限，本文视 SDB 为基于扩散的逆问题求解器文献中的有价值贡献与未来研究的有前景基础。

**致谢。** 本工作得到波兰国家研发中心（NCBiR）资助的 INFOSTRATEG-I/0022/2021-00 项目、波兰国家科学中心（NCN）资助的 SONATA BIS 2019/34/E/ST6/00052 项目以及 NIH 资助支持。计算资源由华沙理工大学数学与信息科学学院生物信息学与计算基因组学实验室及高性能计算中心提供；亦感谢波兰高性能基础设施 PLGrid ACC Cyfronet AGH 在计算资助 PLG/2025/018330 内提供的计算设施与支持。

## 参考文献（英文原书目）

原文采用作者—年份引用制、按字母顺序排列、未编号。以下按原文顺序逐条转录（共 70 条，条目文字不翻译；为便于站内引用与核对加注序号 [1]—[62]，URL/DOI 从略，可在原文核对）。

[1] B. P. Abbott et al. Observation of gravitational waves from a binary black hole merger. In Physical Review Letters. American Physical Society, 2016.

[2] Eirikur Agustsson and Radu Timofte. Ntire 2017 challenge on single image super-resolution: dataset and study. In CVPR Workshops, 2017.

[3] Kazunori Akiyama et al. First M87 event horizon telescope results. i. the shadow of the supermassive black hole. In Proceedings of the Event Horizon Telescope Imaging, 2019.

[4] Brian DO Anderson. Reverse-time diffusion equation models, volume 12. Stochastic Processes and their Applications, Elsevier, 1982.

[5] MD Anouk Stein, Carol Wu, Chris Carr, George Shih, Jayashree Kalpathy-Cramer, Julia Elliott, et al. RSNA intracranial hemorrhage detection. Kaggle, 2019.

[6] Georgios Batzolis, Jan Stanczuk, Carola-Bibiane Schönlieb, and Christian Etmann. Conditional image generation with score-based diffusion models. arXiv:2111.13606, 2021.

[7] M Bertero, C De Mol, and E R Pike. Linear inverse problems with discrete data. i. general formulation and singular system analysis. In Inverse Problems, 1985.

[8] Yochai Blau and Tomer Michaeli. The perception-distortion tradeoff. In CVPR, pages 6228–6237, 2018.

[9] E.J. Candes, J. Romberg, and T. Tao. Robust uncertainty principles: exact signal reconstruction from highly incomplete frequency information. IEEE Trans. Inf. Theory, 2006.

[10] Liangyu Chen, Xiaojie Chu, Xiangyu Zhang, and Jian Sun. Simple baselines for image restoration. In ECCV, 2022.

[11] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. In NeurIPS, 2022.

[12] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In ICLR, 2023a.

[13] Hyungjin Chung, Jeongsol Kim, and Jong Chul Ye. Direct diffusion bridge using data consistency for inverse problems. In NeurIPS, 2023b.

[14] Hyungjin Chung, Suhyeon Lee, and Jong Chul Ye. Decomposed diffusion sampler for accelerating large-scale inverse problems. In ICLR, 2024.

[15] Giannis Daras, Hyungjin Chung, Chieh-Hsin Lai, Yuki Mitsufuji, Jong Chul Ye, Peyman Milanfar, Alexandros G Dimakis, and Mauricio Delbracio. A survey on diffusion models for inverse problems. arXiv:2410.00083, 2024.

[16] Valentin De Bortoli, James Thornton, Jeremy Heng, and Arnaud Doucet. Diffusion Schrödinger bridge with applications to score-based generative modeling. In NeurIPS, 2021.

[17] Valentin De Bortoli, Iryna Korshunova, Andriy Mnih, and Arnaud Doucet. Schrödinger bridge flow for unpaired data translation. In NeurIPS, 2024.

[18] Mauricio Delbracio and Peyman Milanfar. Inversion by direct iteration: an alternative to denoising diffusion for image restoration. In TMLR, 2023.

[19] Prafulla Dhariwal and Alex Nichol. Diffusion models beat GANs on image synthesis. In NeurIPS, 2021.

[20] Joseph L Doob. Classical potential theory and its probabilistic counterpart, volume 262. Springer, 1984.

[21] Tomer Garber and Tom Tirer. Image restoration by denoising diffusion models with iteratively preconditioned guidance. In CVPR, 2024.

[22] Daniel T Gillespie. Exact numerical simulation of the Ornstein–Uhlenbeck process and its integral. Physical Review E, 1996.

[23] Guande He, Kaiwen Zheng, Jianfei Chen, Fan Bao, and Jun Zhu. Consistency diffusion bridge models. In NeurIPS, 2024.

[24] Jeremy Heng, Valentin De Bortoli, Arnaud Doucet, and James Thornton. Simulating diffusion bridges with score matching. arXiv:2111.07243, 2021.

[25] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. GANs trained by a two time-scale update rule converge to a local Nash equilibrium. In NeurIPS, 2017.

[26] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In NeurIPS, 2020.

[27] Bowen Jing, Gabriele Corso, Renato Berlinghieri, and Tommi Jaakkola. Subspace diffusion generative models. In ECCV, pages 1–17, 2022.

[28] Kevin Kamm, Stefano Pagliarani, and Andrea Pascucci. On the stochastic Magnus expansion and its application to SPDEs. Journal of Scientific Computing, 89(3):56, 2021.

[29] Tero Karras, Timo Aila, Samuli Laine, and Jaakko Lehtinen. Progressive growing of GANs for improved quality, stability, and variation. In ICLR, 2018.

[30] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In NeurIPS, 2022.

[31] Beomsu Kim, Gihyun Kwon, Kwanyoung Kim, and Jong Chul Ye. Unpaired image-to-image translation via neural Schrödinger bridge. In ICLR, 2024.

[32] Diederik P. Kingma and Jimmy Ba. Adam: a method for stochastic optimization. In ICLR, 2015.

[33] Alex Krizhevsky et al. Learning multiple layers of features from tiny images. Department of Computer Science, University of Toronto, 2009.

[34] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In ICLR, 2023.

[35] Guan-Horng Liu, Arash Vahdat, De-An Huang, Evangelos Theodorou, Weili Nie, and Anima Anandkumar. I2SB: Image-to-Image Schrödinger Bridge. In ICML, 2023.

[36] Xingchao Liu, Lemeng Wu, Mao Ye, and Qiang Liu. Let us build bridges: understanding and extending diffusion generative models. In NeurIPS 2022 Workshop on Score-Based Methods, 2022.

[37] Ziwei Luo, Fredrik K Gustafsson, Zheng Zhao, Jens Sjölund, and Thomas B Schön. Image restoration with mean-reverting stochastic differential equations. In ICML, 2023a.

[38] Ziwei Luo, Fredrik K Gustafsson, Zheng Zhao, Jens Sjölund, and Thomas B Schön. Refusion: enabling large-size realistic image restoration with latent-space diffusion models. In CVPR Workshops, pages 1680–1691, 2023b.

[39] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In ICLR, 2024.

[40] Merlin. Br35H brain tumor detection dataset. https://www.heywhale.com/, 2022.

[41] Toshio Mikami. Monge's problem with a quadratic cost by the zero-noise limit of h-path processes. In Probability Theory and Related Fields, 2004.

[42] Jennifer L Mueller and Samuli Siltanen. Linear and nonlinear inverse problems with practical applications. SIAM, 2012.

[43] Maria-Elena Nilsback and Andrew Zisserman. Automated flower classification over a large number of classes. In ICVGIP, 2008.

[44] Gregory Ongie, Ajil Jalal, Christopher A. Metzler, Richard G. Baraniuk, Alexandros G. Dimakis, and Rebecca Willett. Deep learning techniques for inverse problems in imaging. IEEE J. Sel. Areas Inf. Theory, 2020.

[45] Stefano Peluchetti. Non-denoising forward-time diffusions, 2022.

[46] Konpat Preechakul, Nattanat Chatthee, Suttisak Wizadwongsa, and Supasorn Suwajanakorn. Diffusion autoencoders: toward a meaningful and decodable representation. In CVPR, pages 10619–10629, 2022.

[47] Julius Richter, Simon Welker, Jean-Marie Lemercier, Bunlong Lay, and Timo Gerkmann. Speech enhancement and dereverberation with diffusion-based generative models. IEEE/ACM TASLP, 2023.

[48] Herbert E Robbins. An empirical Bayes approach to statistics. In Breakthroughs in Statistics, 1992.

[49] Simo Särkkä and Arno Solin. Applied stochastic differential equations, volume 10. Cambridge University Press, 2019.

[50] Erwin Schrödinger. Sur la théorie relativiste de l'électron et l'interprétation de la mécanique quantique. Annales de l'Institut Henri Poincaré, 2:269–310, 1932.

[51] Yuyang Shi, Valentin De Bortoli, Andrew Campbell, and Arnaud Doucet. Diffusion Schrödinger bridge matching. In NeurIPS, 2024.

[52] Bartlomiej Sobieski and Przemysław Biecek. Global counterfactual directions. In ECCV, 2024.

[53] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In ICML, 2015.

[54] Vignesh Ram Somnath, Matteo Pariset, Ya-Ping Hsieh, Maria Rodriguez Martinez, Andreas Krause, and Charlotte Bunne. Aligned diffusion Schrödinger bridges. In UAI, 2023.

[55] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In ICLR, 2021a.

[56] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In ICLR, 2023a.

[57] Yang Song and Stefano Ermon. Generative modeling by estimating gradients of the data distribution. In NeurIPS, 2019.

[58] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In ICLR, 2021b.

[59] Yang Song, Prafulla Dhariwal, Mark Chen, and Ilya Sutskever. Consistency models. In ICML, 2023b.

[60] Gilbert Strang. Introduction to linear algebra. SIAM, 2022.

[61] Albert Tarantola. Inverse problem theory and methods for model parameter estimation. SIAM, 2005.

[62] Radu Timofte, Eirikur Agustsson, Luc Van Gool, Ming-Hsuan Yang, Lei Zhang, Bee Lim, et al. Ntire 2017 challenge on single image super-resolution: methods and results. In CVPR Workshops, 2017.

[63] Matthew Tivnan, Jacopo Teneggi, Tzu-Cheng Lee, Ruoqiao Zhang, Kirsten Boedeker, Liang Cai, Grace J. Gang, Jeremias Sulam, and J. Webster Stayman. Fourier diffusion models: a method to simulate spatially varying noise. 2025.

[64] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In ICLR, 2023.

[65] Simon Welker, Julius Richter, and Timo Gerkmann. Speech enhancement with score-based generative models in the complex STFT domain. In Interspeech, 2022.

[66] Conghan Yue, Zhengwei Peng, Junlong Ma, Shiyan Du, Pengxu Wei, and Dongyu Zhang. Image restoration through generalized Ornstein–Uhlenbeck bridge. In ICML, 2024.

[67] Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In CVPR, 2018.

[68] Kaiwen Zheng, Guande He, Jianfei Chen, Fan Bao, and Jun Zhu. Diffusion bridge implicit models. In ICLR, 2025.

[69] Linqi Zhou, Aaron Lou, Samar Khanna, and Stefano Ermon. Denoising diffusion bridge models. In ICLR, 2024.

[70] Kaizhen Zhu, Mokai Pan, Yuexin Ma, Yanwei Fu, Jingyi Yu, Jingya Wang, and Ye Shi. UniDB: a unified diffusion bridge framework via stochastic optimal control. arXiv preprint, 2025.

## 附录 A：理论结果、证明与推导

### A.1 SDB 漂移与扩散系数的推导

用定理 1 由 SDB 前向过程的均值与协方差矩阵 $\mathbf H_t,\boldsymbol\Sigma_t$（(8a)、(8b)）导出漂移与扩散系数 $\mathbf F_t,\mathbf G_t$（(10a)、(10b)）。回忆 $\mathbf H_t=\mathbf A^{+}\mathbf A+\alpha_t(\mathbf I-\mathbf A^{+}\mathbf A)$、$\boldsymbol\Sigma_t=\gamma_t\mathbf A^{+}\boldsymbol\Sigma\mathbf A^{+\top}+\beta_t(\mathbf I-\mathbf A^{+}\mathbf A)$。由定理 1 得

$$
\mathbf A^{+}\mathbf A\mathbf F_t=\frac{\mathrm d}{\mathrm dt}\mathbf A^{+}\mathbf A\log\mathbf H_t=\frac{\mathrm d}{\mathrm dt}\mathbf A^{+}\mathbf A=\mathbf 0,\tag{12a}
$$
$$
(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf F_t=\frac{\mathrm d}{\mathrm dt}\log\alpha_t\,(\mathbf I-\mathbf A^{+}\mathbf A),\tag{12b}
$$
$$
\frac{\mathrm d}{\mathrm dt}\mathbf A^{+}\mathbf A\boldsymbol\Sigma_t=\frac{\mathrm d\gamma_t}{\mathrm dt}\mathbf A^{+}\boldsymbol\Sigma\mathbf A^{+\top},\tag{12c}
$$
$$
\frac{\mathrm d}{\mathrm dt}(\mathbf I-\mathbf A^{+}\mathbf A)\boldsymbol\Sigma_t=\frac{\mathrm d\beta_t}{\mathrm dt}(\mathbf I-\mathbf A^{+}\mathbf A).\tag{12d}
$$

此外，由值域与零空间投影的对称性有 $\mathbf F_t^{\top}=\mathbf F_t$、$\boldsymbol\Sigma_t^{\top}=\boldsymbol\Sigma_t$，且因 $\mathbf F_t$ 只作用于零空间、$(\mathbf I-\mathbf A^{+}\mathbf A)^{2}=(\mathbf I-\mathbf A^{+}\mathbf A)$（幂等），有 $\mathbf F_t\boldsymbol\Sigma_t=\boldsymbol\Sigma_t\mathbf F_t$。于是由定理 1 得

$$
\mathbf F_t=\frac{\mathrm d}{\mathrm dt}\log\alpha_t\,(\mathbf I-\mathbf A^{+}\mathbf A),\tag{13a}
$$
$$
\mathbf G_t\mathbf G_t^{\top}=\frac{\mathrm d\boldsymbol\Sigma_t}{\mathrm dt}-\mathbf F_t\boldsymbol\Sigma_t-\boldsymbol\Sigma_t\mathbf F_t^{\top}=\frac{\mathrm d\boldsymbol\Sigma_t}{\mathrm dt}-2\mathbf F_t\boldsymbol\Sigma_t\tag{13b}
$$
$$
=\frac{\mathrm d\gamma_t}{\mathrm dt}\mathbf A^{+}\boldsymbol\Sigma\mathbf A^{+\top}+\left(\frac{\mathrm d\beta_t}{\mathrm dt}-2\beta_t\frac{\mathrm d}{\mathrm dt}\log\alpha_t\right)(\mathbf I-\mathbf A^{+}\mathbf A).\tag{13c–13d}
$$

### A.2 定理 2 的证明

先回忆 Liu et al. [2023] 的两个命题（用本文记号）作为证明基础。

**命题 1（给定边界对的解析后验）** [Liu et al., 2023]。给定边界对 $(\mathbf x_0,\mathbf x_1)$ 时，条件 (1) 的后验有解析形式

$$
p(\mathbf x_t\mid\mathbf x_0,\mathbf x_1)=\mathcal N\left(\boldsymbol\mu_t(\mathbf x_0,\mathbf x_1),\boldsymbol\Sigma_t\right),\tag{14}
$$

其中 $\boldsymbol\mu_t=\frac{\bar\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}\mathbf x_0+\frac{\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}\mathbf x_1$，$\sigma_t^{2}=\int_0^{t}g^{2}(\tau)\mathrm d\tau$、$\bar\sigma_t^{2}=\int_t^{1}g^{2}(\tau)\mathrm d\tau$，且 $\mathbf G_t=g(t)\mathbf I$。

**命题 2（最优传输 ODE，OT-ODE）** [Liu et al., 2023]。当 $g^{2}(t)\to0$ 时，$(\mathbf x_0,\mathbf x_1)$ 之间的 SDE 化为 ODE

$$
\mathrm d\mathbf x_t=\mathbf v_t(\mathbf x_t\mid\mathbf x_0)\,\mathrm dt,\tag{15}
$$

其中 $\mathbf v_t(\mathbf x_t\mid\mathbf x_0)=\frac{g^{2}(t)}{\sigma_t^{2}}(\mathbf x_t-\mathbf x_0)$，其解即 (14) 的后验均值。

考虑由 (8a)、(8b) 且取 $\alpha_t=\bar\sigma_t^{2}/(\bar\sigma_t^{2}+\sigma_t^{2})$、$\beta_t=\sigma_t^{2}\bar\sigma_t^{2}/(\bar\sigma_t^{2}+\sigma_t^{2})$ 给出的零空间部分。此时零空间分量可写为

$$
(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_t=\left(\frac{\bar\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_0+\frac{\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_1\right)+\left(\frac{\sigma_t^{2}\bar\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}\right)^{\frac{1}{2}}(\mathbf I-\mathbf A^{+}\mathbf A)\boldsymbol\epsilon,\tag{16}
$$

即在给定边界对下服从一个与 (14) 同构的解析后验；等价地

$$
(\mathbf I-\mathbf A^{+}\mathbf A)\mathbf x_t\sim\mathcal N\left((\mathbf I-\mathbf A^{+}\mathbf A)\boldsymbol\mu_t(\mathbf x_0,\mathbf x_1),\ \frac{\sigma_t^{2}\bar\sigma_t^{2}}{\bar\sigma_t^{2}+\sigma_t^{2}}(\mathbf I-\mathbf A^{+}\mathbf A)\right).\tag{17}
$$

随后计算所需导数：记 $C\triangleq\bar\sigma_t^{2}+\sigma_t^{2}$（常数），由 $\frac{\mathrm d}{\mathrm dt}\sigma_t^{2}=g^{2}(t)$、$\frac{\mathrm d}{\mathrm dt}\bar\sigma_t^{2}=-g^{2}(t)$，得

$$
\frac{\mathrm d}{\mathrm dt}\log\alpha_t=\frac{\mathrm d}{\mathrm dt}\log\frac{\bar\sigma_t^{2}}{C}=\frac{\mathrm d}{\mathrm dt}\left(\log\bar\sigma_t^{2}-\log C\right)=-\frac{g^{2}(t)}{\bar\sigma_t^{2}},\tag{18a–18c}
$$
$$
\frac{\mathrm d\beta_t}{\mathrm dt}=\frac{\mathrm d}{\mathrm dt}\frac{\sigma_t^{2}(C-\sigma_t^{2})}{C}=\frac{1}{C}\frac{\mathrm d}{\mathrm dt}\left(C\sigma_t^{2}-\sigma_t^{4}\right)=g^{2}(t)\left(1-\frac{2}{C}\sigma_t^{2}\right).\tag{18d–18h}
$$

把这些代入 $\mathbf G_t\mathbf G_t^{\top}$ 的零空间系数并整理：当 $g^{2}(t)\to0$ 时，零空间扩散项消失，仅保留由后验均值给出的确定性速度场，从而 (11) 的 OT-ODE 成立。$\square$

### A.3 定理 3 的证明

定理 3 断言：在 $\lim_{t\to1}\gamma_t=1$ 与 $\lim_{t\to1}\alpha_t^{2}/\beta_t=0$ 下，SDB 的反向时间 SDE 渐近生成 Bayes 后验 $p(\mathbf x\mid\mathbf y)$ 的精确样本。证明思路是：在 $t\to1$ 时，值域空间系数 $\gamma_t\to1$ 使前向过程在值域上退化为**恒等映射**（即 $\mathbf A^{+}\mathbf A\mathbf x_1=\mathbf A^{+}\mathbf y$ 处的不确定性消失），而零空间系数满足 $\alpha_t^{2}/\beta_t\to0$，使零空间分量相对初始信号项由噪声主导、其边缘趋于已知的各向同性高斯先验。于是终点分布 $p(\mathbf x_1)$ 集中于以 $\mathbf A^{+}\mathbf y$ 为均值、具有与测量模型一致的协方差的高斯，反向过程等价于从该先验出发、以真实似然条件化的扩散采样，故在大数据与大容量极限下收敛到 $p(\mathbf x\mid\mathbf y)$。（完整代数步骤见原文 PDF 附录 A.3。）

### A.4 Magnus 展开的普遍性

本文使用的定理 1 依赖 Magnus 展开。当漂移矩阵在不同时刻**可交换**（$[\mathbf F_s,\mathbf F_{s'}]=\mathbf 0$）时展开为精确等式；对 SDB 而言，$\mathbf F_t=\frac{\mathrm d}{\mathrm dt}\log\alpha_t(\mathbf I-\mathbf A^{+}\mathbf A)$ 是**同一投影矩阵的标量倍**，故不同时刻的 $\mathbf F_t$ 两两可交换，定理 1 在 SDB 中**精确成立**（而非近似）。这保证了本文系数推导的严格性。

## 附录 B：扩展相关工作

### B.1 逆问题的扩散模型

除正文所述引导采样外，还有把扩散先验与数据一致性投影结合的方法，如 DDNM [Wang et al., 2023] 利用值域—零空间分解在每步施加硬数据一致性；ΠGDM [Song et al., 2023a] 用伪逆引导；DPS [Chung et al., 2023a] 以测量残差梯度近似似然分数；DDPG [Garber and Tirer, 2024] 采用迭代预条件引导。这些方法都需在推断时访问前向算子与其伪逆，且其性能依赖预训练模型与测量模型匹配程度。

### B.2 扩散与 Schrödinger 桥

Schrödinger 桥 [Schrödinger, 1932] 寻求在两个给定边缘分布之间的最小作用随机过程；扩散桥方法以不同方式求解或近似该问题：I2SB [Liu et al., 2023] 用免模拟回归；IR-SDE [Luo et al., 2023a] 用均值回归 SDE；GOUB [Yue et al., 2024] 与 DDBM [Zhou et al., 2024] 用 Doob h-变换构造桥；另有 Shi et al. [2024]、Kim et al. [2024]、De Bortoli et al. [2024] 等匹配/流方法。本文 SDB 与它们的关键区别在于**在系数中嵌入线性测量系统**，从而显式区分值域与零空间。

### B.3 基线

**B.3.1 无监督。** DPS、ΠGDM、DDNM 均使用预训练无条件扩散模型与已知前向算子的引导/投影；评估时采用各方法推荐的最优噪声调度与步数。

**B.3.2 监督。** I2SB、IR-SDE、GOUB、DDBM 均在成对（PR，干净样本）数据上训练桥过程；本文在统一框架、统一架构与训练预算下重新实现，以隔离随机过程设计的影响。

## 附录 C：扩展方法

### C.1 网络参数化

标量设定中，分数的不同重参数化会带来不同性能权衡 [Ho et al., 2020]（如直接预测噪声，可由分数双射得到）。这些重参数化经简单标量函数相联系，可自由选择；但在**矩阵值**设定中，参数化选择更微妙。注意

$$
\nabla_{\mathbf x_t}\log p(\mathbf x_t)=-\boldsymbol\Sigma_t^{-1}\left(\mathbf x_t-\mathbf H_t\mathbb E[\mathbf x_0\mid\mathbf x_t]\right),
$$

训练分数预测模型因此需要 $\boldsymbol\Sigma_t$ 的逆，通常代价高昂。若改为合适的重参数化，例如对某函数 $f_t$ 预测

$$
(f_t\mathbf I-2\mathbf F_t)\left(\mathbf H_t\mathbb E[\mathbf x_0\mid\mathbf x_t]-\mathbf x_t\right),
$$

即采用 **$x_0$-预测模型**，则可避免计算 $\boldsymbol\Sigma_t^{-1}$。本文把该参数化作为 SDB 的默认选择（算法 1、2 中的 $D_{\boldsymbol\theta}$ 即预测干净样本）。

### C.2 非线性测量系统

SDB 主要针对具全局值域—零空间分解的线性算子 $\mathbf A$ 表述，但可扩展到某些非线性逆问题。对非线性、可微的系统响应 $\mathbf A$，可在某点 $\mathbf x_0$ 附近用一阶 Taylor 展开局部近似：

$$
\mathbf A(\mathbf x)\approx\mathbf A(\mathbf x_0)+\mathbf J_{\mathbf A}(\mathbf x_0)(\mathbf x-\mathbf x_0),\tag{26}
$$

其中 $\mathbf J_{\mathbf A}(\mathbf x_0)$ 为 $\mathbf A$ 在 $\mathbf x_0$ 处的 Jacobian。该线性化诱导**局部**的值域—零空间分解，使 SDB 可用于非线性系统。流程为：

1. 对测量 $\mathbf y=\mathbf A(\mathbf x)+\boldsymbol\Sigma^{1/2}\boldsymbol\epsilon$，先由梯度下降（如 5 步）最小化 $\min_{\widehat{\mathbf x}}\lVert\mathbf A(\widehat{\mathbf x})-\mathbf y\rVert_2^{2}$ 得到近似极大似然估计 $\widehat{\mathbf x}$；
2. 在 $\widehat{\mathbf x}$ 处按 (26) 线性化算子并计算 Jacobian $\mathbf J_{\mathbf A}(\widehat{\mathbf x})$；
3. 把 $\mathbf y\approx\mathbf J_{\mathbf A}(\widehat{\mathbf x})\mathbf x+\boldsymbol\Sigma^{1/2}\boldsymbol\epsilon$ 视为线性高斯模型，用标准 SDB 的伪逆与值域/零空间投影求解。

该做法把 Jacobian 作为非线性算子的局部线性近似，从而把 SDB 适配到更一般的可微系统。为避免显式存储 Jacobian，可用 Jacobian-向量积（JVP）或 PyTorch 等自动微分框架中的梯度操作高效实现。

## 附录 D：实验设置

### D.1 训练超参数

遵循 Luo et al. [2023a] 的训练流程：ADAM 优化器 [Kingma and Ba, 2015]，初始学习率 $1\times10^{-4}$，无权重衰减，$(\beta_1,\beta_2)=(0.9,0.99)$；采用多步学习率调度器，在第 36、60、72、90 轮把学习率减半（与原工作一致）。所有方法用 $\ell_1$ 损失、批大小 8；为公平比较，每 16 轮评估一次并报告最佳检查点，而非仅用最终检查点。

### D.2 计算需求

所有实验在 NVIDIA A100 GPU 集群上完成，每种方法用单卡训练；各任务的近似训练时间为：超分辨率 4 小时、MRI 重建 24 小时、CT 重建 48 小时、修补 72 小时。

## 附录 E：补充实验结果

### E.1 失配模型下的评估（CT 重建）

图 4 给出桥方法在失配模型下（CT 重建任务）的类似分析：实验第一部分考察 $\tau$ 递增的系统，第二部分给出 $\tau=3.6$ 与噪声变化的组合结果。与第 5.2 节类似，当系统参数被扰动时，所有 SDB 变体相对其他桥方法都有明显优势。


### E.2 更具挑战性的失配设置

本文研究监督逆问题中更具挑战性、更真实的失配场景，包括对前向算子与噪声模型的对抗性修改，并在这些设置下把 SDB (SB) 与监督基线对比。

**E.2.1 失配算子。** 考虑两种超分辨率场景：大幅放大的下采样核（$32\times32$）与 30% 质量的 JPEG 压缩，二者都产生与训练时 PR 差异很大的输入。表 3 报告两任务结果，任务在第一列标出；SDB (SB) 在 4 项指标中的 3 项取得最佳。

**表 3：更具挑战性算子下的超分辨率（粗体为最优值）。**

| 方法 | 核 $32\times32$ FID↓ | 核 $32\times32$ LPIPS↓ | 核 $32\times32$ PSNR↑ | 核 $32\times32$ SSIM↑ | JPEG 30% FID↓ | JPEG 30% LPIPS↓ | JPEG 30% PSNR↑ | JPEG 30% SSIM↑ |
|---|---|---|---|---|---|---|---|---|
| IRSDE | 130.47 | 0.684 | 17.85 | 0.381 | 99.43 | 0.283 | 24.81 | 0.651 |
| I2SB | 131.33 | 0.681 | 17.84 | 0.381 | 93.62 | 0.322 | 25.12 | 0.668 |
| DDBM | 131.55 | 0.700 | 17.83 | 0.380 | 92.39 | 0.373 | 25.19 | 0.685 |
| GOUB | 134.66 | 0.690 | 17.85 | 0.370 | 101.08 | 0.291 | 24.91 | 0.662 |
| SDB (SB) | **129.87** | **0.682** | **17.86** | **0.390** | **90.26** | 0.380 | **25.41** | **0.692** |

**E.2.2 失配噪声模型。** 本文还把高斯噪声替换为 **Poisson** 分布以模拟光子计数物理：给定信号 $\mathbf x$，测量采样为 $\mathbf y\sim\mathrm{Poisson}(I_0\cdot\exp(-\mathbf A\mathbf x))$，$I_0$ 为入射光子强度。本文在 CT 重建（Poisson 噪声贴近真实 X 射线物理）上评估；如表 4 所示，即使未显式建模 Poisson 分布，SDB 在不同 $I_0$ 下仍优于所有监督基线。

**表 4：Poisson 噪声下的 CT 重建（粗体为最优值）。**

| 方法 | $I_0=10000$ FID↓ | $I_0=10000$ LPIPS↓ | $I_0=10000$ PSNR↑ | $I_0=10000$ SSIM↑ | $I_0=5000$ FID↓ | $I_0=5000$ LPIPS↓ | $I_0=5000$ PSNR↑ | $I_0=5000$ SSIM↑ | $I_0=1000$ FID↓ | $I_0=1000$ LPIPS↓ | $I_0=1000$ PSNR↑ | $I_0=1000$ SSIM↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GOUB | 17.78 | 0.0230 | 44.85 | 0.9717 | 17.83 | 0.0240 | 44.59 | 0.9705 | 20.52 | 0.0491 | 42.79 | 0.9588 |
| IRSDE | 17.29 | 0.0256 | 44.17 | 0.9681 | 17.86 | 0.0299 | 43.88 | 0.9665 | 21.12 | 0.0678 | 41.84 | 0.9506 |
| DDBM | 20.69 | 0.0402 | 44.11 | 0.9622 | 20.57 | 0.0406 | 43.93 | 0.9613 | 21.75 | 0.0575 | 42.53 | 0.9525 |
| I2SB | 21.91 | 0.1014 | 41.68 | 0.9242 | 21.82 | 0.1018 | 41.54 | 0.9231 | 22.43 | 0.1170 | 40.44 | 0.9130 |
| SDB (SB) | **14.03** | **0.0193** | **46.05** | **0.9799** | **14.61** | **0.0203** | **45.70** | **0.9785** | **19.80** | **0.0461** | **43.44** | **0.9657** |

本文进一步把 **MRI 重建在 Poisson 噪声**下作为对抗性设置（MRI 通常不以 Poisson 噪声建模，因而高度分布外）；表 5 显示 SDB 仍在 4 项指标中的 3 项最优，同时 SSIM 几乎与最优持平。

**表 5：Poisson 噪声下的 MRI 重建（粗体为最优值）。**

| 方法 | $I_0=20$ FID↓ | $I_0=20$ LPIPS↓ | $I_0=20$ PSNR↑ | $I_0=20$ SSIM↑ | $I_0=16$ FID↓ | $I_0=16$ LPIPS↓ | $I_0=16$ PSNR↑ | $I_0=16$ SSIM↑ | $I_0=12$ FID↓ | $I_0=12$ LPIPS↓ | $I_0=12$ PSNR↑ | $I_0=12$ SSIM↑ | $I_0=8$ FID↓ | $I_0=8$ LPIPS↓ | $I_0=8$ PSNR↑ | $I_0=8$ SSIM↑ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DDBM | 40.2161 | 0.2647 | 21.9509 | 0.5572 | 39.0941 | 0.2360 | 22.6901 | 0.5919 | 38.2960 | 0.2036 | 23.6083 | 0.6345 | 36.6739 | 0.1653 | 24.7777 | 0.6873 |
| GOUB | 39.8257 | 0.2821 | 21.4963 | 0.5246 | 39.3272 | 0.2530 | 22.2050 | 0.5577 | 38.4142 | 0.2196 | 23.0794 | 0.5991 | 36.9538 | 0.1794 | 24.2220 | 0.6524 |
| IRSDE | 39.8516 | 0.2706 | 21.5772 | 0.5383 | 39.4095 | 0.2445 | 22.2666 | 0.5722 | 38.4208 | 0.2141 | 23.1378 | 0.6139 | 37.0698 | 0.1769 | 24.2971 | 0.6680 |
| I2SB | 40.0352 | 0.2767 | 21.4514 | 0.5219 | 39.0571 | 0.2492 | 22.1715 | 0.5546 | 38.1304 | 0.2168 | 23.0778 | 0.5957 | 37.1202 | 0.1782 | 24.2578 | 0.6492 |
| SDB (SB) | **39.7303** | **0.2513** | **22.0684** | 0.5569 | **38.9677** | **0.2245** | **22.8237** | 0.5891 | 38.1484 | **0.1936** | **23.7615** | 0.6293 | **36.6346** | **0.1569** | **24.9707** | 0.6811 |

### E.3 病态系统下的运动去模糊

为评估 SDB 在**病态系统**中的实用性，本文在 Flowers102 数据集 [Nilsback and Zisserman, 2008] 的 $128\times128$ 花朵图像上考察运动去模糊：系统矩阵建模为**块 Toeplitz 的 Toeplitz 块（BTTB）**矩阵，用像素域二维卷积实现；伪逆近似采用频域**零阶 Tikhonov 正则化（Wiener 滤波）**。虽然这与精确伪逆不同，SDB 在 LPIPS 上与最优持平，并在其余三项指标上明显优于所有监督基线，展示了对病态算子的稳健性（表 6）。

**表 6：Flowers102 数据集上用 BTTB 系统矩阵与 Tikhonov 正则化伪逆的运动去模糊性能（粗体为最优值）。**

| 方法 | FID↓ | LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| GOUB | 17.03 | 0.053 | 23.84 | 0.813 |
| IRSDE | 16.27 | 0.033 | 26.76 | 0.842 |
| DDBM | 16.00 | 0.040 | 29.74 | 0.892 |
| I2SB | 15.62 | 0.025 | 29.29 | 0.874 |
| SDB (SB) | **14.89** | **0.025** | **30.39** | **0.903** |

### E.4 非线性系统下的对比度恢复

本文对 SDB 在非线性系统上的应用做初步研究。实践中，附录 C.2 所述真值信号 $\mathbf x$ 的初始估计 $\widehat{\mathbf x}$ 可通过对 $\min_{\widehat{\mathbf x}}\lVert\mathbf A(\widehat{\mathbf x})-\mathbf y\rVert_2^{2}$ 做若干步梯度下降得到，为线性化提供合理起点；步骤 2 与 3 在给定点计算 Jacobian，并用其得到伪逆重建（PR）与 SDB 的值域/零空间投影。这些操作无需显式存储 Jacobian，可经 Jacobian-向量积（JVP）或自动微分框架（如 PyTorch）中的梯度操作高效实现，或在有解析 Jacobian 时直接使用。

为说明 SDB 对非线性系统的适用性，本文在 CIFAR10 [Krizhevsky et al., 2009] 上用**非线性对比度算子**做概念验证基准：$\mathbf A(\mathbf x)=\sigma(k(\mathbf x-\alpha))$，其中 $\sigma$ 为 sigmoid、$k$ 控制对比度强度、$\alpha$ 为对比度偏置。按附录 C.2 的线性化流程：步骤 1 用 5 步梯度下降得到初始猜测，步骤 2、3 用解析 Jacobian 计算伪逆重建与投影。如表 7 所示，SDB (SB) 在该非线性对比度恢复任务上**在所有指标上优于所有监督基线**，说明即使系统响应非线性，SDB 仍能利用局部线性化算子产生高保真重建，同时取得更优感知质量（FID、LPIPS）与重建精度（PSNR、SSIM）。本文强调这只是初步概念验证，未来工作应更深入研究 SDB 对非线性系统的适用性。

**表 7：CIFAR10 上的非线性对比度重建（粗体为最优值）。**

| 方法 | FID↓ | LPIPS↓ | PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| I2SB | 2.97 | 0.00103 | 37.53 | 0.9906 |
| GOUB | 4.60 | 0.00182 | 32.54 | 0.9743 |
| DDBM | 1.92 | 0.00016 | 42.74 | 0.9963 |
| IRSDE | 4.35 | 0.00140 | 33.53 | 0.9789 |
| SDB (SB) | **1.31** | **0.00015** | **44.48** | **0.9977** |

### E.5 超参数分析

本文对 SDB 超参数做消融。遵循前人工作 [Zhou et al., 2024]，本文随机过程在 $t=1$ 处未定义，需从 $t=1-\epsilon_1$（$\epsilon_1>0$）开始采样、在 $t=\epsilon_2$（$\epsilon_2>0$）终止。对 SDB (VP) 与 SDB (VE)，$\epsilon_1,\epsilon_2$ 是唯一超参数；而 SDB (SB) 另有零空间扩散系数 $g(t)$ 的形状设计。本文把其参数化为 $g^{2}(t)=\mathbf 1_{t\le0.5}\,\widehat g(t)+\mathbf 1_{t>0.5}\,\widehat g(1-t)$，其中 $\widehat g(t)=(\sqrt{b_0}+t(\sqrt{b_1}-\sqrt{b_0}))^{2}$，这是 Liu et al. [2023] 系数的连续版本，引入两个额外超参数 $b_0,b_1>0$。以下聚焦 SDB (SB)（VP/VE 变体观察到定性相似趋势）。

先考察 $\epsilon_1,\epsilon_2$ 如何影响 SDB (SB) 在 MRI 重建中最优 $(b_0,b_1)$ 配置。图 5（上）显示随 $(\epsilon_1,\epsilon_2)$ 变化的性能趋势：关系简单稳定，$\epsilon_1$ 的影响强于 $\epsilon_2$，且存在**宽平台**便于调参；图中还标出 LPIPS 最优配置，它接近该设定下的最优 Pareto 前沿。

接着分析 SDB (SB) 在不同 $(b_0,b_1)$ 配置下的稳定性。由于这些值决定方差函数形状，最优 $\epsilon_1,\epsilon_2$ 可能随 $(b_0,b_1)$ 而变。图 5（下）给出超分辨率任务上 64 组 $(b_0,b_1)$ 最佳性能的箱线图；对每组用网格搜索找最优 $\epsilon_1,\epsilon_2$（利用 DIV2K 数据集较小）。结果显示出**很强稳定性**：性能集中在最佳观测值附近，仅少数离群点。


### E.6 噪声调度消融

本文评估 SDB 的 VP 与 VE 变体在超分辨率任务上不同调度（线性、二次、余弦）的影响。用本文记号：线性 VP 为 $\alpha_t=1-t$；二次 VP 为 $\alpha_t=1-t^{2}$；余弦 VP 为 $\alpha_t=\cos(\cdot)$（原文为余弦形式）；线性 VE 的 $\beta_t=\sigma_{\max}t$；二次 VE 为 $\beta_t=\sigma_{\max}t^{2}$；余弦 VE 为 $\beta_t=\sigma_{\max}\sin(\cdot)$（原文按 t 的正弦形式给出）。

**表 8：SDB（VP 与 VE）在不同噪声调度下的消融结果。** FID 与 LPIPS 越低表示感知质量越好，PSNR 与 SSIM 越高表示重建保真度越好；粗体为 VP 或 VE 内部各指标最优值。

| 调度 | VP FID↓ | VP LPIPS↓ | VP PSNR↑ | VP SSIM↑ | VE FID↓ | VE LPIPS↓ | VE PSNR↑ | VE SSIM↑ |
|---|---|---|---|---|---|---|---|---|
| 线性 | 87.08 | 0.228 | 25.91 | 0.724 | 94.73 | 0.226 | 25.90 | 0.718 |
| 二次 | **75.25** | 0.174 | 24.77 | 0.680 | 76.88 | **0.159** | 25.29 | 0.678 |
| 余弦 | 77.99 | **0.160** | 24.75 | 0.674 | **76.14** | 0.217 | **26.17** | **0.732** |

结果显示感知质量（FID、LPIPS）与重建保真度（PSNR、SSIM）之间存在明显**权衡**：线性调度有利失真指标，而二次与余弦调度以重建精度为代价提升感知指标；尤其余弦 SDB (VE) 在 4 项指标中的 3 项取得最优，说明探索替代调度是有价值的。

### E.7 SDB 的计算复杂度与开销

本文分析 SDB 相对其他监督基线的计算复杂度与运行时开销，先讨论渐近复杂度、再给经验测量。

对可由存储矩阵 $\mathbf A$ 解析计算伪逆的一般情形，分 $m\ge d$ 与 $m<d$ 两种：伪逆分别计算为 $\mathbf A^{+}=(\mathbf A^{\top}\mathbf A)^{-1}\mathbf A^{\top}$ 或 $\mathbf A^{+}=\mathbf A^{\top}(\mathbf A\mathbf A^{\top})^{-1}$；渐近复杂度见表 9。计算 PR 的复杂度（$\mathcal O$ 意义下）与计算伪逆本身相同。

**表 9：伪逆计算与值域/零空间投影的渐近计算复杂度。**

| 操作 | $m\ge d$ | $m<d$ |
|---|---|---|
| 伪逆 | $\mathcal O(md^{2}+d^{3})$ | $\mathcal O(m^{2}d+m^{3})$ |
| 值域投影 $\mathbf A\mathbf A^{+}$ | $\mathcal O(md^{2})$ | $\mathcal O(m^{2}d)$ |
| 零空间投影 $(\mathbf I-\mathbf A^{+}\mathbf A)$ | $\mathcal O(d^{2}m)$ | $\mathcal O(dm^{2})$ |

实践中本文**不显式构造** $\mathbf A^{+}$，而是实现 $\mathbf A$、$\mathbf A^{\top}$、$\mathbf A^{+}$ 及其组合的应用以获得投影与 PR；各逆问题的实现不同，例如修补中 $\mathbf A$ 为逐元素掩膜，而 CT 重建用截断 SVD 高效实现 $\mathbf A$，通常复杂度更低。本文在 CT 重建任务上测量最重操作（4 个批、每批 8 个样本）的秒级运行时间，三类操作为：**无网络前向步**（从 $p(\mathbf x_t\mid\mathbf x_0)$ 采样）、**带网络前向步**（前者加一次网络前向）、**带网络反向步**（用神经网络从 $p(\mathbf x_{t-\Delta t}\mid\mathbf x_t,\mathbf x_1)$ 采样，对应一次离散反向时间步）；经验运行时间见表 10。

**表 10：CT 重建任务上 SDB 与基线监督方法的运行时间（秒）。**

| 方法 | 无网络前向步 | 带网络前向步 | 带网络反向步 |
|---|---|---|---|
| SDB (SB) | 0.0062 | 0.0885 | 0.5981 |
| IR-SDE | 0.0003 | 0.0832 | 0.5895 |
| DDBM | 0.0004 | 0.0785 | 0.5862 |

带网络前向步显示 SDB 计算时间略有增加，但该开销在实践中可忽略：神经网络前向的相对成本主导运行时，而矩阵运算在所用 NVIDIA A100 GPU 上可高效并行；因此 SDB 推断运行时与其他监督方法几乎相同。

### E.8 基于 OT 的无配对数据基线

本文还在 MRI 重建任务上给出与近期基于 OT、无配对数据方法（UNSB [Kim et al., 2024] 与 SBF [De Bortoli et al., 2024]）的小规模比较，结果见表 11。按原始训练流程，把模型训练为在 PR 分布与真实信号观测分布之间映射；由于这些方法缺少配对数据的直接监督，其性能自然弱于监督方法。

**表 11：全部监督与基于无配对数据方法的 MRI 重建结果。** FID 与 LPIPS 越低表示感知质量越好，PSNR 与 SSIM 越高表示重建保真度越好。

| 指标 | UNSB | SBF | I2SB | IR-SDE | GOUB | DDBM | SDB (VP) | SDB (VE) | SDB (SB) |
|---|---|---|---|---|---|---|---|---|---|
| FID↓ | 35.91 | 43.63 | 31.54 | 30.14 | 30.63 | 32.42 | 32.88 | 33.90 | **29.85** |
| LPIPS↓ | 0.237 | 0.290 | 0.065 | 0.065 | 0.058 | 0.074 | 0.068 | 0.083 | **0.053** |
| PSNR↑ | 18.72 | 18.46 | 28.75 | 28.88 | 28.59 | 28.97 | 29.26 | 29.10 | **29.81** |
| SSIM↑ | 0.483 | 0.291 | 0.849 | 0.871 | 0.863 | 0.872 | 0.881 | 0.876 | **0.893** |

## 附录 F：扩展讨论

### F.1 嵌入测量系统信息的优势

把测量系统信息纳入生成过程有若干概念与实践优势。早期依赖**手工先验**的方法收益有限，而 SDB 不依赖此类先验，而是把测量系统直接嵌入模型动力学，从而自然把逆问题分解为两个**正交**、角色不同的部分：值域空间与零空间。该分解提供了把**重建**与**合成**分离的结构化方式，无需手动设计。

通过嵌入测量算子，SDB 从观测测量到干净图像定义了更**高效**的随机路径，类似于其他通过更有信息的反向过程初始化来改进条件扩散的桥模型。该框架下神经网络同时学习两个互补任务：(i) 值域空间中的**可选去噪**任务——通常更简单、且常受数据直接约束；(ii) 零空间中的**合成**任务——负责缺失或未观测分量。

无噪场景下，该结构可**精确保持**值域内容，确保已被测量支持的信息不被改动；含噪条件下，值域空间已编码正确的底层结构、只需局部修正，模型因此受益。于是值域空间充当引导零空间合成的**结构化先验**：例如生成式修补中未遮挡区域无噪或近乎无噪，SDB 避免不必要地破坏已观测区域，而把建模能力集中于生成缺失内容。

### F.2 感知—失真权衡

Blau and Michaeli [2018] 提出的感知—失真权衡在本工作中很重要。其形式化把感知度量定义为真实分布与模型诱导分布之间的散度，把失真量化为期望重建误差，从而可从理论视角推测算法行为；由于感知与失真通过 **Pareto 前沿**相联系，可从定量结果得出更原理性的结论。

值域—零空间分解还提供更深洞见：SDB 的优势在于对值域与零空间的**差异化处理**——只需（可选地）对前者去噪，而在后者**合成新内容**；这种双重处理从一开始就带来更好性能。无噪情形下值域分量保持不变，失真为零；含噪情形下它经受更温和的变换，直觉上也会降低失真。无噪时也更容易讨论感知：若模型合成的零空间内容与真图完全一致，则失真为零但感知有代价；若合成的零空间内容完全在分布内但偏离真实信号，则感知最优而失真增大。

从理论上看，极限情形下 SDB 从真实条件分布 $p(\mathbf x\mid\mathbf y)$ 采样，说明方法倾向于**完美感知**；但由于隐式假设零空间非空，SDB 总缺少完美重建真实 $\mathbf x$ 所需的部分信息，这与 Blau and Michaeli [2018] 的权衡一致。实践中观察到 SDB 在超分辨率任务的 4 项指标中的 3 项优于所有方法，而 LPIPS 略差；按 Blau and Michaeli [2018]，这给出有趣洞见：更好的 FID（分布间散度）说明 SDB 感知结果更好，同时它在 PSNR 与 SSIM（重建精度/失真）上也更优，可以认为该方法在此任务上运行在**近最优性能**处；LPIPS 不衡量分布散度、而是在神经网络表示空间中度量感知失真，说明为更接近 Pareto 前沿必须牺牲某一类语义重建。此外，VP/VE 变体的噪声调度消融表明可恢复更好的 LPIPS，这正是该权衡的另一体现。

## 附录 G：更广泛影响

通过把测量系统参数纳入 SDE，SDB 在医学成像、遥感与科学逆问题等关键应用中实现更准确高效的重建，从而支持更好的诊断、可持续性与更广可及性，具有积极社会影响。但也带来潜在负面风险，包括被用于监控或去匿名化、放大有缺陷测量模型中的偏见、以及在高风险领域过度依赖看似合理但错误的输出；此外该方法可能被挪用于从有限数据生成欺骗性内容。不过 SDB 与先前桥方法尚未在工业级部署规模上得到验证，实践中通常适用于问题专用场景而非大规模海量数据场景，这限制了其在更广社会场景中被误用的可能。

## 附录 H：补充可视化结果

本文给出修补（图 6）、超分辨率（图 7）、MRI 重建（图 8）与 CT 重建（图 9）的更多定性样本。

## 图注与表注

**图 1：** SDB 通过把测量系统嵌入线性 SDE 的系数，在伪逆重建与干净样本之间学习扩散桥，使分数模型能区分任务的**值域空间**与**零空间**。图中示意了从测量/伪逆重建到干净样本的桥接流程，以及值域（已知）与零空间（缺失）分解。

**图 2：** SDB (SB) 与表现最好的基线（桥方法）的定性对比。各行依次为修补、超分辨率、CT 与 MRI 重建；每列从左到右为真值 $\mathbf x$、测量 $\mathbf y$、I2SB、IR-SDE、GOUB、DDBM 与 SDB。

**图 3：** 失配 MRI 重建设置下 SDB (SB) 与其他桥方法的定量对比。上排评估以 $\lambda_1=16,\sigma_2^{2}=5$ 训练的桥在 $\lambda_1$ 递减系统上的表现；下排评估在 $\lambda_1=14$、$\sigma_2^{2}$ 变化数据上的表现。扰动原系统在两种情形下都使问题更难。

**图 4：** 失配 CT 重建设置下 SDB (SB) 与其他桥方法的定量对比。上排评估以 $\tau=3.2,\sigma_1^{2}=0.0001$ 训练的桥在 $\tau$ 递增系统上的表现；下排评估在 $\tau=3.6$ 与噪声变化数据上的表现。

**图 5：** 上：在最优 $(b_0,b_1)$ 配置下，MRI 重建随 $(\epsilon_1,\epsilon_2)$ 变化的性能热图，红框标出 LPIPS 最优设置。下：超分辨率任务上 64 组 $(b_0,b_1)$ 对的最佳性能箱线图（每组分别调优 $(\epsilon_1,\epsilon_2)$）。

**图 6：** SDB 各变体与表现最好的基线（桥方法）的定性对比（修补任务）。

**图 7：** SDB 各变体与表现最好的基线（桥方法）的定性对比（超分辨率任务）。

**图 8：** SDB 各变体与表现最好的基线（桥方法）的定性对比（MRI 重建任务）。

**图 9：** SDB 各变体与表现最好的基线（桥方法）的定性对比（CT 重建任务）。

**表注：** 表 1 为现有 SOTA 扩散桥与 SDB 的概念对比（前向过程形式、是否嵌入测量系统、漂移/扩散系数、是否 Markovian）；表 2 为四个逆问题上全部方法的 FID/LPIPS/PSNR/SSIM 定量对比；表 3—表 6 为更具挑战性/失配系统下（更大下采样核与 JPEG、Poisson 噪声 CT/MRI、病态 BTTB 运动去模糊）的结果；表 7 为非线性对比度重建；表 8 为噪声调度消融；表 9 为伪逆与投影的渐近复杂度；表 10 为 CT 重建三类步骤的运行时间；表 11 为 MRI 重建上全部监督与无配对数据方法的对比。原文以粗体标出各指标最优值。

## 本页范围与校对状态

**覆盖范围：** 本页为 NeurIPS 2025 会议论文集版本（38 页，含附录）的全文中文译稿，按原文结构译出：摘要；第 1 节引言；第 2 节相关工作；第 3 节背景（线性 SGM、逆问题、伪逆、值域—零空间分解、问题专用扩散桥）；第 4 节方法（连接系统与 SDE、嵌入测量系统、SDE 视角、定理 2、新过程、定理 3、表 1、算法 1—2）；第 5 节实验（基线、实验设计、表 2、基准与结果、5.1 总体评估、5.2 系统失配下评估与图 3）；第 6 节讨论与局限；致谢；参考文献 70 条；附录 A（A.1 系数推导、A.2 定理 2 证明、A.3 定理 3 证明、A.4 Magnus 展开普遍性）、附录 B（扩展相关工作与基线）、附录 C（网络参数化、非线性系统）、附录 D（训练超参数与计算需求）、附录 E（E.1—E.8 补充结果与表 3—表 11）、附录 F（扩展讨论）、附录 G（更广泛影响）、附录 H（补充可视化）；图 1—图 9 图注与表 1—表 11 表注。

**源文页码：** 第 1—2 页（题名、作者、摘要、引言、图 1）→ 第 2—4 页（相关工作、背景）→ 第 4—7 页（方法、定理 1—3、表 1、算法 1—2）→ 第 7—9 页（表 2、基准、图 2）→ 第 9—10 页（5.2、图 3、讨论与局限）→ 第 10—13 页（致谢、参考文献）→ 第 14—23 页（附录 A—C）→ 第 23—30 页（附录 D—E、表 3—表 7、图 4—图 5）→ 第 30—36 页（表 8—表 11、附录 F—H、图 6—图 9）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 2、表 3—表 7、表 11 的数值来自对 PDF 文本层的逐行提取，其中表 2 已按 PDF 第 8 页渲染图逐项核对（含粗体/下划线最优值）；表 8—表 10 按文本层转录。表 1 为**公式密集的概念对比表**，本页以"前向过程形式/是否嵌入系统/漂移/扩散/Markovian"的等价方式呈现，SDB 行的系数严格按 (10a)(10b) 给出，其余方法行的系数在原文中各有专用记号，本页以定性描述概括（详见原文表 1）。
2. 图 1—图 9 均未上传图片；本页以"图注与表注"小节统一给出 9 条中文图注与 11 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖正文 (1)—(11)、附录 (12a)—(18h) 与 (26)；按页内顺序连续编号。**附录 A.2/A.3 中原文的多步分步推导（如 (19)—(25) 的逐项化简）本页以结构化证明要点呈现**（明确标注"完整代数步骤见原文 PDF 附录"），未逐行转写全部中间代数；定理陈述、关键条件与结论均完整译出。
4. **原文疑点／说明：** ①原文定理 1 的 $\mathbf H_t=\exp(\boldsymbol\Omega_t)$ 为**近似**，仅当漂移矩阵可交换时为等式；本文附录 A.4 说明 SDB 的 $\mathbf F_t$ 为同一投影矩阵的标量倍、故两两可交换，定理 1 在 SDB 中精确成立。②定理 2 中 $\mathbf v_t$ 的具体表达式在原文跨页处被截断（文本层为 "where $v_t(\mathbf x_t\mid\mathbf x_0)=$" 后接下一行），本页按命题 2 的 OT-ODE 速度场形式说明并注明。③定理 3 的两个极限条件按 PDF 渲染图核对为 $\lim_{t\to1}\gamma_t=1$ 与 $\lim_{t\to1}\alpha_t^{2}/\beta_t=0$。④表 8 的 VP/VE 调度公式在原文以 $\cos$/$\sin$ 加截断参数给出，本页按语义概括并注明。⑤表 10 中 DDBM 的运行时间取自文本层；原文表 10 仅列 SDB、IR-SDE、DDBM 三行。⑥参考文献为作者—年份制、原文未编号，本页按原顺序加注 [1]—[70]。
5. **许可与登记：** 原文为 NeurIPS 2025 会议论文集版本，再传播许可**待核验**；本页仅作学习用途、**不计入本站可公开全文统计**，页面顶部与状态段均已注明。
6. 版权：本页为中文翻译页面，未上传原文 PDF；如后续确认许可，再按站点流程更新发布状态。

{% endraw %}
