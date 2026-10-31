---
layout: page
title: "线性逆问题扩散模型的后验信息动力学｜中文全文译文"
permalink: /papers/translations/2026-09-16-2608-21709-posterior-information-dynamics-of-diffusion-models-for-linear-inverse/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e3c20b8cdc120a52/) · [原文 arXiv](https://arxiv.org/abs/2608.21709) · [全部目录](/papers/catalog/)

# 线性逆问题扩散模型的后验信息动力学

**原题：** Posterior Information Dynamics of Diffusion Models for Linear Inverse Problems  
**作者：** Xiangming Meng（浙江大学 ZJU-UIUC 联合学院，中国浙江海宁 314400）  
**版本：** arXiv:2608.21709v1（cs.LG），2026 年 8 月 22 日提交，原文 49 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1—8 节、附录 A—B、表 1—表 2、图 1—图 9 图注与参考文献（英文原条目）按原文结构录入；附录证明按原文结构译出关键步骤（详见页尾说明）；逐句逐式终校未做。

## 摘要

扩散模型被广泛用作线性逆问题的先验，但**端点质量并不能揭示测量信息在何时进入反向去噪、又如何分配到各信号方向**。本文通过**平滑似然力**（每个噪声水平上精确后验分数与先验分数之差）研究这一过程。对固定测量，其期望平方范数同时给出后验—先验相对熵的耗散与反向路径相对熵的增长；对测量取平均则得到把信息增益与去噪误差下降联系起来的信息—最小均方误差（I-MMSE）恒等式。在二阶矩有限时，力能量及其与先验分数能量之比在高噪声处按加噪核信号系数的平方衰减。可解模型表明：条件化会去除测量已解释的类别分离；把 $n$ 个经验样本上的均匀索引熵从 $\log n$ 降到 $H(I\mid r)$；并使同化过程在奇异值完全相同时仍依赖**算子—先验对齐**。在后验可处理模型中的实验评估了这些预测；另在冻结的 FFHQ 模型上做一个独立示例，表明共享同一频谱的掩膜会产生不同的先验归一化零空间轨迹统计量。

**关键词：** 扩散模型；线性逆问题；后验信息动力学；平滑似然力；后验采样。

## 1 引言

扩散与基于分数的模型通过反转一个随机加噪过程来生成样本 [Sohl-Dickstein et al., 2015, Song and Ermon, 2019, Ho et al., 2020, Song et al., 2021b]。反向轨迹并不只是从噪声到最终样本的一条路径。近期精确分数分析识别出布朗、物种分化（speciation）与坍缩等区间，在其中粗尺度、随后细尺度的不确定性被逐步解析 [Biroli et al., 2024, Raya and Ambrogioni, 2023, Sclocchi et al., 2025, Li and Chen, 2024, Ambrogioni, 2025]。这一动力学图景引出本文研究的问题：当以线性逆问题测量为条件时，**哪些不确定性由测量直接去除、哪些留待反向去噪解析、剩余不确定性又如何分布在信号方向上？**

线性逆问题试图从间接含噪测量

$$
r=Ax_0+\varepsilon,\tag{1}
$$

中恢复未知信号 $x_0\in\mathbb R^{d}$，其中 $A$ 为已知线性算子，$r$ 为测量，$\varepsilon$ 为测量噪声。秩亏、条件数差或噪声通常会留下与同一测量相容的多个信号，因此推断目标是**后验分布**而非唯一逆。取 $A$ 为恒等、掩膜、卷积或降采样算子，分别得到去噪、修复（inpainting）、去模糊与超分辨。

扩散先验已通过基于分数与似然引导的后验采样 [Song et al., 2022, Jalal et al., 2021, Chung et al., 2023, Meng and Kabashima, 2025]、算子感知的谱与零空间构造 [Kawar et al., 2022, Wang et al., 2023]、伪逆引导 [Song et al., 2023] 以及变分或即插即用表述 [Mardani et al., 2024, Zhu et al., 2023] 被引入逆求解器。这些方法通常以最终重建质量评估，但端点指标不能刻画条件轨迹：它们无法区分**测量直接去除的不确定性**与**去噪稍后解析的不确定性**，也无法显示这种划分如何在信号方向上变化；无条件动力学图景同样不能不加修改地迁移。条件化可在含噪状态提供额外证据之前建立类别偏好、重加权经验先验的合理元素，并区分强观测方向与弱观测或零空间方向。因此条件理论必须把测量直接提供的信息与去噪期间解析的信息分开，同时保留 $A$ 诱导的几何。

主要分析障碍在于**似然与演化状态的不匹配**：$p(r\mid x_0)$ 定义在干净信号 $x_0$ 处，而反向扩散演化的却是含噪状态 $X_t=x$。在噪声水平 $t$，测量对后验分数的精确贡献为

$$
g_t(x,r)=\nabla_x\log p_t(x\mid r)-\nabla_x\log p_t(x)=\nabla_x\log p(r\mid X_t=x),\tag{2}
$$

其中 $p_t$ 与 $p_t(\cdot\mid r)$ 为加噪先验与后验边缘分布。本文称 $g_t$ 为**平滑似然力**。与在去噪估计处评估的干净空间残差不同，它把测量似然在给定 $X_t=x$ 时 $X_0$ 的剩余不确定性上做平均。对一般先验，评估 $g_t$ 需要 $X_0\mid X_t=x$ 的条件律，因此一般没有与模型无关的闭式解。近期工作估计后验分数或分析特定后验采样路径 [Mammadov et al., 2026, Delgadino et al., 2026, Crafts et al., 2026]；本文分析是互补的：在引入采样近似之前推导 $g_t$ 所服从的**精确信息律**。

关键观察是：条件化改变了初始律，但没有改变前向加噪机制。对每个固定 $r$，$p_t(\cdot\mid r)$ 与 $p_t$ 因此在同一个扩散半群下演化，使 $g_t$ 成为二者的**相对分数**。尽管该向量场未必逐点可得，其能量却容许精确刻画：相对 de Bruijn 恒等式把该能量与 $\mathrm{KL}(p_t(\cdot\mid r)\,\Vert\,p_t)$ 的前向时间耗散等同 [Föllmer, 1985]；精确时间反转与有限熵 Girsanov 理论把其累积能量连同终端边缘散度识别为反向路径相对熵 [Anderson, 1982, Haussmann and Pardoux, 1986, Léonard, 2012]。对测量取平均得到反向时间信息增益与去噪误差下降之间的 I-MMSE 关系 [Guo et al., 2005]；条件 Tweedie 恒等式则把 $g_t$ 表示为测量条件去噪器与无条件去噪器之差的缩放 [Louis, 1982, Efron, 2011]。这些恒等式回答了核心问题的时间部分——量化有多少测量信息存在、以及何时获得。可解模型随后描述剩余不确定性如何在类别、经验解释与算子对齐方向上分配。

本文主要贡献如下。

1. 本文推导**固定测量信息预算**，其瞬时速率即条件力能量；其积分连同终端边缘散度决定精确的后验—先验反向路径分离。对测量取平均得到相应 I-MMSE 表示。在含噪状态与测量的联合律下，本文进一步证明：在二阶矩有限时，力能量及其与先验分数能量之比在高噪声处按加噪核信号系数**平方**衰减。
2. 本文识别条件化改变沿扩散轨迹所解析不确定性的三种方式。在高斯混合中，只有测量未解释的类别分离才能产生新的类别承诺。对支撑于 $n$ 个样本的均匀经验先验（以 $I$ 表示采样支撑索引），测量把剩余解释预算从 $H(I)=\log n$ 降为条件 Shannon 熵 $H(I\mid r)$。在各向异性高斯模型中，即使算子奇异谱相同，由于**算子—先验对齐**不同，信息增益、后验收缩与反向路径分离仍可不同。
3. 本文在有限混合、经验先验与高斯模型中评估上述精确量，并用所得时间与子空间坐标研究由在 Flickr-Faces-HQ（FFHQ）人脸数据集 [Karras et al., 2019] 上训练的**冻结**扩散模型驱动的近似采样器。以固定检查点与固定频谱掩膜库进行的该学习模型示例，考察经验零空间轨迹统计量如何随掩膜几何变化；它不是对高斯极值结果的直接检验。

第 2 节介绍概率设置、记号与前向加噪过程；第 3 节回顾相关工作；第 4 节发展后验力及其信息恒等式；第 5 节分析可解模型中的剩余类别信息、经验解释解析与方向性分配；第 6 节综合这些对象并把它们与近似采样器可用的观测量联系起来；第 7 节给出精确模型与神经轨迹研究；第 8 节总结。证明与支持性实验细节收于附录。

## 2 背景与问题设置

**记号与前向加噪。** 随机变量用大写字母、实现值用小写字母表示。干净信号为 $X_0\in\mathbb R^{d}$，固定干净实现记为 $x_0$，随机测量为 $R$，实现测量记为 $r$。用 $P_0$ 表示干净数据律，存在时用 $p_0$ 表示其密度。

分析使用**方差保持 Ornstein–Uhlenbeck 加噪过程** [Uhlenbeck and Ornstein, 1930, Ho et al., 2020, Song et al., 2021b]：

$$
X_t=a_tX_0+\sqrt{\Delta_t}\,\xi,\qquad a_t=e^{-t},\quad\Delta_t=1-e^{-2t},\quad\xi\sim\mathcal N(\mathbf 0,\mathbf I_d).\tag{3}
$$

其连续时间实现为

$$
\mathrm dX_t=-X_t\,\mathrm dt+\sqrt{2}\,\mathrm dW_t,\tag{4}
$$

其中 $W$ 为标准 $d$ 维 Brownian 运动。转移密度为

$$
q_t(x\mid x_0)=(2\pi\Delta_t)^{-d/2}\exp\left\{-\frac{\lVert x-a_tx_0\rVert^{2}}{2\Delta_t}\right\},\tag{5}
$$

且对每个 $t>0$，加噪先验具有密度

$$
p_t(x)=\mathbb E\left[q_t(x\mid X_0)\right].\tag{6}
$$

当 $P_0$ 有密度 $p_0$ 时，(6) 中期望为 $\int q_t(x\mid x_0)p_0(x_0)\,\mathrm dx_0$；对经验先验则是有限和。无条件分数为

$$
s_t^{\mathrm{prior}}(x)=\nabla_x\log p_t(x).\tag{7}
$$

对终端时间 $T$ 与递增的反向时钟 $u\in[0,T]$，记 $Z_u=X_{T-u}$。当标准时间反转条件成立时 [Anderson, 1982, Haussmann and Pardoux, 1986]，先验反向过程满足

$$
\mathrm dZ_u=\left\{Z_u+2s_{T-u}^{\mathrm{prior}}(Z_u)\right\}\mathrm du+\sqrt{2}\,\mathrm dW_u,\tag{8}
$$

其中 $W$ 为反向 filtration 下的 Brownian 运动。本文研究的问题是：一旦干净律以测量为条件，该反向漂移如何改变。

**测量与后验动力学。** 设 $(R,\nu)$ 为带 sigma-有限支配测度的测量空间，$p(r\mid x_0)$ 表示关于 $\nu$ 的密度（或概率质量函数）。本文的常设假设为

$$
R\perp X_t\mid X_0,\tag{9}
$$

等价地，给定干净信号时测量与前向噪声条件独立。该假设允许任意干净空间似然，也是第 4 节使用的分解。

对线性高斯逆问题，$R=\mathbb R^{d_y}$ 且

$$
R=AX_0+\varepsilon,\qquad A\in\mathbb R^{d_y\times d},\qquad\varepsilon\sim\mathcal N(\mathbf 0,\Gamma),\ \Gamma\succ0,
$$

其中 $\varepsilon$ 与 $X_0$ 及前向噪声独立。记 $r_A=\operatorname{rank}(A)$。测量边缘密度为 $p_R(r)=\mathbb E[p(r\mid X_0)]$。

固定满足 $0<p_R(r)<\infty$ 的 $r$，令 $P_0(\cdot\mid r)$ 表示干净后验律；其加噪密度为

$$
p_t(x\mid r)=\mathbb E\left[q_t(x\mid X_0)\mid R=r\right].\tag{10}
$$

精确后验分数为

$$
s_t^{r}(x)=\nabla_x\log p_t(x\mid r),\tag{11}
$$

相应反向过程为

$$
\mathrm dZ_u^{r}=\left\{Z_u^{r}+2s_{T-u}^{r}(Z_u^{r})\right\}\mathrm du+\sqrt{2}\,\mathrm dW_u^{r},\tag{12}
$$

由 $p_T(\cdot\mid r)$ 初始化，$W^{r}$ 为相应反向时间 Brownian 运动。第 4 节把 $s_t^{r}-s_t^{\mathrm{prior}}$ 识别为平滑似然力。在归一化 (4) 下，该力的两倍恰是后验与先验反向漂移之差。

**算子几何。** 线性算子把可测方向与不可测方向分开。本文用 $A^{\top}$ 表示欧氏伴随、$A^{\dagger}$ 表示 Moore–Penrose 伪逆；当该区分相关时，使用

$$
P_A=A^{\dagger}A,\qquad P_A^{\perp}=\mathbf I_d-P_A\tag{13}
$$

作为欧氏行空间与零空间投影算子。这些投影算子为后续子空间分析提供诊断坐标。在各向同性线性高斯参考之外，精确力不必具有行空间支撑，因为先验依赖可使测量影响跨欧氏坐标传递。

**经验先验与索引不确定性。** 对经验先验

$$
P_0^{\mathrm{emp}}=\frac{1}{n}\sum_{i=1}^{n}\delta_{x_i},\tag{14}
$$

可等价地从 $\{1,\ldots,n\}$ 均匀采样索引 $I$ 并令 $X_0=x_I$。在精确分数无条件理论中，反向动力学呈现高噪声布朗行为、中间对粗结构的承诺与低噪声围绕单个训练样本的坍缩 [Biroli et al., 2024]。均匀索引的熵为 $\log n$。

对固定测量 $r$，条件化赋予后验权重

$$
w_i(r)=P(I=i\mid R=r),\tag{15}
$$

其 Shannon 熵为 $H(I\mid r)=-\sum_iw_i(r)\log w_i(r)$。状态解析信息 $I(I;X_t\mid R=r)$ 度量该条件索引不确定性在噪声水平 $t$ 已被解析的程度。第 5.2 节展开该分解，第 6.1 节把它与命题 4.11 的测量—状态信息联系起来。

## 3 相关工作

**扩散动力学与信息恒等式。** 扩散模型通过反转随机加噪过程生成样本 [Sohl-Dickstein et al., 2015, Song and Ermon, 2019, Ho et al., 2020, Song et al., 2021b]；去噪分数匹配把去噪与分数估计联系起来 [Vincent, 2011]。精确分数分析把该反转解释为渐进不确定性解析，并识别无条件模型中的布朗、物种分化与经验坍缩行为 [Biroli et al., 2024, Raya and Ambrogioni, 2023, Sclocchi et al., 2025, Li and Chen, 2024, Ambrogioni, 2025]；扩展工作处理离散状态空间 [Takahashi et al., 2026]、多峰与更一般的类别结构 [Albrychiewicz et al., 2026, Achilli et al., 2026] 以及受控或训练模型动力学 [Lu and Tang, 2026, Handke et al., 2026]。下文所用信息恒等式有互补来源：沿共同扩散半群的相对熵以相对 Fisher 信息速率耗散 [Föllmer, 1985]，而时间反转给出相关路径测度关系 [Anderson, 1982, Haussmann and Pardoux, 1986, Léonard, 2012]。I-MMSE 恒等式把高斯信道信息增长与条件均方误差联系起来 [Guo et al., 2005]，并已被应用于扩散似然 [Kong et al., 2023]；MMG 通过沿扩散信道积分条件与无条件去噪误差之差估计互信息 [Yu et al., 2026]，分数差路径能量同样给出 KL 与互信息估计量 [Franzese et al., 2024]。Fisher 与 Tweedie 恒等式把分数与条件均值联系起来 [Louis, 1982, Efron, 2011]。本文把这些既有恒等式在**固定逆问题测量**处耦合起来，从而在选定采样器近似之前连接力能量、边缘 KL 耗散、反向路径 KL 与经验信息解析。

**后验分数与条件采样器。** 预训练扩散先验支持似然引导采样器 [Song et al., 2022, Jalal et al., 2021, Chung et al., 2023]。似然—分数近似处理高斯与量化测量 [Meng and Kabashima, 2023, 2024, 2025]；其他方法包括算子感知的谱、零空间与伪逆方法 [Kawar et al., 2022, Wang et al., 2023, Song et al., 2023]、后验矩近似 [Boys et al., 2024]、基于去噪器的方法 [Kadkhodaie and Simoncelli, 2021] 以及变分或即插即用表述 [Mardani et al., 2024, Zhu et al., 2023]。Mammadov 等 [2026] 为线性高斯逆问题推导了闭式后验分数表示，并将其用作精确后验分数（EPS）训练目标。Jiao 等 [2026] 则发展了一种坐标式采样器，按奇异方向信噪比在先验与测量预测器之间切换，并使用 DDIM 更新 [Song et al., 2021a]。粒子方法提供了另一条路线：TDS 通过序贯 Monte Carlo 保持渐近精确性 [Wu et al., 2023]，MCGdiff 采样中间线性逆后验 [Cardoso et al., 2024]。相关工作估计去噪后验协方差 [Peng et al., 2024]，或把条件互信息作为算法目标 [Hamidi and Yang, 2025]。

**轨迹层面分析**关注近似采样器的误差。Delgadino 等 [2026] 通过 Feynman–Kac 表示刻画类 DPS 路径的累积偏差与稳定性；Crafts 等 [2026] 研究似然加权的路径空间控制。这些工作构造条件采样器或将近似受控路径与目标比较。本文的互补问题先于该选择：**精确后验—先验分数差服从什么信息律？** 特别地，本文的路径恒等式比较由同一前向半群生成的精确先验与后验反向律，而非近似路径的偏差。

**经验先验、条件熵与记忆。** 对经验或码本先验，无条件坍缩由识别支撑元素所需的信息支配 [Biroli et al., 2024]。Hunt 等 [2026] 通过比较受限含噪观测中的信息与 $\log n$（$n$ 为训练样本数）刻画记忆—泛化边界。Nguyen 等 [2026] 为经过训练的卷积逆求解器在经验分布下推导局部等变 MMSE 近似。对本文的固定测量经验后验，测量提供 $\log n-H(I\mid r)$ 纳特的索引信息，把 $H(I\mid r)$ 留给反向去噪。这与记忆与抽取 [Carlini et al., 2023, Somepalli et al., 2023] 相关，尽管本文的形式结果仍局限于显式线性似然与标定后验权重。

**算子几何。** 经典高斯逆问题使先验协方差与测量子空间之间的交互显式化；扩散恢复方法利用相同的奇异向量与行／零空间几何 [Kawar et al., 2022, Wang et al., 2023, Song et al., 2023]。本文的匹配谱结果固定奇异值、只改变其相对各向异性先验的取向。在干净端点，选取主先验子空间是经典高斯 D-最优设计问题 [Chaloner and Verdinelli, 1995]；本文结果把同一取向排序推广到每个有限高斯信道 SNR，因而推广到反向路径信息预算。神经掩膜实验只问奇异谱是否足以决定冻结学习轨迹的统计量，而不检验高斯极值公式。

## 4 基础恒等式与后验力预算

### 4.1 后验分数与去噪器恒等式

在条件独立假设 (9) 下，贝叶斯公式给出

$$
p_t(x\mid r)=\frac{p_t(x)p(r\mid X_t=x)}{p_R(r)},\qquad p(r\mid X_t=x)=\mathbb E\left[p(r\mid X_0)\mid X_t=x\right],\tag{16}
$$

只要相关密度存在。对 $x$ 求导得

$$
\nabla_x\log p_t(x\mid r)=\nabla_x\log p_t(x)+\nabla_x\log p(r\mid X_t=x).\tag{17}
$$

第二项

$$
g_t(x,r):=\nabla_x\log p(r\mid X_t=x)
$$

即引言中引入的平滑似然力：它把干净空间似然在 $X_0\mid X_t=x$ 上平均，而非在干净信号的点估计处评估该似然。Fisher 隐变量分数恒等式 $\nabla_y\log\int p(y,z)\,\mathrm dz=\mathbb E[\nabla_y\log p(y,Z)\mid y]$ [Louis, 1982] 把该力变成条件去噪器之差。

**引理 4.1（条件 Tweedie 恒等式）。** 假设 $\mathbb E\lVert X_0\rVert^{2}<\infty$，且求导可与 (6)、(10) 中的加噪积分交换。对 $t>0$ 定义

$$
m_t(x)=\mathbb E\left[X_0\mid X_t=x\right],\qquad m_t^{r}(x)=\mathbb E\left[X_0\mid X_t=x,R=r\right].
$$

则对每个满足 $0<p_R(r)<\infty$ 的 $r$，

$$
\nabla_x\log p_t(x\mid r)=\frac{a_tm_t^{r}(x)-x}{\Delta_t},\tag{18}
$$

且平滑似然力为

$$
g_t(x,r):=\nabla_x\log p(r\mid X_t=x)=\frac{a_t}{\Delta_t}\left\{m_t^{r}(x)-m_t(x)\right\}.\tag{19}
$$

该 Tweedie 公式的条件形式是标准的 [Efron, 2011, Boys et al., 2024, Mammadov et al., 2026]；此处它提供从精确后验分数通往下述力能量与信息恒等式的桥梁。

### 4.2 固定测量后验信息预算

引理 4.1 中的分数差也是同一 Ornstein–Uhlenbeck 半群传播的两个律的相对分数。因此其能量在每个固定测量处控制后验—先验可区分性的损失。

**定理 4.2（固定测量后验信息预算）。** 固定满足 $0<p_R(r)<\infty$ 的测量值 $r$，定义

$$
q_t^{r}(x):=p_t(x\mid r),\qquad K_t(r):=\mathrm{KL}\left(q_t^{r}\,\Vert\,p_t\right).
$$

设 $0<s<t<\infty$。假设 $K_s(r)<\infty$、相对 Fisher 信息 $\int q_u^{r}(x)\left\lVert\nabla\log\frac{q_u^{r}(x)}{p_u(x)}\right\rVert^{2}\mathrm dx$ 在 $u\in[s,t]$ 上可积、且分部积分边界项消失。则

$$
K_s(r)-K_t(r)=\int_s^{t}\mathbb E_{X_u\mid r}\left\lVert g_u(X_u,r)\right\rVert^{2}\mathrm du.\tag{20}
$$

从而对几乎每个 $t>0$（并在每个可微点处）

$$
-\frac{\mathrm d}{\mathrm dt}K_t(r)=\mathbb E_{X_t\mid r}\left\lVert g_t(X_t,r)\right\rVert^{2}.\tag{21}
$$

对测量取平均得

$$
I(R;X_s)-I(R;X_t)=\int_s^{t}\mathbb E\left\lVert g_u(X_u,R)\right\rVert^{2}\mathrm du,\qquad
-\frac{\mathrm d}{\mathrm dt}I(R;X_t)=\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}\tag{22}
$$

