---
layout: page
title: "5G NR LEO NTN 信道估计的 HELENA 对比评估｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-14735-helena-for-5g-nr-leo-ntn-channel-estimation-a-comparative-evaluation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/89d24cfddcc38e37/) · [原文 arXiv](https://arxiv.org/abs/2609.14735) · [全部目录](/papers/catalog/)

# 5G NR LEO NTN 信道估计的 HELENA 对比评估

**原题：** HELENA for 5G NR LEO NTN Channel Estimation: A Comparative Evaluation  
**作者：** Miguel Camelo Botero、Nina Slamnik-Kriještorac、Johann Marquez-Barja。单位：安特卫普大学 imec（University of Antwerp - imec），IDLab，比利时安特卫普。原文未给出作者邮箱。  
**版权：** 原文标注 © 2026 IEEE，声明"允许对本材料作个人使用；其他用途（转载、再出版、用于广告或促销、创建新合集、转售或再分发等）须获得 IEEE 许可"（原文版权声明全文已译于下方"版权声明"块）。本页仅为个人学习用中文译稿，**版权与再传播许可需另行核验**。  
**版本：** arXiv:2609.14735v1（eess.SP），v1 日期 2026 年 9 月 13 日；原文 6 页（IEEE 会议论文格式）。本页对应论文库 2026-09-28 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VII 节、致谢、图 1—3 图注、表 I—IV、式（1）—（6）、参考文献 [1]—[18]（英文原条目）。四张表均逐格转录并与 PDF 渲染核对；逐句逐式终校未做，不标记为已验收全文。

> **版权声明（原文）：** © 2026 IEEE。允许对本材料作个人使用。其他任何用途须获得 IEEE 许可，包括转载/再出版本材料以用于广告或促销、创建新合集、转售或再分发到服务器或列表，或复用本作品的任何受版权保护部分到其他作品中。
>
> **译注（术语与原文疑点）：** 原文缩写在本页首次出现时保留英文：NTN（non-terrestrial network，非地面网络）、LEO（low Earth orbit，低地球轨道）、OFDM、SISO、DM-RS、PDSCH、TTI、SCS、CP、LS/LMMSE、DL（deep learning）、HELENA、MDELAN、MDX、CE-ViT、P99、NMSE、FLOPs、COTS、RTX（NVIDIA GPU 平台名）、TensorRT、JetPack。原文疑点（按原文照录并加注，未静默修改）：
>
> 1. 表 I 中 "AttRNet" 在 PDF 的 Model 单元格内换行显示（原文抽取文本中与其上方的 "SRCNN, ChannelNet, EDSR" 连写）；据排版本页把 AttRNet 与前三者归为同一输入类别（LS+LI / None），若原意不同请以 PDF 为准。
> 2. 表 III 中 "PA-LMMSE\*" 与 "TF-PA-LMMSE\*† (ref.)" 带有 \*、† 标记，但原文表注**未给出**这两个符号的含义，按原文照录。
> 3. 参考文献 [6] 的会议地点写作小写 "málaga, Spain"（常规应为 "Málaga"），按原文照录。
> 4. §II 式（5）下方将估计器写作 $f_\Theta(H_{\mathrm{in}},u)$，其中 $u$ 表示辅助导频/掩码/边信息；正文另处用粗体 $\mathbf u$ 的场合已按原文区分，不额外统一。

## 摘要

基于深度学习（DL）的信道估计在地面 5G NR 中已展现出高精度与低延迟，但低地球轨道（LEO）非地面网络（NTN）引入的多普勒与同步损伤可能需要 NTN 专用的网络架构。我们检验了最初为地面信道设计的高效学习型双神经注意力信道估计器（High-Efficiency Learning-based channel Estimation using dual Neural Attention，HELENA）在 NTN 重训练后是否仍然有效，以及它是否适用于高性能与功耗受限两类推理平台。其**架构保持不变**，在成对的接收机补偿（NTN-1）与残余损伤（NTN-2）数据集上训练，并与在同一 NTN 数据上训练的八个地面来源模型以及 NTN 专用模型 MDELAN-SISO 比较。HELENA 在两种条件下都取得 DL 估计器中最低的实测 SNR 平均 NMSE，其中线性尺度 NMSE 比 MDELAN-SISO 低 55.8—62.7%。所有 DL 模型在 NTN-2 下都退化，说明残余多普勒及其相关损伤带来的挑战。在 RTX PRO 4500 上，HELENA 取得 0.0595 ms 的 99 分位（P99）推理延迟，比 0.5 ms 预算低 88.1%，且能耗低于其最接近的注意力类竞争者。在 10 W 的 Jetson Orin NX 上，它保持了有利的精度—能耗折中，但没有模型满足 P99 预算。因此，HELENA 在所评估的任务上无需 NTN 专用重构，而嵌入式尾延迟仍是开放挑战。

**关键词：** 信道估计；非地面网络；LEO 卫星；深度学习；神经网络加速。

## I. 引言

第五代新空口（5G NR）非地面网络（NTN）利用卫星或空中平台把蜂窝接入扩展到偏远、海上与航空区域。在低地球轨道（LEO）接入中，轨道运动造成大多普勒频移与时时变化的传播延迟，而同一卫星波束内不同位置的 UE 会经历不同的多普勒与延迟条件 [1]。相比地面 5G NR，这些损伤使同步与信道估计复杂化。

