---
layout: page
title: "射频损伤 IBFD MIMO 系统的回声状态网络信号恢复｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-23945-echo-state-network-esn-for-signal-recovery-in-rf-impaired-ibfd-mimo-sy/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/7defd44fabc63f0c/) · [原文 arXiv](https://arxiv.org/abs/2609.23945) · [全部目录](/papers/catalog/)

# 射频损伤 IBFD MIMO 系统的回声状态网络信号恢复

**原题：** Echo State Network (ESN) for Signal Recovery in RF-Impaired IBFD MIMO Systems  
**作者：** Conrad Prisby（*）、Siyao Li（*）、Chengtao Xu（†）、Thomas Yang（*）  
**单位：** * 美国安柏瑞德航空大学（Embry-Riddle Aeronautical University）电气工程与计算机科学系（佛罗里达州代托纳比奇）；† 美国约翰霍普金斯大学应用物理实验室（Laurel，马里兰州）。邮箱：{prisbyc@my.erau.edu, lis14@erau.edu, chengtao.xu@jhuapl.edu, yang482@erau.edu}。  
**资助：** 部分受美国交通部（DOT）一级大学交通中心 CYBER-CARE 项目与安柏瑞德航空大学 FIRST 计划支持。  
**版本：** arXiv:2609.23945v1（cs.AI），2026-09-20，原文 6 页（含表 I 与图 1—5）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、式（1）—（4）、表 I（逐格）、图 1—5 图注、参考文献 [1]—[20] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "2026-09-26"；本地 PDF 为 **arXiv:2609.23945v1 [cs.AI]，2026-09-20**，"2026-09-26" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

同频全双工（in-band full-duplex，IBFD）多输入多输出（MIMO）系统可在同一频段上同时收发，从而提升下一代无线网络的谱效。然而 IBFD-MIMO 系统易受**自干扰（SI）**影响，SI 可能压过**有用信号（SOI）**。此情形下可采用盲源分离（BSS）算法去除 SI 并实现通感一体化（JSAC），但 BSS 算法大多假设理想化的线性、准平稳信号模型——在 I/Q 不平衡、载波频偏（CFO）、相位噪声与功放非线性等实际射频（RF）损伤下并不成立。本文提出一种**两级回声状态网络（ESN）**方案，在这些实际条件下优于 BSS。一个**冻结 ESN** 离线训练以刻画静态 SI 路径，另一个**自适应 ESN** 通过递归最小二乘在线更新，利用稀疏导频符号跟踪时变 SOI 路径。我们在不同块长下评估所提方案的 SOI 恢复性能与捕获速度，并与长短期记忆（LSTM）、门控循环单元（GRU）等其他循环神经网络（RNN）比较。仿真结果表明，所提方法在效率与 SOI 恢复两方面均优于 BSS、LSTM 与 GRU，证明 ESN 在真实 IBFD MIMO 系统中用于实时非线性自干扰消除的可行性。

**索引词**：回声状态网络；MIMO；自干扰消除；射频损伤；递归最小二乘。

## I. 引言

移动数据流量的增长与向毫米波（mmWave）频段的扩展，提升了对下一代无线网络更高谱效方案的需求 [1]，其中获取与跟踪方向性信道的开销成为可达速率的基本限制 [2], [3]。为应对频谱稀缺，同频全双工（IBFD）多输入多输出（MIMO）系统因可在同一频段同时收发而受到关注 [4], [5]。然而 IBFD 系统受**自干扰（SI）**困扰：节点自身发射泄漏进其接收链路，并可能压过**有用信号（SOI）**。