（只要导数存在）。因此力能量是后验—先验相对熵的**前向时间耗散率**，也是相应的**反向时间同化率**。

这是共同扩散半群的相对 de Bruijn 恒等式 [Föllmer, 1985]。式 (21) 使用扩散时间；下文命题 4.11 将把其测量平均按高斯信道信噪比重参数化。

**引理 4.3（可解模型类中的正则性）。** 定理 4.2 的正则性条件连同下文所用端点极限，在以下任一设置中成立。

1. $P_0=\sum_{i=1}^{n}\pi_i\delta_{x_i}$ 为有限支撑且 $\pi_i>0$，$P_0(\cdot\mid r)=\sum_iw_i(r)\delta_{x_i}$。若支撑点两两不同，则 $\lim_{t\to0^{+}}K_t(r)=\sum_{i=1}^{n}w_i(r)\log\frac{w_i(r)}{\pi_i}$。
2. $P_0=\mathcal N(\mu,\Sigma)$ 且 $P_0(\cdot\mid r)=\mathcal N(\mu_r,S_r)$，其中 $\Sigma\succ0$、$S_r\succ0$。

两种情形都有 $\lim_{t\to\infty}K_t(r)=0$；在每个紧区间 $0<s<t<\infty$ 上，下文反向路径律具有有限相对熵。

