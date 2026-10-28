---
layout: page
title: "面向无配对数据逆问题的重建感知分布匹配｜中文译稿（未完成）"
permalink: /papers/translations/2026-10-28-reconstruction-aware-2610-06297/
math: true
toc: true
---

[← 返回论文库](/papers/)

# 面向无配对数据逆问题的重建感知分布匹配

**原题：** Reconstruction-Aware Distribution Matching for Inverse Problems with Unpaired Data  
**作者：** Thomas Ryckeboer、Giacomo Meanti、Julien Mairal（共同贡献）。  
**原文：** https://arxiv.org/pdf/2610.06297v1（2026 年 10 月 5 日，32 页，含附录）。  
**代码：** https://github.com/inria-thoth/reconstruction-aware-distribution-matching  
**当前范围：** 正文与附录 A–E 的编号公式（1）–（70）均已补录，附有关键推导的中文说明。**附录 E 的部分图表、未编号数学表达式、参考文献与全文逐段逐字符终校仍未完成，qa_complete=false。**

## 摘要

从无配对数据中恢复成像系统的正向算子，可避免使用校准硬件，也不需要监督学习所依赖的干净图像与退化图像配对样本——对于真实镜头而言，这类配对通常难以获得。现有利用分布匹配显式估计正向算子的无配对方法，只通过候选算子生成的测量来评价它，即要求生成测量的分布与真实测量分布一致。但算子强烈抑制的信号分量在退化图像中几乎不可见，因此这类准则对算子的相应分量几乎没有约束；而反演恰恰试图恢复这些被抑制的分量。其结果是，作为正向模型几乎无法区分的两个算子，在用于反演时却可能表现出很大差异。为此，本文增加一种在干净图像侧进行比较的机制：真实退化图像经恢复后，其分布应接近干净图像的分布。恢复结果由一个以待学习算子为参数的可微即插即用算法计算。在空间变化点扩散函数（PSF）校准与盲超分辨率任务中，该方法相比仅在退化侧进行匹配能够恢复更准确的算子，并显著缩小与使用真实算子进行恢复之间的性能差距。

## 1. 引言

典型图像逆问题的目标是从测量 $y=Ax+\varepsilon$ 中恢复干净图像 $x$，其中 $A$ 表示正向算子，$\varepsilon$ 为加性噪声。许多方法假设 $A$ 已知，或能取得成对的 $(x,y)$ 样本进行监督训练。然而，即使在看似简单的场景中，这两个假设也往往难以满足。例如，当 $A$ 表示光学模糊时，准确估计 $A$ 通常需要受控采集装置，还可能需要摄影用的专用显示设备或显微成像用的微珠；每套光学系统都需要重复这一校准过程。获取真实的配对数据同样困难：即使在去噪任务中，参考图像通常也需通过对同一场景多次曝光来构建，可能产生亮度变化和亚像素不对齐。因而，很多方法依靠人工设计、包含多种退化的合成数据训练，但不能保证合成退化覆盖目标采集系统；不匹配时恢复性能会下降。

当 $A$ 未知且没有配对数据时，常用两类方法。盲方法在单幅退化图像上联合估计 $A$ 和 $x$，对干净图像和退化算子施加预先设定的先验。这类方法仅需输入退化图像 $y$，但算子先验在观察目标采集系统之前已固定，可能与其实际特性不符。无配对方法则利用来自同一系统的退化图像集合 $\mathcal Y$ 和独立的干净图像集合 $\mathcal X$，在不需要逐图对应的情况下学习两个分布之间的映射。多数方法用神经网络隐式表示退化，不能将结果直接用于其他非盲求解器。Meanti 等（2025）通过条件流匹配和分布匹配估计显式正向算子，估计结果可直接结合非盲求解器，也可用于校准。本文采用后一种研究设定。

不过，Meanti 等（2025）只通过候选算子生成的退化图像来评价它，即要求用候选 $A$ 退化干净图像所得的分布接近真实退化图像分布。当正向算子丢失信息时，这一标准可能出现问题。被 $A$ 强烈抑制的分量在退化图像中几乎不可见，因而几乎不参与对 $A$ 的约束；但重建恰恰要恢复这些分量。所以，正向测量空间中几乎不可检测的算子误差，在反演后却可能产生显著影响。在超分辨率任务中，准确的模糊模型甚至可能比复杂的图像先验更重要。由此，两个产生相似退化图像分布的算子，在重建时可能具有不同的行为。本文的目标是仅使用无配对数据，让算子估计直接感知重建质量。

**本文方法。** 在退化图像侧的比较之外，增加重建后的第二种分布比较：使用候选算子恢复真实测量，再要求恢复结果的分布接近干净图像分布。这样可以从逆问题的两个方向评估同一个候选算子：正向分支检验它能否产生正确的退化统计，重建分支检验它能否支持下游恢复。为实现端到端梯度学习，重建算法需要显式依赖候选算子，并且对算子可微。多数即插即用（plug-and-play，PnP）算法满足这些条件，因为数据保真更新显式使用算子，而固定去噪器提供图像先验。本文采用 DPIR，能以较少迭代获得较好恢复质量。

对迭代重建过程求导的代价高于对单次正向测量求导，因为它需要通过每一步深度去噪器反向传播，并保留多次推理的中间激活。为减少显存占用，本文采用截断反向传播，只让梯度穿过求解器最后若干步。第二个困难是两种目标的梯度尺度可能相差很大：测量分支只执行一次算子，重建分支则在每轮恢复迭代中使用它，因而算子的微小改变可能沿迭代过程被放大或衰减。本文采用非对称的梯度范数平衡：仅当重建梯度大于测量梯度时压低前者，避免其因数值尺度过大而主导训练。

**主要贡献。** 证明仅在退化侧进行分布匹配难以约束被算子强烈衰减的图像分量，而这类误差仍会影响重建；提出将可微 PnP 重建后的干净侧分布比较纳入无配对算子学习；在盲去模糊、空间变化 PSF 校准和盲超分辨率任务中验证更准确的算子估计与更好的下游恢复。

## 2. 相关工作：概览（待逐段补译）

无配对退化学习可通过显式算子学习，也可借助 CycleGAN、条件归一化流或传输映射进行隐式变换。本文关注能够与其他非盲求解器组合的显式正向算子。单幅图像盲重建也可以联合估计算子和图像，但当算子具有很高的维度（例如空间变化 PSF）时，单幅图像与固定先验通常不足。本文通过来自同一采集系统的一批无配对观测提供更多约束。分布匹配采用 integrated KL（IKL）与条件流匹配形成的梯度估计，重建器 DPIR 采用即插即用的半二次分裂方法。

## 3. 方法

### 问题设定

