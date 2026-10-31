---
layout: page
title: "稀疏观测下的物理场重建：扩散模型何时有效｜中文全文译文"
permalink: /papers/translations/2026-09-17-2609-06135-physical-field-reconstruction-from-sparse-observations-when-are-diffus/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2243864212b3ecd1/) · [原文 arXiv](https://arxiv.org/abs/2609.06135) · [全部目录](/papers/catalog/)

# 稀疏观测下的物理场重建：扩散模型何时有效

**原题：** Physical-Field Reconstruction from Sparse Observations: When Are Diffusion Models Preferable to Deterministic Regression?  
**作者：** Hao Zhou$^{a}$、Rui Zhang$^{a}$、Qi Wang$^{b}$、Hao Sun$^{a}$  
**单位：** $^{a}$ 中国人民大学高瓴人工智能学院（Gaoling School of Artificial Intelligence, Renmin University of China），北京；$^{b}$ 中关村学院（Zhongguancun Academy），北京。通讯作者：Rui Zhang 与 Hao Sun，邮箱 `{rayzhang,haosun}@ruc.edu.cn`。  
**版本：** arXiv:2609.06135v1（physics.comp-ph），2026 年 9 月 5 日；原文标注编译日期 2026 年 9 月 5 日；33 页（正文 + 参考文献 + 附录 A—F）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1—6 节（含 2.1—2.4、3.1—3.3、4.1—4.5）、致谢与各类声明、图 1—8 中文图注、表 1—4 逐格转录、参考文献 [1]—[43]（英文原条目，按原编号）、附录 A—F（含表 A1、A2、B1—B4、C1、E1、E2、F1 与图 B1、C1—C3、D1—D2、F1）均按原文结构录入；逐句逐式终校未做。

## 摘要

从稀疏观测重建物理场是系统辨识、预测与控制的核心问题，但稀疏测量一般无法确定完整场，这使重建成为不适定逆问题而非简单插值。尽管已有许多确定性与生成式方法，但关于"何时单一估计足够、何时一组可能的重建分布更有用"仍缺乏共识。我们在匹配的实验设置下，对确定性 U-Net、条件扩散与先验引导扩散做公平比较，覆盖二维 Poisson 方程、二维 Navier–Stokes 流与一维 Kuramoto–Sivashinsky 动力学。通过这一比较，我们得到三点观察。第一，精度依赖具体场与区制：更高复杂度或更稀疏观测并不会系统性地使扩散占优。第二，集成均值改善相位对齐精度，而单个样本更好地保持变异性，并可能在特定区制中保留高波数功率。第三，条件扩散以更低成本提供更可靠的不确定性估计，而先验引导扩散对掩码分布漂移更鲁棒，但推理成本与引导调参开销显著更高。这些结果澄清了生成式重建何时有用，并为改善稀疏场重建中的不确定性估计、细尺度样本保真、鲁棒性与计算效率提供了指导。

**关键词：** 稀疏重建；生成模型；扩散模型；不确定性量化。

## 1. 引言

从稀疏观测重建物理场是科学和工程中状态估计、系统辨识、预测与控制的基础问题 [1–3]。该问题一般是不适定的，因为多个场可以与全部可用测量一致而在未观测位置上各不相同。这种欠定性使稀疏重建不止是插值问题：观测只约束场的一部分，其余自由度必须由额外的统计、几何或物理结构推断。现有方法主要在如何引入这种结构上不同，例如降阶基、学习式重建算子与生成式场先验。

恢复物理场的经典方法依赖降阶与稀疏表示，包括本征正交分解（POD）及其 gappy 扩展 [4–6] 与压缩感知 [7, 8]。基于深度学习的方法利用神经网络的表示学习能力从数据学习非线性重建算子，进一步拓展了这一范式。该灵活性使稀疏观测与重建场可以有多种表示方式。对预先给定的传感器布局，神经网络或直接由传感器值、或经由降阶场表示推断完整离散场 [9–11]。网格型模型用卷积与算子学习架构利用粗粒度或不完整场的空间结构 [12–14]。对不规则或可变的传感器布局，Voronoi 辅助网络把散点测量转为结构化输入，而基于注意力的架构直接处理传感器值与坐标 [15, 16]。基于坐标的隐式神经表示进一步允许在任意位置连续求值重建场 [17, 18]。当控制方程可得时，物理信息方法可通过 PDE 残差约束纳入它们 [19, 20]。这些进展提升了稀疏场重建的灵活性与表达能力。然而所得重建一般是确定性的：对给定观测，它们返回单一估计，而不表示与测量兼容的场的分布。

除确定性方法外，贝叶斯反演方法通过刻画以观测为条件的场后验分布来处理稀疏重建的非唯一性 [21]。现代生成模型为场先验或条件分布提供了灵活的数据驱动表示，能产生与同一测量一致的多个可能重建。变分自编码器、生成对抗网络、扩散模型与流匹配 [22–26] 已被用于物理场生成与稀疏重建 [27–31]。在基于扩散的重建中，观测可在训练时作为条件，或在采样时引导已学习的全场先验 [32]。条件扩散在训练时把观测作为条件输入，直接学习以观测为条件的场分布 [31, 33, 34]。先验引导扩散则从完整场学习无条件先验，并在采样时通过数据一致性修正或基于梯度的引导施加测量一致性 [29, 35–39]。这些方法把稀疏重建从预测单一最优估计转向表示与观测一致的一族场，因而在模糊性、不确定性或样本多样性具有科学意义时尤其有吸引力。

已有研究展示了这些重建方法的可行性，但基准、架构、观测协议、物理约束与采样流程的差异限制了对不同表述的直接比较。因此仍不清楚何时确定性回归足够、何时生成式重建在精度、不确定性量化、鲁棒性或计算成本上带来实际优势。我们通过对一个确定性 U-Net [40] 与两种基于同一 EDM 框架 [41] 的扩散表述——条件 EDM（C-EDM）与先验引导 EDM（G-EDM）——做受控比较来填补这一空白。模型主干、数据划分与观测协议在各方法间匹配。评估覆盖来自 Poisson 方程、二维 Navier–Stokes 流与一维 Kuramoto–Sivashinsky 动力学的四个重建目标，并在场复杂度、观测密度与掩码分布上做受控变化。主要发现总结如下。

1. 重建精度依场而定，既非场复杂度升高、也非观测密度降低会系统性使生成方法占优。
2. 生成模型产生支持不确定性量化的可能重建集成；其集成均值改善相位对齐精度，但在特定区制可能削弱高波数功率。
3. 条件扩散一般以更低成本提供更可靠的不确定性估计，而先验引导扩散对掩码分布漂移最不敏感，但需要更长采样与引导权重调参。

总之，这些发现澄清了重建精度、光谱保真、不确定性量化、鲁棒性与计算成本之间的权衡，为按不同科学目标与感知条件选择重建策略提供了依据。此外，这些观察也提示了改进未来稀疏重建方法的具体途径。例如，条件生成方法应更好地保持细尺度样本变异性而不牺牲逐点精度；先验引导方法应在保持对变化感知几何适应性的同时降低采样成本与引导敏感性。

全文结构如下：第 2 节表述稀疏重建问题并介绍确定性 U-Net、C-EDM 与 G-EDM 三种表述；第 3 节描述基准 PDE 系统、观测协议、受控比较设置与评价指标；第 4 节从重建精度、光谱行为、对掩码分布漂移的鲁棒性、不确定性估计与推理成本方面给出经验比较；第 5 节讨论发现的意义与局限；第 6 节总结全文。

## 2. 方法

### 2.1 问题表述与重建范式

令 $x_0\in\mathbb R^{C\times|\mathcal G|}$ 表示在空间或时空网格 $\mathcal G$ 上具有 $C$ 个通道的完整场。令 $M\in\{0,1\}^{|\mathcal G|}$ 为二值观测掩码，在观测位置 $M_g=1$、其余 $M_g=0$；当 $C>1$ 时掩码在各通道间共享。相应的零填充观测为

$$
y=M\odot x_0,\tag{1}
$$

其中 $\odot$ 为逐元素乘法。稀疏物理场重建旨在由 $(y,M)$ 推断 $x_0$。

稀疏观测一般允许多个与同一测量一致的完整场重建。因此我们比较三种重建表述：确定性 U-Net 学习从 $(y,M)$ 到单一重建 $\hat x_0$ 的直接映射；条件 EDM（C-EDM）通过把去噪过程以观测与掩码为条件来建模 $p_\theta(x_0\mid y,M)$；先验引导 EDM（G-EDM）则建模全场分布 $p_\theta(x_0)$，并在采样时通过引导纳入观测。这里 EDM 指 Karras 等 [41] 提出的扩散表述与去噪器预条件。图 1 概括了观测如何进入三种表述。

### 2.2 确定性 U-Net

确定性表述把重建视为直接回归。U-Net [40] $f_\theta^{\mathrm D}$ 接收零填充观测与掩码的按通道拼接，并把完整场预测为

$$
\hat x_0=f_\theta^{\mathrm D}\left(\operatorname{cat}[y,M]\right).\tag{2}
$$

模型通过最小化期望全场均方误差训练：

$$
\mathcal L_{\mathrm D}=\mathbb E_{x_0,M}\left[\mathrm{MSE}(\hat x_0,x_0)\right],\tag{3}
$$

其中均值在所有通道与网格位置上取。推理时，一次前向传播产生一个重建。

### 2.3 条件 EDM（C-EDM）

C-EDM 从带掩码的训练样本中建模条件场分布 $p_\theta^{\mathrm C}(x_0\mid y,M)$。按照 EDM 表述，干净场按下式扰动：

$$
x_\sigma=x_0+\sigma\epsilon,\qquad\epsilon\sim\mathcal N(0,I),\qquad\log\sigma\sim\mathcal N\left(P_{\mathrm{mean}},P_{\mathrm{std}}^2\right).\tag{4}
$$

预条件的条件去噪器 $D_\theta^{\mathrm C}(x_\sigma,\sigma\mid y,M)$ 用噪声加权目标训练：

$$
\mathcal L_{\mathrm C}=\mathbb E_{x_0,M,\sigma,\epsilon}\left[\lambda(\sigma)\,\mathrm{MSE}\left(D_\theta^{\mathrm C}(x_\sigma,\sigma\mid y,M),x_0\right)\right].\tag{5}
$$

加权函数 $\lambda(\sigma)$ 与去噪器预条件遵循 EDM 表述。推理时，令 $\sigma_0>\sigma_1>\cdots>\sigma_N=0$ 表示采样噪声水平。采样从 $x(\sigma_0)=\sigma_0\epsilon$（$\epsilon\sim\mathcal N(0,I)$）开始，沿条件 EDM 概率流 ODE 积分：

$$
\frac{dx(\sigma)}{d\sigma}=\frac{x(\sigma)-D_\theta^{\mathrm C}(x(\sigma),\sigma\mid y,M)}{\sigma}.\tag{6}
$$

该 ODE 用二阶 Euler–Heun 求解器从高噪声积分到干净数据极限；同一观测对 $(y,M)$ 在每次去噪求值时提供。独立抽取 $\epsilon$ 会为同一观测对产生不同的条件重建。噪声调度与采样器配置见附录 A.3。

### 2.4 先验引导 EDM（G-EDM）

G-EDM 把全场先验学习与观测条件化分离。其去噪器 $D_\theta^{\mathrm P}$ 用与 C-EDM 相同的损坏过程、损失加权与去噪器预条件在完整场上训练，但不接收 $y$ 或 $M$。训练目标为

$$
\mathcal L_{\mathrm P}=\mathbb E_{x_0,\sigma,\epsilon}\left[\lambda(\sigma)\,\mathrm{MSE}\left(D_\theta^{\mathrm P}(x_\sigma,\sigma),x_0\right)\right].\tag{7}
$$

所得模型表示全场分布 $p_\theta^{\mathrm P}(x_0)$ 而非以观测为条件的分布。

先验采样遵循式（6），把 $D_\theta^{\mathrm C}$ 换成 $D_\theta^{\mathrm P}$。从与 C-EDM 相同的高斯初始化开始，每个采样步先用 Euler–Heun 格式推进先验 ODE，再施加观测引导修正。该引导流程改编自 DiffusionPDE [38]，动机来自扩散后验采样 [35]。

在第 $i$ 个采样步，令 $x^{(i)}=x(\sigma_i)$ 表示当前状态，$\tilde x^{(i+1)}$ 表示从 $\sigma_i$ 推进到 $\sigma_{i+1}$ 得到的临时状态。用于引导的去噪估计为 $\hat x_0^{(i)}=D_\theta^{\mathrm P}(x^{(i)},\sigma_i)$。观测一致性用下式度量：

$$
L_{\mathrm{obs}}^{(i)}=\sum_{c=1}^{C}\zeta_c\left\|M\odot\left(\hat x_{0,c}^{(i)}-y_c\right)\right\|^2,\tag{8}
$$

其中 $\zeta_c$ 控制通道 $c$ 的相对贡献，掩码把该未平方的 $\ell_2$ 差异限制在观测位置。由于 $L_{\mathrm{obs}}^{(i)}$ 通过先验去噪器依赖 $x^{(i)}$，其梯度经 $D_\theta^{\mathrm P}$ 反向传播。临时状态被修正为

$$
x^{(i+1)}=\tilde x^{(i+1)}-r_i\nabla_{x^{(i)}}L_{\mathrm{obs}}^{(i)},\tag{9}
$$

其中 $r_i$ 为依赖步的引导乘子。修正后的状态 $x^{(i+1)}$ 用作下一次 Euler–Heun 步的输入。DiffusionPDE 中所用的 PDE 残差被省略，仅保留 $L_{\mathrm{obs}}^{(i)}$ 作为引导目标。最终引导配置汇总于附录 A.3，其选择见附录 E。独立初始噪声场为同一观测对 $(y,M)$ 产生不同的观测引导重建。

## 3. 实验设计与评价

### 3.1 基准与观测协议

我们考虑三个基准、四个重建目标。Poisson 基准在 $\Omega=(0,1)^2$ 上表述为

$$
-\Delta u(s)=f(s),\quad s\in\Omega,\qquad u|_{\partial\Omega}=0.\tag{10}
$$

我们联合重建解 $u$ 与源 $f$，其中 $k_c\in\{1,2,4,6\}$ 控制源的频率成分。

Navier–Stokes（NS）基准由周期单位方形 $(0,1)^2$ 上的二维不可压涡量方程支配：

$$
\frac{\partial\omega}{\partial t}+\mathbf v\cdot\nabla\omega=\nu\Delta\omega+q(s),\quad s\in(0,1)^2,\qquad\nabla\cdot\mathbf v=0.\tag{11}
$$

其中 $\mathbf v$ 为速度，$\omega=\nabla\times\mathbf v$ 为被重建的标量涡量，$q$ 为固定强迫。我们使用 Fourier 神经算子数据集 [42] 中 $\nu\in\{10^{-3},10^{-4},10^{-5}\}$（对应 $Re=\nu^{-1}\in\{10^3,10^4,10^5\}$）的十帧涡量轨迹。

Kuramoto–Sivashinsky（KS）基准由周期域 $x\in[0,L]$ 上的

$$
\frac{\partial u}{\partial t}+u\frac{\partial u}{\partial x}+\frac{\partial^2u}{\partial x^2}+\nu\frac{\partial^4u}{\partial x^4}=0\tag{12}
$$

支配。其中 $u(t,x)$ 为演化标量场，$\nu$ 为黏性参数。我们从 PDE-Refiner 数据划分 [43] 中按时空窗口重建 $u(t,x)$，把 $\nu\in[0.5,1.5]$ 分为五个区间；域长 $L$ 遵循发布的轨迹元数据。在三个基准中，更高的 $k_c$、更高的 $Re$ 与更低的 $\nu$ 对应更大的场复杂度。

U-Net 与 C-EDM 在均匀采样的掩码上训练，而 G-EDM 在无观测掩码的完整场上训练。对每个 U-Net 与 C-EDM 训练样本，观测比例从 $\{5,8,10,15,20\}$% 中均匀抽取，随后无放回地采样观测位置。三种方法都在相同的五个观测比例上评估。Poisson 对 $u$ 与 $f$ 使用相同观测位置；NS 与 KS 在每个时间窗口内使用时间不变的空间传感器位置。固定的验证与测试掩码在各方法间共享。附加观测比例测试包括 12% 的插值与低于训练范围的 3% 外推；Poisson 源频率泛化使用 $k_c=3.5$（插值）与 $k_c=8$（外推），均在相同的五个观测比例下评估。掩码分布漂移在固定 5% 观测数下对 Poisson 与 NS 用高斯—均匀、方向性与块缺失掩码评估；每个漂移掩码都与同一场或轨迹上的均匀掩码配对。数据集构造、评估面板与漂移掩码分布详见附录 A.1、A.2 与 C。

### 3.2 受控比较与集成统计

在每个基准内，三种方法使用完全相同的数据划分、归一化统计量与测试观测。U-Net 预测器与两个 EDM 去噪器使用匹配的主干架构。两种 EDM 表述的采样配置按验证性能选择。架构、训练与最终采样配置报告于附录 A.3，G-EDM 引导参数的选择详见附录 E。

测试时，每种 EDM 表述生成 $N_{\mathrm{ens}}=32$ 个重建 $\{\hat x_0^{(m)}\}_{m=1}^{N_{\mathrm{ens}}}$，其集成均值为

$$
\hat x_0^{(\mathrm E)}=\frac{1}{N_{\mathrm{ens}}}\sum_{m=1}^{N_{\mathrm{ens}}}\hat x_0^{(m)}.\tag{13}
$$

对某个标量重建指标 $d$，我们报告

$$
d_{\mathrm E}=d\left(\hat x_0^{(\mathrm E)},x_0\right),\qquad d_{\mathrm S}=\frac{1}{N_{\mathrm{ens}}}\sum_{m=1}^{N_{\mathrm{ens}}}d\left(\hat x_0^{(m)},x_0\right).\tag{14}
$$

后缀 $(\mathrm E)$ 与 $(\mathrm S)$ 分别表示集成均值统计与逐成员统计的均值。"样本"指一个生成的成员。集成规模分析见附录 F。

### 3.3 评价指标

在评估重建与光谱精度之前，观测位置的预测值被替换为相应测量；概率指标只在未观测位置计算。重建精度主要用全场相对 $\ell_2$ 误差评价：

$$
\varepsilon_{\mathrm{rel}}=\frac{\left\|\hat x_0^{\mathrm{eval}}-x_0\right\|_2}{\left\|x_0\right\|_2},\tag{15}
$$

其中 $\hat x_0^{\mathrm{eval}}$ 表示恢复观测值后的重建。

频域评估把与真值谱系数的一致性同与真值谱功率分布的一致性分开。令 $X=Tx_0$、$\hat X=T\hat x_0^{\mathrm{eval}}$，其中 $T$ 为基准特定的正交空间变换。对空间模式集合 $\mathcal A$，定义 $\|Z\|_{2,\mathcal A}^2=\sum_{t\in\mathcal I_t}\sum_{\kappa\in\mathcal A}|Z(t,\kappa)|^2$，其中对静态 Poisson 场省略时间求和。频带 $b$ 内的相位对齐系数误差为

$$
\varepsilon_b^{\mathrm{spec}}=\frac{\left\|\hat X-X\right\|_{2,\mathcal K_b}}{\left\|X\right\|_{2,\mathcal K}},\tag{16}
$$

其中 $\mathcal K_b$ 包含频带 $b$ 内的空间模式，$\mathcal K$ 包含全部被评估的空间模式。公共的全谱分母保持每个频带对总系数误差的贡献。

互补指标评估归一化光谱形状。给定功率谱 $P(k)$，定义 $\tilde P(k)=P(k)/\sum_jP(j)$、$\tilde P_\epsilon(k)=\max\{\tilde P(k),\epsilon\}$（$\epsilon=10^{-14}$ 用于避免对数无定义）。逐频带对数功率误差为

$$
D_b^{\log P}=\frac{1}{|\mathcal B_b|}\sum_{k\in\mathcal B_b}\left|\log_{10}\frac{\tilde P_{\mathrm{pred},\epsilon}(k)}{\tilde P_{\mathrm{true},\epsilon}(k)}\right|,\tag{17}
$$

其中 $\mathcal B_b$ 包含频带 $b$ 的波数。由于 $D_b^{\log P}$ 依赖谱功率而非谱系数，它对相位不敏感。

预测不确定性在未观测位置用连续排序概率分数（CRPS）、中心 90% 预测区间的经验覆盖率与平均区间宽度评价。CRPS 度量集成预测分布的准确性，覆盖率与宽度刻画其校准与锐度。光谱变换、频带与概率指标的细节见附录 A.4 与 B。

## 4. 结果

### 4.1 重建精度依场与区制而定

表 1 比较四个重建目标在全场相对 $\ell_2$ 误差上的均值（在场复杂度设置与观测比例上平均）。与相对 $\ell_2$ 指标的凸性一致，两种 EDM 表述的集成均值误差都低于相应的逐成员均值误差。对 Poisson $u$，C-EDM (E) 仅略优于 U-Net；而对 NS $\omega$，G-EDM (E) 以更明显的数值优势领先。U-Net 在 Poisson $f$ 与 KS $u$ 上表现最好。总体而言，重建精度依场而定，没有始终占优的表述。

图 2 按场复杂度分解表 1 的汇总结果。两个 Poisson 场的重建误差随 $k_c$ 单调增加，NS 随 $Re$ 单调增加；KS 一般在更低黏性下更难，但趋势并不严格单调。对 Poisson $u$，领先方法从 $k_c=1,2$ 时的 U-Net 变为 $k_c=4,6$ 时的 C-EDM (E)。KS 呈相反模式：U-Net 在四个较低黏性区间领先，而 C-EDM (E) 仅在 $\nu\in[1.3,1.5)$ 领先。在所有测试的复杂度设置中，U-Net 在 Poisson $f$ 上、G-EDM (E) 在 NS $\omega$ 上保持最好。因此，场复杂度升高并未系统性增大任一 EDM 表述相对 U-Net 的优势。

重建精度也依赖观测密度（附录图 C1）。在五个基准观测比例上，全场误差一般随测量增多而下降。U-Net 在 Poisson $f$ 上、G-EDM (E) 在 NS $\omega$ 上于全部五个比例保持最好。对 Poisson $u$，C-EDM (E) 在 5% 观测时领先，从 8% 起 U-Net 领先；KS 呈相反转变，5% 时 U-Net 领先，从 8% 起 C-EDM (E) 领先。总之，复杂度和密度相关的交叉都依场而定：既非复杂度升高、也非观测密度降低会系统性增大 EDM 表述相对 U-Net 的优势。

图 3 考察各基准在主评估中最具挑战性的设置：Poisson 为 5% 观测且 $k_c=6$，NS 为 $Re=10^5$，KS 为 $\nu\in[0.5,0.7)$。配对误差分布为每个重建目标识别出的领先方法与表 1 的汇总结果一致。尽管全场误差不同，代表性重建恢复了大致相似的主导结构。这种大尺度上的一致促使我们在 4.2 节做频率分辨分析，考察各方法在更细尺度内容恢复上的差异。

### 4.2 集成平均改善相位对齐精度，但可能削弱光谱尾部

我们在比较重建方法之前，依据真值谱能量分布确定数据集特定的低、中、高频带（附录图 B1）。图 4 报告式（16）定义的相位对齐谱系数误差 $\varepsilon_b^{\mathrm{spec}}$。与该指标的凸性一致，在两种 EDM 表述、全部四个重建目标与全部三个频带上，集成均值误差比相应的逐成员均值误差低 10.9–37.6%。

表 2 报告式（17）定义的高频对数功率误差 $D_H^{\log P}$（对 Poisson $f$ 与 NS $\omega$）。对 Poisson $f$，两种 EDM 的逐成员误差在每个 $k_c$ 下都低于 U-Net 误差；C-EDM 的逐成员误差约为其集成均值对应值的五分之一，而 G-EDM 内部的逐成员优势随 $k_c$ 增大而扩大。对 NS，反转仅在 $Re=10^5$ 出现：两种 EDM 的逐成员误差都低于其集成均值对应值与 U-Net 误差。Poisson $u$ 与 KS 未出现高频反转。完整的逐频带结果见附录表 B1—B3。因此，在特定区制中，单个 EDM 成员平均而言比其集成均值与 U-Net 都更接近高波数功率，尽管集成平均取得了更低的相位对齐误差。

图 5 考察 5% 观测下 Poisson $f$（$k_c=6$）与 NS $\omega$（$Re=10^5$）的随机选取案例。Poisson $f$ 集成均值谱更快的高波数衰减在图 (a) 中清晰可见；两种情况下，EDM 成员在 (c)(d) 中的谱尾对数功率误差都低于其集成均值对应值。如 (e) 所示，Poisson $f$ 的集成均值也比单个 EDM 成员更平滑，而成员保留了更多细尺度纹理。

图 4 与表 2 的两个光谱指标刻画重建的不同方面：相位对齐系数误差比较 Fourier 系数与真值，而对数功率误差在忽略相位的情况下比较归一化谱功率。因此更低的对数功率误差表明高波数功率更接近，但不必然意味着相应细尺度结构的空间位置正确。归一化功率谱之间的相对 $\ell_2$ 距离给出的排序与高频对数功率比较不同（附录表 B4）：该距离强调有能量的模式，对低功率谱尾不那么敏感。总体而言，集成平均一致降低相位对齐误差，但在特定场与区制中削弱高波数功率，这可能是因为各成员特有的成分在平均中相互抵消。

### 4.3 先验引导生成对观测掩码分布漂移最不敏感

在附录图 C1 与 C2 所示观测比例与 Poisson 源频率漂移下，方法排序保持不变。在空间掩码分布漂移下则出现更清晰的差异。在 5% 观测下，我们在配对的 Poisson 场与 NS 轨迹上、固定全部模型与采样器设置，比较均匀掩码与高斯—均匀、方向性与块缺失掩码（图 6），其构造详见附录 C。KS 被排除，因为其固定的一维传感器布局没有这些二维掩码漂移的直接类比。

图 7(a)—(c) 用相对各方法均匀掩码基线的全场相对 $\ell_2$ 误差平均配对增量 $\Delta\varepsilon_{m,g}=\varepsilon_{m,g}-\varepsilon_{m,\mathrm{uniform}}$ 量化敏感性。在全部九个重建场与漂移掩码组合中，G-EDM (E) 的增量最小。最大差距出现在块缺失下的 Poisson $f$：U-Net 的平均误差增加 12.72 个百分点，C-EDM (E) 为 24.68，而 G-EDM (E) 仅 1.01。方向性 Poisson 掩码以及全部三个 NS 掩码上的差异较小，但 G-EDM (E) 仍受影响最小。图 7(d) 用均匀与块缺失掩码下的配对 Poisson $f$ 重建说明该结果：该案例中 U-Net 的全场相对 $\ell_2$ 误差从 0.090 增至 0.275，C-EDM (E) 从 0.094 增至 0.513，而 G-EDM (E) 仅从 0.113 变到 0.121。重建显示 U-Net 与 C-EDM (E) 的额外误差很大部分出现在未观测块内。高斯—均匀与方向性掩码下的更多配对示例见附录图 C3。

漂移测试集上的绝对误差排序大体遵循敏感性结果：G-EDM (E) 在九个漂移条件中的七个取得最低平均绝对误差（附录表 C1）。两处例外是方向性 Poisson 掩码，其 $u$ 偏向 C-EDM (E)、$f$ 偏向 U-Net。尽管 G-EDM (E) 在均匀掩码下对两个 Poisson 变量都不是最准确的方法，在高斯—均匀与块缺失掩码下它对二者都变为最准确。

三种表述在如何纳入观测掩码上不同：U-Net 与 C-EDM 学习从均匀训练分布中抽取的观测与掩码的摊销条件映射；G-EDM 则独立于观测学习全场先验，并在采样时通过引导施加测试掩码。这种先验学习与观测施加的分离有助于解释 G-EDM (E) 在观测空间分布变化时退化更小。

### 4.4 条件生成一般提供更可靠的不确定性估计

表 3 在配对 5% 均匀掩码下用 CRPS、90% 区间经验覆盖率与区间宽度评估未观测位置的不确定性。CRPS 越低越好，而只有在覆盖率相当时更窄的区间才更有利。C-EDM 在 Poisson $u$、Poisson $f$ 与 KS 上取得更低 CRPS，且对全部四个重建目标的覆盖率都更接近名义 90%。对 Poisson $f$，G-EDM 产生更窄的区间，但其覆盖率仅 60.2%，而 C-EDM 为 85.9%。C-EDM 在 KS 的三项诊断上都领先：更低 CRPS、更窄区间、覆盖率更接近 90%。NS 是例外，G-EDM 在相近覆盖率下取得更低 CRPS 与更窄区间。

集成标准差提供预测离散度的空间分辨度量。图 8 把其空间分布与代表性 Poisson $u$ 与 NS 案例的绝对重建误差比较。对两种 EDM 表述，预测离散度较大的区域与重建误差较大的区域大体重合。附录图 D1 与 D2 中 Poisson $f$ 与 KS 的更多示例显示类似的空间对应。综合来看，表 3 与图 8 通过各位置的预测诊断以及集成离散度与重建误差之间的空间关系刻画了不确定性。

### 4.5 先验引导采样成本高且对引导参数敏感

G-EDM 的采样步数与引导权重在各基准上按验证数据分别选择（详见附录 E）。验证误差对其组合敏感，且更强的引导或更多采样步都不会一致改善重建精度。选定配置为：Poisson $(N,\zeta_u,\zeta_f)=(400,10,20)$，NS $(N,\zeta)=(1{,}600,5)$，KS $(N,\zeta)=(1{,}600,70)$。把 Poisson 的步数从 400 增至 800 没有进一步改善；对 NS，把步数从 1,600 增至 2,000 只使验证误差降低 1.3%，而采样成本增加 25%。

在最终采样配置下，表 4 比较三种重建表述的逐成员推理成本。U-Net 对每个重建只需一次网络评估；C-EDM 对 Poisson 与 NS 用 40 个采样步、对 KS 用 20 个采样步，对应每成员 79 与 39 次去噪器评估；G-EDM 对 Poisson 用 400 个采样步、对 NS 与 KS 用 1,600 个采样步，对应每成员 799—3,199 次去噪器评估。此外，每个 G-EDM 采样步都需要一次观测梯度评估。由此得到的逐成员延迟：C-EDM 为 U-Net 基线的 43—87 倍，G-EDM 为 1,439—6,604 倍。与 C-EDM 相比，G-EDM 的逐成员延迟在 Poisson 上约高 20 倍、NS 上 75 倍、KS 上 154 倍。

所有基于集成的结果对两种 EDM 表述都用 $N_{\mathrm{ens}}=32$。该共同集成规模是依据附录 F 报告的 C-EDM 验证结果选定的：集成均值重建误差在超过 16 个成员后改善递减，而某些不确定性估计仍在改善，这支持在报告的对比中使用 32 个成员。采样轨迹相互独立，可沿批维并行评估，尽管每条轨迹内的去噪步仍为串行。因此，32 成员集成的墙钟时间并不是表 F1 中批大小为 1 的延迟的 32 倍，而是取决于可用的批并行度与设备显存。总体而言，C-EDM 直接建模以观测为条件的分布，以远少的采样步产生集成重建，同时保持有竞争力的重建精度与一般更可靠的不确定性估计；G-EDM 则在更长采样轨迹上施加基准特定的观测引导，并对观测掩码分布漂移表现出更低敏感性。

## 5. 讨论

重建精度在确定性回归、条件生成与先验引导生成之间并不存在普遍排序。领先表述随被重建场与工作区制而变，且既非场复杂度升高、也非观测密度降低会系统性使生成式重建占优。因此，仅凭问题难度无法决定生成方法是否更可取。当目标是以低推理成本获得单个准确重建时，确定性回归仍是强选择；而扩散模型能从同一稀疏观测生成多个可能重建，提供集成预测与表征预测不确定性的自然基础。

集成均值与单个成员代表不同的科学输出。在两种 EDM 表述中，集成平均一致降低相位对齐误差，而单个成员在特定场与区制中更接近高波数功率。这一对比可能源于成员特有的高波数成分在平均中相互抵消。由于对数功率指标对相位不敏感，逐成员优势涉及谱幅度而非细尺度结构的空间位置。因此当逐点一致性为主时集成均值更合适，而对预测变异性与相位不敏感的光谱统计，成员分布信息更丰富。

两种 EDM 表述以根本不同的方式纳入观测。在条件生成中，C-EDM 在训练时把观测条件化摊销到模型中，从而允许短得多的采样轨迹，其不确定性估计也一般更可靠。在先验引导生成中，G-EDM 独立于观测学习全场先验，并在测试时通过引导施加观测掩码；这种分离与其对所测试掩码分布漂移的更低敏感性一致。然而 G-EDM 需要更长的采样轨迹、显著更高的推理成本与基准特定的引导选择。因此偏好的表述取决于所需输出、可预期的观测过程与可用计算预算。

关于更现实的观测与物理设置仍有若干问题。掩码漂移分析只覆盖有限的空间分布，且时空掩码随时间固定、测量无噪声。对时变感知、含噪观测与三维场的泛化仍未解决。评估也没有直接检验重建场是否满足控制方程、守恒律或边界条件。未来工作应把比较扩展到含噪三维系统与更广泛的空间和时间感知几何，并施加物理一致性。

## 6. 结论

本文研究了在稀疏观测下的物理场重建中，何时基于扩散的生成式重建比确定性回归更可取。为此我们对三种架构匹配的表述做受控比较：确定性 U-Net、条件 EDM（C-EDM）与先验引导 EDM（G-EDM）。比较覆盖来自二维 Poisson 方程、二维 Navier–Stokes 流与一维 Kuramoto–Sivashinsky 动力学的四个重建目标，并在场复杂度、观测密度与掩码分布上做受控变化。

结果表明，稀疏物理场重建不存在普遍更优的确定性或生成式表述。重建精度取决于被重建场与工作区制，且更大的场复杂度或更稀疏的观测都不会一致地使扩散模型占优。当目标是单个准确重建时，确定性回归仍是强力的低成本选项；而扩散模型提供可能重建的集成，在不确定性、样本多样性或对变化感知条件的鲁棒性重要时有用。

集成结果进一步表明，生成分布的不同汇总服务于不同目的：集成均值取得更低相位对齐误差，可视为方差缩减的点估计；而单个样本在特定场与区制中更好地保持变异性与高波数功率。C-EDM 与 G-EDM 的比较也揭示了在如何纳入观测上的不同权衡：C-EDM 一般以显著更低的推理成本提供更可靠的不确定性估计，而 G-EDM 对所测试的掩码分布漂移最不敏感，但需要更长采样与引导权重调参。

综合来看，这些发现澄清了生成式重建的价值不在于普遍更好的逐点精度，而在于其分布输出如何被使用。它们为按所需科学输出、可预期感知条件与计算预算选择重建方法提供了实用指导，也为未来稀疏重建方法提示了具体方向，包括改进确定性方法的不确定性估计、在条件生成模型中保持细尺度样本变异性，以及降低先验引导方法的采样成本与引导敏感性。

## 致谢与各项声明

**致谢。** 本工作受国家自然科学基金（No. 62506367 与 No. 62276269）与北京市自然科学基金（No. F261002）资助。

**AI 使用声明。** 在撰写本手稿期间，H.Z. 使用 OpenAI Codex（GPT-5.6, OpenAI）改进作者撰写文本的语言、清晰度与流畅性。所有 AI 辅助的修改均由作者严格审阅与修订。作者对手稿的原创性、准确性与完整性（包括其参考文献）承担全部责任。

**数据可用性声明。** 支持本研究结论的数据可在合理请求下从通讯作者处获取。

**代码可用性声明。** 用于模型训练、重建与评估的源代码可在合理请求下从通讯作者处获取。

**利益冲突声明。** 作者未报告潜在的利益冲突。

## 图注与表注

### 表 1：全场相对 $\ell_2$ 误差（%）均值（原 PDF 第 9 页）

最佳与次佳结果分别以加粗与下划线标出。表中数值与渲染图核对一致。

| 场 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|
| Poisson 解 $u$ | 0.2132 | **0.2078** | 0.2980 | 0.3705 | 0.4905 |
| Poisson 源 $f$ | **8.3462** | 8.9191 | 12.5897 | 11.2882 | 13.6826 |
| NS 涡量 $\omega$ | 1.9707 | 2.1200 | 2.8550 | **1.4318** | 1.8343 |
| KS 状态 $u$ | **2.0630** | 2.1991 | 3.2794 | 4.5670 | 6.6020 |

### 表 2：高频（$k\geq8$）对数功率误差 $D_H^{\log P}$（原 PDF 第 11 页）

对 Poisson $f$ 跨 $k_c$、对 NS $\omega$ 跨 $Re$，在测试案例与观测比例上平均；最佳与次佳分别加粗与下划线。

| 场 | 区制 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|---|
| Poisson $f$ | $k_c=1$ | 0.3586 | 0.3348 | **0.0630** | 0.2235 | 0.1509 |
| Poisson $f$ | $k_c=2$ | 0.3356 | 0.3170 | **0.0600** | 0.2460 | 0.1447 |
| Poisson $f$ | $k_c=4$ | 0.2940 | 0.2918 | **0.0570** | 0.2392 | 0.0926 |
| Poisson $f$ | $k_c=6$ | 0.2703 | 0.2778 | **0.0557** | 0.2256 | 0.0704 |
| NS $\omega$ | $Re=10^3$ | 6.2367 | 6.1541 | 6.8390 | 6.2545 | 6.4540 |
| NS $\omega$ | $Re=10^4$ | 0.5889 | 0.6137 | 0.7922 | **0.5128** | 0.6448 |
| NS $\omega$ | $Re=10^5$ | 0.1674 | 0.1646 | 0.0625 | 0.1204 | **0.0371** |

### 表 3：配对 5% 均匀掩码下未观测位置的经验不确定性估计（$N_{\mathrm{ens}}=32$；原 PDF 第 15 页）

| 场 | 方法 | $N_{\mathrm{case}}$ | CRPS↓ | 覆盖率(%)→90 | 90% 区间宽度 |
|---|---|---|---|---|---|
| Poisson $u$ | C-EDM | 200 | **0.0013** | **84.9** | **0.0064** |
| Poisson $u$ | G-EDM | 200 | 0.0020 | 61.2 | 0.0068 |
| Poisson $f$ | C-EDM | 200 | **0.0656** | **85.9** | 0.3506 |
| Poisson $f$ | G-EDM | 200 | 0.0871 | 60.2 | **0.3000** |
| NS $\omega$ | C-EDM | 150 | 0.0158 | **87.6** | 0.0726 |
| NS $\omega$ | G-EDM | 150 | **0.0105** | 87.2 | **0.0486** |
| KS $u$ | C-EDM | 250 | **0.0220** | **93.9** | **0.1578** |
| KS $u$ | G-EDM | 250 | 0.0411 | 79.1 | 0.3307 |

### 表 4：最终采样配置下的逐成员推理成本（批大小 1、NVIDIA RTX 4090；相对延迟以相应 U-Net 延迟归一化；原 PDF 第 17 页）

| 数据集 | 方法 | 步数 | 去噪器评估 | 观测梯度评估 | 延迟 (s) | 相对延迟 |
|---|---|---|---|---|---|---|
| Poisson | U-Net | – | 1 | 0 | 0.0140 | 1× |
| Poisson | C-EDM | 40 | 79 | 0 | 1.0097 | 72× |
| Poisson | G-EDM | 400 | 799 | 400 | 20.17 | 1,439× |
| NS | U-Net | – | 1 | 0 | 0.0107 | 1× |
| NS | C-EDM | 40 | 79 | 0 | 0.9368 | 87× |
| NS | G-EDM | 1,600 | 3,199 | 1,600 | 70.13 | 6,555× |
| KS | U-Net | – | 1 | 0 | 0.0140 | 1× |
| KS | C-EDM | 20 | 39 | 0 | 0.6014 | 43× |
| KS | G-EDM | 1,600 | 3,199 | 1,600 | 92.26 | 6,604× |

### 图注

**图 1（原 PDF 第 4 页）：** 三种架构匹配的稀疏观测物理场重建表述。(a) U-Net 把零填充观测与掩码直接映射为单一重建；(b) C-EDM 在每次去噪评估上以观测与掩码为条件；(c) G-EDM 学习全场先验，并在采样时通过基于梯度的修正纳入观测。

**图 2（原 PDF 第 9 页）：** 跨场复杂度区制的全场相对 $\ell_2$ 误差均值：(a) Poisson $u$、(b) Poisson $f$、(c) NS $\omega$、(d) KS $u$。数值在每个复杂度设置下对五个观测比例平均；阴影为独立场或轨迹上的 95% 置信区间。

**图 3（原 PDF 第 11 页）：** 主评估中最具挑战性设置的重建与误差分布：Poisson 为 5% 观测且 $k_c=6$，NS 为 $Re=10^5$，KS 为 $\nu\in[0.5,0.7)$。(a)—(d) 对每个目标随机选取一个测试案例，比较稀疏观测、真值与重建；(e)—(h) 汇总全部 50 个测试案例的配对全场相对 $\ell_2$ 误差。

**图 4（原 PDF 第 12 页）：** 四个重建目标的逐频带相位对齐谱系数误差 $\varepsilon_b^{\mathrm{spec}}$ 均值。数值在场复杂度设置与主评估的五个观测比例上平均；误差棒为配对自助法 95% 置信区间。

**图 5（原 PDF 第 13 页）：** 5% 观测下选定案例（Poisson $f$ 取 $k_c=6$、NS $\omega$ 取 $Re=10^5$）的光谱诊断与重建。(a)(b) 为归一化谱，(c)(d) 为逐波数对数功率误差；浅色曲线表示单个 EDM 成员，高亮曲线为其逐点中位谱（a、b）与平均误差（c、d），附 10—90 分位误差带。(e) 比较 Poisson $f$ 真值与两种 EDM 表述的集成均值及一个成员。

**图 6（原 PDF 第 14 页）：** 固定 5% 观测数下的掩码分布：(a) 均匀随机；(b) 高斯+均匀（集群与均匀采样传感器结合）；(c) 方向性偏置（传感器集中在一半区域）；(d) 块缺失（留出一块方形未观测区域）。

**图 7（原 PDF 第 14 页）：** 5% 观测下对掩码分布漂移的敏感性。(a)—(c) 相对各方法均匀掩码基线的全场相对 $\ell_2$ 误差平均配对增量（百分点），附 95% 自助法置信区间；(d) 同一 Poisson $f$ 测试场在均匀与块缺失掩码下的重建对比，标注为全场相对 $\ell_2$ 误差。

**图 8（原 PDF 第 16 页）：** 代表性 Poisson $u$ 与 NS $\omega(t_6)$ 场在 5% 均匀采样观测下的空间不确定性。面板给出观测、真值、集成均值、绝对误差与标准差（两种 EDM 表述，$N_{\mathrm{ens}}=32$）；误差与标准差按相应真值场的 RMS 幅度归一化。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] Brunton SL, Noack BR, Koumoutsakos P. Machine learning for fluid mechanics. Annual Review of Fluid Mechanics. 2020;52:477–508.