SI 挑战可通过盲源分离（BSS）算法应对，该类算法能联合恢复 SOI 并估计反射 SI 信道。我们先前的工作在 IBFD MIMO 系统中使用快速独立成分分析（Fast-ICA）实现 BSS 以完成通感一体化（JSAC），并利用 SI 信号知识进行自干扰消除（SIC）[6], [7]。那些研究揭示了时变信道下的块长折中：块越大，SOI 恢复越差。该折中与块记忆加反馈信道中的折中相似——后者在二值 [8] 与高斯 [3] "波束指向" 模型中已从信息论角度刻画了信道状态获取与数据传输的最佳划分。但这些结果假设线性混合与实值符号，且不含发射机或接收机 RF 损伤：I/Q 不平衡引入共轭耦合，振荡器偏差使星座旋转，功放（PA）非线性扭曲符号幅度与相位 [9]；PA 记忆与多径进一步引入时间依赖性 [10], [11]。这些效应促使接收机模型超越 Fast-ICA 所假设的瞬时线性混合。

**回声状态网络（ESN）**是一种合适的自适应方法：它是一类输入权重与循环权重固定、仅训练读出层的循环神经网络（RNN）[12]。储备池计算（RC）在计算上比 LSTM 与 GRU 等常规 RNN 高效得多 [13], [14]。Mosleh 等 [15] 研究了非线性失真下基于 RC 的 MIMO-OFDM 检测；Li 等 [16] 的后续工作发展了带交替 RLS 更新、判决反馈与非线性补偿的在线多模 RC 检测。这些方法确立了"在线储备池检测 + RLS 自适应"作为本文接收机的构建模块。在 SI 抑制方面，Liu 等 [17] 发展了基于 RC 的数字 SIC，并把消除性能与复杂度同多项式及神经网络消除器比较。记忆多项式消除器可建模带记忆的非线性失真，但需预先选定非线性阶数与记忆深度，模型项数随二者增长；相反，ESN 通过激活函数产生非线性特征、通过循环状态捕获时间依赖，且只需训练输出层。该结构支持高效的离线校准，或通过岭回归、RLS 等线性方法实现在线自适应。

本文提出一种两级 ESN 方案，其架构贡献在于**把已校准的 SI 映射与导频自适应的 SOI 映射分离**。由于 SI 发射机与接收机位于同一节点（见图 1）并共享本地振荡器，SI 路径不受 CFO 或相位噪声累积影响；而 SOI 路径来自物理上分离的发射机。SI 路径的信道进一步假设为静态（收发射机天线几何固定），PA 非线性建模为无记忆。该固定的损伤映射在初始校准阶段用冻结 ESN（ESN1）离线刻画。SOI 路径则呈现带记忆的 PA 非线性并经历时变信道传播，需要自适应 ESN（ESN2）利用分散在发射 SOI 信号中的已知导频符号、经递归最小二乘（RLS）在线更新。我们评估完整流水线相对先前 Fast-ICA 接收机的性能，并把"ESN1 + ESN2"与"同一 ESN1 + 常规无储备池 RLS 检测器 / LSTM / GRU"比较。使用已知本地发射参考的非线性 SIC 方法仍是比 Fast-ICA 更强的消除基准 [10], [17]，其与本文评估的关系在第 V-C 节讨论。虽然适用于 JSAC，本文评估通信侧信号恢复；显式感知留待未来工作。

**图 1**：2×2 MIMO IBFD 系统模型，展示节点 1 处的自干扰（SI）泄漏信号与接收到的有用信号（SOI）。

## II. 射频损伤与信号失真

图 2 展示了所建模 RF 损伤相对理想接收信号 $R(k)=H(k)S(k)+N(k)$ 的单独与联合效应，其中 $H(k)$、$S(k)$ 与 $N(k)$ 分别表示信道、发射信号与 AWGN。

$$
R(k)=H(k)S(k)+N(k),\tag{1}
$$

### A. I/Q 不平衡

I/Q 不平衡源于发射机与接收机硬件同相、正交支路之间的幅度与相位失配 [18]。由于每级都有自己的混频器、ADC/DAC 与滤波器，其非理想性使发射信号与自身共轭耦合、产生**广泛线性（widely-linear）变换**，故该失配在发射与接收两侧独立出现。如图 2(b) 所示，该耦合使星座出现歪斜与椭圆畸变，进一步偏离初始对称图样。

