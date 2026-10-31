---
layout: page
title: "大间距非均匀天线阵列的大规模 MIMO 设计｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-07698-non-uniform-antenna-array-design-with-large-inter-element-spacing-for/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/aadfcbdb260a3740/) · [原文 arXiv](https://arxiv.org/abs/2609.07698) · [全部目录](/papers/catalog/)

# 大间距非均匀天线阵列的大规模 MIMO 设计

**原题：** Non-Uniform Antenna Array Design with Large Inter-Element Spacing for Massive MIMO  
**作者：** Lin Chen、Qu Luo（Member, IEEE）、Orestis Christogeorgos、Pei Xiao（Senior Member, IEEE）、Gabriele Gradoni（Senior Member, IEEE）、Mohsen Khalily（Senior Member, IEEE）、Yang Hao（Fellow, IEEE）、Hongbin Li（Fellow, IEEE）  
**单位：** Lin Chen 与 Hongbin Li 为美国史蒂文斯理工学院（Stevens Institute of Technology）电子与计算机工程系；Qu Luo、Pei Xiao、Gabriele Gradoni、Mohsen Khalily 为英国萨里大学通信系统研究所（ICS，5GIC & 6GIC）；Orestis Christogeorgos 与 Yang Hao 为伦敦玛丽女王大学电子工程与计算机科学学院。通讯作者：Hongbin Li。  
**版本：** arXiv:2609.07698v1（eess.SP），2026-09-07，原文 12 页（含图 1—13、算法 1—2；原文无表格）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VII 节、算法 1—2、图 1—13 图注、参考文献 [1]—[36] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2609.07698，2026-09-26"；本地 PDF 为 **arXiv:2609.07698v1 [eess.SP]，2026-09-07**，"2026-09-26" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

在大规模多输入多输出（MIMO）系统中，均匀阵列通常配置为阵元间距不超过半波长，以避免栅瓣与空间混叠。然而许多新兴的第五代与第六代（5G/6G）应用依赖阵元间距远大于半波长的分布式阵列。本文提出一种面向大规模 MIMO 系统的、由**电磁互信息理论（electromagnetic mutual-information-theoretic，EMIT）**引导的大间距非均匀阵列（non-uniform array，NUA）设计，以解决栅瓣与空间混叠伪影问题，同时降低硬件成本与能耗。我们首先为非均匀平面阵列建立多径信道模型，并就用户间干扰、孔径效率、有利传播与信道容量分析所提典型 NUA 图样下的信道特性。该模型进一步扩展到宽带场景，此时 NUA 因其更紧凑的阵元分布而表现出更强的抗波束斜视（beam squint）鲁棒性。此外，我们引入一种用于 NUA 设计的 EMIT 方法，它把天线阵列的空间采样图样与所得 MIMO 信道的容量联系起来。由此产生两种互补的整形策略——**幅度加权（amplitude tapering）**与**几何整形（geometric shaping）**——及其联合优化。数值结果表明，所提 NUA 在孔径效率、信道正交性、波束斜视抑制、容量与误码率性能上均显著优于传统均匀阵列。

**索引词**：非均匀阵列；栅瓣；有利传播；信道容量；波束斜视；大规模 MIMO。

## I. 引言

Nyquist–Shannon 采样定理 [1], [2] 是信号处理与通信的基本原理，为无信息损失地采样与重建信号提供了充分条件。具体地，它要求采样率至少为信号带宽的两倍以避免混叠失真。在空间域中，若空间采样间隔（即均匀分布阵列中的阵元间距）小于信号最高频率成分波长的一半，连续信号即可由其样本完美重建。

空间 Nyquist 采样准则的一个突出应用是大规模多输入多输出（MIMO）系统 [3]。传统 MIMO 部署依赖满足空间 Nyquist 采样率的均匀周期天线阵列，即阵元间距限制在半波长以内，以避免空间混叠与栅瓣。该设计虽能保证可预测的波束图样，却给下一代网络带来三个关键瓶颈。第一，实现有利传播与信道硬化（低复杂度线性检测所必需）需要不断增加天线数量，从而抬高硬件复杂度与部署成本 [4], [5]。第二，大规模 MIMO 系统的能耗随天线数量增长，与无线流量持续指数增长下的可持续性目标相冲突。第三，新兴分布式 MIMO 架构（如无蜂窝网络与无人机集群）本质上具有大阵元间距，均匀阵列不可避免地遭受栅瓣，导致严重的用户间干扰、波束模糊与安全漏洞 [6], [7]。这些局限引出一个根本问题：**能否在打破半波长间距约束的同时减少天线数量、硬件成本与能耗？**

为应对这些瓶颈，一条活跃的研究路线试图打破 Nyquist 空间采样极限。压缩感知 [8]–[10] 提供了这样一条途径：它通过把信号能量集中在变换域的少数基与系数上，从远少于 Nyquist 率的样本中恢复信号；但该方法依赖于目标信号在某一域中稀疏或可压缩这一前提。在波束成形与宽带阵列处理等许多实际场景中，信号可能跨越很宽的空间频率范围，难以在任何特定域中找到稀疏表示。

受 Erwin Schrödinger 在其名著《生命是什么？》[11] 中提出的"非周期晶体"概念启发，我们认识到：周期结构虽有序、却是信息匮乏的——其重复图样无法高效编码复杂信息；相反，非周期（非均匀）排布（如 DNA 的分子结构）利用不规则但有结构的空间分布来最大化信息容量。这一生物学原理提示了一种范式转变：与其把天线布放视为均匀几何约束，不如把空间采样几何视为一种信息论自由度，用于最大化发射符号与接收信号之间的互信息。

近期沿此方向的一次尝试是基于**超均匀无序（hyperuniform disordered，HuD）**分布的阵列设计 [12]–[16]，它利用阵元位置间的短程有序与长程无序来抑制栅瓣，而无需信号稀疏或可压缩性。HuD 分布通过确保密度涨落在大尺度上消失，破坏产生空间混叠的周期性，从而实现无栅瓣辐射图样。然而 HuD 分布主要从统计力学角度设计，其阵元布放由控制结构有序程度的"隐身性（stealthiness）"参数支配 [14], [15]；因此 HuD 设计并未显式考虑信道容量或互信息等通信层面的性能指标，从信息论角度仍有优化空间。尽管如此，不规则阵元分布在抑制栅瓣与改善信道正交性方面的成功，凸显了非周期空间采样对大规模 MIMO 系统的巨大潜力。本文将具有非周期阵元分布的阵列统称为**非均匀阵列（NUA）**。

在上述背景下，本文提出 NUA 以克服传统均匀矩形阵列（URA）面向大规模 MIMO 系统的局限，并为其系统化设计引入 EMIT 框架。传统阵列设计由几何或场类准则引导，如主瓣宽度、旁瓣电平或栅瓣抑制，它们只与最大化信息吞吐量这一根本目标间接相关。本工作的一个关键洞见是：角域中的波束图样是空间阵元分布的可逆傅里叶变换；因此信息传递的任何退化都必然源于空间采样图样本身。这使我们能把阵列几何视为空间采样算子，并通过所得 MIMO 信道的容量严格评估它，而不只依赖启发式波束图样指标。本工作的主要贡献总结如下。

- **我们提出 NUA 以克服传统 URA 的固有局限**，特别是均匀阵元间距带来的 Nyquist 空间采样约束。为此，我们受互信息最优星座启发，引入多种 NUA，包括黄金角调制（golden angle modulation，GAM）[17], [18]、圆盘形 GAM（disc-shaped GAM，DiscGAM）[18]、螺旋调制（spiral modulation，SPM）[19] 与 HuD [12]–[16] 分布（如图 1 所示），以构造灵活的空间采样图样。所得阵列配置从信道正交性与孔径效率两方面分析，给出其潜在性能优势的洞见。此外，该框架扩展到宽带大规模阵列场景，结果表明相比传统均匀阵列，NUA 对波束斜视效应 [20]–[22] 表现出更强鲁棒性；这一改进归因于其更紧凑的空间阵元分布，可有效缓解依赖频率的波束失配。
- **我们引入一种显式的 NUA 设计 EMIT 方法**，把阵列几何与激励剖面都作为设计变量，从而在空间域自然引出几何整形与幅度加权的概念。为此，提出幅度加权、几何整形及其联合整形策略，以在 NUA 设计中最大化 MIMO 信道容量。
- **我们开展大量仿真以展示所提 NUA 的优势**。结果表明，当阵元间距超过半波长时，典型 NUA 相比传统 URA 在信道正交性、信道容量与误码率（BER）性能上均有改进，并具有更有利的传播条件。此外，在相同阵列孔径下，NUA 可用显著更少的天线阵元达到可比性能。这些结果说明 NUA 为下一代分布式阵列系统提供了有前景的方案。

