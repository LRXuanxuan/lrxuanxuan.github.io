---
layout: page
title: "含直达链路的 RIS 辅助多用户毫米波 MIMO 信道估计｜中文全文译文"
permalink: /papers/translations/2026-09-29-2511-18009-channel-estimation-for-ris-aided-mu-mimo-mmwave-systems-with-direct-ch/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1f795c2b723534e5/) · [原文 arXiv](https://arxiv.org/abs/2511.18009) · [全部目录](/papers/catalog/)

# 含直达链路的 RIS 辅助多用户毫米波 MIMO 信道估计

**原题：** Channel Estimation for RIS-Aided MU-MIMO mmWave Systems With Direct Channel Links  
**作者：** Taihao Zhang、Zhendong Peng、Cunhua Pan（Senior Member, IEEE）、Hong Ren（Member, IEEE）、Jiangzhou Wang（Fellow, IEEE）  
**单位：** 东南大学移动通信国家重点实验室（南京，中国）；通讯作者：Cunhua Pan。  
**版本：** arXiv:2511.18009v1（eess.SP），2025-11-22，原文 13 页（含图 1—11、表 I）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、算法 1—3、引理 1、表 I（逐格）、图 1—11 图注与正文数值、参考文献 [1]—[35] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** ①骨架原写 "arXiv:2511.18009v1，2026-09-29"，本地 PDF 的 arXiv 版本日期为 **2025-11-22**，"2026-09-29" 应为站点推荐日期；本页版本信息按 PDF 更新。②作者 Zhendong Peng 的单位在 PDF 首页脚注中未单独给出（脚注只列出 Taihao Zhang、Cunhua Pan、Hong Ren、Jiangzhou Wang 四人的东南大学移动通信国家重点实验室单位与邮箱），故此处未擅自补充，待 Lead/原文核验。

## 摘要

本文针对存在直达链路（direct channels）的可重构智能表面（RIS）辅助多用户（MU）多输入多输出（MIMO）毫米波（mmWave）系统，提出一种三阶段统一信道估计策略，其中基站（BS）、用户与 RIS 均配备均匀平面阵列（UPA）。所提三阶段策略的有效性来自对用户导频信号序列与 RIS 向量的精心设计。具体地，在第 I 阶段，通过把 RIS 相移向量配置为相差 $\pi$ 来消除级联信道分量，从而估计所有用户的直达信道；第 II 阶段采用正交子空间投影获得等效信号矩阵，从而估计所有用户的用户—RIS 信道离开角（AoD）；第 III 阶段把使用相同导频的时隙信号合并，并把所得测量矩阵投影到由直达信道分量构成的正交补空间，以去除直达分量，从而避免直达信道到级联信道的误差传播。随后，我们利用所得等效矩阵中的稀疏性与相关性，估计 RIS—BS 信道的到达角（AoA）与各用户级联信道的剩余参数。仿真结果表明，所提方法比现有方法具有更好的估计性能。

**索引词**：可重构智能表面；信道估计；MIMO；毫米波。

## I. 引言

可重构智能表面（RIS）被视为 6G 中提升频谱效率与能量效率的有前景技术 [1]–[3]。RIS 由大量低成本反射单元组成 [4]，能够有效缓解严重的路径损耗与遮挡问题，为毫米波（mmWave）多输入多输出（MIMO）系统带来巨大收益。要发挥 RIS 的优势，获取准确的信道状态信息（CSI）至关重要 [5]。然而在 RIS 辅助 MIMO 系统中，用户与基站均配备多根天线，而 RIS 中大量无源反射单元缺乏信号处理能力，导致需要估计的参数数量众多 [6]。

由于信道稀疏、因而秩亏，已有工作利用压缩感知（CS）[7]、阵列处理 [8] 与贝叶斯框架 [9] 对毫米波系统的信道估计作出贡献。受结构化信道模型工作的启发，[5]、[10]–[15] 研究了 RIS 辅助毫米波系统的信道估计。[10] 利用稀疏性把用户—RIS—BS 级联信道的估计表述为稀疏信号恢复问题；[11] 采用离散傅里叶变换（DFT）方法估计多用户（MU）系统的到达角（AoA）；[12]、[13] 为 MU 毫米波系统显著降低了导频开销。

然而，上述信道估计工作均假设直达信道被遮挡。实际中级联信道与直达信道可能共存，导致接收信号中二者的分量相互耦合 [16]，同时估计级联与直达信道颇具挑战。已有少数研究考虑含直达链路的 RIS 辅助毫米波系统的信道估计，按 RIS 的行为可分为两类：**ON-OFF 方法** [17]–[19] 与 **Always-ON 方法** [20]–[23]。ON-OFF 框架先关断 RIS 以估计直达信道；重新激活 RIS 后，[18] 减去估计出的直达分量，随后基于信道矩阵的性质提出两种新算法估计级联信道，而 [19] 采用深度学习方法先估计复合信道，再从复合信道估计中减去直达信道估计得到级联信道。ON-OFF 方法存在两个严重问题：第一，在每个时隙频繁开关 RIS 并不实际 [24]，会造成反射功率损失与额外实现成本；第二，直达信道的估计误差会传播到级联信道估计（本文为方便称之为**直达—级联误差传播**），导致估计性能下降。Always-ON 框架避免频繁开关 RIS，可同时估计直达与级联信道。[20]–[22] 提出的方法面向 RIS 辅助多输入单输出（MISO）系统：[20] 通过设计相移避免开关 RIS，但这放大了等效级联信号中的噪声；为此 [21] 引入一种基于投影并结合精心设计 RIS 的方法；[22] 在已知先验信号分布的假设下，用最大似然估计（MLE）表示直达信道估计，并在整体估计问题中把它视为已知。[23] 面向多用户系统定制：先抑制直达信道以估计 RIS—BS 信道的 AoA，再把该估计 AoA 作为输入估计直达信道参数与剩余参数，实现了联合估计，但也在所估参数之间引入了误差传播。

这些研究作出了重要贡献。然而，针对存在直达链路的 RIS 辅助 MU-MIMO 系统的信道估计框架研究仍然匮乏。信号模型的复杂性与待估参数的巨大规模使同时估计直达与级联信道成为极其困难的任务。在此背景下，我们为 RIS 辅助 MU-MIMO 毫米波系统提出一种新的三阶段统一信道估计框架。本文主要贡献总结如下。

- **三阶段统一信道估计框架**：针对所考虑的 RIS 辅助 MU-MIMO 系统，提出一种三阶段统一信道估计框架，并通过精心设计用户导频信号序列与 RIS 向量实现直达与级联信道的分离。所提方法有三个显著优点：第一，不需要开关 RIS，从而降低频繁切换造成的功率损失；第二，把直达信道估计的噪声功率减半；第三，消除直达—级联误差传播效应，并使级联信道估计过程中的噪声功率保持不变。
- **信道估计协议设计**：所提信道估计协议精心设计以实现两个目标：(i) 解耦直达与级联信道，避免直达—级联误差传播；(ii) 最大化稀疏信号估计所需支撑集元素的使用率，从而降低导频开销。
- **三阶段信号处理**：在第 I 阶段，通过合并相差 $\pi$ 弧度的 RIS 相移的两个时隙信号来消除级联信道分量；在第 II 阶段，通过堆叠导频向量相同的信号并施加正交子空间投影来消除直达信道分量；在第 III 阶段，依据所设计的导频与 RIS 向量，先合并具有相同导频的时隙信号，再投影到直达信道分量的正交补空间，得到等效级联信号。
- **多用户场景下的低开销与低复杂度**：为降低多用户场景中的导频开销与复杂度，本工作有两项关键创新：第一，利用不同用户之间的共性，合并具有相同 RIS 等效向量的时隙信号得到测量矩阵，并用 UPA-DFT 方法（定义见脚注 1）估计 RIS—BS 信道的公共 AoA；第二，借助**等效虚拟单天线变换**（equivalent virtual single antenna，EVSA）思想——把 MIMO 毫米波信道估计转化为多个 MISO 毫米波信道的等效估计——采用矢量化 OMP 估计剩余参数。

> **脚注 1**：UPA-DFT 方法被定义为一种利用 UPA 型 DFT 矩阵码本并结合 Kronecker 积性质的角度估计技术。

**图 1**：RIS 辅助 MU-MIMO 毫米波通信系统示意（BS、RIS、用户 1/用户 2/用户 $k$，以及用户—BS 信道、用户—RIS 信道、RIS—BS 信道与 RIS 控制器）。

本文其余部分组织如下：第 II 节介绍系统模型；第 III 节给出所提策略的细节并分析导频开销；第 V 节给出仿真结果；最后第 VI 节给出结论。

> **原文疑点（章节编号）：** 原文该句写 "The simulation results are given in Section V. Finally, Section VI provides the conclusions."，而实际第 IV 节为 "Analysis of Pilot Overhead and Complexity"、第 V 节为 "Simulation Results"、第 VI 节为 "Conclusion"——组织说明与正文章节编号一致，但缺少对第 IV 节的说明，疑原文表述疏漏；此处照译并加注。

**记号**：向量与矩阵分别用粗体小写字母与粗体大写字母表示。符号 $\mathbf X^\ast$、$\mathbf X^T$、$\mathbf X^H$ 与 $\mathbf X^\dagger$ 分别表示矩阵 $\mathbf X$ 的共轭、转置、Hermitian 与伪逆；$\|\mathbf X\|_F$ 与 $\|\mathbf x\|_2$ 分别表示矩阵 $\mathbf X$ 的 Frobenius 范数与向量 $\mathbf x$ 的欧氏范数。$\operatorname{Diag}\{\mathbf x\}$ 是以向量 $\mathbf x$ 的元素为对角元素的对角矩阵，而 $\operatorname{diag}\{\mathbf X\}$ 表示由矩阵 $\mathbf X$ 的对角元素构成的向量。$\operatorname{vec}(\mathbf X)$ 表示把 $\mathbf X$ 的列堆叠而成的向量化。$[\mathbf x]_m$ 是向量 $\mathbf x$ 的第 $m$ 个元素，$[\mathbf X]_{m,n}$ 是矩阵 $\mathbf X$ 的第 $(m,n)$ 个元素。矩阵 $\mathbf X$ 的第 $m$ 行与第 $n$ 列分别记为 $\mathbf X(m,:)$ 与 $\mathbf X(:,n)$。两个矩阵 $\mathbf X$ 与 $\mathbf Y$ 的 Kronecker 积与 Khatri-Rao 积分别记为 $\mathbf X\otimes\mathbf Y$ 与 $\mathbf X\diamond\mathbf Y$。此外，$\mathbf I_N$ 为 $N\times N$ 单位矩阵，$\mathbf 1_N$ 为长度为 $N$ 的全一向量，$\mathbb E\{\cdot\}$ 为期望运算；$\lceil x\rceil$ 表示向上取整到最近整数，$|\cdot|$ 表示复数的模。对线性空间 $\mathcal U$，$\mathcal U^\perp$ 为其正交补，$\dim(\mathcal U)$ 表示 $\mathcal U$ 的维数。

## II. 系统模型

本文研究窄带时分双工（TDD）RIS 辅助多用户毫米波系统的上行信道：$K$ 个多天线用户与一台配备 $N=N_1\times N_2$ 天线 UPA 的基站建立通信链路，其中 $N_1$ 与 $N_2$ 分别为垂直与水平方向的天线数。以用户 $k$（$k\in\mathcal K=\{1,\ldots,K\}$）为例，用户 $k$ 配备 $Q_k=Q_{k_1}\times Q_{k_2}$ 天线 UPA（$Q_{k_1}$ 根垂直、$Q_{k_2}$ 根水平天线）。部署一个具有 $M=M_1\times M_2$ 个无源反射单元的 UPA 型 RIS（$M_1$ 垂直、$M_2$ 水平）以改善通信。本文考虑准静态信道，即各信道在一个估计周期内近似不变。

本文考虑远场场景，即 MIMO/RIS 系统的 Rayleigh 距离显著小于通信距离。记 $\mathbf H_{d,k}\in\mathbb C^{N\times Q_k}$、$\mathbf H_{r,k}\in\mathbb C^{M\times Q_k}$ 与 $\mathbf H\in\mathbb C^{N\times M}$ 分别为用户 $k$ 到 BS、用户 $k$ 到 RIS、RIS 到 BS 的信道矩阵。利用常用于表示毫米波信道稀疏性的几何信道模型 [25]，信道矩阵建模如下：

$$
\mathbf H_{d,k}=\sum_{i=1}^{I_k}\zeta_{k,i}\mathbf a_N(\sigma_{k,i},\xi_{k,i})\mathbf a_{Q_k}^H(\rho_{k,i},\kappa_{k,i})=\mathbf D_{N,k}\mathbf Z_k\mathbf D_{Q,k}^H,\quad\forall k\in\mathcal K,\tag{1}
$$

$$
\mathbf H_{r,k}=\sum_{j=1}^{J_k}\beta_{k,j}\mathbf a_M(\varphi_{k,j},\theta_{k,j})\mathbf a_{Q_k}^H(\eta_{k,j},\chi_{k,j})=\mathbf A_{M,k}\mathbf B_k\mathbf A_{Q,k}^H,\quad\forall k\in\mathcal K,\tag{2}
$$

$$
\mathbf H=\sum_{l=1}^{L}\alpha_l\mathbf a_N(\psi_l,\nu_l)\mathbf a_M^H(\omega_l,\mu_l)=\mathbf A_N\boldsymbol\Lambda\mathbf A_M^H,\tag{3}
$$

其中 $I_k$、$J_k$ 与 $L$ 分别为用户 $k$ 到 BS、用户 $k$ 到 RIS、RIS 到 BS 的传播路径数。$\zeta_{k,i}$、$(\sigma_{k,i},\xi_{k,i})$ 与 $(\rho_{k,i},\kappa_{k,i})$ 分别表示用户 $k$—BS 信道第 $i$ 条路径的复增益、AoA 与 AoD；$\beta_{k,j}$、$(\varphi_{k,j},\theta_{k,j})$ 与 $(\eta_{k,j},\chi_{k,j})$ 分别表示用户 $k$—RIS 信道第 $j$ 条路径的复增益、AoA 与 AoD；$\alpha_l$、$(\psi_l,\nu_l)$ 与 $(\omega_l,\mu_l)$ 分别表示 RIS—BS 信道第 $l$ 条路径的复增益、AoA 与 AoD。此外，$\mathbf D_{N,k}=[\mathbf a_N(\sigma_{k,1},\xi_{k,1}),\ldots,\mathbf a_N(\sigma_{k,I_k},\xi_{k,I_k})]\in\mathbb C^{N\times I_k}$、$\mathbf D_{Q,k}=[\mathbf a_{Q_k}(\rho_{k,1},\kappa_{k,1}),\ldots,\mathbf a_{Q_k}(\rho_{k,I_k},\kappa_{k,I_k})]\in\mathbb C^{Q_k\times I_k}$ 与 $\mathbf Z_k=\operatorname{Diag}\{\zeta_{k,1},\ldots,\zeta_{k,I_k}\}\in\mathbb C^{I_k\times I_k}$ 分别为用户 $k$—BS 信道的 AoA 导向矩阵、AoD 导向矩阵与复增益矩阵；$\mathbf A_{M,k}=[\mathbf a_M(\varphi_{k,1},\theta_{k,1}),\ldots,\mathbf a_M(\varphi_{k,J_k},\theta_{k,J_k})]\in\mathbb C^{M\times J_k}$、$\mathbf A_{Q,k}=[\mathbf a_{Q_k}(\eta_{k,1},\chi_{k,1}),\ldots,\mathbf a_{Q_k}(\eta_{k,J_k},\chi_{k,J_k})]\in\mathbb C^{Q_k\times J_k}$ 与 $\mathbf B_k=\operatorname{Diag}\{\beta_{k,1},\ldots,\beta_{k,J_k}\}\in\mathbb C^{J_k\times J_k}$ 分别为用户 $k$—RIS 信道的 AoA 导向矩阵、AoD 导向矩阵与复增益矩阵；$\mathbf A_N=[\mathbf a_N(\psi_1,\nu_1),\ldots,\mathbf a_N(\psi_L,\nu_L)]\in\mathbb C^{N\times L}$、$\mathbf A_M=[\mathbf a_M(\omega_1,\mu_1),\ldots,\mathbf a_M(\omega_L,\mu_L)]\in\mathbb C^{M\times L}$ 与 $\boldsymbol\Lambda=\operatorname{Diag}\{\alpha_1,\ldots,\alpha_L\}\in\mathbb C^{L\times L}$ 分别为 RIS—BS 信道的 AoA 导向矩阵、AoD 导向矩阵与复增益矩阵。

上述形如 $\mathbf a_F(x,y)\in\mathbb C^{F\times1}$ 的表达式表示尺寸为 $F_1\times F_2$（$F_1$、$F_2$ 分别为垂直与水平方向单元数）的 UPA 阵列导向向量，可表示为 $\mathbf a_F(x,y)=\mathbf a_{F_1}(x)\otimes\mathbf a_{F_2}(y)$，其中 $\mathbf a_{F_1}(x)$ 与 $\mathbf a_{F_2}(y)$ 分别为 UPA 在垂直与水平方向上的导向向量，具有形式 $\mathbf a_P(u)=\left[e^{-i2\pi pu}\right]^T$、$p=[0,\ldots,P-1]$。进一步，记 $x$ 与 $y$ 为 UPA 的 $x$ 轴与 $y$ 轴对应的等效空间频率，由 $x=\frac{d}{\lambda}\cos(\epsilon)$、$y=\frac{d}{\lambda}\sin(\epsilon)\cos(\iota)$ 给出，其中 $\epsilon\in[-\pi/2,\pi/2)$ 与 $\iota\in[-\pi,\pi)$ 分别为 UPA 的信号俯仰角与方位角，$d$ 为阵元间距、$\lambda$ 为载波波长。用户、BS 与 RIS 处均采用半波长天线间距的阵列，以避免严重旁瓣、形成无相位模糊的单主瓣对 [26]，并缓解 RIS 的互耦效应 [27]。

进一步，记 $\mathbf s_{k,t}\in\mathbb C^{Q_k\times1}$ 与 $\mathbf e_t\in\mathbb C^{M\times1}$ 分别为用户 $k$ 在时隙 $t$ 的导频信号与 RIS 向量。用户采用逐一发送方案（脚注 2）以避免用户间干扰。归一化发射功率后，时隙 $t$ 中来自用户 $k$ 的接收信号为

$$
\begin{aligned}
\mathbf y_{k,t}&=\mathbf H_{d,k}\mathbf s_{k,t}+\mathbf H\operatorname{Diag}\{\mathbf e_t\}\mathbf H_{r,k}\mathbf s_{k,t}+\mathbf n_{k,t}\\
&\overset{(a)}{=}\mathbf H_{d,k}\mathbf s_{k,t}+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\operatorname{vec}\left(\mathbf H\operatorname{Diag}\{\mathbf e_t\}\mathbf H_{r,k}\right)+\mathbf n_{k,t}\\
&\overset{(b)}{=}\mathbf H_{d,k}\mathbf s_{k,t}+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\left(\mathbf H_{r,k}^T\diamond\mathbf H\right)\mathbf e_t+\mathbf n_{k,t}\\
&\triangleq\mathbf H_{d,k}\mathbf s_{k,t}+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf e_t+\mathbf n_{k,t},
\end{aligned}\tag{4}
$$

其中 $\mathbf n_{k,t}\sim\mathcal{CN}(\mathbf 0,\delta^2\mathbf I)$ 为用户 $k$ 传输期间时隙 $t$ 在 BS 处的加性白高斯噪声（AWGN）。这里 $(a)$ 对 $\mathbf y_{k,t}$ 做向量化并利用 $\operatorname{vec}(\mathbf A\mathbf B\mathbf C)=\left(\mathbf C^T\otimes\mathbf A\right)\operatorname{vec}(\mathbf B)$，$(b)$ 利用 $\operatorname{vec}(\mathbf A\operatorname{Diag}\{\mathbf b\}\mathbf C)=\left(\mathbf C^T\diamond\mathbf A\right)\mathbf b$ [29]。$\mathbf G_k\triangleq\mathbf H_{r,k}^T\diamond\mathbf H\in\mathbb C^{Q_kN\times M}$ 被视为 RIS 辅助 MIMO 系统中用于传输设计的级联信道 [13]，可表示为

$$
\mathbf G_k=\mathbf H_{r,k}^T\diamond\mathbf H=\left(\mathbf A_{M,k}\mathbf B_k\mathbf A_{Q,k}^H\right)^T\diamond\left(\mathbf A_N\boldsymbol\Lambda\mathbf A_M^H\right)=\left(\mathbf A_{Q,k}^\ast\otimes\mathbf A_N\right)\left(\mathbf B_k\otimes\boldsymbol\Lambda\right)\left(\mathbf A_{M,k}^T\diamond\mathbf A_M^H\right),\tag{5}
$$

其中用到 $(\mathbf A\mathbf C)\diamond(\mathbf B\mathbf D)=(\mathbf A\otimes\mathbf B)(\mathbf C\diamond\mathbf D)$ 与 $(\mathbf A\mathbf B)\otimes(\mathbf C\mathbf D)=(\mathbf A\otimes\mathbf C)(\mathbf B\otimes\mathbf D)$。

我们为 RIS 辅助 MU-MIMO 毫米波系统中的直达信道 $\mathbf H_{d,k}$ 与级联信道 $\mathbf G_k$ 的开发了一种新的信道估计协议，可避免开关 RIS 并完全消除直达—级联误差传播。

> **脚注 2**：在导频开销意义上，逐一发送方案等价于正交导频传输方案 [28]；所提信道估计协议同样适用于正交导频方案且不引入额外导频开销。  
> **脚注 3**：每个 RIS 的相移由有限比特量化结构控制（实践中通常为 1、2、3、4 比特）[31]。在 $N$ 比特结构下，可通过把单元 $a$ 精确设置为 $a=n\pi/(2^N-1)$、$n=0,1,\ldots,2^N-1$，并把单元 $b$ 设置为 $b=(p_a+\pi)\bmod 2\pi$ 来实现相反的 RIS 取值。

## III. RIS 辅助 MU-MIMO 系统的统一信道估计

### A. 信道估计协议

以用户 $k$ 为例，所提信道估计协议的时序图见图 2：第一行表示用户 $k$ 发送的导频信号，第二行表示 RIS 向量的设计。协议沿时间维分为两段：**段 I** 对应第 I 与第 II 阶段，**段 II** 对应第 III 阶段。我们刻意设计导频传输方案、RIS 相移与信号处理方法，以在接收信号中实现直达与级联信道分量的解耦，同时获得足够的独立测量 [30] 以提升参数估计精度。

在段 I 中设计前两个时间块，每个时间块包含 $T_{f,k}$ 个时隙。时间块 1 内的 RIS 向量设计为时间块 2 内 RIS 向量的相反值（脚注 3），而两个时间块内的导频信号保持相同。基于所设计的 RIS 相移向量与导频信号，第 I 阶段获得等效信号以估计直达信道；第 II 阶段利用同一段内相同的时间块，重新组合接收信号并利用正交补空间投影，实现用户—RIS 信道 AoD 的估计。另一方面，段 II 由 $X_k$ 个时间块组成，即从时间块 3 到时间块 $(X_k+2)$，每个时间块包含 $(T_k-1)$ 个时隙。段 II 内各时间块的导频信号取值设计为与前两个时间块相应时隙的导频相同；例如在时间块 $(x+2)$ 内，导频符号取值设为时间块 1 内时隙 $x$ 的导频值。此外，段 II 内全部 $X_k$ 个时间块的 RIS 向量统一设计为 $\{\mathbf e_2,\mathbf e_3,\ldots,\mathbf e_{T_k}\}$。在第 III 阶段，利用来自段 I 与段 II 共 $(X_k+2)$ 个时间块，可估计 RIS—BS 信道的 AoA 与级联信道的剩余参数。具体地，通过重组所采集的 $(X_k+2)$ 个时间块，提出一种称为正交补空间投影的新信号预处理技术来获得级联信道估计的等效信号。可以看到，所提方法完全避免了直达—级联信道估计的误差传播，从而提升级联信道估计的性能。为便于说明，本文余下部分记 $\mathbf n_{k,t}^u$ 为用户 $k$ 传输期间时间块 $u$ 的时隙 $t$ 在 BS 处的噪声向量。

**图 2**：所提 RIS 辅助 MIMO 毫米波系统统一信道估计协议时序图（含段 I/段 II、时间块与时隙结构，以及第 I—III 阶段的信号处理示意）。

### B. 第 I 阶段：直达信道估计

在第 I 阶段，利用段 I 的时间块估计直达信道的全部参数。记估计直达信道所需的导频开销为 $T_{d,k}$（$T_{d,k}\le T_{f,k}$）。第 I 阶段的接收信号处理流程见图 3 上半部分。

基于（4），可得时间块 1 与时间块 2 内时隙 $t$（$1\le t\le T_{d,k}$）在 BS 处的接收信号为

$$
\mathbf y_{k,t}^1=\mathbf H_{d,k}\mathbf s_{k,t}+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k(-\mathbf e_1)+\mathbf n_{k,t}^1,\tag{6}
$$

$$
\mathbf y_{k,t}^2=\mathbf H_{d,k}\mathbf s_{k,t}+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf e_1+\mathbf n_{k,t}^2,\tag{7}
$$

其中 $\mathbf n_{k,t}^1$ 与 $\mathbf n_{k,t}^2$ 分别表示时间块 1 与 2 内的相应噪声向量，$\mathbf s_{k,t}$ 表示时间块 1 与时间块 2 内时隙 $t$ 的导频信号。相同导频配合相反 RIS 向量可得等效直达信道信号 $\mathbf c_{k,t}$：

$$
\mathbf c_{k,t}=\frac{\mathbf y_{k,t}^1+\mathbf y_{k,t}^2}{2}=\mathbf D_{N,k}\mathbf Z_k\mathbf D_{Q,k}^H\mathbf s_{k,t}+\frac{\mathbf n_{k,t}^1+\mathbf n_{k,t}^2}{2}.\tag{8}
$$

各时隙导频的时变设计旨在产生独立测量。基于该设计，对全部 $T_{d,k}$ 对时隙执行与（8）类似的步骤，得到总体 $T_{d,k}$ 个等效接收信号并堆叠为等效测量矩阵 $\mathbf C_k=[\mathbf c_{k,1},\ldots,\mathbf c_{k,T_{d,k}}]\in\mathbb C^{N\times T_{d,k}}$，有

$$
\mathbf C_k^H=\mathbf S_k^H\mathbf D_{Q,k}\boldsymbol\Theta_k+\mathbf N_k^H,\tag{9}
$$

其中 $\boldsymbol\Theta_k\triangleq\mathbf Z_k^H\mathbf D_{N,k}^H$，$\mathbf S_k=[\mathbf s_{k,1},\ldots,\mathbf s_{k,T_{d,k}}]\in\mathbb C^{Q_k\times T_{d,k}}$ 为由 $T_{d,k}$ 个导频向量构成的堆叠导频矩阵，$\mathbf N_k=\left[\frac{1}{2}\left(\mathbf n_{k,1}^1+\mathbf n_{k,1}^2\right),\ldots,\frac{1}{2}\left(\mathbf n_{k,T_{d,k}}^1+\mathbf n_{k,T_{d,k}}^2\right)\right]\in\mathbb C^{N\times T_{d,k}}$ 为相应噪声矩阵。为估计 $\mathbf D_{Q,k}$，可用虚拟角度域（virtual angular domain，VAD）表示把（9）改写为

$$
\mathbf C_k^H=\mathbf S_k^H(\mathbf D_1\otimes\mathbf D_2)\widetilde{\boldsymbol\Theta}_k+\mathbf N_k^H,\tag{10}
$$

其中 $\mathbf D_1\in\mathbb C^{Q_{k_1}\times B_1}$ 与 $\mathbf D_2\in\mathbb C^{Q_{k_2}\times B_2}$ 为过完备字典矩阵（$B_1\ge Q_{k_1}$、$B_2\ge Q_{k_2}$），$\mathbf D_1$ 与 $\mathbf D_2$ 中原子范围分别为 $\left[-\frac{d}{\lambda_c},\left(1-\frac{2}{B_1}\right)\frac{d}{\lambda_c}\right]$ 与 $\left[-\frac{d}{\lambda_c},\left(1-\frac{2}{B_2}\right)\frac{d}{\lambda_c}\right]$，分辨率分别为 $2/B_1$ 与 $2/B_2$。$\widetilde{\boldsymbol\Theta}_k\in\mathbb C^{B_1B_2\times N}$ 为具有 $I_k$ 个非零行的行稀疏矩阵。（10）可视为多测量向量（MMV）情形下的稀疏信号恢复问题。采用同时正交匹配追踪（SOMP）[32] 算法，可估计用户—BS 信道的 AoD，即对 $\forall i$ 的 $(\rho_{k,i},\kappa_{k,i})$。随后利用 Kronecker 积性质获得 $\rho_{k,i}$ 与 $\kappa_{k,i}$：具体地，假设矩阵 $\widetilde{\boldsymbol\Theta}_k$ 的第 $b$ 行非零，且 $(\mathbf D_1\otimes\mathbf D_2)$ 的第 $b$ 列是与某 AoD 对相关的导向向量，则 $\mathbf D_1$ 与 $\mathbf D_2$ 中俯仰角与方位角的索引为

$$
b_1=\left\lceil\frac{b}{B_2}\right\rceil,\qquad b_2=b-B_2(b_1-1).\tag{11}
$$

利用所得 $\widehat{\mathbf D}_{Q,k}$，估计用户—BS 信道的剩余参数。对（9）中的测量矩阵 $\mathbf C_k$ 右乘 $(\widehat{\mathbf D}_{Q,k}^H\mathbf S_k)^\dagger$，得

$$
\widetilde{\mathbf C}_k\triangleq\left(\mathbf D_{N,k}\mathbf Z_k(\widehat{\mathbf D}_{Q,k}+\Delta\mathbf D_{Q,k})^H\mathbf S_k+\mathbf N_k\right)(\widehat{\mathbf D}_{Q,k}^H\mathbf S_k)^\dagger=\mathbf D_{N,k}\mathbf Z_k+\widetilde{\mathbf N}_k,\tag{12}
$$

其中 $\Delta\mathbf D_{Q,k}$ 为 $\mathbf D_{Q,k}$ 的估计误差，$\widetilde{\mathbf N}_k=(\mathbf D_{N,k}\mathbf Z_k\Delta\mathbf D_{Q,k}^H\mathbf S_k+\mathbf N_k)(\widehat{\mathbf D}_{Q,k}^H\mathbf S_k)^\dagger$ 表示等效噪声矩阵。为解耦剩余参数，取 $\widetilde{\mathbf C}_k$ 的第 $i$ 列（对应用户—BS 信道第 $i$ 条路径）：

$$
\mathbf c_{k,i}=[\widetilde{\mathbf C}_k]_{(:,i)}=\zeta_{k,i}\mathbf a_N(\sigma_{k,i},\xi_{k,i})+\tilde{\mathbf n}_{k,i},\tag{13}
$$

其中 $\tilde{\mathbf n}_{k,i}$ 为 $\widetilde{\mathbf N}_k$ 的第 $i$ 列。利用 SNL-LS 方法 [14]，可通过简单的二维搜索估计 $(\sigma_{k,i},\xi_{k,i})$：

$$
(\hat\sigma_{k,i},\hat\xi_{k,i})=\arg\max\ \varpi_{k,i}\left|\left\langle\mathbf c_{k,i},\mathbf a_N(\sigma_{k,i},\xi_{k,i})\right\rangle\right|^2,\tag{14}
$$

其中 $\varpi_{k,i}=\langle\mathbf a_N(\sigma_{k,i},\xi_{k,i}),\mathbf a_N(\sigma_{k,i},\xi_{k,i})\rangle^{-1}$，且 $\sigma_{k,i},\xi_{k,i}\in\left[-\frac{d}{\lambda_c},\frac{d}{\lambda_c}\right]$。一旦估计出 $\sigma_{k,i}$ 与 $\xi_{k,i}$，对应增益可由 $\zeta_{k,i}=\mathbf a_N(\sigma_{k,i},\xi_{k,i})^\dagger\mathbf c_{k,i}$ 获得。由于估计直达信道所需导频开销相对较低，我们重复 $K$ 次以获得 $\mathbf H_{d,k}$（$\forall k\in\mathcal K$）的估计。直达信道的整体估计总结于算法 1。

**算法 1**　估计 $\mathbf H_{d,k}$，$\forall k\in\mathcal K$

**输入**：对 $\forall k\in\mathcal K$ 的 $\mathbf C_k$、$\mathbf S_k$，以及 $\mathbf D_1$、$\mathbf D_2$。
1. **for** $1\le k\le K$ **do**
2. 　**阶段 1**：用 SOMP 算法估计 $\mathbf D_{Q,k}$。
3. 　计算字典 $\mathbf F=\mathbf S_k^H(\mathbf D_1\otimes\mathbf D_2)$。
4. 　初始化 $\mathbf R_0=\mathbf C_k^H$、$\boldsymbol\Xi_0=\varnothing$、$i=1$。
5. 　**repeat**
6. 　　计算 $\boldsymbol\Psi=\mathbf F^H\mathbf R_{i-1}$。
7. 　　$b_i=\arg\max_{b_i=1,\ldots,B_1B_2}\operatorname{diag}\{\boldsymbol\Psi\boldsymbol\Psi^H\}$。
8. 　　$\boldsymbol\Xi_i=\boldsymbol\Xi_{i-1}\cup b_i$。
9. 　　计算 $\mathbf w_i=(\mathbf F^H(:,{\boldsymbol\Xi}_i)\mathbf F(:,{\boldsymbol\Xi}_i))^{-1}\mathbf F^H(:,{\boldsymbol\Xi}_i)\mathbf C_k^H$。
10.　　$\mathbf R_i=\mathbf C_k^H-\mathbf F(:,{\boldsymbol\Xi}_i)\mathbf w_i$。
11.　　$i=i+1$。
12.　**until** $\|\mathbf R_i\|_F\le$ 阈值。
13.　对 $\forall i$ 由（11）获得 $\rho_{k,i}$ 与 $\kappa_{k,i}$ 的估计。
14.　**阶段 2**：用二维 SNL-LS 算法估计剩余参数。
15.　计算 $\widetilde{\mathbf C}_k=\mathbf C_k(\widehat{\mathbf D}_{Q,k}^H\mathbf S_k)^\dagger$。
16.　**for** $1\le i\le\hat I_k$ **do**
17.　　取 $\widetilde{\mathbf C}_k$ 的第 $i$ 列：$\mathbf c_{k,i}=[\widetilde{\mathbf C}_k]_{(:,i)}$。
18.　　由（14）求 $(\hat\sigma_{k,i},\hat\xi_{k,i})$。
19.　　获得信道增益 $\hat\zeta_{k,i}=\mathbf a_N(\hat\sigma_{k,i},\hat\xi_{k,i})^\dagger\mathbf c_{k,i}$。
20.　**end for**
21.　获得估计：$\widehat{\mathbf D}_{N,k}=[\mathbf a_N(\hat\sigma_{k,1},\hat\xi_{k,1}),\ldots,\mathbf a_N(\hat\sigma_{k,\hat I_k},\hat\xi_{k,\hat I_k})]$、$\widehat{\mathbf Z}_k=\operatorname{Diag}\{\hat\zeta_{k,1},\ldots,\hat\zeta_{k,\hat I_k}\}$。
22. **end for**
**输出**：$\widehat{\mathbf H}_{d,k}=\widehat{\mathbf D}_{N,k}\widehat{\mathbf Z}_k\widehat{\mathbf D}_{Q,k}^H$，$\forall k\in\mathcal K$。

### C. 第 II 阶段：用户—RIS 信道的 AoD 估计

**1）协议设计**：段 I 的协议设计同时支持在第 II 阶段估计用户—RIS 信道的 AoD，即对 $\forall k$ 估计 $\{(\eta_{k,j},\chi_{k,j})\}_{j=1}^{J_k}$。记第 II 阶段估计所需导频开销为 $T_{\mathrm{AoD},k}$（$T_{\mathrm{AoD},k}\le T_{f,k}$）。自然地，在导频传输期间，$T_{f,k}$ 设为 $T_{f,k}=\max\{T_{d,k},T_{\mathrm{AoD},k}\}$。第 II 阶段的接收信号处理见图 3 下半部分。

所设计的导频序列与 RIS 相移使信号重组与投影处理成为可能。具体地，把时间块 1 与时间块 2 内时隙 $t$（$1\le t\le T_{\mathrm{AoD},k}$）的接收信号堆叠为 $\mathbf Y_{f,k,t}=[\mathbf y_{k,t}^1,\mathbf y_{k,t}^2]$，得

$$
\mathbf Y_{f,k,t}=\mathbf H_{d,k}\mathbf s_{k,t}\mathbf 1_2^T+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf E_f+\mathbf N_{f,k,t},\tag{15}
$$

其中 $\mathbf E_f=[-\mathbf e_1,\mathbf e_1]$、$\mathbf N_{f,k,t}=[\mathbf n_{k,t}^1,\mathbf n_{k,t}^2]$。二维向量的正交补空间是其单位长度正交向量张成的空间；因此利用 $\mathbf 1_2$ 的正交向量 $\mathbf v=[-\sqrt{2}/2,\sqrt{2}/2]^T$ 得到 $\tilde{\mathbf y}_{f,k,t}=\mathbf Y_{f,k,t}\mathbf v/\sqrt{2}$：

$$
\begin{aligned}
\tilde{\mathbf y}_{f,k,t}&=\left(\mathbf H_{d,k}\mathbf s_{k,t}\mathbf 1_2^T+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf E_f+\mathbf N_{f,k,t}\right)\mathbf v/\sqrt{2}\\
&=\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf e_1+\tilde{\mathbf n}_{f,k,t}=\mathbf H\operatorname{Diag}\{\mathbf e_1\}\mathbf H_{r,k}\mathbf s_{k,t}+\tilde{\mathbf n}_{f,k,t},
\end{aligned}\tag{16}
$$

其中第三个等式用到 $\left(\mathbf C^T\otimes\mathbf A\right)\operatorname{vec}(\mathbf B)=\operatorname{vec}(\mathbf A\mathbf B\mathbf C)$ 与 $\left(\mathbf C^T\diamond\mathbf A\right)\mathbf b=\operatorname{vec}(\mathbf A\operatorname{Diag}\{\mathbf b\}\mathbf C)$，且 $\tilde{\mathbf n}_{f,k,t}=-\frac{1}{2}\mathbf n_{k,t}^1+\frac{1}{2}\mathbf n_{k,t}^2$。从（16）可见，在用于估计用户—RIS 信道 AoD 的等效信号 $\tilde{\mathbf y}_{f,k,t}$ 中，直达信道分量被完全消除，从而避免了直达信道估计到级联信道估计的误差传播。此外，由（16）第三个等式可见，级联信道的等效噪声功率降至原值的一半。

对前两个时间块中全部 $T_{\mathrm{AoD},k}$ 对时隙施加与（16）相同的信号预处理，并堆叠全部 $T_{\mathrm{AoD},k}$ 个接收信号，得 $\widetilde{\mathbf Y}_{f,k}$：

$$
\widetilde{\mathbf Y}_{f,k}=\mathbf H\operatorname{Diag}\{\mathbf e_1\}\mathbf H_{r,k}\mathbf S_{\mathrm{AoD},k}+\widetilde{\mathbf N}_{f,k},\tag{17}
$$

其中 $\mathbf S_{\mathrm{AoD},k}=[\mathbf s_{k,1},\ldots,\mathbf s_{k,T_{\mathrm{AoD},k}}]\in\mathbb C^{Q_k\times T_{\mathrm{AoD},k}}$ 视为用户 $k$ 在全部 $T_{\mathrm{AoD},k}$ 个时隙发送的等效导频矩阵（见图 2），$\widetilde{\mathbf N}_{f,k}=[\tilde{\mathbf n}_{f,k,1},\ldots,\tilde{\mathbf n}_{f,k,T_{\mathrm{AoD},k}}]\in\mathbb C^{N\times T_{\mathrm{AoD},k}}$ 为相应噪声矩阵。结合（2），对（17）取共轭转置：

$$
\widetilde{\mathbf Y}_{f,k}^H=\mathbf S_{\mathrm{AoD},k}^H\mathbf A_{Q,k}\boldsymbol\Phi_k+\widetilde{\mathbf N}_{f,k}^H,\tag{18}
$$

其中 $\boldsymbol\Phi_k\triangleq\left(\mathbf A_N\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\mathbf e_1\}\mathbf A_{M,k}\mathbf B_k\right)^H$。基于所得（18），可估计用户—RIS 信道的 AoD，即 $\mathbf A_{Q,k}$。由于该问题与（9）相关的问题相似，可转化为 MMV 情形的稀疏恢复问题：