为缓解这些效应，发射机可利用星历与波束参考位置对波束**公共**的多普勒分量进行预补偿 [2]。偏离该参考位置的 UE 会保留一个依赖位置的频率偏移，并进一步被其移动性修正。接收机必须先完成定时与频率捕获，然后可利用循环前缀冗余与 NR 参考信号估计该残余 [3]、[4]。不完美的同步会在呈现给信道估计器的网格中留下相位演化与载波间干扰。因此，实用的 NTN 估计器必须恢复**有效后处理信道**，而不仅是地面评估中通常考虑的底层多径信道 [5]、[6]。

导频辅助最小二乘（LS）估计代价低但噪声敏感，而线性最小均方误差（LMMSE）利用二阶统计量提升稳健性，代价是更高的获取与计算开销 [7]、[8]。基于学习的地面估计器包括卷积超分辨率与残差网络 [5]、[9]—[11]、全连接模型 [12]、Transformer [13] 以及 MDX 等模型驱动接收机 [14]。最近，多膨胀高效层聚合网络（MDELAN）[15] 把 MDX 扩展到 NTN，并特别聚焦信道估计。

高效学习型双神经注意力信道估计器（HELENA）把稀疏导频输入与轻量双注意力结合，最初为地面 OFDM 信道估计设计 [6]。其**未经改动**的架构在 NTN 重训练后是否仍保持精度—效率优势，特别是在不同残余多普勒条件下、跨高性能与功耗受限嵌入式加速器时，仍不清楚。

为研究该问题，我们**不做架构修改**地重训练 HELENA，并将其与八个从零重训练的地面 DL 估计器、一个 NTN 专用估计器比较。成对的接收机补偿（NTN-1）与残余损伤（NTN-2）数据集隔离残余多普勒的影响，而高性能与嵌入式平台上的 FP16 部署评估延迟与能效。

综上，主要贡献为：a) 成对的接收机补偿与残余损伤数据集，用于隔离接收机多普勒效应；b) 把 HELENA 与八个地面 DL 估计器、一个 NTN 专用估计器以及实用的基于导频与统计基线作统一比较，表明在两种 NTN 条件下都取得最低的实测 DL SNR 平均 NMSE；c) 使用 FP16 TensorRT 在高性能与功耗受限嵌入式加速器上开展精度—复杂度—延迟—能耗分析。

全文组织如下：第 II—IV 节分别给出系统模型、方法与数据集生成；第 V 节报告结果；第 VI 节讨论其含义；第 VII 节总结。

## II. 系统模型与问题陈述

我们考虑 LEO 卫星与地面用户设备（UE）之间的下行单输入单输出（SISO）5G NR 正交频分复用（OFDM）链路。令 $f_d(\theta)$ 表示在仰角为 $\theta$ 的地面位置观测到的、带符号的卫星多普勒频移（单位 Hz）。在图 1 中，波束中心参考（BC）位于足迹中心，而 UE 可位于波束内另一点。二者的仰角 $\theta_{\mathrm{BC}}$ 与 $\theta_{\mathrm{UE}}$ 分别定义波束公共多普勒 $f_{d,\mathrm{common}}=f_d(\theta_{\mathrm{BC}})$ 与 UE 处的卫星多普勒 $f_{d,\mathrm{sat}}=f_d(\theta_{\mathrm{UE}})$。

假设发射机由卫星与波束参考几何获知 $f_{d,\mathrm{common}}$，并在辐射前将其去除。接收机输入端的残余载频偏移为

$$
f_{d,\mathrm{pre}}=f_{d,\mathrm{sat}}-f_{d,\mathrm{common}}+f_{d,\mathrm{UE}},\tag{1}
$$

其中 $f_{d,\mathrm{UE}}$ 是 UE 移动性引起的带符号多普勒贡献 [2]。等价地，发射机预补偿把复基带波形 $x(t)$ 映射为 $x_{\mathrm{pc}}(t)=x(t)e^{-\mathrm j2\pi f_{d,\mathrm{common}}t}$，其中 $t$ 为时间、$\mathrm j=\sqrt{-1}$。

为说明残余偏移如何出现在 OFDM 网格上，令 $i$ 索引子载波、$k$ 索引 OFDM 符号。对应的基带子载波频率与符号参考时间为 $f_i$ 与 $t_k$。接收机补偿前，接收资源元素的对角近似为

$$
Y^{\mathrm{pre}}_{i,k}=H^{\mathrm{can}}_{i,k}X_{i,k}e^{\mathrm j2\pi f_{d,\mathrm{pre}}t_k}e^{-\mathrm j2\pi f_i\tau}+Z_{i,k},\tag{2}
$$

其中 $X_{i,k}$ 与 $Y^{\mathrm{pre}}_{i,k}$ 分别为发射与接收网格符号；$H^{\mathrm{can}}_{i,k}$ 是发射机参考系下无噪声的多径响应，不含两个指数项所表示的残余多普勒与定时变换。此外 $\tau$ 是相对 OFDM 解调窗口的定时误差，$Z_{i,k}\sim\mathcal{CN}(0,\sigma^2)$ 是循环对称复高斯噪声，每个资源元素的总复方差为 $\sigma^2=\mathbb E[|Z_{i,k}|^2]$。两个指数项分别描述多普勒引起的跨 OFDM 符号相位演化与定时引起的跨子载波相位斜率。该对角抽象忽略了残余载波间干扰，而后者在波形生成的数据中仍然存在。

我们用 $s$ 标识本文使用的两种接收机处理配置：$s=1$ 表示补偿后的 NTN-1 条件，$s=2$ 表示残余损伤的 NTN-2 条件。对配置 $s$，令 $\hat\tau_s$ 与 $\hat f_{d,\mathrm{RX},s}$ 表示所采用的定时与残余多普勒估计。接收机处理后的剩余偏移为