**推论 4.4（精确后验—先验反向路径相对熵）。** 固定 $T>t>0$。在反向时钟 $u\in[0,T-t]$ 上，令 $Q_{[t,T]}^{r,\mathrm{rev}}$ 与 $P_{[t,T]}^{\mathrm{rev}}$ 分别为从 $q_t^{r}$ 与 $p_t$ 初始化的前向 OU 路径律的时间反转推前。当加噪边缘光滑且为正时，它们与从 $q_T^{r}$、$p_T$ 初始化的反向过程 (12) 与 (8) 一致。假设定理 4.2 的假设在 $[t,T]$ 上成立，则

$$
\mathrm{KL}\left(Q_{[t,T]}^{r,\mathrm{rev}}\,\Vert\,P_{[t,T]}^{\mathrm{rev}}\right)=K_t(r)=K_T(r)+\int_t^{T}\mathbb E_{X_u\mid r}\left\lVert g_u(X_u,r)\right\rVert^{2}\mathrm du.\tag{23}
$$

在归一化 $\mathrm dX_t=-X_t\mathrm dt+\sqrt2\mathrm dW_t$ 下，积分的系数为一：两个反向漂移相差 $2g_t$。该路径恒等式使用精确的 $T$ 时刻先验与后验边缘；从共同近似高斯初始化两个反向过程会额外引入终端失配。