[2] Lu PY, Ariño Bernad J, Soljačić M. Discovering sparse interpretable dynamics from partial observations. Communications Physics. 2022;5:206.

[3] Course K, Nair PB. State estimation of a physical system with unknown governing equations. Nature. 2023;622:261–267.

[4] Berkooz G, Holmes P, Lumley JL. The proper orthogonal decomposition in the analysis of turbulent flows. Annual Review of Fluid Mechanics. 1993;25:539–575.

[5] Everson R, Sirovich L. Karhunen–loève procedure for gappy data. Journal of the Optical Society of America A. 1995;12(8):1657–1664.

[6] Willcox K. Unsteady flow sensing and estimation via the gappy proper orthogonal decomposition. Computers & Fluids. 2006;35(2):208–226.

[7] Donoho DL. Compressed sensing. IEEE Transactions on Information Theory. 2006;52(4):1289–1306.

[8] Callaham JL, Maeda K, Brunton SL. Robust flow reconstruction from limited measurements via sparse representation. Physical Review Fluids. 2019;4(10):103907.

[9] Erichson NB, Mathelin L, Yao Z, et al. Shallow neural networks for fluid flow reconstruction with limited sensors. Proceedings of the Royal Society A: Mathematical, Physical and Engineering Sciences. 2020;476(2238):20200097.