本文其余部分组织如下：第 II 节给出窄带场景下 NUA 的大规模 MIMO 信道模型；基于该信道模型，第 III 节从阵列因子、信道正交性与有利传播方面研究信道特性；第 IV 节给出所提 NUA 优化方案，即用于信道容量增强的幅度加权与几何整形；第 V 节把所提 NUA 扩展到宽带场景；第 VI 节的实验结果展示 NUA 相对传统 URA 在大规模 MIMO 中的优越性，突出其改进的信道正交性与系统级性能；最后，第 VII 节给出结论与未来工作。

**记号**：标量用非粗体小写字母 $x$ 或大写字母 $X$ 表示；向量与矩阵分别用粗体小写字母 $\mathbf x$ 与粗体大写字母 $\mathbf X$ 表示。特别地，$\mathbf I$ 表示单位矩阵。向量 $\mathbf x\in\mathbb C^n$ 的第 $i$ 个元素记为 $[\mathbf x]_i$（$\forall i\in\langle n\rangle$），其中 $\langle n\rangle$ 表示列表 $\{1,\cdots,n\}$。对任意矩阵 $\mathbf X\in\mathbb C^{n_1\times n_2}$，其 $(i,j)$ 元素记为 $[\mathbf X]_{i,j}$（$\forall i\in\langle n_1\rangle$、$j\in\langle n_2\rangle$），其第 $i$ 行记为 $[\mathbf X]_i\in\mathbb C^{1\times n_2}$（$\forall i\in\langle n_1\rangle$）。记号 $(\cdot)^T$、$(\cdot)^\ast$、$(\cdot)^{-1}$、$(\cdot)^\dagger$ 与 $\mathcal D(\cdot)$ 分别表示转置、共轭转置、逆、伪逆与对角算子；$\otimes$ 与 $\circ$ 分别表示 Kronecker 积与 Hadamard 积。我们用 $|(\cdot)|$、$\angle(\cdot)$ 与 $\mathrm{Re}(\cdot)$ 分别表示复数的幅值、相位角与实部；用 $\lfloor\cdot\rfloor$ 表示下取整算子，用 $\lfloor a\bmod b\rceil$ 表示 $a$ 关于 $b$ 的取模运算。

## II. 信号模型

考虑一个大规模 MIMO 正交频分复用（OFDM）系统，其中基站（BS）服务 $K$ 个用户设备（UE）。设 BS 配备由水平和垂直方向各 $M_x$、$M_y$ 个阵元构成的 URA，每个 UE 配备单天线。在下行通信中，全部 $K$ 个 UE 在某子载波上接收的信号可建模为

$$
\mathbf y\in\mathbb C^K=\mathbf H^\ast\mathbf A\mathbf W\mathbf x+\mathbf n,\tag{1}
$$

其中 $\mathbf n$ 表示噪声，$\mathbf x\in\mathbb C^K$ 表示发射信号。$\mathbf W\in\mathbb C^{M\times K}=[\mathbf w_1,\ldots,\mathbf w_K]$（$M=M_xM_y$）表示波束成形器。$\mathbf A\in\mathbb R^{M\times M}=\mathcal D(\mathbf a)$（$\mathbf a\in\mathbb R^M$ 且 $[\mathbf a]_i\ge0,\forall i$）表示施加于 BS 阵列的幅度加权矩阵，用于旁瓣抑制与信道容量增强（详见第 IV 节）；特别地，未施加幅度加权时 $\mathbf A$ 退化为单位矩阵。$\mathbf H\in\mathbb C^{M\times K}=[\mathbf h_1,\ldots,\mathbf h_K]$ 表示多用户空间—频率信道，其第 $k$ 列为 BS 与第 $k$ 个 UE 之间的信道。

假定空间—频率信道 $\mathbf h_k$ 中存在 $L$ 条多径，则可建模为

$$
\mathbf h_k\in\mathbb C^M=\sum_{l=1}^{L}\alpha_{l,k}e^{-j2\pi f_s\tau_{l,k}}\mathbf a(\Theta_{l,k}),\tag{2}
$$

其中 $f_s$ 表示 OFDM 系统某子载波上的频率偏移。$\mathbf h_k$ 中第 $l$ 条路径的参数包括复增益 $\alpha_{l,k}$、时延 $\tau_{l,k}$、俯仰角 $\theta_{l,k}$ 与方位角 $\varphi_{l,k}$。注意（2）中向量 $\Theta_{l,k}=[\Theta_{x,l,k},\Theta_{y,l,k}]^T$（$\Theta_{x,l,k}=\sin(\theta_{l,k})\cos(\varphi_{l,k})$、$\Theta_{y,l,k}=\sin(\theta_{l,k})\sin(\varphi_{l,k})$）指示 $\mathbf h_k$ 中第 $l$ 条路径的方向。在窄带场景下，空间导向矢量 $\mathbf a(\Theta_{l,k})\in\mathbb C^M$ 由水平方向分量 $\mathbf a_x(\Theta_{x,l,k})\in\mathbb C^{M_x}$ 与垂直方向分量 $\mathbf a_y(\Theta_{y,l,k})\in\mathbb C^{M_y}$ 的 Kronecker 积构成 [23], [24]：

$$
\begin{cases}\mathbf a(\Theta_{l,k})=\mathbf a_x(\Theta_{x,l,k})\otimes\mathbf a_y(\Theta_{y,l,k}),\\ \mathbf a_x(\Theta_{x,l,k})=\left[1,e^{-j\frac{2\pi}{\lambda}d\cdot\Theta_{x,l,k}},\cdots,e^{-j\frac{2\pi}{\lambda}(M_x-1)d\cdot\Theta_{x,l,k}}\right]^T,\\ \mathbf a_y(\Theta_{y,l,k})=\left[1,e^{-j\frac{2\pi}{\lambda}d\cdot\Theta_{y,l,k}},\cdots,e^{-j\frac{2\pi}{\lambda}(M_y-1)d\cdot\Theta_{y,l,k}}\right]^T,\end{cases}\tag{3}
$$

其中 $d$ 为 URA 在水平与垂直方向的阵元间距，$\lambda$ 表示载波波长。

URA 与 NUA 配置之间的信道差异源于其空间导向矢量的变化。在 URA 配置下，（3）可重写为

$$
\mathbf a(\Theta_{l,k})=\left[e^{-j\frac{2\pi}{\lambda}\mathbf s_1^T\cdot\Theta_{l,k}},\cdots,e^{-j\frac{2\pi}{\lambda}\mathbf s_M^T\cdot\Theta_{l,k}}\right]^T,\tag{4}
$$

其中向量 $\mathbf s_m=[s_{x,m},s_{y,m}]^T$（$s_{x,m}=\lfloor(m-1)/M_y\rfloor\cdot d$、$s_{y,m}=\lfloor(m-1)\bmod M_y\rceil\cdot d$）表示第 $m$ 个天线的二维位置（$\forall m\in\langle M\rangle$）。然而如（3）所定义的 URA 导向矢量中的 Kronecker 积结构，在 NUA 中因阵元间距不规则而不再存在。因此需把（4）中 URA 的导向矢量扩展以适配 NUA，使得对所有 $m\in\langle M\rangle$ 有

$$
[\mathbf a(\Theta_{l,k})]_m=e^{-j\frac{2\pi}{\lambda}\mathbf s_m^T\cdot\Theta_{l,k}}=e^{-j\frac{2\pi}{\lambda}\left(s_{x,m}\cdot\Theta_{x,l,k}+s_{y,m}\cdot\Theta_{y,l,k}\right)},\tag{5}
$$

其中第 $m$ 个天线在水平与垂直方向的位置 $s_{x,m}\in\mathbb R$ 与 $s_{y,m}\in\mathbb R$ 可在阵列孔径范围内灵活配置。

注意为公平起见，NUA 中相对波长的阵元间距定义与 URA 保持一致。具体地，对与 URA 具有相同孔径尺寸与相同天线阵元数的 NUA，其阵元间距定义为 $d$，即等于（3）中 URA 在水平与垂直方向的阵元间距。换言之，孔径尺寸与天线阵元数相同的 NUA 与 URA 视为具有相同阵元间距。

## III. 非均匀阵列的优势

本节通过评估辐射图样与有利传播给出所提 NUA 的优势。具体地，NUA 阵元分布的设计灵感来自信号域中互信息最优的星座整形 [17]–[19]。在星座设计中，黄金角类与螺旋类等非周期几何排布 [17]–[19] 已知相比传统均匀网格可获得有利的几何性质与更强的互信息。类似地，我们把这些结构化良好的非周期图样应用于空间域作为天线阵元分布，利用其固有几何优势实现栅瓣抑制与信道特性改善。遵循这一思路，我们以 GAM、DiscGAM、SPM 与 HuD 分布作为基本 NUA 图样设计，如图 1 所示。

