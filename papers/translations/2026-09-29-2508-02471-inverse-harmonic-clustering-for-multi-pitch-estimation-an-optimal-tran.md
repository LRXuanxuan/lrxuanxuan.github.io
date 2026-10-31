---
layout: page
title: "多基频估计的逆谐波聚类：最优传输方法｜中文全文译文"
permalink: /papers/translations/2026-09-29-2508-02471-inverse-harmonic-clustering-for-multi-pitch-estimation-an-optimal-tran/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b37cb7101a38a73d/) · [原文 arXiv](https://arxiv.org/abs/2508.02471) · [全部目录](/papers/catalog/)

# 多基频估计的逆谐波聚类：最优传输方法

**原题：** Inverse Harmonic Clustering for Multi-Pitch Estimation: An Optimal Transport Approach  
**作者：** Anton Björkman、Filip Elvander  
**单位：** 芬兰阿尔托大学（Aalto University）信息与通信工程系（邮箱：firstname.lastname@aalto.fi）。  
**版本：** arXiv:2508.02471v1（eess.SP），2025-08-04，原文 13 页（含图 1—8、表 I—II、附录）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—IX 节、附录（命题 1 与命题 3 的证明）、图 1—8 图注、表 I—II（逐格）、参考文献 [1]—[52] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2508.02471，2026-09-29"；本地 PDF 实为 **arXiv:2508.02471v1 [eess.SP]，2025-08-04**，"2026-09-29" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

本文研究多基频（multi-pitch）估计问题，即从含噪测量中识别叠加的截断谐波序列。我们把该问题表述为在单位圆上恢复一个**具有谐波结构的测度**，其中该结构由基于最优传输（optimal transport，OT）理论的正则化项施加。在所得框架中，信号的谱内容被同时推断并**分配（或传输）**到由相应基频定义的一小组谐波序列上。与压缩感知范式的现有方法不同，所提框架将正则化与字典设计解耦，从而缓解相干性问题；作为直接结果，它还引入了对非谐性（inharmonicity）现象的鲁棒性。基于该框架，我们分别针对随机信号与确定性信号推导出两种估计方法，并提出实现它们的有效数值算法。在合成数据与真实数据的数值研究中，所提方法相比统计信号处理文献中的其他方法取得更好的估计性能；此外，除网络类方法在其所训练的数据类型上、并在推断时可获得多得多的数据的情形外，所提方法与其性能相当或更优。

**索引词**：多基频估计；基频；非谐性；最优传输；谱估计。

## I. 引言

基频（fundamental frequency），或称音高（pitch）估计，是信号处理中多种应用的常见任务，包括语音处理 [1]、音乐音频信号处理 [2]、[3] 与生物医学建模 [4]。该任务可分为两类：单基频估计与多基频估计，后者明显更具挑战性、研究也更少。单基频估计旨在识别由单个谐波序列构成的信号的基频，例如单个乐器或仅有一位说话人发声的情形。相反，当多种乐器同时演奏或存在多位说话人时，多基频估计问题自然出现。

对单基频问题已有多种方法，例如 YIN [5]、RAPT [6] 与 SWIPE [7]，其中 YIN 与 RAPT 基于信号自相关，SWIPE 则试图寻找最能描述输入信号频谱的锯齿波基频的最佳匹配。多基频问题（一般综述见 [8]）方面，近期一些方法是基于字典的参数化方法，其原子对应谐波序列，例如 PEBS [9]，信号分量通过最小化促进稀疏性的优化准则识别，通常表述为正则化最小二乘问题。PEBS 的扩展 PEBS2TV 在 [10] 中提出，加入全变差项以处理模型中的次谐波（subharmonic）误差。另一方法 PEBSI-lite 在 [11] 中提出，通过更好地近似其中一个惩罚项，并引入自正则化与自适应字典构造，改进了 PEBS2TV。基于同类字典的另一方法是 PE-BSBL-Cluster（本文记为 PE-BSBL-C）[12]，它改用带块稀疏先验的贝叶斯学习与块内聚类来处理次谐波误差。此处估计基于信号谐波结构的假设，例如若第一谐波缺失或邻近谐波缺失则施加额外惩罚。这些方法的缺点之一是：由于不同候选音高的谐波相互重叠，字典原子变得高度相干；此外这些方法假定每个音高内部完全谐波，使其在非谐性面前易出错——即各正弦分量偏离谐波模型的情形，例如弦乐器 [13]–[15] 以及一定程度上的人类语音 [16]。

近期提出了基于深度学习的音高估计器，在单基频与多基频问题上都展现出有前景的结果。单基频问题的估计器包括 CREPE [17]、Harmof0 [18] 与 SPICE [19]；多基频问题的例子有 DeepSalience [20] 以及 [21] 中在其基础上构建的三个模型。这些方法虽已被证明对音高估计有效，但本质上对输入施加了某些限制。例如，若模型在特定类型数据（如语音）上训练，则可能无法有效检测音乐等其他信号类型的音高；此外，采样率、帧长、频率范围与帧移等参数往往由模型结构本身强制规定，或需与训练数据匹配。因此若想改变这些参数，模型要么需重新训练，要么需对信号施加重采样等预处理步骤（这些估计器通常如此处理）。

与上述基于字典的多基频估计器类似，我们的工作也构建类似字典来形成估计；但与其它基于字典的方法不同，我们提出通过一个字典来表述多基频估计，从而同时缓解对基于音高的字典的需求，且字典原子不是完整谐波序列，而是**傅里叶基函数**，从而消除原子间的谐波重叠。具体地，目标是推断观测信号的谱内容（即各正弦分量的功率或幅度与频率），同时把这些分量分配到少量对应于音高的组中。该分组基于最优传输（OT）的 Monge–Kantorovich 问题 [22] 完成。基于 OT 的问题此前已用于谱估计（见例如 [23]–[26]）以及音高估计语境 [27]–[30]；但据作者所知，我们前期工作 [31] 是首个提出基于 OT 的估计器、把多基频估计作为逆问题求解（仅已知信号波形的含噪观测）的工作，本文在其基础上扩展。

本文旨在我们前期工作 [31] 的基础上进一步推进。与前期工作的区别如下：第一，我们把问题定义在更一般的形式下，这不仅使我们能更精确地表述所要解决的特定问题，也便于后续回到该一般形式：我们先求解音高估计问题，再回到一般形式，然后重新估计信号的频率结构；第二，我们提出基于测量自协方差的新估计表述；第三，我们开展比前期工作更充分的实验，包括真实数据与蒙特卡洛式研究，并在适用处给出与基于深度网络方法的比较（前期工作未包含）。

### A. 记号

除非特别说明，标量、列向量与矩阵分别用小写、小写粗体与大写粗体字母表示，如 $a$、$\mathbf a$ 与 $\mathbf A$。$(\cdot)^T$、$(\cdot)^H$ 与 $(\bar\cdot)$ 分别表示转置、Hermitian 转置与复共轭。对 $F\in\mathbb N$，记 $[\![F]\!]\triangleq\{1,2,\ldots,F\}$。记 $\mathbb T\triangleq[-\pi,\pi)$，并将其与单位圆等同。进一步，记 $C_{\mathrm{per}}(\mathbb T)$ 为 $\mathbb T$ 上连续、复值、$2\pi$ 周期函数的集合；记 $C_{\mathcal M}(\mathbb T)$ 为 $C_{\mathrm{per}}(\mathbb T)$ 上有界线性泛函的集合，即 $C_{\mathrm{per}}(\mathbb T)$ 的对偶空间——具体地，它是 $\mathbb T$ 上具有有限全变差的复值测度的集合。记 $\mathcal M_+(\mathbb T)$ 为 $C_{\mathcal M}$ 中由实、非负测度构成的子集。对 $f\in C_{\mathrm{per}}(\mathbb T)$ 与 $\mu\in C_{\mathcal M}(\mathbb T)$，用记号 $\langle\mu,f\rangle$ 表示泛函 $\mu$ 作用于 $f$，即

$$
\langle\mu,f\rangle=\int_{\mathbb T}f(\omega)\,\mathrm d\mu(\omega).
$$

对 Hilbert 空间，用 $\langle\cdot,\cdot\rangle$ 表示标准内积；特别地，对两个矩阵 $\mathbf A,\mathbf B\in\mathbb C^{m\times n}$，$\langle\mathbf A,\mathbf B\rangle=\operatorname{trace}(\mathbf A\mathbf B^H)$。对标量 $a$，$|a|$ 表示绝对值；对向量 $\mathbf a$，绝对值逐元素施加，记为 $|\mathbf a|$。进一步，对 $\mu\in C_{\mathcal M}(\mathbb T)$，$|\mu|$ 表示变差，即对任意 $E\subset\mathbb T$

$$
|\mu|(E)=\sup\sum_p|\mu(E_p)|,
$$

其中上确界取遍 $E$ 的所有划分。注意 $|\mu|\in\mathcal M_+(\mathbb T)$，且若 $\mu\in\mathcal M_+(\mathbb T)$ 则 $|\mu|=\mu$。

## II. 信号模型

考虑如下形式的离散时间复值信号（脚注 1）$y$：

$$
y_t=x_t+v_t,\qquad t=0,1,2,\ldots\tag{1}
$$

其中 $x$ 为目标信号，$v$ 为加性噪声项，假定为方差 $\sigma_v^2$ 的循环对称白高斯噪声，即 $v_t\sim\mathcal{CN}(0,\sigma_v^2)$ 且对不同 $t$ 相互独立。我们在此假定 $x$ 是非谐多基频信号，即 $x$ 可按

$$
x_t=\sum_{k=1}^{K}x_t^{(k)},\tag{2}
$$

分解为 $K\in\mathbb N$ 个分量，其中每个 $x^{(k)}$ 为近似周期（即非谐）波形。具体地，对某谐波阶数 $L^{(k)}\in\mathbb N$，每个分量形如

$$
x_t^{(k)}=\sum_{\ell=1}^{L^{(k)}}\alpha_\ell^{(k)}e^{i\omega_\ell^{(k)}t},\tag{3}
$$

其中 $\alpha_\ell^{(k)}\in\mathbb C$（$\ell\in[\![L^{(k)}]\!]$）为复幅度，频率 $\omega_\ell^{(k)}\in\mathbb T$ 构成近似谐波集合：

$$
\omega_\ell^{(k)}\approx\ell\omega_0^{(k)},\tag{4}
$$

其中 $\omega_0^{(k)}\in\mathbb T$。（4）中的近似相等应理解为存在所谓非谐性参数 $\Delta_\ell^{(k)}$（$|\Delta_\ell^{(k)}|\ll\omega_0^{(k)}$），使 $\omega_\ell^{(k)}=\ell\omega_0^{(k)}+\Delta_\ell^{(k)}$。关于如何严格定义非谐信号的"基频" $\omega_0^{(k)}$ 的深入讨论见 [30]。于是给定信号波形 $x$ 的有限个含噪样本（即（1）中 $t=0,1,\ldots,N-1$、$N\in\mathbb N$ 有限的观测 $y_t$），我们希望找到分解（2）并估计基频集合 $\{\omega_0^{(k)}\}_{k=1}^{K}$。我们把该问题称为**非谐多基频估计**，其中每个分量 $x^{(k)}$ 称为一个音高。

> **脚注 1**：为一般性，此处考虑复值表示；但它可容易地构成实值信号的离散时间解析形式 [32]。

**图 1**：频率网格点密度示例。蓝色为均匀网格情形，红色为谐波字典所用频率网格；两种网格的总网格点数相同。

### A. 现有方法与动机

在完全谐波情形（即（4）中等号成立）下，统计信号处理文献中的最先进多基频估计方法围绕**简约信号表示**思想，尤其是压缩感知概念。概括而言，许多方法（如 [9]–[11]）求解如下形式的问题：

$$
\min_{\boldsymbol\alpha}\ \frac{1}{2}\|\mathbf y-\mathbf A\boldsymbol\alpha\|_2^2+R(\boldsymbol\alpha),\tag{5}
$$

其中 $\mathbf y=[y_0\ y_1\ \ldots\ y_{N-1}]^T$ 为信号样本集合，$\mathbf A$ 为用于近似信号的有限字典，$\boldsymbol\alpha$ 为相应系数集合；$R$ 为与恰当选择的 $\mathbf A$ 结构一起、用于在估计 $\mathbf A\boldsymbol\alpha$ 上促进稀疏音高结构的正则化函数。通常字典 $\mathbf A$ 的"原子"是对应截断谐波序列的列向量块，即对这样的块 $\mathbf A^{(k)}\in\mathbb C^{N\times L^{(k)}}$ 与相应系数向量 $\boldsymbol\alpha^{(k)}\in\mathbb C^{L^{(k)}}$，向量 $\mathbf A^{(k)}\boldsymbol\alpha^{(k)}$ 表示形如（2）的（完全谐波）信号样本。正则化项 $R$ 被设计为在完整系数向量 $\boldsymbol\alpha$ 上促进块稀疏结构；估计的基频 $\{\omega_0^{(k)}\}_{k=1}^{K}$ 通过识别 $\boldsymbol\alpha$ 中相应非零块得到。尽管 [12] 中的方法不遵循（5）的结构，但它使用同类字典，以类似方式（但通过贝叶斯框架）施加稀疏性。

这些方法虽可给出高精度估计，但易受众所周知的**离网效应**影响 [33]。可通过选择足够细的 $\mathbf A$ 原子（即候选音高块 $\mathbf A^{(k)}$）来应对；然而要达到对区间 $\mathbb T$ 的期望覆盖，会导致字典 $\mathbf A$ 很大且高度相干，这既影响估计性能，也影响求解（5）的计算负担。此外，这种刚性结构不允许偏离完全谐波假设，例如本文考虑的非谐性。值得指出，也存在基于原子范数去噪 [34],[35] 的无网格（grid-free/grid-less）方法，但它们需要求解大规模半定规划 [36] 或依赖非凸启发式 [37]，且同样不能容纳偏离完全谐波性的情形。

相反，本文提出把多基频估计表述为从含噪间接测量中恢复测度的问题，并设计在被求测度上施加音高结构的正则化函数 $R$。如下文将展示的，借助最优传输概念，这使我们能把**测量机制**（即把信号"系数"映射到观测的映射）与**正则化项**解耦。这与上述方法形成鲜明对比——在那些方法中，测量与正则化都内在依赖于字典 $\mathbf A$ 的结构。作为说明，图 1 给出以谐波序列为原子的字典所导致的频率轴采样：可见这导致高度非均匀的频率网格化；此外还应强调，此类字典还会因谐波重叠而产生重复网格点。作为对照，图中给出了本文所提方法所用的傅里叶向量字典的均匀采样。

如上所述，我们将基于最优传输概念构造正则化项。在此之前，先把信号 $x$ 与 $\mathbb T$ 上的复值测度（即 $C_{\mathcal M}(\mathbb T)$ 的元素）联系起来，这使我们能谈论 $x$ 的"质量"概念，并自然引出传输表述。我们将在两种不同设置下这样做：一种随机、一种确定性。二者虽相关，但最终导致不同的正则化项与估计器。

### B. 随机模型

假定（3）中复幅度 $\alpha_\ell^{(k)}$ 是参数化为 $\alpha_\ell^{(k)}=\sigma_\ell^{(k)}z_\ell^{(k)}$ 的随机变量，其中 $\sigma_\ell>0$ 为确定性量，$z_\ell$ 为独立、零均值、循环对称、单位方差的随机变量，即 $\mathbb E(z_\ell^{(k)})=0$、$\mathbb E(|z_\ell^{(k)}|^2)=1$，其中 $\mathbb E(\cdot)$ 为期望算子。于是信号 $x$ 是宽平稳随机过程，其协方差函数 $r:\mathbb Z\to\mathbb C$ 定义为

$$
r(\tau)\triangleq\mathbb E(x_tx_{t-\tau})=\sum_{k=1}^{K}\sum_{\ell=1}^{L^{(k)}}\left(\sigma_\ell^{(k)}\right)^2e^{i\omega_\ell^{(k)}\tau},\qquad\tau\in\mathbb Z.
$$

由此可把 $x$（或 $r$）与 $\mathbb T$ 上的非负测度 $\nu\in\mathcal M_+(\mathbb T)\subset C_{\mathcal M}(\mathbb T)$ 相联系，即

$$
r(\tau)=\langle\nu,e^{i(\cdot)\tau}\rangle=\int_{\mathbb T}e^{i\omega\tau}\,\mathrm d\nu(\omega),\qquad\tau\in\mathbb Z.\tag{6}
$$

也就是说，$\nu$ 通过作用于以 $\tau$ 索引的函数族 $f_\tau(\omega)=e^{i\omega\tau}$ 生成协方差函数。具体地，

$$
\nu=\sum_{k=1}^{K}\sum_{\ell=1}^{L^{(k)}}\left(\sigma_\ell^{(k)}\right)^2\delta_{\omega_\ell^{(k)}},\tag{7}
$$

其中 $\delta_q$ 为 $q\in\mathbb T$ 处的 Dirac 测度。这正是 Wiener–Khinchin 定理的表述，$\nu$ 即 $x$ 的功率谱。于是若考虑协方差函数 $r$ 在时滞 $\tau=0,1,\ldots,T-1$（$T\in\mathbb N$）上的有限观测集，可定义线性算子 $\mathcal A:C_{\mathcal M}(\mathbb T)\to\mathbb C^T$ 使 $[\mathcal A(\nu)]_\tau=\langle\nu,e^{i(\cdot)\tau}\rangle$，即

$$
\mathbf r=\mathcal A(\nu),\tag{8}
$$

其中 $\mathbf r=[r(0)\ r(1)\ \ldots\ r(T-1)]^T$。因此若能获得 $\mathbf r$ 或其估计，就设想可通过反演关系（8）恢复 $\nu$，进而获得 $x$ 的频率内容。若观测 $\mathbf r$ 无噪且 $T>\sum_{k=1}^{K}L^{(k)}$，由 Carathéodory–Fejér 定理 [38]，这确实可行，MUSIC 算法 [39] 即如此。实践中 $\mathbf r$ 含噪，需对关系式施加正则化以允许反演。

注意谱 $\nu$ 可解释为 $\mathbb T$ 上的质量分布；此外 $\nu$ 可分解为 $K$ 个近似谐波分量测度 $\nu^{(k)}\in\mathcal M_+(\mathbb T)$：

$$
\nu=\sum_{k=1}^{K}\nu^{(k)},\qquad\text{其中}\quad\nu^{(k)}=\sum_{\ell=1}^{L^{(k)}}\left(\sigma_\ell^{(k)}\right)^2\delta_{\omega_\ell^{(k)}}.\tag{9}
$$

注意由 $\nu^{(k)}$ 可直接获得相应 $x^{(k)}$ 的频率内容。这种加性分解与质量分布解释使我们能借助最优传输理论恢复"具有多基频结构"的 $\nu$。

### C. 确定性模型

这里采取另一种视角：把复幅度 $\alpha_\ell^{(k)}$ 视为确定性常数。尽管我们失去协方差函数与功率谱的概念，仍可把信号 $x$ 与 $C_{\mathcal M}(\mathbb T)$ 中的某元素相联系。事实上，此测度 $\mu\in C_{\mathcal M}(\mathbb T)$ 现在直接生成信号样本，即

$$
x_t=\langle\mu,e^{i(\cdot)t}\rangle=\int_{\mathbb T}e^{i\omega t}\,\mathrm d\mu(\omega),\qquad t\in\mathbb N,
$$

通过作用于以时间 $t$ 索引的函数 $f_t(\omega)=e^{i\omega t}$。这里 $\mu$ 由

$$
\mu=\sum_{k=1}^{K}\sum_{\ell=1}^{L^{(k)}}\alpha_\ell^{(k)}\delta_{\omega_\ell^{(k)}}\tag{10}
$$

给出，其中与随机情形类似，注意 $\mu$ 可按 $\mu=\sum_{k=1}^{K}\mu^{(k)}$ 分解，且 $\mu^{(k)}=\sum_{\ell=1}^{L^{(k)}}\alpha_\ell^{(k)}\delta_{\omega_\ell^{(k)}}$。

若能获得 $x_t$（$t=0,1,\ldots,N-1$）的 $N\in\mathbb N$ 个观测，可类似随机情形定义线性算子 $\mathcal A:C_{\mathcal M}(\mathbb T)\to\mathbb C^N$ 使

$$
\mathbf x=\mathcal A(\mu),\tag{11}
$$

其中 $\mathbf x=[x_0\ x_1\ \ldots\ x_{N-1}]^T$。这里值得指出：在假定 $\mu$ 由少量点质量构成的情况下反演关系（11），对应于经典超分辨谱估计工作 [40]（通过原子范数/全变差最小化 [41]）；若对 $\mathbb T$ 离散化，就简单地对应于 $\ell_1$ 最小化。对我们而言，目标是把信号 $x$ 与质量分布联系起来。注意虽然 $\mu\in C_{\mathcal M}(\mathbb T)$，但它不属于 $\mathcal M_+(\mathbb T)$；不过可由变差 $|\mu|\in\mathcal M_+(\mathbb T)$ 构造这样的元素。那么若（10）中各 Dirac 测度的支撑完全不相交，$|\mu|$ 可简单写为

$$
|\mu|=\sum_{k=1}^{K}\sum_{\ell=1}^{L^{(k)}}\left|\alpha_\ell^{(k)}\right|\delta_{\omega_\ell^{(k)}}.\tag{12}
$$

若是这样，则 $|\mu|$ 可分解为 $K$ 个分量测度 $|\mu^{(k)}|\in\mathcal M_+(\mathbb T)$：

$$
|\mu|=\sum_{k=1}^{K}\left|\mu^{(k)}\right|\tag{13}
$$

其中如记号所示，$|\mu^{(k)}|$ 确实是 $\mu^{(k)}$ 的变差。然而若某些 Dirac 测度的支撑重叠，（12）中的表示不再成立，分解为 $K$ 个分量也不成立；此时得到不等式

$$
|\mu|(E)\le\sum_{k=1}^{K}\left|\mu^{(k)}\right|(E),\tag{14}
$$

对任意 $E\subset\mathbb T$ 成立。这一细微差别将在实现所提估计器的算法设计中产生实际后果。

总之，对随机与确定性两种信号模型，我们都能通过关系（8）与（11）把信号观测与 $C_{\mathcal M}(\mathbb T)$ 的元素相联系，以复测度编码信号的频率内容；目标则是恢复 $\nu$ 与 $\mu$ 的（近似）谐波结构。实现该目标的工具是基于最优传输概念构造的正则化项，下面介绍。

## III. 最优传输

考虑定义在某空间 $\mathcal X$ 上、总质量相同的两个一般非负测度（即质量分布）$\mu_1,\mu_2\in\mathcal M_+(\mathcal X)$，即 $\mu_1(\mathcal X)=\mu_2(\mathcal X)$。最优传输的 Monge–Kantorovich 问题考虑把 $\mu_1$ 传输（或变形）为与 $\mu_2$ 相同的最经济方式。把单位质量从 $\mu_1$ 的支撑点 $\omega_1$ 搬运到 $\mu_2$ 的相应支撑点 $\omega_2$ 的代价由 $c(\omega_1,\omega_2)$ 给出，其中 $c:\mathcal X\times\mathcal X\to\mathbb R$ 为所谓**基础代价（ground-cost）函数**。例如若 $\mathcal X=\mathbb R^d$（$d\in\mathbb N$），则 $c$ 通常取平方欧氏距离。最小化总重排代价的问题可表述为

$$
\begin{aligned}
\min_{\mathbf m\in\mathcal M_+(\mathcal X\times\mathcal X)}\ &\left\{\langle\mathbf m,c\rangle\triangleq\int_{\mathcal X\times\mathcal X}c(\omega_1,\omega_2)\,\mathrm d\mathbf m(\omega_1,\omega_2)\right\}\\
\text{s.t.}\ &\int_{E_1\times\mathcal X}\mathrm d\mathbf m(\omega_1,\omega_2)=\int_{E_1}\mathrm d\mu_1(\omega),\quad \int_{\mathcal X\times E_2}\mathrm d\mathbf m(\omega_1,\omega_2)=\int_{E_2}\mathrm d\mu_2(\omega),\\
&\forall E_1,E_2\subset\mathcal X.
\end{aligned}\tag{15}
$$

这里传输计划 $\mathbf m$ 描述质量如何从 $\mu_1$ 移到 $\mu_2$，约束确保 $\mathbf m$ 确实描述两分布之间的传输。这可表述为 $\mathbf m$ 具有边缘 $\mu_1$ 与 $\mu_2$，记 $\mathrm P_1(\mathbf m)=\mu_1$、$\mathrm P_2(\mathbf m)=\mu_2$，其中投影算子 $\mathrm P_1$、$\mathrm P_2$ 由（15）中约束唯一确定。问题（15）的最小目标值可作为 $\mathcal M_+(\mathcal X)$ 上的距离或相异度概念，已在机器学习与信号处理中得到利用（综述见 [42]）。与本文多基频估计问题最相关的是：OT 此前已用于求解谱估计逆问题 [25]。与问题（15）不同，本文关注只能按（8）或（11）间接观测其中一个边缘、而第二边缘是自由的（即不受约束、与观测或测量无关）的设置。我们将扩展传输问题（15），以最终恢复形如（9）或（13）的分解。

## IV. 谐波谱的最优传输

考虑任意 $\mu\in\mathcal M_+(\mathbb T)$。基于 [30]，可通过一个 OT 问题量化 $\mu$ 与具有某基频 $\omega_0'$ 的谐波信号的功率谱的接近程度。特别地，设 $c:\mathbb T\times\mathbb T\to\mathbb R$ 为基础代价函数，$c(\omega,\omega_0)$ 为把频率 $\omega$ 与基频 $\omega_0$ 相关联的代价。则可形式化求解

$$
\min_{\mathbf m\in\mathcal M_+(\mathbb T\times\mathbb T)}\ \langle\mathbf m,c\rangle,\qquad\text{s.t.}\quad\mathrm P_1(\mathbf m)=\mu,\ \mathrm P_2(\mathbf m)=\mu(\mathbb T)\delta_{\omega_0'}.\tag{16}
$$

注意传输计划 $\mathbf m$ 的第一边缘与 $\mu$ 一致，而第二边缘的全部质量集中在单点 $\omega_0'$ 上。于是若 $\mathbf m^\star$ 是（16）的解，则 $S_h^c(\omega_0',\mu)\triangleq\langle\mathbf m^\star,c\rangle$ 可作为 $\mu$ 与（任意）基频为 $\omega_0'$ 的谐波谱之间的距离概念。可以注意到，该最小目标值可闭式计算：

$$
S_h^c(\omega_0',\mu)=\langle\mathbf m^\star,c\rangle=\int_{\mathbb T}c(\omega,\omega_0')\,\mathrm d\mu(\omega).
$$

这里应强调，$\mathrm P_2(\mathbf m^\star)$ 并不是谐波信号的谱；但这样的谱可由对 $(\mathbf m^\star,c)$ 或 $(\mu,c)$ 恢复，且取决于基础代价 $c$ 的具体构造。特别地，[30] 使用到最近谐波的平方距离，即 $c=\hat c$，其中

$$
\hat c(\omega,\omega_0)=\min_{k\in\mathbb Z_+}(\omega-k\omega_0)^2,\tag{17}
$$

$\mathbb Z_+$ 为正整数集合。相应的隐含谐波谱由

$$
\mu_h=\sum_k\sigma_k^2\delta_{k\omega_0},\qquad\text{其中}\quad\sigma_k^2=\int_{(k-1/2)\omega_0}^{(k+1/2)\omega_0}\mathrm d\mu(\omega)
$$

给出。值得指出，若 $\mu$ 在区间边界上含点质量，则 $\mu_h$ 不唯一。同样的基础代价在 [27] 的音乐转写语境中也被使用。虽然 $\hat c$ 的选择直观上合理，但若要用 $S_h^{\hat c}$ 在拟合 $\mu$ 的不同 $\omega_0$ 之间选择，它会强烈偏好低基频 $\omega_0$。特别地，容易验证对任意 $\mu\in\mathcal M_+(\mathbb T)$ 与 $\omega_0\in\mathbb T$ 有 $S_h^{\hat c}(\omega_0/2,\mu)\le S_h^{\hat c}(\omega_0,\mu)$，这是 $\hat c(\omega_0/2,\omega)\le\hat c(\omega_0,\omega)$（$\forall\omega\in\mathbb T$）的直接结果。这必然导致所谓**次八度误差（sub-octave errors）**，通常用限制最大谐波阶数或对隐含谱 $\mu_h$ 施加额外结构的启发式规则来应对。本文提出通过简单归一化来修正，并定义基础代价为

$$
c(\omega,\omega_0)=\frac{1}{\omega_0^2}\hat c(\omega,\omega_0)=\min_{k\in\mathbb Z_+}\left(\frac{\omega}{\omega_0}-k\right)^2.\tag{18}
$$

注意与 $\hat c$ 一样，$c$ 也诱导传输计划 $\mathbf m$ 把质量传输到给定 $\omega_0$ 的最近谐波上，因此 $c$ 与 $\hat c$ 隐含相同的谐波谱 $\mu_h$；但当应用于非谐信号时，相应的 $S_h^c$ 表现出偏好 $\omega_0$ 而非 $\omega_0/2$。为看清这一点，考虑位于 $\omega_k=k\omega_0+\Delta$（$|\Delta|<\omega_0/2$，$\Delta$ 为非谐偏差）的某非谐分量，则 $c(\omega_k,\omega_0)<c(\omega_k,\omega_0/2)$ 当且仅当 $|\Delta|<\omega_0/3$。也就是说，要偏好 $\omega_0/2$ 而非 $\omega_0$，非谐偏差必须相当大。图 2 给出说明：对音高候选 $\omega_0$ 与 $\omega_0/2$ 分别绘制两个函数。因此对所提基础代价函数，对小谐波偏差的最优解由能以最近距离描述全部谐波的**最大可能基频**模型给出。

**图 2**：基础代价函数示例。下图为（17）中的基础代价函数，上图为所提（18）中的基础代价函数。

## V. 谐波聚类

本节推导所提多基频估计器，分别针对随机与确定性情形。为表述清晰，讨论聚焦于较简单的随机设置，然后给出确定性情形所需的修改。

### A. 理想问题与凸松弛

对（2）中的模型，假定音高分量数 $K$ 已知。设 $\boldsymbol\omega_0=\{\omega_0^{(k)}\}_{k=1}^{K}$ 为（未知）基频集合，我们希望求解

$$
\min_{\nu^{(k)}\in\mathcal M_+(\mathbb T),\ \boldsymbol\omega_0}\ \frac{1}{2}\left\|\mathbf r-\mathcal A(\nu))\right\|_2^2+\sum_{k=1}^{K}S_h^c\left(\omega_0^{(k)},\nu^{(k)}\right),\tag{19}
$$

