---
layout: page
title: "可旋转天线系统的不完美 CSI 双时间尺度设计：速率分析与优化｜中文全文译文"
permalink: /papers/translations/2026-10-23-two-timescale-design-for-rotatable-antenna-systems-with-imperfect-csi-2605-04775/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/28c82c01455d353f/) · [原文 arXiv](https://arxiv.org/abs/2605.04775) · [全部目录](/papers/catalog/)

# 可旋转天线系统的不完美 CSI 双时间尺度设计：速率分析与优化

**原题：** Two-Timescale Design for Rotatable-Antenna Systems With Imperfect CSI: Rate Analysis and Orientation Optimization  
**作者：** Ziyuan Zheng、Qingqing Wu、Wen Chen。单位：上海交通大学集成电路学院（School of Integrated Circuits, Shanghai Jiao Tong University），中国上海 200240。邮箱：{zhengziyuan2024, qingqingwu, wenchen}@sjtu.edu.cn。  
**版本：** arXiv:2605.04775v1（eess.SP），v1 日期 2026 年 5 月 6 日；原文 13 页（IEEE 期刊论文格式）；2026-10-23 推荐。  
**范围与状态：** 全文中文译稿：摘要、第 I—VIII 节、图 1—10 图注、式（1）—（107）、算法 1、参考文献 [1]—[31]（英文原条目）。**原文全文无编号表格（仅图 1—10）**，故本页无表格可转录；图 1—10 图注已全部译出，图内曲线未数字化。原文本地 PDF 抽取文本含 60 个 NUL 字节，已生成去 NUL 干净副本用于核对（未修改原文件）。逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写与记号保留英文：RA（rotatable antenna，可旋转天线）、UPA（uniform planar array，均匀平面阵）、LoS/NLoS、MRC（maximum ratio combining，最大比合并）、wZF（weighted zero-forcing，加权迫零）、LMMSE（linear minimum mean squared error，线性最小均方误差）、UatF（use-and-then-forget）、NMSE（normalized MSE，归一化均方误差）、CSI（channel state information）、IRS（intelligent reflecting surface）、DoF、TDD、SINR、AWGN、PGA（projected gradient ascent，投影梯度上升）。记号：$\mathbf F=[\mathbf f_1,\ldots,\mathbf f_N]\in\mathbb R^{3\times N}$ 为全部 RA 的朝向（旋转）配置矩阵；$\mathbf f_n$（单位指向向量）为第 $n$ 个 RA 的视轴方向；$\mathbf w_n$、$\mathbf u_k$、$\mathbf c_q$ 分别为 RA、用户与散射簇位置；$\boldsymbol\mu_k(\mathbf F)$、$\mathbf R_k(\mathbf F)$、$\mathbf C_{\hat h,k}(\mathbf F)$、$\mathbf C_{e,k}(\mathbf F)$ 分别为信道 LoS 均值、信道协方差、LMMSE 估计协方差与估计误差协方差；$\mathbf F$ 与期望算子 $\mathbb E[\cdot]$ 的排版区分请以原文为准。**原文疑点/说明（按原文照录并加注）：** ①原文 §IV 的优化问题（P1）把期望写在 $\max_{\mathbf V(\hat{\mathbf H})}$ 之外，即 $\max_{\mathbf F}\ \mathbb E[\max_{\mathbf V(\hat{\mathbf H})}\bar R_{\mathrm{sum}}(\mathbf F)]$，并以（P2）给出基于统计量的可处理版本，按原文照录；②原文 §V 明确指出 wZF 的条件 UatF SINR 因朝向相关增益导致的非各向同性估计误差而难以精确取外期望，故构造**一阶统计替代**（式 (58)），该替代不是原期望的严格等价；③原文式 (62)—(66) 的"各向同性估计误差"假设在 RA 系统中一般**不成立**（原文明确说明），仅作为与经典 wZF 噪声增强形式的对照；④原文式 (73) 的方向增益导数在 $\mathbf f_n^T\mathbf s=0$ 边界取零次梯度（测度零集）；⑤原文 §VI-E 的复杂度阶 $\mathcal O(KN^3+K^2N^2)$ 与 $\mathcal O((K+1)N^3+K^2N^2+K^3)$ 假设公共矩阵每轮只求逆一次并复用；⑥原文图 7 的 "NMSE-opt. $\mathbf F$" 曲线由求解 $\min_{\mathbf F\in\mathcal F}\frac1K\sum_k\mathrm{NMSE}_k(\mathbf F)$ 得到（原文明确给出）；⑦原文数值参数中 $N=N_{\mathrm{row}}N_{\mathrm{col}}=2\times4$（原文式 (39) 附近以 $N=N_{\mathrm{row}}N_{\mathrm{col}}$ 记，§VII 取 $2\times4$）。

## 摘要

本文研究不完美信道状态信息（CSI）下配备可旋转天线（RA）阵列的上行多用户 MIMO 系统：每个基站天线可在一定角度区域内调整其视轴方向。为平衡性能与控制开销，我们提出**双时间尺度设计**：RA 朝向依据统计 CSI 在**大时间尺度**上优化，而线性接收合并器依据 LMMSE 信道估计在**每个相干块**更新。该框架下，我们推导了不完美 CSI 下 MRC 的**闭式 use-and-then-forget（UatF）速率表达式**与 wZF 的**闭式统计速率替代**，揭示 RA 旋转如何影响有用信号强度、估计误差引起的自干扰以及多用户干扰。分析表明：**最小化信道估计误差的朝向不同于最大化速率的朝向**；且 MRC 与 wZF 由于在信号聚合与误差感知用户分离上的机制不同，偏好**不同**的旋转配置。针对由此产生的非凸旋转设计问题，我们提出一种在**球冠乘积集**上的投影梯度算法，并给出所需信道统计量与速率指标的显式导数。数值结果验证大时间尺度替代的准确性，并显示 RA 优化带来的显著性能增益。

**关键词：** 可旋转天线；朝向优化；不完美信道状态信息；双时间尺度设计；最大比合并；加权迫零。

## I. 引言

多输入多输出（MIMO）是通过利用空间自由度（DoF）提升频谱效率的关键技术 [1]、[2]。随无线系统向更大带宽与更高频率演进，大规模天线阵列对补偿传播损耗与对多用户进行空间复用愈发重要 [3]、[4]。然而在许多实际相关场景中，仅增加天线数或发射功率往往收益递减：当用户信道高度相关、LoS 分量占主导，或信道仅被不完美已知时，传统固定图样阵列会留下部分可用 DoF 未被利用 [5]。这一局限推动了从**仅信号自适应**到**物理层自适应**的更广泛转变——可通过三条途径改善无线链路：重塑传播环境、重塑阵列几何、或重塑天线方向性 [6]。第一条途径以可重构无线环境（如智能反射面 IRS）[7]、[8] 为代表；第二条以可移动/流体天线为代表，通过适配天线位置利用有利空间点 [9]—[13]；第三条在保持天线位置固定的同时，通过旋转视轴改变每个阵元的**方向响应**，其吸引力在于阵列布局与射频互连可保持不变，却仍能获得更细的**方向域自适应** [14]—[16]。

可旋转天线（RA）通过硬件改进提供了这种机制 [16]—[19]。在 RA 使能阵列中，每个阵元具有方向性，并可在可行角度区域内操纵视轴。由于阵元增益依赖入射方向，RA 旋转同时重塑无线信道统计中的**确定性 LoS 均值**与**散射协方差**，从而影响上行接收的 CSI 质量与传输频谱效率。换言之，RA 旋转发生在数字合并**之前**，因而把物理阵列控制与信道估计、多用户检测耦合在一起。正是这种耦合使 RA 设计既富有前景又充满挑战。一方面，旋转阵列可改善方向增益与协方差条件；另一方面，朝向变化会改变 LMMSE 估计误差结构，进而在 MRC/wZF 这类依赖估计的接收机中形成复杂的速率—估计耦合。

在每个相干块上更新所有阵元朝向通常不切实际 [20]—[22]：这会造成可观的机械或电子控制开销，更重要的是需要在众多候选朝向上获取瞬时 CSI。由此产生**快衰落与慢朝向控制之间的时间尺度失配**。因此双时间尺度设计是 RA 使能多用户接收的自然且具实践动机的框架：大时间尺度上，依据由用户几何、散射体几何与大尺度衰落决定的缓慢变化统计 CSI 优化 RA 朝向；小时间尺度上，依据所选朝向对应的瞬时信道估计更新接收合并器。类似的时间尺度分离在 IRS 辅助系统与基于统计 CSI 的可移动天线设计等其他物理可重构无线架构中已被证明非常有效 [23]、[24]。但 RA 系统与这两类工作都不同：与 IRS 不同，RA 直接作用于接收阵列而非经由级联反射信道；与可移动天线不同，RA 不改变传播距离或阵元位置，而是改变**逐阵元方向灵敏度**，以另一种更具结构性的方式改变信道统计。因此，针对 IRS 或可移动天线的现有模型、优化策略与洞见不能直接回答 RA 使能上行 MU-MIMO 的关键问题，尤其在不完美 CSI 下。

本文通过发展 RA 系统的双时间尺度上行 MU-MIMO 设计来填补这些空白。核心思想是把 RA 朝向视为**大时间尺度的统计设计变量**，并追踪它如何经由基于几何的信道、LMMSE 估计器以及 MRC 与 wZF 接收机传播。主要贡献总结如下。

1. 对基于几何信道的 RA 使能上行 MU-MIMO 系统，我们提出双时间尺度架构，并建立不完美 CSI 下的旋转优化问题：RA 旋转矩阵在大时间尺度上依据统计 CSI 优化，接收合并器在小时间尺度上依据瞬时 LMMSE 信道估计更新。
2. 在所提双时间尺度框架下，我们推导了 MRC 的闭式 UatF 速率表达式，以及由非各向同性估计误差诱导的 wZF 闭式统计速率替代。这些表达式揭示 RA 旋转如何影响有用信号强度、估计误差引起的自干扰与多用户干扰。
3. 分析进一步表明：RA 旋转可通过在有效子空间上增强信道协方差来改善 CSI 质量，但**最小化 NMSE 的朝向一般不同于最大化通信速率的朝向**；且 MRC 与 wZF 因对信号聚合与误差感知用户分离的侧重不同而偏好不同的旋转配置。
4. 由于 MRC 与 wZF 下闭式速率替代对 RA 旋转矩阵的高度非凸依赖，我们提出基于投影梯度、在球冠乘积集上求解两类旋转优化问题的统一算法框架，并推导速率替代的显式梯度与信道统计量的导数。
5. 数值结果中，闭式替代与块级遍历性能吻合良好，验证了双时间尺度设计；优化后的 RA 朝向优于随机或固定朝向，在干扰受限区间尤为明显；理论洞见得到验证，且 wZF 因利用误差感知用户分离而从 RA 旋转中获益更多。

本文其余部分组织如下：第 II 节给出系统模型；第 III 节给 LMMSE 估计与误差统计；第 IV 节建立双时间尺度优化问题；第 V 节推导闭式速率替代；第 VI 节发展投影梯度算法；第 VII 节给出数值结果；第 VIII 节总结全文。

## II. 系统模型

如图 1 所示，我们考虑多用户 MIMO 系统：配备由 $N$ 个可旋转天线（RA）构成的均匀平面阵（UPA）的基站（BS）同时为 $K$ 个单天线用户提供上行通信服务。记 $\mathcal N\triangleq\{1,\ldots,N\}$ 与 $\mathcal K\triangleq\{1,\ldots,K\}$ 分别为 RA 阵元与用户的索引集。

**图 1：** 系统模型示意：(a) RA 使能的上行多用户 MIMO 系统；(b) RA 的方向辐射图样与旋转；(c) 所提双时间尺度设计框架。（来源：原文第 2 页。）

### A. RA 的旋转向量与方向增益

采用三维（3D）笛卡尔坐标系，RA 阵列位于 $x$–$O$–$y$ 平面、中心在原点 $O$。第 $n$ 个 RA 的位置记为 $\mathbf w_n\triangleq[x_n,y_n,0]^T\in\mathbb R^{3\times1}$，其中 $(x_n,y_n)$ 由半波长间距、$N=N_{\mathrm{col}}\times N_{\mathrm{row}}$ 个阵元的 UPA 几何确定。用户 $k$ 的位置记为 $\mathbf u_k\triangleq[x_k,y_k,z_k]^T\in\mathbb R^{3\times1}$。相应地，用户 $k$ 与 RA $n$ 之间的距离、以及从 RA $n$ 指向用户 $k$ 的单位方向向量记为 $r_{k,n}$ 与 $\mathbf s_{k,n}$：

$$
r_{k,n}\triangleq\|\mathbf u_k-\mathbf w_n\|,\qquad \mathbf s_{k,n}\triangleq\frac{\mathbf u_k-\mathbf w_n}{\|\mathbf u_k-\mathbf w_n\|}=\frac{\mathbf u_k-\mathbf w_n}{r_{k,n}}.\tag{1}
$$

每个 RA 为方向性天线，其视轴方向可通过安装在旋转平台上独立调整，而物理位置 $\mathbf w_n$ 保持不变。第 $n$ 个 RA 的视轴方向由单位指向向量 $\mathbf f_n\triangleq[f_{x,n},f_{y,n},f_{z,n}]^T\in\mathbb R^{3\times1}$ 刻画，满足 $\|\mathbf f_n\|=1$（$\forall n\in\mathcal N$），其中 $f_{x,n},f_{y,n},f_{z,n}$ 为指向向量在 $x$、$y$、$z$ 轴上的投影。等价地，$\mathbf f_n$ 可由视轴与正 $z$ 轴之间的仰角 $\theta_n\in[0,\pi]$、以及视轴在 $x$–$O$–$y$ 平面上的投影与正 $x$ 轴之间的方位角 $\phi_n\in[-\pi,\pi)$ 参数化为 $\mathbf f_n=[\sin\theta_n\cos\phi_n,\ \sin\theta_n\sin\phi_n,\ \cos\theta_n]^T$。把所有 RA 的指向向量集合为矩阵 $\mathbf F\triangleq[\mathbf f_1,\ldots,\mathbf f_N]\in\mathbb R^{3\times N}$，它即 RA 阵列的旋转配置。

实践中，受机械约束，每个 RA 的旋转范围限于有限角度区域。记 $\mathbf e_z\triangleq[0,0,1]^T$ 为阵列法向。通过对可行朝向角 $\arccos(\mathbf f_n^T\mathbf e_z)$ 施加约束，每个 RA 视轴向量的可行集为

$$
\mathcal F_n\triangleq\left\{\mathbf f_n\in\mathbb R^3:\ \|\mathbf f_n\|=1,\ \arccos(\mathbf f_n^T\mathbf e_z)\le\theta_{\max}\right\},\tag{2}
$$

其中 $\theta_{\max}\in(0,\pi/2]$ 为相对阵列法向的最大允许倾角。所有朝向向量的可行集记为 $\mathcal F$。每个 RA 的辐射图样依赖式（1）的入射信号方向。定义 $\mathbf f_n$ 与 $\mathbf s_{k,n}$ 之间的失配角为

$$
\vartheta_{k,n}\triangleq\arccos\left(\mathbf f_n^T\mathbf s_{k,n}\right),\qquad\forall k\in\mathcal K,\ \forall n\in\mathcal N.\tag{3}
$$

采用基于余弦的半空间方向增益参数模型，RA 的归一化阵元图样为

$$
G(\mathbf f_n,\mathbf s_{k,n})=G_0\left[\mathbf f_n^T\mathbf s_{k,n}\right]_+^{2b},\tag{4}
$$

其中 $[\cdot]_+\triangleq\max\{\cdot,0\}$ 保证非负，$b\ge0$ 为决定主瓣波束宽度的方向性因子，$G_0\triangleq2(2b+1)$ 为满足功率归一化的最大增益（在入射波与 RA 视轴对齐即 $\mathbf f_n^T\mathbf s_{k,n}=1$ 时取得）。

### B. 基于几何的 Rician 信道模型

对 RA 使能上行信道采用基于几何的窄带 Rician 衰落模型：传播环境由一条主导的 LoS 径与 $Q$ 个空间分布的 NLoS 散射簇刻画。对用户 $k$ 与 RA $n$ 之间的 LoS 径，大尺度路径增益建模为

$$
g^{\mathrm{LoS}}_{k,n}(\mathbf f_n)=\frac{\varrho\,G(\mathbf f_n,\mathbf s_{k,n})}{4\pi r_{k,n}^2},\tag{5}
$$

其中 $\varrho$ 为每个 RA 的物理尺寸。对 NLoS 分量，用户 $k$ 的信号先经簇 $q\in\mathcal Q$ 散射，再被 RA $n$ 接收。散射簇 $q$ 的位置记为 $\mathbf c_q\in\mathbb R^3$，其集合为 $\mathcal Q$。从 RA $n$ 到簇 $q$ 的距离与单位方向向量记为 $r_{q,n}\triangleq\|\mathbf c_q-\mathbf w_n\|$、$\mathbf s_{q,n}\triangleq\frac{\mathbf c_q-\mathbf w_n}{\|\mathbf c_q-\mathbf w_n\|}=\frac{\mathbf c_q-\mathbf w_n}{r_{q,n}}$。与式（5）类似，簇 $q$ 在 RA $n$ 处的方向路径增益建模为

$$
g^c_{q,n}(\mathbf f_n)=\frac{\varrho\,G(\mathbf f_n,\mathbf s_{q,n})}{4\pi r_{q,n}^2}.\tag{6}
$$

进一步定义 $d_{q,k}\triangleq\|\mathbf u_k-\mathbf c_q\|$ 为簇 $q$ 到用户 $k$ 的距离。随后考虑小尺度衰落，用户 $k$ 与 RA $n$ 之间的复基带多径信道系数为

$$
h_{k,n}(\mathbf f_n)=h^{\mathrm{LoS}}_{k,n}(\mathbf f_n)+h^{\mathrm{NLoS}}_{k,n}(\mathbf f_n).\tag{7}
$$

对 LoS 分量有

$$
h^{\mathrm{LoS}}_{k,n}(\mathbf f_n)=\sqrt{g^{\mathrm{LoS}}_{k,n}(\mathbf f_n)}\,e^{-\mathrm j\frac{2\pi}{\lambda}r_{k,n}},\tag{8}
$$

其中 $\lambda$ 为载波波长。对 NLoS 分量，把每个簇的贡献建模为独立复径，得

$$
h^{\mathrm{NLoS}}_{k,n}(\mathbf f_n)=\sum_{q=1}^{Q}\varpi_{k,q}\sqrt{\sigma_qg^c_{q,n}(\mathbf f_n)}\,e^{-\mathrm j\frac{2\pi}{\lambda}\left(r_{q,n}+d_{q,k}\right)},\tag{9}
$$

其中 $\sigma_q>0$ 表示散射簇 $q$ 的雷达截面积，随机变量 $\varpi_{k,q}\sim\mathcal{CN}(0,1)$ 建模用户—簇小尺度衰落；$\{\varpi_{k,q}\}$ 在 $(k,q)$ 间独立、且与 LoS 分量独立。

对给定 RA 朝向矩阵 $\mathbf F$ 与稳定几何 $\{\mathbf u_k\}$、$\{\mathbf w_n\}$、$\{\mathbf c_q\}$，$\mathbf h_k(\mathbf F)$ 的随机性主要来自小尺度衰落系数 $\{\varpi_{k,q}\}$。用户 $k$ 的上行信道向量 $\mathbf h_k(\mathbf F)$ 可写为一般 Rician 形式

$$
\mathbf h_k(\mathbf F)=\boldsymbol\mu_k(\mathbf F)+\mathbf B_k(\mathbf F)\boldsymbol\varpi_k,\tag{10}
$$

其中 $\boldsymbol\mu_k(\mathbf F)\in\mathbb C^{N\times1}$ 汇集各 RA 的确定性 LoS 分量，$\mathbf B_k(\mathbf F)\in\mathbb C^{N\times Q}$ 为由 NLoS 簇与 RA 朝向相关增益 $g^c_{q,n}(\mathbf f_n)$ 决定的确定性矩阵，$\boldsymbol\varpi_k\sim\mathcal{CN}(\mathbf 0,\mathbf I_Q)$ 汇集这些簇对应的独立同分布高斯径增益。因此

$$
\mathbf h_k(\mathbf F)\sim\mathcal{CN}\left(\boldsymbol\mu_k(\mathbf F),\mathbf R_k(\mathbf F)\right),\tag{11}
$$

$$
\mathbf R_k(\mathbf F)\triangleq\mathbf B_k(\mathbf F)\mathbf B_k^H(\mathbf F).\tag{12}
$$

二元组 $(\boldsymbol\mu_k(\mathbf F),\mathbf R_k(\mathbf F))$ 刻画给定 $\mathbf F$ 下用户 $k$ 的 Rician 信道统计，在后续信道估计与可达速率分析中起核心作用。

### C. 上行信号模型

RA 阵列处上行接收信号写为

$$
\mathbf y=\sum_{k\in\mathcal K}\sqrt{p_k}\mathbf h_k(\mathbf F)x_k+\mathbf n,\tag{13}
$$

其中 $p_k$ 为用户 $k$ 的发射功率（$0\le p_k\le P_k^{\max}$），$x_k$ 为归一化信息符号（$\mathbb E\{|x_k|^2\}=1$），$\mathbf x\triangleq[x_1,\ldots,x_K]^T$，$\mathbf n\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_N)$ 为 BS 处加性白高斯噪声（AWGN）。在朝向配置 $\mathbf F$ 的每个相干块内，BS 先基于导频传输执行上行信道估计，得到 $\mathbf H(\mathbf F)\triangleq[\mathbf h_1(\mathbf F),\ldots,\mathbf h_K(\mathbf F)]\in\mathbb C^{N\times K}$ 的估计 $\hat{\mathbf H}(\mathbf F)$，再构造线性接收合并矩阵 $\mathbf V\triangleq[\mathbf v_1,\ldots,\mathbf v_K]\in\mathbb C^{N\times K}$，于是用户 $k$ 的检测符号为