**图 1**：URA 与具有 GAM、DiscGAM、SPM、HuD 分布的 NUA 的阵元图样示意；在相同孔径尺寸内各含 $M=225$ 个阵元。

### A. 无栅瓣效应

基于（4）与（5），任意阵列分布下归一化阵列因子的幅值为 [15]：

$$
|A(\Theta_{l,k})|=\frac{1}{M}\left|\sum_{m=1}^{M}e^{-j\frac{2\pi}{\lambda}\mathbf s_m^T\cdot\Theta_{l,k}}\right|,\tag{6}
$$

其中 $\Theta_{l,k}\in\mathbb R^2=[\sin(\theta_{l,k})\cos(\varphi_{l,k}),\sin(\theta_{l,k})\sin(\varphi_{l,k})]^T$ 如（2）给出。根据 Nyquist–Shannon 采样定理 [1], [2]，均匀分布阵列中的空间采样间隔（即阵元间距）应小于半波长以避免空间混叠伪影；反之，更大的阵元间距通常导致更多栅瓣 [25], [26]。例如，图 2 与图 3 给出（6）中归一化阵列因子幅值，阵元间距设为 $d=\epsilon\lambda$，其中 $\lambda=6$ cm、常数 $\epsilon$ 取 1 或 5。如图 2(a) 与图 3(a) 所示，URA 在 $\epsilon=1$ 时即出现栅瓣，且当阵元间距增大到 $\epsilon=5$ 时更为明显。相反，具有精心设计阵元分布的 NUA（如 GAM、DiscGAM、SPM 或 HuD 分布）在 $\epsilon=1$ 与 $\epsilon=5$ 时均无栅瓣。

**图 2**：（6）中归一化阵列因子幅值的比较：URA (a) 与 NUA (b)—(e)，俯仰角 $\theta_{l,k}$ 在 $[0^\circ,90^\circ]$、方位角 $\varphi_{l,k}$ 在 $[0^\circ,360^\circ]$ 上变化。结果以极坐标给出，径向与角向分别对应 $\theta_{l,k}$ 与 $\varphi_{l,k}$。URA 与 NUA 共享相同孔径尺寸与阵元数 $M=225$（见图 1）。主瓣在俯仰与方位上均指向 $0^\circ$。第 1、2 行分别为阵元间距 $d=\epsilon\lambda$（$\epsilon=1$ 与 5）的结果。

**图 3**：（6）中归一化阵列因子幅值的比较：URA (a) 与 NUA (b)—(e)，方位角固定为 $\varphi_{l,k}=0^\circ$、俯仰角 $\theta_{l,k}$ 在 $[-90^\circ,90^\circ]$ 上变化；所有阵列配置同图 2。主瓣在俯仰上指向 $0^\circ$。第 1、2 行分别为 $d=\epsilon\lambda$（$\epsilon=1$ 与 5）的结果。

URA 中栅瓣的存在必然降低天线孔径效率（aperture efficiency，AE）。基于（2），第 $k$ 个 UE 信道第 $l$ 条路径方向上的 AE 可度量为 [25], [26]：

$$
\mathrm{AE}=\frac{|A(\Theta_{l,k})|^2\cdot\theta_{\mathrm{exc}}}{|A(\Theta_{l,k})|^2\cdot\frac{\pi}{2}+\sum_{j=1}^{J}|A(\hat\Theta_{l,k,j})|^2\cdot\frac{\cos(\theta_{l,k})}{\max\{\cos(\hat\theta_{l,k,j}),\eta\}}},\tag{7}
$$

其中 $\Theta_{l,k}$ 与 $\hat\Theta_{l,k,j}=[\sin(\hat\theta_{l,k,j})\cos(\hat\varphi_{l,k,j}),\sin(\hat\theta_{l,k})\sin(\hat\varphi_{l,k,j})]^T$ 分别表示主瓣与第 $j$ 个栅瓣的方向向量。由于阵列因子的对称性，栅瓣数（记为 $J$）在半空间 $\hat\theta_{l,k}\in[0,\pi/2]$、$\hat\varphi_{l,k}\in[0,\pi)$ 内计数。非零常数 $\eta=0.1$ 用于在栅瓣出现于方位角 $\hat\theta_{l,k,j}=\pi/2$（$\forall j\in\langle J\rangle$）时避免除零。角度 $\theta_{\mathrm{exc}}\in(0,\pi/2]$ 表示阵列辐射图样中圆形排除区域的半径 [15]。沿用图 3 的实验设置，我们在图 4 中评估 AE 分数随阵元间距的变化：随着阵元间距增大，URA 的 AE 因栅瓣对天线方向性的影响而迅速下降；相反，图 4 中所有被测 NUA 因能抑制栅瓣而表现出更稳定的 AE 分数。

**图 4**：URA 与具有 GAM、DiscGAM、SPM、HuD 分布的 NUA 的 AE 随阵元间距 $d=\epsilon\lambda$（常数 $\epsilon$）的变化。

### B. 有利传播

我们研究采用 NUA 的大规模 MIMO 信道特性，并与传统 URA 比较。在多用户场景中，栅瓣抑制会减少用户间干扰，从而增强（1）中多用户信道 $\mathbf H$ 的正交性。考虑信道协方差矩阵（CCM），即 $\mathbf H^\ast\mathbf H$。在大阵元间距的 URA 配置下，由于栅瓣出现，CCM 的非对角元素无法被有效抑制；相反，对给定天线阵元数与相同阵列孔径尺寸，NUA 可有效避免栅瓣，使 CCM 更可对角化。

可对角化的 CCM 使大规模 MIMO 系统的多用户信道获得有利传播。有利传播性质刻画信道正交性，当 BS 天线数足够大时在 MIMO 系统中出现，即

$$
\mathbf h_i^\ast\mathbf h_j/M\to0,\quad\forall i\neq j,\ \text{当 }M\to\infty.\tag{8}
$$

值得注意的是，当不同 UE 的多用户信道完全正交时信道容量达到最大。具体地，在（1）中 $\mathbf n\sim\mathcal{CN}(0,\sigma^2\mathbf I)$ 的加性白高斯噪声假设下，最大比合并（MRC）准则下关于信道 $\mathbf H$ 的可达和速率记为 $C_1(\mathbf H)$，定义为

$$
C_1(\mathbf H)\triangleq\sum_{k=1}^{K}\log_2(1+\gamma_k),\tag{9}
$$

其中 $\gamma_k$ 表示第 $k$ 个 UE 的信干噪比，定义为

$$
\gamma_k=\frac{\left|\mathbf w_k^\ast\cdot\mathbf h_k\right|^2}{\sum_{i\neq k}^{M}\left|\mathbf w_i^\ast\cdot\mathbf h_k\right|^2+\sigma^2}.\tag{10}
$$

假定采用迫零（ZF）波束成形器 $\mathbf W=[\mathbf w_1,\ldots,\mathbf w_K]$ [27]，并为每个 UE 分配单位功率，则 $C_1(\mathbf H)$ 被关于信道 $\mathbf H$ 的最大和速率 $C_2(\mathbf H)$ 上界，即

$$
C_1(\mathbf H)\le C_2(\mathbf H)\triangleq\log_2\det\left(\mathbf I+\frac{1}{\sigma^2}\mathbf H\mathbf H^\ast\right).\tag{11}
$$

当不同 UE 的信道向量相互正交（即 $\mathbf h_i^\ast\mathbf h_j=0$，$\forall i\neq j$）时等号 $C_1(\mathbf H)=C_2(\mathbf H)$ 成立；反之，若这些信道向量不完全正交（即至少存在一对 $i\neq j$ 使 $\mathbf h_i^\ast\mathbf h_j\neq0$），则 $C_1(\mathbf H)<C_2(\mathbf H)$。

## IV. 非均匀阵列的整形

传统阵列设计通常由几何或场类准则引导，如主瓣宽度、旁瓣电平或栅瓣抑制 [6], [12]–[16], [28]。这些指标虽刻画辐射图样，却只与通信系统的根本目标——以最小失真传递信息——间接相关。从通信角度看，阵列响应矢量本质上由天线阵元的几何分布与其激励幅度共同决定。优化天线阵元的几何分布称为**几何整形**，优化激励幅度称为**幅度加权**。具体地，幅度加权在一定功率预算下调整各阵元的激励权重，从而重塑阵列因子以抑制旁瓣，如图 5 所示。通过独立或联合地整形幅度权重与天线位置，可把 NUA 定制为更有利的 MIMO 信道特性。

