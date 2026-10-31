---
layout: page
title: "基于哈密顿蒙特卡洛的多用户 MIMO 矢量扰动预编码｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-23011-hamiltonian-monte-carlo-for-vector-perturbation-precoding-in-mu-mimo-v/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/49a4c172f1b741d0/) · [原文 arXiv](https://arxiv.org/abs/2609.23011) · [全部目录](/papers/catalog/)

# 基于哈密顿蒙特卡洛的多用户 MIMO 矢量扰动预编码

**原题：** Hamiltonian Monte Carlo for Vector Perturbation Precoding in MU-MIMO via Continuous Relaxation  
**作者：** Junichiro Hagiwara、Toshihiko Nishimura、Yasutaka Ogawa、Takeo Ohgane  
**版本：** arXiv:2609.23011v2（cs.IT），2026-09-23，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–V 节、结论、表 I／表 II 逐格、图 1–5 图注、算法 1 逐行、参考文献 [1]–[24]（英文原条目）按原文结构录入；原文无附录、无致谢段。逐句逐式终校未做。

## 摘要

多用户多输入多输出（multi-user multiple-input multiple-output，MU-MIMO）是通过多天线提高无线容量的关键技术。在 MU-MIMO 下行预编码中，矢量扰动（vector perturbation，VP）是一种具有代表性的高性能非线性方法。然而，其整数扰动向量的搜索可归结为最近向量问题，复杂度随用户数增长而迅速上升。我们提出一种方法：把整数扰动的离散结构松弛为连续的 $t$ 分布混合，从而可借助基于梯度的哈密顿蒙特卡洛（Hamiltonian Monte Carlo，HMC）进行高效搜索。复杂度分析与数值实验验证了所提方法的有效性：其搜索复杂度随用户数 $N$ 按 $O(N^2)$ 增长；在符号错误率 $10^{-3}$ 处，其性能与近似 VP 性能极限的超球近似基准相差不超过 2.4 dB。本文将 VP 扰动搜索重新表述为概率推断问题，为在连续空间中处理高维离散搜索提供了通用表述。

**索引词：** 连续松弛、哈密顿蒙特卡洛（HMC）、多用户多输入多输出（MU-MIMO）、预编码、矢量扰动（VP）。

## I. 引言

以 5G 为代表的无线通信需求的增长，要求进一步提升频谱效率。多用户多输入多输出（MU-MIMO）[1] 是一种有前景的多天线技术，可在不过度依赖用户终端实现能力的前提下提高小区容量。在 MU-MIMO 下行中，各用户终端无法直接观测其他用户的信道状态，因此在基站侧预先抑制用户间干扰的发射预编码 [2] 不可或缺。预编码方法大致分为线性与非线性两类：典型线性方法包括迫零（zero forcing，ZF）与最小均方误差（minimum mean squared error，MMSE）[3]；典型非线性方法包括 Tomlinson–Harashima 预编码（THP）[4]、[5] 与矢量扰动（VP）[6]、[7]。一般而言存在折中：线性方法复杂度低但性能有限，非线性方法性能高但复杂度高。尽管当前部署主要依赖线性方法 [8]、[9]，开发以实用复杂度实现高性能的非线性方法对进一步获得容量增益仍很重要。非线性预编码的理论性能极限由脏纸编码（dirty paper coding，DPC）[10] 给出，而 VP 被视为其实际近似。在 VP 中，向发射符号加入整数扰动向量，并在接收端通过取模运算去除其影响；然而对整数扰动向量的穷举搜索需要随用户数指数增长的搜索代价，在大规模 MIMO [11] 等大规模系统中变得不可行。

该扰动搜索问题可归结为最近向量问题，已有多种方法被研究以求高效求解 [2]。例如，球形搜索 [7] 把搜索候选限制在给定半径超球内的格点上，性能良好但计算复杂度仍高。更近期提出的方法包括：基于相关度量的序贯扰动更新 [12]、应用于 ZF 与带连续干扰消除（successive interference cancellation，SIC）的 ZF 的近似消息传递（approximate message passing，AMP）[13]，以及依赖专用硬件的量子退火 [14]、[15]。据报道这些方法以较高计算效率取得了良好性能。然而据我们所知，多数现有方法本质上仍把扰动搜索视为离散优化问题，利用为连续空间开发的强大算法的方向尚未被充分探索。