$$
\varsigma_k=\mathbf v_k^H\mathbf y,\qquad\forall k\in\mathcal K.\tag{14}
$$

不同的 $\mathbf V$ 选择对应不同线性接收机（如第 V 节的 MRC 或 wZF）。该操作引出双时间尺度设计：每个相干块内，BS 依据瞬时信道估计更新接收波束赋形矩阵 $\mathbf V$；而 RA 朝向 $\mathbf F$ 依据影响 $\{\boldsymbol\mu_k(\mathbf F),\mathbf R_k(\mathbf F)\}_{k\in\mathcal K}$ 的缓慢变化信道统计更新（该统计由传播几何决定）。

在设计大时间尺度 RA 朝向之前，需要刻画固定朝向矩阵 $\mathbf F$ 下 BS 可获得的小时间尺度 CSI。特别地，由于 $\mathbf F$ 同时重塑 Rician 均值与协方差，它也会影响 LMMSE 信道估计及其误差统计。下一节推导这些依赖朝向的估计统计量，随后它们将进入 MRC 与 wZF 速率表达式以及 RA 旋转设计。

## III. 信道估计

本节考虑时分双工（TDD）帧结构：每个长度为 $T_c$ 个符号区间的相干块划分为长度 $\tau_p$ 个符号的导频阶段与长度 $T_d=T_c-\tau_p$ 的数据传输阶段。每个相干块内 $\mathbf F$ 由统计 CSI 确定并保持固定，信道 $\mathbf H(\mathbf F)$ 的几何 $\{\mathbf u_k\}$、$\{\mathbf w_n\}$、$\{\mathbf c_q\}$ 保持不变，而快速变化的衰落系数 $\{\varpi_{k,q}\}$ 需要估计。

### A. 上行训练协议

导频阶段，每个用户发送预定义导频序列 $\boldsymbol\varphi_k\in\mathbb C^{\tau_p\times1}$，功率为 $p_k^{\mathrm{tr}}$。导频序列汇集为矩阵 $\boldsymbol\Phi\triangleq[\boldsymbol\varphi_1,\ldots,\boldsymbol\varphi_K]\in\mathbb C^{\tau_p\times K}$，不同用户间相互正交，满足 $\boldsymbol\Phi^H\boldsymbol\Phi=\tau_p\mathbf I_K$（$\tau_p\ge K$）。把 $\tau_p$ 个符号上的接收导频信号在 $N$ 阵元 RA 阵列上堆叠，得接收导频信号矩阵 [25]、[26]：

$$
\mathbf Y_p(\mathbf F)=\sum_{k=1}^{K}\sqrt{p_k^{\mathrm{tr}}}\,\mathbf h_k(\mathbf F)\boldsymbol\varphi_k^T+\mathbf Z_p,\tag{15}
$$

其中 $\mathbf Z_p\in\mathbb C^{N\times\tau_p}$ 汇集导频阶段的 AWGN，其元素独立同分布 $\sim\mathcal{CN}(0,\sigma^2)$。为获得估计用户 $k$ 信道的充分统计量，BS 把接收导频矩阵 $\mathbf Y_p(\mathbf F)$ 与共轭导频序列 $\boldsymbol\varphi_k^*$ 相关，并利用正交性得

$$
\mathbf y_{p,k}(\mathbf F)=\frac{1}{\sqrt{\tau_p}}\mathbf Y_p(\mathbf F)\boldsymbol\varphi_k^*=\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\mathbf h_k(\mathbf F)+\mathbf n_{p,k},\tag{16}
$$

