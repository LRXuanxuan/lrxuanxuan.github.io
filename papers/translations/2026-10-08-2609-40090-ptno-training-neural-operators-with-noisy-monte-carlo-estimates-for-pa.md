---
layout: page
title: "PTNO：用含噪蒙特卡洛估计训练神经算子求解粒子输运问题｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-40090-ptno-training-neural-operators-with-noisy-monte-carlo-estimates-for-pa/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/bc7e2cee19a2d09c/) · [原文 arXiv](https://arxiv.org/abs/2609.40090) · [全部目录](/papers/catalog/)

# PTNO：用含噪蒙特卡洛估计训练神经算子求解粒子输运问题

**原题：** PTNO: Training Neural Operators with Noisy Monte Carlo Estimates for Particle Transport Problems  
**作者：** Yubo Cao\*、Xi Deng\*、Mengqi Xia、Vignesh Gopakumar、Ander Gray、Anima Anandkumar（\*共同一作）；单位：加州理工学院（California Institute of Technology）、耶鲁大学（Yale University）、英国原子能管理局（UK Atomic Energy Authority）、法国综合理工学院 LIX/CNRS  
**版本：** arXiv:2609.40090v2（cs.AI），2026 年 10 月 1 日提交；PDF 版头日期为 2026 年 10 月 5 日；原文 41 页（含附录 A–P）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1–6 节正文、致谢、附录 A–P（含表 3–35）、全部图注（图 1–15）、表 1–35 逐格转写与参考文献 54 条英文原条目（按原编号）按原文结构录入。逐句逐式终校未做。

## 摘要

多重散射下的粒子输运是辐射输运与等离子体物理的核心问题，但高保真蒙特卡洛（Monte Carlo，MC）模拟必须追踪数目多得难以承受的粒子。基于学习的代理模型可以摊销这一代价，但其训练通常需要昂贵且充分收敛的 MC 解。我们提出**粒子输运神经算子**（Particle Transport Neural Operator，PTNO），一个直接从含噪、低成本 MC 标签学习粒子输运代理的神经算子框架。此类标签带来两个挑战：(1) 高方差，会破坏标准监督学习的稳定性；(2) 跨越许多个数量级的高动态范围（high dynamic range，HDR）。针对第一点，我们从大量构型的含噪标签学习解算子，从而摊销 MC 代价并泛化到未见过的构型。由于 MC 标签是无偏的，我们证明其上的平方损失与收敛解上的损失具有相同的最小化者；并且我们对训练场景数 $M$、每次渲染的 MC 样本数 $N$、每个场景的独立渲染数 $K$ 所作的预算分配研究表明，许多含噪场景优于较少的收敛场景。针对第二点，诸如对数这样的非线性变换会使含噪监督产生偏差。相反，PTNO 把标签保留在物理空间中，并用一个 softplus 输出层强制正性，该层能有效表示小值。我们进一步用逐点相对 $L^2$ 损失（pointwise relative $L^2$，PRelL2）训练——即 HDR 去噪与神经渲染中的 stop-gradient 相对损失——它用 stop-gradient 预测而不是含噪标签来归一化每个残差。我们在聚变反应堆中的中子输运与参与介质中的辐射输运上演示了 PTNO，在两个领域都得到精确的代理模型。在两个中子学任务上，PTNO 在相同 CPU 上比收敛 MC 快 $10^4$–$10^5$ 倍，在匹配精度下比 MC 便宜 $10^3$–$10^5$ 倍；在两个辐射输运任务上，达到匹配精度的 MC 代价是 PTNO 的 0.8–11 倍。

**关键词：** 神经算子 · 蒙特卡洛 · 粒子输运 · 含噪标签 · 中子学 · 辐射输运

## 1. 引言

粒子在介质中传播并与之相互作用时，其空间、角度与能量分布由粒子输运决定。它支撑着广泛的应用：参与介质中的光输运 [1]、屏蔽与反应堆设计中的中子输运 [2, 3]，以及等离子体物理中的中性粒子输运 [4, 5]。尽管这些领域在散射律、能量依赖与材料建模上各不相同，它们共享玻尔兹曼输运方程这一共同基础。

由于通用性与物理保真度，蒙特卡洛（MC）方法仍是求解复杂几何与高维状态空间中粒子输运问题的标准途径。MC 方法不直接求解玻尔兹曼方程，而是通过对可能的输运事件——自由飞行、散射、吸收与边界相互作用——上的概率分布进行采样，模拟粒子传播，并把解估计为对大量粒子历史（即单个粒子被模拟的轨迹）的期望。我们区分**低方差 MC 估计**（用大量粒子获得，因而接近收敛解）与**高方差 MC 估计**（用少量粒子获得，因而噪声大得多但显著更便宜）。

要获得光滑、低噪声的解，需要追踪大量粒子；当需要在变化的几何、材料构型或边界条件下反复求解时（例如在逆设计、优化与多物理耦合中），这一代价高得不可承受。近期的基于学习的方法通过学到的采样策略 [6, 7]、学到的缓存与方差缩减 [8, 9]，或对高方差 MC 估计去噪 [10–12] 来降低这一代价。然而这些方法要么在推断时仍保留 MC 模拟，要么作为后处理模块运行，因此预测仍依赖外部求解器。这促使我们追求另一个目标：一个直接把输运环境映射到其解场的独立代理模型。

神经算子 [13] 通过从输入函数——几何、材料系数、源、边界条件——学习到输出解场的映射，提供了一个自然的框架，使得无需运行求解器即可在变化的环境中快速推断。然而，训练通常需要接近收敛的 MC 标签，使数据集构造代价高昂。近期工作已表明这一要求可以放宽：Walk-on-Spheres 神经算子（WoSNO）[14] 从含噪的 walk-on-spheres 估计训练神经算子以求解椭圆型 PDE，展示了弱随机监督下的算子学习。但该结果局限于椭圆型 PDE，并未处理我们在此考虑的高维、多重散射输运问题。

遵循类似的思想，我们的**粒子输运神经算子**（PTNO）直接从**高方差 MC 估计**训练神经算子。关键洞见是：无偏随机估计足以在一族输运场景上学习底层算子，而不需要为每个输入提供收敛解。

另一个挑战是：粒子输运解为正，且常常跨越许多个数量级（在我们的 3D 注量（fluence）与中子学数据集中约为 10 到 17 个数量级），使直接回归的条件数很差。常见的补救办法是用目标量级来归一化误差——例如通过监督标签的倒数。然而当监督是含噪 MC 估计时，此类非线性操作会引入偏差，因为非线性函数与期望不可交换。我们表明，现有的偏差校正策略 [15] 在我们的训练动力学中并不能完全解决该问题。

PTNO 不校正经过变换的含噪目标，而是完全避免变换 MC 标签。它对输出施加 softplus 参数化以强制正性，并在原始值空间中评估误差。至于损失，标准的相对 $L^2$——把含噪标签放在分母——会导致不稳定；我们改用**逐点预测值**作归一化。这种 stop-gradient 相对 $L^2$，我们称为**逐点相对 $L^2$ 损失**（PRelL2），在图像去噪与神经渲染中已被确立用于在含噪 HDR 目标上训练 [16, 17, 9, 18, 19]；据我们所知，它此前尚未被用于从含噪 MC 输运标签训练神经算子，而在这里它为高方差监督提供了稳定的目标。

在固定的模拟预算下，这产生一个根本性的分配权衡：把许多粒子花在少数构型上会得到低方差标签，而每个构型少花一些粒子则能覆盖多得多的训练环境。在我们的实验中，一个收敛的 MC 标签代价最高可达我们所使用含噪标签的 $10^5$ 倍。因此，更廉价的标签允许更广地覆盖几何与材料构型，依靠 MC 估计的无偏性以及跨环境的算子学习来恢复底层解映射。

我们的框架与领域无关：我们把辐射输运与中子输运表述为统一粒子输运问题的两个实例，并表明尽管二者的物理参数与相互作用模型不同，一个单一的神经算子表述可以同时适用于两者。总之，我们有以下贡献：

- **PTNO**，一个直接从高方差、无偏 MC 标签学习粒子输运代理的神经算子框架，适用于多重散射下的辐射输运与中子输运。
- **对含噪监督的论证与预算研究**：无偏标签不改变平方损失的总体最小化者；一个受控分配研究——在训练场景数、每次渲染的蒙特卡洛样本数与每个场景的独立渲染数上变化——表明直到场景覆盖饱和之前，许多含噪场景优于较少的收敛场景，这与 walk-on-spheres 算子学习及蒙特卡洛代理模型 [14, 20] 一致。分配买到什么取决于损失：从 $10^5$ 到 $10^6$ 个远场场景，PTNO 在 $\log_{10}$ SSIM 上提升 0.14，而 $L^2$ 与对数 MSE 分别只提升 0.02 和 0.01。
- **对含噪 MC 标签经非线性变换所引入 Jensen 偏差的分析**，以及一套在辐射与中子输运神经算子上避免该偏差的方案：softplus 输出头（在原始物理空间中强制正性）、把最小化者锚定到标签均值的物理空间 $L^2$ 残差，以及来自先前去噪与渲染工作的 stop-gradient 相对损失 PRelL2 [16, 17, 9, 18, 19]；并分析该组合为何稳定。
- **在未见过的几何与材料构型上的预测演示**：在辐射输运基准上取得 3.4–8.2% 的 $\log_{10}$ 相对误差，在两个托卡马克中子输运基准上取得 4.5–8.4% 的误差（历史结果行在附录 F 中已作说明），同时在中子输运上比相同硬件上的收敛 MC 提供 $10^4$–$10^5$ 倍的更快预测。

> **图 1（原文 Fig. 1）：** PTNO 从极高方差的 MC 标签学习，并在推断时预测充分收敛的解。图中示意：粒子输运神经算子用 MC 监督训练（左侧绿框，第 1–2 列），输入 $a$ 的构型可变；底行给出 EU-DEMO 1/16 楔形中子输运任务。底行第 1–4 列是对一个留出构型的模拟 OpenMC 运行（无方差缩减），分别取 $N=10^3,10^4,10^5,10^6$ 个历史，在单个 24 线程 Xeon Platinum 8352Y CPU 上运行，标注其测得的输运墙钟时间（库初始化 35–41 s 已排除）。第 5 列是同一构型用权窗（一种方差缩减，通过分裂或随机终止粒子使各区域统计权重保持在目标带内）计算得到的收敛参考，代价为 5 280 核·小时。PTNO 用 softplus 输出激活保持正性与宽动态范围，我们的 PRelL2 损失把 MC 标签保留在物理空间中。

## 2. 相关工作

面向辐射与中子输运的基于学习的方法分为两类：用神经对应物替换输运管线的特定部件，或学习预测最终物理量的端到端代理模型。

**模块化神经部件。** 这一途径把神经网络集成进传统 MC 管线，以加速收敛或降低方差，同时不丢弃底层物理框架。

- **计算机图形学：** 在渲染中，神经网络被广泛用于去噪，把每像素样本数（samples per pixel，SPP）很少的含噪渲染映射为干净图像，并利用法线、反照率等几何特征作为辅助输入 [22, 11, 23]。除后处理之外，路径引导通过学习入射辐亮度分布降低方差 [24–26, 6]。神经辐亮度缓存用学习到的回归模型近似辐亮度场，以支持实时全局光照，从而替代昂贵的递归路径追踪 [9]。在含噪 HDR 目标上训练此类模型时，常用的相对 $L^2$ 以 stop-gradient 预测为归一化项，见 Noise2Noise 去噪 [16]、神经控制变量 [17]、辐亮度缓存 [9] 与 RawNeRF [18]；Tinits 与 Mann [19] 分析了哪些非线性目标变换能让 Noise2Noise 训练近似无偏。PRelL2 就是这一损失；我们把它用于输运问题上的神经算子。
- **其他输运领域：** 在核工程中，MC 中子输运模拟可能效率低下，因为只有少数粒子历史能到达探测器或深屏蔽区域，因此那里的计数（用于估计通量的累积粒子得分）收敛缓慢。经典方差缩减依赖“重要性”图，例如权窗：它把进入重要区域的粒子分裂、把不重要区域中的粒子随机终止，使统计权重保持在目标带内；CADIS/ADVANTG 通过确定性伴随输运自动构造它们 [27, 28]。近期工作探索了用于源偏置、通量预测或代理输运模型的神经替代方案 [29–31]。

**端到端代理与神经算子。** 另一条工作线用学习到的代理替换整个输运求解器。较早的努力使用逐点代理，例如物理信息神经网络（PINNs），在离散坐标上强制输运方程，但它们在几何与源项之间泛化很差 [32]。诸如 Fourier 神经算子（FNO）之类的神经算子转而学习函数空间之间的映射，从而能够跨环境泛化 [33]。代理模型已被用于等离子体建模 [34] 以及托卡马克与仿星器中氚增殖比的估计 [35, 36]，但尚未用于预测完整的中子通量场。现有的物理神经算子通常假定可获取高质量模拟数据，或依赖对粒子输运的刚性、高动态范围方程难以优化的 PDE 残差。我们通过直接从低样本 MC 估计训练神经算子来填补这一空白。WoS-NO 从 walk-on-spheres 估计训练椭圆型 PDE 的神经算子 [14]；Pratt 与 Prosper-Feldman [20] 针对马尔可夫链矩的蒙特卡洛代理表明，均值估计最受益于参数空间覆盖，而协方差等非线性目标还需要重复渲染以控制偏差；我们的分配研究进一步给出这一权衡如何与损失相互作用。

**偏差校正。** 偏差通过许多渠道进入 MC 管线。经典去偏通常针对由有限近似（步长、核半径、路径长度截断）产生的有偏估计量，通过构造越来越精确的估计量序列来去除它们。随机化去偏与多层蒙特卡洛可以把收敛的有偏近似转化为无偏近似，但仍然昂贵 [37–39]。在计算机图形学中，Misso 等 [15] 通过针对透射率、光子映射与有限差分导数的 Taylor 级数与伸缩级数校正统一了这一观点。我们的设定不同：监督目标在原始物理尺度上是无偏的，但对数变换会引入 Jensen 偏差。级数展开校正需要足够多的样本使估计量接近真值，这在此不现实。我们转而把含噪目标保留为无偏的线性形式，同时使用正的模型输出头与预测归一化残差，以在高动态范围下保持稳定。

## 3. 背景

我们把粒子输运表述为带含噪蒙特卡洛监督的算子学习问题。对每个输入构型 $a$（包括几何、材料属性与源参数），存在一个我们希望预测的未知输运响应 $\mathcal U(a)$。蒙特卡洛求解器从 $N$ 个粒子给出 $\mathcal U(a)$ 的无偏但含噪的估计 $\hat{\mathcal U}_N(a,\xi)$，我们的目标是直接从这个高方差估计训练神经算子。记号见附录 A。

粒子输运描述粒子在介质中经历散射与吸收的演化。其解可表示为对粒子轨迹的积分。设 $\xi\in\Omega$ 表示由一串自由飞行段与散射事件组成的粒子路径，并令 $\Omega=\cup_{k\ge1}\Omega_k$ 为按散射事件数 $k$ 分组的全部路径空间。可测响应可写为

$$
\mathcal U(a)=\int_{\Omega}f(\xi,a)\,\mathrm d\nu(\xi), \tag{1}
$$

其中 $\nu$ 是由输运过程诱导的底层路径空间测度。贡献函数 $f(\xi,a)$ 编码粒子轨迹 $\xi$ 的累积权重，包括源处发射、沿自由飞行段的衰减以及沿路径的散射事件（细节见附录 B）。该表述等价于玻尔兹曼方程的积分形式。

MC 方法通过从提议分布 $p$ 采样 $N$ 条路径 $\xi_i\sim p(\cdot\,|\,a)$ 并把它们收集为 $\xi=(\xi_1,\dots,\xi_N)$ 来近似该积分。估计量为

$$
\hat{\mathcal U}_N(a,\xi)=\frac1N\sum_{i=1}^N\frac{f(\xi_i,a)}{p(\xi_i\,|\,a)}. \tag{2}
$$

该估计量无偏，但常常方差很大，特别是在多重散射情形：路径长度 $k$ 可能很大，贡献函数 $f$ 只以隐式方式定义（即没有闭式），并且难以构造与 $f$ 成比例的采样分布 $p$。因此，获得 $\mathcal U(a)$ 的低噪声估计需要大量粒子路径，使数据生成代价高昂。

### 3.1 神经算子

神经算子学习函数空间之间的映射，为摊销参数化 PDE 与积分方程的解提供了一个自然框架。对粒子输运，我们把输运环境视为输入函数或构型 $a$，其中可包含空间变化的材料系数、边界条件、源参数与几何。相应的输出是由输运方程定义的可测响应或解场 $\mathcal U(a)$。目标是学习解算子

$$
\mathcal G_\theta: a\mapsto \mathcal U(a), \tag{3}
$$

其训练样本来自一族环境上的分布。与近似特定离散化下的有限维输入—输出映射的标准神经网络不同，神经算子被设计用于近似底层连续算子，并可在不同分辨率或离散化上评估。这一性质对粒子输运尤其有用，因为人们常常需要在许多几何、材料场或源条件下反复求解同一物理模型。训练之后，神经算子能以远低于一次完整 MC 求解的代价为新构型 $a$ 预测 $\mathcal U(a)$。

> **图 2（原文 Fig. 2）：** PTNO 在约一秒内预测 EU-DEMO 中子通量，比运行相同时长的蒙特卡洛更接近收敛参考。图为 EU-DEMO 1/16 楔形的一个留出源构型。(a) DEMO 托卡马克的渲染；线框标出所考察的极向截面 [21]。(b) 完整切片上的收敛参考通量（OpenMC 加权窗，网格 $700\times365\times730$，块平均到 $140\times73\times146$ 的训练网格；该场景 5 280 核·小时，24 个留出场景的中位数 6 130）；橙色框标出 (c)–(e) 放大的区域。(c) 放大区域上的神经算子（NO）预测（24 线程 Xeon Platinum 8352Y CPU 上 1.2 s）。(d) 与上述墙钟时间匹配的模拟蒙特卡洛（无方差缩减）：同一 CPU 上 $N=2\times10^3$ 个历史（输运 1.7 s），仍可见明显噪声。(e) 放大区域上的收敛参考，用于与 (c)–(d) 直接比较。PTNO 在训练网格上所用 CPU 时间约为收敛参考的 $6\times10^5$ 分之一（参考网格上为 $1.2\times10^4$ 分之一，见 5.3 节），其 $\log_{10}$ 相对 $L^2$ 比相同时长下的 MC 低 3.2 倍（24 个留出场景上的逐种子中位数；五种子均值±标准差为 $3.18\pm0.02$，范围 3.16–3.20 倍），并且只在参考有测量的单元上评分（附录 F）。

## 4. 方法

我们把粒子输运代理学习表述为从无偏但高方差的随机模拟标签进行算子学习。对每个输入构型 $a\sim\mathcal P_a$（包括几何、材料属性与源参数），令 $\mathcal U(a)$ 表示收敛的输运响应。MC 求解器给出含噪估计

$$
\hat{\mathcal U}_N(a,\xi)=\mathcal U(a)+\zeta_N(a,\xi), \tag{4}
$$

其中 $\xi$ 表示估计量使用的随机粒子历史。我们假定 MC 估计量在原始物理空间中无偏：

$$
\mathbb E_\xi[\hat{\mathcal U}_N(a,\xi)\,|\,a]=\mathcal U(a),\qquad
\mathbb E_\xi[\zeta_N(a,\xi)\,|\,a]=0. \tag{5}
$$

我们的目标是学习一个把 $a$ 映射到 $\mathcal U(a)$ 的神经算子，而不需要为每个训练构型提供充分收敛的 MC 标签。

### 4.1 从无偏随机标签学习

理想监督目标假定可获取收敛解：

$$
\mathcal L_C(\mathcal G_\theta)=\mathbb E_a\left[\left\|\mathcal G_\theta(a)-\mathcal U(a)\right\|_2^2\right]. \tag{6}
$$

实践中 $\mathcal U(a)$ 不可得，我们只能观测含噪 MC 标签 $\hat{\mathcal U}_N(a,\xi)$。用这些标签训练得到替代目标

$$
\mathcal L_N(\mathcal G_\theta)=\mathbb E_{a,\xi}\left[\left\|\mathcal G_\theta(a)-\hat{\mathcal U}_N(a,\xi)\right\|^2\right]. \tag{7}
$$

将式 4 的分解代入，得

$$
\begin{aligned}
\mathcal L_N(\mathcal G_\theta)
&=\mathbb E_{a,\xi}\left[\left\|\mathcal G_\theta(a)-\mathcal U(a)-\zeta_N(a,\xi)\right\|^2\right]\\
&=\mathcal L_C(\mathcal G_\theta)+\mathbb E_{a,\xi}\left[\left\|\zeta_N(a,\xi)\right\|^2\right]
-2\mathbb E_a\left[\left\langle \mathcal G_\theta(a)-\mathcal U(a),\ \mathbb E_\xi[\zeta_N(a,\xi)\,|\,a]\right\rangle\right].
\end{aligned}
$$

由 $\hat{\mathcal U}_N$ 的无偏性（式 5），交叉项消失；方差项 $\mathbb E_{a,\xi}[\|\zeta_N(a,\xi)\|_2^2]$ 与 $\mathcal G_\theta$ 无关。因此两个目标具有相同的总体最小化者：

$$
\arg\min_{\mathcal G_\theta}\mathcal L_N(\mathcal G_\theta)=\arg\min_{\mathcal G_\theta}\mathcal L_C(\mathcal G_\theta). \tag{8}
$$

因此，无偏蒙特卡洛标签在原始线性物理空间中提供了统计上有效的监督，即使单个标签方差很大。方差项会抬高损失值，但不改变最优解。

> **原文疑点：** 式 (6) 写作 $\|\cdot\|_2^2$，而式 (7) 及随后的分解写为 $\|\cdot\|^2$（无下标）；结合第 4 节后文（式 (13)–(17) 与附录 I）的用法，本页按 2-范数理解并保留原文写法未改，读者核对时请注意这一记号不一致。

### 4.2 非线性 MC 标签变换带来的 Jensen 偏差

尽管平方损失论证支持在线性物理空间中从含噪标签训练，但粒子输运解常常跨越许多个数量级（在我们的 3D 注量与中子学参考中约为 10 到 17 个数量级，表 24）。因此在值空间直接回归可能条件数很差：高通量区域主导损失，低通量区域则可能被忽略。自然的补救是逐点相对误差，它在平方与平均之前用局部场值归一化每个残差。若可获取干净解，相应的目标为

$$
\mathcal L_{\mathrm{rel}}(\mathcal G_\theta)=\mathbb E_a\left[\left\|(\mathcal G_\theta(a)-\mathcal U(a))/(\mathcal U(a)+\eta)\right\|^2\right].
$$

若我们改为把含噪 MC 标签代入倒数，目标变为

$$
\mathcal L_{N,\mathrm{rel}}(\mathcal G_\theta)=\mathbb E_{a,\xi}\left[\left\|(\mathcal G_\theta(a)-\hat{\mathcal U}_N(a,\xi))/(\hat{\mathcal U}_N(a,\xi)+\eta)\right\|^2\right]. \tag{9}
$$

该目标是有偏的，因为倒数与关于 MC 噪声的期望不可交换：

$$
\mathbb E_\xi\left[\frac{1}{\hat{\mathcal U}_N(a,\xi)+\eta}\,\middle|\,a\right]
\neq\frac{1}{\mathcal U(a)+\eta}
=\frac{1}{\mathbb E_\xi[\hat{\mathcal U}_N(a,\xi)\,|\,a]+\eta}. \tag{10}
$$

因此，对含噪标签施加非线性变换会改变期望训练目标，并把其最小化者移离 $\mathcal U$。我们把这一效应称为 **Jensen 偏差**。这促使我们方法中的关键设计选择：把 MC 标签保留在原始物理空间中，避免让它们经过对数或倒数归一化等非线性变换。

### 4.3 粒子输运神经算子

