---
layout: page
title: "SNR 门控 LSTM 条件扩散模型用于 MIMO 信道估计｜中文全文译文"
permalink: /papers/translations/2026-11-02-2610-08977-snr-gated-lstm-conditioned-diffusion-model-for-mimo-channel-estimation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/bca80d269736373f/) · [原文 arXiv](https://arxiv.org/abs/2610.08977/) · [全部目录](/papers/catalog/)

# SNR 门控 LSTM 条件扩散模型用于 MIMO 信道估计

**原题：** SNR-Gated LSTM-Conditioned Diffusion Model for MIMO Channel Estimation  
**作者：** Jixing Zhou、Xinming Huang（单位按 PDF 原文转写）  
**单位：** Worcester Polytechnic Institute, Worcester, MA, USA（两位作者同单位）；联系邮箱：`jzhou1@wpi.edu`、`xhuang@wpi.edu`。  
**版本：** arXiv:2610.08977v1（PDF 首页 arXiv 戳：arXiv:2610.08977v1 [cs.LG]，6 Oct 2026）；5 页；已接受待刊（VTC2026-Fall，作者声明；IEEE 正式 DOI 未核实）。  
**范围与状态：** 全文中文译稿：摘要、关键词（Index Terms）、正文第 I–V 节及全部小节（§II-A–F、§III-A–B、§IV-A–B）、式 (1)–(15) 编号、算法 1（12 行逐行）、图 1–5 图注、参考文献 [1]–[15]（英文原条目），并含原文首页资助/代码脚注；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

**资助与代码（原文第 1 页脚注）：** 本工作部分由 The MathWorks Inc. 资助。实现代码见 <https://github.com/JixingZhou2/GSL-Diff>。

## 摘要

精确且低时延的信道估计对现代 MIMO 系统至关重要，在存在移动性的场景下尤其如此——此时信道呈现结构化稀疏（structured sparsity）与强时间相关性（temporal correlation）。本文提出一种面向信道估计的时间序列条件扩散（time-series conditioned diffusion）框架，在角度域（angular domain）中执行去噪。我们从最小二乘（least squares，LS）观测出发，训练一个扩散去噪器，其条件信息由长短期记忆（long short-term memory，LSTM）网络在短观测序列上编码得到，从而使模型能够利用单快照（per-snapshot）估计之外的时域动态。为了在很宽的信号噪声比（signal-to-noise ratio，SNR）范围内稳健地平衡观测保真度与学到的生成先验，我们引入一种可学习的 SNR 门控后期融合捷径（learnable SNR-gated late-fusion shortcut）：它通过一个带可训练中心与尺度的 sigmoid 门，把网络输入注入最终解码阶段。为降低推断时延，我们采用确定性的去噪扩散隐式模型（denoising diffusion implicit model，DDIM）式逆向更新，并配合 SNR 自适应的截断与步数分配；这在高 SNR 下显著减少逆向扩散步数，同时在低 SNR 区间保持强劲性能。在时变标准化信道模型上的仿真表明，所提方法相对现有基于扩散的信道估计基线取得一致的性能提升，同时通过 SNR 自适应推断保持低时延。

**关键词（Index Terms）：** MIMO、信道估计（channel estimation）、扩散模型（diffusion models）、条件扩散（conditional diffusion）、LSTM。

## I. 引言

在 5G/6G 大规模 MIMO 系统中，基站依赖准确的信道状态信息（channel state information，CSI）来实现关键的物理层功能。因此，信道估计的精度直接决定可实现的系统可靠性。在新兴的 6G 场景中，这一挑战更加突出：用户移动性增强、载波频率更高（例如 FR2/FR3）以及天线阵列规模不断增大，都会导致更强的信道时变与更短的信道相干时间。于是，如何在有限的导频开销下同时实现**高估计精度、低推断时延以及跨宽 SNR 范围的鲁棒性**，仍是无线通信中一个基础性的开放问题。

近年来，人们探索用数据驱动的深度学习方法，直接从含噪导频观测到信道估计学习一个回归映射，并在低 SNR 区间或复杂传播环境中显示出可观的增益。然而，纯判别式（discriminative）模型往往无法显式刻画底层信道分布，其性能在分布偏移（distribution shift）下可能明显退化。相比之下，扩散模型（diffusion models，DM）作为一类生成模型，能够通过迭代去噪过程学习复杂的数据分布。这一性质推动了近期关于基于扩散的信道估计的工作：它们把学到的生成先验与观测一致性结合起来，以逼近 MMSE 最优性能。现有的基于扩散的估计器通常在角度域中、针对单个信道快照运行，并把 SNR 作为条件变量或位置嵌入（positional embedding）纳入，相比传统方法取得了更好的性能与可解释性。尽管如此，仍存在两个关键局限。第一，**时间相关性未被充分利用**：现有方法大多独立处理每个时刻，未能利用时变信道中存在的强帧间（inter-frame）相关性。第二，**跨 SNR 的鲁棒性与推断时延之间存在根本性权衡**：在高 SNR 下，过强的生成先验可能造成过度平滑（over-smoothing）并降低性能；而在低 SNR 下，保持精度通常需要更多逆向扩散步数，从而导致推断时间增加。

为应对这些挑战，本文提出一种**时间序列条件扩散框架**用于信道估计，其中网络架构与推断策略被联合优化，以平衡性能与复杂度。从 LS 观测出发，先把估计信道 \(\widehat{\mathbf{H}}_{\mathrm{LS}}\) 用依赖 SNR 的方差缩放（variance scaling）做归一化，以缓解不同 SNR 下的幅度变化。随后在天线维度上施加二维离散傅里叶变换（经 FFT2 实现），把信道投影到角度域——在该域中信道表示的能量更集中、结构更稀疏，从而便于学习生成先验。采用以 3D U-Net 为主干的条件扩散去噪器，在逆向扩散过程中预测干净的角度域信道 \(\mathbf{x}_0\)。为显式利用时间相关性，引入专门的 **LSTM 条件编码器**，对一段较短的 LS 观测序列编码，并通过多尺度交叉注意力（multi-scale cross-attention）把全局与序列级的时域特征注入 U-Net。

此外，为了在宽 SNR 范围内自适应地平衡观测保真度与生成先验，我们引入一个**可学习的 SNR 门控后期融合捷径**。具体而言，网络输入 \(\mathbf{x}_{\mathrm{in}}\) 在解码器输出处被重新注入，注入强度由一个以 SNR 为参数、其中心与尺度在训练中学得的 sigmoid 门控制。该机制使模型在高 SNR 下保留细粒度的观测细节，而在低 SNR 下更多依赖生成先验，从而有效缓解过度平滑效应。最后，为满足低时延要求，采用确定性 DDIM 式逆向更新，并配合 **SNR 自适应的截断与步数分配**策略。通过把观测 SNR 与扩散调度（diffusion schedule）的有效 SNR 相匹配，为每个样本确定起始时间步 \(t_{\mathrm{start}}\)，使高 SNR 情形可以使用更少的逆向步数，同时自动为低 SNR 情形分配更多步数，以维持估计精度。

本文的主要贡献总结如下：

- 我们提出一种时间序列条件的、基于扩散的信道估计框架：它在角度域执行生成式去噪，并通过 LSTM 编码的 LS 观测序列利用时间相关性。
- 我们设计了一种可学习的 SNR 门控后期融合捷径，在宽 SNR 范围内自适应地平衡观测保真度与生成先验，改善高 SNR 区间的鲁棒性并缓解过度平滑。
- 在标准化时变信道数据集上的广泛评估表明，所提方法在 NMSE 上一致优于现有基于扩散的基线。

**图 1（原文 Fig. 1）：** 所提信道估计框架的整体工作流程。  
图面说明（据原文插图）：流程为「LS 信道观测」→「2D 酉 DFT」→「GSL-Diff 网络」（含 LSTM 条件编码器与扩散去噪器）→「2D 酉 IDFT」→ 估计出的干净信道。

## II. 所提模型：GSL-Diffusion

我们提出 **GSL-Diffusion**（Gated-Shortcut LSTM-Conditioned Diffusion Model，门控捷径 LSTM 条件扩散模型），这是一个时间序列条件的扩散估计器：它在角度域对信道去噪，并通过可学习的 SNR 门控后期融合捷径，显式地平衡观测保真度与学到的先验。

**图 2（原文 Fig. 2）：** 所提 GSL-Diffusion 的网络架构。  
图面说明（据原文插图）：输入为若干带时间标记（\(t_1,t_2,t_3\)）的信道快照，经 3D 卷积与 LSTM 条件编码器处理后，进入条件扩散模型；条件通过条件交叉注意力注入，并通过拼接（Concat）与「可学习 SNR 门控捷径」结合，最后经 3D 卷积输出估计出的干净信道。

### A. 角度域预处理

设 \(\mathbf{H}_{\mathrm{true}}[\tau]\in\mathbb{C}^{N_r\times N_t}\) 与 \(\mathbf{H}_{\mathrm{LS}}[\tau]\) 分别表示时间索引 \(\tau\in\{1,\ldots,T\}\) 处的真值信道与 LS 信道估计。我们首先施加先前的扩散估计器所用的方差归一化：

$$
\widetilde{\mathbf{H}}_{\mathrm{LS}}[\tau]=(1+\eta^{2})^{-\frac{1}{2}}\,\mathbf{H}_{\mathrm{LS}}[\tau],\qquad \eta^{2}=\frac{\kappa}{10^{\mathrm{SNR}_{\mathrm{dB}}/10}},\tag{1}
$$

其中 \(\kappa\) 是数据集噪声功率因子。然后我们使用在 \((N_r,N_t)\) 上的二维酉 FFT 变换到稀疏角度域：

$$
\mathbf{H}^{\mathrm{ang}}[\tau]=\mathcal{F}_2\{\mathbf{H}[\tau]\}.\tag{2}
$$

最后，在角度变换之后做逐样本归一化：把 \(\mathbf{H}^{\mathrm{ang}}_{\mathrm{true}}\) 与 \(\mathbf{H}^{\mathrm{ang}}_{\mathrm{LS}}\) 都除以由当前样本算出的标量 \(c=\sqrt{\mathbb{E}[\|\mathbf{H}^{\mathrm{ang}}_{\mathrm{true}}\|_2^{2}]}\)。扩散模型作用于实部–虚部堆叠（real-imag stacked）张量 \(\mathbf{x}\in\mathbb{R}^{2\times T\times N_r\times N_t}\)。

### B. 条件扩散表述

我们采用含 \(L\) 步的标准前向扩散过程：

$$
q(\mathbf{x}_t|\mathbf{x}_0)=\mathcal{N}\!\left(\sqrt{\bar{\alpha}_t}\mathbf{x}_0,\ (1-\bar{\alpha}_t)\mathbf{I}\right),\tag{3}
$$

其中 \(\bar{\alpha}_t=\prod_{i=1}^{t}(1-\beta_i)\)，\(\beta_i\) 表示第 \(i\) 步加入的方差。等价地，含噪样本可写为

$$
\mathbf{x}_t=\sqrt{\bar{\alpha}_t}\mathbf{x}_0+\sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon},\qquad \boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I}).\tag{4}
$$