给定独立的干净图像数据集 $\mathcal X$ 与退化图像数据集 $\mathcal Y$，其分布为 $P_X$ 和 $P_Y$。假设干净数据代表真实测量背后的潜在图像分布，且

$$
Y=A_{\theta^\star}X'+\varepsilon,\qquad
X'\sim P_X,\quad \varepsilon\sim\mathcal N(0,\sigma^2I).
\tag{1}
$$

其中 $A_{\theta^\star}$ 是参数为 $\theta^\star$ 的未知正向算子。产生给定测量的干净图像 $X'$ 不可观测，因此 $\mathcal X$ 与 $\mathcal Y$ 没有逐图配对关系。对候选算子 $A_\theta$，仍可从干净数据生成合成测量：

$$
Y_\theta=A_\theta X+\varepsilon,\qquad X\sim P_X.
\tag{2}
$$

记其分布为 $P_{Y,\theta}$。若 $D$ 表示分布差异，则传统测量侧匹配目标为

$$
F(\theta)\coloneqq D(P_{Y,\theta}\Vert P_Y).
\tag{3}
$$

在模型假设成立时，真实参数 $\theta^\star$ 是 $F$ 的一个最小化点，但未必是唯一的。本文核心思想是同时用重建过程评价候选算子。令 $R_\theta(y)=R(y;A_\theta)$ 表示使用 $A_\theta$ 的非盲可微重建算法；对 $Y\sim P_Y$，恢复结果分布为 $Q_\theta=\mathrm{Law}(R_\theta(Y))$。增加干净侧匹配：

$$
L(\theta)=F(\theta)+\lambda G(\theta),\qquad
G(\theta)\coloneqq D(Q_\theta\Vert P_X).
\tag{4}
$$

$F$ 约束正向模型生成的退化统计，$G$ 则关注算子用于反演之后的效果。但即使使用真实算子，恢复图像分布也不一定与干净图像分布完全一致，因为丢失的信息和噪声无法完全恢复。因此 $G$ 通常是有偏的，应被看作对 $F$ 约束不足的算子分量施加的先验，而不是无偏的真实算子识别准则。

### 3.1 使用 IKL 进行分布匹配

对于依赖参数的分布 $P_\theta$ 与固定目标分布 $Q$，令 $Z_1(\theta)\sim P_\theta$，$Z_0\sim\mathcal N(0,I)$，并构造线性路径 $Z_t=(1-t)Z_0+tZ_1(\theta)$。条件流匹配所诱导的边缘速度场为

$$
v_P(z,t)=\mathbb E[Z_1-Z_0\mid Z_t=z].
\tag{5}
$$

采用 IKL 损失时，其梯度可写成

$$
\nabla_\theta\mathrm{IKL}(P_\theta\Vert Q)
=\int_0^1\mathbb E\!\left[
(J_\theta Z_1)^\top\!
\left(v_{P_\theta}(Z_t,t)-v_Q(Z_t,t)\right)
\right]dt.
\tag{6}
$$

目标分布 $Q$ 的速度场由预训练并冻结的教师流估计，当前模型分布 $P_\theta$ 的速度场由训练期间在线更新的辅助流估计。测量分支取 $Z_1(\theta)=A_\theta X+\varepsilon$，以真实退化图像为目标；重建分支取 $Z_1(\theta)=R_\theta(Y)$，以干净图像为目标。

### 3.2 算法

重建器选用 DPIR，即含有显式数据保真更新和固定预训练去噪器的即插即用半二次分裂求解器。执行 $K$ 轮 DPIR 迭代，只对最后 $K_{\mathrm{bp}}\le K$ 轮反向传播，从而将激活存储复杂度由 $O(K)$ 降至 $O(K_{\mathrm{bp}})$。

令两分支的随机 IKL 梯度估计为

$
g_F\simeq\nabla_\theta F(\theta_k),\qquad
g_G\simeq\nabla_\theta G(\theta_k).
\tag{7}
$

将总更新方向设置为

$$
g_k=g_F+\lambda c_kg_G,\qquad
c_k=\min\!\left(1,\frac{\|g_F\|_2}{\|g_G\|_2+\epsilon}\right).
\tag{8}
$$

当重建梯度超过测量梯度时，$c_k$ 对其进行缩放，但从不把重建梯度放大到原始尺度以上。实际使用 $\lambda=1$，以保证 $c_k\|g_G\|\le\|g_F\|$，从而使组合更新不会在一阶意义上反对 $F$ 的梯度方向。实际训练还采用重建分支权重逐渐增大及算子参数指数滑动平均等技术。

**算法 1：** 初始化候选算子、干净和退化数据对应的教师流及辅助流；反复采样两组独立数据，更新合成测量辅助流；估计测量分支梯度，运行 DPIR 并估计重建分支梯度；更新重建辅助流，根据式（8）平衡梯度并优化算子，随后施加算子约束。

## 4. 理论：为什么重建感知匹配有用

为分析一个被强烈抑制的分量，令其退化后的信噪比为 $\rho$。归一化的标量观测模型为

$$
Y_\rho=\sqrt{\rho}\,X+N,\qquad
N\sim\mathcal N(0,1),\ \mathbb E[X]=0,\ \mathbb E[X^2]=1.
\tag{9}
$$

设候选算子在该分量上的相对增益扰动为

$
\rho_\delta=\rho(1+\delta),\qquad \delta>-1.
\tag{10}
$

分析显示，当 $\rho\to0$，测量分布对相对算子误差的局部敏感性按 $\Theta(\rho^2)$ 衰减，而重建均方误差对同一扰动的敏感性按 $\Theta(\rho)$ 衰减。干净侧分布比较在低信噪比区间内仍对候选算子保持更强敏感性，但它本身存在偏差，应理解为对弱可辨识算子分量的先验选择机制，而不能理解为具有真实算子处最小值的无偏统计准则。第 4 节定理及渐近展开列于下文，完整证明仍见原文附录 D，尚待逐步翻译。

### 4.1 弱观测分量的敏感性定理

为比较不同目标函数对算子误差的敏感程度，考虑标量观测模型 $Y_\rho=\sqrt{\rho}X+N$，其中 $X$ 经过标准化满足 $\mathbb E[X]=0$、$\mathbb E[X^2]=1$，$N\sim\mathcal N(0,1)$。令相对扰动为 $\rho_\delta=\rho(1+\delta)$，$\delta>-1$。对测量侧采用普通 KL：

$$
F_\rho(\delta)=\operatorname{KL}(P_\rho\Vert P_{\rho(1+\delta)}),
\qquad
P_\gamma\coloneqq\operatorname{Law}(\sqrt\gamma X+N).
\tag{11}
$$

为了定义重建侧的风险，使用代表理想 MMSE 重建器的后验均值：

$$
\eta_\gamma(y)=
\mathbb E[X\mid\sqrt\gamma X+N=y].
\tag{12}
$$

