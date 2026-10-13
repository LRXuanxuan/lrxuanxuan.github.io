---
layout: page
title: "RadioDiff-Inverse：面向 ISAC 无线电地图构建的扩散增强贝叶斯逆估计｜中文全篇译稿（校对中）"
permalink: /papers/translations/2026-10-13-radiodiff-inverse-twc-2026/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [IEEE 论文页面](https://doi.org/10.1109/TWC.2026.3677479)

# RadioDiff-Inverse：用于通感一体化无线电地图构建的扩散增强贝叶斯逆估计

**原题：** RadioDiff-Inverse: Diffusion Enhanced Bayesian Inverse Estimation for ISAC Radio Map Construction  
**作者：** Xiucheng Wang、Zhongsheng Fang、Nan Cheng、Ruijin Sun、Haibo Zhou、Zhou Su、Zan Li、Xuemin Shen  
**期刊：** IEEE Transactions on Wireless Communications，25 卷，14611–14626 页，2026 年。  
**DOI：** 10.1109/TWC.2026.3677479。2025 年 5 月 21 日收稿，10 月 29 日修改，2026 年 3 月 21 日接收，4 月 1 日正式版。  
**译稿范围：** 按原文摘要、I–VI 节、公式（1）–（45）、表 I–III、图 1–13、38 条参考文献及作者信息整理；待逐句校对。  
**版权提示：** 正式 PDF 注明 ©2026 IEEE，个人使用许可不等于公开再发行授权。译稿的公开传播权限需由网站维护者另行核实，不应把此页视为 IEEE 官方译本。

## 摘要

无线电地图（Radio Map，RM）为环境感知通信与感知提供位置相关的无线信道信息，是这一领域不可或缺的工具。现有 RM 构建方法通常依赖精确的环境数据和基站（BS）位置，而这些信息在动态环境或重视隐私的场景中并非总是可用。虽然稀疏测量能减少数据收集量，但稀疏数据中的噪声如何影响 RM 精度，仍缺少充分认识。

本文在粗粒度环境知识与有噪稀疏测量条件下，将 RM 构建建模为贝叶斯逆问题，以应对上述挑战。尽管最大后验概率（MAP）滤波可以提供最优解，但它要求准确的 RM 先验分布，而这一分布通常不可得。为此，本文提出 RadioDiff-Inverse：一种扩散增强的贝叶斯逆估计框架，利用无条件生成扩散模型学习 RM 先验。

这一方法不仅重建无线信道特征的空间分布，还能仅依赖路径损耗，通过通感一体化（ISAC）感知环境中的建筑轮廓。方法使用常规通信测量，无需新波形、专用反馈或协议改变，因此可以作为即插即用的 ISAC 功能。RadioDiff-Inverse 的显著特征是无需任务特定训练：它利用在 ImageNet 上预训练的模型，完全不进行针对 RM 的额外微调，大幅降低在无线网络中使用大型生成模型的训练成本。实验表明，RadioDiff-Inverse 在无线电地图与环境重建精度，以及对稀疏有噪测量的鲁棒性方面取得先进表现。

**关键词：** 无线电地图；扩散模型；贝叶斯逆问题；最大后验概率；通感一体化。

## I. 引言

无线通信正由不感知环境的模式转向环境感知模式，这标志着下一代网络设计和运行方式的重大改变 [1]。这一转变的重要支撑是无线电地图（RM）：它以图形方式表示路径损耗、到达时间（ToA）、到达角（AoA）等无线信道特征的空间分布 [2]。由于包含位置相关的信道信息，RM 能支持前瞻性网络优化和对环境变化的实时适应 [3]。典型应用之一是降低导频需求：智能反射面（IRS）与大规模 MIMO 可以在较少甚至无需导频的情况下获取高保真信道状态信息（CSI），显著降低训练开销并提高频谱效率 [4]、[5]。RM 在空天地一体化网络（SAGIN）中，也对自主飞行器及卫星等动态节点的轨迹规划与干扰缓解十分重要 [6]、[7]。近期研究还通过对散射体角度响应、反射系数及路径贡献进行显式参数化，将多径结构纳入 RM [8]。

虽然 RM 具有诸多优点，但在复杂动态环境下构建准确、高效的地图仍很困难 [2]。按照对场景知识的掌握程度，RM 构建可分为场景已知 [9]–[15] 与场景未知／半已知 [16]–[18] 两种主要类别，如图 1。场景已知时，基站位置、环境实体轮廓及位置等信息完整，地图构建近似一个确定性问题 [11]。理论上，在辐射源特性、介电常数、磁导率已知的情况下，可以通过 Maxwell 方程求得任意位置的电磁传播 [19]。然而直接求解 Maxwell 方程需要高维数值计算，复杂度往往过高 [20]。电磁射线追踪（ERT）可以在有限但仍较大的计算时间内近似电磁场分布 [21]。为进一步加速，使用建筑布局与基站位置训练的 RadioUNet [9]、Transformer RadioNet [10] 等神经网络方法出现，可快速估计 RM。最近，生成式 AI 将地图看作随机过程，以高斯噪声处理环境不确定性，包括 GAN 式 RME-GAN [22]–[24] 与扩散式 RadioDiff [11]。

即使场景已知的 RM 构建技术已经进步，其部署仍严重受制于精确环境建模和已知基站位置 [2]、[25]。在隐私敏感区域、变化快速的城市景观及不合作辐射源存在的对抗性环境中，获得完整、高精度环境地图有时不现实、不可行或受到限制 [26]，使场景感知方法在动态实际环境中的适用性下降。

在缺少场景细节时，线性插值和 Kriging 等传统方法常用于从稀疏测量推断缺失的无线信道特征 [16]、[17]，但在遮挡、多径衰落和细尺度变化导致的非线性传播环境中，其泛化能力有限。以往研究还常假定稀疏观测没有噪声 [16]，忽略测量噪声对 RM 构建的影响。事实上，在强多径、动态干扰和传播环境变化下，稀疏观测噪声会显著降低地图精度，传统插值与机器学习方法都可能无法稳定恢复有结构的信道特征 [9]。

在卫星、空中网络中的基站部署优化、干扰管理和频谱配置等应用中，场景未知的 RM 构建尤其关键 [2]。例如，为了规避干扰、促进共存和自适应资源分配，必须能够估计非合作发射机的 RM [27]、[28]。缺乏详细环境模型、基站位置信息，加上稀疏观测含噪，使传统方法的局限更加突出。场景未知／半已知技术因而尝试仅从粗略环境知识和稀疏无线信道测量推断电磁场分布，绕开对精细地图的依赖，使其更适合动态、无结构和隐私敏感环境。不过，在稀疏有噪条件下仍需要一种能高效推断无线传播特性的稳健技术。

RM 还有一个经常被忽视的特性：它与周围环境存在双向关系。地图虽用于表示信道空间分布，但路径损耗、ToA、AoA 的空间变化本身也包含周围物体的几何、材料和布局信息。因此，RM 除通信优化外，还可以用于从通信信号推断环境结构，成为 ISAC 的重要支撑 [29]。困难在于如何从粗略环境信息以及稀疏、含噪测量中抽取有意义的先验。

本文因而把 RM 构建表述为贝叶斯逆问题：从少量含噪观测估计完整 RM 分布。贝叶斯推断可以系统处理不确定性并引入先验，提高估计精度。虽然理论上可以用 MAP 滤波求解，但需要准确、显式的 RM 先验，在实践中通常无法获得 [30]。生成扩散模型具有较强分布学习能力，可以在不同环境中学习 RM 的统计先验。将扩散与贝叶斯逆推断结合后，即使未知精确基站位置或环境地图，也能减轻稀疏噪声影响并重建 RM。

据此，RadioDiff-Inverse 将基于扩散的数据驱动先验与贝叶斯估计相结合，从静态场景感知模型转向适应环境变化及不确定性的框架。重建地图不仅描述无线信道，也可通过 ISAC 推断建筑与障碍物轮廓及位置，尤其适用于动态、无结构和隐私敏感的无线系统。

本文主要贡献如下：

1. 将场景未知／半已知 RM 估计建模为贝叶斯逆问题，提出在有噪稀疏观测下执行 MAP 滤波的 RadioDiff-Inverse，以推断缺失的环境及基站信息，超越预定义环境与确定性插值的限制。
2. 采用在 ImageNet 上预训练的无条件生成扩散模型作为数据驱动 RM 先验，不进行任务特定微调或后训练，体现跨域知识迁移能力。
3. 明确定义 RM 以及载波、带宽、发射功率、天线高度等关键参数，说明如何仅通过常规通信收集的稀疏“位置—功率”报告实现 ISAC。模型重建 RM 后使用考虑噪声的阴影与边缘判断获取建筑轮廓，不需专用波形、特殊反馈或协议改变；上报开销随采样数量增长，亦可扩展至多频、多天线高度配置。
4. 在地图重建、环境感知及仅依据路径损耗进行基站定位方面开展实验，证明对噪声和稀疏性的鲁棒性；在缺乏高精度环境信息时，优于传统插值及确定性生成基线。

**图 1（原文第 2 页）：** 不同信息可用条件下的 RM 构建。从真实地图、已知环境与基站、部分环境已知，到仅有噪声稀疏测量的场景未知估计。

## II. 预备知识

### A. 贝叶斯逆问题

贝叶斯逆问题广泛存在于医学成像、地球物理、计算机视觉及无线信号处理等领域：希望从间接、通常有噪的观测中恢复未知信号或参数 [30]。典型形式是：

$$
y=Ax+n,\qquad n\sim\mathcal N(0,\sigma^2I). \tag{1}
$$

这里 $x\in\mathbb R^D$ 为未知信号，$y\in\mathbb R^d$ 是观测，$A\in\mathbb R^{d\times D}$ 是已知正向算子，$n$ 是方差 $\sigma^2$ 的高斯测量噪声。若 $d<D$，方程欠定，解一般不唯一；为取得有意义的解，需要额外约束或正则化。

贝叶斯方法不只寻求一个确定性解，而是通过先验 $p(x)$ 与似然 $p(y\mid x)$ 推断后验：

$$
p(x\mid y)\propto p(x)p(y\mid x). \tag{2}
$$

先验描述领域知识支持下 $x$ 可能取值的分布；似然描述已知 $x$ 时产生观测 $y$ 的概率。在高斯噪声下：

$$
p(y\mid x)=\mathcal N(y\mid Ax,\sigma^2I). \tag{3}
$$

这种后验可以量化估计解的不确定性。常用推断策略是最大后验概率（MAP）估计，选后验概率最大的值：

$$
\hat x_{\mathrm{MAP}}=
\arg\max_x p(x\mid y)
=\arg\max_x p(x)p(y\mid x). \tag{4}
$$

若先验是零均值高斯 $p(x)=\mathcal N(x\mid0,\Sigma)$，MAP 可化为带正则项的最小二乘闭式解：

$$
\hat x_{\mathrm{MAP}}=
(A^\top A+\sigma^2\Sigma^{-1})^{-1}A^\top y. \tag{5}
$$

它与经典逆问题中的 Tikhonov 正则化相对应。

### B. 基于得分的去噪扩散模型

扩散模型可以从复杂分布生成高质量样本 [31]。得分扩散模型通过正向随机扰动逐渐改变数据分布，再训练生成网络估计得分函数以逆转扰动 [32]。相比离散 Markov 扩散链，得分方法可用连续随机微分方程（SDE）描述加噪和复原，与贝叶斯推断及逆问题后验采样自然契合。

正向扩散把初始数据分布 $p_0(x)$ 逐渐变成已知分布（通常为各向同性高斯），SDE 为：

$$
dx=f(x,t)\,dt+g(t)\,dw. \tag{6}
$$

$f(x,t)$ 是确定性漂移，$g(t)$ 是时间相关的扩散系数，$dw$ 是标准 Wiener 增量。随着 $t$ 从 0 至 $T$，$p_t(x)$ 从数据分布趋向可直接采样的高斯。生成过程则逆转正向过程，其逆时间 SDE 为：

$$
dx=[f(x,t)-g^2(t)\nabla_x\log p_t(x)]\,dt
+g(t)\,d\bar w, \tag{7}
$$

其中 $\nabla_x\log p_t(x)$ 是得分函数，表示时间 $t$ 的对数密度梯度，$d\bar w$ 为反时间 Wiener 增量。由于真实 $p_t$ 未知，训练网络 $s_\theta$ 近似：

$$
s_\theta(x,t)\approx\nabla_x\log p_t(x). \tag{8}
$$

网络通过得分匹配学习从噪声恢复数据。对应的概率流 ODE 为：

$$
dx=\left[f(x,t)-\frac12g^2(t)\nabla_x\log p_t(x)\right]dt. \tag{9}
$$

ODE 可沿确定性轨迹生成样本。去噪扩散概率模型（DDPM）则将正向过程离散为有限个时间步：

$$
q(x_t\mid x_{t-1})=
\mathcal N(x_t;\alpha_tx_{t-1},\beta_tI), \tag{10}
$$

其中 $\alpha_t,\beta_t$ 分别控制状态保持与加噪。训练噪声预测器 $\epsilon_\theta(x_t,t)$ 可写为得分：

$$
s_\theta(x,t)=-\frac{\epsilon_\theta(x,t)}{\sqrt{1-\bar\alpha_t}}. \tag{11}
$$

因此 DDPM 可被看成一种保方差扩散过程的离散实现。

**解耦扩散模型（DDM）。** 先进的场景已知 RM 构建方法 RadioDiff [11] 使用 DDM [33]：把数据衰减和噪声注入分为两个过程。相较直接给原数据加高斯噪声，DDM 先将初始状态衰减至零向量，再施加随机扰动。其前向转移为：

$$
q(x_t\mid x_0)=\mathcal N(\gamma_tx_0,\delta_t^2I), \tag{12}
$$

$\gamma_t,\delta_t$ 分别控制衰减与噪声方差。对应微分形式：

$$
dx_t=f_tx_t\,dt+g_t\,d\epsilon_t, \tag{13}
$$

$$
f_t=\frac{d\log\gamma_t}{dt}, \tag{14}
$$

$$
g_t^2=\frac{d\delta_t^2}{dt}-2f_t\delta_t^2. \tag{15}
$$

$f_t$ 决定衰减速率，$g_t^2$ 决定噪声积累。作者认为这种结构化扰动降低早期方差，改善训练与推断稳定性。逆扩散满足：

$$
dx_t=[f_tx_t-g_t^2\nabla_x\log q(x_t)]dt+g_t\,d\bar\epsilon_t. \tag{16}
$$

利用解耦性质，论文进一步给出简化的前向分布及逆向采样形式：

$$
q(x_t\mid x_0)=
\mathcal N\left(x_0+\int_0^t f_sds,\;tI\right), \tag{17}
$$

$$
q(x_{t-\Delta t}\mid x_t,x_0)=
\mathcal N\left(
x_t+\int_t^{t-\Delta t}f_sds-
\frac{\Delta t}{\sqrt t}\epsilon_t,\;
\frac{\Delta t(t-\Delta t)}{t}I
\right). \tag{18}
$$

本段公式照原文编号抄录。由于论文在介绍 DDM 时同时使用不同的前向过程记号，复现时应核对其原始引用 [33] 的变量定义及假设，不能脱离原文直接把式（17）当作式（12）的普通代数改写。

## III. 系统模型与问题表述

### A. 系统模型

考虑在指定区域构建 $N\times N$ 的 RM。每个网格单元的路径损耗视为常数，完整地图表示为矩阵 $P\in\mathbb R^{N\times N}$。不同于场景已知方法，本文假定精确基站位置和环境信息不可得，仅有粗略环境知识与稀疏含噪测量。区域内存在未知基站，其位置记为 $R$。环境中还存在固定位置、大小与形状不同的墙体和建筑等障碍物，它们通过反射、吸收及衍射影响电磁传播。与 [9]、[10]、[22] 一致，作者将建筑物内部的路径损耗数值设为 0，以矩阵 $h_s\in\mathbb R^{N\times N}$ 表示静态障碍，其中 $h^s_{i,j}=0$ 表示单元 $(i,j)$ 没有静态障碍。

由于只能获得稀疏、含噪的路径损耗样本，观测可以写成：

$$
y=S(p)+n, \tag{19}
$$

$S(\cdot)$ 从完整真实 RM $p$ 中选出部分网格点，$n\sim\mathcal N(0,\sigma^2)$ 为加性测量噪声。目标是利用粗略环境信息和上述样本恢复 $\hat p$，而不以基站位置作为已知输入。作者以预测损失 $\mathcal L(\hat p,p)$ 衡量重建与真实地图的差距。

通过重建 RM，可以从日常通信测量直接得到环境信息，实现被动、即插即用的 ISAC，无需专门波形、额外反馈或修改协议。建筑信息通过噪声底阈值从重建地图间接推断：利用低方差区域或重复测量估计阈值，若重建网格低于阈值，则认为该位置可能存在建筑或墙体造成的无线阴影。因而同一批稀疏、含噪观测既用于通信路径损耗重建，也用于建筑结构推断。

**问题 1** 联合优化：

$$
\min_\theta
\mathcal L(p,\hat p)+
\alpha\mathcal L(h_s,\mathbb I(\hat p\le\tau)), \tag{20}
$$

$$
\text{约束：}\qquad\hat p=\mu_\theta(y). \tag{20a}
$$

其中 $\alpha$ 为加权系数，$\mathbb I(\cdot)$ 是真假指示函数，$\tau$ 是阈值。该问题集中反映了场景未知 RM 的困难：没有精确基站位置，环境先验粗糙，必须依靠稀疏含噪测量同时重建地图与检测建筑。

### B. 问题分析

将 $N\times N$ 的 RM 展平为 $x\in\mathbb R^{N^2}$，每一分量对应网格位置的路径损耗或其他信道特征，例如 ToA、AoA。实际条件下仅有部分环境信息及部分网格的噪声观测，故可写成贝叶斯逆问题：

$$
y=Ax+n, \tag{21}
$$

$y\in\mathbb R^d$ 为观测，包含部分环境信息及稀疏有噪数据；$n\in\mathbb R^d$ 满足 $\mathcal N(0,\sigma^2I)$；$A\in\mathbb R^{d\times N^2}$ 表示选择／掩码算子。原文将 $A$ 称为只有选中位置的对角线元素为 1 的掩码矩阵；严格实现时应使观测向量维度与算子尺寸一致，即明确区分矩形选择矩阵与方形对角掩码两种等价存储表示。若对应元素被观测到，则保留；反之置为缺失。

已知稀疏有噪 $y$ 和 $A$ 后，目标是推断全地图 $x$。后验仍为：

$$
p(x\mid y)\propto p(x)p(y\mid x), \tag{22}
$$

其中 $p(x)$ 描述 RM 平滑性、空间相关等结构先验，$p(y\mid x)$ 是由观测噪声决定的似然：

$$
p(y\mid x)=\mathcal N(y\mid Ax,\sigma^2I). \tag{23}
$$

这说明粗略环境知识、稀疏采样和测量噪声的 RM 构建可以统一表述为贝叶斯逆推断问题。重要的不仅是补全未测数据，还要通过先验合理处理不完备信息与观测不确定性。

## IV. 扩散增强的贝叶斯逆估计

### A. 贝叶斯滤波

贝叶斯滤波根据逐步收到的观测 $y_t$，递归更新潜在状态 $x_t$ 的分布。核心包含“预测”和“更新”两步。预测利用状态动力学和既有先验推断下一个状态；更新通过新观测调整概率分布，得到更精确的估计。预测写为：

$$
p(x_t\mid y_{1:k-1})=
\int p(x_t\mid x_{t-1})p(x_{t-1}\mid y_{1:k-1})dx_{t-1}. \tag{24}
$$

这里 $p(x_t\mid x_{t-1})$ 是状态转移模型，$p(x_{t-1}\mid y_{1:k-1})$ 是上一时刻状态的条件分布。更新根据 Bayes 法则：

$$
p(x_t\mid y_{1:k})=
\frac{p(y_t\mid x_t)p(x_t\mid y_{1:k-1})}
{\int p(y_t\mid x_t)p(x_t\mid y_{1:k-1})\,dx_t}. \tag{25}
$$

分子中的 $p(y_t\mid x_t)$ 是似然，分母为归一化证据。反复执行预测与更新，就能递归求解概率逆问题。若动力学和观测均线性高斯，可采用 Kalman 滤波；更复杂非线性问题需要更灵活的后验近似。本文提议使用扩散模型提取先验分布特征，以在非线性背景下进行贝叶斯后验采样。

### B. 用于贝叶斯滤波的扩散模型

扩散模型包含正向逐步加噪及反向生成后验样本的过程。按本文滤波视角，正向过程对应状态预测，反向采样用于观测更新。正向转移为：

$$
x_t=a_t x_{t-1}+b_t n_t, \tag{26}
$$

$n_t$ 是独立标准正态噪声，$a_t,b_t$ 分别为状态与噪声缩放因子。根据 [34]、[35] 的噪声共享方法，观测序列 $y_t$ 也作扩散：

$$
y_t=a_t y_{t-1}+b_t A n_t. \tag{27}
$$

由于初始 $y_0=y\sim\mathcal N(Ax_0,\sigma^2I)$，扩散后的观测也受噪声影响：

$$
y_t\sim\mathcal N(Ax_t,c_t^2\sigma_t^2I), \tag{28}
$$

其中 $c_t=a_1a_2\cdots a_t$。由此把贝叶斯后验采样转化为逆时间滤波，目标是逐步近似 $p_\theta(x_t\mid y_{t:N})$，最终恢复 $x_0$。

**1）生成观测序列。** 为生成 $x_t$ 序列，需要反向构造 $y_{t:N}$。虽然已知初始有噪观测 $y_0$，但滤波式后验采样需要各时间步与状态关联的观测。作者使用反向采样逐步由 $y_{t+1}$ 构造 $y_t$，其条件分布是 $p_\theta(y_t\mid x_t)$。根据 [35]，论文给出：

$$
y_t=u_t y_0+v_t y_t+w_t A n_t. \tag{29}
$$

其中 $u_t,v_t,w_t$ 由扩散参数决定。该式右侧再次出现 $y_t$，与正文“从下一状态递归采样”的叙述不完全一致；此处按 PDF 原式保留，复现前务必核验是否存在排版下标笔误，不擅自把它改成 $y_{t+1}$。初始化 $y_N\sim\mathcal N(0,AA^\top)$，之后利用 $y_0$ 递归生成后续状态。

**2）逆向状态采样。** 逆序抽样需要根据已知观测采样 $x_t$。由于 $x_N$ 近似标准高斯，给定 $y_N$ 后有：

$$
x_N\sim p_\theta(x_N\mid y_N)
\propto p_\theta(x_N)p_\theta(y_N\mid x_N). \tag{30}
$$

其中似然为：

$$
p_\theta(y_N\mid x_N)=q(y_N\mid x_N)
=\mathcal N(Ax_N,c_N^2\sigma^2I). \tag{31}
$$

该后验为高斯，因此可以闭式计算。之后在各时间步递归，根据 $x_t$ 与 $y_{t-1}$ 抽样 $x_{t-1}$。相应似然：

$$
p_\theta(y_{t-1}\mid x_{t-1})
=q(y_{t-1}\mid x_{t-1})
=\mathcal N(Ax_{t-1},c_{t-1}^2\sigma^2I), \tag{32}
$$

其中 $c_{t-1}=a_1\cdots a_{t-1}$。由得分函数确定的无条件逆向分布为：

$$
p_\theta(x_{t-1}\mid x_t)=
\mathcal N(u_t\hat x_0(x_t)+v_t s_\theta(x_t,t_t),w_t^2I), \tag{33}
$$

并由 Tweedie 公式计算：

$$
\hat x_0(x_t)=\frac{x_t+d_t^2s_\theta(x_t,t_t)}{c_t}.
$$

$c_t,d_t,u_t,v_t,w_t$ 由无条件扩散采样过程决定，DDPM 与 DDM 取值详见第 II-B 节。根据 Bayes 法则：

$$
p_\theta(x_{t-1}\mid x_t,y_{t-1})
=\frac{p_\theta(x_{t-1},y_{t-1}\mid x_t)}
{p_\theta(y_{t-1}\mid x_t)}
\propto p_\theta(x_{t-1}\mid x_t)\,
p_\theta(y_{t-1}\mid x_{t-1}). \tag{34}
$$

该后验结合扩散先验与观测一致性。作者根据 [30] 使用 Monte Carlo 方法估计它，如图 4。

具体地，一个训练好的扩散网络 $\mu_\theta$ 能从条件高斯分布产生候选 $x_{t-1}$：

$$
\mathcal N(x_{t-1}\mid\mu_\theta(x_t,t),\sigma_t^2I). \tag{35}
$$

首先从式（35）抽取 $M$ 个候选 $x_{t-1}^{(i)}$。对每个候选，模型逆向转移的对数概率近似为：

$$
\log p_\theta(x_{t-1}^{(i)}\mid x_t)
\propto-\frac{\|x_{t-1}^{(i)}-\mu_\theta(x_t,t)\|^2}{2\sigma_t^2}. \tag{36}
$$

根据第 IV-B1 节生成的 $y_{t-1}$，观测似然为：

$$
\log p_\theta(y_{t-1}\mid x_{t-1}^{(i)})
\propto-\frac{\|y_{t-1}-Ax_{t-1}^{(i)}\|^2}{2c_t^2\sigma_t^2}. \tag{37}
$$

联合对数概率为二者之和：

$$
\log p_\theta(x_{t-1}^{(i)}\mid x_t,y_{t-1})
\propto\log p_\theta(x_{t-1}^{(i)}\mid x_t)
+\log p_\theta(y_{t-1}\mid x_{t-1}^{(i)}), \tag{38}
$$

$$
\propto-
\left[
\frac{\|x_{t-1}^{(i)}-\mu_\theta(x_t,t)\|^2}{2\sigma_t^2}
+\frac{\|y_{t-1}-Ax_{t-1}^{(i)}\|^2}{2c_t^2\sigma_t^2}
\right]. \tag{39}
$$

最后，根据归一化权重从候选集中重新采样：

$$
p_\theta^{\mathrm{sample}}
(x_{t-1}^{(i)}\mid x_t,y_{t-1})
=\frac{p_\theta^{\mathrm{wgt}}(x_{t-1}^{(i)}\mid x_t,y_{t-1})}
{\sum_{j=1}^M p_\theta^{\mathrm{wgt}}(x_{t-1}^{(j)}\mid x_t,y_{t-1})}, \tag{40}
$$

$$
p_\theta^{\mathrm{wgt}}(x_{t-1}^{(i)}\mid x_t,y_{t-1})
=\exp\left(
-\frac{\|x_{t-1}^{(i)}-\mu_\theta(x_t,t)\|^2}{2\sigma_t^2}
-\frac{\|y_{t-1}-Ax_{t-1}^{(i)}\|^2}{2c_t^2\sigma_t^2}
\right). \tag{41}
$$

图 3 给出从 $y_0$ 取得 $x_0$ 的完整采样流程；图 4 展示去噪及观测约束下的候选重加权。

**备注 1。** RadioDiff-Inverse 是一种无需任务特定训练的框架，骨干为在 ImageNet 上预训练、但未针对当前任务微调或后训练的扩散网络 $\mu_\theta$。如何从零训练扩散模型，可参见 [36]。

**图 2（原文第 7 页）：** 不同场景的比较。第一行为输入测量，第二行为输出 RM，第三行为真实地图。  
**图 3（原文第 7 页）：** 整个逆向推断序列示意。  
**图 4（原文第 8 页）：** RadioDiff-Inverse 在每步抽取候选、计算扩散先验概率与观测似然、重新归一化及采样的去噪步骤。

## V. 实验

### A. 数据集

本文使用无线电地图路径损耗构建竞赛的 DPM（Dynamic Pathloss Map）数据集评估方法。它包含 700 张地理环境与建筑配置不同的 RM；每张图包含 80 个发射机位置及对应真实测量，并具有 50–150 栋建筑。作者选取其中 200 张作测试，并确保训练与测试之间没有重叠地形，以保持评估独立性。

数据集环境基于 OpenStreetMap，覆盖安卡拉、柏林、格拉斯哥、卢布尔雅那、伦敦、特拉维夫等城市。所有地图统一参数：发射机及接收机高度均为 1.5 m，建筑高度统一设为 25 m。每幅地图表示为 256×256 像素的二值形态图，每像素面积 1 m²；建筑存在记为 1，不存在记为 0。发射机位置由二维数值坐标编码，也可用二值形态图表示，发射机处为 1，其他位置为 0。发射功率固定为 23 dBm，频率为 5.9 GHz。真实地图通过考虑反射、衍射的电磁仿真生成。

数据集具有两种真值：静态无线电地图 SRM 只考虑固定建筑结构的电磁交互，动态无线电地图 DRM 还加入在道路上随机分布的车辆影响。虽然它能提供高保真信号强度／路径损耗地图，却不包含 AoA、AoD、时延扩展等完整 ISAC 所需感知参数。作者明确承认这一点是由于缺少同时标注通信和感知参数的大规模公开数据；将方法扩展至多参数 ISAC 地图仍是重要未来方向。

### B. 评价框架

评价集中于 RM 重建保真度和环境感知（尤其建筑检测）精度。使用四项指标：

**峰值信噪比（PSNR）。** 以最大可能信号值与均方误差之比的对数度量重建质量：

$$
\operatorname{PSNR}=10\log_{10}\left(\frac{\operatorname{MAX}^2}{\operatorname{MSE}}\right). \tag{42}
$$

**结构相似性（SSIM）。** 使用图像亮度、对比度和结构三个维度模拟人类视觉系统的相似性判断 [37]：

$$
\operatorname{SSIM}(x,y)=
\frac{(2\mu_x\mu_y+C_1)(2\sigma_{xy}+C_2)}
{(\mu_x^2+\mu_y^2+C_1)(\sigma_x^2+\sigma_y^2+C_2)}. \tag{43}
$$

$\mu_x,\mu_y$ 为均值，$\sigma_x^2,\sigma_y^2$ 为方差，$\sigma_{xy}$ 为协方差，$C_1,C_2$ 为稳定常数。

**均方根误差（RMSE）。** 度量原始信号单位的重建误差，例如 dBm：

$$
\operatorname{RMSE}=
\sqrt{\frac1N\sum_{i=1}^N(x_i-\hat x_i)^2}. \tag{44}
$$

$x_i,\hat x_i$ 为真值及重建像素，$N$ 为地图总像素数。

**交并比（IoU）。** 用来评价从重建地图中推断建筑轮廓的准确性。先以阈值 $\tau$ 将 $\hat p$ 转为二值预测掩码 $\hat B=\mathbb I(\hat p\le\tau)$；阈值以下的单元被判定为建筑阴影（1），其他为非阴影（0）。然后与真实建筑掩码 $B$ 比较：

$$
\operatorname{IoU}=
\frac{\operatorname{Area}(\hat B\cap B)}
{\operatorname{Area}(\hat B\cup B)}
=\frac{\sum_{i=1}^N\hat B_iB_i}
{\sum_{i=1}^N\max(\hat B_i,B_i)}. \tag{45}
$$

IoU 越大意味着建筑平面轮廓检测越准。

评价场景涵盖建筑信息已知（Known／Aware）与未知（Unknown／Unaware）、1×1 与 2×3 采样策略、0.50–0.95 的缺失比例和 0.01–0.09 的观测噪声水平。通过这些配置，分析方法在典型 ISAC 部署情况下的表现。

### C. 实现细节

模型使用 PyTorch 和预训练扩散网络实现。核心为修改后的 U-Net，基本通道数 256，每个分辨率层有两个残差块，输入为 256×256 图像；在 32×32、16×16、8×8 三个分辨率引入多头注意力，每层有四个头，每头 64 通道。其他设计包括具有残差连接的 scale-shift 归一化、跨分辨率自适应特征融合，以及渐进上采样与跳跃连接。

扩散部分采用线性噪声调度、DDIM 采样方法 [38]，设置 1,000 个时间步；使用 $\epsilon$-prediction 和学习式区间方差。训练优化说明中还提及去噪时梯度裁剪、保留原始时间步缩放和自适应学习率调度。由于本文实际骨干为预训练网络，这些描述主要是模型配置说明，而不意味着本文在 RM 数据上重新训练。

实验在 NVIDIA H100 GPU 上执行，每张卡 80 GB HBM3，并配备 512 GB DDR5 主存。平均每张 256×256 地图重建耗时约 100 秒，可并行处理 16 张地图；峰值内存使用约 45 GB。作者认为模块化结构有利于适配不同输入分辨率与环境配置，但这一耗时意味着当前实现更适合离线或半实时处理，而非毫秒级闭环通信控制。

### D. 对比分析

与三类方法比较：

1. RadioUNet [9]：使用卷积 U-Net 从建筑及传播环境特征学习地图的监督方法，是非生成式神经网络解法的代表。
2. RME-GAN [22]：条件 GAN 根据环境特征生成 RM。原方法也使用路径损耗测量，本文比较配置仅输入环境特征，以保持输入一致。
3. Kriging 插值：经典地统计方法，根据测量点空间相关性估计未测点，使用指数变差函数实现普通 Kriging。

所有方法使用相同的训练、测试数据；神经网络模型训练至收敛，并根据验证损失早停；学习式模型采用一致的超参数优化程序。报告 PSNR、SSIM、RMSE、IoU，结果取五个不同随机种子实验的均值，并计算 95% 置信区间。下列表格按正式 PDF 保留报告均值。

### E. 实验结果及分析

评价集中于建筑信息影响、采样策略、缺失比例和噪声鲁棒性。表 I–III 分别展示噪声水平 0.01、0.05 和 0.09 下，不同缺失比例的重建结果。

**表格阅读方法。** “已知／未知”表示建筑信息可用与否；缺失 70%、80%、90% 分别表示相应比例的地图位置未观测。表格将四种方法按“RadioDiff-Inverse／RadioUNet／RME-GAN／Kriging”排列。由于 IoU 针对未知建筑的感知任务定义，所以仅列未知条件。下列数值直接取自原文表格，保留原始数据与作者正文之间可能存在的不一致，不进行未经依据的替换。

**表 I：随机逐像素掩码、噪声水平 0.01。**

| 场景与缺失比例 | PSNR：本文 / UNet / GAN / Kriging | SSIM：本文 / UNet / GAN / Kriging |
|---|---|---|
| 已知 70% | 32.34 / 26.68 / 23.37 / 22.47 | .9680 / .9195 / .7485 / .7906 |
| 已知 80% | 30.29 / 25.43 / 25.51 / 22.25 | .9495 / .8988 / .7885 / .7767 |
| 已知 90% | 26.33 / 24.16 / 25.63 / 22.47 | .8913 / .8687 / .7580 / .8127 |
| 未知 70% | 32.37 / 22.28 / 21.76 / 19.76 | .9682 / .7684 / .7257 / .6068 |
| 未知 80% | 30.10 / 21.28 / 20.03 / 19.49 | .9495 / .7538 / .7157 / .5453 |
| 未知 90% | 26.58 / 20.05 / 19.82 / 19.67 | .8941 / .7275 / .7622 / .6013 |

| 场景与缺失比例 | RMSE：本文 / UNet / GAN / Kriging |
|---|---|
| 已知 70% | .0493 / .0872 / .1425 / .1539 |
| 已知 80% | .0624 / .0872 / .1264 / .1578 |
| 已知 90% | .0979 / .1009 / .1091 / .1539 |
| 未知 70% | .0492 / .1245 / .1654 / .2081 |
| 未知 80% | .0637 / .1218 / .2039 / .2147 |
| 未知 90% | .0956 / .1221 / .2080 / .2104 |

| 未知建筑，缺失比例 | IoU：本文 / UNet / GAN / Kriging |
|---|---|
| 70% | .9052 / .1823 / .5486 / .1268 |
| 80% | .8944 / .1756 / .2656 / .1413 |
| 90% | .8469 / .1558 / .5495 / .1536 |

**表 II：随机逐像素掩码、噪声水平 0.05。**

| 场景与缺失比例 | PSNR：本文 / UNet / GAN / Kriging | SSIM：本文 / UNet / GAN / Kriging |
|---|---|---|
| 已知 70% | 35.29 / 22.19 / 23.20 / 22.26 | .9840 / .9187 / .7743 / .7950 |
| 已知 80% | 32.16 / 22.22 / 25.34 / 22.35 | .9748 / .9183 / .7889 / .7967 |
| 已知 90% | 27.44 / 22.04 / 26.17 / 22.19 | .9376 / .9167 / .7628 / .7923 |
| 未知 70% | 34.65 / 19.54 / 22.02 / 19.47 | .9829 / .8635 / .7219 / .5784 |
| 未知 80% | 31.52 / 19.76 / 20.67 / 19.22 | .9737 / .8808 / .7189 / .5565 |
| 未知 90% | 26.80 / 19.73 / 18.99 / 19.57 | .9365 / .8885 / .5616 / .5895 |

| 场景与缺失比例 | RMSE：本文 / UNet / GAN / Kriging |
|---|---|
| 已知 70% | .0499 / .0872 / .1402 / .1581 |
| 已知 80% | .0630 / .0869 / .1118 / .1565 |
| 已知 90% | .0952 / .1017 / .1009 / .1600 |
| 未知 70% | .0494 / .1246 / .1601 / .2155 |
| 未知 80% | .0630 / .1226 / .1884 / .2217 |
| 未知 90% | .0945 / .1226 / .2285 / .2126 |

| 未知建筑，缺失比例 | IoU：本文 / UNet / GAN / Kriging |
|---|---|
| 70% | .9041 / .1972 / .6388 / .1192 |
| 80% | .8950 / .1597 / .4517 / .1196 |
| 90% | .8472 / .1404 / .3115 / .1150 |

**表 III：随机逐像素掩码、噪声水平 0.09。**

| 场景与缺失比例 | PSNR：本文 / UNet / GAN / Kriging | SSIM：本文 / UNet / GAN / Kriging |
|---|---|---|
| 已知 70% | 33.35 / 21.99 / 22.04 / 21.83 | .8483 / .9159 / .7625 / .7703 |
| 已知 80% | 31.82 / 21.84 / 23.41 / 22.07 | .8771 / .9145 / .7701 / .7754 |
| 已知 90% | 28.17 / 21.82 / 25.57 / 22.04 | .8501 / .9144 / .7464 / .7723 |
| 未知 70% | 32.71 / 19.20 / 20.68 / 18.87 | .8472 / .8551 / .6982 / .5425 |
| 未知 80% | 31.18 / 19.40 / 19.37 / 18.93 | .8760 / .8740 / .6937 / .5453 |
| 未知 90% | 27.53 / 19.45 / 19.27 / 18.94 | .8490 / .8843 / .4760 / .5505 |

| 场景与缺失比例 | RMSE：本文 / UNet / GAN / Kriging |
|---|---|
| 已知 70% | .0534 / .0892 / .1601 / .1661 |
| 已知 80% | .0649 / .0898 / .1368 / .1614 |
| 已知 90% | .0956 / .1030 / .1064 / .1620 |
| 未知 70% | .0548 / .1300 / .1878 / .2310 |
| 未知 80% | .0664 / .1274 / .2185 / .2291 |
| 未知 90% | .0967 / .1265 / .2223 / .2290 |

| 未知建筑，缺失比例 | IoU：本文 / UNet / GAN / Kriging |
|---|---|
| 70% | .9011 / .1104 / .5980 / .0573 |
| 80% | .8933 / .1328 / .1705 / .0688 |
| 90% | .8401 / .1234 / .4085 / .0714 |

**1）建筑信息影响。** 作者在图 6、7 中比较有建筑信息（Known，实线）与未知（Unknown，虚线）。总体而言，掌握建筑信息有利于重建，随着缺失比例增大作用更明显。正文举例声称噪声为 0.01、缺失 70% 时 Known 的 PSNR、SSIM 为 34.55 dB、0.9847，而 Unknown 为 33.91 dB、0.9836；缺失 80% 时 Known 的 PSNR 为 32.57 dB，Unknown 为 31.93 dB。然而，**这些数字与同样标为噪声 0.01 的表 I 不一致**：表 I 的对应值为 32.34／0.9680、32.37／0.9682，缺失 80% 的 PSNR 为 30.29 与 30.10 dB。此处分别忠实保留正文叙述和正式表格，不擅自判定哪个版本正确，建议复现时首先核对该矛盾。

**2）采样策略。** 作者比较随机单像素（1×1）与块状 2×3 采样。在同样总采样比例下，2×3 采样一次获取相邻像素组，位置间相关性不同，影响地图恢复。图 5 等结果表明模型能处理多种观测策略；图 6–9 使用 1×1 采样，展示不同缺失比例下各指标的变化。作者特别强调，RadioDiff-Inverse 仅从稀疏信息仍可重建较完整的地图，并恢复建筑阴影结构。

**3）掩码比例影响。** 缺失比例提高意味着观测减少，理论上重建更难。本文在 70–90% 缺失区间展示了 PSNR 下降和部分结构失真，但高缺失时仍能维持相较基线较好的结构相似性。在正文另一组例子中，作者给出噪声 0.01、Known 下 PSNR 从缺失 70% 时 34.55 dB 降至 90% 时 27.83 dB；同条件 RME-GAN 在 90% 时为 25.63 dB，SSIM 为 0.7580，RadioDiff-Inverse 被报告为 0.9420。请注意，部分数值同样与表 I 的对应项不完全一致，译文未将两组数据混合。

**4）噪声影响。** 图 10–13 固定缺失比例 0.80，研究噪声水平 0.01–0.09。作者认为本方法的性能曲线比各基线更平坦，表现出更强的噪声鲁棒性。例如图 10 的 Known 场景中，文中称本文 PSNR 约由 30.2 dB 降至 29.8 dB，而 RadioUNet 从约 26.8 dB 降至 24.2 dB；Unknown 场景也有类似趋势。图 11 的 SSIM 在最高噪声水平下仍有较高值，但请注意表 III 中本方法 Known 场景 SSIM 为 0.8483–0.8771，低于正文所称“保持在 0.93 以上”，因此具体结论必须区分“图线描述”与“表格数值”。

图 12 给出的 RMSE 曲线在本文方法上约为 0.06–0.065，随噪声增加变化较小；对比模型既有更大初始误差，增长也更明显。图 13 对 Unknown 场景比较基站或建筑阴影相关 IoU，本文接近 0.9，而部分方法远低于 0.2。总体而言，作者在 80% 高缺失条件下观察到重建保真度和环境推断的优势。由于实验正文与表格若干指标有冲突，比较效果应以明确的实验配置与实际原始图／表核验为前提。

**图 5（原文第 12 页）：** 不同方法重建地图的定性比较。  
**图 6（原文第 12 页）：** 噪声 0.05、1×1 采样下的 PSNR 对比，实线 Known，虚线 Unknown。  
**图 7（原文第 12 页）：** 相同设置下的 SSIM 对比。  
**图 8（原文第 13 页）：** 噪声 0.05、1×1 采样下的 RMSE 对比。  
**图 9（原文第 13 页）：** 相同设置下仅对 Unknown 场景计算的 IoU 对比。  
**图 10（原文第 13 页）：** 缺失比例 0.80、1×1 采样、不同噪声水平下的 PSNR 对比。  
**图 11（原文第 13 页）：** 相同设置下的 SSIM 对比。  
**图 12（原文第 13 页）：** 相同设置下的 RMSE 对比。  
**图 13（原文第 13 页）：** 相同设置下仅对 Unknown 计算的 IoU 对比。

### F. 讨论

实际部署的关键问题是计算复杂度和推理延迟，尤其对于动态 ISAC。RadioDiff-Inverse 当前每次获得新的稀疏数据，都必须重新构建完整地图，尚不支持轻量增量更新。虽然相对于部分传统方法，单步计算的可扩展性更好，但完整重建存在不可避免的延迟。

传统 Kriging 需要反转 $N\times N$ 的测量协方差矩阵，复杂度为 $O(N^3)$，随着传感器数量 $N$ 增大迅速变得昂贵。常规梯度下降 MAP 求解同样受计算量限制：每次迭代成本通常随地图像素数 $M$ 增加，高分辨率问题为达到收敛需要很长时间。

基于物理的射线追踪与前述方法又属于不同范式。它不是从稀疏测量插值，而是从物理模型确定性地预测地图。它面临两方面严重的实时应用障碍。首先，环境数据要求极高：为了准确预测，需要完整、高精度、实时的三维环境模型，包括建筑几何、介电常数等电磁材料参数，以及所有动态物体的瞬时状态。这类数据在大多数 ISAC 场景中不可能完整收集和持续维护。其次，即使数据齐全，对所有像素模拟含大量反射与衍射的射线过程也需要极高计算量。

相比之下，RadioDiff-Inverse 采用 CNN 类 U-Net 作为基本去噪骨干，不需要显式三维环境几何，只依赖 $N$ 个稀疏测量与预训练阶段隐式学习的统计规律。骨干一旦训练完成，单次前向计算的主要复杂度随地图维度 $M$ 线性增长，约为 $O(M)$，且与稀疏样本数 $N$ 无关。因此单次网络计算比 $O(N^3)$ 的协方差求逆、或收敛缓慢的迭代优化具有更好的扩展性。

但作者明确承认：整体延迟的主要瓶颈并非一次 U-Net 前向计算的 $O(M)$，而是扩散采样必须顺序执行 $T$ 次前向，因此总代价约为 $T\times O(M)$。要达到近实时应用，需要减少时间步数或缩小模型。未来拟研究 DPM-Solver、DDIM 等先进采样器，尝试把 1,000 步缩至 10–20 步且尽量减小质量损失；还可通过压缩或蒸馏构造更小、更快的 U-Net。对于这些未来改进，论文尚未给出已实现的近实时延迟。

## VI. 结论

本文提出 RadioDiff-Inverse，一种在环境未知、测量稀疏且含噪条件下构建无线电地图的扩散增强贝叶斯框架。研究建立了两项主要贡献：（1）将环境与测量不确定性系统纳入贝叶斯逆问题；（2）利用预训练扩散模型学习先验，形成无需任务特定训练的解法，证明跨域知识迁移在 RM 构建中的可行性。框架能够从有限通信测量推断环境特征，在半已知场景中推进 ISAC 应用。

未来方向包括动态环境适配与新兴无线技术融合。本文通过结合生成式模型和贝叶斯推断，为无线通信中的逆问题研究提供了一种新思路。

## 参考文献（保留原编号与英文题名）

[1] X. Shen et al., “Toward immersive communications in 6G,” *Frontiers in Computer Science*, 2023.  
[2] Y. Zeng et al., “A tutorial on environment-aware communications via channel knowledge map for 6G,” *IEEE Communications Surveys & Tutorials*, 2024.  
[3] X. Wang et al., “Adversarial deep learning for indoor localization with channel state information tensors,” *IEEE Internet of Things Journal*, 2022.  
[4] S. Dang et al., “What should 6G be?,” *Nature Electronics*, 2020.  
[5] S. Liu et al., “Sensing-enhanced channel estimation for near-field XL-MIMO systems,” *IEEE Journal on Selected Areas in Communications*, 2025.  
[6] N. Cheng et al., “Space/aerial-assisted computing offloading for IoT applications: A learning-based approach,” *IEEE Journal on Selected Areas in Communications*, 2019.  
[7] X. Wang et al., “Joint flying relay location and routing optimization for 6G UAV-IoT networks: A graph neural network-based approach,” *Remote Sensing*, 2022.  
[8] H. Sun et al., “Channel gain map estimation for wireless networks based on scatterer model,” *IEEE Transactions on Wireless Communications*, 2025.  
[9] R. Levie et al., “RadioUNet: Fast radio map estimation with convolutional neural networks,” *IEEE Transactions on Wireless Communications*, 2021.  
[10] H. Li et al., “RadioNet: Robust deep-learning based radio fingerprinting,” *IEEE CNS*, 2022.  
[11] X. Wang et al., “RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction,” *IEEE Transactions on Cognitive Communications and Networking*, 2025.  
[12] X. Wang et al., “RadioDiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction,” *IEEE Journal on Selected Areas in Communications*, 2026.  
[13] K. D. Polyzos et al., “Bayesian active learning for sample efficient 5G radio map reconstruction,” *IEEE Transactions on Wireless Communications*, 2024.  
[14] J. Wang et al., “Sparse Bayesian learning-based hierarchical construction for 3D radio environment maps incorporating channel shadowing,” *IEEE Transactions on Wireless Communications*, 2024.  
[15] X. Gong et al., “Digital twin of channel: Diffusion model for sensing-assisted statistical channel state information generation,” *IEEE Transactions on Wireless Communications*, 2025.  
[16] T. M. Cover and P. E. Hart, “Nearest neighbor pattern classification,” *IEEE Transactions on Information Theory*, 1967.  
[17] F. J. Breidt and J. D. Opsomer, “Local polynomial regresssion estimators in survey sampling,” *Annals of Statistics*, 2000.  
[18] Q. Li et al., “Automatic indoor radio map construction and localization via multipath fingerprint extrapolation,” *IEEE Transactions on Wireless Communications*, 2023.  
[19] C. A. Balanis, “Antenna theory: A review,” *Proceedings of the IEEE*, 2002.  
[20] A. Bondeson et al., *Computational Electromagnetics*, Springer, 2012.  
[21] S.-H. Oh and N.-H. Myung, “MIMO channel estimation method using ray-tracing propagation model,” *Electronics Letters*, 2004.  
[22] S. Zhang et al., “RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network,” *IEEE Internet of Things Journal*, 2023.  
[23] Z. Zhang et al., “Fast and accurate cooperative radio map estimation enabled by GAN,” *IEEE ICC Workshops*, 2024.  
[24] P. Liao et al., “TFSemantic: A time-frequency semantic GAN framework for imbalanced classification using radio signals,” *ACM Transactions on Sensor Networks*, 2024.  
[25] W. Chen and J. Chen, “Diffraction and scattering aware radio map and environment reconstruction using geometry model-assisted deep learning,” *IEEE Transactions on Wireless Communications*, 2024.  
[26] S. Zhang et al., “Radiomap inpainting for restricted areas based on propagation priority and depth map,” *IEEE Transactions on Wireless Communications*, 2024.  
[27] C. Rose et al., “Wireless systems and interference avoidance,” *IEEE Transactions on Wireless Communications*, 2002.  
[28] X. Wang et al., “MapLoc: LSTM-based location estimation using uncertainty radio maps,” *IEEE Internet of Things Journal*, 2023.  
[29] A. Liu et al., “A survey on fundamental limits of integrated sensing and communication,” *IEEE Communications Surveys & Tutorials*, 2022.  
[30] G. E. Box and G. C. Tiao, *Bayesian Inference in Statistical Analysis*, Wiley, 2011.  
[31] J. Ho, “Denoising diffusion probabilistic models,” *NeurIPS*, 2024（按原文著录；出版年份请另核对原论文）。  
[32] Y. Song et al., “Score-based generative modeling through stochastic differential equations,” arXiv:2011.13456, 2020.  
[33] Y. Huang et al., “Decoupled diffusion models: Simultaneous image to zero and zero to noise,” arXiv:2306.13720, 2024.  
[34] Y. Song et al., “Solving inverse problems in medical imaging with score-based generative models,” *ICLR*, 2021.  
[35] Z. Dou and Y. Song, “Diffusion posterior sampling for linear inverse problem solving: A filtering perspective,” *ICLR*, 2024.  
[36] R. Rombach et al., “High-resolution image synthesis with latent diffusion models,” *CVPR*, 2022.  
[37] Z. Wang et al., “Image quality assessment: From error visibility to structural similarity,” *IEEE Transactions on Image Processing*, 2004.  
[38] J. Song et al., “Denoising diffusion implicit models,” *ICLR*, 2021.

## 作者信息

Xiucheng Wang 与 Zhongsheng Fang 为西安电子科技大学在读博士生，研究机器学习无线网络、生成模型与卫星通信／电磁数字孪生。Nan Cheng 于同济大学取得本硕学位，在滑铁卢大学取得博士学位，曾在多伦多大学从事博士后研究，现为西安电子科技大学教授，主要研究 B5G／6G、AI 驱动未来网络与空天地一体化网络。其他作者的学术身份、所属机构和详细履历见原文第 15–16 页作者简介。论文受国家重点研发计划 2024YFB2907500 与国家自然科学基金 62571402 支持；通讯作者为 Nan Cheng。

---

**译文说明与版权：** 中文内容依据用户提供的 IEEE 正式版整理，保留作者的叙述、公式、实验表格与可能存在的内部数值不一致，不构成独立实验验证。正式版版权声明要求再出版或再传播获得 IEEE 许可，本站不能仅凭用户持有论文 PDF 推定此项权利已获得；引用和再使用应核对原文 DOI 及所需授权。本页未托管原始 PDF，也不声称为官方中文版本。
{% endraw %}
