---
layout: page
title: "从不完美祖先模型中学习物理规律｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-24947-learning-physics-from-an-imperfect-ancestor/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ef9e4c178d98a69d/) · [原文 arXiv](https://arxiv.org/abs/2609.24947) · [全部目录](/papers/catalog/)

# 从不完美祖先模型中学习物理规律

**原题：** Learning Physics from an Imperfect Ancestor  
**作者：** S. Mohammad Mousavi$^{1,2}$、Teeratorn Kadeethum$^{2}$、Nikolaos Bouklas$^{1}$、Somdatta Goswami$^{3}$  
**单位：** $^1$ 康奈尔大学 Sibley 机械与航空航天工程学院；$^2$ 西门子能源 AI 实验室；$^3$ 约翰斯·霍普金斯大学土木与系统工程系。  
**版本：** arXiv:2609.24947v1（cs.LG），v1 日期 2026 年 9 月 21 日；页首标注 "Published as a conference paper at ICLR 2027"；原文 19 页（含附录 A–E）。  
**原文信息核对：** PDF 页首同时标注 ICLR 2027 会议论文与 "arXiv:2609.24947v1 [cs.LG] 21 Sep 2026"，与库内登记编号 2609.24947 一致；本文为预印本（19 页，含可复现性声明、AI 使用声明、参考文献 41 条与附录 A–E）。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节正文与编号小节、可复现性声明、AI 使用声明、图 1–8 中文图注、表 1–7 逐格转写、附录 A–E、参考文献 41 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

神经算子（neural operator，NO）能够廉价地求解参数化偏微分方程（PDE），但在训练分布之外会急剧退化。物理信息神经网络（physics-informed neural network，PINN）避免了对标注数据的依赖，但其优化可能"盆地脆弱"（basin-fragile）：当控制残差存在多个解时，从零开始训练的 PINN 可能收敛到物理上错误的状态，尽管残差很小。我们表明这些失效模式可以被联合解决：一个不完美的 NO 提供了把 PINN 放入正确解盆地所需的结构先验，而 PDE 残差则把解精化到超越算子精度的程度。我们提出一个三阶段框架：冻结物理信息 NO 的空间基，用多项式延拓先验把其解分支外推到分布外参数，再把所得场蒸馏进一个新的 PINN。NO（教师）无需在目标处准确；它传递解分支信息，而 PINN（学生）中的 PDE 残差最小化主导收敛。我们在三个非线性 PDE 上评估该框架：一维黏性 Burgers 方程、叉式分岔附近的二维稳态 Allen–Cahn 方程，以及二维稳态顶盖驱动方腔流。对 Allen–Cahn 方程，平凡解精确满足 PDE 残差，标准 PINN 会一致地坍缩到平凡零分支，而从粗糙外推算子蒸馏可恢复与有限差分解一致的非平凡分支。对顶盖驱动方腔，外推到雷诺数 Re = 3200 可加速收敛到正确物理状态，以比近期文献基线更少的参数与优化步数达到有竞争力的精度。这些结果确立了一个简单原则：NO 不必准确预测解才有用；它只需识别正确的盆地，PINN 优化即可从中恢复解。

## 1. 引言

参数化偏微分方程（PDE）支撑着许多科学与工程工作流，其中同一组控制方程必须在不同参数下反复求解。神经算子（NO）通过学习"参数到解"的映射来摊销这一代价，使训练后可以廉价推理。然而，其在训练分布之外的精度可能急剧下降，而使其适应新参数通常需要额外仿真或标注数据。物理信息神经网络（PINN）通过直接施加控制方程提供了互补的替代方案，但其优化对初始化敏感，当 PDE 残差存在多个极小值时可能收敛到物理上错误的解。此时，小残差并不保证选中物理相关的解分支。

这些失效模式提示一种互补的角色分工：NO 可提供关于解流形的结构信息，而 PINN 可在目标参数处施加控制物理。因此我们问：一个不完美的、分布外的 NO 能否在不约束最终精度的前提下引导 PINN？我们表明可以。关键在于把 NO 不作为最终解的预测器，而作为解盆地选择的先验。

为此，我们提出一个三阶段框架：训练一个物理信息 NO 并冻结其空间基；用多项式延拓先把分支外推到分布外目标，且不需要任何参考解；再把外推场蒸馏进一个刚初始化的 PINN，其后续残差最小化决定最终精度。所得 NO 充当教师，但与常规知识蒸馏不同，它不需要提供准确预测。它的作用是传递解分支信息，把 PINN 放入有利的吸引盆；随后对 PDE 残差的最小化使 PINN 精化场，并在原则上超越教师的精度。这种角色分离是所提框架的核心。

我们在三个非线性 PDE 上评估该框架。首先，一维黏性 Burgers 方程在只有一个解分支的问题上建立基线。其次，二维稳态 Allen–Cahn 方程探测叉式分岔附近的盆地选择，在该场景中平凡解 $u\equiv0$ 精确满足残差。第三，为检验实质性的分布外能力，我们把框架应用于二维稳态顶盖驱动方腔，把在雷诺数范围 $Re\in[100,800]$ 上训练的算子外推到 $Re=3200$。最后，消融研究通过移除外推阶段来隔离底层机制，旨在判定这些失效模式中的关键挑战究竟严格是残差优化，还是物理盆地选择。

## 2. 相关工作

**算子学习。** NO 学习函数空间之间的映射，原则上具有离散化不变性（Kovachki et al., 2023）。DeepONet（Lu et al., 2021a; Haghighat et al., 2025）通过"主干–分支"分解实现这一点；Fourier 神经算子（Li et al., 2020a）与更早的图核网络（Li et al., 2020b）分别工作在谱域与图域，Wavelet（Tripura & Chakraborty, 2023）、Laplace（Cao et al., 2024a）等变体针对局部特征（Lu et al., 2022; Cao et al., 2024b）；没有单一架构在所有问题类别上占优。物理信息 DeepONet（Wang et al., 2021c; Mandl et al., 2025）用残差损失替代数据损失，但保留了固定参数盒的限制；条件偏移下的迁移学习方法（Weiss et al., 2016; Goswami et al., 2022）只能借助偏移参数处的标注目标数据把训练好的算子扩展到新区域。我们的第 2 部分在没有标注数据、也不重新训练主干的情况下，在外推参数处复用冻结的基。

**PINN 及其失效模式。** 物理信息神经网络（Raissi et al., 2019）（以及深度 Galerkin 方法（Sirignano & Spiliopoulos, 2018）等相关残差最小化方案，综述见（Karniadakis et al., 2021））无需标注数据即可求解 PDE，但以难以优化著称。大量文献记录了这类基于坐标与物理信息的网络中的训练病态：谱偏差（Tancik et al., 2020; Wang et al., 2021b）、损失梯度不平衡（Wang et al., 2021a）、用神经正切核解释训练停滞的原因（Wang et al., 2022）、时间上的因果性违背（Wang et al., 2024b），以及深度方向上的不稳定性（Wang et al., 2024a）。补救手段涵盖损失重加权与自适应权重（Wang et al., 2021a; 2022; McClenny & Braga-Neto, 2023）、基于残差的自适应采样（Wang et al., 2026; Wu et al., 2023）、自适应激活（Jagtap et al., 2020）、梯度增强目标（Yu et al., 2022）、架构改动（Wang et al., 2024a），以及综合训练配方（Wang et al., 2023a）。研究较少的是盆地选择失效：在残差存在多个物理上不同的极小值的问题上（分岔分支、对称相关态、平凡常数解），从零训练的 PINN 可能收敛到与参考场不符的伪解分支，即使残差接近零。虽然时间与自适应采样补救措施能处理 Allen–Cahn 方程等特定 PDE 中的错误局部极小（Wang et al., 2024b; 2026），我们的结果针对的是上述其他补救措施未覆盖的更广泛的盆地选择失效。

**求解顶盖驱动方腔。** 顶盖驱动方腔是不可压缩流的经典基准：多重网格有限差分表（Ghia et al., 1982）、谱基准（Botella & Peyret, 1998）、高雷诺数细网格研究（Erturk et al., 2005），以及 $8192\times8192$ 的 Richardson 外推解（Marchi et al., 2021）仍是标准标尺。PINN 要困难得多：雷诺数升高会尖锐化角点奇异性并使残差最小化不稳定。Wang et al. (2023b) 表明 $Re=2000$–$5000$ 的原版 PINN 存在两个残差极小化者（一个匹配 DNS，一个非物理），通过加入熵–黏性项恢复唯一性。单案例最先进精度来自残差自适应的 PirateNet 架构（Wang et al., 2024a），这也是我们在 $Re=3200$ 处的比较对象。这些工作一次只求解一个方腔；我们则外推冻结的算子基，让粗糙的教师提供物理盆地。

