---
layout: page
title: "扫描内信道变化下的 UAV 流体天线信道获取｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-06537-uav-fluid-antenna-channel-acquisition-under-intra-scan-channel-aging/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e5775beab126d062/) · [原文 arXiv](https://arxiv.org/abs/2609.06537) · [全部目录](/papers/catalog/)

# 扫描内信道变化下的 UAV 流体天线信道获取

**原题：** UAV Fluid-Antenna Channel Acquisition under Intra-Scan Channel Aging  
**作者：** Yuanhui Wu¹、Hao Jiang²（通讯作者）、Liang Wu^{3,4}、Zaichen Zhang^{3,4}（¹ 南京信息工程大学人工智能学院，中国；² 东南大学网络空间安全学院，中国；³ 东南大学移动通信国家重点实验室，中国；⁴ 紫金山实验室，南京，中国）  
**版本：** arXiv:2609.06537v1（cs.IT），2026 年 9 月 6 日提交，原文 5 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—V 节、表 I—表 II、图 1—图 4 图注与参考文献（英文原条目 21 条）按原文结构录入；逐句逐式终校未做。

## 摘要

无人机（UAV）流体天线系统（FAS）中的**顺序探测**提供了额外空间信息，但会推迟传输，使较早的信道观测**老化**。本文讨论由此产生的**信息—新鲜度权衡**：在块并行硬件约束下，联合确定**在哪里探测**与**何时停止**。一个**动态 Karhunen–Loève（KL）估计器**把异步测量与传输时刻的状态对齐，**协方差信息增益**选择可行的探测位置，而一个**年龄折扣恒等式**配合**局部多一槽条件**刻画信息与新鲜度在协方差层面的平衡。配对仿真表明：时间对齐可挽回静态堆叠所损失的大部分**下尾可靠性**；协方差感知探测在所评估的策略中数值排名最高；在被测的最高移动速度下，优化的单槽探测在统计上与两槽方案具有竞争力。在所评估的调度族内，移动速度升高会把竞争性工作区域推向**更短的扫描**，从而支持探测位置与探测时长的联合设计。

**关键词：** 流体天线系统；UAV 通信；信道老化；顺序信道获取；信息增益；移动性感知探测。

## I. 引言

低空 UAV 的运动使信道在探测期间持续演化，因此早期测量在数据传输时可能已经陈旧 [1]。流体天线系统（FAS）暴露大量候选端口，但受限于有限的射频（RF）硬件，只能探测其中少数几个 [2]、[3]。在**块并行探测**下，增加一个额外时隙可为每个硬件块采集一个新测量，但同时推迟传输并让此前所有观测**老化**。因此核心的获取问题并不是简单地采集更多端口，而是在空间信息与观测新鲜度之间取得平衡。

现有 FAS 获取方法通过端口选择、过采样、KL 推断、学习式重建与空间先验，从部分观测中恢复空间信息 [4]、[6]—[8]、[11]。另一些研究处理过期的信道状态信息（CSI）、时间学习、有限孔径或块切换 [15]—[19]。最接近的时序感知工作使用固定的一组已测端口，在切换时延下插值信道 [20]；统计式部分 FAS 选择则跨端口与跨时间利用不完整的历史 CSI [12]。二者都没有处理本文所考虑的联合决策：**为每个硬件块选择一个可行端口**，并判断**再增加一个探测时隙是否值得其传输时延**。

本文联合确定在哪里探测与何时停止，以提升传输时刻的**下尾选中端口可靠性**。动态 KL 把异步测量与传输状态对齐，协方差信息增益（IG）选择可行的未用端口，年龄折扣恒等式配合局部多一槽条件刻画信息—新鲜度平衡。独立的验证流程在测试之前**冻结**任务级探测预算。

配对仿真分离了时序、几何与时长三个因素。时间对齐挽回了静态堆叠的大部分下尾损失；协方差 IG 在所评估的探测规则中数值排名最高；更高的移动性偏好更短的扫描。在被测最高移动性下，优化的单槽探测与所评估的两槽替代方案在统计上具有竞争力，这支持探测位置与探测时长的联合设计，但并未确立普遍单调的预算规则。

本文主要贡献如下。

1. 把块并行 UAV-FAS 获取建模为**联合探测位置与探测时长**的问题，其中计入扫描内信道演化与传输时刻可靠性。
2. 把**传输状态对齐的 KL 推断**与**协方差 IG 探测**结合，并推导**局部协方差条件**，用于比较再增加一槽所得信息与其新鲜度代价。
3. 配对评估分离了时间对齐、探测几何与探测时长三个因素，揭示出**较短扫描变得有竞争力**的移动性相关区域。

