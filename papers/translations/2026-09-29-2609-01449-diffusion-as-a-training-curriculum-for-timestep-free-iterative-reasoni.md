---
layout: page
title: "扩散模型作为无时间步迭代推理的训练课程｜中文全篇译稿（Google 版权，许可待核验）"
permalink: /papers/translations/2026-09-29-2609-01449-diffusion-as-a-training-curriculum-for-timestep-free-iterative-reasoni/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2f675ea365589cfc/) · [原文 arXiv](https://arxiv.org/abs/2609.01449) · [全部目录](/papers/catalog/)

# 扩散模型作为无时间步迭代推理的训练课程

**原题：** Diffusion as a Training Curriculum for Timestep-Free Iterative Reasoning  
**作者：** Mariia Drozdova\*、Aidan Sirbu\*、Pietro Miotti、Robert Obryk、Mayalen Etcheverry、Eyvind Niklasson⁺、Blake Richards⁺。单位：Google「Paradigms of Intelligence」团队；日内瓦大学；麦吉尔大学计算机科学学院；Mila – 魁北克人工智能研究所；麦吉尔大学神经病学与神经外科系；麦吉尔大学蒙特利尔神经学研究所；CIFAR「Learning in Machines and Brains」项目。\\* 表示同等贡献，⁺ 表示共同资深作者。通讯作者邮箱：mariia.drozdova@unige.ch、aidan.sirbu@mail.mcgill.ca。  
**版本：** arXiv:2609.01449v1（cs.LG），v1 日期 2026 年 9 月 1 日（PDF 标注 2026-09-02），原文 15 页。© 2026 Google，保留所有权利；本页仅为学术阅读用中文译稿，**版权与再传播许可需另行核验**。  
**范围与状态：** 全文中文译稿：摘要、第 1—4 节、图 1—7 图注、表 1—5、附录 A—K（含算法 A1、A2）、参考文献（英文原条目，按原文的字母序、未编号）。逐句逐式终校未做，不标记为已验收全文。

> **译注：** 原文参考文献采用作者—年份（author–year）体例且不编号，本页按原字母序保留英文条目，不擅自编号；原文要点小结中提到的「Supp. Tab./Supp. Fig.」即本页附录中的表 1—5 与图 3—7（见附录对应位置）。原文中 "one-hot"、"teacher forcing"、"BPTT"（backpropagation through time，时间反向传播）等术语首次出现时保留英文。

## 摘要

扩散模型与递归推理器都是迭代式的，但它们跨迭代传递信息的方式不同。我们给扩散去噪器增加一个持久的隐状态，并移除其时间步条件化，从而留下一个可运行到任意深度的共享更新。所得模型是一个随时可停（anytime）的求解器：其精度随推理深度持续提升，远超训练时所用的展开长度与反向传播窗口，在 Sudoku-Extreme 上达到 99.90% 的精确求解率；在 Maze-Unique 上取得 98.93% 的求解率。令人意外的是，推理时并不需要渐进式去噪：把破坏程度保持在最大——每一步用新的高斯噪声替换所有非线索变量——仍能保持近乎完美的求解能力，并收敛到稳定解。这种简单的噪声注入机制使单条轨迹就能高效探索解空间并稳定到正确答案，无需并行展开、候选选择或外部验证器（此前的推理模型需要这些）。然而，有序的退火破坏在训练阶段仍然至关重要，这表明扩散对我们这个随时可停求解器的主要贡献不在于推理时的采样过程，而在于一种去噪训练课程。

**关键词：** 迭代方法；扩散；推理。

## 1 引言

扩散模型（Ho et al., 2020; Lipman et al., 2024）与递归推理器都是迭代式神经网络模型，但它们跨迭代传递信息的方式不同。在扩散中，信息通过不断演化的采样状态 $x_t$ 在步骤之间传递，如 DDPM 与 DDIM（Song et al., 2020），或通过反向 SDE 与概率流 ODE 进行积分（Lipman et al., 2024, 2022; Song et al., 2021）；因此迭代计算必须通过定义生成轨迹的同一状态来表达。相反，递归推理模型维护一个隐状态，从而提供一条可用于累积计算的独立通道（Wang et al., 2025; Jolicoeur-Martineau, 2025; Saunshi et al., 2025; Huang et al., 2026; Graves, 2016; Banino et al., 2021; Geiping et al., 2025）。此外，在离散扩散中，最近有工作跨越去噪步携带一个确定性潜变量，以绕开类别采样的信息损失（Jo et al., 2026）；离散扩散也已被直接应用于 Sudoku 与规划基准（Ye et al., 2025）。本文要问：当扩散状态是连续的时，这种持久隐状态会变成什么？扩散训练本身能否把它变成一个迭代推理器？

为探究该问题，我们用递归神经网络作为扩散去噪器：在 Sudoku-Extreme 上实例化为循环 Transformer（looped Transformer）（Saunshi et al., 2025; Wang et al., 2025; Jolicoeur-Martineau, 2025），在 Maze-Unique/Maze-Hard 上实例化为循环的局部卷积块（Jolicoeur-Martineau, 2025; Huang et al., 2026）。这些基准中输入确定唯一目标：一个 Sudoku 完成，或一条从起点到终点的路径（任务可视化见附录 K）。在每个采样步，网络产生一个潜张量，我们从中取得两个分别归一化的视图：一个作为持久隐状态传递到下一步，另一个投影到数据空间以产生去噪预测。每一步都复用同一更新；网络既不知道扩散时间步，也不知道迭代序号；隐状态从不被直接监督——它只通过其对未来去噪预测的影响而学习。我们表明，所得模型表现为迭代求解器，而不是传统的去噪链。额外的递归步会继续求解此前未解出的实例，因此推理深度成为一个免费的计算维度：仅通过 4 步截断片段的反向传播，就足以在 Sudoku-Extreme 上以 $K=10{,}000$ 个去噪步达到 99.90% 的求解率，并在 $K=100$ 时于 Maze-Unique 上达到 98.93%。没有该隐状态的模型收敛慢得多且上限更低。更令人意外的是，推理不需要渐进式去噪：在最大破坏程度下，即每一步后所有非线索变量都被替换为新的高斯噪声，动力学仍继续求解且解码输出稳定下来，因此单条随机展开既能探索又能确定答案，而不需要确定性递归推理器通常所需的并行尝试与候选选择（Baek et al., 2026; Sghaier et al., 2026）。我们还表明，训练阶段有序的退火破坏对系统性能很重要，这表明扩散框架提供的去噪课程是模型中的关键要素。

**图 1：** 用于 Sudoku-Extreme 的去噪器结构示意。图中还画出了针对示例蓝色目标格的 Transformer 注意力掩码。Maze-Unique/Maze-Hard 的结构修改在附录 B 中详述。

## 2 无时间步的递归扩散

**问题与破坏路径。** 令 $y$ 表示干净的目标表示，$x$ 表示棋盘状态，$m\in\{0,1\}^N$ 表示线索掩码（若格子 $i$ 是固定线索则 $m_i=1$，否则 $m_i=0$），$e$ 表示线索的干净嵌入，$t_k$ 表示第 $k$ 个去噪步的噪声调度参数。我们使用方差保持（variance-preserving）破坏路径（Ho et al., 2020; Lu and Song, 2025）对棋盘状态加噪：

$$
x_k=a(t_k)y+b(t_k)\varepsilon,
\qquad
a(t_k)=\sin\left(\frac{\pi t_k}{2}\right),\quad
b(t_k)=\cos\left(\frac{\pi t_k}{2}\right),\tag{1}
$$

其中 $t_k=0$ 对应最大破坏程度，$t_k=1$ 对应干净数据（$t_k$ 的计算见附录 B）。在扩散破坏过程中，只有非线索变量是随机的，因此我们定义掩码函数，把给定线索钉住、使其不被加噪与更新：

$$
\mathrm{Pin}(x,e,m)=(1-m)\odot x+m\odot e.\tag{2}
$$

**循环模型与持久隐状态。** 在第 $k$ 个去噪步，被钉住的扩散状态通过线性投影 $E_x$ 嵌入，并与上一时刻的隐状态相加；我们还加入可学习的位置嵌入 $p$ 与一个由线索掩码门控的、可学习的「给定格标志」 $g$。随后用带注意力掩码 $\mathrm M$ 的共享 pre-norm Transformer 块 $B_\theta$ 循环 $J=8$ 次（如循环 Transformer 所做，（Saunshi et al., 2025; Giannou et al., 2023）），得到预测去噪目标的潜表示 $z_k$：

$$
u^{(0)}_k=E_x\left(\mathrm{Pin}(x_k,e,m)\right)+p+m\odot g+h_k,
$$

$$
u^{(j)}_k=B_\theta\left(u^{(j-1)}_k;\mathrm M\right),\quad j=1,\dots,J,
\qquad
z_k\equiv u^{(J)}_k.\tag{3}
$$

该潜表示随后经一个 LayerNorm 产生下一步的隐记忆状态 $h_{k+1}$，并经一个 LayerNorm 加线性变换 $E_o$ 产生去噪后的可观测状态预测 $\hat y_k$：

$$
h_{k+1}=\mathrm{LN}_h(z_k),\qquad
\hat y_k=E_o\left(\mathrm{LN}_o(z_k)\right).\tag{4}
$$

递归构造在所有任务间共享，而通信模式是任务特定的。对 Sudoku，$\mathrm M$ 把注意力限制在同一行、同一列或同一 $3\times3$ 局部宫内的格子。对 Maze-Unique，循环块改为在迷宫网格上通过局部卷积窗口通信（细节见附录 B）。两个 LayerNorm 模块 $\mathrm{LN}_h$ 与 $\mathrm{LN}_o$ 分别独立作用于每个格子的隐特征，各自具有独立学习的仿射参数。两个输出分支是同一潜计算经不同方式处理得到的视图。图 1 给出该模型在 Sudoku 上的基本结构。

**训练。** 训练使用一批交错（staggered）、持久的展开轨迹，每条轨迹维护自己的谜题、破坏阶段、回合长度与隐状态。在一个回合开始时，我们采样该轨迹将使用的去噪步数 $K\sim\mathrm{Unif}[20,160]$。每个训练回合沿一条从最大破坏到干净数据的轨迹进行，但同一批中不同轨迹的长度各不相同。优化采用跨 $L=4$ 个去噪步的截断反向传播。每一步的扩散输入都从干净目标独立重新破坏，而隐状态被递归传递：

$$
x_k=\mathrm{Pin}\left(a(t_k)y+b(t_k)\varepsilon_k,e,m\right),
$$

$$
(\hat y_k,h_{k+1})=F_\phi(x_k,h_k,e,m),\quad k=0,\dots,L-1,\tag{5}
$$

其中 $F_\phi$ 是图 1 所示的整个去噪器链。损失是在全部 $L$ 个展开预测上平均的、带掩码的均方误差，其中 $d$ 是可观测状态的特征维数：

$$
\mathcal L=\frac1L\sum_{k=0}^{L-1}\frac{\sum_{i=1}^{N}(1-m_i)\left\|\hat y_{k,i}-y_i\right\|_2^2}{d\sum_{i=1}^{N}(1-m_i)}.\tag{6}
$$

其中 $m_i$ 是格子 $i$ 的线索掩码值。注意 $h_k$ 没有被施加直接损失。由于每个 $x_k$ 都是目标的新一次破坏，持久隐状态是从早先去噪步向后续预测传递信息的唯一未破坏通路。每个截断片段结束后，被携带的隐状态从计算图中分离（detach）但仍保留在池中；只有当对应回合结束时它才被重置。

**推理。** 推理时，我们初始化 $h_0=0$，并把非线索变量初始化为纯高斯噪声。在每个连续步，我们应用式（3），并用去噪预测 $\hat y_k$ 构造下一个扩散状态：

$$
x_{k+1}=\mathrm{Pin}\left(a(t_{k+1})\hat y_k+b(t_{k+1})\varepsilon_{k+1},e,m\right).\tag{7}
$$

我们也通过固定 $t$、提供恒定噪声水平（而非使用退火噪声调度）来进行推理。此时，当解码输出在固定的耐心窗口内保持不变时，推理终止。

## 3 一个潜迭代求解器

**图 2：** 涌现的迭代计算。(左) 在 Sudoku-Extreme 上训练与测试带有/不带有记忆、带有/不带有时间条件化的推理模型；网络在长度从 $K=[20,160]$ 随机采样的轨迹上训练；评估时使用退火噪声；同一个无时间步更新随着 $K$ 增大能成功求解越来越多的 Sudoku-Extreme 实例。(右) 用退火噪声调度，或在式（7）中固定 $t$、改变恒定测试时噪声水平，评估「记忆 + 无时间步」模型；对恒定最大噪声（$t=0.00$）取得 99.90% 的最佳性能。

**无需时钟的深度缩放。** 我们发现额外的推理步直接转化为更好的求解效果（图 2 左）。精确求解率在 $K=10{,}000$ 步上单调上升。该提升并不需要显式的时间概念——我们发现引入时间条件化并不会显著改变性能。无记忆模型（即没有隐状态的模型）收敛更慢，且严格劣于我们带记忆的模型。然而，标准退火采样器仍要求预定义的推理视界，因为破坏程度与该调度中的位置绑定。因此我们接下来问：这种残余的调度在推理时究竟是否必要？

**求解并不需要渐进式去噪。** 当我们在整个推理过程中固定破坏程度、从而移除渐进式去噪时（图 2 右），我们发现 Sudoku-Extreme 上的性能在最大破坏时最高，求解率为 99.90%；同时对同一模型使用退火噪声推理时，性能下降为 99.56%。随着随机性减小，性能单调下降，当我们完全不注入噪声、直接在去噪步之间传递干净预测（$t=1.00$）时降到 49.39%。此外，我们发现：在具有唯一解的 Sudoku 棋盘上训练的模型，在持续随机强迫下于 99.24% 的轨迹中收敛并停留在该解上（附录表 5）。近期的递归方法，如 PTRM（Sghaier et al., 2026）与 GRAM（Baek et al., 2026），会运行多条带噪声的并行轨迹来探索解空间，并用额外的选择头选出最优者。相反，我们把逃逸机制放进单条展开之中：噪声进入可观测通道（$x_k$），而记忆（$h_k$）不被破坏。于是，同一条既探索又稳定的轨迹——不需要宽度维度或验证器。该机制在局部卷积通信核下同样迁移到 Maze-Unique（附录图 5）。

**隐状态携带什么？** 由于 $h_k$ 是唯一步骤间干净传递的状态，我们问它保留了哪些信息。我们通过对隐状态施加各种干预直接探测这一点（附录表 3）。在退火推理噪声情形下，保留记忆但把可观测状态重置为纯高斯噪声，使干预后的性能从 82.50% 提升到 88.09%。该干预等价于提供纯的低等级噪声。由于我们的系统从推理时更强的随机性中获益，这一扰动自然带来性能提升。此外，把记忆重置为零而保留可观测状态，会使求解率降至 58.03%；在格子位置上打乱隐状态会使性能降至 29.38%，全局打乱其数值则降至 0.27%。在恒定最大噪声推理情形下观察到相同趋势，但由于测试时随机性增强带来的收益，整体性能更高（附录表 3）。这些结果表明，$h_k$ 携带了关于空间结构化任务进展的、实例特定的信息。此外，把记忆宽度从 64 个通道增大到 256 个通道，在每个测试的循环预算下也都能提升性能（附录表 4）。

**扩散训练贡献了什么？** 我们发现渐进式去噪在训练期间至关重要，因为它为模型提供了学习如何逐步逆转破坏的课程。使用固定的非退火噪声训练，或完全去除噪声，会显著降低性能，分别降至 82.73% 与 0.00%（附录表 2）。此外，扩散训练为每个去噪步提供局部监督信号，使我们能够用跨 $L=4$ 个去噪步的截断反向传播优化系统（消融见附录图 3）。调度在训练阶段起作用：需要一条连贯、单调递减的破坏轨迹来诱导这些动力学。

## 4 讨论与结论

总之，给无时间步扩散去噪器增加持久隐状态，会把它变成随时可停的迭代求解器。尽管隐状态不接受直接监督，它学会了跨采样步携带结构化的、实例特定的计算。即使每次迭代都用新的最大噪声替换所有非线索变量，求解仍能成功；且一旦找到解，解码输出在持续随机强迫下保持稳定。然而我们发现，性能强烈依赖于有序退火破坏的训练课程，尽管推理时既不需要时间步条件化也不需要退火。在该系统中，扩散提供随机训练课程，而递归承担用于推理的迭代计算。

## 参考文献（英文原书目，按原文各作者—年份体例）

- J. Baek, M. Jo, M. Kim, M. Ren, Y. Bengio, and S. Ahn. Generative Recursive Reasoning, May 2026. URL http://arxiv.org/abs/2605.19376. arXiv:2605.19376 [cs.AI] version: 1.
- A. Banino, J. Balaguer, and C. Blundell. Pondernet: Learning to ponder. arXiv preprint arXiv:2107.05407, 2021.
- J. Geiping, S. McLeish, N. Jain, J. Kirchenbauer, S. Singh, B. R. Bartoldson, B. Kailkhura, A. Bhatele, and T. Goldstein. Scaling up test-time compute with latent reasoning: A recurrent depth approach. arXiv preprint arXiv:2502.05171, 2025.
- A. Giannou, S. Rajput, J.-y. Sohn, K. Lee, J. D. Lee, and D. Papailiopoulos. Looped transformers as programmable computers. In International Conference on Machine Learning, pages 11398–11442. PMLR, 2023.
- A. Graves. Adaptive computation time for recurrent neural networks. arXiv preprint arXiv:1603.08983, 2016.
- J. Ho, A. Jain, and P. Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.
- B. Huang, Z. Geng, and Z. Kolter. Equilibrium reasoners: Learning attractors enables scalable reasoning. arXiv preprint arXiv:2605.21488, 2026.
- M. Jo, J. Yoon, J. Deschenaux, C. Gulcehre, and S. Ahn. Loopholing discrete diffusion: Deterministic bypass of the sampling wall. In International Conference on Learning Representations, volume 2026, pages 93890–93918, 2026.
- A. Jolicoeur-Martineau. Less is more: Recursive reasoning with tiny networks, 2025. URL https://arxiv. org/abs/2510.04871, 2025.
- Y. Lipman, M. Havasi, P. Holderrieth, N. Shaul, M. Le, B. Karrer, R. T. Chen, D. Lopez-Paz, H. Ben-Hamu, and I. Gat. Flow matching guide and code. arXiv preprint arXiv:2412.06264, 2024.
- Y. Lipman, R. T. Chen, H. Ben-Hamu, M. Nickel, and M. Le. Flow matching for generative modeling. arXiv preprint arXiv:2210.02747, 2022.
- C. Lu and Y. Song. Simplifying, stabilizing and scaling continuous-time consistency models. In International Conference on Learning Representations, volume 2025, pages 50611–50649, 2025.
- T. Dillon. Tdoku: A fast sudoku solver and benchmark suite. https://github.com/t-dillon/tdoku, 2020. GitHub repository.
- N. Saunshi, N. Dikkala, Z. Li, S. Kumar, and S. J. Reddi. Reasoning with latent thoughts: On the power of looped transformers. In International Conference on Learning Representations, volume 2025, pages 14855–14881, 2025.
- A. Sghaier, A. Parviz, and A. Jolicoeur-Martineau. Probabilistic Tiny Recursive Model, May 2026. URL http://arxiv.org/abs/2605.19943. arXiv:2605.19943 [cs.AI].
- J. Song, C. Meng, and S. Ermon. Denoising diffusion implicit models. arXiv preprint arXiv:2010.02502, 2020.
- Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021. URL https://openreview.net/forum?id=PxTIG12RRHS.
- G. Wang, J. Li, Y. Sun, X. Chen, C. Liu, Y. Wu, M. Lu, S. Song, and Y. Abbasi Yadkori. Hierarchical reasoning model. arXiv preprint arXiv:2506.21734, 2025.
- J. Ye, J. Gao, S. Gong, L. Zheng, X. Jiang, Z. Li, and L. Kong. Beyond autoregression: Discrete diffusion for complex reasoning and planning. In International Conference on Learning Representations, 2025.

> **译注（书目顺序）：** 原文参考文献为字母序、不编号。上面按原顺序列出，其中「T. Dillon」条目在原 PDF 中排在 Lu and Song 之后、Saunshi 之前（属原文排序如此，本页保持原顺序未改动）。

## 图注与表注

**图 1（原文第 2 页）：** 用于 Sudoku-Extreme 的去噪器结构示意；图中还画出针对示例蓝色目标格的 Transformer 注意力掩码。Maze-Unique/Maze-Hard 的结构修改见附录 B。

**图 2（原文第 4 页）：** 涌现的迭代计算。(左) 在 Sudoku-Extreme 上训练与测试带有/不带有记忆、带有/不带有时间条件化的推理模型；网络在长度从 $K=[20,160]$ 随机采样的轨迹上训练，评估时使用退火噪声；同一个无时间步更新随着 $K$ 增大成功求解越来越多实例。(右) 对「记忆 + 无时间步」模型，用退火噪声调度或在式（7）中固定 $t$、改变恒定测试时噪声水平进行评估；恒定最大噪声（$t=0.00$）取得最佳 99.90%。

**图 3（原文第 12 页）：** 不同 BPTT 深度 $L$（反向传播所经去噪步数）对 Sudoku-Extreme 性能的影响。训练使用退火噪声；测试集结果分别用退火推理噪声（左）与恒定最大噪声（右）给出。横轴为循环步数 $K$（对数坐标），纵轴为解出的谜题百分比；图例为 BPTT 窗口 $L=1,2,4,8,16$。

**图 4（原文第 13 页）：** 不同内层 Transformer 循环长度 $J$ 对 Sudoku-Extreme 性能的影响。训练使用退火噪声；测试集结果分别用退火推理噪声（左）与恒定最大噪声（右）给出。

**图 5（原文第 14 页）：** 迷宫迁移。求解率随循环深度 $K$ 的变化（三个随机种子）。Maze-Unique 是唯一路径任务，故其曲线为真正的精确匹配率；Maze-Hard 是多路径任务，以 valid/optimal/exact 三种指标示出。Maze-Hard 上的严格精确指标在 $K=100$ 时为 77.87%，比 TRM 报告的 85.3% 低几个百分点，而多路径最优指标（86.43%）与之相当。

**图 6（原文第 14 页）：** Sudoku 求解示例。

**图 7（原文第 15 页）：** Unique 迷宫求解示例。

**表注汇总：** 表 1（原文第 7 页）为 Sudoku-Extreme 与 Maze-Unique/Hard 的结构规格对比；表 2（第 10 页）为训练调度对 Sudoku 性能的影响；表 3（第 10 页）为 $K=400$ 展开中第 200 步施加的格状态干预；表 4（第 11 页）为记忆宽度缩放；表 5（第 12 页）为持续扰动下的稳定性统计。五张表均已在附录中逐格转录。

## 附录

### A. 精确的训练与推理算法

**算法 A1：交错的短程展开训练**

1. 维护展开集合 $(y,e,m,h,k,K)$；初始化 $h=0$、$k=0$
2. **对每个优化步 do**
3. 　**for** $l=1,\dots,L$ **do**
4. 　　$t_k\leftarrow\epsilon+(1-2\epsilon)k/(K-1)$
5. 　　$x_k\leftarrow\mathrm{Pin}(a(t_k)y+b(t_k)\varepsilon,e,m)$
6. 　　$u_k\leftarrow E_x(x_k)+p+m\odot g+h_k$
7. 　　**for** $j=1,\dots,J$ **do**
8. 　　　$u_k\leftarrow B_\theta(u_k;\mathrm M)$
9. 　　**end for**
10. 　　$z_k\leftarrow u_k$
11. 　　$h_{k+1}\leftarrow\mathrm{LN}_h(u_k)$；$\hat y\leftarrow E_o(\mathrm{LN}_o(u_k))$
12. 　　$k\leftarrow k+1$
13. 　**end for**
14. 　在未知格上用 $\|\hat y-y\|^2$ 更新 $\theta$
15. 　分离 $h_k$；重置已完成的展开（$k\ge K$）
16. **end for**

**算法 A2：任意深度推理**

1. $h\leftarrow0$；$x\leftarrow\mathrm{Pin}(\varepsilon,e,m)$
2. **for** $k=0,\dots,K-1$ **do**
3. 　$u_k\leftarrow E_x(x_k)+p+m\odot g+h_k$
4. 　**for** $j=1,\dots,J$ **do**
5. 　　$u_k\leftarrow B_\theta(u_k;\mathrm M)$
6. 　**end for**
7. 　$h_{k+1}\leftarrow\mathrm{LN}_h(u_k)$；$\hat y\leftarrow E_o(\mathrm{LN}_o(u_k))$
8. 　选择 $t_{k+1}$（调度或保持的水平）
9. 　$x_{k+1}\leftarrow\mathrm{Pin}(a(t_{k+1})\hat y+b(t_{k+1})\varepsilon,e,m)$
10. **若** $\mathrm{Decode}(\hat y)$ 在耐心窗口 $P$ 内保持不变 **then**
11. 　**break**
12. **end if**
13. **end for**
14. **return** $\mathrm{Decode}(\hat y)$

### B. 方法与架构细节

**去噪调度。** 在一个回合的第 $k\in\{0,\dots,K-1\}$ 步，展开的破坏程度为：

$$
t_k=\epsilon+(1-2\epsilon)\frac{k}{K-1},\qquad \epsilon=10^{-2}.\tag{8}
$$

**架构比较：Sudoku 与 Maze。** 尽管两个任务共享同一个递归连续扩散形式，它们内部去噪器的架构针对各自不同的「关系型」与「局部空间型」拓扑而定制（汇总于表 1）。

**表 1：Sudoku-Extreme 与 Maze-Unique/Hard 的架构规格。**（来源：原文第 7 页。）

| 属性 | Sudoku-Extreme | Maze（Unique 与 Hard） |
|---|---|---|
| 空间域 | $9\times9$（$N=81$ 个格子） | $30\times30$（$N=900$ 个格子） |
| 类别维数（$d_{\mathrm{in}}$） | 9 个数字 | 5 种语义 token |
| 张量布局 | 序列 $(B,81,d)$ | 空间二维 $(B,C,30,30)$ |
| 隐层 / 记忆维数 | $H=128$，$C_h=128$ | $H=96$，$C_h=64$ |
| 位置嵌入 | 学习得到的行、列、宫嵌入 | 无（平移等变） |
| 记忆注入 | 相加：$E_x(x)+h$ | 拼接：$\mathrm{Conv}_{1\times1}([x;h])$ |
| 通信块 | 掩码注意力（4 个注意力头） | 局部 $3\times3$ 卷积 |
| 邻域拓扑 | 关系型 $\mathrm M$（行/列/宫） | $3\times3$ Moore 邻域 |
| 内层循环深度（$J$） | 8 | 8 |
| 归一化 | 逐格 LN | 空间通道 LN |
| 可观测读出 | 线性 $E_o(\mathrm{LN}_o(z))$ | $\mathrm{Conv2D}_{1\times1}(z)$ |
| 记忆读出 | $\mathrm{LN}_h(z)$ | $\mathrm{ChannelLN}(\mathrm{Conv2D}_{1\times1}(z))$ |

**Sudoku 架构（循环 Transformer 去噪器）。**

- **输入嵌入与空间先验：** 被钉住的扩散状态 $x_k\in\mathbb R^{B\times81\times9}$ 经线性层 $E_x$ 投影到隐维数 $H=128$。为编码棋盘几何，我们加入行、列与 $3\times3$ 宫的可学习分解嵌入 $p_{\mathrm{row}}\in\mathbb R^{9\times H}$、$p_{\mathrm{col}}\in\mathbb R^{9\times H}$、$p_{\mathrm{box}}\in\mathbb R^{9\times H}$，以及由线索掩码 $m$ 门控的可学习指示向量 $g\in\mathbb R^{H}$：

$$
u^{(0)}_k=E_x\left(\mathrm{Pin}(x_k,e,m)\right)+p_{\mathrm{row}}+p_{\mathrm{col}}+p_{\mathrm{box}}+m\odot g+h_k.\tag{9}
$$

- **约束掩码注意力：** 通信块 $B_\theta$ 是一个 Pre-LN Transformer 层（4 个注意力头，头维 32，MLP 扩展比 4，GELU 激活）。注意力被布尔约束掩码 $\mathrm M\in\{0,1\}^{81\times81}$ 限制：当且仅当格子 $i$ 与 $j$ 同行、同列或同 $3\times3$ 块时 $\mathrm M_{i,j}=1$。
- **内层递归与双读出：** 该块被评估 $J=8$ 次权重共享的内层迭代：$u^{(j)}_k=B_\theta(u^{(j-1)}_k;\mathrm M)$。由最终表示 $z_k=u^{(J)}_k$，两个独立的 LayerNorm 模块产生未被破坏的隐状态 $h_{k+1}=\mathrm{LN}_h(z_k)$ 与可观测投影 $\hat y_k=E_o(\mathrm{LN}_o(z_k))$。

**Maze 架构（卷积神经细胞自动机去噪器）。**

- **二维空间布局与通道拼接：** 在寻路中，任务约束完全是局部的（逐格的路径邻接与避墙）。我们保留二维空间网格 $(B,5,30,30)$。扩散状态 $x_k\in\mathbb R^{B\times5\times30\times30}$ 与持久记忆 $h_k\in\mathbb R^{B\times64\times30\times30}$ 沿通道轴拼接，并经 $1\times1$ 卷积嵌入：

$$
z^{(0)}=\mathrm{SiLU}\left(\mathrm{Conv2D}_{1\times1}([x_k;h_k])\right)\in\mathbb R^{B\times96\times30\times30}.\tag{10}
$$

- **局部 Moore 卷积算子：** 内层循环通过重复 $J=8$ 步的局部残差卷积块进行：

$$
z^{(j)}=z^{(j-1)}+\mathrm{Conv2D}_{1\times1}\left(\mathrm{SiLU}\left(\mathrm{ChannelLN}\left(\mathrm{Conv2D}_{3\times3}(z^{(j-1)})\right)\right)\right),\tag{11}
$$

其中 $\mathrm{Conv2D}_{3\times3}$ 的核大小为 3、步长为 1、填充为 1，把通信严格限制在每个格子最近的 8 个 Moore 邻居内；$\mathrm{ChannelLN}$ 对每个空间坐标独立地在通道维上施加 LayerNorm。
- **双读出：** 输出状态与下一步记忆分别由独立的 $1\times1$ 卷积产生：

$$
\hat y_k=\mathrm{Conv2D}_{1\times1}(z^{(J)}),\qquad
h_{k+1}=\mathrm{ChannelLN}\left(\mathrm{Conv2D}_{1\times1}(z^{(J)})\right).\tag{12}
$$

### C. 数据集

**Sudoku-Extreme 基准。** 我们在完整的 Sudoku-Extreme 数据集上评估算法推理（Wang et al., 2025; Jolicoeur-Martineau, 2025），该数据集可在 HuggingFace 获取（sapientinc/sudoku-extreme）。数据集汇集了约 425 万个保证唯一解的 $9\times9$ Sudoku 谜题，来自社区来源（包括 Kaggle、EnjoySudoku 论坛与 tdoku 基准套件（Dillon, 2020））。

- **划分与规模：** 基准划分为约 383 万个谜题的训练集与约 42.3 万个谜题的留出测试集（总计约 110 万个标准实例与约 310 万个困难/极端实例）。训练集谜题保证与测试集谜题在任何同构变换（数字重标号、横带/竖栈置换或转置）下数学上不等价。对消融实验，我们在测试集的 1 万样本子集上评估。
- **难度评级：** 每个谜题包含一个整数难度评级，表示 tdoku 求解器（Dillon, 2020）找到解所需的回溯次数，从 0 次回溯（直接的约束传播）直到需要深度回溯搜索的极端实例。
- **表示与掩码：** 每个棋盘在 $9\times9$ 网格上表示（$N=81$ 个格子）。输入线索定义为一个整数张量，数字取 $\{1,\dots,9\}$、空格为 0，由此得到二值线索掩码 $m\in\{0,1\}^{81}$：固定给定数字的格子 $m_i=1$、待推断格 $m_i=0$。真值目标 $y\in\{1,\dots,9\}^{81}$ 映射为 9 维 one-hot 表示（或学习嵌入）。
- **数据增强：** 训练时我们即时施加保持对称性的 Sudoku 变换：(1) 以概率 $p=0.5$ 做棋盘转置；(2) 数字随机置换 $\pi\in S_9$；(3) 对 3 个横向带（$3\times9$）及各带内的行做随机置换；(4) 对 3 个纵向栈（$9\times3$）及各栈内的列做随机置换。
- **可用性：** 数据集在 Hugging Face Hub 上公开可访问：https://huggingface.co/datasets/sapientinc/sudoku-extreme。

**Maze-Unique 与 Maze-Hard 基准。** 为评估空间寻路并检验迭代深度缩放能否迁移到局部通信拓扑，我们在 Maze-Unique（Huang et al., 2026）与 Maze-Hard（Jolicoeur-Martineau, 2025）基准上评估模型。

- **Maze-Unique（单路径基准）：** 由 Huang et al.（2026）提出以消除空间推理中的路径歧义，Maze-Unique 由 $30\times30$ 网格迷宫组成，每个实例都构造成恰好包含一条连接指定起点（$S$）与终点（$G$）格的有效路径。
  - 模型在 1 千个唯一 $30\times30$ 迷宫实例上训练；训练时我们即时施加 8 种二面体对称（4 种旋转 × 水平反射）以增强空间朝向。
  - 因为每个迷宫只有唯一解，有效性、最优性（最短路径）与精确网格匹配三者重合：exact ≡ valid ≡ optimal。
- **Maze-Hard（多路径基准）：** 改编自递归推理套件（Jolicoeur-Martineau, 2025），Maze-Hard 由复杂的 $30\times30$ 迷宫组成，具有环路、死胡同以及源点与目标之间的多条可行路径。
  - 由于存在其他有效路径，我们报告三个标准指标：1）精确求解率（exact solve，%）：预测网格与规范真值路径逐格一致；2）最优求解率（optimal solve，%）：预测路径有效且达到最短路径长度；3）有效求解率（valid solve，%）：预测路径构成从源点到目标的连续、无碰撞路径（valid ≥ optimal ≥ exact）。
- **表示与掩码：** 迷宫被 token 化为 $30\times30$ 网格（$N=900$ 个格子），含 5 个语义类别：空格（0）、解路径（1）、墙（2）、源点（3）与目标（4）。条件掩码 $m\in\{0,1\}^{900}$ 固定所有墙、源点与目标位置（$m_i=1$），要求模型在无约束的自由格上推断并填入有效路径 token（$m_i=0$）。

### D. 训练课程的消融

**表 2：训练调度对 Sudoku 性能的影响。** 在 Sudoku-Extreme 上训练与测试，三个随机种子，one-hot 可见状态编码，$K=10{,}000$；推理时使用退火噪声调度。（来源：原文第 10 页。）

| 训练机制 | 结果 |
|---|---|
| 退火噪声 + teacher forcing | $99.54\pm0.02$ |
| 固定噪声训练（$t=0,\forall K$） | $82.73\pm6.60$ |
| 自由运行训练 | $80.50\pm7.31$ |
| 逐步独立同分布噪声水平 | $20.59\pm3.40$ |
| 仅干净数据 | $0.00\pm0.00$ |

我们在 Sudoku-Extreme 上用各种训练机制测试性能（附录表 2），评估时使用退火噪声。首先测试在退火噪声调度上训练的模型；然后测试在每个去噪步都使用恒定最大破坏训练的模型（固定噪声训练）；此外，我们用自由运行（free-running）训练训练模型：把去噪器预测重新以逐级降低的噪声水平加噪后作为下一步输入。我们还测试在每个时间步从随机采样的独立同分布噪声水平上训练的模型（即不是逐步退火噪声水平，而是按随机选取的 $t$ 破坏输入）。最后，我们测试完全不加输入噪声破坏训练的模型（仅干净数据）。

### E. 记忆对 Sudoku 性能的影响

**表 3：在 $K=400$ 展开的第 200 步施加的格状态干预。** 在 Sudoku-Extreme 上，三个随机种子；评估扰动后继续 $K=400$ 次迭代时正确求解的 Sudoku 实例百分比。替换记忆时取 $K=50$ 处的记忆。模型分别用退火噪声或纯噪声训练与评估。（来源：原文第 10 页。）

| 部分展开后的干预 | 退火 | 恒定 $t=0$ |
|---|---|---|
| 无（基线） | $82.50\pm0.35$ | $96.36\pm0.24$ |
| 重置可观测状态 | $88.09\pm0.09$ | $96.78\pm0.38$ |
| 用更早步骤的记忆替换 | $78.88\pm0.17$ | $93.28\pm0.36$ |
| 重置记忆 | $58.03\pm1.43$ | $91.21\pm0.21$ |
| 将一半通道置零 | $63.33\pm33.10$ | $81.67\pm25.26$ |
| 打乱格子位置 | $29.38\pm17.81$ | $56.11\pm21.61$ |
| 打乱全部记忆数值 | $0.27\pm0.18$ | $2.39\pm1.58$ |

这里我们对系统的各个方面施加了有针对性的干预。我们在 Sudoku-Extreme 上以 $K=400$ 个去噪步评估推理模型，并在第 $K=200$ 步施加扰动（附录表 3）。由于评估展开使用的步数更少（400 对 10,000），我们的基线性能低于正文中的结果。首先，我们发现该短展开情形下用恒定噪声评估显著优于退火噪声版本，进一步说明更强的噪声对探索有益。如预期，保留隐状态而重置可观测状态不会降低性能：承载步骤间计算与交接的正是隐状态。在退火评估中重置可见状态会降低信噪比，在第 $K=200$ 步只剩纯的低等级噪声；由于我们已确立系统能从随机性中获益，这一扰动自然带来性能提升。该效应在恒定噪声情形下不显著，因为我们在每一步都已让系统噪声饱和。替换或重置记忆都会损害性能；最后，随机置零或打乱通道会灾难性地损害性能。总体而言，推理时使用恒定注入噪声得到对扰动更鲁棒的推理过程。

> **原文疑点：** 附录 E 原文称「our baseline performance is worse than that in Table 1 due to performing the evaluation rollout with less timesteps (400 vs 10,000)」，但表 1 是架构规格对比表，并非结果表；此处交叉引用疑为笔误（按上下文应指其结果表中的对应结果）。本页按原文照录并加注，未修改引用编号。

### F. 预测解的稳定动力学

正文主要实验使用线索确定唯一解的 Sudoku 谜题。在该设定下，一种自然的终端行为是递归动力学稳定到某个解码答案并停留在那里。我们问：当条件信息欠定时会发生什么——如果给定线索与多个有效完成一致，模型是否仍收敛到单一稳定解，还是在持续随机推理下继续在可能的完成之间移动？

为研究这一点，我们比较两个架构与目标相同、但线索掩码分布不同的模型。完全确定（fully-determined）版本在直接取自数据集的 Sudoku-Extreme 实例上训练；欠定（under-determined）版本在遮掉部分给定线索、从而具有多个有效解的 Sudoku-Extreme 实例上训练。值得注意的是，在欠定情形下我们仍以原始单一参考解作为目标计算损失。

我们通过如下评估探测所得动力学：每个谜题在持续随机强迫下最多运行 $K=2000$ 步（附录表 5）。若在步数预算内去噪器对连续 5 个去噪步输出相同的棋盘预测（耐心窗口），则把该轨迹判为已稳定。若某实例已稳定，我们再继续展开模型 $W=500$ 步，然后分类：若预测解不变则判为「稳定并停留」（settled-and-stayed），若预测解漂移则判为「稳定后游走」（settled-then-wandered）。若预测输出在 $K=2000$ 步预算内从未连续 5 步稳定收敛，则判为「从未稳定」（never-settled）。评估在完全确定谜题上训练的模型时，它几乎总能稳定并保持固定（$99.24\pm1.04\%$）。在欠定谜题上训练的模型在完全确定评估中表现很不同：它达到稳定状态，但随后在 $88.94\pm12.96\%$ 的轨迹中离开该状态。当在欠定谜题上训练的模型在欠定谜题上评估时，游走同样常见，「稳定后游走」率为 $57.93\pm5.64\%$。

这些结果表明，条件分布会影响所学递归动力学在持续噪声下是否保持稳定。一种可能解释是解的多重性：当线索确定唯一答案时，所有轨迹都可被驱动到同一完成；而有歧义的条件可能保留若干竞争的完成。然而，两种训练机制在线索数量与掩码几何上也不同，因此本实验并未隔离多重性本身。我们因此把该结果视为探索性的，并把解数量匹配的比较留待未来工作。

**表 4：记忆宽度缩放。** Sudoku-Extreme，三个随机种子，精确求解率（%），推理时使用退火噪声；训练若干不同隐嵌入大小（$H$）的模型，训练时展开长度从 $K=[20,160]$ 随机采样，并在不同展开长度上评估。（来源：原文第 11 页。）

| $H$ | $K=100$ | $K=200$ | $K=400$ |
|---|---|---|---|
| 64 | $58.47\pm2.77$ | $73.49\pm2.52$ | $86.39\pm1.68$ |
| 128 | $82.02\pm0.49$ | $90.99\pm0.39$ | $96.29\pm0.27$ |
| 256 | $83.71\pm1.60$ | $91.75\pm1.12$ | $96.48\pm0.61$ |

我们还测试了改变隐藏通道嵌入大小对 Sudoku-Extreme 性能的影响（附录表 4）。我们发现隐嵌入越大性能越好；但随着隐嵌入规模继续增大，测试时性能的边际收益递减。

**表 5：持续扰动下的稳定性。** 我们在两种机制下训练与测试推理模型：完全确定与欠定 Sudoku 棋盘。完全确定棋盘及其掩码直接取自 Sudoku-Extreme 数据集，具有唯一解；欠定实例通过随机遮掉 Sudoku-Extreme 的给定线索生成，得到具有多个有效解的棋盘状态。每条展开最多运行 $K=2000$ 个时间步；若实例在预算内对连续 5 个去噪步预测相同解，则标记为已稳定；对已稳定状态再运行额外 500 个去噪步，若解漂移则标记为「稳定后游走」，若保持稳定则标记为「稳定并停留」；若实例在步数预算内从未收敛，则标记为「从未稳定」。（来源：原文第 12 页。）

| 测试机制 | 训练机制 | 稳定并停留 | 稳定 → 游走 | 从未稳定 |
|---|---|---|---|---|
| 完全确定 | 完全确定 | $99.24\pm1.04$ | $0.04\pm0.05$ | $0.72\pm0.99$ |
| 完全确定 | 欠定 | $11.02\pm12.89$ | $88.94\pm12.96$ | $0.04\pm0.07$ |
| 欠定 | 完全确定 | $83.94\pm4.75$ | $6.39\pm6.44$ | $9.67\pm2.83$ |
| 欠定 | 欠定 | $42.07\pm5.64$ | $57.93\pm5.64$ | $0.0\pm0.0$ |

### G. BPTT 窗口对性能的影响

（对应图 3）我们的扩散目标允许把 BPTT 截断到每次仅几个去噪步。这里我们测试不同 BPTT 深度在不同测试时展开长度 $K$ 下的影响。有趣的是，我们发现性能在过浅与过深的 BPTT 深度下都会下降：在浅深度（$L=1$）时，信息无法跨去噪迭代传播；在较大深度（$L=16$）时，系统开始受梯度消失影响。因此，一个较浅但多步的窗口是取得良好性能的关键。

### H. 内层 Transformer 循环的影响

（对应图 4）我们改变所执行的内层 Transformer 循环次数，并测量其对 Sudoku-Extreme 的影响。我们发现内层迭代过少或过多都会使性能下降；$J=8$ 次内层循环迭代表现最好，因此在所有实验中采用该值。

### I. 随机 token 表示

正文主要实验对可见通道使用 one-hot 编码。我们也测试正交归一（orthonormal）嵌入是否表现良好。这里每个数字 $q\in\{1,\dots,9\}$ 由正交归一码本 $E\in\mathbb R^{9\times D}$ 的固定行 $e_q$ 表示；目标、线索、可见状态与高斯破坏都位于 $\mathbb R^D$ 中。解码使用

$$
\hat q=\arg\max_q\frac{\langle\hat y,e_q\rangle}{\|\hat y\|_2\|e_q\|_2}.
$$

对 one-hot 情形有 $E=I$（单位阵）。对码本情形，当 $D=9$ 时代码是一个旋转，在各向同性高斯噪声下应等价；当 $D=32$ 时我们测试的是更高维、非轴对齐的码。使用 $K=10{,}000$ 个去噪步与正交归一可见通道嵌入时，Sudoku-Extreme 上的性能为：$D=9$ 时 $99.51\pm0.06$，$D=32$ 时 $99.08\pm0.41$。

### J. 迷宫任务迁移

在迷宫基准（Maze-Unique 与 Maze-Hard）上，同一个无时间步递归求解器表现出与 Sudoku 相同的深度缩放行为：精确求解率从 $K=5$ 时的 $40.87\pm15.65\%$ 增至 $K=50$ 时的 $98.23\pm0.75\%$ 与 $K=100$ 时的 $98.93\pm0.15\%$（附录图 5）。在 Maze-Unique 中，因为每个迷宫只有唯一路径，有效性、精确匹配与最短路径重合，故我们对该基准只报告一组性能。推理行为同样迁移：把系统保持在最大破坏程度得到 $98.40\pm1.47\%$ 的性能；推理时使用退火噪声调度得到 $98.93\pm0.15\%$；而在去噪步之间完全不加噪声地传递干净预测则得到 $66.30\pm11.88\%$。因此，测试时深度缩放与随机推理的益处都超出 Sudoku 之外。

### K. Sudoku 与迷宫求解示例

（对应图 6、图 7）附录给出 Sudoku 求解与 Unique 迷宫求解的示例可视化，分别见图 6 与图 7。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.01449v1（cs.LG）全文 15 页：摘要、第 1—4 节、图 1—7 图注、表 1—5、附录 A—K（含算法 A1、A2 与式（8）—（12））、参考文献（英文原条目，保持原文的字母序与不编号体例）。原文 © 2026 Google. All rights reserved；本页仅为学术阅读用中文译稿，版权与再传播许可需另行核验。表格已用 `render.py` 渲染 PDF 第 7、10、11、12 页并逐格核对表 1—5；正文与附录中的数值（99.90%、98.93%、99.24%、88.94%、57.93%、0.27% 等）均按原文照录。原文以 "Supp. Tab./Supp. Fig." 形式交叉引用附录内容，本页按实际章节位置（附录 D/E/F、图 3—5）给出对应说明。未发现需加注的原文数值矛盾；原文参考文献中 T. Dillon 条目的位置（位于 Lu and Song 之后、Saunshi 之前）按原文保留并在书目下加注。未做逐句逐式的字符级终校（公式上下标、编号交叉引用与统计量的独立复算均未做）；图内曲线与图像内容未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.01449v1) 为准。
{% endraw %}
