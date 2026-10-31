---
layout: page
title: "扩散逆问题的直接条件转移采样｜中文全文译文"
permalink: /papers/translations/2026-09-16-2609-14596-direct-conditional-transition-sampling-for-diffusion-inverse-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4e41c9dfc2647d39/) · [原文 arXiv](https://arxiv.org/abs/2609.14596) · [全部目录](/papers/catalog/)

# 扩散逆问题的直接条件转移采样

**原题：** Direct Conditional Transition Sampling for Diffusion Inverse Problems  
**作者：** Qi Yu、Hanlin Wu、Xiaohui Sun。单位：北京外国语大学信息科学技术学院（School of Information Science and Technology, Beijing Foreign Studies University）。  
**版本：** arXiv:2609.14596v1（cs.CV），2026 年 9 月 13 日提交，原文 5 页（ICASSP 风格双栏会议论文，含图 1–2、表 1–2、公式 (1)–(13)、算法 1、参考文献 20 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、引言、方法（2.1–2.4）、实验（3.1–3.3）、结论、全部图注（图 1–2）、表 1–2（逐格转录）、算法 1、公式 (1)–(13) 与 20 条参考文献英文原条目；原文无附录、无作者简介；逐句逐式终校未做。

## 摘要

免训练的扩散逆问题求解器通常在局部测量引导与代价高昂的干净空间后验更新之间取舍。**独立后验刷新**可以通过采样一个干净条件样本再重新加噪来改善全局校正，但其实际实现需要概率流 ODE 积分与干净空间 Markov 链 Monte Carlo（MCMC）。我们提出**直接条件转移采样（DCTS）**，作为对同一理想刷新目标的直接随机流近似。DCTS 不显式抽取干净样本，而是沿一条短内路径估计测量条件的干净均值，并把高斯源噪声直接输运到下一含噪状态。一个与去噪器兼容的充分统计量以及一个协方差缩放算子更新，使这种条件均值估计成为可能。在四个逆问题上的实验表明，DCTS 取得有竞争力的重建质量，相对对比方法最高可达 16.8 倍的加速。

**关键词：** 扩散模型、逆问题、后验采样、流匹配、图像复原。

## 1 引言

逆问题的目标是从观测 $\mathbf y=\mathbf A(\mathbf z)+\mathbf n$ 中恢复未知信号 $\mathbf z\in\mathbb R^d$，其中 $\mathbf A:\mathbb R^d\to\mathbb R^m$ 为已知前向算子，$\mathbf n\sim\mathcal N(0,\boldsymbol\Sigma_y)$ 为加性高斯噪声。该问题本质上是病态的：$\mathbf A$ 可能具有的非线性与信息损失会使单个观测对应多个合理解。贝叶斯表述用后验分布刻画这种不确定性：

$$
p(\mathbf z|\mathbf y)\propto p(\mathbf y|\mathbf z)p_{\rm data}(\mathbf z), \tag{1}
$$

其中 $p_{\rm data}$ 为先验分布，$p(\mathbf y|\mathbf z)$ 为测量模型诱导的似然。

扩散模型 [1, 2] 提供了有表现力的学习先验，因而可用一个预训练去噪器求解多种逆问题，而无需为每个算子重新训练条件模型。前向扩散过程通过高斯扰动由干净信号 $\mathbf Z$ 生成含噪状态 $\mathbf X_t$：

$$
\mathbf X_t=\alpha_t\mathbf Z+\sigma_t\boldsymbol\epsilon_t,\qquad
\boldsymbol\epsilon_t\sim\mathcal N(\mathbf 0,\mathbf I),
$$

其中 $\alpha_t$ 与 $\sigma_t$ 为已知调度系数。等价地，前向扩散核为

$$
q_t(\mathbf x|\mathbf z):=\mathcal N\left(\mathbf x;\alpha_t\mathbf z,\sigma_t^2\mathbf I\right). \tag{2}
$$

我们采用方差爆炸（VE）参数化 [2]，即 $\alpha_t\equiv1$。利用预训练去噪器的分数估计，可数值求解逆向随机微分方程（SDE），从学习到的数据先验中生成样本。对逆问题，我们的目标是使用该去噪器从后验 $p(\mathbf z|\mathbf y)$ 采样，这要求把测量 $\mathbf y$ 纳入采样过程。

现有免训练求解器采用两大类后验采样策略：局部引导与干净空间更新。引导方法用含噪似然分数的可处理近似修正每个逆扩散步：DPS [3] 对在去噪估计处评估的测量残差求导，而 DDRM [4]、PiGDM [5] 与 CoDPS [6] 利用线性算子结构或高斯近似；TMPD [7] 与最优后验协方差方法 [8] 进一步把去噪器不确定性纳入测量更新。然而，相邻含噪状态之间的小幅更新可能难以纠正早期采样步的全局误差，在非线性逆问题中尤为如此 [9]。

第二类方法通过干净空间的显式更新纳入测量，再生成下一含噪状态。DDNM [10] 在去噪估计中强制数据一致性，DiffPIR [11] 在去噪步之间求解干净空间数据子问题。DAPS [9] 通过干净空间采样与独立重加噪刷新含噪状态，允许超出局部轨迹校正的转移。每次刷新包含三步：(i) 从 $\mathbf x_t$ 积分概率流 ODE 得到干净估计；(ii) 从该估计初始化 MCMC，以近似从 $p(\mathbf z|\mathbf x_t,\mathbf y)$ 采样 $\mathbf Z$；(iii) 重加噪：$\mathbf X_{t'}=\mathbf Z+\sigma_{t'}\boldsymbol\xi$，其中 $\boldsymbol\xi\sim\mathcal N(\mathbf 0,\mathbf I)$ 为新鲜高斯噪声。重复 ODE 积分与 MCMC 采样的代价引出如下问题：

**能否通过从 $\mathbf x_t$ 到 $\mathbf x_{t'}$ 的直接转移实现同样的后验刷新，而无需显式的干净空间采样与重加噪？**

我们用**直接条件转移采样（DCTS）**回答该问题：这是一种免训练方法，基于流匹配（Flow Matching）[12] 用直接转移替代显式的干净空间采样与重加噪。沿该流，我们把当前含噪状态 $\mathbf x_t$ 与演化中的流状态合并为一个与预训练去噪器兼容的高斯扰动状态。去噪器给出干净信号估计，我们再通过针对前向算子定制的**高斯更新**用测量 $\mathbf y$ 精炼该估计；精炼后的估计决定流的**速度**，把新鲜高斯噪声直接输运到下一含噪状态 $\mathbf x_{t'}$。如图 1 所示，所得转移保留了相同的后验刷新目标，同时避免了显式的干净空间采样、MCMC 精炼与重加噪。本文贡献有三：

1）我们把独立后验刷新表述为直接随机输运，从而实现对局部轨迹更新约束之外的全局校正。
2) 我们开发了一种免训练方法，用预训练去噪器估计以测量为条件的输运速度。
3) 在多种逆问题上的实验表明，DCTS 以大幅降低的计算代价取得有竞争力的重建质量。

**图 1：** 三种条件转移的比较：(a) 局部引导；(b) DAPS 干净空间刷新；(c) 本文提出的 DCTS——直接把噪声输运到下一状态（图中标出测量 $\mathbf y$、速度 $\mathbf u^y_s(\mathbf r_s|\mathbf x_t,\mathbf y)$、内路径 $r_0\to r_s\to r_1=\mathbf x_{t'}$ 及“上一轨迹/刷新后轨迹”）。

## 2 方法

### 2.1 问题表述

以观测 $\mathbf y$ 为条件，式 (2) 的前向扩散核定义含噪后验边缘分布：

$$
\pi_t(\mathbf x|\mathbf y):=\int q_t(\mathbf x|\mathbf z)p(\mathbf z|\mathbf y)\,d\mathbf z. \tag{3}
$$

我们的目标是实现**独立后验刷新核**：

$$
\mathcal K^\star_{t\to t'}(\mathbf x'|\mathbf x,\mathbf y)
=\int q_{t'}(\mathbf x'|\mathbf z)p(\mathbf z|\mathbf x,\mathbf y)\,d\mathbf z. \tag{4}
$$

该核把含噪后验边缘 $\pi_t$ 映射到 $\pi_{t'}$：若 $\mathbf X_t\sim\pi_t(\cdot|\mathbf y)$，采样 $\mathbf Z\sim p(\cdot|\mathbf X_t,\mathbf y)$ 得到干净后验边缘 $p(\mathbf z|\mathbf y)$，再经 $q_{t'}$ 重加噪即得 $\pi_{t'}(\cdot|\mathbf y)$。式 (4) 定义的后验刷新核与 DAPS [9] 相同，但 DCTS 以不同方式实现它。DAPS 显式近似从 $p(\cdot|\mathbf x_t,\mathbf y)$ 的干净抽样，然后重加噪；相反，我们为每个外层步 $t\to t'$ 定义一条**内条件流**：以 $\mathbf x_t$ 与 $\mathbf y$ 为条件，从新鲜高斯噪声积分该流 ODE 得到 $\mathbf x_{t'}$，从而绕过显式干净空间采样与重加噪。下面给出该流速度场的免训练构造。

### 2.2 随机内路径

我们建立在 GLASS [13] 的高斯转移构造之上，并通过用测量与前向算子精炼去噪器的干净信号估计来适配逆问题。设 $s\in[0,1]$ 表示**内坐标**（区别于外层扩散时间）。我们在高斯源与刷新端点之间线性插值：

$$
\mathbf R_s=(1-s)\sigma_{\rm src}\boldsymbol\eta+s\left(\mathbf Z+\sigma_{t'}\boldsymbol\eta\right),
\qquad\boldsymbol\eta\sim\mathcal N(\mathbf 0,\mathbf I). \tag{5}
$$

这里 $\sigma_{\rm src}>0$ 为辅助源尺度，$\boldsymbol\eta$ 与 $(\mathbf Z,\mathbf X_t,\mathbf y)$ 独立。等价地 $\mathbf R_s=s\mathbf Z+\bar\sigma_s\boldsymbol\eta$，其中 $\bar\sigma_s=(1-s)\sigma_{\rm src}+s\sigma_{t'}$。源 $\mathbf R_0=\sigma_{\rm src}\boldsymbol\eta$ 易于采样，而 $\mathbf R_1=\mathbf Z+\sigma_{t'}\boldsymbol\eta$ 具有式 (4) 的端点律。由流匹配 [12] 的边缘速度恒等式，$\mathbf r_s$ 处的边缘速度是给定当前状态与条件变量时、逐样本路径速度的条件期望。对式 (5) 的线性路径，该期望仅通过**条件干净均值**

$$
\mathbf m^\star_s:=\mathbb E\left[\mathbf Z\,|\,\mathbf R_s=\mathbf r_s,\ \mathbf X_t=\mathbf x_t,\ \mathbf y\right] \tag{6}
$$

依赖干净端点。因此，沿内路径估计 $\mathbf m^\star_s$ 就足以构造速度场。

### 2.3 测量条件干净均值

我们分两阶段估计 $\mathbf m^\star_s$。首先，在纳入 $\mathbf y$ 之前，估计先验干净均值 $\mathbb E[\mathbf Z|\mathbf X_t=\mathbf x_t,\mathbf R_s=\mathbf r_s]$。该均值依赖两个含噪状态，而预训练去噪器只接受单个高斯扰动状态及其噪声水平。由于 $\mathbf X_t$ 与 $\mathbf R_s$ 在给定 $\mathbf Z$ 时条件独立，我们按照 [13] 的推导把这两个高斯观测合并为 $\mathbf Z$ 的单一充分统计量，并保持该条件均值不变：

$$
\tilde{\mathbf X}_s:=v_s\left(\frac{\mathbf X_t}{\sigma_t^2}+\frac{s\mathbf R_s}{\bar\sigma_s^2}\right)
=\mathbf Z+\tilde\sigma_s\tilde{\boldsymbol\epsilon}_s, \tag{7}
$$

其中 $v_s=(\sigma_t^{-2}+s^2/\bar\sigma_s^2)^{-1}$，$\tilde\sigma_s=\sqrt{v_s}$，$\tilde{\boldsymbol\epsilon}_s\sim\mathcal N(\mathbf 0,\mathbf I)$。第一个等式把 $\tilde{\mathbf X}_s$ 定义为两个状态的精度加权平均，第二个等式表明它仍是 $\mathbf Z$ 的高斯扰动版本。在 $s=0$ 时，$\mathbf R_0$ 不含 $\mathbf Z$ 的信息，故 $\tilde{\mathbf X}_0=\mathbf X_t$、$\tilde\sigma_0=\sigma_t$；随着 $s$ 增大，$\tilde{\mathbf X}_s$ 逐步纳入演化中的内状态信息。对已观测状态 $(\mathbf x_t,\mathbf r_s)$，其实现 $\tilde{\mathbf x}_s=v_s(\mathbf x_t/\sigma_t^2+s\mathbf r_s/\bar\sigma_s^2)$ 与噪声水平 $\tilde\sigma_s$ 因此构成有效的去噪器输入。此外，$\tilde{\mathbf X}_s$ 对 $\mathbf Z$ 的充分性保证 $\mathbb E[\mathbf Z|\mathbf X_t=\mathbf x_t,\mathbf R_s=\mathbf r_s]=\mathbb E[\mathbf Z|\tilde{\mathbf X}_s=\tilde{\mathbf x}_s]$。由 Tweedie 公式 [14]，在该高斯扰动统计量上对预训练去噪器 $D$ 做一次评估，即可估计同一干净条件均值：

$$
\mathbf m_s=D(\tilde{\mathbf x}_s,\tilde\sigma_s)
\approx\mathbb E\left[\mathbf Z\,|\,\mathbf X_t=\mathbf x_t,\ \mathbf R_s=\mathbf r_s\right]. \tag{8}
$$

第二阶段，我们用协方差尺度 $\kappa>0$ 的局部高斯近似 [5] 纳入 $\mathbf y$：

$$
p(\mathbf z|\mathbf x_t,\mathbf r_s)\approx\mathcal N(\mathbf z;\mathbf m_s,c_s\mathbf I),\qquad
c_s=\kappa v_s. \tag{9}
$$

**线性算子。** 遵循高斯条件化方法 [5, 6]，对 $\mathbf A(\mathbf z)=\mathbf A\mathbf z$，高斯条件化把 $\mathbf m_s$ 修正为

$$
\mathbf m^y_s=\mathbf m_s+c_s\mathbf A^\top\left(c_s\mathbf A\mathbf A^\top+\boldsymbol\Sigma_y\right)^{-1}
\left(\mathbf y-\mathbf A\mathbf m_s\right). \tag{10}
$$

该逆运算把局部协方差与测量噪声相平衡，使式 (10) 成为近似 (9) 下的精确后验均值。式 (10) 用算子特定的闭式或迭代求解器评估，而不显式构造逆矩阵，实现细节见第 3.1 节。

**非线性算子。** 对可微非线性算子，设 $\mathbf J_s=\nabla\mathbf A(\mathbf m_s)$ 为其在当前均值处的 Jacobian。把局部线性化代入高斯更新得到 Gauss–Newton 矩

$$
\mathbf m^y_s=\mathbf m_s+c_s\mathbf J_s^\top\left(c_s\mathbf J_s\mathbf J_s^\top+\boldsymbol\Sigma_y\right)^{-1}
\left[\mathbf y-\mathbf A(\mathbf m_s)\right]. \tag{11}
$$

我们用 Jacobian–向量积评估式 (11) 而不显式构造 $\mathbf J_s$，实现细节见第 3.1 节。与线性更新不同，非线性更新仅在局部有效，对强多峰条件分布可能不准确。

### 2.4 直接转移速度

在估计出测量条件的干净矩之后，我们将其转换为输运高斯源到刷新端点的速度。对式 (5) 的内路径求导并代入 $\boldsymbol\eta=(\mathbf R_s-s\mathbf Z)/\bar\sigma_s$，得逐样本速度 $\dot{\mathbf R}_s=b_s\mathbf R_s+(1-sb_s)\mathbf Z$，其中 $b_s=(\sigma_{t'}-\sigma_{\rm src})/\bar\sigma_s$，$s\in[0,1)$。取其条件期望并用估计的测量条件干净均值替代未知的真实干净条件均值（记为 $\mathbf m^y_s$），得到实用速度场

$$
\mathbf u^y_s=b_s\mathbf r_s+(1-sb_s)\mathbf m^y_s. \tag{12}
$$

第一项把新息尺度从 $\sigma_{\rm src}$ 变为 $\sigma_{t'}$，第二项输运测量条件的干净内容。若 $\mathbf m^y_s=\mathbf m^\star_s$，则这是内路径的精确边缘速度，精确积分可恢复式 (4) 的端点律而无需显式抽取 $\mathbf Z$。实践中，DCTS 在每个数值内状态处重新计算近似矩 $\mathbf m^y_s$。

对每个外层转移 $t\to t'$，我们先抽取新鲜源 $\mathbf r_0=\sigma_{\rm src}\boldsymbol\eta$ 并置 $\Delta s=1/M$。在每个 $s=j/M$ 处，我们在当前 $\mathbf r_s$ 评估条件矩与速度，然后施加 Euler 更新

$$
\mathbf r_{s+\Delta s}=\mathbf r_s+\Delta s\,\mathbf u^y_s. \tag{13}
$$

经过 $M$ 步后，置 $\mathbf x_{t'}=\mathbf r_1$。每个内步需要一次去噪器前向与一次测量条件矩更新，故 $L$ 个外层转移共需 $LM$ 次（各一次的）前向与更新；全程无需去噪器反向传播，也无需变长度的干净空间链。算法 1 汇总完整采样器。

**算法 1　直接条件转移采样（DCTS）**

输入：去噪器 $D$、测量 $(\mathbf y,\mathbf A,\boldsymbol\Sigma_y)$、噪声调度 $\sigma_0>\cdots>\sigma_L=0$、内步数 $M$、$\sigma_{\rm src}$ 与 $\kappa$

1. 采样 $\mathbf x^{(0)}\sim\mathcal N(\mathbf 0,\sigma_0^2\mathbf I)$
2. **for** $k=0,\dots,L-1$ **do**
3. 　置 $(\mathbf x_t,\sigma_t,\sigma_{t'})=(\mathbf x^{(k)},\sigma_k,\sigma_{k+1})$
4. 　采样 $\mathbf r_0=\sigma_{\rm src}\boldsymbol\eta$，$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\mathbf I)$
5. 　**for** $j=0,\dots,M-1$ **do**
6. 　　置 $s=j/M$，按式 (7) 构造 $(\tilde{\mathbf x}_s,\tilde\sigma_s)$
7. 　　$\mathbf m_s\leftarrow D(\tilde{\mathbf x}_s,\tilde\sigma_s)$
8. 　　按式 (10) 或 (11) 计算 $\mathbf m^y_s$
9. 　　按式 (12)–(13) 更新 $\mathbf r_s$
10. 　**end for**
11. 　$\mathbf x^{(k+1)}\leftarrow\mathbf r_1$
12. **end for**
13. **return** $\mathbf x^{(L)}$

> **原文疑点：** 式 (9) 的局部高斯近似引入协方差尺度 $c_s=\kappa v_s$，其中 $\kappa$ 在第 3.1 节仅给出各任务取值为 SR 1.0、相位恢复与运动模糊 0.5、上色 0.25，但正文未说明 $\kappa$ 是如何选定的（如网格搜索或按验证集调参），也未讨论其与式 (10)“近似 (9) 下的精确后验均值”这一表述的关系。本译按原文照录并加注。

## 3 实验

### 3.1 实验设置

**数据集与指标。** 遵循 DAPS [9]，我们使用 FFHQ-256 数据集 [15] 的前 100 张测试图像评估 DCTS 的有效性，报告 PSNR、SSIM、LPIPS 与 ArcFace 身份相似度 [16]。LPIPS 度量重建与参考图像之间的感知差异（越低越好），ArcFace 评估人脸身份保持程度（越高越好）。

**逆问题。** 我们考虑四个逆问题：超分辨率（SR）、相位恢复、运动去模糊与灰度上色，全部使用高斯测量噪声 $\sigma_y=0.05$。对 SR，采用 DAPS [9] 中的抗混叠 4× 下采样算子。相位恢复是由 Fourier 幅度（无相位信息）重建图像的非线性逆问题，我们使用 2.0 的过采样率。对运动去模糊，我们用 $61\times61$ 运动模糊核并以反射填充对图像做卷积。上色使用从每个 RGB 像素到标量灰度测量的秩一线性映射。

**实现细节。** 我们采用 DAPS [9] 的预训练 DDPM 作为去噪器，源尺度设为 $\sigma_{\rm src}=1$，使用 $L=150$ 个外层步与 $M=2$ 个内步；对相位恢复把 $M$ 增至 8 以提升重建质量。外层噪声水平采用 EDM 离散化 [17]，多项式指数 7，$\sigma_{\max}=100$、$\sigma_{\min}=0.1$，最终噪声水平为零。局部协方差为 $c_s\mathbf I$，其中 $c_s=\kappa v_s$：SR 取 $\kappa=1.0$，相位恢复与运动模糊取 $0.5$，上色取 $0.25$。为评估式 (10)，SR 利用下采样算子的可分离结构，上色使用逐像素闭式更新；运动去模糊用四次共轭梯度迭代近似求解相应线性系统；相位恢复用解析 Jacobian 积与四次共轭梯度迭代评估式 (11)。

### 3.2 主结果

我们与 DAPS [9]、DPS [3]、MGPS [18] 与 MGDM [19] 比较，均使用其官方默认采样超参数。运行时间在 RTX 4090 GPU 上以批大小 1 测量。表 1 表明，DCTS 在三个任务上取得最高 PSNR、在全部四个任务上取得前二的平均 ArcFace 相似度，并具有最低的单轨迹运行时间。这些结果表明，DCTS 在取得有竞争力重建质量的同时，通过避免重复的干净空间采样降低了运行时间。图 2 表明 DCTS 更好地保留面部结构与细节，同时减少伪影。

**表 1：** FFHQ-256 上的定量结果。原文以**粗体**标最佳、下划线标次佳；本表以**粗体**标最佳、*斜体*标次佳（相位恢复的 LPIPS 在 MGDM 与 DCTS 处并列次佳，故二者均为斜体）。

| 任务 | 方法 | PSNR (dB)↑ | SSIM↑ | LPIPS↓ | ArcFace↑ | 时间 (s)↓ |
|---|---|---|---|---|---|---|
| SR ×4 | DAPS [9] | *29.360* | 0.783 | 0.192 | *0.926* | 94.74 |
| SR ×4 | DPS [3] | 24.663 | 0.705 | 0.259 | 0.619 | *53.02* |
| SR ×4 | MGPS [18] | 28.189 | 0.791 | 0.163 | 0.879 | 81.20 |
| SR ×4 | MGDM [19] | 28.526 | *0.807* | **0.151** | 0.900 | 82.10 |
| SR ×4 | DCTS | **30.552** | **0.861** | *0.160* | **0.928** | **5.65** |
| 相位恢复 | DAPS [9] | **29.705** | 0.771 | 0.182 | **0.918** | 117.30 |
| 相位恢复 | DPS [3] | 19.065 | 0.550 | 0.394 | 0.439 | *53.78* |
| 相位恢复 | MGPS [18] | 28.439 | *0.806* | **0.165** | 0.874 | 81.61 |
| 相位恢复 | MGDM [19] | 28.665 | 0.801 | *0.170* | 0.859 | 83.55 |
| 相位恢复 | DCTS ($M{=}8$) | *29.696* | **0.812** | *0.170* | *0.908* | **25.17** |
| 去模糊 | DAPS [9] | *31.651* | 0.836 | 0.137 | **0.971** | 66.26 |
| 去模糊 | DPS [3] | 27.285 | 0.773 | 0.183 | 0.842 | *53.02* |
| 去模糊 | MGPS [18] | 30.577 | 0.854 | *0.115* | 0.953 | 81.38 |
| 去模糊 | MGDM [19] | 31.048 | *0.860* | **0.103** | 0.962 | 81.48 |
| 去模糊 | DCTS | **32.678** | **0.886** | 0.128 | *0.969* | **7.41** |
| 上色 | DAPS [9] | *24.055* | 0.763 | 0.310 | **0.974** | 59.80 |
| 上色 | DPS [3] | 11.700 | 0.526 | 0.594 | 0.761 | *53.37* |
| 上色 | MGPS [18] | 23.001 | *0.877* | **0.217** | 0.964 | 80.22 |
| 上色 | MGDM [19] | 22.051 | 0.865 | *0.226* | 0.962 | 81.36 |
| 上色 | DCTS | **24.412** | **0.892** | 0.235 | *0.967* | **5.43** |

**图 2：** 视觉比较：(a) SR×4；(b) 相位恢复；(c) 去模糊；(d) 上色（列依次为 GT、Meas.、DAPS、DPS、MGPS、MGDM、DCTS）。

### 3.3 消融研究

我们通过消融研究评估所提转移设计以及多次内更新的作用。所有变体都使用 $L=150$ 个外层步、同一预训练去噪器与同一测量条件化规则。DDIM [20] 变体把每次 DCTS 转移替换为从当前含噪状态开始的 8 个 DDIM 子步；这里 $\eta$ 控制 DDIM 的随机性：$\eta=0$ 给出确定性更新，$\eta=1$ 在每个子步注入新鲜高斯噪声。我们还评估“点刷新”，它在每个外层步把新鲜高斯噪声加到单个测量条件干净估计上以生成下一含噪状态。这对应于单步 Euler（$M=1$），而完整 DCTS 沿 8 个内步（$M=8$）重新计算估计；因此点刷新所用去噪器调用次数是完整 DCTS 的八分之一。表 2 报告在 FFHQ-256 前 100 张测试图像上的相位恢复结果：完整 DCTS 在全部四个指标上取得最佳均值。

**表 2：** 相位恢复任务上的消融研究。

| 模型 | PSNR(dB)↑ | SSIM↑ | LPIPS↓ | ArcFace↑ |
|---|---|---|---|---|
| 确定性 DDIM | 13.618 | 0.238 | 0.644 | 0.115 |
| 随机 DDIM（$\eta=1$） | 16.495 | 0.394 | 0.545 | 0.276 |
| 点刷新（$M=1$） | 28.813 | 0.761 | 0.214 | 0.881 |
| DCTS（$M=8$） | **29.696** | **0.812** | **0.170** | **0.908** |

## 4 结论

我们提出了 DCTS，它把独立后验刷新重新表述为直接条件输运，而无需显式的干净空间采样与重加噪。在精确的条件均值估计与积分下，该流可恢复理想的刷新核。一个与去噪器兼容的充分统计量与局部高斯条件化使这一免训练近似成为可能。实验表明，它在取得有竞争力重建质量的同时大幅降低了运行时间。

## 5 参考文献（英文原条目，按原文顺序）

[1] Jonathan Ho, Ajay Jain, and Pieter Abbeel, “Denoising diffusion probabilistic models,” in *Advances in Neural Information Processing Systems*, 2020, vol. 33, pp. 6840–6851.

[2] Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole, “Score-based generative modeling through stochastic differential equations,” in *International Conference on Learning Representations*, 2021.

[3] Hyungjin Chung, Jeongsol Kim, Michael T. McCann, Marc L. Klasky, and Jong Chul Ye, “Diffusion posterior sampling for general noisy inverse problems,” in *International Conference on Learning Representations*, 2023.

[4] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song, “Denoising diffusion restoration models,” in *Advances in Neural Information Processing Systems*, 2022, vol. 35, pp. 23593–23606.

[5] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz, “Pseudoinverse-guided diffusion models for inverse problems,” in *International Conference on Learning Representations*, 2023.

[6] Nebiyou Yismaw, Ulugbek S. Kamilov, and M. Salman Asif, “Gaussian is all you need: A unified framework for solving inverse problems via diffusion posterior sampling,” *IEEE Transactions on Computational Imaging*, vol. 11, pp. 1020–1030, 2025.

[7] Benjamin Boys, Mark Girolami, Jakiw Pidstrigach, Sebastian Reich, Alan Mosca, and Omer Deniz Akyildiz, “Tweedie moment projected diffusions for inverse problems,” *Transactions on Machine Learning Research*, 2024.

[8] Xinyu Peng, Ziyang Zheng, Wenrui Dai, Nuoqian Xiao, Chenglin Li, Junni Zou, and Hongkai Xiong, “Improving diffusion models for inverse problems using optimal posterior covariance,” in *Proceedings of the 41st International Conference on Machine Learning*, 2024, vol. 235 of PMLR, pp. 40347–40370.

[9] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song, “Improving diffusion inverse problem solving with decoupled noise annealing,” in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2025, pp. 20895–20905.

[10] Yinhuai Wang, Jiwen Yu, and Jian Zhang, “Zero-shot image restoration using denoising diffusion null-space model,” in *International Conference on Learning Representations*, 2023.

[11] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool, “Denoising diffusion models for plug-and-play image restoration,” in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops*, 2023, pp. 1219–1229.

[12] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le, “Flow matching for generative modeling,” in *International Conference on Learning Representations*, 2023.

[13] Peter Holderrieth, Uriel Singer, Tommi Jaakkola, Ricky T. Q. Chen, Yaron Lipman, and Brian Karrer, “GLASS flows: Transition sampling for alignment of flow and diffusion models,” in *International Conference on Learning Representations*, 2026.

[14] Bradley Efron, “Tweedie’s formula and selection bias,” *Journal of the American Statistical Association*, vol. 106, no. 496, pp. 1602–1614, 2011.

[15] Tero Karras, Samuli Laine, and Timo Aila, “A style-based generator architecture for generative adversarial networks,” in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2019, pp. 4401–4410.

[16] Jiankang Deng, Jia Guo, Niannan Xue, and Stefanos Zafeiriou, “ArcFace: Additive angular margin loss for deep face recognition,” in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2019, pp. 4690–4699.

[17] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine, “Elucidating the design space of diffusion-based generative models,” in *Advances in Neural Information Processing Systems*, 2022, vol. 35, pp. 26565–26577.

[18] Badr Moufad, Yazid Janati, Lisa Bedin, Alain Durmus, Randal Douc, Eric Moulines, and Jimmy Olsson, “Variational diffusion posterior sampling with midpoint guidance,” in *International Conference on Learning Representations*, 2025.

[19] Yazid Janati, Badr Moufad, Mehdi Abou El Qassime, Alain Oliviero Durmus, Eric Moulines, and Jimmy Olsson, “A mixture-based framework for guiding diffusion models,” in *Proceedings of the 42nd International Conference on Machine Learning*, 2025, vol. 267 of PMLR, pp. 26830–26876.

[20] Jiaming Song, Chenlin Meng, and Stefano Ermon, “Denoising diffusion implicit models,” in *International Conference on Learning Representations*, 2021.

**原文插图：** 原 PDF 中的图 1–2 未重传至本页，仅保留中文图注与图中关键标注（图 1 的三种转移示意与内路径 $r_0\to r_1$；图 2 的 GT/Meas./各方法列名）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.14596v1（cs.CV，5 页）的全文中文译稿，覆盖摘要、关键词、引言、方法（2.1–2.4）、实验（3.1–3.3）、结论、全部图注（图 1–2）、表 1–2（逐格转录，原文粗体/下划线分别表示最佳/次佳，译文以粗体/斜体对应表示并在表注说明）、算法 1、公式 (1)–(13) 与 20 条参考文献英文原条目；原文无附录、无作者简介。**逐句终校未做**：表 1（4 任务 × 5 方法，含最佳/次佳标记）与表 2（4 行消融）均已用 PDF 页面高倍渲染逐格核对，式 (5)、(7)、(10)–(13) 亦对照页面核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 1 条“原文疑点”加注（式 (9) 的局部协方差尺度 $c_s=\kappa v_s$ 中 $\kappa$ 的选取方式——网格搜索或验证集调参——原文未说明，且式 (10) 称“近似 (9) 下的精确后验均值”依赖该启发式近似）；另在表 1 表注中说明了原文“最佳/次佳”标记的对应关系及相位恢复 LPIPS 的并列次佳情形（MGDM 与 DCTS 同为 0.170）。均按原文照录，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