为了在不变换含噪标签的情况下处理高动态范围（HDR），我们修改代理模型的结构而不是目标。设 $\mathcal G_\theta(a)$ 是一个产生潜场的神经算子主干（例如 FNO）。我们通过 softplus 激活把该潜场映射到物理解空间：

$$
\mathcal B_\theta(a)=\mathrm{softplus}(\mathcal G_\theta(a))=\ln\left(1+\mathrm e^{\mathcal G_\theta(a)}\right). \tag{11}
$$

从此以后，$\mathcal G_\theta$ 表示该潜变量主干，而 $\mathcal B_\theta$ 表示 PTNO 的物理预测。对大的负潜变量值，softplus 近似为指数，从而允许负激活表示非常小的正物理值；对大的正值，它近似为线性，避免了纯指数参数化带来的梯度剧增。这使 softplus 成为高动态范围非负场的一种有用的正参数化。关键在于，预测 $\mathcal B_\theta(a)$ 是在原始物理尺度上直接与含噪 MC 标签比较。

**逐点相对 $L^2$。** 我们通过把预测用作局部归一化尺度，避免对 MC 标签施加非线性倒数。具体地，定义 $\mathcal S(x)=\max(\mathrm{sg}(x),\eta)$，其中 $\mathrm{sg}(\cdot)$ 表示 stop-gradient，$\eta>0$ 防止除以很小的值。

$$
\mathcal L_{N,\mathrm{PRel}}(\mathcal G_\theta)=\mathbb E_{a,\xi}\left[\left\|(\mathcal B_\theta(a)-\hat{\mathcal U}_N(a,\xi))/\mathcal S(\mathcal B_\theta(a))\right\|^2\right]. \tag{12}
$$

分母给出局部尺度估计，但在反向传播中被当作常数。因此梯度只通过分子中的线性残差，MC 标签仅以原始物理空间的形式进入损失。虽然精确的最小化者等价性论证只适用于无权平方损失，但该目标保留了一个关键要求：含噪 MC 标签不经过非线性变换。附录 I 表明，在关于 MC 噪声的期望下，只要输出 Jacobian 行满秩，其梯度除 $\mathcal B_\theta(a)=\mathcal U(a)$ 外没有平稳点。该公式并不新颖：同样的 stop-gradient 相对 $L^2$ 曾在含噪目标上训练 HDR 去噪器 [16, 19]、神经控制变量与辐亮度缓存 [17, 9]，以及含噪原始图像上的 NeRF [18]。我们所添加的是把它用于从含噪 MC 输运标签进行神经算子学习、与 softplus 头配对，以及针对该组合的上述平稳点分析。

**不动点。** 对固定输入 $a$，令 $\mathcal B_\theta=\mathcal B_\theta(a)$ 表示物理预测，$\mathcal U=\mathbb E_\xi[\hat{\mathcal U}_N(a,\xi)\,|\,a]$ 为含噪标签的均值，$D(\mathcal B)=\mathrm{diag}(\max(\mathcal B_i,\eta)^2)$ 为归一化项平方构成的对角矩阵，$J=\partial\mathcal B_\theta/\partial\theta$ 为输出 Jacobian。由于逐点分母被 detached，单样本损失 $\ell$ 的期望参数梯度（相差一个正常数）为

$$
\mathbb E_\xi[\nabla_\theta\ell\,|\,a]=J^\top D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U). \tag{13}
$$

因此，一个平稳点满足 $J^\top D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U)=0$。由于 $D(\mathcal B_\theta)$ 正定，归一化不会引入零方向。在 $J$ 行满秩（$JJ^\top\succ0$）的标准局部假设下，$J^\top$ 是单射，平稳性强制 $\mathcal B_\theta=\mathcal U$。因此 PRelL2 在输出空间中不会引入额外的有偏不动点。秩亏的 Jacobian 可能在参数空间中造出平稳点，但这一局限与普通平方损失共有。

**优化动力学。** stop-gradient 更新是输出空间势

$$
\Phi(\mathcal B_\theta)=\sum_i\int_{\mathcal U_i}^{\mathcal B_{\theta,i}}\frac{s-\mathcal U_i}{\max(s,\eta)^2}\,\mathrm ds \tag{14}
$$

的梯度，因为 $\nabla_\mathcal B\Phi=D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U)$。在连续时间梯度下降下，$\dot\theta=-J^\top\nabla_\mathcal B\Phi$，于是

$$
\frac{\mathrm d\Phi}{\mathrm dt}=-\nabla_\mathcal B\Phi^\top JJ^\top\nabla_\mathcal B\Phi\le0. \tag{15}
$$

因此期望动力学使 $\Phi$ 单调下降。依赖预测的分母会重新缩放逐体素的更新，但无法反转其方向或造出另一个输出空间极小值。在 $JJ^\top\succ0$ 下，动力学只在 $\mathcal B_\theta=\mathcal U$ 处停止；当 $\mathcal U_i=0$ 精确成立时，softplus 以边界极限的方式逼近该解，而不是在有限潜值处达到它。这是一个总体梯度论证；有限步长、随机梯度方差与秩亏参数化仍是实践中的考量。

**样本分配。** 在有限训练中，我们抽取 $M$ 个训练场景，并对每个场景做 $K$ 次独立渲染，每次渲染含 $N$ 个蒙特卡洛样本。经验目标为

$$
\hat{\mathcal L}_{M,K,N}(\theta)=\frac{1}{MK}\sum_{i=1}^M\sum_{j=1}^K\left\|(\mathcal B_\theta(a_i)-\hat{\mathcal U}_N(a_i,\xi_{i,j}))/\mathcal S(\mathcal B_\theta(a_i))\right\|^2, \tag{16}
$$

其中 $a_i$ 是第 $i$ 个场景，$\xi_{i,j}$ 是其第 $j$ 次渲染的样本。$M$ 控制场景分布的覆盖，$N$ 与 $K$ 控制监督的噪声。在固定粒子预算 $N_{\mathrm{tot}}=MKN$ 下，减小 $N$ 可把样本释放给更多场景 $M$ 或更多渲染 $K$；5.2 节从经验上研究这一权衡。两个精确事实与一个标准界组织起该权衡（附录 J.4）。第一，由于归一化项被 detached，对固定归一化项，一个场景的 $K$ 次渲染只通过其均值进入目标与梯度，其噪声方差对单样本方差 $\sigma^2$ 为 $\sigma^2/(NK)$；因此对 $K$ 次渲染各 $N$ 个样本的完整遍历等价于一次 $NK$ 个样本的渲染。第二，对无偏标签的无权平方损失，可实现的类 $\mathcal F$ 在有效维数 $d_{\mathrm{eff}}$ 下的标准最小二乘界给出

$$
\mathbb E R(\hat\theta)-\inf_{\theta\in\Theta}R(\theta)\lesssim\mathcal E_M(\mathcal F)+\frac{\sigma^2d_{\mathrm{eff}}}{MNK}, \tag{17}
$$

其中 $\ell$ 是单样本损失，$R(\theta)=\mathbb E[\ell(\theta)]$ 是其总体风险，$\hat\theta$ 是 $\hat{\mathcal L}_{M,K,N}$ 在参数集 $\Theta$ 上的最小化者，$\mathcal E_M(\mathcal F)$ 是同一类从 $M$ 个收敛标签所能达到的超额风险。场景覆盖通过 $\mathcal E_M$ 与噪声项中的 $1/M$ 进入，标签噪声只通过 $1/(MNK)$ 进入，而 $N$ 或 $K$ 单独不会产生项。第三，诸如对数这样的非线性标签变换把总体最小化者从 $\log_{10}\mathcal U$ 移到 $\mathbb E[\log_{10}\hat{\mathcal U}_N]=\log_{10}\mathcal U+O(1/N)$，或（当 $K$ 次渲染先平均再变换时）$O(1/(NK))$；这增加一个 $1/N^2$（相应地 $1/(NK)^2$）量级的风险下界，任何场景数都无法消除。对 PRelL2，附录 I 表明期望梯度 $\mathbb E_\xi[\nabla_\theta\ell\,|\,a]=J^\top D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U)$ 除标签均值外没有输出空间平稳点，因此该 Jensen 偏移不会出现；界 (17) 本身只对无权平方损失证明。

## 5. 实验

我们在覆盖粒子输运两种物理机制——光子输运与中子输运——的四个数据集上评估 PTNO，在匹配架构下与 NO 基线比较，并变化损失形式。**远场辐亮度任务**建模光在由球面界定的非均匀参与介质中的传播（消光系数与反照率在球坐标下空间变化），并预测远场辐亮度；这是大气与体积渲染中的经典问题，其中多重散射使解析解不可处理。其参考只跨越约 3 个数量级（表 24），因此不是高动态范围情形；由于数千个场景的收敛参考可以承受，我们把它作为标签噪声与粒子预算分配的受控试验台。**3D 注量任务**扩展这一设定，在 3D 笛卡尔坐标下定义空间变化的材料参数与发射函数，预测完整的 3D 注量场，其参考跨越约 10 个数量级。**球形托卡马克中子输运任务**转向核聚变：参数化托卡马克几何与变化的 D–T 等离子体源产生 14.1 MeV 聚变中子，中子穿过屏蔽、第一壁与包层材料发生散射与衰减。由此得到的中子通量分布 [40] 是估计材料活化（中子俘获在结构中诱发的放射性）、核热与氚增殖的关键量。最后，**EU-DEMO 任务**针对欧洲示范聚变反应堆 [21, 41] 的反应堆尺度工程模型，在变化的等离子体源条件下预测整个极向截面的中子通量，这对屏蔽设计、诊断布置与包层性能评估至关重要。数据集细节见附录 E。

我们的实验表明：(1) PTNO 优于其他方案；(2) 高方差 MC 标签比收敛参考更具样本效率。正文报告 $\log_{10}$ 相对 $L^2$ 与 $\log_{10}$ SSIM，二者都在输出场本身（角分布图或 3D 体）上于 $\log_{10}(\max(\cdot,\epsilon))$ 之后计算，$\epsilon$ 为逐数据集的下限，因此精度在整个动态范围上都计入；附录表格补充线性空间 % RMSE、PSNR 与 SSIM，附录 F 定义每个指标。所有验证与测试指标都在训练中留出的未见输入构型上计算。除非另有说明，条目为五个训练种子上相对收敛 MC 参考的均值±样本标准差。远场辐亮度与 EU-DEMO 现在使用固定训练计划的最终检查点；3D 注量与球形托卡马克行仍是历史检查点选择结果，待替换（附录 F）。$(M,N,K)$ 表示训练场景数、每次渲染的蒙特卡洛样本数与每个场景的独立渲染数（第 4 节）；在辐射输运任务上 $N$ 以每像素或每体素样本数（SPP）计，在中子输运任务上以历史数计，一次渲染即一次 OpenMC 运行。

### 5.1 Jensen 偏差与损失比较

让含噪 MC 标签经过非线性映射会把训练目标的最小化者移离物理真解；这就是第 4 节的 Jensen 偏差，图 11 给出示例。

我们在附录 G 中广泛研究这一效应。在远场辐亮度数据集上，图 13 表明用式 9 的有偏目标训练会使预测坍缩几个数量级。PTNO 通过用 stop-gradient 预测而不是含噪 MC 标签做归一化，避免了这一失效模式。

在表 13（附录 H）中，我们评估 Jensen 偏差对远场辐亮度数据集训练的影响。我们发现偏差校正并未完全弥合性能差距，而用 PRelL2 训练的 PTNO 通过避免对含噪 MC 标签作非线性变换、从而避免 Jensen 偏差，取得了稳定性能。附录 D 用 3D 注量数据集上的完整分母 × 激活消融，以及 EU-DEMO 上匹配的 2×2 配方消融，隔离出这一机制：每个以含噪 MC 标签为残差尺度、或以梯度流过其中的预测为残差尺度的变体，要么坍缩、要么输出尺度膨胀，只有与 softplus 头配对的 stop-gradient 逐点残差保持稳定。

### 5.2 粒子预算分配与噪声稳定性

表 1 在远场辐亮度试验台上，对三种损失变化每次渲染的蒙特卡洛样本数 $N\in\{4,64,128\}$，并报告 $\log_{10}$ SSIM。$L^2$ 随 $N$ 变化最小，但在暗区域仍然很弱（附录 G 表 11）；对数 MSE 在较低 $N$ 下急剧退化，与随标签噪声增长的 Jensen 偏差一致；PTNO + PRelL2 在 $N=4$ 时仍保持其 $N=128$ 得分的 0.96 倍。

> **表 1（原文 Table 1）：** 随着标签变噪，PTNO + PRelL2 的精度损失小于对数 MSE。远场辐亮度，$M=10^6$ 个训练场景，每个标签每像素 $N$ 个样本；其他设置相同。条目为 100 个留出场景上相对收敛参考的 $\log_{10}$ SSIM，五个种子的均值±标准差（越大越好）；括号内比值把每个较低 $N$ 的列与 $N=128$ 比较。

| 架构 | 损失 | $N=128$ ↑ | $N=64$（对 $N=128$）↑ | $N=4$（对 $N=128$）↑ |
|---|---|---|---|---|
| NO | $L^2$ | 0.660±0.026 | 0.662±0.022（1.00×） | 0.652±0.020（0.99×） |
| NO | 对数 MSE | 0.853±0.003 | 0.812±0.002（0.95×） | 0.470±0.001（0.55×） |
| PTNO | PRelL2（本文） | **0.952±0.002** | **0.949±0.002（1.00×）** | **0.917±0.004（0.96×）** |

在相同粒子预算下（图 3），我们固定目标为 PTNO + PRelL2，并在同一 $M=10^6$ 训练集上扫描 $N\in\{8,16,32,64\}$。对相同的总模拟粒子数，较低 $N$ 的运行达到更低误差，因此把粒子预算花在覆盖更多场景上比降低每个标签的噪声更划算；该扫描对每个 $N$ 只有一个种子，而附录 J 的多种子分配研究在场景覆盖饱和之前发现同样的趋势，这与在蒙特卡洛标签上训练的其他算子与代理模型 [14, 20] 的报告一致。

> **图 3（原文 Fig. 3）：** 在 PTNO + PRelL2 下，更多场景优于每个场景更多粒子。远场辐亮度；所有运行使用同一损失，$M=10^6$，200 个 epoch 的余弦计划，每个 $N$ 一个种子，在 100 个留出场景上相对早先的 $10^5$-SPP 参考评分（附录 E.1）。(a,b) 训练结束时的测试线性相对 $L^2$ 与 $\log_{10}$ SSIM 对训练 $N$（固定 $M=10^6$，即预算随 $N$ 增长）。(c) 逐 epoch 验证线性相对 $L^2$（对数刻度）。(d) 逐 epoch 验证对累计预算 $M_{\le e}\cdot N$，其中 $M_{\le e}$ 是到第 $e$ 个 epoch 时已见的不同场景数，在最后一个 epoch 达到 $M=10^6$；阴影带标出所有运行都有数据的预算（$\le8\times10^6$ 个粒子），灰色竖线标出等预算切片。在等预算下，较低 $N$ 的运行胜出。

### 5.3 多领域与 3D 验证

我们在 3D 注量数据集、球形托卡马克中子输运与反应堆尺度 EU-DEMO 基准上重复损失比较，确认这些发现在不同物理领域与未见输入之间可迁移。表 2 报告全部四个数据集上的五种子结果。

**3D 注量（历史结果）。** 我们在 $64^3$ 注量数据集（附录 E.2）上以 $(M,N,K)=(3\times10^5,4,2)$ 训练；一个场景的参考注量跨越约 10 个数量级。一个 3D PTNO（模态 $20^3$，宽度 64，6 层）训练 120 个 epoch（$1.5\times10^5$ 次优化器更新），并在 100 个未见的留出场景上验证。线性输出 $L^2$ 在暗区域失效，朴素对数目标 MSE 在 $\log_{10}$ SSIM 上落后 PTNO + PRelL2 达 0.054，与 Jensen 偏差一致。PTNO + PRelL2 在两个对数空间指标上都取得最佳性能。

**球形托卡马克中子输运（历史结果）。** 我们在 $(M,N,K)=(4\times10^5,10^5,1)$ 上训练，样本从参数化 D–T 球形托卡马克分布的 1,024,000 个构型池中不重复抽取，该分布同时变化几何与等离子体源 [40]；一个场景的参考通量每个能群跨越约 10 个数量级。一个 3D NO（模态 $24^3$，宽度 32，4 层）以批大小 4 训练 40 个 epoch（$10^5$ 次优化器更新），并在 50 个未见构型上以 $10^9$ 历史参考验证。朴素对数目标 MSE 只达到 $\log_{10}$ SSIM 0.560，而 PTNO + PRelL2 在未见验证划分上保持 $\log_{10}$ SSIM 0.863 与 $\log_{10}$ 相对 $L^2$ 0.045。

**EU-DEMO。** 在表 2 报告的 EU-DEMO 精度基础上，我们现在量化其相对收敛 MC 参考的实际速度—精度权衡。我们在 $140\times73\times146$ 网格上以 $(M,N,K)=(10^5,5\times10^5,1)$ 训练，并在 24 个未见构型上以 FW-CADIS 与 MAGIC 权窗计算的参考验证（每个构型中位数 6 130 CPU 核·小时）。权窗是一种方差缩减，通过分裂或随机终止粒子使各区域统计权重保持在目标带内；FW-CADIS 从近似确定性伴随解导出权窗，MAGIC 在相继的 MC 运行中细化它们。在单个 24 线程 CPU 上，收敛参考的代价是算子在参考网格上前向传播的 $1.2\times10^4$ 倍。使用 FW-CADIS 权窗时，MC 需要算子代价的 $1.6\times10^3$ 倍（含权窗生成）才能达到其 $\log_{10}$ 相对 $L^2$，而在 24 个构型中没有一个能在 $10^7$ 个历史内达到算子的 $\log_{10}$ SSIM。附录 K 报告所有四个数据集在相同硬件与匹配精度下的比较。

> **表 2（原文 Table 2）：** PTNO 在全部四个数据集上都取得更优性能。每个区块在匹配的架构、数据与优化器更新预算下比较损失形式；粗体值为每个数据集的最佳值。EU-DEMO 用相对 $L^2$ 替代线性 $L^2$ 损失，因为通量峰值接近 Adam 的 $\epsilon$ 尺度。条目为五个种子在留出构型上相对收敛参考的均值±标准差（100 个远场场景、100 个 3D 注量场景、50 个球形托卡马克构型、24 个 EU-DEMO 构型）。远场与 EU-DEMO 使用最终检查点；3D 注量与球形托卡马克区块是在其评估构型上选择的暂定历史结果。EU-DEMO 只在收敛参考有测量的单元上评分（网格的 45.4%；附录 F）。

| 数据集 | 方法 | $\log_{10}$ 相对 $L^2$ ↓ | $\log_{10}$ SSIM ↑ |
|---|---|---|---|
| 远场辐亮度 | NO + $L^2$ | 0.4782±0.0408 | 0.6524±0.0196 |
| | NO + 对数 MSE | 1.3994±0.0013 | 0.4699±0.0007 |
| | PTNO + PRelL2（本文） | **0.0825±0.0022** | **0.9165±0.0040** |
| 3D 注量 | NO + $L^2$ | 0.2824±0.0006 | 0.7243±0.0004 |
| | NO + 对数 MSE | 0.0843±0.0045 | 0.8977±0.0042 |
| | PTNO + PRelL2（本文） | **0.0338±0.0005** | **0.9518±0.0011** |
| 球形托卡马克 | NO + $L^2$ | 0.4062±0.0058 | 0.2021±0.0227 |
| | NO + 对数 MSE | 0.3364±0.0027 | 0.5604±0.0286 |
| | PTNO + PRelL2（本文） | **0.0453±0.0011** | **0.8627±0.0024** |
| EU-DEMO | NO + 相对 $L^2$ | 0.2310±0.0050 | 0.1455±0.0066 |
| | NO + 对数 MSE | 0.2388±0.0002 | 0.5846±0.0001 |
| | PTNO + PRelL2（本文） | **0.0839±0.0006** | **0.7923±0.0016** |

> **图 4（原文 Fig. 4）：** 在匹配的墙钟时间下，MC 仍被噪声主导，而 NO 预测接近收敛参考。每个区块从左到右为五幅图：几何、源分布、低预算 MC、NO 预测与收敛 MC 真值（GT），对应表 2 中种子 42 模型在逐场景 $\log_{10}$ SSIM 中位数附近的两个留出构型。所有计时都在一个配有 NVIDIA H200 GPU 与 24 线程 AMD EPYC 9554 CPU 的节点上测得；MC 预算取墙钟时间最接近一次 NO 前向传播的最小值。上——球形托卡马克中子通量：NO 推断在 GPU 上耗时 37–38 ms；OpenMC 在 24 个 CPU 线程上对 $N=37$–$43$ 个历史需要 49–55 ms，这是它能在该时间附近运行的最小预算。GT 汇集了 100 次独立 $10^7$ 历史运行（累计墙钟 67–81 h，每次运行 4 核，即 270–320 核·小时）共 $10^9$ 个历史。下——球形平板远场辐亮度 $L$：NO 推断耗时 3.6 ms，同一 GPU 上每像素一个样本的 Mitsuba 渲染耗时 4.8 ms；GT 在一块 H200 上于 31–40 min 内累积 $10^7$ SPP。

## 6. 讨论与结论

PTNO 为粒子输运代理学习提供了若干优势。它直接从高方差 MC 标签学习，避免为每个训练构型生成昂贵的收敛标签。它不把 MC 噪声当作预处理问题，而是把含噪但无偏的估计用作随机监督：高方差标签在相差一个与模型无关的加性噪声项的意义下，给出收敛解的无偏估计。为了处理高动态范围，PTNO 通过对模型预测施加 softplus 激活、并把预测（而不是含噪 MC 估计）用作逐点相对损失的分母，避免 Jensen 偏差。这使 MC 目标保持在原始物理尺度上。在固定模拟预算下，这一机制对多重散射输运尤其有价值：低样本 MC 标签能比完全收敛标签更广地覆盖输入构型。

该方法有重要局限。PTNO 假定 MC 估计量在线性物理空间中无偏；来自路径截断、近似物理，或有偏的俄罗斯轮盘赌（随机终止低权重粒子而没有补偿性的权重增加）的偏差，会削弱支撑该训练方案的风险等价性论证。有效性还受底层神经算子容量约束：虽然该方法在同分布变化上泛化良好，但远离分布的构型可能导致训练分布未覆盖的失效模式。我们对 PRelL2 的分析涉及连续时间、全批动力学下输出 Jacobian 行满秩时的期望梯度，并未对 Adam 或有限随机步建立收敛性（附录 I）。所有评估都是基于模拟的，检验的是参数化族内的插值；向实测数据或新几何族的泛化尚未建立（附录 L）。安全关键应用仍需先对照高保真 MC 参考验证，之后才能把代理模型当作替代品而不是加速器来信任。

未来工作包括把 PTNO 应用于全分辨率托卡马克模型，把它扩展到等离子体边界模拟中的中性输运，以及把它集成到耦合多物理、逆设计与可微优化管线中。

## 致谢

Anima Anandkumar 部分获得 Bren 讲席教授职位、ONR（MURI 基金 N00014-23-1-2654）以及 Schmidt Sciences 的 AI2050 高级研究员计划支持。Ander Gray 部分获得 Dassault Aviation、Naval Group、Dassault Systèmes、KNDS France、Agence de l'Innovation de Défense、Institut Polytechnique de Paris 的学术与研究讲席“复杂系统架构”（Architecture des Systèmes Complexes）资助。Vignesh Gopakumar 部分获得 Fusion Futures 计划资助。正如英国政府 2023 年 10 月宣布的，Fusion Futures 旨在为聚变部门的发展提供整体支持。作者感谢 Modal 提供部分计算额度。

## 参考文献（英文原书目）

