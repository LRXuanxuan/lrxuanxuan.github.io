---
layout: page
title: "通过推测性草稿树加速扩散采样｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-17691-accelerating-diffusion-sampling-via-speculative-draft-trees/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/166d97b2b5641eca/) · [原文 arXiv](https://arxiv.org/abs/2609.17691) · [全部目录](/papers/catalog/)

# 通过推测性草稿树加速扩散采样

**原题：** Accelerating Diffusion Sampling via Speculative Draft Trees  
**作者：** Marcello Bullo、Yanxiao Liu、Öykü Sıla Güner、Arpan Mukherjee、Deniz Gündüz  
**单位：** 英国帝国理工学院（Imperial College London），邮箱见原文首页（m.bullo21@imperial.ac.uk 等）。  
**版本：** arXiv:2609.17691v1（cs.LG），2026-09-15，原文 38 页（含图 1—10、表 1—2、算法 1—3、附录 A—C）。  
**代码：** https://github.com/marcellobullo/tree-specdiff  
**范围与状态：** 全文中文译稿：摘要、第 1—6 节、附录 A—C、图 1—10 图注、表 1—2（逐格）、参考文献英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2609.17691，2026-09-28"；本地 PDF 为 **arXiv:2609.17691v1 [cs.LG]，2026-09-15**，"2026-09-28" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

推测采样（speculative sampling）通过草拟廉价的候选状态，并在一种精确保持目标分布的耦合下对它们进行校正，从而加速扩散模型生成，减少昂贵的目标函数评估次数。现有扩散采样器——尤其是基于**反射最大耦合（reflection maximal coupling）**的方法——在拓扑上受到约束：其前瞻草稿形成链图，即单一线性序列，这本质上限制了每次目标评估的接受率。我们把扩散模型中的推测采样与**相对熵编码（relative entropy coding，REC）**联系起来。这一视角表明前瞻不必是线性的，并由此引出我们的核心贡献——**草稿树（draft trees）**：它丰富每轮所考虑的候选状态、降低目标函数评估次数。我们进一步采用**贪婪拒绝采样（greedy rejection sampling）**这一 REC 算法作为草稿—目标耦合，在保证目标样本精确的同时提升接受率。在多种目标模型与草稿模型上的实验表明，在实用设置下相比反射耦合基线可获得最高 **8.3%** 的加速。

## 1. 引言


去噪扩散概率模型（DDPM）（Sohl-Dickstein et al., 2015; Ho et al., 2020; Song et al., 2021b）已成为高保真图像生成的主流范式。通过学习反转一个逐步加噪的过程，扩散模型经由一系列去噪步骤合成图像，把高斯噪声逐步变换为目标数据分布的样本。其卓越的生成质量使扩散模型在广泛的生成任务中成为最先进方法（Yang et al., 2023）。

然而扩散模型的一大缺点是推理代价高：图像生成需要在数十到数百次去噪迭代中反复评估大型神经网络，使采样极其缓慢。这一计算瓶颈催生了广泛的加速技术。无需训练的方法包括改进求解器以减少采样步数（Zhang and Chen, 2023; Lu et al., 2025）；基于训练的方法则学习少步生成器——或保持采样轨迹（如一致性模型（Song et al., 2023）及其二时流映射推广（Geng et al., 2026; Zhou et al., 2026; Sabour et al., 2025），近来还被扩展为学习底层 SDE 的解映射（McCallum et al., 2026）），或直接匹配输出分布（Yin et al., 2024a; Sauer et al., 2024）。这些方法虽能有效降低时延，但通常要付出额外训练成本或样本质量下降的代价（Dieleman, 2026; Lai et al., 2025）。并行模拟提供了正交的加速策略，以额外计算与内存换取更低时延（Shih et al., 2023; Tang et al., 2024; Chen et al., 2024; Zhou and Sugiyama, 2025）；尽管它降低了扩散采样的串行深度，但通常需要多轮迭代精化与大量并行资源。

近来，**推测扩散采样（speculative diffusion sampling）（De Bortoli et al., 2025）** 作为加速扩散推理的补充范式出现。受大语言模型推测解码（Leviathan et al., 2023; Chen et al., 2023）启发，这些方法先用廉价来源（称为**提议（proposal）**）生成候选去噪状态，再用目标扩散模型对其进行验证。每当多个草稿状态被接受，就实际上跳过了若干次去噪迭代，从而直接降低推理时延。关键在于，与近似加速技术不同，推测扩散采样是**精确的**：它保持目标模型的采样分布，因而不会带来图像质量损失。

尽管有这些优势，现有推测扩散采样器在根本上受拓扑约束：它们沿扩散轨迹顺序生成草稿，形成提议状态的线性链。从更广的视角看，推测采样是一个**预算分配问题**：给定固定数量的并行计算，应当如何分配提议评估以最大化接受草稿状态的概率？把提议限制为链只是可能的分配策略之一，并且会留下大量并行性未被利用——这在实际中常见的低接受率区间尤为明显。

本文朝解除这一限制迈出第一步，贡献有两点。第一，我们把推测扩散采样从线性草稿链推广到**草稿树**，使并行计算能在候选去噪轨迹之间得到丰富得多的分配。第二，我们建立了推测采样与**相对熵编码（REC）**（Li, 2024; Li and El Gamal, 2018; Flamich and Theis, 2023; Flamich, 2023）之间的新联系；该联系自然引出一种用于预算分配的**贪婪拒绝采样（GRS）**（Harsha et al., 2010）策略，为构造草稿树提供了高效且有原理的机制。大量实验表明，我们的方法一致地改进推测扩散采样：在实用批量 ≤256 的条件下，相比现有方法最多获得 **7.4%** 的加速，同时保持精确采样（见图 1）。

**图 1**：推测采样的效率前沿。该图比较在给定提议预算 $B$ 下、针对第 5.1 节设置可达到的最大加速倍数（相对标准采样器）。把预算严格分配给顺序深度时，RMC 很快在约 $2.00\times$ 处饱和；相反，D-GRS 把预算分配给每个节点的多个提议，有效提升每步接受概率。这种分支策略使 D-GRS 能把更大的预算单调地转化为可测的加速，最高可比 RMC 减少 14% 的目标模型评估。

## 2. 问题设定

**DDPM**：DDPM 定义一个固定的前向扩散过程，用高斯噪声逐步扰动数据样本。设 $X_0\sim p_{\mathrm{data}}$ 为数据样本，前向过程 $(X_t)_{t\in[0,1]}$ 按随机微分方程（SDE）

$$
\mathrm dX_t=f_t(X_t)\,\mathrm dt+g_t\,\mathrm dB_t\tag{1}
$$

演化，其中 $(B_t)_{t\in[0,1]}$ 为 $d$ 维布朗运动。图像生成通过模拟相应的逆时过程 $(Y_t)_{t\in[0,1]}$ 完成，该过程满足

$$
\mathrm dY_t=b_t^q(Y_t)\,\mathrm dt+\varepsilon g_{1-t}\,\mathrm dW_t\tag{2}
$$

$$
b_t^q(x)=-f_{1-t}(x)+\frac{1+\varepsilon^2}{2}g_{1-t}^2s_{1-t}(x),\tag{3}
$$

其中 $(W_t)_{t\in[0,1]}$ 为 $d$ 维布朗运动，$s_t(x)$ 为 Stein 分数函数，$\varepsilon\in[0,1]$ 为**搅动（churn）参数**，控制逆过程的随机性。特别地，$\varepsilon=1$ 恢复标准逆时 SDE，而 $\varepsilon=0$ 给出确定性概率流常微分方程（ODE）。为模拟该逆过程，引入均匀时间网格

$$
t_n=n\gamma,\qquad n=0,\ldots,N,\qquad \gamma=\frac{1}{N},
$$

并记 $Y_n:=Y_{t_n}$。应用 Euler–Maruyama 离散化（$\xi_n\sim\mathcal N(0,\mathbf I_d)$）得

$$
Y_{n+1}=Y_n+\gamma b_{t_n}^q(Y_n)+\sqrt{\gamma}\varepsilon g_{1-t_n}\xi_n.\tag{4}
$$

因此，在给定 $Y_n=y_n$ 条件下，下一状态服从 $Y_{n+1}\mid Y_n=y_n\sim\mathcal N\left(m_n^q(y_n),\sigma_n^2\mathbf I_d\right)$，其中

$$
m_n^q(y):=y+\gamma b_{t_n}^q(y),\qquad \sigma_n:=\sqrt{\gamma}\varepsilon g_{1-t_n}.\tag{5}
$$

等价地，记目标转移核为 $Q_n(\cdot\mid y_n)$，有 $Q_n(\cdot\mid y_n)=\mathcal N\left(m_n^q(y_n),\sigma_n^2\mathbf I_d\right)$，且离散逆过程构成联合密度为

$$
q(y_0,\ldots,y_N)=q_0(y_0)\prod_{n=0}^{N-1}q_n(y_{n+1}\mid y_n)\tag{6}
$$

的马尔可夫链，其中 $q_0$ 为逆过程的初始高斯密度。

**推测扩散采样**：扩散推理的主要计算瓶颈是反复评估逆漂移 $b_{t_n}^q$，它由大型神经网络参数化。由于 Euler–Maruyama 模拟是顺序进行的，每个状态 $Y_{n+1}$ 依赖在前一状态 $Y_n$ 处评估的逆漂移，限制了现代并行硬件的利用。推测扩散采样通过利用并行计算解决该瓶颈：它并非一次模拟一个去噪步，而是由廉价的**提议模型**先生成多个草稿状态。推测采样的关键假设是**草拟远比验证便宜**。草拟出的状态随后用目标逆漂移并行验证。因此给定并行计算预算 $B$，一次批处理的目标模型评估（对应一次神经函数评估，NFE）即可验证全部提议草稿。

推测采样的有效性关键取决于提议模型的质量：更好的提议带来更高接受率，使每次 NFE 能推进更多去噪步，从而在保持精确采样的同时提升总体加速。现有推测扩散方法（De Bortoli et al., 2025）考虑两种提议机制：第一种训练轻量扩散模型近似目标逆漂移；第二种称为**延迟逆漂移（delayed reverse drift）**，无需额外训练，用较早状态处评估的逆漂移替代当前逆漂移。具体地，目标转移均值 $m_n^q(y_n)=y_n+\gamma b_{t_n}^q(y_n)$ 由提议均值

$$
m_n^p(y_n)=y_n+\gamma b_{t_k}^q(y_k),\qquad k<n,\tag{7}
$$

近似，同时保持相同转移方差 $\sigma_n^2=\gamma\varepsilon^2g_{1-t_n}^2$。经验上，延迟逆漂移已被证明比轻量草稿模型产生更高质量的提议（De Bortoli et al., 2025）；因此本文自始至终采用它作为提议机制。


## 3. 推测算法

本节先陈述两种算法共同实例化的通用模板，再回顾（De Bortoli et al., 2025）的反射最大耦合（RMC）算法，最后介绍我们的扩散贪婪拒绝采样（D-GRS）算法。概括而言，每种推测采样算法都包含三个阶段：**草拟阶段**、**验证阶段**与**接受阶段**。给定并行计算预算，草拟阶段按规定的草稿拓扑顺序生成候选状态，验证阶段用目标模型并行评估全部草拟状态，接受阶段则顺序检查已验证状态以确定某提议能否作为下一目标状态被接受。因此，推测采样算法的主要差别在于**草稿拓扑**的选择与验证后所用**接受准则**的不同。

RMC 与 D-GRS 都依赖如下共同的一维约化，它利用各向同性高斯分布的平移与旋转不变性。下文用 $\hat Y$（或 $\hat S$）表示提议状态，用 $Y$（或 $S$）表示被接受的目标状态。

### 3.1 推测扩散的通用模板

我们从通用流程开始，使本节两种算法只在本文所变化的两处组件上不同：**草稿拓扑**与**验证规则**。该模板与提议如何产生无关，见算法 1。

**设定**：固定从第 $n$ 步开始的一轮。模板只要求草稿转移与目标转移是共享方差计划、仅均值不同的各向同性高斯：

$$
P_n(\cdot\mid y)=\mathcal N\left(m_n^p(y),\sigma_n^2\mathbf I_d\right),\qquad Q_n(\cdot\mid y)=\mathcal N\left(m_n^q(y),\sigma_n^2\mathbf I_d\right),\tag{8}
$$