$$
\tau_{\mathrm{post},s}=\tau-\hat\tau_s,\qquad f_{d,\mathrm{post},s}=f_{d,\mathrm{pre}}-\hat f_{d,\mathrm{RX},s}.\tag{3}
$$

因此，发射机预补偿去除波束公共的卫星分量，而接收机侧补偿估计并去除剩余依赖位置与移动性的多普勒。令 $y$ 表示含噪接收时域波形，$y_{\mathrm{clean}}$ 表示其匹配的无噪对应物（同一波形与信道实现、但不含加性噪声）。接收机算子 $\mathcal R_s\{\cdot\}$ 施加定时同步、可选的残余多普勒补偿与 OFDM 解调，产生网格 $Y^{(s)}=\mathcal R_s\{y\}$。利用由 $y$ 推断的同步参数，匹配的无噪有效目标为

$$
H^{\mathrm{eff}}_s=\mathcal R_s\{y_{\mathrm{clean}}\}\oslash X,\tag{4}
$$

其中 $X$ 为发射资源网格，$\oslash$ 表示在其占用资源元素上的逐元素除法。不同于辅助的规范（完美）信道 $H^{\mathrm{can}}$（例如 [6] 用作目标标签），该目标是在所选同步与补偿操作之后的**接收机参考系**中表述的。它是一个单抽头均衡目标；当残余 ICI 不可忽略时，它以发射网格为条件，不应被解释为与数据无关的物理信道响应。

令 $\mathcal P$ 表示解调参考信号（DM-RS）导频位置集合。由于这些位置上的 $X_{i,k}$ 已知，导频域 LS 估计为 $\hat H^{LS}_{i,k}=Y^{(s)}_{i,k}/X_{i,k}$（$(i,k)\in\mathcal P$）。学习型估计器接收该稀疏网格、其线性插值或模型特定的导频/数据辅助特征，并实现

$$
\hat H^{\mathrm{eff}}_s=f_\Theta\left(H_{\mathrm{in}},u\right),\tag{5}
$$

其中 $f_\Theta$ 表示以 $\Theta$ 参数化的估计器，$H_{\mathrm{in}}$ 为其信道输入，$u$ 为辅助导频、掩码或边信息。

第 IV 节的数据集实例化 $\mathcal R_s$ 的两种选择。NTN-1 施加联合的物理下行共享信道（PDSCH）时频对齐，随后对残余多普勒 $\hat f_{d,\mathrm{RX},1}$ 做独立的时频估计与补偿，产生补偿后的输入与匹配的有效目标。NTN-2 保留相同的发射机预补偿与定时对齐，但设 $\hat f_{d,\mathrm{RX},2}=0$；残余相位演化于是同时留在其输入与有效目标中。这种配对把接收机多普勒处理与信道、噪声随机性隔离开来。

**图 1：** 波束公共多普勒预补偿的几何示意。图中给出 LEO 卫星、波束足迹、波束中心参考（BC）与 UE 的仰角 $\theta_{\mathrm{BC}}$、$\theta_{\mathrm{UE}}$，以及卫星多普勒 $f_{d,\mathrm{sat}}$ 与波束公共多普勒 $f_{d,\mathrm{common}}$。（来源：原文第 2 页。）

## III. 评估方法与估计器

每个模型都针对 NTN-1 与 NTN-2 从随机初始化独立训练。同一底层信道实现的所有含噪 SNR 版本被分配到同一划分；否则同一信道的近亲版本可能同时出现在训练与测试中，造成数据泄漏并给出乐观的泛化结果。因此测试样本被排除在模型训练、归一化、早停与超参数选择之外。输入遵循原始估计器设计，复网格使用分离的实部与虚部通道。

表 I 给出各估计器是否需要插值或接收机侧信息，这对部署很重要：稀疏 LS 模型避免全网格预处理，而 CE-ViT 与模型驱动方法需要额外输入。

**表 I：所比较 DL 估计器的输入。**（来源：原文第 3 页。）

| 模型 | 信道输入 | 边信息 |
|---|---|---|
| SRCNN、ChannelNet、EDSR、AttRNet | LS+LI | 无 |
| ProEsNet | 稀疏 LS | 无 |
| LSiDNN-48 | 稀疏 LS | 无 |
| CE-ViT | LS+LI | SNR、多普勒、延迟 |
| HELENA-MHSA、HELENA | 稀疏 LS | 无 |
| MDELAN-SISO | PA-LS+DA-LS+位置编码 | 实用噪声估计 |

传统参考方法包括带二维线性插值的 LS（LS+LI）[7]、实用的 5G NR DM-RS 估计器，以及三种 LMMSE 实现 [8]。令 $\mathbf h$ 为向量化的有效目标，$\mathbf h_p$ 为其导频系数，$\hat{\mathbf h}^{\mathrm{LS}}_p$ 为含噪导频观测。所实现的仿射 LMMSE 估计器为

$$
\hat{\mathbf h}=\bar{\mathbf h}+\mathbf R_{hp}\left(\mathbf R_{pp}+\left(\hat\sigma^2+\lambda\alpha\right)\mathbf I\right)^{-1}\left(\hat{\mathbf h}^{\mathrm{LS}}_p-\bar{\mathbf h}_p\right),\tag{6}
$$

其中 $N_p$ 是导频系数数。拟合划分提供均值与协方差以及以 SNR 为条件的导频误差方差 $\hat\sigma^2$（在含噪导频 LS 观测与匹配的无噪导频标签之间测量）。此外 $\lambda=10^{-4}$、$\alpha=\mathrm{tr}(\mathbf R_{pp})/N_p$。线性方程组的求解不显式构造逆矩阵。

