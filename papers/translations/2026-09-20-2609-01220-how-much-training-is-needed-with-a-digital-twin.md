---
layout: page
title: "数字孪生需要多少训练数据？｜中文全文译文"
permalink: /papers/translations/2026-09-20-2609-01220-how-much-training-is-needed-with-a-digital-twin/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4a83ca67c5c2a663/) · [原文 arXiv](https://arxiv.org/abs/2609.01220) · [全部目录](/papers/catalog/)

# 数字孪生需要多少训练数据？

**原题：** How Much Training is Needed with a Digital Twin?  
**作者：** Ahmad Bazzi、Marwa Chafii。单位：纽约大学阿布扎比分校（NYU Abu Dhabi）工程学部，阿联酋 129188；NYU WIRELESS，纽约大学 Tandon 工程学院，美国纽约布鲁克林 11201（邮箱：ahmad.bazzi@nyu.edu、marwa.chafii@nyu.edu）。  
**版本：** arXiv:2609.01220v1（eess.SP），v1 日期 2026 年 9 月 1 日；原文 13 页，IEEE Transactions on Wireless Communications 投稿格式（Manuscript received xxx）。本页对应论文库 2026-09-20 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、图 1—9 图注、命题 1—3、引理 1—2、定理 1、推论 1—3、参考文献 [1]—[60]（英文原条目）。原文全文无编号表格（仅图 1—9），故本页无表格可转录；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与记号）：** 原文缩写在本页首次出现时保留英文：digital twin（DT，数字孪生）、physical world（PW，物理世界）、channel state information（CSI，信道状态信息）、best linear unbiased estimator（BLUE，最佳线性无偏估计）、Cramér–Rao bound（CRB，克拉美–罗界）、mean square error（MSE，均方误差）、line-of-sight（LoS）/non-line-of-sight（NLoS）、MISO、OFDM、ISAC、RIS、MIMO。记号约定：$(\cdot)^+\triangleq\max(\cdot,0)$；$\mathcal{CN}(\mu,\sigma^2)$ 为循环对称复高斯分布；$\mathbb E\{\cdot\}$ 为统计期望；小写字母表示标量。原文的 DT 方差记为 $\sigma_{\mathrm{DT}}^2$，DT 误差记为 $\Delta$，偏差记为 $b$。

## 摘要

本文研究：当无线信道存在一个数字孪生（DT）可用于辅助无线通信系统的信道估计任务时，需要多少导频训练。人们普遍期望无线信道 DT 能降低信道估计的导频开销，依据是一条非正式的规律——"孪生越精确，所需导频越少"。然而这一折中此前只在特定系统上得到经验演示，从未被量化。我们通过把 DT 视为信道的一次**补充测量**来填补这一空白：接收机把它与物理世界中的导频观测融合。于是，通过最佳线性无偏估计（BLUE）融合物理世界与数字世界，我们推导出 DT 辅助的 Cramér–Rao 界（CRB），并由此得到一条**导频等价律**，把 DT 保真度转换为等价的训练符号数。对估计器未知的有偏孪生，我们给出精确的失配阈值，超过它时信任 DT 比忽略它更差。我们量化了借助 DT 达到期望信道估计均方误差所需的训练量，并讨论了若干特殊情形以说明何时可以完全绕过物理世界训练。最后，我们把这些结果转化为块衰落可达速率，其最优训练长度是单个方程的唯一根，并识别出可完全免除导频训练的 DT 保真度阈值。大量数值结果印证了闭式表达式，并揭示：DT 的价值在有限信噪比（SNR）下最大，而在低 SNR 与高 SNR 两个极限下都消失。

**关键词：** 数字孪生；信道估计；导频开销；信道状态信息；6G。

## I. 引言

数字孪生（DT）的概念二十年前发源于制造与航空航天领域 [1]，特别是在美国空军研究实验室内部：DT 是物理实体的虚拟副本 [2]–[4]，通过测量与预测的持续交换与实体保持同步 [5]、[6]。在无线通信中，DT 已成为 6G 愿景的支柱，它有助于维持无线环境、流量与硬件的实时模型，并充当风险自由的沙箱——网络可在其中设计与优化，而无需在真实系统上实验 [7]–[9]。DT 可帮助 6G 无线技术使能自动驾驶、室内定位 [10]、环境监测与成像 [11]–[15] 等新应用，此外还有通感一体化（ISAC）[16]。进一步地，DT 还可作为超越 ISAC 的仿真环境，并扩展到具有不同多模态无线网络的更复杂任务 [17]：通信与射频可辅以相机等额外模态 [18]。然而，任何 DT 的实用性都由单一量支配——DT 的**保真度**，即虚拟模型多忠实地跟踪物理模型。这一点已被形式化为由有限数据引起的模型不确定性 [5]、[19]，以及信息论意义上模型质量与物理—数字世界之间交换信息的联合函数 [6]。

在网络层面，DT 支持零接触 6G 管理与跨越边缘、空中、安全 [21]、[22]、车辆与工业系统 [23]–[30]、通感一体化 [1]、[31]–[33] 以及边缘计算链路 [1]、[34]–[37] 的资源编排 [20]，并日益由生成式人工智能驱动 [7]–[9]；近期分析把已部署 DT 训练策略的性能以形式化的"孪生—现实"差异为上界 [38]、[39]。然而我们的兴趣在更下的一层：无线信道本身的 DT。

无线信道的 DT 可通过导入某站点特定环境的三维模型、为其表面分配电磁材料、并可能通过射线追踪方法合成信道来构建 [40]–[42]。在此基础上，DT 可以把射线追踪与学习融合用于多谱传播建模 [40]，通过某种扩散模型把用户位置映射到统计 CSI [43]，用生成式数据增强对抗信道老化 [44]，用物理信息神经网络跟踪可重构智能表面（RIS）信道 [45]–[48]，并把射线追踪直接放入车辆仿真流程 [49]。然而由于渲染出的信道建立在不完美的几何与材料描述之上，DT 永远无法精确匹配现实；这一残余的 sim-to-real 差距嵌入在几何与材料失配之中，是限制保真度的根本挑战之一 [5]、[6]。

但即便存在该差距，DT 已被证明是降低基于导频的信道获取开销的有力工具；这种开销削减在 6G 设想的大规模天线阵列与毫米波段最为有用，因为导频昂贵有多重原因：(i) 导频会在学习信道时产生开销，训练过多最终会在固定相干区间内通信时降低可达速率；(ii) 跨小区复用导频会引入所谓的导频污染；(iii) 波束扫描成本随天线单元数增长 [41]，而在 6G 中由于预期使用大规模 MIMO [50]，这一问题更为严重。第一批工作利用站点特定 DT 可生成自身信道数据这一事实：此类合成 CSI 已被用于训练反馈与波束管理网络，随后所需的真实世界数据远少于仅由测量训练的模型 [42]、[51]–[53]。第二批工作直接使用 DT 渲染的信道，这更乐观、因为更多信心被放在 DT 本身：此时 DT 产生的信道通过某种空口信道冲激响应推断来驱动预编码器 [41]，于是统计 CSI 可仅由用户位置获得而完全无需发送导频 [43]。

纵观文献，有一条非正式表述："DT 越准确，所需导频/训练越少。"[41]–[43]、[54]、[55]。然而它此前只在特定系统上得到经验演示，据作者所知从未被量化。例如 [42] 中的 DT 方法包含相关的站点特定信息，据称达到相同甚至更好性能所需反馈开销更少；[43] 完全不需要导频，故其框架可从大量位置生成统计 CSI 并取得满意结果；[55] 论证若数字副本足够准确，甚至可以绕过真实世界信道获取；[54] 推断 DT 即使消除信道获取开销也能预测真实环境中的无线信道信息；[41] 给出数值结果表明所提信道 DT 在无 CSI 获取时的精度；[56] 则强调 DT 技术应用的一个关键挑战是信道仿真器对三维 DT 精度的要求。回顾之下，人们甚至会问：**一个 DT 值多少导频？其价值如何随 DT 对环境的不确定性缩放，以及何时信任 DT 会比完全不用 DT 更糟？** 或者更广泛地问：**数字孪生下需要多少训练？**

经典训练理论把导频相对于信噪比（SNR）和/或 MIMO 情形下的天线数量进行量化 [57]，而现有的 DT 保真度概念 [6]、[38] 尚未转化为导频数。我们通过把 DT 建模为物理世界训练观测之上的补充信息——它构成无线信道的一次额外测量——来填补这一空白。下面我们概括本文贡献并阐明一些重要洞见。

我们的贡献总结如下。

- **DT 测量模型。** 我们把 DT 视为无线信道的一次补充测量，接收机在物理世界（PW）采集的训练观测之上可获得它。随后我们通过对 DT 的路径误差应用 Lindeberg–Feller 中心极限定理（CLT），建立该测量服从高斯模型的条件。我们进一步表明该高斯模型的两个矩都由 DT 为表面分配的电磁属性决定。特别地，我们在部署系综上仿真由 Fresnel 系数与完整极化路径增益产生的 DT 误差，并证明错误的材料假设会增大方差，而缓慢变化的路径相位会转化为偏差（且该偏差依赖频率）。
- **DT 的导频等价性与失配阈值。** 我们通过最佳线性无偏估计（BLUE）融合 PW 与数字世界，推导出 DT 辅助 CRB——它连续插值于仅导频估计（对无信息 DT）与 genie 辅助 CSI（对完美 DT）之间。借此我们推导**导频等价律**，把 DT 精度转换为等价的训练符号数，从而给出 DT 保真度的度量，以及达到目标均方误差（MSE）所需训练长度。对估计器未知的有偏 DT，我们得到精确的失配阈值，超过它时信任 DT 比忽略它更差。超过该阈值后，DT 值"负的导频数"，我们称这一效应为对 PW 的 **unlearning（反向学习）**。
- **可达速率与最优训练长度。** 我们把上述估计结果转化为块衰落信道上的可达速率（分别针对无偏与有偏 DT），并推导使该速率最大的训练长度，它是单个方程的唯一根。借助这些表达式，我们恢复仅导频速率与 genie 辅助速率作为极限情形，并识别出可完全免除训练的 DT 保真度阈值。

最后，我们给出大量数值结果，印证每个闭式表达式并揭示重要洞见：

- 当表面被渲染为轻介质而非近金属时，DT 内部错误的材料假设可使 DT 不确定性（或 DT 方差）增大到 3.8 倍；而同样的误差在较低频率下会转化为偏差。
- 对无偏情形，DT 所替代的导频数随 PW 工作 SNR 反比衰减；对有偏情形，还会因一个同时依赖偏差与所用训练量的因子进一步减少（依据导频等价律）。
- 随 DT 变得更准确，PW 训练量收缩，直到完全无需训练；而一旦 DT 出现偏差或精度下降，训练量又会增加。对 30 个符号的相干块与 0.05 的 DT 方差，无偏 DT 用单个训练符号即可达到 3 bits/s/Hz；而 0.3 的偏差需要 3 个训练符号才给出 2.75 bits/s/Hz——恰为完全无 DT 时的最佳速率；0.55 的偏差约需 4 个训练符号，却只给出 2.5 bits/s/Hz。在 10 dB 下工作的无偏 DT，只要 DT 方差不超 $10^{-3}$，就完全无需训练即可达到 $10^{-2}$ 的信道 MSE。
- 就可达速率而言，DT 的价值（相对无 DT 的可达速率）在中等 SNR 处最大化，并在低 SNR 与高 SNR 两个极限下消失。例如 DT 方差为 0.05 时，DT 速率价值最大化的最优 SNR 在 2.5，且该 SNR 随偏差增大而下降；对高偏差 DT（如 0.35），存在中等 SNR 区域使 DT 反而更有害。

**组织：** 本文其余部分组织如下。第 II 节给出系统模型，把 DT 表述为信道的补充高斯测量。第 III 节通过最佳线性无偏估计把该测量与物理世界导频融合，推导 DT 辅助 CRB、导频等价律，以及有偏孪生的失配阈值与相应的 unlearning 机制。第 IV 节把这些估计结果转化为块衰落可达速率并给出最优训练长度的闭式解。第 V 节给出数值结果，印证闭式表达式并量化 DT 在信噪比、DT 方差与 DT 偏差上的价值。第 VI 节总结全文。

**记号：** 小写字母表示标量，$\mathbb E\{\cdot\}$ 为统计期望。对复数 $z\in\mathbb C$，$|z|$ 为其模。$\mathcal{CN}(\mu,\sigma^2)$ 表示均值 $\mu$、方差 $\sigma^2$ 的循环对称复高斯分布。算子 $(\cdot)^+\triangleq\max(\cdot,0)$。

## II. 系统模型

我们分析多输入单输出（MISO）与正交频分复用（OFDM）系统中一个窄带子载波上的下行传输。接收机意图估计基站（BS）与用户设备（UE）之间存在的信道系数 $h_0\in\mathbb C$。在感兴趣的子载波内，该信道表示为 $L$ 条多径分量的叠加：

$$
h_0=\sum_{\ell=1}^{L}\alpha_\ell e^{-\mathrm j2\pi f\tau_\ell},\tag{1}
$$

其中路径 $\ell$ 具有由物理世界几何与物理环境中散射体电磁属性决定的复增益 $\alpha_\ell$ 与延迟 $\tau_\ell$，$f$ 表示频率。沿用 [57] 的块衰落训练模型，在长度为 $T$ 个符号的信道相干区间内，BS 发送 $T_\tau\le T$ 个单位功率训练符号（导频），留下 $T-T_\tau$ 个符号用于数据传输。为简单起见，我们假设全一导频帧。UE 观测信道的含噪样本

$$
y_i=h_0+n_i,\tag{2}
$$

其中 $n_i\sim\mathcal{CN}(0,\sigma_n^2)$ 是所有子载波上的加性高斯白噪声，被视为在子载波间白且独立，噪声功率为 $\sigma_n^2$。SNR 定义为 $\rho\triangleq1/\sigma_n^2$。

现在假设一个 DT 意图近似 PW 几何（包括材料模型）。此外，DT 试图从其环境模型重建叠加（1），它对其在路径集 $\hat{\mathcal L}$ 上解析出的每条路径产生增益 $\hat\alpha_\ell$ 与延迟 $\hat\tau_\ell$。例如 DT 可以是一个射线追踪器，产生

$$
\hat h_{\mathrm{DT}}=\sum_{\ell\in\hat{\mathcal L}}\hat\alpha_\ell e^{-\mathrm j2\pi f\hat\tau_\ell}.\tag{3}
$$

对复杂相对介电常数 $\varepsilon_r$ 的平面表面上、入射角 $\theta$ 处的单次镜面反射，反射场依赖入射场与 Fresnel 系数 [58]，而后者根本上依赖横电与横磁场，分别定义为

$$
\Gamma_{\mathrm{TE}}(\varepsilon_r,\theta)=\frac{\cos\theta-\sqrt{\varepsilon_r-\sin^2\theta}}{\cos\theta+\sqrt{\varepsilon_r-\sin^2\theta}},\qquad
\Gamma_{\mathrm{TM}}(\varepsilon_r,\theta)=\frac{\varepsilon_r\cos\theta-\sqrt{\varepsilon_r-\sin^2\theta}}{\varepsilon_r\cos\theta+\sqrt{\varepsilon_r-\sin^2\theta}}.\tag{4}
$$

一般而言，一条路径是 $N_\ell$ 次镜面反射的链条，每次反射击中材料 $i$ 的表面（由复相对介电常数 $\varepsilon^{(i)}$ 定义），入射角为 $\theta^{(i)}$。遵循 [59]，镜面场以球面波从镜像源扩散，故路径携带由**总长度**决定的自由空间路径损耗：

$$
g_\ell=\frac{1}{d_\ell},\qquad d_\ell=\sum_{i=1}^{N_\ell+1}d_\ell^{(i)},\tag{5}
$$

其中 $d_\ell^{(i)}$ 是路径 $\ell$ 第 $i$ 段直线段的长度，因此 $N_\ell+1$ 段依次从 BS 到第一个反射点、在相邻反射点之间、以及从最后一个反射点到 UE。在每次反射 $i$，场由对角 Fresnel 矩阵 $\Gamma(\varepsilon^{(i)},\theta_\ell^{(i)})=\mathrm{diag}(\Gamma_{\mathrm{TE}},\Gamma_{\mathrm{TM}})$ 变换，其分量由（4）给出。该变换在表面的局部入射坐标系中施加，该坐标系通过基变换 $W_\ell^{(i)}$ 到达。因此出射场满足

$$
W_\ell^{(i)}e_{\ell,\mathrm{OUT}}^{(i)}=\Gamma\left(\varepsilon^{(i)},\theta_\ell^{(i)}\right)W_\ell^{(i)}e_{\ell,\mathrm{IN}}^{(i)}.\tag{6}
$$

经 $N_\ell$ 次相互作用后，到达接收机的场为 $e_{\ell,\mathrm{IN}}^{(N_\ell+1)}$，复路径增益是它在发射场 $e_{\ell,\mathrm{OUT}}^{(0)}$ 上的共极化投影 [59]：

$$
\alpha_\ell=g_\ell\frac{\left(e_{\ell,\mathrm{OUT}}^{(0)}\right)^T e_{\ell,\mathrm{IN}}^{(N_\ell+1)}}{\left\|e_{\ell,\mathrm{OUT}}^{(0)}\right\|^2},\qquad
\tau_\ell=\frac{1}{c}\sum_{i=1}^{N_\ell+1}d_\ell^{(i)}.\tag{7}
$$

式（7）把路径损耗（5）与反射（6）合并为一个标量；对无交叉耦合的单一极化，它退化为 $\alpha_\ell=g_\ell\prod_i\Gamma(\varepsilon^{(i)},\theta_\ell^{(i)})=g_\ell R_\ell$，其中 $g_\ell$ 为自由空间路径损耗、$R_\ell$ 为表面响应，单次反射时恢复 $\alpha_\ell=g_\ell\Gamma$。一般情形下 $W_\ell^{(i)}$ 包含两种极化。

当 DT（等价地，它使用的射线追踪器）分配了错误材料——例如真实材料为混凝土（$\varepsilon_B$）却假定为玻璃（$\varepsilon_A$）——几何、延迟 $\tau_\ell$ 与基变换 $W_\ell^{(i)}$ 不变，但反射矩阵 $\Gamma$ 受影响，故经历多次弹跳的路径 $\ell$ 的总体误差可写为

$$
\epsilon_\ell=\left[\alpha_\ell\left(\{\varepsilon_A^{(i)}\}\right)-\alpha_\ell\left(\{\varepsilon_B^{(i)}\}\right)\right]e^{-\mathrm j2\pi f\tau_\ell},\tag{8}
$$

对单次反射情形可写为 $g_\ell[\Gamma(\varepsilon_A,\theta_\ell)-\Gamma(\varepsilon_B,\theta_\ell)]e^{-\mathrm j2\pi f\tau_\ell}$。因此，DT 所犯误差是其假定 DT 模型（3）与真实模型（1）之间的偏离，即 DT 输出与真实信道之差：

$$
\Delta\triangleq\hat h_{\mathrm{DT}}-h_0=\sum_\ell\epsilon_\ell.\tag{9}
$$

（9）中的随机性取在**部署系综** $\mathcal D$ 上，即在假定环境内所有可能的用户位置、频率与延迟上，并以宏观信道 $h_0$ 为条件。为紧凑表示，下文所有期望 $\mathbb E_{\mathcal D}\{\cdot\}$ 都关于 $\mathcal D$，即使省略下标。误差假设服从：

**假设 1（Lindeberg–Feller 中心极限定理）。** 在部署系综 $\mathcal D$ 上，DT 在各路径上犯的信道误差 $\{\epsilon_\ell\}_\ell$ 在（9）中跨 $\ell$ 独立、循环对称、方差有限 $\sigma_\ell^2\triangleq\mathrm{Var}_{\mathcal D}(\epsilon_\ell)$。记 $s_L^2\triangleq\sum_\ell\sigma_\ell^2=\sigma_{\mathrm{DT}}^2$ 为总误差功率，它们满足 Lindeberg 条件：对每个 $\varepsilon>0$，

$$
\frac{1}{s_L^2}\sum_\ell\mathbb E_{\mathcal D}\left[\left|\epsilon_\ell-\mathbb E_{\mathcal D}\epsilon_\ell\right|^2\mathbb 1\left\{\left|\epsilon_\ell-\mathbb E_{\mathcal D}\epsilon_\ell\right|>\varepsilon s_L\right\}\right]\xrightarrow[L\to\infty]{}0.\tag{10}
$$

条件（10）刻画 DT 建模误差在部署系综 $\mathcal D$ 上如何在各路径间分布。当总误差功率 $\sigma_{\mathrm{DT}}^2$ 按（10）的意义分摊到许多路径、每条路径携带误差方差份额 $\sigma_\ell^2/s_L^2$，使 DT 在许多路径上同时"相当地且温和地"出错时，它成立。反之，当单条路径占据大部分误差方差时它失效，这会带来重尾分布，高斯模型不再有效。在假设 1 下，Lindeberg–Feller 中心极限定理适用于（9）：归一化中心化误差 $(\Delta-b)/s_L$ 在 $L\to\infty$ 时依分布收敛到零均值循环对称标准高斯，即本质上有 $\Delta\sim\mathcal{CN}(b,\sigma_{\mathrm{DT}}^2)$，其中偏差项为 $b\triangleq\mathbb E_{\mathcal D}\{\Delta\}=\sum_\ell\mathbb E_{\mathcal D}\{\epsilon_\ell\}$，方差为

$$
\sigma_{\mathrm{DT}}^2\triangleq\mathbb E_{\mathcal D}\left\{|\Delta-b|^2\right\}=\sum_\ell\mathrm{Var}_{\mathcal D}(\epsilon_\ell).\tag{11}
$$

记中心化涨落 $e_{\mathrm{DT}}\triangleq\Delta-b\sim\mathcal{CN}(0,\sigma_{\mathrm{DT}}^2)$，则 DT 输出是真实信道的**含噪测量**：

$$
\hat h_{\mathrm{DT}}=h_0+b+e_{\mathrm{DT}},\qquad e_{\mathrm{DT}}\sim\mathcal{CN}(0,\sigma_{\mathrm{DT}}^2),\tag{12}
$$

这是 $h_0$ 的一个高斯观测，贡献 Fisher 信息 $1/\sigma_{\mathrm{DT}}^2$，而导频贡献 $T_\tau\rho$。方差 $\sigma_{\mathrm{DT}}^2$ 可视为 DT 因与 PW 失配而持有的不确定度。简言之，高斯模型（12）来自假设 1 下对众多反射路径的中心极限定理。

我们随后在射线追踪环境上确认：材料错误的 DT 可由两个矩 $(b,\sigma_{\mathrm{DT}}^2)$ 刻画。图 2 给出射线追踪器为表面分配错误材料时，DT 误差 $\Delta$ 在部署系综 $\mathcal D$ 上的直方图（9）：其方差 $\sigma_{\mathrm{DT}}^2$ 取决于假定材料错得多离谱，而当路径相位在部署间保持相关时出现偏差 $b$。具体地，我们由（4）的 Fresnel 系数与（7）的完整极化增益仿真 DT 测量模型（12）。考虑一个 $4\ \mathrm m\times4\ \mathrm m\times3\ \mathrm m$ 的金属墙壁房间，BS 固定，UE 在房间内扫过以平均整个部署系综 $\mathcal D$。传播路径为房间的镜面反射路径，用镜像法枚举，其中 BS 对墙的每个镜像都是一条经反射变换（6）追踪、并由增益（7）投影到 UE 的反射射线。真实表面全为金属（$\varepsilon_{\mathrm{true}}=1-10^7\mathrm j$），但 DT 分配错误材料，故每次反射都用错误的 Fresnel 系数反射，（6）被扰动。特别地，在图 2a 中我们仿真 DT 分别假定近金属（接近真实材料，$\varepsilon_{\mathrm{DT}}=1-10^3\mathrm j$）、混凝土（$\varepsilon_{\mathrm{DT}}=5.3-0.3\mathrm j$）与距金属最远的轻介质材料（$\varepsilon_{\mathrm{DT}}=1.6-0.01\mathrm j$）的情形。当 DT 假定错误墙壁材料时，每条反射路径都在反射强度上引入小误差；由于这些误差在众多路径间独立，它们以功率方式相长叠加，使总误差分布变宽。假定材料偏离真实金属（按复相对介电常数）越远，每条路径误差越大，故 $\sigma_{\mathrm{DT}}$ 从近金属假设的 0.28 增大到混凝土的 1、再到轻介质的 1.07，即最近与最远材料假设之间约 3.8 倍。在图 2b 中我们把真实材料固定为金属（同图 2a），但 DT 假定混凝土；此处部署系综取为一个 2 cm 的斑块。我们研究载波频率对 DT 误差 $\Delta$ 的影响：在高载波（28 GHz）处路径相位在部署系综上失相关，同样的材料误差平均为零均值散布、$b\approx0$；而在低载波（3.5 GHz）处相位保持相关，误差相干叠加、出现非零偏差 $b$。当波长相对平均区域较短时（如 28 GHz），反射路径相位逐点打乱，误差平均相消、DT 误差保持零均值；反之当波长相对该区域较长时（如 3.5 GHz），相位相对波长仅轻微变化，同样误差沿同一方向累加，转化为不可忽略的偏差。

**图 1：** PW 传播与其在数字世界中的射线追踪副本：一条 LoS 路径与两条 NLoS 路径（分别经建筑与经过的汽车）连接 BS 与 UE。DT 只是近似再现动态场景，并给表面分配与真实不同的材料，从而扰动路径增益，产生（12）中的偏差 $b$ 与方差 $\sigma_{\mathrm{DT}}^2$。（来源：原文第 4 页。）

**图 2：** 金属墙壁房间中 DT 误差 $\Delta$ 的直方图，该房间被 DT 建模为错误材料：(a) 当假定材料偏离金属越远时其方差 $\sigma_{\mathrm{DT}}^2$ 增大而保持零均值；(b) 材料固定为混凝土时，同样的误差在高载波（28 GHz）保持零均值，而在低载波（3.5 GHz）相干叠加形成偏差 $b$，实现模型（12）。（来源：原文第 4 页。）

## III. 借助 DT 辅助无线系统的信道估计

我们考虑确定信道 $h_0$ 的三个估计器，按各自使用的信息区分。

**(i) 物理世界：** 我们把仅用导频的信道估计过程称为**物理世界**，因为它只用物理信道上的导频做信道估计。众所周知，由模型（2）中仅导频的最大似然（ML）估计器如下：

$$
\hat h_{\mathrm{PW}}=\arg\max_h p\left(\{y_i\}\,|\,h_0\right)=\bar y,\tag{13}
$$

其中 $p(\{y_i\}|h)$ 是给定导频观测 $\{y_i\}$ 时信道 $h_0$ 的似然，即把导频的联合密度视为 $h_0$ 的函数。在高斯导频模型（2）下，最大化者是样本均值 $\bar y$，故 $\hat h_{\mathrm{PW}}$ 是仅由物理世界测量形成的最大似然估计（MLE）。$h_0$ 的 MLE 正是均值

$$
\bar y\triangleq\frac{1}{T_\tau}\sum_{i=1}^{T_\tau}y_i\sim\mathcal{CN}\left(h_0,\frac{1}{T_\tau\rho}\right).\tag{14}
$$

该估计过程的 MSE 可证明为 [60]

$$
E_{\mathrm{PW}}\triangleq\mathbb E\left\{|\hat h_{\mathrm{PW}}-h_0|^2\right\}=\frac{1}{T_\tau\rho},\tag{15}
$$

故 $T_\tau$ 个导频对 $h_0$ 贡献 Fisher 信息 $T_\tau\rho$，表明 PW 中信道估计的 MSE 只有在增加 $T_\tau$ 从而增加训练开销、或系统在更高 SNR $\rho$ 下运行时才会改善。

**(ii) 数字世界：** 给定 DT 的测量模型 $\hat h_{\mathrm{DT}}$ 服从式（3）、误差服从假设 1，可断言等价高斯模型（12）。由此立刻得到 DT 测量的误差为

$$
E_{\mathrm{DT}}\triangleq\mathbb E\left\{|\hat h_{\mathrm{DT}}-h_0|^2\right\}=|b|^2+\sigma_{\mathrm{DT}}^2.\tag{16}
$$

式（16）表明该误差自然依赖 DT 的偏差与误差方差。

**(iii) 物理世界与数字世界：** 前两个最优估计器可视为两个极端：PW 信道估计器（13）是无额外信道信息时基于 MLE 的典型信道估计器，即只利用已知导频序列的物理世界观测；而第二个使用服从（12）的 DT 测量的估计器依赖信道先验知识与 DT 生成器经 $b$ 与 $\sigma_{\mathrm{DT}}^2$ 捕捉的精度。为研究同时拥有 PW 与 DT 测量的效力，我们把 DT 输出（12）视为 $h_0$ 的第二次独立测量，用以辅助 PW 信道估计过程。本质上，在无偏 DT 情形（$b=0$）下可考虑如下加权最小二乘问题：

$$
\hat h_{\mathrm{P+D}}=\arg\min_h\left\{T_\tau\rho\left|\bar y-h\right|^2+\frac{1}{\sigma_{\mathrm{DT}}^2}\left|\hat h_{\mathrm{DT}}-h\right|^2\right\},\tag{17}
$$

其最小化者为逆方差组合：

$$
\hat h_{\mathrm{P+D}}=(1-w)\bar y+w\hat h_{\mathrm{DT}},\qquad w\triangleq\frac{1/\sigma_{\mathrm{DT}}^2}{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2}.\tag{18}
$$

我们考虑上述估计器，是因为由 Gauss–Markov 定理，（18）也是 BLUE，即在所有线性无偏估计器中采样方差最低。这里 $w\in[0,1]$ 是 DT 的权重，$\hat h_{\mathrm{P+D}}$ 插值于另外两个估计器之间：$w=0$ 时 $\hat h_{\mathrm{P+D}}=\hat h_{\mathrm{PW}}$（无信息 DT），$w=1$ 时 $\hat h_{\mathrm{P+D}}=\hat h_{\mathrm{DT}}$（完全自信的 DT）。

对给定 DT 辅助系统，人们可能关心可达的最小信道估计误差，即 DT 加导频能把 MSE 改善多少。为此有下述命题。

**命题 1（DT 辅助 CRB）。** 对无偏 DT，$h_0$ 的任意无偏估计器的最小方差（由（18）的 BLUE 达到）等于联合模型观测（2）与（12）的 CRB：

$$
E_{\mathrm{P+D}}(T_\tau)\triangleq\mathbb E\left\{|\hat h_{\mathrm{P+D}}-h_0|^2\right\}=\frac{1}{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2},\tag{19}
$$

其中 $\hat h_{\mathrm{P+D}}$ 为（18）的 BLUE，期望取在热噪声 $n_i$ 与 DT 误差方差 $e_{\mathrm{DT}}$ 上。

**证明：** 对无偏 DT，导频与 DT 是同一确定标量 $h_0$ 的两次独立无偏高斯测量：导频均值 $\bar y\sim\mathcal{CN}(h_0,1/(T_\tau\rho))$（由（14））携带 Fisher 信息 $T_\tau\rho$，DT $\hat h_{\mathrm{DT}}\sim\mathcal{CN}(h_0,\sigma_{\mathrm{DT}}^2)$（由（12），$b=0$）携带 Fisher 信息 $1/\sigma_{\mathrm{DT}}^2$。对独立观测，Fisher 信息相加，故关于 $h_0$ 的信息为 $J=T_\tau\rho+1/\sigma_{\mathrm{DT}}^2$，CRB 为 $1/J$。该 CRB 由（18）的 BLUE 达到，其误差为 $J^{-1}=(T_\tau\rho+1/\sigma_{\mathrm{DT}}^2)^{-1}$，即（19）。另一种证明是用（18）中 BLUE 的表达式，把 $\bar y$ 替换为 $h_0+\bar n$（$\bar n\sim\mathcal{CN}(0,1/(T_\tau\rho))$）、把 $\hat h_{\mathrm{DT}}$ 替换为 $h_0+e_{\mathrm{DT}}$。■

在与导频结合的 DT 语境中，式（19）（下文称 **DT 辅助界**）揭示两个极端：

$$
\lim_{\sigma_{\mathrm{DT}}^2\to\infty}E_{\mathrm{P+D}}=\frac{1}{T_\tau\rho}=E_{\mathrm{PW}}\ (\text{仅导频}),\qquad
\lim_{\sigma_{\mathrm{DT}}^2\to0}E_{\mathrm{P+D}}=0\ (\text{genie DT}).\tag{20}
$$

第一个极限说明：对无偏 DT，当 DT 变得高度无信息时只能依靠物理世界的导频训练，故性能由 SNR 或训练时间决定。反之，对无偏 DT，DT 信息越丰富，对 PW 的依赖越少（对 SNR 或训练时间的依赖越少）；极端情形是能平均地生成真实信道的 genie DT。接下来我们关注：一个 DT 辅助系统在 PW 中需要多少训练才能达到期望的信道估计 MSE。

**推论 1（达到目标精度的导频数）。** 观测（2）与（12）的 DT 辅助系统达到目标 MSE $\epsilon$ 所需的训练长度为

$$
T_\tau^\star\left(\epsilon,\sigma_{\mathrm{DT}}^2\right)=\frac{1}{\rho}\left(\frac{1}{\epsilon}-\frac{1}{\sigma_{\mathrm{DT}}^2}\right)^+.\tag{21}
$$

**证明：** 由（19），$E_{\mathrm{P+D}}(T_\tau)$ 在 $T_\tau\ge0$ 上严格递减。令（19）等于目标 MSE，得 $E_{\mathrm{P+D}}(T_\tau)=\epsilon$，即 $T_\tau\rho+1/\sigma_{\mathrm{DT}}^2=1/\epsilon$，故 $T_\tau=(1/\epsilon-1/\sigma_{\mathrm{DT}}^2)/\rho$。由于 $T_\tau\ge0$，得（21）。■

推论 1 的直接推论是：当 DT 本身已满足目标 MSE（即 $\sigma_{\mathrm{DT}}^2\le\epsilon$）时右端为零，表示无需训练。回顾地，若 DT 因建模不准确而不含足够信息（即 $1/\epsilon>1/\sigma_{\mathrm{DT}}^2$），则需要 $T_\tau^\star(\epsilon,\sigma_{\mathrm{DT}}^2)$ 才能达到期望 MSE $\epsilon$。由推论 1，可以感受在给定 DT 精度下能"绕过"多少训练。接下来，人们可能会问：一个 DT 替代多少导频？换句话说，PW 中多少导频被 DT 替代？为此我们引入无偏 DT 的导频等价律。

**引理 1（无偏 DT 的导频等价律）。** 方差为 $\sigma_{\mathrm{DT}}^2$ 的无偏 DT 值

$$
T_{\mathrm{eq}}=\frac{1}{\rho\sigma_{\mathrm{DT}}^2}\tag{22}
$$

个训练符号，意即 $E_{\mathrm{P+D}}(T_\tau)=1/\left((T_\tau+T_{\mathrm{eq}})\rho\right)$：用该 DT 加 $T_\tau$ 个训练符号估计，等价于用 $T_\tau+T_{\mathrm{eq}}$ 个训练符号且无 DT 可用时估计。

**证明：** 由（19）的 DT 辅助界在 $T_\tau$ 个导频处，我们只需令（19）与（15）的两个误差相等：$E_{\mathrm{P+D}}(T_\tau)=1/((T_\tau+T_{\mathrm{eq}})\rho)=E_{\mathrm{PW}}(T_\tau+T_{\mathrm{eq}})$，经简单整理即证毕。■

换言之，若 SNR 足够高，DT 可能变得不那么有用——它替代的导频更少。也就是说，DT 替代的导频数不仅取决于 DT 所含信息 $1/\sigma_{\mathrm{DT}}^2$，还取决于 PW 的工作 SNR。

现在我们让 DT 有偏，即（12）中 $\mathbb E\{\hat h_{\mathrm{DT}}\}=h_0+b$、$b\ne0$，而（18）中的 BLUE 仍以权重 $w$ 信任 DT，即 BLUE 仍认为 DT 无偏。因此我们分析使用有偏 DT 时的信道估计误差。

**命题 2（有偏 DT）。** 在未知 $b$ 下，（18）中 DT 辅助估计器的 MSE 为无偏界加偏差惩罚：

$$
E_{\mathrm{P+D}}^b(T_\tau,b)\triangleq\mathbb E\left\{|\hat h_{\mathrm{P+D}}-h_0|^2\right\}=E_{\mathrm{P+D}}(T_\tau)+w^2|b|^2.\tag{23}
$$

**证明：** 注意（18）中 BLUE 可写为 $|\hat h_{\mathrm{P+D}}-h_0|^2=|(1-w)\bar y+w\hat h_{\mathrm{DT}}-h_0|^2=|(1-w)(h_0+\bar n)+w(h_0+b+e_{\mathrm{DT}})-h_0|^2=|wb+(1-w)\bar n+we_{\mathrm{DT}}|^2$，其中 $\bar n\triangleq\frac{1}{T_\tau}\sum_{i=1}^{T_\tau}n_i\sim\mathcal{CN}(0,\sigma_n^2/T_\tau)$；再取期望得 $\mathbb E|\hat h_{\mathrm{P+D}}-h_0|^2=w^2|b|^2+(1-w)^2\mathbb E|\bar n|^2+w^2\mathbb E|e_{\mathrm{DT}}|^2=w^2|b|^2+(1-w)^2\frac{1}{T_\tau\rho}+w^2\sigma_{\mathrm{DT}}^2$。把 $w=\frac{1/\sigma_{\mathrm{DT}}^2}{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2}$ 代入即得（23）。■

有偏 DT 揭示若干洞见。第一，无信息 DT（$\sigma_{\mathrm{DT}}^2\to\infty$）行为如同渐近无偏 DT，即当 $\sigma_{\mathrm{DT}}^2\to\infty$ 时 $E_{\mathrm{P+D}}^b(T_\tau,b)\to E_{\mathrm{P+D}}(T_\tau)$，也即偏差可被 DT 的高误差方差掩盖。第二，若把更多权重 $w$ 放在信任 DT 上，有偏 DT 可以把 MSE 误差 $E_{\mathrm{P+D}}^b(T_\tau,b)$ 推得足够高。下一命题给出精确偏差阈值，一旦越过它，DT 在 MSE 意义上就有破坏性。

**命题 3（DT 的负价值）。** 对有偏且偏差 $b$ 未知的 DT，$E_{\mathrm{P+D}}^b>E_{\mathrm{PW}}$ 当且仅当偏差超过

$$
|b^\star|=\sqrt{\frac{1}{T_\tau\rho}+\sigma_{\mathrm{DT}}^2}.\tag{24}
$$

**证明：** 由（23）与（15），$E_{\mathrm{P+D}}^b>E_{\mathrm{PW}}$ 即 $w^2|b|^2>\frac{1}{T_\tau\rho}-\frac{1}{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2}=\frac{1/\sigma_{\mathrm{DT}}^2}{T_\tau\rho(T_\tau\rho+1/\sigma_{\mathrm{DT}}^2)}$。用（18）的 $w$ 整理得 $|b|^2>\frac{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2}{T_\tau\rho(1/\sigma_{\mathrm{DT}}^2)}=\frac{1}{T_\tau\rho}+\sigma_{\mathrm{DT}}^2=|b^\star|^2$，即（24）。■

值得注意，命题 3 换言之给出偏差阈值 $b^\star$：当未知偏差超过它时，信任有偏 DT 严格差于忽略它。命题刻画三种机制：$|b|<|b^\star|$ 时 DT 有帮助；随 $\sigma_{\mathrm{DT}}^2$ 增大，增益饱和于仅导频误差（13）；$|b|>|b^\star|$ 时 DT 有害。由（24），偏差容限随导频增多或 SNR 升高而**收缩**，即 $|b^\star|^2=1/(T_\tau\rho)+\sigma_{\mathrm{DT}}^2\to\sigma_{\mathrm{DT}}^2$；反之在导频很少甚至低 SNR 时，强有偏 DT 仍可能有助于信道估计。然而上述命题只从信道估计角度量化有偏 DT，并未说明达到期望 MSE 所需的导频数——推论 1 已在无偏情形回答该问题；对有偏且偏差未知的情形，我们有如下推广推论。

**推论 2（有偏 DT 下达到目标的训练）。** 对偏差 $b$ 未知、方差 $\sigma_{\mathrm{DT}}^2$ 的有偏 DT，达到 MSE 要求 $\epsilon$ 的训练长度为

$$
T_\tau^\star(\epsilon,b)=\frac{1}{\rho}\left[\frac{1+\sqrt{1+4\epsilon|b|^2/\sigma_{\mathrm{DT}}^4}}{2\epsilon}-\frac{1}{\sigma_{\mathrm{DT}}^2}\right]^+.\tag{25}
$$

上述导频长度在 $b=0$ 时恢复推论 1，并恰在 $\sigma_{\mathrm{DT}}^2+|b|^2\le\epsilon$ 时无需训练（$T_\tau^\star=0$），即 DT 本身已满足目标。

**证明：** 先令 $E_{\mathrm{P+D}}^b(T_\tau,b)=\epsilon$。由（23）有

$$
\frac{1}{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2}+w^2|b|^2=\epsilon,\tag{26}
$$

其中 $w=\frac{1/\sigma_{\mathrm{DT}}^2}{T_\tau\rho+1/\sigma_{\mathrm{DT}}^2}$。记 $x\triangleq T_\tau\rho+1/\sigma_{\mathrm{DT}}^2>0$，则 $w=(1/\sigma_{\mathrm{DT}}^2)/x$、$w^2|b|^2=|b|^2/(\sigma_{\mathrm{DT}}^4x^2)$，故（26）变为 $\frac1x+\frac{|b|^2}{\sigma_{\mathrm{DT}}^4x^2}=\epsilon$，即关于 $x$ 的二次方程

$$
\epsilon x^2-x-\frac{|b|^2}{\sigma_{\mathrm{DT}}^4}=0.
$$

其唯一正根易验证为 $x^+=\left(1+\sqrt{1+4\epsilon|b|^2/\sigma_{\mathrm{DT}}^4}\right)/(2\epsilon)$。由于 $T_\tau=(x-1/\sigma_{\mathrm{DT}}^2)/\rho$ 且训练长度非负，把 $x^+$ 代入 $T_\tau$ 表达式即得（25）。我们施加 $[\cdot]^+$ 算子使训练长度非负。此外易见，在 $\sigma_{\mathrm{DT}}^2+|b|^2=\epsilon$ 时式（25）恰为零；又因（25）关于 $\epsilon$ 递减（固定 $b$ 与 $\sigma_{\mathrm{DT}}^2$），任何 $\sigma_{\mathrm{DT}}^2+|b|^2\le\epsilon$ 都使括号项为负，从而 $T_\tau^\star(\epsilon,b)=0$。■

更具体地，推论 2 表明：当有偏 DT 本身已满足目标 MSE（即 $\sigma_{\mathrm{DT}}^2+|b|^2\le\epsilon$）时右端为零，故无需训练。重要的是，所需训练作为 MSE 要求 $\epsilon$ 的函数，不仅由方差 $\sigma_{\mathrm{DT}}^2$ 决定，也由未知偏差 $b$ 决定；并且要注意，偏差与方差只在 PW 训练所需边界处被对称对待。

另一个值得强调的洞见是（25）关于 $\sigma_{\mathrm{DT}}^2$ 的行为。对（25）关于 $\sigma_{\mathrm{DT}}^2$ 求导得

$$
\rho\frac{\partial T_\tau^\star}{\partial\sigma_{\mathrm{DT}}^2}=\frac{1}{\sigma_{\mathrm{DT}}^4}-\frac{2|b|^2/\sigma_{\mathrm{DT}}^6}{\sqrt{1+4\epsilon|b|^2/\sigma_{\mathrm{DT}}^4}},\tag{27}
$$

令其为零得

$$
\frac{1}{\sigma_{\mathrm{DT}}^4}=\frac{2|b|^2/\sigma_{\mathrm{DT}}^6}{\sqrt{1+4\epsilon|b|^2/\sigma_{\mathrm{DT}}^4}}
\ \Longrightarrow\ 
\sqrt{1+\frac{4\epsilon|b|^2}{\sigma_{\mathrm{DT}}^4}}=\frac{2|b|^2}{\sigma_{\mathrm{DT}}^2},\tag{28}
$$

故最优 DT 不确定度为

$$
\sigma_{\mathrm{DT}}^{2\star}=\frac{2|b|}{\sqrt{|b|^2-\epsilon}},\qquad|b|^2>\epsilon,\tag{29}
$$

而当 $|b|^2\le\epsilon$ 时被开方式为负、不存在内点最优，意味着最小值在 $\sigma_{\mathrm{DT}}^{2\star}=0$ 处取得。现在可引入有偏 DT 情形的导频等价律。

**推论 3（有偏 DT 的导频等价律）。** 偏差 $b$ 未知、方差 $\sigma_{\mathrm{DT}}^2$ 的有偏 DT 值

$$
T_{\mathrm{eq}}^b(T_\tau,b)=T_{\mathrm{eq}}\cdot\frac{1+T_\tau\rho\left(\sigma_{\mathrm{DT}}^2-|b|^2\right)}{1+T_\tau\rho\sigma_{\mathrm{DT}}^2+|b|^2/\sigma_{\mathrm{DT}}^2}\tag{30}
$$

个训练符号（当 PW 用 $T_\tau$ 个训练符号训练时），意即 $E_{\mathrm{P+D}}^b(T_\tau,b)=1/\left((T_\tau+T_{\mathrm{eq}}^b)\rho\right)$。式（30）在 $b=0$ 时与引理 1 一致，在 $|b|^2=\sigma_{\mathrm{DT}}^2+1/(T_\tau\rho)=|b^\star|^2$（即（24））处为零，超过它则为负：强有偏孪生值**负**的导频数。

**证明：** 按定义并由上述导频等价律，$T_{\mathrm{eq}}^b$ 满足 $E_{\mathrm{PW}}(T_\tau+T_{\mathrm{eq}}^b)=E_{\mathrm{P+D}}^b(T_\tau,b)$，故由（13）有 $T_{\mathrm{eq}}^b=1/\left(\rho E_{\mathrm{P+D}}^b(T_\tau,b)\right)-T_\tau$。代入（23）的 $E_{\mathrm{P+D}}^b(T_\tau,b)$ 并通分，分子塌缩为 $1+T_\tau\rho(\sigma_{\mathrm{DT}}^2-|b|^2)$，分母为 $\rho\sigma_{\mathrm{DT}}^2\left(1+T_\tau\rho\sigma_{\mathrm{DT}}^2+|b|^2/\sigma_{\mathrm{DT}}^2\right)$，即（30）。分子恰在 $|b|^2=\sigma_{\mathrm{DT}}^2+1/(T_\tau\rho)$（即（24））处为零，对更大的 $|b|$ 为负。■

与引理 1 不同，有偏 DT 含一个乘在 $T_{\mathrm{eq}}$ 上的因子，它依赖偏差本身以及 PW 中所用训练量 $T_\tau$。然而一个重要的机制是高 SNR 机制：有偏 DT 渐近地值

$$
T_{\mathrm{eq}}^b(T_\tau,b)\propto T_{\mathrm{eq}}\cdot\left(1-\frac{|b|^2}{\sigma_{\mathrm{DT}}^2}\right),\tag{31}
$$

表明即便 PW 在高 SNR 下运行，偏差也能惩罚掉一部分导频等价数。总体而言，推论 3 表明：当 $|b|^2<|b^\star|^2$ 时，DT 所值（即所替代）的等价导频量 $T_{\mathrm{eq}}^b(T_\tau,b)$ 为正；在极限 $|b|^2=|b^\star|^2$ 处 $T_{\mathrm{eq}}^b(T_\tau,b^\star)=0$，表示 DT 值零个导频；一旦偏差超过 $|b|^2>|b^\star|^2$，DT 所替代的等价导频量变为负，即 $T_{\mathrm{eq}}^b(T_\tau,b)<0$，表示 DT 开始**移除**实际导频量，即 $T_\tau+T_{\mathrm{eq}}^b(T_\tau,b)<T_\tau$——这就是对 PW 的 **unlearning（反向学习）现象**。

## IV. DT 辅助无线系统的容量分析

现在我们通过 [57] 的基于训练的可达容量下界，把估计结果转化为可达速率。这里采用标准块衰落模型：单位方差信道 $h_0\sim\mathcal{CN}(0,1)$ 在长度为 $T$ 个符号的相干区间内保持不变，其中 $T_\tau$ 个符号携带训练、$T-T_\tau$ 个符号携带数据，均在相同 SNR $\rho$ 下。接收机把导频 $\bar y$ 与 DT 输出 $\hat h_{\mathrm{DT}}$ 合并为单个信道估计并据此解码数据。下面引入并分析 DT 辅助无线系统所提供的可达速率。

**引理 2（DT 辅助可达速率）。** 对上述块衰落模型与精度 $1/\sigma_{\mathrm{DT}}^2$ 的无偏 DT，可达速率下界为

$$
C(T_\tau;\rho)=\frac{T-T_\tau}{T}\log_2\frac{\left(1+\frac{1}{\sigma_{\mathrm{DT}}^2}+\rho T_\tau\right)(1+\rho)}{1+\frac{1}{\sigma_{\mathrm{DT}}^2}+\rho T_\tau+\rho}.\tag{32}
$$

对有偏情形，有

$$
C^b(T_\tau;\rho)=\frac{T-T_\tau}{T}\log_2\left(\frac{1+\rho}{1+\rho\left(\frac{1}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2}+w_b^2|b|^2\right)}\right),\tag{33}
$$