**知识蒸馏。** 传统上知识蒸馏源于模型压缩（Hinton et al., 2015），其中较小的学生网络被训练去匹配更大、高度准确的教师。在该经典设置中，学生性能本质上被近似完美的教师所封顶。我们的方法根本不同：教师是仅提供粗糙分布外估计的神经算子，学生则明确被期望通过后续基于物理的优化超越它。因此，蒸馏权重会衰减并最终消失，而不是在训练全程保持有效。这与把学习模型用作初值猜测的科学计算方法有相通直觉，包括 PINN 的热启动策略（Wang et al., 2024a）与迭代求解器（Eshaghi et al., 2026）。然而，与仅在初始化时施加先验（Eshaghi et al., 2026）或刚性冻结先验表示（Desai et al., 2021; Goswami et al., 2020; Chakraborty, 2021）的方法不同，我们的框架把教师保留为持续但衰减的约束。这既提供必要引导，又让学生探索解景观，在把完全控制权移交给控制物理之前逐步放松不完美教师的影响。

## 3. 方法

### 3.1 共享架构

令 $s(\mathbf x;\mathbf p)$ 表示参数 $\mathbf p\in\mathbb R^{d_p}$ 在区域 $\Omega(\mathbf p)$ 上的未知解场。我们通过把拟设定义为如下形式来实施强边界强制：

$$
s(\mathbf x;\mathbf p)=g(\mathbf x;\mathbf p)+M(\mathbf x)\sum_{k=1}^{K}b_k(\mathbf p)\,\phi_k(\mathbf x), \tag{1}
$$

其中 $\{\phi_k\}_{k=1}^K$ 是由主干网络产生的空间基，$K$ 是主干基函数个数（等价于分支输出个数），$b_k(\mathbf p)$ 是分支系数，收集为向量 $\mathbf b(\mathbf p)=(b_1(\mathbf p),\dots,b_K(\mathbf p))$。这里 $g(\mathbf x;\mathbf p)$ 是满足边界条件的已知函数（边界提升），$M(\mathbf x)$ 是在边界 $\partial\Omega$ 上取零的距离乘子。通过这种构造精确施加边界数据，消除了对边界损失项的需求并稳定训练（Lu et al., 2021b）。

对 Allen–Cahn 问题，提升 $g$ 还包含非零初始剖面。由于平凡解（$s=0$）精确满足 Allen–Cahn PDE，这一附加项是防止网络坍缩到非物理零分支所必需的。因此，训练中不出现边界损失项，目标严格依赖于内部 PDE 残差的均方，$\mathcal R$ 是各问题特定的残差算子（三个 PDE 的显式形式见附录 A）：

$$
\mathcal L_{\mathrm{PDE}}(\mathbf p)=\left\|\mathcal R\left[s(\cdot;\mathbf p)\right]\right\|^2_{L^2(\Omega(\mathbf p))}, \tag{2}
$$

并在从有界基盒 $\mathcal B\subset\mathbb R^{d_p}$ 抽取的参数批次上平均。全文报告相对于参考场 $s_{\mathrm{ref}}$（按问题为解析解或有限差分解）的相对 $L^2$ 精度：

$$
\mathrm{Acc}=1-\varepsilon_{L^2},\qquad \varepsilon_{L^2}=\frac{\|\hat s-s_{\mathrm{ref}}\|_{L^2}}{\|s_{\mathrm{ref}}\|_{L^2}}, \tag{3}
$$

其中 $\hat s$ 是预测场。表 2 报告算子与两个 PINN 的 $\varepsilon_{L^2}$（标为误差），以及绝对性能增益（标为改进），定义为 $\varepsilon_{L^2,\mathrm{baseline}}-\varepsilon_{L^2,\mathrm{distilled}}$。论文其余部分以 $\mathrm{Acc}$（标为精度）报告性能。§4 中的三个问题都实例化拟设式 (1) 并针对残差目标式 (2) 训练；它们在表 1 汇总的三个架构方面不同：(i) 冻结空间基后构造锚系数的过程；(ii) 乘子 $M$ 在边界上消失的阶数；(iii) 主干特征的空间带宽。其他实现层面的差异（包括残差离散化与问题特定正则项）在附录 A.6 给出。

> **表 1（原文 Table 1）：** 所评估 PDE 上各问题的特定设计选择。

| 项目 | Burgers | Allen–Cahn | 方腔 |
|---|---|---|---|
| 场 / 算子 | 标量 $u$；$uu_x-\nu u_{xx}=0$ | 标量 $u$；$\nabla^2u+\lambda(u-u^3)=0$ | 流函数 $\psi$；涡量输运 |
| 参数 $\mathbf p$ | $(\nu,L)$ | $(\lambda,H)$ | $(Re,H)$ |
| 阶数 / 维数 | 二阶，1D | 二阶，2D | 四阶，2D |
| 设计选择 (i)：第 1 部分锚点 | 由分支自供 | 冻结基上的无数据 Gauss–Newton | 有限差分参考投影到基（8 次求解） |
| 设计选择 (ii)：边界提升 | 一阶乘子 | 种子提升 $\ell_0$ + 一阶乘子 | 二阶乘子 + 顶盖提升 |
| 设计选择 (iii)：主干带宽 | 中等，各向同性 $\sigma=6$ | 温和，各向同性（$\sigma=[3,3]$） | 中等，各向异性 $\sigma=[\sigma_\xi,\sigma_\eta]$ |
| 第 2、3 部分目标 | 更大 $L$ | 基盒之下的 $\lambda$（接近起振点） | 更大 $Re$（几何变体见附录 E） |

### 3.2 第 1 部分：基础算子

主干与分支通过在 $\mathbf p\sim\mathrm{Unif}(\mathcal B)$ 上最小化式 (2) 联合训练。收敛后冻结主干，使 $\{\phi_k\}$ 成为固定函数空间。随后在一小组基础点 $\{\mathbf p_i\}\subset\mathcal B$ 上构造锚集 $\{c_i\}$。这些锚点作为训练域内的可信参考系数，稍后将被插值以形成第 2 部分分布外外推的结构先验。三个问题只在锚点形成方式上不同，表现为对外部信息依赖程度递增的谱系（表 1，设计选择 i）。Burgers 直接存储训练好的分支输出。Allen–Cahn 通过在冻结基上对残差做阻尼 Gauss–Newton 求解来精化它，只使用残差及其精确 Jacobian（不使用参考场）。方腔在 $Re\in\{100,200,\dots,800\}$、固定 $H=1$ 下计算八个有限差分参考场，并按速度度量用岭最小二乘把每个场重新投影到冻结基上。这八次求解是主方腔流程曾使用的唯一外部数据。

> **脚注 1：** 附录 E 单独报告的长宽比外推在完整 $(Re,H)$ 盒上训练一个独立的基础算子，在 $\{100,200,300,400\}\times\{1.0,1.5,2.0\}$ 上有 12 个锚点；两种配置见表 7。

### 3.3 第 2 部分：向基盒之外外推

虽然参数延拓在 PINN 训练课程中常用于避免失效模式（Krishnapriyan et al., 2021），但无引导外推常漂移到非物理配置，伪极小化残差。为防止这一点，把基础锚点用低阶多项式 $c_{\mathrm{cont}}(\mathbf p)$ 插值，对 $K$ 个模态分别独立拟合，充当延拓先验。为到达目标 $\mathbf p^\ast\in\mathbb R^{d_p}\setminus\mathcal B$，分支在 $\mathbf p^\ast$ 处用两种不需要参考解的正则机制重新训练，使外推完全无数据。

**有界修正。** 在目标处，分支网络被重新优化以输出原始系数修正 $\Delta\mathbf b(\mathbf p)$（类似式 (1) 的 $\mathbf b(\mathbf p)$，但由新的第 2 部分分支头产生，而非第 1 部分分支）。$\Delta\mathbf b(\mathbf p)$ 不直接作为系数使用，而是作为有界扰动加到延拓先验上：

$$
\mathbf b_{\mathrm{comp}}(\mathbf p)=\mathbf c_{\mathrm{cont}}(\mathbf p)+\alpha\tanh\left(\Delta\mathbf b(\mathbf p)\right), \tag{4}
$$

其中 $\alpha$ 表示偏离先验的硬上限。若先验正确，则 $\Delta\mathbf b=\mathbf 0$ 最优。

**Gram 加权延拓惩罚。** 训练最小化

$$
\mathcal L_{\mathrm{total}}=\mathcal L_{\mathrm{PDE}}(\mathbf b_{\mathrm{comp}})+\beta\left\|\mathbf b_{\mathrm{comp}}-\mathbf c_{\mathrm{cont}}\right\|^2_{G(H)}, \tag{5}
$$

其中 $G(H)$ 是冻结基的场度量 Gram 矩阵，在长宽比 $H$ 处的物理几何上通过附录 A 的等参映射组装（对一维与固定几何问题，$G(H)$ 退化为常数矩阵 $G$）。在场度量（而非原始系数空间）中惩罚系数偏差，确保目标严格惩罚改变物理场的修改。初始标量权重 $\beta$ 对每个目标校准一次，使惩罚项在初始总目标损失中占固定预定比例。自此校准值起，$\beta$ 可在该步剩余过程中保持常数，或在目标的训练预算内指数退火到一个小的非零下限，让 PDE 残差随训练推进越来越多地主导收敛；问题特定选择见附录 C。