其中 $m_n^q$ 如（5），$m_n^p$ 任意。这正是 3.1.4 节中秩 1 约化所利用的结构，因此下文算法 2 与算法 3 可在每个节点上原样适用。

**草稿拓扑**：**节点**是某一状态在某一时间步的一个候选实现；其深度为实现的时间步，其父节点为其所条件化的状态。由于逆链具有马尔可夫性，每个节点恰好条件化于一个父节点，因此草稿集总带有有根树的结构，我们即以这样的树作为草稿拓扑的一般描述。

**草稿树**是有限有根树 $T=(\mathcal V,\mathrm{pa})$，具有顶点集 $\mathcal V$、根 $r$ 与父映射 $\mathrm{pa}:\mathcal V\setminus\{r\}\to\mathcal V$。记 $C(u):=\mathrm{pa}^{-1}(u)$ 为 $u$ 的子节点，$|u|$ 为其深度，并记

$$
\mathcal V_0=\{r\},\qquad \mathcal V_\ell:=\{u\in\mathcal V:|u|=\ell\},\qquad \mathcal I(T):=\{u\in\mathcal V:C(u)\neq\varnothing\}\tag{9}
$$

为各层与内部节点。根持有最近接受的状态 $\hat Y_r=Y_n$，非根节点 $u\neq r$ 持有草拟状态 $\hat Y_u$，即第 $n+|u|$ 步的候选实现。草拟状态数为 $|\mathcal V|-1$，目标模型可在全部树节点 $u\in\mathcal V$ 上评估，也可只在内部节点 $u\in\mathcal I(T)$ 上评估。

一个节点的子节点是**同一步**的独立同分布候选，验证至多保留其中一个。由于被接受的候选节点完全在验证阶段才确定，提议机制必须穷举展开所有兄弟分支。本文使用的均匀 $(K,L)$ 族即 $|C(u)|=K$（对所有深度不超过 $L-1$ 的 $u$），且 $\ell>L$ 时 $\mathcal V_\ell=\varnothing$。因此 $|\mathcal V_\ell|=K^\ell$ 且

$$
|\mathcal I(T)|=\sum_{\ell=0}^{L-1}K^\ell,\qquad |\mathcal V|=\sum_{\ell=0}^{L}|\mathcal V_\ell|=\sum_{\ell=0}^{L}K^\ell.\tag{10}
$$

在验证阶段，若目标模型在 $u\in\mathcal V$ 上评估，则一轮代价为 $B=|\mathcal V|$ 次目标评估；若在 $u\in\mathcal I(T)$ 上评估，则为 $B=|\mathcal I(T)|$。RMC 的链对应 $K=1$ 的特殊情形，而单节点提议列表对应 $L=1$。深度相关宽度 $K_\ell$ 或不规则树（如剪枝树）可直接由 $T$ 覆盖，后文无需改动。

记 $\mathcal V_{\le m}:=\bigcup_{\ell=0}^{m}\mathcal V_\ell$ 为深度不超过 $m$ 的节点集，并记

$$
T|_m:=T\left[\mathcal V_{\le m}\right]=\left(\mathcal V_{\le m},\mathrm{pa}|_{\mathcal V_{\le m}\setminus\{r\}}\right)\tag{11}
$$

为 $T$ 由 $\mathcal V_{\le m}$ 诱导的子树。因此从第 $n$ 步开始的一轮在 $T|_{L_n}$ 上运行，其中 $L_n:=\min\{L,N-n\}$，除最后少数几轮外均等于 $T$。

**轮次结构**：算法 1 描述任意草稿树 $T$ 下的推测扩散采样流程，每次迭代包含三个不同阶段。

1. **草拟阶段**对树进行逐层展开：该展开在深度方向上严格串行（子节点不能先于其父节点采样），但同一深度层的全部节点并行生成。
2. **验证阶段**通过统一的批处理运算计算当前树全部内部节点的目标均值，这是一次迭代中唯一一次目标模型评估。
3. 最后，**接受阶段**从根节点向下遍历，在每个深度层迭代应用验证准则，并在遇到第一次拒绝时立即终止。

验证规则记作 $\mathrm{Verify}$，是该框架中的模块化组件，受如下形式化约定约束。给定父节点 $u$、其关联的提议均值与目标均值、相应步长尺度、以及其草拟子节点集 $\{\hat Y_v\}_{v\in C(u)}$，规则输出元组 $(Y,\text{accepted},v^\star)$。其主要成分 $Y$ 是从目标转移分布 $Y\sim Q(\cdot\mid \hat Y_u)$ 抽取的精确样本，可通过两种互斥机制之一获得：或者识别出有效子节点，此时布尔标志 accepted 为真且 $Y=\hat Y_{v^\star}$（某 $v^\star\in C(u)$）；或者若无子节点满足准则，则 accepted 为假，$Y$ 改从下文（17）式给出的归一化残差分布抽取。算法 3 对任意分支因子 $K\ge1$ 满足该约定，而算法 2 专门用于 $K=1$。

模板恰好留有两个自由组件：草稿拓扑 $T$ 与验证规则 $\mathrm{Verify}$。本节余下部分对二者进行实例化：RMC 取 $T$ 为链（$K=1$）、$\mathrm{Verify}$ 为（De Bortoli et al., 2025）的反射最大耦合；D-GRS 取 $T$ 为 $K$ 叉树、$\mathrm{Verify}$ 为我们提出的 D-GRS 算法。二者都依赖如下共同的一维约化，它利用各向同性高斯分布的平移与旋转不变性。

**算法 1**　任意草稿树 $T$ 下的推测扩散采样

**要求**：草稿与目标均值函数 $m^p$、$m^q$，尺度 $\{\sigma_n\}$，时域长度 $N$，深度为 $L$ 的草稿树 $T=(\mathcal V,\mathrm{pa})$，规则 $\mathrm{Verify}$
**保证**：轨迹 $Y_{1:N}$ 服从目标链的分布（6）
1: $n\leftarrow0$；$Y_0\sim q_0$
2: **while** $n<N$ **do**
3: 　$L_n\leftarrow\min\{L,N-n\}$，$\hat Y_r\leftarrow Y_n$，$T_n\leftarrow T|_{L_n}$，$\mathcal I_n\leftarrow\mathcal I(T_n)$
4: 　// 阶段 1 —— 草拟
5: 　**for** $\ell=1$ **to** $L_n$ **do**
6: 　　**for** 所有 $u\in\mathcal V_{\ell-1}$ 并行 **do**
7: 　　　$(\hat Y_v)_{v\in C(u)}\overset{\mathrm{i.i.d.}}{\sim}\mathcal N\left(m_{n+\ell-1}^p(\hat Y_u),\sigma_{n+\ell-1}^2\mathbf I_d\right)$
8: 　　**end for**
9: 　**end for**
10: 　// 阶段 2 —— 验证
11: 　**for** 所有 $u\in\mathcal I_n$ 并行 **do**
12: 　　评估 $m_{n+|u|}^q(\hat Y_u)$
13: 　**end for**
14: 　// 阶段 3 —— 接受
15: 　$u\leftarrow r$；$N_\alpha\leftarrow0$
16: 　**for** $\ell=1$ **to** $L_n$ **do**
17: 　　$(Y_{n+\ell},\text{accepted},v^\star)\leftarrow\mathrm{Verify}\left(m_{n+\ell-1}^p(\hat Y_u),m_{n+\ell-1}^q(\hat Y_u),\sigma_{n+\ell-1};\{\hat Y_v\}_{v\in C(u)}\right)$
18: 　　**if** not accepted **then**
19: 　　　$N_\alpha\leftarrow N_\alpha+1$
20: 　　　**break**
21: 　　**end if**
22: 　　$N_\alpha\leftarrow N_\alpha+1$；$u\leftarrow v^\star$
23: 　**end for**
24: 　$n\leftarrow n+\min\{N_\alpha,L_n\}$
25: **end while**
26: **return** $Y_{1:N}$

**3.1.4 秩 1 投影**：由于提议 $P:=\mathcal N(\mu_p,\sigma^2\mathbf I_d)$ 与目标 $Q:=\mathcal N(\mu_q,\sigma^2\mathbf I_d)$ 是仅均值不同的各向同性高斯，可把 $d$ 维耦合约化到一维。令

$$
\Delta:=(\mu_q-\mu_p)/\sigma,\qquad \delta:=\|\Delta\|,\qquad e:=\Delta/\delta\tag{12}
$$

分别为归一化均值位移、其欧氏范数与相应单位向量。把状态 $Y$ 标准化为 $Z:=(Y-\mu_p)/\sigma$，则在 $P$ 下 $Z\sim\mathcal N(0,\mathbf I_d)$、在 $Q$ 下 $Z\sim\mathcal N(\delta e,\mathbf I_d)$。注意任意实现 $z\in\mathbb R^d$ 都有正交分解

$$
z=\underbrace{ee^\top z}_{s}+\underbrace{(\mathbf I_d-ee^\top)z}_{z_\perp}.\tag{13}
$$

在两种分布下，随机变量 $S:=e^\top Z$ 与 $Z_\perp$ 相互独立，且正交残差 $Z_\perp\sim\mathcal N(0,\mathbf I_d-ee^\top)$；只有标量投影不同：在 $P$ 下 $S\sim\mathcal N(0,1)$，在 $Q$ 下 $S\sim\mathcal N(\delta,1)$。因此给定提议样本 $\hat Y\sim P$，要从 $Q$ 精确采样，只需把标量投影 $\hat S$ 由 $\mathcal N(0,1)$ 变换为 $\mathcal N(\delta,1)$，同时保持提议的正交分量 $Z_\perp$ 不变：

$$
\hat S:=e^\top(\hat Y-\mu_p)/\sigma,\qquad Z_\perp=(\mathbf I_d-ee^\top)(\hat Y-\mu_p)/\sigma.\tag{14}
$$

一旦得到有效的目标标量 $S\sim\mathcal N(\delta,1)$，最终状态重构为

$$
Y=\mu_p+\sigma(Se+Z_\perp).\tag{15}
$$

RMC 与 GRS 的主要区别之一即在于如何把 $\hat S\sim\mathcal N(0,1)$ 变换为 $S\sim\mathcal N(\delta,1)$。

### 3.2 反射最大耦合（RMC）

RMC（De Bortoli et al., 2025）用**链式拓扑**与**反射最大耦合**实例化推测采样框架。具体地，草拟阶段顺序生成 $L$ 个提议状态构成的链，$L$ 称为**前瞻（lookahead）**；在接受阶段，每个提议与相应目标转移进行最大耦合，从而使拒绝草拟状态的概率最小。

给定提议 $\hat Y$，RMC 先用（12）与（14）把它分解为沿位移方向的标量提议 $\hat S$ 与正交分量 $Z_\perp$。该标量提议以等于目标—提议似然比（上限为 1）的概率被接受：若接受，RMC 保留 $\hat S$ 并继续处理链中下一提议；否则从残差分布抽取精确样本并终止当前推测轨迹，随后再草拟新的前瞻链。对协方差相同的高斯提议与目标分布，残差采样有简单的几何实现：把被拒绝的标量提议关于提议均值与目标均值的中点做反射，所得标量与不变的正交分量组合即重构出目标分布的精确样本。完整流程见算法 2，其中 $\phi$ 表示标准高斯密度函数；第 8 行通过把 $\hat S$ 关于中点 $\delta/2$ 反射（得 $S=\delta-\hat S$）获得残差样本。

**RMC 的缺点**：尽管简单且精确，RMC 在根本上受其链式拓扑限制。给定 $B$ 次草稿评估的固定并行计算预算，RMC 把全部预算分配给长度为 $B$ 的单一前瞻轨迹（取 $L=B$）。因此若某提议在接受阶段早期被拒绝，其后全部草拟状态都不可用而被丢弃，造成可用并行计算预算的利用不足。随着计算预算增大，这种低效越发明显。为更好利用并行性，我们改为提出基于树的草稿拓扑，把同一预算分配到多条推测轨迹上，如下所述。

**算法 2**　反射最大耦合（RMC）

