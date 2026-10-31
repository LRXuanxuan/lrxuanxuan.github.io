---
layout: page
title: "物理信息 VAE-EVT 的尾部感知无线电地图预测｜中文全文译文"
permalink: /papers/translations/2026-09-18-2608-15314-physics-informed-vae-evt-for-tail-aware-radio-map-prediction/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/44e4938426086ed1/) · [原文 arXiv](https://arxiv.org/abs/2608.15314) · [全部目录](/papers/catalog/)

# 物理信息 VAE-EVT 的尾部感知无线电地图预测

**原题：** Physics-informed VAE-EVT for Tail Aware Radio Map Prediction  
**作者：** Amanda Sheron Gamage、Niloofar Mehrnia、James Gross。单位：瑞典皇家理工学院（KTH Royal Institute of Technology）电气工程与计算机科学学院；邮箱：{asgamage, nilome, jamesgr}@kth.se。  
**版本：** arXiv:2608.15314v1（cs.AI），2026 年 8 月 15 日提交，原文 7 页（IEEE 双栏会议/期刊投稿格式，含图 1–4、表 I、公式 (1)–(8)、参考文献 18 条；原文脚注含 Vinnova 资助信息与开源实现链接）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–V 节（含 II-A–C、III-A–E（其中 A 下再分 1)–5)、B 下再分 1)–2)、D 下再分 1)–4)、E 下再分 1)–6)）、IV-A–C 等全部小节）、结论、全部图注（图 1–4）、表 I（逐格转录）、公式 (1)–(8) 与 18 条参考文献英文原条目；原文无附录、无作者简介；逐句逐式终校未做。

## 摘要

超可靠低时延通信（URLLC）需要精确识别信噪比（SNR）低于中断阈值的空间区域。此处的“中断”指 SNR 低于给定阈值的那些情形；对 URLLC 而言，该阈值可严格到 SNR 分布的 0.1% 分位数。传统生成式无线电地图模型倾向于重建平均信号电平，往往忽略对准确中断预测至关重要的低 SNR 区域。为弥补这一局限，我们提出一种物理与尾部信息的 VAE–EVT（变分自编码器–极值理论）框架，显式地同时建模 SNR 的**主体**与**尾部**分布。该方法先以物理信息预处理阶段从场景几何中提取确定性特征，包括视距、阴影与距离；随后由双潜变量编码器分别用高斯混合捕获主体 SNR、用广义 Pareto 分布（GPD）捕获尾部；再通过修改后的变分目标训练模型以联合监督两种区间，确保对极端衰落事件的关注。在 RadioMapSeer 数据集上的评估表明，我们的方法在由 0.1% SNR 分位数低阈值定义的中断区域内取得 4.83 dB 的 SNR RMSE，显著优于最先进的基于 GAN 的模型（其 SNR RMSE 为 21.90 dB），且性能差距随中断阈值变得更严格而扩大。

**关键词：** URLLC、生成式 AI、无线电地图、EVT、VAE、物理信息学习。

## I. 引言

自动驾驶与工业自动化等任务关键型应用的快速扩张，对无线网络提出了空前要求，使超可靠低时延通信（URLLC）成为下一代系统的基本设计范式 [1]。URLLC 本质上要求中断概率低至 $10^{-9}$ 至 $10^{-5}$。要在网络级实现如此严苛的可靠性，精确的无线电地图预测至关重要——它提供信号质量的空间细节，并作为保障可靠性的地理依据 [2]。识别信号强度跌破阈值的空间位置尤其关键，因为这些罕见但严重的衰落大体上决定了整体可靠性。传统基于模型的方法往往难以刻画 6G 环境预期的复杂、站点特定衰落特性，因此数据驱动方法（尤其是借助生成式人工智能（GenAI）模型的方法）已成为准确建模中断行为不可或缺的手段。

无线电地图给出某一地理区域内信号质量的空间分辨表示，是网络规划与主动资源分配的基础工具 [2]。尽管射线追踪等确定性方法能给出高精度结果，但它们依赖详尽的站点特定环境数据，在多变、快速变化的环境中可扩展性受限。这一局限推动了人们对基于学习的替代方案的持续兴趣，例如 RadioUNet [3] 表明生成式编码器–解码器网络能从建筑几何高效重建路损图。然而仍存在关键空白：多数先进模型主要关注重建平均统计量，常忽略信号尾部的空间深衰落。对 URLLC 应用而言，仅依赖平均信号统计并不充分；必须显式建模最终决定系统可靠性的罕见而关键的极端事件。

极值理论（EVT）通过广义 Pareto 分布（GPD）为刻画罕见衰落事件提供了统计基础。[4]、[5] 的作者针对 URLLC，通过对接收信号功率的极端分位数拟合 GPD，开展了信道尾部分布估计的基础研究；该工作随后在 [6] 中被推广到信道预测，在深度循环神经网络（DRNN）框架内引入基于 EVT 的自适应分位数损失函数。此外，[7] 的作者利用 EVT，通过对未观测位置处 GPD 尾部参数做高斯过程插值，构造可靠性感知的无线电地图。然而这些方法缺少用于地图合成的生成核心，且仍绑定于其训练所在的特定环境，部署到新场景时需重训练，凸显出需要更灵活的、面向 EVT 无线电地图合成的生成式方法。

