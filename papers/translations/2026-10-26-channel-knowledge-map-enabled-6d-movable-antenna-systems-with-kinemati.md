---
layout: page
title: "信道知识地图赋能的 6D 移动天线系统与运动学｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-26-channel-knowledge-map-enabled-6d-movable-antenna-systems-with-kinemati/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/f103ab005ecf4e09/) · 原文为IEEE 正式版/期刊，许可待核验 · [全部目录](/papers/catalog/)

# 信道知识地图赋能的 6D 移动天线系统与运动学

**原题：** Channel Knowledge Map-Enabled 6D Movable Antenna Systems With Kinematic Constraints: A Manifold Optimization Approach  
**作者：** Nan Cheng（承楠，Senior Member, IEEE）、Shuangyu Yang（杨双宇，Graduate Student Member, IEEE）、Ruijin Sun（孙瑞锦，Member, IEEE）、Zhisheng Yin（殷智胜，Member, IEEE）、Xiaodan Shao（邵晓丹，Member, IEEE）、Weihua Zhuang（Fellow, IEEE）、Xuemin Shen（Fellow, IEEE）  
**单位：** 西安电子科技大学 ISN 国家重点实验室与通信工程学院（西安 710071）；滑铁卢大学电气与计算机工程系（加拿大滑铁卢 N2L 3G1）。通讯作者：孙瑞锦。  
**版本：** IEEE Transactions on Wireless Communications, vol. 25, 2026, pp. 8968–8981（IEEE 正式版/期刊，DOI: 10.1109/TWC.2025.3645480）；本地 PDF 14 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VI 节正文、图 1–11 中文图注、表 I 逐格转写、算法 1 伪代码、式 (1)–(63)，以及参考文献 35 条英文原条目（按原编号）。逐句逐式终校未做。

> **原文首页脚注：** 收稿 2025 年 8 月 22 日；修回 2025 年 10 月 28 日；录用 2025 年 12 月 13 日；出版日期 2025 年 12 月 26 日；当前版本日期 2026 年 1 月 12 日。本工作部分得到国家重点研发计划（2024YFB907500）与国家自然科学基金（62201414）资助。负责本文审稿并批准发表的副编辑为 G. Zhu。（通讯作者：孙瑞锦。）

## 摘要

六维移动天线（6DMA）通过物理重构天线位置与朝向，为提升无线传输性能提供了潜在方案。然而，现有基于快照的反应式方法忽略了天线运动学约束与系统时延，因而不适合连续跟踪移动用户设备（UE）。为克服这些局限，本文提出一种主动式方法，把 UE 跟踪建模为单一的长期 6DMA 轨迹优化问题，以最大化总谱效。借助信道知识地图（CKM）提供预测数据，我们的模型整体计入系统复杂的运动学与物理约束（包括速度上限与安全距离），以确保轨迹物理可行。为求解该高维非凸问题，我们提出一种新的流形优化算法：把天线旋转状态映射到 SO(3) 李群上，并采用带切空间反向传播的自适应惩罚机制以高效求解。仿真结果表明，我们的方法相对基准方案显著提升总谱效，同时保证天线轨迹连续且物理可行。

**索引词：** 6D 移动天线、轨迹优化、主动跟踪、信道知识地图、流形优化、运动学约束、谱效。

## I. 引言

为满足未来无线容量需求，多输入多输出（MIMO）技术至关重要，并已演进出大规模与极大规模系统以提升谱效。然而，下一代系统依赖固定位置天线（FPA），尤其在高频段使用大规模阵列应对复杂场景 [1], [2]，已带来过高成本与递减回报。这促使研究者探索更高效地利用空间自由度（DoF）的途径 [3]。

移动天线（MA）技术已成为有前景的方案。与 FPA 不同，MA 可物理改变位置以寻找更好信道条件 [4], [5]。六维移动天线（6DMA）概念在此基础上，为三维平移运动增加三维旋转能力 [6], [7]。这六个自由度使基站（BS）可精细调整其天线阵列的几何与朝向，在不增加天线数量的情况下增强波束赋形与空间复用 [8]。MA/6DMA 的核心思想是在优化传统通信参数的同时优化天线位置与朝向。该方向的研究包括天线位姿与波束赋形的联合优化以最大化总速率 [9], [10] 或最小化发送功率 [11]，也已应用于通感一体化 [12], [13] 与物理层安全 [14]；此外，还发展了面向所有可能天线位姿的信道估计方法 [15]。

尽管应用前景可观，现有 6DMA 研究主要聚焦基于快照的静态优化范式：以瞬时信道状态信息（CSI）为条件，为给定时隙寻找单一最优固定天线位姿。这种反应式策略本质上是短视的：它孤立地优化每个状态，忽视运动的物理约束与所得轨迹的长期性能。虽然其在低移动性或准静态信道场景中的有效性已得到验证 [10], [16]，但高移动性任务关键应用（如无人机跟踪 [17] 与车联网 [18]）的兴起，要求从反应式调整转向主动式长期轨迹优化，以保证所需的连续高保真服务。首要考虑是确保运动学可行——这通常是现行优化范式不太关注的因素。以瞬时信道状态最优位姿为中心的方法 [6], [16] 可顺序应用于动态跟踪任务，但可能导致短视优化，因为其表述未显式纳入运动学约束或当前决策对未来运动的影响。孤立优化每个状态可能得到一系列单独最优的位姿，却构成一条运动学上难以执行、或长期效率较低的轨迹。第二个挑战与信道信息时延有关。在动态跟踪场景中，传统"先测量后优化"的反应式控制环路同时受信道估计与决策的固有时延影响：当系统完成信道估计、计算出最优位姿并执行移动时，支撑决策的 CSI 可能已不再准确反映当前信道状态，这种潜在失配会损害链路质量。利用长期统计信道信息可缓解该时延 [19]，但这是一种折中：对机械灵活性有限或服务大量 UE 的系统，该策略实用；而对具备足够机动性以跟踪少量 UE 的 6DMA 系统，该做法可能无法充分利用 MA 的关键优势——实时适应性，因为其解针对平均条件而非特定时刻优化。

受上述观察启发，本文探讨从离散、基于快照的优化转向更整体的主动式长期 6DMA 轨迹优化。该方法旨在通过把整条轨迹表述为单一连贯问题来应对运动学可行性挑战，从而规划平滑、连续且物理可实现的运动。该主动范式的实现得益于信道知识地图（CKM）[20]：它通过把地理位置映射到信道参数，可在服务时域上预测获取信道信息。基于该预测能力，我们提出一种新的优化框架。第一，我们用 Rodrigues 旋转公式建立高保真运动学模型，显式刻画信道对天线六个自由度的依赖。该模型准确捕捉控制作用的累积效应，并与一整套实际物理约束结合以保证工程可行性。虽然该模型表示更准确，却导致高维非凸优化问题，对传统求解器具有挑战性。第二，为求解该问题，我们提出流形优化算法：把天线旋转参数视为特殊正交群 SO(3) 上的元素，从而高效计算高质量、工程可行的轨迹。本文主要贡献总结如下。

- 我们把移动 UE 的主动跟踪覆盖任务表述为以服务时域总谱效最大为目标的长期 6DMA 轨迹优化问题。该问题模型的关键特点是全面考虑 6DMA 系统的复杂运动学，为此我们提出基于 Rodrigues 旋转公式的新长周期运动学模型，以准确建模信道对天线六个自由度的依赖；并系统纳入一系列关键物理可行性约束，包括最大角速度、位移上限、天线间最小安全距离以及避免信号自反射，从而保证优化结果的工程可行性。
- 为应对所建问题的高维性与非凸性，我们提出基于流形优化的求解框架。该方法直接在特殊正交群 SO(3) 上优化天线旋转参数，其优越性在于天然满足旋转矩阵的正交约束，从而自然规避传统参数化带来的奇异点问题与复杂三角约束；优化过程在变量的自然几何空间中进行，提升了算法的稳定性与效率。
- 在流形优化框架内，我们设计一种新的迭代算法：在切空间上通过反向传播计算黎曼梯度，并引入自适应惩罚度量以处理复杂几何与运动学约束。该方法在满足约束的同时稳定地引导算法获得高质量解。
- 我们进行了大量数值仿真以全面验证所提框架的有效性与实际可行性。结果表明，所提主动式 6DMA 轨迹优化方法相对基准方案显著提升总谱效；关键在于，该性能增益是在严格满足所有运动学与物理约束的前提下取得的，从而验证了所提方案的优越性能与工程可行性。

**记号：** 粗体小写与大写字母分别表示向量与矩阵，花体字母表示集合。对矩阵 $\mathbf A$，其转置、共轭转置、迹与行列式分别记为 $\mathbf A^T$、$\mathbf A^H$、$\mathrm{tr}(\mathbf A)$、$\det(\mathbf A)$。对两个向量 $\mathbf a$ 与 $\mathbf b$，其点积记为 $\mathbf a\cdot\mathbf b$。向量的欧氏范数与标量的绝对值分别记为 $\|\cdot\|$ 与 $|\cdot|$。$\mathbf I_M$ 是 $M\times M$ 单位矩阵。$\mathrm{SO}(3)$ 表示 $3\times3$ 旋转矩阵的特殊正交群，$\mathfrak{so}(3)$ 为其李代数。算子 $(\cdot)^\times$ 把向量 $\mathbf u\in\mathbb R^3$ 映射为其反对称叉乘矩阵。指数映射、对数映射、群复合、切空间加法与流形减法分别记为 $\exp(\cdot)$、$\mathrm{Log}(\cdot)$、$\circ$、$\oplus$、$\ominus$。

## II. 系统模型

本节先介绍所考虑的上行移动 UE 通信的 6DMA-BS 模型，随后给出 UE 移动模型、天线移动模型及相应信道模型。

### A. 6DMA-BS 模型