值得注意的是，若把每个天线阵元视为一个空间星座点 [17]–[19]，则阵列整形可解释为星座整形的空间类比：在此解释下，天线位置对应几何整形、激励幅度对应概率整形，二者都旨在最大化互信息 [1], [2]。因此我们把所提阵列整形框架称为基于 EMIT 的设计方法。

我们的第二个关键洞见是：角域波束图样是天线阵元空间采样的傅里叶变换。由于傅里叶变换是可逆运算，它不会降低互信息；因此信息传递的任何退化都必然来自空间采样图样本身，而非角域变换。这一观察使我们能把不同阵列几何视为不同空间采样算子，并通过所得 MIMO 信道的容量严格评估它们。

**图 5**：未施加与施加幅度加权时的归一化阵列因子：(a) 未施加；(b) 施加。具体地，考虑 $N=32$、半波长间距的均匀线阵，施加旁瓣电平为 $-30$ dB 的 Taylor 窗幅度加权。

### A. 几何整形

假定 BS 配备的阵列具有固定阵元数与固定孔径尺寸，同时允许孔径内阵元几何可变。在此假设下，我们把阵列几何整形问题视为**天线选择**问题 [29], [30]：从天线密集的 URA（水平与垂直方向分别含 $TM_x$ 与 $TM_y$ 个阵元，$M=M_xM_y$、$T\gg1$）中选择 $M$ 个天线阵元。天线选择的准则是最大化多用户 MIMO 信道容量 $C_2(\mathbf H)$（如（11）定义），其中 $\mathbf H\in\mathbb C^{M\times K}=[\mathbf h_1,\ldots,\mathbf h_K]$ 按（2）—（5）建模并随所选 $M$ 个天线的位置变化。值得一提的是，我们选择最大化 $C_2(\mathbf H)$ 而非 $C_1(\mathbf H)$，因为 $C_1(\mathbf H)$ 的取值不仅依赖信道 $\mathbf H$，还依赖波束成形器 $\mathbf W=[\mathbf w_1,\ldots,\mathbf w_K]$；因此最大化 $C_1(\mathbf H)$ 需要联合优化 $\mathbf H$ 与 $\mathbf W$，这不可处理，且比仅通过最大化 $C_2(\mathbf H)$ 优化 $\mathbf H$ 计算代价更高。尽管最大化 $C_1(\mathbf H)$ 与 $C_2(\mathbf H)$ 可能给出不同结果，但二者关系密切，因为如（11）所示 $C_1(\mathbf H)$ 被 $C_2(\mathbf H)$ 上界。使用所提几何整形算法，界 $C_2(\mathbf H)=C_1(\mathbf H)$ 在某些场景下近似可达，如图 9 与图 10 的实验结果所示。

由于使用 $T\gg1$ 的天线密集 URA，从 $T^2M$ 个天线中选出 $M$ 个的所有可能组合会导致维数灾难问题 [29], [30]，使基于凸优化的传统天线选择方法 [30] 在计算上不可行，尤其在处理二维阵列场景时。相反，基于贪心的天线选择方法计算高效，因而本文予以研究。然而传统贪心算法 [29] 在 $T\gg1$ 的几何整形问题上表现不佳，因为它们非凸且对初始化敏感。为解决该问题，我们提出一种基于贪心的**天线位置更新（antenna position update，APU）**算法用于几何整形。APU 至多进行 $N$ 次迭代，总结于算法 1。算法初始化时，我们把所选天线集构造为具有 HuD（或 GAM、DiscGAM、SPM）分布的 $M$ 阵元 NUA，把候选天线集构造为由 $T^2M$ 个阵元构成的 URA。

如图 6 所示，APU 的第 $n$ 次迭代包含两步：在此两步之前，所选天线集与候选天线集分别含 $M$ 个与 $(T^2M-n)$ 个阵元。在第 $n$ 次迭代的第一步，所选天线集移除一个阵元，剩下 $(M-1)$ 个阵元；在第二步，候选天线集中的一个阵元被移入所选天线集，使第二步之后所选天线集与候选天线集分别含 $M$ 个与 $(T^2M-n-1)$ 个阵元。这样，所选天线集通过 APU 的第 $n$ 次迭代完成一个天线阵元的更新。在给出 APU 第 $n$ 次迭代的优化问题之前，记第 $n$ 次迭代中所选天线集与候选天线集对应的多用户信道分别为 $\mathbf H_n\in\mathbb C^{M\times K}$ 与 $\mathbf P_n\in\mathbb C^{(T^2M-n)\times K}$。基于先验已知的天线位置与信道状态信息，$\mathbf H_n$ 与 $\mathbf P_n=[\mathbf p_{n,1},\ldots,\mathbf p_{n,K}]$ 可按（2）—（4）建模。具体地，$\mathbf p_{n,k}\in\mathbb C^{(T^2M-n)}$ 类似（2）中的 $\mathbf h_k$，只需把（4）中的 $\mathbf a(\Theta_{l,k})$ 替换为 $\tilde{\mathbf a}(\Theta_{l,k})\in\mathbb C^{(T^2M-n)}=\left[e^{-j\frac{2\pi}{\lambda}\tilde{\mathbf s}_1^T\cdot\Theta_{l,k}},\cdots,e^{-j\frac{2\pi}{\lambda}\tilde{\mathbf s}_{(T^2M-n)}^T\cdot\Theta_{l,k}}\right]^T$，其中 $\tilde{\mathbf s}_j=[\tilde s_{x,j},\tilde s_{y,j}]^T$ 表示候选天线集中第 $j$ 个阵元的二维位置（$\forall j\in\langle T^2M-n\rangle$）。基于这些信道模型，APU 第 $n$ 次迭代的第一、二步分别产生如下（12）与（13）的优化问题：

$$
i_n=\arg\max_{i\in\langle M\rangle}C_2\left(\mathbf H_n^{(i)}\right),\tag{12}
$$

$$
j_n=\arg\max_{j\in\langle T^2M-n\rangle}C_2\left(\mathbf H_n^{(i_n,j)}\right),\tag{13}
$$

其中 $\mathbf H_n^{(i)}\in\mathbb C^{(M-1)\times K}$ 由删除 $\mathbf H_n$ 的第 $i$ 行构成，$\mathbf H_n^{(i_n,j)}\in\mathbb C^{M\times K}=\left[(\mathbf H_n^{(i_n)})^T,[\mathbf P_n]_j^T\right]^T$ 由把 $\mathbf P_n$ 的第 $j$ 行移到 $\mathbf H_n^{(i_n)}$ 的最后一行构成。求解（12）与（13）后，算法 1 按第 4 行更新 $\mathbf H_{n+1}$ 与 $\mathbf P_{n+1}$ 供下一次迭代使用。

值得注意的是，在 $T\gg1$ 的场景中，由于候选天线集内阵元数量庞大，直接求解（13）计算代价昂贵。为提升计算效率，我们把行列式的 Sherman–Morrison 公式 [29], [31] 应用于（13）的目标，得到

$$
C_2\left(\mathbf H_n^{(i_n,j)}\right)=C_2\left(\mathbf H_n^{(i_n)}\right)+\log_2\left(1+\frac{1}{\sigma^2}[\mathbf P_n]_j\cdot\mathbf f\left(\mathbf H_n^{(i_n)}\right)\cdot[\mathbf P_n]_j^\ast\right),\tag{14}
$$

其中 $\mathbf f(\mathbf H_n^{(i_n)})\triangleq\left(\mathbf I+(\mathbf H_n^{(i_n)})^\ast\mathbf H_n^{(i_n)}/\sigma^2\right)^{-1}$。基于（14），（13）可等价改写为

$$
j_n=\arg\max_{j\in\langle T^2M-n\rangle}[\mathbf P_n]_j\cdot\mathbf f\left(\mathbf H_n^{(i_n)}\right)\cdot[\mathbf P_n]^\ast_j,\tag{15}
$$

该问题可在多项式时间内求解。

**图 6**：APU 第 $n$ 次迭代（$n=0$）中所选天线集（含 $M=9$ 个阵元）与候选天线集（含 $(T^2M-n)$ 个阵元，$T=5$）的阵元更新示意。第 $n$ 次迭代第一步移除所选天线集中的第 $i_n$ 个阵元；第二步把候选天线集中的第 $j_n$ 个阵元移入所选天线集。

### B. 幅度加权