### B. CFO 与相位噪声

CFO 与相位噪声源于晶体振荡器的非理想性 [9]。理想情况下收、发振荡器以相同频率工作且相位完全稳定，以支撑无线通信所需的精确定时与频率生成。然而制造缺陷、晶体老化与材料质量带来频率失配（表现为收发之间的净 CFO），以及在各振荡器中独立累积的相位不稳定（相位噪声）。如图 2(c) 所示，这使星座因 CFO 随时间旋转，并因两振荡器联合相位噪声而随机抖动。

### C. 功放非线性

除上述线性变换类损伤外，还存在非线性损伤。**功放（PA）非线性**由发射机 PA 引起：理想放大器提供恒定增益，而实际中 PA 增益随输入幅度增大而压缩并引入相移 [19]。这些效应被刻画为幅度/幅度（AM/AM）与幅度/相位（AM/PM）失真——输出幅度与相位是瞬时输入幅度的非线性函数。如图 2(d) 所示，该非线性压缩与相移对外层符号的扭曲比内层更严重。这种失真还可呈现记忆性：特定时刻的输出取决于先前样本 [11]。

### D. 联合损伤信号

式（2）汇总上述损伤对接收信号的联合效应。项 $a_1$ 表示线性 PA 增益，$\mathbf H_1$ 与 $\mathbf H_2$ 为把物理信道与 I/Q 不平衡所致共轭耦合结合的广泛线性系数矩阵，$(\cdot)^*$ 表示复共轭。向量 $\mathbf d(k)$ 捕获由 PA 非线性引入的高阶非线性失真（对应 $a_3$ 与 $a_5$ 项）；乘性项 $e^{j\psi(k)}$ 施加 CFO 与相位噪声的联合相位旋转，其中 $\Delta f$ 为载波频偏、$T_s$ 为符号周期、$\phi(k)$ 为累积振荡器相位噪声。这些 RF 损伤的联合效应可由图 2(e) 观察。

$$
R(k)=e^{j\psi(k)}\left[a_1\mathbf H_1S(k)+a_1^*\mathbf H_2S^*(k)+\mathbf H_1\mathbf d(k)+\mathbf H_2\mathbf d^*(k)\right]+N(k),\tag{2}
$$

其中 $\psi(k)=2\pi\Delta fkT_s+\phi(k)$。

**图 2**：16-QAM 星座上的 RF 损伤，分别与联合展示（(a) 理想信号、(b) I/Q 不平衡、(c) CFO 与相位噪声、(d) PA 非线性、(e) 联合损伤）。

## III. 回声状态网络流水线

ESN 是一类由三层组成的 RNN：输入层、储备池与可训练的读出层。储备池含固定数量、随机互连的神经元，其权重初始化一次后不再更新 [12]。输入信号在每个时间索引通过储备池时，各神经元状态依据当前输入与先前储备池状态非线性更新，使储备池得以保留短期记忆，从而捕获 RF 损伤引起的时变、依赖记忆的信号动态。该高维储备池状态经读出层映射为期望输出，读出层是唯一被训练的部分；由于读出层是储备池状态的线性组合，可用闭式解训练，而不必像其他 RNN 那样用迭代梯度解。BSS 此前被用于 IBFD MIMO 系统中的 SI 抑制与 JSAC，但其线性、基于块的表述限制了实际 RF 损伤下的性能。为此我们采用 ESN 架构恢复 SOI。如图 3 所示的两级流水线使用两个 ESN：一个估计带损伤的 SI 信号用于 SIC，另一个从所得残差 $r[n]$ 恢复 SOI。

### A. ESN1