- [1] Wenzel Jakob, Sébastien Speierer, Nicolas Roussel, Merlin Nimier-David, Delio Vicini, Tizian Zeltner, Baptiste Nicolet, Miguel Crespo, Vincent Leroy, and Ziyi Zhang. Mitsuba 3 renderer. https://mitsuba-renderer.org, 2022. Version 3.0.1.
- [2] Paul K. Romano, Nicholas E. Horelik, Bryan R. Herman, Adam G. Nelson, Benoit Forget, and Kord Smith. OpenMC: A state-of-the-art Monte Carlo code for research and development. Annals of Nuclear Energy, 82:90–97, 2015. ISSN 0306-4549. doi: 10.1016/j.anucene.2014.07.048. URL https://www.sciencedirect.com/science/article/pii/S030645491400379X. Joint International Conference on Supercomputing in Nuclear Applications and Monte Carlo 2013, SNA + MC 2013. Pluri- and Trans-disciplinarity, Towards New Modeling and Numerical Simulation Paradigms.
- [3] Michael Evan Rising, Jerawan Chudoung Armstrong, Simon R. Bolding, Jeffrey S. Bull, Alexander Rich Clark, Cole Spencer Frederick, Jesse Frank Giron, Avery Sumner Grieve, Wim Haeck, Fred Burke Jones, Colin James Josey, Joel Aaron Kulesza, Michael Aaron Lively, Sriram Swaminarayan, Jeremy Ed Sweezy, Colin Andrew Weaver, and Anthony J. Zukaitis. MCNP® Code Version 6.3.1 Release Notes. Technical Report LA-UR-25-23548, Rev. 1, Los Alamos National Laboratory, Los Alamos, NM, USA, April 2025. URL https://www.osti.gov/biblio/2563101.
- [4] D. Reiter, M. Baelmans, and P. Börner. The EIRENE and B2-EIRENE codes. Fusion Science and Technology, 47(2):172–186, 2005. doi: 10.13182/FST47-172.
- [5] S. Wiesen, D. Reiter, V. Kotov, M. Baelmans, W. Dekeyser, A.S. Kukushkin, S.W. Lisgo, R.A. Pitts, V. Rozhansky, G. Saibene, I. Veselova, and S. Voskoboynikov. The new SOLPS-ITER code package. Journal of Nuclear Materials, 463:480–484, 2015. ISSN 0022-3115. doi: 10.1016/j.jnucmat.2014.10.012. URL https://www.sciencedirect.com/science/article/pii/S0022311514006965.
- [6] Thomas Müller, Brian McWilliams, Fabrice Rousselle, Markus Gross, and Jan Novák. Neural importance sampling. ACM Transactions on Graphics, 38(5):145:1–145:19, 2019. doi: 10.1145/3341156.
- [7] Shilin Zhu, Zexiang Xu, Tiancheng Sun, Alexandr Kuznetsov, Mark Meyer, Henrik Wann Jensen, Hao Su, and Ravi Ramamoorthi. Photon-driven neural reconstruction for path guiding. ACM Transactions on Graphics, 41(1):7:1–7:15, 2022. doi: 10.1145/3476828.
- [8] Zilu Li, Guandao Yang, Xi Deng, Christopher De Sa, Bharath Hariharan, and Steve Marschner. Neural caches for Monte Carlo partial differential equation solvers. In SIGGRAPH Asia 2023 Conference Papers, pages 34:1–34:10, New York, NY, USA, 2023. Association for Computing Machinery. doi: 10.1145/3610548.3618141.
- [9] Thomas Müller, Fabrice Rousselle, Jan Novák, and Alexander Keller. Real-time neural radiance caching for path tracing. ACM Transactions on Graphics, 40(4):36:1–36:16, 2021. doi: 10.1145/3450626.3459812.
- [10] Kin-Ming Wong and Tien-Tsin Wong. Robust deep residual denoising for Monte Carlo rendering. In SIGGRAPH Asia 2018 Technical Briefs, pages 14:1–14:4, New York, NY, USA, 2018. Association for Computing Machinery. doi: 10.1145/3283254.3283261.
- [11] Steve Bako, Thijs Vogels, Brian McWilliams, Mark Meyer, Jan Novák, Alex Harvill, Pradeep Sen, Tony DeRose, and Fabrice Rousselle. Kernel-predicting convolutional networks for denoising Monte Carlo renderings. ACM Transactions on Graphics, 36(4):97:1–97:14, 2017. doi: 10.1145/3072959.3073708.
- [12] Chakravarty R. Alla Chaitanya, Anton S. Kaplanyan, Christoph Schied, Marco Salvi, Aaron Lefohn, Derek Nowrouzezahrai, and Timo Aila. Interactive reconstruction of Monte Carlo image sequences using a recurrent denoising autoencoder. ACM Transactions on Graphics, 36(4):98:1–98:12, 2017. doi: 10.1145/3072959.3073601.
- [13] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Fourier neural operator for parametric partial differential equations. In International Conference on Learning Representations (ICLR), 2021. URL https://openreview.net/forum?id=c8P9NQVtmnO.
- [14] Hrishikesh Viswanath, Hong Chul Nam, Xi Deng, Julius Berner, Anima Anandkumar, and Aniket Bera. Operator learning using weak supervision from Walk-on-Spheres. arXiv preprint arXiv:2603.01193, 2026. URL https://arxiv.org/abs/2603.01193.
- [15] Zackary Misso, Benedikt Bitterli, Iliyan Georgiev, and Wojciech Jarosz. Unbiased and consistent rendering using biased estimators. ACM Transactions on Graphics, 41(4):48:1–48:13, 2022. doi: 10.1145/3528223.3530160.
- [16] Jaakko Lehtinen, Jacob Munkberg, Jon Hasselgren, Samuli Laine, Tero Karras, Miika Aittala, and Timo Aila. Noise2Noise: Learning image restoration without clean data. In International Conference on Machine Learning (ICML), 2018. URL https://arxiv.org/abs/1803.04189.
- [17] Thomas Müller, Fabrice Rousselle, Jan Novák, and Alexander Keller. Neural control variates. ACM Transactions on Graphics (Proc. SIGGRAPH Asia), 2020. URL https://arxiv.org/abs/2006.01524.
- [18] Ben Mildenhall, Peter Hedman, Ricardo Martin-Brualla, Pratul Srinivasan, and Jonathan T. Barron. NeRF in the dark: High dynamic range view synthesis from noisy raw images. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2022. URL https://arxiv.org/abs/2111.13679.
- [19] Andrew Tinits and Stephen Mann. Nonlinear Noise2Noise for efficient Monte Carlo denoiser training. In SIGGRAPH Asia 2025 Conference Papers, 2025. doi: 10.1145/3757377.3763931.
- [20] Madison Pratt and Olivia Prosper-Feldman. Learning moment maps for continuous-time Markov chains under Monte Carlo noise. arXiv preprint arXiv:2606.18409, 2026. URL https://arxiv.org/abs/2606.18409.
- [21] Raul Luís, Yohanes Nietiadi, Antonio Quercia, Alberto Vale, Jorge Belo, António Silva, Bruno Gonçalves, Artur Malaquias, Andrei Gusarov, Federico Caruggi, Enrico Perelli Cippo, Maryna Chernyshova, Barbara Bienkowska, and Wolfgang Biel. Neutronics simulations for DEMO diagnostics. Sensors, 23(11):5104, 2023. ISSN 1424-8220. doi: 10.3390/s23115104. URL https://www.mdpi.com/1424-8220/23/11/5104.
- [22] Nima Khademi Kalantari, Steve Bako, and Pradeep Sen. A machine learning approach for filtering Monte Carlo noise. ACM Transactions on Graphics, 34(4):122:1–122:12, 2015. doi: 10.1145/2766977.
- [23] Chuhao Chen, Yuze He, and Tzu-Mao Li. Temporally stable Metropolis light transport denoising using recurrent transformer blocks. ACM Transactions on Graphics, 43(4):123:1–123:14, 2024. doi: 10.1145/3658218.
- [24] Jiří Vorba, Ondřej Karlík, Martin Šik, Tobias Ritschel, and Jaroslav Křivánek. On-line learning of parametric mixture models for light transport simulation. ACM Transactions on Graphics, 33(4):101:1–101:11, 2014. doi: 10.1145/2601097.2601203.
- [25] Sebastian Herholz, Oskar Elek, Jiří Vorba, Hendrik Lensch, and Jaroslav Křivánek. Product importance sampling for light transport path guiding. Computer Graphics Forum, 35(4):67–77, 2016. doi: 10.1111/cgf.12950.
- [26] Thomas Müller, Markus Gross, and Jan Novák. Practical path guiding for efficient light-transport simulation. Computer Graphics Forum, 36(4):91–100, 2017. doi: 10.1111/cgf.13227.
- [27] Christopher N. Culbertson and John S. Hendricks. An assessment of the MCNP4C weight window. Technical Report LA-13668, Los Alamos National Laboratory, Los Alamos, NM (United States), 1999.
- [28] Scott W Mosher, Aaron M Bevill, Seth R Johnson, Ahmad M Ibrahim, Charles R Daily, Thomas M Evans, John C Wagner, and Jeffrey O Johnson. ADVANTG—an automated variance reduction parameter generator. Technical Report ORNL/TM-2013/416, Oak Ridge National Laboratory (ORNL), Oak Ridge, TN (United States), 2013.
- [29] E. Martínez-Fernández, J. Alguacil, J. Sanz, and R. Juárez. Neural network-based source biasing to speed-up challenging MCNP simulations. Fusion Engineering and Design, 202:114406, 2024. doi: 10.1016/j.fusengdes.2024.114406.
- [30] Lesego E Moloko, Pavel M Bokov, Xu Wu, and Kostadin N Ivanov. Prediction and uncertainty quantification of SAFARI-1 axial neutron flux profiles with neural networks. Annals of Nuclear Energy, 188:109813, 2023. doi: 10.1016/j.anucene.2023.109813.
- [31] Kazuma Kobayashi and Syed Bahauddin Alam. Deep neural operator-driven real-time inference to enable digital twin solutions for nuclear energy systems. Scientific Reports, 14(1):2101, 2024. doi: 10.1038/s41598-024-51984-x.
- [32] Konstantinos Prantikos, Stylianos Chatzidakis, Lefteri H Tsoukalas, and Alexander Heifetz. Physics-informed neural network with transfer learning (TL-PINN) based on domain similarity measure for prediction of nuclear reactor transients. Scientific Reports, 13(1):16840, 2023. doi: 10.1038/s41598-023-43325-1.
- [33] Zongyi Li, Daniel Zhengyu Huang, Burigede Liu, and Anima Anandkumar. Fourier neural operator with learned deformations for PDEs on general geometries. Journal of Machine Learning Research, 24(388):1–26, 2023.
- [34] Vignesh Gopakumar, Stanislas Pamela, Lorenzo Zanisi, Zongyi Li, Ander Gray, Daniel Brennand, Nitesh Bhatia, Gregory Stathopoulos, Matt Kusner, Marc Peter Deisenroth, Anima Anandkumar, JOREK Team, and MAST Team. Plasma surrogate modelling using Fourier neural operators. Nuclear Fusion, 64(5):056025, April 2024. doi: 10.1088/1741-4326/ad313a. URL https://doi.org/10.1088/1741-4326/ad313a.
- [35] P Mánek, G Van Goffrier, V Gopakumar, N Nikolaou, J Shimwell, and I Waldmann. Fast regression of the tritium breeding ratio in fusion reactors. Machine Learning: Science and Technology, 4(1):015008, January 2023. doi: 10.1088/2632-2153/acb2b3. URL https://doi.org/10.1088/2632-2153/acb2b3.
- [36] Enrique Miralles-Dolz, Michael Churchill, Jacob Schwartz, Javier Hidalgo-Salaverri, Connor Moreno, Tim Bohm, and Paul Wilson. Stellarator design exploration using symbolic-regression neutronics surrogates. IEEE Transactions on Plasma Science, 54(6):2879–2886, 2026. doi: 10.1109/TPS.2026.3680528.
- [37] Don McLeish. A general method for debiasing a Monte Carlo estimator. Monte Carlo Methods and Applications, 17(4):301–315, 2011. doi: 10.1515/mcma.2011.013.
- [38] Chang-han Rhee and Peter W Glynn. Unbiased estimation with square root convergence for SDE models. Operations Research, 63(5):1026–1043, 2015. doi: 10.1287/opre.2015.1404.
- [39] Jose H Blanchet and Peter W Glynn. Unbiased Monte Carlo for optimization and functions of expectations via multi-level randomization. In 2015 Winter Simulation Conference (WSC), pages 3656–3667. IEEE, 2015. doi: 10.1109/WSC.2015.7408524.
- [40] J. Shimwell, J. Billingsley, R. Delaporte-Mathurin, D. Morbey, M. Bluteau, P. Shriwise, and A. Davis. The Paramak: automated parametric geometry construction for fusion reactor designs. F1000Research, 10:27, 2021. doi: 10.12688/f1000research.28224.1. URL https://doi.org/10.12688/f1000research.28224.1.
- [41] Yudong Lu, Guangming Zhou, Francisco A. Hernández, Pavel Pereslavtsev, Jaakko Leppänen, and Minyou Ye. Benchmark of Serpent-2 with MCNP: Application to European DEMO HCPB breeding blanket. Fusion Engineering and Design, 155:111583, 2020. doi: 10.1016/j.fusengdes.2020.111583.
- [42] Rémi Delaporte-Mathurin, Jonathan Shimwell, Liam Pattinson, Ariful Islam Pranto, and Mohammed Faisal. OpenMC Plasma Source. https://github.com/fusion-energy/openmc-plasma-source, January 2023. Version 0.3.0.
- [43] D. Flammini. 2017 Generic DEMO MCNP Model at 22.5 Degree v1.3, 2019. EUROfusion IDM UID: 2MCJ69.
- [44] Clement Fausser, Antonella Li Puma, Franck Gabriel, and Rosaria Villari. Tokamak D-T neutron source models for different plasma physics confinement modes. Fusion Engineering and Design, 87(5-6):787–792, 2012. doi: 10.1016/j.fusengdes.2012.02.025.
- [45] Boris Bonev, Thorsten Kurth, Christian Hundt, Jaideep Pathak, Maximilian Baust, Karthik Kashinath, and Anima Anandkumar. Spherical Fourier neural operators: Learning stable dynamics on the sphere. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pages 2806–2823. PMLR, 2023.
- [46] Md Ashiqur Rahman, Zachary E. Ross, and Kamyar Azizzadenesheli. U-NO: U-shaped neural operators. Transactions on Machine Learning Research, 2023. ISSN 2835-8856. URL https://openreview.net/forum?id=j3oQF9coJd.
- [47] Bogdan Raonić, Roberto Molinaro, Tim De Ryck, Tobias Rohner, Francesca Bartolucci, Rima Alaifari, Siddhartha Mishra, and Emmanuel de Bézenac. Convolutional neural operators for robust and accurate learning of PDEs. In Advances in Neural Information Processing Systems, volume 36, pages 77187–77200, 2023. doi: 10.52202/075280-3376.
- [48] Olaf Ronneberger, Philipp Fischer, and Thomas Brox. U-Net: Convolutional networks for biomedical image segmentation. In Medical Image Computing and Computer-Assisted Intervention – MICCAI 2015, volume 9351 of Lecture Notes in Computer Science, pages 234–241. Springer, 2015. doi: 10.1007/978-3-319-24574-4_28.
- [49] Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, and George Em Karniadakis. Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators. Nature Machine Intelligence, 3(3):218–229, 2021. doi: 10.1038/s42256-021-00302-5.
- [50] Haixu Wu, Huakun Luo, Haowen Wang, Jianmin Wang, and Mingsheng Long. Transolver: A fast transformer solver for PDEs on general geometries. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 53681–53705. PMLR, 2024.
- [51] Zhongkai Hao, Zhengyi Wang, Hang Su, Chengyang Ying, Yinpeng Dong, Songming Liu, Ze Cheng, Jian Song, and Jun Zhu. GNOT: A general neural operator transformer for operator learning. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pages 12556–12569. PMLR, 2023.
- [52] Ethan E. Peterson, Paul K. Romano, Patrick C. Shriwise, and Patrick A. Myers. Research data supporting article on implementation and validation of OpenMC cell-based R2S shutdown dose rate capabilities, 2024. URL https://doi.org/10.5281/zenodo.10660030.
- [53] S. Agostinelli, J. Allison, et al. Geant4—a simulation toolkit. Nuclear Instruments and Methods in Physics Research Section A: Accelerators, Spectrometers, Detectors and Associated Equipment, 506(3):250–303, 2003. doi: 10.1016/S0168-9002(03)01368-8.
- [54] J. Allison, K. Amako, et al. Recent developments in Geant4. Nuclear Instruments and Methods in Physics Research Section A: Accelerators, Spectrometers, Detectors and Associated Equipment, 835:186–225, 2016. doi: 10.1016/j.nima.2016.06.125.

## 附录

### A. 记号

表 3 列出全文使用的符号，每个符号只有一个含义；仅在某张表内使用的符号（表 8 与表 9 的采样框）在该表内定义。

> **表 3（原文 Table 3）：** 全文每个符号保持单一含义；符号按首次出现的位置分组。

| 符号 | 含义 | 定义于 |
|---|---|---|
| **问题与蒙特卡洛标签** | | |
| $a,\ \mathcal P_a$ | 输入构型（几何、材料、源）及其分布 | 第 3、4 节 |
| $\mathcal U(a)$ | 收敛的输运响应 | 第 3 节 |
| $\xi\in\Omega,\ \nu,\ k$ | 粒子路径、路径空间、路径空间测度、散射事件数 | 第 3 节 |
| $f,\ p$ | 路径贡献函数与提议分布 | 第 3 节 |
| $\hat{\mathcal U}_N(a,\xi),\ \zeta_N(a,\xi)$ | 由路径 $\xi=(\xi_1,\dots,\xi_N)$ 得到的 $N$ 粒子 MC 估计及其零均值噪声 | 第 3、4 节 |
| $M,N,K$ | 训练场景数、每次渲染的蒙特卡洛样本数（历史数或 SPP）、每个场景的独立渲染数 | 第 4 节 |
| $N_{\mathrm{tot}}$ | 粒子预算 $MKN$ | 第 4 节 |
| **模型与损失** | | |
| $\theta,\ \Theta,\ \hat\theta$ | 网络参数、参数集、经验风险最小化者 | 第 4 节 |
| $\mathcal G_\theta$ | 神经算子；自第 4 节起指潜变量主干 | 第 4 节 |
| $\mathcal B_\theta=\mathrm{softplus}(\mathcal G_\theta),\ \mathcal B_\theta$ | PTNO 的物理预测；固定输入下 $\mathcal B_\theta=\mathcal B_\theta(a)$ | 第 4 节 |
| $\mathcal L_C,\ \mathcal L_N,\ \mathcal L_{\mathrm{rel}},\ \mathcal L_{N,\mathrm{rel}},\ \hat{\mathcal L}_{M,K,N}$ | 总体目标：干净、含噪、干净相对、含噪相对、PRelL2 | 第 4 节 |
| $\ell,\ R$ | 单样本损失、总体风险 | 第 4 节 |
| $\mathrm{sg},\ \mathcal S(x)=\max(\mathrm{sg}(x),\eta)$ | stop-gradient 与 detached 的 PRelL2 归一化项 | 第 4 节 |
| $\eta$ | PRelL2 与相对损失的分母下限 | 第 4 节 |
| $\mathcal U,\ J,\ D(\mathcal B),\ \Phi$ | 标签均值、输出 Jacobian、归一化项平方矩阵、输出空间势 | 第 4 节 |
| $\mathcal F,\ d_{\mathrm{eff}},\ \mathcal E_M(\mathcal F)$ | 假设类、其有效维数、其从 $M$ 个收敛标签所得的超额风险 | 第 4 节 |
| $\sigma$ | 蒙特卡洛标签的单样本标准差 | 第 4 节 |
| **评估** | | |
| $\epsilon$ | $\log_{10}$ 指标的逐数据集下限 | 附录 F |
| $\phi,\ \hat\phi$ | 参考与预测场（通量或辐亮度） | 附录 F |
| $u,\ \hat u,\ C,\ w_i$ | 评分场（$\phi$ 或 $\log_{10}\max(\phi,\epsilon)$）、评分单元、单元权重 | 附录 F |
| $R,\ \mu,\ \sigma,\ C_1,\ C_2$ | PSNR/SSIM 的数据范围、SSIM 局部均值与标准差、SSIM 常数 | 附录 F |
| **输运与数据集** | | |
| $\psi(x,\omega,E)$ | 位置 $x$、方向 $\omega$、能量 $E$ 处的角通量 | 附录 B |
| $\sigma_t,\sigma_s,\sigma_a,f_s$ | 总、散射、吸收截面（消光）；散射函数 | 附录 B |
| $Q,\ \chi,\ \tau$ | 源、探测器响应、透射率 | 附录 B |
| $c,\ g$ | 单次散射反照率、Henyey–Greenstein 各向异性 | 附录 E |
| $(\vartheta,\varphi)$ | 远场球面的极角与方位角 | 附录 E.1 |
| $R_0,a_p,\kappa,\delta$ | 等离子体大半径、小半径、拉长比、三角形变 | 附录 E.3 |
| $n,c_m,H,h$ | 折射率、哑光反照率、立方体半宽、体素宽度 | 附录 P |
| **去偏估计量** | | |
| $Y_i,\ \bar Y_K,\ \hat\mu,\ r_j$ | 一个像素的重复渲染、其均值、展开点、相对残差 | 附录 G |
| $A_i,\ A'_j,\ w(x),\ \hat W,\ q_m$ | 锚定与校正渲染、平方反比权重及其估计、延续概率 | 附录 H |

### B. 粒子输运

粒子输运描述粒子在介质中经历散射与吸收的演化。粒子的空间、角度与能量分布由稳态线性玻尔兹曼输运方程支配。设 $\psi(x,\omega,E)$ 表示位置 $x$、方向 $\omega\in S$、能量 $E$ 处的角粒子密度。输运方程为

$$
\omega\cdot\nabla_x\psi(x,\omega,E)+\sigma_t(x,E)\psi(x,\omega,E)
=Q(x,\omega,E)+\int_0^{\infty}\!\!\int_S\sigma_s f_s(x,E'\to E,\omega'\to\omega)\,\psi(x,\omega',E')\,\mathrm d\omega'\,\mathrm dE'.
$$

这里 $Q$ 是源项，$\sigma_t$ 是总截面（单位路径长度上粒子发生相互作用的概率），$\sigma_s$ 是散射截面（仅发生散射的同一概率），$f_s$ 是散射函数；三者都是粒子所相互作用材料的属性。应用通常需要低维响应，例如探测器通量、表面电流或图像辐亮度，而不是完整的角密度 $\psi$。我们把这一响应记为 $\mathcal U(a)$，并把它表示为 $\psi$ 的线性泛函：

$$
\mathcal U(a)=\int\mathrm dE\int\mathrm d\omega\int\mathrm dx\ \chi(x,\omega,E)\,\psi(x,\omega,E), \tag{18}
$$

其中 $\chi(x,\omega,E)$ 是编码测量过程的测试函数（例如探测器响应、表面电流或体积通量），$a$ 表示输入构型，包括几何、材料属性与源参数。

同一响应可以视为对被模拟粒子轨迹的期望，每条轨迹对图像辐亮度或中子通量计数有贡献。下面的路径空间积分把该平均表示为对轨迹的积分。设 $\xi\in\Omega$ 表示由一串自由飞行段与散射事件组成的粒子路径，并令 $\Omega=\cup_{k\ge1}\Omega_k$ 为按散射事件数 $k$ 分组的全部路径空间。可测响应可写为

$$
\mathcal U(a)=\int_\Omega f(\xi,a)\,\mathrm d\nu(\xi), \tag{19}
$$

其中 $\nu$ 是由输运过程诱导的底层路径空间测度。贡献函数 $f(\xi,a)$ 编码粒子轨迹 $\xi$ 的累积权重，包括源处发射、沿自由飞行段的衰减以及沿路径的散射事件。更具体地，对含 $k$ 个散射事件的路径 $\xi=(x_0\to x_1\to\cdots\to x_k)$，$f$ 取为由输运方程导出的源、透射率与散射项之积：