其中 $\nu=\sum_{k=1}^{K}\nu^{(k)}$，第一项数据拟合项考虑 $\mathbf r$ 在实践中是有限长协方差序列的含噪估计。注意正则化函数的每一项量化某分量测度（谱）$\nu^{(k)}$ 与基频 $\omega_0^{(k)}$ 的谐波谱的吻合程度。可以验证：虽然该问题在 $\nu^{(k)}$ 集合上是凸的，但在 $(\{\nu^{(k)}\}_k,\boldsymbol\omega_0)$ 上并不联合凸；事实上由于（18）中基础代价 $c$ 的结构，它在 $\boldsymbol\omega_0$ 上甚至连边际凸性都不具备。虽然可以设想用 [43] 中的迭代工具处理该问题，但那需要 $\boldsymbol\omega_0$ 的良好初值。为规避这一点，考虑固定 $\boldsymbol\omega_0$ 并对 $\nu^{(k)}$ 最小化（19）的情形，这可等价表述为

$$
\min_{\mathbf m\in\mathcal M_+(\mathbb T\times\Omega)}\ \frac{1}{2}\left\|\mathbf r-\mathcal A(\mathrm P_1(\mathbf m))\right\|_2^2+\langle\mathbf m,c\rangle\tag{20}
$$

其中传输计划 $\mathbf m\in\mathcal M_+(\mathbb T\times\Omega)$ 描述 $\mathbb T$ 与离散网格 $\Omega=\{\omega_0^{(1)},\ldots,\omega_0^{(K)}\}$ 之间的传输。这是（16）中单基频问题的直接扩展：若 $\Omega$ 为单元素集，两问题相同。注意各 $\nu^{(k)}$ 可由 $\mathbf m$ 提取为 $\nu^{(k)}=\mathrm P^{(g)}(\mathbf m)$，其中投影 $\mathrm P^{(g)}:\mathcal M_+(\mathbb T\times\Omega)\to\mathcal M_+(\mathbb T)$ 由关系