GenAI 近期在大规模无线电地图生成方面受到关注。例如 [8] 提出使用生成对抗网络（GAN）估计复杂城市场景中无线电地图的框架，以提升生成地图质量。基于 GAN 的方法在推断阶段尤其高效，但通常集中于建模信号分布的中心趋势，往往忽略对 URLLC 至关重要的空间局部深衰落。更近期，扩散模型在捕获信号分布的近极端分位数方面显示出潜力 [9]；尽管有效，扩散模型计算密集且推断时延高。[10] 把 EVT 与 GenAI 结合用于信道估计，用 GAN 有选择地丰富稀缺的极端区域并在线估计尾部阈值与 GPD 参数；但该框架作用于单条链路的标量接收功率时间序列，因而刻画的是单个信道的时间尾部，而非环境中中断的空间分布。要把尾部感知生成从逐链路时间序列扩展到空间分辨的无线电地图，还需要以决定深衰落位置的场景几何为条件。低 SNR 尾部保真度有限、尾部感知生成计算代价高，这促使人们在纯数据驱动生成建模之外引入领域结构。

物理信息 AI 近期已成为无线通信中应对纯生成方法局限的有力途径：通过把传播模型、站点特定几何或解析路损先验嵌入学习框架，这些方法把领域知识直接注入模型训练过程 [11], [12]。这种物理条件化使网络能准确分辨定义中断边界的信号功率跃变，从而给出可靠且可解释的无线电地图预测。

本文提出一种新的物理信息 VAE-EVT 框架，融合 GenAI、EVT 与物理信息 AI 来预测无线电地图。该生成模型分别学习信号分布的主体与极端分位数（尾部），而确定性场景几何条件约束预测以保证物理一致性。主要贡献如下：

- 我们开发了一条物理信息特征提取流水线，计算视距（LoS）/非视距（NLoS）区分、阴影深度与距离衰减等空间先验，把传播物理直接编码进模型输入。
- 我们引入一种新的双潜变量编码器架构，把标准变分自编码器（VAE）与 EVT 结合，显式分离潜空间：用标准高斯分布建模主体信号条件，用 GPD 建模极端信号中断。
- 我们用 RadioMapSeer 数据集 [13]（无线电地图生成广泛使用的公开基准）将本框架与最先进算法进行性能对比。

本文余下部分安排如下：第 II 节给出系统模型假设；第 III 节详述所提物理信息 VAE-EVT 框架；第 IV 节讨论数据与模型假设并给出全面评估；第 V 节总结全文。¹

¹ 实现代码见 https://github.com/AmandaGamage/physics-informed-vae-evt。

**致谢（原文脚注）：** Niloofar Mehrnia 感谢 Vinnova（瑞典创新署）Grant #2025-01333 的支持。

## II. 系统模型与问题建模

我们考虑被离散为 $M\times M$ 空间网格的城市无线电传播环境，用二值建筑占用图 $B(p)\in\{0,1\}^{M\times M}$ 表示：$B(p)=1$ 表示像素 $p=(x,y)$ 处有建筑，$B(p)=0$ 表示自由空间。给定位于已知位置 $p_{\rm tx}$ 的单个发射机，有效接收位置集合定义为 $\Omega=\{p:B(p)=0\}$。我们的主要目标是刻画接收 SNR 在 $\Omega$ 上的空间分布，并特别强调准确预测触发中断的极低 SNR，因为刻画这些罕见事件对评估 URLLC 系统可靠性至关重要。

### A. 中断定义

设 $P_{\rm rx}(p)$ 表示像素 $p$ 处以 dBm 计的接收功率。对带宽 $B$、噪声谱密度 $N_0$、接收机噪声系数 NF 的系统，热噪声底计算为 $P_{\rm noise}=10\log_{10}(B)+N_0+{\rm NF}$ dBm。于是以 dB 计的 SNR 为

$$
\gamma(p)=P_{\rm rx}(p)-P_{\rm noise}. \tag{1}
$$

中断定义为事件 $\{\gamma(p)<\gamma_{\rm th}\}$，其中 $\gamma_{\rm th}$ 为预定义的临界 SNR 阈值。相应地，给定环境的中断区域定义为

$$
\mathcal O=\left\{p\in\Omega:\ \gamma(p)<\gamma_{\rm th}\right\}. \tag{2}
$$

### B. 确定性几何结构与残余可变性

SNR $\gamma(p)$ 包含两个不同成分：由宏观场景几何完全支配的确定性大尺度成分，以及捕获衍射、散射、建筑边缘附近信号交互等复杂物理现象所引起的概率性变化的小尺度成分。

确定性成分可由物理传播原理解析导出。一旦给定 $B$ 与 $p_{\rm tx}$，诸如到发射机的距离、LoS/NLoS 条件与局部阴影等基本几何量即可通过射线追踪显式计算 [11]。这些量被组织为一组完备的确定性描述子，记为 $X_{\rm geo}$；随后把小尺度统计可变性建模为条件分布 $p(\gamma\mid X_{\rm geo})$。

### C. 条件 SNR 分布的主体与尾部

在给定 $X_{\rm geo}$ 的条件下，SNR 呈现两种本质上不同的统计区间。在常规平均统计信道条件下（主体区），$\gamma(p)$ 用高斯混合模型（GMM）[14] 刻画：

$$
f_{\rm bulk}\left(\gamma:\gamma(p)>\gamma_{\rm th}\mid X_{\rm geo}\right)
=\sum_{k=1}^{K}\alpha_k\mathcal N\left(\gamma;\mu_k,\sigma_k^2\right), \tag{3}
$$

其中 $K$ 为混合分量总数，$\mathcal N$ 表示高斯概率密度函数，$\alpha_k$、$\mu_k$、$\sigma_k^2$ 分别为第 $k$ 个分量的混合权重、均值与方差。混合权重严格受限使 $\sum_{k=1}^{K}\alpha_k=1$；每个混合分量 $k$ 对应特定的传播状态，如 LoS、NLoS 或部分遮挡。

有限高斯混合会系统性低估严重罕见衰落事件的概率。为克服该局限，在尾部统计信道条件下（$\gamma(p)<\gamma_{\rm th}$），用 GPD 建模 $\gamma(p)$ [4]。根据 Pickands–Balkema–de Haan 定理，低于足够低阈值 $\gamma_{\rm th}$ 的超出量分布 [15] 收敛为