$$
\widetilde{\mathbf Y}_{f,k}^H=\mathbf S_{\mathrm{AoD},k}^H(\mathbf D_1\otimes\mathbf D_2)\widetilde{\boldsymbol\Phi}_k+\widetilde{\mathbf N}_{f,k}^H,\tag{19}
$$

其中 $\mathbf D_1$ 与 $\mathbf D_2$ 为（10）中定义的过完备字典矩阵，$\widetilde{\boldsymbol\Phi}_k\in\mathbb C^{B_1B_2\times N}$ 为具有 $J_k$ 个非零行的行稀疏矩阵。类似地，利用算法 1 所示的 SOMP 流程，可得 $\mathbf A_{Q,k}$ 的估计 $\widehat{\mathbf A}_{Q,k}$，并获得相应的估计 AoD $\{(\hat\eta_{k,j},\hat\chi_{k,j})\}_{j=1}^{J_k}$。

在第 I 与第 II 阶段，段 I 的两个时间块以较低导频开销估计用户—BS 信道参数与用户—RIS 信道 AoD。用户依次发送导频信号，重复该过程 $K$ 次即可获得全部用户的参数。此外，在第 I 与第 II 阶段，我们从段 I 时间块的接收信号中完全分离了直达信道估计与级联信道估计；在第 III 阶段（见第 III-D 节），我们将通过更灵活的信号处理从段 II 时间块的接收信号中分离直达信道估计与级联信道估计，以估计级联信道的剩余参数。