本文把 VP 扰动搜索重新表述为概率推断问题，并发展出在连续空间中处理高维离散搜索的表述。具体而言，我们提出把每个整数扰动元素的离散结构松弛为连续的 $t$ 分布混合，从而借助基于梯度的哈密顿蒙特卡洛（HMC）[16] 高效搜索。该方法扩展了我们的初步研究 [17]，特别是引入格基约化（lattice reduction，LR）[18] 作为预处理：LR 改善格基的正交性，从而改善 HMC 所探索扰动空间的条件数。在相关工作中，我们曾把类似的概率推断框架用于接收端 MIMO 信号检测 [19]；本文则处理不同问题，即发射端的 VP 扰动搜索，并给出 VP 专用表述，包括基于扰动搜索准则构造似然以及引入 LR 预处理。回到本文所提 VP 方法，复杂度分析表明其搜索随用户数 $N$ 按 $O(N^2)$ 增长；数值实验表明在符号错误率（symbol error rate，SER）为 $10^{-3}$ 处，其性能与超球近似基准 [20] 相差不超过 2.4 dB。这表明可在通用计算平台上以多项式复杂度达到接近极限的 VP 性能。这些结果有望为面向 6G 的研发以及组合优化连续松弛的更广泛认识作出贡献。本文的主要贡献不在于新的 HMC 算法，而在于把 VP 整数扰动搜索表述为可用标准 HMC 处理的可微后验。

全文其余部分组织如下：第 II 节建立问题模型，第 III 节介绍所提方法，第 IV 节给出数值结果与讨论，第 V 节总结全文。

**记号：** $\mathbf 0$ 与 $\mathbf I$ 分别表示零向量与单位矩阵。$\mathbf A^H$ 与 $\mathbf A^T$ 分别表示矩阵 $\mathbf A$ 的 Hermitian 转置与转置。$\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)$ 表示均值向量为 $\boldsymbol\mu$、协方差矩阵为 $\boldsymbol\Sigma$ 的正态分布。$t_\nu(\mu,\sigma)$ 表示位置参数为 $\mu$、尺度参数为 $\sigma$、自由度为 $\nu$ 的 $t$ 分布。$\|\cdot\|$ 表示欧氏范数。$Q(\cdot)$ 表示最近整数量化器。

## II. 问题建模

### A. 系统模型

考虑 MU-MIMO 下行系统：配备 $M$ 根发射天线的基站服务 $N$ 个单天线用户终端。信息符号向量 $\mathbf u\in\mathbb C^N$ 的元素独立且均匀取自指定的正交幅度调制（quadrature amplitude modulation，QAM）星座。令 $\tilde{\mathbf u}\in\mathbb C^M$ 为预编码后的发射符号向量，$\mathbf H\in\mathbb C^{N\times M}$ 为信道矩阵，$\mathbf y\in\mathbb C^N$ 为接收符号向量，$\mathbf w\in\mathbb C^N$ 为噪声向量。其关系为

$$
\mathbf y=\mathbf H\tilde{\mathbf u}+\mathbf w, \tag{1}
$$

其中 $\mathbf w$ 服从复正态分布 $\mathcal{CN}(\mathbf 0,\sigma_w^2\mathbf I)$。预编码向量的总发射功率归一化为给定常数 $P_t$，即 $\|\tilde{\mathbf u}\|^2=P_t$。本文假设 $\mathbf H$ 在发射端已知。

### B. 矢量扰动（VP）[6]、[7]

图 1 给出 VP 的处理框图。预编码器以 $\mathbf u$ 为输入产生 $\tilde{\mathbf u}$，检测器以 $\mathbf y$ 为输入产生 $\mathbf u$ 的估计 $\hat{\mathbf u}$。预编码器向信息向量加入整数扰动向量，检测器通过取模运算去除扰动的影响。扰动向量是整体选取的，以改善检测性能：对受 $\mathbf H$ 不利影响的符号，扰动提高其发射功率以缓解该影响；反之，对未受 $\mathbf H$ 不利影响的符号不加入扰动。由于平均发射功率被归一化为常数，这实际上是把发射功率重新分配以补偿 $\mathbf H$ 的不利影响。$\tilde{\mathbf u}$ 由下式给出：

$$
\tilde{\mathbf u}=\sqrt{\frac{P_t}{\left\|\mathbf G(\mathbf u+\tau\boldsymbol\ell)\right\|^2}}\,\mathbf G(\mathbf u+\tau\boldsymbol\ell), \tag{2}
$$

其中 $\boldsymbol\ell$ 为 $N$ 维高斯整数扰动向量，$\mathbf G=\mathbf H^H(\mathbf H\mathbf H^H)^{-1}$ 为 $\mathbf H$ 的伪逆，$\tau=2c_{\max}+\Delta$。这里 $c_{\max}$ 为幅度最大的星座符号的绝对值，$\Delta$ 为星座点间距。

类似地，$\hat{\mathbf u}$ 由下式给出：

$$
\hat{\mathbf u}=\mathrm{mod}_\tau\left(\mathbf u+\tau\boldsymbol\ell+\sqrt{\frac{\left\|\mathbf G(\mathbf u+\tau\boldsymbol\ell)\right\|^2}{P_t}}\,\mathbf w\right), \tag{3}
$$

