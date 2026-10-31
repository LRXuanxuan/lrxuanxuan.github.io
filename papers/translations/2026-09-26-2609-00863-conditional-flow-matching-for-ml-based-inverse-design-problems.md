---
layout: page
title: "面向机器学习逆向设计问题的条件流匹配｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-00863-conditional-flow-matching-for-ml-based-inverse-design-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/90e5f2836d6cbfa3/) · [原文 arXiv](https://arxiv.org/abs/2609.00863) · [全部目录](/papers/catalog/)

# 面向机器学习逆向设计问题的条件流匹配

**原题：** Conditional Flow Matching for ML-Based Inverse Design Problems  
**作者：** Juliana Felder$^{1,*}$、Milad Habibi$^{2,*}$、Soheyl Massoudi$^{1}$、Mark Fuge$^{1}$（$^{*}$ 同等贡献）  
**单位：** $^{1}$ 苏黎世联邦理工学院（ETH Zürich）；$^{2}$ 马里兰大学学院公园分校（University of Maryland, College Park）。邮箱：feldej@ethz.ch、mafuge@ethz.ch。  
**版本：** arXiv:2609.00863v1（cs.LG），2026 年 9 月 1 日；预印本日期 2026 年 9 月 2 日；原文 13 页（正文 + 参考文献 + 附录 A—B + 缩略语）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1—6 节（含 2 节各段、3.1—3.3、第 5 节讨论各段）、代码与工件可用性、图 1—2 中文图注、表 1—6 逐格转录、附录 A—B、缩略语、参考文献（作者—年格式，按原顺序）均按原文结构录入；逐句逐式终校未做。

## 摘要

工程逆向设计往往受制于求解偏微分方程（PDE）约束优化问题的迭代求解器的高计算成本，以及这些求解器对初始化的敏感性。深度生成模型可以在推理时不重跑仿真器而产生候选设计。生成对抗网络（GAN）在一次前向传播中采样，而扩散模型需要迭代的反向时间积分。本文把**条件流匹配（conditional flow matching, CFM）**加入 EngiOpt，并在 EngiBench 的结构（`beams2d`）与热学（`heatconduction2d`）基准上，用相同的下游优化协议，把它与条件扩散模型、条件生成对抗网络（cGAN）进行比较。我们以**累积最优性间隙（cumulative optimality gap, COG）**与**最终最优性间隙（final optimality gap, FOG）**作为主要指标，评价生成设计作为基于梯度的精化过程的"热启动"的有用性。在受评估的 EngiOpt 实现与两个 EngiBench 任务上，CFM 在两个任务上都取得最低的实测 COG、FOG、最大均值差异（MMD）与体积分数偏差。CFM 在 `beams2d` 与 `heatconduction2d` 上的平均体积分数偏差分别为 0.4% 与 1.0%，而扩散模型为 3.8% 与 11.2%。在 Euler $s=16$ 时，CFM 在 `beams2d` 上达到 53.2 样本/秒——约为同一计时协议下使用 1000 次网络评估的扩散基线实测吞吐的 66 倍——此时 COG 为 $1.182\pm3.126$，而 Euler $s=32$ 时为 $1.173\pm3.100$。跨两个任务，CFM 产生的热启动实测 COG 低于两个基线，且使用的网络评估次数少于扩散模型。

**关键词：** 工程逆向设计 · 流匹配 · 热启动 · 生成模型 · 工程优化

## 1 引言

工程逆向设计旨在寻找满足目标物理性能的几何形状——这一任务传统上由受昂贵物理仿真约束的迭代梯度优化求解 [Peckham et al., 2025, Habibi et al., 2026]。每次设计更新都需要一次仿真器调用，使得求解许多相关设计实例代价高昂 [Giannone et al., 2023]。生成模型提供了一条数据驱动的替代路径：在数值优化产生的参考设计上训练，它们逼近 $p(x\mid c)$，并在推理时无需重跑仿真器即可生成候选设计 [Regenwetter et al., 2022, Mazé and Ahmed, 2023]。其目标不是生成完全收敛的设计，而是提供一个下游优化器可在给定物理条件下精化的初始化。已有研究报告，扩散模型相对条件生成对抗网络（cGAN）具有更好的样本质量 [Mazé and Ahmed, 2023, Zhang et al., 2025, Habibi and Fuge, 2024]，但每个样本需要数百次网络评估，可能使生成变慢。我们在 EngiOpt [Felten et al., 2025] 中引入条件流匹配（CFM）作为新基线——与现有 cGAN 与扩散实现并列——用**确定性速度回归** [Lipman et al., 2023] 取代随机去噪。由于 CFM 与扩散共享同一条件 U-Net 主干，该比较限制了模型架构上的差异，聚焦于训练目标与采样过程。

我们追问：CFM 能否用比扩散更少的网络评估，生成有用的热启动，且种子间波动低于受评估的 cGAN 基线？我们的贡献是：

1. 面向 EngiOpt/EngiBench 的 CFM 基线，在相同数据划分、检查点选择流程与下游优化器下，与条件扩散和 cGAN 比较。
2. 一套以累积最优性间隙（COG）与最终最优性间隙（FOG）为中心的评价协议，通过优化轨迹而非仅靠分布指标来度量下游热启动效用。
3. 一项求解器与函数评估次数（NFE）消融：`beams2d` 的 COG 在 NFE$=16$ 时为 $1.182\pm3.126$、NFE$=32$ 时为 $1.173\pm3.100$，而 NFE$=16$ 达到约 64—66 倍于扩散的实测吞吐。

## 2 相关工作

基于物理的拓扑优化在更新材料分布的同时反复求解控制方程。这些重复分析使求解许多相关设计实例代价高昂 [Sigmund and Maute, 2013]。这一成本促使人们采用可预测或生成候选设计的机器学习方法 [Regenwetter et al., 2022]。我们回顾学习到的热启动、生成式逆向设计模型、扩散模型与流匹配。

**逆向设计。** 逆向设计寻找满足给定物理要求的几何形状或材料分布。应用包括结构与热拓扑优化、纳米光子学与气动设计 [Felten et al., 2025, Molesky et al., 2018, Shirvani et al., 2023]。结构与热拓扑优化通常表述为偏微分方程（PDE）约束问题。SIMP 等基于密度的方法通过交替进行物理分析与材料更新来迭代求解 [Sigmund, 2001]。尽管有效，但当需要为许多条件给出设计时，该流程可能非常昂贵。

**学习到的热启动。** 机器学习模型可通过把设计条件映射到候选材料分布来降低这一成本。直接预测已被用于结构与热拓扑优化 [Li et al., 2019, Lin et al., 2025]。其他方法把生成的设计作为初始化，把最终物理精化留给传统优化器 [Giannone et al., 2023, Habibi et al., 2026]。与参考设计的视觉相似并不必然意味着物理性能相当 [Habibi et al., 2025]。因此我们通过学习到的初始化对下游优化的影响来评估它们，同时报告分布指标。

**工程设计中的生成模型。** 工程逆向设计问题可能允许多个满足相同要求的设计。深度生成模型提供了表示这一条件设计分布的方式。cGAN 已被用于以载荷、边界条件或物理场为输入的拓扑优化 [Mirza and Osindero, 2014, Nie et al., 2021, Hertlein et al., 2021]。它们在单次前向传播中生成设计，但对抗训练可能不稳定且易受模式坍缩影响 [Goodfellow et al., 2014]。变分模型与其他生成模型也被用于生成多个候选以便后续评估或精化 [Oh et al., 2019, Yamasaki et al., 2021]。