如图 1 所示，我们考虑一个多用户上行通信系统：BS 在服务时域 $T$ 内服务 $K$ 个移动 UE。该时长均匀离散为 $M$ 个时隙，索引集合为 $\mathcal T=\{1,2,\dots,M\}$，每个时隙长度 $\Delta t=T/M$。BS 配备 $A$ 个 6DMA 表面，索引为 $a\in\mathcal A=\{1,2,\dots,A\}$。每个表面构成均匀平面阵列（UPA），含 $N$ 个天线阵元，索引为 $n\in\mathcal N_a=\{1,2,\dots,N\}$。每个 UE 索引为 $k\in\mathcal K=\{1,2,\dots,K\}$，配备单根固定位置天线。模型的一个关键假设是：所有 UE 的时空轨迹在 BS 处先验已知。每个 6DMA 表面的空间构型（包括三维位置与朝向）可跨时隙动态重构，以改善信道条件、提供轨迹感知的服务。具体地，安装在 BS 的每个 6DMA 表面通过 $L$ 根可伸缩、可旋转的支撑杆与位于 BS 的中央处理单元（CPU）相连，支撑杆内嵌柔性线路。支撑杆集合记为 $\mathcal L=\{1,2,\dots,L\}$。每根支撑杆固定一个 6DMA 表面，其末端通过万向节与该表面连接，索引一一对应。通过 CPU 控制这些支撑杆的伸缩、旋转与三维移动，可灵活调整每个 6DMA 表面在三维空间中的位置坐标以及相对平面法向的偏转角。该系统支持 6DMA 表面在全向空间中的精确位置调整与姿态控制，为无线传输链路的动态优化提供硬件基础。

接下来讨论杆旋转对天线位置的影响。以 BS 与天线支撑杆的连接点作为原点 $\mathbf q_0^b=(0,0,0)^T$，构建全局笛卡尔坐标系（CCS）。在时隙 $t$，第 $a$ 个 6DMA 表面中心（对应第 $l$ 根杆的末端）的位置记为 $\mathbf q_l^b[t]=(x_l,y_l,z_l)^T$，其中 $x_l$、$y_l$、$z_l$ 是该表面在全局 CCS 中沿 x、y、z 轴的坐标。第 $l$ 根支撑杆的旋转轴由单位向量 $\mathbf u_l=(u_x,u_y,u_z)^T$ 定义。在该全局坐标系中，绕该轴的角速度记为 $\omega_l[t]$，对应旋转角 $\theta_l[t]$ 由 $\theta_l[t]=\omega_l[t]\Delta t$ 确定。杆末端更新后的位置 $\mathbf q_l^b[t+1]$，由对前一位置 $\mathbf q_l^b[t]$ 应用 Rodrigues 旋转公式 [21] 得到：

$$
\mathbf q_l^b[t+1]=\mathbf R_l\left(\theta_l[t+1],\mathbf u_l[t+1]\right)\mathbf q_l^b[t], \tag{1}
$$

其中 $\mathbf R_l(\cdot)$ 表示第 $l$ 根杆对应的 Rodrigues 旋转矩阵。为简化记号，定义 $C_{\theta_l}=\cos\theta_l$、$S_{\theta_l}=\sin\theta_l$、$D_{\theta_l}=1-\cos\theta_l$。据此旋转矩阵 $\mathbf R_l(\theta_l,\mathbf u_l)$ 可重写为

$$
\mathbf R_l(\theta_l,\mathbf u_l)=\begin{bmatrix}C_{\theta_l}+u_x^2D_{\theta_l} & u_xu_yD_{\theta_l}-u_zS_{\theta_l} & u_xu_zD_{\theta_l}+u_yS_{\theta_l}\\ u_yu_xD_{\theta_l}+u_zS_{\theta_l} & C_{\theta_l}+u_y^2D_{\theta_l} & u_yu_zD_{\theta_l}-u_xS_{\theta_l}\\ u_zu_xD_{\theta_l}-u_yS_{\theta_l} & u_zu_yD_{\theta_l}+u_xS_{\theta_l} & C_{\theta_l}+u_z^2D_{\theta_l}\end{bmatrix}. \tag{2}
$$

通过 (1)，我们可计算向量 $\mathbf q_l^b[t]$ 绕单位向量 $\mathbf u_l[t+1]$ 旋转角度 $\theta_l[t+1]$ 后的新向量 $\mathbf q_l^b[t+1]$。类似地，以天线支撑杆与 6DMA 表面的连接点为原点，建立天线本地 CCS，记为 $\mathbf q_a^s[t+1]$。在该本地 CCS 中，第 $a$ 个 6DMA 表面上第 $n$ 个天线的坐标表示为 $\mathbf q_{a,n}^s[t]$。6DMA 表面的旋转由单位向量 $\mathbf u_a[t]$ 与角速度 $\omega_a[t]$ 刻画；在时隙 $t$ 内，其对应第 $a$ 个 6DMA 表面的旋转变换由旋转矩阵 $\mathbf R_a(\theta_a[t],\mathbf u_a[t])$ 描述。

计入由缩放因子 $\varsigma_l$ 刻画的支撑杆伸缩、支撑杆旋转与 6DMA 表面旋转，第 $t$ 个时隙第 $a$ 个 6DMA 表面上第 $n$ 个天线的全局位置可由累积控制模型表示。全局与本地尺度的控制对全局位置的影响可分别定义为

$$
\varsigma_l^b[t]=\prod_{i=1}^{t}\varsigma_l[i], \tag{3}
$$

$$
\mathbf R_l^b[t]=\prod_{i=1}^{t}\mathbf R_l\left(\theta_l[i],\mathbf u_l[i]\right), \tag{4}
$$

$$
\mathbf R_a^s[t]=\prod_{i=1}^{t}\mathbf R_a\left(\theta_a[i],\mathbf u_a[i]\right). \tag{5}
$$

随后，第 $l$ 个表面中心在时隙 $t$ 的全局位置 $\mathbf q_l^b[t]$ 由支撑杆对其初始位置 $\mathbf q_l^b[0]$ 施加的累积缩放与旋转变换确定，即

$$
\mathbf q_l^b[t]=\varsigma_l^b[t]\mathbf R_l^b[t]\mathbf q_l^b[0]. \tag{6}
$$

在此基础上，由于全局 CCS 与本地 CCS 具有相同尺度与初始朝向，对 $\forall l=a$，第 $a$ 个表面上第 $n$ 个阵元的全局位置 $\mathbf q_{l,n}^b[t]$，可由表面中心全局位置加上经该表面自身旋转变换后的天线本地位向量得到，即

$$
\mathbf q_{l,n}^b[t]=\mathbf q_l^b[t]+\mathbf R_a^s[t]\mathbf q_{a,n}^s[0], \tag{7}
$$

其中 $\mathbf q_{a,n}^s[0]$ 是天线阵元在本地坐标系中的初始位置向量。

> **图 1（原文 Fig. 1）：** 6DMA 赋能 BS 执行主动 UE 跟踪的示意场景。通过长期轨迹优化，BS 平滑调整天线位置与朝向，保证沿 UE 轨迹的连续、鲁棒通信链路。

> **图 2（原文 Fig. 2）：** 第 $a$ 个 6DMA 表面六自由度几何控制过程示意，包括杆旋转、表面旋转与伸缩缩放。

### B. 物理运行约束

**1) 避免信号反射的旋转约束。** 为防止任意两个 6DMA 表面之间的相互信号反射（如图 3(a)），必须对每一对 6DMA 表面施加旋转方向约束。在第 $a$ 个 6DMA 表面的本地坐标系与全局坐标系在朝向与尺度上均全等的前提下，本地旋转矩阵对该表面的全局法向量与本地法向量施加等价影响。对支撑杆与表面的顺序旋转过程，第 $a$ 个 6DMA 表面在全局坐标系中变换后的法向量可由跨时隙旋转矩阵的累积乘积刻画。具体地，顺序旋转后的法向量表达式为

$$
\mathbf i_a^b[t]=\mathbf R_l^e[t]\mathbf i_a^b[0], \tag{8}
$$

其中累积旋转矩阵

$$
\mathbf R_l^e[t]=\prod_{i=1}^{t}\mathbf R_l\left(\theta_l[i],\mathbf u_l[i]\right)\mathbf R_a\left(\theta_a[i],\mathbf u_a[i]\right) \tag{9}
$$

概括每个时隙上杆旋转与表面旋转对 6DMA 表面最终朝向的累积效应，$\mathbf i_a^b[0]$ 表示全局参考点处的初始向外单位法向量。

可用第 $a$ 个 6DMA 表面中心及其在全局坐标系中的向外法向量构造超平面，该超平面可表示为

$$
\left\{\mathbf q_x^b\ \middle|\ \left(\mathbf i_a^b[t]\right)^T\mathbf q_x^b=\left(\mathbf i_a^b[t]\right)^T\mathbf q_l^b[t]\right\}. \tag{10}
$$

对空间中任意点 $\mathbf q_x^b$，该超平面由所有满足向量 $\mathbf q_x^b-\mathbf q_l^b[t]$ 与法向量 $\mathbf i_a^b[t]$ 正交的点组成。该超平面把三维空间分为两个半空间，其中一个是由

$$
\left\{\mathbf q_x^b\ \middle|\ \left(\mathbf i_a^b[t]\right)^T\left(\mathbf q_x^b-\mathbf q_l^b[t]\right)\le0\right\} \tag{11}
$$

定义的闭半空间。该闭半空间包含点 $\mathbf q_l^b[t]$，其中任意点 $\mathbf q_x^b$ 与法向量 $\mathbf i_a^b[t]$ 所成向量 $\mathbf q_x^b-\mathbf q_l^b[t]$ 的夹角为钝角或直角。当 $\mathbf q_x^b$ 取任意不同 6DMA 表面的中心位置时，对 $\forall l\neq l'$、$l,l'\in\mathcal L$，约束条件可写为