其中 $\mathbf n_{p,k}\triangleq\frac{1}{\sqrt{\tau_p}}\mathbf Z_p\boldsymbol\varphi_k^*\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_N)$ 与 $\mathbf h_k(\mathbf F)$ 独立。因此每个用户的有效导频观测是信道向量 $\mathbf h_k(\mathbf F)$ 的 $N$ 维含噪线性观测，有效导频能量为 $\tau_pp_k^{\mathrm{tr}}$。

### B. LMMSE 信道估计器

给定 $\mathbf F$，信道向量的先验分布为式（11），由此可刻画 $\mathbf h_k(\mathbf F)$ 与 $\mathbf y_{p,k}(\mathbf F)$ 的联合分布。记统计期望为 $\mathbb E[\cdot]$。$\mathbf y_{p,k}(\mathbf F)$ 的均值为

$$
\bar{\mathbf y}_{p,k}(\mathbf F)\triangleq\mathbb E\left[\mathbf y_{p,k}(\mathbf F)\right]=\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\boldsymbol\mu_k(\mathbf F),\tag{17}
$$

其协方差矩阵为

$$
\mathbf C_{y_k}(\mathbf F)\triangleq\mathbb E\left[\left(\mathbf y_{p,k}(\mathbf F)-\bar{\mathbf y}_{p,k}(\mathbf F)\right)\left(\mathbf y_{p,k}(\mathbf F)-\bar{\mathbf y}_{p,k}(\mathbf F)\right)^H\right]=\tau_pp_k^{\mathrm{tr}}\mathbf R_k(\mathbf F)+\sigma^2\mathbf I_N.\tag{18}
$$

$\mathbf h_k(\mathbf F)$ 与 $\mathbf y_{p,k}(\mathbf F)$ 的互协方差为

$$
\mathbf C_{h_ky_k}(\mathbf F)\triangleq\mathbb E\left[\left(\mathbf h_k(\mathbf F)-\boldsymbol\mu_k(\mathbf F)\right)\left(\mathbf y_{p,k}(\mathbf F)-\bar{\mathbf y}_{p,k}(\mathbf F)\right)^H\right]=\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\mathbf R_k(\mathbf F).\tag{19}
$$

由于 $\mathbf h_k(\mathbf F)$ 与 $\mathbf y_{p,k}(\mathbf F)$ 的联合分布为复高斯，LMMSE 估计器与 MMSE 估计器重合。由标准线性 MMSE，给定观测 $\mathbf y_{p,k}(\mathbf F)$ 时用户 $k$ 的信道估计为

$$
\hat{\mathbf h}_k(\mathbf F)\triangleq\mathbb E\left[\mathbf h_k(\mathbf F)\mid\mathbf y_{p,k}(\mathbf F)\right]=\boldsymbol\mu_k(\mathbf F)+\mathbf C_{h_ky_k}(\mathbf F)\mathbf C_{y_k}^{-1}(\mathbf F)\left(\mathbf y_{p,k}(\mathbf F)-\bar{\mathbf y}_{p,k}(\mathbf F)\right)
$$

$$
=\boldsymbol\mu_k(\mathbf F)+\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\mathbf R_k(\mathbf F)\left(\tau_pp_k^{\mathrm{tr}}\mathbf R_k(\mathbf F)+\sigma^2\mathbf I_N\right)^{-1}\left(\mathbf y_{p,k}(\mathbf F)-\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\boldsymbol\mu_k(\mathbf F)\right).\tag{20}
$$

式（20）表明估计 $\hat{\mathbf h}_k(\mathbf F)$ 通过信道统计 $\boldsymbol\mu_k(\mathbf F)$ 与 $\mathbf R_k(\mathbf F)$ 依赖 RA 朝向 $\mathbf F$。由于 $\hat{\mathbf h}_k$ 为 $\mathbf y_{p,k}$ 的仿射函数且二者联合高斯，估计误差 $\tilde{\mathbf h}_k(\mathbf F)\triangleq\mathbf h_k(\mathbf F)-\hat{\mathbf h}_k(\mathbf F)$ 与 $\hat{\mathbf h}_k(\mathbf F)$ 独立，其协方差为

$$
\mathbf C_{e,k}(\mathbf F)\triangleq\mathbb E\left[\tilde{\mathbf h}_k(\mathbf F)\tilde{\mathbf h}_k^H(\mathbf F)\right]=\mathbf R_k(\mathbf F)-\mathbf C_{\hat h,k}(\mathbf F),\qquad \mathbf C_{\hat h,k}(\mathbf F)\triangleq\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\mathbf R_k(\mathbf F)\left(\tau_pp_k^{\mathrm{tr}}\mathbf R_k(\mathbf F)+\sigma^2\mathbf I_N\right)^{-1}\sqrt{\tau_pp_k^{\mathrm{tr}}}\,\mathbf R_k(\mathbf F).\tag{21}
$$

### C. 估计误差统计

定义 $a_k\triangleq\tau_pp_k^{\mathrm{tr}}$ 与 $\mathbf A_k(\mathbf F)\triangleq a_k\mathbf R_k(\mathbf F)+\sigma^2\mathbf I_N$。由式（21），误差协方差可重写为

$$
\mathbf C_{e,k}(\mathbf F)=\mathbf R_k(\mathbf F)\left(\mathbf I_N+\frac{a_k}{\sigma^2}\mathbf R_k(\mathbf F)\right)^{-1}\mathbf R_k(\mathbf F)^{\dagger/2}\ \text{（原文形式，见式 (23)）}\tag{22}
$$

$$
=\mathbf R_k(\mathbf F)-\mathbf R_k(\mathbf F)\mathbf A_k^{-1}(\mathbf F)\mathbf R_k(\mathbf F)a_k.\tag{23}
$$

利用 $\mathbf R_k(\mathbf F)$ 的谱分解，定义其在有效子空间上的归一化误差矩阵：令 $\mathbf R_k(\mathbf F)=\mathbf U_k\boldsymbol\Lambda_k\mathbf U_k^H$（$\boldsymbol\Lambda_k$ 的对角元为 $\lambda_{k,i}>0$，其余为零特征值），并令 $\mathbf P_k$ 为到 $\mathbf R_k(\mathbf F)$ 值空间的正交投影。则

$$
\mathbf E_k(\mathbf F)\triangleq\mathbf R_k^{\dagger/2}(\mathbf F)\mathbf C_{e,k}(\mathbf F)\mathbf R_k^{\dagger/2}(\mathbf F)=\mathbf P_k\left(\mathbf I_N+\frac{a_k}{\sigma^2}\mathbf R_k(\mathbf F)\right)^{-1}\mathbf P_k,\tag{24}
$$

其非零特征值（对应 $\lambda_{k,i}>0$）为 $(1+\frac{a_k}{\sigma^2}\lambda_{k,i})^{-1}$，且在 $\mathrm{Null}(\mathbf R_k)$ 上 $\mathbf E_k$ 因投影 $\mathbf P_k$ 而为零。归一化均方误差（NMSE）定义为

$$
\mathrm{NMSE}_k(\mathbf F)\triangleq\frac{\mathrm{tr}\left(\mathbf C_{e,k}(\mathbf F)\right)}{\mathrm{tr}\left(\mathbf R_k(\mathbf F)\right)}=\frac{\mathrm{tr}\left(\boldsymbol\Lambda_k^{1/2}\mathbf E_k(\boldsymbol\Lambda^{1/2})^H\right)}{\mathrm{tr}(\boldsymbol\Lambda_k)}.\tag{25}
$$

**引理 1（朝向对估计误差影响的 Loewner 序）：** 对任意两个可行朝向 $\mathbf F_1,\mathbf F_2\in\mathcal F$，若 $\mathbf R_k(\mathbf F_1)\succeq\mathbf R_k(\mathbf F_2)$（Loewner 序）且二者共享相同有效子空间，即 $\mathcal R(\mathbf R_k(\mathbf F_1))=\mathcal R(\mathbf R_k(\mathbf F_2))$，则 $\mathbf E_k(\mathbf F_1)\preceq\mathbf E_k(\mathbf F_2)$，从而 $\mathrm{NMSE}_k(\mathbf F_1)\le\mathrm{NMSE}_k(\mathbf F_2)$。

**证明。** 为简洁省略对 $\mathbf F$ 的显式依赖。对式（23）左乘、右乘 $\mathbf R_k^{\dagger/2}$ 得

$$
\mathbf E_k=\mathbf R_k^{\dagger/2}\mathbf C_{e,k}\mathbf R_k^{\dagger/2}=\mathbf R_k^{\dagger/2}\mathbf R_k\mathbf R_k^{\dagger/2}\left(\mathbf I_N+\frac{a_k}{\sigma^2}\mathbf R_k\right)^{-1}=\mathbf P_k\left(\mathbf I_N+\frac{a_k}{\sigma^2}\mathbf R_k\right)^{-1}\mathbf P_k,
$$

即证得式（28）。特征值刻画由 $\mathbf R_k$ 的谱分解得到：对每个非零特征值 $\lambda_{k,i}>0$，对应归一化误差特征值为 $(1+\frac{a_k}{\sigma^2}\lambda_{k,i})^{-1}$；由于投影 $\mathbf P_k$，$\mathbf E_k$ 在 $\mathrm{Null}(\mathbf R_k)$ 上为零。最后当 $\mathcal R(\mathbf R_1)=\mathcal R(\mathbf R_2)$ 时投影算子重合；而 $\mathbf R_1\succeq\mathbf R_2\succeq\mathbf 0$ 蕴含 $(\mathbf I+c\mathbf R_1)^{-1}\preceq(\mathbf I+c\mathbf R_2)^{-1}$（$c>0$），对共同投影左右乘后得 $\mathbf E_1\preceq\mathbf E_2$，取迹即得 $\mathrm{NMSE}_1\le\mathrm{NMSE}_2$。

**注 1：** 引理 1 表明 RA 旋转可通过增大 $\mathbf R_k(\mathbf F)$（如把天线视轴转向主导散射方向）改善归一化估计质量。然而可达速率同时依赖 $\boldsymbol\mu_k(\mathbf F)$ 与涉及跨用户统计和合并器结构的多用户耦合项。因此**最小化 NMSE 的旋转一般不同于最大化总速率的旋转**，其闭式表达式将在第 V 节分析。

**注 2：** LMMSE 估计器（20）仅通过统计 $\boldsymbol\mu_k(\mathbf F)$ 与 $\mathbf R_k(\mathbf F)$ 依赖 $\mathbf F$。在所提双时间尺度框架中，$\mathbf F$ 基于统计 CSI 在慢时间尺度更新，而同一统计匹配的 LMMSE 估计器在多个相干块上沿用。

## IV. 双时间尺度优化问题

本节基于式（20）获得的信道估计建立大时间尺度 RA 旋转设计。所考虑双时间尺度架构的关键特征是：短时间尺度接收合并器在每个相干块内依据瞬时信道估计更新，而 RA 朝向矩阵 $\mathbf F$ 仅依据缓慢变化的统计 CSI 优化。

回顾式（13）与（14），对给定相干块与固定 $\mathbf F$，BS 采用线性合并矩阵

$$
\mathbf V(\hat{\mathbf H})\triangleq\left[\mathbf v_1(\hat{\mathbf H}),\ldots,\mathbf v_K(\hat{\mathbf H})\right]\in\mathbb C^{N\times K},\tag{29}
$$

它是估计信道矩阵

$$
\hat{\mathbf H}(\mathbf F)\triangleq\left[\hat{\mathbf h}_1(\mathbf F),\ldots,\hat{\mathbf h}_K(\mathbf F)\right]\tag{30}
$$

的确定性函数；第 $k$ 列 $\mathbf v_k(\hat{\mathbf H})$ 是检测用户 $k$ 的合并向量。典型例子包括对信道做共轭波束赋形的 MRC 接收机，以及消除多用户干扰的 wZF 接收机。给定 $\mathbf v_k(\hat{\mathbf H})$，用户 $k$ 的检测统计量为

$$
\varsigma_k=\sqrt{p_k}\mathbf v_k^H(\hat{\mathbf H})\mathbf h_k(\mathbf F)x_k+\sum_{i\ne k}\sqrt{p_i}\mathbf v_k^H(\hat{\mathbf H})\mathbf h_i(\mathbf F)x_i+\mathbf v_k^H(\hat{\mathbf H})\mathbf z.\tag{31}
$$

以信道及其估计为条件的用户 $k$ 瞬时 SINR 为

$$
\gamma_k\left(\mathbf F,\hat{\mathbf H}\right)\triangleq\frac{p_k\left|\mathbf v_k^H(\hat{\mathbf H})\mathbf h_k(\mathbf F)\right|^2}{\sum_{i\ne k}p_i\left|\mathbf v_k^H(\hat{\mathbf H})\mathbf h_i(\mathbf F)\right|^2+\sigma^2\left\|\mathbf v_k(\hat{\mathbf H})\right\|^2}.\tag{32}
$$