ESN1 用于确定带损伤的 SI 信号 $\hat y_{\mathrm{SI}}[n]$ 以做 SIC。由于节点 1 知道自己发射的 SI 信号 $s_{\mathrm{SI}}[n]$，该已知信号在索引 $n$ 处作为输入，用于学习其经发射后所经历的 RF 损伤。如式（3）所示，储备池状态 $\mathbf x_1[n]$ 在每个索引处用固定的随机初始化输入权重矩阵 $\mathbf W_{\mathrm{in}}^{(1)}$ 与储备池权重矩阵 $\mathbf W^{(1)}$ 更新，泄漏率 $\alpha_1$ 控制先前储备池状态的保留比例。估计的带损伤 SI 信号 $\hat y_{\mathrm{SI}}$ 由读出层产生，读出层在初始校准阶段用岭回归算法离线训练。由于 SI 路径静态且无记忆（见第 I 节），ESN1 的参数在训练后保持冻结，从而存储一份固定的 RF 损伤刻画，可在两节点实时传输期间用于 SIC。

$$
\mathbf x_1[n]=(1-\alpha_1)\mathbf x_1[n-1]+\alpha_1\tanh\left(\mathbf W_{\mathrm{in}}^{(1)}s_{\mathrm{SI}}[n]+\mathbf W^{(1)}\mathbf x_1[n-1]\right).\tag{3}
$$

### B. ESN2

ESN2 从残差 $r[n]=R[n]-\hat y_{\mathrm{SI}}[n]$ 恢复 $\hat s_{\mathrm{SOI}}[n]$。与 ESN1 不同，发射的 SOI 信号对节点 1 不可知，因为它来自物理上分离的发射机节点 2。为恢复它，在发射 SOI 信号中分散插入少量已知导频符号，在稀疏间隔上提供真值目标。如式（4）所示，储备池状态 $\mathbf x_2[n]$ 在每个索引处用固定的随机初始化输入权重矩阵 $\mathbf W_{\mathrm{in}}^{(2)}$ 与储备池权重矩阵 $\mathbf W^{(2)}$ 更新，泄漏率 $\alpha_2$ 控制先前储备池状态的保留比例。由于 SOI 路径呈现带记忆的 PA 非线性并经历时变信道传播（见第 I 节），ESN1 所用的固定离线训练读出层不足以跟踪其变化统计。因此 ESN2 的读出层在每个导频索引处经递归最小二乘（RLS）在线更新，使其参数能仅利用实时传输中可得的稀疏导频符号持续适配演化的 SOI 信道。

$$
\mathbf x_2[n]=(1-\alpha_2)\mathbf x_2[n-1]+\alpha_2\tanh\left(\mathbf W_{\mathrm{in}}^{(2)}r[n]+\mathbf W^{(2)}\mathbf x_2[n-1]\right).\tag{4}
$$

**图 3**：用于 SI 消除与 SOI 恢复的两级 ESN 流水线。

## IV. 仿真

我们在第 II 节所述物理设置与 RF 损伤下仿真 IBFD MIMO 系统。我们针对先前工作中的 Fast-ICA 方法评估 SOI 恢复性能，在等效在线自适应条件下把所提 ESN2 与 LSTM、GRU 基线比较，并在多种块长下评估流水线的捕获速度。

### A. ESN1 与 ESN2 设置

我们通过仿真评估所提两级 ESN 流水线。SI 与 SOI 信号均以 16-QAM 符号等功率生成；节点 1 有 2 根发射与 2 根接收天线，节点 2 有 2 根发射天线，信噪比（SNR）设为 20 dB。在数字消除器输入端，SI 与 SOI 的功率比为 4.58 dB（在各自信道与 RF 损伤之后、加 AWGN 之前测得）。储备池规模、谱半径、输入缩放、泄漏率与正则化参数通过网格搜索算法对 ESN1 与 ESN2 分别超参调优。