**2）现有 ON-OFF 方法简介**：在介绍第 III 阶段细节之前，先简要介绍现有 ON-OFF 方法——这是分离直达与级联信道估计的经典方法，其机制总结如下。首先关断 RIS，用于估计直达信道 $\mathbf H_{d,k}$ 的等效接收信号为

$$
\mathbf y_{d,k,t}=\mathbf H_{d,k}\mathbf s_{k,t}+\mathbf n_{d,k},\tag{20}
$$

其中 $\mathbf n_{d,k}$ 为噪声向量。随后开启 RIS，通过从接收信号中减去 $\mathbf H_{d,k}$ 的估计（记为 $\widehat{\mathbf H}_{d,k}$）得到用于级联信道估计的等效信号 $\breve{\mathbf y}_k$：

$$
\breve{\mathbf y}_{k,t}=(\Delta\mathbf H_{d,k}+\mathbf H\operatorname{Diag}\{\mathbf e_t\}\mathbf H_{r,k})\mathbf s_{k,t}+\mathbf n_{k,t}=\mathbf H\operatorname{Diag}\{\mathbf e_t\}\mathbf H_{r,k}\mathbf s_{k,t}+\breve{\mathbf n}_{k,t},\tag{21}
$$

其中 $\breve{\mathbf n}_{k,t}=\mathbf n_{k,t}+\Delta\mathbf H_{d,k}$，$\Delta\mathbf H_{d,k}\triangleq(\mathbf H_{d,k}-\widehat{\mathbf H}_{d,k})$ 表示不可避免的直达—级联误差传播。由于 $\breve{\mathbf n}_k$ 与 $\Delta\mathbf H_{d,k}$ 来源不同，可假设二者不相关；因此 $\operatorname{Cov}(\breve{\mathbf n}_{k,t})=\operatorname{Cov}(\mathbf n_{k,t})+\operatorname{Cov}(\Delta\mathbf H_{d,k})=(\delta^2+\epsilon)\mathbf I$，$\epsilon>0$，这会显著恶化级联信道估计。此外，ON-OFF 方法中频繁开关 RIS 在实践中会导致功率损失 [24]。相比之下，所提信号预处理方法解决了 ON-OFF 方法的上述缺点，细节见第 III-D 节。