其重建均方风险为

$$
R_\rho(\delta)=
\mathbb E[(X-\eta_{\rho(1+\delta)}(Y_\rho))^2].
\tag{13}
$$

再用二阶 Wasserstein 距离定义重建侧分布目标：

$$
G_\rho(\delta)=W_2^2(Q_{\rho,\delta},P_X),\quad
P_X=\operatorname{Law}(X),\
Q_{\rho,\delta}=\operatorname{Law}(\eta_{\rho(1+\delta)}(Y_\rho)).
\tag{14}
$$

注意，这一理论分析采用普通 KL、$W_2$ 和后验均值，是为了使敏感性分析可解析；实际算法仍使用 IKL 与 DPIR。

**定理 1（弱观测分量的敏感性）。** 假设 $X$ 有界。当 $\rho\to0$，

$$
F_\rho''(0)=\frac{\rho^2}{2}+o(\rho^2),\qquad
\left.\frac{d^2}{d\delta^2}
[R_\rho(\delta)-R_\rho(0)]\right|_{\delta=0}
=\frac{\rho}{2}+o(\rho).
\tag{15}
$$

此外，存在仅依赖 $P_X$ 的常数 $\kappa_X\in(0,1)$，使得

$$
G_\rho'(0)=-\kappa_X\sqrt{\rho}+O(\rho),\qquad
G_\rho''(0)=\frac{\kappa_X}{2}\sqrt{\rho}+O(\rho).
\tag{16}
$$

证明见原文附录 D。因为 $F_\rho$ 在真实增益对应的 $\delta=0$ 处最小，其二阶导衡量测量分布匹配对相对算子误差的局部敏感性，也可理解为单次退化观测中关于 $\delta$ 的 Fisher 信息。当 $\rho$ 很小时，测量侧信息按 $\Theta(\rho^2)$ 衰减，但相对算子错误对重建均方误差的影响仅按 $\Theta(\rho)$ 衰减。因此，退化数据几乎无法识别的算子分量，在反演过程中仍可能十分重要。

干净侧目标 $G_\rho$ 在低 SNR 时保持 $O(\sqrt{\rho})$ 量级的斜率和曲率，但必须谨慎解释：即使使用正确算子，后验均值等点估计重建器的输出分布通常也不同于真实干净图像分布，因此 $G_\rho$ 是有偏目标。它应作为对测量侧弱约束分量的先验，在测量侧几乎等价的候选算子之间进行选择，而不是被理解为必然在真实算子处取得最小值。原文附录 E.7 还测试更昂贵的无偏变体，其效果相近。

## 5. 实验

本方法在四类真实程度逐渐提高的问题上接受检验：九种不同的均匀模糊、具有明显色差的实测镜头空间变化 PSF、没有任何高分辨率真值参与训练的盲超分辨率，以及利用同一场景仅十五张照片校准真实镜头。主要对照是关闭重建分支、只进行退化侧分布匹配的方法（$\lambda=0$），然后在其余配置保持一致的条件下使用本文方法（$\lambda=1$）。不同任务采用一致的优化器、学习率、批量大小、网络和求解器设置，仅算子参数化、边界处理、噪声等设置有所不同。衡量指标包括与真实核对齐后的核平均绝对误差以及采用 DPIR 后的恢复质量。真实算子恢复作为性能参考。实验在单块 RTX 6000 Ada 或 RTX 6000 PRO 上完成。

**表 1：去模糊实验。** 均匀模糊使用 FFHQ-256 上九种退化的平均结果；实测彩色 PSF 场以 8×8 网格表示，在 76 张 DPDD 测试图像上评估。核误差为对齐 MAE（乘以 $10^{-4}$）；SSIM 见原文附录 E。

| 方法 | 均匀模糊核误差 ↓ | PSNR ↑ | LPIPS ↓ | 彩色 PSF 核误差 ↓ | PSNR ↑ | LPIPS ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Restormer | — | — | — | — | 28.57 | 0.205 |
| OmniLens | — | — | — | — | 29.06 | 0.203 |
| 仅测量匹配 | 2.16 | 31.57 | 0.110 | 8.68 | 23.85 | 0.207 |
| 本文方法 | 1.56 | 32.02 | 0.106 | 5.52 | 32.41 | 0.132 |
| 真实算子 | — | 32.18 | 0.105 | — | 35.52 | 0.111 |

### 5.1 空间均匀模糊

考虑 FFHQ-256 图像的九种退化：三种不规则运动模糊、四种解析 PSF 和两种随颜色通道变化的算子。干净和退化训练集各包含 1,000 张来自互不重叠划分的图像，噪声标准差 $\sigma=0.02$。每个算子均表示为自由参数的 33×33 卷积核；对随通道变化的退化分别使用各通道的卷积核。

重建感知匹配将平均核误差降低 28%（2.16 → 1.56），并将与真实算子恢复之间的 PSNR 差距由 0.61 dB 缩小至 0.16 dB；LPIPS 同样改善。效果并非由少数退化决定：九种退化中八种的重建得到改善（配对符号翻转检验，$p=0.008$），其中五种与真实算子恢复相差不足 0.1 dB。唯一例外是较宽的 $\sigma=3$ 高斯核，两种估计方法都损失约 0.3 dB。逐退化结果见附录 E.3。

### 5.2 具有色差的实测 PSF 场

研究一个真实大光圈镜头的 PSF 场：Canon EF 24 mm f/1.4L USM 在 f/1.4 下的实测结果，表示为 8×8 网格、每个位置 27×27 的 RGB 卷积核。靠近图像角落时，PSF 更宽、更拉长，并具有明显色差。无配对数据来自不同数据集：退化测量来自 DIV2K，干净图像来自 DPDD。

仅测量匹配在该任务中得到 23.85 dB PSNR，而本文方法为 32.41 dB，距离真实 PSF 场恢复仅约 3.1 dB。附录 E.4 的图 5 表明，仅测量匹配往往估计出过度平滑的 PSF，尤其是 PSF 最宽的图像边缘区域。这与第 4 节的分析相符：宽 PSF 强烈衰减大量信号分量，退化侧对它们约束很弱，而重建侧先验可以起作用。作为对照，监督式恢复网络 Restormer 和 OmniLens 的 PSNR 分别为 28.57 和 29.06 dB，它们直接输出重建图像而不估计显式算子。Restormer 的训练目标主要是散焦去模糊而非镜头像差；OmniLens 虽专门针对镜头像差训练，但仍没有达到使用本镜头校准算子的效果。

### 5.3 盲超分辨率

