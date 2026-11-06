---
layout: page
title: "面向一步 MIMO-OFDM 信道估计的一致性学习与蒸馏｜中文全文译文"
permalink: /papers/translations/2026-11-06-2611-06271-consistency-learning-distillation-one-step-mimo-ofdm/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/408544de2a359006/) · [原文 arXiv](https://arxiv.org/abs/2611.06271/) · [全部目录](/papers/catalog/)

# 面向一步 MIMO-OFDM 信道估计的一致性学习与蒸馏

**原题：** Consistency Learning and Distillation for One-Step MIMO-OFDM Channel Estimation  
**作者：** Fredrik Nguyen、Qiwen Wang（单位按 PDF 原文转写）  
**单位：** Fredrik Nguyen——瑞典斯德哥尔摩 KTH 皇家理工学院（KTH Royal Institute of Technology, Stockholm, Sweden），邮箱 `fnguyen@kth.se`；Qiwen Wang——瑞典斯德哥尔摩（Stockholm, Sweden），邮箱 `wangqiwen2008@gmail.com`。  
**版本：** arXiv:2611.06271v1（PDF 首页 arXiv 戳：arXiv:2611.06271v1 [cs.LG]，4 Nov 2026）；6 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要与索引词、第 I–VII 节全部正文与小节（§III.A–B、§IV.A–C、§V.A–D、§VI.A–C）、式 (1)–(17)（保留原文编号）、表 I–IV（逐格转写）、图 1–3 图注、致谢与声明（含 AI 使用声明）、附录（训练实现）、参考文献 [1]–[23]（英文原条目）；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

迭代式神经信道估计器可以在导频污染下改善恢复，但重复的网络评估会增加推理开销。本文为多输入多输出正交频分复用（MIMO-OFDM）系统的一步信道估计，提出观测锚定一致性（observation-anchored consistency）估计器与一致性中期训练（Consistency Mid-Training, CMT）估计器。两种估计器都在时延-波束域（delay-beam domain）中精化由导频导出的最小二乘信道估计。一致性学习把沿“含噪到干净”路径的端点预测耦合起来；CMT 则进一步精化一个经一致性训练的紧凑学生模型，使其能从中间轨迹状态预测流匹配教师的端点。在所评估的 SNR 范围内，紧凑 CMT 学生相对一步流匹配基线把未编码符号错误率（SER）降低 9.6–20.2%（在对数 SER 上为 0.44–0.98 dB），同时参数量减少 74.5%、网络乘加次数减少 73.0%。

**索引词（Index Terms）：** 信道估计（channel estimation）、MIMO-OFDM、导频污染（pilot contamination）、一致性模型（consistency models）、流匹配（flow matching）、一步推理（one-step inference）。

## I. 引言

准确的信道状态信息（CSI）是对 MIMO-OFDM 系统进行相干检测所必需的。导频辅助估计会受到热噪声以及用户以重叠导频发送所带来的干扰的影响。最小二乘（LS）估计提供了一个简单的观测 [1]，但并不能把期望信道与导频污染分离开。统计估计器与学习到的信道先验可以利用频率与空间上的结构来改善恢复 [1], [2]。

生成式方法提供了灵活的信道先验，但其推理过程往往需要重复的神经评估。流匹配学习一个时间相关的速度场 [3]，并已被应用于信道恢复与即插即用估计 [4], [5]。利用平均速度学习已经可以实现一步信道估计 [6]，而一致性先验也已被引入迭代式信道恢复 [7]。我们以匹配骨干网络与回归对照的方式，在检测层面比较端点一致性、教师轨迹监督与一步流匹配。

在一致性学习 [8], [9] 与一致性中期训练（CMT）[10] 的基础上，我们开发了仅需一次神经函数评估（NFE）即可精化受导频污染的 LS 估计的信道估计器。我们的贡献如下：

- 我们为受导频污染的 MIMO-OFDM 信道提出一种观测锚定的端点一致性估计器，强制沿“观测到干净”路径的相邻状态上的端点预测保持一致。
- 提出一个紧凑的教师轨迹学生，并将其与“从共享初始权重继续一致性训练”以及“相同学生 epoch 预算”两种对照进行比较。
- 与标准 FM 及回归对照进行匹配骨干的比较，报告归一化均方误差（NMSE）、数据符号错误率（SER），以及估计器的参数量与乘加（MAC）次数。

## II. 相关工作

近期的生成式方法学习信道分布，以支持从含噪或受污染导频进行估计。Arvinte 与 Tamir 使用基于得分的先验进行迭代式 MIMO 信道恢复 [2]。Fesl 等使用紧凑的角度域网络与按 SNR 匹配的确定性反向扩散 [11]。Zhou 等把扩散先验与近似似然得分结合起来用于导频受限的恢复 [12]。

更近期地，Liu 等学习一个“含噪到干净”的信道流 [4]，而 Zhang 与 Nadeem 把流导出的去噪用于即插即用近端梯度下降 [5]。Zhao 等把值域—零空间分解与延迟约束下的噪声感知迭代流精化结合起来 [13]。Jiang 等学习用于一步估计的平均速度场 [6]。Diff-Rx 把一步条件扩散嵌入迭代接收机，利用软数据符号反馈来精化后续信道估计 [14]。

另一条研究路线使用一致性模型把轨迹状态映射到公共端点 [8], [9]。Li 等在一个迭代式 MIMO 估计器中把导频观测更新与角度域去噪交替进行，其中使用了一致性先验 [7]。CMT 训练学生从教师求解器轨迹上的中间状态预测教师生成的端点 [10]。

## III. 系统模型与问题表述

粗体小写与大写字母分别表示向量与矩阵。范数 \(\|\cdot\|_2\) 与 \(\|\cdot\|_F\) 分别表示欧氏范数与 Frobenius 范数。

### A. 接收信号与导频投影

考虑一个多用户 MIMO-OFDM 上行链路：一个期望用户发送单个空间流、四个单流干扰用户、\(N_r=64\) 个接收端口，以及 \(K=192\) 个子载波。在子载波 \(k\) 与 OFDM 符号 \(\ell\) 处，接收向量为

$$
\mathbf{y}_{k,\ell}=\mathbf{H}_{k,\ell}x_{k,\ell}+\sum_{i=1}^{4}\mathbf{H}_{k,\ell}^{(i)}x_{k,\ell}^{(i)}+\mathbf{n}_{k,\ell},\tag{1}
$$

其中 \(x_{k,\ell}\) 是发送符号，\(\mathbf{n}_{k,\ell}\sim\mathcal{CN}(\mathbf{0},\mathbf{I})\) 表示归一化高斯噪声。期望用户信道 \(\mathbf{H}_{k,\ell}\in\mathbb{C}^{N_r\times1}\) 包含功率缩放。以归一化底层信道 \(\underline{\mathbf{H}}\) 定义 \(\mathbf{H}=\sqrt{\gamma}\,\underline{\mathbf{H}}\) 与 \(\mathbf{H}^{(i)}=\sqrt{\eta_i}\,\underline{\mathbf{H}}^{(i)}\)。这里 \(\gamma\) 与 \(\eta_i\) 控制期望信号与干扰功率相对于归一化噪声功率的大小。

每个时隙包含 14 个 OFDM 符号：两个承载解调参考信号（DMRS），十二个承载数据。DMRS 占用每隔一个子载波（Comb-2），每个导频符号占用 96 个子载波。导频功率在完整频域网格（包括未占用的梳状位置）上归一化为单位平均。在某个被占用的资源元素上，把接收向量除以已知的期望导频 \(x_{k,\ell}=p_{k,\ell}\neq0\)，得到 LS 估计

$$
\widehat{\mathbf{H}}_{k,\ell}^{\mathrm{LS}}=\mathbf{H}_{k,\ell}+\sum_{i=1}^{4}\rho_{k,\ell}^{(i)}\mathbf{H}_{k,\ell}^{(i)}+\widetilde{\mathbf{n}}_{k,\ell},\tag{2}
$$

其中 \(\rho_{k,\ell}^{(i)}=p_{k,\ell}^{(i)}/p_{k,\ell}\)、\(\widetilde{\mathbf{n}}_{k,\ell}=\mathbf{n}_{k,\ell}/p_{k,\ell}\)。位于另一梳齿上的干扰不会与期望导频子载波重叠，因此 \(\rho_{k,\ell}^{(i)}=0\)。在该配置下，每个 LS 估计中有两个干扰贡献。导频导致的噪声缩放被吸收到有效 SNR 中。干净目标是期望信道 \(\mathbf{H}\)。

### B. 表示与接收机接口

多径能量往往集中在时延与空间频率的有限区域内。You 等把角度—时延信道功率与宽带阵列信道统计联系起来 [15]。傅里叶角度—时延表示也被用于学习式 CSI 恢复 [16]。我们使用一个固定变换把这一结构暴露给估计器，同时保留全部时延-波束系数。

我们在频率方向施加 128 点正交归一逆 DFT，并在每个极化方向的 \(4\times8\) 阵列内施加二维空间 DFT。对 96 个被占用子载波做零填充，并把两个 DMRS 符号估计的实部与虚部堆叠起来，得到一个实值 \(4\times128\times64\) 输入张量：两个 DMRS 符号乘以两个实部分量。干净训练目标具有相同形状。我们把变换后的 LS 估计与干净目标记为 \(\mathbf{h}_0\) 与 \(\mathbf{h}_1\)，在学习目标中使用向量记号。网络在这些张量上运算，同时还接收上下文 \(c=\log(\mathrm{std}(\mathbf{h}_0)+10^{-6})\)，它是在全部观测条目上计算的。

反变换之后，线性频率插值恢复完整信道网格，并在频带边界处做边缘复制。对每个子载波与每个接收端口，把两个导频符号的信道估计取平均，得到用于全部十二个数据符号的一个估计。所有估计送入同一个线性最小均方误差（LMMSE）检测器。只有信道估计模块在不同方法之间变化（图 1）。

**图 1（原文 Fig. 1）：** 一步估计与评估链路。网络在一次调用中处理两个导频符号。所有估计器在检测器中都使用相同的 oracle 干扰加噪声协方差。（图中流程：接收导频 → LS 投影 → 时延-波束表示 → 端点模型（一次 NFE）→ 逆变换与插值 → 固定 LMMSE 检测器 → QPSK 判决 / 符号错误率。）

## IV. 端点一致性与 CMT

### A. 标准流匹配参考

FM 基线遵循 Liu 等的“含噪到干净”信道恢复构造 [4]，其基础是条件流匹配 [3]。我们把该构造适配到受导频污染的时延-波束观测以及本文研究的 U-Net 骨干上。

对变换后的 LS 估计及其配对的干净信道 \((\mathbf{h}_0,\mathbf{h}_1)\)，使用线性路径

$$
\mathbf{h}_t=(1-t)\mathbf{h}_0+t\mathbf{h}_1,\quad t\in[0,1].\tag{3}
$$

条件路径速度为 \(\mathbf{u}=\mathbf{h}_1-\mathbf{h}_0\)。FM 与直接回归使用同一个自适应加权的平方误差准则 [17, Sec. 4.3 and App. B.2]。该加权降低了预测误差较大的训练样本的相对影响。对逐样本 FM 误差 \(\ell_{\mathrm{FM}}=\|v_\phi(\mathbf{h}_t,t,c)-\mathbf{u}\|_2^2/D\)（其中 \(D\) 为每个样本的实值条目数），目标为

$$
\mathcal{L}_{\mathrm{FM}}=\mathbb{E}\left[\frac{\ell_{\mathrm{FM}}}{\left(\mathrm{sg}[\ell_{\mathrm{FM}}]+\epsilon\right)^p}\right],\tag{4}
$$

其中 \(\mathrm{sg}\) 表示停止梯度，\(p\) 控制加权强度，\(\epsilon>0\) 用于稳定分母。加权后的逐样本损失在一个批次上取平均。回归使用同一准则，其逐样本误差为 \(\ell_{\mathrm{reg}}=\|g_\psi(\mathbf{h}_0,c)-\mathbf{h}_1\|_2^2/D\)。FM 训练时间步服从 logit-正态分布（见附录）。一步 Euler 估计为

$$
\widehat{\mathbf{h}}_{\mathrm{FM}}=\mathbf{h}_0+v_\phi(\mathbf{h}_0,0,c).\tag{5}
$$

教师则在均匀时间网格上使用重复的 Euler 更新。

恒等式 \(\mathbf{h}_t+(1-t)\mathbf{u}=\mathbf{h}_1\) 把该路径上的速度预测与端点预测联系起来。下面的一致性目标在不同路径状态之间耦合端点预测。

### B. 观测锚定的端点一致性

我们在一致性模型的边界保持参数化与训练原则 [8], [9] 的基础上，为一步信道恢复构造一个观测锚定的端点一致性估计器：

$$
f_\theta(\mathbf{h},t,c)=c_{\mathrm{skip}}(t)\mathbf{h}+c_{\mathrm{out}}(t)F_\theta(\mathbf{h},1-t,c).\tag{6}
$$

对固定的预条件尺度 \(\sigma_d>0\)，系数为

$$
c_{\mathrm{skip}}(t)=\frac{\sigma_d^2}{(1-t)^2+\sigma_d^2},\qquad
c_{\mathrm{out}}(t)=\frac{(1-t)\sigma_d}{\sqrt{(1-t)^2+\sigma_d^2}}.\tag{7}
$$

它们在干净边界处强制 \(f_\theta(\mathbf{h},1,c)=\mathbf{h}\)。与 FM 中一样，\(t=0\) 表示含噪观测，\(t=1\) 表示干净信道。

对相邻层级 \(t_a<t_b\)，用 (3) 中的同一对样本构造两个状态。端点一致性目标为

$$
\mathcal{L}_{\mathrm{EC}}=\mathbb{E}\left[\rho_\delta\left(f_\theta(\mathbf{h}_{t_a},t_a,c)-\mathrm{sg}\left[f_\theta(\mathbf{h}_{t_b},t_b,c)\right]\right)\right],\tag{8}
$$

$$
\rho_\delta(\mathbf{z})=\sqrt{\|\mathbf{z}\|_2^2+\delta^2}-\delta.\tag{9}
$$

这里 \(\delta>0\) 是损失平滑参数。批次平均损失与分离（detached）的当前权重目标遵循改进一致性训练（iCT）[9, Secs. 3.2–3.3]。相邻状态在一个逐步细化的网格上、沿成对的“观测到干净”路径采样，从而适配 iCT 的指数区间增长课程 [9, Sec. 3.4]。一次 logit-正态抽样选出相邻对，其中较高 \(t\) 的分支在 (8) 中提供分离目标。附录给出了采样时间表。推理时，

$$
\widehat{\mathbf{h}}_{\mathrm{EC}}=f_\theta(\mathbf{h}_0,0,c),\tag{10}
$$

只需一次 NFE。

### C. 带紧凑端点学生的 CMT

学生从一个经一致性训练的检查点初始化。遵循 CMT [10]，我们冻结一个标准 FM 教师，并从观测出发构造其轨迹：

$$
\mathbf{z}_0=\mathbf{h}_0,\quad \mathbf{z}_{m+1}=\mathbf{z}_m+\frac{1}{M}v_\phi\left(\mathbf{z}_m,\frac{m}{M},c\right),\tag{11}
$$

其中 \(m=0,\ldots,M-1\)。我们沿插值后的教师轨迹，从网格中均匀采样一个非终止状态 \(\widetilde{\mathbf{z}}_t\)。遵循 CMT 的“轨迹到端点”目标 [10, Sec. 3.2]，我们使用 MSE 差异：

$$
\mathcal{L}_{\mathrm{CMT}}=\mathbb{E}_{\mathbf{h}_0,t}\left[\frac{1}{D}\left\|f_\theta(\widetilde{\mathbf{z}}_t,t,c)-\mathrm{sg}[\mathbf{z}_M]\right\|_2^2\right].\tag{12}
$$

该损失在批次与向量条目上取平均。推理时，学生利用 (10) 把含噪观测直接映射到端点；教师的中间状态只在训练期间使用。

## V. 仿真设置

### A. 信道数据

训练信道由 QuaDRiGa v2.8.1 [18], [19] 生成，基于 3GPP TR 38.901 城市宏蜂窝非视距场景 [20]。表 I 总结了物理配置。每个 UE 端口被当作一个单独的信道样本。语料包含 816,000 个快照/端口样本，按 99/1 划分为训练与验证。来自同一轨迹的样本可能同时出现在两个划分中。信道块在全部天线与子载波上联合做功率归一化，并把第一个快照的尺度复用到后续快照。

**表 I（原文 TABLE I）：** 信道与传输配置。

| 参数 | 取值 |
|---|---|
| 载波频率 | 3.5 GHz |
| 子载波数；间隔 | 192；30 kHz |
| 采样带宽 | 5.76 MHz |
| 基站阵列 | \(4\times8\) 双极化面板（64 端口） |
| UE 天线端口 | 2，交叉极化 |
| 时延扩展参考 | 363 ns |
| UE 速度 | 1 km/h |
| 期望用户；干扰用户 | 1；4 |
| 每时隙 OFDM 符号数 | 14 |
| 导频符号；占用子载波 | 2；每符号 96（Comb-2） |
| 导频/数据星座 | QPSK |

接收机评估使用一个单独的 CDL-B 测试集 [20, Sec. 7.7.1]，其物理设置见表 I。该测试集包含 1,000 个传输时间间隔（TTI），具有固定的期望用户与四个干扰用户。

### B. 训练协议

每个训练快照在一个合成时隙内保持不变。四个干扰信道从期望样本所属的划分中有放回地采样。训练期间，QPSK 导频实现从导频库中抽取；接收机评估使用固定的导频实现。表 II 列出训练设置与工作点。

**表 II（原文 TABLE II）：** 训练设置与工作点。

| 参数 | 取值 |
|---|---|
| 优化器；训练批大小 | AdamW；64 |
| 基础学习率；权重衰减 | \(2\times10^{-4}\)；\(10^{-4}\) |
| 预热 | 更新次数的 1% |
| 残差加权 \((p,\epsilon)\) | \((1,10^{-4})\) |
| 一致性 \((\sigma_d,\delta)\) | \((1.6397,10^{-4})\) |
| FM 时间高斯 \((\mu,s)\) | \((-0.4,1)\) |
| 一致性时间高斯 \((\mu,s)\) | \((1.1,2)\) |
| **训练观测** | |
| SNR（dB） | 截断正态 \(\mathcal{N}(-10,2.5^2)\)，限制在 \([-16,-4]\) |
| INR（dB） | 独立均匀 \([0,8]\) |
| **验证与接收机评估** | |
| SNR（dB） | \(-14,-12,-10,-8,-6\) |
| 接收机 INR（dB） | 5.229、5.229、5.229、1.0914 |

回归、FM 与直接一致性训练连续进行十个 epoch。CMT 从与“继续一致性训练”对照相同的第五个 epoch 一致性模型权重开始，并接受五个 CMT epoch，从而使两种学生的总 epoch 数都为十。训练后变体在 CMT 之后再用 (8) 增加五个一致性 epoch。这些预算不含教师训练与轨迹生成。

AdamW 使用常数基础学习率，并对回归、FM 与一致性训练做短暂的初始预热。加权指数 \(p=1\) 是在比较 \(p\in\{0,1\}\)（其中 \(p=0\) 即无加权 MSE）之后选定的。其他超参数通过人工实验选定。回归、FM 与一致性在评估过的非平均与指数滑动平均（EMA）两种变体中，采用验证 NMSE 最低的权重。

FM 时间采样与一致性区间选择使用表 II 中的高斯参数；附录给出其采样时间表。

CMT 把冻结教师的十步轨迹线性插值到 40 个均匀区间的网格上。每个样本向学生提供一个非终止网格状态，同一批次内使用共同的采样时间。教师端点即为其目标。

训练与验证使用由导频导出的信道样本。接收机评估额外测量数据符号检测。除十步教师参考之外，所有估计器都只使用一次网络评估。

### C. 网络架构与参考估计器

所有骨干都改造 Liu 等的残差 U-Net 用于信道估计 [4]，带有编码器—解码器跳连 [21] 以及时间/上下文嵌入。所有学习型估计器通过标量条件化嵌入接收输入的对数标准差上下文。残差块使用两个 \(3\times3\) 卷积，配合 GroupNorm 与 SiLU。所有变体都包含单头瓶颈注意力。大 U-Net 还在特征图高度 32 处施加注意力。紧凑变体缩减宽度与深度。表 III 报告参数量与 GMAC，其中包含卷积层与线性层以及两个注意力矩阵乘积。

**表 III（原文 TABLE III）：** 骨干网络与每次网络评估的开销，单位为 GMAC（\(10^9\) MAC），针对四通道 \(128\times64\) 输入。块数按每个分辨率层级计。

| 设置 | U-Net | U-Net-Lite | U-Net-Mini |
|---|---|---|---|
| 基础宽度 | 32 | 16 | 8 |
| 通道乘子 | [1, 2, 4] | [1, 1, 2] | [1, 1, 2] |
| 编码器块数 | 2 | 1 | 1 |
| 解码器块数 | 3 | 2 | 2 |
| 参数量 | 3.95 M | 193 k | 49.3 k |
| GMAC | 4.68 | 0.330 | 0.0892 |

我们用两种网络架构 U-Net-Lite 与 U-Net-Mini 评估所提出的一致性估计器，并把它们与标准 FM 进行比较。作为额外对照，使用 U-Net-Lite 实现一个不使用 FM 框架的直接回归。对 CMT，大 U-Net 作为教师，U-Net-Mini 作为学生。教师模型分别用一步与十步 Euler 评估。以 U-Net-Lite 的一步 FM 作为基线参照，用于评估紧凑 CMT 学生所取得的 SER 降低。

### D. 接收机与指标

接收机从真实缩放信道构造 oracle 干扰加噪声协方差。令 \(\mathbf{H}_{\mathrm{intf}}=[\mathbf{H}^{(1)},\ldots,\mathbf{H}^{(4)}]\)，它在全部 OFDM 符号与 48 个子载波的连续窗口上对 \(\mathbf{H}_{\mathrm{intf}}\mathbf{H}_{\mathrm{intf}}^{H}+\mathbf{I}\) 取平均。对单位平均功率数据符号与估计的期望信道 \(\widehat{\mathbf{H}}\)，LMMSE 输出为

$$
\widehat{\mathbf{x}}=\left(\widehat{\mathbf{H}}^{H}\mathbf{R}_{uu}^{-1}\widehat{\mathbf{H}}+\mathbf{I}\right)^{-1}\widehat{\mathbf{H}}^{H}\mathbf{R}_{uu}^{-1}\mathbf{y}.\tag{13}
$$

最近邻 QPSK 判决给出期望用户数据符号（不含 DMRS）上的未编码 SER \(N_{\mathrm{err}}/N_{\mathrm{sym}}\)。SER 是主要性能指标，因为它直接度量在共同检测器下的下游数据符号恢复。NMSE 则提供信道重建精度的互补度量。

对 Mini CMT 相对同一评估 SNR 下的一步 Lite FM，SER 的百分比与 dB 降低为

$$
R_{\%}=100\left(1-\frac{\mathrm{SER}_{\mathrm{CMT}}}{\mathrm{SER}_{\mathrm{FM}}}\right),\qquad
R_{\mathrm{dB}}=10\log_{10}\frac{\mathrm{SER}_{\mathrm{FM}}}{\mathrm{SER}_{\mathrm{CMT}}}.\tag{14}
$$

后者是对数 SER 降低。

信道重建在所有被占用的 Comb-2 导频子载波上评估。对 TTI \(n\) 中的参考信道矩阵与估计信道矩阵 \(\mathbf{H}_n\) 与 \(\widehat{\mathbf{H}}_n\)，合并 NMSE 为

$$
\mathrm{NMSE}_{\mathrm{dB}}=10\log_{10}\frac{\sum_{n=1}^{N_{\mathrm{TTI}}}\left\|\widehat{\mathbf{H}}_n-\mathbf{H}_n\right\|_F^2}{\sum_{n=1}^{N_{\mathrm{TTI}}}\left\|\mathbf{H}_n\right\|_F^2}.\tag{15}
$$

这里 \(N_{\mathrm{TTI}}\) 是被评估 TTI 的数量。

## VI. 结果与讨论

### A. 一致性相对标准流匹配

表 IV 与图 2 比较接收机性能。在 U-Net-Lite 下，我们的一致性估计器在 \(-10\) dB 处把未编码 SER 从 0.114 降到 0.100，相对降低 12.0%。在 U-Net-Mini 下，SER 从 0.129 降到 0.104，即 19.4%。在全部五个 SNR 上，相对匹配骨干的 FM，一致性在 U-Net-Lite 下把 SER 降低 7.5–19.0%、在 U-Net-Mini 下降低 12.1–26.4%。

在相同骨干与十 epoch 训练预算下，Lite 一致性在全部五个评估 SNR 上的 SER 都低于 Lite 回归。在 \(-10\) dB 处，SER 从 0.120 降到 0.100。回归学习直接的含噪到干净映射，而一致性训练相邻路径状态上的端点预测使其一致。这些比较提示，路径一致性可能有助于学习到的恢复映射保留对检测有用的信道信息。

### B. CMT 性能与网络开销

Mini CMT 相对 Lite FM 在 \(-14\) dB 处把 SER 从 0.367 降到 0.332，在 \(-6\) dB 处从 0.00876 降到 0.00699。在五个评估点上，相对 SER 降低为 9.6–20.2%（对数 SER 降低为 0.44–0.98 dB）。Mini CMT 在 \(-12\)、\(-10\)、\(-8\) 与 \(-6\) dB 处具有最低的一步 SER；在 \(-14\) dB 处，一步 U-Net 与 CMT 几乎持平。在共享初始化与相同学生 epoch 数下，CMT 在 \(-10\) dB 处把 Mini 一致性的 SER 降低 5.9%（0.104 到 0.0980）。

**表 IV（原文 TABLE IV）：** 全部五个评估 SNR 下的未编码 SER。粗体标出在显示精度下最低的一步 SER（含并列）。计算使用未舍入数值。十步教师单独列出。

| 估计器 | \(-14\) dB | \(-12\) dB | \(-10\) dB | \(-8\) dB | \(-6\) dB |
|---|---|---|---|---|---|
| **一步估计器（一次网络评估）** | | | | | |
| U-Net FM（1 步） | **0.332** | 0.206 | 0.100 | 0.0353 | 0.00783 |
| Lite regression | 0.363 | 0.236 | 0.120 | 0.0440 | 0.0101 |
| Lite FM | 0.367 | 0.232 | 0.114 | 0.0396 | 0.00876 |
| Mini FM | 0.401 | 0.258 | 0.129 | 0.0461 | 0.0100 |
| Ours（Lite 一致性） | 0.340 | 0.209 | 0.100 | 0.0338 | 0.00709 |
| Ours（Mini 一致性） | 0.352 | 0.217 | 0.104 | 0.0352 | 0.00738 |
| Ours（Mini CMT） | **0.332** | **0.204** | **0.0980** | **0.0333** | **0.00699** |
| Mini CMT + 后训练 | 0.343 | 0.211 | 0.101 | 0.0342 | 0.00728 |
| **迭代式教师参考** | | | | | |
| U-Net FM（10 步） | 0.312 | 0.191 | 0.0910 | 0.0308 | 0.00645 |

Mini CMT 比 Lite FM 少用 74.5% 的参数与 73.0% 的网络 MAC（表 III）。

CMT 原本用作 flow-map 后训练 [10, Sec. 3.1] 的初始化。在 CMT 之后，再增加五个一致性 epoch 会在每个评估 SNR 上提高 SER，包括在 \(-10\) dB 处从 0.0980 升到 0.101。

**图 2（原文 Fig. 2）：** 回归、FM 以及我们的一致性/CMT 估计器的未编码 SER。插图以相同的对数 SER 刻度放大虚线框区域；标记表示实测点。（图中两个面板分别为 U-Net-Lite 与 U-Net-Mini，横轴为 SNR（dB），纵轴为对数刻度的符号错误率；图例含 Lite regression、Lite FM、Ours（Lite consistency）以及 Mini FM、Ours（Mini consistency）、Ours（Mini CMT）、U-Net FM（10 steps）。）

### C. 重建误差与符号检测

信道估计 NMSE 度量重建保真度，但未必能预测下游检测错误 [22, Sec. VI-A]。因此面向应用的 MIMO 训练会考虑后续的均衡与预编码 [23]。

在我们的结果中（图 3），直接一致性在两个骨干尺寸上尽管 NMSE 高于匹配的 FM，却降低了未编码 SER。在 \(-10\) dB 处，Lite FM 与 Lite 一致性的 NMSE 分别为 \(-3.59\) 与 \(-2.38\) dB。Mini CMT 达到 \(-3.16\) dB，优于 Mini FM（\(-2.94\) dB）但不及 Lite FM。这些排序在全部五个 SNR 上保持不变。

作为说明，在 (13) 中干扰协方差固定时，对估计信道做正比例缩放会改变 NMSE，同时保持检测器输出的相位、从而保持 QPSK 硬判决不变。

**图 3（原文 Fig. 3）：** 一步估计器在导频子载波上的 NMSE。数值越低越好。（图中横轴为 SNR（dB），纵轴为 NMSE（dB）；图例含 Lite FM、Mini FM、Ours（Lite consistency）、Ours（Mini consistency）、Ours（Mini CMT）。）

## VII. 结论

观测锚定的一致性学习与教师轨迹蒸馏使导频污染下的紧凑一步信道估计成为可能。在匹配骨干下，一致性相对标准流匹配改善了下游未编码 SER，尽管信道 NMSE 更高。Mini CMT 相对一步 U-Net-Lite FM 把未编码 SER 降低 9.6–20.2%，同时使用约少 75% 的参数与少 73% 的网络 MAC。这些结果针对仿真的、受导频污染的 QPSK 与 oracle 干扰协方差。实际的协方差估计与更广泛的传播条件仍是有待进一步评估的方向。

## 致谢与声明

OpenAI ChatGPT 与 Codex 协助起草与修订摘要、第 I–VII 节与附录的文字，以及图的准备工作。作者审阅并核实了科学内容、方法与所报告的结果。

## 附录：训练实现

FM 采样 \(t=\mathrm{sigmoid}(Z)\)，其中 \(Z\sim\mathcal{N}(\mu,s^2)\)，参数见表 II。对一致性训练，\(t\) 上的均匀网格在由优化器更新次数定义的八个阶段内从 10 增到 1,280 个区间。令 \(S\) 为优化器更新总数、\(j\in\{0,\ldots,S-1\}\) 为更新索引。网格点数为

$$
N_j=1+\min\left\{1280,\,10\cdot2^{\lfloor j/K_0\rfloor}\right\},\quad K_0=\max\left\{1,\lfloor S/8\rfloor\right\}.\tag{16}
$$

配合表 II 中的一致性高斯参数，抽取 \(Z\sim\mathcal{N}(\mu,s^2)\) 并选择区间索引

$$
i=\min\left(N_j-2,\left\lfloor(N_j-1)\,\mathrm{sigmoid}(Z)\right\rfloor\right).\tag{17}
$$

其在 (8) 中的端点分别为 \(t_a=i/(N_j-1)\) 与 \(t_b=(i+1)/(N_j-1)\)。骨干接收 \(1-t\)。

## 参考文献

[1] Y. Liu, Z. Tan, H. Hu, L. J. Cimini, and G. Y. Li, "Channel estimation for OFDM," IEEE Communications Surveys & Tutorials, vol. 16, no. 4, pp. 1891–1908, 2014.

[2] M. Arvinte and J. I. Tamir, "MIMO channel estimation using score-based generative models," IEEE Transactions on Wireless Communications, vol. 22, no. 6, pp. 3698–3713, 2023.

[3] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, "Flow matching for generative modeling," in International Conference on Learning Representations, 2023.

[4] W. Liu, N. Ma, J. Chen, X. Qi, and Y. Ma, "Flow matching-based generative models for MIMO channel estimation," arXiv:2511.10941, 2025. [Online]. Available: https://arxiv.org/abs/2511.10941

[5] Y. Zhang and Q.-U.-A. Nadeem, "Channel estimation in MIMO systems using flow matching models," in IEEE International Conference on Communications (ICC), 2026, pp. 1–6. [Online]. Available: https://arxiv.org/abs/2601.13827

[6] Z. Jiang, F. Zhu, S. Jiang, C. Huang, Z. Yang, R. Jin, Z. Zhang, and M. Debbah, "One-step generative channel estimation via average velocity field," in IEEE Wireless Communications and Networking Conference (WCNC), 2026, pp. 1–5.

[7] J. Li, K. Fang, P. Yang, Z. Xiong, X. Cao, and D. O. Wu, "Adaptive plug-and-play channel estimation with consistency models for MIMO systems," arXiv:2604.23595v2, 2026. [Online]. Available: https://arxiv.org/abs/2604.23595v2

[8] Y. Song, P. Dhariwal, M. Chen, and I. Sutskever, "Consistency models," in Proceedings of the 40th International Conference on Machine Learning, ser. Proceedings of Machine Learning Research, vol. 202, 2023, pp. 32 211–32 252.

[9] Y. Song and P. Dhariwal, "Improved techniques for training consistency models," in International Conference on Learning Representations, 2024.

[10] Z. Hu, C.-H. Lai, Y. Mitsufuji, and S. Ermon, "CMT: Mid-training for efficient learning of consistency, mean flow, and flow-map models," in International Conference on Learning Representations, 2026.

[11] B. Fesl, M. Baur, F. Strasser, M. Joham, and W. Utschick, "Diffusion-based generative prior for low-complexity MIMO channel estimation," IEEE Wireless Communications Letters, vol. 13, no. 12, pp. 3493–3497, 2024.

[12] X. Zhou, L. Liang, J. Zhang, P. Jiang, Y. Li, and S. Jin, "Generative diffusion models for high dimensional channel estimation," IEEE Transactions on Wireless Communications, vol. 24, no. 7, pp. 5840–5854, 2025.

[13] J. Zhao, G. Liang, X. Liu, and D. Liu, "Null-space flow matching for MIMO channel estimation in latency-constrained systems," arXiv:2604.22005v2, 2026. [Online]. Available: https://arxiv.org/abs/2604.22005v2

[14] W. Zhou, Z. Zhang, Z. Kong, and Z. Yang, "MIMO-OFDM AI receiver based on incrementally conditioned diffusion with soft decision," arXiv:2609.25923, 2026. [Online]. Available: https://arxiv.org/abs/2609.25923v1

[15] L. You, X. Gao, A. L. Swindlehurst, and W. Zhong, "Channel acquisition for massive MIMO-OFDM with adjustable phase shift pilots," IEEE Transactions on Signal Processing, vol. 64, no. 6, pp. 1461–1476, 2016.

[16] C.-K. Wen, W.-T. Shih, and S. Jin, "Deep learning for massive MIMO CSI feedback," IEEE Wireless Communications Letters, vol. 7, no. 5, pp. 748–751, 2018.

[17] Z. Geng, M. Deng, X. Bai, J. Z. Kolter, and K. He, "Mean flows for one-step generative modeling," in Advances in Neural Information Processing Systems, vol. 38, 2025.

[18] S. Jaeckel, L. Raschkowski, K. Börner, and L. Thiele, "QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials," IEEE Transactions on Antennas and Propagation, vol. 62, no. 6, pp. 3242–3256, 2014.

[19] S. Jaeckel, L. Raschkowski, L. Thiele, F. Burkhardt, and E. Eberlein, "QuaDRiGa—quasi deterministic radio channel generator, user manual and documentation," Fraunhofer Heinrich Hertz Institute, Tech. Rep. v2.8.1, 2023.

[20] 3GPP, "Study on channel model for frequencies from 0.5 to 100 GHz," 3rd Generation Partnership Project, Technical Report 38.901, 2026, v19.2.0.

[21] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," in Medical Image Computing and Computer-Assisted Intervention (MICCAI), ser. Lecture Notes in Computer Science, vol. 9351. Springer, 2015, pp. 234–241.

[22] J. K. Tugnait, S. He, and H. Kim, "Doubly selective channel estimation using exponential basis models and subblock tracking," IEEE Transactions on Signal Processing, vol. 58, no. 3, pp. 1275–1289, 2010.

[23] D. Katselis, C. R. Rojas, M. Bengtsson, E. Björnson, X. Bombois, N. Shariati, M. Jansson, and H. Hjalmarsson, "Training sequence design for MIMO channels: An application-oriented approach," EURASIP Journal on Wireless Communications and Networking, vol. 2013, 2013, art. no. 245.

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要与索引词、第 I–VII 节正文与全部小节（§III.A–B、§IV.A–C、§V.A–D、§VI.A–C）、式 (1)–(17)（保留原文编号）、表 I–IV（逐格转写，含表 IV 的粗体标记）、图 1–3 图注（含链路框图与曲线图例）、致谢与声明（含 AI 使用声明）、附录（训练实现）、参考文献 [1]–[23]（英文原条目）；原文无编号定理/引理环境；许可：arXiv 预印本（公开可读）。**已知缺陷与核对说明：** ① pypdf 抽取把两栏文字与公式上下标打散，本页式 (1)–(17) 与表 I–IV 已按 PDF 渲染页（第 2–6 页）逐式/逐格核对；② 表 IV 粗体按原文标出在显示精度下最低的一步 SER：\(-14\) dB 处 U-Net FM(1 步) 与 Mini CMT 的 0.332 并列且均加粗，\(-10\) dB 处为 0.0980，\(-12\)、\(-8\)、\(-6\) dB 处分别为 0.204、0.0333、0.00699；③ 表 I 中“基站阵列 4×8 双极化面板（64 端口）”与“UE 天线端口 2，交叉极化”按渲染页转写；④ 正文与表 IV 的数值一致性已抽查：Lite 一致性相对 Lite FM 在 \(-10\) dB 由 0.114 降到 0.100（文中记 12.0%）、Mini 一致性由 0.129 降到 0.104（19.4%）、Mini CMT 相对 Lite FM 在 \(-14\) dB 由 0.367 降到 0.332（约 9.6%）、在 \(-6\) dB 由 0.00876 降到 0.00699（约 20.2%），均与表值相符；⑤ 图 2、图 3 为曲线图，图注按原文转写，图例与坐标轴范围按渲染页补充，未逐点核对曲线；⑥ 原文“CMT”与“一致性中期训练”在首次出现处给出全称，后文沿用缩写；⑦ 原文致谢与声明合为一节（Acknowledgment and Disclosure），本页照此结构译出。**重点核对疑点（与 Lead 提示一致）：** Mini CMT 相对一步 Lite FM 未编码 SER 降低 9.6–20.2%、参数减少 74.5%、MAC 减少 73.0%；\(-10\) dB 处 SER 0.0980 对 0.114 但 NMSE \(-3.16\) dB 对 \(-3.59\) dB；十步教师在各 SNR 上 SER 仍更低；实验条件仅为 1 km/h、QPSK、理想（oracle）干扰加噪声协方差；训练/验证划分允许同轨迹样本重叠；CMT 之后再追加一致性训练反而使 SER 升高（\(-10\) dB 由 0.0980 到 0.101）——以上均已按原文如实译出，未做修饰。逐句逐式终校未做；建议后续 QA 重点复核：式 (4) 的分母加权写法与 \(\mathrm{sg}\) 的作用范围、式 (7) 的两个系数是否与 iCT 原文一致、式 (16)–(17) 的网格与区间索引公式、以及表 II 中“接收机 INR”四个值的对应关系。

**登记（2026-11-06）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