[10] Nair NJ, Goza A. Leveraging reduced-order models for state estimation using deep learning. Journal of Fluid Mechanics. 2020;897:R1.

[11] Dubois P, Gomez T, Planckaert L, et al. Machine learning for fluid flow reconstruction from limited measurements. Journal of Computational Physics. 2022;448:110733.

[12] Fukami K, Fukagata K, Taira K. Super-resolution reconstruction of turbulent flows with machine learning. Journal of Fluid Mechanics. 2019;870:106–120.

[13] Mo Y, Magri L. Reconstructing unsteady flows from sparse, noisy measurements with a physics-constrained convolutional neural network. Physical Review Fluids. 2025;10(3):034901.

[14] Zhang Q, Krotov D, Karniadakis GE. Operator learning for reconstructing flow fields from sparse measurements: An energy transformer approach. Journal of Computational Physics. 2025;538:114148.

[15] Fukami K, Maulik R, Ramachandra N, et al. Global field reconstruction from sparse sensors with Voronoi tessellation-assisted deep learning. Nature Machine Intelligence. 2021;3(11):945–951.

[16] Santos JE, Fox ZR, Mohan A, et al. Development of the Senseiver for efficient field reconstruction from sparse observations. Nature Machine Intelligence. 2023;5(11):1317–1325.