$$
\mathrm P^{(g)}(\mathbf m)(E)=\mathbf m\left(E\times\{\omega_0^{(k)}\}\right),\qquad\forall E\subset\mathbb T
$$

定义。直观上，投影（或受限）测度 $\mathrm P^{(g)}(\mathbf m)$ 可理解为把传输计划 $\mathbf m$ 的第二变元固定为 $\omega_0^{(k)}$。

借助这些构造，可把 $\Omega$ 扩展为由 $G\gg K$ 个基频构成的大网格 $\Omega_G$。我们希望 $\Omega_G$ 上的支撑稀疏，即对大多数 $g\in[\![G]\!]$ 有 $\mathbf m^{(g)}(\mathbb T)=0$，图 3 给出示例。为促进在此意义下稀疏的传输计划 $\mathbf m$，同时避免计数非零 $\mathrm P^{(g)}(\mathbf m)$ 所带来的组合问题，我们提出使用凸代理

$$
\|\mathbf m\|_{\infty,1}=\sum_{g=1}^{G}\left\|\mathrm P^{(g)}(\mathbf m)\right\|_\infty,
$$

其中稍微滥用了常用于矩阵的混合范数记号。对只含点质量的元素 $\nu\in\mathcal M_+$，$\|\nu\|_\infty$ 指 $\|\nu\|_\infty=\max_{\omega\in\mathbb T}\nu(\omega)$，对应最大点质量的系数；注意这可直接推广到 $\nu$ 还含有密度分量的情形。

