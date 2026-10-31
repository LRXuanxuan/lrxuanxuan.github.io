---
layout: page
title: "轮次中的隐藏开销：联邦学习中 802.11 竞争时间成本预测｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-12903-hidden-in-rounds-predicting-the-time-cost-of-802-11-contention-in-fede/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/58bc2566350d5896/) · [原文 arXiv](https://arxiv.org/abs/2609.12903) · [全部目录](/papers/catalog/)

# 轮次中的隐藏开销：联邦学习中 802.11 竞争时间成本预测

**原题：** Hidden in Rounds: Predicting the Time Cost of 802.11 Contention in Federated Learning  
**作者：** Satwat Bashir、Tasos Dagiuklas（伦敦南岸大学计算机科学系）  
**单位：** Department of Computer Science, London South Bank University, London, UK（bashis11@lsbu.ac.uk；tdagiuklas@lsbu.ac.uk）。  
**版本：** arXiv:2609.12903v1（cs.LG），v1 日期 2026 年 9 月 11 日；原文 8 页。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.12903v1 [cs.LG] 11 Sep 2026"，与库内登记编号 2609.12903 一致；首页资助脚注（欧盟 Horizon Europe MSCA 项目 AeroNet，Grant Agreement No. 101236523）已译于"原文首页资助说明"段。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VI 节正文与编号小节、致谢、图 1–5 中文图注、表 I–IV 逐格转写、参考文献 26 条英文原条目（按原编号）。原文无附录。逐句逐式终校未做。

> **原文首页资助说明：** 本工作受欧盟委员会 Horizon Europe MSCA 计划（HORIZON-MSCA-2024-SE-01-01）资助，Grant Agreement No. 101236523（AeroNet 项目）。

## 摘要

在 IEEE 802.11 上进行的联邦学习让各客户端共享无线信道以发送模型更新。我们使用 ns-3 测量不同客户端密度与提供负载下的帧投递率与饱和吞吐量。一个独立的 FedAvg 训练器把帧投递率作为更新接纳概率的一阶代理，并使用一个公式估计通信时间。该方法并不仿真完整模型更新的投递过程，也不测量端到端训练时间。在覆盖两个数据集、两种数据划分、六种客户端密度、六种提供负载与五个随机种子的 720 次评估运行中，所有运行都在轮次预算内达到其预设目标准确率。达到目标所需轮数（rounds-to-target）随提供负载变化很小，而达到目标所需通信时间（communication time-to-target）在客户端密度范围内增长约两个数量级。一个以 Bianchi 模型为锚的估计器在留出配置上的平均绝对百分比误差（MAPE）为 2.3% 到 10.2%。该误差是相对于由同一轮次时长公式构造出的通信时间衡量的，而非相对于独立测量的完成时间。我们还比较了均匀参与与持续异构参与。本研究在五个随机种子上未检测到统计上可区分的排除类（excluded-class）精度差距，但置信区间较宽。结果仅适用于所评估的配置，不提供一般的收敛性或公平性保证。

**索引词：** 联邦学习；无线网络；IEEE 802.11；CSMA/CA 竞争；性能建模；达到目标的通信时间；参与偏差。

## I. 引言

联邦学习（federated learning，FL）使一组分布式客户端能够在数据保留在本地的同时协作训练共享模型，只与中央聚合器交换模型更新 [1]。由于避免传输原始数据，FL 被广泛用于在无线边缘产生的数据上学习，其中智能手机、传感器与嵌入式设备持有训练数据。在此类部署中，客户端通过共享无线介质访问聚合器，而该介质的特性（有限带宽、丢包与时延）直接决定训练如何推进。

无线信道对 FL 收敛的影响已被广泛研究。大量工作针对噪声、有损或资源受限信道下的 FL 推导收敛界与收敛时间优化 [2], [3], [4], [5]。这类文献中一个反复出现的建模选择是把信道表示为每客户端的丢包或包擦除过程，其概率由信噪比、块长度或码率等物理层参数决定 [3], [4]；或通过正交资源块约束限制每轮发送的客户端数量 [2], [6], [7]。在所有这些模型中，一个客户端经历的损失被视为与其他客户端相互独立；换言之，丢包在客户端之间实际上是独立同分布（i.i.d.）的。

这一抽象并未刻画基于竞争的信道如何响应客户端密度与提供负载。使用载波侦听多路访问/冲突避免（carrier-sense multiple access with collision avoidance，CSMA/CA）的 IEEE 802.11 网络通过载波侦听与随机退避在所有客户端之间共享单一信道。在这样的介质上，丢包与时延不是固定的每客户端属性；它们由对信道的竞争产生，因而随竞争客户端数量与提供负载增大而增大。MAC 过程会耦合信道接入，但本文使用的训练器并不保留联合丢包事件或丢包的时间相关性，而是通过实测帧投递率来概括信道。这一区别把 ns-3 的竞争过程与训练器使用的参与过程区分开来。