为获得可处理的大时间尺度度量，先对给定信道估计 $\hat{\mathbf H}(\mathbf F)$ 与合并矩阵 $\mathbf V(\hat{\mathbf H})$ 定义用户 $k$ 的 UatF SINR（式 (33)）：BS 与用户把有效信道增益的条件均值视为确定量，并把其余随机性视为额外的不相关高斯噪声 [27]、[28]。这给出可达上行速率的可处理下界，仅依赖 $\hat{\mathbf h}_k(\mathbf F)$ 与 $\tilde{\mathbf h}_k(\mathbf F)$ 的二阶统计；式（33）中期望取在小尺度衰落、信道估计与估计误差的联合分布上，而它们均通过 Rician 统计 $(\boldsymbol\mu_k(\mathbf F),\mathbf R_k(\mathbf F))$ 与估计器（20）依赖 $\mathbf F$。

令 $\eta\triangleq1-\tau_p/T_c$ 为计入导频训练开销的预对数因子。大时间尺度条件可达速率度量为

$$
\bar R_k(\mathbf F)=\eta\log_2\left(1+\bar\gamma_k(\mathbf F,\hat{\mathbf H})\right),\tag{34}
$$

相应总速率替代为

$$
\bar R_{\mathrm{sum}}(\mathbf F)\triangleq\sum_{k\in\mathcal K}\bar R_k(\mathbf F).\tag{35}
$$

在双时间尺度设计下，短期合并规则 $\mathbf V(\hat{\mathbf H})$ 由估计得到的瞬时 CSI 决定，而基于大时间尺度 CSI 的 RA 朝向设计问题在可行集 $\mathcal F$ 上最大化 $\mathbf F$：

$$
(\mathrm{P1}):\quad\max_{\mathbf F\in\mathcal F}\ \mathbb E\left[\max_{\mathbf V(\hat{\mathbf H})}\bar R_{\mathrm{sum}}(\mathbf F)\right]\tag{36}
$$

其中外层期望取在估计 $\hat{\mathbf H}(\mathbf F)$ 的随机性上，内层为给定 $\hat{\mathbf H}$ 时对合并器的优化。由于（P1）同时含外层统计期望与内层合并器优化、且目标对 $\mathbf F$ 高度非凸，直接求解不可行。为此，在给定大时间尺度统计 CSI 下，（P1）可写为

$$
(\mathrm{P2}):\quad\max_{\mathbf F\in\mathcal F}\ \mathcal J\left(\mathbf F\right),\qquad \mathcal J(\mathbf F)\in\left\{\bar R^{\mathrm{MRC}}_{\mathrm{sum}}(\mathbf F),\ \bar R^{\mathrm{wZF}}_{\mathrm{sum}}(\mathbf F)\right\}\tag{37}
$$

即分别以第 V 节推导的 MRC 与 wZF 闭式统计速率替代作为目标。

**注 3：** 采用 UatF 速率界与一阶统计替代后，（P2）不再依赖瞬时 CSI，仅依赖缓慢变化的信道统计，因而适配大时间尺度 RA 朝向设计；其最优值可在多个相干块上复用直至统计显著变化。

## V. MRC 与 wZF 的可达速率分析

本节推导 UatF 速率替代。在双时间尺度框架下，$\mathbf F$ 固定并仅通过信道统计影响估计与合并。记 $\boldsymbol\Sigma_{h,k}(\mathbf F)\triangleq\mathbb E[\mathbf h_k\mathbf h_k^H]=\mathbf R_k(\mathbf F)+\boldsymbol\mu_k\boldsymbol\mu_k^H$、$\boldsymbol\Sigma_{\hat h,k}(\mathbf F)\triangleq\mathbb E[\hat{\mathbf h}_k\hat{\mathbf h}_k^H]=\mathbf C_{\hat h,k}(\mathbf F)+\boldsymbol\mu_k\boldsymbol\mu_k^H$，且 $\boldsymbol\Sigma_{h,k}(\mathbf F)=\boldsymbol\Sigma_{\hat h,k}(\mathbf F)+\mathbf C_{e,k}(\mathbf F)$。本节所有期望均取在实际信道、其 LMMSE 估计与估计误差的联合分布上（均隐式依赖 $\mathbf F$）。

**注 4：** 与传统固定阵元图样阵列不同，$\mathbf F$ 通过式（4）影响 RA 主瓣方向并重塑信道统计。该依赖会传播到 LMMSE 估计器与 UatF 界，形成旋转、估计误差与 MRC/wZF 可达速率之间的非平凡耦合。

### A. MRC 接收机的闭式 UatF 表达式

基于 LMMSE 估计的用户 $k$ 的 MRC 向量为

$$
\mathbf v_k^{\mathrm{MRC}}(\hat{\mathbf H})\triangleq\hat{\mathbf h}_k(\mathbf F).\tag{41}
$$

把式（41）代入式（33）得 MRC 下用户 $k$ 的无条件 UatF SINR 界（式 (42)）。对式（42）分子中的有用信号项，由于 $\mathbf h_k(\mathbf F)=\hat{\mathbf h}_k(\mathbf F)+\tilde{\mathbf h}_k(\mathbf F)$ 且 $\hat{\mathbf h}_k$ 与 $\tilde{\mathbf h}_k$ 独立，

$$
\mathbb E\left[(\mathbf v_k^{\mathrm{MRC}})^H\mathbf h_k(\mathbf F)\right]=\mathbb E\left[\|\hat{\mathbf h}_k(\mathbf F)\|^2\right]=\mathrm{tr}\left(\mathbf C_{\hat h,k}(\mathbf F)\right)+\|\boldsymbol\mu_k(\mathbf F)\|^2\triangleq\alpha_k(\mathbf F),\tag{43}
$$

于是式（42）分子为 $p_k\left|\mathbb E[(\mathbf v_k^{\mathrm{MRC}})^H\mathbf h_k(\mathbf F)]\right|^2=p_k\alpha_k^2(\mathbf F)$。对噪声项，显然 $\mathbb E[\|\mathbf v_k^{\mathrm{MRC}}\|^2]=\alpha_k(\mathbf F)$。对 $i\ne k$ 的干扰项，由不同用户信道估计的独立性得

$$
\mathbb E\left[\left|(\mathbf v_k^{\mathrm{MRC}})^H\mathbf h_i(\mathbf F)\right|^2\right]=\mathbb E\left[\hat{\mathbf h}_k^H(\mathbf F)\mathbf h_i(\mathbf F)\mathbf h_i^H(\mathbf F)\hat{\mathbf h}_k(\mathbf F)\right]=\mathrm{tr}\left(\boldsymbol\Sigma_{h,i}(\mathbf F)\boldsymbol\Sigma_{\hat h,k}(\mathbf F)\right)\triangleq\Theta_{i,k}(\mathbf F).\tag{46}
$$

对 $i=k$，由于式（21）的复合结构 $\mathbb E[\tilde{\mathbf h}_k(\mathbf F)]=\mathbf 0$ 且 $\hat{\mathbf h}_k(\mathbf F)$ 与 $\tilde{\mathbf h}_k(\mathbf F)$ 独立，

$$
\mathbb E\left[\left|(\mathbf v_k^{\mathrm{MRC}})^H\mathbf h_k(\mathbf F)\right|^2\right]=\mathbb E\left[\|\hat{\mathbf h}_k(\mathbf F)\|^4\right]+\mathbb E\left[\left|\hat{\mathbf h}_k^H(\mathbf F)\tilde{\mathbf h}_k(\mathbf F)\right|^2\right]
$$

$$
=\alpha_k^2(\mathbf F)+\mathrm{tr}\left(\mathbf C_{\hat h,k}^2(\mathbf F)\right)+2\boldsymbol\mu_k^H(\mathbf F)\mathbf C_{\hat h,k}(\mathbf F)\boldsymbol\mu_k(\mathbf F)+\mathrm{tr}\left(\mathbf C_{e,k}(\mathbf F)\boldsymbol\Sigma_{\hat h,k}(\mathbf F)\right),\tag{47}
$$

其中用到复高斯向量的四阶矩恒等式。汇集式（45）、（46）与（47），式（42）分母中的总干扰加噪声项为

$$
I_k^{\mathrm{MRC}}(\mathbf F)=p_k\Phi_k(\mathbf F)+\sum_{i\ne k}p_i\Theta_{i,k}(\mathbf F)+\sigma^2\alpha_k(\mathbf F),\tag{48}
$$

其中自干扰项记为

$$
\Phi_k(\mathbf F)\triangleq\mathbb E\left[\left|(\mathbf v_k^{\mathrm{MRC}})^H\mathbf h_k(\mathbf F)\right|^2\right]-\left|\mathbb E\left[(\mathbf v_k^{\mathrm{MRC}})^H\mathbf h_k(\mathbf F)\right]\right|^2=\mathrm{tr}\left(\mathbf C_{\hat h,k}^2(\mathbf F)\right)+2\boldsymbol\mu_k^H(\mathbf F)\mathbf C_{\hat h,k}(\mathbf F)\boldsymbol\mu_k(\mathbf F)+\mathrm{tr}\left(\mathbf C_{e,k}(\mathbf F)\boldsymbol\Sigma_{\hat h,k}(\mathbf F)\right).\tag{49}
$$

把式（44）与（48）代入式（42），得 MRC 的闭式 UatF SINR：

$$
\bar\gamma_k^{\mathrm{MRC}}(\mathbf F)=\frac{p_k\alpha_k^2(\mathbf F)}{I_k^{\mathrm{MRC}}(\mathbf F)}.\tag{50}
$$

相应大时间尺度速率替代为

$$
\bar R_k^{\mathrm{MRC}}(\mathbf F)\triangleq\eta\log_2\left(1+\bar\gamma_k^{\mathrm{MRC}}(\mathbf F)\right),\tag{51}
$$

总速率为 $\bar R^{\mathrm{MRC}}_{\mathrm{sum}}(\mathbf F)\triangleq\sum_{k=1}^{K}\bar R_k^{\mathrm{MRC}}(\mathbf F)$。

**注 5：** 由式（48）与（50）可见，旋转矩阵 $\mathbf F$ 通过四个耦合机制影响 MRC 速率：(i) 通过 $\alpha_k(\mathbf F)$ 改善相干信号聚合或期望估计信道能量；(ii) 通过 $\Phi_k(\mathbf F)$ 降低估计误差引起的自干扰或信号泄漏；(iii) 通过 $\Theta_{i,k}(\mathbf F)$ 降低合并方向间的多用户干扰；(iv) 通过 $\sigma^2\alpha_k(\mathbf F)$ 降低合并后噪声放大。因此 MRC 导向的旋转既不是如注 1 所述仅由 NMSE 最小化驱动，也不是仅由命题 1 中期望信号功率最大化驱动。

### B. wZF 接收机的闭式统计替代

对 MRC，UatF 表达式中的期望可闭式求值。但对 wZF，条件 UatF SINR 依赖由朝向相关增益导致的**非各向同性**估计误差，其外期望难以精确求值。因此下面构造闭式大时间尺度替代。假设 $K\le N$ 且 $\hat{\mathbf H}(\mathbf F)$ 列满秩。考虑满足

$$
(\mathbf V^{\mathrm{ZF}})^H\hat{\mathbf H}(\mathbf F)=\mathbf I_K\tag{52}
$$

的 ZF 型合并器。利用 $\mathbf h_i(\mathbf F)=\hat{\mathbf h}_i(\mathbf F)+\tilde{\mathbf h}_i(\mathbf F)$ 以及 $\tilde{\mathbf h}_i(\mathbf F)$ 与 $\hat{\mathbf H}(\mathbf F)$ 的独立性，在 wZF 性质（52）下

$$
(\mathbf v_k^{\mathrm{wZF}})^H\mathbf h_k(\mathbf F)=1+(\mathbf v_k^{\mathrm{wZF}})^H\tilde{\mathbf h}_k(\mathbf F),\tag{53a}
$$

$$
(\mathbf v_k^{\mathrm{wZF}})^H\mathbf h_i(\mathbf F)=(\mathbf v_k^{\mathrm{wZF}})^H\tilde{\mathbf h}_i(\mathbf F)\quad(i\ne k),\tag{53b}
$$

$$
\mathbb E\left[(\mathbf v_k^{\mathrm{wZF}})^H\mathbf h_k(\mathbf F)\mid\hat{\mathbf H}(\mathbf F)\right]=1,\tag{53c}
$$

$$
\mathrm{Var}\left((\mathbf v_k^{\mathrm{wZF}})^H\mathbf h_k(\mathbf F)\mid\hat{\mathbf H}(\mathbf F)\right)=(\mathbf v_k^{\mathrm{wZF}})^H\mathbf C_{e,k}(\mathbf F)\mathbf v_k^{\mathrm{wZF}},\tag{53d}
$$