至此可给出随机设置下所提多基频估计器：定义为如下优化问题的解

$$
\min_{\mathbf m\in\mathcal M_+(\mathbb T\times\Omega_G)}\ \frac{1}{2}\left\|\mathbf r-\mathcal A(\mathrm P_1(\mathbf m))\right\|_2^2+\zeta\left(\langle\mathbf m,c\rangle+\eta\|\mathbf m\|_{\infty,1}\right),\tag{21}
$$

其中 $\zeta$ 与 $\eta$ 为正则化参数，控制数据拟合与正则化、以及传输计划稀疏性之间的折中。注意增大 $\eta$ 会促进传输计划 $\mathbf m$ 集中于 $\Omega_G$ 的少数点。假定由求解（21）已得到最优 $\mathbf m^\star$，则通过检查受限测度 $\mathrm P^{(g)}(\mathbf m)$ 可识别信号中存在的音高及其相应基频 $\omega_0^{(g)}$。进一步，可把网格 $\Omega_G$ 限制为只含这些活跃音高，并求解（20）以获得去偏解，从而抵消 $\|\cdot\|_{\infty,1}$ 项引起的向零收缩。在设计求解（21）的算法时，我们将使用如下等价表述：

$$
\min_{\nu\in\mathcal M_+(\mathbb T)}\ \frac{1}{2}\left\|\mathbf r-\mathcal A(\nu)\right\|_2^2+\zeta R_{\mathrm{stoch}}(\nu),\tag{22}
$$

其中 $R_{\mathrm{stoch}}(\nu)$ 定义为

$$
R_{\mathrm{stoch}}(\nu)=\min_{\mathbf m\in\mathcal M_+(\mathbb T\times\Omega_G)}\ \langle\mathbf m,c\rangle+\eta\|\mathbf m\|_{\infty,1}\qquad\text{s.t.}\quad \mathrm P_1(\mathbf m)=\nu.\tag{23}
$$

实践中求解（22）时将对算子 $\mathcal A$ 离散化。这凸显了本文方法与其它多基频估计器的一个关键区别：**测量算子与音高候选集（即集合 $\Omega_G$）无关**。对 [9]–[11] 等方法，算子 $\mathcal A$ 基于候选音高集合构造，导致前文所述相干性问题。

**图 3**：谐波谱与音高谱之间传输计划的示例。上图为音高谱，右侧旋转图为被评估信号的谱。

### B. 确定性模型的修改

回顾确定性模型中目标对象是 $\mu\in C_{\mathcal M}(\mathbb T)$。为得到与随机情形类似的估计器，须扩展表述（22）而非（21），原因在于（21）中传输计划 $\mathbf m$ 的投影必为 $\mathcal M_+(\mathbb T)$ 的元素，而扩展表述（22）允许使用前述变差构造。回顾若 $\mu\in C_{\mathcal M}(\mathbb T)$ 可分解为分量集合 $\mu^{(k)}$，则其相应变差 $|\mu|\in\mathcal M_+(\mathbb T)$ 与 $|\mu^{(k)}|\in\mathcal M_+(\mathbb T)$ 满足不等式（14），当各分量 $\mu^{(k)}$ 的支撑不重叠、或在 $\mathbb T$ 的任意重叠子集上具有相同相位时等号成立。现考虑传输计划 $\mathbf m\in\mathcal M_+(\mathbb T\times\Omega_G)$：与随机情形中受限测度 $\mathrm P^{(g)}(\mathbf m)$ 表示分量测度 $\nu^{(g)}$ 的解释类似，在确定性情形可把 $\mathrm P^{(g)}(\mathbf m)$ 视为表示分量 $\mu^{(k)}\in C_{\mathcal M}(\mathbb T)$ 的变差 $|\mu^{(k)}|$。据此并结合不等式（14），自然把（23）中的等式约束替换为不等式

$$
\mathrm P_1(\mathbf m)\ge|\mu|,\tag{24}
$$

应理解为 $\mathbb T$ 上的逐点不等式。于是可定义正则化项 $R_{\mathrm{det}}:C_{\mathcal M}(\mathbb T)\to\mathbb R$ 为

$$
R_{\mathrm{det}}(\mu)=\min_{\mathbf m\in\mathcal M_+(\mathbb T\times\Omega_G)}\ \langle\mathbf m,c\rangle+\eta\|\mathbf m\|_{\infty,1}\qquad\text{s.t.}\quad \mathrm P_1(\mathbf m)\ge|\mu|.\tag{25}
$$

可以验证 $R_{\mathrm{det}}$ 是 $C_{\mathcal M}(\mathbb T)$ 上的凸函数；注意若把约束中的不等式换成等式，则失去凸性。据此可把确定性模型的多基频估计器表述为如下问题的解：

$$
\min_{\mu\in C_{\mathcal M}(\mathbb T)}\ \frac{1}{2}\left\|\mathbf y-\mathcal A(\mu)\right\|_2^2+\zeta R_{\mathrm{det}}(\mu).\tag{26}
$$

与随机情形一样，这是凸优化问题。此外可通过检查受限测度 $\mathrm P^{(g)}(\mathbf m)$ 恢复各分量音高的频率内容。但应注意，一般只能期望恢复 $|\mu^{(k)}|$ 而非 $\mu^{(k)}$，因为在（24）中不等式严格成立的点上我们损失了相位信息，相位也可恢复。

## VI. 离散化与熵正则化

在（22）与（26）中问题的基础上，本节对二者离散化以允许高效实现。为此引入由 $F$ 个频率构成的网格 $\boldsymbol\omega=\{\omega_1,\ldots,\omega_F\}\subset[0,\pi)$，对应频率空间 $\mathbb T$ 的离散化。于是（22）中的问题可用向量形式写为

$$
\min_{\boldsymbol\nu\in\mathbb R_+^F}\ \frac{1}{T}\|\hat{\mathbf r}-\mathbf A\boldsymbol\nu\|_2^2+\beta\left(\boldsymbol\nu^T\mathbf 1_F\right)+\zeta S_c(\boldsymbol\nu),\tag{27}
$$

其中 $\mathbf A=[\mathbf a(\omega_1)\ \ldots\ \mathbf a(\omega_F)]$ 为字典矩阵，其列 $\mathbf a(\omega_f)\in\mathbb C^N$ 由对应频率 $\omega_f$（$f\in[\![F]\!]$）在采样时间上的傅里叶向量构成。此处矩阵乘法 $\mathbf A\boldsymbol\nu$ 对应（22）中的运算 $\mathcal A(\nu)$，其中 $\boldsymbol\nu\in\mathbb R_+^F$ 为 $\nu$ 的向量化版本。此外，$\hat{\mathbf r}\in\mathbb C^T$ 为基于含噪测量构造的（部分）样本自协方差向量（脚注 3）。为对抗噪声，我们提出对 $\boldsymbol\nu$ 施加 $\ell_1$ 范数正则化：$\ell_1$ 项促进频率估计的稀疏性，把仅由噪声驱动的分量压到 0。由于 $\boldsymbol\nu$ 只含非负元素，所得 $\ell_1$ 范数项变为 $\beta(\boldsymbol\nu^T\mathbf 1_F)$。我们还为第一项引入 $2/T$ 的归一化因子。最后，正则化项定义为

$$
S_c(\boldsymbol\nu)=\min_{\mathbf M\in\mathbb R_+^{F\times G}}\ \langle\mathbf C,\mathbf M\rangle+\epsilon D(\mathbf M)+\eta\|\mathbf M\|_{\infty,1},\qquad\text{s.t.}\quad\mathbf M\mathbf 1_G=\boldsymbol\nu,
$$

对应于 $R_{\mathrm{stoch}}(\nu)$ 的离散化，其中 $\mathbf M$ 为离散传输计划，$\mathbf C\in\mathbb R_+^{F\times G}$ 为代价矩阵（$C_{f,g}=c(\omega_f,\omega_0^{(g)})$），$\|\cdot\|_{\infty,1}$ 现表示常规混合范数，即 $\|\mathbf M\|_{\infty,1}=\sum_{g=1}^{G}\max_{f\in[\![F]\!]}|[\mathbf M]_{f,g}|$。此外 $D(\mathbf M)=\sum_{f,g}\left([\mathbf M]_{f,g}\log[\mathbf M]_{f,g}-[\mathbf M]_{f,g}+1\right)$（$\epsilon>0$）为熵正则化项 [44]，使我们能导出高效数值求解器；注意加入 $\epsilon D(\mathbf M)$ 使（27）严格凸。

类似地，对（26）中的问题离散化得

$$
\min_{\boldsymbol\mu\in\mathbb C^F}\ \frac{1}{N}\|\mathbf y-\mathbf A\boldsymbol\mu\|_2^2+\beta\|\boldsymbol\mu\|_1+\zeta S(\boldsymbol\mu),\tag{28}
$$

其中

$$
S(\boldsymbol\mu)\triangleq\min_{\mathbf M\in\mathbb R_+^{F\times G}}\ \langle\mathbf C,\mathbf M\rangle+\epsilon D(\mathbf M)+\eta\|\mathbf M\|_{\infty,1},\qquad\text{s.t.}\quad\mathbf M\mathbf 1_G\ge|\boldsymbol\mu|.\tag{29}
$$