$$
f(\xi,a)\propto Q(x_0\to x_1)\left[\prod_{j=0}^{k-1}\tau(x_j\to x_{j+1})\right]\left[\prod_{j=1}^{k-1}\sigma_s(x_{j+1})f_s(x_{j-1}\to x_j\to x_{j+1})\right]\chi(x_k), \tag{20}
$$

其中 $\tau$ 表示沿各段的透射率（依赖总截面 $\sigma_t$），$\chi$ 编码测量响应。该表述等价于玻尔兹曼方程的积分形式。

蒙特卡洛方法通过从提议分布 $p$ 采样 $N$ 条路径 $\xi_i\sim p(\cdot\,|\,a)$ 并把它们收集为 $\xi=(\xi_1,\dots,\xi_N)$ 来近似该积分。估计量为

$$
\hat{\mathcal U}_N(a,\xi)=\frac1N\sum_{i=1}^N\frac{f(\xi_i,a)}{p(\xi_i\,|\,a)}. \tag{21}
$$

当提议覆盖所有有贡献的路径并采用相应的重要性权重 $f/p$ 时，该估计量无偏。在多重散射或屏蔽情形，其方差可能很大，因为只有一小部分被采样的历史对响应有可观贡献。按贡献比例采样路径可以降低这一方差，但构造这样的分布需要在追踪之前就知道哪些完整轨迹贡献最大。因此，获得 $\mathcal U(a)$ 的低噪声估计需要大量样本，使数据生成代价高昂。

### C. 损失定义与工程稳定化措施

**输出头。** PTNO 输出头 $\mathcal B_\theta(a)=\mathrm{softplus}(\mathcal G_\theta(a))$ 是正文所有地方的默认设置；我们使用 $\mathrm{softplus}(s)=\ln(1+\mathrm e^s)$，它光滑、单调、非负，对 $s\gg0$ 渐近线性，对 $s\ll0$ 光滑衰减到零。其导数 $\partial_s\mathrm{softplus}(s)=1/(1+\mathrm e^{-s})\le1$ 已经界定了逐体素梯度。

**下限。** 我们在两处使用小的正下限：训练残差中的 stop-gradient 分母下限 $\eta$（第 4 节），以及报告 $\log_{10}$ 指标时的对数指标下限 $\epsilon$。论文报告 $\log_{10}(\max(\cdot,\epsilon))$ 指标，任务下限见表 4（所有指标定义在附录 F）；对 EU-DEMO，事后检查点评估把预测与参考都取下限 $\epsilon=10^{-17}$。

**3D 注量上线性误差所在之处。** 3D 注量模型的线性相对 $L^2$ 由点发射器周围的体素主导，而不只是发射器体素本身。把表 2 的五个 PTNO 种子在 100 个留出场景上排除发射器体素（平均每个场景 2.0 个体素）重新评分，只去掉 35% 的平方误差（场景平均；中位数 30%）；而排除每个发射器周围的 $3\times3\times3$ 核心（共 54 个体素，网格的 0.02%）则去掉 95.0%，并把平均相对 $L^2$ 从 $2.11\pm1.41$ 降到 $0.270\pm0.104$（场景中位数从 $0.301\pm0.030$ 到 $0.182\pm0.018$）。发射器体素本身是一种没有连续极限的网格约定（其单元平均值随体素宽度 $h$ 按 $h^{-2}$ 缩放），但它的邻居是收敛的场值，因此剩余的近源误差是真实的模型误差；均值被每个种子中少数相对 $L^2$ 超过 1 的场景抬高，而我们排序所依据的是不受这一集中影响的对数空间指标。

**PRelL2 归一化项。** 对 PTNO 目标，PRelL2 用预测本身归一化残差，分母上的梯度被 detached：

$$
r_i(a,\xi)=\frac{[\mathcal B_\theta(a)]_i-\hat{\mathcal U}_{N,i}(a,\xi)}{\mathrm{sg}\left(\max([\mathcal B_\theta(a)]_i,\eta)\right)}, \tag{22}
$$

其中 $\mathrm{sg}(\cdot)$ 阻断通过归一化项的梯度。当 $[\mathcal B_\theta]_i$ 比目标小许多个数量级时，分母下限会限制逐体素梯度幅度。

**逐实验实例化。** 表 4 列出各实验报告所用的对数指标下限 $\epsilon$。所有条目都使用 softplus 头与式 (22) 的 PRelL2 残差；没有激活模型侧截断或稳健损失过渡。

> **表 4（原文 Table 4）：** 每个数据集有自己的 $\log_{10}$ 下限，且每个实验都使用 softplus 头与 PRelL2。$\epsilon$ 是报告 $\log_{10}$ 指标时使用的下界；EU-DEMO 数字是事后检查点评估，预测与参考都取下限 $10^{-17}$。所有实验都使用 softplus 头 $\mathcal B_\theta(a)=\mathrm{softplus}(\mathcal G_\theta(a))$，无潜变量截断。

| 实验 | 报告下限 $\epsilon$ | 损失 |
|---|---|---|
| 远场辐亮度（5.1 节） | $10^{-6}$ | PTNO + PRelL2 |
| 3D 注量 | $10^{-10}$ | PTNO + PRelL2 |
| 球形托卡马克 | $10^{-10}$ | PTNO + PRelL2 |
| EU-DEMO 1/16 楔形 | $10^{-17}$ | PTNO + PRelL2 |

该下限在远场辐亮度上从不生效，其参考保持在 $10^{-6}$ 以上；在 3D 注量、球形托卡马克与 EU-DEMO 上，它分别去掉平均参考跨度中最深的 1.6、2.0 与 6.1 个数量级（表 24）。在 EU-DEMO 上，输运域之外的体素与参考从未到达的体素恰好落在 $10^{-17}$ 下限上。附录 I 分析 PRelL2 残差的平稳点；表 2 的 EU-DEMO 分数排除这些体素，只使用参考有测量的单元。

**参考引擎。** 远场辐亮度参考使用 Mitsuba 3 [1]；3D 注量参考使用与其标签相同的前向 MC 估计量，并与 OpenMC 交叉检查；中子输运使用 OpenMC [2]。每个留出集都独立渲染至收敛；结构与训练计划细节在各小节说明。

### D. 分母与输出头消融

PRelL2 残差（式 22）做出两个耦合的设计选择：softplus 输出头，以及 **detached 预测** 分母（即梯度被停止的预测）。我们通过 3D 注量与 EU-DEMO 数据集上的匹配计算量消融把二者分开。

**3D 注量：分母 × 激活。** 表 5 在 3D 注量数据集上把输出头（softplus 对原始恒等）与四种残差分母（detached 预测、活预测、普通逐样本相对 $L^2$、含噪 MC 目标）交叉（$M=3\times10^5$，$N=4$，60 个 epoch、每 epoch 5000 个场景，即对训练集遍历一遍，FNO 模态 $16^3$，宽度 32；在 100 个留出场景上用收敛的 1,048,576-SPP 参考评估）。detached 预测分母是必需的：用梯度流过的活预测作分母时，在预测高估之处损失是平的（梯度 $\propto$ target/pred$^2$），因此训练要么使输出膨胀（softplus：总通量偏高约 15 倍，线性相对 $L^2\approx500$），要么坍缩到负常数场（恒等）。用含噪目标作分母时，$N=4$ 标签中的零通量体素被 $10^{-10}$ 的分母下限除，其残差被放大约十个数量级。softplus 头反过来只有与逐点 stop-gradient 残差配对时才起作用（前两行）；与逐样本范数比配对时，它再现吸收性的 $\mathrm{softplus}(-\infty)=0$ 不动点。普通 FNO 变体（恒等头、逐样本范数）在线性中位数上胜出（它直接优化该指标），但在对数空间中丢掉整个阴影区域。

> **表 5（原文 Table 5）：** 只有 softplus 头配 stop-gradient 预测分母才能在 3D 注量上稳定训练。所有运行共享数据、架构与训练计划；只有输出头与残差分母改变。每行一个种子；在 100 个留出场景上相对收敛参考评估；线性中位数为场景上、包含发射器体素的中位数。$\mathrm{sg}$ 表示 stop-gradient（detached）。

| 头 | 分母 | $\log_{10}$ 相对 $L^2$ ↓ | $\log_{10}$ SSIM ↑ | 线性相对 $L^2$ 中位数 ↓ | 结果 |
|---|---|---|---|---|---|
| softplus（PTNO） | sg 预测 | **0.050** | **0.928** | 1.03 | 稳定 |
| identity | sg 预测 | 0.188 | 0.755 | 0.74 | 8.7% 负体素 |
| softplus | 逐样本范数 | 0.801 | 0.614 | 1.000 | 坍缩：$\mathrm{softplus}(-\infty)=0$ |
| identity | 逐样本范数 | 0.231 | 0.667 | **0.066** | 丢失阴影区域 |
| softplus | 活预测 | 0.166 | 0.871 | 515.8 | 输出膨胀（通量约 15×） |
| identity | 活预测 | 0.801 | 0.614 | 6194 | 坍缩：负常数 |
| softplus | 含噪目标 | 0.801 | 0.614 | 1.000 | 第 1 个 epoch 坍缩：全零 |
| identity | 含噪目标 | 0.285 | 0.724 | 0.999 | 坍缩：均匀常数 |

**EU-DEMO：头 × 逐点残差。** 预测归一化是 EU-DEMO 上的主导成分。固定 softplus 头、把 PRelL2 换成逐样本相对 $L^2$ 会使 $\log_{10}$ SSIM 降低 0.3788，并把其种子标准差从 0.0016 提高到 0.1181。固定 PRelL2、把 softplus 换成恒等头会使 SSIM 降低 0.0845。归一化确立精度与种子稳定性；softplus 提供额外的 SSIM 增益并强制正通量。

> **表 6（原文 Table 6）：** 在 EU-DEMO 上，逐点 stop-gradient 残差最重要，softplus 进一步带来增益。EU-DEMO 连续能量训练设置上的五种子输出头 × 残差消融。条目为五个种子在 24 个留出构型、$140\times73\times146$ 网格上独立评估最终检查点的均值±样本标准差，且只在收敛参考有测量的单元上评分（网格的 45.4%）。softplus–PRelL2 与 identity–相对 $L^2$ 行与表 2 共享运行。

| 头 | 残差 | $\log_{10}$ SSIM ↑ | $\log_{10}$ 相对 $L^2$ ↓ |
|---|---|---|---|
| softplus（PTNO） | 逐点 sg（PRelL2） | **0.7923±0.0016** | **0.0839±0.0006** |
| identity | 逐点 sg（PRelL2） | 0.7078±0.0139 | 0.0885±0.0047 |
| softplus | 逐样本相对 $L^2$ | 0.4135±0.1181 | 0.2227±0.0232 |
| identity | 逐样本相对 $L^2$ | 0.1455±0.0066 | 0.2310±0.0050 |

### E. 数据集

表 7 概述正文的四个数据集；附录 P 增加第五个。

> **表 7（原文 Table 7）：** 正文四个数据集覆盖两种物理机制与两种输出类型。每个数据集都把变化的场景输入映射到固定输出网格上的输运解；“变化的输入”列出场景之间变化的内容，而留出场景是同一设计的新鲜抽样。

| 数据集 | 物理 | 求解器 | 几何 | 输出网格 | 变化的输入 |
|---|---|---|---|---|---|
| 远场辐亮度 | 辐射输运 | MC 标签；参考由 Mitsuba 3 [1] | 球形平板（固定） | 40×80 远场辐亮度 | $\sigma_t$、$c$、$Q$ 场、$g$ |
| 3D 注量 | 辐射输运 | MC 标签与参考，对 OpenMC [2] 验证 | 立方体 $[-1,1]^3$ | $64^3$ 笛卡尔注量 | $\sigma_t$、$c$ 场、$g$、源场 |
| 球形托卡马克 | 中子输运 | OpenMC [2] | 参数化（Paramak） | $64^3$ 笛卡尔通量 | 20 个（几何与源） |
| EU-DEMO | 中子输运 | OpenMC [2] | EU-DEMO 1/16 楔形（固定） | 140×73×146 通量 | 8 个（仅源） |

#### E.1 球形平板中的辐射输运

介质是单位球 $\{x:\|x\|\le1\}$。其内部，消光 $\sigma_t$ 与单次散射反照率 $c$ 只依赖视线方向 $\hat x=x/\|x\|$，解析定义并制表在反余弦均匀的球面网格上（极角 $\vartheta$ 上的等立体角分箱，$\vartheta_i=\arccos(1-2(i+\frac12)/n_\vartheta)$，共 $n_\vartheta$ 个极向分箱；训练输入为 40×80）。各向异性散射使用 Henyey–Greenstein 相位函数，每个场景一个各向异性参数 $g\in(-0.99,0.99)$。源是无穷远处的环境贴图 $Q(\omega)$；边界是零界面，因此光进入时没有折射或反射。参考只跨越约 3 个数量级（表 24）：该数据集是标签噪声与粒子预算分配的受控试验台（其中收敛参考可以承受），而不是高动态范围情形。

**采样。** 每个场景抽取三个与分辨率无关的解析场加一个标量。源组合 1–4 个球面高斯瓣（角宽度在 $[0.15,0.5]$，中心随机）与极角、方位角 $(\vartheta,\varphi)$ 上的 1–4 个盒子，每个盒子携带从 $[0.1,10]$ 抽取的强度。消光与反照率是分片常数 Heaviside 场：以概率 $\frac12$ 为球面棋盘格（1–3 个极向 × 1–6 个方位分箱），否则为 1–6 个随机 $(\vartheta,\varphi)$ 盒子，取值从 $\sigma_t\in[0.01,10]$ 与 $c\in[0.01,0.99]$ 抽取。由于这些场是解析的，不连续区域的边界在每种渲染分辨率下都被精确表示。HG 参数 $g\sim\mathrm{Unif}(-0.99,0.99)$。

**参考。** 评估参考使用 Mitsuba 3 的体积路径追踪器与多重重要性采样 [1]，训练标签是同一场景的前向 MC 估计：球边界（零 BSDF）包住非均匀介质，该介质从角表读取 $(\sigma_t,c)$，使用参数为 $g$ 的 HG 相位函数，并由携带等距柱状源位图（重采样到 Mitsuba 的 Y-up 约定）的环境贴图发射器照明。一个远处的角传感器在同一反余弦均匀的 40×80 网格上记录远场辐亮度。训练：$10^6$ 个场景，$K=1$ 次渲染、每次 4 SPP（40×80 传感器的每像素蒙特卡洛样本数）。评估：100 个未见场景在原生 $120\times240$ 与 $960\times1{,}920$ 材料与环境纹理下渲染，自适应累积至收敛（每像素变异系数 $<0.5\%$ 且相继均值相对 $L^2<10^{-4}$）或 $10^7$ SPP 上限；40×80 与 80×160 评估网格是这些渲染的保守等立体角降采样。同一 100 个场景上早先固定预算的 $10^5$-SPP 参考（用于早先的损失比较表）与收敛参考的逐场景相对 $L^2$ 中位数为 1.9%；用收敛参考重新评估仍可获得的检查点会使主要指标相对移动 1–2%。图 5 展示一个收敛场景与训练预算渲染及 PTNO 预测的对比。

> **图 5（原文 Fig. 5）：** PTNO 从场景输入恢复收敛的远场辐亮度，而单个训练标签基本上就是噪声。留出场景 2，在等立体角布局（方位角 $\varphi$ 对 $\cos\vartheta$）上用共享色标显示。(a) 表 2 中种子 42 的 PTNO + PRelL2 检查点，使用源、消光与反照率表。(b) 训练预算 $N=4$ SPP 下的单次 MC 渲染，即一个训练标签的样子。(c) 收敛的 MC 参考。各子图标题给出相对 (c) 的相对 $L^2$；代价比较见附录 K。

#### E.2 3D 注量

介质在场景单位下占据 $[-1,1]^3$，离散在 $64^3$ 笛卡尔网格上。每个场景由与分辨率无关的成分构成：近真空背景（$\sigma_t=0.01$，$c=0.5$）中 2–5 个大的轴对齐盒子，每个盒子携带自己的消光 $\sigma_t$ 与反照率 $c$；以及 1–3 个随机位置的点发射器。约一半的发射器是各向同性的，其余携带随机取向的随机 Perlin 角发射分布。各向异性散射使用每个场景一个 $g$ 的 HG 相位函数。边界是开放真空。

**采样。** 每个场景：盒子中心 $\mathrm{Unif}(-0.6,0.6)^3$，每轴半长 $\mathrm{Unif}(0.1,0.7)$，$\sigma_t\sim\mathrm{Unif}(0.01,50)$、$c\sim\mathrm{Unif}(0.01,0.99)$ 逐盒抽取，后抽取的盒子在重叠处覆盖先前的；发射器位置 $\mathrm{Unif}(-0.85,0.85)^3$、强度 $\mathrm{Unif}(1,20)$，每个发射器以概率 $1/2$ 具有 Perlin 角分布（取值 $[0.1,2]$）；$g\sim\mathrm{Unif}(-0.95,0.95)$。100 个评估场景实现 $g\in[-0.92,0.93]$。

**参考。** 所有渲染使用带双精度逐体素累加器的前向蒙特卡洛碰撞估计量（HDR 所需），并在评估场景上与 OpenMC [2] 交叉检查。训练：300,000 个场景，$K=2$ 次独立含噪渲染、每次 4 SPP，即 $64^3$ 网格每体素 4 个蒙特卡洛样本（每次渲染约 $10^6$ 个粒子——刻意较弱的监督机制，在极端噪声下检验损失族）。评估：100 个未见场景的留出批次，其参考通量重新渲染至约 $10^6$ SPP（每场景约 $2.7\times10^{11}$ 个粒子，约一次训练渲染的 $2.6\times10^5$ 倍）。一个场景的参考注量跨越约 10 个数量级（表 24）；在 100 个评估场景上，2.3% 的参考体素是精确零（即使参考预算也没有粒子到达，即投射阴影），而四 SPP 训练渲染中为 18%（两者均为场景平均）。

> **图 6（原文 Fig. 6）：** 在 3D 注量数据集中，对比盒子在其周围点发射器附近投射出跨越多个数量级的阴影。(a) 一个代表性场景：两个 $\sigma_t$ 盒子以半透明盒形式画在立方体内（坐标轴为归一化单位；颜色按 $\sigma_t$ 大小呈紫/橙色调），三个点源为亮球。(b) 同一场景的中间切片（$z=32$，即场景单位下 $z=0$）的 $\sigma_t$、反照率与参考注量（对数刻度）；只有高 $\sigma_t$/高反照率盒子与该平面相交；注量面板中的暗矩形是它的投射阴影。(c) 同一场景 $\log$ 注量等值面 $\{-2,-3,-4\}$ 的半切片视图（可见 $X\le0$），展示该半边中两个发射器周围多个数量级的衰减。

> **图 7（原文 Fig. 7）：** PTNO + PRelL2 比基线损失更接近地再现源光晕与处于阴影中的注量。表 2 中种子 42 检查点在留出场景 9 与 33 上的预测。各列：消光标出源位置的 $\sigma_t$、MC 参考（对数刻度），以及 PTNO 与基线损失的预测，逐行共用色标；内嵌数字为逐场景 $\log_{10}$ 相对 $L^2$。原始输出 $L^2$ 预测在空间上几乎恒定；对数 MSE 保留主要空间结构，但在源附近与暗区域误差更大。

#### E.3 球形托卡马克中子学

每个场景是用 Paramak 以 6 轴径向构建（中心柱屏蔽内/外半径、包层厚度、偏滤器宽度）加大半径与小半径参数化构建的完整环形聚变球形托卡马克 [40]。几何配置为以环向环表示、在 H 模式下按聚变反应率径向加权的等离子体源 [42]。CAD 装配被体素化并标记五种材料（真空、纯碳屏蔽、铁素体钢第一壁与真空室、Pb–Li 增殖包层）。包围盒是边长 1,800 cm 的立方体，在 $64^3$ 笛卡尔网格上体素化；逐体素材料 id 由 OpenMC 几何查询，给出一个用以条件化算子的体积标签。预测目标是每个能群中原始 OpenMC 通量计数的均值，单位为每源中子每 cm² 的中子数，对每个网格单元积分，且不转换为反应堆源率。

**采样。** 表 8 中的 20 个标量参数从拉丁超立方空间填充设计在其指定盒中抽取：4 个 paramak 径向构建轴、4 个 D 形描述子 $(R_0,a_p,\kappa,\delta)$ 在 paramak 表面与 H 模式等离子体源 [42]（D–T 聚变环）之间共享、10 个用于峰化离子密度与离子温度剖面的轴（原点、基座/分界面分数、峰化因子、基座半径分数、温度指数 $\beta$）以及磁轴的 Shafranov 位移和整个源的刚性径向偏移。8 个几何参数每 32 个连续训练构型为一组抽取一次，共享一个 CAD 模型，而源参数逐构型抽取；源偏移有自己的 1D 设计。

> **表 8（原文 Table 8）：** 球形托卡马克场景变化 20 个几何与等离子体源参数。20 个标量参数的采样盒，从拉丁超立方设计抽取。几何块参数化 paramak 径向构建；D 形描述子 $(R_0,a_p,\kappa,\delta)$ 在 paramak 表面与等离子体源环之间共享；剖面块参数化 H 模式离子密度与离子温度径向剖面。

| 符号 | 范围 | 单位 | 说明 |
|---|---|---|---|
| **Paramak 径向构建（仅几何）** | | | |
| $R_{\mathrm{cs,in}}$ | [20, 40] | cm | 中心柱屏蔽内半径 |
| $R_{\mathrm{cs,out}}$ | [55, 95] | cm | 中心柱屏蔽外半径 |
| $t_{\mathrm{blk}}$ | [40, 110] | cm | 包层厚度 |
| $w_{\mathrm{div}}$ | [25, 65] | cm | 偏滤器宽度 |
| **D 形描述子（几何↔源共享）** | | | |
| $R_0$ | [250, 500] | cm | 大半径 |
| $a_p$ | [60, 140] | cm | 小半径 |
| $\kappa$ | [1.2, 2.0] | — | 拉长比 |
| $\delta$ | [0.2, 0.6] | — | 三角形变 |
| **磁轴与源偏移（仅源）** | | | |
| $\Delta_{\mathrm{Shaf}}$ | [0, 20] | cm | 磁轴的 Shafranov 位移 |
| $f_{\mathrm{off}}$ | $[-1,1]$ | — | 源径向偏移，占 $\min(\text{等离子体间隙},20\,\mathrm{cm})$ 的比例 |
| **离子密度剖面（仅源）** | | | |
| $n_{i,0}$ | $[8\times10^{18},1.2\times10^{20}]$ | m$^{-3}$ | 轴上离子密度 |
| $f_{n,\mathrm{ped}}$ | [0.65, 0.95] | — | 基座与轴密度比 |
| $f_{n,\mathrm{sep}}$ | [0.08, 0.22] | — | 分界面与轴密度比 |
| $\alpha_n$ | [0.8, 2.0] | — | 密度峰化因子 |
| $r_{\mathrm{ped}}/a_p$ | [0.75, 0.92] | — | 基座半径分数 |
| **离子温度剖面（仅源）** | | | |
| $T_{i,0}$ | [8, 25] | keV | 轴上离子温度 |
| $f_{T,\mathrm{ped}}$ | [0.25, 0.60] | — | 基座与轴温度比 |
| $f_{T,\mathrm{sep}}$ | [0.01, 0.06] | — | 分界面与轴温度比 |
| $\alpha_T$ | [1.5, 5.0] | — | 温度峰化因子 |
| $\beta_T$ | [1.5, 4.5] | — | 温度剖面指数 |