如第 III 节所述，ESN1 使用 500 个、每块 500 符号的块离线训练，数据按 70/30 划分为训练集与测试集，储备池规模 200 个神经元、谱半径 0.95、输入缩放 0.5、泄漏率 $\alpha_1=0.5$、岭回归正则化参数 $10^{-6}$、冲洗期 50 个样本。ESN1 训练完成后，冻结参数用于估计带损伤 SI 信号 $\hat y_{\mathrm{SI}}[n]$，并从接收信号 $R[n]$ 中减去以得到用于 SIC 的残差 $r[n]$；该残差作为 ESN2 的输入。SOI 路径建模为可控线性时变三抽头 MIMO 信道，对角系数逐符号变化率 $\delta=10^{-4}$，并在一、两个符号时延处设固定延迟矩阵。SOI 信号受 CFO（设为 100 Hz）与相位噪声影响，并经历 3 个延迟抽头、指数衰减系数因子 0.8 的记忆多项式 PA 非线性。SI 与 SOI 路径的全部 RF 损伤与信道参数列于表 I。为跟踪这些自适应动态，ESN2 使用更小的储备池规模 40 个神经元、谱半径 0.9、输入缩放 0.1、泄漏率 $\alpha_2=0.9$；读出层经 RLS 在线更新，遗忘因子 0.998、初始正则化 1。导频符号占块总长的 15%，分散于发射 SOI 信号中用于在线自适应。

### B. BSS 与 ESN 流水线设置

为与先前工作比较，BSS 算法 Fast-ICA 在 IV-A 节所述相同 RF 损伤与表 I 参数下评估。为使 ESN 流水线在恢复 SOI 时达到最高性能，目标 BER 设为 $10^{-2}$；否则流水线会在更宽松的阈值处提前终止。两个模型均以 200 次蒙特卡洛试验取平均，块长从 50 到 500、步长 50。

### C. 对比模型与 ESN2

由于 ESN1 训练后保持冻结，我们与替代 RNN 以及额外的纯 RLS 基线的比较聚焦于 ESN2 所代表的自适应阶段。RLS 基线把同样经 RLS 更新的读出层直接作用于 $r[n]$ 而不含储备池，用以评估储备池在"非线性状态展开 + 衰落记忆"方面的联合贡献。LSTM 与 GRU 基线 [13], [14] 的规模与 ESN2 的可训练参数总数匹配，隐藏单元数分别为 19 与 22，以确保公平比较。LSTM 与 GRU 基线在每个导频符号处经梯度更新在线自适应，学习率 $10^{-2}$；三者使用相同输入输出，即把残差 $r[n]$ 映射为估计 SOI $\hat s_{\mathrm{SOI}}[n]$。

由于 LSTM 与 GRU 基线的梯度式在线更新收敛慢于 ESN2 的闭式 RLS 读出，目标 BER $10^{-2}$ 会使部分试验在最多 500 个处理块内无法收敛。为此比较中把目标 BER 设为 $10^{-1}$，确保所有模型在试验上限内达到一致判据，从而公平比较各方法效率。每个模型以 50 次独立蒙特卡洛试验取平均，块长从 50 到 500、步长 50。每次试验中，当目标 BER 连续三个新数据块保持时即认为接收机已捕获，最多 500 块。我们比较所得 SOI 恢复 SRER 与在所有测试块长上收敛所需的平均块数，以衡量性能与效率。

## V. 结果与讨论

### A. ESN 与 BSS（Fast-ICA）比较

如图 4 所示，ESN 流水线在所有测试块长下的 SOI 恢复 SRER（以 dB 计）均优于 Fast-ICA，最大差距约 11 dB，出现在块长 50 处——此时 Fast-ICA 的线性、基于块的估计最受限。随块长增大，ESN 性能退化小于 1 dB，因为每块经过的样本更多，使 CFO 与相位噪声在 ESN2 下一次导频更新前累积更久；而 Fast-ICA 对每次估计一次性考虑整块数据，故不受块间累积影响。

### B. ESN2 与 RLS/LSTM/GRU 比较