其中 $\mathrm{mod}_\tau(\cdot)$ 表示模为 $\tau$ 的取模运算。本文为简化起见假设 $\|\mathbf G(\mathbf u+\tau\boldsymbol\ell)\|^2$ 在接收端已知。由 (3) 可见，$\mathbf w$ 的系数会造成噪声放大，该系数越小则恢复 $\mathbf u$ 越准确。因此预编码端对 $\boldsymbol\ell$ 的搜索准则为

$$
\arg\min_{\boldsymbol\ell}\left\|\mathbf G(\mathbf u+\tau\boldsymbol\ell)\right\|^2. \tag{4}
$$

以下把 $\|\mathbf G(\mathbf u+\tau\boldsymbol\ell)\|^2$ 称为 **VP 代价**。应用格基约化 [18] 作为预处理以改善 $\mathbf G$ 的条件数后，(4) 变为

$$
\arg\min_{\boldsymbol\ell}\left\|\mathbf G\mathbf T\mathbf T^{-1}(\mathbf u+\tau\boldsymbol\ell)\right\|^2
=\arg\min_{\boldsymbol\ell_{\mathrm{LR}}}\left\|\mathbf G_{\mathrm{LR}}\left(\mathbf u_{\mathrm{LR}}+\tau\boldsymbol\ell_{\mathrm{LR}}\right)\right\|^2, \tag{5}
$$

其中 $\mathbf G_{\mathrm{LR}}=\mathbf G\mathbf T$、$\mathbf u_{\mathrm{LR}}=\mathbf T^{-1}\mathbf u$、$\boldsymbol\ell_{\mathrm{LR}}=\mathbf T^{-1}\boldsymbol\ell$，$\mathbf T$ 为 $N\times N$ 幺模矩阵，即 $\det(\mathbf T)=\pm1$。格基约化把 $\mathbf G$ 的基变换为 $\mathbf G_{\mathrm{LR}}$ 的基，其基向量更短且更接近正交。因此，在 (5) 中搜索 $\boldsymbol\ell_{\mathrm{LR}}$ 再变换回 $\boldsymbol\ell$，相比在 (4) 中直接搜索 $\boldsymbol\ell$ 可改善搜索性能。本文方法采用这一途径；为获得 $\mathbf T$，我们使用著名的 LLL 算法 [21]。

## III. 所提方法

最小化 (5) 中的 VP 代价是高维组合优化问题，不易直接求解。为此我们采取一种通过概率解释求取解的高效途径：对给定 $\mathbf u_{\mathrm{LR}}$ 求 $\boldsymbol\ell_{\mathrm{LR}}$，在概率意义上等价于推断后验分布 $p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})$。由 Bayes 定理，$p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})\propto p(\mathbf u_{\mathrm{LR}}\mid\boldsymbol\ell_{\mathrm{LR}})p(\boldsymbol\ell_{\mathrm{LR}})$。下面依次考察各分量。为简化扰动元素的表示，本节使用与复数表示等价的实值表示：符号记号保持不变，但复表示中的维度 $N$ 与 $M$ 分别视为 $2N$ 与 $2M$。

### A. 似然：$p(\mathbf u_{\mathrm{LR}}\mid\boldsymbol\ell_{\mathrm{LR}})$

由于 VP 代价具有平方欧氏范数的形式，它可按正态密度概率地解释为似然：

$$
p(\mathbf u_{\mathrm{LR}}\mid\boldsymbol\ell_{\mathrm{LR}})=\mathcal N\left(\mathbf u_{\mathrm{LR}};-\tau\boldsymbol\ell_{\mathrm{LR}},\sigma_{\mathrm{lik}}^2\left(\mathbf G_{\mathrm{LR}}^T\mathbf G_{\mathrm{LR}}\right)^{-1}\right). \tag{6}
$$

尽管按 VP 代价的定义 $\sigma_{\mathrm{lik}}$ 应等于 1，但它会影响后验分布的数值搜索效率，因此我们把它保留为可调参数，并依问题预先设定合适取值。

### B. 先验分布：$p(\boldsymbol\ell_{\mathrm{LR}})$

由 [13] 可知，最有效的 $\boldsymbol\ell_{\mathrm{LR}}$ 集中在参考点 $Q(-\mathbf u_{\mathrm{LR}}/\tau)$ 附近。考虑搜索效率，本文把相对参考点的偏移限制为 $\{-1,0,1\}$。因此先验分布服从三峰分类分布（图 2(a)），我们把它松弛为三峰连续 $t$ 分布混合（图 2(b)）如下：

$$
p(\boldsymbol\ell_{\mathrm{LR}})=\prod_{n=1}^{2N}p(\ell_{\mathrm{LR},n}),\qquad
p(\ell_{\mathrm{LR},n})=\frac{1}{3}\sum_{i=-1}^{1}t_\nu\left(\ell_{\mathrm{LR},n};Q\left(-u_{\mathrm{LR},n}/\tau\right)+i,\sigma_{\mathrm{pri}}\right). \tag{7}
$$