[17] Luo X, Xu W, Nadiga BT, et al. Continuous field reconstruction from sparse observations with implicit neural networks. In: International Conference on Learning Representations; 2024.

[18] Sun G, Miao T, Huang H, et al. Geometry-aware neural optimizer for shape optimization and inversion. In: Forty-third International Conference on Machine Learning; 2026. Available from: https://openreview.net/forum?id=PTaUjEBHat.

[19] Raissi M, Perdikaris P, Karniadakis GE. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics. 2019;378:686–707.

[20] Raissi M, Yazdani A, Karniadakis GE. Hidden fluid mechanics: Learning velocity and pressure fields from flow visualizations. Science. 2020;367(6481):1026–1030.

[21] Stuart AM. Inverse problems: A bayesian perspective. Acta Numerica. 2010;19:451–559.

[22] Kingma DP, Welling M. Auto-encoding variational bayes. In: International Conference on Learning Representations; 2014. Available from: https://arxiv.org/abs/1312.6114.

[23] Goodfellow IJ, Pouget-Abadie J, Mirza M, et al. Generative adversarial nets. In: Advances in Neural Information Processing Systems; Vol. 27; 2014.

[24] Ho J, Jain AN, Abbeel P. Denoising diffusion probabilistic models. In: Advances in Neural Information Processing Systems; Vol. 33; 2020. p. 6840–6851.