其中 $w_b\triangleq\frac{1/\sigma_{\mathrm{DT}}^2}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2}$。

**证明：** 假设数据阶段在系统用 PW 对 $h_0$ 的观测（经导频均值 $\bar y=h_0+n$，$n\sim\mathcal{CN}(0,(\rho T_\tau)^{-1})$，由（14））与无偏 DT（由（12））获得信道估计之后进行，且 $n$、$e$ 与先验 $h_0\sim\mathcal{CN}(0,1)$ 相互独立。把二者堆叠为 $r=[\bar y,\hat h_{\mathrm{DT}}]^\top=\mathbf 1h_0+v$，$\mathbf 1=[1,1]^\top$，$v\sim\mathcal{CN}(0,R)$，$R=\mathrm{diag}\left((\rho T_\tau)^{-1},\sigma_{\mathrm{DT}}^2\right)$，则 $h_0$ 的最小均方误差（MMSE）估计为条件均值

$$
\hat h=\mathbb E\{h_0\,|\,\bar y,\hat h_{\mathrm{DT}}\}=\frac{\rho T_\tau\bar y+(1/\sigma_{\mathrm{DT}}^2)\hat h_{\mathrm{DT}}}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2}.\tag{34}
$$

由于 $h_0$ 与 $v$ 联合高斯，后验 $p(h_0|r)$ 为高斯；由似然 $\exp[- (r-\mathbf 1h_0)^H R^{-1}(r-\mathbf 1h_0)]$ 与先验 $\exp[-|h_0|^2]$ 之积中关于 $h_0$ 的二次项得