$$
f_{\rm tail}\left(\gamma:\gamma(p)<\gamma_{\rm th}\mid X_{\rm geo}\right)
=1-\left(1+\frac{\xi\left(\gamma_{\rm th}-\gamma(p)\right)}{\beta}\right)^{-1/\xi}, \tag{4}
$$

其中 $\beta>0$ 与 $\xi\in\mathbb R$ 分别为对超出量 $\gamma=\gamma_{\rm th}-\gamma(p)$ 拟合的 GPD 尺度参数与形状参数。

> **原文疑点：** 式 (4) 左侧记为 $f_{\rm tail}$，但右端给出的是 GPD 的**累积分布函数**形式 $1-(1+\xi(\gamma_{\rm th}-\gamma)/\beta)^{-1/\xi}$（在 $\gamma=\gamma_{\rm th}$ 处取 0、随 $\gamma$ 减小而增大），而式 (3) 的 $f_{\rm bulk}$ 是**概率密度**（GMM 密度之和）；两者分别为 CDF 与 PDF，函数类型不一致。本译按原文照录并加注。

为稳健地学习完整条件分布 $p(\gamma\mid X_{\rm geo})$，我们采用由专门训练目标驱动的 VAE [16]。重建损失分为两部分，确保主体区在高斯假设下被监督、尾部同时也在 GPD 假设下被监督。

## III. 面向尾部感知无线电地图预测的 VAE-EVT 框架

所提物理信息 VAE-EVT 框架（见图 1）含两个核心要素：(i) 提取确定性结构张量 $X_{\rm geo}$ 的物理信息预处理流水线；(ii) 具有双潜变量编码器与尾部感知训练目标的修改版 VAE 架构。二者共同使主体与尾部区间得以同时学习，从而准确估计 $p(\gamma\mid X_{\rm geo})$。

物理信息预处理产生多通道输入张量 $X_{\rm geo}$（输入张量）。双潜变量编码器把 $X_{\rm geo}$ 映射为两个潜变量：高斯主体潜变量 $z_{\rm bulk}$ 与 GPD 锚定的尾部潜变量 $z_{\rm tail}$（主体潜变量、尾部潜变量）。两个潜变量被拼接并经全连接层（拼接）。带空间注意力的 U-Net 解码器随后重建空间特征图，并送入三个输出分支：产生 $\mu$ 与 $\log\sigma^2$ 的主体分支、产生 $y_t$ 的尾部分支、以及产生 $\pi$ 并锐化为 $\pi_s$ 的中断分支，它们共同用于估计 SNR $\hat\gamma$ 作为最终输出。

**图 1：** 所提物理信息 VAE-EVT 架构概览。输入张量 $X_{\rm geo}$ 经双潜变量编码器得到主体潜变量 $z_{\rm bulk}\sim\mathcal N(\mu_g,\sigma_g^2\mathbf I)$ 与尾部潜变量 $z_{\rm tail}\sim{\rm GPD}(\hat\xi,\hat\beta)$；二者拼接后经 FC 与 U-Net 解码器（含空间注意力）产生主体分支 $(\mu,\log\sigma^2)$、中断分支 $\pi\to\pi_s$ 与尾部分支 $y_t$；最终输出 $\hat\gamma=(1-\pi_s)\mu+\pi_s y_t$。

### A. 物理信息预处理

预处理阶段把 $(B,p_{\rm tx})$ 转换为确定性几何描述子张量 $X_{\rm geo}$。所有通道定义在完整 $M\times M$ 网格上；对建筑像素（$B(p)=1$），通道置 0 并在训练与评估时被掩蔽。

**1）距离与发射机邻近度：** 对每个像素 $p\in\Omega$，到发射机的欧氏距离为 $d(p)=\|p-p_{\rm tx}\|_2$。我们构造经最小–最大归一化的对数距离通道 $D^{\rm norm}(p)=\log(d(p)+\epsilon_d)$（以很小的 $\epsilon_d>0$ 避免 $\log0$），以及在整个 $\Omega$ 上线性归一化的距离通道 $D^{\rm all}(p)$，后者作为尾部分支与中断分支的稳定条件输入。

定义平滑邻近图 $T_x(p)$ 为以 $p_{\rm tx}$ 为中心、按网格尺度选取的截断高斯：$T_x(p)=\exp\left(-\|p-p_{\rm tx}\|_2^2/(2\sigma_T^2)\right)$，其中 $\sigma_T>0$。

**2）LoS 掩码与 NLoS 穿透深度：** 当从 $p_{\rm tx}$ 到 $p$ 的离散化射线段不与 $B$ 中任何建筑像素相交时，二值 LoS 掩码 $M^{\rm LoS}(p)\in\{0,1\}$ 取 1，否则取 0。设 $n_{\rm hits}(p)\in\mathbb N$ 为所选离散化规则下该射线上与建筑相交的次数。LoS 掩蔽的对数距离特征为

$$
d^L(p)=D^{\rm norm}(p)M^{\rm LoS}(p). \tag{5}
$$

对 NLoS 像素，遮挡严重程度由归一化穿透深度刻画：

$$
D^{\rm NLoS}(p)=\left(1-M^{\rm LoS}(p)\right)\cdot
\min\left(\frac{n_{\rm hits}(p)}{d_{\max}},1\right), \tag{6}
$$

其中 $d_{\max}\in\mathbb N$ 为固定归一化常数（例如训练集中观测到的 $n_{\rm hits}$ 最大值）。