> **脚注 3**：实践中求解（27）时，我们考虑等价的纯实问题，即按 $\hat{\mathbf r}_{\mathbb R}=[\operatorname{Real}(\hat{\mathbf r})\ \operatorname{Imag}(\hat{\mathbf r})]^T$ 堆叠实部与虚部，$\mathbf A$ 相应处理。

此处矩阵乘法 $\mathbf A\boldsymbol\mu$ 对应（26）中的运算 $\mathcal A(\mu)$，其中 $\boldsymbol\mu\in\mathbb R_+^F$ 为 $\mu$ 的向量化版本。由于同样处理含噪测量，这里也使用 $\ell_1$ 范数项；但由于 $\boldsymbol\mu$ 的元素为复值，$\ell_1$ 范数项不像随机问题那样简化。下一节介绍本节所述估计器的高效求解器。

## VII. 数值算法

为计算（27）与（28）的解，我们使用迭代算法，具体提出使用近端梯度类方法。作为简要的一般性概述，考虑最小化问题 $\min_{\mathbf x\in\mathbb C^F}E(\mathbf x)=e(\mathbf x)+d(\mathbf x)$，其中 $e$ 为光滑凸函数、$d$ 为（可能不可微的）凸函数。在 $e$ 的梯度 Lipschitz 连续（常数 $L$）的假设下，问题可通过交替执行关于 $e$ 的梯度步与计算正则化项 $d$ 的近端映射求解：

$$
\mathbf x^{(j+1)}=\operatorname{prox}_{\gamma d}\left(\mathbf x^{(j)}-\gamma\nabla e(\mathbf x^{(j)})\right)\triangleq\arg\min_{\mathbf x}\ \frac{1}{2}\|\mathbf x-\mathbf u\|_2^2+\gamma d(\mathbf x),\tag{30}
$$

其中 $1/\gamma\ge L$ 为步长，$\mathbf u=\mathbf x^{(j)}-\gamma\nabla e(\mathbf x^{(j)})$，$\operatorname{prox}_d$ 为 $d$ 的近端算子。近端梯度下降的推广已有提出（见例如 [45]–[47]）：$e$ 的近似依赖与函数 $\phi$ 相关联的 Bregman 距离，其迭代为

$$
\mathbf x^{(j+1)}=\arg\min_{\mathbf x\in\mathbb C^F}\left\{\gamma\left\langle\nabla e(\mathbf x^{(j)}),\mathbf x\right\rangle+\gamma d(\mathbf x)+D_\phi(\mathbf x,\mathbf x^{(j)})\right\},\tag{31}
$$

其中

$$
D_\phi(\mathbf x,\mathbf x^{(j)})=\phi(\mathbf x)-\phi(\mathbf x^{(j)})-\nabla\phi(\mathbf x^{(j)})(\mathbf x-\mathbf x^{(j)}).
$$

注意当 $\phi(\mathbf x)=\|\mathbf x\|_2^2$ 时即得常规近端梯度方案；此外两种下降方法都有所谓加速版本以加快收敛，详见 [47],[48]。下面先给出基于本节 Bregman 近端梯度方案的随机模型求解器。

### A. 随机模型

这里提出用（31）中的 Bregman 近端梯度方案求解（27），取 $e(\boldsymbol\nu)=\frac{1}{T}\|\hat{\mathbf r}-\mathbf A\boldsymbol\nu\|_2^2+\beta(\boldsymbol\nu^T\mathbf 1_F)$、$d(\boldsymbol\nu)=\zeta S_c(\boldsymbol\nu)$。所用 Bregman 散度对应的函数为 $\phi(\boldsymbol\nu)=\sum_{f=1}^{F}\nu_f\log\nu_f$，由此得到 Kullback–Leibler 相对熵

$$
D_{\mathrm{KL}}\left(\boldsymbol\nu,\boldsymbol\nu^{(j)}\right)=\sum_{f=1}^{F}\left([\boldsymbol\nu]_f\log\left([\boldsymbol\nu]_f/[\boldsymbol\nu^{(j)}]_f\right)+[\boldsymbol\nu^{(j)}]_f-[\boldsymbol\nu]_f\right).
$$

此处取步长 $\gamma=1/L$，其中 $L=2\|\mathbf A\|^2/T$、$\|\cdot\|$ 为算子范数（后文另一方法亦然）。对该方法而言这并不保证收敛，但经验测试表明该步长足够小。受 [49] 工作的启发，解的迭代 nonetheless 为

$$
\boldsymbol\nu^{(j+1)}=\arg\min_{\boldsymbol\nu\in\mathbb R_+}\ \gamma\langle\mathbf u,\boldsymbol\nu\rangle+D_{\mathrm{KL}}\left(\boldsymbol\nu,\boldsymbol\nu^{(j)}\right)+\gamma\zeta S_c(\boldsymbol\nu),\tag{32}
$$

其中 $\mathbf u=\nabla\left(\frac{1}{T}\|\hat{\mathbf r}-\mathbf A\boldsymbol\nu^{(j)}\|_2^2+\gamma\beta\left((\boldsymbol\nu^{(j)})^T\mathbf 1_F\right)\right)$。对该最小化问题有如下命题。

**命题 1**：设 $\odot$ 表示逐元素乘，则（32）中的更新 $\boldsymbol\nu^{(j+1)}$ 与相应传输计划 $\mathbf M$ 为

$$
\boldsymbol\nu=\boldsymbol\nu^{(j)}\odot\exp\left(-\gamma\mathbf u-\gamma\zeta\boldsymbol\lambda\right),\tag{33}
$$

$$
\mathbf M=\operatorname{diag}(\mathbf v)(\mathbf K\odot\mathbf W),\tag{34}
$$

其中 $\mathbf v=\exp\left(\frac{1}{\epsilon}\boldsymbol\lambda\right)$、$\mathbf K=\exp\left(-\frac{1}{\epsilon}\mathbf C\right)$、$\mathbf W=\exp\left(\frac{1}{\epsilon}\boldsymbol\Psi\right)$，且 $\boldsymbol\lambda\in\mathbb R_+^F$ 与 $\boldsymbol\Psi\in\mathbb R^{F\times G}$ 求解

$$
\min_{\boldsymbol\lambda,\boldsymbol\Psi:\ \|\boldsymbol\Psi\|_{1,\infty}\le\eta}\ \gamma\zeta\epsilon\left\langle\mathbf K\odot\mathbf W,\mathbf v\mathbf 1_G^T\right\rangle+\left\langle\boldsymbol\nu^{(j)},\exp\left(-\gamma\mathbf u-\gamma\zeta\boldsymbol\lambda\right)\right\rangle.\tag{35}
$$

这里 $\|\boldsymbol\Psi\|_{1,\infty}=\max_g\sum_f|\Psi_{f,g}|$ 为 $\|\cdot\|_{\infty,1}$ 的对偶范数，所有指数运算与幂均逐元素进行。

**证明**：见附录。

为求解（35）中的问题，我们采用块坐标下降方案（见 [25],[49]），有如下命题。

**命题 2**：考虑迭代方案，其第 $k+1$ 步更新为

$$
\boldsymbol\lambda^{k+1}=\frac{\epsilon}{1+\gamma\zeta\epsilon}\left(\log(\boldsymbol\nu^0)-\log(\boldsymbol\xi^k)\right),
$$

$$
\boldsymbol\Psi^{k+1}=\arg\min_{\boldsymbol\Psi:\ \|\boldsymbol\Psi\|_{1,\infty}\le\eta}\left\langle\left(\mathbf v^{k+1}\mathbf 1_G^T\right)\odot\mathbf K,\exp\left(\frac{1}{\epsilon}\boldsymbol\Psi\right)\right\rangle,
$$

其中 $\boldsymbol\nu^0=\boldsymbol\nu^{(j)}\odot\exp(-\gamma\mathbf u)$、$\boldsymbol\xi^k=\exp\left(-\frac{1}{\epsilon}\mathbf C+\frac{1}{\epsilon}\boldsymbol\Psi^k\right)\mathbf 1_G$、$\mathbf v^{k+1}=\exp\left(\frac{1}{\epsilon}\boldsymbol\lambda^{k+1}\right)$。则迭代线性收敛到（35）的解。

**证明**：（35）的目标函数关于对偶变量 $\boldsymbol\lambda$ 可微；对固定 $\boldsymbol\Psi$，所述 $\boldsymbol\lambda$ 更新满足零梯度方程因而最优。然后对固定 $\boldsymbol\lambda$，可用 [26, Thm. 2] 关于 $\boldsymbol\Psi$ 最小化目标，该定理只需排序操作。由于问题满足 [50, Thm. 2.1] 的假设，线性收敛直接可得。

值得指出，可恢复 $\Omega$（即候选基频集合）上的分布：$\mathbf M^T\mathbf 1_F=(\mathbf K^T\odot\mathbf W^T)\mathbf v$。检查该向量的支撑即可识别信号中存在哪些音高。此外还可刻画熵正则化参数 $\epsilon\to0$ 时的解。

**命题 3**：设 $\{\epsilon_p\}_p$ 为满足 $\lim_{p\to\infty}\epsilon_p\to0$ 的序列，则（27）相应解序列 $\{\boldsymbol\nu_p\}_p$ 有极限点 $\boldsymbol\nu^\star$ 满足 $\boldsymbol\nu^\star=\mathbf M^\star\mathbf 1_G$，其中 $\mathbf M^\star$ 是在所有求解（27）（不含熵正则化）的传输计划中**唯一的最大熵**元素。

**证明**：见附录。

该结果是关于边缘可观测的传输计划情形的经典事实的直接类比。此外，若令 $\eta=0$（即不施加音高间的组稀疏），则直接可知 $\mathbf M^\star$ 的每一行只含零与等幅元素：具体地，$[\mathbf M^\star]_{k,\ell}$ 非零仅当 $[\mathbf C]_{k,\ell}=\min_j[\mathbf C]_{k,j}$；对 $[\boldsymbol\nu^\star]_k>0$ 的 $k$，质量在满足条件 $\{\ell\mid[\mathbf C]_{k,\ell}=\min_j[\mathbf C]_{k,j}\}$ 的元素 $[\mathbf M]_{k,\ell}$ 之间均分。因此当 $\eta=0$ 时，某频率对应的功率在其最一致的音高集合上均匀分布。下面给出确定性模型的估计器，此时改用常规近端梯度方案。

### B. 确定性模型

我们提出通过近端梯度方案求解（28），即在数据拟合项的梯度步与其余项近端算子的求解之间交替。为保证收敛，步长取 $\gamma=1/L$，其中 $L=2\|\mathbf A\|^2/N$。于是迭代为

$$
\boldsymbol\mu^{(j+1)}=\operatorname{prox}_{\gamma\beta\|\cdot\|_1+\gamma\zeta S(\cdot)}\left(\boldsymbol\mu^{(j)}-\gamma\nabla_{\boldsymbol\mu^\ast}\frac{1}{N}\left\|\mathbf y-\mathbf A\boldsymbol\mu^{(j)}\right\|_2^2\right),
$$