[25] Song Y, Sohl-Dickstein J, Kingma DP, et al. Score-based generative modeling through stochastic differential equations. In: International Conference on Learning Representations; 2021.

[26] Lipman Y, Chen RTQ, Ben-Hamu H, et al. Flow matching for generative modeling. In: International Conference on Learning Representations; 2023.

[27] Gundersen K, Oleynik A, Blaser N, et al. Semi-conditional variational auto-encoder for flow reconstruction and uncertainty quantification from limited observations. Physics of Fluids. 2021;33(1):017119.

[28] Güemes A, Sanmiguel Vila C, Discetti S. Super-resolution generative adversarial networks of randomly-seeded fields. Nature Machine Intelligence. 2022;4(12):1165–1173.

[29] Du P, Parikh MH, Fan X, et al. Conditional neural field latent diffusion model for generating spatiotemporal turbulence. Nature Communications. 2024;15:10416.

[30] Zhou H, Zhang R, Wan H, et al. PerFlow: Physics-embedded rectified flow for efficient reconstruction and uncertainty quantification of spatiotemporal dynamics. arXiv. 2026; Available from: https://arxiv.org/abs/2605.03548.

[31] Oommen V, Khodakarami S, Bora A, et al. Learning turbulent flows with generative models for super resolution and sparse flow reconstruction. Nature Communications. 2026;17:3707.

[32] Shysheya A, Diaconu C, Bergamin F, et al. On conditional diffusion models for PDE simulations. In: Advances in Neural Information Processing Systems; Vol. 37; 2024. p. 23246–23300.

[33] Baldassari L, Siahkoohi A, Garnier J, et al. Conditional score-based diffusion models for bayesian inference in infinite dimensions. In: Advances in Neural Information Processing Systems; Vol. 36; 2023. p. 24262–24290.

[34] Li Z, Dou H, Fang S, et al. Physics-aligned field reconstruction with diffusion bridge. In: International Conference on Learning Representations; 2025.

[35] Chung H, Kim J, McCann MT, et al. Diffusion posterior sampling for general noisy inverse problems. In: International Conference on Learning Representations; 2023.

[36] Shu D, Li Z, Barati Farimani A. A physics-informed diffusion model for high-fidelity flow field reconstruction. Journal of Computational Physics. 2023;478:111972.

[37] Li Z, Han W, Zhang Y, et al. Learning spatiotemporal dynamics with a pretrained generative model. Nature Machine Intelligence. 2024;6(12):1566–1579.

[38] Huang J, Yang G, Wang Z, et al. DiffusionPDE: Generative PDE-solving under partial observation. In: Advances in Neural Information Processing Systems; Vol. 37; 2024. p. 130291–130323.

[39] Amorós-Trepat M, Medrano-Navarro L, Liu Q, et al. Guiding diffusion models to reconstruct flow fields from sparse data. Physics of Fluids. 2026;38(1):015112.

[40] Ronneberger O, Fischer P, Brox T. U-Net: Convolutional networks for biomedical image segmentation. In: Medical Image Computing and Computer-Assisted Intervention; 2015. p. 234–241.

[41] Karras T, Aittala M, Aila T, et al. Elucidating the design space of diffusion-based generative models. In: Advances in Neural Information Processing Systems; Vol. 35; 2022. p. 26565–26577.

[42] Li Z, Kovachki N, Azizzadenesheli K, et al. Fourier neural operator for parametric partial differential equations. In: International Conference on Learning Representations; 2021.

[43] Lippe P, Veeling BS, Perdikaris P, et al. PDE-Refiner: Achieving accurate long rollouts with neural PDE solvers. In: Advances in Neural Information Processing Systems; Vol. 36; 2023. p. 67398–67433.

## 附录 A：实验细节与指标实现（原 PDF 第 22—24 页）

本附录给出第 3、4 节所报告实验的数据集构造、评估面板、模型架构、训练与采样配置以及指标实现细节。

### A.1 数据集与划分

表 A1 汇总数据集维度、划分规模与标准测试面板。划分规模统计独立场或轨迹数，而测试案例数统计带掩码的重建条件；没有完整场或轨迹在划分间共享。

对 Poisson，式（10）中的源在正交 DCT 基中生成：$\hat f_k=a_k\xi_k$，其中 $\xi_k\sim\mathcal N(0,1)$、$a_k\propto(1+\|k\|_2^2/k_c^2)^{-1}$。增大 $k_c$ 使源能量更多保留在高波数。零模被移除，谱滤波器归一化为单位期望 RMS；每个划分在四个 $k_c$ 值上均衡。

对 NS，式（11）中的固定强迫为 $q(s)=0.1[\sin(2\pi(s_1+s_2))+\cos(2\pi(s_1+s_2))]$。我们使用发布的 Fourier 神经算子轨迹 [42]，$\nu\in\{10^{-3},10^{-4},10^{-5}\}$（$Re=\nu^{-1}\in\{10^3,10^4,10^5\}$），保留的十帧对应无量纲时间 $t=5,\ldots,14$。对每个黏性，轨迹索引 0—999、1000—1099、1100—1199 分别构成训练、验证与测试划分。

对 KS，我们使用 PDE-Refiner [43] 随发布的参数相关 HDF5 数据集（$\nu\in[0.5,1.5]$），保留原始训练/验证/测试划分。域长与时间步长随轨迹变化；我们保留前 128 个时间步与全部 256 个空间点（不插值），并用边界 $\{0.5,0.7,0.9,1.1,1.3,1.5\}$ 把 $\nu$ 分为五个区间。

### A.2 观测与评估面板

U-Net 与 C-EDM 的训练掩码在线生成：对每个训练样本，观测比例从 $\{5,8,10,15,20\}$% 中均匀抽取，随后无放回采样观测位置。Poisson 对 $u$ 与 $f$ 使用相同位置；NS 与 KS 在每个时间窗口内使用一套空间传感器。验证与测试掩码由种子固定并在各方法间共享。

标准 Poisson 测试面板在每个 $k_c$ 下含 50 个独立生成的场，在全部五个观测比例上评估，共 1,000 个重建条件。NS 与 KS 面板每个参数区制含 50 条轨迹，每条轨迹在五个观测比例上评估，分别得到 750 与 1,250 个重建条件。

附加观测比例面板在 200 个 Poisson 场、150 条 NS 轨迹与 250 条 KS 轨迹上评估 3% 与 12% 掩码：3% 设置外推到训练范围以下，12% 设置在其内部插值。Poisson 源频率泛化用 $k_c=3.5$ 与 $k_c=8$ 各 50 个新场、覆盖全部五个标准观测比例评估。掩码分布鲁棒性在 200 个 Poisson 场与 150 条 NS 轨迹上以 5% 观测评估，每个漂移掩码与同一场或轨迹上的均匀掩码配对；KS 因一维空间传感器没有这些二维掩码漂移的直接对应而被排除。漂移掩码分布在附录 C 中定义。

### A.3 架构、训练与采样配置