我们使用归一化后的角度域 LS 观测序列作为条件，并与 SNR 一起构成

$$
\mathbf{c}\triangleq\{\mathbf{h}_{\mathrm{LS}},\mathrm{SNR}_{\mathrm{dB}}\}.\tag{5}
$$

遵循「\(\mathbf{x}_0\) 预测」参数化，去噪器 \(f_\theta\) 在条件 \(\mathbf{c}\) 下由 \((\mathbf{x}_t,t)\) 预测 \(\mathbf{x}_0\)：

$$
\widehat{\mathbf{x}}_0=f_\theta(\mathbf{x}_t,\ t,\ \mathbf{c}).\tag{6}
$$

训练目标是对 \(\mathbf{x}_0\) 的均方误差：

$$
\mathcal{L}(\theta)=\mathbb{E}_{\mathbf{x}_0,t,\boldsymbol{\epsilon}}\Big[\big\|f_\theta(\mathbf{x}_t,\ t,\ \mathbf{c})-\mathbf{x}_0\big\|_2^{2}\Big].\tag{7}
$$

### C. LSTM 条件的 3D U-Net 去噪器

GSL-Diffusion 使用在 \((T,N_r,N_t)\) 三个轴上工作的 3D U-Net 主干。条件由一个双向 LSTM 编码器从一段较短的 LS 观测序列中提取。具体而言，我们把每个 LS 帧展平并构成序列，然后施加一个输入投影以及一个隐藏大小为 512、层数为 2 的 LSTM。该编码器产生：(i) 由最终隐藏状态得到全局条件向量 \(\mathbf{c}_g\in\mathbb{R}^{256}\)；(ii) 由逐步输出得到序列条件 \(\mathbf{C}_s\in\mathbb{R}^{T\times 256}\)。扩散时间步嵌入（timestep embedding）用正弦特征计算并与 \(\mathbf{c}_g\) 融合，而 \(\mathbf{C}_s\) 通过多个 U-Net 分辨率上的交叉注意力块注入，从而实现超越单快照估计的、时间感知的去噪。