$\nu$ 与 $\sigma_{\mathrm{pri}}$ 为可调参数，须依问题预先确定合适取值。我们采用 $t$ 分布而非典型正态分布作为分量分布，以改善后验分布的数值搜索效率：$t$ 分布比正态分布具有更尖锐的峰与更重的尾部，因而既能对峰附近做密集搜索，又能跨峰主动移动 [19]。

### C. 后验分布：$p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})$

由于似然与先验分布均连续，后验分布也连续。由于后文所述的 HMC 作用于对数后验分布的差分，我们定义对数后验分布，只保留依赖 $\boldsymbol\ell_{\mathrm{LR}}$ 的项：

$$
\log p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})\overset{c}{=}-\frac{1}{\sigma_{\mathrm{lik}}^2}\left\|\mathbf G_{\mathrm{LR}}(\mathbf u_{\mathrm{LR}}+\tau\boldsymbol\ell_{\mathrm{LR}})\right\|^2+\sum_{n=1}^{2N}\log\sum_{i=-1}^{1}a_{n,i}^{-(\nu+1)/2}, \tag{8}
$$

$$
a_{n,i}=1+\frac{\left(\ell_{\mathrm{LR},n}-\left(Q(-u_{\mathrm{LR},n}/\tau)+i\right)\right)^2}{\nu\sigma_{\mathrm{pri}}^2}.
$$

由于混合先验与似然不共轭，$\boldsymbol\ell_{\mathrm{LR}}$ 没有解析点估计，因此我们数值探索后验分布。此时可应用为连续空间开发的强大算法；本文应用高效的 HMC [16]（一种马尔可夫链蒙特卡洛（MCMC）方法），以固定样本数近似后验分布。所得样本只是候选，而扰动搜索需要点估计，因此在把它们量化到最近整数后，我们最终选取使 VP 代价最小的那个作为最终估计。

**算法 1　HMC 采样**

1. 随机初始化 $\boldsymbol\ell_{\mathrm{LR}}$
2. **for** $k=1,\ldots,L_{\mathrm{HMC}}$ **do**
3. 　从 $\mathcal N(\mathbf 0,\mathbf I)$ 抽取 $\mathbf r$
4. 　数值求解哈密顿方程得到 $\mathbf r'$ 与 $\boldsymbol\ell_{\mathrm{LR}}'$
5. 　以概率 $\min\left\{1,\exp\left(H_{\mathrm{HMC}}(\mathbf r,\boldsymbol\ell_{\mathrm{LR}})-H_{\mathrm{HMC}}(\mathbf r',\boldsymbol\ell_{\mathrm{LR}}')\right)\right\}$ 更新 $\boldsymbol\ell_{\mathrm{LR}}\leftarrow\boldsymbol\ell_{\mathrm{LR}}'$
6. 　把更新后的 $\boldsymbol\ell_{\mathrm{LR}}$ 视为来自后验分布 $p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})$ 的样本
7. **end for**

算法 1 概述 HMC 采样过程。这里 $L_{\mathrm{HMC}}$ 为 HMC 迭代次数，$\mathbf r$ 是人为引入的辅助动量变量，用以缓解 $\boldsymbol\ell_{\mathrm{LR}}$ 搜索陷入局部最优的风险。设 $t$ 为虚拟时间，哈密顿方程为 $d\boldsymbol\ell_{\mathrm{LR}}/dt=\mathbf r$、$d\mathbf r/dt=\partial\log p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})/\partial\boldsymbol\ell_{\mathrm{LR}}$。对数后验分布的这一梯度信息提高了 $\boldsymbol\ell_{\mathrm{LR}}$ 搜索的效率。哈密顿量 $H_{\mathrm{HMC}}(\mathbf r,\boldsymbol\ell_{\mathrm{LR}})$ 定义为动能 $\frac{1}{2}\|\mathbf r\|^2$ 与势能 $-\log p(\boldsymbol\ell_{\mathrm{LR}}\mid\mathbf u_{\mathrm{LR}})$ 之和。HMC 过程本身（包括数值积分与步长/路径长度设置）遵循基于 Stan 语言 [22] 的标准实现。注意我们的贡献不在 HMC 算法，而在 VP 扰动向量的可微后验。

## IV. 数值结果与讨论

本文旨在验证基于连续松弛途径的所提方法的有效性。为此，我们通过计算机仿真评估 SER，并分析计算复杂度。

**表 I　公共仿真设置**

| 项目 | 设置 |
|---|---|
| SER 评估试验次数 | $N\in\{8,16\}$ 时为 10,000；$N=32$ 时为 5,000 |
| 发射天线与用户数 | $M=N$，其中 $N\in\{8,16,32\}$ |
| 调制方式 | 16QAM |
| 总发射功率 | $P_t=1$ |
| 衰落模型 | 不相关准静态瑞利衰落 |
| 信道编码 | 无 |