所有方法使用架构匹配的 U-Net 主干，约 1,430 万参数。每个主干的基础宽度为 64、通道乘子为 $(1,2,2,4)$、每层两个残差块、在分辨率 16 处使用注意力、dropout 0.1。优化使用 Adam，初始学习率 $2\times10^{-4}$、批大小 32、自动混合精度、梯度裁剪范数 1、EMA 半衰期 50,000 个训练场。学习率预热五个 epoch，并在第 750 个 epoch 前衰减到 $2\times10^{-5}$。所有模型以种子 0 训练。

对两种 EDM 表述，$\sigma_{\mathrm{data}}=1$，训练噪声水平遵循 $\log\sigma\sim\mathcal N(-0.5,1.2^2)$。采样在 $\sigma\in[0.002,80]$ 上使用 Karras 调度，$\rho=7$。Poisson 变量按通道分别标准化，NS 与 KS 使用一个全局均值与标准差；所有归一化统计量由训练划分计算。

表 A2 报告训练预算、按验证性能选出的 EMA 检查点与测试时采样配置。对 G-EDM，引导乘子在采样步的最后 20% 固定为 $r_i=0.1$。附录 E 详述采样步数与引导权重的选择。所有报告的 EDM 集成使用 $N_{\mathrm{ens}}=32$，相应的集成规模分析见附录 F。

### A.4 指标实现

在计算重建与光谱指标之前，观测位置的预测值按式（A1）替换为相应测量：

$$
\hat x_0^{\mathrm{eval}}=y+(1-M)\odot\hat x_0.\tag{A1}
$$

重建与光谱误差在跨测试案例平均之前按各变量的物理单位计算；概率指标只用未观测位置的标准化值计算。

对方法 $m$ 与漂移掩码分布 $g$，掩码敏感性按每个配对测试案例计算 $\Delta\varepsilon_{m,g}=\varepsilon_{m,g}-\varepsilon_{m,\mathrm{uniform}}$；两个掩码都含 5% 观测，报告值为跨测试案例的平均配对差。对任意标量重建指标 $d$，从逐成员统计均值到集成均值统计的相对降低按 $100(d_{\mathrm S}-d_{\mathrm E})/d_{\mathrm S}$ 计算。

式（16）中的变换 $T$ 依基准而定：Poisson $u$ 对内部场使用 I 型离散正弦变换（与其齐次 Dirichlet 边界条件一致），Poisson $f$ 使用 II 型离散余弦变换。对 NS 与 KS 保留时间维，$T$ 在每个时间步上独立作用于空间：NS 使用二维空间 Fourier 变换，KS 使用一维空间 Fourier 变换并保留模式 $1\leq k\leq60$。频带范数随后在时间上累加系数误差。对二维场，径向功率通过在每个整数波数壳内对系数幅值平方求和得到；数据集特定频带见附录图 B1。

由于频带构成 $\mathcal K$ 的互斥划分并共享同一全谱分母，式（16）满足

$$
\left(\varepsilon_{\mathrm{all}}^{\mathrm{spec}}\right)^2=\sum_b\left(\varepsilon_b^{\mathrm{spec}}\right)^2.\tag{A2}
$$

因此每个频带保持其对全谱系数误差的贡献。对数功率指标则在功率归一化后对逐波数差异取平均，不按各频带对总谱能量的贡献加权。

对未观测位置上的标准化标量目标 $x$ 与集成预测 $\{\hat x^{(m)}\}_{m=1}^{N_{\mathrm{ens}}}$，经验连续排序概率分数为

$$
\mathrm{CRPS}=\frac{1}{N_{\mathrm{ens}}}\sum_{m=1}^{N_{\mathrm{ens}}}\left|\hat x^{(m)}-x\right|-\frac{1}{2N_{\mathrm{ens}}^2}\sum_{m=1}^{N_{\mathrm{ens}}}\sum_{n=1}^{N_{\mathrm{ens}}}\left|\hat x^{(m)}-\hat x^{(n)}\right|.\tag{A3}
$$

CRPS 先在未观测条目上平均、再在测试案例上平均。中心 90% 预测区间由经验 0.05 与 0.95 分位数构成；其覆盖率为落在区间内的未观测目标比例，宽度为两个分位数的平均差。

逐输出推理延迟在 NVIDIA RTX 4090 上以批大小 1、混合精度测量，并在每个推理图预热后计时；测量排除数据加载、指标计算与文件 I/O。神经函数评估次数统计去噪器调用；对 G-EDM，观测梯度修正另计为梯度评估。图中所示 95% 置信区间由配对自助重采样计算，以独立场或轨迹为采样单元。

## 附录 B：光谱结果与指标敏感性（原 PDF 第 24—26 页）

数据集特定频带依据图 B1 所示的真值归一化功率谱选取。对 Poisson 与 NS，低、中、高频带为 $0\leq k<4$、$4\leq k<8$ 与 $k\geq8$；对 KS，相应频带为 $1\leq k<5$、$5\leq k<13$ 与 $13\leq k\leq60$。Poisson $u$ 与 NS $\omega$ 由低频能量主导，而 Poisson $f$ 与 KS $u$ 在中高频带含更大能量比例。表 B1—B3 报告全部复杂度区制与频带的 $D_b^{\log P}$，包括表 2 所汇总的高频结果。

**表 A1：数据集维度、独立划分与标准测试面板（原 PDF 第 22 页）**

| 数据集 | 重建场 | 复杂度设置 | 分辨率 | 训练/验证/测试 | 测试案例 |
|---|---|---|---|---|---|
| Poisson $(u,f)$ | $k_c\in\{1,2,4,6\}$ | $2\times128\times128$ | 5000/1000/1000 | 1000 |
| NS $\omega(t,x,y)$ | $Re\in\{10^3,10^4,10^5\}$ | $10\times64\times64$ | 3000/300/300 | 750 |
| KS $u(t,x)$ | $[0.5,1.5]$ 内五个 $\nu$ 区间 | $1\times128\times256$ | 4096/256/512 | 1250 |

注：原表"复杂度设置"与"分辨率"两列位置按原文排版给出；表中数值与原文一致。

**表 A2：训练 epoch、用于评估的 EMA 检查点与采样配置（原 PDF 第 23 页）**

U、C、G 分别表示 U-Net、C-EDM 与 G-EDM；Poisson 引导权重记为 $(\zeta_u,\zeta_f)$。

| 数据集 | 训练 epoch U/C/G | EMA epoch U/C/G | C-EDM $N$ | G-EDM $(N,\zeta)$ |
|---|---|---|---|---|
| Poisson | 1000/1000/1000 | 1000/1000/1000 | 40 | $400,(10,20)$ |
| NS | 1500/1500/1500 | 1500/1470/1360 | 40 | $1600,5$ |
| KS | 1200/1200/1000 | 1200/1040/960 | 20 | $1600,70$ |

**表 B1：Poisson $u$ 与 $f$ 跨 $k_c$ 的逐频带对数功率误差 $D_b^{\log P}$（原 PDF 第 25 页）**

在测试场与观测比例上平均；最佳与次佳分别加粗与下划线。

| 场 | 区制 | 波数范围 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|---|---|
| Poisson $u$ | $k_c=1$ | $0\leq k<4$ | 0.00378 | 0.00973 | 0.00815 | **0.00067** | 0.00112 |
| Poisson $u$ | $k_c=1$ | $4\leq k<8$ | 0.00124 | **0.00111** | 0.00163 | 0.00139 | 0.00167 |
| Poisson $u$ | $k_c=1$ | $k\geq8$ | 0.2470 | **0.1268** | 0.1762 | 0.3032 | 0.4145 |
| Poisson $u$ | $k_c=2$ | $0\leq k<4$ | 0.00060 | 0.00117 | 0.00230 | **0.00015** | 0.00021 |
| Poisson $u$ | $k_c=2$ | $4\leq k<8$ | **0.00094** | 0.00101 | 0.00146 | 0.00120 | 0.00155 |
| Poisson $u$ | $k_c=2$ | $k\geq8$ | 0.2149 | **0.0963** | 0.1493 | 0.2818 | 0.3860 |
| Poisson $u$ | $k_c=4$ | $0\leq k<4$ | 0.00054 | 0.00115 | 0.00240 | **0.00032** | 0.00037 |
| Poisson $u$ | $k_c=4$ | $4\leq k<8$ | **0.00076** | **0.00077** | 0.00121 | 0.00119 | 0.00144 |
| Poisson $u$ | $k_c=4$ | $k\geq8$ | 0.1753 | **0.0730** | 0.1286 | 0.1996 | 0.2981 |
| Poisson $u$ | $k_c=6$ | $0\leq k<4$ | 0.00093 | 0.00174 | 0.00346 | **0.00079** | 0.00090 |
| Poisson $u$ | $k_c=6$ | $4\leq k<8$ | **0.00082** | 0.00084 | 0.00128 | 0.00211 | 0.00254 |
| Poisson $u$ | $k_c=6$ | $k\geq8$ | 0.1678 | **0.0739** | 0.1227 | 0.2147 | 0.3171 |
| Poisson $f$ | $k_c=1$ | $0\leq k<4$ | **0.00123** | 0.00128 | 0.00155 | 0.00156 | 0.00170 |
| Poisson $f$ | $k_c=1$ | $4\leq k<8$ | **0.00412** | 0.00405 | 0.00591 | 0.00620 | 0.00689 |
| Poisson $f$ | $k_c=1$ | $k\geq8$ | 0.3586 | 0.3348 | **0.0630** | 0.2235 | 0.1509 |
| Poisson $f$ | $k_c=2$ | $0\leq k<4$ | 0.00206 | 0.00214 | **0.00195** | 0.00229 | 0.00246 |
| Poisson $f$ | $k_c=2$ | $4\leq k<8$ | **0.00360** | 0.00392 | 0.00516 | 0.00607 | 0.00692 |
| Poisson $f$ | $k_c=2$ | $k\geq8$ | 0.3356 | 0.3170 | **0.0600** | 0.2460 | 0.1447 |
| Poisson $f$ | $k_c=4$ | $0\leq k<4$ | 0.00540 | 0.00599 | **0.00380** | 0.00799 | 0.00872 |
| Poisson $f$ | $k_c=4$ | $4\leq k<8$ | **0.00536** | 0.00618 | 0.00542 | 0.00820 | 0.00929 |
| Poisson $f$ | $k_c=4$ | $k\geq8$ | 0.2940 | 0.2918 | **0.0570** | 0.2392 | 0.0926 |
| Poisson $f$ | $k_c=6$ | $0\leq k<4$ | 0.0110 | 0.0129 | **0.00733** | 0.0145 | 0.0133 |
| Poisson $f$ | $k_c=6$ | $4\leq k<8$ | 0.0107 | 0.0124 | **0.00749** | 0.0133 | 0.0127 |
| Poisson $f$ | $k_c=6$ | $k\geq8$ | 0.2703 | 0.2778 | **0.0557** | 0.2256 | 0.0704 |

**表 B2：NS $\omega$ 跨 Reynolds 数的逐频带对数功率误差（原 PDF 第 26 页）**

