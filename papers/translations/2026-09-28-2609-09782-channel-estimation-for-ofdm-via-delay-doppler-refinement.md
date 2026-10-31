---
layout: page
title: "基于时延-多普勒细化的 OFDM 信道估计｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-09782-channel-estimation-for-ofdm-via-delay-doppler-refinement/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e28725de96ec4c98/) · [原文 arXiv](https://arxiv.org/abs/2609.09782) · [全部目录](/papers/catalog/)

# 基于时延-多普勒细化的 OFDM 信道估计

**原题：** Channel Estimation for OFDM via Delay-Doppler Refinement  
**作者：** Mingcheng Nie（*）、Hao Chang（*）、Xiaoqi Zhang（†）、Junkai Liu（‡）、Wibowo Hardjawana（*）、Branka Vucetic（*）、Yonghui Li（*）  
**单位：** * 悉尼大学（The University of Sydney，澳大利亚悉尼）；† 悉尼科技大学（University of Technology Sydney，澳大利亚悉尼）；‡ 复旦大学（上海，中国）。（Invited Paper）  
**版本：** arXiv:2609.09782v1（cs.IT），2026-09-09，原文 6 页（含图 1—2；原文无表格）。  
**范围与状态：** 全文中文译稿：摘要、第 I—V 节、图 1—2 图注、参考文献 [1]—[12] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "2026-09-28"；本地 PDF 为 **arXiv:2609.09782v1 [cs.IT]，2026-09-09**，"2026-09-28" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

本文针对正交频分复用（OFDM）系统提出一种新颖的信道估计（CE）算法，利用**时延—多普勒（delay-Doppler，DD）域**信道的独特特性。具体地，通过只关注时频（TF）域信道矩阵的非零元素，以紧凑形式推导时频域输入—输出关系（IOR）。基于该紧凑 IOR，首先用线性最小均方误差估计器进行粗粒度 TF 域信道估计；随后通过酉变换把所得 TF 域估计变换到 DD 域进一步细化。我们揭示**有效 DD 域信道矩阵可视为具有不同相移的多个 DD 域信道响应的聚合**，从而可借助阈值法高精度估计 DD 域信道参数。所估 DD 域信道参数随后用于构造 TF 域信道的精细化估计。数值结果表明，在相同导频部署下，所提方法相比传统 OFDM 信道估计技术可获得显著性能增益。

## I. 引言

正交频分复用（OFDM）因对频率选择性衰落的鲁棒性与实现简单，已被现代无线网络广泛采用 [1]。然而 OFDM 的成功依赖严格的子载波正交性，这在高移动性场景中变得不现实 [2], [3]。此类场景下高多普勒效应在各子载波上引入非均匀频移，破坏子载波间正交性并造成严重载波间干扰（ICI）；此外，信道相干时间缩短与高谱效所需的有限导频资源，使传统时频（TF）域估计方法出现显著性能损失 [4], [5]。近期，时延—多普勒（DD）域信道建模及相关波形（如正交时频空间调制 OTFS [6]）因能在高移动性信道上实现可靠通信而受到广泛关注。通过把快速时变的 TF 信道变换为准静态、稀疏的 DD 表示，DD 通信为信道估计（CE）提供了新视角。例如，基于嵌入导频的 DD 域 CE 方案 [7] 利用 DD 域信道响应的准静态特性获得准确估计。

然而 DD 域信道估计依赖特定的 DD 域导频安排 [8]，这与实际 OFDM 帧结构不兼容。例如常用的 DD 域嵌入导频 [7] 会扩散到整个 TF 域，对 OFDM 系统中的信息符号造成相当干扰。这自然引出一个基本问题：**能否在仍使用 TF 域发送的 OFDM 导频的同时利用 DD 域信道的优势？** 若能有效回答该问题，将显著提升传统 OFDM 性能，但仅有少量研究探索此方向。例如 [9] 为 OTFS 提出跨域信道估计（CDCE）方法：先在 TF 域通过单抽头均衡（STE）做信道估计，再利用互相关函数在 DD 域细化；但 [9] 假设 TF 域信道 ICI 可忽略，实践中造成模型失配，从而出现严重误差底。相反，我们先前工作 [10] 为 OFDM 系统提出一种新颖 CDCE，显著提升估计性能且不出现由 ICI 引起的误差底：先把 TF 域导频序列与接收信号变换到 DD 域，通过二维（2D）扭曲卷积做粗估计；再把 TF 域估计表述为最小二乘问题，并根据字典矩阵维数通过稀疏恢复或伪逆求解。

本文针对存在高信道多普勒的 OFDM 传输，提出另一种基于 **DD 域细化**的 CE 方法。所提方法先用线性最小均方误差（LMMSE）估计器做粗粒度 TF 域信道估计，随后把估计变换到 DD 域进一步细化。特别地，我们揭示：在整数信道时延与多普勒条件下，有效 DD 域信道矩阵可视为具有不同相移的多个 DD 域信道响应的聚合。据此，我们提出基于阈值的 DD 信道参数估计，并应用于有效 DD 域信道矩阵的每一列；随后把各列估计得到的参数合并，用于高精度构造 TF 域信道矩阵。数值结果表明，按归一化均方误差（NMSE）衡量，所提方法相比传统 OFDM 信道估计方案显著提升信道估计性能。

**记号**：$(\cdot)^H$、$(\cdot)^*$ 与 $(\cdot)^T$ 分别表示 Hermitian、共轭与转置；$\operatorname{Tr}\{\cdot\}$ 与 $\operatorname{vec}(\cdot)$ 表示矩阵的迹与向量化；$[\cdot]_N$ 表示关于 $N$ 的取模运算；$\mathbf F_N$ 表示 $N\times N$ 的归一化离散傅里叶变换（DFT）矩阵；$\mathbf I_M$ 表示 $M\times M$ 单位矩阵；“$\otimes$”表示 Kronecker 积算子。