**要求**：提议样本 $\hat Y\sim P=\mathcal N(\mu_p,\sigma^2\mathbf I_d)$；目标均值 $\mu_q$；共享尺度 $\sigma$
**保证**：目标样本 $Y\sim Q=\mathcal N(\mu_q,\sigma^2\mathbf I_d)$；接受指示 $\text{accepted}\in\{\text{true},\text{false}\}$
1: 由（12）与（14）得到 $(\hat S,Z_\perp,\delta,e)$　// 秩 1 投影
2: $R\leftarrow\dfrac{\phi(\hat S-\delta)}{\phi(\hat S)}$　// 目标—提议似然比
3: $U\sim\mathrm{Uniform}[0,1]$
4: $\text{accepted}\leftarrow\mathbb 1\{U\le 1\wedge R\}$
5: **if** not accepted **then**
6: 　$\hat S\leftarrow\delta-\hat S$　// 关于 $\delta/2$ 反射 $\hat S$
7: **end if**
8: $Y\leftarrow\mu_p+\sigma(\hat Se+Z_\perp)$　// $Y\sim Q$
9: **return** $Y,\text{accepted},1$

**图 2**：在 $B=|\mathcal V|$ 下链式与树式草拟对固定计算预算的分配。给定 $W=7$ 个状态的计算预算，RMC 构造单条提议链；若早期提议被拒绝，其下游全部提议都不可用并被丢弃。相反，D-GRS 构造 $K$ 叉草稿树（此处 $K=2$、$L=2$），在每一层可在多个候选状态中选择，从而提升至少一个提议被接受的概率。

### 3.3 扩散贪婪拒绝采样（D-GRS）

GRS 在草拟拓扑以及由此决定的接受准则两方面都与 RMC 有根本不同。

**拓扑**：RMC 所用的链只是固定并行计算预算的一种可能分配。为更有效利用该预算，我们引入基于草稿树的更灵活拓扑，如图 2 所示。$K$ 叉草稿树把每个非叶节点展开为 $K$ 个子节点，每个子节点代表下一目标状态的一个候选实现。设草拟从时间步 $n$ 开始，$Y_n$ 为当前已被接受的目标状态（来自前一草稿树或残差采样）。我们把 $Y_n$ 视为树的根，从时间 $n+1$ 的提议转移核中抽取 $K$ 个条件独立同分布提议；每个所得提议再递归展开为 $K$ 个子节点，得到不含根的 $L$ 层树。定义 $W$ 为单次并行批处理可容纳的目标评估数，则 $(K,L)$ 必须满足

$$
B\le W,\tag{16}
$$

其中依据验证模式取 $B=|\mathcal V|$ 或 $B=|\mathcal I(T)|$。

草拟期间，给定层的每个节点使用由已在树根 $Y_n$ 处评估的目标逆漂移构造的提议转移生成 $K$ 个子节点。由于目标模型尚未在中间父状态处评估，整个草稿树中复用同一根漂移。以某父状态为条件，其 $K$ 个子节点从该延迟漂移提议核独立采样。整棵树构造完成后，全部草拟状态并行送入目标模型，得到验证所需的各父节点对应逆漂移。

**接受**：树拓扑的引入从根本上改变了接受问题。与 RMC 中每个提议状态都单独通过最大耦合与目标耦合不同，基于树的推测采样需要**从提议列表中选取一个状态**并与目标耦合，这自然引出**列表耦合（list-coupling）**问题。更精确地说，最大耦合最小化单个提议 $\hat Y\sim P$ 与目标样本 $Y\sim Q$ 之间的 Hamming 代价 $\mathbb 1\{\hat Y\neq Y\}$；而在草稿树的每个节点，我们给定 $K$ 个条件独立同分布提议 $\hat Y_1,\ldots,\hat Y_K\sim P$，希望找到使成员代价 $\mathbb 1\{Y\notin\{\hat Y_1,\ldots,\hat Y_K\}\}$ 最小的耦合。Sun et al. (2023) 的最优传输表述刻画了使该代价最小的耦合；但计算最优传输计划需要在目标域上求解线性规划，其复杂度随提议数 $K$ 指数增长——这对有限离散状态空间都已昂贵，也无法直接可处理地推广到连续扩散转移。语言模型语境下已研究过计算高效的列表耦合方法（综述见附录），但这些方法对连续扩散模型不再保持计算可处理性。

作为变通，我们从与推测采样密切相关的**相对熵编码（REC）**（Li, 2024; Flamich and Gündüz, 2026）中汲取灵感（如下文所述）。REC 是一类解决**远程采样**问题的算法：持有目标分布 $Q$ 与提议分布 $P$ 的发送方向接收方传递一个索引，接收方共享 $P$，从而能够复现 $Q$ 的**精确样本**。该索引的基本通信代价（忽略低阶项）由相对熵 $D_{\mathrm{KL}}(Q\|P)$ 决定，故名 REC。相应地，REC 实现（可基于泊松过程（Li and El Gamal, 2018; Liu et al., 2024）、抖动量化（Zamir and Feder, 1992）或拒绝采样（Harsha et al., 2010; Flamich and Theis, 2023; Flamich, 2023））需要检查 $\tilde\Omega(\exp(D_{\mathrm{KL}}(Q\|P)))$ 个共享提议才能确定被通信的样本。这一视角与推测采样平行：两个问题都试图把提议样本与精确目标样本耦合，并最大化从可用提议中恢复目标的概率。RMC 优化以全变差距离度量的单提议重叠，而 REC 算法通过处理**有序序列**的提议样本构造精确耦合。受此联系启发，我们把无约束的列表耦合问题替换为**保序的序列耦合（sequence-coupling）**问题：列表耦合中 $K$ 个提议可不考虑顺序地联合匹配目标，而序列耦合按采样顺序检查提议，并选择第一个满足接受规则的提议。我们随后把 Harsha et al. (2010) 通信协议中底层的 GRS 过程适配到连续扩散转移，并嵌入草稿树拓扑。

在每个节点，GRS 顺序检查 $K$ 个已验证子节点，贪心地把尽可能多的剩余目标质量分配给每个提议，并接受由所得耦合选出的第一个提议。若 $K$ 个子节点都未被接受，算法从剩余目标残差中采样并终止当前推测路径。更具体地，GRS 维护标量水平序列 $\{\lambda_k\}_{k=0}^{K}$ 与残差质量 $\{G_k\}_{k=1}^{K+1}$：$\lambda_k$ 记录目标—提议似然比中已分配给前 $k$ 个提议的部分，$G_{k+1}$ 表示第 $k$ 轮后尚未分配的目标质量。初始时尚未分配目标质量，故 $\lambda_0=0$、$G_1=1$。令 $\rho(s):=\frac{\mathrm dQ}{\mathrm dP}(s)=\frac{\phi(s-\delta)}{\phi(s)}$ 为一维坐标中的目标—提议似然比。在第 $k$ 轮，GRS 只考虑 $\rho(\hat S_k)$ 中高于已分配水平 $\lambda_{k-1}$ 的部分，因此提议以概率

$$
\beta_k:=1\wedge\frac{(\rho(\hat S_k)-\lambda_{k-1})_+}{S_k}
$$

被接受。这贪心地把剩余目标质量中可容许的最大切片分配给当前提议，同时保证接受概率不超过 1。若提议被拒绝，则把已分配水平提高到 $\lambda_k=\lambda_{k-1}+G_k$，由此诱导超水平集

$$
H_k=\{s\in\mathbb R:\rho(s)\ge\lambda_k\}.
$$

剩余目标质量为 $G_{k+1}=Q(H_k)-\lambda_kP(H_k)$。经过 $K$ 次未成功后，GRS 从密度为

$$
r_{K+1}(s)=\frac{(q(s)-\lambda_Kp(s))_+}{G_{K+1}}\tag{17}
$$

的归一化残差测度采样，从而保持精确性。D-GRS 流程见算法 3。

**算法 3**　扩散贪婪拒绝采样（D-GRS）

**要求**：提议 $\hat Y_{1:K}\overset{\mathrm{i.i.d.}}{\sim}P=\mathcal N(\mu_p,\sigma^2\mathbf I_d)$；目标均值 $\mu_q$；共享尺度 $\sigma$
**保证**：目标样本 $Y\sim Q=\mathcal N(\mu_q,\sigma^2\mathbf I_d)$；接受指示 $\text{accepted}\in\{\text{true},\text{false}\}$
1: **for** $k=1$ **to** $K$ **do**
2: 　由（12）与（14）得到 $(\hat S_k,Z_{\perp,k},\delta,e)$　// 秩 1 投影
3: **end for**
4: $\lambda_0\leftarrow0$，$S_1\leftarrow1$
5: **for** $k=1$ **to** $K$ **do**
6: 　$\rho_k\leftarrow\dfrac{\phi(\hat S_k-\delta)}{\phi(\hat S_k)}$，$\beta_k\leftarrow1\wedge\dfrac{(\rho_k-\lambda_{k-1})_+}{S_k}$
7: 　$U_k\sim\mathrm{Uniform}[0,1]$
8: 　**if** $U_k\le\beta_k$ **then**
9: 　　$Y\leftarrow\mu_p+\sigma(\hat S_ke+Z_{\perp,k})$
10:　　$\text{accepted}\leftarrow\text{true}$
11:　　**return** $Y,\text{accepted},k$
12:　**end if**
13:　$\lambda_k\leftarrow\lambda_{k-1}+G_k$
14:　$H_k\leftarrow\{s\in\mathbb R:\rho(s)\ge\lambda_k\}$
15:　$G_{k+1}\leftarrow Q(H_k)-\lambda_kP(H_k)$　// 剩余目标质量
16: **end for**
17: $S\sim r_{K+1}$（按（17）定义）
18: $Y\leftarrow\mu_p+\sigma(Se+Z_{\perp,1})$
19: $\text{accepted}\leftarrow\text{false}$
20: **return** $Y,\text{accepted},K+1$

## 4. 性能分析

本节给出所提 D-GRS 算法的性能分析，并与 RMC 基线比较。具体地，我们证明 D-GRS 的**精确性**并计算其**接受概率**，完整证明见附录 B。

**定理 1（精确性）**：目标分布 $Q=\mathcal N(\mu_q;\sigma^2\mathbf I_d)$ 下算法 3 的输出 $Y$ 满足 $Y\sim Q$。

该证明来自 GRS 的残差测度刻画（Flamich and Theis, 2023, Lemmas III.1-2）：可显式计算前 $K$ 个提议分支产生的目标质量，以及从其归一化残差分布所取样本的贡献量；提议分支与残差分支合起来精确恢复目标分布 $Q$。下面显式刻画算法 3 至少接受一个草拟子节点的概率。

**定理 2（接受概率）**：记 $\delta:=\frac{\|m_q-m_p\|_2}{\sigma}$。对算法 3，至少接受 $K$ 个提议之一的概率为

$$
\mathbb P\left(\exists k\in\{1,\cdots,K\}:Y=\hat Y_k\right)=1-G_{K+1}.\tag{18}
$$

此外，对任意 $\delta\in\mathbb R_+$ 有

$$
G_{K+1}=\bar\Phi\left(\frac{1}{\delta}\ln\lambda_K-\frac{\delta}{2}\right)-\lambda_K\bar\Phi\left(\frac{1}{\delta}\ln\lambda_K+\frac{\delta}{2}\right),\tag{19}
$$

其中 $\bar\Phi(x)$ 为标准高斯生存函数。

注意取 $K=1$、$\delta\in\mathbb R_+$ 时得

$$
\mathbb P\left(\exists k\in\{1,\cdots,K\}:Y=\hat Y_k\right)=2\bar\Phi\left(\frac{\delta}{2}\right),\tag{20}
$$

即 RMC（De Bortoli et al., 2025, Proposition 3.1）所达到的最大耦合的**最优**接受概率。不同 $K$ 值下的每步接受概率绘于附录 B.2 的图 6。

## 5. 实验

我们在三类生成任务上评估 D-GRS 相对 RMC 的性能：(i) 利用解析可处理分数的混合高斯目标上的扩散采样；(ii) 像素空间生成，包括 CIFAR-10（$32\times32$）（Krizhevsky and Hinton, 2009）的条件采样与 FFHQ（$64\times64$）（Karras et al., 2019）的无条件采样；(iii) 通过 Stable Diffusion 3（SD3）（Esser et al., 2024）的文本到图像潜空间采样。