| 场 | 区制 | 波数范围 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|---|---|
| NS $\omega$ | $Re=10^3$ | $0\leq k<4$ | 0.00240 | 0.00241 | 0.00435 | **0.00045** | 0.00064 |
| NS $\omega$ | $Re=10^3$ | $4\leq k<8$ | 0.1961 | 0.1229 | 0.3174 | **0.1155** | 0.1636 |
| NS $\omega$ | $Re=10^3$ | $k\geq8$ | 6.2367 | **6.1541** | 6.8390 | 6.2545 | 6.4540 |
| NS $\omega$ | $Re=10^4$ | $0\leq k<4$ | 0.00146 | 0.00188 | 0.00267 | **0.00054** | 0.00069 |
| NS $\omega$ | $Re=10^4$ | $4\leq k<8$ | 0.00937 | 0.0132 | 0.0119 | **0.00320** | 0.00346 |
| NS $\omega$ | $Re=10^4$ | $k\geq8$ | 0.5889 | 0.6137 | 0.7922 | **0.5128** | 0.6448 |
| NS $\omega$ | $Re=10^5$ | $0\leq k<4$ | 0.00286 | 0.00306 | 0.00382 | **0.00263** | 0.00303 |
| NS $\omega$ | $Re=10^5$ | $4\leq k<8$ | 0.0165 | 0.0207 | 0.0177 | **0.0105** | 0.0111 |
| NS $\omega$ | $Re=10^5$ | $k\geq8$ | 0.1674 | 0.1646 | 0.0625 | 0.1204 | **0.0371** |

**表 B3：KS $u$ 跨黏性区间的逐频带对数功率误差（原 PDF 第 26 页）**

| 场 | 区制 | 波数范围 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|---|---|
| KS $u$ | $\nu\in[0.5,0.7)$ | $1\leq k<5$ | **0.00636** | 0.0104 | 0.0140 | 0.0178 | 0.0257 |
| KS $u$ | $\nu\in[0.5,0.7)$ | $5\leq k<13$ | **0.00475** | 0.00778 | 0.0113 | 0.0140 | 0.0197 |
| KS $u$ | $\nu\in[0.5,0.7)$ | $13\leq k\leq60$ | 0.9301 | **0.5797** | 0.6930 | 0.9379 | 0.9988 |
| KS $u$ | $\nu\in[0.7,0.9)$ | $1\leq k<5$ | **0.00561** | 0.00685 | 0.00933 | 0.0166 | 0.0219 |
| KS $u$ | $\nu\in[0.7,0.9)$ | $5\leq k<13$ | **0.00394** | 0.00509 | 0.00715 | 0.0106 | 0.0139 |
| KS $u$ | $\nu\in[0.7,0.9)$ | $13\leq k\leq60$ | 1.5144 | **0.9481** | 1.1226 | 1.6035 | 1.6682 |
| KS $u$ | $\nu\in[0.9,1.1)$ | $1\leq k<5$ | 0.00571 | **0.00566** | 0.00869 | 0.0142 | 0.0193 |
| KS $u$ | $\nu\in[0.9,1.1)$ | $5\leq k<13$ | **0.00360** | 0.00537 | 0.00708 | 0.00870 | 0.0124 |
| KS $u$ | $\nu\in[0.9,1.1)$ | $13\leq k\leq60$ | 2.2203 | **1.4960** | 1.7430 | 2.3292 | 2.4199 |
| KS $u$ | $\nu\in[1.1,1.3)$ | $1\leq k<5$ | 0.00629 | **0.00507** | 0.00741 | 0.0155 | 0.0208 |
| KS $u$ | $\nu\in[1.1,1.3)$ | $5\leq k<13$ | 0.00412 | **0.00406** | 0.00623 | 0.00790 | 0.0118 |
| KS $u$ | $\nu\in[1.1,1.3)$ | $13\leq k\leq60$ | 2.7283 | **1.9064** | 2.1920 | 2.9233 | 2.9899 |
| KS $u$ | $\nu\in[1.3,1.5)$ | $1\leq k<5$ | 0.00608 | **0.00323** | 0.00548 | 0.0142 | 0.0191 |
| KS $u$ | $\nu\in[1.3,1.5)$ | $5\leq k<13$ | 0.00494 | **0.00261** | 0.00452 | 0.0101 | 0.0132 |
| KS $u$ | $\nu\in[1.3,1.5)$ | $13\leq k\leq60$ | 3.3289 | **2.3433** | 2.6807 | 3.5621 | 3.5890 |

### B.1 对光谱指标的敏感性

4.2 节的高频分析使用对数功率误差，它在对数尺度上度量每个波数的差异，对归一化功率很低的模式仍敏感。为检验方法排序是否依赖这种强调，我们还用相对 $\ell_2$ 距离比较单位总功率谱：

$$
R_{\tilde P}=\frac{\left\|\tilde P_{\mathrm{pred}}-\tilde P_{\mathrm{true}}\right\|_2}{\left\|\tilde P_{\mathrm{true}}\right\|_2}.\tag{B1}
$$

其分母是真值谱的全局范数而非逐波数归一化，因此 $R_{\tilde P}$ 主要由有能量模式的绝对差异驱动，对低功率谱尾不如 $D_b^{\log P}$ 敏感。

表 B4 报告各测试集平均的 $R_{\tilde P}$。G-EDM (E) 在 Poisson $u$ 与 NS $\omega$ 上距离最低，C-EDM (S) 在 Poisson $f$ 上最低，U-Net 在 KS $u$ 上最低。该排序与高频对数功率比较不同，说明有能量模式的恢复与低功率谱尾的恢复是谱重建的不同方面。

**表 B4：归一化功率谱之间的平均相对 $\ell_2$ 距离 $R_{\tilde P}$（原 PDF 第 27 页）**

| 场 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|
| Poisson $u$ | 3.586×10⁻⁴ | 6.811×10⁻⁴ | 1.220×10⁻³ | **2.786×10⁻⁴** | 3.454×10⁻⁴ |
| Poisson $f$ | 1.200×10⁻² | 1.362×10⁻² | **8.819×10⁻³** | 1.584×10⁻² | 1.578×10⁻² |
| NS $\omega$ | 1.464×10⁻³ | 1.669×10⁻³ | 1.713×10⁻³ | **9.437×10⁻⁴** | 1.034×10⁻³ |
| KS $u$ | **1.548×10⁻²** | 1.846×10⁻² | 2.704×10⁻² | 3.589×10⁻² | 5.046×10⁻² |

## 附录 C：观测过程鲁棒性与源频率泛化（原 PDF 第 27—30 页）

图 C1 在训练所用五个观测比例之外，扩展了 3% 的训练范围外外推与 12% 的插值。全场相对 $\ell_2$ 误差一般随观测比例增大而下降；两个附加比例都遵循邻近趋势，未改变方法排序。

图 C2 在 5% 观测下评估 Poisson 源频率泛化。$k_c=3.5$ 的插值遵循相邻训练频率之间的趋势，而 $k_c=8$ 的外推延续了超出训练上界的误差增长。C-EDM (E) 在 Poisson $u$ 上保持最低误差，U-Net 在 Poisson $f$ 上保持最低误差。

图 6 所示的掩码分布在固定 5% 观测数下于配对测试场或轨迹上评估，每个漂移掩码与同一测试案例上的均匀掩码比较。高斯—均匀掩码把一半传感器置于随机中心、单位域上标准差 0.1 的各向同性高斯簇中，其余传感器均匀采样。方向性掩码把 75% 传感器置于域的一半，四个方向在测试案例间均衡。块缺失掩码排除一个边长等于域 25% 的随机位置方形，其余传感器均匀采样；对 NS，同一掩码施加于每个时间帧，缺失块按周期边界回绕。

图 C3 给出 Poisson $u$ 在高斯—均匀掩码下、NS $\omega(t_6)$ 在方向性掩码下的更多配对重建。表 C1 报告均匀基线与三种漂移掩码分布下的平均全场相对 $\ell_2$ 误差，补充图 7 中相对基线的增量。

**表 C1：固定 5% 观测下均匀基线与三种漂移掩码分布的平均全场相对 $\ell_2$ 误差（%）（原 PDF 第 30 页）**

| 场 | 掩码 | U-Net | C-EDM (E) | C-EDM (S) | G-EDM (E) | G-EDM (S) |
|---|---|---|---|---|---|---|
| Poisson $u$ | 均匀 | 0.315 | **0.281** | 0.397 | 0.572 | 0.724 |
| Poisson $u$ | 高斯+均匀 | 3.096 | 1.934 | 2.091 | **1.140** | 1.454 |
| Poisson $u$ | 方向性偏置 | 0.782 | **0.632** | 0.806 | 0.874 | 1.114 |
| Poisson $u$ | 块缺失 | 4.428 | 8.007 | 8.337 | **1.068** | 1.355 |
| Poisson $f$ | 均匀 | **11.573** | 12.347 | 17.400 | 16.118 | 19.554 |
| Poisson $f$ | 高斯+均匀 | 25.728 | 20.815 | 26.985 | **20.771** | 26.151 |
| Poisson $f$ | 方向性偏置 | **13.950** | 14.877 | 20.645 | 18.303 | 22.658 |
| Poisson $f$ | 块缺失 | 24.298 | 37.023 | 41.695 | **17.133** | 20.936 |
| NS $\omega$ | 均匀 | 2.599 | 2.748 | 3.681 | **2.005** | 2.597 |
| NS $\omega$ | 高斯+均匀 | 3.672 | 3.615 | 4.843 | **2.621** | 3.459 |
| NS $\omega$ | 方向性偏置 | 3.116 | 3.213 | 4.356 | **2.222** | 2.901 |
| NS $\omega$ | 块缺失 | 2.802 | 2.928 | 3.966 | **2.099** | 2.720 |

## 附录 D：额外的空间不确定性示例（原 PDF 第 30—31 页）

图 D1 与 D2 把图 8 的空间不确定性分析扩展到相同 5% 均匀采样观测协议下的 Poisson $f$ 与 KS $u$。对每种 EDM 表述，图中比较集成标准差与绝对重建误差，二者都按相应真值场的 RMS 幅度归一化。两个示例中，集成离散度较大的区域都与重建误差较大的区域大体重合。

## 附录 E：先验引导采样参数选择（原 PDF 第 31—32 页）

G-EDM 采样参数在验证数据上选择。$N$ 表示采样步数，$\zeta$ 表示逐步观测引导权重；Poisson 对解场与源场使用不同权重 $(\zeta_u,\zeta_f)$。选择分数 $J_{\mathrm{val}}$ 是未观测位置上集成均值相对 $\ell_2$ 误差的宏平均：对 Poisson，该分数对两个重建场等权。观测位置归一化 RMSE 高于 0.1 的候选配置被丢弃。