其中 $\nabla_{\boldsymbol\mu^\ast}(\cdot)$ 表示关于复共轭 $\boldsymbol\mu^\ast$ 的（Wirtinger）梯度。关于近端算子有如下命题。

**命题 4**：$\gamma\beta\|\cdot\|_1+\gamma\zeta S(\cdot)$ 的近端算子唯一，且由

$$
\operatorname{prox}_{\gamma\beta\|\cdot\|_1+\gamma\zeta S(\cdot)}(\mathbf u)=e^{i\angle\mathbf u}\odot\left(\left(|\mathbf u|-\gamma\beta\mathbf 1_F-\boldsymbol\lambda\right)_+\right)
$$

给出，其中 $\odot$ 表示逐元素乘，$\angle\mathbf u$ 表示 $\mathbf u$ 的相位角，$(\cdot)_+=\max(\cdot,0)$，$\boldsymbol\lambda\in\mathbb R_+^F$ 求解

$$
\min_{\boldsymbol\lambda\in\mathbb R_+^F,\ \boldsymbol\Psi\in\mathbb R^{F\times G}:\ \|\boldsymbol\Psi\|_{1,\infty}\le\eta}\ \gamma\zeta\epsilon\left\langle\mathbf K\odot\mathbf W,\mathbf v\mathbf 1_G^T\right\rangle+\frac{1}{2}\left(\left(|\mathbf u|-\gamma\beta\mathbf 1_F-\boldsymbol\lambda\right)_+\right)^2\tag{36}
$$

其中 $\mathbf v$、$\mathbf K$、$\mathbf W$ 与命题 1 相同。

该结果可按与命题 1 相同的方式证明。此外（36）可用块坐标下降方案求解，由 [50, Thm. 2.1] 具有线性收敛。显式迭代更新总结于如下命题。

**命题 5**：考虑迭代

$$
\boldsymbol\lambda^{(k+1)}=\frac{1}{\gamma\zeta}\left(|\mathbf u|-\frac{\beta}{\zeta}\mathbf 1_F-\epsilon W\left(\boldsymbol\xi^{(k)}\right)\right),
$$

$$
\boldsymbol\Psi^{k+1}=\arg\min_{\boldsymbol\Psi:\ \|\boldsymbol\Psi\|_{1,\infty}\le\eta}\left\langle\left(\mathbf v^{k+1}\mathbf 1_G^T\right)\odot\mathbf K,\exp\left(\frac{1}{\epsilon}\boldsymbol\Psi\right)\right\rangle,
$$

其中

$$
\boldsymbol\xi^{(k)}=\log\left(\left(\mathbf K\odot\mathbf W^{(k)}\right)\mathbf 1_G\right)+\frac{|\mathbf u|-\gamma\beta\mathbf 1_F}{\gamma\zeta\epsilon}-\log\left(\gamma\zeta\epsilon\mathbf 1_F\right),
$$

$W(\cdot)$ 表示（逐元素的）Wright omega 函数 [51]。则迭代线性收敛到（36）的解。

这些表达式由对（36）一阶最优性条件的直接代数运算得到（关于近端算子中 Wright omega 函数的处理见 [49]）。

**注 1**：确定性模型也有与命题 3 类似的结果，即当 $\epsilon\to0$ 时收敛到无正则化问题的最大熵解，证明只需稍作修改。

### C. $\boldsymbol\nu$ 与 $\boldsymbol\mu$ 的去偏

一旦求解完（22）或（26），可通过检查 $(\mathbf M^\star)^T\mathbf 1_F$ 的支撑识别音高分量，其中 $\mathbf M^\star$ 为最优传输计划。但应注意，相应 $\nu$ 与 $\mu$ 会因促进稀疏的混合范数项而偏向零。为缓解部分偏差，可把网格 $\Omega_G$ 限制为只含已识别的音高，然后取 $\eta=0$ 重新求解（22）与（26）。事实上容易验证命题 2 中的表达式对该情形也成立，且迭代一步收敛（因为 $\boldsymbol\Psi\equiv\mathbf 0$）。再令 $\epsilon\to0$，由命题 3 直接可知（27）的解收敛到

$$
\min_{\boldsymbol\nu\in\mathbb R_+^F}\ \frac{1}{T}\|\hat{\mathbf r}-\mathbf A\boldsymbol\nu\|_2^2+\beta\boldsymbol\nu^T\mathbf 1_F+\zeta\mathbf c_{\min}^T\boldsymbol\nu\tag{37}
$$

的最大熵解，其中 $\mathbf c_{\min}\in\mathbb R^F$ 由 $[\mathbf c_{\min}]_k=\min_\ell[\mathbf C]_{k,\ell}$ 构造。这是一个带非负约束的二次规划，可用命题 1 或现成求解器求解。此外注意（37）是（20）（$\omega_0$ 固定）的离散版本，并增加了用于抑制噪声的 $\beta$ 项。类似地，对（28）中的确定性模型，可在 $\epsilon\to0$ 时使用命题 4，或考虑极限问题

$$
\min_{\boldsymbol\mu\in\mathbb C^F}\ \frac{1}{N}\|\mathbf y-\mathbf A\boldsymbol\mu\|_2^2+\beta\|\boldsymbol\mu\|_1+\zeta\mathbf c_{\min}^T|\boldsymbol\mu|.\tag{38}
$$

注意最后一项意味着任何重叠点质量被相位对齐。此外可将其理解为带非均匀加权 $\ell_1$ 范数的 LASSO 问题。两个估计器至此均已得到，下一节在仿真与真实数据上开展实验。

## VIII. 数值结果

我们先在仿真数据上评估所提方法，然后是真实数据：下一小节给出仿真数据结果，随后一小节覆盖真实数据。

### A. 仿真数据

我们首先开展蒙特卡洛仿真研究，其中每个信号由 4 个音高构成，采样率 8000 Hz，观测 250 个样本。每个音高的谐波数在 3 到 10 之间随机取整数，幅度设为 1，初相位均匀随机抽取——与 [11],[12] 中的做法类似。标称基频分别为 176、197、240 与 272 Hz，并在每次仿真中施加扰动以避免网格效应带来的偏差。除非另有说明，信噪比（SNR）设为 5 dB，其中 SNR 定义为 $\mathrm{SNR}=10\log_{10}\left(\left(\sum_{k=1}^{K}\sum_{l=1}^{L^{(k)}}|\alpha_l^{(k)}|^2\right)/\sigma^2\right)$，且直到最大谐波阶数的全部谐波均非零。为评估音高估计在非谐性方面的表现，我们令非谐性参数 $\kappa$ 决定标称基频的各谐波允许偏离谐波模型的程度：谐波 $\omega$ 在区间 $\omega\pm\kappa\omega$ 中均匀随机抽取，$\kappa\in[0,1]$。同样除非另有说明，非谐性设为 0。性能以**总错误率（gross error rate，GER）**评估，定义为偏离参考音高超过 50 音分（脚注 4）的音高估计所占百分比，即

$$
\mathrm{GER}=\frac{1}{K}\sum_{k=1}^{K}\left[\left|1200\cdot\log_2\left(\frac{\hat\omega_0^{(k)}}{\omega_0^{(k)}}\right)\right|>50\right],
$$

其中 $\hat\omega_k$ 为音高估计 [5],[12]。

> **脚注 4**：这对应于大于四分之一音符的误差。

我们把前期工作 [31] 中的模型记为 PESCOT-2，其中"2"来自它与（29）中问题的相似性——区别在于其约束为平方形式。对 PE-BSBL-C [12] 与 PEBS2TV [10]，信号假定的最大谐波数设为 10；而所提方法与 PESCOT-2 的阶数不受限制。所提方法记为 **Proposed 1**（对应确定性模型的估计器）与 **Proposed c**（对应随机模型的估计器）。对所有方法，信号归一化为单位方差。

图 4 给出完全谐波情形下不同噪声水平的结果：除 PEBS2TV 外，各方法在高 SNR 区间表现相似。图 5 给出非谐性的影响（固定 SNR=5 dB）：虽然结果似乎表明各方法对非谐性的鲁棒性相似，但若进一步研究谱估计本身（即 $\nu$ 与 $|\mu|$）的结构、而不只看识别出的基频，就会得到更细致的图景。为量化这一点，我们使用估计谱与真实谱之间的 Wasserstein-2 距离 [22]，即（15）的最小目标值的平方根（取 $c(\omega_1,\omega_2)=(\omega_1-\omega_2)^2$）。使用该距离替代 $\ell_2$ 范数等度量，是因为它对峰值偏移或分裂等扰动是光滑的 [23]。应强调该距离与用于定义所提估计器的传输问题无关。图 6 上子图给出在非谐性 2%、SNR 5 dB 下对 150 个仿真信号计算的 Wasserstein-2 距离累积分布函数（CDF），下子图给出这些距离的均值随非谐性的变化：可以看到，相比参考方法，基于 OT 的方法给出的谱估计更集中于真值附近。为评估频率网格分辨率的影响，图 7 对所提方法与 PESCOT-2 改变均匀分布网格点总数（其它实验中该数设为与参考方法网格数一致，即 2260 个网格点）。参考方法的频率网格基于音高网格的整数倍（最高到允许的最大谐波数），而所提方法与 PESCOT-2 可灵活选择任意频率作为网格，从而降低每次迭代的复杂度。结果表明，约 1000—1500 个均匀网格点对该实验似乎足够，其中最突出的是 Proposed 1 在约 400 个网格点时即可达到与完整 2260 个网格点相近的性能，大大降低了仿真设置中迭代的复杂度。至此完成全部仿真数据实验，下一小节转向在真实数据上评估估计器。

**图 4**：仿真数据（4 个音高）的 GER 随 SNR 变化（Proposed 1、Proposed c、PESCOT-2、PE-BSBL-C、PEBS2TV）。
**图 5**：仿真数据（4 个音高）的 GER 随非谐性变化；SNR 设为 5 dB。
**图 6**：上子图为估计幅度谱与真实幅度谱之间 OT 距离的经验 CDF（非谐性 2%）；下子图为中位 OT 距离随非谐性的变化。两图 SNR 均为 5，信号为 4 个音高的仿真信号。
**图 7**：所提方法与 PESCOT-2 使用 50—500 Hz 不同数量均匀网格点时的 GER（仿真数据，4 个音高）；SNR 为 5，非谐性为 0%。

### B. 真实数据

下一实验基于 [52] 使用的 Bach10 数据集，其中评估 10 段音乐作品的音高。每段作品的采样率为 44100 Hz。真实基频由单基频 YIN 估计器获得：对录音中对应不同乐器的各声道分别使用 YIN，并在明显错误处人工修正。PE-BSBL-C 的信号最大假定谐波数设为 10；对基于网络的方法 DeepSalience [20] 与 PolyVocals [21]，二者均在最大谐波阶数 5 上训练。PolyVocals 有多个可用模型，此处使用其推荐模型（论文中记为 Deep/Late）。对所提方法与 PESCOT-2，最大阶数不受限制。