第 II-A—II-C 节给出块连接的 UAV–FAS 模型、移动性演化与传输时刻可靠性目标；第 III-A—III-C 节发展时间状态对齐、协方差感知探测与多一槽条件；第 IV 节给出数值评估；第 V 节总结全文。

**记号：** 粗体表示矩阵与向量，花体字母表示集合。上标 $(\cdot)^{T}$、$(\cdot)^{H}$ 分别表示转置与共轭转置，$\operatorname{tr}(\cdot)$ 为迹，$\mathcal{CN}(\boldsymbol\mu,\mathbf C)$ 为真复高斯分布。

## II. 系统模型与问题公式化

### A. 块连接 FAS 与空间信道

图 1 概括了下文所考虑的块并行获取设置。

考虑一个上行链路：UAV 向配备孔径为 $L$ 的一维 FAS 的地面接收机发送导频。$N$ 个候选位置 $x_n=L(n-1)/(N-1)$（$n=1,\ldots,N$）被划分为 $M$ 个互不相交的连续块 $\{\mathcal B_b\}_{b=1}^{M}$。每条 RF 链连接一个块，并在每个获取时隙探测**一个端口**。若 $\mathcal S_t$ 为时隙 $t$ 的选择，则

$$
|\mathcal S_t\cap\mathcal B_b|=1,\qquad \mathcal S_t\cap\mathcal S_\tau=\varnothing\ (t\ne\tau),\tag{1}
$$

即在一次观测回合中同一端口不能被重复测量。一个 $T$ 时隙的扫描共测量 $m=MT$ 个端口。

空间模型采用**方向性高斯到达角近似**，均值 $\theta_0$、标准差 $\sigma_\theta$ [7]。令 $d_{ij}=(x_i-x_j)/\lambda$ 并以弧度表示 $\sigma_\theta$，则协方差为

$$
[\mathbf R_h]_{ij}=e^{\mathrm j2\pi d_{ij}\sin\theta_0}e^{-\frac{1}{2}\left(2\pi|d_{ij}|\cos\theta_0\sigma_\theta\right)^{2}}.\tag{2}
$$

对 $\mathbf R_h=\mathbf U_{\mathrm{full}}\boldsymbol\Lambda\mathbf U_{\mathrm{full}}^{H}$，取 $\mathbf U=\mathbf U_{\mathrm{full}}(:,1:D)$。秩 $D$ 投影信道为

$$
\mathbf h_t=\mathbf U\mathbf c_t,\qquad \mathbf c_t=\mathbf U^{H}\mathbf h_t,\qquad \mathbf U\in\mathbb C^{N\times D}.\tag{3}
$$

每个估计器与可靠性指标都使用同一秩 $D$ 投影信道。

### B. 移动性诱导的时间演化

系数轨迹服从

$$
\mathbf c_{t+1}=\boldsymbol\mu+\rho(\mathbf c_t-\boldsymbol\mu)+\sqrt{1-|\rho|^{2}}\,\mathbf q_t,\tag{4}
$$

其中 $\mathbf q_t\sim\mathcal{CN}(\mathbf 0,\mathbf C_c)$ 跨时隙独立，$\mathbf C_c$ 为平稳系数协方差。估计器采用零均值先验。对最大多普勒 $f_D=vf_c/c_0$（$v$ 为 UAV 与接收机的相对速度），单时隙扩散相关服从 Clarke/Jakes 模型：

$$
\rho=J_0(2\pi f_DT_{\mathrm{slot}}),\qquad T_c=\frac{0.423}{f_D},\qquad \eta=\frac{T_{\mathrm{scan}}}{T_c}=\frac{mT_{\mathrm{slot}}}{MT_c}.\tag{5}
$$

式 (4) 是在单时隙处匹配的一阶平稳 Gauss–Markov 替代模型；其 $L$ 时隙相关为 $\rho^{L}$，而非精确的多延迟值 $J_0(2\pi f_DLT_{\mathrm{slot}})$。扫描时间包含探测但排除切换与处理时延。

对 $|\mathcal S_t|=M$，令 $\mathbf P_{\mathcal S_t}\in\{0,1\}^{M\times N}$ 表示端口选择矩阵。观测为

$$
\mathbf y_t=\mathbf P_{\mathcal S_t}\mathbf h_t+\mathbf n_t=\mathbf A_t\mathbf c_t+\mathbf n_t,\qquad \mathbf A_t=\mathbf P_{\mathcal S_t}\mathbf U,\tag{6}
$$

