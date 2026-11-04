---
layout: page
title: "INLA 驱动的无人机自适应无线环境地图采样：先验宽度决定精度与校准｜中文全文译文"
permalink: /papers/translations/2026-11-04-2610-40723-inla-adaptive-uav-sampling-radio-environment-maps/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/948f4c96a3e26dd6/) · [原文 arXiv](https://arxiv.org/abs/2610.40723/) · [全部目录](/papers/catalog/)

# INLA 驱动的无人机自适应无线环境地图采样：先验宽度决定精度与校准

**原题：** INLA for Adaptive UAV Sampling of Radio Environment Maps in IoT Networks: Prior Width Governs Accuracy and Calibration  
**作者：** Changhao He、Kaichuang Yang、Xiaojuan Zhang（Senior Member, IEEE）。单位（按 PDF 首页脚注原文转写）：C. H. He 与 K. C. Yang 为沙特阿拉伯阿卜杜拉国王科技大学（King Abdullah University of Science and Technology, Saudi Arabia；{changhao.he, kaichuang.yang}@kaust.edu.sa）；X. J. Zhang 为新加坡科技研究局先进信息与计算研究院（Institute of Advanced Intelligence and Computing, Agency for Science, Technology and Research, Singapore；xiaojuanzhang@ieee.org）。  
**版本：** arXiv:2610.40723v1，2026-10-29；11 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要与关键词、正文第 I–VIII 节全部正文与小节（§III-A–III-D、§V-A–V-C、§VI-A–VI-I、§VII 讨论与局限）、式 (1)–(20) 编号、算法 1（逐行）、表 I–VII 逐格、图 1–5 图注、参考文献 [1]–[32] 英文原条目；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

我们研究从非高斯物联网（IoT）观测出发、用于构建无线环境地图（radio environment map, REM）的无人机（unmanned aerial vehicle, UAV）自适应采样。集成嵌套拉普拉斯近似（integrated nested Laplace approximation, INLA）用于更新 Matérn 高斯马尔可夫随机场（Gaussian Markov random field, GMRF）后验；航点选择先做熵预筛选，再在可达集上做 Sherman–Morrison 前瞻。我们证明：由似然诱导的偏正态（Skew-Normal）修正具有**六次（sextic）熵效应**，这解释了它对航点选择影响有限的原因。在 19 个保留下来的射线追踪窗口上，随机采样与扫掠式（lawnmower）采样带来的残余 NMSE 中位数分别比后验驱动采样高 18.0% 与 14.0%；若以这两类基线为参照，等价于分别降低 15.3% 与 12.3%。而各信息型规则（informative rules）之间的差异仍未能分辨。把先验阴影标准差从 6.0 dB 加宽到 10.025 dB 可同时改善 NMSE 与可信区间覆盖率；在该语料上，从 4 dB 到 16 dB 的扫描呈现单调改善且未观察到转折点，尽管过度自信仍然存在。用无人机自身计数做在线宽度估计，得到约 6.5 dB，却未能收回上述增益。在 30 个实测 LoRaWAN 传播窗口（配以仿真计数、且只在接收到的单元格上评分）上，相对非自适应采样的优势得以复现；由训练得到的宽度使所检验的区间评分最小；GP-UCB 的名义 NMSE 低 3–5%。结果表明：对先验设定存在显著且依赖语料的敏感性，而各采集规则之间的细微差异影响有限或尚未解决；偏好的宽度取决于语料、参与评分的单元格以及模型失配。

**关键词（Index Terms）：** 自适应采样（adaptive sampling）、贝叶斯实验设计（Bayesian experimental design）、高斯马尔可夫随机场（Gaussian Markov random field）、信息型路径规划（informative path planning）、INLA、物联网（Internet of Things, IoT）、后验校准（posterior calibration）、先验敏感性（prior sensitivity）、无线环境地图（radio environment map, REM）、无人机（UAV）。

## I. 引言

部署一个 \(500\times 500\) m 工业物联网（IoT）场地的运营者，必须决定在何处增设网关、哪些单元格需要进一步测量，以及何时停止勘察。这些决策依赖无线环境地图（REM）[1]，而无人机（UAV）可以构建该地图。在 5 m 分辨率下候选位置有 \(10^4\) 个、飞行续航仅数十分钟，穷举测量不可行 [2]。随机采样与扫掠式采样忽略先前的测量结果；基于模型的策略则利用高斯过程或 Kriging 后验来选择位置 [3], [4]，常见做法是最大化预测方差。

在该模型下，局部的单步准则可能诱导出完全相同的排序。位置 \(j\) 处的一次假想观测按 \(c_j\sigma_j^2\) 降低局部不确定性，其中 \(c_j=-\ell''(\mu_j)\) 是后验均值处的似然曲率。在加性高斯噪声下 \(c_j\equiv c\) 为常数，于是单步熵下降 \(\frac12\log(1+c\sigma_j^2)\) 关于 \(\sigma_j^2\) 严格单调。因此，熵、方差与局部单步互信息会诱导相同的排序。我们称之为**高斯等价天花板（Gaussian equivalence ceiling）**：在这些局部准则之间切换不会改变所选的单元格。这一陈述针对的是局部评分，而不是诸如式 (18) 那种基于协方差的汇聚边缘前瞻准则。

非高斯的 IoT 观测打破了常曲率条件。二值频谱感知判决 [5] 给出伯努利似然，其 \(c_j=\beta_1^2p_j(1-p_j)\)；随机接入前导计数 [6] 给出泊松似然，其 \(c_j=N_ee^{\mu_j}\) 在整个场地上可以相差数个量级。此时后验可能偏斜，而集成嵌套拉普拉斯近似（INLA）[7] 在推断过程中估计这种偏度。我们研究这种偏度是否改善航点选择，以及究竟是什么支配着 REM 的精度与后验校准。

我们在一个统一框架内研究采集与先验设定。带简化拉普拉斯修正的 INLA [7]、Matérn–SPDE 先验 [8]、偏正态分布族 [9] 与序贯贝叶斯实验设计都是继承而来的组件；我们的贡献是偏度感知的采集规则、对它的分析，以及以下经验发现：

1. 我们用 INLA 后验与受运动学约束的无人机采样器，把从泊松与伯努利 IoT 观测出发的自适应 REM 构建形式化为「熵预筛选 + 协方差前瞻」的两阶段流程。
2. 我们量化先验宽度对重建精度与后验校准的影响：仅把先验阴影标准差从 6.0 dB 改为 10.025 dB，覆盖率提升 7.3 个百分点，六规则汇总的中位 NMSE 改善 8.9%。在射线追踪语料上，该改善在 4–16 dB 上单调；而在实测语料的接收单元格上，由训练得出的残差尺度使所检验的区间评分最小。在线边缘似然估计在射线追踪语料上稳定在约 6.5 dB，即使引入学习到的窗口级均值偏移，也无法恢复到表现更好的更宽先验。
3. 我们从理论上与实验上刻画该偏度修正：偏正态熵隙为 \(\Delta H(\alpha)=C_6\alpha^6+O(\alpha^8)\)，而在所检验的区间内，其孤立精度效应在统计上无法分辨。
4. 我们在 19 幅留出的射线追踪地图与 21 幅被排除的地图上评估该框架，并在 30 个实测 LoRaWAN 传播场窗口（配以仿真计数）上评估，且只在接收到的单元格上评分。
5. 我们评估对先验宽度误设（合成语料）、观测模型误设（射线追踪语料）与非平稳业务（合成语料）的敏感性，并在合成与射线追踪语料上报告飞行距离、计算开销以及一个归一化链路预算诊断量。

**图 1（原文 Fig. 1）：** 自适应无人机 REM 采样：驻留观测、地面站后验更新，以及两阶段航点选择。偏度影响熵预筛选；固定形状的 Sherman–Morrison 前瞻与高斯情形等价。图中数字与路径均为示意，预筛选排序的是边缘偏正态熵 \(H_{\mathrm{SN}}\)。（图中流程：无人机在 Point1 悬停并采集泊松计数 → 后验推断：初始后验未修正 → 简化拉普拉斯修正 → 后验偏斜、非高斯 → 偏正态拟合得到 SN 边缘，提取 \(\xi_i,\omega_i,\alpha_i\)；下端进入「自适应采样决策逻辑：高斯熵 vs. 偏正态熵」，A 为高斯熵基线（高斯假设 → 方差大 → 熵高），B 为所提偏正态熵（SN 假设 → 偏斜但方差相同 → 熵低），并标注「高斯熵下排名高（方差大）」「SN 熵下可能排名更低（偏斜、方差相同）」；右端两阶段选择：预筛选按 \(H_{\mathrm{SN}}\) 取 top-k（Cell12 1.85 Keep、Cell45 1.62 Keep、Cell33 1.28 Keep、Cell27 0.93 Keep、Cell08 0.41 Pruned、Cell51 0.28 Pruned，每单元格 \(O(1)\)）→ 精化阶段用 Sherman–Morrison 前瞻逐个候选计算 \(\Delta U_{\mathrm{SN}}\)（Cell12 0.87 为 \(j^\star\)、Cell45 0.52、Cell33 0.35、Cell27 0.18，每个候选 \(O(N)\)）→ GO → 选择下一个点（最大化 \(\Delta U_{\mathrm{SN}}\)）→ 飞往下一点并重复。）

## II. 相关工作

**REM 构建与无线电地图估计。** REM 支撑频谱管理 [1]，其稀疏重建被综述为频谱制图（spectrum cartography）[10]。相关方法包括低秩估计器与基于图像的地图补全 [11]。许多表述使用给定的测量位置与加性高斯的接收功率观测；而本文的位置是在无人机运动约束下序贯选择的，并保留了计数型与检测型似然。

**无人机信息型路径规划。** 相关方法包括高斯过程后验下的连续空间贝叶斯优化 [12] 与学习型规划策略 [13]。无线应用包括在线无人机频谱勘察 [3]，以及已知无线电地图并使用旋翼推进代价的规划 [14]。我们的研究考察非高斯采集，并在重建精度之外评估后验校准。

**贝叶斯主动学习与 INLA。** 高斯过程传感器布置区分了互信息目标与边缘熵/方差 [15]；GP-UCB 提供带遗憾保证的探索奖励 [16]；高斯过程主动学习支撑 5G 无线电地图重建 [4]。INLA 提供确定性推断 [7]；Matérn–SPDE 表示给出稀疏先验 [8]；近期工作发展了可扩展的偏斜后验近似 [17]。相关方法把拉普拉斯近似的泊松后验用于贝叶斯优化 [18], [19]。与它们不同，我们把后验偏度用于全局场重建中的采集，并分离其经验效应。

**计数型观测与 IoT 感知。** 潜在高斯场驱动对数高斯 Cox 计数，而偏正态分布族 [9] 提供具有可处理熵 [20] 的非对称边缘。无线方面的例子包括伯努利能量检测判决 [5]、随机接入计数 [6]、NB-IoT 前导检测 [21] 与协作式工业物联网感知 [22]，其中无人机作为数据采集器 [23]。在本文中，计数与检测是作为**空间测量**使用的，而不仅是业务量。

## III. 系统模型

无人机把观测发送到地面站以进行后验更新与航点选择（图 1）。指标 \(t\) 计数测量周期，每个周期包含一次跳飞、一个驻留监听窗口与一次更新（§III-D）；流逝时间不做仿真。

### A. 空间场

研究区域由位于 \(\{s_1,\dots,s_N\}\) 的 \(N\) 个单元格组成。潜在场使用自然对数单位 \(x_j=(P_j-P_{\mathrm{ref}})/\kappa_P\)，其中 \(\kappa_P=10/\ln 10=4.3429\) dB/nat，因此式 (3) 中的 \(e^{x_j}\) 是相对 \(P_{\mathrm{ref}}\) 的线性功率比。我们取 \(x\sim\mathcal N(m,Q^{-1})\)，其中 \(m\) 是同一单位下已知的对数距离路径损耗趋势，阴影残差具有零均值 GMRF 先验。趋势以已知偏移的形式进入式 (3)。Matérn–SPDE 表示 [8] 给出

$$
Q=\tau^2\,K_{\kappa^2}\,C^{-1}K_{\kappa^2},\tag{1}
$$

其中 \(C\) 与 \(G\) 是质量矩阵与刚度矩阵，\(K_{\kappa^2}=\kappa^2C+G\)，\(\kappa=\sqrt{8\nu}/\rho\) 设定尺度（range）\(\rho\)，且对 \(d=2\)、\(\nu=1\) 有 \(\tau^2=1/(4\pi\kappa^2\sigma_s^2)\)。先验阴影标准差 \(\sigma_P\) 以 dB 给出，并有 \(\sigma_s=\sigma_P/\kappa_P\)。

### B. 观测模型

在步 \(t\)，无人机访问单元格 \(l_t\)，并观测以 \(x_{l_t}\) 为条件的 \(y_t\)。

**模型 A：频谱感知（伯努利）**[5]，

$$
y_i\mid x_i\sim\mathrm{Bern}\bigl(\sigma(\beta_0+\beta_1x_i)\bigr),\qquad \sigma(\eta)=1/(1+e^{-\eta}),\tag{2}
$$

具有有界、依赖状态的曲率 \(c_j=\beta_1^2p_j(1-p_j)\)，其中 \(p_j=\sigma(\beta_0+\beta_1\mu_j)\)。

**模型 B：活动计数（泊松）**[6]，

$$
y_i\mid x_i\sim\mathrm{Poisson}\bigl(N_e\exp(x_i)\bigr),\tag{3}
$$

具有曲率 \(c_j=N_ee^{\mu_j}\)，它可以在整个场地上相差数个量级。与加性高斯的 REM 模型 [4] 不同，这些似然并不强加第 I 节所述局部准则的常曲率等价性。

### C. 计数模型的物理实例化

我们把模型 B 实例化为 EU863-870 频段中理想化的 LoRaWAN 上行业务。我们假定设备以占空比上限发射、独立尝试近似叠加为泊松过程、自适应数据速率（ADR）选择能够闭合链路的最低扩频因子，且覆盖范围内的每次尝试都被检测到并归入其单元格。

在 868.0–868.6 MHz 子频段，设备被限制在 25 mW e.r.p. 与 ≤1% 占空比 [24, Table B.1, band M]，占空比在一小时内测量 [25, cl. 5.4.1]，默认信道限制在 [26, Table 2] 中规定。在上限处，\(r_{\mathrm{dev}}(\mathrm{SF})=\delta/T_{\mathrm{air}}(\mathrm{SF})\)，其中 \(\delta=0.01\)。在扩频因子阶梯上，每一级灵敏度提升 [27, Table 10] 换来约 2.6 dB 的余量，同时空中时间约翻倍 [27, §4.1.1.7]。允许速率近似为 \(r_{\mathrm{dev}}\propto p^b\)，端点弦给出 \(b=1.052\)，基于六级最小二乘拟合给出 \(1.072\)（20 字节负载、125 kHz、编码率 4/5）。式 (3) 中的指数为 1 的链路与前者相差 \((p/p_0)^b-1\)，在以其中点为锚点时，该差异在 13 dB 的阶梯内处于 ±11% 以内，在此之外差异更大。

每次测量按式 (3) 在该驻留监听窗口 \(T_{\mathrm{obs}}\) 与足迹 \(A_{\mathrm{meas}}=h^2=25\ \mathrm{m}^2\) 内聚合到达单元格 \(l_t\) 的尝试。运动过程中不采集任何观测，单元格之间也不共享观测。暴露量为 \(N_e=\rho_{\mathrm{dev}}r_{\mathrm{dev}}h^2T_{\mathrm{obs}}\)，其中 \(\rho_{\mathrm{dev}}\) 是设备密度。在 IMT-2020 连接密度 \(\rho_{\mathrm{dev}}=10^6\ \mathrm{km}^{-2}\) [28, cl. 4.8] 下，参考 SF10 速率 \(r_{\mathrm{dev}}=0.02698\ \mathrm{s}^{-1}\)，给出

$$
N_e=0.6745\,T_{\mathrm{obs}}/(1\ \mathrm{s}),\qquad N_e=1\ \Longleftrightarrow\ T_{\mathrm{obs}}=1.48\ \mathrm{s}.\tag{4}
$$

于是 \(N_e\in\{1,2,5\}\) 对应 1.5 至 7.4 s 的驻留。传播锚点（1 m 处 \(P_0=-24.43\) dBm、\(n=3.76\) [29, cl. 4.5.2]、网关距离 623.0 m）把 \(P_{\mathrm{ref}}\) 设为 \(-129.50\) dBm，位于 \(-123\) 至 \(-136\) dBm 阶梯的中心。该速率代表监管上限，而非预测业务量；计数代表尝试次数，而非解码帧。随着 \(\sigma_P\) 从 2 dB 增至 8 dB，指数分支覆盖 ROI 单元格的 99.5% 至 57.8%。

### D. 无人机运动学与可达集

旋翼无人机以恒定高度与巡航速度 \(v_{\max}\) 飞行，可在原地悬停与偏航；加速、减速与转向均为瞬时。行程配额 \(\Delta t\) 不含感知与计算：每次跳飞至多覆盖 \(d_{\max}=v_{\max}\Delta t\)，随后是一个驻留监听窗口 \(T_{\mathrm{obs}}\)（§III-C）。可达集为

$$
\mathcal A_t=\bigl\{j:\ \|s_j-s_{l_t}\|_2\le d_{\max}\bigr\}\tag{5}
$$

与 ROI 网格的交集。表 I 给出 \(d_{\max}=20\) m 与内部区域的 \(|\mathcal A_t|=49\)，靠近边界时更小。我们分别报告测量次数与飞行距离 \(D=\sum_t\|s_{l_{t+1}}-s_{l_t}\|_2\)。在定速巡航与悬停假设下 [14]，推进能量是 \(D\) 的仿射函数，其斜率符号取决于任务时长固定还是驻留固定，因此我们不对节能作任何声称。

**表 I：仿真参数。**

| 符号 | 含义 | 取值 |
|---|---|---|
| \(N,h\) | ROI 单元格数（合成/射线追踪）、间距 | \(32^2/19^2\)，5 m |
| \(\rho,\nu,d\) | Matérn 尺度、光滑度、维数 | 50 m，1，2 |
| \(\kappa_P\) | 每 nat 的 dB 数，\(10/\ln 10\) | 4.3429 |
| \(\sigma_P\) | 先验阴影标准差（名义） | 6.0 dB |
| \(\sigma'_P\) | 先验阴影标准差（数据匹配） | 10.025 dB |
| \(P_{\mathrm{ref}}\) | 参考电平，锚点/射线追踪 | −129.50/−120.65 dBm |
| \(n\) | 路径损耗指数，锚点/射线追踪 | 3.76/3.90 |
| \(v_{\max},\Delta t\) | 巡航速度、行程配额 | 10 m/s，2 s |
| \(d_{\max},|\mathcal A_t|\) | 可达半径、内部集合大小 | 20 m，49 |
| \(T\) | 预算，合成/射线追踪 | 200/70 |
| \(N_e\) | 暴露量，合成/射线追踪 | 1–100/1 |
| \(\beta_0,\beta_1\) | 伯努利阈值、灵敏度 | −3.5，0.35 |
| \(K,K_s\) | 预筛选规模、刷新周期 | 20，10 |
| \(\varrho,\epsilon,k_{\max}\) | 阻尼、容差、迭代上限（主实验/后续） | 0.8/1.0，\(10^{-6}\)，50/100 |
| \(\kappa_{\mathrm{UCB}}\) | GP-UCB 探索系数 | 20 |
| \(R\) | 重复次数，合成/射线追踪 | 50/5×19 |

## IV. 基于 INLA 的后验近似

我们使用超参数固定的 INLA；除第 VI 节的在线估计实验外，超参数不确定性并未被积分掉。高斯近似 \(\mathcal N(\mu,Q_*^{-1})\) 通过对 \(f(x)=-\frac12(x-m)^{\top}Q(x-m)+\sum_t\ell_t(x_{l_t})\) 做 Newton–Raphson 得到 [7]。在第 \(k\) 次迭代，

$$
w_i=-\sum_{t:l_t=i}\ell''_t\ \ge 0,\qquad b_i=w_i\mu_i^{(k)}+\sum_{t:l_t=i}\ell'_t+[Qm]_i,\tag{6}
$$

其中 \(w_i\) 是单元格 \(i\) 处累积的似然曲率。令 \(Q_*=Q+\mathrm{diag}(w)\)，Newton 提议为 \(Q_*^{-1}b\)，阻尼与停止准则见算法 1。所得近似的均值为 \(\mu\)、协方差为 \(\Sigma=Q_*^{-1}\)，且 \(\sigma_i=\sqrt{\Sigma_{ii}}\)。简化拉普拉斯近似 [7] 在高斯对数边缘上（以 \(z_i=(x_i-\mu_i)/\sigma_i\) 为变量）加入线性与三次修正：

$$
\log\tilde\pi_{\mathrm{SLA}}(z_i)=\mathrm{const}-\tfrac12z_i^2+\gamma_i^{(1)}z_i+\tfrac16\gamma_i^{(3)}z_i^3,\tag{7}
$$

其局部余项为 \(O(z_i^4)\)。当三次项系数非零时，该表达式不是全局可归一化的。系数为

$$
\gamma_i^{(3)}=\sum_{j\neq i}d_j^{(3)}\left(\frac{\Sigma_{ij}}{\sigma_i}\right)^3,\qquad d_j^{(3)}=\sum_{t:l_t=j}\ell'''_t,\tag{8}
$$

并有

$$
\gamma_i^{(1)}=\tfrac12\sum_{j\neq i}d_j^{(3)}\bigl(\sigma_j^2-\Sigma_{ij}^2/\sigma_i^2\bigr)\,\Sigma_{ij}/\sigma_i,
$$

遵循 [7, Eqs. 20–21]。位置偏移影响 \(\xi_i\)，不影响 \(\alpha_i\) 或熵排序。三次项的协方差加权驱动了推论 1 中的衰减。

式 (8) 及其实现遵循 [7, Eq. 21] 排除了 \(j=i\)。把该项计入会额外加入 \(d_i^{(3)}\sigma_i^3\)，它在未观测单元格处为零。以 \(5\times 5\) 格点上的求积得到精确边缘作为对照（八种设置），截断表达式在已观测节点上恢复了标准化三阶累积量的 0.5–19%；把该项补回后误差为 0.3–7%。在未观测节点上，该表达式的一致性在 4% 以内。所有报告的结果都使用截断修正，而不是对完整展开的界（第 VII 节）。

我们只在**一阶**意义上把 \(\gamma_i^{(3)}\) 视作标准化三阶累积量：式 (7) 的微扰矩 \(\mathbb E[z_i]=\gamma_i^{(1)}+\frac12\gamma_i^{(3)}\)、\(\mathbb E[z_i^2]=1\)、\(\mathbb E[z_i^3]=3\gamma_i^{(1)}+\frac52\gamma_i^{(3)}\) 给出三阶累积量 \(\gamma_i^{(3)}+O(\gamma^2)\)。我们拟合一个偏正态密度 [9]

$$
f(x)=\frac{2}{\omega}\,\phi\!\left(\frac{x-\xi}{\omega}\right)\Phi\!\left(\alpha\,\frac{x-\xi}{\omega}\right),\tag{9}
$$

使其匹配方差与一阶标准化三阶累积量，位置参数设定见后文。令 \(\delta=\alpha/\sqrt{1+\alpha^2}\)，标准化三阶累积量为 \(\kappa_3(\alpha)=C\delta^3/(1-2\delta^2/\pi)^{3/2}\)，其中 \(C=\sqrt{2(4-\pi)}/\pi^{3/2}=0.2180136\)，其极限幅度为 \(\Gamma_{\max}=C(1-2/\pi)^{-3/2}=0.9952717\)。令 \(\kappa_3(\alpha_i)=\gamma_i^{(3)}\)、\(r_i=\gamma_i^{(3)}/C\)、\(q_i=|r_i|^{2/3}\)，得

$$
\frac{\delta_i^3}{(1-2\delta_i^2/\pi)^{3/2}}=r_i\ \Longleftrightarrow\ \delta_i=\mathrm{sign}(r_i)\sqrt{\frac{q_i}{1+2q_i/\pi}}.\tag{10}
$$

算法 1 使用该代数反函数，并把 \(|\gamma_i^{(3)}|\) 裁剪到 \(\Gamma_{\max}\) 以下以保持 \(\alpha_i\) 有限。在九单元格合成网格与两个射线追踪网格上（后续运行未再扫描）出现的最大值为 0.429，对应 \(|\delta_i|=0.8862\)。方差匹配与部分均值匹配给出

$$
\omega_i=\sigma_i\Big/\sqrt{1-2\delta_i^2/\pi},\qquad \xi_i=\mu_i+\gamma_i^{(1)}\sigma_i-\omega_i\delta_i\sqrt{2/\pi},\tag{11}
$$

从而精确保持 \(\mathrm{Var}_{\mathrm{SN}}=\sigma_i^2\)。该位置省略了 \(\mathbb E[z_i]\) 中的 \(\frac12\gamma_i^{(3)}\)，误差至多 \(0.21\sigma_i\)，但不影响所报告的量：熵 (12) 只依赖 \(\omega_i\) 与 \(\alpha_i\)，而 NMSE 与覆盖率使用拉普拉斯均值与方差。

## V. 偏度感知规划

### A. 偏正态熵与修正量的大小

对 \(\mathrm{SN}(\xi,\omega,\alpha)\)，微分熵为 [20]

$$
H_{\mathrm{SN}}=\tfrac12\log(2\pi e\,\omega^2)-\log 2-\Psi(\alpha),\tag{12}
$$

其中 \(\Psi(\alpha)=\mathbb E_{Z\sim\mathrm{SN}(0,1,\alpha)}[\log\Phi(\alpha Z)]\)。当 \(\alpha=0\) 时，\(\Psi(0)=-\log 2\)，回到高斯熵。命题 1 量化了它与「方差匹配的高斯」之间的差距。

**命题 1。** 令 \(H_{G,i}=\frac12\log(2\pi e\sigma_i^2)\)、\(\Delta H_i=H_{G,i}-H_{\mathrm{SN},i}\)。则 \(\Delta H_i\ge 0\)，且等号成立当且仅当 \(\alpha_i=0\)，并且

$$
\Delta H_i=C_6\alpha_i^6+O(\alpha_i^8),\qquad C_6=\frac{(4-\pi)^2}{6\pi^3}=3.9608\times10^{-3}.\tag{13}
$$

其中 \(\alpha_i^2\) 与 \(\alpha_i^4\) 的系数均为零。

**证明。** 由式 (11)，\(f_i\) 的方差为 \(\sigma_i^2\)。因此 \(\Delta H_i\) 就是它与「均值、方差相同的高斯」之间的 Kullback–Leibler 散度，这给出了非负性与等号条件。写 \(\Delta H_i=\frac12\log(1-2\delta_i^2/\pi)+\Phi_+(\alpha_i)\)，其中 \(\Phi_+(\alpha)=\log 2+\Psi(\alpha)\)。两项都是偶函数。利用 \(\delta^2=\alpha^2-\alpha^4+\alpha^6+O(\alpha^8)\) 与 \(u=2\delta^2/\pi\)，

$$
\begin{aligned}
\tfrac12\log(1-u)=&-\frac{\alpha^2}{\pi}+\left(\frac{1}{\pi}-\frac{1}{\pi^2}\right)\alpha^4\\
&+\left(-\frac{1}{\pi}+\frac{2}{\pi^2}-\frac{4}{3\pi^3}\right)\alpha^6+O(\alpha^8).
\end{aligned}\tag{14}
$$

对形状项，写 \(\Psi(\alpha)=\mathbb E_{Z\sim\mathcal N(0,1)}[2g(\alpha Z)]\)，其中 \(g(u)=\Phi(u)\log\Phi(u)\)。Birnbaum 界 \(\Phi(-s)\ge 2\phi(s)/(s+\sqrt{s^2+4})\)（\(s\ge 0\)）给出：对 \(1\le k\le 8\) 有 \(|g^{(k)}(t)|\le P_k(|t|)\phi(t)\)，其中 \(P_k\) 是系数非负的多项式。对 \(|\alpha|\le A\)，相应的被积函数导数被 \(2\phi(0)\phi(z)|z|^kP_k(A|z|)\) 界定，而它是可积的。因此在积分号下求导并用泰勒定理给出 \(\Phi_+(\alpha)=\sum_{m=1}^{3}\frac{\mathbb E[Z^{2m}]}{(2m)!}2g^{(2m)}(0)\alpha^{2m}+O(\alpha^8)\)，其中 \(\Phi_+(0)=0\)，奇数阶由对称性为零。利用 \(\mathbb E[Z^{2m}]/(2m)!=1/(2^mm!)\)、\(g''(0)=1/\pi\)、\(g^{(4)}(0)=4/\pi^2-4/\pi\) 与 \(g^{(6)}(0)=28/\pi-80/\pi^2+96/\pi^3\)，得到

$$
\Phi_+(\alpha)=\frac{\alpha^2}{\pi}+\left(\frac{1}{\pi^2}-\frac{1}{\pi}\right)\alpha^4+\left(\frac{7}{6\pi}-\frac{10}{3\pi^2}+\frac{4}{\pi^3}\right)\alpha^6+O(\alpha^8).\tag{15}
$$

把 (14) 与 (15) 相加，\(\alpha^2\) 与 \(\alpha^4\) 项相消，剩下

$$
\frac{1}{6\pi}-\frac{4}{3\pi^2}+\frac{8}{3\pi^3}=\frac{1}{6\pi}\left(1-\frac{4}{\pi}\right)^2=\frac{(4-\pi)^2}{6\pi^3}=C_6,\tag{16}
$$

即证 (13)。\(\blacksquare\)

**图 2（原文 Fig. 2）：** 命题 1 的数值验证。(a) 由 \(-\int f\log f\) 直接求积得到的熵隙 \(\Delta H(\alpha)\)，与 \(C_6\alpha^6\) 比较。(b) 局部指数 \(\mathrm d\log\Delta H/\mathrm d\log\alpha\) 趋于 6。阴影标出 \(|\alpha|\le 1.1\) 的范围，此处 \(\Delta H=2.34\times10^{-3}\) nat，而六次形式给出 \(7.0\times10^{-3}\)。

**推论 1。** 固定先验精度 \(Q\)、已观测集 \(\mathcal O\) 与一个与 \(\mathcal O\) 不相交的有限候选集。令 \(w_j=-\sum_{t:l_t=j}\ell''_t(\mu_j)\) 为汇总的泊松曲率，\(w_{\min}=\min_{j\in\mathcal O}w_j\)。沿一列满足 \(w_{\min}\to\infty\) 的拉普拉斯后验，并设候选标准差 \(\sigma_i\ge\sigma_{\min}>0\)，则 \(|\gamma_i^{(3)}|=O(w_{\min}^{-2})\)、\(|\alpha_i|=O(w_{\min}^{-2/3})\)、\(\Delta H_i=O(w_{\min}^{-4})\)。若候选的高斯评分保持分离，即 \(\inf\min_{k\neq l}|H_{G,k}-H_{G,l}|=g_0>0\)，则由 \(H_{\mathrm{SN}}\) 诱导的预筛选排序与由方差诱导的预筛选排序最终会一致。

**证明。** 对泊松观测有 \(\ell'''=\ell''\)，故 \(d_j^{(3)}=-w_j\)。令 \(W=\mathrm{diag}(w)\succeq 0\)，\(\Sigma=(Q+W)^{-1}\) 满足 \(\|\Sigma\|\le\|Q^{-1}\|\)。对 \(j\in\mathcal O\)、\(i\notin\mathcal O\)，由 \((Q+W)\Sigma=I\) 得 \(w_j\Sigma_{ij}=-[Q\Sigma]_{ji}\)，于是 \(|\Sigma_{ij}|\le C_Q/w_j\)，其中 \(C_Q=\|Q\|\,\|Q^{-1}\|\)。因此式 (8) 的每一项满足 \(|d_j^{(3)}|\,|\Sigma_{ij}|^3/\sigma_i^3\le C_Q^3/(\sigma_{\min}^3w_j^2)\le C_Q^3/(\sigma_{\min}^3w_{\min}^2)\)。由于 \(\mathcal O\) 固定，第一个速率成立；(10) 与命题 1 给出其余速率。当 \(\max_i\Delta H_i<g_0\) 时排序一致。\(\blacksquare\)

这些假设是重要的：只增大某一个 \(w_j\) 未必能消除式 (8) 中的其他项，而相互打平的高斯评分也可能被不相等的熵隙分开。该结果只涉及预筛选，不涉及协方差前瞻 (18) 与 MaxVar 的一致性。

### B. Sherman–Morrison 前瞻与两阶段选择

无人机在「冻结曲率、固定形状」的代理模型下，用汇总的边缘熵下降 \(\Delta U_{\mathrm{SN}}(j)\) 为可达候选打分。为避免对每一个候选重新拟合 INLA，我们对**一次**新观测使用秩一精度更新 \(Q_*^{\mathrm{new}}=Q_*+c_je_je_j^{\top}\)，其中 \(c_j=-\ell''(\mu_j)\) 在当前均值处取值，即使 \(w_j=0\) 也为正。Sherman–Morrison 给出

$$
\sigma_i^{2,\mathrm{new}}=\sigma_i^2-\frac{c_j\Sigma_{ij}^2}{1+c_j\sigma_j^2},\tag{17}
$$

每个候选只需从一列协方差出发的 \(O(N)\) 运算。在前瞻期间保持 \(\alpha_i\) 不变可使 \(\omega_i/\sigma_i\) 为常数，于是形状项相消，得到

$$
\Delta U_{\mathrm{SN}}(j)=\frac12\sum_{i=1}^{N}\log\bigl(\sigma_i^2/\sigma_i^{2,\mathrm{new}}\bigr),\tag{18}
$$

即高斯准则，求和遍历 \(N\) 个 ROI 单元格；缓冲区节点进入后验但不进入目标。我们按 \(H_{\mathrm{SN}}\) 保留可达候选中排名前 \(K\) 的（若 \(|\mathcal A_t|\le K\) 则全保留），然后在其上最大化 (18)。偏度只通过这一预筛选起作用；\(K=|\mathcal A_t|\) 时它对所选动作的影响消失。

对 \(\sigma_k^2>\sigma_j^2\)，预筛选反转二者原有的高斯排序，仅当 \(\Delta H(\alpha_k)-\Delta H(\alpha_j)>\frac12\log(\sigma_k^2/\sigma_j^2)\)。用式 (12) 的精确熵隙，扫描到的最大形状 \(|\alpha|=1.912\) 给出 \(1.538\times10^{-2}\) nat，因此只有当方差差异低于 3.12% 时才可能反转。而局部六次近似给出 0.1935 nat，超过精确熵隙的上确界 0.1870 nat，故在该形状处不可使用。对更小的形状，在六次区内每当 \(|\alpha|\) 减半，\(\Delta H\) 约下降 64 倍（图 2）。

### C. 算法与代价

算法 1 给出热启动的 Newton 循环。其缩放上确界准则取 \(\epsilon=10^{-6}\)，并控制最后一次增量的相对大小，而非到众数的距离。当达到 \(k_{\max}\) 时，保留当前迭代并标记为「触碰上限」，不重试、不回退、不剔除。非有限的后验运行则连同其配对运行一并剔除；每次实验都报告剔除数与触顶数。协方差使用接受前一个迭代所组装的精度矩阵，因此停止准则在该处局部控制这一滞后，但在触顶处不能控制。在恰当 GMRF 先验下，两种似然都给出严格凹的对数后验，从而众数唯一，尽管停止准则并不证明已经到达该众数。

**算法 1　基于 INLA 与 SN 预筛选的自适应采样。**

**输入（Require）：** 网格 \(\{s_i\}\)、先验 \((\mu_0,Q)\)、初始单元格 \(l_1\)、预算 \(T_{\max}\)、\(K_s\)、\(K\)、\((v_{\max},\Delta t)\)、\((\varrho,\epsilon,k_{\max})\)。

1: \(\alpha_i\leftarrow 0\)，\(\delta_i\leftarrow 0\)，\(\Psi_i\leftarrow -\log 2\)，\(\mu\leftarrow\mu_0\)，\(d_{\max}\leftarrow v_{\max}\Delta t\)  
2: **for** \(t=1\) **to** \(T_{\max}\) **do**  
3: 　在 \(l_t\) 处观测 \(y_t\)，\(\mu^{(0)}\leftarrow\mu\)，\(k\leftarrow 0\)  
4: 　**repeat**  
5: 　　按式 (6) 在 \(\mu^{(k)}\) 处计算 \(w_i,b_i\)，\(Q_*\leftarrow Q+\mathrm{diag}(w)\)，\(\tilde\mu\leftarrow Q_*^{-1}b\)  
6: 　　\(\mu^{(k+1)}\leftarrow(1-\varrho)\mu^{(k)}+\varrho\tilde\mu\)，\(k\leftarrow k+1\)  
7: 　**until** \(\|\mu^{(k)}-\mu^{(k-1)}\|_\infty<\epsilon\max(1,\|\mu^{(k-1)}\|_\infty)\) 或 \(k=k_{\max}\)  
8: 　\(\mu\leftarrow\mu^{(k)}\)（若 \(k=k_{\max}\) 则保留并记为触顶），\(\Sigma\leftarrow Q_*^{-1}\)（最后组装的 \(Q_*\)），\(\sigma_i\leftarrow\sqrt{\Sigma_{ii}}\)  
9: 　**if** \(t=1\) 或 \(t\bmod K_s=0\) **then**  
10: 　　按式 (8) 及其随附表达式计算 \(\gamma_i^{(1)},\gamma_i^{(3)}\)  
11: 　　把 \(|\gamma_i^{(3)}|\) 裁剪到 \(\Gamma_{\max}\) 以下，\(r_i\leftarrow\gamma_i^{(3)}/C\)，按 (10) 更新 \(\delta_i\)，\(\alpha_i\leftarrow\delta_i/\sqrt{1-\delta_i^2}\)，缓存 \(\Psi_i\)  
12: 　**end if**  
13: 　按式 (12) 计算 \(H_{\mathrm{SN}}(i)\)，其中 \(\omega_i\) 取自 (11)  
14: 　\(\mathcal A_t\leftarrow\{j\in\mathrm{ROI}:\|s_j-s_{l_t}\|_2\le d_{\max}\}\)（式 (5)）  
15: 　Candidates \(\leftarrow\) \(\mathcal A_t\) 中按 \(H_{\mathrm{SN}}\) 排名前 \(\min(K,|\mathcal A_t|)\) 的单元格  
16: 　\(l_{t+1}\leftarrow\arg\max_{j\in\mathrm{Candidates}}\Delta U_{\mathrm{SN}}(j)\)，按 (17)、(18) 计算  
17: **end for**

**表 II：单步选择代价。**

| 策略 | 选择代价 | 使用偏度 |
|---|---|---|
| Random | \(O(1)\) | 否 |
| MaxVar | \(O(|\mathcal A_t|)\) | 否 |
| MaxMI | \(O(|\mathcal A_t|)\) | 否 |
| MaxEnt-G（朴素） | \(O(kN^3|\mathcal A_t|)\) | 否 |
| MaxEnt-G（SM） | \(O(NK)\) | 否 |
| MaxEnt-SN（本文） | \(O(NK)+O(NM)/K_s\) | 是 |

\(N\)：网格规模；\(K\)：预筛选规模；\(M\)：已观测单元格数；\(K_s\)：刷新周期；\(k\)：Newton 迭代次数（\(\varrho=1.0\) 时中位数为 4，上限 100）。所有规则共享一个 \(O(kN^{3/2})\) 内层求解，而当前实现中的稠密协方差求逆需要 \(O(N^3)\) 运算与 \(O(N^2)\) 内存。

主合成网格与 MaxMI 分支早于这一设置，使用 \(\varrho=0.8\)、\(k_{\max}=50\)（表 I）。已检验的**固定数据**估计在数值上不变，但对自适应轨迹的影响未被界定。在主合成表的 900 次运行中没有一步触顶；其他生产作业中受影响运行的比例至多 2.1%，但 \(64\times 64\) 分支上达到 15.0%。

Sherman–Morrison 把前瞻从 \(O(kN^3|\mathcal A_t|)\) 降到 \(O(NK)\)；SN 规则另外带来均摊的 \(O(NM)/K_s\) 刷新代价（表 II）。整步运行时间（含共享的后验更新）在 \(32\times 32\) 上约 1.3 s、在 \(64\times 64\) 上约 11–15 s（峰值内存 2.1 GB），在 KAUST Ibex 集群的 AMD EPYC 9655 节点上每核单进程运行（NumPy 2.4.6、SciPy 1.17.1、稠密分解、无 GPU）。计算发生在选定跳飞之前，并累加到测量周期中而不改变 \(\mathcal A_t\)；这些运行时间约为 2 s 行程配额的 0.6 倍与 6 倍，因此我们不声称可实时运行。任务流逝时间未做仿真。稀疏选定求逆 [7] 无法提供式 (17) 与式 (8) 所需的协方差列；每步通过至多 \(K+M\) 次稀疏求解来获得这些列的做法未做基准测试。

## VI. 结果

### A. 实验设置

合成实验使用表 I 的 \(32\times 32\) GMRF，\(T=200\)、\(R=50\) 组配对种子、\(N_e\in\{1,2,5,10,20,50,100\}\)，并以同一单元格作为起点。射线追踪验证使用 19 幅 RadioMapSeer 地图 [30]（随 [11] 发布），取 \(T=70\)、五个种子，每条规则共 95 次配对运行。

5.9 GHz 场 [30, Table I] 与第 III-C 节受 868 MHz 启发的计数模型配对，未做频率迁移校准。因此该实验检验的是遮蔽城市空间结构，而非 868 MHz 的实际部署。地图 0–560 构成训练集、561–700 构成测试集。在从 561 到 678 每隔三个 id 抽取的 40 幅测试地图中，有 19 幅满足保留阈值：信息型比例 ≥0.90、删失比例 ≤0.30、1–99 百分位范围 ≤40 dB。¹ 模型常数在训练地图上拟合后冻结。² 运行取 \(N_e=1\)、第一个发射机，以及偏离它的 \(5\) m 栅格上的 \(19\times 19\) 窗口。噪声底单元格在规划与评分中都保留其底值。

我们比较 Random、lawnmower、MaxVar、MaxMI、GP-UCB、MaxEnt-G 与 MaxEnt-SN；MaxMI 仅用于合成语料。精度指标为 ROI 上的 \(\mathrm{NMSE}=\sum_j(\mu_j-x_j)^2/\sum_j(x_j-\bar x)^2\)。**残余 NMSE** 把分母替换为 \(\sum_j(r_j-\bar r)^2\)，其中 \(r_j=x_j-m_j\)，即用关于已知趋势的变化量做归一化。

**统计量。** 配对对比为每次配对运行的相对差异 \((\mathrm{NMSE}_A-\mathrm{NMSE}_B)/\mathrm{NMSE}_B\)，除另行说明外报告为中位数；95% 区间是来自 20 000 次自助重采样的百分位区间，重采样单位是携带其配对种子的地图或足迹簇（合成语料上为种子）；合成检验是符号翻转置换检验（\(10^4\) 次）。MDE 为配对均值的 2.80 个标准误（80% 功效），是一个设计量而非显著性阈值；四舍五入为零的 MDE 反映轨迹完全相同；且未做任何等价性检验。Holm 校正只作用于 §VI-G 的八个误设单元格。九单元格消融为 \(\sigma_P\in\{2,3,6,8\}\) dB × \(N_e\in\{1,2\}\)（80 个种子）外加 \((6\ \mathrm{dB},5)\)（50 个种子）。格点为每个 ROI 增加 10 个单元格的缓冲，\(N\) 只计 ROI 单元格。

lawnmower 使用牛耕式（boustrophedon）栅格，步长 \(\mathrm{round}\bigl(\sqrt{N_{\mathrm{ROI}}/T}\bigr)\)，并以 \(\lfloor d_{\max}/h\rfloor\) 封顶以尊重 \(\mathcal A_t\)。在 \(32\times 32\) 上得到步长 2，是两种被测步长中更好的一个。MaxMI 选择 \(\arg\max_{j\in\mathcal A_t}\frac12\log(1+c_j\sigma_j^2)\)。在非高斯似然下，该高斯模型表达式是 \(I(x_j,y_j)\) 的曲率加权代理；当 \(c_j\) 为常数时它与 MaxVar 一致。MaxEnt-G 通过与 MaxEnt-SN 相同的推断流程、可达集与前瞻，但使用高斯预筛选熵，从而把偏度预筛选隔离出来。除另行说明外，GP-UCB 取 \(\kappa_{\mathrm{UCB}}=20\)，其依据见 §VI-F。图 3 比较合成语料上的重建精度，表 VII 报告网络级指标。

¹ 保留的地图 id：585, 588, 591, 597, 603, 606, 609, 612, 618, 627, 639, 642, 645, 648, 657, 663, 669, 672, 675。  
² \(P_0=-33.66\) dBm，\(n=3.8995\)，残差标准差 10.025 dB，且 \(P_{\mathrm{ref}}=-120.65\) dBm。

**图 3（原文 Fig. 3）：** 在 \(\sigma_P=6\) dB、\(T=200\) 时，合成语料的残余 NMSE 随 \(N_e\) 的变化：50 个配对种子上的中位数与四分位距，水平偏移最多 3.5%。GP-UCB 在整段扫描中使用 \(\kappa_{\mathrm{UCB}}=2\)，空心标记给出仅在 \(N_e=1\) 评估的 \(\kappa_{\mathrm{UCB}}=20\)。

### B. 自适应 vs. 非自适应采样

在 \(T=70\) 时，后验驱动的采样优于非自适应采样。按地图与种子配对，Random 与 lawnmower 相对 MaxEnt-SN 的残余 NMSE 中位惩罚为 18.01% 与 14.01%，在 95 次运行中分别有 89 次与 79 次误差更高。它们的 95% 区间为 \([+14.77,+23.66]\%\) 与 \([+8.58,+20.36]\%\)。所有射线追踪区间都使用 20 000 次地图簇自助重采样，除另行说明外覆盖 19 幅保留地图，并保留每幅地图的五个配对种子。合成语料上的分离更大，且在最初 30 个样本内就已出现（图 3）。

信息型家族内部的差异未能分辨：MaxVar、GP-UCB 与 MaxEnt-G 相对 MaxEnt-SN 的配对相对效应区间分别为 \([-4.58,+6.25]\%\)、\([-3.41,+5.38]\%\) 与 \([0.00,0.00]\%\)。在更高的观测率下，MaxVar 反超 MaxEnt-SN，而 MaxEnt-G 在统计上仍与其无法区分。因此，一致的分离来自非自适应采样，而非信息型规则之间。

MaxMI 在 MaxVar 的准则上加入曲率权重 \(c_j\)。在泊松计数下，强烈变化的 \(c_j\) 偏向高 \(\mu\) 单元格：MaxMI 的 NMSE 高于 MaxVar，但低于 Random。在伯努利检测下 \(c_j\) 变化平缓，与其他信息型规则的差异也未能分辨；这与常曲率等价性一致，但并未证明该等价性。各信息型规则的飞行距离相近，且显著远于 Random 与栅格；栅格在距离上最省，而非在误差上最省（不推断任何能量排序，见 §III-D）。

### C. 先验宽度决定校准

两组各 570 次配对运行（19 幅地图、六条规则、五个种子）只在先验阴影标准差上不同：6.0 dB 与由训练拟合的残差尺度 10.025 dB。二者都在测试前固定。§VI-D 在同一批测试地图上把比较扩展到 4–16 dB，作为敏感性分析而非设定选择流程。

加宽先验使全部六条规则的覆盖率提升 \(+6.65\) 至 \(+7.69\) 个百分点，并降低汇总 NMSE（表 III）。覆盖率使用覆盖全部 ROI 单元格（含已观测单元格）的潜在场逐点拉普拉斯区间。非自适应分支在**完全相同**的轨迹上也改善，从而确立了一个独立于自适应采样的估计器侧增益。区间评分同样改善：覆盖率在 50% 至 99% 的各名义水平上均上升，95% 区间评分 [31] \(\mathrm{IS}_{0.05}=(u-l)+40[(l-x)^++(x-u)^+]\)（以 dB 计，宽度加上 40 倍的偏离距离）在宽度增加 6.9 dB 的情况下仍下降 37.6 dB。

更宽的先验**并未**达到校准：在 95% 水平上覆盖率仍比名义值低 11.9 个百分点，且在 80% 以上的所有被测水平上都低于名义值（99% 时为 0.88）。未被表示的空间结构是可能原因，但协方差、似然与近似误差仍是替代解释（第 VII 节）。

**表 III：射线追踪语料上的先验宽度干预：每种宽度 570 次配对运行。** 汇总行聚合全部六条规则，表 IV 单独报告 MaxEnt-SN。覆盖率变化的地图簇 95% 自助区间为 \([+4.99,+9.96]\) 个百分点。非自适应轨迹在不同宽度下完全相同。精确双侧符号检验的 \(p\) 值检验的是 16/19 对二分之一，而非相对 14/19 的变化。

| 量 | \(\sigma_P=6.0\) dB | \(\sigma_P=10.025\) dB | 变化 |
|---|---|---|---|
| 平均 95% 可信区间覆盖率 | 0.7585 | 0.8314 | +7.29 个百分点 |
| 相对名义值的亏缺 | 19.15 个百分点 | 11.86 个百分点 | −38.1% |
| 六条规则间的离散度 | 0.8 个百分点 | 0.5 个百分点 | — |
| 汇总中位 NMSE（六规则） | 0.8114 | 0.7396 | −8.9% |
| Random NMSE | 同一飞行，882.7 m | | −3.0% |
| lawnmower NMSE | 同一飞行，705.8 m | | −8.7% |
| 优于常数预测的窗口数 | 14/19 | 16/19（\(p=0.0044\)） | — |

### D. 先验宽度的选择：扫描与在线估计

**更宽的扫描。** 在表 IV 的七个宽度上，残余 NMSE、各被测名义水平上的覆盖率以及区间评分都从 4 dB 到 16 dB 单调改善。因此，在这套语料上训练残差并非最优点：未观察到转折点，而该扫描是敏感性分析而非选择规则。§VI-I 在实测场上给出不同的曲线。Random 的惩罚从 9.9% 增长到 23.6%，而家族内部的差异仍未能分辨：MaxVar 与 GP-UCB 处于 ±3% 以内且区间包含零，MaxEnt-G 的中位差异为 0.00%。两条非自适应轨迹在不同宽度下保持完全相同。重跑 6.0 与 10.025 dB 设置除 MaxVar 外精确复现了存储的轨迹；没有一次射线追踪运行是非有限的；每个单元格的触顶至多为 95 次保留运行中的 4 次与 105 次剔除运行中的 15 次。

**表 IV：保留射线追踪地图上的先验宽度扫描：MaxEnt-SN，每种宽度 95 次配对运行。** NMSE 为汇总中位数，覆盖率与区间评分为均值。\(\Delta\)NMSE 是中位配对相对变化，\(\Delta\)cov. 是平均配对变化，二者都相对于 6.0 dB，且其地图簇 95% 区间不含零。Random 的惩罚是在每种宽度下相对 MaxEnt-SN 的中位配对相对 NMSE 差异。

| \(\sigma_P\)（dB） | 4 | 6.0 | 8 | 10.025 | 12 | 14 | 16 |
|---|---|---|---|---|---|---|---|
| 残余 NMSE | 0.886 | 0.792 | 0.761 | 0.730 | 0.695 | 0.678 | 0.673 |
| 覆盖率 | 0.684 | 0.756 | 0.794 | 0.833 | 0.865 | 0.885 | 0.902 |
| \(\mathrm{IS}_{95}\)（dB） | 152.8 | 122.7 | 103.6 | 86.0 | 74.7 | 67.6 | 62.0 |
| \(\Delta\)NMSE（%） | +11.3 | — | −5.0 | −12.0 | −14.4 | −17.3 | −21.0 |
| \(\Delta\)cov.（百分点） | −7.2 | — | +3.8 | +7.7 | +11.0 | +12.9 | +14.6 |
| Random（%） | +9.9 | +13.5 | +17.7 | +18.0 | +18.9 | +21.5 | +23.6 |

21 幅被剔除的地图含有更多建筑面积、重建更难：10.025 dB 时残余 NMSE 为 0.915，而保留地图为 0.730，到 16 dB 时降到 0.759。覆盖率从 6.0 dB 的 0.54 升到 10.025 dB 的 0.77、再到 16 dB 的 0.89。第一次提升给出 +23.7 个百分点 \([+12.5,+36.2]\) 与 −21.8% NMSE \([-26.3,-17.0]\)。在 10.025 dB 时，Random 与栅格的惩罚为 20.3% \([13.8,27.0]\) 与 19.1% \([9.9,38.1]\)，各信息型规则保持在 ±1.3% 以内。因此该筛选挑出了更容易的窗口，却没有改变所观察到的、相对非自适应采样的分离。

**在线宽度估计。** 每 \(K_s=10\) 步，我们通过最大化拉普拉斯边缘似然，从累积计数中估计 \(\sigma_P\)：

$$
\log p(y\mid\sigma_P)\approx\sum_t\ell_t(\hat x_{l_t})-\tfrac12(\hat x-m)^{\top}Q(\hat x-m)+\tfrac12\log|Q|-\tfrac12\log|Q_*|,\tag{19}
$$

其中 \(\hat x\) 是 \(Q(\sigma_P)\) 下的众数。我们以 1 dB 间距搜索 3–16 dB，并用抛物线细化，在下一次更新前重新缩放先验精度。该经验贝叶斯流程（每次刷新 14 次网格评估）是离线评估的，未确立实时可行性。

在模型生成的合成场上，宽度估计误差的中位数为 0.3–0.7 dB，残余 NMSE 与真先验运行的差距在 0.04 以内、覆盖率在 3 个百分点以内。在射线追踪场上，从 6.0 dB 与 10.025 dB 两个起点出发都收敛到约 6.5 dB 的中位值（分别为 \([5.4,7.3]\) 与 \([5.4,7.4]\)）。该估计未能收回更宽先验的预测增益（表 IV–V），这与「模型失配而非仅初始化」的解释一致。

**学习均值偏移。** 我们还通过对 (19) 的坐标上升，在固定宽度或与宽度联合的情况下估计窗口级偏移 \(c\)（\(\mathbf m\to\mathbf m+c\mathbf 1\)）。真实偏移范围为 \(-13.5\) 至 \(+14.1\) dB（中位数 \(-4.0\) dB），估计误差中位数为 1.3 dB。即使使用真实偏移，残余 NMSE 仅改善 2.5%、覆盖率仅改善 1.3 个百分点；而加宽到 16 dB 可带来 9.2% 与 6.9 个百分点的改善。学到的偏移收回了其中约三分之二的增益，联合估计把宽度降到 5.4 dB（表 V）。

**表 V：保留射线追踪地图上的在线估计：MaxEnt-SN，每行 95 次配对运行。** 最终宽度与残余 NMSE 为中位数，覆盖率为均值。变化均相对固定的 10.025 dB 配对：NMSE 为中位相对值（附地图簇 95% 区间），覆盖率为平均变化。宽度估计从 6.0 dB 起步；仅偏移行把宽度固定为 10.025 dB；真实偏移行是 oracle 基准。

| 先验 | \(\hat\sigma_P\)（dB） | NMSE | 覆盖率 | \(\Delta\)NMSE（%） | \(\Delta\)cov.（百分点） |
|---|---|---|---|---|---|
| 固定 6.0 dB | — | 0.792 | 0.756 | +13.7 [9.3,16.9] | −7.7 |
| 固定 10.025 dB | — | 0.730 | 0.833 | ref. | ref. |
| 固定 16 dB | — | 0.673 | 0.902 | −9.2 [−13.8,−6.7] | +6.9 |
| 宽度在线 | 6.50 | 0.807 | 0.777 | +7.7 [4.4,11.1] | −5.6 |
| 偏移在线 | 10.025（固定） | 0.737 | 0.847 | −1.9 [−4.8,+0.2] | +1.4 |
| 二者在线 | 5.36 | 0.835 | 0.760 | +10.9 [6.4,17.6] | −7.3 |
| 真实偏移 | 10.025（固定） | 0.711 | 0.846 | −2.5 [−5.1,+0.0] | +1.3 |

窗口级均值误差不能解释更宽先验的优势。窗口内结构仍是候选原因：保留单元格中有 3–29% 位于射线追踪器的噪声底，而平稳高斯残差并未显式建模这一点。所检验的边缘似然流程在此处无法恢复与更好预测和覆盖率相关的宽度；分层式、预测式与稳健式在线估计器尚未检验。规范值与训练勘察残差提供了候选宽度，后者在实测语料上已更受偏好（§VI-I），但尚没有在独立站点上得到验证的选择规则。

### E. 什么没有分开：已刻画的零结果

七项消融包含四个「检验后无显著效应」的对比与三个「尚未检验」的敏感性探针（表 VI）。它们复用种子与设计，因此不是独立确认。

**偏度项。** MaxEnt-G 在保留相同推断与前瞻的前提下隔离了偏度预筛选。在两个射线追踪先验宽度上，该修正分别在 95 次运行中的 72 与 80 次里重排了候选，但只在 0.34% 与 0.64% 的步上改变了动作。78 与 65 次运行中的完全相同轨迹决定了中位精度差异为零。在九个 \((\sigma_P,N_e)\) 单元格上，全体运行的配对均值处于 ±1.0% 以内，种子自助区间在总体上与在出现分歧的运行中都是含零的。80% 功效的 MDE 为 0.8–2.5%。射线追踪的配对均值幅度约 0.3%，MDE 为 1.0–1.1%。

**为什么效应很小。** 六次熵隙（命题 1）、它的衰减（推论 1）以及罕见的动作改变，都支持但**不能证明**在所检验区间内不存在可检出的收益。

**刷新周期与预筛选规模。** 在 \(N_e=10\) 时，把 \(K_s\) 从 1 变到 50 使 NMSE 变化 0.003，把 \(K\) 从 5 变到 50 变化 0.016。因此我们保留 \(K_s=10\)、\(K=20\)。在 \(t=100\) 处的负载切换（\(N_e\)：\(1\leftrightarrow 20\)）对 \(K_s\in\{1,10,50\}\) 也没有可分辨的效应；该切换本身使 NMSE 上升到 8.2 倍（负载上升时 32.5% 的 Newton 不收敛），因为存储的计数按当前速率被重新解释——这是一次历史误设检验，而非暴露量感知的跟踪。

**伯努利观测。** 在模型 A 下，该修正相对 MaxEnt-G 仍无法分辨（中位数 0.00%，\(p=0.56\)）。在 \(T=200\) 之后没有规则明显优于仅先验的 NMSE，因此这是一个低信息量的一致性检验。

**表 VI：七项消融：四个检验后无显著效应的对比与三个尚未检验的敏感性探针。**

| 消融 | 反事实 | 效应 | MDE / 检验 |
|---|---|---|---|
| SN 修正，射线追踪 | MaxEnt-G | 0.3% | 1.0–1.1% |
| SN 修正，九单元格 | MaxEnt-G | 1.0% | 0.8–2.5% |
| 刷新周期 \(K_s\in[1,50]\) | \(K_s=10\) | 0.003（绝对） | — |
| 预筛选 \(K\in[5,50]\) | \(K=20\) | 0.016（绝对） | — |
| 刷新周期，负载切换 | \(K_s=10\) | 0.0% | 0.0–4.9% |
| 网格 \(64\times 64\) | \(32\times 32\) | 未检验 | — |
| SN 修正，伯努利 | MaxEnt-G | 0.00% | \(p=0.56\) |

### F. GP-UCB 的探索系数

GP-UCB 需要针对**重建**而非优化来调参。在四个阴影水平与两个观测率上，扫描 \(\kappa_{\mathrm{UCB}}\in\{1,2,3,5,10,20,50\}\) 显示精度在 3 与 10 之间急剧提升，随后进入平台期（图 4）。我们在这一稳定区间内取 \(\kappa_{\mathrm{UCB}}=20\)，此时 GP-UCB 与其他信息型规则相当。

**图 4（原文 Fig. 4）：** GP-UCB 扫描：相邻 \(\kappa_{\mathrm{UCB}}\) 设置之间的中位配对 NMSE 变化，每格 20 个种子。实线：\(N_e=1\)；虚线：\(N_e=2\)。实心标记表示在至少 15 个种子上有改善。所有被测条件都在 \(3\to 5\) 处下降，并在 10 之后趋于平坦。

### G. 对先验误设的稳健性

在合成真值固定为 \(\rho=50\) m、\(\sigma_P=6\) dB 的情况下，我们把假设的尺度在 \(\{25,50,100\}\) m 上变化、把阴影标准差在 \(\{3,6,12\}\) dB 上变化，对 MaxEnt-SN 与 MaxVar 每格使用 30 个配对种子。阴影**欠设**使两条规则的残余 NMSE 增加 30.3–82.7%；阴影**过设**的代价为 0.6–4.6%，但在最短尺度处例外，惩罚达到 29.6% 与 14.5%。尺度欠设对 MaxEnt-SN 的影响更强：+14.4%，而 MaxVar 为 −1.1%（\(p=0.61\)）。

配对均值的排序并不保持。在匹配先验下，MaxEnt-SN 相对 MaxVar 为 −4.1%（95% 区间 \([-9.12,+0.85]\%\)，置换检验 \(p=0.063\)）。在九个单元格中的五个（即尺度或阴影欠设的那些）它反转为 +1.5 至 +10.8%。在八个误设单元格上做 Holm 校正后，仍有三个反转显著，其余未能分辨（未校正 \(p=0.054\) 与 \(0.33\)）。均值排序只在两个假设参数都等于或高于其真值时才偏向 MaxEnt-SN，这是一个描述性发现，而非一般性条件。过设只在每个轴上的一个更大取值处（12 dB、100 m）做了检验。反转机制尚未识别：两条规则在前瞻与预筛选上都不同，因此该网格无法隔离偏度。

在 10.025 dB 的保留射线追踪语料上，我们保留泊松估计器 (3)，但用五种替代方式生成计数：ADR 幂律（\(b=1.072\)）、Fano 因子为 2 与 5 的负二项计数，以及把检测稀释到 80% 与 50%。相对匹配运行，幂律与轻度过度离散给出的配对中位 NMSE 变化未能分辨，分别为 0.00% \([-1.5,+1.2]\) 与 +0.6% \([-1.8,+2.6]\)。强过度离散的代价为 +4.2% \([+0.5,+8.5]\) 与 2.4 个覆盖率百分点。稀释产生的 NMSE 变化未能分辨（−1.9% 与 −0.9%，区间含零），但覆盖率最多损失 3.1 个百分点。在全部五种过程上，MaxEnt-SN 与 MaxEnt-G 的中位差异保持为零，且每条信息型规则都优于 Random。因此，重建精度能够容忍所检验的链路指数与检测率误差，但在强过度离散下退化。

### H. 网络级度量：等平均功率偏移下的接入覆盖率

我们评估基于地图的上行功率配置。运营者用后验均值来设定

$$
a_j=\mathrm{clip}\bigl(\Delta+\kappa_P(\bar\mu-\mu_j),\,a_{\mathrm{lo}},\,a_{\mathrm{hi}}\bigr),\qquad Q_j=1-\Bigl(1-\exp\bigl(-10^{-(a_j+\kappa_Px_j)/10}\bigr)\Bigr)^{L}.\tag{20}
$$

其中 \(\bar\mu\) 是 ROI 均值，\(\Delta=6\) dB，\([a_{\mathrm{lo}},a_{\mathrm{hi}}]=[-40,23]\) dB，\(L=2\)。偏移是相对在 \(P_{\mathrm{ref}}\) 处闭合链路的功率而言的。真实接收余量为 \(a_j+\kappa_Px_j\)；\(Q_j\) 是在两次独立尝试内、在单位均值瑞利衰落下存活的概率。裁剪之前，所有地图都按 dB 指令相同的平均偏移 \(\Delta\)。接入覆盖率 \(\mathrm{ACOV}\) 是 \(Q_j\) 的 ROI 均值。我们报告 \(\eta_{\mathrm{ACOV}}=(\mathrm{ACOV}-\mathrm{ACOV}_{\mathrm{trend}})/(\mathrm{ACOV}_{\mathrm{oracle}}-\mathrm{ACOV}_{\mathrm{trend}})\)，逐运行计算后平均，以 \(\mu=m\) 与 \(\mu=x\) 分别作为仅趋势与 oracle 参照。它们在合成语料上的平均接入覆盖率分别为 0.8038 与 0.9195。

这是一个衰落平均的链路预算度量，而非随机接入成功率：碰撞、捕获、调度与时延都被排除。以 dB 计的等平均偏移并不意味着等平均线性发射功率，而裁剪可能改变平均偏移。我们还用 \(z_{\mathrm{th}}\)（先验汇总 ROI 边缘分布的 15% 分位数）来分类覆盖空洞。若 \(x_j<z_{\mathrm{th}}\) 则该单元格是空洞；若 \(\mu_j\ge z_{\mathrm{th}}\) 则地图「承认」该单元格。\(P_{\mathrm{out}}\) 计数被承认的空洞（属于地图分类错误，而非物理链路中断），\(P_{\mathrm{fa}}\) 计数被拒绝的非空洞，二者都作为全部 ROI 单元格的比例；其和为总分类错误。

**表 VII：基线比较。** 合成列：在 \(\sigma_P=6\) dB、\(N_e=1\)、\(T=200\) 时 50 个配对种子的均值，而图 3 画的是中位数。\(\kappa=\kappa_{\mathrm{UCB}}\)。RT：10.025 dB 下相对 MaxEnt-SN 的中位配对残余 NMSE 惩罚，区间见 §VI-B。RT \(\eta_{\mathrm{ACOV}}\)：同一宽度下、使用由真值导出的窗口均值参照的归一化接入覆盖率，在每条规则相同的 95 次配对运行中的 75 次上平均（即那些 oracle 对趋势跨度高于 0.02 的运行）。—：未评估。

| 采集规则 | \(\mathrm{NMSE}_{\mathrm{resid}}\) | \(\eta_{\mathrm{ACOV}}\) | \(P_{\mathrm{out}}\) | \(P_{\mathrm{fa}}\) | RT | RT \(\eta_{\mathrm{ACOV}}\) |
|---|---|---|---|---|---|---|
| MaxEnt-SN | 0.3202 | 0.6429 | 0.1072 | 0.0255 | ref. | 0.316 |
| MaxEnt-G | 0.3215 | 0.6444 | 0.1079 | 0.0237 | 0.00% | 0.310 |
| GP-UCB（\(\kappa=20\)） | 0.3208 | 0.6470 | 0.1031 | 0.0189 | +0.32% | 0.328 |
| MaxVar | 0.3371 | 0.6248 | 0.1022 | 0.0199 | +1.13% | 0.334 |
| lawnmower | 0.5405 | 0.4730 | 0.1329 | 0.0121 | +14.01% | 0.299 |
| Random | 0.5631 | 0.4332 | 0.1317 | 0.0158 | +18.01% | 0.215 |
| GP-UCB（\(\kappa=2\)） | 0.9316 | 0.1660 | 0.1752 | 0.0003 | — | — |

GP-UCB 的设置分别报告。MaxMI 缺少存储的后验均值，故被省略（第 VII 节），其中位残余 NMSE 为 0.4841。

在合成语料上，MaxEnt-SN、MaxEnt-G、MaxVar 与调参后的 GP-UCB 比非自适应采样恢复了更多参照跨度，但它们的差异仍未能分辨。MaxEnt-SN 在两个决策层指标上都不排第一。接入覆盖率只是把地图质量翻译过来（在场地内与地图 MSE 的相关性为 0.90），而非独立地验证它。

对射线追踪场，我们把 \(P_{\mathrm{ref}}\) 设为每个窗口的真平均接收功率，从而在裁剪前即给出 oracle 余量 \(\Delta\)；这一 oracle 参照使 \(\eta_{\mathrm{ACOV}}\) 成为一个归一化诊断量，而非部署成功率。在 10.025 dB 时，平均 oracle、仅趋势与 MaxEnt-SN 的接入覆盖率分别为 0.9095、0.7785 与 0.8098。MaxEnt-SN 比 Random 高 0.0114 \([0.0073,0.0161]\)、比栅格高 0.0055 \([0.0011,0.0107]\)，在 95 次配对运行中分别有 83 次与 66 次获胜。各信息型规则之间的差异至多 0.004。恢复比例从 4 dB 的 0.25 升到 16 dB 的 0.33；表 VII 只在 oracle 对趋势跨度超过 0.02 处报告它。空洞分类在此处不具信息量（几乎所有单元格都被承认，\(P_{\mathrm{fa}}<0.003\)），故不报告。

**图 5（原文 Fig. 5）：** 先验宽度敏感性：(a) 汇总中位残余 NMSE；(b) MaxEnt-SN 的平均名义 95% 拉普拉斯覆盖率（其他规则相差至多两个百分点）。射线追踪：19 幅地图，每种宽度 95 次运行。实测：30 个 Antwerp 窗口，每种宽度 150 次运行，在接收单元格上评分；浅色曲线额外把删失单元格在底值上计分。竖直点线标出训练残差尺度（10.025 与 6.22 dB），水平线标出实测场的仅趋势 NMSE。

### I. 实测场

Antwerp LoRaWAN 语料 [32]（Zenodo 记录 3904158，v1.3）包含 130 430 条 868 MHz 上行链路，带 GPS 位置与逐网关经 SNR 校正的接收功率（ESP）。我们把每个网关的上行场作为其下行场的基于互易性的代理，假定设备功率、天线与校准效应都被一个网关特定的截距吸收，并忽略带内上下行差异。每个网关替代第 III 节中的发射机，定义 30 m 单元格的 \(19\times 19\) 窗口。

单元格真值是网关在该单元格内接收的 ESP 均值（dBm），视为固定值。至少有三条记录消息但在该网关无接收的单元格在 \(-146\) dBm 处左删失，比数据集中最低 ESP 低 4 dB，其仿真计数使用该底值。没有消息的单元格在规划与评分中都被屏蔽。主指标使用接收单元格；删失单元格仍是候选，并在底值上单独评分——这是一个代理量而非实测真值：未接收是由其他网关记录的消息推断的，且依赖扩频因子、干扰与碰撞，因此含底值的结果是一次删失敏感性分析。地面场是经验 RSSI 代理，而非依赖高度的无人机信道。该实验检验街道网络上的条件重建，而非全域制图。

窗口要求至少 30% 已测单元格、其中至多 30% 删失、动态范围在 40 dB 以内，并要求有一个外部网关。测试集包含来自 12 个网关的 30 个窗口，已测单元格为 34–61%。趋势在位于这些窗口之外的 74 199 条消息上拟合：网关特定截距、公共指数 2.20 与残差尺度 6.22 dB。训练与测试数据共享网关，因此这是语料**内**的空间泛化，而非网关或站点不相交的检验。

计数仍由式 (3) 在固定 \(N_e=1\) 下仿真，未按 (4) 重新缩放到 \(900\ \mathrm{m}^2\) 的单元格（参考密度下驻留 0.041 s）：实测场替代的是传播模型，而不是 LoRaWAN 足迹。我们取 \(d_{\max}=120\) m（四个单元格，\(v_{\max}\) 下 12 s 行程配额）、\(|\mathcal A_t|\le 49\)、\(\rho=50\) m、\(T=70\)、\(N_e=1\)，每个窗口五个种子。区间对 12 个足迹簇做重采样，属探索性。沿用第 V 节，6300 次扫描运行中有 72 次因 Newton 步触顶而被保留。非有限运行（扫描中 1/6300；\(N_e=5\) 时 2/2700，均为同一窗口上的 GP-UCB）连同其配对一并剔除。

在 6.22 dB 时，Random 与栅格相对 MaxEnt-SN 的残余 NMSE 惩罚为 +13.1% \([+8.0,+32.8]\) 与 +33.0% \([+20.6,+56.6]\)。该分离在不同宽度上持续（10.025 dB 时为 +16.5% 与 +33.1%），并在 \(N_e=5\) 时增大（+29.3% 与 +52.3%）。绝对残余 NMSE 在 \(N_e=1\) 时为 0.92，而仅趋势为 1.07，\(N_e=5\) 时为 0.72–0.83。逐消息噪声为 5.1 dB，每个单元格平均 2–12 条消息。

与射线追踪结果不同，把宽度增大到训练残差之外并未带来可分辨的 NMSE 增益：从 6.22 dB 到 10.025 dB 的变化为 −2.9% \([-7.8,+6.6]\)，而 16 dB 带来 +8.8% \([+1.9,+24.0]\)。覆盖率在 6.22 dB 时为 0.968，从 8 dB 起约为 0.98；区间评分在 6.22 dB 处最低。因此，由训练得出的宽度在这里得到支持，而不是位于一条单调改善曲线上。

GP-UCB 的误差名义上低 3–5%：6.22 dB 时为 −3.6% \([-8.5,+0.1]\)，8 dB 时为 −3.8% \([-8.8,-1.1]\)。MaxVar 的差异至多约 3%，且区间含零。两者的领先幅度在 \(N_e=5\) 时都增大到约 9%，并在 \(\rho=150\) m 时反转（MaxVar +10.3% \([+4.7,+14.7]\)）。MaxEnt-G 与 MaxEnt-SN 全程轨迹相同。

删失单元格占 23 个窗口已测单元格的 8%，但若在底值上计分，它们贡献了平方误差的中位 52%。在由训练得出的宽度下，后验仍比底值高 28 dB，且没有区间触及底值。把这些单元格计入后，Random 与栅格的惩罚降到 +4.1% 与 +12.9%，NMSE 持续改善到 14 dB，覆盖率在 16 dB 时达到 0.965，MaxVar 与 GP-UCB 领先 2–5%。因此，偏好的宽度取决于评分域：更宽的区间能容纳底值，却不建模删失。

## VII. 讨论与局限

**残余误校准。** 在射线追踪语料上，名义 95% 覆盖率在由训练得出的宽度下仍为 0.83，在最宽的被测取值下为 0.90。测试地图扫描是敏感性分析，而非宽度选择流程（§VI-C）。在相同的非自适应轨迹上的改善确立了估计器侧对亏缺的贡献，但未确定其全部原因。均值偏移与似然干预都未能隔离剩余误差；空间结构、协方差失配与推断近似仍是候选。所有分支都使用高斯区间；射线追踪中最大的三阶累积量为 0.2877，它既不界定偏差也不界定误差尾部。

**失败案例与选择。** 三个保留窗口（603、663、618）未能优于常数预测器；加宽使窗口 663 变差，其原因未被日志识别。保留地图所含建筑面积少于完整测试总体（14.3% 对 23.0%）。在 21 幅被剔除的地图上（§VI-D）结果保持了相对非自适应采样的分离，但误差更大。

**采集比较的范围。** 偏度结果仅限于被检验的区间（扫描运行中 \(\max|\delta|=0.886\)），并未确立等价性。家族内排序随采样密度、可达性与先验误设而变，反转机制仍未解决。GP-UCB 在实测场上误差名义上低 3–5%，尽管并非每个对比都被分辨（§VI-I）。

**截断的偏度修正。** 式 (8) 在已观测单元格处省略了 \(d_i^{(3)}\sigma_i^3\)。在 \(\sigma_P\in\{6,8\}\) dB、\(N_e\in\{1,2\}\)（各 80 个种子）上补回该项使残余 NMSE 变化 −0.46 至 +0.74%，所有区间含零。它在别处的影响尚未检验。

**场与观测的有效性。** 实测场研究以接收单元格为条件，训练与测试共享网关，且只有 12 个重采样簇；它不是独立站点验证。删失单元格会改变宽度敏感性，并在底值处承担约一半的平方误差；一个删失感知模型尚未实现。所有实验都使用仿真计数。五项误设检验（§VI-G）表明在所检验的 ADR 与检测率误差下重建精度基本不变，但强过度离散会使其退化。观测工作点也很重要：五倍暴露量使实测场 NMSE 降低 13–21%（§VI-I）。IoT 业务模型仍是一个理想化的设计包络，其假设见 §III-C。

**基线与网络度量的覆盖范围。** MaxMI 仅用于合成语料，且缺少表 VII 所需存储的后验均值。空洞分类仅用于合成语料，接入覆盖率未在实测场上评估；其射线追踪归一化使用由真值导出的参照（§VI-H），是一个链路预算诊断量，而非实测接入成功率。

**平台与时间范围。** 该研究是单无人机、单发射机、基于格点的；风、障碍、真实加速度、续航与固定翼约束都在 (5) 之外。除在线估计分支外，超参数都在飞行前固定。负载切换检验（§VI-E）按当前暴露量重新解释历史，并不检验暴露量感知的跟踪。

## VIII. 结论

我们开发了一个基于 INLA 的框架，用于从非高斯 IoT 观测出发做自适应无人机 REM 采样。在固定 70 次测量预算下，后验驱动采样相对 Random 与 lawnmower 采样改善了重建，且不作任何能量声称；偏正态修正得到刻画，但其孤立收益未能分辨；所提规则也未能可证明地优于调参后的高斯基线。先验宽度实质性地影响精度与校准，其偏好取值取决于语料与评分域；仅加宽并不能消除射线追踪中的覆盖不足，而所检验的在线估计器也无法恢复更宽的先验——因此这些结果是**诊断**，而不是经过验证的宽度选择规则。两套语料都把传播场与仿真计数配对。这些发现促使我们改进先验结构与观测建模，而不是继续细化采集规则。

## 参考文献

[1] H. B. Yilmaz, T. Tugcu, F. Alagöz, and S. Bayhan, "Radio environment map as enabler for practical cognitive radio networks," IEEE Commun. Mag., vol. 51, no. 12, pp. 162–169, 2013.

[2] H. Sun, S. Liu, X. Yu, and Y. Sun, "Flow matching-based active learning for radio map construction with low-altitude UAVs," 2025, arXiv:2509.13822.

[3] R. Shrestha, D. Romero, and S. P. Chepuri, "Spectrum surveying: Active radio map estimation with autonomous UAVs," IEEE Trans. Wireless Commun., vol. 22, no. 1, pp. 627–641, 2023.

[4] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder, Z.-L. Zhang, and G. B. Giannakis, "Bayesian active learning for sample efficient 5G radio map reconstruction," IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 19 382–19 396, 2024.

[5] S. Haykin, "Cognitive radio: Brain-empowered wireless communications," IEEE J. Sel. Areas Commun., vol. 23, no. 2, pp. 201–220, 2005.

[6] F. Baccelli and B. Błaszczyszyn, "Stochastic geometry and wireless networks: Volume I theory," Found. Trends Netw., vol. 3, no. 3–4, pp. 249–451, 2010.

[7] H. Rue, S. Martino, and N. Chopin, "Approximate Bayesian inference for latent Gaussian models by using integrated nested Laplace approximations," J. R. Stat. Soc. Ser. B Stat. Methodol., vol. 71, no. 2, pp. 319–392, 2009.

[8] F. Lindgren, H. Rue, and J. Lindström, "An explicit link between Gaussian fields and Gaussian Markov random fields: The stochastic partial differential equation approach," J. R. Stat. Soc. Ser. B Stat. Methodol., vol. 73, no. 4, pp. 423–498, 2011.

[9] A. Azzalini, "A class of distributions which includes the normal ones," Scand. J. Stat., vol. 12, no. 2, pp. 171–178, 1985. [Online]. Available: http://www.jstor.org/stable/4615982

[10] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, 2022.

[11] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[12] R. Marchant and F. Ramos, "Bayesian optimisation for informative continuous path planning," in Proc. IEEE Int. Conf. Robot. Autom. (ICRA), 2014, pp. 6136–6143.

[13] H. Bayerlein, M. Theile, M. Caccamo, and D. Gesbert, "Multi-UAV path planning for wireless data harvesting with deep reinforcement learning," IEEE Open J. Commun. Soc., vol. 2, pp. 1171–1187, 2021.

[14] Y. Zeng, J. Xu, and R. Zhang, "Energy minimization for wireless communication with rotary-wing UAV," IEEE Trans. Wireless Commun., vol. 18, no. 4, pp. 2329–2345, 2019.

[15] A. Krause, A. Singh, and C. Guestrin, "Near-optimal sensor placements in Gaussian processes: Theory, efficient algorithms and empirical studies," J. Mach. Learn. Res., vol. 9, no. 8, pp. 235–284, 2008.

[16] N. Srinivas, A. Krause, S. M. Kakade, and M. W. Seeger, "Information-theoretic regret bounds for Gaussian process optimization in the bandit setting," IEEE Trans. Inf. Theory, vol. 58, no. 5, pp. 3250–3265, 2012.

[17] S. Dutta, J. van Niekerk, and H. Rue, "Scalable skewed Bayesian inference for latent Gaussian models using INLA and variational Bayes," J. Comput. Graph. Stat., vol. 35, no. 3, pp. 1491–1506, 2026.

[18] Y. Mei, M. Imani, and T. Lan, "Bayesian optimization through Gaussian Cox process models for spatio-temporal data," in Proc. 12th Int. Conf. Learn. Represent. (ICLR), 2024.

[19] K. Yang, H. Rue, and J. Zeitler, "Isbo: Scalable spatio-temporal Bayesian optimization with log Gaussian Cox process models via the INLA-SPDE approach," arXiv preprint arXiv:2610.12213, 2026.

[20] R. B. Arellano-Valle, J. E. Contreras-Reyes, and M. G. Genton, "Shannon entropy and mutual information for multivariate skew-elliptical distributions," Scand. J. Stat., vol. 40, no. 1, pp. 42–62, 2013.

[21] H. Chougrani, S. Kisseleff, W. A. Martins, and S. Chatzinotas, "NB-IoT random access for nonterrestrial networks: Preamble detection and uplink synchronization," IEEE Internet Things J., vol. 9, no. 16, pp. 14 913–14 927, 2022.

[22] X. Liu, M. Jia, M. Zhou, B. Wang, and T. S. Durrani, "Integrated cooperative spectrum sensing and access control for cognitive industrial Internet of Things," IEEE Internet Things J., vol. 10, no. 3, pp. 1887–1896, 2023.

[23] Y. Zeng, Q. Wu, and R. Zhang, "Accessing from the sky: A tutorial on UAV communications for 5G and beyond," Proc. IEEE, vol. 107, no. 12, pp. 2327–2375, 2019.

[24] ETSI, "Short range devices (SRD) operating in the frequency range 25 MHz to 1000 MHz; Part 2: Harmonised standard for access to radio spectrum for non specific radio equipment," ETSI, Standard EN 300 220-2 V3.2.1, 2018.

[25] ETSI, "Short range devices (SRD) operating in the frequency range 25 MHz to 1000 MHz; Part 1: Technical characteristics and methods of measurement," ETSI, Standard EN 300 220-1 V3.1.1, 2017.

[26] LoRa Alliance, "LoRaWAN 1.0.2 regional parameters," LoRa Alliance, Specification rev. B, 2017.

[27] Semtech, SX1276/77/78/79 — 137 MHz to 1020 MHz Low Power Long Range Transceiver, Semtech Corp., 2015, rev. 4.

[28] ITU-R, "Minimum requirements related to technical performance for IMT-2020 radio interface(s)," International Telecommunication Union, Report ITU-R M.2410-0, 2017.

[29] 3GPP, "Evolved universal terrestrial radio access (E-UTRA); radio frequency (RF) system scenarios," 3rd Generation Partnership Project, Tech. Rep. TR 36.942 V10.2.0, 2011.

[30] Ç. Yapar, R. Levie, G. Kutyniok, and G. Caire, "Dataset of pathloss and ToA radio maps with localization application," IEEE Dataport, 2022, RadioMapSeer; preprint arXiv:2212.11777.

[31] T. Gneiting and A. E. Raftery, "Strictly proper scoring rules, prediction, and estimation," J. Amer. Statist. Assoc., vol. 102, no. 477, pp. 359–378, 2007.

[32] M. Aernouts, R. Berkvens, K. Van Vlaenderen, and M. Weyn, "Sigfox and LoRaWAN datasets for fingerprint localization in large urban and rural areas," Data, vol. 3, no. 2, p. 13, Apr. 2018.

---

**本页范围与校对状态：** 本页覆盖 arXiv:2610.40723v1 全文（11 页）：摘要与关键词、正文第 I–VIII 节全部正文与小节（§III-A–III-D、§V-A–V-C、§VI-A–VI-I、§VII 讨论与局限、§VIII 结论）、式 (1)–(20)（编号与原文一致，另含原文未编号的 \(\gamma_i^{(1)}\) 表达式与 \(\kappa_3(\alpha)\)、\(\Gamma_{\max}\)、微扰矩等行内公式）、算法 1 逐行（1–17 与 Require 行）、表 I–VII 逐格转写（含表 I 参数表、表 II 选择代价、表 III 先验宽度干预、表 IV 宽度扫描、表 V 在线估计、表 VI 七项消融、表 VII 基线比较）、图 1–5 图注、参考文献 [1]–[32] 英文原条目。**已完成的 PDF 渲染核对：** p.1（题名/作者/单位/arXiv 编号/摘要、引言首句 \(500\times500\) m）、p.3（图 1 与图注、表 I 全部取值、式 (4)–(6)）、p.4（式 (7)–(16)、命题 1 与证明、图 2 图注）、p.5（推论 1 与证明、式 (17)–(18)、算法 1 逐行、表 II）、p.6（图 3 图注、§VI-A 设置与 NMSE 定义、§VI-B 首段与 18.01%/14.01% 及其区间）、p.7（表 III/IV/V、式 (19)、§VI-C–D 全部数值）、p.8（表 VI、图 4 图注、§VI-E–G）、p.9（表 VII、图 5 图注、式 (20)、§VI-G 末段–H）、p.10（§VI-I 实测场全部数值、§VII 讨论与局限）。p.2（相关工作与 §III 开头）与 p.11（结论后半与参考文献）按 pypdf 抽取文本翻译，已与渲染页交叉核对。

**已知缺陷与核对疑点：** ① pypdf 抽取把公式上下标与分数打散（如 \(\rho_{\mathrm{dev}}r_{\mathrm{dev}}h^2T_{\mathrm{obs}}\) 在 p.3 抽取中只剩片段），本页按渲染页逐式重排，式号与原文一致；② 原文称「exponential branch covers 99.5 to 57.8% of ROI cells as \(\sigma_P\) increases from 2 to 8 dB」，其中「exponential branch（指数分支）」的指代在原文未进一步展开，本页如实照译未作推测；③ 表 VII 的 RT \(\eta_{\mathrm{ACOV}}\) 列（0.316、0.310、0.328、0.334、0.299、0.215）是**归一化**接入覆盖率，而 §VI-H 正文中「MaxEnt-SN 超过 Random 0.0114」（约 0.8098 对 0.7984）是**原始** ACOV 差值，二者口径不同，本页分别如实转写未混用；④ 原文式 (19) 前的「This empirical-Bayes procedure (14 grid evaluations per refresh) is evaluated offline」中「14 grid evaluations」与 §VI-D 所述 3–16 dB、1 dB 间距（14 个网格点）一致，本页保留原数；⑤ 「Random NMSE same flight, 882.7 m / lawnmower NMSE same flight, 705.8 m」两行在表 III 中原为同一飞行距离下与宽度的对比量（−3.0%/−8.7%），本页按原文表格结构保留，未改写成绝对 NMSE；⑥ 原文若干排版细节（如「UA V」「LoRaW AN」「Y .」等抽取空格伪影）已按正常拼写还原为 UAV、LoRaWAN、Y.；⑦ 表 I 中 \(\sigma'_P=10.025\) dB 与正文「training-fitted residual scale」一致，Footnote 2 的 \(P_0=-33.66\) dBm、\(n=3.8995\) 与式 (19) 附近的锚点参数 \(P_0=-24.43\) dBm、\(n=3.76\) 属于**不同语料**（合成/射线追踪 vs. §III-C 的 LoRaWAN 锚点），本页保留二者并靠上下文区分；⑧ 图 1 为位图流程图，图注外另以括注转写图中可见的分支与示意数值（Cell12 1.85/0.87 等），未推测不可读的路径细节。**建议后续 QA 重点：** 式 (8) 与后续 \(\gamma_i^{(1)}\) 的求和下标（\(j\neq i\) 排除项）、式 (14)–(16) 的符号与系数、推论 1 中 \(\sigma_i\ge\sigma_{\min}>0\) 的用法、§VI-E 负载切换「8.2 倍」与「32.5% Newton 不收敛」的归属、以及表 IV/V 中 \(\Delta\)NMSE 与 Random 惩罚两列的口径。逐句逐式终校未做。

---

**登记（2026-11-04）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