**推论 4.5（高噪声反向路径接近性）。** 在推论 4.4 下假设 $\operatorname{Tr}\operatorname{Cov}(X_0)<\infty$，令 $\gamma_t=a_t^{2}/\Delta_t$、$Y_{\gamma_t}=X_t/\sqrt{\Delta_t}$。则对每个 $T>t>0$，

$$
\mathbb E_R\,\mathrm{KL}\left(Q_{[t,T]}^{R,\mathrm{rev}}\,\Vert\,P_{[t,T]}^{\mathrm{rev}}\right)=I(R;X_t)=I(R;Y_{\gamma_t})\le I(X_0;Y_{\gamma_t})\le\frac{1}{2}\log\det\left(\mathbf I_d+\gamma_t\operatorname{Cov}(X_0)\right)\le\frac{\gamma_t}{2}\operatorname{Tr}\operatorname{Cov}(X_0).\tag{24}
$$

因此，若 $d^{-1}\operatorname{Tr}\operatorname{Cov}(X_0)\le C_0$ 且 $\Delta_t\ge\Delta_0>0$，则每坐标平均反向路径 KL 至多为 $C_0a_t^{2}/(2\Delta_0)$。Pinsker 不等式与 Jensen 不等式还给出

$$
\mathbb E_R\left\lVert Q_{[t,T]}^{R,\mathrm{rev}}-P_{[t,T]}^{\mathrm{rev}}\right\rVert_{\mathrm{TV}}\le\sqrt{\frac{\gamma_t}{4}\operatorname{Tr}\operatorname{Cov}(X_0)}.\tag{25}
$$