### D. 第 III 阶段：RIS—BS 信道 AoA 与级联信道剩余参数估计

在第 III 阶段（见图 2），利用段 I 与段 II 的时间块，即从时间块 1 到时间块 $(X_k+2)$，估计 RIS—BS 信道的 AoA 与级联信道的剩余参数。我们提出一种新的信号预处理方法，不仅避免开关 RIS（硬件成本低），而且完全消除估计 RIS—BS 信道 AoA 与级联信道剩余参数时的直达—级联信道估计误差影响。

**1）基于正交补空间投影与接收信号重组的信号预处理**：以时隙 $t$ 在 BS 处的接收信号 $\mathbf y_{k,t}$ 为例，展示获取用于估计 RIS—BS 信道 AoA 与级联信道剩余参数的等效接收信号的信号预处理技术。回顾（4），$\mathbf y_{k,t}$ 可表示为

$$
\mathbf y_{k,t}=\mathbf H_{d,k}\mathbf s_{k,t}+\mathbf H\operatorname{Diag}\{\mathbf e_t\}\mathbf H_{r,k}\mathbf s_{k,t}+\mathbf n_{k,t}=\mathbf H_{d,k}\mathbf s_{k,t}+\left(\mathbf s_{k,t}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf e_t+\mathbf n_{k,t}.\tag{22}
$$

如图 4 所示，段 II 刻意利用 RIS 向量的变化、同时保持每个时间块内导频相同，以产生独立测量。具体地，先堆叠扩展时间块内的接收信号，得到该扩展时间块的信号矩阵。扩展时间块由来自段 I 时间块的两个时隙与随后段 II 时间块的全部 $(T_k-1)$ 个时隙组成。前两个时间块中选定的时隙索引以及随后时间块的索引均对应扩展时间块的索引。例如，扩展时间块 $(x_k+2)$（$1\le x_k\le X_k$）各时隙的接收信号 $\mathbf y_{k,t}$ 被堆叠，从而得到扩展时间块 $(x_k+2)$ 内的接收矩阵 $\mathbf Y_{s,k,x_k}\in\mathbb C^{N\times(T_k+1)}$：

$$
\mathbf Y_{s,k,x_k}=\mathbf H_{d,k}\mathbf s_{k,x_k}\mathbf 1_{T_k+1}^T+\left(\mathbf s_{k,x_k}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf E_{s,k}+\mathbf N_{s,k,x_k},\tag{23}
$$

其中 $\mathbf E_{s,k}\triangleq[-\mathbf e_1,\mathbf e_1,\mathbf e_2,\ldots,\mathbf e_{T_k}]$ 为 RIS 矩阵，$\mathbf N_{s,k,x_k}=[\mathbf n_{k,x_k}^1,\mathbf n_{k,x_k}^2,\mathbf n_{k,1}^{x_k+2},\ldots,\mathbf n_{k,T_k-1}^{x_k+2}]$ 为扩展时间块 $(x_k+2)$ 期间的噪声矩阵。

为去除 $\mathbf Y_{s,k,x_k}$ 中的直达信道分量，基于正交补空间投影进行如下信号预处理。令 $\mathcal U$ 表示（23）中向量 $\mathbf 1_{T_k+1}$ 张成的空间，它是 $(T_k+1)$ 维线性空间 $\mathbb C^{T_k+1}$ 的子空间，$\mathcal U^\perp$ 为 $\mathcal U$ 的正交补，满足

$$
\begin{cases}\mathcal U^\perp=\left\{\mathbf f\ \middle|\ \mathbf f^H\mathbf g=0,\ \forall\mathbf g\in\mathcal U\right\}\\ \dim(\mathcal U)+\dim(\mathcal U^\perp)=T_k+1.\end{cases}\tag{24}
$$

于是可构造列正交矩阵 $\mathbf V\in\mathbb C^{(T_k+1)\times T_k}$，其列向量由子空间 $\mathcal U^\perp$ 构造。把 $\mathbf Y_{s,k,x_k}$ 投影到 $\mathbf 1_{T_k+1}$ 的正交补空间，得 $\widetilde{\mathbf Y}_{s,k,x_k}=\mathbf Y_{s,k,x_k}\mathbf V$：

$$
\widetilde{\mathbf Y}_{s,k,x_k}=\left(\mathbf s_{k,x_k}^T\otimes\mathbf I_N\right)\mathbf G_k\mathbf E_{s,k}\mathbf V+\mathbf N_{s,k,x_k}\mathbf V\triangleq\left(\mathbf s_{k,x_k}^T\otimes\mathbf I_N\right)\mathbf G_k\widetilde{\mathbf E}_{s,k}+\widetilde{\mathbf N}_{s,k,x_k},\tag{25}
$$

其中 $\widetilde{\mathbf E}_{s,k}\triangleq\mathbf E_{s,k}\mathbf V=[\boldsymbol\phi_1,\ldots,\boldsymbol\phi_{T_k}]\in\mathbb C^{M\times T_k}$ 视为 RIS 的等效矩阵，$\widetilde{\mathbf N}_{s,k,x_k}$ 为相应的投影噪声矩阵。由引理 1，噪声的统计特性保持不变。

**引理 1**：子空间投影后噪声功率保持不变。具体地，$\widetilde{\mathbf N}_{s,k,x_k}$ 中的元素独立同分布，服从 $\mathcal{CN}(0,\delta^2)$。

**证明**：有 $\operatorname{vec}(\widetilde{\mathbf N}_{s,k,x_k})=(\mathbf V^T\otimes\mathbf I_N)\operatorname{vec}(\mathbf N_{s,k,x_k})$；由于它是复高斯随机向量 $\operatorname{vec}(\mathbf N_{s,k,x_k})$ 的线性变换，$\operatorname{vec}(\widetilde{\mathbf N}_{s,k,x_k})$ 仍服从复高斯分布。具体地，利用循环对称高斯向量的性质，$\operatorname{vec}(\widetilde{\mathbf N}_{s,k,x_k})$ 的协方差矩阵为

$$
\operatorname{Cov}\left(\operatorname{vec}(\widetilde{\mathbf N}_{s,k,x_k})\right)=\delta^2(\mathbf V^T\otimes\mathbf I_N)(\mathbf V^\ast\otimes\mathbf I_N)=\delta^2(\mathbf V^T\mathbf V^\ast)\otimes\mathbf I_N=\delta^2\mathbf I_{NT_k}.\tag{26}
$$

由（26），$\widetilde{\mathbf N}_{s,k,x_k}$ 中每个元素的方差仍为 $\delta^2$，故 $\operatorname{vec}(\widetilde{\mathbf N}_{s,k,x_k})\sim\mathcal{CN}(\mathbf 0,\delta^2\mathbf I_{NT_k})$。因此投影后噪声功率保持不变。

沿用与（4）（16）类似的推导，取矩阵 $\widetilde{\mathbf Y}_{s,k,x_k}$ 的第 $w$ 列（$1\le w\le T_k$）：

$$
[\widetilde{\mathbf Y}_{s,k,x_k}]_{(:,w)}=\left(\mathbf s_{k,x_k}^T\otimes\mathbf I_N\right)\mathbf G_k\boldsymbol\phi_w+[\widetilde{\mathbf N}_{s,k,x_k}]_{(:,w)}=\mathbf H\operatorname{Diag}\{\boldsymbol\phi_w\}\mathbf H_{r,k}\mathbf s_{k,x_k}+[\widetilde{\mathbf N}_{s,k,x_k}]_{(:,w)}.\tag{27}
$$

对全部 $X_k$ 个扩展时间块（即扩展时间块 3 到 $(X_k+2)$）重复（23）—（27）所示的相同信号预处理步骤，可得 $\{[\widetilde{\mathbf Y}_{s,k,x_k}]_{(:,w)}\}$（$1\le x_k\le X_k$）。把它们堆叠，得 $\widetilde{\mathbf Y}_{s,k}^{(w)}\in\mathbb C^{N\times X_k}$：

$$
\widetilde{\mathbf Y}_{s,k}^{(w)}=\left[[\widetilde{\mathbf Y}_{s,k,1}]_{(:,w)},[\widetilde{\mathbf Y}_{s,k,2}]_{(:,w)},\ldots,[\widetilde{\mathbf Y}_{s,k,X_k}]_{(:,w)}\right]=\mathbf H\operatorname{Diag}\{\boldsymbol\phi_w\}\mathbf H_{r,k}\mathbf S_{s,k}+\widetilde{\mathbf N}_{s,k}^{(w)},\tag{28}
$$

其中 $\mathbf S_{s,k}=[\mathbf s_{k,1},\ldots,\mathbf s_{k,X_k}]$，$\widetilde{\mathbf N}_{s,k}^{(w)}=[[\widetilde{\mathbf N}_{s,k,1}]_{(:,w)},\ldots,[\widetilde{\mathbf N}_{s,k,X_k}]_{(:,w)}]$ 分别为接收信号 $\widetilde{\mathbf Y}_{s,k}^{(w)}$ 的相应导频矩阵与噪声矩阵。

至此完成了对（22）中接收信号 $\mathbf y_{k,t}$ 的信号预处理，得到等效信号矩阵 $\widetilde{\mathbf Y}_{s,k}^{(w)}$（$1\le w\le T_k$）。下面基于 $\widetilde{\mathbf Y}_{s,k}^{(w)}$ 估计 RIS—BS 信道的 AoA $\{(\psi_l,\nu_l)\}_{l=1}^{L}$ 与级联信道的剩余参数，即对 $\forall l\in\{1,\ldots,L\}$ 的 $\{(\omega_l-\varphi_{k,j})\}_{j=1}^{J_k}$、$\{(\mu_l-\theta_{k,j})\}_{j=1}^{J_k}$ 与 $\{\alpha_l^\ast\beta_{k,j}^\ast\}_{j=1}^{J_k}$。

**2）RIS—BS 信道公共 AoA 的估计**：结合（3）与（28），有

$$
\widetilde{\mathbf Y}_{s,k}^{(w)}=\mathbf A_N\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\boldsymbol\phi_w\}\mathbf H_{r,k}\mathbf S_{s,k}+\widetilde{\mathbf N}_{s,k}^{(w)}.\tag{29}
$$

注意（29）中的等效信号矩阵与 [13] 中（9）相似，可用 UPA-DFT 方法估计 RIS—BS 信道的 AoA $\mathbf A_N$。

$\mathbf A_N$ 的估计精度对剩余参数估计（包括 $\{(\omega_l-\varphi_{k,j})\}$、$\{(\mu_l-\theta_{k,j})\}$ 与 $\{\alpha_l^\ast\beta_{k,j}^\ast\}$）至关重要。$\mathbf A_N$ 存在于 $\widetilde{\mathbf Y}_{s,k}^{(w)}$（$1\le w\le T_k$）中，并被所有用户的级联信道共享。因此为提升估计精度，我们堆叠全部 $\widetilde{\mathbf Y}_{s,k}^{(w)}$（$1\le w\le T_k$）得到 $\mathbf Y_{\mathrm{all},k}=[\widetilde{\mathbf Y}_{s,k}^{(1)},\ldots,\widetilde{\mathbf Y}_{s,k}^{(T_k)}]\in\mathbb C^{N\times X_kT_k}$，再堆叠全部用户的 $\mathbf Y_{\mathrm{all},k}$ 得到 $\mathbf Y_{\mathrm{all}}=[\mathbf Y_{\mathrm{all},1},\ldots,\mathbf Y_{\mathrm{all},K}]\in\mathbb C^{N\times\sum_{k=1}^{K}X_kT_k}$。随后基于 $\mathbf Y_{\mathrm{all}}$ 用 UPA-DFT 方法获得 $\mathbf A_N$ 的估计 $\widehat{\mathbf A}_N$。该操作充分利用了更大的信息量，从而降低从 $\mathbf A_N$ 到剩余参数估计的误差传播。

基于估计得到的 $\widehat{\mathbf A}_{Q,k}$ 与 $\widehat{\mathbf A}_N$，通过对 $\widetilde{\mathbf Y}_{s,k}^{(w)}$ 作如下处理，得到测量矩阵 $\widetilde{\mathbf Y}_{m,k}^{(w)}\in\mathbb C^{L\times J_k}$：

$$
\begin{aligned}
\widetilde{\mathbf Y}_{m,k}^{(w)}&=\frac{1}{N}\widehat{\mathbf A}_N^H\widetilde{\mathbf Y}_{s,k}^{(w)}\left(\widehat{\mathbf A}_{Q,k}^H\mathbf S_{s,k}\right)^\dagger\\
&=\frac{1}{N}\widehat{\mathbf A}_N^H\left[(\widehat{\mathbf A}_N+\Delta\mathbf A_N)\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\boldsymbol\phi_w\}\mathbf A_{M,k}\mathbf B_k(\widehat{\mathbf A}_{Q,k}+\Delta\mathbf A_{Q,k})\mathbf S_{s,k}+\widetilde{\mathbf N}_{s,k}^{(w)}\right]\left(\widehat{\mathbf A}_{Q,k}^H\mathbf S_{s,k}\right)^\dagger\\
&=\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\boldsymbol\phi_w\}\mathbf A_{M,k}\mathbf B_k+\widetilde{\mathbf N}_{m,k}^{(w)},
\end{aligned}\tag{30}
$$