其中 $\mathbf n_t\sim\mathcal{CN}(\mathbf 0,\sigma_n^{2}\mathbf I_M)$。噪声方差用固定参考集 $\mathcal S_{\mathrm{ref}}$ 在训练划分上标定一次：

$$
p_{\mathrm{ref}}^{\mathrm{tr}}=\operatorname{median}_{e\in\mathcal D_{\mathrm{tr}}}\frac{1}{|\mathcal S_{\mathrm{ref}}|}\sum_{n\in\mathcal S_{\mathrm{ref}}}|h_n^{(e)}|^{2},\qquad
\sigma_n^{2}=p_{\mathrm{ref}}^{\mathrm{tr}}10^{-\Gamma_{\mathrm{meas}}/10}.\tag{7}
$$

同一 $\sigma_n^{2}$ 适用于每个测试回合、速度与探测时隙，因此测试实现不能决定其自身的噪声水平。

### C. 可靠性指标与问题公式化

零扫描后时延下 $\mathbf h_{\mathrm{tx}}=\mathbf h_T$。定义

$$
b_n=\arg\max_n|\widehat h_{\mathrm{tx},n}|^{2},\qquad G_{\mathrm{rel}}=\frac{|h_{\mathrm{tx},b_n}|^{2}}{\max_n|h_{\mathrm{tx},n}|^{2}}.\tag{8}
$$

对回合 $e$，传输时刻重建误差为

$$
\mathrm{NMSE}_{\mathrm{tx},e}=\frac{\lVert\widehat{\mathbf h}_{\mathrm{tx},e}-\mathbf h_{\mathrm{tx},e}\rVert_2^{2}}{\lVert\mathbf h_{\mathrm{tx},e}\rVert_2^{2}}.\tag{9}
$$

本文报告 $10\log_{10}\left(E^{-1}\sum_e\mathrm{NMSE}_{\mathrm{tx},e}\right)$。主要指标是 $E$ 个配对回合上**经验第 5 百分位** $Q_{0.05}(G_{\mathrm{rel}})$。对数据链路信噪比 $\Gamma_{\mathrm{data}}$ 与 $\gamma=10^{\Gamma_{\mathrm{data}}/10}$，支撑性速率指标为

$$
R_{\mathrm{sel}}=\log_2\left(1+\gamma|h_{\mathrm{tx},b_n}|^{2}\right),\qquad R_5=Q_{0.05}(R_{\mathrm{sel}})\ \text{bit/s/Hz}.\tag{10}
$$

该速率不含探测、切换与处理开销；它是**选中链路的频谱效率诊断量**，不是净载荷吞吐量。可靠性目标为

$$
\max_{T\in\{1,\ldots,\lfloor N/M\rfloor\},\{\mathcal S_t\}} Q_{0.05}(G_{\mathrm{rel}})\qquad\text{s.t. (1)—(6)}.\tag{11}
$$

式 (11) 允许基于已知模型与过去观测的因果、硬件可行调度。实验只考虑有限预算集与由离线协方差生成的调度，而非无约束组合问题。

## III. 信息—新鲜度感知获取

### A. 时间状态对齐

端点估计器在每个观测的**获取时刻**更新该观测。以 $\widehat{\mathbf c}_0^{-}=\mathbf 0$、$\mathbf C_0^{-}=\mathbf C_c$，真复动态 KL 递推为

$$
\widehat{\mathbf c}_t^{-}=\rho\widehat{\mathbf c}_{t-1}^{+},\qquad
\mathbf C_t^{-}=|\rho|^{2}\mathbf C_{t-1}^{+}+\left(1-|\rho|^{2}\right)\mathbf C_c,
$$
$$
\mathbf V_t=\mathbf A_t\mathbf C_t^{-}\mathbf A_t^{H}+\sigma_n^{2}\mathbf I,\qquad
\mathbf K_t=\mathbf C_t^{-}\mathbf A_t^{H}\mathbf V_t^{-1},\qquad
\widehat{\mathbf c}_t^{+}=\widehat{\mathbf c}_t^{-}+\mathbf K_t\left(\mathbf y_t-\mathbf A_t\widehat{\mathbf c}_t^{-}\right).\tag{12}
$$

Joseph 协方差形式

$$
\mathbf C_t^{+}=\left(\mathbf I-\mathbf K_t\mathbf A_t\right)\mathbf C_t^{-}\left(\mathbf I-\mathbf K_t\mathbf A_t\right)^{H}+\sigma_n^{2}\mathbf K_t\mathbf K_t^{H}\tag{13}
$$