这里 $\lVert\mu-\nu\rVert_{\mathrm{TV}}:=\sup_B|\mu(B)-\nu(B)|=\frac{1}{2}\int|\mathrm d\mu-\mathrm d\nu|$。KL 界按维数自然归一化；全变差界在固定维数下随 $a_t\to0$ 消失，并在满足 $da_t^{2}\to0$（在高噪声窗口上）的维数序列中消失。

**推论 4.6（积分领先量）。** 假设 $P_0(\cdot\mid r)\ll P_0$、$\mathrm{KL}(P_0(\cdot\mid r)\,\Vert\,P_0)<\infty$，且定理 4.2 的端点极限成立。则

$$
\int_0^{\infty}\mathbb E_{X_t\mid r}\left\lVert g_t(X_t,r)\right\rVert^{2}\mathrm dt=\mathrm{KL}\left(P_0(\cdot\mid r)\,\Vert\,P_0\right).\tag{26}
$$

对两两不同点上的均匀经验先验，

$$
\int_0^{\infty}\mathbb E_{X_t\mid r}\left\lVert g_t(X_t,r)\right\rVert^{2}\mathrm dt=\sum_{i=1}^{n}w_i(r)\log\left\{nw_i(r)\right\}=\log n-H(I\mid r).\tag{27}
$$