$$
p(h_0\,|\,r)\propto\exp\left[-u|h_0-\hat h|^2\right],\tag{35}
$$

故后验为 $\mathcal{CN}(\hat h,(1+\mathbf 1^HR^{-1}\mathbf 1)^{-1})$，$\hat h$ 为（34）的条件均值。方差 $1+\mathbf 1^HR^{-1}\mathbf 1$ 的倒数即所谓信息形式下的后验精度，即先验精度加上两次观测关于 $h_0$ 所携带的测量精度 $\mathbf 1^HR^{-1}\mathbf 1$。MMSE 等于该后验方差，且与实现 $r$ 无关，故误差 $\tilde h=h_0-\hat h$ 的方差为

$$
\sigma_e^2=\left(1+\mathbf 1^HR^{-1}\mathbf 1\right)^{-1}=\frac{1}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2},\tag{36}
$$

且由 MMSE 的估计与误差正交原理，即 $\hat h\perp\tilde h$ 与 $\mathbb E|\hat h|^2=1-\sigma_e^2$。把数据阶段条件化在 $\hat h$（$h_0$ 的充分统计量）上，即同时条件化在 $\bar y$ 与 $\hat h_{\mathrm{DT}}$ 上。进一步地，对单位功率数据符号 $x$，接收 UE 读到