**表 II　所提方法的参数设置**

| 参数 | 设置 |
|---|---|
| 似然尺度 $\sigma_{\mathrm{lik}}$ | $0.72/\sqrt{N}$ |
| 先验尺度 $\sigma_{\mathrm{pri}}$ | $2.3/N$ |
| 自由度 $\nu$ | 1.8 |
| 并行 HMC 链数 | 5 |
| HMC 迭代次数 $L_{\mathrm{HMC}}$ | 400 |

### A. 公共假设

仿真中，表 I 的设置在所有 SER 评估中保持不变。受篇幅限制，我们报告 16QAM 的代表性结果；在初步实验中，我们确认在相同设置下其他调制阶数（如 4QAM 与 64QAM）也得到类似结果。

### B. 所提方法的参数（表 II）

所提方法的可调参数通过预验证中最小化 SER 确定；当获得可比 SER 时，我们采用复杂度更低的设置。由于 VP 搜索准则不依赖噪声，表 II 的设置在所有信噪比（signal-to-noise ratio，SNR）点通用。

似然尺度与先验尺度参数 $\sigma_{\mathrm{lik}}$、$\sigma_{\mathrm{pri}}$ 控制对数后验分布梯度在 HMC 搜索中被反映的锐度，因而强烈影响搜索效率。本文通过预验证确认，其最优值相对用户数 $N$ 呈 log-log 线性趋势，故采用表 II 中的经验公式。$t$ 分布混合的自由度在网格 $\{0.5,0.6,\ldots,4.9,5.0\}$ 上搜索并设为 1.8。为降低对初值的依赖、提高搜索稳定性，我们并行运行多条 HMC 链；并行链数在网格 $\{1,2,\ldots,9,10,20,50\}$ 上搜索并设为 5。最后，兼顾搜索性能与计算复杂度，HMC 迭代次数取 $L_{\mathrm{HMC}}=400$，其合理性在下面验证。

较大的 $L_{\mathrm{HMC}}$ 改善搜索性能但增加计算复杂度，故须权衡。图 3 给出截至各 HMC 迭代所达到的最小 log VP 代价的演化，图中数值为 600 次试验的中位数（在表 I、II 条件下，除"试验次数"与 $L_{\mathrm{HMC}}$ 外）。饱和水平随 $N$ 增大，因为 VP 代价是包含维度尺度的未归一化量；这不影响对改善的相对饱和评估——以 1000 次迭代的值为收敛参考。图 3 中，超过 400 次迭代的附加改善占截至 1000 次迭代总改善的比例，在 $N=8,16,32$ 时分别为 0.3%、1.3%、3.3%（反映出 $N$ 越大搜索越困难）。因此我们判断最小值更新在 400 次迭代时已大体饱和，并综合考虑计算复杂度而停在 400 次。为完整起见，我们使用标准诊断（如 Gelman–Rubin 统计量 [23]）验证了马尔可夫链的收敛性；细节从略，因其非本文重点。

### C. 对比方法

作为代表性基础方法，我们首先考虑不应用 VP 的线性 ZF。作为代表性统计 VP 方法，基于 [13] 我们考虑四种：LR 辅助 ZF、LR 辅助 ZF-SIC、带 AMP 的 LR 辅助 ZF、带 AMP 的 LR 辅助 ZF-SIC，以下分别简称 LR-ZF、LR-ZF-SIC、LR-ZF-AMP、LR-ZF-SIC-AMP。对 AMP，采用 [13] 中报告的较优设置。作为 VP 的性能基准，我们考虑基于超球近似（hypersphere approximation，HA）[20] 的特性：它把穷举搜索 VP 所解最近向量问题的残余区域替换为等体积超球，以下简称 HA。HA 虽非严格下界，但已知能准确近似 VP 的性能极限 [20]，故本文以其作为可达性能参考。具体而言，HA 由发射—接收天线比固定的大系统渐近表达式评估，因而表现为相对 SISO AWGN（单输入单输出加性白高斯噪声）特性的常数 SNR 平移。由于所提方法把 HMC 与 LR 结合，以下称 **HMC w/ LR**。作为比较，我们还考虑两个不带 LR 的变体（取 $\mathbf T=\mathbf I$）：一个采用表 II 中的 $\sigma$ 设置，另一个取 $\sigma_{\mathrm{lik}}=\sigma_{\mathrm{pri}}=1$（与表 II 不同），以下分别称 **HMC w/o LR** 与 **HMC w/o LR（$\sigma=1$）**。注意量子退火依赖专用硬件且假设与本文不同，故不纳入比较。

### D. SER 性能（图 4）

线性 ZF 的性能随 $N$ 增大而劣化。这是因为 $N$ 增大时更易出现小的信道特征值，从而增加噪声放大的风险 [24]。