在 DIV2KRK 的 100 张图像上检验盲 $\times2$ 超分辨率，每张图像都有不同的各向异性退化核，要求仅由图像自身估计。遵循跨尺度图像块重复假设，将低分辨率图像的较小裁剪作为退化样本，将同一图像的较大裁剪作为干净样本；训练过程中不使用真实核或高分辨率真值。与 KernelGAN、监督训练的 DCLS 及 DIP-DKP 比较，而本文方法仍使用与去模糊相同的目标和恢复器，并未专门为超分辨率定制。

三个基线都偏好紧凑、近似高斯的核：DIP-DKP 从各向异性高斯族取候选核，KernelGAN 惩罚非紧凑及偏心核，DCLS 使用合成高斯核训练。为公平控制这种先验的影响，所有方法（包括本文）都使用相同的高斯后处理：核居中、边界置零，再替换成具有相同前两个矩的各向异性高斯，最后统一使用 DPIR 恢复。该后处理平均不会降低任何方法的性能，也解释了本实验的 KernelGAN 结果高于其原文报告值。未经后处理的比较见附录 E.5，本文方法同样具有最高平均 PSNR。

**表 2：DIV2KRK 盲 $\times2$ 超分辨率。** 核误差为对齐 MAE（乘以 $10^{-4}$），PSNR-Y 与 PSNR 为原文分别定义的评价量，均保持原表数值。

| 方法 | 核误差 ↓ | PSNR-Y ↑ | PSNR ↑ | SSIM ↑ | LPIPS ↓ |
|---|---:|---:|---:|---:|---:|
| KernelGAN | 3.42 | 34.22 | 32.46 | 0.8481 | 0.2714 |
| DCLS | 6.97 | 33.59 | 31.84 | 0.8160 | 0.3129 |
| DIP-DKP | 2.57 | 34.54 | 32.77 | 0.8575 | 0.2599 |
| 仅测量匹配 | 2.96 | 33.95 | 32.20 | 0.8459 | 0.2677 |
| 本文方法 | 2.15 | 34.99 | 33.21 | 0.8561 | 0.2601 |
| 真实算子 | — | 35.62 | 33.81 | 0.8724 | 0.2435 |

本文方法平均 PSNR 达到 33.21 dB，比仅测量匹配高 1.04 dB，距离真实算子为 0.6 dB；最强专用基线 DIP-DKP 距离真实算子为 1.1 dB。与 KernelGAN、DCLS 相比，本文在 100 张图像中分别有 82 和 97 张更优。与 DIP-DKP 的逐图比较接近均分（55/100），但平均增益 +0.45 dB 具有统计显著性（双侧配对置换检验，$p=2\times10^{-4}$）。这意味着本文优势主要来自减少失败样本，而不是在多数样本上均取得更大的胜出幅度。

### 5.4 真实镜头校准概念验证

最后利用同一室外纹理场景的 15 张照片校准真实镜头。使用普通相机在 f/16 拍摄七张受衍射影响而模糊的照片，构成退化集合 $\mathcal Y$；在 f/5.6 拍摄八张清晰、没有色差的中央裁剪，构成干净集合 $\mathcal X$。拍摄时改变视角和旋转方向（甚至包括倒置），保证两集合没有图像配对，也没有固定方向与某个光圈绑定。

估计包含 9×12 个位置、每个位置为 13×13 RGB 核的 PSF 场，所有核均作为自由参数。该通用模型忽略相邻 PSF 之间的依赖关系，也不使用横向色差的经典物理模型，但仍能恢复具有合理结构的 PSF 场。由于没有真实核可供比较，采用两个单幅图像方法 Eboli 等（2022）和 OmniLens 作为视觉对照。图 2 和附录 E.6 提供可视化，完整图片在补充材料中。

## 6. 结语

本文提出一种从无配对数据学习显式成像算子的方法。通过同时在正向退化及其反演后的重建空间评价同一候选算子，该方法补充了退化侧难以约束的分量。多种算子学习任务均表明，这样做通常能改善算子估计与重建质量，空间变化的高维 PSF 场中提升最显著。主要局限是额外校准成本（约为原来的六倍，见附录 E.8），以及对构建干净侧先验时所选重建算法的依赖。

## AI 使用声明（按原文补译）

作者在研究开发及稿件准备期间使用了包括 ChatGPT 和 Claude 在内的生成式 AI 工具，并按照 ICLR 2027 的作者 AI 政策披露其用途。作者说明，最初的实验代码库未借助生成式 AI 编写，随后使用 Claude Code 协助修改、调试、改进代码和运行实验；也利用大语言模型讨论、完善方法和理论分析，检查推导并改善数学论证的表述。写作方面，AI 协助起草与编辑部分文本、改善清晰度与组织结构、检查可复现细节是否遗漏，并发现潜在相关文献。文献搜索结果只作为发现线索，所有相关引用与论断均由作者对照原论文检查。作者审查并测试了 AI 辅助代码；实验结果来自代码真实运行而非语言模型生成。数学表述与推导经过作者验证，全部作者对稿件、代码、实验、数学结论和引用负责。

## 致谢

本研究获得 ERC 资助项目 101087696（APHELEIA）支持；同时获 GENCI 分配的 IDRIS HPC 计算资源，分配编号 AD011015445。



## 附录 A. 算子约束与核居中

除三种运动模糊核（见附录 E.2）外，所有基于卷积核的算子都使用本附录的居中步骤。卷积核通过 softplus 参数化约束为非负且元素和为 1，并通过居中约定消除整体平移自由度。

### A.1 参数化与平移歧义

对单个卷积核，优化不受约束张量 $\theta\in\mathbb R^{h\times w}$，并定义

$$
a_\theta=\operatorname{softplus}(\theta),\qquad
\bar k_\theta=\frac{a_\theta}{\sum_u(a_\theta)_u}.
\tag{17}
$$

因此按定义保证非负与单位和。对于多通道和空间变化算子，向每个核采用相同参数化。最终正向卷积核还要应用下述亚像素修正，并重新归一化。

如果图像块分布和测量噪声平移不变，核的平移不会改变测量分布，导致经典的盲去模糊平移歧义。与 Meanti 等（2025）相比，本文不引入额外的质心惩罚，而是在每次算子更新后显式重新居中。

### A.2 居中步骤

**稳健中心估计。** 直接使用全局质心容易受远离主要核的少量质量影响，因此使用局部均值漂移质心。先从 $\bar k_\theta$ 减去其中位数背景值，保留非负残差 $K$，以全局质心初始化 $c$，反复执行

$$
c\leftarrow
\frac{\sum_{u:\|u-c\|_\infty\le w}K_u u}
{\sum_{u:\|u-c\|_\infty\le w}K_u}.
\tag{18}
$$

采用窗口半径 $w=10$ 像素、迭代五次。局部窗口减小远离主核的残余质量的影响。