基本外推操作把基础锚点投影到新目标参数。若目标 $\mathbf p^\ast$ 离训练域足够近，可单次执行：先验在第 1 部分锚点上拟合一次，分支在 $\mathbf p^\ast$ 处用式 (4) 与式 (5) 直接重新训练。然而当单步跨越的参数距离过大时，外推采用增量自供策略。在该多阶段方法中，模型外推到中间目标；收敛后，这些中间解被追加到锚池，并在推进到下一阶段前重新拟合先验。例如，主方腔 $Re$ 外推采用四阶段延拓（对 $1/Re$ 的一维先验），几何变体对 $(1/Re,H)$ 拟合二维先验（附录 A），Allen–Cahn 需要两阶段序列（附录 A.6）。

本阶段的目标不是高目标精度，而是生成足以初始化第 3 部分的系数场，由第 3 部分再精化解。Allen–Cahn 问题说明了这一点：在叉式分岔附近，真实分支幅度按 $\sqrt{\lambda-\lambda_1}$ 缩放（$\lambda_1$ 为临界速率），这种形式解析多项式先验无法表示。因此，外推场在近起振目标处会如预期退化。

### 3.4 第 3 部分：向新求解器的受保护蒸馏

在目标 $\mathbf p^\ast$ 处，式 (4) 得到的合成场被传给一个在物理残差上从零训练的新 MLP-PINN $u_\phi$。关键的是，该学生网络放弃主干–分支分解与第 1 部分使用的专用边界提升。优化步 $t$ 上的训练损失定义为：

$$
\mathcal L(\phi;t)=\left\|\mathcal R[u_\phi]\right\|^2_{L^2(\Omega)}+\lambda_{\mathrm{BC}}\mathcal L_{\mathrm{BC}}+w(t)\left\|u_\phi-u_{\mathrm{teacher}}\right\|^2_{\Gamma(\mathbf x)}, \tag{6}
$$

其中 $\mathcal L_{\mathrm{BC}}$ 惩罚边界条件违背，$u_{\mathrm{teacher}}$ 是第 2 部分预测，$w(t)$ 是蒸馏计划，$\Gamma(\mathbf x)$ 是可选的逐点空间可靠性门（附录 B）。为展示模块化，我们采用两种策略。Allen–Cahn 与主 $Re$ 外推方腔使用无门（$\Gamma\equiv1$）的分段线性 $w(t)$，在最后训练阶段消失。相反，Burgers 与几何外推方腔配置使用物理自适应门：$w(t)$ 跟踪学生残差，而 $\Gamma(\mathbf x)$ 在高残差点局部衰减教师影响以容忍教师局部不准确。两种计划都在训练结束前严格消失，只留 PDE 与边界约束主导最终收敛。图 1 总结完整三阶段框架。

> **图 1（原文 Fig. 1）：** 三阶段框架示意图。

> **表 2（原文 Table 2）：** 三个所评估 PDE 上的性能汇总。

| 指标 | Burgers | Allen–Cahn | 方腔 |
|---|---|---|---|
| 训练范围 | $(\nu,L)\in[0.10,0.20]\times[1,2]$ | $(\lambda,H)\in[35,80]\times[1,2]$ | $(Re,H)\in[100,800]\times\{1\}$ |
| 目标 | $(\nu,L)=(0.05,4)$ | $(\lambda,H)=(12.5,3)$ | $(Re,H)=(3200,1)$ |
| OOD$^\ast$ 距离 | $2\times$ | 基盒下缘的 $0.35\times$ | $4\times$ |
| 算子：分布内误差 | $0.003\pm0.002$ | $0.0015\pm0.0004$ | $0.2586\pm0.1294$ |
| 算子：OOD 误差 | $0.12$ | $0.78$ | $0.53$ |
| 基线 PINN 误差 | $0.4123\pm0.1601$ | $1.00\pm0.00$ | $0.9800\pm0.0248$ |
| 蒸馏 PINN 误差（本文） | $0.0209\pm0.0043$ | $0.0037\pm0.001$ | $0.0663\pm0.0099$ |
| 改进 | $0.3914\pm0.1635$ | $0.9963\pm0.001$ | $0.9137\pm0.0341$ |

$^\ast$ OOD 表示分布外（out of distribution）。

## 4. 实验

我们通过一系列递进实验评估框架，以回答四个核心目标。第一，用黏性 Burgers 方程判定近似、分布外教师能否加速 PINN（§4.1）。第二，分析 Allen–Cahn 方程，确定为何这种迁移能在纯残差最小化失败的盆地选择中成功（§4.2）。第三，评估顶盖驱动方腔，检验该机制能否扩展到远离训练分布的复杂高维系统（§4.3）。最后，消融研究精确隔离框架中驱动成功的组件（§4.4）。

### 4.1 实验 1（基本迁移）：黏性 Burgers（1D）

一维黏性 Burgers 方程在具有唯一单调解流形、一个内部过渡层与 Cole–Hopf 闭式精确求值的受控设置中建立基本迁移机制。基础算子在 第 1 部分于 $L\in[1,2]$ 训练，并在 第 2 部分外推到 $\nu=0.05$ 处的 $L=4$，超出最大训练长度两倍。图 2(a) 展示冻结主干算子在该分布外目标处的行为：它捕获正确的激波位置与外部分支，但在过渡层出现超调。这正是框架旨在利用的精确"近似但结构准确"先验。在 $n=5$ 个独立随机种子上，蒸馏学生消除了超调，并在每次运行中达到图级精度地匹配解析解（图 2(f)）。它达到 97.91%±0.43% 的平均精度，而从头训练基线为 58.77%±16.01%，提升 39.14%±16.35%，在全部 5/5 个种子上成立。除更高均值外，蒸馏显著降低运行间方差：基线最终精度高度依赖种子，偶尔坍缩到较差局部解，而蒸馏学生无论初始化如何都一致收敛到真实解的紧邻域。蒸馏还收敛更快、最终残差更低，且可靠性门随学生残差下降而关闭（图 2 d）。

> **图 2（原文 Fig. 2）：** Burgers 方程在 $n=5$ 个种子上聚合的训练指标。面板 (a) 展示第 2 部分算子外推与解析参考的对比。其余五个面板详述第 3 部分蒸馏 PINN 的性能。

### 4.2 实验 2（盆地选择）：稳态 Allen–Cahn（2D）

本实验展示教师如何解决纯残差最小化无法解决的解分支歧义。在接近叉式分岔 $\lambda_1(H)=\pi^2(1+1/H^2)$ 的 $\lambda$ 处，主正分支 $u^\ast>0$ 呈现 $O(\sqrt{\lambda-\lambda_1})$ 幅度，而平凡解（$u\equiv0$）精确满足残差。我们在 $\lambda=12.5$、$H=3$（其中 $\lambda_1(3)\approx10.97$）处评估框架。该目标约在起振点上方 14%，真实峰值幅度约 0.45。图 3(a) 展示这一动态。基线 PINN 坍缩到平坦的 $u\equiv0$ 场，识别出一个数学上正确但物理平凡的全局极小化者；在 $n=5$ 个种子上，这种坍缩完全且确定，精度 0.00%±0.00%，峰值幅度仅 0.0002±0.0002，而真实峰值为 0.4530。第 2 部分算子（第二面板）正确识别单峰结构但高估幅度，因为多项式先验无法精确捕捉 $\sqrt{\lambda-\lambda_1}$ 起振行为，使其自身精度仅 32%。蒸馏该算子即使教师不精确，也能提供把学生拉入正确吸引盆所需的先验。随后的残差最小化锐化场：蒸馏 PINN 在形状与幅度上都匹配有限差分参考，各种子平均精度达 99.63%±0.10%。图 3(b) 定量证实：精度随蒸馏权重退火到零而攀升，中心线剖面与参考一致。这确认了框架的中心假设：不完美算子足够，因为其作用仅是识别正确物理盆地，而非提供精确解。这里，一个仅 32% 准确的教师仍可靠地把每个种子从平凡极小化者中救出。

> **原文疑点：** 正文称第 2 部分算子（Allen–Cahn）"自身精度仅 32%"，但表 2 给出该算子的 OOD 误差为 0.78；按式 (3)（$\mathrm{Acc}=1-\varepsilon_{L^2}$）对应精度应为 22%。二者不一致，此处按原文分别照录并加注。

> **图 3（原文 Fig. 3）：** Allen–Cahn 训练指标（$\lambda=12.5$，$H=3$），在 $n=5$ 个种子上聚合，并与有限差分参考对比。

### 4.3 实验 3（大幅分布外推）：顶盖驱动方腔（2D）

