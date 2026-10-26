---
layout: page
title: "信道知识地图赋能的运动学约束 6DMA 系统｜中文译稿（未完）"
permalink: /papers/translations/2026-10-26-ckm-6dma-manifold/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原论文 DOI](https://doi.org/10.1109/TWC.2025.3645480)

# 信道知识地图赋能的运动学约束六维可移动天线系统：一种流形优化方法

**原题**：Channel Knowledge Map-Enabled 6D Movable Antenna Systems With Kinematic Constraints: A Manifold Optimization Approach  
**作者**：Nan Cheng、Shuangyu Yang、Ruijin Sun、Zhisheng Yin、Xiaodan Shao、Weihua Zhuang、Xuemin Shen  
**来源**：IEEE Transactions on Wireless Communications, Vol. 25, 2026，DOI: 10.1109/TWC.2025.3645480。  
**翻译进度**：目前仅完成摘要、关键词、引言开篇以及系统模型部分段落。**此页不是全文译文，未通过全文 QA，不应计入全文完成量。** 后续章节、全部数学推导及图表尚未逐页翻译与校核。

## 摘要

六维可移动天线（six-dimensional movable antenna，6DMA）通过在物理空间中重新配置天线的位置和朝向，为提升无线传输性能提供了一种潜在解决方案。然而，现有以瞬时快照为基础的反应式方法忽略了天线运动学约束和系统时延，因此不适合连续跟踪移动用户设备（user equipment，UE）。为克服上述局限，本文提出一种主动式方法，将 UE 跟踪建模为单个长期 6DMA 轨迹优化问题，以最大化总频谱效率。

借助信道知识地图（channel knowledge map，CKM）提供的预测数据，所提模型统一纳入系统复杂的运动学约束和物理约束，包括速度限制与安全距离，从而确保生成的轨迹在物理上可执行。为求解这一高维非凸问题，本文开发了一种新的流形优化算法。该方法将天线的旋转状态映射至特殊正交群 SO(3)，并结合自适应惩罚度量与切空间反向传播实现高效求解。仿真结果表明，所提方法在确保天线轨迹连续且物理可行的同时，相比基准方案能够显著提高总频谱效率。

**关键词**：六维可移动天线；轨迹优化；主动跟踪；信道知识地图；流形优化；运动学约束；频谱效率。

## I. 引言（开篇译文）

为了满足未来无线网络对容量的需求，多输入多输出（MIMO）技术发挥了重要作用，并逐步演进为大规模和超大规模天线系统，以提高频谱效率。然而，下一代系统对固定位置天线（fixed-position antenna，FPA）的依赖，尤其是在复杂场景中采用高频段和大规模阵列的情况下，已经造成高昂成本，并使性能增益逐渐递减。这促使研究人员探索更高效地利用空间自由度的方法 [1]–[3]。

可移动天线（movable antenna，MA）技术由此成为一种很有前景的解决方案。与 FPA 不同，MA 能够在物理空间中改变位置，寻找更优的信道条件 [4]、[5]。六维可移动天线（6DMA）概念在三维平移自由度之外，进一步引入三维旋转能力 [6]、[7]。这些共计六个自由度使基站（BS）无需增加天线数量，就能够精细调整阵列几何形态和朝向，从而增强波束成形和空间复用能力 [8]。MA/6DMA 的核心思想，是在优化传统通信参数的同时，联合优化天线位置与朝向。

这一方向已有研究包括：联合优化天线位姿和波束成形，以最大化总速率 [9]、[10] 或最小化发射功率 [11]；将该技术应用于通信感知一体化 [12]、[13] 和物理层安全 [14]；以及针对所有可能天线位姿设计信道估计方法 [15]。

尽管应用前景广阔，现有 6DMA 研究仍主要采用基于瞬时快照的静态优化范式：根据给定时刻的瞬时信道状态信息（CSI），寻找一个固定的最优天线位姿。然而，这种反应式策略本质上缺乏前瞻性。它将各个时刻的状态独立优化，因而忽略了运动的物理约束，以及所得轨迹的长期性能。

这一方法在低移动性或准静态信道场景下的有效性已得到验证 [10]、[16]。但无人机跟踪 [17]、车联网 [18] 等高速移动且具有任务关键性要求的应用不断涌现，因而需要从反应式调整转向主动式、长期轨迹优化，以保证连续、高保真的服务。

## II. 系统模型（已译起始部分）

本节首先介绍所考虑的 6DMA 基站及其面向移动 UE 的上行通信模型，随后介绍 UE 移动模型、天线运动模型及相应的信道模型。

### A. 6DMA 基站模型

如原文图 1 所示，考虑一个多用户上行通信系统，基站在服务时域 \(T\) 内为 \(K\) 个移动 UE 提供服务。将这一时域均匀划分为 \(M\) 个时隙，索引集合为 \(\mathcal T=\{1,2,\ldots,M\}\)，每个时隙的长度为 \(\Delta t=T/M\)。

基站配备 \(A\) 个 6DMA 表面，表面索引集合为 \(\mathcal A=\{1,2,\ldots,A\}\)。每个表面为包含 \(N\) 个天线单元的均匀平面阵列（UPA）。每个 UE 配备一根固定位置天线。模型的一项关键假设是：**基站事先准确获知全部 UE 的时空轨迹**。因此，可以跨时隙动态调整每个 6DMA 表面的三维位置和朝向，为已知轨迹提供针对性的通信服务。

每个 6DMA 表面通过可伸缩、可旋转的支撑杆与基站中央处理单元相连，支撑杆中嵌有柔性导线。支撑杆末端借助万向节连接 6DMA 表面。通过控制支撑杆的伸缩、旋转与三维运动，可以灵活调整表面中心在三维空间中的位置及其相对法线的偏转角。

以支撑杆与基站的连接点为全局笛卡尔坐标系原点。第 \(l\) 根支撑杆末端的位置为 \(\mathbf q_l^{b}[t]\)，旋转轴单位向量为 \(\mathbf u_l[t]\)，角速度为 \(\omega_l[t]\)。时隙内的转角满足 \(\theta_l[t]=\omega_l[t]\Delta t\)。利用 Rodrigues 旋转公式，可以由上一时隙的状态计算新的支撑杆位置。第 \(a\) 个阵面的局部坐标系则以支撑杆与该阵面的连接点为原点，阵面本身的姿态由另一组三维旋转状态刻画。

**原文图 1**：具备 6DMA 的基站主动跟踪 UE 的示意场景。借助长期轨迹优化，基站平滑调整天线位置与朝向，从而沿 UE 的移动轨迹维持连续、稳健的通信链路。

**原文图 2**：第 \(a\) 个 6DMA 表面的六自由度几何控制示意，包括支撑杆旋转、阵面旋转和伸缩尺度调节。

> **待翻译范围**：系统模型后续数学公式、物理约束、信道模型、问题变换、流形算法、仿真、结论、图表及参考文献。不得将本页标注为全文。

## 补译：运动学模型、信道与优化算法

以下补译依据原文第 3–13 页，继续补充模型、约束、关键公式、算法和仿真分析。此批次优先恢复数学主线；尚未逐句对应的段落、完整公式及英文文献表仍须后续终校。

### II-A. 六维天线的累积控制模型（原式 (1)–(9)）

设支撑杆转轴单位向量为 \(\mathbf u=(u_x,u_y,u_z)^T\)，时隙旋转角为 \(\theta=\omega\Delta t\)。Rodrigues 公式写作
\[
\mathbf R(\theta,\mathbf u)
=\cos\theta\,\mathbf I_3
+(1-\cos\theta)\mathbf u\mathbf u^T
+\sin\theta[\mathbf u]_\times .
\tag{2}
\]
其中 \([\mathbf u]_\times\) 为叉乘对应的反对称矩阵。在逐时隙控制下，支撑杆缩放系数与两类旋转矩阵分别累积为
\[
\varsigma_l^b[t]=\prod_{i=1}^{t}\varsigma_l[i],\tag{3}
\]
\[
\mathbf R_l^b[t]=\prod_{i=1}^{t}\mathbf R_l(\theta_l[i],\mathbf u_l[i]),\tag{4}
\]
\[
\mathbf R_a^s[t]=\prod_{i=1}^{t}\mathbf R_a(\theta_a[i],\mathbf u_a[i]).\tag{5}
\]
其乘积按照原文定义的时间顺序执行。支撑杆末端的全局坐标以及第 \(a\) 个阵面上第 \(n\) 个天线单元的全局位置分别为
\[
\mathbf q_l^b[t]=\varsigma_l^b[t]\mathbf R_l^b[t]\mathbf q_l^b[0],\tag{6}
\]
\[
\mathbf q_{l,n}^b[t]=\mathbf q_l^b[t]
+\mathbf R_a^s[t]\mathbf q_{a,n}^s[0],\quad l=a.\tag{7}
\]
这一模型与仅在每个时刻独立设定位姿不同：历史每一步运动均影响后续的全局位置与姿态。

### II-B. 物理运行约束

**避免信号自反射的旋转约束。** 第 \(a\) 个阵面在全局坐标系中的外法向单位向量为
\[
\mathbf i_a^b[t]=\mathbf R_l^e[t]\mathbf i_a^b[0],\tag{8}
\]
\[
\mathbf R_l^e[t]=\prod_{i=1}^{t}
\mathbf R_l(\theta_l[i],\mathbf u_l[i])
\mathbf R_a(\theta_a[i],\mathbf u_a[i]).\tag{9}
\]
以阵面中心 \(\mathbf q_l^b[t]\) 为经过点、\(\mathbf i_a^b[t]\) 为法向量的超平面满足
\[
(\mathbf i_a^b[t])^T\mathbf q_x^b
=(\mathbf i_a^b[t])^T\mathbf q_l^b[t].\tag{10}
\]
其反向闭半空间由
\[
(\mathbf i_a^b[t])^T\bigl(\mathbf q_x^b-\mathbf q_l^b[t]\bigr)\leq0 \tag{11}
\]
确定。令其他阵面中心代入，即得到
\[
(\mathbf i_a^b[t])^T
\bigl(\mathbf q_{l'}^b[t]-\mathbf q_l^b[t]\bigr)\leq0,\quad l'\neq l.\tag{12}
\]
该条件避免其他阵面中心进入当前阵面外法线所指向的开放半空间，以降低阵面之间的反射风险。

**机械结构约束。** 为避免不同阵面相互碰撞，支撑杆位置向量之间的夹角不得小于 \(\vartheta_1\)：
\[
\arccos\frac{\mathbf q_l^b[t]\cdot\mathbf q_{l'}^b[t]}
{\|\mathbf q_l^b[t]\|\,\|\mathbf q_{l'}^b[t]\|}
\geq\vartheta_1,\qquad l\neq l'.\tag{13}
\]
为防止阵面与基站主体发生碰撞，阵面中心方向与基站初始法线 \(\mathbf i^b[0]\) 之间的夹角不得小于 \(\vartheta_2\)：
\[
\arccos\frac{\mathbf q_l^b[t]\cdot\mathbf i^b[0]}
{\|\mathbf q_l^b[t]\|\,\|\mathbf i^b[0]\|}
\geq\vartheta_2.\tag{14}
\]
同理，为防止阵面与其自身支撑杆碰撞，使用阵面当前法线 \(\mathbf i_a^b[t]\) 定义最小夹角 \(\vartheta_3\)：
\[
\arccos\frac{\mathbf q_l^b[t]\cdot\mathbf i_a^b[t]}
{\|\mathbf q_l^b[t]\|\,\|\mathbf i_a^b[t]\|}
\geq\vartheta_3,\quad l=a.\tag{15}
\]
原文图 3 分别展示阵面之间的电磁相互作用约束和基站机械结构约束。作者指出：以阵面中心而非各阵元为几何约束对象，可以显著降低约束数量与计算成本，但这是工程近似；半空间约束与最小夹角约束共同提供安全间距的代理表征，并非直接求解非共面支撑杆间的精确最短距离。

### II-C. 信道模型

**六维导向向量。** 第 \(k\) 个 UE 的第 \(j\) 条路径相对于基站参考位置的俯仰角、方位角分别为 \(\alpha_{k,j}[t]\) 和 \(\beta_{k,j}[t]\)，相应全局方向向量为
\[
\mathbf f_{k,j}^b[t]
=[\cos\alpha_{k,j}\cos\beta_{k,j},\,
\cos\alpha_{k,j}\sin\beta_{k,j},\,
\sin\alpha_{k,j}]^T.\tag{16}
\]
利用前述阵元全局位置和载波波长 \(\lambda\)，第 \(a\) 个阵面沿该路径的导向向量写为
\[
\mathbf v_{k,j}^a=
\left[e^{-j\frac{2\pi}{\lambda}(\mathbf f_{k,j}^b)^T\mathbf q_{l,1}^b},
\ldots,
e^{-j\frac{2\pi}{\lambda}(\mathbf f_{k,j}^b)^T\mathbf q_{l,N}^b}\right]^T .
\tag{17}
\]
时间索引与累积旋转参数在该式中省略以简化排版。

**有效天线增益。** 阵面的朝向会改变入射方向在其局部坐标系下的表达。将全局方向向量投影到阵面局部坐标系，再求相应俯仰角与方位角，便可计算三维单元增益。作者采用垂直及水平方向均为 \(25^\circ\) 的半功率波束宽度、\(8\ \mathrm{dBi}\) 最大方向增益，以及 \(30\ \mathrm{dB}\) 级别的旁瓣/前后向限制。原文式 (18)–(25) 定义方向变换、方位角符号函数、垂直方向图、水平方向图以及将 dBi 转为线性增益的过程；这些分段函数及角度索引仍须逐项对照 PDF 补录。

**有效信道。** 对同一路径，作者在阵列尺寸与运动范围足够小的条件下采用远场近似，使不同阵元的路径系数可以认为相同。将每条路径的增益、阵面导向向量和单元有效增益组合后，再对 \(J_k\) 条传播路径求和，得到从 UE \(k\) 到基站全部 \(AN\) 个阵元的信道向量 \(\mathbf h_k\)（原式 (26)）。因此，移动端位置变化、支撑杆伸缩/旋转和阵面旋转均会影响有效 CSI。

**CKM 赋能的位置—信道映射。** CKM 可理解为以空间位置为索引的无线传播知识数据库，存储由环境几何结构和 UE 位置决定的大尺度传播参数，例如路径增益、到达角与离开角。文章假设存在**理想 CKM**，并事先储存每个 UE 的路径增益及到达角信息。给定环境状态 \(\mathcal E[t]\)、UE 位置 \(\mathbf o_k[t]\) 和天线控制参数，信道可以预测为
\[
\mathbf h_k[t]=
\operatorname{CKM}\bigl(
\mathbf o_k[t],\mathcal E[t],
\boldsymbol\varsigma[t],\mathbf R^b[t],\mathbf R^s[t]\bigr).\tag{27}
\]
这一假设使优化从“测量 CSI 后再作反应”转向利用提前获得的传播知识规划完整天线轨迹。

### III. 问题建模与变换

**上行通信模型。** 第 \(t\) 时隙的基站接收信号为
\[
\mathbf y[t]=\mathbf H[t]\mathbf s+\mathbf n,\tag{28}
\]
其中 \(\mathbf H[t]=[\mathbf h_1[t],\ldots,\mathbf h_K[t]]
\in\mathbb C^{AN\times K}\)，各 UE 具有相同的发射功率 \(p\)，接收噪声协方差为 \(\sigma^2\mathbf I_{AN}\)。在基站 CSI 完美、采用最优高斯信令和多用户联合解码的条件下，总频谱效率为
\[
C[t]=\log_2\det\!\left(
\mathbf I_{AN}+\frac p{\sigma^2}
\mathbf H[t]\mathbf H[t]^H\right).\tag{29}
\]

**长期优化问题。** 作者以整个服务时域内各时隙频谱效率之和为优化目标：
\[
\max_{\boldsymbol\varsigma,\mathbf R^b,\mathbf R^s}
\sum_{t=1}^{M}C[t].\tag{30a}
\]
约束包含：支撑杆及阵面的角速度不得超过 \(\omega_{b,\max}\)、\(\omega_{s,\max}\)；每时隙缩放系数位于 \([\varsigma_{\min},\varsigma_{\max}]\)；阵面中心到原点的距离位于 \([q_{b,\min},q_{b,\max}]\)；相邻时隙位移满足
\[
\|\mathbf q_l^b[t]-\mathbf q_l^b[t-1]\|\le q_{b,\Delta t};\tag{30f}
\]
同时须满足式 (12)–(15) 的反射及最小安全夹角约束。由于阵面位置和法向量是历史旋转的复合函数，导向向量、天线方向图以及非线性几何约束共同使问题高度非凸，传统凸规划无法直接适用。

**变换为积流形问题。** 所采用的旋转矩阵属于特殊正交群
\[
SO(3)=\{\mathbf R\in\mathbb R^{3\times3}:
\mathbf R^T\mathbf R=\mathbf I_3,\ \det\mathbf R=1\}.
\]
把 \(\boldsymbol\Theta_l[t]=\theta_l[t]\mathbf u_l[t]\) 映射到李代数 \(\mathfrak{so}(3)\) 后，使用反对称矩阵
\[
[\boldsymbol\Theta]_\times=
\begin{bmatrix}
0&-\Theta_3&\Theta_2\\
\Theta_3&0&-\Theta_1\\
-\Theta_2&\Theta_1&0
\end{bmatrix}\tag{31}
\]
实现 SO(3) 与切空间之间的转换。其指数映射采用
\[
\exp_{SO(3)}([\boldsymbol\Theta]_\times)
=\mathbf I_3+
\frac{\sin\theta}{\theta}[\boldsymbol\Theta]_\times+
\frac{1-\cos\theta}{\theta^2}[\boldsymbol\Theta]_\times^2.\tag{32}
\]
相应的对数映射（对非奇异角度）为
\[
\log_{SO(3)}(\mathbf R)=
\frac{\theta}{2\sin\theta}(\mathbf R-\mathbf R^T),\quad
\theta=\arccos\frac{\operatorname{tr}(\mathbf R)-1}{2}.
\tag{33–34}
\]
作者将正实数缩放自由度与支撑杆、阵面两类旋转自由度合并为积流形，结构相当于跨全部时隙和支撑杆取 \(\mathbb R_+\times SO(3)\times SO(3)\) 的直积（原式 (36)）。该重参数化内生满足旋转矩阵正交性，无需在普通欧氏优化器中另外显式施加正交矩阵约束。

**平滑惩罚处理。** 简单的伸缩上下界可通过重参数化强制满足；对其他复杂几何和运动学约束，将其统一写作 \(g_i(\mathbf x)\le0\)。对不可微的 \(\max(0,g_i)\)，采用可导的 log-sum-exp 平滑：
\[
V_i(\mathbf x;\mu)=
\mu\log\!\left(1+\exp(g_i(\mathbf x)/\mu)\right).
\tag{40，平滑违约量}
\]
从而把原问题变为积流形上的平滑无约束问题
\[
\min_{\mathbf x\in\mathcal M}
P(\mathbf x;\boldsymbol\rho,\mu)
=-f(\mathbf x)+\sum_{i\in\mathcal I_{6DMA}}\rho_i V_i(\mathbf x;\mu).
\tag{41}
\]
作者强调，不同物理约束具有不同难度，因此分别更新各惩罚权重 \(\rho_i\)，而非只设置统一的惩罚系数；在忽略平滑近似误差、惩罚参数充分大时，该方法具有精确惩罚思想所要求的约束恢复性质。

### IV. 所提流形优化方法

**切空间与梯度。** 一般欧氏空间中的加减法不适用于 SO(3) 群元，需要通过指数映射、对数映射以及群乘法定义局部增量。在流形 \(\mathcal M\) 上，函数 \(f:\mathcal M\rightarrow\mathcal M'\) 的微分描述了输入切空间的微小扰动如何传播到输出切空间。作者据此建立雅可比矩阵，使标准反向传播中的链式法则可以推广到混合欧氏变量与李群变量的计算图。

实现依托 LieTorch：前向传播在 SO(3) 上执行旋转复合，反向传播则在三维切空间计算梯度，不直接对九个欧氏矩阵元素独立优化。由于旋转群乘法不可交换，计算梯度时需要引入伴随算子。对于 SO(3)，伴随算子对应旋转矩阵本身；对数映射的梯度还需要左雅可比逆，以保持扰动的局部几何一致性。这些内容对应原式 (42)–(54)，其完整微分式仍待逐项抄录。

**自适应惩罚与迭代。** 文章提出两阶段权重策略。预热阶段允许在相对温和的惩罚系数下探索频谱效率较高的区域，并按照各约束相对违约程度分配权重；正式阶段则提升严重违约约束的惩罚系数：
\[
\rho_i^w=\min\!\left\{\rho_i^{w-1}(1+\gamma V_i),\rho_{\max}\right\}.
\tag{56}
\]
同时，平滑参数和梯度终止阈值逐步减小：
\[
\mu^{w+1}=\max\{\mu_{\min},\varrho_\mu\mu^w\},\tag{57}
\]
\[
\epsilon^{w+1}=\max\{\epsilon_{\min},\varrho_\epsilon\epsilon^w\}.\tag{58}
\]
内层优化以当前解为热启动点，计算流形梯度，并通过指数映射完成旋转更新：
\[
\mathbf x_{s+1}
=\exp\!\left(-\varrho_x\nabla_{\delta_s}
P(\mathbf x_s;\boldsymbol\rho^w,\mu^w)\right)\circ\mathbf x_s.
\tag{59}
\]
当梯度小于 \(\epsilon_w\) 或达到最大内循环次数时结束当前子问题；更新权重、平滑参数及容差后再启动下一轮。外层终止要求相邻解的流形距离小于 \(d_{\min}\)，同时平滑与精度参数下降至预设下限（原式 (60)–(63)）。

**原文算法 1：采用动态惩罚调整的流形频谱效率优化。** 输入为初始位姿及伸缩参数 \(\mathbf x_0\in\mathcal M\)、惩罚权重 \(\boldsymbol\rho_0\)、平滑参数 \(\mu_0\)、梯度容差 \(\epsilon_0\)、两种收缩因子、最低平滑度与最低容差、相邻迭代距离阈值、学习率和内外层最大迭代次数。首先初始化 \(\mathbf x,\boldsymbol\rho,\mu,\epsilon\)。外层循环设置热启动点；内层反复进行 SO(3) 对数映射、黎曼梯度计算及指数映射更新；达到内层终止条件后，更新惩罚参数、平滑因子与容差；最后在外层收敛或达到最大次数时返回优化后的 6DMA 控制参数。与逐时隙重新计算位姿相比，该算法把整条轨迹作为一组耦合变量联合求解。

### V. 数值仿真

原文表 I 汇总仿真参数；图 6–11 检查优化收敛、随时间变化的累计频谱效率、最大瞬时角速度，以及性能关于 UE 数量、阵面数量和最大角速度的关系。完整表格数值仍待从原 PDF 逐格校对。

作者使用的对照方案如下：

1. **FPA**：在传统固定三扇区部署中使用与其他方案相同数量的天线，每个扇区采用标准 \(15^\circ\) 下倾角。
2. **理想 AO（I-AO）**：每时隙通过交替优化联合确定位姿，不考虑角速度和伸缩速度等运动学限制，因此主要充当理论性能上界。
3. **运动学约束 AO（KC-AO）**：先逐时隙运行 AO，再线性缩放所需位移以满足最大角速度限制。
4. **理想视距跟踪（I-LT）**：根据 UE 空间位置执行 \(k\)-means 聚类，将阵面法向量即时指向相关 UE 集群的几何中心。
5. **不使用 CKM 的运动学约束流形优化（KC-WCKMMO）**：依据当前时隙 CSI，使用流形优化预测下一时隙天线位姿。
6. **理想流形优化（I-MO）**：不考虑运动学限制的流形优化基线。

提出的方法记为 **KC-MO**，即带运动学约束的主动式流形优化。

图 6 所示的代表性收敛过程表明，预热阶段使用较小惩罚权重，可以快速提高系统频谱效率，但同时可能暂时提高约束违背程度。进入正式优化阶段后，惩罚权重自适应增加，违约率迅速下降，而频谱效率只产生较小、可控的损失，体现了性能与可行性之间的动态平衡。

原文图 7–8 使用 \(K=2\)、\(A=2\)、最大角速度 \(0.1\ \mathrm{rad/slot}\) 的场景对比累计总频谱效率与最大瞬时角速度。静态 FPA 和 I-LT 因无法充分适应实际多径结构，性能受到限制；反应式 KC-WCKMMO 虽然初期较好，却可能因为早期决策缺乏长远性，使后续最优位姿无法在运动学限制内抵达。I-AO 具备较高的理论性能，但需要难以在机械系统中实现的角速度。KC-AO 通过朴素的运动缩放处理约束，可能使性能低于静态方案。KC-MO 则能够在遵守工程限制的同时，接近理想方案的频谱效率。

图 9 考察 UE 数量的影响。随 \(K\) 增大，各方法受益于多用户分集，总频谱效率提高。KC-MO 和反应式方法之间的差距在更复杂多用户场景中可能扩大；不过，KC-MO 的增益增长速率逐渐减缓，意味着所提方法尤其适用于服务少量高质量跟踪目标的情形。

图 10 表明，增加 6DMA 阵面数量 \(A\) 一般能提高性能，但不同算法利用新增空间自由度的能力不同。当阵面较少、资源受限时，长期轨迹规划的优势更明显；当阵面数量足够大时，反应式方法也更容易找到较好的可行配置，两者性能差距因而可能缩小。

图 11 表明，提升最大角速度 \(\omega_{\max}\) 能提高 KC-MO 的频谱效率，但在机械机动性足够后，继续提高角速度的边际收益递减。反应式方法则需要持续借助额外的运动能力纠正先前不理想的决策。因此，所提算法可以在中等机械速度限制下取得较好的系统性能，使低成本执行器成为可能。

### VI. 结论（补译）

本文针对移动 UE 的主动跟踪问题，提出了利用 CKM 预测信道信息的 6DMA 基站长期轨迹优化方法。该方法以最大化服务时域内的总频谱效率为目标，明确建模 6DMA 的复合运动学关系，并纳入一组实际物理约束。为求解由此形成的非凸优化问题，作者提出在 SO(3) 李群上运行的流形优化框架，结合自适应惩罚和切空间反向传播。数值实验表明，该框架可以在满足工程运动限制的同时实现较高的频谱效率，其优势来自全时域规划而非独立快照优化。

**此稿完整性说明**：目前已补充主要章节及算法、代表性公式和仿真解读，但原式 (18)–(26)、(37)–(55) 及部分初始旋转关系的逐式转写、表 I 数值、所有图表图注、参考文献逐条核验仍未完成；因此仍标记为「未通过全文验收」。


### 补校：原式 (18)–(26) 的方向变换、方向图与信道叠加

在阵面天线的局部坐标系中，来自 UE 的全局路径方向变换为
\[
\mathbf f_{k,j}^{a}[t]=-
\bigl(\mathbf R_l^e[t]\bigr)^T\mathbf f_{k,j}^{b}[t]
=\bigl[f_{k,j}^{a,x}[t],f_{k,j}^{a,y}[t],
f_{k,j}^{a,z}[t]\bigr]^T.\tag{18}
\]
这里的负号来自将全局入射方向转换为阵面局部接收方向；旋转矩阵满足 \(\mathbf R^{-1}=\mathbf R^T\)。接着，由局部方向向量定义接收路径的俯仰角：
\[
\alpha_{k,j}^{a}[t]
=\frac{\pi}{2}-\arccos\bigl(f_{k,j}^{a,z}[t]\bigr).\tag{19}
\]
方位角通过前两个方向分量计算：
\[
\beta_{k,j}^{a}[t]
=\arccos\!\left(
\frac{f_{k,j}^{a,x}[t]}
{\sqrt{(f_{k,j}^{a,x}[t])^2+
(f_{k,j}^{a,y}[t])^2}}\right)
\eta\!\left(f_{k,j}^{a,y}[t]\right),\tag{20}
\]
其中
\[
\eta\!\left(f_{k,j}^{a,y}[t]\right)
=\begin{cases}
1,&f_{k,j}^{a,y}[t]\ge0,\\
-1,&f_{k,j}^{a,y}[t]<0.
\end{cases}\tag{21}
\]
因此，局部俯仰角和方位角既与 UE 的全局路径角度有关，也与阵面和支撑杆累积旋转相关。每个阵元的三维增益以 dBi 表示为
\[
g_{k,j}^a
=g^{\max}-\min\bigl\{
-\bigl[g_v(\alpha_{k,j}^{a})+
g_h(\beta_{k,j}^{a})\bigr],F
\bigr\},\tag{22}
\]
其中垂直和水平辐射方向图为
\[
g_v(\alpha_{k,j}^{a})
=-\min\left\{
12\left(\frac{\alpha_{k,j}^{a}}{\alpha_{3\mathrm{dB}}}\right)^2,S
\right\},\tag{23}
\]
\[
g_h(\beta_{k,j}^{a})
=-\min\left\{
12\left(\frac{\beta_{k,j}^{a}}{\beta_{3\mathrm{dB}}}\right)^2,F
\right\}.\tag{24}
\]
原文采用 \(g^{\max}=8\,\mathrm{dBi}\)，
\(\alpha_{3\mathrm{dB}}=\beta_{3\mathrm{dB}}=25^\circ\)，
\(S=F=30\,\mathrm{dB}\)。
把 dBi 增益转换至线性功率增益：
\[
G_{k,j}^{a}(\mathbf R_l^e[t])
=10^{g_{k,j}^{a}
(\alpha_{k,j}^{a}[t],\beta_{k,j}^{a}[t])/10}.\tag{25}
\]
上式中的局部接收角必须先由式 (18)–(21) 计算，不能简单地把全局 AOA 直接代入阵元方向图。

把每个阵面的 \(N\) 维导向向量乘以路径相关的增益平方根，并依阵面索引堆叠，随后对所有 \(J_k\) 条传播路径叠加，得到
\[
\mathbf h_k(\boldsymbol\varsigma[t],
\mathbf R^b[t],\mathbf R^s[t])
=\sum_{j=1}^{J_k}\bar P_{k,j}[t]
\begin{bmatrix}
\sqrt{G_{k,j}^{1}(\mathbf R_1^e[t])}
\mathbf v_{k,j}^{1}(\mathbf R_1^b[t],\mathbf R_1^s[t])\\
\vdots\\
\sqrt{G_{k,j}^{A}(\mathbf R_L^e[t])}
\mathbf v_{k,j}^{A}(\mathbf R_L^b[t],\mathbf R_A^s[t])
\end{bmatrix}
\in\mathbb C^{AN\times1}.\tag{26}
\]
\(\bar P_{k,j}[t]\) 是第 \(k\) 个 UE 第 \(j\) 条路径在基站参考点处的传播增益系数。式 (26) 将 CKM 提供的路径属性和天线位姿决定的阵元方向响应分开：前者对应场景先验，后者则是可控的优化变量。

特别说明：原文的最小角度约束 (14)–(15) 使用**有符号的点积**构造夹角，没有额外取绝对值。本次按照原 PDF 更正该排版，以免改变物理可行域。


### 补校：原式 (37)–(54) 的惩罚光滑化与切空间反向传播

**约束变换。** 对每时隙支撑杆伸缩因子 \(\varsigma_l[t]\)，采用 unconstrained 变量 \(\varsigma_l^m[t]\in\mathbb R\) 的 Sigmoid 型映射：
\[
\varsigma_l[t]=\varsigma^{\min}
+(\varsigma^{\max}-\varsigma^{\min})
\frac{1}{1+\exp(\varsigma_l^m[t])},\quad\forall l\in\mathcal L.\tag{37}
\]
这样，无论迭代中的 \(\varsigma_l^m[t]\) 如何变化，伸缩因子都满足规定区间，不需要单独投影。对角速度上界条件 \(0\le\omega_l[t]\le\omega^{b,\max}\)，拆解为两条标准不等式
\[
g_{1,l,t}(\mathbf x)=-\omega_l[t]\le0,\tag{38}
\]
\[
g_{2,l,t}(\mathbf x)=
\omega_l[t]-\omega^{b,\max}\le0.\tag{39}
\]
其余状态相关约束按同样方式改写成 \(g_i(\mathbf x)\le0\)。如果直接使用 \(\max(0,g_i)\) 作为惩罚，零点不可微；因此以光滑的 log-sum-exp 替代：
\[
\sum_{i\in\mathcal I_{\mathrm{6DMA}}}
\rho_i\mu\log\left(1+
\exp\left(\frac{g_i(\mathbf x)}{\mu}\right)\right).\tag{40}
\]
对整个目标加入上述惩罚，得到
\[
\min_{\mathbf x\in\mathcal M}P(\mathbf x;\boldsymbol\rho,\mu)
=-f(\mathbf x)+
\sum_{i\in\mathcal I_{\mathrm{6DMA}}}
\rho_i\mu\log\left(1+
e^{g_i(\mathbf x)/\mu}\right).\tag{41}
\]
其中 \(\mu>0\) 为全局平滑参数，\(\rho_i\) 为各约束的独立惩罚强度。随着 \(\mu\to0\)，光滑惩罚更加接近精确惩罚，但梯度数值稳定性可能下降；随着 \(\rho_i\to\infty\)，更强调满足约束，但易造成收敛缓慢或振荡。采用按约束分别调节的 \(\rho_i\)，正是为了适配不同量纲、不同尺度的安全和运动学要求。

**李群上的加法与减法。** 对于群元素 \(X,Y\in\mathcal M\) 及李代数扰动向量 \(\boldsymbol\xi\)，一般欧氏加减法改为
\[
\boldsymbol\xi\oplus X=\exp(\boldsymbol\xi)\circ X,\tag{42}
\]
\[
X\ominus Y=\log(XY^{-1}).\tag{43}
\]
其中 \(\circ\) 为群乘法；式 (42) 把切空间增量映射回旋转群，式 (43) 把两个流形元素的差映射到李代数。

**流形微分和雅可比。** 对从 \(\mathcal M\) 到 \(\mathcal M'\) 的可微函数 \(f\)，其沿切向量 \(\mathbf v\) 的微分定义为
\[
Df(X)[\mathbf v]=
\lim_{\epsilon\to0}
\frac{f(\epsilon\mathbf v\oplus X)\ominus f(X)}
{\epsilon}.\tag{44}
\]
在切空间正交基 \(\{\mathbf e_j\}\) 上可由同样方式定义雅可比矩阵 \(\mathbf J\)（原式 (45)）。采用链式法则，
\[
\frac{\partial L}{\partial X}=
\frac{\partial L}{\partial Y}
\frac{\partial Y}{\partial X}
=\frac{\partial L}{\partial Y}\mathbf J.\tag{46}
\]
若函数的变量属于普通欧氏空间，则指数和对数映射退化成恒等映射，上述公式也就退化成普通链式法则。因此，算法能够将尺度变量与旋转变量放在同一个可微计算图中处理。

**群乘法的非交换性。** 在两个 SO(3) 群元素 \(X,Y\) 的复合 \(Z=X\circ Y\) 中，右侧扰动并不能直接写成左侧扰动，而须通过伴随算子 \(\mathcal A_X\)：
\[
X\circ\exp(\mathbf a)
=\exp(\mathcal A_X\mathbf a)\circ X.\tag{47}
\]
对于 SO(3)，该算子恰好是旋转矩阵 \(X\)。因此，分别扰动两个输入，得到
\[
D_Zf(X)[\mathbf v]=\mathbf v,\tag{48}
\]
\[
D_Zf(Y)[\mathbf v]=\mathcal A_X\mathbf v,\tag{49}
\]
反向传播梯度满足
\[
\frac{\partial L}{\partial X}=
\frac{\partial L}{\partial Z},\qquad
\frac{\partial L}{\partial Y}=
\frac{\partial L}{\partial Z}\mathcal A_X.\tag{50}
\]
这一步保证梯度变换时正确考虑旋转矩阵乘法的顺序，而不是把两个旋转变量当作可交换的标量。

**对数映射的微分。** 对 \(\boldsymbol\phi=\operatorname{Log}(X)\)，原文采用
\[
D\operatorname{Log}(X)[\mathbf v]
=\lim_{\epsilon\to0}
\frac{\operatorname{Log}(\exp(\epsilon\mathbf v)\circ X)
-\operatorname{Log}(X)}{\epsilon}.\tag{51}
\]
由 Baker–Campbell–Hausdorff 公式，可以用左雅可比矩阵逆处理这类局部增量（式 (52)）。对于 SO(3)，
\[
\mathbf J_l^{-1}(\boldsymbol\phi)
=\mathbf I_3-\frac12[\boldsymbol\phi]_\times+
\left(
\frac1{\|\boldsymbol\phi\|^2}
-\frac{1+\cos\|\boldsymbol\phi\|}
{2\|\boldsymbol\phi\|\sin\|\boldsymbol\phi\|}
\right)[\boldsymbol\phi]_\times^2.\tag{53}
\]
因此，流形梯度可从李代数变量的梯度恢复为
\[
\frac{\partial L}{\partial X}
=\frac{\partial L}{\partial\boldsymbol\phi}
\mathbf J_l^{-1}(\boldsymbol\phi).\tag{54}
\]
上述式 (47)–(54) 构成图 4 的切空间反向传播机制。正向计算图执行支撑杆和阵面旋转矩阵的复合；反向求导使用切向量、伴随算子和左雅可比逆，最终由指数映射将更新送回 SO(3)。与直接优化旋转矩阵九个元素相比，这更符合三维姿态的真实自由度和正交几何结构。

{% endraw %}