**整数居中。** 令 $\delta$ 为将 $c$ 移至核支撑集几何中心的位移，$\delta_{\mathrm{int}}$ 是四舍五入至最近整数的位移。每次更新算子后，按 $\delta_{\mathrm{int}}$ 循环平移 $\theta$。由于这是张量元素的置换，不涉及插值。Adam 的一阶、二阶动量缓冲区和算子参数的指数移动平均也执行相同的平移，避免优化器状态与被移动的核失去对齐。

**亚像素修正。** 残余位移 $\delta_{\mathrm{sub}}=\delta-\delta_{\mathrm{int}}$ 的每个坐标至多半个像素。每次前向计算时对非负预核进行双线性平移并归一化：

$$
k_\theta=
\frac{T_{\delta_{\mathrm{sub}}}a_\theta}
{\sum_u(T_{\delta_{\mathrm{sub}}}a_\theta)_u}.
\tag{19}
$$

$T_{\delta_{\mathrm{sub}}}$ 表示采用零填充的双线性平移。中心估计从计算图中分离，因此梯度通过平移后的核值传播，但不穿过居中步骤。残余平移每次前向重新计算，不写回 $\theta$，避免插值误差累积，不过非零亚像素平移会稍微平滑卷积核。

### A.3 变体与评估

**色差算子。** 如果每个颜色通道分别居中，就会消除编码色差的相对平移，因此从绿色通道估计单个位移并应用于三个通道，仅去除共同平移。

**空间变化算子。** PSF 栅格中全部核的共同位移对应前述全局歧义。实践中每个局部核都采用相同居中约定；彩色 PSF 以绿色为锚点。这也消除了通过无配对数据难以辨识的空间变化几何畸变；用于评估的真实 PSF 同样被居中。

**评估。** 先在亚像素分辨率平移估计核，使其质心与真值对齐，再计算平均绝对误差。对于色差算子，用单一通道作为对齐锚点，以确保相对通道位移仍受到误差惩罚。

## 附录 B. IKL 梯度估计器及其实现

对于分布 $P$，独立抽取 $Z_1\sim P$、$Z_0\sim\mathcal N(0,I)$，取 $t\sim\operatorname{Unif}(0,1)$，定义

$$
Z_t=(1-t)Z_0+tZ_1.
\tag{20}
$$

固定 $t$ 时，令 $P^{(t)}$ 为 $Z_t$ 的分布。积分 KL 目标 [Luo 等，2023] 为

$$
D(P\Vert Q)=\operatorname{IKL}(P\Vert Q)
=\int_0^1 w(t)\operatorname{KL}\!\left(P^{(t)}\Vert Q^{(t)}\right)\,dt.
\tag{21}
$$

$w$ 是下面指定的权重函数。条件流匹配通过

$$
\mathcal L_{\mathrm{CFM}}(v;P)=
\mathbb E\!\left[\|v(Z_t,t)-(Z_1-Z_0)\|_2^2\right]
\tag{22}
$$

训练分布 $P$ 的速度场，最优解为

$$
v_P(z,t)=\mathbb E[Z_1-Z_0\mid Z_t=z].
\tag{23}
$$

这正是式（6）中的速度场。令 $w(t)=(1-t)/t^2$，$s_P$ 为 $P^{(t)}$ 的分数函数。若目标 $Q$ 不依赖参数 $\theta$，单个 KL 项的梯度为

$$
\nabla_\theta\operatorname{KL}\!\left(P_\theta^{(t)}\Vert Q^{(t)}\right)
=\mathbb E\!\left[
(s_{P_\theta}-s_Q)(Z_t)^\top\partial_\theta Z_t
\right].
\tag{24}
$$

利用 $s_{P_\theta}-s_Q=\frac{t}{1-t}(v_{P_\theta}-v_Q)$、$\partial_\theta Z_t=tJ_\theta Z_1$，权重 $w(t)$ 与导数系数相抵消，得到正文式（6）。

**教师场与辅助场。** 对固定目标分布 $Q$，用式（22）训练教师速度场 $v^{\mathrm{tc}}$ 后冻结。当前分布 $P_\theta$ 随参数变化，用同一 CFM 目标在线训练辅助速度场 $v^{\mathrm{aux}}$。因此，$v^{\mathrm{tc}}\approx v_Q$，$v^{\mathrm{aux}}\approx v_{P_\theta}$。

对一次抽取的 $Z_1(\theta),t,Z_0$（实际对小批量求平均），梯度的随机估计为

$$
\widehat g_\theta=
(J_\theta Z_1)^\top
\left(v^{\mathrm{aux}}(Z_t,t)-v^{\mathrm{tc}}(Z_t,t)\right).
\tag{25}
$$

更新算子时，两个速度预测值都被视为与 $\theta$ 无关的常数。在自动微分中，可使用停止梯度代理目标

$$
\widehat J(\theta)=
\left\langle
\operatorname{sg}\!\left(v^{\mathrm{aux}}(Z_t,t)-v^{\mathrm{tc}}(Z_t,t)\right),
Z_1(\theta)
\right\rangle .
\tag{26}
$$

按链式法则 $\nabla_\theta\widehat J(\theta)=\widehat g_\theta$。虽然 $Z_t$ 依赖 $Z_1(\theta)$，这里仅以 $Z_t$ 查询两个速度场，更新算子时将输出分离；反之更新 $v^{\mathrm{aux}}$ 时将样本 $Z_1(\theta)$ 分离并保持 $\theta$ 固定。交替优化不会在同一次反向传播中同时更新辅助场与算子。

**两个分支。** 测量分布匹配分支使用

$$
Z_1(\theta)=A_\theta X+\varepsilon;
\tag{27}
$$

其教师场针对 $P_Y$ 训练，辅助场跟踪 $P_{Y,\theta}$。重建分布匹配分支使用

$$
Z_1(\theta)=R_\theta(Y);
\tag{28}
$$

其教师场针对 $P_X$ 训练，辅助场跟踪 $Q_\theta$。二者只有 $Z_1(\theta)$ 依赖算子参数的可微映射不同，重建分支的反向传播按第 3.2 节截断。

## 附录 C. 实现与任务相关细节

### C.1 优化细节

**重建预热。** 训练初期，$A_\theta$ 接近初始化，因而 $R_\theta(Y)$ 可能不可靠。将式（8）中的 $\lambda$ 逐步增大为

$$
\lambda(k)=\min\left(1,\frac{k}{K_{\mathrm{warm}}}\right)\lambda.
\tag{29}
$$

经过 $K_{\mathrm{warm}}$ 次算子更新后，保持目标权重不变。干净侧辅助流在此期间仍跟踪当前重建分布。

**算子平均。** 对算子参数维持指数移动平均 $\bar\theta$，使用 $A_{\bar\theta}$ 评估。居中时也移动平均参数，避免平均不同平移位置的核。