其中 $\Delta\mathbf A_N$ 与 $\Delta\mathbf A_{Q,k}$ 分别为 $\mathbf A_N$ 与 $\mathbf A_{Q,k}$ 的估计误差，$\widetilde{\mathbf N}_{m,k}^{(w)}$ 为包含噪声以及来自 $\mathbf A_N$、$\mathbf A_{Q,k}$ 估计误差的等效噪声矩阵。在下一小节中，基于预处理后的信号矩阵 $\widetilde{\mathbf Y}_{m,k}^{(w)}$（$\forall k$），先给出级联信道剩余参数估计的信号预处理，随后给出典型用户（为方便记为**用户 1**）的剩余参数估计，最后利用缩放特性介绍其他用户（记为 $k$，$k\ne1$）的剩余参数估计。

**3）基于 EVSA 的级联信道剩余参数估计信号处理**：根据（30）中的信号模型，基于 EVSA 思想进行信号处理。具体地，我们把具有 $J_k$ 条路径的多天线用户 $k$ 的信道参数估计转换为 $J_k$ 个单天线、单路径虚拟用户的等效估计。该等效转换允许我们逐个考虑每个虚拟用户 $(k,j)$（$k\in\{1,\ldots,K\}$、$j\in\{1,\ldots,J_k\}$）。据此，取 $\widetilde{\mathbf Y}_{m,k}^{(w)}$ 的第 $j$ 列（$1\le j\le J_k$）得到 $\tilde{\mathbf y}_{m,k,j}^{(w)}$：

$$
\tilde{\mathbf y}_{m,k,j}^{(w)}=\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\boldsymbol\phi_w\}[\mathbf A_{M,k}]_{(:,j)}\beta_{k,j}+\tilde{\mathbf n}_{m,k,j}^{(w)}=\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{[\mathbf A_{M,k}]_{(:,j)}\beta_{k,j}\}\boldsymbol\phi_w+\tilde{\mathbf n}_{m,k,j}^{(w)},\tag{32}
$$

其中 $\tilde{\mathbf n}_{m,k,j}^{(w)}=[\widetilde{\mathbf N}_{m,k}^{(w)}]_{(:,j)}$ 为相应噪声向量。随后堆叠全部 $\tilde{\mathbf y}_{m,k,j}^{(w)}$（$1\le w\le T_k$），得到虚拟用户 $(k,j)$ 的等效测量矩阵 $\widetilde{\mathbf Y}_{\mathrm{vir},k,j}=[\tilde{\mathbf y}_{m,k,j}^{(1)},\ldots,\tilde{\mathbf y}_{m,k,j}^{(T_k)}]\in\mathbb C^{L\times T_k}$：

$$
\begin{aligned}
\widetilde{\mathbf Y}_{\mathrm{vir},k,j}&=\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{[\mathbf A_{M,k}]_{(:,j)}\beta_{k,j}\}[\boldsymbol\phi_1,\ldots,\boldsymbol\phi_{T_k}]+[\tilde{\mathbf n}_{m,k,j}^{(1)},\ldots,\tilde{\mathbf n}_{m,k,j}^{(T_k)}]\\
&=\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\tilde{\mathbf h}_{k,j}\}\widetilde{\mathbf E}_{s,k}+\widetilde{\mathbf N}_{\mathrm{vir},k,j},
\end{aligned}\tag{33}
$$

其中 $\widetilde{\mathbf E}_{s,k}$ 由（25）定义；第三个等式中 $\widetilde{\mathbf N}_{\mathrm{vir},k,j}=[\tilde{\mathbf n}_{m,k,j}^{(1)},\ldots,\tilde{\mathbf n}_{m,k,j}^{(T_k)}]$ 为虚拟用户 $(k,j)$ 的相应噪声矩阵。（33）中 $\tilde{\mathbf h}_{k,j}$ 为虚拟单天线用户 $(k,j)$ 对应的用户—RIS 信道：

$$
\tilde{\mathbf h}_{k,j}\triangleq[\mathbf A_{M,k}]_{(:,j)}\beta_{k,j}=\beta_{k,j}\mathbf a_M(\varphi_{k,j},\theta_{k,j}).\tag{34}
$$

**4）典型用户级联信道的剩余参数估计**：如第 III-D2 节末尾所述，本部分分析典型用户（即用户 1，脚注 4）的剩余参数估计。对用户 1 取（33）的共轭转置，并取 $\widetilde{\mathbf Y}_{\mathrm{vir},1,j}^H$ 的第 $u$ 列得到 $\tilde{\mathbf y}_u^{(1,j)}$：

$$
\tilde{\mathbf y}_u^{(1,j)}=\widetilde{\mathbf E}_{s,1}^H\operatorname{Diag}\{\tilde{\mathbf h}_{1,j}^\ast\}[\mathbf A_M\boldsymbol\Lambda^\ast]_{(:,u)}+[\widetilde{\mathbf N}_{\mathrm{vir},1,j}^H]_{(:,u)}=\widetilde{\mathbf E}_{s,1}^H\mathbf w_u+\tilde{\mathbf n}_u^{(1,j)},\tag{35}
$$

其中 $u$ 由 $u=\arg\max_{1\le l\le L}\left\|[\widetilde{\mathbf Y}_{\mathrm{vir},1,j}^H]_{(:,l)}\right\|_2^2$ 确定，$\tilde{\mathbf n}_u^{(1,j)}=[\widetilde{\mathbf N}_{\mathrm{vir},1,j}^H]_{(:,u)}$ 为相应噪声向量，第二个等式中的 $\mathbf w_u$ 由 $\mathbf w_l=\alpha_l^\ast\beta_{1,j}^\ast\mathbf a_M(\omega_l-\varphi_{1,j},\mu_l-\theta_{1,j})$（取 $l=u$）给出。（35）中的参数估计可表述为单测量向量（SMV）情形下的 1-稀疏信号恢复问题：

$$
\tilde{\mathbf y}_u^{(1,j)}=\widetilde{\mathbf E}_{s,1}^H(\mathbf A_1\otimes\mathbf A_2)\boldsymbol\tau+\tilde{\mathbf n}_u^{(1,j)},\tag{36}
$$

其中 $\mathbf A_1\in\mathbb C^{M_1\times F_1}$ 与 $\mathbf A_2\in\mathbb C^{M_2\times F_2}$ 为过完备字典矩阵，原子范围分别为 $\left[-\frac{d}{\lambda_c},\left(2-\frac{4}{F_1}\right)\frac{d}{\lambda_c}\right]$ 与 $\left[-\frac{d}{\lambda_c},\left(2-\frac{4}{F_2}\right)\frac{d}{\lambda_c}\right]$（原文第二处范围也印作 $F_1$，疑为笔误，见注），分辨率分别为 $2/F_1$ 与 $2/F_2$。$\boldsymbol\tau\in\mathbb C^{F_1F_2\times1}$ 为只有一个非零元素的稀疏向量。利用算法 1 中的 SOMP，可获得 $(\omega_u-\varphi_{1,j})$、$(\mu_u-\theta_{1,j})$ 与 $\alpha_u^\ast\beta_{1,j}^\ast$ 的估计。

> **原文疑点：** （36）下方给出的两个字典原子范围均写作 $\left[-\frac{d}{\lambda_c},\left(2-\frac{4}{F_1}\right)\frac{d}{\lambda_c}\right]$，第二个范围中出现 $F_1$ 而对应字典为 $\mathbf A_2\in\mathbb C^{M_2\times F_2}$，疑原文应为 $F_2$。译文照录原式并在此加注，未擅自改动。

在得到 $\mathbf w_u$、$(\omega_u-\varphi_{1,j},\mu_u-\theta_{1,j})$ 与 $\alpha_u^\ast\beta_{1,j}^\ast$ 的估计后，利用 RIS—BS 信道 $\mathbf H$ 不同路径之间的相关性，估计 $l\ne u$ 时的向量 $\mathbf w_l$ 及相应参数 $(\omega_l-\varphi_{1,j},\mu_l-\theta_{1,j})$ 与 $\alpha_l^\ast\beta_{1,j}^\ast$。具体地，上述参数估计可转化为对相关因子 $\gamma_l\triangleq\alpha_l^\ast/\alpha_u^\ast$ 与 $(\Delta\omega_l,\Delta\mu_l)\triangleq(\omega_l-\omega_u,\mu_l-\mu_u)$ 的估计（$\forall l\ne u$）。取矩阵 $\widetilde{\mathbf Y}_{\mathrm{vir},1,j}$ 的第 $l$ 行（$l\ne u$）得到 $\tilde{\mathbf y}_l^{(1,j)}$：

$$
\begin{aligned}
\tilde{\mathbf y}_l^{(1,j)}&=\widetilde{\mathbf E}_{s,1}^H\mathbf a_M(\omega_l-\varphi_{1,j},\mu_l-\theta_{1,j})\alpha_l^\ast\beta_{1,j}^\ast+\tilde{\mathbf n}_l^{(1,j)}\\
&=\widetilde{\mathbf E}_{s,1}^H\operatorname{Diag}\{\mathbf w_u\}\mathbf a_M(\Delta\omega_l,\Delta\mu_l)\gamma_l+\tilde{\mathbf n}_l^{(1,j)}=\mathbf v(\Delta\omega_l,\Delta\mu_l)\gamma_l+\tilde{\mathbf n}_l^{(1,j)},
\end{aligned}\tag{37}
$$

其中 $\mathbf v(\Delta\omega_l,\Delta\mu_l)\triangleq\widetilde{\mathbf E}_{s,1}^H\operatorname{Diag}\{\mathbf w_u\}\mathbf a_M(\Delta\omega_l,\Delta\mu_l)$。与（13）相关的问题类似，用 SNL-LS 算法 $(L-1)$ 次即可获得 $\{(\Delta\omega_l,\Delta\mu_l)\}_{l=1}^{L}$ 与 $\{\gamma_l\}_{l=1}^{L}$ 的估计；其中的二维搜索准则（原文式（31），亦见算法 2 第 9—10 步）为

$$
(\Delta\hat\omega_l,\Delta\hat\mu_l)=\arg\max\frac{\left|\left\langle\tilde{\mathbf y}_l^{(1,j)},\mathbf v(\Delta\omega_l,\Delta\mu_l)\right\rangle\right|^2}{\left|\mathbf v(\Delta\omega_l,\Delta\mu_l)\right|^2},\tag{31}
$$

搜索范围取 $\left[-2\frac{d}{\lambda_c},2\frac{d}{\lambda_c}\right]$。结合所得 $(\omega_u-\varphi_{1,j})$、$(\mu_u-\theta_{1,j})$ 与 $\alpha_u^\ast\beta_{1,j}^\ast$，即可计算 $\{(\omega_l-\varphi_{1,j})\}_{l=1}^{L}$、$\{(\mu_l-\theta_{1,j})\}_{l=1}^{L}$ 与 $\{\alpha_l^\ast\beta_{1,j}^\ast\}_{l=1}^{L}$ 的估计。

显然，重复（35）—（37）的估计过程 $J_1$ 次，即可获得虚拟用户 $(1,j)$（$\forall j\in\{1,\ldots,J_1\}$）级联信道的全部参数。不过也可采用如下替代方法：先考虑典型虚拟用户 $(1,1)$ 的估计，得到 $\{(\omega_l-\varphi_{1,1})\}_{l=1}^{L}$、$\{(\mu_l-\theta_{1,1})\}_{l=1}^{L}$ 与 $\{\alpha_l^\ast\beta_{1,1}^\ast\}_{l=1}^{L}$；再利用相关因子 $\{\Delta\omega_l=\omega_l-\omega_u,\ \Delta\mu_l=\mu_l-\mu_u,\ \gamma_l=\alpha_l^\ast/\alpha_u^\ast\}_{l=1}^{L}$ 的估计，获得其余虚拟用户 $(1,j)$（$j\ne1$）的参数估计，即 $j\ne1$ 时的 $(\omega_u-\varphi_{1,j})$、$(\mu_u-\theta_{1,j})$ 与 $\alpha_u^\ast\beta_{1,j}^\ast$。最后基于（5）得到估计 $\widehat{\mathbf G}_1$。典型用户级联信道的剩余参数估计总结于算法 2。

> **脚注 4**：为保证较高估计性能，选择距离 RIS 最近的用户作为典型用户，因为其接收信号最强。

**算法 2**　估计典型用户级联信道的剩余参数