研究 MAC 层之上 FL 的工具已经存在。ns3-fl 把包级 ns-3 仿真与 FL 训练器耦合 [8]，较新的平台扩展了这种网络感知仿真方式 [9]。这些工具能够测量集成行为，而本文研究的是一个紧凑估计器能否描述密度与负载对通信时间的效应。第二个问题涉及参与偏差：连通性差的客户端被系统性低估代表，常被作为信道感知客户端选择的动机，但其与非 i.i.d. 数据的交互很少被量化为可测量的效应。

本文通过对 802.11 CSMA/CA 信道上的 FedAvg 进行受控的、基于仿真的性能研究来填补这些空白。我们采用解耦设计，由 ns-3 测量依赖客户端密度与提供负载的帧投递率，独立的 FedAvg 训练器把该比率作为更新接纳概率，并为每轮分配估计的通信时长。饱和吞吐量测量在使用之前与解析的 Bianchi 饱和吞吐量模型 [10] 作比较。所有评估配置都在轮次预算内达到其预设目标。该结果是针对所评估配置的观察，而非收敛保证。达到目标所需轮数随提供负载变化很小，而达到目标所需通信时间随密度与提供负载增长。随后，我们针对构造出的通信时间度量评估一个以 Bianchi 模型为锚的估计器。最后，我们比较均匀参与与持续异构参与，并报告成对类别精度差距。

本文贡献如下：

1. 我们在 ns-3 中测量六种客户端密度与六种提供负载下的帧投递率与饱和吞吐量，并分别说明哪些量是被测量的、哪些量是由训练器构造的。
2. 我们在 720 次 FedAvg 运行中比较 rounds-to-target 与 communication time-to-target。所有评估运行都达到预设目标，而 communication time-to-target 在客户端密度范围内增长约两个数量级。
3. 我们在 Fashion-MNIST 与 CIFAR-10 的留出配置上评估以 Bianchi 模型为锚的估计器。我们还比较均匀参与与持续异构参与，并报告最差类（worst-class）与排除类（excluded-class）精度差距的不确定性。

本文其余部分组织如下：第 II 节回顾无线信道上 FL 收敛性与网络耦合 FL 仿真的相关工作；第 III 节描述系统模型与解耦方法，包括竞争模型及其验证；第 IV 节给出通信时间分析与估计器；第 V 节分析持续异构参与下的参与偏差；第 VI 节总结局限与未来工作。

## II. 相关工作

### A. 无线信道上的 FL 收敛性

无线链路不完美时 FL 的收敛性已从两个主要方向研究。一条工作线推导闭式期望收敛速率，把包错误与资源分配关联到 FL 损失，然后优化用户选择、资源块分配与发射功率以最小化收敛时间 [2], [6], [7]。第二条工作线隔离信道损伤并证明 FedAvg 仍收敛：对噪声上行与下行信道 [3]、对擦除概率依赖块长度/码率/信噪比的包擦除信道 [4]、对具有异构每客户端损失的非对称有损信道 [5]，收敛性均已建立。一项相关研究利用衰落分布统计量分配固定传输速率，以在不完美信道状态信息下降低收敛时间 [11]。这些分析有两个与本文相关的共同特征。第一，信道被抽象为每客户端损失概率或正交资源块约束，且损失被视为跨客户端独立，而不是共享介质竞争的结果。第二，损失概率是物理层参数的函数，而不是客户端密度或提供负载的函数。因此，这类工作无法描述基于竞争的 MAC 如何随客户端密度与提供负载变化。

### B. 空中聚合

另一类范式直接在无线多址信道上聚合模型更新：客户端同时发送，信道对其模拟信号求和。已有工作分析有加性噪声的衰落信道上模拟聚合的收敛性 [12], [13]，以及比较数字与模拟传输的设备到设备网络 [14]，其中传输误差的影响随客户端数量增长而减小；近期分析进一步在资源受限网络上比较数字与模拟传输并刻画各自更优的条件 [15]。然而该范式假设模拟叠加、严格同步与功率控制，而不是商用 Wi-Fi 使用的分组化数字传输；它把信道建模为衰落多址信道，而不是带载波侦听与退避的基于竞争的 MAC。因此它针对的是与本文不同的部署场景。

### C. 网络耦合的 FL 仿真

规模较小但更近期的一类工作把 FL 与包级网络仿真耦合，以捕捉解析模型遗漏的效应。ns3-fl 把基于 PyTorch 的 FL 训练器与 ns-3 连接，并针对真实部署验证其精度、收敛时间与能耗 [8]。FederNet 提供网络与设备感知的 FL 基准测试仿真平台 [9]，而 FedDES 与 Falafels 应用离散事件仿真在大规模下估计 FL 运行时间与能耗 [16], [17]。这些工具提供了在网络效应下运行 FL 实验的基础设施。与本文最接近的解析处理是 Kukreja 与 Mahendran 的工作，他们使用更新–报酬过程（renewal-reward processes）与离散时间马尔可夫链对 WiFi CSMA/CA 信道上的 FL 建模，刻画了使参与顺序与时间随机化的载波侦听与随机退避 [18]。该工作对 FL 性能作解析刻画。本文则使用实测帧投递率与饱和吞吐量构造通信时间估计，并将该估计与 rounds-to-target 比较。另有一项研究把 FL 与 802.11 CSMA/CA 环境耦合，但用 FL 优化信道接入策略，而不是研究竞争如何影响 FL 收敛 [19]，其研究问题与我们不同。