**协议**：在 $B=|\mathcal V|$ 下按（De Bortoli et al., 2025）的**自推测（self-speculative）**机制评估所有方法。具体地，草稿直接由目标去噪器构造：冻结在推测树根处（RMC 中为窗口头部）计算的速率场，并在整个草稿轨迹中复用它。采样遵循线性概率路径 $x_\sigma=(1-\sigma)x_0+\sigma\xi$（$\xi\sim\mathcal N(0,\mathbf I_d)$）的 Euler–Maruyama 离散化，随机性水平（搅动）$\varepsilon\in(0,1]$（脚注 1）。

> **脚注 1**：$\varepsilon=0$ 恢复确定性流采样器，此时接受概率降为零，推测随之失效。

**代价度量与匹配预算**：沿用（De Bortoli et al., 2025），我们以 NFE 度量计算代价。为在每次目标调用等代价下比较 D-GRS 与 RMC，我们把每个 D-GRS 配置 $(K,L)$ 与长度为 $B$ 的 RMC 链对比。因此两种方法每轮处理相同规模 $B$ 的验证批，只在结构分配上不同；于是提议预算 $B$ 在全部比较中自然充当横轴。所有代价以每条轨迹/图像的期望 NFE 报告。

### 5.1 混合高斯目标

**设置**：我们复现（De Bortoli et al., 2025, App. I.2）的低维设置。目标为 $\mathbb R^d$（$d=500$）中 5 个各向同性高斯的混合，$\mu_i\sim U([-2,2]^d)$、$\sigma_i\sim U([0.10,0.25])$ 由固定随机种子抽取一次后在全部运行中保持不变。我们使用**精确速率场**——在线性概率路径下它有闭式表达。采用 $T=30$ 个生成步、随机性 $\varepsilon=0.1$，扫描完整网格 $L\in\{2,\ldots,7\}\times K\in\{1,\ldots,7\}$，每个网格点运行 100 条独立轨迹。加速倍数相对标准采样器的参考代价 $(K,L)=(1,1)$ 报告，后者每条轨迹花费 30 次目标调用。

**结果**：图 3 给出 $(K,L)$ 网格与相应预算 $B$ 下的期望加速。RMC 的加速在跨越六个数量级的 $B$ 上都在 $\approx1.96\times$—$2.00\times$ 处趋于平台，受其线性顺序前瞻的几何衰减所限。相反，D-GRS 把预算分配给每节点 $K$ 个提议以提升每步接受率，避免了前瞻扩展的快速饱和。对 $L\ge3$，D-GRS 严格占优，在 $(6,6)$ 处给出 $2.33\times$ 加速而 RMC 为 $1.99\times$。总体上，D-GRS 在不牺牲精确性的前提下把目标调用减少 8—9%（$B=155$ 时 $2.14\times$ vs. $1.96\times$）。

**图 3**：混合高斯设置下、每个 $(K,L)$ 组合 100 条独立轨迹的期望加速。RMC（左）在整个网格上性能均匀，而 D-GRS（右）随预算更多分配给宽度 $K$ 而稳定提升。

### 5.2 像素空间扩散

对像素空间中的条件与无条件扩散采样，我们采用 Karras et al. (2022) 提供的预训练去噪器。在时间步 $t$，模型 $D_\theta(x_t;\varsigma)=\mathbb E[x_0\,|\,x_t=x_0+\varsigma\xi]$ 从被噪声尺度 $\varsigma$ 的标准高斯噪声 $\xi$ 扰动的含噪观测 $x_t$ 估计无噪数据 $x_0$。为把该去噪器纳入我们的设置，我们沿线性插值把它改写为速率场 $v_\theta(x_t,t)$：取 $\varsigma=t/(1-t)$ 时，速率场计算为 $v_\theta(x_t,t)=\frac{1}{t}\left(x_t-D_\theta\left(\frac{x_t}{1-t};\frac{t}{1-t}\right)\right)$。最后为保证生成过程中的数值稳定性，所评估的噪声尺度被截断到 $\varsigma\in[10^{-3},80]$，严格保持在原模型的原生采样范围内。

**实验设置**：每个采样器在 100 个时间步上生成 100 张图像。对 CIFAR-10，生成以从十个可用类别中均匀随机抽取的标签为条件。我们评估四组配置 $(K,L)\in\{(2,3),(2,5),(3,4),(4,4)\}$，对应计算预算 $B\in\{14,62,120,340\}$，RMC 在匹配窗口 $(1,B)$ 上运行。该流程在三个随机性水平 $\varepsilon\in\{0.1,0.3,0.6\}$ 上重复。图 4 展示相对基线标准采样器（每张图像固定 100 次 NFE）的加速均值与标准差。

**结果**：图 4 报告两个空间分辨率不同的数据集上每张图像的 NFE 加速随计算预算 $B$ 的变化：CIFAR-10（$32\times32$，上排）与 FFHQ（$64\times64$，下排）。在两个任务上，增大搅动水平都会降低两种方法的采样效率：更高的随机性增大草稿与目标转移核之间的差异，使二者均值差距扩大，从而降低两种耦合机制的采样接受率。

在 CIFAR-10 上，RMC 在最小预算（$B=14$）处表现出微弱经验优势：其线性顺序拓扑相比树的浅层分支获得了更大的有效深度。但当 $B\ge62$ 时效率趋势反转：RMC 遭受平台化扩展，给出与 $B$ 无关的固定加速；而 D-GRS 有效利用其推测树拓扑，保持单调递增的加速。在更高维的 FFHQ 基准上，绝对加速本就更小（$\approx2.0$—$2.2\times$，低于 CIFAR-10 的 $2.2$—$2.6\times$），因为草稿与目标核之间的均值差异随 $\sqrt d$ 增大。关键在于，D-GRS 的相对优势在该高维区间变为绝对优势，在每个测试预算与搅动水平上都严格占优。为经验验证精确性，我们在 $K=2$、$L=3$、$\varepsilon=0.3$ 下生成 50,000 个样本并评估 FID：在 CIFAR-10 上 D-GRS 与 RMC 分别达到 1.824 与 1.822，紧贴 Karras et al. (2022) 的 1.79 基线；在 FFHQ 上二者分别为 2.86 与 2.88，与 2.39 基线（Karras et al., 2022）相当但略高。

**图 4**：CIFAR-10（上）与 FFHQ（下）上不同随机性 $\epsilon\in\{0.1,0.3,0.6\}$ 时 NFE 加速相对提议预算 $B$ 的变化。

### 5.3 高维潜空间扩散

Stable Diffusion 3.5（SD3）（脚注 2）原生通过 rectified flow 训练，因而依赖 ODE 积分，其转移为确定性点质量。于是草稿与目标提议的全变差距离为 1，推测随之失效。我们通过沿相同线性概率路径从保持边缘分布的 SDE 族中采样来解决该问题，无需重新训练。分数由速率直接计算为 $s_\theta=-(x_\sigma+(1-\sigma)v_\theta)/\sigma$。加入漂移 $-\frac{1}{2}\varepsilon^2g^2s_\theta$（其中 $g^2(\sigma)=2\sigma/(1-\sigma)$）与尺度 $\varepsilon g$ 的噪声可确保每个边缘分布 $p_\sigma$ 保持不变。在 Euler–Maruyama 离散化下，每步得到高斯核 $\mathcal N(m,\varsigma^2\mathbf I)$。由于标准差 $\varsigma=\varepsilon g\sqrt{-\gamma}$ 仅是时间计划的函数，草稿核与目标核**只在均值上**不同——这正是我们耦合框架所需的精确数学结构。详细推导见附录 C.3。

> **脚注 2**：该模型在 Huggingface 上以 `stabilityai/stable-diffusion-3.5-medium` 公开提供。

**实验设置**：我们在 $512\times512$ 上评估高分辨率生成，采用 $T=50$ 个生成步、免费引导尺度 7.0、随机性水平 $\varepsilon=0.8$；为使原生分辨率适配我们的设置，采用 3.0 的时间步偏移。整个仿真中固定前瞻 $L=2$，扫描分支因子 $K\in\{2,3,4,5,6,7\}$，对应预算 $B\in\{6,12,20,30,42,56\}$。生成采样在维数 $d=16\times64\times64=65{,}536$ 的 VAE 潜空间中执行。所有配置以相同的一组 100 个提示为条件生成 100 张图像，这些提示从 COCO 2014 验证集（Lin et al., 2014）中无放回均匀抽取。

**结果**：图 5 给出在受限前瞻深度 $L=2$ 下相对标准目标采样器的经验加速随 $K$ 的变化。当每节点提议数 $K$ 从 2 增至 7 时，相应计算预算 $B$ 从 6 扩展到 56。与先前的拓扑分析一致，所提方法有效地把扩展预算转化为可测加速：通过把计算分配给 $K$，D-GRS 给出单调递增的加速，在 $K=6$（$B=42$）附近达到约 $1.18\times$ 的峰值，相对 RMC 提升 6.7%。相反，RMC 未能有意义地利用额外预算：受其顺序接受的几何衰减所限，反射采样器严重饱和，在整个参数扫描中在 $1.10\times$ 与 $1.12\times$ 之间趋于平台。这一不断扩大的性能差距清楚表明，扩展每节点多个提议（$K$）成功提升了每步接受率，使分支拓扑在高维文本到图像合成中严格优于线性链。为经验展示两种采样过程的精确性，表 1 报告各预算配置的 CLIP 分数（Radford et al., 2021），用 `openai/clip-vit-large-patch14` 计算。

**图 5**：相对原始目标采样器的期望 NFE 加速随 $K$ 的变化（$512\times512$ 分辨率，$\varepsilon=0.8$，$L=2$）。

**表 1　不同 $K$ 下 D-GRS 与 RMC 的 CLIP 分数（$L=2$，均值 ± 均值的标准误，$n=100$ 个提示）**（按原表逐格转录；目标基线分数：$26.90\pm0.37$）

| 方法 | $K=2$ | $K=3$ | $K=4$ | $K=5$ | $K=6$ | $K=7$ |
| --- | --- | --- | --- | --- | --- | --- |
| D-GRS | $26.78\pm0.34$ | $26.32\pm0.34$ | $26.67\pm0.34$ | $26.72\pm0.35$ | $26.75\pm0.33$ | $26.65\pm0.35$ |
| RMC | $26.59\pm0.35$ | $26.74\pm0.33$ | $26.48\pm0.34$ | $26.77\pm0.34$ | $26.39\pm0.37$ | $26.87\pm0.33$ |

## 6. 结论与未来工作

我们识别出反射最大耦合（RMC）的一个关键拓扑限制：它把推测预算分配给单条草稿链。为更好地利用并行计算，我们引入草稿树，并提出 D-GRS——它把相对熵编码文献中的贪婪拒绝采样适配到由此产生的列表耦合问题。在我们的全部实验中，D-GRS 相对 RMC 在实用设置下把 NFE 加速提升最多 8.3%。

本工作是迈向更高效推测扩散采样的第一步。重要的开放方向包括：克服精确耦合效率随生成维数快速退化的问题，以及根据提议质量与可用计算预算在线自适应调整草稿拓扑。

## 参考文献

> 以下按原文的字母序作者—年份格式转录英文原条目（原文采用 author–year 引用），条目文字不翻译；PDF 抽取文本中的换行与变音伪影已整理，书目内容未改动。

[1] Abramson, J., Adler, J., Dunger, J., Evans, R., Green, T., Pritzel, A., Ronneberger, O., Willmore, L., Ballard, A. J., Bambrick, J., et al. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. Nature, 630(8016):493–500.

[2] Bar-Tal, O., Chefer, H., Tov, O., Herrmann, C., Paiss, R., Zada, S., Ephrat, A., Hur, J., Liu, G., Raj, A., et al. (2024). Lumiere: A space-time diffusion model for video generation. In SIGGRAPH Asia 2024 Conference Papers.

[3] Bennett, C. H., Shor, P. W., Smolin, J. A., and Thapliyal, A. V. (2002). Entanglement-assisted capacity of a quantum channel and the reverse Shannon theorem. IEEE Transactions on Information Theory, 48(10):2637–2655.

[4] Block, A. and Polyanskiy, Y. (2023). The sample complexity of approximate rejection sampling with applications to smoothed online learning. In The Thirty Sixth Annual Conference on Learning Theory, pages 228–273. PMLR.

[5] Boffi, N., Albergo, M., and Vanden-Eijnden, E. (2025a). How to build a consistency model: Learning flow maps via self-distillation. Advances in Neural Information Processing Systems, 38:33346–33382.