**3）局部阴影与边缘图：** 二值 LoS 掩码无法刻画转角与走廊附近的**部分**阴影。我们沿从 $p$ 指向 $p_{\rm tx}$ 的线段等距采样 $N_s$ 个点，统计其中落在建筑内的比例，从而定义局部阴影分数 $S^{\rm NLoS}(p)\in[0,1]$；对 LoS 像素置 $S^{\rm NLoS}(p)=0$。

为给空间注意力提供引导信号，我们计算强调 LoS/NLoS 边界与强阴影跃变的边缘图 $E(p)$。设 $\nabla$ 表示用 Sobel 算子估计的图像梯度，$G_{\sigma_E}$ 表示标准差为 $\sigma_E$ 的高斯平滑核，则

$$
E(p)={\rm clip}\left({\rm norm}\left(
\alpha_1\left\|\nabla M^{\rm LoS}\right\|(p)
+\alpha_2\left\|\nabla\left(G_{\sigma_E}*S^{\rm NLoS}\right)\right\|(p)
\right)\right),
$$

其中 $\alpha_1,\alpha_2\ge0$ 为加权系数，${\rm norm}(\cdot)$ 表示固定归一化（如 $\Omega$ 上的最小–最大归一化），${\rm clip}(\cdot)$ 把结果截断到 $[0,1]$。

**4）中断先验：** 通过中断先验给出中断风险的粗略几何基线：

$$
P^{\rm outage}(p)=
\begin{cases}
{\rm clip}_{(\epsilon,1-\epsilon)}\left(a_1D^{\rm norm}(p)\right), & M^{\rm LoS}(p)=1,\\[4pt]
{\rm clip}_{(\epsilon,1-\epsilon)}\left(b_1S^{\rm NLoS}(p)+b_2D^{\rm NLoS}(p)+b_3D^{\rm norm}(p)\right), & M^{\rm LoS}(p)=0,
\end{cases} \tag{7}
$$

其中 $a_1,b_1,b_2,b_3\ge0$ 为系数，$\epsilon\in(0,0.5)$ 用于避免退化概率。

**5）逐图阈值与输入张量：** 对每个环境（无线电地图），$\gamma_{\rm th}$ 取 SNR 值集合 $\{\gamma(p):p\in\Omega\}$ 的第 $q$ 百分位数，其中 $q\in(0,100)$ 在整个数据集上固定。随后把归一化阈值编码 $\hat\gamma_{\rm th}$ 广播到所有像素作为额外通道。具体地，$\hat\gamma_{\rm th}$ 用数据集级归一化常数 $\gamma_{\min}$ 与 $\gamma_{\max}$（在训练集上计算）构造为 $\hat\gamma_{\rm th}=\frac{\gamma_{\rm th}-\gamma_{\min}}{\gamma_{\max}-\gamma_{\min}+\epsilon_\gamma}$，其中 $\epsilon_\gamma>0$ 避免除零。

为锚定尾部潜空间，用训练集超出量 $\gamma_{\rm th}-\gamma$（限定于 $\gamma<\gamma_{\rm th}$ 的像素）以最大似然估计数据集级 GPD 参数 $(\hat\xi,\hat\beta)$；这些锚点在网络训练期间视为常数。最终输入张量为 $X_{\rm geo}={\rm stack}(B,T_x,M^{\rm LoS},d^L,S^{\rm NLoS},D^{\rm NLoS},E,P^{\rm outage},D^{\rm all},\hat\gamma_{\rm th})$，对应图 1 中的输入张量块。

### B. 双潜变量编码器

编码器实现近似后验 $q_\phi(z_{\rm bulk},z_{\rm tail}\mid X_{\rm geo})$，即图 1 中的双潜变量编码器块。它以卷积骨干产生多分辨率特征图，并缓存这些特征以供解码器的 U-Net 跳跃连接使用。

在瓶颈处，两个密集归一头分别产生主体潜变量参数，以及映射到 GPD 锚定潜变量的辅助尾部通路的参数。

**1）主体潜变量 $z_{\rm bulk}$：** 主体潜变量为对角协方差高斯分布。编码器输出 $\mu_g\in\mathbb R^{d_g}$ 与 $\log\sigma_g^2\in\mathbb R^{d_g}$（$d_g$ 为主体潜维数），并通过重参数化采样：$z_{\rm bulk}=\mu_g+\sigma_g\odot\zeta$，其中 $\zeta\sim\mathcal N(\mathbf 0,\mathbf I)$、$\sigma_g=\exp\left(\frac12\log\sigma_g^2\right)$，$\odot$ 表示逐元素乘。这对应图中主体潜变量块 $z_{\rm bulk}\sim\mathcal N(\mu_g,\sigma_g^2\mathbf I)$。

**2）尾部潜变量 $z_{\rm tail}$：** 尾部通路始于一个辅助对角高斯变量。编码器输出 $\mu_p\in\mathbb R^{d_t}$ 与 $\log\sigma_p^2\in\mathbb R^{d_t}$（$d_t$ 为尾部潜维数），并采样 $z_{\rm aux}=\mu_p+\sigma_p\odot\zeta$，其中 $\zeta\sim\mathcal N(\mathbf 0,\mathbf I)$、$\sigma_p=\exp\left(\frac12\log\sigma_p^2\right)$。随后由 $u=\varrho(0.5*z_{\rm aux})\in(0,1)^{d_t}$ 得到均匀随机变量的可微近似，其中 $\varrho(\cdot)$ 为 logistic sigmoid。

最后，用固定锚点 $(\hat\xi,\hat\beta)$ 把 $u$ 通过 GPD 分位函数映射：$z_{\rm tail}=\frac{\hat\beta}{\hat\xi}\left((1-u)^{-\hat\xi}-1\right)$，指数逐元素作用。实践中当 $|\hat\xi|$ 很小时，可采用数值稳定的指数极限形式 $z_{\rm tail}\approx-\hat\beta\log(1-u)$。