### D. 信道感知选择与参与偏差

由于信道决定哪些客户端能够投递更新，大量文献按信道质量、信息年龄或掉队（straggler）风险选择客户端，报告了收敛时间降低与适度精度提升 [2]。这类文献中一个反复出现的动机是参与偏差：连通性持续较差的客户端在聚合中被低估代表，这与非 i.i.d. 数据交互，使全局模型产生偏斜 [20]。作为回应，已有工作提出按客户端损失率加权的聚合方案 [5]，以及针对异构客户端间公平参与的选择方法 [21]。与本文研究的参与结构最接近的是解析工作：异构且时间相关的客户端可用性会减慢收敛，并可能把 FedAvg 导向有偏模型，从而推动了可用性感知的聚合与选择 [22]。该分析是理论性的，核心是时间可用性依赖。本文研究的持续异构参与分支则使用在 ns-3 中实测的每客户端帧投递率，并在每轮独立采样每个客户端的参与。该方法表示了客户端之间的持续差异，但不表示时间依赖或同时排除事件。

### E. 定位

本文结合三个要素：跨客户端密度与提供负载的帧级 ns-3 测量、构造估计通信时间的公式，以及独立的 FedAvg 训练器。Bianchi 分析 [10] 为饱和吞吐量测量提供参照。训练器不回放包迹（packet traces），也不与 ns-3 集成。该设计支持 rounds-to-target 与 communication time-to-target 之间的受控比较，但不验证端到端 FL 完成时间。

## III. 系统模型与方法

### A. 概述与解耦设计

我们考虑单小区部署：$N$ 个客户端站点与一个聚合器通过一个接入点、经由共享的 IEEE 802.11 信道通信，构成单一冲突域。没有分层边缘层；把研究扩展到多小区留作未来工作。

网络与学习组件相互分离，运行时不共享状态。ns-3 组件直接记录发送与接收帧数，并据此计算客户端密度 $N$ 与提供负载 $L$ 下的帧投递率 $p_f(N,L)$。独立的饱和 ns-3 运行测量 $R_{\mathrm{sat}}(N)$。用 PyTorch 实现的 FedAvg 训练器把 $p_f$ 作为更新接纳概率，构造参与调度，并为每轮分配估计的通信时长。因此，帧计数、$p_f$ 与 $R_{\mathrm{sat}}$ 由 ns-3 获得，而更新接纳、轮次通信时长与 communication time-to-target 在 ns-3 之外构造。这种解耦有两个实际好处：网络模型不需要机器学习绑定，学习过程不需要实时仿真器；它还使信道描述成为显式的、可检查的输入，而不是单一整体仿真器的涌现属性。下面描述的参与模型是均匀的；第 V 节引入持续异构参与以分析参与偏差。竞争模型、训练器与复现实验所需配置见 https://github.com/satwatbashir/Contention-FL。

> **表 I（原文 Table I）：** 联邦学习配置。

| 组件 | 取值 |
|---|---|
| 模型 | LeNet 风格 CNN（卷积 6/16，$5\times5$；全连接 120/84） |
| 优化器 | SGD，学习率 0.01，动量 0.9 |
| 本地轮数 $E$ | 5 |
| 批大小 | 32 |
| 数据集 | Fashion-MNIST；CIFAR-10 |
| 数据划分 | i.i.d.；非 i.i.d. Dirichlet（$\alpha=0.5$；$\alpha=0.1$） |
| 轮数 | 100（Fashion-MNIST）；150（CIFAR-10） |

### B. 联邦学习设置

学习任务使用 LeNet 风格卷积网络 [23]：两个卷积层分别有 6 与 16 个通道、$5\times5$ 卷积核，每个卷积层后接 $2\times2$ 最大池化；两个全连接层分别有 120 与 84 个单元。所有客户端运行 FedAvg，每轮 $E=5$ 个本地轮次，批大小 32，使用学习率 0.01、动量 0.9 的随机梯度下降。我们评估两个数据集：Fashion-MNIST [24]（用于主要结果）与 CIFAR-10 [25]（用于二次验证）。每个数据集按两种方案划分到客户端：独立同分布（i.i.d.）划分，以及从浓度参数 $\alpha=0.5$ 的 Dirichlet 分布 [26] 抽取的非 i.i.d. 划分。更集中的 $\alpha=0.1$ 划分仅用于第 V 节的偏差分析。轮次预算对 Fashion-MNIST 为 100 轮、对 CIFAR-10 为 150 轮；后者是更难的任务，在固定配置下更慢达到目标。每个配置用五个随机种子重复。每客户端数据划分生成一次、设定种子，并被所有后续组件原样复用，使运行之间的差异仅反映信道。表 I 汇总了该配置。

### C. 竞争模型与验证