如图 8 所示，除 PolyVocals 外，所提方法均优于参考方法。对非网络方法，信号被划分为 30 ms 长的音乐帧（1323 个样本），每帧独立于其他帧评估。虽然这种逐帧设置也可用于基于网络的方法，但它们在如此短的输入信号下无法给出有意义的估计，故未加入图中。不过对 PolyVocals，我们还评估了把整个输入信号划分为三个连续帧的非重叠序列（即 90 ms 长、3969 个样本）时的性能，结果见灰色箱；白色箱则使用整个信号。由此注意到 PolyVocals 确实优于所有所提方法，但这是通过使用比所提方法多三倍的信息实现的。

**图 8**：Bach10 数据 GER 箱线图。所提方法以及 PESCOT-2、PE-BSBL-C 每次估计使用一帧，紫色与白色估计使用整个信号，灰色估计每次使用 3 帧。

参考方法的超参数按其各自论文的建议设置；所提方法与 PESCOT-2 的超参数经经验调优，分别见表 I 与表 II（仿真与真实数据）。自协方差所用时滞数对所有数据设为 $T=\frac{2}{3}N$。

**表 I　所有所提方法在全部仿真数据上的参数值**（按原表逐格转录）

| 参数 | Proposed 1 | PESCOT-2 | Proposed c |
| --- | --- | --- | --- |
| $\eta$ | $3\cdot10^{-2}$ | $1\cdot10^{0}$ | $1\cdot10^{-1}$ |
| $\zeta$ | $6\cdot10^{0}$ | $8\cdot10^{3}$ | $1\cdot10^{1}$ |
| $\epsilon$ | $1\cdot10^{-5}$ | $1\cdot10^{-7}$ | $1\cdot10^{-6}$ |
| $\beta$ | $8\cdot10^{-2}$ | $8\cdot10^{-2}$ | $1.5\cdot10^{-2}$ |
| **去偏估计** | | | |
| $\zeta$ | $6\cdot10^{0}$ | $8\cdot10^{3}$ | $1\cdot10^{0}$ |
| $\beta$ | $4\cdot10^{1}$ | $4.8\cdot10^{1}$ | $4.5\cdot10^{-2}$ |

**表 II　所有所提方法在真实数据上的参数值**（按原表逐格转录）

| 参数 | Proposed 1 | PESCOT-2 | Proposed c |
| --- | --- | --- | --- |
| $\eta$ | $5\cdot10^{-3}$ | $4\cdot10^{-2}$ | $1\cdot10^{-2}$ |
| $\zeta$ | $1\cdot10^{-1}$ | $8\cdot10^{0}$ | $1\cdot10^{-1}$ |
| $\epsilon$ | $1\cdot10^{-5}$ | $1\cdot10^{-7}$ | $1\cdot10^{-5}$ |
| $\beta$ | $2.8\cdot10^{-2}$ | $3.6\cdot10^{-2}$ | $3.4\cdot10^{-2}$ |

## IX. 结论

本文研究多基频信号中的音高估计问题。我们表明所提方法在基于帧的设置下，在仿真与真实数据上都达到最先进性能，且与现有非网络方法不同，它不需要信号谐波阶数的先验知识；其性能仅被基于网络的估计器超越。但应注意，那些估计器依赖对信号更大部分的可访问性，而我们的方法在只测量信号短片段、不利用信号任何先验信息的设置下工作，更适合视为一个递归估计器的构建模块——该估计器可利用全部或部分可用的先前测量。

## X. 附录

**命题 1 的证明**：引入辅助变量 $\mathbf Q=\mathbb R^{F\times G}$，最小化问题可等价表述为

$$
\min_{\boldsymbol\nu,\mathbf M,\mathbf Q}\ \gamma\langle\mathbf u,\boldsymbol\nu\rangle+\gamma\zeta\langle\mathbf C,\mathbf M\rangle+\gamma\zeta\epsilon D(\mathbf M)+\gamma\zeta\eta\|\mathbf Q\|_{\infty,1}+D_{\mathrm{KL}}\left(\boldsymbol\nu,\boldsymbol\nu^{(j)}\right)\quad\text{s.t.}\ \boldsymbol\nu=\mathbf M\mathbf 1_F,\ \mathbf Q=\mathbf M.
$$

相应的（按 $1/\gamma\zeta$ 缩放的）Lagrangian 为

$$
\mathcal L(\boldsymbol\nu,\mathbf M,\mathbf Q,\boldsymbol\lambda,\boldsymbol\Psi)=\frac{1}{\zeta}\langle\mathbf u,\boldsymbol\nu\rangle+\langle\mathbf C,\mathbf M\rangle+\epsilon D(\mathbf M)+\eta\|\mathbf Q\|_{\infty,1}+\frac{1}{\gamma\zeta}D_{\mathrm{KL}}\left(\boldsymbol\nu,\boldsymbol\nu^{(j)}\right)+\langle\boldsymbol\lambda,\boldsymbol\nu-\mathbf M\mathbf 1_F\rangle+\langle\boldsymbol\Psi,\mathbf Q-\mathbf M\rangle,
$$

其中 $\boldsymbol\lambda$ 与 $\boldsymbol\Psi$ 为（缩放）对偶变量。容易验证（见 [26, Thm. 1]）：$\mathcal L$ 关于 $\mathbf Q$ 的下确界有限，当且仅当 $\|\boldsymbol\Psi\|_{1,\infty}\le\eta$，此时与 $\mathbf Q$ 相关的项消失。此外注意 $\mathcal L$ 关于 $\mathbf M$ 与 $\boldsymbol\nu$ 严格凸；表达式（33）与（34）通过对 $\boldsymbol\nu$、$\mathbf M$ 求导并求解相应零梯度方程得到，而对偶问题（35）由把这些表达式代入 $\mathcal L$ 得到。$\square$

**命题 3 的证明**：定义集合

$$
\mathcal U_\rho=\left\{\mathbf M\in\mathbb R_+^{F\times G}\ \middle|\ \|\hat{\mathbf r}-\mathbf A(\mathbf M\mathbf 1_G)\|_2^2\le\rho\right\},
$$

由 $\rho>0$ 参数化。由于 $\mathbf M$ 被约束在正象限内、且 $\mathbf A$ 的第一行全为 1（对应 $\tau=0$），集合 $\mathcal U_\rho$ 有界；由 $\mathbf A$ 与范数 $\|\cdot\|$ 的连续性，$\mathcal U_\rho$ 为闭集，故 $\mathcal U_\rho$ 紧。考虑问题

$$
\min_{\mathbf M\in\mathcal U_\rho}\ f(\mathbf M)+\epsilon D(\mathbf M)\tag{39}
$$

其中

$$
f(\mathbf M)=\langle\mathbf C,\mathbf M\rangle+\beta\mathbf 1_F^T\mathbf M\mathbf 1_G+\eta\|\mathbf M\|_{\infty,1}.
$$

设 $\{\epsilon_p\}_p$ 为趋于零的序列，$\{\mathbf M_p\}_p$ 为（39）相应解序列。由于 $\mathcal U_\rho$ 紧，存在收敛子列 $\{\mathbf M_q\}_q$ 收敛到某 $\mathbf M^\star\in\mathcal U_\rho$。设 $\mathbf M_o$ 为（39）在 $\epsilon=0$ 时的解，则对任意 $\epsilon_q$ 有 $f(\mathbf M_q)+\epsilon_qD(\mathbf M_q)\le f(\mathbf M_o)+\epsilon_qD(\mathbf M_o)$；此外 $f(\mathbf M_o)\le f(\mathbf M_q)$。合起来得 $0\le f(\mathbf M_q)-f(\mathbf M_o)\le\epsilon_q(D(\mathbf M_o)-D(\mathbf M_q))$。由于 $f$ 与 $D$ 连续，令 $q\to\infty$ 可知右端趋于零，且 $\lim_{q\to\infty}f(\mathbf M_q)=f(\lim_{q\to\infty}\mathbf M_q)=f(\mathbf M^\star)=f(\mathbf M_o)$。因此 $\mathbf M^\star$ 求解 $\epsilon=0$ 时的（39）。此外直接可知对任意非正则化解 $\mathbf M_o$ 有 $D(\mathbf M^\star)\ge D(\mathbf M_o)$；由 $D$ 的严格凸性可得该最大熵解的唯一性。最后，对任意 $\zeta>0$ 都存在相应的 $\rho>0$ 定义 $\mathcal U_\rho$，证毕。$\square$

## 图注与表注

**图 1**：频率网格点密度示例（蓝色：均匀网格；红色：谐波字典所用频率网格；两者总网格点数相同）。
**图 2**：基础代价函数示例（下图为式（17）的 $\hat c$，上图为所提式（18）的 $c$）。
**图 3**：谐波谱与音高谱之间传输计划的示例（上图为音高谱，右侧旋转图为被评估信号的谱）。
**图 4**：仿真数据（4 个音高）的 GER 随 SNR 变化。
**图 5**：仿真数据（4 个音高）的 GER 随非谐性变化（SNR 5 dB）。
**图 6**：上子图为估计幅度谱与真实幅度谱之间 OT 距离的经验 CDF（非谐性 2%）；下子图为中位 OT 距离随非谐性的变化（SNR 5，4 个音高的仿真信号）。
**图 7**：所提方法与 PESCOT-2 在不同数量均匀网格点（50—500 Hz）下的 GER（仿真数据，4 个音高；SNR 5，非谐性 0%）。
**图 8**：Bach10 数据的 GER 箱线图。

**表注**：表 I 与表 II 分别为所有所提方法在全部仿真数据与真实数据上的参数值（含去偏估计参数），已在本页第 VIII-B 节按原表逐格转录。

## 参考文献

> 以下按原文编号 [1]—[52] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “¨”“´” 等变音伪影已按常规写法整理，书目内容未改动。

[1] S. M. Nørholm, J. R. Jensen, and M. G. Christensen, “Instantaneous Fundamental Frequency Estimation With Optimal Segmentation for Nonstationary Voiced Speech,” IEEE/ACM Transactions on Audio, Speech, and Language Processing, vol. 24, no. 12, pp. 2354–2367, 2016.

[2] M. Muller, D. P. W. Ellis, A. Klapuri, and G. Richard, “Signal Processing for Music Analysis,” IEEE Journal of Selected Topics in Signal Processing, vol. 5, no. 6, pp. 1088–1110, 2011.

[3] Z. Duan and B. Pardo, “Soundprism: An Online System for Score-Informed Source Separation of Music Audio,” IEEE Journal of Selected Topics in Signal Processing, vol. 5, no. 6, pp. 1205–1215, 2011.

[4] M. A. Little, P. E. McSharry, E. J. Hunter, J. Spielman, and L. O. Ramig, “Suitability of Dysphonia Measurements for Telemonitoring of Parkinson’s Disease,” IEEE Transactions on Biomedical Engineering, vol. 56, no. 4, pp. 1015–1022, 2009.