**辅助场初始化与复用。** 使用各自教师场初始化两路辅助场，$v_{\mathcal X}^{\mathrm{aux}}\leftarrow v_{\mathcal X}^{\mathrm{tc}}$、$v_{\mathcal Y}^{\mathrm{aux}}\leftarrow v_{\mathcal Y}^{\mathrm{tc}}$。更新测量侧辅助场只需合成 $A_\theta X+\varepsilon$；更新干净侧辅助场时直接复用重建梯度计算得到的 $R_\theta(Y)$，并对其停止梯度，因此每个算子更新周期只需一次重建。

### C.2 重建及数据处理

**DPIR 与截断反传。** 采用 DPIR 作为 $R_\theta$，预训练去噪器和迭代日程保持不变。在所有实验中，执行 $K=8$ 轮，仅对最后 $K_{\mathrm{bp}}=1$ 轮反向传播。对前面迭代后的状态停止梯度，然后执行最后的可微部分。数据保真度更新在可用时使用闭式近端算子，否则使用共轭梯度。

**噪声水平。** 不联合估计测量噪声和算子；仿真任务使用已知标准差，真实任务将其视为固定超参数。

**图像块与边界。** 在随机位置裁剪图像块，两分支分别退化干净图像块和重建测量图像块。默认使用复制填充；自然周期场景采用循环填充；盲超分辨率使用归一化卷积。正向算子和重建器使用相同边界约定。

**空间条件。** 除盲超分辨率外，教师和辅助速度场都根据图像块的归一化空间位置 $\ell$ 进行条件化：

$$
v(z_t,t,\ell).
\tag{30}
$$

对于空间变化退化，图像与测量分布均随位置改变，因此这一条件尤其重要；均匀退化实验也沿用该配置以保持一致。

### C.3 不同任务的正向算子

**空间变化模糊。** 将 PSF 表示为 $n_h\times n_w$ 局部核构成的栅格，通过对图像块中心进行双线性插值获得对应核。材料的非负性、归一化、居中与色差锚定见附录 A。基线与本文采用同样的核参数化和约束。




### C.3（续）盲超分辨率

盲超分辨率不按照式（2）从独立干净数据集产生合成测量，而是对观测低分辨率图像裁剪施加 $A_\theta$，把由此获得的二次退化分布匹配到同一图像更小裁剪的分布，遵循 Bell-Kligler 等（2019）的跨尺度协议。重建分支则复原较小裁剪，并将结果与尺寸为其两倍的裁剪分布匹配，把后者当作干净样本。

### C.4 初始化

无约束算子参数随机初始化。结合附录 A.1 的 softplus–归一化参数化，得到弥散的初始核，不施加预设 PSF 形状。

## 附录 D. 第 4 节的技术细节

以下推导借鉴高斯去噪 MMSE 估计理论，特别是 Guo 等（2011）。定理 1 考虑标量信道

$$
Y_\rho=\sqrt\rho X+N,\qquad
N\sim\mathcal N(0,1),\quad
\mathbb E[X]=0,\quad\mathbb E[X^2]=1.
\tag{31}
$$

$X$ 是干净信号的一个标量分量，$\rho$ 表示该分量经过正向算子和噪声后仍可观测的强度。候选信道参数取为

$$
\rho_\delta=\rho(1+\delta).
\tag{32}
$$

为后续分析定义最小均方估计器

$$
\eta_\gamma(y)=\mathbb E[X\mid \sqrt\gamma X+N=y],
\tag{33}
$$

重建分布

$$
Q_{\rho,\delta}=\operatorname{Law}\!\left(\eta_{\rho(1+\delta)}(Y_\rho)\right),
\tag{34}
$$

及其重建风险

$$
R_\rho(\delta)=
\mathbb E\!\left[\bigl(X-\eta_{\rho(1+\delta)}(Y_\rho)\bigr)^2\right].
\tag{35}
$$

### D.1 测量侧敏感性与 Fisher 信息

以 $p_\rho$ 表示 $P_\rho=\operatorname{Law}(\sqrt\rho X+N)$ 的密度。在平滑族 $\{P_\rho\}$ 中，KL 散度具有局部展开

$$
\operatorname{KL}(P_\rho\Vert P_{\rho+\Delta})
=\frac12 J(\rho)\Delta^2+o(\Delta^2),
\tag{36}
$$

其中 Fisher 信息为

$$
J(\rho)=
\mathbb E_{Y_\rho}\!\left[
\bigl(\partial_\rho\log p_\rho(Y_\rho)\bigr)^2\right].
\tag{37}
$$

相对扰动对应 $\Delta=\rho\delta$，因此

$$
F_\rho''(0)=\rho^2J(\rho).
\tag{38}
$$

低信噪比高斯信道的展开可以由高斯核直接推出：

$$
p_\rho(y)
=\mathbb E[\varphi(y-\sqrt\rho X)]
=\varphi(y)\left[1+\frac\rho2(y^2-1)+O(\rho^{3/2})\right],
\tag{39}
$$

$\varphi$ 为标准高斯密度，所以

$$
\left.\partial_\rho\log p_\rho(y)\right|_{\rho=0}
=\frac12(y^2-1),
\tag{40}
$$

从而

$$
J(0)=\frac14\mathbb E[(N^2-1)^2]=\frac12.
\tag{41}
$$

同一展开说明 $J(\rho)\to1/2$，因此

$$
F_\rho''(0)=\frac{\rho^2}{2}+o(\rho^2).
\tag{42}
$$

### D.2 低信噪比 MMSE 估计器的界

**引理 1。** 假定 $\mathbb E[X]=0$、$\mathbb E[X^2]=1$，且几乎处处 $|X|\le M$。令 $N\sim\mathcal N(0,1)$ 与 $X$ 独立。对于

$$
Y_\beta=\beta X+N,\qquad
m_\beta(y)=\mathbb E[X\mid Y_\beta=y],
$$

存在仅依赖 $M$ 的常数 $C=C(M)$，使任何 $y\in\mathbb R$、$|\beta|\le1$ 都满足

$$
|m_\beta(y)-\beta y|\le C\beta^2(1+y^2),
\tag{43}
$$

$$
|\partial_\beta m_\beta(y)-y|\le C|\beta|(1+y^2),
\tag{44}
$$

$$
|\partial_\beta^2m_\beta(y)|\le C(1+y^2).
\tag{45}
$$

**证明。** 令 $\varphi(t)=(2\pi)^{-1/2}e^{-t^2/2}$，则给定 $X=x$ 时，$Y_\beta$ 的条件密度为 $\varphi(y-\beta x)$。对有界可测函数 $f$，定义

$$
\mathbb E_{\beta,y}(f)
:=\mathbb E[f(X)\mid Y_\beta=y]
=\frac{\int f(x)\varphi(y-\beta x)\,P_X(dx)}
{\int \varphi(y-\beta x)\,P_X(dx)}.
\tag{46}
$$