因此在固定 $r$ 下，测量在反向去噪之前提供的信息就是沿完整加噪路径累积的力能量。引理 4.3 为下文所用有限经验类与线性高斯类验证了这些条件。

### 4.3 联合律力能量与高噪声缩放

对随机测量取平均，可得到先验分数与测量力的额外正交性。

**引理 4.7（联合分数正交性与 Fisher 能量分解）。** 在 $(X_t,R)$ 的联合律下，假设相关平方分数可积，且求导可在 $p_t(x)=\int p_t(x,r)\,\mathrm d\nu(r)$ 的 $\nu$-积分下通过。记 $s_t^{R}(X_t)=s_t^{r}(X_t)|_{r=R}$。则

$$
\mathbb E\left[g_t(X_t,R)\mid X_t\right]=0,\tag{28}
$$

因此分数二阶矩矩阵满足

$$
\mathbb E\left[s_t^{R}(X_t)s_t^{R}(X_t)^{\top}\right]=\mathbb E\left[s_t^{\mathrm{prior}}(X_t)s_t^{\mathrm{prior}}(X_t)^{\top}\right]+\mathbb E\left[g_t(X_t,R)g_t(X_t,R)^{\top}\right].\tag{29}
$$

取迹得

$$
\mathbb E\left\lVert s_t^{R}(X_t)\right\rVert^{2}=\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}+\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2},\tag{30}
$$

且对每个确定向量 $v$，

$$
\mathbb E\left|v^{\top}s_t^{R}(X_t)\right|^{2}=\mathbb E\left|v^{\top}s_t^{\mathrm{prior}}(X_t)\right|^{2}+\mathbb E\left|v^{\top}g_t(X_t,R)\right|^{2}.\tag{31}
$$

**推论 4.8（平滑似然力的高噪声衰减）。** 在引理 4.1 的假设下，力 $g_t$ 在 $(X_t,R)$ 联合律下满足

$$
\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}=\frac{a_t^{2}}{\Delta_t^{2}}\mathbb E\left\lVert\mathbb E[X_0\mid X_t,R]-\mathbb E[X_0\mid X_t]\right\rVert^{2},\tag{32}
$$

且

$$
\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}\le\frac{a_t^{2}}{\Delta_t^{2}}\operatorname{Tr}\operatorname{Cov}(X_0).\tag{33}
$$

因此，沿任何满足 $d^{-1}\operatorname{Tr}\operatorname{Cov}(X_0)=O(1)$ 的维数序列，并在任何 $\Delta_t\ge\Delta_0>0$ 的高噪声窗口上，

$$
\frac{1}{d}\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}=O(a_t^{2}).\tag{34}
$$

在每坐标二阶矩有限时，该缩放关于信号系数 $a_t$ 是二次的。条件 $\Delta_t\ge\Delta_0>0$ 指定高噪声窗口并防止因子 $\Delta_t^{-2}$ 发散。

**引理 4.9（先验分数能量的自动下界）。** 假设 $\operatorname{Tr}\operatorname{Cov}(X_0)<\infty$，令 $\mu_t=\mathbb E X_t$。则对每个 $t>0$，