**扩散模型。** 扩散模型通过学习反转一个逐步加噪过程来避免对抗训练 [Ho et al., 2020]。TopoDiff 报告，相对其研究中考虑的对抗基线，物理性能误差最多降低八倍、不可制造设计少十一倍 [Mazé and Ahmed, 2023]。相关扩散方法已被用于点阵与结构部件生成 [Zhang et al., 2025, Herron et al., 2024]。然而扩散模型与对抗模型的相对性能取决于任务与可用训练数据 [Habibi and Fuge, 2024]。扩散采样还需要反复的网络评估，这促使我们在比较中同时考虑设计质量与生成成本。

**流匹配。** 流匹配训练连续归一化流，而无需在训练期间模拟完整轨迹 [Lipman et al., 2023]。连续归一化流通过时变向量场 $v_t$ 把来自源分布 $p_0$ 的样本 $x_0$ 输运到来自数据分布的样本 $x_1$：

$$
\frac{dx_t}{dt}=v_t(x_t),\qquad x_0\sim p_0.\tag{1}
$$

经典连续归一化流通常需要在训练期间求解并对该常微分方程（ODE）求导。流匹配则转而回归与给定概率路径相关联的向量场 [Albergo and Vanden-Eijnden, 2023]。

条件流匹配构造的目标速度可由采样的源端点与目标端点计算得到的路径。在独立条件流匹配（I-CFM）中，这些端点相互独立采样。最优传输耦合则可降低路径曲率与目标方差 [Tong et al., 2024]。本文所用的线性路径、目标速度与训练目标在第 3 节定义。相关表述还包括随机插值与整流流 [Albergo et al., 2025, Liu et al., 2023]。

近期工作把流匹配应用于翼型与机翼逆向设计 [Yang et al., 2026, Zhao et al., 2026]、船用螺旋桨设计 [Kruger et al., 2026]、流场生成 [Kashefi, 2026] 与拓扑优化 [Xiao et al., 2026, Rashed et al., 2026]。Krüger et al. [2026] 在工程逆问题上比较生成模型，而 de Campos et al. [2026] 研究了一种带弃权机制的高维逆向设计流匹配方法。

**本研究范围。** 已有工作表明流匹配可用于工程设计，包括拓扑优化。我们把第 3 节描述的线性路径 I-CFM 实现与 EngiOpt 中现有的扩散与 cGAN 实现比较。所有方法使用相同的 EngiBench 数据划分、匹配的条件—参考设计对、仅基于验证集的检查点选择、下游优化器与指标定义。CFM 与扩散还额外共享同一条件 U-Net 架构。我们评估结构与热学任务，并报告由下游优化轨迹计算得到的 COG 与 FOG，以及实测采样成本。

## 3 方法

**问题表述。** 每个问题实例由编码问题特定边界条件的条件向量 $c\in\mathbb R^{n_c}$ 与目标二维密度场 $x\in[0,1]^{H\times W}$ 定义，其中每个元素表示局部材料密度（0 = 空，1 = 实体）。数据集 $\mathcal D=\{(c^{(i)},x^{(i)}_{\mathrm{ref}})\}_{i=1}^{N}$ 由 $N$ 对边界条件及其对应参考设计组成。我们的目标是学习一个条件生成模型，以逼近分布 $p(x\mid c)$，其样本作为下游基于物理优化的初始设计。

**工程设计问题与数据表示。** EngiBench 为加载基准数据集、运行其仿真器与优化器提供统一的 Python 接口 [Felten et al., 2025]。我们在 Beams2D 上评估结构柔度优化、在 HeatConduction2D 上评估热柔度优化。完整问题文档见 EngiBench 问题注册表（https://engibench.ethz.ch/）。

- **Beams2D**：在 $100\times50$ 网格上对右半 MBB 梁做结构柔度最小化（$x\in[0,1]^{100\times50}$，$c\in\mathbb R^4$）。数据集提供 4,851 个优化参考设计：3,880 个训练、728 个验证与 243 个测试设计。条件变量 $c$ 包括体积分数（volfrac）、最小特征厚度（rmin）、分数力位置（forcedist）与一个悬垂可制造性标志。
- **HeatConduction2D**：在 $101\times101$ 网格上、于材料预算与边界条件约束下做热柔度最小化（$x\in[0,1]^{101\times101}$，$c\in\mathbb R^2$）。数据集含 441 个优化参考设计：361 个训练、40 个验证与 40 个测试设计。条件变量 $c$ 包括材料分布体积上限与区域底边绝热段长度。

**预处理与后处理管线。** 预处理因模型而异。对 CFM，设计场用训练划分上计算的统计量做 min-max 归一化，$x_{\mathrm{norm}}=(x-x_{\min})/(x_{\max}-x_{\min})$，条件向量保持不变。由于训练数据本已在 $[0,1]$ 内，该归一化近似为恒等；生成输出在评估与作为优化器热启动前直接裁剪到 $[10^{-3},1]$。扩散设计则为了训练被缩放到 $[-1,1]$，以匹配标准去噪扩散概率模型（DDPM）约定 [Ho et al., 2020]，生成输出在裁剪到 $[10^{-3},1]$ 之前再缩放回物理密度范围。对 cGAN，生成器使用 sigmoid 输出，故生成设计已在 $[0,1]$ 内，随后施加同样的裁剪步骤。

### 3.1 CFM 架构

我们使用二维条件 U-Net 作为 I-CFM 的主干。U-Net 以带噪设计 $x_t\in\mathbb R^{1\times H\times W}$ 与条件 $c$ 为输入，输出速度场 $v_\theta(x_t,t,c)\in\mathbb R^{1\times H\times W}$。具体地，我们实现 Hugging Face Diffusers 库的 `UNet2DConditionModel` [von Platen et al., 2022]。它有四个编解码阶段，通道深度为 $(32,64,128,256)$，条件在每个块通过交叉注意力注入。如第 2 节所述，我们使用 I-CFM：高斯噪声 $x_0\sim\mathcal N(0,I)$ 与目标设计 $x_1$ 随机独立配对。对连续时间变量 $t\sim U(0,1)$，定义线性插值路径 $x_t=(1-t)x_0+tx_1$，目标速度为 $v^{\star}=x_1-x_0$。模型预测 $v_\theta(x_t,t,c)$，并用均方误差目标训练：

$$
\mathcal L_{\mathrm{FM}}=\mathbb E_{x_0,x_1,t}\left[\left\|v_\theta(x_t,t,c)-(x_1-x_0)\right\|_2^2\right].\tag{2}
$$

**推理与求解器。** 推理时，用固定步长 ODE 求解器从 $t=0$ 到 $t=1$ 积分学习到的速度场以生成设计。为评估采样速度与解质量之间的折中，我们基准测试三种求解器：一阶 Euler、二阶中点法与经典四阶 Runge–Kutta（RK4）。我们在 NFE 预算 16、32 与 48 下比较它们；这分别对应 Euler 的步数 $\{16,32,48\}$、中点法的 $\{8,16,24\}$ 与 RK4 的 $\{4,8,12\}$。

### 3.2 基线

为减少 CFM 与扩散之间的架构差异，二者使用相同 `UNet2DConditionModel` 主干与通道配置 $(32,64,128,256)$，可训练参数数量相同。扩散模型用线性噪声调度（$\beta_1=10^{-4}$、$\beta_T=0.02$、$T=1000$ 步）训练以预测噪声 $\epsilon$，并通过 1000 个反向步的 DDPM 祖先采样生成。cGAN 使用 EngiOpt 现有的对抗架构。生成器接收噪声 $z\sim\mathcal N(0,I)$（潜维 $z_{\dim}=32$）与扩展为空间图的条件 $c$；二者经并行的 `ConvTranspose2d` 主干处理后拼接为 $F_0=256$ 通道。四个上采样阶段在空间上从 $7\times7$ 推进到目标分辨率，使用 BatchNorm 与 ReLU 激活，最后由 sigmoid 层产生 $\hat x\in[0,1]^{1\times H\times W}$，再裁剪到 $[10^{-3},1]$ 供评估。判别器以镜像方式使用该条件化策略，把并行图像与条件主干下采样为单个真/伪预测。

