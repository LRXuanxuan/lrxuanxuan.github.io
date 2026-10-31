---
layout: page
title: "边通信边感知：空中平台主动在线频谱制图｜中文全文译文"
permalink: /papers/translations/2026-09-23-2609-24119-sensing-while-communicating-active-online-spectrum-cartography-via-air/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c492f49d2a1959dc/) · [原文 arXiv](https://arxiv.org/abs/2609.24119) · [全部目录](/papers/catalog/)

# 边通信边感知：空中平台主动在线频谱制图

**原题：** Sensing While Communicating: Active Online Spectrum Cartography via Air-Ground Cooperation  
**作者：** Shangjie Zhuang（Graduate Student Member, IEEE）、Jiahui Liang（Graduate Student Member, IEEE）、Shijian Gao（Member, IEEE）。原文（arXiv 版）未列出作者单位与邮箱。  
**版本：** arXiv:2609.24119v1（eess.SP），2026 年 9 月 21 日提交，原文 13 页（IEEE 双栏期刊投稿格式，页眉为模板占位 “JOURNAL OF LATEX CLASS FILES, VOL. 14, NO. 8, AUGUST 2015”，含图 1–11、表 I–VI、算法 1–2、命题 1–2、公式 (1)–(34)、附录 A–B、参考文献 36 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VII 节（含 II-A–E、III-A–C、IV-A–B、V-A–C、VI-A–C 等全部小节）、结论、全部图注（图 1–11，含子图说明）、表 I–VI（逐格转录）、算法 1–2、命题 1–2、公式 (1)–(34)、附录 A–B（两个命题的完整证明）与 36 条参考文献英文原条目；原文无作者简介；逐句逐式终校未做。

## 摘要

频谱制图对低空网络中的频谱感知资源管理至关重要：无人机（UAV）采集测量以重建功率谱密度（PSD）无线电图。然而，有限的 UAV 能量预算同时约束采样密度与机载计算，而复杂的城市遮挡又妨碍把测量可靠传送到远端站点。为应对这些挑战，我们提出一种用于主动在线频谱制图的空地协同框架。通过自适应带宽分配，UAV 利用不确定性主动采集 PSD 测量，并同时把它们传给移动无人地面车辆（UGV），而 UGV 维持可靠的空中–地面链路以更新地图。具体地，我们首先提出一种在线深度展开张量分解方法以加速在线地图更新；随后推导比特深度相关的插值误差模型，用以指导量化比特深度的选择，从而在开销与精度之间取得平衡；最后利用不确定性信息分别协调 UAV 的主动采样与 UGV 的链路维持。大量实验表明，所提重建方法相对在线张量分解取得近 27 倍的加速；在城市场景中，所提框架优于代表性基线，把归一化均方误差（NMSE）与中断比分别降低 23% 以上，并把分组服务完成比提升 4% 以上。

**关键词：** 主动采样、空地协同、带宽分配、部分频段观测下的全谱重建、在线频谱制图、量化。

## I. 引言

低空无线网络向智能化演进需要准确的无线电环境感知，以支撑覆盖优化、网络规划与频谱管理 [1]。无线电图通过把每个位置与无线电信息相关联来刻画无线电环境 [2]。接收信号强度（RSS）图通过刻画聚合接收功率的空间变化，被用于支撑覆盖评估与部署规划 [3]；然而其缺少频率信息，限制了在频谱相关应用中的使用。这一局限促使人们采用功率谱密度（PSD）图，它在空间与频率上联合刻画接收功率。

频谱制图指 PSD 地图的重建 [4]。早期工作用样条插值估计空间变化的谱系数 [5]；随后，块项张量模型把空间传播场与其对应频谱耦合起来，并刻画了地图的可恢复性 [6]。为适应实际测量中的离格采样位置与不完整频率覆盖，插值被融入基于张量的重建 [7], [8]。自编码器与条件生成对抗网络也利用频率–空间相关性推断未测频率处的地图 [9]。进一步研究把神经模型与结构化张量分解结合 [10]，近期工作则把压缩亚 Nyquist 感知与神经张量分解结合 [11]。

然而，这些方法主要关注基于固定测量集的离线重建。在低空城市环境中，这些测量由 UAV 采集，而其有限能量预算限制了密集采样。因此提升采样效率需要选择有信息量的位置，这促使人们采用主动感知——利用不确定性指导后续轨迹 [12]。可扩展高斯过程估计地图不确定性，以指导三维环境中 UAV 采样的分层信息路径规划 [13]；高斯过程集成与旅行代价感知的主动学习在限制 UAV 移动的同时选择有信息量的位置 [14]；贝叶斯不确定性也与基于图的强化学习结合，用于规划有信息量且节能的轨迹 [15]；建筑感知的三维重建器与基于扩散的规划器进一步使 UAV 轨迹适应城市环境 [16]。尽管这些研究通过不确定性引导的轨迹提升了采样效率，但对能量与机载资源有限的 UAV 而言，机载地图重建并不现实。把这些测量卸载到固定站点重建可减轻机载计算负担，但建筑遮挡可能中断传输并延迟地图更新。因此，克服通信与计算瓶颈对主动在线频谱制图至关重要。

凭借部署灵活性，无人地面车辆（UGV）已被集成进来为 UAV 提供通信与计算支持 [17]。例如，[18] 中 UGV 从多个停靠点派出 UAV 进行数据采集，并用多智能体课程学习协调其动作以降低信息年龄；对车辆群智感知，[19] 用 UGV 作为移动载体派出与回收 UAV 感知兴趣点，并以异构可学习策略协调二者，在改善数据采集与地理公平性的同时降低能耗；当基站不可用时，[20] 协调车辆移动性与任务卸载，使监视 UAV 可将缓存任务卸载到具备计算资源的 UGV。

此外，测量卸载带来进一步挑战：感知与通信共享固定工作带宽，而在线频谱制图需要由部分频率观测恢复完整 PSD 无线电图。这要求 UAV–UGV 协同，在共享带宽下平衡有信息量的采样与可靠通信，而现有工作很少考虑这一点。

为此，我们提出一种用于低空城市环境在线频谱制图的空地协同框架：UAV 主动采集有信息量的 PSD 测量并传给 UGV 进行在线频谱制图；UGV 随后更新不确定性图，以选择 UAV 的下一采样位置，并指导自身重定位以维持可靠的空中–地面连接。具体地，如图 1 所示，当前不确定性指导感知位置与频段的选择。更宽的感知提供更多频率观测，但增大测量载荷并留给通信的带宽更少；更粗的量化减小载荷，却可能降低重建质量。为管理这些折中，UAV 策略联合选择其运动、感知与量化，以平衡重建精度与向 UGV 的及时传输。然而，有信息量的感知位置可能因城市建筑遮挡而通信条件较差；相应地，支持规划器重定位 UGV 以改善空中–地面连接、支撑测量送达。在 UGV 侧，完整送达的测量被用于更新 PSD 地图与不确定性；反过来，不确定性又指导 UAV 后续的感知与移动决策。

表 I 汇总了所提框架与代表性研究的关键差异。本文贡献概括如下：

- **提出低空城市环境中主动在线频谱制图的空地协同框架：** 它把 UAV 的主动感知与传输同 UGV 的协同通信与计算支持结合起来，取得高重建精度与可靠传输。
- **深度展开的在线张量分解算法：** 面向顺序送达的测量，以学习模块替代计算瓶颈，并把交替更新展开为固定阶段，在保留误差分析所需结构的同时实现及时的地图更新。
- **插值误差模型：** 推导把量化与重建联系起来的插值误差模型；在中高比特深度下，插值误差与量化噪声近似成线性关系。该关系指导量化比特选择，并在 UAV 固定带宽下平衡精度与开销。
- **充分的低空城市环境评估：** 表明所提框架相较代表性基线具有更低估计误差、更低中断比与更高分组服务完成比，反映了空地协同在支撑可靠送达与准确重建方面的有效性。

本文余下部分安排如下：第 II 节给出系统模型与问题建模；第 III–V 节分别构建在线频谱制图方法、量化模型与空地协同框架；第 VI 节给出实验结果；第 VII 节总结全文。

**记号：** 普通斜体字母表示标量，粗体小写与大写字母分别表示向量与矩阵；粗体与非粗体花体大写字母分别表示张量与集合；向量与矩阵元素分别记为 $[a]_i$ 与 $[A]_{ij}$；$\|\cdot\|_0$ 统计非零元个数，$|A|$ 表示集合 $A$ 的基数；$(\cdot)^\top$ 表示转置，$\|\cdot\|_F$ 与 $\|\cdot\|_*$ 分别表示 Frobenius 范数与核范数；$\circ$ 与 $\odot$ 分别表示外积与 Hadamard 积；高斯分布 $\mathcal N(\mu,\sigma^2)$ 的均值为 $\mu$、方差为 $\sigma^2$；$\lfloor\cdot\rceil$ 表示四舍五入到最近整数；指示函数 $\mathcal I\{\cdot\}$ 在所括条件成立时取 1，否则取 0。

## II. 系统模型与问题建模

本节给出空地协同频谱制图的系统模型，并把主动在线频谱制图表述为通信与能量约束下的优化问题。

**表 I：** 代表性无线电制图、UAV 数据采集与 UAV–UGV 协同研究的特征对比。

| 文献 | 部分观测下的全谱恢复 | 主动采样 | 测量量化 | 多智能体协同 | 通信资源分配 |
|---|:-:|:-:|:-:|:-:|:-:|
| [8], [9] | ✓ | × | × | × | × |
| [21], [22] | × | × | ✓ | × | × |
| [12], [14] | × | ✓ | × | × | × |
| [16] | × | ✓ | × | × | × |
| [23], [24] | × | △ | × | × | ✓ |
| [20] | × | × | × | ✓ | ✓ |
| 本文 | ✓ | ✓ | ✓ | ✓ | ✓ |

图例：✓ 表示显式考虑；× 表示不在主要范围内。全谱恢复指：仅由部分频段在采样位置上的观测，重建全部目标频段。“主动采样”中 △ 表示对预生成传感器数据进行计划性采集。通信资源分配包括对传输时间、功率、带宽或调度的显式优化。

### A. PSD 无线电图模型

我们把水平 $x$–$y$ 平面离散为 $N_x\times N_y$ 个网格单元，索引集为 $\mathcal G=\{(i,j)\,|\,1\le i\le N_x,\ 1\le j\le N_y\}$。每个网格单元由其中心在网格坐标中的位置 $(i,j)$ 表示。被监测频谱被划分为 $K$ 个频段，索引为 $k=1,\dots,K$。PSD 无线电图用张量 $\mathbf H\in\mathbb R_+^{N_x\times N_y\times K}$ 表示，其中 $\mathbf H(i,j,k)$ 为网格单元 $(i,j)$ 在频段 $k$ 上的接收 PSD。无线电环境由 $R$ 个位于网格坐标 $\mathbf s_r\in\mathcal G$ 的辐射源产生。对源 $r$，定义 $\mathbf S_r\in\mathbb R^{N_x\times N_y}$ 为其大尺度空间传播场；在网格单元 $(i,j)$ 处，该场建模为

$$
[\mathbf S_r]_{ij}=g_r\left[d\left(\mathbf s_r,(i,j)\right)\right]+\zeta_r(i,j), \tag{1}
$$

其中 $d(\cdot,\cdot)$ 为两个网格坐标之间的欧氏距离，$g_r(\cdot)$ 刻画路损，$\zeta_r(\cdot)$ 表示阴影衰落。源 $r$ 的功率谱记为 $\boldsymbol\phi_r=[\phi_{r,1},\dots,\phi_{r,K}]^\top$。张量分解（TD）因能利用空间与频谱相关性，已被广泛用于 PSD 无线电图建模 [6]–[8], [22]。据此，PSD 无线电图张量可表示为

$$
\mathbf H=\sum_{r=1}^{R}\mathbf S_r\circ\boldsymbol\phi_r. \tag{2}
$$

于是，网格单元 $(i,j)$ 与频段 $k$ 处的元素为 $\mathbf H(i,j,k)=\sum_{r=1}^{R}[\mathbf S_r]_{ij}\phi_{r,k}$。

### B. 部分频谱观测模型

我们把在线频谱制图过程建模为 $T$ 个时隙，每隙持续 $\tau$ 秒，时隙索引为 $t\in\mathcal T=\{1,\dots,T\}$。在时隙 $t$，UAV 的网格坐标为 $\mathbf u_t\in\mathcal G$，高度为 $h_{\rm UAV}$。

UAV 把其工作带宽 $B$ 划分为 $N$ 个频率单元，并分配给感知与通信。每个感知单元监测一个频段。在时隙 $t$，所选感知比 $\rho_t\in\mathcal R$ 把 $n^s_t=\lceil\rho_tN\rceil$ 个单元分配给感知，其余单元用于通信；感知与通信带宽分别为 $B^s_t=(n^s_t/N)B$ 与 $B^c_t=B-B^s_t$。如图 2 所示，增大 $\rho_t$ 会把更多单元分配给感知，提供更宽的频谱覆盖，但增大分组尺寸并减少通信带宽。

UAV 感知以目标频段为中心的 $n^s_t$ 个连续频段。设 $\boldsymbol\omega_t\in\{0,1\}^K$ 为相应二值掩码：若频段 $k$ 被选中则 $[\boldsymbol\omega_t]_k=1$，否则为 0。因此 $\sum_{k=1}^{K}[\boldsymbol\omega_t]_k=n^s_t$。在频谱感知中，UAV 测量受小尺度衰落 $\eta^{(k)}_{r,t}\sim\mathcal N(0,\sigma_\eta^2)$ 与接收机噪声 $\epsilon^{(k)}_t\sim\mathcal N(0,\sigma_\epsilon^2)$ 影响；假定小尺度衰落扰动与接收机噪声样本在各频段间相互独立。聚合观测扰动为 $n^{(k)}_t=\sum_{r=1}^{R}\phi_{r,k}\eta^{(k)}_{r,t}+\epsilon^{(k)}_t$，且 $\mathbf n_t=[n^{(1)}_t,\dots,n^{(K)}_t]^\top$。稀疏宽带扫描向量为

$$
\mathbf y_t=\boldsymbol\omega_t\odot\left[\mathbf H(\mathbf u_t,:)+\mathbf n_t\right], \tag{3}
$$

其中 $\mathbf H(\mathbf u_t,:)=[\mathbf H(\mathbf u_t,1),\dots,\mathbf H(\mathbf u_t,K)]^\top$ 为 UAV 当前位置处的完整 PSD 向量。

**图 1：** 所提空地协同主动在线频谱制图框架的闭环信息流（不确定性指导采样位置与频段选择、UAV 感知与量化传输、UGV 支持与地图更新）。

### C. 通信与队列模型

在时隙 $t$，设 $\mathbf g_t\in\mathcal G_{\rm free}$ 为 UGV 的网格坐标，$\mathcal G_{\rm free}\subseteq\mathcal G$ 包含全部非建筑网格单元。建筑遮挡决定链路状态 $\sigma_t$ 为视距（LoS）或非视距（NLoS）。三维间距为

$$
d_t=\sqrt{\Delta_{\rm cell}^2\left\|\mathbf u_t-\mathbf g_t\right\|_2^2+\left(h_{\rm UAV}-h_{\rm UGV}\right)^2}, \tag{4}
$$

其中 $\Delta_{\rm cell}$ 把水平网格距离转换为米，$h_{\rm UGV}=0$ 对应地面。时隙 $t$ 的服务容量为

$$
C_t=\tau B^c_t\log_2\left(1+10^{\Upsilon^{\rm dB}_t/10}\right)
\mathcal I\left\{\Upsilon^{\rm dB}_t\ge\Upsilon^{\rm dB}_{\rm out}\right\}, \tag{5}
$$

其中 $\Upsilon^{\rm dB}_t$ 表示接收信噪比（SNR），成功数据送达要求该 SNR 达到中断阈值 $\Upsilon^{\rm dB}_{\rm out}$。在时隙 $t$，UAV 按所选比特深度 $b_t\in\mathcal B$ 量化 $\mathbf y_t$ 的已感知条目，并把所得索引编码为分组。分组尺寸为

$$
G_t=n^s_tG_{\rm band}\frac{b_t}{b_{\rm ref}}, \tag{6}
$$

其中 $G_{\rm band}$ 表示以参考比特深度 $b_{\rm ref}$ 感知一个频段所产生的载荷。设 $Q_t$ 为时隙 $t$ 开始时 UAV 的缓冲区占用，$Q_{\max}$ 为缓冲容量；尺寸为 $G_t$ 的新分组在传输前加入。若缓冲区溢出，则丢弃最早的完整分组，丢弃总尺寸记为 $G^{\rm drop}_t$。因此队列演进为

$$
Q_{t+1}=\max\left(Q_t+G_t-G^{\rm drop}_t-C_t,\ 0\right),\quad\forall t\in\mathcal T. \tag{7}
$$

分组按先入先出顺序服务，可能需要多个时隙才能完成传输。设 $\Delta\mathcal D_t$ 表示时隙 $t$ 完整传到 UGV 的数据分组，则 UGV 侧累计数据集为 $\mathcal D_t=\mathcal D_{t-1}\cup\Delta\mathcal D_t$（$\forall t\in\mathcal T$），并用于地图更新。

### D. UAV 能耗模型

UAV 能耗模型涵盖移动、频谱感知与通信。运动能耗为

$$
E^{\rm mov}_t=E_{\rm fly}\left\|\mathbf u_t-\mathbf u_{t-1}\right\|_1
+E_{\rm hov}\mathcal I\{\mathbf u_t=\mathbf u_{t-1}\}, \tag{8}
$$

其中 $E_{\rm fly}$ 为每穿越一个网格单元消耗的能量，$E_{\rm hov}$ 为悬停消耗。根据 [25]，在固定时隙时长下，感知更多频段消耗更多能量。我们把这种带宽依赖性与附加的多频段处理代价建模为

$$
E^{\rm sen}_t=E^{\rm sen}\frac{n^s_t\log_2\left(1+n^s_t\right)}
{n^s_{\max}\log_2\left(1+n^s_{\max}\right)}, \tag{9}
$$

其中 $n^s_{\max}$ 为最大允许感知分配，$E^{\rm sen}$ 为相应的感知能耗。设 $P^{\rm tx}_t$ 表示 UAV 发射功率（瓦），通信能耗建模为

$$
E^{\rm com}_t=P^{\rm tx}_t\tau. \tag{10}
$$

时隙 $t$ 的总能耗为 $E_t=E^{\rm mov}_t+E^{\rm sen}_t+E^{\rm com}_t$。设 $E_{\max}$ 表示 UAV 初始能量预算。

### E. 问题建模

我们把空地协同在线频谱制图表述为约束优化问题：在耦合的运行约束下联合自适应 UAV 的感知–送达选择，以最小化期望归一化均方误差（NMSE）。

在时隙 $t$ 开始时，UAV 策略 $\pi$ 选择 $\mathbf a^u_t=(\mathbf m^u_t,\rho_t,b_t)$，其中 $\mathbf m^u_t$ 表示 UAV 移动；UGV 规划器 $\mu$ 依据当前感知目标、用支持策略沿计划路径选择 UGV 移动 $\mathbf m^g_t$。这些决策决定 UAV 与 UGV 的位置 $\mathbf u_t$ 与 $\mathbf g_t$。经过 $T$ 个时隙后，地图估计为 $\hat{\mathbf H}_T$，相应 NMSE 为

$$
E_T=\frac{\left\|\hat{\mathbf H}_T-\mathbf H\right\|_F^2}{\left\|\mathbf H\right\|_F^2}, \tag{11}
$$

其中 $\mathbf H$ 为真实 PSD 无线电图。据此，我们建立问题 $\mathcal P_0$：

$$
\min_{\pi}\ \mathbb E_{\pi,\mu}\left\{E_T\right\}, \tag{12a}
$$
$$
\text{s.t.}\quad
\text{式 (7)},\ \forall t\in\mathcal T, \tag{12b}
$$
$$
Q_t+G_t-G^{\rm drop}_t\le Q_{\max},\ \forall t\in\mathcal T, \tag{12c}
$$
$$
\rho_t\in\mathcal R,\ b_t\in\mathcal B,\ \forall t\in\mathcal T, \tag{12d}
$$
$$
\sum_{t=1}^{T}\left(E^{\rm mov}_t+E^{\rm sen}_t+E^{\rm com}_t\right)\le E_{\max}. \tag{12e}
$$

问题 $\mathcal P_0$ 通过空地协同把频谱感知与测量送达耦合起来，从而最小化期望 NMSE。约束 (12b)–(12d) 分别规定队列演进、缓冲容量以及可行的感知与量化决策，约束 (12e) 限制 UAV 累计能量。$\rho_t$ 与 $b_t$ 的选择共同在重建质量与送达之间折中：增大 $\rho_t$ 感知更多频段但留下更少传输带宽；增大 $b_t$ 减小量化失真但增大分组。

**图 2：** 工作带宽在频谱感知与 UAV–UGV 通信之间的逐时隙分配（固定工作带宽下，感知比增大带来更大分组与更小链路容量）。

## III. 在线频谱制图

在线频谱制图需要高效的地图更新以支撑不确定性引导的感知。本节先回顾离线 TD 方法，再把它扩展到顺序送达的测量以实现在线重建；随后开发深度展开版本以加速。

### A. 张量分解回顾

给定含 $M$ 个测量的固定集合 $\mathcal D$，每个测量含位置 $\mathbf z_m$ 及相应的 PSD 测量，离线 TD [8] 拟合局部传播模型，以联合估计式 (2) 中的功率谱与空间传播场。对源 $r$，离线 TD 用局部多项式 $f_{r,ij}(\mathbf z)=\mathbf x_{ij}^\top\boldsymbol\theta_{r,ij}$ 近似网格单元 $(i,j)$ 中心附近的传播场，其中 $\mathbf x_{ij}(\mathbf z)$ 含以 $(i,j)$ 为中心的 $D_p$ 个多项式特征，相应系数向量为 $\boldsymbol\theta_{r,ij}\in\mathbb R^{D_p\times1}$。堆叠全部 $R$ 个系数向量得 $\boldsymbol\Theta_{ij}=[(\boldsymbol\theta_{1,ij})^\top,\dots,(\boldsymbol\theta_{R,ij})^\top]^\top$。源 $r$ 在网格单元 $(i,j)$ 处的传播估计为 $f_{r,ij}(i,j)=\mathbf e_r^\top\boldsymbol\Theta_{ij}\approx[\mathbf S_r]_{ij}$，其中 $\mathbf e_r\in\mathbb R^{D_pR\times1}$ 为选择向量，其第 $[(r-1)D_p+1]$ 个元素为 1、其余为 0。

PSD 测量记录在 $\boldsymbol\Gamma\in\mathbb R^{M\times K}$ 中。二值掩码 $\boldsymbol\psi\in\{0,1\}^{M\times K}$ 标识可用频段：若测量 $m$ 中频段 $k$ 可用则 $[\boldsymbol\psi]_{m,k}=1$，否则为 0。设 $\boldsymbol\Phi$ 汇集 $R$ 个源的 PSD，其第 $r$ 行为 $\boldsymbol\phi_r^\top\in\mathbb R^{1\times K}$。定义 $\mathbf X_{ij}=[\mathbf x_{ij}(\mathbf z_1),\dots,\mathbf x_{ij}(\mathbf z_M)]\in\mathbb R^{D_p\times M}$。对角矩阵 $\mathbf Q_{ij}\in\mathbb R^{M\times M}$ 含空间核权重，对靠近网格单元 $(i,j)$ 的测量赋予更大影响。空间权重与可用性掩码构成 $\mathbf W_{ij}=(\mathbf I_K\otimes\mathbf Q_{ij})\,{\rm diag}[{\rm vec}(\boldsymbol\psi)]$，其中 $\mathbf I_K$ 为 $K\times K$ 单位阵。相应回归残差为 $\mathbf r_{ij}(\boldsymbol\Theta_{ij},\boldsymbol\Phi)={\rm vec}(\boldsymbol\Gamma)-(\boldsymbol\Phi^\top\otimes\mathbf X_{ij}^\top)\boldsymbol\Theta_{ij}$。离线 TD 重建问题 $\mathcal P_1$ 表述为

$$
\begin{aligned}
\min_{\{\boldsymbol\Theta_{ij}\},\boldsymbol\Phi,\{\mathbf S_r\}}\quad
&\sum_{(i,j)\in\mathcal G}\left\|\mathbf W_{ij}\mathbf r_{ij}(\boldsymbol\Theta_{ij},\boldsymbol\Phi)\right\|_2^2\\
&+\nu\sum_{\substack{(i,j)\in\mathcal G\\ r=1,\dots,R}}\left(\mathbf e_r^\top\boldsymbol\Theta_{ij}-[\mathbf S_r]_{ij}\right)^2
+\lambda\sum_{r=1}^{R}\left\|\mathbf S_r\right\|_*\\
\text{s.t.}\quad &[\boldsymbol\Phi]_{r,k}\ge0,\ \forall r,k.
\end{aligned} \tag{13}
$$

问题 $\mathcal P_1$ 目标中的第一项最小化 PSD 测量与模型预测之间的加权残差；第二项强制局部估计 $\mathbf e_r^\top\boldsymbol\Theta_{ij}$ 与 $[\mathbf S_r]_{ij}$ 一致；第三项对 $\mathbf S_r$ 施加核范数正则以促进低秩传播场。离线 TD 通过交替更新 $\{\boldsymbol\Theta_{ij}\}$、$\boldsymbol\Phi$ 与 $\{\mathbf S_r\}$ 直至收敛来求解问题 $\mathcal P_1$，随后重建 $\hat{\mathbf H}=\sum_{r=1}^{R}\hat{\mathbf S}_r\circ\hat{\boldsymbol\phi}_r$。

### B. 基于在线 TD 的频谱制图

在时隙 $t$，这些定义应用于累计送达集 $\mathcal D_t$。随着新分组到达 UGV，重新执行离线 TD 会反复处理 $\mathcal D_{t-1}$，即便只到达少量样本。在线 TD 方法因此复用先前估计，同时保留式 (13) 的块交替结构：完整送达的测量累积为一批用于每次重建更新，更新之间估计保持不变；更新时仅对受上次重建以来累计测量影响的单元重新计算局部系数。

**$\boldsymbol\Theta_{ij}$ 的更新：** 设 $\mathbf M^{\rm aff}_t\in\{0,1\}^{N_x\times N_y}$ 为受影响单元掩码，若网格单元 $(i,j)$ 的空间核支撑覆盖累计批次中至少一个 UAV 样本则 $[\mathbf M^{\rm aff}_t]_{ij}=1$。对每个 $[\mathbf M^{\rm aff}_t]_{ij}=1$ 的单元，在线 TD 按下式更新局部系数：

$$
\boldsymbol\Theta_{ij,t}=\arg\min_{\boldsymbol\Theta_{ij}}
\left\|\mathbf W_{ij,t}\mathbf r_{ij,t}(\boldsymbol\Theta_{ij},\boldsymbol\Phi_{t-1})\right\|_2^2
+\nu\sum_{r=1}^{R}\left(\mathbf e_r^\top\boldsymbol\Theta_{ij}-[\mathbf S_{r,t-1}]_{ij}\right)^2. \tag{14}
$$

对 $[\mathbf M^{\rm aff}_t]_{ij}=0$ 的单元，在线 TD 保留 $\boldsymbol\Theta_{ij,t}=\boldsymbol\Theta_{ij,t-1}$。复用这些系数避免冗余计算并提升在线更新效率。

**$\boldsymbol\Phi$ 的更新：** 由于 $\boldsymbol\Phi$ 在各网格单元间共享，在线 TD 以 $\boldsymbol\Phi_{t-1}$ 初始化并求解

$$
\boldsymbol\Phi_t=\arg\min_{\boldsymbol\Phi\ge0}
\sum_{(i,j)\in\mathcal G}\left\|\mathbf W_{ij,t}\mathbf r_{ij,t}(\boldsymbol\Theta_{ij,t},\boldsymbol\Phi)\right\|_2^2. \tag{15}
$$

**$\mathbf S_r$ 的更新：** 在线 TD 构造 $\boldsymbol\Psi_{r,t}\in\mathbb R^{N_x\times N_y}$，其中 $[\boldsymbol\Psi_{r,t}]_{ij}=\mathbf e_r^\top\boldsymbol\Theta_{ij,t}$，并通过求解低秩子问题更新 $\mathbf S_r$：

$$
\mathbf S_{r,t}=\arg\min_{\mathbf S_r}
\nu\sum_{(i,j)\in\mathcal G}\left([\boldsymbol\Psi_{r,t}]_{ij}-[\mathbf S_r]_{ij}\right)^2
+\lambda\left\|\mathbf S_r\right\|_*. \tag{16}
$$

该子问题用迭代奇异值阈值（SVT）求解，并以 $\mathbf S_{r,t-1}$ 初始化。热启动复用前一解，减少收敛所需迭代数。

为使计算复杂度差异更明确，以下分析考虑 $N_x=N_y=N_g$ 的方阵网格。在每个交替迭代内，局部系数 $\boldsymbol\Theta_{ij}$ 仅在受影响网格单元处通过求解式 (14) 更新；共享谱矩阵 $\boldsymbol\Phi$ 通过式 (15) 用全网格聚合的残差信息更新。对固定的 $R$、$K$、$D_p$ 与固定迭代预算，这些更新的代价分别为 $O(\|\mathbf M^{\rm aff}_t\|_0|\mathcal D_t|)$ 与 $O(N_g^2|\mathcal D_t|)$。相反，$\mathbf S_r$ 的更新需要反复执行稠密奇异值分解（SVD）：以 $J_{\rm svt}$ 次迭代计，其代价为 $O(RJ_{\rm svt}N_g^3)$。总体上，$\boldsymbol\Theta$ 与 $\boldsymbol\Phi$ 的更新相对廉价，而反复 SVD 使 $\mathbf S_r$ 的更新成为主要计算瓶颈。

### C. 深度展开的在线频谱制图

深度展开把若干基于模型的迭代转换为可训练的网络阶段序列，同时保留算法结构 [26]。在无线电图估计 [27] 中，它把因子分解的凸恢复算法展开为可学习块，提升重建性能。在线 TD 保留了交替更新结构，因此天然适合深度展开。我们据此加速在线 TD：前述复杂度分析指出 $\mathbf S_r$ 的更新是主导瓶颈，于是把交替更新展开为固定阶段数，并用学习模块替代迭代 SVT，得到**在线深度展开张量分解（ODU-TD）**。这种选择性适配通过学习更新提升计算效率与估计精度；同时保留基于模型的局部插值与谱估计，维持测量、源谱与局部估计之间的显式关系，为插值误差分析提供局部解析结构。

如图 3 所示，ODU-TD 用卷积残差网络精炼空间传播场。该网络拼接三个输入：更新后的插值 $\boldsymbol\Psi^{(\ell+1)}_r$、上一阶段的源图 $\mathbf S^{(\ell)}_r$ 与受影响单元掩码 $\mathbf M^{\rm aff}_t$，从而把新信息与累积的空间结构结合。其卷积捕获超越全局核范数正则的邻域相关传播模式：输入卷积融合三者，残差块聚合邻域信息，输出卷积产生残差 $\Delta\mathbf S^{(\ell+1)}_r={\rm Prox}_{\vartheta_\ell}\{[\boldsymbol\Psi^{(\ell+1)}_r,\mathbf S^{(\ell)}_r,\mathbf M^{\rm aff}_t]\}$。更新后的空间传播图为

$$
\left[\mathbf S^{(\ell+1)}_r\right]_{ij}
=\ln\left(1+e^{\left[\boldsymbol\Psi^{(\ell+1)}_r\right]_{ij}
+\alpha_\ell\left[\Delta\mathbf S^{(\ell+1)}_r\right]_{ij}}\right),\quad (i,j)\in\mathcal G, \tag{17}
$$

其中 $\alpha_\ell$ 缩放对基于模型估计的修正，Softplus 保证非负性。

训练通过

$$
\mathcal L=\mathcal L_{\rm err}+\lambda_S\mathcal L_S+\lambda_{\rm obs}\mathcal L_{\rm obs} \tag{18}
$$

结合地图级、源图级与观测级监督，其中 $\lambda_S$ 与 $\lambda_{\rm obs}$ 为非负权重。主损失 $\mathcal L_{\rm err}$ 定义为重建与真实 PSD 地图之间的 NMSE；辅助项 $\mathcal L_S$ 监督各个源图，直接在组合张量误差之外约束空间精炼；$\mathcal L_{\rm obs}$ 惩罚观测条目处的失配，抑制与给定测量冲突的精炼。

学习模块通过局部卷积与逐点操作精炼每个源图。对深度、核尺寸与通道宽度固定的卷积神经网络（CNN），这些操作每个源图每阶段代价为 $O(N_g^2)$；在 $T_{\rm DU}$ 个阶段内精炼 $R$ 个源图，总代价为 $O(RT_{\rm DU}N_g^2)$。相比之下，SVT 每次稠密 SVD 的代价为 $O(N_g^3)$。表 II 比较了地图更新代价：在迭代数与阶段数固定时，用学习模块替代 SVT 把源图精炼的复杂度从 $N_g$ 的三次降为二次；固定阶段数也消除了交替更新中依赖收敛的重复。算法 1 汇总了完整更新过程。

**算法 1　基于 ODU-TD 的在线频谱制图**

输入：累计送达集 $\mathcal D_t$、上次重建以来新累积的测量、先前估计 $\{\boldsymbol\Theta_{ij,t-1}\}$、$\boldsymbol\Phi_{t-1}$、$\{\mathbf S_{r,t-1}\}$，以及训练好的阶段参数 $\{(\vartheta_\ell,\alpha_\ell)\}_{\ell=0}^{T_{\rm DU}-1}$

输出：重建地图 $\hat{\mathbf H}_t$ 与更新后的估计 $\{\boldsymbol\Theta_{ij,t}\}$、$\boldsymbol\Phi_t$、$\{\mathbf S_{r,t}\}$

1. 由累计批次中的样本位置构造 $\mathbf M^{\rm aff}_t$
2. 初始化 $\boldsymbol\Theta^{(0)}_{ij}=\boldsymbol\Theta_{ij,t-1}$、$\boldsymbol\Phi^{(0)}=\boldsymbol\Phi_{t-1}$、$\mathbf S^{(0)}_r=\mathbf S_{r,t-1}$
3. **for** $\ell=0,\dots,T_{\rm DU}-1$ **do**
4. 　**if** $[\mathbf M^{\rm aff}_t]_{ij}=1$ **then**
5. 　　按式 (14) 更新 $\boldsymbol\Theta^{(\ell+1)}_{ij}$
6. 　**else**
7. 　　置 $\boldsymbol\Theta^{(\ell+1)}_{ij}=\boldsymbol\Theta^{(\ell)}_{ij}$
8. 　**end if**
9. 　按式 (15) 更新 $\boldsymbol\Phi^{(\ell+1)}$
10. 　**for** $r=1,\dots,R$ **do**
11. 　　构造 $[\boldsymbol\Psi^{(\ell+1)}_r]_{ij}=\mathbf e_r^\top\boldsymbol\Theta^{(\ell+1)}_{ij}$
12. 　　计算 $\Delta\mathbf S^{(\ell+1)}_r={\rm Prox}_{\vartheta_\ell}\{[\boldsymbol\Psi^{(\ell+1)}_r,\mathbf S^{(\ell)}_r,\mathbf M^{\rm aff}_t]\}$
13. 　　按式 (17) 更新 $\mathbf S^{(\ell+1)}_r$
14. 　**end for**
15. **end for**
16. 置 $\boldsymbol\Theta_{ij,t}=\boldsymbol\Theta^{(T_{\rm DU})}_{ij}$、$\boldsymbol\Phi_t=\boldsymbol\Phi^{(T_{\rm DU})}$、$\mathbf S_{r,t}=\mathbf S^{(T_{\rm DU})}_r$
17. 构造 $\hat{\mathbf H}_t=\sum_{r=1}^{R}\mathbf S_{r,t}\circ\boldsymbol\phi_{r,t}$

**表 II：** 在线 TD 与 ODU-TD 的计算复杂度。

| 组成 | 在线 TD | ODU-TD |
|---|---|---|
| 更新轮数 | $J_{\rm alt}$ 次迭代 | $T_{\rm DU}$ 个阶段（固定） |
| 局部拟合 $\boldsymbol\Theta$ | $O(J_{\rm alt}\lVert\mathbf M^{\rm aff}_t\rVert_0\lvert\mathcal D_t\rvert)$ | $O(T_{\rm DU}\lVert\mathbf M^{\rm aff}_t\rVert_0\lvert\mathcal D_t\rvert)$ |
| 谱 $\boldsymbol\Phi$ | $O(J_{\rm alt}N_g^2\lvert\mathcal D_t\rvert)$ | $O(T_{\rm DU}N_g^2\lvert\mathcal D_t\rvert)$ |
| 地图精炼 $\mathbf S_r$ | $O(RJ_{\rm alt}J_{\rm svt}N_g^3)$ | $O(RT_{\rm DU}N_g^2)$ |
| 稠密 SVD 次数 | $RJ_{\rm alt}J_{\rm svt}$ | 0 |

**图 3：** 所提 ODU-TD 网络结构（拼接更新插值、上一阶段源图与受影响单元掩码，经输入卷积、残差块与输出卷积产生修正，再经 Softplus 更新源图）。

## IV. 测量量化与比特深度选择

UAV 在把 PSD 测量发往 UGV 之前先对其进行量化，以减小带宽受限空地链路上的载荷。较低比特深度减少传输比特数，但可能增大量化失真并损害频谱重建。因此我们推导比特深度相关的插值误差模型，以指导通信载荷与重建精度之间的折中。

### A. 对数域量化

PSD 测量通常跨越很宽的动态范围，多数取值集中在零附近，并向更高功率形成长尾 [22]，如图 4(a) 所示。线性域均匀量化在整个范围内使用恒定绝对步长，导致低功率测量的相对分辨率很粗。因此我们在均匀量化之前施加对数变换，以展开这些密集聚簇的低功率值，如图 4(b) 所示。对数域中的等步长对应原始 PSD 域中的非均匀电平：低功率处绝对间距更细，高功率处更宽 [28]。

为分析测量量化如何影响频谱制图性能，我们在把观测变换到对数域后施加 $b$ 比特均匀量化器。同一标量量化规则分别作用于每个 PSD 测量，因此条件误差分析在各频段形式相同。于是我们固定任意频段 $k$，并把第 $m$ 个线性尺度 UAV PSD 测量写为 $y_m\equiv y^{(k)}_m\ge0$，从相关量化变量中省略上标 $(k)$。定义对数域观测为 $z_m=\ln(y_m+\epsilon_0)$，其中 $\epsilon_0>0$ 避免对零取对数。对给定比特深度 $b$，在固定范围 $[z_{\min},z_{\max}]$ 上定义量化间隔 $\Delta_z=(z_{\max}-z_{\min})/(2^b-1)$。接收后，UGV 得到去量化的对数域观测

$$
\hat z_m=z_{\min}+\Delta_z\left\lfloor\frac{z_m-z_{\min}}{\Delta_z}\right\rceil, \tag{19}
$$

而线性域观测为 $\hat y_m=e^{\hat z_m}-\epsilon_0$。

我们用高分辨率伪量化噪声模型 [28], [29] 刻画失真，该模型假定对数域量化误差与未量化观测独立、且在一个量化间隔上均匀分布。相应的线性域量化误差为 $e_{q,m}=\hat y_m-y_m$。中心化量化误差定义为 $\tilde e_{q,m}(b)\triangleq e_{q,m}-\mathbb E[e_{q,m}|y_m]$。

**命题 1（等效线性域加性噪声表示）.** 在高分辨率伪量化噪声模型下，中心化量化误差 $\tilde e_{q,m}(b)$ 满足

$$
\mathbb E\left[\tilde e_{q,m}(b)\,\middle|\,y_m\right]=0, \tag{20a}
$$
$$
{\rm Var}\left[\tilde e_{q,m}(b)\,\middle|\,y_m\right]
=(y_m+\epsilon_0)^2\left\{\frac{\Delta_z^2}{12}+O\left(\Delta_z^4\right)\right\}. \tag{20b}
$$

**证明：** 见附录 A。

**注（Remark）：** 命题 1 给出了把量化比特深度与局部插值误差方差联系起来所需的等效噪声模型。由于量化在对数域进行而 TD 估计器作用于线性尺度测量，均匀对数域量化误差无法直接用于后续插值误差分析；经反对数变换后，它成为由条件偏置 $\mathbb E[e_{q,m}|y_m]$ 与中心化量化误差 $\tilde e_{q,m}(b)$ 组成的线性域失真。中心化误差可直接纳入插值误差分析，而偏置不影响方差计算。

**图 4：** 对数变换前后的 PSD 分布：(a) 变换前；(b) 变换后。

### B. 重建引导的比特深度选择

为确定合适的在线比特深度，我们考察命题 1 刻画的量化噪声如何影响局部 TD 估计。回顾 $\mathbf e_r^\top\boldsymbol\Theta_{ij}$ 估计源 $r$ 在网格单元 $(i,j)$ 处的传播场值。对以比特深度 $b$ 量化的测量，设 $\hat{\boldsymbol\Theta}_{ij}(b)$ 为所得系数估计，定义插值误差为 $e^r_{ij}(b)=\mathbf e_r^\top\hat{\boldsymbol\Theta}_{ij}(b)-[\mathbf S_r]_{ij}$，它度量其相对真实传播场值的偏差。为隔离量化比特深度的影响，我们在采样与估计设置固定不变的前提下分析局部 TD 更新。

**命题 2（TD 插值误差方差的比特深度标定）.** 在上述局部 TD 估计器与量化噪声下，中高比特区间内插值误差方差对量化比特深度具有如下近似依赖：

$$
{\rm Var}\left[e^r_{ij}(b)\right]\approx a\left(2^b-1\right)^{-2}+c, \tag{21}
$$

其中 $a\ge0$ 与 $c$ 均与 $b$ 无关。

**证明：** 见附录 B。

所得插值误差模型表明：在中高比特深度下，局部插值误差方差与 $x=(2^b-1)^{-2}$ 之间呈仿射关系。随后我们离线检验 NMSE 是否遵循对 $x$ 的相同依赖：对每个观测比，把随机采样的测量在不同比特深度上量化，用固定模型由这些测量重建 PSD 地图，并在中高比特区间拟合 ${\rm NMSE}=a_\rho x+c_\rho$。图 5 给出各测试量化比特深度下的拟合误差：2 比特与 4 比特量化相对拟合模型偏差较大，而其余测试比特深度的拟合误差相对较小。为平衡量化精度与传输载荷，我们选择 $\mathcal B=\{6,8,10\}$ 作为 UAV 策略的候选比特深度。

**图 5：** 不同观测比下相对拟合 NMSE 模型的偏差，其中 $\Delta{\rm NMSE}={\rm NMSE}_{\rm quant}-(a_\rho x+c_\rho)$。

## V. 空地车辆协同

城市遮挡可能中断测量送达，这促使人们使用移动 UGV 支撑通信与在线重建。本节把在线重建与量化整合进空地协同框架，将不确定性引导的 UAV 感知与送达同 UGV 重定位与支持耦合起来。

### A. 不确定性引导的 UAV 感知

集成方法组合多个估计器的预测，以其分歧产生不确定性。UGV 随后在相同送达观测上评估 $N_{\rm ens}$ 个成员，各估计为 $\hat{\mathbf H}^{(e)}_t$。在 $\sum_{e=1}^{N_{\rm ens}}w_{e,t}=1$ 下，其加权平均为 $\bar{\mathbf H}_t=\sum_{e=1}^{N_{\rm ens}}w_{e,t}\hat{\mathbf H}^{(e)}_t$，所得不确定性为

$$
U_t(i,j,k)=\sum_{e=1}^{N_{\rm ens}}w_{e,t}
\left[\hat{\mathbf H}^{(e)}_t(i,j,k)-\bar{\mathbf H}_t(i,j,k)\right]^2. \tag{22}
$$

> **原文疑点：** 式 (22) 引入了集成权重 $w_{e,t}$（满足 $\sum_{e=1}^{N_{\rm ens}}w_{e,t}=1$），但正文未说明其如何确定（例如等权、按验证误差加权或随地图更新动态调整），也未说明集成成员 $N_{\rm ens}$ 的取值。本译按原文照录并加注。

利用不确定性图，规划器先对频率取平均得到位置级不确定性 $[U^{\rm sp}_t]_{ij}=K^{-1}\sum_{k=1}^{K}U_t(i,j,k)$。为确定目标频段，规划器定义频率感知分数

$$
S^f_t(i,j,k)=U_t(i,j,k)-\beta_fV_t(i,j,k), \tag{23}
$$

其中 $V_t$ 含归一化访问计数，$\beta_f$ 惩罚重复的频段选择。每个候选单元上分数最高的未观测频段进入联合目标选择。设 $\mathcal C^u_t$ 含当前搜索范围内、至少有一个未观测频段的采样有效网格单元。对每个候选网格单元 $(i,j)$，$\hat k_t(i,j)$ 表示其在式 (23) 中频率感知分数最大的未观测频段。目标位置选为

$$
\mathbf v^\star=\arg\max_{(i,j)\in\mathcal C^u_t}
\left\{\lambda_u\left[U^{\rm sp}_t\right]_{ij}+S^f_t\left[i,j,\hat k_t(i,j)\right]\right\}. \tag{24}
$$

这里 $\lambda_u$ 平衡空间信息量与频率特定信息量。于是 $\mathbf v^\star$ 与 $\hat k_t(\mathbf v^\star)$ 分别给出所选位置与频段。为限制搜索复杂度，$\mathcal C^u_t$ 通常限制在配置的 Manhattan 邻域内。若平均局部不确定性的相对改善连续两次地图更新低于 0.08，规划器临时转为全局搜索，并在出现两个附近候选后恢复局部搜索。

### B. 预测式 UGV 支持规划

感知目标被选出以引导 UAV，而不考虑 UGV 能否到达该处提供通信支持。单纯跟随该目标可能无法预判 UAV 沿途的遮挡，延迟 UGV 对链路退化的响应。UAV 负责感知与测量送达，用学习策略联合控制带宽分配、量化比特深度与移动。相反，UGV 的作用更简单：移动到合适位置提供通信与计算支持。因此，队列感知的预测式支持规划（QPSP）规划器比学习策略更适合 UGV 支持。

QPSP 规划器有两种模式：预测式支持与恢复，分别如图 6(a) 与 (b) 所示。在预测式支持中，它预测从 $\mathbf u_t$ 朝 $\mathbf v^\star$ 的 $x$ 优先与 $y$ 优先 Manhattan 路线，每条路线限制为 $H_p$ 个 UAV 位置；把这些位置映射到最近可通行单元并去重，得到候选支持位置。对每个候选，规划器用大尺度信道模型与当前通信带宽计算各条路线的链路可用比与平均容量（低于中断阈值时容量记为零）。距 UGV 特定 Manhattan 距离内的候选获得优先级；在每个优先组内，候选依次按 1）两条路线中较低的链路可用比、2）较低的路线级平均容量、3）两条路线的平均容量排序。排名最高的位置成为支持目标 $\mathbf q^\star_t$。

当排队数据经历中断，或高积压与持续服务不足同时出现时，规划器切换到恢复模式。在中断或高积压期间，它识别距当前 UAV 位置最近的可达地面单元，用有界 A* 搜索生成一条从 UGV 朝该单元的地面路径；规划器在该路径及其邻近可通行单元中寻找通信支持位置以恢复服务。一旦链路保持健康且积压足够低，规划器恢复预测式支持。两种模式下，UGV 均沿四邻域 A* 路径朝当前支持目标 $\mathbf q^\star_t$ 移动。

**图 6：** UGV 的预测式与恢复式支持规划：(a) 预测式支持；(b) 恢复式支持。

### C. UAV 策略设计与训练

在由 $\mu$ 确定 UGV 支持后，UAV 策略学习利用重建与不确定性信息来协调感知与送达。

**1）观测与状态空间：** 行为者观测 $\mathbf o^u_t$ 结合重建不确定性、感知目标以及队列与信道状态，以协调有信息量的感知与测量送达；UAV 位置、剩余能量、当前带宽分配与 UAV–UGV 相对几何进一步为其移动与资源分配提供信息。训练时，评价者状态 $\mathbf s^c_t$ 在这些观测之外补充重建 NMSE、地图更新状态与规划器特征，以估计期望回报。

**2）动作空间：** 在时隙 $t$，UAV 动作为 $\mathbf a^u_t=(\mathbf m^u_t,\rho_t,b_t)$。移动分量 $\mathbf m^u_t\in\{{\rm stay},E,N,W,S\}$ 规定 UAV 保持静止或向东、北、西、南移动；另两个分量 $\rho_t\in\mathcal R$ 与 $b_t\in\mathcal B$ 分别规定感知带宽比与量化比特深度。

**3）奖励设计：** 基于 NMSE 的重建奖励是稀疏的，因为只有地图更新时才可得。为提供中间反馈、引导感知与传输决策，我们引入辅助奖励并定义整形奖励

$$
r_t=\lambda_Nr^N_t+\lambda_Qr^Q_t+\lambda_Pr^P_t+\lambda_Rr^R_t, \tag{25}
$$

其中 $\lambda_N$、$\lambda_Q$、$\lambda_P$、$\lambda_R$ 平衡四个奖励分量。重建奖励 $r^N_t$ 在送达测量更新地图时鼓励 NMSE 下降；队列惩罚 $r^Q_t$ 抑制积压与丢包，促进感知负载与传输服务之间的协调；为在地图更新之间引导移动，$r^P_t$ 奖励朝感知目标前进、惩罚远离；最后，$r^R_t$ 惩罚在采样位置未带来新频率观测的感知，抑制感知与传输资源的冗余使用。

**4）策略训练：** 相较原始策略梯度，近端策略优化（PPO）[30] 通过目标裁剪抑制过大的策略更新，因而适合离散 UAV 动作与非对称 actor–critic 训练。每次更新时，广义优势估计（GAE）利用收集的奖励与评价者估计计算优势与回报目标。训练损失为

$$
L(\vartheta_a,\vartheta_c)=\mathbb E_t\left[
L^A_t(\vartheta_a)+c_vL^V_t(\vartheta_c)+c_eL^E_t(\vartheta_a)
\right]. \tag{26}
$$

这里 $L^A_t$ 为限制大幅策略变化的负裁剪代理目标，$L^V_t$ 为拟合回报目标的裁剪价值损失，熵损失 $L^E_t$ 为负的策略熵（其最小化鼓励探索），系数 $c_v$ 与 $c_e$ 为后两项加权。actor 与 critic 用该损失在所收集交互的小批量上优化。

算法 2 汇总了在预训练重建集成与 UGV 控制器 $\mu$ 下训练 UAV 策略的过程。每个回合从一个由任务前测量 $\mathcal D_0$ 重建的初始地图开始，其不确定性指导感知目标选择；随后 UAV 在 UGV 支持下采集并传输测量，而 UGV 侧的地图更新为后续决策提供不确定性反馈。每 $L$ 个交互步后，GAE 为 actor 与 critic 的 PPO 更新提供优势与回报估计；训练持续 $N_{\rm upd}$ 次策略更新。

**算法 2　带 UGV 支持的 UAV 策略训练**

输入：环境、预训练集成、目标规划器、$\mu$、重建批大小、$L$、$N_{\rm upd}$、$\mathcal D_0$

输出：训练好的参数 $\vartheta_a,\vartheta_c$

1. 初始化 $\vartheta_a,\vartheta_c$
2. **for** $N_{\rm upd}$ 次策略更新 **do**
3. 　清空 rollout 缓冲区
4. 　**for** $L$ 个交互步 **do**
5. 　　获取 $\mathbf o^u_t,\mathbf s^c_t$
6. 　　采样可行动作 $\mathbf a^u_t\sim\pi_{\vartheta_a}(\cdot|\mathbf o^u_t)$
7. 　　用 $\mu$ 选择 $\mathbf m^g_t$
8. 　　执行 UAV 与 UGV 动作
9. 　　按式 (7) 更新 $Q_{t+1}$
10. 　　$\mathcal D_t\leftarrow\mathcal D_{t-1}\cup\Delta\mathcal D_t$
11. 　　把 $\Delta\mathcal D_t$ 追加到待处理批次
12. 　　**if** 重建批次就绪 **then**
13. 　　　用算法 1 更新估计地图
14. 　　　按式 (22) 计算 $U_t$
15. 　　**end if**
16. 　　按式 (25) 计算 $r_t$
17. 　　刷新感知目标
18. 　　存储 rollout 数据与回合结束标志
19. 　**end for**
20. 　计算 GAE 优势与回报
21. 　按式 (26) 更新 $\vartheta_a,\vartheta_c$
22. **end for**

## VI. 实验评估

### A. 数据集设置

我们用 RadioMapSeer 与 ARM-Omni 数据集的大尺度传播场构建 PSD 无线电图数据集。RadioMapSeer 提供城市建筑布局与基于物理的无线电传播图 [31]，ARM-Omni 提供低空航空无线电图 [32]。传播场被裁剪为 $100\times100$ 的网格场景。

按照频谱制图所用的 TD 模型 [6]–[8], [22]，我们为每个空间场独立合成 8 个非负功率谱 $\boldsymbol\phi\in\mathbb R_+^{K}$，取 $K=30$。每个谱由平方 sinc 分量构成并归一化，使 $\sum_{k=1}^{K}\phi_k=K$。按式 (2) 把每个谱与一个空间场配对，得到每个基础场景 8 个 $100\times100\times30$ 的稠密 PSD 张量。该构造在保留源场衰减与遮挡模式的同时引入多样的频域结构，代表性切片如图 7 所示。所得数据集含 1,504 个基础场景与 12,032 个 PSD 张量；基础场景按 80%/10%/10% 的比例划分为训练、验证与测试子集。表 III 与表 IV 汇总仿真与训练设置。

**表 III：** 仿真参数。

| 环境与移动性 | 取值 | 感知与通信 | 取值 |
|---|---|---|---|
| 网格间距 $\Delta_{\rm cell}$ | 2 m/单元 | 带宽 $B$ | 100 MHz |
| 建筑高度 | 25 m | 带宽单元数 $N$ | 12 |
| UAV 高度 $h_{\rm UAV}$ | 30 m | 载频 $f_c$ | 3.5 GHz |
| UAV 步长 | 4 单元 | 中断阈值 $\Upsilon^{\rm dB}_{\rm out}$ | −5 dB |
| UGV 步长 | 5 单元 | 缓冲容量 $Q_{\max}$ | 512 Mbits |
| 能量预算 $E_{\max}$ | 9 kJ | 每频段载荷 $G_{\rm band}$ | 8 Mbits |
| 每单元飞行能耗 $E_{\rm fly}$ | 12 J | 最大感知能耗 $E^{\rm sen}$ | 5 J |
| 悬停能耗 $E_{\rm hov}$ | 8 J | | |

**图 7：** 所构建数据集中的代表性真实 PSD 地图（列为三个场景，行为 $k=5,15,25$）。

**表 IV：** 训练超参数。

| ODU-TD 训练 | 取值 | PPO 训练 | 取值 |
|---|---|---|---|
| 展开阶段数 $T_{\rm DU}$ | 3 | 优化器 | Adam |
| 优化器 | AdamW | 学习率 | $10^{-4}$ |
| 学习率 | $10^{-4}$ | 折扣因子 $\gamma$ | 0.99 |
| 批大小 | 16 | GAE 参数 $\lambda_{\rm GAE}$ | 0.95 |
| 训练轮数 | 150 | 裁剪系数 $\epsilon_{\rm PPO}$ | 0.2 |
| | | 回合时域 $T$ | 160 |
| | | 每次更新的轮数 | 6 |

### B. 在线频谱制图评估

为在在线设置下评估频谱制图算法，我们通过逐次加入 UAV 测量来模拟顺序到达。离线 TD、在线 TD 与 ODU-TD 接收相同的有序测量，并在每次加入后重建同一 PSD 地图。我们记录每次更新后的 NMSE，并测量整个序列上的模块级与累计求解时间。

表 V 表明，$\mathbf S_r$ 更新中反复执行的 SVT 主导了在线 TD，耗时约 183 ms；用学习到的近端模块替代 SVT 后，完整更新从 185.69 ms 降至 3.35 ms。$\boldsymbol\Theta$ 与 $\boldsymbol\Phi$ 的更新耗时相当，证实选择性替换 $\mathbf S_r$ 更新消除了主要瓶颈。

**表 V：** 每次重建更新的平均运行时间。

| 方法 | $\boldsymbol\Theta_{ij}$（ms） | $\boldsymbol\Phi$（ms） | $\mathbf S_r$（ms） | 合计（ms） |
|---|---|---|---|---|
| ODU-TD | 1.43 | 1.19 | 0.73 | 3.35 |
| 在线 TD | 1.45 | 1.07 | 183.16 | 185.69 |
| 离线 TD | 15.13 | 2.34 | 403.51 | 420.98 |

**图 8：** 相同有序 UAV 测量下，每次加入样本后各频谱制图方法的 NMSE。

图 8 表明，ODU-TD 在早期采样阶段更快降低 NMSE，并保持低于两个基线的更平滑轨迹。初始阶段测量与空间覆盖有限，使离线 TD 与在线 TD 的局部拟合约束不足；新增样本可能显著改变这些拟合，并通过共享谱因子与低秩耦合影响观测较少区域的估计，从而可能造成 NMSE 的暂时上升。相反，ODU-TD 把新测量信息与先前估计捕获的空间结构结合，降低了对单样本加入的敏感性；其学习到的卷积先验也捕获了超越全局核范数正则的局部模式，支撑更稳定的更新与更低的重建误差。总体上，ODU-TD 用时 1.58 s，而在线 TD 用时 42.87 s，通过以固定深度卷积更新替代反复 SVT 获得约 27 倍加速。

> **原文疑点：** 加速比存在两种口径：按整个采样序列的累计时间计约为 27 倍（42.87 s → 1.58 s），而按表 V 的单次重建更新计约为 55 倍（185.69 ms → 3.35 ms）。二者差异应源于累计时间中还包含更新间数据处理等开销，但原文未显式说明，本译按原文照录并加注。

**图 9：** 各方法在相同采样位置下 $k=5,15,25$ 的代表性 PSD 无线电图切片。

图 9 在相同采样位置下比较各方法的真实与重建 PSD 地图切片。ODU-TD 的最终 NMSE 为 0.0063，离线 TD 为 0.0259、在线 TD 为 0.0270。两个基线都在建筑边界附近产生条带伪影并模糊局部衰减，ODU-TD 更好地保留了这些结构，且条带类伪影更少。

### C. 空地协同策略评估

**1）对比方法：**
- **Fixed-UGV：** UGV 固定在一个支持位置，UAV 使用相同 actor 架构但单独训练的策略。
- **Greedy-A*：** UAV 使用不确定性引导的非学习移动与启发式感知、量化选择；UGV 使用无恢复切换的预测式双路径 A* 支持。
- **Target-Only A*：** 仅 UAV 的 PPO 与直接朝感知目标路由的 UGV 配对；该基线省略了预测式链路评分与恢复切换。
- **MAPPO 与 IPPO：** 多智能体 PPO 与独立 PPO 都学习 UAV 与 UGV 的动作 [33], [34]。
- **HAPPO：** 异构智能体 PPO 对 UAV 与 UGV 施加顺序策略更新 [35], [36]。
- **Random：** 对 UAV 与 UGV 均匀采样可行动作。

**2）评估指标：** 评估用三个互补指标刻画重建精度、有限时域测量服务与空地链路可靠性。

**NMSE：** 式 (11) 的 NMSE 度量重建 PSD 无线电图精度，是主要任务级指标；NMSE 越低表示恢复越忠实，越高表示重建性能越差。

**分组服务完成：** 设 $B_{\rm prod}=\sum_{t=1}^{T}G_t$ 为总生成载荷，$B_{\rm cmp}$ 为任务结束时完整送达分组的载荷。分组服务完成比为

$$
\eta_{\rm cmp}=
\begin{cases}
\dfrac{B_{\rm cmp}}{B_{\rm prod}}, & B_{\rm prod}>0,\\[4pt]
1, & B_{\rm prod}=0,
\end{cases} \tag{27}
$$

其中当未生成任何载荷时按惯例取 $\eta_{\rm cmp}=1$。对 $B_{\rm prod}>0$，它度量生成载荷中在任务结束前完整送达且可用的比例，因此评估感知、量化与信道服务在有限任务时域内被协调得如何。高比例表明所选感知比与量化比特深度产生的测量负载可由可用空地链路支撑；反之，低比例揭示生成负载与链路服务能力失配，导致任务结束时队列累积。

**中断比：** 任务时隙中处于中断的比例为

$$
\eta_{\rm out}=\frac{1}{T}\sum_{t=1}^{T}
\mathcal I\left\{\Upsilon^{\rm dB}_t(\mathbf u_t,\mathbf g_t,\rho_t)<\Upsilon^{\rm dB}_{\rm out}\right\}. \tag{28}
$$

中断比越低表示空地连接越持久、测量传输机会越稳定；越高表示服务反复中断，增大队列累积与丢包风险。该指标重要，因为持续的链路可用性维系着在线地图更新所需的测量流。

**3）移动 UGV 与固定 UGV 支持对比：** 图 10 在含量化传输的代表性回合中比较 Fixed-UGV 与所提框架。Fixed-UGV 反复中断导致 21.88% 的中断比，使分组服务完成比降至 59.19%，最终 NMSE 停留在 0.3146；相反，所提框架保持零中断与 100% 完成，使连续重建更新得以进行，并把最终 NMSE 降至 0.0125。NMSE 与完成比的耦合变化表明，移动支持通过维系测量服务改善了重建，尤其是 UAV 穿越遮挡区域时。

**图 10：** 在一个含量化传输的回合中，Fixed-UGV 与所提框架的逐时隙对比：(a) UAV–UGV 链路 SNR（含中断阈值）；(b) 累计分组服务完成比；(c) 在线 NMSE。

**4）量化传输的影响：** 图 11 比较每个策略在量化前后的表现。对所提框架，量化把平均 NMSE 从 0.0511 降至 0.0454、中断从 7.16% 降至 5.26%，同时完成比从 98.38% 升至 99.62%。Greedy-A* 在三个指标上也呈现相同有利方向。相反，多智能体策略虽获得更低 NMSE，却招致更高中断，MAPPO 与 IPPO 的分组服务完成比也更低。因此，减小的载荷只有在移动策略把释放出的传输容量转化为持续测量服务时，才改善端到端性能。

**图 11：** 七种策略在未量化（空心方块）与量化（实心圆点）传输下的成对性能：(a) 平均最终 NMSE；(b) 平均中断比；(c) 平均分组服务完成比（图中标注相对变化百分比）。

**5）总体性能：** 表 VI 表明，所提框架取得最低 NMSE 0.0454 与最低中断比 5.26%，二者均比 Greedy-A* 低 23% 以上；同时取得最高完成比 99.62%，相对最佳基线提升 4.49%。这些结果共同表明，该框架在易受遮挡的城市场景中实现了准确的在线频谱制图，同时维持可靠链路并送达几乎全部生成的测量载荷。

**表 VI：** 各策略的平均性能。

| 方法 | NMSE ↓ | 中断比（%）↓ | 完成比（%）↑ |
|---|---|---|---|
| 所提 | 0.0454 | 5.26 | 99.62 |
| Greedy-A* | 0.0591 | 6.85 | 92.87 |
| Target-Only A* | 0.0649 | 18.80 | 89.16 |
| MAPPO | 0.0750 | 35.55 | 88.31 |
| IPPO | 0.1646 | 45.13 | 60.47 |
| HAPPO | 0.0966 | 28.85 | 90.34 |
| Random | 0.1706 | 13.31 | 95.34 |

## VII. 结论

本文针对 UAV 资源约束与城市遮挡下的主动在线频谱制图，提出了一种空地协同框架。深度展开重建实现了及时的地图更新，而插值误差分析指导量化比特深度选择，以平衡测量保真度与传输负载。通过不确定性引导的反馈闭环，该框架把 UAV 同时进行的感知与传输同 UGV 的移动通信与计算支持协调起来。实验表明，所提重建方法有效加速了在线地图更新；在城市场景中，所提框架相较所评估基线表现出更低重建误差、更少通信中断与更完整的测量送达。未来工作将处理未知、时变环境，并把该框架扩展到支持多 UAV 与多 UGV 之间的协同。

## 附录 A　命题 1 的证明

**证明：** 沿用命题 1 的记号，令 $\Delta=\Delta_z$，并定义对数域量化误差为 $q\triangleq\hat z_m-z_m$。利用 $\hat z_m=z_m+q$，反对数变换给出 $\hat y_m=(y_m+\epsilon_0)e^q-\epsilon_0$，因此线性域量化误差为 $e_{q,m}=(y_m+\epsilon_0)(e^q-1)$。

在伪量化噪声模型下，$q$ 与 $y_m$ 独立，且在 $[-\Delta/2,\Delta/2]$ 上均匀分布。其一阶指数矩为 $\mathbb E[e^q]=\frac{1}{\Delta}\int_{-\Delta/2}^{\Delta/2}e^u\,du=\frac{2\sinh(\Delta/2)}{\Delta}$；类似地 $\mathbb E[e^{2q}]=\sinh(\Delta)/\Delta$。在 $x=0$ 处的 Taylor 展开 $\sinh(x)=x+x^3/6+O(x^5)$ 给出 $\mathbb E[e^q]=1+\Delta^2/24+O(\Delta^4)$。由于 $q$ 与 $y_m$ 独立，对 $e_{q,m}$ 取条件期望得 $\mathbb E[e_{q,m}|y_m]=(y_m+\epsilon_0)\left\{\frac{\Delta^2}{24}+O(\Delta^4)\right\}$。

按前述定义，中心化量化误差为 $\tilde e_{q,m}(b)=(y_m+\epsilon_0)\{e^q-\mathbb E[e^q]\}$。由构造，其条件均值为 $\mathbb E[\tilde e_{q,m}(b)|y_m]=0$；其条件方差可表示为

$$
{\rm Var}\left[\tilde e_{q,m}(b)\,\middle|\,y_m\right]
=(y_m+\epsilon_0)^2\left[\frac{\Delta^2}{12}+O\left(\Delta^4\right)\right]. \tag{29}
$$

## 附录 B　命题 2 的证明

**证明：** 我们恢复频段索引 $k$，以进行跨频段的联合分析。假定对数域量化误差在不同测量与频段之间相互独立，且与未量化观测独立。对命题 1 中的中心化误差，对条件方差取平均得频段 $k$ 中的协方差：

$$
\boldsymbol\Sigma_{q,k}(b)\triangleq{\rm diag}\left(
\left\{\mathbb E\left[{\rm Var}\left(\tilde e^{(k)}_{q,m}(b)\,\middle|\,y^{(k)}_m\right)\right]\right\}_{m}\right).
$$

沿用 [8]，考虑网格单元 $(i,j)$ 处的单源局部估计，取 $\nu=0$ 且法方程矩阵非奇异；在 $b$ 变化时，固定采样位置、观测频段、空间权重、源谱与未量化测量分布。设 $\Omega$ 表示已观测频段集合。省略时隙索引 $t$，定义 $\mathbf A_1=\mathbf X_{ij}\mathbf Q_{ij}^2\mathbf X_{ij}^\top$ 与 $\mathbf A_2=\mathbf X_{ij}\mathbf Q_{ij}^4\mathbf X_{ij}^\top$。令 $\mathbf e^r_{ij}$ 堆叠 $k\in\Omega$ 上经谱缩放的衰落、接收机噪声与中心化量化误差。记 $\boldsymbol\phi=[\phi_k]^\top_{k\in\Omega}$，则局部法方程中的噪声项为 $\boldsymbol\xi_{ij}\triangleq(\boldsymbol\phi^\top\otimes\mathbf X_{ij}\mathbf Q_{ij}^2)\mathbf e^r_{ij}$。$\mathbf e^r_{ij}$ 中嵌入的量化分量为

$$
\mathbf C_{q,ij}(b)\triangleq\sum_{k\in\Omega}
\phi_k^2\mathbf X_{ij}\mathbf Q_{ij}^2\boldsymbol\Sigma_{q,k}(b)
\mathbf Q_{ij}^2\mathbf X_{ij}^\top. \tag{30}
$$

假定衰落、接收机噪声与中心化量化误差互不相关，则

$$
\mathbb E\left(\boldsymbol\xi_{ij}\boldsymbol\xi_{ij}^\top\right)
=\left(\sigma_\eta^2\sum_{k\in\Omega}\phi_k^4
+\sigma_\epsilon^2\sum_{k\in\Omega}\phi_k^2\right)\mathbf A_2
+\mathbf C_{q,ij}(b). \tag{31}
$$

局部系数估计 $\hat{\boldsymbol\theta}^{\,r}_{ij}(b)$ 的法矩阵为 $\sum_{k\in\Omega}\phi_k^2\mathbf A_1$。把式 (31) 经该估计器传播得

$$
{\rm Cov}\left[\hat{\boldsymbol\theta}^{\,r}_{ij}(b)\right]
=\frac{\mathbf A_1^{-1}\mathbb E\left(\boldsymbol\xi_{ij}\boldsymbol\xi_{ij}^\top\right)\mathbf A_1^{-1}}
{\left(\sum_{k\in\Omega}\phi_k^2\right)^2}. \tag{32}
$$

对式 (20b) 取期望得

$$
\boldsymbol\Sigma_{q,k}(b)=\left\{\frac{\Delta_z^2}{12}+O\left(\Delta_z^4\right)\right\}
\times{\rm diag}\left(\left\{\mathbb E\left[\left(y^{(k)}_m+\epsilon_0\right)^2\right]\right\}_{m}\right). \tag{33}
$$

把式 (33) 代入式 (30)、再代入式 (32) 得

$$
{\rm Cov}\left[\hat{\boldsymbol\theta}^{\,r}_{ij}(b)\right]
\approx\mathbf C_{0,ij}+\Delta_z^2\mathbf C_{\Delta,ij}, \tag{34}
$$

其中与比特深度无关的矩阵 $\mathbf C_{0,ij}\succeq0$ 与 $\mathbf C_{\Delta,ij}\succeq0$ 分别刻画衰落与接收机噪声贡献、以及主导的量化贡献。由于参考值是确定性的且局部多项式基以 $(i,j)$ 为中心，插值误差方差等于式 (34) 协方差的第一个对角元。利用 $\Delta_z=(z_{\max}-z_{\min})/(2^b-1)$ 得

$$
{\rm Var}\left[e^r_{ij}(b)\right]\approx a\left(2^b-1\right)^{-2}+c,
$$

其中 $c=[\mathbf C_{0,ij}]_{1,1}$，$a=(z_{\max}-z_{\min})^2[\mathbf C_{\Delta,ij}]_{1,1}\ge0$。在相同的固定设计与中心化噪声假设下，非奇异的多源块更新只改变与比特深度无关的系数矩阵，每个源分量仍保持该标定关系。$\square$

## 参考文献（英文原条目，按原文顺序）

[1] S. Gao, J. Yan, P. Huang, Z. Lu, M. Gong, L. Miao, G. Zhu, J. Liang, and L. Yang, “Integrated sensing, communication, and computation for low-altitude networks towards seamless connectivity and connected intelligence,” *IEEE Internet Things Mag.*, vol. 9, no. 3, pp. 63–71, May 2026.

[2] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A tutorial on environment-aware communications via channel knowledge map for 6G,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 3, pp. 1478–1519, 3rd Quart. 2024.

[3] D. Romero and S.-J. Kim, “Radio map estimation: A data-driven approach to spectrum cartography,” *IEEE Signal Process. Mag.*, vol. 39, no. 6, pp. 53–72, Nov. 2022.

[4] D. Yang, F. Guo, Y. Wang, S. Zhang, Z. Tian, Z. Ding, and Z. Cai, “A comprehensive survey on spectrum cartography: State-of-the-art, trends, and challenges,” *IEEE Commun. Surveys Tuts.*, pp. 1–1, 2026.

[5] J. A. Bazerque, G. Mateos, and G. B. Giannakis, “Group-lasso on splines for spectrum cartography,” *IEEE Trans. Signal Process.*, vol. 59, no. 10, pp. 4648–4663, Oct. 2011.

[6] G. Zhang, X. Fu, J. Wang, X.-L. Zhao, and M. Hong, “Spectrum cartography via coupled block-term tensor decomposition,” *IEEE Trans. Signal Process.*, vol. 68, pp. 3660–3675, 2020.

[7] X. Chen, J. Wang, G. Zhang, and Q. Peng, “Tensor-based parametric spectrum cartography from irregular off-grid samplings,” *IEEE Signal Process. Lett.*, vol. 30, pp. 513–517, 2023.

[8] H. Sun and J. Chen, “Integrated interpolation and block-term tensor decomposition for spectrum map construction,” *IEEE Trans. Signal Process.*, vol. 72, pp. 3896–3911, 2024.

[9] F. Zhou, C. Wang, G. Wu, Y. Wu, Q. Wu, and N. Al-Dhahir, “Accurate spectrum map construction for spectrum management through intelligent frequency-spatial reasoning,” *IEEE Trans. Commun.*, vol. 71, no. 7, pp. 3932–3945, Jul. 2023.

[10] S. Shrestha, X. Fu, and M. Hong, “Deep spectrum cartography: Completing radio map tensors using learned neural models,” *IEEE Trans. Signal Process.*, vol. 70, pp. 1170–1184, 2022.

[11] H. Yuan, Z. Chen, J. Peng, F. Tian, P. Du, X. Xu, and Y. Gao, “Neural fitting for sparse radio map construction in LEO satellite network,” *IEEE Trans. Mobile Comput.*, vol. 25, no. 9, pp. 14 672–14 687, Sep. 2026.

[12] R. Shrestha, D. Romero, and S. P. Chepuri, “Spectrum surveying: Active radio map estimation with autonomous UAVs,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 1, pp. 627–641, Jan. 2023.

[13] Y. Chen, Q. Zhu, J. Wang, Z. Jia, X. Wang, Z. Lin, Y. Huang, Q. Wu, and C. Briso-Rodríguez, “UAV-aided efficient informative path planning for autonomous 3D spectrum mapping,” *IEEE Trans. Cogn. Commun. Netw.*, vol. 12, pp. 1664–1677, 2026.

[14] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder, Z.-L. Zhang, and G. B. Giannakis, “Bayesian active learning for sample efficient 5G radio map reconstruction,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 12, pp. 19 382–19 396, Dec. 2024.

[15] W. Lu, S. Gao, M. Wen, Y. Liang, L. Yang, C.-B. Chae, and H. V. Poor, “Bayesian-driven graph reasoning for active radio map construction,” in *Proc. 17th Int. Conf. Wireless Commun. Signal Process. (WCSP)*, Chongqing, China, Oct. 2025, pp. 1–6.

[16] M. Li, Y. Shi, E. Alsusa, D. Zhang, J. Deng, N. Su, and X. You, “End-to-end UAV-enabled adaptive 3-D radio mapping via joint optimization of sparse sampling and reconstruction,” *IEEE Internet Things J.*, vol. 13, no. 11, pp. 25 100–25 113, Jun. 2026.

[17] J. Liang, W. Lu, T. Liu, K. Kang, G. Pan, L. Yang, X. Zheng, and S. Gao, “Relaying signal when monitoring traffic: Double use of aerial vehicles towards intelligent low-altitude networking,” in *2025 China Automation Congress (CAC)*, 2025, pp. 7857–7862.

[18] Y. Ye, Y. Tian, C. H. Liu, L. Dong, G. Qi, and D. Wu, “AoI-aware air-ground mobile crowdsensing by multi-agent curriculum learning with collaborative observation augmentation,” *IEEE Trans. Mobile Comput.*, vol. 24, no. 11, pp. 11 675–11 687, Nov. 2025.

[19] Q. Zhao, C. H. Liu, J. Zhao, G. Li, G. Qi, X. Ji, D. Xu, and J. Crowcroft, “UAV carrier enabled vehicular crowdsensing by multi-agent reinforcement learning with mutual policy divergence and attentive memory update,” *IEEE Trans. Mobile Comput.*, vol. 25, no. 10, pp. 17 406–17 423, Oct. 2026.

[20] P. Chen, L. Luo, D. Guo, X. Luo, X. Li, and Y. Sun, “Secure task offloading for rural area surveillance based on UAV-UGV collaborations,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 1, pp. 923–937, Jan. 2024.

[21] D. Romero, S.-J. Kim, G. B. Giannakis, and R. Lopez-Valcarce, “Learning power spectrum maps from quantized power measurements,” *IEEE Trans. Signal Process.*, vol. 65, no. 10, pp. 2547–2560, May 2017.

[22] S. Timilsina, S. Shrestha, and X. Fu, “Quantized radio map estimation using tensor and deep generative models,” *IEEE Trans. Signal Process.*, vol. 72, pp. 173–189, 2024.

[23] Y. Li, W. Liang, W. Xu, Z. Xu, X. Jia, Y. Xu, and H. Kan, “Data collection maximization in IoT-sensor networks via an energy-constrained UAV,” *IEEE Trans. Mobile Comput.*, vol. 22, no. 1, pp. 159–174, Jan. 2023.

[24] X. Chen, N. Zhao, Z. Chang, T. Hämäläinen, and X. Wang, “UAV-aided secure short-packet data collection and transmission,” *IEEE Trans. Commun.*, vol. 71, no. 4, pp. 2475–2486, Apr. 2023.

[25] J. Zhang, F.-C. Zheng, X.-Q. Gao, and H.-B. Zhu, “Sensing-energy efficiency tradeoff for cognitive radio networks,” *IET Commun.*, vol. 8, no. 18, pp. 3414–3423, Dec. 2014.

[26] V. Monga, Y. Li, and Y. C. Eldar, “Algorithm unrolling: Interpretable, efficient deep learning for signal and image processing,” *IEEE Signal Process. Mag.*, vol. 38, no. 2, pp. 18–44, Mar. 2021.

[27] E. Johnson, S. William, D. Brown, and J. Martinez, “Factor-decomposed convex recovery and learned unfolding for radio map estimation from spatially correlated samples,” Available at SSRN 7151858, 2026. [Online]. Available: https://ssrn.com/abstract=7151858

[28] R. M. Gray and D. L. Neuhoff, “Quantization,” *IEEE Trans. Inf. Theory*, vol. 44, no. 6, pp. 2325–2383, Oct. 1998.

[29] B. Widrow, I. Kollár, and M.-C. Liu, “Statistical theory of quantization,” *IEEE Trans. Instrum. Meas.*, vol. 45, no. 2, pp. 353–361, Apr. 1996.

[30] J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov, “Proximal policy optimization algorithms,” *arXiv:1707.06347*, Jul. 2017.

[31] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “RadioUNet: Fast radio map estimation with convolutional neural networks,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 6, pp. 4001–4015, Jun. 2021.

[32] S. Gao, J. Liang, Y. Yuan, W. Lu, G. Shen, and L. Yang, “FARM: Foundational aerial radio map for intelligent low-altitude networking,” *arXiv:2604.17362*, Apr. 2026.

[33] C. Yu, A. Velu, E. Vinitsky, J. Gao, Y. Wang, A. M. Bayen, and Y. Wu, “The surprising effectiveness of PPO in cooperative multi-agent games,” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, vol. 35, Nov. 2022, pp. 24 611–24 624.

[34] C. S. de Witt, T. Gupta, D. Makoviichuk, V. Makoviychuk, P. H. S. Torr, M. Sun, and S. Whiteson, “Is independent learning all you need in the StarCraft multi-agent challenge?” *arXiv:2011.09533*, Nov. 2020.

[35] J. G. Kuba, R. Chen, M. Wen, Y. Wen, F. Sun, J. Wang, and Y. Yang, “Trust region policy optimisation in multi-agent reinforcement learning,” in *Proc. Int. Conf. Learn. Represent. (ICLR)*, Apr. 2022.

[36] X. Deng, W. Liu, Y. Fu, and Q. Zhu, “Joint optimization for UAV-assisted mobile crowdsensing networks with heterogeneous multi-agent collaboration,” *IEEE Trans. Cogn. Commun. Netw.*, vol. 12, pp. 8651–8665, 2026.

**原文插图：** 原 PDF 中的图 1–11 未重传至本页，仅保留中文图注与图中关键标注（如中断阈值线、NMSE 读数与相对变化百分比）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.24119v1（eess.SP，13 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VII 节（含 II-A–E、III-A–C、IV-A–B、V-A–C、VI-A–C 等全部小节，VI-C 下含 1)–5) 各要点）、结论、全部图注（图 1–11）、表 I–VI（逐格转录）、算法 1–2、命题 1–2、公式 (1)–(34)（含 (12a)–(12e)、(20a)–(20b)）、附录 A–B（两个命题的完整证明）与 36 条参考文献英文原条目；原文无作者简介。**逐句终校未做**：表 I 的 ✓/×/△ 矩阵、表 II 的两列复杂度、表 III/IV 的参数对照、表 V 的运行时间、表 VI 的七种策略性能均已用 PDF 页面渲染逐格核对；式 (5)–(7)、(12)、(19)–(21)、(27)–(28) 亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①§VI-B 中加速比有 27 倍（累计时间）与 55 倍（单次更新）两种口径且原文未说明；②§V-A 引入集成权重 $w_{e,t}$（满足 $\sum_e w_{e,t}=1$）但未说明其确定方式。均按原文照录，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