$$
\left(\mathbf i_a^b[t]\right)^T\left(\mathbf q_{l'}^b[t]-\mathbf q_l^b[t]\right)\le0. \tag{12}
$$

约束 (12) 确保其他 6DMA 表面的中心不落在沿第 $a$ 个 6DMA 表面法向量方向延伸的开半空间内。

**2) 机械结构约束。** 为确保运行安全并防止图 3(b) 所示机械碰撞，我们建立一组物理约束。直接强制欧氏距离在计算上难以处理，因为需要在每个优化步求解复杂非凸子问题（如非共面杆间最小距离）。因此我们采用更高效的几何角度分离策略：该方法为物理间隙提供可处理代理，并天然尊重系统运动学极限。第一，为防止任意两个 6DMA 表面之间的碰撞与耦合，对所有 $l\neq l'$、$l,l'\in\mathcal L$ 的表面对强制最小角间隔 $\vartheta_1$：

$$
\arccos\left(\frac{\mathbf q_l^b[t]\cdot\mathbf q_{l'}^b[t]}{\left\|\mathbf q_l^b[t]\right\|\left\|\mathbf q_{l'}^b[t]\right\|}\right)\ge\vartheta_1. \tag{13}
$$

第二，为避免与 BS 主体结构碰撞，每个表面与 BS 向外法向量 $\mathbf i^b[0]$ 之间需满足最小角 $\vartheta_2$。该约束对所有 $l\in\mathcal L$ 适用，即

$$
\arccos\left(\left|\frac{\mathbf q_l^b[t]\cdot\mathbf i^b[0]}{\left\|\mathbf q_l^b[t]\right\|\left\|\mathbf i^b[0]\right\|}\right|\right)\ge\vartheta_2. \tag{14}
$$

最后，为防止表面与自身支撑杆碰撞，对所有 $l=a$ 的 $l\in\mathcal L$ 必须保持最小角 $\vartheta_3$：

$$
\arccos\left(\left|\frac{\mathbf q_l^b[t]\cdot\mathbf i_a^b[t]}{\left\|\mathbf q_l^b[t]\right\|\left\|\mathbf i_a^b[t]\right\|}\right|\right)\ge\vartheta_3. \tag{15}
$$

这些约束基于 6DMA 表面中心而非单个天线阵元定义。该简化显著减少约束数量与总体计算复杂度，对大规模阵列尤为明显。尽管该方法是近似，但 (12) 的半空间约束与 (13)–(15) 的角间隔相结合，通过维持足够物理间隙有效保证运行安全并缓解严重信号反射。

> **图 3（原文 Fig. 3）：** 6DMA 表面伸缩与旋转过程中的部分约束。

### C. 信道模型

在整个服务时域内，每个 6DMA 表面与网络内任意 UE 之间的信道响应，由 UE 空间坐标与 6DMA 表面三维位置、朝向参数共同决定。本小节聚焦上行传输阶段，刻画从每个 UE 到分布于多个 6DMA 表面的所有天线阵元的信号传播信道模型。

**1) 6D 导向矢量。** 对给定时隙 $t$，令 $\alpha_{k,j}[t]\in[-\pi/2,\pi/2]$、$\beta_{k,j}[t]\in[-\pi,\pi]$ 表示第 $k$ 个 UE 到 6DMA-BS 参考位置的第 $j$ 条信道路径的俯仰角与方位角到达角（AOA），$1\le j\le J_k$，其中 $J_k$ 表示接收信道路径数。全局坐标系中的对应方向向量为

$$
\mathbf f_{k,j}^b[t]=\left[\cos\alpha_{k,j}[t]\cos\beta_{k,j}[t],\ \cos\alpha_{k,j}[t]\sin\beta_{k,j}[t],\ \sin\alpha_{k,j}[t]\right]^T. \tag{16}
$$

第 $a$ 个 6DMA 表面的导向矢量由其天线阵元与 BS 参考位置之间的相位差确定。鉴于 $\mathbf q_{l,n}^b[t]$ 由 (7) 中缩放与旋转建立的位置关系定义，第 $n$ 个天线阵元相对 BS 参考位置的相位差为 $2\pi(\mathbf f_{k,j}^b[t])^T\mathbf q_{l,n}^b[t]/\lambda$，其中 $\lambda$ 为载波波长。因此导向矢量可表示为旋转与缩放分量的函数：

$$
\mathbf v_{k,j}^a\left(\varsigma_l^b[t],\mathbf R_l^b[t],\mathbf R_a^s[t]\right)=\left[e^{-\mathrm j\frac{2\pi}{\lambda}\mathbf f_{k,j}^b[t]^T\mathbf q_{l,1}^b[t]},\dots,e^{-\mathrm j\frac{2\pi}{\lambda}\mathbf f_{k,j}^b[t]^T\mathbf q_{l,n}^b[t]}\right]^T\in\mathbb C^{N\times1}. \tag{17}
$$

**2) 有效天线增益。** 有效天线增益取决于辐射方向图与 6DMA 表面的朝向。对第 $a$ 个表面，利用其旋转矩阵把全局指向向量 $\mathbf f_{k,j}^b[t]$ 投影到本地坐标系（类比 (8) 的表述），可表示为

$$
\mathbf f_{k,j}^a[t]=-\left(\mathbf R_l^e[t]\right)^T\mathbf f_{k,j}^b[t]=\left(f_{k,j}^{a,x}[t],f_{k,j}^{a,y}[t],f_{k,j}^{a,z}[t]\right). \tag{18}
$$

注意 $\mathbf R_l$ 与 $\mathbf R_a$ 均为正交矩阵，故此处用 $(\mathbf R_l\mathbf R_a)^T=(\mathbf R_l\mathbf R_a)^{-1}$ 简化计算。于是本地俯仰角与方位角为

$$
\alpha_{k,j}^a[t]=\frac{\pi}{2}-\arccos\left(f_{k,j}^{a,z}[t]\right), \tag{19}
$$

$$
\beta_{k,j}^a[t]=\arccos\left(\frac{f_{k,j}^{a,x}[t]}{\sqrt{\left(f_{k,j}^{a,x}[t]\right)^2+\left(f_{k,j}^{a,y}[t]\right)^2}}\right)\times\eta\left(f_{k,j}^{a,y}[t]\right), \tag{20}
$$

其中 $\eta(f_{k,j}^{a,y}[t])$ 是符号函数，依据向量 y 分量的符号调整 arccos 计算的角度：

$$
\eta\left(f_{k,j}^{a,y}[t]\right)=\begin{cases}1, & f_{k,j}^{a,y}[t]\ge0,\\-1, & f_{k,j}^{a,y}[t]<0.\end{cases} \tag{21}
$$

根据 [22]，每个天线阵元在垂直与水平维度具有半功率波束宽度 $\alpha_{3\mathrm{dB}}$ 与 $\beta_{3\mathrm{dB}}$，其中 $\alpha_{3\mathrm{dB}}=\beta_{3\mathrm{dB}}=25^\circ$。于是三维天线阵元增益 $G(\alpha_{k,j}^a[t],\beta_{k,j}^a[t])$ 可由 (19)、(20) 确定为

$$
g_{k,j}^a\left(\alpha_{k,j}^a[t],\beta_{k,j}^a[t]\right)=g_{\max}-\min\left\{-\left[g_v\left(\alpha_{k,j}^a[t]\right)+g_h\left(\beta_{k,j}^a[t]\right)\right],F\right\}, \tag{22}
$$

其中 $g(\alpha_{k,j}^a[t],\beta_{k,j}^a[t])$ 同时包含垂直与水平辐射方向图，$g_{\max}=8$ dBi 表示每个天线阵元在主瓣方向的最大定向增益。垂直辐射方向图定义为

$$
g_v\left(\alpha_{k,j}^a[t]\right)=-\min\left\{12\left(\frac{\alpha_{k,j}^a[t]}{\alpha_{3\mathrm{dB}}}\right)^2,S\right\}, \tag{23}
$$

其中 $S=30$ dBi 表示旁瓣电平上限。水平辐射方向图为

$$
g_h\left(\beta_{k,j}^a[t]\right)=-\min\left\{12\left(\frac{\beta_{k,j}^a[t]}{\beta_{3\mathrm{dB}}}\right)^2,F\right\}, \tag{24}
$$

其中 $F=30$ dBi 表示前后比。于是第 $a$ 个 6DMA 表面在线性尺度下的有效天线增益为

$$
G_{k,j}^a\left(\mathbf R_l^e[t]\right)=10^{\frac{g\left(\alpha_{k,j}^a[t],\beta_{k,j}^a[t]\right)}{10}}. \tag{25}
$$

**3) 有效信道。** 当天线物理尺寸或运动范围可忽略时¹，可采用远场模型简化，假设同一条信号传播路径对应的所有天线阵元的路径响应系数相同 [23]。此时第 $k$ 个 UE 与 BS 在第 $t$ 个时隙的信道向量可表示为

$$
\mathbf h_k\left(\boldsymbol\varsigma[t],\mathbf R^b[t],\mathbf R^s[t]\right)=\sum_{j=1}^{J_k}P_{k,j}^b[t]\times\begin{bmatrix}\sqrt{G_{k,j}^1\left(\mathbf R_1^e[t]\right)}\mathbf v_{k,j}^1\left(\mathbf R_1^b[t],\mathbf R_1^s[t]\right)^T\\ \vdots\\ \sqrt{G_{k,j}^A\left(\mathbf R_L^e[t]\right)}\mathbf v_{k,j}^A\left(\mathbf R_L^b[t],\mathbf R_A^s[t]\right)^T\end{bmatrix}\in\mathbb C^{AN\times1}, \tag{26}
$$

其中 $\boldsymbol\varsigma[t]=[\varsigma_1^b[t],\dots,\varsigma_L^b[t]]^T\in\mathbb R^{L\times1}$ 是杆缩放因子向量，$\mathbf R^b[t]=\{\mathbf R_l^b[t]\in\mathbb R^{3\times3}\}_{l=1}^{L}$ 与 $\mathbf R^s[t]=\{\mathbf R_a^s[t]\in\mathbb R^{3\times3}\}_{a=1}^{A}$ 分别是所有支撑杆与 6DMA 表面累积旋转矩阵的集合，$P_{k,j}^b[t]$ 是第 $k$ 个 UE 到 BS 覆盖区参考点的第 $j$ 条路径的路径增益系数。

> **原文脚注 1：** 尽管 6DMA 模型比二维移动天线（2DMA）提供更大运动空间，天线物理尺寸与运动范围相对传播距离通常仍可忽略。这是因为每时隙位移受机械限制约束，此外还受几何约束、高前后比以及系统最大化空间复用的目标等因素影响。

**4) CKM 赋能的定位–信道映射。** CKM 本质上构建以位置空间为根基的数据库，通过把 UE 位置与信道特征关联形成定位–信道信息映射系统。作为由环境几何结构与 UE 位置决定的大尺度传播参数，路径增益、AOA 与 AoD 呈现稀疏性与慢时变特性，使得在 CKM 中预存离散化角度集合可行。类比 [24] 构建的角度索引图，假设存在完美 CKM，其中包含每个 UE 的路径增益与 AOA 信息。于是给定全部天线控制信息，(26) 构建的信道信息可转化为 UE 特定信道映射：

$$
\mathbf h_k[t]=\mathrm{CKM}\left(\mathbf o_k[t],\mathbf E[t],\boldsymbol\varsigma[t],\mathbf R^b[t],\mathbf R^s[t]\right), \tag{27}
$$

其中 $\mathrm{CKM}(\cdot,\cdot)$ 表示定位–信道知识映射函数，$\mathbf E[t]$ 与 $\mathbf o_k[t]$ 分别表示时隙 $t$ 的环境信息与 UE $k$ 的位置信息。借助预先构建的 CKM，BS 可预先获取所有潜在路径的信道信息，把传统依赖实时反馈的"盲优化"转化为基于先验知识的环境感知通信规划。