详细优化器、硬件与训练设置见附录 A。

### 3.3 实验协议与评价指标

我们不把生成模型当作独立的设计生成器，而是把它作为基于梯度拓扑优化的热启动先验。基准任务、数据划分、条件、下游优化器与评价指标在各方法间固定。CFM 与扩散还共享同一 U-Net 架构，而 cGAN 使用其现有 EngiOpt 架构。

在该流程中，生成模型接收问题特定条件 $c^{(i)}$，为每个测试条件产生初始候选设计 $x^{(i)}_0$。该热启动被送入 EngiBench [Felten et al., 2025] 提供的、问题特定的基准优化器，优化器在同一条件 $c^{(i)}$ 下精化设计，产生优化轨迹 $\{x^{(i)}_t\}_{t=0}^{T}$。随后用下文定义的指标，把该轨迹与配对的数据集参考设计 $x^{(i)}_{\mathrm{ref}}$ 比较。所有方法使用相同的数据划分与训练种子 1—10。

**训练与模型选择。** 所有模型最多训练 500 个 epoch，批大小 32。对每个训练种子 $s$，我们用种子 $s+123$ 从验证划分中有放回地采样 50 对条件—参考设计；该集合在训练全程保持不变。每 10 个 epoch，对这些条件生成的设计用验证集最大均值差异（MMD）打分。检查点在第 80 个 epoch 之后才具备被选资格；若连续 25 次验证检查都没有更低的 MMD，训练即停止。

模型选择仅使用验证划分。我们先保留验证 MMD 最低的五个合格检查点。然后每个检查点被用于在同一 50 对验证对上、以最终评估所用的同一优化器预算初始化下游优化器；选中验证 COG 最低的检查点。该检查点用种子 $s$ 从测试划分中有放回采样的 50 对匹配条件—参考设计评估，而生成使用种子 $s+2000$。因此对给定问题与训练种子，CFM、扩散与 cGAN 使用相同的验证与测试对、参考设计、下游优化器与指标定义。测试结果不用于早停或检查点选择。

为在固定优化器预算下度量生成的热启动如何影响下游优化轨迹，令 $\{x^{(i)}_t\}_{t=0}^{T}$ 表示在条件 $c^{(i)}$ 下从生成设计 $x^{(i)}_0$ 出发的轨迹，并令 $f^{(i)}_{\mathrm{ref}}=f(x^{(i)}_{\mathrm{ref}},c^{(i)})$ 为在同一条件下评估的配对数据集设计的目标值。注意 $x^{(i)}_{\mathrm{ref}}$ 不是全局最优，而是基准优化器产生的参考设计。

- **COG：** 度量优化轨迹上相对参考的累积目标间隙：

$$
\mathrm{COG}=\operatorname*{median}_i\sum_{t=1}^{T}\left[f(x^{(i)}_t,c^{(i)})-f(x^{(i)}_{\mathrm{ref}},c^{(i)})\right].\tag{3}
$$

直观上，COG 累积热启动优化轨迹与配对参考设计之间的目标差。若轨迹的目标值始终接近参考，则 COG 小。负 COG 表示轨迹上累积的目标差低于数据集参考。COG 采用中位数聚合，因为累积轨迹和对离群优化运行敏感。

- **FOG：** 度量最终设计 $x^{(i)}_T$ 相对数据集参考的质量：

$$
\mathrm{FOG}=\mathbb E_i\left[f(x^{(i)}_T,c^{(i)})-f(x^{(i)}_{\mathrm{ref}},c^{(i)})\right].\tag{4}
$$

与 COG 不同，FOG 只考虑优化轨迹的最后一步。正 FOG 表示优化器终止时的目标高于参考；负 FOG 表示热启动优化器找到优于数据集参考的解。我们报告平均 FOG，以概括评估样本上的平均最终目标差。对 COG 与 FOG，都是越低越好。

**分布与可行性指标。** MMD 用高斯核度量生成设计与参考设计之间的分布一致性，核带宽按问题取值：Beams2D 为 $\sigma=1.0$，HeatConduction2D 为 10.0。由于带宽对每个设计空间单独选择，MMD 与行列式点过程（DPP）值只在同一问题内跨方法可比，不能跨问题比较。

DPP 多样性通过生成批次核相似矩阵的行列式度量样本多样性，值越高表示多样性越大。约束违反（Viol.）量化与所需材料预算的偏差，计算为生成设计的材料分数与 $c$ 中指定目标体积分数 $v^{*(i)}$ 之间的平均绝对误差：

$$
\mathrm{Viol.}=\mathbb E_i\left[\left|\bar x^{(i)}_0-v^{*(i)}\right|\right],\tag{5}
$$

其中 $\bar x^{(i)}_0$ 表示生成设计的平均密度。我们还检查二维密度场是否存在可见的不连续、碎裂的材料区域，以及与配对参考拓扑的差异。

## 4 结果

结果在 10 个随机种子上报告。COG 按与式（3）一致的方式概括为中位数 ± 标准差；其他指标都概括为均值 ± 标准差。主要比较中，CFM 结果使用 Euler 求解器 $s=32$ 步（NFE$=32$），与扩散（NFE$=1000$）及 cGAN 对比。详细的求解器与步数结果见附录 B。

（表 1 见"图注与表注"一节。）

表 1 表明，CFM 在两个基准上都取得最低的实测 COG 与 FOG。在 `beams2d` 上，CFM 与扩散的平均 FOG 分别为 $-1.647$ 与 $-1.637$，表明它们的热启动下游优化平均而言优于配对数据集参考。CFM 的 COG（$1.173\pm3.100$）低于扩散（$1.603\pm1.794$），FOG 也略低（$-1.647\pm0.411$ 对 $-1.637\pm0.505$）。cGAN 基线在该任务上表现出很高的种子相关波动：其 COG 为 $22.493\pm819.282$，平均 FOG 为 $4.415\pm14.602$。

在 `heatconduction2d` 上，CFM 在两个主要指标上都是最低值；扩散的 COG 是 CFM 的 6.54 倍。cGAN 的 COG 为 $5.50\times10^{-4}\pm2.01\times10^{-4}$，而扩散为 $5.81\times10^{-4}\pm1.44\times10^{-4}$。CFM 在两个任务上的实测 COG 都是最低的。

（图 1 见"图注与表注"一节。）

图 1 展示的样本中，CFM 保留了参考设计中可见的连续构件与锐利的实体—空边界。扩散也产生锐利、高对比度的输出，但其展示的 `heatconduction2d` 样本与配对的参考材料分布有差异；这一观察与其在表 2 中更大的平均体积分数偏差相一致。在展示的 `beams2d` 样本中，cGAN 引入了参考中不存在的结构不连续；其展示的 `heatconduction2d` 样本包含碎裂与孤立的材料区域。

（表 2 见"图注与表注"一节。）