**输入**：$\{\widetilde{\mathbf Y}_{\mathrm{vir},1,j}\}_{j=1}^{J_1}$ 与 $\mathbf A_1$、$\mathbf A_2$。
1. **阶段 1**：对虚拟用户 $(1,1)$ 作估计。
2. 　按（35）计算 $\tilde{\mathbf y}_u^{(1,1)}=\left[\widetilde{\mathbf Y}_{\mathrm{vir},1,j}^H\right]_{(:,u)}$。
3. 　计算等效字典 $\boldsymbol\Upsilon=\widetilde{\mathbf E}_{s,1}^H(\mathbf A_1\otimes\mathbf A_2)$。
4. 　求 $a=\arg\max_{i=1,\ldots,F_1F_2}\left\|\boldsymbol\Upsilon_{(:,i)}^H\tilde{\mathbf y}_u^{(1,1)}\right\|$。
5. 　获得 $\alpha_u^\ast\beta_{1,1}^\ast$ 的估计。
6. 　计算 $a_{F_1}=\left\lceil\frac{a}{F_2}\right\rceil$、$a_{F_2}=a-F_2(a_{F_1}-1)$。
7. 　参照字典矩阵 $\mathbf A_1$、$\mathbf A_2$ 的索引，求 $\omega_u-\varphi_{1,1}$ 与 $\mu_u-\theta_{1,1}$ 的估计。
8. 　**for** $1\le l\le L$（$l\ne u$）**do**
9. 　　在 $\left[-2\frac{d}{\lambda_c},2\frac{d}{\lambda_c}\right]$ 内搜索 $\Delta\hat\omega_l$ 与 $\Delta\hat\mu_l$：
10.　　　$(\Delta\hat\omega_l,\Delta\hat\mu_l)=\arg\max\dfrac{\left|\left\langle\tilde{\mathbf y}_l^{(1,j)},\mathbf v(\Delta\omega_l,\Delta\mu_l)\right\rangle\right|^2}{\left|\mathbf v(\Delta\omega_l,\Delta\mu_l)\right|^2}$。
11.　　计算 $\hat\gamma_l=\mathbf v(\Delta\hat\omega_l,\Delta\hat\mu_l)^\dagger\tilde{\mathbf y}_l^{(1,1)}$。
12.　　计算 $\widehat{\omega_l-\varphi_{1,1}}=\widehat{\omega_u-\varphi_{1,1}}+\Delta\hat\omega_l$、$\widehat{\mu_l-\theta_{1,1}}=\widehat{\mu_u-\theta_{1,1}}+\Delta\hat\mu_l$、$\widehat{\alpha_l^\ast\beta_{1,1}^\ast}=\hat\gamma_l\widehat{\alpha_u^\ast\beta_{1,1}^\ast}$。
13.　**end for**
14.　获得 $\{\widehat{\omega_l-\varphi_{1,1}}\}_{l=1}^{L}$、$\{\widehat{\mu_l-\theta_{1,1}}\}_{l=1}^{L}$、$\{\widehat{\alpha_l^\ast\beta_{1,1}^\ast}\}_{l=1}^{L}$、$\{\Delta\hat\omega_l\}_{l=1}^{L}$、$\{\Delta\hat\mu_l\}_{l=1}^{L}$ 与 $\{\hat\gamma_l\}_{l=1}^{L}$。
15. **阶段 2**：对虚拟用户 $(1,j)$（$j\ne1$）作估计。
16. **for** $2\le j\le J_1$ **do**
17. 　求 $a_j=\arg\max_{i=1,\ldots,F_1F_2}\left\|\boldsymbol\Upsilon_{(:,i)}^H\tilde{\mathbf y}_u^{(1,j)}\right\|$。
18. 　获得 $\omega_u-\varphi_{1,j}$、$\mu_u-\theta_{1,j}$ 与 $\alpha_u^\ast\beta_{1,j}^\ast$ 的估计。
19. 　计算 $\widehat{\omega_l-\varphi_{1,j}}=\widehat{\omega_u-\varphi_{1,j}}+\Delta\hat\omega_l$、$\widehat{\mu_l-\theta_{1,j}}=\widehat{\mu_u-\theta_{1,j}}+\Delta\hat\mu_l$、$\widehat{\alpha_l^\ast\beta_{1,j}^\ast}=\hat\gamma_l\widehat{\alpha_u^\ast\beta_{1,j}^\ast}$（$1\le l\le L$）。
20. **end for**
21. 获得 $j\in\{1,\ldots,J_1\}$ 的 $\{\widehat{\omega_l-\varphi_{1,j}}\}_{l=1}^{L}$、$\{\widehat{\mu_l-\theta_{1,j}}\}_{l=1}^{L}$、$\{\widehat{\alpha_l^\ast\beta_{1,j}^\ast}\}_{l=1}^{L}$。
**输出**：$\widehat{\mathbf G}_1$。

**5）其他用户级联信道的剩余参数估计**：对其他用户仍采用 EVSA 方法，即把剩余多天线用户的估计转换为 $\sum_{k=2}^{K}J_k$ 个单天线、单路径用户的估计。此外，基于 $\widehat{\mathbf G}_1$ 构造矩阵 $\boldsymbol\Lambda$ 与 $\mathbf A_M$ 的替代量，记为 $\boldsymbol\Lambda_{\mathrm{rec}}$ 与 $\mathbf A_{M,\mathrm{rec}}$，从而降低估计 $\mathbf G_k$（$\forall k\ne1$）剩余参数所需的导频开销。具体地，构造

$$
\boldsymbol\Lambda_{\mathrm{rec}}\triangleq\left(\alpha_u^\ast\beta_{1,1}^\ast\operatorname{Diag}\{\gamma_1,\gamma_2,\ldots,\gamma_L\}\right)^\ast,\tag{38}
$$

$$
\mathbf A_{M,\mathrm{rec}}\triangleq\operatorname{Diag}\{\mathbf a_M(\omega_u-\varphi_{1,1},\mu_u-\theta_{1,1})\}\mathbf A_\Delta.\tag{39}
$$

（38）中 $\alpha_u^\ast\beta_{1,1}^\ast$ 与 $\{\gamma_l\}_{l=1}^{L}$ 已由（36）估计得到；（39）中 $(\omega_u-\varphi_{1,1},\mu_u-\theta_{1,1})$ 已由（36）估计得到，且 $\mathbf A_\Delta\triangleq[\mathbf a_M(\Delta\omega_1,\Delta\mu_1),\ldots,\mathbf a_M(\Delta\omega_L,\Delta\mu_L)]$，其中 $\{(\Delta\omega_l,\Delta\mu_l)\}_{l=1}^{L}$ 由（31）估计得到。随后确定 $\tilde{\mathbf h}_{k,j}$ 的替代量 $\tilde{\mathbf h}_{\mathrm{rec},k,j}$，使其满足等式 $\boldsymbol\Lambda\mathbf A_M^H\operatorname{Diag}\{\tilde{\mathbf h}_{k,j}\}\widetilde{\mathbf E}_{s,k}=\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H\operatorname{Diag}\{\tilde{\mathbf h}_{\mathrm{rec},k,j}\}\widetilde{\mathbf E}_{s,k}$。可推得 $\tilde{\mathbf h}_{\mathrm{rec},k,j}$ 为

$$
\tilde{\mathbf h}_{\mathrm{rec},k,j}=\operatorname{Diag}\{\mathbf a_M(-\varphi_{1,1},-\theta_{1,1})\}\tilde{\mathbf h}_{k,j}/\beta_{1,1}=\mathbf a_M(\varphi_{k,j}-\varphi_{1,1},\theta_{k,j}-\theta_{1,1})\beta_{k,j}/\beta_{1,1}.\tag{40}
$$

基于该重构，对 $k\ne1$ 有 $\widetilde{\mathbf Y}_{\mathrm{rec},k,j}$：

$$
\widetilde{\mathbf Y}_{\mathrm{rec},k,j}=\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H\operatorname{Diag}\{\tilde{\mathbf h}_{\mathrm{rec},k,j}\}\widetilde{\mathbf E}_{s,k}+\widetilde{\mathbf N}_{\mathrm{vir},k,j}.\tag{41}
$$

对 $\widetilde{\mathbf Y}_{\mathrm{rec},k,j}$ 向量化，可得虚拟用户 $(k,j)$（$k\ne1$）的测量向量 $\tilde{\mathbf x}_{k,j}\in\mathbb C^{LT_k\times1}$：

$$
\tilde{\mathbf x}_{k,j}=\operatorname{vec}\left(\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H\operatorname{Diag}\{\tilde{\mathbf h}_{\mathrm{rec},k,j}\}\widetilde{\mathbf E}_{s,k}+\widetilde{\mathbf N}_{\mathrm{vir},k,j}\right)=\left(\widetilde{\mathbf E}_{s,k}^T\diamond(\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H)\right)\tilde{\mathbf h}_{\mathrm{rec},k,j}+\tilde{\mathbf n}_{\mathrm{vec},k,j},\tag{42}
$$

其中 $\tilde{\mathbf n}_{\mathrm{vec},k,j}=\operatorname{vec}(\widetilde{\mathbf N}_{\mathrm{vir},k,j})$ 为虚拟用户 $(k,j)$ 的相应等效噪声向量。沿用与求解（35）相关估计问题相同的步骤，（42）中参数的估计可通过求解如下 1-稀疏信号恢复问题得到：

$$
\tilde{\mathbf x}_{k,j}=\left(\widetilde{\mathbf E}_{s,k}^T\diamond(\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H)\right)(\mathbf A_1\otimes\mathbf A_2)\boldsymbol\varrho+\tilde{\mathbf n}_{\mathrm{vec},k,j},\tag{43}
$$

其中 $\mathbf A_1$ 与 $\mathbf A_2$ 为（36）中定义的过完备字典矩阵，$\boldsymbol\varrho\in\mathbb C^{F_1F_2\times1}$ 为只有一个非零元素的稀疏向量。利用 SOMP 算法可得 $\tilde{\mathbf h}_{\mathrm{rec},k,j}$（$\forall j\in\{1,\ldots,J_k\}$）的估计及相应信道参数，即 $\{\varphi_{k,j}-\varphi_{1,1}\}_{j=1}^{J_k}$、$\{\theta_{k,j}-\theta_{1,1}\}_{j=1}^{J_k}$ 与 $\{\beta_{k,j}/\beta_{1,1}\}_{j=1}^{J_k}$。于是可得 $\mathbf G_k$（$k\ne1$）的估计 $\widehat{\mathbf G}_k$（$k\ne1$）。其他用户级联信道的剩余参数估计总结于算法 3。

**算法 3**　估计其他用户级联信道的剩余参数

**输入**：对 $k\in\{2,\ldots,K\}$ 的等效测量矩阵 $\{\widetilde{\mathbf Y}_{\mathrm{vir},k,j}\}_{j=1}^{J_k}$、过完备字典矩阵 $\mathbf A_1$、$\mathbf A_2$，以及已估计的 $\{\widehat{\omega_l-\varphi_{1,1}}\}_{l=1}^{L}$、$\{\widehat{\mu_l-\theta_{1,1}}\}_{l=1}^{L}$ 与 $\{\widehat{\alpha_l^\ast\beta_{1,1}^\ast}\}_{l=1}^{L}$。
1. 依据（38）（39）分别构造 $\boldsymbol\Lambda_{\mathrm{rec}}$ 与 $\mathbf A_{M,\mathrm{rec}}$。
2. 计算等效字典 $\boldsymbol\Sigma_k=\left(\widetilde{\mathbf E}_{s,k}^T\diamond(\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H)\right)(\mathbf A_1\otimes\mathbf A_2)$（即原文式（44），见算法后说明）。
3. **for** $1\le j\le J_k$ **do**
4. 　计算 $\tilde{\mathbf x}_{k,j}=\operatorname{vec}(\widetilde{\mathbf Y}_{\mathrm{rec},k,j})$。
5. 　求 $p=\arg\max_{i=1,\ldots,F_1F_2}\left\|(\boldsymbol\Sigma_k)_{(:,p)}^H\tilde{\mathbf x}_{k,j}\right\|$。
6. 　获得 $\beta_{k,j}/\beta_{1,1}$，并计算索引 $p_1=\left\lceil\frac{p}{F_2}\right\rceil$、$p_2=p-F_2(p_1-1)$。
7. 　参照字典矩阵 $\mathbf A_1$、$\mathbf A_2$ 的索引，求 $\widehat{\varphi_{k,j}-\varphi_{1,1}}$ 与 $\widehat{\theta_{k,j}-\theta_{1,1}}$ 的估计。
8. 　计算 $\widehat{\omega_l-\varphi_{k,j}}=\widehat{\omega_l-\varphi_{1,1}}-\widehat{\varphi_{k,j}-\varphi_{1,1}}$、$\widehat{\mu_l-\theta_{k,j}}=\widehat{\mu_l-\theta_{1,1}}-\widehat{\theta_{k,j}-\theta_{1,1}}$ 与 $\widehat{\alpha_l^\ast\beta_{k,j}^\ast}=\widehat{\alpha_l^\ast\beta_{1,1}^\ast}\widehat{\beta_{k,j}/\beta_{1,1}}$（$1\le l\le L$）。
9. **end for**
10. 获得对 $\forall l\in\{1,\ldots,L\}$ 与 $\forall k\in\{2,\ldots,K\}$ 的 $\{(\omega_l-\varphi_{k,j})\}_{j=1}^{J_k}$、$\{(\mu_l-\theta_{k,j})\}_{j=1}^{J_k}$ 与 $\{\alpha_l^\ast\beta_{k,j}^\ast\}_{j=1}^{J_k}$。
**输出**：$\widehat{\mathbf G}_k$，$k\in\{2,\ldots,K\}$。

> **式（44）说明：** 算法 3 第 2 步中的等效字典即原文式（44）：
> $$
> \boldsymbol\Sigma_k=\left(\widetilde{\mathbf E}_{s,k}^T\diamond(\boldsymbol\Lambda_{\mathrm{rec}}\mathbf A_{M,\mathrm{rec}}^H)\right)(\mathbf A_1\otimes\mathbf A_2).\tag{44}
> $$

**图 3**：第 I 与第 II 阶段信号预处理示意图（上图：第 I 阶段获取用于估计直达信道参数的等效测量矩阵；下图：第 II 阶段获取用于估计用户—RIS 信道 AoD 的等效测量矩阵）。
**图 4**：第 III 阶段信号预处理示意图（重组：合并具有相同 RIS 等效相移向量的测量信号；右乘/左乘后得到用于估计 RIS—BS 信道 AoA 的等效测量矩阵；并给出典型用户与其他用户级联信道剩余参数的估计流程）。