$$
\mathbb E\left[\left|(\mathbf v_k^{\mathrm{wZF}})^H\mathbf h_i(\mathbf F)\right|^2\mid\hat{\mathbf H}(\mathbf F)\right]=(\mathbf v_k^{\mathrm{wZF}})^H\mathbf C_{e,i}(\mathbf F)\mathbf v_k^{\mathrm{wZF}}.\tag{53e}
$$

因此 UatF SINR（33）化为

$$
\bar\gamma_k^{\mathrm{wZF}}\left(\mathbf F,\hat{\mathbf H}\right)=\frac{p_k}{\sum_{i=1}^{K}p_i(\mathbf v_k^{\mathrm{wZF}})^H\mathbf C_{e,i}(\mathbf F)\mathbf v_k^{\mathrm{wZF}}+\sigma^2\|\mathbf v_k^{\mathrm{wZF}}\|^2}.\tag{54}
$$

定义有色有效噪声

$$
\mathbf Z(\mathbf F)\triangleq\sigma^2\mathbf I_N+\sum_{i=1}^{K}p_i\mathbf C_{e,i}(\mathbf F).\tag{55}
$$

**命题 2：** 假设 $K\le N$、$\hat{\mathbf H}(\mathbf F)$ 列满秩，从而 $\hat{\mathbf H}^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\hat{\mathbf H}(\mathbf F)$ 可逆（否则应采用正则化版本）。则所有满足（52）的 ZF 型合并器中，有色有效噪声下对每个用户最大化（54）的合并器为 wZF [29]：

$$
\mathbf V^{\mathrm{wZF}}(\hat{\mathbf H})=\mathbf Z^{-1}(\mathbf F)\hat{\mathbf H}(\mathbf F)\left(\hat{\mathbf H}^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\hat{\mathbf H}(\mathbf F)\right)^{-1},\tag{56}
$$

所得条件 SINR 为

$$
\bar\gamma_k^{\mathrm{wZF}}\left(\mathbf F,\hat{\mathbf H}\right)=p_k\left[\hat{\mathbf H}^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\hat{\mathbf H}(\mathbf F)\right]^{-1}_{k,k}.\tag{57}
$$

**证明：** 对每个 $k$，最大化（54）等价于在 $\mathbf v_k^H\hat{\mathbf H}=\mathbf e_k^T$ 约束下最小化 $\mathbf v_k^H\mathbf Z\mathbf v_k$。该严格凸二次规划由 KKT 条件给出（56），代入（54）即得（57）。

为仅用统计 CSI 实现大时间尺度优化，采用如下一阶统计替代：把随机白化 Gram 矩阵替换为 [30]

$$
\hat{\mathbf H}^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\hat{\mathbf H}(\mathbf F)\approx\mathbb E\left[\hat{\mathbf H}^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\hat{\mathbf H}(\mathbf F)\right]\triangleq\bar{\mathbf S}(\mathbf F).\tag{58}
$$

令 $\mathbf M(\mathbf F)=[\boldsymbol\mu_1(\mathbf F),\ldots,\boldsymbol\mu_K(\mathbf F)]$ 汇集 LoS 分量。由于 $\hat{\mathbf h}_k\sim\mathcal{CN}(\boldsymbol\mu_k,\mathbf C_{\hat h,k})$，得

$$
\bar{\mathbf S}(\mathbf F)=\mathrm{diag}\left(\mathrm{tr}\left(\mathbf Z^{-1}(\mathbf F)\mathbf C_{\hat h,1}(\mathbf F)\right),\ldots,\mathrm{tr}\left(\mathbf Z^{-1}(\mathbf F)\mathbf C_{\hat h,K}(\mathbf F)\right)\right)+\mathbf M^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\mathbf M(\mathbf F).\tag{59}
$$

于是替代 SINR 与速率为

$$
\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)\triangleq p_k\left[\bar{\mathbf S}^{-1}(\mathbf F)\right]_{k,k},\tag{60}
$$

$$
\bar R_k^{\mathrm{wZF}}(\mathbf F)\triangleq\eta\log_2\left(1+\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)\right),\tag{61}
$$

总速率为 $\bar R^{\mathrm{wZF}}_{\mathrm{sum}}(\mathbf F)\triangleq\sum_{k=1}^{K}\bar R_k^{\mathrm{wZF}}(\mathbf F)$。

**注 6：** 若对所有 $i$ 考虑跨天线的各向同性估计误差

$$
\mathbf C_{e,i}(\mathbf F)\approx\sigma_{e,i}^2(\mathbf F)\mathbf I_N,\qquad\forall i\in\mathcal K,\tag{62}
$$

则（54）退化为经典 wZF 噪声增强形式

$$
\bar\gamma_k^{\mathrm{wZF}}\left(\mathbf F,\hat{\mathbf H}\right)=\frac{p_k}{\left(\sigma^2+\sum_{i=1}^{K}p_i\sigma_{e,i}^2(\mathbf F)\right)\left[\mathbf G^{-1}(\mathbf F)\right]_{k,k}},\tag{63}
$$

其中 $\mathbf G(\mathbf F)\triangleq\hat{\mathbf H}(\mathbf F)^H\hat{\mathbf H}(\mathbf F)$。此时还可进一步利用大规模 MIMO 矩匹配近似

$$
\mathbb E\left[\left[\mathbf G^{-1}(\mathbf F)\right]_{k,k}\right]\approx\frac{1}{(N-K)N\hat\beta_k(\mathbf F)}\left[\hat{\boldsymbol\Sigma}^{-1}(\mathbf F)\right]_{k,k},\tag{64}
$$

$$
\hat{\boldsymbol\Sigma}(\mathbf F)\triangleq\hat{\boldsymbol\Lambda}_1(\mathbf F)+\frac{1}{N-K}\hat{\boldsymbol\Lambda}_2^H(\mathbf F)\bar{\mathbf H}^H(\mathbf F)\bar{\mathbf H}(\mathbf F)\hat{\boldsymbol\Lambda}_2(\mathbf F),\tag{65}
$$

其中 $\hat\beta_k(\mathbf F)\triangleq\frac1N\mathbb E[\|\hat{\mathbf h}_k(\mathbf F)\|^2]$、$\bar{\mathbf h}_k(\mathbf F)\triangleq\sqrt{N}\frac{\boldsymbol\mu_k(\mathbf F)}{\|\boldsymbol\mu_k(\mathbf F)\|}$、$\bar{\mathbf H}(\mathbf F)\triangleq[\bar{\mathbf h}_1(\mathbf F),\ldots,\bar{\mathbf h}_K(\mathbf F)]$、$\hat{\boldsymbol\Lambda}_1(\mathbf F)\triangleq(\hat{\boldsymbol\Omega}(\mathbf F)+\mathbf I_K)^{-1}$、$\hat{\boldsymbol\Lambda}_2(\mathbf F)\triangleq(\hat{\boldsymbol\Omega}(\mathbf F)\hat{\boldsymbol\Lambda}_1(\mathbf F))^{1/2}$、$\hat{\boldsymbol\Omega}(\mathbf F)=\mathrm{diag}(\hat\kappa_1,\ldots,\hat\kappa_K)$、$\hat\kappa_k(\mathbf F)\triangleq\frac{\|\boldsymbol\mu_k(\mathbf F)\|^2}{\mathrm{tr}(\mathbf C_{\hat h,k}(\mathbf F))}$，从而得到近似（66）。在 RA 系统中，式（62）一般**不成立**，因为 $\mathbf F$ 引入依赖天线的增益；故我们以（59）—（61）作为主要的 ZF 型替代。

**推论 1：** 把（59）中 $\bar{\mathbf S}(\mathbf F)$ 相对用户 $k$ 分块为

$$
\bar{\mathbf S}(\mathbf F)=\begin{bmatrix}\bar s_{k,k}(\mathbf F) & \bar{\mathbf s}_{k,-k}^H(\mathbf F)\\ \bar{\mathbf s}_{k,-k}(\mathbf F) & \bar{\mathbf S}_{-k,-k}(\mathbf F)\end{bmatrix},\tag{67}
$$

其中

$$
\bar s_{k,k}(\mathbf F)=\boldsymbol\mu_k^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\boldsymbol\mu_k(\mathbf F)+\mathrm{tr}\left(\mathbf Z^{-1}(\mathbf F)\mathbf C_{\hat h,k}(\mathbf F)\right)=\left\|\mathbf Z^{-1/2}(\mathbf F)\boldsymbol\mu_k(\mathbf F)\right\|^2+\mathrm{tr}\left(\mathbf Z^{-1/2}(\mathbf F)\mathbf C_{\hat h,k}(\mathbf F)\mathbf Z^{-1/2}(\mathbf F)\right),\tag{68}
$$

$$
\bar{\mathbf s}_{k,-k}(\mathbf F)=\left[\boldsymbol\mu_i^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\boldsymbol\mu_k(\mathbf F)\right]_{i\ne k}.\tag{69}
$$

则（60）中 wZF 合并器下 SINR 替代的精确表示为

$$
\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)=p_k\left(\bar s_{k,k}(\mathbf F)-\bar{\mathbf s}_{k,-k}^H(\mathbf F)\bar{\mathbf S}_{-k,-k}^{-1}(\mathbf F)\bar{\mathbf s}_{k,-k}(\mathbf F)\right).
$$

**证明：** 由 Schur 补恒等式 $[\bar{\mathbf S}^{-1}]_{k,k}^{-1}=\bar s_{k,k}-\bar{\mathbf s}_{k,-k}^H\bar{\mathbf S}_{-k,-k}^{-1}\bar{\mathbf s}_{k,-k}$（式 (71)），并注意（60）中 $\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)=p_k[\bar{\mathbf S}^{-1}(\mathbf F)]_{k,k}$，即得（70）。

因此 RA 旋转 $\mathbf F$ 通过两个显式机制影响 wZF 速率：(i) 增大误差感知的有用信号强度 $\bar s_{k,k}(\mathbf F)$；(ii) 降低误差感知的用户间耦合（多用户干扰）$\bar{\mathbf s}_{k,-k}^H\bar{\mathbf S}_{-k,-k}^{-1}\bar{\mathbf s}_{k,-k}$。由于 $\mathbf Z(\mathbf F)$ 本身依赖 $\{\mathbf C_{e,i}(\mathbf F)\}$，估计误差会同时影响有用信号项与干扰项。

## VI. 旋转优化

本节基于大时间尺度统计 CSI 发展求解（37）中 RA 旋转设计问题（P2-MRC）与（P2-wZF）的高效算法。注意命题 2 已确立 wZF 为有色有效噪声协方差（55）下条件最优的 ZF 型合并器。下面分别以 wZF 速率替代（61）与 MRC 速率替代（51）为目标函数进行算法设计：

$$
(\mathrm{P3\text{-}MRC}):\ \max_{\mathbf F\in\mathcal F}\ \bar R^{\mathrm{MRC}}_{\mathrm{sum}}(\mathbf F)\triangleq\sum_{k=1}^{K}\bar R_k^{\mathrm{MRC}}(\mathbf F),\tag{72a}
$$

$$
(\mathrm{P3\text{-}wZF}):\ \max_{\mathbf F\in\mathcal F}\ \bar R^{\mathrm{wZF}}_{\mathrm{sum}}(\mathbf F)\triangleq\sum_{k=1}^{K}\bar R_k^{\mathrm{wZF}}(\mathbf F).\tag{72b}
$$

困难在于闭式速率替代 $\bar R_k^{\mathrm{MRC}}(\mathbf F)$ 与 $\bar R_k^{\mathrm{wZF}}(\mathbf F)$ 通过 Rician 均值 $\boldsymbol\mu_k(\mathbf F)$、协方差 $\mathbf R_k(\mathbf F)$ 与 LMMSE 误差协方差 $\mathbf C_{e,k}(\mathbf F)$ 对 RA 旋转 $\mathbf F$ 的高度非凸依赖。不过所得优化问题是乘积可行集 $\mathcal F=\mathcal F_1\times\cdots\times\mathcal F_N$ 上的分片光滑约束最大化问题，其中每个 $\mathcal F_n$ 为球冠。该结构自然引出投影梯度法：在欧氏空间取梯度步，再投影到单位球切空间以保持一阶单位范数，最后投影到球冠以满足倾角约束。因此我们采用投影梯度上升框架，并结合第 V 节 MRC 与 wZF 的闭式速率近似 [31]。

### A. 信道统计量的导数

目标对 $\mathbf F$ 的依赖完全继承自统计量 $\{\boldsymbol\mu_k(\mathbf F),\mathbf R_k(\mathbf F),\mathbf C_{\hat h,k}(\mathbf F),\mathbf C_{e,k}(\mathbf F)\}$。由于第 $n$ 个 RA 朝向向量 $\mathbf f_n$ 只影响每个 $\boldsymbol\mu_k(\mathbf F)$ 的第 $n$ 个分量与每个 $\mathbf B_k(\mathbf F)$ 的第 $n$ 行，相应导数具有稀疏结构，这对获得可实现梯度至关重要。由式（4），给定方向 $\mathbf s$，方向增益导数为