**训练与参考。** 训练池有 1,024,000 个构型，每个由一次 OpenMC 固定源运行（$N=10^5$ 历史，10 批各 $10^4$）标注；训练不重复地抽取其中 $4\times10^5$ 个（批大小 4，$10^5$ 次优化器更新）。50 个留出构型带有由 100 次独立 $10^7$ 历史运行汇集的 $10^9$ 历史参考；其残余噪声在 $\log_{10}$ 相对 $L^2$ 上为 0.017，而算子为 0.045。算子是一个 3D FNO（模态 $24^3$，宽度 32，4 层），训练 $10^5$ 次优化器更新。

> **图 8（原文 Fig. 8）：** 每个球形托卡马克场景把参数化径向构建与 D 形等离子体源耦合，通量从等离子体穿过屏蔽与包层时下降多个数量级。(a) 一个场景的 Paramak 径向构建，标出 D 形等离子体源轮廓、大/小半径、拉长比与三角形变。(b)–(e) 逐场景 $64^3$ 网格视图：极向平面上的环向平均源 $Q$ 与群求和通量（对数），以及 $Z=0$ 的源与通量切片，显示环形等离子体环与内侧/外侧衰减。(f) 半切 3D 视图：半透明屏蔽/第一壁/包层/真空室壳层内的环向源等值面。

#### E.4 EU-DEMO 1/16 扇区

第四个数据集使用 EU-DEMO 反应堆 [43] 1/16 环向切片的 OpenMC 模型。此类扇区中子学模型在聚变分析中被广泛使用，因为它们在利用环向对称降低计算代价的同时，保留反应堆尺度构型的主要包层、真空室、屏蔽与源—输运物理。它们是研究 DEMO 类设计中子通量分布、核热、屏蔽性能、活化与诊断响应的标准设置。

反应堆几何用以约 5,300 个曲面（平面、二次曲面、圆柱、环面与圆锥）的 CSG 几何建模 [21, 41]。描述内侧/外侧包层模块、偏滤器、真空室与屏蔽的曲面由 ±11.25° 的两个反射平面与 $z=-2{,}732$ cm 的真空平面封闭。材料使用上游的物理分辨成分（水冷锂铅包层、Eurofer 第一壁与真空室等），核截面数据为 TENDL-2019。几何、材料与反应堆配置在整个数据集上固定，只有等离子体源变化。

**采样。** 表 9 中的 8 个等离子体源形状参数从拉丁超立方空间填充设计在 EU-DEMO 参数化等离子体源（PPS）配置的上游范围内抽取。

> **表 9（原文 Table 9）：** EU-DEMO 场景只改变等离子体源，通过 8 个形状参数。这些参数的采样盒，从拉丁超立方空间填充设计抽取。范围取自上游 EU-DEMO PPS 配置；几何与材料固定。

| 符号 | 范围 | 单位 | 说明 |
|---|---|---|---|
| $T$ | [14.00, 17.00] | keV | 等离子体离子温度（D–T 热展宽） |
| $\alpha$ | [1.20, 1.80] | — | 源剖面的径向峰化因子 |
| $R_0$ | [715.04, 1,072.56] | cm | 等离子体环大半径 |
| $a_p$ | [230.64, 345.96] | cm | 等离子体环小半径 |
| $\kappa$ | [1.32, 1.98] | — | 等离子体拉长比 |
| $\delta$ | [0.2664, 0.3996] | — | 等离子体三角形变 |
| $\Delta R$ | $[-20, 20]$ | cm | 磁轴的径向位移 |
| $\Delta Z$ | $[-20, 20]$ | cm | 磁轴的垂直位移 |

**参考。** 中子源是参数化 D–T 等离子体源，由上述 8 个等离子体形状变量与楔角参数化。发射中子能量建模为热展宽的 14.1 MeV D–T 聚变谱，展宽由离子温度控制。该源在思想上与 [44] 描述的更一般的、依赖约束模式的源模型相似，但使用简化的几何参数化与简化的谱模型。对每个场景，我们 (i) 把源体素化到通量计数网格上，使算子输入与输出共享坐标系；(ii) 在裁剪到 140×73×146 笛卡尔网格上运行 OpenMC 连续能量固定源输运与中子通量网格计数。预测目标是 OpenMC 通量计数均值除以网格单元体积，单位为每源中子每平方厘米中子数，不转换为反应堆源率。24 个留出构型使用在 700×365×730 上用 FW-CADIS 与 MAGIC 权窗计算的参考，每构型中位数为 6,130 核·小时，并保守地块平均到评估所用的 70、140 与 280 网格。图 9 展示楔形几何与一个代表性场景。

**训练。** $M=10^5$ 个构型来自上述采样设计，每个由一次 OpenMC 运行（$N=5\times10^5$ 历史，140×73×146 网格，$K=1$）标注。主干是 3D FNO（模态 32×24×38，宽度 32，4 层，$6.3\times10^7$ 个参数），读取四类材料密度几何通道与 8 个源参数（作为 NeRF 嵌入标量），共 37 个输入通道。表 2 中每个 EU-DEMO 模型都用 AdamW（学习率 $10^{-3}$，无权重衰减，梯度裁剪 1.0）、批大小 1 与 4 步梯度累积训练，对 $10^5$ 个构型遍历两遍，即在余弦计划下进行 $5\times10^4$ 次优化器更新，该计划在最后一次更新时到零；在一块 H200 上每次运行约 2.9 小时。对数空间指标对预测与参考都取 $10^{-17}$ 下限。

> **图 9（原文 Fig. 9）：** EU-DEMO 参考通量在一个极向截面上下降超过九个数量级，PTNO 预测沿其穿过内侧包层直至偏滤器。一个留出验证构型（图 2 的场景）。(a) DEMO 托卡马克的渲染 [21]；线框标出 1/16 楔形，其极向截面绘于其余子图。(b) 140×73×146 训练网格上等离子体源 $Q$ 的 $z\simeq0$ 切片。(c) 物理 $y=0$ 切片上的收敛参考通量 $\phi$，显示到其峰值以下九个数量级。(d) 同一切片上的材料类别，按图例中的质量密度分箱。(e) 材料之上的源等值线；D 形等离子体位于真空室内。(f) PTNO 预测 $\hat\phi$ 覆盖三个数量级，虚线为峰值 $10^{-1}$、$10^{-2}$、$10^{-3}$ 处的参考等值线；预测场沿参考穿过内侧包层并朝向偏滤器。

### F. 评估协议

每个指标都逐场景在物理预测 $\hat\phi$ 与参考 $\phi$ 上计算，在留出集的场景上平均，并报告为该平均值在训练种子上的均值±样本标准差；当有两个种子时报告两个逐种子值；报告场景中位数的行会说明。一个场景在一组单元 $C$ 上评分，权重 $w_i$，$\sum_{i\in C}w_i=1$，由笛卡尔网格上的单元体积与远场球面上的立体角给出。结构化网格有等测度单元（均匀笛卡尔体素与反余弦均匀的角分箱），因此其权重均匀。附录 O 的四面体扩展则使用每个四面体的体积。

对场 $u$（线性指标时为 $\phi$ 本身；$\log_{10}$ 指标时为 $\log_{10}\max(\phi,\epsilon)$，预测与参考使用相同下限），我们报告

$$
\mathrm{relL2}(\hat u,u)=\left(\frac{\sum_{i\in C}w_i(\hat u_i-u_i)^2}{\sum_{i\in C}w_iu_i^2}\right)^{1/2}, \tag{23}
$$

$$
\mathrm{PSNR}(\hat u,u)=10\log_{10}\left(\frac{R^2}{\sum_{i\in C}w_i(\hat u_i-u_i)^2}\right), \tag{24}
$$

$$
\mathrm{SSIM}(\hat u,u)=\sum_{i\in C}w_i\,\frac{(2\mu_{\hat u,i}\mu_{u,i}+C_1)(2\sigma_{\hat uu,i}+C_2)}{(\mu_{\hat u,i}^2+\mu_{u,i}^2+C_1)(\sigma_{\hat u,i}^2+\sigma_{u,i}^2+C_2)}. \tag{25}
$$

相对 $L^2$ 是场景上求和之比，而不是逐单元比值的平均；某些附录表格的 % RMSE 是线性相对 $L^2$ 的 100 倍。对结构化网格 SSIM，$\mu$、$\sigma^2$ 与 $\sigma_{\hat uu}$ 是标准差 1.5 个单元、每轴截断为 11 个抽头的可分离高斯窗下的局部均值、方差与协方差（球面上为 2D，体上为 3D），域边界反射填充，$C_1=(0.01R)^2$、$C_2=(0.03R)^2$。四面体扩展则使用物理尺度 100 cm 的体积加权邻域（附录 O）。数据范围 $R$ 是场景自身参考的跨度：$\max u-\min u$；对 $\log_{10}$ 指标即 $\log_{10}\max\phi-\log_{10}\max(\min\phi,\epsilon)$；预测从不相对参考独立重缩放。对多群球形托卡马克通量，每个指标按能群计算，并在参考不全为零的群上平均。报告规则是固定训练计划的最终检查点，不在验证集或参考集上做检查点选择。远场重跑（200 epoch、$10^5$ 更新）、EU-DEMO 重跑、四面体扩展与界面模型遵循该规则。3D 注量主表替换仍在运行，原始球形托卡马克训练语料在本地不可得，无法精确重跑；其历史行明确是暂定的，因为检查点是在与评估相同的构型上选择的。更早的单种子诊断与定性图保留其有记录的历史检查点，直至被替换。远场超参数（包括 HPO 候选与提升）使用同一 100 个评估场景选择；新运行去除了检查点选择，但并未对超参数选择提供独立测试。

表 10 列出数据集之间不同的设置；在数据集内，每个被比较模型都相同。某些表报告移除点发射器周围体素后的线性指标，或只在 EU-DEMO 参考有测量的单元上评分；每张这样的表都在其表注中说明。

> **表 10（原文 Table 10）：** 五个结构化网格数据集的评估设置。$\epsilon$ 是 $\log_{10}$ 指标的下限；这些网格有等测度单元，因此权重均匀；$R$ 是参考自身的跨度，用于 PSNR 与 SSIM。这些网格上的 SSIM 窗是同一高斯窗（$\sigma=1.5$ 个单元，每轴 11 个抽头）；四面体设置见附录 O。

| 数据集 | $\epsilon$ | 测度与网格 | 数据范围 $R$ |
|---|---|---|---|
| 远场辐亮度 | $10^{-6}$ | 立体角，40×80 | 场景参考的跨度 |
| 3D 注量 | $10^{-10}$ | 体积，$64^3$ | 场景参考的跨度 |
| 球形托卡马克 | $10^{-10}$ | 体积，$64^3$，逐能群 | 场景参考的跨度，逐群 |
| EU-DEMO 楔形 | $10^{-17}$ | 体积，140×73×146 | 场景参考的跨度 |
| 界面（附录 P） | $3.28\times10^{-7}$ | 体积，$64^3$ | 场景参考的跨度 |

### G. 对数空间训练的显式去偏器

**设置。** 下面的单种子与早期模型图保留其历史检查点。表 11 与表 13 使用新的固定计划最终检查点；其余诊断待替换。我们在两种配置下确认 $\log_{10}$ 目标的 Jensen 偏差：设置 A（单场景，$M=1$，5 个种子，标签来自一次 4-SPP 渲染）与设置 B（多场景，$M=10^6$ 训练 / $M=100$ 测试，6 个种子，标签平均 20 次 4-SPP 渲染，即 80 SPP），均训练 $10^5$ 次优化步。图 10 与图 11 表明，log MSE 收敛到严格更高的验证相对 $L^2$，而物理空间训练的模型（我们方法的一个更早版本：在 $10^{\mathcal G_\theta}$ 输出头上的物理空间 $L^2$ 损失，没有 softplus 头与 PRelL2 的逐点归一化）不会；并且对 $\log_{10}\hat{\mathcal U}_N(a,\xi)$ 训练的 NO 会按经验 Jensen 偏移系统性地低估解。

**分层损失比较。** 表 11 按参考亮度把 % RMSE 与 $\log_{10}$ SSIM 在 100 个留出远场场景上分层，用于表 2 的五种子远场模型。对数 MSE 在每个分箱中都劣于 PTNO + PRelL2；原始 NO 输出上的 $L^2$ 在暗区域丢失对比度（最暗分箱的 $\log_{10}$ SSIM 为 0.24，任何分箱至多 0.78）；PTNO + PRelL2 在全部四个亮度分箱中保持 $\log_{10}$ SSIM 在 0.89 到 0.94 之间。该表未分离 softplus 头与 PRelL2 残差对暗分箱改进的贡献；附录 D 做了这件事。

> **表 11（原文 Table 11）：** PTNO + PRelL2 是唯一在每个亮度分箱中都准确的损失。远场辐亮度，100 个留出场景相对收敛参考；各列按场景的平均参考辐亮度分层（分别 8、16、42、32 个场景），最后一列覆盖全部 100 个场景（两个位于分箱边界之外）并复现表 2。条目为表 2 五个种子的均值±标准差；粗体值为每个指标与分箱上的最佳值。

| 指标 | 架构 | 损失 | 0.0016–0.013 | 0.013–0.10 | 0.10–0.85 | 0.85–6.9 | 全部 |
|---|---|---|---|---|---|---|---|
| % RMSE ↓ | NO | $L^2$ | 64.0±6.9 | 18.5±1.5 | **8.2±0.2** | **5.6±0.1** | **15.3±1.3** |
| | NO | 对数 MSE | 99.9±0.0 | 90.6±0.2 | 58.2±0.2 | 29.7±0.2 | 57.6±0.2 |
| | PTNO | PRelL2（本文） | **29.1±2.7** | **15.7±1.8** | 15.4±0.5 | 14.4±0.6 | 16.4±0.6 |
| $\log_{10}$ SSIM ↑ | NO | $L^2$ | 0.241±0.079 | 0.490±0.046 | 0.699±0.009 | 0.781±0.009 | 0.652±0.020 |
| | NO | 对数 MSE | 0.514±0.001 | 0.509±0.001 | 0.441±0.001 | 0.471±0.002 | 0.470±0.001 |
| | PTNO | PRelL2（本文） | **0.935±0.003** | **0.945±0.006** | **0.925±0.004** | **0.888±0.005** | **0.917±0.004** |

**显式对数目标去偏器。** 表 1 中的对数 MSE 行因 $\mathbb E[\log_{10}\hat{\mathcal U}_N]\neq\log_{10}\mathbb E[\hat{\mathcal U}_N]$ 在有限 $N$ 下受 Jensen 偏差影响。自然的修正是从 $K$ 次独立渲染构造显式去偏或低偏差的 $\log_{10}$ 目标估计量，并把它喂给标准对数空间 MSE。我们比较三种这样的估计量与用更早模型版本的指数输出头 $10^{\mathcal G_\theta}$ 训练的 PRelL2：

- **均值的对数（$K=10$）：** 10 个可用 4-SPP 渲染的平均值的 $\log_{10}$，期望上等价于一次 40-SPP 渲染。
- **二阶矩校正（$K=10$）：** $\log_{10}\bar Y_K+\hat\sigma^2/(2K\bar Y_K^2\ln 10)$，其中用同样的 $K$ 次渲染估计均值与方差。
- **Taylor 回退（5+5）：** 带二阶矩回退的 Taylor–俄罗斯轮盘赌对数估计量，用于高变异系数像素。

**对数目标去偏器的实现。** 所有对数目标去偏器都独立应用于每个输出像素，作用于同一场景存储的重复 4-SPP 渲染栈。令 $Y_1,\dots,Y_K$ 表示所选独立渲染，$\bar Y_K=K^{-1}\sum_iY_i$，$\epsilon=10^{-6}$ 为远场评估所用的同一下限。均值的对数目标为 $\hat z_{\mathrm{mean}}=\log_{10}\left(\max(\bar Y_{10},\epsilon)\right)$。二阶矩行使用 delta 方法校正

$$
\hat z_{\mathrm{2nd}}=\frac{1}{\ln 10}\left[\ln\left(\max(\bar Y_{10},\epsilon)\right)+\frac{\hat\sigma^2}{2K\max(\bar Y_{10},\epsilon)^2}\right],
$$

其中 $\hat\sigma^2$ 是同 $K=10$ 次渲染的无偏样本方差。Taylor 回退行把所选渲染分成 5 次锚定渲染与 5 次校正渲染。锚定组构成 $\hat\mu=\max\left(\frac15\sum_{i=1}^5Y_i,\epsilon\right)$。对校正渲染 $Y_{5+j}$（$j=1,\dots,5$），定义 $r_j=(Y_{5+j}-\hat\mu)/\hat\mu$。估计量使用像素均值 $\mu=\mathbb E[Y_i]$ 的对数 Taylor 级数中的乘积项

$$
\ln\mu=\ln\hat\mu+\sum_{m\ge1}\frac{(-1)^{m+1}}{m}\left(\frac{\mu-\hat\mu}{\hat\mu}\right)^m,
$$

其中 $\prod_{j=1}^m r_j$ 估计第 $m$ 次幂项。我们对 32 条俄罗斯轮盘赌路径取平均，即随机截断的级数，其存活项按存活概率重新加权，延续概率 $q_m=\min(\mathrm{CV}\,m/(m+1),0.95)$，其中 CV 是由所选渲染估计的变异系数。CV≥1 或轮盘赌输出非有限的像素回退到上述二阶矩估计量。这些程序在 $K=10$ 渲染预算下尽可能对变换后的目标去偏，但所得训练目标仍是普通对数空间 MSE；额外的 $K$ 次渲染在训练集上摊销，而不是在随机梯度上摊销。

表 12 报告在 100 个留出场景上平均、对 $N=4$ 朴素基线的指标；每个去偏器把朴素对数 % RMSE 降低 50–59%，但没有一个弥合到 PRelL2 的差距（此处 PRelL2 用更早模型版本的指数 $10^{\mathcal G_\theta}$ 输出头，而非 PTNO 的 softplus 头）。

> **表 12（原文 Table 12）：** 即使有显式 Jensen 偏差校正，对数目标去偏器仍留下可观的残余差距。所有方法都在远场辐亮度数据集上以 $N=4$ 训练；显式去偏方法最多消耗 $K=10$ 次渲染用于目标估计。每行一次运行，在 100 个留出场景上相对收敛参考评分；% RMSE、PSNR 与 SSIM 为线性，其余两列为 $\log_{10}$。

| 架构 | 损失/目标 | % RMSE ↓ | $\log_{10}$ 相对 $L^2$ ↓ | PSNR ↑ | SSIM ↑ | $\log_{10}$ SSIM ↑ |
|---|---|---|---|---|---|---|
| NO | 对数 MSE | 56.23 | 1.357 | 19.23 | 0.561 | 0.474 |
| NO | 对数均值 MSE（$K=10$） | 25.44 | 0.489 | 27.29 | 0.848 | 0.787 |
| NO | 二阶矩 MSE（$K=10$） | 23.21 | 0.456 | 28.18 | 0.861 | 0.797 |
| NO | Taylor 回退 MSE（5+5） | 28.39 | 0.516 | 25.10 | 0.829 | 0.735 |
| NO，$10^{\mathcal G_\theta}$ 头 | PRelL2 | **17.17** | **0.083** | **29.53** | **0.942** | **0.914** |

每个显式去偏器都把朴素对数 % RMSE 降低 50–59%，但都没有达到用我们提出的损失训练模型的性能，尽管它们需要额外渲染。差距在 $\log_{10}$ 相对 $L^2$ 上最大，我们达到 0.083，而次优（二阶矩 MSE，$K=10$）为 0.456。

> **图 10（原文 Fig. 10）：** 对数 MSE 收敛到比物理空间训练更高的误差下界。验证线性相对 $L^2$ 随训练 epoch 的变化：(a) 设置 A，单场景、4-SPP 标签；(b) 设置 B，$M=10^6$ 个训练场景、80-SPP 标签；图例中的“Naive log”是对数 MSE，“Power L2”是上文所述更早的 $10^{\mathcal G_\theta}$ 头上的物理空间 $L^2$ 损失，而不是带 PRelL2 的 softplus 头。

> **图 11（原文 Fig. 11）：** 对数 MSE 学到的是有偏目标；物理空间训练不会。设置 A。逐像素平均残差 $\hat b(x)$ 为 $\log_{10}$ 预测减 $\log_{10}\mathcal U(a,x)$；$\bar b$ 为空间平均。(a) $10^{\mathcal G_\theta}$ 头上的物理空间 $L^2$，标记为“Power L2”（我们方法的更早版本；$\bar b\approx0$）。(b) 对数 MSE（$\bar b\approx-1.9$）。(c) 在训练集上估计的经验 Jensen 偏差，与 (b) 一致。

> **图 12（原文 Fig. 12）：** 显式去偏器减小了 log-MSE 偏移，但保留了结构化误差；PRelL2 使残差保持居中。100 个留出远场场景上各去偏策略的最佳与最差预测与残差，PRelL2 列使用更早的 $10^{\mathcal G_\theta}$ 头模型，与表 12 相同。行按 $\log_{10}$ 相对 $L^2$ 选取：最佳块是本文损失下误差最低的场景，最差块是 $\log$ MSE 下误差最高的场景。预测行使用同一 $\log_{10}$ 辐亮度色标；残差行显示 $\log_{10}$ 预测减 $\log_{10}\mathcal U(a)$，使用同一对称 ±3 个数量级色标。对数 MSE 一致地低估亮瓣；显式去偏器减小了偏移但保留了结构化误差；PRelL2 使残差保持在零附近，没有大面积偏差。

### H. 目标分母相对 L2 的偏差校正

图 13 与表 13 研究 Jensen 偏差如何影响远场辐亮度数据集上的相对 $L^2$ 训练。基线相对 $L^2$ 目标把含噪 MC 标签放在分母，因此非线性平方倒数映射把经验最小化者移离物理真解。我们比较该基线与两种相对 $L^2$ 偏差校正策略（从额外独立渲染估计平方反比尺度），以及我们的逐点相对损失。偏差校正的相对 $L^2$ 变体减小了坍缩，但仍远差于 PTNO + PRelL2。本附录记录相应损失的完整定义。

> **表 13（原文 Table 13）：** 偏差校正改善了标签分母相对 $L^2$ 损失，但仍比 PTNO 差至少 5 倍。我们在远场辐亮度数据集上以 $(M,N,K)=(10^6,4,10)$ 比较四种损失变体，并在 100 个留出场景上相对收敛参考评估。变体为：(1) 基线相对 $L^2$ 损失，把 MC 标签放在分母；(2–3) 带附录 H 所述偏差校正策略的相对 $L^2$；(4) 带我们预测归一化逐点相对损失的 PTNO。偏差校正优于有偏基线，但在相对 $L^2$ 上仍比我们的方法差至少 5 倍。三个种子的均值±标准差。

| 目标 | 偏差校正 | 相对 $L^2$ ↓ | $\log_{10}$ 相对 $L^2$ ↓ | $\log_{10}$ SSIM ↑ |
|---|---|---|---|---|
| relL2 | – | 1.0000±0.0000 | 5.0226±0.0000 | 0.1347±0.0000 |
| relL2 | 二阶近似 Taylor | 0.7230±0.0011 | 0.6571±0.0009 | 0.4393±0.0052 |
| relL2 | Taylor | 0.7188±0.0028 | 0.6486±0.0028 | 0.4413±0.0025 |
| PRelL2（本文） | – | **0.1304±0.0031** | **0.0624±0.0008** | **0.9454±0.0019** |

**为什么标签分母无法修复。** 弱标签在零处有点质量，因此标签分母损失的平方反比权重没有有限期望（表 14）。十次渲染均值中约 15% 的像素精确为零，其权重达到约 $10^{12}$，而同一标签中典型（中位）像素约为 $2\times10^2$（单次渲染约 $2\times10^4$）。损失于是退化为在标签为零处复现零，优化器把整个场驱向 softplus 下限，而那里的消失梯度阻止恢复，这就是表 13 基线行与图 13 面板 (b) 背后的第一 epoch 坍缩。任何修复，例如标签下限或对零像素做掩码，都会改变目标而不是去除偏差。