### C. 拼接与带空间注意力的 U-Net 解码器

两个潜变量按拼接块所示精确拼接为 $z=[z_{\rm bulk};z_{\rm tail}]$，随后经全连接（FC）层并重塑为低分辨率特征图，作为解码器的种子。解码器采用 U-Net 设计：特征逐步上采样回 $M\times M$，在匹配分辨率处通过跳跃连接与编码器特征拼接，并用卷积残差块精炼。解码器内施加空间注意力模块，以强调 $E$ 与 $S^{\rm NLoS}$ 等通道所突出的空间局部跃变。

### D. 输出头与最终预测

从共享解码器特征图出发，三个头产生图 1 右侧所示的输出。设 $m(p)=1-B(p)$ 为自由空间掩码，用于在重建损失中排除建筑像素。

**1）主体分支：** 主体分支为每个像素输出 $\mu(p)$ 与 $\log\sigma^2(p)$，二者在非中断区间定义 SNR 重建的高斯似然。

**2）尾部分支：** 尾部分支输出面向中断像素的尾部聚焦 SNR 估计 $y_t(p)$。为使尾部头与“亏空”解释保持一致，模型内部可参数化一个非负亏空 $\hat y(p)\ge0$，并置 $y_t(p)=\gamma_{\rm th}-\hat y(p)$，从而更大亏空对应更小尾部 SNR。

**3）中断分支：** 中断分支预测逐像素中断概率 $\pi(p)\in[0,1]$。建筑像素通过 $\pi(p)\leftarrow m(p)\pi(p)$ 被掩蔽。用陡峭 sigmoid 得到锐化路由掩码 $\pi_s(p)=\varrho(\kappa(\pi(p)-t^*))$，其中 $\kappa>0$ 控制陡度，$t^*\in(0,1)$ 在验证集上通过最大化 F1 分数选取；这对应图 1 中的 $\pi\to\pi_s$ 操作。

**4）最终输出：** 逐像素最终 SNR 预测计算为 $\hat\gamma(p)=(1-\pi_s(p))\mu(p)+\pi_s(p)y_t(p)$，对应图 1 的最终输出块。

### E. VAE-EVT 训练损失

模型以重建、潜变量正则与中断路由显式监督的组合端到端训练，总目标为

$$
\mathcal L_{\rm total}=\lambda_F\mathcal L_{\rm recon}
+\lambda_{{\rm KL},b}\mathcal L_{{\rm KL},b}
+\lambda_{{\rm KL},t}\mathcal L_{{\rm KL},t}
+\lambda_\pi\mathcal L_\pi
+\lambda_{\rm out}\mathcal L_{\rm outage}
+\lambda_{\rm sharp}\mathcal L_{\rm sharp}
+\lambda_{\rm LoS}\mathcal L_{\rm LoS}, \tag{8}
$$

其中 $\lambda_\cdot\ge0$ 为标量权重，训练中微调。

**1）重建损失 $\mathcal L_{\rm recon}$：** 重建由预测的中断概率路由，使 $\pi$ 小时主体学习占主导、$\pi$ 大时尾部学习占主导：

$$
\mathcal L_{\rm recon}=\frac{1}{|\Omega|}\sum_{p\in\Omega}
\left[(1-\pi(p))\mathcal L_{\rm NLL}(p)+\pi(p)\left(y_t(p)-\gamma(p)\right)^2\right],
$$

其中主体负对数似然项为 $\mathcal L_{\rm NLL}(p)=\frac12\left(\log\left(2\pi\sigma^2(p)\right)+\frac{(\gamma(p)-\mu(p))^2}{\sigma^2(p)}\right)$，$\sigma^2(p)=\exp(\log\sigma^2(p))$。

**2）中断区域强调 $\mathcal L_{\rm outage}$：** 由于中断像素罕见，$\mathcal L_{\rm outage}$ 增大 $\mathcal O=\{p\in\Omega:\gamma(p)\le\gamma_{\rm th}\}$ 内的惩罚：

$$
\mathcal L_{\rm outage}=\frac{1}{|\mathcal O|+\epsilon_O}
\sum_{p\in\Omega}\mathbf 1\{p\in\mathcal O\}
\left(\hat\gamma(p)-\gamma(p)\right)^2,
$$

其中 $\epsilon_O>0$ 在 $\mathcal O$ 为空时避免除零。

> **原文疑点：** 式 (2) 把中断区域定义为严格不等式 $\mathcal O=\{p\in\Omega:\gamma(p)<\gamma_{\rm th}\}$，而此处 $\mathcal L_{\rm outage}$ 中用 $\mathcal O=\{p\in\Omega:\gamma(p)\le\gamma_{\rm th}\}$（非严格不等式）；两处定义不一致。本译按原文照录并加注。

**3）潜变量正则 $\mathcal L_{{\rm KL},b}$ 与 $\mathcal L_{{\rm KL},t}$：** 主体 KL 项把主体后验正则到标准正态先验：$\mathcal L_{{\rm KL},b}={\rm KL}\left(\mathcal N(\mu_g,\sigma_g^2\mathbf I)\,\|\,\mathcal N(\mathbf 0,\mathbf I)\right)$。对尾部通路，$z_{\rm tail}$ 是 $z_{\rm aux}$ 的确定性变换，因此我们正则其辅助高斯：$\mathcal L_{{\rm KL},t}={\rm KL}\left(\mathcal N(\mu_p,\sigma_p^2\mathbf I)\,\|\,\mathcal N(\mathbf 0,\mathbf I)\right)$，这稳定了尾部采样，同时保留到 $z_{\rm tail}$ 的 GPD 映射。