$$
\nabla_{\mathbf f_n}G(\mathbf f_n,\mathbf s)=\begin{cases}2bG_0\left(\mathbf f_n^T\mathbf s\right)^{2b-1}\mathbf s, & \mathbf f_n^T\mathbf s>0,\\ \mathbf 0, & \mathbf f_n^T\mathbf s\le0.\end{cases}\tag{73}
$$

在边界 $\mathbf f_n^T\mathbf s=0$（测度零集）处，实现中采用零次梯度。令 $\boldsymbol\delta_n\in\mathbb R^{N\times1}$ 表示第 $n$ 个标准基向量（第 $n$ 个分量为 1、其余为 0）。由式（8），$\boldsymbol\mu_k(\mathbf F)$ 的第 $n$ 个分量为

$$
\mu_{k,n}(\mathbf F)=\sqrt{\frac{\varrho G_0}{4\pi r_{k,n}^2}}\left[\mathbf f_n^T\mathbf s_{k,n}\right]_+^b e^{-\mathrm j\frac{2\pi}{\lambda}r_{k,n}}.\tag{74}
$$

对 $m\in\{x,y,z\}$，利用（73）得

$$
\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}=\begin{cases}\frac{b\,\mu_{k,n}(\mathbf F)}{\mathbf f_n^T\mathbf s_{k,n}}[\mathbf s_{k,n}]_m, & \mathbf f_n^T\mathbf s_{k,n}>0,\\ 0, & \mathbf f_n^T\mathbf s_{k,n}\le0,\end{cases}\tag{75}
$$

$$
\frac{\partial\boldsymbol\mu_k(\mathbf F)}{\partial[\mathbf f_n]_m}=\boldsymbol\delta_n\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}.\tag{76}
$$

接着，由（10）与（9），$\mathbf B_k(\mathbf F)$ 的第 $(n,q)$ 个元素为

$$
[\mathbf B_k(\mathbf F)]_{n,q}=\sqrt{\frac{\varrho\sigma_qG_0}{4\pi r_{q,n}d_{q,k}}}\left[\mathbf f_n^T\mathbf s_{q,n}\right]_+^b e^{-\mathrm j\frac{2\pi}{\lambda}\left(r_{q,n}+d_{q,k}\right)}.\tag{77}
$$

与（75）类似，（77）的导数为

$$
\frac{\partial[\mathbf B_k(\mathbf F)]_{n,q}}{\partial[\mathbf f_n]_m}=\begin{cases}\frac{b[\mathbf B_k(\mathbf F)]_{n,q}}{\mathbf f_n^T\mathbf s_{q,n}}[\mathbf s_{q,n}]_m, & \mathbf f_n^T\mathbf s_{q,n}>0,\\ 0, & \mathbf f_n^T\mathbf s_{q,n}\le0,\end{cases}\tag{78}
$$

$$
\frac{\partial\mathbf B_k(\mathbf F)}{\partial[\mathbf f_n]_m}=\boldsymbol\delta_n\left(\mathbf b^{(m)}_{k,n}(\mathbf F)\right)^T,\tag{79}
$$

其中 $\mathbf b^{(m)}_{k,n}(\mathbf F)$ 把（78）在 $Q$ 条散射路径上汇集：$\mathbf b^{(m)}_{k,n}(\mathbf F)\triangleq\left[\frac{\partial[\mathbf B_k(\mathbf F)]_{n,1}}{\partial[\mathbf f_n]_m},\ldots,\frac{\partial[\mathbf B_k(\mathbf F)]_{n,Q}}{\partial[\mathbf f_n]_m}\right]^T$（式 (80)）。由于 $\mathbf R_k(\mathbf F)=\mathbf B_k(\mathbf F)\mathbf B_k^H(\mathbf F)$，有

$$
\frac{\partial\mathbf R_k(\mathbf F)}{\partial[\mathbf f_n]_m}=\boldsymbol\delta_n\left(\mathbf b^{(m)}_{k,n}\right)^T\mathbf B_k^H+\mathbf B_k\left(\mathbf b^{(m)}_{k,n}\right)^*\boldsymbol\delta_n^T.\tag{81}
$$

回顾 $a_k\triangleq\tau_pp_k^{\mathrm{tr}}$ 并记 $\mathbf A_k(\mathbf F)\triangleq a_k\mathbf R_k(\mathbf F)+\sigma^2\mathbf I_N$。利用（24）与 $\mathrm d\mathbf A_k^{-1}=-\mathbf A_k^{-1}(\mathrm d\mathbf A_k)\mathbf A_k^{-1}$，LMMSE 协方差的导数为

$$
\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}=a_k\frac{\partial\mathbf R_k(\mathbf F)}{\partial[\mathbf f_n]_m}\mathbf A_k^{-1}(\mathbf F)\mathbf R_k(\mathbf F)+a_k\mathbf R_k(\mathbf F)\mathbf A_k^{-1}(\mathbf F)\frac{\partial\mathbf R_k(\mathbf F)}{\partial[\mathbf f_n]_m}-a_k^2\mathbf R_k(\mathbf F)\mathbf A_k^{-1}(\mathbf F)\frac{\partial\mathbf R_k(\mathbf F)}{\partial[\mathbf f_n]_m}\mathbf A_k^{-1}(\mathbf F)\mathbf R_k(\mathbf F).\tag{82}
$$

相应地，

$$
\frac{\partial\mathbf C_{e,k}(\mathbf F)}{\partial[\mathbf f_n]_m}=\frac{\partial\mathbf R_k(\mathbf F)}{\partial[\mathbf f_n]_m}-\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}.\tag{83}
$$

最后定义二阶矩矩阵的导数：

$$
\frac{\partial\boldsymbol\Sigma_{h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}=\frac{\partial\mathbf R_k(\mathbf F)}{\partial[\mathbf f_n]_m}+\boldsymbol\delta_n\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\boldsymbol\mu_k^H(\mathbf F)+\boldsymbol\mu_k(\mathbf F)\left(\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\right)^*\boldsymbol\delta_n^T,\tag{84}
$$

$$
\frac{\partial\boldsymbol\Sigma_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}=\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}+\boldsymbol\delta_n\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\boldsymbol\mu_k^H(\mathbf F)+\boldsymbol\mu_k(\mathbf F)\left(\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\right)^*\boldsymbol\delta_n^T.\tag{85}
$$

### B. MRC 总速率替代的梯度

对带（48）的 MRC 替代 SINR（50），利用（43b）与（76）结合（82），得

$$
\frac{\partial\alpha_k(\mathbf F)}{\partial[\mathbf f_n]_m}=2\Re\left\{\mu_{k,n}^*(\mathbf F)\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\right\}+\mathrm{tr}\left(\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\right).\tag{86}
$$

对（46）中的多用户干扰项 $\Theta_{i,k}(\mathbf F)$，

$$
\frac{\partial\Theta_{i,k}(\mathbf F)}{\partial[\mathbf f_n]_m}=\mathrm{tr}\left(\frac{\partial\boldsymbol\Sigma_{h,i}(\mathbf F)}{\partial[\mathbf f_n]_m}\boldsymbol\Sigma_{\hat h,k}(\mathbf F)+\boldsymbol\Sigma_{h,i}(\mathbf F)\frac{\partial\boldsymbol\Sigma_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\right).\tag{87}
$$

对（49）中的自干扰项 $\Phi_k(\mathbf F)$，

$$
\frac{\partial\Phi_k(\mathbf F)}{\partial[\mathbf f_n]_m}=2\mathrm{tr}\left(\mathbf C_{\hat h,k}(\mathbf F)\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\right)+2\boldsymbol\mu_k^H(\mathbf F)\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\boldsymbol\mu_k(\mathbf F)+4\Re\left\{\left(\frac{\partial\mu_{k,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\right)^*\left[\mathbf C_{\hat h,k}(\mathbf F)\boldsymbol\mu_k(\mathbf F)\right]_n\right\}+\mathrm{tr}\left(\frac{\partial\mathbf C_{e,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\boldsymbol\Sigma_{\hat h,k}(\mathbf F)+\mathbf C_{e,k}(\mathbf F)\frac{\partial\boldsymbol\Sigma_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\right).\tag{88}
$$

因此 MRC 分母的导数为

$$
\frac{\partial I_k^{\mathrm{MRC}}(\mathbf F)}{\partial[\mathbf f_n]_m}=p_k\frac{\partial\Phi_k(\mathbf F)}{\partial[\mathbf f_n]_m}+\sum_{i\ne k}p_i\frac{\partial\Theta_{i,k}(\mathbf F)}{\partial[\mathbf f_n]_m}+\sigma^2\frac{\partial\alpha_k(\mathbf F)}{\partial[\mathbf f_n]_m}.\tag{89}
$$

于是 MRC SINR 替代的导数为

$$
\frac{\partial\bar\gamma_k^{\mathrm{MRC}}(\mathbf F)}{\partial[\mathbf f_n]_m}=\frac{p_k\left(2\alpha_k(\mathbf F)I_k^{\mathrm{MRC}}(\mathbf F)\frac{\partial\alpha_k(\mathbf F)}{\partial[\mathbf f_n]_m}-\alpha_k^2(\mathbf F)\frac{\partial I_k^{\mathrm{MRC}}(\mathbf F)}{\partial[\mathbf f_n]_m}\right)}{\left(I_k^{\mathrm{MRC}}(\mathbf F)\right)^2}.\tag{90}
$$

把三个偏导数堆叠，得梯度

$$
\nabla_{\mathbf f_n}\bar R^{\mathrm{MRC}}_{\mathrm{sum}}(\mathbf F)=\frac{\eta}{\ln 2}\sum_{k=1}^{K}\frac{1}{1+\bar\gamma_k^{\mathrm{MRC}}(\mathbf F)}\begin{bmatrix}\partial\bar\gamma_k^{\mathrm{MRC}}/\partial[\mathbf f_n]_x\\ \partial\bar\gamma_k^{\mathrm{MRC}}/\partial[\mathbf f_n]_y\\ \partial\bar\gamma_k^{\mathrm{MRC}}/\partial[\mathbf f_n]_z\end{bmatrix}.\tag{91}
$$

### C. wZF 总速率替代的梯度

对 wZF 替代（60），定义 $\Psi_k(\mathbf F)\triangleq[\bar{\mathbf S}^{-1}(\mathbf F)]_{k,k}$，则 $\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)=\frac{p_k}{\Psi_k(\mathbf F)}$。由（55），

$$
\frac{\partial\mathbf Z(\mathbf F)}{\partial[\mathbf f_n]_m}=\sum_{i=1}^{K}p_i\frac{\partial\mathbf C_{e,i}(\mathbf F)}{\partial[\mathbf f_n]_m},\tag{92}
$$

$$
\frac{\partial\mathbf Z^{-1}(\mathbf F)}{\partial[\mathbf f_n]_m}=-\mathbf Z^{-1}(\mathbf F)\frac{\partial\mathbf Z(\mathbf F)}{\partial[\mathbf f_n]_m}\mathbf Z^{-1}(\mathbf F).\tag{93}
$$

为处理（59），计算 LoS 矩阵的导数：

$$
\frac{\partial\mathbf M(\mathbf F)}{\partial[\mathbf f_n]_m}=\left[\boldsymbol\delta_n\frac{\partial\mu_{1,n}(\mathbf F)}{\partial[\mathbf f_n]_m},\ldots,\boldsymbol\delta_n\frac{\partial\mu_{K,n}(\mathbf F)}{\partial[\mathbf f_n]_m}\right].\tag{94}
$$

进一步导出

$$
\chi^{(m)}_{k,n}(\mathbf F)\triangleq\frac{\partial\mathrm{tr}\left(\mathbf Z^{-1}(\mathbf F)\mathbf C_{\hat h,k}(\mathbf F)\right)}{\partial[\mathbf f_n]_m}=\mathrm{tr}\left(\frac{\partial\mathbf Z^{-1}(\mathbf F)}{\partial[\mathbf f_n]_m}\mathbf C_{\hat h,k}(\mathbf F)+\mathbf Z^{-1}(\mathbf F)\frac{\partial\mathbf C_{\hat h,k}(\mathbf F)}{\partial[\mathbf f_n]_m}\right).\tag{95}
$$

令 $\mathbf D_n^{(m)}(\mathbf F)\triangleq\mathrm{diag}\left(\chi^{(m)}_{1,n}(\mathbf F),\ldots,\chi^{(m)}_{K,n}(\mathbf F)\right)$。对（59）求导得

$$
\frac{\partial\bar{\mathbf S}(\mathbf F)}{\partial[\mathbf f_n]_m}=\mathbf D_n^{(m)}(\mathbf F)+\left(\frac{\partial\mathbf M(\mathbf F)}{\partial[\mathbf f_n]_m}\right)^H\mathbf Z^{-1}(\mathbf F)\mathbf M(\mathbf F)+\mathbf M^H(\mathbf F)\mathbf Z^{-1}(\mathbf F)\frac{\partial\mathbf M(\mathbf F)}{\partial[\mathbf f_n]_m}+\mathbf M^H(\mathbf F)\frac{\partial\mathbf Z^{-1}(\mathbf F)}{\partial[\mathbf f_n]_m}\mathbf M(\mathbf F).\tag{97}
$$

利用矩阵求逆恒等式

$$
\frac{\partial\bar{\mathbf S}^{-1}(\mathbf F)}{\partial[\mathbf f_n]_m}=-\bar{\mathbf S}^{-1}(\mathbf F)\frac{\partial\bar{\mathbf S}(\mathbf F)}{\partial[\mathbf f_n]_m}\bar{\mathbf S}^{-1}(\mathbf F),\tag{98}
$$

$\Psi_k(\mathbf F)$ 的导数为

$$
\frac{\partial\Psi_k(\mathbf F)}{\partial[\mathbf f_n]_m}=-\left[\bar{\mathbf S}^{-1}(\mathbf F)\frac{\partial\bar{\mathbf S}(\mathbf F)}{\partial[\mathbf f_n]_m}\bar{\mathbf S}^{-1}(\mathbf F)\right]_{k,k}.\tag{99}
$$

因此 wZF SINR 替代的导数为

$$
\frac{\partial\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)}{\partial[\mathbf f_n]_m}=\frac{p_k}{\Psi_k^2(\mathbf F)}\left[\bar{\mathbf S}^{-1}(\mathbf F)\frac{\partial\bar{\mathbf S}(\mathbf F)}{\partial[\mathbf f_n]_m}\bar{\mathbf S}^{-1}(\mathbf F)\right]_{k,k}.\tag{100}
$$

于是 wZF 总速率替代的梯度为

$$
\nabla_{\mathbf f_n}\bar R^{\mathrm{wZF}}_{\mathrm{sum}}(\mathbf F)=\frac{\eta}{\ln 2}\sum_{k=1}^{K}\frac{1}{1+\bar\gamma_k^{\mathrm{wZF}}(\mathbf F)}\begin{bmatrix}\partial\bar\gamma_k^{\mathrm{wZF}}/\partial[\mathbf f_n]_x\\ \partial\bar\gamma_k^{\mathrm{wZF}}/\partial[\mathbf f_n]_y\\ \partial\bar\gamma_k^{\mathrm{wZF}}/\partial[\mathbf f_n]_z\end{bmatrix}.\tag{101}
$$

### D. 带球冠投影的投影梯度上升

给定任一目标 $\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F)$（$\mathrm{BF}\in\{\mathrm{MRC},\mathrm{wZF}\}$），定义梯度

$$
\nabla_{\mathbf f_n}\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F)=\left[\frac{\partial\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F)}{\partial[\mathbf f_n]_x},\frac{\partial\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F)}{\partial[\mathbf f_n]_y},\frac{\partial\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F)}{\partial[\mathbf f_n]_z}\right]^T.\tag{102}
$$