图 5a 比较 ESN2 与 RLS、LSTM、GRU 的 SOI 恢复 SRER。ESN2 在所有测试块长下取得最高 SRER，约 13 dB。如第 IV 节所述，图 4 与图 5a 的结果不同，是因为该比较放宽了目标 BER 以使所有模型收敛、便于准确比较。RLS、LSTM 与 GRU 的结果紧密聚集在 9.5—10.5 dB 之间。由于 RLS 与 ESN2 共享同一闭式读出却表现与梯度式 LSTM、GRU 相当（而非接近 ESN2），该结果把改进归因于储备池，包括其非线性状态展开与衰落记忆动态。

图 5b 比较 ESN2、RLS、LSTM 与 GRU 达到收敛所需的平均导频符号数。小块长时 ESN2 与 RLS 所需导频很少，远低于 LSTM 与 GRU。然而随块长增大，RLS 的导频需求上升并趋近 LSTM 与 GRU，而 ESN2 始终是导频效率最高的方法：块长 500 时约需 230 个导频符号，而 RLS、LSTM 与 GRU 约需 280—290 个。这表明 ESN2 的储备池不仅提升恢复精度，还能在更大块长下维持导频效率——这是 RLS 基线不具备的优势。

### C. 讨论与计算复杂度

Fast-ICA 是相对我们早期 BSS 接收机 [6], [7] 的连续性基线，而非最先进的非线性 SI 消除器：它估计线性混合，而基于参考的 SIC 利用已知本地发射序列。Anttila 等 [10] 用并行 Hammerstein 结构建模非线性 SI，考虑 PA 失真与记忆；Liu 等 [17] 则用 RC 学习 SI 映射，并以多项式与神经网络 SIC 为基准。后一工作评估消除深度与计算需求，而本文图件评估消除后的 SOI SRER 与导频捕获。这些指标与设置不支持与 [17] 做数值排序。

在自适应基线中，RLS 模型与 ESN2 共享闭式读出但不含储备池。RLS 在小块长下的低导频开销表明闭式更新本身即可驱动早期捕获速度；而其较低 SRER 与更大块长下上升的导频开销则表明储备池同时提升恢复精度与效率。LSTM 与 GRU 的 SRER 与 RLS 相当，但没有 RLS 的早期导频效率，因为其迭代梯度更新比闭式更新需要更多数据才能收敛，这既反映缺少储备池，也反映缺少闭式读出。综合而言，这些结果支持本文动机：把固定储备池与闭式自适应读出相结合，可在仿真 RF 损伤与时变信道动态下实现可靠、实时的 SOI 恢复。

我们以每个输入符号的乘法次数衡量计算复杂度。ESN1 因其 200 神经元储备池需 42,020 次乘法，但它离线训练且在运行中保持冻结。相反，在线自适应的 ESN2、RLS、LSTM 与 GRU 受实时约束：ESN2 每符号需 2,020 次乘法，而 LSTM 为 2,064 次、GRU 为 2,028 次。由于 ESN2 的读出层每个导频仅经一次闭式 RLS 更新，无需梯度计算，故达到目标 BER 所需导频少于梯度式 LSTM、GRU 基线，与图 5b 的导频效率结果一致。

## VI. 结论与未来工作

我们研究了 IBFD MIMO 接收机并提出两级 ESN 流水线：用冻结 ESN 离线刻画静态 SI 路径，用经 RLS 在线更新的自适应 ESN 跟踪时变 SOI 路径。现有结果表明，相对 Fast-ICA 的 SOI 恢复得到改善；在 ESN1 固定时，相对所测 RLS、LSTM 与 GRU 检测器的恢复与导频效率也得到改善。该检测器消融衡量了非线性状态展开与衰落记忆的联合贡献。未来工作将把所提 ESN 框架扩展到 JSAC 与物理层安全：采用为下行 JSAC 发展的捕获技术 [20]、把储备池状态作为 RF 指纹的硬件特征，以及利用学习到的 RF 损伤做欺骗检测。

## 图注与表注