## III. 问题建模与转化

### A. 问题建模

考虑 $K$ 个移动 UE 到 BS 的上行传输，第 $t$ 个时隙 BS 处接收信号为

$$
\mathbf y[t]=\mathbf H[t]\mathbf s+\mathbf n, \tag{28}
$$

其中 $\mathbf H[t]=[\mathbf h_1[t],\mathbf h_2[t],\dots,\mathbf h_K[t]]\in\mathbb C^{AN\times K}$ 表示 $K$ 个 UE 到 BS 全部 6DMA 表面的多址信道；$\mathbf s=\sqrt p\,[s_1,s_2,\dots,s_K]^T\in\mathbb C^{K\times1}$ 表示发送信号向量，每个 $s_k$ 为 UE $k$ 的发送信号（平均功率归一化为 1），$p$ 为所有 UE 的相同发送功率。在 (28) 中，$\mathbf n\sim\mathcal{CN}(\mathbf 0_{AN},\sigma^2\mathbf I_{AN})$ 是零均值加性白高斯噪声（AWGN），协方差矩阵为 $\sigma^2\mathbf I_{AN}$。由 (5) 与 (9) 可见，时隙 $t$ 的有效天线增益与导向矢量由截至该时隙的全部旋转分量共同决定。因此在 BS 具备完美 CSI、并采用最优高斯信令与多用户联合译码的条件下，系统总谱效可刻画为 [25]

$$
C\left(\boldsymbol\varsigma[t],\mathbf R^b[t],\mathbf R^s[t]\right)=\log_2\det\left(\mathbf I_{NA}+\frac{1}{\sigma^2}\sum_{k=1}^{K}p\mathbf h_k[t]\mathbf h_k[t]^H\right)=\log_2\det\left(\mathbf I_{NA}+\frac{p}{\sigma^2}\mathbf H[t]\mathbf H[t]^H\right). \tag{29}
$$

值得注意的是，与传统 FPA 系统不同，6DMA 系统的可达总谱效由有效信道的改变决定，而该改变由 6DMA 表面旋转及其支撑杆的旋转–伸缩运动共同引起。为在整个运行周期最大化 6DMA 系统的服务性能并保证系统稳定运行，我们联合优化天线支撑杆的伸缩分量、支撑杆旋转控制参数以及天线平面旋转控制参数，以最大化 6DMA 无线系统的谱效；同时纳入物理运动约束以保证工程可行性。此外，借助 CKM，我们可把整个服务时域上的轨迹设计表述为统一长期优化问题，而非一系列基于快照的优化方案，从而凸显 CKM 在实现主动且物理可行天线轨迹规划中的关键作用。所提系统总谱效优化问题建模为

$$
\max_{\boldsymbol\varsigma[t],\mathbf R^b[t],\mathbf R^s[t]}\ \sum_{t=1}^{M}C\left(\boldsymbol\varsigma[t],\mathbf R^b[t],\mathbf R^s[t]\right) \tag{30a}
$$

$$
\text{s.t.}\quad 0\le\omega_l[t]\le\omega_{b,\max},\quad\forall l\in\mathcal L,\ t\in\mathcal T, \tag{30b}
$$

$$
0\le\omega_a[t]\le\omega_{s,\max},\quad\forall a\in\mathcal L,\ t\in\mathcal T, \tag{30c}
$$

$$
\varsigma_{\min}\le\varsigma_l[t]\le\varsigma_{\max},\quad\forall l\in\mathcal L,\ t\in\mathcal T, \tag{30d}
$$

$$
q_{b,\min}\le\left\|\mathbf q_l^b[t]\right\|\le q_{b,\max},\quad\forall l\in\mathcal L,\ t\in\mathcal T, \tag{30e}
$$

$$
\left\|\mathbf q_l^b[t]-\mathbf q_l^b[t-1]\right\|\le q_{b,\Delta t},\quad\forall l\in\mathcal L,\ t\in\mathcal T, \tag{30f}
$$

$$
\left(\mathbf i_a^b[t]\right)^T\left(\mathbf q_{l'}^b[t]-\mathbf q_l^b[t]\right)\le0,\quad\forall l\neq l',\ l,l'\in\mathcal L,\ t\in\mathcal T, \tag{30g}
$$

$$
\arccos\left(\frac{\mathbf q_l^b[t]\cdot\mathbf q_{l'}^b[t]}{\left\|\mathbf q_l^b[t]\right\|\left\|\mathbf q_{l'}^b[t]\right\|}\right)\ge\vartheta_1,\quad\forall l\neq l',\ l,l'\in\mathcal L,\ t\in\mathcal T, \tag{30h}
$$

$$
\arccos\left(\left|\frac{\mathbf q_l^b[t]\cdot\mathbf i^b[0]}{\left\|\mathbf q_l^b[t]\right\|\left\|\mathbf i^b[0]\right\|}\right|\right)\ge\vartheta_2,\quad\forall l\in\mathcal L,\ t\in\mathcal T, \tag{30i}
$$

$$
\arccos\left(\left|\frac{\mathbf q_l^b[t]\cdot\mathbf i_a^b[t]}{\left\|\mathbf q_l^b[t]\right\|\left\|\mathbf i_a^b[t]\right\|}\right|\right)\ge\vartheta_3,\quad\forall l\in\mathcal L,\ l=a,\ t\in\mathcal T, \tag{30j}
$$

其中 $\omega_{b,\max}$ 与 $\omega_{s,\max}$ 分别表示支撑杆与 6DMA 表面的最大角速度。杆的伸缩极限由每时隙缩放因子 $[\varsigma_{\min},\varsigma_{\max}]$ 与整体长度范围 $[q_{b,\min},q_{b,\max}]$ 定义。约束 (30b)–(30d) 保证各支撑杆与 6DMA 表面的旋转角速度处于机械极限内；约束 (30e) 把 6DMA 表面中心的空间域限制在 BS 预定义的三维运行空间内；通过把每个 6DMA 表面的增量位移限制为每时隙最大行程 $q_{b,\Delta t}$，约束 (30f) 保证运动平滑可控并缓解不切实际的位置波动；约束 (30g) 利用表面法向的半空间投影缓解不利朝向引起的表面间信号反射；几何约束 (30h)–(30j) 强制各天线部件之间的最小角间隔，以防止机械碰撞并降低耦合²。

> **原文疑点：** 约束 (30c) 中表面旋转角速度限制写作 $\forall a\in\mathcal L$，但 6DMA 表面索引集合为 $\mathcal A$（第 II-A 节定义 $a\in\mathcal A=\{1,\dots,A\}$），疑为集合记号笔误；此处按原文照录并加注。

> **原文脚注 2：** 由于 CKM 提供信道状态，我们假设准静态信道，此时天线运动时延可容忍。

问题 (30a) 的核心在于最大化整个周期上的系统总谱效，其表达式是涉及多维旋转参数规划的矩阵对数行列式函数。虽然对数行列式函数在固定线性信道参数下是凸的，但导向矢量与天线增益的计算依赖耦合角度变量与单位向量的三角函数，无法用简单凸优化方法处理。此外，相对位置与法向量关系同时依赖杆累积旋转与表面累积旋转，使目标函数在位置与旋转参数的联合空间上非凸，复杂的变量交互进一步加剧非线性。且几何约束 (30g)–(30j) 涉及由点积、范数与 arccos 函数组合形成的非线性边界，无法用线性或凸二次约束表示，引入额外非凸性。

### B. 问题转化

为应对所建 6DMA 优化问题中的高维优化空间、非凸变量与复杂几何约束，我们提出基于流形的优化框架。传统欧氏空间方法难以处理复合旋转、机械约束与耦合时空变量引起的高维性与非凸性。相反，借助李群理论，我们在乘积流形上重述该问题：把旋转自由度视为 SO(3) 流形上的点，而平移自由度在其相应欧氏子空间中优化。该做法符合黎曼优化原理。具体地，我们优化的旋转矩阵属于 SO(3)，即所有行列式为 1 的 $3\times3$ 正交矩阵集合。作为李群，SO(3) 构成光滑流形，是旋转优化的自然几何空间。把旋转视为该 SO(3) 流形上的点，可利用其内蕴几何规避欧拉角等传统参数化的奇异点、计算冗余与几何相关性失真 [26]。这些因素促使我们把问题映射到流形空间上求解。下面各小节详述如何在流形空间中表示与求解该问题。

**1) 优化参数平滑。** 为处理优化参数，我们把其优化重构为流形上的映射。对特殊正交群 SO(3)，其对应李代数 $\mathfrak{so}(3)$ 的几何刻画可描述为群单位元 $e\in\mathrm{SO}(3)$ 处的切空间 [27]。对任意 $t\in\mathcal T$ 与 $l\in\mathcal L$，旋转参数集可表示为 $\boldsymbol\Theta_l[t]\in\mathbb R^3$，其中 $\boldsymbol\Theta_l[t]=\theta_l[t]\mathbf u_l[t]$、$\theta_l[t]=\|\boldsymbol\Theta_l[t]\|$。通过反对称同构算子 $(\cdot)^\times:\mathbb R^3\to\mathfrak{so}(3)$，它被映射为李代数形式

$$
\boldsymbol\Theta_l[t]^\times=\begin{pmatrix}0 & -\Theta_l^3[t] & \Theta_l^2[t]\\ \Theta_l^3[t] & 0 & -\Theta_l^1[t]\\ -\Theta_l^2[t] & \Theta_l^1[t] & 0\end{pmatrix}\in\mathfrak{so}(3), \tag{31}
$$

其中 $\mathfrak{so}(3)$ 表示由所有三阶反对称矩阵构成的李代数，$\Theta_l^i[t]$（$i=1,2,3$）表示旋转向量 $\boldsymbol\Theta_l[t]$ 的第 $i$ 个分量。李代数中任意元素 $\boldsymbol\Theta_l[t]^\times\in\mathfrak{so}(3)$ 可通过指数映射 $\exp_{\mathrm{SO}(3)}:\mathfrak{so}(3)\to\mathrm{SO}(3)$ 表示为其李群元素 $\mathbf R_l(\theta_l[t],\mathbf u_l[t])\in\mathrm{SO}(3)$：

$$
\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)=\exp_{\mathrm{SO}(3)}\left(\boldsymbol\Theta_l[t]^\times\right)=\mathbf I_3+\frac{\sin\theta_l[t]}{\theta_l[t]}\boldsymbol\Theta_l[t]^\times+\frac{1-\cos\theta_l[t]}{\theta_l[t]^2}\left(\boldsymbol\Theta_l[t]^\times\right)^2, \tag{32}
$$