为展示可扩展性，顶盖驱动方腔引入一个四阶二维系统，并大幅外推到其基盒之外。主目标设为 $Re=3200$（远在 $Re\in[100,800]$ 训练域之外），以匹配 Wang et al. (2024a) 建立的单案例最先进 PINN 基准。第二个实验外推长宽比而非雷诺数，见附录 E。

> **图 4（原文 Fig. 4）：** $Re=3200$ 的顶盖驱动方腔。(a) 预测的 $u$ 与 $v$ 场。(b) 蒸馏学生与基线学生的速度幅值与流线。(c) 在 $x=0.5$ 与 $y=0.5$ 处的中心线剖面，与 Ghia et al. (1982) 对比。场与流线展示 $n=5$ 个种子上的集成均值。

图 4 展示 $Re=3200$ 的蒸馏学生。在 $n=5$ 个独立种子上聚合，$u$ 与 $v$ 场（a）成功捕获主涡与薄壁射流。流线（b）在蒸馏模型中重现主回流与两个下角涡，而基线完全无法捕获这些特征。因此中心线（c）与 Ghia et al. (1982) 和 Marchi et al. (2021) 建立的基准点紧密吻合，而基线严重偏离。

> **图 5（原文 Fig. 5）：** 顶盖驱动方腔（$Re=3200$）训练指标。实线与阴影分别表示 $n=5$ 个独立种子上的 $\mu\pm\sigma$。

图 5 详述优化轨迹：基线在近零精度处停滞并伴随噪声残差，而蒸馏学生在相同架构与步数预算下稳步攀升到高精度、最终残差更低。定量地，基线 PINN 完全无法收敛到正确物理状态，平均精度仅 2.00%±2.48%。相反，蒸馏学生一致解决解分支歧义，平均精度 93.37%±0.99%。这代表 91.4%±3.4% 的稳健精度提升，在全部 5/5 个初始化种子上一致成立。除更高均值外，蒸馏显著降低运行间方差，确认算子初始化有效防范 PINN 对随机参数初始化的固有敏感性。

就计算背景而言，表 3 把第 3 部分学生与 Wang et al. (2024a) 比较：我们的学生使用约 20% 的参数与 40% 的优化步数（250K 对 630K），但点求值更多。端到端地，第 1–3 部分需要 546K 优化步，但注意第 1 部分是一次性基盒成本，可跨后续目标复用。

> **表 3（原文 Table 3）：** 在 $Re=3200$ 下第 3 部分与 Wang et al. (2024a) 的计算对比。

| 指标 | 蒸馏 PINN（本文） | PirateNet |
|---|---|---|
| 相对 Ghia et al. (1982) 的 $L^2$ 误差 | $0.0663\pm0.0099$ | $0.0421$ |
| 深度 × 宽度 | $5\times256$ | $18\times256$ |
| 可训练参数 | 297 K | $\sim$1.32 M |
| 总训练步数 | 250 K | 630 K |
| 总点求值数 | $6.5\times10^9$ | $2.6\times10^9$ |

### 4.4 实验 4（机制消融）：第 2 部分的作用

§4.3 呈现完整框架，其中第 2 部分在蒸馏前把冻结主干算子沿四阶段 $Re$ 序列外推（§3.3）。这引出一个关键消融：增量延拓是否唯一决定盆地选择，还是直接在 $Re=3200$ 处评估第 1 部分算子就足以作为先验？为检验，我们保持第 3 部分架构、分段线性蒸馏计划与 250K 步训练预算不变，但通过直接在第 1 部分分支于目标处求值来初始化教师系数：$\mathbf c=\hat{\mathbf b}_{\mathrm{Part\,1}}(Re=3200,H=1)$。这把神经算子外推到其训练范围（$Re\in[100,800]$）四倍之外，而不使用正则化的多项式延拓先验式 (4)。然后我们把该消融模型与完整框架及无引导基线 PINN 比较。

表 4 与图 8 汇总 $n=5$ 个独立种子的集成结果。仅依赖无引导第 1 部分教师始终无法识别正确物理盆地。如平均速度场所示，学生的主涡位置错误，下角涡完全缺失，导致与基准（Ghia et al., 1982）的严重偏差。定量地，消融模型产生高度可变的平均精度 27.09%±13.49%。虽然这略优于基线 PINN 的灾难性坍缩（2.00%±2.48%），但远低于完整框架的 93.37%±0.99%。

> **表 4（原文 Table 4）：** 在 $Re=3200$、$H=1$ 的方腔上对第 2 部分延拓阶段的消融。

| 指标 | 完整框架 | 无第 2 部分 | 基线 PINN |
|---|---|---|---|
| 教师 | 延拓后的算子 | 直接第 1 部分算子 | 无 |
| 相对 $L^2$ 精度 | 93.37%±0.99% | 27.09%±13.49% | 2.00%±2.48% |
| PDE 残差 | $6.3\times10^{-6}$ | $1.3\times10^{-5}$ | $2.9\times10^{-5}$ |

关键在于，这代表盆地选择失效而非优化失效。消融学生的平均 PDE 残差干净地收敛到 $1.3\times10^{-5}$，与完整框架的 $6.3\times10^{-6}$ 和基线 PINN 的 $2.9\times10^{-5}$ 严格可比（表 4）。这表明三个网络都有效最小化控制物理方程，但无引导基线与消融模型都收敛到与 Ghia et al. (1982) 参考显著偏离的稳态。这种行为完美刻画了所提框架旨在规避的盆地选择脆弱性（§4.2）。

> **图 8（原文 Fig. 8）：** $Re=3200$、$H=1$ 下的方腔第 2 部分移除消融。实线与阴影表示 $n=5$ 个种子上的 $\mu\pm\sigma$。

## 5. 结论

我们提出了一个三阶段框架，解耦算子学习与物理信息神经网络各自不同的失效模式。本工作的核心发现（在三个非线性 PDE 上展示）是：近似神经算子无需高精度才能有效；它只需把学生网络初始化到正确的吸引盆内，之后残差最小化主导最终优化。我们的分析确认了这一机制，证明在标准 PINN 确定性地坍缩或停滞在非物理稳态的场景中，蒸馏学生能稳健恢复真实物理。未来方向包括扩展延拓先验以更好捕捉分岔起振、在时变多物理环境中评估框架，以及把该蒸馏策略与最先进架构（Wang et al., 2024a）集成以获得优化稳定性的复合改进。

## 可复现性声明

所有实验超参数见附录 C。用于评分的有限差分参考求解器（以及方腔问题中用于锚点构造的求解器）都是标准方法，其配置见附录 D。匿名实现与预训练模型见 https://anonymous.4open.science/r/PINN-Distillation-prototype-D3AF/。

## AI 使用声明

在本工作准备过程中，作者使用 Claude（Anthropic）协助编写用于分析与评估的代码，并起草与修订稿件文本；使用 Gemini（Google）帮助改进稿件文本。作者未使用生成式 AI 工具进行研究构思或实验设计；本文描述的三阶段框架与外推实验反映作者本人的概念贡献。作者也未使用生成式 AI 工具进行数据分析或结果解释。所有 AI 协助的工作在纳入前都经过审阅：LLM 生成的代码由作者验证并测试正确性，AI 起草与修订的稿件文本由所有作者审阅和编辑以确保准确与清晰。作者对已发表文章的内容承担全部责任。

## 参考文献（英文原书目）