信道在 ns-3 中建模为一个接入点与 $N$ 个站点，使用带基本接入的 802.11g 分布式协调功能（DCF）。物理层速率用恒定速率管理器固定为 24 Mbit/s，使竞争而非速率自适应决定结果。每个站点发送恒定比特率 UDP 上行流，提供负载表示为有效信道容量（约 15 Mbit/s）的比例。我们扫描六种负载水平（从容量的 0.80 到 2.00）与六种客户端密度（10 到 100 个站点）。对每种组合，我们测量每站帧投递率，即接收帧与发送帧之比，以避免仿真器流级计数器在队列溢出时对丢包的已知低报。结果为帧投递曲面 $p_f(N,L)$；在 $N=50$ 时，帧投递率在六种负载水平下从 1.00 降至 0.39（表 II）。

> **表 II（原文 Table II）：** 提供负载水平与 $N=50$ 时的帧投递率。

| 水平 | 提供负载 | 帧投递率 |
|---|---|---|
| 轻载 | 0.80 | 1.00 |
| 中低载 | 0.90 | 0.89 |
| 中载 | 1.00 | 0.79 |
| 重载 | 1.10 | 0.72 |
| 严重 | 1.50 | 0.52 |
| 饱和 | 2.00 | 0.39 |

为在模型被使用之前确认其行为正确，我们把实测饱和吞吐量与解析 Bianchi 模型 [10] 预测的饱和吞吐量比较。二者平均误差在 8.6% 以内（所有密度上最多 12%），且都随 $N$ 单调下降（图 1）。验证使用饱和吞吐量——Bianchi 分析的核心结果——而不是直接的每帧冲突计数。实测量 $R_{\mathrm{sat}}(N)$ 只依赖 $N$，因为每次测量都在固定 MAC 与物理层配置下使用饱和流量。提供负载 $L$ 通过 $p_f(N,L)$ 进入后续估计器。这一分离是建模选择，不是对同步 FL 轮次完成情况的测量。

> **图 1（原文 Fig. 1）：** ns-3 竞争模型与 Bianchi 分析的对比。左：解析冲突概率 $p_c$ 随 $N$ 的变化。右：实测饱和吞吐量与非投递率随 $N$ 的变化。

### D. 耦合与通信时间估计

两个组件按轮次连接。在均匀参与下，每个客户端以当前密度与提供负载对应的概率 $p_f$ 独立被接纳。一轮的估计通信时长为

$$
T_{\mathrm{comm}}(N,p_f)=\frac{NS}{p_fR_{\mathrm{sat}}(N)}, \tag{1}
$$

其中 $S$ 是模型更新的比特大小（对该网络约 178 KB），$R_{\mathrm{sat}}(N)$ 是 $N$ 个站点下的实测饱和吞吐量。式 (1) 以 $R_{\mathrm{sat}}(N)$ 计费每一轮，并乘以因子 $1/p_f$。它是一阶通信时间估计，不表示最慢客户端的完成时间、重传截止时间、队列瞬态或 FL 轮回末尾的同步传输突发。

ns-3 组件发送恒定比特率 UDP 流量并测量帧级投递，它并不分组化同步的 178 KB FL 更新，也不检验该更新的所有帧是否在轮次截止前到达。因此训练器仅把 $p_f$ 用作更新接纳概率的代理。MAC 重传与队列行为影响 ns-3 帧测量，但该方法不对应用级重组、应用级超时或全有或全无的更新接受建模。所得通信时间不是端到端实测时间。

全局模型由 FedAvg 在已接纳客户端上更新，按本地数据集大小加权。未被接纳的客户端不贡献更新，也不复用陈旧更新。本地计算时间被排除。令 $p_f=1$ 会逐轮精确复现完美信道基线，在精度与损失上都如此。

### E. 实验设计与指标

完整扫描覆盖六种客户端密度、六种负载水平、两种数据划分与两个数据集，在五个随机种子上重复，共 720 次运行。每次运行训练至其轮次预算，记录两个量。**rounds-to-target** 指标是全局模型首次达到固定目标准确率并保持不低于该值的那一轮。**communication time-to-target** 指标由式 (1) 的 $T_{\mathrm{comm}}$ 累积到该轮得到。每个数据集与划分的目标准确率由完美信道基线导出，并设在基线达到且保持的水平之下，以便在预算内可达；对在固定配置下过拟合的 CIFAR-10，目标设为 0.48（i.i.d.）与 0.46（非 i.i.d.）。在预算内从未达到目标的运行被记为独立的未收敛结果。对第 V 节的偏差分析，我们额外记录**最差类准确率**，即全局模型最低的每类测试准确率。

## IV. 达到目标的通信时间中的竞争代价

### A. 所有评估运行在轮次预算内达到目标

在所有 720 次评估运行中，跨两个数据集与两种数据划分，每次运行都在轮次预算内达到其预设目标准确率，无一被记为未收敛结果。该观察仅适用于所评估的模型、数据集、目标准确率、客户端密度、提供负载与五个随机种子，不是一般收敛保证。在此范围内，提供负载对 communication time-to-target 的影响大于对 rounds-to-target 的影响。