$$
y=\sqrt\rho h_0x+w=\sqrt\rho\hat hx+\left(\sqrt\rho\tilde hx+w\right),
$$

其中噪声 $w\sim\mathcal{CN}(0,1)$。记 $z\triangleq\sqrt\rho\tilde hx+w$，则有效噪声 $z$ 与 $x$ 不相关，因为 $\mathbb E\{zx^*\}=\sqrt\rho\mathbb E\{\tilde h\}\mathbb E|x|^2+\mathbb E\{wx^*\}=0$（$\tilde h$ 零均值且与 $x$ 独立，$w$ 独立），其功率 $\mathbb E|z|^2=1+\rho\sigma_e^2$，而有用信号功率为 $\rho\mathbb E|\hat h|^2=\rho(1-\sigma_e^2)$。条件化在 $\hat h$ 上，输入看到已知增益与在固定方差下与其不相关的加性噪声；由最坏情形不相关噪声定理 [57, Thm. 1]，高斯 $z$ 最小化互信息，故

$$
I(x;y\,|\,\hat h)\ge\log_2\left(1+\rho_{\mathrm{eff}}\right),\tag{37}
$$

其中

$$
\rho_{\mathrm{eff}}=\frac{\rho\left(1-\sigma_e^2\right)}{1+\rho\sigma_e^2}.\tag{38}
$$