- [1] O. Botella and R. Peyret. Benchmark spectral results on the lid-driven cavity flow. Computers & Fluids, 27(4):421–433, 1998. doi: 10.1016/S0045-7930(98)00002-4.
- [2] Qianying Cao, Somdatta Goswami, and George Em Karniadakis. Laplace neural operator for solving differential equations. Nature Machine Intelligence, 6(6):631–640, 2024a.
- [3] Qianying Cao, Somdatta Goswami, Tapas Tripura, Souvik Chakraborty, and George Em Karniadakis. Deep neural operators can predict the real-time response of floating offshore structures under irregular waves. Computers & Structures, 291:107228, 2024b.
- [4] Souvik Chakraborty. Transfer learning based multi-fidelity physics informed deep neural network. Journal of Computational Physics, 426:109942, 2021.
- [5] Shaan Desai, Marios Mattheakis, Hayden Joy, Pavlos Protopapas, and Stephen Roberts. One-shot transfer learning of physics-informed neural networks. arXiv preprint arXiv:2110.11286, 2021.
- [6] Ercan Erturk, Thomas C Corke, and Cihan Gökçöl. Numerical solutions of 2-d steady incompressible driven cavity flow at high reynolds numbers. International journal for Numerical Methods in fluids, 48(7):747–774, 2005.
- [7] Mohammad Sadegh Eshaghi, Cosmin Anitescu, Navid Valizadeh, Yizheng Wang, Xiaoying Zhuang, and Timon Rabczuk. Nows: Neural operator warm starts for accelerating iterative solvers. Computer Methods in Applied Mechanics and Engineering, 458:118989, 2026.
- [8] UKNG Ghia, Kirti N Ghia, and CT Shin. High-re solutions for incompressible flow using the navier-stokes equations and a multigrid method. Journal of computational physics, 48(3):387–411, 1982.
- [9] Somdatta Goswami, Cosmin Anitescu, Souvik Chakraborty, and Timon Rabczuk. Transfer learning enhanced physics informed neural network for phase-field modeling of fracture. Theoretical and Applied Fracture Mechanics, 106:102447, 2020.
- [10] Somdatta Goswami, Katiana Kontolati, Michael D Shields, and George Em Karniadakis. Deep transfer operator learning for partial differential equations under conditional shift. Nature Machine Intelligence, 4(12):1155–1164, 2022.
- [11] Ehsan Haghighat, Mohammad Hesan Adeli, S Mohammad Mousavi, and Ruben Juanes. Stonet: A neural operator for modeling solute transport in micro-cracked reservoirs. Advances in Water Resources, pp. 105046, 2025.
- [12] Geoffrey Hinton, Oriol Vinyals, and Jeff Dean. Distilling the knowledge in a neural network. arXiv preprint arXiv:1503.02531, 2015.
- [13] Ameya D Jagtap, Kenji Kawaguchi, and George Em Karniadakis. Adaptive activation functions accelerate convergence in deep and physics-informed neural networks. Journal of Computational Physics, 404:109136, 2020.
- [14] George Em Karniadakis, Ioannis G Kevrekidis, Lu Lu, Paris Perdikaris, Sifan Wang, and Liu Yang. Physics-informed machine learning. Nature Reviews Physics, 3(6):422–440, 2021.
- [15] Nikola Kovachki, Zongyi Li, Burigede Liu, Kamyar Azizzadenesheli, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Neural operator: Learning maps between function spaces with applications to pdes. Journal of Machine Learning Research, 24(89):1–97, 2023.
- [16] Aditi Krishnapriyan, Amir Gholami, Shandian Zhe, Robert Kirby, and Michael Mahoney. Characterizing possible failure modes in physics-informed neural networks. Advances in neural information processing systems, 34:26548–26560, 2021.
- [17] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Fourier neural operator for parametric partial differential equations. arXiv preprint arXiv:2010.08895, 2020a.
- [18] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Neural operator: Graph kernel network for partial differential equations. arXiv preprint arXiv:2003.03485, 2020b.
- [19] Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, and George Em Karniadakis. Learning nonlinear operators via deeponet based on the universal approximation theorem of operators. Nature machine intelligence, 3(3):218–229, 2021a.
- [20] Lu Lu, Raphael Pestourie, Wenjie Yao, Zhicheng Wang, Francesc Verdugo, and Steven G Johnson. Physics-informed neural networks with hard constraints for inverse design. SIAM Journal on Scientific Computing, 43(6):B1105–B1132, 2021b.
- [21] Lu Lu, Xuhui Meng, Shengze Cai, Zhiping Mao, Somdatta Goswami, Zhongqiang Zhang, and George Em Karniadakis. A comprehensive and fair comparison of two neural operators (with practical extensions) based on fair data. Computer Methods in Applied Mechanics and Engineering, 393:114778, 2022.
- [22] Luis Mandl, Somdatta Goswami, Lena Lambers, and Tim Ricken. Separable physics-informed deeponet: Breaking the curse of dimensionality in physics-informed machine learning. Computer Methods in Applied Mechanics and Engineering, 434:117586, 2025.
- [23] Carlos Henrique Marchi, Cosmo Damião Santiago, and Carlos Alberto Rezende de Carvalho, Jr. Lid-driven square cavity flow: A benchmark solution with an 8192×8192 grid. Journal of Verification, Validation and Uncertainty Quantification, 6(4):041004, 2021.
- [24] Levi D McClenny and Ulisses M Braga-Neto. Self-adaptive physics-informed neural networks. Journal of Computational Physics, 474:111722, 2023.
- [25] Ken Perlin. Improving noise. In Proceedings of the 29th annual conference on Computer graphics and interactive techniques, pp. 681–682, 2002.
- [26] Maziar Raissi, Paris Perdikaris, and George E Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational physics, 378:686–707, 2019.
- [27] Justin Sirignano and Konstantinos Spiliopoulos. Dgm: A deep learning algorithm for solving partial differential equations. Journal of computational physics, 375:1339–1364, 2018.
- [28] Matthew Tancik, Pratul Srinivasan, Ben Mildenhall, Sara Fridovich-Keil, Nithin Raghavan, Utkarsh Singhal, Ravi Ramamoorthi, Jonathan Barron, and Ren Ng. Fourier features let networks learn high frequency functions in low dimensional domains. Advances in neural information processing systems, 33:7537–7547, 2020.
- [29] Tapas Tripura and Souvik Chakraborty. Wavelet neural operator for solving parametric partial differential equations in computational mechanics problems. Computer Methods in Applied Mechanics and Engineering, 404:115783, 2023.
- [30] Sifan Wang, Yujun Teng, and Paris Perdikaris. Understanding and mitigating gradient flow pathologies in physics-informed neural networks. SIAM Journal on Scientific Computing, 43(5):A3055–A3081, 2021a.
- [31] Sifan Wang, Hanwen Wang, and Paris Perdikaris. On the eigenvector bias of fourier feature networks: From regression to solving multi-scale pdes with physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 384:113938, 2021b.
- [32] Sifan Wang, Hanwen Wang, and Paris Perdikaris. Learning the solution operator of parametric partial differential equations with physics-informed deeponets. Science advances, 7(40):eabi8605, 2021c.
- [33] Sifan Wang, Xinling Yu, and Paris Perdikaris. When and why pinns fail to train: A neural tangent kernel perspective. Journal of Computational Physics, 449:110768, 2022.
- [34] Sifan Wang, Shyam Sankaran, Hanwen Wang, and Paris Perdikaris. An expert's guide to training physics-informed neural networks. arXiv preprint arXiv:2308.08468, 2023a.
- [35] Sifan Wang, Bowen Li, Yuhan Chen, and Paris Perdikaris. Piratenets: Physics-informed deep learning with residual adaptive networks. Journal of Machine Learning Research, 25(402):1–51, 2024a.
- [36] Sifan Wang, Shyam Sankaran, and Paris Perdikaris. Respecting causality for training physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 421:116813, 2024b.
- [37] Wei Wang, Tang Paai Wong, Haihui Ruan, and Somdatta Goswami. Causality-respecting adaptive refinement for pinns: enabling precise interface evolution in phase field modeling. Machine Learning for Computational Science and Engineering, 2(1):10, 2026.
- [38] Zhicheng Wang, Xuhui Meng, Xiaomo Jiang, Hui Xiang, and George Em Karniadakis. Solution multiplicity and effects of data and eddy viscosity on navier-stokes solutions inferred by physics-informed neural networks. arXiv preprint arXiv:2309.06010, 2023b.
- [39] Karl Weiss, Taghi M Khoshgoftaar, and DingDing Wang. A survey of transfer learning. Journal of Big data, 3(1):9, 2016.
- [40] Chenxi Wu, Min Zhu, Qinyang Tan, Yadhu Kartha, and Lu Lu. A comprehensive study of non-adaptive and residual-based adaptive sampling for physics-informed neural networks. Computer Methods in Applied Mechanics and Engineering, 403:115671, 2023.
- [41] Jeremy Yu, Lu Lu, Xuhui Meng, and George Em Karniadakis. Gradient-enhanced physics-informed neural networks for forward and inverse pde problems. Computer Methods in Applied Mechanics and Engineering, 393:114823, 2022.

## 附录 A. 共享架构的逐问题实例化

### A.1 区域与等参映射

两个二维问题定义在 $\Omega_H=(0,1)\times(0,H)$ 上；一维问题定义在 $(0,L)$ 上。参考域 $(\xi,\eta)\in[0,1]^2$ 通过 $(x,y)=(\xi,H\eta)$ 映射到物理坐标，给出 $\partial_x=\partial_\xi$ 与 $\partial_y=H^{-1}\partial_\eta$。类似地，一维参考坐标 $\xi\in[0,1]$ 通过 $x=L\xi$ 映射到物理域，给出 $\partial_x=L^{-1}\partial_\xi$。主干基仅定义在参考域上，因此几何只通过代数链式法则权重进入。冻结基的参考空间偏导数保持几何无关；因此在新几何（即新的 $L$ 或 $H$）上组装物理算子可简化为代数缩放。

### A.2 Burgers：PDE、拟设、残差

在 $(0,L)$ 上，$u(0)=+A$、$u(L)=-A$（所有实验中取 $A=1$）：

$$
u\,\partial_xu-\nu\,\partial_{xx}u=0, \tag{7}
$$

其拟设为 $u(\xi;\mathbf p)=A(1-2\xi)+4\xi(1-\xi)\sum_k b_k(\mathbf p)\phi_k(\xi)$，残差 $r=L^{-1}u\partial_\xi u-\nu L^{-2}\partial_{\xi\xi}u$。在式 (1) 的记号下，边界提升为 $g(\xi;\mathbf p)=A(1-2\xi)$，乘子为 $M(\xi)=4\xi(1-\xi)$，在 $\xi\in\{0,1\}$ 处一阶消失（表 1，设计选择 ii）。