由于 LMMSE 依赖二阶信道统计量，其性能也取决于具有不同多径结构的信道如何分组。数据集包含标准化的 NTN-TDL-A—D 剖面，每个剖面定义不同的抽头延迟与功率结构，而单独变化的延迟扩展对该结构进行缩放 [1]。因此我们评估三个层次的统计知识。**全局 LMMSE** 对全部训练与验证剖面拟合一个协方差，并与 11 个以 SNR 为条件的导频误差方差组合。**剖面感知 LMMSE** 为 A—D 每个剖面拟合一个协方差（合并其两个延迟扩展设置）；把这四个协方差与 11 个以 SNR 为条件的导频误差方差组合得到 44 个滤波器，用真实剖面与标称 SNR 选择。**测试拟合的剖面感知 LMMSE** 额外在包含测试标签的完整数据集上拟合这些统计量；它不可部署，仅作为经验线性参考，而非理论界。实用 NR 估计器执行 CDM 感知的导频处理、平均与全网格插值 [16]、[17]。

DL 比较覆盖卷积超分辨率（SRCNN 与 ChannelNet）[5]、残差与注意力精化（EDSR、AttRNet 与 ProEsNet）[9]—[11] 以及全连接 LSiDNN [12]。依照 [6] 的实现细节：ChannelNet 使用冻结的 SRCNN 前端与 32 滤波器的 DnCNN；EDSR 使用 32 个滤波器与 16 个残差块；AttRNet 使用 32 滤波器的注意力—残差卷积；LSiDNN 有 48 个隐藏神经元 [6]。所有卷积模型都保持 $612\times14$ 网格而不做学习式上采样。

CE-ViT 结合 Transformer 块、信道元数据与转置卷积重建层 [13]。我们采用该名称是因为原 PD-CEViT 的导频设计模块被省略；所有估计器共享固定的 NR DM-RS 配置。HELENA 结合浅层卷积、紧凑多头自注意力与压缩—激励（squeeze-and-excitation）块，而 HELENA-MHSA 去掉后者 [6]。MDELAN-SISO 遵循 [15] 的 NTN 信道估计设计，把通信信息驱动的 MDX 接收机 [14] 的残差块替换为两个 MDELAN 块。它保留 MDX 预处理：插值 PA-LS 与实用噪声估计给出逐 RE 的 SISO MMSE 符号估计，再由其计算 DA-LS。各块对 PA-LS、DA-LS 与位置输入精化，以产生全网格信道估计。

**表 II：成对 NTN 数据集配置。**（来源：原文第 3 页。）

| 参数 | NTN-1 | NTN-2 |
|---|---|---|
| 载波/网格 | 2 GHz；51 RB；30 kHz SCS；常规 CP | 同左 |
| 网格尺寸 | 612×14 复资源元素 | 同左 |
| 链路/天线 | 下行 PDSCH；SISO | 同左 |
| 波形符号 | 全网格 QPSK | 同左 |
| DM-RS | Type A；位置 2；附加位置 1；配置类型 2 | 同左 |
| 信道剖面 | NTN-TDL-A、B、C、D | 同左 |
| 延迟扩展 A/B | 30 或 100 ns | 同左 |
| 延迟扩展 C/D | 5 或 30 ns | 同左 |
| 卫星高度 | 600 km | 同左 |
| UE 仰角/速度 | 10—89°；0—120 km/h | 同左 |
| 接收前残余多普勒 | 150—900 Hz；波束偏移至多 1.5° | 同左 |
| SNR/样本数 | 0:2:20 dB；每个数据集 11,264 个 | 同左 |
| PDSCH 对齐 | 联合时频 | 同左 |
| 发射机预补偿 | 启用 | 启用 |
| 接收机多普勒补偿 | 独立时频 | 禁用 |
| 主目标 | 补偿后 | 残余损伤 |

## IV. NTN 数据集创建

成对数据集实现第 II 节定义的两个接收机算子 $\mathcal R_1$ 与 $\mathcal R_2$。它们用 MATLAB 5G Toolbox 与 Satellite Communications Toolbox 在波形级生成，遵循 NR NTN PDSCH 处理链¹。表 II 表明传播、numerology、导频与场景采样都相同，接收机侧残余多普勒补偿是受控差异。

每个数据集在每个 SNR 与 NTN-TDL 剖面下有 256 个示例，即 $4\times11\times256=11{,}264$ 个样本。信道实现在 A—D 多径族、其适用延迟扩展以及三个 UE 速度、仰角与残余多普勒区间之间均衡。每个剖面按 179/38/39 个实现分配为训练/验证/测试，再生成它们的 SNR 变体，得到 7,876/1,672/1,716 个样本。相同的波形、信道与噪声种子使两种接收机条件在样本级可比。SNR 表示归一化波形/信道缩放后标称 AWGN 注入水平；该数据集面向估计器比较，而非卫星链路预算评估。

> **脚注 1（原文）：** https://www.mathworks.com/help/satcom/ug/nr-ntn-pdsch-throughput.html

两种条件都施加波束公共波形预补偿以得到 $x_{\mathrm{pc}}(t)$，并通过联合 PDSCH 频率/定时对齐估计 $\hat\tau_s$。NTN-1 把循环前缀小数偏移估计与 DM-RS 整数子载波估计结合起来估计 $\hat f_{d,\mathrm{RX},1}$ [3]、[4]。NTN-2 保留对齐与定时跟踪，但如第 II 节所述设 $\hat f_{d,\mathrm{RX},2}=0$。所有接收机侧定时与残余多普勒估计都使用含噪观测而非真实偏移。实用基线为 `nrChannelEstimate`²，配置 CDM 长度、平均、插值与噪声估计。