表 2 详述次要性能指标。CFM 在两个任务上都取得最低的 MMD 与体积分数违反，`beams2d` 与 `heatconduction2d` 的体积分数违反分别为 $3.60\times10^{-3}$ 与 $9.96\times10^{-3}$。扩散在两个问题上都生成最高的 DPP 值（$6.49\times10^{-1}$ 与 $2.91\times10^{-1}$），同时也产生最高的体积分数偏差（$3.82\times10^{-2}$ 与 $1.12\times10^{-1}$）。cGAN 的体积分数违反低于扩散（$1.62\times10^{-2}$ 与 $1.53\times10^{-2}$），DPP 分数也较低。在两个任务上，DPP 最高的方法都没有取得最低的 COG。

（表 3 见"图注与表注"一节。）

表 3 报告生成吞吐量，定义为 $n_{\mathrm{samples}}/t_{\mathrm{gen}}$。生成时间与数据加载、裁剪、指标计算、优化器精化与日志记录分开度量。对每个方法，我们只在单块 NVIDIA RTX 4090 GPU 上对 50 个测试条件的批次计时模型采样调用，并在计时区域前后使用 CUDA 同步以避免异步内核计时伪影。对 CFM 与扩散，我们使用一次预热调用后跟三次计时重复。由于 cGAN 前向传播为亚毫秒级，我们使用 1000 次预热调用与 1000 次计时重复。对每个种子，取重复间的中位同步运行时间，并报告 10 个种子上的均值 ± 标准差。cGAN 最快，因为它只需一次前向传播，但它在两个任务上都没有取得最低的 COG 或 MMD。Euler $s=32$ 的 CFM 在 `beams2d` 上比扩散快约 33.0 倍（1.876 s 对 61.903 s），在 `heatconduction2d` 上快 32.2 倍（4.092 s 对 131.74 s），同时在两个任务上都取得最低的实测 COG。

附录 B 的求解器—步数消融表明，在 `beams2d` 上，Euler 与中点法在所评估的 NFE 预算下取得 1.134 到 1.182 的 COG。在 NFE$=16$ 时，RK4（$s=4$）的 COG（$2.274\pm1.174$）高于同一 NFE 下的 Euler 与中点法配置，同时 DPP 最高（$0.981\pm0.025$）。Euler $s=16$ 取得 COG$=1.182\pm3.126$ 与 MMD$=0.0283\pm0.0021$，而 Euler $s=32$ 为 COG$=1.173\pm3.100$ 与 MMD$=0.0286\pm0.0021$。在 `heatconduction2d` 上，增加 Euler 步数同样不会单调降低 COG。把 Euler 预算从 32 次评估减到 16 次评估可使吞吐约翻倍，在 `beams2d` 与 `heatconduction2d` 上分别达到 $53.156\pm0.777$ 样本/秒与 $24.444\pm0.274$ 样本/秒；这些值分别对应约 65.8 倍与 64.4 倍于实测扩散吞吐。因此 Euler $s=16$ 相对 $s=32$ 把实测生成时间减半，而报告的 `beams2d` COG 值相差 0.009。

## 5 讨论

**优化效用与约束满足。** 在受评估的 EngiOpt 实现中，CFM 在两个任务上取得最低的实测 COG，且实测吞吐高于扩散。其更低的 COG 表明热启动优化轨迹相对配对参考设计累积了更小的目标间隙。在 `beams2d` 上，CFM 的最终目标略低于扩散（FOG$=-1.647$ 对 $-1.637$），尽管相对种子间波动该差异很小。在 `heatconduction2d` 上，CFM 在 COG 与 FOG 两项上也取得最低值。因此其实测优势在于固定预算优化过程中更低的累积目标间隙，以及比扩散更短的生成时间；二者在 `beams2d` 上的 FOG 值相差 0.010。

CFM 在两个任务上的平均绝对体积分数误差也是最低的。它在 `beams2d` 与 `heatconduction2d` 上分别保持在目标体积分数的 0.4% 与 1.0% 以内，而扩散偏差为 3.8% 与 11.2%。远离预期材料预算的热启动可能要求优化器先恢复可行性，再改善目标。这或许解释了扩散在 `heatconduction2d` 上的 COG 约为 CFM 的 6.54 倍（$5.81\times10^{-4}$ 对 $8.88\times10^{-5}$）。扩散基线使用标准 $[-1,1]$ DDPM 归一化；我们未分离其余体积分数偏差的来源。

CFM 与扩散使用相同的条件 U-Net 主干与通道配置。这减少了因模型架构与容量造成的差异，尽管两种方法在训练目标与采样过程上仍有不同。扩散在两个任务上的 DPP 都高于 CFM，但 COG 也更高。在这些实验中，更高的实测多样性因此并不对应更好的热启动优化轨迹。多样性应与可行性和优化效用指标一起解读。

**cGAN 基线的行为。** 受评估的 cGAN 是 EngiOpt 现有对抗基线，其实测采样吞吐最高。在 `beams2d` 上，COG 跨种子的巨大变化（$22.493\pm819.282$）表明其对训练初始化敏感。在 `heatconduction2d` 上，其 COG 为 $5.50\times10^{-4}$，而扩散为 $5.81\times10^{-4}$，但 DPP 更低（$6.28\times10^{-2}\pm9.81\times10^{-2}$ 对 $2.91\times10^{-1}\pm3.54\times10^{-1}$）。因此 cGAN 在两个任务上按 COG 与 DPP 的排序并不一致。这些实验并未分离所观察到的差异究竟源于条件变量、数据集还是对抗训练。

**流几何与求解器敏感性。** 求解器消融检验在固定 NFE 下更高阶的 ODE 积分是否改善 CFM 采样。对每个噪声—数据对，独立条件流匹配使用具有恒定目标速度的线性训练路径。然而，由于随机配对可能产生交叉路径，学习到的边缘向量场未必是直的。在受评估的设置中，中点法与 RK4 在相同 NFE 下都没有相对 Euler 改善实测优化指标。把 Euler 预算从 $s=16$ 增到 $s=32$，COG 分别为 $1.182\pm3.126$ 与 $1.173\pm3.100$。Euler $s=16$ 在 `beams2d` 上达到约 65.8 倍、在 `heatconduction2d` 上约 64.4 倍于实测扩散吞吐，并在同一计时基准下相对 Euler $s=32$ 把生成时间减半。要关于数值积分方法得出更广泛的结论，还需要更密集的 NFE 扫描。

**局限与未来工作。** 本研究限于两个二维 EngiBench 任务，以及 CFM 与扩散共享的一个 U-Net 家族。因此结果比较的是受评估的 EngiOpt 实现，而非建立流匹配、扩散与对抗逆向设计模型之间的普遍排序。扩散剩余的体积分数偏差可能反映去噪目标、采样动力学、模型选择或任务特定敏感性；分离这些因素需要针对性消融。未来工作应检验本文观察到的 CFM 更低体积分数误差是否在三维设置、多物理设计任务与更高维条件空间中依然存在。

## 6 结论

本文把 CFM 加入 EngiOpt，并把其作为两个 EngiBench 逆向设计任务的热启动先验进行评估。在受测试的实现中，CFM 在 `beams2d` 与 `heatconduction2d` 上均取得最低的实测 COG、FOG、MMD 与体积分数偏差。依求解器预算与任务不同，其实测采样吞吐约为受评估扩散基线的 32—66 倍。把 Euler 预算从 $s=32$ 减到 $s=16$ 可使吞吐约翻倍，而实测 `beams2d` COG 从 $1.173\pm3.100$ 变为 $1.182\pm3.126$。指标排序并不一致：扩散在两个任务上的 DPP 最高，而 CFM 的 COG 最低。

## 代码与工件可用性

实现与公开复现流程见一份带标签的 EngiOpt 源码快照。运行级的训练、检查点选择、评估与计时记录见公开的 Weights & Biases 报告。本研究所用的评估检查点与 EngiBench 数据集可通过公开的 Hugging Face 集合获取。

