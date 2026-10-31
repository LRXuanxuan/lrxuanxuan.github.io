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
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1—8 节、附录 A—B、表 1—表 3、图 1—图 9 图注与参考文献（英文原条目 56 条）按原文结构录入；附录证明按原文结构译出关键步骤（详见页尾说明）；逐句逐式终校未做。

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

## 5 可解模型中的后验信息机制

下面用三个可解模型分离条件化如何修改无条件区间图景：条件高斯混合分离测量提供的类别信息与去噪期间获得的类别信息；有限经验后验精确核算测量之后剩余的样本索引不确定性；线性高斯模型把测量力解析到算子—先验方向上。每个模型隔离一种机制，而非近似同一数据分布。证明见附录 A。

### 5.1 条件高斯混合中的剩余类别信息

第一个模型问条件化如何改变类别层面的物种分化。测量可能已偏好某一类别，因此原始类别承诺不再能隔离去噪期间获得的信息。在对称高斯混合中该区分是精确的：条件化在类别权重中诱导一个静态场，并把原始类别分离替换为测量未解析的部分；只有后者能沿反向轨迹产生新的类别承诺。令

$$
C\in\{+1,-1\},\qquad P(C=+1)=P(C=-1)=1/2,\tag{55}
$$

$$
X_0\mid C=c\sim\mathcal N(cm,\Sigma).\tag{56}
$$

测量为 $R=AX_0+\varepsilon$，$\varepsilon\sim\mathcal N(\mathbf 0,\Gamma)$、$\Gamma\succ0$。定义

$$
Q=A\Sigma A^{\top}+\Gamma,\qquad K=\Sigma A^{\top}Q^{-1}.\tag{57}
$$

这里 $Q$ 为类内测量协方差；$R$ 的边缘协方差还含类间贡献 $Amm^{\top}A^{\top}$。

**命题 5.1（后验高斯混合几何）。** 对 $c\in\{\pm1\}$，

$$
X_0\mid r,C=c\sim\mathcal N(Kr+c\delta,S),\tag{58}
$$

其中

$$
S=\Sigma-\Sigma A^{\top}Q^{-1}A\Sigma,\qquad\delta=(\mathbf I_d-KA)m.\tag{59}
$$

后验类别权重为

$$
P(C=\pm1\mid r)=\alpha_\pm(r)=\frac{e^{\pm\eta(r)}}{2\cosh\eta(r)},\qquad\eta(r)=(Am)^{\top}Q^{-1}r.\tag{60}
$$

令 $\Lambda_t=a_t^{2}S+\Delta_t\mathbf I_d$、$Z_t=X_t-a_tKr$，并记 $\widetilde p_t(z\mid r)=p_t(z+a_tKr\mid r)$ 为平移坐标下的加噪后验密度。则

$$
\widetilde p_t(z\mid r)=\alpha_+\mathcal N(z;a_t\delta,\Lambda_t)+\alpha_-\mathcal N(z;-a_t\delta,\Lambda_t),\tag{61}
$$

或等价地

$$
\widetilde p_t(z\mid r)\propto\exp\left\{-z^{\top}\Lambda_t^{-1}z/2\right\}\cosh\left\{\eta(r)+a_t\delta^{\top}\Lambda_t^{-1}z\right\}.\tag{62}
$$

平移 $Kr$ 移动后验中心。标量 $\eta(r)$ 是测量已包含的类别证据，而 $\delta=(\mathbf I_d-KA)m$ 是仍可供含噪状态使用的类别分离。因此 $\eta(r)$ 充当静态外场，$\delta$ 支配动态物种分化。当 $A=0$ 时 $K=0$、$\eta=0$、$\delta=m$、$S=\Sigma$，恢复 Biroli 等 [2024] 的无条件对称混合分析。

**推论 5.2（后验分数与动态类别证据）。** 在命题 5.1 的模型下，平移坐标中的后验分数为

$$
\nabla_z\log\widetilde p_t(z\mid r)=-\Lambda_t^{-1}z+a_t\Lambda_t^{-1}\delta\tanh\left\{\eta(r)+a_t\delta^{\top}\Lambda_t^{-1}z\right\},\tag{63}
$$

且后验类别证据分解为

$$
\frac{1}{2}\log\frac{P(C=+1\mid z,r)}{P(C=-1\mid z,r)}=\eta(r)+a_t\delta^{\top}\Lambda_t^{-1}z.\tag{64}
$$

因此对数几率分成静态部分与由当前含噪状态创造的部分：原始类别承诺混合了测量提供的信息与去噪动态揭示的信息。

**注记 5.3（共享协方差多类扩展）。** 同一重新参数化在两类之外也成立。若 $C\in\{1,\ldots,K_c\}$、$P(C=c)=\pi_c$、$X_0\mid C=c\sim\mathcal N(m_c,\Sigma)$ 且协方差共享，则同一 $K$ 与 $S$ 给出 $X_0\mid r,C=c\sim\mathcal N\left(Kr+(\mathbf I_d-KA)m_c,S\right)$，而

$$
P(C=c\mid r)\propto\pi_c\exp\left\{-\frac{1}{2}(r-Am_c)^{\top}Q^{-1}(r-Am_c)\right\}.
$$

