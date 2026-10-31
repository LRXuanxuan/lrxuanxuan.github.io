---
layout: page
title: "分布式 MIMO 下真实世界坐标的信道图谱｜中文全文译文"
permalink: /papers/translations/2026-10-02-2406-13722-channel-charting-in-real-world-coordinates-with-distributed-mimo/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/60e0b265df0ae795/) · [原文 arXiv](https://arxiv.org/abs/2406.13722) · [全部目录](/papers/catalog/)

# 分布式 MIMO 下真实世界坐标的信道图谱

**原题：** Channel Charting in Real-World Coordinates with Distributed MIMO  
**作者：** Sueda Taner、Victoria Palhares、Christoph Studer（瑞士苏黎世联邦理工学院（ETH Zurich）信息技术与电气工程系）  
**版本：** arXiv:2406.13722v2（cs.IT），v2 于 2025 年 4 月 8 日发布，原文 15 页；作者工作部分由 ETH Research Grant、瑞士国家科学基金会（SNSF）资助 200021_207314，以及 CHIST-ERA 项目 CHASER（CHIST-ERA-22-WAI-01，经 SNSF 资助 20CH21_218704）支持。本文初步版本发表于 2023 IEEE GLOBECOM [1]；作者感谢 Remcom 提供 Wireless InSite 射线追踪软件许可，并感谢 Olav Tirkkonen 与 Maxime Guillaud 关于真实世界坐标信道图谱的讨论。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、表 I—表 IV、图注、参考文献（英文原条目）按原文结构录入；原文无附录；逐句逐式终校未做。

## 摘要

信道图谱是一种新兴的自监督方法，它把信道状态信息（channel-state information，CSI）映射到低维潜空间（即**信道图谱**），该潜空间表示用户设备（user equipment，UE）的伪位置。信道图谱能够保留局部几何，即相邻 UE 在图谱中也相邻（反之亦然）；但伪位置处于任意坐标系中，全局几何通常不被保留。为把信道图谱嵌入真实世界坐标，本文首先针对**只有接入点（access point，AP）位置已知**的分布式多输入多输出（distributed MIMO，D-MIMO）无线系统提出一种**双边定位损失**（bilateration loss）。该损失的思路是比较成对 AP 处的接收功率，以判断在信道图谱中某个 UE 应被放置在更靠近哪一个 AP 的位置。随后，本文提出一种**视距（line-of-sight，LoS）边界框损失**，把 UE 放入每个被估计为与 UE 存在 LoS 路径的 AP 的预定义 LoS 区域内。本文用基于射线追踪与基于实测的信道向量，展示了把这两种损失函数与基于神经网络的信道图谱相结合的有效性。所提方法优于多个基线，并保持信道图谱的自监督特性：它既不依赖几何传播模型，也不依赖任何 UE 位置真值信息。

## I. 引言

信道图谱是一种自监督方法，仅通过处理基础设施基站（BS）或接入点（AP）侧估计的信道状态信息（CSI）即可提取用户设备（UE）的伪位置 [3]。其核心思想是对大量 CSI 特征数据库做降维，这些特征表示无线信道的大尺度衰落特性，例如到达时间（ToA）、到达角（AoA）、功率—时延谱等。降维得到的低维潜空间即所谓**信道图谱**，它与 UE 位置相关联。更具体地说，真实空间中相邻的 UE 在信道图谱中也相邻，反之亦然。学到的信道图谱可用于辅助无线系统中大量依赖 UE 位置信息的应用，例如导频分配 [4]、波束管理 [5]、[6]、信道容量预测 [7] 等；概述见 [8]。

尽管信道图谱保留了 UE 位置的局部几何，即相邻 UE 对应图谱中相邻的点（反之亦然），全局几何通常被扭曲，例如被缩放、旋转与弯曲。此外，学到的信道图谱以任意坐标表示，这是自监督学习的直接结果。处理多个分布式多天线 AP 所采集 CSI 的**多点信道图谱**技术已被证明能改善全局几何 [9]—[11]；但所得信道图谱仍是伪位置，与真实世界坐标没有对应关系。本文正是要解决这一局限：我们旨在学习可按真实世界坐标解释的信道图谱。学习这类真实坐标信道图谱具有以下益处与示例用例：

- **高效切换：** 把 CSI 映射到真实世界坐标后，可预测 UE 轨迹（考虑 UE 速度与方向），从而实现向最佳下一小区成功切换。
- **改进波束赋形：** 获得 UE 位置估计有助于改善波束对准，把强信号发送到期望方向。
- **动态资源分配：** 获得 UE 位置估计可改善导频分配与用户调度；例如 BS 可为彼此靠近的 UE 分配不同导频与时隙。
- **更明智的网络部署规划：** 长期构建位置地图可揭示业务模式与覆盖空洞，从而更好地布设 AP。

真实世界坐标下的信道图谱能改善此类用例，因为此时图谱中无论近处还是远处的距离都有物理含义；而在传统信道图谱中只有邻近距离信息可靠。

### A. 贡献

本文提出在分布式多输入多输出（D-MIMO）场景下学习基于神经网络的信道图谱函数、从而生成真实世界坐标信道图谱的新方法。主要贡献概括如下：

- 本文把会议版 [1] 中针对视距（LoS）场景提出的双边定位损失加以扩展，通过从损失计算中排除非 LoS AP 来适应存在非 LoS 传播的场景；此处依据功率阈值判定非 LoS AP。
- 本文提出一种新的 **LoS 边界框损失**，把 UE 放入接收功率高于上述功率阈值的那些 AP 的 LoS 区域。
- 本文提出把双边定位损失与 LoS 边界框损失，与 [12] 中基于时间戳的三元组损失**组合**，以提升信道图谱质量。
- 本文在一个室内与一个室外场景（基于商用射线追踪器 [13] 得到的信道向量）以及一个基于真实测量的室内场景（[2]）中验证方法有效性。

需要强调，所提方法是**弱监督**的：仅需 (i) AP 位置已知，(ii) 每个 AP 周围 LoS 区域的近似知识；不需要几何模型、不需要 AP 精确同步，也不需要带 UE 真实位置标签的 CSI 样本。

### B. 相关既有工作

文献中已有大量基于无线电的定位方法 [14]—[17]。虽然本文的主要目标并非精确定位，为完整起见仍简要回顾。基于几何模型的定位方法（例如依赖 ToA 与／或 AoA 的方法，见 [18] 及其参考文献）可在具备 LoS 连通性的环境中实现精确定位；但这些方法依赖 AP 精确同步，在非 LoS 与多径场景中性能退化。另一类无需 AP 同步的无线电定位技术是指纹定位 [19]—[28]。CSI 指纹方法依赖离线采集大规模 CSI 数据库，并须已知每个 CSI 样本对应的 UE 真实位置；然而该方法成本高昂：搭建真实位置参考系统既繁琐又昂贵，而且物理环境一旦发生显著变化，带真值标签的 CSI 测量活动就必须重做。

为减少指纹方法所需的带真值标签 CSI 样本数，已有工作提出半监督学习方法 [29]—[33]。这一类方法假设训练数据的一个（小）子集具有 UE 真实位置，并把已知位置纳入信道图谱函数的学习。文献 [34] 则从另一角度处理真值标签获取问题：利用惯性测量单元（IMU）的伪标签，摆脱对难以获取的精确位置标签的依赖。与这些仍需要真实位置参考系统的方法不同，本文方法不需要 CSI 样本的真实位置信息。

更近期，[35]—[37] 提出了另一类把真实世界位置直接纳入信道图谱的方法。[35] 依赖若干带区域标签的 CSI 样本来为每个 CSI 样本预测区域，该区域信息随后用于弱监督训练。[36]、[37] 提出利用估计的 ToA 或 AoA 辅助信道图谱的损失函数。如前所述，这些方法需要 AP 精确同步；与之相反，本文既不需要带区域标签的 CSI 样本，也不需要 AP 精确同步。

另有一类方法是先以自监督方式构造信道图谱，再用仿射变换把信道图谱映射到真实世界位置 [36]、[38]—[41]。学习此类仿射变换的方式多种多样：[38] 在信道图谱中估计 AP 位置，再把这些位置映射到 AP 的真实世界位置；[40] 假设环境地图先验已知，并试图把信道图谱与该环境地图匹配；[39]、[41] 使用若干 UE 真实位置，而 [36] 使用通过几何模型定位技术获得的 UE 位置估计。此类变换类方法在信道图谱相对真实位置存在**非仿射扭曲**时会失效，且可能需要带标签 CSI 样本；与它们不同，本文以弱监督方式**直接学习嵌入真实世界坐标的信道图谱**。

> **脚注 1（原文）：** 本文区分在神经网络训练期间使用真实位置的方法 [19]—[33] 与在训练之后使用真实位置的方法 [39]、[41]；"监督"与"半监督"两词仅用于指第一类方法。

### C. 记号

列向量与矩阵分别用粗体小写与粗体大写字母表示，集合用大写花体字母表示。矩阵 $\mathbf A$ 的按列向量化记为 $\operatorname{vec}(\mathbf A)$。对向量 $\mathbf a$，欧氏范数为 $\lVert\mathbf a\rVert$，逐元素绝对值为 $|\mathbf a|$；对矩阵 $\mathbf A$，Frobenius 范数为 $\lVert\mathbf A\rVert_F$。算子 $(x)_+=\max\{x,0\}$ 为修正线性单元（ReLU）。指示函数记为 $\mathbf 1\{c\}$：条件 $c$ 成立时为 1，否则为 0。

### D. 论文结构

本文余下部分安排如下：第 II 节介绍信道图谱基础；第 III 节提出把信道图谱嵌入真实世界坐标的新损失函数；第 IV 节详述所提方法、基线与性能指标；第 V 节给出三个不同场景的仿真结果；第 VI 节总结全文。

## II. 信道图谱基础

本节简要概述信道图谱基础，详述系统模型，并讨论使用基于三元组学习方法 [12] 的神经网络参数化信道图谱——该方法也是第 III 节所提方法的一部分。

### A. 运行原理

信道图谱通常分两个阶段运行 [3]。第一阶段采集大量不同 UE 位置的 CSI，并把刻画无线信道大尺度衰落特性的 CSI 特征存入数据库。随后对 CSI 特征数据库应用参数化降维 [42]，学习信道图谱函数（例如用神经网络实现），把 CSI 特征映射到低维表示，即信道图谱。信道图谱具有如下有用性质：从相邻位置发送信号的 UE 在信道图谱中也被放在相邻位置，反之亦然。再次强调，信道图谱学习是**自监督**的，即不需要关于 UE 位置的任何真值信息。第二阶段使用信道图谱函数把新 CSI 特征映射到信道图谱中的点，这些点表示发送 UE 的伪位置。

### B. 系统模型

考虑一个 D-MIMO 无线系统：一个或多个单天线 UE 向 $A$ 个分布式 AP 发送导频，每个 AP 配 $M_R$ 根天线，因此接收天线总数为 $B=AM_R$。考虑占用 $W$ 个子载波的正交频分复用（OFDM）传输。假设 AP $a\in\mathcal A=\{1,\ldots,A\}$ 位于物理空间中的位置 $\mathbf x^{(a)}\in\mathbb R^{3}$，且这些位置已知。此外，假设已知每个 AP 的 LoS 区域的近似信息，其以包含该 AP 的房间（或开阔空间）的最小与最大 $x$、$y$ 坐标表示，记为 $x^{(a)}_{\min},x^{(a)}_{\max},y^{(a)}_{\min},y^{(a)}_{\max}\in\mathbb R$，它们定义了一个包围 LoS 区域的矩形边界框（脚注 2、3）。把 AP $a$ 的 LoS 边界框记为

$$
\mathcal B^{(a)}=\left\{(x,y)\in\mathbb R^{2}:x\in[x^{(a)}_{\min},x^{(a)}_{\max}],\ y\in[y^{(a)}_{\min},y^{(a)}_{\max}]\right\}.\tag{1}
$$

设共收到某个 UE 在（未知）位置 $\mathbf x^{(n)}\in\mathbb R^{3}$、时间戳 $t_n$ 处的 $N$ 次导频发送，$n\in\mathcal N=\{1,\ldots,N\}$。第 $n$ 次发送使 AP $a$ 能在时间戳 $t_n$ 与子载波 $w$ 上估计相关 CSI 向量 $\mathbf h^{(n,a)}_w\in\mathbb C^{M_R}$。把所有 AP 的信道向量 $\{\mathbf h^{(n,a)}_w\}_{a=1}^{A}$ 堆叠起来，可构造包含全部 $B$ 个接收天线上子载波 $w$ 的 CSI 向量 $\mathbf h^{(n)}_w\in\mathbb C^{B}$。需要强调，采集 CSI 时不要求 $A$ 个 AP 完全同步；唯一要求是各 AP 估计的 CSI 属于同一个在（近似）同一时间戳 $t_n$ 从（近似）同一位置 $\mathbf x^{(n)}$ 发送的 UE。最后把所有子载波的信道向量拼接，构造与时间戳 $t_n$ 处 UE 关联的 $B\times W$ CSI 矩阵 $\mathbf H^{(n)}=[\mathbf h^{(n)}_1,\ldots,\mathbf h^{(n)}_W]$。完整 CSI 数据库由矩阵集合 $\{\mathbf H^{(n)}\}_{n\in\mathcal N}$ 给出。

> **脚注 2（原文）：** 已知 AP 位置及其 LoS 区域（例如 AP 所在房间的尺寸与形状）是合理假设，因为 AP 通常并非随意布放，而是依据精心设计的部署方案安装。

> **脚注 3（原文）：** 采用矩形边界框的原因有二：(i) 房间常为矩形，该假设实用；(ii) 相比任意形状（如多边形），矩形边界框给出更简单的数学表达式，训练神经网络时更易实现；对任意形状的探索留待未来工作。

### C. CSI 特征提取

为不受小尺度衰落影响、并对系统与硬件损伤（例如 AP 间相位偏移）具有稳健性，本文把估计的 CSI 矩阵转换为 CSI 特征 [3]、[12]、[25]，以提取无线信道的大尺度衰落特性。下文采用 [21]、[30] 中的 CSI 特征。首先，对 $W$ 个占用子载波做逆离散傅里叶变换，把频域 CSI 变换到（近似）时延域。由于大部分接收功率应集中在前几个抽头，对时延域 CSI 矩阵截断、只取前 $C\ll W$ 列；把截断后的时延域 CSI 矩阵记为 $\widehat{\mathbf H}^{(n)}\in\mathbb C^{B\times C}$。将该矩阵向量化得 $\widehat{\mathbf h}^{(n)}=\operatorname{vec}(\widehat{\mathbf H}^{(n)})\in\mathbb C^{D'}$，其中 $D'=BC$。最后计算单位范数 CSI 特征向量 $\mathbf f^{(n)}\in\mathbb R^{D'}$：

$$
\mathbf f^{(n)}=\frac{|\widehat{\mathbf h}^{(n)}|}{\lVert\widehat{\mathbf h}^{(n)}\rVert},\tag{2}
$$

该式通过逐元素取绝对值来忽略 (i) 相位偏移（例如由 AP 未精确同步引起），并通过归一化所得向量来忽略 (ii) UE 的发射功率（例如 UE 可自行设置发射功率）。完整 CSI 特征数据集由特征向量集合 $\{\mathbf f^{(n)}\}_{n\in\mathcal N}$ 给出。

### D. 神经网络信道图谱

有了 CSI 特征数据库，即可学习信道图谱函数 $g_{\boldsymbol\theta}:\mathbb R^{D'}\to\mathbb R^{D}$，把 CSI 特征向量 $\mathbf f^{(n)}$ 映射为信道图谱中的 $D$ 维伪位置：$\widehat{\mathbf x}^{(n)}=g_{\boldsymbol\theta}(\mathbf f^{(n)})$。本文把函数 $g_{\boldsymbol\theta}$ 实现为神经网络，其参数向量 $\boldsymbol\theta$ 包含全部权重与偏置。真实世界位置处于三维空间、坐标为 $(x,y,z)$；若例如 $z$ 坐标在 AP 与 UE 位置间固定，则信道图谱可嵌入更少维度。因此假设 $D\le3$，把 $\mathbf x^{(n)}$ 与 $\mathbf x^{(a)}$ 中前 $D$ 个元素构成的截断向量分别记为 $\tilde{\mathbf x}^{(n)}\in\mathbb R^{D}$ 与 $\tilde{\mathbf x}^{(a)}\in\mathbb R^{D}$。

文献中已有多种学习基于神经网络的信道图谱函数的方法，例如自编码器 [3]、[29]、孪生神经网络 [30]，以及用基于时间戳的三元组损失训练的神经网络 [12]、[43]、[44]。下文聚焦 [12] 中基于时间戳的三元组损失方法。

### E. 基于三元组的信道图谱

假设所有 CSI 特征的时间戳可得，文献 [12] 提出在比较潜空间中的成对距离时利用该辅助信息。为此，从样本索引集合 $\mathcal N$ 定义如下三元组集合：

$$
\mathcal T=\{(n,c,f)\in\mathcal N^{3}:0<|t_n-t_c|\le T_c<|t_n-t_f|\},\tag{3}
$$

其中 $T_c>0$ 为相干时间参数，把 CSI 特征划分为时间上"近"或"远"。若 $t_n$ 相对 $t_f$ 更接近 $t_c$，则应预期时间戳 $t_n$ 与 $t_c$ 处 UE 位置之间的欧氏距离小于 $t_n$ 与 $t_f$ 处的位置距离。该性质可用如下三元组损失表达 [12]：

$$
\mathcal L_{\mathrm t}=\frac{1}{|\mathcal T|}\sum_{(n,c,f)\in\mathcal T}\Big(\lVert g_{\boldsymbol\theta}(\mathbf f^{(n)})-g_{\boldsymbol\theta}(\mathbf f^{(c)})\rVert-\lVert g_{\boldsymbol\theta}(\mathbf f^{(n)})-g_{\boldsymbol\theta}(\mathbf f^{(f)})\rVert+M_{\mathrm t}\Big)_{+}.\tag{4}
$$

这里边际参数 $M_{\mathrm t}\ge0$ 强制 $g_{\boldsymbol\theta}(\mathbf f^{(n)})$ 到 $g_{\boldsymbol\theta}(\mathbf f^{(c)})$ 的距离至少比到 $g_{\boldsymbol\theta}(\mathbf f^{(f)})$ 近 $M_{\mathrm t}$。

如 [12] 所示，可通过最小化损失 $\mathcal L_{\mathrm t}$ 训练实现信道图谱函数 $g_{\boldsymbol\theta}$ 的神经网络；该方法**自监督**，因为损失仅使用训练数据集、不需要任何额外的真值标签（如 UE 位置）。再次强调，所得信道图谱的坐标系是任意的（例如可被缩放、旋转与全局弯曲）。本文接下来提出的方法正是要解决既有信道图谱流水线的这一局限。

## III. 真实世界坐标下的信道图谱

本节提出两种损失函数，可直接在真实世界坐标中学习信道图谱。第一种损失利用 D-MIMO 场景中已知的 AP 位置；第二种损失依赖每个 AP 周围 LoS 区域的已知边界框。再次强调，既不需要几何模型，也不需要 AP 间精确时间同步，更不需要带 UE 位置标签的 CSI 样本。

所提两种损失都依赖 LoS AP。为此采用如下简单流程估计某个 AP 与第 $n$ 个 UE 位置之间是 LoS 还是非 LoS 信道：令 $\widehat{\mathbf H}^{(n,a)}\in\mathbb C^{M_R\times C}$ 表示 $\widehat{\mathbf H}^{(n)}$ 中对应 AP $a$ 的 $M_R$ 行子矩阵。计算 UE 与第 $a$ 个 AP 相关的接收功率为 $P^{(n,a)}=20\log_{10}(\lVert\widehat{\mathbf H}^{(n,a)}\rVert_F)$、$a\in\mathcal A$。把 $P^{(n,a)}$ 关于 $t_n$ 作图，可观察到功率出现瞬时大幅下降的位置，据此人工设定功率阈值 $P_{\mathrm{thr}}$；第 V-B 节给出选取该阈值的具体示例。把接收功率高于该阈值的 AP 判为"处于 LoS"，其余判为"不处于 LoS"。对每个 UE 位置构造（估计的）LoS AP 集合如下（脚注 4）：

$$
\widetilde{\mathcal A}^{(n)}=\left\{a\in\mathcal A:P^{(n,a)}>P_{\mathrm{thr}}\right\}.\tag{5}
$$

所提损失函数使用 $\widetilde{\mathcal A}^{(n)}$，详见下文。

> **脚注 4（原文）：** 为简单起见，本文采用功率阈值法做 LoS／非 LoS 分类；更先进的 LoS／非 LoS 分类方法见 [45]—[47] 及其参考文献，它们以更高计算复杂度与可能更多超参数为代价。

### A. 双边定位损失

假设 UE 的导频信号在所考虑 D-MIMO 场景中被多个 AP 接收，双边定位损失旨在利用已知 AP 位置，把 UE 放置在比另一个 AP 更靠近某个 AP 的位置。此处用于推断 UE 真实世界位置的 CSI 线索是每个 LoS AP 的 CSI 矩阵相对功率：如所预期，在 LoS 条件下相对接收功率更高的 AP 往往更接近 UE，而在非 LoS 条件下功率不提供距离线索。因此双边定位损失只使用式 (5) 中 $\widetilde{\mathcal A}^{(n)}$ 内的 AP。具体地，定义如下 AP 对集合：

$$
\mathcal P^{(n)}=\left\{(a_c,a_f)\in(\widetilde{\mathcal A}^{(n)})^{2}:P^{(n,a_c)}>P^{(n,a_f)}+M_{\mathrm p}\right\}.\tag{6}
$$

集合 $\mathcal P^{(n)}$ 生成 AP 索引对 $(a_c,a_f)$，其中两个所选 AP 分别作为第 $n$ 个 UE 位置的近、远参考点。这里边际参数 $M_{\mathrm p}\ge0$ 强制集合 $\mathcal P^{(n)}$ 只包含信道功率相差至少 $M_{\mathrm p}$ 的 AP 对。由式 (6) 中集合 $\mathcal P^{(n)}$ 得到的假设"UE $n$ 应比 AP $a_f$ 更靠近 AP $a_c$"，导出如下双边定位损失：

$$
\mathcal L_{\mathrm{bi}}=\frac{1}{\sum_{n\in\mathcal N}|\mathcal P^{(n)}|}\sum_{n\in\mathcal N}\sum_{(a_c,a_f)\in\mathcal P^{(n)}}\Big(\lVert g_{\boldsymbol\theta}(\mathbf f^{(n)})-\tilde{\mathbf x}^{(a_c)}\rVert-\lVert g_{\boldsymbol\theta}(\mathbf f^{(n)})-\tilde{\mathbf x}^{(a_f)}\rVert+M_{\mathrm b}\Big)_{+}.\tag{7}
$$

这里边际参数 $M_{\mathrm b}\ge0$ 强制 $g_{\boldsymbol\theta}(\mathbf f^{(n)})$ 到 $a_c$ 的距离至少比到 $a_f$ 近 $M_{\mathrm b}$。强调损失 $\mathcal L_{\mathrm{bi}}$ 并不假设每个 AP 与 UE 之间应有多大距离；我们仅推断到两个 AP 的相对距离。此外，虽然关于 UE 与 AP 之间功率—距离关系的基本假设未必总成立，我们并不追求此类保证——第 V-A2 节给出了具体例子支持这一论断。

通过最小化式 (7) 的损失 $\mathcal L_{\mathrm{bi}}$ 可训练实现信道图谱函数 $g_{\boldsymbol\theta}$ 的神经网络；该方法**弱监督**，因为损失只纳入真值标签的部分信息（即仅使用 AP 位置信息）。

作者指出，文献 [35] 也提出过基于接收功率的损失；但该损失比较的是同一 AP 与 UE 之间信道在两个时间戳 $t_i$、$t_k$ 处两个 CSI 向量的功率，以推断 $\mathbf x^{(i)}$ 还是 $\mathbf x^{(k)}$ 更接近该 AP。该损失没有利用"多个 AP 同时接收该 UE 导频信号"这一事实。相反，式 (7) 的双边定位损失逐个考虑每个 CSI 特征，并比较一对 AP 之间的接收功率；这意味着该损失不依赖时间戳。因此，双边定位损失也可用于时间戳无关的场景，例如 UE 静止的多用户场景。

作者还指出，所提双边定位损失存在以下局限。第一，它只能用于与至少一对 AP 存在 LoS 路径的 UE 位置。第二，若集合 $\mathcal P^{(n)}$ 不含多个 AP 对，可能不足以准确定位第 $n$ 个 UE。例如，假设 $\mathcal P^{(n)}$ 只有一个 AP 对，低功率接收 AP $a_f$ 在左、高功率接收 AP $a_c$ 在右；此时双边定位损失项不仅会在位于 $a_c$ 与两 AP 中点之间的输入位置处为零，也会在 $a_c$ 右侧的另一个位置处为零，从而在准确定位 UE 时产生歧义。本文接下来提出的损失函数旨在缓解此类歧义，因为它同样适用于只有一个 LoS AP 的 UE 位置。

### B. LoS 边界框损失

假设对每个 AP 的 LoS 区域都有式 (1) 定义的边界框。LoS 边界框损失旨在把 UE 放入每个被估计为与 UE 存在 LoS 路径的 AP 的 LoS 边界框内。此处用于推断 UE 真实世界位置的 CSI 线索是每个 AP 的接收功率：若某 AP 的接收功率足够高，则应预期 UE 位于该 AP 的 LoS 边界框内；由此得到如下 LoS 边界框损失：

$$
\mathcal L_{\mathrm{box}}=\frac{1}{\sum_{n=1}^{N}|\widetilde{\mathcal A}^{(n)}|}\sum_{n\in\mathcal N}\sum_{a\in\widetilde{\mathcal A}^{(n)}}\ell_a(g_{\boldsymbol\theta}(\mathbf f^{(n)})).\tag{8}
$$

这里用第 $a$ 个 AP 的矩形 LoS 边界框定义 $\ell_a(\mathbf x):\mathbb R^{D}\to\mathbb R$；例如对 $D=2$、$\mathbf x=[x\ y]^{T}$ 有（脚注 5）

$$
\ell_a(\mathbf x)=\mathbf 1\{x\notin[x^{(a)}_{\min},x^{(a)}_{\max}]\}\min_{x'\in\{x^{(a)}_{\min},x^{(a)}_{\max}\}}|x'-x|^{2}
+\mathbf 1\{y\notin[y^{(a)}_{\min},y^{(a)}_{\max}]\}\min_{y'\in\{y^{(a)}_{\min},y^{(a)}_{\max}\}}|y'-y|^{2}.\tag{9}
$$

直观上，$\ell_a(\mathbf x)$ 惩罚位于 LoS 边界框 $\mathcal B^{(a)}$ 之外的位置：损失项只对不在给定坐标集合中的坐标非零。换言之，若 $\mathbf x$ 位于 LoS 边界框 $\mathcal B^{(a)}$ 内，则 $\ell_a(\mathbf x)$ 为零；否则 $\ell_a(\mathbf x)$ 等于到 $\mathcal B^{(a)}$ 的最小平方距离。通过最小化损失 $\mathcal L_{\mathrm{box}}$ 可训练实现信道图谱函数 $g_{\boldsymbol\theta}$ 的神经网络；该方法**弱监督**，因为损失只纳入真值标签的部分信息（即每个 AP 的 LoS 边界框）。

作者最后指出，文献 [35] 也提出过基于区域边界框的损失；但该方法要求带区域标签的 CSI 样本。相反，本文仅根据 AP 侧接收功率推断边界框，不需要任何显式 CSI 标签。

> **脚注 5（原文）：** 由于假设 LoS 边界框为矩形，此处损失函数形式简单。该损失可修改为度量到任意形状边界框的距离；此类一般边界框形状的有效性研究留待未来工作。

### C. 组合全部损失函数

本文提出使用三个损失函数 $\mathcal L_{\mathrm t}$、$\mathcal L_{\mathrm{bi}}$、$\mathcal L_{\mathrm{box}}$ 的线性组合（脚注 6）：$\mathcal L_{\mathrm t}$ 有助于保持局部邻域关系，而 $\mathcal L_{\mathrm{bi}}$ 与 $\mathcal L_{\mathrm{box}}$ 有助于把信道图谱锚定到真实世界坐标；此外，$\mathcal L_{\mathrm t}$ 中的错误三元组与 $\mathcal L_{\mathrm{bi}}$ 中的错误 AP 对可以相互抵消。所得多损失定义如下：

$$
\mathcal L_{\mathrm m}=\lambda_{\mathrm t}\mathcal L_{\mathrm t}+\lambda_{\mathrm{bi}}\mathcal L_{\mathrm{bi}}+\lambda_{\mathrm{box}}\mathcal L_{\mathrm{box}}.\tag{10}
$$

其中 $\lambda_{\mathrm t}$、$\lambda_{\mathrm{bi}}$、$\lambda_{\mathrm{box}}$ 为非负正则化参数，分别对各损失加权；其选择在第 IV-A 节简要讨论。

> **脚注 6（原文）：** 作者也试验过在不同 epoch 分别施加各损失，但该方法失败：所得信道图谱似乎主要受最近施加的损失函数影响，仿佛此前施加的损失毫无作用。因此决定在所有 epoch 中以加权和形式同时施加全部损失，这在现代机器学习框架中很容易实现。

通过最小化损失 $\mathcal L_{\mathrm m}$ 可训练实现信道图谱函数 $g_{\boldsymbol\theta}$ 的神经网络；基于第 II-E、III-A、III-B 节所述原因，该方法介于自监督与弱监督学习之间。

## IV. 方法、基线与性能指标

本节先简要说明用于学习信道图谱函数的神经网络结构，随后详述所提方法与基线，并介绍评估中使用的性能指标。

### A. 学习信道图谱函数

本文对信道图谱（与定位）函数 $g_{\boldsymbol\theta}$ 使用六层全连接神经网络，即简单的多层感知机（MLP）。设输入特征维数为 $D'$，网络每层激活数为 $\{D',D'/2,D'/4,D'/8,D'/16,D\}$；由于 UE 高度固定，设输出维数 $D=2$。除最后一层外，各层使用 ReLU 激活，最后一层使用线性激活。最后一层采用 Glorot 初始化 [48]，其余层采用 He 初始化 [49]；训练使用 Adam 优化器。

训练中损失函数的超参数，即式 (4) 三元组损失中的 $T_c$ 与 $M_{\mathrm t}$、式 (7) 双边定位损失中的 $M_{\mathrm b}$，以及式 (10) 组合损失中的正则化参数（$\lambda_{\mathrm t}$、$\lambda_{\mathrm{bi}}$、$\lambda_{\mathrm{box}}$），会影响所得信道图谱的全局尺度。除非另作说明，保持 $\lambda_{\mathrm t}=1$ 并调整其余超参数。假设训练数据集包含 UE 移动的整个感兴趣区域的 CSI；这些超参数按经验选取，使所得信道图谱大致匹配感兴趣区域的尺寸与形状。超参数相互作用的一个例子是：若 $\lambda_{\mathrm{bi}}$ 与 $\lambda_{\mathrm{box}}$ 相对 $\lambda_{\mathrm t}$ 过小，则信道图谱处于相对较小的绝对尺度、远离真实世界坐标；另一个例子是：边际 $M_{\mathrm t}$ 与 $M_{\mathrm b}$ 越小，图谱的绝对尺度越小（反之亦然）。鉴于超参数与信道图谱尺寸之间关系清晰，调整超参数相当直接。

### B. 所提方法与基线

所提全部方法与基线使用相同的神经网络结构（见第 IV-A 节），但以不同损失函数训练，具体如下。

**所提方法 1（P1）：** 按第 III 节所述提取每个 UE 位置与每个 AP 的接收功率。使用式 (7) 与式 (8) 中 $\mathcal L_{\mathrm{bi}}$ 与 $\mathcal L_{\mathrm{box}}$ 之和（脚注 7）训练神经网络；换言之，使用式 (10) 定义的 $\mathcal L_{\mathrm m}$，取 $\lambda_{\mathrm t}=0$、$\lambda_{\mathrm{bi}},\lambda_{\mathrm{box}}>0$。此处旨在证明仅双边定位与 LoS 边界框损失的有效性。再次强调，基于第 III-A、III-B 节所述原因，该方法为弱监督。

**所提方法 2（P2）：** 假设训练集中所有 CSI 特征的时间戳可得，并按第 III 节所述提取每个 UE 位置在每个 AP 的接收功率。使用式 (10) 定义的多损失 $\mathcal L_{\mathrm m}$ 训练神经网络，组合三元组、双边定位与 LoS 边界框损失，取 $\lambda_{\mathrm t},\lambda_{\mathrm{bi}},\lambda_{\mathrm{box}}>0$。再次强调，基于第 III-C 节关于各损失分量的说明，该方法介于自监督与弱监督学习之间。

作者指出，由于所研究场景比会议版 [1] 更具挑战性，本文省略了 [1] 中使用三元组与双边定位损失、但不含 LoS 边界框损失的所提方法（脚注 8）。

**基线 1（B1）：** 假设训练集中所有 CSI 特征的时间戳可得，仅使用式 (4) 定义的三元组损失 $\mathcal L_{\mathrm t}$ 训练神经网络。给出该基线旨在把所提方法性能与（纯）自监督信道图谱比较。再次强调，基于第 II-E 节所述原因，该方法为自监督。注意所得信道图谱往往质量较高，但嵌入任意坐标、因此无单位；这与本文提出的弱监督、半监督与监督方法不同——它们产生以米为单位的真实世界坐标信道图谱。

**基线 2（B2）：** 假设训练集中所有 CSI 特征的时间戳可得，且训练集的一个子集 $\mathcal S$ 具有 UE 真实位置。先按与基线 B1 相同的方式自监督地学习信道图谱函数 $g_{\boldsymbol\theta}$；随后按 [38]、[39]、[41] 的方式估计把 $g_{\boldsymbol\theta}$ 输出映射到真实世界坐标的仿射变换：

$$
\{\widehat{\mathbf A},\widehat{\mathbf b}\}=\arg\min_{\mathbf A\in\mathbb R^{D\times D},\mathbf b\in\mathbb R^{D}}\sum_{n\in\mathcal S}\left\lVert(\mathbf A g_{\boldsymbol\theta}(\mathbf f^{(n)})+\mathbf b)-\tilde{\mathbf x}^{(n)}\right\rVert^{2},\tag{11}
$$

即求解一个最小二乘问题，最小化仿射变换后的信道图谱位置与已知真实位置之间的误差。最后把估计的仿射变换应用于信道图谱伪位置：$\widehat{\mathbf x}^{(n)}=\widehat{\mathbf A}g_{\boldsymbol\theta}(\mathbf f^{(n)})+\widehat{\mathbf b}$。给出该基线旨在 (i) 展示信道图谱是否总能仅通过仿射变换映射到真实世界坐标；(ii) 把本文"将真实世界坐标直接纳入信道图谱函数（不使用真实位置）"的所提方法与"用真实位置把信道图谱映射到真实世界坐标"的两阶段方法比较。再次强调，这里估计仿射变换依赖已知真实位置。

**基线 3（B3）：** 假设训练集中所有样本的时间戳可得，且训练集的一个小子集 $\mathcal S$ 具有真值标签。于是可对带标签样本定义均方误差（MSE）损失：

$$
\widetilde{\mathcal L}_{\mathrm{MSE}}=\frac{1}{|\mathcal S|}\sum_{n\in\mathcal S}\left\lVert g_{\boldsymbol\theta}(\mathbf f^{(n)})-\tilde{\mathbf x}^{(n)}\right\rVert^{2}.\tag{12}
$$

使用如下组合三元组与 MSE 的损失函数训练神经网络：

$$
\mathcal L_{\mathrm t,\widetilde{\mathrm{MSE}}}=\mathcal L_{\mathrm t}+\widetilde{\mathcal L}_{\mathrm{MSE}}.\tag{13}
$$

由于损失 $\mathcal L_{\mathrm t,\widetilde{\mathrm{MSE}}}$ 除三元组损失外还使用一部分 UE 真实位置，该基线为**半监督**。给出该基线旨在把所提方法与半监督定位技术（如 [29]—[33]、[35]）比较，并展示本文方法能否在不使用任何 UE 真实位置信息的条件下达到与半监督技术相当的性能。

**基线 4（B4）：** 假设训练集中所有样本的真实位置可得，对所有训练样本使用 MSE 损失训练神经网络。此处把损失记为 $\mathcal L_{\mathrm{MSE}}$，以区别于基线 B3 中作用于训练样本子集的损失。由于 $\mathcal L_{\mathrm{MSE}}$ 需要所有训练样本的真值标签，该方法为**全监督**。给出该基线旨在把所提方法与用神经网络处理 CSI 特征的指纹方法（例如见 [23]、[25] 及其参考文献）比较；该基线同时指示第 IV-A 节所述神经网络结构可达到的最佳定位性能。

> **脚注 7（原文）：** 对 LoS 边界框损失，作者只使用功率最大的 AP 的 LoS 边界框，因为实验中未观察到使用 $\widetilde{\mathcal A}$ 中全部 AP 带来的改善。

> **脚注 8（原文）：** 在本文研究的所有场景中，实验结果表明 [1] 中的方法显著差于本文提出的 P2 方法；这些结果与第 III-A 节讨论的双边定位损失局限一致。

### C. 性能指标

本文用六个指标评估所提方法与基线性能。前四个指标衡量信道图谱质量，后两个指标衡量定位精度。下文把每个真实世界位置 $\tilde{\mathbf x}^{(n)}$ 与每个潜空间位置 $\widehat{\mathbf x}^{(n)}$ 的 $J$ 个最近邻集合分别记为 $\widetilde{\mathcal V}_n$ 与 $\widehat{\mathcal V}_n$；把 $\tilde{\mathbf x}^{(j)}$ 在真实世界中相对 $\tilde{\mathbf x}^{(n)}$ 的接近程度、以及 $\widehat{\mathbf x}^{(j)}$ 在潜空间中相对 $\widehat{\mathbf x}^{(n)}$ 的接近程度（按欧氏距离）分别记为排名 $\tilde r(n,j)$ 与 $\widehat r(n,j)$。定义归一化因子 $\gamma=\frac{2}{NJ(2N-3J-1)}$ [50]。

**可信度（Trustworthiness，TW）：** 该指标惩罚潜空间中存在、但真实世界位置中不存在的邻域关系，定义为 [51]

$$
\mathrm{TW}(J)=1-\frac{\gamma}{N}\sum_{n=1}^{N}\sum_{\substack{j\notin\widetilde{\mathcal V}_n\\ j\in\widehat{\mathcal V}_n}}\left(\tilde r(n,j)-J\right).\tag{14}
$$

TW 取值范围 $[0,1]$，最优值为 1。

**连续性（Continuity，CT）：** 该指标衡量真实世界位置之间的邻域关系在潜空间中被保留的程度，定义为 [51]

$$
\mathrm{CT}(J)=1-\frac{\gamma}{N}\sum_{n=1}^{N}\sum_{\substack{j\in\widetilde{\mathcal V}_n\\ j\notin\widehat{\mathcal V}_n}}\left(\widehat r(n,j)-J\right).\tag{15}
$$

CT 取值范围 $[0,1]$，最优值为 1。

**Kruskal 应力（Kruskal stress，KS）：** 该指标衡量真实世界位置 $\{\tilde{\mathbf x}^{(n)}\}_{n=1}^{N}$ 中的成对距离 $\tilde d(n,j)\triangleq\lVert\tilde{\mathbf x}^{(n)}-\tilde{\mathbf x}^{(j)}\rVert$ 与潜空间位置 $\{\widehat{\mathbf x}^{(n)}\}_{n=1}^{N}$ 中的成对距离 $\widehat d(n,j)\triangleq\lVert\widehat{\mathbf x}^{(n)}-\widehat{\mathbf x}^{(j)}\rVert$ 之间的差异，定义为 [52]

$$
\mathrm{KS}=\min_{\lambda\in\mathbb R}\sqrt{\frac{\sum_{n=1}^{N}\sum_{j=1}^{N}\left(\widehat d(n,j)-\lambda\tilde d(n,j)\right)^{2}}{\sum_{n=1}^{N}\sum_{j=1}^{N}\widehat d(n,j)^{2}}},\tag{16}
$$

其中 $\lambda$ 为尺度因子。KS 取值范围 $[0,1]$，最优值为 0。

**Rajski 距离（Rajski distance，RD）：** 该指标衡量真实世界位置与潜空间中成对距离 $\tilde d(n,j)$、$\widehat d(n,j)$ 分布的互信息与联合熵之间的差异，定义为 [53]

$$
\mathrm{RD}=1-\frac{I(V,Q)}{H(V,Q)},\qquad\text{当 }H(Q,V)\ne0,\tag{17}
$$

其中 $V$ 与 $Q$ 为两个离散随机变量，互信息为

$$
I(V,Q)=\sum_{v\in\mathcal V,q\in\mathcal Q}P_{V,Q}(v,q)\log_2\frac{P_{V,Q}(v,q)}{P_V(v)P_Q(q)}\tag{18}
$$

联合熵为

$$
H(V,Q)=-\sum_{v\in\mathcal V,q\in\mathcal Q}P_{V,Q}(v,q)\log_2P_{V,Q}(v,q).\tag{19}
$$

式 (18)、(19) 中 $P_{V,Q}(v,q)$ 为联合概率分布，$P_V(v)$ 与 $P_Q(q)$ 分别为原始 $\tilde d(n,j)$ 与潜空间 $\widehat d(n,j)$ 中量化成对距离的边缘分布。RD 取值范围 $[0,1]$，最优值为 0。

**平均距离误差（Mean distance error，MDE）：** 该指标衡量所有 UE 位置上 UE 位置估计误差（欧氏范数）的平均值，定义为

$$
\mathrm{MDE}=\frac{1}{N}\sum_{n=1}^{N}\left\lVert\widehat{\mathbf x}^{(n)}-\tilde{\mathbf x}^{(n)}\right\rVert.\tag{20}
$$

MDE 非负，最优值为 0。

**第 95 百分位距离误差：** 该指标表示 UE 位置估计欧氏范数误差的第 95 百分位数，即满足至少 95% 的距离误差 $\{\lVert\widehat{\mathbf x}^{(n)}-\tilde{\mathbf x}^{(n)}\rVert\}_{n\in\mathcal N}$ 小于 $e_{95}$ 的最小值 $e_{95}$。

## V. 结果

本节用三个不同场景得到的 CSI 数据集评估所提方法与所考虑基线：仿真室外场景、仿真室内场景与基于测量的室内场景。以下各小节分别描述各场景、简要分析 AP 侧接收功率、展示真实位置／信道图谱／估计位置图，随后用第 IV-C 节的性能指标评估所提方法与基线。

在仿真场景中，对截断信道矩阵加入噪声，使每个 AP 的最高信噪比（SNR）期望值为 25 dB，以模拟实际通信系统中出现的信道估计误差。具体地，确定加性噪声方差，使每个 AP 中 Frobenius 范数最大的截断信道矩阵的平均 SNR 为 25 dB；该做法使大多数 UE 位置的 SNR 远低于此值。三个场景中均使用数据集的 80% 训练、20% 测试。对基线 B2 与 B3，从训练集中均匀随机选取带真值标签的 CSI 样本子集。所有图与性能指标均基于测试集。

图 3、图 5、图 7 分别对各场景的真值位置与任意坐标／真实世界坐标下的信道图谱做视觉比较；表 II、III、IV 给出相应性能指标。性能指标为神经网络参数 10 次随机初始化下的平均值。评估 TW 与 CT 时按 [3] 取 $J=0.05N$；评估 RD 时把成对距离量化为 20 个均匀区间。对定位指标还报告标准差；由于潜空间质量指标均位于 $[0,1]$，其标准差较小，故略去。

由于 B1 产生任意坐标下的信道图谱，性能指标表中省略 B1 的两个距离误差指标。此外为避免冗余，省略监督基线 B4 的估计位置图，因为这些图与真值位置图非常接近。

### A. 仿真室外场景

**1）描述。** 第一个场景考虑一个 D-MIMO 城市环境：六个 AP 分布在一个 $83\ \mathrm m\times122\ \mathrm m$ 的矩形区域周围，UE 沿轨迹以南北与东西方向蜿蜒移动以覆盖该区域；仿真环境快照见图 1(a)，UE 与 AP 位置以及所有 AP 使用的 LoS 边界框见图 3(a)。用 Remcom 的 Wireless InSite 射线追踪软件 [13] 得到的信道向量仿真一个 sub-6-GHz 场景。表 I 第一列汇总仿真参数（脚注 9）。每个 CSI 矩阵 $\mathbf H^{(n)}$（$n\in\mathcal N$）维数为 $24\times1200$；每个 CSI 特征向量维数为 $D'=24\times8=192$，其中使用前 $C=8$ 个抽头（脚注 10）与第 II-C 节的特征提取流程。

**2）AP 侧接收功率分析。** 该场景中已知所有 AP 与所有 UE 位置之间都有 LoS 路径；因此可令 $P_{\mathrm{thr}}=-\infty$，使式 (5) 的 $\widetilde{\mathcal A}^{(n)}$ 包含全部 AP。图 2 举例说明双边定位损失所利用的功率—距离关系：图中给出一个 AP 处的接收功率与 UE 在 $xy$ 平面内距离的关系（因高度固定，忽略 $z$ 轴距离）。需要说明，所提方法不使用真实位置，因而不知道 UE 到 AP 的距离；我们不基于功率—距离图做任何决策，该图仅作为概念验证给出。显然功率总体随距离下降，但小尺度衰落使到 AP 距离大致相同的不同 UE 位置之间功率波动相当大。此外接收功率在约 10 m 以内随距离增大而上升（脚注 11），这对依赖"靠近 AP 时功率最高"的方法（如 [38]）有负面影响。

由于较小的功率差更可能由小尺度衰落而非距离引起，我们推断哪个 AP 更近时信心较低。因此，观察到 AP 侧接收功率并非严格与距离成反比，正是式 (6) 中边际参数 $M_{\mathrm p}$ 的动机。令 $M_{\mathrm p}>0$ 可避免部分错误 AP 对，即满足 $\lVert\tilde{\mathbf x}^{(n)}-\tilde{\mathbf x}^{(a_c)}\rVert>\lVert\tilde{\mathbf x}^{(n)}-\tilde{\mathbf x}^{(a_f)}\rVert$ 的对 $(a_c,a_f)\in\mathcal P^{(n)}$。对该 CSI 数据集，取 $M_{\mathrm p}=0,3,6$ 时全部 UE 的错误 AP 对比例分别为 16.6%、0.06%、0.02%，而集合 $\mathcal P^{(n)}$ 中 AP 对的平均数 $\frac1N\sum_{n=1}^{N}|\mathcal P^{(n)}|$ 分别为 15、9.2、4.63。可见选择 $M_{\mathrm p}$ 存在权衡：增大 $M_{\mathrm p}$ 会减少错误 AP 对，但代价是式 (6) 中 $\mathcal P^{(n)}$ 的 AP 对更少，从而为弱监督学习提供更准确但更少的参考点（反之亦然）。

**3）参数设置。** 对 P1 取 $M_{\mathrm t}=M_{\mathrm b}=10$、$M_{\mathrm p}=3$、$\lambda_{\mathrm t}=0$、$\lambda_{\mathrm{bi}}=\lambda_{\mathrm{box}}=1$。由于感兴趣区域内无遮挡，即 UE 应与所有 AP 都有 LoS 路径，取 $P_{\mathrm{thr}}=-\infty$。P2 除三元组损失外参数与 P1 相同；三元组损失取 $\lambda_{\mathrm t}=1$、$T_c=10$、$M_{\mathrm t}=10$。B1、B2、B3 与 P2 使用相同的三元组损失参数。对基线 B2 与 B3，分别使用 10 个与 400 个 CSI 样本的真实位置：用 B2 展示从少量带标签样本学习仿射变换的性能；用 B3 近似展示达到与 P2 可比性能需要多少带真值标签的样本。

**4）性能评估。** 由图 3 可见，所有方法都得到近似矩形的图谱，并保留颜色渐变、与真值位置相似，符合预期。可能由于区域形状与 UE 轨迹，自监督基线 B1 在全局几何方面表现得出奇地好；信道图谱只需旋转，而这正是 B2 所得到的。

> **脚注 9（原文）：** 该仿真场景与会议论文 [1] 中的略有不同：[1] 中 UE 位置使用矩形网格、共八个 AP；此处使用 Remcom Wireless InSite 的轨迹功能生成 UE 位置，并只使用六个 AP，以构造更具挑战性的场景。

> **脚注 10（原文）：** 实验中观察到，进一步增加使用的信道抽头数只会使所考虑性能指标略有改善，却显著增加神经网络参数数量与由此带来的计算复杂度。

> **脚注 11（原文）：** 该行为可归因于天线辐射方向图：当 UE 接近 AP 下方区域时，接收功率会下降。

**表 I：各场景的参数。**

| 参数 | 仿真室外 | 仿真室内 | 实测室内 [2] |
|---|---|---|---|
| AP 数 | $A=6$ | $A=8$ | $A=4$ |
| 每 AP 天线数 | $M_R=4$ | $M_R=4$ | $M_R=8$ |
| AP 天线阵列结构 | 均匀线阵 | 均匀线阵 | 均匀矩形阵，$2\times4$ |
| UE 位置数 | 14 642 | 14 606 | 16 778 |
| UE 位置间距 | 40 cm | 2.5 cm | （不固定） |
| AP 天线高度 | 10 m | 2 m | 1.56–1.78 m |
| AP 天线间距 | 半波长 | 半波长 | 半波长 |
| UE 天线高度 | 1.5 m | 1.5 m | ≈ 0.94 m |
| AP 与 UE 天线类型 | 全向 | 全向 | 全向 |
| 载波频率 | 1.9 GHz | 2.4 GHz | 1.272 GHz |
| 带宽 | 20 MHz | 20 MHz | 50 MHz |
| 使用子载波数 | $W=1200$ | $W=52$ | $W=1024$ |
| 每 AP 最大 SNR | 25 dB | 25 dB | – |

**表 II：仿真室外场景的信道图谱与定位性能比较。**

| 方法 | 图 | TW ↑ | CT ↑ | KS ↓ | RD ↓ | 平均误差 [m] ↓ | 第 95 百分位 [m] ↓ |
|---|---|---|---|---|---|---|---|
| P1 | 3(b) | 0.923 | 0.922 | 0.238 | 0.864 | 14.18 ± 0.62 | 29.98 ± 1.306 |
| P2 | 3(c) | 0.984 | 0.985 | 0.123 | 0.710 | 8.75 ± 0.31 | 17.85 ± 0.66 |
| B1 | 3(d) | 0.998 | 0.998 | 0.068 | 0.550 | – | – |
| B2 | 3(e) | 0.998 | 0.998 | 0.064 | 0.533 | 3.15 ± 0.34 | 7.06 ± 0.99 |
| B3 | 3(f) | 0.964 | 0.962 | 0.166 | 0.775 | 9.07 ± 0.47 | 20.76 ± 1.28 |
| B4 | – | 0.994 | 0.994 | 0.069 | 0.563 | 3.57 ± 0.18 | 7.34 ± 0.37 |

由表 II 可见，基于仿射变换的 B2 在所有指标上表现最好，甚至在 TW、CT、KS、RD 上分别超过监督基线 B4 达 0.004、0.04、0.005、0.030。B2 之所以有此性能，是因为自监督基线 B1 恰好已很好地表示了局部与全局几何——这由 TW 与 CT 均高达 0.998、KS 与 RD 分别仅为 0.068 与 0.550 所印证。因此，当信道图谱很好地表示全局几何时，从少量带标签样本学到的仿射变换即可带来良好定位性能（脚注 12）。不过 B2 的缺陷将在下一个场景中显现。虽然 P1 的信道图谱表明仅靠双边定位与 LoS 边界框损失也有助于在真实世界坐标中构造信道图谱，但 P1 在所有性能指标上都被其余方法超越。P2 在潜空间质量指标 TW、CT、KS、RD 上分别超过半监督基线 B3 达 0.020、0.023、0.043、0.065。P2 略优于 B3，平均误差约小 0.3 m、第 95 百分位约小 2 m（脚注 13），同时保有"不需要任何真实位置"的优势。P2 的定位误差比 B2 高，平均约高 5 m、第 95 百分位约高 11 m。

再次强调，与基线 B2、B3、B4 不同，所提方法 P2 不需要任何 UE 真实位置信息。值得注意的是，B3 至少需要 400 个带真值标签的样本才能达到与 P2 相同的性能。这些结果证明了所提方法 P2 在具有 LoS 信道的大型室外区域中的有效性。

> **脚注 12（原文）：** 此处未观察到进一步增加带标签样本数带来的显著改善。

> **脚注 13（原文）：** [1] 中的仿真场景在同一环境下包含八个 AP；此处把 AP 数减至六个使场景更具挑战性，这要求使用本文新的 LoS 边界框损失以维持所提方法的定位性能。

### B. 仿真室内场景

**1）描述。** 第二个场景考虑一个有挑战性的室内环境：由于内墙遮挡，对给定 UE 位置存在许多处于非 LoS 的 AP；UE 沿覆盖各走廊与房间的轨迹移动时至少有一个 AP 与之处于 LoS。仿真环境快照见图 1(b)，UE 与 AP 位置以及三个 AP 的 LoS 边界框示例见图 5(a)；为免图面拥挤，图中省略其余五个 AP 的 LoS 边界框。用 Remcom Wireless InSite 射线追踪软件 [13] 得到的信道向量仿真一个 sub-6-GHz 场景。表 I 第二列汇总仿真参数。每个 CSI 矩阵 $\mathbf H^{(n)}$（$n\in\mathcal N$）维数为 $32\times52$；每个 CSI 特征向量维数为 $D'=32\times8=256$，其中使用前 $C=8$ 个抽头与第 II-C 节的特征提取流程。

**2）AP 侧接收功率分析。** 该场景中已知 UE 在每个位置并非与所有 AP 都有 LoS 路径，因此需要选择功率阈值来估计式 (5) 中 $\widetilde{\mathcal A}^{(n)}$ 的 LoS AP。该阈值依据 AP 侧接收功率 $P^{(n,a)}$ 随时间 $t_n$ 的变化选取，图 4(a) 给出了其中一个 AP 的示例：此处观察到功率在约 −30 dB 处陡降，故取 $P_{\mathrm{thr}}=-30$（脚注 14）。篇幅所限，略去显示 $P_{\mathrm{thr}}$ 对小幅偏差稳健的消融研究。图 4(b) 用与图 4(a) 相同的 AP 举例说明式 (7) 中双边定位损失所利用的功率—距离关系以及 $P_{\mathrm{thr}}$ 的影响：此处清楚看到选择合适功率阈值 $P_{\mathrm{thr}}$ 的必要性——许多 UE 位置靠近该 AP 但 AP 侧接收功率很低，此类 UE 位置不应在双边定位损失中使用该 AP。如所预期，这些位置的接收功率确实低于所选阈值 $P_{\mathrm{thr}}$；而 AP 侧接收功率高于 $P_{\mathrm{thr}}$ 的 UE 位置遵循与图 2 相同的趋势，即功率总体随距离下降。因此，$P_{\mathrm{thr}}$ 的选择适合用于分类将参与双边定位与 LoS 边界框损失的 LoS AP。

对该 CSI 数据集，取 $P_{\mathrm{thr}}=-30$、$M_{\mathrm p}=0,3,6$ 时全部 UE 的错误 AP 对比例分别为 15.5%、3.4%、0.2%，而集合 $\mathcal P^{(n)}$ 中 AP 对平均数 $\frac1N\sum_{n=1}^{N}|\mathcal P^{(n)}|$ 分别为 1.03、0.60、0.30。再次观察到选择 $M_{\mathrm p}$ 的权衡：增大 $M_{\mathrm p}$ 以减少错误 AP 对为代价，换取式 (6) 中更少的 $\mathcal P^{(n)}$ 元素。

**3）参数设置。** 对 P1 取 $M_{\mathrm t}=M_{\mathrm b}=1$、$M_{\mathrm p}=3$、$\lambda_{\mathrm t}=0$、$\lambda_{\mathrm{bi}}=\lambda_{\mathrm{box}}=1$、$P_{\mathrm{thr}}=-30$。P2 除三元组损失外参数与 P1 相同；三元组损失取 $\lambda_{\mathrm t}=1$、$T_c=2$、$M_{\mathrm t}=1$。B1、B2、B3 与 P2 使用相同的三元组损失参数。对基线 B2 与 B3，分别使用 10 000 个与 50 个 CSI 样本的真实位置：用 B2 表明无论使用多少真实位置，仿射变换都无法给出真实世界坐标的良好表示；用 B3 近似展示达到与 P2 可比性能需要多少带真值标签的样本。

**4）性能评估。** 由图 5 可见，P1、P2、B3 结果相似，其中 P1 质量（不出意料地）略差；但即使在 P1 中，UE 位置也大多落在正确区域（即房间与走廊）内，这表明双边定位与 LoS 边界框损失在 AP 数量较多的 D-MIMO 场景中具有能力。此外可见 B2 高度不准确：无论用多少真值标签寻找仿射变换，都无法校正 B1 中的扭曲。该例说明信道图谱可能存在**非仿射扭曲**，因此用仿射变换把信道图谱映射到真实世界坐标并非普遍适用的方法。

> **脚注 14（原文）：** 为简单起见，功率阈值基于对接收功率随时间变化的目视检查确定。另一种做法是把接收功率值升序排序，并应用边缘检测算法识别非 LoS 与 LoS 区域之间的转变。对此类自动参数选择方法的探索留待未来工作。

**表 III：仿真室内场景的信道图谱与定位性能比较。**

| 方法 | 图 | TW ↑ | CT ↑ | KS ↓ | RD ↓ | 平均误差 [m] ↓ | 第 95 百分位 [m] ↓ |
|---|---|---|---|---|---|---|---|
| P1 | 5(b) | 0.950 | 0.952 | 0.195 | 0.791 | 1.61 ± 0.03 | 3.32 ± 0.12 |
| P2 | 5(c) | 0.979 | 0.976 | 0.144 | 0.710 | 1.15 ± 0.04 | 2.84 ± 0.44 |
| B1 | 5(d) | 0.983 | 0.968 | 0.347 | 0.857 | – | – |
| B2 | 5(e) | 0.967 | 0.955 | 0.373 | 0.883 | 3.21 ± 0.54 | 6.66 ± 0.90 |
| B3 | 5(f) | 0.970 | 0.974 | 0.184 | 0.753 | 1.31 ± 0.18 | 3.53 ± 1.46 |
| B4 | – | 0.988 | 0.989 | 0.082 | 0.572 | 0.63 ± 0.01 | 1.55 ± 0.02 |

由表 III 可见，如预期，B4 在所有指标上表现最好。P2 在潜空间质量指标上与半监督基线 B3 大致相当：TW 与 CT 差距小于 0.009，KS 与 RD 差距小于 0.043。P2 的定位误差比 B3 略高，平均约高 0.2 m、第 95 百分位约高 0.8 m。P2 的定位误差比 B4 高，平均约高 0.5 m、第 95 百分位约高 1.3 m。该结果证明了所提方法 P2 在存在大量非 LoS 路径的室内区域中的有效性。

### C. 基于测量的室内场景

**1）描述。** 第三个场景使用 DICHASUS 数据集 [2]、[54] 中的实测信道向量，表 I 第三列汇总测量参数。这些测量来自工厂环境中的一个 D-MIMO 通信系统，其中发射机为在 L 形区域内沿多种轨迹移动的机器人。该 L 形区域的内角处有一个大型金属容器，可能遮挡通往部分 AP 的 LoS 路径；而测量区域内的每个位置都至少与一个 AP 存在 LoS 路径。图 7(a) 给出 UE 与 AP 位置以及用于上、下两组 AP 的两个 LoS 边界框。本文使用 [2] 数据集前三条轨迹的 CSI，并每四个样本取一个以减小数据集总规模；对所有位置施加 $12^{\circ}$ 旋转，以便简化 AP 矩形 LoS 边界框的设定。每个 CSI 矩阵 $\mathbf H^{(n)}$（$n\in\mathcal N$）维数为 $32\times1024$；每个 CSI 特征向量维数为 $D'=32\times13=416$，其中使用 [41] 所述 $C=13$ 个抽头与第 II-C 节的特征提取流程。

**2）AP 侧接收功率分析。** 该场景中已知并非所有 UE 位置都与所有 AP 存在 LoS 路径，因此需先选择功率阈值来估计用于双边定位与 LoS 边界框损失的 LoS AP。该阈值基于一个 AP 的接收功率 $P^{(n,a)}$ 随时间 $t_n$ 的变化选取，示意见图 6(a)：此处观察到功率在约 15 dB 处陡降，故取 $P_{\mathrm{thr}}=15$。篇幅所限，略去显示 $P_{\mathrm{thr}}$ 对小幅偏差稳健的消融研究。图 6(b) 用与图 6(a) 相同的 AP 说明式 (7) 双边定位损失所利用的功率—距离关系以及 $P_{\mathrm{thr}}$ 的影响：此处清楚看到需要选择合适的功率阈值，因为许多 UE 位置靠近该 AP 但 AP 侧接收功率很低，此类 UE 位置不应使用该 AP；如所预期，这些位置的接收功率确实低于所选阈值 $P_{\mathrm{thr}}$。而 AP 侧接收功率高于 $P_{\mathrm{thr}}$ 的 UE 位置遵循与图 2 相同的趋势，即功率总体随距离下降。因此，$P_{\mathrm{thr}}$ 的选择适合用于分类参与双边定位与 LoS 边界框损失的 LoS AP。

对该 CSI 数据集，取 $M_{\mathrm p}=0,3,6$ 时全部 UE 的错误 AP 对比例分别为 27.5%、5%、1.8%，而集合 $\mathcal P^{(n)}$ 中 AP 对平均数 $\frac1N\sum_{n=1}^{N}|\mathcal P^{(n)}|$ 分别为 1.7、0.44、0.10。再次观察到选择 $M_{\mathrm p}$ 的权衡：增大 $M_{\mathrm p}$ 会减少错误 AP 对，代价是式 (6) 中 $\mathcal P^{(n)}$ 的 AP 对更少。

**3）参数设置。** 对 P1 取 $M_{\mathrm t}=M_{\mathrm b}=0.5$、$M_{\mathrm p}=3$、$\lambda_{\mathrm t}=0$、$\lambda_{\mathrm{bi}}=\lambda_{\mathrm{box}}=1$。P2 除三元组损失外参数与 P1 相同；三元组损失取 $\lambda_{\mathrm t}=1$、$T_c=5$、$M_{\mathrm t}=0.5$。B1、B2、B3 与 P2 使用相同的三元组损失参数。对基线 B2 与 B3，分别使用 10 个与 30 个 CSI 样本的真实位置：用 B2 展示从少量带标签样本学习仿射变换的性能；用 B3 展示近似需要多少带真值标签的样本来达到与 P2 相当的性能。

**4）性能评估。** 由图 7 可见，所有使用三元组损失的方法（即 P2、B1、B2、B3）都得到类似 L 形、与真值位置相符的图谱，并分离出红色与绿色区域。而 P1 不使用三元组损失、仅用双边定位与 LoS 边界框损失的局限很明显：在 AP 数量少且边界框相对较大时，信道图谱无法很好地反映 UE 位置。

由表 IV 可见，如预期，B4 在所有指标上表现最好；B2 在所有指标上居第二，再次印证了从"良好"信道图谱出发对基于仿射变换方法的优势。比较 P2 与 B3：P2 在 TW 与 CT 上略好（差距小于 0.017 与 0.11），在 KS 与 RD 上略差（分别差 0.010 与 0.016）。P2 的定位误差比 B4 高，平均约高 1.2 m、第 95 百分位约高 2.6 m；P2 比 B2 略高，平均约高 0.5 m、第 95 百分位约高 1.3 m，与 B3 的差距则更小。该结果证明了所提方法 P2 在 AP 数量少、非 LoS 路径多的工业环境中对实测信道的有效性。

**表 IV：实测室内场景的信道图谱与定位性能比较。**

| 方法 | 图 | TW ↑ | CT ↑ | KS ↓ | RD ↓ | 平均误差 [m] ↓ | 第 95 百分位 [m] ↓ |
|---|---|---|---|---|---|---|---|
| P1 | 7(b) | 0.842 | 0.852 | 0.441 | 0.961 | 2.83 ± 0.24 | 6.28 ± 0.61 |
| P2 | 7(c) | 0.972 | 0.980 | 0.192 | 0.799 | 1.33 ± 0.03 | 3.05 ± 0.17 |
| B1 | 7(d) | 0.989 | 0.990 | 0.179 | 0.769 | – | – |
| B2 | 7(e) | 0.990 | 0.991 | 0.125 | 0.678 | 0.83 ± 0.37 | 1.78 ± 0.76 |
| B3 | 7(f) | 0.955 | 0.969 | 0.182 | 0.783 | 1.02 ± 0.06 | 2.47 ± 0.30 |
| B4 | – | 0.998 | 0.998 | 0.036 | 0.401 | 0.18 ± 0.01 | 0.42 ± 0.02 |

### D. 三个场景结果的比较

在三个场景上评估所提方法与基线后可以看到，弱监督方法 P2 能够达到与半监督基线 B3 相似的性能。比较三个场景的结果可得以下观察：

- 基线 B3 达到与所提 P2 相似性能所需的 UE 真实位置数量取决于场景与感兴趣区域大小。例如，仿真室外场景中 UE 分布在比两个室内场景大得多的区域内，需要 400 个样本；而室内场景最多只需 50 个样本。
- 所提方法 P2 与全监督基线 B4 之间的性能差距在室外场景中大于两个室内场景。作者把室外场景中 P2 与 B4 的较大差距归因于 LoS 边界框较大——由于所有 AP 与所有 UE 位置都有 LoS 路径，该边界框近似等于 UE 位置的全部区域；相反，室内场景中的 AP 与许多 UE 位置没有 LoS 路径，其 LoS 边界框较小、把 UE 位置总区域分隔开来。因此，把 UE 放入这些小边界框之一便已显著降低定位误差、缩小 P2 与 B4 的差距。

作者希望这些观察能指导包含更多样化场景的未来工作。

## VI. 结论与未来工作

本文提出双边定位损失与 LoS 边界框损失，使信道图谱可在真实世界坐标中以弱监督方式学习，且不需要几何模型、不需要 AP 精确同步、也不需要 UE 真实位置。双边定位损失利用 D-MIMO 场景中已知的 AP 位置，比较被估计为与 UE 存在 LoS 路径的成对 AP 的接收功率，把 UE 放在接收功率更高、因而更近的 AP 附近。LoS 边界框损失把 UE 放入每个被估计为存在 LoS 路径的 AP 的边界框内。本文证明，把双边定位与 LoS 边界框损失与 [12] 的三元组损失组合成多损失，足以在三个不同数据集上生成真实世界坐标下的高质量信道图谱：两个基于商用射线追踪器（一室内、一室外）的数据集，以及一个基于室内信道测量的数据集。通过与多个基线比较，本文表明所提方法可达到"使用一部分带真值标签 CSI 样本"的性能，同时具有无需获取真实位置的优势。此外，半监督基线方法所需的已知 CSI 样本子集大小高度依赖场景与感兴趣区域大小。作者还表明，用仿射变换把学到的信道图谱映射到真实世界坐标的两阶段方法，可能因信道图谱质量而完全失效。

未来工作有多个方向。为提升定位精度，可把边界框推广到更一般的形状；可用比功率阈值更先进（且自动化）的方法做 LoS／非 LoS 信道分类；也可采用除接收功率外还比较 AP 到达角信息的改进损失函数。此外，研究其他相异度指标以进一步改善所学信道图谱质量，也是正在进行工作的一部分。

## 图注与表注

**图 1：仿真的 D-MIMO 场景。** (a) 室外场景：14 642 个 UE 位置、$A=6$ 个 AP；(b) 室内场景：14 606 个 UE 位置、$A=8$ 个 AP。每个 AP（绿色方框）配备 $M_R=4$ 根天线。

**图 2：仿真室外场景中某 AP 处的接收功率（dB）与 $xy$ 平面内 AP—UE 距离的关系。**

**图 3：仿真室外场景结果。** (a) 真值 UE 位置（绿—红渐变色区域）、AP 位置（蓝色三角形）与全部 AP 的 LoS 边界框；(b—f) 所提方法（P）与基线（B）的信道图谱或定位估计。由于基线 B2 的输出处于任意坐标系，(d) 中未画出 AP 位置。所提方法 P2 在真实世界坐标下取得与半监督基线 B3 相当的结果，而无需在训练中使用已知 UE 位置。

**图 4：仿真室内场景中某 AP 处的接收功率（dB）。** (a) 随时间的接收功率（红线为用于识别 LoS AP 的功率阈值）；(b) 随 $xy$ 平面内 AP—UE 距离的接收功率（绿色表示 AP 被估计为处于 LoS 的实例）。图 4 的标题位于图下方：接收功率高于阈值的点（绿色高亮）表示 AP 被估计处于 LoS 的实例。

**图 5：仿真室内场景结果。** (a) 真值 UE 位置（绿—红渐变色区域）、AP 位置（蓝色三角形）与三个 AP 的 LoS 边界框（蓝色实线与虚线）；(b—f) 所提方法（P）与基线（B）的信道图谱或定位估计。由于基线 B2 的输出处于任意坐标系，(d) 中未画出 AP 位置。所提方法 P2 在真实世界坐标下取得与半监督基线 B3 相当的结果，而无需在训练中使用已知 UE 位置。

**图 6：基于测量的室内场景 [2] 中某 AP 处的接收功率（dB）。** (a) 随时间的接收功率（红线为用于识别 LoS AP 的功率阈值）；(b) 随 $xy$ 平面内 AP—UE 距离的接收功率（绿色表示 AP 被估计处于 LoS 的实例）。

**图 7：实测室内场景结果。** (a) 真值 UE 位置（绿—红渐变色区域）、AP 位置（蓝色三角形）与对应于上方、下方两组 AP 的两个 LoS 边界框（蓝色实线与虚线）；(b—f) 所提方法（P）与基线（B）的信道图谱或定位估计。由于基线 B2 的输出处于任意坐标系，(d) 中未画出 AP 位置。所提方法 P2 在真实世界坐标下取得与半监督基线 B3 相当的结果，而无需在训练中使用已知 UE 位置。

**表注：** 表 I 给出各场景参数；表 II、表 III、表 IV 分别给出仿真室外、仿真室内与实测室内场景的信道图谱质量指标（TW、CT、KS、RD，箭头表示越大／越小越好）与定位误差（平均误差、第 95 百分位，单位 m）。图 3、图 5、图 7 中的 (a) 为真值位置，(b) P1，(c) P2，(d) B1，(e) B2，(f) B3。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 54 条，源文 pp. 13–15）。

[1] S. Taner, V. Palhares, and C. Studer, "Channel charting in real-world coordinates," in Proc. IEEE Global Telecommun. Conf. (GLOBECOM), Dec. 2023, pp. 3940–3946.

[2] F. Euchner and M. Gauger, "CSI dataset dichasus-cf0x: Distributed antenna setup in industrial environment, day 1," 2022. [Online]. Available: https://doi.org/doi:10.18419/darus-2854

[3] C. Studer, S. Medjkouh, E. Gönültaş, T. Goldstein, and O. Tirkkonen, "Channel charting: Locating users within the radio environment using channel state information," IEEE Access, vol. 6, pp. 47 682–47 698, Aug. 2018.

[4] L. Ribeiro, M. Leinonen, H. Al-Tous, O. Tirkkonen, and M. Juntti, "Channel charting aided pilot reuse for massive MIMO systems with spatially correlated channels," IEEE Open J. Commun. Soc., vol. 3, pp. 2390–2406, Dec. 2022.

[5] L. L. Magoarou, T. Yassine, S. Paquelet, and M. Crussière, "Channel charting based beamforming," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2022, pp. 1185–1189.

[6] P. Kazemi, H. Al-Tous, C. Studer, and O. Tirkkonen, "Channel charting assisted beam tracking," in Proc. IEEE Veh. Technol. Conf. Spring (VTC-Spring), Jun. 2022, pp. 1–5.

[7] T. Kallehauge, A. E. Kalør, P. Ramírez-Espinosa, M. Guillaud, and P. Popovski, "Delivering ultra-reliable low-latency communications via statistical radio maps," IEEE Wireless Commun. Mag., vol. 30, no. 2, pp. 14–20, Apr. 2023.

[8] P. Ferrand, M. Guillaud, C. Studer, and O. Tirkkonen, "Wireless channel charting: Theory, practice, and applications," IEEE Commun. Mag., vol. 61, no. 6, pp. 124–130, Jun. 2023.

[9] J. Deng, S. Medjkouh, N. Malm, O. Tirkkonen, and C. Studer, "Multipoint channel charting for wireless networks," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2018, pp. 286–290.

[10] F. Euchner, P. Stephan, M. Gauger, S. Dörner, and S. t. Brink, "Improving triplet-based channel charting on distributed massive MIMO measurements," in Proc. IEEE Int. Workshop Signal Process. Advances Wireless Commun. (SPAWC), Jul. 2022, pp. 1–5.

[11] P. Agostini, Z. Utkovski, and S. Stańczak, "Federated learning for multipoint channel charting," in Proc. IEEE Int. Workshop Signal Process. Advances Wireless Commun. (SPAWC), Jul. 2022, pp. 1–5.

[12] P. Ferrand, A. Decurninge, L. G. Ordoñez, and M. Guillaud, "Triplet-based wireless channel charting: Architecture and experiments," IEEE J. Sel. Areas Commun., vol. 39, no. 8, pp. 2361–2373, Jun. 2021.

[13] Remcom, Inc. (2022) Wireless InSite. [Online]. Available: https://www.remcom.com/wireless-insite-em-propagation-software/

[14] F. Wen, H. Wymeersch, B. Peng, W. P. Tay, H. C. So, and D. Yang, "A survey on 5G massive MIMO localization," Digital Signal Process., vol. 94, pp. 21–28, Nov. 2019.

[15] H. Liu, H. Darabi, P. Banerjee, and J. Liu, "Survey of wireless indoor positioning techniques and systems," IEEE Trans. Syst., Man, Cybern. C, Appl. Rev., vol. 37, no. 6, pp. 1067–1080, Nov. 2007.

[16] J. A. del Peral-Rosado, R. Raulefs, J. López-Salcedo, and G. Seco-Granados, "Survey of cellular mobile radio localization methods: From 1G to 5G," IEEE Commun. Surveys Tuts., vol. 20, no. 2, pp. 1124–1148, 2018.

[17] W. Liu, Q. Cheng, Z. Deng, H. Chen, X. Fu, X. Zheng, S. Zheng, C. Chen, and S. Wang, "Survey on CSI-based indoor positioning systems and recent advances," in Proc. Intl. Conf. Indoor Positioning and Indoor Navigation (IPIN), Sep. 2019, pp. 1–8.

[18] E. Widdison and D. G. Long, "A review of linear multilateration techniques and applications," IEEE Access, vol. 12, pp. 26 251–26 266, Feb. 2024.

[19] S. He and S.-H. G. Chan, "Wi-Fi fingerprint-based indoor positioning: Recent advances and comparisons," IEEE Commun. Surveys Tuts., vol. 18, no. 1, pp. 466–490, 2016.

[20] X. Wang, L. Gao, S. Mao, and S. Pandey, "CSI-based fingerprinting for indoor localization: A deep learning approach," IEEE Trans. Veh. Technol., vol. 66, no. 1, pp. 763–776, Jan. 2017.

[21] J. Vieira, E. Leitinger, M. Sarajlic, X. Li, and F. Tufvesson, "Deep convolutional neural networks for massive MIMO fingerprint-based positioning," in Proc. IEEE Intl. Symp. Personal, Indoor, Mobile Radio Commun., Oct. 2017, pp. 1–6.

[22] M. Arnold, J. Hoydis, and S. t. Brink, "Novel massive MIMO channel sounding data applied to deep learning-based indoor positioning," in Intl. ITG Conf. Systems, Commun., Coding, Feb. 2019, pp. 1–6.

[23] P. Ferrand, A. Decurninge, and M. Guillaud, "DNN-based localization from channel estimates: Feature design and experimental results," in Proc. IEEE Global Telecommun. Conf. (GLOBECOM), Dec. 2020, pp. 1–6.

[24] M. Stahlke, T. Feigl, M. H. C. García, R. A. Stirling-Gallacher, J. Seitz, and C. Mutschler, "Transfer learning to adapt 5G AI-based fingerprint localization across environments," in Proc. IEEE Veh. Technol. Conf. Spring (VTC-Spring), Jun. 2022, pp. 1–5.

[25] E. Gönültaş, E. Lei, J. Langerman, H. Huang, and C. Studer, "CSI-based multi-antenna and multi-point indoor positioning using probability fusion," IEEE Trans. Wireless Commun., vol. 21, no. 4, pp. 2162–2176, Apr. 2022.

[26] A. Foliadis, M. H. Castañeda Garcia, R. A. Stirling-Gallacher, and R. S. Thomä, "Reliable deep learning based localization with CSI fingerprints and multiple base stations," in Proc. IEEE Int. Conf. Commun. (ICC), May 2022, pp. 3214–3219.

[27] X. Li, H. Al-Tous, S. E. Hajri, and O. Tirkkonen, "Covariance difference of arrival based fingerprinting localization," in Proc. IEEE Veh. Technol. Conf. Spring (VTC-Spring), Jun. 2023, pp. 1–6.

[28] G. Tian, I. Yaman, M. Sandra, X. Cai, L. Liu, and F. Tufvesson, "Deep-learning-based high-precision localization with massive MIMO," IEEE Trans. on Mach. Learn. in Commun. and Netw., vol. 2, pp. 19–33, Nov. 2024.

[29] P. Huang, O. Castañeda, E. Gönültaş, S. Medjkouh, O. Tirkkonen, T. Goldstein, and C. Studer, "Improving channel charting with representation-constrained autoencoders," in Proc. IEEE Int. Workshop Signal Process. Advances Wireless Commun. (SPAWC), Aug. 2019, pp. 1–5.

[30] E. Lei, O. Castañeda, O. Tirkkonen, T. Goldstein, and C. Studer, "Siamese neural networks for wireless positioning and channel charting," in Proc. Allerton Conf. Commun., Contr., Comput., Sep. 2019, pp. 200–207.

[31] J. Deng, O. Tirkkonen, J. Zhang, X. Jiao, and C. Studer, "Network-side localization via semi-supervised multi-point channel charting," in Proc. Int. Wireless Commun. and Mobile Comput. (IWCMC), Jun. 2021, pp. 1654–1660.

[32] Q. Zhang and W. Saad, "Semi-supervised learning for channel charting-aided IoT localization in millimeter wave networks," in Proc. IEEE Global Telecommun. Conf. (GLOBECOM), Dec. 2021, pp. 1–6.

[33] J. Deng, W. Shi, J. Hu, and X. Jiao, "Semi-supervised t-SNE for millimeter-wave wireless localization," in Int. Conf. on Comput. and Commun. (ICCC), Dec. 2021, pp. 1015–1019.

[34] A. Ermolov, S. Kadambi, M. Arnold, M. Hirzallah, R. Amiri, D. S. M. Singh, S. Yerramalli, D. Dijkman, F. Porikli, T. Yoo, and B. Major, "Neural 5G indoor localization with IMU supervision," in Proc. IEEE Global Telecommun. Conf. (GLOBECOM), Dec. 2023, pp. 3922–3927.

[35] I. Karmanov, F. G. Zanjani, I. Kadampot, S. Merlin, and D. Dijkman, "WiCluster: Passive indoor 2D/3D positioning using WiFi without precise labels," in Proc. IEEE Global Telecommun. Conf. (GLOBECOM), Dec. 2021, pp. 1–7.

[36] F. Euchner, P. Stephan, and S. t. Brink, "Augmenting channel charting with classical wireless source localization techniques," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2023, pp. 1641–1647.

[37] O. Esrafilian, M. Ahadi, F. Kaltenberger, and D. Gesbert, "Global scale self-supervised channel charting with sensor fusion," arXiv preprint arXiv:2405.04357, 2024.

[38] J. Pihlajasalo, M. Koivisto, J. Talvitie, S. Ali-Löytty, and M. Valkama, "Absolute positioning with unsupervised multipoint channel charting for 5G networks," in Proc. IEEE Veh. Technol. Conf. Fall (VTC-Fall), Nov. 2020, pp. 1–5.

[39] M. Stahlke, G. Yammine, T. Feigl, B. M. Eskofier, and C. Mutschler, "Indoor localization with robust global channel charting: A time-distance-based approach," IEEE Trans. on Mach. Learn. in Commun. and Netw., Mar. 2023.

[40] M. Stahlke, G. Yammine, T. Feigl, B. M. Eskofier, and C. Mutschler, "Velocity-based channel charting with spatial distribution map matching," IEEE J. Indoor Seamless Position. Navig., vol. 2, pp. 230–239, 2024.

[41] P. Stephan, F. Euchner, and S. t. Brink, "Angle-delay profile-based and timestamp-aided dissimilarity metrics for channel charting," IEEE Trans. Commun., Apr. 2024, early access.

[42] L. v. d. Maaten, E. Postma, and J. v. d. Herik, "Dimensionality reduction: a comparative review," J. Mach. Learn. Research, vol. 10, no. 1-41, 2009.

[43] B. Rappaport, E. Gönültaş, J. Hoydis, M. Arnold, P. K. Srinath, and C. Studer, "Improving channel charting using a split triplet loss and an inertial regularizer," in Int. Symp. on Wireless Commun. Sys.s (ISWCS), Sep. 2021, pp. 1–6.

[44] T. Yassine, L. L. Magoarou, S. Paquelet, and M. Crussière, "Leveraging triplet loss and nonlinear dimensionality reduction for on-the-fly channel charting," in Proc. IEEE Int. Workshop Signal Process. Advances Wireless Commun. (SPAWC), Jul. 2022, pp. 1–5.

[45] A. Kirmaz, D. S. Michalopoulos, I. Balan, and W. Gerstacker, "LOS/NLOS classification using scenario-dependent unsupervised machine learning," in Proc. IEEE Int. Symp. Personal, Indoor, Mobile Radio Commun. (PIMRC), Sep. 2021, pp. 1134–1140.

[46] L. Brasseler, M. Stahlke, T. Altstidl, T. Feigl, and C. Mutschler, "Non-line-of-sight detection for radio localization using deep state space models," in Proc. Int. Conf. Indoor Positioning Indoor Navig. (IPIN), Oct. 2024, pp. 1–6.

[47] O. L. A. López, D. Kumar, and A. Tölli, "Polarization diversity-enabled LOS/NLOS identification via carrier phase measurements," IEEE Trans. Commun., vol. 71, no. 3, pp. 1678–1690, Jan. 2023.

[48] X. Glorot and Y. Bengio, "Understanding the difficulty of training deep feedforward neural networks," in Proc. Thirteenth Int. Conf. Artificial Intelligence Stat., vol. 9, May 2010, pp. 249–256.

[49] K. He, X. Zhang, S. Ren, and J. Sun, "Delving deep into rectifiers: Surpassing human-level performance on ImageNet classification," in IEEE Int. Conf. Comp. Vision (ICCV), Dec. 2015, pp. 1026–1034.

[50] H. Al–Tous, P. Kazemi, C. Studer, and O. Tirkkonen, "Channel charting with angle-delay-power-profile features and earth-mover distance," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2022, pp. 1195–1201.

[51] Á. Vathy-Fogarassy and J. Abonyi, Graph-Based Clustering and Data Visualization Algorithms, ser. Springer Briefs in Comput. Sci. London, United Kingdom: Springer, 2013.

[52] J. B. Kruskal, "Multidimensional scaling by optimizing goodness of fit to a nonmetric hypothesis," Psychometrika, vol. 29, no. 1, pp. 1–27, 1964.

[53] C. Rajski, "A metric space of discrete probability distributions," Inf. and Contr., vol. 4, no. 4, pp. 371–377, 1961.

[54] F. Euchner, M. Gauger, S. Dörner, and S. t. Brink, "A distributed massive MIMO channel sounder for \"big CSI data\"-driven machine learning," in Proc. Int. ITG Workshop on Smart Antennas (WSA), Nov. 2021.

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2406.13722v2 的全文中文译稿，按原文结构译出：摘要、第 I 节引言（背景、益处用例、贡献、相关工作、记号、结构）、第 II 节信道图谱基础（运行原理、系统模型、CSI 特征提取、神经网络信道图谱、三元组信道图谱）、第 III 节真实世界坐标信道图谱（LoS AP 估计、双边定位损失、LoS 边界框损失、损失组合）、第 IV 节方法／基线／性能指标（网络结构、超参数、P1/P2 与 B1—B4、TW/CT/KS/RD/MDE/第 95 百分位）、第 V 节结果（三个场景的描述、接收功率分析、参数设置、性能评估与跨场景比较）、第 VI 节结论与未来工作、图 1—图 7 图注、表 I—表 IV、54 条英文参考文献。原文无附录。公式覆盖原文式 (1)—(20)，脚注 1—14 已按原位置以引用块译出。

**源文页码：** 第 1 页（题名、作者、摘要、引言前半、脚注与基金信息）→ 第 2 页（贡献、相关工作、记号、结构、第 II 节开头）→ 第 3 页（第 II 节、式 (1)—(3)）→ 第 4 页（式 (4)—(7)、第 III 节开头）→ 第 5 页（式 (8)—(10)、第 IV 节开头）→ 第 6 页（P2、B1—B4、式 (11)—(13)）→ 第 7 页（式 (14)—(20)、第 V 节开头）→ 第 8 页（表 I、图 1、图 2、第 V-A 节）→ 第 9 页（表 II、图 3 说明、第 V-B 节）→ 第 10 页（图 3、表 II、第 V-C 节）→ 第 11 页（表 III、图 4、第 V-C 节）→ 第 12 页（图 5、第 V-C/D 节、第 VI 节开头）→ 第 13 页（表 IV、图 6、结论、参考文献 [1]—[16]）→ 第 14 页（图 7、参考文献 [17]—[38]）→ 第 15 页（参考文献 [39]—[54]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；公式已按 PDF 文本层与第 1、5、8、10、11、13 页渲染图交叉核对（式 (8)、(9)、(14)—(20)、表 I—表 IV 逐项对照）。
2. 表 I—表 IV 均为源 PDF 排版表格，文本层存在错位；本页表格依据相应页面渲染图像逐格转录（含全部数值、单位、符号与图号），未改变任何数值。
3. 图 1—图 7 均未上传图片，仅提供中文图注与正文关键数值；指纹图谱与误差图上的曲线／散点不作数字化估算。
4. 原文脚注 1—14 已按原位置以引用块译出；其中脚注 1（"监督／半监督"术语说明）原文挂于第 2 页第 I-B 节句末，译文置于该段之后。
5. **原文疑点／排版说明：** ①原文式 (13) 与式 (12) 中"上波浪线"记号（$\widetilde{\mathcal L}_{\mathrm{MSE}}$、$\mathcal L_{\mathrm t,\widetilde{\mathrm{MSE}}}$）在文本层易与普通下标混淆，译文按渲染图与上下文统一为波浪线记号，未改动数学含义；②表 II 中 P1 的第 95 百分位标准差原文记为 "± 1.306"（三位小数，与其他行的两位小数格式不同），按原文照录；③图 4 与图 6 的图注在原文中位于图的上方（与图 3、5、7 的图注位于下方不同），译文按内容合并陈述。
6. 版权：本文为 arXiv 预印本（cs.IT），本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。页面目录日期 2026-10-02 为站点归档日期，页首"版本"采用 v2（2025-04-08）信息。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
