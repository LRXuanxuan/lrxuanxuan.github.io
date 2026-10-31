---
layout: page
title: "FedPGT：车载联邦学习的渐进梯度传输｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-18089-fedpgt-progressive-gradient-transmission-for-vehicular-federated-learn/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/55165e9384241c56/) · [原文 arXiv](https://arxiv.org/abs/2609.18089) · [全部目录](/papers/catalog/)

# FedPGT：车载联邦学习的渐进梯度传输

**原题：** FedPGT: Progressive Gradient Transmission for Vehicular Federated Learning over Time-Varying Channels  
**作者：** Jintao Yan、Tan Chen、Yuxuan Sun、Sheng Zhou（通讯作者）、Zhisheng Niu  
**版本：** arXiv:2609.18089v1（cs.LG），2026-09-16，原文 17 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节（含 III-A–D、IV-A–B、V-A–E、VI-A–H 全部小节）、结论、附录 A–E、表 I 逐格、图 1–17 图注、算法 1–3 逐行、基金与作者单位说明、参考文献 [1]–[47]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

车载联邦学习（vehicular federated learning，VFL）为智能交通系统提供了保护隐私的协同模型训练，其中通信资源分配与梯度稀疏化技术已被用于降低通信开销。然而车辆移动性导致信道条件与传输容量快速变化，使预先确定的资源分配与稀疏化决策失效。本文提出 **FedPGT**——一种面向时变信道的 VFL 渐进梯度传输方案，车辆根据瞬时信道条件**渐进传输**大幅值梯度元素。我们建立收敛界，刻画所传输梯度元素数目的影响，并揭示由幂律衰减支配的**收益递减**行为；受此启发，我们把在线决策建模为随机优化问题，其主要挑战在于目标函数具有**累积耦合、不可分离**的结构。为应对该挑战，我们引入逐时隙代理传输变量，解耦跨时隙的长期依赖，并把原目标转化为可按时隙相加的优化问题，从而可采用 Lyapunov drift-plus-penalty 方法进行在线调度。我们进一步提出低复杂度资源分配算法以支持高效在线实现。实验结果表明，与最先进基线相比，所提方案在 CIFAR-10 图像分类任务上取得 3.65% 的准确率提升，在 Argoverse 轨迹预测任务上把平均位移误差（average displacement error，ADE）降低 12.66%，展示了其在高动态车载环境下对多种学习任务的适用性。

**索引词：** 联邦学习、移动性、车载网络、时变信道。

## I. 引言

车载网络的快速发展催生了协同感知、轨迹预测与智能路径规划等大量数据驱动应用 [1]。这些应用依赖需要持续自适应的机器学习（machine learning，ML）模型，以应对动态交通条件、不断变化的环境与多样驾驶行为。传统集中式学习框架需要把原始数据上传到中央服务器进行模型训练 [2]–[4]，这不仅带来过大的通信时延，还引发严重隐私问题，尤其当涉及敏感传感器数据时。

随着车载感知与计算能力不断增强，车辆已能够利用自身数据进行本地模型训练。这一趋势推动了联邦学习在车载网络中的采用：多辆车通过交换模型更新而非原始数据来协同训练全局模型。车载联邦学习（VFL）在保护数据隐私的同时实现及时的模型自适应，已成为大规模智能交通系统中有前景的范式 [5]、[6]。

在典型 VFL 流程中，每个参与车辆用其私有数据进行本地训练，并周期性地把模型更新（如梯度或参数差）上传到路侧单元（roadside unit，RSU）或聚合服务器；服务器聚合收到的更新，并把更新后的全局模型广播给车辆以进入下一训练轮。该过程重复直至收敛。

尽管具有优势，VFL 仍因车载网络的高度动态性而面临重大挑战 [7]、[8]。第一，车辆在 RSU 覆盖区域内仅停留有限的驻留时间，这限制了可用于模型传输的时间。第二，由于车辆移动，无线信道条件快速波动，导致时变上行容量与间歇性通信机会。因此，可靠、高效的模型传输成为 VFL 的主要瓶颈。

为缓解通信开销，许多现有工作采用模型压缩或梯度稀疏化技术，只保留最具信息量的分量以减少传输参数数目。在这些方法中，稀疏化程度（定义为每轮传输的梯度元素数）通常在模型上传开始时即固定 [9]、[10]。然而这种设计并不适合车载环境：由于信道快速变化与动态通信机会，一轮内可实现的梯度元素传输数高度不确定。此外，多数现有基于稀疏化的收敛分析假设参与设备集合固定 [11]，这在参与车辆集合逐轮变化的车载网络中并不成立。这些局限表明，传输梯度元素数应随车载网络中动态变化的通信机会自适应调整，而非在传输前预先确定。

本文提出 FedPGT——一种适应时变通信条件与动态车辆参与的 VFL 渐进梯度传输方案。我们不在传输前预定义稀疏化程度，而让车辆根据瞬时通信条件渐进传输大幅值梯度元素。主要贡献如下：

- 我们建立收敛分析，刻画所传输梯度元素数目与 VFL 收敛性能之间的关系，表明增加传输梯度元素数可改善收敛性能，但收益递增呈幂律衰减式的递减。该结果表明，只传输少量大幅值梯度元素即可保留大部分收敛增益，这为通信机会受限时的渐进梯度传输提供了动机。
- 我们提出面向 VFL 的渐进梯度传输方案。我们把问题表述为随机优化问题，其主要挑战在于累积耦合、不可分离的目标。为应对该挑战，我们引入逐时隙代理传输变量以解耦跨时隙的长期依赖，并构造上界重构，把原问题转化为可加分离的逐时隙优化问题。基于该变换，我们发展 Lyapunov drift-plus-penalty 方法，在不需要未来信道信息的情况下进行在线调度与传输决策。
- 我们基于效用最优性条件推导在线资源分配问题的结构性质。特别地，我们证明尽管做了松弛，**专用资源块**（resource block，RB）分配仍然最优，并得到解析的功率分配表达式。基于这些结果，我们提出低复杂度在线资源分配算法，可在动态车载环境中高效实现。
- 实验结果表明，与最先进基准相比，所提方案在 CIFAR-10 图像分类任务上把测试准确率提升 3.65%，在 Argoverse 轨迹预测任务上把平均位移误差（ADE）降低 12.66%，展示了 FedPGT 在多种学习任务上的有效性与适用性。

全文其余部分组织如下：第 II 节综述相关工作；第 III 节描述系统模型；第 IV 节发展收敛分析并表述优化问题；第 V 节介绍所提渐进梯度传输方案；第 VI 节给出实验评估；第 VII 节总结。

## II. 相关工作

### A. 车载网络中的联邦学习

由于学习性能与通信约束紧密耦合，无线网络上的联邦学习受到广泛关注。综述性文献 [2]–[4] 总结了无线系统中联邦学习的最新进展，强调了有限带宽 [12]、[13]、衰落信道 [14]–[16] 与设备异构性 [17] 等带来的挑战。

受智能交通应用驱动，联邦学习已被扩展到车载网络，其中高移动性与间歇连通性带来额外挑战。[18]–[21] 的作者研究了车辆边缘 FL 中的车辆选择与资源优化，考虑车辆有限驻留时间。为增强动态环境下的参与度与鲁棒性，已有工作提出激励机制以促进车辆在联邦学习中的协作 [22]、[23]。[24] 发展移动性感知的去中心化联邦学习框架，显式建模车辆移动性与车载网络中的多任务学习动态；半异步联邦学习方案也被提出以改善对移动性引起的通信动态的鲁棒性 [25]。此外，分割联邦学习与语义通信增强框架被用于提升资源受限车载网络中的通信效率 [26]、[27]。这些工作展示了 FL 在车载系统中的潜力，但通常在**训练轮**层面运行。

更近期，研究者开始研究车载 FL 系统中的**时隙级**通信与资源优化。[7] 考虑高度移动车辆下的资源受限车辆边缘 FL，并分析移动性对学习性能的影响；[8] 为车车通信增强的 FL 设计动态调度方案，使资源分配适应时变信道。这些工作显式考虑时隙级通信动态与在线资源分配；然而模型更新传输的结构仍在传输前预先确定。它们未显式建模快速变化通信条件下每轮内主导梯度元素的渐进传输，而这正是本文处理的关键问题。

### B. 联邦学习中的压缩与稀疏化

通信高效学习已通过梯度与模型压缩技术得到广泛研究，其中稀疏化只传输梯度元素的一个子集以降低通信开销。早期理论工作通常假设每轮传输固定数目的梯度元素，如 top-$k$ 或 random-$k$ 稀疏化。代表性例子是 [28]，它在标准假设下为 $k$-稀疏化 SGD 建立收敛保证；Qsparse-local-SGD [29] 进一步把稀疏化与量化、本地更新结合，为凸与非凸目标提供收敛结果。更近期的工作研究自适应压缩机制，根据训练动态或数据异构性在训练轮之间调整传输梯度元素数；例如 [30] 把联邦学习中的自适应梯度稀疏化建模为在线决策问题，以平衡通信与计算；融合稀疏化与量化或编码的混合压缩方案也被用于提升效率 [11]。然而这些方法大多在每轮训练开始时确定稀疏化程度，并假设轮内通信预算固定。

除纯压缩设计外，若干研究联合优化稀疏化与通信调度。[9] 为移动边缘 FL 提出灵活的压缩控制机制，在能量约束下平衡本地计算与无线传输；[10] 研究有限通信资源下的梯度稀疏化与设备调度联合优化；[31] 进一步在隐私约束下把稀疏化与无线资源分配结合。然而多数现有联合设计假设稀疏化结构或程度**先验地**按轮决定（或只在轮边界变化），且通常不建模快速信道波动下主导梯度元素的**轮内渐进传输**——而这正是本文所考虑车载网络的关键特征。

## III. 系统模型

### A. VFL 模型

我们研究如图 1 所示的 VFL 系统：RSU 在其覆盖范围内协调车辆进行 $R$ 轮协同模型训练。在第 $r$ 个训练轮中，参与模型训练的车辆集合记为 $\mathcal N^{(r)}=\{1,2,\ldots,N^{(r)}\}$。每辆车 $n\in\mathcal N^{(r)}$ 持有从其数据分布 $\mathcal X_n$（定义在输入空间 $\mathcal D_n$ 上）抽取的本地数据集。对给定样本 $d\in\mathcal D_n$，损失函数 $f(\mathbf w,d)$ 度量模型 $\mathbf w$ 对数据的拟合程度。相应地，车辆 $n$ 的本地损失函数定义为其数据分布上的期望损失：