在 [13] 所提方法中，性能按 LR-ZF、LR-ZF-AMP、LR-ZF-SIC、LR-ZF-SIC-AMP 的顺序改善。所有方法的性能都随 $N$ 增大而劣化，AMP 的效果减弱；特别地，在 $N=32$ 时 LR-ZF-SIC 与 LR-ZF-SIC-AMP 的性能几乎重合。这大概是因为随 $N$ 增大更易出现小的信道特征值，具体而言对 AMP 残差的高斯假设被越来越严重地违反。

对所提方法，先考察 HMC w/o LR（$\sigma=1$）：其劣化随 $N$ 增大而更严重，性能仍与 LR-ZF 相当。这是因为随 $N$ 增大，信道硬化效应 [3] 降低了 VP 代价中信道相关起伏的相对幅度，故在先验峰附近做更窄的搜索即已足够；因此可以认为 $\sigma_{\mathrm{lik}}$ 与 $\sigma_{\mathrm{pri}}$ 的最优值随 $N$ 增大而减小（如表 II 所示），而把二者都固定为 1 会劣化性能。接着考察 $\sigma_{\mathrm{lik}}$、$\sigma_{\mathrm{pri}}$ 取最优值的 HMC w/o LR：性能相对 HMC w/o LR（$\sigma=1$）大幅改善，但在高 SNR 区域往往残留平台。高 SNR 时 AWGN 幅度变小，VP 代价对噪声放大的影响相对更大，因而扰动向量搜索性能的影响更明显。再考察 HMC w/ LR：除 $N=32$ 时低—中 SNR 区域有轻微反转外，它大体上改善了 HMC w/o LR 的性能，并消除了高 SNR 区域的平台。这表明应用 LR 降低了搜索难度，能找到更好的扰动向量。进一步把 HMC w/ LR 与 LR-ZF-SIC-AMP 比较，HMC w/ LR 在所有 SNR 下都优于后者；具体地，SER 为 $10^{-3}$ 时，$N=8,16,32$ 的增益分别为 0.7、1.2、1.0 dB。我们再把 HMC w/ LR 与 HA 比较：SER 为 $10^{-3}$ 时相对 HA 的劣化在 $N=8,16,32$ 时分别为 2.0、1.5、2.4 dB。可见 HMC w/ LR 表现良好，尽管其性能从 $N=8$ 到 16 有所改善、到 $N=32$ 有所劣化。这或可归因于信道硬化与小特征值的竞争效应，以及固定的 $L_{\mathrm{HMC}}$；特别地，我们初步确认 $N=32$ 的劣化部分与有限的 $L_{\mathrm{HMC}}$ 有关（如图 3 中较弱的饱和所显示），对 $N$ 依赖性的完整解释留待未来工作。总之，我们确认在通用计算平台上，所提连续松弛途径优于传统基于 AMP 的方法，并取得接近 VP 性能极限的 SER。

### E. 计算复杂度

我们比较所提方法与 LR-ZF-SIC-AMP 在迭代搜索中的乘法次数，排除二者共有的一次性预处理。在所提方法中，主要代价是对数后验分布梯度评估中的矩阵—向量乘积 $(\mathbf G_{\mathrm{LR}}^H\mathbf G_{\mathrm{LR}})\boldsymbol\ell_{\mathrm{LR}}$，由于 $(\mathbf G_{\mathrm{LR}}^H\mathbf G_{\mathrm{LR}})$ 可预先计算一次，该乘积需 $N^2$ 次运算。在数值求解算法 1 第 4 行哈密顿方程时，该梯度评估执行 $L\ (\ge1)$ 次；由于 $L$ 在 Stan 默认设置下自适应变化，我们用代表值进行估计。本文并行 HMC 链数为 5、$L_{\mathrm{HMC}}=400$，故复杂度为 $5\cdot400\cdot LN^2$。相反，LR-ZF-SIC-AMP 的主要代价是 AMP 处理中的矩阵—向量乘积，需 $MN$ 次运算；由于数值实验中 $M=N$，即 $N^2$ 次运算。该运算在 AMP 处理循环中出现于三处 [13, Alg. 1]：第 6、7 行，第 8 行与第 10 行。据 [13]，AMP 循环次数设为 20，故复杂度为 $20\cdot3\cdot N^2$。比较两者，均为多项式阶 $O(N^2)$，但所提方法计算量重于 LR-ZF-SIC-AMP。

这里我们考察把 AMP 循环次数增加、使复杂度大致相当时 LR-ZF-SIC-AMP 的性能。为与 LR-ZF-SIC-AMP 做保守比较，取 $M=N=8$，此时 AMP 处理最有效。由图 4(a) 仿真中 $L$ 的中位数为 15，我们把 AMP 循环次数增至 $5\cdot400\cdot15/3=10000$。该性能比较见图 5：LR-ZF-SIC-AMP 的性能几乎饱和、仅略有改善，故所提方法仍优于它。这表明所提方法的性能增益并非仅来自计算资源的分配，而源于方法本身的内在有效性——即所提方法扩展了可达的 SER 性能。