## 图注与表注

### 表 1：主要优化效用结果（原 PDF 第 5 页）

COG 与 FOG 越低越好；每个问题与指标内的最佳值加粗。

| 方法 | Beams2D COG↓ | Beams2D FOG↓ | HeatConduction2D COG↓ | HeatConduction2D FOG↓ |
|---|---|---|---|---|
| CFM（Euler $s=32$） | **$1.173\pm3.100$** | **$-1.647\pm0.411$** | **$8.88\times10^{-5}\pm6.84\times10^{-5}$** | **$1.32\times10^{-6}\pm8.87\times10^{-7}$** |
| Diffusion | $1.603\pm1.794$ | $-1.637\pm0.505$ | $5.81\times10^{-4}\pm1.44\times10^{-4}$ | $1.54\times10^{-5}\pm5.06\times10^{-6}$ |
| cGAN | $22.493\pm819.282$ | $4.415\pm14.602$ | $5.50\times10^{-4}\pm2.01\times10^{-4}$ | $1.21\times10^{-5}\pm3.58\times10^{-6}$ |

### 表 2：分布与可行性指标（原 PDF 第 6 页）

MMD 与 Viol. 越低越好；DPP 越高越好。MMD 与 DPP 只在同一问题内跨方法可比。

| 方法 | MMD↓ | DPP↑ | Viol.↓ |
|---|---|---|---|
| **Beams2D** | | | |
| CFM（Euler $s=32$） | **$2.86\times10^{-2}\pm2.06\times10^{-3}$** | $4.34\times10^{-1}\pm2.69\times10^{-1}$ | **$3.60\times10^{-3}\pm6.16\times10^{-4}$** |
| Diffusion | $3.43\times10^{-2}\pm4.19\times10^{-3}$ | **$6.49\times10^{-1}\pm2.92\times10^{-1}$** | $3.82\times10^{-2}\pm4.75\times10^{-2}$ |
| cGAN | $4.50\times10^{-2}\pm2.29\times10^{-3}$ | $3.03\times10^{-1}\pm4.40\times10^{-1}$ | $1.62\times10^{-2}\pm5.93\times10^{-3}$ |
| **HeatConduction2D** | | | |
| CFM（Euler $s=32$） | **$5.75\times10^{-2}\pm8.35\times10^{-3}$** | $8.99\times10^{-3}\pm1.35\times10^{-2}$ | **$9.96\times10^{-3}\pm2.09\times10^{-3}$** |
| Diffusion | $6.85\times10^{-2}\pm6.52\times10^{-3}$ | **$2.91\times10^{-1}\pm3.54\times10^{-1}$** | $1.12\times10^{-1}\pm1.38\times10^{-2}$ |
| cGAN | $1.20\times10^{-1}\pm3.70\times10^{-2}$ | $6.28\times10^{-2}\pm9.81\times10^{-2}$ | $1.53\times10^{-2}\pm5.50\times10^{-3}$ |

### 表 3：采样吞吐量（原 PDF 第 7 页）

以仅模型生成调用所产生样本的每秒样本数度量。越高越好。

| 方法 | 问题 | gen_runtime_sec↓ | samples/s↑ |
|---|---|---|---|
| CFM（Euler $s=32$） | beams2d | $1.876\pm0.022$ | $26.659\pm0.312$ |
| CFM（Euler $s=32$） | heatconduction2d | $4.092\pm0.052$ | $12.221\pm0.157$ |
| Diffusion | beams2d | $61.903\pm1.027$ | $0.808\pm0.013$ |
| Diffusion | heatconduction2d | $131.74\pm1.53$ | $0.380\pm0.004$ |
| cGAN | beams2d | $4.382\times10^{-4}\pm5.416\times10^{-6}$ | $114{,}107\pm1{,}419$ |
| cGAN | heatconduction2d | $4.419\times10^{-4}\pm5.404\times10^{-6}$ | $113{,}170\pm1{,}398$ |

### 表 4：不同 ODE 求解器与积分预算下的主要优化指标（原 PDF 第 11 页）

COG 报告为中位数 ± 标准差；FOG 报告为 10 个种子上的均值 ± 标准差。越低越好。

| 求解器 | 步数 | Beams2D COG↓ | Beams2D FOG↓ | HeatConduction2D COG↓ | HeatConduction2D FOG↓ |
|---|---|---|---|---|---|
| Euler | 16 | $1.182\pm3.126$ | $-1.625\pm0.395$ | $1.09\times10^{-4}\pm3.79\times10^{-5}$ | $1.34\times10^{-6}\pm6.57\times10^{-7}$ |
| Euler | 32 | $1.173\pm3.100$ | $-1.647\pm0.411$ | $8.88\times10^{-5}\pm6.84\times10^{-5}$ | $1.32\times10^{-6}\pm8.87\times10^{-7}$ |
| Euler | 48 | $1.140\pm1.223$ | $-1.633\pm0.412$ | $1.70\times10^{-4}\pm8.10\times10^{-5}$ | $1.52\times10^{-6}\pm1.15\times10^{-6}$ |
| Midpoint | 8 | $1.148\pm3.156$ | $-1.614\pm0.416$ | $1.04\times10^{-4}\pm4.65\times10^{-5}$ | $1.49\times10^{-6}\pm9.11\times10^{-7}$ |
| Midpoint | 16 | $1.137\pm2.123$ | $-1.643\pm0.409$ | $9.69\times10^{-5}\pm2.94\times10^{-5}$ | $1.09\times10^{-6}\pm7.56\times10^{-7}$ |
| Midpoint | 24 | $1.134\pm2.219$ | $-1.647\pm0.439$ | $1.14\times10^{-4}\pm8.07\times10^{-5}$ | $2.09\times10^{-6}\pm1.41\times10^{-6}$ |
| RK4 | 4 | $2.274\pm1.174$ | $-1.644\pm0.439$ | $1.38\times10^{-4}\pm4.64\times10^{-5}$ | $1.40\times10^{-6}\pm7.79\times10^{-7}$ |
| RK4 | 8 | $1.537\pm2.283$ | $-1.652\pm0.443$ | $1.13\times10^{-4}\pm3.14\times10^{-5}$ | $1.34\times10^{-6}\pm5.75\times10^{-7}$ |
| RK4 | 12 | $1.263\pm2.320$ | $-1.599\pm0.415$ | $1.15\times10^{-4}\pm5.31\times10^{-5}$ | $1.43\times10^{-6}\pm7.67\times10^{-7}$ |

### 表 5：求解器—步数消融的分布与可行性指标（原 PDF 第 12 页）

10 个种子上的均值 ± 标准差。MMD 与 Viol. 越低越好；DPP 越高越好。