保持 Hermitian 半正定性，且 $\widehat{\mathbf h}_{\mathrm{tx}}=\mathbf U\widehat{\mathbf c}_T^{+}$。所比较的估计器及其信息集在第 IV 节说明。

### B. 协方差感知的可行探测

对候选集 $\mathcal S$，令 $\mathbf C_t^{+}(\mathcal S)$ 表示后验协方差。时隙目标为对数行列式下降

$$
\Delta I_t(\mathcal S)=\log\det\mathbf C_t^{-}-\log\det\mathbf C_t^{+}(\mathcal S),\tag{14}
$$

即 **D-最优**不确定性准则。定义 $\mathbf u_n=\mathbf U^{H}\mathbf e_n\in\mathbb C^{D}$。在每次贪心步骤中，选择具有最大**精确秩一增量**的可行端口：

$$
\Delta I_t(n)=\log\left(1+\frac{\mathbf u_n^{H}\mathbf C\mathbf u_n}{\bar\sigma_n^{2}}\right),\tag{15}
$$

随后关闭该端口所在硬件块、已用端口保持不可选，并对 $\mathbf C$ 施加秩一更新。设计与 Kalman 修正使用同一训练标定方差 $\bar\sigma_n^{2}=\sigma_n^{2}$（来自式 (7)）。由于协方差演化与具体取值无关，每个 $(\rho,T)$ 调度只需离线计算一次。

探测比较固定第一个时隙、测量数、估计器与配对回合。**Fixed** 重复已保存的图样，**Random** 均匀采样。**Covariance variance** 对 $[\mathbf U\mathbf C_t^{-}\mathbf U^{H}]_{nn}$ 排序而不做条件更新，**Gain-only** 对 $|\widehat h_{t,n}^{-}|^{2}$ 排序，**Gain–uncertainty** 使用

$$
s_{t,n}=|\widehat h_{t,n}^{-}|^{2}+\beta\left[\mathbf U\mathbf C_t^{-}\mathbf U^{H}\right]_{nn}^{1/2},
$$

其中 $\beta$ 在验证数据上选择。每种策略都在**不访问真实信道**的前提下为每个块选择一个未用端口。**One-shot IG-8** 用协方差 IG 设计一个可行时隙，并在此后立即传输。

对有限可行预算集 $\mathcal B$，验证数据构成逐点自举筛选的竞争集 $\mathcal C_{\mathrm{val}}(v)$。工作点为

$$
m_{\mathrm{op}}(v)=\min\mathcal C_{\mathrm{val}}(v).\tag{16}
$$

该选择在最终测试之前冻结。验证与测试种子互不相交，条件在每个划分内部配对，互不相交的验证块用于度量选择变异性。在线代价为：调度访问 $\mathcal O(TM)$，每次更新 $\mathcal O(D^{2}M+DM^{2}+M^{3})$，重建与搜索 $\mathcal O(ND+N)$；离线调度代价为 $\mathcal O(TMND^{2})$。

### C. 多一槽不确定性条件

把 $\mathbf C_t^{+}$ 按 (4) 传播 $L$ 个未观测转移，得

$$
\mathbf C_{t+L\mid t}=|\rho|^{2L}\mathbf C_t^{+}+\left(1-|\rho|^{2L}\right)\mathbf C_c,\tag{17}
$$

故 $\mathbf C_c-\mathbf C_{t+L\mid t}=|\rho|^{2L}(\mathbf C_c-\mathbf C_t^{+})$。因此，随着传输时刻离其测量时刻越来越远，较早后验的价值按几何速率衰减。

令 $\mathbf D_{t+1}=\mathbf C_{t+1}^{-}-\mathbf C_{t+1}^{+}$ 表示来自下一个可行时隙的协方差缩减。递推给出

$$
\mathbf C_{t+1}^{+}-\mathbf C_t^{+}=\left(1-|\rho|^{2}\right)\left(\mathbf C_c-\mathbf C_t^{+}\right)-\mathbf D_{t+1},\tag{18}
$$

且当

$$
\operatorname{tr}\left(\mathbf D_{t+1}\right)>\left(1-|\rho|^{2}\right)\operatorname{tr}\left(\mathbf C_c-\mathbf C_t^{+}\right)\tag{19}
$$

时，再增加一个时隙**恰好**降低端点后验的迹。该条件把新时隙带来的协方差缩减与延迟传输的新鲜度代价相比较。它**不是**任务级 $Q_{0.05}(G_{\mathrm{rel}})$ 改善的保证或预测，后者由数值评估给出。