一个运行点可说明其机制。在 Fashion-MNIST 的 i.i.d. 划分、$N=50$ 下，从完美信道变为饱和信道使准确率–轮次曲线几乎不变，而估计通信时间轴增大约 1.9 倍（图 2）。模型需要相同轮数，但式 (1) 为每轮分配更长的通信时长。该模式在扫描范围内成立，并沿两条竞争轴清晰分离。在固定密度下，增大提供负载几乎不改变 rounds-to-target，却增大 communication time-to-target。$N=50$ 时，负载从轻载升至饱和时 rounds-to-target 保持在 8.6，而每轮投递率从 1.00 降到 0.39；同一范围内 communication time-to-target 从 52 秒升至 133 秒，为 2.5 倍。跨客户端密度、在饱和负载下，rounds-to-target 从 $N=10$ 的 2.6 升至 $N=100$ 的 16.6，因为更低的每客户端投递率每轮接纳更少更新，而每轮由式 (1) 得到更大的值。communication time-to-target 在密度范围内从 6 秒升至 640 秒，接近两个数量级。图 3 展示了两种竞争变量下的 communication time-to-target 与 rounds-to-target。

> **原文疑点：** 正文称 $N=50$ 时负载从轻载到饱和过程中 rounds-to-target "保持在 8.6"，但图 3 对应数值实际在 8.4–8.8 之间小幅波动（8.6, 8.4, 8.4, 8.4, 8.8, 8.6）；此处按原文照录并加注。

同一模式在第二个数据集上成立。CIFAR-10（i.i.d.）在 $N=50$ 下，负载从轻载升至饱和时 rounds-to-target 保持接近 4.7，而 communication time-to-target 从 39 秒增至 104 秒。在饱和负载下，communication time-to-target 从 $N=10$ 的 6 秒升至 $N=100$ 的 463 秒。

> **图 2（原文 Fig. 2）：** Fashion-MNIST 在 i.i.d. 划分、$N=50$ 下的 FedAvg 测试准确率。左图为轮次坐标，右图为由式 (1) 估计的累积通信时间坐标。

> **图 3（原文 Fig. 3）：** Fashion-MNIST（i.i.d. 划分）在所评估竞争扫描中的 communication time-to-target 与 rounds-to-target。通信时间由式 (1) 构造。

对性能评估的直接含义是：按通信轮次进行的分析（收敛文献中的标准做法 [2], [3]）会报告：在固定密度下负载几乎无影响，密度只有适度影响。这两个陈述对 rounds-to-target 都是正确的，但它们没有描述式 (1) 所分配的估计通信时间代价。

### B. 估计 communication time-to-target

以 Bianchi 模型为锚的估计器分两个阶段。首先，普通最小二乘把 rounds-to-target 估计为

$$
\hat r=\beta_0+\beta_1N+\beta_2p_f+\beta_3Np_f. \tag{2}
$$

其次，估计器计算

$$
\hat t_{\mathrm{comm}}=\hat r\,T_{\mathrm{comm}}(N,p_f). \tag{3}
$$

系数按数据集与数据划分分别拟合。作为无信道参照，用二阶普通最小二乘回归把客户端密度索引 $x_N$ 与提供负载索引 $x_L$ 直接映射到 communication time-to-target：

$$
\hat t_{\mathrm{ref}}=\gamma_0+\gamma_1x_N+\gamma_2x_L+\gamma_3x_N^2+\gamma_4x_Nx_L+\gamma_5x_L^2. \tag{4}
$$

参照回归不接收 $p_f$ 或 $R_{\mathrm{sat}}$，因此它是无信道参照，而不是同等输入的基线。

评估使用三种留出协议。留一配置交叉验证从某数据集与数据划分中移除一种密度与提供负载组合，在其余配置上拟合，并预测被移除的配置。密度外推在 10 到 75 的密度上拟合、测试 $N=100$。提供负载外推在前五种负载水平上拟合、测试饱和水平。没有测试配置用于拟合。表 III 报告平均绝对百分比误差（MAPE）。以 Bianchi 模型为锚的估计器在所报告测试上的 MAPE 为 2.3% 到 10.2%。无信道参照在若干测试上误差更大，但两种方法使用不同的信道信息，不能提供估计器结构的受控比较。MAPE 还给较小的通信时间值更大权重。图 4 展示以 Bianchi 模型为锚的估计器的带符号百分比误差。

> **表 III（原文 Table III）：** communication time-to-target 的留出 MAPE（%）。Bianchi：以 Bianchi 模型为锚的估计器；Reference：无信道参照。

| 测试 | i.i.d. Bianchi | i.i.d. Reference | 非 i.i.d. Bianchi | 非 i.i.d. Reference |
|---|---|---|---|---|
| Fashion-MNIST 留一 | 2.3 | 152 | 4.0 | 150 |
| Fashion-MNIST 密度外推 | 2.6 | 8.6 | 3.1 | 7.9 |
| Fashion-MNIST 负载外推 | 4.1 | 45.8 | 7.0 | 54.6 |
| CIFAR-10 留一 | 4.7 | 109 | 5.0 | 87 |
| CIFAR-10 密度外推 | 5.6 | 7.3 | 6.9 | 9.8 |
| CIFAR-10 负载外推 | 4.7 | 40.6 | 10.2 | 31.2 |