$$
\frac{1}{d}\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}\ge\frac{d}{\operatorname{Tr}\operatorname{Cov}(X_t)}=\frac{d}{a_t^{2}\operatorname{Tr}\operatorname{Cov}(X_0)+d\Delta_t}.\tag{35}
$$

特别地，若 $d^{-1}\operatorname{Tr}\operatorname{Cov}(X_0)\le C_0$，则

$$
\frac{1}{d}\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}\ge\frac{1}{a_t^{2}C_0+\Delta_t}.\tag{36}
$$

**推论 4.10（似然—先验力比）。** 假设推论 4.8 的条件成立且 $d^{-1}\operatorname{Tr}\operatorname{Cov}(X_0)\le C_0$。则对每个 $t>0$，

$$
\frac{\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}}{\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}}\le\frac{C_0\left(a_t^{2}C_0+\Delta_t\right)}{\Delta_t^{2}}a_t^{2}.\tag{37}
$$

因此，在每个 $\Delta_t\ge\Delta_0>0$ 的高噪声窗口上，

$$
\frac{\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}}{\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}}\le\frac{C_0(C_0+1)}{\Delta_0^{2}}a_t^{2}.\tag{38}
$$

该下界使先验分数非退化假设变得多余。因此，在同一二阶矩条件下，精确力在高噪声处无论是绝对量还是相对先验分数都很小。对有界经验先验，附录 A 给出更精确的渐近 $d^{-1}\mathbb E\lVert s_t^{\mathrm{prior}}(X_t)\rVert^{2}=\Delta_t^{-1}+o(1)$。

### 4.4 测量同化与 I-MMSE

重缩放含噪状态得到典范高斯信道

$$
Y_\gamma=\sqrt{\gamma}X_0+Z,\qquad Z\sim\mathcal N(\mathbf 0,\mathbf I_d),\qquad Y_{\gamma_t}=\frac{X_t}{\sqrt{\Delta_t}},\quad\gamma_t=\frac{a_t^{2}}{\Delta_t}.\tag{39}
$$

这里 $Z$ 与 $(X_0,R)$ 独立。由于 $X_t\mapsto Y_{\gamma_t}$ 可逆，$I(R;Y_{\gamma_t})=I(R;X_t)$；此外 $R\perp Y_\gamma\mid X_0$。定义信道 SNR $\gamma$ 处的**测量同化信息**

$$
M_\gamma:=I(R;Y_\gamma),\tag{40}
$$

它度量测量与当前含噪状态共享的信息。条件 I-MMSE [Guo et al., 2005] 把其导数识别为 (19) 中的去噪器之差。

**命题 4.11（测量力能量的 I-MMSE 表示）。** 在引理 4.1 的假设下，令 $\widehat m_\gamma(Y_\gamma)=\mathbb E[X_0\mid Y_\gamma]$、$\widehat m_\gamma^{R}(Y_\gamma,R)=\mathbb E[X_0\mid Y_\gamma,R]$。则对 $\gamma>0$（并在 $\gamma=0$ 处取右导数），

$$
\frac{\mathrm d}{\mathrm d\gamma}M_\gamma=\frac{1}{2}\mathbb E\left\lVert\widehat m_\gamma^{R}(Y_\gamma,R)-\widehat m_\gamma(Y_\gamma)\right\rVert^{2}.\tag{41}
$$

因此

$$
M_\gamma=\frac{1}{2}\int_0^{\gamma}\mathbb E\left\lVert\widehat m_u^{R}(Y_u,R)-\widehat m_u(Y_u)\right\rVert^{2}\mathrm du.\tag{42}
$$

在 $\gamma_t=a_t^{2}/\Delta_t$ 处，

$$
\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}=\frac{2a_t^{2}}{\Delta_t^{2}}\left.\frac{\mathrm d}{\mathrm d\gamma}M_\gamma\right|_{\gamma=\gamma_t}.\tag{43}
$$

由于在 VP 调度下 $\gamma_t=a_t^{2}/\Delta_t$ 满足 $\mathrm d\gamma_t/\mathrm dt=-2a_t^{2}/\Delta_t^{2}$，(43) 给出

$$
-\frac{\mathrm d}{\mathrm dt}M_{\gamma_t}=\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2},\tag{44}
$$

即 (21) 的测量平均。因此 $M_{\gamma_t}$ 在前向加噪下递减，而在反向去噪下以力能量速率获得相同信息。

在零信道 SNR 处，右导数为

$$
\left.\frac{\mathrm d}{\mathrm d\gamma}M_\gamma\right|_{\gamma=0^{+}}=\frac{1}{2}\mathbb E\left\lVert\mathbb E[X_0\mid R]-\mathbb E X_0\right\rVert^{2}=\frac{1}{2}\operatorname{Tr}\operatorname{Cov}\left(\mathbb E[X_0\mid R]\right).\tag{45}
$$

因此初始增长由测量所解释的干净信号方差决定。把 (45) 与 (43) 结合即恢复推论 4.8 的高噪声缩放，主常数现为 $\operatorname{Tr}\operatorname{Cov}(\mathbb E[X_0\mid R])$。在线性高斯模型中 $\operatorname{Cov}(\mathbb E[X_0\mid R])=\Sigma A^{\top}Q^{-1}A\Sigma$，其中 $Q=A\Sigma A^{\top}+\Gamma$，与 (53) 的主系数一致。$M_\gamma$ 对随机测量取平均，不同于第 5.2 节引入的固定 $r$ 经验索引信息——后者追踪与某个实现测量仍相容的干净解释的解析。