对给定可行调度，定义（若存在）第一个**局部无益的延长**：

$$
T_{\mathrm{lnb}}=\min\left\{t:\ \operatorname{tr}\left(\mathbf D_{t+1}\right)\le\left(1-|\rho|^{2}\right)\operatorname{tr}\left(\mathbf C_c-\mathbf C_t^{+}\right)\right\},\qquad m_{\mathrm{lnb}}=MT_{\mathrm{lnb}}.\tag{20}
$$

更强的老化增大新鲜度项，而噪声与冗余端口减小 $\mathbf D_{t+1}$。该指标相对于**规定的后续调度**是局部的，不必全局最优；非单调的可行集排除了普适的单交叉阈值。当 $|\rho|\to1$ 时新鲜度项消失；当 $|\rho|\to0$ 时预测回到 $\mathbf C_c$，抹去早先的不确定性缩减。

## IV. 数值结果

**a) 仿真设置与协议：** 表 I 汇总固定参数与所评估的网格。秩 12 的 KL 基保留协方差能量的 99.59%。统计、验证与测试集互不相交；验证在配对最终测试之前选择全部检查点与超参数。图注标明受控变量与原生传输时刻。

**b) 扫描内老化下的时间对齐：** 图 2 通过固定两槽探测几何与配对回合来隔离**时间推断**。静态参考、Static KL-LMMSE 与冻结的 KL-LAMP [7] 把所采集样本视为快照，而 Latest-slot、Age-weighted、AR-aided 与 Dynamic-KL 在相同样本上对其测量年龄作逐步更充分的处理。静态堆叠随 $\rho$ 下降而退化，而 latest-slot、AR 辅助与 Dynamic-KL 估计器因尊重测量年龄而保持稳定。在 $\rho=0.4$ 时，KL-LAMP 给出 $-3.480$ dB 的 NMSE 与 $Q_{0.05}(G_{\mathrm{rel}})=0.170$；三种新鲜度感知估计器的保持增益分别为 0.578、0.586 与 0.585。

**c) 协方差感知探测：** 图 3 隔离**锚点之后的端口选择**：固定 Dynamic-KL、首时隙测量与配对回合，只改变第二时隙的规则。Fixed 与 Random 是与几何无关的对照；其余策略分别对协方差方差、增益、二者以及条件 IG 打分。验证从 $\{0,0.25,0.5,1,2,4\}$ 中为 Gain–uncertainty 选出 $\beta=4$。在 $\rho=0.4$ 时，Fixed、Random、协方差方差、IG、gain-only 与 Gain–uncertainty 的保持增益第 5 百分位分别为 0.5848、0.5818、0.6437、0.6571、0.5670 与 0.6091。IG 还给出最高的报告速率 2.727 bit/s/Hz，支持协方差感知的几何覆盖。

**d) 移动性与探测时长：** 图 4 评估 0 至 160 km/h 的六个预算。验证冻结的序列为 $m=\{64,48,32,32,24,16,24,24,16\}$，对应 $v=\{0,20,\ldots,160\}$ km/h。它在九个速度中的八个上具有测试竞争力，唯一的遗憾值为 40 km/h 处的 0.0109。因此移动性总体上**收缩了有利深度区域**，但并未产生严格单调的序列。

图 4 与表 II 在原生完成条件下把探测时长与传输时序分开。Anchor-8 使用固定几何；One-shot IG-8 设计一个可行的协方差 IG 时隙；FinalSet-early-8 把预计算的两槽 IG16 几何提前推进，作为时序对照；两种 IG16 方法共享几何但时间推断不同。单槽方法在 $t=1$ 传输、两槽方法在 $t=2$ 传输，二者共享 Jakes 映射、信道、噪声与 SNR。

在 160 km/h 下，one-shot IG-8 与 IG16-Latest、IG16-Dynamic 的差异分别为 0.0015（95% 区间 $[-0.0369,0.0290]$）与 $-0.0081$（$[-0.0449,0.0236]$），但相对 Original Anchor-8 改善 0.0608（$[0.0383,0.0839]$）。FinalSet-early-8 达到表中最大的 $Q_{0.05}$ 值 0.6785，这隔离出其**规定几何**的时序收益，而非独立优化的单槽策略。Dynamic-KL 保持增益从 0.7676 降至 0.6642；其相对 one-shot IG-8 的优势在保持增益上到 80 km/h 仍可分辨，在速率上到 40 km/h 仍可分辨。因此，**信息量大的单槽几何**改善了锚点，并在高移动性下与两槽探测具有竞争力。