> **表 14（原文 Table 14）：** 弱标签在零处有点质量，因此标签分母权重 $1/(Y+\eta)^2$ 没有有限均值。远场辐亮度语料的 100 个训练场景，$\eta=10^{-6}$；比例是场景上的均值（括号内为中位数），最大像素权重是每个场景最大值在场景上的平均。

| 标签 | 精确为零的像素 | 低于 $\eta$ 的像素 | 最大像素权重 |
|---|---|---|---|
| 单次 4-SPP 渲染 | 0.326（0.140） | 0.392 | $9.6\times10^{11}$ |
| 十次渲染的均值（40 SPP） | 0.148（0.009） | 0.201 | $8.0\times10^{11}$ |

> **图 13（原文 Fig. 13）：** 含噪标签在分母时，相对 $L^2$ 损失使预测坍缩几个数量级；PTNO + PRelL2 不会。一个高动态范围的远场场景；两个模型都只在该场景上训练（$M=1$），并相对其收敛参考评分。每个面板显示 $\log_{10}$ 估计减 $\log_{10}\mathcal U(a,x)$。(a) 基线 relL2 目标 $((B-Y)/(Y+\eta))^2$ 的精确平稳点使用 $1/(Y+\eta)^2$ 权重，使预测坍缩几个数量级。(b) 训练后的基线 relL2 NO 收敛到同样的坍缩场（相对 $L^2\approx1.000$）。(c) 匹配的 PTNO + PRelL2 运行以物理真解为中心（相对 $L^2=0.0067$）。

**相对 L2 偏差校正的实现。** PTNO + PRelL2 使用 10 次渲染的目标均值 $\bar Y_{10}$，即 40-SPP 有效目标，但其分母是预测：

$$
\ell_{\mathrm{sg}}=\left(\frac{\mathcal B_\theta-\bar Y_{10}}{\max(\mathrm{sg}(\mathcal B_\theta),\eta)}\right)^2,\qquad \mathcal B_\theta=\mathrm{softplus}(\mathcal G_\theta(a)).
$$

以预测为条件，分母是常数，随机梯度仍以物理真解为中心。基线相对 $L^2$ 目标则把同样的含噪目标放进尺度：

$$
\ell_{\mathrm{tgt}}=\left(\frac{B-\bar Y_{10}}{\mathrm{sg}(\bar Y_{10})+\eta}\right)^2.
$$

对标量预测 $B$，其平稳点为

$$
B^*=\frac{\mathbb E\left[\bar Y_{10}/(\bar Y_{10}+\eta)^2\right]}{\mathbb E\left[1/(\bar Y_{10}+\eta)^2\right]},
$$

这是一个逆 MC 加权目标，而不是 $\mathbb E[\bar Y_{10}]$。

两种相对 $L^2$ 偏差校正试图通过保持残差渲染与分母估计独立来修复这一点。它们训练

$$
\ell_{\mathrm{iw}}=\hat W(\mathcal B_\theta-Y_r)^2,
$$

其中 $Y_r$ 是选定的一个 4-SPP 残差渲染，$\hat W$ 由不相交的渲染计算。如果 $\hat W$ 是 $(\mathbb E[Y]+\eta)^{-2}$ 的稳定低方差估计，独立性就会恢复正确的不动点。二阶偏差校正使用 $K=10$ 个锚定渲染：

$$
\bar A_K=\frac1K\sum_{i=1}^KA_i,\qquad \hat\mu=\max(\bar A_K,\eta),\qquad \hat\sigma_A^2=\frac{1}{K-1}\sum_{i=1}^K(A_i-\bar A_K)^2.
$$

对权重 $w(x)=(x+\eta)^{-2}$，令 $\mu=\mathbb E[A_i]$、$\sigma^2=\mathrm{Var}(A_i)$，delta 方法给出

$$
\mathbb E[w(\bar A_K)]\approx w(\mu)+\frac12w''(\mu)\frac{\sigma^2}{K}=(\mu+\eta)^{-2}+\frac{3\sigma^2}{K(\mu+\eta)^4},
$$

因此二阶矩对数校正的平方反比对应版本减去这一主导 plug-in 偏差：

$$
\hat W_2=\left[(\hat\mu+\eta)^{-2}-\frac{3\hat\sigma_A^2}{K(\hat\mu+\eta)^4}\right]_+.
$$

Taylor 偏差校正把 10 次渲染分成 5 个锚定渲染 $A_i$ 与 5 个校正渲染 $A'_j$。锚定给出稳定展开点 $\hat\mu=\max(\frac15\sum_iA_i,\eta)$，每个校正渲染贡献一个零均值相对残差 $r_j=(A'_j-\hat\mu)/(\hat\mu+\eta)$，它是 $(\mu-\hat\mu)/(\hat\mu+\eta)$ 的无偏估计。把平方反比权重 $(\mu+\eta)^{-2}$ 在 $\hat\mu$ 附近展开得

$$
(\mu+\eta)^{-2}=(\hat\mu+\eta)^{-2}\sum_{m\ge0}(-1)^m(m+1)\left(\frac{\mu-\hat\mu}{\hat\mu+\eta}\right)^m.
$$

由于 $r_j$ 相互独立，乘积 $\prod_{j=1}^m r_j$ 是第 $m$ 次幂的无偏估计，因此把新残差的乘积代入相继的级数项可保持无偏性。我们截断到 $m=5$（每个校正渲染一个乘积）以得到 plug-in 权重

$$
\hat W_T=(\hat\mu+\eta)^{-2}\left[1+\sum_{m=1}^5(-1)^m(m+1)\prod_{j=1}^m r_j\right].
$$

$\max_j|r_j|>0.95$ 的像素回退到二阶权重；其余非有限值置零，最终权重截断为非负。原始 Taylor–俄罗斯轮盘赌诊断使用同样的负幂级数，8 条轮盘赌路径与延续 $q_m=\min(|r|m/(m+1),0.95)$，但它在第一批就产生了非有限权重，因此未作为成功训练运行报告。

与上一节的对数目标去偏器一样，额外的 $K$ 次渲染在训练集上摊销，而不是在随机梯度上摊销。偏差校正减小了最直接的分母—目标耦合，但校正后的相对 $L^2$ 目标仍把优化集中在不稳定的负尺度权重上，未能恢复预测归一化的 PRelL2 解。逐运行数字见表 13。

> **图 14（原文 Fig. 14）：** 标签分母与偏差校正的相对 $L^2$ 变体在困难场景上仍有向下偏差，而 PRelL2 使残差保持居中。表 13 相对 $L^2$ 偏差校正研究的最佳与最差远场预测。最佳块是 PTNO + PRelL2 下 $\log_{10}$ 相对 $L^2$ 最低的场景，最差块是基线 relL2 下误差最高的场景。预测行使用同一 $\log_{10}$ 辐亮度色标；残差行使用同一对称 ±5 个数量级色标。基线变体在困难场景上仍向下有偏，而预测归一化的 PRelL2 使残差保持居中。

### I. PRelL2 的平稳点与动力学

PRelL2 除标签的总体均值外没有平稳点（只要输出 Jacobian 行满秩），且其期望动力学使一个势单调下降。第 4 节的最小化者等价性论证只覆盖无权平方损失，因此我们直接分析 PRelL2——它用 stop-gradient 预测归一化每个残差。固定输入 $a$，令 $\mathcal B_\theta=\mathcal B_\theta(a)$ 为网络预测，$\mathcal U=\mathbb E_\xi[\hat{\mathcal U}_N(a,\xi)\,|\,a]$ 为含噪目标的总体均值，$J=\partial\mathcal B_\theta/\partial\theta$ 为输出 Jacobian，$D(\mathcal B_\theta)$ 为 stop-gradient 归一化因子的正对角矩阵，其元素为 $\max(\mathcal B_{\theta,i},\eta)^2$。

**不动点。** 由于归一化被 detached，期望参数梯度（相差正常数）为

$$
\mathbb E_\xi[\nabla_\theta\ell\,|\,a]=J^\top D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U). \tag{26}
$$

任何平稳点因此满足 $J^\top D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U)=0$。由于 $D(\mathcal B_\theta)$ 正定，归一化不引入额外零方向；在 $J$ 行满秩（$JJ^\top\succ0$）的标准局部假设下，平稳性强制 $\mathcal B_\theta=\mathcal U$。因此 PRelL2 不引入新的有偏输出空间不动点。秩亏 Jacobian 可在参数空间造出平稳点，这一局限与普通平方损失共有。

**动力学。** 定义势

$$
\Phi(\mathcal B_\theta)=\sum_i\int_{\mathcal U_i}^{\mathcal B_{\theta,i}}\frac{s-\mathcal U_i}{\max(s,\eta)^2}\,\mathrm ds,
$$

其中 $\max(s,\eta)^2>0$ 是体素 $i$ 处依赖预测的归一化因子。其输出空间梯度为 $\nabla_\mathcal B\Phi(\mathcal B_\theta)=D(\mathcal B_\theta)^{-1}(\mathcal B_\theta-\mathcal U)$，与 PRelL2 关于预测的期望梯度一致。相应动力学通过网络 Jacobian 得到，$\dot\theta=-J^\top\nabla_\mathcal B\Phi$，势按

$$
\frac{\mathrm d\Phi}{\mathrm dt}=-\nabla_\mathcal B\Phi^\top JJ^\top\nabla_\mathcal B\Phi\le0
$$

演化。因此期望动力学单调下降 $\Phi$。依赖预测的分母可能改变不同体素的有效学习率与收敛速度，但不会反转更新方向或造出额外输出空间极小值。在 $JJ^\top\succ0$ 下，动力学唯一停止点是 $\mathcal B_\theta=\mathcal U$；当 $\mathcal U_i=0$ 精确成立时，softplus 以边界极限方式逼近该解而非在有限潜值处达到。

**范围。** 仅势的单调下降并不保证收敛到 $\mathcal B_\theta=\mathcal U$。当 $J$ 秩亏时，归一化残差可能位于 $J^\top$ 的零空间中，因此不能排除额外平稳点。这一局限源于通过可能秩亏的神经网络参数化去优化输出空间目标，而不是 PRelL2 特有：标准平方误差训练有平稳条件 $J^\top(\mathcal B_\theta-\mathcal U)=0$。该分析针对连续时间、全批总体梯度动力学，并不直接对有限步随机优化或 Adam 建立收敛性。

**跨初始化经验检验。** PTNO 的五个独立初始化收敛到同一无偏解，而对数 MSE 收敛到一个共同的有偏解（表 15）。我们把每个种子的 $\log_{10}$ 误差场 $d_s=\log_{10}\mathcal B_s-\log_{10}\mathcal U$ 分成所有种子共享的部分 $\bar d$ 与种子特定余项，并报告 $d_s$ 的带符号均值作为乘性偏移。对数 MSE 是阳性对照：其平方误差的 99.9% 在种子间共享，每个种子预测参考的 2.2%，约低 46 倍。PTNO 平均把参考恢复到 0.1% 以内。其剩余误差也主要是共享的，但不带符号，并随场景覆盖而缩小：在表 16 的标签预算分配中，带符号偏移保持在 ±0.07 个数量级内，而 RMS $\log_{10}$ 误差从 0.77 降到 0.13。不动点不会随 $M$ 移动；近似误差会。偏移在亮度上也成立：PTNO 在表 11 的每个分箱中都保持在 0.972–1.034 倍以内，而对数 MSE 在最暗分箱中低 617 倍。

> **表 15（原文 Table 15）：** PTNO 的各种子就无偏解达成一致；对数 MSE 的各种子就有偏解达成一致。远场辐亮度，$(M,N,K)=(10^6,4,1)$，五个种子，100 个留出场景相对收敛参考。偏移为 $10^{\mathrm{mean}(d_s)}$，种子上的均值±标准差。

| 损失 | RMS $\log_{10}$ 误差 | 共享 RMS | 种子特定 RMS | 预测/参考 |
|---|---|---|---|---|
| NO + $L^2$ | 1.1032 | 0.7982 | 0.7615 | 0.525±0.060 |
| NO + 对数 MSE | 2.1337 | 2.1325 | 0.0721 | 0.0215±0.0000 |
| PTNO + PRelL2（本文） | **0.1518** | **0.1394** | **0.0602** | **0.999±0.005** |

### J. 受控消融与标签预算分配

四个数据集上的五种子损失比较是表 2。在远场辐亮度上，线性 $L^2$ 损失在亮区主导的 % RMSE 上胜出（$15.27\pm1.32$ 对 PTNO 的 $16.43\pm0.55$），代价是 $\log_{10}$ SSIM 低 0.26，这损失在暗区域。

#### J.1 分配固定标签预算

场景覆盖控制精度，直到训练集达到约 $5\times10^5$ 个构型，这与 walk-on-spheres 算子学习及蒙特卡洛代理模型 [14, 20] 一致；表 18 表明覆盖带来多少帮助取决于损失。表 16 把原始标签预算固定为 $M(N/4)K=10^6$ 个四 SPP 渲染当量、训练预算固定为 $10^5$ 次优化器更新（200 个 epoch、每 epoch 5000 个样本），只改变渲染的分配方式。对 $N\ge8$，重复的四 SPP 渲染被平均成一个目标；$K>1$ 的行在多次访问中循环这些相同的原始渲染。

> **表 16（原文 Table 16）：** 在固定标签预算下，把渲染分散到更多场景有帮助，直到约 $5\times10^5$ 个场景。远场辐亮度。第一个块在增加场景覆盖的同时减少每场景有效样本；第二个块循环重复的四 SPP 渲染而不是预平均它们。条目为 40×80 上、100 个留出场景相对收敛参考的 $\log_{10}$ SSIM，所列种子的均值±标准差；没有不确定度的条目是单种子测量。

| 场景数 $M$ | 有效 $N$ | 渲染数 $K$ | 种子 | $\log_{10}$ SSIM ↑ |
|---|---|---|---|---|
| 125 | 32,000 | 1 | 3 | 0.2716±0.0098 |
| 1,000 | 4,000 | 1 | 3 | 0.4829±0.0043 |
| 8,000 | 500 | 1 | 3 | 0.7581±0.0019 |
| 31,250 | 128 | 1 | 3 | 0.8450±0.0026 |
| 62,500 | 64 | 1 | 3 | 0.8716±0.0018 |
| 125,000 | 32 | 1 | 1 | 0.9009 |
| 250,000 | 16 | 1 | 3 | 0.9191±0.0011 |
| 500,000 | 8 | 1 | 3 | **0.9234±0.0030** |
| 1,000,000 | 4 | 1 | 5 | 0.9165±0.0040 |
| 31,250 | 4 | 32 | 3 | 0.9096±0.0049 |
| 125,000 | 4 | 8 | 3 | 0.9143±0.0019 |
| 500,000 | 4 | 2 | 1 | 0.9196 |

在 $M=31{,}250$ 上循环把 $\log_{10}$ SSIM 提高 0.0646，在 $M=125{,}000$ 上提高 0.0134；在 $M=500{,}000$ 上差值为 $-0.0038$。重复标签在覆盖平台之前有帮助，一旦语料足够广就不再重要。

**广泛的含噪监督以五分之一的粒子预算胜过收敛标签对照。** 在 $10^6$ 个场景、4 SPP 上训练 PTNO 达到 $0.9165\pm0.0040$，总预算 $4\times10^6$ 个样本；而 $10^4$ 个场景、$10^4$ SPP 达到 $0.8893\pm0.0071$，共 $10^8$ 个样本，因此把粒子分散到更多场景在 $\log_{10}$ SSIM 上多得 0.0272。$10^4$-SPP 对照标签接近收敛：由每个场景 32 次独立四 SPP 渲染的样本方差，$10^4$-SPP 标签的相对 $L^2$ 误差为 1.9%（中位数 1.2%），而单个四 SPP 标签为 94%。

PTNO 在收敛标签上也胜出，因此 PRelL2 不只是针对标签噪声的修补（表 17）。在 $M=10^4$ 时，把线性 $L^2$ 换成 PTNO 在 $10^4$-SPP 标签上把 $\log_{10}$ SSIM 提高 0.26，在四 SPP 标签上提高 0.20。在这个小 $M$ 上收敛标签对两种损失都有帮助；表 16 表明同样的粒子分散到更多场景时买到更多。

> **表 17（原文 Table 17）：** PTNO + PRelL2 在接近收敛与含噪标签上都优于线性 $L^2$。$M=10^4$ 时损失 × 标签质量，远场辐亮度。两个标签列共享同样的 $10^4$ 个场景。条目为 100 个留出场景上的 $\log_{10}$ SSIM，三个种子的均值±标准差。

| 损失 | $N=10^4$ 标签 | $N=4$ 标签 |
|---|---|---|
| NO + $L^2$ | 0.6257±0.0060 | 0.3468±0.0069 |
| PTNO + PRelL2（本文） | **0.8893±0.0071** | **0.5478±0.0043** |

#### J.2 更多场景无法去除偏差

PTNO 随场景数持续改进，而有偏损失趋于平坦（表 18）。固定 $N=4$、$K=1$，把 $M$ 从 $10^5$ 增到 $10^6$，PTNO 提高 0.14（$\log_{10}$ SSIM），而线性 $L^2$ 为 0.02、对数 MSE 为 0.01。额外数据减小方差，但有偏目标的最小化者不会移向真解。

> **表 18（原文 Table 18）：** 场景更多时，PTNO 持续改进而有偏损失趋于平坦。固定标签质量下的场景缩放，远场辐亮度，$(M,N,K)=(M,4,1)$。条目为 100 个留出场景上的 $\log_{10}$ SSIM，三个种子的均值±标准差（$M=10^6$ 时为五个）。

| $M$ | NO + $L^2$ | NO + 对数 MSE | PTNO + PRelL2 |
|---|---|---|---|
| $10^4$ | 0.3468±0.0069 | 0.2391±0.0034 | **0.5478±0.0043** |
| $10^5$ | 0.6316±0.0055 | 0.4562±0.0013 | **0.7815±0.0028** |
| $10^6$ | 0.6524±0.0196 | 0.4699±0.0007 | **0.9165±0.0040** |

#### J.3 在 N 与 K 之间分配每场景预算

在固定每场景预算下，循环多个廉价标签优于把它们平均成一个（表 19）。我们固定 $M=31{,}250$、$NK=128$ 并改变拆分：每个场景存 $K$ 次 $N$ SPP 的渲染，训练每次访问呈现其中一个。从单个 128-SPP 标签转到 8 个 16-SPP 标签，$\log_{10}$ SSIM 从 0.8450 升到 0.9111。精度在 $K=8$–16 附近饱和：$K=16$ 给出最佳分数，再提高 0.0070，而 $K=32$ 回落到 0.9096。预平均标签固定了一个网络可以拟合的噪声实现，而循环在每次访问都呈现新的无偏抽样。

> **表 19（原文 Table 19）：** 在固定每场景预算下，循环多个廉价标签优于一个平均标签，直到约 $K=8$–16。$M=31{,}250$、$NK=128$ 时的每场景 $N$–$K$ 拆分，远场辐亮度。条目为 100 个留出场景上的 $\log_{10}$ SSIM，三个种子的均值±标准差。

| $N$ | $K$ | $\log_{10}$ SSIM ↑ |
|---|---|---|
| 128 | 1 | 0.8450±0.0026 |
| 64 | 2 | 0.8683±0.0021 |
| 32 | 4 | 0.8922±0.0024 |
| 16 | 8 | 0.9111±0.0022 |
| 8 | 16 | **0.9181±0.0033** |
| 4 | 32 | 0.9096±0.0049 |

#### J.4 分配的有限样本视角

本小节陈述哪些项随 $M$、$N$、$K$ 缩放，以及每种损失被证明了什么。场景 $a_i$（$i=1,\dots,M$）携带 $K$ 次独立渲染 $Y_{i,j}=\mathcal U(a_i)+\zeta_{i,j}$，每次渲染平均 $N$ 个蒙特卡洛样本，$\mathbb E[\zeta_{i,j}\,|\,a_i]=0$，逐单元方差 $\sigma^2/N$，其中 $\sigma^2$ 是单样本方差。

**渲染只通过其均值进入。** 对任何不依赖标签的逐单元权重 $w$（平方损失 $w=1$，PRelL2 在归一化项 detached 时 $w=\mathcal S(\mathcal B_\theta(a_i))^{-2}$），

$$
\frac1K\sum_{j=1}^Kw(\mathcal B-Y_{i,j})^2=w(\mathcal B-\bar Y_i)^2+\frac wK\sum_{j=1}^K(Y_{i,j}-\bar Y_i)^2,\qquad \bar Y_i=\frac1K\sum_{j=1}^KY_{i,j},
$$

且最后一项不依赖预测 $\mathcal B$。因此经验目标及其全批梯度只通过 $\bar Y_i$ 看到 $K$ 次渲染，其噪声方差为 $\sigma^2/(NK)$：$K$ 次渲染各 $N$ 个样本相当于一次 $NK$ 个样本的渲染。每次访问呈现一次渲染的随机训练不在此恒等式覆盖范围内；表 19 表明在小 $M$ 下它在相同 $NK$ 时优于预平均。

**场景与蒙特卡洛精度。** 对这些无偏标签的无权平方损失，相对收敛解的风险是第 4 节干净目标 $\mathcal L_C$ 相差一个常数；对有效维数 $d_{\mathrm{eff}}$ 的可实现类 $\mathcal F$，标准最小二乘分解给出

$$
\mathbb E R(\hat\theta)-\inf_{\theta\in\Theta}R(\theta)\lesssim\mathcal E_M(\mathcal F)+\frac{\sigma^2d_{\mathrm{eff}}}{MNK},
$$

其中 $\mathcal E_M(\mathcal F)$ 是同一估计量从 $M$ 个收敛标签所能达到的超额风险。$\mathcal E_M$ 依赖 $M$ 与 $\mathcal F$，但不依赖 $N$ 或 $K$；标签噪声只通过 $1/(MNK)$ 贡献，因此场景覆盖在任何标签精度下都降低风险，而 $1/N$ 或 $1/K$ 单独不会产生项。

**非线性标签变换。** 若损失把预测与变换后的标签 $\log_{10}Y$ 比较，总体最小化者是 $\mathbb E[\log_{10}Y]$，delta 方法给出逐单元 $\mathbb E[\log_{10}Y]=\log_{10}\mathcal U-\sigma^2/(2n\mathcal U^2\ln 10)+O(n^{-2})$，其中当每次渲染都被变换并循环时 $n=N$，当 $K$ 次渲染先平均时 $n=NK$。拟合预测偏移 $O(1/N)$（相应地 $O(1/(NK))$），这给相对 $\log_{10}\mathcal U$ 的风险增加一个 $1/N^2$（相应地 $1/(NK)^2$）量级的下界；任何场景数都无法消除它，循环更多渲染也不会减小它。标签分母相对损失有类似偏移，且由于标签在零处有点质量，其权重没有有限均值（附录 H）。

**PRelL2 被证明了什么。** 附录 I 表明，在关于蒙特卡洛噪声的期望下，只要输出 Jacobian 行满秩，PRelL2 梯度除标签均值 $\mathcal U(a)$ 外没有输出空间平稳点，因此上述 Jensen 偏移不会出现。平均恒等式对 PRelL2 在固定归一化项下也成立。上述方差界只对无权平方损失证明；由于 PRelL2 权重依赖预测，我们不宣称它对 PRelL2 成立。

### K. 代价核算与加速

下文的 EU-DEMO 精度交点使用最终检查点。其他任务保留其历史精度交点与计时，待相应重跑；其检查点局限记录在附录 F。代理模型在 12–197 次查询后收回其离线代价，在匹配精度下在中子学上比 MC 便宜 $10^3$–$10^5$ 倍，而在辐射输运上 MC 代价是算子的 0.8–11 倍。表 20 概述该比较；下面几段给出离线代价、与收敛 MC 的同设备比较，以及匹配精度测量。

> **表 20（原文 Table 20）：** 在匹配精度下，MC 在中子学上代价是算子的 $10^3$–$10^5$ 倍，在辐射输运上是 0.8–11 倍。两种方法在同一设备上运行（辐射输运用一块 GPU，中子学用一个 24 线程 CPU）。匹配精度条目是达到算子误差所需的 MC 代价除以算子代价的逐场景中位数；EU-DEMO 的 MC 使用 FW-CADIS 权窗并计入其生成代价。∗ 表示在大多数场景上 MC 在测得预算内未达到算子的 $\log_{10}$ SSIM；球形托卡马克条目把逐场景误差曲线外推至多一个数量级，EU-DEMO 条目是下界。