**4）中断监督 $\mathcal L_\pi$：** 中断损失用标签 $\ell(p)=\mathbf 1\{\gamma(p)<\gamma_{\rm th}\}$（$p\in\Omega$，经 $m(p)$ 掩蔽建筑像素后）监督 $\pi(p)$。实践中 $\mathcal L_\pi$ 可组合逐像素分类损失（如 focal 或加权交叉熵）与区域级重叠项及校准项。所有分量都作用于 $\pi$（而非 $\pi_s$）以调整梯度。

**5）锐化正则 $\mathcal L_{\rm sharp}$：** 为抑制犹豫不决的路由，$\mathcal L_{\rm sharp}$ 惩罚高熵的中断概率：

$$
\mathcal L_{\rm sharp}=\frac{1}{|\Omega|}\sum_{p\in\Omega}
\left[-\pi(p)\log\left(\pi(p)+\epsilon_\pi\right)
-\left(1-\pi(p)\right)\log\left(1-\pi(p)+\epsilon_\pi\right)\right],
$$

其中小量 $\epsilon_\pi>0$ 保证数值稳定。该项促使 $\pi$（因而 $\pi_s$）接近近似二值的路由决策。

**6）LoS 中断强调 $\mathcal L_{\rm LoS}$：** NLoS 中断可被遮挡描述子 $S^{\rm NLoS}$ 与 $D^{\rm NLoS}$ 很好地解释；而处于中断的 LoS 像素路径无遮挡却仍然失效，这源于距离衰减而非遮挡。由于 (7) 的中断先验与各阴影通道都着眼于遮挡，在 $\mathcal O$ 上均匀平均的损失会被 NLoS 多数样本主导，使尾部头收敛到由阴影驱动的表示，从而系统性误判 LoS 少数样本。因此我们对 LoS 中断子集 $\mathcal O^{\rm LoS}=\{p\in\mathcal O:M^{\rm LoS}(p)=1\}$ 增加一项显式惩罚：

$$
\mathcal L_{\rm LoS}=\frac{1}{|\mathcal O^{\rm LoS}|+\epsilon_O}
\sum_{p\in\Omega}\mathbf 1\{p\in\mathcal O^{\rm LoS}\}
\left[\left(\hat\gamma(p)-\gamma(p)\right)^2
+\left(y_t(p)-\gamma(p)\right)^2\right].
$$

该项与输入张量中的 $D^{\rm all}$ 通道在目标中互为对应：二者共同存在，使尾部分支与中断分支能够表达 LoS 掩蔽的几何通道本身无法代表的、由距离驱动中断的机制。

## IV. 数值结果

### A. 实验设置

**1）数据集：** 我们在 RadioMapSeer 数据集 [13] 上评估本框架，它包含从 OpenStreetMap [17] 抽取的 700 个城市建筑布局。每个布局覆盖 $256\times256$ m²、分辨率 1 m 的网格，故 $M=256$；发射机、接收机与建筑高度分别为 1.5 m、1.5 m 与 25 m。我们使用 WinProp 仿真的 Dominant Path Model 地图 [18]，并限制到 $N_{\rm map}=300$ 个布局、每个布局 $N_{\rm tx}=10$ 个发射机位置，得到 3000 个环境–发射机对，按 80/20 划分为训练集与测试集。噪声底用 $B=10$ MHz、$N_0=-174$ dBm/Hz、NF $=0$ dB 计算，得 $P_{\rm noise}=-104$ dBm。SNR 值归一化到 $[0,1]$。

**2）实现细节：** LoS 射线追踪每条射线用 100 个采样点，足以使沿 $256\times256$ 地图最长对角线的采样间距低于 1 像素。局部阴影特征用 30 个采样点，因为它只需分辨 $p$ 的紧邻邻域内的遮挡，而非到 $p_{\rm tx}$ 的整条路径。NLoS 穿透深度由 $d_{\max}=10$ 归一化，对应训练集观测到的穿墙次数第 99 百分位。编码器使用四个步进卷积残差块，通道宽度为 $\{32,64,128,256\}$，把输入压缩到 $16\times16$ 瓶颈。事后中断锐化 sigmoid 使用斜率 20，有助于 $\pi_s$ 在窄窗口内从近零过渡到近一。损失权重遵循 KL 预热以避免后验坍缩，并在训练中逐步提升分类项、中断重建项与锐化项的权重。

> **原文疑点：** 原文称 LoS 射线每条使用 100 个采样点“足以使采样间距低于 1 像素”。但按 1 m 分辨率、$256\times256$ 网格计算，最长对角线约 $\sqrt{256^2+256^2}\approx362$ 像素：100 个采样点对应约 3.6 像素（约 3.6 m）的间距，与“低于 1 像素”的说法不符（除非采样点数或距离定义另有约定）。本译按原文照录并加注。

### B. 基线模型

为隔离各架构组件的贡献，我们比较四个模型：(i) **物理信息 VAE-EVT**：所提模型，含双潜变量 EVT 编码器、物理预处理与显式 LoS/NLoS 特征路由；(ii) **VAE-EVT**：双潜变量 EVT 编码器，无物理预处理；(iii) **物理信息 VAE**：带物理预处理但无 EVT 尾部建模的标准单潜变量 VAE；(iv) **RME-GAN [8]**：无显式尾部建模的基于 GAN 的无线电地图估计器。

全部模型使用训练集中的 2400 张地图训练，并在两个中断阈值 $q\in\{0.1\%,10\%\}$ 下评估。评估指标包括中断区域均方根误差（RMSE）、F1 分数、精确率与召回率（针对中断像素分类）。中断区域 RMSE 直接度量尾部预测保真度，F1 分数刻画中断定位的空间准确性。结果在 600 张测试地图上报告。

### C. 讨论

