---
layout: page
title: "学习弱凸正则项以构建收敛的图像重建算法｜中文全文译文"
permalink: /papers/translations/2026-10-04-2308-10542-learning-weakly-convex-regularizers-for-convergent-image-reconstructio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8bb134d0351d4de5/) · [原文 arXiv](https://arxiv.org/abs/2308.10542) · [全部目录](/papers/catalog/)

# 学习弱凸正则项以构建收敛的图像重建算法

**原题：** Learning Weakly Convex Regularizers for Convergent Image-Reconstruction Algorithms  
**作者：** Alexis Goujon、Sebastian Neumayer、Michael Unser（瑞士洛桑联邦理工学院（EPFL）生物医学成像组，Station 17，CH-1015 Lausanne；邮箱格式 `{forename.name}@epfl.ch`）  
**版本：** arXiv:2308.10542v2（eess.IV），2023 年 12 月 20 日更新，正文标注日期为 2023 年 12 月 21 日，原文 30 页。代码：WCRR-NN 实现与预训练模型 https://github.com/axgoujon/weakly_convex_ridge_regularizer ；用于求解逆问题的用法 https://github.com/axgoujon/convex_ridge_regularizers 。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节（含 1.1–1.4、3.1–3.5、3.3.1–3.3.2、4.1–4.2、4.2.1 等全部小节）、结论、致谢、全部图注（图 1–9）、表 1–4（逐格转录）、算法 1、公式 (1)–(38) 与 57 条参考文献英文原条目；原文无附录；逐句逐式终校未做。

## 摘要

我们提出学习一类非凸正则项，并对其**弱凸模数**设定事先规定的上界。这样的正则项所对应的变分去噪器最小化的是一个凸能量。它们只需很少的参数（少于 15,000 个），并且因为模仿了人工设计的促进稀疏正则项，具有信号处理层面的解释。通过数值实验，我们表明这类去噪器优于凸正则化方法以及流行的 BM3D 去噪器。此外，所学正则项可以部署到迭代方案中求解逆问题，且这些方案可证明收敛。在 CT 与 MRI 重建中，该正则项泛化良好，并与其他数据驱动方法相比在性能、参数数量、理论保证与可解释性之间提供了极佳的权衡。

## 1. 引言

线性逆问题在成像中无处不在，应用包括医学成像 [36]（如磁共振成像（MRI）与 X 射线计算机断层成像（CT））。在离散化的线性逆问题 [48] 中，目标是从给定的含噪观测

$$
\mathbf y=\mathbf H\mathbf x+\mathbf n\in\mathbb R^m, \tag{1}
$$

重建感兴趣的（未知）图像 $\mathbf x\in\mathbb R^d$，其中 $\mathbf H\in\mathbb R^{m\times d}$ 表示测量算子，$\mathbf n\in\mathbb R^m$ 是噪声项。为克服可能病态的 $\mathbf H$ 与噪声的存在，标准做法是把重建 $\hat{\mathbf x}$ 取为如下变分问题的解：

$$
\hat{\mathbf x}=\arg\min_{\mathbf x\in\mathbb R^d}\ 
\frac12\|\mathbf H\mathbf x-\mathbf y\|_2^2+R(\mathbf x), \tag{2}
$$

其中正则项 $R:\mathbb R^d\to\mathbb R$ 编码关于 $\mathbf x$ 的先验信息。凸正则项（如 Tikhonov 正则项 [54] 或全变差（TV）正则项 [50,15]）因能够高效求解 (2) 而广受欢迎。遗憾的是，这类正则项无法给出最先进的重建结果，并且存在已知的局限；例如它们通常难以保持图像 $\mathbf x$ 中的纹理 [43]。

### 1.1 面向去噪的凸–非凸框架

依赖精心选择的非凸 $R$ 可以带来更好的性能 [49,11]，但代价是一般无法求得 (2) 的全局极小。**凸–非凸（convex non-convex，CNC）**框架提供了一种可能的补救：部署一个非凸的 $R_{\rm CNC}$，使得整体目标

$$
\mathcal J(\mathbf x)=\frac12\|\mathbf H\mathbf x-\mathbf y\|_2^2+R_{\rm CNC}(\mathbf x) \tag{3}
$$

是凸的，参见 [31] 的综述。过去几年中，CNC 途径已在多种设定下带来改进，包括字典学习 [53]、即插即用（plug-and-play，PnP）算法 [34,24] 与矩阵补全 [1]。

对图像去噪这一情形，即 $\mathbf H=\mathbf I$，数据保真项 $\tfrac12\|\mathbf x-\mathbf y\|_2^2$ 是 1-强凸的。因此，为保证 $\mathcal J$ 的凸性，由弱凸性的定义（见第 2 节），正则项 $R_{\rm CNC}$ 需要是 1-弱凸的。已有多种策略被提出用于设计弱凸的 $R_{\rm CNC}$。

**显式设计.** 常用的用于稀疏正则化的 $\|\cdot\|_1$ 范数，可以替换为能更好模拟 $\|\cdot\|_0$ 范数行为的非凸罚函数，同时仍保证处于 CNC 框架之内。这包括适当缩放的 log 罚与极小极大凹罚（minimax concave penalty）[30]。这些函数虽然非凸，却是拟凸的；特别地，它们使大取值受到比小取值更强的惩罚。随后把这些势函数与卷积滤波器结合，例如得到 TV 类正则项 [57,51]，它们扩展并改进了相应的凸版本。

**借助 Moreau 包络的隐式设计.** 存在一种系统方法，可以把任意凸正则项转换为非凸但仍 1-弱凸的正则项，即利用其（广义）Moreau 包络 [1,31]。然而这样的正则项没有闭式，求解 (2) 的现有算法涉及计算量很大的双层优化任务。

**通过学习邻近算子的隐式设计.** 尽管 $R_{\rm CNC}$ 非凸，其邻近算子 $\mathrm{prox}_{R_{\rm CNC}}$ 在温和条件下是良定义的 [20]。在 [24] 中，作者提出直接学习 $\mathrm{prox}_{R_{\rm CNC}}$，使其成为良好的高斯去噪器。为此，他们显式参数化邻近算子，这与近期引入的梯度步去噪器 [12,23] 一脉相承。更具体地，他们把残差映射 $(\mathrm{prox}_{R_{\rm CNC}}-\mathrm{Id})$ 表示为一个深度卷积神经网络（CNN）的梯度，并通过强制其 Lipschitz 常数小于 1 来要求残差是压缩的。这带来了极佳的性能，但代价是难以对 CNN 的梯度施加严格的 Lipschitz 约束。为此，[24] 的作者提出在有限个位置上对 $(\mathrm{prox}_{R_{\rm CNC}}-\mathrm{Id})$ 的雅可比矩阵的谱范数做正则化。该方法在实践中效果良好，但对底层（隐式）目标 $\mathcal J$ 的弱凸性质没有给出任何可证明的保证。

### 1.2 向病态逆问题的扩展

当前向矩阵 $\mathbf H$ 不可逆时，CNC 模型的设计变得困难。由于数据项 $\tfrac12\|\mathbf H\mathbf x-\mathbf y\|_2^2$ 不再是强凸的，$R$ 的 1-弱凸性不再充分；此时对 $R$ 的条件依赖于 $\mathbf H$，因此 CNC 模型通常针对特定问题量身定制。可以将邻近算法与通用的弱凸正则项（其邻近算子良定义）结合，从而部分规避这一局限。[24,22] 针对前向–后向分裂 [5] 建立了目标函数临界点处的收敛性，其依据是 [3] 给出的、关于具有 Kurdyka–Łojasiewicz（KL）性质的函数的非常一般的收敛结果。当 $R$ 可微时（本文设定即作此假设），对非凸目标 (2) 应用梯度下降也可得到类似结果，见 [3]。从随机优化的角度看，已知此类一阶方法不会陷入目标的严格鞍点 [32]；这可以部分解释非凸重建框架良好的经验性能。

### 1.3 其他带有一定保证的深度学习变分方法

深度学习方法出现后，逆问题的重建质量得到显著提升；然而由于深度神经网络的“黑箱”性质，这往往伴随可解释性与可靠性的损失。因此，缓解这些局限的兴趣日益增长，综述见 [39]。下面简要评述那些采用带学习正则项 $R$ 的变分表述 (2)、但并不直接处于 CNC 框架内的工作。为在迭代图像重建中提供尽可能充分的理论保证，[38] 提出基于深度 CNN 学习凸的 $R$，并在 [19] 中表明一个浅层模型——即参数很少的凸岭正则项神经网络（convex ridge regularizer NN，CRR-NN）——已经足够。后者提供了学习一组滤波器与促进稀疏的轮廓函数来构造 $R$ 的机会。这受到专家场（Fields-of-Experts，FoE）框架 [49] 及其诸多变体（如 [11]）的启发，用于设计与学习非凸的 $R$。虽然 [11] 性能良好，但并不能保证目标函数是凸的。FoE 的另一流行扩展是可训练非线性反应扩散（trainable nonlinear reaction diffusion，TRND）[10]：其中与 (2) 相关的最小化方案被展开，每一步学习不同的滤波器与势函数。这相较 [11] 提升了性能，但不再对应于能量最小化。更近期地，这些框架都在变分网络 [28] 的语境下得到了统一。把它们与深度 CNN 研究中的新发现及早停技术结合，进而产生了全深度变分（total deep variation）框架 [27]。尽管该模型有若干层，通过特征函数分析仍保留了一定的可解释性。另一个具有收敛保证与正则化方案的深度学习变分方法见 [33]。

### 1.4 论文结构与主要贡献

本文提出一个学习 1-弱凸正则项的框架，所得正则项给出可解释的邻近去噪器。一般框架在第 2 节介绍；主要贡献如下。

- **去噪**：在第 3 节，我们提出弱凸岭正则项神经网络（weakly-convex-ridge-regularizer neural network，WCRR-NN）的训练方案，其性能相较其凸对应物显著提升，同时保持相同的保证与可解释性。基于命题 3.2 引入的一个条件，相应的去噪问题是凸的，从而可以全局最小化。数值实验表明，同时学习轮廓函数与滤波器所得到的稀疏先验，在 BSD68 测试集的多种噪声水平下是 CNC 框架中最先进的。特别地，这是**第一个优于 BM3D [13] 的、基于凸能量的模型**，而 BM3D 在近 15 年里一直是最流行的基准之一。
- **逆问题**：在第 4 节，我们把所学正则项部署到一般逆问题上，通过利用加速梯度下降（accelerated gradient descent，AGD）方案（算法 1）最小化 (2)，该方案针对我们的弱凸正则项量身定制。我们进一步证明算法可到达目标的某个临界点（定理 4.3）。CT 与 MRI 的数值实验表明，该正则项在经验上泛化良好；它优于若干带有收敛保证的基于能量的重建方法。

最后，第 5 节给出结论。WCRR-NN 的实现与预训练模型已公开（https://github.com/axgoujon/weakly_convex_ridge_regularizer），其用于求解逆问题的用法亦已公开（https://github.com/axgoujon/convex_ridge_regularizers）。

## 2. 弱凸正则项

我们的目标是为变分重建模型 (2) 构造一个正则项 $R$：它在多种逆问题上表现良好，同时保持经典方案的理论保证与可解释性。一个特别有前景的方向是 CNC 框架，在该框架下可以高效地找到 (2) 中目标的全局极小。按照实践中常见的做法，我们的策略是基于去噪任务来设计与训练正则项：

$$
\hat{\mathbf x}=\arg\min_{\mathbf x\in\mathbb R^d}\ 
\frac12\|\mathbf x-\mathbf y\|_2^2+R(\mathbf x), \tag{4}
$$

其中 $\mathbf y$ 是干净图像的含噪版本。对一般逆问题与弱凸正则项如何最小化 (2)，将在第 4 节讨论。

为使 (4) 成为 CNC 模型，$R$ 需要是 1-弱凸的，从而整体目标保持凸性。

**定义 2.1.** 函数 $f:\mathbb R^d\to\mathbb R$ 称为

i) **凸**，若对任意 $\mathbf x,\mathbf y\in\mathbb R^d$ 与 $\lambda\in[0,1]$ 有 $f(\lambda\mathbf x+(1-\lambda)\mathbf y)\le\lambda f(\mathbf x)+(1-\lambda)f(\mathbf y)$；