| 数据集 | 收敛 MC | 匹配 $\log_{10}$ SSIM | 匹配 $\log_{10}$ 相对 $L^2$ | 盈亏平衡查询数 |
|---|---|---|---|---|
| 远场辐亮度 | $1.8\times10^5$ | 11 | 5.5 | 12 |
| 3D 注量 | $1.8\times10^4$ | 2.1 | 0.8 | 87 |
| 球形托卡马克 | $9.9\times10^4$ | $6.4\times10^4$∗ | $9.4\times10^3$ | 197 |
| EU-DEMO | $1.2\times10^4$ | $>1.6\times10^4$∗ | $1.6\times10^3$ | 12 |

**离线代价与盈亏平衡。** 对我们的训练集，收敛标签的代价比我们所训练的含噪标签高 $5\times10^3$–$10^5$ 倍（表 21，“Converged / noisy”）。盈亏平衡 = 离线代价（标签生成 + 训练）除以一次收敛求解的代价减一次推断。对中子学任务，GPU 训练时间相对 CPU 标签生成很小，单独列出而不换算成核·小时。以收敛质量标注 EU-DEMO 训练集将需要约 $6\times10^8$ 核·小时。

> **表 21（原文 Table 21）：** 离线代价在数十到几百次查询后收回。标签代价在 H200 GPU（辐射输运）、Xeon Gold 6130 CPU 的 8 核任务（球形托卡马克），以及 Xeon Ice Lake 与 Skylake 节点的 8 核任务（EU-DEMO）上测得；训练代价是同一配方在一块 H200 GPU 上的历史五次运行均值，保留用于代价核算而非替换运行的运行时间。球形托卡马克的收敛代价按其训练标签的 8 核配置给出；$10^9$ 历史参考本身以 4 核任务运行，每场景 305.5 核·小时。代价取自调度器记账；EU-DEMO 收敛代价是 24 个参考场景上的均值。

| 数据集 | 含噪标签集 | 训练 | 收敛/场景 | 收敛/含噪 | 盈亏平衡 |
|---|---|---|---|---|---|
| 远场辐亮度 | 3.79 GPU·h（$10^6$） | 0.75 GPU·h | 0.372 GPU·h | $9.8\times10^4$ | 12 |
| 3D 注量 | 1.97 GPU·h（$3\times10^5$） | 7.98 GPU·h | 0.115 GPU·h | $1.75\times10^4$ | 87 |
| 球形托卡马克 | 70,300 核·h（$10^6$） | 1.81 GPU·h | 356.8 核·h | $5.2\times10^3$ | 197 |
| EU-DEMO | 71,607 核·h（$10^5$） | 2.88 GPU·h | 6,069 核·h | $8.5\times10^3$ | 12 |

**同设备、收敛 MC。** 复现一个收敛参考的代价是算子推断的 $1.2\times10^4$–$1.8\times10^5$ 倍（两者在同一设备上运行时）。图 4 在 GPU 上给算子计时、在 24 线程 CPU 上给 MC 计时，因为 OpenMC 没有 GPU 实现，该比值把 10–60 倍的硬件因子折进比较；这里的数字去掉了它。同一设备与参考自身输出网格上，收敛 MC 的代价是算子推断的 $1.8\times10^5$ 倍（远场辐亮度，40×80 输出网格上 220 SPP 需 607 s，其复现参考到 $\log_{10}$ 相对 $L^2$ 0.0008，而算子为 3.4 ms）与 $1.8\times10^4$ 倍（3D 注量，2,636 s 对 144 ms），两种方法都在一块 RTX 5070 Laptop GPU 上计时。在单个 24 线程 CPU 上（球形托卡马克用 Xeon Gold 6130，EU-DEMO 用 Xeon Platinum 8352Y），逐场景中位数为 $9.9\times10^4$ 倍（球形托卡马克，$10^9$ 历史对 0.47 s 前向传播）与 $1.2\times10^4$ 倍（EU-DEMO，完整权窗与输运链，中位数 6,130 核·小时，对 700×365×730 参考网格上 79 s 前向传播）。

**匹配精度。** MC 在辐射输运上以较低代价达到算子精度，而在中子学上只有付出极大代价才能达到。对每个留出场景，我们在同一设备上扫描 MC 预算，用与算子相同的指标把每个预算相对独立参考评分，并记录 MC 首次匹配算子误差的代价；我们报告场景中位数。在远场辐亮度（100 个场景）上，MC 以算子代价的 11.3 倍匹配 $\log_{10}$ SSIM（四分位距 4.5–34），以 5.5 倍（3.4–10.5）匹配 $\log_{10}$ 相对 $L^2$。在 3D 注量（100 个场景）上，因子为 2.1 倍（1.0–9.6）与 0.8 倍（0.44–2.2）：在一半场景上，MC 在算子自身推断时间内就匹配了范数误差。在球形托卡马克（50 个场景）上，我们把每个场景的 100 次独立 $10^7$ 历史运行分成一个 $5\times10^8$ 历史参考与一串增长到 $5\times10^8$ 历史的 MC 预算。MC 以中位数 $9.4\times10^3$ 倍（四分位距 $4.9\times10^3$–$2.3\times10^4$）匹配 $\log_{10}$ 相对 $L^2$；对 $\log_{10}$ SSIM，50 个场景中有 32 个在最大预算（约 $4.7\times10^4$ 倍）仍未匹配，把每个场景的误差曲线外推至多一个数量级得到中位数 $6.4\times10^4$ 倍。

在 EU-DEMO 上，MC 只有借助权窗才能匹配算子的范数误差，而即使有权窗，在测得预算内 24 个场景中的每一个都未达到算子的 $\log_{10}$ SSIM（表 22）。我们在 24 个场景上运行三种 MC 变体，并在适用处计入权窗生成代价。无窗时，MC 在任何场景的 $10^7$ 历史内都不匹配算子。廉价的 FW-CADIS 窗让 MC 以算子代价的 $1.6\times10^3$ 倍匹配 $\log_{10}$ 相对 $L^2$，但 24 个场景仍全部未达到其 $\log_{10}$ SSIM。参考自身的 FW-CADIS→MAGIC 窗也达到范数目标，但构建它每场景约需 2,000 核·小时，使端到端因子升到 $2.2\times10^5$ 倍。在每个任务上，匹配由 $\log_{10}$ SSIM 度量的暗区域结构所花的 MC 代价都高于匹配范数。

> **表 22（原文 Table 22）：** EU-DEMO 的匹配精度因子取决于给予 MC 的权窗。24 个场景上 MC 代价除以算子代价的逐场景中位数，两者都在一个 Xeon Platinum 8352Y 上。“Transport”只计输运；“+ window”加上权窗生成代价。> 标记 MC 仍落后于算子时的下界。所有条目只在参考有测量的单元上评分（网格的 45.4%）。MAGIC 的 SSIM 因子是外推的；测得的端到端下界为 $2.6\times10^5$。

| MC 变体 | 权窗/场景 | 匹配 $\log_{10}$ 相对 $L^2$：Transport | + window | 匹配 $\log_{10}$ SSIM：Transport | + window |
|---|---|---|---|---|---|
| Analog（模拟） | — | $>1.6\times10^3$ | — | 无穿越 | — |
| FW-CADIS | 10.2 核·h | $5.4\times10^2$ | $1.57\times10^3$ | 未匹配 | $>1.6\times10^4$ |
| FW-CADIS→MAGIC | 2,009 核·h | $6.8\times10^2$ | $2.17\times10^5$ | $9.1\times10^5$ | $1.1\times10^6$ |

对 MAGIC 的 SSIM 估计，我们通过每个场景最后两个测得预算，把其误差曲线在粒子数上外推至多 1.5 个数量级。24 个场景中有 20 个在该范围内穿越；其余 4 个在计算全部 24 个场景的中位数时计为位于该范围之上。

### L. 适用范围与分布内边界

**哪些输运问题适合 PTNO。** PTNO 面向低阶模型失效且收敛 MC 昂贵的输运问题。在光学厚、系数光滑、近各向同性散射且尺度分离清晰的介质中，扩散或低阶矩方程是精确的，学习代理提供的帮助很小。我们的设置以不同方式违反这些条件。辐射输运数据集在几乎整个范围内采样 Henyey–Greenstein 各向异性，并配合分片或形状变化的系数，因此训练分布的很大部分具有强各向异性与锐利界面。中子学设置是深屏蔽问题，其参考通量跨越约 10（球形托卡马克）与 17（EU-DEMO）个数量级（表 24），难到 EU-DEMO 参考本身需要 FW-CADIS 与 MAGIC 权窗。附录 K 的代价核算给出实用判据：当解的暗尾对 MC 而言收敛昂贵时，代理模型的收益最大。

**训练设计变化什么。** 每个留出构型都是与训练集同一设计的新鲜抽样（表 23），因此所有报告的精度都是参数化族内的插值。各轴在边界处行为不同。系数范围（$\sigma_t$、$c$、$g$）与源参数形成软边界：解对它们光滑依赖，因此刚好位于采样范围之外的查询是轻度外推，我们不评估它。几何族形成硬边界：族内几何被参数化且被设计覆盖，但不同的机器、新的端口或训练中不存在的部件都是分布外。对 EU-DEMO，族是单一固定几何。

> **表 23（原文 Table 23）：** 每个数据集在固定族内变化系数、源或几何；留出集是同一设计的新鲜抽样。

| 数据集 | 逐场景变化 | 保持固定 |
|---|---|---|
| 远场辐亮度 | 无穷远环境贴图（1–4 个高斯瓣与 1–4 个角盒子，强度在 $[0.1,10]$）；分片常数角向 $\sigma_t\in[0.01,10]$ 与 $c\in[0.01,0.99]$；$g\sim\mathrm{Unif}(-0.99,0.99)$ | 单位球几何 |
| 3D 注量 | 近真空背景中 2–5 个轴对齐盒子，$\sigma_t\in[0.01,50]$、$c\in[0.01,0.99]$；1–3 个点发射器，强度在 $[1,20]$，一半带 Perlin 角分布；$g\sim\mathrm{Unif}(-0.95,0.95)$ | 立方体 $[-1,1]^3$、真空边界 |
| 球形托卡马克 | 表 8 的全部 20 个轴：径向构建、几何与等离子体源共享的 D 形、H 模式密度与温度剖面、Shafranov 位移、源径向偏移 | 材料成分、计数网格 |
| EU-DEMO | 表 9 的 8 个等离子体源轴 | 整个反应堆几何与材料 |

**辐射输运设计的物理真实性。** 辐射输运设计比任何单一应用都宽；3D 注量设计在辐射输运一侧承载高动态范围情形，复现球形托卡马克的动态范围。消光、反照率与相位函数范围是参与介质模拟与渲染中物理上允许的范围；例如云的反照率接近 1，位于我们的范围内。空间变化场组合局部结构、多尺度与锐利界面，而不是单一经验分布。表 24 表明合成 3D 注量参考跨越约 10 个数量级，与球形托卡马克参考一样多，少于 EU-DEMO（约 17），而远场辐亮度只跨越约 3 个。因此远场辐亮度不是高动态范围压力测试；我们用其做标签噪声与分配研究，因为它是唯一一个数千个训练场景的收敛参考可以承受的设置。

> **表 24（原文 Table 24）：** 3D 注量与球形托卡马克参考跨越约 10 个数量级，EU-DEMO 约 17，远场辐亮度约 3。逐场景，跨度是参考最大值与其最小正值之比的 $\log_{10}$；当数据集 $\log_{10}$ 下限 $\epsilon$ 更低时，用“above $\epsilon$”以 $\epsilon$ 替代该最小值，即 $\log_{10}$ 指标看到的数据范围（附录 F）。条目为留出评估场景（按评分场）上的均值±标准差：远场辐亮度为 40×80 网格，球形托卡马克逐能群（350 个场景—能群对），EU-DEMO 只在参考有测量的单元上。

| 数据集 | 场景数 | 跨度 | $\epsilon$ | above $\epsilon$ 跨度 | 精确零 |
|---|---|---|---|---|---|
| 远场辐亮度 | 100 | 3.16±1.27 | $10^{-6}$ | 3.16±1.27 | 0.0% |
| 3D 注量 | 100 | 10.48±1.69 | $10^{-10}$ | 8.85±0.85 | 2.3% |
| 球形托卡马克 | 50 | 10.16±0.99 | $10^{-10}$ | 8.21±0.88 | 41.6% |
| EU-DEMO | 24 | 16.97±0.26 | $10^{-17}$ | 10.90±0.04 | 0.0% |

**实测数据。** 两个领域都没有稠密的全场测量。没有运行中的聚变电站提供反应堆条件下的能量分辨中子场，现有探测器给出稀疏读数与仪器特定的能量响应。光输运数据集提供图像或稀疏辐射度测量，而不是带有点逐验证所需几何、材料与照明规格的完整输运场。因此我们的评估是基于模拟的，这在屏蔽与反应堆设计中是标准做法。

### M. 主干比较与超参数搜索

在带四 SPP 标签的远场辐亮度任务上，FNO 在匹配参数量与匹配搜索预算两种口径下都排名第一。所有检查点都在 40×80 训练网格上相对同一 100 场景收敛参考评估。

**匹配参数量。** 我们把八个主干系列调整到 9.4–13.3 百万参数区间，并用 PTNO + PRelL2 与对数 MSE 各训练三个种子。比较包括 FNO、SFNO [45]、U-NO [46]、CNO [47]、U-Net [48]、DeepONet [49]、Transolver [50] 与 GNOT [51]。

> **表 25（原文 Table 25）：** PTNO 目标改善每个主干，且在匹配参数量下 FNO 排名第一。远场辐亮度，四 SPP 标签。精度条目为 40×80、100 个留出场景上的 $\log_{10}$ SSIM，三个种子的均值±样本标准差，例外是 GNOT + PRelL2（一个完成的种子；两个发散）。延迟用每个系列相同的单样本推断基准测量。增益为 PTNO + PRelL2 的 SSIM 减去匹配对数 MSE 的 SSIM。

| 主干 | 参数量（M） | 延迟（ms） | PTNO + PRelL2 | 对数 MSE | 增益 |
|---|---|---|---|---|---|
| FNO | 10.390 | 3.07 | **0.9220±0.0026** | 0.4733±0.0020 | +0.4487 |
| SFNO | 9.445 | 4.38 | 0.9076±0.0002 | 0.4691±0.0007 | +0.4385 |
| U-NO | 12.633 | 3.56 | 0.8498±0.0016 | 0.4525±0.0011 | +0.3973 |
| U-Net | 13.258 | 1.60 | 0.8328±0.0037 | 0.4338±0.0028 | +0.3990 |
| CNO | 12.477 | 3.73 | 0.7976±0.0027 | 0.4213±0.0022 | +0.3763 |
| Transolver | 11.206 | 10.54 | 0.4055±0.0058 | 0.2191±0.0032 | +0.1865 |
| GNOT | 10.940 | 15.37 | 0.3724 | 0.2538±0.0024 | — |
| DeepONet | 12.064 | 0.49 | 0.2957±0.0058 | 0.1964±0.0032 | +0.0993 |

PTNO 目标在全部七个两臂都完成三种子的系列上提高平均 SSIM：五个基于网格的系列增益 0.3763–0.4487，DeepONet 与 Transolver 为 0.0993–0.1865。GNOT 只有一个完成的 PRelL2 种子，因此不报告匹配的三种子增益。因此该目标可跨主干迁移，而可达精度仍受主干限制。

**Transolver 与 GNOT。** 在共享训练配方下，Transolver 与 GNOT 在该任务上落后于基于网格的算子。二者都是为不规则网格与一般几何而构建的，而该任务把 40×80 规则角网格上的场作映射，谱算子与卷积算子在那里具有匹配的归纳偏置；我们用作者的参考实现训练二者。它们在对数 MSE 下也有相同差距，0.2191 与 0.2538 对五个网格系列的 0.4213–0.4733，因此这不是 PRelL2 造成的。Transolver 的种子标准差为 0.0058，而网格系列至多 0.0037。GNOT 用 PRelL2 的三个运行中有两个在计划结束前发散；唯一完成的种子得 0.3724，无法确立种子稳定性。两个系列都没有进入表 26 的匹配搜索，因此其配置未调优。因此该比较是在一个训练配方下对规则网格输运场的主干排序，并不检验这两个架构在其目标的不规则网格上的表现。

**匹配搜索预算。** 六个系列各获得六个 40 epoch 候选。我们把每个系列的前两名候选提升到 200 epoch，重训所选配置并评估其最终检查点的三个种子。候选选择与提升使用同样的评估场景；没有独立的选型集可用。表 26 报告每个系列中更强的提升配置。

> **表 26（原文 Table 26）：** 在匹配搜索预算下，FNO 仍排名第一。远场辐亮度，四 SPP 标签。每个系列获得相同的候选与提升预算；配置给出每轴 Fourier 模态数、通道宽度与层数。条目为 200 个 epoch 后三个种子的均值±样本标准差，在 40×80 的 100 个留出场景上。

| 主干 | 选定配置 | $\log_{10}$ 相对 $L^2$ ↓ | $\log_{10}$ SSIM ↑ |
|---|---|---|---|
| FNO | 10 模态，宽度 128，6 层 | **0.0750±0.0021** | **0.9277±0.0042** |
| SFNO | 16 模态，宽度 128，6 层 | 0.1100±0.0003 | 0.9037±0.0005 |
| U-NO | 16 模态，宽度 32，6 层 | 0.1233±0.0007 | 0.8482±0.0017 |
| U-Net | 宽度 96，4 层 | 0.1326±0.0015 | 0.8439±0.0018 |
| CNO | 宽度 64，5 层 | 0.1395±0.0007 | 0.8265±0.0005 |
| DeepONet | branch 256，trunk 128，basis 128 | 0.5526±0.0104 | 0.3229±0.0062 |

两种比较在其共享的六个系列上产生相同排序：FNO、SFNO、U-NO、U-Net、CNO，然后是 DeepONet。容量几乎无法解释该目标的优势：把 FNO 从 2.77 百万参数增到 10.39 百万参数，SSIM 从 0.9165±0.0040 升到 0.9220±0.0026，增益 0.0055，而表 25 中匹配 FNO 的损失增益为 0.4487。

### N. 跨分辨率评估与多分辨率训练

单分辨率训练支持 FNO 在邻近网格上的原生推断。在 EU-DEMO 上，精度在 0.5× 到 1× 训练分辨率之间保持，在 2× 处适度下降；在远场辐亮度上，2× 的原生前向优于低分辨率预测再上采样。

**远场辐亮度。** 我们在 40×80 上训练，并在 100 个留出场景上评估一个更早的单种子检查点（用 128-SPP 标签训练）。在 80×160 上，原生推断达到 $\log_{10}$ SSIM 0.931，而块复制 40×80 预测为 0.901。原生前向还把线性相对 $L^2$ 从 0.165 降到 0.139。表 2 的五种子检查点在 120×240（每轴训练分辨率的三倍）上达到 $\log_{10}$ SSIM 0.8969±0.0030，而在训练网格上为 0.9165±0.0040。

**EU-DEMO。** 我们在 140×73×146 上训练，并在 0.5×、1×、2× 分辨率上评估五个主表种子，只在参考有测量的单元上评分（网格的 42.6%、45.4% 与 46.6%）。$\log_{10}$ SSIM 在 0.5× 处为 0.7895±0.0040，在训练网格上为 0.7923±0.0016，在 2× 处为 0.7181±0.0016；不同网格的支持略有差异。在 5×（700×365×730，参考的原生网格，49.1% 有测量）上，$\log_{10}$ 相对 $L^2$ 保持在 0.0844±0.0004，而 $\log_{10}$ SSIM 降到 0.5441±0.0006：其 11 单元窗在每轴上覆盖的物理范围是训练网格上的五分之一，因此两个 SSIM 值度量的是不同物理尺度上的结构。

> **表 27（原文 Table 27）：** 无需重训，精度在邻近网格上保持，并在更大分辨率步长下下降。跨分辨率评估。远场块比较原生前向与块上采样，用于一个更早的、用 128-SPP 标签训练的单种子检查点，不能与表 2 直接比较。EU-DEMO 条目是五个主表种子在 24 个留出构型上的均值±样本标准差，只在参考有测量的单元上评分。

| 网格与推断路径 | 相对 $L^2$ ↓ | $\log_{10}$ 相对 $L^2$ ↓ | $\log_{10}$ SSIM ↑ |
|---|---|---|---|
| **远场辐亮度** | | | |
| 40×80（训练网格） | **0.120** | **0.056** | **0.952** |
| 80×160（原生前向） | 0.139 | 0.069 | 0.931 |
| 80×160（40×80 再上采样） | 0.165 | 0.094 | 0.901 |
| **EU-DEMO** | | | |
| 70×37×73（0.5× 原生） | 0.1203±0.0088 | 0.0854±0.0007 | 0.7895±0.0040 |
| 140×73×146（训练网格） | **0.1085±0.0068** | 0.0839±0.0006 | **0.7923±0.0016** |
| 280×146×292（2× 原生） | 0.1216±0.0057 | **0.0836±0.0005** | 0.7181±0.0016 |
| 700×365×730（5× 原生） | 0.1259±0.0058 | 0.0844±0.0004 | 0.5441±0.0006 |

**十倍网格步长的混合分辨率训练。** 加入 100 个高分辨率训练场景，把 700×550×800 原生网格上直接前向传播的活跃体素 log MAE（参考通量高于下限的体素上的平均绝对 $\log_{10}$ 误差）从 5.36 降到 2.36。线性相对 $L^2$ 仍接近 1，因此新增数据减轻了原生尺度坍缩的严重程度，但并未建立十倍分辨率不变性。

> **表 28（原文 Table 28）：** 加入少量高分辨率场景减轻但不能消除十倍网格步长下直接前向传播的坍缩。更早 EU-DEMO 设置上的混合分辨率诊断，每行一次运行。基线使用 50,000 个 70×55×80 场景；混合运行加入 100 个 350×275×400 场景。原生直接指标使用三个配对场景，低分辨率预测再上采样使用十个。

| 训练语料 | 训练网格相对 $L^2$ | 原生直接相对 $L^2$ | 活跃 log MAE | 低分辨率上采样相对 $L^2$ |
|---|---|---|---|---|
| 仅低网格 | 0.0173 | 1.0000 | 5.36 | 0.1627 |
| 低+高网格 | 0.0207 | 0.9998 | 2.36 | 0.1617 |

混合运行在六小时限制下达到 20 个 epoch 中的第 16 个。其低分辨率精度与单分辨率基线相当，其直接原生尺度预测仍在训练幅度范围之外。邻近网格推断可靠；十倍网格步长需要显式分辨率一致的表示。

### O. 源叠加、四面体输运与标签验证

#### O.1 源叠加与几何泛化

固定几何的输运对源是线性的，因此非线性代理必须与源叠加基线比较。在 EU-DEMO 上，非负秩 64 Green 算子达到 log 相对 $L^2$ 0.0703 与 log SSIM 0.7958，而同三个种子上主表 PTNO 配方为 0.0840 与 0.7920。两者都使用最终检查点、同一代码、H200 硬件、标签、损失与 50,000 次更新；它们的源表示不同（体素化场对八个参数）。Green 算子的线性相对 $L^2$ 更差，0.2529 对 0.1085，其线性 PSNR 为 28.27 对 33.83 dB。因此固定几何 DEMO 并不能确立非线性算子在每个指标上都优于源线性模型。