图 3 给出三个测试地图的预测无线电地图。RME-GAN 产生看似合理的大尺度传播图样，却无法重现建筑边界处细粒度的阴影结构；VAE-EVT 完全遗漏发射机附近的高 SNR 区域；所提物理信息 VAE-EVT 与真实值最接近，同时重现了发射机附近的亮区与深阴影区域。

表 I 汇总了不同模型在两个中断阈值 $q\in\{0.1\%,10\%\}$ 下的性能。在 0.1% 阈值下，物理信息 VAE-EVT 取得 4.83 dB 的中断 RMSE，分别比物理信息 VAE（12.03 dB）优 7 dB 以上、比 RME-GAN（21.90 dB）优约 17 dB；独立 VAE-EVT 也以 6.56 dB 保持竞争力，表明只有配备 EVT 的模型能在这些极端中断水平下保持预测精度。然而在 10% 阈值下，各模型差距大幅缩小：物理信息 VAE-EVT 为 6.97 dB，物理信息 VAE 与 VAE-EVT 分别为 7.54 dB 与 7.81 dB，RME-GAN 也改善到 11.53 dB。这种压缩是因为 10% 阈值的评估包含了更多主体相似样本，使 GPD 拟合与 RMSE 指标在该阈值下对极值预测的指示性下降，日益受非极端值影响。

尽管 0.1% 阈值下的 F1 分数看起来较低，但 $\hat\gamma$ 的中断 RMSE 仍很低，因为经由 $\pi_s$ 与 $y_t$ 的软路由使误路由像素保持在真实阈值 SNR 附近，分类误差只转化为很小的 RMSE 惩罚。

**表 I：** 不同阈值下各模型的中断预测性能比较（*原文该行标注星号 “Physics-informed VAE-EVT∗”，但未在正文或表注中说明星号含义*）。

| 模型 | RMSE 0.1%（dB） | RMSE 10%（dB） | F1 0.1% | F1 10% | 精确率 0.1% | 精确率 10% | 召回率 0.1% | 召回率 10% |
|---|---|---|---|---|---|---|---|---|
| 物理信息 VAE-EVT | 4.83 | 6.97 | 0.1120 | 0.2459 | 0.0608 | 0.8527 | 0.7088 | 0.1437 |
| 物理信息 VAE | 12.03 | 7.54 | 0.1015 | 0.2903 | 0.0559 | 0.2205 | 0.5504 | 0.6236 |
| VAE-EVT | 6.56 | 7.81 | 0.1222 | 0.2147 | 0.0673 | 0.9434 | 0.6638 | 0.1211 |
| RME-GAN [8] | 21.90 | 11.53 | 0.1179 | 0.5245 | 0.2524 | 0.5194 | 0.0769 | 0.5297 |

**图 2：** 600 张测试地图上中断 RMSE 的分布：(a) 0.1% 阈值；(b) 10% 阈值（图例通用，四种模型分别为物理信息 VAE-EVT、物理信息 VAE、VAE-EVT、RME-GAN）。

**图 3：** 三个测试地图的无线电地图。从左到右依次为：真实值、物理信息 VAE-EVT∗、物理信息 VAE、VAE-EVT 与 RME-GAN。

图 2 展示了 0.1% 与 10% 阈值下全部 600 张测试地图的中断 RMSE 分布。基于 EVT 的模型相较非 EVT 模型（包括物理信息 VAE 与 RME-GAN 的预测）呈现更低的均值与方差，在 0.1% 中断阈值下尤为明显。这种分离证实 EVT 的优势在各环境间是系统性的，而非由少量有利地图驱动。在 10% 阈值下分布出现重叠，这也符合“EVT 在真正的极端尾部之外收益递减”的预期。

**图 4：** 某样本测试地图的 SNR 分布（经验分布与四种模型预测的概率密度；左下角为低 SNR 尾部放大图）。

图 4 比较了预测与经验 SNR 密度。该图揭示真实值呈双峰结构：一个主导的 LoS 峰与一个次要的 NLoS 峰，反映发射机附近 LoS 主导像素与建筑后深阴影 NLoS 像素之间的分离。在主体区，所有物理条件化 VAE 模型都紧密跟随经验曲线，而 RME-GAN 出现可见偏移，VAE-EVT 在中 SNR 范围漂移到经验曲线上方。关键差异出现在低尾部（插图）：所提物理信息 VAE-EVT 在主体与尾部都跟随经验密度，凸显物理条件化的重要性。此外，带物理预处理的模型能重现两个峰，而 VAE-EVT 把它们塌缩并完全遗漏 LoS 峰。

值得说明的是，[8] 中报告的原始 RME-GAN 评估使用全部 700 个 RadioMapSeer 区域，按 500 训练、100 测试、100 验证划分；而本文报告的每个模型都在相同的子集上训练，即 $N_{\rm map}=300$ 个布局、每个布局 $N_{\rm tx}=10$ 个发射机位置。我们进一步指出，RME-GAN 使用真实 SNR 像素的 1% 作为稀疏观测，而所提模型仅由场景几何进行预测。

这些结果确认：EVT 对捕获尾部形状是必要的，物理条件化对把分布正确定位在 SNR 轴上并保持双峰主体结构是必要的。也值得注意的是，与需要在推断时迭代去噪的基于扩散的无线电地图模型 [9] 相比，所提框架以单次前向传播生成完整的 $256\times256$ SNR 地图，因而可直接部署于 URLLC 场景。所提物理信息 VAE-EVT、物理信息 VAE 与 VAE-EVT 的参数量相当，分别为 38,011,962、37,882,945 与 38,000,265。

## V. 结论