### D. 可学习的 SNR 门控后期融合捷径

一个关键设计是把网络输入注入到最后的解码阶段的**可学习** SNR 门控捷径：

$$
g(\mathrm{SNR})=\sigma\!\left(\frac{\mathrm{SNR}_{\mathrm{dB}}-\mu}{s}\right),\tag{8}
$$

其中 \(\mu\)（中心）与 \(s\)（尺度）是可训练参数，\(\sigma(\cdot)\) 为 sigmoid。设 \(\mathbf{x}_{\mathrm{in}}=[\mathbf{x}_t;\mathbf{h}_{\mathrm{LS}}]\) 表示按通道拼接（共 4 个输入通道）。我们在输出卷积之前，把 \(g(\mathrm{SNR})\cdot\mathbf{x}_{\mathrm{in}}\) 与最终解码器特征拼接。直观上，在高 SNR 下该门倾向于偏向观测保真度，而在低 SNR 下则让学到的扩散先验占主导。直观上，所提出的门实现了一种 SNR 感知的信任机制：在高 SNR 下 \(g(\mathrm{SNR})\approx 1\)，估计器因此保留观测保真度；而在低 SNR 下 \(g(\mathrm{SNR})\approx 0\)，去噪更多依赖学到的生成先验。

### E. SNR 自适应的截断 DDIM 推断