一个单独的球形托卡马克实验从零在 51,200 个构型上训练（1,600 个几何 × 32 个源，每个标签 $10^5$ 历史）。它在 50 个未见几何上相对 $10^9$ 历史参考评估，并在训练几何的 16 个留出源上相对 $4\times10^8$ 历史参考评估。两个种子与最终检查点下，PTNO 在未见几何上达到 log 相对 $L^2$ 0.0474，而最强测试的几何插值基线为 0.3160；在留出源上为 0.0570，而同几何非负最小二乘叠加为 0.2974。在所述含噪标签预算下，误差分别低 6.7 倍与 5.2 倍。叠加基线只组合少数含噪训练标签，而学习到的算子在整个语料上汇集信息。该优势与这一标签预算下的跨样本去噪一致；它并未在固定几何内确立非线性源响应。在已见几何上，叠加的线性 PSNR 更高（33.98 对 29.93 dB）。

> **表 29（原文 Table 29）：** 球形托卡马克代理相对含噪标签叠加提高了 log 空间精度。六个体积加权指标，在能群与场景上平均；PTNO 是两个最终检查点种子的均值。G 表示未见几何，S 表示训练几何上的留出源。该 51,200 场景语料与历史主表实验分开。

| 划分 | 方法 | Log 相对 $L^2$ | Log SSIM | Log PSNR | 相对 $L^2$ | SSIM | PSNR |
|---|---|---|---|---|---|---|---|
| G | PTNO | 0.0474 | 0.8550 | 29.57 | 0.2202 | 0.9740 | 30.68 |
| G | 插值 | 0.3160 | 0.4312 | 12.10 | 0.3908 | 0.9275 | 26.34 |
| S | PTNO | 0.0570 | 0.8429 | 28.32 | 0.2581 | 0.9680 | 29.93 |
| S | NNLS 叠加 | 0.2974 | 0.4752 | 13.20 | 0.3324 | 0.9616 | 33.98 |

源叠加增强在该语料上两 seed 散布内是中性的，已从球形托卡马克配方中移除。一个几何条件化的秩 64 Green 头（对源仍线性）相对其匹配的 L40S 对照，在未见几何上把 log 相对 $L^2$ 改进约 2%，在留出源上约 5%，但把线性相对 $L^2$ 从 0.21–0.25 提高到 0.62–0.68。它仍是实验性替代方案，不替换主配方。

> **表 30（原文 Table 30）：** 学习到的源线性 Green 算子以线性空间误差为代价提高 log 空间精度。最终检查点均值；DEMO 在 H200 上三个种子，球形托卡马克每个划分在 L40S 上两个种子。每个 Green 行只与其配对对照比较。DEMO 使用实测支持与下限 $10^{-17}$；球形托卡马克使用下限 $10^{-10}$。

| 任务 | 模型 | Log 相对 $L^2$ | Log SSIM | Log PSNR | 相对 $L^2$ | SSIM | PSNR |
|---|---|---|---|---|---|---|---|
| DEMO | PTNO | 0.0840 | 0.7920 | 19.78 | 0.1085 | 0.9834 | 33.83 |
| DEMO | Green | 0.0703 | 0.7958 | 21.32 | 0.2529 | 0.9900 | 28.27 |
| Sptok G | PTNO | 0.0473 | 0.8551 | 29.60 | 0.2100 | 0.9742 | 30.89 |
| Sptok G | Green | 0.0463 | 0.8600 | 29.94 | 0.6212 | 0.9642 | 25.27 |
| Sptok S | PTNO | 0.0570 | 0.8428 | 28.35 | 0.2454 | 0.9684 | 30.15 |
| Sptok S | Green | 0.0542 | 0.8491 | 29.14 | 0.6832 | 0.9563 | 24.87 |

#### O.2 非结构网格上的 EU-DEMO

一个四面体扩展在固定的 EU-DEMO 网格上预测单元平均中子通量，该网格有 42,729 个单元。OpenMC 直接在非结构 MOAB 网格上记录径迹长度通量；把单元积分计数除以单元体积得到训练目标。模型是 GINO，带体积积分编码器与解码器，围绕一个 24×8×32 潜 FNO（宽度 16，四层，模态 $(8,4,8)$）。其 13 个输入是一个经 $\mathrm{asinh}(q/10^{-7})$ 变换的源密度场、8 个源参数，以及固定长度单位下的三个单元坐标加单元体积。训练使用尺度 $10^{-8}$ 的 softplus 头与 $\eta=10^{-17}$ 的 PRelL2，批大小 2，学习率 $10^{-3}$，固定 20 epoch、$10^5$ 更新的余弦计划。每个报告的四面体模型都是其最终检查点；不在验证集或参考集上选择检查点。

两个训练标签语料各含 $10^4$ 个源构型：模拟输运每个源 $5\times10^4$ 历史，而权窗输运用 $2\times10^5$。参考含 128 个留出源，每个汇集 16 次 $3.6\times10^7$ 历史的独立运行（共 $5.76\times10^8$）。权窗训练的模型 log 空间精度显著更高（表 31），但历史数相差四倍意味着该比较并未在相同模拟预算下隔离方差缩减。全部六个指标都使用单元体积权重；SSIM 使用 100 cm 的物理邻域尺度与参考自身的数据范围。

> **表 31（原文 Table 31）：** 在记录的不等历史预算下，权窗标签改善四面体代理。种子 42/43 的逐种子值，在 128 个留出源上平均；最终检查点。Log 空间指标使用下限 $10^{-20}$。

| 指标 | 权窗标签 | 模拟标签 |
|---|---|---|
| $\log_{10}$ 相对 $L^2$ ↓ | 0.0400 / 0.0396 | 0.2976 / 0.2982 |
| $\log_{10}$ SSIM ↑ | 0.7750 / 0.7780 | 0.4408 / 0.4416 |
| $\log_{10}$ PSNR（dB）↑ | 26.93 / 27.01 | 9.24 / 9.22 |
| 线性相对 $L^2$ ↓ | 0.2620 / 0.2582 | 0.3075 / 0.2872 |
| 线性 SSIM ↑ | 0.9890 / 0.9892 | 0.9881 / 0.9889 |
| 线性 PSNR（dB）↑ | 30.26 / 30.41 | 28.90 / 29.57 |

在结构化 DEMO 的 $10^{-17}$ 下限上，同样的权窗检查点达到 log 空间 SSIM 0.8683/0.8711 与相对 $L^2$ 0.0230/0.0228。下限会实质改变表观精度，因此不同下限的结果不能当作使用同一评估协议来比较。

#### O.3 FNG 停堆剂量基准

一个独立实验检查检验我们停堆剂量标签生成器的中子输运、活化与延迟光子阶段。我们使用 Peterson 等 [52] 公开存档的几何、源、辐照历史与测量，复现第一次 FNG 停堆剂量实验。这是对蒙特卡洛标签管线的检查，不是对训练后神经算子的基于测量的评估。计算使用 OpenMC 基于单元的严格两步流程，65 个活化单元，TENDL-2019 中子数据，基于 TENDL-2019/ENDF/B-VIII.0 的活化链，以及 ENDF/B-VIII.0 光子数据。每次中子计算与每个冷却时间的光子计算都使用 $2\times10^7$ 历史。

> **表 32（原文 Table 32）：** 标签管线在五个参考冷却时间上把测得的 FNG 剂量率复现到 20% 以内。C/E 是按测量剂量率计算的。所示不确定度是以被采样中子反应率为条件的光子蒙特卡洛标准误；它们不含中子采样与测量不确定度。

| 冷却时间（天） | 测得剂量率（µSv/h） | C/E |
|---|---|---|
| 1 | 2.46 | 0.850±0.021 |
| 7 | 0.699 | 1.061±0.026 |
| 15 | 0.495 | 1.185±0.029 |
| 30 | 0.416 | 1.180±0.029 |
| 60 | 0.316 | 1.200±0.031 |

六个镍箔 $^{58}\mathrm{Ni}(n,p)$ 反应率比在 0.97 到 1.12 之间；$(n,2n)$ 比值更低，0.76–0.93。一个预注册的要求——在 5% 内复现存档计算——在 7–30 天失败，差异为 14–16%。把存档核素清单通过我们的光子阶段重放，其剂量率复现到 2.3% 以内；剩余差异定位到存档清单中数值舍入引入的短寿命活化产物，我们的可达子空间衰变求解将其排除。我们报告这一偏差，而不是把原始复现阈值算作满足。该基准使用基于单元的活化与更早的核数据登记表，而当前生产语料使用基于网格的活化与更新的钢材成分。因此它不能确立生产网格离散或神经算子在 FNG 几何上的精度。

### P. 带折射与反射界面的辐射输运

一个第五数据集在附录 E.2 的 3D 注量任务上加入玻璃、镜面与哑光物体。碰到玻璃物体的光被弯折进入其几何阴影并部分反射，镜面把光场折回自身，哑光物体投射软阴影，因此目标场不再是仅介质的平滑函数（图 15）。即使标签用每体素 64 个蒙特卡洛样本（SPP）追踪，PTNO 配方仍能学习该任务。我们用模型预测的 3D 注量体 $\log_{10}$ 与高 SPP 蒙特卡洛参考的 $\log_{10}$ 之间的 SSIM 来评分，在体本身上计算而不是渲染图像。在一个 224 场景的留出测试集上（在所有设计选择固定后只评分一次），最终模型达到 $\log_{10}$ SSIM 0.961。作为尺度参照，来自同一生成器的另一个 224 场景集的两个独立蒙特卡洛解相对彼此得 0.997；这给出参考噪声的经验尺度，而不是模型精度的严格上界。

> **图 15（原文 Fig. 15）：** 界面数据集在 3D 注量场景中加入介电、镜面与哑光物体。(a–d) 由采样场景参数渲染的四个评估场景：$\pm H$ 域为线框，参与介质的对比盒为雾，点发射器为亮球，介电物体为带采样折射率 $n$ 的玻璃，理想镜面为抛光金属，朗伯物体为哑光黏土、其取值携带反照率 $c_m$。场景 (a) 无界面，在 224 场景分层比较集中得分最佳；(c) 在发射器与远角之间叠放一个介电盒与一个介电球，得分最差；(d) 同时携带全部三种材料。介电体把发射器光线弯折进其几何阴影并按 Fresnel 定律反射一部分，镜面把场折回自身，漫反射面投射软阴影，因此目标场不再是仅介质的平滑函数。(e) 界面采样范围：物体数量与材料为类别变量，尺寸、位置、$n$ 与 $c_m$ 在所示条上相对其自然全尺度均匀，物体内部为吸收真空，介质与发射器遵循 3D 注量设计。渲染：Blender Cycles；介质雾为可读性做了压缩，不是辐射度图像。

#### P.1 场景、标签与参考

每个场景是一个 3D 注量场景（背景 $\sigma_t$ 与 $c$，2–5 个对比实体，1–3 个点发射器，一个 Henyey–Greenstein $g$），再加零到三个实体物体：球或轴对齐盒，由折射率 $n\in[1.1,2.5]$ 的介电体、理想镜面、或反照率 $c_m\in[0.2,0.9]$ 的朗伯（哑光）表面构成（表 33）。物体对介质不透明：参与介质只存在于其外部，其内部是弱吸收体（吸收系数 $\sigma_a=0.05$，无散射），因为无损耗玻璃盒会把大部分内部方向困住，其内部注量没有收敛值。在界面处，光子以偏振 Fresnel 概率被反射或透射，并按 Snell 定律折射（包括全内反射）；镜面以单位概率反射，哑光表面吸收 $1-c_m$ 的比例并把其余按余弦加权方向重新发射。

标签来自附录 E.2 的蒙特卡洛碰撞估计量，并扩展了解析的射线—球与射线—盒相交；目标是 $64^3$ 网格上逐体素径迹长度注量（光子在体素内的路径长度之和，是注量的无偏估计），除以体素体积与总发射功率。该估计量在同一解析场景上与 Geant4 [53, 54] 光学光子交叉检查：两个代码既不共享估计量也不共享界面代码，其差异在 $2.5\times10^5$–$2\times10^6$ 个 Geant4 光子上按 $N^{-0.45}$ 下降且无平台，逐个隔离的七个物理成分一致到 0.04–0.21%。训练使用 $10^6$ 场景训练集的前 $10^5$ 个场景，每个在 64 SPP 下追踪一次，即 $64^3$ 网格每体素 64 条光子路径。使用四个留出集，都来自同一场景生成器且与训练及彼此不相交：一个 50 场景集追踪到 786,432 SPP 用于训练期间监控；一个 224 场景分层比较集（7 种界面组成 × 32 场景：无物体、一个哑光、一个镜面、一个 $n<1.5$ 的介电体、一个 $n\ge2.0$ 的介电体、两个介电体、三个介电体）追踪到 32,768 SPP，我们据此对变体排序；以及两个相同组成与 SPP 但随机种子新鲜的 224 场景集——一个选择集对每个候选评分一次且仅用于在最终候选中选择，一个测试集在该选择之后对每个模型评分一次。标签上限是分层比较集的一个独立蒙特卡洛解对另一个用相同指标评分：$\log_{10}$ SSIM 0.9968 与 $\log_{10}$ 相对 $L^2$ 0.0113。最终模型比该经验上限低约 0.03；该差距大于参考噪声尺度，尽管它不能证明模型之间的每个微小差异。

> **表 33（原文 Table 33）：** 每个界面场景至多加三个介电、镜面或哑光球/盒。介质、发射器与 $g$ 遵循表 23 的 3D 注量设计；$H=1$ 是立方体的半宽。实现值在 $10^5$ 个训练场景上统计；形状与中心行给出提议分布。$n$ 覆盖水（1.33）到金刚石（2.42）。

| 量 | 分布 | 范围 | 说明 |
|---|---|---|---|
| 物体数 | 类别 | $P(0,1,2,3)=(0.15,0.35,0.30,0.20)$ | 实现 $(0.152,0.351,0.298,0.199)$ |
| 形状 | 均匀 | 球 0.5 / 盒 0.5 | 盒面轴对齐 |
| 球半径 | 均匀 | $[0.12,0.50]H$ | |
| 盒半长（每轴） | 均匀 | $[0.10,0.50]H$ | |
| 中心（每轴） | 均匀 | $[-0.6,0.6]H$ | 必须位于 $\pm0.95H$ 内 |
| 材料 | 类别 | 介电 0.50 / 镜面 0.25 / 哑光 0.25 | 154,412 个物体中实现 0.499/0.250/0.251 |
| 折射率 $n$ | 均匀 | $[1.1,2.5]$ | 仅介电体；每个 0.1 宽分箱含 6.9–7.3% 抽样 |
| 哑光反照率 $c_m$ | 均匀 | $[0.2,0.9]$ | 仅哑光（镜面反射率为 1）；每个 0.05 宽分箱含 6.9–7.4% 抽样 |
| 内部 | 固定 | $\sigma_t=\sigma_a=0.05$，$c=0$ | 物体内无介质 |
| 间隔约束 | 约束 | $\ge0.05H$ | 物体—物体与物体—发射器 |

#### P.2 输入、模型与协议

算子看到 23 个输入通道，全部在目标分辨率下由场景参数计算。前 21 个通道包括一个发射网格、九个 0–2 阶源球谐场、消光与反照率、四个表面场（折射率、镜面掩码、哑光反照率、符号距离）、$g$ 的四个多项式嵌入，以及一个 asinh 编码的遮蔽直射通量场。剩余两个告诉算子在发生任何散射之前界面把光送往何处：$D_0$，把每个界面视为不透明的直射通量；$R_{K6}$，由至多六次反射或折射额外送入的能量；二者都由廉价的确定性光线追踪器计算，编码在固定 $\log_{10}$ 尺度上，并直接送入读出层。记 $d=\log_{10}\max(D_0,10^{-8})$，最后两个通道为 $(d+4)/4$ 与 $[\log_{10}\max(D_0+R_{K6},10^{-8})-d]/4$，无拟合归一化。这些通道是由场景计算得到的输入，不是标签：它们不含体积散射或漫反射表面反弹。主干是 3D FNO（模态 $32^3$，8 层，最终模型宽度 64），带 softplus 头，并在 detached 预测上使用 $\eta=2\times10^{-6}$ 的 PRelL2。

每个变体遵循一个协议：前 $10^5$ 个场景各看一遍，25,000 次 AdamW 更新，批大小 4，余弦衰减从 $3\times10^{-3}$ 到 $10^{-7}$，权重衰减 $10^{-3}$，梯度裁剪 1，种子 42 与 43，以及训练结束时的检查点，无基于验证的选择。更长的运行把同样的 $10^5$ 个场景重复两遍或四遍，计划相应拉长，因此它们只与彼此比较。指标遵循附录 F，$\log_{10}$ 指标下限 $\epsilon=3.28\times10^{-7}$。该数据集不报告线性相对 $L^2$：对点源，包含发射器的体素中的单元平均随体素宽度 $h$ 按 $h^{-2}$ 缩放且没有连续极限，而该单个体素携带每个模型平方误差的 98–100%。因此我们在 $\log_{10}$ 空间排序，并使用峰值比（每个场景中预测最大值与参考最大值之比）来检查源核是否被再现。

#### P.3 结果

PTNO 从 64-SPP 标签学习该任务，在 $\log_{10}$ SSIM 上距标签上限 0.035 以内（表 34）。最终模型（宽度 64，8 层，$10^5$ 更新）在分层比较集上对种子 42/43 得 $\log_{10}$ SSIM 0.9647/0.9652。我们在选择集上选择其种子 43 检查点；在该选择后只评分一次的测试集上，它达到 $\log_{10}$ SSIM 0.9611（场景中位数 0.9762，第 5 百分位 0.8760），$\log_{10}$ 相对 $L^2$ 0.0720，$\log_{10}$ PSNR 38.1 dB。在分层比较集的七种界面组成上，$\log_{10}$ SSIM 从 0.954/0.955（两个介电体）到 0.974/0.974（无物体），每种组成中最差的单场景都高于 0.82。源核被再现：峰值比的场景中位数为 1.00/1.04。剩余误差位于玻璃物体后方的暗区域，模型在那里以中位数高估 0.05–0.07 个数量级。

在其他四个数据集上一样，在物理空间中训练在这里很重要。在其他一切固定时（相同输入、语料、计划与种子，在 25,000 更新预算下），把 PTNO 的 softplus 头与 PRelL2 换成用 MSE 训练的 $\log_{10}$ 输出，把 $\log_{10}$ SSIM 从 0.9503/0.9490 降到 0.9391/0.9364。表 35 在最终模型的 $10^5$ 更新预算下重复该比较，同样只改变输出头与损失。$\log_{10}$ 输出 MSE 模型在分层比较集上比 PTNO 低 0.018/0.019（$\log_{10}$ SSIM），在测试集上低 0.017/0.018，而用线性 $L^2$ 训练的恒等头坍缩到近零场。在线性源核上，$\log_{10}$ 输出模型比 PTNO 更接近参考：其平均峰值比为 0.985/1.016 对 1.799/1.627，其核心误差更低。这些均值保留每个场景，而 PTNO 种子 42 的核心误差 1.155 由一个三介电体场景承载（场景中位数 0.068）；两个种子无法确定 PTNO 是否系统性高估峰值。在这个预算下两个组件都不能单独工作。PRelL2 配恒等头时模型像线性 $L^2$ 模型一样坍缩到近零场；softplus 头配逐样本相对 $L^2$ 损失时，它在每个场景都输出该头下界的常数。

> **表 34（原文 Table 34）：** PTNO 在界面数据集上达到距标签上限 0.035 以内。$\log_{10}$ 指标，在分层比较集的 224 个场景上平均，种子 42/43 与训练结束检查点。选择集列对每个模型在另一个独立的 224 场景留出集上评分一次（25,000 更新行在更早的、同分布生成的选型集上）。峰值比是预测最大值与参考最大值之比的场景中位数。标签上限把一个独立蒙特卡洛解相对另一个评分。最后两行共享一个输入构造、语料与计划（25,000 更新），只在输出头与损失上不同。

| 模型 | $\log_{10}$ SSIM ↑ | $\log_{10}$ 相对 $L^2$ ↓ | 选择集 $\log_{10}$ SSIM ↑ | 峰值比 |
|---|---|---|---|---|
| PTNO，最终（$10^5$ 更新，宽度 64） | **0.9647 / 0.9652** | **0.0699 / 0.0682** | 0.9613 / 0.9624 | 1.00 / 1.04 |
| 标签上限（第二个 MC 解） | 0.9968 | 0.0113 | — | 1.00 |
| PTNO（softplus + PRelL2），25,000 更新 | 0.9503 / 0.9490 | 0.0928 / 0.0942 | 0.9479 / 0.9471 | 1.47 / 1.36 |
| NO，$\log_{10}$ 输出 + MSE，25,000 更新 | 0.9391 / 0.9364 | — | — | — |

> **表 35（原文 Table 35）：** 在等预算下，softplus 头配 PRelL2 在界面数据集上优于朴素损失。每行使用最终模型的构造、语料、计划与 $10^5$ 更新，只改变输出头与损失；种子 42/43，训练结束检查点，224 个场景上的均值。PTNO 行用其他行所用评估器重新评分表 34 的最终模型（差异低于 $10^{-4}$）。核心相对 $L^2$ 是去掉每个发射器体素及其 26 个邻居后的线性相对 $L^2$；峰值比是预测最大值与参考最大值之比的场景均值。

| 输出头 + 损失 | 分层比较集 $\log_{10}$ SSIM ↑ | 比较集 $\log_{10}$ 相对 $L^2$ ↓ | 测试集 $\log_{10}$ SSIM ↑ | 测试集 $\log_{10}$ 相对 $L^2$ ↓ | 线性，比较集：核心相对 $L^2$ ↓ | 峰值比 |
|---|---|---|---|---|---|---|
| PTNO（softplus + PRelL2） | **0.9647 / 0.9652** | **0.0699 / 0.0682** | **0.9598 / 0.9611** | **0.0735 / 0.0720** | 1.155 / 0.086 | 1.799 / 1.627 |
| NO，$\log_{10}$ 输出 + MSE | 0.9467 / 0.9462 | 0.1289 / 0.1289 | 0.9430 / 0.9430 | 0.1286 / 0.1287 | **0.078 / 0.084** | **0.985 / 1.016** |
| NO，恒等头 + 线性 $L^2$ | 0.2251 / 0.2354 | 0.8929 / 0.8957 | 0.2101 / 0.2198 | 0.9458 / 0.9502 | 0.964 / 0.962 | 0.001 / 0.001 |
| 恒等头 + PRelL2 | 0.2919 / 0.2726 | 0.7056 / 0.7952 | 0.2653 / 0.2454 | 0.7203 / 0.8271 | 0.950 / 0.950 | 0.001 / 0.001 |
| Softplus + 逐样本相对 $L^2$ | 0.1620 / 0.1620 | 3.6552 / 3.6552 | 0.1658 / 0.1658 | 3.7943 / 3.7943 | 1.000 / 1.000 | 0.000 / 0.000 |

#### P.4 局限

本节所有数字都是一个从零配方的两个种子与训练结束检查点，而不是表 2 的五个种子。表 34 的损失比较在 25,000 更新预算下运行；表 35 在 $10^5$ 更新下重复它。训练语料固定为 $10^5$ 个场景，因为两个界面输入通道为每个训练场景预计算并存储，因此这里报告的暗区域偏差是当前状态，而不是下限。不报告线性相对 $L^2$ 与跨分辨率评估，因为包含点发射器的体素中的单元平均随 $h^{-2}$ 缩放且没有连续极限。该估计量与 Geant4 共享同一全内反射简化，因此它们的一致并不检验该近似。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.40090v2 全文（原文 41 页）的中文译稿：摘要、关键词、第 1–6 节正文与编号小节、式 (1)–(26)、图 1–15 的全部中文图注、表 1–35 的逐格转写、致谢、参考文献 54 条英文原条目（按原编号），以及附录 A–P（含各附录内的图表）。表 1–35 与公式已用 pymupdf 表格抽取及 PDF 渲染页逐格/逐式核对；源抽取文本中的连写数字、上下标与部分人名（如 VANTG、Vorba、Křivánek）存在乱序或不可靠之处，均以 PDF 原文为准。原文图 1–15 为示意图/渲染图，本页不上传图片、不对图内曲线作数字化估算。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