$$
F_n(\mathbf w)\triangleq\mathbb E_{d\sim\mathcal X_n}\left[f(\mathbf w,d)\right].
$$

与传统 FL 中静态客户端集合不同，VFL 的参与车辆因移动性而随时间变化。我们假设每轮参与车辆从底层分布 $\mathcal P$ 中抽样，因此全局损失函数定义为

$$
F(\mathbf w)\triangleq\mathbb E_{n\sim\mathcal P}\left[F_n(\mathbf w)\right]. \tag{1}
$$

目标是通过优化模型参数 $\mathbf w$，在 $R$ 个通信轮内最小化全局损失函数。通信轮索引集记为 $\mathcal R=\{1,2,\ldots,R\}$。每轮的 VFL 训练程序包含三个关键阶段：本地更新、梯度上传与模型聚合。

**1）本地更新。** 在第 $r$ 轮开始时，RSU 把当前全局模型 $\mathbf w^{(r-1)}$ 广播给覆盖范围内所有车辆。收到后，每辆车 $n\in\mathcal N^{(r)}$ 基于随机梯度下降（stochastic gradient descent，SGD）计算其随机梯度：

$$
\mathbf g_n^{(r)}=\frac{1}{\left|\mathcal B_n^{(r)}\right|}\sum_{d\in\mathcal B_n^{(r)}}\nabla f\left(\mathbf w^{(r-1)},d\right), \tag{2}
$$

其中 $\mathcal B_n^{(r)}\subseteq\mathcal D_n$ 为从 $\mathcal D_n$ 抽取的小批量。

**2）梯度上传。** 本地训练后，车辆按所提传输策略把主导梯度元素渐进传输给 RSU。令 $\Psi_n^{(r)}(\cdot)$ 表示车辆 $n$ 在第 $r$ 轮得到的梯度传输算子。支撑该阶段的通信机制见第 III-C 节，$\Psi_n^{(r)}(\cdot)$ 的详细定义见第 III-D 节。

**3）模型聚合。** 收到上传梯度后，RSU 聚合它们以更新全局模型：

$$
\mathbf w^{(r)}=\mathbf w^{(r-1)}-\frac{\eta}{N^{(r)}}\sum_{n\in\mathcal N^{(r)}}\Psi_n^{(r)}\left(\mathbf g_n^{(r)}\right), \tag{3}
$$

并进入下一训练轮。

### B. 计算模型

我们采用标准的本地模型更新计算模型 [32]、[33]。令 $N_{\mathrm{flop}}$ 表示处理一个训练样本所需的浮点运算（FLOPs）数；对第 $r$ 轮的车辆 $n$，CPU 时钟频率记为 $l_n^{(r)}$（周期/秒）。相应地，本地训练的计算时延为

$$
\rho_n^{(r)}=\frac{N_{\mathrm{flop}}\left|\mathcal B_n^{(r)}\right|}{l_n^{(r)}},
$$

相应计算能耗为

$$
\xi_n^{(r)}=\theta\left(l_n^{(r)}\right)^2N_{\mathrm{flop}}\left|\mathcal B_n^{(r)}\right|,
$$

其中 $\theta$ 表示由处理器芯片架构决定的有效开关电容系数。

### C. 通信模型

我们考虑基于 OFDMA、在离散时隙上运行的车载网络。对第 $r$ 轮，时隙集合定义为 $\mathcal T^{(r)}=\{1,2,\ldots,T\}$，其中 $T$ 表示每轮时隙数，$\tau$ 表示每个时隙的时长。对下行模型分发，RSU 用整个带宽并以足够高的发射功率把全局模型广播给所有车辆，因此沿用 [7]、[8] 的做法忽略下行通信时延。对上行梯度传输，我们考虑单输入多输出（single-input-multiple-output，SIMO）系统：每辆车配备单天线，RSU 配备 $M$ 根天线。上行带宽被等分为 $Z$ 个正交资源块（RB），每个带宽为 $\beta$。每个时隙中，RSU 把 RB 分给车辆，车辆用所分配 RB 上传梯度。我们用 $s_{n,z}(t)$ 表示 RB 分配指示变量：若时隙 $t$ 中 RB $z$ 分配给车辆 $n$，则 $s_{n,z}(t)=1$。由于一个 RB 只能分配给一辆车，$s_{n,z}(t)$ 满足

$$
\sum_{n\in\mathcal N^{(r)}}s_{n,z}(t)\le1,\qquad\forall z\in\mathcal Z,\ \forall t\in\mathcal T^{(r)}, \tag{4}
$$

$$
s_{n,z}(t)\in\{0,1\},\qquad\forall n\in\mathcal N^{(r)},\ \forall z\in\mathcal Z,\ \forall t\in\mathcal T^{(r)}. \tag{5}
$$

记 RB $z$ 上分配的发射功率为 $p_{n,z}(t)$，其受约束于

$$
0\le\sum_{z\in\mathcal Z}p_{n,z}(t)\le p_n^{\max},\qquad\forall n\in\mathcal N^{(r)},\ \forall t\in\mathcal T^{(r)}. \tag{6}
$$

记车辆 $n$ 在时隙 $t$ 的发射信号为 $x_n(t)$，则 RSU 在 RB $z$ 上的接收信号为

$$
y_{n,z}(t)=s_{n,z}(t)\sqrt{p_{n,z}(t)}\mathbf u_{n,z}(t)^H\mathbf h_{n,z}(t)x_n(t)+n_0,
$$

其中 $\mathbf u_{n,z}(t)\in\mathbb C^{M\times1}$ 为接收波束成形向量，$n_0\sim\mathcal{CN}(0,N_0)$ 表示加性白高斯噪声。信道向量 $\mathbf h_{n,z}(t)\in\mathbb C^{M\times1}$ 建模为

$$
\mathbf h_{n,z}(t)=\sqrt{\psi_n(t)\varrho_n(t)}\,\hat{\mathbf h}_{n,z}(t),
$$

其中 $\sqrt{\psi_n(t)}$ 表示大尺度路径损耗，$\varrho_n(t)$ 表示阴影衰落系数，$\hat{\mathbf h}_{n,z}(t)$ 表示小尺度衰落向量。

RSU 采用最大比合并接收波束成形，即 $\mathbf u_{n,z}(t)=\mathbf h_{n,z}(t)/\|\mathbf h_{n,z}(t)\|$。于是时隙 $t$ 中 RSU 从车辆 $n$ 经 RB $z$ 收到的信噪比（SNR）为

$$
\Gamma_{n,z}(t)=\frac{p_{n,z}(t)\left\|\mathbf h_{n,z}(t)\right\|^2}{\beta N_0},
$$

基于上述模型，车辆 $n$ 在时隙 $t$ 的上行传输速率为

$$
A_n(t)=\sum_{z\in\mathcal Z}s_{n,z}(t)\beta\log_2\left(1+\Gamma_{n,z}(t)\right), \tag{7}
$$

相应传输能耗为

$$
e_n(t)=\sum_{z\in\mathcal Z}\tau s_{n,z}(t)p_{n,z}(t). \tag{8}
$$

### D. 渐进梯度传输

基于上述通信模型，车辆在时隙 $t\in\mathcal T^{(r)}$ 上根据可用通信机会渐进上传主导梯度元素。每个被传输梯度元素的通信开销包括 $\lceil\log_2I\rceil$ 比特的索引与 $b$ 比特的数值，其中 $I$ 表示梯度维数，$b=32$ 对应单精度浮点表示。车辆 $n$ 在时隙 $t$ 可上传的新梯度元素数是整数值，且被上界约束为

$$
\kappa_n(t)=\min\left\{\left\lfloor\frac{\tau A_n(t)}{b+\lceil\log_2I\rceil}\right\rfloor,\ I-\sum_{t'=1}^{t-1}\kappa_n(t')\right\}, \tag{9}
$$

其中 $\tau$ 表示时隙时长，$A_n(t)$ 表示时隙 $t$ 的可达上行速率。相应地，第 $r$ 轮上传的梯度元素总数为 $k_n^{(r)}=\sum_{t\in\mathcal T^{(r)}}\kappa_n(t)$。为便于分析，第 V-B 与 V-C 节的资源优化使用连续松弛

$$
\bar\kappa_n(t)=\frac{\tau A_n(t)}{b+\lceil\log_2I\rceil}. \tag{10}
$$

为避免向已上传全部梯度元素的车辆继续分配 RB 或功率，我们施加

$$
s_{n,z}(t)=0,\quad p_{n,z}(t)=0,\qquad\forall n\in\mathcal N^{(r)},\ \forall z\in\mathcal Z,\ \forall t\in\mathcal T^{(r)},\quad\sum_{t'=1}^{t-1}\kappa_n(t')\ge I. \tag{11}
$$

在得到 RB 与功率分配决策后，实际传输元素数由 (9) 中的整数取整与上限规则计算。连续松弛连同 (11) 并不与 (9) 完全等价；但由于模型维数 $I$ 通常很大，所得近似误差可忽略。

于是梯度传输算子 $\Psi_n^{(r)}(\mathbf g_n^{(r)})$ 正式定义为

$$
\left[\Psi_n^{(r)}\left(\mathbf g_n^{(r)}\right)\right]_i=\begin{cases}\left[\mathbf g_n^{(r)}\right]_i,&i\in\mathcal K_n^{(r)},\\0,&\text{其他},\end{cases}\tag{12}
$$

其中 $\mathcal K_n^{(r)}$ 表示 $\mathbf g_n^{(r)}$ 中幅值最大的 $k_n^{(r)}$ 个元素的索引集合。

## IV. 问题建模

### A. 收敛分析

VFL 的目标是最小化全局损失函数 (1)。然而传输梯度元素数对全局损失的影响是隐式的，因此我们推导收敛界以刻画梯度传输与学习性能的关系。首先引入**可压缩梯度**的定义 [34]–[38]。