为降低时延，我们采用确定性的 DDIM 式逆向更新，并根据观测 SNR **截断**逆向轨迹。我们通过下式把观测 SNR 与扩散 SNR 调度 \(\mathrm{SNR}_{\mathrm{DM}}(t)=\bar{\alpha}_t/(1-\bar{\alpha}_t)\) 相匹配：

$$
t_{\mathrm{start}}=\arg\min_{t}\ \big|\mathrm{SNR}_{\mathrm{dB}}-\mathrm{SNR}_{\mathrm{DM},\mathrm{dB}}(t)\big|.\tag{9}
$$

随后按

$$
K=\mathrm{clip}\!\left(\left\lfloor\frac{t_{\mathrm{start}}}{L-1}K_{\mathrm{max}}\right\rfloor,\ K_{\mathrm{min}},\ K_{\mathrm{max}}\right)\tag{10}
$$

分配 DDIM 步数，并从 \(t_{\mathrm{start}}\) 到 0 生成等间隔序列。我们以 \(\mathbf{x}_{t_{\mathrm{start}}}=\mathbf{h}_{\mathrm{LS}}\)（归一化后的角度域 LS）初始化，并确定性地迭代：

$$
\widehat{\boldsymbol{\epsilon}}_t=\frac{\mathbf{x}_t-\sqrt{\bar{\alpha}_t}\,\widehat{\mathbf{x}}_0}{\sqrt{1-\bar{\alpha}_t}+\epsilon},\tag{11}
$$