## V. 结论

本文表明，所提连续松弛途径可在通用计算平台上以多项式复杂度，在 MU-MIMO 下行中取得接近 VP 性能极限的性能。这一结果表明，把高性能非线性预编码用于 6G 无线通信的实际应用是有前景的方向。本文中影响所提方法性能的参数是经验优化的，其数学背景的澄清留待未来工作。本文还把整数扰动搜索重新表述为连续空间中的概率问题，在高维系统中也取得良好性能。我们曾把类似的概率推断框架用于接收端 MIMO 信号检测 [19]，表明该框架具有适用于发射端与接收端问题的通用性。这些结果有望为拓宽组合优化连续松弛的认识作出贡献。

## 图注与表注

**图 1：** VP 的处理框图（发射端：扰动向量搜索 / 预编码器；信道；接收端：检测器）。

**图 2：** 三峰分类分布与 $t$ 分布混合：（a）离散分类分布；（b）连续 $t$ 分布混合。

**图 3：** 截至各 HMC 迭代所达到的最小 log VP 代价（600 次试验的中位数），$N=8,16,32$；横轴为 HMC 迭代次数（0–1000），纵轴为 log VP 代价（0.5–2.5）。

**图 4：** 平均 SER 随平均接收 SNR 的变化：（a）$M=N=8$；（b）$M=N=16$；（c）$M=N=32$。

**图 5：** 复杂度匹配的 LR-ZF-SIC-AMP 与 HMC w/ LR（$M=N=8$）的 SER 性能比较。

**表 I：** 公共仿真设置（SER 评估试验次数、发射天线与用户数、调制方式、总发射功率、衰落模型、信道编码，逐格见正文表 I）。

**表 II：** 所提方法的参数设置（似然尺度 $\sigma_{\mathrm{lik}}=0.72/\sqrt{N}$、先验尺度 $\sigma_{\mathrm{pri}}=2.3/N$、自由度 $\nu=1.8$、并行 HMC 链数 5、HMC 迭代次数 $L_{\mathrm{HMC}}=400$）。

**算法 1：** HMC 采样（共 7 行：随机初始化、$L_{\mathrm{HMC}}$ 次迭代内抽取动量、数值求解哈密顿方程、以 Metropolis 概率接受更新、把更新值视为后验样本）。

> **原文说明：** 原文无附录、无独立致谢/基金段落；参考文献后有尾注性说明（第 [22] 条为 Stan 参考手册版本 2.37.0）。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v2 第 6 页转录；未逐条核对 DOI）。

[1] D. Gesbert, M. Kountouris, R. W. Heath, Jr., C.-B. Chae, and T. Sälzer, "Shifting the MIMO paradigm," IEEE Signal Process. Mag., vol. 24, no. 5, pp. 36–46, Sep. 2007.

[2] M. A. Albreem, A. H. Al Habbash, A. M. Abu-Hudrouss, and S. S. Ikki, "Overview of precoding techniques for massive MIMO," IEEE Access, vol. 9, pp. 60 764–60 801, 2021.

[3] A. Chockalingam and B. Rajan, Large MIMO Systems. Cambridge, UK: Cambridge University Press, 2014.

[4] M. Tomlinson, "New automatic equaliser employing modulo arithmetic," Electron. Lett., vol. 7, no. 5-6, pp. 138–139, Mar. 1971.

[5] H. Harashima and H. Miyakawa, "Matched-transmission technique for channels with intersymbol interference," IEEE Trans. Commun., vol. 20, no. 4, pp. 774–780, Aug. 1972.

[6] C. B. Peel, B. M. Hochwald, and A. L. Swindlehurst, "A vector-perturbation technique for near-capacity multiantenna multiuser communication — part I: channel inversion and regularization," IEEE Trans. Commun., vol. 53, no. 1, pp. 195–202, Jan. 2005.

[7] B. M. Hochwald, C. B. Peel, and A. L. Swindlehurst, "A vector-perturbation technique for near-capacity multiantenna multiuser communication — part II: perturbation," IEEE Trans. Commun., vol. 53, no. 3, pp. 537–544, Mar. 2005.

[8] 3GPP, "NR; Physical layer procedures for data," 3rd Generation Partnership Project (3GPP), Technical Specification TS 38.214, Mar. 2024, version 17.9.0, Release 17. [Online]. Available: https://www.3gpp.org/ftp/Specs/archive/38 series/38.214/

[9] Signals Research Group, "5G Multi-User MIMO — it isn't just for downlink anymore," Samsung Networks White Paper, Feb. 2024, [Online]. Available: https://www.samsung.com/global/business/networks/insights/white-papers/5g-multi-user-mimo-it-isnt-just-for-downlink-anymore/.

[10] M. H. M. Costa, "Writing on dirty paper (corresp.)," IEEE Trans. Inf. Theory, vol. 29, no. 3, pp. 439–441, May 1983.