每个 MAT 文件存储含噪网格、稀疏/插值 LS 输入、导频与掩码、实用 DM-RS 估计、有效目标、辅助规范信道、划分索引、SNR、场景 ID 以及物理/接收机元数据。评估假设 PDSCH/DM-RS 配置已知，从而把信道估计与 SSB 检测、PBCH/控制获取以及有状态初始同步隔离开。

> **脚注 2（原文）：** https://www.mathworks.com/help/5g/ref/nrchannelestimate.html
>
> **脚注 3（原文）：** 数据集、编译模型与评估脚本将在线发布：https://github.com/miguelhdo/CE_NTN_Performance_Evaluation

## V. 性能评估

### A. 实验设置与可复现性

对每种 NTN 条件，精度评估使用全部 1,716 个留出示例，每个 SNR 有 156 个样本。模型使用 Adam、MSE、批大小 64、最多 500 个 epoch，并采用耐心 50 的早停与最佳验证恢复。初始学习率为 $10^{-3}$ 并做平台期衰减，MDELAN 例外（训练集上调参后使用 0.03 与残差尺度初始化 $10^{-4}$）。每个模型/条件使用一次固定种子训练；因此亚 dB 差异只是观测到的排序，而非统计上确立的差距。

兼容的 Keras 模型被导出为 ONNX、经数值验证并用统一流程以 TensorRT 优化。TensorRT 引擎以 4 GiB 工作空间、批大小 1 原生编译，每次调用处理一个信道网格。RTX PRO 4500 与 Jetson Orin NX 分别代表高性能与功耗受限嵌入式加速器类别；后者已被在轨验证为商用现货（COTS）AI 加速器 [18]。我们使用两个平台仅为了比较同一估计器在不同计算类别下的表现；所建模的下行 CE 仍位于 UE。两个平台都使用 FP16：RTX 上为 TensorRT 10.16，Orin 上为 TensorRT 10.3 与 Orin 10 W 配置⁴。跨十个模型与两种 NTN 条件，FP16 与 FP32 的 NMSE 绝对差平均为 0.0011 dB、最大不超过 0.0038 dB 且不改变排序，因此我们只报告 FP16 部署结果。

对每个模型/平台，三次运行各使用 500 次预热与 5,000 次测量。P99 按每次运行计算、再对三次运行平均。从准备输入到信道输出的延迟包含固定主机—设备与设备—主机传输、推理与同步，但不含输入构造与接收机其余链路。功耗在至少 5 s 的负载期间每 20 ms 采样一次。

> **脚注 4（原文）：** https://developer.nvidia.com/embedded/jetpack-sdk-62

### B. 信道估计精度

图 2 首先给出逐 SNR 的行为。NTN-2 的曲线比对应的 NTN-1 更早变平，表明随 AWGN 减小残余损伤成为主导。HELENA 在两种条件下都保持为最准确的 DL 估计器之一，而测试拟合 LMMSE 在 NTN-1 的高 SNR 处改善更强、在 NTN-2 中表现出更早的误差地板。这些趋势促使我们做下面的聚合与配对条件比较。

表 III 报告 0—20 dB 上 11 个逐 SNR NMSE 值（以 dB 表示）的算术平均。配对差异 $\Delta_{\mathrm{all}}$（0—20 dB）与 $\Delta_H$（12—20 dB）按 NTN-2 减 NTN-1 计算，正值表示残余多普勒导致的退化；百分比与倍数表示相应的线性尺度 NMSE 变化。

HELENA 取得 DL 估计器中最低的实测平均 NMSE：NTN-1 为 $-21.856$ dB、NTN-2 为 $-20.866$ dB。相对 AttRNet，它使线性尺度 NMSE 降低 11.3%/6.8%（0.52/0.31 dB）；相对 CE-ViT 的降低为 NTN-1/NTN-2 的 16.6%/11.1%（0.79/0.51 dB）。信道重校准相对 HELENA-MHSA 使 NMSE 降低 22.7%/35.2%，支持其在残余多普勒下获益更大。HELENA 相对 NTN 专用的 MDELAN-SISO 还使线性尺度 NMSE 低 55.8%/62.7%。

统计 LMMSE 基线呈现不同的、依赖条件的趋势。在 NTN-1 中，全局与剖面感知变体分别比 HELENA 好 0.07 dB（1.5%）与 1.48 dB（28.9%），测试拟合 LMMSE 也比 HELENA 好 1.80 dB（34.0%）。该排序在 NTN-2 中反转：HELENA 相对全局、剖面感知与测试拟合 LMMSE 分别使线性尺度 NMSE 降低 41.2%、29.8% 与 14.9%。因此测试拟合变体是经验线性参考，而非理论上界。

从 NTN-1 到 NTN-2，HELENA 的全范围 NMSE 增加 0.990 dB，对应线性尺度 NMSE 高 1.26 倍。AttRNet 与 CE-ViT 的增幅较小，分别为 0.776 dB（1.20 倍）与 0.710 dB（1.18 倍），但 HELENA 在两种条件下仍保持最低绝对 NMSE。实用 NR 估计器与全局 LMMSE 更敏感，分别退化 5.451 dB（3.51 倍）与 3.361 dB（2.17 倍）。在高 SNR 处 HELENA 的惩罚升至 2.612 dB（1.83 倍），确认随 AWGN 减小残余损伤影响更强。