**定义 1（可压缩梯度）。** 若向量 $\mathbf g\in\mathbb R^I$ 的各元素幅值按降序排列后服从幂律衰减，则称其**可压缩**。令 $g_i$ 表示 $\mathbf g$ 中第 $i$ 大幅值元素，则 $\mathbf g$ 可压缩，若存在常数 $C>0$ 与 $\alpha>\frac{1}{2}$ 使

$$
\lvert g_i\rvert\le Ci^{-\alpha},\qquad\forall i\in\{1,2,\ldots,I\}, \tag{13}
$$

其中可压缩指数 $\alpha$ 刻画排序元素的衰减速率，$\alpha$ 越大表示可压缩性越强；尺度系数 $C$ 刻画向量的整体幅值。

已有工作表明深度学习中的随机梯度通常是可压缩的 [34]–[36]。据此我们作如下假设 [8]、[14]–[16]、[39]、[40]。

**假设 1：** 车辆 $n$ 在第 $r$ 轮产生的随机梯度 $\mathbf g_n^{(r)}\in\mathbb R^I$ 可压缩，即存在参数 $C_n^{(r)}>0$ 与 $\alpha_n^{(r)}>\frac{1}{2}$ 使

$$
\left|g_{n,i}^{(r)}\right|\le C_n^{(r)}i^{-\alpha_n^{(r)}},\qquad\forall i\in\{1,2,\ldots,I\},
$$

其中 $C_n^{(r)}$ 与 $\alpha_n^{(r)}$ 可在每轮后由本地把排序梯度幅值拟合到幂律模型估计。

**假设 2：** 随机梯度方差有界，即 $\mathbb E\left\|\mathbf g_n^{(r)}-\nabla F_n(\mathbf w^{(r-1)})\right\|^2\le\sigma^2$，期望取在 SGD 随机性上。

**假设 3：** 由车辆抽样引起的数据异构性有界，即 $\mathbb E_{n\sim\mathcal P}\left\|\nabla F_n(\mathbf w)-\nabla F(\mathbf w)\right\|^2\le\delta^2$ 对任意模型参数 $\mathbf w$ 成立。

**假设 4：** 本地损失函数 $F_n(\cdot)$ 为 $L$-光滑，即