### A.3 Allen–Cahn：PDE、拟设、残差、分岔

在 $\Omega_H$ 上，$u=0$ 于 $\partial\Omega_H$：

$$
\nabla^2u+\lambda(u-u^3)=0. \tag{8}
$$

临界速率 $\lambda_1(H)=\pi^2(1+1/H^2)$，表示 $-\nabla^2$ 在区域上的第一 Dirichlet 特征值。低于 $\lambda_1(H)$ 时唯一解是平凡态 $u\equiv0$；高于它时，沿 $-\nabla^2$ 的主（无节、定号）特征方向分岔出一对 $\pm u^\ast$，在起振点附近按 $\|u^\ast\|_\infty\sim\sqrt{\lambda-\lambda_1}$ 缩放，并在远高于临界速率时饱和到 $\|u^\ast\|_\infty\to1$，边界层宽度约为 $1/\sqrt{\lambda}$。由于种子提升 $\ell_0>0$（定义见下）使拟设偏向这对分支中的正支，我们取 $u^\ast>0$（主正分支）作为目标解。基础训练域 $\lambda\in[35,80]$、$H\in[1,2]$ 限定在舒适的超临界区。

拟设采用固定的非平凡种子提升 $\ell_0(\xi,\eta)=A_0\sin(\pi\xi)\sin(\pi\eta)$，所有实验取 $A_0=0.3$：

$$
u(\xi,\eta;\mathbf p)=A_0\sin(\pi\xi)\sin(\pi\eta)+16\xi(1-\xi)\eta(1-\eta)\sum_k b_k(\mathbf p)\phi_k(\xi,\eta). \tag{9}
$$

在式 (1) 的记号下，$g(\xi,\eta;\mathbf p)=\ell_0(\xi,\eta)$（与 $\mathbf p$ 无关），$M(\xi,\eta)=16\xi(1-\xi)\eta(1-\eta)$，在 $\partial\Omega_H$ 上一阶消失（表 1，设计选择 ii）。该构造在初始化处显式打破 $u\equiv0$ 简并；令 $\mathbf b\equiv0$ 得到正的内部分布而非平凡零场。种子函数在 $\partial\Omega_H$ 上消失且满足 $\nabla^2\ell_0=-\pi^2(1+H^{-2})\ell_0=-\lambda_1(H)\ell_0$：它是线性 Laplacian 的特征函数，特征值恰好等于临界分岔速率，但它不是非线性残差方程式 (8) 的特征函数，因此它本身永远不会成为训练的伪不动点。

### A.4 方腔：PDE、拟设、残差

流函数 $\psi$ 满足涡量输运方程：

$$
-u\,\partial_x(\nabla^2\psi)-v\,\partial_y(\nabla^2\psi)+Re^{-1}\nabla^4\psi=0,\qquad u=\partial_y\psi,\ v=-\partial_x\psi, \tag{10}
$$

在所有壁上施加速度 Dirichlet 条件，并给定顶盖速度 $u_{\mathrm{lid}}$。拟设 $\psi=g(\mathbf x)+M(\mathbf x)\sum_k b_k\phi_k(\mathbf x)$ 采用提升函数 $g(\xi,\eta)=Hu_{\mathrm{lid}}(\xi)(\eta^3-\eta^2)$ 与乘子 $M=(16\xi(1-\xi)\eta(1-\eta))^2$。由于 $M$ 在所有边界上二阶消失（表 1，设计选择 ii），$\psi$ 与其法向导数 $\partial_n\psi$ 都独立于网络系数精确满足边界条件。

**正则化顶盖剖面。** 均匀驱动顶盖（$u=1$）在两个顶角处引入速度不连续，那里移动边界与静止侧壁相交。该角点奇异性产生无界涡量，常使高 $Re$ 残差训练不稳定（Wang et al., 2023b）。为规避这一点，我们正则化边界条件。顶盖速度在顶壁内部精确保持为 1，并在宽度 $\delta=0.12$ 的边缘内于每个角点平滑过渡到 0：

$$
u_{\mathrm{lid}}(\xi)=S\left(\frac{\xi}{\delta}\right)S\left(\frac{1-\xi}{\delta}\right),\qquad
S(t)=\begin{cases}0, & t<0,\\ 6t^5-15t^4+10t^3, & 0\le t\le1,\\ 1, & t>1,\end{cases} \tag{11}
$$

其中 $S$ 是 Perlin 五次 smootherstep 函数（Perlin, 2002）。该构造确保数值、斜率与曲率匹配（$S(0)=0$、$S(1)=1$，两端 $S'=S''=0$），保证向平坦核心的过渡在二阶导数以内不引入梯度不连续。取 $\delta=0.12$ 时，顶盖在跨距中央 76% 上精确为 1，仅在窄角边缘内修改物理驱动力。该相同的 $u_{\mathrm{lid}}$ 剖面应用于提升 $g$、有限差分参考求解器与第 3 部分学生的边界损失，确保教师与学生求解完全相同的正则化边值问题。

**第 3 部分原始变量表述。** 与第 1–2 部分在流函数 $\psi$ 上操作不同，第 3 部分方腔学生是原始变量 PINN $u_\phi(\mathbf x)=(u_\phi,v_\phi,p_\phi)$，直接在稳态不可压缩 Navier–Stokes 方程上训练：

$$
u_\phi\,\partial_xu_\phi+v_\phi\,\partial_yu_\phi=-\partial_xp_\phi+Re^{-1}\left(\partial_{xx}u_\phi+\partial_{yy}u_\phi\right), \tag{12}
$$

$$
u_\phi\,\partial_xv_\phi+v_\phi\,\partial_yv_\phi=-\partial_yp_\phi+Re^{-1}\left(\partial_{xx}v_\phi+\partial_{yy}v_\phi\right), \tag{13}
$$

$$
\partial_xu_\phi+\partial_yv_\phi=0. \tag{14}
$$

Dirichlet 速度条件以软方式施加：在左、右、下壁上 $u_\phi=v_\phi=0$，在顶壁上 $u_\phi=u_{\mathrm{lid}}(x)$、$v_\phi=0$，使用贯穿整个流程的相同正则化顶盖剖面式 (11)。由于 $p_\phi$ 只能确定到相差一个加性常数，我们施加软规范惩罚，把其在区域中心的值固定为零，$p_\phi(0.5,H/2)\approx0$。完整第 3 部分目标为

$$
\mathcal L(\phi;t)=\mathcal L_{\mathrm{mom},x}+\mathcal L_{\mathrm{mom},y}+\mathcal L_{\mathrm{cont}}+\lambda_{\mathrm{BC}}\mathcal L_{\mathrm{BC}}+\lambda_{\mathrm{gauge}}\,p_\phi(0.5,H/2)^2+w(t)\mathcal L_{\mathrm{distill}}(t), \tag{15}
$$

其中 $\mathcal L_{\mathrm{mom},x}$、$\mathcal L_{\mathrm{mom},y}$ 与 $\mathcal L_{\mathrm{cont}}$ 是式 (12)–(14) 在内部配点上的均方残差，$\mathcal L_{\mathrm{BC}}$ 是边界速度违背的均方，$\lambda_{\mathrm{BC}}$、$\lambda_{\mathrm{gauge}}$ 是表 7 报告的动量归一化边界与规范权重（主 $Re$ 外推目标分别为 10.0 与 10.0；动量项权重为 1）。蒸馏项仅施加于速度：

$$
\mathcal L_{\mathrm{distill}}(t)=\left\|u_\phi-u_{\mathrm{teacher}}\right\|^2_{\Gamma(\mathbf x)}+\left\|v_\phi-v_{\mathrm{teacher}}\right\|^2_{\Gamma(\mathbf x)}, \tag{16}
$$

其中 $(u_{\mathrm{teacher}},v_{\mathrm{teacher}})=(\partial_y\psi_{\mathrm{teacher}},-\partial_x\psi_{\mathrm{teacher}})$ 是第 2 部分流函数场诱导的速度，由冻结的第 2 部分网络自动微分得到。不对 $p_\phi$ 施加蒸馏目标：流函数教师不携带压力信息，因此压力场仅由动量残差与规范惩罚约束。该第 3 部分原始变量表述同样用于 $Re$ 外推（§4.3）与 $H$ 外推（附录 E）方腔实验；相比之下，Burgers 与 Allen–Cahn 学生保留标量场损失式 (6) 直接作用于 $u_\phi$，因为这些问题没有压力或连续性约束。

动量与连续性残差的内部配点并非均匀采样：壁面层厚度按 $\delta_{\mathrm{wall}}\sim Re^{-1/2}$ 缩放，与均匀采样间距相当或更小，否则学生会平滑掉近壁速度极值。我们改为从薄近壁带（宽度 $4Re^{-1/2}$，偏向各壁）抽取 40% 内部点，其余 60% 均匀抽取，并对基线与蒸馏分支同样施加，以免偏置比较。蒸馏查询点均匀采样而非壁面聚集，因为教师的速度误差在壁面附近最大，聚集在那里会把蒸馏拉力集中在其最不可靠的信号上。