注意每 $T$ 个符号中只有 $T-T_\tau$ 个携带数据，故

$$
C(T_\tau)=\frac{T-T_\tau}{T}\log_2\left(1+\rho_{\mathrm{eff}}\right).\tag{39}
$$

把（36）代入（38）再代入（39）即得（32）。对有偏情形（12），同一 MMSE 估计（34）给出

$$
h_0-\hat h=\frac{h_0-\rho T_\tau\bar n-(1/\sigma_{\mathrm{DT}}^2)e_{\mathrm{DT}}}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2}-\frac{1/\sigma_{\mathrm{DT}}^2}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2}b,
$$

由此可证有偏情形下

$$
\sigma_{e,b}^2=\mathbb E|h_0-\hat h|^2=\sigma_e^2+w_b^2|b|^2,\tag{40}
$$

其中 $w_b\triangleq\frac{1/\sigma_{\mathrm{DT}}^2}{1+\rho T_\tau+1/\sigma_{\mathrm{DT}}^2}$。把（40）代入（38）—（39）中的 $\sigma_e^2$ 即得有偏速率（33）。■

无信息 DT（$1/\sigma_{\mathrm{DT}}^2\to0$）恢复 [57] 的纯训练速率。另一方面，完美 DT（$1/\sigma_{\mathrm{DT}}^2\to\infty$）使估计误差 $\sigma_e^2\to0$，进而使有效 SNR 趋于真实值 $\rho_{\mathrm{eff}}\to\rho$；当 $T_\tau\to0$ 时 $C\to\log_2(1+\rho)$，给出 genie 速率。接下来我们回答根本问题：数字孪生下需要多少训练？