$$
\mathbf{x}_{t'}=\sqrt{\bar{\alpha}_{t'}}\,\widehat{\mathbf{x}}_0+\sqrt{1-\bar{\alpha}_{t'}}\,\widehat{\boldsymbol{\epsilon}}_t,\tag{12}
$$

其中 \(t'\) 是下一个（更小的）时间步，\(\epsilon\) 是为数值稳定性引入的小常数。采样之后，我们撤销样本归一化并施加逆 FFT，得到空间域估计。

**算法 1：SNR 自适应截断 DDIM 推断**

| 行 | 算法步骤 |
|---|---|
| 1 | **输入：** 归一化角度域 LS 观测 \(\mathbf{h}_{\mathrm{LS}}\)、\(\mathrm{SNR}_{\mathrm{dB}}\)、调度 \(\{\bar{\alpha}_t\}_{t=0}^{L-1}\)、界 \([K_{\mathrm{min}},K_{\mathrm{max}}]\) |
| 2 | 计算扩散 SNR：\(\mathrm{SNR}_{\mathrm{DM}}(t)=\bar{\alpha}_t/(1-\bar{\alpha}_t)\) |
| 3 | \(t_{\mathrm{start}}\leftarrow\arg\min_{t}\big|\mathrm{SNR}_{\mathrm{dB}}-10\log_{10}(\mathrm{SNR}_{\mathrm{DM}}(t))\big|\) |
| 4 | \(K\leftarrow\mathrm{clip}\big(\mathrm{round}(\frac{t_{\mathrm{start}}}{L-1}K_{\mathrm{max}}),\ K_{\mathrm{min}},\ K_{\mathrm{max}}\big)\) |
| 5 | 由 \(t_{\mathrm{start}}\) 到 0 构造等间隔时间步序列 \(\{t_k\}_{k=0}^{K}\) |
| 6 | 初始化 \(\mathbf{x}_{t_{\mathrm{start}}}\leftarrow\mathbf{h}_{\mathrm{LS}}\) |
| 7 | **for** \(k=0,\ldots,K-1\) **do** |
| 8 | &emsp;\(\widehat{\mathbf{x}}_0\leftarrow f_\theta(\mathbf{x}_{t_k},\ t_k,\ \mathbf{h}_{\mathrm{LS}},\ \mathrm{SNR}_{\mathrm{dB}})\) |
| 9 | &emsp;\(\widehat{\boldsymbol{\epsilon}}\leftarrow(\mathbf{x}_{t_k}-\sqrt{\bar{\alpha}_{t_k}}\,\widehat{\mathbf{x}}_0)/\sqrt{1-\bar{\alpha}_{t_k}}\) |
| 10 | &emsp;\(\mathbf{x}_{t_{k+1}}\leftarrow\sqrt{\bar{\alpha}_{t_{k+1}}}\,\widehat{\mathbf{x}}_0+\sqrt{1-\bar{\alpha}_{t_{k+1}}}\,\widehat{\boldsymbol{\epsilon}}\) |
| 11 | **end for** |
| 12 | **输出：** \(\widehat{\mathbf{x}}_0\)（撤销归一化 + IFFT 回到空间域） |

### F. 实现细节

我们用 \(L=100\) 个扩散步训练 GSL-Diffusion，采用线性 \(\beta\) 调度（\(\beta_1=10^{-3}\) 到 \(\beta_L=0.08\)），并在角度域做 \(\mathbf{x}_0\) 预测。条件编码器是 2 层 bi-LSTM（隐藏大小 512），其后接一个投影，得到 256 维的全局条件与序列条件，再通过多尺度交叉注意力注入 3D U-Net。我们用 AdamW 优化（学习率 \(10^{-4}\)、权重衰减 \(10^{-4}\)），训练 200 个 epoch，批大小 32，梯度裁剪 1.0，并采用预热 + 余弦学习率调度。训练期间，我们施加复相位旋转（complex phase-rotation）与空间翻转（spatial flip）增强，以提升不变性。

## III. 数据集与评估设置

### A. 基于 QuaDRiGa 的时变 MIMO 数据集

我们在 3GPP TR 38.901 城市场景下用 QuaDRiGa 生成标准化的时变 MIMO 数据集。每个样本提供真值信道序列、物理一致的导频观测、LS 初始化，以及用于分组分析的元数据（场景/速度/多普勒）。

**1) 系统与阵列配置：** 我们考虑 \(N_{\mathrm{RX}}\times N_{\mathrm{TX}}=64\times16\) 的窄带 MIMO 链路，载频 \(f_c=6\) GHz。基站与用户设备（UE）都使用全向、单极化均匀线阵（uniform linear array，ULA），阵元间距 \(\lambda/2\)。QuaDRiGa 配置为 100 MHz 带宽，并在 \(N_{\mathrm{sc}}=N_{\mathrm{TX}}\) 个子载波上生成频率响应；我们对子载波取平均，得到等效窄带信道矩阵，从而聚焦于空间/角度域结构。

**2) 3GPP 38.901 场景（UMa/UMi，LOS/NLOS）：** 我们混合四种标准化的 3GPP 38.901 场景类型：UMa-LOS、UMa-NLOS、UMi-LOS 与 UMi-NLOS（默认比例 0.5/0.3/0.1/0.1）。UMa（Urban Macro，城市宏站）代表宏基站部署（基站高于屋顶），\(h_{\mathrm{BS}}=25\) m；UMi（Urban Micro，城市微站）代表街道级微基站部署，\(h_{\mathrm{BS}}=10\) m（所有情形下 UE 高度为 1.5 m）。UE 水平距离在依赖场景的范围内均匀采样：UMa 为 \(d_{\mathrm{2D}}\in[35,500]\) m；UMi 为 \(d_{\mathrm{2D}}\in[10,200]\) m；方位角均匀随机化，以覆盖多样的 AoA/AoD 条件。LOS 表示基站与 UE 之间存在直射路径，通常产生更强的镜面分量；NLOS 则表示直射路径被遮挡、传播由反射/绕射/散射主导，从而带来更丰富的多径与更高的衰减。在我们的数据集中，LOS/NLOS 是**通过场景类型显式选择**的，以控制组成比例（而不是依赖与距离相关的 LOS 概率）。

**3) 移动性与时间相关性：** 每个样本包含 \(T=14\) 个快照，间隔 \(\Delta t=1\) ms（在数据集张量中按时间序列存储）。UE 速度 \(v\) 从四个移动性区间 \([0.5,2]\)、\([2,10]\)、\([10,25]\)、\([25,40]\) m/s 中采样，权重为 \((0.2/0.3/0.35/0.15)\)，覆盖从步行到高移动性的情形。我们按 \(f_d=vf_c/c\) 计算多普勒频率，并启用 QuaDRiGa 的漂移（drifting）模式，以生成在快照之间平滑时变的信道。

为量化时域动态，我们计算（幅度）归一化的相邻快照相关性

$$
\bar{\rho}=\frac{1}{T-1}\sum_{t=1}^{T-1}\frac{\big|\langle\mathbf{H}_t,\mathbf{H}_{t+1}\rangle_F\big|}{\|\mathbf{H}_t\|_F\,\|\mathbf{H}_{t+1}\|_F},\tag{13}
$$