除第 IV-A 节引入的几何整形外，还可对 BS 阵列进一步施加幅度加权以增强信道容量。注意（9）与（11）定义的信道容量不涉及 BS 阵列的幅度加权，对应（1）中幅度加权矩阵 $\mathbf A=\mathcal D(\mathbf a)$ 退化为单位矩阵的信号模型。相反，考虑幅度加权时，（11）中的容量 $C_2(\mathbf H)$ 扩展为

$$
C_3(\mathbf H,\mathbf a)\triangleq\log_2\det\left(\mathbf I+\frac{1}{\sigma^2}\mathcal D(\mathbf a)\mathbf H\mathbf H^\ast\mathcal D(\mathbf a)\right),\tag{16}
$$

它不仅依赖信道 $\mathbf H$，还依赖幅度加权向量 $\mathbf a\in\mathbb C^M$（即 BS 阵列 $M$ 个阵元上的激励权重）。未施加幅度加权（即 $\mathbf A=\mathbf I$）时 $C_3(\mathbf H,\mathbf a)=C_2(\mathbf H)$；而恰当的幅度加权有可能实现 $C_3(\mathbf H,\mathbf a)>C_2(\mathbf H)$。

为避免平凡的无界解，需对幅度加权施加实际约束。具体地，我们考虑联合功率预算与非负约束，得到如下优化问题：

$$
\max_{\mathbf a}\ C_3(\mathbf H,\mathbf a)\quad\text{s.t.}\ \|\mathbf a\|_2^2\le P,\ [\mathbf a]_m\ge0,\ \forall m\in\langle M\rangle,\tag{17}
$$

其中 $P$ 表示功率预算。由于目标函数中 $\mathcal D(\mathbf a)\mathbf H\mathbf H^\ast\mathcal D(\mathbf a)$ 关于 $\mathbf a$ 的二次依赖，问题（17）非凸；不过该目标函数关于 $\mathbf a$ 光滑可微，故（17）可用投影梯度上升（PGA）法 [32] 有效求解，总结于算法 2。PGA 的第 $n$ 次迭代按

$$
\mathbf a_{n+1}=\Pi_{\mathcal F}\left(\mathbf a_n+\alpha\nabla_{\mathbf a_n}C_3(\mathbf H,\mathbf a_n)\right)\tag{18}
$$

更新变量 $\mathbf a_{n+1}$。$C_3(\mathbf H,\mathbf a_n)$ 关于 $\mathbf a_n$ 的梯度可计算为

$$
[\nabla_{\mathbf a_n}C_3(\mathbf H,\mathbf a_n)]_i=\frac{2\mathrm{Re}\left(\left[(\mathbf I+\mathbf A_n\mathbf R\mathbf A_n/\sigma^2)^{-1}\mathbf A_n\mathbf R\right]_{i,i}\right)}{\sigma^2\ln2},\quad\forall i,\tag{19}
$$

其中 $\mathbf A_n=\mathcal D(\mathbf a_n)$、$\mathbf R=\mathbf H\mathbf H^\ast$。步长 $\alpha>0$ 通过基于两参数 $\beta<1$ 与 $c<1$ 的回溯线搜索选取（详见算法 2 第 6—10 行）。对任意 $\mathbf x\in\mathbb C^M$，算子 $\Pi_{\mathcal F}(\mathbf x)$ 把它投影到可行集 $\mathcal F$ 上，$\mathcal F$ 定义为

$$
\mathcal F\triangleq\left\{\mathbf x\ \middle|\ \|\mathbf x\|_2^2\le P\ \text{且}\ [\mathbf x]_m\ge0,\ \forall m\in\langle M\rangle\right\},\tag{20}
$$

其闭式表达为

$$
\Pi_{\mathcal F}(\mathbf x)=\begin{cases}\mathbf x,&\text{若 }\mathbf x\in\mathcal F,\\ \sqrt{P}\cdot\dfrac{\max(0,\mathbf x)}{\|\max(0,\mathbf x)\|_2},&\text{否则}.\end{cases}\tag{21}
$$

幅度加权与几何整形技术可自然结合用于大规模 MIMO 系统：先用算法 1 优化天线几何，再用算法 2 优化天线激励幅度以增强信道容量。该联合设计称为**几何整形与幅度加权联合**方案。

**算法 1**　用于几何整形的 APU

**输入**：$\mathbf P_0\in\mathbb C^{T^2M\times K}$、$\mathbf H_0\in\mathbb C^{M\times K}$ 与 $N$。
1: **for** $n=0,1,\cdots,N$ **do**
2: 　按（12）更新 $i_n$。
3: 　按（15）更新 $j_n$。
4: 　更新 $\mathbf H_{n+1}=\mathbf H_n^{(i_n,j_n)}$ 与 $\mathbf P_{n+1}=\mathbf P_n^{(j_n)}$。
5: 　若满足终止条件 $C_2(\mathbf H_{n+1})<C_2(\mathbf H_n)$ 则停止。
6: **end for**
**输出**：$\mathbf H_n$。

**算法 2**　用于幅度加权的 PGA

**输入**：$\mathbf H\in\mathbb C^{M\times K}$、$P$、$N$、$\delta_1$、$\delta_2$、$\beta$ 与 $c$。
1: 初始化：$\mathbf a_0$ 与 $\alpha_0>0$。
2: **for** $n=0,1,\ldots,N$ **do**
3: 　**if** $\|\nabla_{\mathbf a_n}C_3(\mathbf H,\mathbf a_n)\|_2\le\delta_1$ **then**
4: 　　**break**
5: 　**end if**
6: 　$\alpha=\alpha_0$（回溯线搜索的初始化）。
7: 　**repeat**
8: 　　$\tilde{\mathbf a}=\Pi_{\mathcal F}(\mathbf a_n+\alpha\nabla_{\mathbf a_n}C_3(\mathbf H,\mathbf a_n))$。
9: 　　$\alpha=\beta\alpha$。
10:　**until** $C_3(\mathbf H,\tilde{\mathbf a})\ge C_3(\mathbf H,\mathbf a_n)+c\alpha\|\nabla_{\mathbf a_n}C_3(\mathbf H,\mathbf a_n)\|_2^2$ 或 $\alpha<\delta_2$。
11:　$\mathbf a_{n+1}=\tilde{\mathbf a}$。
12: **end for**
**输出**：$\mathbf A_n=\mathcal D(\mathbf a_n)$。

## V. 向宽带场景的扩展

在含大量天线的大规模 MIMO 系统中，对同一发射数据符号，不同阵列阵元之间会出现相当大的时延，从而导致空间—宽带效应 [20]。该效应是大规模阵列的固有属性。此外，OFDM 系统中的空间—宽带效应会扩展到同时涵盖空间与频率域，导致波束斜视现象 [21], [22]：这是因为空间导向矢量变得高度依赖工作频率，需把（4）中的 $\mathbf a(\Theta_{l,k})$ 修正为 [20]–[22]

$$
\mathbf a(\Phi_{l,k,q})=\left[e^{-j\frac{2\pi}{\lambda}\mathbf s_1^T\cdot\Phi_{l,k,q}},\cdots,e^{-j\frac{2\pi}{\lambda}\mathbf s_M^T\cdot\Phi_{l,k,q}}\right]^T,\tag{22}
$$

其中 $\Phi_{l,k,q}=\left(1+\frac{f_q}{f_c}\right)\Theta_{l,k}$ 指示第 $q$ 个子载波上第 $k$ 个 UE 信道第 $l$ 条路径的方向；$f_q=qB/Q$ 表示第 $q$ 个子载波的频率偏移（$B$ 与 $Q$ 分别为 OFDM 系统的带宽与子载波数）；$f_c=c/\lambda$ 表示载波频率（$c$ 为光速）。随后，窄带信道模型（2）可扩展到宽带场景：在第 $k$ 个 UE 的第 $q$ 个子载波上，有

$$
\mathbf h_{k,q}\in\mathbb C^M=\sum_{l=1}^{L}\alpha_{l,k}e^{-j2\pi f_q\tau_{l,k}}\mathbf a(\Phi_{l,k,q}).\tag{23}
$$

与（23）等价地，第 $k$ 个 UE 与 BS 第 $m$ 个天线之间在全部子载波上的信道可描述为

$$
\mathbf h_{k,m}\in\mathbb C^Q=\sum_{l=1}^{L}\alpha_{l,k}e^{-j\frac{2\pi}{\lambda}\mathbf s_m^T\cdot\Theta_{l,k}}\left(\mathbf b(\tau_{l,k})\circ\mathbf d(\mathbf s_m)\right),\tag{24}
$$