**定理 1（最优训练长度）。** 对偏差 $b$ 未知的有偏 DT，速率（33）在 $T_\tau^\star=(u^\star-a)/\rho$ 处最大化，其中 $u^\star\in[a,a+\rho T]$ 是

$$
\ln\frac{(1+\rho)u^2}{D(u)}=(\rho T+a-u)\left(\frac2u-\frac{2u+\rho}{D(u)}\right)\tag{41}
$$

的唯一根，$a\triangleq1+\frac{1}{\sigma_{\mathrm{DT}}^2}$，$D(u)\triangleq u^2+\rho u+\rho|b|^2/\sigma_{\mathrm{DT}}^4$。

**证明：** 令 $u\triangleq a+\rho T_\tau$，它是 $T_\tau$ 在 $[a,a+\rho T]$ 上的单调重参数化，故 $T_\tau=(u-a)/\rho$、$\frac{T-T_\tau}{T}=\frac{\rho T+a-u}{\rho T}$。用有偏误差（40）有 $1+\rho\sigma_{e,b}^2=D(u)/u^2$，故 $1+\rho_{\mathrm{eff}}=\frac{(1+\rho)u^2}{D(u)}$，且

$$
C^b(T_\tau)=\frac{1}{\rho T\ln2}(\rho T+a-u)\ln\frac{(1+\rho)u^2}{D(u)}.\tag{42}
$$

因子 $1/(\rho T\ln2)$ 关于 $u$ 是正常数，故最大化 $C^b$ 等价于最大化 $g(u)\triangleq(\rho T+a-u)\ln\frac{(1+\rho)u^2}{D(u)}$。利用 $\frac{\mathrm d}{\mathrm du}\ln\frac{(1+\rho)u^2}{D(u)}=\frac2u-\frac{2u+\rho}{D(u)}$，即

$$
g'(u)=-\ln\frac{(1+\rho)u^2}{D(u)}+(\rho T+a-u)\left(\frac2u-\frac{2u+\rho}{D(u)}\right),\tag{43}
$$

令 $g'(u)=0$ 即得（41）。目标在 $[a,a+\rho T]$ 上单峰，故根 $u^\star$ 唯一，且 $T_\tau^\star=(u^\star-a)/\rho$。■

尽管引理 2 量化了 DT 辅助无线系统的速率，人们也可能关心 DT 辅助系统相对仅导频情形（无 DT 可用）能带来多少速率增益。本质上，DT 带来的速率优势可表示为

$$
\Delta C\left(\rho,\sigma_{\mathrm{DT}}^2,b\right)\triangleq\underbrace{\max_{0\le T_\tau\le T}C^b\left(T_\tau;\rho\right)}_{\text{DT 辅助}}-\underbrace{\max_{0\le T_\tau\le T}C\left(T_\tau;\rho\right)}_{\text{仅导频}},\tag{44}
$$

其中 $C^b$ 为有偏 DT 条件化速率（33），第二项为（32）中 $\sigma_{\mathrm{DT}}^2\to\infty$ 的极限。因此（44）度量相对无 DT 的速率优势。值得注意的是，当 $\rho\to\infty$ 时 $\Delta C(\rho)\to0$，意味着该优势在有限 SNR 处最大化——此时 DT 在训练昂贵时最有价值——而随 SNR 越来越高变得多余。

## V. 仿真结果

下面验证分析并说明 DT 辅助无线系统的相应工作机制。结果分两部分：先研究信道估计 MSE，即 DT 辅助界、达到目标精度所需的训练长度（21）、DT 的导频等价性，以及有偏 DT 的有害失配阈值；仿真定量刻画 DT 辅助系统相对无 DT 辅助系统预期需要多少训练。随后在适当处把 DT 辅助 MSE 增益转化为可达速率（借助引理 2 的 DT 辅助可达速率），并绘制定理 1 的最优训练长度以及 DT 带来增益、或降低可达速率的机制。

在图 4 中，我们画出达到给定信道估计 MSE 所需的导频数。该图取 $(\epsilon,\rho)=(10^{-2},10\ \mathrm{dB})$。"仅导频"界代表无 DT 可用的情形，此时训练只在 PW 中发生、不受 DT 辅助，故需满足 $\epsilon=E_{\mathrm{PW}}$。在高不确定性机制（$\sigma_{\mathrm{DT}}^2$ 很大）下，无论偏差如何，所有机制都收敛到仅导频界，表明达到给定信道估计 MSE 所需导频数由 PW 决定。当 DT 高度有偏（如 $|b|=0.5$）时，DT 始终比仅导频情形需要更多导频；此外，随 DT 对 PW 的描述更确定，DT 为达到目标信道估计 MSE 反而需要越来越多导频。例如 $\sigma_{\mathrm{DT}}^2=10^{-2}$ 时，在 $|b|=0.5$ 下 DT 所需导频是"无导频情形"的两倍，并随 DT 更确定而迅速增加。另一个值得注意的有偏情形是 $|b|=0.035$（$|b|^2>\epsilon$）：达到给定信道估计 MSE 所需最少导频出现在非平凡点 $\sigma_{\mathrm{DT}}^{2\star}=1.05\times10^{-3}$（由（29）给出），提示当 DT 误差降到 $\sigma_{\mathrm{DT}}^2\le\sigma_{\mathrm{DT}}^{2\star}$ 以下时，更多权重 $w$ 被放在 DT 上，从而需要更多训练来学习并抵消这种偏差。当偏差降到 $|b|^2\le\epsilon$ 以下时，使所需导频数最小的最优 DT 不确定性为零（如（29）之后所述）；此时偏差足够小，所需训练量只随不确定性增大而增加到仅导频界，DT 仍带来好处。例如在 $\sigma_{\mathrm{DT}}^2=10^{-3}$ 处所需训练时间约 30 个时隙，而仅导频界为 50。对无偏 DT，只要 DT 达到目标信道估计 MSE（即 $\sigma_{\mathrm{DT}}^2\le\epsilon$）就无需训练；否则随 DT 不确定性增大，所需导频数稳定增至仅导频情形的导频数。可见，准确的无偏 DT 无需训练，而有偏 DT 存在一个最佳不确定性，超过它之后因其偏差需要更多训练。

在图 5 中，我们画出给定工作 SNR 与目标信道估计 MSE $\epsilon$ 下，不同偏差与 DT 不确定性取值所需的导频数的工作区域图。该图取 $(\epsilon,\rho)=(10^{-3},20\ \mathrm{dB})$。标为 **free-twin** 的边界由 $\sigma_{\mathrm{DT}}^2+|b|^2\le\epsilon$ 刻画：在该条件下 DT 已满足所需目标 MSE $\epsilon=10^{-3}$，故 PW 中无需训练。另一个值得注意的边界是**最优 DT 不确定性**边界，出现在 $|b|>\sigma_{\mathrm{DT}}^2$ 时：由（29）决定，给定偏差下所需导频数在该边界上最小。此外，**worse than pilot-only** 边界由命题 3 决定，说明任何位于该边界以上的 $(b,\sigma_{\mathrm{DT}}^2)$ 都意味着把 DT 与 PW 结合会给出更差的 MSE（按 $E_{\mathrm{P+D}}^b>E_{\mathrm{PW}}$ 的意义）。本质上我们得出结论：free-twin 边界以下无需训练；而 worse than pilot-only 边界以上 DT 比完全不用 DT 消耗更多训练；点划线轨迹给出给定偏差下的最佳 DT 不确定性。

在图 6 中，我们画出不同训练长度下得到的可达速率（对信道实现取平均），固定 $T=30$、SNR $\rho=10$ dB。该图刻画无线通信的基本折中：发送更多导频改善信道估计，却蚕食可用于真正发送数据的时间，从而为达到最大可达速率形成训练长度的最优工作点。对无 DT 的传统系统（标为 **Hassibi–Hochwald** 界 [57]），我们看到相干块的相当一部分必须浪费在训练上才能达到最优容量；具体地，最优训练长度约为 $T_\tau\simeq3$ 个符号，可达速率约 2.75 bits/s/Hz。然而随 DT 信息变得更精确（$\sigma_{\mathrm{DT}}^2$ 更小），不仅最优训练长度减小，可达速率也提高：例如 $\sigma_{\mathrm{DT}}^2=0.05$ 时最优训练长度约 $T_\tau\simeq1$ 个符号、容量达 3 bits/s/Hz。这意味着准确的 DT 内在降低了信道估计所需的物理开销，释放更多符号给数据载荷，从而对可达速率产生正反馈。换言之，更准确的 DT 缩短最优训练并提升可达速率、逼近完美 CSI 情形，而无信息 DT 与 Hassibi 和 Hochwald [57] 的仅导频速率重合。

在图 7 中，与图 6 类似，我们在相同仿真参数下画出可达速率随训练长度的变化，但把不确定性固定为 $\sigma_{\mathrm{DT}}^2=0.05$，目的是说明有偏 DT 对系统容量与训练开销的破坏性影响。与无偏 DT 不同，一个自信但有偏的 DT 会主动误导信道估计器，从而迫使系统发送明显更多导频以"票决"掉坏的先验。事实上若偏差很大（如 $|b|=0.55$），DT 对系统有害：不仅所需训练长度约 4 个符号，可达速率也降到 2.5 bits/s/Hz；而 $|b|=0.3$ 时用 3 个训练符号达到约 2.75 bits/s/Hz，即无 DT 的最佳 Hassibi–Hochwald 界（在 $T_\tau$ 上取该界最大值，即图 6 中该界的峰值）。偏差进一步减小时，系统超越无 DT 界并开始逼近 genie 辅助的完美 CSI 界；例如无偏 DT 仅用 1 个训练符号即达 3 bits/s/Hz。

然而为理解训练长度与 DT 所引入偏差的联合影响，我们在图 8 画出系统容量作为训练长度 $T_\tau$ 与 DT 偏差函数的热图，提供鸟瞰视图。红色"山脊"（由求解（41）得到）代表最优训练，随偏差增大向右弯曲，表明 DT 辅助系统必须主动牺牲更多数据符号给物理导频，以对抗 DT 的误导性先验。实心白色等高线代表性能悬崖，即速率低到 DT 辅助系统不如完全忽略 DT 的阈值。

在图 9 中，我们如前固定 $T=30$ 个符号与 $\sigma_{\mathrm{DT}}^2=0.05$，画出（44）的 DT 速率增益 $\Delta C(\rho)$——即最优训练的 DT 辅助速率与最优训练的仅导频速率之差——作为工作 SNR $\rho$ 的函数，对应若干偏差水平。零线表示 DT 不带来收益、DT 辅助系统恰好达到仅导频速率。对无偏 DT，$\Delta C$ 处处为正，但随 $\rho$ 增大单调衰减到零，表明高 SNR 下导频已足够便宜、仅靠训练即可获得近乎完美的 CSI，留给 DT 的贡献很小。另一极端，当 $\rho\to0$ 时两种速率都消失、$\Delta C$ 亦然，故优势在约 $\rho\simeq2.5$ 的有限 SNR 处最大化，表明 DT 在训练昂贵的该 SNR 处最有价值。反之当 DT 有偏（如 $|b|=0.35$）时，优势在低 SNR 仍上升，但在中等 SNR 带穿过零以下：此处（40）的偏差地板在导频变便宜之前主导估计误差，表明信任 DT 比忽略它更差。偏差进一步增大（如 $|b|=0.6$）时该有害带变宽。对非常大的 $\rho$，所有曲线都收敛到零，因为充分训练会"洗掉"偏差。