> **图 4（原文 Fig. 4）：** 以 Bianchi 模型为锚的估计器相对于 communication time-to-target 的带符号留出预测误差。圆点为 Fashion-MNIST，三角为 CIFAR-10，阴影带标记 $\pm10\%$。

communication time-to-target 由 rounds-to-target 乘以 $T_{\mathrm{comm}}$ 构造。以 Bianchi 模型为锚的估计器使用同一个 $T_{\mathrm{comm}}$，因此其报告的误差衡量的是所构造计时模型内部的预测，并不针对独立测量的同步 FL 完成时间验证式 (1)。当应用于第 V 节的持续异构参与运行时，该估计器的 MAPE 为 2.1%，均匀分支为 2.0%。

## V. 持续异构参与下的参与偏差

目前的分析使用均匀参与：每个客户端以相同概率 $p_f$ 独立被接纳。客户端特定的帧投递率可能因站点位置与信道条件不同而不同。本节在保持平均更新接纳概率固定的前提下，比较均匀参与与持续异构参与。

### A. 持续异构参与模型

均匀分支以概率 $p_f$ 接纳每个客户端。异构分支为客户端 $i$ 分配由其 ns-3 帧投递率导出的持续更新接纳概率 $q_i$，然后在客户端之间与轮次之间独立地按 $\mathrm{Bernoulli}(q_i)$ 采样。因此，异构分支表示期望参与中的持续差异，不表示同时排除、时间依赖、包突发或队列动态。

用于获得 $q_i$ 的帧投递率在 ns-3 中测量。我们运行第 III 节的竞争场景，把站点在接入点周围半径 20 m 的圆盘内均匀随机放置，使距离相关的信噪比与帧错误使特定客户端持续更不可能参与。距离与帧投递率之间的 Pearson 相关系数在各单元格为 $-0.60$ 到 $-0.82$。对每个单元格，搜索提供速率使 ns-3 原始平均帧投递率达到目标 $p_f(N,L)$，然后用单一标量修正把均值精确设为目标值；所有 18 个单元格（三种客户端密度 × 六种提供负载水平）上匹配均值与目标之间的每单元格差为 0.000。由于两个分支共享相同的平均更新接纳概率与相同的 $T_{\mathrm{comm}}$，成对比较在固定这两个量的同时改变期望客户端参与的分布。训练器不回放 ns-3 包迹。

### B. 类别精度差距与不确定性

两个分支的总体测试准确率相近。我们用两个指标评估类别准确率。最差类准确率是十个每类测试准确率的最小值。排除类准确率是在最低 $q_i$ 客户端处最常见的类别的准确率。第二个指标直接检验与最不可能参与客户端相关的类别，并避免在训练后挑选最小值。

表 IV 报告在代表性高竞争单元格上、五个随机种子上成对的"异构减均匀"差距及其 95% 置信区间。在集中异构（$\alpha=0.1$）下，最差类差距在所报告单元格上从 $-0.9$ 到 $-10.2$ 个百分点变化，且每个区间都包含零。对这些单元格，排除类差距为 $-1.0$ 到 $-2.6$ 个百分点，且每个区间都包含零。在中等异构（$\alpha=0.5$）下，所报告的点估计接近零。这些结果在五个种子上未检测到统计上可区分的差距；它们也没有确立差距为零，因为若干置信区间较宽。最差类准确率是次序统计量，比排除类准确率变化更大。图 5 展示成对估计与置信区间。

> **表 IV（原文 Table IV）：** 异构减均匀准确率差距（百分点）。

| 单元格 | $\alpha$ | 总体（异构/均匀） | 最差类 $\Delta$ [95% CI] | 排除类 $\Delta$ [95% CI] |
|---|---|---|---|---|
| $N=50$，饱和 | 0.1 | 0.844/0.842 | $-0.9$ [$-11,+9$] | $-1.0$ [$-8,+6$] |
| $N=100$，饱和 | 0.1 | 0.848/0.859 | $-2.6$ [$-11,+6$] | $-2.6$ [$-20,+15$] |
| $N=100$，严重 | 0.1 | 0.856/0.861 | $-10.2$ [$-21,+0$] | $-2.4$ [$-11,+6$] |
| $N=50$，饱和 | 0.5 | 0.880/0.882 | $+0.2$ [$-9,+9$] | $+0.8$ [$-5,+7$] |
| $N=100$，饱和 | 0.5 | 0.874/0.878 | $+1.6$ [$-4,+8$] | $-0.2$ [$-1,+0$] |

> **图 5（原文 Fig. 5）：** 最差类与排除类准确率的成对"异构减均匀"准确率差距。

观察到的数据划分提供了一种可能解释。在十类上的 $\mathrm{Dirichlet}(\alpha=0.1)$ 划分下，每一类仍分布在许多客户端上（20 个中的 11 个、50 个中的 30 个、100 个中的 55 个），且最低 $q_i$ 客户端只持有其主导类的一小部分样本（$N=100$ 时为九个样本）。因此其他客户端仍保留同一类别的样本。更集中的类别归属可能产生不同结果，但本文未评估该条件。当前结果限于所评估的划分、客户端密度与五个随机种子。

