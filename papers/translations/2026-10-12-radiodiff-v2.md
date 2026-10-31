---
layout: page
title: "RadioDiff-v2：用于多波束选择与定位的生成式角度无线电地图（中文译稿）｜中文全文译文"
permalink: /papers/translations/2026-10-12-radiodiff-v2/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原论文 arXiv:2607.08045](https://arxiv.org/abs/2607.08045) · [作者代码](https://github.com/UNIC-Lab/RadioDiff-v2)

# RadioDiff-v2：用于多波束选择与定位的生成式角度无线电地图

**原题**：RadioDiff-v2: Generative Angular Radio Maps for Multi-Beam Selection and Localization  
**作者**：Xiucheng Wang、Junxi Huang、Nan Cheng  
**单位**：西安电子科技大学综合业务网理论及关键技术国家重点实验室、通信工程学院  
**版本**：arXiv:2607.08045v1（2026-07-09）  
**说明**：依照原论文摘要、引言、相关工作、系统模型、方法、实验、结论及公式编号整理的中文学术译稿。图片不额外上传，图题及结果通过文本翻译；参考文献可由原文 PDF 核对，译文的技术结论均为原论文作者的主张。

## 摘要

角度无线电地图描述接收功率随到达角变化的分布，是第六代移动通信（6G）网络中波束选择与接收机定位的基础。根据几何信息预测角度功率谱（APS）具有困难，因为在非视距（NLOS）条件下这种映射是病态的，而且必须泛化至未见过的环境。最小化失真的回归器输出条件均值，会使频谱过度平滑，并抹除下游任务所需的多径结构。本文将任务表述为感知—失真问题，提出 RadioDiff-v2：一种通过流匹配训练的双分支一维扩散 Transformer。该网络结合周期性角度编码、自适应层归一化条件注入、傅里叶角度混合器，以及联合速度预测与干净信号预测输出头。

我们设计按评价指标选择估计器的组合方案，由同一个模型输出部署所需的所有量：采样结果承载条件分布，干净信号输出头提供回归精度的点估计，贝叶斯最优决策规则选择波束，条件似然用于接收机定位。我们证明，高度集中的条件分布对应直线概率流轨迹，可以一步积分精确求解，从而说明确定性传输是合适的归纳偏置。在 99 个环境、100 万条链路的零样本测试中，RadioDiff-v2 在全部指标上优于所有基线：Wasserstein-1 距离为 0.39 dB，每角度单元误差低于回归基线；NLOS 下八波束扫描损失为 2.43 dB；四基站定位误差为 20.6 像素。代码：https://github.com/UNIC-Lab/RadioDiff-v2 。

**关键词**：无线电地图、角度功率谱、流匹配、扩散模型、波束选择、定位、6G。

## I. 引言

无线信道的角度结构决定基站如何形成波束以及在何处放置零陷。6G 系统正迈向更高载频和更大规模天线阵列，定向传输因而成为链路增益的主要来源[1,2]。如果基站知道候选接收机位置的角度功率谱（APS），就可以在交换导频前将波束指向最强到达方向。相同的角度信息也支撑密集小区的波束管理、干扰规避与设备定位。

无线电地图，又称信道知识地图（CKM），在空间中存储位置相关的信道描述量，以供基站离线查询[3–5]。多数研究的目标是标量接收功率或路径损耗[6,7]，而角度无线电地图虽然更难预测，却包含更丰富、更有用的方向信息。波束选择和基于角度的定位都依赖完整角度分布，而不是单个功率值，因此本文研究从几何信息预测角度无线电地图。

该预测面临多径传播带来的困难。在视距（LOS）链路中，主导到达方向近似为收发端的几何方位，角度谱具有尖锐峰值，几乎由接收机位置确定。在非视距（NLOS）链路中，直达路径被遮挡，接收能量通过建筑反射与绕射到达，角度谱形成多个波瓣，其方向取决于周围布局，无法用简单的闭式几何方位规则刻画。预测器还必须泛化到训练中未曾出现的环境，因为真实部署不可能事先存储每条城市街区的指纹。严格的零样本要求排除了记忆环境指纹的做法，要求模型真正从建筑几何推断传播结构。多径歧义、NLOS 病态性与零样本泛化共同构成角度无线电地图的挑战。

已有学习方法通常将其看作图像到图像的回归，最小化逐像素重建损失。例如 RadioUNet 采用 U 型卷积网络，以均方误差训练，在标量地图上具有较好表现[6,8]；条件 GAN 方法 RME-GAN 将对抗项加入重建损失以使输出更锐利[9,10]；原始 RadioDiff 则采用卷积骨干网络，将地图构建转化为去噪扩散并改善路径损耗预测[7,11]。但对于角度任务，这些方法隐含的共同假设并不成立：逐角度单元平方误差的期望最小值恰为条件均值。将多个 NLOS 波瓣取均值，会得到位于真实波瓣之间、幅度低且宽阔的模糊谱，既不对应其中任一真实波瓣，也不能忠实地恢复多径结构。

这种平均效应不是调参问题，而是最小化失真训练目标的结构性结果。因此，角度无线电地图预测是一个感知—失真（perception–distortion）问题[12]：在 NLOS 条件下，模型可选择降低逐单元失真，或恢复真实角度谱尖锐而多峰的统计结构，但无法仅凭同一个回归输出同时做到两者。回归器偏向前者，模糊预测压缩动态范围，将分离的到达路径混为一团，并抹除候选波束方向之间的角度差异。根据模糊谱选出的波束可能对准多个波瓣的平均方向，而不是有用的真实到达方向；比较角度指纹进行定位时，相邻位置的判别特征也随之损失。

确定性 GAN 也可能发生模式坍塌，仅产生很少几种输出，无法表示 NLOS 条件下多个合理的角度谱。虽然 RadioDiff 是生成式模型，但它通过反向随机微分方程（SDE）采样，每一步都会注入新的噪声，而当几何确定后信道接近确定性时，额外噪声并不合适。因此需要既忠实于条件分布、又避免人为增加随机性的生成器。

本文提出 RadioDiff-v2：直接匹配角度无线电地图的条件分布而非条件均值，采用通过流匹配训练的一维扩散 Transformer。该模型学习一条常微分方程（ODE），沿近似直线将噪声先验传输到目标条件分布[13–15]。对于环境几何已基本决定的信道，确定性传输是恰当的归纳偏置，它把概率放在尖锐到达方向上，而非在各方向之间摊平。LOS 时模型表现得像尖锐回归器，不破坏主波瓣；NLOS 时则表示多个合理到达方向，既可为多波束扫描提供多样候选，又可通过后验均值完成单波束指向。由此得到的条件密度还支持回归器无法完成的另一项任务：用观察到的角度谱对不同候选位置计算条件似然，再执行生成式最大后验（MAP）定位[16,17]。一个模型因此同时提供尖锐角度地图、具有校准意义的波束多样性、准确点估计和定位似然，并能够零样本应用于新环境。

本文主要贡献涵盖问题表述、网络设计、理论和部署：（1）从感知—失真角度重新理解角度地图，并指出条件均值回归会模糊多径结构；（2）提出以整流流训练的双分支 DiT-1D，结合周期位置编码、adaLN、自适应傅里叶混合器、双输出头和可学习融合门，以及针对不同指标的估计器组合；（3）证明当条件分布趋于集中时流匹配轨迹变成可由一步 Euler 精确积分的直线，而反向随机 SDE 存在额外噪声；（4）将学习的条件密度用于生成式 MAP 定位，并在 20 个未见过的测试环境中取得全面优于基线的结果。相较先前扩散基线，W1 从 1.97 降到 0.39 dB；相较回归基线，逐单元误差从 0.199 降到 0.184；八波束 NLOS 损失为 2.43 dB；基站数从四增至六时，定位误差从 20.6 降到 17.1 像素，而回归地图融合停滞在约 41 像素。

## II. 相关工作

### A. 无线电地图与信道知识地图构建

无线电地图／CKM 根据环境几何预测信道量的空间分布，支持环境感知的 6G 系统[18,19]。早期方法把路径损耗地图预测当作图像回归：RadioUNet 利用建筑布局和发射机位置，训练卷积 U-Net 预测稠密路径损耗地图[6]；RME-GAN 以重建和对抗损失增强地图清晰度[9]；RadioDiff 系列把任务改写为条件生成，使用基于卷积的去噪扩散概率模型提升视觉锐度[7]。后续扩展包括引入电磁先验和逆问题结构、面向多径与综合感知的扩散过程[11,20]；室内地图与定位、少样本物理流形对齐[21,22]；以及复用扩散中间状态降低推断时延[23]。另有基于图的重建和大型三维无线电地图基准，尝试把 CKM 变成计算机视觉问题[4,24–27]。但这些工作通常关注笛卡尔网格上的标量路径损耗，逐像素一致性目标容易抹平信道角度精细结构，而多波束选择和似然定位恰恰需要这些结构。RadioDiff-v2 转而建模 dB 域 APS 的条件分布，恢复以前方法容易平均掉的尖锐多径波瓣。

### B. 生成模型

扩散和流模型是分布忠实预测的方法基础。去噪扩散概率模型学习逆转预设的前向加噪链，并通过反向随机过程采样[28]；确定性与基于分数的表述将采样写成 ODE 或 SDE，从而加快推断[29,30]；潜在扩散和文本引导模型则扩展到高分辨率与丰富条件[31,32]。流匹配与整流流采用另一途径：沿噪声先验与真实数据之间的直线插值，回归速度场，获得路径短、曲率低的概率流 ODE[13,14]。GAN 可通过对抗学习得到尖锐样本，但容易模式坍塌[10]；解耦扩散通过修改转移核提高少步采样效率[33]；Transformer 和 DiT 利用注意力及自适应归一化提供强条件建模能力[15,34]。计算机视觉方面已有广泛综述[35]。

这些生成模型多为高熵图像先验设计，但给定几何后的 APS 是接近确定性的物理量。因此 RadioDiff-v2 使用一维扩散 Transformer 和流匹配 ODE 传输来匹配高度集中的条件分布，避免噪声注入采样器的残余随机扩展。

### C. 无线电地图定位与指纹匹配

根据无线观测定位由来已久。指纹法将测量特征与数据库中的参考特征匹配，返回距离最近的参考位置；高斯过程地图可插值储存点之间的无线场[17]。深度学习方法则直接学习匹配关系，例如 LocUNet 从路径损耗地图回归接收机位置[16]。另一些工作利用无线指纹执行同步定位与建图或设备识别[3,36]。这些方法主要采用判别式或最近邻视角，使用固定度量比较观测与参考，却不能评价某个候选位置产生当前观测的概率。回归器不提供条件似然；被过度平滑的角度指纹也损害匹配精度。

RadioDiff-v2 通过比较各位置条件下观测 APS 的流匹配损失进行打分，将学习到的条件密度用于生成式 MAP 定位[37]。多个基站的似然相乘，因而覆盖增多时能够实现类似三角定位的作用；论文报告该方法甚至优于使用真实 APS 构建的理想指纹最近邻基线。

## III. 系统模型与问题表述

考虑一个由多个基站服务的单频无线环境，环境由二值建筑地图描述。地图为 $256\times256$ 像素图像，各像素表示自由空间或建筑内部，坐标在 $[0,256]^2$ 范围内。每个环境有约一百个发射机站点和数万个接收机位置。每条链路的传播由 LOS 路径、建筑反射与绕射共同决定。固定一对收发端时，接收场的方向结构由 APS 概括，即记录接收功率相对于方位角的分布。APS 编码主导多径方向，因此波束选择和角度定位均依赖它。

生成目标为接收机处的 dB 域 APS：

$$
\mathbf x_0\in\mathbb R^{N_\theta},\quad N_\theta=180.
$$

方位角被离散为 180 个角度单元，每个宽一度，第 $n$ 个中心角为 $\theta_n$。设 $P(\theta_n)$ 是在该角度单元接收到的线性功率，等于所有到达角落在此单元内的多径功率之和。归一化 dB 值为：

$$
[\mathbf x_0]_n=
\frac{10\log_{10}(P(\theta_n)+\epsilon)-P_{\min}}
{P_{\max}-P_{\min}}.\tag{1}
$$

其中 $\epsilon$ 避免深衰落零陷处对零取对数，$P_{\min}$ 和 $P_{\max}$ 是全数据集固定的动态范围界限。角度功率跨越多个数量级，故使用 dB 域保留线性尺度易忽略的弱旁瓣。式（1）为单调映射，不改变主波瓣方向与角扩展。APS 关于方位角具有周期性，下文位置编码将保留这一性质。

**主要记号**：$\mathbf x_0$ 为干净 APS；$\mathbf c$ 为条件；$\mu(\mathbf c)=\mathbb E[\mathbf x_0|\mathbf c]$ 为条件均值；$\epsilon\sim\mathcal N(0,\mathbf I)$ 为噪声；$t\in[0,1]$ 为流匹配时间；$\mathbf x_t$ 为插值状态；$\mathbf v_\phi$ 为速度场；$\widehat{\mathbf x}_0$ 为干净信号预测；$w$ 为无分类器引导权重；$W_1$ 为 Wasserstein-1 距离；$\mathbf a(\theta)$ 为导向向量；$\mathcal B$ 为候选波束集合；$M$ 为观测到的基站数量。

条件输入 $\mathbf c$ 包括三部分：（1）以接收机为中心、与角度轴对齐的极坐标建筑占用图 $\mathbf B\in\{0,1\}^{16\times180}$，对每个角度射出一条射线，在 16 个距离单元上记录建筑占用；（2）收发位置 $\mathbf p_{\rm tx},\mathbf p_{\rm rx}\in[0,256]^2$，及相对坐标、距离等几何特征 $\mathbf g$；（3）二元 LOS 标志 $\ell\in\{0,1\}$，只说明是否存在无遮挡路径。模型**不提供 LOS 的具体方位角**，因为这会直接暴露 LOS 主峰方向并削弱评价意义。因而 $\mathbf c$ 包含建筑占用、粗略几何和可见性标志，但不直接给出目标角度。

在已知散射体准确位置与材料属性时，APS 原则上由电磁传播确定[38,39]；但可用条件 $\mathbf c$ 只有二值建筑占用与粗略几何，不同真实物理环境可能对应同一个条件，因此 APS 仍有少量真实不确定性。于是将 $\mathbf x_0$ 看作条件分布 $p(\mathbf x_0|\mathbf c)$ 的样本；LOS 条件分布高度集中，NLOS 条件可能有限多模态。最小化 MSE 的回归器学习的是 $\mu(\mathbf c)$，但下游任务需要的是条件分布的完整模态结构，而非这些模态的平均，因此目标是直接学习 $p(\mathbf x_0|\mathbf c)$。

实验实行跨环境零样本泛化。99 个环境分为互不重叠的 79 个训练环境和 20 个测试环境，任何测试建筑地图都不参与训练。训练链路来自训练环境，另有分布内验证集用于调参；测试全部来自未见过的环境，以检验方法学习了可迁移的传播规律，而非记忆地理指纹。有些接收机能被至少三个发射机观测，可用于多基站融合。

**任务一：NLOS 生成式波束扫描。** NLOS 时，直达路径被遮挡，最优波束可能指向反射或绕射路径，而非几何直达方向[42]。设码本波束为 $\mathbf a(\theta)$，其真实角度谱下的增益为 $G(\theta)$（dB）。模型给出 $B$ 个候选波束 $\mathcal B=\{b_1,\dots,b_B\}$，接收机逐一扫描。扫描损失定义为真值最优与候选集合中最好波束增益的差：

$$
L_{\rm sweep@B}(\mathcal B)
=\max_\theta G(\theta)-\max_{b\in\mathcal B}G(b).\tag{2}
$$

目标是在给定条件下最小化期望扫描损失：

$$
\min_{\mathcal B}\mathbb E[
L_{\rm sweep@B}(\mathcal B)\mid\mathbf c],
\qquad|\mathcal B|=B.\tag{3}
$$

低损失要求候选波束同时准确并覆盖不同可能方向，若模型坍塌到同一方向，只有 $B=1$ 的情形可能受益。论文同时评价角扩展误差，以考察预测 APS 是否保留多样性。

**任务二：生成式 MAP 定位。** 对未知接收机测得的 APS $\mathbf y$，每个候选位置 $\mathbf p$ 由已知建筑地图诱导条件 $\mathbf c(\mathbf p)$。生成模型给观测赋予条件似然，并使用下文的流匹配分数 $\mathcal L_{\rm FM}(\mathbf y|\mathbf c(\mathbf p))$ 表征之：

$$
\mathbf p^\star=
\arg\min_{\mathbf p}
\mathcal L_{\rm FM}(\mathbf y\mid\mathbf c(\mathbf p)).\tag{4}
$$

如果有 $M$ 个基站的观测 $\{\mathbf y_m\}_{m=1}^M$，假设在位置给定时基站观测条件独立，联合估计为：

$$
\mathbf p^\star=\arg\min_{\mathbf p}
\sum_{m=1}^M
\mathcal L_{\rm FM}(\mathbf y_m\mid\mathbf c_m(\mathbf p)).\tag{5}
$$

每个站点的似然沿其方位形成一条“脊线”，多个脊线在真实位置相交，因此更多站点使定位更精确。任务一与任务二最终都要求学习完整的条件规律 $p(\mathbf x_0|\mathbf c)$。

## IV. RadioDiff-v2 方法

RadioDiff-v2 将 APS 预测视为条件生成，使用双分支一维扩散 Transformer，通过流匹配学习 $p(\mathbf x_0|\mathbf c)$。条件编码一次并注入每层 Transformer；网络同时预测速度场和干净信号；ODE 采样器从高斯先验积分到 APS 样本。由同一个网络的多个读出方式得到点估计、波束多样性和用于定位的条件打分。

### A. 流匹配公式

流匹配学习时变速度场，其概率流 ODE 将高斯先验传输至数据条件分布[13]。本文采用整流流插值，在干净 APS $\mathbf x_0$ 与噪声 $\epsilon\sim\mathcal N(0,\mathbf I)$ 之间连接直线：

$$
\mathbf x_t=(1-t)\mathbf x_0+t\epsilon,\tag{6}
$$

$$
\mathbf v=\frac{d\mathbf x_t}{dt}=\epsilon-\mathbf x_0.\tag{7}
$$

插值路径上的目标速度是常量。参数为 $\phi$ 的网络从含噪状态、流时间和条件回归该速度：

$$
\mathcal L_{\rm FM}(\phi)
=\mathbb E_{\mathbf x_0,\epsilon,t,\mathbf c}
\|\mathbf v_\phi(\mathbf x_t,t,\mathbf c)
-(\epsilon-\mathbf x_0)\|_2^2.\tag{8}
$$

其中 $t$ 在 $[0,1]$ 上均匀取样。推断时从 $t=1$ 的高斯噪声起点沿 ODE 反向积分到 $t=0$：

$$
\frac{d\mathbf x_t}{dt}=
\mathbf v_\phi(\mathbf x_t,t,\mathbf c),
\quad\mathbf x_1=\epsilon.\tag{9}
$$

与直接最小化 $\mathbf x_0$ 的逐单元重建损失不同，流匹配拟合能够保持条件分布宽度的传输映射，从而避免仅收敛至条件均值。

### B. 双分支 DiT-1D 骨干网络

骨干网络在 $N_\theta$ 个角度 Token 上堆叠一维 Transformer Block，每层具有多头自注意力、前馈网络和残差连接。在此基础上增添五个设计组件：

**第一，周期性角度位置编码。** 方位角是圆周变量，首尾角度单元彼此相邻。线性位置编码容易在周期边界形成不连续，使跨 $0^\circ$ 的波瓣被割裂。以 $\theta_n$ 的正弦／余弦编码位置，可在两端保持连续并减少主峰误定位。

**第二，自适应层归一化条件通路。** 条件包含极坐标建筑占用、几何特征及 LOS 标志。使用 adaLN-zero 将条件编码为每层的缩放与平移参数，在不同深度持续调制特征。残差分支初始化为零，使各 Block 在训练初期近似恒等映射并稳定优化。相比只在输入端拼接条件，该方式防止深层的几何信息被弱化。

**第三，瓶颈处的自适应傅里叶变换（AFT）角度混合器。** APS 由少量多径簇形成若干主导波瓣，因此具有较稀疏的角度频率结构。AFT 对瓶颈 Token 作傅里叶变换，施加可学习复滤波器，再逆变换，在低计算代价下提供全局角度感受野并处理频谱稀疏结构。没有 AFT 时，单纯局部注意力可能平滑细节，导致波瓣过宽。

**第四，双输出头与可学习融合门。** 一个输出头预测速度 $\mathbf v_\phi$，另一个直接预测干净信号 $\widehat{\mathbf x}_0$。由插值公式，速度对应的干净信号估计为 $\widehat{\mathbf x}_{0}^{\,v}=\mathbf x_t-t\mathbf v_\phi$，两者通过门控融合：

$$
\widehat{\mathbf x}_0^{\rm fuse}
=\sigma(\alpha)\widehat{\mathbf x}_0+
(1-\sigma(\alpha))
(\mathbf x_t-t\mathbf v_\phi).\tag{10}
$$

其中 $\sigma$ 为 Logistic 函数。速度头负责匹配分布的传输，干净信号头在接近 $t=0$ 时使结果稳定地靠近有效谱。只使用速度头容易在少步积分时累积误差，使尖峰变钝。

**第五，无分类器引导（CFG）。** 训练时以固定概率将条件替换为可学习空条件 $\varnothing$，使网络同时学到条件速度与无条件速度。推断时使用权重 $w$ 外推：

$$
\widetilde{\mathbf v}_\phi
=\mathbf v_\phi(\mathbf x_t,t,\varnothing)
+w\big[
\mathbf v_\phi(\mathbf x_t,t,\mathbf c)
-\mathbf v_\phi(\mathbf x_t,t,\varnothing)\big].\tag{11}
$$

较大 $w$ 会使样本向条件主模态集中，在强主峰保真与样本多样性之间产生折中。

综合上述组件，采样器以 $K$ 步积分引导后的 ODE，并在每步用干净信号估计进行锚定，使中间状态尽量留在有效谱的流形上。普通的仅速度 Euler 采样器在小步数预算下容易偏离流形，扩大波瓣并增加分布误差。

**算法 1：以 $x_0$ 为锚的 RadioDiff-v2 ODE 采样器。** 输入条件 $\mathbf c$、步数 $K$、引导尺度 $w$ 和时间序列 $1=t_0>\cdots>t_K=0$。首先令 $\mathbf x_{t_0}\sim\mathcal N(0,\mathbf I)$。每步分别计算有条件及空条件下的速度与干净信号头；按式（11）融合引导速度，按式（10）融合干净信号；执行以 $\widehat{\mathbf x}_0^{\rm fuse}$ 锚定的状态更新：

$$
\mathbf x_{t_{k+1}}\leftarrow
\frac{t_{k+1}}{t_k}
\big(\mathbf x_{t_k}+(t_{k+1}-t_k)\widetilde{\mathbf v}_\phi\big)
+\left(1-\frac{t_{k+1}}{t_k}\right)
\widehat{\mathbf x}_0^{\rm fuse}.
$$

最后返回 $\widehat{\mathbf x}_0^{\rm fuse}$。上式按原文算法中显示的更新结构转写；数值实现仍应以作者代码核对。

### C. 分布感知的采样器选择

引导尺度 $w$ 是推断超参数，可在训练后选择而无需重训练。传统做法以 NMSE 等逐单元失真最小化选取 $w$，但这会推动采样器趋于条件均值，破坏多径扩展，因此与角度任务不匹配。本文转而利用 dB 域真实 APS 与生成 APS 的分布之间的 Wasserstein-1 距离选择引导尺度：

$$
w^\star=\arg\min_w W_1(p_w(\mathbf x_0),p(\mathbf x_0)).\tag{12}
$$

$p_w$ 是采用引导权重 $w$ 时的采样分布。该准则直接针对分布保真度，可通过纯推断端调节恢复 NMSE 最优尺度容易破坏的动态范围与波瓣尖锐性。具体折中在第五节量化。

### D. 理论分析

选择 ODE 而非持续注入噪声的反向过程具有理论动机：给定收发位置与环境几何后，APS 是接近确定性的物理量，条件分布 $p(\mathbf x_0|\mathbf c)$ 高度集中。本文用两个假设刻画这一极限。

**假设 1（集中条件分布）**：APS 的条件分布为确定性映射上的 Dirac 质量：

$$
p(\mathbf x_0|\mathbf c)=
\delta(\mathbf x_0-\mu(\mathbf c)).
$$

这是偶然不确定性（aleatoric entropy）趋近于零时的精确极限，LOS 场景最接近该假设。

**假设 2（最优速度）**：网络达到流匹配目标（8）的最小值，因而输出目标速度的条件期望：

$$
\mathbf v_\phi(\mathbf x_t,t,\mathbf c)
=\mathbb E[\epsilon-\mathbf x_0|\mathbf x_t,\mathbf c].
$$

**命题 1（集中条件分布的直线传输）**：在假设 1 和 2 下，式（9）的概率流 ODE 存在闭式轨迹：

$$
\mathbf x_t=(1-t)\mu(\mathbf c)+t\mathbf x_1.\tag{13}
$$

该轨迹是从先验样本 $\mathbf x_1$ 到 $\mu(\mathbf c)$ 的直线；从 $t=1$ 到 $t=0$ 的单次 Euler 步可以精确积分，离散化误差为零。而具有相同时刻边缘分布的反向随机微分方程若在每步注入固定方差的高斯噪声，则不具备此性质。

**证明**：由假设 1，满足条件的干净信号唯一为 $\mathbf x_0=\mu(\mathbf c)$。代入式（6），有 $\mathbf x_t=(1-t)\mu(\mathbf c)+t\epsilon$；取 $\mathbf x_1=\epsilon$ 即得式（13）。由假设 2，最优速度是目标速度的条件均值；给定 $\mathbf x_t,\mathbf c$，目标 $\epsilon-\mu(\mathbf c)$ 已确定，因此沿轨迹等于常量 $\mathbf x_1-\mu(\mathbf c)$。式（9）的右端恒定，精确解即式（13）的直线。Euler 方法对常速度 ODE 单步积分没有误差。反向 SDE 在每步额外加入独立布朗增量，其每步噪声方差并不随条件集中而自动消失，因此在有限步数下还必须去除所注入的噪声，并可能在 $\mu(\mathbf c)$ 周围留下残余扩展。证毕。

该命题刻画理想确定性极限。实际条件只有二值建筑图和粗略几何，缺少散射体精确位置和材料参数，NLOS 仍具有少量真实不确定性，因此处于感知—失真折中区间。条件集中时（如 LOS），ODE 将几乎所有先验质量映射到单模态，表现得像不会过度平均的尖锐回归器；存在多模态时（如 NLOS），噪声到样本的映射可表示多个可能波瓣，而失真最小化回归器只返回模态平均，导致动态范围变平并损失角度结构。因此相同网络容量、相同步数下，理论预示本方法应比噪声注入基线具有更尖锐条件模态、更低的 $W_1$ 和更好的波束扫描结果；第五节实验证实这些预测。

### E. 面向不同指标的估计器组合

同一训练模型利用不同读出方式服务不同部署目标，各指标使用适合自身损失函数的贝叶斯估计器。评价分布保真度时，直接使用采样输出，因为样本包含完整条件分布。需要最小均方误差点估计时，使用 APS 后验均值，通过对 $K$ 个条件样本平均：

$$
\widehat{\mathbf x}_0^{\rm MMSE}
=\frac1K\sum_{k=1}^K\mathbf x_0^{(k)},
\quad \mathbf x_0^{(k)}\sim p_w(\mathbf x_0|\mathbf c).\tag{14}
$$

当 $K$ 增大时，该估计趋近 $\mathbb E[\mathbf x_0|\mathbf c]$。干净信号头提供另一种更低成本的近似路径；其重建损失令该输出头在含噪探测输入上学习类似条件均值的回归。于噪声端附近进行 $R$ 次探测并平均：

$$
\widehat{\mathbf x}_0^{\rm head}
=\frac1R\sum_{r=1}^{R}
\operatorname{head}_{x_0}(t_r\epsilon_r,t_r,\mathbf c),
\quad\epsilon_r\sim\mathcal N(0,\mathbf I).\tag{15}
$$

$t_r$ 接近 1，使用成对反号（antithetic）噪声样本。为了逐单元指标，还可使用凸组合 $\lambda\widehat{\mathbf x}_0^{\rm head}+(1-\lambda)\widehat{\mathbf x}_0^{\rm MMSE}$，其中 $\lambda$ 依据评价指标选择。

波束选择需要考虑扫描预算 $B$。预算较小时，在期望角度谱上计算每个码本波束增益，挑选最优候选；预算较大时，贪心地选取能带来最大期望实际增益改善的新波束：

$$
\mathcal B_j=\mathcal B_{j-1}\cup
\left\{\arg\max_b\mathbb E_k
\left[
\max\left(u_b^{(k)},
\max_{b'\in\mathcal B_{j-1}}u_{b'}^{(k)}\right)
\right]\right\}.\tag{16}
$$

其中 $u_b^{(k)}$ 是在第 $k$ 个生成样本上波束 $b$ 的增益。贪心算法逐步增加期望改善最大的波束，使候选覆盖不同合理到达方向，而不是不断重复主峰。论文将目标视为单调次模函数，因此贪心选择近似最优。所有相关超参数，包括 $t_r,R,K,w,\lambda$ 及不同扫描预算的规则，都只在训练环境中的留出验证链路上选择，测试前固定。仅输出 $\mu(\mathbf c)$ 的回归器不含概率分布、多样波束集合或条件似然，因此无法承担这套多目标读出方案。

**图 1**：RadioDiff-v2 总览。（a）极坐标建筑占用、几何信息和 LOS 标志组成条件；NLOS 下条件均值回归是不适定的。（b）流匹配学习将噪声传至真实 APS 的速度场。（c）周期编码、adaLN、AFT 与双输出头构成 DiT-1D。（d）集中条件下 ODE 轨迹为直线，区别于持续加噪的 SDE。（e）生成分布服务多波束扫描，其均值服务单波束。（f）生成式 MAP 似然结合多个基站完成定位。

**图 2**：NLOS 链路上预测 APS 的定性比较。每条曲线以自身最大值归一化至 0 dB。由左至右分别为 COST231、RME-GAN、MS-Areg、RadioDiff、RadioDiff-v2 采样和真实谱。几何基线在 NLOS 时对准被阻挡的直达方向；RadioDiff-v2 更常将尖峰放在真实到达方向；GAN 和回归方法在峰值附近仍宽阔而嘈杂。

## V. 实验

### A. 生成式 MAP 定位

学习的条件密度还可以作为定位的贝叶斯似然，回归器不具备这种能力。给定未知接收机测得的 APS $\mathbf y$，候选位置 $\mathbf p$ 决定由已知建筑图和服务发射机几何关系导出的条件 $\mathbf c(\mathbf p)$。本文以该条件下观测的流匹配损失作为负对数似然的评分（相差一个常量），并排除真值位置参与搜索：

$$
\mathcal L_{\rm FM}(\mathbf y|\mathbf c(\mathbf p))
=\mathbb E_{\epsilon,t}
\|\mathbf v_\phi(\mathbf y_t,t,\mathbf c(\mathbf p))
-(\epsilon-\mathbf y)\|_2^2,\tag{17}
$$

$$
\mathbf p^\star=\arg\min_{\mathbf p}
\mathcal L_{\rm FM}(\mathbf y|\mathbf c(\mathbf p)),\tag{18}
$$

其中 $\mathbf y_t=(1-t)\mathbf y+t\epsilon$。该评分奖励能够解释观测多径模式的位置条件，因此利用完整角度结构，而不只是一个摘要统计量。若接收机能收到 $M$ 个基站的观测，假设这些观测在给定位置后条件独立，则联合似然相乘，负对数似然相加：

$$
\mathbf p^\star=
\arg\min_{\mathbf p}\sum_{m=1}^M
\mathcal L_{\rm FM}(\mathbf y_m|\mathbf c_m(\mathbf p)).\tag{19}
$$

各基站的分数在不同方向上形成似然脊线，并在真实位置交会。单站观测约束较弱，主要优势来自多站融合，但这也要求用户具备多基站覆盖。

### B. 实验设置

在包含 99 个环境的大规模角度无线电地图数据集[40]上测试模型，每个环境约有 50,000 条收发链路。每条链路的预测目标均为含 180 个角度单元的 dB 域 APS；条件包含接收机为中心且与角度轴对齐的极坐标建筑占用、收发几何信息，以及不给出 LOS 方向的 LOS 标志。严格零样本划分为 79 个训练环境和 20 个完全不同的测试环境。训练使用 3,864,000 条链路，分布内验证使用 60,000 条。所有后续评价均来自未见过的测试环境，各方法使用同一组测试链路；全部估计器超参数只在验证数据上选定，测试前锁定。大约 15%–20% 的接收机可被至少三个发射机观测，从而支持多基站定位。

基线覆盖四类方法：RadioDiff 是基于卷积 U-Net 的早期去噪扩散概率模型[7,8,28]；RME-GAN 是使用 L1 和对抗损失训练的条件 GAN[9,10]；MS-Areg 是 Map2APS 基准中的多尺度 MSE 回归器[40]；COST231 是经典解析路径损耗模型，其角度类似物始终指向收发几何方位[42,45]。所有可学习基线使用相同条件及零样本划分。

评估指标分为两类：dB 域 Wasserstein-1 距离评价分布保真度；NMSE、PSNR 和 SSIM 评价逐单元失真。通信质量通过 $L_{\rm sweep@B}$（真实最优波束增益减去 $B$ 个候选中的最好实际增益）、角扩展误差、到达方向（DoA）误差和单波束损失 $L_{\rm BF@1}$ 评价。定位质量用零样本测试集的像素误差中位数评价。除 PSNR 与 SSIM 越大越好外，其他误差均越小越好。

### C. 分布保真度与逐单元失真

表 II 进行完整对比。RadioDiff-v2 的采样读出取得 $W_1=0.39$ dB，而早期扩散为 1.97 dB，GAN 与回归分别为 2.53 和 5.06 dB，改善倍数约 5.1 至 13.0。相同模型的估计器组合在逐单元指标上也领先：NMSE 0.184（回归 0.199）、PSNR 25.12（回归 23.28）、SSIM 0.709（回归 0.668）。图 2 表明生成模型在正确角度形成尖锐谱峰，而回归器与 GAN 输出的主峰附近仍呈现宽而嘈杂的波瓣。流匹配恢复了下游通信需要的多径角度结构，干净信号读出则在需要点估计时提供条件均值。

表 II 中两种 RadioDiff-v2 读出方式说明：感知—失真折中约束的是**单个读出方式**，而不必约束同一个模型。直接采样忠实于条件分布，但逐单元误差较大；干净信号读出与后验均值混合，则在 NMSE、PSNR、SSIM 上分别超过最强回归器 7.5%、1.84 dB、6.1%。回归器不能反向恢复它没有表示的条件分布，其 $W_1$ 因而高出一个数量级。公平性检查中，给早期扩散模型也增加相同的干净信号读出，其 NMSE 改善至 0.191，但仍低于本文估计器组合的性能。更准确的条件分布因此同时带来更准确的条件均值。

**表 II：20 个未见过环境上的零样本比较。** 分布及逐单元指标使用 50,000 条按环境分层的链路；NLOS 波束任务使用 20,000 条 NLOS 链路；LOS 通信使用完整测试集。每列所有模型使用相同链路。

| 方法 | W1 dB↓ | NMSE↓ | PSNR↑ | SSIM↑ | NLOS@1↓ | @4↓ | @8↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| RME-GAN | 2.53 | 0.217 | 22.64 | 0.584 | 12.47 | 7.28 | 4.60 |
| MS-Areg | 5.06 | 0.199 | 23.28 | 0.668 | 11.57 | 8.10 | 5.85 |
| RadioDiff | 1.97 | 0.312 | 22.99 | 0.611 | 14.23 | 10.98 | 8.50 |
| RadioDiff-v2 采样 | 0.39 | 0.351 | 22.68 | 0.576 | 13.95 | 10.90 | 8.60 |
| RadioDiff-v2 估计器组合 | 0.39 | 0.184 | 25.12 | 0.709 | 11.33 | 4.29 | 2.43 |

**表 II（续）：角扩展、LOS 通信及到达方向误差。**

| 方法 | NLOS 角扩展误差°↓ | LOS 单波束损失 dB↓ | LOS 角扩展误差°↓ | LOS DoA 误差°↓ |
|---|---:|---:|---:|---:|
| RME-GAN | 26.2 | 0.23 | 2.5 | 4.5 |
| MS-Areg | 27.6 | 0.05 | 3.0 | 2.5 |
| RadioDiff | 10.8 | 0.08 | 2.3 | 2.9 |
| RadioDiff-v2 采样 | 11.1 | 0.02 | 1.9 | 1.9 |
| RadioDiff-v2 估计器组合 | 7.60 | 0.02 | 1.9 | 1.9 |

原文“相较各列最强基线”的总改善行分别为：$W_1$ −80.2%、NMSE −7.5%、PSNR +1.84 dB、SSIM +6.1%、NLOS@1 −2.1%、@4 −41.1%、@8 −47.2%、NLOS 角扩展 −29.6%、LOS 单波束损失 −60.0%、LOS 角扩展 −17.4%、LOS DoA −24.0%。

### D. NLOS 通信

NLOS 条件下候选波束的条件规律具有真正的多模态性，因而决策规则与模型同等重要。式（16）的贝叶斯最优估计器组合将八波束扫描损失降至 2.43 dB，优于 GAN 的 4.60 dB、回归器的 5.85 dB 和早期扩散模型的 8.50 dB。四波束扫描也取得 4.29 dB，最接近基线为 7.28 dB。只探测一个波束时，尖锐点估计最重要，期望频谱规则仍得到 11.33 dB，略好于回归器的 11.57 dB。贪心集合将角扩展误差降低到 7.60°，低于早期扩散的 10.8°，远低于回归器约 27° 的误差。若简单为每个生成样本读取一个波束，则单次探测损失为 13.95 dB。可见提高性能的不仅是生成样本，还包括与目标匹配的贝叶斯决策规则，而不需要重新训练模型。

表 III 专门考察 NLOS 点估计。干净信号头的单波束损失为 11.23 dB，DoA 误差 47.4°；$K=16$ 样本的期望频谱规则分别为 11.34 dB 和 46.9°，均优于最强回归器的 11.57 dB 和 48.1°。期望频谱估计器还保持 7.60° 的角扩展误差，因而准确度不是通过过度平滑换得。该优势并非生成采样必然带来，而来自更准确的条件规律及匹配的读出策略。

**表 III：20,000 条零样本 NLOS 链路的点估计。**

| 估计器 | DoA 误差°↓ | 单波束损失 dB↓ | 角扩展误差°↓ |
|---|---:|---:|---:|
| RME-GAN | 52.0 | 12.47 | 26.2 |
| MS-Areg | 48.1 | 11.57 | 27.6 |
| RadioDiff | 59.2 | 14.23 | 10.8 |
| RadioDiff-v2 干净信号读出 | 47.4 | 11.23 | 26.6 |
| RadioDiff-v2 期望谱（K=16） | 46.9 | 11.34 | 7.60 |

### E. LOS 通信与几何基线

LOS 条件分布高度集中，问题基本适定。RadioDiff-v2 在所有 LOS 指标上表现最好：单波束损失 0.02 dB、角扩展误差 1.9°、DoA 误差 1.9°。由于直达路径可见且角度谱接近单峰，各方法总体都接近最优；绝对差距很小，但本文方法三个指标仍最精确。这支持流匹配在集中分布下表现得像尖锐回归器，而不会承受 L2 平均导致的模糊损失。

解析几何基线 COST231 说明学习为何主要在 NLOS 中不可缺少。作者在 60,000 条零样本链路上，将其几何角度类似物与真实 APS 所得理想波束比较。在 LOS 中，几何方位就是最优波束：单波束损失 0.00 dB、DoA 误差 0.6°、99.0% 链路所选波束与理想值一致。NLOS 中直达路径被遮挡，该规则失效：单波束损失上升到 12.12 dB，DoA 误差 48.0°，仅 4.6% 链路选中理想波束。RadioDiff-v2 将 NLOS 单波束损失降低到 11.34 dB，八波束扫描更降至 2.43 dB。几何基线因而同时标示了 LOS 中平凡的最优情形和 NLOS 中需要学习条件模型的失败情形。

### F. 定位

表 IV 给出第二项应用：定位。生成式模型的合适定位方式是生成式 MAP：对每个候选位置，利用其条件下观察到的 APS 的流匹配损失评分，选择评分最小的位置，并将查询真值位置排除在搜索候选之外[16]。单站生成式 MAP 的中位定位误差为 62.6 像素，比真实 APS 的理想指纹最近邻 78.0 像素低约 20%；比将 RadioDiff-v2 当普通指纹使用的 83.6 像素低约 25%。生成似然同时利用已知建筑地图与学习的条件分布，而回归器无法直接提供似然。

多站融合实验在全部 20 个测试环境中使用 577 个固定查询。独立基站似然相乘，相应流匹配损失等权相加；定位中位误差随基站数从一站的 74.7 像素，单调下降到四站的 20.6 和六站的 17.1。为了公平，回归器也获得相同的 $M$ 站信息，通过其预测地图的最近邻匹配进行融合，但从三站起就接近 41 像素并趋于饱和。这是因为简单指纹匹配缺少似然空间几何结构，额外站点不能像多条似然脊线交会那样实现三角定位。六站时，生成式 MAP 的误差优势达到约 2.4 倍。

同时也存在两项范围限制：单站定位本身约束不足，在这个多站查询子集的单站情况下，回归器融合甚至略优；此外，多站增益要求覆盖充分，而至少三发射机覆盖的接收机在数据集中仅占约 15%–20%。因此建议单站时使用直接生成式 MAP，多站时使用站点损失的等权求和。

**表 IV：零样本定位中位像素误差。**

| 单站方法 | 中位误差 px↓ |
|---|---:|
| RadioDiff-v2 作为指纹 kNN | 83.6 |
| 真实 APS 理想指纹 kNN | 78.0 |
| RadioDiff-v2 生成式 MAP | 62.6 |

| 融合方法 / 基站数量 | M=1 | M=2 | M=3 | M=4 | M=5 | M=6 |
|---|---:|---:|---:|---:|---:|---:|
| MS-Areg 地图 + kNN | 68.5 | 56.3 | 46.2 | 42.6 | 41.6 | 41.4 |
| RadioDiff-v2 联合生成式 MAP | 74.7 | 54.1 | 31.0 | 20.6 | 19.2 | 17.1 |

**图 3**：同一查询在一个、两个、四个基站条件下的联合似然空间地图。每个基站提供沿方位分布的似然脊线；随着站点增多，这些脊线相交，使后验逐步集中到真实位置。该例报告的一站误差为 137 像素，两站与四站均为 7 像素。

### G. 消融：推断阶段的采样器选择

表 V 研究无分类器引导权重，说明采样器也是独立的推断端设计选择。最小化逐单元 NMSE 的权重与最小化 Wasserstein-1 的权重不同：$w=2$ 时 NMSE 为 0.306，但 $W_1=4.47$；$w=1$ 时 NMSE 略增至 0.334，$W_1$ 却降至 0.63。在该子集上，依据 $W_1$ 选取采样器无需重训练，即可令分布保真度约提升七倍。本文部署时选 $w=1$，与表 II 的 0.39 dB 采样读出和更优波束扫描结果一致。注意表 V 与主结果来自不同子集，不能直接交叉引用数值。

**表 V：零样本测试子集上的 CFG 权重折中。**

| 引导权重 w | NMSE↓ | W1 dB↓ | 八波束损失↓ |
|---|---:|---:|---:|
| 2.0（NMSE 贪心最优） | 0.306 | 4.47 | 5.18 |
| 1.5 | 0.303 | 2.89 | 4.64 |
| 1.0（W1 最优） | 0.334 | 0.63 | 4.14 |

## VI. 结论

本文将角度无线电地图预测重新表述为感知—失真问题，提出使用流匹配训练的双分支一维扩散 Transformer RadioDiff-v2，并以按指标选择的估计器组合，从单个模型读出所有部署量。在跨环境零样本测试中，该估计器组合在全部指标上优于基线，既取得约十三倍的分布保真优势，又达到回归级逐单元精度、贝叶斯最优波束选择，以及在回归地图融合趋于饱和时仍随基站数增加而改善的多站似然定位。这样，一张零样本地图便能同时支持频谱重建、多波束选择和环境感知 6G 接收机定位。未来工作将把条件密度拓展至宽带和区分俯仰角的频谱，使频率选择性与三维波束管理也能够纳入同一生成框架。

## 参考文献（保留原论文 46 条英文著录）

参考文献中的作者、论文题名、出版物与页码按原文保留英文，避免翻译后的书目信息影响检索。

[1] N. Cheng, F. Chen, W. Chen, Z. Cheng, Q. Yang, C. Li, and X. Shen, “6G omni-scenario on-demand services provisioning: vision, technology and prospect (in Chinese),” *Sci Sin Inform*, 54(5):1025–1054, 2024.

[2] N. Docomo et al., “5g channel model for bands up to 100 ghz,” Technical report, 2016.

[3] H. Li, K. Gupta, C. Wang, N. Ghose, and B. Wang, “RadioNet: Robust deep-learning based radio fingerprinting,” *IEEE CNS*, pp. 190–198, 2022.

[4] S. Zhang, S. Jiang, W. Lin, Z. Fang, K. Liu, H. Zhang, and K. Chen, “Generative ai on spectrumnet: An open benchmark of multiband 3d radio maps,” *IEEE Trans. Cognit. Commun. Networking*, 11(2):886–901, 2025.

[5] G. Sun, W. Xie, D. Niyato, F. Mei, J. Kang, H. Du, and S. Mao, “Generative ai for deep reinforcement learning: Framework, analysis, and use cases,” *IEEE Wireless Commun.*, 32(3):186–195, 2025.

[6] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “RadioUNet: Fast radio map estimation with convolutional neural networks,” *IEEE Trans. Wireless Commun.*, 20(6):4001–4015, 2021.

[7] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, “Radiodiff: An effective generative diffusion model for sampling-free dynamic radio map construction,” *IEEE Trans. Cognit. Commun. Networking*, 11(2):738–750, 2025.

[8] O. Ronneberger, P. Fischer, and T. Brox, “U-net: Convolutional networks for biomedical image segmentation,” *MICCAI*, Springer, pp. 234–241, 2015.

[9] S. Zhang, A. Wijesinghe, and Z. Ding, “RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network,” *IEEE Internet Things J.*, 10(20):18016–18027, 2023.

[10] A. Creswell, T. White, V. Dumoulin, K. Arulkumaran, B. Sengupta, and A. A. Bharath, “Generative adversarial networks: An overview,” *IEEE Signal Process. Mag.*, 35(1):53–65, 2018.

[11] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, “Radiodiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction,” *IEEE J. Sel. Areas Commun.*, 44:2318–2333, 2026.

[12] Y. Blau and T. Michaeli, “The perception-distortion tradeoff,” *CVPR*, pp. 6228–6237, 2018.

[13] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, “Flow matching for generative modeling,” *ICLR*, 2023.

[14] X. Liu, C. Gong, and Q. Liu, “Flow straight and fast: Learning to generate and transfer data with rectified flow,” *ICLR*, 2023.

[15] W. Peebles and S. Xie, “Scalable diffusion models with transformers,” *ICCV*, pp. 4172–4182, 2023.

[16] Ç. Yapar, R. Levie, G. Kutyniok, and G. Caire, “Locunet: Fast urban positioning using radio maps and deep learning,” *ICASSP*, pp. 4063–4067, 2022.

[17] X. Wang, X. Wang, S. Mao, J. Zhang, S. C. Periaswamy, and J. Patton, “Indoor radio map construction and localization with deep gaussian processes,” *IEEE Internet Things J.*, 7(11):11238–11249, 2020.

[18] Y. Zeng and X. Xu, “Toward environment-aware 6G communications via channel knowledge map,” *IEEE Wireless Commun.*, 28(3):84–91, 2021.

[19] X. Wang, Y. Pan, N. Cheng, Ç. Yapar, R. Sun, Z. Yin, C. Zhou, W. Xu, Y. Zhang, J. Zhang, S. Cui, and X. Shen, “A tutorial on learning-based radio map construction: Data, paradigms, and physics-awareness,” arXiv:2603.17499, 2026.

[20] X. Wang, Z. Fang, N. Cheng, R. Sun, H. Zhou, Z. Su, Z. Li, and X. Shen, “Radiodiff-inverse: Diffusion enhanced bayesian inverse estimation for isac radio map construction,” *IEEE Trans. Wireless Commun.*, 25:14611–14626, 2026.

[21] X. Wang, T. Yuan, Y. Cao, N. Cheng, R. Sun, and W. Zhuang, “iRadioDiff: Physics-informed diffusion model for indoor radio map construction and localization,” arXiv:2511.20015, 2025.

[22] X. Wang, Z. Guo, and N. Cheng, “RadioDiff-FS: Physics-informed manifold alignment in few-shot diffusion models for high-fidelity radio map construction,” arXiv:2603.18865, 2026.

[23] X. Wang, P. Zheng, H. Jia, N. Cheng, R. Sun, C. Zhou, and X. Shen, “RadioDiff-flux: Efficient radio map construction via generative denoise diffusion model trajectory midpoint reuse,” *IEEE Trans. Cognit. Commun. Networking*, 12:4882–4895, 2026.

[24] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, “Radiogat: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks,” *IEEE Trans. Wireless Commun.*, 23(11):17777–17792, 2024.

[25] F. Jaensch, G. Caire, and B. Demir, “Radio map estimation–an open dataset with directive transmitter antennas and initial experiments,” arXiv:2402.00878, 2024.

[26] D. Wu, Z. Wu, Y. Qiu, S. Fu, and Y. Zeng, “Ckmimagenet: A comprehensive dataset to enable channel knowledge map construction via computer vision,” *IEEE/CIC ICCC Workshops*, pp. 114–119, 2024.

[27] X. Wang, Q. Zhang, N. Cheng, J. Chen, Z. Zhang, Z. Li, S. Cui, and X. Shen, “RadioDiff-3D: A 3D×3D radio map dataset and generative diffusion based benchmark for 6G environment-aware communication,” *IEEE Trans. Netw. Sci. Eng.*, 13:3773–3789, 2026.

[28] J. Ho, A. Jain, and P. Abbeel, “Denoising diffusion probabilistic models,” *NeurIPS*, 33:6840–6851, 2020.

[29] J. Song, C. Meng, and S. Ermon, “Denoising diffusion implicit models,” *ICLR*, pp. 1–12, 2021.

[30] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, “Score-based generative modeling through stochastic differential equations,” *ICLR*, 2021.

[31] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, “High-resolution image synthesis with latent diffusion models,” *CVPR*, pp. 10674–10685, 2022.

[32] A. Nichol, P. Dhariwal, A. Ramesh, P. Shyam, P. Mishkin, B. McGrew, I. Sutskever, and M. Chen, “Glide: Towards photorealistic image generation and editing with text-guided diffusion models,” *ICML*, PMLR 162:16784–16804, 2022.

[33] Y. Huang, Z. Qin, X. Liu, and K. Xu, “Decoupled diffusion models with explicit transition probability,” arXiv:2306.13720, 2023.

[34] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, “Attention is all you need,” *NeurIPS*, 30, 2017.

[35] F.-A. Croitoru, V. Hondru, R. T. Ionescu, and M. Shah, “Diffusion models in vision: A survey,” *IEEE Trans. Pattern Anal. Mach.*, 45(9):10850–10869, 2023.

[36] R. Liu, B. P. L. Lau, K. Ismail, A. Chathuranga, C. Yuen, S. X. Yang, Y. L. Guan, S. Mao, and U.-X. Tan, “Exploiting radio fingerprints for simultaneous localization and mapping,” *IEEE Pervasive Comput.*, 22(3):38–46, 2023.

[37] Y. Kang, J. Kang, J. Wen, T. Zhang, Z. Yang, D. Niyato, and Y. Zhang, “Confidence-regulated generative diffusion models for reliable ai agent migration in vehicular metaverses,” arXiv:2505.12710, 2025.

[38] M. Zhou, L. Ying, L. Lu, L. Shi, J. Zi, and Z. Yu, “Electromagnetic scattering laws in weyl systems,” *Nature Commun.*, 8(1):1388, 2017.

[39] G. A. Deschamps, “Ray techniques in electromagnetics,” *Proc. IEEE*, 60(9):1022–1035, 1972.

[40] J. Huang, X. Wang, N. Cheng, K. Wang, R. Sun, and Z. Yin, “Map2aps: A physically grounded benchmark for direct angle power spectrum prediction from urban geometry,” arXiv:2605.14989, 2026.

[41] A. Alkhateeb, “Deepmimo: A generic deep learning dataset for millimeter wave and massive mimo applications,” arXiv:1902.06435, 2019.

[42] R. Wahl, G. Wölfle, P. Wertz, P. Wildbolz, and F. Landstorfer, “Dominant path prediction model for urban scenarios,” *14th IST Mobile and Wireless Communications Summit*, pp. 1–5, 2005.

[43] J. Ho and T. Salimans, “Classifier-free diffusion guidance,” 2022.

[44] G. Peyré and M. Cuturi, “Computational optimal transport: With applications to data science,” *Found. Trends Mach. Learn.*, 11(5–6):355–607, 2019.

[45] E. Damosso and L. M. Correia, “Digital mobile radio towards future generation systems—COST action 231 final report,” European Commission, Brussels, Belgium, Tech. Rep. EUR 18957, 1999.

[46] Z. Wang, A. C. Bovik, H. R. Sheikh, and E. P. Simoncelli, “Image quality assessment: from error visibility to structural similarity,” *IEEE Trans. Image Processing*, 13(4):600–612, 2004.

## 学术核验提示（非原文）

原文在定位实验中，将流匹配训练误差作为候选位置的“条件似然”或“负对数似然（差常数）”评分。把该评分用于定位是原论文实际做法；但一般流匹配损失并不直接等于严格归一化的条件对数似然。引用时宜区分“生成式条件评分”和“精确概率密度求值”。



---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