ii) **$\rho$-强凸**，若 $\left(f-\frac{\rho}{2}\|\cdot\|^2\right)$ 是凸的（$\rho\ge0$）；

iii) **$\rho$-弱凸**，若 $f+\frac{\rho}{2}\|\cdot\|^2$ 是凸的（$\rho\ge0$）。

注意 $\rho$-弱凸的 $R$ 对任意 $\mu\ge\rho$ 也是 $\mu$-弱凸的。凸的 $R$ 对任意 $\rho\ge0$ 都是 $\rho$-弱凸的，特别地是 0-弱凸的。对可微的 $R$，凸性等价于 $\nabla R$ 的单调性。因此，可微的 $R$ 是 $\rho$-弱凸的当且仅当

$$
(\nabla R(\mathbf y)-\nabla R(\mathbf x))^T(\mathbf y-\mathbf x)
\ge-\rho\|\mathbf y-\mathbf x\|_2^2 \tag{5}
$$

对任意 $\mathbf x,\mathbf y\in\mathbb R^d$ 成立。若 $R$ 二阶可微，则 $\rho$-弱凸性等价于

$$
\mathbf H_R(\mathbf x)\succeq-\rho\mathbf I \tag{6}
$$

对任意 $\mathbf x\in\mathbb R^d$ 成立，其中 $\mathbf H_R(\mathbf x)$ 表示 $R$ 在 $\mathbf x$ 处的 Hessian 矩阵。换言之，$\rho$-弱凸函数的 Hessian 的所有特征值都落在 $[-\rho,+\infty)$ 内。

**注 2.2.** 任何具有 $L$-Lipschitz 梯度的可微函数 $R$ 都是 $L$-弱凸的。然而这一估计未必紧：$R$ 也可能对某个 $0\le\rho\ll L$（直至零）是 $\rho$-弱凸的。例如，任何具有 $L$-Lipschitz 梯度的凸 $R$ 都是 $L$-弱凸的，但它也平凡地是 0-弱凸的，因为那等价于它是凸的。

弱凸性提供了更大的灵活性，同时仍保留通常凸正则化框架的多数理想性质。特别地，邻近算子

$$
\mathrm{prox}_R(\mathbf y)=\arg\min_{\mathbf x\in\mathbb R^d}\ 
\frac12\|\mathbf x-\mathbf y\|_2^2+R(\mathbf x) \tag{7}
$$

对任意满足 $\rho<1$ 的 $\rho$-弱凸 $R$ 都是良定义的。的确，(7) 中的目标是 $(1-\rho)$-强凸的，这保证唯一极小元的存在。一般非凸设定下邻近算子的性质在 [20] 中有详细刻画；这里的主要推论是我们去噪器 (7) 的 Lipschitz 连续性（命题 2.3）。

**命题 2.3（[20]）.** 对任意满足 $\rho<1$ 的 $\rho$-弱凸正则项 $R$，存在凸的、下半连续的势函数 $g:\mathbb R^d\to\mathbb R$，使得对每个 $\mathbf x\in\mathbb R^d$ 都有 $\mathrm{prox}_R(\mathbf x)\in\partial g(\mathbf x)$。反之，任何此类 $g$ 的次梯度都与某个 $R$ 的 $\mathrm{prox}_R$ 一致，而该 $R$ 在其定义域的任何凸子集上是 1-弱凸的。此外，$\mathrm{prox}_R$ 是 $\left(\frac{1}{1-\rho}\right)$-Lipschitz 的，即

$$
\|\mathrm{prox}_R(\mathbf y_2)-\mathrm{prox}_R(\mathbf y_1)\|_2
\le\frac{1}{1-\rho}\|\mathbf y_2-\mathbf y_1\|_2 \tag{8}
$$

对任意 $\mathbf y_1,\mathbf y_2\in\mathbb R^d$ 成立。更一般地，势函数 $g$ 的 $C^{k+1}$ 正则性导致 $\mathrm{prox}_R$ 的 $C^k$ 正则性。最后，在此设定下 $\mathrm{prox}_R$ 在其值域上可逆。

对凸正则项 $R$，$\rho=0$，因此 $\mathrm{prox}_R$ 是非扩张的（1-Lipschitz）。对非凸但弱凸的 $R$（即 $\rho>0$），这未必再成立。我们猜想这正是性能提升的关键，因为非扩张去噪器存在固有局限，例如参见 [19, Fig. 1]。

## 3. 面向去噪的可学习且可证 1-弱凸正则项的设计

本节讨论 $R$ 的构造与训练，并与若干其他变分框架作比较。

### 3.1 正则项架构

弱凸正则项 $R$ 取为卷积岭（convolutional ridges）之和：

$$
R:\ x[\cdot]\mapsto
\sum_{i=1}^{N_C}\sum_{\mathbf k\in\mathbb R^2}
\psi_i\left((h_i*x)[\mathbf k]\right), \tag{9}
$$