为保持单位范数约束，先去除径向分量：

$$
\mathbf g_n^{(\ell)}=\left(\mathbf I_3-\mathbf f_n^{(\ell)}(\mathbf f_n^{(\ell)})^T\right)\nabla_{\mathbf f_n}\bar R^{\mathrm{BF}}_{\mathrm{sum}}\left(\mathbf F^{(\ell)}\right).\tag{103}
$$

这正是梯度在球面切空间上的欧氏投影。给定步长 $\alpha^{(\ell)}>0$，试探更新为

$$
\tilde{\mathbf f}_n^{(\ell+1)}=\frac{\mathbf f_n^{(\ell)}+\alpha^{(\ell)}\mathbf g_n^{(\ell)}}{\left\|\mathbf f_n^{(\ell)}+\alpha^{(\ell)}\mathbf g_n^{(\ell)}\right\|},\tag{104}
$$

随后经（105）投影到球冠 $\mathcal F_n$：

$$
\mathbf f_n^{(\ell+1)}=\Pi_{\mathcal F_n}\left(\tilde{\mathbf f}_n^{(\ell+1)}\right)=\begin{cases}\tilde{\mathbf f}_n^{(\ell+1)}, & \arccos\left((\tilde{\mathbf f}_n^{(\ell+1)})^T\mathbf e_z\right)\le\theta_{\max},\\ \cos\theta_{\max}\mathbf e_z+\sin\theta_{\max}\frac{\mathbf a_n^{(\ell+1)}}{\|\mathbf a_n^{(\ell+1)}\|}, & \text{其他},\end{cases}\tag{105}
$$

其中

$$
\mathbf a_n^{(\ell+1)}\triangleq\tilde{\mathbf f}_n^{(\ell+1)}-\left((\tilde{\mathbf f}_n^{(\ell+1)})^T\mathbf e_z\right)\mathbf e_z.\tag{106}
$$

步长由 Armijo 回溯选择：选取满足下式的最大 $\alpha^{(\ell)}=\rho^q\alpha_0$（$\rho\in(0,1)$）：

$$
\bar R^{\mathrm{BF}}_{\mathrm{sum}}\left(\mathbf F^{(\ell+1)}\right)\ge\bar R^{\mathrm{BF}}_{\mathrm{sum}}\left(\mathbf F^{(\ell)}\right)+c\,\alpha^{(\ell)}\sum_{n=1}^{N}\left\|\mathbf g_n^{(\ell)}\right\|^2,\tag{107}
$$

其中 $c\in(0,1)$ 为 Armijo 参数。当有效梯度范数低于预设阈值 $\epsilon>0$（即 $\max_{n\in\mathcal N}\|\mathbf g_n^{(\ell)}\|\le\epsilon$）或达到最大迭代次数时停止。

```text
Algorithm 1 面向 RA 旋转的投影梯度上升
1: 输入：初始 F^(0) ∈ F、容差 ε、最大迭代数 L_max、接收机类型 BF ∈ {MRC, wZF}
2: for ℓ = 0, 1, …, L_max − 1 do
3:     对全部 n 计算 ∇_{f_n} R̄_sum^BF(F^(ℓ))：BF=MRC 用 (91)，BF=wZF 用 (101)
4:     由 (103) 计算投影上升方向 g_n^(ℓ)
5:     if max_n ‖g_n^(ℓ)‖ ≤ ε then
6:         break
7:     end if
8:     用 (107) 的 Armijo 回溯选择 α^(ℓ)
9:     由 (104) 更新 f̃_n^(ℓ+1)，并经 (105) 投影到 F_n
10:    构造 F^(ℓ+1) = [f_1^(ℓ+1), …, f_N^(ℓ+1)]
11: end for
12: 输出：F* = F^(ℓ+1)
```

### E. 收敛性与复杂度

上述算法汇总于算法 1。令 $\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F)$ 为 $\bar R^{\mathrm{MRC}}(\mathbf F)$ 或 $\bar R^{\mathrm{wZF}}(\mathbf F)$。在带 Armijo 回溯（107）的算法 1 下，序列 $\{\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F^{(\ell)})\}$ 非降，即对所有 $\ell$ 有 $\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F^{(\ell+1)})\ge\bar R^{\mathrm{BF}}_{\mathrm{sum}}(\mathbf F^{(\ell)})$。由于目标连续且 $\mathcal F$ 紧致，目标序列有上界因而收敛。此外算法终止于满足投影梯度停止准则的点，该点是（72a）或（72b）的 Clarke 稳定点候选。

该算法便于实现：式（76）与（79）的稀疏结构意味着改变 $\mathbf f_n$ 只影响信道统计的第 $n$ 个分量/行，从而大幅降低梯度求值复杂度。假设对（55）、（58）、（82）中矩阵 $\mathbf Z(\mathbf F)$、$\bar{\mathbf S}(\mathbf F)$、$\mathbf A(\mathbf F)$ 直接求逆，MRC 设计每轮主导开销为 $\mathcal O(KN^3+K^2N^2)$，而 wZF 设计因需额外求逆 $\mathbf Z(\mathbf F)$ 与 $\bar{\mathbf S}(\mathbf F)$，其每轮开销为 $\mathcal O((K+1)N^3+K^2N^2+K^3)$。上述复杂度阶假设公共矩阵 $\{\mathbf A_k^{-1}(\mathbf F)\}_{k=1}^{K}$、$\mathbf Z^{-1}(\mathbf F)$、$\bar{\mathbf S}^{-1}(\mathbf F)$ 每轮只求逆一次并在所有逐元素梯度求值中复用。实践中两种设计都在适度迭代次数内收敛，wZF 更昂贵但通常带来更大增益。

## VII. 数值结果

除另作说明，考虑配备 $N=N_{\mathrm{row}}N_{\mathrm{col}}=2\times4$ 个 RA 的 UPA 的 BS，工作频率 $f_c=6$ GHz、阵元间距半波长；用户数与散射簇数分别为 $K=4$ 与 $Q=3$；天线方向性参数 $b=4$，相应最大阵元增益 $G_0=2(2b+1)=18$。噪声功率 $\sigma^2=-80$ dBm；参考距离 1 m 处路损为 $-30$ dB，等价于设 $\frac{\varrho}{4\pi}=10^{-3}$ m²；相干块长度 $T_c=200$，默认最大旋转角 $\theta_{\max}=60^\circ$，设 $\tau_p=K$。所有用户以相同发射功率发送。

**图 2：** 平均总速率随 BS 天线数 $N$ 的变化（wZF 替代—优化 $\mathbf F$、wZF 遍历—优化 $\mathbf F$、MRC 替代—优化 $\mathbf F$、MRC 遍历—优化 $\mathbf F$、wZF 遍历—随机 $\mathbf F$、MRC 遍历—随机 $\mathbf F$）。（来源：原文第 8 页。）

**图 3：** 平均总速率随用户数 $K$ 的变化。（来源：原文第 8 页。）

图 2 表明：随天线数增加，各方案速率上升，优化朝向相对随机/固定朝向的优势随 $N$ 增大而扩大；闭式替代曲线与遍历（ergodic）曲线紧密贴合，验证大时间尺度替代的准确性。图 3 进一步展示不同伸缩律：随 $K$ 增大，MRC 因用户间干扰增长而饱和更快，而 wZF 通过误差感知的用户分离维持更高总速率。

**图 4：** 平均总速率随用户发射功率的变化。（来源：原文第 8 页。）

**图 5：** 平均总速率随最大旋转角 $\theta_{\max}$ 的变化。（来源：原文第 9 页。）

**图 6：** 平均总速率随天线方向性参数 $b$ 的变化。（来源：原文第 9 页。）

图 4 显示：在低发射功率（噪声受限）区间，各方案差异较小；随功率增大进入干扰受限区间，RA 旋转带来的增益显著增大，说明朝向优化主要通过抑制多用户干扰与估计误差自干扰获益。图 5 表明速率随 $\theta_{\max}$ 增大而提升：更大的允许旋转范围使阵列能把视轴更精确地指向有利方向；但增益随 $\theta_{\max}$ 增大逐渐饱和。图 6 考察方向性参数 $b$：更窄的主瓣（更大 $b$）在用户方向分离良好时提升方向增益，但波束覆盖变窄也会加剧失配风险，故存在最优区间。

**图 7：** 不同 RA 朝向方案下平均有效子空间 NMSE 随导频占比 $\tau_p/T_c$ 的变化（固定 $\mathbf F$、NMSE 最优 $\mathbf F$、MRC 最优 $\mathbf F$、wZF 最优 $\mathbf F$）。（来源：原文第 12 页。）

**图 8：** wZF 接收机下平均数据阶段与净频谱效率随导频占比的变化（固定/ NMSE 最优/ MRC 最优/ wZF 最优 $\mathbf F$；实线为净速率、虚线为数据阶段速率）。（来源：原文第 12 页。）

图 7 验证引理 1 预测的单调性：如预期，NMSE 最优朝向（"NMSE-opt. $\mathbf F$"曲线由求解 $\min_{\mathbf F\in\mathcal F}\frac1K\sum_k\mathrm{NMSE}_k(\mathbf F)$ 得到）确实取得最小 NMSE。然而图 8 表明：**更好的估计质量并不会自动转化为最佳通信性能**——wZF 最优朝向在整个导频占比范围内取得最大的数据阶段频谱效率，而 NMSE 最优朝向在速率上明显次优。这直接以数值确认了注 1：最小化归一化估计误差与最大化通信速率一般是不同的设计目标，因为后者还依赖确定性 LoS 项，更重要的是依赖经由合并器结构的多用户耦合。此外在图 8 中，数据阶段频谱效率的虚线曲线随导频占比增大而上升，因为更长训练改善信道估计、进而提升有效 SINR；而净频谱效率的实线曲线在预对数因子 $\eta=1-\tau_p/T_c$ 主导 SINR 改善后可能下降。特别地，NMSE 最优朝向在估计质量上从更长训练中获益最多，但其净速率仍逊于 wZF 最优朝向。