[6] Boffi, N. M., Albergo, M. S., and Vanden-Eijnden, E. (2025b). Flow map matching with stochastic interpolants: A mathematical framework for consistency models. Transactions on Machine Learning Research.

[7] Chen, C., Borgeaud, S., Irving, G., Lespiau, J.-B., Sifre, L., and Jumper, J. (2023). Accelerating large language model decoding with speculative sampling. arXiv preprint arXiv:2302.01318.

[8] Chen, H., Ren, Y., Ying, L., and Rotskoff, G. M. (2024). Accelerating diffusion models with parallel sampling: Inference at sub-linear time complexity. Advances in Neural Information Processing Systems, 37:133661–133709.

[9] Cuff, P. (2013). Distributed channel synthesis. IEEE Transactions on Information Theory, 59(11):7071–7096.

[10] Daliri, M., Musco, C., and Suresh, A. T. (2025). Coupling without communication and drafter-invariant speculative decoding. In 2025 IEEE International Symposium on Information Theory (ISIT), pages 1–6. IEEE.

[11] De Bortoli, V., Galashov, A., Gretton, A., and Doucet, A. (2025). Accelerated diffusion models via speculative sampling. In International Conference on Machine Learning (ICML), pages 12590–12631. PMLR.

[12] Dhariwal, P. and Nichol, A. (2021). Diffusion models beat GANs on image synthesis. Advances in Neural Information Processing Systems, 34:8780–8794.

[13] Dieleman, S. (2024). The paradox of diffusion distillation.

[14] Dieleman, S. (2026). Learning the integral of a diffusion model. https://sander.ai/2026/05/06/flow-maps.html.

[15] Esser, P., Kulal, S., Blattmann, A., Entezari, R., Müller, J., Saini, H., Levi, Y., Lorenz, D., Sauer, A., Boesel, F., et al. (2024). Scaling rectified flow transformers for high-resolution image synthesis. In International Conference on Machine Learning, pages 12606–12633. PMLR.

[16] Fan, A., Lewis, M., and Dauphin, Y. (2018). Hierarchical neural story generation. In Proceedings of the 56th Annual Meeting of the Association for Computational Linguistics, pages 889–898.

[17] Flamich, G. (2023). Greedy Poisson rejection sampling. Advances in Neural Information Processing Systems, 36:37089–37127.

[18] Flamich, G. and Gündüz, D. (2026). Data compression with stochastic codes. IEEE BITS the Information Theory Magazine.

[19] Flamich, G. and Theis, L. (2023). Adaptive greedy rejection sampling. In 2023 IEEE International Symposium on Information Theory (ISIT), pages 454–459. IEEE.

[20] Flamich, G. and Wells, L. (2024). Some notes on the sample complexity of approximate channel simulation. In First ’Learn to Compress’ Workshop @ ISIT 2024.

[21] Frans, K., Hafner, D., Levine, S., and Abbeel, P. (2025). One step diffusion via shortcut models. In The Thirteenth International Conference on Learning Representations.

[22] Geng, Z., Deng, M., Bai, X., Kolter, Z., and He, K. (2025). Mean flows for one-step generative modeling. Advances in Neural Information Processing Systems, 38:75460–75482.

[23] Geng, Z., Lu, Y., Wu, Z., Shechtman, E., Kolter, J. Z., and He, K. (2026). Improved mean flows: On the challenges of fastforward generative models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 30467–30476.

[24] Guo, Y., Salehkalaibar, S., Draper, S. C., and Yu, W. (2024). One-shot achievability region for hypothesis testing with communication constraint. In 2024 IEEE Information Theory Workshop (ITW), pages 55–60. IEEE.

[25] Harsha, P., Jain, R., McAllester, D., and Radhakrishnan, J. (2010). The communication complexity of correlation. IEEE Transactions on Information Theory, 56(1):438–449.

[26] He, J., Flamich, G., and Hernández-Lobato, J. M. (2024). Accelerating relative entropy coding with space partitioning. Advances in Neural Information Processing Systems, 37:75791–75828.

[27] Hill, S., Alajaji, F., Linder, T., and Flamich, G. (2026). Rejection sampling is optimal for relative entropy coding. To appear at the 2026 IEEE Information Theory Workshop (ITW).

[28] Ho, J., Jain, A., and Abbeel, P. (2020). Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851.

[29] Ho, J., Salimans, T., Gritsenko, A. A., Chan, W., Norouzi, M., and Fleet, D. J. (2022). Video diffusion models. In ICLR Workshop on Deep Generative Models for Highly Structured Data.

[30] Holderrieth, P., Chen, D., Eyring, L., Shah, I., Anantharaman, G., He, Y., Akata, Z., Jaakkola, T., Boffi, N. M., and Simchowitz, M. (2026). Diamond maps: Efficient reward alignment via stochastic flow maps. arXiv preprint arXiv:2602.05993.

[31] Holtzman, A., Buys, J., Du, L., Forbes, M., and Choi, Y. (2020). The curious case of neural text degeneration. In International Conference on Learning Representations (ICLR).

[32] Hu, X., Xu, K., Liu, B., Liu, Q., and Fei, H. (2025a). AMO sampler: Enhancing text rendering with overshooting. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 13157–13166.

[33] Hu, Z., Zheng, T., Viswanathan, V., Chen, Z., Rossi, R., Wu, Y., Manocha, D., and Huang, H. (2025b). Towards optimal multi-draft speculative decoding. In International Conference on Learning Representations (ICLR), volume 2025, pages 3181–3203.

[34] Karras, T., Laine, S., and Aila, T. (2019). A style-based generator architecture for generative adversarial networks. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR).

[35] Karras, T., Aittala, M., Aila, T., and Laine, S. (2022). Elucidating the design space of diffusion-based generative models. Advances in Neural Information Processing Systems, 35:26565–26577.

[36] Khisti, A., Ebrahimi, M. R., Dbouk, H., Behboodi, A., Memisevic, R., and Louizos, C. (2025). Multi-draft speculative sampling: Canonical decomposition and theoretical limits. In International Conference on Learning Representations (ICLR).

[37] Kingma, D., Salimans, T., Poole, B., and Ho, J. (2021). Variational diffusion models. Advances in Neural Information Processing Systems, 34:21696–21707.

[38] Kobus, S., Theis, L., and Gündüz, D. (2024). Gaussian channel simulation with rotated dithered quantization. In 2024 IEEE International Symposium on Information Theory (ISIT), pages 1907–1912. IEEE.

[39] Krizhevsky, A. and Hinton, G. (2009). Learning multiple layers of features from tiny images.

[40] Lai, C.-H., Song, Y., Kim, D., Mitsufuji, Y., and Ermon, S. (2025). The principles of diffusion models. arXiv preprint arXiv:2510.21890.

[41] Leviathan, Y., Kalman, M., and Matias, Y. (2023). Fast inference from transformers via speculative decoding. In International Conference on Machine Learning (ICML), pages 19274–19286. PMLR.

[42] Li, C. T. (2024). Channel simulation: Theory and applications to lossy compression and differential privacy. Foundations and Trends® in Communications and Information Theory, 21(6):847–1106.

[43] Li, C. T. and Anantharam, V. (2021). A unified framework for one-shot achievability via the Poisson matching lemma. IEEE Transactions on Information Theory, 67(5):2624–2651.

[44] Li, C. T. and El Gamal, A. (2018). Strong functional representation lemma and applications to coding theorems. IEEE Transactions on Information Theory, 64(11):6967–6978.

[45] Lin, T.-Y., Maire, M., Belongie, S., Hays, J., Perona, P., Ramanan, D., Dollár, P., and Zitnick, C. L. (2014). Microsoft COCO: Common objects in context. In European Conference on Computer Vision, pages 740–755. Springer.

[46] Lin, Y., Sheng, J., Cai, Q., and Zhou, F. (2026). Spectr-GBV: Multi-draft block verification accelerating speculative decoding. arXiv preprint arXiv:2604.25925.

[47] Lipman, Y., Chen, R. T., Ben-Hamu, H., Nickel, M., and Le, M. (2022). Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations.

[48] Liu, X., Gong, C., and Liu, Q. (2023). Flow straight and fast: Learning to generate and transfer data with rectified flow. In International Conference on Learning Representations (ICLR).

[49] Liu, Y. and Li, C. T. (2025). One-shot coding over general noisy networks. IEEE Transactions on Information Theory, 71(11):8346–8357.

[50] Liu, Y., Chen, W.-N., Ozgur, A., and Li, C. T. (2024). Universal exact compression of differentially private mechanisms. Advances in Neural Information Processing Systems, 37:91492–91531.

[51] Liu, Y., Heidari Advary, S., and Li, C. T. (2026). Nonasymptotic oblivious relaying and variable-length noisy lossy source coding. IEEE Transactions on Information Theory, 72(6):4555–4564.

[52] Lu, C., Zhou, Y., Bao, F., Chen, J., Li, C., and Zhu, J. (2022). DPM-Solver: A fast ODE solver for diffusion probabilistic model sampling in around 10 steps. Advances in Neural Information Processing Systems, 35:5775–5787.

[53] Lu, C., Zhou, Y., Bao, F., Chen, J., Li, C., and Zhu, J. (2025). DPM-Solver++: Fast solver for guided sampling of diffusion probabilistic models. Machine Intelligence Research, 22(4):730–751.

[54] Luhman, E. and Luhman, T. (2021). Knowledge distillation in iterative generative models for improved sampling speed. arXiv preprint arXiv:2101.02388.

[55] Maddison, C. J. (2016). A Poisson process model for Monte Carlo. Perturbation, Optimization, and Statistics, pages 193–232.

[56] Maddison, C. J., Tarlow, D., and Minka, T. (2014). A* sampling. Advances in Neural Information Processing Systems, 27.

[57] McCallum, S., Blasingame, Z. W., Herschell, T., Rindtorff, N., Tong, A., and Foster, J. (2026). Strong stochastic flow maps. In ICML 2026 Workshop on Structured Probabilistic Inference & Generative Modeling.

[58] Miao, X., Oliaro, G., Zhang, Z., Cheng, X., Wang, Z., Zhang, Z., Wong, R. Y. Y., Zhu, A., Yang, L., Shi, X., et al. (2024). SpecInfer: Accelerating large language model serving with tree-based speculative inference and verification. In Proceedings of the 29th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, Volume 3, pages 932–949.

[59] Potaptchik, P., Saravanan, A., Mammadov, A., Prat, A., Albergo, M. S., and Teh, Y. W. (2026). Meta flow maps enable scalable reward alignment. In Forty-third International Conference on Machine Learning (ICML).

[60] Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., Sutskever, I., et al. (2019). Language models are unsupervised multitask learners. OpenAI blog, 1(8):9.

[61] Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., et al. (2021). Learning transferable visual models from natural language supervision. In International Conference on Machine Learning (ICML), pages 8748–8763. PMLR.

[62] Rombach, R., Blattmann, A., Lorenz, D., Esser, P., and Ommer, B. (2022). High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 10684–10695.

[63] Rowan, J., Phan, T. B., and Khisti, A. (2025). List-level distribution coupling with applications to speculative decoding and lossy compression. Advances in Neural Information Processing Systems, 38:5576–5619.

[64] Sabour, A., Fidler, S., and Kreis, K. (2025). Align your flow: Scaling continuous-time flow map distillation. Advances in Neural Information Processing Systems, 38:146459–146512.

[65] Salimans, T. and Ho, J. (2022). Progressive distillation for fast sampling of diffusion models. In International Conference on Learning Representations.

[66] Sauer, A., Lorenz, D., Blattmann, A., and Rombach, R. (2024). Adversarial diffusion distillation. In European Conference on Computer Vision, pages 87–103. Springer.

[67] Shih, A., Belkhale, S., Ermon, S., Sadigh, D., and Anari, N. (2023). Parallel sampling of diffusion models. Advances in Neural Information Processing Systems, 36:4263–4276.

[68] Soen, A., Husain, H., De Bortoli, V., and Doucet, A. (2026). Accelerating speculative diffusions via block verification. arXiv preprint arXiv:2606.13426.

[69] Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., and Ganguli, S. (2015). Deep unsupervised learning using nonequilibrium thermodynamics. In International Conference on Machine Learning, pages 2256–2265. PMLR.

[70] Song, J., Meng, C., and Ermon, S. (2021a). Denoising diffusion implicit models. In International Conference on Learning Representations.