## II. 系统模型

### A. 双选择性信道上的 OFDM 传输

我们考虑一个 OFDM 系统，含 $M'$ 个子载波（子载波间隔 $\Delta f$）与 $N$ 个 OFDM 符号，每个符号持续 $T$。系统工作在临界采样条件下，即 $\Delta f=1/T$。发射符号在 TF 域表示为 $\mathbf X'_{\mathrm{TF}}\in\mathbb C^{M'\times N}$。沿频率维施加逆 DFT（IDFT）得到时域发射信号 $\mathbf S'$：

$$
\mathbf S'=\mathbf F_{M'}^H\mathbf X'_{\mathrm{TF}}.\tag{1}
$$

对每个 OFDM 符号附加长度为 $L_{\mathrm{CP}}$ 的循环前缀（CP），得

$$
\mathbf S=\mathbf A_{\mathrm{CP}}\mathbf S'=\mathbf A_{\mathrm{CP}}\mathbf F_{M'}^H\mathbf X'_{\mathrm{TF}},\tag{2}
$$

写成向量形式为

$$
\mathbf s=(\mathbf I_N\otimes\mathbf A_{\mathrm{CP}})\mathbf s'=(\mathbf I_N\otimes\mathbf A_{\mathrm{CP}}\mathbf F_{M'}^H)\mathbf x'_{\mathrm{TF}},\tag{3}
$$