其中 $\mathbf b(\tau_{l,k})=\left[e^{-j2\pi f_1\tau_{l,k}},\cdots,e^{-j2\pi f_Q\tau_{l,k}}\right]^T$ 为窄带场景中指向时延 $\tau_{l,k}$ 的频率导向矢量；项 $\mathbf d(\mathbf s_m)=\left[e^{-j\frac{2\pi}{c}f_1\mathbf s_m^T\cdot\Theta_{l,k}},\cdots,e^{-j\frac{2\pi}{c}f_Q\mathbf s_m^T\cdot\Theta_{l,k}}\right]^T$ 与波束斜视效应有关。

注意在第 $k$ 个 UE 信道第 $l$ 条路径上，第 $q$ 个子载波与第 $m$ 个天线处的波束斜视角可度量为

$$
\Delta_{l,k}^{(m,q)}=\left|\angle[\mathbf a(\Theta_{l,k})]_m-\angle[\mathbf a(\Phi_{l,k,q})]_m\right|=\frac{2\pi f_q}{c}\left|\mathbf s_m^T\cdot\Theta_{l,k}\right|,\tag{25}
$$

其中 $\mathbf a(\Theta_{l,k})$ 与 $\mathbf a(\Phi_{l,k,q})$ 分别在（4）与（22）中定义。进一步，第 $m$ 个天线处跨全部子载波的平均波束斜视角，以及第 $q$ 个子载波处跨全部天线的平均波束斜视角，可分别量化为

$$
\Delta_{l,k}^{(m)}=\frac{1}{Q}\sum_{q=1}^{Q}\Delta_{l,k}^{(m,q)},\quad\forall m\in\langle M\rangle,\tag{26}
$$

$$
\Delta_{l,k}^{(q)}=\frac{1}{M}\sum_{m=1}^{M}\Delta_{l,k}^{(m,q)},\quad\forall q\in\langle Q\rangle.\tag{27}
$$

由（25）—（27）可知，波束斜视角由两个因素决定：1）子载波的频率偏移 $f_q$；2）阵列阵元的位置偏移 $\mathbf s_m$。前者表明更大带宽 $B$（决定第 $q$ 个子载波的频率偏移 $f_q=qB/Q$）导致更严重的斜视波束。不失一般性假定空间原点位于阵列中心，则后者表明阵元离中心越远，波束斜视越明显。与图 1 中的 URA 不同，除 HuD 之外的典型 NUA 具有阵元排布更密集的圆形孔径，从而对波束斜视效应更具韧性。

除上述导向矢量外，波束斜视效应还可用波束图样考察，该图样直观展示阵列中每个阵元的综合影响。考虑宽带场景，第 $q$ 个子载波处归一化阵列因子的幅值可按与（6）类似的方式计算 [15]：

$$
|A(\Phi_{l,k,q})|=\frac{1}{M}\left|\sum_{m=1}^{M}e^{-j\frac{2\pi}{\lambda}\mathbf s_m^T\cdot\Phi_{l,k,q}}\right|,\quad\forall q\in\langle Q\rangle.\tag{28}
$$

由（28）与（22）可知，第 $k$ 个 UE 信道第 $l$ 条路径相关的波束图样随频率变化，这意味着 OFDM 系统中不同子载波会观测到同一路径的不同到达角，而第 $q$ 个子载波处的波束斜视程度取决于频率偏移 $f_q$ 与天线位置偏移 $\mathbf s_m$（$\forall m\in\langle M\rangle$）。

## VI. 实验结果

本节评估采用 GAM、DiscGAM、SPM、HuD 以及几何整形分布的若干 NUA 的性能，并与孔径尺寸与阵元数相同的 URA 比较。URA 或 NUA 部署在 BS 处以服务多个单天线 UE。OFDM 系统中波长 $\lambda$ 对应载频 $f_c=6$ GHz，被测子载波的频率偏移为 $f_s=1$ MHz。为便于比较，图 7—11 中标为 "GS"、"AT" 与 "GS+AT" 的曲线分别对应使用算法 1 的几何整形、算法 2 的幅度加权，以及几何整形与幅度加权联合的阵列优化结果。算法 1 与算法 2 的参数设置为 $T=10$、$N=300$、$P=M$、$\beta=0.5$、$c=10^{-4}$、$\delta_1=10^{-8}$、$\delta_2=10^{-12}$。

### A. 信道特性评估

我们按第 II 节所述生成窄带信道。默认仿真参数为 $M=100$、$L=50$、$K=3$、$d=\epsilon\lambda$（常数 $\epsilon=5$）。（2）中的信道向量 $\mathbf h_k$ 对每个 UE $k$ 独立生成；信道参数在 500 次蒙特卡洛试验的每次中随机均匀生成。具体地，多径分量的时延在区间 $(0,500\ \mathrm{ns}]$ 内均匀随机分布；信道假定由一条视距（LOS）路径与 $(L-1)$ 条非视距（NLOS）路径构成，NLOS 与 LOS 路径的复增益分别服从零均值复高斯分布、方差为 $10^{-4}$ 与 $0.195$；相应地，LOS 与 NLOS 路径之间的功率比（称为 K 因子）等于 16 dB [33], [34]。每次试验中，我们随机选择一个 UE，把其 LOS 路径的方位角与俯仰角设为零，从而使该路径与阵列主瓣对齐；同时，所有其他路径的俯仰角与方位角分别在区间 $[0,\pi/2]$ 与 $[0,\pi]$ 内随机均匀抽取。

基于生成的信道矩阵 $\mathbf H\in\mathbb C^{M\times K}$，我们以条件数评估其正交性。一般而言，越正交的信道对应越接近 1 的条件数。图 7(a)—(c) 分别给出条件数随天线阵元数 $M$、阵元间距 $d=\lambda\epsilon$ 与 UE 数 $K$ 的变化结果。具体地，图 7(a) 在固定 $\epsilon$ 与 $K$ 下变化 $M$ 以测试其对条件数的影响：结果表明信道正交性随天线阵元数增加而逐渐改善，印证了大规模 MIMO 系统的优势。与 URA 相比，所有 NUA 在不同天线阵元数下都取得更低的条件数。这一现象可归因于 URA 中存在大量栅瓣，导致不同 UE 的信道向量之间产生干扰，从而降低信道矩阵的正交性。此外，用算法 1 得到几何整形分布的 NUA 取得最佳条件数结果，反映信道容量与正交性之间的正相关。与在给定天线阵元数下固定不变的 GAM、DiscGAM、SPM、HuD 分布不同，经算法 1 得到的几何整形分布能适应信道状态信息，增强信道容量并带来更有利的传播特性。图 7(b) 中条件数比较呈现类似趋势，其中所提 GS 方法取得最佳性能。图 7(c) 研究 UE 数对信道正交性的影响：结果表明随着 BS 服务的 UE 数增加，波束重叠概率与由此产生的用户间干扰也随之增大；此外，URA 受空间混叠伪影影响，当 UE 数变大时进一步降低信道正交性。在 $K=50$ 的严苛场景中，图 7(c) 中具有几何整形分布的 NUA 显著优于 URA，展现出更强的信道正交性。

除信道矩阵条件数外，我们还用另一性能指标——CCM 特征值的累积分布函数（CDF）——评估信道特性。正交信道通常表现出稳定的行为，其 CCM 特征值分布方差小、CDF 窄。图 8 表明在阵元间距 $d=\epsilon\lambda$（测试了 $\epsilon=1$ 与 $\epsilon=5$）下，NUA 相比 URA 取得更优的 CDF 性能。图 7 与图 8 的联合分析清楚凸显了 NUA 相对 URA 在有利传播方面的优势。

**图 7**：不同阵列分布下多用户信道条件数的比较：(a) 阵列阵元数的影响；(b) 阵元间距的影响；(c) UE 数的影响。
**图 8**：不同阵列分布下 CCM 特征值 CDF 的比较。

### B. 系统级性能评估

我们用信道容量准则对阵列分布设计进行系统级评估，实验设置沿用第 VI-A 节。图 9 给出多用户信道 $\mathbf H\in\mathbb C^{M\times K}$ 的平均每用户容量随信噪比（SNR）的变化。注意图 9 中的容量界对 AT 与 GS+AT 方法指（16）中的 $C_3(\mathbf H,\mathbf a)$，对其他所有方法指（11）中的 $C_2(\mathbf H)$。图 9 中的 MRC 容量对所有方法（AT 与 GS+AT 除外）指（9）中 $C_1(\mathbf H)$（在 ZF 波束成形方案下）。具体地，AT 与 GS+AT 方法的 MRC 容量按（9）（10）类似方式定义，只需对所有 $k\in\langle K\rangle$ 把第 $k$ 个 UE 的信道 $\mathbf h_k$ 替换为其幅度加权版本 $\mathcal D(\mathbf a)\cdot\mathbf h_k$。