**图 2：** 所选用估计器的测试 NMSE 随 SNR 变化；表 III 报告全部结果。左：NTN-1（接收机多普勒已补偿）；右：NTN-2（残余损伤）。图例：LS+LI、5G NR DM-RS 估计器、测试拟合 PA-LMMSE、HELENA、CE-ViT、AttRNet、HELENA-MHSA、MDELAN-SISO。（来源：原文第 4 页。）

**表 III：SNR 平均测试 NMSE 与 DL 复杂度。** 参数（×10³）、FLOPs（×10⁹）、SNR 平均 NMSE（dB，NTN-1 / NTN-2）以及 NTN-2 惩罚（dB，Δall / ΔH）。下行均值 NMSE 越小越好；NMSE 颜色相对 HELENA（绿色更好、红色更差、蓝色为 HELENA）；惩罚 = NTN-2 − NTN-1，正值表示退化、不著色。（来源：原文第 4 页。）

| 模型 | 参数（×10³） | FLOPs（×10⁹） | NTN-1 | NTN-2 | Δall | ΔH |
|---|---|---|---|---|---|---|
| LS+LI | — | — | −8.000 | −7.123 | +0.877 | +1.757 |
| 5G NR DM-RS | — | — | −17.283 | −11.832 | +5.451 | +6.567 |
| G-LMMSE | — | — | −21.921 | −18.560 | +3.361 | +5.386 |
| PA-LMMSE\* | — | — | −23.339 | −19.331 | +4.008 | +6.461 |
| TF-PA-LMMSE\*†（ref.） | — | — | −23.658 | −20.166 | +3.492 | +5.663 |
| SRCNN | 14.114 | 0.241 | −18.668 | −17.455 | +1.213 | +2.259 |
| ChannelNet | 184.068 | 3.119 | −21.020 | −19.907 | +1.113 | +2.392 |
| EDSR | 306.370 | 5.245 | −21.288 | −20.371 | +0.918 | +2.084 |
| ProEsNet | 170.178 | 2.915 | −21.227 | −20.319 | +0.908 | +2.124 |
| AttRNet | 75.656 | 1.288 | −21.334 | −20.558 | +0.776 | +1.947 |
| LSiDNN-48 | 1662.240 | 0.003 | −17.946 | −14.805 | +3.141 | +4.720 |
| CE-ViT | 880.370 | 0.162 | −21.068 | −20.357 | +0.710 | +1.773 |
| HELENA-MHSA | 114.162 | 0.084 | −20.739 | −18.980 | +1.759 | +3.419 |
| HELENA | 116.290 | 0.084 | **−21.856** | **−20.866** | +0.990 | +2.612 |
| MDELAN-SISO | 1.396 | 0.018 | −18.308 | −16.580 | +1.728 | +2.786 |

### C. 部署性能

由于 NTN-1 与 NTN-2 模型共享架构与张量维度、只在学习权重上不同，表 IV 只报告 NTN-1 的部署测量。在 30 kHz 子载波间隔（SCS）下，一个时隙持续 0.5 ms。依照 HELENA [6] 采用的、基于 [17] 的三个 TTI 接收机允许量，我们为一个 TTI 分配给 CE。因此 $T_{\max}=0.5$ ms 是估计器调用的评估预算，而非标准化的完整接收机截止时间。

在 RTX 上，HELENA 达到 0.0531 ms 平均延迟与 0.0595 ms P99，比预算低 88.1%。它比 AttRNet/CE-ViT 快 1.42/1.82 倍，能耗低 60.3%/30.6%。HELENA-MHSA 节省 10.0% 延迟与 8.7% 能耗，而 HELENA 使其线性尺度 NMSE 降低 22.7%（1.12 dB）。在 Orin 上，HELENA 达到 $0.6541\pm0.0230$ ms 平均延迟与 1.7994 ms P99；比 AttRNet/CE-ViT 快 1.71/1.26 倍，能耗低 53.5%/13.2%。其 P99 与 AttRNet 接近，但比 CE-ViT 高 10.8%。图 3 显示 HELENA 位于两个平台的帕累托前沿上，且在图中模型里具有最高的 NTN-1 精度。

**表 IV：NTN-1 FP16 部署测量与相对 HELENA 的差值。** 两平台分别为 RTX PRO 4500 Blackwell（FP16）与 Jetson Orin NX（FP16，10 W）；各列：均值±标准差（ms）、P99（ms）、能耗±标准差（mJ/样本）、ΔT_HEL（%）、ΔE_HEL（%）。绿色/红色 P99 单元表示满足/超出 0.5 ms 预算；正 ΔT_HEL 与 ΔE_HEL 表示相对 HELENA 更高的平均延迟与能耗；每样本能耗 = 含基线的工作负载能耗 / 完成的估计数；均值为三次运行；RTX 能耗覆盖 GPU 板卡功率，而 Orin 覆盖完整模块输入，故能耗值应在各平台内比较。（来源：原文第 5 页。）