其中 $\mathbf s\in\mathbb C^{MN\times1}$ 表示插入 OFDM CP 后的时域发射信号，$M=M'+L_{\mathrm{CP}}$；$\mathbf A_{\mathrm{CP}}=[\mathbf G_{\mathrm{CP}},\mathbf I_{M'}]^T\in\mathbb R^{M\times M'}$ 为 OFDM CP 添加矩阵，其中 $M'\times L_{\mathrm{CP}}$ 的 $\mathbf G_{\mathrm{CP}}$ 包含单位矩阵 $\mathbf I_{M'}$ 的最后 $L_{\mathrm{CP}}$ 列。在上述操作之上，我们对 OFDM 符号序列 $\mathbf s$ 再施加一个 CP，以确保推导与 OTFS 的底层变换一致。记 $\widetilde{\mathbf A}_{\mathrm{CP}}=[\widetilde{\mathbf G}_{\mathrm{CP}},\mathbf I_{MN}]^T\in\mathbb R^{(MN+L_{\mathrm{CP}})\times MN}$ 为 OTFS CP 添加矩阵，其中 $MN\times L_{\mathrm{CP}}$ 的 $\widetilde{\mathbf G}_{\mathrm{CP}}$ 与 $\mathbf G_{\mathrm{CP}}$ 结构类似。于是有

$$
\tilde{\mathbf s}=\widetilde{\mathbf A}_{\mathrm{CP}}\mathbf s=\widetilde{\mathbf A}_{\mathrm{CP}}(\mathbf I_N\otimes\mathbf A_{\mathrm{CP}})\mathbf s'.\tag{4}
$$

随后，通过施加脉冲成形 $p(t)$ 可得连续时域发射信号

$$
s(t)=\sum_{n=-L_{\mathrm{CP}}}^{MN-1}\tilde s[n]p(t-nT_s),\tag{5}
$$

其中 $\tilde s[n]$ 为 $\tilde{\mathbf s}$ 的第 $n$ 个元素，$T_s$ 为时域采样周期，满足 $T_s=T/M'$。这里我们关注时变信道，其 DD 域稀疏表示为 $h(\tau,\nu)=\sum_{p=1}^{P}h_p\delta(\tau-\tau_p)\delta(\nu-\nu_p)$，其中 $h_p$、$\tau_p=(l_p+\imath_p)\frac{1}{M'\Delta f}$ 与 $\nu_p=(k_p+\kappa_p)\frac{1}{NT}$ 分别表示第 $p$ 条路径的信道系数、时延与多普勒频移；$l_p$ 与 $k_p$ 为整数时延与整数多普勒索引，$-1/2\le\imath_p\le1/2$ 与 $-1/2\le\kappa_p\le1/2$ 为分数时延与分数多普勒索引。为简化，假定传输具有足够的时延与多普勒分辨率，即分数时延与分数多普勒索引为零。

经历时变信道后，连续时域接收信号 $r(t)$ 可表示为

$$
r(t)=\sum_{p=1}^{P}h_ps(t-\tau_p)e^{j2\pi\nu_p(t-\tau_p)}+w(t),\tag{6}
$$

其中 $w(t)$ 为零均值、方差 $N_0$ 的复加性白高斯噪声（AWGN）过程。经匹配滤波后得到离散时间表示 $\tilde r[m]$，其第 $m$ 个元素为

$$
\tilde r[m]=\sum_{n=-L_{\mathrm{CP}}}^{MN-1}\tilde s[n]g[m,n]+w[m].\tag{7}
$$

这里定义有效时域信道为

$$
g[m,n]\triangleq\sum_{p=1}^{P}h_pe^{j2\pi n\nu_pT_s}A^*((n-m)T_s+\tau_p,\nu_p),\tag{8}
$$

其中 $A(\tau_p,\nu_p)$ 为脉冲 $p(t)$ 关于时延 $\tau_p$ 与多普勒频移 $\nu_p$ 的模糊函数，定义为

$$
A(\tau_p,\nu_p)\triangleq\int_{-\infty}^{\infty}p(t)p^*(t-\tau_p)e^{-j2\pi\nu_p(t-\tau_p)}\,\mathrm dt.\tag{9}
$$

把全部接收符号堆叠为向量并去除 OTFS CP，得接收信号的紧凑表示：

$$
\mathbf r=\widetilde{\mathbf R}_{\mathrm{CP}}\tilde{\mathbf r}=\widetilde{\mathbf R}_{\mathrm{CP}}\sum_{p=1}^{P}\mathbf G_p\tilde{\mathbf s}+\mathbf w=\widetilde{\mathbf R}_{\mathrm{CP}}\mathbf G\widetilde{\mathbf A}_{\mathrm{CP}}\mathbf s+\mathbf w=\mathbf G_T\mathbf s+\mathbf w,\tag{10}
$$

其中 $\mathbf G_p$ 表示时域信道矩阵 $\mathbf G$ 的第 $p$ 个可分辨路径分量，$\mathbf G$ 的 $(m,n)$ 元素由（8）给出。OTFS CP 去除矩阵定义为 $\widetilde{\mathbf R}_{\mathrm{CP}}\triangleq[\mathbf 0_{MN\times L_{\mathrm{CP}}},\mathbf I_{MN}]$，$\mathbf G_T\in\mathbb C^{MN\times MN}$ 表示去除 OTFS CP 后的有效时域信道矩阵。注意（10）及下文中我们复用 $\mathbf w$ 表示噪声向量，因为它们服从相同分布。进一步从接收信号中去除 OFDM CP，得

$$
\mathbf r'=(\mathbf I_N\otimes\mathbf R_{\mathrm{CP}})\mathbf r=(\mathbf I_N\otimes\mathbf R_{\mathrm{CP}})\mathbf G_T(\mathbf I_N\otimes\mathbf A_{\mathrm{CP}})\mathbf s',\tag{11}
$$

其中 $\mathbf R_{\mathrm{CP}}\triangleq[\mathbf 0_{M'\times L_{\mathrm{CP}}},\mathbf I_{M'}]$ 表示 OFDM CP 去除矩阵。

随后，分别对时域信号 $\mathbf r$ 与 $\mathbf r'$ 施加 DFT，得到去除 OTFS 与 OFDM CP 后的等效 TF 域接收信号：

$$
\mathbf y_{\mathrm{TF}}=(\mathbf I_N\otimes\mathbf F_M)\mathbf G_T\left(\mathbf I_N\otimes\mathbf F_M^H\right)\mathbf x_{\mathrm{TF}}+\mathbf w,\tag{12}
$$

$$
=\mathbf H_{\mathrm{TF}}\mathbf x_{\mathrm{TF}}+\mathbf w,\tag{13}
$$

$$
\mathbf y'_{\mathrm{TF}}=(\mathbf I_N\otimes\mathbf F_{M'}\mathbf R_{\mathrm{CP}})\mathbf G_T(\mathbf I_N\otimes\mathbf A_{\mathrm{CP}}\mathbf F_{M'}^H)\mathbf x'_{\mathrm{TF}}+\mathbf w,\tag{14}
$$

$$
=\mathbf H'_{\mathrm{TF}}\mathbf x'_{\mathrm{TF}}+\mathbf w,\tag{15}
$$

其中 $\mathbf H_{\mathrm{TF}}\in\mathbb C^{MN\times MN}$ 与 $\mathbf H'_{\mathrm{TF}}\in\mathbb C^{M'N\times M'N}$ 分别表示去除 OTFS CP 与去除 OFDM CP 后的有效 TF 域信道矩阵。考虑矩形脉冲成形，$\mathbf H_{\mathrm{TF}}$ 与 $\mathbf H'_{\mathrm{TF}}$ 可分别表示为

$$
\mathbf H_{\mathrm{TF}}=\sum_{p=1}^{P}h_pe^{-j2\pi\frac{k_pl_p}{MN}}(\mathbf I_N\otimes\mathbf F_M)\boldsymbol\Delta^{k_p}\boldsymbol\Pi^{l_p}\left(\mathbf I_N\otimes\mathbf F_M^H\right),\tag{16}
$$

$$
\mathbf H'_{\mathrm{TF}}=(\mathbf I_N\otimes\mathbf F_{M'}\mathbf R_{\mathrm{CP}}\mathbf F_M^H)\mathbf H_{\mathrm{TF}}(\mathbf I_N\otimes\mathbf F_M\mathbf A_{\mathrm{CP}}\mathbf F_{M'}^H).\tag{17}
$$

更重要的是，这两个 TF 域发射符号之间的关系可表示为

$$
\mathbf x_{\mathrm{TF}}=(\mathbf I_N\otimes\mathbf F_M\mathbf A_{\mathrm{CP}}\mathbf F_{M'}^H)\mathbf x'_{\mathrm{TF}}.\tag{18}
$$

由（18）可见，由于 CP 的添加与去除，$\mathbf x_{\mathrm{TF}}$ 相比 $\mathbf x'_{\mathrm{TF}}$ 会沿频率维经历符号扩展；该效应源于 DFT 尺寸不匹配，即 $\mathbf F_M$ 与 $\mathbf F_{M'}$ 不同。因此在接收端 $\mathbf y_{\mathrm{TF}}$ 中不可避免地引入导频与数据符号之间的干扰。不过我们基于（13）中的模型进行信道估计，以获得适合后续跨域变换的结构化信道表示。

### B. TF 域有效信道矩阵的性质

本小节利用有效 TF 域信道矩阵 $\mathbf H_{\mathrm{TF}}$ 的结构性质，以支撑后续 TF 域信道估计。具体地，沿用常规 OFDM 设置，把 $\mathbf y_{\mathrm{TF}}$ 与 $\mathbf x_{\mathrm{TF}}$ 划分为 $N$ 个符号向量、每个含 $M$ 个样本（含 OFDM CP），即 $\mathbf y_{\mathrm{TF}}=[\mathbf y_0^T,\mathbf y_1^T,\ldots,\mathbf y_{N-1}^T]^T$、$\mathbf x_{\mathrm{TF}}=[\mathbf x_0^T,\mathbf x_1^T,\ldots,\mathbf x_{N-1}^T]^T$。信道矩阵 $\mathbf H_{\mathrm{TF}}$ 呈现如下特定结构：

$$
\mathbf H_{\mathrm{TF}}=\begin{bmatrix}\mathbf H_{\mathrm{TF}}^{0,0}&\mathbf 0&\mathbf 0&\cdots&\mathbf 0&\mathbf H_{\mathrm{TF}}^{0,1}\\ \mathbf H_{\mathrm{TF}}^{1,1}&\mathbf H_{\mathrm{TF}}^{1,0}&\mathbf 0&\cdots&\mathbf 0&\mathbf 0\\ \mathbf 0&\mathbf H_{\mathrm{TF}}^{2,1}&\mathbf H_{\mathrm{TF}}^{2,0}&\cdots&\mathbf 0&\mathbf 0\\ \vdots&\vdots&\vdots&\ddots&\vdots&\vdots\\ \mathbf 0&\mathbf 0&\mathbf 0&\cdots&\mathbf H_{\mathrm{TF}}^{N-2,0}&\mathbf 0\\ \mathbf 0&\mathbf 0&\mathbf 0&\cdots&\mathbf H_{\mathrm{TF}}^{N-1,1}&\mathbf H_{\mathrm{TF}}^{N-1,0}\end{bmatrix},\tag{19}
$$

其中 $\mathbf H_{\mathrm{TF}}^{j,0}$ 与 $\mathbf H_{\mathrm{TF}}^{j,1}$（$j=0,\ldots,N-1$）表示 $\mathbf H_{\mathrm{TF}}$ 的 $M\times M$ 子信道矩阵。需重点注意：$\mathbf H_{\mathrm{TF}}^{j,0}$ 是捕获多普勒效应所引 ICI 的**稠密**矩阵，而 $\mathbf H_{\mathrm{TF}}^{j,1}$ 对应多径时延造成的 ISI。基于 $\mathbf H_{\mathrm{TF}}$ 的结构，（13）中的 IOR 可按块表示为

$$
\mathbf y_{\mathrm{TF}}^{(i)}=\mathbf H_{\mathrm{TF}}^{(i)}\mathbf x_{\mathrm{TF}}^{(i)}+\mathbf w^{(i)},\tag{20}
$$

其中 $\mathbf x_{\mathrm{TF}}^{(i)}\in\mathbb C^{M\times1}$（$i=0,\ldots,N-1$）表示含 $M$ 个样本的第 $i$ 个 OFDM 符号。注意 $\mathbf H_{\mathrm{TF}}^{(i)}\in\mathbb C^{2M\times M}$ 与 $\mathbf y_{\mathrm{TF}}^{(i)}\in\mathbb C^{2M\times1}$ 分别表示相应信道矩阵与观测，可写为

$$
\mathbf H_{\mathrm{TF}}^{(i)}=\begin{bmatrix}\mathbf H_{\mathrm{TF}}^{i,0}\\ \mathbf H_{\mathrm{TF}}^{(i+1)_N,1}\end{bmatrix},\qquad \mathbf y_{\mathrm{TF}}^{(i)}=\begin{bmatrix}\mathbf y_{\mathrm{TF}}^{i,0}\\ \mathbf y_{\mathrm{TF}}^{(i+1)_N,1}\end{bmatrix}.\tag{21}
$$

值得注意的是，由于路径时延，第 $i$ 个 OFDM 符号会扩散到后续符号区间，因此 $\mathbf y_{\mathrm{TF}}^{(i)}$ 的总观测长度为 $2M$。按同样结构处理所有块，可通过以适当零填充聚合这些单独观测来构造整体接收信号 $\mathbf y_{\mathrm{TF}}$：

$$
\mathbf y_{\mathrm{TF}}=\begin{bmatrix}\mathbf y_{\mathrm{TF}}^{0,0}\\ \mathbf y_{\mathrm{TF}}^{1,1}\\ \mathbf 0\\ \vdots\\ \mathbf 0\\ \mathbf 0\end{bmatrix}+\begin{bmatrix}\mathbf 0\\ \mathbf y_{\mathrm{TF}}^{1,0}\\ \mathbf y_{\mathrm{TF}}^{2,1}\\ \vdots\\ \mathbf 0\\ \mathbf 0\end{bmatrix}+\begin{bmatrix}\mathbf 0\\ \mathbf 0\\ \mathbf y_{\mathrm{TF}}^{2,0}\\ \vdots\\ \mathbf 0\\ \mathbf 0\end{bmatrix}+\cdots+\begin{bmatrix}\mathbf y_{\mathrm{TF}}^{0,1}\\ \mathbf 0\\ \mathbf 0\\ \vdots\\ \mathbf 0\\ \mathbf y_{\mathrm{TF}}^{N-1,0}\end{bmatrix}.\tag{22}
$$

## III. 基于 DD 域的 OFDM 信道估计

本节给出所提基于时延—多普勒细化的 OFDM 信道估计算法，流程与图 1 一致：先在 TF 域用全尺寸 LMMSE 获得粗估计，再经酉变换到 DD 域，利用有效 DD 信道矩阵的结构做阈值化与相位补偿，最后重建并变换回 TF 域得到精化估计。

### A. TF 域稠密 IOR

由于信道估计只需关注 $\mathbf H_{\mathrm{TF}}$ 的非零元素，下面利用 $\mathbf H_{\mathrm{TF}}$ 的结构推导 TF 域 IOR 的稠密表示。具体地，先把（13）改写为

$$
\mathbf y_{\mathrm{TF}}=\left(\mathbf x_{\mathrm{TF}}^T\otimes\mathbf I_{MN}\right)\operatorname{vec}\left(\mathbf H_{\mathrm{TF}}\right)+\mathbf w=\mathbf X_{\mathrm{TF}}\mathbf h_{\mathrm{TF}}+\mathbf w.\tag{23}
$$

类似地，（20）中的分块 IOR 可改写为

$$
\mathbf y_{\mathrm{TF}}^{(i)}=\left(\left(\mathbf x_{\mathrm{TF}}^{(i)}\right)^T\otimes\mathbf I_{2M}\right)\operatorname{vec}\left(\mathbf H_{\mathrm{TF}}^{(i)}\right)+\mathbf w^{(i)}=\mathbf X_{\mathrm{TF}}^{(i)}\mathbf h_{\mathrm{TF}}^{(i)}+\mathbf w^{(i)},\tag{24}
$$

其中 $\mathbf h_{\mathrm{TF}}^{(i)}\in\mathbb C^{2M^2\times1}$ 表示第 $i$ 个 OFDM 符号的等效信道向量，$\mathbf X_{\mathrm{TF}}^{(i)}\in\mathbb C^{2M\times2M^2}$ 为相应等效发射矩阵。由（20）—（24），可进一步把（23）改写为稠密形式：

$$
\mathbf y_{\mathrm{TF}}=\mathbf X_{d,\mathrm{TF}}\mathbf h_{d,\mathrm{TF}}+\mathbf w,\tag{25}
$$

其中 $\mathbf h_{d,\mathrm{TF}}\in\mathbb C^{2M^2N\times1}$ 为（23）中 $\mathbf h_{\mathrm{TF}}$ 的稠密格式：

$$
\mathbf h_{d,\mathrm{TF}}=\left[\left(\mathbf h_{\mathrm{TF}}^{(0)}\right)^T,\ldots,\left(\mathbf h_{\mathrm{TF}}^{(i)}\right)^T,\ldots,\left(\mathbf h_{\mathrm{TF}}^{(N-1)}\right)^T\right]^T,\tag{26}
$$

$\mathbf X_{d,\mathrm{TF}}\in\mathbb C^{MN\times2M^2N}$ 的结构为

$$
\mathbf X_{d,\mathrm{TF}}=\begin{bmatrix}\mathbf X_{\mathrm{TF}}^{0,0}&\mathbf 0&\mathbf 0&\cdots&\mathbf 0&\mathbf X_{\mathrm{TF}}^{0,1}\\ \mathbf X_{\mathrm{TF}}^{1,1}&\mathbf X_{\mathrm{TF}}^{1,0}&\mathbf 0&\cdots&\mathbf 0&\mathbf 0\\ \mathbf 0&\mathbf X_{\mathrm{TF}}^{2,1}&\mathbf X_{\mathrm{TF}}^{2,0}&\cdots&\mathbf 0&\mathbf 0\\ \vdots&\vdots&\vdots&\ddots&\vdots&\vdots\\ \mathbf 0&\mathbf 0&\mathbf 0&\cdots&\mathbf X_{\mathrm{TF}}^{N-2,0}&\mathbf 0\\ \mathbf 0&\mathbf 0&\mathbf 0&\cdots&\mathbf X_{\mathrm{TF}}^{N-1,1}&\mathbf X_{\mathrm{TF}}^{N-1,0}\end{bmatrix}.\tag{27}
$$

注意（24）中的 $\mathbf X_{\mathrm{TF}}^{(i)}$ 对应（27）中 $\mathbf X_{d,\mathrm{TF}}$ 的一个子矩阵，即

$$
\mathbf X_{\mathrm{TF}}^{(i)}=\left(\left(\mathbf x_{\mathrm{TF}}^{(i)}\right)^T\otimes\mathbf I_{2M}\right)=\left[\mathbf X_{\mathrm{TF}}^{i,0}\ \ \mathbf X_{\mathrm{TF}}^{(i+1)_N,1}\right].\tag{28}
$$

### B. TF 域估计

如图 1 所示，估计过程始于 TF 域，其输入包括接收信号 $\mathbf y_{\mathrm{TF}}$、等效导频矩阵 $\mathbf X_{d,\mathrm{TF}}$、信道先验均值 $\bar{\mathbf h}_{d,\mathrm{TF}}$ 及其协方差矩阵 $\bar{\mathbf C}_{d,\mathrm{TF}}$；$\bar{\mathbf h}_{d,\mathrm{TF}}$ 与 $\bar{\mathbf C}_{d,\mathrm{TF}}$ 通过蒙特卡洛仿真初始化。给定这些输入，通过全尺寸 LMMSE 估计器 $\mathbf V$ 得到粗信道估计，其表达式为 [11]

$$
\mathbf V=\bar{\mathbf C}_{d,\mathrm{TF}}\mathbf X_{d,\mathrm{TF}}^H\left(\mathbf X_{d,\mathrm{TF}}\bar{\mathbf C}_{d,\mathrm{TF}}\mathbf X_{d,\mathrm{TF}}^H+N_0\mathbf I_{MN}\right)^{-1}.\tag{29}
$$

随后应用 LMMSE 估计器得到后验估计 $\hat{\mathbf h}_{d,\mathrm{TF}}$ 与残差误差协方差矩阵 $\hat{\mathbf C}_{d,\mathrm{TF}}$：

$$
\hat{\mathbf h}_{d,\mathrm{TF}}=\bar{\mathbf h}_{d,\mathrm{TF}}+\mathbf V\left(\mathbf y_{\mathrm{TF}}-\mathbf X_{d,\mathrm{TF}}\bar{\mathbf h}_{d,\mathrm{TF}}\right),\tag{30}
$$

$$
\hat{\mathbf C}_{d,\mathrm{TF}}=\bar{\mathbf C}_{d,\mathrm{TF}}-\mathbf V\mathbf X_{d,\mathrm{TF}}\bar{\mathbf C}_{d,\mathrm{TF}}.\tag{31}
$$

值得注意的是，当 $\hat{\mathbf h}_{d,\mathrm{TF}}$ 为真实信道的无偏估计（即 $\mathbb E[\hat{\mathbf h}_{d,\mathrm{TF}}]=\mathbf h_{d,\mathrm{TF}}$）时，$\hat{\mathbf C}_{d,\mathrm{TF}}$ 的迹表示估计的均方误差（MSE）。完成 LMMSE 后，把后验估计 $\hat{\mathbf h}_{d,\mathrm{TF}}$ 经适当零填充重塑为矩阵形式 $\hat{\mathbf H}_{\mathrm{TF}}$，再变换到 DD 域作为进一步细化的初始信道估计。具体地，DD 域信道可由下式获得 [12]：

$$
\bar{\mathbf H}_{\mathrm{DD}}=\left(\mathbf F_N\otimes\mathbf F_M^H\right)\hat{\mathbf H}_{\mathrm{TF}}\left(\mathbf F_N^H\otimes\mathbf F_M\right),\tag{32}
$$

$$
=\sum_{p=1}^{P}h_pe^{-j2\pi\frac{k_pl_p}{MN}}\left(\mathbf F_N\otimes\mathbf I_M\right)\boldsymbol\Delta^{k_p}\boldsymbol\Pi^{l_p}\left(\mathbf F_N\otimes\mathbf I_M^H\right),\tag{33}
$$

其中 $\left(\mathbf F_N\otimes\mathbf F_M^H\right)$ 表示辛有限傅里叶变换（SFFT），$\left(\mathbf F_N^H\otimes\mathbf F_M\right)$ 为其逆变换。

### C. DD 域信道矩阵的性质

为便于 DD 域信道估计，先研究 DD 域信道矩阵的固有结构。具体地，任意 DD 域信道矩阵可刻画为

$$
\mathbf H_{\mathrm{DD}}=\begin{bmatrix}h_1&0&h_P\phi(l,k)&\cdots&0\\ 0&h_1\phi(l,k)&0&\cdots&h_2\phi(l,k)\\ h_2&0&h_1\phi(l,k)&\cdots&0\\ \vdots&\vdots&\vdots&\ddots&\vdots\\ h_P&0&0&\cdots&0\\ 0&h_P\phi(l,k)&0&\cdots&h_1\phi(l,k)\end{bmatrix},\tag{34}
$$

其中 $h_i$（$1\le i\le P$）表示第 $i$ 条路径的衰落系数，$\phi(l,k)$ 表示由相应时延与多普勒索引引入的相移。可以看到，$\mathbf H_{\mathrm{DD}}$ 的每一列对应 DD 域离散信道冲激响应的一次观测（带特定位置偏移与相移），这意味着 $\mathbf H_{\mathrm{DD}}$ 含 $MN$ 次 DD 域信道响应观测。不同观测间位置偏移的一个有用解释是：每次观测内的偏移对应于某个特定位置的导频，而不同观测的导频位置不同，并通过扭曲卷积在接收信号中引入相应偏移。换言之，可把其有效视为 $MN$ 个位置互不相同的并行导频，各自经历 DD 域信道，从而在 $\mathbf H_{\mathrm{DD}}$ 中产生相应观测。

为便于进一步说明，考虑两个例子：

- $\mathbf H_{\mathrm{DD}}$ 的第一列对应位于 $(l',k')=(0,0)$ 的导频，其观测直接反映无位置偏移的 DD 域信道响应。
- $\mathbf H_{\mathrm{DD}}$ 的第二列对应位于 $(l',k')=(1,0)$ 的导频，其观测为沿时延维偏移一个单位、并带相应相移的 DD 域信道响应。

上述现象源于 DD 域通信固有的扭曲卷积性质 [10]，在忽略噪声时可用下式数学刻画：

$$
Y_{\mathrm{DD}}[l,k]=\alpha_pX_{\mathrm{DD}}\left[[l-l_p]_M,[k-k_p]_N\right],\tag{35}
$$

其中 $Y_{\mathrm{DD}}$ 与 $X_{\mathrm{DD}}$ 分别表示逐符号接收与发射信号。注意 $\alpha_p$ 对应（34）中的非零元素，表示逐符号有效信道系数，它同时包含第 $p$ 条路径的衰落增益与相关相位旋转：

$$
\alpha_p=\begin{cases}h_p\exp\left(j2\pi\dfrac{k_p(l-l_p)}{MN}\right),&l-l_p\ge0,\\[6pt]h_p\exp\left(j2\pi\dfrac{k_p(l-l_p)}{MN}\right)\exp\left(-j2\pi\dfrac{k-k_p}{N}\right),&l-l_p<0.\end{cases}\tag{36}
$$

### D. DD 域细化

现在给出 DD 域信道估计方案。对含噪信道矩阵 $\bar{\mathbf H}_{\mathrm{DD}}$，可通过施加幅度阈值估计有效信道系数 $\alpha_p$：低于阈值的值被抑制为零。由于我们在 TF 域采用了 LMMSE 估计器，[7] 中的阈值 $3\sqrt{N_0}$ 不再适用。为此，我们基于 LMMSE 估计的平均 MSE 定义改进阈值：由（31）中的后验误差协方差矩阵计算 $\gamma=\frac{\operatorname{Tr}(\hat{\mathbf C}_{d,\mathrm{TF}})}{2M^2N}$，其中 $2M^2N$ 为 TF 域信道中非零元素总数。这里 $\gamma$ 表示 TF 域信道的平均估计误差，且该值在从 TF 域到 DD 域的酉变换下保持不变。因此把 DD 域阈值设为 $3\sqrt{\gamma}$。得到有效信道系数 $\alpha_p$ 的估计后，通过对 $\alpha_p$ 的估计施加相位补偿即可恢复衰落增益 $h_p$。具体地，由（35）（36）可见，相位旋转显式依赖 $Y_{\mathrm{DD}}$ 中的索引 $(l,k)$ 与信道冲激索引 $(l_p,k_p)$。由于 $(l_p,k_p)$ 未知，目标是根据 $Y_{\mathrm{DD}}$ 中的 $(l,k)$ 与 $X_{\mathrm{DD}}$ 中的 $(l',k')=([l-l_p]_M,[k-k_p]_N)$ 推断 $(l_p,k_p)$。值得注意的是，$Y_{\mathrm{DD}}$ 中的 $(l,k)$ 可由 $\mathbf H_{\mathrm{DD}}$ 的行索引推断，而 $X_{\mathrm{DD}}$ 中的 $(l',k')$ 可由 $\mathbf H_{\mathrm{DD}}$ 的列索引推断。同时利用 $(l,k)$ 与 $(l',k')$ 两组索引，即可有效确定 $(l_p,k_p)$，从而按（36）进行相位补偿。经阈值化与相位补偿后，得到 $MN$ 个 DD 域信道响应估计；下一步是对这些估计取平均，并再施加一次阈值化，以降低漏估与虚警的概率。DD 域估计的关键步骤总结于算法 1。

**算法 1**　DD 域细化

**输入**：$\bar{\mathbf H}_{\mathrm{DD}}$、$\gamma$。
**步骤**：
1: 置 $\bar H_{\mathrm{DD}}(i,j)=0$，$\forall|\bar H_{\mathrm{DD}}(i,j)|<\gamma$，$1\le i,j\le MN$。
2: 计算 $l'=[j-1]_M$、$k'=\lfloor\frac{j-1}{M}\rfloor$、$l=[i-1]_M$、$k=\lfloor\frac{i-1}{M}\rfloor$。
3: 计算 $l_p=[l-l']_M$、$k_p=[k-k'+k_{\max}]_N-k_{\max}$。
4: 把 $(l,k)$ 与 $(l_p,k_p)$ 代入（36）计算相位。
5: 补偿相位，对估计取平均。

得到估计的信道响应后，把估计的衰落增益与相应时延、多普勒索引代入（33）即可重建 DD 信道矩阵。随后把估计的 DD 域信道矩阵 $\hat{\mathbf H}_{\mathrm{DD}}$ 变换回 TF 域，得到精化的 TF 域信道矩阵：

$$
\tilde{\mathbf H}_{\mathrm{TF}}=\left(\mathbf F_N^H\otimes\mathbf F_M\right)\hat{\mathbf H}_{\mathrm{DD}}\left(\mathbf F_N\otimes\mathbf F_M^H\right).\tag{37}
$$

最后，把 $\tilde{\mathbf H}_{\mathrm{TF}}$ 代入（17）即得 $\mathbf H'_{\mathrm{TF}}$ 的估计。

**图 1**：CDCE 方案框图（TF 域 → DD 域、DD 域细化、DD → TF 域）。

## IV. 数值结果

本节通过数值仿真评估所提 CE 设计的性能。不失一般性，考虑 $M=N=16$ 的 OFDM 系统。每个信道实现由 $P=3$ 条独立可分辨路径建模；对每条路径，时延索引与多普勒索引分别在 $[0,l_{\max}]$ 与 $[-k_{\max},k_{\max}]$ 内均匀抽取，其中 $l_{\max}=2$、$k_{\max}=3$。每个信道系数独立取自零均值复高斯分布，方差为 $1/P$。此外采用格型 TF 导频图样 [10]：TF 域导频置于 $\mathbf x'_{\mathrm{TF}}$ 中并取全 1，数据符号取自单位功率 QPSK。信噪比（SNR）定义为 $1/N_0$；NMSE 定义为 $\mathrm{NMSE}=\|\hat{\mathbf H}-\mathbf H\|^2/\|\mathbf H\|^2$。

为评估所提 CE 方法，考虑若干传统 OFDM 信道估计方案作为基准。具体地，在导频位置基于（15）应用单抽头均衡（STE）估计信道状态信息（CSI），非导频位置 CSI 则由 TF 两个维度上最近的非零元素经线性插值恢复。分别采用基于最小二乘（LS）与 LMMSE 的 STE，记为 “ST-LS” 与 “ST-LMMSE”，其估计器为

$$
\hat{\mathbf h}'^{(i)}_{\mathrm{TF}}=\left(\left(\mathbf x'^{(i)}_{\mathrm{TF}}\right)^T\otimes\mathbf I_{M'}\right)^{\dagger}\mathbf y'^{(i)}_{\mathrm{TF}},\tag{38}
$$

$$
\hat{\mathbf h}'^{(i)}_{\mathrm{TF}}=\bar{\mathbf C}'^{(i)}_{\mathrm{TF}}\mathbf X'^{(i)H}_{\mathrm{TF}}\left(\mathbf X'^{(i)}_{\mathrm{TF}}\bar{\mathbf C}'^{(i)}_{\mathrm{TF}}\mathbf X'^{(i)H}_{\mathrm{TF}}+N_0\mathbf I_{M'}\right)^{-1}\mathbf y'_{\mathrm{TF}}.\tag{39}
$$

此外，采用全尺寸 LMMSE（FS-LMMSE）作为更强基准，即直接在（23）的稠密模型上应用（30）。图 2 给出所提 CE 方法与全部基准估计器的 NMSE 性能比较。可以看到，所提 CE 在不同 SNR 下一致优于其他所有方法。特别地，FS-LMMSE 取得中等性能，而所提 CE 因 DD 域细化取得显著更低的 NMSE；相反，依赖 STE 加插值的 ST-LMMSE 与 ST-LS 的 NMSE 在约 $-6$ dB 处饱和，因为它们未能考虑 ICI。

**图 2**：所提 CE 与传统 OFDM CE 方法的 NMSE 比较（不同 SNR 下所提方法、FS-LMMSE、ST-LMMSE 与 ST-LS）。

## V. 结论

本文利用 DD 域信道的优势，为传统 OFDM 系统提出一种新颖的 CE 方案。我们首先利用 TF 域信道矩阵的结构推导稠密 IOR；随后采用全尺寸 LMMSE 估计器获得粗粒度 TF 域信道估计，再将其变换到 DD 域进一步细化。在 DD 域中，利用 DD 域信道矩阵的结构，通过阈值化与相位补偿估计信道响应，并对不同观测所得的估计取平均。基于估计的信道参数重建 DD 域信道矩阵并变换回 TF 域，得到最终估计。仿真结果表明，所提方案在 NMSE 意义上一致优于传统 OFDM 估计器。

## 图注与表注

**图 1**：CDCE 方案框图（TF 域 → DD 域 → DD 域细化 → DD → TF 域）。
**图 2**：所提 CE 与传统 OFDM CE 方法的 NMSE 比较。

**表注**：本文原**无表格**（仅含图 1—2 与算法 1），故无逐格表格转录项；算法 1 已按原文逐行转录。

## 参考文献

> 以下按原文编号 [1]—[12] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的连字与断行伪影已按常规写法整理，书目内容未改动。

[1] J. Liu et al., “Fast computation of zero-forcing precoding for massive MIMO-OFDM systems,” IEEE Trans. Signal Process., vol. 72, pp. 912–927, Jan. 2024.

[2] M. Nie et al., “Toward standardizing OTFS: A candidate waveform for next-generation wireless networks,” IEEE Commun. Stand. Mag., pp. 1–12, Feb. 2026.

[3] X. Zhang et al., “Deep learning-based OTFS channel estimation and symbol detection with plug-and-play framework,” IEEE Trans. Commun., pp. 1–1, 2025.

[4] M. Nie et al., “Uplink multi-user OTFS: Transmitter design based on statistical channel information,” IEEE Trans. on Commun., 2025.（原文截断）

[5] M. Nie et al., “Joint channel estimation and detection for multi-user OTFS,” in Proc. IEEE Int. Conf. Commun. (ICC), 2024.（原文截断）

[6] R. Hadani et al., “Orthogonal time frequency space modulation,” in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), 2017, pp. 1–6.

[7] P. Raviteja et al., “Embedded pilot-aided channel estimation for OTFS in delay–Doppler channels,” IEEE Trans. Veh. Technol., vol. 68, no. 5, pp. 4906–4917, May 2019.

[8] M. Nie et al., “Improving channel estimation performance for uplink OTFS transmissions: Pilot design based on a posteriori Cramér-Rao bound,” in Proc. IEEE Int. Conf. Commun. Workshops (ICC Workshops), 2023, pp. 301–306.

[9] J. Hu et al., “Cross-domain channel estimation based serial interference cancellation in NOMA-OTFS system,” IEEE Commun. Lett., vol. 28, no. 7, pp. 1668–1672, Jul. 2024.

[10] M. Nie et al., “A novel cross-domain channel estimation scheme for OFDM,” in IEEE GLOBECOM Proceedings, 2025.

[11] R. Chong et al., “Cross-domain iterative detection for OTFS transmission with frequency domain equalization,” IEEE Trans. on Commun., Jun. 2025, early access.

[12] C. Liu et al., “Predictive precoder design for OTFS-enabled URLLC: A deep learning approach,” IEEE J. Sel. Areas Commun., vol. 41, no. 7, pp. 2245–2260, Jul. 2023.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 I 节引言（含记号）；第 II 节系统模型（A 双选择性信道 OFDM 传输，式（1）—（18）；B TF 域有效信道矩阵性质，式（19）—（22））；第 III 节基于 DD 域的 OFDM 信道估计（A TF 域稠密 IOR：式（23）—（28）；B TF 域估计：式（29）—（33）；C DD 域信道矩阵性质：式（34）；D DD 域细化：式（35）—（37），算法 1，图 1）；第 IV 节数值结果（式（38）—（39），图 2）；第 V 节结论；图 1—2 图注与表注；参考文献 [1]—[12] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—2 图像本体未复制（站点不上传图片），仅中文图注与正文说明；③**原文无表格**，故无表格渲染核对项；④作者简介与版权声明不在正文范围，未收录；⑤**原文参考文献 [4][5] 在 PDF 抽取文本中被截断**（缺卷期页码），已标注"（原文截断）"未擅自补全；⑥骨架版本日期 "2026-09-28" 与 PDF 实际 v1 2026-09-09 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