## IV. 导频开销与复杂度分析

本节分析所提方法的导频开销与复杂度。假设 $\{I_k\}_{k=1}^{K}=I$、$\{J_k\}_{k=1}^{K}=J$、$\{Q_k\}_{k=1}^{K}=Q$、$\{X_k\}_{k=1}^{K}=X$。导频信号数量对稀疏信号恢复问题有显著影响。为求解 $h$-稀疏、维数为 $n$ 的恢复问题，所需测量数 $m$ 应为 $O(h\log(n))$ 量级 [30]；我们用复杂度为 $O(mnh)$ 的 OMP 算法求解 [33]。Kronecker 压缩感知所需的测量数也遵循该原则 [34]。

### A. 导频开销

**1）段 I 的导频开销分析**：在直达信道估计中，分析估计 AoD 所需导频开销。对（10）对应的 $I$-稀疏恢复问题，等效感知矩阵 $\mathbf F=\mathbf S_k^H(\mathbf D_1\otimes\mathbf D_2)$ 的维数为 $T_d\times B_1B_2$，其中 $B_1\ge Q_1$、$B_2\ge Q_2$。因此所需导频开销应满足 $T_d\ge O(I\log(B_1B_2))\ge O(I\log(Q_1Q_2))=O(I\log(Q))$，这恰好满足（12）中 $\widehat{\mathbf D}_{Q,k}^H\mathbf S_k$ 的右伪逆存在的维数条件。另一方面，在用户—RIS 信道 AoD 估计中，同理，所需导频开销应满足 $T_{\mathrm{AoD}}\ge O(J\log(Q))$，以求解（19）对应的 $J$-稀疏恢复问题。因此对图 2 所示的所提信道估计协议，段 I 满足 $T_f=\max\{T_d,T_{\mathrm{AoD}}\}=\max\{I,J\}\log(Q)$。综上，对全部用户，第 I 与第 II 阶段所需导频开销满足 $2KT_f\ge O(2K\max\{I,J\}\log(Q))$。

> **原文疑点（排版）：** 原文该处印作 “$2KT_f \geqslant \mathcal O(2K\max(Q)\{I\log, J\})$”，括号与乘子位置明显混排；按上下文（$T_f=\max\{I,J\}\log(Q)$ 的 $2K$ 倍）整理为上式的等价形式，未改数量级，待核对。

**2）段 II 的导频开销分析**：分析图 2 中 $T_k$ 与 $X_k$ 的数量。对典型用户与其他用户，为保证（30）中 $\widehat{\mathbf A}_{Q,k}^H\mathbf S_{s,k}$ 的右伪逆存在，应满足 $X_k\ge J_k$。典型用户与其他用户所需导频不同。对典型用户的剩余参数估计，只需解（36）所示的 1-稀疏信号恢复问题，故 $T_1$ 满足 $T_1\ge O(\log(M))$。考虑上述分析与图 2 的协议设计，估计典型用户 1 级联信道所需导频开销（即时间块 3 到时间块 $X_k+2$ 的时隙数）为 $X_1(T_1-1)\ge O(J_1(\log(M)-1))$。接着考虑其他用户（即用户 $k\in\{2,\ldots,K\}$）的导频开销：为估计其他用户的剩余参数，导频开销应满足 $LT_k\ge O(\log(M))$，即 $T_k\ge\log(M)/L$，以处理（43）对应的 1-稀疏恢复问题。考虑共 $(K-1)$ 个用户，其他用户所需导频开销为 $(K-1)X_k(T_k-1)\ge(K-1)O(J(\log(M)/L-1))$。另一方面，如图 2 与图 4 所示，应满足 $T_{f,k}\ge X_k$（$\forall k\in\mathcal K$），以便对 $1\le x_k\le X_k$ 得到（23）中的重组信号 $\mathbf Y_{s,k,x_k}$。因此，对 MU-MIMO 系统，最小所需导频开销为 $2K\log(Q)\max\{I,J\}+J(L+K-1)\log(M)/L-KJ$。表 I 汇总了不同方法的导频开销。

**表 I　不同估计方法的导频开销**（按原表逐格转录）

| 方法 | 最小导频开销 |
| --- | --- |
| Proposed（所提） | $2K\log(Q)\max\{I,J\}+J(L+K-1)\log(M)/L-KJ$ |
| Proposed-O | $2K\log(Q)\max\{I,J\}+JK\log(M)-KJ$ |
| ON-OFF | $IK\log(Q)+JK\log(Q)+JK\log(M)$ |
| Direct-OMP | $2K\log(Q)\max\{I,J\}+JLK\log(M)$ |
| SBL | $2K\log(Q)\max\{I,J\}+\gg JLK\log(M)$ |

注：原表脚注为 “For SBL, the pilot overhead is often significantly larger [35].”（对 SBL，导频开销通常显著更大 [35]），表中“$\gg$”即原文用于表示远大于的记号。

### B. 复杂度分析

第 I 阶段的复杂度来自维数为 $B_1B_2$、需 $I\log(Q)$ 次测量的 $I$-稀疏信号恢复问题（10），其复杂度为 $O\left(I^2\log(Q)B_1B_2\right)$；此外还产生自 $I$ 个如（14）的 SNL-LS 问题，复杂度为 $O(INg_1g_2)$，其中 $g_1$、$g_2$ 分别为 $\sigma_{k,i}$ 与 $\xi_{k,i}$ 的网格点数。第 II 阶段主要来自稀疏信号恢复问题（19），复杂度为 $O\left(J^2\log(Q)B_1B_2\right)$。第 III 阶段用 UPA-DFT 算法估计 RIS—BS 的 AoA，复杂度为 $O(NT_k\log(N))=O(N\log(M)\log(N))$。通过 EVSA 预处理与相关因子，实现了低复杂度。对用户 1，算法 2 的复杂度主要来自 $J$ 个如（36）的稀疏信号恢复问题（$O(JF_1F_2\log(M))$），以及 $L-1$ 个如（31）的 SNL-LS 问题（$O((L-1)\log(M)d_1d_2)$），其中 $d_1$、$d_2$ 分别为 $\Delta\omega_l$ 与 $\Delta\mu_l$ 的网格点数。对其他用户 $k$（$1\le k\le K$），复杂度来自求解 $J$ 个如（43）的问题，其复杂度为 $O(J\log(M)F_1F_2)$。

## V. 仿真结果

本节给出仿真结果以评估所提统一信道估计协议的有效性。考虑窄带系统，载频 30 GHz、传输带宽 100 MHz。生成的信道增益 $\zeta_{k,i}$、$\beta_{k,j}$ 与 $\alpha_l$ 服从复高斯分布，即 $\zeta_{k,i}\sim\mathcal{CN}\left(0,10^{-3}D_{\mathrm{UB}}^{-3.9}\right)$、$\beta_{k,j}\sim\mathcal{CN}\left(0,10^{-3}D_{\mathrm{UR}}^{-2.2}\right)$ 与 $\alpha_l\sim\mathcal{CN}\left(0,10^{-3}D_{\mathrm{RB}}^{-2.8}\right)$。$D_{\mathrm{UB}}=100$ m、$D_{\mathrm{UR}}=40$ m 与 $D_{\mathrm{RB}}=80$ m 分别为用户与 BS、用户与 RIS、RIS 与 BS 之间的距离。信噪比（SNR）定义为 $\mathrm{SNR}=10\log\left(10^{-6}D_{\mathrm{RB}}^{-2.8}D_{\mathrm{UR}}^{-2.2}+10^{-3}D_{\mathrm{UB}}^{-3.75}\right)/\delta^2$。此外，参数 $N_1=N_2$、$M_1=M_2$、$K=5$、$Q_{k_1}=Q_{k_2}=6$、$\{I_k\}_{k=1}^{K}=I$、$\{J_k\}_{k=1}^{K}=J$；段 II 的时间块数设为相同值，即 $\{X_k\}_{k=1}^{K}=X$；RIS 采用 1 比特量化，即单元相移取自 $\{0,\pi\}$。估计性能指标选用归一化均方误差（NMSE）：级联信道估计定义为 $\mathrm{NMSE}=\mathbb E\left(\sum_{k=1}^{K}\|\widehat{\mathbf G}_k-\mathbf G_k\|_F^2\right)\big/\mathbb E\left(\sum_{k=1}^{K}\|\mathbf G_k\|_F^2\right)$，直达信道估计定义为 $\mathrm{NMSE}=\mathbb E\left(\sum_{k=1}^{K}\|\widehat{\mathbf H}_{d,k}-\mathbf H_{d,k}\|_F^2\right)\big/\mathbb E\left(\sum_{k=1}^{K}\|\mathbf H_{d,k}\|_F^2\right)$。

> **原文疑点（仿真参数不全）：** 原文该句只写 “$N_1=N_2$、$M_1=M_2$、$K=5$、$Q_{k_1}=Q_{k_2}=6$”，未直接给出 $N_1$、$M_1$ 的默认数值；各图图注另行给出（例如图 6 为 $N_1(N_2)=16$、$M_1(M_2)=16$，图 8 为 $N_1(N_2)=8$、$M_1(M_2)=16$）。此处照译并加注，未擅自补数。

我们将所提框架与 ON-OFF 框架比较，并在所提框架内评估不同具体估计算法。各方法描述如下：

- **Proposed（所提）**：采用所提信道估计协议，包括信号预处理、OMP 类算法与 EVSA 方法。
- **ON-OFF**：按第 III-C 节（20）（21）所述框架；为保证公平比较，采用与 Proposed 相同的具体估计算法。
- **Proposed-Ordinary（Proposed-O）**：采用所提信道估计协议但其他用户不使用 EVSA 方法，即对典型用户的估计流程简单重复 $K-1$ 次；用于与 Proposed 对比以展示 EVSA 方法的优势。
- **Direct-OMP**：在所提框架下，对（30）中级联信道的向量化直接估计把问题转化为具有大字典矩阵的 $LJ$ 个稀疏恢复问题。
- **Sparse Bayesian learning（SBL）**：在所提框架下，用 SBL 恢复（30）中的测量矩阵 $\widetilde{\mathbf Y}_{m,k}^{(w)}$；最大迭代次数 60，收敛阈值 $10^{-4}$。
- **Oracle**：视为所提方法的性能上界，即 BS 已知完美角度信息，信道增益在第 I 与第 III 阶段用 LS 算法估计。

为直接比较计算复杂度，图 5 给出不同参数下每次仿真所需的计算时间。相比其他方法，所提方法展现出显著更低的计算复杂度。由于所提三阶段协议在导频设计上的灵活性，仿真中 $T_{f,k}$ 与 $T_k$ 的分配遵循如下规则。第一，关于 $T_{f,k}$：在所提方法中，它指段 I 前两个时间块（即图 2 中的时间块 1 与时间块 2）内时隙的取值；而在 ON-OFF 方法中，$T_{f,k}$ 个时隙用于估计直视信道，另 $T_{f,k}$ 个时隙用于估计用户—RIS 信道的 AoD。第二，由于典型用户的 $T_1$ 与其他用户的 $T_k$ 取值不同，我们考虑 $T_k$ 的平均值，记为 $T$，视为每个时间块的平均时隙数；ON-OFF 方法也采用相同的 $T$ 设置。

**图 5**：不同变量下各方法的计算时间。图例含 Proposed、Proposed-O、ON-OFF、Direct-OMP、SBL，横轴为 $N$、$M$、$L$、$J$ 四组变量。

图 6 描绘直达与级联信道的 NMSE 随 SNR 的变化。对直达与级联信道估计，所提方法与 Oracle 方法之间的差距随 SNR 增大而减小，这意味着当 SNR 超过 0 dB 时角度被完美估计。在框架层面，所提方法在直达与级联信道估计上都优于 ON-OFF 方法；这一优势来自本方法把直达信道估计的噪声功率减半，并消除直达—级联误差传播。在算法层面，在相同导频开销与路径数下，所提算法的估计性能优于 Direct-OMP 与 SBL。

**图 6**：直达 (a) 与级联 (b) 信道估计的 NMSE 随 SNR 的变化；$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=16$、$M_1(M_2)=16$、$I=2$、$J=3$、$L=4$、$T_f=12$、$X=12$、$T=4$。

图 7 给出 NMSE 随 BS 与 RIS 阵元数的变化。更大的 $N$ 使测量数增加，从而提升估计精度。此外，我们分析了 RIS 阵元数对所提方法的影响：一方面，增大 $M$ 会增强接收信号功率，有利于估计性能；另一方面，更大的 $M$ 需要更多导频开销（见表 I），两种效应形成折中。如图 7 所示，当 $M_1$ 小于 40 时第一种因素占主导；但当 $M_1$ 过大而导频资源不足时第二种因素占主导，导致估计性能下降。只有在 $T$ 足够时，估计性能才随 $M$ 增大而提升。

**图 7**：$N_1$ 与 $M_1$ 变化时的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$I=2$、$J=3$、$L=4$、$T_f=12$、$X=12$；含 direct 与 cascaded 两组曲线及 $T$ 不足/充足的标注）。

图 8 展示 RIS—BS 信道路径数对级联信道估计 NMSE 的影响。RIS—BS 信道待估参数数量增加导致精度下降。当 RIS—BS 信道路径数较少且导频分配满足要求时，所提方法性能非常接近 Oracle 方法。对其他方法而言，增大 $T$ 与 $X$ 并未带来显著性能提升；当 $L$ 较大时，更多导频反而导致更差性能。这表明 ON-OFF 框架中的误差传播严重影响级联信道估计。类似地，图 9 描绘用户—RIS 信道路径数对级联信道估计 NMSE 的影响。

**图 8**：RIS 与 BS 之间路径数变化时级联信道估计的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=8$、$M_1(M_2)=16$、$I=2$、$J=3$）。
**图 9**：用户与 RIS 之间路径数变化时级联信道估计的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=8$、$M_1(M_2)=16$、$I=2$、$L=4$）。

图 10 验证所提方法在多用户场景中的性能。我们考察每个用户导频充足（虚线）与总导频固定（实线）两种情形。从图 10(a) 可见，即使用户数很多，所提方法对直达信道估计仍然有效；在图 10(b) 中比较 Proposed 与 Proposed-O，结果清楚表明 EVSA 技术在显著降低导频开销方面的关键作用，且随着服务用户增多其效率增益越来越可观。