参数选择分两阶段：每个配置先在均衡筛选面板上用每案例一个生成样本评估，有希望的配置再在更大且不相交的确认面板上用每案例四个样本评估。筛选与确认面板对 Poisson 分别含 40 与 200 个案例、NS 含 30 与 150、KS 含 25 与 125。验证掩码与采样种子在各配置间固定，最后 20% 的引导乘子也固定为 $r_i=0.1$。表 E1 与 E2 报告所评估的采样步数与引导权重组合。

**表 E1：为 Poisson 选择 G-EDM 采样步数与引导权重的验证结果（原 PDF 第 31 页）**

加粗表示每个选择阶段内最低的 $J_{\mathrm{val}}$，† 标记用于测试评估的配置。

| 阶段 | $N$ | 权重 | $J_{\mathrm{val}}$↓ | 观测位置 NRMSE↓ |
|---|---|---|---|---|
| 筛选 | 400 | (5,5) | 0.08502 | 0.00645 |
| 筛选 | 400 | (5,10) | 0.07906 | 0.01199 |
| 筛选 | 400 | (5,20) | 0.07659 | 0.02548 |
| 筛选 | 400 | (10,10) | 0.07866 | 0.01497 |
| 筛选 | 400 | (10,20) | **0.07653** | 0.02622 |
| 筛选 | 400 | (10,40) | 0.07836 | 0.04348 |
| 筛选 | 400 | (20,20) | 0.07890 | 0.03153 |
| 筛选 | 400 | (20,40) | 0.11623 | 0.05111 |
| 筛选 | 400 | (20,80) | 0.16804 | 0.09568 |
| 确认 | 40 | (25,50) | 0.09242 | 0.06528 |
| 确认 | 100 | (20,40) | 0.07019 | 0.04473 |
| 确认 | 200 | (10,20) | 0.06602 | 0.02493 |
| 确认 | 400† | (10,20) | **0.06570** | 0.02579 |
| 确认 | 800 | (9,19) | 0.06648 | 0.02369 |

**表 E2：为 NS 与 KS 选择 G-EDM 采样步数与引导权重的验证结果（原 PDF 第 32 页）**

两个基准都使用单一引导权重 $\zeta$。

(a) NS

| 阶段 | $N$ | 权重 | $J_{\mathrm{val}}$↓ | 观测位置 NRMSE↓ |
|---|---|---|---|---|
| 筛选 | 400 | 20 | 0.02207 | 0.01615 |
| 筛选 | 600 | 13 | 0.02083 | 0.01042 |
| 筛选 | 800 | 10 | 0.02032 | 0.00786 |
| 筛选 | 1,200 | 7 | 0.01983 | 0.00540 |
| 筛选 | 1,600 | 5 | 0.01959 | 0.00399 |
| 筛选 | 2,000 | 4 | **0.01946** | **0.00309** |
| 确认 | 40 | 50 | 0.05067 | 0.04081 |
| 确认 | 100 | 40 | 0.02457 | 0.03316 |
| 确认 | 200 | 20 | 0.01975 | 0.01653 |
| 确认 | 400 | 10 | 0.01809 | 0.00780 |
| 确认 | 1,200 | 7 | 0.01571 | 0.00524 |
| 确认 | 1,600† | 5 | **0.01536** | 0.00388 |
| 确认 | 2,000 | 4 | 0.01517 | **0.00309** |

(b) KS

| 阶段 | $N$ | 权重 | $J_{\mathrm{val}}$↓ | 观测位置 NRMSE↓ |
|---|---|---|---|---|
| 筛选 | 400 | 100 | 0.14791 | 0.09169 |
| 筛选 | 600 | 67 | 0.13173 | 0.06198 |
| 筛选 | 800 | 50 | 0.12064 | 0.04540 |
| 筛选 | 1,200 | 61 | 0.11331 | 0.05758 |
| 筛选 | 1,600 | 71 | **0.07691** | 0.05824 |
| 筛选 | 2,000 | 63 | 0.08018 | 0.05509 |
| 确认 | 40 | 63 | 0.49786 | 0.05453 |
| 确认 | 100 | 100 | 0.20732 | 0.09105 |
| 确认 | 200 | 100 | 0.11970 | 0.09202 |
| 确认 | 1,600† | 70 | **0.05241** | 0.06546 |

选定配置为：Poisson $(N,\zeta_u,\zeta_f)=(400,10,20)$，NS $(N,\zeta)=(1{,}600,5)$，KS $(N,\zeta)=(1{,}600,70)$。把 Poisson 采样步数从 400 增至 800 没有进一步改善；对 NS，从 1,600 增至 2,000 只使 $J_{\mathrm{val}}$ 降低 1.3%，而采样成本增加 25%，故保留 1,600 步配置；对 KS，验证分数在 1,600 步处达到最小。这些配置用于全部报告的测试评估与表 4 的推理成本测量。

## 附录 F：集成规模敏感性（原 PDF 第 32—33 页）

共同集成规模依据 C-EDM 的验证结果选择。均衡 Poisson 面板含 200 个场，$k_c$ 与观测比例的每个组合有十个案例。KS 面板含 125 条轨迹，黏性区间与观测比例的每个组合有五个案例。NS 面板含 30 条轨迹，在全部五个观测比例上评估，得到 150 个重建案例。验证场或轨迹、掩码与采样种子在各集成规模间固定。对每个案例生成一个 32 成员集成，较小集成规模用同一批成员的嵌套前缀评估。

表 F1 与图 F1 汇总集成规模的依赖关系。对 Poisson 与 NS，集成均值重建误差在 $N_{\mathrm{ens}}=32$ 之前持续下降，从 16 到 32 个成员的相对改善仅 1.4—1.7%。对 KS，集成均值重建误差在超过八个成员后没有一致改善；但 KS 的不确定性估计从 16 到 32 个成员仍有改善，经验覆盖率从 85.6% 升至 89.3%，归一化 CRPS 从 0.00778 降至 0.00758。因此尽管重建精度的收益递减，我们仍保留 $N_{\mathrm{ens}}=32$ 作为两种 EDM 表述的共同报告规模。

**表 F1：C-EDM 在均衡验证面板上的集成规模敏感性（原 PDF 第 33 页）**

$N_{\mathrm{data}}$ 表示独立场或轨迹数，$N_{\mathrm{case}}$ 表示重建条件数；对每个案例，较小集成规模使用相应 32 成员集成的嵌套前缀。

| 场 | $N_{\mathrm{data}}$ | $N_{\mathrm{case}}$ | $N_{\mathrm{ens}}=1$ | 2 | 4 | 8 | 16 | 32 |
|---|---|---|---|---|---|---|---|---|
| 集成均值全场相对 $\ell_2$ 误差（%；↓） | | | | | | | | |
| Poisson $u$ | 200 | 200 | 0.3149 | 0.2680 | 0.2383 | 0.2204 | 0.2124 | **0.2095** |
| Poisson $f$ | 200 | 200 | 12.6736 | 10.9102 | 9.9086 | 9.3714 | 9.0919 | **8.9416** |
| NS $\omega$ | 30 | 150 | 2.7567 | 2.4230 | 2.2171 | 2.1078 | 2.0559 | **2.0227** |
| KS $u$ | 125 | 125 | 3.8993 | 3.3000 | 2.9383 | **2.7599** | 2.8239 | 2.8134 |
| KS 未观测位置的分布指标 | | | | | | | | |
| 归一化 CRPS↓ | 125 | 125 | 0.01653 | 0.01203 | 0.00938 | 0.00778 | 0.00778 | **0.00758** |
| 90% 覆盖率（%）→90 | 125 | 125 | 0.0 | 32.1 | 60.3 | 77.2 | 85.6 | **89.3** |

### 附录图注

**图 B1（原 PDF 第 25 页）：** 划分为数据集特定低、中、高频带的归一化真值功率谱。曲线为测试集均值，阴影为 5—95 分位范围，标注给出各频带的平均能量占比（Poisson $u$：92.4%/7.2%/0.3%；Poisson $f$：62.4%/22.3%/15.3%；NS $\omega$：98.7%/1.0%/0.3%；KS $u$：10.4%/81.2%/8.4%）。

**图 C1（原 PDF 第 27 页）：** Poisson $u$ 与 $f$、NS $\omega$、KS $u$ 的全场相对 $\ell_2$ 误差随观测比例的变化。3% 设置外推到训练范围以下，12% 设置在训练比例之间插值；色带为配对自助法 95% 置信区间。

**图 C2（原 PDF 第 28 页）：** 5% 观测下全场相对 $\ell_2$ 误差随 Poisson 源频率参数 $k_c$ 的变化。$k_c=3.5$ 在训练频率之间插值，$k_c=8$ 外推到训练范围之外；色带为自助法 95% 置信区间。

**图 C3（原 PDF 第 29 页）：** 5% 观测下的配对重建与绝对误差图。(a) Poisson $u$ 在均匀与高斯—均匀掩码下；(b) NS $\omega(t_6)$ 在均匀与方向性掩码下。每行重建后附相应绝对误差图，标注为全场相对 $\ell_2$ 误差。

**图 D1（原 PDF 第 30 页）：** 代表性 Poisson $f$ 场在 $k_c=6$、5% 均匀采样观测下的空间不确定性。面板给出观测、真值、集成均值、绝对误差与标准差（两种 EDM 表述，$N_{\mathrm{ens}}=32$）。

**图 D2（原 PDF 第 31 页）：** 代表性 KS $u(t,x)$ 轨迹在 5% 均匀采样观测下的空间不确定性。面板给出观测、真值、集成均值、绝对误差与标准差（两种 EDM 表述，$N_{\mathrm{ens}}=32$）。

**图 F1（原 PDF 第 33 页）：** C-EDM 在均衡验证面板上集成均值全场相对 $\ell_2$ 误差随集成规模的变化（四个重建目标，对应表 F1）。

**本页范围与校对状态：** 本页依据 arXiv:2609.06135v1（physics.comp-ph，2026-09-05，33 页）完成全文中文翻译：摘要、关键词、第 1—6 节（含 2.1—2.4、3.1—3.3、4.1—4.5）、致谢与 AI 使用/数据/代码/利益冲突声明、图 1—8 中文图注、表 1—4 逐格转录、参考文献 [1]—[43] 英文原条目（按原编号）、附录 A—F（含式（A1）—（A3）与（B1）、表 A1/A2/B1—B4/C1/E1/E2/F1 逐格转录、图 B1/C1—C3/D1—D2/F1 图注）均按原文结构录入。编号公式 (1)—(17) 按原文保留。表 1 与表 4 已用 PDF 第 9、17 页渲染图逐格核对，数值一致；表 2、表 3 及附录各表按抽取文本转录。**逐句逐式终校未做**；图内曲线与场图未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①表 A1 的列排版（"复杂度设置"与"分辨率"列）在抽取文本中顺序交错，本页按渲染语义复原并已注明；②表 B1—B3 中部分"最佳/次佳"加粗与下划线标记在抽取文本中与数值相邻，本页按数值关系标注，个别并列情形以原文为准；③论文自述为预印本，数据与代码均"合理请求下提供"，已在对应声明中照录。原文为单栏预印本，无作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