| 求解器 | 步数 | MMD↓ | DPP↑ | Viol.↓ |
|---|---|---|---|---|
| **Beams2D** | | | | |
| Euler | 16 | $2.83\times10^{-2}\pm2.13\times10^{-3}$ | $4.02\times10^{-1}\pm2.66\times10^{-1}$ | $3.57\times10^{-3}\pm6.22\times10^{-4}$ |
| Euler | 32 | $2.86\times10^{-2}\pm2.06\times10^{-3}$ | $4.34\times10^{-1}\pm2.69\times10^{-1}$ | $3.60\times10^{-3}\pm6.16\times10^{-4}$ |
| Euler | 48 | $2.84\times10^{-2}\pm2.10\times10^{-3}$ | $4.33\times10^{-1}\pm2.73\times10^{-1}$ | $3.33\times10^{-3}\pm5.57\times10^{-4}$ |
| Midpoint | 8 | $2.87\times10^{-2}\pm1.96\times10^{-3}$ | $4.65\times10^{-1}\pm2.66\times10^{-1}$ | $3.55\times10^{-3}\pm4.48\times10^{-4}$ |
| Midpoint | 16 | $2.89\times10^{-2}\pm1.86\times10^{-3}$ | $4.76\times10^{-1}\pm2.68\times10^{-1}$ | $3.67\times10^{-3}\pm5.63\times10^{-4}$ |
| Midpoint | 24 | $2.97\times10^{-2}\pm1.68\times10^{-3}$ | $4.72\times10^{-1}\pm2.74\times10^{-1}$ | $3.86\times10^{-3}\pm6.67\times10^{-4}$ |
| RK4 | 4 | $3.96\times10^{-2}\pm1.63\times10^{-3}$ | $9.81\times10^{-1}\pm2.52\times10^{-2}$ | $9.85\times10^{-3}\pm2.54\times10^{-3}$ |
| RK4 | 8 | $3.50\times10^{-2}\pm1.57\times10^{-3}$ | $8.83\times10^{-1}\pm1.44\times10^{-1}$ | $5.33\times10^{-3}\pm4.81\times10^{-4}$ |
| RK4 | 12 | $3.20\times10^{-2}\pm1.64\times10^{-3}$ | $7.82\times10^{-1}\pm1.81\times10^{-1}$ | $4.62\times10^{-3}\pm4.55\times10^{-4}$ |
| **HeatConduction2D** | | | | |
| Euler | 16 | $5.80\times10^{-2}\pm8.79\times10^{-3}$ | $7.35\times10^{-3}\pm1.65\times10^{-2}$ | $1.03\times10^{-2}\pm2.08\times10^{-3}$ |
| Euler | 32 | $5.75\times10^{-2}\pm8.35\times10^{-3}$ | $8.99\times10^{-3}\pm1.35\times10^{-2}$ | $9.96\times10^{-3}\pm2.09\times10^{-3}$ |
| Euler | 48 | $5.89\times10^{-2}\pm7.57\times10^{-3}$ | $4.49\times10^{-2}\pm8.66\times10^{-2}$ | $9.79\times10^{-3}\pm1.79\times10^{-3}$ |
| Midpoint | 8 | $5.75\times10^{-2}\pm7.83\times10^{-3}$ | $2.38\times10^{-3}\pm2.63\times10^{-3}$ | $1.01\times10^{-2}\pm1.85\times10^{-3}$ |
| Midpoint | 16 | $5.61\times10^{-2}\pm8.63\times10^{-3}$ | $7.37\times10^{-3}\pm1.26\times10^{-2}$ | $1.01\times10^{-2}\pm1.59\times10^{-3}$ |
| Midpoint | 24 | $5.87\times10^{-2}\pm1.03\times10^{-2}$ | $2.45\times10^{-2}\pm5.00\times10^{-2}$ | $1.00\times10^{-2}\pm1.54\times10^{-3}$ |
| RK4 | 4 | $5.76\times10^{-2}\pm9.58\times10^{-3}$ | $2.65\times10^{-2}\pm3.74\times10^{-2}$ | $9.83\times10^{-3}\pm2.57\times10^{-3}$ |
| RK4 | 8 | $5.70\times10^{-2}\pm7.63\times10^{-3}$ | $1.79\times10^{-2}\pm3.27\times10^{-2}$ | $9.61\times10^{-3}\pm1.89\times10^{-3}$ |
| RK4 | 12 | $5.91\times10^{-2}\pm1.01\times10^{-2}$ | $3.46\times10^{-2}\pm7.03\times10^{-2}$ | $1.01\times10^{-2}\pm2.36\times10^{-3}$ |

### 表 6：不同 ODE 求解器与积分步数下的采样吞吐（原 PDF 第 12 页）

10 个种子上的均值 ± 标准差。

| 求解器 | 问题 | gen_runtime_sec↓ | samples/s↑ |
|---|---|---|---|
| Euler $s=16$ | beams2d | $0.941\pm0.014$ | $53.156\pm0.777$ |
| Euler $s=16$ | heatconduction2d | $2.046\pm0.023$ | $24.444\pm0.274$ |
| Euler $s=32$ | beams2d | $1.876\pm0.022$ | $26.659\pm0.312$ |
| Euler $s=32$ | heatconduction2d | $4.092\pm0.052$ | $12.221\pm0.157$ |
| Euler $s=48$ | beams2d | $2.813\pm0.025$ | $17.774\pm0.157$ |
| Euler $s=48$ | heatconduction2d | $6.128\pm0.057$ | $8.160\pm0.076$ |
| Midpoint $s=8$ | beams2d | $0.938\pm0.011$ | $53.293\pm0.634$ |
| Midpoint $s=8$ | heatconduction2d | $2.032\pm0.017$ | $24.602\pm0.208$ |
| Midpoint $s=16$ | beams2d | $1.880\pm0.021$ | $26.592\pm0.297$ |
| Midpoint $s=16$ | heatconduction2d | $4.062\pm0.034$ | $12.311\pm0.103$ |
| Midpoint $s=24$ | beams2d | $2.798\pm0.022$ | $17.874\pm0.141$ |
| Midpoint $s=24$ | heatconduction2d | $6.106\pm0.058$ | $8.189\pm0.078$ |
| RK4 $s=4$ | beams2d | $0.942\pm0.011$ | $53.102\pm0.633$ |
| RK4 $s=4$ | heatconduction2d | $2.030\pm0.023$ | $24.636\pm0.275$ |
| RK4 $s=8$ | beams2d | $1.882\pm0.025$ | $26.572\pm0.357$ |
| RK4 $s=8$ | heatconduction2d | $4.060\pm0.038$ | $12.317\pm0.115$ |
| RK4 $s=12$ | beams2d | $2.809\pm0.023$ | $17.801\pm0.148$ |
| RK4 $s=12$ | heatconduction2d | $6.111\pm0.056$ | $8.183\pm0.075$ |

### 图注

**图 1（原 PDF 第 6 页）：** 匹配条件下的定性比较。每行对应一个基准问题；各列展示参考设计与各方法生成的热启动。Beams2D 展示种子 8，HeatConduction2D 展示种子 5；每行在所有展示方法中使用相同条件与种子。

**图 2（原 PDF 第 13 页）：** 跨 NFE 预算的 ODE 求解器族消融。左：`beams2d` 的 COG（越低越好）；右：`heatconduction2d` 的 COG（越低越好）；图例包括 Euler、Midpoint 与 RK4。在低 NFE 时，RK4 使用更少、更大的积分步，在 `beams2d` 上产生比 Euler 更高的 COG。

## 附录 A：训练配置（原 PDF 第 11 页）

所有模型在单块 NVIDIA RTX 4090 GPU 上以批大小 32 训练，最多 500 个 epoch。

- **CFM 与扩散：** 用 AdamW [Loshchilov and Hutter, 2019] 优化，学习率 $4\times10^{-4}$，两个模型的 $(\beta_1,\beta_2)=(0.9,0.999)$。
- **cGAN：** 用 Adam [Kingma and Ba, 2015] 优化，生成器与判别器的学习率分别为 $1\times10^{-4}$ 与 $4\times10^{-4}$，二者的 $(\beta_1,\beta_2)=(0.5,0.999)$。

## 附录 B：ODE 求解器与步数消融（原 PDF 第 11—13 页）

我们在匹配的 NFE 预算 16、32 与 48 下对 Euler、中点法与 RK4 做消融。由于中点法与 RK4 每个积分步分别需要两次与四次速度评估，相应步数被调整以保持 NFE 固定（表 4—表 6、图 2）。