## VI. 结论与未来工作

我们用解耦方法研究了 IEEE 802.11 CSMA/CA 竞争如何影响 FedAvg 的收敛。ns-3 组件测量帧投递率与饱和吞吐量；训练器把帧投递率作为更新接纳概率，并用式 (1) 构造通信时间。所有 720 次评估运行都在轮次预算内达到预设目标。rounds-to-target 随提供负载变化很小，而 communication time-to-target 随密度与提供负载增大。以 Bianchi 模型为锚的估计器针对该构造度量的留出 MAPE 为 2.3% 到 10.2%。该结果不是对同步 FL 完成时间的独立验证。

持续异构参与分析在五个随机种子上未检测到统计上可区分的最差类或排除类准确率差距。若干置信区间较宽，因此结果并未确立差距为零。该发现限于所评估的客户端密度与数据划分。

本研究覆盖单小区、单接入点的单一冲突域且无分层边缘层，因此发现尚不能扩展到多小区或中继拓扑。参与偏差分析限于 Fashion-MNIST，因为 CIFAR-10 在固定训练配置下过拟合。rounds-to-target 与 communication time-to-target 分析对两个数据集都使用按数据集与划分特定的目标准确率。物理层速率固定为 24 Mbit/s 且无速率自适应，因此所报告的通信时间不能预测生产部署时间。紧凑的 LeNet 风格模型固定了更新大小并减少本地计算带来的变化；更大的模型会改变通信需求，也可能改变所报告的值。训练器使用独立 Bernoulli 采样，不保留同时排除、时间依赖、队列动态或来自 ns-3 的包迹。帧投递率不是完整 178 KB 更新在轮次截止前到达的概率。式 (1) 也排除了最慢客户端完成时间、应用级超时、同步传输突发与本地计算。

直接的下步工作是在 ns-3 中把完整模型更新分组化，并在同步 FL 流量下测量其完成时间，这将允许对式 (1) 的独立验证。进一步工作可保留同时排除与时间依赖、考察更集中的类别归属，并把评估扩展到多小区、分层边缘层与更大模型。

## 致谢

本工作受欧盟委员会 Horizon Europe MSCA 计划（HORIZON-MSCA-2024-SE-01-01）资助，Grant Agreement No. 101236523（AeroNet 项目）。

## 参考文献（英文原书目）