其中 \(\langle\mathbf{A},\mathbf{B}\rangle_F=\mathrm{tr}(\mathbf{A}^{H}\mathbf{B})\)。如图 3(c) 所示，\(\bar{\rho}\) 大致分布在 \([0.5,1]\) 上，但大多数样本高度相关并集中在 1 附近，表明信道以慢时变为主，同时存在不可忽略的快速变化尾部。这为 LSTM 条件的扩散估计器提供了可学习的时间结构。

**4) 导频观测与 LS 初始化：** 我们不在信道系数上直接注入噪声，而是显式仿真导频传输。设 \(\mathbf{H}_t\in\mathbb{C}^{N_{\mathrm{RX}}\times N_{\mathrm{TX}}}\) 表示快照 \(t\) 处的信道，\(\mathbf{P}\in\mathbb{C}^{N_{\mathrm{TX}}\times N_{\mathrm{TX}}}\) 表示满足 \(\mathbf{P}\mathbf{P}^{H}=\mathbf{I}\) 的酉 DFT 导频。接收到的导频观测与 LS 估计为

$$
\mathbf{Y}_t=\mathbf{H}_t\mathbf{P}+\mathbf{N}_t,\qquad \widehat{\mathbf{H}}_t^{\mathrm{LS}}=\mathbf{Y}_t\mathbf{P}^{H},\tag{14}
$$

其中 \(\mathbf{N}_t\) 的元素独立同分布，服从 \(\mathcal{CN}(0,\sigma^{2})\)。由于 \(\mathbf{P}\) 是酉的，\(\mathbf{N}_t\mathbf{P}^{H}\) 保持相同的噪声统计，从而在保持物理一致性的同时与经典 LS 建模相匹配。

**5) 数据集规模与划分：** 我们使用 50,000 个训练样本与 10,000 个测试样本。所有 \(T\) 个快照的信道都以实部/虚部形式存储，并附带 \(\mathrm{SNR}_{\mathrm{dB}}\)、速度、多普勒与场景标签。

**图 3（原文 Fig. 3）：** QuaDRiGa 数据集的分布：(a) SNR；(b) 速度；(c) 相邻快照间的时间相关系数 \(\bar{\rho}\)；(d) 场景分布。  
图面说明（据原文插图）：(a) 直方图，横轴 SNR (dB) 约 −15–30，计数 0–300；(b) 速度（图中横轴单位 km/h，约 0–150）；(c) 相关系数（约 0.5–1.0）；(d) 场景类别 UMa-L、UMa-N、UMi-L、UMi-N 的计数。

### B. 评估协议

**1) 度量：** 我们报告 NMSE（单位 dB）：

$$
\mathrm{NMSE}_{\mathrm{dB}}=10\log_{10}\!\left(\mathbb{E}\left[\frac{\|\mathbf{H}-\widehat{\mathbf{H}}\|_F^{2}}{\|\mathbf{H}\|_F^{2}}\right]\right).\tag{15}
$$

结果按 SNR 展示，并可进一步按移动性（速度/多普勒）与场景分组。

**2) 基线与计时：** 我们与 LS 及 LMMSE 基线比较，并与在相同采样策略下的扩散模型消融（不同的条件器/捷径）比较。推断时延在 GPU 上测量：先经过预热阶段，随后重复计时运行；对扩散类估计器，我们采用确定性 DDIM 式更新与 SNR 自适应步数截断，以减少高 SNR 下的采样迭代次数。

## IV. 结果

### A. NMSE 与 SNR

图 4 表明，所提出的 GSL-Diffusion 在从 −15 到 30 dB 的几乎整个 SNR 范围内取得最佳 NMSE。在**相同的**扩散去噪器主干下，把 LSTM 编码器换成 CNN 编码器会导致高 SNR 行为变差，并在约 23 dB 以上劣于可分离（separable）LMMSE。从 LSTM 条件模型中移除 SNR 门控后期融合捷径，也会使高 SNR 区间退化，并在约 26 dB 以上落后于 LMMSE。使用 SNR 门控捷径但缺少完整 LSTM 时域条件的扩散模型，则在约 28 dB 以上劣于 LMMSE。总体来看，完整的 GSL-Diffusion 一致最优，这表明**时域条件与可学习 SNR 门控捷径二者都是必要的**：既要在高 SNR 下避免过度平滑，又要在低 SNR 下保持强生成式去噪能力。

**图 4（原文 Fig. 4）：** 时变 \(64\times16\) MIMO 信道估计的 NMSE 与 SNR 关系。  
图面说明（据原文插图）：图例依次为 Proposed LSTM-Diff w/ Shortcut、LSTM-Diff w/o Shortcut、CNN-Cond Diffusion、Fesl et al. (2024)、LMMSE (Separable)、LS (Normalized)；横轴 SNR (dB) 约 −15–30，纵轴 NMSE (dB)。

### B. 推断时间与 SNR