因此每对类别分离都被替换为 $(\mathbf I_d-KA)(m_c-m_{c'})$，加噪后验分数以 softmax 权重平均残差均值。二类对称情形之所以特殊，是因为它退化到一个坐标并容许叉式分岔参考。当协方差依类别而变时，增益与残差协方差也依赖类别，共同残差映射与单一 $\kappa_t$ 阈值都不再存在。

**命题 5.4（基线校正的后验克隆）。** 定义条件克隆观测量

$$
\phi_r(t)=\mathbb E_{Z_t\mid r}\left[\sum_{c\in\{\pm1\}}P(C=c\mid Z_t,r)^{2}\right].\tag{65}
$$

则

$$
\phi_r(\infty)=\alpha_+^{2}+\alpha_-^{2}=\sum_cP(C=c\mid r)^{2}.\tag{66}
$$

因此动态类别—物种分化信号为

$$
\Delta\phi_r(t)=\phi_r(t)-\phi_r(\infty),\tag{67}
$$

或当 $\phi_r(\infty)<1$ 时

$$
\widetilde\phi_r(t)=\frac{\phi_r(t)-\phi_r(\infty)}{1-\phi_r(\infty)}.\tag{68}
$$

由精确反向动力学的 Markov 性，$\phi_r(t)$ 是从同一状态出发的两条独立精确反向延拓承诺到同一类别的概率——即 Biroli 等 [2024] 克隆实验的条件类比，基线为 $\alpha_+^{2}+\alpha_-^{2}$ 而非无信息的 $1/2$。

**推论 5.5（一维约化与零场参考）。** 在命题 5.1 的模型下，$\phi_r$ 如 (65)，令

$$
\kappa_t=a_t^{2}\delta^{\top}\Lambda_t^{-1}\delta,\qquad G_\pm(s)=\mathcal N(s;\pm\sqrt{\kappa_t},1).\tag{69}
$$

则

$$
\phi_r(t)=\int_{\mathbb R}\frac{\alpha_+^{2}G_+(s)^{2}+\alpha_-^{2}G_-(s)^{2}}{\alpha_+G_+(s)+\alpha_-G_-(s)}\,\mathrm ds.\tag{70}
$$

在零场参考情形 $\eta(r)=0$，原点 $z=0$ 是 $\log\widetilde p_t(z\mid r)$ 的局部极大当且仅当 $\kappa_t\le1$；对 $\kappa_t>1$ 它失去局部极大性，在一维约化中成为局部极小，在 $d>1$ 时成为鞍点。由于 $\kappa_t$ 沿反向轨迹非减、且当 $\delta\ne0$ 时严格增，双井地形在 $\kappa_t$ 首次越过阈值

$$
\kappa_t=a_t^{2}\delta^{\top}\Lambda_t^{-1}\delta=1\tag{71}
$$

时形成。水平 $\kappa_t=1$ 描述后验对数密度（因而精确反向漂移）的局部变化，而非每条随机路径的转变；它特定于对称零场参考。当 $\eta(r)\ne0$ 且残差分离非零时，原点不再驻定，叉式分岔被有偏交叉取代；此时 $\Delta\phi_r$ 或 $\widetilde\phi_r$ 度量超出测量基线的类别信息。该模型证明 $\kappa_t$ 的单调性，但对非零场下的基线校正克隆观测量不作相应断言。当 $A=0$ 时该判据退化为 $\delta=m$、$S=\Sigma$ 的无条件判据。

物种分化的残差性质在奇异坐标中尤其透明。若 $\Sigma=\sigma_x^{2}\mathbf I_d$、$\Gamma=\sigma_y^{2}\mathbf I_{d_y}$、$A=U\operatorname{diag}(s_i)V^{\top}$，记 $m_i=v_i^{\top}m$、$\delta_i=v_i^{\top}\delta$，则

$$
\delta_i=\frac{\sigma_y^{2}}{\sigma_y^{2}+\sigma_x^{2}s_i^{2}}m_i.\tag{72}
$$

当 $s_i^{2}\sigma_x^{2}\gg\sigma_y^{2}$ 时残差 $\delta_i$ 被强烈衰减；零空间方向满足 $s_i=0$ 并保留 $\delta_i=m_i$。因此条件化把类别层面的物种分化重新分配到测量尚未解析的方向。

### 5.2 经验解释解析

第二个模型关注有限经验支撑中单个解释的解析。此处"坍缩"保留无条件区间理论中的含义：含噪状态逐步识别一个支撑索引；条件化改变候选集及其熵。令

$$
P_0^{\mathrm{emp}}=\frac{1}{n}\sum_{i=1}^{n}\delta_{x_i},\tag{73}
$$

并以 $I$ 表示支撑索引。在第 2 节线性高斯似然下，固定测量 $r$ 处的后验权重为

$$
w_i(r)=P(I=i\mid r)=\frac{\exp\left\{-\frac{1}{2}\lVert Ax_i-r\rVert_{\Gamma^{-1}}^{2}\right\}}{\sum_j\exp\left\{-\frac{1}{2}\lVert Ax_j-r\rVert_{\Gamma^{-1}}^{2}\right\}}.\tag{74}
$$

对 $\Gamma=\sigma_y^{2}\mathbf I_{d_y}$，退化为

$$
w_i(r)\propto\exp\left\{-\frac{\lVert Ax_i-r\rVert^{2}}{2\sigma_y^{2}}\right\}.\tag{75}
$$

对 $t>0$，对后验经验分布加噪得

$$
p_t^{\mathrm{emp}}(x\mid r)=\sum_{i=1}^{n}w_i(r)\mathcal N(x;a_tx_i,\Delta_t\mathbf I_d).\tag{76}
$$

非均匀经验先验通过在 (74) 的似然因子中乘以先验索引概率处理。

**命题 5.6（后验索引信息核算）。** 对 $t>0$，含噪状态 $X_t=x$ 处索引 $i$ 的后验责任为

$$
P(I=i\mid x,r)=\frac{w_i(r)\exp\left\{-\lVert x-a_tx_i\rVert^{2}/(2\Delta_t)\right\}}{\sum_jw_j(r)\exp\left\{-\lVert x-a_tx_j\rVert^{2}/(2\Delta_t)\right\}}.\tag{77}
$$

此外

$$
h(X_t\mid r)=\frac{d}{2}\log(2\pi e\Delta_t)+H(I\mid r)-H(I\mid X_t,r).\tag{78}
$$

该恒等式对 $t>0$ 陈述，因为经验后验在 $t=0$ 处是离散的。若支撑点两两不同，则 $H(I\mid X_t,r)\to0$（当 $t\to0$）；重复点留下反向动力学无法解析的索引歧义。把逐点熵 $H(I\mid X_t=x,r)$ 在加噪后验抽样上平均，得到 $H(I\mid X_t,r)$ 的无偏 Monte Carlo 估计。该坍缩概念是测量相容点之间的样本索引解码，并不定义连续空间 MAP 估计器或神经模式坍缩。

无条件下均匀经验先验的索引熵为 $\log n$；观测 $r$ 后剩余预算为 $H(I\mid r)=-\sum_iw_i(r)\log w_i(r)\le\log n$。对固定测量，

$$
\log n-H(I\mid r)=\mathrm{KL}\left(P(I\mid r)\,\Vert\,\mathrm{Unif}_n\right).\tag{79}
$$

推论 4.6 给该静态领先量一个精确动力学表示：

$$
\log n-H(I\mid r)=\int_0^{\infty}\mathbb E_{X_t\mid r}\left\lVert g_t(X_t,r)\right\rVert^{2}\mathrm dt.\tag{80}
$$

因此测量诱导的经验索引预算缩减，也是沿加噪路径的固定 $r$ 后验—先验总力能量预算。对随机测量取平均得

$$
H(I\mid R)=\log n-I(I;R).\tag{81}
$$

加上当前含噪状态贡献的信息得

$$
H(I\mid R,X_t)=\log n-I(I;R)-I(I;X_t\mid R).\tag{82}
$$

因此预算由相容解释集的熵决定：信息量大的测量留下很少可能索引，弱测量留下接近 $\log n$ 的预算，$A=0$ 时恢复 Biroli 等 [2024] 的无条件预算。定义固定测量处的累积后验解析信息

$$
J_t(r):=I(I;X_t\mid R=r)=H(I\mid r)-H(I\mid X_t,r),\tag{83}
$$

这是有限 $n$ 链式法则量，是累积的而非瞬时的。精确分解 $\log n-H(I\mid X_t,r)=[\log n-H(I\mid r)]+J_t(r)$ 把逐点测量领先量与含噪状态提供的解释解析分开。对相异支撑点，干净端点处 $J_t(r)\to H(I\mid r)$。该过程不同于命题 4.11 的测量同化信息 $M_\gamma=I(R;Y_\gamma)$；二者对 $R$ 平均后的精确关系见第 6.1 节。下面用高斯条件信息替代量给出该有限支撑过程的描述性时间尺度。

**注记 5.7（条件索引解析的高斯匹配尺度）。** 假设在经验分量分离之前，干净后验可近似为

$$
X_0\mid r\approx\mathcal N(\mu_r,S_r).\tag{84}
$$

定义高斯条件信息替代量

$$
I_t^G(r):=I^G(X_0;X_t\mid R=r)=\frac{1}{2}\log\det\left(\mathbf I_d+\frac{a_t^{2}}{\Delta_t}S_r\right).\tag{85}
$$

对 $q\in(0,1]$，定义分数高斯解析时间 $t_q^G(r)$（存在时）为

$$
I_{t_q^G}^G(r)=qH(I\mid r).\tag{86}
$$

若 $S_r=s_r\mathbf I_d$、$s_r>0$、$\alpha_r=d^{-1}H(I\mid r)>0$，则

$$
t_q^G(r)=\frac{1}{2}\log\left[1+\frac{s_r}{e^{2q\alpha_r}-1}\right].\tag{87}
$$

全预算匹配尺度为 $t^C(r):=t_1^G(r)$。该估计并非由命题 5.6 推出：它用高斯总体信道替代有限加权码本，识别的是解析尺度而非普适的尖锐转变。附录 B.1 的似然宽度研究评估分数情形 $q=1/2$；全预算情形 $q=1$ 对 $S_r$ 的小特征值尾部更敏感。若 $H(I\mid r)=0$，测量已识别索引。更一般地，条件化同时改变预算与 $S_r$，因此仅预算缩减不能决定匹配尺度如何移动。

### 5.3 方向性信息分配与算子—先验对齐

第三个模型问测量影响如何分布在反向向量场上。前述类别与索引量描述剩余何种不确定性；力—先验比则描述测量诱导场在哪些方向变得可观。对低秩算子，未观测方向可能支配全局先验分数范数，使行空间与方向级比值比单一汇总量更有信息量。

**全局与固定测量比值。** 联合律汇总比为

$$
\rho_t^{\mathrm{global}}=\frac{\mathbb E\left\lVert g_t(X_t,R)\right\rVert^{2}}{\mathbb E\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}},\qquad s_t^{\mathrm{prior}}(x)=\nabla_x\log p_t(x).\tag{88}
$$

推论 4.10 在与力能量界相同的每坐标二阶矩条件下给出高噪声处 $\rho_t^{\mathrm{global}}=O(a_t^{2})$。对实现测量，只要分母为正，使用

$$
\rho_t^{\mathrm{global}}(r)=\frac{\mathbb E_{X_t\mid r}\left\lVert g_t(X_t,r)\right\rVert^{2}}{\mathbb E_{X_t\mid r}\left\lVert s_t^{\mathrm{prior}}(X_t)\right\rVert^{2}},\tag{89}
$$

它是轨迹诊断量，而非联合律界的逐点推论。

**行、零空间与奇异方向。** 以 $P_A=A^{\dagger}A$、$P_A^{\perp}=\mathbf I_d-P_A$ 定义（分母为正时）

$$
\rho_t^{\mathrm{row}}(r)=\frac{\mathbb E_{X_t\mid r}\left\lVert P_Ag_t\right\rVert^{2}}{\mathbb E_{X_t\mid r}\left\lVert P_As_t^{\mathrm{prior}}\right\rVert^{2}},\qquad
\rho_t^{\mathrm{null}}(r)=\frac{\mathbb E_{X_t\mid r}\left\lVert P_A^{\perp}g_t\right\rVert^{2}}{\mathbb E_{X_t\mid r}\left\lVert P_A^{\perp}s_t^{\mathrm{prior}}\right\rVert^{2}}.\tag{90}
$$

对各向异性算子，方向级形式更有信息量。令 $v_i$ 为 $A$ 的右奇异向量、奇异值 $s_i$，并记 $g_{t,i}(x,r)=v_i^{\top}g_t(x,r)$、$s_{t,i}^{\mathrm{prior}}(x)=v_i^{\top}s_t^{\mathrm{prior}}(x)$。则

$$
\rho_i(t,r)=\frac{\mathbb E_{X_t\mid r}\left|g_{t,i}(X_t,r)\right|^{2}}{\mathbb E_{X_t\mid r}\left|s_{t,i}^{\mathrm{prior}}(X_t)\right|^{2}},\qquad
\rho_t^{\mathrm{row}}(r)=\frac{\sum_{i:s_i>0}\mathbb E_{X_t\mid r}\left|g_{t,i}\right|^{2}}{\sum_{i:s_i>0}\mathbb E_{X_t\mid r}\left|s_{t,i}^{\mathrm{prior}}\right|^{2}},\tag{91}
$$

同样在分母为正时。这些是相对向量场强度的连续度量，而非内禀相边界。当期望改为对 $(X_t,R)$ 联合律取时，记

$$
\rho_i(t)=\frac{\mathbb E\left|g_{t,i}(X_t,R)\right|^{2}}{\mathbb E\left|s_{t,i}^{\mathrm{prior}}(X_t)\right|^{2}},\qquad
\rho_t^{\mathrm{row}}=\frac{\sum_{i:s_i>0}\mathbb E\left|g_{t,i}(X_t,R)\right|^{2}}{\sum_{i:s_i>0}\mathbb E\left|s_{t,i}^{\mathrm{prior}}(X_t)\right|^{2}}.\tag{92}
$$

**定理 5.8（对齐的各向异性高斯分配）。** 令 $X_0\sim\mathcal N(\mathbf 0,\Sigma)$，$\Sigma=V\operatorname{diag}(\lambda_1,\ldots,\lambda_d)V^{\top}$、$\lambda_i>0$。令 $A\in\mathbb R^{d_y\times d}$ 行满秩，并假设测量与先验特征基对齐：$A=U[\operatorname{diag}(s_1,\ldots,s_{d_y})\ \ \mathbf 0]V^{\top}$、$\Gamma=\sigma_y^{2}\mathbf I_{d_y}$，其中 $i>d_y$ 时 $s_i=0$。定义

$$
B_{i,t}=a_t^{2}\lambda_i+\Delta_t,\quad v_{i,t}=\frac{\lambda_i\Delta_t}{B_{i,t}},\quad
\tau_i^{2}=\left(\lambda_i^{-1}+s_i^{2}/\sigma_y^{2}\right)^{-1},\quad \widetilde B_{i,t}=a_t^{2}\tau_i^{2}+\Delta_t,\tag{93}
$$

其中 $s_i=0$ 时 $\tau_i^{2}=\lambda_i$。在 $(X_t,R)$ 联合律下，

$$
\mathbb E\left|s_{t,i}^{\mathrm{prior}}(X_t)\right|^{2}=\frac{1}{B_{i,t}},\qquad
\mathbb E\left|g_{t,i}(X_t,R)\right|^{2}=\frac{a_t^{2}s_i^{2}\lambda_i^{2}}{B_{i,t}^{2}\left(s_i^{2}v_{i,t}+\sigma_y^{2}\right)},\tag{94}
$$

且

$$
\rho_i(t)=\frac{a_t^{2}s_i^{2}\lambda_i^{2}}{B_{i,t}\left(s_i^{2}v_{i,t}+\sigma_y^{2}\right)}=\frac{B_{i,t}}{\widetilde B_{i,t}}-1.\tag{95}
$$

于是：(1) 当 $a_t\to0$ 时 $\rho_i(t)=\frac{a_t^{2}s_i^{2}\lambda_i^{2}}{s_i^{2}\lambda_i+\sigma_y^{2}}+O(a_t^{4})$；(2) 对 $s_i>0$，$\rho_i(t)$ 沿反向轨迹严格递增，低噪声极限为 $s_i^{2}\lambda_i/\sigma_y^{2}$，且

$$
\rho_i(t)=1\iff\widetilde B_{i,t}=\frac{1}{2}B_{i,t}.\tag{96}
$$

因此，在该对齐线性高斯模型内，$\rho_i=1$ 是方差减半、Fisher 能量相等的参考水平；当且仅当 $s_i^{2}\lambda_i>\sigma_y^{2}$ 时它在唯一内点噪声水平被穿越，当 $s_i^{2}\lambda_i=\sigma_y^{2}$ 时仅在干净端点达到。(3) 由于精确力在未测量的对齐坐标上为零，

$$
\rho_t^{\mathrm{global}}=\omega_t\rho_t^{\mathrm{row}},\qquad \omega_t=\frac{\sum_{i:s_i>0}B_{i,t}^{-1}}{\sum_{i=1}^{d}B_{i,t}^{-1}}.\tag{97}
$$

对各向同性先验 $\omega_t=d_y/d$。恒等式 (95) 也可由方向 Fisher 能量分解得到：后验加噪方差为 $\widetilde B_{i,t}$，故后验与先验 Fisher 能量分别为 $\widetilde B_{i,t}^{-1}$ 与 $B_{i,t}^{-1}$；等能量水平因而具有后验收缩含义，而非内禀相边界。在干净端点，在行正交设计中最大化高斯测量信息是经典 D-最优主子空间问题 [Chaloner and Verdinelli, 1995]。动力学问题是：该取向排序是否贯穿整个加噪族（此时所表示的测量信息只是部分的）？

**定理 5.9（匹配谱的取向依赖性）。** 令 $X_0\sim\mathcal N(\mathbf 0,\Sigma)$，特征值 $\lambda_1\ge\cdots\ge\lambda_d>0$；令 $1\le d_y\le d$、$A\in\mathbb R^{d_y\times d}$，$R_A=AX_0+\varepsilon$、$\varepsilon\sim\mathcal N(\mathbf 0,\sigma_y^{2}\mathbf I_{d_y})$。假设 $AA^{\top}=\mathbf I_{d_y}$，于是每个可容许 $A$ 的非零奇异值相同，各向同性测量噪声使相对 $\Sigma$ 的取向成为唯一设计变量。定义

$$
C_\gamma=\left(\Sigma^{-1}+\gamma\mathbf I_d\right)^{-1},\quad
\Sigma_A^{\mathrm{post}}=\left(\Sigma^{-1}+\sigma_y^{-2}A^{\top}A\right)^{-1},\quad
\psi_\gamma(\lambda)=\frac{1}{2}\log\frac{\sigma_y^{2}+\lambda}{\sigma_y^{2}+\lambda/(1+\gamma\lambda)}.
$$

则

$$
M_\gamma(A)=I(R_A;Y_\gamma)=\frac{1}{2}\log\frac{\det\left(\sigma_y^{2}\mathbf I_{d_y}+A\Sigma A^{\top}\right)}{\det\left(\sigma_y^{2}\mathbf I_{d_y}+AC_\gamma A^{\top}\right)}.\tag{98}
$$

此外，在所有行正交秩 $d_y$ 测量中，

$$
\frac{1}{2}\sum_{i=d-d_y+1}^{d}\log\left(1+\frac{\lambda_i}{\sigma_y^{2}}\right)\le I(X_0;R_A)\le\frac{1}{2}\sum_{i=1}^{d_y}\log\left(1+\frac{\lambda_i}{\sigma_y^{2}}\right),\tag{99}
$$

$$
2I(X_0;R_A)=\log\frac{\det\Sigma}{\det\Sigma_A^{\mathrm{post}}},\tag{100}
$$

$$
\sum_{i=d-d_y+1}^{d}\psi_\gamma(\lambda_i)\le M_\gamma(A)\le\sum_{i=1}^{d_y}\psi_\gamma(\lambda_i).\tag{101}
$$

对每个 $\gamma>0$，$\psi_\gamma$ 严格递增。上（下）界等号可通过取 $A$ 的行空间为最大（最小）$d_y$ 个先验特征向量的张成而达到。若边界特征值重复，极值行空间不必唯一：所需维数可在该特征空间内任意选取。因此一旦先验各向异性，相同算子奇异值并不决定干净测量信息、后验协方差体积收缩或反向路径同化。

**推论 5.10（秩一取向对比）。** 令 $d_y=1$，$A_i=v_i^{\top}$ 测量第 $i$ 个先验特征向量，且 $\lambda_i>\lambda_j$。则 $A_i$ 与 $A_j$ 奇异值相同，但对每个 $\gamma>0$，

$$
M_\gamma(A_i)-M_\gamma(A_j)=\psi_\gamma(\lambda_i)-\psi_\gamma(\lambda_j)>0.\tag{102}
$$

它们还满足 $I(X_0;R_{A_i})>I(X_0;R_{A_j})$ 且 $\det\Sigma_{A_i}^{\mathrm{post}}<\det\Sigma_{A_j}^{\mathrm{post}}$。由推论 4.4，$M_{\gamma_t}(A)$ 也是降到时刻 $t$ 的平均后验—先验反向路径相对熵。因此该定理在路径层面给出精确的高斯算子—先验对齐效应：仅谱的充分性是各向同性先验的对称性推论，而非测量谱本身的性质。在等行空间预算下，选择领先先验特征空间在每个噪声水平都最大化同化，而不只在干净端点。图 1 展示秩一情形。

**命题 5.11（坐标均匀分数能量下的秩稀释）。** 固定 $r$，令 $r_A=\operatorname{rank}(A)$，并使用与 $A$ 行空间对齐的正交坐标系。假设 (i) $P_A^{\perp}g_t(\cdot,r)=0$，(ii) 对每个坐标 $\mathbb E_{X_t\mid r}|s_{t,i}^{\mathrm{prior}}(X_t)|^{2}=e_t(r)>0$。则

$$
\rho_t^{\mathrm{global}}(r)=\frac{r_A}{d}\rho_t^{\mathrm{row}}(r).\tag{103}
$$

对 $4\times$ 超分辨，$r_A/d=1/16$：在命题假设下，全局比低估行空间比十六倍。这是精确的各向同性校准，而非普适定律。在对齐各向异性高斯模型中，精确因子是 (97) 中的 Fisher 能量权重 $\omega_t$。更一般地，跨欧氏行空间与零空间的先验耦合——包括非对齐各向异性高斯先验——可给精确力一个非零零空间分量。这些限制促使我们把行／零空间投影器作为诊断坐标，而不假设条件化被限制在行空间内。

**引理 5.12（投影总协方差分解）。** 固定测量值 $r$ 与 $t>0$，假设 $\mathbb E[\lVert X_0\rVert^{2}\mid R=r]<\infty$，令 $P$ 为正交投影器。记 $m_t^{r}(X_t)=\mathbb E[X_0\mid X_t,R=r]$，则

$$
\operatorname{Tr}\left(P\operatorname{Cov}(X_0\mid r)P\right)=\mathbb E\left[\operatorname{Tr}\left(P\operatorname{Cov}(X_0\mid X_t,r)P\right)\mid R=r\right]+\operatorname{Tr}\operatorname{Cov}\left(Pm_t^{r}(X_t)\mid R=r\right).\tag{104}
$$

第一项是观测含噪状态后剩余的**条件方差**；第二项是精确后验均值在含噪状态间的**变异**。在高斯加噪族下，第二项在信道 SNR 趋于零时趋于零，在 SNR 趋于无穷时趋于 $\operatorname{Tr}(P\operatorname{Cov}(X_0\mid r)P)$。因此跨状态的干净估计离散度是总协方差分解中的**已解析分量**，而非剩余后验协方差。

## 6 从精确信息动力学到近似采样器

第 4、5 节引入了若干精确量：固定测量后验—先验散度、测量平均信息、剩余类别与样本索引不确定性、方向级力比。现在在转向学习先验之前把这些量联系起来。对经验先验，一个链式法则恒等式划分含噪状态所表示的信息；对近似采样器，高斯矩计算识别其测量更新所近似的预测量。

### 6.1 测量同化与索引解析

考虑相异点上的均匀经验先验，$X_0=x_I$、$I$ 在 $\{1,\ldots,n\}$ 上均匀。测量 $R$ 与含噪信道状态 $Y_\gamma$ 含有关于同一支撑索引的信息。测量同化信息 $M_\gamma=I(R;Y_\gamma)$ 记录与测量共享的部分。定义互补的**解析信息**

$$
J_\gamma:=I(I;Y_\gamma\mid R),\tag{105}
$$

它记录含噪状态在测量之外揭示的索引信息。由于 $R\perp Y_\gamma\mid I$，互信息链式法则给出精确划分

$$
I(I;Y_\gamma)=I(I,R;Y_\gamma)=M_\gamma+J_\gamma.\tag{106}
$$

在扩散信道 SNR $\gamma_t=a_t^{2}/\Delta_t$ 处，可逆重缩放 $Y_{\gamma_t}=X_t/\sqrt{\Delta_t}$ 还给出

$$
J_{\gamma_t}=\mathbb E_RJ_t(R),\qquad J_t(r)=I(I;X_t\mid R=r).\tag{107}
$$

因此 $M_{\gamma_t}$ 与 $\mathbb E_RJ_t(R)$ 是噪声水平 $t$ 所表示同一索引信息的两个部分。在可微点，它们的速率同样划分：

$$
\frac{\mathrm d}{\mathrm d\gamma}I(I;Y_\gamma)=M_\gamma'+J_\gamma'.\tag{108}
$$

三个量在 $\gamma=0$ 处为零。在干净信道端点，引理 4.3 所用的最近中心解码论证给出

$$
\lim_{\gamma\to\infty}I(I;Y_\gamma)=\log n,\qquad
\lim_{\gamma\to\infty}M_\gamma=\log n-H(I\mid R),\qquad
\lim_{\gamma\to\infty}J_\gamma=H(I\mid R).\tag{109}
$$

因此测量提供平均领先量 $I(I;R)=\log n-H(I\mid R)$，反向去噪解析剩余索引熵 $H(I\mid R)$。第 5 节的类别与方向分析通过识别哪些区分仍存在、测量信息在何处被表示，精化了该标量核算。

**表 1：第 4—5 节所用精确坐标汇总。** 各行描述条件化的互补侧面，不必在同一噪声水平改变。

| 侧面 | 精确坐标 | 作用 |
|---|---|---|
| 测量同化 | $K_t(r)$、$M_\gamma$、$\mathbb E\lVert g_t(X_t,R)\rVert^{2}$ | 固定测量信息、其测量平均，以及相应的力能量速率 |
| 类别解析 | $\eta(r)$、$\delta=(\mathbf I_d-KA)m$、$\widetilde\phi_r(t)$ | 测量证据、残差分离与基线校正的承诺 |
| 样本索引解析 | $H(I\mid r)$、$J_t(r)$、$J_\gamma$ | 剩余索引预算及其固定测量与平均解析 |
| 方向性分配 | $\rho_i(t)$、$M_\gamma(A)$ | 方向级力强度与算子相关测量信息同化 |

### 6.2 近似采样器的高斯矩分析

精确平滑似然力依赖条件干净信号律 $X_0\mid X_t=x$，该律对学习先验不可得。为在同一概率基础上比较常见测量更新，本文用具有相同前两阶矩的高斯近似该条件律；该计算分离预测均值、预测协方差及其状态依赖的作用。

**局部高斯近似。** 回顾先验去噪器 $m_t(x)=\mathbb E[X_0\mid X_t=x]$，定义

$$
C_t(x)=\operatorname{Cov}(X_0\mid X_t=x),\qquad S_t(x)=AC_t(x)A^{\top}+\Gamma.\tag{110}
$$

在线性高斯测量模型下，用 $\mathcal N(m_t(x),C_t(x))$ 替代 $X_0\mid X_t=x$ 得到替代量

$$
p(r\mid X_t=x)\approx\mathcal N(r;Am_t(x),S_t(x)),\qquad \ell_t^G(x;r):=\log\mathcal N(r;Am_t(x),S_t(x)).\tag{111}
$$

记 $e_t(x)=r-Am_t(x)$，$Dm_t(x)$ 为 $m_t$ 的 Jacobian。若 $m_t$、$C_t$ 可微，则

$$
\left[\nabla_x\ell_t^G(x;r)\right]_j=\left[(Dm_t(x))^{\top}A^{\top}S_t(x)^{-1}e_t(x)\right]_j
-\frac{1}{2}\operatorname{Tr}\left[S_t(x)^{-1}\partial_jS_t(x)\right]
+\frac{1}{2}e_t(x)^{\top}S_t(x)^{-1}\left(\partial_jS_t(x)\right)S_t(x)^{-1}e_t(x).\tag{112}
$$

第一项对预测均值求导，其余项来自预测协方差的状态依赖。式 (112) 对替代量是精确的，并在命题 4.12 的线性高斯模型中（此时 $C_t(x)$ 与 $x$ 无关）退化为精确平滑似然力。

**残差梯度引导。** 对各向同性测量噪声 $\Gamma=\sigma_y^{2}\mathbf I_{d_y}$，DPS [Chung et al., 2023] 对干净空间残差

$$
L_t(x_t)=\frac{\lVert A\widehat x_0(x_t,t)-r\rVert^{2}}{2\sigma_y^{2}}\tag{113}
$$

求导，其中 $\widehat x_0$ 为采样器的去噪估计。在高斯矩计算中，这等价于对预测均值求导，但用测量方差替代预测协方差 $S_t(x)$。附录 B.3 的一维计算显式给出由此产生的尺度差异：在步长归一化之前，插入式力比精确力大 $1+v_t/\sigma_y^{2}$，其中 $v_t=\operatorname{Var}(X_0\mid X_t)$。离散 DPS 实现中依赖残差的归一化改变该标定，尽管精确、插入式与归一化力能量在 VP 模型中保持相同的 $O(a_t^{2})$ 高噪声缩放。

**协方差与投影近似。** PiGDM [Song et al., 2023] 把伪逆结构与预测方差各向同性近似结合；DMPS [Meng and Kabashima, 2025] 使用由无信息先验近似得到的 pivot 与方差。DDNM/DDNM+ [Wang et al., 2023] 走另一路线，通过类投影更新强制干净空间值域／零空间一致性，而非近似后验分数。在各向同性高斯参考中，后验增益

$$
K_{\sigma_y}=\sigma_x^{2}A^{\top}\left(\sigma_x^{2}AA^{\top}+\sigma_y^{2}\mathbf I_{d_y}\right)^{-1}\tag{114}
$$

满足

$$
K_{\sigma_y}A\to A^{\dagger}A,\qquad \mathbf I_d-K_{\sigma_y}A\to\mathbf I_d-A^{\dagger}A\qquad(\sigma_y^{2}\to0).\tag{115}
$$

因此硬行空间投影是较软高斯后验更新的零噪声极限。各采样器配置还在 Jacobian 处理、步长缩放、随机性以及修正插入点处不同；因此第 7.2 节的比较针对完整固定配置，而非个别设计选择。

**轨迹观测量。** 对学习到的 FFHQ 先验，精确量 $K_t$、$M_\gamma$ 与 $J_t$ 无法评估。神经研究改为对每条轨迹应用同一冻结去噪器，并记录两个可观测特征：其相对测量集的残差，以及其在 $A$ 的行空间与零空间中的跨链离散度。引理 5.12 的投影总协方差恒等式为离散度坐标提供精确模型动机。需要标量路径汇总时，在共同 log-SNR 网格上对离散度积分得到曲线下面积（AUC）。这些观测量保留理论的时序与子空间区分，但不以信息单位计量；第 7.2 节定义其经验估计量。

## 7 诊断研究

### 7.1 精确模型诊断

精确模型研究使用后验可由闭式或有限求和得到的设置。它们检验所预测的高噪声缩放与条件信息预算，随后为神经实验所用的干净估计离散度提供标定。前向噪声时间 $t$ 按反向去噪方向显示。

**高噪声力衰减。** 推论 4.8 与 4.10 预测力能量及其与先验分数能量之比在高噪声处都按 $a_t^{2}$ 线性缩放。在去噪、超分辨与修复上，对 $a_t^{2}$ 的 log–log 拟合给出指数介于 1.002 与 1.008 之间，接近预测的单位指数。先验分数能量保持在 1 附近，领头的力能量系数与 $d^{-1}\operatorname{Tr}\operatorname{Cov}(\mathbb E[X_0\mid R])$ 一致，相对误差低于 $4\times10^{-4}$。附录 B.1 给出逐任务估计、采样设计与能量曲线。

#### 7.1.1 剩余类别信息

在第 5.1 节的条件高斯混合中，测量可在含噪状态变得有信息量之前提供类别证据。因此相关动态量是残差坐标 $\kappa_t=a_t^{2}\delta^{\top}\Lambda_t^{-1}\delta$ 以及超出静态基线的克隆超额 $\phi_r(\infty)$。图 2 展示由此得到的区分：在零外场时 $\kappa_t=1$ 标记局部对称不稳定性，非零场把它替换为有偏交叉；增大已观测比例或降低测量噪声只压制类别分离的已测量分量。

#### 7.1.2 经验解释解析

对有限经验先验，后验坍缩是在测量相容解释之间的解码。给定数据 $\{x_i\}_{i=1}^{n}$，计算

$$
w_i(r)\propto\exp\left\{-\frac{\lVert Ax_i-r\rVert^{2}}{2\sigma_y^{2}}\right\}\tag{116}
$$

并用有限求和精确评估 $H(I\mid r)$、$H(I\mid X_t,r)$ 与 $J_t(r)=H(I\mid r)-H(I\mid X_t,r)$。实验使用 1500 个 MNIST [LeCun et al., 1998] 样本、100 个支撑内参考，以及共同假设似然宽度 $\sigma_y=2$（去噪、$2\times$ 超分辨与中心块修复）。该诊断不采样测量噪声；$\sigma_y$ 指定用于形成后验权重的似然宽度。

图 3 展示命题 5.6 建立的预算变化。高噪声熵从任务相关的 $H(I\mid r)$（而非 $\log n$）开始，并随经验分量分离而消失。去噪留下最小相容集与最强类别基线；低秩算子保留多得多的索引歧义。均值与标准误在参考上计算。

**方向性分配。** 在各向同性高斯投影模型中，行空间力比与全局力比具有相同时间依赖，相差秩分数。对 $4\times$ 超分辨的 $d_y/d=1/16$ 几何，这给出命题 5.11 预测的精确十六倍稀释。

#### 7.1.3 共同精确轨迹上的信息动力学

接下来在相同精确分数条件反向轨迹上记录类别、索引、力与残差诊断。对每个 MNIST 算子，20 个参考与 32 条链沿 $t\in[0.02,6]$ 上的 400 步 Euler–Maruyama 离散化。前向条件采样提供独立熵校验；在保存的检查点上，参考平均的前向与反向熵曲线最大偏差为 0.12 纳特，终端反向熵低于 $5\times10^{-9}$ 纳特。表 2 的 200/400/800 步比较表明半衰时间与残差底限对离散化稳定。

图 4 展示四种互补效应。固定参考行空间力比从预测的高噪声缩放上升，在轨迹中段达峰，并保持在 $6\times10^{-3}$ 以下。其低噪声衰减特定于有限经验先验：一旦 $X_t$ 识别出后验轨迹所访问的原子，先验与后验去噪器都收敛到该原子，故 $m_t^{r}(X_t)-m_t(X_t)$ 消失。类别熵从静态 $H(C\mid r)$ 基线收缩。去噪后测量残差从后验均值拟合上升向相容池采样底限。最后，$\log n-H(I\mid X_t,r)$ 分解为测量领先量 $\log n-H(I\mid r)$ 与随后的解析存量 $J_t(r)$。面板 (d) 中的空心圆是选定检查点处的独立前向条件 Monte Carlo 估计。四个面板共同表明类别解析、力传递与经验坍缩不必共享普遍顺序。

#### 7.1.4 干净估计离散度的标定

引理 5.12 把干净后验协方差分解为 $X_t$ 之后剩余的不确定性与 $m_t^{r}(X_t)=\mathbb E[X_0\mid X_t,r]$ 在含噪状态间的离散度。本文对 20 个参考评估该恒等式，每个参考在 25 个 log-SNR 值处各有 256 个条件状态。图 5 显示两个分量沿反向去噪在行与零空间坐标中交换质量。两个 Monte Carlo 分量之和与精确固定后验方差一致，相对差距中位数 0.35%、第 95 百分位 3.21%。因此跨状态干净估计离散度是总协方差分解中的已解析分量。

### 7.2 近似采样器的神经轨迹诊断

对学习图像先验，精确后验分数与第 4—6.2 节的信息量一般不可得。本文用冻结 FFHQ 模型作为具体试验台，考察来自固定近似采样器轨迹上的两个基于去噪器的汇总：测量残差与已测／未测子空间中的跨链离散度。

**共同轨迹汇总。** 所有采样器使用同一无条件 FFHQ 检查点。对链 $k$，令 $\widehat x_{0,t}^{(k)}$ 为在保存状态处、采样器特定修正之前评估冻结去噪器得到的干净估计：

$$
\widehat x_{0,t}^{(k)}=D_{\mathrm{frozen}}\left(x_t^{(k)},t\right),\qquad
\widetilde x_{0,t}^{(k)}=\mathrm{clip}_{[-1,1]}\left(\widehat x_{0,t}^{(k)}\right).\tag{117}
$$

该链的修正前残差为

$$
R_{t,k}^{\mathrm{pre}}=d_y^{-1}\left\lVert A\widehat x_{0,t}^{(k)}-r\right\rVert_2^{2}.\tag{118}
$$

对 $K$ 条独立链，还记录

$$
D_{\mathrm{row}}^{\mathrm{clip}}(t)=\frac{\operatorname{Tr}\widehat{\operatorname{Cov}}_k\left(P_A\widetilde x_{0,t}^{(k)}\right)}{r_A},\qquad
D_{\mathrm{null}}^{\mathrm{clip}}(t)=\frac{\operatorname{Tr}\widehat{\operatorname{Cov}}_k\left(P_A^{\perp}\widetilde x_{0,t}^{(k)}\right)}{d-r_A}.\tag{119}
$$

这里 $\widehat{\operatorname{Cov}}_k$ 为分母 $K-1$ 的样本协方差。行与零空间汇总分别在 $r_A>0$ 与 $d-r_A>0$ 时定义。残差曲线对链与参考取平均。裁剪与投影器对所有采样器相同。引理 5.12 为精确后验模型中的行／零空间分解提供动机；在学习设置中，(118) 与 (119) 是经验轨迹汇总。

**采样器配置。** 本文评估经验证集选择的 DPS [Chung et al., 2023]、DDNM+ [Wang et al., 2023]、PiGDM [Song et al., 2023] 与 DMPS [Meng and Kabashima, 2025] 配置。由于它们的更新规则在若干方面不同，比较针对完整固定配置而非单个算法组件。附录 B.2 给出配置、共同观测量协议与有限链分析。

**固定谱比较。** 定理 5.9 的精确高斯结果涉及算子—先验对齐。以下学习模型示例只问一个更窄的问题：在冻结图像先验下，相同谱的掩膜能否产生不同的经验子空间轨迹。固定库含五个连续掩膜、三个多孔掩膜、三个结构分布掩膜与五个随机修复掩膜。每个掩膜隐藏四分之一图像位置，故全部十六个算子具有相同秩、零化度与奇异值。

对每个采样器、掩膜 $A$ 与留出参考图像，在共同 25 检查点 log-SNR 网格上对零空间离散度积分得到 AUC。把引导 AUC 与同掩膜下无条件先验轨迹的 AUC 比较：

$$
Z_{\mathrm{null}}(A)=\log\frac{\mathrm{AUC}_{\mathrm{null}}^{\mathrm{guided}}(A)}{\mathrm{AUC}_{\mathrm{null}}^{\mathrm{prior}}(A)},\qquad
\Delta_{\mathrm{null}}=Z_{\mathrm{null}}^{\mathrm{contiguous}}-Z_{\mathrm{null}}^{\mathrm{random}}.
$$

先验归一化去除无测量引导时已存在的掩膜相关离散度。该对比是相对的而非绝对的：$\Delta_{\mathrm{null}}>0$ 意味着连续掩膜的引导—先验 AUC 比大于随机掩膜。

图 6 报告方法特定对比。以自然对数计，零空间估计介于 0.468 与 0.652 之间，其 95% 参考自举区间（以固定掩膜为条件）位于零以上。行空间估计略为负且幅度小得多，介于 $-0.060$ 与 $-0.012$。因此族差异集中于零空间轨迹统计量。对每个采样器，多孔估计位于连续与随机估计之间，而结构分布估计接近随机值。因此，在该检查点与固定库内，相同谱的掩膜在先验归一化后给出不同的零空间离散度 AUC。由于掩膜几何与条件任务难度共同变化，该实验不能识别几何的因果效应。附录 B.2 给出完整掩膜库、协议与敏感性分析。

## 8 结论

本文发展了一套关于线性测量如何改变扩散反向动力学的信息论解释。后验—先验分数差是平滑似然力，其条件能量给出后验—先验熵耗散率；其积分连同终端边缘散度决定反向路径相对熵，对测量取平均则给出 I-MMSE 关系。在二阶矩有限时，联合律力在高噪声处相对先验分数变弱。可解模型进一步表明：条件化去除测量已解释的类别分离；把经验解释预算从 $\log n$ 降到 $H(I\mid r)$；并使信息同化在奇异值谱之外依赖算子—先验对齐。

精确模型诊断直接展示了这些量。另一项独立的学习模型研究在同一冻结 FFHQ 检查点与同一固定谱掩膜库内发现不同的零空间轨迹统计量。把分析扩展到线性测量之外，并在独立训练的模型间检验方向性预测，是自然的下一步。综合而言，结果表明测量信息同时具有**预算**与**几何**，而端点质量或仅算子谱都不能刻画其中任何一项。

## 致谢与资助披露

作者感谢 Yoshiyuki Kabashima 关于分析可解模型情形的宝贵建议。本工作部分受国家自然科学基金（NSFC）资助号 62306277 支持。

## 参考文献

原文采用作者—年份引用制，参考文献表按字母顺序排列、未编号。以下按原文的字母顺序逐条转录英文原条目；原文参考文献表未编号，本页为便于站内引用与核对加注序号 [1]—[56]（源文 pp. 45—49，共 56 条）。

[1] Beatrice Achilli, Marco Benedetti, Giulio Biroli, and Marc Mézard. Theory of speciation transitions in diffusion models with general class structure. arXiv preprint arXiv:2602.04404, 2026.

[2] Emil Albrychiewicz, Andrés Franco Valiente, and Li-Ching Chen. Dynamical regimes of multimodal diffusion models. arXiv preprint arXiv:2602.04780, 2026.

[3] Luca Ambrogioni. The statistical thermodynamics of generative diffusion models: Phase transitions, symmetry breaking, and critical instability. Entropy, 27(3):291, 2025.

[4] Brian D. O. Anderson. Reverse-time diffusion equation models. Stochastic Processes and their Applications, 12(3):313–326, 1982.

[5] Rajendra Bhatia. Matrix Analysis, volume 169 of Graduate Texts in Mathematics. Springer, New York, 1997.

[6] Giulio Biroli, Tony Bonnaire, Valentin De Bortoli, and Marc Mézard. Dynamical regimes of diffusion models. Nature Communications, 15:9957, 2024.

[7] Benjamin Boys, Mark Girolami, Jakiw Pidstrigach, Sebastian Reich, Alan Mosca, and O. Deniz Akyildiz. Tweedie moment projected diffusions for inverse problems. Transactions on Machine Learning Research, 2024.

[8] Gabriel Cardoso, Yazid Janati El Idrissi, Sylvain Le Corff, and Eric Moulines. Monte Carlo guided denoising diffusion models for Bayesian linear inverse problems. In International Conference on Learning Representations, 2024.

[9] Nicholas Carlini, Jamie Hayes, Milad Nasr, Matthew Jagielski, Vikash Sehwag, Florian Tramèr, Borja Balle, Daphne Ippolito, and Eric Wallace. Extracting training data from diffusion models. In 32nd USENIX Security Symposium, pages 5253–5270, 2023.

[10] Kathryn Chaloner and Isabella Verdinelli. Bayesian experimental design: A review. Statistical Science, 10(3):273–304, 1995.

[11] Hyungjin Chung, Jeongsol Kim, Michael T. McCann, Marc L. Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In International Conference on Learning Representations, 2023.

[12] Evan Scope Crafts, Umberto Villa, Saviz Mowlavi, Yanting Ma, Hassan Mansour, and Wael H. Ali. A stabilized path-space approach to diffusion-based posterior sampling. arXiv preprint arXiv:2606.12710, 2026.

[13] Matias G. Delgadino, Sebastien Motsch, Advait Parulekar, William Porteous, and Sanjay Shakkottai. Diffusion-based posterior sampling: A Feynman–Kac analysis of bias and stability. arXiv preprint arXiv:2605.06538, 2026.

[14] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.

[15] Hans Föllmer. An entropy approach to the time reversal of diffusion processes. In Michel Métivier and Etienne Pardoux, editors, Stochastic Differential Systems: Filtering and Control, volume 69 of Lecture Notes in Control and Information Sciences, pages 156–163. Springer, 1985. doi:10.1007/BFb0005070.

[16] Giulio Franzese, Mustapha Bounoua, and Pietro Michiardi. MINDE: Mutual information neural diffusion estimation. In International Conference on Learning Representations, 2024.

[17] Dongning Guo, Shlomo Shamai, and Sergio Verdú. Mutual information and minimum mean-square error in Gaussian channels. IEEE Transactions on Information Theory, 51(4):1261–1282, 2005.

[18] Shayan Mohajer Hamidi and En-Hui Yang. Conditional mutual information based diffusion posterior sampling for solving inverse problems. arXiv preprint arXiv:2501.02880, 2025.

[19] Florian Handke, Dejan Stančević, Felix Koulischer, Thomas Demeester, and Luca Ambrogioni. The entropic signature of class speciation in diffusion models. In Proceedings of the 43rd International Conference on Machine Learning, 2026.

[20] Ulrich G. Haussmann and Etienne Pardoux. Time reversal of diffusions. The Annals of Probability, 14(4):1188–1205, 1986. doi:10.1214/aop/1176992362.

[21] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, 2020.

[22] Henry Hunt, Mason Kamb, and Surya Ganguli. An exact information theory of generalization phase transitions in Bayesian diffusion models. arXiv preprint arXiv:2607.08041, 2026.

[23] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G. Dimakis, and Jonathan Tamir. Robust compressed sensing MRI with deep generative priors. In Advances in Neural Information Processing Systems, 2021.

[24] Yuchen Jiao, Na Li, Changxiao Cai, Yuxin Chen, and Gen Li. Provable diffusion-based posterior sampling for linear inverse problems via DDIM. arXiv preprint arXiv:2607.19333, 2026.

[25] Zahra Kadkhodaie and Eero P. Simoncelli. Stochastic solutions for linear inverse problems using the prior implicit in a denoiser. In Advances in Neural Information Processing Systems, volume 34, pages 13242–13254, 2021.

[26] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 4401–4410, 2019.

[27] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems, 2022.

[28] Xianghao Kong, Rob Brekelmans, and Greg Ver Steeg. Information-theoretic diffusion. In International Conference on Learning Representations, 2023.

[29] Yann LeCun, Léon Bottou, Yoshua Bengio, and Patrick Haffner. Gradient-based learning applied to document recognition. Proceedings of the IEEE, 86(11):2278–2324, 1998.

[30] Christian Léonard. Girsanov theory under a finite entropy condition. In Séminaire de Probabilités XLIV, pages 429–465. Springer, 2012.

[31] Marvin Li and Sitan Chen. Critical windows: Non-asymptotic theory for feature emergence in diffusion models. In International Conference on Machine Learning, pages 27474–27498, 2024.

[32] Thomas A. Louis. Finding the observed information matrix when using the EM algorithm. Journal of the Royal Statistical Society Series B: Statistical Methodology, 44(2):226–233, 1982.

[33] Haiqi Lu and Ying Tang. Steering dynamical regimes of diffusion models by breaking detailed balance. arXiv preprint arXiv:2602.15914, 2026.

[34] Abbas Mammadov, Ozgur Kara, Kaan Oktay, Iskander Azangulov, Adil Kaan Akan, Hyungjin Chung, James Matthew Rehg, and Yee Whye Teh. Exact posterior score estimation for solving linear inverse problems. arXiv preprint arXiv:2606.17048, 2026.

[35] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In International Conference on Learning Representations, 2024.

[36] Xiangming Meng and Yoshiyuki Kabashima. Quantized compressed sensing with score-based generative models. In International Conference on Learning Representations, 2023.

[37] Xiangming Meng and Yoshiyuki Kabashima. QCS-SGM+: Improved quantized compressed sensing with score-based generative models. Proceedings of the AAAI Conference on Artificial Intelligence, 38(13):14341–14349, 2024.

[38] Xiangming Meng and Yoshiyuki Kabashima. Diffusion model based posterior sampling for noisy linear inverse problems. In Proceedings of the 16th Asian Conference on Machine Learning, volume 260 of Proceedings of Machine Learning Research, pages 623–638, 2025.

[39] Minh-Hai Nguyen, Quoc-Bao Do, Edouard Pauwels, and Pierre Weiss. An analytic theory of convolutional neural network inverse problems solvers. arXiv preprint arXiv:2601.10334, 2026.

[40] Xinyu Peng, Ziyang Zheng, Wenrui Dai, Nuoqian Xiao, Chenglin Li, Junni Zou, and Hongkai Xiong. Improving diffusion models for inverse problems using optimal posterior covariance. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 40347–40370, 2024.

[41] Gabriel Raya and Luca Ambrogioni. Spontaneous symmetry breaking in generative diffusion models. In Advances in Neural Information Processing Systems, volume 36, 2023.

[42] Antonio Sclocchi, Alessandro Favero, and Matthieu Wyart. A phase transition in diffusion models reveals the hierarchical nature of data. Proceedings of the National Academy of Sciences, 122(1):e2408799121, 2025.

[43] Jascha Sohl-Dickstein, Eric A. Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International Conference on Machine Learning, 2015.

[44] Gowthami Somepalli, Vasu Singla, Micah Goldblum, Jonas Geiping, and Tom Goldstein. Diffusion art or digital forgery? Investigating data replication in diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 6048–6058, 2023.

[45] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In International Conference on Learning Representations, 2021a.

[46] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.

[47] Yang Song and Stefano Ermon. Generative modeling by estimating gradients of the data distribution. In Advances in Neural Information Processing Systems, 2019.

[48] Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021b.

[49] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations, 2022.

[50] Tomoei Takahashi, Takashi Takahashi, and Yoshiyuki Kabashima. Dynamical regimes of discrete diffusion models. arXiv preprint arXiv:2604.10961, 2026.

[51] George E. Uhlenbeck and Leonard S. Ornstein. On the theory of the Brownian motion. Physical Review, 36(5):823–841, 1930.

[52] Pascal Vincent. A connection between score matching and denoising autoencoders. Neural Computation, 23(7):1661–1674, 2011.

[53] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In International Conference on Learning Representations, 2023.

[54] Luhuan Wu, Brian L. Trippe, Christian A. Naesseth, David M. Blei, and John P. Cunningham. Practical and asymptotically exact conditional sampling in diffusion models. In Advances in Neural Information Processing Systems, volume 36, 2023.

[55] Longxuan Yu, Xing Shi, Xianghao Kong, Tong Jia, and Greg Ver Steeg. MMG: Mutual information estimation via the MMSE gap in diffusion. In Proceedings of the 42nd Conference on Uncertainty in Artificial Intelligence, volume 337 of Proceedings of Machine Learning Research, pages 7913–7927, 2026.

[56] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops, 2023.

## 附录 A：证明

附录 A 为正文全部形式结果提供证明，共 22 个小节：A.1 引理 4.1；A.2 定理 4.2；A.3 引理 4.3；A.4 推论 4.4；A.5 推论 4.5；A.6 推论 4.6；A.7 引理 4.7；A.8 引理 4.9；A.9 推论 4.8；A.10 推论 4.10；A.11 命题 4.11；A.12 命题 4.12；A.13 推论 4.13；A.14 条件高斯混合结果；A.15 命题 5.4 与推论 5.5；A.16 命题 5.6；A.17 注记 5.7 中高斯尺度的推导；A.18 定理 5.8；A.19 定理 5.9；A.20 推论 5.10；A.21 命题 5.11；A.22 引理 5.12。

证明结构要点（按原文步骤）：**A.1（引理 4.1）** 由假设 (9) 得 $p(x\mid x_0,r)=q_t(x\mid x_0)$，对 $X_0$ 条件律积分并由贝叶斯公式得 $p(r\mid X_t=x)=\mathbb E[p(r\mid X_0)\mid X_t=x]$，即 (16)；高斯加噪信道分数为 $\nabla_x\log p(x\mid x_0)=\frac{a_tx_0-x}{\Delta_t}$，把 Fisher 隐变量恒等式应用于后验加噪密度即得 (18)—(19)。**A.2（定理 4.2）** 对相对熵 $K_t(r)=\mathrm{KL}(q_t^{r}\Vert p_t)$ 沿共同 OU 半群求时间导数，利用相对分数 $\nabla\log(q_t^{r}/p_t)=g_t$ 与相对 Fisher 信息，得到耗散率恒等式 (20)—(21)；对测量取期望得 (22)。**A.3（引理 4.3）** 分别验证有限混合与线性高斯两类模型的端点极限与正则性。**A.4（推论 4.4）** 用反向路径测度的相对熵、时间反转与 Girsanov 公式把路径 KL 表示为终端 KL 加累积力能量 (23)。**A.5（推论 4.5）** 在高噪声窗口用 $I(R;X_t)\le I(X_0;Y_{\gamma_t})$ 与高斯信道互信息界得到 (24)，再由 Pinsker 与 Jensen 得到 (25)。**A.6（推论 4.6）** 对 (21) 从 0 到 $\infty$ 积分并用 $K_\infty=0$、$K_0=\mathrm{KL}(P_0(\cdot\mid r)\Vert P_0)$ 得 (26)；对均匀经验先验代入权重得 (27)。**A.7（引理 4.7）** 用条件独立性证明 $\mathbb E[g_t(X_t,R)\mid X_t]=0$，从而分数二阶矩矩阵正交分解 (29)—(31)。**A.8（引理 4.9）** 用先验分数能量的显式下界与协方差迹的关系给出 (35)—(36)。**A.9（推论 4.8）** 由条件 Tweedie 恒等式把 $g_t$ 写成条件均值之差并取二阶矩，得 (32)；用方差上界得 (33)—(34)。**A.10（推论 4.10）** 合并 (33) 与 (36) 得 (37)—(38)。**A.11（命题 4.11）** 应用条件 I-MMSE 恒等式得 (41)—(42)，再经变量替换 $\gamma_t=a_t^{2}/\Delta_t$ 得 (43)—(44)，零 SNR 右导数给 (45)。**A.12（命题 4.12）** 对联合高斯 $(X_t,R)$ 条件化得 (47)—(48)，微分得力 (49) 与能量 (50)—(51)。**A.13（推论 4.13）** 用先验分数 $s_t^{\mathrm{prior}}=-B_t^{-1}x$ 计算 (52)—(53) 与比值 (54)。**A.14—A.15** 推导条件高斯混合的后验几何（命题 5.1）、分数分解（推论 5.2）、克隆基线（命题 5.4）与一维约化（推论 5.5），包括 $\kappa_t=1$ 的局部稳定性判据。**A.16（命题 5.6）** 由高斯混合表示 (76) 直接计算熵恒等式 (78)。**A.17** 推导注记 5.7 的高斯尺度公式 (87)。**A.18（定理 5.8）** 在对齐奇异基下逐坐标计算先验/力能量与比值，得 (93)—(97)。**A.19（定理 5.9）** 计算匹配谱下 $M_\gamma(A)$ 的闭式 (98)，并用 Ky Fan 型特征值不等式与 $\psi_\gamma$ 的单调性得 (99)—(101)。**A.20（推论 5.10）** 取秩一情形直接比较 (102)。**A.21（命题 5.11）** 在坐标均匀能量假设下由秩与维数得稀释关系 (103)。**A.22（引理 5.12）** 用全协方差公式与条件期望的方差分解得 (104)。

> **说明：** 上述为按原文小节结构整理的证明要点（关键中间等式与结论），未逐行转写全部代数细节；所有结论、不等式方向与常数均与原文一致。

## 附录 B：实现细节

### B.1 精确模型实验

**MNIST 经验后验。** 经验计算使用前 1500 张 Keras MNIST 训练图像（归一化到 $[0,1]$）与 100 个支撑内参考。去噪使用恒等算子，超分辨使用 $2\times$ 平均池化，修复移除中心 $14\times14$ 块。平均池化的伪逆为最近邻块上采样，故 $AA^{\dagger}=\mathbf I_{d_y}$。

对参考测量 $r=Ax^{\star}$，宽度 $\sigma_y$ 的高斯似然给出 $\ell_i(r)=-\lVert Ax_i-r\rVert^{2}/(2\sigma_y^{2})$、$w_i(r)=e^{\ell_i(r)}/\sum_je^{\ell_j(r)}$。后验索引熵与类别概率为 $H(I\mid r)=-\sum_iw_i(r)\log w_i(r)$、$P(C=c\mid r)=\sum_{i:y_i=c}w_i(r)$。噪声水平 $t$ 处条件索引责任为 $P(I=i\mid x,r)\propto w_i(r)\exp\{-\lVert x-a_tx_i\rVert^{2}/(2\Delta_t)\}$，其熵在 $p_t(\cdot\mid r)$ 的精确抽样上平均。对十个 MNIST 类别，令 $p_c(x,r)=\sum_{i:y_i=c}P(I=i\mid x,r)$，克隆诊断为 $\phi_r(t)=\mathbb E_{X_t\mid r}\sum_{c=0}^{9}p_c(X_t,r)^{2}$，高噪声基线为 $\phi_r(\infty)=\sum_{c=0}^{9}P(C=c\mid r)^{2}$。图 3、图 4 使用 $\sigma_y=2$；每条熵曲线对每个参考使用 32 个 Monte Carlo 状态并报告参考上的均值与标准误。信号空间行／零空间离散度按 $D_{\mathrm{row}}=\frac{1}{r_A}\operatorname{Tr}\operatorname{Cov}(P_A\widehat x_0)$、$D_{\mathrm{null}}=\frac{1}{d-r_A}\operatorname{Tr}\operatorname{Cov}(P_A^{\perp}\widehat x_0)$ 计算（相应子空间维数非零时）。

**数值精度与高噪声缩放。** 共同精确分数轨迹使用对数间隔的 Euler–Maruyama 网格。表 2 在保持参考、链与保存检查点不变的情况下比较 200、400、800 个反向步：同一任务内索引半衰时间最多变化 0.059，终端残差保持在解析相容池底限 $F_r=\frac{1}{d_y}\sum_iw_i(r)\lVert Ax_i-r\rVert^{2}$ 的 6.3% 以内。

**表 2：精确分数反向 SDE 的 Euler–Maruyama 稳定性。** 半衰时间先在各参考内插值再平均；最后一列为参考平均的反向与前向条件索引熵曲线的最大差。

| 任务（步数 200/400/800） | 索引 $t_{1/2}$ | 类别 $t_{1/2}$ | $R_{\mathrm{end}}/F_r$ | 熵差 |
|---|---|---|---|---|
| 去噪 | 0.848/0.906/0.871 | 0.887/0.998/0.992 | 0.997/1.062/0.975 | 0.094/0.074/0.074 |
| 超分辨 | 0.915/0.921/0.922 | 0.868/0.861/0.870 | 0.992/1.001/1.024 | 0.136/0.091/0.065 |
| 修复 | 0.891/0.893/0.906 | 0.868/0.868/0.890 | 1.012/1.029/1.016 | 0.206/0.115/0.069 |

联合律计算采样 $I\sim\mathrm{Unif}\{1,\ldots,n\}$、$X_0=x_I$、$R=AX_0+\varepsilon$、$X_t=a_tX_0+\sqrt{\Delta_t}Z$，在八个个高噪声检查点对 1,024 个联合样本评估精确先验与后验分数。把 log 能量对 $\log a_t^{2}$ 回归，去噪、超分辨与修复的力能量斜率分别为 1.003、1.006、1.008，相对能量斜率分别为 1.002、1.005、1.007；每维先验分数能量保持在 0.996 与 1.014 之间。估计的领头系数与 $d^{-1}\operatorname{Tr}\operatorname{Cov}(\mathbb E[X_0\mid R])$ 一致，各任务相对误差低于 $4\times10^{-4}$。

**似然宽度敏感性。** 主 MNIST 诊断使用 $\sigma_y=2$；图 8 把假设似然宽度从 0.5 变到 3。似然变宽时后验索引预算趋近 $\log n$，而类别基线趋近其无条件值。

**高斯时间标定。** 对 $2\times$ 超分辨，注记 5.7 的分数高斯解析尺度在 96 个参考—似然宽度对上评估，其平均绝对误差为 0.109，交叉验证常数预测器为 0.133；配对差 $-0.024$ 的参考簇 95% 区间为 $[-0.064,0.008]$。因此高斯尺度提供了无参数的描述性标定，而其相对常数的优势在该样本量下尚未判定。

**表 3：在十个验证参考上选定的配置。** 每次运行 1000 个反向步，$\sigma_y=0.05$。

| 任务 | DPS 尺度 | DDNM+ $\eta$ | PiGDM $\lambda(\eta)$ | DMPS 尺度 |
|---|---|---|---|---|
| $4\times$ 超分辨 | 0.40 | 0.85 | 0.05 (1.0) | 1.50 |
| 块修复 | 0.65 | 0.85 | 0.10 (1.0) | 1.75 |
| 随机修复 | 0.65 | 0.85 | 0.10 (1.0) | 1.75 |

### B.2 神经采样器实验

**实现与数据划分。** 实验使用官方 DPS 残差梯度更新 [Chung et al., 2023]、基于 SVD 的 DDNM/DDNM+ 更新 [Wang et al., 2023]、PiGDM 伪逆规则 [Song et al., 2023] 与 DMPS 线性高斯修正 [Meng and Kabashima, 2025]。平均池化超分辨与坐标修复用显式伪逆实现。投影器测试给出最大行／零空间重建误差 $1.192\times10^{-7}$、最大相对迹分解差距 $2.733\times10^{-10}$。

所有方法使用同一无条件 FFHQ $256\times256$ 检查点与测量噪声 $\sigma_y=0.05$。用十个参考选择表 3 中的任务特定配置。主轨迹实验使用 30 个不相交测试参考，每个参考八条链；有限链计算使用其中五个参考、每个 64 条链。置信区间对参考重采样 2,000 次；链与检查点视为参考内的重复观测。

**共同观测量。** 在每个保存状态、方法特定修正之前，共享检查点给出 $\widehat x_{0,t}^{\mathrm{common}}=D_{\mathrm{fixed}}(x_t,t)$。测量残差为 $R_t^{\mathrm{pre}}=d_y^{-1}\lVert A\widehat x_{0,t}^{\mathrm{common}}-r\rVert^{2}$。对离散度，同一 $[-1,1]$ 裁剪与显式行／零空间投影器应用于每种方法，协方差分母 $K-1$。应用共同约定消除了原生裁剪与存储精度的差异。配置级比较针对完整采样规则，这些规则在引导尺度、pivot、Jacobian 处理、投影、随机性与修正点上同时不同。

**固定谱掩膜库与统计量。** 留出实验使用十个新 FFHQ 参考与十六个掩膜库：五个连续、三个多孔、三个结构分布、五个独立随机掩膜。每个掩膜隐藏四分之一空间位置，故所有掩膜具有相同秩、零化度与奇异值。对每个参考与链，测量与祖先噪声在各方法与掩膜间配对。对方法 $m$、掩膜 $q$、参考 $r$，主统计量为

$$
L_{mqr}=\log\frac{\mathrm{AUC}_{\mathrm{logSNR}}\,D_{m,q,r}^{\mathrm{null}}}{\mathrm{AUC}_{\mathrm{logSNR}}\,D_{\mathrm{prior},q,r}^{\mathrm{null}}},\tag{120}
$$

其中每个 AUC 在 log-SNR $[-10.12,9.21]$ 上对 25 个共同检查点积分。分母由独立无条件 DDPM 轨迹池经同一掩膜投影得到。主比较是对每个采样器分别计算的连续减随机对比。区间以固定掩膜库为条件并对十个参考重采样。

**敏感性分析。** 方法特定估计与参考自举区间见图 6。交叉参考—掩膜自举区间对四种方法特定的零空间对比给出相同的正号。多孔掩膜对每个采样器给出中间对比，而结构分布掩膜接近随机族。端点缺失区域 PSNR 对连续掩膜低于随机掩膜（每个采样器），方法特定对比从 $-23.49$ 到 $-14.04$ dB。经上下文填充难度调整后的区间跨越零，且两个掩膜族在该协变量上重叠很小。因此结果在该掩膜库与检查点条件下解释。

64 链子集实验度量离散度汇总的有限链误差。相对 64 链，八链在行空间 AUC 与零空间 AUC 上的合并平均绝对相对误差分别为 8.0% 与 7.1%，相应峰值误差更大。这些结果支持聚合 AUC 比较，同时使参考级峰值排序不精确。随附代码发布提供采样与分析代码以及这些检查所用配置。

### B.3 精确与插入式测量力

第 6.2 节的标定可在一维中看到。令 $X_0\sim\mathcal N(0,\sigma_x^{2})$、$R=X_0+\varepsilon$、$X_t=a_tX_0+\sqrt{\Delta_t}\xi$，其中 $\varepsilon\sim\mathcal N(0,\sigma_y^{2})$、$\xi\sim\mathcal N(0,1)$，且 $X_0$、$\varepsilon$、$\xi$ 相互独立。定义

$$
D_t=a_t^{2}\sigma_x^{2}+\Delta_t,\qquad m_t(x)=\frac{a_t\sigma_x^{2}}{D_t}x,\qquad v_t=\frac{\sigma_x^{2}\Delta_t}{D_t}.
$$

则 $R\mid X_t=x\sim\mathcal N(m_t(x),v_t+\sigma_y^{2})$。精确平滑似然力与用精确先验去噪器形成的插入式梯度为

$$
g_t^{\mathrm{exact}}(x,r)=m_t'(x)\frac{r-m_t(x)}{v_t+\sigma_y^{2}},\qquad
g_t^{\mathrm{plug}}(x,r)=m_t'(x)\frac{r-m_t(x)}{\sigma_y^{2}}.\tag{121}
$$

因此

$$
g_t^{\mathrm{plug}}=\left(1+\frac{v_t}{\sigma_y^{2}}\right)g_t^{\mathrm{exact}},\qquad
\mathbb E\left|g_t^{\mathrm{exact}}\right|^{2}=\frac{(m_t')^{2}}{v_t+\sigma_y^{2}},\qquad
\mathbb E\left|g_t^{\mathrm{plug}}\right|^{2}=\frac{(m_t')^{2}(v_t+\sigma_y^{2})}{\sigma_y^{4}}.\tag{122}
$$

因此插入式损失用测量方差替代预测方差；即使干净去噪器精确，该差异仍然存在。离散 DPS 实现按残差范数归一化其步长 [Chung et al., 2023]：$\zeta_i=\zeta'/\lVert y-A\widehat x_0(x_i)\rVert$。在吸收到 $\widetilde\zeta$ 中的常数以外，其一维对应物为

$$
g_t^{\mathrm{norm}}(x,r)=\widetilde\zeta m_t'(x)\,\mathrm{sign}\left\{r-m_t(x)\right\},\qquad
\frac{\mathbb E\left|g_t^{\mathrm{norm}}\right|^{2}}{\mathbb E\left|g_t^{\mathrm{exact}}\right|^{2}}=\widetilde\zeta^{2}\left(v_t+\sigma_y^{2}\right).\tag{123}
$$

取 $\widetilde\zeta=1/\sigma_y$（与低噪声能量匹配）时，比值为 $1+v_t/\sigma_y^{2}$。因此残差归一化减轻了固定精度的失配，却不复现精确力的预测方差阻尼。在 VP 归一化下，三种能量具有相同的 $O(a_t^{2})$ 高噪声阶，但标定不同。

## 图注与表注

**图 1：各向异性高斯先验中的匹配谱取向依赖。** (a) 两个秩一、行正交测量的奇异值相同，但选取不同的先验特征方向。(b) 它们的精确测量同化曲线 $M_\gamma(A)=I(R_A;Y_\gamma)$ 在整个高斯信道上不同，并在 $\gamma=\gamma_t$ 处等于相应的平均后验—先验反向路径 KL；虚线渐近为干净测量信息，等价于后验协方差体积收缩的一半。参数为 $\Sigma=\operatorname{diag}(4,0.25)$、$\sigma_y=0.5$；曲线以闭式评估定理 5.9。

**图 2：精确条件高斯混合中的剩余类别信息诊断。** (a) 零场处残差坐标 $\kappa_t$ 穿越局部不稳定性参考 $\kappa_t=1$。(b) 存在测量诱导场时，减去高噪声克隆基线可隔离含噪状态新增的证据。(c) 残差分离 $d^{-1}\lVert(\mathbf I_d-KA)m\rVert^{2}$ 只在已观测方向上减小。

**图 3：1500 样本 MNIST 子集上的精确经验后验诊断**（100 个参考；带与柱为标准误）。(a) $H(I\mid X_t,r)$ 从测量相关预算 $H(I\mid r)$ 开始并随分量分离而衰减；彩色点线水平为相应平均预算。(b) 后验预算；灰虚线为无条件参考 $H(I)=\log n$。(c) 测量诱导的高噪声类别克隆基线。

**图 4：共同精确分数条件反向轨迹上的信息诊断**（MNIST 经验先验；20 个参考、32 条链）。(a) 固定参考行空间力比；彩色点线为相应全局比，灰色虚线为 $a_t^{2}$ 高噪声缩放的单位斜率参考。(b) 类别熵，虚线为静态测量基线。(c) 去噪残差趋近相容池采样底限。(d) 索引信息，分解为测量领先量（彩色虚线）与随后的轨迹解析；空心圆为每第四个保存检查点处的独立前向条件样本。

**图 5：精确有限经验后验的总协方差标定。** 实线为后验均值离散度占干净后验方差的比例；虚线为剩余条件协方差。(a)—(b) 超分辨的行与零空间坐标；(c)—(d) 修复的行与零空间坐标。阴影为 95% 参考自举区间；在多数检查点处它们比所绘曲线更窄。

**图 6：固定库中五个连续掩膜与五个随机掩膜的方法特定对比。** 点为留出参考上的均值；柱为以掩膜为条件的 95% 参考自举区间。(a) 中正值表示连续掩膜的引导—先验零空间 AUC 比更大。(b) 为相应的行空间对比。

**图 7：有限经验 MNIST 先验（1,024 样本）的联合律高噪声计算**（带为标准误）。(a) 每维测量力能量。(b) 先验分数能量。(c) 两者之比。(a) 与 (c) 中的点线参考相对 $a_t^{2}$ 具有单位斜率。

**图 8：有限经验后验诊断对假设似然宽度的敏感性。** (a) 后验索引预算 $H(I\mid r)$。(b) 高噪声类别基线 $\phi_r(\infty)$。曲线对 100 个支撑内参考取平均；阴影带为标准误；虚线标记相应无条件极限。

**图 9：固定谱掩膜库。** 黑色像素为缺失。所有掩膜移除相同数量的空间位置，因此具有相同奇异值。

**表注：** 表 1 为第 4—5 节所用精确坐标汇总；表 2 为精确分数反向 SDE 的 Euler–Maruyama 稳定性（200/400/800 步）；表 3 为在十个验证参考上选定的神经采样器配置。原文表题注明各表的单位与条件。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2608.21709v1（cs.LG，2026-08-22）的全文中文译稿，按原文结构译出：摘要与关键词；第 1 节引言与贡献；第 2 节背景与问题设置（式 (1)—(15)）；第 3 节相关工作；第 4 节基础恒等式与后验力预算（4.1—4.5，式 (16)—(54)）；第 5 节可解模型中的后验信息机制（5.1—5.3，式 (55)—(104)）；第 6 节从精确信息动力学到近似采样器（6.1—6.2，式 (105)—(115)、表 1）；第 7 节诊断研究（7.1 与 7.1.1—7.1.4、7.2，式 (116)—(119)）；第 8 节结论；致谢；参考文献（作者—年份制、按字母顺序、未编号，全文转录 56 条并按原顺序加注序号 [1]—[56]）；附录 A（22 个小节的证明要点）；附录 B（B.1—B.3，式 (120)—(123)、表 2—表 3）；图 1—图 9 图注与表 1—表 3 表注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言开头）→ 第 2—3 页（引言与贡献、第 2 节、式 (3)—(6)）→ 第 4—5 页（式 (7)—(15)、第 3 节相关工作）→ 第 6—12 页（第 4 节、式 (16)—(54)）→ 第 12—21 页（第 5 节、式 (55)—(104)、图 1）→ 第 21—23 页（第 6 节、式 (105)—(115)、表 1）→ 第 23—29 页（第 7 节、图 2—图 6）→ 第 30 页（第 8 节、致谢）→ 第 31—45 页（附录 A、A.1—A.22）→ 第 41—45 页（附录 B.1—B.3、表 2—表 3、图 7—图 9）→ 第 45—49 页（参考文献）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；公式覆盖原文编号式 (1)—(123)（经脚本核对：1—123 连续、无缺号）。表 2、表 3 与图 1—图 9 的图注按原文文本层转录；本页未对实验图做图像级数字重构。
2. 图 1—图 9 均未上传图片；本页以"图注与表注"小节统一给出 9 条中文图注与 3 条表注，正文按"图 N/表 N"引用。
3. **附录 A 的翻译方式：** 原文附录 A 含 22 个证明小节、篇幅约占全文三分之一（大量代数与不等式推导）。本页按原文小节结构给出每个证明的**目标结论与关键中间步骤**（关键恒等式、不等式方向与常数），未逐行转写全部代数整理；已在 A 节末尾明确说明。全文形式结果（引理／定理／命题／推论陈述）在正文中均完整译出，未改动任何结论。
4. **原文疑点／说明：** ①式 (38)、(54) 等界的高噪声窗口条件 $\Delta_t\ge\Delta_0>0$ 按原文照录；②定理 5.9 的上／下界在边界特征值重复时不唯一，原文已声明，译文保留；③命题 5.11 的秩稀释因子 $r_A/d$（$4\times$ 超分辨为 $1/16$）按原文照录；④注记 5.7 的高斯尺度与附录 B.1 的标定区间（$-0.064$ 到 $0.008$）照录；⑤原文表 2 的"熵差"列为参考平均反向与前向条件索引熵曲线最大差，单位纳特，照录；⑥原文式 (67)、(81)、(86)、(118) 等在正文中以行内或未加编号形式出现处，译文按原文编号补齐（见正文对应位置）。
5. 原文为 arXiv 预印本（cs.LG），49 页；页面目录日期 2026-09-16 为站点归档日期，页首"版本"采用 arXiv v1（2026-08-22）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。

{% endraw %}