其中 $\theta_l[t]=\|\boldsymbol\Theta_l[t]\|$ 表示 $\boldsymbol\Theta_l[t]\in\mathbb R^3$ 的范数。对数映射 $\mathrm{Log}_{\mathrm{SO}(3)}:\mathrm{SO}(3)\to\mathfrak{so}(3)$ 作为指数映射的逆，把特殊正交群流形上的元素映射到其李代数，定义为

$$
\boldsymbol\Theta_l[t]^\times=\mathrm{Log}_{\mathrm{SO}(3)}\left(\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)\right)=\frac{\theta_l[t]}{2\sin\theta_l[t]}\left(\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)-\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)^T\right), \tag{33}
$$

其中

$$
\theta_l[t]=\arccos\left(\frac{\mathrm{tr}\left(\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)\right)-1}{2}\right). \tag{34}
$$

$$
\boldsymbol\Theta_l[t]^\times=\frac{\theta_l[t]}{2\sin\theta_l[t]}\left(\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)-\mathbf R_l\left(\theta_l[t],\mathbf u_l[t]\right)^T\right). \tag{35}
$$

类似地，表面旋转参数 $(\theta_a[t],\mathbf u_a[t])$ 可通过同一机制表示为本地 CCS 中的李群元素 $\mathbf R_a[t]\in\mathrm{SO}(3)$ 及其对应李代数元素 $\boldsymbol\Theta_a[t]^\times$。另一参数 $\varsigma_l\in\mathbb R_+$（$\forall l\in\mathcal L$）可视为正实数的一维流形。此时总参数空间构成无约束乘积流形，定义为

$$
\mathcal M:=\prod_{t=1}^{T}\prod_{l=1}^{L}\left(\mathbb R_+\times\mathrm{SO}(3)\times\mathrm{SO}(3)\right). \tag{36}
$$

乘积流形保持光滑性并继承黎曼度量 [26]。于是可用记号 $x\in\mathcal M$ 表示任何符合流形结构的可行解集合。该重参数化之所以强大，是因为定义有效旋转矩阵的正交约束由 SO(3) 空间的几何天然满足。因此，原欧氏空间中涉及复杂矩阵约束的问题被转化为流形上的优化问题，其中旋转约束由流形结构隐式处理，从而显著简化问题。

**2) 约束条件平滑。** 尽管流形框架优雅地处理了旋转的内在几何约束，优化问题 (30) 仍受一组物理与运动学不等式约束。主要挑战在于这些约束（控制避碰与角速度上限等）由于使用范数与条件逻辑而本质非光滑，这种不可微性使其与我们希望使用的基于梯度的黎曼优化方法不兼容。为此，我们利用平滑精确惩罚度量把约束问题重构为流形上的光滑无约束问题。我们的方法采用混合策略以高效处理不同约束类型。

第一，对定义简单边界的约束，我们采用重参数化：该方法按构造强制约束，增强数值稳定性。具体地，(30d) 中的伸缩缩放因子约束通过把无约束向量 $\varsigma_l^m[t]\in\mathbb R$ 映射为有效缩放因子 $\varsigma_l[t]$ 处理：

$$
\varsigma_l[t]=\varsigma_{\min}+\left(\varsigma_{\max}-\varsigma_{\min}\right)\frac{1}{1+e^{\varsigma_l^m[t]}},\quad\forall l\in\mathcal L. \tag{37}
$$

第二，对更复杂的几何与运动学约束（记索引集为 $\mathcal I_{\mathrm{6DMA}}$），我们先经简单代数变换把它们化为标准形式 $g_i(x)\le0$。该形式中 $g_i(x)>0$ 表示违反第 $i$ 个约束。例如最大角速度约束 $0\le\omega_l[t]\le\omega_{b,\max}$ 重写为

$$
g_{1,l,t}(x)=-\omega_l[t]\le0,\quad\forall l\in\mathcal L, \tag{38}
$$

$$
g_{2,l,t}(x)=\omega_l[t]-\omega_{b,\max}\le0,\quad\forall l\in\mathcal L. \tag{39}
$$

然而标准精确惩罚项 $\max(0,g_i(x))$ 不适用，因为 max 算子不可微。因此我们以其连续可微近似——对数求和指数（LSE）函数 [28] 替代。对更复杂的、依赖状态的几何约束，我们直接对其惩罚项采用平滑技术。(30e)–(30j) 中的约束被重构为惩罚函数：

$$
\sum_{i\in\mathcal I_{\mathrm{6DMA}}}\rho_i\mu\log\left(1+e^{g_i(x)/\mu}\right),\quad\forall t\in\mathcal T, \tag{40}
$$

其中 $\mu>0$ 是全局平滑参数，$\boldsymbol\rho$ 是惩罚权重向量。这些参数的选择涉及关键折中：当 $\mu\to0$ 时 LSE 函数更精确逼近真实惩罚，但其梯度数值不稳定；反之当惩罚权重 $\rho_i\to\infty$ 时，解被驱动到严格满足相应约束，但常以收敛缓慢或振荡为代价，因为优化优先考虑可行性而非目标改进。此外，本文考虑的物理约束在维度与尺度上差异显著，单一统一惩罚权重效率低下。为应对该多尺度挑战，我们的方法对向量 $\boldsymbol\rho$ 中每个惩罚权重 $\rho_i$ 独立更新，从而获得更有针对性、更高效的收敛过程。

**3) 光滑无约束优化问题。** 把平滑惩罚项并入原目标函数，约束优化问题 (30) 可重构为乘积流形 $\mathcal M$ 上的光滑无约束优化问题：

$$
\min_{x\in\mathcal M}\ P(x;\boldsymbol\rho,\mu)=-f(x)+\sum_{i\in\mathcal I_{\mathrm{6DMA}}}\rho_i\mu\log\left(1+e^{g_i(x)/\mu}\right), \tag{41}
$$

其中 $P(x;\boldsymbol\rho,\mu)$ 表示惩罚目标函数。LSE 近似保证惩罚项在 $\mathcal M$ 上处处可微，从而可应用基于黎曼梯度的优化算法。理论上，若忽略平滑函数的近似误差，该方法即为精确惩罚度量。与欧氏情形类似，黎曼流形上有一个已知性质：足够大但有限的惩罚权重 $\rho$ 足以使惩罚问题的解与原约束问题的解完全一致 [29]。

## IV. 所提求解方案

### A. 切空间与梯度

优化问题 (41) 定义在三维变换群上，使通过欧氏嵌入的常规反向传播不再适用。此类嵌入引入奇异点、可能引发梯度爆炸，并膨胀计算图。我们采用直接在流形切空间上运行的反向传播方法规避这些问题：该方法保持内在李群结构，通过避免嵌入策略的陷阱确保数值稳定性 [30]。

由于标准加减法未对群元素定义，我们必须重新定义这些运算。对任意两个元素 $X,Y\in\mathcal M$ 与李代数向量 $\boldsymbol\xi\in\mathbb R^3$，基于 (32) 与 (33) 的指数、对数映射，按 [31] 的约定定义为

$$
\oplus:\mathbb R^3\times\mathcal M\to\mathcal M,\qquad \boldsymbol\xi\oplus X=\exp(\boldsymbol\xi)\circ X, \tag{42}
$$

$$
\ominus:\mathcal M\times\mathcal M\to\mathbb R^3,\qquad X\ominus Y=\log\left(X\cdot Y^{-1}\right), \tag{43}
$$

其中 $\oplus$ 算子用李代数向量 $\boldsymbol\xi$ 扰动元素 $X$，$\ominus$ 把流形上的差映射回切空间，$\circ$ 是二元算子，使两个群元素组合为第三个元素 $X\circ Y\in\mathcal M$。对李群上的函数 $f:\mathcal M\to\mathcal M'$，其微分被推广为对切空间扰动的响应：

$$
Df(X)[\mathbf v]=\lim_{t\to0}\frac{f(t\mathbf v\oplus X)\ominus f(X)}{t}, \tag{44}
$$

其中 $\mathbf v\in T_X\mathcal M$ 是 $X$ 处切空间中的向量。这里 $Df(X)$ 表示映射 $f$ 在 $X$ 处的微分，是相应切空间之间的线性变换。该算子把输入 $X$ 切空间中的无穷小扰动 $\mathbf v$ 映射为输出 $f(X)$ 切空间中对应的扰动。这种表述推广了标准 Jacobian 矩阵，从而可对定义在流形上的函数应用链式法则。