图 9 表明 NUA 在不同 SNR 条件下始终优于 URA。此外，GS 方法优于 AT 方法，说明优化天线阵列分布相比优化激励幅度对信道容量的影响更显著。而且图 9 表明幅度加权与几何整形的联合使用可确保两方面同时改善：如所示，所提 GS+AT 方法取得最佳性能，相比 URA 带来约 0.8 bps/Hz 的容量增益。

接下来我们考察不同场景参数（$M$、$\epsilon$、$K$）对信道容量的影响。图 10(a) 在固定 $\epsilon$ 与 $K$ 下变化 $M$，评估多用户信道 $\mathbf H\in\mathbb C^{M\times K}$ 的平均每用户容量；类似地，图 10(b) 与 (c) 在保持其余两个参数不变的情况下分别变化 $\epsilon$ 与 $K$ 报告容量结果。如图 10(a)—(c) 所示，所提 GS+AT 方法在不同场景参数设置下均取得最佳性能；此外 GS+AT 方法达到的 MRC 容量紧密逼近其容量界，反映通过 GS+AT 方法最大化容量界与提升 MRC 容量之间的正相关。

除容量指标外，我们还用 BER 指标比较不同阵列分布。图 11 给出上行通信采用四相相移键控（QPSK）调制与匹配滤波器检测器时的 BER 结果。如第 III-B 节所述，当多用户信道接近正交矩阵并在奇异值分布上表现稳定时出现有利传播；该性质使匹配滤波器检测器在天线数增加时渐近最优 [35], [36]，从而对大规模 MIMO 系统越来越有吸引力。如图 11 所示，NUA 相比 URA 取得显著的 BER 改善，这归因于其更强的有利传播。特别地，所提 GS+AT 方法在不同天线数场景下均给出最佳 BER 性能。

**图 9**：不同阵列分布下多用户信道平均每用户容量的比较（SNR 变化）。
**图 10**：$20$ dB SNR 下不同阵列分布的平均每用户容量比较：(a) 阵元数的影响；(b) 阵元间距的影响；(c) UE 数的影响。
**图 11**：$20$ dB SNR 下不同阵列分布的 BER 比较。

### C. 波束斜视评估

我们在宽带场景下比较 URA 与 NUA 在波束斜视效应方面的性能。沿用第 VI-A 节的实验设置，只是把阵元间距设为半波长，以便在不考虑 URA 栅瓣影响的情况下聚焦波束斜视评估。考虑带宽 $B=1$ GHz、$Q=1024$ 个子载波的宽带场景。第 $k$ 个 UE 信道第 $l$ 条路径的俯仰角 $\theta_{l,k}$、方位角 $\varphi_{l,k}$ 与时延 $\tau_{l,k}$ 分别配置为 $30^\circ$、$30^\circ$ 与 100 ns。

如第 V 节所述，波束斜视角受两个因素影响，即子载波相对载频的频率偏移与天线相对阵列中心的位置偏移。为量化波束斜视与这两个因素的关系，我们用（26）与（27）分别度量跨全部子载波与跨全部天线的平均波束斜视角。图 12 与图 13 验证了频率或位置偏移更大时斜视波束更严重。此外，在图 12 与图 13 中 HuD 在平均波束斜视角上优于 URA；但 HuD 落后于其他典型 NUA（包括 GAM、DiscGAM 与 SPM），后者具有阵元排布更密集的圆形孔径。图 12 与图 13 的结果表明：在给定带宽下，阵列内更紧凑的阵元分布可实现更强的抗波束斜视鲁棒性。

**图 12**：第 $q$ 个子载波处跨全部天线的平均波束斜视角 $\Delta_{l,k}^{(q)}$（$\forall q\in\langle Q\rangle$，$Q=1024$）的比较。
**图 13**：第 $m$ 个天线处跨全部子载波的平均波束斜视角 $\Delta_{l,k}^{(m)}$（$\forall m\in\langle M\rangle$，$M=225$）的比较。

## VII. 结论与未来工作

本文为大规模 MIMO 系统提出了具有大阵元间距的 NUA。我们从信号域互信息最优的星座整形中汲取灵感，引入了若干受星座启发的 NUA 设计，包括 HuD、GAM、DiscGAM 与 SPM 分布。实验结果表明 NUA 在栅瓣抑制、孔径效率、有利传播与信道容量方面优于传统 URA。在宽带场景中，NUA 因其更紧凑的空间分布而对波束斜视表现出更强鲁棒性。本工作的关键贡献是 EMIT 框架，它在天线阵列的空间采样图样与 MIMO 信道容量之间建立了有原理的联系。通过认识到波束图样是空间阵元分布的可逆傅里叶变换，我们把阵列设计表述为同时关于阵列几何与激励剖面的容量最大化问题，由此产生两种互补的整形策略——幅度加权与几何整形——及其联合优化。数值结果证实，所提基于 EMIT 的整形方案在 NUA 几何本身之外还带来可观的容量增益。

未来工作仍有若干有前景的方向。第一，本文提出的 EMIT 框架是迈向信息论阵列优化的第一步，将其扩展到更一般的信道模型与 NUA 图样值得进一步研究。第二，NUA 对通感一体化（ISAC）、无蜂窝大规模 MIMO 与非地面网络（NTN）等新兴应用具有巨大潜力——这些系统的架构本身固有非均匀间距的天线部署。第三，空间采样与星座整形之间的类比，为在统一信息论目标下联合优化天线几何与调制提供了可能。最后，在硬件测试平台上的实验验证将为 NUA 的实际应用提供有价值的洞见。

## 图注与表注

**图 1**：URA 与具有 GAM、DiscGAM、SPM、HuD 分布的 NUA 的阵元图样示意（相同孔径内各含 $M=225$ 个阵元）。
**图 2**：归一化阵列因子幅值比较（URA 与四种 NUA；极坐标，俯仰 $[0^\circ,90^\circ]$、方位 $[0^\circ,360^\circ]$；第 1、2 行对应 $\epsilon=1$ 与 $\epsilon=5$）。
**图 3**：归一化阵列因子幅值比较（方位固定 $0^\circ$，俯仰 $[-90^\circ,90^\circ]$；第 1、2 行对应 $\epsilon=1$ 与 $\epsilon=5$）。
**图 4**：AE 随阵元间距 $d=\epsilon\lambda$ 的变化（URA 与四种 NUA）。
**图 5**：未施加与施加幅度加权的归一化阵列因子（$N=32$ 半波长均匀线阵，Taylor 窗，旁瓣 $-30$ dB）。
**图 6**：APU 第 $n$ 次迭代的阵元更新示意（所选天线集 $M=9$、候选天线集 $T=5$）。
**图 7**：不同阵列分布下多用户信道条件数比较（(a) 阵元数；(b) 阵元间距；(c) UE 数）。
**图 8**：不同阵列分布下 CCM 特征值 CDF 比较（$\epsilon=1$ 与 $\epsilon=5$）。
**图 9**：不同阵列分布下平均每用户容量随 SNR 的变化（容量界与 MRC 容量）。
**图 10**：$20$ dB SNR 下平均每用户容量比较（(a) 阵元数；(b) 阵元间距；(c) UE 数）。
**图 11**：$20$ dB SNR 下不同阵列分布的 BER 比较。
**图 12**：各子载波处跨全部天线的平均波束斜视角（$Q=1024$）。
**图 13**：各天线处跨全部子载波的平均波束斜视角（$M=225$）。

**表注**：本文原**无表格**（仅含图 1—13 与算法 1—2），故无逐格表格转录项；算法 1 与算法 2 已按原文逐行转录。图 2—4、7—13 的数值/曲线结论以正文描述为准。

## 参考文献

> 以下按原文编号 [1]—[36] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “¨”“´” 等变音伪影已按常规写法整理，书目内容未改动。

[1] C. E. Shannon, “Communication in the presence of noise,” Proc. IRE, vol. 37, no. 1, pp. 10–21, 1949.

[2] A. J. Jerri, “The Shannon sampling theorem–Its various extensions and applications: A tutorial review,” Proc. IEEE, vol. 65, no. 11, pp. 1565–1596, 1977.

[3] X. Zhang, K. Fan, D. Yang, Q. Tan, L. Liu, and G. Q. Luo, “A wideband hybrid decoupling scheme using absorbing structures and periodic surfaces for MIMO antenna arrays,” IEEE Antennas Wireless Propag. Lett., vol. 25, no. 3, pp. 1269–1273, 2026.

[4] Q. Luo, H. Wen, G. Chen, Z. Liu, P. Xiao, Y. Ma, and A. Maaref, “A novel non-coherent SCMA with massive MIMO,” IEEE Wireless Communications Letters, vol. 11, no. 11, pp. 2250–2254, 2022.