- [1] B. McMahan, E. Moore, D. Ramage, S. Hampson, and B. Agüera y Arcas, "Communication-efficient learning of deep networks from decentralized data," in Proc. 20th Int. Conf. on Artificial Intelligence and Statistics (AISTATS), ser. Proc. Mach. Learn. Res., vol. 54, 2017, pp. 1273–1282.
- [2] M. Chen, H. V. Poor, W. Saad, and S. Cui, "Convergence time optimization for federated learning over wireless networks," IEEE Trans. Wireless Commun., vol. 20, no. 4, pp. 2457–2471, 2021.
- [3] X. Wei and C. Shen, "Federated learning over noisy channels: Convergence analysis and design examples," IEEE Trans. Cogn. Commun. Netw., vol. 8, no. 2, pp. 1253–1268, 2022.
- [4] A. Salari, S. J. Johnson, B. Vucetic, and M. Shirvanimoghaddam, "Rate-convergence tradeoff of federated learning over wireless channels," IEEE Internet Things J., vol. 10, no. 24, pp. 22703–22716, 2023.
- [5] A. Rodio, G. Neglia, F. Busacca, S. Mangione, S. Palazzo, F. Restuccia, and I. Tinnirello, "Federated learning with packet losses," in Int. Symp. on Wireless Personal Multimedia Communications (WPMC), 2023, pp. 1–6.
- [6] M. Chen, Z. Yang, W. Saad, C. Yin, H. V. Poor, and S. Cui, "Performance optimization of federated learning over wireless networks," in IEEE Global Communications Conf. (GLOBECOM), 2019, pp. 1–6.
- [7] S. Wan, J. Lu, P. Fan, Y. Shao, C. Peng, and K. B. Letaief, "Convergence analysis and system design for federated learning over wireless networks," IEEE J. Sel. Areas Commun., vol. 39, no. 12, pp. 3622–3639, 2021.
- [8] E. Ekaireb, X. Yu, K. Ergun, Q. Zhao, K. Lee, M. Huzaifa, and T. Rosing, "ns3-fl: Simulating federated learning with ns-3," in Proc. 2022 Workshop on ns-3 (WNS3). ACM, 2022, pp. 97–104.
- [9] A. Boiano, M. Avanzini, M. Brambilla, M. Nicoli, and A. E. C. Redondi, "FederNet: A network and device-aware emulation platform for federated learning benchmarking," Comput. Netw., vol. 277, 2026, art. no. 111995.
- [10] G. Bianchi, "Performance analysis of the IEEE 802.11 distributed coordination function," IEEE J. Sel. Areas Commun., vol. 18, no. 3, pp. 535–547, 2000.
- [11] F. Pase, M. Giordani, and M. Zorzi, "On the convergence time of federated learning over wireless networks under imperfect CSI," in IEEE Int. Conf. on Communications Workshops (ICC Workshops), 2021, pp. 1–7.
- [12] X. Fan, Y. Wang, Y. Huo, and Z. Tian, "Joint optimization of communications and federated learning over the air," IEEE Trans. Wireless Commun., vol. 21, no. 6, pp. 4434–4449, 2022.
- [13] Y. Mu, C. Shen, and Y. C. Eldar, "Optimizing federated averaging over fading channels," in IEEE Int. Symp. on Information Theory (ISIT), 2022, pp. 1277–1281.
- [14] H. Xing, O. Simeone, and S. Bi, "Federated learning over wireless device-to-device networks: Algorithms and convergence analysis," IEEE J. Sel. Areas Commun., vol. 39, no. 12, pp. 3723–3741, 2021.
- [15] J. Yao, W. Xu, Z. Yang, X. You, M. Bennis, and H. V. Poor, "Wireless federated learning over resource-constrained networks: Digital versus analog transmissions," IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 14020–14036, 2024.
- [16] Z. Chen, W. Chen, D. Zhang, K. Kim, G. Li, S. Di, and X. Lu, "FedDES: Discrete event based performance simulation for federated learning systems," in Proc. 10th ACM/IEEE Symp. on Edge Computing (SEC '25). ACM, 2025, pp. 1–16.
- [17] A. M. Huet de Barochez, S. Plassart, and S. Monnet, "Falafels: A tool for estimating federated learning energy consumption via discrete simulation," in Advanced Information Networking and Applications (AINA), ser. Lecture Notes on Data Engineering and Communications Technologies, vol. 247. Springer Cham, 2025, pp. 141–152.
- [18] P. Kukreja and V. Mahendran, "Contention matters: Modeling and analyzing the performance of federated learning over WiFi," in IEEE Int. Symp. on Personal, Indoor and Mobile Radio Communications (PIMRC), 2023, pp. 1–6.
- [19] X. Du, X. Fang, R. He, L. Yan, L. Lu, and C. Luo, "Federated deep reinforcement learning-based intelligent channel access in dense Wi-Fi deployments," arXiv:2409.01004, 2024.
- [20] N. Mukhtiar, A. Mahmood, and Q. Z. Sheng, "Fairness in federated learning: Trends, challenges, and opportunities," Adv. Intell. Syst., vol. 7, 2025, art. no. 2400836.
- [21] Y.-C. Mao, L.-J. Shen, J. Wu, P. Ping, and J. Wu, "Federated dynamic client selection for fairness guarantee in heterogeneous edge computing," J. Comput. Sci. Technol., vol. 39, no. 1, pp. 139–158, 2024.
- [22] A. Rodio, F. Faticanti, O. Marfoq, G. Neglia, and E. Leonardi, "Federated learning under heterogeneous and correlated client availability," in IEEE INFOCOM 2023 - IEEE Conference on Computer Communications, 2023, pp. 1–10.
- [23] Y. LeCun, L. Bottou, Y. Bengio, and P. Haffner, "Gradient-based learning applied to document recognition," Proc. IEEE, vol. 86, no. 11, pp. 2278–2324, 1998.
- [24] H. Xiao, K. Rasul, and R. Vollgraf, "Fashion-MNIST: A novel image dataset for benchmarking machine learning algorithms," arXiv:1708.07747, 2017.
- [25] A. Krizhevsky, "Learning multiple layers of features from tiny images," University of Toronto, Tech. Rep., 2009.
- [26] T.-M. H. Hsu, H. Qi, and M. Brown, "Measuring the effects of non-identical data distribution for federated visual classification," arXiv:1909.06335, 2019.

## 图注与表注索引

本页图 1–5 的中文图注与表 I–IV 的表注均按原文出现位置内联在正文中（图 1 见第 III-C 节，图 2–3 见第 IV-A 节，图 4 见第 IV-B 节，图 5 见第 V-B 节；表 I 见第 III-A 节，表 II 见第 III-C 节，表 III 见第 IV-B 节，表 IV 见第 V-B 节），此处不重复罗列。原文为 IEEE 会议双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.12903v1 全文（8 页）的中文译稿：摘要、索引词、第 I–VI 节正文与编号小节、致谢、图 1–5 的中文图注、表 I–IV 的逐格转写、参考文献 26 条英文原条目（按原编号），以及首页资助说明。原文无附录。公式与表格已对照 PDF 渲染页核对：式 (1)–(4) 逐式核对（第 4、5 页），表 I–IV 按第 3、4、5、7 页渲染图逐格核对（表 I 为 FL 配置表、表 II 为负载–投递率表、表 III 为留出 MAPE 表、表 IV 为成对精度差距表）。已加注一处原文疑点：$N=50$ 时"rounds-to-target 保持在 8.6"与图 3 实际 8.4–8.8 的差异，按原文照录并加注。本页不上传原文图片，图内曲线与表格中的实验数值按正文与表格转写，不作额外数字化估算。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