**图 9：** 平均总速率随 4 个用户角间隔 $\Delta\phi$ 的变化（MRC 固定/优化 $\mathbf F$、wZF 固定/优化 $\mathbf F$）。（来源：原文第 12 页。）

图 9 考察受控的四用户几何：所有用户位于同一圆环、改变其角间隔 $\Delta\phi$，以分离注 4 与推论 1 中所述 MRC 与 wZF 运行机理背后的几何机制。对 MRC，固定与优化曲线均随 $\Delta\phi$ 增大单调上升后逐渐饱和——这反映 MRC 主要获益于更强的期望信道与更低的干扰泄漏，但接收机本身并不主动处理多用户几何；一旦用户充分分离，额外角度扩展带来的收益递减。尽管如此，优化后的 MRC 曲线在整个范围内仍显著高于固定基线，表明 RA 旋转可同时改善（48）中的相干增益项并降低多用户干扰项。wZF 的行为更具信息量：在小 $\Delta\phi$ 下，固定 wZF 基线表现很差，因为用户角度近乎对齐、有效信道高度相关；经 RA 优化后，wZF 速率随 $\Delta\phi$ 急剧上升并显著优于所有 MRC 曲线。这验证了推论 1 的核心信息：wZF 的 RA 旋转之所以有价值，不仅在于增强有用链路，更在于在保持较大误差感知有用增益的同时降低误差感知的用户间耦合。有趣的是，优化后的 wZF 曲线在中等至较大间隔处达到最大，随后当 $\Delta\phi$ 非常大时略有下降；这一轻微过峰下降揭示了速率对几何的精细依赖。

**图 10：** 单用户 LoS 主导情形下平均速率随最大旋转角 $\theta_{\max}$ 的变化（固定 $\mathbf F$、闭式解 $\mathbf F$、PGA 解 $\mathbf F$）。（来源：原文第 13 页。）

图 10 考虑单用户 LoS 主导情形，比较固定朝向、闭式解朝向与投影梯度解朝向的平均速率随 $\theta_{\max}$ 的变化：在一定 $\theta_{\max}$ 之前，闭式解与 PGA 解均优于固定朝向；随 $\theta_{\max}$ 进一步增大，收益趋于饱和，且两种优化解的差距很小，表明在单用户 LoS 主导时简单的闭式朝向解已接近最优，而 PGA 在更复杂的多用户/多径情形中更具价值。

## VIII. 结论

本文研究了不完美 CSI 下 RA 使能上行多用户 MIMO 的双时间尺度设计：大时间尺度上依据统计 CSI 优化 RA 朝向，小时间尺度上依据 LMMSE 估计更新线性合并器。我们推导了 MRC 的闭式 UatF 速率表达式与 wZF 的闭式统计速率替代，显式刻画 RA 旋转如何通过有用信号强度、估计误差自干扰与多用户干扰影响速率，并指出最小化 NMSE 的朝向与最大化速率的朝向不同、MRC 与 wZF 偏好不同的旋转配置。针对高度非凸的旋转设计问题，我们提出在球冠乘积集上的投影梯度算法，给出速率替代与信道统计量的显式导数、Armijo 步长与收敛性/复杂度分析。数值结果验证了闭式替代的准确性，并显示 RA 朝向优化相对固定/随机朝向的显著增益，其中 wZF 因利用误差感知的用户分离而获益更大。未来工作可考虑更一般的信道与硬件不完美、以及与其他物理层可重构技术的联合设计。

## 参考文献（英文原书目）

[1] E. Björnson, L. Sanguinetti, H. Wymeersch, J. Hoydis, and T. L. Marzetta, "Massive MIMO is a reality—What is next? Five promising research directions for antenna arrays," Digital Signal Processing, vol. 94, pp. 3–20, Nov. 2019.
[2] T. L. Marzetta, "Noncooperative cellular wireless with unlimited numbers of base station antennas," IEEE Trans. Wireless Commun., vol. 9, no. 11, pp. 3590–3600, Nov. 2010.
[3] F. Rusek, D. Persson, B. K. Lau, E. G. Larsson, T. L. Marzetta, O. Edfors, and F. Tufvesson, "Scaling up MIMO: Opportunities and challenges with very large arrays," IEEE Signal Process. Mag., vol. 30, no. 1, pp. 40–60, Jan. 2013.
[4] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, "Massive MIMO for next generation wireless systems," IEEE Commun. Mag., vol. 52, no. 2, pp. 186–195, Feb. 2014.
[5] A. L. Swindlehurst, E. Ayanoglu, P. Heydari, and F. Capolino, "Millimeter-wave massive MIMO: The next wireless revolution?" IEEE Commun. Mag., vol. 52, no. 9, pp. 56–62, Sep. 2014.
[6] Q. Wu, S. Zhang, B. Zheng, C. You, and R. Zhang, "Intelligent reflecting surface-aided wireless communications: A tutorial," IEEE Trans. Commun., vol. 69, no. 5, pp. 3313–3351, May 2021.
[7] Q. Wu and R. Zhang, "Intelligent reflecting surface enhanced wireless network via joint active and passive beamforming," IEEE Trans. Wireless Commun., vol. 18, no. 11, pp. 5394–5409, Nov. 2019.
[8] C. Pan et al., "Reconfigurable intelligent surfaces for 6G systems: Principles, applications, and research directions," IEEE Commun. Mag., vol. 59, no. 6, pp. 14–20, Jun. 2021.
[9] K.-K. Wong, A. Shojaeifard, K.-F. Tong, and Y. Zhang, "Fluid antenna systems," IEEE Trans. Wireless Commun., vol. 20, no. 3, pp. 1950–1962, Mar. 2021.
[10] L. Zhu, W. Ma, and R. Zhang, "Movable antennas for wireless communication: Opportunities and challenges," IEEE Commun. Mag., vol. 62, no. 6, pp. 114–120, Jun. 2024.
[11] W. Ma, L. Zhu, and R. Zhang, "Compressed sensing based channel estimation for movable antenna communications," IEEE Commun. Lett., vol. 27, no. 10, pp. 2747–2751, Oct. 2023.
[12] Z. Xiao, X. Pi, L. Zhu, X.-G. Xia, and R. Zhang, "Multiuser communications with movable-antenna base station: Joint antenna positioning, receive combining, and power control," IEEE Trans. Wireless Commun., 2024.
[13] L. Zhu, W. Ma, and R. Zhang, "Movable antennas for wireless communication: Opportunities and challenges," IEEE Commun. Mag., 2024.
[14] S. Zhang and R. Zhang, "Capacity characterization of intelligent reflecting surface aided multiple access," IEEE Trans. Wireless Commun., vol. 20, no. 11, pp. 7292–7307, Nov. 2021.
[15] X. Mu, Y. Liu, L. Han, and R. Schober, "Intelligent reflecting surface enhanced multi-user MIMO systems," IEEE J. Sel. Topics Signal Process., 2022.
[16] Z. Zheng, Q. Wu, and W. Chen, "Rotatable antenna enabled wireless communications," arXiv preprint, 2025.
[17] Z. Zheng, Q. Wu, W. Chen, and R. Zhang, "Rotatable antenna arrays for wireless communications," IEEE Trans. Wireless Commun., 2025.
[18] Z. Zheng, Q. Wu, and W. Chen, "Orientation optimization for rotatable antenna systems," IEEE Wireless Commun. Lett., 2025.
[19] Z. Zheng, Q. Wu, W. Chen, et al., "Rotatable antennas: Hardware, channel modeling, and optimization," 2025.
[20] Y. Huang, Y. Liu, and L. Hanzo, "Movable antennas for wireless communications: Opportunities and challenges," 2024.
[21] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge Univ. Press, 2005.
[22] T. L. Marzetta, E. G. Larsson, H. Yang, and H. Q. Ngo, Fundamentals of Massive MIMO. Cambridge Univ. Press, 2016.
[23] Q. Wu, S. Zhang, B. Zheng, C. You, and R. Zhang, "Intelligent reflecting surface-aided wireless communications: A tutorial," IEEE Trans. Commun., 2021.
[24] L. Zhu, W. Ma, and R. Zhang, "Movable antenna enhanced wireless communications," 2023.
[25] H. Q. Ngo, E. G. Larsson, and T. L. Marzetta, "The multicell multiuser MIMO uplink with very large antenna arrays and a finite-dimensional channel," IEEE Trans. Commun., vol. 61, no. 6, pp. 2350–2361, Jun. 2013.
[26] T. C. Mai, H. Q. Ngo, and T. Q. Duong, "Cell-free massive MIMO with multi-antenna users: A survey," IEEE Access, vol. 11, pp. 3234–3250, 2023.
[27] E. Björnson et al., "Massive MIMO for maximal spectral efficiency: How many users and pilots should be allocated?" IEEE Trans. Wireless Commun., vol. 15, no. 2, pp. 1293–1308, Feb. 2016.
[28] H. Q. Ngo et al., "Cell-free massive MIMO versus small cells," IEEE Trans. Wireless Commun., vol. 16, no. 3, pp. 1834–1850, Mar. 2017.
[29] C. Siriteanu et al., "MIMO zero-forcing detection analysis for correlated and estimated Rician fading," IEEE Trans. Veh. Technol., vol. 61, no. 7, pp. 3087–3099, Sep. 2012.
[30] A. Kammoun et al., "Asymptotic analysis of RZF in large-scale MU-MIMO systems over Rician channels," IEEE Trans. Inf. Theory, vol. 65, no. 11, pp. 7268–7286, Nov. 2019.
[31] N. S. Perović et al., "Achievable rate optimization for MIMO systems with reconfigurable intelligent surfaces," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 3865–3882, Jun. 2021.

## 图注与表注

**图 1（原文第 2 页）：** 系统模型示意：(a) RA 使能的上行多用户 MIMO 系统；(b) RA 的方向辐射图样与旋转；(c) 所提双时间尺度设计框架。
**图 2（原文第 8 页）：** 平均总速率随 BS 天线数 $N$ 的变化。
**图 3（原文第 8 页）：** 平均总速率随用户数 $K$ 的变化。
**图 4（原文第 8 页）：** 平均总速率随用户发射功率的变化。
**图 5（原文第 9 页）：** 平均总速率随最大旋转角 $\theta_{\max}$ 的变化。
**图 6（原文第 9 页）：** 平均总速率随天线方向性参数 $b$ 的变化。
**图 7（原文第 12 页）：** 不同 RA 朝向方案下平均有效子空间 NMSE 随导频占比 $\tau_p/T_c$ 的变化。
**图 8（原文第 12 页）：** wZF 接收机下平均数据阶段与净频谱效率随导频占比的变化。
**图 9（原文第 12 页）：** 平均总速率随 4 个用户角间隔 $\Delta\phi$ 的变化。
**图 10（原文第 13 页）：** 单用户 LoS 主导情形下平均速率随最大旋转角 $\theta_{\max}$ 的变化（固定/闭式解/PGA 解）。

**表注：** 原文全文**无编号表格**（仅图 1—10 与算法 1），故本页无需转录表格。数值设置（$N=2\times4$、$f_c=6$ GHz、$K=4$、$Q=3$、$b=4$、$G_0=18$、$\sigma^2=-80$ dBm、$\varrho/4\pi=10^{-3}$ m²、$T_c=200$、$\theta_{\max}=60^\circ$、$\tau_p=K$）按原文 §VII 照录。

**本页范围与校对状态：** 本页覆盖 arXiv:2605.04775v1（eess.SP，2026 年 5 月 6 日）全文 13 页：摘要、第 I—VIII 节、图 1—10 图注、式（1）—（107）、算法 1、参考文献 [1]—[31]（英文原条目）。**公式转写说明：** 本页以独立显示公式逐式转写了核心公式，共 97 个编号式；原文式 (26)、(27)、(28)、(33)、(38)、(39)、(40)、(42)、(44)、(45)、(66)、(70)、(71)、(80)、(96) 在正文中以**文字描述 + 原文编号引用**方式处理（多为中间恒等式、引理证明中的谱分解步骤、UatF SINR 定义与矩匹配近似），未逐式重排为独立显示式；如需逐式核对请查原文对应编号。原文全文无编号表格，故无表格可转录（已用 PDF 文本抽取逐页确认无 Table 编号）。源文抽取含 60 个 NUL 字节，已生成去 NUL 干净副本 `sources\recent-2605-04775-clean.txt` 用于核对（未修改原文件）。原文疑点/说明已在页首译注列出（P1 的期望与 max 次序、wZF 统计替代非严格等价、式 (62) 各向同性假设在 RA 下不成立、式 (73) 边界零次梯度、复杂度假设、图 7 的 NMSE 最优曲线定义、$N=N_{\mathrm{row}}N_{\mathrm{col}}$ 记号），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写，图注与正文说明只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2605.04775v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}