| 模型 | RTX 均值±s（ms） | RTX P99（ms） | RTX 能耗（mJ/样本） | ΔT_HEL | ΔE_HEL | Orin 均值±s（ms） | Orin P99（ms） | Orin 能耗（mJ/样本） | ΔT_HEL | ΔE_HEL |
|---|---|---|---|---|---|---|---|---|---|---|
| SRCNN | 0.0361±0.0006 | 0.0425 | 5.989±0.059 | −32.0 | +5.9 | 0.6444±0.0177 | 1.1717 | 4.110±0.043 | −1.5 | −9.6 |
| ChannelNet | 0.1077±0.0004 | 0.1120 | 19.641±0.511 | +103.0 | +247.3 | 1.5319±0.1242 | 2.2807 | 14.925±1.467 | +134.2 | +228.3 |
| EDSR | 0.1528±0.0008 | 0.1682 | 30.364±0.322 | +187.9 | +436.9 | 2.1463±0.1110 | 3.0533 | 22.373±2.018 | +228.1 | +392.2 |
| ProEsNet | 0.2951±0.0002 | 0.3016 | 54.492±0.337 | +456.1 | +863.6 | 5.9873±0.3372 | 6.9292 | 60.100±6.155 | +815.4 | +1222.1 |
| AttRNet | 0.0754±0.0011 | 0.0817 | 14.245±0.664 | +42.0 | +151.9 | 1.1209±0.0668 | 1.7964 | 9.772±0.970 | +71.4 | +115.0 |
| LSiDNN-48 | 0.0257±0.0003 | 0.0290 | 2.961±0.029 | −51.5 | −47.6 | 0.4075±0.0048 | 2.4303 | 2.968±0.088 | −37.7 | −34.7 |
| CE-ViT | 0.0967±0.0009 | 0.1049 | 8.143±0.375 | +82.1 | +44.0 | 0.8273±0.0364 | 1.6245 | 5.236±0.832 | +26.5 | +15.2 |
| HELENA-MHSA | 0.0478±0.0004 | 0.0520 | 5.164±0.126 | −10.0 | −8.7 | 0.6102±0.0009 | 2.0781 | 4.057±0.039 | −6.7 | −10.8 |
| HELENA | 0.0531±0.0001 | **0.0595** | 5.655±0.138 | 0.0 | 0.0 | 0.6541±0.0230 | 1.7994 | 4.546±0.210 | 0.0 | 0.0 |
| MDELAN-SISO | 0.1067±0.0012 | 0.1136 | 8.999±0.097 | +101.0 | +59.1 | 1.0348±0.0795 | 2.1065 | 8.209±1.589 | +58.2 | +80.6 |

**图 3：** NTN-1 在 FP16 推理下的精度—尾延迟折中。左：RTX PRO 4500（FP16）；右：Jetson Orin NX（FP16，10 W）。横轴为 P99 延迟（ms，对数坐标），纵轴为 NTN-1 SNR 平均 NMSE（dB）；虚线为帕累托前沿，竖线为 0.5 ms 预算。（来源：原文第 5 页。）

## VI. 讨论与实践启示

结果表明，地面信道估计架构在 NTN 重训练后仍可有效。特别地，未改动的 HELENA 架构在两种所评估的 NTN 条件下都取得最佳实测 DL 精度。这支持其在有监督 NTN 适配下的稳健性，而从地面网络（TN）训练模型出发的零样本迁移仍有待评估。所有 DL 估计器在 NTN-2 中退化，也说明学习并不能消除接收机侧多普勒补偿的收益。尽管 LMMSE 在信道统计量准确时具有竞争力，获取与跟踪这些统计量可能不切实际；HELENA 在推理时既不需要剖面标签也不需要协方差矩阵。

部署适用性强烈依赖可用计算资源。在 RTX 上，HELENA 在满足所采用 CE 延迟预算的同时提供最佳 DL 精度。在 10 W 的 Orin NX 上，包括轻量替代方案在内，没有任何所评估模型满足该预算；因此要在再生式或其他功耗受限平台上满足该预算，还需要进一步进展，例如量化、算子融合、硬件感知架构或 FPGA 加速。MDELAN-SISO 的结果也确认：低参数量与低 FLOPs 并不保证低部署延迟或能耗，因此在目标平台上实测至关重要。

上述结论适用于所评估的 SISO、600 km LEO、2 GHz、30 kHz SCS 与 DM-RS 配置。仍需链路级评估，以确定观测到的 NMSE 增益如何转化为 BLER 与吞吐量。

## VII. 结论与未来工作

我们在接收机补偿与残余损伤的 5G NR NTN 条件下评估了 HELENA 与九个 DL 估计器。经 NTN 重训练后，未改动的 HELENA 架构取得最低的实测平均 DL NMSE 与有利的延迟—能耗折中。它在 RTX 上满足所采用的 CE 延迟预算，而在 10 W 的 Orin NX 上没有任何所评估模型满足 P99 预算。结果还表明残余多普勒仍是高 SNR 退化的重要来源，且解析模型复杂度不能可靠预测部署性能。未来工作将评估链路级 MIMO 性能、地面到 NTN 的迁移学习，以及面向受限接收机的硬件感知加速。

## 致谢

本工作由 imec.icon RAPIDNESS 支持，由 imec 与 Flanders Innovation and Entrepreneurship 共同资助（HBC.2024.0772）。

## 图注与表注

**图 1（原文第 2 页）：** 见正文 §II 图注（波束公共多普勒预补偿几何）。

**图 2（原文第 4 页）：** 见正文 §V-B 图注（所选用估计器的测试 NMSE 随 SNR 变化，NTN-1/NTN-2 双面板）。

**图 3（原文第 5 页）：** 见正文 §V-C 图注（NTN-1 精度—尾延迟折中，FP16 推理，双平台）。

**表注汇总：** 表 I（原文第 3 页）为所比较 DL 估计器的输入（信道输入与边信息）；表 II（第 3 页）为成对 NTN 数据集配置；表 III（第 4 页）为 SNR 平均测试 NMSE 与 DL 复杂度，其表注说明 NMSE 著色以 HELENA 为参照（绿优红劣、蓝色为 HELENA）、惩罚为正表示退化；表 IV（第 5 页）为 NTN-1 FP16 部署测量与 HELENA 相对差值，其表注说明 P99 单元的绿/红表示满足/超出 0.5 ms 预算、能耗口径按平台分别比较。四张表均已在正文中逐格转录并与 PDF 渲染核对。