**表 I：仿真参数与评估协议。**

| 参数 | 取值 |
|---|---|
| FAS 几何 | $N=200$ 个端口，跨 $4\lambda$；KL 秩 $D=12$ |
| RF 硬件 | $M=8$ 条链／块；每块 25 个端口 |
| 信道统计 | $\theta_0=20^{\circ}$、$\sigma_\theta=10^{\circ}$；一阶 Gauss–Markov |
| 相关网格 | 图 2：$\{1,.99,.95,.9,.8,.6,.4\}$；图 3：$\{1,.95,.8,.6,.4\}$ |
| 测量／数据 SNR | 10 dB / 10 dB |
| 噪声标定 | $|\mathcal S_{\mathrm{ref}}|=16$；$\sigma_n^{2}=0.0865248$ |
| 数据划分 | 12,000 统计 / 4,000 验证 / 4,000 测试 |
| KL-LAMP 训练 | 10 层；200 轮；批 256；AdamW$(2\times10^{-3},10^{-4})$；0—30 dB SNR |
| 选定设置 | Angular-OMP 稀疏度 3；Gain–uncertainty $\beta=4$ |
| 移动性／预算网格 | 28 GHz；$66.67\,\mu\mathrm s$；$v=\{0,20,\ldots,160\}$ km/h；$m=\{8,16,24,32,48,64\}$ |
| 预算审计 | 每格 20,000 验证 / 50,000 测试；五个各 4,000 样本的验证块 |
| 不确定性 | 500／1000 次重复的逐点配对自举 |

**表 II：160 km/h（$\rho=0.3755$）、28 GHz、$T_{\mathrm{slot}}=66.67\,\mu\mathrm s$ 下的原生完成比较。**

| 方法 | NMSE [dB] | $Q_{0.05}(G_{\mathrm{rel}})$ | $R_5$ |
|---|---|---|---|
| Original Anchor-8 | −11.410 | 0.5953 | 2.6347 |
| One-shot IG-8 | −11.545 | 0.6561 | 2.7092 |
| FinalSet-early-8 | −11.602 | **0.6785** | 2.7155 |
| IG16-Latest | −11.640 | 0.6546 | 2.7377 |
| IG16-Dynamic | **−11.692** | 0.6642 | **2.7461** |

## V. 结论

扫描内信道老化在 UAV 流体天线系统中造成**探测位置与观测新鲜度**之间的核心权衡。协方差 IG 调度优化时变信道探测，而信道老化缩短了成本有效的扫描窗口。在 160 km/h 下，快速老化抵消了额外时隙的收益，因此 one-shot IG-8 调度取得与两槽方案相当的性能。未来工作将把该框架扩展到孔径耦合、多延迟信道演化、硬件时延以及真实 UAV 信道数据。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 21 条，源文 pp. 4–5）。

[1] C. Yan, L. Fu, J. Zhang, and J. Wang, "A comprehensive survey on UAV communication channel modeling," IEEE Access, vol. 7, pp. 107769–107792, 2019.

[2] K.-K. Wong, W. K. New, H. Xu, K.-F. Tong, and C.-B. Chae, "Fluid antenna system—part I: Preliminaries," IEEE Communications Letters, vol. 27, no. 8, pp. 1919–1923, August 2023.

[3] H. Jiang, W. Shi, Z. Chen, Z. Zhang, K.-K. Wong, and H. Shin, "Dynamic channel modeling of fluid antenna systems in UAV communications," IEEE Wireless Communications Letters, vol. 14, no. 10, pp. 3169–3173, October 2025.

[4] Z. Chai, K.-K. Wong, K.-F. Tong, Y. Chen, and Y. Zhang, "Port selection for fluid antenna systems," IEEE Communications Letters, vol. 26, no. 5, pp. 1180–1184, May 2022.

[5] Z. Zhang, D. Morales-Jiménez, J. Dang, Z. Zhang, C. Masouros, and H. Jiang, "Low-complexity CSI acquisition exploiting geographical diversity in fluid antenna system," in IEEE Global Communications Conference Workshops, 2025, pp. 308–313.

[6] W. K. New, K.-K. Wong, H. Xu, F. R. Ghadi, R. D. Murch, and C.-B. Chae, "Channel estimation and reconstruction in fluid antenna system: Oversampling is essential," IEEE Transactions on Wireless Communications, vol. 24, no. 1, pp. 309–322, January 2025.

[7] Y. Wu, Z. Zhang, H. Jiang, K.-K. Wong, and C.-B. Chae, "Learned-approximate message passing under Karhunen–Loève modeling for fluid antenna systems," IEEE Wireless Communications Letters, vol. 15, pp. 2719–2723, 2026.

