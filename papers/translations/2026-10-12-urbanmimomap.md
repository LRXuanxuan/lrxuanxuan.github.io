---
layout: page
title: "UrbanMIMOMap：具有预编码感知地图与基准的射线追踪 MIMO CSI 数据集（全文中译）"
permalink: /papers/translations/2026-10-12-urbanmimomap/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文条目](/papers/items/dbcbae770032bc6b/) · [原文 arXiv](https://arxiv.org/abs/2509.06270)

> **翻译范围：**依据上传的 arXiv:2509.06270v1（6 页），译出摘要、引言、数据集设计、应用示例、结论、全部公式与表格、图注。参考文献保留作者、出版信息与英文原题，并附中文题意。未将 PDF 图片作为大文件上传。数学表达式按原文编号整理。

# UrbanMIMOMap：具有预编码感知地图与基准的射线追踪 MIMO CSI 数据集

作者：Honggang Jia、Xiucheng Wang、Nan Cheng、Ruijin Sun、Changle Li（西安电子科技大学通信工程学院）

## 摘要

第六代（6G）系统需要由原生人工智能（AI）和通感一体化（ISAC）推动的环境感知通信。提供空间连续信道信息的无线电地图（RM）是其中的关键支撑。然而，通过电磁（EM）仿真生成高保真无线电地图真值的计算成本很高，这促使研究者采用机器学习（ML）构建无线电地图。数据驱动方法的有效性依赖大规模、高质量训练数据。现有公开数据集往往专注于单输入单输出（SISO）系统和路径损耗等有限信息，难以满足先进多输入多输出（MIMO）系统对详细信道状态信息（CSI）的要求。

为弥补这一缺口，本文提出 UrbanMIMOMap：使用高精度射线追踪生成的新型大规模城市 MIMO CSI 数据集。UrbanMIMOMap 在密集空间网格上提供完整复数 CSI 矩阵，不再局限于传统路径损耗数据。丰富的 CSI 对高保真无线电地图构建至关重要，并为包括深度学习在内的数据驱动地图生成提供基础资源。通过对典型机器学习无线电地图构建方法开展基线性能评估，我们证明了数据集的实用性。本工作为高精度地图生成、MIMO 空间性能研究和面向 6G 环境感知的机器学习提供重要数据集与基准。代码和数据：[UNIC-Lab/UrbanMIMOMap](https://github.com/UNIC-Lab/UrbanMIMOMap)。

**关键词：**6G；通感一体化；无线电地图；多输入多输出；信道状态信息。

## I. 引言

在 6G 移动通信系统中，大规模 MIMO 和超密集网络的快速发展给 CSI 获取效率带来了挑战[1][2]。特别是在超大规模 MIMO 系统中，传统导频方法的开销变得难以承受，可能降低频谱效率和自适应速度[3]。与此同时，未来 6G 空天地一体化网络要求移动节点提前预测 CSI，以优化飞行轨迹和通信过程[4][5]。此外，6G 正向 ISAC 架构演进，利用已有射频信号感知环境，而不需要专用的感知开销[6]。这些需求共同推动环境感知通信的发展，其中无线电地图作为基础工具，预期能够提供依赖于位置、无需导频的 CSI 或信道特征，从而使 6G 网络更加智能和自适应[6]。

尽管无线电地图具有潜力，准确构建地图仍然是一项重大挑战，尤其对于下一代 6G 网络。射线追踪等电磁仿真方法[7]通过详细模拟电磁波传播获得高精度，但对于大规模动态环境，计算量过于庞大。另一方面，尤其是基于深度学习的数据驱动方法[8]–[10]，可以从数据学习传播模式，因而具有更好的可扩展性；然而此类模型依赖大量、高质量且多样的训练数据。不幸的是，现有公开数据集[8][11]–[14]仍不足以满足全面的 6G 研究需求。它们通常缺少先进应用所需的亚米级空间分辨率，例如厘米级定位、精细波束管理及环境感知。此外，多数数据集只关注路径损耗之类的基本指标，并采用 SISO 配置，不能表示工作在毫米波与太赫兹频段的现代大规模 MIMO、波束赋形系统的复杂信道动态。

为解决这些局限，本文提出新型的大规模城市 MIMO 无线电地图数据集 UrbanMIMOMap。它包含具有现实感的城市布局及完整复数 CSI，从而克服现有数据集的不足。丰富的 CSI 可以计算不同物理层性能指标并构建无线电地图，例如接收信号强度（RSS）与理论信道容量。该数据集还支持包括深度学习在内的数据驱动地图生成，我们为其提供代表性神经网络模型的基线评估。主要贡献如下：

1. 提出采用高精度射线追踪生成的大规模城市 MIMO 数据集 UrbanMIMOMap。其空间分辨率达到 0.5 m，包含贴近现实的环境建模，专为先进 6G 无线通信研究设计。
2. 在每一个空间位置提供完整复数 MIMO 信道矩阵 **H**。与仅包含简单指标的数据集相比，该详细信息对高级 MIMO 分析与设计十分重要。
3. 从原始 CSI 推导关键性能指标，包括预编码感知 RSS 与理论信道容量，并针对使用本数据集构建无线电地图的典型机器学习模型建立基准性能。

## II. UrbanMIMOMap 数据集

本节先与已有公开数据集对照，说明 UrbanMIMOMap 的独特优势和创新，随后结合具体示例，详细介绍生成流程与方法。

### A. 主要特征

**表 I：与其他公开数据集的比较。**各列依次表示原始信道矩阵、亚米级精度、大规模真实场景、MIMO 支持、输出地图图像。

| 数据集 | 原始信道矩阵 | 亚米级精度 | 大型真实场景 | 支持 MIMO | 输出地图图像 |
|---|---|---|---|---|---|
| UrbanMIMOMap（本文） | ✓ | ✓ | ✓ | ✓ | ✓ |
| DeepMIMO | × | ✓ | × | ✓ | × |
| CKMImageNet | × | × | ✓ | × | ✓ |
| DataAI-6G | ✓ | ✓ | × | ✓ | × |
| M3SC | ✓ | × | ✓ | ✓ | × |
| RadioMapSeer | × | × | ✓ | × | ✓ |
| SpectrumNet | × | × | ✓ | × | ✓ |
| RadioGAT | × | × | ✓ | × | ✓ |

**MIMO 系统支持。**UrbanMIMOMap 提供 4×4 MIMO 配置。与仅提供单一信道系数 h 的 SISO 数据集不同，它提供完整信道矩阵 H。该矩阵能够自然表征由相干多径效应导致的不同天线阵元间空间相关性。单独执行多次 SISO 仿真无法准确合成这种空间相关信息，因此与 CKMImageNet[12] 等数据集相比，原生 MIMO 数据对于真实建模多天线系统必不可少。

**完整复数信道矩阵。**UrbanMIMOMap 在每个位置提供完整复数信道矩阵 H。不同于 DeepMIMO[15] 等只提供路径损耗的数据集，该矩阵保留每条链路准确的幅度与相位。相位信息反映了信号在阵列上的到达角等传播特征，是评估预编码等空间处理、计算实际 MIMO 容量以及利用信道进行感知的必要信息。因此，本数据集能够从根本上支持更高级的无线研究。

**亚米级空间分辨率。**数据集空间分辨率为 0.5 m，对 6G 精细感知与定位至关重要。与 RadioMapSeer[8]、M3SC[11] 等分辨率为 1–5 m 的数据集相比，这是显著提升。密集采样为毫米波波束管理、指纹定位等高精度算法提供坚实基础。

**以真实城市几何为基础。**数据集基于来自 OpenStreetMap 的大规模真实城市几何，包括精细的建筑物和车辆模型（图 1）。与 DeepMIMO[15] 等依赖简化场景或较小仿真区域的数据集不同，这种现实世界的复杂性有助于使训练算法适用于实际部署。

**可视化与数据驱动支持。**UrbanMIMOMap 提供预渲染、可以直接可视化的无线电地图。不同于 DeepMIMO[15]、M3SC[11] 只提供原始信道数据的方式，这些地图图像可直接作为基于图像的深度学习模型输入。本文通过 RadioUNet[8] 架构的无线电地图构建基准展示了这一点。

**灵活的参数配置。**数据集生成框架具有高度灵活性，可以生成自定义数据集。MIMO 阵列规模、工作频率、天线方向图、发射功率等关键参数均可修改。研究者由此能够分析系统参数如何影响信道及地图特性，这对于未来 6G 研究具有价值。

*图 1：仿真场景示例；上排为二维视图，下排为三维视图，包含三个不同场景。*

### B. 数据集生成流程

本节介绍仿真工具、核心 MIMO 信道综合方法以及关键参数及其选取理由。图 2 展示主要步骤。UrbanMIMOMap 主要经历以下三个阶段。

**阶段一：高精度环境建模。**根据真实地理数据（OpenStreetMap，例如安卡拉和柏林）建立高精度三维城市模型，包含建筑物（高度 6.6–19.8 m）和车辆（高度 2 m）。坐标来自处理后的 RadioMapSeer[8] 数据。图 2(a) 展示高度以颜色编码的俯视图。上述建模保证了城市多径效应的代表性，有助于准确仿真信道。

**阶段二：传播信息生成。**使用 Altair WinProp 射线追踪引擎[17]的主导路径模型（Dominant Path Model，DPM）生成传播数据，以兼顾大尺度城市区域的仿真精度与速度。智能射线追踪可以捕获更多多径细节，但代价昂贵；DPM 重点追踪主导路径，以少量简化换取更快的生成速度。基站采用各向同性发射天线，参数见表 II。WinProp 为全部 262,144 个空间点计算路径数据，例如时延、离开角（DoD）和到达角（DoA）。这些数据与天线配置无关，可供后续 MIMO 处理使用。图 2(b) 展示一个 RSS 地图实例。

**表 II：第二阶段的仿真参数。**

| 参数 | 数值 | 单位 |
|---|---:|---|
| 地图长度 | 256 | m |
| 地图宽度 | 256 | m |
| 预测高度 | 1.5 | m |
| 分辨率 | 0.5 | m |
| 建筑高度范围 | 6.6–19.8 | m |
| 车辆高度 | 2 | m |
| 发射频率 | 3500 | MHz |
| 带宽 | 50 | MHz |
| 发射功率 | 23 | dBm |
| 天线类型 | 各向同性 | — |

**阶段三：通过后处理综合 MIMO 信道矩阵。**最后通过 WinProp 的 MIMO 后处理高效综合 4×4 复数信道矩阵 H。不同于针对每对天线分别进行射线追踪的传统方法，该方法只需要一次传播路径仿真。无需重新执行射线追踪，就能快速评估不同天线方向图、配置及方向对 MIMO 性能的影响，从而提高效率和灵活性。其步骤为：

1. 导入第二阶段生成的精细传播路径信息，包含发射端位置与所有接收采样位置之间的路径。
2. 在后处理阶段指定实际 MIMO 发射端（Tx）和接收端（Rx）天线阵列，包括阵元类型、阵列几何、阵元方向图和极化方式等。
3. 根据已保存的路径信息及用户定义的 MIMO 天线特性，将每条传播路径经相应阵元的贡献进行相干求和，得到完整 MIMO 信道矩阵 H。

第三阶段的详细参数见表 III，重要参数说明如下。

**继承参数。**Tx/Rx 天线高度、载波频率和发射功率等沿用第二阶段的设置。

**天线配置。**Tx 和 Rx 均为一行四列的均匀线阵（ULA）；各阵元辐射方向图由专门的波束方向图文件定义，从而得到 4×4 MIMO 系统。框架允许不同方向图和阵列配置，最大可支持 64×64 MIMO。

**朝向及阵列参数。**发射端 ULA 使用 0°、60°、120° 三种方位角与 -10° 下倾角，接收端 ULA 为 0° 方位角和 90° 倾斜角；两端阵元间距均为 λ/2。倾角、高度、功率、频率和带宽参考城市部署建议[18]；其余采用 WinProp 默认值。

数据集在每个场景具有 262,144 个采样点，每个位置给出 4×4 复数 MIMO 信道矩阵 H。矩阵元素 Hᵢⱼ 表示发射天线 j 到接收天线 i 的复信道增益。其幅度反映路径损耗、阴影衰落和小尺度多径效应的共同作用，相位则包含由路径长度、反射/绕射相移和天线阵列因子导致的总相位旋转。

数据集由 350 个场景组成，每个场景包含 40 个发射基站，每个基站的天线阵列配置三种不同方位角，得到总计 42,000 个 NumPy 压缩文件。文件名由环境编号、发射机编号与方位角构成，如 0_5_60、0_5_120，0_5_iso 则表示各向同性天线配置。图 3 说明其目录组织方式。

**表 III：MIMO 配置参数。**

| 参数 | 端 | 本文取值 | 其他可选项 |
|---|---|---|---|
| 天线数量 | Tx/Rx | 各 4 | 1–64 |
| 阵列布局 | Tx/Rx | 线阵，1×4 ULA | 平面阵、圆阵等 |
| 天线类型 | Tx/Rx | Beams2Control4Data.ffe | 自定义方向图 |
| 极化 | Tx/Rx | 双极化 | 垂直、圆极化等 |
| 方位角 | Tx | 0°、60°、120° | 0°–360° |
| 方位角 | Rx | 0° | 0°–360° |
| 仰角倾斜 | Tx | -10° | -90°–90° |
| 仰角倾斜 | Rx | 90° | -90°–90° |
| 阵元间距 | Tx/Rx | 0.5 波长 | 以波长为单位 |
| 互耦 | Tx/Rx | 否 | 是 |
| 相干信号相加 | — | 是 | 否 |

*图 2：UrbanMIMOMap 生成流程：(a) 环境；(b) 各向同性单天线无线电地图；(c) 信道矩阵；(d) 定向天线阵列无线电地图。*

*图 3：UrbanMIMOMap 的数据结构与文件组织。*

## III. 应用实例

完整 MIMO CSI 使 UrbanMIMOMap 能够支持多种研究应用。本节给出两类主要示例。

### 实例 1：特定预编码策略下的无线电地图生成与分析

UrbanMIMOMap 的核心优势是提供完整 MIMO 信道矩阵 H，因此可以根据不同传输策略生成和分析无线电地图。这里以固定等增益传输（Fixed Equal Gain Transmission，FEGT）预编码为例。FEGT 简单而有效；与此同时，完整 CSI 还允许研究者通过后处理评估更复杂的预编码/波束赋形方法，例如迫零（ZF）。

FEGT 预编码向量为（原文式 1）：

$$
\mathbf w=\frac12[1,1,1,1]^\mathsf T. \tag{1}
$$

其中系数 1/2 保证功率归一化，即 \(\|\mathbf w\|^2=1\)。假设只传输一个符号 s，且 \(|s|^2=1\)，发送信号为 \(\mathbf x=\mathbf w s\)。接收信号为（原文式 2）：

$$
\mathbf y=\mathbf H\mathbf w s+\mathbf n. \tag{2}
$$

这里 \(\mathbf n\) 为噪声向量。在计算中忽略噪声，每个位置的接收信号功率由等效信道向量 Hw 的模平方决定（原文式 3）：

$$
P_{\rm rx}=\|\mathbf H\mathbf w\|^2\|s\|^2=\|\mathbf H\mathbf w\|^2. \tag{3}
$$

按原文的功率单位换算为 dBm（式 4）：

$$
P_{{\rm rx},{\rm dBm}}=10\log_{10}(P_{\rm rx})+30. \tag{4}
$$

之后将 dBm 单位的 RSS 线性归一化到 [0,1]，便于可视化（式 5）：

$$
P_{{\rm rx},{\rm normalized}}
=\frac{P_{{\rm rx},{\rm dBm}}-P_{\min,{\rm dBm}}}
{P_{\max,{\rm dBm}}-P_{\min,{\rm dBm}}}. \tag{5}
$$

其中 \(P_{\min,{\rm dBm}}\) 和 \(P_{\max,{\rm dBm}}\) 是整个数据集上的 RSS 最小值与最大值。图 4 对比了 FEGT-RSS 图与各向同性路径损耗图，展示天线阵列定向性的影响。利用 H 矩阵还能进一步评估各种预编码和波束赋形策略。

为证明 UrbanMIMOMap 可用于机器学习驱动的无线电地图生成，本文采用 RadioUNet[8] 执行无线电地图预测。该基线使用多通道输入张量 I，为网络提供必要的环境与配置上下文，以利于复现和进一步发展。输入为 \(4\times512\times512\) 张量，各通道如下：

- **通道 1（I₁）：**环境地图，从 256×256 通过最近邻插值上采样到 512×512；车辆信息已包含其中。
- **通道 2（I₂）：**表示发射机位置的二值地图，由 256×256 原始二值图上采样得到。原图在发射机对应像素标记 1，其余为 0。
- **通道 3（I₃）和通道 4（I₄）：**在发射机像素分别编码发射天线方位角 θₐzᵢ 的正弦和余弦，其余像素为零（原文式 6、7）：

$$
I_3(i,j)=\begin{cases}\sin(\theta_{\rm azi}),&I_2(i,j)=1,\\0,&I_2(i,j)=0,\end{cases}\tag{6}
$$

$$
I_4(i,j)=\begin{cases}\cos(\theta_{\rm azi}),&I_2(i,j)=1,\\0,&I_2(i,j)=0.\end{cases}\tag{7}
$$

利用此数据集对基线模型训练 30 个 epoch；训练集、验证集和测试集分别包含 30,000、6,000、6,000 幅图像。随后评价模型的预测能力，定量指标（NMSE、RMSE、SSIM、PSNR）见表 IV，代表性可视化见图 5。

**表 IV：RadioUNet 在 FEGT-RSS 预测上的基线性能。**

| NMSE | RMSE | SSIM | PSNR |
|---:|---:|---:|---:|
| 0.0793 | 0.1225 | 0.7989 | 18.2470 |

上述基准验证了 UrbanMIMOMap 适合训练基于深度学习的无线电地图构建模型。这一基础实现提供了初始性能参考，并指出未来研究可优化输入表示（如方位角编码）和网络架构，提高 MIMO 预测性能。此外，生成框架允许创建自定义数据集，研究天线高度、倾斜角、方向图和分辨率等参数对地图的影响（见图 6 的示例）。

*图 4：UrbanMIMOMap 的各向同性路径损耗无线电地图与 FEGT-RSS 无线电地图比较。*

*图 5：RadioUNet 对 FEGT-RSS 地图的预测示例。上排为真值地图，下排为模型预测地图；分别展示不同发射天线方位角。*

*图 6：改变仿真参数后生成的地图示例，展示空间分辨率、天线方向图、发射机高度、发射端倾角和接收端倾角的影响。这些仅为说明示例，不包含在实际发布的数据集中。*

### 实例 2：利用 CSI 数据计算和分析 MIMO 信道容量

信道容量是信息论的基础指标，用于量化理论上能够无差错传输的最高速率。UrbanMIMOMap 提供的完整 MIMO 信道矩阵 H，使研究者能够计算各空间位置的理论遍历信道容量。分析容量的空间分布可以揭示城市区域的潜在 MIMO 性能，为网络规划、资源分配和优化提供参考。

在高斯输入、\(N_t\) 个发射天线等功率分配，且接收机已知 H 的假设下，理论容量 C（单位 bit/s/Hz）计算为（原文式 8）：

$$
C=\log_2\det\left(\mathbf I_{N_r}
+\frac{\rho}{N_t}\mathbf H\mathbf H^{\mathrm H}\right). \tag{8}
$$

其中 \(\mathbf I_{N_r}\) 为 \(N_r\times N_r\) 单位矩阵，\(N_t=4\)、\(N_r=4\)，\(\mathbf H^{\mathrm H}\) 为 H 的共轭转置，\(\rho\) 表示每个接收阵元的平均信噪比。将该公式应用于所有采样点，就可以像实例 1 的 RSS 地图一样，计算和可视化信道容量地图。

## IV. 结论

本文提出了 UrbanMIMOMap，一个基于真实城市模型、通过高精度射线追踪生成的新型大规模城市 MIMO 无线电地图数据集。UrbanMIMOMap 以 0.5 m 的高空间分辨率提供完整复数 CSI 矩阵。丰富的数据不仅能够对 MIMO 信道进行详细表征、评估空间性能指标，也可以用于开发和评估数据驱动的无线电地图生成方法。对于 ISAC 这类需要精细空间信道知识的环境感知通信范式，UrbanMIMOMap 是一项重要资源。

此外，尽管采用特定城市几何可能影响训练模型向不同城市布局的泛化能力，本文提出的灵活数据生成框架允许为更广泛研究问题创建定制数据集，从而有助于缓解这一局限。

## 参考文献（编号与来源保持原文，补充中文题意）

1. E. Björnson 等，*Massive MIMO networks: Spectral, energy, and hardware efficiency*（大规模 MIMO 网络：频谱、能源与硬件效率），Foundations and Trends in Signal Processing，2017。
2. R. Sun 等，*A comprehensive survey of knowledge-driven deep learning for intelligent wireless network optimization in 6g*（面向 6G 智能无线网络优化的知识驱动深度学习综述），IEEE Communications Surveys & Tutorials，2025。
3. Z. Wang 等，*A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications*（面向 6G 的超大规模 MIMO：基础、信号处理与应用），IEEE Communications Surveys & Tutorials，2024。
4. N. Cheng 等，*Space/aerial-assisted computing offloading for IoT applications: A learning-based approach*（面向物联网的空间/空中辅助计算卸载：学习方法），IEEE JSAC，2019。
5. X. Wang 等，*Joint flying relay location and routing optimization for 6G UAV–IoT networks*（6G 无人机物联网中的飞行中继位置与路由联合优化），Remote Sensing，2022。
6. Y. Zeng 等，*A tutorial on environment-aware communications via channel knowledge map for 6G*（面向 6G 的信道知识地图环境感知通信教程），IEEE Communications Surveys & Tutorials，2024。
7. S.-H. Oh 和 N.-H. Myung，*MIMO channel estimation method using ray-tracing propagation model*（使用射线追踪传播模型的 MIMO 信道估计方法），Electronics Letters，2004。
8. R. Levie 等，*RadioUNet: Fast radio map estimation with convolutional neural networks*（RadioUNet：基于卷积网络的快速无线电地图估计），IEEE TWC，2021。
9. X. Wang 等，*RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction*（RadioDiff：用于免采样动态无线电地图构建的生成扩散模型），IEEE TCCN，2025。
10. S. Zhang 等，*RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network*（基于条件生成对抗网络的地图估计），IEEE IoT Journal，2023。
11. X. Cheng 等，*M3SC: A generic dataset for mixed multi-modal sensing and communication integration*（用于多模态感知与通信融合的通用数据集），China Communications，2023。
12. D. Wu 等，*CKMImagenet: A comprehensive dataset to enable channel knowledge map construction via computer vision*（用于计算机视觉构建 CKM 的综合数据集），ICCC Workshops，2024。
13. S. Zhang 等，*Generative AI on SpectrumNet: An open benchmark of multiband 3-D radio maps*（SpectrumNet 上的生成式人工智能：多频段三维无线电地图开放基准），IEEE TCCN，2025。
14. X. Li 等，*RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks*（RadioGAT：结合模型与数据驱动的多频段地图重建框架），IEEE TWC，2024。
15. A. Alkhateeb，*DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications*（用于毫米波和大规模 MIMO 的通用深度学习数据集），arXiv:1902.06435，2019。
16. Z. Shen 等，*DataAI–6G: A system parameters configurable channel dataset for AI-6G research*（面向 AI-6G、系统参数可配置的信道数据集），Globecom Workshops，2023。
17. R. Hoppe 等，*Wave propagation and radio network planning software WinProp added to the electromagnetic solver package FEKO*（WinProp 无线传播及网络规划软件集成至 FEKO 电磁求解套件），ACES，2017。
18. H. Tataria 等，*6G wireless systems: Vision, requirements, challenges, insights, and opportunities*（6G 无线系统的愿景、需求、挑战、认识与机遇），Proceedings of the IEEE，2021。

{% endraw %}