[5] A. de Cheveigné and H. Kawahara, “YIN, a fundamental frequency estimator for speech and music,” The Journal of the Acoustical Society of America, vol. 111, no. 4, pp. 1917–1930, 2002.

[6] D. Talkin and W. B. Kleijn, “A Robust Algorithm for Pitch Tracking (RAPT),” Speech coding and synthesis, vol. 495, p. 518, 1995.

[7] A. Camacho and J. G. Harris, “A sawtooth waveform inspired pitch estimator for speech and music,” The Journal of the Acoustical Society of America, vol. 124, no. 3, pp. 1638–1652, 2008.

[8] M. Christensen and A. Jakobsson, Multi-Pitch Estimation. Springer Nature, 2022.

[9] S. I. Adalbjörnsson, A. Jakobsson, and M. G. Christensen, “Estimating multiple pitches using block sparsity,” in 2013 IEEE International Conference on Acoustics, Speech and Signal Processing, 2013, pp. 6220–6224.

[10] ——, “Multi-pitch estimation exploiting block sparsity,” Signal Processing, vol. 109, pp. 236–247, 2015.

[11] F. Elvander, T. Kronvall, S. Adalbjörnsson, and A. Jakobsson, “An adaptive penalty multi-pitch estimator with self-regularization,” Signal Processing, vol. 127, pp. 56–70, 2016.

[12] L. Shi, J. R. Jensen, J. K. Nielsen, and M. G. Christensen, “Multipitch Estimation Using Block Sparse Bayesian Learning and Intra-Block Clustering,” in IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2018, pp. 666–670.

[13] H. Fletcher, “Normal Vibration Frequencies of a Stiff Piano String,” The Journal of the Acoustical Society of America, vol. 36, no. 1, pp. 203–209, 1964.

[14] N. H. Fletcher and T. D. Rossing, The Physics of Musical Instruments. Springer Science & Business Media, 2012.

[15] R. A. Rasch and V. Heetvelt, “String Inharmonicity and Piano Tuning,” Music Perception, vol. 3, no. 2, pp. 171–189, 1985.

[16] J. Fernandes, F. Teixeira, V. Guedes, A. Junior, and J. P. Teixeira, “Harmonic to Noise Ratio Measurement - Selection of Window and Length,” Procedia computer science, vol. 138, pp. 280–285, 2018.

[17] J. W. Kim, J. Salamon, P. Li, and J. P. Bello, “Crepe: A convolutional representation for pitch estimation,” in 2018 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP). IEEE, 2018, pp. 161–165.

[18] W. Wei, P. Li, Y. Yu, and W. Li, “Harmof0: Logarithmic scale dilated convolution for pitch estimation,” in 2022 IEEE International Conference on Multimedia and Expo (ICME). IEEE, 2022, pp. 1–6.

[19] B. Gfeller, C. Frank, D. Roblek, M. Sharifi, M. Tagliasacchi, and M. Velimirović, “SPICE: Self-supervised pitch estimation,” IEEE/ACM Transactions on Audio, Speech, and Language Processing, vol. 28, pp. 1118–1128, 2020.

[20] R. M. Bittner, B. McFee, J. Salamon, P. Li, and J. P. Bello, “Deep Salience Representations for F0 Estimation in Polyphonic Music,” in ISMIR. Suzhou (China), 2017, pp. 63–70.

[21] H. Cuesta, B. McFee, and E. Gómez, “Multiple F0 estimation in vocal ensembles using convolutional neural networks,” arXiv preprint arXiv:2009.04172, 2020.

[22] C. Villani, Optimal Transport: Old and New. Springer, 2009, vol. 338.

[23] T. T. Georgiou, J. Karlsson, and M. S. Takyar, “Metrics for Power Spectra: An Axiomatic Approach,” IEEE Transactions on Signal Processing, vol. 57, no. 3, pp. 859–867, 2008.

[24] F. Elvander, A. Jakobsson, and J. Karlsson, “Interpolation and Extrapolation of Toeplitz Matrices via Optimal Mass Transport,” IEEE Transactions on Signal Processing, vol. 66, no. 20, pp. 5285–5298, 2018.

[25] F. Elvander, I. Haasler, A. Jakobsson, and J. Karlsson, “Multi-marginal optimal transport using partial information with applications in robust localization and sensor fusion,” Signal Processing, vol. 171, p. 107474, 2020.

[26] I. Haasler and F. Elvander, “Multi-Frequency Tracking via Group-Sparse Optimal Transport,” IEEE Control Systems Letters, vol. 8, pp. 1048–1053, 2024.

[27] R. Flamary, C. Févotte, N. Courty, and V. Emiya, “Optimal spectral transportation with application to music transcription,” Advances in Neural Information Processing Systems, vol. 29, 2016.

[28] F. Elvander, S. Adalbjörnsson, J. Karlsson, and A. Jakobsson, “Using optimal transport for estimating inharmonic pitch signals,” in IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2017, pp. 331–335.

[29] F. Elvander, “Estimating Inharmonic Signals with Optimal Transport Priors,” in IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2023, pp. 1–5.

[30] F. Elvander and A. Jakobsson, “Defining Fundamental Frequency for Almost Harmonic Signals,” IEEE Transactions on Signal Processing, vol. 68, pp. 6453–6466, 2020.

[31] A. Björkman and F. Elvander, “Robust Multi-Pitch Estimation via Optimal Transport Clustering,” in ICASSP 2025–2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP). IEEE, 2025, pp. 1–5.

[32] L. Marple, “Computing the discrete-time ‘analytic’ signal via FFT,” IEEE Transactions on signal processing, vol. 47, no. 9, pp. 2600–2603, 1999.

[33] Y. Chi, L. L. Scharf, A. Pezeshki, and A. R. Calderbank, “Sensitivity to Basis Mismatch in Compressed Sensing,” IEEE Trans. Signal Process., vol. 59, no. 5, pp. 2182–2195, May 2011.

[34] V. Chandrasekaran, B. Recht, P. A. Parrilo, and A. S. Willsky, “The Convex Geometry of Linear Inverse Problems,” Foundations of Computational Mathematics, vol. 12, no. 6, pp. 805–849, Dec 2012.

[35] B. N. Bhaskar, G. Tang, and B. Recht, “Atomic norm denoising with applications to line spectral estimation,” IEEE Transactions on Signal Processing, vol. 61, no. 23, pp. 5987–5999, 2013.

[36] T. L. Jensen and L. Vandenberghe, “Multi-pitch Estimation using Semidefinite Programming,” in Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing, New Orleans, LA, USA, March 2017.

[37] J. Swärd, H. Li, and A. Jakobsson, “Off-grid fundamental frequency estimation,” IEEE Trans. on Audio, Speech and Language Processing, vol. 26, no. 2, pp. 296–303, 2018.

[38] U. Grenander and G. Szegö, Toeplitz Forms and Their Applications. Los Angeles: University of California Press, 1958.

[39] R. Schmidt, “Multiple Emitter Location and Signal Parameter Estimation,” IEEE transactions on antennas and propagation, vol. 34, no. 3, pp. 276–280, 1986.

[40] E. J. Candès and C. Fernandez-Granda, “Towards a Mathematical Theory of Super-resolution,” Communications on pure and applied Mathematics, vol. 67, no. 6, pp. 906–956, 2014.

[41] L. Condat, “Atomic norm minimization for decomposition into complex exponentials and optimal transport in Fourier domain,” Journal of Approximation Theory, vol. 258, p. 105456, 2020.

[42] S. Kolouri, S. R. Park, M. Thorpe, D. Slepcev, and G. K. Rohde, “Optimal mass transport: Signal processing and machine-learning applications,” IEEE Signal Processing Magazine, vol. 34, no. 4, pp. 43–59, 2017.

[43] F. Elvander and I. Haasler, “Mixtures of ensembles: System separation and identification via optimal transport,” IEEE Control Systems Letters, vol. 9, pp. 1646–1651, 2025.

[44] M. Cuturi, “Sinkhorn distances: Lightspeed computation of optimal transport,” Advances in neural information processing systems, vol. 26, 2013.

[45] H. Lu, R. M. Freund, and Y. Nesterov, “Relatively smooth convex optimization by first-order methods, and applications,” SIAM Journal on Optimization, vol. 28, no. 1, pp. 333–354, 2018.

[46] H. H. Bauschke, J. Bolte, and M. Teboulle, “A descent Lemma beyond Lipschitz gradient continuity: first-order methods revisited and applications,” Mathematics of Operations Research, vol. 42, no. 2, pp. 330–348, 2017.

[47] F. Hanzely, P. Richtarik, and L. Xiao, “Accelerated bregman proximal gradient methods for relatively smooth convex optimization,” Computational Optimization and Applications, vol. 79, pp. 405–440, 2021.

[48] A. Beck and M. Teboulle, “A fast iterative shrinkage-thresholding algorithm for linear inverse problems,” SIAM journal on imaging sciences, vol. 2, no. 1, pp. 183–202, 2009.

[49] J. Karlsson and A. Ringh, “Generalized Sinkhorn Iterations for Regularizing Inverse Problems Using Optimal Mass Transport,” SIAM Journal on Imaging Sciences, vol. 10, no. 4, pp. 1935–1962, 2017.

[50] Z.-Q. Luo and P. Tseng, “On the convergence of the coordinate descent method for convex differentiable minimization,” Journal of Optimization Theory and Applications, vol. 72, no. 1, pp. 7–35, 1992.

[51] R. Corless and D. Jeffrey, “The Wright ω Function,” in Artificial Intelligence, Automated Reasoning, and Symbolic Computation, Joint International Conferences, Marseille, France, 2002, pp. 76–89.

[52] Z. Duan, B. Pardo, and C. Zhang, “Multiple fundamental frequency estimation by modeling spectral peaks and non-peak regions,” IEEE Transactions on Audio, Speech, and Language Processing, vol. 18, no. 8, pp. 2121–2133, 2010.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含 A 记号）；第 II 节信号模型（式（1）—（14），图 1）；第 III 节最优传输（式（15））；第 IV 节谐波谱的最优传输（式（16）—（18），图 2）；第 V 节谐波聚类（式（19）—（26），图 3）；第 VI 节离散化与熵正则化（式（27）—（29）及脚注 3）；第 VII 节数值算法（近端梯度与 Bregman 方案、命题 1—5、注 1、去偏，式（30）—（38））；第 VIII 节数值结果（仿真与真实数据，图 4—8，表 I—II 逐格）；第 IX 节结论；第 X 节附录（式（39）与命题 1、3 的证明）；图 1—8 图注与表注；参考文献 [1]—[52] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—8 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I—II 已用 PyMuPDF 渲染原 PDF 第 12 页逐格核对；④作者简介与版权声明不在正文范围，未收录；⑤原文式（19）中 "$\frac{1}{2}\|\mathbf r-\mathcal A(\nu))\|_2^2$" 多一个右括号，系原文排版瑕疵，译文保留原式并此加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