[8] Z. Zhang, J. Dang, D. Morales-Jiménez, H. Jiang, Z. Zhang, C. Masouros, and C.-B. Chae, "Joint activity detection and channel estimation for fluid antenna system exploiting geographical and angular information," arXiv:2512.15342, 2025.

[9] T. Y. Elganimi, P. Ramírez-Espinosa, D. Morales-Jiménez, and F. J. López-Martínez, "Channel estimation and reconstruction in fluid antenna multiple access: Myths, misconceptions and critical questions," arXiv:2606.01842, 2026.

[10] H. Liang, Z. Zhang, J. Dang, H. Jiang, and Z. Zhang, "Neural networks-enabled channel reconstruction for fluid antenna systems: A data-driven approach," arXiv:2511.14520, 2025.

[11] Z. Zhang, H. Jiang, K.-K. Wong, H. Shin, and R. D. Murch, "Beyond covariance: Generative spatial correlation modeling and channel interpolation for fluid antenna systems," arXiv:2604.16639, 2026.

[12] T. Han, Y. Zhu, K.-K. Wong, G. Zheng, C.-B. Chae, and X. You, "Semi-blind fluid antenna system: Port selection via statistical analysis," arXiv:2608.08339, 2026.

[13] Z. Zhang, K.-K. Wong, K. Meng, D. Morales-Jiménez, H. Jiang, C. Masouros, H. Shin, and Z. Zhang, "Geometry-structured channel reconstruction for conventional and fluid antenna systems: Bayesian inference and fundamental limits," arXiv:2606.04001, 2026.

[14] S. Zhang, J. Mao, Y. Hou, Y. Chen, K.-K. Wong, Q. Cui, and X. Tao, "Fast port selection using temporal and spatial correlation for fluid antenna systems," in IEEE Statistical Signal Processing Workshop, July 2023, pp. 95–99.

[15] C. Psomas, G. M. Kraidy, K.-K. Wong, and I. Krikidis, "Fluid antenna systems with outdated channel estimates," in IEEE International Conference on Communications, May 2023, pp. 2970–2975.

[16] J. Zou, S. Sun, and C. Wang, "Online learning-induced port selection for fluid antenna in dynamic channel environment," IEEE Wireless Communications Letters, vol. 13, no. 2, pp. 313–317, February 2024.

[17] Y. Bi and D. H. K. Tsang, "Online active learning for adaptive channel estimation in fluid antenna systems," in IEEE International Conference on Communications, July 2026, pp. 1–6.

[18] Z. Zhang, K.-K. Wong, H. Jiang, F. R. Ghadi, H. Shin, and Y. Zhang, "Finite-aperture fluid antenna array design: Analysis and algorithm," IEEE Wireless Communications Letters, vol. 15, pp. 3199–3203, 2026.

[19] Y. Wu, Z. Zhang, H. Hong, H. Jiang, Z. Zhang, K.-K. Wong, Y. Xu, and W. Zhang, "Learned blockwise port activation for real-time beamforming in fluid antenna arrays," arXiv:2607.25365, 2026.

[20] D. Dinis and R. Wichman, "Spatio-temporal port selection in fluid antennas under switching delays," IEEE Communications Letters, vol. 30, pp. 992–996, 2026.

[21] X. Zhu, K.-K. Wong, H. Xu, C. Rao, and H. Shin, "Fluid antenna systems enabling 6G HRLLC with port switching delay," arXiv:2605.06275v2, 2026.

## 图注与表注

**图 1：系统概览与本文组织的对应关系。** (a) 第 II-A 节的块连接上行 UAV–FAS 模型。(b) 第 III-C 节的**多一槽信息—新鲜度权衡**：获得 $M$ 个新测量，代价是把数据传输推迟 $T_{\mathrm{slot}}$。(c) 第 II-C、III-A、III-B 与 IV 节的**冻结设计与最终测试流水线**：协方差 IG 调度离线生成，验证冻结 $T$ 与调度，Dynamic-KL 在端口选择前估计传输时刻信道；测试真值只用于评估。

**图 2：固定两槽、16 端口调度下的估计器比较。** 参数 $N=200$、$M=8$、$D=12$、10 dB 测量／数据 SNR，每个相关点 4,000 个配对测试回合。(a) 传输时刻 NMSE；(b) 第 5 百分位保持增益；(c) 第 5 百分位选中链路速率。静态快照估计器随 $d$ 相关下降而退化，而新鲜度感知估计器保持接近。