### 4.5 线性高斯闭式特化

前述恒等式不要求高斯先验。为使算子几何的作用显式，下面特化到线性高斯模型，其中力及其能量有闭式。

**命题 4.12（线性高斯平滑似然与力）。** 设 $X_0\sim\mathcal N(\mathbf 0,\Sigma)$、$R=AX_0+\varepsilon$，其中 $\varepsilon\sim\mathcal N(\mathbf 0,\Gamma)$、$\Gamma\succ0$，且 $\varepsilon$ 与 $X_0$ 及用于形成 $X_t$ 的前向加噪变量独立。定义

$$
B_t=a_t^{2}\Sigma+\Delta_t\mathbf I_d,\qquad Q=A\Sigma A^{\top}+\Gamma.\tag{46}
$$

则

$$
R\mid X_t=x\sim\mathcal N\left(M_tx,\Sigma_{R\mid t}\right),\tag{47}
$$

其中

$$
M_t=a_tA\Sigma B_t^{-1},\qquad\Sigma_{R\mid t}=Q-a_t^{2}A\Sigma B_t^{-1}\Sigma A^{\top}.\tag{48}
$$

因此精确测量力为

$$
g_t(x,r)=M_t^{\top}\Sigma_{R\mid t}^{-1}\left(r-M_tx\right),\tag{49}
$$

且在 $(X_t,R)$ 联合律下，

$$
\frac{1}{d}\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}=\frac{1}{d}\operatorname{Tr}\left(M_t^{\top}\Sigma_{R\mid t}^{-1}M_t\right).\tag{50}
$$

此外，在 VP 调度 (3) 下（故 $\Delta_t=1-a_t^{2}$），若沿某维数序列有 $\lambda_{\min}(\Gamma)\ge\gamma_0>0$ 且 $d^{-1}\lVert A\Sigma\rVert_F^{2}\le C_0$，则当 $a_t\to0$ 时

$$
\frac{1}{d}\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}=O(a_t^{2}),\tag{51}
$$

即推论 4.8 的高斯特化。这些公式来自对联合高斯对 $(X_t,R)$ 条件化。恒等式 $\Sigma_{R\mid t}=A\operatorname{Cov}(X_0\mid X_t)A^{\top}+\Gamma$ 表明 (49) 中的残差由逆预测协方差加权，后者同时计入测量噪声与噪声水平 $t$ 剩余的 $X_0$ 不确定性；因子 $M_t^{\top}$ 随后把该测量空间量映回信号空间。固定维数下 (49) 对有界 $x,r$ 给出 $g_t=O(a_t)$；高维中归一化能量才是恰当陈述，第 5.3 节进一步按行与奇异方向解析它。

**推论 4.13（高斯相对能量衰减）。** 在命题 4.12 下先验分数为 $s_t^{\mathrm{prior}}(x)=-B_t^{-1}x$。则在 $X_t\sim p_t$ 下，

$$
\frac{1}{d}\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}=\frac{1}{d}\operatorname{Tr}\left(B_t^{-1}\right)=\frac{1}{d}\sum_{i=1}^{d}\frac{1}{a_t^{2}\lambda_i+\Delta_t},\tag{52}
$$

其中 $\{\lambda_i\}$ 为 $\Sigma$ 的特征值。在调度 (3) 下 $\Delta_t\to1$（当 $a_t\to0$），故该式收敛到 $1$，先验分数能量为 $\Theta(1)$；对任何满足 $\Delta_t\to\Delta_\infty>0$ 的 VP 调度结论相同。固定维数下，似然力能量具有领头阶展开

$$
\frac{1}{d}\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}=\frac{a_t^{2}}{\Delta_t^{2}}\frac{1}{d}\operatorname{Tr}\left(\Sigma A^{\top}Q^{-1}A\Sigma\right)+O(a_t^{4}),\tag{53}
$$

因此

$$
\rho_t^{\mathrm{global}}:=\frac{\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}}{\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}}=O(a_t^{2}).\tag{54}
$$

在各向同性情形 $\Sigma=\sigma_x^{2}\mathbf I_d$、$A=\mathbf I_d$、$\Gamma=\sigma_y^{2}\mathbf I_d$ 下，$\rho_t^{\mathrm{global}}\sim a_t^{2}\sigma_x^{4}/(\sigma_x^{2}+\sigma_y^{2})$。测量项在每个噪声水平都存在，但在高噪声处其能量相对先验分数很小。该陈述关乎相对向量场强度，并不强加全局单调性或普适的标量交叉时间。

**能量陈述的范围。** 推论 4.8 与 4.10 的高噪声界对 $(X_t,R)$ 联合律取平均。在固定 $r$ 处，能量 $\mathbb E_{X_t\mid r}\lVert g_t(X_t,r)\rVert^{2}$ 具有精确解释 (21)，但其高噪声系数可能依赖 $r$。引理 4.7 的 Fisher 分解同样是联合律正交性，在固定 $r$ 处不必成立。当测量力集中于低维行或谱子空间时，全空间归一化可能被其余方向上的先验分数能量稀释；因此第 5.3 节在全局汇总之外引入行与方向级比值。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