在 `beams2d` 上，Euler 与中点法在所有 NFE 设置下给出 1.134 到 1.182 之间的 COG。RK4 在 NFE$=16$（$s=4$）时在匹配 NFE 的设置中具有最高 COG（$2.274\pm1.174$）、DPP（$0.981\pm0.025$）与 MMD（$0.040\pm0.002$）。因此其更大的实测多样性并未伴随更低的热启动 COG。在 NFE$=32$ 时，RK4（$s=8$）的 COG 为 $1.537$，而 Euler $s=32$ 为 $1.173$。在 `heatconduction2d` 上，COG 在各受评估配置间于 $8.88\times10^{-5}$ 与 $1.70\times10^{-4}$ 之间变化。

在 `beams2d` 上，Euler 的 NFE–COG 关系非单调。Euler $s=16$ 的 COG$=1.182\pm3.126$、MMD$=0.0283\pm0.0021$，而 Euler $s=32$ 为 COG$=1.173\pm3.100$、MMD$=0.0286\pm0.0021$，同时其吞吐增至 $53.156$ 样本/秒。

## 缩略语（原 PDF 第 13 页）

CFM 条件流匹配（conditional flow matching）；COG 累积最优性间隙（cumulative optimality gap）；FOG 最终最优性间隙（final optimality gap）；NFE 函数评估次数（number of function evaluations）；cGAN 条件生成对抗网络（conditional generative adversarial network）；I-CFM 独立条件流匹配（independent conditional flow matching）；GAN 生成对抗网络（generative adversarial network）；MMD 最大均值差异（maximum mean discrepancy）；DPP 行列式点过程（determinantal point process）；ODE 常微分方程（ordinary differential equation）；RK4 经典四阶 Runge–Kutta 方法；DDPM 去噪扩散概率模型（denoising diffusion probabilistic model）；PDE 偏微分方程（partial differential equation）。

## 参考文献（英文原条目）

以下按原文（作者—年格式，无编号）顺序逐条转录英文书目，保留英文原貌；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

Owen Peckham, Jonathan Raines, Erik Bulsink, Mark Goudswaard, James Gopsill, David Barton, Aydin Nassehi, and Ben Hicks. Artificial intelligence in generative design: a structured review of trends and opportunities in techniques and applications. *Designs*, 9(4):79, 2025. doi: 10.3390/designs9040079. URL https://doi.org/10.3390/designs9040079.

Milad Habibi, Jun Wang, and Mark Fuge. When is it actually worth learning inverse design? *Journal of Mechanical Design*, 148(6):061704, 2026. doi: 10.1115/1.4070621. URL https://doi.org/10.1115/1.4070621.

Giorgio Giannone, Akash Srivastava, Ole Winther, and Faez Ahmed. Aligning optimization trajectories with diffusion models for constrained design generation. *Advances in neural information processing systems*, 36:51830–51861, 2023. doi: 10.52202/075280-2258. URL https://proceedings.neurips.cc/paper_files/paper/2023/hash/a2c0b2ffebbc32eb6468243c9ee9e205-Abstract-Conference.html.

Lyle Regenwetter, Amin Heyrani Nobari, and Faez Ahmed. Deep generative models in engineering design: A review. *Journal of Mechanical Design*, 144(7):071704, 2022. doi: 10.1115/1.4053859. URL https://doi.org/10.1115/1.4053859.

François Mazé and Faez Ahmed. Diffusion models beat gans on topology optimization. In *Proceedings of the AAAI conference on artificial intelligence*, volume 37, pages 9108–9116, 2023. doi: 10.1609/aaai.v37i8.26093. URL https://doi.org/10.1609/aaai.v37i8.26093.

Jinlong Zhang, Shikun Chen, Robert J Martin, Baochang Liu, Ruixiong Zhang, and Dengbao Xiao. Conditional diffusion models for the inverse design of lattice structures. *Structural and Multidisciplinary Optimization*, 68(3):58, 2025. doi: 10.1007/s00158-025-03984-2. URL https://doi.org/10.1007/s00158-025-03984-2.

Milad Habibi and Mark Fuge. Inverse design with conditional cascaded diffusion models. In *International Design Engineering Technical Conferences and Computers and Information in Engineering Conference*, volume 88360, page V03AT03A020. American Society of Mechanical Engineers, 2024. doi: 10.1115/detc2024-143607. URL https://doi.org/10.1115/detc2024-143607.

Florian Felten, Gabriel Apaza, Gerhard Bäunlich, Cashen Diniz, Xuliang Dong, Arthur Drake, Milad Habibi, Nathaniel J. Hoffman, Matthew Keeler, Soheyl Massoudi, Francis G. VanGessel, and Mark Fuge. Engibench: A framework for data-driven engineering design research, 2025. URL https://arxiv.org/abs/2508.00831.

Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In *International Conference on Learning Representations*, 2023. doi: 10.48550/arXiv.2210.02747. URL https://openreview.net/forum?id=PqvMRDCJT9t.

Ole Sigmund and Kurt Maute. Topology optimization approaches: A comparative review. *Structural and Multidisciplinary Optimization*, 48(6):1031–1055, 2013. doi: 10.1007/s00158-013-0978-6. URL https://doi.org/10.1007/s00158-013-0978-6.

Sean Molesky, Zin Lin, Alexander Y. Piggott, Weiliang Jin, Jelena Vucković, and Alejandro W. Rodriguez. Inverse design in nanophotonics. *Nature Photonics*, 12:659–670, 2018. doi: 10.1038/s41566-018-0246-9. URL https://www.nature.com/articles/s41566-018-0246-9.

Ahmad Shirvani, Mahdi Nili-Ahmadabadi, and Man Yeong Ha. Machine learning-accelerated aerodynamic inverse design. *Engineering Applications of Computational Fluid Mechanics*, 17(1):2237611, 2023. doi: 10.1080/19942060.2023.2237611. URL https://doi.org/10.1080/19942060.2023.2237611.

Ole Sigmund. A 99 line topology optimization code written in matlab. *Structural and multidisciplinary optimization*, 21(2):120–127, 2001. doi: 10.1007/s001580050176. URL https://doi.org/10.1007/s001580050176.

Baotong Li, Congjia Huang, Xin Li, Shuai Zheng, and Jun Hong. Non-iterative structural topology optimization using deep learning. *Computer-Aided Design*, 115:172–180, 2019. doi: 10.1016/j.cad.2019.05.038. URL https://doi.org/10.1016/j.cad.2019.05.038.

Qiyin Lin, Feiyu Gu, Chen Wang, Hao Guan, Tao Wang, Kaiyi Zhou, Lian Liu, and Desheng Yao. Intelligent design method for thermal conductivity topology based on a deep generative network. *Chinese Journal of Mechanical Engineering*, 38(1):47, 2025. doi: 10.1186/s10033-025-01222-w. URL https://doi.org/10.1186/s10033-025-01222-w.

Milad Habibi, Shai Bernard, Jun Wang, and Mark Fuge. Mean squared error may lead you astray when optimizing your inverse design methods. *Journal of Mechanical Design*, 147(2):021701, 2025. doi: 10.1115/1.4066102. URL https://doi.org/10.1115/1.4066102.

Mehdi Mirza and Simon Osindero. Conditional generative adversarial nets, 2014. URL https://arxiv.org/abs/1411.1784.

Zhenguo Nie, Tong Lin, Haoliang Jiang, and Levent Burak Kara. Topologygan: Topology optimization using generative adversarial networks based on physical fields over the initial domain. *Journal of Mechanical Design*, 143(3):031715, 2021. doi: 10.1115/1.4049533. URL https://doi.org/10.1115/1.4049533.