[5] E. Shtaiwi, H. Zhang, A. Abdelhadi, N. Al-Dhahir, M. Debbah, and Z. Han, “Channel estimation for RIS-assisted MIMO systems with hardening effects,” IEEE Trans. Veh. Technol., vol. 73, no. 11, pp. 15 941–15 954, 2024.

[6] E. Anarakifirooz and S. Loyka, “Structural design of non-uniform linear arrays for favorable propagation in massive MIMO,” IEEE Commun. Lett., vol. 27, no. 1, pp. 367–371, 2023.

[7] G. Xia, P. Xiao, Q. Luo, B. Ji, Y. Zhang, and H. Zhou, “Joint location and velocity estimation and fundamental CRLB analysis for cell-free MIMO-ISAC,” IEEE Trans. Commun., vol. 74, pp. 7357–7374, 2026.

[8] E. J. Candès and M. B. Wakin, “An introduction to compressive sampling,” IEEE Signal Process. Mag., vol. 25, no. 2, pp. 21–30, 2008.

[9] D. L. Donoho, “Compressed sensing,” IEEE Trans. Inf. Theory, vol. 52, no. 4, pp. 1289–1306, 2006.

[10] M. Mishali and Y. C. Eldar, “From theory to practice: Sub-Nyquist sampling of sparse wideband analog signals,” IEEE J. Sel. Topics Signal Process., vol. 4, no. 2, pp. 375–391, 2010.

[11] E. Schrödinger, What is Life? The Physical Aspect of the Living Cell. Cambridge, UK: Cambridge University Press, 1944.

[12] H. Zhang, W. Wu, Q. Cheng, Q. Chen, Y.-H. Yu, and D.-G. Fang, “Reconfigurable reflectarray antenna based on hyperuniform disordered distribution,” IEEE Trans. Antennas Propag., vol. 70, no. 9, pp. 7513–7523, 2022.

[13] K. Tang, Y. Wang, S. Wang, D. Gao, H. Li, X. Liang, P. Sebbah, Y. Li, J. Zhang, and J. Shi, “Hyperuniform disordered parametric loudspeaker array,” Phys. Rev. Appl., vol. 19, no. 5, 2023, Art. no. 054035.

[14] H. Zhang, Q. Cheng, H. Chu, O. Christogeorgos, W. Wu, and Y. Hao, “Hyperuniform disordered distribution metasurface for scattering reduction,” Appl. Phys. Lett., vol. 118, no. 10, 2021, Art. no. 101601.

[15] O. Christogeorgos, H. Zhang, Q. Cheng, and Y. Hao, “Extraordinary directive emission and scanning from an array of radiation sources with hyperuniform disorder,” Phys. Rev. Appl., vol. 15, no. 1, 2021, Art. no. 014062.

[16] S. Torquato, G. Zhang, and F. H. Stillinger, “Ensemble theory for stealthy hyperuniform disordered ground states,” Phys. Rev. X, vol. 5, no. 2, 2015, Art. no. 021020.

[17] Z. Mheich, L. Wen, P. Xiao, and A. Maaref, “Design of SCMA codebooks based on golden angle modulation,” IEEE Trans. Veh. Technol., vol. 68, no. 2, pp. 1501–1509, 2019.

[18] P. Larsson, “Golden angle modulation,” IEEE Wireless Commun. Lett., vol. 7, no. 1, pp. 98–101, 2018.

[19] H. Chu, “Is spiral modulation really useful?” M.S. thesis, The University of British Columbia, Vancouver, Canada, 2016.

[20] B. Wang, M. Jian, F. Gao, G. Y. Li, and H. Lin, “Beam squint and channel estimation for wideband mmwave massive MIMO-OFDM systems,” IEEE Trans. Signal Process., vol. 67, no. 23, pp. 5893–5908, 2019.

[21] L. Ge, L. Chen, X. Jiang, W. Zhu, Q. Qin, and X. Liu, “Robust wideband channel estimation for mmwave massive MIMO systems with beam squint,” in Proc. IEEE Wireless Commun. Netw. Conf., 2025, pp. 1–6.

[22] B. Wang, F. Gao, S. Jin, H. Lin, and G. Y. Li, “Spatial- and frequency-wideband effects in millimeter-wave massive MIMO systems,” IEEE Trans. Signal Process., vol. 66, no. 13, pp. 3393–3406, 2018.

[23] L. Chen, X. Jiang, P. Xiao, X. Liu, and M. Haardt, “Structured tensor decomposition for FDD massive MIMO downlink channel reconstruction,” IEEE Trans. Signal Process., vol. 73, pp. 887–902, 2025.

[24] C. Qian, X. Fu, N. D. Sidiropoulos, and Y. Yang, “Tensor-based channel estimation for dual-polarized massive MIMO systems,” IEEE Trans. Signal Process., vol. 66, no. 24, pp. 6390–6403, 2018.

[25] A. Vosoogh and P. S. Kildal, “Simple formula for aperture efficiency reduction due to grating lobes in planar phased arrays,” IEEE Trans. Antennas Propag., vol. 64, no. 6, pp. 2263–2269, 2016.

[26] P. S. Kildal, “Foundations of antennas: A unified approach for line-of-sight and multipath,” Gothenburg, Sweden: Kildal Antenn AB, 2013.

[27] Q. H. Spencer, A. L. Swindlehurst, and M. Haardt, “Zero-forcing methods for downlink spatial multiplexing in multi-user MIMO channels,” IEEE Trans. Signal Process., vol. 52, no. 2, pp. 461–471, 2004.

[28] D. Tuzi, T. Delamotte, and A. Knopp, “Satellite swarm-based antenna arrays for 6G direct-to-cell connectivity,” IEEE Access, vol. 11, pp. 36 907–36 928, 2023.

[29] M. Gharavi-Alkhansari and A. B. Gershman, “Fast antenna subset selection in MIMO systems,” IEEE Trans. Signal Process., vol. 52, no. 2, pp. 339–347, 2004.

[30] M. Palaiologos, M. H. C. García, A. Kakkavas, R. A. Stirling-Gallacher, and G. Caire, “Robust non-uniform LoS MIMO array design,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13 202–13 218, 2024.

[31] G. Kéri, “The Sherman-Morrison formula for the determinant and its application for optimizing quadratic functions on condition sets given by extreme generators,” in Optimization Theory: Recent Developments from Mátraháza. Springer, 2001, pp. 119–138.

[32] D. P. Bertsekas, Nonlinear Programming. Cambridge, MA, USA: MIT Press, 1999.

[33] F. Pasic, M. Hofer, M. Mussbah, S. Sangodoyin, S. Caban, S. Schwarz, T. Zemen, M. Rupp, A. F. Molisch, and C. F. Mecklenbräuker, “Millimeter wave MIMO channel estimation using sub-6 GHz out-of-band information,” IEEE Trans. Commun., vol. 73, no. 11, pp. 10 692–10 708, 2025.

[34] D. W. Matolak and R. Sun, “Air-ground channel characterization for unmanned aircraft systems–Part I: Methods, measurements, and models for over-water settings,” IEEE Trans. Veh. Technol., vol. 66, no. 1, pp. 26–44, 2016.

[35] P. Xiao and M. Sellathurai, “Improved linear transmit processing for single-user and multi-user MIMO communications systems,” IEEE Trans. Signal Process., vol. 58, no. 3, pp. 1768–1779, 2009.

[36] H. Yang and T. L. Marzetta, “Performance of conjugate and zero-forcing beamforming in large-scale antenna systems,” IEEE J. Sel. Areas Commun., vol. 31, no. 2, pp. 172–179, 2013.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含三条贡献、组织结构与记号）；第 II 节信号模型（式（1）—（5），图 1）；第 III 节非均匀阵列的优势（A 无栅瓣效应：式（6）（7），图 2—4；B 有利传播：式（8）—（11））；第 IV 节非均匀阵列的整形（A 几何整形：式（12）—（15）、算法 1、图 6；B 幅度加权：式（16）—（21）、算法 2、图 5）；第 V 节宽带场景扩展（式（22）—（28））；第 VI 节实验结果（A 信道特性：图 7、8；B 系统级性能：图 9—11；C 波束斜视：图 12、13）；第 VII 节结论与未来工作；图 1—13 图注与表注；参考文献 [1]—[36] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—13 图像本体未复制（站点不上传图片），仅中文图注与正文数值/趋势；③**原文无表格**，故无表格逐格转录项（已在图注与表注中说明）；④作者简介与版权声明不在正文范围，未收录；⑤原文式（9）—（11）与（16）等处的 $H$ 与 $\mathbf H$ 混排、式（10）分母求和符号等排版细节按上下文整理，未改公式内容。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