[71] Song, Y. and Ermon, S. (2019). Generative modeling by estimating gradients of the data distribution. Advances in Neural Information Processing Systems, 32.

[72] Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., and Poole, B. (2021b). Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations.

[73] Song, Y., Dhariwal, P., Chen, M., and Sutskever, I. (2023). Consistency models. In International Conference on Machine Learning, pages 32211–32252. PMLR.

[74] Sun, Z., Suresh, A. T., Ro, J. H., Beirami, A., Jain, H., and Yu, F. (2023). Spectr: Fast speculative decoding via optimal transport. Advances in Neural Information Processing Systems, 36:30222–30242.

[75] Tang, Z., Tang, J., Luo, H., Wang, F., and Chang, T.-H. (2024). Accelerating parallel sampling of diffusion models. In International Conference on Machine Learning (ICML).

[76] Watson, J. L., Juergens, D., Bennett, N. R., Trippe, B. L., Yim, J., Eisenach, H. E., Ahern, W., Borst, A. J., Ragotte, R. J., Milles, L. F., et al. (2023). De novo design of protein structure and function with RFdiffusion. Nature, 620(7976):1089–1100.

[77] Yang, L., Zhang, Z., Song, Y., Hong, S., Xu, R., Zhao, Y., Zhang, W., Cui, B., and Yang, M.-H. (2023). Diffusion models: A comprehensive survey of methods and applications. ACM Computing Surveys, 56(4):1–39.

[78] Yin, T., Gharbi, M., Park, T., Zhang, R., Shechtman, E., Durand, F., and Freeman, W. T. (2024a). Improved distribution matching distillation for fast image synthesis. In Proceedings of the 38th International Conference on Neural Information Processing Systems, pages 47455–47487.

[79] Yin, T., Gharbi, M., Zhang, R., Shechtman, E., Durand, F., Freeman, W. T., and Park, T. (2024b). One-step diffusion with distribution matching distillation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 6613–6623.

[80] Zamir, R. and Feder, M. (1992). On universal quantization by randomized uniform/lattice quantizers. IEEE Transactions on Information Theory, 38(2):428–436.

[81] Zhang, Q. and Chen, Y. (2023). Fast sampling of diffusion models with exponential integrator. In International Conference on Learning Representations.

[82] Zhao, X., Li, L., and Wang, Y.-X. (2025). Permute-and-flip: An optimally stable and watermarkable decoder for LLMs. In International Conference on Learning Representations (ICLR).

[83] Zhou, H. and Sugiyama, M. (2025). Parallel simulation for log-concave sampling and score-based diffusion models. In International Conference on Machine Learning (ICML), pages 79192–79225. PMLR.

[84] Zhou, L., Parger, M., Haque, A., and Song, J. (2026). Terminal velocity matching. In The Fourteenth International Conference on Learning Representations.

## 附录 A：文献综述

### A.1 扩散模型

扩散模型从经验样本中隐式学习数据分布：生成过程以来自易处理先验（通常为高斯分布）的样本初始化，并迭代去噪以恢复目标数据分布的样本（Lai et al., 2025）。该机制通过定义一个用噪声逐步损坏数据的固定前向过程、并训练参数化神经网络反转该损坏来形式化。已有若干理论框架表述这一概念，包括去噪扩散概率模型（DDPM）（Sohl-Dickstein et al., 2015; Ho et al., 2020）与噪声条件分数网络（Song and Ermon, 2019）；它们随后被统一为单一连续时间随机微分方程（SDE）的离散化（Song et al., 2021b），以及更近的流匹配范式（Lipman et al., 2022; Liu et al., 2023）。从根本上说，这些表述在模型输出参数化与噪声计划的变换意义下数学等价（Kingma et al., 2021; Lai et al., 2025）。该等价性的一个关键实践推论是：训练目标并不唯一决定采样算法——用去噪训练的模型可用概率流常微分方程（ODE）确定性采样（Song et al., 2021b），而在流匹配目标下训练的模型可采用随机采样方案（Liu et al., 2023; Hu et al., 2025a）。这些生成框架已在多种模态上确立最先进性能，涵盖图像合成（Dhariwal and Nichol, 2021; Rombach et al., 2022; Karras et al., 2022）、视频生成（Ho et al., 2022; Bar-Tal et al., 2024）、蛋白质设计（Watson et al., 2023）、生物分子结构预测（Abramson et al., 2024）以及众多其他应用（Yang et al., 2023）。

尽管经验上成功，扩散模型的主要局限在于采样过程的迭代性。通过减少积分步数来加速推理的努力已被广泛研究，通常分为无需训练与基于训练两类方法（Dieleman, 2024, 2026; Lai et al., 2025）。无需训练的方法利用固定的预训练模型，通过部署先进的 ODE 与 SDE 求解器允许更大步长而不牺牲精度来获得加速（Song et al., 2021a; Zhang and Chen, 2023; Lu et al., 2022, 2025）。相反，基于训练的方法显式优化模型以执行大步合成，沿两条主轴变化。第一是监督来源：可从预训练教师模型蒸馏知识（Luhman and Luhman, 2021; Salimans and Ho, 2022; Song et al., 2023; Sabour et al., 2025），或完全从零训练少步模型（Song et al., 2023; Frans et al., 2025; Geng et al., 2025; Boffi et al., 2025a）。第二是匹配目标：某些技术要求保持连接噪声与数据的轨迹（Salimans and Ho, 2022; Song et al., 2023; Boffi et al., 2025b），而另一些约束最终模型输出匹配目标边缘分布（Yin et al., 2024b,a; Sauer et al., 2024）。这些加速技术最初针对 ODE 轨迹发展，近来已被推广到 SDE，包括学习转移核以复现过程边缘分布的方法（Potaptchik et al., 2026; Holderrieth et al., 2026），以及以驱动噪声的具体实现为条件、沿路径学习解映射的方法（McCallum et al., 2026）。

### A.2 语言模型的推测采样

标准自回归解码方法（如 top-$k$ 采样（Radford et al., 2019; Fan et al., 2018）、核采样（Holtzman et al., 2020）与 permute-and-flip 解码器（Zhao et al., 2025））一次生成一个词元，因而每个词元都招致一次目标模型调用的固有延迟。推测采样（Chen et al., 2023; Leviathan et al., 2023）通过用较小的草稿模型提议多个未来词元、由较大的目标模型并行验证这些提议延续来缓解该瓶颈，并以拒绝—校正步骤确保精确保持目标模型分布。由此获得的效率增益取决于草稿分布与目标分布的接近程度：更准确的提议带来更高接受率与更长的已验证块。近期工作通过基于最优传输的词元选择（Sun et al., 2023）、基于树的推断与验证（Miao et al., 2024）以及多草稿架构（Khisti et al., 2025; Hu et al., 2025b; Lin et al., 2026）进一步推进了该范式。多草稿推测解码可视为列表耦合方案的应用（Rowan et al., 2025），后者严格推广了推测解码中的普通耦合（Daliri et al., 2025）。近来，推测采样也被用于加速扩散模型（De Bortoli et al., 2025; Soen et al., 2026）。

### A.3 相对熵编码

本文为推测扩散引入的顺序耦合方法在理论上植根于贪婪拒绝采样（Harsha et al., 2010）。该技术属于文献中以多种术语指称的一类更广泛的远程耦合方法，包括信道模拟（channel simulation）（Li, 2024）、信道合成（channel synthesis）（Cuff, 2013）与反向信道编码（reverse channel coding）（Bennett et al., 2002）。下文我们把这类方案统称为相对熵编码（REC）（Flamich and Gündüz, 2026）。从根本上说，REC 被表述为一种有损压缩问题，旨在确定在无噪链路上模拟目标随机信道所需的最小通信开销。该命名来自如下理论结果：在精确模拟体制下，该通信代价的基本下界由相对熵度量决定。

本工作采用贪婪拒绝采样（Harsha et al., 2010），其能力已在近期文献中被显著扩展（Flamich and Theis, 2023; Flamich, 2023; Hill et al., 2026）。另一类并行且著名的 REC 框架依赖泊松过程：它们植根于泊松函数表示（Li and El Gamal, 2018）——这一概念与 A* 采样（Maddison et al., 2014; Maddison, 2016）密切相关——已在多个领域得到广泛应用，包括假设检验（Guo et al., 2024）、网络信息论（Li and Anantharam, 2021; Liu and Li, 2025; Liu et al., 2026）与机器学习（He et al., 2024）。近似信道模拟的相关方法由 Block and Polyanskiy (2023)、Kobus et al. (2024) 与 Flamich and Wells (2024) 提出；但由于这些方法产生非精确模拟、因而达不到理论相对熵极限，故被排除在 REC 的标准定义之外。

## 附录 B：关于性能分析

本节给出第 4 节所述理论保证的证明。为完整起见，在给出证明之前重述各定理。本节中 $P=\mathcal N(\mu_p,\sigma^2\mathbf I_d)$ 与 $Q=\mathcal N(\mu_q,\sigma^2\mathbf I_d)$ 表示 $\Omega=\mathbb R^d$ 上的提议分布与目标分布。此外，令 $J$ 表示算法 3 所接受提议的索引，即 $Y=\hat Y_J$；令 $(\lambda_j)_{j\ge0}$ 为定义密度比 $\rho=\frac{\mathrm dQ}{\mathrm dP}$ 的超水平集的递增水平序列，即 $H_j:=\{y\in\Omega:\rho(y)\ge\lambda_j\}$。最后，$\bar\Phi(x):=1-\Phi(x)$ 为标准高斯生存函数，$(x)_+:=\max\{x,0\}$。

### B.1 精确性的证明

**定理 3（精确性）**：目标分布 $Q=\mathcal N(\mu_q;\sigma^2\mathbf I_d)$ 下算法 3 的输出 $Y$ 满足 $Y\sim Q$。

**证明**：设 $\hat Y_{1:K}\overset{\mathrm{i.i.d.}}{\sim}P$ 为 $K$ 个提议。由贪婪拒绝采样的残差测度刻画（Flamich and Theis, 2023, Lemma III.1-2），对每个可测集 $A\subseteq\mathbb R^d$，前 $j$ 个提议之后剩余的目标质量为

$$
\Delta_j(A)=Q(A)-\mathbb P\left(J\le j,\ \hat Y_J\in A\right)=\int_A(\rho(y)-\lambda_j)_+\,P(\mathrm dy).\tag{21}
$$

注意若取 $A=\Omega$，有

$$
\Delta_j(\Omega)=1-\mathbb P(J\le j)=\mathbb P(J>j):=G_{j+1}.\tag{22}
$$

因此当 $G_{j+1}>0$ 时，归一化残差分布为

$$
r_j(A)=\frac{\Delta_j(A)}{G_{j+1}}.\tag{23}
$$

于是由（21）（22）（23），对每个可测集 $A\subseteq\mathbb R^d$ 有

$$
\mathbb P(Y\in A)=\mathbb P\left(J\le j,\ \hat Y_J\in A\right)+\mathbb P(J>j)r_j(A)=Q(A)-\Delta_j(A)+G_{j+1}\frac{\Delta_j(A)}{G_{j+1}}=Q(A).
$$

因此 $Y\sim Q$ 精确成立。$\square$

### B.2 接受概率的证明

**定理 4（接受概率）**：记 $\Delta:=(\mu_q-\mu_p)/\sigma$、$\delta:=\|\Delta\|$、$e:=\Delta/\delta$。对算法 3，至少接受 $K$ 个提议之一的概率为

$$
\mathbb P\left(\exists k\in\{1,\cdots,K\}:Y=\hat Y_k\right)=1-G_{K+1}.\tag{24}
$$

此外，对任意 $\delta\in\mathbb R_+$ 有

$$
G_{K+1}=\bar\Phi\left(\frac{1}{\delta}\ln\lambda_K-\frac{\delta}{2}\right)-\lambda_K\bar\Phi\left(\frac{1}{\delta}\ln\lambda_K+\frac{\delta}{2}\right),\tag{25}
$$

其中 $\bar\Phi(x)=1-\Phi(x)$ 为标准高斯生存函数。

**证明**：由 Flamich and Theis (2023) 的 Lemma III.1，$G_j$ 是贪婪拒绝采样到达提议 $j$ 的概率，即 $G_j=\Pr(J\ge j)$。因此前 $j$ 个提议全被拒绝的概率为 $\Pr(J>j)=\Pr(J\ge j+1)=G_{j+1}$，故 $\Pr(J\le j)=1-G_{j+1}$，从而

