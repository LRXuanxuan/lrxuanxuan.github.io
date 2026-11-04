---
layout: page
title: "S³-PnP：面向科学成像的自监督分数先验即插即用去噪｜中文全文译文"
permalink: /papers/translations/2026-11-04-2610-18458-s3-pnp-self-supervised-score-priors-for-scientific-imaging/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1c24c652f66fb3a3/) · [原文 arXiv](https://arxiv.org/abs/2610.18458/) · [全部目录](/papers/catalog/)

# S³-PnP：面向科学成像的自监督分数先验即插即用去噪

**原题：** $\mathrm{S}^3$-PnP: Plug-and-Play Denoising for Scientific Imaging with Self-Supervised Score Priors  
**作者：** Yukun Cui¹、Jiangshe Zhang¹,*、Shuang Xu²、Lilun Deng¹、Haowen Bai³、Tao Feng⁴、Haotong Qin⁵、Konrad Schindler⁶、Zixiang Zhao⁶,*（¹西安交通大学 Xi'an Jiaotong University；²西北工业大学 Northwestern Polytechnical University；³南洋理工大学 Nanyang Technological University；⁴清华大学 Tsinghua University；⁵香港理工大学 Hong Kong Polytechnic University；⁶苏黎世联邦理工学院 ETH Zürich。按 PDF 首页标注：* 为通讯作者；邮箱 cuiyukun@xjtu.edu.cn、zixiang.zhao@ethz.ch。单位按 PDF 首页原文转写。）  
**版本：** arXiv:2610.18458v1（v1 标注 2026-10-13）；31 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节全部正文与小节（§2、§3.1–3.2、§4.1–4.4）、引理 1 与定理 1（含附录 A.1/A.2 完整证明）、算法 1–3、式 (1)–(11) 与 (A.1)–(A.25)、(B.1)–(B.13)、(C.1)、表 1–16（逐格转写）、图 1–12 图注、附录 A–C、AI 使用声明、参考文献 [1]–[46]（英文原条目）；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

现代图像复原方法日益依赖大规模监督训练，然而在高光谱成像（HSI）与磁共振成像（MRI）等科学成像模态中，干净目标往往极难获得。带预训练扩散先验的即插即用 ADMM（PnP-ADMM）提供了一种有前景的替代方案，但所学先验分布可能同时与目标科学图像分布、以及由对偶反馈诱导的 ADMM 去噪器输入分布失配。为缓解这些失配，我们提出 **S³-PnP**：一个自监督的即插即用复原框架，它直接从由观测导出的 ADMM 中间状态中学习分数先验，既不需要干净训练目标，也不需要外部预训练权重。具体而言，所学分数修正解析先验更新的输入，把观测驱动的修正与解析正则化结合起来。我们进一步在**理想分数**与**二次数据保真**的假设下，分析修正后 ADMM 算法的收敛性与重建误差。在参考引导 HSI 复原、单图 HSI 去噪与 MRI 去噪上的实验表明，相对竞争方法取得了一致改进。

## 1 引言

从含噪测量中恢复高质量图像是科学成像中的一项基本挑战（Zhu et al., 2018）。在高光谱成像（HSI）与磁共振成像（MRI）等模态中，噪声会降低图像质量并遮蔽重要结构。然而，干净的参考图像往往难以获取，这限制了用于监督式端到端复原的成对含噪—干净数据的可得性。交替方向乘子法（alternating direction method of multipliers, ADMM）提供了一个基于模型的框架，把观测保真与解析先验结合起来（Boyd et al., 2011）。为描述 ADMM 表述，令 \(A\) 表示图像，\(f(A)\) 表示数据保真项。引入辅助变量 \(V\) 可得：

$$
\min_{A,V}\;f(A)+\lambda\Psi(V)\quad\mathrm{s.t.}\quad A=V.\tag{1}
$$

这里 \(\Psi\) 是解析正则化项，\(\lambda>0\) 控制其强度。借助缩放对偶变量 \(U\) 与惩罚参数 \(\rho>0\)，ADMM 执行如下更新：

$$
\begin{aligned}
A^{k+1}&=\mathrm{prox}_{f/\rho}\left(V^k-U^k\right)=\arg\min_A\;f(A)+\frac{\rho}{2}\left\|A-V^k+U^k\right\|_2^2,\\
C^k&=A^{k+1}+U^k,\qquad V^{k+1}=\mathcal T_k\left(C^k\right),\qquad U^{k+1}=U^k+A^{k+1}-V^{k+1}.
\end{aligned}\tag{2}
$$

在这些更新中，\(C^k\) 表示 **ADMM 去噪器输入**，它把数据更新与对偶反馈结合起来；\(\mathcal T_k\) 表示解析先验算子。基于 ADMM 的 PnP 方法把这一解析先验算子替换为去噪算子 \(\mathcal C_k\)，得到 \(V^{k+1}=\mathcal C_k(C^k)\)（Venkatakrishnan et al., 2013）。

基于扩散的 PnP 方法与 ADMM 变体通常使用在自然 RGB 图像上预训练的扩散模型（Zhu et al., 2023; Wu et al., 2024; Zhang et al., 2025; Shrestha & Fu, 2026）。图 1(a) 展示了预训练扩散模型如何在 ADMM 内提供先验更新。把这类先验应用到科学成像会引入两种不同的失配，如图 1(b) 所示。第一，自然 RGB 图像在图像统计与表示上不同于科学图像，造成**预训练域与目标域之间的失配**。因此，把这些先验适配到高光谱成像与 MRI 等模态可能需要额外的表示或模型适配（Pang et al., 2024; Xiao et al., 2025; Gao & Zhou, 2024）。第二，即使在**同一模态内**，ADMM 去噪器输入也未必服从用于训练分数模型的高斯扰动分布，因为它们还反映对偶反馈与依赖求解器的误差。AC–DC 通过噪声注入与条件 Langevin 修正，把求解器输入适配到预训练分数模型，从而缓解这一失配（Shrestha & Fu, 2026）。这启发了另一个互补方向：直接从观测导出的 ADMM 状态中学习分数修正，使其统计特性在不依赖外部预训练模型的情况下为先验更新提供信息。

**图 1（原文 Fig. 1）：** 在科学成像中使用预训练图像先验时的两类失配来源：预训练域与目标图像域之间的差异，以及分数模型训练输入与 ADMM 去噪器输入之间的差异。图中 (a) 预训练扩散先验用于 PnP-ADMM：数据一致性更新（\(A^{k+1}=\mathrm{prox}_{f/\rho}(V^k-U^k)\)）、先验更新（\(V^{k+1}=\mathcal C_k(C^k)\)）与对偶更新（\(U^{k+1}=U^k+A^{k+1}-V^{k+1}\)）交替 \(K\) 次，把含噪 RGB 图像复原为去噪 RGB 图像；(b) 域失配与求解器输入失配：预训练扩散模型在 RGB 域训练，而目标域为科学图像域；分数模型以高斯扰动输入训练，而 ADMM 去噪器输入与之不同。

为应对科学图像复原中的这些失配，我们针对**没有域匹配预训练先验**的场景引入 S³-PnP。该框架在测试时从由可用观测生成的 ADMM 去噪器输入中学习一个自监督分数近似。所学分数修正解析先验更新的输入，把观测适配的状态统计与解析正则化结合起来。训练既不需要干净目标，也不需要外部预训练权重。在匹配的二次去噪模型与理想分数修正下，我们建立修正后 ADMM 迭代收敛的充分条件，并证明其期望重建误差低于匹配的解析 ADMM 基线。由于结构化干扰可能进入所学状态统计，一种结构引导的学习策略把互补的正交投影与顺序训练结合起来。我们在参考引导 HSI 复原、单图 HSI 去噪与 MRI 去噪上评估 S³-PnP。我们的贡献是：

- **自监督分数先验学习。** 面向科学图像复原，S³-PnP 在测试时从 ADMM 状态中学习分数修正，以修改解析先验的输入。训练既不需要干净目标，也不需要外部预训练权重。
- **收敛性与重建误差分析。** 我们在理想分数与二次数据保真的假设下，建立 S³-PnP 收敛、并取得比匹配解析 ADMM 更低的期望重建误差的充分条件。
- **互补正交子空间中的分数学习。** 我们在互补正交子空间中学习并独立控制分数修正，从而可以分开处理与结构化干扰相关的修正。

## 2 相关工作

**图像复原中的即插即用与生成先验。** PnP 把去噪器与观测模型更新结合起来（Venkatakrishnan et al., 2013）；后续分析覆盖不动点收敛、Lipschitz 条件与近端去噪器构造（Chan et al., 2017; Ryu et al., 2019; Hurault et al., 2022）。对 RGB 复原，DDRM 使用线性观测算子的谱分解（Kawar et al., 2022），DDNM 使用值域—零空间分解来施加数据一致性（Wang et al., 2023）。DPS 与 ΠGDM 通过近似测量似然引导扩散采样（Chung et al., 2023; Song et al., 2023）。DiffPIR 把扩散去噪与半二次分裂结合起来（Zhu et al., 2023），PnP-DM 使用分裂 Gibbs 采样进行似然与先验更新（Wu et al., 2024）。PnP-Flow 由预训练流匹配模型构造随时间变化的去噪器（Martin et al., 2025），CM4IR 使用一致性模型做少步复原（Garber & Tirer, 2025）。ADMMDiff 在 ADMM 内协调生成先验与引导（Zhang et al., 2025）。对非 RGB 成像，PLRDiff 与 HIR-Diff 使用低维光谱表示，把预训练的三通道扩散先验用于 HSI 复原（Rui et al., 2024; Pang et al., 2024）。DM-ZS 从 PAN 与低分辨率 HSI 观测中学习引导与光谱映射，用预训练 RGB 扩散模型完成全色锐化（Xiao et al., 2025）。对 MRI 重建，Chung & Ye (2022) 把 MRI 训练的分数先验与数据一致性更新结合起来，DDS 则把扩散采样与共轭梯度更新耦合（Chung et al., 2024）。MRPD 把自然图像潜扩散先验迁移到 MRI，并可选地适配自编码器（Gao & Zhou, 2024），PnP-CM 把 MRI 训练的一致性模型纳入 PnP-ADMM（Gülle et al., 2026）。我们的框架把学习型分数修正与 ADMM 内的解析先验更新结合起来。修正作用于先验输入，从而使学习到的信息补充解析正则化。

**自监督先验学习与适配。** 自监督学习与先验适配用于应对干净监督有限、以及与目标复原问题失配的问题。Shoushtari et al. (2024) 分析 PnP-ADMM 中的去噪器失配，并研究使用目标域样本进行适配。AC–DC 通过高斯噪声注入与条件 Langevin 修正，处理预训练分数模型与由对偶反馈塑造的 ADMM 输入之间的失配（Shrestha & Fu, 2026）。为在无干净目标下学习，Noise2Self 利用噪声独立性与掩码预测构造自监督损失（Batson & Royer, 2019）。对分数估计，DSM 把基于扰动的去噪回归与分布分数联系起来（Vincent, 2011）。Noise2Score 学习含噪图像分布的分数，并使用 Tweedie 公式做复原（Kim & Ye, 2021），C2S 则对进一步污染的观测引入广义去噪分数匹配以用于 MRI 去噪（Tu et al., 2025）。直接从待复原的观测中学习，是降低外部数据需求的另一条途径。ZS-N2N 在来自单张含噪图像的下采样对上训练轻量网络（Mansour & Heckel, 2023），DDS2M 仅使用退化 HSI，在逆向扩散过程中优化空间与光谱网络（Miao et al., 2023）。对扩散 MRI，DDM2 在三阶段框架中把统计去噪与生成式扩散结合起来（Xiang et al., 2023）；Di-Fusion 在单阶段自监督框架中使用较晚的扩散步与自适应采样（Wu et al., 2025）。我们在测试时从由可用观测生成的 ADMM 状态中学习分数修正。这些修正修改解析先验更新的输入，在不需要外部预训练权重的前提下把观测驱动学习与解析正则化结合起来。

## 3 方法

### 3.1 由 ADMM 迭代出发的自监督分数近似

ADMM 中的解析先验捕捉低秩、稀疏等结构，但可能无法完整描述优化过程中生成的去噪器输入的统计特性。这些统计可以补充解析正则化，帮助在保持图像内容的同时抑制噪声。因此，S³-PnP 从由当前观测生成的 ADMM 去噪器输入中学习一个隐式正则化修正。我们通过自监督分数回归估计该修正，且不使用外部预训练权重，并在解析先验更新之前施加它。

**自监督分数学习。** 首先，我们运行带有解析先验更新的式 (2)，并把去噪器输入 \(C^k=A^{k+1}+U^k\) 收集到训练集 \(\mathcal B\) 中，以捕捉依赖观测的状态统计。每个状态 \(C\in\mathcal B\) 被归一化为 \(Z=\mathcal S(C)=(C-m)/s\)，其中固定中位数 \(m\) 与正尺度 \(s\) 由 \(\mathcal B\) 估计。然后构造扰动状态 \(Z_t=Z+\sqrt{\Delta_t}\epsilon\)，其中 \(\epsilon\sim\mathcal N(0,I)\) 与 \(Z\) 独立，\(\Delta_t>0\) 为人工扰动方差。为了从这些状态统计中构造修正方向，令 \(p_t\) 表示 \(Z_t\) 的密度，并定义状态能量 \(R_t(z)=-\log p_t(z)\)。扰动状态分布的分数即其对数密度梯度 \(\nabla_z\log p_t(z)=-\nabla_z R_t(z)\)，它提供反映参考状态统计的修正方向。由于 \(p_t\) 未知，我们使用收集到的状态及其人工扰动，通过自监督回归估计该分数。具体而言，我们建立在广义去噪分数匹配（generalized denoising score matching, GDSM）的回归原理之上（Tu et al., 2025）。下面的引理建立其最优复原预测器与状态分数之间的关系，为在无干净训练目标的情况下学习所需修正提供基础。

**引理 1。** 在上述状态构造与固定归一化下，假设 \(\mathbb E\|Z\|^2<\infty\)。对固定的 \(t\) 与 \(\kappa_t>\Delta_t>0\)，考虑 GDSM 插值损失

$$
\mathcal L_{\mathrm{GDSM}}\left(\widehat Z;t\right)=\mathbb E\left\|\frac{\Delta_t}{\kappa_t}\widehat Z(Z_t,t)+\left(1-\frac{\Delta_t}{\kappa_t}\right)Z_t-Z\right\|^2.\tag{3}
$$

其在平方可积复原预测器上的最小元几乎必然满足

$$
\widehat Z^{\star}(Z_t,t)=Z_t+\kappa_t s_t^{\star}(Z_t),\tag{4}
$$

其中 \(s_t^{\star}=\nabla\log p_t=-\nabla R_t\)。此外，\(\mathbb E[Z\mid Z_t]=Z_t+\Delta_t s_t^{\star}(Z_t)\)。若进一步有 \(Z=Z_0+\sigma_0\epsilon_0\)，其中 \(Z_0\) 表示归一化坐标下的底层干净状态，\(\sigma_0>0\)，\(\epsilon_0\sim\mathcal N(0,I)\)，且 \(Z_0,\epsilon_0,\epsilon\) 相互独立，则取 \(\kappa_t=\sigma_0^2+\Delta_t\) 可得 \(\widehat Z^{\star}(Z_t,t)=\mathbb E[Z_0\mid Z_t]\)。证明见附录 A.1。

为了直接学习状态分数，我们把复原预测器参数化为式 (4) 中的 \(\widehat Z_\theta(Z_t,t)=Z_t+\kappa_t s_\theta(Z_t,t)\)，其中 \(\theta\) 表示修正网络的可训练参数。当跨扰动水平训练共享网络时，回归误差尺度的差异会影响它们对优化的相对贡献。因此，我们对缩放后的修正误差使用依赖噪声水平的归一化，并把所得目标表述为加权分数回归。对固定的 \(t\)，在任务特定的输出处理之前，GDSM 插值损失满足

$$
\mathcal L_{\mathrm{GDSM}}\left(\widehat Z_\theta;t\right)=\frac{\Delta_t^2}{w(t)}\mathcal L_{\mathrm{score}}(\theta;t)=\frac{\Delta_t^2}{w(t)}\mathbb E\left[w(t)\left\|s_\theta(Z_t,t)-\Delta_t^{-1}(Z-Z_t)\right\|^2\right].\tag{5}
$$

这里 \(w(t)=\kappa_t^2(N\gamma\sigma_t^2)^{-1}\)，其中 \(N\) 是每个样本的张量元素数，\(\gamma>0\) 控制损失尺度，\(\sigma_t>1\) 指定扰动水平。对每个固定的 \(t\)，因子 \(\Delta_t^2/w(t)\) 为正且与 \(\theta\) 无关，因此在这套参数化下两个目标共享同一最小元。训练使用在采样扰动水平上平均的 \(\mathcal L_{\mathrm{score}}\)，其中 \(w(t)\) 决定它们的相对权重。

随后我们用所学分数修正解析先验更新的输入。取 \(Z=\mathcal S(C)\)，修正后的算子为

$$
\mathcal C_k(C)=\mathcal T_k\left(\mathcal S^{-1}\left[Z+\beta_k\kappa_{t_k}s_\theta\left(Z,t_k\right)\right]\right).\tag{6}
$$

这里 \(\beta_k\ge0\) 控制修正强度，\(\kappa_{t_k}\) 是引理 1 引入的分数缩放系数，\(t_k\) 指定平滑水平，\(\mathcal T_k\) 是解析先验更新。对理想分数，\(s_{t_k}^{\star}=-\nabla R_{t_k}\)，因此修正是归一化坐标下状态能量上的梯度步。令 \(\beta_k=0\) 即恢复式 (2) 中的解析 ADMM 求解器。我们把带有自监督分数修正的 ADMM 框架称为 S³-PnP。

**收敛性与重建误差。** 接下来，我们建立使修正后 ADMM 算法收敛、且其极限估计具有比解析 ADMM 更低的期望重建误差的充分条件。该分析假设匹配的统计模型、理想分数、固定算子与正定二次保真。

**定理 1（二次保真下的收敛性与误差改善）。** 在引理 1 的干净状态与矩假设下，令 \(A_0=\mathcal S^{-1}(Z_0)\)、\(Y=\mathcal S^{-1}(Z_t)\)。考虑采用固定惩罚 \(\rho>0\)、\(H=H^*\succ0\) 与 \(f(A)=\frac12\langle A-Y,H(A-Y)\rangle\) 的 ADMM。对 \(\beta_k\equiv\beta\in[0,1]\)，使用 \(V^{k+1}=\mathcal T(C^k+\beta d_t(C^k))\)，其中理想修正 \(d_t(C)=\kappa_t s\odot s_t^{\star}(\mathcal S(C))\) 是 \(L\)-Lipschitz 的。令 \(r_H=\max_j\left|(\rho-\lambda_j(H))/(\rho+\lambda_j(H))\right|\)，其中 \(\lambda_j(H)>0\) 为 \(H\) 的特征值。

**(i) 收敛性。** 令 \(C_\beta^k=A_\beta^{k+1}+U_\beta^k\) 表示修正强度为 \(\beta\) 时第 \(k\) 次迭代的 ADMM 去噪器输入。若 \(r_H(1+2\beta L)<1\)，则迭代从任意有限初始化收敛，并满足

$$
\left\|C_\beta^k-C_\beta^{\star}\right\|\le q_\beta^k\left\|C_\beta^0-C_\beta^{\star}\right\|,\tag{7}
$$

其中 \(C_\beta^{\star}\) 是去噪器输入迭代的唯一不动点，且 \(q_\beta=\frac12[1+r_H(1+2\beta L)]<1\)。记原始迭代 \(A_\beta^k\) 与 \(V_\beta^k\) 的公共极限为 \(A_\beta^{\star}\)。

**(ii) 误差改善。** 在同一稳定性条件下，额外假设对所有 \(Q\) 有 \(\|\mathcal T(Q)-Q\|\le b\)，其中 \(b\ge0\)。令 \(a_t=\left(\mathbb E\left\|Y-\mathbb E[A_0\mid Y]\right\|^2\right)^{1/2}\)，其中 \(\delta_\beta\)、\(c_\beta\) 与 \(b_H\) 在附录 A.2 中定义。对 \(\beta>0\)，若 \(\delta_\beta<1\) 且 \(c_\beta a_t+b_H/(1-\delta_\beta)<a_t-b_H\)，则

$$
\mathbb E\left\|A_\beta^{\star}-A_0\right\|^2<\mathbb E\left\|A_{\mathrm{off}}^{\star}-A_0\right\|^2.\tag{8}
$$

这里 \(A_{\mathrm{off}}^{\star}\) 是式 (2) 中解析 ADMM 求解器的收敛估计，通过令 \(\beta=0\) 同时保持数据项、解析映射与惩罚不变而得到。

附录 A.2 给出其余常数与证明。我们进一步在第 4.4 节与附录 C.1 中通过受控实验检验关于收敛性与重建误差的理论预测。在实际成像中，结构化干扰可能残留在参考状态中并反映到所学分数里。因此，我们在第 3.2 节引入结构引导的分数修正。

### 3.2 自监督分数学习与 S³-PnP 推理

上一小节描述了状态分数如何修正解析先验更新的输入。这里我们解释如何学习这些修正，遵循图 2 中的两种流程：**全空间学习**与**结构引导学习**。全空间学习在整个空间上估计修正，而结构引导学习分别控制与结构化干扰相关的修正分量。对全空间学习，我们使用更下方的模块，取 \(P_s=0\)、\(P_g=I\)、\(\beta_s=0\)。训练首先运行不带学习修正的解析 ADMM，把去噪器输入 \(C^k=A^{k+1}+U^k\) 收集到状态训练集 \(\mathcal B_0\) 中。然后利用这些状态及其人工扰动，通过自监督训练全空间网络 \(D_g\)，如算法 1 所总结。训练完成后，我们在推理期间冻结该网络，并在解析先验更新之前把其修正加到当前状态上。

然而，结构化干扰（例如高光谱图像中的列条纹）可能残留在用于全空间学习的 ADMM 状态中并影响所学分数。为了分别控制与条纹相关的修正，我们利用成像知识构造一个与列条纹相关的子空间及其正交补。这两个子空间由正交投影器 \(P_s\) 与 \(P_g=I-P_s\) 表示，满足 \(P_s+P_g=I\) 与 \(P_sP_g=0\)。随后两个修正分量被分别学习，其强度独立调节。对固定的参考状态分布，令 \(s^{\star}\) 表示理想分数诱导的修正，并定义 \(s_i^{\star}=P_is^{\star}\)（\(i\in\{s,g\}\)）。于是修正分解为

$$
s^{\star}=P_ss^{\star}+P_gs^{\star}=s_s^{\star}+s_g^{\star}.\tag{9}
$$

投影器的构造详见附录 B.4。对结构引导学习，我们使用两个轻量条件 U-Net \(D_s\) 与 \(D_g\)，它们架构相同、参数 \(\theta_s\) 与 \(\theta_g\) 独立。遵循图 2 中的橙色路径，我们首先在由解析 ADMM 生成的状态训练集 \(\mathcal B_0\) 上训练结构网络 \(D_s\)。然后冻结该网络并重新运行启用了其修正的 ADMM，以收集用于训练互补网络 \(D_g\) 的新状态训练集 \(\mathcal B_1\)。两个阶段使用各自固定的归一化与参考状态分布。我们用如下自监督目标训练每个网络：

$$
\mathcal L_i=\mathcal L_{\mathrm{score},i}+\lambda_{\mathrm{aux}}\mathcal L_{\mathrm{aux},i},\qquad i\in\{s,g\},\tag{10}
$$

其中分数回归项遵循式 (5)，任务特定的输出处理与辅助损失见附录 B。在推理期间，网络、归一化与部署投影器保持固定。各活动网络处理相同的 ADMM 输入 \(C^k\)。令 \(s_i(C^k,t_k;\theta_i)\) 表示经过重缩放、输出处理与 \(P_i\) 投影之后、在原坐标下的学习修正。分数缩放因子 \(\kappa_{t_k}\) 已包含在 \(s_i\) 中。当 \(\beta_i=0\) 时，分支 \(i\) 被跳过，其修正置零。如图 2 右侧所示，这些修正会在单次解析先验更新之前合并：

$$
V^{k+1}=\mathcal T_k\left(C^k+\beta_ss_s\left(C^k,t_k;\theta_s\right)+\beta_gs_g\left(C^k,t_k;\theta_g\right)\right).\tag{11}
$$

这里 \(\beta_s,\beta_g\ge0\) 控制修正强度，而数据更新与对偶更新遵循式 (2)。把两个增益都置零即恢复匹配的解析 ADMM 求解器。算法 2 与算法 3 分别总结顺序训练与统一推理。

**图 2（原文 Fig. 2）：** S³-PnP 的训练与推理。紫色箭头表示全空间学习（\(P_s=0\)、\(P_g=I\)、\(\beta_s=0\)）；橙色箭头表示结构引导学习：先训练并冻结 \(D_s\)，启用其修正以收集新的状态训练集，再训练 \(D_g\)。推理时，各活动修正在同一 ADMM 输入上评估，并在单次解析先验更新之前合并。雪花标记表示被冻结的网络。图中左侧为训练阶段：由任务特定的含噪观测运行 ADMM 迭代，收集测试时训练集与 ADMM 迭代状态，进行自监督分数学习；右侧为推理阶段：S³-PnP 先验更新把数据更新、对偶更新与 \(D_s\)、\(D_g\) 的修正结合，得到 \(V^{k+1}=\mathcal T_k(C^k+\beta_ss_s(C^k)+\beta_gs_g(C^k))\)。

**算法 1：LEARNSCORE(\(\mathcal B,i\))**

**输入：** 状态训练集 \(\mathcal B\)、分支 \(i\)、\(M\)

1. 初始化 \(\theta_i\)
2. **for** \(n=1,\ldots,M\) **do**
3. \(\quad\) 从 \(\mathcal B\) 采样 \(Z\)，采样 \(t\)、\(\epsilon\sim\mathcal N(0,I)\)
4. \(\quad Z_t\leftarrow Z+\sqrt{\Delta_t}\epsilon\)
5. \(\quad w(t)\leftarrow\kappa_t^2(N\gamma\sigma_t^2)^{-1}\)
6. \(\quad\mathcal L_i\leftarrow\mathcal L_{\mathrm{score},i}+\lambda_{\mathrm{aux}}\mathcal L_{\mathrm{aux},i}\)
7. \(\quad\theta_i\leftarrow\mathrm{Adam}\left(\theta_i,\nabla_{\theta_i}\mathcal L_i\right)\)
8. **end for**
9. **return** \(\theta_i\)

**算法 2：结构引导训练**

**输入：** 可见观测、\(P_s\)、\(P_g=I-P_s\)、\(\beta_s>0\)

1. 通过式 (11) 运行 ADMM，\(\beta_s=\beta_g=0\)
2. \(\mathcal B_0\leftarrow\{C^k\}_{k\in K}\)
3. \(\theta_s\leftarrow\mathrm{LEARNSCORE}(\mathcal B_0,s)\) ▷ 算法 1
4. 冻结 \(\theta_s\)
5. 用 \(\theta_s\)、\(\beta_g=0\) 通过式 (11) 重新运行 ADMM
6. \(\mathcal B_1\leftarrow\{C^k\}_{k\in K}\)
7. \(\theta_g\leftarrow\mathrm{LEARNSCORE}(\mathcal B_1,g)\) ▷ 算法 1
8. **return** \((\theta_s,\theta_g)\)

**算法 3：S³-PnP 推理**

**输入：** 含噪观测、\(\{\theta_i,\beta_i\}_{i\in\{s,g\}}\)、\(P_s\)、\(\rho\)、\(K\)、\(\{t_k\}\)

1. 初始化 \(V^0\)、\(U^0\)、\(f\) 与 \(\mathcal T_k\)
2. **if** 全空间修正 **then**
3. \(\quad P_s\leftarrow0\)，\(P_g\leftarrow I\)，\(\beta_s\leftarrow0\)
4. \(\quad\) 冻结 \(\theta_g\) ▷ 算法 1
5. **else**
6. \(\quad\) 固定 \(P_s\)；\(P_g\leftarrow I-P_s\)
7. \(\quad\) 冻结 \((\theta_s,\theta_g)\) ▷ 算法 2
8. **end if**
   ▷ 已训练参数保持固定
9. **for** \(k=0,\ldots,K-1\) **do**
10. \(\quad A^{k+1}\leftarrow\mathrm{prox}_{f/\rho}\left(V^k-U^k\right)\)
11. \(\quad C^k\leftarrow A^{k+1}+U^k\)
12. \(\quad s_s^k\leftarrow0\)，\(s_g^k\leftarrow0\)
13. \(\quad\) **for** \(i\in\{s,g\}\) 且 \(\beta_i>0\) **do**
14. \(\quad\quad s_i^k\leftarrow s_i(C^k,t_k;\theta_i)\)
15. \(\quad\) **end for**
16. \(\quad V^{k+1}\leftarrow\mathcal T_k\left(C^k+\beta_ss_s^k+\beta_gs_g^k\right)\)
17. \(\quad U^{k+1}\leftarrow U^k+A^{k+1}-V^{k+1}\)
18. **end for**
19. **return** \(\widehat A=V^K\)

## 4 实验

我们在参考引导 HSI 复原、单图 HSI 去噪与 MRI 去噪上评估 S³-PnP。实验包括定量与定性比较、消融研究，以及针对理论预测的受控检验。

### 4.1 数据集与实验设置

**数据集与实验设置。** 我们在来自 HiPandas 的东营（Dongying）数据集（Xu et al., 2025）上评估参考引导高光谱复原，使用含噪低分辨率 HSI 作为输入、PAN 图像作为引导。对单图高光谱去噪，我们使用青浦（Qingpu）与雄安（Xiong'an），输入为单张含噪 HSI。两种任务都在不同强度水平的高斯噪声与混合噪声下评估。MRI 去噪在 BrainWeb 的官方 3%、5% 与 7% 噪声水平上评估，并在 M4Raw 上使用全部 25 个测试受试者的含噪采集图像评估。对所有没有预训练权重的基于学习的方法，自监督训练在测试时仅使用含噪测试观测进行。数据集与实现细节见附录 B.5。我们对所有任务报告 PSNR 与 SSIM，并针对两个高光谱任务补充 SAM 与 ERGAS；PSNR/SSIM 越高、SAM/ERGAS 越低表示性能越好。

**基线。** 对参考引导高光谱复原，我们沿用 UHiPandas 的基线设置（Xu et al., 2025）。比较对象包括 UHiPandas，以及由 R-PNN（Guarino et al., 2024）、HIR-Diff（Pang et al., 2024）、PWRCTV（Xu et al., 2024）、PLRDiff（Rui et al., 2024）与 SwinIR（Liang et al., 2021）构成的级联流程。对单图高光谱去噪，基线包括 BM4D（Maggioni et al., 2013）、HLRTF（Luo et al., 2022）、RCTV（Peng et al., 2022）、DDS2M（Miao et al., 2023）、LRTFR（Luo et al., 2024）、HIR-Diff（Pang et al., 2024）与 CF-INR（Yu et al., 2026）。对 MRI 去噪，基线包括 Noise2Self（Batson & Royer, 2019）、Noise2Void（Krull et al., 2019）、Noisier2Noise（Moran et al., 2020）、R2R（Pang et al., 2021）、Noise2Score（Kim & Ye, 2021）、ZS-N2N（Mansour & Heckel, 2023）、C2S（Tu et al., 2025）与 DRDD（Lin et al., 2026）。在我们的比较中，HIR-Diff、PLRDiff 与 DRDD 使用预训练扩散权重，DDS2M 在逆向扩散期间执行自监督学习，C2S 则通过广义去噪分数匹配训练去噪预测器。

### 4.2 定量与定性结果

**定量比较。** 表 1–3 与附录 C.2 汇总了三个复原任务的结果。对参考引导 HSI 复原，S³-PnP 在两个噪声组中都取得优于所比较级联方法与 UHiPandas 的平均复原性能，并在混合噪声下改善了光谱保真度。类似地，对青浦上的单图 HSI 去噪，它在高斯与混合噪声下都优于所报告的基线。对 MRI 去噪，S³-PnP 在全部三个 BrainWeb 噪声水平上都取得所报告的最佳平均性能。在 M4Raw 上，S³-PnP 仅在测试时学习，取得了与预训练 C2S 相当的结果。S³-PnP 总体上优于所评估的预训练扩散方法与自监督扩散方法。

**表 1（原文 Table 1）：** 东营数据集上的参考引导 HSI 复原。粗体为最优、下划线为次优。“高斯均值”与“混合均值”分别为该类条件下的平均值。

| 方法 | PSNR↑ | SSIM↑ | SAM↓ | ERGAS↓ | PSNR↑ | SSIM↑ | SAM↓ | ERGAS↓ |
|---|---|---|---|---|---|---|---|---|
| **高斯均值** | | | | | **混合均值** | | | |
| R-PNN + HIR-Diff | 30.83 | 0.7226 | 8.80 | 22.55 | 29.83 | 0.7139 | 11.44 | 31.40 |
| HIR-Diff + SwinIR | 32.42 | 0.7431 | 7.00 | 19.42 | 29.76 | 0.6776 | 11.33 | 34.18 |
| HIR-Diff + R-PNN | 35.32 | 0.9199 | 6.08 | 15.35 | 33.12 | 0.8995 | 9.75 | <u>29.67</u> |
| PWRCTV + PLRDiff | 36.13 | 0.8675 | 6.23 | 21.54 | 32.76 | 0.7747 | 13.59 | 153.69 |
| PWRCTV + SwinIR | 35.55 | 0.8773 | 4.66 | 14.65 | 33.80 | 0.8403 | 9.90 | 160.43 |
| UHiPandas | <u>38.24</u> | <u>0.9368</u> | <u>4.05</u> | <u>10.87</u> | <u>37.17</u> | <u>0.9294</u> | <u>7.10</u> | 32.91 |
| S³-PnP（本文） | **39.75** | **0.9497** | **3.45** | **9.20** | **38.38** | **0.9438** | **4.53** | **11.24** |

**表 2（原文 Table 2）：** 青浦上的单图 HSI 去噪。粗体为最优、下划线为次优。

| 方法 | PSNR↑ | SSIM↑ | SAM↓ | ERGAS↓ | PSNR↑ | SSIM↑ | SAM↓ | ERGAS↓ |
|---|---|---|---|---|---|---|---|---|
| **高斯均值** | | | | | **混合均值** | | | |
| BM4D | 33.95 | 0.8214 | 3.61 | 9.18 | 24.56 | 0.4833 | 17.50 | 68.67 |
| HLRTF | 34.94 | 0.7733 | 3.07 | 8.97 | 31.23 | 0.7944 | 27.69 | 117.96 |
| RCTV | 28.59 | 0.5180 | 7.34 | 19.50 | 34.01 | 0.8741 | 5.49 | 16.13 |
| DDS2M | 39.97 | 0.9504 | 1.40 | 4.21 | 29.79 | 0.8536 | 13.12 | 53.51 |
| LRTFR | 37.24 | 0.9020 | 1.78 | 6.17 | 30.84 | 0.8442 | 27.00 | 114.55 |
| HIR-Diff | 38.47 | 0.9157 | 1.68 | 4.85 | 29.06 | 0.8260 | 13.20 | 55.59 |
| CF-INR | <u>40.32</u> | <u>0.9541</u> | <u>1.36</u> | <u>4.01</u> | <u>35.86</u> | <u>0.9339</u> | <u>2.62</u> | <u>8.50</u> |
| S³-PnP（本文） | **40.47** | **0.9562** | **1.33** | **3.95** | **37.88** | **0.9433** | **1.89** | **5.34** |

**表 3（原文 Table 3）：** MRI 去噪。粗体为最优、下划线为次优。左半为 BrainWeb 三个噪声水平，右半为 M4Raw 三个对比度。

| 方法 | 3% PSNR | 3% SSIM | 5% PSNR | 5% SSIM | 7% PSNR | 7% SSIM | T1 PSNR | T1 SSIM | T2 PSNR | T2 SSIM | FLAIR PSNR | FLAIR SSIM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Noise2Self | 31.22 | 0.8613 | 30.40 | 0.8396 | 29.49 | 0.7952 | 29.10 | 0.8537 | 28.17 | 0.8095 | 28.94 | 0.8150 |
| Noise2Void | 32.11 | 0.8810 | 30.40 | <u>0.8522</u> | 29.23 | 0.8110 | 31.24 | 0.8671 | 30.45 | 0.8392 | 30.80 | 0.8288 |
| Noisier2Noise | 34.38 | 0.8964 | 31.37 | 0.8341 | 28.90 | 0.7410 | 31.18 | 0.8675 | 30.55 | 0.8435 | 31.17 | 0.8356 |
| R2R | 34.02 | 0.8011 | 32.03 | 0.7879 | 29.50 | 0.7292 | 30.82 | 0.8552 | 30.48 | 0.8329 | 30.97 | 0.8187 |
| Noise2Score | 34.47 | 0.8405 | 29.95 | 0.7621 | 26.85 | 0.7133 | 31.23 | 0.8444 | 30.48 | 0.8139 | 31.00 | 0.7975 |
| ZS-N2N | 32.63 | 0.7768 | 28.73 | 0.7165 | 26.07 | 0.6749 | 31.66 | 0.8922 | 30.96 | 0.8729 | 31.89 | 0.8765 |
| C2S | <u>35.21</u> | <u>0.9287</u> | <u>33.30</u> | 0.8504 | <u>31.88</u> | <u>0.8173</u> | <u>32.61</u> | <u>0.9152</u> | <u>32.30</u> | <u>0.8880</u> | **33.02** | 0.8792 |
| DRDD | 35.03 | 0.8188 | 30.70 | 0.7581 | 27.83 | 0.7233 | 32.43 | 0.9108 | 31.44 | 0.8770 | 32.60 | <u>0.8797</u> |
| S³-PnP（本文） | **37.47** | **0.9568** | **34.65** | **0.9413** | **32.72** | **0.9279** | **32.69** | **0.9165** | **32.31** | **0.8922** | <u>32.83</u> | **0.8906** |

**定性比较。** 图 3 给出三个复原任务的视觉比较。对东营上的参考引导 HSI 复原，S³-PnP 恢复了更清晰的空间边界与更接近参考的颜色，而若干级联方法出现颜色偏移或残余伪影。对青浦上的单图 HSI 去噪，它在抑制噪声的同时保留了精细空间结构，而一些竞争方法留下可见噪声或模糊局部细节。在 BrainWeb 与 M4Raw 上，它在保留组织边界与局部解剖结构的同时降低了噪声。放大区域突出了噪声抑制与细节保持上的这些差异，误差图则揭示了与参考之间仍存在的差异。

**图 3（原文 Fig. 3）：** Dongying（GNI）、Qingpu（G50）、BrainWeb（T1，7% 噪声）与 M4Raw（T1）上的定性比较，自上而下排列。每幅重建图下方给出放大区域及相应的误差图。

### 4.3 消融研究

**所学修正的贡献。** 我们在相同先验设置下把每个训练配置与解析 ADMM 比较。解析参考使用初始的观测导出估计，网络权重在每个修正强度扫描期间保持固定。图 4(a)–(b) 显示在测试的 Dongying 网格上全程为正增益。在 BrainWeb 上，所有测试设置都在 7% 噪声下改善性能，而在较弱先验下的强修正可能在 3% 噪声下降低性能（(c)–(d)）。这些结果表明，学习修正可以改进解析 ADMM，但其强度应与解析先验和噪声水平联合选取。

**结构引导学习。** 我们在相同先验强度 \(\tau=0.105\) 下比较结构引导学习与全空间学习。结构引导配置在所有测试的修正乘数上取得更大增益（图 4(b)）。由于训练配置也不同，这一比较不能单独分离正交投影本身的贡献。

**图 4（原文 Fig. 4）：** 在相同先验设置下相对解析 ADMM 的 PSNR 增益，(a)–(b) 变化 \(\tau\)，(c)–(d) 变化 \(c\)。在 (b) 中，实线表示结构引导修正，虚线表示 \(\tau=0.105\) 下的全空间修正；横轴按各自的参考增益缩放。BrainWeb 结果为每种条件三个开发切片的平均。

### 4.4 与理论分析的一致性

我们用匹配的正定二次保真求解器与精确奇异值软阈值来检验定理 1。在宽谱保真下，被测修正加速了两个初始化之间轨迹归一化距离的经验衰减（图 5(a)）：在 \(\beta=1\) 时，距离在 44 次迭代内达到 \(10^{-10}\)，而解析 ADMM 需要 93 次。一些位于充分收缩区域之外的设置仍表现出衰减的距离，而超出定理范围的 \(\beta=4,8\) 产生增长的距离（(b)）。中等修正（\(\beta=0.25,0.5\)）在测试的先验强度上都降低重建误差，而更强的修正在强解析正则化下可能增加误差（(c)）。在近匹配保真下，满足改善条件的全部八个采样设置都取得高于正的理论下界的经验增益（(d)），与预测的改善一致，也说明该下界是保守的。这些结果支持在分数修正与解析正则化之间取得平衡。附录 C.1 给出跨维度的完整设置与结果。

**图 5（原文 Fig. 5）：** 使用 64×64 高斯状态与理想分数的受控实验。(a)–(c) 宽谱保真；(d) 近匹配保真，并给出误差降低的理论下界。相对先验强度 \(\gamma=b/a_t\) 在 (a)–(b) 中固定为 0.15，在 (d) 中为 0.1。(c)–(d) 中的阴影表示逐点 95% 置信区间。

## 5 结论

我们提出了 S³-PnP：一个面向科学图像复原的自监督 PnP-ADMM 框架。通过从由可用观测生成的 ADMM 状态中学习分数修正，该框架把先验学习与复原过程连接起来。这些修正改进解析先验更新的输入，在没有干净训练目标与外部预训练权重的情况下补充解析正则化。我们进一步在理想分数与二次数据保真下分析了修正后 ADMM 算法的收敛性与重建误差。借助任务特定的观测模型，该框架支持参考引导 HSI 复原、单图 HSI 去噪与 MRI 去噪。我们的工作为把观测驱动的分数学习与解析优化结合用于科学成像提供了一种通用途径。

## AI 使用声明

在本工作中，我们仅把生成式 AI 工具用于改进作者所写文本的语法、清晰度与可读性。生成式 AI 未被用于生成研究思路、提出假设或主张、设计方法或实验、实现方法、分析数据或解释结果。作者审阅了所有 AI 辅助修改，并对本工作的最终内容承担全部责任。

## 参考文献

（原文采用作者—年份制、未编号；本页按原文条目顺序编号 [1]–[46]，条目保留英文原文，DOI 照原文录入。）

[1] Joshua Batson and Loïc Royer. Noise2self: Blind denoising by self-supervision. In Proceedings of the 36th International Conference on Machine Learning, volume 97 of Proceedings of Machine Learning Research, pp. 524–533, 2019.

[2] Stephen Boyd, Neal Parikh, Eric Chu, Borja Peleato, and Jonathan Eckstein. Distributed optimization and statistical learning via the alternating direction method of multipliers. Foundations and Trends in Machine Learning, 3(1):1–122, 2011. doi: 10.1561/2200000016.

[3] Stanley H. Chan, Xiran Wang, and Omar A. Elgendy. Plug-and-play ADMM for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging, 3(1):84–98, 2017. doi: 10.1109/TCI.2016.2629286.

[4] Hyungjin Chung and Jong Chul Ye. Score-based diffusion models for accelerated MRI. Medical Image Analysis, 80:102479, 2022. doi: 10.1016/j.media.2022.102479.

[5] Hyungjin Chung, Jeongsol Kim, Michael T. McCann, Marc L. Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In International Conference on Learning Representations, 2023.

[6] Hyungjin Chung, Suhyeon Lee, and Jong Chul Ye. Decomposed diffusion sampler for accelerating large-scale inverse problems. In International Conference on Learning Representations, 2024.

[7] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011. doi: 10.1198/jasa.2011.tm11181.

[8] Ziqi Gao and S. Kevin Zhou. Mrpd: Undersampled mri reconstruction by prompting a large latent diffusion model. arXiv preprint arXiv:2402.10609, 2024.

[9] Tomer Garber and Tom Tirer. Zero-shot image restoration using few-step guidance of consistency models (and beyond). In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 2398–2407, 2025.

[10] Giuseppe Guarino, Matteo Ciotola, Gemine Vivone, and Giuseppe Scarpa. Band-wise hyperspectral image pansharpening using CNN model propagation. IEEE Transactions on Geoscience and Remote Sensing, 62:1–18, 2024. doi: 10.1109/tgrs.2023.3339337.

[11] Merve Gülle, Junno Yun, Yaşar Utku Alçalar, and Mehmet Akçakaya. PnP-CM: Consistency models as plug-and-play priors for inverse problems. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 38464–38474, 2026.

[12] Samuel Hurault, Arthur Leclaire, and Nicolas Papadakis. Proximal denoiser for convergent plug-and-play optimization with nonconvex regularization. In Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pp. 9483–9505, 2022.

[13] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems, volume 35, pp. 23593–23606, 2022. doi: 10.52202/068431-1714.

[14] Kwanyoung Kim and Jong Chul Ye. Noise2Score: Tweedie's approach to self-supervised image denoising without clean images. In Advances in Neural Information Processing Systems, volume 34, pp. 864–874, 2021.

[15] Alexander Krull, Tim-Oliver Buchholz, and Florian Jug. Noise2Void - learning denoising from single noisy images. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 2129–2137, 2019.

[16] Jingyun Liang, Jiezhang Cao, Guolei Sun, Kai Zhang, Luc Van Gool, and Radu Timofte. SwinIR: Image restoration using swin transformer. In Proceedings of the IEEE/CVF International Conference on Computer Vision Workshops, pp. 1833–1844, 2021.

[17] Ziyue Lin, Jiahe Hou, Hongyu Xia, Xinrui Xie, Feifei Wang, Yuyin Zhou, Wei Wang, Jiawei Liu, and Liangqiong Qu. Decoupled residual denoising diffusion models for unified and data efficient image-to-image translation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 35967–35977, 2026.

[18] Yisi Luo, Xi-Le Zhao, Deyu Meng, and Tai-Xiang Jiang. HLRTF: Hierarchical low-rank tensor factorization for inverse problems in multi-dimensional imaging. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 19303–19312, 2022.

[19] Yisi Luo, Xile Zhao, Zhemin Li, Michael K. Ng, and Deyu Meng. Low-rank tensor function representation for multi-dimensional data recovery. IEEE Transactions on Pattern Analysis and Machine Intelligence, 46(5):3351–3369, 2024. doi: 10.1109/TPAMI.2023.3341688.

[20] Matteo Maggioni, Vladimir Katkovnik, Karen Egiazarian, and Alessandro Foi. Nonlocal transform-domain filter for volumetric data denoising and reconstruction. IEEE Transactions on Image Processing, 22(1):119–133, 2013. doi: 10.1109/TIP.2012.2210725.

[21] Youssef Mansour and Reinhard Heckel. Zero-Shot Noise2Noise: Efficient image denoising without any data. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 14018–14027, 2023.

[22] Ségolène Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. PnP-Flow: Plug-and-play image restoration with flow matching. In International Conference on Learning Representations, pp. 45466–45492, 2025.

[23] Yuchun Miao, Lefei Zhang, Liangpei Zhang, and Dacheng Tao. DDS2M: Self-supervised denoising diffusion spatio-spectral model for hyperspectral image restoration. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pp. 12052–12062, 2023.

[24] Nick Moran, Dan Schmidt, Yu Zhong, and Patrick Coady. Noisier2Noise: Learning to denoise from unpaired noisy data. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 12061–12069, 2020. doi: 10.1109/cvpr42600.2020.01208.

[25] Li Pang, Xiangyu Rui, Long Cui, Hongzhong Wang, Deyu Meng, and Xiangyong Cao. HIR-Diff: Unsupervised hyperspectral image restoration via improved diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 3005–3014, 2024.

[26] Tongyao Pang, Huan Zheng, Yuhui Quan, and Hui Ji. Recorrupted-to-recorrupted: Unsupervised deep learning for image denoising. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 2043–2052, 2021.

[27] Jiangjun Peng, Hailin Wang, Xiangyong Cao, Xinling Liu, Xiangyu Rui, and Deyu Meng. Fast noise removal in hyperspectral images via representative coefficient total variation. IEEE Transactions on Geoscience and Remote Sensing, 60:1–17, 2022. doi: 10.1109/TGRS.2022.3229012.

[28] Xiangyu Rui, Xiangyong Cao, Li Pang, Zeyu Zhu, Zongsheng Yue, and Deyu Meng. Unsupervised hyperspectral pansharpening via low-rank diffusion model. Information Fusion, 107:102325, 2024. doi: 10.1016/j.inffus.2024.102325.

[29] Ernest K. Ryu, Jialin Liu, Sicheng Wang, Xiaohan Chen, Zhangyang Wang, and Wotao Yin. Plug-and-play methods provably converge with properly trained denoisers. In Proceedings of the 36th International Conference on Machine Learning, volume 97 of Proceedings of Machine Learning Research, pp. 5546–5557, 2019.

[30] Shirin Shoushtari, Jiaming Liu, Edward P. Chandler, M. Salman Asif, and Ulugbek S. Kamilov. Prior mismatch and adaptation in PnP-ADMM with a nonconvex convergence analysis. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 45154–45182, 2024.

[31] Rajesh Shrestha and Xiao Fu. Taming score-based denoisers in ADMM: A convergent plug-and-play framework. In International Conference on Learning Representations, pp. 13523–13568, 2026.

[32] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.

[33] Jiachen Tu, Yaokun Shi, and Fan Lam. Score-based self-supervised MRI denoising. In International Conference on Learning Representations, pp. 102262–102293, 2025.

[34] Singanallur V. Venkatakrishnan, Charles A. Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE Global Conference on Signal and Information Processing, pp. 945–948, 2013. doi: 10.1109/GlobalSIP.2013.6737048.

[35] Pascal Vincent. A connection between score matching and denoising autoencoders. Neural Computation, 23(7):1661–1674, 2011. doi: 10.1162/NECO_a_00142.

[36] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In International Conference on Learning Representations, 2023.

[37] Chenxu Wu, Qingpeng Kong, Zihang Jiang, and S. Kevin Zhou. Self-supervised diffusion MRI denoising via iterative and stable refinement. In International Conference on Learning Representations, pp. 98708–98747, 2025.

[38] Zihui Wu, Yu Sun, Yifan Chen, Bingliang Zhang, Yisong Yue, and Katherine L. Bouman. Principled probabilistic imaging using diffusion models as plug-and-play priors. In Advances in Neural Information Processing Systems, volume 37, pp. 118389–118427, 2024. doi: 10.52202/079017-3759.

[39] Tiange Xiang, Mahmut Yurt, Ali B. Syed, Kawin Setsompop, and Akshay Chaudhari. DDM2: Self-supervised diffusion MRI denoising with generative diffusion models. In International Conference on Learning Representations, 2023.

[40] Jin-Liang Xiao, Ting-Zhu Huang, Liang-Jian Deng, Guang Lin, Zihan Cao, Chao Li, and Qibin Zhao. Hyperspectral pansharpening via diffusion models with iteratively zero-shot guidance. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 12669–12678, 2025.

[41] Shuang Xu, Qiao Ke, Jiangjun Peng, Xiangyong Cao, and Zixiang Zhao. Pan-denoising: Guided hyperspectral image denoising via weighted represent coefficient total variation. IEEE Transactions on Geoscience and Remote Sensing, 62:1–14, 2024. doi: 10.1109/tgrs.2024.3450888.

[42] Shuang Xu, Zixiang Zhao, Haowen Bai, Chang Yu, Jiangjun Peng, Xiangyong Cao, and Deyu Meng. Hipandas: Hyperspectral image joint denoising and super-resolution by image fusion with the panchromatic image. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pp. 12002–12011, 2025.

[43] Chang Yu, Yisi Luo, Kai Ye, Xile Zhao, and Deyu Meng. Cross-frequency implicit neural representation with self-evolving parameters. IEEE Transactions on Pattern Analysis and Machine Intelligence, 48(8):9467–9485, 2026. doi: 10.1109/tpami.2026.3679791.

[44] Youyuan Zhang, Zehua Liu, Zenan Li, Zhaoyu Li, James J. Clark, and Xujie Si. Decoupling training-free guided diffusion by ADMM. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 23292–23302, 2025.

[45] Bo Zhu, Jeremiah Z. Liu, Stephen F. Cauley, Bruce R. Rosen, and Matthew S. Rosen. Image reconstruction by domain-transform manifold learning. Nature, 555(7697):487–492, 2018.

[46] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops, pp. 1219–1229, 2023.

## 附录 A 证明

### A.1 引理 1 的证明

**引理 1（ADMM 状态上的 GDSM 回归；重述）。** 令 \(C\) 为从固定参考训练分布中抽取的 ADMM 去噪器输入，并令 \(Z=\mathcal S(C)=(C-m)/s\)，其中逐通道中位数 \(m\) 与正尺度 \(s\) 由训练集估计并固定；\(/\) 表示逐元素除法。假设 \(\mathbb E\|Z\|^2<\infty\)。对固定的 \(t\)，构造 \(Z_t=Z+\sqrt{\Delta_t}\epsilon\)，其中 \(\Delta_t>0\)，\(\epsilon\sim\mathcal N(0,I)\) 与 \(Z\) 独立。令 \(p_t\) 表示 \(Z_t\) 的密度，并定义 \(R_t=-\log p_t\)。对 \(\kappa_t>\Delta_t\)，考虑 GDSM 插值损失（Tu et al., 2025）

$$
\mathcal L_{\mathrm{GDSM}}\left(\widehat Z;t\right)=\mathbb E\left\|\frac{\Delta_t}{\kappa_t}\widehat Z(Z_t,t)+\left(1-\frac{\Delta_t}{\kappa_t}\right)Z_t-Z\right\|^2.
$$

其在平方可积复原预测器上的最小元几乎必然满足

$$
\widehat Z^{\star}(Z_t,t)=Z_t+\kappa_t s_t^{\star}(Z_t),
$$

其中 \(s_t^{\star}=\nabla\log p_t=-\nabla R_t\)。此外，\(\mathbb E[Z\mid Z_t]=Z_t+\Delta_t s_t^{\star}(Z_t)\)。若进一步有 \(Z=Z_0+\sigma_0\epsilon_0\)，其中 \(\sigma_0>0\)、\(\epsilon_0\sim\mathcal N(0,I)\)，且 \(Z_0,\epsilon_0,\epsilon\) 相互独立，则取 \(\kappa_t=\sigma_0^2+\Delta_t\) 给出 \(\widehat Z^{\star}(Z_t,t)=\mathbb E[Z_0\mid Z_t]\)。对条件网络，所有密度、期望与独立性假设都理解为在同一辅助输入条件下的形式。

**证明。** 固定 \(t\)、参考分布与归一化，任何辅助输入全程保持固定。假设 \(\mathbb E\|Z\|^2<\infty\)，并令 \(Z_t=Z+\sqrt{\Delta_t}\epsilon\)，其中 \(\epsilon\sim\mathcal N(0,I)\) 与 \(Z\) 独立。我们首先刻画最优插值预测，然后利用 Tweedie 恒等式导出其分数表示，最后建立干净状态的条件均值解释。

*确定最优插值预测。* 考虑在所有平方可积复原预测器 \(\widehat Z\) 上的 GDSM 损失。由于 \(\Delta_t/\kappa_t>0\) 且 \(Z_t\) 平方可积，从复原预测到其插值的仿射变换在平方可积预测器类中可逆。因此，最小化 GDSM 损失等价于在平方误差下把插值预测回归到 \(Z\)。由最优平方误差回归的条件均值刻画，最小元满足

$$
\mathbb E[Z\mid Z_t]=\frac{\Delta_t}{\kappa_t}\widehat Z^{\star}(Z_t,t)+\left(1-\frac{\Delta_t}{\kappa_t}\right)Z_t.\tag{A.1}
$$

这确定了最优插值。接下来求解复原预测本身。

*导出最优预测的分数表示。* 令 \(p_t\) 表示 \(Z_t\) 的密度并定义 \(s_t^{\star}=\nabla\log p_t\)。对上述独立高斯扰动，Tweedie 恒等式（Efron, 2011）给出

$$
\mathbb E[Z\mid Z_t]=Z_t+\Delta_t s_t^{\star}(Z_t).\tag{A.2}
$$

把该恒等式代入式 (A.1) 并分离 \(\widehat Z^{\star}\)，得到

$$
\widehat Z^{\star}(Z_t,t)=\frac{\kappa_t}{\Delta_t}\mathbb E[Z\mid Z_t]-\left(\frac{\kappa_t}{\Delta_t}-1\right)Z_t=Z_t+\kappa_t s_t^{\star}(Z_t).\tag{A.3}
$$

因此，最优复原预测器取“输入加上缩放后的状态分数”的形式。这一形式来自最小化插值损失，并未预先强加分数参数化。进一步，定义 \(R_t=-\log p_t\) 给出 \(s_t^{\star}=-\nabla R_t\)，从而确立理想修正的状态能量解释。

*建立干净状态的条件均值解释。* 在附加假设 \(Z=Z_0+\sigma_0\epsilon_0\) 下，其中 \(Z_0\)、\(\epsilon_0\)、\(\epsilon\) 相互独立且 \(\epsilon_0\sim\mathcal N(0,I)\)，有

$$
Z_t=Z_0+\sigma_0\epsilon_0+\sqrt{\Delta_t}\epsilon.
$$

干净状态是平方可积的，因为 \(Z_0=Z-\sigma_0\epsilon_0\)。组合噪声为高斯、与 \(Z_0\) 独立，协方差为 \((\sigma_0^2+\Delta_t)I\)。因此对该观测模型应用 Tweedie 恒等式给出

$$
\mathbb E[Z_0\mid Z_t]=Z_t+\left(\sigma_0^2+\Delta_t\right)s_t^{\star}(Z_t).
$$

分数保持不变，因为 \(Z_t\) 的边缘分布仍为 \(p_t\)。取 \(\kappa_t=\sigma_0^2+\Delta_t\) 并利用式 (A.3)，可得

$$
\widehat Z^{\star}(Z_t,t)=\mathbb E[Z_0\mid Z_t].
$$

这证明了最后的陈述。干净状态分布与 \(p_t\) 都不要求为高斯。于是，最优 GDSM 预测等于输入加上缩放后的状态分数；在附加的高斯残差假设与匹配系数下，它与干净状态的条件均值一致。□

### A.2 定理 1 的证明

我们重述统计构造并给出定理中使用的常数。令 \(Z=Z_0+\sigma_0\epsilon_0\) 与 \(Z_t=Z+\sqrt{\Delta_t}\epsilon\)，其中 \(\sigma_0,\Delta_t>0\)，两个噪声均为标准高斯，且 \(Z_0,\epsilon_0,\epsilon\) 相互独立。假设 \(\mathbb E\|Z\|^2<\infty\)。在整个迭代与统计期望中，固定参考分布、平滑水平、归一化 \(\mathcal S(C)=(C-m)/s\)（\(s>0\)）与解析映射。所有陈述都以任意固定辅助输入为条件。

原始坐标下的干净状态为 \(A_0=\mathcal S^{-1}(Z_0)\)，其含噪输入为 \(Y=\mathcal S^{-1}(Z_t)\)。因此 \(A_0\) 与 \(Z_0\) 中的下标 0 表示不同坐标下的同一干净状态。定义后验均值估计器 \(\bar A(Y)=\mathbb E[A_0\mid Y]\)、它到输入的距离 \(a_t=\left(\mathbb E\|Y-\bar A(Y)\|^2\right)^{1/2}\)，以及匹配系数 \(\kappa_t=\sigma_0^2+\Delta_t\)。理想分数 \(s_t^{\star}=\nabla\log p_t\) 诱导原始坐标修正与先验映射

$$
d_t(C)=\kappa_t s\odot s_t^{\star}(\mathcal S(C)),\qquad
\mathcal C_\beta(C)=\mathcal T\left(C+\beta d_t(C)\right),\qquad \beta\in[0,1].
$$

这是式 (6) 取 \(T_k\equiv T\)、\(t_k\equiv t\)、\(\beta_k\equiv\beta\)、\(s_\theta(\cdot,t)=s_t^{\star}\) 的形式；\(\beta=0\) 关闭修正。矩阵被视为具有 Frobenius 内积的有限维 Hilbert 空间中的元素，\(\|\cdot\|_{\mathrm{op}}\) 表示诱导算子范数。

**定理 1（二次保真下的收敛性与误差改善）。** 在上述构造下，使用精确 ADMM，固定惩罚 \(\rho>0\) 与 \(f(A)=\frac12\langle A-Y,H(A-Y)\rangle\)，其中 \(H=H^*\succ0\) 固定。假设 \(d_t\) 是 \(L\)-Lipschitz 的且 \(\mathcal T\) 是 firmly nonexpansive 的。定义 \(r_H=\|(\rho I-H)(\rho I+H)^{-1}\|_{\mathrm{op}}\)。对任意满足

$$
r_H(1+2\beta L)<1\tag{A.4}
$$

的 \(\beta\in[0,1]\)，ADMM 迭代从任意有限初始化收敛，并有

$$
\left\|C_\beta^k-C_\beta^{\star}\right\|\le q_\beta^k\left\|C_\beta^0-C_\beta^{\star}\right\|,\qquad q_\beta=\frac12\left[1+r_H(1+2\beta L)\right]<1.\tag{A.5}
$$

记 \(A_\beta^{\star}=\lim_kA_\beta^k=\lim_kV_\beta^k\) 为原始极限。把 \(\beta=0\) 时的极限记为 \(A_{\mathrm{off}}^{\star}\)，以区分关闭修正的估计与干净状态 \(A_0\)。

对风险比较，额外假设对所有 \(Q\) 有 \(\|\mathcal T(Q)-Q\|\le b\)。置 \(M=\rho H^{-1}\)、\(b_H=\|M\|_{\mathrm{op}}b\)、\(\delta_\beta=\beta L\|M\|_{\mathrm{op}}\|I-H/\rho\|_{\mathrm{op}}\)。当 \(\delta_\beta<1\) 时，定义 \(c_\beta=\|I-\beta M\|_{\mathrm{op}}+\beta\|M\|_{\mathrm{op}}\delta_\beta/(1-\delta_\beta)\)。对 \(\beta>0\)，充分增益条件

$$
\delta_\beta<1,\qquad c_\beta a_t+\frac{b_H}{1-\delta_\beta}<a_t-b_H\tag{A.6}
$$

保证

$$
\mathbb E\left\|A_\beta^{\star}-A_0\right\|^2<\mathbb E\left\|A_{\mathrm{off}}^{\star}-A_0\right\|^2.
$$

两个求解器使用相同的数据项、解析映射与惩罚；只有分数修正发生变化。

**证明。** 证明分三部分。第一，我们识别理想分数提供的有用修正。第二，我们建立完整 ADMM 迭代的收敛性。第三，我们控制解析映射与 ADMM 反馈的影响，以比较极限重建风险。

*把理想分数修正与后验均值联系起来。* 在匹配系数下，引理 1 给出 \(\mathbb E[Z_0\mid Z_t]=Z_t+\kappa_t s_t^{\star}(Z_t)\)。由于 \(\mathcal S\) 固定、仿射且可逆，以 \(Y\) 为条件等价于以 \(Z_t\) 为条件。

这里 \(d_t(Y)=\kappa_t s\odot s_t^{\star}(\mathcal S(Y))\) 表示重缩放到原始坐标的理想分数修正，其中 \(s\) 表示固定归一化尺度。逆归一化乘以 \(s\) 并加上 \(m\)，因此归一化的“输入加分数”预测变为 \(Y+d_t(Y)\)。利用这一重缩放以及固定仿射映射与条件期望可交换的事实，我们得到

$$
\begin{aligned}
\bar A(Y)&=\mathbb E[A_0\mid Y]=\mathcal S^{-1}\left[\mathbb E[Z_0\mid Z_t]\right]\\
&=\mathcal S^{-1}\left[\mathcal S(Y)+\kappa_t s_t^{\star}(\mathcal S(Y))\right]\\
&=Y+\kappa_t s\odot s_t^{\star}(\mathcal S(Y))=Y+d_t(Y).
\end{aligned}\tag{A.7}
$$

因此 \(d_t(Y)=\bar A(Y)-Y\)：\(Y\) 处的理想修正指向后验均值，而后验均值最小化期望平方重建误差。代入该恒等式给出

$$
Y+\beta d_t(Y)=(1-\beta)Y+\beta\bar A(Y)=:M_\beta.\tag{A.8}
$$

矩假设使 \(A_0\)、\(Y\) 与 \(\bar A(Y)\) 平方可积，且 \(\mathbb E\|d_t(Y)\|^2=a_t^2\)。二次保真以同一个 \(Y\) 为中心，因此这里识别的修正与风险比较中使用的输入是校准一致的。

*建立 ADMM 收敛性。* 固定满足式 (A.4) 的 \(\beta\in[0,1]\)。为可读性，省略中间迭代上的下标 \(\beta\)。先验更新为

$$
V^{k+1}=\mathcal C_\beta(C^k)=\mathcal T\left(C^k+\beta d_t(C^k)\right).\tag{A.9}
$$

记 \(h=HY\)。精确数据更新的一阶条件为 \(HA-h+\rho(A-V^k+U^k)=0\)，由此得到

$$
A^{k+1}=(H+\rho I)^{-1}\left[h+\rho\left(V^k-U^k\right)\right].\tag{A.10}
$$

利用 \(C^k=A^{k+1}+U^k\) 与 \(U^{k+1}=C^k-V^{k+1}\)，下一次先验输入满足

$$
\begin{aligned}
C^{k+1}&=A^{k+2}+U^{k+1}\\
&=(H+\rho I)^{-1}\left[h+\rho V^{k+1}+HU^{k+1}\right]\\
&=(H+\rho I)^{-1}\left[h+HC^k+(\rho I-H)\mathcal C_\beta(C^k)\right]=:\mathcal F_\beta(C^k).
\end{aligned}\tag{A.11}
$$

为证明收敛性，我们证明完整 ADMM 映射 \(\mathcal F_\beta\) 压缩输入之间的距离。我们使用反射算子表示（Ryu et al., 2019）来利用 \(\mathcal T\) 的 firmly nonexpansive 性质：其反射 \(2\mathcal T-I\) 是非扩张的，这使我们能够界定所加分数修正的影响。定义 \(R(v)=2(H+\rho I)^{-1}(h+\rho v)-v\) 与 \(R_\beta=2\mathcal C_\beta-I\) 分别为数据更新与先验更新的反射。代入可得

$$
\begin{aligned}
\frac12\left[C+R\left(R_\beta(C)\right)\right]&=(H+\rho I)^{-1}\left[h+\rho R_\beta(C)\right]+\frac12\left[C-R_\beta(C)\right]\\
&=(H+\rho I)^{-1}\left[h+\rho\left(2\mathcal C_\beta(C)-C\right)\right]+C-\mathcal C_\beta(C)\\
&=(H+\rho I)^{-1}\left[h+HC+(\rho I-H)\mathcal C_\beta(C)\right]=\mathcal F_\beta(C).
\end{aligned}
$$

因此式 (A.11) 有等价表示

$$
\mathcal F_\beta=\frac12\left(I+R\circ R_\beta\right),\qquad R(v)=(\rho I-H)(\rho I+H)^{-1}v+2(H+\rho I)^{-1}h.\tag{A.12}
$$

我们现在分别界定 \(R\) 与 \(R_\beta\) 的变化，以确立 \(\mathcal F_\beta\) 的压缩性。\(H\) 的正定性蕴含

$$
\mathrm{Lip}(R)=r_H=\max_j\left|\frac{\rho-\lambda_j(H)}{\rho+\lambda_j(H)}\right|<1.
$$

\(\mathcal T\) 的 firmly nonexpansiveness 意味着 \(\|\mathcal T(x)-\mathcal T(y)\|^2\le\langle\mathcal T(x)-\mathcal T(y),x-y\rangle\)，因此其反射 \(R_{\mathcal T}=2\mathcal T-I\) 是非扩张的。利用 \(\mathcal C_\beta(C)=\mathcal T(C+\beta d_t(C))\) 并对修正后的输入加减同一个量，可得

$$
\begin{aligned}
R_\beta(C)&=2\mathcal C_\beta(C)-C=2\mathcal T\left(C+\beta d_t(C)\right)-C\\
&=\left[2\mathcal T\left(C+\beta d_t(C)\right)-\left(C+\beta d_t(C)\right)\right]+\beta d_t(C)\\
&=R_{\mathcal T}\left(C+\beta d_t(C)\right)+\beta d_t(C).
\end{aligned}\tag{A.13}
$$

对任意两个输入 \(C,C'\)，由三角不等式与 \(R_{\mathcal T}\) 的非扩张性可得

$$
\begin{aligned}
\left\|R_\beta(C)-R_\beta(C')\right\|&\le\left\|R_{\mathcal T}\left(C+\beta d_t(C)\right)-R_{\mathcal T}\left(C'+\beta d_t(C')\right)\right\|+\beta\left\|d_t(C)-d_t(C')\right\|\\
&\le\left\|\left(C-C'\right)+\beta\left(d_t(C)-d_t(C')\right)\right\|+\beta\left\|d_t(C)-d_t(C')\right\|\\
&\le\left\|C-C'\right\|+2\beta\left\|d_t(C)-d_t(C')\right\|\\
&\le(1+2\beta L)\left\|C-C'\right\|.
\end{aligned}\tag{A.14}
$$

最后一个不等式利用了 \(d_t\) 的 \(L\)-Lipschitz 性质。因此 \(\mathrm{Lip}(R_\beta)\le1+2\beta L\)。把该界与式 (A.12) 中的 \(\mathrm{Lip}(R)=r_H\) 结合，得到

$$
\begin{aligned}
\left\|\mathcal F_\beta(C)-\mathcal F_\beta(C')\right\|&=\frac12\left\|\left(C-C'\right)+R\left(R_\beta(C)\right)-R\left(R_\beta(C')\right)\right\|\\
&\le\frac12\left\|C-C'\right\|+\frac12\left\|R\left(R_\beta(C)\right)-R\left(R_\beta(C')\right)\right\|\\
&\le\frac12\left\|C-C'\right\|+\frac{r_H}{2}\left\|R_\beta(C)-R_\beta(C')\right\|\\
&\le\frac12\left\|C-C'\right\|+\frac{r_H}{2}(1+2\beta L)\left\|C-C'\right\|\\
&=\frac12\left[1+r_H(1+2\beta L)\right]\left\|C-C'\right\|=q_\beta\left\|C-C'\right\|.
\end{aligned}\tag{A.15}
$$

各不等式依次使用三角不等式、\(R\) 的界与式 (A.14)。由于 \(q_\beta<1\)，压缩映射原理给出唯一不动点 \(C_\beta^{\star}\) 以及式 (A.5) 中的线性收敛界。由 \(\mathcal C_\beta\) 与 ADMM 更新的连续性可得 \(A^k,V^k\to A_\beta^{\star}\) 且 \(U^k\to C_\beta^{\star}-A_\beta^{\star}\)，并有

$$
A_\beta^{\star}=\mathcal C_\beta\left(C_\beta^{\star}\right),\qquad \rho C_\beta^{\star}=h+(\rho I-H)A_\beta^{\star}.\tag{A.16}
$$

这也覆盖 \(\beta=0\) 的情形，此时 \(q_0=(1+r_H)/2<1\)。

*比较极限重建风险。* 第 2 部分建立了极限估计。我们现在以后验均值 \(\bar A(Y)=\mathbb E[A_0\mid Y]\) 作为共同参考，比较它们的期望重建误差。对任意平方可积估计器 \(\widehat A(Y)\)，展开 \(\widehat A(Y)-A_0=(\widehat A(Y)-\bar A(Y))+(\bar A(Y)-A_0)\) 给出

$$
\mathbb E\left\|\widehat A(Y)-A_0\right\|^2=R_{\mathrm{MMSE}}+\mathbb E\left\|\widehat A(Y)-\bar A(Y)\right\|^2,\qquad R_{\mathrm{MMSE}}=\mathbb E\left\|\bar A(Y)-A_0\right\|^2.\tag{A.17}
$$

交叉项消失，因为 \(\mathbb E[\bar A(Y)-A_0\mid Y]=0\)。两个 ADMM 极限都是 \(Y\) 的可测函数，因为它们可以从固定初始化出发、迭代固定的连续映射得到。它们的平方可积性将在下文验证。借助这一性质，对两个估计分别应用式 (A.17) 会消去共同的 \(R_{\mathrm{MMSE}}\)，得到

$$
\mathbb E\left\|A_{\mathrm{off}}^{\star}-A_0\right\|^2-\mathbb E\left\|A_\beta^{\star}-A_0\right\|^2=\mathbb E\left\|A_{\mathrm{off}}^{\star}-\bar A(Y)\right\|^2-\mathbb E\left\|A_\beta^{\star}-\bar A(Y)\right\|^2.\tag{A.18}
$$

因此，我们的目标是使右侧的差严格为正。我们为其第一个期望导出下界、为第二个期望导出上界，然后利用增益条件比较它们。对中间估计，记 \(\|X\|_{L^2}:=(\mathbb E\|X\|^2)^{1/2}\)，于是 \(a_t=\|Y-\bar A(Y)\|_{L^2}\)。我们先用三角不等式界定这些均方根距离，再对界平方以比较期望。

我们从关闭修正的估计开始。为了确定它能离开 \(Y\) 多远，我们利用第 2 部分的不动点方程表示输出位移。令 \(B=I-H/\rho\)。由于 \(h=HY\)，式 (A.16) 对任一求解器给出

$$
C_\beta^{\star}-Y=B\left(A_\beta^{\star}-Y\right).\tag{A.19}
$$

定义解析映射在其实际输入处的位移为

$$
e_\beta=\mathcal T\left(C_\beta^{\star}+\beta d_t\left(C_\beta^{\star}\right)\right)-\left(C_\beta^{\star}+\beta d_t\left(C_\beta^{\star}\right)\right),\qquad \|e_\beta\|\le b.
$$

先验不动点方程给出 \(A_\beta^{\star}-C_\beta^{\star}=\beta d_t(C_\beta^{\star})+e_\beta\)，而式 (A.19) 给出 \(A_\beta^{\star}-C_\beta^{\star}=(H/\rho)(A_\beta^{\star}-Y)\)。结合这两个恒等式得到

$$
A_\beta^{\star}-Y=M\left[\beta d_t\left(C_\beta^{\star}\right)+e_\beta\right],\qquad M=\rho H^{-1}.\tag{A.20}
$$

令 \(\beta=0\) 给出 \(A_{\mathrm{off}}^{\star}-Y=Me_{\mathrm{off}}\)，其中 \(e_{\mathrm{off}}\) 是对应的解析映射位移。因此 \(\|A_{\mathrm{off}}^{\star}-Y\|\le b_H\)，这也使 \(A_{\mathrm{off}}^{\star}\) 平方可积，因为 \(Y\) 平方可积。反向三角不等式现在给出

$$
\begin{aligned}
\left\|A_{\mathrm{off}}^{\star}-\bar A(Y)\right\|_{L^2}&\ge\left\|Y-\bar A(Y)\right\|_{L^2}-\left\|A_{\mathrm{off}}^{\star}-Y\right\|_{L^2}\\
&\ge a_t-b_H.
\end{aligned}\tag{A.21}
$$

增益条件保证 \(a_t>b_H\)，因此对该非负下界平方得到 \(\mathbb E\|A_{\mathrm{off}}^{\star}-\bar A(Y)\|^2\ge(a_t-b_H)^2\)。这就是式 (A.18) 中第一个期望所需的下界。

其次，我们寻求修正估计到后验均值距离的上界。第 1 部分识别出 \(d_t(Y)=\bar A(Y)-Y\)，但在收敛时 ADMM 把分数修正施加到 \(C_\beta^{\star}\)，它一般不同于 \(Y\)。在式 (A.20) 中加减 \(\beta Md_t(Y)\) 可把校准的分数贡献与其余效应分开：

$$
A_\beta^{\star}-Y=\beta Md_t(Y)+\xi_\beta,\qquad \xi_\beta=\beta M\left[d_t\left(C_\beta^{\star}\right)-d_t(Y)\right]+Me_\beta.
$$

代入第 1 部分的恒等式给出

$$
A_\beta^{\star}-\bar A(Y)=(I-\beta M)\left(Y-\bar A(Y)\right)+\xi_\beta.
$$

第一项描述校准的分数贡献如何改变原始差异。余项 \(\xi_\beta\) 包含由 ADMM 输入偏移引起的分数修正变化，以及由解析映射引起的位移。界定该余项将给出所需的上界。

对 \(\beta>0\)，置 \(D_\beta=A_\beta^{\star}-Y\)。为控制余项，我们首先通过把 \(Y\) 处的修正与 ADMM 输入引起的变化分开，来界定该输出位移。从式 (A.20) 出发，逐点得到

$$
\begin{aligned}
\left\|D_\beta\right\|&=\left\|M\left[\beta d_t\left(C_\beta^{\star}\right)+e_\beta\right]\right\|\\
&\le\beta\|M\|_{\mathrm{op}}\left\|d_t\left(C_\beta^{\star}\right)\right\|+\|M\|_{\mathrm{op}}\left\|e_\beta\right\|\\
&\le\beta\|M\|_{\mathrm{op}}\left(\left\|d_t(Y)\right\|+\left\|d_t\left(C_\beta^{\star}\right)-d_t(Y)\right\|\right)+b_H\\
&\le\beta\|M\|_{\mathrm{op}}\left(\left\|d_t(Y)\right\|+L\left\|C_\beta^{\star}-Y\right\|\right)+b_H\\
&\le\beta\|M\|_{\mathrm{op}}\left(\left\|d_t(Y)\right\|+L\|B\|_{\mathrm{op}}\left\|D_\beta\right\|\right)+b_H\\
&=\beta\|M\|_{\mathrm{op}}\left\|d_t(Y)\right\|+\delta_\beta\left\|D_\beta\right\|+b_H.
\end{aligned}
$$

第一个不等式使用算子范数界与三角不等式。第二个不等式加减 \(d_t(Y)\) 并使用 \(\|e_\beta\|\le b\) 与 \(b_H=\|M\|_{\mathrm{op}}b\)。接下来两个不等式分别使用 \(d_t\) 的 \(L\)-Lipschitz 性质与恒等式 \(C_\beta^{\star}-Y=BD_\beta\)。最后的等式使用 \(\delta_\beta=\beta L\|M\|_{\mathrm{op}}\|B\|_{\mathrm{op}}\)。

由于 \(\delta_\beta<1\)，右侧含 \(D_\beta\) 的项可以移到左侧，从而用平方可积随机变量界定 \(D_\beta\)。取 \(L^2\) 范数并利用 \(\|d_t(Y)\|_{L^2}=a_t\)，得到

$$
\left\|D_\beta\right\|_{L^2}\le\frac{\beta\|M\|_{\mathrm{op}}a_t+b_H}{1-\delta_\beta}.\tag{A.22}
$$

这证明了 \(A_\beta^{\star}\) 的平方可积性，并完成了对式 (A.18) 的论证。同样的 Lipschitz 估计把余项界定为

$$
\begin{aligned}
\left\|\xi_\beta\right\|_{L^2}&\le\delta_\beta\left\|D_\beta\right\|_{L^2}+b_H\\
&\le\frac{\beta\|M\|_{\mathrm{op}}\delta_\beta}{1-\delta_\beta}a_t+\frac{b_H}{1-\delta_\beta}.
\end{aligned}\tag{A.23}
$$

我们现在利用分解 \(A_\beta^{\star}-\bar A(Y)=(I-\beta M)(Y-\bar A(Y))+\xi_\beta\)，把余项界转化为对修正估计到后验均值距离的界。逐步展开可得

$$
\begin{aligned}
\left\|A_\beta^{\star}-\bar A(Y)\right\|_{L^2}&=\left\|(I-\beta M)\left(Y-\bar A(Y)\right)+\xi_\beta\right\|_{L^2}\\
&\le\left\|(I-\beta M)\left(Y-\bar A(Y)\right)\right\|_{L^2}+\left\|\xi_\beta\right\|_{L^2}\\
&\le\|I-\beta M\|_{\mathrm{op}}\left\|Y-\bar A(Y)\right\|_{L^2}+\left\|\xi_\beta\right\|_{L^2}\\
&=\|I-\beta M\|_{\mathrm{op}}a_t+\left\|\xi_\beta\right\|_{L^2}\\
&\le\|I-\beta M\|_{\mathrm{op}}a_t+\frac{\beta\|M\|_{\mathrm{op}}\delta_\beta}{1-\delta_\beta}a_t+\frac{b_H}{1-\delta_\beta}\\
&=\left(\|I-\beta M\|_{\mathrm{op}}+\frac{\beta\|M\|_{\mathrm{op}}\delta_\beta}{1-\delta_\beta}\right)a_t+\frac{b_H}{1-\delta_\beta}\\
&=c_\beta a_t+\frac{b_H}{1-\delta_\beta}.
\end{aligned}\tag{A.24}
$$

我们现在把两个界代入开头陈述的风险差。式 (A.6) 中的增益条件保证 \(a_t-b_H>c_\beta a_t+b_H/(1-\delta_\beta)\ge0\)，因此平方下界严格大于平方上界。于是

$$
\begin{aligned}
\mathbb E\left\|A_{\mathrm{off}}^{\star}-A_0\right\|^2-\mathbb E\left\|A_\beta^{\star}-A_0\right\|^2&=\mathbb E\left\|A_{\mathrm{off}}^{\star}-\bar A(Y)\right\|^2-\mathbb E\left\|A_\beta^{\star}-\bar A(Y)\right\|^2\\
&\ge\left(a_t-b_H\right)^2-\left(c_\beta a_t+\frac{b_H}{1-\delta_\beta}\right)^2>0.
\end{aligned}\tag{A.25}
$$

这证明了式 (8)：在所述增益条件下，修正后的极限在均方意义下更接近后验均值，因此具有严格更低的期望重建误差。结合第 2 部分，这就建立了收敛性以及相对同一求解器在关闭分数修正时的误差改善。□

## 附录 B 实现细节

### B.1 任务表述与解析 ADMM

三个任务都遵循式 (2) 的 ADMM 表述，使用共同的去噪器输入 \(C^k=A^{k+1}+U^k\) 与任务特定的观测模型和解析先验更新。下面详述这些组成部分及其实现。对匹配比较，我们关闭学习修正，同时保持数据更新、解析先验与后处理固定。

**参考引导 HSI 复原。** 我们把高光谱图像表示为 \(A=EB+\mu\)，其中 \(B\) 包含光谱系数，光谱基 \(E\) 与均值 \(\mu\) 由观测估计并保持固定。令 \(\mathcal H\) 表示空间模糊与下采样，并令 \(R_{\mathrm{PAN}}\) 表示 PAN 光谱响应。数据保真项把与低分辨率 HSI 的一致性以及与 PAN 图像的一致性结合起来：

$$
f(A)=\frac12\left\|\mathcal H(A)-Y_{\mathrm{LR}}\right\|_{Q(W)}^2+\frac12\left\|R_{\mathrm{PAN}}(A)-Y_{\mathrm{PAN}}\right\|_2^2,\tag{B.1}
$$

其中 \(\|r\|_{Q(W)}^2=\langle r,Q(W)r\rangle\)，而 \(Q(W)\) 纳入观测导出的可靠度权重。我们在系数坐标下实现解析 ADMM 求解器，使用辅助变量 \(V_B\) 与缩放对偶变量 \(U_B\)：

$$
\begin{aligned}
B^{k+1}&=\arg\min_B\;f(EB+\mu)+\frac{\rho}{2}\left\|B-V_B^k+U_B^k\right\|_F^2,\\
C_B^k&=B^{k+1}+U_B^k,\qquad V_B^{k+1}=\mathcal T_\tau\left(C_B^k\right),\qquad U_B^{k+1}=U_B^k+B^{k+1}-V_B^{k+1}.
\end{aligned}\tag{B.2}
$$

数据更新是二次子问题，用预条件共轭梯度求解。解析映射 \(\mathcal T_\tau\) 应用局部奇异值软阈值，以促进系数块中的低秩结构。我们的学习修正按照正文定义的先验接口，在解析更新之前修改 \(C_B^k\)。

**单图 HSI 去噪。** 我们把高光谱图像表示为 \(A=EB\)，其中 \(E\) 是由含噪观测估计的固定标准正交光谱基，\(B\) 包含光谱系数。对混合噪声，我们额外引入稀疏分量 \(S\) 与列分量 \(L\)，后者沿图像高度保持常数。加权数据保真项为

$$
f(A;S,L)=\frac12\left\|W^{1/2}\odot(Y-A-S-L)\right\|_F^2,\tag{B.3}
$$

其中 \(Y\) 是含噪 HSI，\(W\) 包含观测导出的可靠度权重。高斯去噪置 \(S=L=0\)。我们初始化 \(V_B^0=E^\top Y\)、\(U_B^0=0\)、\(S^0=L^0=0\)。在系数更新期间保持噪声估计固定，解析 ADMM 步为

$$
\begin{aligned}
B^{k+1}&=\arg\min_B\;f(EB;S^k,L^k)+\frac{\rho}{2}\left\|B-V_B^k+U_B^k\right\|_F^2,\\
C_B^k&=B^{k+1}+U_B^k,\qquad V_B^{k+1}=\mathcal T_{\mathrm{HSI}}\left(C_B^k\right),\qquad U_B^{k+1}=U_B^k+B^{k+1}-V_B^{k+1}.
\end{aligned}\tag{B.4}
$$

系数数据更新通过在每个像素处求解一个正定线性系统得到。在 LocalSVT/TV 配置中，\(\mathcal T_{\mathrm{HSI}}\) 先应用局部奇异值软阈值，再应用有限步二阶全变分（TV）更新。DCT/TV 配置则使用联合变换稀疏与 TV 更新。对混合噪声，每次 ADMM 迭代之后使用残差 \(T^{k+1}=Y-EV_B^{k+1}\) 做稳健更新：列分量通过在检测到的列支撑上对 \(T^{k+1}-S^k\) 的高度方向中位数做软阈值来估计（在配置处做列中心化），稀疏分量更新为 \(S^{k+1}=\mathrm{soft}(T^{k+1}-L^{k+1},\tau_{\mathrm{imp}})\)，其中 soft 表示逐元素软阈值。这些噪声估计进入下一次系数数据更新。复原图像为 \(\widehat A=EV_B^K\)。我们的学习修正按照正文定义的接口，在解析先验更新之前修改 \(C_B^k\)。

**MRI 去噪。** 我们直接从含噪观测 \(Y\) 恢复幅度图像 \(A\)。缩放 Rician 数据保真项为

$$
f_R(A)=\sum_p\left[\frac12A_p^2-\widehat\sigma_n^2\log I_0\left(\frac{Y_pA_p}{\widehat\sigma_n^2}\right)\right],\qquad A\ge0,\tag{B.5}
$$

其中 \(p\) 索引像素，\(\widehat\sigma_n\) 是观测导出的噪声估计，\(I_0\) 是零阶第一类修正 Bessel 函数。与 \(A\) 无关的项被省略。对多线圈 M4Raw 幅度图像，该数据项作为似然替代。

我们初始化 \(V^0=Y\)、\(U^0=0\)。使用实现中非负数据步中心 \(b^k=\max(V^k-U^k,0)\)，解析 ADMM 更新为

$$
\begin{aligned}
A^{k+1}&=\arg\min_{A\ge0}\;f_R(A)+\frac{\rho}{2}\left\|A-b^k\right\|_F^2,\\
C^k&=A^{k+1}+U^k,\qquad V^{k+1}=\mathcal T_{\mathrm{MRI}}\left(C^k\right),\qquad U^{k+1}=U^k+A^{k+1}-V^{k+1}.
\end{aligned}\tag{B.6}
$$

数据子问题用不动点/MM 迭代近似求解。解析映射 \(\mathcal T_{\mathrm{MRI}}\) 结合二维 DCT 非直流系数的稀疏性与二阶全变分（TV），促进变换域稀疏与空间正则性。该联合先验更新用原始—对偶迭代近似计算。我们的学习修正按照正文定义的接口，在解析先验更新之前修改 \(C^k\)。

### B.2 网络架构与状态库构建

**修正网络。** 修正网络是一个浅层条件 U-Net，特征宽度为 48 与 96，含四个残差块与一对下采样—上采样。每个残差块使用 GroupNorm 与 SiLU 激活，并以扰动水平的 128 维嵌入为条件。输入拼接归一化状态、单通道引导以及三个标量条件图。最终卷积零初始化。状态通道数 \(r=6,12,1\) 分别对应参考引导 HSI 复原、单图 HSI 去噪与 MRI 去噪。HiPandas 使用观测到的 PAN 图像作为引导；HSI 去噪与 MRI 使用由各自含噪观测导出的引导。每个网络包含约 0.64–0.65M 可训练参数，架构与精确计数见表 4。双轨推理使用两个架构相同、权重独立的网络，参数量翻倍。

**表 4（原文 Table 4）：** 单个修正网络的架构。\(r\) 为状态通道数，\(H\times W\) 为输入空间尺寸。参数量包含全部可训练权重与偏置。

| 阶段 | 操作 | 输出尺寸 | 参数量 |
|---|---|---|---|
| 输入 | 状态、引导与条件图 | \((r+4)\times H\times W\) | – |
| 条件化 | MLP：129 → 128 → 128 | 128 | 33,152 |
| 输入投影 | 3×3 卷积 | \(48\times H\times W\) | \(432r+1,776\) |
| 编码块 1 | 残差块 | \(48\times H\times W\) | 47,952 |
| 下采样 | 4×4 卷积，步长 2 | \(96\times\frac H2\times\frac W2\) | 73,824 |
| 编码块 2 | 残差块 | \(96\times\frac H2\times\frac W2\) | 178,848 |
| 瓶颈 | 残差块 | \(96\times\frac H2\times\frac W2\) | 178,848 |
| 上采样 | 4×4 转置卷积，步长 2 | \(48\times H\times W\) | 73,776 |
| 跳跃连接 | 加编码块 1 输出 | \(48\times H\times W\) | – |
| 解码块 | 残差块 | \(48\times H\times W\) | 47,952 |
| 输出投影 | GroupNorm、SiLU、3×3 卷积 | \(r\times H\times W\) | \(433r+96\) |
| 合计：参考引导 HSI 复原（\(r=6\)） | | | **0.641M** |
| 合计：单图 HSI 去噪（\(r=12\)） | | | **0.647M** |
| 合计：MRI 去噪（\(r=1\)） | | | **0.637M** |

**训练状态。** 我们首先运行解析 ADMM 求解器，把其去噪器输入收集到状态库 \(\mathcal B_0\)。对单轨学习，修正网络直接在 \(\mathcal B_0\) 上训练。对双轨学习，我们首先在 \(\mathcal B_0\) 上训练结构网络并冻结其权重。然后运行启用了结构修正的 ADMM 以构建第二个状态库 \(\mathcal B_1\)，并在其上训练互补网络。该顺序过程使互补网络能够适应结构修正之后生成的状态。每个网络都在固定状态库上训练，不通过 ADMM 迭代反传；所有网络权重在最终推理期间固定。

**固定归一化。** 对每个状态库与通道，我们计算中位数中心 \(m_i\) 与尺度

$$
s_i=\max\left\{\frac{q_{0.99}-q_{0.01}}{2},10^{-4}\right\},\qquad \mathcal S_i(C)=(C-m_i)\oslash s_i.\tag{B.7}
$$

统计量在训练前固定，并在推理时复用。在双轨学习中，两个状态库可能具有不同的归一化统计量；因此各分支输出在投影之前会被恢复到原始系数尺度。

### B.3 自监督目标与优化

**分数回归。** 对归一化的状态库状态 \(Z\)，我们采样 \(\epsilon\sim\mathcal N(0,I)\) 并构造

$$
Z_t=Z+\sqrt{\Delta_t}\epsilon,\qquad \Delta_t=\nu^2\left(\sigma_t^2-1\right),\qquad \kappa_t=\nu^2\sigma_t^2,\tag{B.8}
$$

其中 \(\nu>0\) 控制人工扰动尺度，\(\sigma_t>1\) 指定其水平。我们训练预测修正 \(D_i(Z_t,t)=\kappa_t s_{\theta_i}(Z_t,t)\) 以匹配可观测目标 \(\kappa_t(Z-Z_t)/\Delta_t\)。在输出限幅与分支投影之前，回归目标为

$$
\mathcal L_{\mathrm{score},i}=\mathbb E\left[w_i(t)\left\|D_i(Z_t,t)-\kappa_t\Delta_t^{-1}(Z-Z_t)\right\|_F^2\right],\qquad w_i(t)=\left(N_i\gamma_i\sigma_t^2\right)^{-1}.\tag{B.9}
$$

这里 \(N_i\) 是每个训练样本的张量元素数，\(\gamma_i=0.01a_i^{-1}\) 纳入外部分数损失系数 \(a_i\)。当使用输出限幅或分支投影时，在计算平方误差之前对预测与目标施加相同的处理。

**辅助损失。** 当使用留出观测损失时，在构造状态库与引导时掩蔽一个固定集合 \(\Omega\)。这些位置处的原始含噪测量记为 \(Y_\Omega\)，用作训练目标。令 \(\widehat Y_{\Omega,i}=[\mathcal H(\widehat A_i)]_\Omega\) 表示相应的预测测量。对参考引导 HSI 复原，我们最小化其加权绝对差：

$$
\mathcal L_{\mathrm{held},i}=|\Omega|^{-1}\mathbb E\left[\left\|w_\Omega\odot\left(\widehat Y_{\Omega,i}-Y_\Omega\right)\right\|_1\right],\tag{B.10}
$$

其中 \(w_\Omega\) 包含观测可靠度权重。对 MRI，我们改为在同一批留出位置上平均式 (B.5) 中的缩放 Rician 差异。辅助目标为

$$
\mathcal L_{\mathrm{aux},i}=\mathcal L_{\mathrm{held},i}+\omega_{p,i}\mathcal L_{\mathrm{PAN},i}.\tag{B.11}
$$

PAN 项为 \(\mathcal L_{\mathrm{PAN},i}=\mathbb E\,\mathrm{mean}\left|R_{\mathrm{PAN}}(\widehat A_i)-Y_{\mathrm{PAN}}\right|\)，仅用于参考引导 HSI 复原。

**总目标。** 与正文一致，每个网络使用

$$
\mathcal L_i=\mathcal L_{\mathrm{score},i}+\lambda\mathcal L_{\mathrm{aux},i}\tag{B.12}
$$

训练。权重取决于任务与训练配置。

**优化。** HiPandas 与 MRI 使用 AdamW，学习率 \(10^{-4}\)、零权重衰减、批大小 4、梯度范数裁剪为 1、EMA 衰减 0.999。推理使用冻结的 EMA 权重。MRI 每个网络训练 5,000 次更新。

### B.4 投影器与推理设置

我们构造两个互补正交投影器来指定每个分支的修正子空间。结构投影器 \(P_s\) 选择与观测支撑的列干扰相关的方向，而 \(P_g\) 选择其正交补。在系数图的向量化下，令 \(Q\) 包含结构子空间的一组标准正交基。投影器定义为

$$
P_s=QQ^\top,\qquad P_g=I-P_s,\qquad Q^\top Q=I.\tag{B.13}
$$

它们满足 \(P_s+P_g=I\) 与 \(P_sP_g=0\)，因此其值域互补且相互正交。对 HSI 列伪影，结构子空间结合光谱支撑与沿图像高度的低频变化。对每个空间列 \(j\)，令 \(M_j\) 为指示检测到干扰支撑的光谱带的对角掩码。与 \(E^\top M_jE\) 的数值非零特征值相关联的特征向量，在光谱系数坐标中构成一组标准正交基 \(Q_j\)。我们把这些方向与前 \(q\) 个标准正交的高度方向 DCT 模态结合，为每一列独立构造结构子空间。该构造捕捉沿列恒定或缓慢变化的支撑图样。

两个网络都接收完整的 ADMM 去噪器输入。它们的修正被重缩放到原始系数坐标，并分别由 \(P_s\) 与 \(P_g\) 投影，然后进入解析先验更新。结构子空间也可能包含图像信号，因此网络学习所选方向内的修正。当可靠的结构支撑不可用时，我们取 \(P_s=0\) 与 \(P_g=I\)。

### B.5 数据集与实现细节

**参考引导 HSI 复原。** 我们使用 HiPandas（Xu et al., 2025）中的东营数据集¹。它包含 81 个样本、32 个光谱带。每个样本由含噪的 64×64×32 低分辨率 HSI 与 256×256 PAN 图像组成，目标 HSI 尺寸为 256×256×32。空间尺度因子为 4。高斯条件包括 G10 与 G30，以及具有带依赖、非独立同分布高斯噪声的 GNI。混合条件 Mix35、Mix55 与 Mix55-G30 以不同严重程度把高斯噪声与条纹、坏线干扰结合起来。对每种条件，全部 81 个含噪样本都向共享训练库贡献状态，所得网络或网络对在样本间共享。训练使用高分辨率状态坐标下的 64×64 裁剪，对应 16×16 的低分辨率观测区域。推理复原每个完整样本。干净高分辨率图像被排除在训练损失之外，仅用于参数选择与评估。指标按样本计算，再在全部 81 个样本上平均。

**单图 HSI 去噪。** 我们使用青浦²与雄安³，每个复原问题以一张含噪 HSI 作为输入。实验场景的空间尺寸为 1580×3750，青浦与雄安分别有 251 与 256 个光谱带。两个数据集都在高斯条件 G30/G50/G70 与混合条件 M30/M50/M70 下评估。混合条件把带依赖高斯噪声与条纹噪声、死线以及椒盐噪声结合起来。场景被划分为 256×256 空间块，在每个场景与噪声条件内共享的一个网络上独立复原。训练使用由含噪观测生成的求解器状态裁剪。

**MRI 去噪。** 我们使用 BrainWeb⁴与 M4Raw⁵评估仿真与采集噪声下的去噪。BrainWeb 提供 1 mm 空间分辨率的 T1、T2 与 PD 图像，原生轴位图像尺寸为 217×181 像素。我们使用官方 3%、5% 与 7% 噪声水平，共九种条件，每种条件评估 34 个切片，得到 306 个切片—条件对。对 M4Raw，我们评估全部 25 个测试受试者，其中包括用于参数选择的三个。每个受试者为 T1、T2 与 FLAIR 每个对比度提供 18 个 256×256 切片，总计 1,350 个切片。我们使用采集到的含噪图像，不额外加噪。参考为重复采集的平均，其中包含作为输入的那次重复，因此仍含噪声且与输入相关。

**HiPandas 参数。** 表 5 列出 HiPandas 参数。\(K\) 是外层 ADMM 迭代次数，\(\rho\) 是 ADMM 惩罚。\(\tau\) 是局部低秩先验的奇异值软阈值。\(d\) 是增益缩放前、归一化状态坐标下的逐分量修正上限。\(\beta_s\) 与 \(\beta_g\) 分别是结构与全空间/互补修正的名义增益。\(N_s\) 与 \(N_g\) 是相应网络的优化器更新次数；– 表示未使用该网络。高斯与 GNI 条件使用全空间推理，混合条件使用结构引导推理。

**表 5（原文 Table 5）：** HiPandas 求解器与修正参数。

| 条件 | \(K\) | \(\rho\) | \(\tau\) | \(d\) | \(\beta_s\) | \(\beta_g\) | \(N_s\) | \(N_g\) |
|---|---|---|---|---|---|---|---|---|
| G10 | 4 | 1 | 0.105 | 0.10 | 0 | 1 | – | 5000 |
| G30 | 8 | 8 | 0.105 | 0.10 | 0 | 1 | – | 5000 |
| GNI | 8 | 4 | 0.105 | 0.10 | 0 | 1 | – | 5000 |
| Mix35 | 8 | 8 | 0.070 | 0.10 | 0.75 | 1.25 | 10000 | 5000 |
| Mix55 | 8 | 4 | 0.070 | 0.10 | 0.75 | 1.25 | 5000 | 5000 |
| Mix55-G30 | 8 | 4 | 0.070 | 0.10 | 0.50 | 0.50 | 5000 | 5000 |

**HSI 去噪参数。** 表 6 列出青浦与雄安的参数，记号同上。高斯条件使用全空间推理，混合条件使用结构引导推理。

**表 6（原文 Table 6）：** HSI 去噪求解器与修正参数。

| 条件 | \(K\) | \(\rho\) | \(d\) | \(\beta_s\) | \(\beta_g\) | \(N_s\) | \(N_g\) |
|---|---|---|---|---|---|---|---|
| 青浦 G30 | 30 | 2 | 0.1 | 0 | 0.5 | – | 5000 |
| 青浦 G50 | 30 | 2 | 0.1 | 0 | 0.75 | – | 6000 |
| 青浦 G70 | 30 | 2 | 0.1 | 0 | 0.75 | – | 5000 |
| 青浦 M30 | 30 | 2 | 0.1 | 0.125 | 0.5 | 2000 | 2000 |
| 青浦 M50 | 30 | 2 | 0.1 | 0.375 | 0.75 | 3000 | 3000 |
| 青浦 M70 | 30 | 2 | 0.1 | 0.1875 | 0.75 | 2000 | 2000 |
| 雄安 G30 | 30 | 2 | 0.1 | 0 | 0.5 | – | 4000 |
| 雄安 G50 | 30 | 2 | 0.1 | 0 | 0.5 | – | 4000 |
| 雄安 G70 | 30 | 2 | 0.1 | 0 | 0.75 | – | 6000 |
| 雄安 M30 | 30 | 2 | 0.1 | 0.125 | 0.5 | 2000 | 2000 |
| 雄安 M50 | 30 | 2 | 0.1 | 0.75 | 0.75 | 2500 | 2500 |
| 雄安 M70 | 30 | 2 | 0.1 | 0.1875 | 0.75 | 2000 | 2000 |

**MRI 参数。** 表 7 与表 8 分别列出 BrainWeb 与 M4Raw 的参数。两个数据集都使用全空间推理。\(K\)、\(\rho\) 与 \(d\) 的含义同上；\(N_g\) 是全空间网络的优化器更新次数。\(c\) 与 \(a\) 分别是 DCT 稀疏性与 TGV 正则化的噪声缩放先验系数，\(J\) 是用于评估其联合近端映射的内层迭代次数。\(\gamma_\sigma\) 在求解器使用之前乘到估计噪声标准差上。\(\beta\) 是名义修正增益，\(\eta_k\) 是其随迭代变化的乘子，因此外迭代 \(k\in\{0,\ldots,K-1\}\) 处的实际增益为 \(\beta\eta_k\)。在表 8 中，箭头表示训练值后接推理值；单个数值表示两阶段共用。\(\mathbf 1_{\{k\ge10\}}\) 在 30 次迭代的最后 20 次中激活修正，\([x]_0^1=\min\{1,\max\{0,x\}\}\) 定义斜坡时间表。

**表 7（原文 Table 7）：** BrainWeb 求解器与修正参数。

| 条件 | \(K\) | \(\rho\) | \(c\) | \(a\) | \(J\) | \(\gamma_\sigma\) | \(d\) | \(\beta\) | \(N_g\) | \(\eta_k\) |
|---|---|---|---|---|---|---|---|---|---|---|
| T1，3% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.25 | 5000 | 1 |
| T1，5% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.50 | 5000 | 1 |
| T1，7% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.50 | 5000 | 1 |
| T2，3% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.25 | 5000 | 1 |
| T2，5% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.50 | 5000 | 1 |
| T2，7% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.75 | 5000 | 1 |
| PD，3% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.25 | 5000 | 1 |
| PD，5% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.50 | 5000 | 1 |
| PD，7% | 30 | 2 | 0.1875 | 0.20 | 20 | 1 | 0.10 | 0.75 | 5000 | 1 |

**表 8（原文 Table 8）：** M4Raw 求解器与修正参数。

| 对比度 | \(K\) | \(\rho\) | \(c\) | \(a\) | \(J\) | \(\gamma_\sigma\) | \(d\) | \(\beta\) | \(N_g\) | \(\eta_k\) |
|---|---|---|---|---|---|---|---|---|---|---|
| T1 | 30 | 2 | 0.03125 → 0.015625 | 0.350 → 0.175 | 20 | 1.25 | 0.20 | 1.00 | 5000 | \([(k-15)/15]_0^1\) |
| T2 | 30 | 2 | 0.09375 | 0.175 | 20 | 1.25 | 0.10 | 0.50 | 5000 | \(\mathbf 1_{\{k\ge10\}}\) |
| FLAIR | 30 | 2 | 0.125 | 0.050 | 20 | 1.25 | 0.10 | 0.50 | 5000 | 1 |

数据集链接（原文脚注）：¹ https://github.com/shuangxu96/Hipandas；² https://www.3sobs.cn/qingpu-hsi-dataset；³ https://doi.org/10.3974/geodb.2021.01.02.V1；⁴ https://brainweb.bic.mni.mcgill.ca/selection_normal.html；⁵ https://github.com/mylyu/M4Raw。

## 附录 C 附加实验结果

### C.1 理论分析的受控实验

**实验设置。** 我们使用 16×16、32×32 与 64×64 的高斯状态，其理想分数已知。归一化为恒等映射。对 \(d=m^2\)，干净协方差 \(\Sigma\) 为对角阵，其元素 0.2、0.5、1 与 2 以相同次数重复；独立高斯污染的总方差为 \(\kappa_t=0.5\)。数据保真为 \(\frac12\langle A-Y,H(A-Y)\rangle\)，其中 \(H\) 的特征值 0.25、0.5、2 与 4 在固定正交基中以相同次数重复，且 \(\rho=1\)。解析映射是在完整矩阵上的精确奇异值软阈值，阈值 \(\tau=\gamma a_t/\sqrt m\)，其中 \(a_t^2=\kappa_t^2\mathrm{tr}((\Sigma+\kappa_tI)^{-1})\)。因此 \(\gamma=b/a_t\) 度量相对解析先验强度。修正求解器与关闭修正的求解器共享观测、初始化、数据保真、先验与惩罚。

**收敛性与稳定性。** 在 \(\gamma=0.15\) 下，我们对来自两个不同初始化的 16 个观测运行原始 ADMM，并测量它们的先验输入轨迹之间的均方根距离（按其初始值归一化）。图 6(a)–(c) 比较跨维度的五个修正强度；在该设置下，更大的测试修正产生更快的衰减。对于该 Hessian，定理的充分收缩条件在 \(\beta<7/15\) 时成立。所测试的 \([0,1]\) 内更大的修正也收敛，说明该条件是保守的。面板 (d) 把扫描扩展到定理范围之外：\(\beta=4\) 与 8 产生增长的轨迹距离与原始残差，而 \(\beta=2\) 在记录的迭代中继续下降。仅充分条件失效并不意味着发散。

**图 6（原文 Fig. 6）：** 宽谱收敛性与稳定性。(a)–(c) 在 \(\gamma=0.15\) 下跨维度的原始 ADMM 轨迹。(d) 在 64×64 下附加的修正强度；\(\beta>1\) 位于定理范围之外。增长的发散运行在预设的数值安全阈值处停止。面板 (d) 使用更宽的坐标轴范围。

**重建误差。** 我们对每个维度评估 512 个独立测试矩阵，在所有参数设置间复用相同的干净信号与含噪观测。图 7 画出逐元素重建误差随 \(\gamma\) 的变化，\(\beta\in\{0,0.25,0.5,0.75,1\}\)。17 个评估的先验强度以 0.1 为增量覆盖 0 到 1.5，并额外包含 0.15。正文展示 64×64 情形，使用相同数据与修正强度。对每个设置，我们报告

$$
\widehat R_d(\beta,\gamma)=\frac{1}{Nd}\sum_{j=1}^{N}\left\|A_{\beta,j}^{\star}-A_{0,j}\right\|_F^2,\tag{C.1}
$$

其中 \(A_{\beta,j}^{\star}\) 在先验强度 \(\gamma\) 处计算，\(\beta=0\) 给出解析 ADMM。数值越低表示重建越好。误差曲线说明了解析正则化与分数修正之间的相互作用：更强的修正并非一致更好。所测试的非零修正强度位于充分风险改善区域之外，因此这些比较刻画的是被认证设置之外的经验性能。

最终风险用 ADMM 状态映射的 Anderson 加速计算，检查原始不动点与原始残差均低于 \(10^{-10}\)。选定的估计还与直接 ADMM 结果对照检查。所有收敛曲线使用原始 ADMM 迭代。

**图 7（原文 Fig. 7）：** 宽谱保真下的重建误差。每个面板固定状态维度；曲线越低表示复原越好。灰色曲线为解析 ADMM（\(\beta=0\)）。标记表示评估过的先验强度，连接线段为视觉引导，阴影显示在独立测试矩阵上计算的逐点 95% 区间。所有面板共享同一纵轴尺度。

### C.2 附加定量结果

**参考引导 HSI 复原。** 表 9 与表 10 分别报告 G10/G30/GNI 与混合条件，每种条件 81 个块。粗体与下划线条目表示每列中最好与次好的不同取值。

**表 9（原文 Table 9）：** 高斯/GNI 噪声下东营数据集上的参考引导 HSI 复原。

| 方法 | G10 PSNR↑ | G10 SSIM↑ | G10 SAM↓ | G10 ERGAS↓ | G30 PSNR↑ | G30 SSIM↑ | G30 SAM↓ | G30 ERGAS↓ | GNI PSNR↑ | GNI SSIM↑ | GNI SAM↓ | GNI ERGAS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PLRDiff + HIR-Diff | 34.52 | 0.8215 | 6.73 | 16.49 | 32.20 | 0.8115 | 8.96 | 20.36 | 31.01 | 0.7670 | 12.73 | 23.66 |
| PLRDiff + PWRCTV | 38.10 | 0.9445 | 5.42 | 12.22 | 33.43 | 0.9156 | 9.02 | 18.93 | 32.73 | 0.9082 | 12.05 | 21.31 |
| SwinIR + HIR-Diff | 33.88 | 0.8512 | 4.69 | 22.02 | 27.79 | 0.4978 | 10.21 | 33.18 | 27.18 | 0.4962 | 12.66 | 35.11 |
| SwinIR + PWRCTV | 31.66 | 0.7815 | 8.33 | 65.58 | 21.16 | 0.3662 | 29.96 | 422.81 | 22.62 | 0.4464 | 31.18 | 489.23 |
| R-PNN + HIR-Diff | 33.80 | 0.8068 | 6.22 | 17.49 | 29.10 | 0.6743 | 9.28 | 25.03 | 29.59 | 0.6866 | 10.90 | 25.12 |
| R-PNN + PWRCTV | 36.71 | 0.9240 | 5.01 | 13.53 | 29.58 | 0.6375 | 14.46 | 28.57 | 30.96 | 0.7174 | 15.31 | 29.07 |
| HIR-Diff + PLRDiff | 33.48 | 0.7606 | 8.77 | 42.15 | 27.52 | 0.5859 | 17.65 | 338.12 | 23.06 | 0.3942 | 31.89 | 467.35 |
| HIR-Diff + SwinIR | 36.23 | 0.8612 | 3.88 | 13.07 | 31.00 | 0.6963 | 7.59 | 21.15 | 30.03 | 0.6716 | 9.53 | 24.05 |
| HIR-Diff + R-PNN | 37.90 | 0.9390 | 4.12 | 11.52 | 34.82 | 0.9157 | 6.08 | 15.97 | 33.25 | 0.9048 | 8.04 | 18.57 |
| PWRCTV + PLRDiff | 38.52 | 0.9116 | 3.88 | 11.28 | 35.46 | 0.8691 | 5.97 | 30.24 | 34.41 | 0.8217 | 8.84 | 23.09 |
| PWRCTV + SwinIR | 37.50 | 0.9080 | 3.10 | 11.33 | 34.54 | 0.8638 | 5.12 | 15.96 | 34.60 | 0.8602 | 5.76 | 16.66 |
| UHiPandas | <u>40.54</u> | <u>0.9543</u> | <u>3.04</u> | <u>8.52</u> | <u>36.82</u> | <u>0.9261</u> | <u>4.66</u> | <u>12.34</u> | <u>37.35</u> | <u>0.9300</u> | <u>4.46</u> | <u>11.74</u> |
| S³-PnP（本文） | **41.91** | **0.9614** | **2.58** | **6.89** | **38.52** | **0.9428** | **3.97** | **10.57** | **38.84** | **0.9448** | **3.80** | **10.13** |

**表 10（原文 Table 10）：** 混合噪声下东营数据集上的参考引导 HSI 复原。

| 方法 | Mix35 PSNR↑ | Mix35 SSIM↑ | Mix35 SAM↓ | Mix35 ERGAS↓ | Mix55 PSNR↑ | Mix55 SSIM↑ | Mix55 SAM↓ | Mix55 ERGAS↓ | Mix55-G30 PSNR↑ | Mix55-G30 SSIM↑ | Mix55-G30 SAM↓ | Mix55-G30 ERGAS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PLRDiff + HIR-Diff | 30.90 | 0.7649 | 12.30 | 26.04 | 30.70 | 0.7687 | 13.35 | 35.69 | 31.63 | 0.7997 | 11.03 | 34.60 |
| PLRDiff + PWRCTV | 32.58 | 0.9079 | 11.79 | 23.82 | 32.13 | 0.9000 | 12.92 | 34.07 | 32.82 | 0.9059 | 10.94 | <u>33.24</u> |
| SwinIR + HIR-Diff | 27.88 | 0.5443 | 12.53 | 34.58 | 27.62 | 0.5328 | 13.47 | 43.14 | 28.20 | 0.5456 | 11.84 | 42.82 |
| SwinIR + PWRCTV | 25.43 | 0.5544 | 27.50 | 393.81 | 23.98 | 0.4886 | 29.39 | 662.34 | 22.44 | 0.4233 | 30.17 | 685.00 |
| R-PNN + HIR-Diff | 30.52 | 0.7378 | 10.72 | 25.12 | 29.48 | 0.7004 | 12.24 | 34.86 | 29.48 | 0.7036 | 11.36 | 34.20 |
| R-PNN + PWRCTV | 32.45 | 0.7877 | 13.26 | 26.32 | 30.43 | 0.7176 | 16.23 | 73.68 | 29.56 | 0.6762 | 15.72 | 67.29 |
| HIR-Diff + PLRDiff | 24.58 | 0.4578 | 28.15 | 196.77 | 23.94 | 0.4272 | 28.41 | 80.01 | 25.74 | 0.5280 | 22.85 | 338.78 |
| HIR-Diff + SwinIR | 30.13 | 0.6949 | 10.51 | 26.73 | 29.64 | 0.6803 | 11.85 | 37.69 | 29.51 | 0.6577 | 11.62 | 38.12 |
| HIR-Diff + R-PNN | 33.04 | 0.9030 | 9.29 | 21.81 | 32.67 | 0.8946 | 10.52 | <u>33.86</u> | 33.64 | 0.9007 | 9.44 | 33.35 |
| PWRCTV + PLRDiff | 35.00 | 0.8303 | 9.02 | 24.35 | 32.02 | 0.7559 | 15.44 | 234.17 | 31.27 | 0.7379 | 16.33 | 202.54 |
| PWRCTV + SwinIR | 35.65 | 0.8813 | 5.98 | 17.46 | 33.14 | 0.8249 | 11.64 | 219.03 | 32.60 | 0.8146 | 12.07 | 244.81 |
| UHiPandas | <u>38.65</u> | <u>0.9440</u> | <u>3.92</u> | <u>10.78</u> | <u>36.49</u> | <u>0.9223</u> | <u>8.67</u> | 43.82 | <u>36.37</u> | <u>0.9218</u> | <u>8.70</u> | 44.13 |
| S³-PnP（本文） | **39.24** | **0.9493** | **3.67** | **9.48** | **38.98** | **0.9469** | **3.81** | **9.86** | **36.91** | **0.9352** | **6.13** | **14.37** |

**单图 HSI 去噪。** 表 11–14 报告每个数据集六个条件，每个条件在 85 个块上平均。BM4D 指经过评估的 GPU 近似版本。

**表 11（原文 Table 11）：** 高斯噪声下青浦数据集上的单图 HSI 去噪。

| 方法 | G30 PSNR↑ | G30 SSIM↑ | G30 SAM↓ | G30 ERGAS↓ | G50 PSNR↑ | G50 SSIM↑ | G50 SAM↓ | G50 ERGAS↓ | G70 PSNR↑ | G70 SSIM↑ | G70 SAM↓ | G70 ERGAS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BM4D | 36.44 | 0.8936 | 2.60 | 6.72 | 33.64 | 0.8194 | 3.65 | 9.29 | 31.77 | 0.7511 | 4.58 | 11.54 |
| HLRTF | 40.70 | 0.9427 | 1.28 | 3.66 | 34.39 | 0.7927 | 2.81 | 8.10 | 29.74 | 0.5845 | 5.11 | 15.13 |
| RCTV | 33.03 | 0.7311 | 4.10 | 10.87 | 27.95 | 0.4866 | 7.36 | 19.66 | 24.79 | 0.3364 | 10.55 | 27.95 |
| DDS2M | 41.57 | 0.9645 | <u>1.12</u> | 3.49 | <u>39.87</u> | 0.9507 | 1.40 | 4.21 | 38.47 | 0.9361 | 1.68 | 4.95 |
| LRTFR | 38.73 | 0.9235 | 1.39 | 5.11 | 37.11 | 0.9000 | 1.78 | 6.22 | 35.89 | 0.8826 | 2.17 | 7.17 |
| HIR-Diff | 39.31 | 0.9260 | 1.49 | 4.42 | 38.84 | 0.9252 | 1.60 | 4.61 | 37.25 | 0.8958 | 1.95 | 5.51 |
| CF-INR | <u>42.29</u> | <u>0.9686</u> | 1.14 | <u>3.25</u> | 39.94 | <u>0.9535</u> | <u>1.37</u> | <u>4.05</u> | <u>38.73</u> | <u>0.9403</u> | <u>1.56</u> | <u>4.72</u> |
| S³-PnP（本文） | **42.60** | **0.9714** | **1.03** | **3.02** | **40.05** | **0.9558** | **1.35** | **4.09** | **38.77** | **0.9413** | **1.60** | **4.73** |

**表 12（原文 Table 12）：** 混合噪声下青浦数据集上的单图 HSI 去噪。

| 方法 | M30 PSNR↑ | M30 SSIM↑ | M30 SAM↓ | M30 ERGAS↓ | M50 PSNR↑ | M50 SSIM↑ | M50 SAM↓ | M50 ERGAS↓ | M70 PSNR↑ | M70 SSIM↑ | M70 SAM↓ | M70 ERGAS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BM4D | 22.54 | 0.3971 | 23.26 | 91.66 | 25.36 | 0.5140 | 15.60 | 61.07 | 25.77 | 0.5388 | 13.63 | 53.29 |
| HLRTF | 35.60 | 0.9123 | 27.83 | 115.44 | 30.84 | 0.8113 | 27.54 | 117.36 | 27.25 | 0.6595 | 27.70 | 121.07 |
| RCTV | 36.83 | 0.9183 | 3.88 | 11.74 | 33.64 | 0.8730 | 5.51 | 16.32 | 31.55 | 0.8311 | 7.07 | 20.32 |
| DDS2M | 29.88 | 0.8430 | 13.20 | 53.63 | 29.78 | 0.8552 | 13.12 | 53.49 | 29.70 | 0.8625 | 13.05 | 53.41 |
| LRTFR | 32.70 | 0.8733 | 27.13 | 112.10 | 30.62 | 0.8417 | 26.95 | 114.20 | 29.20 | 0.8176 | 26.94 | 117.34 |
| HIR-Diff | 29.17 | 0.8363 | 13.20 | 55.69 | 29.09 | 0.8295 | 13.21 | 55.69 | 28.91 | 0.8123 | 13.19 | 55.40 |
| CF-INR | <u>38.71</u> | <u>0.9596</u> | <u>1.82</u> | <u>5.95</u> | <u>35.53</u> | <u>0.9335</u> | <u>2.62</u> | <u>8.56</u> | <u>33.35</u> | <u>0.9086</u> | <u>3.42</u> | <u>10.99</u> |
| S³-PnP（本文） | **39.62** | **0.9648** | **1.56** | **4.35** | **37.51** | **0.9389** | **1.87** | **5.46** | **36.50** | **0.9261** | **2.24** | **6.21** |

**表 13（原文 Table 13）：** 高斯噪声下雄安数据集上的单图 HSI 去噪。

| 方法 | G30 PSNR↑ | G30 SSIM↑ | G30 SAM↓ | G30 ERGAS↓ | G50 PSNR↑ | G50 SSIM↑ | G50 SAM↓ | G50 ERGAS↓ | G70 PSNR↑ | G70 SSIM↑ | G70 SAM↓ | G70 ERGAS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BM4D | 35.02 | 0.8637 | 2.54 | 5.58 | 32.40 | 0.7786 | 3.49 | 7.57 | 30.66 | 0.7046 | 4.32 | 9.28 |
| HLRTF | <u>39.91</u> | <u>0.9502</u> | 1.25 | <u>3.29</u> | 34.77 | 0.8508 | 2.25 | 5.86 | 30.51 | 0.6857 | 3.84 | 9.86 |
| RCTV | 33.03 | 0.7797 | 3.48 | 7.65 | 27.97 | 0.5534 | 6.25 | 13.88 | 24.79 | 0.3981 | 9.01 | 20.04 |
| DDS2M | 39.75 | 0.9448 | <u>1.22</u> | 3.35 | <u>38.07</u> | <u>0.9250</u> | <u>1.47</u> | <u>4.02</u> | <u>36.61</u> | <u>0.9001</u> | <u>1.73</u> | <u>4.73</u> |
| LRTFR | 35.57 | 0.8309 | 1.61 | 5.70 | 34.18 | 0.7808 | 1.98 | 6.77 | 33.26 | 0.7510 | 2.31 | 7.54 |
| HIR-Diff | 36.40 | 0.8830 | 1.58 | 4.90 | 36.18 | 0.8840 | 1.73 | 4.98 | 35.22 | 0.8652 | 2.01 | 5.55 |
| CF-INR | 39.46 | 0.9446 | 1.47 | 3.50 | 37.67 | 0.9153 | 1.68 | 4.30 | 36.52 | 0.8903 | 1.85 | 4.94 |
| S³-PnP（本文） | **40.74** | **0.9632** | **1.13** | **2.88** | **38.66** | **0.9418** | **1.42** | **3.65** | **36.92** | **0.9161** | **1.69** | **4.49** |

**表 14（原文 Table 14）：** 混合噪声下雄安数据集上的单图 HSI 去噪。

| 方法 | M30 PSNR↑ | M30 SSIM↑ | M30 SAM↓ | M30 ERGAS↓ | M50 PSNR↑ | M50 SSIM↑ | M50 SAM↓ | M50 ERGAS↓ | M70 PSNR↑ | M70 SSIM↑ | M70 SAM↓ | M70 ERGAS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BM4D | 22.38 | 0.3987 | 18.29 | 43.57 | 24.96 | 0.5014 | 12.33 | 28.99 | 25.21 | 0.5095 | 10.85 | 25.93 |
| HLRTF | 33.61 | 0.8941 | 24.44 | 81.55 | 30.12 | 0.8326 | 24.06 | 81.94 | 27.70 | 0.7451 | 24.21 | 83.75 |
| RCTV | 34.86 | 0.8863 | 3.77 | 9.16 | 31.92 | 0.8267 | 5.28 | 12.47 | 30.00 | 0.7754 | 6.75 | 15.83 |
| DDS2M | 29.05 | 0.8231 | 10.05 | 26.26 | 28.93 | 0.8250 | 9.92 | 26.17 | 28.81 | 0.8212 | 9.81 | 26.11 |
| LRTFR | 29.98 | 0.7704 | 23.74 | 79.14 | 28.30 | 0.7195 | 23.51 | 80.07 | 27.23 | 0.6901 | 23.48 | 81.42 |
| HIR-Diff | 28.47 | 0.8351 | 9.83 | 27.49 | 28.41 | 0.8277 | 9.82 | 27.41 | 28.29 | 0.8129 | 9.80 | 27.21 |
| CF-INR | <u>36.43</u> | <u>0.9285</u> | <u>2.14</u> | <u>5.14</u> | <u>33.65</u> | <u>0.8762</u> | <u>2.95</u> | <u>7.30</u> | <u>31.82</u> | <u>0.8362</u> | <u>3.76</u> | <u>9.39</u> |
| S³-PnP（本文） | **38.00** | **0.9476** | **1.62** | **4.07** | **37.46** | **0.9306** | **1.82** | **4.40** | **35.21** | **0.9035** | **2.21** | **5.57** |

**MRI 去噪。** 表 15 报告九种 BrainWeb 对比度—噪声条件，每种在 34 个切片上平均。表 16 报告 M4Raw 三个对比度，在每名受试者 18 个切片平均后对 25 个受试者等权。M4Raw 上的 C2S 使用官方发布权重、在我们的基准上评估。对 BrainWeb，我们报告自己评估 C2S 的结果。DRDD 表示迁移官方 DRDD-AiO5 自然图像预训练权重。

**表 15（原文 Table 15）：** 九种对比度—噪声条件下 BrainWeb 上的 MRI 去噪。粗体为最优、下划线为次优。

**(a) T1**

| 方法 | T1 3% PSNR↑ | T1 3% SSIM↑ | T1 5% PSNR↑ | T1 5% SSIM↑ | T1 7% PSNR↑ | T1 7% SSIM↑ |
|---|---|---|---|---|---|---|
| Noise2Void | 35.41 | 0.9062 | 34.88 | 0.9425 | 32.97 | 0.8833 |
| Noise2Self | 33.17 | 0.7933 | 33.23 | <u>0.9600</u> | 30.81 | 0.7435 |
| Noisier2Noise | 37.49 | 0.9261 | 34.52 | 0.9049 | 31.90 | 0.7828 |
| R2R | 36.20 | 0.8040 | 34.83 | 0.8113 | 32.26 | 0.7534 |
| Noise2Score | 37.48 | 0.8741 | 32.83 | 0.7883 | 29.68 | 0.7370 |
| ZS-N2N | 35.38 | 0.7805 | 31.36 | 0.7240 | 28.70 | 0.6903 |
| C2S | 36.17 | <u>0.9301</u> | <u>34.90</u> | 0.8402 | <u>35.05</u> | <u>0.8866</u> |
| DRDD | <u>38.23</u> | 0.8314 | 33.85 | 0.7614 | 30.89 | 0.7282 |
| S³-PnP（本文） | **40.84** | **0.9824** | **37.97** | **0.9737** | **36.03** | **0.9636** |

**(b) T2**

| 方法 | T2 3% PSNR↑ | T2 3% SSIM↑ | T2 5% PSNR↑ | T2 5% SSIM↑ | T2 7% PSNR↑ | T2 7% SSIM↑ |
|---|---|---|---|---|---|---|
| Noise2Void | 29.46 | 0.8822 | 27.60 | 0.7965 | 26.03 | 0.7304 |
| Noise2Self | 30.26 | 0.8962 | 28.83 | 0.7829 | 28.72 | <u>0.8620</u> |
| Noisier2Noise | 32.35 | 0.8728 | 29.29 | 0.8076 | 26.79 | 0.7151 |
| R2R | 33.39 | 0.8196 | 31.10 | 0.8111 | 28.00 | 0.7279 |
| Noise2Score | 32.79 | 0.8268 | 28.42 | 0.7586 | 25.30 | 0.7098 |
| ZS-N2N | 30.89 | 0.7812 | 27.15 | 0.7243 | 24.45 | 0.6807 |
| C2S | <u>34.39</u> | <u>0.9386</u> | <u>31.85</u> | <u>0.8463</u> | <u>29.44</u> | 0.7749 |
| DRDD | 32.93 | 0.8093 | 28.83 | 0.7595 | 25.98 | 0.7270 |
| S³-PnP（本文） | **35.36** | **0.9545** | **32.46** | **0.9339** | **30.54** | **0.9234** |

**(c) PD**

| 方法 | PD 3% PSNR↑ | PD 3% SSIM↑ | PD 5% PSNR↑ | PD 5% SSIM↑ | PD 7% PSNR↑ | PD 7% SSIM↑ |
|---|---|---|---|---|---|---|
| Noise2Void | 31.46 | 0.8547 | 28.73 | 0.8176 | 28.71 | <u>0.8195</u> |
| Noise2Self | 30.23 | 0.8943 | 29.14 | 0.7758 | 28.93 | 0.7802 |
| Noisier2Noise | 33.32 | 0.8903 | 30.32 | 0.7897 | 28.00 | 0.7250 |
| R2R | 32.48 | 0.7798 | 30.15 | 0.7413 | 28.24 | 0.7063 |
| Noise2Score | 33.13 | 0.8207 | 28.59 | 0.7394 | 25.58 | 0.6932 |
| ZS-N2N | 31.62 | 0.7686 | 27.70 | 0.7011 | 25.05 | 0.6538 |
| C2S | <u>35.07</u> | <u>0.9174</u> | <u>33.14</u> | <u>0.8647</u> | <u>31.14</u> | 0.7904 |
| DRDD | 33.93 | 0.8157 | 29.42 | 0.7534 | 26.63 | 0.7148 |
| S³-PnP（本文） | **36.21** | **0.9334** | **33.53** | **0.9165** | **31.59** | **0.8966** |

**表 16（原文 Table 16）：** M4Raw 三个对比度上的 MRI 去噪。粗体为最优、下划线为次优。

| 方法 | T1 PSNR↑ | T1 SSIM↑ | T2 PSNR↑ | T2 SSIM↑ | FLAIR PSNR↑ | FLAIR SSIM↑ |
|---|---|---|---|---|---|---|
| Noise2Void | 31.24 | 0.8671 | 30.45 | 0.8392 | 30.80 | 0.8288 |
| Noise2Self | 29.10 | 0.8537 | 28.17 | 0.8095 | 28.94 | 0.8150 |
| Noisier2Noise | 31.18 | 0.8675 | 30.55 | 0.8435 | 31.17 | 0.8356 |
| R2R | 30.82 | 0.8552 | 30.48 | 0.8329 | 30.97 | 0.8187 |
| Noise2Score | 31.23 | 0.8444 | 30.48 | 0.8139 | 31.00 | 0.7975 |
| ZS-N2N | 31.66 | 0.8922 | 30.96 | 0.8729 | 31.89 | 0.8765 |
| C2S | <u>32.61</u> | <u>0.9152</u> | <u>32.30</u> | <u>0.8880</u> | **33.02** | 0.8792 |
| DRDD | 32.43 | 0.9108 | 31.44 | 0.8770 | 32.60 | <u>0.8797</u> |
| S³-PnP（本文） | **32.69** | **0.9165** | **32.31** | **0.8922** | <u>32.83</u> | **0.8906** |

### C.3 附加定性结果

所选示例在每一行内对所有方法使用相同的显示映射、缩放区域与残差尺度。左侧小图显示放大区域；右侧显示其绝对残差，颜色越亮表示误差越大。HSI 残差使用显示的 RGB 通道，BrainWeb 使用显示的强度，M4Raw 使用全精度强度。

**参考引导 HSI 复原。** 图 8 展示高斯与混合噪声示例；PAN 是引导，没有 HSI 残差。

**图 8（原文 Fig. 8）：** 东营数据集上的参考引导 HSI 复原：G30（上）与 Mix55（下）。

**单图 HSI 去噪。** 图 9 与图 10 展示来自两个数据集的示例。

**图 9（原文 Fig. 9）：** 青浦数据集上的单图 HSI 去噪：G30（上）与 G50（下）。

**图 10（原文 Fig. 10）：** 雄安数据集上的单图 HSI 去噪：G70（上）与 M70（下）。

**MRI 去噪。** 图 11 与图 12 展示解剖细节与残差。M4Raw 的参考为重复采集的平均，其中包含输入。

**图 11（原文 Fig. 11）：** BrainWeb 上的 MRI 去噪（T2，7% 噪声）。

**图 12（原文 Fig. 12）：** M4Raw 上的 MRI 去噪：T2、T2 与 FLAIR，自上而下。

---

**本页范围与校对状态：** 本页覆盖 arXiv:2610.18458v1 全文（31 页）——摘要、第 1–5 节全部正文与小节（§2、§3.1–3.2、§4.1–4.4）、引理 1、定理 1（正文版与附录 A.2 重述版）、算法 1–3、式 (1)–(12) 与 (A.1)–(A.25)、(B.1)–(B.13)、(C.1)、表 1–16（逐格转写）、图 1–12 图注、附录 A–C、AI 使用声明、参考文献 [1]–[46]（英文原条目，DOI 照原文）；许可：arXiv 预印本（公开可读）。**核对方式：** 用 pypdfium2（scale=1.6）渲染第 2–31 页中的 25 个关键页并逐页目视核对：p.2（图 1、贡献）、p.3–p.6（§2 末、式 (1)–(11)、定理 1、图 2、算法 1–3、§4.1）、p.7–p.8（表 1–3、图 3）、p.9–p.13（图 4–5、理论一致性、结论、参考文献起始）、p.14–p.19（附录 A.1/A.2 全部式 (A.1)–(A.25)）、p.20–p.25（附录 B.1–B.5 与表 4–8）、p.26–p.27（附录 C.1、式 (C.1)、图 6–7、表 9）、p.28–p.29（表 10–14）、p.30（表 15–16）；表 1–3 与表 15–16 另做 1.9×–2.2× 局部放大，核对粗体最优与下划线次优标记。**已知缺陷与核对说明：** ① 定理 1 的适用范围：原文明确该分析假设**匹配统计模型、理想分数、固定算子与正定二次保真**，并要求 \(r_H(1+2\beta L)<1\) 与式 (A.6) 的增益条件；所得误差改善是对**该理想化模型**的充分条件，不是实际求解器的普适结论（原文亦在 §4.4/附录 C.1 说明测试的非零修正强度位于充分风险改善区域之外）。上述假设与条件已按 PDF 渲染页逐字转写。② 正文定理 1 的 \(r_H=\max_j|(\rho-\lambda_j(H))/(\rho+\lambda_j(H))|\) 与附录 A.2 的 \(r_H=\|(\rho I-H)(\rho I+H)^{-1}\|_{\mathrm{op}}\) 是同一量的两种写法（对正定 \(H\) 等价），本页两处均照原文保留。③ 表 2 核对：青浦单图 HSI 去噪的高斯均值与混合均值 PSNR，S³-PnP 为 **40.47 / 37.88 dB**，CF-INR 为 **40.32 / 35.86 dB**，与 PDF 表 2 渲染页一致。④ 表 3 核对：M4Raw FLAIR PSNR 中 S³-PnP 为 32.83 dB，低于 C2S 的 33.02 dB（原文将 C2S 33.02 标为粗体最优、S³-PnP 32.83 标为下划线次优），本页照原样保留，未改写为该表最优；同表 FLAIR SSIM 的最优为 S³-PnP 0.8906（粗体）。⑤ 附录表 9–16 的粗体/下划线按原文“每列最优与次优**不同取值**”的规则逐列转写，并以渲染页抽检（表 9、15、16）；若个别列存在原文未标或并列情形，以原文标记为准。⑥ 表 1–2 与表 9–14 原为多条件分组的横向表头（G10/G30/GNI、G30/G50/G70、Mix35/Mix55/Mix55-G30、M30/M50/M70 等），本页把条件并入列名（如“G10 PSNR↑”）展平为单表，数值与分组对应关系不变；表 15 按原文拆为 (a) T1、(b) T2、(c) PD 三张子表。⑦ 图 1–12 均为位图；图注按原文翻译，未推测图中未标注的数值；图 2 的模块与箭头含义按图注与 §3.2 正文转写。⑧ 参考文献采用作者—年份制、原文未编号，本页按条目顺序编号 [1]–[46]；原文条目中的作者名拼写与 DOI 照录（含 “Noise2Void” 被抽取为 “Noise2V oid” 之类空格问题已按规范写法还原）。⑨ 公式 (A.1)–(A.3) 的推导中，原文在干净状态条件均值部分还有两处无编号显示式，本页以无编号显示块保留。⑩ 算法 1–3 按原文行号逐行转写（算法 3 第 9 行的注释在原文中另起一行的“Trained parameters remain fixed”，本页保留为第 9 行前的独立注释行）。逐句逐式终校未做；建议后续 QA 重点复核：式 (6) 的 \(\mathcal S^{-1}\) 与 \(s\) 缩放约定、式 (A.6) 中 \(b_H\) 与 \(c_\beta\) 的定义一致性、附录 B.4 投影器与 \(Q_j\) 的构造，以及表 1–3 与表 9–16 的粗体/下划线标记逐列核对。

---

**登记（2026-11-04）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