[11] L. Lu, G. Y. Li, A. L. Swindlehurst, A. Ashikhmin, and R. Zhang, "An overview of massive MIMO: Benefits and challenges," IEEE J. Sel. Top. Signal Process., vol. 8, no. 5, pp. 742–758, Oct. 2014.

[12] A. Li, Y. Ma, and R. Tafazolli, "Correlation matching pursuit for MIMO vector perturbation," in Proc. IEEE Global Commun. Conf. (GLOBECOM), Dec. 2023, pp. 6664–6669.

[13] S. Lyu and C. Ling, "Hybrid vector perturbation precoding: The blessing of approximate message passing," IEEE Trans. Signal Process., vol. 67, no. 1, pp. 178–193, Jan. 2019.

[14] S. Kasi, A. K. Singh, D. Venturelli, and K. Jamieson, "Quantum annealing for large MIMO downlink vector perturbation precoding," in Proc. IEEE Int. Conf. Commun. (ICC), Jun. 2021, pp. 1–6.

[15] S. Winter, Y. Zhang, G. Zheng, and L. Hanzo, "A lattice-reduction aided vector perturbation precoder relying on quantum annealing," IEEE Wireless Commun. Lett., vol. 13, no. 5, pp. 1225–1229, May 2024.

[16] S. Duane, A. Kennedy, B. J. Pendleton, and D. Roweth, "Hybrid Monte Carlo," Phys. Lett. B, vol. 195, no. 2, pp. 216–222, Sep. 1987.

[17] S. Kakuta, J. Hagiwara, T. Nishimura, T. Sato, Y. Ogawa, and T. Ohgane, "A study on vector perturbation method using MCMC in massive MIMO," IEICE Tech. Rep., vol. 123, no. 76, pp. 13–18, Jun. 2023, Paper RCS2023-30 (in Japanese without peer review).

[18] D. Wübben, D. Seethaler, J. Jaldén, and G. Matz, "Lattice reduction: A survey with applications in wireless communications," IEEE Signal Process. Mag., vol. 28, no. 3, pp. 70–91, May 2011.

[19] J. Hagiwara, K. Matsumura, H. Asumi, Y. Kasuga, T. Nishimura, T. Sato, Y. Ogawa, and T. Ohgane, "Near-optimal stochastic MIMO signal detection with a mixture of t-distributions prior," in Proc. IEEE Global Commun. Conf. (GLOBECOM), Dec. 2023, pp. 6627–6633.

[20] D. J. Ryan, I. B. Collings, I. V. L. Clarkson, and R. W. Heath, Jr., "Performance of vector perturbation multiuser MIMO systems with limited feedback," IEEE Trans. Commun., vol. 57, no. 9, pp. 2633–2644, Sep. 2009.

[21] A. K. Lenstra, H. W. Lenstra, Jr., and L. Lovász, "Factoring polynomials with rational coefficients," Mathematische Annalen, vol. 261, no. 4, pp. 515–534, Dec. 1982.

[22] Stan Development Team, Stan Reference Manual, Stan Development Team, 2025, version 2.37.0. [Online]. Available: https://mc-stan.org

[23] A. Gelman, J. B. Carlin, H. S. Stern, D. B. Dunson, A. Vehtari, and D. B. Rubin, Bayesian Data Analysis, 3rd ed. Boca Raton, FL, USA: CRC Press, 2013.

[24] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge, U.K.: Cambridge Univ. Press, 2005.

**本页范围与校对状态：** 本页为 arXiv:2609.23011v2 的全文中文译稿：摘要、正文第 I–V 节（含 II-A/B、III-A/B/C、IV-A–E 全部小节）、结论、表 I／表 II 逐格、图 1–5 图注、算法 1 逐行与参考文献 [1]–[24]。公式编号沿用原文 (1)–(8)；式 (8) 中的 $\overset{c}{=}$ 表示"相差一个与 $\boldsymbol\ell_{\mathrm{LR}}$ 无关的常数"（原文记法）。表 I 与表 II 已用 PDF 第 4 页渲染图逐格核对（含 $\sigma_{\mathrm{lik}}=0.72/\sqrt N$、$\sigma_{\mathrm{pri}}=2.3/N$、$\nu=1.8$、链数 5、$L_{\mathrm{HMC}}=400$）。原文无附录、无致谢/基金段落，故未设"致谢"节。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误（个别排版如 "Number of SER evaluation trials" 换行属排版问题，不影响语义）。骨架"版本"行原为 2026-09-26（收录日），已按 BRIEF2 结构改为 arXiv:2609.23011v2（2026-09-23，依据 PDF 页眉 "arXiv:2609.23011v2 [cs.IT] 23 Sep 2026"）；作者为 Junichiro Hagiwara、Toshihiko Nishimura、Yasutaka Ogawa、Takeo Ohgane；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