$$
\Pr\left(\exists k\in\{1,\ldots,K\}:Y=\hat Y_k\right)=\Pr(J\le K)=1-G_{K+1}.
$$

证明余下部分计算 $G_{K+1}$。结合（21）与（22）得

$$
G_{j+1}=\Delta_j(\Omega)=\int_\Omega(\rho(y)-\lambda_j)_+\,P(\mathrm dy).\tag{26}
$$

由于（26）中被积函数在超水平集 $H_j:=\{y\in\Omega:\rho(y)\ge\lambda_j\}$ 之外为零，有

$$
G_{j+1}=\int_{H_j}(\rho(y)-\lambda_j)P(\mathrm dy)=Q(H_j)-\lambda_jP(H_j).\tag{27}
$$

于是计算 $G_{j+1}$ 归结为计算密度比某超水平集的 $P$-质量与 $Q$-质量。对具有共同协方差 $\sigma^2\mathbf I_d$ 的高斯 $P$ 与 $Q$，对数目标—提议比为

$$
\ln\rho(y)=\frac{\|y-\mu_p\|^2-\|y-\mu_q\|^2}{2\sigma^2}=\frac{2(\mu_q-\mu_p)^\top y-\left(\|\mu_q\|^2-\|\mu_p\|^2\right)}{2\sigma^2}=\frac{(\mu_q-\mu_p)^\top(y-\bar\mu)}{\sigma^2}=\frac{\delta e^\top(y-\bar\mu)}{\sigma},
$$

其中 $\bar\mu:=\frac{1}{2}(\mu_p+\mu_q)$。令 $s(y):=\frac{1}{\sigma}e^\top(y-\bar\mu)$，则似然比成为标量统计量的单调函数：$\rho(y)=\exp(\delta s(y))$。由于 $\delta>0$，映射 $t\mapsto e^{\delta t}$ 严格递增，故超水平集为半空间

$$
H_j=\{y:\rho(y)\ge\lambda_j\}=\{y:s(y)\ge\tau_j\},\qquad \tau_j=\frac{\ln\lambda_j}{\delta}.
$$

现为刻画质量 $Q(H_j)$ 与 $P(H_j)$，只需刻画 $X\sim P$ 与 $Y\sim Q$ 时 $s$ 的分布。$s$ 是高斯向量的仿射泛函，故为高斯，均值为

$$
\mathbb E[s(X)]=\frac{e^\top(\mu_p-\bar\mu)}{\sigma}=\frac{e^\top(\mu_p-\mu_q)}{2\sigma}=-\frac{\delta}{2},\qquad \mathbb E[s(Y)]=\frac{e^\top(\mu_q-\bar\mu)}{\sigma}=\frac{e^\top(\mu_q-\mu_p)}{2\sigma}=+\frac{\delta}{2},
$$

且方差相同：

$$
\operatorname{Var}[s(X)]=\operatorname{Var}[s(Y)]=\frac{e^\top(\sigma^2\mathbf I_d)e}{\sigma^2}=\|e\|^2=1.
$$

因此 $s(X)\sim\mathcal N\left(-\frac{\delta}{2},1\right)$、$s(Y)\sim\mathcal N\left(\frac{\delta}{2},1\right)$。把两个分布标准化得

$$
Q(H_j)=\bar\Phi\left(\tau_j-\frac{\delta}{2}\right),\qquad P(H_j)=\bar\Phi\left(\tau_j+\frac{\delta}{2}\right),
$$

代入（27）得 $G_{j+1}=Q(H_j)-\lambda_jP(H_j)=\bar\Phi\left(\tau_j-\frac{\delta}{2}\right)-\lambda_j\bar\Phi\left(\tau_j+\frac{\delta}{2}\right)$。取 $j=K$ 即完成证明。$\square$

**注 1（恢复 RMC）**：在 $K=1$ 的特殊情形下我们恢复 RMC。事实上 $\lambda_1=G_1=1$ 给出 $\tau_1=0$，因此

$$
\Pr(J\le1)=1-G_2=1-\bar\Phi\left(-\frac{\delta}{2}\right)+\bar\Phi\left(\frac{\delta}{2}\right)=2\bar\Phi\left(\frac{\delta}{2}\right),
$$

与 De Bortoli et al. (2025) 的接受概率相同。

**注 2（退化与各向异性情形）**：定理 2 假定 $\delta>0$，这是 $\tau_j=\ln\lambda_j/\delta$ 有定义所必需的。若 $\delta=0$ 则 $P=Q$、$\rho\equiv1$，第一个提议几乎必然被接受，故 $G_2=0$，对每个 $K\ge1$ 接受概率都等于 1——这也是（24）在 $\delta\downarrow0$ 时的极限。该论证可逐字推广到任意公共协方差 $\Sigma\succ0$，只需把 $\delta$ 换为 Mahalanobis 距离 $\delta=\|\Sigma^{-1/2}(\mu_q-\mu_p)\|$、把 $s$ 换为 $s(y)=e^\top\Sigma^{-1/2}(y-\bar\mu)$（$e=\Sigma^{-1/2}(\mu_q-\mu_p)/\delta$）。

**图 6**：不同草稿提议数 $K$ 下 D-GRS 的每步接受概率（横轴为归一化均值失配 $\delta=\|\mu_q-\mu_p\|_2/\sigma$；曲线对应 $K=1,2,4,8$）。

## 附录 C：扩展实验结果

本节给出实验设置的更多细节。

### C.1 实现细节

**延迟漂移提议**：实验中用（7）实例化模板，取在根处评估的目标漂移：对一轮内每步 $n'\le L$ 有 $\tilde m_n^p(y)=y+\gamma b_{t_n}^q(Y_n)$。因此提议均值在每个深度都是同一映射，算法 1 中的草拟阶段特化为 $\hat Y_v\sim\mathcal N\left(\tilde m_n^p(\hat Y_u),\sigma_{n+\ell-1}^2\mathbf I_d\right)$（$v\in C(u)$、$|u|=\ell-1$），其中 $\tilde m_n^p(\hat Y_u)=\hat Y_u+\gamma b_{t_n}^q(Y_n)$、$Y_n=Y_r$。注意这需要每轮额外一次目标调用（除验证所需的那次之外）来计算根节点处的目标漂移 $b_{t_n}^q(Y_n)$。

**根漂移预取**：当使用延迟漂移作为提议时，草拟阶段需要每轮在根处评估 $b_{t_n}^q(Y_n)$，即除验证所用之外再增加一次目标评估。沿用 De Bortoli et al. (2025)，我们通过复用前一轮已计算的漂移来避免该开销，这一手段称为**根漂移预取**：把 $b_{t_n}^q(Y_n)$ 替换为某对 $(n',\tilde Y)$ 的 $b_{t_{n'}}^q(\tilde Y)$，其漂移已可用。

### C.2 $K$ 与 $L$ 的价值

下面分离提议预算分配的两个机制：分支因子 $K$（每节点展开的候选子节点数）与前瞻深度 $L$。图 7 报告加速随 $K$ 的变化并按 $L$ 分层，每个点对 100 次独立重复取平均。

RMC 不允许分支，因为草拟的是单条线性链，故无论链长如何都在 $\approx2\times$ 处饱和。该上限有闭式刻画：在假定每步的耦合接受概率 $\alpha$ 固定时，$n$ 个草拟状态链的已接受前缀期望长度为

$$
n\sum_{i=1}^{n}\alpha^i=\frac{\alpha(1-\alpha^n)}{1-\alpha}\xrightarrow[n\to\infty]{}\frac{\alpha}{1-\alpha},
$$

于是由于每轮以一次目标评估的代价提交已接受前缀与一个重采样状态，每次目标网络函数评估所提交的步数上界为 $1/(1-\alpha)$。实测接受概率 $\alpha\approx0.52$ 给出预测上限 $2.09\times$，与观测到的 $2\times$ 高度吻合。因此把链延长到该区间之外只会带来额外草拟计算，而不会相应减少目标评估——沿链的接受概率几何衰减（而非草拟预算）才是硬约束。

深度 $L$ 与宽度 $K$ 的相对价值由耦合的每步接受概率支配，而后者由（12）中定义的比值 $\delta$ 控制。因此 $K$ 与 $L$ 是互补而非可互换的，其相对优先级由一个依问题而定的交叉点分开。在该点以下，深度是硬约束：浅树在分支能被利用之前就用尽前瞻，任何 $K$ 都无法弥补这一缺口——$L=2$ 时最佳配置仅达 $1.876\times$，低于 RMC 上限；而 $K=1$ 时树退化为链，D-GRS 复现该上限。只有当前瞻足够深以维持一段被接受的连续路径时（此处从 $(K,L)=(2,3)$ 起），D-GRS 才超越 RMC。在交叉点以上，两个参数争夺同一预算：深度的边际收益在 $L\approx5$ 处耗尽，此后 $L\in\{5,6,7\}$ 的曲线彼此相差不超过一个标准误；而在 $L=6$ 时从 $K=5$ 加宽到 $K=7$ 仍带来 $0.09\times$ 提升，最高在 $(K,L)=(7,6)$ 处达到 $2.34\times$。一旦前瞻足够，额外预算更宜花在宽度而非深度上。

**图 7**：混合高斯目标上 NFE 加速随树宽 $K$ 的变化（点为 100 次独立试验的平均每重复加速；彩色线为不同前瞻深度 $L\in\{2,\ldots,7\}$ 的 D-GRS，阴影带为 $\pm1$ 标准误；RMC 在 $2\times$ 处饱和）。

### C.3 SD3 转换

与 DDPM 不同，SD3 被训练为 rectified flow（流匹配）模型，即它直接参数化一个概率流 ODE，其转移为确定性点质量，全变差距离为 1。因此对原生 SD3 采样器推测是失效的，套用我们的框架需要真正高斯的转移。我们无需重新训练即可获得这样的转移：把 SD3 表现为共享其边缘分布的逆时 SDE 族（2）的一员。具体地，该转换识别出 SD3 插值所隐含的漂移 $f_t$、扩散系数 $g_t$ 与分数 $s_t$，使逆漂移（2）及其 Euler–Maruyama 离散化（4）—（5）可原样适用。结果（记录于下文（36）—（37））是一个方差与状态无关的高斯转移核——这正是秩 1 约化（12）—（15）所需的结构。

**插值与速率场**：设 $X_0\sim p_{\mathrm{data}}$ 与 $\xi\sim\mathcal N(0,\mathbf I_d)$ 相互独立。对 $t\in[0,1]$，SD3 沿线性插值扰动数据：

$$
X_t=\alpha_tX_0+\beta_t\xi,\qquad \alpha_t=1-t,\qquad \beta_t=t,\tag{28}
$$

使 $X_0\sim p_{\mathrm{data}}$、$X_1\sim\mathcal N(0,\mathbf I_d)$。沿（28）速率恒定：$\frac{\mathrm dX_t}{\mathrm d t}=\xi-X_0$，网络 $v_\theta$ 通过条件流匹配训练从受污染状态单独回归它。由于 $(X_0,\xi)$ 无法从 $X_t$ 辨识，训练目标的最小化者是条件期望，即**边缘速率场**

$$
v_t(x):=\mathbb E\left[\frac{\mathrm dX_t}{\mathrm dt}\,\middle|\,X_t=x\right]\tag{29}
$$

$$
v_t(x)=\mathbb E[\xi\,|\,X_t=x]-\mathbb E[X_0\,|\,X_t=x].\tag{30}
$$

**漂移与扩散系数**：任何形如（28）的仿射插值都是线性 SDE $\mathrm dX_t=f_tX_t\,\mathrm dt+g_t\,\mathrm dB_t$ 的边缘分布：对这样的 SDE，$X_t\,|\,X_0$ 的条件均值与方差满足 $\frac{\mathrm d\alpha_t}{\mathrm dt}=f_t\alpha_t$ 与 $\frac{\mathrm d\beta_t^2}{\mathrm dt}=2f_t\beta_t^2+g_t^2$。反解这些关系得

$$
f_t=\frac{1}{\alpha_t}\frac{\mathrm d\alpha_t}{\mathrm dt},\qquad g_t^2=\frac{2}{\beta_t}\left(\frac{\mathrm d\beta_t}{\mathrm dt}-f_t\beta_t\right),\tag{31}
$$