图 5 报告了在配备 AMD 9950X CPU 与 NVIDIA RTX5090 GPU 的工作站上测得的端到端推断时延。对 \([-15,30]\) dB 内的每个 SNR 点（1 dB 分辨率），我们采用在线式（online-style）批大小 1，在预热阶段之后测量运行时间，并对 50 次重复计时运行取平均，同时做 GPU 同步以降低测量噪声。

尽管我们所提的 GSL-Diffusion 主干显著大于 Fesl 等人的轻量扩散基线，导致单步运行时间更高（同一 GPU 上单步 13.2 ms，而 Fesl 为 1.7 ms），但整体时延主要由**逆向更新的次数**而非单步代价决定。得益于 SNR 自适应截断 DDIM 策略，步数在高 SNR 下自动减少（常常达到 1 步的最小值），而仅在观测被严重污染时才分配更多步数。如图 5 的副轴所示，这种自适应分配在有利条件下带来低时延，并通过设置最大步数上限（\(K_{\mathrm{max}}\)）在强干扰/低 SNR 区间保持有界、实际可接受的时延。总体而言，所提方法取得了更好的精度–时延权衡：它容忍每次更新使用更重的去噪器，但以更少的所需更新次数来补偿，从而达到目标 NMSE。

**图 5（原文 Fig. 5）：** 推断时间与 SNR 的关系。副轴给出 SNR 自适应的 DDIM 步数。  
图面说明（据原文插图）：主图纵轴为推断时间（ms，约 0–140），图例为 Proposed (LSTM Diff) 与 Fesl et al. (2024)；副轴为 DDIM 步数（约 1–5），以阶梯线表示。

## V. 结论

本文提出了 GSL-Diffusion，一种用于 MIMO 信道估计的 SNR 自适应、时间序列条件扩散模型，它在角度域执行去噪。通过用 LSTM 编码较短的 LS 观测序列，并经多尺度条件注入 3D U-Net，所提估计器显式利用了单快照处理之外的时间相关性。我们引入可学习的 SNR 门控后期融合捷径，以自适应地在观测保真度与生成先验之间权衡，缓解高 SNR 区间的过度平滑，同时在低 SNR 下保持强去噪能力。为满足时延约束，我们进一步采用带 SNR 自适应截断与步数分配的确定性 DDIM 更新，显著减少高 SNR 下的逆向步数。在标准化时变信道数据集上的实验表明，相对 LS/LMMSE 与基于扩散的基线，所提方法取得一致的 NMSE 增益，并改善了精度–时延权衡。

## 参考文献

[1] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proc. Int. Conf. Learn. Represent. (ICLR), May 2021.

[2] S. Hochreiter and J. Schmidhuber, "Long short-term memory," Neural Comput., vol. 9, no. 8, pp. 1735–1780, Nov. 1997.

[3] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," in Proc. Int. Conf. Med. Image Comput. Comput.-Assist. Interv. (MICCAI), Munich, Germany, Oct. 2015, pp. 234–241.

[4] M. A. Mohsin et al., "Conditional prior-based non-stationary channel estimation using accelerated diffusion models," arXiv preprint arXiv:2509.15182, Sep. 2025.

[5] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Proc. Adv. Neural Inf. Process. Syst. (NeurIPS), vol. 33, Dec. 2020, pp. 6840–6851.

[6] T. Li, Y. Xin, and J. Zhang, "MoE-CE: Enhancing generalization for deep learning based channel estimation via a mixture-of-experts framework," arXiv preprint arXiv:2509.15964, Sep. 2025.

[7] N. Shazeer et al., "Outrageously large neural networks: The sparsely-gated mixture-of-experts layer," in Proc. Int. Conf. Learn. Represent. (ICLR), Apr. 2017.

[8] S. Jaeckel, L. Raschkowski, K. Börner, and L. Thiele, "QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials," IEEE Trans. Antennas Propag., vol. 62, no. 6, pp. 3242–3256, Jun. 2014.

[9] Z. Chen, H. Shin, and A. Nallanathan, "Generative diffusion model-based variational inference for MIMO channel estimation," IEEE Trans. Commun., vol. 73, no. 10, pp. 9254–9269, Oct. 2025.

[10] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Trans. Wireless Commun., vol. 24, no. 7, pp. 5840–5854, Jul. 2025.

[11] Z. Wang, F. Pu, X. Yang, N. Chen, Y. Shuai, and R. Yang, "Online LSTM-based channel estimation for HF MIMO SC-FDE system," IEEE Access, vol. 8, pp. 131005–131020, 2020.

[12] N. T. Nguyen and T. N. Do, "Generative and explainable AI for high-dimensional channel estimation," arXiv preprint arXiv:2504.10775, Apr. 2025.