把标准正交基向量代入 (44)，得到 Jacobian 矩阵 $\mathbf J\in\mathbb R^{\dim(\mathcal M')\times\dim(\mathcal M)}$：

$$
J_{ij}=\lim_{t\to0}\frac{\left\langle f\left(t\mathbf e_j\oplus X\right)\ominus f(X),\mathbf e_i'\right\rangle}{t}, \tag{45}
$$

其中 $\langle\cdot,\cdot\rangle$ 表示 $\mathcal M'$ 切空间上定义的内积。注意对欧氏空间，指数与对数映射为恒等映射，群乘法 $\circ$ 退化为向量加法；当函数输入输出均为欧氏空间变量时，(45) 与标准方向导数定义一致。该框架因此可同时处理缩放与旋转分量。

### B. 计算图与反向传播

我们把 6DMA 谱效优化过程建模为计算图，其原理如图 4 所示。该图是混合结构：节点表示来自欧氏空间或李群流形的元素，边表示其间的可微映射。实现借助 LieTorch——一个在每个群元素的切空间中直接执行反向传播、而不将其嵌入欧氏空间的 PyTorch 库。优化通过反向传播计算梯度；欧氏变量的梯度用标准偏微分求得，而流形元素需要专门方法。对映射于流形之间的函数 $Y=f(X)$，损失函数 $L$ 关于 $X$ 的梯度经链式法则传播为

$$
\frac{\partial L}{\partial X}=\frac{\partial L}{\partial Y}\frac{\partial Y}{\partial X}=\frac{\partial L}{\partial Y}\mathbf J, \tag{46}
$$

其中 $\partial L/\partial X$ 是与 $X$ 切空间同维的行向量，$\mathbf J$ 是 (45) 中的 Jacobian 矩阵，(46) 计算 Jacobian–向量积。

**1) 经群乘法的梯度传播。** 经李群反向传播的核心挑战源于群乘法的非交换性，需要伴随算子在不同参考系之间变换切空间向量。对李群元素 $X$，伴随算子 $A_X$ 是联系切空间右作用与左作用参数化的线性映射，满足

$$
X\circ\exp(\mathbf a)=\exp\left(A_X(\mathbf a)\right)\circ X, \tag{47}
$$

其中 $\mathbf a$ 是 $X$ 的本地坐标系中的切空间向量。具体地，对 $X\in\mathrm{SO}(3)$，伴随算子即旋转矩阵本身，即 $A_X=X$ [31]。对群乘法 $Z=X\circ Y$（$X,Y\in\mathrm{SO}(3)$），梯度 $\partial L/\partial Z$ 反向传播到 $X$ 与 $Y$。关于 $X$ 的微分为

$$
Df(X)[\mathbf v]=\lim_{t\to0}\frac{\mathrm{Log}\left((e^{t\mathbf v}XY)(XY)^{-1}\right)}{t}=\lim_{t\to0}\frac{\mathrm{Log}\left(e^{t\mathbf v}\right)}{t}=\mathbf v. \tag{48}
$$

关于 $Y$ 的微分需借伴随算子处理非交换性：

$$
Df(Y)[\mathbf v]=\lim_{t\to0}\frac{\mathrm{Log}\left((Xe^{t\mathbf v}Y)(XY)^{-1}\right)}{t}=\lim_{t\to0}\frac{\mathrm{Log}\left(Xe^{t\mathbf v}X^{-1}\right)}{t}=\lim_{t\to0}\frac{\mathrm{Log}\left(e^{A_X\cdot t\mathbf v}\right)}{t}=A_X\cdot\mathbf v. \tag{49}
$$

因此反向传播的梯度为

$$
\frac{\partial L}{\partial X}=\frac{\partial L}{\partial Z},\qquad \frac{\partial L}{\partial Y}=\frac{\partial L}{\partial Z}\cdot A_X. \tag{50}
$$

**2) 对数映射与切空间梯度。** 在欧氏空间中梯度直接表为坐标增量；而在切空间中，梯度必须表为流形上的局部扰动，切空间增量经指数映射到李群以实现参数更新。利用 (33) 定义的指数映射与 (44) 定义的微分函数，对 $\boldsymbol\varphi=\mathrm{Log}(X)$，该过程可表示为

$$
D\,\mathrm{Log}(X)[\mathbf v]=\lim_{t\to0}\frac{\mathrm{Log}\left(\exp(t\mathbf v)\circ X\right)-\mathrm{Log}(X)}{t}, \tag{51}
$$

其中 $D\,\mathrm{Log}(X)[\mathbf v]$ 定义从 $X$ 切空间扰动 $\mathbf v$ 到李代数中相应变化（即 Log 映射输出）的线性映射。基于 Baker–Campbell–Hausdorff 公式 [32] 可得

$$
\lim_{\boldsymbol\varphi\to0}\mathrm{Log}\left(\exp(\delta\boldsymbol\xi)\exp(\boldsymbol\varphi)\right)\approx\boldsymbol\varphi+\mathbf J_l^{-1}(\boldsymbol\varphi)\delta\boldsymbol\varphi. \tag{52}
$$

具体地，对 $X\in\mathrm{SO}(3)$，$\mathbf J_l^{-1}(\boldsymbol\varphi)$ 有闭式表达 [31]：

$$
\mathbf J_l^{-1}(\boldsymbol\varphi)=\mathbf I_{3\times3}-\frac12\hat{\boldsymbol\varphi}+\left(\frac{1}{\varphi^2}-\frac{1+\cos\varphi}{2\varphi\sin\varphi}\right)\left(\hat{\boldsymbol\varphi}\right)^2. \tag{53}
$$

最后，切空间中的向量可表为

$$
\frac{\partial L}{\partial X}=\frac{\partial L}{\partial\boldsymbol\varphi}\cdot\mathbf J_l^{-1}(\boldsymbol\varphi). \tag{54}
$$

> **图 4（原文 Fig. 4）：** 具李群嵌入的计算图更新机制。以前向传播的旋转矩阵 $\mathbf R_l(\theta_l[t],\mathbf u_l[t])$ 为例，其梯度不在常规欧氏空间中计算，而是在对应切空间 $\boldsymbol\Theta_l[t]^\times\in\mathfrak{so}(3)$ 内做反向传播与梯度计算。优化器得到的更新向量 $\delta_l[t]$ 位于该切空间，随后经 $\exp_{\mathrm{SO}(3)}$ 映射回 SO(3) 流形以更新 $\mathbf R_l(\theta_l[t],\mathbf u_l[t])$。

### C. 整体算法

求解黎曼流形上的约束优化问题时，精确惩罚度量通过引入惩罚项把约束转化为无约束问题；但惩罚参数 $\rho$ 的选择至关重要。[29] 指出，当 $\rho$ 超过某阈值时，惩罚函数问题的局部极小解与原问题一致。由于该阈值常未知，设置过大初始 $\rho$ 可能恶化条件数、拖慢收敛。为化解该折中，我们的策略先在惩罚权重适中时优先探索目标函数地形，避免优化器过早受约束；当解收敛到有前景区域后，再系统增大惩罚权重以严格强制约束、把迭代引导进可行集。因此我们提出两阶段自适应惩罚权重更新策略，动态平衡目标函数与约束满足。预热阶段按约束违反比例分配初始惩罚权重，使约束项与目标函数量级相当：

$$
\rho_i^w=\max\left(\rho_{\min},\min\left(\frac{V_if(x_w)}{\sum_{i'\in\mathcal I_{\mathrm{6DMA}}}V_{i'}},\rho_{\max}\right)\right), \tag{55}
$$

其中 $V_i=\mu_w\log(1+\exp(g_i(x_w)/\mu_w))$ 表示第 $i$ 个约束的平滑违反度量，$f(x_w)$ 表示当前目标函数值。正式阶段按历史权重 $\rho_{w-1}^i$ 与当前约束严重程度自适应调整权重：

$$
\rho_w^i=\min\left(\rho_{w-1}^i\left(1+\gamma V_i\right),\rho_{\max}\right), \tag{56}
$$

其中 $\gamma$ 是更新步长。平滑因子 $\mu_w$ 更新为

$$
\mu_{w+1}=\max\left\{\mu_{\min},\varrho_\mu\mu_w\right\}, \tag{57}
$$

其中 $\mu_{\min}$ 是平滑参数的最小允许值，$\varrho_\mu\in(0,1)$ 是平滑衰减因子。由于不同 $\rho$ 与 $\mu$ 取值对应不同解，更新后我们把新形成的问题视为子问题。梯度容差决定优化算法收敛的精度阈值，其变化直接影响迭代终止条件与子问题解精度：减小梯度容差可驱使算法逼近更严格的稳定点、提升解精度，但增加迭代次数与计算时间。在初始迭代阶段算法倾向探索可行解、不需要极高精度，故我们对梯度容差采用类似的动态调整策略：

$$
\epsilon_{w+1}=\max\left\{\epsilon_{\min},\varrho_\epsilon\epsilon_w\right\}, \tag{58}
$$

其中 $\varrho_\epsilon\in(0,1)$ 是梯度容差衰减因子。利用指数映射 (33)、对数映射 (32) 与微分函数 (51)，可得切空间增量，并经指数映射到李群实现参数更新。子问题的解 $x_s$ 可由切空间反向传播方法得到，更新过程为

$$
x_{s+1}=\exp\left(-\varrho_x\nabla_{\delta_s}P\left(x_s;\boldsymbol\rho_w,\mu_w\right)\right)\circ x_s, \tag{59}
$$

其中 $\delta_s=\mathrm{Log}_{\mathrm{SO}(3)}(x_s)$ 表示 $x_s$ 的对数映射，$\nabla_{\delta_s}P(x_s;\boldsymbol\rho_w,\mu_w)$ 表示惩罚目标函数关于 $\delta_s$ 的黎曼梯度，$\varrho_x$ 是学习率。子问题在达到最大探索步数或满足 $\|\nabla_{\delta_s}P(x_{s+1};\boldsymbol\rho_w,\mu_w)\|\le\epsilon_w$ 时终止。

> **算法 1　基于流形与动态惩罚调整的谱效优化**
> **Input：** 初始参数 $x_0\in\mathcal M$、初始惩罚权重 $\boldsymbol\rho_0$、初始平滑因子 $\mu_0$、初始梯度容差 $\epsilon_0$、衰减因子 $\varrho_\mu,\vartheta_\epsilon\in(0,1)$、最小值 $\mu_{\min},\epsilon_{\min}$、距离阈值 $d_{\min}$、学习率 $\varrho_x$、迭代计数 $s_{\max},w_{\max}$
> **Output：** 优化后的 6DMA 控制参数 $x^\ast$
> 1: 初始化：$x\leftarrow x_0$，$\boldsymbol\rho\leftarrow\boldsymbol\rho_0$，$\mu\leftarrow\mu_0$，$\epsilon\leftarrow\epsilon_0$，$w=0$
> 2: **repeat**
> 3: 　置 $s=0$
> 4: 　置子问题热启动点 $x_s\leftarrow x_w$
> 5: 　**repeat**
> 6: 　　按 (33) 计算对数映射 $\delta_s=\mathrm{Log}_{\mathrm{SO}(3)}(x_s)$
> 7: 　　按 (54) 计算黎曼梯度 $\nabla_{\delta_s}P(x_s;\boldsymbol\rho_w,\mu_w)$
> 8: 　　按 (32) 在流形上更新解 $x_{s+1}=\exp(-\varrho_x\nabla_{\delta_s}P(x_s;\boldsymbol\rho_w,\mu_w))\circ x_s$
> 9: 　　$s=s+1$
> 10: 　**until** $\|\nabla_{\delta_s}P(x_{s+1};\boldsymbol\rho_w,\mu_w)\|\le\epsilon_w$ 或 $s>s_{\max}$
> 11: 　更新迭代点 $x_w\leftarrow x_{s+1}$
> 12: 　更新平滑因子 $\mu_w\leftarrow\max\{\mu_{\min},\varrho_\mu\mu_w\}$
> 13: 　按 (55)、(56) 两阶段策略更新惩罚权重 $\boldsymbol\rho_w$
> 14: 　更新梯度容差 $\epsilon_w\leftarrow\max\{\epsilon_{\min},\vartheta_\epsilon\epsilon_w\}$
> 15: 　$w=w+1$
> 16: **until** $d(x_w,x_{w+1})<d_{\min}$、$\epsilon_w\le\epsilon_{\min}$ 且 $\mu_w\le\mu_{\min}$，或 $w>w_{\max}$
> 17: **return** $x^\ast\leftarrow x_{w+1}$

每次更新 $\boldsymbol\rho$、$\epsilon$ 与 $\mu$ 后，我们继续以热启动优化 $x_w$。当梯度范数满足

$$
\left\|\nabla_{\delta_w}P\left(x_w,\boldsymbol\rho_w,\mu_w\right)\right\|\le\epsilon_w \tag{60}
$$

时视为子问题近似求解完毕，得到迭代点 $x_{w+1}$。算法在第 $(w+1)$ 次迭代满足以下条件时终止：

$$
d\left(x_w,x_{w+1}\right)<d_{\min}, \tag{61}
$$

$$
\epsilon_w\le\epsilon_{\min}, \tag{62}
$$

$$
\mu_w\le\mu_{\min}, \tag{63}
$$

其中 $d(x_w,x_{w+1})=\|\mathrm{Log}_{x_w}(x_{w+1})\|_{x_w}$ 表示 $x_w$ 与 $x_{w+1}$ 之间的黎曼距离，$\|\cdot\|_{x_w}$ 表示切空间 $T_{x_w}\mathcal M$ 上的黎曼范数 [27]。这表明问题正逼近局部极小，且近似问题已足够接近原问题。理论上，在精确算术下，若最小步长 $d_{\min}$、最小平滑参数 $\mu_{\min}$ 与最小梯度容差 $\epsilon_{\min}$ 均取 0，且存在满足线性独立约束品格的可行极限点，则该点满足原问题的 KKT 条件 [29]。算法 1 详述的完整流程把流形优化与自适应惩罚机制结合以处理复杂运动学约束，构成所提方案的核心。为后续性能评估清晰方便，我们把该整体方法称为 CKM 赋能的运动学约束流形优化（KC-MO）。

## V. 仿真结果

本节通过数值结果评估所提 6DMA-BS 设计与算法在最大化总谱效方面的性能。所用 CKM 由智能射线追踪方法生成 [33]；安卡拉、柏林等城市地图来自 OpenStreetMap [34]。仿真场景中 UE、BS 与建筑高度分别设为 1.5 m、10 m 与 25 m，主要仿真参数见表 I；除另行说明，UE 移动模式用不同速度的随机游走建模。所有仿真使用 WinProp 软件执行 [35]，所报结果在四个环境上平均以保证一般性。图 5 给出所构建 CKM 的一个示例，说明其结构格式与所含信息。实际实现中，所提框架设想运行于中央控制器（如 BS 的中央处理单元或专用边缘服务器）：该控制器周期性执行轨迹优化——先用预测的 UE 位置查询 CKM 以获取未来服务时域的信道数据，再执行算法 1 计算最优且运动学可行的天线轨迹，最后把所得目标位置与朝向序列作为底层控制指令下发给 6DMA 执行器。借助 CKM 进行主动信道获取，使整个轨迹规划过程可离线完成，从而降低实时时延约束并确保主动优化方法的可行性。

为模拟真实运行场景，每个 6DMA 表面在预定义运行空间内以随机位置与朝向初始化；为清晰起见，假设 $\omega_{b,\max}=\omega_{s,\max}=\omega_{\max}$。由于算法具有自适应特性（随算法运行，全部惩罚权重 $\rho$ 最终趋于 $\infty$，而参数 $\mu$ 与 $\epsilon$ 趋于 0），初值 $(\boldsymbol\rho_0,\mu_0,\epsilon_0)$ 主要影响收敛速度。由于最优初值依场景而定、最好凭经验确定，这里不给出固定值。为验证所提方案的有效性，我们引入若干基准方案作性能比较。其中标为"Ideal"的方案作为理论上界，因为它们忽略天线的运动学约束（包括角速度与伸缩速度上限）。各基准方案的具体实现如下。

- **FPA：** 总天线数与其他方案相同，但部署于固定的传统三扇区构型；每个扇区的天线均匀分布，且在整个仿真中保持标准 15 度下倾角朝向地面。
- **Ideal AO（I-AO）：** [6] 在每个通信时隙用 AO 算法联合确定所有 6DMA 表面的最优位置与朝向；全部约束参数按 [6] 的设定设置。
- **Kinematically-constrained AO（KC-AO）：** 在每个时隙用 AO 算法计算最优位姿，再对所需运动做线性缩放以满足最大角速度约束。
- **Ideal LoS tracking（I-LT）：** 在每个时隙用 k-means 算法按地理位置对 UE 聚类；每个 6DMA 表面关联到特定 UE 簇，其法向量持续、瞬时地指向该簇的几何质心。
- **Kinematically-constrained without CKM manifold optimization（KC-WCKMMO）：** 采用流形优化框架，用当前时隙 CSI 确定下一时隙的天线位姿。
- **Ideal manifold optimization（I-MO）：** 在天线运动无任何运动学约束的条件下应用流形优化框架。

> **图 5（原文 Fig. 5）：** CKM 结构示例，包括 UE 位置、AOA 与路径增益映射。

> **表 I（原文 Table I）：** 关键仿真参数。

| 符号 | 参数描述 | 取值 |
|---|---|---|
| **系统与通信参数** | | |
| $\Delta t$ | 时隙长度 | 0.5 s |
| $p$ | 每 UE 发送功率 | 200 mW |
| $\lambda$ | 载波波长 | 0.125 m |
| $\sigma^2$ | 平均噪声功率 | −50 dBm |
| — | UE–BS 初始距离范围 | 20 m – 200 m |
| — | UE 移动速度 | 1–6 m/s |
| **6DMA 机械约束** | | |
| $J_k$ | 接收信道路径数 | 2 |
| $N$ | 每个 6DMA 表面的天线数 | 4 |
| $[\varsigma_{\min},\varsigma_{\max}]$ | 最小/最大伸缩缩放因子 | [0.95, 1.05] |
| $[q_{b,\min},q_{b,\max}]$ | 支撑杆长度范围 | [0.8, 1.5] m |
| $q_{b,\Delta t}$ | 每时隙表面最大位移 | 0.3 m |
| $\vartheta_1$ | 任意两个 6DMA 表面之间的最小夹角 | $\pi/15$ rad |
| $\vartheta_2$ | 表面与 BS 结构之间的最小夹角 | $\pi/8$ rad |
| $\vartheta_3$ | 表面与其支撑杆之间的最小夹角 | $\pi/12$ rad |

图 6 展示所提算法在随机选取的代表性仿真中的收敛过程，表明其能智能平衡谱效最大化与约束满足。在初始预热阶段，较小惩罚权重使算法积极探索解空间，系统谱效与瞬态约束违反率都快速上升。进入正式优化阶段后，算法重心转向优先保证可行性：随自适应惩罚权重增大，约束违反率迅速下降，谱效仅有轻微且可控的折中。该现象证实自适应惩罚机制成功引导优化过程趋向既高性能又鲁棒、物理可行的解。

> **图 6（原文 Fig. 6）：** 优化过程中关键指标的收敛。系统配置为 $K=2$ 个 UE、$M=10$ 个时隙、$A=2$ 个 6DMA 表面，最大角速度约束 0.1 rad/slot。

图 7 与图 8 比较各方案的性能。静态 FPA 与 I-LT 方法构成基准性能界，因为它们无法适应真实多径信道结构，因而无法利用可用空间自由度。反应式 KC-WCKMMO 方案初期表现良好但随后急剧下降，这是其短视优化策略的后果：该做法会陷入次优天线位姿，而从该位姿恢复在运动学上不可行。相反，无约束 I-AO 虽具有更优越的理论性能，但所需角速度在物理上难以实现，使其难以用于实际系统；通过线性缩放轨迹来强制约束的 KC-AO 方案性能甚至不如静态基准。而所提 KC-MO 框架在严格处于全部工程约束内的同时，成功取得与 I-AO 方案相当接近最优的结果。这归功于其端到端流形优化：整体求解轨迹问题，不因迭代近似或朴素约束处理而损失性能。

> **图 7（原文 Fig. 7）：** 不同天线朝向策略下累积总谱效随时隙的比较。系统配置为 $K=2$ 个 UE、$A=2$ 个 6DMA 表面，最大角速度约束 0.1 rad/slot。

> **图 8（原文 Fig. 8）：** 不同天线朝向策略下峰值瞬时角速度随时隙的变化。系统配置为 $K=2$ 个 UE、$A=2$ 个 6DMA 表面，最大角速度约束 0.1 rad/slot。

如图 9 所示，增大 UE 数 $K$ 因多用户分集而使所有方案的总谱效提升。关键在于，主动式 KC-MO 与反应式 KC-WCKMMO 的性能差距随 $K$ 增大而扩大：信道复杂度上升放大了 KC-WCKMMO 短视决策的代价，因为运动学约束使纠正过去次优位姿越来越困难。相反，I-LT 与 KC-AO 的性能不规则波动，因为它们在密集 UE 场景中缺乏持续利用空间自由度的适应性。该结果凸显所提 KC-MO 算法更优的鲁棒性与可扩展性。值得注意的是，FPA 的谱效随 UE 数稳定增长，而 KC-MO 的增长率呈放缓趋势，这表明我们的主动方案在侧重为少量目标提供高质量服务的场景中优势更显著。

> **图 9（原文 Fig. 9）：** 不同策略下总谱效随 UE 数 $K$ 的变化。系统配置为 $M=4$ 个时隙、$A=3$ 个表面，最大角速度约束 0.25 rad/slot。

图 10 表明，增大 6DMA 表面数 $A$ 会使所有方案性能提升，但提升程度差异显著。I-LT 与 KC-AO 等基准方法只有边际或不规则增益，未能有效利用额外自由度。值得注意的是，KC-MO 与 KC-WCKMMO 的性能差距呈非单调趋势：$A$ 较小时，KC-MO 的长期规划在资源受限环境中优势明显；$A$ 较大时，自由度充裕使短视的 KC-WCKMMO 也能以较少运动学代价找到有效构型，从而缩小差距。该动态凸显所提框架的高空间资源效率，尤其在复杂、运动学受限场景中，并确认先进优化算法是高效提供跟踪覆盖服务的关键。

> **图 10（原文 Fig. 10）：** 不同策略下总谱效随 6DMA 表面数 $A$ 的变化。系统配置为 $M=4$ 个时隙、$K=3$ 个 UE，最大角速度约束 0.25 rad/slot。

图 11 揭示最大角速度上限 $\omega_{\max}$ 对系统性能的影响。所提 KC-MO 方案的性能随 $\omega_{\max}$ 增大而提升，但在较高速度下增益趋缓，表明一旦系统具备足够机动性跟踪最优信道变化，继续提速的边际回报递减。形成鲜明对比的是，短视的 KC-WCKMMO 方案性能呈近似线性提升——该反应式策略不断利用更高机动性来补偿此前时隙的短视决策。同时 KC-AO 方案性能仍然较差且不稳定，因为其朴素轨迹截断方法始终无法产生连贯有效的路径。最终这些结果确认，所提 KC-MO 框架在中等速度上限下即可达到接近最优的性能，使设计者可采用经济型执行器、避免过度工程，从而平衡系统成本与能力。

> **图 11（原文 Fig. 11）：** 不同策略下总谱效随最大角速度上限 $\omega_{\max}$ 的变化。系统配置为 $A=3$ 个表面、$M=5$ 个时隙、$K=4$ 个 UE。

## VI. 结论

本文为应对主动 UE 跟踪挑战，提出一种 6DMA 赋能 BS 的长期轨迹优化方法，借助 CKM 获取预测信道信息。我们建立了在纳入 6DMA 复杂运动学与一整套物理约束的情况下最大化总谱效的问题。为求解该具有挑战性的非凸问题，我们提出一种新的流形优化框架：在 SO(3) 李群上运行，并使用基于切空间反向传播的自适应惩罚算法。大量仿真结果验证了所提方法的优越性能。与包括传统 FPA、I-AO、KC-AO、I-LT 与 KC-WCKMMO 在内的基准方案相比，KC-MO 在累积总谱效上显著提升；关键在于，该性能增益是在严格满足所有运动学与工程约束、并产生平滑且物理可行天线轨迹的条件下取得的。本工作探索了具运动学约束、CKM 赋能的 6DMA 系统的可行性，结果为潜在性能增益提供了有价值洞见，并为 6DMA 系统实际实现的未来研究提供了理论基准。

## 参考文献（英文原书目）

- [1] R. Sun et al., "A comprehensive survey of knowledge-driven deep learning for intelligent wireless network optimization in 6G," IEEE Commun. Surveys Tuts., early access, May 29, 2025, doi: 10.1109/COMST.2025.3574765.
- [2] R. Sun, N. Cheng, C. Li, F. Chen, and W. Chen, "Knowledge-driven deep learning paradigms for wireless network optimization in 6G," IEEE Netw., vol. 38, no. 2, pp. 70–78, Mar. 2024.
- [3] C. Wang, Z. Li, K.-K. Wong, R. Murch, C.-B. Chae, and S. Jin, "AI-empowered fluid antenna systems: Opportunities, challenges, and future directions," IEEE Wireless Commun., vol. 31, no. 5, pp. 34–41, Oct. 2024.
- [4] L. Zhu, W. Ma, and R. Zhang, "Movable antennas for wireless communication: Opportunities and challenges," IEEE Commun. Mag., vol. 62, no. 6, pp. 114–120, Jun. 2024.
- [5] C. Dou, Y. Wu, L. Qian, K.-K. Wong, and T. Q. S. Quek, "Fluid antenna empowered integration of sensing, communications and computing with hybrid multi-task offloading," IEEE Wireless Commun. Lett., vol. 14, no. 8, pp. 2521–2525, Aug. 2025.
- [6] X. Shao, Q. Jiang, and R. Zhang, "6D movable antenna based on user distribution: Modeling and optimization," IEEE Trans. Wireless Commun., vol. 24, no. 1, pp. 355–370, Jan. 2025.
- [7] X. Shao and R. Zhang, "6DMA enhanced wireless network with flexible antenna position and rotation: Opportunities and challenges," IEEE Commun. Mag., vol. 63, no. 4, pp. 121–128, Apr. 2025.
- [8] X. Shao et al., "A tutorial on six-dimensional movable antenna for 6G networks: Synergizing positionable and rotatable antennas," 2025, arXiv:2503.18240.
- [9] W. Ma, L. Zhu, and R. Zhang, "MIMO capacity characterization for movable antenna systems," IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 3392–3407, Apr. 2024.
- [10] L. Zhu, W. Ma, B. Ning, and R. Zhang, "Movable-antenna enhanced multiuser communication via antenna position optimization," IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7214–7229, Jul. 2024.
- [11] G. Hu et al., "Fluid antennas-enabled multiuser uplink: A low-complexity gradient descent for total transmit power minimization," 2023, arXiv:2312.05763.
- [12] W. Lyu, S. Yang, Y. Xiu, Z. Zhang, C. Assi, and C. Yuen, "Movable antenna enabled integrated sensing and communication," IEEE Trans. Wireless Commun., vol. 24, no. 4, pp. 2862–2875, Apr. 2025.
- [13] S. Peng et al., "Joint antenna position and beamforming optimization with self-interference mitigation in movable antenna aided ISAC system," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Mar. 2025, pp. 1–6.
- [14] Z. Feng, Y. Zhao, K. Yu, and D. Li, "Movable antenna empowered physical layer security without Eve's CSI: Joint optimization of beamforming and antenna positions," 2024, arXiv:2405.16062.
- [15] X. Shao, R. Zhang, Q. Jiang, J. Park, T. Q. S. Quek, and R. Schober, "Distributed channel estimation and optimization for 6D movable antenna: Unveiling directional sparsity," IEEE J. Sel. Topics Signal Process., vol. 19, no. 2, pp. 349–365, Mar. 2025.
- [16] Z. Xiao, X. Pi, L. Zhu, X.-G. Xia, and R. Zhang, "Multiuser communications with movable-antenna base station: Joint antenna positioning, receive combining, and power control," IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 19744–19759, Dec. 2024.
- [17] J. Wu et al., "Low-altitude wireless networks: A comprehensive survey," 2025, arXiv:2509.11607.
- [18] A. C. P. K. Siriwardhana, J. Yuan, and Z. Shen, "Optimizing handover mechanism in vehicular networks using deep learning and optimization techniques," Comput. Netw., vol. 270, Oct. 2025, Art. no. 111488.
- [19] X. Shao, R. Zhang, Q. Jiang, and R. Schober, "6D movable antenna enhanced wireless network via discrete position and rotation optimization," IEEE J. Sel. Areas Commun., vol. 43, no. 3, pp. 674–687, Mar. 2025.
- [20] Y. Zeng et al., "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1478–1519, 3rd Quart., 2024.
- [21] J. S. Dai, "Euler–Rodrigues formula variations, quaternion conjugation and intrinsic connections," Mechanism Mach. Theory, vol. 92, pp. 144–152, Oct. 2015.
- [22] Technical Specification Group Radio Access Network; Study on 3D Channel Model for LTE, document TR 36.873 V12.4.0, 3GPP, Dec. 2017.
- [23] L. Zhu, W. Ma, and R. Zhang, "Modeling and performance analysis for movable antenna enabled wireless communications," IEEE Trans. Wireless Commun., vol. 23, no. 6, pp. 6234–6250, Jun. 2024.
- [24] D. Wu, Y. Zeng, S. Jin, and R. Zhang, "Environment-aware hybrid beamforming by leveraging channel knowledge map," IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 4990–5005, May 2024.
- [25] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge, U.K.: Cambridge Univ. Press, 2005.
- [26] H. Sato, Riemannian Optimization and Its Applications, vol. 670. Cham, Switzerland: Springer, 2021.
- [27] N. Boumal, An Introduction to Optimization on Smooth Manifolds. Cambridge, U.K.: Cambridge Univ. Press, 2023.
- [28] C. Chen and O. L. Mangasarian, "Smoothing methods for convex inequalities and linear complementarity problems," Math. Program., vol. 71, no. 1, pp. 51–69, Nov. 1995.
- [29] C. Liu and N. Boumal, "Simple algorithms for optimization on Riemannian manifolds with constraints," Appl. Math. Optim., vol. 82, no. 3, pp. 949–981, Dec. 2020.
- [30] Z. Teed and J. Deng, "Tangent space backpropagation for 3D transformation groups," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR), Jun. 2021, pp. 10333–10342.
- [31] J. Sola, J. Deray, and D. Atchuthan, "A micro lie theory for state estimation in robotics," 2018, arXiv:1812.01537.
- [32] T. D. Barfoot, State Estimation for Robotics. Cambridge, U.K.: Cambridge Univ. Press, 2024.
- [33] T. Rautiainen, G. Wolfle, and R. Hoppe, "Verifying path loss and delay spread predictions of a 3D ray tracing propagation model in urban environment," in Proc. IEEE 56th Veh. Technol. Conf., vol. 4, Feb. 2002, pp. 2470–2474.
- [34] OpenStreetMap Contributors, (2017). Planet Dump. [Online]. Available: https://www.openstreetmap.org
- [35] R. Hoppe, G. Wolfle, and U. Jakobus, "Wave propagation and radio network planning software WinProp added to the electromagnetic solver package FEKO," in Proc. Int. Appl. Comput. Electromagn. Soc. Symp. Italy (ACES), Mar. 2017, pp. 1–2.

## 图注与表注索引

本页图 1–11 的中文图注与表 I 的表注均按原文出现位置内联在正文中（图 1、2 见第 II 节，图 3 见第 II-B 节末，图 4 见第 IV-B 节，图 5–11 与表 I 见第 V 节），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 IEEE Trans. Wireless Commun.（vol. 25, 2026, pp. 8968–8981）正式版全文（本地 PDF 14 页）的中文译稿：摘要、索引词、第 I–VI 节正文、图 1–11 的中文图注、表 I 的逐格转写、算法 1 伪代码、式 (1)–(63)，以及参考文献 35 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(63) 逐式核对（重点 (1)–(9)、(16)–(27)、(30a)–(30j)、(31)–(41)、(42)–(59)）；表 I 用第 11 页渲染图逐格核对（系统与通信参数 6 行、6DMA 机械约束 8 行的符号、描述与取值全部一致）。已加注一处原文疑点：(30c) 中表面旋转角速度约束写作 $\forall a\in\mathcal L$，而表面索引集合为 $\mathcal A$，疑为集合记号笔误。本页不上传原文图片，图 5–11 的 CKM 示意与性能曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。**再传播许可待核验，本页仅作学习用途，不计入可公开全文。** 逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

{% endraw %}