**图 1**：2×2 MIMO IBFD 系统模型（节点 1 处的 SI 泄漏信号与接收 SOI）。
**图 2**：16-QAM 星座上的 RF 损伤：(a) 理想信号、(b) I/Q 不平衡、(c) CFO 与相位噪声、(d) PA 非线性、(e) 联合损伤。
**图 3**：用于 SI 消除与 SOI 恢复的两级 ESN 流水线。
**图 4**：ESN 与 BSS（Fast-ICA）的 SOI 恢复 SRER 比较。
**图 5**：ESN2 与 RLS/LSTM/GRU 比较：(a) SOI 恢复 SRER；(b) 收敛到目标 BER 所需导频数。

**表 I　RF 损伤与信道参数**（按原表逐格转录）

| 参数 | SI 路径 | SOI 路径 |
| --- | --- | --- |
| 相位噪声标准差 | 0.05° | 0.05° |
| 发射幅度不平衡 $\epsilon_{tx}$ | 0.02 | 0.02 |
| 发射相位不平衡 $\phi_{tx}$ | 2° | 2° |
| 接收幅度不平衡 $\epsilon_{rx}$ | 0.01 | 0.01 |
| 接收相位不平衡 $\phi_{rx}$ | 1° | 1° |
| CFO | 0 Hz | 100 Hz |
| 相位旋转（CFO/PN） | 禁用 | 启用 |
| PA 抽头数 $Q$ | 1（无记忆） | 3 |
| $a_1$（每抽头） | 1.0 | [1.0, 0.20, 0.08] |
| $a_3$（每抽头） | −0.18 − 0.03j | [−0.140, −0.112, −0.090] − j[0.015, 0.012, 0.010] |
| $a_5$（每抽头） | 0.15 + 0.06j | [0.080, 0.064, 0.051] + j[0.030, 0.024, 0.019] |

**表注**：表 I 已按原表逐格转录，并用 PyMuPDF 渲染原 PDF 第 4 页核对；原文无其他表格。

## 参考文献

> 以下按原文编号 [1]—[20] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的连字与断行伪影已按常规写法整理，书目内容未改动。

[1] R. W. Heath, N. Gonzalez-Prelcic, S. Rangan, W. Roh, and A. M. Sayeed, “An overview of signal processing techniques for millimeter wave MIMO systems,” IEEE Journal of Selected Topics in Signal Processing, vol. 10, no. 3, pp. 436–453, 2016.

[2] S. Li and G. Caire, “On the capacity of ‘beam-pointing’ channels with block memory and feedback: The binary case,” in 2022 56th Asilomar Conference on Signals, Systems, and Computers, 2022, pp. 1262–1268.

[3] S. Li, F. Pedraza, and G. Caire, “On the capacity of Gaussian ‘beam-pointing’ channels with block memory and feedback,” in 2024 IEEE International Symposium on Information Theory (ISIT), 2024, pp. 2371–2376.

[4] K. E. Kolodziej, In-Band Full-Duplex Wireless Systems Handbook. Artech House, 2021.

[5] H. Alves, T. Riihonen, and H. A. Suraweera, Full-duplex communications for future wireless networks. Springer, 2020.

[6] S. Li, C. Prisby, and T. Yang, “Blind source separation-enabled joint communication and sensing in IBFD MIMO systems,” in MILCOM 2025 - 2025 IEEE Military Communications Conference (MILCOM), Oct. 2025, pp. 1223–1228.

[7] ——, “Blind source separation for joint communication and sensing in time-varying IBFD MIMO systems,” Electronics, vol. 14, no. 16, p. 3200, Jan. 2025.

[8] S. Li and G. Caire, “On the capacity and state estimation error of binary ‘beam-pointing’ channels with block memory and feedback,” in 2023 IEEE International Symposium on Information Theory (ISIT), 2023, pp. 2571–2576.

[9] J. Wang and X. Liu, “A review of crystal oscillators imperfection: Linking frequency deviations to carrier frequency offset and phase noise,” Journal of Networking and Network Applications, vol. 4, no. 4, pp. 165–171, Dec. 2024.