## VI. 结论

本文通过把 DT 建模为无线信道的补充高斯测量，回答了数字孪生下需要多少训练的问题；该测量的偏差与方差来自对 DT 误差的 Lindeberg–Feller 中心极限定理，并受分配给环境的电磁材料支配。此外，利用 DT 测量与物理世界导频，经最佳线性无偏估计，我们推导出 DT 辅助 Cramér–Rao 界、把 DT 保真度转换为等价导频数的导频等价律，以及超过它 DT 就有破坏性、并会对物理世界发生 unlearning 的偏差失配阈值。把分析表述为块衰落可达速率后，我们得到最优训练长度的闭式解，并刻画了何时可完全免除导频训练。

这些结果量化了"DT 越准确所需导频越少"这一常见主张。我们通过一个射线追踪示例表明，DT 内部错误的材料假设可使其方差 $\sigma_{\mathrm{DT}}^2$ 膨胀约 3.8 倍；而一旦路径相位在部署间保持相关，同样的误差会转化为依赖频率的偏差。此外，DT 所替代的导频数随工作 SNR 反比衰减，因此就可达速率而言，DT 的价值在中等 SNR 处最大，并在低 SNR 与高 SNR 两个极限下都消失。未来方向包括：把框架推广到偏差被估计器部分已知的 DT、大规模 MIMO 与宽带毫米波信道，以及随环境演化保持高保真度（从而保持导频节省）的在线 DT 校准；未来工作还可包括 DT 能提供辅助的 ISAC 任务。

## 图注与表注

**图 1（原文第 4 页）：** 见正文 §II 图注（PW 传播与数字世界射线追踪副本；材料失配 → 偏差 $b$ 与方差 $\sigma_{\mathrm{DT}}^2$）。

**图 2（原文第 4 页）：** 见正文 §II 图注（DT 误差直方图：(a) 不同材料假设；(b) 不同载波频率）。

**图 3（原文第 6 页）：** 接收机由两次测量估计信道 $h_0$：一次**物理**测量（导频 $\bar y$，给出 $\hat h_{\mathrm{PW}}$）与一次**数字**测量（射线追踪 DT $\hat h_{\mathrm{DT}}$），二者由 BLUE 估计器融合。流程为：BS 真实传播几何 + 材料 → UE 导频 $\bar y\sim\mathcal{CN}(h_0,1/(T_\tau\rho))$；三维模型 + RT 引擎（渲染，含失配 $b,\sigma_{\mathrm{DT}}^2$）→ DT $\hat h_{\mathrm{DT}}\sim\mathcal{CN}(h_0+b,\sigma_{\mathrm{DT}}^2)$；BLUE 组合器 $\hat h_{\mathrm{P+D}}=(1-w)\bar y+w\hat h_{\mathrm{DT}}$ → 信道估计 $\hat h_{\mathrm{P+D}}$ → 数据传输与速率。

**图 4（原文第 10 页）：** 为达到目标 MSE 而在 PW 中所需的训练长度 $T_\tau$ 随 DT 不确定性 $\sigma_{\mathrm{DT}}^2$ 的变化，目标 $\epsilon=0.001$，分别给出无偏 DT 与若干有偏 DT；横轴为对数坐标的 $\sigma_{\mathrm{DT}}^2$，纵轴为所需训练 $T_\tau$，图中标出最优 DT 不确定性 $\sigma_{\mathrm{DT}}^{2\star}$、无偏 DT 的"零训练"区域、仅导频界与 $T_\tau\to\infty$ 区域。

**图 5（原文第 10 页）：** 达到目标 MSE 而在 PW 中所需训练长度在 DT 不确定性—偏差平面上的分布：横轴为 DT 方差 $\sigma_{\mathrm{DT}}^2$，纵轴为 DT 偏差 $|b|$；图中标出 "worse than pilot-only"（比仅导频更差）区域、最优 DT 不确定性 $\sigma_{\mathrm{DT}}^{2\star}$ 边界与 free-twin（$T_\tau^\star=0$）边界，色标为导频数 $T_\tau^\star$（0—10）。

**图 6（原文第 10 页）：** DT 辅助系统的可达速率 $C^b(T_\tau;\rho)$ 随训练长度 $T_\tau$ 的变化，取若干 DT 方差；图中标记给出速率最优的训练长度。参考线包括完美 CSI 上限（genie）与无 DT 情形（Hassibi–Hochwald），并给出 $\sigma_{\mathrm{DT}}^2=1$、$0.25$、$0.05$ 三条曲线。

**图 7（原文第 10 页）：** DT 辅助系统的可达速率随训练长度 $T_\tau$ 的变化，固定 DT 方差 $\sigma_{\mathrm{DT}}^2=0.05$、取若干 DT 偏差 $|b|=0$、$0.15$、$0.3$、$0.55$；参考线为完美 CSI 界（genie 辅助）与最佳无 DT（Hassibi–Hochwald）。

**图 8（原文第 10 页）：** DT 辅助系统的可达速率在训练长度 $T_\tau$（0—25）与 DT 偏差 $|b|$（0—0.6）平面上的分布；图中给出最优训练 $T_\tau^\star(|b|)$ 轨迹与 "DT = no-DT frontier"（DT 与无 DT 的分界），色标为可达速率（0—2.7 bits/s/Hz）。

**图 9（原文第 10 页）：** 最优训练的 DT 辅助系统相对最优训练的仅导频系统的速率优势 $\Delta C$（bits/s/Hz）随工作 SNR $\rho$ 的变化，取若干 DT 偏差 $|b|=0$、$0.1$、$0.2$、$0.35$、$0.6$；标记给出各曲线峰值，图中标出 "twin hurts"（孪生有害）区域。

**表注：** 原文全文无编号表格（仅图 1—9），故本页无需转录表格。

## 参考文献（英文原书目）