**图 10**：不同用户数下各方法的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=16$、$M_1(M_2)=16$、$I=3$、$J=5$、$L=4$；(a)(b) 分别对应不同对比设置）。

最后，我们验证所提框架消除直达—级联误差传播的有效性。图 11 给出不同框架下信道估计 NMSE 随用户—BS 信道路径数的变化。从图 11(a) 可见，由于待估参数增多，所有框架的直达信道估计性能都随 $I$ 增大而恶化；所提框架的性能接近 Oracle，并明显优于 ON-OFF 框架。图 11(b) 显示所提框架的级联信道估计性能不受 $I$ 影响，而 ON-OFF 框架的性能随 $I$ 增大而退化——随着 $I$ 增大，直达信道估计误差更显著，从而恶化级联信道估计；相比之下，所提框架完全分离了直达与级联信道估计，消除了误差传播。

**图 11**：用户与 BS 之间路径数变化时直达 (a) 与级联 (b) 信道估计的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=8$、$M_1(M_2)=16$、$J=3$、$L=4$，其中 (b) 中 $X=14$）。

## VI. 结论

本文研究了存在直达链路的 RIS 辅助 MU-MIMO 毫米波系统的信道估计问题——由于难以从接收信号中独立估计直达与级联信道，该问题极具挑战且此前少有研究。本文提出一种新的三阶段统一信道估计框架，克服了现有 ON-OFF 方法需要开关 RIS 且受直达—级联误差传播影响的局限。通过精心设计导频向量与 RIS 向量，所提方法利用 $\pi$ 差分相移，并引入信号重组与发送导频序列的正交补空间，有效地从接收信号中分离直达与级联分量。大量仿真结果验证，所提方法相比现有方法可实现更低的导频开销与更高的精度。

## 图注与表注

**图 1**：RIS 辅助 MU-MIMO 毫米波通信系统示意（BS、RIS 与各用户，以及用户—BS 信道、用户—RIS 信道、RIS—BS 信道与 RIS 控制器）。
**图 2**：所提 RIS 辅助 MIMO 毫米波系统统一信道估计协议的时序图（段 I/段 II、时间块与时隙结构，及第 I—III 阶段处理示意）。
**图 3**：第 I 与第 II 阶段信号预处理示意图（上图：第 I 阶段获得用于估计直达信道参数的等效测量矩阵；下图：第 II 阶段获得用于估计用户—RIS 信道 AoD 的等效测量矩阵）。
**图 4**：第 III 阶段信号预处理示意图（合并具有相同 RIS 等效相移向量的测量信号，经左/右乘得到用于估计 RIS—BS 信道 AoA 的等效测量矩阵，并给出典型用户与其他用户级联信道剩余参数的估计流程）。
**图 5**：不同变量下各方法的计算时间（Proposed、Proposed-O、ON-OFF、Direct-OMP、SBL；变量 $N$、$M$、$L$、$J$）。
**图 6**：直达 (a) 与级联 (b) 信道估计的 NMSE 随 SNR 的变化（参数见正文；$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=16$、$M_1(M_2)=16$、$I=2$、$J=3$、$L=4$、$T_f=12$、$X=12$、$T=4$）。
**图 7**：$N_1$ 与 $M_1$ 变化时的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$I=2$、$J=3$、$L=4$、$T_f=12$、$X=12$）。
**图 8**：RIS—BS 路径数变化时级联信道估计的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=8$、$M_1(M_2)=16$、$I=2$、$J=3$）。
**图 9**：用户—RIS 路径数变化时级联信道估计的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=8$、$M_1(M_2)=16$、$I=2$、$L=4$）。
**图 10**：不同用户数下各方法的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=16$、$M_1(M_2)=16$、$I=3$、$J=5$、$L=4$）。
**图 11**：用户—BS 路径数变化时直达 (a) 与级联 (b) 信道估计的 NMSE（SNR$=0$ dB，$Q_{k_1}(Q_{k_2})=6$、$N_1(N_2)=8$、$M_1(M_2)=16$、$J=3$、$L=4$，(b) 中 $X=14$）。

**表注**：表 I 给出不同估计方法的最小导频开销，已在本页第 IV-A 节按原表逐格转录；原表脚注说明 SBL 的导频开销通常显著更大 [35]。

## 参考文献

> 以下按原文编号 [1]—[35] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “V .”“Y .”“¨” 等空格/变音伪影已按常规写法整理，书目内容未改动。

[1] C. Pan et al., “Reconfigurable intelligent surfaces for 6G systems: Principles, applications, and research directions,” IEEE Commun. Mag., vol. 59, no. 6, pp. 14–20, Jun. 2021.

[2] M. Di Renzo et al., “Smart radio environments empowered by reconfigurable intelligent surfaces: How it works, state of research, and the road ahead,” IEEE J. Sel. Areas Commun., vol. 38, no. 11, pp. 2450–2525, Jul. 2020.

[3] K. Zhi, C. Pan, H. Ren, and K. Wang, “Power scaling law analysis and phase shift optimization of RIS-aided massive MIMO systems with statistical CSI,” IEEE Trans. Commun., vol. 70, no. 5, pp. 3558–3574, Mar. 2022.

[4] C. Pan et al., “Multicell MIMO communications relying on intelligent reflecting surfaces,” IEEE Trans. Wireless Commun., vol. 19, no. 8, pp. 5218–5233, May 2020.

[5] C. Pan et al., “An overview of signal processing techniques for RIS/IRS-aided wireless systems,” IEEE J. Sel. Top. Signal Process., vol. 16, no. 5, pp. 883–917, Aug. 2022.

[6] A. L. Swindlehurst, G. Zhou, R. Liu, C. Pan, and M. Li, “Channel estimation with reconfigurable intelligent surfaces—A general framework,” Proc. IEEE, vol. 110, no. 9, pp. 1312–1338, May 2022.

[7] Z. Tan, P. Yang, and A. Nehorai, “Joint sparse recovery method for compressed sensing with structured dictionary mismatches,” IEEE Trans. Signal Process., vol. 62, no. 19, pp. 4997–5008, Jul. 2014.

[8] M. Wang, F. Gao, S. Jin, and H. Lin, “An overview of enhanced massive MIMO with array signal processing techniques,” IEEE J. Sel. Top. Signal Process., vol. 13, no. 5, pp. 886–901, Aug. 2019.

[9] X. Wu, S. Ma, X. Yang, and G. Yang, “Clustered sparse Bayesian learning based channel estimation for millimeter-wave massive MIMO systems,” IEEE Trans. Veh. Technol., vol. 71, no. 12, pp. 12 749–12 764, Aug. 2022.

[10] P. Wang, J. Fang, H. Duan, and H. Li, “Compressed channel estimation for intelligent reflecting surface-assisted millimeter wave systems,” IEEE Signal Process. Lett., vol. 27, pp. 905–909, May 2020.

[11] X. Wei, D. Shen, and L. Dai, “Channel estimation for RIS assisted wireless communications—part II: An improved solution based on double-structured sparsity,” IEEE Commun. Lett., vol. 25, no. 5, pp. 1403–1407, Jan. 2021.

[12] G. Zhou, C. Pan, H. Ren, P. Popovski, and A. L. Swindlehurst, “Channel estimation for RIS-aided multiuser millimeter-wave systems,” IEEE Trans. Signal Process., vol. 70, pp. 1478–1492, Mar. 2022.

[13] Z. Peng et al., “Channel estimation for RIS-aided multi-user mmWave systems with uniform planar arrays,” IEEE Trans. Commun., vol. 70, no. 12, pp. 8105–8122, Mar. 2022.

[14] Z. Peng et al., “Two-stage channel estimation for RIS-aided multiuser mmWave systems with reduced error propagation and pilot overhead,” vol. 71, pp. 3607–3622, Sept. 2023.

[15] J. He, H. Wymeersch, and M. Juntti, “Channel estimation for RIS-aided mmwave MIMO systems via atomic norm minimization,” IEEE Trans. Wireless Commun., vol. 20, no. 9, pp. 5786–5797, Apr. 2021.

[16] G. Zhou, C. Pan, H. Ren, K. Wang, and A. Nallanathan, “A framework of robust transmission design for IRS-aided MISO communications with imperfect cascaded channels,” IEEE Trans. Signal Process., vol. 68, pp. 5092–5106, Aug. 2020.

[17] Z. Wang, L. Liu, and S. Cui, “Channel estimation for intelligent reflecting surface assisted multiuser communications: Framework, algorithms, and analysis,” IEEE Trans. Wireless Commun., vol. 19, no. 10, pp. 6607–6620, Jun. 2020.

[18] S. Kim et al., “Practical channel estimation and phase shift design for intelligent reflecting surface empowered MIMO systems,” IEEE Trans. Wireless Commun., vol. 21, no. 8, pp. 6226–6241, Feb. 2022.

[19] W. Shen, Z. Qin, and A. Nallanathan, “Deep learning for super-resolution channel estimation in reconfigurable intelligent surface aided systems,” IEEE Trans. Commun., vol. 71, no. 3, pp. 1491–1503, Jan. 2023.

[20] H. Guo and V. K. N. Lau, “Uplink cascaded channel estimation for intelligent reflecting surface assisted multiuser MISO systems,” IEEE Trans. Signal Process., vol. 70, pp. 3964–3977, Jul. 2022.

[21] Z. Peng, T. Zhang, C. Pan et al., “Channel estimation for RIS-assisted multiuser mmwave systems with direct channels based on a novel space projection approach,” IEEE Commun. Lett., pp. 1–1, 2024.

[22] A. Kosasih, O. T. Demir, and E. Bjornson, “Parametric channel estimation for RIS-assisted wideband systems,” 2024. [Online]. Available: https://arxiv.org/abs/2412.13653

[23] S. Noh et al., “Joint direct and indirect channel estimation for RIS-assisted millimeter-wave systems based on array signal processing,” IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 8378–8391, Apr. 2023.

[24] F. Liu et al., “Intelligent metasurfaces with continuously tunable local surface impedance for multiple reconfigurable functions,” Phys. Rev. Appl., vol. 11, p. 044024, Apr. 2019.

[25] M. R. Akdeniz et al., “Millimeter wave channel modeling and cellular capacity evaluation,” IEEE J. Sel. Areas Commun., vol. 32, no. 6, pp. 1164–1179, Jun. 2014.

[26] X. Chen, H. Ren, C. Pan, Z. Peng, and J. Wang, “Effective dof-oriented optimal antenna spacing in near-field XL-MIMO systems,” IEEE Wireless Commun. Lett., vol. 14, no. 4, pp. 1129–1133, Apr. 2025.

[27] G. Gradoni and M. Di Renzo, “End-to-end mutual coupling aware communication model for reconfigurable intelligent surfaces: An electromagnetic-compliant approach based on mutual impedances,” IEEE Wireless Commun. Lett., vol. 10, no. 5, pp. 938–942, Jan. 2021.

[28] A. L. Swindlehurst, G. Zhou, R. Liu, C. Pan, and M. Li, “Channel estimation with reconfigurable intelligent surfaces—a general framework,” Proc. IEEE, vol. 110, no. 9, pp. 1312–1338, May 2022.

[29] X.-D. Zhang, Matrix Analysis and Applications. Cambridge University Press, 2017.

[30] E. Candes, J. Romberg, and T. Tao, “Robust uncertainty principles: exact signal reconstruction from highly incomplete frequency information,” IEEE Trans. Inf. Theory, vol. 52, no. 2, pp. 489–509, Jan. 2006.

[31] T. J. Cui, M. Q. Qi, X. Wan, J. Zhao, and Q. Cheng, “Coding metamaterials, digital metamaterials and programmable metamaterials,” Light Sci. Appl., vol. 3, no. 10, pp. e218–e218, Oct. 2014.

[32] N. V. Aravind, K. Abhinandan, V. V. Acharya, and S. Sumam David, “Comparison of omp and somp in the reconstruction of compressively sensed hyperspectral images,” in 2011 Int. Conf. Commun. Signal Process., Mar. 2011, pp. 188–192.

[33] K. Venugopal, A. Alkhateeb, N. González Prelcic, and R. W. Heath, “Channel estimation for hybrid architecture-based wideband millimeter wave systems,” IEEE J. Sel. Areas Commun., vol. 35, no. 9, pp. 1996–2009, Jun. 2017.

[34] Y. Rivenson and A. Stern, “Compressed imaging with a separable sensing operator,” IEEE Signal Process. Lett., vol. 16, no. 6, pp. 449–452, Mar. 2009.

[35] Z. Yang, L. Xie, and C. Zhang, “Off-grid direction of arrival estimation using sparse Bayesian inference,” IEEE Trans. Signal Process., vol. 61, no. 1, pp. 38–43, Oct. 2013.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含四条贡献、组织结构说明、脚注 1 与记号系统）；第 II 节系统模型（式（1）—（5）及脚注 2、3，图 1）；第 III 节统一信道估计（III-A 协议与图 2；III-B 第 I 阶段：式（6）—（14）、算法 1；III-C 第 II 阶段：式（15）—（19）与 ON-OFF 方法式（20）（21）；III-D 第 III 阶段：式（22）—（43）、引理 1 与证明、算法 2—3、脚注 4，图 3—4）；第 IV 节导频开销与复杂度分析（表 I 逐格，式（44）在算法 3 中引用）；第 V 节仿真结果（图 5—11 讨论）；第 VI 节结论；图 1—11 图注与表注；参考文献 [1]—[35] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—11 的图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I 为矢量表格，已用 PyMuPDF 渲染原 PDF 第 10 页逐格核对后转录；④原文三处疑点已加注未改数：组织说明缺少对第 IV 节的引用（§I 末）、式（36）下方第二个字典原子范围误用 $F_1$（疑应为 $F_2$）、仿真参数未给出 $N_1$/$M_1$ 默认数值（仅各图图注给出）；另有第 IV-A 节导频开销表达式排版混排，已按上下文整理并加注；⑤作者 Zhendong Peng 单位缺失（已加注）；⑥作者简介与版权声明不在正文范围，未收录。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
