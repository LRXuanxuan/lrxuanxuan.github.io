---
layout: page
title: "TRACE：由上行流量感知的几何信息网络用于稀疏导频信道估计｜中文全文译文"
permalink: /papers/translations/2026-11-03-2610-08992-trace-geometry-informed-pilot-limited-channel-estimation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/93836e40a67de25b/) · [原文 arXiv](https://arxiv.org/abs/2610.08992/) · [全部目录](/papers/catalog/)

# TRACE：由上行流量感知的几何信息网络用于稀疏导频信道估计

**原题：** Geometry-Informed Neural Network for Pilot-Limited Channel Estimation via Sensing from Uplink Traffic  
**作者：** Wenyu Huang、Alireza Javid、Nuria González-Prelcic（University of California San Diego, USA，加州大学圣迭戈分校；按 PDF 首页原样转写）  
**版本：** arXiv:2610.08992v1，[eess.SP]，2026-10-06；5 页；在投（submitted to IEEE，未确认录用；PDF 脚注声明“本文已提交 IEEE 供可能发表，版权可能未经通知即转移”）。  
**范围与状态：** 全文中文译稿：摘要、关键词（Index Terms）、正文第 1–5 节（§1 引言、§2 系统模型、§3 TRACE 与 §3.1–3.4、§4 仿真结果与 §4.1–4.3、§5 结论）、第 6 节致谢、第 7 节伦理合规声明、式 (1)–(4) 编号（另有若干未编号的行内式）、表 1–3 逐格转写、图 1–3 图注、第 8 节参考文献 [1]–[27] 英文原条目；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

可靠无线系统依赖准确的上行信道估计，以支撑基站的预编码、调度与链路自适应。在上中频段（upper mid-band），宽带宽与大规模天线阵列增大了信道维数，使稀疏导频（pilot-efficient）下的估计尤为困难。虽然每个用户只要发送数据就有上行数据可用，但探测（sounding）资源必须在小区内所有用户之间共享，于是每个用户只剩少量导频。因此信道估计在很大程度上依赖先验信息。现有方法以不同方式获取这类先验，各有局限：射线追踪（ray tracing）需要站点模型；信道知识地图（channel knowledge map）依赖其在所表示位置处或附近的测量；学习到的信道分布并不显式刻画传播几何。为此我们提出 **TRACE（TRaffic-Aided Channel Estimation，流量辅助信道估计）**，它从上行流量构建先验而无需额外探测。TRACE 从日常的多 UE 上行流量中学习几何感知（geometry-aware）的信道先验，并将其与可用导频结合用于信道估计。在 15 GHz 的射线追踪街道峡谷场景中，TRACE 在 8 个导频下取得 −7.48 dB 的 NMSE，优于三种最先进（state-of-the-art）先验与两种几何消融，领先幅度超过 3 dB；同时仅用 2 个导频仍然有效。在同一次部署内，TRACE 无需重训练即可在信噪比、载波频率与映射流量减少的情况下保持稳健。

**关键词（Index Terms）：** 感知辅助信道估计、通感一体化（integrated sensing and communication, ISAC）、几何信息化深度学习、稀疏导频、上中频段。

## 1 引言

可靠无线系统依赖准确的上行信道估计，以支撑基站（base station, BS）的预编码、调度与链路自适应。在上中频段，宽带宽与大规模天线阵列增大了信道维数，使稀疏导频的估计尤为困难 [1]。该挑战在上行方向尤为突出：每个用户都要在日常通信中于物理上行共享信道（physical uplink shared channel, PUSCH）上发送数据，而探测参考信号（sounding reference signal, SRS）资源必须在小区内所有用户之间共享。因此，基站观察到大量上行流量，却可能只有少量导频用于估计每个用户的信道。

导频较少时，会有很多信道都能拟合观测，使估计强烈依赖先验及其获取方式。基础模型（foundation model）用历史信道预测未来信道 [2]，但需要用户专属的历史，新到达的用户设备（user equipment, UE）没有这些历史。站点相关（site-specific）方法——包括神经无线电场 [3, 4]、点云方法 [5] 与可学习仿真器 [6]——需要事先采集的测量或显式三维几何。在未标定数字孪生上做射线追踪可以从少量测量预测信道统计量 [7]，但仍需要站点的三维模型。

信道知识地图（channel knowledge map, CKM），包括 IC-CKM [8]，从接收信号中学习位置相关的信道信息 [9, 10, 11]，但在没有直接测量的位置上依赖插值或预测。有些方法在服务过程中估计几何：双站接收机（bistatic receiver）把自身的路径估计转化为协方差 [12]；无线电同时定位与建图（simultaneous localization and mapping, SLAM）联合估计用户与环境地图 [13]；高斯场景模型沿既定轨迹学习时延与波束先验 [14]。然而这些方法需要在线感知或与轨迹相关的结构，并且对每个 UE 分别推断几何。基于分数的生成式信道模型 [15, 16] 与用于基于协方差的 MMSE 估计的变分自编码器 [17] 避免了显式几何，但直接从信道样本中学习黑箱先验。环境先验也可以由 RSS 地图 [1] 或路径级无线电地图 [18] 构建，但这些都需要离线的站点相关地图，其来源是测量、射线追踪或数字孪生。总体来看，现有方法所依赖的先验分别来自用户历史、站点相关信息、额外测量或黑箱学习，并且要为每个用户单独在线推断几何。

我们改为寻找这样一种先验：既不需要站点勘测（site survey）也不需要额外导频，能刻画小区几何，且仅凭粗略位置即可适配到新的 UE。我们提出 TRACE，它把日常的 PUSCH 流量作为感知来源来构建信道先验，无需额外信令，遵循通感一体化（ISAC）中“复用通信信号做感知”的思路。经过时间与频率同步之后，PUSCH 突发（burst）可提供含噪的角度、时延与多普勒检测量，而跨多个 UE 收集的检测量反映的是同一传播环境。TRACE 从历史流量中学习这一点，并用当前导频求解瞬时信道。在部署中，训练目标可来自成功译码并重新调制的 PUSCH 数据，因此不需要任何勘测。

我们的贡献如下。第一，我们提出一种**由流量导出的空间先验（traffic-derived spatial prior）**：把来自多个 UE 的含噪 PUSCH 检测量累积到三维体素栅格上，作为共享的传播证据，无需站点勘测或额外探测。据我们所知，这是首个通过聚合被动式多 UE 上行检测量来学习共享传播几何的信道先验。第二，我们设计一个**查询条件化的三维 U-Net（query-conditioned 3D U-Net）**，把这一共享证据转换为带有不确定性的、UE 专属的路径原子（path atom），这些原子定义了一个协方差先验，供线性最小均方误差（linear minimum mean squared error, LMMSE）估计结合当前导频使用；该网络通过这一固定估计器端到端训练。第三，在**按路径划分（route-wise）**、覆盖未见过位置的评测协议下，TRACE 在多个导频预算、信噪比、载波频率与历史流量减少的条件下均优于三种最先进（SOTA）先验与两种几何消融，并保持稳健。

## 2 系统模型

我们考虑单个小区，其中 UE 均为单天线，且只有一个基站。位于位置 \(\mathbf p^{\mathrm{BS}}\in\mathbb R^3\) 的基站配备半波长间距的 \(N_1\times N_2\) 均匀平面阵列（uniform planar array, UPA），阵元数 \(N_r=N_1N_2\)。接收机在带宽 \(B\) 内以间隔 \(\Delta f\) 对信道在 \(K\) 个频点上采样，其中采样点 \(n\) 相对载波 \(f_c\) 的频偏为 \(f_n=n\Delta f\)。基站在跨越若干个连续时隙（slot）的短突发内观测每个 UE，其间把 UE 位置视为常数，运动只通过多普勒频移体现。每个突发 \(i\) 由某一个 UE 发送。由于 TRACE 在汇合检测量时不使用 UE 身份，我们对所有量按突发编号，并以 \(q\) 表示查询（query）UE 当前所在的突发。突发 \(i\) 中的路径 \(l\) 具有复增益 \(\alpha_{il}\)、时延 \(\tau_{il}\)、多普勒频移 \(\nu_{il}\)、方位角 \(\phi_{il}\) 与俯仰角 \(\theta_{il}\)。其在基站处的到达方向用单位向量 \(\mathbf u_{il}\) 表示，定义为从基站指向来波方向。标准 5G 新空口（New Radio, NR）接收机处理会在基于导频的信道估计之前施加定时提前（timing-advance）控制与频率校正 [19]。由于这些操作并不完美且与具体 UE 有关，所得 CSI 保留残余的定时与频率偏差以及公共的复数失真，因此不同 UE 的 CSI 在时延与多普勒上并不直接对齐。

对突发 \(i\) 与时隙 \(t\)，我们把观测到的 CSI 建模为 [20]

$$
\widehat{\mathbf H}_i[n,t]=\beta_{i,t}\sum_l \alpha_{il}\,e^{-j2\pi f_n(\tau_{il}+\delta_i)}\,e^{j2\pi tT_s(\nu_{il}-\nu_i^{\mathrm{sync}})}\times\mathbf a(\phi_{il},\theta_{il})+\mathbf E_i[n,t],\tag{1}
$$

其中 \(\mathbf a(\phi,\theta)\in\mathbb C^{N_r}\) 是阵列响应，其元素为 \(e^{j2\pi \mathbf r_a^{\mathsf T}\mathbf u}\)，这里 \(\mathbf u\) 是 \((\phi,\theta)\) 对应的单位向量、\(\mathbf r_a\) 是阵元 \(a\) 以波长为单位的位置，\(T_s\) 是时隙时长。标量 \(\beta_{i,t}\in\mathbb C\) 刻画增益控制变化、振荡器相位噪声，以及相位跟踪（phase tracking）之后残余的公共相位与载波频偏（carrier frequency offset, CFO）[21]。定时提前之后的残余定时偏差（timing offset, TO）\(\delta_i\) 是 UE 时钟偏差与定时提前命令的估计误差、量化误差之和，在一个突发内保持不变。项 \(\nu_i^{\mathrm{sync}}\) 是粗频率同步环所吸收的公共频率。加性估计噪声为 \(\mathbf E_i[n,t]\sim\mathcal{CN}(\mathbf 0,\sigma_i^2\mathbf I)\)，在 \(n\) 与 \(t\) 上独立。各偏差以乘性方式作用，始终位于 \(\mathbf E_i[n,t]\) 之外。式 (1) 对历史突发与查询突发同样成立，但二者在基站侧扮演不同角色，如表 1 所总结。

导频较少使信道欠定，因此过去的上行流量可为路径方向与时延提供先验。每个 PUSCH 突发都在其分配频段上携带解调参考信号（demodulation reference signal, DMRS）[22]，基站为译码本来就已估计它们，因此这批历史不需要任何额外信令。

历史突发 \(i\) 保留其自身的 \(\delta_i\)、\(\nu_i^{\mathrm{sync}}\) 与噪声方差 \(\sigma_i^2\)。基站同时存储日常流量期间记录的粗略位置 \(\widehat{\mathbf p}_i^{\mathrm{UE}}\)，其误差尺度 \(\sigma_p\) 为几米。第 3.1 节消去 \(\delta_i\) 与 \(\nu_i^{\mathrm{sync}}\)，并把结果汇总为历史集合 \(\mathcal D\)。已译码的 PUSCH 数据可重新调制为信道估计，用于训练。对当前查询突发 \(q\)，基站使用稀疏 SRS 信道估计，以及来自 5G NR 定位 [23] 的发送 UE 粗略位置估计。SRS 通过梳状偏移（comb offset）与循环移位在 UE 之间共享，因此我们假设 \(K\) 个频点中只有 \(N_p\in\{2,\ldots,32\}\) 个可作为导频，其索引构成已知集合 \(\mathcal P\subset\{0,\ldots,K-1\}\)。每个采样点是一组 SRS 子载波，所以 \(N_p\) 个导频只观测到频段的 \(N_p/K\)。查询是式 (1) 中 \(t=0\) 的特例，因此其多普勒与 CFO 因子等于 1，公共相位包含在 \(\beta_q=\beta_{q,0}\) 中。我们的目标 \(\mathbf H\in\mathbb C^{K\times N_r}\) 是该观测中无噪声的部分，即 \(\mathbf H[n]=\beta_q\sum_l\alpha_{ql}e^{-j2\pi f_n(\tau_{ql}+\delta_q)}\,\mathbf a(\phi_{ql},\theta_{ql})\)。

**表 1（原文 Table 1）：** 历史突发、查询突发与目标 \(\mathbf H\)。

| 项目 \ 来源 | 历史 CSI | 历史检测量 | 查询导频 | 目标 \(\mathbf H\) |
|---|---|---|---|---|
| 符号（Symbol） | \(\widehat{\mathbf H}_i[n,t]\) | \(\Delta\tau_{ij},\Delta\nu_{ij},\mathbf u_{ij},P_{ij}\) | \(\mathbf y\) | \(\mathbf H\) |
| 接收机标量（Receiver scalar） | \(\beta_{i,t}\)，随突发内时隙变化 | 不适用（not applicable） | \(\beta_q\) | 同 \(\beta_q\) |
| 定时偏差（TO） | \(\delta_i\)，每突发 | 由参考路径抵消 | \(\delta_q\) | 同 \(\delta_q\) |
| 多普勒/CFO | \(\nu_{il}-\nu_i^{\mathrm{sync}}\) | 由参考路径抵消 | 在 \(t=0\) 处消失 | 在 \(t=0\) 处消失 |
| 噪声（Noise） | \(\mathbf E_i[n,t]\) | 经检测被削弱（reduced by detection） | \(\mathbf E_q[n,0]\) | 无（none） |
| 是否需同步（Sync. required） | 需要（applied） | 不需要（not needed） | 不需要（not needed） | 不需要（not needed） |
| 角色（Role） | 路径提取（path extraction） | 体素证据（voxel evidence） | 测量（measurement） | NMSE |

据此，基站观测到 \(\mathbf y=[\mathbf H]_{n\in\mathcal P}+[\mathbf E_q[n,0]]_{n\in\mathcal P}\in\mathbb C^{N_pN_r}\)，其中 \(\sigma^2\) 是查询噪声方差；同时还得到粗略位置 \(\widehat{\mathbf p}_q^{\mathrm{UE}}=\mathbf p_q^{\mathrm{UE}}+\mathbf e_q\)，\(\mathbf e_q\sim\mathcal N(\mathbf 0,\sigma_q^2\mathbf I)\)。被服务的 UE 可以按需用高精度 NR 定位进行定位，而历史位置是日常流量期间记录的那些，因此我们假设 \(\sigma_q<\sigma_p\)。仿真中设 \(\delta_q=0\)、\(\beta_q=1\)。我们的目标是找到估计器 \(\widehat{\mathbf H}=\mathcal G(\mathbf y,\widehat{\mathbf p}_q^{\mathrm{UE}},N_p,\sigma^2;\mathcal D)\)，使 NMSE 最小：

$$
\mathcal G_{\mathrm{opt}}=\arg\min_{\mathcal G}\ \frac{\mathbb E\left\|\widehat{\mathbf H}-\mathbf H\right\|_F^2}{\mathbb E\left\|\mathbf H\right\|_F^2}.
$$

对每个查询，信道标签都被归一化到单位平均功率，因此该 NMSE 等于对查询取平均的 NMSE，这正是图 3 与表 3 所报告的量。我们的推断不使用场景模型、射线追踪或已存 CSI。

## 3 TRACE：从上行流量学习几何信息化的信道先验

在上中频段，光滑的建筑表面产生较弱的漫散射 [24]，因此我们考虑以直达路径与反射路径为主的信道。图 1 给出整体流程。

**图 1（原文 Fig. 1）：** TRACE 估计器的架构。共享证据与查询信息产生带不确定性的路径原子，再由一个固定（无需训练参数）的贝叶斯求解器与当前导频结合。第 2–4 阶段为基于学习的部分。图中 5 个阶段依次为：① **体素证据（voxel evidence）**——由历史 \(\mathcal D\)（\(\widehat{\mathbf p}_i^{\mathrm{UE}}\) 与 \((\mathbf u_{ij},\Delta\tau_{ij},\Delta\nu_{ij},P_{ij})\)）形成简单投影（2 特征）、反射点（3 特征）、镜像基站（3 特征）、UE 位置（1 特征）四类空间证据，扩布到相邻体素，得到 \(V\in\mathbb R^{13\times192\times192\times16}\)；② **U-Net 编码器**——仅输入 \(V\)、不含查询，逐级下采样 \(192\cdot192\cdot16\to96\cdot96\cdot8\to48\cdot48\cdot4\to24\cdot24\cdot2\)，以跳连送入解码器，\(V\) 不变时可复用；③ **查询条件化**——由 \(\widehat{\mathbf p}_q^{\mathrm{UE}},N_p,\sigma^2\)、导频功率经固定 Fourier 特征与小网络得到查询向量 \(\mathbf q\in\mathbb R^{256}\)，以 FiLM（尺度 + 平移）、自注意力（8 个 token）与交叉注意力注入（瓶颈处注入初始为零）；④ **解码器渲染原子**——从第 2 阶段起以 \(\mathbf q\) 做 FiLM，每个体素有功率、偏移、宽度与分支 logits，取 top-\(M\)，含镜像基站 / 反射点 / 直达三条分支并以 softmax 混合，得到 48 个原子 + LoS；⑤ **贝叶斯求解**——\(\mathbf R=\sum_m w_m\mathbf D_m\otimes\mathbf A_m\) 并按 \(\gamma_m^\tau,\gamma_m^a\) 加宽核，由导频行 \(\mathbf R_{pp},\mathbf R_{fp}\) 以零参数的 LMMSE 得到 \(\widehat{\mathbf H}_{K\times N_r}\)；损失为相对 \(\mathbf H\) 的平均对数 NMSE，梯度经固定求解与协方差回传到第 2–4 阶段。

### 3.1 多 UE 同步与历史构造

来自不同 UE 的检测量只有在共享同一时延与多普勒参考时才可融合。每个历史 UE 都有自己的时钟偏差、定时提前残余与 CFO，因此我们先用每个突发中最早的强到达作为参考路径来同步该突发 [20]。查询 UE 跳过这一步，因为它不与其他 UE 融合，其公共时延与相位本来就属于目标 \(\mathbf H\)。同步一个突发分两步。第一步，在突发 \(i\) 的 DMRS 信道估计上运行稀疏路径检测器（带精化的正交匹配追踪）。对它检测到的每条路径 \(j\)（是路径 \(l\) 的子集），给出到达方向 \(\mathbf u_{ij}\)、功率 \(P_{ij}\)、时延 \(\tau_{ij}\) 与多普勒 \(\nu_{ij}\)，这些量仍带着 \(\delta_i\) 与 \(\nu_i^{\mathrm{sync}}\) 的偏移。第二步，减去参考路径的时延 \(\tau_{i,\mathrm{ref}}\) 与多普勒 \(\nu_{i,\mathrm{ref}}\)，只保留差值 \(\Delta\tau_{ij}=\tau_{ij}-\tau_{i,\mathrm{ref}}\) 与 \(\Delta\nu_{ij}=\nu_{ij}-\nu_{i,\mathrm{ref}}\)。由于 \(\delta_i\) 与 \(\nu_i^{\mathrm{sync}}\) 在一个突发内对所有路径是公共的，它们在这些差值中相消。

经过参考化的突发构成历史

$$
\mathcal D=\left\{\widehat{\mathbf p}_i^{\mathrm{UE}},\left\{\mathbf u_{ij},\Delta\tau_{ij},\Delta\nu_{ij},P_{ij}\right\}_{j}\right\}_{i}.
$$

### 3.2 体素证据表示

为跨 UE 合并检测量，我们先用每条检测的方向、相对时延与粗略 UE 位置把它映射到同一三维空间。对位于粗略 UE 位置 \(\widehat{\mathbf p}^{\mathrm{UE}}\) 的一条检测，我们用 LoS（视距）路径近似该突发的参考，并把路径长度估计为 \(\ell^{\mathrm{path}}=\left\|\widehat{\mathbf p}^{\mathrm{UE}}-\mathbf p^{\mathrm{BS}}\right\|_2+c\,\Delta\tau\)，其中 \(c\) 为光速。该估计既继承 UE 位置误差，又对非视距（non-line-of-sight, NLoS）突发引入一个公共参考偏移。随后我们用三种方式投影每条检测。第一种是**反射点**。在单次反射（single-bounce）模型下，它位于自基站出发沿 \(\mathbf u\) 的方向上，\(\mathbf p^{\mathrm{refl}}=\mathbf p^{\mathrm{BS}}+\ell^{\mathrm{BS}}\mathbf u\)。其距离 \(\ell^{\mathrm{BS}}\) 由路径长度确定，即 \(\ell^{\mathrm{BS}}+\left\|\widehat{\mathbf p}^{\mathrm{UE}}-\mathbf p^{\mathrm{refl}}\right\|_2=\ell^{\mathrm{path}}\)；若记 \(\mathbf d=\widehat{\mathbf p}^{\mathrm{UE}}-\mathbf p^{\mathrm{BS}}\)，则

$$
\ell^{\mathrm{BS}}=\frac{\left(\ell^{\mathrm{path}}\right)^2-\left\|\mathbf d\right\|^2}{2\left(\ell^{\mathrm{path}}-\mathbf u^{\mathsf T}\mathbf d\right)}.
$$

第二种是对应的**镜像源（image source）**，

$$
\mathbf p^{\mathrm{img}}=\widehat{\mathbf p}^{\mathrm{UE}}-\ell^{\mathrm{path}}\frac{\widehat{\mathbf p}^{\mathrm{UE}}-\mathbf p^{\mathrm{refl}}}{\left\|\widehat{\mathbf p}^{\mathrm{UE}}-\mathbf p^{\mathrm{refl}}\right\|_2}.
$$

第三种是**简单投影（simple projection）** \(\widehat{\mathbf p}^{\mathrm{UE}}-\ell^{\mathrm{path}}\mathbf u\)，它直接使用基站侧方向。对 LoS 路径，该点就是基站本身；对反射路径，它既不是镜像源、又会随 UE 位置移动，因此我们只把它当作廉价的方向线索，让网络决定其权重。由于 \(\ell^{\mathrm{path}}\ge\left\|\mathbf d\right\|\)，上式分母只在 LoS 检测处为零，此时我们用一个很小的常数替换它并把 \(\ell^{\mathrm{BS}}\) 限制在场景尺寸内，从而保留每一条检测。

这三类投影加上历史 UE 位置，构成四种空间证据。由于其位置并不确定，每一份贡献都按线性递减的权重分配到相邻的 8 个体素中心。每个几何投影存储加权检测计数、对数累积功率与突发支持度（burst support）。简单投影还额外存储相对多普勒的均值与离散度，以及位置误差尺度 \(\sigma_p\)。这 \(C=13\) 个特征构成图 1 中的证据栅格 \(\mathbf V\in\mathbb R^{C\times N_h\times N_h\times N_v}\)，其中 \(N_h\) 与 \(N_v\) 分别是基站中心栅格的水平与垂直体素数。

### 3.3 查询条件化的路径重建

各 UE 共享同一环境，但走不同的路径。因此我们只对体素证据栅格 \(\mathbf V\) 编码一次，再对每个查询做条件化。固定的 Fourier 特征与一个小型神经网络把粗略位置、导频数、噪声方差以及由导频估计出的信号功率转换为查询向量 \(\mathbf q\)。FiLM [25] 用 \(\mathbf q\) 对特征做尺度缩放与平移，使网络能够调整其依赖先验的强度；自注意力连接空间上相距较远的证据，交叉注意力则挑选与该查询 UE 相关的证据。解码器对所有体素打分，并保留得分最高的 \(M=48\) 个位置。

对每个被选中的体素 \(m\)，一个有界的三维偏移把其中心精化为 \(\mathbf p_m\)。解码器还预测时延与角度不确定度宽度 \(\gamma_m^\tau\) 与 \(\gamma_m^a\)、三个几何得分 \(s_m^{(k)}\) 以及一个功率得分。功率预测由镜像源计数特征初始化。每个被选位置 \(\mathbf p_m\) 由三条几何分支读取：作为基站与 UE 之间的散射体、作为镜像基站、或作为直达路径。每条分支给出候选时延与到达方向 \((\tau_m^{(k)},\mathbf u_m^{(k)})\)，其中 \(\mathcal B=\{\mathrm{scat},\mathrm{mir},\mathrm{dir}\}\)。各分支得分被转换为混合权重

$$
\pi_m^{(k)}=\frac{\exp\left(s_m^{(k)}\right)}{\sum_{r\in\mathcal B}\exp\left(s_m^{(r)}\right)},\quad
\tau_m=\sum_{k\in\mathcal B}\pi_m^{(k)}\tau_m^{(k)},\quad
\widetilde{\mathbf u}_m=\sum_{k\in\mathcal B}\pi_m^{(k)}\mathbf u_m^{(k)},\quad
\mathbf u_m=\frac{\widetilde{\mathbf u}_m}{\left\|\widetilde{\mathbf u}_m\right\|_2}.\tag{2}
$$

镜像基站分支被赋予最大的初始得分，而所有分支得分都通过信道估计损失学习得到。我们还额外在 \(m=0\) 处保留一个显式的 LoS 原子：其方向与时延由粗略查询位置确定，而其权重与不确定度宽度来自 \(\mathbf q\)。这些与选出的体素输出共同构成 \(\mathcal A=\{(\mathbf u_m,\tau_m,\gamma_m^\tau,\gamma_m^a,w_m)\}_{m=0}^{M}\)。权重被归一化，使其和与估计出的信号功率一致——该功率由减去 \(\sigma^2\) 之后的平均导频功率计算得到。只有这一功率尺度随当前导频变化，而原子的方向、时延、宽度与查询向量都只计算一次并在各时隙间复用，因此在给定先验的条件下，估计器对 \(\mathbf y\) 保持线性。

### 3.4 基于协方差的信道估计

原子集合 \(\mathcal A\) 描述了可能的路径结构，但当前各条路径的复增益仍然未知。因此我们用它构造一个协方差 \(\mathbf R\)，把已观测的导频与未观测的频点联系起来。对每个原子，令 \(\mathbf D_m\in\mathbb C^{K\times K}\) 与 \(\mathbf A_m\in\mathbb C^{N_r\times N_r}\) 分别描述频率相关性与天线相关性：

$$
\begin{aligned}
\left[\mathbf D_m\right]_{n,n'}&=e^{-j2\pi\left(f_n-f_{n'}\right)\tau_m}\operatorname{sinc}\left(\left(f_n-f_{n'}\right)\gamma_m^\tau\right),\\
\left[\mathbf A_m\right]_{a,b}&=e^{j2\pi\mathbf d_{ab}^{\mathsf T}\mathbf u_m}\operatorname{sinc}\left(\gamma_m^a\left\|\left(\mathbf I-\mathbf u_m\mathbf u_m^{\mathsf T}\right)\mathbf d_{ab}\right\|\right),
\end{aligned}\tag{3}
$$

其中 \(n,n'\) 为频率索引，\(a,b\) 为天线索引，\(\mathbf d_{ab}=\mathbf r_a-\mathbf r_b\) 是二者以载波波长为单位的位移，且 \(\operatorname{sinc}(x)=\sin(\pi x)/(\pi x)\)。指数项是精确平面波在 \(\tau_m\) 与 \(\mathbf u_m\) 处的协方差，而 sinc 项编码了这些量从粗略位置与体素继承到的误差。把时延在一个宽度 \(\gamma_m^\tau\) 上取平均即得时延 sinc，而角度 sinc 是同一效应在天线上可分离 sinc 近似。零宽度（\(\operatorname{sinc}=1\)）对应精确平面波，大宽度则使各采样点几乎不相关，因此这些宽度表达了应当以多大幅度信任每个原子。

假设原子增益零均值且彼此不相关，我们有 \(\mathbf R=\sum_{m=0}^{M}w_m\left(\mathbf D_m\otimes\mathbf A_m\right)\in\mathbb C^{KN_r\times KN_r}\)，其中 \(\otimes\) 为 Kronecker 积。同一物理路径上相邻的原子共用一个增益，但它们重叠的核叠加起来的效果相当于一个宽度更大的单原子，这一效应由学到的宽度来体现。把每个频点上的天线堆叠为 \(\mathbf h=\mathrm{vec}\left(\mathbf H^{\mathsf T}\right)\in\mathbb C^{KN_r}\)。导频集合 \(\mathcal P\) 选取导频协方差 \(\mathbf R_{pp}\in\mathbb C^{N_pN_r\times N_pN_r}\) 以及完整信道与导频之间的互协方差 \(\mathbf R_{fp}\in\mathbb C^{KN_r\times N_pN_r}\)。以 \(\mathbf R\) 作为先验协方差，即得 LMMSE 形式

$$
\widehat{\mathbf h}=\mathbf R_{fp}\left(\mathbf R_{pp}+\sigma^2\mathbf I\right)^{-1}\mathbf y,\tag{4}
$$

再把它重排为 \(\widehat{\mathbf H}\)。我们通过这个固定求解器训练网络：在所有查询上最小化 \(\operatorname{mean}\log\left(\left\|\widehat{\mathbf H}-\mathbf H\right\|_F^2/\left\|\mathbf H\right\|_F^2\right)\)，以无噪声信道 \(\mathbf H\) 为目标。

## 4 仿真结果

我们在 Sionna RT [26] 的 simple street canyon（简单街道峡谷）场景中评测 TRACE，射线追踪最多考虑五次反射。主要结果关闭绕射（diffraction）与漫散射，第 4.3 节在二者同时开启时重复该测试。图 2 给出场景与路径划分，表 2 列出各项设置。每个历史突发都由其自身的射线追踪路径加上自身偏差渲染得到。遵循 5G NR [19]，\(\delta_i\sim\mathcal U[0,65]\) ns（65 ns 对应 \(\mu=3\) 的 NR 定时提前步长），且 \(\nu_i^{\mathrm{sync}}\) 在 \(\pm25\) Hz 内做缓慢随机游走。突发被 15 dB 的噪声污染后送入第 3.1 节的检测器，该检测器平均返回 7.9 条路径，因此检测误差来自检测器本身。

取 2 至 8 个导频时，64 个频点中只有 3% 至 12.5% 被观测到。导频在频段上均匀分布、不带随机偏移，且每个查询都使用同一集合 \(\mathcal P\)。对每个查询，\(\sigma^2\) 由信道功率设定以达到目标 SNR。标准的定时与相位跟踪使查询偏差 \(\delta_q\) 与 \(\beta_q\) 都较小，且它们不是本文的研究对象，因此我们设 \(\delta_q=0\)、\(\beta_q=1\)。于是目标就是不含 TO 的射线追踪信道，且由于 \(t=0\) 也不含 CFO。我们在 15 GHz、10 dB 与 \(N_p\in\{2,4,8\}\) 下训练一个网络，每个批次采样一个 \(N_p\)，除特别说明外所有测试都复用它。我们把 UE 的行走路线划分到训练、验证与测试，其中部分测试路段在训练中未出现。推断不使用真实位置、路径或查询信道。在一块 RTX 4090 上，对 \(\mathbf V\) 编码一次耗时 13.6 ms，每个查询另加约 20 ms（批量）或 26 ms（单独）。

**图 2（原文 Fig. 2）：** 仿真场景，含训练、验证、测试与额外采样位置。相互重叠的路线为便于观看已做偏移。图中标注：3D 场景中基站位于 20 m 处、UE 位于 20 m 处，另有俯视图；路线划分为 Train（1、2、3、5、7、8、11）、Validation（4、10）与 Test（6、9、12）。

**表 2（原文 Table 2）：** 场景、网络与训练参数。（原表为 3 组“参数名—取值”共 6 列；此处按原列顺序转写，数值照抄，大数之间以空格分隔的表记方式沿用原文。）

| 参数 | 取值 | 参数 | 取值 | 参数 | 取值 |
|---|---|---|---|---|---|
| 载波 \(f_c\) | 15 GHz | 带宽 \(B\) | 200 MHz | 频点数 \(K,\Delta f\) | 64, 3.125 MHz |
| 基站阵列 | \(8\times8\)、\(\lambda/2\) | 场景位置数 | 24 254 | 追踪路径数 | 582 410 |
| 历史突发（含检测数） | 1 259（9 963） | 历史位置误差 \(\sigma_p\) | 3 m | 查询位置误差 \(\sigma_q\) | 0.5 m |
| 栅格 \(N_h,N_v,C\) | 192, 16, 13 | 间距（水平, 垂直） | 1.53 m, 5.81 m | 原子数 \(M+1\) | 49 |
| 参数量 | 15.3M | 优化器 | AdamW | 峰值学习率 | \(3\times10^{-4}\) |
| 步数、批大小 | 8 000, 8 | 学习率计划 | warmup、常量 | 精度 | bf16 |
| 训练 SNR | 10 dB | 查询数（验证, 测试） | 492, 837 | 测试 LoS 比例 | 49% |

### 4.1 基线比较

图 3 把 TRACE 与最小二乘（least squares, LS）插值、三种 SOTA 先验以及两种几何消融进行比较。IC-CKM [8] 在两处受到优待：其地图使用历史突发的干净全带 CSI（从邻近小区汇集而来），而 TRACE 只拿到含噪检测量；其求解器还把 \(\sigma^2\) 按 \(\nu=30\) 放大（该值在验证集上调出），使地图误差被当作噪声计入。扩散模型（diffusion model, DM）[15] 在我们 5422 个干净训练信道上训练，并在时延—角度域采样 100 个反向步、由似然梯度注入导频。GeoGS-CE [14] 借助其显式 LoS 分量适配到上行查询。几何地图（geometric map）由确定性几何生成候选路径与权重；**map + reweight**（地图 + 重加权）沿用同一批候选路径，但学习其权重与不确定度尺度；而 TRACE 学习的是候选位置、其置信度与宽度。所有方法共享测试查询与导频，后三种方法共享求解器。

在 8 个导频时，TRACE 达到 \(-7.48\pm0.01\) dB（在 6 次噪声实现上）。LS 始终高于 0 dB，因为导频间隔 25 MHz 时超过 40 ns 的时延会产生混叠（alias）。IC-CKM 达到 −2.16 dB；只有 44% 的测试查询在其自身 5 m 单元内有历史，因此它借用邻近单元的 CSI，这提升了覆盖但引入位置失配。

DM 在 8 个导频时达到 −0.5 dB NMSE，这恰好相当于“保留导频、把其余 56 个频点置零”的 NMSE；它的先验既不知道查询位置也不知道历史，所以对未观测频点返回其均值。更换更强的采样器与更宽的去噪器只会让这一结果变动不足 0.01 dB。GeoGS-CE 达到 −4.17 dB，主要来自其显式 LoS 建模。在 4 个与 8 个导频时，TRACE 平均分别比几何地图好 3.13 与 3.53 dB。对固定候选做重加权在 8 个导频时只能解释 0.30 dB 的增益，其余 3.23 dB 来自学习候选几何与路径置信度。在 2 个导频时，TRACE 仍比最强基线好 1.31 dB。直到 32 个导频，TRACE 仍在持续改进，尽管两条地图曲线因候选固定而趋平。一旦导频携带足够的时延结构，DM 便成为最强基线，但仍落后 TRACE 2.59 dB。

**图 3（原文 Fig. 3）：** 在 15 GHz、10 dB 与 \(N_p\in\{2,4,8\}\) 下训练的 TRACE 网络的信道估计 NMSE，沿三条部署轴评估：(a) 在 10 dB 下变化导频数；(b) 在 \(N_p=8\) 下变化接收 SNR；(c) 无适配的零样本（zero shot）载波迁移到 8 GHz。三幅子图的纵轴均为 NMSE（dB）：(a) 横轴为导频采样数 \(N_p=\) 2、4、8、16、32（对数刻度），纵轴 4 至 −8；(b) 横轴为接收 SNR（dB）0–20，纵轴 4 至 −8；(c) 横轴为导频采样数 \(N_p=\) 2、4、8，纵轴 −2 至 −8。图例：LS、IC-CKM [8]、DM [15]、GeoGS-CE [14]、几何地图（geometric map）、地图 + 重加权（map + reweight）、TRACE、TRACE（8 GHz）。

### 4.2 性能增益分析

表 3 按查询条件把相对几何地图的增益拆分开。当基站无法通过直达路径或单次反射路径到达某 UE 时，该查询被称为**无锚点（no anchor）**。几何地图使用 8 条固定候选路径：1 条 LoS 路径，以及由训练检测量导出的 7 条镜像源或散射体路径。LoS 上的增益更大，为 7.7 dB，而 NLoS 上为 2.3 dB。LoS 信道由一条路径主导，学到的原子能恢复其方向与时延。无锚点的查询增益最小，因此在不存在单次反射路径的地方 TRACE 帮助较小——这些情形原子分支只能近似。

两项消融显示了增益来源。若去掉用于初始化功率得分的镜像源计数，TRACE 降到 −3.91 dB，正是几何地图的水平，说明学到的精化建立在几何锚定之上而非取代它。若去掉简单投影，TRACE 在 4 个与 8 个导频时于三个随机种子上平均损失 0.6 dB，主要因为只有该投影携带多普勒与 \(\sigma_p\) 特征。把地图锚点加入学到的原子反而使 NMSE 变差，说明学到的原子已经覆盖了它们。

由每个查询自身射线追踪路径得到的**Oracle 原子**、用同一 LMMSE 估计器求解，展示了完美几何能带来什么：在相同的粗略位置下，TRACE 在 dB 意义上取回其增益的 56%。若把粗略位置换成真实位置（此时 \(\sigma_q=0.5\) m 的粗略设定被去掉），Oracle 还能进一步改善，因此更好的 UE 定位会带来更多帮助。

**表 3（原文 Table 3）：** 在 \(N_p=8\)、10 dB 下的 NMSE（dB）。Map 使用同样的流量但不做学习，因此它与 TRACE 的差距就是学习所增加的部分。（原表左右并置两个“条件—TRACE—Map”区块，第三列表头为 Change，即右侧区块所变化的条件；此处按原表顺序合并为一张表转写。）

| Condition | TRACE | Map | Change | TRACE | Map |
|---|---|---|---|---|---|
| 全部 All (837) | −7.48 | −3.94 | 历史突发减少 60%（60% fewer history bursts） | −7.27 | −3.94 |
| LoS (407) | −13.02 | −5.31 | 位置误差 \(\sigma_q=0\) m（Position error） | −7.53 | −4.08 |
| NLoS (430) | −5.22 | −2.96 | 位置误差 \(\sigma_q=1\) m（Position error） | −6.99 | −3.46 |
| 无锚点 No anchor (156) | −4.97 | −3.23 | 位置误差 \(\sigma_q=3\) m（Position error） | −3.23 | −2.07 |
| Oracle 原子（Oracle atoms），\(\widehat{\mathbf p}_q^{\mathrm{UE}}\) | −13.29 | – | 开启绕射与散射（Diffraction, scattering on） | −6.77 | −4.21 |
| Oracle 原子（Oracle atoms），\(\mathbf p_q^{\mathrm{UE}}\) | −20.19 | – | 加上地图锚点（Plus map anchors） | −6.94 | – |

### 4.3 部署稳健性

为检验 SNR 稳健性，我们把在 10 dB 下训练的 TRACE 直接用于 0 至 20 dB，不做重训练。它在每个 SNR 上都优于全部基线，而自身 NMSE 仅变化 0.54 dB。对**载波迁移**，我们在 8 GHz 下用相同带宽、频点数与电尺寸阵列重新追踪该场景，由 8 GHz 流量重建历史与体素栅格，然后复用该网络。TRACE 与它在 15 GHz 的结果相差保持在 0.35 dB 以内，因为几何原子把先验重新投影到了新载波上。在构建体素栅格之前移除 60% 的历史突发，在 8 个导频时于五个随机子集上仅损失 0.21 dB。

仅在 \(\sigma_q=0.5\) m 下训练的 TRACE，在 1 m 时损失很小，但在 3 m 时粗略位置已不再指向正确的镜面反射路径，所有基于位置的估计器都会崩溃。以绕射与漫散射（系数 0.1）重新追踪该场景，会把路径数增至约四十倍，而镜面反射路径仍保留 99.6% 的功率，代价是 0.71 dB。

我们在四个未见场景上测试**场景迁移**：两个不同宽度的街道峡谷，以及 Sionna RT 中慕尼黑（Munich）与巴黎星形广场（Paris Étoile）场景的局部，它们来自 OpenStreetMap 数据 [27]。零样本 NMSE 分别为 −1.7、−2.7、−0.8 与 −3.1 dB，而在 400 个目标场景查询上微调后分别为 −2.4、−5.3、−8.1 与 −5.4 dB。

## 5 结论

我们提出 TRACE，从日常上行检测量中学习带不确定性的路径假设，并通过一个固定求解器把它们与当前导频结合。在 8 个导频时，它优于三种 SOTA 先验与两种几何消融超过 3 dB，并且对导频数、SNR、载波频率与映射流量减少都保持稳健。未来工作将把 TRACE 扩展到动态传播环境。

## 6 致谢

本工作部分由加州大学圣迭戈分校无线通信中心（Center for Wireless Communications, CWC）的产业联盟计划（Industry Affiliate Program）支持。作者使用 Claude（Anthropic）改进全文各节文字的语法、清晰度与可读性。该 AI 工具未被用于生成技术内容或结果。

## 7 伦理合规声明

由于本研究只涉及数值仿真、不涉及人类受试者或动物实验对象，无需伦理审批。

## 8 参考文献

[1] A. Javid and N. González-Prelcic, "RSS map-assisted MIMO channel estimation in the upper mid-band under pilot constraints," IEEE Trans. Mach. Learn. Commun. Netw., vol. 4, pp. 1103–1119, 2026.

[2] X. Zhou, L. Liang, H. Ye, J. Zhang, C.-K. Wen, and S. Jin, "Reducing pilots in channel estimation with predictive foundation models," IEEE Trans. Commun., vol. 74, pp. 9360–9375, 2026.

[3] H. Lu, C. Vattheuer, B. Mirzasoleiman, and O. Abari, "NeWRF: A deep learning framework for wireless radiation field reconstruction and channel prediction," in Proc. 41st Int. Conf. Mach. Learn. (ICML), Vienna, Austria, July 2024, pp. 33147–33159.

[4] M. Umer, M. A. Mohsin, A. Bilal, and J. M. Cioffi, "Neural Gaussian radio fields for channel estimation," in Proc. 32nd ACM SIGKDD Conf. Knowl. Discov. Data Min. (KDD), Jeju, Republic of Korea, Aug. 2026, pp. 12138–12149.

[5] Y. Xue, Y. Wang, X. Shao, Q. Yan, S. Zhang, and T.-H. Chang, "Point-cloud-assistant localized statistical channel prediction by tangent Gaussian splatting," IEEE Trans. Wireless Commun., vol. 25, pp. 17816–17830, 2026.

[6] T. Hehn, M. Peschl, T. Orekondy, A. Behboodi, and J. Brehmer, "Wi-GATr: Differentiable and learnable wireless simulation with geometric transformers," in Proc. Int. Conf. Learn. Represent. (ICLR), Singapore, Apr. 2025.

[7] M. S. Abouamer, R. J. Williams, and P. Popovski, "Prediction of wireless channel statistics with ray tracing and uncalibrated digital twin," IEEE Wireless Commun. Lett., vol. 14, no. 9, pp. 2713–2717, 2025.

[8] W. Jiang, X. Yuan, B. Teng, H. Wang, and J. Qian, "Interference-cancellation-based channel knowledge map construction and its applications to channel estimation," IEEE Trans. Wireless Commun., vol. 24, no. 7, pp. 6240–6256, 2025.

[9] D. Wu, Y. Qiu, Y. Zeng, and F. Wen, "Environment-aware channel estimation via integrating channel knowledge map and dynamic sensing information," IEEE Wireless Commun. Lett., vol. 13, no. 12, pp. 3608–3612, 2024.

[10] W. Jiang, X. Yuan, C. Liu, and B. Teng, "Dynamic channel knowledge map construction in MIMO-OFDM systems," arXiv preprint arXiv:2512.23470, 2025.

[11] Y. Cao, J. Wang, X. Shi, and W. Ni, "Lightweight and self-evolving channel twinning: An ensemble DMD-assisted approach," IEEE Trans. Wireless Commun., vol. 24, no. 10, pp. 8072–8085, 2025.

[12] S. Wang, A. Tang, X. Wang, and W. Qu, "Sensing-assisted channel estimation for bistatic OFDM ISAC systems: Framework, algorithm, and analysis," IEEE Trans. Wireless Commun., vol. 25, pp. 7842–7857, 2026.

[13] B. J. B. Deutschmann, E. Leitinger, and K. Witrisal, "Geometry-based channel estimation, prediction, and fusion," arXiv preprint arXiv:2503.17868, 2025.

[14] Y. Zhang, J. Guo, C. Wen, C. Bian, and J. Zhang, "GeoGS-CE: Learning delay–beam channel priors with 3D Gaussians for high-mobility scenarios," arXiv preprint arXiv:2605.16094, 2026.

[15] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Trans. Wireless Commun., vol. 24, no. 7, pp. 5840–5854, 2025.

[16] M. Arvinte and J. I. Tamir, "MIMO channel estimation using score-based generative models," IEEE Trans. Wireless Commun., vol. 22, no. 6, pp. 3698–3713, 2023.

[17] M. Baur, B. Fesl, and W. Utschick, "Leveraging variational autoencoders for parameterized MMSE estimation," IEEE Trans. Signal Process., vol. 72, pp. 3731–3744, 2024.

[18] X. Wang, N. Cheng, Y. Zhang, R. Sun, and H. Peng, "Path-level radio map-aided fast and robust channel estimation for pilot-starved MIMO-OFDM systems," 2026, arXiv:2605.08720.

[19] 3GPP, "NR; physical layer procedures for control," 2026, TS 38.213, V19.4.0.

[20] W. Huang, N. González-Prelcic, V. Ratnam, M. Bayraktar, and C. J. Zhang, "Fuse-then-detect for passive UAV localization using multi-UE 5G uplink signals," in Proc. IEEE Annu. Integr. Sens. Commun. Conf. (ISAC), Lisbon, Portugal, Nov. 2026, to be published, arXiv:2607.11955.

[21] K. Wu, J. Pegoraro, F. Meneghello, J. A. Zhang, J. O. Lacruz, J. Widmer, F. Restuccia, M. Rossi, X. Huang, D. Zhang, G. Caire, and Y. J. Guo, "Sensing in bistatic ISAC systems with clock asynchronism: A signal processing perspective," IEEE Signal Process. Mag., vol. 41, no. 5, pp. 31–43, 2024.

[22] 3GPP, "NR; physical channels and modulation," 2026, TS 38.211, V19.4.0.

[23] 3GPP, "NG-RAN; stage 2 functional specification of user equipment (UE) positioning in NG-RAN," 2026, TS 38.305, V19.2.0.

[24] M. Ying, D. Shakya, P. Ma, G. Qian, and T. S. Rappaport, "Site-specific location calibration and validation of ray-tracing simulator NYURay at upper mid-band frequencies," npj Wireless Technol., vol. 2, no. 1, 2026, Art. no. 8.

[25] E. Perez, F. Strub, H. de Vries, V. Dumoulin, and A. Courville, "FiLM: Visual reasoning with a general conditioning layer," in Proc. AAAI Conf. Artif. Intell., New Orleans, LA, USA, Feb. 2018, pp. 3942–3951.

[26] J. Hoydis, F. A. Aoudia, S. Cammerer, M. Nimier-David, N. Binder, G. Marcus, and A. Keller, "Sionna RT: Differentiable ray tracing for radio propagation modeling," in Proc. IEEE Globecom Wkshps., Kuala Lumpur, Malaysia, Dec. 2023, pp. 317–321.

[27] OpenStreetMap contributors, "OpenStreetMap," https://www.openstreetmap.org/, 2026.

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、关键词（Index Terms）、第 1 节引言（含三条贡献）、第 2 节系统模型（式 (1)、表 1，以及若干未编号的行内式：\(\ell^{\mathrm{BS}}\)、\(\mathbf p^{\mathrm{img}}\)、\(\mathbf H[n]\)、\(\mathbf y\)、\(\widehat{\mathbf p}_q^{\mathrm{UE}}\)、\(\widehat{\mathbf H}\) 与 \(\mathcal G_{\mathrm{opt}}\)）、第 3 节及 §3.1–3.4（式 (2)–(4)，\(\mathcal D\)、\(\mathbf R\)、\(\mathbf h\) 等定义式按原文以行内形式给出）、第 4 节及 §4.1–4.3（表 2、表 3、图 2、图 3）、第 5 节结论、第 6 节致谢、第 7 节伦理合规声明、第 8 节参考文献 [1]–[27]（英文原条目）、图 1 图注。原文为 5 页 IEEE 会议双栏格式，无附录、无算法环境、无定理环境。**已知缺陷与核对说明：** ① pypdf 纯文本抽取把表格的列结构压平（表 1 的行内多列被串成一行、表 2 的三组参数连成一段、表 3 的左右两个区块被并成一行），本页已按 PDF 渲染页（6–7× 放大逐格核对）重建，数值全部照抄；② 首页标题在抽取中因小型大写字母被切成 “ESTIMA TION”，已按渲染页还原为 “ESTIMATION”；③ 参考文献中 “Y .”、“V .” 之类的空格伪影已还原为 “Y.”、“V.”；④ 表 2 的大数沿用原文以空格分隔千位的排法（“24 254” 即 24,254，“582 410” 即 582,410，“1 259（9 963）” 即 1,259（9,963）），未改动原文表记；⑤ 图 1 为架构示意位图，图注按原文翻译，方框内标签（如 voxel evidence、U-Net encoder、query conditioning、decoder renders atoms、Bayes solve、FiLM、cross attention、48 atoms + LoS 等）系按渲染页补注图内文字，正文未对其编号引用；⑥ 原文中 “Table 1 summarizes”、“Table 2 the settings” 等表述存在省略（原文即如此），译文按语义补足为“表 2 列出各项设置”，未改数值与结论；⑦ 全部 5 页均已渲染核对，本文所引关键数字已逐一对上：−7.48 dB（8 导频）、领先 3 dB 以上、−7.48±0.01（6 次噪声实现）、IC-CKM −2.16 dB、44%/5 m、DM −0.5 dB/其余 56 个频点/0.01 dB、GeoGS-CE −4.17 dB、3.13 与 3.53 dB、0.30 与 3.23 dB、2 导频时 1.31 dB、DM 落后 2.59 dB、编码 13.6 ms、每查询 20 ms（批量）/26 ms（单独）、LoS 7.7 dB 与 NLoS 2.3 dB、无镜像源计数时 −3.91 dB、无简单投影时 0.6 dB、取回 Oracle 增益 56%、SNR 上 0.54 dB、载波迁移 0.35 dB、少 60% 历史突发 0.21 dB、绕射+散射（系数 0.1）路径约四十倍与镜面保留 99.6% 功率、代价 0.71 dB、场景迁移零样本 −1.7/−2.7/−0.8/−3.1 dB 与微调后 −2.4/−5.3/−8.1/−5.4 dB。⑧ 为便于网页阅读，原文若干超长段落（§1 第 2 段、§2 两段、§3.1–3.4、§4 引言与 §4.1–4.3）已按语义拆分为多段，未增删任何内容、未改动编号与数值。**建议后续 QA 重点：** 式 (1) 中 \(\beta_{i,t}\)、\(\delta_i\)、\(\nu_i^{\mathrm{sync}}\) 的归属与 \(\mathbf E_i[n,t]\) 的独立性表述；式 (3) 的时延 sinc 与角度 sinc 中宽度 \(\gamma_m^\tau,\gamma_m^a\) 的位置；表 3 中 “Change” 列作为右区块条件名的排版归属；以及 §4.2 中 “With the true position instead of the coarse one (\(\sigma_q=0.5\) m)” 一句的括号所指（原文括号描述的是粗略位置设定的 \(\sigma_q\)，非真实位置）。逐句逐式终校未做。

---

**登记（2026-11-03）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