Nathan Hertlein, Philip R. Buskohl, Andrew Gillman, Kumar Vemaganti, and Sam Anand. Generative adversarial network for early-stage design flexibility in topology optimization for additive manufacturing. *Journal of Manufacturing Systems*, 59:675–685, 2021. doi: 10.1016/j.jmsy.2021.04.007. URL https://www.sciencedirect.com/science/article/pii/S027861252100087X.

Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, and Yoshua Bengio. Generative adversarial nets. In *Advances in Neural Information Processing Systems*, volume 27, 2014. doi: 10.48550/arXiv.1406.2661. URL https://proceedings.neurips.cc/paper_files/paper/2014/hash/f033ed80deb0234979a61f95710dbe25-Abstract.html.

Sangeun Oh, Yongsu Jung, Seongsin Kim, Ikjin Lee, and Namwoo Kang. Deep generative design: Integration of topology optimization and generative models. *Journal of Mechanical Design*, 141(11):111405, 2019. doi: 10.1115/1.4044229. URL https://doi.org/10.1115/1.4044229.

Shintaro Yamasaki, Kentaro Yaji, and Kikuo Fujita. Data-driven topology design using a deep generative model. *Structural and Multidisciplinary Optimization*, 64(3):1401–1420, 2021. doi: 10.1007/s00158-021-02926-y. URL https://doi.org/10.1007/s00158-021-02926-y.

Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. *Advances in Neural Information Processing Systems*, 33, 2020. doi: 10.48550/arXiv.2006.11239. URL https://proceedings.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html.

Ethan Herron, Jaydeep Rade, Anushrut Jignasu, Baskar Ganapathysubramanian, Aditya Balu, Soumik Sarkar, and Adarsh Krishnamurthy. Latent diffusion models for structural component design. *Computer-Aided Design*, 171:103707, 2024. doi: 10.1016/j.cad.2024.103707. URL https://www.sciencedirect.com/science/article/pii/S0010448524000344.

Michael S Albergo and Eric Vanden-Eijnden. Building normalizing flows with stochastic interpolants. In *International Conference on Learning Representations*, 2023. doi: 10.48550/arXiv.2209.15571. URL https://openreview.net/forum?id=li7qeBbCR1t.

Alexander Tong, Nikolay Malkin, Guillaume Huguet, Yanlei Zhang, Jarrid Rector-Brooks, Kilian Fatras, Guy Wolf, and Yoshua Bengio. Improving and generalizing flow-based generative models with minibatch optimal transport. *Transactions on Machine Learning Research*, 2024. doi: 10.48550/arXiv.2302.00482. URL https://openreview.net/forum?id=HgDwiZrpVq.

Michael S. Albergo, Nicholas M. Boffi, and Eric Vanden-Eijnden. Stochastic interpolants: A unifying framework for flows and diffusions. *Journal of Machine Learning Research*, 26(209):1–80, 2025. doi: 10.48550/arXiv.2303.08797. URL https://jmlr.org/papers/v26/23-1605.html.

Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In *International Conference on Learning Representations*, 2023. doi: 10.48550/arXiv.2209.03003. URL https://openreview.net/forum?id=XVjTT1nw5z.

Aobo Yang, Zhen Wei, Rhea P. Liem, and Pascal Fua. Physics-guided generative design with gradient-based source-space optimization on flow matching. *Structural and Multidisciplinary Optimization*, 69(5):136, 2026. doi: 10.1007/s00158-026-04318-6. URL https://doi.org/10.1007/s00158-026-04318-6.

Yanxuan Zhao, Guopeng Sun, Shenshen Liu, Jing Yu, Peng Zhang, Jianqiang Chen, and Yueqing Wang. Flow-matching framework for two-dimensional airfoil multipoint inverse design. *Journal of Aircraft*, pages 1–21, 2026. doi: 10.2514/1.C038770. URL https://doi.org/10.2514/1.C038770.

Patrick Kruger, Rafael Diaz, Simon Hauschulz, Stefan Harries, and Hanno Gottschalk. Generative design of ship propellers using conditional flow matching. *arXiv preprint arXiv:2601.21637*, 2026. doi: 10.48550/arXiv.2601.21637. URL https://arxiv.org/abs/2601.21637.

Ali Kashefi. Flow matching and diffusion models via pointnet for generating fluid fields on irregular geometries. *Computer Methods in Applied Mechanics and Engineering*, 458:119037, 2026. doi: 10.1016/j.cma.2026.119037. URL https://doi.org/10.1016/j.cma.2026.119037.

Shusheng Xiao, Jinshuai Bai, Hyogu Jeong, Yunfei Xi, Yilin Gui, and YuanTong Gu. Trajectory-aware flow matching for topology optimisation, 2026. URL https://arxiv.org/abs/2607.14652.

Mohammad Rashed, Duarte F. Valoroso Madeira, Babak Gholami, Caglar Guerbuez, Yunjia Yang, and Nils Thuerey. On the generalization in topology optimization via sensitivity-conditioned bernoulli flow matching, 2026. URL https://arxiv.org/abs/2606.02179.

Patrick Krüger, Patrick Materne, Werner Krebs, and Hanno Gottschalk. How well do generative models solve inverse problems? a benchmark study. *arXiv preprint arXiv:2601.23238*, 2026. doi: 10.48550/arXiv.2601.23238. URL https://arxiv.org/abs/2601.23238.

Miguel de Campos, Werner Krebs, and Hanno Gottschalk. Generative inverse design with abstention via diagonal flow matching. *arXiv preprint arXiv:2603.15925*, 2026. doi: 10.48550/arXiv.2603.15925. URL https://arxiv.org/abs/2603.15925.

Patrick von Platen, Suraj Patil, Anton Lozhkov, Pedro Cuenca, Nathan Lambert, Kashif Rasul, Mishig Davaadorj, Dhruv Nair, Sayak Paul, William Berman, Yiyi Xu, Steven Liu, and Thomas Wolf. Diffusers: State-of-the-art diffusion models. https://github.com/huggingface/diffusers, 2022. URL https://github.com/huggingface/diffusers.

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. *International Conference on Learning Representations*, 2019. doi: 10.48550/arXiv.1711.05101. URL https://openreview.net/forum?id=Bkg6RiCqY7.

Diederik P Kingma and Jimmy Ba. Adam: A method for stochastic optimization. *International Conference on Learning Representations*, 2015. doi: 10.48550/arXiv.1412.6980. URL https://arxiv.org/abs/1412.6980.

**本页范围与校对状态：** 本页依据 arXiv:2609.00863v1（cs.LG，2026-09-01，13 页；预印本标注日期 2026-09-02）完成全文中文翻译：摘要、关键词、第 1—6 节（含第 2 节各主题段、3.1—3.3、第 5 节讨论各段）、代码与工件可用性、图 1—2 中文图注、表 1—6 逐格转录、附录 A—B、缩略语、参考文献 39 条（作者—年格式，按原顺序）均按原文结构录入。编号公式 (1)—(5) 按原文保留。表 1—6 已分别用 PDF 第 5、6、7、11、12 页渲染图逐格核对。**逐句逐式终校未做**；图 1 中的设计场图像未作数字化读取，只转录图注与正文给出的信息；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：原文表 2 与表 5 的 DPP 列方向为"越高越好"，而同一表中 MMD 与 Viol. 为"越低越好"，表注已按原文写明方向，未作改动；第 4 节主要比较中 CFM 使用 Euler $s=32$（NFE=32），而摘要与结论中关于约 66 倍吞吐的说法对应 Euler $s=16$（NFE=16），两者口径不同，已在相应段落保留原文表述并在此说明。原文为预印本，无致谢与作者简介。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