代入 $\alpha_t=1-t$、$\beta_t=t$ 即得 SD3 系数

$$
f_t(x)=-\frac{x}{1-t},\qquad g_t^2=\frac{2t}{1-t}.\tag{32}
$$

**分数**：逆漂移（3）通过 Stein 分数表达，而流匹配参数化并不直接提供分数；但它是速率的仿射函数。对（28）取条件期望得 $x=(1-t)\mathbb E[X_0\,|\,X_t=x]+t\mathbb E[\xi\,|\,X_t=x]$；再从（30）中消去 $\mathbb E[X_0\,|\,X_t=x]$ 得

$$
v_t(x)=\mathbb E[\xi\,|\,X_t=x]-\frac{x}{1-t}.\tag{33}
$$

把（33）与 $s_t(x)=-\mathbb E[\xi\,|\,X_t=x]/\beta_t$（Karras et al., 2022）结合，得

$$
s_t(x)=-\frac{x+(1-t)v_t(x)}{t}.\tag{34}
$$

**逆过程**：把 $f_{1-t}(x)=-x/t$、$g_{1-t}^2=2(1-t)/t$ 与（34）在时刻 $1-t$ 处取值后代入逆漂移（3），得

$$
b_t^q(x)=-\frac{(1+\varepsilon^2)v_{1-t}(x)-\varepsilon^2x}{t},\tag{35}
$$

而逆过程（2）为 $\mathrm dY_t=b_t^q(Y_t)\,\mathrm dt+\varepsilon g_{1-t}\,\mathrm dW_t$，其中 $g_{1-t}=\sqrt{2(1-t)/t}$。

**转移核**：在均匀网格 $t_n=n\gamma$ 上应用 Euler–Maruyama 离散化（4），在给定 $Y_n=y$ 条件下得到（5）中的高斯转移 $Q_n(\cdot\mid y)=\mathcal N\left(m_n^q(y),\sigma_n^2\mathbf I_d\right)$，其中

$$
m_n^q(y)=y-\gamma\left[(1+\varepsilon^2)v_{1-t_n}(y)+\varepsilon^2\frac{y}{t_n}\right],\tag{36}
$$

$$
\sigma_n=\sqrt{\gamma}\varepsilon g_{1-t_n}=\varepsilon\sqrt{2\gamma\frac{1-t_n}{t_n}}.\tag{37}
$$

尺度（37）仅是时间网格与搅动水平的函数，特别地不依赖状态。把延迟速率代入（36）所得的草稿核因此与目标核共享方差、只在其均值上不同——这正是（12）—（15）所需的结构。于是 RMC 与 D-GRS 都无需修改即可用于 SD3。

**注 3（搅动的作用）**：搅动水平不能取为零。当 $\varepsilon=0$ 时尺度（37）消失，两种转移都退化为点质量、其全变差距离为 1，故每个提议都被拒绝、推测退化为标准采样器。其对接受率的影响并不单调：增大 $\varepsilon$ 会增大 $\delta=\|m_n^q-m_n^p\|/\sigma_n$ 的分母，但也会增大分子——既通过（36）中的因子 $1+\varepsilon^2$，也通过草拟状态相对延迟速率求值点的更大位移。

**时间步偏移**：由于 SD3 在 $1024\times1024$ 分辨率上训练、其噪声计划与分辨率相关，我们沿用 Esser et al. (2024)，在评估 $v_\theta$ 前对均匀网格施加偏移

$$
t\mapsto\frac{\kappa t}{1+(\kappa-1)t},\qquad \kappa=3.0,\tag{38}
$$

以适配本文实验设置的 $512\times512$ 生成。上述转换不受影响，因为（34）与（35）在 $t$ 上逐点成立。

### C.4 正确性的定性评估

为在图像生成语境下定性评估所提算法 D-GRS 与基线实现 RMC（De Bortoli et al., 2025）的正确性，我们展示第 5 节实验设置下生成的 64 张图像。图 8 与图 9 分别给出 CIFAR-10 与 FFHQ 的生成图像；表 2 报告用 SD3 做条件图像生成所用的 COCO 2014 提示，图 10 展示生成图像。

**图 8**：在 $K=4$、$L=4$、$T=100$ 下随机选取的 64 张 CIFAR-10 样本（$32\times32$），搅动 $\varepsilon$ 递增。上排：RMC；下排：D-GRS。
**图 9**：在 $K=4$、$L=4$、$T=100$ 下生成的前 64 张 FFHQ 样本（$64\times64$），搅动 $\varepsilon$ 递增。上排：RMC；下排：D-GRS。
**图 10**：以表 2 所列提示为条件、用 (a) RMC 与 (b) D-GRS（分别取 $(K=1,L=56)$ 与 $(K=7,L=2)$）在 SD3 下随机选取生成的前 64 张 $512\times512$ 图像（第 5.3 节设置：$T=50$、免费引导 7、搅动 $\varepsilon=0.8$）。

**表 2　用于图 10 条件生成的 COCO 2014 前 64 个提示**（按原表逐格转录，编号与提示原文保持英文）

| 编号 | 提示 | 编号 | 提示 |
| --- | --- | --- | --- |
| 1 | a person at a table with a sandwich and a drink | 33 | A Ma and Pa statue outside some high rise office buildings |
| 2 | A land with a lot of different animals. | 34 | A guy is skiing there is a lot of snow. |
| 3 | A street light at an intersection in a small town. | 35 | a large blue bowl of almonds, bananas and walnuts |
| 4 | A cat sitting on top of a laptop computer. | 36 | Dog jumping in air to catch flying disc with adult sitting in background. |
| 5 | A group of people sitting around a table together | 37 | A woman holding an umbrella standing next to a black wall. |
| 6 | A horse in the water next to the birds | 38 | A lady is in the hospital and sitting in a chair smiling. |
| 7 | a man sitting down with a telephone up to his ear | 39 | A bathroom that has a broken wall in the shower. |
| 8 | A vase with a bird on it and a matching wineglass with flowers on it. | 40 | A long, narrow yellow kitchen with black and white floor tiles. |
| 9 | A man sitting in a chair holding a remote and watching television in a living room. | 41 | a blue bird sitting on someone’s arm in a room |
| 10 | a stack of traffic signs on a pole next to a street. | 42 | A table with a huge glass vase and fake flowers come out of it. |
| 11 | A red motorcycle parked next to a beach near the ocean. | 43 | A man sitting next to a woman at a table. |
| 12 | The grey cat with white feet sits on a televsion set. | 44 | A few sliced of olive pizza sitting on a white plate. |
| 13 | A couple of people that are standing near a train. | 45 | A group of children sitting around each other. |
| 14 | A young man doing a skateboard trick outside. | 46 | an image of boy on a skateboard doing tricks |
| 15 | A boat sitting on the ground, where their use to be water. | 47 | A slice of layer cake on a plate that is garnished |
| 16 | A kitchen area with two refrigerators and a microwave. | 48 | A bridge in a city on an overcast day. |
| 17 | Black and White picture of figurines around a vase with flowers | 49 | A skateboard that has its wheels on the floor. |
| 18 | some baseball players are playing baseball on a field | 50 | A group of bicycles on a subway train. |
| 19 | Animals surrounding a car and making a large mess. | 51 | The woman sits on the curb writing on a notepad near a fire hydrant. |
| 20 | a bird stands on top of a laptop keyboard | 52 | a man getting ready to hit a tennis ball with a racket |
| 21 | A person holding up a paper with a red stop sign on it. | 53 | A white polar bear laying on top of a pool of water. |
| 22 | This is an image of a row of scooters | 54 | There are keyboard keys on a wooden table. |
| 23 | a train on a train track with a sky background | 55 | A variety of old motorcycles on display in a shop |
| 24 | A bird aggressively protects his patch of turf. | 56 | A cat sleeping on the tv with his paw hanging down. |
| 25 | Two airplanes flying through a blue sky with smoke pouring out of their rear ends. | 57 | A group of people riding skis down a snow covered slope. |
| 26 | a building with a clock near the ceiling and skylights | 58 | A bunch of goats are eating out of a box |
| 27 | a very tall giraffe standing in the wilderness | 59 | A man standing on a grass tennis court and holding a tennis racket in his hand. |
| 28 | An umbrella lies behind a park bench that a small television is on. | 60 | A large clock tower over a church next to trees. |
| 29 | a lime and green bus parked on a grass field parking lot. | 61 | A young boy doing a trick on his skate board. |
| 30 | A man is surfboarding right up to the steep shoreline. | 62 | A white bath tub sitting under a window next to a sink. |
| 31 | one plane flies upside down over another plane | 63 | A cat is sitting outside on the ledge of a window. |
| 32 | Two girls sitting on the ground, one with a hat on, the other with an open umbrella. | 64 | Some people are riding along in a horse drawn Carriage |

## 图注与表注

**图 1**：推测采样的效率前沿（不同提议预算 $B$ 下可达到的最大加速倍数，比较 RMC 与 D-GRS）。
**图 2**：$B=|\mathcal V|$ 下链式与树式草拟对固定计算预算的分配（$W=7$ 个状态；RMC 建立单条提议链，D-GRS 建立 $K=2$、$L=2$ 的 $K$ 叉树）。
**图 3**：混合高斯设置下每个 $(K,L)$ 组合 100 条独立轨迹的期望加速（左：RMC；右：D-GRS）。
**图 4**：CIFAR-10（上）与 FFHQ（下）上不同随机性 $\epsilon\in\{0.1,0.3,0.6\}$ 时 NFE 加速相对提议预算 $B$ 的变化。
**图 5**：相对原始目标采样器的期望 NFE 加速随 $K$ 的变化（$512\times512$ 分辨率，$\varepsilon=0.8$，$L=2$）。
**图 6**：不同草稿提议数 $K$ 下 D-GRS 的每步接受概率。
**图 7**：混合高斯目标上 NFE 加速随树宽 $K$ 的变化（按前瞻深度 $L$ 分层）。
**图 8**：$K=4$、$L=4$、$T=100$ 下随机选取的 64 张 CIFAR-10 样本（$32\times32$），搅动 $\varepsilon$ 递增（上排 RMC、下排 D-GRS）。
**图 9**：$K=4$、$L=4$、$T=100$ 下生成的前 64 张 FFHQ 样本（$64\times64$），搅动 $\varepsilon$ 递增（上排 RMC、下排 D-GRS）。
**图 10**：SD3 下以表 2 提示为条件随机选取生成的前 64 张 $512\times512$ 图像：(a) RMC；(b) D-GRS。

**表注**：表 1 为不同 $K$ 下 D-GRS 与 RMC 的 CLIP 分数（$L=2$，$n=100$ 个提示，均值 ± 均值的标准误，目标基线 $26.90\pm0.37$），已在本页第 5.3 节按原表逐格转录；表 2 为用于图 10 条件生成的 COCO 2014 前 64 个提示（英文原文），已在附录 C.4 逐格转录。算法 1—3 已按原文逐行转录。

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 1 节引言；第 2 节问题设定（式（1）—（7），图 1）；第 3 节推测算法（3.1 通用模板、算法 1、秩 1 投影，式（8）—（15），图 2；3.2 RMC 与算法 2；3.3 D-GRS 与算法 3，式（16）—（17））；第 4 节性能分析（定理 1—2，式（18）—（20））；第 5 节实验（5.1—5.3，图 3—5，表 1 逐格）；第 6 节结论与未来工作；参考文献（字母序作者—年份格式，英文原条目）；附录 A 文献综述（A.1—A.3）；附录 B 性能分析证明（式（21）—（27），定理 3—4、注 1—2，图 6）；附录 C 扩展实验结果（C.1 实现细节、C.2 $K$ 与 $L$ 的价值、C.3 SD3 转换（式（28）—（38），注 3）、C.4 定性评估，图 7—10，表 2 提示逐格）；图 1—10 图注与表注。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—10 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 1 已用 PyMuPDF 渲染原 PDF 第 16 页逐格核对，表 2 为 64 条英文提示原文照录；④作者简介与版权声明不在正文范围，未收录；⑤原文式（19）中生存函数符号在抽取文本中印作 $\Phi$ 而正文又定义 $\bar\Phi$，译文按原文式（20）语境统一记作 $\bar\Phi$ 并此说明；⑥原文 3.1 节小标题编号存在重复（如两个 "3.1"），译文按内容顺序整理为 3.1、3.1.4 等。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