### A.5 空间带宽与谱偏差

标准基于坐标的网络表现出谱偏差，因此使用随机 Fourier 嵌入把表示高频特征的负担转移到基正弦的解析导数上。所需带宽随 PDE 阶数缩放：进入 $n$ 阶残差的频率 $k$ 分量被放大约 $k^n$ 倍，对二阶 Burgers 与 Allen–Cahn 系统以 $k^2$ 为界，但对四阶方腔系统可达 $k^4$，并进一步被高长宽比下的 $H^{-4}$ 因子恶化。因此方腔的主干带宽是三者中最受限的，使用各向异性 $\sigma=[\sigma_\xi,\sigma_\eta]$；Allen–Cahn 与 Burgers 使用更温和的各向同性带宽。三者的精确值见表 5–7。

### A.6 三个实例的差异

除表 1 列出的三个主要设计选择外，各实现在四个具体算法参数上不同（详见附录 B 与 C）：(a) Burgers 基础算子采用纯自动微分残差；相反，Allen–Cahn 与方腔使用加权有限差分模板残差，这显著降低双调和方腔算子与批量 Allen–Cahn Laplacian 的计算开销。(b) Allen–Cahn 框架在第 1 部分损失中加入软幅度下限，惩罚坍塌向 $u\equiv0$ 的批次样本。这是对种子提升 $\ell_0$ 的补充正则，缓解网络在早期训练迭代中遇到竞争性平凡极小化者的风险。(c) §3.3 所述外推序列对 Burgers 方程与方腔长宽比变体（附录 E）需要一阶段，对 Allen–Cahn 问题需要两阶段，对主方腔 $Re$ 外推需要四阶段。(d) Allen–Cahn 与主 $Re$ 外推方腔采用无门、分段线性蒸馏计划；Burgers 与方腔 $H$ 外推使用物理自适应、可靠性门控计划（§3.4）。

## 附录 B. 蒸馏计划与可靠性门

第 3 部分损失式 (6) 用两个不同分量对蒸馏项加权：时间标量计划 $w(t)$ 与可选的逐点空间门 $\Gamma(\mathbf x)$。Allen–Cahn 系统与方腔 $Re$ 外推（正文）使用无门、分段线性时间计划（$\Gamma\equiv1$，恒等）；Burgers 方程与方腔 $H$ 外推（附录 E）使用物理自适应时间计划并配合下面定义的空间可靠性门。

**分段线性权重。** 在总训练预算 $T$ 的前 $f_{\min}$ 比例内，$w(t)$ 从初值 $w_0$ 衰减到中间值 $w_{\min}$，随后在剩余训练中衰减到 $w_{\mathrm{end}}=0$：

$$
w(t)=\begin{cases}
w_0+(w_{\min}-w_0)\dfrac{t}{f_{\min}T}, & t\le f_{\min}T,\\[8pt]
w_{\min}+(w_{\mathrm{end}}-w_{\min})\dfrac{t-f_{\min}T}{(1-f_{\min})T}, & t>f_{\min}T.
\end{cases} \tag{17}
$$

对方腔 $Re$ 外推（$Re=3200$），参数设为 $(w_0,f_{\min},w_{\mathrm{end}})=(0.7,0.7,0)$，其中 $w_{\min}=0$。这构成在训练前 70% 内线性衰减到零，随后仅做残差最小化。在最后训练窗口把 $w(t)$ 截断到精确为零，允许学生网络独立于教师结构误差精化解。

**物理自适应权重。** 虽然分段线性计划对 Allen–Cahn 与方腔 $Re$ 外推足够，我们对 Burgers 方程与方腔 $H$ 外推使用物理自适应计划，以展示框架适应替代蒸馏策略的灵活性。在 $T_{\mathrm{warm}}$ 个 epoch 的初始预热期内，$w(t)$ 线性增到 $w_{\max}\alpha_w$，之后权重动态跟踪学生网络的收敛：$w=w_{\max}\alpha_w\cdot\min(1,\bar r_\phi/\bar r_\phi^{\mathrm{ref}})$。这里 $\bar r_\phi$ 是学生 PDE 损失的指数移动平均（衰减因子 0.5），$\bar r_\phi^{\mathrm{ref}}$ 是其在预热期结束时的参考值。一旦训练超过 $T$ 的指定截止比例，$w(t)$ 被严格置零。对 Burgers 方程，参数配置为 $(\alpha_w,w_{\max},T_{\mathrm{warm}},\text{截止比例})=(0.8,1.0,200,0.5)$；方腔 $H$ 外推使用相同 $(\alpha_w,w_{\max},T_{\mathrm{warm}},\text{截止比例})$ 值。该表述根据学生改进的物理残差动态衰减教师影响，而不依赖预定 epoch 计划。

**空间可靠性门 $\Gamma(\mathbf x)$。** 启用时（如 Burgers 与方腔 $H$ 外推配置），空间权重 $\Gamma$ 作为逐配点因子，在学生 PDE 残差 $r_\phi(\mathbf x)$ 大的区域衰减蒸馏约束：

$$
\Gamma(\mathbf x)=\left(1-\tanh(\tau r_\phi(\mathbf x))\right)\vee\Gamma_{\mathrm{floor}},\qquad\Gamma_{\mathrm{floor}}=0.1. \tag{18}
$$

该值被钳制到最小下限 $\Gamma_{\mathrm{floor}}$，以确保教师先验永不完全失效。在学生充分满足控制物理（$r_\phi$ 小）的区域，门接近 1，教师场被严格施加；反之在残差大的区域，门向底值衰减。对 Burgers 方程，我们采用降低的温度 $\tau=2.0$，因为残差幅度 $|r_\phi|$ 在内部过渡层内达到峰值。由于该层包含一维教师提供的关键结构先验，高温门会不恰当地在该区域停用蒸馏，把知识迁移限制在平凡外部区域。降低 $\tau$ 确保门在中等残差值处保持足够开放，这一行为我们通过训练中监控门开放比例作了经验验证。方腔 $H$ 外推则使用 $\tau=20.0$（相同 $\Gamma_{\mathrm{floor}}=0.1$），反映二维动量系统不同的残差尺度。

## 附录 C. 超参数与训练细节

表 5 给出 Burgers 超参数（§4.1），表 6 给出 Allen–Cahn 超参数（§4.2），表 7 给出方腔在正文 $Re$ 外推（§4.3）与附录 E $H$ 外推（独立训练的基础算子）两种情形下的超参数。所有取值直接取自发布配置；代码随论文发布以提供更多实现细节。

> **表 5（原文 Table 5）：** Burgers 超参数（§4.1）。

| 项目 | 取值 |
|---|---|
| **第 1 部分 — 基础算子** | |
| 基盒 $(\nu,L)$ | $[0.10,0.20]\times[1.0,2.0]$ |
| 锚点 | $\{0.10,0.15,0.20\}\times\{1.0,1.5,2.0\}$（9） |
| 主干 / 分支 / 基 $K$ | $128\times5$ tanh / $128\times4$ tanh / 96 |
| Fourier 特征 $m/\sigma$ | 64 / 6.0 |
| 算子步数 / 学习率（→最小） | $2\times10^4$ / $10^{-3}\to10^{-6}$ |
| 配点数 / 参数批次 / 梯度裁剪 | 256 / 16 / 1.0 |
| **第 2 部分 — 延拓** | |
| 目标 | $(\nu,L)=(0.05,4.0)$ |
| 有界修正上限 $\alpha$ | 0.63 |
| $\beta$ 范围 | $[10^{-3},10^{8}]$ |
| 步数 / 学习率 / 批次 | $1.2\times10^4$ / $8\times10^{-4}$ / 8 |
| **第 3 部分 — 受保护蒸馏** | |
| 学生 / Fourier $m,\sigma$ | $128\times4$ tanh / 32, 8.0 |
| Epoch 数 / 学习率（→最小） | 4000 / $5\times10^{-4}\to10^{-6}$ |
| 配点 / 边界 / 蒸馏点数 | 1000 / 256 / 1000 |
| 边界权重 / 梯度裁剪 | 10.0 / 1.0 |
| 蒸馏计划 | 物理自适应 + 门 |
| 门 $\tau$/下限；$(\alpha_w,w_{\max},T_{\mathrm{warm}},\text{截止})$ | 2.0/0.1；(0.8,1.0,200,0.5) |
| 种子（$n$ / 起始） | 5 / 1729 |

> **表 6（原文 Table 6）：** Allen–Cahn 超参数（§4.2）。