[1] Y. Cui, W. Yuan, Z. Zhang, J. Mu, and X. Li, "On the physical layer of digital twin: An integrated sensing and communications perspective," IEEE Journal on Selected Areas in Communications, vol. 41, no. 11, pp. 3474–3490, Nov 2023.
[2] L. U. Khan, Z. Han, W. Saad, E. Hossain, M. Guizani, and C. S. Hong, "Digital Twin of Wireless Systems: Overview, Taxonomy, Challenges, and Opportunities," IEEE Communications Surveys & Tutorials, vol. 24, no. 4, pp. 2230–2254, 2022.
[3] A. Alkhateeb, S. Jiang, and G. Charan, "Real-Time Digital Twins: Vision and Research Directions for 6G and Beyond," IEEE Communications Magazine, vol. 61, no. 11, pp. 128–134, 2023.
[4] A. Saeizadeh, M. Tehrani-Moayyed, D. Villa, J. G. Beattie, P. Johari, S. Basagni, and T. Melodia, "AIRMap: AI-Generated Radio Maps for Wireless Digital Twins," IEEE Transactions on Wireless Communications, vol. 25, pp. 18 871–18 884, 2026.
[5] C. Ruah, O. Simeone, and B. M. Al-Hashimi, "A Bayesian framework for digital twin-based control, monitoring, and data collection in wireless systems," IEEE Journal on Selected Areas in Communications, vol. 41, no. 10, pp. 3146–3160, Oct 2023.
[6] O. Ercetin, "Computational and communication aspects of digital twin: An information theoretical perspective," IEEE Communications Letters, vol. 27, no. 2, pp. 492–496, Feb 2023.
[7] Z. Tao, W. Xu, Y. Huang, X. Wang, and X. You, "Wireless network digital twin for 6G: Generative AI as a key enabler," IEEE Wireless Communications, vol. 31, no. 4, pp. 24–31, August 2024.
[8] Q. Guo, F. Tang, T. K. Rodrigues, and N. Kato, "Five disruptive technologies in 6G to support digital twin networks," IEEE Wireless Communications, vol. 31, no. 1, pp. 149–155, February 2024.
[9] L. Bariah and M. Debbah, "The interplay of AI and digital twin: Bridging the gap between data-driven and model-driven approaches," IEEE Wireless Communications, vol. 31, no. 3, pp. 219–225, June 2024.
[10] M. Li, Y. Han, H. Xu, Y. Zhu, C.-K. Wen, and S. Jin, "XL-ChannelDiff: An Efficient Diffusion-Based Multi-Domain Near-Field Channel Extrapolation Framework for XL-MIMO Systems," arXiv preprint arXiv:2606.16628, 2026.
[11] G. A. Baduge, M. Vaezi, J. K. Dassanayake, M. Z. Hameed, E. Ollila, and S. A. Vorobyov, "Frequency Range 3 for ISAC in 6G: Potentials and Challenges," IEEE Communications Magazine, pp. 1–7, 2026.
[12] J. Zhang, H. Miao, P. Tang, L. Tian, and G. Liu, "New mid-band for 6G: Several considerations from the channel propagation characteristics perspective," IEEE Communications Magazine, vol. 63, no. 1, pp. 175–180, 2024.
[13] Y. Huang, J. Yang, C.-K. Wen, and S. Jin, "Physics-Informed Implicit Neural Representation for Wireless Imaging in RIS-Aided ISAC System," IEEE Transactions on Wireless Communications, vol. 25, pp. 12 341–12 357, 2026.
[14] A. Bazzi, M. Ying, O. Kanhere, T. S. Rappaport, and M. Chafii, "ISAC Imaging by Channel State Information Using Ray Tracing for Next Generation 6G," IEEE Journal of Selected Topics in Electromagnetics, Antennas and Propagation, vol. 1, no. 1, pp. 135–149, 2025.
[15] Y. Huang, J. Yang, C.-K. Wen, and S. Jin, "RIS-Aided Single-Frequency 3D Imaging by Exploiting Multi-View Image Correlations," IEEE Transactions on Communications, vol. 72, no. 8, pp. 5003–5018, 2024.
[16] Z. Wei, H. Liu, X. Yang, W. Jiang, H. Wu, X. Li, and Z. Feng, "Carrier Aggregation Enabled Integrated Sensing and Communication Signal Design and Processing," IEEE Transactions on Vehicular Technology, vol. 73, no. 3, pp. 3580–3596, 2024.
[17] K. Zhang, W. Yu, H. He, S. Song, J. Zhang, and K. B. Letaief, "Multimodal Mixture-of-Experts for ISAC in Low-Altitude Wireless Networks," IEEE Journal of Selected Topics in Signal Processing, pp. 1–17, 2026.
[18] W. Fan, N. Wei, R. Xi, A. Bazzi, Y. Xiu, C. Assi, J. Dong, and J. Jin, "Heterogeneous mixture-of-experts for energy-efficient multimodal ISAC in highly mobile networks," arXiv preprint arXiv:2604.06697, 2026.
[19] W. Njima, A. Bazzi, and M. Chafii, "DNN-Based Indoor Localization Under Limited Dataset Using GANs and Semi-Supervised Learning," IEEE Access, vol. 10, pp. 69 896–69 909, 2022.
[20] H. X. Nguyen, K. Sun, D. To, Q.-T. Vien, and T. A. Le, "Digital Twin for O-RAN Toward 6G," IEEE Communications Magazine, vol. 63, no. 3, pp. 174–181, 2025.
[21] Y. Zhang, Y. Bai, R. Jantti, Z. Han, and C. Masouros, "AmbSentry: Mitigating Sensing Eavesdropping in ISAC Systems by Harnessing Ambient IoT Devices," arXiv preprint arXiv:2608.11799, 2026.
[22] H. Lei, J. Geng, K.-H. Park, J. Ye, L. Yang, X. Miao, and G. Pan, "Resource Allocation for Secure Dual-UAV-Assisted ISAC System," 2026. [Online]. Available: https://arxiv.org/abs/2608.24398
[23] J. Zheng, T. H. Luan, Y. Zhang, G. Li, Z. Su, and W. Wu, "Digital twin in 6G: Embracing comprehensive network intelligence," IEEE Wireless Communications, vol. 31, no. 6, pp. 94–101, December 2024.
[24] P. Jia, X. Wang, and X. Shen, "Hierarchical digital twin for efficient 6G network orchestration via adaptive attribute selection and scalable network modeling," IEEE Transactions on Communications, vol. 73, no. 9, pp. 7724–7739, Sep. 2025.
[25] Q. Guo, F. Tang, and N. Kato, "Resource allocation for aerial assisted digital twin edge mobile network," IEEE Journal on Selected Areas in Communications, vol. 41, no. 10, pp. 3070–3079, Oct 2023.
[26] L. Zhao, Z. Zhao, E. Zhang, A. Hawbani, A. Y. Al-Dubai, Z. Tan, and A. Hussain, "A digital twin-assisted intelligent partial offloading approach for vehicular edge computing," IEEE Journal on Selected Areas in Communications, vol. 41, no. 11, pp. 3386–3400, Nov 2023.
[27] J. Zheng, T. H. Luan, Y. Zhang, R. Li, Y. Hui, L. Gao, and M. Dong, "Data synchronization in vehicular digital twin network: A game theoretic approach," IEEE Transactions on Wireless Communications, vol. 22, no. 11, pp. 7635–7647, Nov 2023.
[28] L. U. Khan, E. Mustafa, J. Shuja, F. Rehman, K. Bilal, Z. Han, and C. S. Hong, "Federated learning for digital twin-based vehicular networks: Architecture and challenges," IEEE Wireless Communications, vol. 31, no. 2, pp. 156–162, April 2024.
[29] Q. Li, Q. Ye, N. Zhang, W. Zhang, and F. Hu, "Digital-twin-enabled industrial IoT: Vision, framework, and future directions," IEEE Wireless Communications, vol. 32, no. 6, pp. 173–181, Dec 2025.
[30] K. Qu and W. Zhuang, "Digital twin assisted intelligent network management for vehicular applications," IEEE Wireless Communications, vol. 31, no. 4, pp. 208–214, August 2024.
[31] V.-P. Bui, P. M. de Sant Ana, S. Gherekhloo, S. R. Pandey, and P. Popovski, "Digital Twin for Autonomous Guided Vehicles Based on Integrated Sensing and Communications," IEEE Transactions on Vehicular Technology, vol. 74, no. 5, pp. 8413–8418, 2025.
[32] P. Mollahosseini, R. Shen, T. A. Khan, and Y. Ghasempour, "Integrated sensing and communication: Research advances and industry outlook," IEEE Journal of Selected Topics in Electromagnetics, Antennas and Propagation, 2025.
[33] H. Zhang, Z. Zhang, X. Liu, W. Li, H. Li, and C. Sun, "Integrated sensing and communication for 6G holographic digital twins," IEEE Wireless Communications, vol. 32, no. 2, pp. 104–112, 2025.
[34] Y. Cui, T. Lv, W. Ni, and A. Jamalipour, "Digital twin-aided learning for managing reconfigurable intelligent surface-assisted, uplink, user-centric cell-free systems," IEEE Journal on Selected Areas in Communications, vol. 41, no. 10, pp. 3175–3190, Oct 2023.
[35] S. Kurma, M. Katwe, K. Singh, C. Pan, S. Mumtaz, and C.-P. Li, "RIS-empowered MEC for URLLC systems with digital-twin-driven architecture," IEEE Transactions on Communications, vol. 72, no. 4, pp. 1983–1997, April 2024.
[36] M. Wu, Y. Xiao, Y. Gao, and M. Xiao, "Digital twin for UAV-RIS assisted vehicular communication systems," IEEE Transactions on Wireless Communications, vol. 23, no. 7, pp. 7638–7651, July 2024.
[37] H. Zhang, Z. Zhang, X. Liu, W. Li, H. Li, and C. Sun, "Integrated sensing and communication for 6G holographic digital twins," IEEE Wireless Communications, vol. 32, no. 2, pp. 104–112, April 2025.
[38] Z. Tao, W. Xu, and X. You, "Provable performance bounds for digital twin-driven reinforcement learning in wireless networks: A novel digital-twin bisimulation metric," IEEE Transactions on Signal Processing, vol. 73, pp. 4430–4445, 2025.
[39] H. Zhang, X. Ma, X. Liu, L. Li, and K. Sun, "GNN-based power allocation and user association in digital twin network for the terahertz band," IEEE Journal on Selected Areas in Communications, vol. 41, no. 10, pp. 3111–3121, Oct 2023.
[40] D. He, K. Guan, D. Yan, H. Yi, Z. Zhang, X. Wang, Z. Zhong, and N. Zorba, "Physics and AI-based digital twin of multi-spectrum propagation characteristics for communication and sensing in 6G and beyond," IEEE Journal on Selected Areas in Communications, vol. 41, no. 11, pp. 3461–3473, Nov 2023.
[41] M. Haider, I. Ahmed, Z. Hassan, T. J. O'Shea, L. Liu, and D. B. Rawat, "Digital twin enabled site specific channel precoding: Over the air CIR inference," IEEE Communications Letters, vol. 29, no. 7, pp. 1559–1563, July 2025.
[42] H. Luo, S. Jiang, S. R. Khosravirad, and A. Alkhateeb, "Digital twin aided massive MIMO CSI feedback: Exploring the impact of twinning fidelity," IEEE Transactions on Communications, vol. 73, no. 12, pp. 15 909–15 925, Dec 2025.
[43] X. Gong, X. Liu, A.-A. Lu, X. Gao, X.-G. Xia, C.-X. Wang, and X. You, "Digital twin of channel: Diffusion model for sensing-assisted statistical channel state information generation," IEEE Transactions on Wireless Communications, vol. 24, no. 5, pp. 3805–3821, May 2025.
[44] G. Liang, J. Hu, K. Yang, S. Song, T. Liu, N. Xie, and Y. Yu, "Data augmentation for predictive digital twin channel: Learning multi-domain correlations by convolutional TimeGAN," IEEE Journal of Selected Topics in Signal Processing, vol. 18, no. 1, pp. 18–33, Jan 2024.
[45] A. Bazzi and M. Chafii, "Towards ISAC RIS-Enabled Passive Radar Target Localization," in ICC 2025 - IEEE International Conference on Communications, 2025, pp. 2290–2295.
[46] ——, "Low Dynamic Range for RIS-Aided Bistatic Integrated Sensing and Communication," IEEE Journal on Selected Areas in Communications, vol. 43, no. 3, pp. 912–927, 2025.
[47] Q. Han, H. Zhang, Y. Li, D. Yuan, and X. Ma, "Physics informed digital twin for RIS-assisted wireless communication system," IEEE Wireless Communications, vol. 32, no. 3, pp. 106–112, June 2025.
[48] Y. Fang, S. Xu, C. Fang, S. He, C. Li, Y. Huang, and L. Yang, "High-fidelity digital twin channel modeling for RIS-assisted wireless communication systems," IEEE Transactions on Communications, vol. 74, pp. 6904–6921, 2026.
[49] R. Pegurri, D. Gasco, F. Linsalata, M. Rapelli, E. Moro, F. Raviglione, and C. Casetti, "Van3twin: The multi-technology V2X digital twin with ray tracing in the loop," IEEE Transactions on Wireless Communications, vol. 25, pp. 16 812–16 827, 2026.
[50] A. Bazzi, F. Gast, F. Liu, S. Jin, G. Fettweis, and M. Chafii, "From Coverage to Sensing: ISAC Meets FR3," IEEE Communications Magazine, pp. 1–7, 2026.
[51] T.-H. Huang, C.-K. Wen, S.-H. Tsai, and T. Q. Duong, "AI-based CSI feedback with digital twins: Real-world validation and insights," IEEE Wireless Communications Letters, vol. 14, no. 8, pp. 2396–2400, Aug 2025.
[52] N. Khan, A. Abdallah, A. Celik, A. M. Eltawil, and S. Coleri, "Digital twin-assisted explainable AI for robust beam prediction in mmWave MIMO systems," IEEE Transactions on Wireless Communications, vol. 25, pp. 2435–2451, 2026.
[53] J. Zhang, S. Xu, C. Li, Y. Huang, and L. Yang, "Efficient beam selection for ISAC in cell-free massive MIMO via digital twin-assisted deep reinforcement learning," IEEE Transactions on Wireless Communications, vol. 25, pp. 9875–9890, 2026.
[54] S. Jiang and A. Alkhateeb, "Digital Twin Assisted Beamforming Design for Integrated Sensing and Communication Systems," in 2024 58th Asilomar Conference on Signals, Systems, and Computers, 2024, pp. 401–406.
[55] ——, "Digital twin based beam prediction: Can we train in the digital world and deploy in reality?" in 2023 IEEE International Conference on Communications Workshops (ICC Workshops). IEEE, 2023, pp. 36–41.
[56] M. Arnold, B. Major, F. V. Massoli, J. B. Soriaga, and A. Behboodi, "Vision-assisted digital twin creation for mmWave beam management," in ICC 2024-IEEE International Conference on Communications. IEEE, 2024, pp. 1–6.
[57] B. Hassibi and B. M. Hochwald, "How much training is needed in multiple-antenna wireless links?" IEEE Transactions on Information Theory, vol. 49, no. 4, pp. 951–963, 2003.
[58] S. J. Orfanidis, Electromagnetic Waves and Antennas. Rutgers University, 2016.
[59] J. Hoydis, F. A. Aoudia, S. Cammerer, F. Euchner, M. Nimier-David, S. T. Brink, and A. Keller, "Learning Radio Environments by Differentiable Ray Tracing," IEEE Transactions on Machine Learning in Communications and Networking, vol. 2, pp. 1527–1539, 2024.
[60] S. M. Kay, Fundamentals of Statistical Processing, Volume 2: Detection Theory. Pearson Education India, 2009.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.01220v1（eess.SP，2026 年 9 月 1 日）全文 13 页：摘要、第 I—VI 节、图 1—9 图注、命题 1—3、引理 1—2、定理 1、推论 1—3、式（1）—（44）、参考文献 [1]—[60]（英文原条目）。原文为 IEEE Transactions on Wireless Communications 投稿格式，全文无编号表格（仅图 1—9），故本页无表格可转录；图 3 的流程示意与图 4—9 的曲线内容按图注与正文文字转录。精度相关处理：用 `render.py` 渲染 PDF 第 1、7、8、9 页并按图核对作者/标题、引理 1—推论 3（式（21）—（31））与引理 2、定理 1（式（32）—（44））的公式形态（含 $C^b$ 的分母结构）。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.01220v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