记 $Z_\beta(y)=\int\exp(\beta xy-\beta^2x^2/2)\,P_X(dx)$，则

$$
\mathbb E_{\beta,y}(f)
=\frac1{Z_\beta(y)}
\int f(x)\exp\left(\beta xy-\frac{\beta^2x^2}{2}\right)P_X(dx).
\tag{47}
$$

设 $h_{\beta,y}(x):=xy-\beta x^2$。对式（47）的分子、分母求导得

$$
\begin{aligned}
\partial_\beta\mathbb E_{\beta,y}(f)
&=\mathbb E_{\beta,y}(fh_{\beta,y})
-\mathbb E_{\beta,y}(f)\mathbb E_{\beta,y}(h_{\beta,y})\\
&=\operatorname{Cov}(f(X),h_{\beta,y}(X)\mid Y_\beta=y).
\end{aligned}
\tag{48}
$$

因为 $|X|\le M$，对固定 $y$ 和 $|\beta|\le1$，积分项及其导数均被可积分函数支配，因此可在积分号内求导。

将 $f(X)=X$ 代入式（48），定义 $V_\beta(y)=\operatorname{Var}(X\mid Y_\beta=y)$、$K_\beta(y)=\operatorname{Cov}(X,X^2\mid Y_\beta=y)$，得到精确恒等式

$$
\partial_\beta m_\beta(y)=yV_\beta(y)-\beta K_\beta(y).
\tag{49}
$$

再设 $a_{j,\beta}(y)=\mathbb E[X^j\mid Y_\beta=y]$，$j=1,2,3$。由于 $|X|\le M$，有 $|a_{j,\beta}|\le M^j$，并且由式（48）及 $|yX-\beta X^2|\le M|y|+M^2$，

$$
|\partial_\beta a_{j,\beta}(y)|
\le C(1+|y|),\qquad j=1,2,3.
\tag{50}
$$

注意 $V_\beta=a_{2,\beta}-a_{1,\beta}^2$、$K_\beta=a_{3,\beta}-a_{1,\beta}a_{2,\beta}$。调整常数 $C$ 后可得

$$
|K_\beta(y)|\le C,\qquad
|\partial_\beta V_\beta(y)|+|\partial_\beta K_\beta(y)|
\le C(1+|y|).
\tag{51}
$$

对式（49）再求导，利用式（51）及 $|y|\le(1+y^2)/2$，即可证明式（45）。在 $\beta=0$ 时 $Y_0=N$ 与 $X$ 独立，故 $m_0(y)=0$、$V_0(y)=1$，以及 $\left.\partial_\beta m_\beta(y)\right|_{\beta=0}=y$。先对式（45）积分得到式（44），再积分一次得到式（43），证毕。

### D.3 算子错误对重建的影响

式（33）的后验均值是高斯信道的最小 MSE 估计器。由于 $\eta_\rho(Y_\rho)=\mathbb E[X\mid Y_\rho]$ 是 $X$ 在 $Y_\rho$ 可测函数空间上的 $L^2$ 正交投影，得到

$$
R_\rho(\delta)-R_\rho(0)
=\mathbb E\!\left[
\bigl(\eta_{\rho(1+\delta)}(Y_\rho)-\eta_\rho(Y_\rho)\bigr)^2
\right].
\tag{52}
$$

令 $b=\sqrt\rho$，并沿用前一节记号 $m_b(y)=\mathbb E[X\mid bX+N=y]$。引理 1 给出

$$
|m_b(y)-by|\le Cb^2(1+y^2).
\tag{53}
$$

扰动后的幅度为 $b_\delta=b\sqrt{1+\delta}$，故

$$
\left.\partial_\delta m_{b_\delta}(y)\right|_{\delta=0}
=\frac b2\,\partial_bm_b(y).
\tag{54}
$$

在 $\delta=0$ 时式（52）的被积函数为零。由引理 1 及 $Y_\rho$ 的有限四阶矩，可在期望号内求二阶导，得

$$
\left.\frac{d^2}{d\delta^2}[R_\rho(\delta)-R_\rho(0)]
\right|_{\delta=0}
=\frac\rho2\,
\mathbb E\!\left[(\partial_bm_b(Y_\rho))^2\right].
\tag{55}
$$

由引理 1，$|\partial_bm_b(y)-y|\le Cb(1+y^2)$。取 $y=Y_\rho=N+bX$ 后，使用 $X$ 有界、$N$ 高斯以及三角不等式可得 $\|\partial_bm_b(Y_\rho)-N\|_2=O(b)$，因此期望 $\mathbb E[(\partial_bm_b(Y_\rho))^2]\to \mathbb E[N^2]=1$，最终

$$
\left.\frac{d^2}{d\delta^2}[R_\rho(\delta)-R_\rho(0)]
\right|_{\delta=0}
=\frac\rho2+o(\rho).
\tag{56}
$$

### D.4 可观测干净侧目标的敏感性

现在分析重建侧目标

$$
G_\rho(\delta)=W_2^2(Q_{\rho,\delta},P_X).
\tag{57}
$$

其中 $P_X=\operatorname{Law}(X)$ 为干净分布。接下来研究在低 SNR 时，候选算子扰动如何影响该距离。




### D.4（续）用分位数表示损失

首先注意 MMSE 估计器关于观测 $y$ 单调不减。根据 Dytso 等（2023）的命题 1，

$$
\eta_\gamma'(y)
=\sqrt\gamma\,\operatorname{Var}(X\mid\sqrt\gamma X+N=y)
\ge0.
\tag{58}
$$

沿用 $b=\sqrt\rho$ 和 $m_\beta(y)=\eta_{\beta^2}(y)$，令 $F_X,F_{Y_\rho}$ 分别为干净信号与观测的累积分布函数，定义广义分位函数

$$
x(u)=F_X^{-1}(u),\qquad
y_b(u)=F_{Y_\rho}^{-1}(u).
\tag{59}
$$

由于 $m_{b\sqrt{1+\delta}}$ 单调不减，应用于 $Y_\rho$ 的第 $u$ 个分位点，所得正是重建分布的第 $u$ 个分位点，因此几乎对所有 $u\in(0,1)$，

$$
F_{Q_{\rho,\delta}}^{-1}(u)
=m_{b\sqrt{1+\delta}}(y_b(u)).
\tag{60}
$$

由一维 Wasserstein 距离的分位数公式，

$$
G_\rho(\delta)=
\int_0^1
\left(x(u)-m_{b\sqrt{1+\delta}}(y_b(u))\right)^2\,du.
\tag{61}
$$

该公式直接比较干净分布与重建分布的对应分位点。