| 项目 | 取值 |
|---|---|
| **第 1 部分 — 基础算子** | |
| 基盒 $(\lambda,H)$ | $[35,80]\times[1.0,2.0]$ |
| 锚点 | $\{35,50,65,80\}\times\{1.0,1.5,2.0\}$（12），GN 精化 |
| 主干 / 分支 / 基 $K$ | $128\times4$ tanh / $128\times4$ tanh / 128 |
| Fourier 特征 $m/\sigma$ | 32 / $[3.0,3.0]$ |
| 算子步数 / 学习率（→最小） | $3\times10^4$ / $10^{-3}\to10^{-6}$ |
| FD 残差网格 / 参数批次 | 48 / 8 |
| 抗坍塌幅度下限 / 权重 | $\mathrm{rms}(u)\ge0.25$ / 100 |
| GN 迭代 / 容差 / 阻尼 / 梯度裁剪 | 60 / $10^{-10}$ / $10^{-4}$ / 1.0 |
| **第 2 部分 — 延拓** | |
| 目标 | 两级阶梯：$\lambda=18\to\lambda=12.5$（均在 $H=3$） |
| 有界修正上限 $\alpha$ | 0.63 |
| $\beta$ 范围 | $[1.0,2000]$ |
| 多项式阶数 | 2 |
| 步数 / 学习率 / 批次 | $1.2\times10^4$ / $5\times10^{-4}$ / 8 |
| **第 3 部分 — 受保护蒸馏** | |
| 学生 / Fourier $m,\sigma$ | $64\times2$ tanh / 32, 2.0 |
| Epoch 数 / 学习率（→最小） | $10^4$ / $5\times10^{-4}\to10^{-7}$ |
| 配点 / 边界 / 蒸馏点数 | 2000 / 800 / 2000 |
| 边界权重 / 梯度裁剪 | 10.0 / 1.0 |
| 蒸馏计划 | 分段线性 |
| $(w_0,f_{\min},w_{\min},w_{\mathrm{end}})$ | (1.0, 0.5, 0.1, 0.0) |
| 种子（$n$ / 起始） | 5 / 1729 |

> **表 7（原文 Table 7）：** 方腔超参数：正文 $Re$ 外推（$Re=3200$，$H=1$，§4.3）与附录 E $H$ 外推（$H=3$，$Re=400$）。

| 项目 | 正文：$Re=3200$，$H=1$ | 附录 E：$Re=400$，$H=3$ |
|---|---|---|
| **第 1 部分 — 基础算子** | | |
| 基盒 $(Re,H)$ | $[100,800]\times\{1.0\}$ | $[100,400]\times[1.0,2.0]$ |
| 锚点数 | 8 | 12 |
| 主干 / 分支 / 基 $K$ | $128\times8$ tanh / $128\times8$ tanh / 192 | $256\times6$ tanh / $256\times4$ tanh / 192 |
| Fourier 特征 $m/\sigma$ | 64 / $[4.0,7.0]$ | 48 / $[4.0,7.0]$ |
| 算子步数 / 学习率（→最小） | $2\times10^5$ / $10^{-3}\to10^{-6}$ | $3\times10^5$ / $6\times10^{-4}\to10^{-6}$ |
| FD 残差网格 / 参数批次 | 160 / 4 | 64 / 8 |
| 岭 $\mu$ / 多项式阶数 | $10^{-2}$ / 2 | $10^{-2}$ / 3 |
| 梯度裁剪 | 1.0 | 1.0 |
| **第 2 部分 — 延拓** | | |
| 目标 | 四级 $Re$ 阶梯：$1400\to2000\to2500\to3200$ | 单次：$(Re,H)=(400,3)$ |
| 有界修正上限 $\alpha$ | 0.63 | 0.63 |
| $\beta$ 校准钳制 $[\beta_{\min},\beta_{\max}]$ | $[20,2000]$ | $[20,2000]$ |
| $\beta$ 步内衰减（始→末） | $\beta_0\to\beta_0/20$ | $\beta_0\to\beta_0/20$ |
| 步数 / 学习率 / 批次 | $2.4\times10^4$ / $5\times10^{-4}$ / 8 | $2.4\times10^4$ / $5\times10^{-4}$ / 8 |
| **第 3 部分 — 受保护蒸馏** | | |
| 学生 / Fourier $m,\sigma$ | $256\times5$ tanh / 64, 6.0 | $128\times3$ tanh / 32, 4.0 |
| Epoch 数 / 学习率（→最小） | $2.5\times10^5$ / $10^{-3}\to10^{-8}$ | $5\times10^4$ / $5\times10^{-4}\to10^{-6}$ |
| 配点 / 边界 / 蒸馏点数 | 6000 / 4000 / 4000 | 4000 / 800 / 4000 |
| 动量 / 边界 / 规范权重 | 1.0 / 10 / 10.0 | 1.0 / 10 / 1.0 |
| 梯度裁剪 | 1.0 | 1.0 |
| 蒸馏计划 | 分段线性 | 物理自适应 + 门 |
| 种子（$n$ / 起始） | 5 / 1729 | 单次运行 |

## 附录 D. 参考解配置

参考场仅用于事后评分，以及方腔中用于构造正文第 1 部分的八个锚点（附录 E 独立基础算子为十二个）；它们从不进入任何训练损失。对 Burgers，参考为 Cole–Hopf 闭式，精确求值。对 Allen–Cahn，参考为在五点 Laplacian 模板上对残差的 Newton 求解。对方腔，参考为规则化顶盖、流函数–涡量有限差分求解器，在均匀 $N_x=129$ 网格上（对 $H\ne1$ 用等参拉伸到 $N_y=\lceil(N_x-1)H\rceil+1$），迭代到稳态；它使用与算子相同的正则化顶盖剖面 $u_{\mathrm{lid}}$（附录 A.4）。每个方腔锚点求解在有表格可比处对照 Marchi et al. (2021) 高分辨率基准作门检查；规则化与奇异顶盖之间的预期几个百分点偏差在该检查中被计入。

## 附录 E. 附加结果：长宽比外推

§4.3 报告方腔第 3 部分在 $Re$ 外推目标（$Re=3200$、$H=1$）的结果，由固定 $H=1$、$Re\in[100,800]$、8 个锚点训练的基础算子得到。这里报告一个强调互补轴的独立实验：在完整 $(Re,H)$ 盒上以 12 个锚点（表 7）训练基础算子，在固定 $Re=400$ 下从 $H\in[1,2]$ 单次外推到 $H=3$，然后在该目标处对新学生 PINN 做第 3 部分蒸馏。其余机制与主流程完全相同（§3.3–§3.4）。该示例表明框架从蒸馏中获益并不特定于正文报告的 $Re$ 外推轴；当外推改为强调几何时，同样的受保护蒸馏机制同样加速收敛。

图 6 比较基线与蒸馏学生在训练进程（训练预算的 25/50/75/100%）中相对有限差分参考在两个速度分量上的表现。图 7 报告相应的总损失、相对 FD 参考的精度与 PDE 残差历史。与正文 $Re=3200$ 情形一样，蒸馏学生收敛更快，并在相同架构与步数预算下达到更低的最终残差与更高的最终精度。

> **图 6（原文 Fig. 6）：** 顶盖驱动方腔在 $Re=400$、$H=3$（基盒 $H\in[1,2]$）的 $H$ 外推示例。基线（左块）与蒸馏（右块）学生在训练 25/50/75/100% 时的水平（$u$，上排）与垂直（$v$，下排）速度预测场，对照有限差分参考（最右列）。

> **图 7（原文 Fig. 7）：** 顶盖驱动方腔 $H$ 外推示例（$Re=400$、$H=3$）的训练指标（总损失、相对 FD 参考的精度与 PDE 残差历史）。

## 图注与表注索引

本页图 1–8 的中文图注与表 1–7 的表注均按原文出现位置内联在正文中（图 1 见第 3.4 节，图 2–3 见第 4.1–4.2 节，图 4–5 见第 4.3 节，图 8 见第 4.4 节，图 6–7 见附录 E；表 1 见第 3.1 节，表 2 见第 3.4 节末，表 3–4 见第 4.3–4.4 节，表 5–7 见附录 C），此处不重复罗列。原文为 ICLR 2027 会议论文双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。正文中表 2 在原文位于第 6 页、紧接图 1 之后，本页据此放在第 3.4 节末尾。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.24947v1 全文（19 页，ICLR 2027）的中文译稿：摘要、第 1–5 节正文与编号小节、可复现性声明、AI 使用声明、图 1–8 的中文图注、表 1–7 的逐格转写、附录 A–E（含式 (7)–(18)、表 5–7 与图 6–7），以及参考文献 41 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(18) 逐式核对（重点核对式 (4)–(6)、(11)–(18)），表 1 用第 4 页、表 2 用第 6 页、表 3–4 用第 9 页、表 5–6 用第 16–17 页、表 7 用第 18 页渲染图逐格核对。已加注一处原文疑点：正文称 Allen–Cahn 第 2 部分算子"自身精度仅 32%"，与表 2 的 OOD 误差 0.78（按式 (3) 对应精度 22%）不一致，按原文分别照录并加注。本页不上传原文图片，图内曲线与颜色映射数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