## 参考文献（英文原书目）

[1] 3GPP, "Study on new radio (NR) to support non-terrestrial networks," 3rd Generation Partnership Project, Tech. Rep. TR 38.811, 2020, version 15.4.0.
[2] A. K. Meshram, S. Kumar, J. Quero et al., "Reduced complexity initial synchronization for 5G NR multibeam LEO-based non-terrestrial networks," IEEE Open Journal of the Communications Society, vol. 6, pp. 1528–1551, 2025.
[3] J.-J. van de Beek, M. Sandell, and P. O. Börjesson, "ML estimation of time and frequency offset in OFDM systems," IEEE Transactions on Signal Processing, vol. 45, no. 7, pp. 1800–1805, 1997.
[4] C.-C. Chen, Y.-S. Huang, C.-L. Tu et al., "Hardware-efficient Doppler estimation and compensation in PDSCH for 5G non-terrestrial networks," in 2025 IEEE 16th International Conference on ASIC (ASICON), 2025, pp. 1–4.
[5] M. Soltani, V. Pourahmadi, A. Mirzaei et al., "Deep learning-based channel estimation," IEEE Communications Letters, vol. 23, no. 4, pp. 652–655, 2019.
[6] M. Camelo Botero, E. A. Beyazıt, N. Slamnik-Kriještorac et al., "HELENA: High-efficiency learning-based channel estimation using dual neural attention," in 2026 Joint European Conference on Networks and Communications & 6G Summit (EuCNC/6G Summit), 2026, pp. 40–45, málaga, Spain.
[7] S. J. Lee, "On the training of MIMO-OFDM channels with least square channel estimation and linear interpolation," IEEE Communications Letters, vol. 12, no. 2, pp. 100–102, 2008.
[8] O. Edfors, M. Sandell, J.-J. van de Beek et al., "OFDM channel estimation by singular value decomposition," IEEE Transactions on Communications, vol. 46, no. 7, pp. 931–939, 1998.
[9] D. Maruyama, K. Kanai, and J. Katto, "Performance evaluations of channel estimation using deep-learning based super-resolution," in 2021 IEEE 18th Annual Consumer Communications and Networking Conference (CCNC), 2021, pp. 1–6.
[10] W. Gao, W. Zhang, L. Liu et al., "Deep residual learning with attention mechanism for OFDM channel estimation," IEEE Wireless Communications Letters, vol. 14, no. 2, pp. 250–254, 2025.
[11] Y. Zhang, J. Hou, and H. Liu, "Deep learning based fully progressive image super-resolution scheme for channel estimation in OFDM systems," IEEE Transactions on Vehicular Technology, vol. 73, no. 6, pp. 9021–9025, 2024.
[12] A. Sharma, S. A. U. Haq, and S. J. Darak, "Low complexity deep learning augmented wireless channel estimation for pilot-based OFDM on Zynq system on chip," IEEE Transactions on Circuits and Systems I: Regular Papers, vol. 71, no. 5, pp. 2334–2347, 2024.
[13] F. Liu, P. Jiang, J. Zhang et al., "PD-CEViT: A novel pilot pattern design and channel estimation network for OFDM systems," IEEE Transactions on Communications, vol. 73, no. 6, pp. 4363–4377, June 2025.
[14] M. Abdollahpour, M. Bertuletti, Y. Zhang et al., "A compute & memory efficient model-driven neural 5G receiver for edge AI-assisted RAN," in IEEE Global Communications Conference (GLOBECOM), 2025, pp. 5248–5253.
[15] M. Abdollahpour, B. De Filippo, C. Amatetti et al., "On-board AI-based channel estimation for LEO NTNs," arXiv preprint arXiv:2607.15127, 2026, accepted at IEEE SPAWC 2026.
[16] Y. Li, "Pilot-symbol-aided channel estimation for OFDM in wireless systems," IEEE Transactions on Vehicular Technology, vol. 49, no. 4, pp. 1207–1215, 2000.
[17] S. A. Damjancevic, E. Matus, D. Utyansky et al., "Channel estimation for advanced 5G/6G use cases on a vector digital signal processor," IEEE Open Journal of Circuits and Systems, vol. 2, pp. 265–277, 2021.
[18] D. Won, K. Hong, D. Lee et al., "In-orbit validation of a heterogeneous COTS architecture for onboard AI: System-level operational vulnerabilities and failure pathways," International Journal of Aeronautical and Space Sciences, vol. 27, no. 4, pp. 3642–3659, Jul. 2026.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.14735v1（eess.SP，2026 年 9 月 13 日）全文 6 页：摘要、第 I—VII 节、致谢、图 1—3 图注、表 I—IV、式（1）—（6）、参考文献 [1]—[18]（英文原条目）。表格核对：用 `render.py` 渲染 PDF 第 3、4、5 页并逐格核对表 I（估计器输入）、表 II（数据集配置，含 2 GHz/51 RB/30 kHz SCS、$612\times14$、NTN-TDL-A—D、600 km、0:2:20 dB、11,264 样本等）、表 III（NMSE 与复杂度，含 HELENA −21.856/−20.866 dB 等全部数值）与表 IV（两平台延迟/能耗与相对差值）。原文 © 2026 IEEE，已按原文翻译版权声明并提示"版权与再传播许可需另行核验"；页首已列 4 处原文疑点（表 I AttRNet 换行归属、表 III 的 \* 与 † 未在表注中说明、参考文献 [6] 会议地点小写 "málaga"、式 (5) 中辅助变量 $u$ 的记号），均按原文照录并加注。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、统计量独立复算均未做）；图内曲线未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.14735v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