**图 3：锚点之后探测。** $m=16$、$T=2$、共同首时隙、Dynamic-KL 推断，每个相关点 4,000 个配对测试回合；每种策略在第二时隙为每个块选择一个未用端口。(a) 第 5 百分位保持增益；(b) 第 5 百分位选中链路速率。

**图 4：移动性在所评估调度族内收缩顺序探测的优势。** (a) 测试网格损失 $\Delta Q_{0.05}(m,v)=Q_{0.05}^{\mathrm{best}}(v)-Q_{0.05}(m,v)$，$m\in\{8,16,24,32,48,64\}$，28 GHz、$T_{\mathrm{slot}}=66.67\,\mu\mathrm s$，每格 20,000 验证与 50,000 测试回合；星形、圆形与方框分别表示测试最优、验证冻结工作点与测试竞争预算。(b)—(c) 五种方法在每速度 4,000 配对回合上的原生完成可靠性；阴影为逐点 95% 区间。

**表注：** 表 I 汇总仿真参数与评估协议（FAS 几何、RF 硬件、信道统计、相关网格、SNR、噪声标定、数据划分、KL-LAMP 训练、选定设置、移动性／预算网格、预算审计与不确定性）；表 II 给出 160 km/h、28 GHz、$T_{\mathrm{slot}}=66.67\,\mu\mathrm s$ 下的原生完成比较（NMSE、$Q_{0.05}(G_{\mathrm{rel}})$、$R_5$）。原文表 II 以粗体标出各列最优值（$Q_{0.05}$ 的 0.6785 与 NMSE 的 −11.692、$R_5$ 的 2.7461）。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.06537v1（cs.IT，2026-09-06）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（问题背景、相关工作、3 项贡献、组织结构、记号）；第 II 节系统模型与问题公式化（II-A 块连接 FAS 与空间信道、式 (1)—(3)；II-B 移动性诱导的时间演化、式 (4)—(7)；II-C 可靠性指标与问题公式化、式 (8)—(11)）；第 III 节信息—新鲜度感知获取（III-A 时间状态对齐、式 (12)—(13)；III-B 协方差感知可行探测、式 (14)—(16)；III-C 多一槽不确定性条件、式 (17)—(20)）；第 IV 节数值结果（a 设置与协议；b 时间对齐；c 协方差感知探测；d 移动性与探测时长）；第 V 节结论；21 条英文参考文献；表 I—表 II 与图 1—图 4 图注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言）→ 第 2 页（图 1、第 II 节、式 (1)—(9)）→ 第 3 页（式 (10)—(20)）→ 第 4 页（图 2—图 3、表 I、表 II、第 IV 节 b—d）→ 第 5 页（图 4、第 V 节结论、参考文献 [1]—[21]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I 与表 II 的全部条目/数值已按 PDF 第 4 页的左、右列渲染图逐项核对（含 $Q_{0.05}(G_{\mathrm{rel}})$ 的 0.6785 与 $R_5$ 的 2.7461 等加粗最优值），未改变任何数值。
2. 图 1—图 4 均未上传图片；本页以"图注与表注"小节统一给出 4 条中文图注与 2 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖原文编号式 (1)—(20)，全部保留原编号（原文正文中的式 (21) 编号并不存在，末式为 (20)，已核对）。
4. **原文疑点／说明：** ①原文第 IV-D 节正文出现 **"Fig. 4??"** 与 **"Figs. 4??–??"** 的交叉引用乱码（PDF 文本层丢失了子图编号，原文应为 Fig. 4(a)—(c) 等），译文按原文位置照录并在此说明；②式 (4) 的 Gauss–Markov 过程含均值 $\boldsymbol\mu$，而原文随后说明估计器采用零均值先验，译文照录二者；③式 (5) 给出 $T_c=0.423/f_D$ 与 $\eta=T_{\mathrm{scan}}/T_c=mT_{\mathrm{slot}}/(MT_c)$，其中 $m=MT$，译文照录；④式 (7) 的噪声标定使用训练划分的中位数功率与测量 SNR $\Gamma_{\mathrm{meas}}$，译文照录；⑤表 I 中"相关网格"一行分列图 2 与图 3 的两组取值，译文合并为一行两列；⑥表 II 标题中的 $\rho=0.3755$ 对应 $T_{\mathrm{slot}}=66.67\,\mu\mathrm s$、28 GHz 下 160 km/h 的单时隙相关，译文照录。
5. 原文为 arXiv 预印本（cs.IT），5 页（短篇）；页面目录日期 2026-09-28 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-06）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