本文提出了用于尾部感知无线电地图预测的物理信息 VAE-EVT 框架。通过双潜变量编码器解耦主体与尾部、并嵌入确定性 LoS/NLoS 特征，该模型在 URLLC 关键的 0.1% 分位数阈值下取得 4.83 dB 的中断 RMSE，而物理信息 VAE 为 12.03 dB、最先进的 RME-GAN 为 21.90 dB。RMSE 分布证实该优势在全部 600 个测试环境中是系统性的。这些结果表明，URLLC 级中断刻画既需要物理根基的特征，也需要有原则的尾部建模。未来工作将把框架扩展到多发射机场景以及移动遮挡物与移动接收目标。

## 参考文献（英文原条目，按原文顺序）

[1] M. Bennis, M. Debbah, and H. V. Poor, “Ultrareliable and low-latency wireless communication: Tail, risk, and scale,” *Proceedings of the IEEE*, vol. 106, no. 10, pp. 1834–1853, 2018.

[2] Y. Zeng et al., “A tutorial on environment-aware communications via channel knowledge map for 6G,” *IEEE Communications Surveys & Tutorials*, vol. 26, no. 3, pp. 1478–1519, 2024.

[3] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “RadioUNet: Fast radio map estimation with convolutional neural networks,” *IEEE Transactions on Wireless Communications*, vol. 20, pp. 4001–4015, Jun. 2021.

[4] N. Mehrnia and S. Coleri, “Wireless channel modeling based on extreme value theory for ultra-reliable communications,” *IEEE Transactions on Wireless Communications*, vol. 21, no. 2, pp. 1064–1076, 2022.

[5] N. Mehrnia and S. Coleri, “Extreme value theory based rate selection for ultra-reliable communications,” *IEEE Transactions on Vehicular Technology*, vol. 71, pp. 6727–6731, June 2022.

[6] N. Mehrnia, P. Valiahdi, S. Coleri, and J. Gross, “Channel prediction using deep recurrent neural network with EVT-based adaptive quantile loss function,” *IEEE Communications Letters*, vol. 29, pp. 1699–1703, July 2025.

[7] D. E. Pérez, O. L. A. López, and H. Alves, “EVT-enriched radio maps for ultrareliable communication,” *IEEE Internet of Things Journal*, vol. 12, no. 12, pp. 22012–22022, 2025.

[8] S. Zhang, A. Wijesinghe, and Z. Ding, “RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network,” *IEEE Internet of Things Journal*, vol. 10, no. 20, pp. 18016–18027, 2023.

[9] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, “RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 11, no. 2, pp. 738–750, 2025.

[10] P. Valiahdi, N. Mehrnia, W. Saad, and S. Coleri, “EVT-based generative AI for tail-aware channel estimation,” in *2026 32nd International Conference on Telecommunications (ICT)*, pp. 111–117, 2026.

[11] W. Chen and J. Chen, “Diffraction and scattering aware radio map and environment reconstruction using geometry model-assisted deep learning,” *IEEE Transactions on Wireless Communications*, vol. 23, no. 12, pp. 19804–19819, 2024.

[12] F. Jaensch, G. Caire, and B. Demir, “Radio map prediction from aerial images and application to coverage optimization,” *IEEE Transactions on Wireless Communications*, vol. 25, pp. 308–320, 2026.

[13] Ç. Yapar, R. Levie, G. Kutyniok, and G. Caire, “Dataset of pathloss and ToA radio maps with localization application,” *arXiv preprint:2212.11777*, 2022.

[14] B. Selim, O. Alhussein, S. Muhaidat, G. K. Karagiannidis, and J. Liang, “Modeling and analysis of wireless channels via the mixture of Gaussian distribution,” *IEEE Transactions on Vehicular Technology*, vol. 65, no. 10, pp. 8309–8321, 2016.

[15] S. Coles, *An Introduction to Statistical Modeling of Extreme Values*. Springer Series in Statistics, Springer, 2001.

[16] D. P. Kingma and M. Welling, “Auto-encoding variational Bayes,” in *International Conference on Learning Representations (ICLR)*, 2014.

[17] OpenStreetMap contributors, “Planet dump retrieved from https://planet.osm.org,” https://www.openstreetmap.org, 2017.

[18] R. Wahl, G. Wölfle, P. Wildbolz, and F. Landstorfer, “Dominant path prediction model for urban scenarios,” in *Proceedings of the IST Mobile and Wireless Communications Summit*, 2005.

**原文插图：** 原 PDF 中的图 1–4 未重传至本页，仅保留中文图注与图中关键标注（架构各分支、密度曲线图例、地图列序与低尾部插图）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2608.15314v1（cs.AI，7 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–V 节（含 II-A–C、III-A–E（A 下 1)–5)、B 下 1)–2)、D 下 1)–4)、E 下 1)–6)）、IV-A–C 等全部小节）、结论、全部图注（图 1–4）、表 I（逐格转录）、公式 (1)–(8) 与 18 条参考文献英文原条目、原文资助脚注与开源实现链接；原文无附录、无作者简介。**逐句终校未做**：表 I（4 模型 × 8 数值列，含 0.1%/10% 两阈值）已用 PDF 页面渲染逐格核对；式 (3)–(7) 与损失各项已对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 3 条“原文疑点”加注：①式 (2) 中断区域用严格不等号 $\gamma(p)<\gamma_{\rm th}$，而 §IV-E 的 $\mathcal L_{\rm outage}$ 中 $\mathcal O$ 定义为 $\gamma(p)\le\gamma_{\rm th}$，两处不等号不一致；②式 (4) 命名为 $f_{\rm tail}$ 但给出的是 GPD **累积分布**形式，而式 (3) 的 $f_{\rm bulk}$ 是**概率密度**（GMM），函数类型不一致；③§IV-A2 称 100 个采样点足以使采样间距低于 1 像素，按 256×256 网格对角线约 362 像素计算与实际不符。另表 I 中 “Physics-informed VAE-EVT∗” 的星号未在原文说明含义。均按原文照录并说明，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