**低 SNR 分析。** 记 $z_\delta(u):=m_{b\sqrt{1+\delta}}(y_b(u))$，则 $G_\rho(\delta)=\|x-z_\delta\|_2^2$，$\|\cdot\|_2$ 是 $L^2(0,1)$ 范数。$y_b$ 依赖真实信道幅度 $b$，但不依赖 $\delta$。对 $\delta$ 使用链式法则，

$$
z'_0(u)=\frac b2\left.\partial_\beta m_\beta(y_b(u))\right|_{\beta=b},
\qquad
z''_0(u)=\frac{b^2}{4}
\left.\partial_\beta^2m_\beta(y_b(u))\right|_{\beta=b}
-\frac b4\left.\partial_\beta m_\beta(y_b(u))\right|_{\beta=b}.
$$

引理 1 的误差界，以及 $Y_\rho=N+bX$ 的四阶矩在 $b\to0$ 时一致有界，给出

$$
\begin{aligned}
\|z_0-by_b\|_2&=O(b^2),\\
\left\|z'_0-\frac b2y_b\right\|_2&=O(b^2),\\
\left\|z''_0+\frac b4y_b\right\|_2&=O(b^2).
\end{aligned}
\tag{62}
$$

对式（61）直接求导：

$$
G_\rho'(0)=-2\int_0^1(x-z_0)z'_0\,du,
\tag{63}
$$

$$
G_\rho''(0)=
2\int_0^1(z'_0)^2\,du
-2\int_0^1(x-z_0)z''_0\,du.
\tag{64}
$$

求导与积分交换由引理 1 及 $Y_\rho$ 的有限四阶矩保证。又因为 $\|x\|_2=1$、$\|y_b\|_2^2=1+b^2$，由式（62）和 Cauchy–Schwarz 不等式得到

$$
G_\rho'(0)=-bC_b+O(b^2),\qquad
G_\rho''(0)=\frac b2C_b+O(b^2),
\qquad
C_b:=\int_0^1x(u)y_b(u)\,du.
\tag{65}
$$

剩下的问题是 $C_b$ 仍取决于观测 SNR。令 $\Phi$ 为标准高斯分布函数。利用 $(Y_\rho,N)$ 这一耦合以及一维 Wasserstein 分位公式，

$$
\begin{aligned}
\|y_b-\Phi^{-1}\|_2
&=W_2(P_\rho,\mathcal N(0,1))\\
&\le\left(\mathbb E[|bX|^2]\right)^{1/2}=b.
\end{aligned}
\tag{66}
$$

定义仅依赖干净分布的常量

$$
\kappa_X:=
\int_0^1x(u)\Phi^{-1}(u)\,du
=\int_0^1F_X^{-1}(u)\Phi^{-1}(u)\,du.
\tag{67}
$$

因为 $\|x\|_2=1$，由 Cauchy–Schwarz 得到

$$
|C_b-\kappa_X|
\le\|x\|_2\|y_b-\Phi^{-1}\|_2\le b.
\tag{68}
$$

因此 $C_b=\kappa_X+O(b)$。式（67）的两个分位函数均单调不减、中心化且非恒定，因此 $\kappa_X>0$；Cauchy–Schwarz 给出 $\kappa_X\le1$，当且仅当 $X$ 为标准高斯变量时取等。

**命题 1（干净侧目标敏感性）。** 在定理 1 假设下，$\rho\to0$ 时有

$$
G_\rho'(0)=-\kappa_X\sqrt\rho+O(\rho),
\qquad
G_\rho''(0)=\frac{\kappa_X}{2}\sqrt\rho+O(\rho).
\tag{69}
$$

**证明。** 将式（68）代入式（65），再用 $b=\sqrt\rho$ 即可。

## 附录 E. 实验设置与补充结果

### E.1 实验设置

每项任务首先固定仅测量匹配的参数配置，然后加入权重为 $\lambda=1$ 的重建分支，沿用相同设置。教师场是以 32 个基础通道、通道倍率 $(1,2,3,4)$、每个分辨率一个残差块和 32×32 分辨率注意力构建的条件 FM 网络。教师网络在每项任务的 $8\times10^6$ 幅图像上训练一次后冻结。辅助场具有相同架构，并由教师场初始化。

算子学习使用 Adam：算子学习率 $3\times10^{-3}$，辅助场学习率 $10^{-4}$，批量大小 32，图像块大小 64×64；每次算子更新执行一次辅助场更新。DPIR 使用八次迭代，只有最后一次参与反向传播。式（8）取 $\epsilon=10^{-12}$，参数 EMA 衰减系数为 $\beta=0.999$。其他设置见原文表 3。

### E.7 无偏重建目标

默认目标 $G(\theta)$ 把真实退化测量的重建分布 $Q_\theta$ 与干净分布 $P_X$ 直接匹配。该分布目标在真算子处未必取到最小值。为构造真算子处的无偏目标，定义

$$
\widetilde G(\theta):=
D(Q_\theta\Vert Q_\theta^{\mathrm{syn}}),
\qquad
Q_\theta^{\mathrm{syn}}:=
\operatorname{Law}\!\left(R_\theta(A_\theta X+\varepsilon)\right),
\quad X\sim P_X.
\tag{70}
$$

其中 $Q_\theta=\operatorname{Law}(R_\theta(Y))$，$D$ 是附录 B 的加权 IKL。按照式（1）的测量模型，$A_{\theta^\star}X+\varepsilon$ 与 $Y$ 同分布，因此 $Q_{\theta^\star}=Q_{\theta^\star}^{\mathrm{syn}}$，使 $\widetilde G(\theta^\star)=0$；由 $D\ge0$ 可知真算子是 $\widetilde G$ 的一个极小值点，与所选重建器无关。

两个目标的区别只在比较对象。$G$ 将真实测量的重建与干净图像比较，$\widetilde G$ 则与候选算子合成的测量经过同一重建器的图像比较。对能够保持干净分布的重建器（例如后验采样），若 $Q_\theta^{\mathrm{syn}}=P_X$，两者一致。

实现 $\widetilde G$ 时，测量侧重建 $Z_1(\theta)=R_\theta(Y)$ 沿用式（6）估计梯度；但目标 $Q_\theta^{\mathrm{syn}}$ 随 $\theta$ 变化，不能用冻结教师场替代，而要使用第二个在线辅助流，训练样本为停止梯度后的 $R_\theta(A_\theta X+\varepsilon)$。每次算子更新因此需要第二次重建及第二次辅助流更新，所以无偏目标开销更高。其余设置不变。

附录 E.2–E.6 包含任务算子的可视化、各项完整结果及拍摄样本；E.8 给出运行时间分析。图表说明与逐图数值仍需对照 PDF 补全。

---

**公式覆盖状态：** Reconstruction-Aware 主文及附录编号式（1）–（70）已补齐。附录 E.2–E.8 的全部图表和其他未编号表达式尚未逐字核完；qa_complete=false。