其中 $x[\cdot]$ 表示二维图像，$(h_i[\cdot])_{i=1}^{N_C}$ 是一组线性平移不变滤波器的冲激响应，$(\psi_i)_{i=1}^{N_C}$ 是导数 Lipschitz 连续的势函数。实践中，有限尺寸的输入图像被零填充，使卷积输出与输入图像具有相同的空间尺寸。我们还选取共享轮廓的势函数 $\psi$，即 $\psi_i=\alpha_i^{-2}\psi(\alpha_i\cdot)$，其中 $\alpha_i>0$。由于 $h_i[\cdot]$ 可以吸收 $\psi_i$ 定义中的 $\alpha_i$，这只是为在轮廓 $\psi$ 前引入权重 $\alpha_i^{-2}$ 的一种不同参数化。我们这种参数化的好处是 $\mathrm{Lip}(\psi_i')$ 不依赖 $\alpha_i$，这将简化本节的推理。滤波器数量 $N_C$ 也称为模型的通道数或特征图数。我们作出该选择的动机有三方面。

- **可解释性**：模型 (9) 涵盖了许多传统的促进稀疏正则项，并且如第 3.5 节所示，训练后的正则项将有简单的信号处理解释。更深的基于 CNN 的正则项，其参数通常比 (9) 中的更难解释。
- **对 $\rho$ 的控制**：模型 (9) 的弱凸模数可以用命题 3.2 给出上界。对更深的 CNN 架构，这一点远不明显；在那里，弱凸性通常通过在训练中正则化来促进 [24]。这虽然在定性上有效，但并不能对某个事先规定的 $\rho$ 产生可证明 $\rho$-弱凸的映射。
- **模型表达能力**：有证据表明，在受约束的设定下 (9) 具有良好的表达能力。例如，在学习和 (2) 相关的凸正则项时，形如 (9) 的架构与深度 CNN（如输入凸神经网络 ICNN）相当，而参数却少得多 [19]。

为简化后文记号，需要时把正则项 (9) 写成一般形式

$$
R:\ \mathbf x\mapsto\sum_{j=1}^{d\times N_C}\psi_j(\mathbf w_j^T\mathbf x), \tag{10}
$$

其中 $\mathbf x=(x[\mathbf k])_{\mathbf k\in\Omega}\in\mathbb R^d$ 是 $x[\cdot]$ 的向量化表示，$\mathbf w_j\in\mathbb R^d$ 对应滤波器核的平移版本，$j$ 同时索引通道与核的二维平移。该可微正则项 $R$ 的梯度为

$$
\nabla R(\mathbf x)=\mathbf W^T\varphi(\mathbf W\mathbf x), \tag{11}
$$

其中 $\mathbf W=[\mathbf w_1\ \cdots\ \mathbf w_{dN_C}]^T\in\mathbb R^{dN_C\times d}$，$\varphi$ 是逐点激活函数，$\varphi(\mathbf z)=(\psi_j'(z_j))_{j=1}^{dN_C}=(\alpha_j^{-1}\psi'(\alpha_jz_j))_{j=1}^{dN_C}$。注意 $\mathbf W\mathbf x$ 是图像 $\mathbf x$ 的多通道滤波版本。由于 $\psi$ 可以吸收 $\mathbf W$ 的谱范数，我们强制 $\|\mathbf W\|=1$（$\|\cdot\|$ 表示谱范数），以消除模型中的部分冗余并简化解释。

后文用到：$\psi'$ 的 Lipschitz 连续性蕴含 $\psi'$ 几乎处处可微（Rademacher 定理），且本质下确界 $\mathrm{ess\,inf}_{t\in\mathbb R}\psi''(t)$ 良定义并满足 $|\mathrm{ess\,inf}_{t\in\mathbb R}\psi''(t)|\le\mathrm{Lip}(\psi')$。

**引理 3.1.** 设 $\psi:\mathbb R\to\mathbb R$ 具有 Lipschitz 连续的导数。则对任意 $\rho\ge s_{\inf}=\max\left(0,-\mathrm{ess\,inf}_{t\in\mathbb R}\psi''(t)\right)$，$\psi$ 是 $\rho$-弱凸的。

**证明.** $\psi'$ 的 Lipschitz 连续性表明，对任意 $t_1,t_2\in\mathbb R$ 有 $\psi'(t_2)-\psi'(t_1)=\int_{t_1}^{t_2}\psi''(t)\,dt$。由此可推出 $(\psi(t_2)-\psi(t_1))(t_2-t_1)\ge\left(\mathrm{ess\,inf}_{t\in\mathbb R}\psi''(t)\right)(t_2-t_1)^2$，这正是条件 (5)。$\square$

**命题 3.2.** 任何形如 (10)、满足 $\|\mathbf W\|=1$ 且 $\psi$ 为 $\rho$-弱凸的 $R$ 都是 $\rho$-弱凸的。特别地，在假定 $\psi'$ Lipschitz 连续时，对引理 3.1 所定义的任意 $\rho\ge s_{\inf}$ 都成立。

**证明.** 由于 $\alpha_i>0$ 且 $\psi_i=\alpha_i^{-2}\psi(\alpha_i\cdot)$，映射 $t\mapsto\psi(t)+\frac{\rho}{2}t^2$ 的凸性蕴含映射 $t\mapsto\psi_i(t)+\frac{\rho}{2}\alpha_i^{-2}(\alpha_it)^2$ 的凸性。因此，$\mathbf x\mapsto\psi_j(\mathbf w_j^T\mathbf x)+\frac{\rho}{2}(\mathbf w_j^T\mathbf x)^2$ 与 $\mathbf x\mapsto R(\mathbf x)+\frac{\rho}{2}\|\mathbf W\mathbf x\|_2^2$ 也是凸的。由于 $\|\mathbf W\|=1$ 且 $\rho>0$，$\mathbf x\mapsto\frac{\rho}{2}\left(\|\mathbf x\|_2^2-\|\mathbf W\mathbf x\|_2^2\right)$ 是凸的，于是推得 $\mathbf x\mapsto R(\mathbf x)+\frac{\rho}{2}\|\mathbf x\|_2^2$ 是凸的。$\square$

因此，通过强制 $s_{\inf}\le1$，我们可以得到 1-弱凸正则项 $R$。

**注 3.3.** $R$ 的岭分解 (10) 也用于 CRR-NN 框架 [19] 中，该框架学习带有可学习样条势函数 $\psi_j$ 的凸岭正则项 $R$。对 CRR-NN 而言，强制 $s_{\inf}=0$ 以保证 $\psi_j$ 是凸的。相反，本文的 WCRR-NN 模型在 $s_{\inf}\in[0,1]$ 时拥有更大自由度，因而扩展了 [19]。

$R$ 的当前参数化很大程度上受 [19] 启发。但与 [19] 中单一的（非减）样条非线性不同，我们把激活 $\varphi=\psi'$ 分解为两个样条之差：

$$
\varphi=\mu\varphi_+-\varphi_-, \tag{12}
$$

其中 $\mu\in\mathbb R_{\ge0}$ 是可学习参数，$\varphi_+,\varphi_-$ 是可训练的、非减的、非扩张线性样条。尽管理论上等价于使用单个满足 $s_{\inf}\le1$ 的线性样条 $\varphi$，我们发现分解 (12) 对训练更有效。在受约束神经网络中使用样条的理论动机已在 [42] 提出，关于所得网络架构表达能力的讨论可参见 [18]。我们的选择确保满足以下性质：

- $R$ 是 1-弱凸的，这由命题 3.2 推出；
- Lipschitz 常数有界：
$$
\mathrm{Lip}(\nabla R)\le\|\mathbf W\|^2\,\mathrm{Lip}(\varphi)\le\max(\mu,1). \tag{13}
$$

下面给出关于参数化的更多细节。

**可学习线性样条的参数化.** 两个线性样条 $\varphi_+$ 与 $\varphi_-$ 用我们的样条工具箱 [7,16] 以相同方式参数化。后文把二者各自的可学习参数 $\mathbf c_+$ 与 $\mathbf c_-$ 简记为 $\mathbf c$。我们使用 $\varphi_{\mathbf c}:\mathbb R\to\mathbb R$，其节点为 $\tau_m=(m-M/2)\Delta$，$m=0,\dots,M$，其中 $\Delta$ 为间距。为简单起见，假定 $M$ 为偶数。可学习参数 $\mathbf c=(c_m)_{m=0}^M\in\mathbb R^{M+1}$ 定义了 $\varphi_{\mathbf c}$ 在节点处的取值 $\varphi_{\mathbf c}(\tau_m)=c_m$。为完全确定 $\varphi_{\mathbf c}$，在 $(-\infty,\tau_0]$ 上将其延拓为常数 $c_0$，在 $[\tau_M,+\infty)$ 上延拓为 $c_M$。因此，$\varphi_{\mathbf c}$ 的任意原函数 $\psi$ 在 $[\tau_0,\tau_M]$ 上是分段二次的，并带仿射延拓。

**线性样条上的约束.** 为确保 $\varphi_i$ 非减且非扩张，我们沿用 [19] 引入的策略。令 $\mathbf D\in\mathbb R^{M\times(M+1)}$ 为一维有限差分矩阵，$(\mathbf D\mathbf c)_m=(c_{m+1}-c_m)$，$m=1,\dots,M$。由于 $\varphi_{\mathbf c}$ 是分段线性的，有

$$
\varphi_{\mathbf c}\text{ 非减且非扩张}\iff
0\le(\mathbf D\mathbf c)_m\le\Delta,\quad m=1,\dots,M. \tag{14}
$$

为在 $\{\varphi_{\mathbf c}:0\le(\mathbf D\mathbf c)_m\le\Delta,\ m=1,\dots,M\}$ 上优化，我们把线性样条重参数化为 $\varphi_{P_\uparrow(\mathbf c)}$，其中

$$
P_\uparrow(\mathbf c)=\mathbf S\,\mathrm{Clip}_{[0,\Delta]}(\mathbf D\mathbf c)+\mathbf 1^T\mathbf c \tag{15}
$$

是到可行集 (14) 的非线性投影。在 (15) 中，$\mathrm{Clip}_{[0,\Delta]}$ 是逐点裁剪操作，$\mathrm{Clip}_{[0,\Delta]}(t)=\min(\max(0,t),\Delta)$；$\mathbf S$ 表示累加和操作，$(\mathbf S\mathbf d)_{m+1}=\sum_{k=1}^m d_k$，$m=0,\dots,M$，$\mathbf d\in\mathbb R^m$。换言之，$P_\uparrow$ 把 $\mathbf c$ 各元素之间大于 $\Delta$ 或为负的有限差分裁剪到最近的可行值，同时由于附加项 $\mathbf 1^T\mathbf c$ 而保持均值。

此外，我们强制 $\varphi_+$ 与 $\varphi_-$ 为奇函数，这在成像中很自然，因为它导致偶势函数。为在仍满足 (14) 的同时获得该对称性，我们作变量替换 $\mathbf c\to\frac12\left(P_\uparrow(\mathbf c)-\mathrm{reverse}(P_\uparrow(\mathbf c))\right)$，其中 $\mathrm{reverse}$ 翻转 $\mathbf c$ 各元素的顺序。于是所有约束都被嵌入参数化之中，而所学参数 $\mathbf c$ 保持无约束。

**卷积滤波器的参数化.** 可学习卷积层 $\mathbf W$ 要求具有单位范数。因此我们把 $\mathbf W$ 参数化为 $\mathbf W=\mathbf U/\|\mathbf U\|$，其中 $\mathbf U$ 表示与 $\mathbf W$ 维数相同的卷积层。谱范数 $\|\mathbf U\|$ 的计算将在第 3.3 节描述。为高效探索大感受野（另见 [19]），我们把 $\mathbf U$ 分解为三个零填充卷积的复合，其核尺寸为 $(k_s\times k_s)$（$k_s$ 为奇数），输出通道数递增。与 [11] 类似，卷积核被约束为具有零均值。等价的（在边界效应意义下）单卷积层将具有尺寸 $(K_s\times K_s)$ 的核，其中 $K_s=3k_s-2$。

### 3.2 多噪声水平去噪器

到目前为止，我们只引入了一个适用于多种噪声水平的通用 $R$。为得到适用于各种噪声水平 $\sigma$ 的去噪器，一种常见做法是引入可调参数 $\lambda_\sigma$，如

$$
\hat{\mathbf x}=\arg\min_{\mathbf x\in\mathbb R^d}\ 
\frac12\|\mathbf x-\mathbf y\|_2^2+\lambda_\sigma R(\mathbf x). \tag{16}
$$

原则上这导致依赖噪声水平的正则项 $R_\sigma=\lambda_\sigma R$，但事实证明这种对 $\sigma$ 的依赖过于简单，无法在多个噪声水平上都保证良好性能。该设定的另一个局限是 $R_\sigma$ 是 $\lambda_\sigma$-弱凸的。因此，当 $\lambda_\sigma>1$ 时不能保证仍处于 CNC 框架内；而当 $\lambda_\sigma<1$ 时，我们可能没有充分利用 CNC 模型所赋予的全部自由度。因此，我们改为把第 3.1 节引入的参数 $\alpha_i$ 表示为噪声水平的函数：

$$
\alpha_i(\sigma)=e^{s_{\alpha_i}(\sigma)}/(\sigma+\epsilon), \tag{17}
$$

其中取 $\epsilon=1\cdot10^{-5}$ 以防止小 $\sigma$ 时的不稳定。这里 $s_{\alpha_i}$ 是可学习线性样条，其底层参数为 $\mathbf c^i_\alpha$，参数化方式与 $\varphi_\pm$ 类似但不受约束。(17) 中的指数参数化允许在训练时高效探索很大范围，这类方案在学习中相当常见，例如流行的 TNRD 框架 [10]。(17) 中按 $\sigma$ 的缩放，使得在激活之前对噪声分布做了归一化，实践中发现这非常有帮助。最终，依赖噪声水平的轮廓函数 $\psi_i(t,\sigma)=(1/\alpha_i(\sigma))^2\psi(\alpha_i(\sigma)t)$ 满足

$$
\frac{\partial^2\psi_i}{\partial t^2}(t,\sigma)
=\mu\varphi'_+\left(\alpha_i(\sigma)t\right)-\varphi'_-\left(\alpha_i(\sigma)t\right)
\in[-1,+\infty). \tag{18}
$$

**注 3.4.** 命题 3.2 给出的弱凸模数上界不依赖参数 $\alpha_i$。因此，把 $\alpha_i$ 作为可学习参数加入，不会损害对 $R$ 的弱凸性保证。

（原文脚注：在初步研究中我们也尝试过把参数 $\mu$ 学成噪声水平的函数，但并未改善性能；因此 $\mu$ 取为跨噪声水平恒定。）

后文用 $\theta$ 表示可学习参数的汇总集合（详见第 3.3 节），并在需要显式引用参数时使用记号 $R_\theta$。同样，为记号简便，我们用 $R_\theta(\sigma)$ 表示噪声水平 $\sigma$ 处的正则项。这一依赖噪声的正则项 $R_\theta(\sigma)$ 给出邻近去噪器

$$
D_{\theta(\sigma)}(\mathbf y)=\mathrm{prox}_{R_{\theta(\sigma)}}(\mathbf y)
=\arg\min_{\mathbf x\in\mathbb R^d}\ 
\frac12\|\mathbf x-\mathbf y\|_2^2+R_{\theta(\sigma)}(\mathbf x). \tag{19}
$$

一般而言 $D_{\theta(\sigma)}$ 没有闭式表达式，但由于底层目标的凸性与光滑性，$D_{\theta(\sigma)}(\mathbf y)$ 可以用基于梯度的求解器高效计算。实践中我们使用 AGD [41] 并结合 [46] 引入的标准梯度型重启技巧。步长取为 $1/(1+\max(1,\mu))$；由 Lipschitz 界 (13) 可保证收敛到全局极小元。

### 3.3 训练流程

本节详述如何学习参数 $\theta$，使 $D_{\theta(\sigma)}(\mathbf y)$ 在多个噪声水平上都是良好的高斯去噪器。

#### 3.3.1 训练问题

设 $\{\mathbf x^m\}_{m=1}^M$ 是一组干净图像。每幅图像 $\mathbf x^m$ 被污染为 $\mathbf y^m=\mathbf x^m+\sigma^m\mathbf n^m$，其中高斯噪声 $\mathbf n^m\sim\mathcal N(\mathbf 0,\mathbf I)$，噪声水平 $\sigma^m\sim\mathcal U[0,\sigma_{\max}]$。于是定义如下多噪声水平训练问题：

$$
\hat\theta\in\arg\min_\theta\ \sum_{m=1}^M
\mathbb E_{(\mathbf n^m,\sigma^m)}
\left(\left\|D_{\theta(\sigma^m)}(\mathbf y^m)-\mathbf x^m\right\|_1\right). \tag{20}
$$

这里选择 $\ell_1$ 损失，是因为已知它对 CNN 的训练既稳健又性能良好 [56,28]。

#### 3.3.2 优化

为清晰起见，在概述实际优化流程之前，先简要回顾 $\theta$ 中包含的各类参数。

**与轮廓相关的参数.** 线性样条 $\varphi_+$ 与 $\varphi_-$ 通过受约束系数 $\tilde{\mathbf c}_\pm=\frac12\left(P_\uparrow(\mathbf c_\pm)-\mathrm{reverse}(P_\uparrow(\mathbf c_\pm))\right)$ 由 $\mathbf c_+$ 与 $\mathbf c_-$ 参数化，从而它们是奇的、非减的且非扩张的。结合 $\mu>0$，(12) 便给出线性样条激活函数 $\varphi$；其原函数定义了轮廓 $\psi$。参数 $\mathbf c^i_\alpha$ 指定线性样条函数 $\alpha_i(\sigma)$，后者在 (10) 的各通道之间以及各噪声水平之间重新缩放轮廓 $\psi$。

**谱归一化.** 由 $\mathbf W$ 表示的卷积操作参数化为 $\mathbf W=\mathbf U/\|\mathbf U\|$，其中 $\mathbf U$ 由 3 个零填充卷积复合而成。这里 $\|\mathbf U\|$ 的计算如下。

- **训练阶段**：假定循环边界条件而非零填充，我们可以把 $\mathbf U$ 视为单个卷积层。此时 $\mathbf U^T\mathbf U$ 编码了从单通道输入到单通道输出的二维卷积，因此可以用核 $K_{\mathbf U^T\mathbf U}\in\mathbb R^{(2K_s-1)\times(2K_s-1)}$ 表示。在该设定下，$\mathbf U^T\mathbf U$ 的谱可用二维离散傅里叶变换（DFT）[52] 计算为
$$
\mathrm{spec}(\mathbf U^T\mathbf U)=
\left\{
\left|\mathrm{DFT}\left(\mathrm{Pad}_{\sqrt d}(K_{\mathbf U^T\mathbf U})\right)_{k_1k_2}\right|:
1\le k_1,k_2\le\sqrt d
\right\}, \tag{21}
$$
其中 $\mathrm{Pad}_{\sqrt d}$ 把 $K_{\mathbf U^T\mathbf U}$ 零填充为 $(\sqrt d\times\sqrt d)$ 的图像。训练期间我们依赖 (21) 估计 $\|\mathbf U\|\simeq\max(\mathrm{spec}(\mathbf U^T\mathbf U))$，因为它计算高效，且可纳入计算 $\nabla R$ 的计算图中。
- **测试阶段**：随后，在评估训练好的 WCRR-NN 模型时，用幂法（1000 步）以高精度计算真实的 $\|\mathbf U\|$。这一严格的归一化（在数值精度范围内）保证了底层 $R$ 的 1-弱凸性。

**隐式微分.** 学习邻近去噪器带来的挑战是 $D_{\theta(\sigma)}$ 隐式地依赖 $\theta$。如深度平衡（deep equilibrium，DEQ）框架 [4] 所示，可以通过隐式微分计算去噪器关于参数的雅可比矩阵 $J_\theta D_{\theta(\sigma)}$。为此需要两个步骤。

- **图像去噪**：首先，给定含噪输入 $\mathbf y^m$，需要执行前向传播，即计算 $\hat{\mathbf x}=D_{\theta(\sigma^m)}(\mathbf y^m)$。所用 AGD 一直运行到相邻迭代之间范数的相对变化低于 $10^{-4}$。
- **梯度计算**：我们使用 [4] 引入的 DEQ 实现，下面简要讨论其一般思想在我们的设定下的含义。$R$ 的可微性蕴含去噪后的图像满足
$$
\hat{\mathbf x}(\theta)-\mathbf y+\nabla_{\mathbf x}R(\theta,\hat{\mathbf x}(\theta))=\mathbf 0, \tag{22}
$$
其中为清晰起见省去了对 $\sigma$ 的依赖，并显式标出对 $\theta$ 的依赖。对 (22) 应用隐函数定理可得
$$
\left(\mathbf I+\mathbf H_R(\theta,\hat{\mathbf x}(\theta))\right)J_\theta\hat{\mathbf x}(\theta)
=J_\theta(\nabla_{\mathbf x}R)(\theta,\hat{\mathbf x}(\theta)). \tag{23}
$$
因此，我们通过求解一个简单线性系统，来计算与 $(J_\theta D_\theta(\mathbf y))^T=(J_\theta\hat{\mathbf x}(\theta))^T$ 的矩阵–向量乘积（在反向传播算法中计算 (20) 的梯度时需要它们）。这用 [4] 给出的 Anderson 程序完成。虽然推导 $J_\theta(\nabla_{\mathbf x}R)$ 很繁琐、通常交给自动微分，但我们使用显式表达式
$$
\mathbf H_R(\hat{\mathbf x})\mathbf u
=\mathbf W^T\left(\varphi'(\mathbf W\hat{\mathbf x})\odot(\mathbf W\mathbf u)\right), \tag{24}
$$
其中 $\odot$ 是 Hadamard 乘积，分段常数函数 $\varphi'$ 由线性样条 $\varphi$ 的 B 样条表示解析导出。这与自动微分结果相同，但被发现更高效。

**优化.** 非凸训练问题 (20) 用随机 Adam 优化器 [25] 求解；对每个批次我们采样 $\mathbf x^m$、相应噪声水平 $\sigma^m$ 与噪声 $\mathbf n^m$。注意在同一批次内，图像被不同噪声水平污染；同样，在不同 epoch 中，同一 $\mathbf x^m$ 可以施加不同噪声水平。

### 3.4 训练与去噪性能

所提弱凸正则项在第 3.3 节所述高斯去噪任务上学习，其中 $\sigma_{\max}=30/255$。采用与 [8] 相同的过程，从 BSD500 数据集 [2] 的 400 幅图像中构造 238,400 个尺寸为 $(40\times40)$ 的灰度图块，另留 12 幅图像用于验证。根据表 2 与表 3 所报告的消融研究，$\mathbf U$ 中的三个滤波器核取 $k_s=5$，输出通道数分别为 4、8 与 60。线性样条 $\varphi_i$ 有 $M+1=101$ 个等距节点，$\Delta=2\cdot10^{-3}$。我们初始设置 $\mathbf c_+=\mathbf 0$ 且 $(\mathbf c_-)_m=\tau_m$，发现这对帮助训练很重要。直观上，该选择有助于正则项利用弱凸性，而弱凸性只能通过 $\mathbf c_-$ 获得。参数化 $\alpha_i(\sigma)$ 的线性样条在 $[0,\sigma_{\max}]$ 内有 11 个等距节点，并初始化为常数 5。模型用 Adam 优化器训练 6000 步，批大小为 128，在 Tesla V100 GPU 上耗时不到 2 小时。学习率初始设为：$\mu$ 为 $5\cdot10^{-2}$，$\mathbf U$ 与 $\mathbf c^i_\alpha$ 为 $5\cdot10^{-3}$，$\mathbf c_+$ 与 $\mathbf c_-$ 为 $5\cdot10^{-4}$；随后每 500 个批次衰减 0.75。评估时，去噪 (19) 用 AGD 执行，容差取相邻迭代范数相对变化 $10^{-4}$。图 1 给出收敛曲线的一个示例。

我们在 BSD68 测试集上对 WCRR-NN 与若干其他方法做数值评估，见表 1。该任务是**非盲**的，即噪声水平要么直接作为输入使用（如 BM3D），要么通过一个在相应验证集上调好的正则化参数间接使用（如 TV）。第一个重要观察是：实现凸能量的 WCRR-NN 优于流行的 BM3D 去噪器 [13]。据我们所知，这是**第一次有（可学习的）凸模型超越 BM3D**。BM3D 与 (W)CRR-NN 的视觉对比见图 2；表 1 中第 2 与第 6 种方法在同一图像上的结果可在原始论文 [11] 中找到。下面更深入地讨论表 1 中与 WCRR-NN 思想相近的框架。

**表 1：** BSD68 测试集上的去噪性能（PSNR，dB）。

| 类别 | 方法 | $\sigma=5/255$ | $\sigma=15/255$ | $\sigma=25/255$ |
|---|---|---:|---:|---:|
| Convex | TV$^{1,2,3}$ [50] | 36.41 | 29.90 | 27.48 |
| Convex | Higher-order MRFs convex$^{1,2,3}$ [11] | – | 30.45 | 28.04 |
| Convex | CRR-NN$^{1,2,3}$ [19] | 36.96 | 30.55 | 28.11 |
| Provably CNC | TV CNC$^{1,2}$ | 36.53 | 29.92 | 27.49 |
| Provably CNC | WCRR-NN$^{1,2}$ | 37.68 | 31.22 | 28.69 |
| Approx. CNC | Prox-DRUNet | 37.98 | 31.70 | 29.18 |
| Others | Higher-order MRFs$^1$ [11] | – | 31.22 | 28.70 |
| Others | BM3D [13] | 37.54 | 31.11 | 28.60 |

表 1 脚注：¹ 基于岭的正则项；² 凸泛函的最小化；³ 凸正则项。

**表 2：** WCRR-NN：BSD68 上 PSNR 随滤波器数量的变化。

| $N_c$ | 10 | 20 | 40 | 60 | 80 |
|---|---:|---:|---:|---:|---:|
| $\sigma=5/255$ | 37.43 | 37.59 | 37.63 | 37.66 | 37.66 |
| $\sigma=15/255$ | 30.85 | 31.15 | 31.19 | 31.21 | 31.20 |
| $\sigma=25/255$ | 28.16 | 28.62 | 28.67 | 28.68 | 28.69 |

**表 3：** WCRR-NN：BSD68 上 PSNR 随核尺寸的变化。

| $k_s$ | 3 | 5 | 7 |
|---|---:|---:|---:|
| $K_s$ | 5 | 13 | 19 |
| $\sigma=5/255$ | 37.64 | 37.66 | 37.65 |
| $\sigma=15/255$ | 31.14 | 31.21 | 31.21 |
| $\sigma=25/255$ | 28.56 | 28.68 | 28.68 |

**图 1：** 使用 WCRR-NN 与 AGD 去噪的收敛曲线示例。三个面板分别给出目标值相对变化 $(\mathcal J(\mathbf x_k))/\mathcal J(\mathbf x_0)$、PSNR 以及 $(\mathbf x_k)/(\mathbf x_0)$ 随迭代 $k$ 的变化（对数纵轴，$k$ 至 60）。

**CNC 型全变差.** WCRR-NN 模型受到早期工作的启发，这些工作用非凸势函数把 TV 去噪推广到 CNC 框架 [57,51]。公开实现对于特定类别的图像（通常是具有锐利边缘的卡通类图像）优于 TV；然而我们在 BSD68 的自然图像去噪中未观察到任何显著改进。因此在比较中，我们使用自己版本的 CNC-TV：它通过训练 WCRR-NN 并固定两个滤波器（即水平与竖直有限差分）得到，对应于带学习轮廓的各向异性 TV 去噪——即标准各向异性 TV 去噪模型的 CNC 对应物。如表 1 所报告，这只比 TV 带来边际改进。

**专家场与高阶 MRF.** FoE 途径对应于学习与形如 (10) 的正则项相关联的滤波器，其轮廓函数由人工选取 [49]。它在 [11] 中得到了成功应用，并同时使用了凸与非凸轮廓。与 WCRR-NN 的关键差别在于理论保证：[49,11] 中的非凸轮廓不受约束，因此目标函数无法证明是凸的；这意味着优化较为精细，无法保证收敛到全局最优。有趣的是，WCRR-NN 在最小化凸能量的同时提供了与 [11] 相同的性能。

**CRR-NN.** 我们的工作扩展了 CRR-NN [19] 学到的凸正则项。用弱凸性替代凸性带来了显著差别：对所有噪声水平至少提升 0.6 dB（见表 1）。与更简单的双滤波器 TV 设定相比，这种改进相当可观，说明必须学习足够多的滤波器，才能充分利用弱凸性所提供的额外自由度。

**图 2：** BSD68 测试集中 “castle” 图像在噪声水平 $\sigma=25$ 下的去噪结果（指标为 PSNR）。从左到右依次为：原图、含噪图（Corrupted）、CRR-NN（28.68 dB）、BM3D（29.55 dB）、WCRR-NN（29.56 dB）。

**梯度步去噪器.** 命题 2.3 允许通过学习邻近算子来（隐式地）构造非凸正则项 $R$。[24] 利用了该结果：把 $\mathrm{prox}_R=\nabla\psi$ 通过势函数 $\psi=\frac12\|\cdot\|^2+g$ 参数化，其中 $\nabla g$ 必须是压缩的。为借助深度学习的能力，作者取 $g=\frac12\|\cdot-\mathrm{DRUNet}(\cdot)\|_2^2$，其中 DRUNet [55] 是一个约 1700 万参数的深度 CNN。由于目前没有高效方法能全局界定深度 CNN 梯度的 Lipschitz 常数，他们改为在训练期间在有限多个位置上对 $\nabla g$ 的雅可比矩阵范数做正则化。由此得到 Prox-DRUNet 去噪器，其实践表现很好（见表 1）。

（原文脚注：[24] 给出的 Prox-DRUNet 是在彩色图像上训练的。对灰度去噪，我们把图像送入全部三个颜色通道并对输出取平均，并调节去噪强度参数 $\sigma$ 以优化性能。如预期，所得指标对 $\sigma=25$ 与 DnCNN 相当、对 $\sigma=5$ 与 [23] 中的梯度步去噪器相当，说明该用法是恰当的。）

注意 Prox-DRUNet 只是**近似**满足成为真正 CNC 方法的条件，因为对某些 $\mathbf x$，$\|\mathbf H_g(\mathbf x)\|$ 可能大于 1，即 $\nabla g$ 不是压缩的（[24] 已报告这一点）。在含噪 BSD68 图像上我们发现，$\|\mathbf H_g\|$ 可以大到 1.07（$\sigma=5$）、1.08（$\sigma=15$）、1.18（$\sigma=25$）；在一组 68 幅随机图像上（像素独立同分布均匀分布于 $[0,1]$），可以大到 1.69（$\sigma=5$）、1.20（$\sigma=15$）、1.43（$\sigma=25$）。（原文脚注：我们用精确的幂法（300 次迭代）计算 $\|\mathbf H_g\|$。）

总体而言，我们认为 WCRR-NN 与 Prox-DRUNet 提供了非常互补的视角。事实上，Prox-DRUNet 的良好性能表明，可证明的 CNC 方法甚至可能还有进一步提升的空间。

### 3.5 作为稀疏先验的解释

为我们的 WCRR-NN 学到的滤波器与轮廓函数分别见图 3 与图 5。

**滤波器.** $\mathbf W$ 中滤波器的冲激响应呈现出类似小波与 Gabor 滤波器的模式：它们具有各种调制、方向与尺度。此外，与卷积 $\mathbf W^T\mathbf W$ 对应的核 $K$ 非常接近二维离散 Kronecker 冲激，意味着 $\mathbf W$ 几乎是 Parseval 框架（$\mathbf W^T\mathbf W\simeq\mathbf I$）。然而一个关键差别是 $K$ 为零均值。我们还观察到，相较 CRR-NN 的凸设定，需要更多滤波器才能达到最大性能；回报是滤波器如今能够捕捉更复杂的模式。

**轮廓函数.** 学到的轮廓 $\psi_i$ 在各滤波器之间共享，然后由 $\alpha_i$ 分别重缩放，因此各 $\psi_i$ 形状相同，这里只讨论它们的原型 $\psi$。后者收敛到拟凸函数（即下水平集为区间），即使我们并未显式施加该约束。此外，$\psi$ 充分利用了正则项 $R$ 的 1-弱凸性，即 $\min_t\psi''(t)=-1$。因此这是一个**激活约束**，因为 $R$ 默认不会满足它。总体而言，$\psi$ 与极小极大凹罚函数 [30] 非常相似。（原文脚注：在我们的无偏置设定中，$\varphi$ 在原点处有最大斜率，可以证明 $\mathrm{Lip}(\mathbf W^T\varphi(\mathbf W\cdot))=\|\varphi'\|_\infty$。）

为扩展模型，我们还试验了为每个滤波器学习不同的 $\psi_i$。这导致轮廓的可解释性变差（不一定拟凸，且带有一些振荡），而性能只带来可忽略的提升：在噪声水平 $\sigma\in\{5/255,15/255,25/255\}$ 的去噪实验中不足 0.05 dB。

**依赖噪声的缩放.** $R$ 中唯一依赖噪声水平 $\sigma$ 的部分是轮廓 $\psi_i$，它们通过 $\alpha_i(\sigma)$ 依赖 $\sigma$。如图 4 所示，$1/\alpha_i$ 平均而言是 $\sigma$ 的线性函数。粗略地说，多数轮廓大致具有形式 $\psi_i(t,\sigma)\simeq\sigma^2\psi(t/\sigma)$。为验证 $R$ 对 $\sigma$ 的这种简单依赖是否足够，我们训练了 3 个 WCRR-NN 分别在单一噪声水平（$\sigma\in\{5/255,15/255,25/255\}$）去噪；由于这些模型在 BSD68 上并未超过多噪声水平的 WCRR-NN，轮廓的简单重缩放看来已经足够。

**信号处理视角.** 正则项 $R$ 被训练来促进自然图像。因此相应的梯度下降步 $\mathbf x\mapsto\mathbf x-\nabla R(\mathbf x)/\mathrm{Lip}(\nabla R)=\mathbf x-\mathbf W^T\varphi(\mathbf W\mathbf x)/\|\varphi'\|_\infty$——它应当提升图像的规则性——被期望移除自然图像中被视为噪声的特征。反过来，我们期望 $\mathbf x\mapsto\mathbf W^T\varphi(\mathbf W\mathbf x)/\|\varphi'\|_\infty$ 能提取出某种噪声。由于其形状（见图 5），函数 $\varphi/\|\varphi'\|_\infty$ 保留对滤波器的小响应 $\mathbf W\mathbf x$（对小输入几乎为恒等），而截断大响应（对大输入几乎为零函数）。于是，估计噪声 $\mathbf W^T\varphi(\mathbf W\mathbf x)/\|\varphi'\|_\infty$ 的重建，本质上就是移除 $\mathbf x$ 中与各核显著相关的成分。这比 CRR-NN 凸正则化框架中学到的单调裁剪函数[19, Figs. 5 and 6] 能更高效地提取噪声。单调裁剪虽然也保留小输入，但由于底层势的凸性带来的单调性约束，无法完全移除大响应。

除上述视角外，我们还可以与类小波或类框架小波（framelet）去噪建立联系 [14,29,9,6,47]。事实上，由于 $\mathbf W^T\mathbf W\simeq\mathbf I$，梯度下降步可近似为 $\mathbf x\mapsto\mathbf x-\mathbf W^T\varphi(\mathbf W\mathbf x)/\|\varphi'\|_\infty\simeq\mathbf W^T\phi(\mathbf W\mathbf x)$，其中 $\phi=\mathrm{Id}-\varphi/\|\varphi'\|_\infty$。由于 $\phi$ 在原点附近为零、在输入足够大时又是恒等，它定性地介于软阈值与硬阈值函数之间——后者多年来一直是小波与框架小波去噪的关键组成部分。最后注意，框架小波去噪模型本身与邻近算子密切相关 [21]。

**图 3：** 学到的 WCRR-NN 中各滤波器的冲激响应（64 个 $5\times5$ 核的灰度图）。

**图 4：** $1/\alpha(\sigma)$ 对 $\sigma$ 的曲线，其中 $\alpha(\sigma)=\sum_{i=1}^{N_C}\alpha_i(\sigma)$ 编码了跨通道的平均行为；横轴 $\sigma\in[0,30]$，纵轴约 0.0–0.2。

**图 5：** 学到的 WCRR-NN 的势函数 $\psi$（上）与激活函数 $\varphi=\psi'$（下）。二者分别为 2 次与 1 次样条；竖线标记为样条的控制点。横轴范围约 $[-0.1,0.1]$，势函数纵轴约 $[-0.001,0.006]$，激活函数纵轴约 $[-0.1,0.1]$。

## 4. 推广到一般逆问题

现在我们用第 3 节训练好的正则项 $R_{\theta(\sigma)}$，基于变分表述 (2) 求解逆问题。这里的关键挑战是目标函数可能非凸，这使我们无法全局地最小化 (2)。不过，寻找临界点仍是可能的。这些临界点依然特别有意义，尤其是因为该正则项结构简单，其能量景观几乎是凸的。

**邻近方法与梯度方法.** 标准的 PnP 框架依赖带显式去噪步的邻近方法。其动机在于：去噪步通常计算高效，而正则项（若存在）与其梯度都不显式已知。相反，在我们的设定中，评估正则项及其梯度非常高效，因此适用于一般非凸问题的 AGD 方法 [41,17] 更为合适。在我们的设定下，AGD 还被认为在一阶方法中达到最优收敛速率。下面回顾 AGD 的主要特征，并说明如何利用目标函数的弱凸模数这一知识。

### 4.1 加速梯度下降

为求解逆问题，我们最小化正则化目标

$$
\mathcal J(\mathbf x)=\frac12\|\mathbf H\mathbf x-\mathbf y\|_2^2+\lambda R_{\theta(\sigma)}(\mathbf x), \tag{25}
$$

其中 $R_{\theta(\sigma)}$ 是第 3.4 节的 1-弱凸正则项，$\lambda>0$ 是正则化参数。由于目标可微，我们可以依赖基于梯度的方法寻找 $\mathcal J$ 的临界点，作为邻近算法的一种便捷替代。为减少重建时间，我们在算法 1 中提出一个 AGD 变体，它针对具有 $L$-Lipschitz 连续梯度的 $\lambda$-弱凸泛函 $\mathcal J$ 量身定制。

**算法 1　面向 $\lambda$-弱凸、$L$-Lipschitz 梯度 $\mathcal J$ 的带防护 AGD**

输入：初始化 $\mathbf x_0\in\mathbb R^d$，容差 $\epsilon>0$，$a>1$

置 $t_0=t_1=1$，$k=1$，$\mathbf z_0=\mathbf x_0$，$\mathbf x_1=\mathbf x_0$

**while** $\|\mathbf x_k-\mathbf x_{k-1}\|/\|\mathbf x_{k-1}\|>\epsilon$ 或 $k=1$ **do**

1. 　$\mathbf z_k=\mathbf x_k+\frac{t_{k-1}-1}{t_k}(\mathbf x_k-\mathbf x_{k-1})$
2. 　$\mathrm{crit}=\nabla\mathcal J(\mathbf z_k)^T(\mathbf z_k-\mathbf z_{k-1})+\frac{a\lambda}{2}\|\mathbf z_k-\mathbf z_{k-1}\|^2$
3. 　**if** $\mathrm{crit}>0$ **then**
4. 　　$\mathbf z_k=\mathbf x_k$
5. 　　$t_k=1$
6. 　$\mathbf x_{k+1}=\mathbf z_k-\frac{1}{L}\nabla\mathcal J(\mathbf z_k)$
7. 　$t_{k+1}=\frac{1+\sqrt{1+4t_k^2}}{2}$
8. 　$k\leftarrow k+1$

输出：近似解 $\mathbf x_k$

由 (13) 可推出 $\nabla\mathcal J$ 是 $L$-Lipschitz 连续的，其中 $L\le\|\mathbf H\|^2+\lambda\max(\mu,1)$，由此对 $\mathbf x_1,\mathbf x_2\in\mathbb R^d$ 得到标准上界估计

$$
\mathcal J(\mathbf x_1)\le\mathcal J(\mathbf x_2)
+\nabla\mathcal J(\mathbf x_2)^T(\mathbf x_1-\mathbf x_2)
+\frac{L}{2}\|\mathbf x_1-\mathbf x_2\|^2. \tag{26}
$$

由于 $R_{\theta(\sigma)}$ 是 1-弱凸的，$\mathcal J$ 是 $\lambda$-弱凸的。因此，凸函数的次梯度不等式给出对 $\mathbf x_1,\mathbf x_2\in\mathbb R^d$ 的下界估计

$$
\mathcal J(\mathbf x_1)\ge\mathcal J(\mathbf x_2)
+\nabla\mathcal J(\mathbf x_2)^T(\mathbf x_1-\mathbf x_2)
-\frac{\lambda}{2}\|\mathbf x_1-\mathbf x_2\|^2. \tag{27}
$$

给定某个初始化 $\mathbf x_0=\mathbf x_{-1}=\mathbf z_0\in\mathbb R^d$ 以及一列 Nesterov 动量参数 $\{\beta_k\}_{k\in\mathbb N}\subset[0,1]$，标准 AGD [41] 的更新步为

$$
\mathbf z_k=\mathbf x_k+\beta_k(\mathbf x_k-\mathbf x_{k-1}), \tag{28}
$$

$$
\mathbf x_{k+1}=\mathbf z_k-\frac{1}{L}\nabla\mathcal J(\mathbf z_k). \tag{29}
$$

(29) 与 (26) 结合给出下降估计

$$
\mathcal J(\mathbf x_{k+1})-\mathcal J(\mathbf z_k)
\le-\frac{L}{2}\|\mathbf x_{k+1}-\mathbf z_k\|^2. \tag{30}
$$

然而，更新 (28) 并不一定保证 $\{\mathcal J(\mathbf z_k)\}_{k\in\mathbb N}$ 下降。因此，对事先规定的 $a>1$，我们提出在试探性地执行 (28) 之后检查条件

$$
\nabla\mathcal J(\mathbf z_k)^T(\mathbf z_k-\mathbf z_{k-1})
+\frac{a\lambda}{2}\|\mathbf z_k-\mathbf z_{k-1}\|^2\le0. \tag{31}
$$

若 (31) 被违反，则改为执行普通梯度更新 $\mathbf z_k=\mathbf x_k$（替代 (28)），并施加重启技巧，如 [46] 所提出。此情形下，由上一步的 (30) 可得

$$
\mathcal J(\mathbf z_k)-\mathcal J(\mathbf z_{k-1})
\le-\frac{L}{2}\|\mathbf z_k-\mathbf z_{k-1}\|^2. \tag{32}
$$

否则，代入 (27) 蕴含

$$
\begin{aligned}
\mathcal J(\mathbf z_k)-\mathcal J(\mathbf z_{k-1})
&\le\nabla\mathcal J(\mathbf z_k)^T(\mathbf z_k-\mathbf z_{k-1})
+\frac{\lambda}{2}\|\mathbf z_k-\mathbf z_{k-1}\|^2\\
&\le-\frac{(a-1)\lambda}{2}\|\mathbf z_k-\mathbf z_{k-1}\|^2.
\end{aligned} \tag{33}
$$

总之，只有当加速步带来目标的充分下降时才保留它们；否则，普通梯度下降步保证这种下降。

**注 4.1.** 基于梯度的条件 (31) 比基于目标的条件 (32) 更严格；然而 (31) 的计算代价更低，因为它只涉及已计算量的内积。实践中我们观察到 (31) 很少被违反。

**注 4.2.** 为保证收敛，(31) 中的参数 $a$ 必须大于 $R_\theta$ 的弱凸模数。此时，对该模数的精确估计——我们已知它在本文设定下以 1 为界——会放宽条件 (31)，通常带来更快的收敛。相反，依赖宽松的界会导致频繁重启，从而损害加速效果。

关于算法 1，我们下面利用 [45, Theorem 3.7] 导出收敛性结果（定理 4.3），该定理本身把开创性工作 [3] 推广到惯性设定。注意目标 (25) 是半代数的，因为轮廓函数 $\psi$ 是分段多项式的；因此它满足所需的（相当技术性的）KL 性质，另见 [3]。

**定理 4.3.** 假设 $\mathcal J$ 满足 KL 性质且有下界。若由算法 1（不含停止准则）生成的序列 $(\mathbf z_k)_{k\in\mathbb N}$ 有界，则它收敛到 $\mathcal J$ 的一个临界点 $\hat{\mathbf z}$。此外，序列 $(\mathbf z_k)_{k\in\mathbb N}$ 具有有限长度，即

$$
\sum_k\|\mathbf z_{k+1}-\mathbf z_k\|<\infty. \tag{34}
$$

**证明.** 依照 [45, Theorem 3.7]，需要检验

（H1）存在 $a>0$，使得对一切 $k\in\mathbb N$ 有 $\mathcal J(\mathbf z_k)+a\|\mathbf z_k-\mathbf z_{k-1}\|^2\le\mathcal J(\mathbf z_{k-1})$；

（H2）存在 $b>0$，使得对一切 $k\in\mathbb N$ 有 $\|\nabla\mathcal J(\mathbf z_k)\|\le2b\left(\|\mathbf z_k-\mathbf z_{k-1}\|+\|\mathbf z_{k+1}-\mathbf z_k\|\right)$；

（H3）存在子列 $(\mathbf z_{k_j})_{j\in\mathbb N}$，使得 $\mathbf z_{k_j}\to\mathbf z$ 且 $\mathcal J(\mathbf z_{k_j})\to\mathcal J(\mathbf z)$。

为断定迭代序列 $(\mathbf z_k)_{k\in\mathbb N}$ 满足 (34) 并收敛到 $\mathcal J$ 的临界点 $\hat{\mathbf z}$，需要这三个条件。我们已在 (32) 与 (33) 中验证了（H1）。对（H2），先注意若 (31) 被违反，则直接有

$$
\|\nabla\mathcal J(\mathbf z_k)\|=L\|\mathbf z_{k+1}-\mathbf z_k\|. \tag{35}
$$

否则，$\|\nabla\mathcal J(\mathbf z_k)\|=L\|\mathbf x_{k+1}-\mathbf z_k\|$，从而推出

$$
\begin{aligned}
\|\nabla\mathcal J(\mathbf z_k)\|
&\le L\|\mathbf z_{k+1}-\mathbf z_k\|+\beta_kL\|\mathbf x_{k+1}-\mathbf x_k\|\\
&\le L\|\mathbf z_{k+1}-\mathbf z_k\|
+L\left\|\mathbf z_k-\frac{1}{L}\nabla\mathcal J(\mathbf z_k)-\mathbf z_{k-1}+\frac{1}{L}\nabla\mathcal J(\mathbf z_{k-1})\right\|\\
&\le L\|\mathbf z_{k+1}-\mathbf z_k\|+2L\|\mathbf z_k-\mathbf z_{k-1}\|.
\end{aligned} \tag{36}
$$

由于我们假定序列 $(\mathbf z_k)_{k\in\mathbb N}$ 有界且 $\mathcal J$ 连续，（H3）也成立，结论由 [45, Theorem 3.7] 推出。$\square$

**注 4.4.** 为确保 $(\mathbf z_k)_{k\in\mathbb N}$ 保持有界，只需给 $\mathcal J$ 加上正则项 $\kappa\|\mathbf x\|^2$，其中 $\kappa>0$ 可任意小。此时由于轮廓 $\psi$ 具有线性延拓（见引理 4.5），$\mathcal J$ 变为强制的；因此 $(\mathbf z_k)_{k\in\mathbb N}$ 必须有界，否则 $(\mathcal J(\mathbf z_k))_{k\in\mathbb N}$ 不可能下降（见 (32)）。不过经验上，我们发现在所有探索过的设定中迭代都保持有界，因此这一“技巧”并无必要。

**引理 4.5.** 设 $R$ 为形如 (10) 的岭正则项，其中轮廓 $\psi_j$ 连续、为偶函数且具有仿射延拓。则

$$
\mathbf x\mapsto\|\mathbf H\mathbf x-\mathbf y\|_2^2+R(\mathbf x)+\kappa\|\mathbf x\|_2^2 \tag{37}
$$

对任意 $\kappa>0$ 都是强制的。（原文脚注：仿射延拓指存在 $t_0\in\mathbb R$，使 $\psi_j$ 在 $(-\infty,-t_0]$ 与 $[t_0,+\infty)$ 上均为仿射。）

**证明.** 按假设，所有 $\psi_j$ 在 $[t_0,+\infty)$ 上为仿射，斜率为 $u_j\in\mathbb R$。因此对 $|t|>t_0$ 有 $\psi_j(t)=\psi_j(|t|)=u_j(|t|-t_0)+\psi_j(t_0)$。接着定义 $v_j=\min_{|t|\le t_0}\left(\psi_j(t)-u_j(|t|-t_0)\right)\le\psi_j(t_0)$，它因 $\psi_j$ 连续而良定义。按 $v_j$ 的定义，对任意 $t\in\mathbb R$ 有 $\psi_j(t)\ge u_j(|t|-t_0)+v_j$，于是 (37) 中的目标被下界为

$$
\mathbf x\mapsto\|\mathbf H\mathbf x-\mathbf y\|_2^2+\kappa\|\mathbf x\|_2^2
+\sum_{j=1}^{d\times N_C}u_j\left(|\mathbf w_j^T\mathbf x|-t_0\right)+v_j, \tag{38}
$$

而它对任意 $\kappa>0$ 都是强制的。$\square$

**注 4.6.** 当 $\sqrt{\lambda_{\min}(\mathbf H^T\mathbf H)}\ge\lambda$ 时，目标 (25) 是 $\left(\sqrt{\lambda_{\min}(\mathbf H^T\mathbf H)}-\lambda\right)$-强凸的，从而是凸的。此时可保证算法 1 收敛到目标的全局极小。否则，一些关于收敛到局部极小的结果开始起作用，包括带速率的结果 [3,44]。

> **原文疑点：** 注 4.6 中的强凸模数按原文写作 $\sqrt{\lambda_{\min}(\mathbf H^T\mathbf H)}-\lambda$。按标准论证，$\tfrac12\|\mathbf H\mathbf x-\mathbf y\|_2^2$ 的强凸模数为 $\lambda_{\min}(\mathbf H^T\mathbf H)$（而非其平方根），故该表述可能为笔误。本译按原文照录，未作改动，供读者核对。

由于问题可能非凸，算法的初始化可能影响最终重建。然而在我们的实验设定中并未观察到这种依赖，因此我们采用常见的**零初始化**。更精细的策略可以取某个可信的凸变分模型（如 [19]）的重建作为初始配置，再用算法 1 精化重建。

### 4.2 实验

第 3 节在 BSD500 数据集上训练用于去噪的 WCRR-NN 模型，现在被部署用带防护 AGD 求解两个图像重建问题。对每个设定，$\lambda$ 与 $\sigma$ 都在验证集上调节，以按 [19] 的由粗到细流程最大化峰值信噪比（PSNR），随后用于评估。

**MRI.** 真值由 fastMRI 数据集 [26] 中尺寸为 $(320\times320)$ 的全采样膝关节图像构成；相应的 MRI 测量是二维傅里叶变换（$k$ 空间）的子采样版本。该子采样用带两个参数的笛卡尔掩膜完成：加速因子 $M_{\rm acc}=4$ 与中心占比 $M_{\rm cf}=0.08$。$k$ 空间中心（低频）的全部 $\lfloor320M_{\rm cf}\rfloor$ 列被完整保留，而 $k$ 空间其余区域的列被均匀采样；更准确地说，最终留下 $\lfloor320/M_{\rm acc}\rfloor$ 个被选中的列。最后，测量的实部与虚部都被标准差 $\sigma_n=10^{-4}$ 的高斯噪声污染。验证与测试分别取 10 幅与 99 幅图像，全部归一化到最大值为 1。

**CT.** 为与对抗正则化（adversarial regularization，AR）[35] 及其凸对应物 ACR [38] 比较（详见第 4.2.1 节），我们采用 [38] 提出的稀疏视角 CT 实验。其数据由 10 名患者的腹部 CT 扫描构成，作为低剂量 CT 大挑战（low-dose CT Grand Challenge）[37] 的一部分公开可得。验证时，从 [38] 所用训练集的第一个患者中均匀取 6 幅图像。为对所有方法做基准测试，我们使用与 [38] 相同的集合，即来自单名患者的 128 层、尺寸为 $(512\times512)$ 的切片，全部归一化到最大值为 1。CT 测量用平行束采集几何模拟，含 200 个角度与 400 个探测器。这些测量被标准差 $\sigma_n=2.0$ 的高斯噪声污染。

**表 4：** MRI 与 CT 重建实验的 PSNR 与 SSIM 值。

（a）MRI

| 指标 | PSNR | SSIM |
|---|---:|---:|
| Zero-fill | 27.92 | 0.711 |
| TV [5] | 32.03 | 0.7922 |
| CRR-NN [19] | 33.14 | 0.842 |
| WCRR-NN | 34.55 | 0.858 |
| Prox-DRUNet [24] | 35.09 | 0.864 |

（b）CT

| 指标 | PSNR | SSIM | 参数量 |
|---|---:|---:|---:|
| TV | 31.57 | 0.852 | 1 |
| ACR [38] | 32.17 | 0.868 | $6\cdot10^5$ |
| CRR-NN | 32.87 | 0.862 | $5\cdot10^3$ |
| AR [35] | 33.62 | 0.875 | $2\cdot10^7$ |
| WCRR-NN | 34.06 | 0.895 | $1\cdot10^4$ |
| Prox-DRUNet | 34.20 | 0.901 | $2\cdot10^7$ |

#### 4.2.1 比较与讨论

测试集上的 PSNR 与结构相似性指数（SSIM）值连同参数数量一起报告在表 4 中。各方法的超参数都用 [19] 描述的由粗到细方法、在验证集上最大化平均 PSNR 来调节。我们观察到 WCRR-NN 优于其他基于能量的方法，并接近 PnP 途径。两种问题的重建结果分别见图 6 与图 7，SAGD 的收敛曲线示例见图 8 与图 9。

总体而言，这些结果说明了我们方法的普适性与高效性。下面简要评述评估中使用的对比方法。

**凸模型.** TV 与 CRR-NN 的重建作为凸方法的参照，它们用带非负约束的 FISTA 算法 [5] 计算。与去噪类似，我们看到从凸正则化转向弱凸正则化会显著提升质量。在 MRI 实验中，CRR-NN（以及更严重的 TV）引入的混叠伪影被弱凸正则项抑制。在 CT 实验中，TV 重建包含阶梯伪影，而 CRR-NN 有轻微的边缘模糊倾向；相反，我们的弱凸正则项能产生不模糊的锐利边缘，但有时以过度平滑某些背景细节为代价。注意凸模型在理论上仍被理解得更好，因为可以保证收敛到全局最优；因此在某些设定中它们可能更可取。

**对抗正则化.** 作为显式正则化途径的参照，我们与凸 ACR [38,40] 框架及其非凸对应物 AR [35] 比较。这些模型绕开基于梯度的参数化，直接参数化正则项 $R$ 并以对抗方式训练。由于 [38,40,35] 的正则项针对特定逆问题量身定制，我们只能在其 CT 实验上作比较。尽管 ACR 与 AR 的参数显著多于 (W)CRR-NN，其表现却更差。这些数值结果为 WCRR-NN 所用参数化的有效性提供了有利证据；不过需要注意，仅就参数化下结论是微妙的，因为 AR 与 ACR 依赖不同的训练流程。

**即插即用.** 我们的方法与 PnP 方法有相似之处，因为 $R$ 是在通用去噪任务上学习的。因此，把 WCRR-NN 与该方法的深度 CNN 版本比较是很自然的。在无数变体中，近期提出的框架 [24]（我们称为 Prox-DRUNet）在理论保证与底层正则项的存在性方面与本文最接近（讨论见第 3.4 节）。我们在 PnP-PGD（近端梯度下降）中使用 [24] 预训练的基于 DRUNet 的邻近去噪器求解 CT，在 PnP-DRS（Douglas–Rachford 分裂）中用于 MRI。（原文脚注：当数据项的邻近算子可以高效计算时，PnP-DRS 很适用；这包括 MRI 但不包括 CT。）该途径可视为能量相关 PnP 中的最先进水平，其 PSNR 与 SSIM 略高于我们的方法。注意 Prox-DRUNet 涉及多 3 个数量级的参数以及数天的训练时间。

在 MRI 实验中，Prox-DRUNet 与 WCRR-NN 都能避免依赖凸正则项的方法通常产生的混叠伪影。在 CT 实验中，对重建的目视检查表明，质量指标只是事情的一部分。Prox-DRUNet 的输出虽然总是看起来非常逼真，却更容易出现幻觉/伪影夸大，尤其在 CT 实验这类困难问题上。在这方面，图 7 中 Prox-DRUNet 的重建尤其说明问题：它包含一个细长结构，既不存在于真值中，也不存在于任何其他重建中。虽然这种“增强”图像在许多场景中是可取的，并带来最先进的去噪性能，但它们在医学成像等敏感应用中引发重大担忧。就 PnP-PGD 的理论收敛保证而言，必要的 Lipschitz 约束只在训练期间通过正则化施加；训练后无法验证它是否满足。实际上，它似乎并未被完全满足 [24]。

**图 6：** MRI 实验的重建结果（指标为 PSNR 与 SSIM）。从左到右依次为：真值（Ground-truth）、Zero-fill（25.05 dB，0.642）、TV（29.86 dB，0.802）、CRR（31.68 dB，0.861）、WCRR（34.43 dB，0.899）、Prox-DRUNet（34.52 dB，0.889）。

**图 7：** CT 实验的重建结果（指标为 PSNR 与 SSIM）。从左到右依次为：体模（Phantom）、TV（31.66 dB，0.853）、CRR（33.21 dB，0.868）、WCRR（34.50 dB，0.899）、Prox-DRUNet（34.65 dB，0.904）。

**图 8：** 收敛曲线示例（MRI）。三个面板给出目标值相对变化、PSNR 与迭代相对变化随迭代 $k$（至约 500）的变化。

**图 9：** 收敛曲线示例（CT）。三个面板给出目标值相对变化、PSNR 与迭代相对变化随迭代 $k$（至约 400）的变化。

## 5. 结论

本文提出了一种学习方法，用于学习 1-弱凸正则项，从而得到凸的去噪泛函。据我们所知，这是**凸–非凸方案中第一个在自然图像去噪上超越 BM3D 的实例**。我们方法的一个关键特征是：用于参数化正则项的架构是浅层的，因此每个参数的作用都是透明的——参数被调整为产生促进稀疏的先验。虽然用所学正则项对逆问题做正则化并不必然导致凸目标，但基于梯度的优化方法在经验上有效，并能产生高质量的重建。未来，对 WCRR-NN 的更好理解可能有助于进一步提升轻量、稳健的数据驱动图像重建模型的性能。这包括所学正则项对训练时所用成像模态和/或图像域的依赖；例如，可以预期，用模态特定的先验知识对正则项做微调将改善重建质量。

## 致谢

导致本发表的研究由欧盟“地平线 2020”（H2020）框架下的欧洲研究理事会（ERC）资助（资助协议项目号 101020573 FunLearn），并获瑞士国家科学基金资助（Grant 200020 184646/1）。作者感谢 Pakshal Bohra 与 Stanislas Ducotterd 的有益讨论，最后还要感谢匿名审稿人的宝贵意见。

## 参考文献（英文原条目，按原文顺序）

[1] J. Abe, M. Yamagishi, and I. Yamada. Linearly involved generalized Moreau enhanced models and their proximal splitting algorithm under overall convexity condition. *Inverse Problems*, 36(3):035012, 2020.

[2] P. Arbeláez, M. Maire, C. Fowlkes, and J. Malik. Contour detection and hierarchical image segmentation. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 33(5):898–916, 2011.

[3] H. Attouch, J. Bolte, and B. F. Svaiter. Convergence of descent methods for semi-algebraic and tame problems: Proximal algorithms, forward-backward splitting, and regularized Gauss-Seidel methods. *Mathematical Programming*, 137:91–129, 2013.

[4] S. Bai, J. Z. Kolter, and V. Koltun. Deep equilibrium models. In *Advances in Neural Information Processing Systems*, volume 32, 2019.

[5] A. Beck and M. Teboulle. A fast iterative shrinkage-thresholding algorithm for linear inverse problems. *SIAM Journal on Imaging Sciences*, 2(1):183–202, 2009.

[6] T. Blu and F. Luisier. The sure-let approach to image denoising. *IEEE Transactions on Image Processing*, 16(11):2778–2786, 2007.

[7] P. Bohra, J. Campos, H. Gupta, S. Aziznejad, and M. Unser. Learning activation functions in deep (spline) neural networks. *IEEE Open Journal of Signal Processing*, 1:295–309, 2020.

[8] P. Bohra, D. Perdios, A. Goujon, S. Emery, and M. Unser. Learning Lipschitz-controlled activation functions in neural networks for Plug-and-Play image reconstruction methods. In *NeurIPS 2021 Workshop on Deep Learning and Inverse Problems*, 2021.

[9] S. Chang, B. Yu, and M. Vetterli. Adaptive wavelet thresholding for image denoising and compression. *IEEE Transactions on Image Processing*, 9(9):1532–1546, 2000.

[10] Y. Chen and T. Pock. Trainable nonlinear reaction diffusion: A flexible framework for fast and effective image restoration. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 39(6):1256–1272, 2016.

[11] Y. Chen, R. Ranftl, and T. Pock. Insights into analysis operator learning: From patch-based sparse models to higher order MRFs. *IEEE Transactions on Image Processing*, 23(3):1060–72, 2014.

[12] R. Cohen, Y. Blau, D. Freedman, and E. Rivlin. It has potential: Gradient-driven denoisers for convergent solutions to inverse problems. In *Advances in Neural Information Processing Systems*, volume 34, 2021.

[13] K. Dabov, A. Foi, V. Katkovnik, and K. Egiazarian. Image denoising by sparse 3-D transform-domain collaborative filtering. *IEEE Transactions on Image Processing*, 16(8):2080–2095, 2007.

[14] D. Donoho. De-noising by soft-thresholding. *IEEE Transactions on Information Theory*, 41(3):613–627, 1995.

[15] D. L. Donoho. Compressed sensing. *IEEE Transactions on Information Theory*, 52(4):1289–1306, 2006.

[16] S. Ducotterd, A. Goujon, P. Bohra, D. Perdios, S. Neumayer, and M. Unser. Improving Lipschitz-constrained neural networks by learning activation functions. arXiv:2210.16222, 2022.

[17] S. Ghadimi and G. Lan. Accelerated gradient methods for nonconvex nonlinear and stochastic programming. *Mathematical Programming*, 156(1-2, Ser. A):59–99, 2016.

[18] A. Goujon, A. Etemadi, and M. Unser. The role of depth, width, and activation complexity in the number of linear regions of neural networks, 2022.

[19] A. Goujon, S. Neumayer, P. Bohra, S. Ducotterd, and M. Unser. A neural-network-based convex regularizer for inverse problems. *IEEE Transactions on Computational Imaging*, 9:781–795, 2023.

[20] R. Gribonval and M. Nikolova. A characterization of proximity operators. *Journal of Mathematical Imaging and Vision*, 62(6-7):773–789, 2020.

[21] M. Hasannasab, J. Hertrich, S. Neumayer, G. Plonka, S. Setzer, and G. Steidl. Parseval proximal neural networks. *Journal of Fourier Analysis and Applications*, 26:59, 2020.

[22] S. Hurault, A. Chambolle, A. Leclaire, and N. Papadakis. A relaxed proximal gradient descent algorithm for convergent plug-and-play with proximal denoiser. In *Scale Space and Variational Methods in Computer Vision*, pages 379–392. Springer, 2023.

[23] S. Hurault, A. Leclaire, and N. Papadakis. Gradient step denoiser for convergent Plug-and-Play. In *International Conference on Learning Representations*, 2022.

[24] S. Hurault, A. Leclaire, and N. Papadakis. Proximal denoiser for convergent Plug-and-Play optimization with nonconvex regularization. In *39th International Conference on Machine Learning*, volume 162 of Proceedings of Machine Learning Research, pages 9483–9505. PMLR, 2022.

[25] D. P. Kingma and J. Ba. Adam: A method for stochastic optimization. In *3rd International Conference on Learning Representations, ICLR*, 2015.

[26] F. Knoll, J. Zbontar, A. Sriram, M. J. Muckley, M. Bruno, A. Defazio, M. Parente, K. J. Geras, J. Katsnelson, H. Chandarana, Z. Zhang, M. Drozdzalv, A. Romero, M. Rabbat, P. Vincent, J. Pinkerton, D. Wang, N. Yakubova, E. Owens, C. L. Zitnick, M. P. Recht, D. K. Sodickson, and Y. W. Lui. fastMRI: A publicly available raw k-space and DICOM dataset of knee images for accelerated MR image reconstruction using machine learning. *Radiology: Artificial Intelligence*, 2(1), 2020.

[27] E. Kobler, A. Effland, K. Kunisch, and T. Pock. Total deep variation for linear inverse problems. In *Conference on Computer Vision and Pattern Recognition*. IEEE, 2020.

[28] E. Kobler, T. Klatzer, K. Hammernik, and T. Pock. Variational networks: Connecting variational methods and deep learning. In *Pattern Recognition*, pages 281–293, 2017.

[29] M. Lang, H. Guo, J. Odegard, C. Burrus, and R. Wells. Noise reduction using an undecimated discrete wavelet transform. *IEEE Signal Processing Letters*, 3(1):10–12, 1996.

[30] A. Lanza, S. Morigi, I. W. Selesnick, and F. Sgallari. Sparsity-inducing nonconvex nonseparable regularization for convex image processing. *SIAM Journal on Imaging Sciences*, 12(2):1099–1134, 2019.

[31] A. Lanza, S. Morigi, I. W. Selesnick, and F. Sgallari. *Convex Non-Convex Variational Models*, pages 1–57. Springer International Publishing, Cham, 2021.

[32] J. D. Lee, I. Panageas, G. Piliouras, M. Simchowitz, M. I. Jordan, and B. Recht. First-order methods almost always avoid strict saddle points. *Mathematical Programming*, 176:311–337, 2019.

[33] H. Li, J. Schwab, S. Antholzer, and M. Haltmeier. NETT: Solving inverse problems with deep neural networks. *Inverse Problems*, 36(6):065005, 2020.

[34] J. Li, J. Li, Z. Xie, and J. Zou. Plug-and-Play ADMM for MRI reconstruction with convex nonconvex sparse regularization. *IEEE Access*, 9:148315–148324, 2021.

[35] S. Lunz, O. Öktem, and C.-B. Schönlieb. Adversarial regularizers in inverse problems. In *Advances in Neural Information Processing Systems*, volume 31, 2018.

[36] M. T. McCann and M. Unser. Biomedical image reconstruction: From the foundations to deep neural networks. *Foundations and Trends® in Signal Processing*, 13(3):283–359, 2019.

[37] C. McCollough. TU-FG-207A-04: Overview of the low dose CT Grand Challenge. *Medical Physics*, 43(6Part35):3759–3760, 2016.

[38] S. Mukherjee, S. Dittmer, Z. Shumaylov, S. Lunz, O. Öktem, and C.-B. Schönlieb. Learned convex regularizers for inverse problems. arXiv:2008.02839, 2021.

[39] S. Mukherjee, A. Hauptmann, O. Öktem, M. Pereyra, and C.-B. Schönlieb. Learned reconstruction methods with convergence guarantees: A survey of concepts and applications. *IEEE Signal Processing Magazine*, 40(1):164–182, 2023.

[40] S. Mukherjee, C.-B. Schönlieb, and M. Burger. Learning convex regularizers satisfying the variational source condition for inverse problems. In *NeurIPS Workshop on Deep Learning and Inverse Problems*, 2021.

[41] Y. E. Nesterov. A method of solving a convex programming problem with convergence rate o(1/k2). *Doklady Akademii Nauk*, 269(3):543–547, 1983.

[42] S. Neumayer, A. Goujon, P. Bohra, and M. Unser. Approximation of Lipschitz functions using deep spline neural networks. *SIAM Journal on Mathematics of Data Science*, 5(2):306–322, 2023.

[43] M. Nikolova. Energy minimization methods. In *Handbook of Mathematical Methods in Imaging*, pages 157–204. Springer, New York, 2015.

[44] P. Ochs. Local convergence of the heavy-ball method and iPiano for non-convex optimization. *Journal of Optimization Theory and Applications*, 177(1):153–180, 2018.

[45] P. Ochs, Y. Chen, T. Brox, and T. Pock. iPiano: Inertial proximal algorithm for nonconvex optimization. *SIAM Journal on Imaging Sciences*, 7(2):1388–1419, 2014.

[46] B. O’Donoghue and E. Candès. Adaptive restart for accelerated gradient schemes. *Foundations of Computational Mathematics*, 15(3):715–732, 2015.

[47] A. Parekh and I. W. Selesnick. Convex denoising using non-convex tight frame regularization. *IEEE Signal Processing Letters*, 22(10):1786–1790, 2015.

[48] A. Ribes and F. Schmitt. Linear inverse problems in imaging. *IEEE Signal Processing Magazine*, 25(4):84–99, 2008.

[49] S. Roth and M. J. Black. Fields of experts. *International Journal of Computer Vision*, 82(2):205–229, 2009.

[50] L. I. Rudin, S. Osher, and E. Fatemi. Nonlinear total variation based noise removal algorithms. *Physica D: Nonlinear Phenomena*, 60(1-4):259–268, 1992.

[51] G. Scrivanti, E. Chouzenoux, and J.-C. Pesquet. A CNC approach for directional total variation. In *30th European Signal Processing Conference*, pages 488–492. IEEE, 2022.

[52] H. Sedghi, V. Gupta, and P. M. Long. The singular values of convolutional layers. In *International Conference on Learning Representations*, 2019.

[53] B. Tan, Y. Li, H. Zhao, X. Li, and S. Ding. A novel dictionary learning method for sparse representation with nonconvex regularizations. *Neurocomputing*, 417:128–141, 2020.

[54] A. N. Tikhonov. Solution of incorrectly formulated problems and the regularization method. *Soviet Mathematics*, 4:1035–1038, 1963.

[55] K. Zhang, Y. Li, W. Zuo, L. Zhang, L. Van Gool, and R. Timofte. Plug-and-play image restoration with deep denoiser prior. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 44(10):6360–6376, 2022.

[56] H. Zhao, O. Gallo, I. Frosio, and J. Kautz. Loss functions for image restoration with neural networks. *IEEE Transactions on Computational Imaging*, 3(1):47–57, 2017.

[57] J. Zou, M. Shen, Y. Zhang, H. Li, G. Liu, and S. Ding. Total variation denoising with non-convex regularizers. *IEEE Access*, 7:4422–4431, 2019.

**原文插图：** 原 PDF 中的图 1–9 未重传至本页，仅保留中文图注与图中给出的指标数值；全部原图可通过页首的原文 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2308.10542v2（eess.IV，30 页）的全文中文译稿，覆盖摘要、正文第 1–5 节（含 1.1–1.4、3.1–3.5、3.3.1–3.3.2、4.1–4.2、4.2.1 等全部小节）、结论、致谢、全部图注（图 1–9）、表 1–4（逐格转录）、算法 1（6 个步骤的伪代码与主循环）以及 57 条参考文献英文原条目；公式 (1)–(38) 按原编号以 `$$` 展示式录入。原文无附录；原文中的脚注（Prox-DRUNet 灰度适配、Lipschitz 界、仿射延拓定义、PnP-DRS 适用性、功率法验证等）以“（原文脚注：…）”形式就地插入。**逐句终校未做**：表 1–4 的数值已用 PDF 文本层与页面渲染逐格核对（含表 1 的 Convex/Provably CNC/Approx. CNC/Others 分组与脚注 1–3、表 4 的 PSNR/SSIM/参数量），(15) 的投影定义、(20) 的训练目标、(21) 的谱范数估计、算法 1 与定理 4.3 的证明步骤亦已对照渲染核对；但尚未完成逐句逐式的独立复核。页内 1 处“原文疑点”为翻译时发现的原文内部表述问题（注 4.6 中强凸模数写作 $\sqrt{\lambda_{\min}(\mathbf H^T\mathbf H)}-\lambda$），按原文照录并加注，未作数值或表述改动。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
