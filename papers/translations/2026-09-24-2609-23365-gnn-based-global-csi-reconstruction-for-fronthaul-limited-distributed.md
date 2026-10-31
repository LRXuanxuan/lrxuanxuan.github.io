---
layout: page
title: "前传受限分布式 MIMO 的 GNN 全局 CSI 重建｜中文全文译文"
permalink: /papers/translations/2026-09-24-2609-23365-gnn-based-global-csi-reconstruction-for-fronthaul-limited-distributed/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4d5da75c47c1bce9/) · [原文 arXiv](https://arxiv.org/abs/2609.23365) · [全部目录](/papers/catalog/)

# 前传受限分布式 MIMO 的 GNN 全局 CSI 重建

**原题：** GNN-Based Global CSI Reconstruction for Fronthaul-Limited Distributed MIMO Systems  
**作者：** Haojin Li、Kaiqian Qu、Anbang Zhang、Chen Sun（Senior Member, IEEE）、Wenqi Zhang、Haijun Zhang（Fellow, IEEE）  
**单位：** Haojin Li 与 Haijun Zhang 为北京科技大学融合网络与泛在服务北京市工程技术研究中心（北京 100083，中国；通讯作者：Haijun Zhang，E-mail: zhanghaijun@ustb.edu.cn）；Haojin Li、Kaiqian Qu、Anbang Zhang、Chen Sun、Wenqi Zhang 为索尼中国研究院无线网络研究部（北京 100027，中国）。  
**版本：** arXiv:2609.23365v1（cs.IT），2026-09-20，原文 6 页（含图 1—6；原文无表格）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—V 节、注 1、图 1—6 图注、参考文献 [1]—[12] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2609.23365，2026-09-24"；本地 PDF 为 **arXiv:2609.23365v1 [cs.IT]，2026-09-20**，"2026-09-24" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

全局信道状态信息（CSI）的获取对分布式多输入多输出（DMIMO）系统中的协作预编码至关重要，但从所有分布式天线上传完整瞬时 CSI 会造成沉重的前传（fronthaul）开销。本文提出一种基于**图神经网络（GNN）重建**与**任务驱动天线选择**的前传高效获取框架。每个收发点（TRP）只上传被选中天线的 CSI，而集中单元（CU）从部分观测中重建完整全局 CSI。一个通用的、以掩码为条件的 GNN 先用随机上传掩码训练，用于在前传预算下评估天线子集，随后针对所选部署掩码微调。仿真结果表明，该框架在更低的前传与导频开销下提高了 CSI 重建精度。

**索引词**：分布式 MIMO；前传受限；全局 CSI 重建；图神经网络。

## I. 引言

分布式多输入多输出（DMIMO）常以大规模、以用户为中心的形式作为无蜂窝大规模 MIMO 研究，是面向超五代（beyond-5G）与第六代（6G）无线网络的有前景架构。通过用地理上分布的收发点（TRP）或接入点（AP）取代以小区为中心的传输，DMIMO 可提供宏分集、改善用户公平性并缓解小区间干扰 [1]。当分布式天线通过相干联合处理进行协调时，这些收益最为显著，而这又要求集中单元（CU）处掌握准确的全局瞬时信道状态信息（CSI）[2]。

因此，全局瞬时 CSI 的获取与传递是关键的可扩展性瓶颈。现有无蜂窝大规模 MIMO 研究已发展了预编码与功率控制方法 [3]、集中式 MMSE 处理 [2]、可扩展的以用户为中心架构 [4], [5] 以及本地部分迫零预编码 [6]。这些方法在不同处理假设下改进了协作传输，但主要关注**获得 CSI 之后如何使用它**，并未直接解决本文考虑的天线级获取问题：当只能通过有限前传链路上传少量分布式天线 CSI 向量时，CU 如何恢复全局瞬时 CSI 矩阵。

若干开销削减技术与之相关，但并非完全适配本设置。对 FDD 无蜂窝大规模 MIMO，角域处理利用长期多径结构降低 CSI 获取开销 [7]；基于深度学习的 CSI 反馈方法（如 CsiNet 与 CLNet）用神经自编码器架构压缩与重建大规模 MIMO CSI [8], [9]，但此类反馈方法通常需要在反馈侧配备神经编码器，且不显式决定应上传哪些物理天线 CSI 向量。近期基于学习的天线选择已在无蜂窝 MIMO 网络中与预编码联合设计 [10]，但其目标是面向谱效优化的发射天线激活，而非为全局信道重建选择上传的 CSI 观测。

为解决该问题，本文提出一种前传高效的全局 CSI 获取框架：每个 TRP 只估计并上传被选中天线维度的 CSI，而所有学习与重建都在 CU 处完成。首先用一个**通用的、以掩码为条件的图神经网络（GNN）**以随机上传掩码训练，使其能从不同部分观测图样恢复全局 CSI；然后用训练好的重建器在前传预算下执行任务驱动天线选择；最后针对最终部署掩码做选择专属微调。仿真结果表明，所提框架在改善 CSI 重建精度与下行传输性能的同时，降低了前传与基于导频的 CSI 获取开销。

## II. 系统模型与问题表述

### A. 前传受限的分布式 MIMO 架构

我们考虑一个前传受限的 DMIMO 系统：$M$ 个分布式 TRP 通过前传链路连接到一个 CU。每个 TRP 配备 $N_t$ 根天线，分布式天线总数为 $N=MN_t$。CU 负责集中式协作信号处理，例如全局 CSI 获取与联合传输设计。

**图 1**：DMIMO 系统示意（CU、TRP 1—3 与部分 CSI 上传链路）。

设 $\mathbf H_m\in\mathbb C^{N_r\times N_t}$ 表示第 $m$ 个 TRP 的 $N_t$ 根天线到配备 $N_r$ 根天线的接收机之间的瞬时信道矩阵。全局 CSI 矩阵为

$$
\mathbf H=[\mathbf H_1,\mathbf H_2,\ldots,\mathbf H_M]\in\mathbb C^{N_r\times N},\tag{1}
$$

其中 $\mathbf H$ 的第 $i$ 列（记为 $\mathbf h_i\in\mathbb C^{N_r}$）表示与第 $i$ 根全局天线关联的信道向量。全局天线索引 $i$ 可映射到特定 TRP 及其相应本地天线索引。

在传统集中式 DMIMO 中，每个 TRP 上传瞬时 CSI，使 CU 获得完整全局 CSI 矩阵 $\mathbf H$；但由此产生的前传开销随分布式天线总数增长，当 $M$ 或 $N_t$ 增大时可能变得不可承受。

### B. 长期空间信道模型

瞬时全局 CSI 依据长期空间信道统计生成。具体地，考虑相关信道模型

$$
\mathbf H=\mathbf R_r^{1/2}\mathbf W\mathbf R_t^{1/2},\tag{2}
$$

其中 $\mathbf W\in\mathbb C^{N_r\times N}$ 含零均值、单位方差的独立同分布复高斯元素，$\mathbf R_r\in\mathbb C^{N_r\times N_r}$ 表示接收侧空间相关矩阵，$\mathbf R_t\in\mathbb C^{N\times N}$ 表示跨全部分布式 TRP 天线的发射侧长期协方差矩阵。为清晰并突出发射侧前传压缩问题，我们设 $\mathbf R_r=\mathbf I_{N_r}$。

发射侧协方差同时捕获大尺度衰落与分布式天线间的空间相关性，其 $(i,j)$ 元素可写为

$$
[\mathbf R_t]_{i,j}=\sqrt{\beta_i\beta_j}\rho_{i,j},\tag{3}
$$

其中 $\beta_i$ 表示第 $i$ 根全局天线的大尺度衰落系数，$\rho_{i,j}$ 表示天线 $i$ 与 $j$ 之间的归一化长期空间相关性。我们采用常用的指数空间相关模型描述分布式天线间依赖距离的长期相关性 [11]，即

$$
\rho_{i,j}=\exp\left(-\frac{d_{i,j}}{d_c}\right),\tag{4}
$$

其中 $d_{i,j}$ 为两天线之间的物理距离，$d_c$ 为相关距离参数。

假定长期信道统计的变化远慢于瞬时 CSI，因此可在长时间尺度上估计或更新，并在 CU 处可用；相反，瞬时 CSI 需频繁上传，因而主导前传信令开销。

### C. 部分 CSI 上传与全局 CSI 重建

幸运的是，TRP 天线间的长期空间相关性使得从少量已观测天线 CSI 推断未上传天线 CSI 成为可能。设 $\mathcal S\subseteq\{1,2,\ldots,N\}$ 表示被选中用于 CSI 上传的全局天线索引集，上传天线 CSI 向量总数受限于 $|\mathcal S|=K$、$K\ll N$。CU 观测到的相应部分 CSI 为

$$
\mathbf H_{\mathcal S}=\mathbf H(:,\mathcal S).\tag{5}
$$

上传的 CSI 对应 $\mathbf H$ 的观测列，其余列在 CU 处不可用、需要重建。

> **注 1（上传 CSI 的获取）**：上传的部分 CSI $\mathbf H_{\mathcal S}$ 通过在被选天线维度上执行传统导频辅助最小二乘（LS）信道估计获得。由于只估计并上传 $K$ 个天线 CSI 向量（$K\ll N$），LS 估计只涉及低维信道矩阵，因而计算复杂度很低。

全局 CSI 重建的目标是从部分上传中恢复完整 CSI 矩阵：

$$
\hat{\mathbf H}=\mathcal R\left(\mathbf H_{\mathcal S},\mathcal S;\Theta\right),\tag{6}
$$

其中 $\mathcal R(\cdot)$ 表示部署在 CU 处的重建函数，$\Theta$ 表示其可学习参数。

该问题因多种原因而具有挑战性。关键困难在于部分 CSI 上传引入了**重建与选择的耦合问题**：一方面，CU 必须只根据少量上传的 CSI 向量推断缺失的天线 CSI；另一方面，重建质量强烈依赖上传了哪些天线 CSI 向量。因此问题不仅是"如何从部分观测重建全局 CSI"，还包括"如何确定一个信息量大的天线 CSI 子集用于上传"。

## III. 所提基于 GNN 的 CSI 重建框架

所提框架包含三个阶段：通用 GNN 重建器训练、任务驱动天线选择、选择专属微调。第一阶段，CU 在受前传预算约束的随机生成天线上传掩码下训练通用掩码条件 GNN 重建器；对每个掩码，只有被选中天线的 CSI 视为已观测，其余天线的 CSI 被遮蔽。第二阶段，训练好的通用重建器被用作天线上传选择的评估器：由于不同天线子集可能导致不同重建质量，CU 在上传预算下搜索信息量大的天线子集，选择准则可基于验证重建误差指标。第三阶段，一旦获得最终天线上传集，就用该固定选择掩码微调通用重建器——这一步把重建器从通用的掩码条件模型适配为选择专属模型，从而提升最终部署图样下的重建质量。

**图 2**：基于 GNN 的 CSI 重建示意（部分天线上传 → 图输入嵌入 → 掩码条件 GNN 层（自更新与邻居聚合）→ 输出映射 → 重建 CSI，并带数据一致性约束）。

### A. 基于 GNN 的全局 CSI 重建

部分 CSI 上传问题可自然解释为**图信号补全问题**：具体地，每根分布式天线的瞬时 CSI 视为节点信号，而天线间的长期统计依赖提供图结构。在此视角下，CU 通过在天线级图上把信息从已上传天线节点传播到未上传天线节点来重建缺失的天线 CSI [12]。

**1）天线级图表示**：我们构造天线级图

$$
\mathcal G=(\mathcal V,\mathcal E,\mathbf A),\tag{7}
$$

其中 $\mathcal V={1,2,\ldots,N}$ 表示天线节点集，$\mathcal E$ 表示图边集，$\mathbf A\in\mathbb R^{N\times N}$ 为邻接矩阵。这种天线级建模很重要，因为前传约束正是施加在上传天线 CSI 向量的数量上。

对第 $i$ 个天线节点，记 $\mathbf h_i=\mathbf H(:,i)\in\mathbb C^{N_r}$ 为其瞬时 CSI 向量、$m_i\in\{0,1\}$ 为其上传指示。若天线 $i$ 被上传（即 $m_i=1$），则 CU 观测到 $\mathbf h_i$；否则该节点的瞬时 CSI 不可用。观测到的 CSI 向量可写为

$$
\tilde{\mathbf h}_i=m_i\mathbf h_i.\tag{8}
$$

复 CSI 用其实部与虚部表示。天线 $i$ 的节点特征构造为

$$
\mathbf x_i=\left[\mathrm{Re}(\tilde{\mathbf h}_i)^T,\ \mathrm{Im}(\tilde{\mathbf h}_i)^T,\ m_i,\ q_i\right]^T,\tag{9}
$$

其中 $q_i$ 表示本地天线索引。对未上传天线，$\mathbf x_i$ 中的瞬时 CSI 元素置零，而掩码元素 $m_i=0$ 显式告知 GNN 相应 CSI 缺失。

堆叠全部节点特征得到图输入矩阵

$$
\mathbf X(\mathcal S)=[\mathbf x_1,\mathbf x_2,\ldots,\mathbf x_N]\in\mathbb R^{F\times N},\tag{10}
$$

其中 $F$ 为节点特征维数。重建任务是从已观测节点信号 $\{\mathbf h_i:i\in\mathcal S\}$、上传掩码与天线图推断缺失节点信号 $\{\mathbf h_i:i\notin\mathcal S\}$。

**2）长期相关性引导的图构造**：图邻接矩阵应反映天线节点间的长期统计依赖。直接的选择是使用发射侧协方差矩阵 $\mathbf R_t$；然而原始协方差系数 $[\mathbf R_t]_{i,j}$ 同时包含空间相关与大尺度衰落效应，直接用 $|[\mathbf R_t]_{i,j}|$ 作为边权重可能使图偏向高功率天线，而非真正更相关的天线。

为避免该问题，先把协方差归一化为相关系数：

$$
c_{i,j}=\frac{|[\mathbf R_t]_{i,j}|}{\sqrt{[\mathbf R_t]_{i,i}[\mathbf R_t]_{j,j}}}.\tag{11}
$$

在分布式部署中，同一 TRP 内的天线通常比属于不同 TRP 的天线表现出更强的有用相关性。因此，我们不用全连接全局图，而采用 **TRP 内局部图**以抑制无关的跨 TRP 消息传播。设 $\mathcal A_m$ 表示属于第 $m$ 个 TRP 的全局天线索引集，邻接矩阵构造为

$$
[\mathbf A]_{i,j}=\begin{cases}c_{i,j},&i,j\in\mathcal A_m,\ \exists m,\ i\neq j,\\ 0,&\text{否则}.\end{cases}\tag{12}
$$

随后加入自环以保留各节点自身信息，并施加对称归一化：

$$
\tilde{\mathbf A}=\mathbf D^{-\frac{1}{2}}(\mathbf A+\mathbf I)\mathbf D^{-\frac{1}{2}},\tag{13}
$$

其中 $\mathbf D$ 为 $\mathbf A+\mathbf I$ 的度矩阵。归一化邻接矩阵 $\tilde{\mathbf A}$ 用于图消息传递。

**3）掩码条件 GNN 架构**：所提重建器是部署在 CU 处的掩码条件 GNN，其输入为图特征矩阵 $\mathbf X(\mathcal S)$ 与归一化邻接矩阵 $\tilde{\mathbf A}$，输出为重建的全局 CSI 矩阵 $\hat{\mathbf H}$。

首先把输入节点特征映射为隐藏表示：

$$
\mathbf Z^{(0)}=\phi_{\mathrm{in}}\left(\mathbf X(\mathcal S)\right),\tag{14}
$$

其中 $\phi_{\mathrm{in}}(\cdot)$ 表示可学习特征嵌入函数。随后用 $L$ 个图消息传递层在天线图上传播信息。第 $\ell$ 个消息传递层为

$$
\mathbf Z^{(\ell+1)}=\sigma\left(\mathbf W_s^{(\ell)}\mathbf Z^{(\ell)}+\mathbf W_n^{(\ell)}\mathbf Z^{(\ell)}\tilde{\mathbf A}\right),\qquad \ell=0,1,\ldots,L-1,\tag{15}
$$

其中 $\mathbf Z^{(\ell)}$ 为第 $\ell$ 层的节点表示，$\mathbf W_s^{(\ell)}$ 与 $\mathbf W_n^{(\ell)}$ 分别为自节点变换与邻居聚合的可学习权重，$\sigma(\cdot)$ 为非线性激活函数；项 $\mathbf Z^{(\ell)}\tilde{\mathbf A}$ 聚合来自统计相关天线节点的信息。

消息传递之后，输出映射函数预测全局 CSI 的实部与虚部：

$$
\hat{\mathbf Y}=\phi_{\mathrm{out}}\left(\mathbf Z^{(L)}\right),\tag{16}
$$

其中 $\hat{\mathbf Y}\in\mathbb R^{2N_r\times N}$ 含全部天线节点预测的实部与虚部 CSI 分量。与天线 $i$ 关联的重建复 CSI 为

$$
\hat{\mathbf h}_i=\hat{\mathbf y}_{i,R}+j\hat{\mathbf y}_{i,I},\qquad i=1,2,\ldots,N,\tag{17}
$$

其中 $\hat{\mathbf y}_{i,R}$ 与 $\hat{\mathbf y}_{i,I}$ 为与天线 $i$ 关联的预测实部与虚部分量。

为确保上传的 CSI 被精确保持，在 GNN 输出之后施加数据一致性约束：

$$
\hat{\mathbf H}(:,i)=\begin{cases}\mathbf H(:,i),&i\in\mathcal S,\\ \hat{\mathbf H}_{\mathrm{GNN}}(:,i),&i\notin\mathcal S,\end{cases}\tag{18}
$$

其中 $\hat{\mathbf H}_{\mathrm{GNN}}$ 表示 GNN 的原始输出。因此 GNN 只需推断未上传的天线 CSI，而实际上传的 CSI 保持不变。

**4）通用重建器训练**：我们先用随机生成的上传掩码训练通用掩码条件重建器。训练时，对每个小批量在前传预算 $|\mathcal S|=K$ 下采样天线子集 $\mathcal S$。为避免丢失整个 TRP 的瞬时 CSI，可按均衡方式生成随机掩码，使 $K\ge M$ 时每个 TRP 至少贡献一根上传天线。

对每个采样掩码，通过把未上传 CSI 元素置零并附加相应掩码指示构造输入特征矩阵 $\mathbf X(\mathcal S)$；GNN 随后重建完整全局 CSI。通用重建损失在缺失天线列上计算：

$$
\mathcal L_{\mathrm{rec}}(\theta)=\mathbb E_{\mathbf H,\mathcal S}\left[\frac{\left\|\hat{\mathbf H}(:,\mathcal S^c)-\mathbf H(:,\mathcal S^c)\right\|_F^2}{\left\|\mathbf H(:,\mathcal S^c)\right\|_F^2+\epsilon}\right],\tag{19}
$$

其中 $\epsilon$ 为用于数值稳定的小正数。训练好的通用重建器随后作为任务驱动天线选择的稳定评估器。

### B. 任务驱动天线选择与选择专属微调

记 $\theta_0$ 为训练好的通用重建器参数。对候选天线集 $\mathcal S$，验证重建损失写为

$$
\mathcal L_{\mathrm{val}}(\mathcal S;\theta_0)=\frac{1}{|\mathcal D_{\mathrm{val}}|}\sum_{\mathbf H\in\mathcal D_{\mathrm{val}}}\frac{\left\|\hat{\mathbf H}_{\theta_0}(:,\mathcal S^c)-\mathbf H(:,\mathcal S^c)\right\|_F^2}{\left\|\mathbf H(:,\mathcal S^c)\right\|_F^2+\epsilon},\tag{20}
$$

其中 $\mathcal D_{\mathrm{val}}$ 表示验证集，$\hat{\mathbf H}_{\theta_0}$ 表示通用重建器在候选上传集 $\mathcal S$ 下得到的重建。

任务驱动天线选择问题表述为

$$
\mathcal S^\star=\arg\min_{\mathcal S}\ \mathcal L_{\mathrm{val}}(\mathcal S;\theta_0),\tag{21}
$$

约束为 $|\mathcal S|=K$。为避免丢失整个 TRP 的瞬时 CSI，进一步施加 TRP 覆盖约束：

$$
|\mathcal S\cap\mathcal A_m|\ge1,\qquad m=1,2,\ldots,M.\tag{22}
$$

（21）的精确解需要对所有可能天线子集做组合搜索，当 $N$ 较大时一般不实际。因此采用高效的 **TRP 播种贪心策略**：先从每个 TRP 选出一根代表性天线以满足 TRP 覆盖约束，再把剩余上传预算通过迭代加入使验证损失下降最大的天线来分配。具体地，若 $\mathcal S^{(t)}$ 表示第 $t$ 次迭代的已选集合，则下一根天线选为

$$
i^\star=\arg\min_{i\notin\mathcal S^{(t)}}\mathcal L_{\mathrm{val}}\left(\mathcal S^{(t)}\cup i;\theta_0\right).\tag{23}
$$

已选集合更新为

$$
\mathcal S^{(t+1)}=\mathcal S^{(t)}\cup i^\star.\tag{24}
$$

该过程持续到 $|\mathcal S^{(t)}|=K$，所得集合作为最终上传天线集 $\mathcal S^\star$。

获得 $\mathcal S^\star$ 后，用该固定天线掩码微调通用重建器，得到选择专属重建器

$$
\theta_{\mathcal S^\star}=\mathrm{FineTune}\left(\theta_0,\mathcal S^\star\right).\tag{25}
$$

最终重建的全局 CSI 为

$$
\hat{\mathbf H}=f_{\theta_{\mathcal S^\star}}\left(\mathbf X(\mathcal S^\star),\tilde{\mathbf A}\right).\tag{26}
$$

## IV. 实验结果与分析

本节通过仿真评估所提框架。考虑 $M=4$ 个 TRP、每个 $N_t=16$ 根天线、$N_r=2$ 根接收天线，除非另有说明上传 $K=4$ 个天线 CSI 向量。共 5000 个信道样本按 $0.8:0.1:0.1$ 划分为训练、验证与测试集。GNN 隐藏维数为 128、含 $L=2$ 个消息传递层，训练 80 个 epoch、微调 30 个 epoch。采用归一化均方误差（NMSE）与累积分布函数（CDF）作为性能指标，蒙特卡洛评估使用 1000 个独立样本（脚注 1）。

> **脚注 1**：GNN 隐藏维数为 128，网络含 $L=2$ 个图消息传递层后接逐节点输出头。通用 GNN 训练 80 个 epoch，小批量大小 128、评估批量大小 256；采用 Adam，初始学习率 $10^{-4}$、衰减因子 0.9 与 0.999、梯度裁剪阈值 0.5；60 个 epoch 后学习率减半。任务驱动选择使用 128 个验证样本；选择专属微调进行 30 个 epoch、学习率 $2\times10^{-5}$。卷积神经网络（CNN）基线使用相同的数据划分、选择与微调流程，只是用普通 CNN 替换 GNN。

对比方案总结如下：**Random-GNN** 使用随机上传的天线 CSI 与通用 GNN 重建器；**Random-GNN-FT** 进一步在固定随机掩码下微调重建器；**Selected-GNN** 使用由通用重建器选出的任务驱动天线子集；**Selected-GNN-FT** 进一步执行选择专属微调，即完整的所提方法；**Selected-CNN-FT** 采用相同流程但用普通 CNN 替换 GNN。为比较通信速率，所有方案都用奇异值分解（SVD）与注水功率分配从重建的全局 CSI 设计发射预编码，并在真实瞬时信道上评估可达和速率。

图 3 给出 $K=4$、信噪比（SNR）$=20$ dB 时 CSI 重建 NMSE 的经验 CDF。任务驱动选择方案相比随机上传取得更好的 NMSE 分布，表明所选天线子集对全局 CSI 恢复至关重要——通用重建器作为评估器，选出对恢复完整信道更有信息量的天线。Selected-GNN-FT 相比 Selected-GNN 进一步提升，因为固定掩码微调阶段使模型适配最终部署图样。Random-GNN-FT 相比 Random-GNN 也有提升，但仍劣于任务驱动选择。CNN 基线劣于 GNN 方案，印证图消息传递在利用天线级空间相关性方面的优势。

图 4 给出 $K=4$、SNR $=20$ dB 时的可达速率 CDF。完美全局 CSI 提供上界；仅统计 CSI 表现较差，因为它忽略瞬时 CSI；而本地逐 TRP CSI 也较差，因为独立 TRP 预编码无法充分利用分布式空间自由度。Selected-GNN 与 Selected-GNN-FT 优于随机上传，与 NMSE 结果一致。在所有前传受限方案中，Selected-GNN-FT 取得最佳和速率分布、最接近完美 CSI 上界，表明所提三阶段设计同时改善了 CSI 恢复与传输性能。

图 5 评估 LS 估计误差的影响。对 LS 估计，记导频长度为 $T$。全 $N$ 维 LS 基线在相同导频长度下估计全部 $N$ 个天线 CSI 向量，而部分 LS 上传只估计被选天线。当导频资源有限时，部分 LS 上传给出更可靠的观测，因为它求解的是更低维的估计问题。随着导频 SNR 增加，带 GNN 重建的部分 LS 上传的 NMSE 下降并逼近完美选择 CSI 参考；该增益在导频更短时更明显，表明所提方法同时降低前传负载与 CSI 获取负担。

图 6 给出 NMSE 随上传预算 $K$ 的变化。NMSE 随 $K$ 增大而下降，因为 CU 处可用的瞬时 CSI 观测更多。在相同 $K$ 下，Selected-GNN 一致优于 Random-GNN，说明任务驱动选择在相同前传开销下提供了更有信息量的观测。

**图 3**：CSI 重建 NMSE 的 CDF（$K=4$、SNR $=20$ dB；比较 Random-GNN、Random-GNN-FT、Selected-GNN、Selected-GNN-FT、Selected-CNN-FT）。
**图 4**：可达和速率的 CDF（$K=4$、SNR $=20$ dB；含完美全局 CSI、仅本地 CSI、仅统计 CSI 与各方案）。
**图 5**：LS 信道估计 NMSE 随 SNR 的变化（部分 LS 上传 + GNN 重建 vs 完美选择 CSI 参考）。
**图 6**：重建 NMSE 随上传预算 $K$ 的变化（Random-GNN、Selected-GNN、Selected-GNN-FT）。

## V. 结论

本文为 DMIMO 系统提出一种前传高效的全局 CSI 获取框架。通过结合通用掩码条件 GNN 重建、任务驱动天线选择与选择专属微调，所提方法在无需在 TRP 部署神经编码器的情况下，从有限上传的天线 CSI 重建全局 CSI。仿真结果验证了其在 CSI 重建精度、导频效率以及对不同前传预算的适应性方面的优势。

## 图注与表注

**图 1**：DMIMO 系统示意（CU 通过前传链路连接 TRP 1—M，仅上传部分天线的 CSI）。
**图 2**：基于 GNN 的 CSI 重建示意（输入嵌入、掩码条件 GNN 消息传递层、输出映射与数据一致性）。
**图 3**：CSI 重建 NMSE 的经验 CDF（$K=4$，SNR $=20$ dB）。
**图 4**：可达和速率的经验 CDF（$K=4$，SNR $=20$ dB）。
**图 5**：LS 信道估计 NMSE 随 SNR 的变化。
**图 6**：重建 NMSE 随上传预算 $K$ 的变化。

**表注**：本文原**无表格**（仅含图 1—6），故无逐格表格转录项；实验超参数见第 IV 节正文与脚注 1。

## 参考文献

> 以下按原文编号 [1]—[12] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “ﬀ”“ﬀi” 等连字伪影已按常规写法整理，书目内容未改动。

[1] H. Q. Ngo, A. Ashikhmin, H. Yang, E. G. Larsson, and T. L. Marzetta, “Cell-free massive MIMO versus small cells,” IEEE Trans. Wireless Commun., vol. 16, no. 3, pp. 1834–1850, Mar. 2017.

[2] E. Björnson and L. Sanguinetti, “Making cell-free massive MIMO competitive with MMSE processing and centralized implementation,” IEEE Trans. Wireless Commun., vol. 19, no. 1, pp. 77–90, Jan. 2020.

[3] E. Nayebi, A. Ashikhmin, T. L. Marzetta, H. Yang, and B. D. Rao, “Precoding and power optimization in cell-free massive MIMO systems,” IEEE Trans. Wireless Commun., vol. 16, no. 7, pp. 4445–4459, Jul. 2017.

[4] H. Zhang, R. Su, Y. Zhu, K. Long, and G. K. Karagiannidis, “User-centric cell-free massive MIMO system for indoor industrial networks,” IEEE Transactions on Communications, vol. 70, no. 11, pp. 7644–7655, 2022.

[5] E. Björnson and L. Sanguinetti, “Scalable cell-free massive MIMO systems,” IEEE Trans. Commun., vol. 68, no. 7, pp. 4247–4261, Jul. 2020.

[6] G. Interdonato, M. Karlsson, E. Björnson, and E. G. Larsson, “Local partial zero-forcing precoding for cell-free massive MIMO,” IEEE Trans. Wireless Commun., vol. 19, no. 7, pp. 4758–4774, Jul. 2020.

[7] A. Abdallah and M. M. Mansour, “Efficient angle-domain processing for FDD-based cell-free massive MIMO systems,” IEEE Trans. Commun., vol. 68, no. 4, pp. 2188–2203, Apr. 2020.

[8] C.-K. Wen, W.-T. Shih, and S. Jin, “Deep learning for massive MIMO CSI feedback,” IEEE Wireless Commun. Lett., vol. 7, no. 5, pp. 748–751, Oct. 2018.

[9] S. Ji and M. Li, “CLNet: Complex input lightweight neural network designed for massive MIMO CSI feedback,” IEEE Wireless Commun. Lett., vol. 10, no. 10, pp. 2318–2322, Oct. 2021.

[10] L. Wang, C. Chen, J. Zhang, and C. Fischione, “Learning-based joint antenna selection and precoding design for cell-free MIMO networks,” IEEE Trans. Veh. Technol., vol. 75, no. 1, pp. 579–592, Jan. 2026.

[11] J. Choi and D. J. Love, “Bounds on eigenvalues of a spatial correlation matrix,” IEEE Commun. Lett., vol. 18, no. 8, pp. 1391–1394, 2014.

[12] M. Dai, T. Gong, and S. Zhang, “Graph convolutional network-based channel extrapolation for hybrid RIS-aided communication,” IEEE Wireless Commun. Lett., vol. 13, no. 12, pp. 3558–3562, Dec. 2024.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含研究缺口与本文思路）；第 II 节系统模型与问题表述（A 前传受限 DMIMO 架构；B 长期空间信道模型；C 部分 CSI 上传与全局 CSI 重建，注 1；式（1）—（6），图 1）；第 III 节所提 GNN 重建框架（A 基于 GNN 的全局 CSI 重建：1）天线级图表示，式（7）—（10）；2）长期相关性引导的图构造，式（11）—（13）；3）掩码条件 GNN 架构，式（14）—（18）；4）通用重建器训练，式（19）；B 任务驱动天线选择与选择专属微调，式（20）—（26）；图 2）；第 IV 节实验结果与分析（图 3—6，脚注 1）；第 V 节结论；图 1—6 图注与表注；参考文献 [1]—[12] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—6 图像本体未复制（站点不上传图片），仅中文图注与正文数值/趋势；③**原文无表格**，故无表格逐格转录项（已在表注中说明）；④作者简介与版权声明不在正文范围，未收录；⑤原文式（7）中集合记号 $V=1,2,\ldots,N$、式（9）中 $\{0,1\}$ 的排版丢花括号，译文按数学含义补全记号，未改内容。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