$$
F_n(\mathbf w')\le F_n(\mathbf w)+\left\langle\nabla F_n(\mathbf w),\mathbf w'-\mathbf w\right\rangle+\frac{L}{2}\left\|\mathbf w'-\mathbf w\right\|^2.
$$

对给定梯度 $\mathbf g_n^{(r)}\in\mathbb R^I$，梯度近似误差定义为 $\left\|\mathbf g_n^{(r)}-\Psi_n^{(r)}(\mathbf g_n^{(r)})\right\|^2$。下述引理在可压缩梯度假设下刻画该近似误差。

**引理 1（梯度近似误差界）。** $\mathbf g_n^{(r)}$ 的梯度近似误差上界为

$$
\left\|\mathbf g_n^{(r)}-\Psi_n^{(r)}\left(\mathbf g_n^{(r)}\right)\right\|^2\le\frac{2\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(k_n^{(r)}+1\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1}. \tag{14}
$$

**证明：** 见附录 A。□

引理 1 把仅传输部分梯度元素所造成的近似误差刻画为上传梯度元素数 $k_n^{(r)}$ 的函数。基于引理 1，我们导出收敛界。

**定理 1（收敛界）。** 经过 $R$ 轮训练后，全局损失函数的期望平方梯度范数上界为

$$
\frac{1}{R}\sum_{r=0}^{R-1}\mathbb E\left\|\nabla F\left(\mathbf w^{(r)}\right)\right\|^2\le\frac{2\left(F\left(\mathbf w^{(0)}\right)-\mathbb E\left[F\left(\mathbf w^{(R)}\right)\right]\right)}{\eta R}
+\frac{1}{R}\sum_{r=1}^{R}\frac{2\left(\sigma^2+\delta^2\right)}{N^{(r)}}
+\frac{1}{R}\sum_{r=1}^{R}\sum_{n\in\mathcal N^{(r)}}\frac{4\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(k_n^{(r)}+1\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{N^{(r)}\left(2\alpha_n^{(r)}-1\right)}. \tag{15}
$$

**证明：** 见附录 B。□

**注 1。** 定理 1 表明收敛性能随上传梯度元素数 $k_n^{(r)}$ 增大而改善，但改善呈**边际收益递减**：由于幂律项 $(k_n^{(r)}+1)^{-(2\alpha_n^{(r)}-1)}$，每多传输一个元素对梯度近似误差的降低逐渐变小，因而对收敛性能的改善也递减。因此传输少量主导梯度元素即可捕获大部分收益，而额外传输更多元素带来的进一步改善有限。

### B. 问题建模

基于定理 1，我们最小化 (15) 中的收敛上界。由于其余参数为常数，这等价于每轮最小化

$$
\sum_{n\in\mathcal N^{(r)}}\frac{\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(k_n^{(r)}+1\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1}.
$$

所提方案通过优化通信资源分配来间接控制渐进梯度传输过程，优化问题表述为

$$
\mathrm{P}0:\quad\min_{\mathbf S^{(r)},\mathbf P^{(r)}}\sum_{n\in\mathcal N^{(r)}}\frac{\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}}{2\alpha_n^{(r)}-1}\left(\sum_{t\in\mathcal T^{(r)}}\kappa_n(t)+1\right)^{-\left(2\alpha_n^{(r)}-1\right)} \tag{16a}
$$

$$
\text{s.t.}\quad\sum_{t\in\mathcal T^{(r)}}e_n(t)+\xi_n^{(r)}\le E_n^{\mathrm{cons}},\qquad\forall n\in\mathcal N^{(r)}, \tag{16b}
$$

$$
s_{n,z}(t)=0,\quad p_{n,z}(t)=0,\qquad\forall n\in\mathcal N^{(r)},\ \forall z\in\mathcal Z,\ \forall t\in\mathcal T^{(r)},\ (t-1)\tau<\rho_n^{(r)}, \tag{16c}
$$

$$
\text{约束 (4)–(6) 与 (11)}.
$$

其中 $\mathbf S^{(r)}=[\mathbf s(1),\ldots,\mathbf s(T)]$ 表示 RB 分配策略，$\mathbf P^{(r)}=[\mathbf p(1),\ldots,\mathbf p(T)]$ 表示功率分配策略。约束 (16b) 确保每辆车总能耗不超过给定能量预算；(16c) 保证上行传输仅在本地训练完成后开始；(4)–(6) 规定可行的传输与功率分配区域。

## V. 渐进梯度传输方案

本节提出所提渐进梯度传输方案。我们首先用 Lyapunov drift-plus-penalty 方法把原随机优化问题转化为在线混合整数非线性规划（mixed-integer nonlinear programming，MINLP）问题；随后推导有助于设计联合 RB 与功率分配算法的关键结构性质；基于这些结果，所提算法执行效用驱动的 RB 分配与解析功率分配，实现高效在线执行。整体优化框架见图 2。

### A. 随机优化问题的变换

P0 是随机优化问题，求解的主要挑战在于未来信道状态与车辆可用性的不确定性：高车辆移动性导致通信条件快速变化与系统演化不可预测。此外，即使已知未来信道状态与车辆可用性，由于整数与耦合决策变量的存在，求解 P0 仍然困难。

Lyapunov 优化是处理未来信道状态与车辆可用性未知的随机优化问题的有效途径，可仅基于当前观测进行在线决策。然而标准 Lyapunov 框架针对的是**在时间上可加分离**的目标，如最小化长期平均代价或最大化时间平均效用；相反，P0 的目标是**累积耦合**的，依赖整个时间范围上逐时隙变量之和，无法直接应用 Lyapunov 方法。为此，我们构造一个上界代理重构，解耦跨时隙的长期依赖，把原累积耦合目标转化为可加分离的代理目标，从而支持基于 Lyapunov 的逐时隙优化。所得代理优化问题为

$$
\mathrm{P}1:\quad\min_{\mathbf S^{(r)},\mathbf P^{(r)},\boldsymbol\gamma^{(r)}}\sum_{t\in\mathcal T^{(r)}}\sum_{n\in\mathcal N^{(r)}}\frac{\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(\gamma_n(t)+\frac{1}{T}\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1} \tag{17a}
$$

$$
\text{s.t.}\quad 0\le\gamma_n(t)\le\frac{I}{T},\qquad\forall n\in\mathcal N^{(r)}, \tag{17b}
$$

$$
\sum_{t\in\mathcal T^{(r)}}\gamma_n(t)=\sum_{t\in\mathcal T^{(r)}}\kappa_n(t),\qquad\forall n\in\mathcal N^{(r)}, \tag{17c}
$$

$$
\text{约束 (4)–(6)、(11)、(16b)、(16c)}.
$$

在 P1 中，代理变量 $\gamma_n(t)$ 表示对累积传输梯度元素数的逐时隙贡献；P1 的目标是 P0 中原累积耦合目标的上界代理，而等式约束 (17c) 保证代理变量与实际传输梯度元素数之间的长期一致性。

为处理代理优化问题中的长期约束，我们引入两类虚拟队列。第一，对每辆车 $n\in\mathcal N^{(r)}$，长期能量约束 (16b) 通过如下**虚拟能量队列**施加：

$$
q_n(t+1)=\max\left[q_n(t)+e_n(t)-\frac{E_n^{\mathrm{cons}}-\xi_n^{(r)}}{T},\ 0\right]. \tag{18}
$$

队列积压 $q_n(t)$ 度量相对长期能量预算的累积能量赤字：积压越大表示车辆在先前时隙消耗了过多能量，从而对未来传输决策施加更强惩罚。

第二，为施加等式约束 (17c)，我们引入 **PGT 队列**：

$$
\zeta_n(t+1)=\zeta_n(t)+\kappa_n(t)-\gamma_n(t), \tag{19}
$$

其中队列积压 $\zeta_n(t)$ 度量实际传输梯度元素数与代理传输变量之间的累积差异。积压越大表示传输元素数超过代理分配，由于边际收敛增益递减而降低进一步传输的激励。稳定该队列可保证代理重构与原传输过程的长期一致性。

把 Lyapunov drift-plus-penalty 框架应用于代理优化问题 P1，得到如下逐时隙优化问题：

$$
\begin{aligned}
\mathrm{P}2:\quad\min_{\mathbf s(t),\mathbf p(t),\gamma(t)}\ &\sum_{n\in\mathcal N^{(r)}}\frac{V\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(\gamma_n(t)+\frac{1}{T}\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1}\\
&+\sum_{n\in\mathcal N^{(r)}}\left(q_n(t)e_n(t)+\zeta_n(t)\kappa_n(t)-\zeta_n(t)\gamma_n(t)\right)
\end{aligned}\tag{20a}
$$

$$
\text{s.t.}\quad\text{约束 (4)–(6)、(11)、(16c)、(17b)}.
$$

由于 $\kappa_n(t)$ 与 $e_n(t)$ 只依赖 $(\mathbf s(t),\mathbf p(t))$，而 $\gamma_n(t)$ 只出现在

$$
\frac{V\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(\gamma_n(t)+\frac{1}{T}\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1}-\zeta_n(t)\gamma_n(t)
$$

中，P2 关于 $(\mathbf s(t),\mathbf p(t))$ 与 $\gamma(t)$ 可分离，故可分解为如下两个子问题。P3 确定当前时隙的 RB 与功率分配决策：

$$
\mathrm{P}3:\quad\min_{\mathbf s(t),\mathbf p(t)}\sum_{n\in\mathcal N^{(r)}}\left(q_n(t)e_n(t)+\zeta_n(t)\kappa_n(t)\right)\quad\text{s.t. 约束 (4)–(6)、(11)、(16c)}. \tag{21}
$$

辅助变量 $\gamma(t)$ 在 P4 中单独优化：

$$
\mathrm{P}4:\quad\min_{\gamma(t)}\sum_{n\in\mathcal N^{(r)}}\frac{V\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(\gamma_n(t)+\frac{1}{T}\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1}-\sum_{n\in\mathcal N^{(r)}}\zeta_n(t)\gamma_n(t)\quad\text{s.t. 约束 (17b)}. \tag{22}
$$

基于上述分解，我们建立如下定理刻画所提 Lyapunov 在线优化框架的性能。上标 $^\dagger$ 表示在线算法（即每时隙求解 P3、P4）所得解，$^*$ 表示 P0 的最优离线解。

**定理 2。** 假设所有虚拟队列初始化为零，则在线算法所得解与 P0 最优离线解之间的性能差距满足

$$
\begin{aligned}
&\sum_{n\in\mathcal N^{(r)}}\frac{\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}}{2\alpha_n^{(r)}-1}\left(\sum_{t\in\mathcal T^{(r)}}\kappa_n^\dagger(t)+1\right)^{-\left(2\alpha_n^{(r)}-1\right)}\\
&\le\sum_{n\in\mathcal N^{(r)}}\frac{\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}\left(k_n^{(r)*}+1\right)^{-\left(2\alpha_n^{(r)}-1\right)}}{2\alpha_n^{(r)}-1}
+\sum_{n\in\mathcal N^{(r)}}\frac{T^{2-2\alpha_n^{(r)}}\Phi}{V}+\frac{\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}T}{\sqrt{2\Phi}}.
\end{aligned}\tag{23}
$$

车辆 $n$ 的能耗满足

$$
\xi_n^{(r)}+\sum_{t\in\mathcal T^{(r)}}e_n^\dagger(t)\le E_n^{\mathrm{cons}}+T\sqrt{2\Phi}, \tag{24}
$$

其中 $\epsilon_n(t)\triangleq e_n(t)-\frac{E_n^{\mathrm{cons}}-\xi_n^{(r)}}{T}$、$\phi_n\triangleq\max_t\{|\epsilon_n(t)|\}$、$\varphi_n\triangleq\max_t\{|\kappa_n(t)-\gamma_n(t)|\}$、$\Phi\triangleq\max_n\{(\phi_n)^2+(\varphi_n)^2\}$。

**证明：** 见附录 C。□

定理 2 刻画了在精确逐时隙最小化 P3、P4 时 Lyapunov 在线框架的性能：若每时隙最优求解分解后的逐时隙问题，所得在线策略相对 P0 离线最优具有有界差距，同时保证每辆车的长期能耗有界。

基于上述分解，我们分别求解两个子问题 P3 与 P4。P4 是凸优化问题（目标关于 $\gamma(t)$ 凸，且 (17b) 定义的可行集为凸），其最优解可由 KKT 条件直接得到：

$$
\gamma_n^\dagger(t)=\begin{cases}\dfrac{I}{T},&\zeta_n(t)\ge0,\\[6pt]\left[\left(\frac{V\left(C_n^{(r)}\right)^{2\alpha_n^{(r)}}}{-\zeta_n(t)}\right)^{\frac{1}{2\alpha_n^{(r)}-1}}-\frac{1}{T}\right]_0^{\frac{I}{T}},&\zeta_n(t)<0,\end{cases}\tag{25}
$$

其中 $[a]_0^{\frac{I}{T}}$ 定义为 $\min\left(\max\left(a,0\right),\frac{I}{T}\right)$。相反，P3 因二值 RB 分配变量与功率控制约束带来的非线性耦合而是 MINLP 问题，求解更具挑战，将在后续小节处理。

### B. RB 分配准则

首先把二值 RB 分配变量 $\mathbf s(t)$ 松弛为 $[0,1]$ 上的连续变量，并考虑 P3 的如下松弛版本：

$$
\begin{aligned}
\tilde{\mathrm P}3:\quad\min_{\mathbf s(t),\mathbf p(t)}\ &\sum_{n\in\mathcal N(t)}\sum_{z\in\mathcal Z}\zeta_n(t)\frac{\tau\beta s_{n,z}(t)\log_2\left(1+\Gamma_{n,z}(t)\right)}{b+\lceil\log_2I\rceil}\\
&+\sum_{n\in\mathcal N(t)}\sum_{z\in\mathcal Z}q_n(t)\tau s_{n,z}(t)p_{n,z}(t)
\end{aligned}\tag{26a}
$$

$$
\text{s.t.}\quad 0\le s_{n,z}(t)\le1,\qquad\forall n\in\mathcal N(t),\ \forall z\in\mathcal Z, \tag{26b}
$$

$$
\text{约束 (4)、(6)}.
$$

其中 $\mathcal N(t)=\left\{n\in\mathcal N^{(r)}:\ (t-1)\tau\ge\rho_n^{(r)},\ \sum_{t'=1}^{t-1}\kappa_n(t')<I\right\}$ 表示在时隙 $t$ 已完成本地训练、有资格传输的车辆集合。由于约束 (16c)，$\mathcal N(t)$ 之外的车辆被排除在 RB 分配之外。松弛问题 $\tilde{\mathrm P}3$ 仍非凸，因为目标关于 $\mathbf s(t)$ 与 $\mathbf p(t)$ 既非凸也非凹，故全局最优解难以获得。尽管如此，我们基于 KKT 条件推导出如下刻画必要最优性条件的命题。

**命题 1。** 最优解处 $s_{n,z}(t)$ 为正的必要条件为

$$
n=\arg\min_{n\in\mathcal N(t)}\Upsilon_{n,z}(t), \tag{27}
$$

其中代价函数 $\Upsilon_{n,z}(t)$ 定义为

$$
\Upsilon_{n,z}(t)=\zeta_n(t)\frac{\tau\beta\log_2\left(1+\Gamma_{n,z}(t)\right)}{b+\lceil\log_2I\rceil}+\tau q_n(t)p_{n,z}(t). \tag{28}
$$

**证明：** 见附录 D。□

该命题给出 RB 分配的必要最优性条件。虽然它不能直接给出全局最优解，但为所提 RB 分配准则提供了基础。尽管二值 RB 分配变量被松弛为 $[0,1]$ 上的连续变量，下述命题表明：给定功率分配时，松弛后的 RB 分配子问题存在**整数**最优解——因此 OFDMA 的专用 RB 分配性质在无损意义下得以保持。

**命题 2。** 对给定功率分配，松弛后的 RB 分配子问题存在整数最优解。具体地，存在一个最优解使每个 RB 专用于一辆车，即 $s_{n^*,z}(t)=1$、$s_{n,z}(t)=0$（$\forall n\ne n^*$）。

**证明：** 考虑固定 RB $z$，令 $\mathcal N_z(t)$ 表示在 RB $z$ 上取得最小 $\Upsilon_{n,z}(t)$ 的车辆集合，即 $\mathcal N_z(t)=\left\{n\mid\arg\min_{n\in\mathcal N(t)}\Upsilon_{n,z}(t)\right\}$。由 KKT 条件，最优解处 $s_{n,z}(t)>0$ 蕴含用户 $n\in\mathcal N_z(t)$，且对所有 $n\notin\mathcal N_z(t)$ 有 $s_{n,z}(t)=0$。当 RB $z$ 分配给某辆车时，约束 (4) 变为 $\sum_{n\in\mathcal N(t)}s_{n,z}(t)=\sum_{n\in\mathcal N_z(t)}s_{n,z}(t)=1$。此外，由 $\mathcal N_z(t)$ 的定义，所有 $n\in\mathcal N_z(t)$ 具有相同的 $\Upsilon_{n,z}(t)$ 值，且这是所有车辆中最小的。因此 RB $z$ 对目标 (26a) 的贡献为

$$
\sum_{n\in\mathcal N_z(t)}s_{n,z}(t)\Upsilon_{n,z}(t)=\Upsilon_{n^*,z}(t)\sum_{n\in\mathcal N_z(t)}s_{n,z}(t)=\Upsilon_{n^*,z}(t),
$$

其中 $n^*\in\mathcal N_z(t)$。因此，只要这些权重之和为 1，无论权重 $s_{n,z}(t)$ 如何在 $\mathcal N_z(t)$ 的车辆间分配，目标贡献都保持不变。进一步，$\Upsilon_{n^*,z}(t)\le0$ 成立，因为可把与该 RB 关联的发射功率 $p_{n^*,z}(t)$ 设为零而不违反任何约束；因此把 RB 分配给某辆车不劣于使其不被分配。故对固定功率分配的松弛 RB 分配子问题存在把 RB $z$ 专用于一辆车的整数解。证毕。□

### C. 功率分配

接着考虑功率分配问题。给定 RB 分配决策，下述命题刻画最优发射功率分配策略。

**命题 3。** 给定 RB 分配决策，车辆 $n$ 的最优功率分配如下：

若 $\zeta_n(t)\ge0$，最优发射功率为

$$
p_{n,z}(t)=0,\qquad\forall z\in\mathcal Z_n(t). \tag{29}
$$

若 $\zeta_n(t)<0$ 且 $q_n(t)>0$，正功率 RB 集合 $\mathcal Z_n^*(t)$ 上的最优发射功率为

$$
p_{n,z}(t)=\min\left(\frac{p_n^{\max}+\sum_{z'\in\mathcal Z_n^*(t)}\frac{\beta N_0}{\|\mathbf h_{n,z'}(t)\|^2}}{\left|\mathcal Z_n^*(t)\right|},\ \frac{-\zeta_n(t)\beta}{q_n(t)\ln2}\right)-\frac{\beta N_0}{\|\mathbf h_{n,z}(t)\|^2},\qquad\forall z\in\mathcal Z_n^*(t). \tag{30}
$$

若 $\zeta_n(t)<0$ 且 $q_n(t)=0$，最优发射功率为

$$
p_{n,z}(t)=\frac{p_n^{\max}+\sum_{z'\in\mathcal Z_n^*(t)}\frac{\beta N_0}{\|\mathbf h_{n,z'}(t)\|^2}}{\left|\mathcal Z_n^*(t)\right|}-\frac{\beta N_0}{\|\mathbf h_{n,z}(t)\|^2},\qquad\forall z\in\mathcal Z_n^*(t). \tag{31}
$$

**证明：** 见附录 E。□

命题 3 给出功率分配的闭式表达式，但它需要事先知道车辆 $n$ 分配正功率的 RB 子集 $\mathcal Z_n^*(t)$。为此我们提出算法 1，增量搜索子集 $\mathcal Z_n^*(t)$：先按信道增益降序排列全部候选 RB，再依次把 RB 加入候选集并用 (30) 计算相应功率分配；过程持续到遇到非正功率值为止，从而保证仅把获得正功率的 RB 纳入 $\mathcal Z_n^*(t)$。

**算法 1　功率分配算法**

1. 按 $\|\mathbf h_{n,z}(t)\|^2$ 降序排列 $z\in\mathcal Z_n(t)$。
2. **for** $j=1$ **to** $|\mathcal Z_n(t)|$ **do**
3. 　选取前 $j$ 个 RB 作为 $\mathcal Z_n^*(t)$；
4. 　按命题 3 计算所有 $z\in\mathcal Z_n^*(t)$ 的功率分配 $p'_{n,z}(t)$；
5. 　**if** 存在 $p'_{n,z}(t)\le0$ **then**
6. 　　**break**；｛停止：发现无效 RB，不更新｝
7. 　**else**
8. 　　更新当前功率分配 $p_{n,z}(t)=p'_{n,z}(t)$；
9. 　**end if**
10. **end for**

**注 2。** 命题 1 与 3 刻画最优 RB 与功率分配策略的结构性质。PGT 队列 $\zeta_n(t)$ 根据累积传输梯度元素数调节传输紧迫度：当 $\zeta_n(t)\ge0$ 时，车辆已传输相对较多的梯度元素，边际收敛增益递减降低进一步传输的激励，此时发射功率变为零，相应 RB 释放给传输需求更紧迫的其他车辆；当 $\zeta_n(t)<0$ 时，系统分配更多通信资源以增加传输梯度元素数。能量队列 $q_n(t)$ 控制长期能耗：积压越大，对未来功率分配施加越高惩罚，鼓励更节能的传输。

### D. 联合 RB 与功率分配算法

尽管命题 1–3 给出 RB 与功率分配策略的解析刻画，二者本质上仍然耦合：RB 效用依赖功率分配，而功率分配又依赖已分配的 RB 集合。我们为此提出迭代式联合 RB 与功率分配算法（算法 2）以求解 P3。

**算法 2　联合 RB 与功率分配算法**

1. 初始化所有 $s_{n,z}(t)=0$、$p_{n,z}(t)=0$，未分配 RB 集合 $\mathcal Z'(t)=\mathcal Z$，已分配给车辆 $n$ 的 RB 集合 $\mathcal Z_n^\dagger(t)=\varnothing$；
2. **while** $\mathcal Z'\ne\varnothing$ **do**
3. 　**for** $n\in\mathcal N(t)$ **do**
4. 　　令 $\mathcal Z_n(t)=\mathcal Z_n^\dagger(t)\cup\mathcal Z'(t)$；
5. 　　基于算法 1 在 $\mathcal Z_n(t)$ 上获得功率分配 $p_{n,z}(t)$；
6. 　　按 (28) 计算 $\Upsilon_{n,z}(t)$；
7. 　**end for**
8. 　找出 $(n,z)=\arg\min_{n\in\mathcal N(t),z\in\mathcal Z'}\Upsilon_{n,z}(t)$；
9. 　把 RB $z$ 分配给用户 $n$：置 $s_{n,z}(t)=1$；
10. 　更新 $\mathcal Z'\leftarrow\mathcal Z'\setminus\{z\}$、$\mathcal Z_n^\dagger(t)\leftarrow\mathcal Z_n^\dagger(t)\cup\{z\}$；
11. **end while**
12. **for** $n\in\mathcal N(t)$ **do**
13. 　在已分配 RB 集合 $\{z\mid s_{n,z}(t)=1\}$ 上执行算法 1 以最终确定 $p_{n,z}(t)$；
14. **end for**

所提算法在自适应功率分配下按边际效用贡献迭代分配 RB：初始时全部 RB 未分配；每次迭代中，对每辆车 $n$，RSU 暂时把其当前已分配 RB 集合 $\mathcal Z_n^\dagger(t)$ 与剩余未分配 RB 集合 $\mathcal Z'(t)$ 合并，基于该临时 RB 集合用算法 1 重新计算功率分配，并对所有候选 RB—车辆对评估所得 $\Upsilon_{n,z}(t)$。取得最小 $\Upsilon_{n,z}(t)$ 的 RB—车辆对 $(n,z)$ 被选中，RB $z$ 分配给车辆 $n$；随后该 RB 从未分配集合中删除，过程重复直至全部 RB 分配完毕。最后，在 RB 分配完成后，每辆车用算法 1 在其最终 RB 集合上重新计算功率分配。

### E. FedPGT 的整体流程

所提 PGT 算法流程见算法 3。每轮开始时，RSU 广播全局模型，车辆进行本地模型更新；随后在 log-log 域把排序梯度幅值拟合到幂律模型，本地估计可压缩参数 $C_n^{(r)}$ 与 $\alpha_n^{(r)}$。每个时隙中，RSU 观测当前信道状态与车辆可用性，并求解分解后的逐时隙问题 P3、P4；车辆按所得 RB 与功率分配决策渐进传输梯度元素，虚拟队列根据实际传输更新。该过程在一轮内所有时隙上继续。通过在线求解逐时隙问题，PGT 在不需要未来系统信息的情况下适应时变信道，并获得有界性能差距。

**算法 3　FedPGT 整体流程**

- **初始化：** 置 $\mathbf q(1)=\mathbf 0$、$\boldsymbol\zeta(1)=\mathbf 0$；
- **for** $t\in\mathcal T^{(r)}$ **do**
- 　完成本地训练的车辆通过幂律拟合估计 $C_n^{(r)}$ 与 $\alpha_n^{(r)}$；
- 　构造活跃传输集合 $\mathcal N(t)$；
- 　观测当前 CSI $\mathbf h(t)$ 与队列状态 $\mathbf q(t)$、$\boldsymbol\zeta(t)$；
- 　求解 P4 得 $\boldsymbol\gamma^*(t)$；
- 　用算法 2 求解 P3 得 $\mathbf s^*(t)$ 与 $\mathbf p^*(t)$；
- 　$\mathcal N(t)$ 中车辆传输梯度元素；
- 　更新虚拟队列 $\mathbf q(t+1)$ 与 $\boldsymbol\zeta(t+1)$；
- **end for**

每时隙复杂度主要由求解 P3 与 P4 决定。P4 有闭式解，复杂度随车辆数线性增长，即 $\mathcal O(N^{(r)})$。对 P3，RB 分配遍历全部未分配 RB；每次迭代对每辆车执行算法 1 以重算相应功率分配，得到每次迭代 $\mathcal O(N^{(r)}Z)$ 的复杂度；由于每个 RB 只被分配一次，RB 分配的总复杂度为 $\mathcal O(N^{(r)}Z^2)$。注意算法 1 涉及按信道增益对 RB 排序，但该排序操作对每辆车在每时隙开始时只执行一次，所得 RB 次序在后续执行中复用；因此排序步骤只引入 $\mathcal O(N^{(r)}Z\log_2Z)$ 的预处理复杂度，被 $\mathcal O(N^{(r)}Z^2)$ 支配。故每时隙复杂度为 $\mathcal O(N^{(r)}Z^2)$，在 $T$ 个时隙上总复杂度为 $\mathcal O(TN^{(r)}Z^2)$。

## VI. 实验设置

本节在车载网络设置下通过仿真评估所提 FedPGT。我们首先介绍仿真设置，然后在 CIFAR-10 与 Argoverse 数据集上分别评估图像分类与轨迹预测任务中 FedPGT 在不同车载网络条件下的性能。

### A. 仿真设置

用 SUMO [43] 生成城市网格道路网络，RSU 部署在中心，车辆路径遵循曼哈顿移动模式：在每个交叉口，车辆以概率 0.5 直行、以各 0.25 的概率左转或右转。

车辆动力学遵循智能驾驶员模型（Intelligent Driver Model，IDM），车辆 $n$ 的加速度为

$$
a_n=a^{\max}\left[1-\left(\frac{v_n}{v^{\max}}\right)^4-\left(\frac{d_n'}{d_n^*}\right)^2\right],
$$

其中 $v_n$ 为瞬时速度，$v^{\max}$ 为最大允许速度，$d_n'$ 为车头间距。期望车头间距为

$$
d_n^*=d^{\mathrm{safe}}+v_nt^{\mathrm{dst}}+\frac{v_n\Delta v_n}{2\sqrt{a^{\max}a^{\mathrm{brake}}}},
$$

其中 $d^{\mathrm{safe}}$ 为安全距离，$t^{\mathrm{dst}}$ 为期望车头时距，$\Delta v_n$ 为相对速度，$a^{\mathrm{brake}}$ 为舒适制动减速度。

无线信道模型遵循 3GPP V2X 规范 TR 37.885 [44]，同时考虑视距（LOS）与非视距（NLOS）传播条件。城市 LOS 路径损耗建模为 $PL_{\mathrm{LOS}}=38.77+16.7\log_{10}(d)+18.2\log_{10}(f_c)$，NLOS 路径损耗为 $PL_{\mathrm{NLOS}}=36.85+30\log_{10}(d)+18.9\log_{10}(f_c)$，其中 $d$ 为链路距离、$f_c$ 为载频。阴影系数服从对数正态分布，小尺度衰落向量服从瑞利衰落。

**表 I　仿真参数**

| 仿真参数 | 取值 |
|---|---|
| 系统带宽 | 20 MHz |
| 最大发射功率 | 0.2 W |
| 载波频率 | 5.9 GHz |
| 车辆阻挡损耗 | $\max\{0,\mathcal N(5,4)\}$ dB |
| 阴影衰落标准差 | 3 dB（LOS、NLOSv），4 dB（NLOS） |
| 噪声功率谱密度 | −174 dBm/Hz |
| 能耗系数 | $10^{-28}$ [41]、[42] |
| 能量约束 | 从 0.05 J 到 0.1 J 随机选取 |
| 时隙长度 | 10 ms |
| 平均车辆数 | 15 |
| RB 数 | 50 |

除非另有说明，评估单个变量影响时采用默认参数设置。

### B. 模型与数据集

我们在图像分类与轨迹预测两类任务上评估 FedPGT。

**1）CIFAR-10：** 先在 CIFAR-10 数据集 [45] 上评估，该数据集含 10 类的 50,000 张训练图像与 10,000 张测试图像。考虑非独立同分布数据分布：样本按标签划分，每辆车持有来自两个不同类的数据。用于图像分类的卷积神经网络由六层卷积组成（后接 ReLU 激活），并交替使用最大池化与归一化操作；最后一层卷积连接到全连接层与 softmax 分类器。批量大小从 $\{16,32,48\}$ 中随机选取，学习率设为 0.1。

**2）Argoverse：** 进一步在 Argoverse 轨迹预测数据集 [46] 上评估，该数据集含在城市场景中采集的 300,000 多条序列，每条序列以 10 Hz 采样，任务为预测未来 3 秒时域内的位置。数据集划分为训练、验证与测试集，分别含 205,942、39,472 与 78,143 条序列；数据被均匀划分为 40 个子集。对轨迹预测，我们采用 LaneGCN 模型 [47]，它整合轨迹编码与地图信息，由提取轨迹特征的 ActorNet、建模车道图结构的 MapNet 与融合这些特征以产生预测的 FusionNet 组成。批量大小从 $\{16,32,48\}$ 中随机选取，学习率设为 0.1；采用平均位移误差（ADE）作为评价指标。

### C. 基线方案

为评估 FedPGT 性能，我们与以下基准方案比较：

**1）V2V 增强 FL（V2VFL）[8]：** 采用车车通信辅助的动态设备调度，传输与调度决策每个时隙根据信道变化与车辆移动性更新。与 FedPGT 不同，只有完整上传的更新才能参与模型聚合。

**2）车辆边缘 FL（VEFL）[7]：** 考虑车辆移动性与快速信道变化，资源分配决策根据瞬时信道状态动态更新。

**3）联合梯度稀疏化与设备调度（JGSD）[10]：** 联合考虑设备调度与梯度稀疏化，其中稀疏化程度在每个通信轮开始时固定。

**4）静态调度算法（SA）[13]：** 基于初始信道状态与车辆位置执行设备调度与资源分配，不适应移动性且不应用稀疏化。

### D. 梯度可压缩参数的估计

本小节说明如何从本地梯度估计可压缩参数，并考察它们在联邦训练中的演化。根据定义 1 与假设 1，$\left|g_{n,i}^{(r)}\right|\le C_n^{(r)}i^{-\alpha_n^{(r)}}$，这意味着排序梯度幅值在 log-log 域中受线性函数上界约束：$\log_{10}\left|g_{n,i}^{(r)}\right|\le\log_{10}C_n^{(r)}-\alpha_n^{(r)}\log_{10}i$。这促使我们通过 log-log 域中的线性回归估计可压缩参数。

图 4 展示排序梯度幅值：主导梯度元素在 log-log 域中呈近似线性关系，说明幂律模型能很好地近似梯度衰减行为；相反，尾部元素比拟合幂律曲线衰减更快，主要由于存在大量接近零的梯度分量。由于假设 1 只要求排序梯度幅值被幂律函数上界约束，这种更快衰减仍与假设一致。为估计可压缩参数，我们识别在 log-log 域中线性关系最强的主导区域：对排序梯度幅值执行滑动窗口最小二乘回归，并选择决定系数最高的区间做参数估计；所得拟合参数作为框架中的尺度系数 $C_n^{(r)}$ 与可压缩指数 $\alpha_n^{(r)}$。

图 5 展示训练期间估计的可压缩指数 $\alpha_n^{(r)}$ 的演化：随着训练推进，估计指数逐渐增大，表明梯度在接近收敛时变得越来越可压缩。这是因为随着更多模型参数接近驻点，梯度幅值逐步集中于少数主导元素；因此只需更少的主导梯度元素即可准确近似完整梯度，进一步印证了渐进梯度传输的有效性。

### E. 不同车辆速度下的性能

本小节评估不同最大车速 $v^{\max}$ 下的性能。图 6 给出最终准确率，图 7 与图 8 分别给出 $v^{\max}=5$ m/s 与 $v^{\max}=25$ m/s 时的收敛性能。

在低车速下，所有方案性能相当，因为车辆在 RSU 覆盖范围内停留足够久以完成传输。与静态情形相比，FedPGT 与 V2VFL 甚至因移动性带来的信道分集而略有增益。当车辆高速移动时，所有方案性能都退化：更高移动性缩短驻留时间、增加传输中断概率，减少成功聚合的更新数。

在所有方案中，FedPGT 对移动性的鲁棒性最强，因为它结合了动态资源分配与渐进梯度传输：动态资源分配适应时变信道条件，渐进梯度传输使部分传输的更新在传输中断时仍能参与模型聚合。V2VFL 与 VEFL 在低速时表现良好但高速时退化，因为这些方案需要完整模型上传，移动性造成的传输中断导致无效更新。JGSD 随速度增加也退化，但比 SA 更鲁棒，因为部分传输的模型更新仍能参与训练。相反，SA 退化最严重，因为它既不适应信道变化也不考虑车辆移动性。

### F. 不同车辆数下的性能

我们评估 RSU 覆盖范围内不同平均车辆数下的性能（图 9），图 10 与图 11 分别给出平均车辆数为 5 与 25 时的收敛性能。随着车辆数增加，FedPGT 与 JGSD 稳步提升性能，而 V2VFL、VEFL 与 SA 的增益递减并逐渐饱和。车辆数较少时，总带宽足以支持大多数传输，很大比例车辆能成功上传更新，因此增加参与车辆数会改善所有方案的收敛性能。

随着车辆数增加，总通信需求逐渐超过可用资源。此时需要完整更新传输的方案（V2VFL、VEFL 与 SA）无法有效利用不断增加的车辆数，因为每个通信轮内只有有限数目的更新能被成功聚合。相反，随着车辆数增长，FedPGT 与 JGSD 仍取得稳定性能增益，因为在有限通信资源下部分传输的梯度元素仍可参与模型聚合。这也验证了定理 1：从更多车辆收集主导梯度元素比从更少车辆收集更完整的更新更有利。

### G. 不同总带宽下的性能

我们评估不同总带宽下的性能：图 12 给出最终准确率，图 13 与图 14 分别给出 10 MHz 与 30 MHz 带宽设置下的收敛性能。当带宽充足（30 MHz）时，所有方案性能相当，因为大多数车辆能成功完成更新传输；当总带宽从 30 MHz 降到 10 MHz 时，由于通信资源受限，整体性能退化。

在低带宽区，需要完整更新传输的方案（V2VFL、VEFL 与 SA）性能显著退化，因为有限带宽限制了每个通信轮内能被成功聚合的更新数。相反，FedPGT 在有限带宽下最鲁棒，因为渐进梯度传输使更多车辆的主导梯度元素仍能参与模型聚合。

### H. 在 Argoverse 轨迹预测数据集上的评估

我们进一步在 Argoverse 轨迹预测数据集上评估不同方案，结果见图 15–17，评价指标为平均位移误差（ADE）。当车速较低（$v^{\max}=5$ m/s）且带宽充足（20 MHz）时，所有方案性能相当，FedPGT 的 ADE 最低。当系统在更具挑战性的条件下运行（如带宽受限（10 MHz）或高移动性（$v^{\max}=25$ m/s））时，FedPGT 与基线之间的性能差距变得更显著；这些情形下 FedPGT 优势明显，体现出其对通信约束与移动性的鲁棒性。这些结果进一步验证了 FedPGT 的优势不仅限于图像分类任务，还可扩展到更复杂的时空预测问题。

## VII. 结论

本文提出了 FedPGT——一种面向时变无线信道上车载联邦学习的渐进梯度传输方案。我们首先建立收敛界，揭示传输梯度元素的收益递减效应，这促使按边际学习效用优化渐进传输。为处理累积耦合的传输目标，我们发展了可加分离的代理重构，并引入 PGT 队列与能量队列以跟踪传输一致性与能量预算偏差；由此实现学习效用与能量代价之间基于 Lyapunov 的折中，使 FedPGT 能在无未来系统信息的情况下联合调整 RB 分配与功率分配。CIFAR-10 与 Argoverse 上的仿真结果表明，在高移动性与有限通信资源下，FedPGT 比现有车载联邦学习方案取得更鲁棒的学习性能。未来工作将研究把语义感知传输与更先进的梯度压缩技术集成到 FedPGT 框架中，以在保持学习性能的同时进一步降低通信开销；我们还将把框架扩展到更实际的车载联邦学习场景，如动态连通性下的异步模型聚合。

## 附录 A：引理 1 的证明

记 $\mathbf g:=\mathbf g_n^{(r)}$、$k:=k_n^{(r)}$、$C:=C_n^{(r)}$、$\alpha:=\alpha_n^{(r)}$。由传输算子 (12)，梯度近似误差为

$$
\left\|\mathbf g-\Psi(\mathbf g)\right\|^2=\sum_{i=k+1}^{I}|g_i|^2\le\sum_{i=k+1}^{I}C^2i^{-2\alpha}.
$$

用积分比较 $\sum_{i=k+1}^{I}i^{-2\alpha}\le\int_k^\infty x^{-2\alpha}\,dx=\frac{(k+1)^{-(2\alpha-1)}}{2\alpha-1}$ 及尾项估计，得

$$
\sum_{i=k+1}^{I}|g_i|^2\le C^2\int_k^\infty x^{-2\alpha}dx\le\frac{C^2(k+1)^{-(2\alpha-1)}}{2\alpha-1},
$$

再结合 $k\ge0$ 与 $\alpha>\frac12$ 时的守恒放大（利用 $(k+1)^{-2\alpha}\le(k+1)^{-(2\alpha-1)}$）即得 (14)。证毕。

## 附录 B：定理 1 的证明

由假设 4 与全局损失定义，全局损失函数也是 $L$-光滑的，故

$$
F\left(\mathbf w^{(r)}\right)-F\left(\mathbf w^{(r-1)}\right)\le\left\langle\nabla F\left(\mathbf w^{(r-1)}\right),\mathbf w^{(r)}-\mathbf w^{(r-1)}\right\rangle+\frac{L}{2}\left\|\mathbf w^{(r)}-\mathbf w^{(r-1)}\right\|^2.
$$

把聚合式 (3) 代入，并对内积项做 $-\frac{\eta}{2}\|\nabla F\|^2-\frac{\eta}{2}\|\bar{\mathbf g}\|^2+\frac{\eta}{2}\|\nabla F-\bar{\mathbf g}\|^2$ 的拆解（其中 $\bar{\mathbf g}$ 为传输梯度均值），再用光滑性消去二次项，可得每轮下降不等式。对随机梯度方差（假设 2）与车辆采样异构性（假设 3）分别取期望，并利用引理 1 的近似误差界 (14) 对稀疏化误差项放缩，最终对 $r=0,\ldots,R-1$ 求和、除以 $R$ 即得 (15)。证毕。

## 附录 C：定理 2 的证明

定义 Lyapunov 函数 $L(t):=\frac{1}{2}\sum_{n}\left[q_n(t)^2+\zeta_n(t)^2\right]$。由队列更新 (18)、(19) 得 drift 界

$$
L(t+1)-L(t)\le\sum_n\left[q_n(t)\epsilon_n(t)+\zeta_n(t)(\kappa_n(t)-\gamma_n(t))\right]+\frac{1}{2}\sum_n\left[\epsilon_n(t)^2+(\kappa_n(t)-\gamma_n(t))^2\right],
$$

其中 $\epsilon_n(t)=e_n(t)-\frac{E_n^{\mathrm{cons}}-\xi_n^{(r)}}{T}$。由 $\phi_n$、$\varphi_n$ 与 $\Phi$ 的定义，最后一项不超过 $N^{(r)}\Phi$。把 drift 与 $V$ 倍惩罚项相加，得到 P2 的 drift-plus-penalty 上界；对其逐时隙最小化（即分别求解 P3、P4）并使用标准 Lyapunov 优化论证，可得相对离线最优的有界差距 (23) 与能耗界 (24)。证毕。

## 附录 D：命题 1 的证明

对松弛问题 $\tilde{\mathrm P}3$ 写出拉格朗日函数，其关于 $s_{n,z}(t)$ 的 KKT 条件给出：若最优解处 $s_{n,z}(t)>0$，则相应乘子满足互补松弛条件，从而在 RB $z$ 上把该 RB 分配给使单位传输代价 $\Upsilon_{n,z}(t)$ 最小的车辆。将目标 (26a) 中与 $s_{n,z}(t)$ 相乘的项合并即得 (28)，故最优解处 $s_{n,z}(t)>0$ 要求 $n=\arg\min_{n\in\mathcal N(t)}\Upsilon_{n,z}(t)$，即 (27)。证毕。

## 附录 E：命题 3 的证明

给定 RB 分配，功率分配问题关于 $p_{n,z}(t)$ 为可分凸问题（对数速率项凹、能量项线性）。写出拉格朗日函数并对每个 $z\in\mathcal Z_n^*(t)$ 求一阶条件，得

$$
\frac{\partial}{\partial p_{n,z}}\left[\zeta_n(t)\frac{\tau\beta\log_2(1+\Gamma_{n,z})}{b+\lceil\log_2I\rceil}+\tau q_n(t)p_{n,z}\right]=0,
$$

其解形式为 $p_{n,z}(t)=\min\left(\text{平均功率项},\ \frac{-\zeta_n(t)\beta}{q_n(t)\ln2}\right)-\frac{\beta N_0}{\|\mathbf h_{n,z}(t)\|^2}$。结合总功率约束 (6) 的等号成立情形与边界情况 $\zeta_n(t)\ge0$、$q_n(t)=0$，即分别得 (29)、(30)、(31)。证毕。

## 图注与表注

**图 1：** 所提 FedPGT 方案（含车辆本地更新、梯度上传、模型聚合 $\Sigma$、时频 RB 分配、能量队列与 PGT 队列、信道状态、时隙与 RB 索引等元素）。

**图 2：** 所提 FedPGT 方案的优化框架：随机优化问题 P0 → 上界代理重构 → 代理优化问题 P1 → drift-plus-penalty 变换 → 在线优化问题 P2 → 分解为子问题 P3（联合 RB 与功率分配，经 KKT 得 RB 分配准则（命题 1、2）与解析功率分配（命题 3））与子问题 P4（代理变量优化），并标注"累积耦合目标 / 未知未来系统状态"等挑战。

**图 3：** SUMO 生成的道路网络（RSU 部署于中心）。

**图 4：** log-log 域中的排序梯度幅值。

**图 5：** 估计的可压缩指数 $\alpha_n^{(r)}$ 的演化。

**图 6：** 不同车辆速度下各方法的最终测试准确率。

**图 7：** $v^{\max}=5$ m/s 时各方法的收敛性能。

**图 8：** $v^{\max}=25$ m/s 时各方法的收敛性能。

**图 9：** 不同平均车辆数下各方法的最终测试准确率。

**图 10：** 平均车辆数为 5 时各方法的收敛性能。

**图 11：** 平均车辆数为 25 时各方法的收敛性能。

**图 12：** 不同总带宽下各方法的最终测试准确率。

**图 13：** 总带宽为 10 MHz 时各方法的收敛性能。

**图 14：** 总带宽为 30 MHz 时各方法的收敛性能。

**图 15：** 总带宽 20 MHz、$v^{\max}=5$ m/s 时轨迹预测任务的 ADE。

**图 16：** 总带宽 20 MHz、$v^{\max}=25$ m/s 时轨迹预测任务的 ADE。

**图 17：** 总带宽 10 MHz、$v^{\max}=5$ m/s 时轨迹预测任务的 ADE。

**表 I：** 仿真参数（系统带宽 20 MHz、最大发射功率 0.2 W、载频 5.9 GHz、车辆阻挡损耗 $\max\{0,\mathcal N(5,4)\}$ dB、阴影衰落标准差 3 dB（LOS、NLOSv）/4 dB（NLOS）、噪声功率谱密度 −174 dBm/Hz、能耗系数 $10^{-28}$、能量约束 0.05–0.1 J、时隙 10 ms、平均车辆数 15、RB 数 50；逐格见正文表 I）。

> **原文说明：** 原文无致谢段；参考文献前无其他附录索引页。原文首页脚注给出作者单位：J. Yan、T. Chen、S. Zhou（通讯作者）与 Z. Niu 就职于清华大学电子工程系北京信息科学与技术国家研究中心（北京 100084）；Y. Sun 就职于北京交通大学电子信息工程学院（北京 100044）。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 12–14 页转录；未逐条核对 DOI）。

[1] Y. Sun, W. Shi, X. Huang, S. Zhou, and Z. Niu, "Edge learning with timeliness constraints: Challenges and solutions," IEEE Commun. Mag., vol. 58, no. 12, pp. 27–33, Dec. 2020.

[2] M. Chen, D. Gündüz, K. Huang, W. Saad, M. Bennis, A. V. Feljan, and H. V. Poor, "Distributed learning in wireless networks: Recent progress and future challenges," IEEE J. Sel. Areas Commun., vol. 39, no. 12, pp. 3579–3605, Oct. 2021.

[3] W. Xu, Z. Yang, D. W. K. Ng, M. Levorato, Y. C. Eldar, and M. Debbah, "Edge learning for b5g networks with distributed signal processing: Semantic communication, edge computing, and wireless sensing," IEEE J. Sel. Top. Signal Process., vol. 17, no. 1, pp. 9–39, Jan. 2023.

[4] N. Jia, Z. Qu, B. Ye, Y. Wang, S. Hu, and S. Guo, "A comprehensive survey on communication-efficient federated learning in mobile edge environments," IEEE Commun. Surv. Tutor., vol. 27, no. 6, pp. 3710–3741, Dec. 2025.

[5] J. Posner, L. Tseng, M. Aloqaily, and Y. Jararweh, "Federated learning in vehicular networks: Opportunities and solutions," IEEE Netw., vol. 35, no. 2, pp. 152–159, Mar. 2021.

[6] J. Yan, T. Chen, B. Xie, Y. Sun, S. Zhou, and Z. Niu, "Hierarchical federated learning: Architecture, challenges, and its implementation in vehicular networks," ZTE Commun., vol. 21, no. 1, pp. 38–45, Mar. 2023.

[7] M. F. Pervej, R. Jin, and H. Dai, "Resource constrained vehicular edge federated learning with highly mobile connected vehicles," IEEE J. Sel. Areas Commun., vol. 41, no. 6, pp. 1825–1844, May 2023.

[8] J. Yan, T. Chen, Y. Sun, Z. Nan, S. Zhou, and Z. Niu, "Dynamic scheduling for vehicle-to-vehicle communications enhanced federated learning," IEEE Trans. Wireless Commun., vol. 24, no. 11, pp. 9373–9390, Nov. 2025.

[9] L. Li, D. Shi, R. Hou, H. Li, M. Pan, and Z. Han, "To talk or to work: Flexible communication compression for energy efficient federated learning over heterogeneous mobile edge devices," in Proc. IEEE INFOCOM, Vancouver, BC, Canada, May 2021, pp. 1–10.

[10] X. Lin, Y. Liu, F. Chen, X. Ge, and Y. Huang, "Joint gradient sparsification and device scheduling for federated learning," IEEE Trans. Green Commun. Netw., vol. 7, no. 3, pp. 1407–1419, Aug. 2023.

[11] S. Hu, L. Jiang, and B. He, "Practical hybrid gradient compression for federated learning systems," in Proc. Int. Joint Conf. Artif. Intell. (IJCAI), Macau SAR, China, Aug. 2024, pp. 458–465.

[12] M. Chen, Z. Yang, W. Saad, C. Yin, H. V. Poor, and S. Cui, "A joint learning and communications framework for federated learning over wireless networks," IEEE Trans. Wireless Commun., vol. 20, no. 1, pp. 269–283, Oct. 2020.

[13] W. Shi, S. Zhou, Z. Niu, M. Jiang, and L. Geng, "Joint device scheduling and resource allocation for latency constrained wireless federated learning," IEEE Trans. Wireless Commun., vol. 20, no. 1, pp. 453–467, Sept. 2020.

[14] M. M. Amiri and D. Gündüz, "Federated learning over wireless fading channels," IEEE Trans. Wireless Commun., vol. 19, no. 5, pp. 3546–3557, May 2020.

[15] Y. Sun, S. Zhou, Z. Niu, and D. Gündüz, "Dynamic scheduling for over-the-air federated edge learning with energy constraints," IEEE J. Sel. Areas Commun., vol. 40, no. 1, pp. 227–242, Nov. 2021.

[16] G. Zhu, Y. Wang, and K. Huang, "Broadband analog aggregation for low-latency federated edge learning," IEEE Trans. Wireless Commun., vol. 19, no. 1, pp. 491–506, Jan. 2020.

[17] T. Chen, J. Yan, Y. Sun, S. Zhou, D. Gündüz, and Z. Niu, "Mobility accelerates learning: Convergence analysis on hierarchical federated learning in vehicular networks," IEEE Trans. Veh. Technol., vol. 74, no. 1, pp. 1657–1673, Jan. 2025.

[18] H. Xiao, J. Zhao, Q. Pei, J. Feng, L. Liu, and W. Shi, "Vehicle selection and resource optimization for federated learning in vehicular edge computing," IEEE Trans. Intell. Transp. Syst., vol. 23, no. 8, pp. 11 073–11 087, Aug. 2022.

[19] X. Zhang, Z. Chang, T. Hu, W. Chen, X. Zhang, and G. Min, "Vehicle selection and resource allocation for federated learning-assisted vehicular network," IEEE Trans. Mobile Comput., vol. 23, no. 5, pp. 3817–3829, May 2024.

[20] X. Cai, P. Zhao, S. Liu, Y. Fu, C. Li, and F. R. Yu, "Enhancing federated learning in connected and autonomous vehicles through cost optimization and advanced model selection," IEEE Trans. Intell. Transp. Syst., vol. 26, no. 4, pp. 5276–5289, Apr. 2025.

[21] H. Tu, W. Wu, L. Chen, L. Li, X. Chen, and X. Shen, "FL in vehicular networks: Challenges and solutions," IEEE Netw., 2025.

[22] F. Fathi, M. Montazeri, B. N. Araabi, H. Du, D. Niyato, and H. Kebriaei, "Incentive mechanisms for federated learning in vehicular networks," IEEE Trans. Intell. Transp. Syst., 2025.

[23] A. Shan, C. Wu, Y. Lin, L. Zhong, J. Li, Y. Ji, and J. Chen, "Reinforcement learning-based incentive mechanism for vehicular federated learning," IEEE Trans. Veh. Technol., 2025.

[24] D. Chen, T. Deng, H. Huang, J. Jia, M. Dong, D. Yuan, and K. Li, "Mobility-aware decentralized federated learning for vehicular networks," IEEE Trans. Mobile Comput., 2025.

[25] Z. Jin, C. Yang, Y. Ye, L. Zhang, J. Shen, and J. Su, "Mobility-aware semi-asynchronous federated learning for vehicular networks," IEEE Trans. Wireless Commun., 2025.

[26] C. Li, Z. Zhao, H. Zhang, and D. Yuan, "Vehfsl: Hybrid federated split learning for vehicular networks," IEEE Trans. Wireless Commun., 2025.

[27] L. Yu and Z. Chang, "Semantic communication-enhanced u-shaped split federated learning for vehicular networks," IEEE Trans. Commun., 2025.

[28] S. U. Stich, J.-B. Cordonnier, and M. Jaggi, "Sparsified SGD with memory," in Proc. NeurIPS, 2018.

[29] D. Basu, D. Data, C. Karakus, and S. N. Diggavi, "Qsparse-local-sgd: Distributed SGD with quantization, sparsification, and local computations," IEEE J. Sel. Areas Inf. Theory, vol. 1, no. 1, pp. 217–226, 2020.

[30] P. Han, S. Wang, and K.-K. Leung, "Adaptive gradient sparsification for efficient federated learning: An online learning approach," in Proc. IEEE ICDCS, 2020, pp. 300–310.

[31] K. Wei, J. Li, C. Ma, M. Ding, F. Shu, H. Zhao, W. Chen, and H. Zhu, "Privacy-preserving federated learning with gradient sparsification and wireless resource allocation," IEEE Trans. Wireless Commun., 2023.

[32] X. Zhang, X. Zhou, M. Lin, and J. Sun, "ShuffleNet: An extremely efficient convolutional neural network for mobile devices," in Proc. CVPR, 2018, pp. 6848–6856.

[33] Q. Zeng, Y. Du, K. Huang, and K. K. Leung, "Energy-efficient resource management for federated edge learning with CPU-GPU heterogeneous computing," IEEE Trans. Wireless Commun., vol. 20, no. 12, pp. 7947–7962, 2021.

[34] A. M. Abdelmoniem, A. Elzanaty, M. Alouini, and M. Canini, "An efficient statistical-based gradient compression technique for distributed training systems," in Proc. MLSys, 2021.

[35] A. Elzanaty, A. Giorgetti, and M. Chiani, "Limits on sparse data recovery," IEEE Trans. Inf. Theory, 2021.

[36] A. Elzanaty, A. Giorgetti, and M. Chiani, "Lossy compression of noisy sparse sources," IEEE Trans. Inf. Theory, 2021.

[37] S. Mallat, A Wavelet Tour of Signal Processing: The Sparse Way. Academic Press, 2009.

[38] R. Baraniuk, M. A. Davenport, M. F. Duarte, and C. Hegde, "An introduction to compressive sensing," in Proc. IEEE, 2011.

[39] J. Wangni, J. Wang, J. Liu, and T. Zhang, "Gradient sparsification for communication-efficient distributed optimization," in Proc. NeurIPS, 2018.

[40] Y. Du, S. Yang, and K. Huang, "High-dimensional stochastic gradient quantization for communication-efficient federated learning," IEEE Trans. Signal Process., vol. 68, pp. 2128–2142, 2020.

[41] Y. Mao, J. Zhang, and K. B. Letaief, "Dynamic computation offloading for mobile-edge computing with energy harvesting devices," IEEE J. Sel. Areas Commun., vol. 34, no. 12, pp. 3590–3605, 2016.

[42] Z. Yang, M. Chen, W. Saad, C. S. Hong, and M. Shikh-Bahaei, "Energy efficient federated learning over wireless communication networks," IEEE Trans. Wireless Commun., vol. 20, no. 3, pp. 1935–1949, 2021.

[43] P. A. Lopez, M. Behrisch, L. Bieker-Walz, J. Erdmann, Y.-P. Flötteröd, R. Hilbrich, L. Lücken, J. Rummel, P. Wagner, and E. Wießner, "Microscopic traffic simulation using sumo," in Proc. IEEE ITSC, 2018, pp. 2575–2582.

[44] M. Harounabadi, D. M. Soleymani, S. Bhadauria, M. Leyh, and E. Roth-Mandutz, "V2x channel models for 5g nr," in Proc. IEEE VTC, 2021.

[45] A. Krizhevsky, V. Nair, and G. Hinton, "Learning multiple layers of features from tiny images," Tech. Rep., University of Toronto, 2009.

[46] M.-F. Chang, J. Lambert, P. Sangkloy, J. Singh, S. Bak, A. Hartnett, D. Wang, P. Carr, S. Lucey, D. Ramanan, and J. Hays, "Argoverse: 3d tracking and forecasting with rich maps," in Proc. CVPR, 2019, pp. 8748–8757.

[47] M. Liang, B. Yang, R. Hu, Y. Chen, R. Liao, S. Feng, and R. Utsun, "Learning lane graph representations for motion forecasting," in Proc. ECCV, 2020, pp. 541–556.

**本页范围与校对状态：** 本页为 arXiv:2609.18089v1 的全文中文译稿：摘要、正文第 I–VII 节（含 III-A–D、IV-A–B、V-A–E、VI-A–H 全部小节）、结论、附录 A–E、表 I 逐格、图 1–17 图注、算法 1–3 逐行、基金/作者单位说明与参考文献 [1]–[47]。公式编号沿用原文 (1)–(31)（含 (16a–c)、(17a–c)、(20a)、(26a–b) 子编号）。(32) 及之后的附录编号式未逐式转录，附录 A–E 按原文结构译出主要论证与关键式，长代数推导作忠实概述。表 I 已用 PDF 第 9 页渲染图逐格核对；图内曲线与图像未做数字化估算。原文无致谢段；**原文全文无附录之外的表格**（仅表 I）。逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行原为 2026-09-27（收录日），已按 BRIEF2 结构改为 arXiv:2609.18089v1（2026-09-16，依据 PDF 页眉 "arXiv:2609.18089v1 [cs.LG] 16 Sep 2026"）；作者为 Jintao Yan、Tan Chen、Yuxuan Sun、Sheng Zhou、Zhisheng Niu；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