[10] L. Anttila, D. Korpi, V. Syrjala, and M. Valkama, “Cancellation of power amplifier induced nonlinear self-interference in full-duplex transceivers,” in 2013 Asilomar Conference on Signals, Systems and Computers. Pacific Grove, CA: IEEE, Nov. 2013, pp. 1193–1198.

[11] L. Ding, G. Zhou, D. Morgan, Z. Ma, J. Kenney, and J. Kim, “A robust digital baseband predistorter constructed using memory polynomials,” IEEE Transactions on Communications, vol. 52, no. 1, pp. 159–165, Jan. 2004.

[12] C. Sun, M. Song, D. Cai, B. Zhang, S. Hong, and H. Li, “A systematic review of echo state networks from design to application,” IEEE Transactions on Artificial Intelligence, vol. 5, no. 1, pp. 23–37, 2024.

[13] S. Hochreiter and J. Schmidhuber, “Long short-term memory,” Neural Computation, vol. 9, no. 8, pp. 1735–1780, 1997.

[14] J. Chung, C. Gülçehre, K. Cho, and Y. Bengio, “Empirical evaluation of gated recurrent neural networks on sequence modeling,” in NIPS 2014 Workshop on Deep Learning and Representation Learning, Montreal, Canada, 2014.

[15] S. S. Mosleh, L. Liu, C. Sahin, Y. R. Zheng, and Y. Yi, “Brain-inspired wireless communications: Where reservoir computing meets MIMO-OFDM,” IEEE Transactions on Neural Networks and Learning Systems, vol. 29, no. 10, pp. 4694–4708, 2018.

[16] L. Li, J. Xu, L. Zheng, and L. Liu, “Real-time machine learning for multi-user massive MIMO: Symbol detection using multi-mode structNet,” IEEE Transactions on Wireless Communications, vol. 22, no. 12, pp. 9172–9186, 2023.

[17] Z. Liu, H. Luo, and T. Ratnarajah, “Reservoir computing-based digital self-interference cancellation for in-band full-duplex radios,” IEEE Transactions on Machine Learning in Communications and Networking, vol. 2, pp. 855–868, 2024.

[18] M. A. Khan and M. U. Siddiqui, “A comprehensive survey on feature extraction techniques using I/Q imbalance in RFFI,” Feb. 2025.

[19] P. Singerl and G. Kubin, “Constructing memory-polynomial models from frequency-dependent AM/AM and AM/PM measurements,” in 2007 50th Midwest Symposium on Circuits and Systems, 2007, pp. 321–324.

[20] Y. Song, F. Pedraza, S. Li, S. Li, H. Yu, and G. Caire, “Compressed sensing inspired user acquisition for downlink integrated sensing and communication transmissions,” in ICC 2024 - IEEE International Conference on Communications, 2024, pp. 5293–5298.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言；第 II 节 RF 损伤与信号失真（A I/Q 不平衡、B CFO 与相位噪声、C PA 非线性、D 联合损伤信号，式（1）—（2），图 1—2）；第 III 节 ESN 流水线（A ESN1，式（3）；B ESN2，式（4），图 3）；第 IV 节仿真（A ESN1/ESN2 设置；B BSS 与 ESN 流水线设置；C 对比模型与 ESN2）；第 V 节结果与讨论（A ESN 与 BSS 比较，图 4；B ESN2 与 RLS/LSTM/GRU 比较，图 5；C 讨论与计算复杂度）；第 VI 节结论与未来工作；图 1—5 图注与表注；表 I 逐格；参考文献 [1]—[20] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—5 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I 已按原表逐格转录并用 PyMuPDF 渲染原 PDF 第 4 页核对；④作者简介与版权声明不在正文范围，未收录；⑤原文式（2）在 PDF 中把 $a_1\mathbf H_1S(k)$ 等项写作含粗体矩阵形式，译文中 $a_1$ 为标量、$\mathbf H_1$、$\mathbf H_2$ 为矩阵，已按原式含义排布；⑥骨架版本日期 "2026-09-26" 与 PDF 实际 v1 2026-09-20 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