[13] B. Fesl, M. Baur, F. Strasser, M. Joham, and W. Utschick, "Diffusion-based generative prior for low-complexity MIMO channel estimation," IEEE Wireless Commun. Lett., vol. 13, no. 12, pp. 3493–3497, Dec. 2024.

[14] Ö. Çiçek, A. Abdulkadir, S. S. Lienkamp, T. Brox, and O. Ronneberger, "3D U-Net: Learning dense volumetric segmentation from sparse annotation," in Proc. Int. Conf. Med. Image Comput. Comput.-Assist. Interv. (MICCAI), Athens, Greece, Oct. 2016, pp. 424–432.

[15] A. F. Molisch et al., "Hybrid beamforming for massive MIMO: A survey," IEEE Commun. Mag., vol. 55, no. 9, pp. 134–141, Sep. 2017.

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、关键词（Index Terms）、第 I–V 节及全部小节（§II-A–F、§III-A–B、§IV-A–B）、式 (1)–(15)（保留原编号）、算法 1（12 行逐行转写）、图 1–5 图注、参考文献 [1]–[15]（英文原条目），并含原文第 1 页资助/代码脚注。**原文无表格**：全文只有算法 1 与图 1–5，没有 Table，故本页不含表格逐格内容（任务模板中的“表格逐格”在本篇不适用，此处如实说明）。

核对方式：先按 pypdf 6.10.0 分页抽取文本（5 页）翻译，再把 PDF 第 1–5 页渲染为 PNG（scale=2.0）逐页逐项核对：式 (1)–(15)、算法 1 全部 12 行、图 1–5 的图注与图内图例/坐标、§III-A 的全部数值参数（\(64\times16\)、6 GHz、100 MHz、\(N_{\mathrm{sc}}=N_{\mathrm{TX}}\)、\(h_{\mathrm{BS}}=25/10\) m、\(d_{\mathrm{2D}}\) 范围、\(T=14\)、\(\Delta t=1\) ms、四个速度区间与权重 0.2/0.3/0.35/0.15、50,000/10,000 样本）、§II-F 训练超参数（\(L=100\)、\(\beta_1=10^{-3}\to\beta_L=0.08\)、2 层 bi-LSTM/512、256 维、AdamW \(10^{-4}\)/\(10^{-4}\)、200 epochs、batch 32、grad clip 1.0）、§IV-B 计时数据（13.2 ms/step 对 1.7 ms/step、AMD 9950X、RTX5090、50 次重复）。数值照抄未改。

已知缺陷与核对疑点：

1. 原文无表格；本篇只有算法 1 与图 1–5，“表格逐格”不适用，已在上文说明。
2. 式 (10) 使用下取整 \(\lfloor\cdot\rfloor\)，而算法 1 第 4 行使用 \(\mathrm{round}(\cdot)\)——两处写法在原文中不一致，本页各自照录、未统一（疑为作者笔误）。
3. §II-D 原文连续出现两次以“Intuitively, ...”引导的句子（语义相近但措辞不同），本页照译两处、未删并。
4. 图 3(b) 的横轴在原文插图中以 km/h 标注，而正文速度区间以 m/s 给出（\([0.5,2]\) 至 \([25,40]\) m/s）；本页按图照录并在图面说明中标出单位，未做换算或推测。
5. 图 1–5 为框图/直方图/曲线图，本页仅译图注，并另加一行“图面说明（据原文插图）”记录图面结构、图例与坐标范围；图 4 各方法的具体曲线数值未在正文给出，本页不臆造数值。
6. 参考文献沿用 arXiv 版条目；[4]、[6]、[12] 为 arXiv 预印本，[13] 为 IEEE WCL，均按 PDF 照录，未补 DOI 或做学术性更正。
7. 术语约定：SNR-gated＝SNR 门控；late fusion＝后期融合；DDIM＝去噪扩散隐式模型；LSTM＝长短期记忆（网络）；LS＝最小二乘；LMMSE＝线性最小均方误差；NMSE＝归一化均方误差；over-smoothing＝过度平滑；drifting mode＝漂移模式；ULA＝均匀线阵；bi-LSTM＝双向 LSTM；x₀-prediction＝\(\mathbf{x}_0\) 预测（参数化）。

**逐句逐式终校未做**，供后续 QA 重点核对：式 (3)–(12) 的扩散记号（\(\bar{\alpha}_t\)、\(\beta_i\)、\(\epsilon\) 与 \(\boldsymbol{\epsilon}\) 的区分）、算法 1 与式 (10) 的取整差异、§IV-A 的三个 dB 阈值（23/26/28 dB），以及 §IV-B 的时延数值（13.2 ms/step 对 1.7 ms/step）。

---

**登记（2026-11-02）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
